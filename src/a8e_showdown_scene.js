// =====================================================================
//  SHOWDOWN'S STAGE — Pokémon Showdown's move animations (a8d_showdown.js, generated from their scripts) run here, as
//  they are. This is the scene they expect: showEffect, animateEffect, backgroundEffect and wait, and for each Pokémon
//  x, y, z, behind, leftof, delay, anim and its sprite. It works like Showdown's engine (battle-animations.ts): the same
//  positions, timing curves (linear, swing, accel, decel, the ballistic arcs), jQuery's queues (an effect or Pokémon
//  moved again carries on after its last move) and the same fades, explosions and background flashes.
//  The stage is our 3D battlefield: Showdown's z runs from your side (0) to the other side (200), so a point is placed
//  on the line from the Pokémon on your side to the one on theirs, x sideways on the ground, y up from their middles,
//  and drawn through our camera, so the effects stay on the Pokémon whatever the camera does. Sizes stay Showdown's:
//  an effect is as big beside a Pokémon as it is on Showdown. Pictures: resources/showdown/fx (RES_DATA.psfx).
// =====================================================================
const Config = { routes: { client: "play.pokemonshowdown.com" } };
// our move ids Showdown spells differently (or a move newer than this copy of Showdown)
const PS_ALIAS = { sketch1: "sketch", sketch3: "sketch", copycat1: "copycat", copycat3: "copycat", mirrormove1: "mirrormove", mirrormove3: "mirrormove", vicegrip: "visegrip", alluringvoice: "disarmingvoice", doubleironbash: "meteormash", psyshieldbash: "zenheadbutt", shellsidearm: "sludgebomb",
  silktrap: "protect" };   // (Gen 8 and 9 moves Showdown never animated: the nearest one it has)
// a new status, and the animation Showdown plays for it
const PS_STATUS = { BRN: "brn", PSN: "psn", TOX: "psn", PAR: "par", SLP: "slp", FRZ: "frz", CNF: "confused", INFAT: "attracted", CURSE: "cursed", FLINCH: "flinch" };
const psEntry = k => BattleMoveAnims[PS_ALIAS[k] || k] || BattleMoveAnims.tackle;   // (Showdown falls back to Tackle too)

