const STORAGE_KEY = "pratha_settings_v1";

let settings = null;
const listeners = new Set();

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function init() {
  settings = readFromStorage();
  if (settings) {
    listeners.forEach((fn) => fn(settings));
  }
}

export function getSettings() {
  return settings;
}

export function setSettings(data) {
  settings = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(settings));
}

export function subscribeSettings(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== "undefined") {
  init();
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      settings = e.newValue ? JSON.parse(e.newValue) : null;
      listeners.forEach((fn) => fn(settings));
    }
  });
}
