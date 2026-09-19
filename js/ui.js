// ui.js
// DOM-Manipulation, Modal-Logik, LED-Animation, Fortschrittsanzeige,
// Koordinaten-Overlay (SOLVE_THRESHOLD = 24), Toast-Feedback
// Abhängigkeiten (Ladereihenfolge): songs.js → i18n.js → audio.js → solver.js → state.js → ui.js

'use strict';

// ---------------------------------------------------------------------------
// 1. Konstanten
// ---------------------------------------------------------------------------

// ANZAHL DER SONGS ZUM LÖSEN (24 von 25 nötig)
const SOLVE_THRESHOLD = 24;

// VERSCHLÜSSELTE KOORDINATEN (Base64 + ROT13 + Salt "JUKEBOX21")
// Dekodierung: rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")
const COORDS_ENCODED = 'QSA1MMKwIDE3LjU5NSBSIDAxMcKwIDU5LjU3OFdIWFJPQksyMQ==';
// Dekodierung in showCoords():
// rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")

// VERSCHLÜSSELTE JOKER-KONFIGURATION (Base64 + ROT13 + Salt "JUKEBOX21")
// Klartext: {"codes":["1234","2004"],"pool":[1,2,3,4,5,6,7,8,9,10],"count":1}
const JOKER_CONFIG_ENCODED = 'eyJwYnFyZiI6WyIyMDA0IiwiMTc5MiJdLCJjYmJ5IjpbMSwzLDcsMTIsMjNdLCJwYmhhZyI6MX1XSFhST0JLMjE=';

// ---------------------------------------------------------------------------
// 2. Interner Modul-State
// ---------------------------------------------------------------------------

/** Das aktuell im Modal angezeigte Song-Objekt */
let currentSong = null;

/** Timer-Intervall für den modalen Fortschrittsbalken */
let progressInterval = null;

/** Status, ob der Benutzer gerade die Fortschrittsleiste zieht */
let isDraggingProgress = false;

function startProgressUpdater() {
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (isDraggingProgress) return;
    if (!window.AudioEngine) return;
    const { elapsed, duration } = AudioEngine.getProgress();
    const pct = duration > 0 ? Math.min(1, elapsed / duration) : 0;
    const fill = document.getElementById('modal-progress-fill');
    if (fill) fill.style.width = (pct * 100) + '%';
  }, 200);
}

function stopProgressUpdater() {
  clearInterval(progressInterval);
  progressInterval = null;
  isDraggingProgress = false;
}

function onMidiEnd() {
  stopLEDAnimation();
  stopProgressUpdater();
  const playPauseBtn = document.getElementById('modal-playpause-btn');
  if (playPauseBtn) playPauseBtn.textContent = '▶';
  const fill = document.getElementById('modal-progress-fill');
  if (fill) fill.style.width = '100%';
}

// ---------------------------------------------------------------------------
// 3. Song-Label-Bezeichner (1–26)
// ---------------------------------------------------------------------------

/**
 * Gibt die Song-Nummer als Label zurück: 1→"1", 2→"2", … 26→"26"
 * @param {number} id - 1-basierter Song-Index (1–26)
 * @returns {string}
 */
function getSongLabel(id) {
  return String(id);
}

// ---------------------------------------------------------------------------
// 4. Song-Grid rendern
// ---------------------------------------------------------------------------

/**
 * Iteriert über window.SONGS (25 Einträge) und befüllt #song-grid dynamisch.
 * Dekodierter Text ist IMMER im DOM, aber via CSS-Klasse .blurred versteckt
 * solange der Song nicht gelöst ist.
 */
function renderSongGrid() {
  const grid = document.getElementById('song-grid');
  if (!grid) {
    console.error('[ui] #song-grid nicht gefunden.');
    return;
  }

  grid.innerHTML = ''; // Sicherheitshalber leeren

  window.SONGS.forEach(function (song) {
    const label  = getSongLabel(song.id);
    const solved = State.isSolved(song.id);

    // Klartext dekodieren
    const titlePlain  = window.dec ? window.dec(song.display.title) : rot13(decodeURIComponent(escape(atob(song.display.title))));
    const artistPlain = window.dec ? window.dec(song.display.artist) : rot13(decodeURIComponent(escape(atob(song.display.artist))));

    // --- Wrapper ---
    const entry = document.createElement('div');
    entry.className  = 'song-entry' + (solved ? ' solved' : '');
    entry.setAttribute('role', 'listitem');
    entry.dataset.songId = song.id;

    // --- Button ---
    const btn = document.createElement('button');
    btn.className = 'song-button' + (solved ? ' solved' : '');
    btn.id        = 'btn-' + song.id;
    btn.dataset.songId   = song.id;
    btn.textContent      = label;
    btn.setAttribute('aria-label', 'Song ' + label + ' abspielen');
    btn.addEventListener('click', function () { openModal(song); });

    // --- Schild / Label ---
    const labelDiv = document.createElement('div');
    labelDiv.className = 'song-label';
    labelDiv.id        = 'label-' + song.id;
    labelDiv.style.cursor = 'pointer';
    labelDiv.addEventListener('click', function () { openModal(song); });

    const spanTitle = document.createElement('span');
    spanTitle.className = 'song-label-title' + (solved ? '' : ' blurred');
    spanTitle.textContent = titlePlain;

    const spanArtist = document.createElement('span');
    spanArtist.className = 'song-label-artist' + (solved ? '' : ' blurred');
    spanArtist.textContent = artistPlain;

    labelDiv.appendChild(spanTitle);
    labelDiv.appendChild(spanArtist);

    // --- Zusammenbauen ---
    entry.appendChild(btn);
    entry.appendChild(labelDiv);
    grid.appendChild(entry);
  });
}

