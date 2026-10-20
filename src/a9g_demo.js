
// =====================================================================
//  DEMO — a runner that plays the game from a new save to 100% through the real screens.
//  Every action is a visible tap on the real UI (a finger shows where it lands); decisions come from quick hidden
//  battle simulations. It plays on its own save (DEMO_KEY) and skips time forward on that save only while it waits
//  for PP, Tickets or a new day. Like a player, it only uses what its adventure has opened so far (featOn in a6_state.js).
//  100% = every Journey stage (3 stars on battles), Explore 1–6 in every area, all Battle Tower floors, the Legend
//  tier in Ranked Battles and Link Battles, and a complete Pokédex (every Pokémon caught).
// =====================================================================
const DEMO = { on: false, paused: false, gen: 0, speed: 1, skew: 0, fast: false, log: [], fails: {}, fx: -1, fy: -1, errors: 0, guildTry: null };
const DEMO_SPEEDS = [1, 2, 4, 8, 16, 32, 64];
// its starter in a region: for a Journey, the one strong against its first Gyms (Bulbasaur, against Brock's Rock and Misty's Water),
// the earliest counting most; for a region whose Journey is coming soon, the one whose final form does most in the Stadium (metaScore)
function demoStarter(id, part = 1) {
  const list = regionStarters(id), G = (part > 1 && regionCard(id).gyms2 ? regionCard(id).gyms2.map(g => g[1]) : gymTypesOf(id)).slice(0, 4);   // (part: a Journey's Part 2, its own Gyms)
  const last = k => { const out = [k]; for (let i = 0; i < out.length; i++) for (const e of OPS[out[i]].evo || []) if (OPS[e.to] && !out.includes(e.to)) out.push(e.to); return Math.max(...out.map(metaScore)); };
  const vs = k => G.reduce((a, t, i) => a + typeEff(OPS[k].types[0], [t]) / (i + 1), 0);
  return list.slice().sort((a, b) => journeyOf(id) ? vs(b) - vs(a) || last(b) - last(a) : last(b) - last(a))[0];
}
// the region to start in (one with a Journey), and the next one to open: the one whose Pokémon add most to a Stadium team (the
// six best of its meta, metaScore)
const regionWorth = id => metaPool(new Set([regionGen(id)])).slice(0, 6).reduce((a, k) => a + metaScore(k), 0);
let DEX_R = null;
const DEX_REACH = () => DEX_R || (DEX_R = OP_KEYS.filter(k => journeyOf(regionOf(k))));
const demoRegion = () => DEMO.region || REGION_IDS.filter(id => journeyOf(id)).sort((a, b) => regionWorth(b) - regionWorth(a))[0];   // (DEMO.region: a test starting it in one region)
const demoNextRegion = () => nextRegions().slice().sort((a, b) => (journeyOf(b) ? 1 : 0) - (journeyOf(a) ? 1 : 0) || regionWorth(b) - regionWorth(a))[0];
const RealDate = Date;
class DemoDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + DEMO.skew); }
  static now() { return RealDate.now() + DEMO.skew; }
}
class DemoStop extends Error {}

// ---------- progress ----------
const isBattleNode = nd => !!(nd.waves || nd.rivalWaves);
function demoGoals(s) {
  s = s || S;
  const st = id => (s.story && s.story[id]) || 0, nodes = Object.values(NODES);
  const nodesDone = nodes.filter(nd => isBattleNode(nd) ? st(nd.id) >= 3 : st(nd.id) > 0).length;
  const huntMax = HUNTS.length * 6, hunts = HUNTS.reduce((a, h) => a + Math.min(6, (s.hunt && s.hunt[h.id]) || 0), 0);
  const towerN = towerCount(towerWings().filter(id => (s.regions || {})[id] || (id === "kanto" && !Object.keys(s.regions || {}).length))) || 1;
  const tower = Math.min(towerN, s.tower || 0), LEG = TIERS[TIERS.length - 1].min;
  const cc = s.ladder ? s.ladder.best : LADDER_START, rt = s.rta ? s.rta.best : LADDER_START;
  const climb = b => clamp((b - LADDER_START) / (LEG - LADDER_START), 0, 1);
  const dex = Object.keys((s.dex && s.dex.caught) || {}).filter(k => OPS[k]).length;
  const dexN = DEX_REACH().length;   // (the Pokémon of the regions with a built Journey: the others stay locked until theirs is)
  const parts = [[nodesDone, nodes.length, 34], [hunts, huntMax, 12], [tower, towerN, 16], [climb(cc), 1, 12], [climb(rt), 1, 12], [Math.min(dex, dexN), dexN, 14]];
  return { pct: parts.reduce((a, [v, n, wt]) => a + wt * v / n, 0), nodesDone, hunts, tower, cc, rt, dex,
    done: nodesDone === nodes.length && hunts === huntMax && tower >= towerN && cc >= LEG && rt >= LEG && dex >= dexN };
}
const demoProgressText = s => Math.floor(demoGoals(s).pct) + "%";

// ---------- overlay: status bar, input shield, finger ----------
function demoHud() {
  let h = $("#demoHud");
  if (!h) {
    const blk = document.createElement("div"); blk.id = "demoBlock"; document.body.appendChild(blk);
    const f = document.createElement("div"); f.id = "demoFinger"; document.body.appendChild(f);
    h = document.createElement("div"); h.id = "demoHud"; document.body.appendChild(h);
  }
  h.innerHTML = `<span class="dtag">DEMO</span><div class="dst"><b id="dmSt">Starting…</b><small id="dmSub"></small></div><span class="dpct num" id="dmPct">0%</span>
    <button id="dmSpd" aria-label="Demo speed">${DEMO.speed}×</button><span class="dbtns" id="dmBtns"></span>`;
  $("#dmSpd").onclick = demoCycleSpeed;
  demoButtons();
}
// Stop and Start (the owner's rule): Stop hands the Demo's save to you (its finger and input shield go, and the game plays as yours);
// Start hands it back, and the Demo carries on from wherever you left it. While it's stopped, Exit goes back to the title.
function demoButtons() {
  const b = $("#dmBtns"); if (!b) return;
  b.innerHTML = DEMO.paused ? `<button class="go" id="dmToggle">Start</button><button id="dmExit">Exit</button>` : `<button class="stop" id="dmToggle">Stop</button>`;
  $("#dmToggle").onclick = demoToggle;
  if ($("#dmExit")) $("#dmExit").onclick = () => stopDemo("Demo stopped");
}
const demoToggle = () => DEMO.paused ? resumeDemo() : pauseDemo();
function pauseDemo() {
  if (!DEMO.on) return;
  DEMO.on = false; DEMO.paused = true; DEMO.gen++;   // (the Demo's next step sees the new generation and stops)
  for (const id of ["demoBlock", "demoFinger", "demoSkip"]) { const el = $("#" + id); if (el) el.hidden = true; }
  if (S) { S.demoSkew = DEMO.skew; save(); if (BT.on) BT.speed = S.settings.speed || 1; }
  if (BT.on && BT.B && BT.B.auto && $("#bAuto")) $("#bAuto").click();   // a battle it was playing waits for your moves (Start turns AUTO back on)
  dsay("Stopped", "You're playing · Start hands it back");
  demoButtons();
  if (!BT.on && $("#modal").hidden) rerender();
}
function resumeDemo() {
  if (!DEMO.paused || !S) return;
  DEMO.paused = false; DEMO.on = true; DEMO.gen++;
  for (const id of ["demoBlock", "demoFinger", "demoSkip"]) { const el = $("#" + id); if (el) el.hidden = false; }
  S.settings.ai = "expert";
  demoButtons(); dsay("Starting again", "Carrying on from here");
  // a battle you left running: it plays that one out on AUTO first, then carries on as usual
  (async () => { if (BT.on) await fight(); return demoMain(); })().catch(e => { if (!(e instanceof DemoStop)) console.error(e); });
}
function demoCycleSpeed() {
  DEMO.speed = DEMO_SPEEDS[(DEMO_SPEEDS.indexOf(DEMO.speed) + 1) % DEMO_SPEEDS.length];
  const b = $("#dmSpd"); if (b) b.textContent = DEMO.speed + "×";
  if (BT.on) battleSpeed();
}
// ` cycles the speed, Q stops and starts it (Escape is the Game Boy's B button)
function demoKeys(e) {
  if (!DEMO.on && !DEMO.paused) return;
  if (e.key === "`") { e.preventDefault(); demoCycleSpeed(); }
  else if ((e.key === "q" || e.key === "Q") && !(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName))) { e.preventDefault(); demoToggle(); }
}
// the Demo's status line (the battle text function is `say`)
function dsay(status, sub = "") {
  const a = $("#dmSt"), b = $("#dmSub"); if (a) a.textContent = status; if (b) b.textContent = sub;
  DEMO.log.push(`[${new RealDate().toLocaleTimeString()}] ${status}${sub ? " · " + sub : ""}`); if (DEMO.log.length > 300) DEMO.log.shift();
  if (S) { const p = $("#dmPct"); if (p) p.textContent = Math.floor(demoGoals().pct) + "%"; }
}

// ---------- pacing ----------
const chk = g => { if (!DEMO.on || g !== DEMO.gen) throw new DemoStop(); };
function w(ms) { const g = DEMO.gen; return new Promise(r => setTimeout(r, DEMO.fast ? 0 : ms / DEMO.speed)).then(() => chk(g)); }
async function until(fn, ms = 20000) {
  const g = DEMO.gen, t0 = performance.now();
  while (!fn()) { await new Promise(r => setTimeout(r, 40)); chk(g); if (performance.now() - t0 > ms) return false; }
  return true;
}

