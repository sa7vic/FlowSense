let interactionCount = 0;
let sendInterval = null;
const events = ['keydown', 'mousedown', 'scroll', 'click'];
events.forEach(event => {
  document.addEventListener(event, () => {
    interactionCount++;
  }, { passive: true, capture: true });
});
function startTracking() {
  if (sendInterval) return;
  sendInterval = setInterval(() => {
    chrome.runtime.sendMessage({
      type: 'INTERACTION',
      data: { count: interactionCount }
    }).catch(() => {});
    interactionCount = 0;
  }, 10000);
}
chrome.storage.local.get('session', (data) => {
  if (data.session && !data.session.paused) {
    startTracking();
  }
});
chrome.storage.onChanged.addListener((changes) => {
  if (changes.session) {
    const session = changes.session.newValue;
    if (session && !session.paused) {
      startTracking();
    } else if (sendInterval) {
      clearInterval(sendInterval);
      sendInterval = null;
    }
  }
});