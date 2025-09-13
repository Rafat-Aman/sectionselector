document.addEventListener('DOMContentLoaded', () => {
  const courseIdInput = document.getElementById('courseId');
  const sectionInput = document.getElementById('section');
  const delayInput = document.getElementById('delay');
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const statusDisplay = document.getElementById('status');
  const reloadCountDisplay = document.getElementById('reloadCount');

  // Load saved state when popup opens
  chrome.storage.local.get(['courseId', 'section', 'delay', 'isRunning', 'reloadCount'], (data) => {
    if (data.courseId) courseIdInput.value = data.courseId;
    if (data.section) sectionInput.value = data.section;
    if (data.delay) delayInput.value = data.delay;
    updateStatus(data.isRunning || false, data.reloadCount || 0);
  });

  startButton.addEventListener('click', () => {
    const courseId = courseIdInput.value.toUpperCase();
    const section = sectionInput.value;
    const delay = parseInt(delayInput.value, 10);

    if (courseId && section && delay > 0) {
      chrome.storage.local.set({ courseId, section, delay, isRunning: true, reloadCount: 0 }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0].id;
          chrome.storage.local.set({ trackingTabId: tabId });
          // Create an alarm that fires after 'delay' seconds and then repeats
          chrome.alarms.create("courseRefresher", {
            delayInMinutes: delay / 60,
            periodInMinutes: delay / 60
          });
          updateStatus(true, 0);
          // Run the script immediately without waiting for the first delay
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
        });
      });
    } else {
      alert('Please fill in all fields correctly.');
    }
  });

  stopButton.addEventListener('click', () => {
    chrome.alarms.clear("courseRefresher", (wasCleared) => {
      if (wasCleared) console.log("Refresher stopped by user.");
    });
    chrome.storage.local.set({ isRunning: false, trackingTabId: null });
    updateStatus(false);
  });

  function updateStatus(isRunning, count) {
    statusDisplay.textContent = isRunning ? 'Running' : 'Idle';
    statusDisplay.style.color = isRunning ? 'green' : 'red';
    if (count !== undefined) {
      reloadCountDisplay.textContent = count;
    }
  }

  // Keep popup display updated
  setInterval(() => {
     chrome.storage.local.get(['isRunning', 'reloadCount'], (data) => {
        updateStatus(data.isRunning, data.reloadCount);
     });
  }, 1000);
});