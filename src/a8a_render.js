
// =====================================================================
//  BATTLE RENDERER — a small 3D scene on a 2D canvas.
//  World: ground plane y=0, battle axis x (allies -x, enemies +x), depth z.
//  Camera: orbit (yaw/pitch/dist) around a target point, eased every frame.
// =====================================================================
// three places per side (x from the middle, z across): two in front, one behind
const SLOTS = [[150, -52], [168, 74], [272, -8]];
const BT = { on: false, cv: null, g: null, W: 0, H: 0, dpr: 1, clock: 0, speed: 1, paused: false, vus: new Map(),
  parts: [], bolts: [], floats: [], rings: [], psScenes: [], waits: [], tweens: [],
  cam: null, camT: null, camK: 3, home: null, shake: 0, env: null, B: null, target: null, active: null, picking: false,
  raf: 0, last: 0, orbit: false, shx: 0, shy: 0, K: null, flash: 0, flashCol: "#fff", letterbox: 0, letterboxT: 0 };

const v3 = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  lerp: (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
};
function camBasis(c) {
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  const pos = [c.tx + c.dist * Math.sin(c.yaw) * cp, c.ty + c.dist * sp, c.tz - c.dist * Math.cos(c.yaw) * cp];
  const f = v3.norm(v3.sub([c.tx, c.ty, c.tz], pos));
  const r = v3.norm(v3.cross([0, 1, 0], f));
  const u = v3.cross(f, r);
  return { pos, f, r, u, focal: (BT.H / 2) / Math.tan(c.fov / 2), c };
}
function proj(K, x, y, z) {
  const dx = x - K.pos[0], dy = y - K.pos[1], dz = z - K.pos[2];
  const zc = dx * K.f[0] + dy * K.f[1] + dz * K.f[2];
  if (zc < 8) return null;
  const s = K.focal / zc;
  return [BT.W / 2 + (dx * K.r[0] + dy * K.r[1] + dz * K.r[2]) * s, BT.H / 2 - (dx * K.u[0] + dy * K.u[1] + dz * K.u[2]) * s, s, zc];
}

// ---------- environments ----------
const ENVS = {
  // routes and towns in daylight
  route:   { sky: ["#4a8ad8", "#8ec4f2", "#dff2ff"], ground: ["#7ac25a", "#3f7a2e"], grid: "#2f5a22", gridA: .12, mount: ["#6aa86a", "#4a8a52"], fog: "#dff2ff", trees: 1, clouds: 1,
             bodies: [{ az: .45, el: .42, r: .05, c: "#fff6c8" }], prop: "#3a6a2a", ring: "#f4f8e8", bb: "field" },
  forest:  { sky: ["#1e4a2a", "#4a8a4a", "#a8d88a"], ground: ["#4a7a30", "#1e3a14"], grid: "#14280c", gridA: .2, mount: ["#1f4a24", "#123018"], fog: "#a8d88a", trees: 1,
             bodies: [{ az: -.2, el: .32, r: .03, c: "#f6ffd8" }], prop: "#3a2a1a", ring: "#e8f8c8", bb: "forest" },
  city:    { sky: ["#5a9ae0", "#a8d0f2", "#f2f8ff"], ground: ["#b8b0a0", "#6a6458"], grid: "#5a5448", gridA: .16, mount: null, fog: "#f2f8ff", clouds: 1,
             bodies: [{ az: .5, el: .4, r: .05, c: "#fff6c8" }], prop: "#c88a6a", ring: "#ffffff", city: "#8a98b0", lit: "#f2f8ff", low: 1, bb: "city" },
  cave:    { sky: ["#0c0a10", "#1e1a24", "#3a3240"], ground: ["#5a4e44", "#241e1a"], grid: "#2a221c", gridA: .25, mount: ["#2a2420", "#1a1612"], fog: "#3a3240", spires: 1,
             bodies: [], prop: "#4a3e34", ring: "#c8b89a", bb: "cave1" },
  gym:     { sky: ["#202838", "#384a68", "#6a7ea0"], ground: ["#c8ccd8", "#7a8098"], grid: "#e3350d", gridA: .35, mount: null, fog: "#6a7ea0",
             bodies: [], prop: "#4a5470", ring: "#e3350d", indoor: 1, bb: "indoor1" },
  sea:     { sky: ["#3a7ad8", "#7ab8f2", "#d8f0ff"], ground: ["#e8d8a8", "#b89a68"], grid: "#a8885a", gridA: .14, mount: null, fog: "#d8f0ff", clouds: 1, water: "#3a8ad8",
             bodies: [{ az: .3, el: .35, r: .05, c: "#fff6c8" }], prop: "#c8a878", ring: "#ffffff", bb: "surf" },
  ice:     { sky: ["#3a5a80", "#8ab0d8", "#e8f4ff"], ground: ["#e8f2fa", "#9fb8d0"], grid: "#7f95b0", gridA: .2, mount: ["#c9d7e8", "#93a9c4"], fog: "#e8f4ff",
             bodies: [], prop: "#b8c8dc", ring: "#5a7a9a", snow: 1, bb: "snow" },
  tower:   { sky: ["#140a24", "#3a1a52", "#7a4a8a"], ground: ["#3a304a", "#16101e"], grid: "#a86ad8", gridA: .25, mount: null, fog: "#7a4a8a", spires: 1, stars: 1,
             bodies: [{ az: .5, el: .3, r: .05, c: "#f2e8ff" }], prop: "#2a2036", ring: "#c89aff", bb: "distortion" },
  volcano: { sky: ["#2a0a06", "#7a2a10", "#e07a3a"], ground: ["#4a2a20", "#1a0c08"], grid: "#ff6a1a", gridA: .22, mount: ["#3a1408", "#1e0a04"], fog: "#e07a3a", embers: 1,
             bodies: [{ az: -.4, el: .2, r: .06, c: "#ffb07a" }], prop: "#2a1410", ring: "#ff8a3a", bb: "rocky", time: "afternoon" },
  plant:   { sky: ["#1a1e2a", "#3a4258", "#8a92a8"], ground: ["#6a6a72", "#2a2a30"], grid: "#f2d02c", gridA: .3, mount: null, fog: "#8a92a8", indoor: 1,
             bodies: [], prop: "#4a4e5a", ring: "#f2d02c", bb: "factory" },
  safari:  { sky: ["#e08a3a", "#f2c87a", "#fff2c8"], ground: ["#c8b05a", "#7a6a2e"], grid: "#5a4a1a", gridA: .14, mount: ["#a88a4a", "#8a6a3a"], fog: "#fff2c8", trees: 1,
             bodies: [{ az: .3, el: .12, r: .06, c: "#fff2c8" }], prop: "#5a7a2a", ring: "#ffffff", bb: "field" },
  plateau: { sky: ["#0a0614", "#2a1a4a", "#6a3a8a"], ground: ["#2a2a3a", "#0e0c18"], grid: "#f2c14e", gridA: .3, mount: null, fog: "#6a3a8a", stars: 1, indoor: 1,
             bodies: [{ az: .45, el: .3, r: .08, c: "#f2c14e", planet: 1 }], prop: "#2e2648", ring: "#f2c14e", bb: "cynthia" },
  lab:     { sky: ["#b8c8d8", "#dce6ee", "#f4f8fb"], ground: ["#e8e0d0", "#b8ae9a"], grid: "#a89a80", gridA: .25, mount: null, fog: "#f4f8fb", indoor: 1,
             bodies: [], prop: "#c8d4e0", ring: "#3b7dd8", bb: "indoor2" },
  dusk:    { sky: ["#2a1a4a", "#c8604a", "#ffc88a"], ground: ["#6a8a4a", "#2a3a1e"], grid: "#2a2018", gridA: .16, mount: ["#4a3a5a", "#2a2238"], fog: "#ffc88a", trees: 1,
             bodies: [{ az: .2, el: .08, r: .06, c: "#ffd8a0" }], prop: "#3a3a2a", ring: "#ffffff", bb: "field", time: "afternoon" },
};
// Battle scenes: Pokémon Platinum's backgrounds and platforms (Sunday-Domeko's rips, cut by tools/pack_battlebg.py), which go
// together. ENVS[..].bb names the scene; BB_SCENE gives its background and platform; the Elite Four, the Champion, the Battle
// Tower and the Stadium have rooms of their own. The outdoor ones come in day, afternoon (17-20) and night (20-4) light, by your
// clock. The background goes behind the 3D field with its horizon row on the horizon (a tall strip: the picture, then its last
// rows carried down), and its platform goes under every Pokémon.
const BB_SCENE = { field: ["field", "grass"], forest: ["forest", "grass"], city: ["city", "path"], surf: ["surf", "water"], rocky: ["rocky", "rocky"], snow: ["snow", "snow"],
  indoor1: ["indoor1", "indoor"], indoor2: ["indoor2", "indoor"], indoor3: ["indoor3", "indoor"], cave1: ["cave1", "cave"], cave2: ["cave2", "ice"], cave3: ["cave3", "cave"],
  aaron: ["aaron", "aaron"], bertha: ["bertha", "bertha"], flint: ["flint", "flint"], lucian: ["lucian", "lucian"], cynthia: ["cynthia", "cynthia"], distortion: ["distortion", "distortion"],
  tower: ["tower", "tower"], factory: ["factory", "factory"], arcade: ["arcade", "arcade"], castle: ["castle", "castle"], hall: ["hall", "hall"] };
