// scripts.js

const CONFIG = {
  serverAddress: "play.saltymc.org",
  refreshSeconds: 30,

  discordInviteUrl: "https://discord.gg/saltymc",
  // Discord widget format:
  // https://discord.com/widget?id=YOUR_SERVER_ID&theme=dark
  // The server owner must enable Server Widget in Discord settings.
  discordWidgetUrl: "",

  tebexStoreUrl: "https://store.saltymc.org",

  featuredPackages: [
    {
      title: "VIP Rank",
      priceText: "$9.99",
      description: "Extra perks, special chat tag, and quality of life boosts.",
      buyUrl: "https://store.saltymc.org",
    },
    {
      title: "Starter Bundle",
      priceText: "$4.99",
      description: "A small boost to help you get rolling fast.",
      buyUrl: "https://store.saltymc.org",
    },
    {
      title: "Support the Server",
      priceText: "Any amount",
      description: "Help cover hosting and upgrades. Thank you.",
      buyUrl: "https://store.saltymc.org",
    },
  ],

  galleryItems: [
    {
      title: "Spawn",
      description: "The first impression. Make it legendary.",
      imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=60",
    },
    {
      title: "Arena",
      description: "PvP battles, events, and bragging rights.",
      imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf23?auto=format&fit=crop&w=1200&q=60",
    },
    {
      title: "Builds",
      description: "Community builds that keep growing.",
      imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=60",
    },
  ],

  // Optional event banner
  // startsAtISO can be blank to hide countdown
  event: {
    enabled: false,
    title: "Double Rewards Weekend",
    text: "Earn extra rewards all weekend. Bring your squad.",
    subtext: "Limited time event",
    startsAtISO: "",
    ctaText: "Learn More",
    ctaUrl: "https://store.saltymc.org",
  },

  dailyMessages: [
    "Welcome to SaltyMC. Play fair, have fun, and help new players.",
    "Daily challenge: invite one friend and build something together.",
    "Pro tip: store valuables safely and label your chests.",
    "Team up today. Solo is fine, but squads are legendary.",
    "Be a builder, not a breaker. Respect the community.",
  ],
};

const API_URL = `https://api.mcsrvstat.us/2/${encodeURIComponent(CONFIG.serverAddress)}`;

/* Elements */
const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");
const statusTextInline = document.getElementById("statusTextInline");

const serverVersionEl = document.getElementById("serverVersion");
const lastUpdatedEl = document.getElementById("lastUpdated");
const motdEl = document.getElementById("motd");
const errorBox = document.getElementById("errorBox");

const serverAddressInline = document.getElementById("serverAddressInline");
const playersOnlineInline = document.getElementById("playersOnlineInline");
const playersMaxInline = document.getElementById("playersMaxInline");

const playNowBtn = document.getElementById("playNowBtn");
const copyAddressBtn = document.getElementById("copyAddressBtn");
const joinDiscordBtn = document.getElementById("joinDiscordBtn");
const joinDiscordBtn2 = document.getElementById("joinDiscordBtn2");
const copyDiscordBtn = document.getElementById("copyDiscordBtn");

const dailyMessageEl = document.getElementById("dailyMessage");
const dailyBadgeEl = document.getElementById("dailyBadge");

const storeGrid = document.getElementById("storeGrid");
const openStoreBtn = document.getElementById("openStoreBtn");

const galleryEl = document.getElementById("gallery");

const playersCardEl = document.getElementById("playersCard");
const playerListEl = document.getElementById("playerList");

const discordWidget = document.getElementById("discordWidget");

const eventCard = document.getElementById("eventCard");
const eventTitle = document.getElementById("eventTitle");
const eventText = document.getElementById("eventText");
const eventSubtext = document.getElementById("eventSubtext");
const eventBadge = document.getElementById("eventBadge");
const eventCtaBtn = document.getElementById("eventCtaBtn");
const countdownWrap = document.getElementById("countdownWrap");
const countdownText = document.getElementById("countdownText");

/* Init static UI */
serverAddressInline.textContent = CONFIG.serverAddress;

if (openStoreBtn) {
  openStoreBtn.href = CONFIG.tebexStoreUrl;
}

/* Analytics helper */
function track(name, props = {}) {
  if (window.__SALTYMC_DISABLE_ANALYTICS__ === true) return;
  // Placeholder for analytics hooks.
  // You can wire Google Analytics, Plausible, or Umami here later.
  // console.log("track", name, props);
}

