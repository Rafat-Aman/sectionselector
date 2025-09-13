chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "courseRefresher") {
    chrome.storage.local.get("trackingTabId", (data) => {
      if (data.trackingTabId) {
        chrome.tabs.reload(data.trackingTabId, () => {
          // After reload, inject the content script
          chrome.scripting.executeScript({
            target: { tabId: data.trackingTabId },
            files: ['content.js']
          });
        });
      }
    });
  }
});

// Function to stop the alarm
function stopAlarm() {
  chrome.alarms.clear("courseRefresher", (wasCleared) => {
    if (wasCleared) {
      console.log("Course refresher alarm stopped.");
      chrome.storage.local.set({ isRunning: false, trackingTabId: null });
    }
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "stopAlarm") {
        stopAlarm();
    }
});