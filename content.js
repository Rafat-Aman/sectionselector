chrome.storage.local.get(['courseId', 'section', 'reloadCount'], (result) => {
  const { courseId, section } = result;
  let reloadCount = result.reloadCount || 0;

  // Increment reload count
  reloadCount++;
  chrome.storage.local.set({ reloadCount });

  if (courseId && section) {
    const courseRows = document.querySelectorAll('table tbody tr'); // Simplified selector
    let courseFound = false;

    for (const row of courseRows) {
      const courseCell = row.querySelector('td:first-child');
      if (courseCell) {
        const courseText = courseCell.textContent.trim();
        const expectedText = `${courseId}.${section}`;

        if (courseText === expectedText) {
          courseFound = true;
          const availabilityCell = row.querySelector('td:nth-child(2)');
          const availabilityText = availabilityCell.textContent.trim();
          const match = availabilityText.match(/(\d+)\((\d+)\)/);

          if (match) {
            const enrolled = parseInt(match[1], 10);
            const capacity = parseInt(match[2], 10);

            if (enrolled < capacity) {
              // Seat available! Click it and stop the alarm.
              courseCell.click();
              chrome.runtime.sendMessage({ action: "stopAlarm" });
            }
          }
          break;
        }
      }
    }
    console.log(`Check #${reloadCount}: Course ${courseId}.${section}. Found: ${courseFound}`);
  }
});