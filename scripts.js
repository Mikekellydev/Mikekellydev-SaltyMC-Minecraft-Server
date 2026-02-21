// scripts.js

const SERVER_ADDRESS = "play.saltymc.org";
const REFRESH_SECONDS = 30;

// Replace this with the real invite when you have it
const DISCORD_URL = "https://discord.gg/saltymc";

// Daily messages (simple starter version)
// Later upgrade: load from daily-message.json on GitHub Pages.
const DAILY_MESSAGES = [
  "Welcome to SaltyMC. Play fair, have fun, and help new players.",
  "Daily challenge: invite one friend and build something together.",
  "Pro tip: store valuables safely and label your chests.",
  "Team up today. Solo is fine, but squads are legendary.",
  "Be a builder, not a breaker. Respect the community.",
];

const API_URL = `https://api.mcsrvstat.us/2/${encodeURIComponent(SERVER_ADDRESS)}`;

// Elements
const serverAddressEl = document.getElementById("serverAddress");
const copyAddressBtn = document.getElementById("copyAddressBtn");

const joinDiscordBtn = document.getElementById("joinDiscordBtn");
const copyDiscordBtn = document.getElementById("copyDiscordBtn");

const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");

const playersOnlineEl = document.getElementById("playersOnline");
const playersMaxEl = document.getElementById("playersMax");
const playersHintEl = document.getElementById("playersHint");

const serverVersionEl = document.getElementById("serverVersion");
const motdEl = document.getElementById("motd");

const lastUpdatedEl = document.getElementById("lastUpdated");
const refreshSecondsEl = document.getElementById("refreshSeconds");

const errorBox = document.getElementById("errorBox");

// Daily message elements
const dailyMessageEl = document.getElementById("dailyMessage");
const dailyBadgeEl = document.getElementById("dailyBadge");

// Player list elements
const playersCardEl = document.getElementById("playersCard");
const playerListEl = document.getElementById("playerList");
const playerListStatusEl = document.getElementById("playerListStatus");

serverAddressEl.textContent = SERVER_ADDRESS;
refreshSecondsEl.textContent = String(REFRESH_SECONDS);

// Clipboard helper
async function copyText(btn, text, successLabel, failLabel) {
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = successLabel;
    setTimeout(() => (btn.textContent = original), 900);
  } catch {
    const original = btn.textContent;
    btn.textContent = failLabel;
    setTimeout(() => (btn.textContent = original), 900);
  }
}

copyAddressBtn.addEventListener("click", () =>
  copyText(copyAddressBtn, SERVER_ADDRESS, "Copied", "Copy failed")
);

joinDiscordBtn.addEventListener("click", () => {
  window.open(DISCORD_URL, "_blank", "noopener,noreferrer");
});

copyDiscordBtn.addEventListener("click", () =>
  copyText(copyDiscordBtn, DISCORD_URL, "Copied", "Copy failed")
);

// Status UI
function setOnlineUI(isOnline) {
  statusPill.classList.remove("status-online", "status-offline");
  if (isOnline === true) statusPill.classList.add("status-online");
  if (isOnline === false) statusPill.classList.add("status-offline");
}

function setError(message) {
  if (!message) {
    errorBox.hidden = true;
    errorBox.textContent = "";
    return;
  }
  errorBox.hidden = false;
  errorBox.textContent = message;
}

function formatTime(date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function safeGetMotd(data) {
  const clean = data?.motd?.clean;
  if (Array.isArray(clean) && clean.length > 0) return clean.join("\n");
  if (typeof data?.motd === "string") return data.motd;
  return "—";
}

// Animated counter
function animateNumber(el, from, to, durationMs = 650) {
  const start = performance.now();
  const diff = to - from;

  function tick(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(from + diff * eased);
    el.textContent = String(value);
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

let lastPlayersOnline = 0;

// Daily message
function setDailyMessage() {
  const today = new Date();
  const dayKey = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000
  );
  const msg = DAILY_MESSAGES[dayKey % DAILY_MESSAGES.length];
  dailyMessageEl.textContent = msg;

  dailyBadgeEl.textContent = today.toLocaleDateString(undefined, { weekday: "long" });
}

setDailyMessage();

// Player list extraction and rendering
function extractPlayerNames(data) {
  const list = data?.players?.list;
  if (Array.isArray(list) && list.length) return list;

  const sample = data?.players?.sample;
  if (Array.isArray(sample) && sample.length) {
    const names = sample
      .map((x) => (typeof x === "string" ? x : x?.name))
      .filter(Boolean);
    if (names.length) return names;
  }

  return [];
}

function renderPlayerList(names) {
  // If server does not share names, collapse the entire section.
  if (!Array.isArray(names) || names.length === 0) {
    if (playersCardEl) playersCardEl.hidden = true;
    return;
  }

  if (playersCardEl) playersCardEl.hidden = false;

  playerListEl.innerHTML = "";
  for (const name of names.slice(0, 40)) {
    const chip = document.createElement("span");
    chip.className = "player-chip";
    chip.textContent = name;
    playerListEl.appendChild(chip);
  }

  if (names.length > 40) {
    const more = document.createElement("p");
    more.className = "player-empty";
    more.textContent = `Plus ${names.length - 40} more…`;
    playerListEl.appendChild(more);
  }

  if (playerListStatusEl) {
    playerListStatusEl.textContent = `Showing ${names.length} player name(s)`;
  }
}

async function refreshStatus() {
  setError("");
  statusText.textContent = "Checking…";
  setOnlineUI(null);

  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const online = Boolean(data?.online);

    setOnlineUI(online);
    statusText.textContent = online ? "Online" : "Offline";

    const playersOnline = data?.players?.online ?? 0;
    const playersMax = data?.players?.max ?? 0;

    animateNumber(playersOnlineEl, lastPlayersOnline, playersOnline);
    lastPlayersOnline = playersOnline;

    playersMaxEl.textContent = playersMax > 500 ? "∞" : String(playersMax);

    playersHintEl.textContent = online
      ? playersMax > 0
        ? "Server is accepting players"
        : "Server is online"
      : "Server is offline or not reachable";

    serverVersionEl.textContent = data?.version || "Unknown";
    motdEl.textContent = safeGetMotd(data);

    lastUpdatedEl.textContent = formatTime(new Date());

    // Gamer tags: show if available, otherwise collapse card completely.
    const names = online ? extractPlayerNames(data) : [];
    renderPlayerList(names);
  } catch (err) {
    setOnlineUI(false);
    statusText.textContent = "Offline";

    animateNumber(playersOnlineEl, lastPlayersOnline, 0);
    lastPlayersOnline = 0;

    playersMaxEl.textContent = "0";
    serverVersionEl.textContent = "Unknown";
    motdEl.textContent = "—";
    lastUpdatedEl.textContent = formatTime(new Date());

    // On error, collapse player list card too.
    if (playersCardEl) playersCardEl.hidden = true;

    setError(`Status check failed: ${String(err?.message ?? err)}`);
  }
}

refreshStatus();
setInterval(refreshStatus, REFRESH_SECONDS * 1000);

// Subtle particle background
(function particles() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  let w = 0;
  let h = 0;

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  const COUNT = Math.max(40, Math.min(90, Math.floor((w * h) / 18000)));
  const parts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 2,
    vx: -0.2 + Math.random() * 0.4,
    vy: -0.2 + Math.random() * 0.4,
    a: 0.10 + Math.random() * 0.18,
  }));

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 222, 128, ${p.a})`;
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  step();
})();