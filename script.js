const NICK = "TeroxX";

const LINKS = {
  discord: "https://discord.gg/ZZXuqRfqgK",
  tiktok: "https://www.tiktok.com/@teroxx303",
  steam: "https://steamcommunity.com/id/TeroxXo/",
  youtube: "https://www.youtube.com/@teroxX-330",
};

for (const [key, url] of Object.entries(LINKS)) {
  const el = document.getElementById("link-" + key);
  if (el) el.href = url;
}

// views counter — real global count via Abacus (revamped 2026-11-26)
const views = document.getElementById("views");
const API = "https://abacus.jasoncameron.dev";
const KEY = "teroxx/site-visits";
const GLOBAL_KEY = "terox_global_views";
const LEGACY_KEY = "terox_site_visits";
const BASE_VIEWS = 512;

let shownViews = 0;

// ════════════════════════════════════════════════════════════════
// 1️⃣  Set initial value from cached global count (never below 512)
// ════════════════════════════════════════════════════════════════
function cachedViews() {
  let stored = 0;
  try {
    stored = parseInt(localStorage.getItem(GLOBAL_KEY) || "0", 10) || 0;
  } catch (e) {
    stored = 0;
  }
  return Math.max(stored, BASE_VIEWS);
}

// ════════════════════════════════════════════════════════════════
// 2️⃣  Save a value to global persistent storage
// ════════════════════════════════════════════════════════════════
function saveViews(value) {
  try {
    localStorage.setItem(GLOBAL_KEY, String(value));
  } catch (e) {
    /* private mode — ignore */
  }
}

// ════════════════════════════════════════════════════════════════
// 3️⃣  Fetch the current Abacus count (with timeout)
// ════════════════════════════════════════════════════════════════
async function fetchAbacusValue(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API}/${endpoint}/${KEY}?t=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    const value = Number(data.value);
    if (!Number.isFinite(value) || value < 0) throw new Error("bad value");
    return value;
  } finally {
    clearTimeout(timer);
  }
}

// ════════════════════════════════════════════════════════════════
// 4️⃣  Sync the counter with Abacus (once per session)
// ═════════════════════════════════════════════════════════════════
async function syncViews() {
  let counted = false;
  try {
    counted = Boolean(sessionStorage.getItem("terox_counted"));
  } catch (e) {
    counted = false;
  }

  // If we already counted this session, just read the current Abacus value
  if (counted) {
    try {
      const value = await fetchAbacusValue("get");
      saveViews(value);
      setViews(value, true);
      return;
    } catch (e) {
      // API down — keep cached value, don't reset
      setViews(cachedViews(), false);
      return;
    }
  }

  // First visit of the session → try "hit" to register the visit
  try {
    const value = await fetchAbacusValue("hit");
    saveViews(value);
    sessionStorage.setItem("terox_counted", "1");
    setViews(value, true);
    return;
  } catch (e) {
    // API completely down → keep cached value, don't reset to 0
    setViews(cachedViews(), false);
    // Still mark as counted so next read uses "get" instead of "hit"
    try { sessionStorage.setItem("terox_counted", "1"); } catch (e) {}
    return;
  }
}

// ════════════════════════════════════════════════════════════════
// 5️⃣  Initial render — cached value (never below 512)
// ════════════════════════════════════════════════════════════════
// Reset legacy key so we always use the new global store
try {
  localStorage.removeItem(LEGACY_KEY);
} catch (e) {
  /* ignore */
}

// Show cached value immediately (won't drop below 512)
setViews(cachedViews(), false);

// Then sync with Abacus in the background
syncViews();

// snowflakes
const snow = document.getElementById("snow");
const SYMS = ["❅", "❆", "•"];

for (let i = 0; i < 36; i++) {
  const flake = document.createElement("span");
  flake.className = "flake";
  flake.textContent = SYMS[i % SYMS.length];
  const size = 8 + Math.random() * 11;
  flake.style.left = Math.random() * 100 + "%";
  flake.style.fontSize = size + "px";
  flake.style.opacity = 0.35 + Math.random() * 0.6;
  flake.style.animationDuration = 6 + Math.random() * 12 + "s";
  flake.style.animationDelay = -Math.random() * 12 + "s";
  snow.appendChild(flake);
}

// enter screen -> start music
const enter = document.getElementById("enter");
const audio = document.getElementById("audio");
const muteBtn = document.getElementById("muteBtn");
const vol = document.getElementById("vol");

let muted = false;
let lastVol = 0.5;
audio.volume = 0.5;

function enterSite() {
  enter.classList.add("hidden");
  document.body.classList.add("entered");
  audio.play().catch(() => {});
}

enter.addEventListener("click", enterSite);
enter.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    enterSite();
  }
});

// volume slider
vol.addEventListener("input", () => {
  lastVol = vol.value / 100;
  audio.volume = lastVol;
  if (muted && lastVol > 0) {
    muted = false;
    audio.muted = false;
    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Zm-2.5-8v2.1a7 7 0 0 1 0 11.8V20a9 9 0 0 0 0-16Z"/></svg>';
  }
});

// music toggle
muteBtn.addEventListener("click", () => {
  muted = !muted;
  audio.muted = muted;
  if (muted) {
    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3Zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7 2.7 1.4-1.4-2.7-2.7Z"/></svg>';
  } else {
    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Zm-2.5-8v2.1a7 7 0 0 1 0 11.8V20a9 9 0 0 0 0-16Z"/></svg>';
  }
});

// tab title typewriter
const BASE = NICK + " — TeroxX";
function typeTitle() {
  let i = 0;
  document.title = "";
  (function step() {
    document.title = NICK.slice(0, ++i);
    if (i < NICK.length) {
      setTimeout(step, 130);
    } else {
      setTimeout(() => (document.title = NICK), 500);
      setTimeout(typeTitle, 7000);
    }
  })();
}
typeTitle();

// ---------- design v2 interactions ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// cursor glow that follows the pointer
const glow = document.getElementById("cursorGlow");
if (glow && canHover && !reduceMotion) {
  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let x = tx;
  let y = ty;

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  (function follow() {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(follow);
  })();
}

// 3D tilt on the avatar
const tilt = document.getElementById("tilt");
if (tilt && canHover && !reduceMotion) {
  const MAX = 16;

  tilt.addEventListener("pointermove", (e) => {
    const r = tilt.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg)`;
  });

  tilt.addEventListener("pointerleave", () => {
    tilt.style.transform = "";
  });
}
// glitch on the name, at random intervals
const glitchEl = document.querySelector(".glitch");
if (glitchEl && !reduceMotion) {
  let glitchTimer = null;

  function scheduleGlitch() {
    clearTimeout(glitchTimer);
    if (document.hidden) return;

    glitchTimer = setTimeout(() => {
      glitchEl.classList.add("is-glitching");
      setTimeout(() => glitchEl.classList.remove("is-glitching"), 420);
      scheduleGlitch();
    }, 4500 + Math.random() * 4500);
  }

  document.addEventListener("visibilitychange", scheduleGlitch);
  scheduleGlitch();
}