import numpy as np
from collections import deque
from typing import Dict, List, Tuple

TASK_PROFILES = {
    'CODING': {
        'allowed_contexts': ['work'],
        'context_weights': {
            'work': 1.0, 'neutral': 0.2,
            'video': 0.1, 'distraction': 0.0
        },
        'expected_interaction_rate': {
            'mean': 1.5,
            'std': 0.3,
            'min': 0.8,
            'max': 3.5
        },
        'idle_profile': {
            'acceptable_idle': 15,
            'critical_idle': 90,
            'thinking_time_weight': 0.6
        },
        'tab_switch_tolerance': {
            'acceptable_per_window': 2,
            'excessive_threshold': 6
        },
        'focus_depth_required': 0.80
    },
    'VIDEO_LEARNING': {
        'allowed_contexts': ['video', 'work'],
        'context_weights': {
            'video': 1.0, 'work': 0.7,
            'neutral': 0.3, 'distraction': 0.0
        },
        'expected_interaction_rate': {
            'mean': 0.12,
            'std': 0.08,
            'min': 0.01,
            'max': 0.6
        },
        'idle_profile': {
            'acceptable_idle': 45,
            'critical_idle': 240,
            'thinking_time_weight': 0.85
        },
        'tab_switch_tolerance': {
            'acceptable_per_window': 1,
            'excessive_threshold': 4
        },
        'focus_depth_required': 0.70
    },
    'TYPING': {
        'allowed_contexts': ['work', 'neutral'],
        'context_weights': {
            'work': 1.0, 'neutral': 0.5,
            'video': 0.2, 'distraction': 0.0
        },
        'expected_interaction_rate': {
            'mean': 1.8,
            'std': 0.4,
            'min': 1.0,
            'max': 4.5
        },
        'idle_profile': {
            'acceptable_idle': 12,
            'critical_idle': 75,
            'thinking_time_weight': 0.5
        },
        'tab_switch_tolerance': {
            'acceptable_per_window': 3,
            'excessive_threshold': 8
        },
        'focus_depth_required': 0.75
    }
}

STATE_THRESHOLDS = {
    'ALIGNED': {
        'min_alignment_score': 65,
        'min_context_stability': 0.60,
        'max_idle_ratio': 0.30
    },
    'DRIFT': {
        'max_alignment_score': 50,
        'distraction_context_triggers': True,
        'min_consecutive_windows': 1
    },
    'IDLE': {
        'min_idle_ratio': 0.80,
        'min_idle_seconds': 22
    },
    'FATIGUE': {
        'min_decline_slope': -0.08,
        'min_windows_for_detection': 2,
        'engagement_drop_threshold': 0.20,
        'time_based_min_windows': 4
    },
    'RECOVERY': {
        'min_score': 51,
        'max_score': 64,
        'requires_previous_drift': True
    }
}

SIGNAL_PROCESSING = {
    'ewma_alpha': 0.3,
    'outlier_std_threshold': 2.5,
    'min_data_quality_score': 0.6
}


