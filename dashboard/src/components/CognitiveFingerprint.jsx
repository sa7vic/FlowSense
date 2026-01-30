import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './CognitiveFingerprint.module.css';
const CognitiveFingerprint = ({ fingerprintData }) => {
  if (!fingerprintData || !fingerprintData.dimensions) {
    return <div className={styles.emptyState}>Collecting fingerprint data — need multiple sessions</div>;
  }
  const { dimensions, weekly_trends, total_sessions } = fingerprintData;
  const radarData = [
    { dimension: 'Ramp-Up', value: dimensions.alignment_ramp_up, fullMark: 100 },
    { dimension: 'Endurance', value: dimensions.endurance_span, fullMark: 100 },
    { dimension: 'Drift Resist', value: 100 - dimensions.drift_sensitivity, fullMark: 100 }, // Invert for intuitive display
    { dimension: 'Recovery', value: dimensions.recovery_resilience, fullMark: 100 }
  ];
  const taskAffinityData = Object.entries(dimensions.task_affinity || {}).map(([task, score]) => ({
    task: formatTaskType(task),
    score
  }));
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{payload[0].payload.dimension}</p>
        <p className={styles.tooltipValue}>{payload[0].value}/100</p>
      </div>
    );
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Cognitive Fingerprint</h2>
        <p className={styles.subtitle}>
          Your attention patterns across {total_sessions} sessions — a descriptive profile
        </p>
      </div>
      <div className={styles.content}>
        <div className={styles.radarSection}>
          <h3>Core Dimensions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                domain={[0, 100]} 
                tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10 }}
              />
              <Radar 
                name="Profile" 
                dataKey="value" 
                stroke="var(--color-accent)" 
                fill="var(--color-accent)" 
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className={styles.dimensionGuide}>
            <DimensionCard 
              title="Alignment Ramp-Up"
              value={dimensions.alignment_ramp_up}
              description={interpretRampUp(dimensions.alignment_ramp_up)}
            />
            <DimensionCard 
              title="Endurance Span"
              value={dimensions.endurance_span}
              description={interpretEndurance(dimensions.endurance_span)}
            />
            <DimensionCard 
              title="Drift Sensitivity"
              value={dimensions.drift_sensitivity}
              description={interpretDriftSensitivity(dimensions.drift_sensitivity)}
              inverted
            />
            <DimensionCard 
              title="Recovery Resilience"
              value={dimensions.recovery_resilience}
              description={interpretRecovery(dimensions.recovery_resilience)}
            />
          </div>
        </div>
        <div className={styles.affinitySection}>
          <h3>Task Affinity</h3>
          <p className={styles.affinitySubtitle}>
            Relative alignment by task type — not rankings
          </p>
          <div className={styles.affinityBars}>
            {taskAffinityData.map((item, idx) => (
              <div key={idx} className={styles.affinityItem}>
                <div className={styles.affinityLabel}>{item.task}</div>
                <div className={styles.affinityBarContainer}>
                  <div 
                    className={styles.affinityBar}
                    style={{ width: `${item.score}%` }}
                  />
                  <span className={styles.affinityScore}>{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {weekly_trends && weekly_trends.length >= 2 && (
        <div className={styles.trendsSection}>
          <h3>Weekly Adaptation</h3>
          <p className={styles.trendsSubtitle}>
            How your patterns are evolving — not improving or declining
          </p>
          <div className={styles.trendsGrid}>
            {renderWeeklyComparison(weekly_trends)}
          </div>
        </div>
      )}
    </div>
  );
};
const DimensionCard = ({ title, value, description, inverted = false }) => (
  <div className={styles.dimensionCard}>
    <div className={styles.dimensionHeader}>
      <span className={styles.dimensionTitle}>{title}</span>
      <span className={styles.dimensionValue}>
        {inverted ? 100 - value : value}/100
      </span>
    </div>
    <p className={styles.dimensionDesc}>{description}</p>
  </div>
);
function formatTaskType(task) {
  return task.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function interpretRampUp(value) {
  if (value >= 75) return 'Quick to engage — minimal warm-up needed';
  if (value >= 50) return 'Moderate ramp-up — benefits from brief preparation';
  return 'Gradual engagement — structured transitions helpful';
}
function interpretEndurance(value) {
  if (value >= 75) return 'Sustained attention capacity — handles longer sessions';
  if (value >= 50) return 'Moderate endurance — strategic breaks optimize performance';
  return 'Shorter focus blocks currently optimal — build gradually';
}
function interpretDriftSensitivity(value) {
  if (value <= 30) return 'Low drift tendency — maintains context well';
  if (value <= 60) return 'Moderate sensitivity — benefits from environmental controls';
  return 'High context sensitivity — structured focus blocks recommended';
}
function interpretRecovery(value) {
  if (value >= 75) return 'Quick re-engagement — strong meta-cognitive awareness';
  if (value >= 50) return 'Moderate recovery — attention resets with brief pauses';
  return 'Extended recovery — proactive drift prevention beneficial';
}
function renderWeeklyComparison(trends) {
  const latest = trends[trends.length - 1];
  const previous = trends[trends.length - 2];
  const dimensions = [
    { key: 'alignment_ramp_up', label: 'Ramp-Up' },
    { key: 'endurance_span', label: 'Endurance' },
    { key: 'drift_sensitivity', label: 'Drift Resist', inverted: true },
    { key: 'recovery_resilience', label: 'Recovery' }
  ];
  return dimensions.map(dim => {
    const prevValue = dim.inverted ? 100 - previous[dim.key] : previous[dim.key];
    const latestValue = dim.inverted ? 100 - latest[dim.key] : latest[dim.key];
    const change = latestValue - prevValue;
    const changeLabel = change === 0 ? 'Stable' : change > 0 ? 'Shifting higher' : 'Shifting lower';
    return (
      <div key={dim.key} className={styles.trendCard}>
        <span className={styles.trendLabel}>{dim.label}</span>
        <div className={styles.trendValues}>
          <span className={styles.trendValue}>{prevValue} → {latestValue}</span>
          <span className={styles.trendChange}>{changeLabel}</span>
        </div>
      </div>
    );
  });
}
export default CognitiveFingerprint;
