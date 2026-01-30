const API_BASE = 'http://localhost:5000/api';
const WINDOW_INTERVAL = 30000;
let session = null;
let windowData = {
  interactionCount: 0,
  activeSeconds: 0,
  idleSeconds: 0,
  tabSwitchCount: 0
};
let currentContext = 'neutral';
let lastActiveTime = Date.now();
let windowTimer = null;
let isUserActive = true;

const STATE_COLORS = {
  ALIGNED: '#10b981',
  DRIFT: '#f59e0b',
  IDLE: '#6b7280',
  FATIGUE: '#3b82f6',
  RECOVERY: '#8b5cf6'
};

importScripts('utils/categorizer.js');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'START_SESSION':
      startSession(msg.data).then(sendResponse);
      return true;

    case 'PAUSE_SESSION':
      pauseSession();
      sendResponse({ success: true, paused: session?.paused });
      break;

    case 'END_SESSION':
      endSession().then(sendResponse);
      return true;

    case 'EXTEND_SESSION':
      extendSession(msg.minutes);
      sendResponse({ success: true });
      break;

    case 'GET_STATE':
      sendResponse(getState());
      break;

    case 'INTERACTION':
      handleInteraction(msg.data);
      sendResponse({ success: true });
      break;
  }
});

async function startSession(data) {
  try {
    const res = await fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_type: data.taskType,
        intended_duration_min: data.duration
      })
    });
    if (!res.ok) throw new Error('Backend error');
    const result = await res.json();
    session = {
      id: result.session_id,
      taskType: data.taskType,
      duration: data.duration,
      startTime: Date.now(),
      paused: false,
      pausedTime: 0,
      state: 'ALIGNED',
      alignmentScore: 100,
      contextStability: 1.0,
      timeUp: false
    };
    resetWindowData();
    startWindowTimer();
    updateCurrentTab();
    updateIcon('ALIGNED');
    chrome.storage.local.set({ session });
    return { success: true, sessionId: session.id };
  } catch (err) {
    console.error('Start session failed:', err);
    return { success: false, error: 'Cannot connect to backend' };
  }
}

function pauseSession() {
  if (!session) return;
  session.paused = !session.paused;
  if (session.paused) {
    session.pauseStart = Date.now();
    stopWindowTimer();
    updateIcon('IDLE');
  } else {
    session.pausedTime += Date.now() - session.pauseStart;
    startWindowTimer();
    updateIcon(session.state);
  }
  chrome.storage.local.set({ session });
  broadcastState();
}
async function endSession() {
  if (!session) return { success: false };
  stopWindowTimer();
  try {
    await fetch(`${API_BASE}/session/${session.id}/end`, {
      method: 'POST'
    });
  } catch (err) {
    console.error('End session API failed:', err);
  }
  const sessionId = session.id;
  session = null;
  resetWindowData();
  updateIcon(null);
  chrome.storage.local.remove('session');
  return { success: true, sessionId };
}

function extendSession(minutes) {
  if (!session) return;
  session.duration += minutes;
  session.timeUp = false;
  startWindowTimer();
  chrome.storage.local.set({ session });
  broadcastState();
}

function getState() {
  if (!session) return { active: false };
  const elapsed = getElapsedSeconds();
  const remaining = (session.duration * 60) - elapsed;
  return {
    active: true,
    paused: session.paused,
    timeUp: session.timeUp,
    taskType: session.taskType,
    duration: session.duration,
    elapsed,
    remaining: Math.max(0, remaining),
    state: session.state,
    alignmentScore: session.alignmentScore,
    contextStability: session.contextStability
  };
}
function handleInteraction(data) {
  if (!session || session.paused) return;

  const count = data.count || 0;
  windowData.interactionCount += count;
  if (count > 0) {
    lastActiveTime = Date.now();
    isUserActive = true;
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!session || session.paused) return;
  windowData.tabSwitchCount++;
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updateContext(tab.url);
  } catch (err) {}
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!session || session.paused) return;
  if (changeInfo.url && tab.active) {
    updateContext(changeInfo.url);
  }
});

