// i18n.js
// Übersetzungen DE/EN/CS, Sprachumschalt-Logik, data-i18n Attribut-Binding
// Toggle-Button: 🇩🇪 DE | EN 🇬🇧 | CZ 🇨🇿
// Reihenfolge im HTML: songs.js → i18n.js → audio.js → solver.js → state.js → ui.js

'use strict';

// ---------------------------------------------------------------------------
// Dreier-Zyklus Sprachen & Labels
// ---------------------------------------------------------------------------

const LANGS = ['de', 'en', 'cs'];
const LANG_LABELS = {
  de: '🇩🇪 DE | EN 🇬🇧 | CZ 🇨🇿',
  en: '🇬🇧 EN | CZ 🇨🇿 | DE 🇩🇪',
  cs: '🇨🇿 CZ | DE 🇩🇪 | EN 🇬🇧'
};

function updateLangToggleLabel() {
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = LANG_LABELS[window.currentLang] || LANG_LABELS['de'];
}

// ---------------------------------------------------------------------------
// Übersetzungs-Tabelle
// ---------------------------------------------------------------------------

const I18N = {
  de: {
    // Header
    title:                     'PROJEKT JUKEBOX',
    'lang-toggle':             '🇬🇧 EN',
    'show-coords-btn':         '📍 Koordinaten',

    // Fortschrittsanzeige
    'progress-separator':      ' / ',
    'progress-label':          ' gelöst',
    'solve-hint':              '24 zum Lösen',

    // Modal – Eingabe-Dialog
    'modal-title':             'Song #',
    'modal-input-label':       '🎵 Gib Songtitel oder Künstler ein:',
    'modal-input-placeholder': 'z.B. Queen, Bohemian Rhapsody...',
    'modal-input-hint':        'Tipp: Kleine Tippfehler werden toleriert (Fuzzy-Matching aktiv)!',
    'modal-submit':            'Bestätigen',
    'modal-close':             'Schließen',

    // Koordinaten-Overlay
    'coords-title':            '🏆 Gerätschaft gefunden! 24/26 Songs erkannt!',
    'coords-subtitle':         'Die Koordinaten des Caches:',
    'coords-copy':             'Koordinaten kopieren',
    'coords-share':            '📤 Teilen',
    'coords-close':            'Schließen',

    // Teilen-Modal (Share)
    'share-btn':               '🔗 Teilen',
    'share-title':             '🎵 Gemeinsam spielen!',
    'share-title-solved':      '🎉 Koordinaten teilen!',
    'share-text':              'Schicke den Link an deine Mitspieler:',
    'share-text-solved':       'Rätsel gelöst! Teile die Koordinaten mit deinen Mitspielern:',
    'share-coords-label':      '📍 Zielkoordinaten:',
    'share-copy':              '📋 Link kopieren',
    'share-copy-all':          '📋 Link & Koordinaten kopieren',
    'share-native':            '📤 Teilen...',
    'share-close':             '✕ Schließen',
    'share-copied':            '✅ Link kopiert!',
    'share-coords-title':      'Projekt Jukebox - Koordinaten',
    'share-coords-text':       '🎉 Ich habe das Jukebox-Rätsel gelöst! Zielkoordinaten: {coords}',
    'share-msg-default':       'Erkennst du alle Songs? Löse das Geocaching-Rätsel!',

    // Spielanleitung-Modal (Info)
    'info-title':              '🎵 Spielanleitung',
    'info-step-1':             'Klicke auf einen Song-Button (1–25)',
    'info-step-2':             'Höre die MIDI-Melodie an',
    'info-step-3':             'Gib den Songtitel oder den Künstler ein',
    'info-step-4':             'Kleine Tippfehler sind OK – Fuzzy-Matching ist aktiv!',
    'info-step-5':             'Löse mindestens 24 von 25 Songs',
    'info-step-6':             'Die Geocaching-Koordinaten werden dann enthüllt!',
    'info-threshold-label':    'Zum Lösen benötigt:',
    'info-joker-label':        '💡 Joker-Code:',
    'info-joker-placeholder':  'Code (4 Ziffern)',
    'info-joker-submit':       'Einlösen',
    'info-joker-hint':         '💡 Tipp: Die Spielanleitung kann jederzeit über das ⓘ-Symbol im Header geöffnet und der Code später im Spiel eingelöst werden.',
    'info-close':              "Los geht's! 🎶",

    // Song-Etikett (dynamisch gesetzt via ui.js, hier als Referenz)
    song_solved_badge:         '✅ Gelöst',
    song_unsolved_hint:        '???',

    // Toast-Meldungen (dynamisch via ui.js)
    toast_correct:             '🎵 Richtig gelöst!',
    toast_wrong:               "❌ Leider falsch. Versuch's nochmal!",
    toast_already_solved:      '✅ Bereits gelöst!',
    toast_copied:              '📋 Koordinaten kopiert!',
    toast_file_error:          '⚠️ Bitte Seite über Webserver (http://) öffnen!',
    toast_audio_error:         '⚠️ Fehler beim Laden der MIDI-Datei!',
    toast_joker_success:        '🎉 Joker eingelöst! Aufgedeckt: {songs}',
    toast_joker_invalid:        '❌ Ungültiger Code!',
    toast_joker_already_used:   '⚠️ Joker-Code wurde bereits eingelöst!',
    toast_joker_pool_exhausted: 'ℹ️ Alle Songs aus dem Joker-Pool sind bereits gelöst!',

    // Komfort-Aliase mit Unterstrich (für programmatischen Zugriff via ui.js)
    header_title:              'PROJEKT JUKEBOX',
    lang_toggle:               '🇬🇧 EN',
    progress_label:            ' gelöst',
    progress_unit:             'Songs',
    modal_title_prefix:        'Song #',
    modal_input_placeholder:   'z.B. Queen, Bohemian Rhapsody...',
    modal_submit:              'Bestätigen',
    modal_close:               'Schließen',
    coords_title:              '🏆 Gerätschaft gefunden! 24/26 Songs erkannt!',
    coords_subtitle:           'Die Koordinaten des Caches:',
    coords_copy_btn:           'Koordinaten kopieren',
    footer_text:               '🎸 Projekt Jukebox · Geocaching-Rätsel · Kein Framework · Vanilla JS',
  },

  en: {
    // Header
    title:                     'PROJECT JUKEBOX',
    'lang-toggle':             '🇨🇿 CZ',
    'show-coords-btn':         '📍 Coordinates',

    // Fortschrittsanzeige
    'progress-separator':      ' / ',
    'progress-label':          ' solved',
    'solve-hint':              '24 to unlock',

    // Modal – Eingabe-Dialog
    'modal-title':             'Song #',
    'modal-input-label':       '🎵 Enter song title or artist:',
    'modal-input-placeholder': 'e.g. Queen, Bohemian Rhapsody...',
    'modal-input-hint':        'Tip: Small typos are OK – fuzzy matching is active!',
    'modal-submit':            'Confirm',
    'modal-close':             'Close',

    // Koordinaten-Overlay
    'coords-title':            '🏆 Device found! 24/26 songs identified!',
    'coords-subtitle':         'The coordinates of the cache:',
    'coords-copy':             'Copy coordinates',
    'coords-share':            '📤 Share',
    'coords-close':            'Close',

    // Teilen-Modal (Share)
    'share-btn':               '🔗 Share',
    'share-title':             '🎵 Play Together!',
    'share-title-solved':      '🎉 Share Coordinates!',
    'share-text':              'Send the link to your friends:',
    'share-text-solved':       'Puzzle solved! Share the coordinates with your team:',
    'share-coords-label':      '📍 Target coordinates:',
    'share-copy':              '📋 Copy Link',
    'share-copy-all':          '📋 Copy Link & Coordinates',
    'share-native':            '📤 Share...',
    'share-close':             '✕ Close',
    'share-copied':            '✅ Link copied!',
    'share-coords-title':      'Project Jukebox - Coordinates',
    'share-coords-text':       '🎉 I solved the Jukebox puzzle! Target coordinates: {coords}',
    'share-msg-default':       'Can you identify all songs? Solve the geocaching puzzle!',

    // How to Play Modal (Info)
    'info-title':              '🎵 How to Play',
    'info-step-1':             'Click on a song button (1–25)',
    'info-step-2':             'Listen to the MIDI melody',
    'info-step-3':             'Enter the song title or artist name',
    'info-step-4':             'Small typos are OK – fuzzy matching is active!',
    'info-step-5':             'Solve at least 24 out of 25 songs',
    'info-step-6':             'The geocaching coordinates will be revealed!',
    'info-threshold-label':    'Required to solve:',
    'info-joker-label':        '💡 Bonus Code:',
    'info-joker-placeholder':  'Code (4 digits)',
    'info-joker-submit':       'Redeem',
    'info-joker-hint':         '💡 Tip: The instructions can be reopened at any time via the ⓘ icon in the header, and the code can be redeemed later in the game.',
    'info-close':              "Let's go! 🎶",

    // Song-Etikett (dynamisch gesetzt via ui.js, hier als Referenz)
    song_solved_badge:         '✅ Solved',
    song_unsolved_hint:        '???',

    // Toast-Meldungen (dynamisch via ui.js)
    toast_correct:             '🎵 Correct!',
    toast_wrong:               '❌ Wrong answer. Try again!',
    toast_already_solved:      '✅ Already solved!',
    toast_copied:              '📋 Coordinates copied!',
    toast_file_error:          '⚠️ Please open page via web server (http://)!',
    toast_audio_error:         '⚠️ Error loading MIDI file!',
    toast_joker_success:        '🎉 Bonus code redeemed! Revealed: {songs}',
    toast_joker_invalid:        '❌ Invalid code!',
    toast_joker_already_used:   '⚠️ Bonus code has already been redeemed!',
    toast_joker_pool_exhausted: 'ℹ️ All songs in the bonus pool are already solved!',

    // Komfort-Aliase mit Unterstrich (für programmatischen Zugriff via ui.js)
    header_title:              'PROJECT JUKEBOX',
    lang_toggle:               '🇨🇿 CZ',
    progress_label:            'solved',
    progress_unit:             'Songs',
    modal_title_prefix:        'Song #',
    modal_input_placeholder:   'e.g. Queen, Bohemian Rhapsody...',
    modal_submit:              'Confirm',
    modal_close:               'Close',
    coords_title:              '🏆 Device found! 24/26 songs identified!',
    coords_subtitle:           'The coordinates of the cache:',
    coords_copy_btn:           'Copy coordinates',
    footer_text:               '🎸 Project Jukebox · Geocaching Puzzle · No Framework · Vanilla JS',
  },

  cs: {
    // Header
    title:                     'PROJEKT JUKEBOX',
    'lang-toggle':             '🇩🇪 DE',
    'show-coords-btn':         '📍 Souřadnice',

    // Fortschrittsanzeige
    'progress-separator':      ' / ',
    'progress-label':          'vyřešeno',
    'solve-hint':              '24 k vyřešení',

    // Modal – Eingabe-Dialog
    'modal-title':             'Píseň č.',
    'modal-input-label':       '🎵 Zadej název písně nebo interpreta:',
    'modal-input-placeholder': 'např. Queen, Bohemian Rhapsody...',
    'modal-input-hint':        'Tip: Drobné překlepy jsou OK – fuzzy matching je aktivní!',
    'modal-submit':            'Potvrdit',
    'modal-close':             'Zavřít',

    // Koordinaten-Overlay
    'coords-title':            '🏆 Zařízení nalezeno! 24/25 písní rozpoznáno!',
    'coords-subtitle':         'Souřadnice cache:',
    'coords-copy':             'Kopírovat souřadnice',
    'coords-share':            '📤 Sdílet',
    'coords-close':            'Zavřít',

    // Teilen-Modal (Share)
    'share-btn':               '🔗 Sdílet',
    'share-title':             '🎵 Hrajte společně!',
    'share-title-solved':      '🎉 Sdílet souřadnice!',
    'share-text':              'Pošli odkaz svým spoluhráčům:',
    'share-text-solved':       'Hádanka vyřešena! Sdílej souřadnice se svými spoluhráči:',
    'share-coords-label':      '📍 Cílové souřadnice:',
    'share-copy':              '📋 Kopírovat odkaz',
    'share-copy-all':          '📋 Kopírovat odkaz a souřadnice',
    'share-native':            '📤 Sdílet...',
    'share-close':             '✕ Zavřít',
    'share-copied':            '✅ Odkaz zkopírován!',
    'share-coords-title':      'Projekt Jukebox - Souřadnice',
    'share-coords-text':       '🎉 Vyřešil(a) jsem hádanku Jukebox! Cílové souřadnice: {coords}',
    'share-msg-default':       'Poznáš všechny skladby? Vyřeš geocachingovou hádanku!',

    // Jak hrát Modal (Info)
    'info-title':              '🎵 Jak hrát',
    'info-step-1':             'Klikni na tlačítko písně (1–25)',
    'info-step-2':             'Poslechni si MIDI melodii',
    'info-step-3':             'Zadej název písně nebo jméno interpreta',
    'info-step-4':             'Drobné překlepy jsou OK – fuzzy matching je aktivní!',
    'info-step-5':             'Vyřeš alespoň 24 z 25 písní',
    'info-step-6':             'Pak se odhalí souřadnice geocache!',
    'info-threshold-label':    'Potřebný počet:',
    'info-joker-label':        '💡 Žolíkový kód:',
    'info-joker-placeholder':  'Kód (4 číslice)',
    'info-joker-submit':       'Uplatnit',
    'info-joker-hint':         '💡 Tip: Nápovědu lze kdykoli znovu otevřít pomocí symbolu ⓘ v záhlaví a kód uplatnit i později ve hře.',
    'info-close':              'Začínáme! 🎶',

    // Song-Etikett (dynamisch gesetzt via ui.js, hier als Referenz)
    song_solved_badge:         '✅ Vyřešeno',
    song_unsolved_hint:        '???',

    // Toast-Meldungen (dynamisch via ui.js)
    toast_correct:             '🎵 Správně vyřešeno!',
    toast_wrong:               '❌ Bohužel špatně. Zkus to znovu!',
    toast_already_solved:      '✅ Již vyřešeno!',
    toast_copied:              '📋 Souřadnice zkopírovány!',
    toast_file_error:          '⚠️ Otevřete prosím stránku přes webový server (http://)!',
    toast_audio_error:         '⚠️ Chyba při načítání souboru MIDI!',
    toast_joker_success:        '🎉 Žolík uplatněn! Odhaleno: {songs}',
    toast_joker_invalid:        '❌ Neplatný kód!',
    toast_joker_already_used:   '⚠️ Žolíkový kód již byl uplatněn!',
    toast_joker_pool_exhausted: 'ℹ️ Všechny písně ze žolíkového fondu jsou již vyřešeny!',

    // Komfort-Aliase mit Unterstrich (für programmatischen Zugriff via ui.js)
    header_title:              'PROJEKT JUKEBOX',
    lang_toggle:               '🇩🇪 DE',
    progress_label:            'vyřešeno',
    progress_unit:             'písní',
    modal_title_prefix:        'Píseň č.',
    modal_input_placeholder:   'např. Queen, Bohemian Rhapsody...',
    modal_submit:              'Potvrdit',
    modal_close:               'Zavřít',
    coords_title:              '🏆 Zařízení nalezeno! 24/25 písní rozpoznáno!',
    coords_subtitle:           'Souřadnice cache:',
    coords_copy_btn:           'Kopírovat souřadnice',
    footer_text:               '🎸 Projekt Jukebox · Geocachingová hádanka · Žádný framework · Vanilla JS',
  },
};

