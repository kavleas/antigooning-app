import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// TODO: Αντικατάστησε με το δικό σου Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD8rBPGRvCZEHZON9VA3tnWdLDnaOIslcA",
  authDomain: "anti-gooning-challenge.firebaseapp.com",
  databaseURL: "https://anti-gooning-challenge-default-rtdb.firebaseio.com",
  projectId: "anti-gooning-challenge",
  storageBucket: "anti-gooning-challenge.firebasestorage.app",
  messagingSenderId: "915847556113",
  appId: "1:915847556113:web:78fbab7f35c9cdcf3c95b0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const btnNo = document.getElementById("btn-no");
const btnYes = document.getElementById("btn-yes");
const leaderboardDiv = document.getElementById("leaderboard");
const timerDiv = document.getElementById("timer");
const usernameInput = document.getElementById("username");
const btnAddUser = document.getElementById("btn-add-user");
const choiceSection = document.getElementById("choice-section");

let currentUser = null;

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return \`\${h.toString().padStart(2,"0")}:\${m.toString().padStart(2,"0")}:\${s.toString().padStart(2,"0")}\`;
}

function getToday() {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d.toISOString().split("T")[0];
}

function getNextDay() {
  const d = new Date();
  d.setHours(24,0,0,0);
  return d;
}

function renderLeaderboard(snapshot) {
  leaderboardDiv.innerHTML = "";
  const users = snapshot.val() || {};
  const entries = Object.entries(users);
  entries.sort((a,b) => b[1].days - a[1].days);
  for (const [user, info] of entries) {
    const div = document.createElement("div");
    div.className = "user-row";
    div.textContent = \`\${user} - \${info.days} μέρες\`;
    if (info.stopped) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "🚫 Gooner";
      div.appendChild(badge);
    }
    leaderboardDiv.appendChild(div);
  }
}

function updateButtons(userData) {
  const today = getToday();
  if (!currentUser || !userData[currentUser]) {
    btnNo.disabled = true;
    btnYes.disabled = true;
    return;
  }
  const user = userData[currentUser];
  if (user.stopped) {
    btnNo.disabled = true;
    btnYes.disabled = true;
    choiceSection.querySelector("p").textContent = "Το challenge τελείωσε για σένα.";
    return;
  }
  if (user.lastUpdated === today) {
    btnNo.disabled = true;
    btnYes.disabled = true;
    choiceSection.querySelector("p").textContent = "Έχεις απαντήσει σήμερα! Περίμενε αύριο.";
  } else {
    btnNo.disabled = false;
    btnYes.disabled = false;
    choiceSection.querySelector("p").textContent = "Έκανες goon σήμερα;";
  }
}

btnAddUser.onclick = () => {
  const name = usernameInput.value.trim();
  if (name === "") return alert("Βάλε όνομα!");
  currentUser = name;
  get(ref(db, 'users/' + name)).then(snapshot => {
    if (!snapshot.exists()) {
      set(ref(db, 'users/' + name), {
        days: 0,
        stopped: false,
        lastUpdated: ""
      });
    }
  });
};

function submitChoice(gooned) {
  const userRef = ref(db, 'users/' + currentUser);
  get(userRef).then(snapshot => {
    if (!snapshot.exists()) return;
    const user = snapshot.val();
    const today = getToday();
    if (user.lastUpdated === today) return;
    if (gooned) {
      update(userRef, { stopped: true, lastUpdated: today });
    } else {
      update(userRef, {
        days: (user.days || 0) + 1,
        lastUpdated: today
      });
    }
  });
}

btnNo.onclick = () => submitChoice(false);
btnYes.onclick = () => submitChoice(true);

// Real-time updates
onValue(ref(db, 'users'), snapshot => {
  renderLeaderboard(snapshot);
  const data = snapshot.val() || {};
  updateButtons(data);
});

// Countdown timer
function startTimer() {
  let nextDay = getNextDay();
  function tick() {
    const now = new Date();
    const diff = nextDay - now;
    if (diff <= 0) {
      nextDay = getNextDay();
    }
    timerDiv.textContent = "Επόμενη μέρα σε: " + formatTime(diff);
  }
  tick();
  setInterval(tick, 1000);
}
startTimer();