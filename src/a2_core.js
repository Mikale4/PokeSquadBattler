
<div id="gb" class="gb classic">
  <div class="gb-bezel">
    <div class="gb-label"><span class="gb-led"><b></b>BATTERY</span><i></i><span class="gb-dm">DOT MATRIX WITH STEREO SOUND</span><i></i></div>
    <div id="screen">
      <div id="app">
        <header id="topbar"></header>
        <main id="view"></main>
        <nav id="tabs"></nav>
      </div>
      <div id="battle" hidden></div>
      <div id="draft" hidden></div>
      <div id="dlg" hidden></div>
      <div id="gacha" hidden></div>
      <div id="slots" hidden></div>
      <div id="modal" hidden></div>
      <div id="toast"></div>
    </div>
  </div>
  <div class="gb-logo"><small>PokeSquad</small><b>BATTLER</b></div>
  <div class="gb-ctl">
    <div class="gb-dpad" aria-label="D-pad"><button data-gb="up" aria-label="Up"></button><button data-gb="left" aria-label="Left"></button><i></i><button data-gb="right" aria-label="Right"></button><button data-gb="down" aria-label="Down"></button></div>
    <div class="gb-ab"><span><button data-gb="b" aria-label="B button"></button><em>B</em></span><span><button data-gb="a" aria-label="A button"></button><em>A</em></span></div>
    <div class="gb-ss"><span><button data-gb="select" aria-label="Select"></button><em>SELECT</em></span><span><button data-gb="start" aria-label="Start"></button><em>START</em></span></div>
    <div class="gb-speaker"><i></i><i></i><i></i><i></i><i></i><i></i></div>
  </div>
</div>
<script>
"use strict";
/* =====================================================================
   POKESQUAD BATTLER — an unofficial, non-commercial fan game.
   Pokémon and all related names belong to Nintendo, Game Freak and Creatures Inc.
   Pokémon and trainer sprites are from Pokémon Showdown's sprite collection; species
   data comes from PokeAPI.
   ===================================================================== */