// Sprach-Alias: 'cz' verweist auf 'cs'
I18N.cz = I18N.cs;

// ---------------------------------------------------------------------------
// Sprache setzen – bindet alle [data-i18n] und [data-i18n-placeholder] Elemente
// ---------------------------------------------------------------------------

/**
 * Setzt die aktive Sprache der gesamten UI.
 *
 * @param {string} lang - Sprachcode, z. B. 'de', 'en', 'cs' oder 'cz'
 */
function setLanguage(lang) {
  // Alias auflösen
  if (lang === 'cz') lang = 'cs';

  // Fallback auf Deutsch falls unbekannte Sprache übergeben wird
  if (!I18N[lang]) {
    console.warn('[i18n] Unbekannte Sprache "' + lang + '", Fallback auf "de".');
    lang = 'de';
  }

  window.currentLang = lang;
  const dict = I18N[lang];

  // 1) Alle Elemente mit data-i18n-Attribut befüllen
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const key = el.getAttribute('data-i18n');
    if (!(key in dict)) {
      console.warn('[i18n] Fehlender Key "' + key + '" für Sprache "' + lang + '".');
      return;
    }

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      // Eingabefelder: placeholder setzen
      el.placeholder = dict[key];
    } else {
      // Sonderfall modal-title: enthält Kinder-<span>, nur Text-Node aktualisieren
      if (key === 'modal-title') {
        const firstTextNode = Array.from(el.childNodes)
          .find(function (n) { return n.nodeType === Node.TEXT_NODE; });
        if (firstTextNode) {
          firstTextNode.textContent = dict[key];
        } else {
          el.insertBefore(document.createTextNode(dict[key]), el.firstChild);
        }
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // 2) Alle Elemente mit data-i18n-placeholder (primär <input>-Elemente)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key in dict) {
      el.placeholder = dict[key];
    } else {
      console.warn('[i18n] Fehlender Placeholder-Key "' + key + '" für Sprache "' + lang + '".');
    }
  });

  // 3) <html lang="…"> Attribut aktualisieren (SEO + Accessibility)
  document.documentElement.setAttribute('lang', lang);

  // 4) Wahl in localStorage persistieren
  try {
    localStorage.setItem('jukebox_lang', lang);
  } catch (e) {
    // localStorage kann in manchen Browsern/Privacy-Modi gesperrt sein
    console.warn('[i18n] localStorage nicht verfügbar:', e);
  }

  // 5) Aktiven Sprach-Button in der Spielanleitung hervorheben
  document.querySelectorAll('.info-lang-btn').forEach(function (btn) {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 6) Sprach-Toggle Button-Label aktualisieren
  updateLangToggleLabel();
}