// ---------------------------------------------------------------------------
// 5. Modal öffnen
// ---------------------------------------------------------------------------

/**
 * Öffnet das Modal für den übergebenen Song, startet die MIDI-Wiedergabe
 * und aktualisiert die Vorschau je nach Löse-Status.
 *
 * @param {Object} song - Song-Objekt aus window.SONGS
 */
function openModal(song) {
  currentSong = song;

  const solved       = State.isSolved(song.id);
  const titlePlain   = window.dec ? window.dec(song.display.title) : rot13(decodeURIComponent(escape(atob(song.display.title))));
  const artistPlain  = window.dec ? window.dec(song.display.artist) : rot13(decodeURIComponent(escape(atob(song.display.artist))));
  const labelText    = getSongLabel(song.id);

  // Modal-Titel
  const songNumberEl = document.getElementById('modal-song-number');
  if (songNumberEl) songNumberEl.textContent = labelText;

  // Vorschau-Schild
  const previewTitle  = document.getElementById('modal-preview-title');
  const previewArtist = document.getElementById('modal-preview-artist');
  if (previewTitle) {
    previewTitle.textContent = titlePlain;
    previewTitle.className   = solved ? '' : 'blurred';
  }
  if (previewArtist) {
    previewArtist.textContent = artistPlain;
    previewArtist.className   = solved ? '' : 'blurred';
  }

  // Eingabefeld leeren
  const input = document.getElementById('modal-input');
  if (input) {
    input.value = '';
    input.classList.remove('shake');
  }

  // Modal einblenden
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.removeAttribute('hidden');
    overlay.classList.add('visible');
  }

  const nowPlaying = document.getElementById('modal-now-playing');
  if (nowPlaying) nowPlaying.hidden = false;

  // Fokus auf Eingabefeld setzen
  if (input) {
    setTimeout(function () { input.focus(); }, 50);
  }

  // Fortschrittsbalken und Play/Pause-Button initialisieren
  const playPauseBtn = document.getElementById('modal-playpause-btn');
  if (playPauseBtn) playPauseBtn.textContent = '⏸';
  const fill = document.getElementById('modal-progress-fill');
  if (fill) fill.style.width = '0%';
  startProgressUpdater();

  // MIDI-Wiedergabe starten
  if (window.AudioEngine) {
    AudioEngine.playSong(song.midiFile, onMidiEnd).then(function (started) {
      if (started !== false) {
        startLEDAnimation();
      }
    }).catch(function (err) {
      console.error('[ui] Wiedergabefehler:', err);
      stopLEDAnimation();
      stopProgressUpdater();

      if (window.location.protocol === 'file:') {
        showToast('toast_file_error');
      } else {
        showToast('toast_audio_error');
      }
    });
  }
}

// ---------------------------------------------------------------------------
// 5b. LED-Equalizer-Animation (VU-Meter & Puls)
// ---------------------------------------------------------------------------

let ledTimer = null;
let currentLevelLeft = 0;
let currentLevelRight = 0;
let bottomStep = 0;

/**
 * Startet den dynamischen LED-Equalizer (VU-Meter an den Seiten, Puls unten).
 */
function startLEDAnimation() {
  stopLEDAnimation(); // Evtl. laufende Animation stornieren

  const ledBar = document.getElementById('led-bar');
  if (ledBar) ledBar.classList.add('playing');

  const leftLeds = document.querySelectorAll('.led-strip-left .led');
  const rightLeds = document.querySelectorAll('.led-strip-right .led');
  const bottomLeds = document.querySelectorAll('.led-strip-bottom .led');

  if (!leftLeds.length && !rightLeds.length) return;

  // Intervall für dynamischen Rhythmus-Effekt (alle 70 ms)
  ledTimer = setInterval(function () {
    // 1. Target-Level-Erzeugung mit geglättetem Peak-Falloff (VU-Meter Physik)
    const targetLeft = Math.floor(Math.random() * 10) + 1;
    const targetRight = Math.floor(Math.random() * 10) + 1;

    if (targetLeft > currentLevelLeft) {
      currentLevelLeft = targetLeft;
    } else {
      currentLevelLeft = Math.max(1, currentLevelLeft - 1);
    }

    if (targetRight > currentLevelRight) {
      currentLevelRight = targetRight;
    } else {
      currentLevelRight = Math.max(1, currentLevelRight - 1);
    }

    // 2. Linken Equalizer aktualisieren (Index 0 = led-l-1 unten, Index 9 = led-l-10 oben)
    leftLeds.forEach(function (led, index) {
      const levelNum = index + 1;
      if (levelNum <= currentLevelLeft) {
        led.classList.add('lit');
        if (levelNum === currentLevelLeft) {
          led.classList.add('peak');
        } else {
          led.classList.remove('peak');
        }
      } else {
        led.classList.remove('lit', 'peak');
      }
    });

    // 3. Rechten Equalizer aktualisieren
    rightLeds.forEach(function (led, index) {
      const levelNum = index + 1;
      if (levelNum <= currentLevelRight) {
        led.classList.add('lit');
        if (levelNum === currentLevelRight) {
          led.classList.add('peak');
        } else {
          led.classList.remove('peak');
        }
      } else {
        led.classList.remove('lit', 'peak');
      }
    });

    // 4. Untere Leiste: Rhythmisch leuchten
    bottomStep = (bottomStep + 1) % (bottomLeds.length || 1);
    bottomLeds.forEach(function (led, index) {
      if ((index + bottomStep) % 3 === 0) {
        led.classList.add('lit');
      } else {
        led.classList.remove('lit');
      }
    });

  }, 70);
}

