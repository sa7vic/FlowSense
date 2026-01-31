import React from 'react';
import styles from './DriftReplay.module.css';

const DriftReplay = ({ windows }) => {
  if (!windows || windows.length === 0) {
    return <div className={styles.emptyState}>No drift events to analyze</div>;
  }

  const driftEvents = [];
  let inDrift = false;
  let driftStart = null;
  let driftEnd = null;

  windows.forEach((window, idx) => {
    const isDrift = window.cognitive_state === 'DRIFT';

    if (isDrift && !inDrift) {
      driftStart = { ...window, idx };
      inDrift = true;
    } else if (!isDrift && inDrift) {
      driftEnd = { ...window, idx };
      
      const duration = (driftEnd.idx - driftStart.idx) * 30; // seconds
      const prevScore = windows[driftStart.idx - 1]?.alignment_score || 0;
      const driftScore = driftStart.alignment_score || 0;
      const scoreDrop = prevScore - driftScore;

      driftEvents.push({
        startWindow: driftStart.window_num || driftStart.idx + 1,
        endWindow: driftEnd.window_num || driftEnd.idx + 1,
        duration,
        context: driftStart.active_tab_category || 'unknown',
        triggerScore: prevScore,
        lowestScore: driftScore,
        scoreDrop,
        recoveryState: driftEnd.cognitive_state || 'ALIGNED',
        recoveryScore: driftEnd.alignment_score || 0,
        timestamp: driftStart.timestamp
      });

      inDrift = false;
      driftStart = null;
      driftEnd = null;
    }
  });

  if (inDrift && driftStart) {
    const lastWindow = windows[windows.length - 1];
    const prevScore = windows[driftStart.idx - 1]?.alignment_score || 0;
    const driftScore = driftStart.alignment_score || 0;
    
    driftEvents.push({
      startWindow: driftStart.window_num || driftStart.idx + 1,
      endWindow: lastWindow.window_num || windows.length,
      duration: ((windows.length - 1) - driftStart.idx) * 30,
      context: driftStart.active_tab_category || 'unknown',
      triggerScore: prevScore,
      lowestScore: driftScore,
      scoreDrop: prevScore - driftScore,
      recoveryState: 'ongoing',
      recoveryScore: lastWindow.alignment_score || 0,
      timestamp: driftStart.timestamp
    });
  }

  if (driftEvents.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Drift Analysis</h2>
          <p className={styles.subtitle}>No drift events detected — attention remained stable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Drift Analysis</h2>
        <p className={styles.subtitle}>
          {driftEvents.length} attention shift{driftEvents.length !== 1 ? 's' : ''} observed
        </p>
      </div>

      <div className={styles.events}>
        {driftEvents.map((event, idx) => (
          <div key={idx} className={styles.eventCard}>
            <div className={styles.eventHeader}>
              <span className={styles.eventNumber}>Shift {idx + 1}</span>
              <span className={styles.eventTime}>
                Windows {event.startWindow}–{event.endWindow} ({event.duration}s)
              </span>
            </div>

            <div className={styles.eventBody}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Trigger Context</span>
                <span className={styles.metricValue}>
                  {formatContext(event.context)}
                </span>
              </div>

              <div className={styles.metric}>
                <span className={styles.metricLabel}>Alignment Drop</span>
                <span className={styles.metricValue}>
                  {event.triggerScore?.toFixed(0) || 'N/A'} → {event.lowestScore?.toFixed(0) || 'N/A'}
                  {event.scoreDrop > 0 && (
                    <span className={styles.metricDelta}>(-{event.scoreDrop.toFixed(0)})</span>
                  )}
                </span>
              </div>

              <div className={styles.metric}>
                <span className={styles.metricLabel}>Recovery</span>
                <span className={styles.metricValue}>
                  {event.recoveryState === 'ongoing' 
                    ? 'In progress' 
                    : `${event.recoveryState} (score: ${event.recoveryScore?.toFixed(0)})`
                  }
                </span>
              </div>
            </div>

            <div className={styles.eventInsight}>
              {generateDriftInsight(event)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <p>
          <strong>Pattern:</strong> {summarizeDriftPattern(driftEvents)}
        </p>
      </div>
    </div>
  );
};

function formatContext(context) {
  const contextMap = {
    'work': 'Work context',
    'distraction': 'Distraction context',
    'reference': 'Reference material',
    'communication': 'Communication',
    'idle': 'Idle state'
  };
  return contextMap[context] || context;
}

function generateDriftInsight(event) {
  if (event.context === 'distraction') {
    return '💭 Attention shifted to non-work context';
  }
  if (event.scoreDrop > 30) {
    return '📉 Significant alignment disruption — consider environmental factors';
  }
  if (event.duration > 120) {
    return '⏱️ Extended drift — may indicate task uncertainty or fatigue';
  }
  if (event.recoveryState === 'RECOVERY') {
    return '🔄 Self-corrected — meta-cognitive awareness active';
  }
  return '🔍 Brief attention shift observed';
}

function summarizeDriftPattern(events) {
  if (events.length === 1) {
    return 'Single drift event — likely isolated external interruption.';
  }
  
  const avgDuration = events.reduce((sum, e) => sum + e.duration, 0) / events.length;
  const distractionCount = events.filter(e => e.context === 'distraction').length;
  
  if (distractionCount >= events.length / 2) {
    return `Distraction-driven pattern (${distractionCount}/${events.length} events). Consider environmental controls.`;
  }
  
  if (avgDuration < 60) {
    return 'Brief, frequent shifts — high context sensitivity. May benefit from stricter focus blocks.';
  }
  
  return 'Mixed drift pattern — review individual events for specific triggers.';
}

export default DriftReplay;
