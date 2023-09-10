let tabIdToReload;
let reloadInterval;
let isTimerRunning = false;
let countdownInterval;
let timeRemaining;

function startCountdown() {
  clearInterval(countdownInterval);
  timeRemaining = reloadInterval / 1000; // Convert to seconds

  countdownInterval = setInterval(function() {
      timeRemaining--;
      if (timeRemaining <= 0) {
          clearInterval(countdownInterval);
      }
      // Send updated timeRemaining to the popup, if it's open
      try {
        chrome.runtime.sendMessage({ action: "updateCountdown", timeRemaining: timeRemaining });
      } catch (error) {
        console.log("Popup is not open");
      }
  }, 1000);
}

function stopCountdown() {
    clearInterval(countdownInterval);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setInterval") {
        isTimerRunning = true;
        reloadInterval = message.interval * 1000; // Convert to milliseconds
        startCountdown();
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            tabIdToReload = tabs[0].id;
            chrome.alarms.create("reloadTab", { delayInMinutes: reloadInterval / 60000, periodInMinutes: reloadInterval / 60000 });
        });
    } else if (message.action === "stopTimer") {
        isTimerRunning = false;
        stopCountdown();
        chrome.alarms.clear("reloadTab");
    }
});

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        if (message.action === "popupOpen") {
            port.postMessage({ action: "updateUI", isTimerRunning: isTimerRunning, timeRemaining: timeRemaining });
        }
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "reloadTab") {
        chrome.tabs.reload(tabIdToReload);
        startCountdown(); // Reset the countdown
    }
});
