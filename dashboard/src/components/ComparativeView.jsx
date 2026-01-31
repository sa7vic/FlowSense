import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './ComparativeView.module.css';
const ComparativeView = ({ sessions }) => {
  if (!sessions || sessions.length < 2) {
    return (
      <div className={styles.emptyState}>
        Need at least 2 sessions to show comparisons
      </div>
    );
  }

  const taskTypeData = groupByTaskType(sessions);
  
  const recentTrend = sessions.slice(-5).map((s, idx) => ({
    session: `Session ${sessions.length - 4 + idx}`,
    alignment: s.avg_alignment_score,
    taskType: s.task_type
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className={styles.tooltipValue}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Personal Comparisons</h2>
        <p className={styles.subtitle}>
          Your patterns over time — self-reflection only
        </p>
      </div>

      <div className={styles.section}>
        <h3>Task Type Patterns</h3>
        <p className={styles.sectionSubtitle}>
          How your attention varies by task context
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskTypeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
            <XAxis 
              dataKey="taskType" 
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '12px' }}
              label={{ value: 'Avg Alignment', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-text-secondary)' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgAlignment" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className={styles.insights}>
          {generateTaskInsights(taskTypeData)}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Recent Session Trend</h3>
        <p className={styles.sectionSubtitle}>
          Your last 5 sessions — observe adaptation
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={recentTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
            <XAxis 
              dataKey="session" 
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="alignment" fill="var(--color-aligned)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className={styles.trendAnalysis}>
          {analyzeTrend(recentTrend)}
        </div>
      </div>

      <div className={styles.ethicalNotice}>
        <h4>🔒 Privacy & Ethics</h4>
        <p>
          All comparisons are personal. Your data is never ranked against others, 
          shared publicly, or used for social comparison. This dashboard shows only 
          your patterns to help you understand your cognition.
        </p>
      </div>
    </div>
  );
};

function groupByTaskType(sessions) {
  const grouped = {};
  
  sessions.forEach(session => {
    const type = session.task_type || 'unknown';
    if (!grouped[type]) {
      grouped[type] = { scores: [], count: 0 };
    }
    grouped[type].scores.push(session.avg_alignment_score);
    grouped[type].count++;
  });

  return Object.entries(grouped).map(([taskType, data]) => ({
    taskType: formatTaskType(taskType),
    avgAlignment: data.scores.reduce((sum, s) => sum + s, 0) / data.count,
    sessionCount: data.count
  }));
}

function formatTaskType(type) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function generateTaskInsights(taskData) {
  if (taskData.length === 0) return null;

  const sorted = [...taskData].sort((a, b) => b.avgAlignment - a.avgAlignment);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  return (
    <div className={styles.insightBox}>
      <p>
        <strong>Strongest alignment:</strong> {highest.taskType} ({highest.avgAlignment.toFixed(1)} avg across {highest.sessionCount} session{highest.sessionCount !== 1 ? 's' : ''})
      </p>
      {sorted.length > 1 && (
        <p>
          <strong>Most challenging:</strong> {lowest.taskType} ({lowest.avgAlignment.toFixed(1)} avg across {lowest.sessionCount} session{lowest.sessionCount !== 1 ? 's' : ''})
        </p>
      )}
      <p className={styles.insightNote}>
        Note: These are descriptive patterns, not performance judgments. 
        Different tasks naturally require different cognitive approaches.
      </p>
    </div>
  );
}

function analyzeTrend(recentTrend) {
  if (recentTrend.length < 2) return null;

  const scores = recentTrend.map(s => s.alignment);
  const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
  const secondHalf = scores.slice(Math.ceil(scores.length / 2));
  
  const avgFirst = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
  
  const diff = avgSecond - avgFirst;
  
  let message = '';
  if (Math.abs(diff) < 3) {
    message = 'Your recent sessions show stable patterns. Consistency across sessions indicates reliable cognitive performance.';
  } else if (diff > 0) {
    message = `Your alignment has been shifting higher in recent sessions (+${diff.toFixed(1)} on average). This may reflect improved environmental setup, better task matching, or natural cognitive adaptation.`;
  } else {
    message = `Your recent sessions show a shift toward lower alignment (${diff.toFixed(1)} on average). This could indicate accumulated fatigue, task complexity changes, or environmental factors. Consider reviewing session timing and context.`;
  }

  return (
    <div className={styles.trendBox}>
      <p>{message}</p>
    </div>
  );
}

export default ComparativeView;
