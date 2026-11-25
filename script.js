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
const KEY = "teroxx/views";

function setViews(n) {
  const num = Number(n) || 0;
  views.textContent = num.toLocaleString("uk-UA");
  views.dataset.value = num;
}

async function syncViews() {
  const counted = sessionStorage.getItem("terox_counted");
  const endpoint = counted ? "get" : "hit";

  try {
    const res = await fetch(`${API}/${endpoint}/${KEY}`, { cache: "no-store" });
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    const value = Number(data.value) || 0;
    localStorage.setItem("terox_views", String(value));
    setViews(value);
    if (!counted) sessionStorage.setItem("terox_counted", "1");
  } catch (e) {
    // offline / API down: keep counting locally so the number still grows
    const next = (parseInt(localStorage.getItem("terox_views") || "0", 10) || 0) + 1;
    localStorage.setItem("terox_views", String(next));
    setViews(next);
    if (!counted) sessionStorage.setItem("terox_counted", "1");
  }
}

setViews(localStorage.getItem("terox_views") || 0);
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

enter.addEventListener("click", () => {
  enter.classList.add("hidden");
  audio.play().catch(() => {});
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