// ---------- taps ----------
// quick: a brisk run of taps (filling the team), about a third of a normal tap's time
async function fingerTo(x, y, quick) {
  const f = $("#demoFinger"); if (!f || DEMO.fast) return;
  if (Math.hypot(x - DEMO.fx, y - DEMO.fy) < 4) return;
  f.style.transitionDuration = Math.max(.04, (quick ? .1 : .3) / Math.sqrt(DEMO.speed)) + "s";
  f.style.left = x + "px"; f.style.top = y + "px"; DEMO.fx = x; DEMO.fy = y;
  await w(quick ? 100 : 300);
}
async function fingerTap(x, y, quick) {
  if (DEMO.fast) return;
  const f = $("#demoFinger"); if (f) f.classList.add("down");
  const r = document.createElement("div"); r.className = "dripple"; r.style.left = x + "px"; r.style.top = y + "px"; document.body.appendChild(r);
  setTimeout(() => r.remove(), 600);
  await w(quick ? 40 : 90); if (f) f.classList.remove("down");
}
function centerOf(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
// the same button again if the screen was redrawn meanwhile (the top bar and tabs redraw when PP or Tickets change): clicking a
// detached copy would do nothing
function refind(el) {
  if (el.isConnected) return el;
  if (el.id) return document.getElementById(el.id);
  const d = el.dataset; if (!d.act) return null;
  return $$(`[data-act="${d.act}"]`).find(x => Object.keys(d).every(k => x.dataset[k] === d[k])) || null;
}
async function tapEl(el, what = "button", quick) {
  chk(DEMO.gen);
  if (!el) throw new Error("can't find " + what);
  if (el.disabled) throw new Error(what + " is disabled");
  // always bring it to the middle of the game's own screen (it scrolls inside the Game Boy, not the page)
  el.scrollIntoView({ block: "center", inline: "nearest" });
  await w(quick ? 40 : 120);
  el = refind(el) || el;
  const [x, y] = centerOf(el);
  await fingerTo(x, y, quick); await fingerTap(x, y, quick);
  el = refind(el);
  if (!el) throw new Error(what + " went away before the tap");
  el.click();
  await w(quick ? 60 : 220);
}
const actEl = (act, data = {}) => $$(`[data-act="${act}"]`).find(el => Object.entries(data).every(([k, v]) => el.dataset[k] === String(v)));
// a button it expects that isn't there: the screen may not have caught up, so redraw it once and look again
// (a battle still wrapping up, a scene or a window in the way: let those finish first, then redraw)
async function tapAct(act, data = {}, what, quick) {
  let el = actEl(act, data);
  for (let i = 0; i < 2 && !el && UI.inGame; i++) {
    console.info("[demo] looking again on", UI.view, "(drawn:", $("#view").dataset.v + ", battle", BT.on, ", window", !$("#modal").hidden, ", scene", !$("#gacha").hidden || !$("#dlg").hidden, ") for", act, JSON.stringify(data), "| before:", DEMO.log.slice(-4).join(" / "));
    await settle(); await closeAllModals();
    rerender(); await w(80); el = actEl(act, data);
  }
  if (!el) throw new Error(`can't find ${what || act + " " + JSON.stringify(data)} (on ${UI.view}, drawn ${$("#view").dataset.v}, battle ${BT.on}, window ${!$("#modal").hidden})`);
  await tapEl(el, what || `${act} ${JSON.stringify(data)}`, quick);
}

// ---------- screens ----------
// modals that can't simply be closed: naming, the starter choice
async function answerModal() {
  if ($("#nname")) { dsay("A new Trainer", "Choosing a name"); await tapAct("nameGo", {}, "That's me!"); return true; }
  if (actEl("pickPartStarter")) { const id = actEl("pickPartStarter").dataset.v, k = demoStarter(id, 2); dsay(`${REGION_NAME[id]} · Part 2's partner`, OPS[k].n); await tapAct("pickPartStarter", { v: id, k }, OPS[k].n); return true; }
  if (actEl("pickRegion")) { const id = demoRegion(); dsay("A new adventure", `Starting in ${REGION_NAME[id]}`); await tapAct("pickRegion", { v: id }, REGION_NAME[id]); return true; }
  if (actEl("pickRegionStarter")) { const id = actEl("pickRegionStarter").dataset.v, k = demoStarter(id); dsay(`${REGION_NAME[id]} · a new partner`, OPS[k].n); await tapAct("pickRegionStarter", { v: id, k }, OPS[k].n); return true; }
  if ($(".starters")) { const k = demoStarter(S.region || "kanto"); dsay("Choosing a starter", OPS[k].n); await tapAct("pickStarter", { k }, OPS[k].n); return true; }
  if (actEl("introGo")) { dsay("A new adventure", "Choosing a region"); await tapAct("introGo", {}, "Choose a region"); return true; }
  // "X wants to learn Y!": learn it when its moves are better with it, for this Pokémon on this team (setValue in a6h_build.js)
  if (actEl("learnYes")) {
    const q = S.learnQ[0], p = q && S.ops[q.k], cur = p && pmv(q.k), old = cur && cur[slotOf(q.m) - 1];
    let yes = false;
    if (old) {
      const c = demoPlan().c, ab = p.ab || OPS[q.k].ab, next = cur.slice(); next[slotOf(q.m) - 1] = q.m;
      yes = setValue(q.k, next, ab, p.held, c) > setValue(q.k, cur, ab, p.held, c) * 1.01;
    }
    if (q && old) dsay("Learning moves · " + OPS[q.k].n, yes ? `${MOVES[old].n} → ${MOVES[q.m].n}` : `keeps ${MOVES[old].n} over ${MOVES[q.m].n}`);
    await tapAct(yes ? "learnYes" : "learnNo", {}, yes ? "Learn" : "Keep"); return true;
  }
  return false;
}
async function closeAllModals() {
  if (SL.on && $("#modal").hidden) { const b = actEl("slotsClose"); if (b) await tapEl(b, "Close"); else slotsClose(); }   // (the slot machine, left open)
  for (let i = 0; i < 8 && !$("#modal").hidden; i++) {
    if (await answerModal()) continue;
    const m = $("#modal"), b = m.querySelector('[data-act="closeModal"]') || m.querySelector('[data-act="chapter"]') || m.querySelector('[data-act="closeMail"]');
    if (b) await tapEl(b, "close");
    else { const r = ($("#screen") || document.body).getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + 14; await fingerTo(x, y); await fingerTap(x, y); m.click(); await w(150); }
  }
}
async function goTab(v) {
  await closeAllModals();
  if (UI.view === v && $("#view").dataset.v === v) return;
  await tapEl($(`#tabs [data-act="go"][data-v="${v}"]`), v + " tab");
}
// home, with its buttons drawn (if the screen hasn't caught up, tapping the Home tab again redraws it)
async function goHome() {
  await goTab("home");
  if (!actEl("go", { v: "shop" })) await tapEl($('#tabs [data-act="go"][data-v="home"]'), "home tab");
}
// story scenes: let the scene open, then tap SKIP like a player who's seen it
async function skipDialogue() {
  await w(900);
  for (let i = 0; i < 5 && !$("#dlg").hidden && $("#dlg").innerHTML; i++) { await tapEl($("#dSkip"), "SKIP"); await w(120); }
}
// Safari Zone catches and evolutions both play in #gacha
async function gachaTaps() {
  if ($("#evDone")) { await until(() => !$("#evDone") || !$("#evDone").hidden, 8000); await w(900); if ($("#evDone")) await tapEl($("#evDone"), "Continue"); return; }
  if ($("#gT") && !$("#gT").hidden) await tapEl($("#gT"), "the throw");
  await until(() => !$("#gDone") || !$("#gDone").hidden, 8000);
  await w(1100);
  if ($("#gDone")) await tapEl($("#gDone"), "Done");
}
async function settle() {
  for (let i = 0; i < 300; i++) {
    await new Promise(r => setTimeout(r, DEMO.fast ? 0 : 80)); chk(DEMO.gen);
    if (!$("#dlg").hidden && $("#dlg").innerHTML) { await skipDialogue(); continue; }
    if (!$("#gacha").hidden && $("#gacha").innerHTML) { await gachaTaps(); continue; }
    if (BT.on) { await fight(); continue; }
    if (!$("#modal").hidden && await answerModal()) continue;
    if (S.learnQ.length && $("#modal").hidden) { await demoLearn(); continue; }
    return;
  }
}
// "X wants to learn Y!": the Demo brings each question up itself once things are quiet (no battle, no other window) and
// answers it on screen, one at a time, so a question never sits open while it carries on
async function demoLearn() {
  let n = 0;
  while (S.learnQ.length && !BT.on && n++ < 20) {
    chk(DEMO.gen);
    if (!$("#modal").hidden) { if (await answerModal()) continue; await closeAllModals(); }
    if (!learnPrompt()) break;   // the next question (or straight into an empty slot)
    await w(DEMO.fast ? 0 : 900);
    if (!await answerModal()) { closeModal(); break; }
  }
  return n > 0;
}

// ---------- battle ----------
// battles play at the save's battle speed with AUTO on (Expert tactics for the Demo); the Demo's own speed multiplies that
function battleSpeed() { BT.speed = DEMO.fast ? 400 : (S.settings.speed || 1) * DEMO.speed; }
async function fight() {
  await until(() => !BT.on || $("#bAuto"), 5000);
  if (!BT.on) return;
  battleSpeed();
  if (!BT.B.auto) await tapEl($("#bAuto"), "AUTO");
  while (BT.on) {
    chk(DEMO.gen);
    if ($("#rDone")) { await w(1400); if ($("#rDone")) await tapEl($("#rDone"), "Continue"); await new Promise(r => setTimeout(r, 60)); break; }
    // one of its Pokémon fainted: it picks the best matchup against what's on the field, on the same picker you use
    if (BT.benchMode === "replace" && BT.inputRes && $("#bCtl .bnc")) {
      const x = BT.B.aiReplacement("A"), el = x && $(`#bCtl .bnc[data-u="${x.uid}"]`);
      if (el) { dsay("Battle", `Sending out ${x.n}`); await w(DEMO.fast ? 0 : 500); if (BT.benchMode === "replace" && BT.benchPick) { await tapEl(el, x.n, true); BT.benchPick && BT.benchPick(x.uid); } }
    }
    battleSpeed();
    await new Promise(r => setTimeout(r, DEMO.fast ? 0 : 40));
  }
}

// ---------- planning (hidden simulations) ----------
// what really happened: each opponent's battles, by the team it sent (DEMO.record[foes][team] = { w, l }). Real results count
// in every estimate below, twice as much as a simulated battle each, so a team that lost isn't sent again on the same hopes, and
// a loss makes the next plan look wider (squadFor)
const foeKey = waves => waves.flat().map(s => s.op + ":" + (s.LV || (s.prog && s.prog.lvl) || "")).join(",");
const teamKey = ids => ids.map(k => k.op || k).sort().join(",");
const recOf = waves => (DEMO.record || {})[foeKey(waves)] || {};
const lossesVs = waves => Object.values(recOf(waves)).reduce((a, r) => a + r.l, 0);
function demoBattleOver(cfg, res) {
  if (cfg.turnLimit || res.timeUp || !cfg.waves) return;   // Raid Battles are scored by damage, not won or lost
  const R0 = (DEMO.record = DEMO.record || {}), f = (R0[foeKey(cfg.waves)] = R0[foeKey(cfg.waves)] || {}), t = (f[teamKey(cfg.allies)] = f[teamKey(cfg.allies)] || { w: 0, l: 0 });
  if (res.win) t.w++; else if (!res.stalemate) t.l++;
  if (!res.win && !res.stalemate) dsay("Rethinking the team", `Lost with ${cfg.allies.map(s => OPS[s.op].n).join(", ")}`);
}
// The Demo thinks between frames: its planning (a team check is dozens of simulated battles) lets the page draw about every 12 ms,
// so watching it never freezes (a team check after a loss used to stop the screen for 15 seconds)
let DEMO_SLICE = 0;
async function demoBreath() {
  if (performance.now() - DEMO_SLICE < 12) return;
  await new Promise(r => setTimeout(r, 0));
  DEMO_SLICE = performance.now();
}
// (DEMO_CAP: planning a Journey stage, where its Pokémon battle at most at the region's level cap: journeyProg)
let DEMO_CAP = null;
const dprog = k => DEMO_CAP && S.ops[k] && S.ops[k].lvl > DEMO_CAP ? { ...S.ops[k], lvl: DEMO_CAP } : S.ops[k];
const withLv = async (cap, f) => { const was = DEMO_CAP; DEMO_CAP = cap; try { return await f(); } finally { DEMO_CAP = was; } };
const withCap = (nd, f) => withLv(stageCap(nd), f);
async function simRun(ids, waves, n, goal, enemyStyle = "balanced", weather = null) {
  let win = 0, three = 0;
  for (let i = 0; i < n; i++) {
    const B = makeBattle({ allies: ids.map(k => typeof k === "string" ? { op: k, prog: dprog(k) } : k), waves, auto: true, aiStyle: "balanced", enemyStyle: enemyStyle === "expert" ? "balanced" : enemyStyle, weather, sim: true });
    let g = 0; while (!B.over && g++ < 3000) { const r = B.step(); if (r === "input") B.autoAct(); B.ev.length = 0; await demoBreath(); }
    if (B.result && B.result.win) { win++; if (!B.result.lost && (!goal || B.result.turns <= goal)) three++; }
  }
  const real = recOf(waves)[teamKey(ids)];
  if (real) return { win: (win + 2 * real.w) / (n + 2 * (real.w + real.l)), three: three / n * (real.l ? .5 : 1), real };
  return { win: win / n, three: three / n };
}
const byPower = () => Object.keys(S.ops).sort((a, b) => power(b, S.ops[b]) - power(a, S.ops[a]));
const isHealer = k => isMedicK(k);
// How each of our Pokémon matches up against these foes, from the real battle math (stats, levels, IVs, Badges, moves, STAB,
// type matchups, Abilities, held items, weather): off = the share of the foe's HP its best move takes, def = the share of its own
// HP the foe's best move takes, first = whether it moves before the foe.
function matchups(ids, foes, weather) {
  const out = {};
  // each Pokémon on its own against the foes (with all of them on one field, every Ability check looped over dozens of allies: a
  // team check froze the screen for seconds; and one's Drizzle or Friend Guard doesn't count for the others)
  for (const id of ids) Object.assign(out, matchups1(id, foes, weather));
  return out;
}
function matchups1(id, foes, weather) {
  const B = makeBattle({ allies: [{ op: id, prog: dprog(id), mine: true }], waves: [foes], auto: true, weather, sim: true, probe: true });
  for (const u of B.units) for (const k in u.stages) u.stages[k] = 0;   // a probe: no Intimidate on the way in
  const A = B.units.filter(u => u.team === "A"), E = B.units.filter(u => u.team === "E");
  const best = (a, t) => { let m = 0; for (const s of a.skills) if (s.M.c !== "X") m = Math.max(m, Math.max(0, B.estimate(a, t, s)) * (s.slot === 1 ? 1 : .85)); return m; };
  // the type matchup on its own: the best type multiplier among its attacking moves (0 when an Ability absorbs it,
  // 1 for fixed-damage moves like Night Shade) against the foe's best one back
  const eff = (a, t) => { let m = 0; for (const s of a.skills) if (s.M.c !== "X" && B.estimate(a, t, s) > 0) m = Math.max(m, s.pow > 0 ? B.effOn(a, t, s) : 1); return m; };
  const lg = x => Math.log2(Math.max(.25, x));
  const out = {};
  for (const a of A) out[a.key] = E.map(e => ({ off: Math.min(1.5, best(a, e) / e.max.hp), def: Math.min(1.5, best(e, a) / a.max.hp), first: B.effStat.spd(a) > B.effStat.spd(e), boss: e.boss,
    edge: Math.max(-2, Math.min(2, lg(eff(a, e)) - lg(eff(e, a)))) }));
  return out;
}
// one Pokémon's matchup: what it takes off each foe per hit against what it loses per hit (moving first helps both ways), plus
// the type matchup by itself, so a strong Pokémon that's resisted and hit super-effectively (Hitmonlee into Psychic types) stays home
const matchScore = rows => rows.reduce((a, r) => a + (r.boss ? 1.5 : 1) * (r.off * (r.first ? 1.15 : 1) - r.def * (r.first ? .9 : 1.1) + .1 * r.edge), 0) / rows.reduce((a, r) => a + (r.boss ? 1.5 : 1), 0);
// a team's value: each member's matchup, someone who hits every foe hard, and no foe that out-hits most of the team
function teamValue0(team, M, extra) {
  const n = M[team[0]].length;
  let v = team.reduce((a, k) => a + matchScore(M[k]) + (extra[k] || 0), 0) * .6;
  for (let j = 0; j < n; j++) {
    const w = M[team[0]][j].boss ? 1.5 : 1;
    v += .5 * w * Math.max(...team.map(k => M[k][j].off)) / n;
    const weak = team.filter(k => M[k][j].def >= .5).length;
    if (weak > 3) v -= .15 * w * (weak - 3);
  }
  return v;
}
const TEAM_MEMO = new Map();
// six Pokémon for this opponent: the best matchups (not just the highest CP), built greedily, improved by swaps, and the
// strongest few candidate teams checked in quick simulated battles; the three best matchups lead (leadOrder)
async function squadFor(waves, goal, enemyStyle, weather, opts = {}) {
  const own = Object.keys(S.ops).filter(k => !opts.gen || gensOf(k).includes(opts.gen));   // (a Journey stage: its region's Pokémon, journeyOk)
  if (own.length <= ROSTER) return leadKeys(opts.pvp ? pvpTrim(own) : own, waves, weather);   // (Stadium teams: the PvP limits)
  const foes = waves.flat();
  const lost = lossesVs(waves);
  const key = JSON.stringify([foes.map(s => [s.op, s.LV || (s.prog && s.prog.lvl), s.boss ? 1 : 0]), goal, enemyStyle, weather, !!opts.pvp, own.length, own.reduce((a, k) => a + S.ops[k].lvl + S.ops[k].pot + S.ops[k].sk.join("").length, 0), opts.sim === false, opts.gen || 0, DEMO_CAP || 0, lost]);
  if (TEAM_MEMO.has(key)) return TEAM_MEMO.get(key).slice();
  const M = matchups(own, foes, weather);
  const teamValue = (t, M2, ex) => clauseClash(t.map(k => S.ops[k].held)) || (opts.pvp && pvpClash(t)) ? -1e9 : teamValue0(t, M2, ex);   // the Item Clause (and in the Stadium the PvP limits)
  // healers keep the team going in longer fights
  const extra = {}; for (const k of own) extra[k] = isHealer(k) ? .1 : 0;
  const pool = own.slice().sort((a, b) => (matchScore(M[b]) + extra[b]) - (matchScore(M[a]) + extra[a])).slice(0, 12);
  let team = [];
  while (team.length < ROSTER) team.push(pool.filter(k => !team.includes(k)).sort((a, b) => teamValue(team.concat(b), M, extra) - teamValue(team.concat(a), M, extra))[0]);
  // swaps: keep any single swap that makes the team better
  for (let pass = 0; pass < 3; pass++) {
    let improved = false;
    for (let i = 0; i < ROSTER; i++) for (const b of pool) {
      if (team.includes(b)) continue;
      const t2 = team.slice(); t2[i] = b;
      if (teamValue(t2, M, extra) > teamValue(team, M, extra) + 1e-6) { team = t2; improved = true; }
    }
    if (!improved) break;
  }
  let best = team;
  if (opts.sim !== false) {
    // the runners-up: the best team with one member swapped for the next best matchups
    // after a loss to these foes: more runners-up (two swaps too), each checked in more battles
    const alts = [], wide = lost > 0;
    for (let i = 0; i < ROSTER; i++) for (const b of pool.filter(k => !team.includes(k)).slice(0, wide ? 5 : 3)) { const t2 = team.slice(); t2[i] = b; alts.push([t2, teamValue(t2, M, extra)]); }
    if (wide) for (const [t1] of alts.slice().sort((a, b) => b[1] - a[1]).slice(0, 4)) for (let i = 0; i < ROSTER; i++) for (const b of pool.filter(k => !t1.includes(k)).slice(0, 2)) { const t2 = t1.slice(); t2[i] = b; alts.push([t2, teamValue(t2, M, extra)]); }
    const cands = [team, ...alts.sort((a, b) => b[1] - a[1]).slice(0, wide ? 8 : 3).map(x => x[0])];
    let bs = -1;
    for (const c of cands) { const r = await simRun(c, waves, (DEMO.fast ? 3 : 4) + (wide ? 3 : 0), goal, enemyStyle, weather); const sc = r.win + r.three * .5 + teamValue(c, M, extra) * .05; if (sc > bs) { bs = sc; best = c; } }
  }
  best = leadKeys(best, waves, weather);
  TEAM_MEMO.set(key, best.slice());
  if (TEAM_MEMO.size > 300) TEAM_MEMO.delete(TEAM_MEMO.keys().next().value);
  return best;
}
// the Link Battle ban: the opposing pick that does most against its own picks (what it takes off them per hit, against what they
// take off it), not just the strongest Pokémon on paper
function threatBan(mine, theirs) {
  const M = matchups(mine.filter(owned), theirs);
  const threat = j => mine.filter(owned).reduce((a, k) => a + M[k][j].def * (M[k][j].first ? .9 : 1.1) - M[k][j].off * (M[k][j].first ? 1.15 : 1), 0);
  return theirs.map((s, j) => [s.op, threat(j)]).sort((a, b) => b[1] - a[1])[0][0];
}
// a Raid Battle team: the one that deals the most damage to the boss in the turns a Raid Pass gives (its HP is a huge pool,
// so surviving only matters for staying on the field to keep hitting)
function raidSquad(b) {
  const own = Object.keys(S.ops); if (own.length <= ROSTER) return own;
  const foe = { op: b.key, LV: gbLV(b.stage), boss: true }, M = matchups(own, [foe]);
  const rank = own.slice().sort((x, y) => M[y][0].off * (1 + .3 * M[y][0].first) - M[y][0].def * .3 - (M[x][0].off * (1 + .3 * M[x][0].first) - M[x][0].def * .3));
  const dealt = team => { let d = 0; for (let i = 0; i < 2; i++) { R = seeded(hash(team.join() + i));
    const B = makeBattle({ allies: team.map(k => ({ op: k, prog: S.ops[k], mine: true })), waves: [[{ ...foe, maxHp: 1e9 }]], auto: true, aiStyle: "balanced", turnLimit: GB_TURNS, sim: true });
    let g = 0; while (!B.over && g++ < 3000) { const r = B.step(); if (r === "input") B.autoAct(); B.ev.length = 0; }
    const e = B.units.find(u => u.team === "E"); d += e ? 1e9 - e.hp : 0; } R = Math.random; return d; };
  const base = rank.slice(0, ROSTER), cands = [base];
  for (let i = ROSTER - 3; i < ROSTER; i++) for (const k of rank.slice(ROSTER, ROSTER + 2)) { const t = base.slice(); t[i] = k; cands.push(t); }
  return cands.map(t => [t, dealt(t)]).sort((a, b) => b[1] - a[1])[0][0];
}
// a team's lead order against these opponents
const leadKeys = (ids, waves, weather) => settersFirst(leadOrder(ids.map(k => ({ op: k, prog: dprog(k), mine: true })), waves.flat(), weather)).map(s => s.op);
// Pokémon worth investing in: the strongest, rarest few (fully evolved ones first)
function coreOps(n = 7) {
  const P = S.demoPush;
  if (P && P.on && P.roster) return P.roster.filter(owned);
  const score = k => metaScore(k) / 5 + power(k, S.ops[k]) / 2 + (OPS[k].evo.length ? 0 : 800);
  const list = Object.keys(S.ops).sort((a, b) => score(b) - score(a));
  const heal = list.find(isHealer), out = list.slice(0, n);
  if (heal && !out.includes(heal)) out[n - 1] = heal;
  return out;
}
const ndWaves = nd => nodeWaves(nd).map(wv => convWave(wv, nd.lv, journeyG(nd)));
const nodeSquad = nd => withCap(nd, () => squadFor(ndWaves(nd), nodeTurnGoal(nd), "balanced", nd.weather, { gen: journeyGen(nd) }));
const nodeSim = (nd, n, goal) => withCap(nd, async () => simRun(await squadFor(ndWaves(nd), nodeTurnGoal(nd), "balanced", nd.weather, { gen: journeyGen(nd) }), ndWaves(nd), n, goal, "balanced", nd.weather));
const towerWaves = (w, f) => { const T = towerFloor(w, f); return T.waves.map(wv => convWave(wv, T.lv, wingGen(w))); };
// a Tower floor: the wing's region's Pokémon at most at the floor's cap (towerOk, towerCap), as on the team screen
const towerSquad = (w, f) => withLv(towerCap(towerFloor(w, f)), () => squadFor(towerWaves(w, f), 0, "balanced", null, { gen: towerGen(w) }));
const towerSim = (w, f, n) => withLv(towerCap(towerFloor(w, f)), async () => simRun(await squadFor(towerWaves(w, f), 0, "balanced", null, { gen: towerGen(w) }), towerWaves(w, f), n));
// the wing's sixth-best Pokémon's level: a floor waits until six of them reach its cap
const wingLv = w => Object.entries(S.ops).filter(([k]) => towerOk(k, w)).map(([, p]) => p.lvl).sort((a, b) => b - a)[5] || 0;
const failKey = (k, n) => { DEMO.fails[k] = (DEMO.fails[k] || 0) + (n == null ? 1 : n); return DEMO.fails[k]; };   // (n = 0 reads the count)

// ---------- power push: what the Demo does when a Battle Stadium climb stalls ----------
// No rating gain in either ladder for two in-game days turns it on: pick a team of eight for Stadium battles (tested fully
// trained against Trainers a tier up), pour everything into training it, buy held items for it and queue Link Battles often.
// A fully trained team that stays stuck for 60 days ends the run with a "plateaued" report instead of looping forever.
const PUSH_STALL = 2 * 864e5, PUSH_GIVEUP = 60 * 864e5, LEGEND = () => TIERS[TIERS.length - 1].min;
const builtSpec = k => { const p = S.ops[k], ab = p.ab || OPS[k].ab; return { op: k, prog: { ...progForLV(k, 100), pot: p.pot, sk: [MAX_SK, MAX_SK, MAX_SK], held: p.held, ab, nat: p.nat,
  mv: optMoves(k, [...pmv(k), ...levelMoves(k, 100)], ab, p.held, demoPlan().c).mv }, mine: true }; };
async function pvpRoster() {
  const own = Object.keys(S.ops);
  if (own.length <= 10) return own;
  const cands = buildSquad(own, Math.min(16, own.length), 1, () => .5);
  // the battling six: swap in the next best and keep what wins most often, fully trained, a tier up
  const target = Math.min(LEGEND() + 150, Math.max(S.ladder.pts, S.rta.pts) + 300);
  const foes = [0, 1].map(i => npcDoctor("push" + S.lvl, i, ratingQ(target), tierIdx(target)));
  const rate = async ids => { let a = 0; for (const f of foes) a += (await simRun(ids.map(builtSpec), [f.team.map(k => npcSpec(f, k))], DEMO.fast ? 1 : 2, 0, f.ai)).win; return a; };
  let atk = pvpTrim(cands).slice(0, ROSTER), best = await rate(atk);   // (the PvP limits)
  for (const b of cands.slice(ROSTER, ROSTER + 4)) for (let i = 0; i < ROSTER; i++) {
    const v = atk.slice(); v[i] = b; if (v.includes(b) && v.indexOf(b) !== i || pvpClash(v)) continue; const r = await rate(v);
    if (r > best + 1e-9) { best = r; atk = v; }
  }
  const out = atk.concat(cands.filter(k => !atk.includes(k))).slice(0, 10);
  // two healers, so a ban doesn't leave the team without healing
  if (out.filter(isHealer).length < 2) { const m = own.filter(k => isHealer(k) && !out.includes(k)).sort((a, b) => metaScore(b) - metaScore(a))[0]; if (m) out[9] = m; }
  return out;
}
async function pushState() {
  const P = S.demoPush || (S.demoPush = { on: false, peak: 0, since: Date.now(), roster: null, rosterT: 0, rosterN: 0, maxedT: 0, rta: { day: "", n: 0 } });
  const peak = Math.min(S.ladder.best, LEGEND()) + Math.min(S.rta.best, LEGEND());
  if (peak > P.peak + 25) { P.peak = peak; P.since = Date.now(); }
  if (!P.on && Date.now() - P.since > PUSH_STALL && Object.keys(S.ops).length >= 10 && S.champion) {
    P.on = true; P.began = Date.now();
    dsay("Power push", `No Stadium progress for ${Math.round((Date.now() - P.since) / 864e5)} days: building a Stadium team`);
  }
  if (P.on && (!P.roster || Date.now() - P.rosterT > 864e5 || P.rosterN !== Object.keys(S.ops).length)) {
    const old = (P.roster || []).join();
    P.roster = await pvpRoster(); P.rosterT = Date.now(); P.rosterN = Object.keys(S.ops).length;
    if (P.roster.join() !== old) dsay("Power push · Stadium team", P.roster.map(k => OPS[k].n).join(", "));
  }
  return P;
}
const pushOn = () => !!(S.demoPush && S.demoPush.on && S.demoPush.roster);
const opMaxed = k => { const p = S.ops[k]; return p.lvl >= 100 && pmv(k).every((m, j) => !m || p.sk[j] >= MAX_SK) && !!p.held && !OPS[k].evo.length; };
const rosterReady = () => pushOn() && S.demoPush.roster.every(k => S.ops[k].lvl >= Math.min(levelCap(k), 90) && !canEvolveNow(k));

// ---------- time ----------
async function skipTime(ms, why) {
  ms = Math.max(1000, Math.round(ms));
  DEMO.skew += ms; S.demoSkew = DEMO.skew;
  tickTimers(); metaTick(); save();
  // redraw so timers, Tickets and cooldown buttons on screen match the new time
  if ($("#modal").hidden && !BT.on) rerender(); else renderTop();
  const mins = Math.round(ms / 60000), h = Math.floor(mins / 60), m = mins % 60;
  dsay("Time skip: " + why, `+${h ? h + "h " : ""}${m}m on the Demo save`);
  if (DEMO.fast) return;
  const el = document.createElement("div"); el.id = "demoSkip"; el.innerHTML = `<b>⏩ +${h ? h + "h " : ""}${m}m</b><span>${esc(why)}</span>`;
  document.body.appendChild(el);
  await w(1400).finally(() => el.remove());
}
async function ensureSanity(n) {
  tickTimers();
  if (S.sanity >= n) return;
  if (S.prime >= 3) {
    dsay("Restoring PP", "A Max Elixir at the Pokémon Center");
    await closeAllModals();
    await tapEl($('#topbar [data-act="sanity"]'), "PP");
    await tapAct("buy", { t: "elixir", id: "e_pp" }, "Use a Max Elixir");
    await closeAllModals();
    return;
  }
  await skipTime((n - S.sanity) * SAN_MS + 500, `Waiting for PP (${S.sanity} → ${n})`);
}

// ---------- the Trainer's routine ----------
async function claimMissions() {
  if (!featOn("research") || !dailyReady()) return false;
  dsay("Claiming Daily Research");
  await goHome();
  await tapAct("missions", {}, "Research");
  for (let i = 0; i < 12; i++) {
    const b = $$('#modal [data-act="claimDaily"],#modal [data-act="claimAllDaily"]').find(x => !x.disabled);
    if (!b) break;
    await tapEl(b, "Claim");
  }
  await closeAllModals();
  return true;
}
async function claimInbox() {
  // (a Professor's letter that came before Mail opened: answered on the spot, rescueModal, like a player after the loss)
  if (!featOn("mail")) {
    const L = (S.inbox || []).filter(m => m.tag === "rescue" && !m.claimed && m.rewards.pick); if (!L.length) return false;
    for (const m of L) {
      const k = await demoRescue(m);
      dsay("A new partner · " + m.from, `${OPS[k].n}, at Lv ${m.rewards.lv || 5}`);
      await goHome(); rescueModal(m); await w(900);
      await tapAct("pickRescue", { id: m.id, k }, OPS[k].n); await closeAllModals();
    }
    return true;
  }
  if (!unclaimedMail().length) return false;
  dsay("Checking Mail", `${unclaimedMail().length} gifts waiting`);
  await goHome(); await tapAct("inbox", {}, "Mail");
  // (a Professor's letter, journeyLoss: the partner that does best at the battle that held it up, demoRescue)
  for (const m of unclaimedMail().filter(x => x.rewards.pick)) {
    const k = await demoRescue(m);
    dsay("A new partner · " + m.from, `${OPS[k].n}, at Lv ${m.rewards.lv || 5}`);
    await tapAct("openMail", { id: m.id }, m.title); await tapAct("claimMail", { id: m.id }, "Choose your partner");
    await tapAct("pickRescue", { id: m.id, k }, OPS[k].n); await closeAllModals();
  }
  if (unclaimedMail().some(x => !x.rewards.pick)) await tapAct("claimAllMail", {}, "Claim all");
  await closeAllModals();
  return true;
}
// the Professor's partner (rescueModal): the one that wins most at the battle that held it up, in practice battles with the team it
// would join (its type against theirs breaks a tie)
async function demoRescue(m) {
  const id = m.rewards.pick, opts = rescueOptions(id), f = DEMO.focus && NODES[DEMO.focus], nd = f && f.ep.id === id && !nodeStars(f.id) ? f : nextNode();
  if (opts.length < 2 || !nd || !isBattleNode(nd) || nd.ep.id !== id) return opts[0];
  const lv = Math.min(100, m.rewards.lv || 5), base = (await nodeSquad(nd)).slice(0, ROSTER - 1), foes = ndWaves(nd).flat();
  const vs = k => foes.reduce((a, s) => a + Math.max(...OPS[k].types.map(t => typeEff(t, OPS[s.op].types))), 0) / Math.max(1, foes.length);
  let best = opts[0], bw = -1;
  for (const k of opts) {
    const team = [{ op: k, prog: { ...progForLV(k, lv), held: "berryjuice", pot: 3 } }, ...base];
    const r = await withCap(nd, () => simRun(team, ndWaves(nd), 8, 0, "balanced", nd.weather));
    const v = r.win + vs(k) * .001; if (v > bw) { bw = v; best = k; }
  }
  return best;
}
async function buy(tab, id, label) {
  if (UI.view !== "shop") { await goHome(); await tapAct("go", { v: "shop" }, "Shops"); }
  if (UI.shopTab !== tab) await tapAct("shopTab", { t: tab }, SHOP[tab].n);
  dsay("Shopping", label);
  await tapAct("buy", { t: tab, id }, label); await closeAllModals();
}
const shopItem = (tab, id) => SHOP[tab].items.find(x => x.id === id);
// an evolution item from the Poké Mart (the held ones too: King's Rock, Metal Coat, Razor Claw, Razor Fang), keeping `keep` Poké Dollars
async function evoBuy(item, keep) {
  const m = shopItems(SHOP.mart).find(x => x.give[item] || x.give.held === item && x.evo);
  if (!m || !affords("mart", m.id, keep)) return false;
  await buy("mart", m.id, m.n); return true;
}
const affords = (tab, id, keep = 0) => shopOn(tab) && !!shopItems(SHOP[tab]).find(x => x.id === id) && have(SHOP[tab].cur) - shopItem(tab, id).cost >= keep;   // (only Shops tabs that have opened)
// Pokémon missing from the Pokédex, and the owned Pokémon that can still evolve into one
const dexMissing = () => OP_KEYS.filter(k => !S.dex.caught[k]);
function dexEvolutions() {
  const out = [];
  for (const k of Object.keys(S.ops)) for (const e of OPS[k].evo) if (!S.dex.caught[e.to] && regionOk(e.to)) out.push({ k, ...e });
  return out;
}
// ---------- builds: everything a core Pokémon has, chosen together (a6h_build.js) ----------
// Moves from what it can get now (what it knows, the Move Reminder, the TM Case and the Mart's six TMs), the Ability and moves
// that work best together, the nature for those moves (a Mint), and held items shared out over the team (one per copy owned,
// the Item Clause per team). All judged against what the Trainers near its rating use, with the weather or Trick Room its
// team sets up.
const tmFor = (k, m) => OPS[k].tms.filter(n => TM_MOVE[n] === m);
function demoPool(k) {
  const stock = new Set(featOn("tm") ? tmStock() : []);   // (the TM corner opens in Celadon)
  const tutor = featOn("tutor") && (S.inv.heartscale > 0 || S.lmd >= 5000 + 12000) ? [...OPS[k].egg, ...OPS[k].tutor] : [];   // (the Move Tutor: a Heart Scale it has or can buy)
  return [...pmv(k).filter(Boolean), ...levelMoves(k, S.ops[k].lvl),
    ...OPS[k].tms.filter(n => S.tms[n] > 0 || (stock.has(n) && S.lmd - tmPrice(n) >= 12000)).map(n => TM_MOVE[n]).filter(Boolean), ...tutor];
}
let PLAN = null;
// who the Demo plans its moves and held items against (demoPlan): the Stadium's Trainers near its rating once Ranked Battles are
// open; before that the Journey's next battle that sets the level cap (the Gym Leader or rival ahead), and any time a Journey battle
// it's held up at (DEMO.focus, set when its odds there are too low to try: progress) until it's beaten. (Planning for a Stadium it
// couldn't enter yet gave a lone Lv 5 starter the Silk Scarf over its Berry Juice for Route 29, and Mudkip Rock Throw over Water Gun
// for Roxanne: the owner's Demo watch, 2026-10-15)
function demoFoes() {
  const f = DEMO.focus && NODES[DEMO.focus], cb = !featOn("ranked") && capBattle();
  return f && !nodeStars(f.id) ? f : cb ? cb.nd : null;
}
const stageMeta = nd => stageMeta.id === nd.id ? stageMeta.v
  : (stageMeta.id = nd.id, stageMeta.v = metaOf(ndWaves(nd).flat().map(s => ({ k: s.op, mv: s.moves || movesOf(s.op, { lvl: s.LV }), ab: OPS[s.op].ab, held: s.held }))));
const stageCover = nd => ndWaves(nd).flat().map(s => OPS[s.op].types);   // (their types: what the plan's attacks are judged against)
function demoPlan() {
  const team = coreOps(), sig = JSON.stringify([team.map(k => [k, S.ops[k].lvl, S.ops[k].mv, S.ops[k].ab, S.ops[k].held]), S.tms, featOn("tm") && tmStock(), S.lmd >= 12000, S.held,
    S.ladder && S.ladder.pts, S.rta && S.rta.pts, !!nextNode(), (demoFoes() || {}).id]);
  if (PLAN && PLAN.sig === sig) return PLAN;
  // (journey: a Journey still goes on, whose normal stages give a held item back every wave; lvl: each Pokémon's own level, what a
  // fixed heal like the starter's Berry Juice is worth at: itemValue0)
  const fo = demoFoes(), meta = fo ? stageMeta(fo) : playerMeta(), journey = !!nextNode(), cover = fo ? stageCover(fo) : undefined;
  let c = { meta, journey, cover, team: team.map(k => ({ k, ab: S.ops[k].ab || OPS[k].ab, mv: pmv(k) })) }, builds;
  // twice: the second time knowing what weather (or Trick Room) the team sets up
  for (let pass = 0; pass < 2; pass++) {
    builds = team.map(k => ({ k, ...bestBuild(k, { ...c, pool: demoPool(k), held: S.ops[k].held }), lvl: S.ops[k].lvl }));
    c = { meta, journey, cover, team: builds, wx: teamWeather(builds), tr: builds.some(x => x.mv.includes("trickroom")) };
  }
  for (const x of builds) {
    x.nat = optNature(x.k, x.mv, x.ab, c);
    x.abGain = abilityScore(x.k, x.ab, x.mv, c) - abilityScore(x.k, S.ops[x.k].ab || OPS[x.k].ab, x.mv, c);
  }
  const V = itemTable(builds, c);
  PLAN = { sig, c, team, b: Object.fromEntries(builds.map(x => [x.k, x])), V, items: shareItems(V, h => S.held[h] || 0) };
  return PLAN;
}
// held items worth buying, most useful first: what each would add to the team's items (BP Exchange or Poké Mart)
function itemsToBuy() {
  const P = demoPlan(), out = [];
  for (const tab of ["bp", "mart"].filter(shopOn)) for (const x of SHOP[tab].items) {
    const h = x.give && x.give.held; if (!h || !HELD[h]) continue;
    const gain = shareItems(P.V, y => (S.held[y] || 0) + (y === h ? 1 : 0)).v - P.items.v;
    if (gain > .015) out.push({ tab, x, h, gain });
  }
  return out.sort((a, b) => b.gain - a.gain);
}
async function shopping() {
  let did = false;
  // Pokédex: Prize Corner Pokémon not caught yet, then stones and Linking Cords that evolve something new
  for (const it of SHOP.prize.items.filter(x => x.give.op && !S.dex.caught[x.give.op])) if (affords("prize", it.id)) { await buy("prize", it.id, it.n); did = true; }
  // (one stone per Pokémon: Eevee can only use one, so a core Eevee gets the stone for its strongest form)
  const core = coreOps(), seenK = new Set(), seenItem = new Set();
  const evos = [...core.flatMap(k => OPS[k].evo.filter(e => e.item && metaScore(e.to) > metaScore(k)).sort((a, b) => metaScore(b.to) - metaScore(a.to)).map(e => ({ k, ...e }))), ...dexEvolutions()]
    .filter(e => {
      if (!e.item || seenK.has(e.k)) return false;
      seenK.add(e.k); if (evoHave(e.item, S.ops[e.k]) > 0 || seenItem.has(e.item)) return false;
      seenItem.add(e.item); return true;
    });
  for (const e of evos) {
    if (await evoBuy(e.item, e.item === "linkcord" ? (pushOn() ? 30000 : 0) : 10000)) did = true;
  }
  // Mints and Ability items for the plan's natures and Abilities (used from the Summary in demoMoves): the whole core
  for (const k of demoPlan().team) {
    const b = demoPlan().b[k]; if (!b) continue;
    const n = b.nat, mid = "m_mint_" + n, it = (S.ops[k].ab || OPS[k].ab) !== b.ab && b.abGain >= .02 && abilityItemFor(k, b.ab);
    if (n && S.ops[k].nat !== n && !(S.inv["mint_" + n] > 0) && affords("mart", mid, 30000)) { await buy("mart", mid, ITEMS["mint_" + n].n); did = true; }
    if (it && !(S.inv[it] > 0)) { const id = it === "abilitycapsule" ? "b_capsule" : "b_patch"; if (affords("bp", id, 0)) { await buy("bp", id, ITEMS[it].n); did = true; } }
  }
  // held items: the ones that add most to the team (one copy can only go to one Pokémon; the Item Clause counts per team)
  for (let i = 0; i < 4; i++) {
    const w = itemsToBuy().find(w => affords(w.tab, w.x.id, w.tab === "mart" ? 10000 : 0)); if (!w) break;
    await buy(w.tab, w.x.id, w.x.n); did = true;
  }
  // Seeds of Mastery as the core's moves need them, and Exp. Candy with spare Poké Dollars
  const seedsNeeded = coreOps().reduce((a, k) => a + S.ops[k].sk.reduce((b, s, i) => b + (pmv(k)[i] && s < MAX_SK ? skillCost(s).summ : 0), 0), 0);
  for (let i = 0; i < 4 && (S.inv.summ || 0) < Math.min(8, seedsNeeded) && affords("mart", "m_seed", 30000); i++) { await buy("mart", "m_seed", "Seed of Mastery"); did = true; }
  for (let i = 0; i < 3 && affords("mart", "m_c3", 60000) && coreOps().some(k => S.ops[k].lvl < levelCap(k)); i++) { await buy("mart", "m_c3", "Exp. Candy L"); did = true; }
  // spare Coins become Safari Balls
  for (let i = 0; i < 6 && affords("prize", "p_permit", 40); i++) { await buy("prize", "p_permit", "Safari Ball"); did = true; }
  return did;
}
// the area to throw in: the one with the most featured Pokémon still missing from the Pokédex (during the push: the best for the team)
function bannerValue(b) {
  const miss = k => S.dex.caught[k] ? 0 : 1;
  const dex = b.feat6.reduce((a, k) => a + 3 * miss(k), 0) + b.feat5.reduce((a, k) => a + miss(k), 0) + b.feat4.reduce((a, k) => a + .3 * miss(k), 0);
  const meta = Math.max(...b.feat6.map(k => (S.ops[k] && S.ops[k].pot >= 6 ? 0 : metaScore(k) * (S.ops[k] ? .35 : 1)))) / 4000;
  return pushOn() ? meta * 3 + dex * .3 : dex + meta;
}
// (event areas count too: a Legendary Safari or a Mythical Distribution is often the best; ticket and Step-Up areas have their
// own rules below)
const bestBanner = () => safariAreas().filter(a => !a.std && !a.step).sort((a, b) => bannerValue(b) - bannerValue(a))[0] || STD_BANNER;   // (the Whole Park alone until every region is done)
function bannerWanted() {
  const b = bestBanner(), P = S.demoPush, weakest = Math.min(...P.roster.map(metaScore));
  return b.feat6.some(k => !(S.ops[k] && S.ops[k].pot >= 6) && (metaScore(k) > weakest || (!!S.ops[k] && P.roster.includes(k)) || !S.dex.caught[k]));
}
// Gem throws wait for a Gem Consumption or Safari Rush that starts within two days (it pays more for the same Gems); Safari
// Balls and Passes don't wait
const rushSoon = () => { const now = Date.now(), on = eventsNow().some(e => e.type === "rush" && (e.key === "gems" || e.key === "safari"));
  return !on && eventsBetween(now, now + 2 * DAY).some(e => e.type === "rush" && (e.key === "gems" || e.key === "safari") && e.start > now); };
async function demoHeadhunt() {
  if (!featOn("safari")) return false;
  const stash = S.permit + Math.floor(S.orundum / 600);
  const free10 = (S.inv.free10 || 0) > 0, master = (S.inv.gold5 || 0) > 0;
  let ten = free10 || S.permit >= 10 || (S.orundum >= 6000 && !rushSoon());
  // Safari Balls and tickets only ever go ten at a time (the owner's rule): the one ×1 is the day's first throw for Daily Research,
  // and only when it's paid with Gems (60, nothing it would rather keep for a ×10)
  const one = !S.daily.hh && (c => c.ok && c.cur === "orundum" && c.disc)(throwCost(bestBanner(), 1));
  // during the push: ×10 only in an area whose featured 5★ would help the team (or when the stash is overflowing)
  if (ten && !free10 && pushOn() && !bannerWanted() && stash < 40) ten = false;
  // an event area's own tickets go there first (Great Ball Tickets, Ultra Ball Tickets, Mystic Tickets), ten at a time
  const tk = eventAreas().find(a => a.ticket && (S.inv[a.ticket] || 0) >= 10);
  if (tk) {
    const n = 10;
    await goTab("hh"); dsay("Safari Zone", `${ITEMS[tk.ticket].n}s in ${tk.n}`);
    if (UI.hhB !== tk.id) await tapAct("hhBanner", { b: tk.id }, tk.n);
    await tapAct("pull", { n }, "Throw"); await settle(); return true;
  }
  // a Step-Up: every step is worth it (each guarantees more than a plain ×10 for less or the same), unless a Gem rush is coming
  const up = eventAreas().find(a => a.step && STEP_UP[stepOf(a)]);
  if (up && !rushSoon() && S.orundum >= STEP_UP[stepOf(up)].cost + 1200) {
    await goTab("hh"); dsay("Safari Zone", `${up.n}: step ${stepOf(up) + 1}`);
    if (UI.hhB !== up.id) await tapAct("hhBanner", { b: up.id }, up.n);
    await tapAct("pull", { n: 10 }, "Step-Up"); await settle(); return true;
  }
  if (!ten && !one && !master) return false;
  const B = bestBanner();
  await goTab("hh");
  if (master) { dsay("Safari Zone", "Throwing the Master Ball"); await tapAct("pullGold5", {}, "Master Ball"); await settle(); return true; }
  dsay("Safari Zone", (ten ? (free10 ? "Safari Pass: 10 free throws" : "×10") : "×1 for Daily Research (the day's 60-Gem throw)") + ` in ${B.n}${B.feat6.length ? ` (${B.feat6.map(k => OPS[k].n).join(" & ")})` : ""}`);
  if (UI.hhB !== B.id) await tapAct("hhBanner", { b: B.id }, B.n);
  if (ten && free10) await tapAct("pullFree10", {}, "Safari Pass");
  else await tapAct("pull", { n: ten ? 10 : 1 }, "Throw");
  await settle();
  // enough Safari Points for the area's featured 5★: trade them (the one the team or the Pokédex wants most)
  const sp = (S.gacha.spark || {})[B.id] || 0;
  if (sp >= SPARK && B.feat6.length) {
    const k = B.feat6.slice().sort((a, c) => (S.dex.caught[c] ? 0 : 5000) + metaScore(c) - (S.dex.caught[a] ? 0 : 5000) - metaScore(a))[0];
    dsay("Safari Points", `Trading ${SPARK} for ${OPS[k].n}`); await tapAct("spark", { k }, "Trade"); await settle();
  }
  return true;
}
async function openOp(k, tab) {
  if (!(UI.view === "op" && UI.arg === k)) {
    await goTab("ops");
    if (UI.all) await tapAct("toggleAll", {}, "Owned");
    if (UI.cls !== "all") await tapAct("clsf", { c: "all" });
    if (UI.el !== "all") await tapAct("elf", { e: "all" });
    await tapAct("go", { v: "op", a: k }, OPS[k].n);
  }
  if (UI.opTab !== tab) await tapAct("opTab", { t: tab }, tab + " tab");
}
// stones the core (its strongest forms) and the Pokédex (forms still missing) are waiting for: a spare Pokémon leaves them be
function stonesWanted() {
  const want = {}, add = (k, l) => { const e = l.filter(e => e.item)[0]; if (e) want[e.item] = (want[e.item] || 0) + 1; };
  for (const k of coreOps()) add(k, OPS[k].evo.filter(e => metaScore(e.to) > metaScore(k)).sort((a, b) => metaScore(b.to) - metaScore(a.to)));
  for (const k of Object.keys(S.ops)) add(k, OPS[k].evo.filter(e => !S.dex.caught[e.to]));
  return want;
}
// evolve: into a form missing from the Pokédex first, otherwise into the strongest option. `spare`: a Pokémon outside the core
// that can evolve now evolves anyway (into one it already has, the two merge: IVs +1), without taking a stone someone waits for
async function evolveOp(k, spare = false) {
  let opts = evoOptions(k).filter(o => o.ok);
  if (spare) {
    // (not into one it already has at perfect IVs with a higher level and Mastery: that merge can't raise anything)
    const keep = stonesWanted(), gain = o => { const ex = S.ops[o.to], p = S.ops[k]; return !ex || ex.pot < 6 || ex.lvl < p.lvl || ex.sk.some((v, j) => v < (p.sk[j] || 1)); };
    opts = opts.filter(o => (!o.item || evoHave(o.item, S.ops[k]) > (keep[o.item] || 0)) && gain(o));
  }
  if (!opts.length) return null;
  const core = coreOps().includes(k), miss = opts.filter(o => !S.dex.caught[o.to]), best = l => l.slice().sort((a, b) => metaScore(b.to) - metaScore(a.to))[0];
  // a core Pokémon evolves into its strongest form (Eevee into the best of the ones it can); anyone else evolves to fill the Pokédex
  const o = core ? best(opts.filter(o => metaScore(o.to) > metaScore(k))) : miss[0] || (spare ? best(opts) : null);
  if (!o) return null;
  dsay(`What? ${OPS[k].n} is evolving!`, `${OPS[k].n} → ${OPS[o.to].n}${o.item ? " with " + an(evoItemName(o.item)) : ""}${S.ops[o.to] ? ": it joins the one you have, IVs up" : ""}`);
  await openOp(k, "evo"); await tapAct("evolve", { k, to: o.to }, "Evolve");
  await settle();
  return o.to;
}
// Rare Candies (a level each, from the Train tab): spent on the core once the Exp. Candy runs out, and on anyone a level or two
// short of an evolution it wants
async function rareCandies(k, n, why) {
  n = Math.min(n, S.inv.rare || 0, levelCap(k) - S.ops[k].lvl);
  if (n <= 0) return false;
  dsay(why + " · " + OPS[k].n, `${n} Rare Cand${n > 1 ? "ies" : "y"}: Lv ${S.ops[k].lvl} → ${S.ops[k].lvl + n}`);
  await openOp(k, "upgrade");
  for (let i = 0; i < n; i++) await tapAct("rec", { k, it: "rare" }, "Rare Candy", true);
  return true;
}
// its next evolution by level that the level cap allows: the form, and how many levels short it is
const evoGap = k => { const p = S.ops[k], e = OPS[k].evo.filter(e => e.lv && e.lv > p.lvl && e.lv <= levelCap(k)).sort((a, b) => a.lv - b.lv)[0]; return e ? { to: e.to, n: e.lv - p.lvl } : null; };
async function upgradeOp(k) {
  if (!S.ops[k]) return false;
  const p = S.ops[k], op = OPS[k]; let did = false;
  // level with Exp. Candy
  if (p.lvl < levelCap(k) && ["rec1", "rec2", "rec3", "rec4"].some(i => S.inv[i] > 0)) {
    dsay("Leveling " + op.n, `Lv ${p.lvl} → up to ${levelCap(k)}`);
    await openOp(k, "upgrade"); await tapAct("autoLv", { k }, "Auto"); did = true;
  }
  // Rare Candies: to reach an evolution that's a level or two away (a new Pokédex entry or a stronger form), or once the
  // Exp. Candy has run out
  const gap = evoGap(k);
  if (gap && gap.n <= 2 && (S.inv.rare || 0) >= gap.n && (!S.dex.caught[gap.to] || metaScore(gap.to) > metaScore(k))) { if (await rareCandies(k, gap.n, "Rare Candy")) did = true; }
  else if (p.lvl < levelCap(k) && !["rec1", "rec2", "rec3", "rec4"].some(i => S.inv[i] > 0) && (S.inv.rare || 0) > 0) { if (await rareCandies(k, 5, "Rare Candy")) did = true; }
  const to = await evolveOp(k);
  if (to) { k = to; did = true; }
  const q = S.ops[k], O = OPS[k]; pmv(k);
  // Mastery: the moves that do the most first (S1 is used every turn); keep Poké Dollars for evolutions
  const use = j => q.mv[j] && MOVES[q.mv[j]] ? Math.max(0, moveIn(k, q.mv[j], q.ab, q.held, demoPlan().c)) * SLOT_USE[j + 1] : 0;
  for (let n = 0; n < 4; n++) {
    const i = [0, 1, 2].filter(j => q.mv[j] && q.sk[j] < MAX_SK && (S.inv.summ || 0) >= skillCost(q.sk[j]).summ && S.lmd - skillCost(q.sk[j]).lmd >= 6000).sort((a, b) => use(b) - use(a))[0];
    if (i == null) break;
    dsay("Raising Mastery · " + O.n, `${MOVES[q.mv[i]].n} → rank ${RANK[q.sk[i] + 1]}`);
    await openOp(k, "skills"); await tapAct("skUp", { k, i }, "Mastery up"); did = true;
  }
  // held item: the team plan's pick, taken off a Pokémon the plan gives something else (or nothing) first
  const it = demoPlan().items[k];
  if (it && q.held !== it) {
    const from = heldFree(it) > 0 ? null : Object.keys(S.ops).find(x => x !== k && S.ops[x].held === it && demoPlan().items[x] !== it);
    if (from) { dsay("Held item · " + OPS[from].n, "Taking the " + HELD[it].n); await openOp(from, "item"); await tapAct("unhold", { k: from }, "Take"); }
    dsay("Held item · " + O.n, HELD[it].n);
    if (heldFree(it) > 0) { await openOp(k, "item"); await tapAct("hold", { k, it }, "Give"); did = true; }
  }
  return did;
}
// IVs: evolving a Pokémon into a species you already have merges the two, IVs +1 (evolve in a6_state.js). A Charmander caught
// after Charizard, trained to Lv 36 (Charmeleon on the way), gives Charizard +1; a spare Pikachu and a Thunder Stone give Raichu +1.
// For the core below perfect IVs, with Pokémon on no team; Exp. Candy only once the core is at the level cap.
function mergeTargets() {
  const core = coreOps(), onTeam = new Set([...Object.values(S.team).flat(), S.assistant]), out = [];
  const path = (k, to, d = 0) => { for (const e of OPS[k].evo) { if (e.to === to) return [e]; if (d < 2) { const p = path(e.to, to, d + 1); if (p) return [e, ...p]; } } return null; };
  for (const k of Object.keys(S.ops)) {
    if (core.includes(k) || onTeam.has(k)) continue;
    const c = core.filter(c => S.ops[c].pot < 6 && path(k, c)).sort((a, b) => metaScore(b) - metaScore(a))[0];
    if (c) out.push({ k, c, e: path(k, c)[0] });
  }
  // nearest first: can evolve now, then a stone to buy, then a few levels
  const cost = x => evoOptions(x.k).some(o => o.to === x.e.to && o.ok) ? 0 : x.e.item ? 1 : 2 + (x.e.lv - S.ops[x.k].lvl) / 10;
  return out.sort((a, b) => cost(a) - cost(b));
}
async function mergeEvolve() {
  let did = false;
  const capped = coreOps().every(k => S.ops[k].lvl >= levelCap(k));
  for (const { k, c, e } of mergeTargets().slice(0, 3)) {
    if (!S.ops[k] || !S.ops[c] || S.ops[c].pot >= 6) continue;
    const ready = () => evoOptions(k).some(o => o.to === e.to && o.ok);
    if (!ready() && e.item) {
      await evoBuy(e.item, 30000);
    }
    if (!ready() && e.lv && e.lv <= levelCap(k)) {
      const gap = e.lv - S.ops[k].lvl;
      if (gap <= 3 && (S.inv.rare || 0) >= gap + 5) { if (await rareCandies(k, gap, `Rare Candy for ${OPS[c].n}'s IVs`)) did = true; }
      else if (capped && ["rec1", "rec2", "rec3", "rec4"].some(i => S.inv[i] > 0)) {
        dsay(`Training ${OPS[k].n} for ${OPS[c].n}'s IVs`, `evolves at Lv ${e.lv}`);
        await openOp(k, "upgrade"); await tapAct("autoLv", { k }, "Auto"); did = true;
      }
    }
    if (!ready()) continue;
    dsay(`What? ${OPS[k].n} is evolving!`, e.to === c ? `It joins the ${OPS[c].n} you have: IVs up` : `${OPS[k].n} → ${OPS[e.to].n}, on the way to ${OPS[c].n}`);
    await openOp(k, "evo"); await tapAct("evolve", { k, to: e.to }, "Evolve"); await settle(); did = true;
  }
  return did;
}
// everyone else who can evolve now (the level reached, or a spare stone in the Bag) does, like any Trainer would; a few a visit
async function evolveReady() {
  let did = false, n = 0;
  const core = coreOps();
  for (const k of Object.keys(S.ops)) {
    if (n >= 6) break;
    if (!S.ops[k] || core.includes(k) || !canEvolveNow(k)) continue;
    if (await evolveOp(k, true)) { did = true; n++; }
  }
  return did;
}
// Pokédex work: evolve anyone (not just the core) into forms that are still missing
async function dexEvolve() {
  let did = false;
  const soon = e => !S.ops[e.k] ? 3 : evoOptions(e.k).some(o => o.to === e.to && o.ok) ? 0 : e.lv && e.lv <= levelCap(e.k) && e.lv - S.ops[e.k].lvl <= 2 ? 1 : 2;
  for (const e of dexEvolutions().sort((a, b) => soon(a) - soon(b)).slice(0, 4)) {
    if (!S.ops[e.k] || S.dex.caught[e.to]) continue;
    if (evoOptions(e.k).some(o => o.to === e.to && o.ok)) { if (await evolveOp(e.k)) did = true; }
    else if (e.lv && e.lv <= levelCap(e.k) && e.lv - S.ops[e.k].lvl <= 2 && (S.inv.rare || 0) >= e.lv - S.ops[e.k].lvl) {
      if (await rareCandies(e.k, e.lv - S.ops[e.k].lvl, "Rare Candy for the Pokédex")) { did = true; if (await evolveOp(e.k)) did = true; }
    }
    else if (e.lv && S.ops[e.k].lvl < levelCap(e.k) && ["rec1", "rec2", "rec3", "rec4"].some(i => S.inv[i] > 0)) {
      dsay("Training for the Pokédex", `${OPS[e.k].n} evolves at Lv ${e.lv}`);
      await openOp(e.k, "upgrade"); await tapAct("autoLv", { k: e.k }, "Auto"); did = true;
    }
  }
  return did;
}

// ---------- Clubs and the Union Room ----------
async function openGuild(tab) {
  if (UI.view !== "guild") { await goHome(); await tapAct("go", { v: "guild" }, "Club"); }
  if (tab && myGuild() && (UI.gTab || "members") !== tab) await tapAct("gTab", { t: tab }, tab);
}
// join a Club early on, contribute every day and use both Raid Passes
async function guildRoutine() {
  if (S.lvl < 8 || !featOn("club")) return false;
  if (!S.guild) {
    if ((S.gLeft && Date.now() - S.gLeft < 3600e3) || (S.gReq || []).length || DEMO.guildTry === today()) return false;
    DEMO.guildTry = today();
    await openGuild();
    const inv = actEl("ginvAccept");
    if (inv && !inv.disabled) { dsay("Clubs", "Accepting an invitation"); await tapEl(inv, "Accept"); return true; }
    const btn = $$('[data-act="gjoin"]').find(b => !b.disabled);
    if (btn) { const g = guildById(btn.dataset.g); dsay(g.pol === "open" ? "Joining a Club" : "Asking to join a Club", `${g.name} [${g.tag}]`); await tapEl(btn, "Join"); return true; }
    return false;
  }
  const g = myGuild(); let did = false;
  if (!(g.don && g.don.day === today() && g.don.by[-1])) {
    const d = S.prime > 20 ? "prime" : S.orundum > 30000 ? "oru" : S.lmd > 60000 ? "lmd" : null;
    if (d) { dsay("Club contribution", g.name); await openGuild("donate"); await tapAct("gdonate", { id: d }, "Give"); await closeAllModals(); did = true; }
  }
  for (let k = 0; k < 2 && gbTriesLeft() > 0 && Object.keys(S.ops).length >= 2; k++) {
    const b = gBoss(g), waves = [[{ op: b.key, LV: gbLV(b.stage), boss: true }]];
    dsay("Raid Battle", `${OPS[b.key].n} · stage ${b.stage}`);
    await openGuild("boss");
    await tapAct("gbossGo", {}, "Join the Raid");
    await pickSquad(raidSquad(b)); await settle(); await closeAllModals();
    did = true;
  }
  return did;
}
// a quick hello in the Union Room once a day, typed like a person would
const DEMO_HELLO = ["hi all", "morning trainers", "o/ hello everyone", "good luck with your throws today", "anyone else exploring Mt. Moon today?", "gl in ranked everyone", "back for my daily research"];
async function chatHello() {
  if (S.demoChat === today() || !featOn("chat")) return false;
  S.demoChat = today();
  dsay("Union Room", "Saying hello");
  await goHome(); await tapAct("go", { v: "chat" }, "Union Room");
  if (chatTabKey() !== "world") await tapAct("chatTab", { t: "world" }, "Union Room");
  const inp = $("#cin"); if (!inp) return false;
  await tapEl(inp, "chat box");
  const msg = pick(DEMO_HELLO);
  for (const ch of msg) { inp.value += ch; if (!DEMO.fast) await w(45); }
  await tapAct("chatSend", {}, "Send");
  await w(3500);
  return true;
}
// moves: each core Pokémon works toward the plan's set (demoPlan): the Move Reminder for level-up moves, the TM Case, or a TM
// from the Mart's six, whenever the change makes its set at least 2% better; then the plan's Mints and Ability items
async function demoMoves() {
  let did = false;
  const P = demoPlan(), core = P.team;
  for (const k of core) {
    const b = P.b[k]; if (!b) continue;
    for (let s = 0; s < 3; s++) {
      const cur = pmv(k), m = b.mv[s], p = S.ops[k];
      if (!m || cur[s] === m || cur.includes(m)) continue;
      const next = cur.slice(); next[s] = m;
      if (setValue(k, next, p.ab || OPS[k].ab, p.held, P.c) < setValue(k, cur, p.ab || OPS[k].ab, p.held, P.c) * 1.02) continue;
      const was = cur[s] ? MOVES[cur[s]].n + " → " : "";
      if (remindable(k).includes(m)) {
        if (S.lmd - REMIND_COST[s + 1] < 8000) continue;
        dsay("Move Reminder · " + OPS[k].n, was + MOVES[m].n);
        await openOp(k, "skills"); await tapAct("remind", { k }, "Move Reminder"); await tapAct("remindDo", { k, m }, MOVES[m].n); await closeAllModals(); did = true; continue;
      }
      if (featOn("tutor") && tutorable(k).includes(m)) {   // (the Move Tutor: a Heart Scale it has, or one from the Poké Mart)
        if (!(S.inv.heartscale > 0)) { if (!affords("mart", "m_heartscale", 12000)) continue; await buy("mart", "m_heartscale", "Heart Scale"); }
        dsay("Move Tutor · " + OPS[k].n, was + MOVES[m].n);
        await openOp(k, "skills"); await tapAct("tutor", { k }, "Move Tutor"); await tapAct("tutorDo", { k, m }, MOVES[m].n); await closeAllModals(); did = true; continue;
      }
      const own = tmFor(k, m).find(n => S.tms[n] > 0 && tmFits(k, n));
      if (own) {
        dsay("TM Case · " + OPS[k].n, `${tmName(own)} ${was}${MOVES[m].n}`);
        await openOp(k, "skills"); await tapAct("tmCase", { k }, "Use a TM"); await tapAct("tmTeach", { k, n: own }, "Teach"); await closeAllModals(); did = true; continue;
      }
      const n = featOn("tm") && tmFor(k, m).find(n => tmStock().includes(n) && tmFits(k, n));
      if (n && S.lmd - tmPrice(n) >= 12000) {
        if (UI.view !== "shop") { await goHome(); await tapAct("go", { v: "shop" }, "Shops"); }
        if (UI.shopTab !== "tm") await tapAct("shopTab", { t: "tm" }, "TMs");
        dsay("Buying a TM · " + OPS[k].n, `${tmName(n)} ${was}${MOVES[m].n}`);
        await tapAct("buyTM", { n }, tmName(n));
        if (actEl("tmTeach", { k, n })) await tapAct("tmTeach", { k, n }, OPS[k].n);
        await closeAllModals(); did = true;
      }
    }
  }
  // Mints and Ability items it bought
  for (const k of core) {
    const b = demoPlan().b[k]; if (!b) continue;
    const n = b.nat, ab = b.ab, it = (S.ops[k].ab || OPS[k].ab) !== ab && b.abGain >= .02 && abilityItemFor(k, ab);
    if (S.ops[k].nat !== n && S.inv["mint_" + n] > 0) {
      dsay("Mint · " + OPS[k].n, `${natName(S.ops[k].nat)} → ${natName(n)}`);
      await openOp(k, "info"); await tapAct("mint", { k }, "Use a Mint"); await tapAct("mintUse", { k, n }, ITEMS["mint_" + n].n); await closeAllModals(); did = true;
    }
    if (it && S.inv[it] > 0) {
      dsay(ITEMS[it].n + " · " + OPS[k].n, `${abilityOf(S.ops[k].ab || OPS[k].ab).name} → ${abilityOf(ab).name}`);
      await openOp(k, "info"); await tapAct("abItem", { k, it }, ITEMS[it].n); await tapAct("abUse", { k, it, a: ab }, abilityOf(ab).name); await closeAllModals(); did = true;
    }
  }
  return did;
}
// the hourly Recharge, the daily VIP gift and every event milestone it has reached (the Event Center)
async function demoLive() {
  if (!featOn("events")) return false;
  let did = false;
  const open = async t => { if (UI.view !== "events") { await goHome(); await tapAct("events", {}, "Events"); } if ((UI.evTab || "now") !== t) await tapAct("evTab", { t }, { vip: "VIP", srv: "Server", pass: "Passes" }[t] || "Events"); };
  if (rechargeLeft() <= 0) { dsay("Recharge", "A free Gem pack"); await open("vip"); await tapAct("recharge", {}, "Recharge now"); await closeAllModals(); did = true; }
  if (vip() > 0 && S.recharge.vipDay !== today()) { dsay("VIP gift", `VIP ${vip()}`); await open("vip"); await tapAct("vipGift", {}, "VIP gift"); await closeAllModals(); did = true; }
  if (featOn("server")) for (const G of SERVER_GOALS) for (let j = 0; j < G.ms.length; j++) if (!((S.srvGoals || {})[G.id] || []).includes(j) && serverTotal(G.key) >= G.ms[j]) {
    await open("srv"); dsay("Server goal", `${fmtFull(G.ms[j])} ${G.n}`); await tapAct("srvGoal", { id: G.id, j }, "Claim"); await closeAllModals(); did = true;
  }
  passTick();
  const P = S.pass, tap = async (act, data, what) => { await open("pass"); await tapAct(act, data, what); await closeAllModals(); did = true; };
  if (featOn("passes")) {
    for (const per of ["d", "w", "m"]) for (let j = 0; j < MISSIONS[per].length; j++) if (missionReady(per, j)) { dsay("Pass mission", MISSIONS[per][j][2]); await tap("mClaim", { per, j }, "Claim"); }
    if (checkinDue().length) { dsay("Check-In", checkinDue().length > 1 ? `${checkinDue().length} days of this month` : "Today's reward"); await tap("checkinAll", {}, "Check-In"); }
    // the Trainer Pass's Premium and Premium+ as soon as it can afford them (the owner's rule): Premium+ outright, or Premium then the upgrade
    if (P.prem < 2 && S.orundum >= (P.prem === 1 ? 2000 : 3980)) { dsay("Trainer Pass", "Premium+"); await tap("tpBuy", { v: 2 }, "Trainer Pass Premium+"); }
    else if (!P.prem && S.orundum >= 1980) { dsay("Trainer Pass", "Premium"); await tap("tpBuy", { v: 1 }, "Trainer Pass Premium"); }
    if (tpDue().length) { dsay("Trainer Pass", `Collect all (${tpDue().length})`); await tap("tpAll", {}, "Collect all"); }
    if (epOn()) { if (!P.ep.prem && S.orundum >= 1980) { dsay(EP_NAME, "Premium"); await tap("epBuy", {}, EP_NAME); }
      if (epDue().length) { dsay(EP_NAME, `Collect all (${epDue().length})`); await tap("epAll", {}, "Collect all"); } }
  }
  if (featOn("passes") && featOn("offers")) {
    if (pokeOwed()) { dsay("Poké Pass", `${pokeOwed()} day${pokeOwed() > 1 ? "s" : ""} of Gems`); await tap("pokeDay", {}, "Poké Pass"); }
    if (P.poke.until <= Date.now() && S.orundum >= POKE_PASS.cost + 3000) { dsay("Poké Pass", "A month of daily Gems"); await tap("pokeBuy", {}, "Poké Pass"); }
    if (!P.fund.bought && S.orundum >= FUND.cost + 3000) { dsay("Growth Fund", "Gems back as it levels"); await tap("fundBuy", {}, "Growth Fund"); }
    for (let j = 0; j < FUND.at.length; j++) if (P.fund.bought && !P.fund.got.includes(j) && S.lvl >= FUND.at[j][0]) await tap("fundClaim", { j }, "Growth Fund");
    if (investOn() && !P.invest.at && S.orundum >= INVEST.cost + 2000) { dsay("Investment Plan", `Gems back on each of ${INVEST.days} days`); await tap("investBuy", {}, "Invest"); }
  }
  for (const fe of featOn("rush") ? festNow() : []) {
    const F = festState(fe), cur = festCur(fe.key), dayN = Math.floor((Date.now() - fe.start) / 864e5);
    const fopen = async () => { await closeAllModals(); if (UI.view !== "events") { await goHome(); await tapAct("events", {}, "Events"); } if ((UI.evTab || "now") !== "now") await tapAct("evTab", { t: "now" }, "Events"); await tapAct("fest", { id: fe.id }, FESTS[fe.key].n); };
    if (F.day !== today() && F.login.length <= dayN && F.login.length < FEST_LOGIN.length) { dsay(FESTS[fe.key].n, "Festival login"); await fopen(); await tapAct("festLogin", { id: fe.id, j: F.login.length }, "Login"); did = true; }
    for (const j of FEST_SHOP.map((_, j) => j).sort((a, b) => worth(FEST_SHOP[b][0]) / FEST_SHOP[b][1] - worth(FEST_SHOP[a][0]) / FEST_SHOP[a][1]))
      while ((F.shop[j] || 0) < FEST_SHOP[j][2] && (S.inv[cur] || 0) >= FEST_SHOP[j][1]) { dsay(FESTS[fe.key].n, "Festival shop"); await fopen(); await tapAct("festBuy", { id: fe.id, j }, "Buy"); did = true; }
    await closeAllModals();
  }
  for (const ev of eventsNow().filter(evClaimable)) {
    await open("now"); await tapAct("evOpen", { id: ev.id }, evName(ev));
    const D = evDef(ev), st = evState(ev);
    for (let j = 0; j < D.ms.length; j++) if (evScore(ev) >= D.ms[j] && !st.got.includes(j)) { dsay("Event milestone", `${evName(ev)} · ${fmtFull(D.ms[j])} ${D.what}`); await tapAct("evClaim", { id: ev.id, j }, "Claim"); await closeAllModals(); await tapAct("evOpen", { id: ev.id }, evName(ev)); }
    await closeAllModals(); did = true;
  }
  return did;
}
// offers: it buys the ones worth at least 2.5 times their Gems, keeping 3,000 Gems back (and nothing while a Gem rush is coming,
// unless one is on: then spending counts too); Bottle Caps go to the team's Pokémon with the lowest IVs
async function demoOffers() {
  if (!featOn("offers")) return false;
  let did = false;
  const gemRushOn = eventsNow().some(e => e.type === "rush" && e.key === "gems");
  for (const o of offersNow().sort((a, b) => worth(b.give) / b.cost - worth(a.give) / a.cost)) {
    if (worth(o.give) < o.cost * 2.5 || S.orundum - o.cost < 3000 || (rushSoon() && !gemRushOn && worth(o.give) < o.cost * 5)) continue;   // (a 5× offer won't wait for a rush)
    if (UI.view !== "shop" || UI.shopTab !== "offers") { await goHome(); await tapAct("go", { v: "shop" }, "Shops"); await tapAct("shopTab", { t: "offers" }, "Offers"); }
    dsay("Offers", `${o.n} (worth about ${fmtFull(worth(o.give))} Gems for ${fmtFull(o.cost)})`);
    await tapAct("buyOffer", { id: o.id }, "Buy"); await closeAllModals(); did = true;
  }
  for (const it of ["goldbottlecap", "bottlecap"]) while ((S.inv[it] || 0) > 0) {
    const k = coreOps().filter(x => S.ops[x].pot < 6).sort((a, b) => S.ops[a].pot - S.ops[b].pot || metaScore(b) - metaScore(a))[0]; if (!k) break;
    dsay(ITEMS[it].n, `${OPS[k].n}: IVs ${IV_WORD[S.ops[k].pot]}`); await openOp(k, "info"); await tapAct("capUse", { k, it }, ITEMS[it].n); await closeAllModals(); did = true;
  }
  return did;
}
// lucky events: everything free (spins, dice, the day's Scratch-Off card, keys, maps, flip tickets), lap rewards, Lottery
// tickets while one is worth its price on average, an Auction bid when the lot is worth more than the next bid, and any
// Lucky Bags or Choice Boxes it has
async function demoLucky() {
  if (!featOn("lucky")) return false;
  let did = false;
  const open = async k => { await closeAllModals(); if (UI.view !== "events") { await goHome(); await tapAct("events", {}, "Events"); } if ((UI.evTab || "now") !== "now") await tapAct("evTab", { t: "now" }, "Events"); await tapAct("lucky", { k }, LUCKY_NAME[k] || "Scratch-Off"); };
  const w = luckyOn("wheel");
  if (w) for (let i = 0; i < 6 && (wheelFree() > 0 || (S.inv.wticket || 0) > 0); i++) { dsay("Poké Wheel", "A free spin"); await open("wheel"); await tapAct("wheelSpin", {}, "Spin"); did = true; }
  const dv = luckyOn("dice");
  if (dv) { diceTick(dv); for (const k of ["golddice", "luckydice", "dice"]) while ((S.inv[k] || 0) > 0) { dsay("Kanto Adventure Board", ITEMS[k].n); await open("dice"); await tapAct("diceRoll", { k }, "Roll"); did = true; }
    const B = diceState(dv); for (let j = 0; j < LAPS.length; j++) if (!B.got.includes(j) && B.laps >= LAPS[j][0]) { await open("dice"); await tapAct("lapClaim", { j }, "Lap reward"); did = true; } }
  if (S.lucky.scratch.day !== today() || S.lucky.scratch.card) { dsay("Scratch-Off", "Today's free card"); await open("scratch"); if (!S.lucky.scratch.card) await tapAct("scratchNew", {}, "Card"); await tapAct("scratchAll", {}, "Scratch"); did = true; }
  const bx = luckyOn("box");
  if (bx) { boxState(bx); while ((S.inv.tkey || 0) > 0) { const j = S.lucky.box.board.findIndex(b => !b.open); if (j < 0) break; dsay("Pick-a-Box", "A free key"); await open("box"); await tapAct("boxPick", { j }, "Box"); did = true; } }
  const hv = luckyOn("hunt");
  if (hv) { const T = huntState(hv); while ((S.inv.seamap || 0) > 0) { const j = HUNT_SPOTS.findIndex((_, x) => !T.dug.includes(x)); if (j < 0) break; dsay("Treasure Hunt", HUNT_SPOTS[j]); await open("hunt"); await tapAct("huntDig", { j }, "Dig"); did = true; } }
  const fv = luckyOn("flip");
  if (fv) { const F = flipState(fv); while ((S.inv.fticket || 0) > 0 || F.freeFlip) { const j = S.lucky.flip.board.findIndex(b => !b.open); if (j < 0) break; dsay("Flip Cards", "A free flip"); await open("flip"); await tapAct("flipCard", { j }, "Flip"); did = true; } }
  // Game Corner Fever: its free spins on Smeargle's slot machine (Coins are kept for the Prize Corner, so only free spins)
  if (luckyOn("slots") && featOn("slots") && (slotFree() > 0 || slotState().bonus || slotState().replay)) {
    dsay("Game Corner Fever", `${slotFree()} free spins`); await open("slots"); await tapAct("slotsOpen", {}, "Play");
    for (let i = 0; i < 60 && SL.on && (slotFree() > 0 || slotState().bonus || slotState().replay); i++) {
      await slotsIdle(); if (!SL.on) break; await tapAct("slotPress", {}, "Spin");
      for (let k = 0; k < 3 && SL.st === "spin"; k++) await tapAct("slotPress", {}, "Stop", true);   // (it stops the reels itself)
    }
    await slotsIdle(); if (SL.on) await tapAct("slotsClose", {}, "Close"); did = true;
  }
  const lv = luckyOn("lottery");
  if (lv) { const P = lotPool(lv), mine = S.lucky.lot.id === lv.id ? S.lucky.lot.t : 0, ev = (P.jackpot + 15000 + 3 * 6000 + 10 * 5000 + 50 * 1800) / (P.total + 1);
    if (ev > LOT_COST && mine < 10 && S.orundum >= LOT_COST + 6000) { dsay("Champion Lottery", `A ticket (about ${fmtFull(Math.round(ev))} Gems back on average)`); await open("lottery"); await tapAct("lotBuy", {}, "Ticket"); did = true; } }
  const av = luckyOn("auction");
  if (av && S.lucky.auc.id !== av.id || (av && !S.lucky.auc.bid)) { const [n, rw] = aucLot(av), next = Math.ceil(Math.max(aucNpc(av).bid, S.lucky.auc.bid || 0) * 1.05 / 10) * 10;
    if (worth(rw) > next * 1.2 && S.orundum >= next + 8000 && av.end - Date.now() < 12 * 36e5) { dsay("Server Auction", `${n} for ${fmtFull(next)} Gems`); await open("auction"); await tapAct("aucBid", { v: next }, "Bid"); did = true; } }
  for (const k of ["luckybag", "luckybag2"]) while ((S.inv[k] || 0) > 0) { if (UI.view !== "shop" || UI.shopTab !== "offers") { await closeAllModals(); await goHome(); await tapAct("go", { v: "shop" }, "Shops"); await tapAct("shopTab", { t: "offers" }, "Offers"); } await tapAct("bagOpen", { k }, ITEMS[k].n); await closeAllModals(); did = true; }
  while ((S.inv.choicebox || 0) > 0) { if (UI.view !== "shop" || UI.shopTab !== "offers") { await goHome(); await tapAct("go", { v: "shop" }, "Shops"); await tapAct("shopTab", { t: "offers" }, "Offers"); } await tapAct("choiceOpen", {}, "Choice Box"); await tapAct("choicePick", { j: 1 }, "Bottle Caps"); await closeAllModals(); did = true; }
  await closeAllModals();
  return did;
}
// the Boutique: a new look now and then (one a day at most, with plenty of Gems to spare), worn straight away
async function demoBoutique() {
  if (!featOn("boutique") || S.demoLook === today() || S.orundum < LOOK_COST + 20000) return false;
  const next = AVATARS.find(([k]) => !ownsLook(k)); if (!next) return false;
  S.demoLook = today();
  dsay("Boutique", `A new look: ${next[1]}`);
  await goHome(); await tapAct("go", { v: "shop" }, "Shops");
  if (UI.shopTab !== "boutique") await tapAct("shopTab", { t: "boutique" }, "Boutique");
  await tapAct("buyLook", { k: next[0] }, next[1]);
  if (actEl("wearLook", { k: next[0] })) await tapAct("wearLook", { k: next[0] }, "Wear it");
  await closeAllModals();
  return true;
}
// Rookie Week: the day's login bonus and finished Rookie Missions
async function demoRookie() {
  if (!rookieReady()) return false;
  dsay("Rookie Week", "Login bonus and Rookie Missions");
  await goHome(); await tapAct("rookie", {}, "Rookie Week");
  for (let i = 0; i < ROOKIE_LOGIN.length; i++) if (actEl("rookieDay", { i })) { await tapAct("rookieDay", { i }, "Day " + (i + 1)); await closeAllModals(); await tapAct("rookie", {}, "Rookie Week"); }
  for (const g of ROOKIE_GOALS) if (actEl("rookieGoal", { id: g.id })) { await tapAct("rookieGoal", { id: g.id }, g.n); await closeAllModals(); await tapAct("rookie", {}, "Rookie Week"); }
  await closeAllModals();
  return true;
}
async function housekeeping() {
  await demoLearn();
  await demoLive();
  await demoRookie();
  await demoOffers();
  await demoLucky();
  await demoBoutique();
  await claimMissions();
  await claimInbox();
  await shopping();
  for (let i = 0; i < 4 && await demoHeadhunt(); i++) await claimMissions();
  for (const k of coreOps().sort((a, b) => S.ops[a].lvl - S.ops[b].lvl)) await upgradeOp(k);
  await demoMoves();
  await dexEvolve();
  await mergeEvolve();
  await evolveReady();
  await guildRoutine();
  await chatHello();
  await claimMissions();
  await claimInbox();
}

// ---------- content ----------
async function openNodeSheet(nd) {
  await closeAllModals();
  if (!(UI.view === "chapter" && UI.arg === nd.ch.id && $("#view").dataset.v === "chapter")) {
    await goTab("story");
    if (!actEl("chapter", { c: nd.ch.id }) && actEl("jrTab", { v: nd.ep.id })) await tapAct("jrTab", { v: nd.ep.id }, REGION_NAME[nd.ep.id]);   // (another region's Journey)
    if (!actEl("chapter", { c: nd.ch.id })) await tapEl($('#tabs [data-act="go"][data-v="story"]'), "story tab");
    await tapAct("chapter", { c: nd.ch.id }, "Chapter " + nd.ch.no);
  }
  await tapAct("openNode", { id: nd.id }, nd.id);
}
// the Item Clause before a battle: a second Choice Band (or any Item Clause item) on the team comes off the Pokémon further down it
async function demoClause(ids) {   // (a safeguard: squadFor already turns down a team that breaks it)
  const seen = new Set();
  for (const k of ids) { const h = S.ops[k] && S.ops[k].held; if (!h || !ITEM_CLAUSE.includes(h)) continue;
    if (!seen.has(h)) { seen.add(h); continue; }
    dsay("Held item · " + OPS[k].n, `Item Clause: taking off the second ${HELD[h].n}`); equipHeld(k, null); rerender(); await w(80); }   // (from the team screen: no detour)
}
// filling the team: brisk taps, and only what has to change. Pokémon it doesn't want come off, the rest go on, then any lead
// still on the bench swaps into the top row (the order within each row doesn't matter)
async function pickSquad(ids) {
  await until(() => UI.view === "team" && UI.team, 8000);
  await demoClause(ids);
  dsay("Choosing a team", ids.map(k => OPS[k].n).join(", "));
  if (UI.el !== "all") await tapAct("elf", { e: "all" }, "All types", true);
  const T = () => UI.team.ids, leads = ids.slice(0, ACTIVE);
  for (const k of T().slice()) if (!ids.includes(k)) await tapAct("pickTeam", { k }, OPS[k].n, true);
  // leads first, so a fresh team needs no swaps
  for (const k of [...leads, ...ids.slice(ACTIVE)]) if (!T().includes(k)) await tapAct("pickTeam", { k }, OPS[k].n, true);
  for (let i = 0; i < ACTIVE; i++) {
    if (leads.includes(T()[i])) continue;
    const j = T().findIndex((k, x) => x >= ACTIVE && leads.includes(k)); if (j < 0) break;
    await tapAct("slot", { k: i }, "team place", true); await tapAct("slot", { k: j }, "team place", true);
  }
  await tapAct("deploy", {}, "Battle!");
}
async function playNode(nd, why) {
  dsay(why, `${nd.id} ${nd.name}`);
  if (!isBattleNode(nd)) {
    await openNodeSheet(nd); await tapAct("startNode", { id: nd.id }, nd.type === "story" ? "Start" : "Go");
    await settle(); await closeAllModals(); return true;
  }
  await ensureSanity(nodeCost(nd));
  const squad = await nodeSquad(nd), before = nodeStars(nd.id);
  await openNodeSheet(nd);
  await tapAct("startNode", { id: nd.id }, "Start");
  await pickSquad(squad);
  await settle(); await closeAllModals();
  return nodeStars(nd.id) > before;
}
async function playHunt(h, l) {
  dsay(`Explore ${h.code}-${l}`, h.n);
  await ensureSanity(HUNT_COST[l - 1]);
  const squad = await squadFor(huntWaves(h, l), 0, "balanced", h.weather);
  await goTab("battle"); await tapAct("go", { v: "hunt", a: h.id }, h.n);
  if (actEl("huntLv", { h: h.id, l }) && !actEl("huntLv", { h: h.id, l }).classList.contains("on")) await tapAct("huntLv", { h: h.id, l }, h.code + "-" + l);
  await tapAct("huntGo", { h: h.id, l }, "Explore");
  const before = S.hunt[h.id] || 0;
  await pickSquad(squad); await settle(); await closeAllModals();
  return (S.hunt[h.id] || 0) > before;
}
async function playTower(w, f) {
  dsay(`Battle Tower · ${REGION_NAME[w]} Wing · Floor ${f}`, towerFloor(w, f).trainer.name);
  const squad = await towerSquad(w, f);
  await goTab("battle"); await tapAct("go", { v: "tower" }, "Battle Tower");
  if (towerOpenWings().length > 1 && UI.tw !== w) await tapAct("towerTab", { v: w }, REGION_NAME[w] + " Wing");
  await tapAct("towerGo", { w, f }, "Floor " + f);
  await pickSquad(squad); await settle(); await closeAllModals();
  return towerDone(w) >= f;
}
async function openStadium(tab) {
  if (UI.view === "arena" && $("#modal").hidden) rerender();
  if (UI.view !== "arena") { await goTab("battle"); await tapAct("go", { v: "arena" }, "Battle Stadium"); }
  if ((UI.arenaTab === "rta" ? "rta" : "ladder") !== tab) await tapAct("arenaTab", { t: tab }, tab === "rta" ? "Link Battles" : "Ranked Battles");
}
// keep the strongest team registered
async function ensureDefense() {
  const near = ladderOpps().map(i => modeDoc(ladderDoc(i), "ranked")), best = await squadFor([near.flatMap(d => d.team.map(k => npcSpec(d, k)))], 0, "balanced", null, { pvp: true });
  const cur = (S.team.defense || []).filter(owned);
  if (cur.length === Math.min(ROSTER, Object.keys(S.ops).length) && cur.every((k, i) => k === best[i])) return;
  dsay("Registering a team", best.map(k => OPS[k].n).join(", "));
  await openStadium("ladder");
  await tapAct("defense", {}, "Registered Team");
  await pickSquad(best);
  await closeAllModals();
}
// quick (the Stadium sessions between Journey stages, stadiumTurn): the opponent with the best expected points it has at least a 30%
// chance against, and true once a battle is played, won or lost. It waits for a Ticket or a refresh as a player would, so a session
// is its full 3 games (the owner's rule)
async function playLadder(quick) {
  tickTimers();
  const L = S.ladder, games = L.wins + L.losses;
  if (L.tickets <= 0) await skipTime(TICKET_MS - (Date.now() - L.tTime) + 1000, "Waiting for a Ticket");
  await ensureDefense();
  for (let tries = 0; tries < 3; tries++) {
    const opps = ladderOpps().map(i => ({ i, doc: modeDoc(ladderDoc(i), "ranked"), p: L.pop[i] }));
    let best = null, be = quick ? -Infinity : 0;
    for (const o of opps) {
      const waves = [o.doc.team.map(k => npcSpec(o.doc, k))], squad = await squadFor(waves, 0, o.doc.ai, null, { pvp: true });
      const win = (await simRun(squad, waves, DEMO.fast ? 4 : 5, 0, o.doc.ai)).win;
      const ev = win * eloDelta(L.pts, o.p, true, eloK(L.pts)) + (1 - win) * eloDelta(L.pts, o.p, false, eloK(L.pts));
      if (win >= (quick ? .3 : .5) && ev > be) { be = ev; best = { ...o, squad, win }; }
    }
    if (best) {
      dsay("Ranked Battle", `vs ${best.doc.name} · ${tierOf(best.p).n} ${best.p} · ${Math.round(best.win * 100)}% to win`);
      await openStadium("ladder");
      const before = L.pts;
      await tapAct("ladderGo", { i: best.i }, "Battle");
      await pickSquad(best.squad); await settle(); await closeAllModals();
      return quick ? L.wins + L.losses > games : L.pts > before;
    }
    if (Date.now() - L.oppT < REFRESH_MS) await skipTime(REFRESH_MS - (Date.now() - L.oppT) + 1000, "Waiting to refresh the Trainers");
    dsay("Ranked Battles", "Looking for a beatable Trainer");
    await openStadium("ladder"); await tapAct("ladderRefresh", {}, "Refresh");
  }
  return false;
}
// Link Battles: queue, draft (pick 5, ban 1), then battle on AUTO (quick: as playLadder's, at least a 30% chance)
async function playRta(quick) {
  // check the odds against a typical opponent at this rating before queueing
  const sample = rtaOpponent(), mine = await squadFor([sample.team.map(k => npcSpec(sample, k))], 0, sample.ai, null, { pvp: true });
  const odds = (await simRun(mine, [sample.team.map(k => npcSpec(sample, k))], DEMO.fast ? 4 : 5, 0, sample.ai)).win;
  const P = S.demoPush, ready = rosterReady();
  if (ready && P.rta.day !== today()) P.rta = { day: today(), n: 0 };
  if (quick ? odds < .3 : ready ? P.rta.n >= 10 || odds < .3 : odds < .5 && S.rta.place === 0) return false;
  if (ready) P.rta.n++;
  const built = k => S.ops[k].lvl >= levelCap(k) - 10;
  const pool = ready ? Object.keys(S.ops).filter(k => P.roster.includes(k) || built(k)) : Object.keys(S.ops);
  dsay("Link Battle", `Searching at ${tierOf(S.rta.pts).n} ${S.rta.pts}`);
  await openStadium("rta");
  const before = S.rta.pts, games = S.rta.games;
  await tapAct("rtaFind", {}, "Find a Link Battle");
  await until(() => DRAFT || !$("#draft").hidden, 15000);
  while (DRAFT) {
    chk(DEMO.gen);
    const D = DRAFT;
    if (D.phase === "pick" && draftWho() === 0) {
      const k = draftPick(pool.filter(x => !D.picks[0].includes(x)), myProg, D.picks[0], D.picks[1], 1);
      dsay("Link Battle · draft", `Pick ${D.picks[0].length + 1}/${DRAFT_PICKS}: ${OPS[k].n}`);
      await tapAct("draftPick", { k }, OPS[k].n);
    } else if (D.phase === "ban" && D.ban[0] == null) {
      const k = threatBan(D.picks[0], D.picks[1].map(x => npcSpec(D.opp, x)));
      dsay("Link Battle · draft", `Banning ${OPS[k].n}`);
      await tapAct("draftBan", { k }, "Ban " + OPS[k].n);
    } else if (D.phase === "lead" && D.lead.length < ACTIVE) {
      // its leads: the three best matchups against their six
      const best = leadOrder(draftMine(D).map(x => ({ op: x, prog: S.ops[x] })), draftTheirs(D).map(x => npcSpec(D.opp, x))).slice(0, ACTIVE).map(s => s.op);
      const k = best.find(x => !D.lead.includes(x));
      dsay("Link Battle · draft", `Leading with ${best.map(x => OPS[x].n).join(", ")}`);
      await tapAct("draftLead", { k }, "Lead " + OPS[k].n);
    } else await new Promise(r => setTimeout(r, DEMO.fast ? 0 : 120));
  }
  await settle(); await closeAllModals();
  return S.rta.games > games && (quick || S.rta.pts > before);
}
// the Battle Stadium all through the Journey (the owner's rules, 2026-10-17): after every Journey stage it clears, a Stadium session
// of 3 Ranked and 3 Link Battles (DEMO.stadQ, each mode once it's open) before it goes back to the story, a game each pass, the two
// in turn (waiting for a Ticket when it's out); a mode that's closed or has no fair opponent sits the rest of the session out
async function stadiumTurn(Q) {
  const n = Object.keys(S.ops).length, open = { ranked: featOn("ranked") && n >= 1, link: featOn("link") && n >= 5 };
  for (const k of ["ranked", "link"]) if (!open[k]) Q[k] = 0;
  const order = ["ranked", "link"].filter(k => Q[k] > 0).sort((a, b) => Q[b] - Q[a] || (b === DEMO.stadTurn) - (a === DEMO.stadTurn));
  for (const k of order) {
    if (await (k === "ranked" ? playLadder(true) : playRta(true))) { Q[k]--; DEMO.stadTurn = k === "ranked" ? "link" : "ranked"; return true; }
    Q[k] = 0;
  }
  return false;
}
// try the next piece of content the team can win; true if something was gained
async function progress() {
  // side stages as soon as they open, so each area is finished on the way through (the story carries on past any it
  // can't win yet, and they're tried again later)
  for (const x of Object.values(NODES)) {
    if (x.type !== "side" || nodeStars(x.id) || !nodeOpen(x)) continue;
    if (!isBattleNode(x)) { if (await playNode(x, "Side stage")) return true; continue; }
    const r = await nodeSim(x, 6, 0);
    if (r.win >= .55 || failKey("node" + x.id, 0) > 6 && r.win >= .3) {
      if (await playNode(x, "Side stage")) return true;
      failKey("node" + x.id);
    }
  }
  // after each Journey stage, one side activity: a Battle Tower floor and an Explore level in turn (DEMO.sideTurn), each only once it's
  // comfortably behind the team (3 levels under its sixth-best Pokémon: a whole team out-levels it), so the Tower's wings and Explore
  // keep pace with the Journey instead of waiting for the end (one it keeps losing waits a while)
  const teamLv = Object.values(S.ops).map(p => p.lvl).sort((a, b) => b - a)[Math.min(5, Object.keys(S.ops).length - 1)] || 0;
  if (DEMO.twNext !== false) for (const kind of DEMO.sideTurn === "explore" ? ["explore", "tower"] : ["tower", "explore"]) {
    if (kind === "tower") {
      const T = featOn("tower") ? towerOpenWings().filter(id => towerLeft(id) > 0).map(w => towerFloor(w, towerDone(w) + 1))
        .filter(T => towerCap(T) <= wingLv(T.wing) && failKey("tw" + T.id, 0) < 4).sort((a, b) => a.lv - b.lv)[0] : null;   // (six of the wing's Pokémon at its cap)
      if (!T) continue;
      const r = await towerSim(T.wing, T.f, 6);
      if (r.win >= .7 && await playTower(T.wing, T.f)) { DEMO.twNext = false; DEMO.sideTurn = "explore"; return true; }
      failKey("tw" + T.id);
    } else {
      const o = HUNTS.filter(huntOn).map(h => ({ h, l: (S.hunt[h.id] || 0) + 1 })).filter(o => o.l <= 6 && huntLeft(o.h.id) && HUNT_LV[o.l - 1] <= teamLv - 3 && failKey("ex" + o.h.id + o.l, 0) < 4)
        .sort((a, b) => HUNT_LV[a.l - 1] - HUNT_LV[b.l - 1])[0];
      if (!o) continue;
      const W = huntWaves(o.h, o.l), r = await simRun(await squadFor(W, 0, "balanced", o.h.weather), W, 6, 0, "balanced", o.h.weather);
      if (r.win >= .7 && await playHunt(o.h, o.l)) { DEMO.twNext = false; DEMO.sideTurn = "tower"; return true; }
      failKey("ex" + o.h.id + o.l);
    }
  }
  // and a Stadium session after every Journey stage: 3 Ranked and 3 Link Battles before the story goes on (stadiumTurn)
  const Q = DEMO.stadQ;
  if (Q && Q.ranked + Q.link > 0) { if (await stadiumTurn(Q)) return true; DEMO.stadQ = null; }
  // the Journey, in order
  const nd = nextNode();
  if (nd) {
    if (!isBattleNode(nd)) return playNode(nd, nd.type === "story" ? "Following the story" : "Picking up an item");
    const r = await nodeSim(nd, 6, nodeTurnGoal(nd));
    // a battle it's not sure of: it tries it once first, whatever its odds, and once more after a new partner comes, before it plans
    // around it (the owner's rule, 2026-10-16: try first, don't plan for days; a region's first loss brings its Professor's help,
    // journeyLoss in a9c_meta.js, which the next Mail check picks: demoRescue)
    // (and while it's held up there, one more try each new day, as long as its odds aren't nil: a battle can go its way)
    const tried = DEMO.tried || (DEMO.tried = {}), mark = rescueCount(nd.ep.id) + 1, day = Math.floor(Date.now() / 864e5);
    const first = r.win < .55 && ((tried[nd.id] || 0) < mark || r.win > 0 && (tried[nd.id + "@"] || day) < day);
    if (r.win >= .55 || first || failKey("node" + nd.id, 0) > 6 && r.win >= .3) {
      if (first) { tried[nd.id] = Math.max(tried[nd.id] || 0, mark); tried[nd.id + "@"] = day; dsay("Giving it a try", `${nd.id} ${nd.name}: ${Math.round(r.win * 100)}% in practice`); }
      const ok = await playNode(nd, first ? "Giving it a try" : nd.badgeWin != null ? "Gym battle" : nd.type === "boss" ? "Big battle" : "Journey");
      if (!ok) { failKey("node" + nd.id); DEMO.focus = nd.id; if (first) return true; }
      if (ok) { DEMO.twNext = true; DEMO.stadQ = { ranked: 3, link: 3 }; return true; }
    } else if (DEMO.focus !== nd.id) { DEMO.focus = nd.id; dsay("Getting ready", `${nd.id} ${nd.name}: planning moves and held items for it (${Math.round(r.win * 100)}% for now)`); }   // (demoFoes)
  }
  // 3-star clears
  for (const x of Object.values(NODES)) {
    if (!isBattleNode(x) || !nodeStars(x.id) || nodeStars(x.id) >= 3 || !nodeOpen(x)) continue;
    const r = await nodeSim(x, 6, nodeTurnGoal(x));
    if (r.three >= .5 && await playNode(x, "Going for 3 stars")) return true;
  }
  if (!S.starter) return false;
  // the Journey is done: the next region (its starter, its Pokémon in the Safari Zone)
  if (!nd && nextRegions().length) {
    const id = demoNextRegion();
    dsay("The next region", `${REGION_NAME[id]} (its Pokémon for the Stadium)`);
    await goTab("story"); await tapAct("regionStart", { v: id }, REGION_NAME[id]);
    if (await answerModal()) { await settle(); await closeAllModals(); return true; }
  }
  // Explore (the areas the Journey has reached)
  for (const h of HUNTS.filter(huntOn)) {
    const l = (S.hunt[h.id] || 0) + 1; if (l > 6 || !huntLeft(h.id)) continue;
    const r = await simRun(await squadFor(huntWaves(h, l), 0, "balanced", h.weather), huntWaves(h, l), 6, 0, "balanced", h.weather);
    if (r.win >= .6 && await playHunt(h, l)) return true;
  }
  // Battle Tower
  for (const w of featOn("tower") ? towerOpenWings().filter(id => towerLeft(id) > 0) : []) {
    const f = towerDone(w) + 1, r = await towerSim(w, f, 6);
    if (r.win >= .6 && await playTower(w, f)) return true;
  }
  // Battle Stadium
  const LEG = LEGEND(), n = Object.keys(S.ops).length;
  const cc = async () => featOn("ranked") && n >= 1 && (S.ladder.best < LEG || !S.daily.arena) && await playLadder();
  const rt = async () => featOn("link") && S.rta.best < LEG && n >= 5 && await playRta();
  if (S.rta.pts < S.ladder.pts) { if (await rt() || await cc()) return true; }
  else if (await cc() || await rt()) return true;
  return false;
}
// get stronger: Quick Battles in Explore (each area a few times a day) for what the team needs most, else story Quick Battles
async function improve() {
  // (Quick Battles take the Journey team, so only a stage its Pokémon can battle in: journeyOk)
  const fits = x => (S.team.story || []).filter(owned).filter(k => journeyOk(k, x)).length >= Math.min(3, Object.keys(S.ops).filter(k => journeyOk(k, x)).length || 1);
  const best = Object.values(NODES).filter(x => isBattleNode(x) && nodeStars(x.id) >= 3 && fits(x)).sort((a, b) => (b.ep.id === S.region) - (a.ep.id === S.region) || b.lv - a.lv)[0];
  const open = HUNTS.filter(huntOn).map(h => [h, S.hunt[h.id] || 0]).filter(([, l]) => l > 0);
  // in order: the stone a new evolution needs, Exp. Candy while core Pokémon sit below the level cap with little candy in the
  // Bag, Poké Dollars when they run low (TMs, the Move Reminder, evolution stones), then held items from the deepest stone area
  const need = dexEvolutions().find(e => e.item && !(evoHave(e.item, S.ops[e.k]) > 0));
  const candyXp = ["rec1", "rec2", "rec3", "rec4"].reduce((a, k) => a + (S.inv[k] || 0) * ITEMS[k].xp, 0);
  const candyLow = coreOps().some(k => S.ops[k].lvl < levelCap(k)) && candyXp < 30000;
  const wantItems = coreOps().slice(0, 4).some(k => !S.ops[k].held) || !!need;
  const wish = [need && [open.find(([h]) => h.stone === need.item), true], candyLow && [open.find(([h]) => huntKind(h) === "candy"), true],
    S.lmd < 30000 && [open.find(([h]) => huntKind(h) === "money"), false], (wantItems || !best || R() < .35) && [open.filter(([h]) => huntKind(h) === "evo").sort((a, b) => b[1] - a[1])[0], false]]
    .filter(x => x && x[0]);
  for (const [[h, l], urgent] of wish) {
    // out of tries: one more for Gems when it's for a stone or candy and the Gems can spare it (Safari Balls come first)
    if (!huntLeft(h.id) && urgent && S.orundum >= 3000 + huntTryCost(h.id)) {
      dsay("Explore · " + h.n, `One more try for ${huntTryCost(h.id)} Gems`);
      await goTab("battle"); await tapAct("go", { v: "hunt", a: h.id }, h.n); await tapAct("huntBuy", { h: h.id }, "One more try");
    }
    if (!huntLeft(h.id)) continue;
    const n = Math.min(3, huntLeft(h.id));
    await ensureSanity(HUNT_COST[l - 1] * n);
    dsay("Exploring", `Quick Battle${n > 1 ? " ×" + n : ""} · ${h.code}-${l} ${h.n}`);
    await goTab("battle"); await tapAct("go", { v: "hunt", a: h.id }, h.n);
    if (!actEl("huntLv", { h: h.id, l }).classList.contains("on")) await tapAct("huntLv", { h: h.id, l });
    await tapAct("huntSweep", { h: h.id, l }, "Quick Battle"); await closeAllModals();
    return true;
  }
  if (best) {
    await ensureSanity(nodeCost(best) * 3);
    dsay("Training", `Quick Battle ×3 · ${best.id} ${best.name}`);
    await openNodeSheet(best); await tapAct("sweep", { id: best.id, x: 3 }, "Quick Battle ×3"); await closeAllModals();
    return true;
  }
  // nothing with 3 stars yet: replay the latest cleared battle for its Exp.
  const replay = Object.values(NODES).filter(x => isBattleNode(x) && nodeStars(x.id)).sort((a, b) => (b.ep.id === S.region) - (a.ep.id === S.region) || b.lv - a.lv)[0];
  if (replay) { await playNode(replay, "Replaying for Exp."); return true; }
  return false;
}
function stuckFor() {
  tickTimers();
  const mx = maxSanity(S.lvl);
  if (S.sanity < mx * .5) return [(mx - S.sanity) * SAN_MS, "Resting until PP is full"];
  const now = new RealDate(Date.now()), next = RealDate.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 5);
  return [next - now.getTime(), "Waiting for tomorrow's Daily Research and gifts"];
}
async function finale() {
  dsay("100% complete!", `Every stage, Explore area and Tower floor, Legend in both ladders and all ${DEX_REACH().length} Pokémon`);
  await goHome();
  openModal(`<div class="stack" style="align-items:center;text-align:center"><div class="eyebrow">Demo complete</div><h1 style="color:var(--red)">100%</h1>
    <p class="small dim">All ${Object.keys(NODES).length} Journey stages, Explore 1–6 everywhere, every open wing of the Battle Tower, the Legend tier in Ranked and Link Battles, and a complete Pokédex.</p>
    <div class="statgrid small"><div><span>Trainer Level</span><b>${S.lvl}</b></div><div><span>Pokédex</span><b>${dexCaught()} / ${OP_KEYS.length}</b></div>
      <div><span>Battles won</span><b>${S.stats.wins}</b></div><div><span>Safari throws</span><b>${S.gacha.total}</b></div></div>
    <button class="btn wide" data-act="closeModal">Close</button></div>`);
  await w(8000);
  stopDemo("Demo complete: 100%");
}
async function plateaued() {
  const G = demoGoals(), cc = tierOf(S.ladder.best).n, rt = tierOf(S.rta.best).n;
  dsay("Plateaued", `Ranked ${cc} ${S.ladder.best} · Link ${rt} ${S.rta.best}`);
  await goHome();
  openModal(`<div class="stack" style="align-items:center;text-align:center"><div class="eyebrow">Demo stopped</div><h1 style="color:var(--red)">${Math.floor(G.pct)}%</h1>
    <p class="small dim">The Stadium team has been fully trained for ${Math.round(PUSH_GIVEUP / 864e5)} in-game days without climbing further. Best ratings: Ranked Battles <b>${cc} ${S.ladder.best}</b>, Link Battles <b>${rt} ${S.rta.best}</b>.</p>
    <button class="btn wide" data-act="closeModal">Close</button></div>`);
  await w(8000);
  stopDemo(`Demo plateaued at ${cc} / ${rt}`);
}

