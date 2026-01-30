from datetime import datetime
from models import db

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.String(50), primary_key=True)
    task_type = db.Column(db.String(20), nullable=False)
    intended_duration = db.Column(db.Integer, nullable=False)  # minutes
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    
    avg_alignment_score = db.Column(db.Float, default=0)
    avg_context_stability = db.Column(db.Float, default=0)
    total_drift_count = db.Column(db.Integer, default=0)
    
    time_aligned = db.Column(db.Integer, default=0)
    time_drift = db.Column(db.Integer, default=0)
    time_idle = db.Column(db.Integer, default=0)
    time_fatigue = db.Column(db.Integer, default=0)
    time_recovery = db.Column(db.Integer, default=0)
    
    windows = db.relationship('Window', backref='session', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_type': self.task_type,
            'intended_duration': self.intended_duration,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'avg_alignment_score': round(self.avg_alignment_score, 1),
            'avg_context_stability': round(self.avg_context_stability, 2),
            'total_drift_count': self.total_drift_count,
            'time_breakdown': {
                'aligned': self.time_aligned,
                'drift': self.time_drift,
                'idle': self.time_idle,
                'fatigue': self.time_fatigue,
                'recovery': self.time_recovery
            }
        }


class Window(db.Model):
    __tablename__ = 'windows'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(50), db.ForeignKey('sessions.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    active_tab_category = db.Column(db.String(20))
    interaction_count = db.Column(db.Integer, default=0)
    active_seconds = db.Column(db.Integer, default=0)
    idle_seconds = db.Column(db.Integer, default=0)
    tab_switch_count = db.Column(db.Integer, default=0)
    
    alignment_score = db.Column(db.Float, default=0)
    context_stability = db.Column(db.Float, default=0)
    engagement_density = db.Column(db.Float, default=0)
    cognitive_state = db.Column(db.String(20))
    
    def to_dict(self):
        return {
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'active_tab_category': self.active_tab_category,
            'interaction_count': self.interaction_count,
            'active_seconds': self.active_seconds,
            'idle_seconds': self.idle_seconds,
            'tab_switch_count': self.tab_switch_count,
            'alignment_score': round(self.alignment_score, 1),
            'context_stability': round(self.context_stability, 2),
            'engagement_density': round(self.engagement_density, 2),
            'cognitive_state': self.cognitive_state
        }