// ---------- utils ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let R = Math.random;   // swapped for a seeded generator while the Expert AI plays moves out (a7_engine.js)
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const pick = a => a[Math.floor(R() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M" : n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + "K" : Math.round(n).toLocaleString("en-US");
const fmtFull = n => Math.round(n).toLocaleString("en-US");
const pct = v => Math.round(v * 100) + "%";
function seeded(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const dur = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000); if (m >= 60) return Math.floor(m / 60) + "h " + (m % 60) + "m"; return m + ":" + String(s).padStart(2, "0"); };
const today = () => new Date().toISOString().slice(0, 10);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function shade(hex, amt) {
  let c = hex.replace("#", ""); if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const n = parseInt(c.slice(0, 6), 16), f = v => clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255);
  return "#" + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)].map(v => v.toString(16).padStart(2, "0")).join("");
}
function circ(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
const dexNo = id => "#" + String(id).padStart(3, "0");

// ---------- types ----------
// The eighteen types and the type chart as they stand today (Gen 6 on: Fairy, and Steel no longer resists Ghost and Dark).
// "???" (MOVE_TYPES) is typeless: Struggle, and a Fire type that has burned itself out with Burn Up; it's neutral both ways.
const TYPES = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
const MOVE_TYPES = [...TYPES, "???"];
const TC = { Normal: "#a8a77a", Fire: "#ee8130", Water: "#6390f0", Electric: "#f7d02c", Grass: "#7ac74c", Ice: "#96d9d6", Fighting: "#c22e28", Poison: "#a33ea1",
  Ground: "#e2bf65", Flying: "#a98ff3", Psychic: "#f95587", Bug: "#a6b91a", Rock: "#b6a136", Ghost: "#735797", Dragon: "#6f35fc", Dark: "#705746", Steel: "#b7b7ce",
  Fairy: "#d685ad", "???": "#68a090" };
const ELC = TC; // the renderer colours units by their first type
const CHART = (() => {
  const se = { Fire: "Grass Ice Bug Steel", Water: "Fire Ground Rock", Electric: "Water Flying", Grass: "Water Ground Rock", Ice: "Grass Ground Flying Dragon",
    Fighting: "Normal Ice Rock Dark Steel", Poison: "Grass Fairy", Ground: "Fire Electric Poison Rock Steel", Flying: "Grass Fighting Bug", Psychic: "Fighting Poison",
    Bug: "Grass Psychic Dark", Rock: "Fire Ice Flying Bug", Ghost: "Psychic Ghost", Dragon: "Dragon", Dark: "Psychic Ghost", Steel: "Ice Rock Fairy", Fairy: "Fighting Dragon Dark" };
  const nve = { Normal: "Rock Steel", Fire: "Fire Water Rock Dragon", Water: "Water Grass Dragon", Electric: "Electric Grass Dragon", Grass: "Fire Grass Poison Flying Bug Dragon Steel",
    Ice: "Fire Water Ice Steel", Fighting: "Poison Flying Psychic Bug Fairy", Poison: "Poison Ground Rock Ghost", Ground: "Grass Bug", Flying: "Electric Rock Steel", Psychic: "Psychic Steel",
    Bug: "Fire Fighting Poison Flying Ghost Steel Fairy", Rock: "Fighting Ground Steel", Ghost: "Dark", Dragon: "Steel", Dark: "Fighting Dark Fairy", Steel: "Fire Water Electric Steel",
    Fairy: "Fire Poison Steel" };
  const imm = { Normal: "Ghost", Electric: "Ground", Fighting: "Ghost", Ground: "Flying", Ghost: "Normal", Poison: "Steel", Psychic: "Dark", Dragon: "Fairy" };
  const c = {};
  for (const a of MOVE_TYPES) { c[a] = {}; for (const d of MOVE_TYPES) c[a][d] = 1; }
  for (const [tab, v] of [[se, 2], [nve, .5], [imm, 0]]) for (const a in tab) for (const d of tab[a].split(" ")) c[a][d] = v;
  return c;
})();
const typeEff = (mt, defTypes) => defTypes.reduce((m, d) => m * CHART[mt][d], 1);
// type labels (icedt's DS-style icons, tools/pack_types.py) and move category icons are pixel-art PNGs from RES_DATA; a drawn chip if one is missing
const resPng = b => "data:image/png;base64," + b;
// "???" is Typeless.png ("?" can't be in a Windows file name)
const typeFile = t => t === "???" ? "Typeless" : t;
const typeChip = t => RES_DATA.type[typeFile(t)] ? `<img class="tyi" src="${resPng(RES_DATA.type[typeFile(t)])}" alt="${t}" title="${t}">` : `<span class="ty" style="--tc:${TC[t]}">${t}</span>`;
const typeChips = ts => ts.map(typeChip).join("");
const catChip = c => RES_DATA.cat[c] ? `<img class="tyi" src="${resPng(RES_DATA.cat[c])}" alt="${CAT_N[c]}" title="${CAT_N[c]}">` : `<span class="tag">${CAT_N[c]}</span>`;
// what a type is strong and weak against, for the summary screen
const typeStrong = t => TYPES.filter(d => CHART[t][d] > 1);
// square type icons (Squid Eevee's Minecraft-style GO/HOME set, tools/pack_types.py): the type filters and the matchups below
const typeIcon = t => RES_DATA.tyic && RES_DATA.tyic[t] ? `<img class="tyic" src="${resPng(RES_DATA.tyic[t])}" alt="${t}" title="${t}">` : typeChip(t);
// what a Pokémon of these types is weak to, resists and is immune to, as rows of icons (x4 and x1/4 marked)
function matchupHTML(ts) {
  const g = [["Weak to", []], ["Resists", []], ["Immune to", []]];
  for (const a of TYPES) { const e = typeEff(a, ts); if (e === 0) g[2][1].push([a, e]); else if (e > 1) g[0][1].push([a, e]); else if (e < 1) g[1][1].push([a, e]); }
  return `<div class="matchups">${g.filter(([, l]) => l.length).map(([n, l]) => `<div class="murow"><span>${n}</span><span class="tyics">${l.map(([a, e]) =>
    `<span class="tyicw">${typeIcon(a)}${e === 4 ? "<i>×4</i>" : e === .25 ? "<i>×¼</i>" : ""}</span>`).join("")}</span></div>`).join("")}</div>`;
}
const defWeak = ts => TYPES.filter(a => typeEff(a, ts) > 1);
const defResist = ts => TYPES.filter(a => typeEff(a, ts) < 1);

// ---------- weather (set by the battle location) ----------
const WEATHER = {
  sun: { n: "Harsh sunlight", start: "The sunlight is harsh!", turn: "The sunlight turned harsh!", end: "The sunlight faded.", ic: "☀" },
  rain: { n: "Rain", start: "It's raining!", turn: "It started to rain!", end: "The rain stopped.", ic: "☂" },
  sand: { n: "Sandstorm", start: "A sandstorm is raging!", turn: "A sandstorm kicked up!", end: "The sandstorm subsided.", ic: "≋" },
  hail: { n: "Hail", start: "It's hailing!", turn: "It started to hail!", end: "The hail stopped.", ic: "❄" },

};
// hail and snow are one weather (the owner's rule): all but Ice types lose 1/16 of their max HP each turn, and Ice types' Defense is x1.5;
// "snow" (Snowscape, a place's snow) is the same weather
WEATHER.snow = WEATHER.hail;

// ---------- roles (Pokémon UNITE battle roles; shown on the summary screen) ----------
const CLASSES = ["Attacker", "All-Rounder", "Speedster", "Defender", "Supporter"];
// Auto-battle tactics; "expert" looks ahead by playing each candidate move out on copies of the battle (a7_engine.js)
const AI_STYLES = ["balanced", "aggressive", "safe", "expert"];
const AI_NAME = { balanced: "Balanced", aggressive: "Aggressive", safe: "Careful", expert: "Expert" };
// what each does (shown while its button is held). Every tactic plans the whole team's turn the same way first.
const AI_TIP = {
  balanced: "Balanced: uses the best move the team's plan finds (focus fire, knockouts first, no attacking into immunities), with no lean either way.",
  aggressive: "Aggressive: leans on attacking. Damaging moves count for 20% more, and healing, boosts, screens and status moves for 20% less.",
  safe: "Careful: leans on support. Healing, screens, boosts and status moves count for 30% more, and attacks for 5% less.",
  expert: "Expert: plays its best few options out on copies of the battle, about 20 turns ahead, and picks the one that leaves your team best off. The strongest, but slower to decide.",
};
const clsName = c => c;

// ---------- icons ----------
const ball = (top, band = "#222", btn = "#fff", extra = "") => `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#f4f4f4" stroke="#1c1c22" stroke-width="1.6"/><path d="M1.5 12a10.5 10.5 0 0 1 21 0z" fill="${top}" stroke="#1c1c22" stroke-width="1.6"/>${extra}<path d="M1.5 12h21" stroke="${band}" stroke-width="2.2"/><circle cx="12" cy="12" r="3.4" fill="${btn}" stroke="#1c1c22" stroke-width="1.8"/></svg>`;
const IC = {
  pokeball: ball("#e3350d"),
  greatball: ball("#3b7dd8", "#222", "#fff", '<path d="M4.5 7.5 8 10M19.5 7.5 16 10" stroke="#e3350d" stroke-width="2.6" stroke-linecap="round"/>'),
  ultraball: ball("#2a2a30", "#222", "#fff", '<path d="M5 5.5v5M19 5.5v5" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/>'),
  masterball: ball("#7a3fb8", "#222", "#fff", '<circle cx="7.5" cy="7.5" r="2" fill="#e85aa8"/><circle cx="16.5" cy="7.5" r="2" fill="#e85aa8"/><text x="12" y="9.3" text-anchor="middle" font-size="4.6" font-weight="900" fill="#fff" font-family="Arial">M</text>'),
  safariball: ball("#5d8a3a", "#222", "#f4e6a8", '<circle cx="8" cy="7" r="1.6" fill="#3a5a22"/><circle cx="15" cy="6" r="1.4" fill="#3a5a22"/><circle cx="12" cy="9" r="1.2" fill="#3a5a22"/>'),
  sanity: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="#3b7dd8"/><text x="12" y="16" text-anchor="middle" font-size="9.5" font-weight="900" fill="#fff" font-family="Arial">PP</text></svg>',
  lmd: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#f2c14e" stroke="#8a5a10" stroke-width="1.4"/><text x="12" y="16.4" text-anchor="middle" font-size="12" font-weight="900" fill="#7a4a08" font-family="Arial">₽</text></svg>',
  orundum: '<svg viewBox="0 0 24 24"><path fill="#4ad0ff" d="M12 2 20 9l-8 13L4 9z"/><path fill="#c8f2ff" d="M12 2 8.5 9h7z"/><path fill="#1f8ac0" d="M12 22l3.5-13H20z"/><path fill="#7ae2ff" d="M4 9h4.5L12 22z"/></svg>',
  permit: ball("#5d8a3a", "#222", "#f4e6a8", '<circle cx="8" cy="7" r="1.6" fill="#3a5a22"/><circle cx="15" cy="6" r="1.4" fill="#3a5a22"/><circle cx="12" cy="9" r="1.2" fill="#3a5a22"/>'),
  cert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#d8dde8" stroke="#6a7286" stroke-width="1.4"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#8a93a8" stroke-width="1.2"/><text x="12" y="15.6" text-anchor="middle" font-size="9" font-weight="900" fill="#4a5266" font-family="Arial">C</text></svg>',
  tokens: '<svg viewBox="0 0 24 24"><path fill="#e3350d" d="M12 2 21 7v10l-9 5-9-5V7z"/><text x="12" y="15.5" text-anchor="middle" font-size="8.5" font-weight="900" fill="#fff" font-family="Arial">BP</text></svg>',
  prime: '<svg viewBox="0 0 24 24"><path fill="#cfd6e2" d="M9 2h6v4l3 3v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9l3-3z"/><path fill="#e85aa8" d="M7 11h10v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/><path d="M12 13v6M9 16h6" stroke="#fff" stroke-width="1.8"/></svg>',
  rec1: '<svg viewBox="0 0 24 24"><path d="M3 12l3-3 3 3-3 3zM21 12l-3-3-3 3 3 3z" fill="#f2a6c8"/><ellipse cx="12" cy="12" rx="6" ry="5" fill="#f6c94e" stroke="#9a6a10" stroke-width="1.2"/><text x="12" y="14.6" text-anchor="middle" font-size="6" font-weight="900" fill="#7a4a08" font-family="Arial">S</text></svg>',
  rec2: '<svg viewBox="0 0 24 24"><path d="M2.5 12l3.5-3.5L9.5 12 6 15.5zM21.5 12 18 8.5 14.5 12l3.5 3.5z" fill="#f2a6c8"/><ellipse cx="12" cy="12" rx="6.5" ry="5.5" fill="#6ac8f2" stroke="#1a6a9a" stroke-width="1.2"/><text x="12" y="14.6" text-anchor="middle" font-size="6.5" font-weight="900" fill="#0a3a5a" font-family="Arial">M</text></svg>',
  rec3: '<svg viewBox="0 0 24 24"><path d="M2 12l4-4 4 4-4 4zM22 12l-4-4-4 4 4 4z" fill="#f2a6c8"/><ellipse cx="12" cy="12" rx="7" ry="6" fill="#a56af2" stroke="#4a1a9a" stroke-width="1.2"/><text x="12" y="14.8" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" font-family="Arial">L</text></svg>',
  rec4: '<svg viewBox="0 0 24 24"><path d="M1.5 12 6 7.5l4.5 4.5L6 16.5zM22.5 12 18 7.5 13.5 12l4.5 4.5z" fill="#f2a6c8"/><ellipse cx="12" cy="12" rx="7.5" ry="6.5" fill="#f25a5a" stroke="#8a1010" stroke-width="1.2"/><text x="12" y="14.8" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff" font-family="Arial">XL</text></svg>',
  rare: '<svg viewBox="0 0 24 24"><path d="M2 12l4-4 4 4-4 4zM22 12l-4-4-4 4 4 4z" fill="#9ad0ff"/><ellipse cx="12" cy="12" rx="7" ry="6" fill="#4a7af2" stroke="#1a2a8a" stroke-width="1.2"/><path d="M12 8.5l1.1 2.3 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z" fill="#fff"/></svg>',
  summ: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="6" ry="7" fill="#c8a24a" stroke="#6a4a10" stroke-width="1.3"/><path d="M12 7c-1-3 1-5 4-5-1 2-2 4-4 5z" fill="#5ac84a"/><path d="M10 12c1 2 3 2 4 0" stroke="#6a4a10" stroke-width="1.2" fill="none"/></svg>',
  firestone: '<svg viewBox="0 0 24 24"><path d="M12 2 20 9l-3 11H7L4 9z" fill="#f28a3a" stroke="#8a3a08" stroke-width="1.2"/><path d="M12 7c2 3 3 5 1 8-1-2-3-2-3 0-2-3 0-5 2-8z" fill="#ffe46a"/></svg>',
  waterstone: '<svg viewBox="0 0 24 24"><path d="M12 2 20 9l-3 11H7L4 9z" fill="#4a9af2" stroke="#0a3a8a" stroke-width="1.2"/><path d="M12 7c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7z" fill="#c8eaff"/></svg>',
  thunderstone: '<svg viewBox="0 0 24 24"><path d="M12 2 20 9l-3 11H7L4 9z" fill="#5ac87a" stroke="#0a5a2a" stroke-width="1.2"/><path d="M13 6l-4 7h3l-1 5 4-7h-3z" fill="#ffe46a"/></svg>',
  leafstone: '<svg viewBox="0 0 24 24"><path d="M12 2 20 9l-3 11H7L4 9z" fill="#7ac84c" stroke="#2a5a10" stroke-width="1.2"/><path d="M12 6c3 2 4 6 0 11-4-5-3-9 0-11zM12 7v10" stroke="#2a5a10" fill="#c8f2a8" stroke-width="1"/></svg>',
  moonstone: '<svg viewBox="0 0 24 24"><path d="M12 2 20 9l-3 11H7L4 9z" fill="#5a5a72" stroke="#1a1a2a" stroke-width="1.2"/><path d="M14 7a5 5 0 1 0 2 8 4 4 0 1 1-2-8z" fill="#f4ecd8"/></svg>',
  linkcord: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round"><path d="M4 18c4-8 12 0 16-10" stroke="#3b7dd8" stroke-width="2.6"/><rect x="2" y="16" width="5" height="5" rx="1" fill="#e3350d"/><rect x="17" y="3" width="5" height="5" rx="1" fill="#e3350d"/></svg>',
  held: '<svg viewBox="0 0 24 24"><path d="M5 9h14l-2 12H7z" fill="#c8a06a" stroke="#6a4a20" stroke-width="1.3"/><path d="M8 9a4 4 0 0 1 8 0" stroke="#6a4a20" stroke-width="1.6" fill="none"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path fill="#f2c14e" stroke="#7a5310" stroke-width="1" d="m12 2 3 7 7 .6-5.4 4.6 1.7 7.3L12 17.6l-6.3 3.9 1.7-7.3L2 9.6 9 9z"/></svg>',
  starOff: '<svg viewBox="0 0 24 24"><path fill="#d8dce6" stroke="#a8b0c2" stroke-width="1" d="m12 2 3 7 7 .6-5.4 4.6 1.7 7.3L12 17.6l-6.3 3.9 1.7-7.3L2 9.6 9 9z"/></svg>',
  crown: '<svg viewBox="0 0 20 14"><path fill="#f2c14e" stroke="#5b3e08" d="M1 13 2 3l5 5 3-7 3 7 5-5 1 10z"/></svg>',
  heal: '<svg viewBox="0 0 24 24"><path fill="#43d67e" d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>',
  boost: '<svg viewBox="0 0 24 24"><path fill="#f2c14e" d="M12 2 19 10h-4v5H9v-5H5zM6 17h12v2H6zm0 3h12v2H6z"/></svg>',
  skull: '<svg viewBox="0 0 24 24"><path fill="#e8edf7" d="M12 2c5 0 8 3.5 8 8 0 3-1.5 4.5-3 5.5V19h-3v-2h-1v2h-2v-2h-1v2H7v-3.5C5.5 14.5 4 13 4 10c0-4.5 3-8 8-8z"/><circle cx="9" cy="10" r="2" fill="#05080f"/><circle cx="15" cy="10" r="2" fill="#05080f"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path fill="#5fd4ff" d="M4 4h7v16H5a1 1 0 0 1-1-1z"/><path fill="#9fe0ff" d="M13 4h7v15a1 1 0 0 1-1 1h-6z"/></svg>',
  chest: '<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="11" rx="1" fill="#8a5a2a"/><path fill="#b07a3a" d="M3 9a9 5 0 0 1 18 0z"/><rect x="10" y="11" width="4" height="4" fill="#f2c14e"/></svg>',
  tower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 22V9l5-6 5 6v13M5 22h14M10 22v-5h4v5M10 11h4"/></svg>',
  arena: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h7v10H4zM13 7h7v10h-7zM11 12h2M7 17v3M17 17v3"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg>',
  story: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
  battles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20 15 9M15 9l2-5 3 3-5 2M20 20 9 9M9 9 7 4 4 7l5 2"/></svg>',
  ops: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h6M15 12h6"/><circle cx="12" cy="12" r="3"/></svg>',
  hunt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20 9 8l4 6 3-4 5 10z"/><circle cx="17" cy="5" r="2"/></svg>',
  missions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 9 2 2 4-4M8 15h8"/></svg>',
  shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M10 20v-6h4v6"/></svg>',
  depot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8V6a6 6 0 0 1 12 0v2"/><rect x="3" y="8" width="18" height="13" rx="3"/><path d="M3 13h18M10 13v3h4v-3"/></svg>',
  dex: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="9" cy="7" r="2.5"/><path d="M14 6h3M7 13h10M7 17h10"/></svg>',
  gearIc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 4 8 12l7 8"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/><path d="m12 6 1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 8.3l2-.3z" fill="currentColor"/></svg>',
  gift: '<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="12" rx="1.5" fill="#e3350d"/><rect x="2" y="7" width="20" height="4" rx="1" fill="#ff5a3a"/><path d="M12 7v14" stroke="#f2e6c8" stroke-width="2.4"/><path d="M12 7c-2-4-6-4-6-1.5S10 7 12 7c2 0 6-.5 6-1.5S14 3 12 7z" fill="none" stroke="#f2e6c8" stroke-width="1.6"/></svg>',
  free10: ball("#5d8a3a", "#222", "#f4e6a8", '<text x="12" y="9.6" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff" font-family="Arial">10</text>'),
  gold5: ball("#7a3fb8", "#222", "#fff", '<circle cx="7.5" cy="7.5" r="2" fill="#e85aa8"/><circle cx="16.5" cy="7.5" r="2" fill="#e85aa8"/><text x="12" y="9.3" text-anchor="middle" font-size="4.6" font-weight="900" fill="#fff" font-family="Arial">M</text>'),
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="#2a9a5a" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="#a8b0c2" stroke-width="3"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};
// item sprites (resources/sprites/items via tools/item_icons.json) replace the drawn icons; kept in an <svg> so every icon slot sizes them the same way
// IC_BADGE letters go on top where one sprite stands for several items (the Exp. Candy sizes, the Safari Pass's ten throws)
const IC_BADGE = { rec1: "S", rec2: "M", rec3: "L", rec4: "XL", free10: "10" };
const pxIcon = (b, badge) => `<svg viewBox="0 0 24 24"><image href="${resPng(b)}" width="24" height="24" style="image-rendering:pixelated"/>${badge ? `<text x="23.5" y="23" text-anchor="end" font-size="${badge.length > 1 ? 8 : 9}" font-weight="900" font-family="Arial" fill="#fff" stroke="#1c1c22" stroke-width="2.2" paint-order="stroke">${badge}</text>` : ""}</svg>`;
IC.xp = IC.boost; IC.greet = IC.gift; IC.letter = IC.mail;   // the Exp. Points reward and Mail, until their sprites replace them
for (const k of ["sunstone", "shinystone", "duskstone", "dawnstone", "icestone", "ovalstone", "soothebell", "dragonscale", "upgrade", "dubiousdisc", "protector",
  "electirizer", "magmarizer", "reapercloth", "deepseatooth", "deepseascale", "prismscale", "sachet", "whippeddream", "strawberrysweet", "tartapple", "sweetapple", "syrupyapple", "crackedpot", "unremarkableteacup", "galaricacuff", "galaricawreath", "scrollofdarkness", "scrollofwaters", "blackaugurite", "peatblock", "auspiciousarmor", "maliciousarmor", "leaderscrest", "metalalloy", "gimmighoulcoin"]) IC[k] = IC.moonstone;
for (const k in RES_DATA.item) if (k in IC) IC[k] = pxIcon(RES_DATA.item[k], IC_BADGE[k]);
if (RES_DATA.ball && RES_DATA.ball.item) IC.chest = pxIcon(RES_DATA.ball.item);   // the Journey's item stops: an item ball on the route
// Kanto's eight Gym Badges: the FireRed/LeafGreen sprites from the owner's Trainer Card kit (RES_DATA.card.badge1-8);
// the drawn shapes in their colours are the fallback
const BADGES = [
  { n: "Boulder Badge", gym: "Pewter Gym", leader: "Brock", type: "Rock", col: "#9aa0a8", stat: "atk", sn: "Attack", path: "M12 3l8 6-3 11H7L4 9z" },
  { n: "Cascade Badge", gym: "Cerulean Gym", leader: "Misty", type: "Water", col: "#4a9af2", stat: "sdf", sn: "Sp. Def", path: "M12 3c4 5 7 9 7 12a7 7 0 0 1-14 0c0-3 3-7 7-12z" },
  { n: "Thunder Badge", gym: "Vermilion Gym", leader: "Lt. Surge", type: "Electric", col: "#f2a63a", stat: "def", sn: "Defense", path: "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" },
  { n: "Rainbow Badge", gym: "Celadon Gym", leader: "Erika", type: "Grass", col: "#c87af2", stat: "spa", sn: "Sp. Atk", path: "M12 3c2 3 6 3 8 1-1 4 0 8 2 9-4 0-6 3-6 8-1-3-3-4-4-4s-3 1-4 4c0-5-2-8-6-8 2-1 3-5 2-9 2 2 6 2 8-1z" },
  { n: "Soul Badge", gym: "Fuchsia Gym", leader: "Koga", type: "Poison", col: "#e85aa8", stat: "spe", sn: "Speed", path: "M12 21C5 15 3 11 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 13z" },
  { n: "Marsh Badge", gym: "Saffron Gym", leader: "Sabrina", type: "Psychic", col: "#f2c14e", stat: "spa", sn: "Sp. Atk", path: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { n: "Volcano Badge", gym: "Cinnabar Gym", leader: "Blaine", type: "Fire", col: "#e3350d", stat: "atk", sn: "Attack", path: "M12 2c2 4 7 6 7 12a7 7 0 0 1-14 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3 1-6 2-9z" },
  { n: "Earth Badge", gym: "Viridian Gym", leader: "Giovanni", type: "Ground", col: "#5ac87a", stat: "hp", sn: "HP", path: "M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z" },
];
// Johto's eight, in the order of the Johto Journey's Gyms (each battle is its strongest version's, so Pryce's Lv 34 Gym comes before
// Jasmine's 35); the stat is the one each raised in Gold and Silver, where it raised one. Every region's Badges, Kanto's too,
// are the owner's sheet's pictures (resources/badges, tools/pack_badges.py: "zephyr" for the Zephyr Badge, or a Badge's own `pic`);
// the shapes (path, col) are badgeSVG's fallback
const JOHTO_BADGES = [
  { n: "Zephyr Badge", gym: "Violet Gym", leader: "Falkner", type: "Flying", col: "#8aa8d8", stat: "atk", sn: "Attack", path: "M3 15c5-1 9-5 11-11 1 4 0 7-2 9 3 0 6-1 9-3-2 5-7 8-12 8-3 0-5-1-6-3z" },
  { n: "Hive Badge", gym: "Azalea Gym", leader: "Bugsy", type: "Bug", col: "#d8483a", path: "M12 2l8.5 5v10L12 22l-8.5-5V7z" },
  { n: "Plain Badge", gym: "Goldenrod Gym", leader: "Whitney", type: "Normal", col: "#f2a6c8", stat: "spe", sn: "Speed", path: "M12 2l7 10-7 10-7-10z" },
  { n: "Fog Badge", gym: "Ecruteak Gym", leader: "Morty", type: "Ghost", col: "#8a6ac8", path: "M12 3a8 8 0 0 1 8 8v9l-2.7-2-2.6 2-2.7-2-2.7 2-2.6-2L4 20v-9a8 8 0 0 1 8-8z" },
  { n: "Storm Badge", gym: "Cianwood Gym", leader: "Chuck", type: "Fighting", col: "#e0903a", path: "M6 4h12l2 6-2 10H6L4 10z" },
  { n: "Glacier Badge", gym: "Mahogany Gym", leader: "Pryce", type: "Ice", col: "#8ad0f2", stat: "spa", sn: "Sp. Atk and Sp. Def", path: "M12 2l2.5 5.5L20.7 7l-3.2 5 3.2 5-6.2-.5L12 22l-2.5-5.5L3.3 17l3.2-5-3.2-5 6.2.5z" },
  { n: "Mineral Badge", gym: "Olivine Gym", leader: "Jasmine", type: "Steel", col: "#a8b0b8", stat: "def", sn: "Defense", path: "M7 3h10l4 6-9 12L3 9z" },
  { n: "Rising Badge", gym: "Blackthorn Gym", leader: "Clair", type: "Dragon", col: "#4a6ad8", path: "M12 2c3 3 7 4 8 4 0 9-3 14-8 16C7 20 4 15 4 6c1 0 5-1 8-4z" },
];
// Hoenn's eight (Emerald: Juan leads the eighth Gym; the stat is the one each raised there, where it raised one)
const HOENN_BADGES = [
  { n: "Stone Badge", gym: "Rustboro Gym", leader: "Roxanne", type: "Rock", col: "#a8a09a", stat: "atk", sn: "Attack", path: "M12 2l7 4 2 8-5 8H8l-5-8 2-8z" },
  { n: "Knuckle Badge", gym: "Dewford Gym", leader: "Brawly", type: "Fighting", col: "#d08a4a", path: "M5 9a2 2 0 0 1 3.5-1.5A2 2 0 0 1 12 7a2 2 0 0 1 3.5.5A2 2 0 0 1 19 9v6a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" },
  { n: "Dynamo Badge", gym: "Mauville Gym", leader: "Wattson", type: "Electric", col: "#e8c83a", stat: "spe", sn: "Speed", path: "M12 2l2 3 3.5-1 .5 3.5 3.5 1-1.5 3.5 1.5 3.5-3.5 1-.5 3.5-3.5-1-2 3-2-3-3.5 1-.5-3.5-3.5-1L4.5 12 3 8.5l3.5-1L7 4l3.5 1z" },
  { n: "Heat Badge", gym: "Lavaridge Gym", leader: "Flannery", type: "Fire", col: "#e8583a", path: "M12 3c5 0 9 4 9 9s-4 9-9 9c-3 0-6-2-6-5s2-5 5-5 4 2 3 4c2-1 2-4 0-6-3-3-9-2-11 2C3 7 7 3 12 3z" },
  { n: "Balance Badge", gym: "Petalburg Gym", leader: "Norman", type: "Normal", col: "#e07a5a", stat: "def", sn: "Defense", path: "M4 4h16l-6 8 6 8H4l6-8z" },
  { n: "Feather Badge", gym: "Fortree Gym", leader: "Winona", type: "Flying", col: "#8a8ae0", path: "M20 3C12 3 6 8 5 16l-2 5 5-2c8-1 12-7 12-16z" },
  { n: "Mind Badge", gym: "Mossdeep Gym", leader: "Tate & Liza", type: "Psychic", col: "#e87ab8", stat: "spa", sn: "Sp. Atk and Sp. Def", path: "M7 4a5 5 0 0 1 5 3 5 5 0 0 1 5-3 4 4 0 0 1 0 8 4 4 0 0 1 0 8 5 5 0 0 1-5-3 5 5 0 0 1-5 3 4 4 0 0 1 0-8 4 4 0 0 1 0-8z" },
  { n: "Rain Badge", gym: "Sootopolis Gym", leader: "Juan", type: "Water", col: "#6a7ae8", path: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" },
];
// Sinnoh's eight, in the order of the Sinnoh Journey's Gyms (each battle is its strongest version's, so Fantina is the fifth, as in
// Diamond and Pearl). No Badge raises a stat from Gen IV on. Their pictures are the owner's sheet's (pack_badges.py); the
// fallback shapes follow Bulbapedia's descriptions (a boulder, a fir tree, bricks, a reed-ringed lake, a will-o'-the-wisp, stones, an iceberg, a lighthouse)
const SINNOH_BADGES = [
  { n: "Coal Badge", gym: "Oreburgh Gym", leader: "Roark", type: "Rock", col: "#6e6a72", path: "M8 3h8l5 5v8l-5 5H8l-5-5V8z" },
  { n: "Forest Badge", gym: "Eterna Gym", leader: "Gardenia", type: "Grass", col: "#3a9a4a", path: "M12 2l5 7h-3l5 7h-5v6h-4v-6H5l5-7H7z" },
  { n: "Cobble Badge", gym: "Veilstone Gym", leader: "Maylene", type: "Fighting", col: "#d8903a", path: "M3 4h8v7H3zM13 4h8v7h-8zM3 13h8v7H3zM13 13h8v7h-8z" },
  { n: "Fen Badge", gym: "Pastoria Gym", leader: "Crasher Wake", type: "Water", col: "#3a8ad8", path: "M12 4c6 0 10 3.5 10 8s-4 8-10 8S2 16.5 2 12s4-8 10-8zm0 4c-3.5 0-6 1.8-6 4s2.5 4 6 4 6-1.8 6-4-2.5-4-6-4z" },
  { n: "Relic Badge", gym: "Hearthome Gym", leader: "Fantina", type: "Ghost", col: "#9a5ad0", path: "M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-2-1-4-3-5 1 2 0 4-2 4-1.5 0-2.5-1.5-2-3 .5-2 1-4 1-7z" },
  { n: "Mine Badge", gym: "Canalave Gym", leader: "Byron", type: "Steel", col: "#a8a8b4", path: "M7 10a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM17 10a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" },
  { n: "Icicle Badge", gym: "Snowpoint Gym", leader: "Candice", type: "Ice", col: "#7ac8f0", path: "M12 2l4 7 5 2-3 10H6L3 11l5-2z" },
  { n: "Beacon Badge", gym: "Sunyshore Gym", leader: "Volkner", type: "Electric", col: "#f0c83a", path: "M10 2h4l1 4H9zM9 7h6l2 15H7z" },
];
// Unova's: each part of its Journey has its own eight, in its Gym order (the owner's rule, 2026-10-15: Part 1 is Black/White's story,
// Part 2 Black 2/White 2's, PART_NAME in a4_story.js). Part 1's Legend Badge is Drayden's (Black's side, the owner's pick: White's
// Iris has the same team). No Badge raises a stat from Gen IV on. Pictures: the owner's sheet (pack_badges.py)
const UNOVA_BADGES = [
  { n: "Trio Badge", gym: "Striaton Gym", leader: "Cilan, Chili and Cress", type: "Grass", col: "#d8a040", path: "M7 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM17 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" },
  { n: "Basic Badge", gym: "Nacrene Gym", leader: "Lenora", type: "Normal", col: "#c8a080", path: "M8 3h8v18H8z" },
  { n: "Insect Badge", gym: "Castelia Gym", leader: "Burgh", type: "Bug", col: "#8ac040", path: "M12 3l8 5v8l-8 5-8-5V8z" },
  { n: "Bolt Badge", gym: "Nimbasa Gym", leader: "Elesa", type: "Electric", col: "#f0d040", path: "M13 2L5 14h6l-2 8 10-13h-6z" },
  { n: "Quake Badge", gym: "Driftveil Gym", leader: "Clay", type: "Ground", col: "#c09060", path: "M12 2l9 10-9 10-9-10z" },
  { n: "Jet Badge", gym: "Mistralton Gym", leader: "Skyla", type: "Flying", col: "#80b0e0", path: "M2 14l20-8-6 14-4-5z" },
  { n: "Freeze Badge", gym: "Icirrus Gym", leader: "Brycen", type: "Ice", col: "#90d0f0", path: "M12 2l2 7 7-2-5 5 5 5-7-2-2 7-2-7-7 2 5-5-5-5 7 2z" },
  { n: "Legend Badge", gym: "Opelucid Gym", leader: "Drayden", type: "Dragon", col: "#5060c0", path: "M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6z" },
];
const UNOVA2_BADGES = [
  { n: "Basic Badge", gym: "Aspertia Gym", leader: "Cheren", type: "Normal", col: "#c8a080", path: "M8 3h8v18H8z" },
  { n: "Toxic Badge", gym: "Virbank Gym", leader: "Roxie", type: "Poison", col: "#a050c0", path: "M12 3c4 4 7 7 7 11a7 7 0 0 1-14 0c0-4 3-7 7-11z" },
  { n: "Insect Badge", gym: "Castelia Gym", leader: "Burgh", type: "Bug", col: "#8ac040", path: "M12 3l8 5v8l-8 5-8-5V8z" },
  { n: "Bolt Badge", gym: "Nimbasa Gym", leader: "Elesa", type: "Electric", col: "#f0d040", path: "M13 2L5 14h6l-2 8 10-13h-6z" },
  { n: "Quake Badge", gym: "Driftveil Gym", leader: "Clay", type: "Ground", col: "#c09060", path: "M12 2l9 10-9 10-9-10z" },
  { n: "Jet Badge", gym: "Mistralton Gym", leader: "Skyla", type: "Flying", col: "#80b0e0", path: "M2 14l20-8-6 14-4-5z" },
  { n: "Legend Badge", gym: "Opelucid Gym", leader: "Drayden", type: "Dragon", col: "#5060c0", path: "M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6z" },
  { n: "Wave Badge", gym: "Humilau Gym", leader: "Marlon", type: "Water", col: "#3080d0", path: "M2 12c3-4 6-4 9 0s6 4 9 0v8H2z" },
];
// Kalos's eight, in X and Y's Gym order (both versions' Leaders have the same teams). No Badge raises a stat from Gen IV on.
// Pictures: the owner's sheet (pack_badges.py: bug, cliff, rumble, plant, voltage, fairy, psychic, iceberg)
const KALOS_BADGES = [
  { n: "Bug Badge", gym: "Santalune Gym", leader: "Viola", type: "Bug", col: "#a8c040", path: "M12 4a4 4 0 0 1 4 4v1l4-3v6l-4-1v3a4 4 0 0 1-8 0v-3l-4 1V6l4 3V8a4 4 0 0 1 4-4z" },
  { n: "Cliff Badge", gym: "Cyllage Gym", leader: "Grant", type: "Rock", col: "#b09070", path: "M2 20l6-12 4 5 3-9 7 16z" },
  { n: "Rumble Badge", gym: "Shalour Gym", leader: "Korrina", type: "Fighting", col: "#e07040", path: "M5 9a2 2 0 0 1 3.5-1.5A2 2 0 0 1 12 7a2 2 0 0 1 3.5.5A2 2 0 0 1 19 9v6a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" },
  { n: "Plant Badge", gym: "Coumarine Gym", leader: "Ramos", type: "Grass", col: "#50a050", path: "M20 3C11 3 4 8 4 16c0 2 1 4 2 5 1-6 5-10 10-12-4 3-7 7-8 12 9 0 12-9 12-18z" },
  { n: "Voltage Badge", gym: "Lumiose Gym", leader: "Clemont", type: "Electric", col: "#f0c030", path: "M13 2L5 14h6l-2 8 10-13h-6z" },
  { n: "Fairy Badge", gym: "Laverre Gym", leader: "Valerie", type: "Fairy", col: "#f090c0", path: "M12 21C5 15 3 11 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 13z" },
  { n: "Psychic Badge", gym: "Anistar Gym", leader: "Olympia", type: "Psychic", col: "#c060c0", path: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { n: "Iceberg Badge", gym: "Snowbelle Gym", leader: "Wulfric", type: "Ice", col: "#80c8f0", path: "M12 2l5 8 5 2-3 9H5l-3-9 5-2z" },
];
// each region's Badges (a region whose Journey isn't built yet has none); a Journey in parts has each part's (part: 1, 2)
const REGION_BADGES = { kanto: BADGES, johto: JOHTO_BADGES, hoenn: HOENN_BADGES, sinnoh: SINNOH_BADGES, unova: UNOVA_BADGES, kalos: KALOS_BADGES };
const PART_BADGES = { unova: [UNOVA_BADGES, UNOVA2_BADGES] };
const regionBadges = (id, part = 1) => (PART_BADGES[id] && PART_BADGES[id][part - 1]) || REGION_BADGES[id] || BADGES;
// a region with more than eight (Alola's island challenge: a stamp for each trial and grand trial, the owner's pick, ALOLA_BADGES in
// a4g_alola.js) counts its share of eight wherever Badges count (the Badge bonus, Trainers' Badges, goals): 6 of 12 stamps = 4 Badges
const badgeShare = (id, n) => { const L = REGION_BADGES[id]; return L && L.length > 8 ? Math.floor(n * 8 / L.length) : n; };
const badgePic =b => (RES_DATA.badge || {})[b.pic || b.n.replace(/ Badge$/, "").toLowerCase()];
const badgeSVG = (i, on = true, list = BADGES) => list[i] && badgePic(list[i])
  ? `<svg viewBox="0 0 32 32"${on ? "" : ' style="opacity:.25;filter:grayscale(1)"'}><image href="${resPng(badgePic(list[i]))}" width="32" height="32" style="image-rendering:pixelated"/></svg>`
  : list === BADGES && RES_DATA.card && RES_DATA.card["badge" + (i + 1)]
  ? `<svg viewBox="0 0 16 16"${on ? "" : ' style="opacity:.25"'}><image href="${resPng(RES_DATA.card["badge" + (i + 1)])}" width="16" height="16" style="image-rendering:pixelated"/></svg>`
  : `<svg viewBox="0 0 24 24"><path d="${list[i].path}" fill="${on ? list[i].col : "#c9cfdb"}" stroke="${on ? shade(list[i].col, -.45) : "#a8b0c2"}" stroke-width="1.4" stroke-linejoin="round"/>${on ? `<path d="${list[i].path}" fill="#fff" opacity=".25" transform="translate(-1.2 -1.2) scale(.92)" transform-origin="12 12"/>` : ""}</svg>`;
// a region's Badge case (a Journey in parts: a row for each part's eight)
const badgeCase = (id, cls = "") => (PART_BADGES[id] || [regionBadges(id)]).map((L, j) => { const n = partBadges(id, j + 1);
  return `<div class="badgecase ${cls}"${L.length > 8 ? ` style="grid-template-columns:repeat(${Math.ceil(L.length / 2)},1fr)"` : ""}>${L.map((b, i) => `<span class="bdg ${i < n ? "on" : ""}" title="${b.n}${PART_BADGES[id] ? ` (Part ${j + 1})` : ""}">${badgeSVG(i, i < n, L)}</span>`).join("")}</div>`; }).join("");

const ITEMS = {
  lmd: { n: "Poké Dollars", ic: IC.lmd, d: "Money. Spend it at the Poké Mart." },
  orundum: { n: "Gems", ic: IC.orundum, d: "Trade them for Safari Balls at the Safari Zone gate." },
  permit: { n: "Safari Ball", ic: IC.permit, d: "One throw in the Safari Zone." },
  cert: { n: "Coins", ic: IC.cert, d: "Game Corner Coins. Catching a Pokémon whose IVs are already perfect pays out Coins. Spend them at the Prize Corner." },
  tokens: { n: "Battle Points", ic: IC.tokens, d: "BP, earned in Link Battles. Spend them at the BP Exchange." },
  prime: { n: "Max Elixir", ic: IC.prime, d: "Restores your PP to full." },
  sanity: { n: "PP", ic: IC.sanity },
  rec1: { n: "Exp. Candy S", ic: IC.rec1, xp: 200, d: "Gives one Pokémon 200 Exp. Points." },
  rec2: { n: "Exp. Candy M", ic: IC.rec2, xp: 600, d: "Gives one Pokémon 600 Exp. Points." },
  rec3: { n: "Exp. Candy L", ic: IC.rec3, xp: 2000, d: "Gives one Pokémon 2,000 Exp. Points." },
  rec4: { n: "Exp. Candy XL", ic: IC.rec4, xp: 6000, d: "Gives one Pokémon 6,000 Exp. Points." },
  rare: { n: "Rare Candy", ic: IC.rare, d: "Raises a Pokémon's level by 1." },
  summ: { n: "Seed of Mastery", ic: IC.summ, d: "Raises the Mastery of one of a Pokémon's moves." },
  firestone: { n: "Fire Stone", ic: IC.firestone, d: "Evolves Vulpix, Growlithe and Eevee." },
  waterstone: { n: "Water Stone", ic: IC.waterstone, d: "Evolves Poliwhirl, Shellder, Staryu and Eevee." },
  thunderstone: { n: "Thunder Stone", ic: IC.thunderstone, d: "Evolves Pikachu and Eevee." },
  leafstone: { n: "Leaf Stone", ic: IC.leafstone, d: "Evolves Gloom, Weepinbell and Exeggcute." },
  moonstone: { n: "Moon Stone", ic: IC.moonstone, d: "Evolves Nidorina, Nidorino, Clefairy and Jigglypuff." },
  linkcord: { n: "Linking Cord", ic: IC.linkcord, d: "Evolves Pokémon that evolve by trading: Kadabra, Machoke, Graveler and Haunter." },
  // the later regions' evolution items (what each evolves is filled in from the Pokédex, in a3b_kits.js)
  sunstone: { n: "Sun Stone", ic: IC.sunstone }, shinystone: { n: "Shiny Stone", ic: IC.shinystone }, duskstone: { n: "Dusk Stone", ic: IC.duskstone },
  dawnstone: { n: "Dawn Stone", ic: IC.dawnstone }, icestone: { n: "Ice Stone", ic: IC.icestone }, ovalstone: { n: "Oval Stone", ic: IC.ovalstone },
  soothebell: { n: "Soothe Bell", ic: IC.soothebell }, dragonscale: { n: "Dragon Scale", ic: IC.dragonscale }, upgrade: { n: "Up-Grade", ic: IC.upgrade },
  dubiousdisc: { n: "Dubious Disc", ic: IC.dubiousdisc }, protector: { n: "Protector", ic: IC.protector }, electirizer: { n: "Electirizer", ic: IC.electirizer },
  magmarizer: { n: "Magmarizer", ic: IC.magmarizer }, reapercloth: { n: "Reaper Cloth", ic: IC.reapercloth }, deepseatooth: { n: "Deep Sea Tooth", ic: IC.deepseatooth },
  deepseascale: { n: "Deep Sea Scale", ic: IC.deepseascale }, prismscale: { n: "Prism Scale", ic: IC.prismscale },
  // generations 6 to 9
  sachet: { n: "Sachet", ic: IC.sachet }, whippeddream: { n: "Whipped Dream", ic: IC.whippeddream }, strawberrysweet: { n: "Strawberry Sweet", ic: IC.strawberrysweet },
  tartapple: { n: "Tart Apple", ic: IC.tartapple }, sweetapple: { n: "Sweet Apple", ic: IC.sweetapple }, syrupyapple: { n: "Syrupy Apple", ic: IC.syrupyapple },
  crackedpot: { n: "Cracked Pot", ic: IC.crackedpot }, unremarkableteacup: { n: "Unremarkable Teacup", ic: IC.unremarkableteacup }, galaricacuff: { n: "Galarica Cuff", ic: IC.galaricacuff },
  galaricawreath: { n: "Galarica Wreath", ic: IC.galaricawreath }, scrollofdarkness: { n: "Scroll of Darkness", ic: IC.scrollofdarkness }, scrollofwaters: { n: "Scroll of Waters", ic: IC.scrollofwaters },
  blackaugurite: { n: "Black Augurite", ic: IC.blackaugurite }, peatblock: { n: "Peat Block", ic: IC.peatblock }, auspiciousarmor: { n: "Auspicious Armor", ic: IC.auspiciousarmor },
  maliciousarmor: { n: "Malicious Armor", ic: IC.maliciousarmor }, leaderscrest: { n: "Leader's Crest", ic: IC.leaderscrest }, metalalloy: { n: "Metal Alloy", ic: IC.metalalloy },
  gimmighoulcoin: { n: "Gimmighoul Coin", ic: IC.gimmighoulcoin },
  free10: { n: "Safari Pass", ic: IC.free10, d: "Ten free throws in the Safari Zone, all at once." },
  gold5: { n: "Master Ball", ic: IC.gold5, d: "The best Poké Ball there is. It never fails: it catches one random 5★ Pokémon." },
};
const STONES = ["firestone", "waterstone", "thunderstone", "leafstone", "moonstone", "sunstone", "shinystone", "duskstone", "dawnstone", "icestone", "ovalstone",
  "soothebell", "linkcord", "dragonscale", "upgrade", "dubiousdisc", "protector", "electirizer", "magmarizer", "reapercloth", "deepseatooth", "deepseascale", "prismscale",
  "sachet", "whippeddream", "strawberrysweet", "tartapple", "sweetapple", "syrupyapple", "crackedpot", "unremarkableteacup", "galaricacuff", "galaricawreath", "scrollofdarkness", "scrollofwaters", "blackaugurite", "peatblock", "auspiciousarmor", "maliciousarmor", "leaderscrest", "metalalloy", "gimmighoulcoin"];
// held items that evolve a Pokémon too (used up): King's Rock, Metal Coat, Razor Claw, Razor Fang
const EVO_HELD = ["kingsrock", "metalcoat", "razorclaw", "razorfang", "leek"];
// natures: +10% to one stat, −10% to another (the five neutral ones change nothing)
const NATURES = { hardy: [], lonely: ["atk", "def"], brave: ["atk", "spe"], adamant: ["atk", "spa"], naughty: ["atk", "sdf"], bold: ["def", "atk"], docile: [],
  relaxed: ["def", "spe"], impish: ["def", "spa"], lax: ["def", "sdf"], timid: ["spe", "atk"], hasty: ["spe", "def"], serious: [], jolly: ["spe", "spa"],
  naive: ["spe", "sdf"], modest: ["spa", "atk"], mild: ["spa", "def"], quiet: ["spa", "spe"], bashful: [], rash: ["spa", "sdf"], calm: ["sdf", "atk"],
  gentle: ["sdf", "def"], sassy: ["sdf", "spe"], careful: ["sdf", "spa"], quirky: [] };
const NATURE_KEYS = Object.keys(NATURES);
const natName = n => n ? n[0].toUpperCase() + n.slice(1) : "Hardy";
const STAT_SHORT = { atk: "Attack", def: "Defense", spa: "Sp. Atk", sdf: "Sp. Def", spe: "Speed" };
const natText = n => { const [u, d] = NATURES[n] || []; return u ? `+${STAT_SHORT[u]}, −${STAT_SHORT[d]}` : "no stat changes"; };
// the Mints (every nature that changes stats, plus Serious), and the Ability Capsule and Ability Patch
const MINT_NATURES = ["lonely", "adamant", "naughty", "brave", "bold", "impish", "lax", "relaxed", "modest", "mild", "rash", "quiet", "calm", "gentle", "careful",
  "sassy", "timid", "hasty", "jolly", "naive", "serious"];
const resIcon = k => RES_DATA.item[k] ? pxIcon(RES_DATA.item[k]) : IC.boost;
for (const n of MINT_NATURES) ITEMS["mint_" + n] = { n: natName(n) + " Mint", ic: resIcon("mint_" + n), d: `Gives a Pokémon the ${natName(n)} nature (${natText(n)}).` };
ITEMS.abilitycapsule = { n: "Ability Capsule", ic: resIcon("abilitycapsule"), d: "Switches a Pokémon to another of its regular Abilities." };
// the live-service items (a6i to a6m): tickets, IV raisers, lucky-event items and the event currency, each with the owner's sprite
for (const [k, n, d, badge] of [
  ["gball", "Great Ball Ticket", "One throw in the Great Ball Safari, where 5★ and 4★ Pokémon turn up twice as often. It only takes these tickets."],
  ["uball", "Ultra Ball Ticket", "One throw in a Legendary Safari, instead of 600 Gems."],
  ["mticket", "Mystic Ticket", "One throw in a Mythical Distribution, instead of 600 Gems."],
  ["bottlecap", "Bottle Cap", "Raises one Pokémon's IV rank by 1 (use it from the Summary)."],
  ["goldbottlecap", "Gold Bottle Cap", "Makes one Pokémon's IVs perfect (use it from the Summary)."],
  ["wticket", "Wheel Ticket", "One spin of the Poké Wheel."],
  ["dice", "Dice", "Moves you 1 to 6 spaces on the Kanto Adventure Board."],
  ["luckydice", "Lucky Dice", "Moves you 3 to 6 spaces on the Kanto Adventure Board.", "L"],
  ["golddice", "Golden Dice", "Moves you 6 to 12 spaces on the Kanto Adventure Board.", "G"],
  ["tkey", "Treasure Key", "Opens one box in Pick-a-Box."],
  ["seamap", "Old Sea Map", "One dig in the Team Rocket Treasure Hunt."],
  ["fticket", "Flip Ticket", "Turns one card in Flip Cards."],
  ["luckybag", "Lucky Bag", "Holds one random prize (open it from the Offers tab)."],
  ["luckybag2", "Premium Lucky Bag", "Holds one random, better prize; every 10th holds the top one (open it from the Offers tab).", "P"],
  ["choicebox", "Choice Box", "Pick one of three rewards (open it from the Offers tab)."],
  ["starpiece", "Star Piece", "An event currency: spend it in the event shop before the event ends."],
  ["stardust", "Stardust", "A festival's currency: spend it in the festival shop before the festival ends."],
  ["cometshard", "Comet Shard", "The Anniversary Festival's currency: spend it in its shop before it ends."],
  ["nugget", "Nugget", "The Team Rocket Crossover's currency: spend it in its shop before it ends."],
]) ITEMS[k] = { n, ic: RES_DATA.item[k] ? pxIcon(RES_DATA.item[k], badge) : IC.boost, d };
ITEMS.abilitypatch = { n: "Ability Patch", ic: resIcon("abilitypatch"), d: "Gives a Pokémon its Hidden Ability (or back to a regular one)." };
ITEMS.heartscale = { n: "Heart Scale", ic: resIcon("heartscale"), d: "The Move Tutor teaches a Pokémon one egg move or tutor move for it, from its Summary's Moves." };

// ---------- terrains (Electric, Grassy, Misty and Psychic Terrain: about five rounds, for Pokémon on the ground) ----------
const TERRAIN = {
  electric: { n: "Electric Terrain", start: "An electric current ran across the battlefield!", end: "The electricity disappeared from the battlefield.", ic: "⚡", c: "#f7d02c" },
  grassy: { n: "Grassy Terrain", start: "Grass grew to cover the battlefield!", end: "The grass disappeared from the battlefield.", ic: "♣", c: "#7ac74c" },
  misty: { n: "Misty Terrain", start: "Mist swirled around the battlefield!", end: "The mist disappeared from the battlefield.", ic: "≈", c: "#f2a6d8" },
  psychic: { n: "Psychic Terrain", start: "The battlefield got weird!", end: "The weirdness disappeared from the battlefield.", ic: "✦", c: "#f95587" },
};

// ---------- status conditions and battle effects ----------
// b: 1 = good for the holder. major: one of the five main status conditions (a Pokémon can only have one).
const FX = {
  BRN: { n: "Burn", s: "BRN", c: "#ee6a30", major: 1, d: "Loses 1/16 of its max HP every turn, and Attack −2." },
  PSN: { n: "Poison", s: "PSN", c: "#a33ea1", major: 1, d: "Loses 1/8 of its max HP every turn." },
  TOX: { n: "Bad poison", s: "PSN", c: "#7a1a8a", major: 1, d: "Loses 1/16 of its max HP every turn, then 2/16, 3/16 and so on." },
  PAR: { n: "Paralysis", s: "PAR", c: "#e8b818", major: 1, d: "Speed −2, and each turn there is a 25% chance it can't move." },
  SLP: { n: "Sleep", s: "SLP", c: "#8a90a0", major: 1, d: "Can't move until it wakes up." },
  FRZ: { n: "Freeze", s: "FRZ", c: "#58c8e0", major: 1, d: "Can't move. Each turn it has a 20% chance to thaw; a Fire move thaws it at once." },
  CNF: { n: "Confusion", s: "CNF", c: "#c86ab8", d: "For 3 or 4 turns: each turn there is a 33% chance it hurts itself in its confusion instead of moving." },
  INFAT: { n: "Infatuation", s: "LOV", c: "#f26aa8", d: "Like confusion, but each turn there is a 1 in 3 chance it attacks one of its partners instead of moving (itself, with no partner beside it). 2 to 4 turns, over sooner if the one it's in love with leaves the field." },
  SEED: { n: "Leech Seed", s: "SED", c: "#5aa83a", d: "Loses 1/8 of its max HP every turn; the Pokémon that planted it gets the HP." },
  TRAP: { n: "Bound", s: "BND", c: "#a87a4a", d: "Squeezed every turn for 1/8 of its max HP for 4 or 5 turns, while its binder stays on the field. It can't switch out." },
  DISABLE: { n: "Disable", s: "DIS", c: "#6a7286", d: "Can't use its S2 or S3 moves." },
  RECHARGE: { n: "Recharge", s: "RCH", c: "#6a7286", d: "Must recharge and loses its next turn." },
  SUB: { n: "Substitute", b: 1, s: "SUB", c: "#5a9a6a", d: "A decoy takes the damage until it breaks." },
  FOCUS: { n: "Focus Energy", b: 1, s: "FOC", c: "#e8a03a", d: "Getting pumped: much more likely to land critical hits." },
  MIST: { n: "Mist", b: 1, s: "MST", c: "#a8d8f2", d: "Shrouded in mist: other Pokémon can't lower its stats." },
  REFLECT: { n: "Reflect", b: 1, s: "REF", c: "#f2a6c8", d: "Physical damage taken is cut by a third." },
  LSCREEN: { n: "Light Screen", b: 1, s: "LSC", c: "#f2d86a", d: "Special damage taken is cut by a third." },
  FLASHFIRE: { n: "Flash Fire", b: 1, s: "FF", c: "#ee8130", d: "Its Fire-type moves are powered up by 50%." },
  TAILWIND: { n: "Tailwind", b: 1, s: "TLW", c: "#a98ff3", d: "A tailwind: its Speed is doubled." },
  VEIL: { n: "Aurora Veil", b: 1, s: "VEL", c: "#96d9d6", d: "Damage taken is cut by a third." },
  LUCKY: { n: "Lucky Chant", b: 1, s: "LCK", c: "#f2d86a", d: "Critical hits can't land on it." },
  AQUARING: { n: "Aqua Ring", b: 1, s: "AQR", c: "#6390f0", d: "Restores 1/16 of its max HP every turn." },
  INGRAIN: { n: "Ingrain", b: 1, s: "ING", c: "#7ac74c", d: "Rooted: restores 1/16 of its max HP every turn, but can't be switched out." },
  MAGNETRISE: { n: "Magnet Rise", b: 1, s: "MGR", c: "#f7d02c", d: "Floating: Ground-type moves can't hit it." },
  LOCKON: { n: "Lock-On", b: 1, s: "LOK", c: "#e8a03a", d: "Its next attack can't miss, until the end of its next turn." },
  LASER: { n: "Laser Focus", b: 1, s: "LSR", c: "#e8a03a", d: "Its next attack is a critical hit, until the end of its next turn." },
  HELPED: { n: "Helping Hand", b: 1, s: "HLP", c: "#f2c14e", d: "Its next move is 50% stronger." },
  CAMOUFLAGE: { n: "Camouflage", b: 1, s: "CMF", c: "#8bbf6a", d: "While a partner is on the field, the other side's single-target moves can't pick it." },
  FOLLOWME: { n: "Center of attention", b: 1, s: "CTR", c: "#f2a6c8", d: "Opposing moves aimed at its team hit it instead, until its next turn." },
  DBOND: { n: "Destiny Bond", b: 1, s: "DBD", c: "#735797", d: "If a move knocks it out before its next turn, the attacker faints too." },
  WISH: { n: "Wish", b: 1, s: "WSH", c: "#f2d86a", d: "Half of the wisher's max HP comes back at the end of this Pokémon's next turn." },
  TAUNT: { n: "Taunt", s: "TNT", c: "#c22e28", d: "Taunted: can only use damaging moves." },
  THROAT: { n: "Throat Chop", s: "THR", c: "#705746", d: "Can't use sound moves." },
  HEALBLOCK: { n: "Heal Block", s: "HBK", c: "#f95587", d: "Can't restore HP or use healing moves (5 turns; 2 from Psychic Noise)." },
  CHARGE: { n: "Charge", b: 1, s: "CHG", c: "#f7d02c", d: "Its next Electric move has double power." },
  SALTCURE: { n: "Salt Cure", s: "SLT", c: "#b6a136", d: "Loses 1/8 of its max HP every turn (1/4 for Water and Steel types)." },
  ENCORE: { n: "Encore", s: "ENC", c: "#f95587", d: "Can only use its last move." }, TORMENT: { n: "Torment", s: "TRM", c: "#705746", d: "Can't use the same move twice in a row." },
  SPITE: { n: "Spite", s: "SPT", c: "#735797", d: "Can't use its last move for now." }, EMBARGO: { n: "Embargo", s: "EMB", c: "#705746", d: "Its held item has no effect." },
  NIGHTMARE: { n: "Nightmare", s: "NGT", c: "#735797", d: "Loses 1/4 of its max HP every turn while asleep." }, PERISH: { n: "Perish Song", s: "PER", c: "#735797", d: "Faints when the count reaches 0, unless it switches out." },
  OCTOLOCK: { n: "Octolock", s: "OCT", c: "#c22e28", d: "Can't switch out; Defense and Sp. Def fall every turn." }, POWDER: { n: "Powder", s: "PWD", c: "#a6b91a", d: "Its next Fire-type move fails and explodes: it and each of its partners on the field lose 1/4 of their max HP." },
  TELEKINESIS: { n: "Telekinesis", b: 1, s: "TLK", c: "#f95587", d: "Lifted up: every move hits it, and Ground moves don't." }, FORESIGHT: { n: "Identified", s: "IDN", c: "#a8a77a", d: "Its evasiveness is ignored; Normal and Fighting moves hit it." },
  MIRACLEEYE: { n: "Miracle Eye", s: "MEY", c: "#f95587", d: "Its evasiveness is ignored; Psychic moves hit it." }, ELECTRIFY: { n: "Electrify", s: "ELC", c: "#f7d02c", d: "Its next move is Electric type." },
  IMPRISON: { n: "Imprison", b: 1, s: "IMP", c: "#f95587", d: "The other side can't use the moves it knows." }, MAGICCOAT: { n: "Magic Coat", b: 1, s: "MCT", c: "#f95587", d: "Status moves bounce back until its next turn." },
  BIDE: { n: "Bide", b: 1, s: "BID", c: "#a8a77a", d: "Storing energy: the second opposing attack before its next turn sets it off, at the last attacker for twice the damage." },
  SNATCH: { n: "Snatch", b: 1, s: "SNT", c: "#705746", d: "Takes the other side's next boosting or healing move." }, GRUDGE: { n: "Grudge", b: 1, s: "GRD", c: "#735797", d: "Its attacker's move loses all its power if it faints." },
  CRAFTY: { n: "Crafty Shield", b: 1, s: "CRF", c: "#d685ad", d: "The other side's status moves fail." }, MATBLOCK: { n: "Mat Block", b: 1, s: "MAT", c: "#c22e28", d: "The other side's attacks fail." },
  QUICKGUARD: { n: "Quick Guard", b: 1, s: "QGD", c: "#c22e28", d: "Priority moves fail." }, WIDEGUARD: { n: "Wide Guard", b: 1, s: "WGD", c: "#b6a136", d: "Spread moves fail." },
  ALLYSWITCH: { n: "Ally Switch", b: 1, s: "ASW", c: "#f95587", d: "Attacks aimed at it hit its partner instead." }, SKYDROP: { n: "Sky Drop", s: "SKY", c: "#a98ff3", d: "Held up in the sky: it can't move." },
  MINIMIZE: { n: "Minimize", b: 1, s: "MIN", c: "#a8a77a", d: "Small, but Stomp, Body Slam and the like hit it twice as hard and never miss." },
  SMACKDOWN: { n: "Smacked down", s: "GRD", c: "#b6a136", d: "On the ground: Ground moves hit it." },
  YAWN: { n: "Drowsy", s: "YWN", c: "#8a90a0", d: "Falls asleep at the end of its next turn." },
  CURSE: { n: "Curse", s: "CRS", c: "#4a3a6a", d: "Cursed: loses 1/4 of its max HP every turn." },
  NOSWITCH: { n: "Can't escape", s: "NOE", c: "#6a7286", d: "It can't be switched out." },
  PROTECT: { n: "Protect", b: 1, s: "PRT", c: "#5ac8a8", d: "Protected: moves from the other side fail until its next turn." },
  ENDURE: { n: "Endure", b: 1, s: "END", c: "#e8a03a", d: "Bracing itself: holds on with 1 HP until its next turn." },
  SAFEGUARD: { n: "Safeguard", b: 1, s: "SFG", c: "#b8a8f2", d: "A mystical veil: the other side can't give it a status condition or confuse it." },
};
const MAJOR = Object.keys(FX).filter(k => FX[k].major);
// stat stages, -6 to +6
const STAGE_N = { atk: "Attack", def: "Defense", spa: "Sp. Atk", sdf: "Sp. Def", spe: "Speed", acc: "accuracy", eva: "evasiveness" };
const STAGE_S = { atk: "Atk", def: "Def", spa: "SpA", sdf: "SpD", spe: "Spe", acc: "Acc", eva: "Eva" };
const stageMult = (s, accLike) => accLike ? (s >= 0 ? (3 + s) / 3 : 3 / (3 - s)) : (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
const STAGE_WORD = n => ({ 1: "rose!", 2: "rose sharply!", 3: "rose drastically!", "-1": "fell!", "-2": "harshly fell!", "-3": "severely fell!" }[clamp(n, -3, 3)]);
// Mastery ranks for moves (raised with Seeds of Mastery)
const MAX_SK = 5;
const RANK = ["", "1", "2", "3", "4", "★"];
