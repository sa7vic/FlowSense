import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './FatigueMap.module.css';

const FatigueMap = ({ windows }) => {
  if (!windows || windows.length === 0) {
    return <div className={styles.emptyState}>No fatigue data available</div>;
  }

  const data = windows.map((w, idx) => {
    const isFatigue = w.cognitive_state === 'FATIGUE';
    const engagementIntensity = w.interaction_count || 0;
    
    return {
      window: w.window_num || idx + 1,
      time: `${(idx * 0.5).toFixed(1)}m`,
      intensity: engagementIntensity,
      state: w.cognitive_state || 'ALIGNED',
      isFatigue,
      alignment: w.alignment_score || 0
    };
  });

  const fatigueWindows = data.filter(d => d.isFatigue);
  const fatigueOnset = fatigueWindows.length > 0 ? fatigueWindows[0].time : 'None detected';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const avgFirstHalf = average(firstHalf.map(d => d.intensity));
  const avgSecondHalf = average(secondHalf.map(d => d.intensity));
  const trend = avgSecondHalf < avgFirstHalf * 0.8 ? 'Declining' : 'Stable';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;
    
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipTime}>{data.time}</p>
        <p className={styles.tooltipValue}>Interactions: {data.intensity}</p>
        <p className={styles.tooltipState}>{data.state}</p>
        <p className={styles.tooltipAlignment}>Alignment: {data.alignment?.toFixed(0)}</p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Engagement Density</h2>
        <p className={styles.subtitle}>
          Interaction patterns reveal cognitive load accumulation
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
          <XAxis 
            dataKey="time" 
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: '11px' }}
            interval={Math.floor(data.length / 10)}
          />
          <YAxis 
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: '11px' }}
            label={{ value: 'Interactions', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="intensity" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={getCellColor(entry.state)}
                opacity={entry.isFatigue ? 0.9 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.insights}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Fatigue Onset</span>
          <span className={styles.metricValue}>{fatigueOnset}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Engagement Trend</span>
          <span className={styles.metricValue}>{trend}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Fatigue Windows</span>
          <span className={styles.metricValue}>{fatigueWindows.length}</span>
        </div>
      </div>

      {fatigueWindows.length > 0 && (
        <div className={styles.interpretation}>
          <h3>Interpretation</h3>
          <p>{interpretFatigue(fatigueWindows, data)}</p>
        </div>
      )}
    </div>
  );
};

function getCellColor(state) {
  const colorMap = {
    'ALIGNED': 'var(--color-aligned)',
    'DRIFT': 'var(--color-drift)',
    'FATIGUE': 'var(--color-fatigue)',
    'IDLE': 'var(--color-idle)',
    'RECOVERY': 'var(--color-recovery)'
  };
  return colorMap[state] || 'var(--color-chart-line)';
}

function average(arr) {
  if (!arr || arr.length === 0) return 0;
  const validValues = arr.filter(val => val != null && !isNaN(val));
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

function interpretFatigue(fatigueWindows, allData) {
  const fatigueStart = fatigueWindows[0].window;
  const totalWindows = allData.length;
  const percentageIntoSession = (fatigueStart / totalWindows) * 100;

  if (percentageIntoSession < 30) {
    return `Fatigue appeared early (${percentageIntoSession.toFixed(0)}% into session). This may indicate insufficient pre-session recovery, task complexity mismatch, or accumulated cognitive debt from prior work. Consider starting with lighter tasks or ensuring adequate rest between sessions.`;
  }
  
  if (percentageIntoSession > 70) {
    return `Fatigue emerged late in session (${percentageIntoSession.toFixed(0)}% point). This is a natural response to sustained effort. The session duration aligned well with cognitive capacity. Consider maintaining similar session lengths.`;
  }
  
  return `Fatigue onset at ${percentageIntoSession.toFixed(0)}% of session duration. This represents a moderate cognitive endurance pattern. Gradual extension of focus blocks may increase sustained attention capacity over time.`;
}

export default FatigueMap;