const BB_E4 = { lorelei: "hall", bruno: "bertha", agatha: "lucian", lance: "flint", bluechampion: "cynthia" };
// stages with a scene of their own (by title)
const BB_STAGE = [[/S\.S\. Anne/, "indoor1"], [/Seafoam/, "cave2"], [/Rock Tunnel|Cerulean Cave|Mewtwo/, "cave3"], [/Pokémon Mansion/, "indoor3"]];
const timeOfDay = () => { const h = new Date().getHours(); return h >= 20 || h < 4 ? "night" : h >= 17 ? "afternoon" : "day"; };
const BB = {};
function bbScene(k, time) {
  const sc = BB_SCENE[k]; if (!sc || !RES_DATA.bb) return null;
  const at = (n, end = "") => RES_DATA.bb[`${n}_${time}${end}`] || RES_DATA.bb[n + end] || RES_DATA.bb[`${n}_day${end}`];
  const bg = at(sc[0]), pf = at(sc[1], "_pf"); if (!bg) return null;
  const id = k + ":" + time; if (BB[id]) return BB[id];
  const s = BB[id] = { strip: null, top: "#fff", hz: (RES_DATA.bbHz || {})[sc[0]] || 52, pf: new Image() };
  const im = new Image();
  im.onload = () => {
    const w = im.naturalWidth, h = im.naturalHeight, c = document.createElement("canvas"); c.width = w; c.height = 720;
    const x = c.getContext("2d"); x.drawImage(im, 0, 0);
    for (let y = h; y < 720; y += 4) x.drawImage(im, 0, h - 4, w, 4, 0, y, w, 4);
    const d = x.getImageData(0, 0, 1, 1).data; s.top = `rgb(${d[0]},${d[1]},${d[2]})`; s.strip = c;
  };
  im.src = resPng(bg); if (pf) s.pf.src = resPng(pf);
  return s;
}
const bbOn = () => { const s = bbScene(BT.env && BT.env.bb, BT.env && BT.env.time); return s && s.strip ? s : null; };
function drawPlatform(K, vu) {
  const s = bbOn(); if (!s || !s.pf.naturalWidth || vu.gone || (vu.spawnT != null && BT.clock < vu.spawnT)) return;
  // it comes out with the Pokémon (growing as it appears) and goes when the Pokémon is recalled or has fainted
  const grow = vu.spawnT != null ? ease(clamp((BT.clock - vu.spawnT) / 360, 0, 1)) : 1;
  const fade = vu.recallT != null ? 1 - clamp((BT.clock - vu.recallT) / 420, 0, 1) : vu.dead ? 1 - clamp((BT.clock - vu.deathT) / 900, 0, 1) : 1;
  if (fade <= 0) return;
  const h = vu.home || vu.pos, r = 46 * vu.bs * (.4 + .6 * grow);
  // The platform lies on the ground, on the same circle as the Pokémon's shadow and rings, so they line up from any camera
  // angle. Its picture is a flattened circle (the bottom quarter-width rows, 32 of 128) with grass or rocks standing up out of
  // the far half: across maps to the camera's right, up to the far side.
  const ru = Math.hypot(K.r[0], K.r[2]) || 1, fu = Math.hypot(K.f[0], K.f[2]) || 1;
  const c = proj(K, h.x, 0, h.z), a = proj(K, h.x + K.r[0] / ru * r, 0, h.z + K.r[2] / ru * r), b = proj(K, h.x + K.f[0] / fu * r, 0, h.z + K.f[2] / fu * r);
  if (!c || !a || !b) return;
  const pw = s.pf.naturalWidth, ph = s.pf.naturalHeight, eh = pw / 4, g = BT.g;
  g.save(); g.globalAlpha = grow * fade; g.transform(a[0] - c[0], a[1] - c[1], c[0] - b[0], c[1] - b[1], c[0], c[1]); g.imageSmoothingEnabled = false;
  g.drawImage(s.pf, -1, 1 - 2 * ph / eh, 2, 2 * ph / eh); g.restore();
}

