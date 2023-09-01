let port = chrome.runtime.connect({ name: "popup" });
let countdownInterval;

document.getElementById("setInterval").addEventListener("click", function(){
    let interval = document.getElementById("interval").value;
    chrome.runtime.sendMessage({ action: "setInterval", interval: interval });
    showTimerIndicator();
});

document.getElementById("stopTimer").addEventListener("click", function(){
    chrome.runtime.sendMessage({ action: "stopTimer" });
    hideTimerIndicator();
});

function showTimerIndicator() {
    document.getElementById("timerIndicator").style.display = "block";
    document.getElementById("stopTimer").style.display = "block";
    document.getElementById("countdown").style.display = "block";
}

function hideTimerIndicator() {
    document.getElementById("timerIndicator").style.display = "none";
    document.getElementById("stopTimer").style.display = "none";
    document.getElementById("countdown").style.display = "none";
    clearInterval(countdownInterval); // Clear any existing countdown
}

function updateCountdown(seconds) {
    document.getElementById("timeRemaining").innerText = seconds;
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(function() {
        seconds--;
        document.getElementById("timeRemaining").innerText = seconds;
        if (seconds <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

// Listening to messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateCountdown") {
      updateCountdown(message.timeRemaining);
  }
});

port.postMessage({ action: "popupOpen" });

port.onMessage.addListener((message) => {
    if (message.action === "updateUI") {
        if (message.isTimerRunning) {
            showTimerIndicator();
        } else {
            hideTimerIndicator();
        }

        if (message.timeRemaining) {
            updateCountdown(message.timeRemaining);
        }
    }
});
