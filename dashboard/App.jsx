import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import SessionTimeline from './components/SessionTimeline';
import AlignmentCurve from './components/AlignmentCurve';
import DriftReplay from './components/DriftReplay';
import FatigueMap from './components/FatigueMap';
import InsightPanel from './components/InsightPanel';
import styles from './App.module.css';

const API_BASE = 'http://127.0.0.1:5000/api';

function App() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/session\/([^/]+)/);
    
    if (match) {
      const sessionId = match[1];
      loadSessionDetails(sessionId);
    }
    
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions/all`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data.sessions || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Unable to load sessions. Please ensure the backend is running.');
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId) => {
    setLoading(true);
    try {
      const [sessionRes, analysisRes] = await Promise.all([
        fetch(`${API_BASE}/session/${sessionId}`),
        fetch(`${API_BASE}/analysis/${sessionId}`)
      ]);

      if (!sessionRes.ok) throw new Error('Failed to fetch session');

      const sessionData = await sessionRes.json();
      
      let analysisData = null;
      if (analysisRes.ok) {
        try {
          analysisData = await analysisRes.json();
        } catch (e) {
          console.warn('Failed to parse analysis data:', e);
        }
      }

      setSessionDetails({
        ...sessionData,
        analysis: analysisData?.analysis || null
      });
      setSelectedSession(sessionId);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load session details:', err);
      setError('Unable to load session details.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className={styles.app}>
          <Header />
          <main className={styles.main}>
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading sessions...</p>
            </div>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className={styles.app}>
        <Header />
        
        <main className={styles.main}>
          <div className={styles.container}>
            
            {error && (
              <div className={styles.errorBanner}>
                {error}
                <button onClick={loadSessions} className={styles.retryBtn}>Retry</button>
              </div>
            )}

            {!selectedSession && (
              <>
                <section className={styles.intro}>
                  <h2>Your Focus Sessions</h2>
                  <p>Click on any session to view detailed analysis</p>
                </section>

                <div className={styles.sessionList}>
                  {sessions.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No sessions yet. Start a focus session from the browser extension!</p>
                    </div>
                  ) : (
                    sessions.map(session => (
                      <div 
                        key={session.id} 
                        className={styles.sessionCard}
                        onClick={() => loadSessionDetails(session.id)}
                      >
                        <div className={styles.sessionHeader}>
                          <h3>{session.task_type}</h3>
                          <span className={styles.sessionDate}>
                            {formatDate(session.start_time)}
                          </span>
                        </div>
                        <div className={styles.sessionStats}>
                          <div className={styles.stat}>
                            <span className={styles.statLabel}>Duration</span>
                            <span className={styles.statValue}>
                              {formatDuration(session.intended_duration || 0)}
                            </span>
                          </div>
                          <div className={styles.stat}>
                            <span className={styles.statLabel}>Avg Alignment</span>
                            <span className={styles.statValue}>
                              {Math.round(session.avg_alignment_score || 0)}
                            </span>
                          </div>
                          <div className={styles.stat}>
                            <span className={styles.statLabel}>Drift Count</span>
                            <span className={styles.statValue}>
                              {session.total_drift_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {selectedSession && !loading && sessionDetails && (
              <>
                <div className={styles.backButton} onClick={() => setSelectedSession(null)}>
                  ← Back to Sessions
                </div>

                <div className={styles.sessionHeader}>
                  <h2>{sessionDetails.session.task_type} Session</h2>
                  <span className={styles.sessionId}>{selectedSession}</span>
                </div>

                <SessionTimeline 
                  windows={sessionDetails.windows || []}
                  sessionInfo={sessionDetails.session}
                />

                <div className={styles.grid2Col}>
                  <AlignmentCurve windows={sessionDetails.windows || []} />
                  <FatigueMap windows={sessionDetails.windows || []} />
                </div>

                <DriftReplay windows={sessionDetails.windows || []} />

                <InsightPanel analysis={sessionDetails.analysis} />
              </>
            )}

            {selectedSession && loading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Loading session details...</p>
              </div>
            )}
          </div>
        </main>

        <footer className={styles.footer}>
          <p>FlowSense — Cognitive awareness for better focus</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