/* Clipboard helper */
async function copyText(btn, text, successLabel, failLabel) {
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = successLabel;
    setTimeout(() => (btn.textContent = original), 900);
    track("copy", { what: successLabel });
  } catch {
    const original = btn.textContent;
    btn.textContent = failLabel;
    setTimeout(() => (btn.textContent = original), 900);
  }
}

/* Buttons */
if (copyAddressBtn) {
  copyAddressBtn.addEventListener("click", () =>
    copyText(copyAddressBtn, CONFIG.serverAddress, "Copied", "Copy failed")
  );
}

if (playNowBtn) {
  playNowBtn.addEventListener("click", async () => {
    await copyText(playNowBtn, CONFIG.serverAddress, "Copied. Paste into Minecraft", "Copy failed");
    track("cta_play_now");
  });
}

function openDiscord() {
  window.open(CONFIG.discordInviteUrl, "_blank", "noopener,noreferrer");
  track("cta_discord");
}

if (joinDiscordBtn) joinDiscordBtn.addEventListener("click", openDiscord);
if (joinDiscordBtn2) joinDiscordBtn2.addEventListener("click", openDiscord);

if (copyDiscordBtn) {
  copyDiscordBtn.addEventListener("click", () =>
    copyText(copyDiscordBtn, CONFIG.discordInviteUrl, "Copied", "Copy failed")
  );
}

