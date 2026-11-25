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

// views counter — real global count via cloud API (fallback: localStorage)
const views = document.getElementById("views");
const API = "https://abacus.jasoncameron.dev";
const KEY = "teroxx/site-visits";
const LOCAL_KEY = "terox_site_visits";

let shownViews = 0;

function setViews(n, animate) {
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
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      pulseViews();
    }
  }

  requestAnimationFrame(tick);
}

function pulseViews() {
  views.classList.remove("pulse");
  void views.offsetWidth;
  views.classList.add("pulse");
  setTimeout(() => views.classList.remove("pulse"), 700);
}

async function syncViews() {
  const counted = sessionStorage.getItem("terox_counted");
  const endpoint = counted ? "get" : "hit";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(`${API}/${endpoint}/${KEY}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    const value = Number(data.value) || 0;
    localStorage.setItem(LOCAL_KEY, String(value));
    setViews(value, true);
    if (!counted) sessionStorage.setItem("terox_counted", "1");
  } catch (e) {
    // offline / API down / timeout: keep counting locally so the number still grows
    const next = (parseInt(localStorage.getItem(LOCAL_KEY) || "0", 10) || 0) + 1;
    localStorage.setItem(LOCAL_KEY, String(next));
    setViews(next, true);
    if (!counted) sessionStorage.setItem("terox_counted", "1");
  } finally {
    clearTimeout(timer);
  }
}

setViews(localStorage.getItem(LOCAL_KEY) || 0);
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
  startEq();
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

// ---------- audio equalizer ----------
const eq = document.getElementById("eq");
const eqBars = [];

if (eq) {
  for (let i = 0; i < 16; i++) {
    const bar = document.createElement("i");
    eq.appendChild(bar);
    eqBars.push(bar);
  }
}

let analyser = null;
let freqData = null;

function loopEq() {
  if (!document.hidden && analyser) {
    analyser.getByteFrequencyData(freqData);
    for (let i = 0; i < eqBars.length; i++) {
      const v = (freqData[i + 1] || 0) / 255;
      eqBars[i].style.transform = "scaleY(" + Math.max(0.08, v) + ")";
    }
  }
  requestAnimationFrame(loopEq);
}

function startEq() {
  if (!eq || analyser) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  try {
    const ctx = new AC();
    const src = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    src.connect(analyser);
    analyser.connect(ctx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
    eq.classList.add("on");
    loopEq();
  } catch (e) {
    /* audio graph unavailable — keep the site working */
  }
}

// ---------- ripple on social icons ----------
document.querySelectorAll(".soc").forEach((soc) => {
  soc.addEventListener("pointerdown", (e) => {
    const rect = soc.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.9;
    const wave = document.createElement("span");
    wave.className = "ripple";
    wave.style.width = size + "px";
    wave.style.height = size + "px";
    wave.style.left = e.clientX - rect.left + "px";
    wave.style.top = e.clientY - rect.top + "px";
    soc.appendChild(wave);
    setTimeout(() => wave.remove(), 650);
  });
});

// ---------- magnetic social icons ----------
const socials = document.getElementById("socials");

if (socials && canHover && !reduceMotion) {
  const items = Array.from(socials.querySelectorAll(".soc"));
  const RADIUS = 90;

  socials.addEventListener("pointermove", (e) => {
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < RADIUS) {
        const power = (1 - dist / RADIUS) * 10;
        el.style.transform =
          "translate(" + (dx / dist) * power + "px, " + ((dy / dist) * power - 3) + "px)";
      } else {
        el.style.transform = "";
      }
    });
  }, { passive: true });

  socials.addEventListener("pointerleave", () => {
    items.forEach((el) => (el.style.transform = ""));
  });
}

// ---------- snow parallax ----------
if (snow && canHover && !reduceMotion) {
  window.addEventListener("pointermove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 18;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    snow.style.transform = "translate(" + x + "px, " + y + "px)";
  }, { passive: true });
}
