from google import genai
import os
from dotenv import load_dotenv
from datetime import datetime
import time
from functools import wraps

load_dotenv()

# Check if API key is configured
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in environment variables")
    print("AI-powered analysis will not be available")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


# Rate limiting and retry decorator
def retry_with_backoff(max_retries=3, initial_delay=1):
    """Decorator for exponential backoff retry logic"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    error_msg = str(e).lower()
                    
                    # Only retry on rate limit or temporary errors
                    if "rate_limit" in error_msg or "quota" in error_msg or "429" in error_msg:
                        if attempt < max_retries - 1:
                            print(f"Rate limit hit. Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                            time.sleep(delay)
                            delay *= 2  # Exponential backoff
                        else:
                            print(f"Max retries reached for rate limit")
                    else:
                        # Don't retry on other errors
                        raise
            
            raise last_exception
        return wrapper
    return decorator



@retry_with_backoff(max_retries=3, initial_delay=1)
def get_realtime_intervention(window_history, current_state, task_type):
    """
    Get AI-powered real-time intervention suggestion based on current state
    
    Used during active sessions to provide immediate guidance
    """
    if not client:
        return None
        
    if len(window_history) < 3:
        return None  # Need history to provide meaningful intervention
    
    # Get last 5 windows for context
    recent_windows = window_history[-5:]
    
    # Format recent performance
    recent_summary = "\n".join([
        f"Window {i+1}: {w['cognitive_state']} "
        f"(score: {w['alignment_score']:.0f}, "
        f"context: {w['context']})"
        for i, w in enumerate(recent_windows)
    ])
    
    # Calculate trend
    scores = [w['alignment_score'] for w in recent_windows]
    trend = "declining" if scores[-1] < scores[0] - 10 else \
            "improving" if scores[-1] > scores[0] + 10 else "stable"
    
    prompt = f"""You are a real-time focus coach. A user is currently in a {task_type} session and needs immediate guidance.

CURRENT STATUS:
- Current State: {current_state}
- Performance Trend: {trend}
- Recent Windows (last 2.5 minutes):
{recent_summary}

TASK: Provide ONE specific, actionable intervention (1-2 sentences max).

Rules:
- Be direct and immediate ("Take a 2-minute break now")
- No explanations unless critical
- Action must be doable in next 30 seconds
- Consider the cognitive state urgency

Examples of good interventions:
- DRIFT: "Close social media tabs. Refocus on your primary task."
- FATIGUE: "Stand up and stretch for 60 seconds. You need a reset."
- ALIGNED but declining: "You're doing well. Set a micro-goal for next 5 min."
- Excessive switching: "Pick ONE task. Work on it for 10 minutes uninterrupted."

Your intervention:"""
    
    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config={
                "temperature": 0.4,  # Lower for consistent, practical advice
                "max_output_tokens": 100
            }
        )
        
        return {
            'intervention': response.text.strip(),
            'state': current_state,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Real-time intervention failed: {e}")
        return None


@retry_with_backoff(max_retries=3, initial_delay=1)
def getAnalytics(data):
    """Generate AI-powered analytics insights from session data with deep cognitive analysis"""
    
    if not client:
        return {
            'insights': 'AI analysis unavailable. Please configure GEMINI_API_KEY environment variable.',
            'analytics_metadata': {},
            'timestamp': datetime.now().isoformat(),
            'error': 'API key not configured'
        }
    
    session = data['session']
    windows = data['windows']
    summary = data['summary']
    
    # Format enhanced timeline with detailed metrics
    window_timeline = _format_window_timeline(windows)
    
    # Calculate additional analytical metrics
    analytics_context = _compute_analytics_context(windows, session)
    
    # Prepare comprehensive prompt for AI analysis
    prompt = f"""You are an expert cognitive psychologist and productivity analyst. Perform a deep, production-grade analysis of this focus session using evidence-based cognitive science principles.