/**
 * Stoppt die LED-Animation und schaltet alle LEDs ab.
 */
function stopLEDAnimation() {
  if (ledTimer) {
    clearInterval(ledTimer);
    ledTimer = null;
  }

  const ledBar = document.getElementById('led-bar');
  if (ledBar) ledBar.classList.remove('playing');

  const allLeds = document.querySelectorAll('#led-bar .led');
  allLeds.forEach(function (led) {
    led.classList.remove('lit', 'peak');
  });

  currentLevelLeft = 0;
  currentLevelRight = 0;
}

// ---------------------------------------------------------------------------
// 6. Modal schließen
// ---------------------------------------------------------------------------

/**
 * Versteckt das Modal und stoppt die aktuelle MIDI-Wiedergabe.
 */
function closeModal() {
  stopProgressUpdater();
  const fill = document.getElementById('modal-progress-fill');
  if (fill) fill.style.width = '0%';
  const playPauseBtn = document.getElementById('modal-playpause-btn');
  if (playPauseBtn) playPauseBtn.textContent = '⏸';

  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    overlay.setAttribute('hidden', '');
  }

  const nowPlaying = document.getElementById('modal-now-playing');
  if (nowPlaying) nowPlaying.hidden = true;

  // MIDI stoppen
  if (window.AudioEngine) {
    AudioEngine.stopCurrentSong();
  }

  // LED deaktivieren
  stopLEDAnimation();

  currentSong = null;
}

// ---------------------------------------------------------------------------
// 7. Antwort prüfen
// ---------------------------------------------------------------------------

/**
 * Liest die Benutzereingabe, prüft sie gegen die gespeicherten Antworten
 * und verarbeitet Richtig/Falsch-Feedback.
 */
function submitAnswer() {
  if (!currentSong) return;

  const input    = document.getElementById('modal-input');
  const inputVal = input ? input.value.trim() : '';

  if (!inputVal) return;

  // Bereits gelöst?
  if (State.isSolved(currentSong.id)) {
    showToast('toast_already_solved');
    return;
  }

  const result = Solver.checkAnswer(currentSong, inputVal);

  if (result.correct) {
    // State aktualisieren
    State.markSolved(currentSong.id);

    // Entry & Button auf grün schalten
    const entry = document.querySelector('.song-entry[data-song-id="' + currentSong.id + '"]');
    if (entry) entry.classList.add('solved');

    const btn = document.getElementById('btn-' + currentSong.id);
    if (btn) btn.classList.add('solved');

    // Label-Blur entfernen & Flash-Effekt auslösen
    const labelDiv = document.getElementById('label-' + currentSong.id);
    if (labelDiv) {
      labelDiv.classList.add('solved-flash');
      labelDiv.querySelectorAll('.blurred').forEach(function (el) {
        el.classList.remove('blurred');
      });
    }

    // Modal-Vorschau scharf schalten
    const previewTitle  = document.getElementById('modal-preview-title');
    const previewArtist = document.getElementById('modal-preview-artist');
    if (previewTitle)  previewTitle.classList.remove('blurred');
    if (previewArtist) previewArtist.classList.remove('blurred');

    // Toast anzeigen
    showToast('toast_correct');

    // Fortschritt aktualisieren
    updateProgress();

    // Modal nach kurzer Verzögerung schließen
    setTimeout(closeModal, 1500);

  } else {
    // Falsch – Shake-Effekt
    const modalBox    = document.getElementById('modal-box');
    const shakeTarget = input || modalBox;
    if (shakeTarget) {
      shakeTarget.classList.remove('shake');
      // Reflow erzwingen damit die Animation neu startet
      void shakeTarget.offsetWidth;
      shakeTarget.classList.add('shake');
      setTimeout(function () { shakeTarget.classList.remove('shake'); }, 600);
    }

    showToast('toast_wrong');
  }
}

// ---------------------------------------------------------------------------
// 8. Fortschritt aktualisieren
// ---------------------------------------------------------------------------

