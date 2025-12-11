// Locked to Vanilla (index 0) - change this value to switch to a different expansion
var expansion = 0;

var expansionMap = [
  "Vanilla",
  "BurningCrusade",
  "WrathOfTheLichKing",
  "Cataclysm",
  "MistsOfPandaria",
  "WarlordsOfDraenor",
  "Legion",
  "BattleForAzeroth",
  "Shadowlands",
];

var audioPath = "../../../assets/apps/wow/audio";
var videoPath = "../../../assets/apps/wow/img/bg";
var logoPath = "../../../assets/apps/wow/img/ui/logos";

var verMap = [
  "Version 1.12.1 (5875) (Release)",
  "Version 2.4.3 (8606) (Release)",
  "Version 3.3.5 (12340) (Release)",
  "Version 4.3.4 (15595) (Release x86)",
  "Version 5.4.8 (18414) (Release x86)",
  "Version 6.2.0 (20173) (Release x64)",
  "Version 7.3.5 (26365) (Release x64)",
  "Version 8.3.7 (35662) (Release x64)",
  "Version 9.0.1 (35944) (Release x64)",
];

var dateMap = [
  "Sept 19 2006",
  "Jul 10 2008",
  "Jun 24 2010",
  "Feb 9 2011",
  "Jun 13 2014",
  "Jun 20 2015",
  "Apr 3 2018",
  "Aug 24 2020",
  "Oct 13 2020",
];

var buttonColorMap = [0, 0, 1, 0, 0, 0, 0, 0, 0];

var copyMap = [2006, 2008, 2010, 2011, 2014, 2015, 2018, 2020, 2020];

var audio = new Audio();
var buttonAudio = new Audio();
var audioInitialPlayback = false;
var queuePos = null;
var disconnected = false;

function init() {
  switchExpansion();

  // Trigger audio on ANY interaction (click, keydown, touchstart)
  document.addEventListener("click", waitForInteractionToPlayAudio, true);
  document.addEventListener("keydown", waitForInteractionToPlayAudio, true);
  document.addEventListener("touchstart", waitForInteractionToPlayAudio, true);

  // Also listen for message from parent window
  window.addEventListener("message", handleParentMessage);

  // Listen for audio pause/end to notify parent
  audio.addEventListener("pause", () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ action: "wowAudioStopped" }, "*");
    }
  });

  audio.addEventListener("ended", () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ action: "wowAudioStopped" }, "*");
    }
  });

  getPositionInQueue();
  setInterval(determineIfDisconnect, 8000);
}

function handleParentMessage(event) {
  if (event.data && event.data.action === "startAudio") {
    waitForInteractionToPlayAudio();
  } else if (event.data && event.data.action === "pauseAudio") {
    // Pause audio when another player starts
    if (audio && !audio.paused) {
      audio.pause();
    }
  }
}

function waitForInteractionToPlayAudio() {
  if (!audioInitialPlayback) {
    // First time initialization - get volume from slider
    var slider = document.getElementById("volumeSlider");
    var initialVolume = slider ? slider.value * 0.01 : 0.3; // Default to 0.3 if slider not found
    buttonAudio.volume = initialVolume;
    audio.volume = initialVolume;
    audio.loop = true;
    audio
      .play()
      .then(() => {
        audioInitialPlayback = true;
        // Notify parent window (wow.html) of playback start via message
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ action: "wowAudioPlaying" }, "*");
        }
      })
      .catch(() => {
        // Silent fail
      });
  } else if (audio.paused) {
    // Audio was paused (by another app), resume it
    audio
      .play()
      .then(() => {
        // Notify parent window (wow.html) of playback resume via message
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ action: "wowAudioPlaying" }, "*");
        }
      })
      .catch(() => {
        // Silent fail
      });
  }
}

function determineIfDisconnect() {
  if (!disconnected) {
    var rand = Math.random();
    if (rand < 0.75) getPositionInQueue();
  }
}

