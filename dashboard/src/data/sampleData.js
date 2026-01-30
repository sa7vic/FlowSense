/**
 * Sample session data matching backend API format
 * Source: genai_service.py response structure
 */

export const SAMPLE_SESSION = {
  session_id: "fs_726b15e38603",
  analysis: {
    analytics_metadata: {
      avg_recovery_time: 45.0,
      distraction_percentage: 22.5,
      interaction_trend: "decreasing (fatigue signal)",
      lowest_window: "Window 12 (score: 28)",
      peak_window: "Window 3 (score: 89)",
      tab_switch_pattern: "moderate (healthy context switching)",
      volatility: 18.42
    },
    insights: `**1. SESSION QUALITY ASSESSMENT (Grade: C+)**

Overall effectiveness: This deep work session showed strong initial engagement but suffered from mid-session attention fragmentation. Alignment time (58%) was below optimal for focused work (target: 75%+). The 22.5% distraction rate and elevated volatility (18.4) indicate context-switching challenges.

**2. COGNITIVE PATTERN ANALYSIS**

**Attention Span Profile**: Maximum sustained focus was ~5 minutes (Windows 2-3), after which attention fragmented. This suggests working memory constraints or task complexity mismatch.

**Flow State Analysis**: Partial flow achieved in Windows 2-4, but disrupted by external context switches. The user did not re-enter deep focus after the midpoint drift cascade.

**Distraction Triggers**: Window 12 marked the lowest performance (score: 28), coinciding with communication app usage. Secondary triggers appeared in Windows 8-9 with tab switching escalation.

**Fatigue Onset**: Cognitive fatigue emerged around Window 15 (~7.5 minutes in), earlier than typical for deep work sessions. This suggests either inadequate pre-session preparation or accumulated cognitive debt from prior tasks.

**Context Switching Behavior**: Moderate switching pattern (avg 2-3 tabs/window) was healthy early-on but became reactive rather than strategic mid-session.

**3. TEMPORAL INSIGHTS**

**Productivity Curve**: Strong opening → gradual decline → recovery attempt → premature fatigue. Classic "enthusiasm fade" pattern.

**Critical Moments**: 
- Window 3: Peak performance — this represents optimal state capacity
- Windows 11-13: Drift cascade — intervention here would have prevented 3 minutes of disengagement
- Window 18: Recovery attempt — shows resilience but insufficient time remained

**Time-of-Day Effect**: The fatigue onset timing suggests this may not be the user's peak cognitive window. Earlier in the day might yield better sustained attention.

**Micro-Break Analysis**: No deliberate breaks detected. The continuous 20-minute block without strategic disengagement likely accelerated fatigue.

**4. ANOMALY DETECTION**

- Positive anomaly: Quick recovery attempts (avg 45s) show strong meta-cognitive awareness
- Red flag: 45% performance drop from peak to trough suggests high context sensitivity
- Unusual pattern: Interaction rate decreased over time (typically increases with engagement)

**5. ROOT CAUSE ANALYSIS**

**Primary Factor**: Context switching during critical focus phases broke working memory consolidation. The user needs environmental controls (app blocking) during deep work.

**Secondary Factors**:
1. No warm-up period — jumped directly into complex work
2. Accessible communication channels during focus time
3. Possible task ambiguity (switching may indicate uncertainty)

**6. ACTIONABLE RECOMMENDATIONS (Ranked by Impact)**

**Immediate** (next session):
- Close communication apps before starting
- Set a single, clearly-defined outcome for the session
- Start with 5-minute context review to prime working memory

**Short-term** (this week):
- Test morning sessions (before 11 AM) for comparison
- Implement "protected focus blocks" — 15 min of app-locked deep work
- Add deliberate 3-minute transition breaks every 15 minutes

**Long-term** (habit formation):
- Build tolerance for 25-minute uninterrupted blocks over 3 weeks
- Develop pre-session ritual (2-min breathing + task clarity)
- Track context switches to build awareness

**Tool/Environment**:
- Browser extension: Block social/communication during focus mode
- Workspace: Separate browser profiles for work vs. communication
- Physical: Visual "focus mode" indicator to reduce interruptions

**7. OPTIMAL SESSION PARAMETERS**

Based on observed patterns:
- Ideal session duration: 25 minutes (current capacity before fatigue)
- Suggested break frequency: Every 15 minutes (strategic, not reactive)
- Best context setup: Single-task window, documentation in second monitor, communications closed
- Pre-session preparation: 2-minute task clarification + environment setup

**8. PREDICTIVE INSIGHTS**

If this pattern continues, expect:
- Plateau at C/C+ performance range
- Increasing frustration with "wasted" focus attempts
- Risk of abandoning structured focus sessions

Next milestone: Achieve 20 minutes of sustained alignment (one session with <3 drift events).

Burnout risk assessment: Low currently, but cognitive fatigue accumulation could escalate if session frequency increases without addressing context switching.`,
    timestamp: "2026-01-27T21:35:05.562109"
  },
  session: {
    session_id: "fs_726b15e38603",
    task_type: "deep_work",
    intended_duration: 25,
    start_time: "2026-01-27T21:15:00",
    end_time: "2026-01-27T21:35:00",
    avg_alignment_score: 64.2,
    avg_context_stability: 0.73,
    total_drift_count: 8,
    time_breakdown: {
      aligned: 697,
      drift: 268,
      idle: 89,
      fatigue: 123,
      recovery: 23
    }
  },
  summary: {
    duration_minutes: 20,
    cognitive_states: {
      ALIGNED: 12,
      DRIFT: 6,
      FATIGUE: 3,
      IDLE: 2,
      RECOVERY: 1
    }
  },
  windows: [
    { window_num: 1, cognitive_state: 'ALIGNED', alignment_score: 68, active_tab_category: 'work', interaction_count: 12, tab_switch_count: 1, timestamp: '2026-01-27T21:15:30' },
    { window_num: 2, cognitive_state: 'ALIGNED', alignment_score: 82, active_tab_category: 'work', interaction_count: 18, tab_switch_count: 2, timestamp: '2026-01-27T21:16:00' },
    { window_num: 3, cognitive_state: 'ALIGNED', alignment_score: 89, active_tab_category: 'work', interaction_count: 22, tab_switch_count: 2, timestamp: '2026-01-27T21:16:30' },
    { window_num: 4, cognitive_state: 'ALIGNED', alignment_score: 85, active_tab_category: 'work', interaction_count: 19, tab_switch_count: 3, timestamp: '2026-01-27T21:17:00' },
    { window_num: 5, cognitive_state: 'ALIGNED', alignment_score: 76, active_tab_category: 'work', interaction_count: 15, tab_switch_count: 3, timestamp: '2026-01-27T21:17:30' },
    { window_num: 6, cognitive_state: 'DRIFT', alignment_score: 58, active_tab_category: 'reference', interaction_count: 14, tab_switch_count: 5, timestamp: '2026-01-27T21:18:00' },
    { window_num: 7, cognitive_state: 'DRIFT', alignment_score: 52, active_tab_category: 'reference', interaction_count: 11, tab_switch_count: 4, timestamp: '2026-01-27T21:18:30' },
    { window_num: 8, cognitive_state: 'ALIGNED', alignment_score: 71, active_tab_category: 'work', interaction_count: 16, tab_switch_count: 2, timestamp: '2026-01-27T21:19:00' },
    { window_num: 9, cognitive_state: 'ALIGNED', alignment_score: 69, active_tab_category: 'work', interaction_count: 14, tab_switch_count: 3, timestamp: '2026-01-27T21:19:30' },
    { window_num: 10, cognitive_state: 'DRIFT', alignment_score: 48, active_tab_category: 'distraction', interaction_count: 9, tab_switch_count: 6, timestamp: '2026-01-27T21:20:00' },
    { window_num: 11, cognitive_state: 'DRIFT', alignment_score: 35, active_tab_category: 'distraction', interaction_count: 7, tab_switch_count: 7, timestamp: '2026-01-27T21:20:30' },
    { window_num: 12, cognitive_state: 'DRIFT', alignment_score: 28, active_tab_category: 'distraction', interaction_count: 5, tab_switch_count: 8, timestamp: '2026-01-27T21:21:00' },
    { window_num: 13, cognitive_state: 'DRIFT', alignment_score: 42, active_tab_category: 'distraction', interaction_count: 8, tab_switch_count: 5, timestamp: '2026-01-27T21:21:30' },
    { window_num: 14, cognitive_state: 'ALIGNED', alignment_score: 65, active_tab_category: 'work', interaction_count: 13, tab_switch_count: 2, timestamp: '2026-01-27T21:22:00' },
    { window_num: 15, cognitive_state: 'FATIGUE', alignment_score: 55, active_tab_category: 'work', interaction_count: 10, tab_switch_count: 3, timestamp: '2026-01-27T21:22:30' },
    { window_num: 16, cognitive_state: 'FATIGUE', alignment_score: 51, active_tab_category: 'work', interaction_count: 8, tab_switch_count: 4, timestamp: '2026-01-27T21:23:00' },
    { window_num: 17, cognitive_state: 'IDLE', alignment_score: 38, active_tab_category: 'idle', interaction_count: 2, tab_switch_count: 1, timestamp: '2026-01-27T21:23:30' },
    { window_num: 18, cognitive_state: 'RECOVERY', alignment_score: 62, active_tab_category: 'work', interaction_count: 11, tab_switch_count: 2, timestamp: '2026-01-27T21:24:00' },
    { window_num: 19, cognitive_state: 'ALIGNED', alignment_score: 70, active_tab_category: 'work', interaction_count: 14, tab_switch_count: 2, timestamp: '2026-01-27T21:24:30' },
    { window_num: 20, cognitive_state: 'ALIGNED', alignment_score: 68, active_tab_category: 'work', interaction_count: 13, tab_switch_count: 2, timestamp: '2026-01-27T21:25:00' },
    { window_num: 21, cognitive_state: 'ALIGNED', alignment_score: 72, active_tab_category: 'work', interaction_count: 15, tab_switch_count: 1, timestamp: '2026-01-27T21:25:30' },
    { window_num: 22, cognitive_state: 'IDLE', alignment_score: 25, active_tab_category: 'idle', interaction_count: 1, tab_switch_count: 0, timestamp: '2026-01-27T21:26:00' },
    { window_num: 23, cognitive_state: 'ALIGNED', alignment_score: 75, active_tab_category: 'work', interaction_count: 16, tab_switch_count: 2, timestamp: '2026-01-27T21:26:30' },
    { window_num: 24, cognitive_state: 'FATIGUE', alignment_score: 59, active_tab_category: 'work', interaction_count: 9, tab_switch_count: 3, timestamp: '2026-01-27T21:27:00' }
  ]
};