// ---------- the trainers ----------
// Each trainer stands back from their team, smaller than the Pokémon and a little faded, so they're part of the scene and
// never the focus: the opponent behind their team facing you, you at the near edge of the picture seen from behind (Red and
// Leaf's FireRed/LeafGreen battle backs; a look without one, its overworld sprite walking away).
// BT.tr[side] = { img, fw, fh, n (frames), h (height in the world), x, z, throwT }
function trainerSetup(cfg) {
  const tr = {};
  if (cfg.trainerSpr && !cfg.wild) tr.E = { img: Object.assign(new Image(), { src: trainerURL(cfg.trainerSpr) }), n: 1, h: 120, far: 1 };
  const look = avatar(), bk = RES_DATA.back && RES_DATA.back[look] && RES_DATA.backMeta[look];
  if (bk) tr.A = { img: Object.assign(new Image(), { src: resPng(RES_DATA.back[look]) }), fw: bk.w, fh: bk.h, n: bk.n, h: 120, back: 1 };
  else if (typeof HOME !== "undefined" && HOME) {
    const k = homeLook(), m = HOME.meta.players[k];
    if (m) tr.A = { img: homeImg("pl", k), fw: m.fw, fh: m.fh, n: 1, row: 1, h: 120 };   // the row walking away, standing frame
  }
  BT.tr = tr; placeTrainers();
}
// where they stand, by the battle camera's direction (so fitHome can keep them in the picture): the opponent straight back
// behind their team, you beside yours at the left of the picture, so neither stands in front of a Pokémon
function trainerSpots(c) {
  const K = camBasis(c), fl = Math.hypot(K.f[0], K.f[2]) || 1, rl = Math.hypot(K.r[0], K.r[2]) || 1;
  const at = (team, back, side) => {
    const d = team === "A" ? -1 : 1, x = d * avgN(SLOTS.map(s => s[0])), z = avgN(SLOTS.map(s => s[1]));
    return { x: x + K.f[0] / fl * back + K.r[0] / rl * side, z: z + K.f[2] / fl * back + K.r[2] / rl * side };
  };
  return { E: at("E", 420, 20), A: at("A", -90, -125), rx: K.r[0] / rl, rz: K.r[2] / rl };
}
function placeTrainers() {
  if (!BT.tr || !BT.home) return;
  const p = trainerSpots(BT.home);
  for (const s of ["A", "E"]) if (BT.tr[s]) Object.assign(BT.tr[s], p[s]);
}
// the trainer's frames on their own canvas, a back picture's lower edge faded out (it's cut off at the waist: on the Game Boy
// Advance it sits on the text box)
function trainerFrames(t) {
  if (t.cv || !t.img || !t.img.naturalWidth) return t.cv;
  const fw = t.fw || t.img.naturalWidth, fh = t.fh || t.img.naturalHeight, n = t.n || 1, c = document.createElement("canvas");
  c.width = fw * n; c.height = fh;
  const x = c.getContext("2d"); x.drawImage(t.img, 0, (t.row || 0) * fh, fw * n, fh, 0, 0, fw * n, fh);
  if (t.back) {
    x.globalCompositeOperation = "destination-out";
    const gr = x.createLinearGradient(0, fh * .62, 0, fh); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,1)");
    x.fillStyle = gr; x.fillRect(0, fh * .62, fw * n, fh * .38 + 1);
  } else {
    // trainer pictures leave empty rows under the feet: measure them, so the feet stand on the shadow
    const d = x.getImageData(0, 0, fw, fh).data; let y = fh - 1;
    while (y > 0 && ![...Array(fw).keys()].some(i => d[(y * fw + i) * 4 + 3] > 40)) y--;
    t.pad = fh - 1 - y;
  }
  return t.cv = c;
}
function drawTrainer(K, t) {
  const im = trainerFrames(t); if (!im) return;
  const q = proj(K, t.x, 0, t.z); if (!q) return;
  const fw = t.fw || t.img.naturalWidth, fh = t.fh || t.img.naturalHeight, pad = t.pad || 0, sc = t.h / (fh - pad) * q[2];
  // throwing: the four throw frames once (Red and Leaf), then standing again
  const k = t.throwT != null ? (BT.clock - t.throwT) / 90 : 99, f = t.n > 1 && k < t.n - 1 ? 1 + Math.floor(k) : 0;
  const g = BT.g;
  if (!t.back) groundEllipse(K, t.x, t.z, 34, "rgba(0,0,0,.16)", true);
  // the opponent stands far back: a touch of haze sells the distance
  g.save(); g.globalAlpha = t.far ? .82 : .88; g.imageSmoothingEnabled = false; if (t.far) g.filter = "saturate(.75) brightness(1.06)";
  g.translate(q[0], q[1]); g.scale(sc, sc);
  g.drawImage(im, f * fw, 0, fw, fh, -fw / 2, -fh + pad, fw, fh);
  g.restore();
}
function buildEnv(name) {
  const E = { time: timeOfDay(), ...(ENVS[name] || ENVS.route), name };
  const rng = seeded(hash(name + "env"));
  E.mtn = [];
  for (let k = 0; k <= 64; k++) E.mtn.push(.01 + rng() * .022 + Math.pow(Math.sin(k * .37 + rng()), 4) * .05);
  E.mtn2 = [];
  for (let k = 0; k <= 64; k++) E.mtn2.push(.004 + rng() * .012 + Math.pow(Math.sin(k * .21 + 2), 2) * .018);
  E.starsArr = [];
  for (let k = 0; k < 90; k++) E.starsArr.push([rng() * 3 - 1.5, rng() * .7, rng() * 1.2 + .3]);
  E.bld = [];
  for (let k = 0; k < 80; k++) E.bld.push({ w: .5 + rng() * .9, h: (E.low ? .02 : .05) + rng() * (E.low ? .04 : .16), win: rng() });
  E.props = [];
  for (let k = 0; k < 9; k++) {
    const x = (rng() * 2 - 1) * 820, z = 330 + rng() * 520, w = 30 + rng() * 70, h = E.indoor ? 20 + rng() * 50 : name === "city" ? 60 + rng() * 120 : 20 + rng() * 70;
    E.props.push({ x, z, w, d: w * (.6 + rng() * .6), h: E.spires ? h * 2.2 : E.trees ? h * 2.5 : h, tree: !!E.trees });
  }
  for (let k = 0; k < 4; k++) E.props.push({ x: (k < 2 ? -1 : 1) * (560 + rng() * 260), z: -120 + rng() * 300, w: 40 + rng() * 40, d: 40, h: 20 + rng() * 40, tree: !!E.trees });
  return E;
}