function getPositionInQueue() {
  var number;
  if (queuePos === null) {
    number = Math.floor(Math.random() * Math.floor(10000));
    queuePos = number;
  } else {
    number = Math.floor(queuePos - Math.random() * Math.floor(15));
    queuePos = number;

    if (queuePos < 3) {
      number = 0;
      queuePos = 0;
      doDisconnect();
    }
  }

  document.getElementById("queuePosition").innerHTML =
    "Position in Queue: " + number;
  getEstimatedTime(number);
}

function getEstimatedTime(qPos) {
  var time = Math.floor(
    Math.floor(
      qPos * 2 * 3 * 2 + (qPos * 2 * 3 * 3 - qPos * 2 * 3 * 2) * Math.random()
    ) * 0.01
  );
  document.getElementById("queueTime").innerHTML =
    "Estimated time: " + time + " min";
}

function doDisconnect() {
  hideQueue();
  showDisconnect();
  playButtonAudio(1);
  disconnected = true;
}

function manualChangeExpac() {
  // Expansion cycling disabled - locked to Vanilla
}

function switchExpansion() {
  if (disconnected) {
    disconnected = false;
    hideQueue();
    showDisconnect();
  }
  queuePos = null;
  getPositionInQueue();
  var bg = document.getElementById("background");
  var bgWebM = bg.querySelector("source:nth-child(1)");
  var bgMp4 = bg.querySelector("source:nth-child(2)");
  var logo = document.getElementById("logo");
  var version = document.getElementById("buildVersion");
  var date = document.getElementById("buildDate");
  var copyright = document.getElementById("copyrightText");

  bg.pause();
  audio.pause();
  var expName = expansionMap[expansion];
  audio.src = `${audioPath}/${expName}.ogg`;
  bgWebM.setAttribute("src", `${videoPath}/${expName}.webm`);
  bgMp4.setAttribute("src", `${videoPath}/${expName}.mp4`);
  logo.style.background = `url(${logoPath}/${expName}.png)`;
  version.textContent = verMap[expansion];
  date.textContent = dateMap[expansion];
  copyright.textContent = `Copyright 2004-${copyMap[expansion]} Blizzard Entertainment. All Right Reserved.`;
  setButtonColors(buttonColorMap[expansion]);

  bg.load();
  bg.play();
  audio.play();
}

function playButtonAudio(index) {
  buttonAudio.pause();
  buttonAudio.currentTime = 0;

  if (index === 0)
    buttonAudio.src = "../../../assets/apps/wow/audio/ui/button_click.ogg";
  else
    buttonAudio.src = "../../../assets/apps/wow/audio/ui/button_click_big.ogg";

  buttonAudio.play().catch(() => {
    // Ignore play() errors (e.g., AbortError from rapid pause/play)
  });
}

function hideQueue() {
  var x = document.getElementById("queue");
  if (x.style.display === "none") x.style.display = "flex";
  else x.style.display = "none";
}

function showDisconnect() {
  var x = document.getElementById("disconnectBox");
  if (x.style.display === "none") x.style.display = "flex";
  else x.style.display = "none";
}

function resetQueue() {
  disconnected = false;
  showDisconnect();
  hideQueue();
}

function showSettings() {
  var opt = document.getElementById("options");
  if (opt.style.display == "none") {
    opt.style.display = "flex";
  } else {
    opt.style.display = "none";
  }
}

function adjustVolume() {
  var slider = document.getElementById("volumeSlider");
  var val = slider.value * 0.01;
  audio.volume = val;
  buttonAudio.volume = val;
  document.getElementById("background").volume = val;
}

function setButtonColors(index) {
  var quitButton = document.getElementById("quitButton");
  var optButton = document.getElementById("optButton");
  var realmListButton = document.getElementById("realmListButton");
  var disconButton = document.getElementById("disconButton");
  switch (index) {
    case 0:
      quitButton.className = "button";
      optButton.className = "button";
      realmListButton.className = "button";
      disconButton.className = "button";
      break;

    case 1:
      quitButton.className = "button_b";
      optButton.className = "button_b";
      realmListButton.className = "button_b";
      disconButton.className = "button_b";
      break;
  }
}

function requestCloseWindow() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ action: "closeWindow" }, "*");
  }
}