=== SESSION OVERVIEW ===
Task Type: {session['task_type']}
Intended Duration: {session['intended_duration']} minutes | Actual: {summary['duration_minutes']} minutes
Overall Performance: {session['avg_alignment_score']:.1f}/100 alignment | {session['avg_context_stability']:.2f} stability
Total Drift Events: {session['total_drift_count']}

=== TIME DISTRIBUTION (seconds) ===
Aligned: {session['time_breakdown']['aligned']}s ({_calc_percentage(session['time_breakdown']['aligned'], summary['duration_minutes']*60):.1f}%)
Drift: {session['time_breakdown']['drift']}s ({_calc_percentage(session['time_breakdown']['drift'], summary['duration_minutes']*60):.1f}%)
Idle: {session['time_breakdown']['idle']}s ({_calc_percentage(session['time_breakdown']['idle'], summary['duration_minutes']*60):.1f}%)
Fatigue: {session['time_breakdown']['fatigue']}s ({_calc_percentage(session['time_breakdown']['fatigue'], summary['duration_minutes']*60):.1f}%)
Recovery: {session['time_breakdown']['recovery']}s ({_calc_percentage(session['time_breakdown']['recovery'], summary['duration_minutes']*60):.1f}%)

=== COGNITIVE STATE TRANSITIONS ===
{_format_states(summary['cognitive_states'])}

=== ADVANCED ANALYTICS ===
Peak Performance Window: {analytics_context['peak_window']}
Lowest Performance Window: {analytics_context['lowest_window']}
Performance Volatility: {analytics_context['volatility']:.2f} (std deviation of alignment scores)
Average Recovery Time: {analytics_context['avg_recovery_time']:.1f}s after drift
Distraction Context Percentage: {analytics_context['distraction_percentage']:.1f}%
Interaction Rate Trend: {analytics_context['interaction_trend']}
Tab Switching Pattern: {analytics_context['tab_switch_pattern']}

=== TEMPORAL PATTERNS (30-second windows) ===
{window_timeline}

=== ANALYSIS REQUIREMENTS ===
Provide a comprehensive, structured analysis with the following sections:

**1. SESSION QUALITY ASSESSMENT (Grade: A-F)**
- Overall effectiveness rating with justification
- Comparison to optimal {session['task_type']} session benchmarks
- Productivity efficiency score based on alignment time vs. total time

**2. COGNITIVE PATTERN ANALYSIS**
- **Attention Span Profile**: Identify maximum sustained focus duration and attention decay patterns
- **Flow State Analysis**: Did the user achieve flow? If not, what prevented it?
- **Distraction Triggers**: Specific moments when drift occurred and probable causes
- **Fatigue Onset**: When did cognitive fatigue appear? Was it premature?
- **Context Switching Behavior**: Healthy vs. excessive tab switching patterns

**3. TEMPORAL INSIGHTS**
- **Productivity Curve**: Describe the performance trajectory (e.g., strong start → midpoint slump → late recovery)
- **Critical Moments**: Identify 2-3 windows where intervention would have been most impactful
- **Time-of-Day Effect**: Infer whether this session timing was optimal based on performance patterns
- **Micro-Break Analysis**: Were natural breaks taken? Should more/fewer breaks have occurred?

**4. ANOMALY DETECTION**
- Unusual patterns that deviate from typical {session['task_type']} behavior
- Red flags indicating deeper productivity issues
- Positive anomalies (unexpected high performance moments)

**5. ROOT CAUSE ANALYSIS**
- Primary factor limiting performance (context switching, distractions, fatigue, task mismatch)
- Secondary contributing factors
- Environmental or behavioral hypotheses

**6. ACTIONABLE RECOMMENDATIONS (Ranked by Impact)**
Provide specific, evidence-based recommendations:
- **Immediate**: Changes for the next session (e.g., "Start with 15-min warm-up focus block")
- **Short-term**: Adjustments this week (e.g., "Schedule {session['task_type']} sessions before noon")
- **Long-term**: Habit formation strategies (e.g., "Build 90-min deep work tolerance over 3 weeks")
- **Tool/Environment**: Specific apps, browser extensions, or workspace changes

