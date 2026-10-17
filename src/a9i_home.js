
// =====================================================================
//  HOME OVERWORLD — the home screen is a top-down FireRed/LeafGreen map where your trainer walks around with up to six
//  of your Pokémon (their overworld sprites), your partner following right behind. Choose the area from those you've
//  reached on the Journey, and who comes along (tap the partner's nameplate).
//  Assets from tools/pack_home.py: RES_DATA.home.map (scenes), .mon (Pokémon walk sheets: 4 x 4 frames, 32 x 32 for most, bigger for the big ones, rows
//  facing down, left, right, up), .pl (player walk strips: rows down, up, left, right), .meta (walkable tiles, unlocks, sizes).
// =====================================================================
const HOME = RES_DATA.home && RES_DATA.home.meta ? RES_DATA.home : null;
const homeImg = (() => {
  const cache = {};
  return (kind, k) => {
    const id = kind + ":" + k;
    if (!(id in cache)) { const b = HOME && HOME[kind][k]; cache[id] = b ? Object.assign(new Image(), { src: resPng(b) }) : null; }
    return cache[id];
  };
})();
function homeNode(name) { for (const ch of STORY[0].chapters) for (const nd of ch.nodes) if (nd.name === name) return nd; return null; }
// every area, and whether it's open: Pallet Town always, the rest once you've cleared their Journey stage
function homeAreas() {
  return HOME ? HOME.meta.maps.map(m => { const nd = m.unlock && homeNode(m.unlock); return { ...m, nd, open: !m.unlock || !!(nd && nodeStars(nd.id) > 0) }; }) : [];
}
function homeArea() { const a = homeAreas(); return a.find(m => m.open && S.home && m.key === S.home.map) || a[0]; }
// who walks around: your picks (up to six), or else your partner and your strongest Pokémon
function homeParty() {
  const ok = k => S.ops[k] && HOME && HOME.mon[k];
  let p = ((S.home && S.home.party) || []).filter(ok);
  if (!p.length) p = [S.assistant, ...byPower()].filter((k, i, a) => ok(k) && a.indexOf(k) === i);
  return p.slice(0, 6);
}
// your look's overworld sprite (looks without one borrow a close match)
const homeLook = () => { const a = avatar(); return HOME.pl[a] ? a : HOME.meta.alias[a] || (LEAF_LIKE.includes(a) ? "leaf" : "red"); };

