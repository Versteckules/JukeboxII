// songs.js
// Song-Daten (Base64+ROT13 kodiert) + MIDI-Mapping (26 Songs)
// Format pro Song: { id, display: { title, artist }, answers: [], midiFile: "MIDI51/..." }
// Kodierungs-Pipeline: ROT13 → encodeURIComponent → unescape → btoa (= Base64)
// Dekodierung zur Laufzeit: rot13(decodeURIComponent(escape(atob(encoded))))

// ---------------------------------------------------------------------------
// 1. ROT13-Hilfsfunktion
//    Rotiert nur ASCII a–z / A–Z; Umlaute und alle anderen Zeichen bleiben.
// ---------------------------------------------------------------------------
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const base = c >= 'a' && c <= 'z' ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// ---------------------------------------------------------------------------
// 2. Encode- & Decode-Hilfsfunktionen
//    enc(str) → Base64( ROT13( trim(str) ) )
//    dec(str) → ROT13( decodeURIComponent( escape( atob(str) ) ) )
// ---------------------------------------------------------------------------
function enc(str) {
  return btoa(unescape(encodeURIComponent(rot13(str.trim()))));
}

function dec(str) {
  return rot13(decodeURIComponent(escape(atob(str))));
}

// ---------------------------------------------------------------------------
// 3. Song-Array (MIDI-Mapping) – 26 Songs
//    HINWEIS: melody / melodyIndex entfallen vollständig.
//    Jeder Song enthält midiFile mit dem relativen Pfad zur MIDI-Datei.
//    ALLE Strings sind via enc() vorverschlüsselt (ROT13 + Base64). Kein Klartext!
// ---------------------------------------------------------------------------
const SONGS = [

  // Song 1
  { id: 1, display: { title: 'R3VyIEp2YWFyZSBHbnhyZiBWZyBOeXk=', artist: 'Tk9PTg==' },
    answers: [ 'Z3VyIGp2YWFyZSBnbnhyZiB2ZyBueXk=', 'anZhYXJlIGdueHJmIHZnIG55eQ==', 'bm9vbg==' ],
    midiFile: 'MIDI51/A1.mid' },

  // Song 2
  { id: 2, display: { title: 'U2JlcmlyZSBMYmhhdA==', artist: 'TnljdW5pdnl5cg==' },
    answers: [ 'c2JlcmlyZSBsYmhhdA==', 'bnljdW5pdnl5cg==' ],
    midiFile: 'MIDI51/A2.mid' },

  // Song 3
  { id: 3, display: { title: 'TmFiZ3VyZSBPZXZweCB2YSBndXIgSm55eQ==', artist: 'Q3ZheCBTeWJscQ==' },
    answers: [ 'bmFiZ3VyZSBvZXZweCB2YSBndXIgam55eQ==', 'Y3ZheCBzeWJscQ==' ],
    midiFile: 'MIDI51/A3.mid' },

  // Song 4
  { id: 4, display: { title: 'R2JnbnkgUnB5dmNmciBicyBndXIgVXJuZWc=', artist: 'T2JhYXZyIEdseXJl' },
    answers: [ 'Z2JnbnkgcnB5dmNmciBicyBndXIgdXJuZWc=', 'b2JhYXZyIGdseXJl' ],
    midiFile: 'MIDI51/A4.mid' },

  // Song 5
  { id: 5, display: { title: 'UGJnZ2JhIFJsciBXYnI=', artist: 'RXJxYXJr' },
    answers: [ 'cGJnZ2JhIHJsciB3YnI=', 'ZXJxYXJr' ],
    midiFile: 'MIDI51/A5.mid' },

  // Song 6
  { id: 6, display: { title: 'U2JlZ2hhbmdyIEZiYQ==', artist: 'UGVycnFyYXByIFB5cm5lam5ncmUgRXJpdmlueQ==' },
    answers: [ 'c2JlZ2hhbmdyIGZiYQ==', 'cGVycnFyYXByIHB5cm5lam5ncmUgZXJpdmlueQ==', 'cHBl' ],
    midiFile: 'MIDI51/B1.mid' },

  // Song 7
  { id: 7, display: { title: 'WGFicHh2YScgYmEgVXJuaXJhJ2YgUWJiZQ==', artist: 'VGhhZiBBJyBFYmZyZg==' },
    answers: [ 'eGFicHh2YSBiYSB1cm5pcmFmIHFiYmU=', 'dGhhZiBhIGViZnJm', 'dGhhZiBuYXEgZWJmcmY=' ],
    midiFile: 'MIDI51/B2.mid' },

  // Song 8
  { id: 8, display: { title: 'T3J1dmFxIE95aHIgUmxyZg==', artist: 'WXZ6YyBPdm14dmc=' },
    answers: [ 'b3J1dmFxIG95aHIgcmxyZg==', 'eXZ6YyBvdm14dmc=' ],
    midiFile: 'MIDI51/B3.mid' },

  // Song 9
  { id: 9, display: { title: 'SnVuZyBuIEpiYXFyZXNoeSBKYmV5cQ==', artist: 'WWJodmYgTmV6ZmdlYmF0' },
    answers: [ 'anVuZyBuIGpiYXFyZXNoeSBqYmV5cQ==', 'eWJodmYgbmV6ZmdlYmF0', 'bmV6ZmdlYmF0' ],
    midiFile: 'MIDI51/B4.mid' },

  // Song 10
  { id: 10, display: { title: 'VWJ6ciBGanJyZyBVYnpy', artist: 'WsO2Z3lybCBQZcO8cg==' },
    answers: [ 'dWJ6ciBmanJyZyB1Ynpy', 'emJneXJsIHBlaHI=' ],
    midiFile: 'MIDI51/B5.mid' },

  // Song 11
  { id: 11, display: { title: 'WmwgVXJuZWcgSnZ5eSBUYiBCYQ==', artist: 'UMOpeXZhciBRdmJh' },
    answers: [ 'emwgdXJuZWcganZ5eSB0YiBiYQ==', 'cHJ5dmFyIHF2YmE=', 'Z3ZnbmF2cA==' ],
    midiFile: 'MIDI51/C1.mid' },

  // Song 12
  { id: 12, display: { title: 'R3VyIEZiaGFxIGJzIEZ2eXJhcHI=', artist: 'RnZ6YmEgJiBUbmVzaGF4cnk=' },
    answers: [ 'Z3VyIGZiaGFxIGJzIGZ2eXJhcHI=', 'ZmJoYXEgYnMgZnZ5cmFwcg==', 'ZnZ6YmEgbmFxIHRuZXNoYXhyeQ==', 'ZnZ6YmEgdG5lc2hheHJ5' ],
    midiFile: 'MIDI51/C2.mid' },

  // Song 13
  { id: 13, display: { title: 'VXInZiBuIEN2ZW5ncg==', artist: 'VW5hZiBNdnp6cmU=' },
    answers: [ 'dXJmIG4gY3Zlbmdy', 'dW5hZiBtdnp6cmU=', 'Y3ZlbmdyZiBicyBndXIgcG5ldm9vcm5h' ],
    midiFile: 'MIDI51/C3.mid' },

  // Song 14
  { id: 14, display: { title: 'Q2JjcGJlYQ==', artist: 'VWJnIE9oZ2dyZQ==' },
    answers: [ 'Y2JjcGJlYQ==', 'dWJnIG9oZ2dyZQ==' ],
    midiFile: 'MIDI51/C4.mid' },

  // Song 15
  { id: 15, display: { title: 'Q2hlY3lyIEVudmE=', artist: 'Q2V2YXBy' },
    answers: [ 'Y2hlY3lyIGVudmE=', 'Y2V2YXBy' ],
    midiFile: 'MIDI51/C5.mid' },

  // Song 16
  { id: 16, display: { title: 'WXZmZ3JhIGdiIExiaGUgVXJuZWc=', artist: 'RWJrcmdncg==' },
    answers: [ 'eXZmZ3JhIGdiIGxiaGUgdXJuZWc=', 'ZWJrcmdncg==' ],
    midiFile: 'MIDI51/D1.mid' },

  // Song 17
  { id: 17, display: { title: 'VXJsIFdocXI=', artist: 'R3VyIE9ybmd5cmY=' },
    answers: [ 'dXJsIHdocXI=', 'Z3VyIG9ybmd5cmY=', 'b3JuZ3lyZg==' ],
    midiFile: 'MIDI51/D2.mid' },

  // Song 18
  { id: 18, display: { title: 'THJmZ3JlcW5s', artist: 'R3VyIE9ybmd5cmY=' },
    answers: [ 'bHJmZ3JlcW5s', 'Z3VyIG9ybmd5cmY=', 'b3JuZ3lyZg==' ],
    midiFile: 'MIDI51/D3.mid' },

  // Song 19
  { id: 19, display: { title: 'R254ciBabCBPZXJuZ3UgTmpubA==', artist: 'T3JleXZh' },
    answers: [ 'Z254ciB6bCBvZXJuZ3UgbmpubA==', 'b3JleXZh', 'Z2JjIHRoYQ==' ],
    midiFile: 'MIDI51/D4.mid' },

  // Song 20
  { id: 20, display: { title: 'SnIgUXZxYSdnIEZnbmVnIGd1ciBTdmVy', artist: 'T3Z5eWwgV2JyeQ==' },
    answers: [ 'anIgcXZxYWcgZmduZWcgZ3VyIHN2ZXI=', 'b3Z5eWwgd2JyeQ==' ],
    midiFile: 'MIDI51/D5.mid' },

  // Song 21
  { id: 21, display: { title: 'SnIgSnZ5eSBFYnB4IExiaA==', artist: 'RGhycmE=' },
    answers: [ 'anIganZ5eSBlYnB4IGxiaA==', 'ZGhycmE=' ],
    midiFile: 'MIDI51/E1.mid' },

  // Song 22
  { id: 22, display: { title: 'Rm52eXZhdA==', artist: 'RWJxIEZncmpuZWc=' },
    answers: [ 'Zm52eXZhdA==', 'ZWJxIGZncmpuZWc=' ],
    midiFile: 'MIDI51/E2.mid' },

  // Song 23
  { id: 23, display: { title: 'Q25lbnF2ZnI=', artist: 'UGJ5cWN5bmw=' },
    answers: [ 'Y25lbnF2ZnI=', 'cGJ5cWN5bmw=' ],
    midiFile: 'MIDI51/E3.mid' },

  // Song 24
  { id: 24, display: { title: 'Q3ViZ2J0ZW5jdQ==', artist: 'QXZweHJ5b25weA==' },
    answers: [ 'Y3ViZ2J0ZW5jdQ==', 'YXZweHJ5b25weA==' ],
    midiFile: 'MIDI51/E4.mid' },

  // Song 25
  { id: 25, display: { title: 'WXJnIFVyZSBUYg==', artist: 'Q25mZnJhdHJl' },
    answers: [ 'eXJnIHVyZSB0Yg==', 'Y25mZnJhdHJl' ],
    midiFile: 'MIDI51/E5.mid' },

  // Song 26
  { id: 26, display: { title: 'RmJhYXI=', artist: 'RW56emZncnZh' },
    answers: [ 'ZmJhYXI=', 'ZW56emZncnZh' ],
    midiFile: 'MIDI51/F1.mid' },

];

// ---------------------------------------------------------------------------
// 4. Export auf window (Vanilla JS, kein Modul-System)
//    Reihenfolge: songs.js → i18n.js → audio.js → solver.js → state.js → ui.js
// ---------------------------------------------------------------------------
window.SONGS  = SONGS;
window.rot13  = rot13;
window.enc    = enc;
window.dec    = dec;
