from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

from models import db
from models.session import Session, Window
from services.genai_service import getAnalytics, get_multi_session_insights

bp = Blueprint('analysis', __name__, url_prefix='/api')


@bp.route('/analysis/<session_id>', methods=['GET'])
def analysis(session_id):
    session = Session.query.get(session_id)
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    windows = Window.query.filter_by(session_id=session_id).order_by(Window.timestamp).all()
    
    if not windows:
        return jsonify({'error': 'No data available for analysis'}), 400
    
    if len(windows) > 1:
        windows = windows[1:]
    
    analysis_data = {
        'session': session.to_dict(),
        'windows': [w.to_dict() for w in windows],
        'summary': {
            'total_windows': len(windows),
            'duration_minutes': (
                session.intended_duration
                if session.end_time is None
                else int((session.end_time - session.start_time).total_seconds() / 60)
            ),
            'cognitive_states': _count_states(windows)
        }
    }
    
    ai_analysis = getAnalytics(analysis_data)
    
    return jsonify({
        'session_id': session_id,
        'analysis': ai_analysis
    })


def _count_states(windows):
    states = {}
    for window in windows:
        state = window.cognitive_state
        states[state] = states.get(state, 0) + 1
    return states


@bp.route('/analysis/patterns', methods=['GET'])
def analyze_patterns():
    sessions = Session.query.order_by(
        Session.start_time.desc()
    ).limit(10).all()
    
    if len(sessions) < 2:
        return jsonify({
            'error': 'Need at least 2 sessions for pattern analysis'
        }), 400
    
    sessions_data = [s.to_dict() for s in sessions]
    
    insights = get_multi_session_insights(sessions_data)
    
    return jsonify({
        'analysis': insights,
        'sessions_analyzed': len(sessions)
    })