// ---------- the world ----------
const HW = { raf: 0, state: null };
const HDIR = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] };
function homeWorldStart() {
  const cv = $(".stage canvas.hworld"); if (!cv || !HOME) return;
  const area = homeArea(), party = homeParty(), look = homeLook();
  const sig = [area.key, party.join(), look, S.assistant].join("|");
  // coming back to the home screen keeps everyone where they were
  if (!HW.state || HW.state.sig !== sig) HW.state = homeWorldNew(area, party, look, sig, party.includes(S.assistant) ? S.assistant : party[0]);
  HW.state.cv = cv; HW.state.g = cv.getContext("2d");
  cv.onpointerdown = e => homeTap(e);
  cancelAnimationFrame(HW.raf); HW.last = 0; HW.raf = requestAnimationFrame(homeFrame);
}
function homeWorldNew(area, party, look, sig, partner) {
  const W = area.w, H = area.h, walk = area.walk.map(r => [...r].map(c => c === "1"));
  const free = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (walk[y][x]) free.push([x, y]);
  // everyone starts around the middle of the walkable ground
  const cx = free.reduce((a, p) => a + p[0], 0) / free.length, cy = free.reduce((a, p) => a + p[1], 0) / free.length;
  free.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy));
  const taken = [], spot = () => {   // a couple of tiles apart, so nobody starts on top of anyone
    const p = free.find(q => taken.every(t => Math.max(Math.abs(t[0] - q[0]), Math.abs(t[1] - q[1])) >= 3)) || free.find(q => !taken.some(t => t[0] === q[0] && t[1] === q[1])) || free[0];
    taken.push(p); return p;
  };
  const mk = (kind, key, p) => ({ kind, key, x: p[0], y: p[1], fx: p[0], fy: p[1], dir: "d", move: null, wait: 600 + Math.random() * 2400, path: [], hop: -1, steps: 0, ph: Math.random() * 1000 });
  const pl = mk("pl", look, spot());
  const mons = party.map(k => Object.assign(mk("mon", k, spot()), { follow: k === partner }));
  // tall things by the row where they meet the ground (pack_home.py): drawn in depth order with the walkers
  const over = new Map();
  (area.base || []).forEach((row, y) => row.forEach((b, x) => { if (b >= 0) { if (!over.has(b)) over.set(b, []); over.get(b).push([x, y]); } }));
  return { sig, area, W, H, walk, pl, mons, ents: [pl, ...mons], trail: [], cam: null, img: homeImg("map", area.key), over, overImg: homeImg("map", area.key + "_over") };
}
const homeFree = (st, x, y, me) => {
  if (x < 0 || y < 0 || x >= st.W || y >= st.H || !st.walk[y][x]) return false;
  // others' tiles are taken; Pokémon wandering on their own also keep a tile of space around everyone
  const gap = me && me.kind === "mon" && !me.follow ? ((HOME.meta.wide[me.key] || 16) > 20 ? 2 : 1) : 0;
  return !st.ents.some(e => e !== me && !(me && me.follow && e === st.pl) && [[e.x, e.y], e.move && e.move.to].some(p => p && Math.max(Math.abs(p[0] - x), Math.abs(p[1] - y)) <= gap));
};
// shortest walk to a tile over open ground (others don't block planning; each step checks again)
function homePath(st, from, to, max = 400) {
  const key = p => p[0] + "," + p[1], prev = new Map([[key(from), null]]), q = [from];
  while (q.length && prev.size < max) {
    const c = q.shift();
    if (c[0] === to[0] && c[1] === to[1]) { const path = []; let k = key(c); while (prev.get(k)) { path.unshift(k.split(",").map(Number)); k = key(prev.get(k)); } return path; }
    for (const d of Object.values(HDIR)) {
      const n = [c[0] + d[0], c[1] + d[1]];
      if (n[0] < 0 || n[1] < 0 || n[0] >= st.W || n[1] >= st.H || !st.walk[n[1]][n[0]] || prev.has(key(n))) continue;
      prev.set(key(n), c); q.push(n);
    }
  }
  return null;
}
function homeStep(st, e, to, now) {
  const dx = to[0] - e.x, dy = to[1] - e.y;
  e.dir = dx > 0 ? "r" : dx < 0 ? "l" : dy > 0 ? "d" : "u";
  if (!homeFree(st, to[0], to[1], e)) return false;
  if (e === st.pl) { st.trail.unshift([e.x, e.y]); st.trail.length = Math.min(st.trail.length, 4); }
  e.move = { from: [e.x, e.y], to, t0: now, dur: e.kind === "pl" ? 270 : 300 }; e.steps++;
  return true;
}
function homeThink(st, e, now, dt) {
  if (e.move) {
    const k = (now - e.move.t0) / e.move.dur;
    if (k >= 1) { e.x = e.move.to[0]; e.y = e.move.to[1]; e.move = null; }
    else { e.fx = e.move.from[0] + (e.move.to[0] - e.move.from[0]) * k; e.fy = e.move.from[1] + (e.move.to[1] - e.move.from[1]) * k; return; }
  }
  e.fx = e.x; e.fy = e.y;
  if (e.follow) {
    // the partner walks to where you just were, and otherwise faces you
    const t = st.trail.find(p => p[0] !== e.x || p[1] !== e.y);
    const near = Math.abs(st.pl.x - e.x) + Math.abs(st.pl.y - e.y);
    if (t && near > 1) {
      if (Math.abs(t[0] - e.x) + Math.abs(t[1] - e.y) === 1) homeStep(st, e, t, now);
      else { const p = homePath(st, [e.x, e.y], t); if (p && p.length) homeStep(st, e, p[0], now); }
    } else if (!e.move) { const dx = st.pl.x - e.x, dy = st.pl.y - e.y; if (dx || dy) e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : dy > 0 ? "d" : "u"; }
    return;
  }
  if ((e.wait -= dt) > 0) return;
  if (e.path.length) { if (!homeStep(st, e, e.path.shift(), now)) e.path = []; if (!e.path.length) e.wait = e.kind === "pl" ? 1800 + Math.random() * 4200 : 900 + Math.random() * 3200; return; }
  if (e.kind === "pl") {
    // you stroll to somewhere nearby
    const opts = []; for (let y = 0; y < st.H; y++) for (let x = 0; x < st.W; x++) { const d = Math.abs(x - e.x) + Math.abs(y - e.y); if (st.walk[y][x] && d >= 2 && d <= 7) opts.push([x, y]); }
    const p = opts.length && homePath(st, [e.x, e.y], opts[Math.floor(Math.random() * opts.length)]);
    if (p && p.length) e.path = p; else e.wait = 1500;
  } else {
    // the others potter about near you: a step or three, or just a look around
    if (Math.random() < .3) { e.dir = "dulr"[Math.floor(Math.random() * 4)]; e.wait = 700 + Math.random() * 2200; return; }
    const ds = Object.entries(HDIR).sort(() => Math.random() - .5);
    for (const [, d] of ds) {
      const n = Math.floor(1 + Math.random() * 3), path = [];
      for (let i = 1; i <= n; i++) { const t = [e.x + d[0] * i, e.y + d[1] * i]; if (!homeFree(st, t[0], t[1], e)) break; path.push(t); }
      const end = path[path.length - 1];
      if (end && Math.abs(end[0] - st.pl.x) + Math.abs(end[1] - st.pl.y) <= 6) { e.path = path; break; }
    }
    e.wait = e.path.length ? 0 : 600 + Math.random() * 1800;
  }
}
function homeFrame(now) {
  const st = HW.state;
  if (!st || !st.cv || !st.cv.isConnected) { HW.raf = 0; return; }
  HW.raf = requestAnimationFrame(homeFrame);
  if (document.hidden) { HW.last = now; return; }
  const dt = Math.min(100, now - (HW.last || now)); if (HW.last && dt < 30) return;   // about 30 frames a second
  HW.last = now;
  for (const e of st.ents) homeThink(st, e, now, dt);
  homeDraw(st, now);
}
function homeDraw(st, now) {
  const { cv, g } = st, dpr = pxRatio(), cw = cv.clientWidth, ch = cv.clientHeight;
  if (!cw || !ch) return;
  if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) { cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
  const mw = st.W * 16, mh = st.H * 16;
  // about thirteen tiles from top to bottom (a DS screen's worth), at a whole number of screen pixels per map pixel (crisp), and never smaller than the map
  const s = Math.max(1, Math.round(cv.height / 208), Math.ceil(cv.width / mw), Math.ceil(cv.height / mh)), vw = cv.width / s, vh = cv.height / s;
  // the camera follows you, easing, and never shows past the map's edges
  const tx = clamp(st.pl.fx * 16 + 8, vw / 2, mw - vw / 2), ty = clamp(st.pl.fy * 16 + 8, vh / 2, mh - vh / 2);
  if (!st.cam) st.cam = [tx, ty]; else { st.cam[0] += (tx - st.cam[0]) * .12; st.cam[1] += (ty - st.cam[1]) * .12; }
  const ox = Math.round((vw / 2 - st.cam[0]) * s) / s, oy = Math.round((vh / 2 - st.cam[1]) * s) / s;
  g.setTransform(s, 0, 0, s, ox * s, oy * s); g.imageSmoothingEnabled = false; st.view = { s: s / dpr, ox, oy };
  g.fillStyle = "#000"; g.fillRect(-ox, -oy, vw, vh);
  if (st.img && st.img.naturalWidth) g.drawImage(st.img, 0, 0);
  // nearer things in front: the walkers and the map's tall things in order of where they meet the ground, so a building
  // covers anyone behind it and anyone in front of it covers the building (beside it on its front row counts as in front)
  const items = st.ents.map(e => ({ y: e.fy * 16 + 16.5, e }));
  if (st.overImg && st.overImg.naturalWidth) for (const b of st.over.keys()) items.push({ y: (b + 1) * 16, b });
  for (const it of items.sort((a, b) => a.y - b.y)) {
    if (!it.e) { for (const [x, y] of st.over.get(it.b)) g.drawImage(st.overImg, x * 16, y * 16, 16, 16, x * 16, y * 16, 16, 16); continue; }
    const e = it.e, bx = e.fx * 16 + 8, by = e.fy * 16 + 16, hop = e.hop >= 0 ? Math.sin(Math.min(1, (now - e.hop) / 320) * Math.PI) * 6 : 0;
    if (e.hop >= 0 && now - e.hop > 320) e.hop = -1;
    if (e.kind === "mon") {
      const im = homeImg("mon", e.key); if (!im || !im.naturalWidth) continue;
      // following Pokémon keep stepping in place, faster while they walk
      // (a frame is a quarter of its sheet: 32 px for most, 64 for Eternatus, Groudon, Wailord... drawn at that size, feet on the tile)
      const z = im.naturalWidth / 4, f = Math.floor((now + e.ph) / (e.move ? 110 : 190)) % 4, row = { d: 0, l: 1, r: 2, u: 3 }[e.dir], foot = HOME.meta.foot[e.key] || z - 1;
      g.drawImage(im, f * z, row * z, z, z, Math.round(bx - z / 2), Math.round(by - foot + 1 - hop), z, z);
    } else {
      const im = homeImg("pl", e.key), m = HOME.meta.players[e.key]; if (!im || !im.naturalWidth || !m) continue;
      const row = { d: 0, u: 1, l: 2, r: 3 }[e.dir];
      // your trainer stands still unless walking: each step shows a stepping frame (left and right foot by turns) and
      // settles on the standing frame, so every walk ends standing. Frame 0 stands; 1 and 2 step (1 and 3 on 4-frame sheets)
      const k = e.move ? (now - e.move.t0) / e.move.dur : 1, f = k < .6 ? (e.steps % 2 ? 1 : m.n >= 4 ? 3 : 2) : 0;
      g.drawImage(im, f * m.fw, row * m.fh, m.fw, m.fh, Math.round(bx - m.fw / 2), Math.round(by - m.fh + 1 - hop), m.fw, m.fh);
    }
  }
}
// the title screen gets the same treatment: one of a few Kanto scenes, Red or Leaf strolling with Pikachu and friends
const TITLE_SCENES = ["pallet", "viridian", "forest", "cerulean", "vermilion", "celadon", "fuchsia", "safari"];
const TITLE_CAST = ["bulbasaur", "charmander", "squirtle", "eevee", "snorlax", "jigglypuff", "clefairy", "psyduck", "meowth", "gengar", "lapras", "dragonite", "mew", "pidgey", "growlithe", "vulpix"];
function titleWorld() {
  if (!HOME) return null;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const area = HOME.meta.maps.find(m => m.key === pick(TITLE_SCENES)) || HOME.meta.maps[0];
  const cast = ["pikachu", ...TITLE_CAST.slice().sort(() => Math.random() - .5).slice(0, 5)].filter(k => HOME.mon[k]);
  return homeWorldNew(area, cast, Math.random() < .5 ? "red" : "leaf", "title", "pikachu");
}
function titleWorldFrame(cv, now) {
  if (!TITLE.world) TITLE.world = titleWorld();
  const st = TITLE.world; if (!st) return false;
  st.cv = cv; st.g = cv.getContext("2d");
  const dt = Math.min(100, now - (TITLE.last || now)); TITLE.last = now;
  for (const e of st.ents) homeThink(st, e, now, dt);
  homeDraw(st, now);
  // a soft shade at the top and bottom, so the logo and buttons stay easy to read
  const g = st.g; g.setTransform(1, 0, 0, 1, 0, 0);
  const sh = g.createLinearGradient(0, 0, 0, cv.height);
  sh.addColorStop(0, "rgba(10,20,50,.38)"); sh.addColorStop(.3, "rgba(10,20,50,0)"); sh.addColorStop(.75, "rgba(10,20,50,0)"); sh.addColorStop(1, "rgba(10,20,50,.45)");
  g.fillStyle = sh; g.fillRect(0, 0, cv.width, cv.height);
  return true;
}
// tap a Pokémon: it cries and hops (your partner says something too)
function homeTap(ev) {
  const st = HW.state; if (!st || !st.view) return;
  const r = st.cv.getBoundingClientRect(), v = st.view, k = st.cv.clientWidth / r.width;   // (screen pixels to the canvas's own)
  const mx = (ev.clientX - r.left) * k / v.s - v.ox, my = (ev.clientY - r.top) * k / v.s - v.oy;
  const hit = [...st.mons].sort((a, b) => b.fy - a.fy).find(e => Math.abs(mx - (e.fx * 16 + 8)) < 12 && my < e.fy * 16 + 17 && my > e.fy * 16 - 14);
  if (!hit) return;
  hit.hop = performance.now();
  if (hit.key === S.assistant) quip(); else cry(hit.key);
}