/**
 * Aktualisiert die Anzeige „X / 25 gelöst" und prüft, ob die
 * Lösungsschwelle erreicht wurde.
 */
function updateProgress() {
  const count = State.getSolvedCount();

  const countEl = document.getElementById('solved-count');
  if (countEl) countEl.textContent = count;

  // Koordinaten anzeigen wenn Schwelle erreicht
  const coordsBtn = document.getElementById('show-coords-btn');
  if (count >= SOLVE_THRESHOLD) {
    showCoords();
  } else if (coordsBtn) {
    coordsBtn.hidden = true;
  }
}

// ---------------------------------------------------------------------------
// 8b. Fortschritt zurücksetzen (Reset)
// ---------------------------------------------------------------------------

/**
 * Fragt eine Bestätigung ab und setzt bei Bestätigung den gesamten Spielfortschritt zurück.
 */
function handleReset() {
  if (confirm('Wirklich alles zurücksetzen?')) {
    State.resetProgress();
    renderSongGrid();
    updateProgress();

    // Eventuell geöffnetes Koordinaten-Overlay schließen
    const coordsOverlay = document.getElementById('coords-overlay');
    if (coordsOverlay) {
      coordsOverlay.classList.remove('visible');
      coordsOverlay.hidden = true;
      coordsOverlay.setAttribute('hidden', '');
    }

    // Joker-Eingabe ggf. wieder freigeben
    const jokerInput = document.getElementById('info-joker-input');
    if (jokerInput) {
      jokerInput.disabled = false;
      jokerInput.value = '';
    }
    const jokerSubmitBtn = document.getElementById('info-joker-submit-btn');
    if (jokerSubmitBtn) {
      jokerSubmitBtn.disabled = false;
    }

    showToast('toast_reset', 'Fortschritt zurückgesetzt');
  }
}
window.handleReset = handleReset;

// ---------------------------------------------------------------------------
// 9. Koordinaten anzeigen
// ---------------------------------------------------------------------------

/**
 * Prüft, ob die Koordinaten freigeschaltet sind (mindestens SOLVE_THRESHOLD Songs gelöst).
 * @returns {boolean}
 */
function areCoordsUnlocked() {
  return typeof State !== 'undefined' && State.getSolvedCount && State.getSolvedCount() >= SOLVE_THRESHOLD;
}

/**
 * Dekodiert die Zielkoordinaten aus dem verschlüsselten String.
 * @returns {string}
 */
function getDecodedCoords() {
  try {
    return rot13(
      decodeURIComponent(escape(atob(COORDS_ENCODED)))
    ).replace('JUKEBOX21', '');
  } catch (e) {
    return '';
  }
}

/**
 * Dekodiert die verschlüsselten Koordinaten und zeigt das goldene Overlay.
 * Dekodierung: rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")
 */
function showCoords() {
  // Koordinaten-Button im Header dauerhaft anzeigen
  const coordsBtn = document.getElementById('show-coords-btn');
  if (coordsBtn) {
    coordsBtn.hidden = false;
  }

  // Dekodierung
  const coords = getDecodedCoords();

  const overlay   = document.getElementById('coords-overlay');
  const display   = document.getElementById('coords-display');
  const copyBtn   = document.getElementById('coords-copy');
  const shareBtn  = document.getElementById('coords-share');
  const closeBtn  = document.getElementById('coords-close');

  if (display) {
    display.textContent = coords;
  }

  if (overlay) {
    overlay.removeAttribute('hidden');
    overlay.hidden = false;
    overlay.classList.add('visible');
  }

  // Kopier-Button – alten Listener via cloneNode entfernen (verhindert Doppel-Binding)
  if (copyBtn) {
    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
    newCopyBtn.addEventListener('click', function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(coords).then(function () {
          showToast('toast_copied');
        }).catch(function () {
          showToast('toast_copied');
        });
      } else {
        // Fallback für ältere Browser
        const ta = document.createElement('textarea');
        ta.value = coords;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('toast_copied');
      }
    });
  }

  // Teilen-Button im Koordinaten-Modal
  if (shareBtn) {
    const newShareBtn = shareBtn.cloneNode(true);
    shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
    newShareBtn.addEventListener('click', function () {
      openShareOverlay();
    });
  }

  // Schließen-Button (Overlay nur verstecken, nicht zerstören oder State zurücksetzen)
  if (closeBtn) {
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', function () {
      if (overlay) {
        overlay.classList.remove('visible');
        overlay.hidden = true;
        overlay.setAttribute('hidden', '');
      }
    });
  }
}

// ---------------------------------------------------------------------------
// 10. Teilen-Overlay & QR-Code
// ---------------------------------------------------------------------------

/**
 * Öffnet das Teilen-Modal und generiert den QR-Code.
 * Berücksichtigt, ob Koordinaten bereits freigeschaltet sind.
 */