// ---------- main loop ----------
async function demoMain() {
  const g = DEMO.gen;
  dsay("Booting the Demo save", S.seenIntro ? "Continuing" : "New Trainer");
  await w(900);
  for (let i = 0; i < 3 && !$("#modal").hidden; i++) if (!(await answerModal())) break;
  await closeAllModals();
  let idle = 0, lastPct = -1;
  while (DEMO.on && g === DEMO.gen) {
    try {
      const G = demoGoals();
      if (G.done) { await finale(); return; }
      if (G.pct > lastPct + .01) { lastPct = G.pct; idle = 0; }
      const P = await pushState();
      if (P.on) {
        if (P.roster.every(opMaxed)) P.maxedT = P.maxedT || Date.now(); else P.maxedT = 0;
        if (P.maxedT && Date.now() - P.maxedT > PUSH_GIVEUP && Date.now() - P.since > 7 * 864e5) { await plateaued(); return; }
      }
      await housekeeping();
      if (await progress()) continue;
      if (idle++ < 12 && await improve()) continue;
      const [ms, why] = stuckFor(); idle = Math.max(0, idle - 4);
      // (a day spent waiting on the next Journey stage counts as a try at it: a week stuck and it battles it anyway once its odds
      // reach 30%, as after real losses, instead of waiting forever at a level cap it can't raise)
      const nx = nextNode(); if (nx && isBattleNode(nx) && !nodeStars(nx.id) && /tomorrow/.test(why)) failKey("node" + nx.id);
      await skipTime(ms, why);
    } catch (e) {
      if (e instanceof DemoStop) return;
      DEMO.errors++; console.warn("[demo]", e); dsay("Recovering", String(e.message || e).slice(0, 80));
      if (DEMO.errors > 40) { stopDemo("Demo stopped after repeated errors"); return; }
      await demoRecover();
    }
  }
}
async function demoRecover() {
  await w(400);
  if (BT.on) { try { await fight(); } catch (e) { if (e instanceof DemoStop) throw e; } }
  if (!$("#dlg").hidden) { const s = $("#dSkip"); if (s) s.click(); }
  if (!$("#gacha").hidden) { const d = $("#gDone") || $("#evDone"); if (d) d.click(); else { $("#gacha").hidden = true; $("#gacha").innerHTML = ""; } }
  if (DRAFT && DRAFT.phase === "pick" && draftWho() === 0) draftAuto();
  if (!(await answerModal().catch(() => false))) closeModal();
  route("home");
}