// ---------- choosing the area and the Pokémon ----------
function homeEditHTML() {
  // the scenes' pictures, once, as CSS classes
  if (!$("#hmStyle")) { const s = document.createElement("style"); s.id = "hmStyle"; s.textContent = HOME.meta.maps.map(m => `.hm-${m.key}{background-image:url(${resPng(HOME.map[m.key])})}`).join(""); document.head.appendChild(s); }
  const areas = homeAreas(), cur = homeArea().key, party = homeParty(), chosen = (S.home && S.home.party && S.home.party.length) ? party : [];
  const own = Object.keys(S.ops).filter(k => HOME.mon[k]).sort((a, b) => power(b, S.ops[b]) - power(a, S.ops[a]));
  return `<div class="stack" style="gap:10px">
    <h2>Your area</h2>
    <p class="small dim" style="margin-top:-6px">Where your trainer and Pokémon hang out. Clear more of the Journey to open more of Kanto.</p>
    <div class="hareas">${areas.map(a => `<button class="harea hm-${a.key} ${a.key === cur ? "on" : ""}" data-act="homeMap" data-k="${a.key}" ${a.open ? "" : "disabled"} aria-label="${esc(a.n)}${a.open ? "" : " (locked)"}">${a.open ? "" : `<small>Clear ${a.nd ? a.nd.id + " " : ""}${esc(a.unlock)}</small>`}<span>${esc(a.n)}</span></button>`).join("")}</div>
    <h3>On the map <span class="small dim">${chosen.length ? chosen.length + "/6" : "your partner and strongest"}</span></h3>
    <div class="hparty">${own.map(k => `<button class="hmon ${chosen.includes(k) ? "on" : ""}" data-act="homeMon" data-k="${k}"><img src="${sprFront(k)}" alt="">${esc(OPS[k].n)}${k === S.assistant ? "<i>Partner</i>" : ""}</button>`).join("")}</div>
    <button class="btn wide" data-act="closeModal">Done</button></div>`;
}
const HOME_ACT = {
  homeEdit: () => { if (HOME) openModal(homeEditHTML()); },
  homeMap: d => { S.home.map = d.k; save(); openModal(homeEditHTML()); if (UI.view === "home") rerender(); },
  homeMon: d => {
    const p = S.home.party && S.home.party.length ? S.home.party.filter(k => S.ops[k]) : [];
    const i = p.indexOf(d.k);
    if (i >= 0) p.splice(i, 1); else if (p.length < 6) p.push(d.k); else { toast("Up to six Pokémon can come along."); return; }
    S.home.party = p; save(); openModal(homeEditHTML()); if (UI.view === "home") rerender();
  },
};