function openShareOverlay() {
  const url = window.location.href;
  const isUnlocked = areCoordsUnlocked();
  const coords = isUnlocked ? getDecodedCoords() : '';
  const lang = window.currentLang || 'de';
  const dict = (window.I18N && window.I18N[lang]) ? window.I18N[lang] : {};

  const urlDisplay = document.getElementById('share-url-display');
  if (urlDisplay) {
    urlDisplay.textContent = url;
  }

  const coordsBox = document.getElementById('share-coords-box');
  const coordsDisplay = document.getElementById('share-coords-display');
  const titleEl = document.getElementById('share-title');
  const textEl = document.getElementById('share-text');
  const copyBtn = document.getElementById('share-copy-btn');

  // Wenn Koordinaten gelöst sind, im Share-Modal hervorheben
  if (isUnlocked && coords) {
    if (coordsBox) coordsBox.hidden = false;
    if (coordsDisplay) coordsDisplay.textContent = coords;
    if (titleEl) titleEl.textContent = dict['share-title-solved'] || '🎉 Koordinaten teilen!';
    if (textEl) textEl.textContent = dict['share-text-solved'] || 'Rätsel gelöst! Teile die Koordinaten mit deinen Mitspielern:';
    if (copyBtn) copyBtn.textContent = dict['share-copy-all'] || '📋 Link & Koordinaten kopieren';
  } else {
    if (coordsBox) coordsBox.hidden = true;
    if (titleEl) titleEl.textContent = dict['share-title'] || '🎵 Gemeinsam spielen!';
    if (textEl) textEl.textContent = dict['share-text'] || 'Schicke den Link an deine Mitspieler:';
    if (copyBtn) copyBtn.textContent = dict['share-copy'] || '📋 Link kopieren';
  }

  // QR-Code via qrserver.com mit Fallback auf quickchart.io
  const encodedUrl = encodeURIComponent(url);
  const qrImg = document.createElement('img');
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  qrImg.alt = 'QR-Code';
  qrImg.width = 200;
  qrImg.height = 200;
  qrImg.loading = 'eager';
  qrImg.onerror = function () {
    if (!this.dataset.fallbackTried) {
      this.dataset.fallbackTried = '1';
      this.src = `https://quickchart.io/qr?text=${encodedUrl}&size=200`;
    }
  };

  const qrDiv = document.getElementById('share-qr');
  if (qrDiv) {
    qrDiv.innerHTML = '';
    qrDiv.appendChild(qrImg);
  }

  const shareOverlay = document.getElementById('share-overlay');
  if (shareOverlay) {
    shareOverlay.hidden = false;
    shareOverlay.removeAttribute('hidden');
    shareOverlay.classList.add('visible');
  }
}

/**
 * Schließt das Teilen-Modal.
 */
function closeShareOverlay() {
  const shareOverlay = document.getElementById('share-overlay');
  if (shareOverlay) {
    shareOverlay.classList.remove('visible');
    shareOverlay.hidden = true;
    shareOverlay.setAttribute('hidden', '');
  }
}

// ---------------------------------------------------------------------------
// 11. Toast anzeigen
// ---------------------------------------------------------------------------

/** Laufende Toast-Timeout-ID (verhindert überlappendes Ausblenden) */
let _toastTimeout = null;

/**
 * Zeigt kurzzeitig eine Feedback-Meldung an.
 * @param {string} key - Schlüssel in I18N[currentLang] (z. B. 'toast_correct')
 * @param {string} [customText] - Optionaler individueller Meldungstext
 */
function showToast(key, customText) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;

  const lang = window.currentLang || 'de';
  const dict = (window.I18N && window.I18N[lang]) ? window.I18N[lang] : {};
  const text = customText || dict[key] || key;

  msgEl.textContent = text;

  // CSS-Klassen fuer Farbstyling (Gruen/Rot) setzen
  toast.classList.remove('correct', 'wrong');
  if (key === 'toast_correct' || key === 'toast_already_solved' || key === 'toast_copied' || key === 'share-copied' || key === 'toast_joker_success' || key === 'toast_reset') {
    toast.classList.add('correct');
  } else if (key === 'toast_wrong' || key === 'toast_file_error' || key === 'toast_audio_error' || key === 'toast_joker_invalid' || key === 'toast_joker_already_used') {
    toast.classList.add('wrong');
  }

  toast.removeAttribute('hidden');
  toast.classList.add('visible');

  // Vorherigen Timeout abbrechen
  if (_toastTimeout) clearTimeout(_toastTimeout);

  _toastTimeout = setTimeout(function () {
    toast.classList.remove('visible');
    setTimeout(function () {
      toast.setAttribute('hidden', '');
      toast.classList.remove('correct', 'wrong');
    }, 300);
    _toastTimeout = null;
  }, 2500);
}

// ---------------------------------------------------------------------------
// 11b. Joker-Code Freischaltung
// ---------------------------------------------------------------------------

/**
 * Dekodiert die verschlüsselte Joker-Konfiguration (Codes, Pool, Count).
 * @returns {{ codes: string[], pool: number[], count: number } | null}
 */