export const SAMPLE_MULTI_SESSION_DATA = [
  {
    session_id: "fs_726b15e38603",
    task_type: "deep_work",
    duration_minutes: 20,
    avg_alignment_score: 64.2,
    total_drift_count: 8,
    time_breakdown: { aligned: 697, drift: 268, idle: 89, fatigue: 123, recovery: 23 },
    start_time: "2026-01-27T21:15:00"
  },
  {
    session_id: "fs_8a3c42f91204",
    task_type: "creative",
    duration_minutes: 35,
    avg_alignment_score: 71.8,
    total_drift_count: 5,
    time_breakdown: { aligned: 1245, drift: 189, idle: 156, fatigue: 201, recovery: 45 },
    start_time: "2026-01-27T14:30:00"
  },
  {
    session_id: "fs_5d2e81b47a92",
    task_type: "learning",
    duration_minutes: 45,
    avg_alignment_score: 68.5,
    total_drift_count: 12,
    time_breakdown: { aligned: 1678, drift: 412, idle: 203, fatigue: 287, recovery: 89 },
    start_time: "2026-01-26T10:00:00"
  },
  {
    session_id: "fs_3f7a92c64b81",
    task_type: "deep_work",
    duration_minutes: 28,
    avg_alignment_score: 76.4,
    total_drift_count: 4,
    time_breakdown: { aligned: 1089, drift: 145, idle: 67, fatigue: 178, recovery: 34 },
    start_time: "2026-01-25T09:15:00"
  },
  {
    session_id: "fs_9b4d73e52c19",
    task_type: "planning",
    duration_minutes: 22,
    avg_alignment_score: 62.1,
    total_drift_count: 9,
    time_breakdown: { aligned: 623, drift: 298, idle: 112, fatigue: 134, recovery: 27 },
    start_time: "2026-01-25T15:45:00"
  }
];

// Cognitive Fingerprint data (aggregated from multiple sessions)
export const SAMPLE_FINGERPRINT = {
  user_id: "user_abc123",
  dimensions: {
    alignment_ramp_up: 78,      // How quickly user enters focused state (0-100)
    endurance_span: 65,          // Sustained focus duration capacity (0-100)
    drift_sensitivity: 42,       // Susceptibility to context switches (lower is better, 0-100)
    recovery_resilience: 71,     // Speed of returning to aligned state (0-100)
    task_affinity: {             // Relative performance by task type
      deep_work: 68,
      creative: 74,
      learning: 66,
      planning: 59,
      communication: 52
    }
  },
  weekly_trends: [
    { week: "Jan 14-20", alignment_ramp_up: 72, endurance_span: 61, drift_sensitivity: 48, recovery_resilience: 68 },
    { week: "Jan 21-27", alignment_ramp_up: 78, endurance_span: 65, drift_sensitivity: 42, recovery_resilience: 71 }
  ],
  total_sessions: 23,
  date_range: {
    start: "2026-01-01",
    end: "2026-01-27"
  }
};
