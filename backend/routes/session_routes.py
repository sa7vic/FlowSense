from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

from models import db
from models.session import Session, Window
from services.alignment_engine import AlignmentEngine
from services.genai_service import get_realtime_intervention

bp = Blueprint('session', __name__, url_prefix='/api')

engines = {}
last_intervention_time = {}


@bp.route('/session/start', methods=['POST'])
def start_session():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    task_type = data.get('task_type')
    duration = data.get('intended_duration_min')
    
    if not task_type or not duration:
        return jsonify({'error': 'task_type and intended_duration_min required'}), 400
    
    session_id = f"fs_{uuid.uuid4().hex[:12]}"
    
    session = Session(
        id=session_id,
        task_type=task_type,
        intended_duration=duration,
        start_time=datetime.utcnow()
    )
    
    db.session.add(session)
    db.session.commit()
    
    engines[session_id] = AlignmentEngine()
    
    return jsonify({
        'session_id': session_id,
        'task_type': task_type,
        'intended_duration': duration
    })


@bp.route('/session/<session_id>/window', methods=['POST'])
def process_window(session_id):
    session = Session.query.get(session_id)
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    ctx = data.get('active_tab_category', 'neutral')
    active = data.get('active_seconds', 0)
    idle = data.get('idle_seconds', 0)
    idle_ratio = idle / (active + idle) if (active + idle) > 0 else 0
    
    print(f"\n{'='*50}")
    print(f"[WINDOW] Session: {session_id}")
    print(f"  Context: {ctx} {'⚠️ DISTRACTION' if ctx == 'distraction' else ''}")
    print(f"  Interactions: {data.get('interaction_count', 0)}")
    print(f"  Active: {active}s | Idle: {idle}s (ratio: {idle_ratio:.2f})")
    print(f"  Tab switches: {data.get('tab_switch_count', 0)}")
    
    if session_id not in engines:
        engines[session_id] = AlignmentEngine()
    
    engine = engines[session_id]
    
    result = engine.process_window(session, data)
    
    window = Window(
        session_id=session_id,
        timestamp=datetime.utcnow(),
        active_tab_category=data.get('active_tab_category', 'neutral'),
        interaction_count=data.get('interaction_count', 0),
        active_seconds=data.get('active_seconds', 0),
        idle_seconds=data.get('idle_seconds', 0),
        tab_switch_count=data.get('tab_switch_count', 0),
        alignment_score=result['alignment_score'],
        context_stability=result['context_stability'],
        engagement_density=result['engagement_density'],
        cognitive_state=result['cognitive_state']
    )
    
    db.session.add(window)
    
    windows = Window.query.filter_by(session_id=session_id).all()
    window_count = len(windows) + 1
    
    session.avg_alignment_score = (
        (session.avg_alignment_score * (window_count - 1) + result['alignment_score']) 
        / window_count
    )
    session.avg_context_stability = (
        (session.avg_context_stability * (window_count - 1) + result['context_stability']) 
        / window_count
    )
    
    if result['cognitive_state'] == 'DRIFT':
        prev_window = windows[-1] if windows else None
        if not prev_window or prev_window.cognitive_state != 'DRIFT':
            session.total_drift_count += 1
    
    state = result['cognitive_state']
    if state == 'ALIGNED':
        session.time_aligned += 30
    elif state == 'DRIFT':
        session.time_drift += 30
    elif state == 'IDLE':
        session.time_idle += 30
    elif state == 'FATIGUE':
        session.time_fatigue += 30
    elif state == 'RECOVERY':
        session.time_recovery += 30
    
    db.session.commit()
    
    state_icons = {
        'ALIGNED': '✅',
        'DRIFT': '⚠️',
        'IDLE': '💤',
        'FATIGUE': '😴',
        'RECOVERY': '🔄'
    }
    icon = state_icons.get(result['cognitive_state'], '❓')
    print(f"  → {icon} State: {result['cognitive_state']} | Score: {result['alignment_score']:.1f}")
    print(f"{'='*50}")
    
    intervention = None
    should_intervene = _should_send_intervention(
        session_id,
        result['cognitive_state'],
        engine.window_history
    )
    
    if should_intervene:
        intervention = get_realtime_intervention(
            list(engine.window_history),
            result['cognitive_state'],
            session.task_type
        )
        if intervention:
            last_intervention_time[session_id] = datetime.utcnow()
    
    response = result.copy()
    if intervention:
        response['intervention'] = intervention
    
    return jsonify(response)


@bp.route('/session/<session_id>/end', methods=['POST'])
def end_session(session_id):
    session = Session.query.get(session_id)
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    session.end_time = datetime.utcnow()
    db.session.commit()
    
    if session_id in engines:
        del engines[session_id]
    
    return jsonify({
        'success': True,
        'session': session.to_dict()
    })


@bp.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    session = Session.query.get(session_id)
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    windows = Window.query.filter_by(session_id=session_id).order_by(Window.timestamp).all()
    
    return jsonify({
        'session': session.to_dict(),
        'windows': [w.to_dict() for w in windows]
    })


@bp.route('/sessions/recent', methods=['GET'])
def get_recent_sessions():
    limit = request.args.get('limit', type=int)
    
    query = Session.query.order_by(Session.start_time.desc())
    
    if limit:
        query = query.limit(limit)
    
    sessions = query.all()
    
    return jsonify({
        'sessions': [s.to_dict() for s in sessions],
        'total': len(sessions)
    })


@bp.route('/sessions/all', methods=['GET'])
def get_all_sessions():
    sessions = Session.query.order_by(
        Session.start_time.desc()
    ).all()
    
    return jsonify({
        'sessions': [s.to_dict() for s in sessions],
        'total': len(sessions)
    })


def _should_send_intervention(session_id, current_state, window_history):
    if len(window_history) < 3:
        return False
    
    if current_state not in ['DRIFT', 'FATIGUE']:
        return False
    
    if session_id in last_intervention_time:
        time_since_last = (
            datetime.utcnow() - last_intervention_time[session_id]
        ).total_seconds()
        
        if time_since_last < 180:
            return False
    
    recent_states = [w['cognitive_state'] for w in list(window_history)[-3:]]
    problematic_count = sum(
        1 for s in recent_states
        if s in ['DRIFT', 'FATIGUE']
    )
    
    return problematic_count >= 2