**7. OPTIMAL SESSION PARAMETERS**
Based on observed patterns, recommend:
- Ideal session duration for this task type: ___ minutes
- Suggested break frequency: Every ___ minutes
- Best context setup: (e.g., "Close communication apps, keep docs tab open")
- Pre-session preparation: Specific steps to maximize alignment

**8. PREDICTIVE INSIGHTS**
- If this pattern continues, what trajectory should the user expect?
- What's the next productivity milestone to target?
- Risk assessment: Burnout risk, attention fatigue accumulation

Use specific evidence from the timeline. Reference window numbers (e.g., "Window 12-15 showed..."). Be direct, data-driven, and avoid generic advice. Assume the user wants expert-level insights."""
    
    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config={
                "temperature": 0.6,  # Slightly lower for more focused analysis
                "max_output_tokens": 2500  # Increased for comprehensive analysis
            }
        )
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {
            'insights': 'AI analysis temporarily unavailable. Please check your GEMINI_API_KEY and try again.',
            'analytics_metadata': _compute_analytics_context(windows, session),
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }
    
    return {
        'insights': response.text,
        'analytics_metadata': analytics_context,
        'timestamp': datetime.now().isoformat()
    }


def _format_states(states_dict):
    """Format state counts for prompt"""
    lines = []
    for state, count in states_dict.items():
        lines.append(f"- {state}: {count} windows")
    return "\n".join(lines)


def _calc_percentage(value, total):
    """Calculate percentage safely"""
    if total == 0:
        return 0.0
    return (value / total) * 100


def _compute_analytics_context(windows, session):
    """
    Compute advanced analytics metrics for AI analysis
    """
    if not windows:
        return {
            'peak_window': 'N/A',
            'lowest_window': 'N/A',
            'volatility': 0.0,
            'avg_recovery_time': 0.0,
            'distraction_percentage': 0.0,
            'interaction_trend': 'insufficient data',
            'tab_switch_pattern': 'insufficient data'
        }
    
    # Find peak and lowest performance windows
    scores = [w['alignment_score'] for w in windows]
    peak_idx = scores.index(max(scores))
    lowest_idx = scores.index(min(scores))
    
    peak_window = f"Window {peak_idx + 1} (score: {scores[peak_idx]:.0f})"
    lowest_window = (
        f"Window {lowest_idx + 1} (score: {scores[lowest_idx]:.0f})"
    )
    
    # Calculate volatility (standard deviation of scores)
    import numpy as np
    volatility = float(np.std(scores))
    
    # Calculate average recovery time
    recovery_times = []
    in_drift = False
    drift_start_idx = 0
    
    for idx, w in enumerate(windows):
        if w['cognitive_state'] in ['DRIFT', 'FATIGUE'] and not in_drift:
            in_drift = True
            drift_start_idx = idx
        elif (
            w['cognitive_state'] in ['ALIGNED', 'RECOVERY']
            and in_drift
        ):
            recovery_time = (idx - drift_start_idx) * 30  # 30s windows
            recovery_times.append(recovery_time)
            in_drift = False
    
    avg_recovery = (
        float(np.mean(recovery_times)) if recovery_times else 0.0
    )
    
    # Calculate distraction context percentage
    distraction_count = sum(
        1 for w in windows
        if w.get('active_tab_category') == 'distraction'
    )
    distraction_pct = (distraction_count / len(windows)) * 100
    
    # Analyze interaction rate trend
    first_half = windows[:len(windows)//2]
    second_half = windows[len(windows)//2:]
    
    if first_half and second_half:
        avg_first = np.mean([
            w['interaction_count'] for w in first_half
        ])
        avg_second = np.mean([
            w['interaction_count'] for w in second_half
        ])
        
        if avg_second > avg_first * 1.2:
            interaction_trend = "increasing (ramping up)"
        elif avg_second < avg_first * 0.8:
            interaction_trend = "decreasing (fatigue signal)"
        else:
            interaction_trend = "stable"
    else:
        interaction_trend = "insufficient data"
    
    # Analyze tab switching pattern
    tab_switches = [w.get('tab_switch_count', 0) for w in windows]
    avg_switches = np.mean(tab_switches)
    
    if avg_switches < 1:
        tab_switch_pattern = "focused (minimal switching)"
    elif avg_switches < 3:
        tab_switch_pattern = "moderate (healthy context switching)"
    elif avg_switches < 6:
        tab_switch_pattern = "elevated (scattered attention)"
    else:
        tab_switch_pattern = "excessive (attention fragmentation)"
    
    return {
        'peak_window': peak_window,
        'lowest_window': lowest_window,
        'volatility': volatility,
        'avg_recovery_time': avg_recovery,
        'distraction_percentage': distraction_pct,
        'interaction_trend': interaction_trend,
        'tab_switch_pattern': tab_switch_pattern
    }


def _format_window_timeline(windows):
    """
    Format window data for AI analysis, limiting to key information
    """
    if len(windows) > 20:
        # For long sessions, sample key windows
        # Sample evenly + last window
        sampled = windows[::len(windows)//15] + [windows[-1]]
        lines = ["[Showing sampled windows from session]"]
    else:
        sampled = windows
        lines = []
    
    for i, window in enumerate(sampled):
        time_marker = f"Window {windows.index(window) + 1}"
        lines.append(
            f"{time_marker}: {window['cognitive_state']} | "
            f"Align: {window['alignment_score']:.0f} | "
            f"Context: {window['active_tab_category']} | "
            f"Interactions: {window['interaction_count']} | "
            f"Switches: {window['tab_switch_count']}"
        )
    
    return "\n".join(lines)


def get_multi_session_insights(sessions_data):
    """
    Analyze patterns across multiple sessions to identify trends
    
    Args:
        sessions_data: List of session dicts with summary statistics
    """
    if not client:
        return {
            'insights': 'AI analysis unavailable. Please configure GEMINI_API_KEY environment variable.',
            'timestamp': datetime.now().isoformat(),
            'error': 'API key not configured'
        }
        
    if len(sessions_data) < 2:
        return {
            'insights': 'Need at least 2 sessions for pattern analysis',
            'timestamp': datetime.now().isoformat()
        }
    
    # Format sessions for analysis
    session_summaries = []
    for idx, session in enumerate(sessions_data, 1):
        summary = f"""