/* Event banner */
function initEventBanner() {
  if (!CONFIG.event || CONFIG.event.enabled !== true) {
    if (eventCard) eventCard.hidden = true;
    return;
  }

  eventCard.hidden = false;
  eventTitle.textContent = CONFIG.event.title || "Event";
  eventText.textContent = CONFIG.event.text || "";
  eventSubtext.textContent = CONFIG.event.subtext || "";
  eventBadge.textContent = "Event";
  eventCtaBtn.textContent = CONFIG.event.ctaText || "Learn More";
  eventCtaBtn.href = CONFIG.event.ctaUrl || CONFIG.tebexStoreUrl;

  const startsAt = CONFIG.event.startsAtISO ? new Date(CONFIG.event.startsAtISO) : null;
  if (!startsAt || Number.isNaN(startsAt.getTime())) {
    countdownWrap.hidden = true;
    return;
  }

  countdownWrap.hidden = false;

  function tick() {
    const now = new Date();
    const diff = startsAt.getTime() - now.getTime();
    if (diff <= 0) {
      countdownText.textContent = "Now";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours}h`);
    parts.push(`${mins}m`);
    countdownText.textContent = parts.join(" ");
  }

  tick();
  setInterval(tick, 20000);
}

initEventBanner();

/* Store cards */
function renderStoreCards() {
  if (!storeGrid) return;

  storeGrid.innerHTML = "";
  for (const pkg of CONFIG.featuredPackages) {
    const card = document.createElement("div");
    card.className = "store-card";

    const title = document.createElement("h3");
    title.className = "store-title";
    title.textContent = pkg.title;

    const desc = document.createElement("p");
    desc.className = "store-desc";
    desc.textContent = pkg.description;

    const price = document.createElement("div");
    price.className = "store-price";
    price.textContent = pkg.priceText;

    const actions = document.createElement("div");
    actions.className = "store-actions";

    const buy = document.createElement("a");
    buy.className = "btn btn-primary btn-link";
    buy.href = pkg.buyUrl || CONFIG.tebexStoreUrl;
    buy.target = "_blank";
    buy.rel = "noopener noreferrer";
    buy.textContent = "Buy";

    buy.addEventListener("click", () => track("store_click", { item: pkg.title }));

    const view = document.createElement("a");
    view.className = "btn btn-secondary btn-link";
    view.href = CONFIG.tebexStoreUrl;
    view.target = "_blank";
    view.rel = "noopener noreferrer";
    view.textContent = "View Store";

    view.addEventListener("click", () => track("store_open"));

    actions.appendChild(buy);
    actions.appendChild(view);

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(price);
    card.appendChild(actions);

    storeGrid.appendChild(card);
  }
}

renderStoreCards();

/* Gallery */
function renderGallery() {
  if (!galleryEl) return;

  galleryEl.innerHTML = "";
  for (const item of CONFIG.galleryItems) {
    const wrap = document.createElement("div");
    wrap.className = "gallery-item";

    const img = document.createElement("img");
    img.className = "gallery-img";
    img.src = item.imageUrl;
    img.alt = item.title;

    const cap = document.createElement("div");
    cap.className = "gallery-cap";

    const t = document.createElement("p");
    t.className = "gallery-title";
    t.textContent = item.title;

    const sub = document.createElement("p");
    sub.className = "gallery-sub";
    sub.textContent = item.description;

    cap.appendChild(t);
    cap.appendChild(sub);

    wrap.appendChild(img);
    wrap.appendChild(cap);

    galleryEl.appendChild(wrap);
  }
}

renderGallery();

/* Discord widget */
function initDiscordWidget() {
  if (!discordWidget) return;

  if (!CONFIG.discordWidgetUrl) {
    discordWidget.srcdoc = `
      <html>
        <body style="margin:0;background:rgba(0,0,0,0.22);color:white;font-family:system-ui;padding:16px">
          <div style="font-weight:800">Discord widget not set</div>
          <div style="opacity:0.8;margin-top:10px;line-height:1.6">
            Ask the owner for the Discord Server ID and enable Server Widget.
          </div>
        </body>
      </html>
    `;
    return;
  }

  discordWidget.src = CONFIG.discordWidgetUrl;
}

initDiscordWidget();

/* Daily message */
function setDailyMessage() {
  const today = new Date();
  const dayKey = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
  const msg = CONFIG.dailyMessages[dayKey % CONFIG.dailyMessages.length];
  dailyMessageEl.textContent = msg;
  dailyBadgeEl.textContent = today.toLocaleDateString(undefined, { weekday: "long" });
}

setDailyMessage();

/* Status UI helpers */
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

/* Animated counter */
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
let lastPlayersMax = 0;

/* Player list extraction */
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
  if (!Array.isArray(names) || names.length === 0) {
    playersCardEl.hidden = true;
    return;
  }

  playersCardEl.hidden = false;
  playerListEl.innerHTML = "";

  for (const name of names.slice(0, 40)) {
    const chip = document.createElement("span");
    chip.className = "player-chip";
    chip.textContent = name;
    playerListEl.appendChild(chip);
  }
}

/* Refresh status */
async function refreshStatus() {
  setError("");
  statusText.textContent = "Checking…";
  if (statusTextInline) statusTextInline.textContent = "Checking…";
  setOnlineUI(null);

  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const online = Boolean(data?.online);

    setOnlineUI(online);
    statusText.textContent = online ? "Online" : "Offline";
    if (statusTextInline) statusTextInline.textContent = online ? "Online" : "Offline";

    const playersOnline = data?.players?.online ?? 0;
    const playersMax = data?.players?.max ?? 0;

    animateNumber(playersOnlineInline, lastPlayersOnline, playersOnline);
    lastPlayersOnline = playersOnline;

    const displayMax = playersMax > 500 ? "∞" : String(playersMax);
    if (playersMaxInline) playersMaxInline.textContent = displayMax;
    lastPlayersMax = playersMax;

    serverVersionEl.textContent = data?.version || "Unknown";
    motdEl.textContent = safeGetMotd(data);
    lastUpdatedEl.textContent = formatTime(new Date());

    const names = online ? extractPlayerNames(data) : [];
    renderPlayerList(names);
  } catch (err) {
    setOnlineUI(false);
    statusText.textContent = "Offline";
    if (statusTextInline) statusTextInline.textContent = "Offline";

    animateNumber(playersOnlineInline, lastPlayersOnline, 0);
    lastPlayersOnline = 0;

    if (playersMaxInline) playersMaxInline.textContent = "0";

    serverVersionEl.textContent = "Unknown";
    motdEl.textContent = "—";
    lastUpdatedEl.textContent = formatTime(new Date());

    if (playersCardEl) playersCardEl.hidden = true;

    setError(`Status check failed: ${String(err?.message ?? err)}`);
  }
}

refreshStatus();
setInterval(refreshStatus, CONFIG.refreshSeconds * 1000);

/* Subtle particle background */
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

  const COUNT = Math.max(40, Math.min(95, Math.floor((w * h) / 18000)));
  const parts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 2,
    vx: -0.18 + Math.random() * 0.36,
    vy: -0.18 + Math.random() * 0.36,
    a: 0.08 + Math.random() * 0.16,
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