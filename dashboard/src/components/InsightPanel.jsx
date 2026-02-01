import React, { useState } from 'react';
import styles from './InsightPanel.module.css';

const InsightPanel = ({ analysis }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!analysis) {
    return (
      <div className={styles.emptyState}>
        <p>No AI insights available yet.</p>
        <p style={{ fontSize: '0.9em', marginTop: '8px', opacity: 0.7 }}>
          AI analysis is generated after the session ends.
        </p>
      </div>
    );
  }

  if (!analysis.insights) {
    return (
      <div className={styles.emptyState}>
        <p>Insights are being generated...</p>
      </div>
    );
  }

  const sections = parseAnalysisSections(analysis.insights);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Session Reflection</h2>
        <p className={styles.subtitle}>
          AI-generated cognitive analysis — observations, not judgments
        </p>
        {analysis.timestamp && (
          <span className={styles.timestamp}>
            Generated: {new Date(analysis.timestamp).toLocaleString()}
          </span>
        )}
      </div>

      <div className={styles.content}>
        {sections.map((section, idx) => (
          <InsightSection 
            key={idx}
            section={section}
            isExpanded={expandedSection === idx}
            onToggle={() => setExpandedSection(expandedSection === idx ? null : idx)}
          />
        ))}
      </div>

      {analysis.analytics_metadata && (
        <div className={styles.metadata}>
          <h3>Session Analytics</h3>
          <div className={styles.metadataGrid}>
            <MetadataItem 
              label="Peak Performance"
              value={analysis.analytics_metadata.peak_window || 'N/A'}
            />
            <MetadataItem 
              label="Recovery Time"
              value={analysis.analytics_metadata.avg_recovery_time 
                ? `${analysis.analytics_metadata.avg_recovery_time.toFixed(0)}s avg` 
                : 'N/A'}
            />
            <MetadataItem 
              label="Volatility"
              value={analysis.analytics_metadata.volatility 
                ? analysis.analytics_metadata.volatility.toFixed(1) 
                : 'N/A'}
            />
            <MetadataItem 
              label="Interaction Pattern"
              value={analysis.analytics_metadata.interaction_trend || 'N/A'}
            />
            <MetadataItem 
              label="Tab Switching"
              value={analysis.analytics_metadata.tab_switch_pattern || 'N/A'}
            />
            <MetadataItem 
              label="Distraction Rate"
              value={analysis.analytics_metadata.distraction_percentage !== undefined
                ? `${analysis.analytics_metadata.distraction_percentage.toFixed(1)}%`
                : 'N/A'}
            />
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.disclaimer}>
          💭 This analysis is descriptive, not prescriptive. Use it to understand patterns, 
          not to enforce behaviors. Your cognition is observed, not judged.
        </p>
      </div>
    </div>
  );
};

const InsightSection = ({ section, isExpanded, onToggle }) => {
  const hasContent = section.content && section.content.trim().length > 0;

  const renderText = (text) => {
    // Convert **bold** to <strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderContent = (content) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, idx) => {
      const trimmed = paragraph.trim();
      
      if (trimmed.startsWith('*   ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter(line => line.trim().startsWith('*'));
        return (
          <ul key={idx} className={styles.bulletList}>
            {items.map((item, i) => (
              <li key={i}>{renderText(item.replace(/^\*\s+/, '').trim())}</li>
            ))}
          </ul>
        );
      }
      
      return (
        <p key={idx} className={styles.paragraph}>
          {renderText(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className={styles.section}>
      <button 
        className={styles.sectionHeader}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className={styles.sectionTitle}>{section.title}</span>
        <span className={styles.sectionToggle}>
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      
      {isExpanded && hasContent && (
        <div className={styles.sectionContent}>
          {renderContent(section.content)}
        </div>
      )}
    </div>
  );
};

const MetadataItem = ({ label, value }) => (
  <div className={styles.metadataItem}>
    <span className={styles.metadataLabel}>{label}</span>
    <span className={styles.metadataValue}>{value}</span>
  </div>
);

function parseAnalysisSections(insightsText) {
  if (!insightsText) return [];
  const lines = insightsText.split('\n');
  const sections = [];
  let currentSection = null;

  lines.forEach(line => {
    const headerMatch = line.match(/^###\s+(.+)$/);
    
    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: headerMatch[1].trim(),
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    } else if (line.trim()) {
      if (!currentSection) {
        currentSection = {
          title: 'Overview',
          content: line + '\n'
        };
      }
    }
  });
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections.filter(s => s.content.trim());
}

export default InsightPanel;
