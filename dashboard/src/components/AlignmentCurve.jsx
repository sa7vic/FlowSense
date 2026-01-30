import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import styles from './AlignmentCurve.module.css';

const AlignmentCurve = ({ windows }) => {
  if (!windows || windows.length === 0) {
    return <div className={styles.emptyState}>No alignment data available</div>;
  }
  const data = windows.map((w, idx) => ({
    time: `${(idx * 0.5).toFixed(1)}m`,
    timeMinutes: idx * 0.5,
    alignment: w.alignment_score || 0,
    state: w.cognitive_state || 'ALIGNED'
  }));
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipTime}>{data.time}</p>
        <p className={styles.tooltipValue}>Alignment: {data.alignment?.toFixed(0) || 'N/A'}</p>
        <p className={styles.tooltipState}>{data.state}</p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Alignment Curve</h2>
        <p className={styles.subtitle}>
          Attention coherence over time — observe patterns, not peaks
        </p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="alignmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-line)" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="var(--color-chart-line)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
          <XAxis 
            dataKey="time" 
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: '12px' }}
            label={{ value: 'Alignment', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="alignment" 
            stroke="var(--color-chart-line)" 
            strokeWidth={2}
            fill="url(#alignmentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className={styles.insights}>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>Pattern</span>
          <span className={styles.insightValue}>{analyzePattern(data)}</span>
        </div>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>Volatility</span>
          <span className={styles.insightValue}>{calculateVolatility(data).toFixed(1)}</span>
        </div>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>Trend</span>
          <span className={styles.insightValue}>{analyzeTrend(data)}</span>
        </div>
      </div>
    </div>
  );
};

function analyzePattern(data) {
  const scores = data.map(d => d.alignment);
  const firstThird = scores.slice(0, Math.floor(scores.length / 3));
  const lastThird = scores.slice(-Math.floor(scores.length / 3));
  const avgFirst = average(firstThird);
  const avgLast = average(lastThird);
  if (avgFirst > avgLast + 10) return 'Declining attention';
  if (avgLast > avgFirst + 10) return 'Building momentum';
  return 'Stable attention';
}
function calculateVolatility(data) {
  const scores = data.map(d => d.alignment).filter(s => s != null);
  const avg = average(scores);
  const squareDiffs = scores.map(score => Math.pow(score - avg, 2));
  return Math.sqrt(average(squareDiffs));
}
function analyzeTrend(data) {
  const scores = data.map(d => d.alignment);
  const mid = Math.floor(scores.length / 2);
  const firstHalf = average(scores.slice(0, mid));
  const secondHalf = average(scores.slice(mid));
  const diff = secondHalf - firstHalf;
  if (Math.abs(diff) < 5) return 'Steady';
  return diff > 0 ? 'Improving' : 'Declining';
}
function average(arr) {
  if (!arr || arr.length === 0) return 0;
  const validValues = arr.filter(val => val != null && !isNaN(val));
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

export default AlignmentCurve;