// ---------- start / stop ----------
function startDemo(fresh) {
  if (DEMO.on) return;
  const slot = DEMO_KEY;
  if (fresh) { try { localStorage.removeItem(slot); } catch (e) { /* storage unavailable */ } }
  const ds = readSave(slot);
  DEMO.on = true; DEMO.paused = false; DEMO.gen++; DEMO.fails = {}; DEMO.record = {}; DEMO.errors = 0; DEMO.log = []; DEMO.focus = null; DEMO.tried = {}; DEMO.stadQ = null; DEMO.stadTurn = null;
  DEMO.skew = ds && ds.demoSkew || 0;
  window.Date = DemoDate;
  SESSION = { id: "demo", name: "Demo" };
  document.body.classList.add("demo");
  hideTitle();
  enterGame(slot, { name: "Demo" });
  S.settings.auto = false; S.settings.ai = "expert";
  demoHud();
  document.addEventListener("keydown", demoKeys);
  return demoMain().catch(e => { if (!(e instanceof DemoStop)) console.error(e); });
}
// leave the Demo for the title screen (Exit, while it's stopped; or after repeated errors)
function stopDemo(msg) {
  if (!DEMO.on && !DEMO.paused) return;
  DEMO.on = false; DEMO.paused = false; DEMO.gen++;
  document.removeEventListener("keydown", demoKeys);
  if (DRAFT) { clearTimeout(DRAFT.tm); DRAFT = null; $("#draft").hidden = true; $("#draft").innerHTML = ""; }
  if (BT.on) {
    BT.quit = true;
    if (BT.inputRes) { const r = BT.inputRes; BT.inputRes = null; r("quit"); }
    const cfg = BT.cfg; closeBattle(); if (cfg && cfg.onQuit) cfg.onQuit();
  }
  if (S) { S.demoSkew = DEMO.skew; try { localStorage.setItem(SAVE_SLOT, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  window.Date = RealDate;
  for (const id of ["demoHud", "demoBlock", "demoFinger", "demoSkip"]) { const el = $("#" + id); if (el) el.remove(); }
  document.body.classList.remove("demo");
  DEMO.fx = DEMO.fy = -1;
  S = null; SESSION = null; SAVE_SLOT = SAVE_KEY; UI.inGame = false;
  showTitle(msg);
}
// the title screen's Demo card (a Demo save from the old server list comes along first: oneServer in a6i_servers.js)
function demoPanel() {
  oneServer("demo", demoPanel1);
}
function demoPanel1() {
  const ds = readSave(DEMO_KEY);
  // the region a new Demo starts in (the owner's rule, 2026-10-17: you choose; "Its pick" is its own, demoRegion: the region whose
  // Pokémon make the strongest Stadium team)
  const regs = REGION_IDS.filter(id => journeyOf(id));
  const chips = () => `<button class="chip ${!DEMO.pickR ? "on" : ""}" data-r="">Its pick</button>` + regs.map(id => `<button class="chip ${DEMO.pickR === id ? "on" : ""}" data-r="${id}">${REGION_NAME[id]}</button>`).join("");
  const p = titlePanel(`<div class="eyebrow">Demo</div><h2>Watch the runner</h2>
    <p class="small dim">A runner plays PokeSquad Battler like an expert Trainer, from a brand-new save to 100%: every Journey stage with 3 stars,
      every Explore area, every open wing of the Battle Tower, the Legend tier in Ranked and Link Battles, and a complete Pokédex.</p>
    <div class="small" style="margin:8px 0 4px"><b>A new Demo starts in</b></div>
    <div class="chips" id="tDemoReg">${chips()}</div>
    <p class="tiny dim" style="margin:4px 0 8px">Its pick: the region whose Pokémon make the strongest Stadium team. Either way it goes on to every other region, one at a time.</p>
    ${ds ? `<button class="btn wide" id="tDemoGo">Continue the Demo (${demoProgressText(ds)})</button><button class="btn ghost wide" id="tDemoNew">Start a new Demo</button>`
      : `<button class="btn wide" id="tDemoNew">Start the Demo</button>`}
    <button class="btn ghost wide" id="tDemoX">Cancel</button>
    <p class="tnote">It plays on its own Demo save, so your adventure is never touched. While it waits for PP or Tickets, it skips time forward on that save only.
      Change its speed from the bar at the top. Stop hands you its save to play yourself, Start hands it back, and Exit (while it's stopped) returns here.
      Keyboard: <b>\`</b> cycles the speed, <b>Q</b> stops and starts it.</p>
`);
  if (!p) return;
  if ($("#tDemoGo")) $("#tDemoGo").onclick = () => { p.remove(); startDemo(false); };
  $("#tDemoReg").onclick = e => { const b = e.target.closest("[data-r]"); if (!b) return; sfx("tap"); DEMO.pickR = b.dataset.r || null; $("#tDemoReg").innerHTML = chips(); };
  $("#tDemoNew").onclick = () => { p.remove(); DEMO.region = DEMO.pickR || null; startDemo(true); };
  $("#tDemoX").onclick = () => p.remove();
}
