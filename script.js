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

// views counter — real global count via Abacus (never drops below last known value)
const views = document.getElementById("views");
const API = "https://abacus.jasoncameron.dev";
const KEY = "teroxx/site-visits";
const GLOBAL_KEY = "terox_global_views";
const LEGACY_KEY = "terox_site_visits";
const BASE_VIEWS = 512;

let shownViews = 0;

function setViews(n, animate) {
  if (!views) return;
  const target = Number(n) || 0;
  views.dataset.value = target;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reduce || document.hidden) {
    shownViews = target;
    views.textContent = target.toLocaleString("uk-UA");
    return;
  }

  const from = shownViews;
  const start = performance.now();
  const duration = 900;

  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    shownViews = Math.round(from + (target - from) * eased);
    views.textContent = shownViews.toLocaleString("uk-UA");
    if (p < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function cachedViews() {
  let stored = 0;
  try {
    stored = parseInt(localStorage.getItem(GLOBAL_KEY) || "0", 10) || 0;
  } catch (e) {
    stored = 0;
  }
  return Math.max(stored, BASE_VIEWS);
}

function saveViews(value) {
  try {
    localStorage.setItem(GLOBAL_KEY, String(value));
  } catch (e) {
    /* private mode */
  }
}

async function fetchViews(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(`${API}/${endpoint}/${KEY}?t=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    const value = Number(data.value);
    if (!Number.isFinite(value) || value <= 0) throw new Error("bad value");
    return value;
  } finally {
    clearTimeout(timer);
  }
}

async function syncViews() {
  let counted = false;
  try {
    counted = Boolean(sessionStorage.getItem("terox_counted"));
  } catch (e) {
    counted = false;
  }

  let value = 0;

  // 3 спроби: перша рахує візит (hit), решта лише читають (get) — без подвійного +1
  for (let attempt = 0; attempt < 3 && !value; attempt += 1) {
    const endpoint = !counted && attempt === 0 ? "hit" : "get";
    try {
      value = await fetchViews(endpoint);
    } catch (e) {
      if (attempt < 2) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }

  try {
    if (!counted) sessionStorage.setItem("terox_counted", "1");
  } catch (e) {
    /* ignore */
  }

  if (value > 0) {
    saveViews(value);
    setViews(Math.max(value, cachedViews()), true);
    return;
  }

  // API недоступний: тримаємо останнє відоме значення, але не нижче 500+
  setViews(cachedViews(), false);
}

try {
  localStorage.removeItem(LEGACY_KEY);
} catch (e) {
  /* ignore */
}

setViews(cachedViews(), false);
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
    muteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3Zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7Z"/></svg>';
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