// ---------------------------------------------------------------------------
// Initialisierung – gespeicherte Sprache laden & Toggle-Button verdrahten
// ---------------------------------------------------------------------------

/**
 * Initialisiert das i18n-System:
 *  - Liest die zuletzt gewählte Sprache aus localStorage (Fallback: 'de')
 *  - Setzt die Sprache für die gesamte UI
 *  - Aktualisiert das Label des #lang-toggle Buttons
 *  - Registriert den Click-Listener auf dem #lang-toggle Button (Dreier-Zyklus)
 */
function initI18N() {
  let savedLang = 'de';
  try {
    const stored = localStorage.getItem('jukebox_lang');
    if (stored && I18N[stored]) {
      savedLang = stored === 'cz' ? 'cs' : stored;
    }
  } catch (e) {
    // localStorage nicht verfügbar – Fallback auf 'de'
  }

  setLanguage(savedLang);
  updateLangToggleLabel();

  // Toggle-Button: wechselt zyklisch zwischen 'de', 'en' und 'cs'
  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const currentIndex = LANGS.indexOf(window.currentLang);
      const nextLang = LANGS[(currentIndex + 1) % LANGS.length];
      setLanguage(nextLang);
      updateLangToggleLabel();
    });
  } else {
    console.warn('[i18n] #lang-toggle Button nicht gefunden.');
  }

  // Sprach-Buttons in der Spielanleitung anbinden
  document.querySelectorAll('.info-lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const selectedLang = this.getAttribute('data-lang');
      if (selectedLang) {
        setLanguage(selectedLang);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Exports (globale API für andere Module)
// ---------------------------------------------------------------------------

window.I18N                 = I18N;
window.LANGS                = LANGS;
window.LANG_LABELS          = LANG_LABELS;
window.setLanguage          = setLanguage;
window.updateLangToggleLabel= updateLangToggleLabel;

// Auto-Init beim Laden des Skripts
initI18N();