// ---------- scene drawing ----------
function drawSky(K) {
  const { g, W, H } = BT, E = BT.env, c = K.c;
  const hy = H / 2 - Math.tan(c.pitch) * K.focal;
  const bb = bbOn();
  if (bb) {
    const bw = bb.strip.width, s = Math.max(1, W / bw);
    g.save(); g.imageSmoothingEnabled = false;
    g.fillStyle = bb.top; g.fillRect(-W, -H, W * 3, hy - bb.hz * s + H);
    g.drawImage(bb.strip, 0, 0, bw, 720, -W, hy - bb.hz * s, W * 3, 720 * s);
    g.restore();
    return hy;
  }
  const sg = g.createLinearGradient(0, Math.min(hy - H * .9, -10), 0, hy);
  sg.addColorStop(0, E.sky[0]); sg.addColorStop(.6, E.sky[1]); sg.addColorStop(1, E.sky[2]);
  g.fillStyle = sg; g.fillRect(-W, -H, W * 3, hy + H + 2);
  const az2x = az => { const a = az + c.yaw; return Math.abs(a) > 1.35 ? null : W / 2 + Math.tan(a) * K.focal; };
  const el2y = el => hy - Math.tan(el) * K.focal;
  if (E.stars) for (const [az, el, r] of E.starsArr) { const x = az2x(az); if (x == null) continue; g.fillStyle = `rgba(255,255,255,${.3 + .5 * Math.abs(Math.sin(az * 99 + BT.clock / 900))})`; g.fillRect(x, el2y(el), r, r); }
  for (const b of E.bodies) {
    const x = az2x(b.az); if (x == null) continue;
    const y = el2y(b.el), r = b.r * K.focal;
    if (b.planet) {
      const pg = g.createRadialGradient(x - r * .4, y - r * .4, r * .1, x, y, r);
      pg.addColorStop(0, shade(b.c, .35)); pg.addColorStop(.7, b.c); pg.addColorStop(1, shade(b.c, -.6));
      g.fillStyle = pg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    } else {
      const gl = g.createRadialGradient(x, y, 0, x, y, r * 3.2);
      gl.addColorStop(0, b.c); gl.addColorStop(.3, b.c + "88"); gl.addColorStop(1, b.c + "00");
      g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 3.2, 0, 7); g.fill();
      circ(g, x, y, r, "#fffdf4");
      if (b.ring) { g.strokeStyle = "#ffffff55"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r * 1.9, r * .45, -.3, 0, 7); g.stroke(); }
    }
  }
  if (E.clouds) {
    g.fillStyle = "#ffffff55";
    for (let k = 0; k < 7; k++) { const x = az2x(-1.1 + k * .36 + Math.sin(BT.clock / 9000 + k) * .03); if (x == null) continue; const y = el2y(.06 + (k % 3) * .05); g.beginPath(); g.ellipse(x, y, K.focal * .12, K.focal * .025, 0, 0, 7); g.fill(); }
  }
  const ridge = (arr, col, scale) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(-W, hy + 2);
    for (let k = 0; k <= 64; k++) { const az = -1.6 + k * .05; const x = az2x(az); if (x == null) continue; g.lineTo(x, el2y(arr[k] * scale)); }
    g.lineTo(W * 2, hy + 2); g.closePath(); g.fill();
  };
  if (E.mount) { ridge(E.mtn, E.mount[0], 1); }
  if (E.city) {
    for (let k = 0; k < E.bld.length; k++) {
      const b = E.bld[k], x = az2x(-1.7 + k * .043); if (x == null) continue;
      const w = K.focal * .036 * b.w, h = K.focal * b.h, y = hy - h;
      g.fillStyle = E.city; g.fillRect(x, y, w, h + 2);
      if (b.win > .25) { g.fillStyle = E.lit; g.globalAlpha = .55; for (let wy = y + 4; wy < hy - 3; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 5) if (((wx * 7 + wy * 13 + k) % 5) < 2) g.fillRect(wx, wy, 1.6, 2); g.globalAlpha = 1; }
    }
  }
  if (E.mount) ridge(E.mtn2, E.mount[1], 1);
  if (E.spires) {
    g.fillStyle = E.mount ? E.mount[1] : shade(E.sky[0], .2);   // the Pokémon Tower backdrop has spires but no mountains
    for (let k = 0; k < 5; k++) { const x = az2x(-.8 + k * .4); if (x == null) continue; const w = K.focal * .025, h = K.focal * (.18 + (k % 2) * .08); g.beginPath(); g.moveTo(x - w, hy); g.lineTo(x - w * .6, hy - h); g.lineTo(x, hy - h - w * 2); g.lineTo(x + w * .6, hy - h); g.lineTo(x + w, hy); g.fill(); }
  }
  // ground base
  const gg = g.createLinearGradient(0, hy, 0, H);
  gg.addColorStop(0, E.fog); gg.addColorStop(.06, E.ground[0]); gg.addColorStop(1, E.ground[1]);
  g.fillStyle = gg; g.fillRect(-W, hy, W * 3, H * 2);
  return hy;
}
function seg3(K, a, b, col, w, alpha) {
  let pa = proj(K, ...a), pb = proj(K, ...b);
  if (!pa && !pb) return;
  if (!pa || !pb) {
    // clip to near plane by bisection
    let lo = 0, hi = 1, inA = !!pa;
    for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2, p = proj(K, ...v3.lerp(a, b, m)); if (!!p === inA) lo = m; else hi = m; }
    const m = inA ? lo : hi, p = proj(K, ...v3.lerp(a, b, m));
    if (!p) return;
    if (inA) pb = p; else pa = p;
  }
  const g = BT.g; g.globalAlpha = alpha; g.strokeStyle = col; g.lineWidth = w;
  g.beginPath(); g.moveTo(pa[0], pa[1]); g.lineTo(pb[0], pb[1]); g.stroke(); g.globalAlpha = 1;
}
function drawGround(K) {
  const E = BT.env, g = BT.g;
  if (bbOn()) return;   // a Platinum floor: no grid, rings or sea
  for (let x = -900; x <= 900; x += 90) seg3(K, [x, 0, -700], [x, 0, 900], E.grid, 1, E.gridA);
  for (let z = -700; z <= 900; z += 90) seg3(K, [-900, 0, z], [900, 0, z], E.grid, 1, E.gridA * (z > 400 ? .6 : 1));
  // battle circle
  for (const [r, w, a] of [[420, 2, .55], [440, 1, .35], [90, 1.5, .3]]) {
    g.strokeStyle = E.ring; g.lineWidth = w; g.globalAlpha = a; g.beginPath(); let started = false;
    for (let k = 0; k <= 64; k++) {
      const an = k / 64 * Math.PI * 2, p = proj(K, Math.cos(an) * r, 0, Math.sin(an) * r * .62);
      if (!p) { started = false; continue; }
      if (!started) { g.moveTo(p[0], p[1]); started = true; } else g.lineTo(p[0], p[1]);
    }
    g.stroke(); g.globalAlpha = 1;
  }
  if (E.water) {
    const near = proj(K, 0, 0, 900), far = proj(K, 0, 0, 2400);
    if (near && far) { const wg = g.createLinearGradient(0, far[1], 0, near[1]); wg.addColorStop(0, shade(E.water, .3)); wg.addColorStop(1, E.water); g.fillStyle = wg; g.fillRect(-BT.W, far[1] - 2, BT.W * 3, near[1] - far[1] + 2); }
  }
  if (E.embers) {
    g.strokeStyle = "#ff6a1a"; g.globalAlpha = .35 + .15 * Math.sin(BT.clock / 400);
    for (let k = 0; k < 6; k++) seg3(K, [-700 + k * 260, 0, 200 + (k % 3) * 120], [-560 + k * 260, 0, 260 + (k % 2) * 140], "#ff6a1a", 2, .5);
    g.globalAlpha = 1;
  }
}
function drawProp(K, p) {
  const E = BT.env, g = BT.g;
  if (p.tree) {
    const b = proj(K, p.x, 0, p.z), t = proj(K, p.x, p.h, p.z); if (!b || !t) return;
    const w = p.w * .25 * b[2];
    g.fillStyle = shade(E.prop, -.2); g.fillRect(b[0] - w / 2, t[1], w, b[1] - t[1]);
    g.fillStyle = shade(E.mount ? E.mount[0] : "#224422", .05);
    g.beginPath(); g.ellipse(t[0], t[1], p.w * .9 * t[2], p.w * .6 * t[2], 0, 0, 7); g.fill();
    return;
  }
  const { x, z, w, d, h } = p, x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
  const faces = [
    { pts: [[x0, 0, z0], [x1, 0, z0], [x1, h, z0], [x0, h, z0]], n: [0, 0, -1], s: 0 },
    { pts: [[x1, 0, z0], [x1, 0, z1], [x1, h, z1], [x1, h, z0]], n: [1, 0, 0], s: -.2 },
    { pts: [[x0, 0, z1], [x0, 0, z0], [x0, h, z0], [x0, h, z1]], n: [-1, 0, 0], s: -.3 },
    { pts: [[x1, 0, z1], [x0, 0, z1], [x0, h, z1], [x1, h, z1]], n: [0, 0, 1], s: -.35 },
    { pts: [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], n: [0, 1, 0], s: .2 },
  ];
  for (const fc of faces) {
    const c = fc.pts[0], tc = v3.sub(K.pos, c);
    if (tc[0] * fc.n[0] + tc[1] * fc.n[1] + tc[2] * fc.n[2] <= 0) continue;
    const ps = fc.pts.map(q => proj(K, ...q)); if (ps.some(q => !q)) continue;
    g.fillStyle = shade(E.prop, fc.s); g.beginPath(); ps.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill();
    if (BT.env.indoor) { g.strokeStyle = BT.env.grid + "55"; g.lineWidth = 1; g.stroke(); }
  }
}
function groundEllipse(K, x, z, r, style, fill, lw = 2, rot = 0, dash) {
  const g = BT.g;
  if (fill) {
    const c = proj(K, x, 0, z), a = proj(K, x + r, 0, z), b = proj(K, x, 0, z + r);
    if (!c || !a || !b) return;
    g.save(); g.transform(a[0] - c[0], a[1] - c[1], b[0] - c[0], b[1] - c[1], c[0], c[1]);
    g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fillStyle = style; g.fill(); g.restore();
    return;
  }
  g.save(); g.strokeStyle = style; g.lineWidth = lw;
  if (dash) { g.setLineDash(dash); g.lineDashOffset = -rot * 40; }
  g.beginPath(); let on = false;
  for (let k = 0; k <= 40; k++) {
    const an = k / 40 * Math.PI * 2 + rot, p = proj(K, x + Math.cos(an) * r, 0, z + Math.sin(an) * r);
    if (!p) { on = false; continue; }
    if (on) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]);
    on = true;
  }
  g.stroke(); g.restore();
}
function applyCamXform() {
  const g = BT.g;
  g.translate(BT.W / 2 + BT.shx, BT.H / 2 + BT.shy);
  g.rotate(BT.cam.roll || 0);
  g.translate(-BT.W / 2, -BT.H / 2);
}

