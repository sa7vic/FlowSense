const TASK_LABELS = {
  CODING: 'Coding',
  VIDEO_LEARNING: 'Learning',
  TYPING: 'Writing'
};
const STATE_LABELS = {
  ALIGNED: 'Aligned',
  DRIFT: 'Drifting',
  IDLE: 'Idle',
  FATIGUE: 'Fatigue',
  RECOVERY: 'Recovering'
};
const $ = id => document.getElementById(id);
const startScreen = $('start-screen');
const activeScreen = $('active-screen');
const timeupOverlay = $('timeup-overlay');
const errorEl = $('error');
let updateInterval = null;
document.addEventListener('DOMContentLoaded', async () => {
  const state = await getState();
  if (state.active) {
    showActiveScreen(state);
  } else {
    showStartScreen();
  }
  setupListeners();
});
async function getState() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Lost connection to background script');
        resolve({ active: false });
      } else {
        resolve(response || { active: false });
      }
    });
  });
}
function setupListeners() {
  $('start-form').addEventListener('submit', handleStart);
  $('pause-btn').addEventListener('click', handlePause);
  $('end-btn').addEventListener('click', handleEnd);
  $('extend-btn').addEventListener('click', handleExtend);
  $('view-dashboard').addEventListener('click', handleViewDashboard);
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'STATE_UPDATE') {
      updateUI(msg.data);
    }
  });
}

async function handleStart(e) {
  e.preventDefault();
  showError('');
  const taskType = $('task-type').value;
  const duration = parseInt($('duration').value);
  if (duration < 5 || duration > 120) {
    showError('Duration must be 5-120 minutes');
    return;
  }
  const res = await new Promise(resolve => {
    chrome.runtime.sendMessage({
      type: 'START_SESSION',
      data: { taskType, duration }
    }, resolve);
  });
  if (res.success) {
    const state = await getState();
    showActiveScreen(state);
  } else {
    showError(res.error || 'Failed to connect to backend');
  }
}
async function handlePause() {
  chrome.runtime.sendMessage({ type: 'PAUSE_SESSION' });
  const state = await getState();
  updateUI(state);
}
async function handleEnd() {
  if (!confirm('End session?')) return;
  const res = await new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'END_SESSION' }, resolve);
  });
  if (res.success && res.sessionId) {
    openDashboard(res.sessionId);
  }
  showStartScreen();
}

function handleExtend() {
  chrome.runtime.sendMessage({ type: 'EXTEND_SESSION', minutes: 5 });
  timeupOverlay.classList.add('hidden');
}

async function handleViewDashboard() {
  const res = await new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'END_SESSION' }, resolve);
  });
  if (res.sessionId) {
    openDashboard(res.sessionId);
  }
  showStartScreen();
}

function openDashboard(sessionId) {
  chrome.tabs.create({
    url: `http://localhost:3000/session/${sessionId}`
  });
}

function showStartScreen() {
  startScreen.classList.remove('hidden');
  activeScreen.classList.add('hidden');
  timeupOverlay.classList.add('hidden');
  stopUpdateInterval();
}

function showActiveScreen(state) {
  startScreen.classList.add('hidden');
  activeScreen.classList.remove('hidden');
  $('task-badge').textContent = TASK_LABELS[state.taskType] || state.taskType;
  $('time-total').textContent = `/ ${state.duration}:00`;
  updateUI(state);
  startUpdateInterval();
}

function updateUI(state) {
  if (!state.active) {
    showStartScreen();
    return;
  }
  const elapsed = state.elapsed || 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  $('time-elapsed').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  const total = state.duration * 60;
  const progress = Math.min(elapsed / total, 1);
  const offset = 264 * (1 - progress);
  const ring = $('timer-ring');
  ring.style.strokeDashoffset = offset;
  const stateClass = (state.state || 'aligned').toLowerCase();
  ring.className = 'timer-ring ' + stateClass;
  $('state-label').textContent = STATE_LABELS[state.state] || 'Aligned';
  $('state-box').className = 'state-box ' + stateClass;
  $('score-value').textContent = Math.round(state.alignmentScore || 0);
  $('stability-value').textContent = Math.round((state.contextStability || 0) * 100) + '%';
  $('pause-text').textContent = state.paused ? 'Resume' : 'Pause';
  if (state.timeUp) {
    timeupOverlay.classList.remove('hidden');
  } else {
    timeupOverlay.classList.add('hidden');
  }
}

function startUpdateInterval() {
  stopUpdateInterval();
  updateInterval = setInterval(async () => {
    try {
      const state = await getState();
      if (state && state.active) {
        updateUI(state);
      } else {
        stopUpdateInterval();
        showStartScreen();
      }
    } catch (err) {
      console.error('Failed to update UI:', err);
      stopUpdateInterval();
    }
  }, 1000);
}

function stopUpdateInterval() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

function showError(msg) {
  errorEl.textContent = msg;
}