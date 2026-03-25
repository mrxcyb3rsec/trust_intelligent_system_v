// ================= API =================
const API_URL = "/data";

// 🔊 Alert Sound
const alertSound = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");

// ================= HELPER: SMOOTH NUMBER ANIMATION =================
function animateValue(id, start, end, duration) {
  let range = end - start;
  let current = start;
  let increment = range / (duration / 50); // update every 50ms
  const obj = document.getElementById(id);
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    obj.innerText = Math.round(current) + (id === "score" ? "%" : "%");
  }, 50);
}

// ================= FETCH LOOP =================
let lastRisk = 0;
let lastScore = 0;

async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    console.log(data);

    // ================= TRUST + RISK =================
    animateValue("score", lastScore, data.trust_score, 400);
    animateValue("risk", lastRisk, data.risk_score, 400);
    lastScore = data.trust_score;
    lastRisk = data.risk_score;

    document.getElementById("status").innerText = data.status;

    // ================= STATUS COLOR =================
    const statusEl = document.getElementById("status");
    const body = document.getElementById("body");

    if (data.status === "DANGER") {
      statusEl.style.color = "#ff0040";
      body.style.background = "linear-gradient(135deg, #2b0000, #400000, #000000)";
      alertSound.play();
    } else if (data.status === "WARNING") {
      statusEl.style.color = "#ffdd00";
      body.style.background = "linear-gradient(135deg, #2b2b00, #4f4f00, #1a1a00)";
    } else {
      statusEl.style.color = "#0ff";
      body.style.background = "linear-gradient(135deg, #001f1f, #003333, #000000)";
    }

    // ================= ALERTS =================
    const alertBox = document.getElementById("alerts");
    alertBox.innerHTML = "";
    data.alerts.forEach(alert => {
      const div = document.createElement("div");
      div.className = "alert alert-warning";
      div.innerText = alert;
      div.style.animation = "pop 0.4s ease";
      alertBox.appendChild(div);
    });

    // ================= AI EXPLANATION =================
    const reasonsList = document.getElementById("reasons");
    reasonsList.innerHTML = "";
    data.reasons.forEach(r => {
      const li = document.createElement("li");
      li.className = "list-group-item bg-dark text-white";
      li.innerText = r;
      reasonsList.appendChild(li);
    });

    // ================= ACTION =================
    const actionEl = document.getElementById("action");
    actionEl.innerText = data.action;

    // ================= APPS =================
    const appSection = document.getElementById("apps");
    appSection.innerHTML = "";
    data.apps.forEach(app => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      const card = document.createElement("div");
      card.className = "app-card";

      if (app.risk === "High") {
        card.style.boxShadow = "0 0 20px #ff0040, 0 0 40px #ff0040";
      }

      card.innerHTML = `
        <h5>${app.name}</h5>
        <p>Permissions: ${app.permissions.join(", ")}</p>
        <p>Risk: ${app.risk}</p>
        <button class="btn btn-danger btn-sm" onclick="revokeAccess('${app.name}')">Revoke</button>
      `;
      col.appendChild(card);
      appSection.appendChild(col);
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

// 🔁 AUTO REFRESH EVERY 2 SEC
setInterval(fetchData, 2000);
fetchData();

// ================= SIMULATION =================
function simulate() {
  fetch("/simulate");
}

// ================= RESET =================
function resetSystem() {
  fetch("/reset");
}

// ================= AI CHAT =================
function askAI() {
  let q = document.getElementById("question").value.toLowerCase();
  let answer = "🤖 Analyzing...";

  if (q.includes("why")) {
    answer = "Risk increased due to unusual app behavior and high-risk permissions.";
  } 
  else if (q.includes("safe")) {
    answer = "System is currently stable with low anomaly detection.";
  } 
  else if (q.includes("risk")) {
    answer = "Risk score is calculated dynamically based on app behavior patterns.";
  } 
  else {
    answer = "Try asking: 'Why risk?', 'Is it safe?', 'What happened?'";
  }

  document.getElementById("answer").innerText = answer;
}

// ================= ACTION =================
function revokeAccess(appName) {
  alert("🚫 " + appName + " access revoked!");
}