Session {idx}:
- Task: {session['task_type']}
- Duration: {session['duration_minutes']}min
- Avg Alignment: {session['avg_alignment_score']:.1f}
- Drift Events: {session['total_drift_count']}
- States: A:{session['time_breakdown'].get('aligned', 0)}s \
D:{session['time_breakdown'].get('drift', 0)}s \
I:{session['time_breakdown'].get('idle', 0)}s
"""
        session_summaries.append(summary.strip())
    
    all_sessions = "\n\n".join(session_summaries)
    
    prompt = f"""You are a productivity data scientist analyzing work patterns.

USER HISTORY ({len(sessions_data)} sessions):
{all_sessions}

ANALYSIS REQUIREMENTS:

**1. PATTERN RECOGNITION**
- Identify consistent strengths across sessions
- Spot recurring failure modes (same distractions, same time of drift)
- Detect performance trends (improving, declining, plateauing)

**2. TASK-SPECIFIC INSIGHTS**
- Which task types show best/worst performance?
- Are certain tasks consistently challenging?
- Optimal duration patterns per task type

**3. PREDICTIVE RECOMMENDATIONS**
- Based on patterns, what's the #1 change to make?
- What's working well that should be maintained?
- Early warning signs to watch for

**4. PERSONALIZATION STRATEGY**
- Suggested session duration adjustments
- Best time-of-day patterns (if inferable)
- Task sequencing recommendations

Be specific and evidence-based. Reference session numbers."""
    
    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config={
                "temperature": 0.5,
                "max_output_tokens": 1200
            }
        )
        
        return {
            'insights': response.text,
            'sessions_analyzed': len(sessions_data),
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Multi-session analysis failed: {e}")
        return {
            'insights': f'Analysis failed: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }

