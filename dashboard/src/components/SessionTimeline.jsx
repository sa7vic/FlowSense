import React from 'react';
import styles from './SessionTimeline.module.css';

const STATE_CONFIG = {
  ALIGNED: {
    color: 'var(--color-aligned)',
    label: 'Aligned',
    description: 'Working in intended context with stable attention'
  },
  DRIFT: {
    color: 'var(--color-drift)',
    label: 'Drift',
    description: 'Attention shifted away from primary task'
  },
  FATIGUE: {
    color: 'var(--color-fatigue)',
    label: 'Fatigue',
    description: 'Cognitive load accumulating, engagement declining'
  },
  IDLE: {
    color: 'var(--color-idle)',
    label: 'Idle',
    description: 'Minimal interaction, natural pause'
  },
  RECOVERY: {
    color: 'var(--color-recovery)',
    label: 'Recovery',
    description: 'Re-engaging after disengagement'
  }
};

const SessionTimeline = ({ windows, sessionInfo }) => {
  if (!windows || windows.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No timeline data available</p>
      </div>
    );
  }

  const totalDuration = sessionInfo?.duration_minutes || windows.length * 0.5; // 30s windows
  const pixelsPerMinute = 800 / totalDuration; // Normalize to ~800px width

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Cognitive State Timeline</h2>
        <p className={styles.subtitle}>
          {sessionInfo?.task_type || 'Session'} — {totalDuration} minutes
        </p>
      </div>

      <div className={styles.timeline}>
        {windows.map((window, idx) => {
          const state = STATE_CONFIG[window.cognitive_state] || STATE_CONFIG.IDLE;
          const widthPx = pixelsPerMinute * 0.5; // Each window is 30 seconds

          return (
            <div
              key={idx}
              className={styles.segment}
              style={{
                width: `${widthPx}px`,
                backgroundColor: state.color,
                opacity: window.alignment_score ? 0.5 + (window.alignment_score / 200) : 0.7
              }}
              title={`Window ${window.window_num}\n${state.label}: ${state.description}\nAlignment: ${window.alignment_score?.toFixed(0) || 'N/A'}\nContext: ${window.active_tab_category}`}
            />
          );
        })}
      </div>

      <div className={styles.legend}>
        {Object.entries(STATE_CONFIG).map(([key, config]) => (
          <div key={key} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: config.color }}
            />
            <span className={styles.legendLabel}>{config.label}</span>
            <span className={styles.legendDesc}>{config.description}</span>
          </div>
        ))}
      </div>

      <div className={styles.timeAxis}>
        <span>0 min</span>
        <span>{(totalDuration / 2).toFixed(0)} min</span>
        <span>{totalDuration} min</span>
      </div>
    </div>
  );
};

export default SessionTimeline;