function updateContext(url) {
  if (!url) return;
  const result = categorizeURL(url);
  currentContext = result.category;
  if (session) {
    session.lastContextScore = result.score;
    session.lastContextConfidence = result.confidence;
  }
}

async function updateCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) updateContext(tab.url);
  } catch (err) {}
}
let activeTimeTracker = null;
function startWindowTimer() {
  stopWindowTimer();
  windowTimer = setInterval(processWindow, WINDOW_INTERVAL);
  if (!activeTimeTracker) {
    activeTimeTracker = setInterval(trackActiveTime, 1000);
  }
}

function stopWindowTimer() {
  if (windowTimer) {
    clearInterval(windowTimer);
    windowTimer = null;
  }
}

function trackActiveTime() {
  if (!session || session.paused) return;
  const now = Date.now();
  const idleThreshold = 5000;
  if (now - lastActiveTime > idleThreshold) {
    isUserActive = false;
    windowData.idleSeconds++;
  } else {
    windowData.activeSeconds++;
  }
  const elapsed = getElapsedSeconds();
  if (elapsed >= session.duration * 60 && !session.timeUp) {
    session.timeUp = true;
    stopWindowTimer();
    chrome.storage.local.set({ session });
    broadcastState();
  }
}

async function processWindow() {
  if (!session || session.paused || session.timeUp) return;
  const totalSeconds = windowData.activeSeconds + windowData.idleSeconds;
  if (totalSeconds < 20) {
    console.warn('FlowSense: Window too short, skipping');
    resetWindowData();
    return;
  }
  const interactionCount = Math.min(windowData.interactionCount, totalSeconds * 5);
  const activeSeconds = Math.max(1, Math.min(windowData.activeSeconds, 30));
  const idleSeconds = Math.max(0, Math.min(windowData.idleSeconds, 30));
  const payload = {
    timestamp: Date.now(),
    active_tab_category: currentContext,
    interaction_count: interactionCount,
    active_seconds: activeSeconds,
    idle_seconds: idleSeconds,
    tab_switch_count: windowData.tabSwitchCount,
    context_score: session.lastContextScore || 50,
    context_confidence: session.lastContextConfidence || 0.5
  };
  resetWindowData();
  try {
    const res = await fetch(`${API_BASE}/session/${session.id}/window`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      session.state = (data.cognitive_state || session.state).toString().toUpperCase();
      session.alignmentScore = data.alignment_score ?? session.alignmentScore;
      session.contextStability = data.context_stability ?? session.contextStability;
      if (data.confidence !== undefined) {
        session.confidence = data.confidence;
      }
      updateIcon(session.state);
      chrome.storage.local.set({ session });
      broadcastState();
    }
  } catch (err) {
    console.error('Window API failed:', err);
  }
}

function resetWindowData() {
  windowData = {
    interactionCount: 0,
    activeSeconds: 0,
    idleSeconds: 0,
    tabSwitchCount: 0
  };
}
function updateIcon(state) {
  if (!state) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }
  const color = STATE_COLORS[state] || '#6b7280';
  const badges = {
    ALIGNED: '✓',
    DRIFT: '!',
    IDLE: '○',
    FATIGUE: '~',
    RECOVERY: '↑'
  };
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text: badges[state] || '' });
}

function broadcastState() {
  try {
    chrome.runtime.sendMessage({ type: 'STATE_UPDATE', data: getState() }, (response) => {
      if (chrome.runtime.lastError) {
      }
    });
  } catch (err) {
  }
}

function getElapsedSeconds() {
  if (!session) return 0;
  let elapsed = Date.now() - session.startTime;
  if (session.paused && session.pauseStart) {
    elapsed -= (Date.now() - session.pauseStart);
  }
  elapsed -= session.pausedTime || 0;
  return Math.floor(elapsed / 1000);
}

chrome.storage.local.get('session', (data) => {
  if (data.session) {
    session = data.session;
    if (!session.paused && !session.timeUp) {
      startWindowTimer();
      updateCurrentTab();
    }
    updateIcon(session.state);
  }
});