// ---------- units ----------
function billboard(vu, lp) {
  const K = BT.K, bs = vu.bs * ((vu.u && vu.u.size) || 1);   // (a bigger Pokémon's points scale with it: its HP bar, where moves land)
  const lx = lp[0] * bs, ly = -lp[1] * bs;
  return [vu.pos.x + K.r[0] * lx + K.u[0] * ly, vu.y + K.r[1] * lx + K.u[1] * ly, vu.pos.z + K.r[2] * lx + K.u[2] * ly];
}
const chestW = vu => billboard(vu, (vu.out && vu.out.chest) || [0, -60]);
const headW = vu => billboard(vu, (vu.out && vu.out.head) || [0, -92]);
const tipW = (vu, key = "tip") => billboard(vu, (vu.out && (vu.out[key] || vu.out.tip)) || [20, -60]);

function drawUnitShadow(K, vu) {
  if (vu.gone || (vu.spawnT != null && BT.clock < vu.spawnT)) return;   // still in its Poké Ball
  if (vu.semi && !vu.dead) return;
  const grow = (vu.spawnT != null ? ease(clamp((BT.clock - vu.spawnT) / 520, 0, 1)) : 1) * (vu.recallT != null ? 1 - clamp((BT.clock - vu.recallT) / 420, 0, 1) : 1);
  const a = (vu.dead ? .25 * (1 - clamp((BT.clock - vu.deathT) / 900, 0, 1)) : .38) * (bbOn() ? .55 : 1) * grow;   // lighter on the platforms
  const wide = clamp(((vu.out && vu.out.w) || 50) / 50, .6, 2.2);
  groundEllipse(K, vu.pos.x, vu.pos.z, 24 * vu.bs * wide * (.3 + .7 * grow), `rgba(0,0,0,${a})`, true);
}
const avgN = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
function drawUnit(K, vu) {
  const g = BT.g;
  const P = vu.ps, o = P ? P.off : [0, 0, 0];
  const q = proj(K, vu.pos.x + o[0], vu.y + o[1], vu.pos.z + o[2]);
  if (!q) { vu.scr = null; return; }
  const [sx, sy, s] = q, sc = s * vu.bs;
  vu.scr = { x: sx, y: sy, s: sc };
  if (vu.gone || (vu.spawnT != null && BT.clock < vu.spawnT)) return;
  if (vu.semi && !vu.dead) return;   // out of reach (Fly, Dig...): out of sight too, its HP bar stays   // still in its Poké Ball: nothing shows until it opens
  let alpha = 1, rot = 0;
  let sink = 0, white = 0, scl = 1;
  if (vu.spawnT != null) { const k = clamp((BT.clock - vu.spawnT) / 520, 0, 1); white = 1 - k; scl = .3 + .7 * ease(k); if (k >= 1) vu.spawnT = null; }
  if (vu.recallT != null) { const k = clamp((BT.clock - vu.recallT) / 420, 0, 1); white = Math.min(1, k * 2); scl = 1 - .85 * ease(k); alpha = 1 - k * .5; if (k >= 1) vu.gone = true; }
  if (vu.dead) { const k = clamp((BT.clock - vu.deathT) / 700, 0, 1); sink = ease(k); alpha = 1 - k * .6; if (k >= 1) vu.gone = true; }
  if (vu.flash > BT.clock && Math.floor((vu.flash - BT.clock) / 55) % 2) alpha *= .25;   // (hit: it flickers)
  const pose = vu.pose;
  const pt = pose.dur ? clamp((BT.clock - pose.t0) / pose.dur, 0, 1) : (BT.clock - pose.t0) / 1000;
  if (pose.dur && pt >= 1 && pose.back) { vu.pose = { name: "idle", t0: BT.clock, dur: 0 }; }
  // back sprite when the camera looks the way the Pokémon faces; turned towards the other side on screen
  const facing = vu.team === "A" ? 1 : -1, dot = K.f[0] * facing;
  if (dot > .06) vu.back = true; else if (dot < -.06) vu.back = false;
  const foes = [...BT.vus.values()].filter(v => v.team !== vu.team && !v.gone && v.scr);
  const fx = foes.length ? avgN(foes.map(v => v.scr.x)) : sx + facing * 100;
  if (Math.abs(fx - sx) > 6) vu.want = fx > sx ? 1 : -1; else if (!vu.want) vu.want = facing;
  // the sprite's own animation runs in real time: still while asleep, frozen or fainting, half speed when paralyzed
  const now = performance.now(), rate = vu.dead || vu.st === "SLP" || vu.st === "FRZ" ? 0 : vu.st === "PAR" ? .5 : 1;
  vu.at = (vu.at == null ? vu.ph * 1000 : vu.at) + Math.min(100, now - (vu.atNow || now)) * rate; vu.atNow = now;
  g.save(); g.globalAlpha = alpha * (P ? clamp(P.op, 0, 1) : 1); g.translate(sx, sy);
  const big = vu.u.size || 1;   // (a Dynamax or Gigantamax Pokémon, a Totem: drawn bigger, buildUnit's size)
  g.scale(sc * scl * big * (P ? P.sx : 1), sc * scl * big * (P ? P.sy : 1));
  vu.out = drawMonSprite(g, vu.u.spr || vu.u.key, !!vu.back, vu.want, { name: pose.name, t: pt, time: BT.clock / 1000 }, vu.ph, { sink, white, at: vu.at });
  const stF = !vu.dead && PS_ST_FILTER[vu.st];
  if (stF && "filter" in g) { g.globalAlpha *= .5; g.filter = stF; drawMonSprite(g, vu.u.spr || vu.u.key, !!vu.back, vu.want, { name: pose.name, t: pt, time: BT.clock / 1000 }, vu.ph, { sink, white, at: vu.at }); g.filter = "none"; }
  g.restore();
}
// Black 2/White 2's HP bars over each Pokémon (resources/hud, tools/pack_hud.py): the opponent's in Black 2's dark frame, yours
// in White 2's light one; the name in their font with the Lv mark and level digits, the gauge green, yellow or red (the HP just
// lost fades out behind it), the status icon, and under the frame a thin turn meter in the EXP gauge's blue. Stat stages and
// other effects keep their small tags.
const HUD = { img: null };
function hud() {
  if (!HUD.img && RES_DATA.hud) { HUD.img = new Image(); HUD.img.src = resPng(RES_DATA.hud); HUD.m = RES_DATA.hudMeta; }
  return HUD.img && HUD.img.naturalWidth ? HUD : null;
}
const hudCh = ch => HUD.m.font[ch === "’" ? "'" : ch];
const hudTextW = (t, k) => [...t].reduce((a, ch) => a + (hudCh(ch) ? hudCh(ch)[2] - 1 : 3) * k, 0);
function hudText(g, t, x, y, k) {
  for (const ch of t) { const b = hudCh(ch); if (b) g.drawImage(HUD.img, b[0], b[1], b[2], b[3], x, y, b[2] * k, b[3] * k); x += (b ? b[2] - 1 : 3) * k; }
  return x;
}
const hudPiece = (g, b, x, y, w, h) => g.drawImage(HUD.img, b[0], b[1], b[2], b[3], x, y, w == null ? b[2] : w, h == null ? b[3] : h);
// the line the overhead bars stay below: the turn-order strip's bottom, in the canvas's own pixels (a Dynamax Pokémon's bar would
// otherwise slip under it); measured twice a second
function barTop() {
  const now = performance.now(); if (BT.barTopT && now - BT.barTopT < 500) return BT.barTop;
  const cv = BT.cv, st = $("#bStrip"); let t = 0;
  if (cv && st) { const r = cv.getBoundingClientRect(), b = st.getBoundingClientRect(); if (r.height && b.height) t = Math.max(0, (b.bottom - r.top) * cv.clientHeight / r.height); }
  BT.barTopT = now; BT.barTop = t; return t;
}
function drawOverhead(K, vu) {
  if (!vu.scr || vu.dead || vu.gone || vu.spawnT != null || vu.recallT != null) return;
  const H = hud(); if (!H) return drawOverheadPlain(K, vu);
  const g = BT.g, hp = proj(K, ...billboard(vu, (vu.out && vu.out.top) || [0, -100])); if (!hp) return;
  const M = H.m, side = vu.team === "E" ? "foe" : "ally", F = M.frame[side], k = clamp(70 * vu.scr.s * 1.2, 90, 112) / 104;   // (near the font's own size)
  // (pinned: a tall Pokémon's bar held under the turn-order strip, its name line still clear of it; its BOSS mark and tags go below)
  const fw = F[2] * k, fh = F[3] * k, x = hp[0] - fw / 2, y0 = hp[1] - 20, y = Math.max(barTop() + 12 * k, y0), pinned = y > y0;
  const m = vu.u.max, f = clamp(vu.hp / m.hp, 0, 1), [sx, sy, sw, sh] = M.frame.slot;
  g.save(); g.imageSmoothingEnabled = false;
  // the frame, its gauge emptied, the HP just lost, then the HP left
  hudPiece(g, F, x, y, fw, fh);
  const gx = x + sx * k, gy = y + sy * k, gw = sw * k, gh = sh * k;
  hudPiece(g, M.core.empty, gx, gy, gw, gh);
  const lag = clamp(vu.lag / m.hp, 0, 1);
  if (lag > f) { g.globalAlpha = .6; hudPiece(g, M.core.red, gx, gy, gw * lag, gh); g.globalAlpha = 1; }
  if (f > 0) hudPiece(g, M.core[f > .5 ? "green" : f > .2 ? "yellow" : "red"], gx, gy, gw * f, gh);
  if (vu.sh > 0) { g.fillStyle = "#c8ffd6"; g.fillRect(gx, gy, gw * clamp(vu.sh / m.hp, 0, 1), Math.max(1, k)); }
  // the turn meter, as a thin EXP gauge under it
  hudPiece(g, M.core.expEmpty, gx, y + fh + 1, gw, 2 * k); hudPiece(g, M.core.exp, gx, y + fh + 1, gw * clamp(vu.tm / 100, 0, 1), 2 * k);
  // above it: the status icon and the name on the left, the Lv mark and level on the right
  const ty = y - 10 * k, st = vu.st && M.status[vu.st];
  const lvT = String(vu.u.lvl), lvW = 8 * k + [...lvT].reduce((a, d) => a + M.lvDigits[+d][2] * k, 0);
  let nx = x + 2 * k;
  if (st) { hudPiece(g, st, nx, ty + 1.5 * k, st[2] * k, st[3] * k); nx += (st[2] + 2) * k; }
  const room = x + fw - 4 * k - lvW - nx;
  let name = vu.u.n;
  if (hudTextW(name, k) > room) { while (name.length > 1 && hudTextW(name + ".", k) > room) name = name.slice(0, -1); name += "."; }
  hudText(g, name, nx, ty, k);
  let lx = x + fw - 2 * k - lvW;
  hudPiece(g, M.lv[side], lx, ty + 2 * k, 8 * k, 7 * k); lx += 8 * k;
  for (const d of lvT) { const b = M.lvDigits[+d]; hudPiece(g, b, lx, ty, b[2] * k, b[3] * k); lx += b[2] * k; }
  g.restore();
  const by = pinned ? y + fh + 10 : ty - 4;
  if (vu.u.boss) { g.fillStyle = "#ff4b4b"; g.font = "900 9px Nunito, Arial, sans-serif"; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillText("BOSS", x, by); }
  overheadTags(vu, x, fw, pinned ? by + (vu.u.boss ? 9 : -2) : ty - (vu.u.boss ? 16 : 6), !!st, pinned ? 10 : -10);
}
// stat stages and other effects (and the status, when there's no icon for it) as small tags, rows going up
function overheadTags(vu, x, w, ty, stDone, dy = -10) {
  const g = BT.g, tags = [];
  if (vu.st && !stDone) tags.push([FX[vu.st].s, FX[vu.st].c]);
  for (const k in vu.stages || {}) if (vu.stages[k]) tags.push([STAGE_S[k] + (vu.stages[k] > 0 ? "+" : "") + vu.stages[k], vu.stages[k] > 0 ? "#2a8a4a" : "#b8302e"]);
  for (const [id] of vu.effs || []) if (FX[id] && !FX[id].major) tags.push([FX[id].s, FX[id].c]);
  g.font = "900 7px Nunito, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  let tx = x - 3;
  for (const [t, c] of tags.slice(0, 6)) {
    const tw = g.measureText(t).width + 6;
    if (tx + tw > x + w + 3) { tx = x - 3; ty += dy; }
    g.fillStyle = c; roundRect(g, tx, ty - 4.5, tw, 9, 2); g.fill(); g.fillStyle = "#fff"; g.fillText(t, tx + tw / 2, ty); tx += tw + 2;
  }
}
// (until the HUD picture has loaded)
function drawOverheadPlain(K, vu) {
  const g = BT.g, hp = proj(K, ...billboard(vu, (vu.out && vu.out.top) || [0, -100])); if (!hp) return;
  const w = clamp(70 * vu.scr.s * 1.2, 68, 96), x = hp[0] - w / 2, y = Math.max(barTop() + 4, hp[1] - 24);
  const m = vu.u.max, f = clamp(vu.hp / m.hp, 0, 1);
  g.fillStyle = "rgba(20,24,36,.78)"; roundRect(g, x - 3, y - 11, w + 6, 22, 4); g.fill();
  g.font = "800 9px Nunito, Arial, sans-serif"; g.textBaseline = "alphabetic"; g.textAlign = "left"; g.fillStyle = "#fff";
  g.fillText(vu.u.n, x, y - 2); g.textAlign = "right"; g.fillStyle = "#f2d86a"; g.fillText("Lv" + vu.u.lvl, x + w, y - 2);
  g.fillStyle = "#2a2f3c"; g.fillRect(x, y + 1, w, 5);
  g.fillStyle = f > .5 ? "#3ddc84" : f > .2 ? "#f2c14e" : "#ff5a4a"; g.fillRect(x, y + 1, w * f, 5);
  overheadTags(vu, x, w, y - 19, false);
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// ---------- fx ----------
function addParts(p, n, o) {
  for (let k = 0; k < n; k++) {
    const sp = o.speed || 120, a = R() * Math.PI * 2, b = (R() - .3) * Math.PI;
    BT.parts.push({ p: [p[0] + (R() - .5) * (o.spread || 0), p[1] + (R() - .5) * (o.spread || 0), p[2] + (R() - .5) * (o.spread || 0)],
      v: [Math.cos(a) * Math.cos(b) * sp * R() + (o.vx || 0), Math.sin(b) * sp * R() + (o.vy || 0), Math.sin(a) * Math.cos(b) * sp * R()],
      g: o.g ?? 260, t0: BT.clock, life: (o.life || 500) * (.6 + R() * .6), size: o.size || 3, col: o.col || "#fff", add: o.add !== false, drag: o.drag || 0 });
  }
}
function drawParts(K, dt) {
  const g = BT.g, sdt = dt / 1000;
  BT.parts = BT.parts.filter(q => BT.clock - q.t0 < q.life);
  for (const q of BT.parts) {
    q.v[1] -= q.g * sdt; if (q.drag) { q.v[0] *= 1 - q.drag * sdt; q.v[1] *= 1 - q.drag * sdt; q.v[2] *= 1 - q.drag * sdt; }
    q.p[0] += q.v[0] * sdt; q.p[1] += q.v[1] * sdt; q.p[2] += q.v[2] * sdt;
    if (q.p[1] < 0) { q.p[1] = 0; q.v[1] *= -.3; }
    const s = proj(K, ...q.p); if (!s) continue;
    const k = 1 - (BT.clock - q.t0) / q.life;
    g.globalCompositeOperation = q.add ? "lighter" : "source-over";
    g.globalAlpha = Math.min(1, k * 1.6); g.fillStyle = q.col;
    const r = Math.max(.6, q.size * s[2] * (q.add ? .9 + k * .4 : 1));
    g.beginPath(); g.arc(s[0], s[1], r, 0, 7); g.fill();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
}
function drawBolts(K) {
  const g = BT.g;
  for (const b of BT.bolts) {
    const k = clamp((BT.clock - b.t0) / b.dur, 0, 1);
    const head = v3.lerp(b.from, b.to, k), tail = v3.lerp(b.from, b.to, Math.max(0, k - b.len));
    const ph = proj(K, ...head), pt = proj(K, ...tail); if (!ph || !pt) continue;
    g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    const bw = b.w || 1;
    g.strokeStyle = b.col + "66"; g.lineWidth = (9 * ph[2] + 2) * bw; g.beginPath(); g.moveTo(pt[0], pt[1]); g.lineTo(ph[0], ph[1]); g.stroke();
    g.strokeStyle = b.col; g.lineWidth = (4 * ph[2] + 1) * bw; g.stroke();
    g.strokeStyle = "#fff"; g.lineWidth = (1.6 * ph[2] + .5) * bw; g.stroke();
    g.restore();
  }
  BT.bolts = BT.bolts.filter(b => BT.clock - b.t0 < b.dur);
}
function drawRings(K) {
  BT.rings = BT.rings.filter(r => BT.clock - r.t0 < r.dur);
  for (const r of BT.rings) {
    const k = clamp((BT.clock - r.t0) / r.dur, 0, 1);
    BT.g.globalAlpha = 1 - k;
    groundEllipse(K, r.x, r.z, lerp(r.r0, r.r1, ease(k)), r.col, false, r.w || 3);
    BT.g.globalAlpha = 1;
  }
}
function drawFloats(K) {
  const g = BT.g;
  BT.floats = BT.floats.filter(f => BT.clock - f.t0 < f.dur);
  g.textAlign = "center"; g.textBaseline = "middle";
  for (const f of BT.floats) {
    const vu = BT.vus.get(f.uid); if (!vu) continue;
    const hp = proj(K, ...headW(vu)); if (!hp) continue;
    const k = (BT.clock - f.t0) / f.dur;
    const y = hp[1] - 40 - k * 46 - f.row * 15, x = hp[0] + f.dx;
    const big = f.cls === "crit" ? 27 : f.cls === "dmg" || f.cls === "prot" || f.cls === "heal" || f.cls === "dot" ? 21 : 13;
    const pop = k < .12 ? 1.35 - k * 2.9 : 1;
    g.globalAlpha = k > .75 ? (1 - k) / .25 : 1;
    g.font = `900 ${Math.round(big * pop)}px Nunito, "Arial Rounded MT Bold", Arial, sans-serif`;
    g.lineWidth = 4; g.strokeStyle = "rgba(0,0,0,.85)"; g.strokeText(f.s, x, y);
    g.fillStyle = { crit: "#ffd34d", dmg: "#ff6b6b", prot: "#eef2fa", heal: "#5dfc9b", dot: "#d68bff", buff: "#57e08f", debuff: "#ff8a8a", txt: "#cfe3ff" }[f.cls] || "#fff";
    g.fillText(f.s, x, y);
  }
  g.globalAlpha = 1;
}
function floatText(uid, s, cls) {
  const recent = BT.floats.filter(f => f.uid === uid && BT.clock - f.t0 < 650).length;
  BT.floats.push({ uid, s, cls, t0: BT.clock, dur: cls === "crit" ? 1300 : 1100, row: recent * 1.25, dx: (recent % 2 ? 1 : -1) * Math.min(recent, 3) * 10 });
}

// ---------- frame ----------
function frame(now) {
  if (!BT.on) return;
  BT.raf = requestAnimationFrame(frame);
  const rdt = Math.min(50, now - (BT.last || now)); BT.last = now;
  const dt = BT.paused ? 0 : rdt * BT.speed;
  BT.clock += dt;
  // tweens + waits
  for (const tw of BT.tweens.slice()) { const k = clamp((BT.clock - tw.t0) / tw.dur, 0, 1); tw.fn(tw.ease ? ease(k) : k); if (k >= 1) { BT.tweens.splice(BT.tweens.indexOf(tw), 1); tw.res(); } }
  for (const w of BT.waits.slice()) if (BT.clock >= w.until) { BT.waits.splice(BT.waits.indexOf(w), 1); w.res(); }
  // camera
  const c = BT.cam, t = BT.camT;
  if (BT.orbit) { t.yaw += dt * .00028; }
  const kk = 1 - Math.exp(-dt / 1000 * BT.camK);
  for (const key of ["tx", "ty", "tz", "dist", "fov", "roll", "pitch", "yaw"]) c[key] += (t[key] - c[key]) * kk;
  BT.shake *= Math.exp(-dt / 1000 * 7); if (BT.shake < .3) BT.shake = 0;
  BT.shx = (R() - .5) * BT.shake; BT.shy = (R() - .5) * BT.shake;
  // bars ease
  for (const vu of BT.vus.values()) { vu.lag += (vu.hp - vu.lag) * (1 - Math.exp(-dt / 350)); vu.tm += (vu.tmT - vu.tm) * (1 - Math.exp(-dt / 120)); }
  render(dt);
}
function render(dt) {
  const { g, W, H, dpr } = BT;
  const K = BT.K = camBasis(BT.cam);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  g.save(); applyCamXform();
  drawSky(K);
  drawGround(K);
  psDrawTerrain();   // (a terrain, or Trick Room, takes the background's place: Showdown's layer)
  const vus = [...BT.vus.values()];
  if (bbOn()) for (const vu of vus) drawPlatform(K, vu);   // the platforms
  else {
    const props = BT.env.props.map(p => ({ p, d: proj(K, p.x, p.h / 2, p.z) })).filter(o => o.d).sort((a, b) => b.d[3] - a.d[3]);
    for (const o of props) drawProp(K, o.p);
    // haze over the far field
    const hy = H / 2 - Math.tan(BT.cam.pitch) * K.focal;
    const hz = g.createLinearGradient(0, hy - 2, 0, hy + H * .18); hz.addColorStop(0, BT.env.fog + "aa"); hz.addColorStop(1, BT.env.fog + "00");
    g.fillStyle = hz; g.fillRect(-W, hy - 2, W * 3, H * .18 + 2);
  }
  psDrawWeather();   // (Showdown's weather layer over the battlefield)
  // ground decals
  for (const vu of vus) drawUnitShadow(K, vu);
  for (const vu of vus) if (!vu.dead && vu.spawnT == null) groundEllipse(K, vu.pos.x, vu.pos.z, 30 * vu.bs, vu.team === "A" ? "#5fd4ff55" : "#ff6a5a55", false, 1.6);
  if (BT.active && !BT.active.dead) groundEllipse(K, BT.active.home.x, BT.active.home.z, 34 * BT.active.bs, "#f2c14e", false, 3, BT.clock / 600);
  if (BT.picking && BT.B && BT.B.waiting) for (const u of BT.B.targetable(BT.B.waiting)) { const vu = BT.vus.get(u.uid); if (vu && vu !== BT.target) groundEllipse(K, vu.pos.x, vu.pos.z, 30 * vu.bs, "rgba(255,90,90,.45)", false, 1.5); }
  if (BT.target && !BT.target.dead && BT.picking) groundEllipse(K, BT.target.pos.x, BT.target.pos.z, 36 * BT.target.bs, "#ff4b4b", false, 3, BT.clock / 300, [10, 6]);
  drawRings(K);
  const fis = fieldGround(K).map(fi => ({ fi, d: [0, 0, 0, fi.depth] }));   // (screens and hazards: things on the field, with their shadows)
  psUpdate(K); psDrawBg(K);   // (Showdown's move animations: where they've moved the Pokémon, and their background flashes)
  // units and trainers, far to near
  const order = vus.map(vu => ({ vu, d: proj(K, vu.pos.x, 40, vu.pos.z) })).filter(o => o.d);
  const trs = Object.values(BT.tr || {}).filter(t => t.x != null).map(t => ({ t, d: proj(K, t.x, 40, t.z) })).filter(o => o.d);
  for (const o of [...order, ...trs, ...fis].sort((a, b) => b.d[3] - a.d[3])) if (o.fi) psDrawFieldItem(K, o.fi); else if (o.t) drawTrainer(K, o.t); else drawUnit(K, o.vu);
  drawBolts(K);
  drawBalls(K);
  drawParts(K, dt);
  psDrawFx(K);
  if (BT.env.snow || BT.env.embers) weather(K);
  g.restore();
  // screen-space overlays
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.save(); applyCamXform();
  if (BT.letterboxT < .5) for (const o of order) drawOverhead(K, o.vu);
  drawFloats(K);
  g.restore();
  if (BT.flash > 0) { g.fillStyle = BT.flashCol; g.globalAlpha = BT.flash; g.fillRect(0, 0, W, H); g.globalAlpha = 1; BT.flash = Math.max(0, BT.flash - dt / 260); }
  BT.letterbox += (BT.letterboxT - BT.letterbox) * (1 - Math.exp(-dt / 140));
  if (BT.letterbox > .01) { const h = H * .085 * BT.letterbox; g.fillStyle = "#000"; g.fillRect(0, 0, W, h); g.fillRect(0, H - h, W, h); }
}
function weather(K) {
  const g = BT.g, n = 60, t = BT.clock / 1000;
  g.fillStyle = BT.env.snow ? "rgba(255,255,255,.75)" : "rgba(255,140,60,.8)";
  for (let k = 0; k < n; k++) {
    const x = ((k * 137) % 1600) - 800 + Math.sin(t + k) * 20, z = ((k * 241) % 1200) - 400;
    const y = BT.env.snow ? 300 - ((t * 40 + k * 23) % 300) : ((t * 30 + k * 31) % 260);
    const p = proj(K, x, y, z); if (!p) continue;
    g.fillRect(p[0], p[1], 2.2 * p[2] + .5, 2.2 * p[2] + .5);
  }
}

// ---------- timing helpers (battle clock, honours pause + speed) ----------
const bwait = ms => new Promise(res => BT.waits.push({ until: BT.clock + ms, res }));
const btween = (dur, fn, easeOn = true) => new Promise(res => BT.tweens.push({ t0: BT.clock, dur: Math.max(1, dur), fn, res, ease: easeOn }));
function setPose(vu, name, dur = 0, back = true) { vu.pose = { name, t0: BT.clock, dur, back }; }
function camTo(p, k = 3, cut = false) { Object.assign(BT.camT, p); BT.camK = k; if (cut) Object.assign(BT.cam, BT.camT); }
function camHome(k = 2.6) { BT.orbit = false; camTo({ ...BT.home }, k); }
function fitHome() {
  // one view for every screen (the owner's pick): from behind your team, looking across at theirs; a wide screen only gets
  // the margins its battle bars need
  const land = BT.W / BT.H > 1.05;
  const c = { tx: 0, ty: 40, tz: 0, yaw: -1.08, pitch: .36, dist: 900, fov: .7, roll: 0 };
  const pts = [];
  // pad each slot along both ground axes (figures, weapons and capes); 170 covers figure height plus overhead bars
  for (const s of SLOTS) for (const sx of [-1, 1]) for (const [dx, dz] of [[-80, 0], [80, 0], [0, -60], [0, 60]]) pts.push([s[0] * sx + dx, 0, s[1] + dz], [s[0] * sx + dx, 190, s[1] + dz]);
  // the trainers stay in the picture too (their full width, head to feet)
  if (BT.tr) { const p = trainerSpots(c); for (const s in BT.tr) { const q = p[s], hh = BT.tr[s].h; for (const d of [-30, 30]) pts.push([q.x + p.rx * d, 0, q.z + p.rz * d], [q.x + p.rx * d, hh, q.z + p.rz * d]); } }
  const topM = land ? 64 : 84, botM = land ? 112 : 140, sideM = 4;
  const fit = () => {
    let lo = 150, hi = 6000;
    for (let k = 0; k < 26; k++) {
      const mid = (lo + hi) / 2; c.dist = mid; const K = camBasis(c); let ok = true;
      for (const p of pts) { const q = proj(K, ...p); if (!q || q[0] < sideM || q[0] > BT.W - sideM || q[1] < topM || q[1] > BT.H - botM) { ok = false; break; } }
      if (ok) hi = mid; else lo = mid;
    }
    c.dist = hi;
  };
  for (let it = 0; it < 5; it++) {
    fit();
    const K = camBasis(c); let y0 = 1e9, y1 = -1e9, x0 = 1e9, x1 = -1e9;
    for (const p of pts) { const q = proj(K, ...p); if (!q) continue; y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); }
    const s = K.focal / c.dist;
    const dx = ((x0 + x1) / 2 - BT.W / 2) / s, dy = ((y0 + y1) / 2 - (topM + BT.H - botM) / 2) / s;
    c.tx += K.r[0] * dx - K.u[0] * dy; c.ty += K.r[1] * dx - K.u[1] * dy; c.tz += K.r[2] * dx - K.u[2] * dy;
  }
  fit();
  return c;
}