// ---------- the pictures ----------
const PSIMG = {};
function psImg(url) {
  url = String(url);
  if (PSIMG[url]) return PSIMG[url];
  let name = url.replace(/^url\(['"]?|['"]?\)$/g, "").split("/").pop().split("?")[0];
  const D = RES_DATA.psfx || {};
  if (!D[name]) name = name.replace(/\.jpg$/, ".png") in D ? name.replace(/\.jpg$/, ".png") : name.replace(/\.png$/, ".jpg");
  if (!D[name]) return (PSIMG[url] = null);
  const im = new Image(); im.src = `data:image/${/\.jpg$/.test(name) ? "jpeg" : "png"};base64,${D[name]}`;
  return (PSIMG[url] = im);
}

// ---------- Showdown's maths ----------
const PS_EASE = {
  linear: x => x,
  swing: x => .5 - Math.cos(x * Math.PI) / 2,   // (jQuery's)
  ballisticUp: x => -3 * x * x + 4 * x,
  ballisticDown: x => { x = 1 - x; return 1 - (-3 * x * x + 4 * x); },
  quadUp: x => { x = 1 - x; return 1 - x * x; },
  quadDown: x => x * x,
};
// how big a thing is on Showdown's stage at depth z: its Gen 5 Pokémon sprites, and everything else
const psSc = (z, obj) => Math.max(.1, obj && obj.gen === 5 ? 2 - z / 200 : 1.5 - .5 * (z / 200));
// a place: Showdown's defaults filled in
function psLoc(l) {
  const o = { x: 0, y: 0, z: 0, scale: 1, opacity: 1, ...l };
  if (!o.xscale && o.xscale !== 0) o.xscale = o.scale;
  if (!o.yscale && o.yscale !== 0) o.yscale = o.scale;
  return o;
}
// the middle of a thing's top edge on Showdown's stage (what its ballistic arcs bend)
const psTop = (l, obj) => 245 + (135 - 245) * (l.z / 200) - l.y * psSc(l.z, obj);
// which timing curve moves what (Showdown's posT): left (x, z), top (the arc) and size
function psMap(tr, to, obj, old) {
  const m = { L: "linear", T: "linear", S: "linear" }; if (!to || !tr) return m;
  const up = psTop(to, obj) < psTop(old, obj);
  if (tr === "ballistic") m.T = up ? "ballisticUp" : "ballisticDown";
  if (tr === "ballisticUnder") m.T = up ? "ballisticDown" : "ballisticUp";
  if (tr === "ballistic2") m.T = up ? "quadUp" : "quadDown";
  if (tr === "ballistic2Back") m.T = to.z > 0 ? "quadUp" : "quadDown";
  if (tr === "ballistic2Under") m.T = up ? "quadDown" : "quadUp";
  if (tr === "swing") m.L = m.T = m.S = "swing";
  if (tr === "accel") m.L = m.T = m.S = "quadDown";
  if (tr === "decel") m.L = m.T = m.S = "quadUp";
  return m;
}
// a moment of one move: the top edge follows its own curve, and the height that puts it there is worked back out
function psAt(q, p, obj) {
  const a = q.from, b = q.to, m = q.map, eL = PS_EASE[m.L](p), eT = PS_EASE[m.T](p), eS = PS_EASE[m.S](p);
  const z = lerp(a.z, b.z, eL), top = lerp(psTop(a, obj), psTop(b, obj), eT);
  return { x: lerp(a.x, b.x, eL), z, y: (245 + (135 - 245) * (z / 200) - top) / psSc(z, obj),
    xscale: lerp(a.xscale, b.xscale, eS), yscale: lerp(a.yscale, b.yscale, eS), opacity: lerp(a.opacity, b.opacity, p) };
}
// where a queue of moves has got to at time t (before its first: nothing yet)
function psState(qs, t, obj) {
  let s = null;
  for (const q of qs) {
    if (t < q.tA) break;
    s = q.t1 <= q.tA || t >= q.t1 ? q.to : psAt(q, (t - q.tA) / (q.t1 - q.tA), obj);
  }
  return s;
}

// ---------- the scene ----------
class PSEffect {
  constructor(effect, css) { this.obj = typeof effect === "string" ? BattleEffects[effect] : effect; this.css = css || {}; this.q = []; this.cur = 0; }
}
class PSMon {
  // a Pokémon in Showdown's terms: your side is z 0 and seen from behind, the other side z 200 and seen from the front;
  // a missed target stands 100 to the side (with nothing to show)
  constructor(scene, vu, far, miss) {
    this.scene = scene; this.vu = vu; this.isFrontSprite = far; this.isMissedPokemon = !!miss; this.sprite = this;
    this.x = miss ? (far ? -100 : 100) : 0; this.y = 0; this.z = far ? 200 : 0;
    this.sp = { url: `psmon:${vu ? vu.u.spr || vu.u.key : ""}${far ? "" : "-back"}`, w: 96, h: 96, gen: 5, pixelated: true };
    this.home = psLoc({ x: this.x, y: this.y, z: this.z }); this.last = this.home; this.q = []; this.cur = 0;
  }
  behind(o) { return this.z + (this.isFrontSprite ? 1 : -1) * o; }
  leftof(o) { return this.x + (this.isFrontSprite ? 1 : -1) * o; }
  behindx(o) { return this.x + (this.isFrontSprite ? 1 : -1) * o; }
  behindy(o) { return this.y + (this.isFrontSprite ? -1 : 1) * o; }
  delay(t) { if (!this.isMissedPokemon) this.cur += t; return this; }
  anim(end, transition) {
    if (this.isMissedPokemon) return this;
    end = { x: this.x, y: this.y, z: this.z, scale: 1, opacity: 1, time: 500, ...end };
    const to = psLoc(end), d = end.time || 0;
    this.q.push({ tA: this.cur, t1: this.cur + d, from: this.last, to, map: d ? psMap(transition, to, this.sp, this.home) : psMap() });
    this.cur += d; this.last = to; this.scene.end = Math.max(this.scene.end, this.cur);
    return this;
  }
}
const PS_STUB = { animate() { return this; }, delay() { return this; }, css() { return this; }, show() { return this; }, hide() { return this; }, append() { return this; } };
class PSScene {
  constructor() {
    Object.assign(this, { fx: [], bgs: [], mons: [], end: 0, timeOffset: 0, acceleration: 1, animating: true, gen: 9, mod: "", activeCount: 3,
      battle: { gameType: "triples", mySide: { x: 0, y: 0, z: 0 } }, $bg: PS_STUB, $fx: PS_STUB, $sprites: [PS_STUB, PS_STUB], $spritesFront: [PS_STUB, PS_STUB], t0: BT.clock });
  }
  wait(t) { this.timeOffset += t; }
  waitFor() {}
  updateSidebar() {}
  showEffect(effect, start, end, transition, after, css) {
    const e = new PSEffect(effect, css); if (!e.obj) return e;
    this.fx.push(e);
    return this.animateEffect(e, effect, start, end, transition, after, css);
  }
  animateEffect(e, effect, start, end, transition, after, css) {
    if (!e || !e.obj) return e;
    if (css) Object.assign(e.css, css);
    start = { ...start }; end = { ...end };
    if (!start.time) start.time = 0;
    if (!end.time) end.time = start.time + 500;
    start.time += this.timeOffset; end.time += this.timeOffset;
    if (!end.scale && end.scale !== 0 && start.scale) end.scale = start.scale;
    if (!end.xscale && end.xscale !== 0 && start.xscale) end.xscale = start.xscale;
    if (!end.yscale && end.yscale !== 0 && start.yscale) end.yscale = start.yscale;
    end = { ...start, ...end };
    const from = psLoc(start), to = psLoc(end), c = e.cur, tA = c + start.time, t1 = Math.max(tA, c + end.time);
    e.q.push({ tA, t1, from, to, map: psMap(transition, to, e.obj, from) });
    let last = to, t = t1;
    if (after === "fade") { const z = { ...last, opacity: 0 }; e.q.push({ tA: t, t1: t + 100, from: last, to: z, map: psMap() }); t += 100; }
    if (after === "explode") { const z = { ...last, xscale: last.xscale * 3, yscale: last.yscale * 3, opacity: 0 }; e.q.push({ tA: t, t1: t + 200, from: last, to: z, map: psMap() }); t += 200; }
    e.cur = t; this.end = Math.max(this.end, t);
    return e;
  }
  backgroundEffect(bg, duration, opacity = 1, delay = 0) { this.bgs.push({ bg: String(bg), t0: delay, dur: duration, op: opacity }); }
  get done() { return Math.max(this.end, this.timeOffset); }
}

// ---------- in our battle ----------
// Showdown's z 0 is the Pokémon on your side, 200 the one on theirs (if both are on one side, the nearest on the other)
function psAnchors(S) {
  const [A, D] = S.mons, sideVu = far => [A, D].find(m => m.vu && m.isFrontSprite === far);
  let near = sideVu(false), far = sideVu(true);
  const other = (vu, team) => [...BT.vus.values()].filter(v => v.team === team && !v.dead).sort((a, b) => Math.hypot(a.home.x - vu.home.x, a.home.z - vu.home.z) - Math.hypot(b.home.x - vu.home.x, b.home.z - vu.home.z))[0] || { home: { x: -vu.home.x, z: vu.home.z }, bs: vu.bs, out: vu.out, y: 0 };
  const nv = near ? near.vu : other(far.vu, "A"), fv = far ? far.vu : other(near.vu, "E");
  return { nv, fv };
}
const psMid = vu => ((vu.out && -vu.out.chest[1]) || 60) * vu.bs;   // a Pokémon's middle, above its feet (Showdown's y 0)
// a place on Showdown's stage, in our world, and how many world units one of its pixels is there (for a thing like obj)
function psWorld(S, l, obj, K) {
  const { nv, fv } = S.anc, t = l.z / 200, tc = clamp(t, 0, 1);
  const N = nv.home, F = fv.home, dx = F.x - N.x, dz = F.z - N.z, len = Math.hypot(dx, dz) || 1;
  let lx = -dz / len, lz = dx / len; if (lx * K.r[0] + lz * K.r[2] < 0) { lx = -lx; lz = -lz; }   // across: to the right on screen
  const bs = lerp(nv.bs, fv.bs, tc), k = psSc(l.z, obj) / psSc(l.z, { gen: 5 }) * bs;
  return { p: [N.x + dx * t + lx * l.x * k, lerp(psMid(nv), psMid(fv), tc) + l.y * k, N.z + dz * t + lz * l.x * k], k };
}
// each frame: the Pokémon Showdown is moving (as offsets from where they stand)
function psUpdate(K) {
  for (const vu of BT.vus.values()) vu.ps = null;
  BT.psScenes = (BT.psScenes || []).filter(S => !S.over || BT.clock - S.t0 < S.keep);
  for (const S of BT.psScenes) {
    const t = BT.clock - S.t0;
    for (const m of S.mons) {
      if (!m.vu || m.isMissedPokemon || !m.q.length) continue;
      const s = psState(m.q, t, m.sp) || m.home; if (S.over && t >= m.cur) continue;
      const a = psWorld(S, m.home, m.sp, K).p, b = psWorld(S, s, m.sp, K).p;
      m.vu.ps = { off: [b[0] - a[0], b[1] - a[1], b[2] - a[2]], sx: s.xscale, sy: s.yscale, op: s.opacity };
    }
  }
}
// the background flashes: behind the Pokémon, over the battlefield
function psDrawBg(K) {
  const g = BT.g;
  for (const S of BT.psScenes || []) for (const b of S.bgs) {
    const t = BT.clock - S.t0 - b.t0; if (t < 0 || t > b.dur + 250) continue;
    const a = b.op * (t < 250 ? t / 250 : t > b.dur ? 1 - (t - b.dur) / 250 : 1); if (a <= 0) continue;
    g.save(); g.globalAlpha = clamp(a, 0, 1);
    const url = /url\(/.test(b.bg) && psImg(b.bg.match(/url\(([^)]*)\)/)[1]);
    if (url) { if (url.naturalWidth) { const s = Math.max(BT.W / url.naturalWidth, BT.H / url.naturalHeight); g.drawImage(url, (BT.W - url.naturalWidth * s) / 2, (BT.H - url.naturalHeight * s) / 2, url.naturalWidth * s, url.naturalHeight * s); } }
    else if (/^linear-gradient/.test(b.bg)) {
      const stops = b.bg.replace(/^linear-gradient\(|\)\s*$/g, "").split(/,(?![^(]*\))/).map(x => x.trim()), gr = g.createLinearGradient(0, 0, 0, BT.H);
      stops.forEach((st, i) => { const m = st.match(/^(.*?)(?:\s+([\d.]+)%)?$/); try { gr.addColorStop(m[2] != null ? m[2] / 100 : i / Math.max(1, stops.length - 1), m[1]); } catch (e) { /* not a colour */ } });
      g.fillStyle = gr; g.fillRect(0, 0, BT.W, BT.H);
    } else { g.fillStyle = b.bg; g.fillRect(0, 0, BT.W, BT.H); }
    g.restore();
  }
}
// the effects: over the Pokémon
function psDrawFx(K) {
  const g = BT.g;
  for (const S of BT.psScenes || []) {
    const t = BT.clock - S.t0;
    for (const e of S.fx) {
      const s = psState(e.q, t, e.obj); if (!s || s.opacity <= 0) continue;
      const { p, k } = psWorld(S, s, e.obj, K), q = proj(K, ...p); if (!q) continue;
      const px = k * q[2], w = e.obj.w * s.xscale * px, h = e.obj.h * s.yscale * px, ho = (e.obj.h - 2 * (e.obj.y || 0)) * s.yscale * px;
      if (w <= 0 || h <= 0) continue;
      g.save(); g.globalAlpha = clamp(s.opacity, 0, 1);
      if (e.css.filter) g.filter = e.css.filter;
      if (String(e.obj.url).startsWith("psmon:")) {   // a copy of a Pokémon (afterimages, Substitute, Transform...)
        const key = e.obj.url.slice(6).replace(/-back$/, ""), back = /-back$/.test(e.obj.url), sc = px * s.yscale;
        g.translate(q[0], q[1] + 60 * sc); g.scale(px * s.xscale, sc);
        drawMonSprite(g, key, back, back ? 1 : -1, { name: "idle", t: 0, time: BT.clock / 1000 }, 0, { at: performance.now() });
      } else {
        const im = psImg(e.obj.url); if (im && im.naturalWidth) { g.imageSmoothingEnabled = !e.obj.pixelated; g.drawImage(im, q[0] - w / 2, q[1] - ho / 2, w, h); }
      }
      g.restore();
    }
  }
}
// run one of Showdown's animations: fn(scene, [attacker, target]); resolves when Showdown would move on
async function psRun(fn, a, d, o = {}) {
  if (!fn || !a || !BT.on) return;
  const S = new PSScene(), far = vu => vu.team === "E";
  const A = new PSMon(S, a, far(a)), D = !d || d === a ? A : new PSMon(S, d, far(d), o.miss);
  if (o.carry) for (const m of [A, D]) { const c = o.carry.get(m.vu); if (c) m.last = c; }
  S.mons = A === D ? [A] : [A, D]; S.anc = psAnchors({ mons: [A, D] });
  try { fn(S, [A, D]); } catch (e) { console.warn("[showdown]", e); }
  BT.psScenes = (BT.psScenes || []).concat(S);
  await bwait(Math.min(S.done, 6000));
  S.over = true; S.keep = Math.max(...S.bgs.map(b => b.t0 + b.dur + 250), 0);
  S.fx = [];   // (what's left of its effects goes when it's done, as Showdown clears them)
  return new Map(S.mons.map(m => [m.vu, m.last]));
}
// a move: its charge first if Showdown has one (Solar Beam, Fly, Dig...), then the move
async function psMove(k, a, d, o = {}) {
  const E = psEntry(k);
  const carry = E.prepareAnim && !o.noPrep ? await psRun(E.prepareAnim, a, d, o) : null;
  await psRun(E.anim, a, d, { ...o, carry });
}
function psResidual(vu) {
  const ids = (vu.effs || []).map(x => x[0]);
  if (["PSN", "TOX", "BRN"].includes(vu.st)) return psStatus(vu.st, vu);
  if (ids.includes("SEED")) return psRun(BattleMoveAnims.leechseed.residualAnim, vu, vu);
  if (ids.includes("TRAP")) return psOther("bound", vu, vu);
  if (ids.includes("CURSE")) return psStatus("CURSE", vu);
  return psOther("hitmark", vu, vu);
}
const psOther = (k, a, d) => BattleOtherAnims[k] ? psRun(BattleOtherAnims[k].anim, a, d) : Promise.resolve();
const psStatus = (s, vu) => PS_STATUS[s] && BattleStatusAnims[PS_STATUS[s]] ? psRun(BattleStatusAnims[PS_STATUS[s]].anim, vu, vu) : Promise.resolve();

// ---------- the battlefield: weather, terrain, screens and hazards, as Showdown shows them ----------
// Weather is a layer over the battlefield at half strength (it fades out and the new one fades in); terrain and Trick Room
// take the background's place (sliding away down, the new one sliding up), under the platforms. Screens and hazards stand
// on their side until they go: the screens as Showdown's panels (they grow in, then settle faint), the hazards as its
// rocks and caltrops at the Pokémon's feet. (Showdown's battle.css and battle-animations.ts: updateWeather, addSideCondition.)
const PS_LAYER = { sun: ["weather-sunnyday.jpg", "#FFEEBB"], rain: ["weather-raindance.jpg", "#99BBFF"], sand: ["weather-sandstorm.png", "#E6E0AC"],
  hail: ["weather-hail.png", "#AADDEE"], snow: ["weather-hail.png", "#AADDEE"], electric: ["weather-electricterrain.png", "#EEEEAA"],
  grassy: ["weather-grassyterrain.png", "#CCEEAA"], misty: ["weather-mistyterrain.png", "#EEAACC"], psychic: ["weather-psychicterrain.png", "#CCAAEE"],
  trickroom: ["weather-trickroom.png", "#DDAAEE"] };
const PS_SCREEN = { VEIL: ["#88EEFF", "#55BBCC", -14], REFLECT: ["#EEEEEE", "#888888", -17], SAFEGUARD: ["#DD88DD", "#AA66AA", -20], LSCREEN: ["#CCCC00", "#AAAA00", -23], MIST: ["#AACCFF", "#5577CC", -27] };
function fieldInit(cfg) {
  BT.field = { wx: { cur: cfg.weather || null, prev: null, t0: -1e9 }, ter: { cur: null, prev: null, t0: -1e9 }, hz: { A: {}, E: {} }, scr: { A: {}, E: {} }, spots: { A: {}, E: {} } };
}
// the places a side's Pokémon stand (a slot keeps its place, and the size of who stood there last, while it's empty): screens and
// hazards are part of the field, so they go by these, never by where a Pokémon has jumped or lunged to in a move's animation
function fieldSpots(team) {
  const m = BT.field.spots[team];
  for (const v of BT.vus.values()) if (v.team === team && v.out && v.out.w) m[v.home.x + "," + v.home.z] = { x: v.home.x, z: v.home.z, bs: v.bs, w: v.out.w, h: v.out.h };
  return Object.values(m);
}
// a new weather, terrain or Trick Room (from the battle's events)
function fieldSet(kind, v) {
  const L = BT.field && BT.field[kind]; if (!L || L.cur === v) return;
  Object.assign(L, { prev: L.cur, cur: v, t0: BT.clock });
}
function psLayer(key, alpha, dy) {
  const d = PS_LAYER[key], im = d && psImg(d[0]); if (!d || alpha <= 0) return;
  const g = BT.g; g.save(); g.globalAlpha = alpha; g.fillStyle = d[1]; g.fillRect(0, dy, BT.W, BT.H);
  if (im && im.naturalWidth) { const s = Math.max(BT.W / im.naturalWidth, BT.H / im.naturalHeight); g.drawImage(im, 0, dy, im.naturalWidth * s, im.naturalHeight * s); }
  g.restore();
}
// terrain (or Trick Room, which Showdown shows the same way): old one down and out over 400ms, then the new one up and in
function psDrawTerrain() {
  const T = BT.field && BT.field.ter; if (!T) return;
  const t = BT.clock - T.t0, out = T.prev ? 400 : 1;
  if (T.prev && t < out) { const k = t / out; psLayer(T.prev, 1 - k, k * BT.H); }
  else if (T.cur) { const k = clamp((t - out) / 400, 0, 1); psLayer(T.cur, k, (1 - k) * BT.H); }
}
// weather: the old fades out (300ms, or 100 if there was none), the new fades in to half strength
function psDrawWeather() {
  const W = BT.field && BT.field.wx; if (!W) return;
  const t = BT.clock - W.t0, out = W.prev ? 300 : 100;
  if (W.prev && t < out) psLayer(W.prev, .5 * (1 - t / out), 0);
  else if (W.cur) psLayer(W.cur, .5 * clamp((t - out) / 300, 0, 1), 0);
}
// a side on the field, in the world (so its screens and hazards keep their places whatever the camera does): its middle (cx, cz),
// n towards the other side, a across it, how far its Pokémon reach along a (lo, hi, sprites' widths included) and towards the
// other side (front), the tallest of them (H) and their size (bs)
function sideFrame(spots, foes, team, K) {
  const unit = (x, z) => { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; };
  const cx = avgN(spots.map(p => p.x)), cz = avgN(spots.map(p => p.z)), bs = avgN(spots.map(p => p.bs));
  const [nx, nz] = foes.length ? unit(avgN(foes.map(p => p.x)) - cx, avgN(foes.map(p => p.z)) - cz) : unit(K.f[0] * (team === "A" ? 1 : -1), K.f[2] * (team === "A" ? 1 : -1));
  const ax = -nz, az = nx, along = p => (p.x - cx) * ax + (p.z - cz) * az;
  return { cx, cz, nx, nz, ax, az, bs, lo: Math.min(...spots.map(p => along(p) - p.w / 2 * p.bs)), hi: Math.max(...spots.map(p => along(p) + p.w / 2 * p.bs)),
    front: Math.max(...spots.map(p => (p.x - cx) * nx + (p.z - cz) * nz)), back: Math.min(...spots.map(p => (p.x - cx) * nx + (p.z - cz) * nz)), H: Math.max(...spots.map(p => p.h * p.bs)),
    // a point on the ground: f of the way across the side (0 to 1), t towards the other side from its middle (in the side's sprite pixels)
    at: (f, t, y = 0) => { const u = lerp(Math.min(...spots.map(p => along(p))) - 30 * bs, Math.max(...spots.map(p => along(p))) + 30 * bs, f);
      return [cx + ax * u + nx * t * bs, y, cz + az * u + nz * t * bs]; } };
}
// what each side has up now: screens from its Pokémon's effects (they come and go with the battle's own fx events), hazards from its
// side events. Each is a thing in the battlefield, drawn with the camera like the Pokémon (sorted by depth among them).
function fieldItems(K) {
  const F = BT.field; if (!F) return [];
  const items = [], sp = { A: fieldSpots("A"), E: fieldSpots("E") };
  for (const team of ["A", "E"]) {
    const vs = [...BT.vus.values()].filter(v => v.team === team && !v.dead && !v.gone), up = new Set(vs.flatMap(v => (v.effs || []).map(e => e[0])));
    for (const id in PS_SCREEN) { if (up.has(id)) { if (F.scr[team][id] == null) F.scr[team][id] = BT.clock; } else delete F.scr[team][id]; }
    const spots = sp[team]; if (!spots.length) continue;
    const fr = sideFrame(spots, sp[team === "A" ? "E" : "A"], team, K), dep = p => (proj(K, ...p) || [0, 0, 0, 1e9])[3];
    // screens: a wall of light standing on the ground just in front of the side (towards the other side), as wide as the side and as
    // tall as its tallest Pokémon; later ones a little further out, as Showdown stacks them
    Object.keys(F.scr[team]).forEach((id, i) => {
      const d = (fr.front + (26 + 8 * i) * fr.bs), bx = fr.cx + fr.nx * d, bz = fr.cz + fr.nz * d, m = 10 * fr.bs, H = fr.H * 1.06;
      const ends = [fr.lo - m, fr.hi + m].map(u => [bx + fr.ax * u, bz + fr.az * u]);
      items.push({ team, screen: id, t0: F.scr[team][id], ends, H, depth: dep([bx + fr.ax * (fr.lo + fr.hi) / 2, H / 2, bz + fr.az * (fr.lo + fr.hi) / 2]) });
    });
    // hazards: Showdown's rocks and caltrops scattered on the ground around the side's Pokémon (Stealth Rock's stones float and bob),
    // on the side the camera sees: in front of the opposing team, behind yours (o: how far out from the Pokémon, in sprite pixels)
    const hz = F.hz[team] || {}, out = team === "A" ? o => fr.back / fr.bs - o : o => fr.front / fr.bs + o;
    const put = (k, f, o, y, scale, opacity = 1) => { const t = out(o), p = fr.at(f, t, y * fr.bs); items.push({ team, eff: BattleEffects[k], p, y: y * fr.bs, bs: fr.bs, scale, opacity, ph: f * 7 + t, depth: dep([p[0], 0, p[2]]) }); };
    if (hz.sr) [[.06, 30, 34, "rock1"], [.36, 52, 50, "rock2"], [.64, 24, 40, "rock1"], [.94, 46, 56, "rock2"]].forEach(([f, o, y, k]) => put(k, f, o, y, .5, .8));
    [[.16, 30], [.5, 50], [.84, 26]].slice(0, hz.spikes || 0).forEach(([f, o]) => put("caltrop", f, o, 0, .5));
    [[.33, 40], [.67, 24]].slice(0, hz.tspikes || 0).forEach(([f, o]) => put("poisoncaltrop", f, o, 0, .5));
    if (hz.web) put("web", .5, 36, 0, .9, .55);   // Sticky Web
  }
  // protection (Protect, Detect, or a replacement after a faint until its first turn): Showdown's Protect panel over the Pokémon,
  // just in front of it, from when it's out of its Poké Ball for as long as it lasts (the owner's ask, 2026-10-20)
  for (const v of BT.vus.values()) {
    if (v.dead || v.gone || v.recallT != null || !(v.effs || []).some(e => e[0] === "PROTECT")) { v.protT = null; continue; }
    if (v.spawnT != null) continue;
    if (v.protT == null) v.protT = BT.clock;
    const q = proj(K, v.pos.x, 40, v.pos.z); if (q) items.push({ prot: v, t0: v.protT, depth: q[3] - 1 });
  }
  return items;
}
// the field items for this frame, and their shadows on the ground (under every Pokémon, like theirs)
function fieldGround(K) {
  if (!BT.field) return [];
  const items = BT.field.items = fieldItems(K);
  for (const it of items) if (it.eff) groundEllipse(K, it.p[0], it.p[2], (it.y ? 9 : 11) * it.bs * it.scale * 2, `rgba(0,0,0,${it.y ? .2 : .3})`, true);
  return items;
}
function psDrawFieldItem(K, it) {
  const g = BT.g;
  if (it.prot) {   // Protect: Showdown's panel (#DD88DD, edged #AA66AA, 100 by 70), growing in (opacity .1 to .9 in 400ms), then .4 in 300ms
    const v = it.prot, t = BT.clock - it.t0, ys = clamp(t / 400, 0, 1), op = t < 400 ? lerp(.1, .9, t / 400) : t < 700 ? lerp(.9, .4, (t - 400) / 300) : .4;
    const q = proj(K, v.pos.x, psMid(v), v.pos.z); if (!q) return;
    const w = 100 * v.bs * q[2], h = 70 * v.bs * q[2] * ys;
    g.save(); g.globalAlpha = op; g.fillStyle = "#DD88DD"; g.fillRect(q[0] - w / 2, q[1] - h / 2, w, h);
    g.strokeStyle = "#AA66AA"; g.lineWidth = Math.max(1, v.bs * q[2]); g.strokeRect(q[0] - w / 2, q[1] - h / 2, w, h); g.restore();
    return;
  }
  if (it.screen) {   // a screen: Showdown's panel, growing in (yscale 0 to 1, opacity .1 to .7 in 400ms, then .3 in 300ms)
    const t = BT.clock - it.t0, ys = clamp(t / 400, 0, 1), op = t < 400 ? lerp(.1, .7, t / 400) : t < 700 ? lerp(.7, .3, (t - 400) / 300) : .3;
    const y0 = it.H / 2 * (1 - ys), y1 = it.H / 2 * (1 + ys), [[x0, z0], [x1, z1]] = it.ends;
    const c4 = [[x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0]].map(p => proj(K, ...p)); if (c4.some(q => !q)) return;
    const c = PS_SCREEN[it.screen], top = [(c4[2][0] + c4[3][0]) / 2, (c4[2][1] + c4[3][1]) / 2], bot = [(c4[0][0] + c4[1][0]) / 2, (c4[0][1] + c4[1][1]) / 2];
    const path = () => { g.beginPath(); c4.forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
    // (this big, Showdown's .3 would wash the Pokémon out: a lighter pane, brighter at the top, with a clearer edge, like glass)
    g.save(); const gr = g.createLinearGradient(top[0], top[1], bot[0], bot[1]); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[0] + "66");
    path(); g.globalAlpha = op * .7; g.fillStyle = gr; g.fill();
    g.globalAlpha = Math.min(1, op * 2.2); g.strokeStyle = c[1]; g.lineWidth = Math.max(1.5, Math.hypot(top[0] - bot[0], top[1] - bot[1]) / 90); g.stroke(); g.restore();
    return;
  }
  const im = psImg(it.eff.url); if (!im || !im.naturalWidth) return;
  const bob = it.y ? Math.sin(BT.clock / 650 + it.ph) * 3 * it.bs : 0, q = proj(K, it.p[0], it.p[1] + bob, it.p[2]); if (!q) return;
  const w = it.eff.w * it.scale * it.bs * q[2], h = it.eff.h * it.scale * it.bs * q[2];
  g.save(); g.globalAlpha = it.opacity; g.imageSmoothingEnabled = false; g.drawImage(im, q[0] - w / 2, q[1] - (it.y ? h / 2 : h * .92), w, h); g.restore();
}
// a status condition on the sprite: Showdown's own colour filters (left in its battle-animations.ts as notes), at half strength
const PS_ST_FILTER = { PAR: "sepia(100%) hue-rotate(373deg) saturate(592%)", PSN: "sepia(100%) hue-rotate(618deg) saturate(285%)", TOX: "sepia(100%) hue-rotate(618deg) saturate(285%)",
  BRN: "sepia(100%) hue-rotate(311deg) saturate(469%)", SLP: "grayscale(100%)", FRZ: "sepia(100%) hue-rotate(154deg) saturate(759%) brightness(23%)" };
