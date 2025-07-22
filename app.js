const btnNo = document.getElementById("btn-no");
const btnYes = document.getElementById("btn-yes");
const leaderboardDiv = document.getElementById("leaderboard");
const timerDiv = document.getElementById("timer");
const usernameInput = document.getElementById("username");
const btnAddUser = document.getElementById("btn-add-user");
const choiceSection = document.getElementById("choice-section");

const STORAGE_KEY = "antigooning-challenge-data";
const CHOICE_KEY = "antigooning-challenge-choice"; // stores today's choice per user

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let today = new Date();
today.setHours(0,0,0,0); // normalize to midnight

// Helper: Format time diff to HH:MM:SS
function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let h = Math.floor(totalSeconds / 3600);
  let m = Math.floor((totalSeconds % 3600) / 60);
  let s = totalSeconds % 60;
  return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// Next day start time
function getNextDay() {
  let d = new Date();
  d.setHours(24,0,0,0);
  return d;
}

// Check if user answered today
function answeredToday(username) {
  let choiceData = JSON.parse(localStorage.getItem(CHOICE_KEY)) || {};
  if (!choiceData[username]) return false;
  return choiceData[username] === today.getTime();
}

// Save today's choice for user
function saveChoice(username, madeGoon) {
  let choiceData = JSON.parse(localStorage.getItem(CHOICE_KEY)) || {};
  choiceData[username] = today.getTime();
  localStorage.setItem(CHOICE_KEY, JSON.stringify(choiceData));
  
  if (!data[username]) {
    data[username] = {days: 0, stopped: false};
  }
  if (madeGoon) {
    data[username].stopped = true;
  } else {
    if (!data[username].stopped) {
      data[username].days++;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderLeaderboard();
  updateButtons();
}

// Add new user
btnAddUser.onclick = () => {
  let name = usernameInput.value.trim();
  if (name === "") {
    alert("Βάλε όνομα χρήστη!");
    return;
  }
  if (!data[name]) {
    data[name] = {days: 0, stopped: false};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    usernameInput.value = "";
    renderLeaderboard();
  } else {
    alert("Ο χρήστης υπάρχει ήδη!");
  }
}

// Render leaderboard
function renderLeaderboard() {
  leaderboardDiv.innerHTML = "";
  let entries = Object.entries(data);
  entries.sort((a,b) => b[1].days - a[1].days);
  for (let [user, info] of entries) {
    let div = document.createElement("div");
    div.className = "user-row";
    div.textContent = `${user} - ${info.days} μέρες`;
    if (info.stopped) {
      let badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "🚫 Gooner";
      div.appendChild(badge);
    }
    leaderboardDiv.appendChild(div);
  }
}

// Disable/enable buttons based on if user answered or stopped
function updateButtons() {
  let user = usernameInput.value.trim();
  if (!user || !data[user]) {
    btnNo.disabled = true;
    btnYes.disabled = true;
    return;
  }
  if (data[user].stopped) {
    btnNo.disabled = true;
    btnYes.disabled = true;
    choiceSection.querySelector("p").textContent = "Το challenge τελείωσε για σένα.";
    return;
  }
  if (answeredToday(user)) {
    btnNo.disabled = true;
    btnYes.disabled = true;
    choiceSection.querySelector("p").textContent = "Έχεις απαντήσει σήμερα! Περίμενε αύριο.";
  } else {
    btnNo.disabled = false;
    btnYes.disabled = false;
    choiceSection.querySelector("p").textContent = "Έκανες goon σήμερα;";
  }
}

// Countdown timer to next day
function startTimer() {
  let nextDay = getNextDay();
  function tick() {
    let now = new Date();
    let diff = nextDay - now;
    if (diff <= 0) {
      // νέα μέρα
      localStorage.removeItem(CHOICE_KEY); // ξεκλειδώνει επιλογές
      updateButtons();
      timerDiv.textContent = "Μπορείς να απαντήσεις για σήμερα!";
      nextDay = getNextDay();
    } else {
      timerDiv.textContent = "Επόμενη μέρα σε: " + formatTime(diff);
    }
  }
  tick();
  setInterval(tick, 1000);
}

// On user input answer
btnNo.onclick = () => {
  let user = usernameInput.value.trim();
  if (!user) return alert("Βάλε όνομα χρήστη!");
  saveChoice(user, false);
}

btnYes.onclick = () => {
  let user = usernameInput.value.trim();
  if (!user) return alert("Βάλε όνομα χρήστη!");
  saveChoice(user, true);
}

// When username input changes, update buttons
usernameInput.oninput = () => {
  updateButtons();
}

renderLeaderboard();
updateButtons();
startTimer();