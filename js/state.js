// state.js
// Spielfortschritt-Verwaltung (localStorage) – CODE VORHANDEN, ABER DEAKTIVIERT
// Status: DEAKTIVIERT (alle aktiven Zeilen auskommentiert)
// Aktivierung: Kommentare entfernen wenn Cache live geht
// Exports: window.State = { markSolved, isSolved, getSolvedCount, solvedSongs, isCodeUsed, markCodeUsed, getUsedCodesCount, isJokerUsed, setJokerUsed, loadProgress, resetProgress }

function getInstancePrefix() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    if (/^jukebox_\d+$/i.test(segments[i])) {
      return segments[i].toLowerCase();
    }
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    if (!segments[i].includes('.')) {
      return segments[i].toLowerCase();
    }
  }
  return 'jukebox';
}

const INSTANCE_PREFIX = getInstancePrefix();

// ---------------------------------------------------------------------------
// 1. Interner State
// ---------------------------------------------------------------------------
let solvedSongs = new Set(); // IDs der gelösten Songs

// ---------------------------------------------------------------------------
// 2. Lade-Funktion
// ---------------------------------------------------------------------------
function loadProgress() {
  try {
    const saved = localStorage.getItem(`${INSTANCE_PREFIX}_progress`);
    if (saved) {
      const decoded = dec(saved);
      const salt = 'JUKEBOX21';
      if (!decoded.endsWith(salt)) {
        throw new Error('Ungültiger Salt');
      }
      const jsonStr = decoded.slice(0, -salt.length);
      const data = JSON.parse(jsonStr);
      solvedSongs = new Set(data.s || []);
      usedJokerCodes = new Set(data.j || []);
    }
  } catch (e) {
    if (typeof showToast === 'function') {
      showToast(null, 'Spielstand beschädigt – Neustart');
    }
    solvedSongs = new Set();
    usedJokerCodes = new Set();
  }
}

// ---------------------------------------------------------------------------
// 3. Speicher-Funktion
// ---------------------------------------------------------------------------
function saveProgress() {
  const data = {
    s: [...solvedSongs],
    j: [...usedJokerCodes]
  };
  const payload = JSON.stringify(data) + 'JUKEBOX21';
  localStorage.setItem(`${INSTANCE_PREFIX}_progress`, enc(payload));
}

// ---------------------------------------------------------------------------
// 4. Reset-Funktion
// ---------------------------------------------------------------------------
function resetProgress() {
  localStorage.removeItem(`${INSTANCE_PREFIX}_progress`);
  solvedSongs = new Set();
  usedJokerCodes = new Set();
}

// ---------------------------------------------------------------------------
let usedJokerCodes = new Set();

function markSolved(id) {
  solvedSongs.add(id);
  saveProgress();
}

function isSolved(id) {
  return solvedSongs.has(id);
}

function getSolvedCount() {
  return solvedSongs.size;
}

function isCodeUsed(code) {
  return usedJokerCodes.has(String(code).trim());
}

function markCodeUsed(code) {
  usedJokerCodes.add(String(code).trim());
  saveProgress();
}

function getUsedCodesCount() {
  return usedJokerCodes.size;
}

function isJokerUsed() {
  return usedJokerCodes.size > 0;
}

function setJokerUsed() {
  // Kompatibilitäts-Alias
}

// Initialisierung (DEAKTIVIERT):
// loadProgress();

// ---------------------------------------------------------------------------
// 6. Export
// ---------------------------------------------------------------------------
window.State = {
  markSolved,
  isSolved,
  getSolvedCount,
  solvedSongs,
  isCodeUsed,
  markCodeUsed,
  getUsedCodesCount,
  isJokerUsed,
  setJokerUsed,
  loadProgress,
  resetProgress
};