function getJokerConfig() {
  try {
    const jsonStr = rot13(
      decodeURIComponent(escape(atob(JOKER_CONFIG_ENCODED)))
    ).replace('JUKEBOX21', '');
    const cfg = JSON.parse(jsonStr);
    if (!cfg.codes && cfg.code) {
      cfg.codes = [String(cfg.code).trim()];
    } else if (Array.isArray(cfg.codes)) {
      cfg.codes = cfg.codes.map(function (c) { return String(c).trim(); });
    } else {
      cfg.codes = [];
    }
    return cfg;
  } catch (e) {
    console.error('[Joker] Fehler beim Dekodieren der Konfiguration:', e);
    return null;
  }
}

/**
 * Verarbeitet die Eingabe des 4-stelligen Joker-Codes.
 * Jeder konfigurierte Code kann genau 1x eingelöst werden und
 * schaltet zufällig N ungelöste Songs aus dem definierten Pool frei.
 */
function handleJokerSubmit() {
  const input = document.getElementById('info-joker-input');
  const rawVal = input ? input.value.trim() : '';

  if (!rawVal) return;

  const config = getJokerConfig();
  if (!config || !config.codes || config.codes.length === 0) {
    showToast('toast_joker_invalid');
    return;
  }

  // Wurde genau DIESER Code bereits eingelöst?
  if (typeof State !== 'undefined' && State.isCodeUsed && State.isCodeUsed(rawVal)) {
    if (input) {
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
      setTimeout(function () { input.classList.remove('shake'); }, 600);
    }
    showToast('toast_joker_already_used');
    return;
  }

  // Ist der Code in den konfigurierten Codes enthalten?
  if (!config.codes.includes(rawVal)) {
    if (input) {
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
      setTimeout(function () { input.classList.remove('shake'); }, 600);
    }
    showToast('toast_joker_invalid');
    return;
  }

  // Noch ungelöste Songs aus dem definierten Pool filtern
  const pool = Array.isArray(config.pool) ? config.pool : [];
  const unsolved = pool.filter(function (id) {
    return !State.isSolved(id) && SONGS.some(function (s) { return s.id === id; });
  });

  if (unsolved.length === 0) {
    showToast('toast_joker_pool_exhausted');
    return;
  }

  // Zufällig count Songs auswählen
  const targetCount = Math.min(Math.max(1, parseInt(config.count, 10) || 1), unsolved.length);
  const shuffled = [...unsolved].sort(function () { return 0.5 - Math.random(); });
  const chosenIds = shuffled.slice(0, targetCount);

  const revealedNames = [];
  chosenIds.forEach(function (id) {
    // 1. Im State als gelöst markieren
    State.markSolved(id);

    // 2. Entry & Button im Grid grün schalten
    const entry = document.querySelector('.song-entry[data-song-id="' + id + '"]');
    if (entry) entry.classList.add('solved');

    const btn = document.getElementById('btn-' + id);
    if (btn) btn.classList.add('solved');

    // 3. Label unblurren und aufblitzen lassen
    const labelDiv = document.getElementById('label-' + id);
    if (labelDiv) {
      labelDiv.classList.add('solved-flash');
      labelDiv.querySelectorAll('.blurred').forEach(function (el) {
        el.classList.remove('blurred');
      });
    }

    // 4. Name für Feedback zusammenstellen
    const songObj = SONGS.find(function (s) { return s.id === id; });
    if (songObj) {
      let title = '';
      let artist = '';
      if (songObj.display) {
        if (songObj.display.title) title = dec(songObj.display.title);
        if (songObj.display.artist) artist = dec(songObj.display.artist);
      }
      const labelText = [artist, title].filter(Boolean).join(' - ');
      revealedNames.push(labelText ? '#' + id + ' (' + labelText + ')' : '#' + id);
    } else {
      revealedNames.push('#' + id);
    }
  });

  // Code im State als verbraucht markieren
  if (typeof State !== 'undefined' && State.markCodeUsed) {
    State.markCodeUsed(rawVal);
  }

  // Gesamt-Fortschritt und ggf. Koordinaten aktualisieren
  updateProgress();

  // Eingabefeld leeren; falls alle Codes aufgebraucht sind, sperren
  if (input) {
    input.value = '';
    if (typeof State !== 'undefined' && State.getUsedCodesCount && State.getUsedCodesCount() >= config.codes.length) {
      input.disabled = true;
      const submitBtn = document.getElementById('info-joker-submit-btn');
      if (submitBtn) submitBtn.disabled = true;
    }
  }

  // Erfolgs-Toast anzeigen
  const lang = window.currentLang || 'de';
  const dict = (window.I18N && window.I18N[lang]) ? window.I18N[lang] : {};
  const tpl = dict.toast_joker_success || '🎉 Joker eingelöst! Aufgedeckt: {songs}';
  const successMsg = tpl.replace('{songs}', revealedNames.join(', '));
  showToast('toast_joker_success', successMsg);

  // Info-Overlay schließen
  const infoOverlay = document.getElementById('info-overlay');
  if (infoOverlay) {
    infoOverlay.classList.remove('visible');
    infoOverlay.hidden = true;
    infoOverlay.setAttribute('hidden', '');
  }
}