class AlignmentEngine:
    def __init__(self):
        self.window_history = deque(maxlen=10)
        self.engagement_baseline = None
        self.previous_state = None
        self.drift_start_time = None
        self.state_entry_time = {}
        self.smoothed_metrics = {}
        self.consecutive_drift_windows = 0
        self.consecutive_recovery_windows = 0
        
    def process_window(self, session, window_data: Dict) -> Dict:
        task_type = session.task_type
        profile = TASK_PROFILES.get(task_type, TASK_PROFILES['CODING'])

        context = window_data.get('active_tab_category', 'neutral')
        interaction_count = max(0, window_data.get('interaction_count', 0))
        active_seconds = max(1, window_data.get('active_seconds', 30))
        idle_seconds = max(0, window_data.get('idle_seconds', 0))
        tab_switches = max(0, window_data.get('tab_switch_count', 0))
        
        video_playing = window_data.get('video_playing', False)
        video_engagement = window_data.get('video_engagement', None)
        
        interaction_rate = interaction_count / active_seconds
        idle_ratio = idle_seconds / (active_seconds + idle_seconds)
        
        data_quality = self._assess_data_quality(
            active_seconds, idle_seconds, interaction_count
        )
        
        interaction_rate = self._smooth_metric(
            'interaction_rate',
            interaction_rate,
            profile['expected_interaction_rate']
        )
        
        context_alignment = self._compute_context_alignment(
            context, profile
        )
        
        interaction_alignment = self._compute_interaction_alignment(
            interaction_rate, profile
        )
        
        idle_alignment = self._compute_idle_alignment(
            idle_seconds, idle_ratio, profile
        )
        
        focus_stability = self._compute_focus_stability(
            tab_switches, profile
        )
        
        if task_type == 'VIDEO_LEARNING' and video_playing and context in ['video', 'work']:
            interaction_alignment = max(interaction_alignment, 0.95)
            idle_alignment = max(idle_alignment, 0.90)
            context_alignment = max(context_alignment, 0.95)
        
        ibd_components = {
            'context': (1 - context_alignment) * 0.40,
            'interaction': (1 - interaction_alignment) * 0.30,
            'idle': (1 - idle_alignment) * 0.20,
            'focus': (1 - focus_stability) * 0.10
        }
        ibd = sum(ibd_components.values())
        
        cai = 1 - ibd
        
        raw_score = cai * 100
        confidence_factor = data_quality * 0.5 + 0.5
        alignment_score = raw_score * confidence_factor
        alignment_score = np.clip(alignment_score, 0, 100)
        
        engagement_density = interaction_rate
        
        if self.engagement_baseline is None and len(self.window_history) >= 3:
            self._establish_baseline()
        
        cognitive_state, state_confidence = self._determine_cognitive_state(
            alignment_score=alignment_score,
            context=context,
            idle_seconds=idle_seconds,
            idle_ratio=idle_ratio,
            tab_switches=tab_switches,
            profile=profile,
            video_playing=video_playing,
            task_type=task_type
        )
        
        self.previous_state = cognitive_state
        
        window_record = {
            'timestamp': window_data.get('timestamp', 0),
            'context': context,
            'engagement_density': engagement_density,
            'alignment_score': alignment_score,
            'interaction_rate': interaction_rate,
            'interaction_count': interaction_count,
            'idle_ratio': idle_ratio,
            'idle_seconds': idle_seconds,
            'tab_switches': tab_switches,
            'data_quality': data_quality,
            'cognitive_state': cognitive_state,
            'video_playing': video_playing,
            'task_type': task_type
        }
        self.window_history.append(window_record)
        
        return {
            'alignment_score': round(alignment_score, 1),
            'cognitive_state': cognitive_state,
            'context_stability': round(focus_stability, 2),
            'engagement_density': round(engagement_density, 2),
            'ibd': round(ibd, 3),
            'confidence': round(state_confidence * data_quality, 2),
            'metrics': {
                'context_alignment': round(context_alignment, 2),
                'interaction_alignment': round(interaction_alignment, 2),
                'idle_alignment': round(idle_alignment, 2),
                'focus_stability': round(focus_stability, 2),
                'data_quality': round(data_quality, 2)
            }
        }

    def _assess_data_quality(self, active_seconds, idle_seconds, interaction_count):
        total_seconds = active_seconds + idle_seconds
        if total_seconds < 20:
            return 0.5
        
        quality = 1.0
        
        if interaction_count == 0 and active_seconds > 25:
            quality *= 0.7
        
        if interaction_count > active_seconds * 5:
            quality *= 0.8
        
        return quality
    
    def _smooth_metric(self, metric_name, current_value, expected_range):
        if metric_name not in self.smoothed_metrics:
            self.smoothed_metrics[metric_name] = current_value
            return current_value
        
        previous = self.smoothed_metrics[metric_name]
        
        mean = expected_range.get('mean', current_value)
        std = expected_range.get('std', 0.5)
        z_score = abs(current_value - mean) / (std + 0.01)
        
        alpha = SIGNAL_PROCESSING['ewma_alpha']
        if z_score > SIGNAL_PROCESSING['outlier_std_threshold']:
            alpha *= 0.5
        
        smoothed = alpha * current_value + (1 - alpha) * previous
        self.smoothed_metrics[metric_name] = smoothed
        
        return smoothed
    
    def _compute_context_alignment(self, context, profile):
        context_weights = profile.get('context_weights', {})
        return context_weights.get(context, 0.0)
    
    def _compute_interaction_alignment(self, interaction_rate, profile):
        expected = profile['expected_interaction_rate']
        mean = expected['mean']
        std = expected['std']
        min_rate = expected['min']
        max_rate = expected['max']
        
        if min_rate <= interaction_rate <= max_rate:
            distance = abs(interaction_rate - mean)
            alignment = np.exp(-(distance ** 2) / (2 * std ** 2))
            return max(0.7, alignment)
        
        if interaction_rate < min_rate:
            deviation = (min_rate - interaction_rate) / min_rate
        else:
            deviation = (interaction_rate - max_rate) / max_rate
        
        return max(0.0, 1.0 - deviation)
    
    def _compute_idle_alignment(self, idle_seconds, idle_ratio, profile):
        idle_profile = profile['idle_profile']
        acceptable = idle_profile['acceptable_idle']
        critical = idle_profile['critical_idle']
        thinking_weight = idle_profile['thinking_time_weight']
        
        if idle_seconds <= acceptable:
            return 1.0
        
        if idle_seconds <= critical:
            base_penalty = (
                (idle_seconds - acceptable) / (critical - acceptable)
            )
            return 1.0 - (base_penalty * (1 - thinking_weight))
        
        excess_ratio = min(idle_seconds / critical, 2.0)
        return max(0.0, 1.0 - excess_ratio * 0.5)
    
    def _compute_focus_stability(self, tab_switches, profile):
        tolerance = profile['tab_switch_tolerance']
        acceptable = tolerance['acceptable_per_window']
        excessive = tolerance['excessive_threshold']
        
        if tab_switches <= acceptable:
            return 1.0
        
        if tab_switches >= excessive:
            return 0.3
        
        ratio = (tab_switches - acceptable) / (excessive - acceptable)
        return 1.0 - (ratio * 0.7)
    
    def _establish_baseline(self):
        if len(self.window_history) < 3:
            return
        
        engagement_rates = [
            w['engagement_density'] for w in self.window_history
        ]
        self.engagement_baseline = np.median(engagement_rates)
    
    def _determine_cognitive_state(
        self,
        alignment_score,
        context,
        idle_seconds,
        idle_ratio,
        tab_switches,
        profile,
        video_playing=False,
        task_type=None
    ):
        if task_type == 'VIDEO_LEARNING' and video_playing and context in ['video', 'work']:
            self.consecutive_drift_windows = 0
            self.consecutive_recovery_windows = 0
            return 'ALIGNED', 0.95
        
        was_in_problematic_state = self.previous_state in ['DRIFT', 'FATIGUE']
        recovery_min = STATE_THRESHOLDS['RECOVERY']['min_score']
        
        if was_in_problematic_state and context != 'distraction':
            if alignment_score >= recovery_min and self.consecutive_recovery_windows < 2:
                self.consecutive_recovery_windows += 1
                return 'RECOVERY', 0.80
            elif alignment_score >= recovery_min:
                self.consecutive_recovery_windows = 0
                return 'ALIGNED', 0.85
        
        if context == 'distraction':
            self.consecutive_drift_windows += 1
            return 'DRIFT', 0.98
        
        if context in ['neutral', 'work', 'video']:
            is_video_learning_on_video = (task_type == 'VIDEO_LEARNING' and context == 'video')
            idle_threshold = STATE_THRESHOLDS['IDLE']['min_idle_seconds']
            idle_ratio_threshold = STATE_THRESHOLDS['IDLE']['min_idle_ratio']
            
            if is_video_learning_on_video:
                idle_threshold = 50
                idle_ratio_threshold = 0.90
            
            if idle_ratio >= idle_ratio_threshold and idle_seconds >= idle_threshold:
                self.consecutive_drift_windows = 0
                return 'IDLE', 0.90
        
        fatigue_detected, fatigue_confidence = self._detect_fatigue()
        if fatigue_detected:
            return 'FATIGUE', fatigue_confidence
        
        drift_threshold = STATE_THRESHOLDS['DRIFT']['max_alignment_score']
        if alignment_score <= drift_threshold:
            self.consecutive_drift_windows += 1
            return 'DRIFT', 0.85
        
        if self.previous_state == 'DRIFT':
            self.consecutive_drift_windows = 0
        if self.previous_state != 'RECOVERY':
            self.consecutive_recovery_windows = 0
        
        aligned_threshold = STATE_THRESHOLDS['ALIGNED']['min_alignment_score']
        if alignment_score >= aligned_threshold:
            return 'ALIGNED', 0.90
        
        if alignment_score > drift_threshold:
            return 'ALIGNED', 0.70
        
        return self.previous_state or 'ALIGNED', 0.60

    def _detect_fatigue(self):
        min_windows = STATE_THRESHOLDS['FATIGUE']['min_windows_for_detection']
        
        if len(self.window_history) < min_windows:
            return False, 0.0
        
        all_windows = list(self.window_history)
        recent_windows = all_windows[-min_windows:]
        
        for w in recent_windows:
            if (
                w.get('task_type') == 'VIDEO_LEARNING' and
                w.get('video_playing', False) and
                w.get('context') in ['video', 'work']
            ):
                return False, 0.0
        
        current = all_windows[-1]
        if current.get('idle_ratio', 0) >= 0.80 and current.get('idle_seconds', 0) >= 22:
            return False, 0.0
        
        if current.get('interaction_rate', 0) >= 0.5 and current.get('idle_ratio', 0) < 0.4:
            return False, 0.0
        
        if len(all_windows) >= 2:
            last = all_windows[-2:]
            avg_interaction = np.mean([w.get('interaction_rate', 0) for w in last])
            avg_idle_ratio = np.mean([w.get('idle_ratio', 0) for w in last])
            avg_idle_seconds = np.mean([w.get('idle_seconds', 15) for w in last])
            
            if avg_interaction < 0.15 and avg_idle_seconds > 18:
                return True, 0.90
            
            if avg_interaction < 0.25 and avg_idle_ratio > 0.65:
                return True, 0.85
        
        if len(all_windows) >= 3:
            inactive = 0
            for w in all_windows[-3:]:
                if w.get('interaction_rate', 0) < 0.2 or w.get('idle_ratio', 0) > 0.65:
                    inactive += 1
            if inactive >= 2:
                return True, 0.80
        
        time_based_min = STATE_THRESHOLDS['FATIGUE']['time_based_min_windows']
        if len(all_windows) >= time_based_min:
            avg_engagement = np.mean(
                [w.get('engagement_density', 0) for w in all_windows[-time_based_min:]]
            )
            if avg_engagement < 0.4:
                return True, 0.75
        
        return False, 0.0

    def _calculate_trend_slope(self, values):
        if len(values) < 2:
            return 0.0
        
        x = np.arange(len(values))
        y = np.array(values)
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        denom = np.sum((x - x_mean) ** 2)
        if denom == 0:
            return 0.0
        return np.sum((x - x_mean) * (y - y_mean)) / denom
    
    def reset(self):
        self.window_history.clear()
        self.engagement_baseline = None
        self.previous_state = None
        self.drift_start_time = None
        self.state_entry_time.clear()
        self.smoothed_metrics.clear()
        self.consecutive_drift_windows = 0
        self.consecutive_recovery_windows = 0