// ---------------------------------------------------------------------------
// 12. Initialisierung
// ---------------------------------------------------------------------------

/**
 * Bootstrapped die gesamte UI:
 *  - Song-Grid rendern
 *  - Fortschrittsanzeige aktualisieren
 *  - Event-Listener für Modal, Overlay und Sprach-Toggle registrieren
 */
function init() {
  State.loadProgress();

  // Grid und Fortschritt
  renderSongGrid();
  updateProgress();

  // ---- Modal: Schließen-Button ----
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // ---- Modal: Bestätigen-Button ----
  const modalSubmit = document.getElementById('modal-submit');
  if (modalSubmit) {
    modalSubmit.addEventListener('click', submitAnswer);
  }

  // ---- Modal: Enter-Taste im Eingabefeld ----
  const modalInput = document.getElementById('modal-input');
  if (modalInput) {
    modalInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      }
    });
  }

  // ---- Modal: Player-Controls (Play/Pause & Restart) ----
  const modalPlayPause = document.getElementById('modal-playpause-btn');
  if (modalPlayPause) {
    modalPlayPause.addEventListener('click', () => {
      if (!window.AudioEngine) return;
      if (AudioEngine.isPaused()) {
        AudioEngine.resumeSong();
        modalPlayPause.textContent = '⏸';
        startProgressUpdater();
        startLEDAnimation();
      } else {
        const prog = AudioEngine.getProgress();
        if (prog.duration > 0 && prog.elapsed >= prog.duration && currentSong) {
          AudioEngine.restartSong(currentSong.midiFile, onMidiEnd);
          modalPlayPause.textContent = '⏸';
          startProgressUpdater();
          startLEDAnimation();
        } else {
          AudioEngine.pauseSong();
          modalPlayPause.textContent = '▶';
          stopProgressUpdater();
          stopLEDAnimation();
        }
      }
    });
  }

  const modalRestart = document.getElementById('modal-restart-btn');
  if (modalRestart) {
    modalRestart.addEventListener('click', () => {
      if (!window.AudioEngine || !currentSong) return;
      AudioEngine.restartSong(currentSong.midiFile, onMidiEnd);
      const playPause = document.getElementById('modal-playpause-btn');
      if (playPause) playPause.textContent = '⏸';
      startProgressUpdater();
      startLEDAnimation();
    });
  }

  // ---- Modal: Fortschrittsbalken Klick & Drag (Seeking / Scrubbing) ----
  const progressBar = document.getElementById('modal-progress-bar');
  if (progressBar) {
    function seekFromProgressEvent(e) {
      if (!window.AudioEngine || !currentSong) return;
      const rect = progressBar.getBoundingClientRect();
      if (rect.width <= 0) return;
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const pct = clickX / rect.width;
      const { duration } = AudioEngine.getProgress();
      if (duration > 0) {
        AudioEngine.seekTo(pct * duration);
        const fill = document.getElementById('modal-progress-fill');
        if (fill) fill.style.width = (pct * 100) + '%';

        const playPauseBtn = document.getElementById('modal-playpause-btn');
        if (playPauseBtn) {
          playPauseBtn.textContent = AudioEngine.isPaused() ? '▶' : '⏸';
        }
      }
    }

    progressBar.addEventListener('pointerdown', function (e) {
      isDraggingProgress = true;
      try { progressBar.setPointerCapture(e.pointerId); } catch (err) {}
      seekFromProgressEvent(e);
    });

    progressBar.addEventListener('pointermove', function (e) {
      if (!isDraggingProgress) return;
      seekFromProgressEvent(e);
    });

    const stopProgressDrag = function (e) {
      if (isDraggingProgress) {
        isDraggingProgress = false;
        try { progressBar.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    };

    progressBar.addEventListener('pointerup', stopProgressDrag);
    progressBar.addEventListener('pointercancel', stopProgressDrag);
  }

  // ---- Modal-Overlay: Klick auf Hintergrund schließt Modal ----
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      // Nur schließen wenn direkt auf den Overlay-Hintergrund (nicht die Box) geklickt
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // ---- Tastatur: ESC schließt Modal, Koordinaten-Overlay, Share-Overlay & Info-Overlay ----
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      const coordsOverlay = document.getElementById('coords-overlay');
      if (coordsOverlay && (coordsOverlay.classList.contains('visible') || !coordsOverlay.hasAttribute('hidden') || !coordsOverlay.hidden)) {
        coordsOverlay.classList.remove('visible');
        coordsOverlay.hidden = true;
        coordsOverlay.setAttribute('hidden', '');
      }
      const shareOverlay = document.getElementById('share-overlay');
      if (shareOverlay && (shareOverlay.classList.contains('visible') || !shareOverlay.hasAttribute('hidden') || !shareOverlay.hidden)) {
        closeShareOverlay();
      }
      const infoOverlay = document.getElementById('info-overlay');
      if (infoOverlay && (infoOverlay.classList.contains('visible') || !infoOverlay.hasAttribute('hidden') || !infoOverlay.hidden)) {
        infoOverlay.classList.remove('visible');
        infoOverlay.hidden = true;
        infoOverlay.setAttribute('hidden', '');
      }
    }
  });

  // ---- Info-Overlay beim Starten anzeigen & Event-Listener verdrahten ----
  const infoOverlay = document.getElementById('info-overlay');
  if (infoOverlay) {
    infoOverlay.classList.add('visible');
    infoOverlay.hidden = false;
    infoOverlay.removeAttribute('hidden');

    infoOverlay.addEventListener('click', function (e) {
      if (e.target === infoOverlay) {
        infoOverlay.classList.remove('visible');
        infoOverlay.hidden = true;
        infoOverlay.setAttribute('hidden', '');
      }
    });
  }

  // ---- Header: Info-Button & Spielanleitung-Overlay ----
  const infoBtn = document.getElementById('info-btn');
  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      if (infoOverlay) {
        infoOverlay.classList.add('visible');
        infoOverlay.hidden = false;
        infoOverlay.removeAttribute('hidden');
      }
    });
  }

  const infoCloseBtn = document.getElementById('info-close-btn');
  if (infoCloseBtn) {
    infoCloseBtn.addEventListener('click', () => {
      if (infoOverlay) {
        infoOverlay.classList.remove('visible');
        infoOverlay.hidden = true;
        infoOverlay.setAttribute('hidden', '');
      }
    });
  }

  // ---- Info-Overlay: Joker-Code Einlösen ----
  const jokerSubmitBtn = document.getElementById('info-joker-submit-btn');
  if (jokerSubmitBtn) {
    jokerSubmitBtn.addEventListener('click', handleJokerSubmit);
  }

  const jokerInput = document.getElementById('info-joker-input');
  if (jokerInput) {
    jokerInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleJokerSubmit();
      }
    });
  }

  // ---- Header: Koordinaten-Button ----
  const showCoordsBtn = document.getElementById('show-coords-btn');
  if (showCoordsBtn) {
    showCoordsBtn.addEventListener('click', showCoords);
  }

  // ---- Header: Teilen-Button ----
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', openShareOverlay);
  }

  // ---- Share-Modal: Native Teilen-Button ----
  const shareNativeBtn = document.getElementById('share-native-btn');
  if (shareNativeBtn) {
    shareNativeBtn.addEventListener('click', async () => {
      const url = window.location.href;
      const isUnlocked = areCoordsUnlocked();
      const coords = isUnlocked ? getDecodedCoords() : '';
      const lang = window.currentLang || 'de';
      const dict = (window.I18N && window.I18N[lang]) ? window.I18N[lang] : {};

      const shareTitle = isUnlocked
        ? (dict['share-coords-title'] || 'Projekt Jukebox - Koordinaten')
        : (dict['title'] || 'Projekt Jukebox');

      const shareText = isUnlocked
        ? (dict['share-coords-text'] || '🎉 Ich habe das Jukebox-Rätsel gelöst! Zielkoordinaten: {coords}').replace('{coords}', coords)
        : (dict['share-msg-default'] || 'Erkennst du alle Songs? Löse das Geocaching-Rätsel!');

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: url
          });
          return;
        } catch(e) {}
      }

      const textToCopy = isUnlocked ? `${shareText}\n${url}` : url;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
        } catch(e) {}
      }
      showToast('share-copied');
    });
  }

  // ---- Share-Modal: Link kopieren-Button ----
  const shareCopyBtn = document.getElementById('share-copy-btn');
  if (shareCopyBtn) {
    shareCopyBtn.addEventListener('click', async () => {
      const url = window.location.href;
      const isUnlocked = areCoordsUnlocked();
      const coords = isUnlocked ? getDecodedCoords() : '';
      const lang = window.currentLang || 'de';
      const dict = (window.I18N && window.I18N[lang]) ? window.I18N[lang] : {};

      const textToCopy = isUnlocked && coords
        ? `${dict['share-coords-label'] || '📍 Zielkoordinaten:'} ${coords}\n${url}`
        : url;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
        } catch(e) {}
      }
      showToast('share-copied');
    });
  }

  // ---- Coords-Overlay: Teilen-Button initial anbinden ----
  const coordsShareBtn = document.getElementById('coords-share');
  if (coordsShareBtn) {
    coordsShareBtn.addEventListener('click', function () {
      openShareOverlay();
    });
  }

  // ---- Share-Modal: Schließen-Button ----
  const shareCloseBtn = document.getElementById('share-close-btn');
  if (shareCloseBtn) {
    shareCloseBtn.addEventListener('click', () => {
      closeShareOverlay();
    });
  }

  // ---- Share-Overlay: Klick auf Hintergrund schließt Share-Modal ----
  const shareOverlay = document.getElementById('share-overlay');
  if (shareOverlay) {
    shareOverlay.addEventListener('click', function (e) {
      if (e.target === shareOverlay) {
        closeShareOverlay();
      }
    });
  }

  // ---- Sprach-Toggle: wird von i18n.js (initI18N) automatisch gebunden.
  //      Kein doppelter Listener nötig. ----
}

// ---------------------------------------------------------------------------
// 12. DOMContentLoaded-Einstiegspunkt
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', init);
