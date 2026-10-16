// =====================================================================
//  THE WORLD — every new game is a new world (the owner's rule, 2026-10-15)
// =====================================================================
// When you (or the Demo) start a new game, everyone starts again: you and all 3,000 Trainers, from their first stage. The
// world's clock is the save's own (S.world.start). Every Trainer plays in their own hours (person(i): start, len, act), at their
// own pace (trainerPace), through the regions in the order that suits their playstyle (trainerRoute), and everything about them
// (the stage they're on, their level, Badges, the regions they have open, their points) follows from how long they've played
// (trainerProg). It's worked out from the clock, so they go on while the game is closed.
// A new Trainer's first two weeks bring Rookie Week: a 7-day login bonus and Rookie Missions to finish in their first 7 days.
// Every week runs the Ranked Race (a6j_live.js): your place in Ranked Battles when the week ends pays by Mail.
const SERVER_DAY = 864e5, ROOKIE_DAYS = 14, ROOKIE_GOAL_DAYS = 7;
const SERVER_NAME = "Kanto";
const serverCount = () => 1;
const serverName = () => SERVER_NAME;
// when this save's world began (its new game); a world with no save yet (the title screen) begins now
const worldStart = () => (S && S.world && S.world.start) || Date.now();
const serverOpened = () => worldStart();
const serverDays = () => Math.max(0, (Date.now() - worldStart()) / SERVER_DAY);
const srvId = () => 1;
const srvDays = () => serverDays();
const openedText = () => `This world began ${new Date(worldStart()).toUTCString().slice(5, 16)} (day ${fmtFull(Math.floor(srvDays()) + 1)})`;


// ---------- how far each Trainer has got ----------
// The Demo at normal speed finishes Kanto's Journey in a few hours (the owner's measure), and so do Trainers, some slower and some
// faster (trainerPace, from regionHours below). A region's Journey has its
// stages (Kanto's real ones; a region whose Journey isn't built yet counts as many as Kanto's), and a Trainer's Pokémon are at the
// level its stages are at (REGION_CURVE: Kanto's, start to Mewtwo); after their first Champion they keep training toward Lv 100.
// The hours of play a region takes them are the owner's numbers (2026-10-15): the fastest 12% in 1.2 to 2, three in four in 2 to 3,
// the slowest 14% in 3 to 4.7 (the stronger a little quicker: their place in that order is 60% strength, 40% luck). Their first
// region is all in the launch session (launchHours), so that's also its real time from the new game.
const STAGES_PER_HOUR = 27;   // (a 2.5-hour Trainer's)
const regionHours = i => { const v = .6 * ladderQ(i) + .4 * seeded(hash("pace:" + i))(), u = 1 - (v < .4 ? v * v / .48 : v < .6 ? (2 * v - .4) / 1.2 : 1 - (1 - v) * (1 - v) / .48);
  return u < .12 ? 1.2 + u / .12 * .8 : u < .86 ? 2 + (u - .12) / .74 : 3 + (u - .86) / .14 * 1.7; };
// (a pace that fits their own first region, however long its Journey is, so it takes them their regionHours, the owner's numbers;
// a longer region after it takes them longer, 2026-10-15)
// a Trainer's Safari Zone opens once the first chapter of their first Journey is done, as yours does (the owner's rule, 2026-10-15)
const trainerSafariOn = (i, now) => { const P = trainerProg(i, now); if (P.done.length || P.ri > 0) return true;
  const ep = journeyOf(P.route[0]); return P.stage >= (ep ? ep.chapters[0].nodes.filter(nd => nd.type !== "side").length : 6); };
const trainerPace = i => regionStages(trainerRoute(i)[0]) / (STAGES_PER_HOUR * regionHours(i));
// a new world's first session: everyone jumps in the moment it begins and plays for 6 to 10 hours straight (then their own hours)
const launchHours = i => 6 + 4 * seeded(hash("launch:" + i))();
// (a Journey in parts, Unova's, is one run of stages: Part 2 comes after Part 1, so the level curve, which never goes down, stays at
// Part 1's end until Part 2 passes it)
const regionStages = id => { const ep = journeyOf(id); return ep ? ep.chapters.reduce((a, ch) => a + ch.nodes.filter(n => n.type !== "side").length, 0) : regionStages("kanto"); };
// (each region's own, where its Journey is built; Kanto's stands in for the others)
const REGION_CURVE = {}, CURVE_BADGES = {};
const curveEp = id => journeyOf(id) || STORY[0];
const regionCurve = (id = "kanto") => { const ep = curveEp(id); return REGION_CURVE[ep.id] || (REGION_CURVE[ep.id] = (() => {
  const out = []; let lv = 5;
  for (const ch of ep.chapters) for (const nd of ch.nodes) if (nd.type !== "side") { if (nd.lv) lv = Math.max(lv, nd.lv); out.push(lv); }
  return out;
})()); };
// the level their Pokémon are at after s of a region's n stages, and the Gym Badges they have by then (that region's order of them;
// a Journey in parts: its best part's, as statBadges counts yours)
const curveLv = (s, n, id) => { const c = regionCurve(id); return c[clamp(Math.floor(s / Math.max(1, n) * c.length), 0, c.length - 1)]; };
const curveBadges = (s, n, id) => { const ep = curveEp(id), B = CURVE_BADGES[ep.id] || (CURVE_BADGES[ep.id] = ep.chapters.flatMap(ch => ch.nodes.filter(nd => nd.type !== "side").map(nd => [nd.badgeWin != null ? 1 : 0, ch.part || 1])));
  const cut = Math.min(B.length, Math.floor(s / Math.max(1, n) * B.length)), per = {};
  for (let k = 0; k < cut; k++) per[B[k][1]] = (per[B[k][1]] || 0) + B[k][0]; return Math.max(0, ...Object.values(per).map(v => badgeShare(ep.id, v))); };   // (Alola's stamps: their share of eight)
// their hours of play from the world's start to now: the days they played (their own odds), from their start hour for their
// hours, plus a short daily check-in (isOnline in a6e_people.js keeps the same calendar)
function trainerHours(i, now = Date.now()) {
  const W = worldStart(); if (now <= W) return 0;
  const p = personBase(i), tz = p.tz * 3600e3, d0 = Math.floor((W + tz) / 864e5), d1 = Math.floor((now + tz) / 864e5);
  // (the launch session first; their own calendar from where it ends)
  const L0 = W + launchHours(i) * 36e5;
  let h = Math.max(0, Math.min(now, L0) - W) / 36e5;
  const add = (a, b) => { const lo = Math.max(a, L0), hi = Math.min(b, now); if (hi > lo) h += (hi - lo) / 36e5; };
  for (let d = d0 - 1; d <= d1; d++) {
    const base = d * 864e5 - tz;
    if (seeded(hash(i + ":day" + d))() < p.act) add(base + p.start * 36e5, base + (p.start + p.len) * 36e5);
    const ci = hash(i + "ci" + d) % 24; add(base + ci * 36e5, base + (ci + .34) * 36e5);
  }
  return h;
}
// the regions in the order a Trainer takes them: the one that suits them most first (their favourite region, or the one whose
// Pokémon build their playstyle soonest), then the others by how much each adds to it (the owner's rule)
const ROUTE_CACHE = new Map();
function trainerRoute(i) {
  const key = (S && S.ladder ? S.ladder.seed : 0) + ":" + i;
  if (ROUTE_CACHE.has(key)) return ROUTE_CACHE.get(key);
  // (each region's fit against what it does for every playstyle on average, so no region is everyone's first: Gen 8's many strong
  // Pokémon would otherwise send a third of the world to Galar)
  const r = seeded(hash("route:" + key)), fit = REGION_IDS.map((id, g) => [id, regionFitFor(i, g + 1) / regionNorm(g + 1) + r() * .35]);
  const P = typeof personaOf === "function" ? personaOf(personBase(i)) : null, fav = P && P.core && P.core.region;
  fit.sort((a, b) => b[1] - a[1]);
  // (a personality with favourite Pokémon starts where they live, one with a favourite type where that type is; else, often,
  // in their favourite region)
  const ops = P && P.op ? P.op.filter(k => OPS[k]) : null, ty = P && P.ty ? P.ty : null;
  const has = (id, f) => OP_KEYS.some(k => genOf(k) === REGION_IDS.indexOf(id) + 1 && f(k));
  let first = null;
  if (ops && ops.length) { const n = id => ops.filter(k => regionOf(k) === id).length; first = fit.slice().sort((a, b) => n(b[0]) - n(a[0]) || b[1] - a[1])[0][0]; }
  else if (fav && REGION_IDS.includes(fav) && r() < .6 && (!ty || has(fav, k => OPS[k].types.some(t => ty.includes(t))))) first = fav;
  else if (ty && !has(fit[0][0], k => OPS[k].types.some(t => ty.includes(t)))) { const x = fit.find(f => has(f[0], k => OPS[k].types.some(t => ty.includes(t)))); if (x) first = x[0]; }
  if (first) { const j = fit.findIndex(x => x[0] === first); fit.unshift(fit.splice(j, 1)[0]); }
  // (only regions whose Journey is built: one region at a time, each finished before the next, and a region still coming soon stays
  // locked until it's built, for Trainers as for you; the owner's rule, 2026-10-15)
  const built = fit.map(x => x[0]).filter(id => journeyOf(id)), route = built.length ? built : ["kanto"];
  ROUTE_CACHE.set(key, route); if (ROUTE_CACHE.size > LADDER_N + 100) ROUTE_CACHE.delete(ROUTE_CACHE.keys().next().value);
  return route;
}
const REGION_NORM = {};
const regionNorm = g => REGION_NORM[g] || (REGION_NORM[g] = Math.max(.01, ARCHETYPES.reduce((a, A) => a + regionFitArch(A, null, g), 0) / Math.max(1, ARCHETYPES.length)));
// how much a region's Pokémon do for a Trainer's playstyle: their archetype's roles (the setters and what the plan needs count
// double), filled from that generation, and their favourite type's Pokémon in it
const REGION_FIT = {};
const regionFitFor = (i, g) => regionFitArch(trainerPlan(i), trainerType(i), g);
function regionFitArch(A, ty, g) {
  const key = (A ? A.id : "-") + ":" + ty + ":" + g;
  if (REGION_FIT[key] != null) return REGION_FIT[key];
  const mons = COMP_POOL().filter(k => genOf(k) === g);
  let v = ty ? mons.filter(k => OPS[k].types.includes(ty)).length / 12 : 0;
  if (A) for (const R of A.roles) { if (R.r === "cover") continue; const best = Math.max(0, ...mons.filter(k => R.ok(k)).map(k => R.sc(k))); v += best / 200 * (R.need || SETTER_KINDS.has(R.kind) ? 2 : 1); }
  return (REGION_FIT[key] = v);
}
// the playstyle a Trainer works toward (their personality's, else the archetype the world's odds give them) and their favourite type
function trainerPlan(i) {
  const P = typeof personaOf === "function" ? personaOf(personBase(i)) : null;
  const ids = P && P.ps ? P.ps : null, r = seeded(hash("plan:" + i));
  if (ids && ids.length) return archById(ids[Math.floor(r() * ids.length)]) || null;
  const w = ARCHETYPES.map(A => Math.max(0, A.vi)), tot = w.reduce((a, b) => a + b, 0);
  let x = r() * tot; for (let j = 0; j < w.length; j++) { x -= w[j]; if (x <= 0) return ARCHETYPES[j]; }
  return ARCHETYPES[0] || null;
}
const trainerType = i => { const b = personBase(i), P = typeof personaOf === "function" ? personaOf(b) : null; return (P && P.core && P.core.type) || (P && P.ty && P.ty[0]) || OPS[b.favAll[0]].types[0]; };
// a Trainer's progress now: hours played, stages cleared, the region they're in (ri: its place on their route; null once every
// Journey is done), the stage there, the regions they have open (gens), the level of their Pokémon in this Journey (lv) and their
// best (any of theirs, for the PvP modes: best), their Gym Badges in each region and Champion titles
const PROG_CACHE = new Map();
function trainerProg(i, now = Date.now()) {
  const tb = Math.floor(now / 6e5), key = (S && S.ladder ? S.ladder.seed : 0) + ":" + i + ":" + tb + ":" + worldStart();
  if (PROG_CACHE.has(key)) return PROG_CACHE.get(key);
  const h = trainerHours(i, now), stages = h * STAGES_PER_HOUR * trainerPace(i), route = trainerRoute(i), done = [], gens = new Set();
  let left = stages, ri = null, stage = 0, n = 0, postH = 0;
  for (let j = 0; j < route.length; j++) {
    const m = regionStages(route[j]);
    if (left >= m) { done.push(route[j]); gens.add(REGION_IDS.indexOf(route[j]) + 1); left -= m; continue; }
    ri = j; stage = Math.floor(left); n = m; gens.add(REGION_IDS.indexOf(route[j]) + 1); break;
  }
  if (ri == null) postH = left / (STAGES_PER_HOUR * trainerPace(i));
  // after a Journey's Champion, its Pokémon keep training: toward Lv 100 over their play time since (about 25 hours to get most of the way)
  const firstDone = done.length ? regionStages(route[0]) / (STAGES_PER_HOUR * trainerPace(i)) : null;
  const sinceFirst = firstDone != null ? Math.max(0, h - firstDone) : 0;
  const lv = ri != null ? curveLv(stage, n, route[ri]) : 100, endLv = curveLv(1e9, 1, route[0]);
  const best = done.length ? Math.max(lv, Math.round(endLv + (100 - endLv) * (1 - Math.exp(-sinceFirst / 25)))) : lv;
  const badges = {}; for (const id of done) badges[id] = 8; if (ri != null) badges[route[ri]] = curveBadges(stage, n, route[ri]);
  const P = { h, stages, route, ri, region: ri != null ? route[ri] : null, stage, n, done, gens, lv, best, badges, champs: done.length, postH, sinceFirst };
  PROG_CACHE.set(key, P); if (PROG_CACHE.size > LADDER_N * 2) PROG_CACHE.delete(PROG_CACHE.keys().next().value);
  return P;
}
// the Gym Badges a Trainer's Pokémon battle with (the stat bonus, 8 at most: the region where they have the most)
const trainerBadges = i => Math.min(8, Math.max(0, ...Object.values(trainerProg(i).badges)));
// their Trainer Level (the account's, 1 to 100: it grows as they go, like yours: about 25 after Kanto, 90 and up after every region)
const trainerAcctLv = i => clamp(Math.round(1 + 99 * (1 - Math.exp(-trainerProg(i).stages / 250))), 1, 100);
// where their Ranked points settle (ladderDrift): the tier their Pokémon's level belongs to (the team config's tiers[].levels),
// higher in it the further they are; at Lv 100, Master Ball and up as their training goes on (IVs, Mastery, sets), as far as
// their strength takes them (qRating)
function trainerTarget(i, P0) {
  const P = P0 || trainerProg(i), L = P.best, q = ladderQ(i), M = T_MASTER;
  for (let t = 0; t < M; t++) {
    const band = tierLevels(t); if (!band || L > band[1]) continue;
    const lo = t === 0 ? LADDER_START - 100 : TIERS[t].min, hi = TIERS[t + 1].min, f = clamp((L - band[0] + .5) / (band[1] - band[0] + 1), 0, 1);
    return Math.round(lo + f * (hi - lo) + (q - .5) * 60);
  }
  const band = tierLevels(M) || [91, 100], lo = TIERS[M].min, f = clamp((L - band[0]) / Math.max(1, band[1] - band[0]), 0, 1), base = lo + f * (TIERS[M + 1].min - lo - 1);
  if (L < 100) return Math.round(base);
  const invest = 1 - Math.exp(-P.sinceFirst / 30);
  return Math.round(Math.max(base, lo + Math.max(0, qRating(q) - lo) * invest));
}
// the rating of a Trainer of strength q in this world now (Clubs, the Link Battle board): the Trainer at that strength's
const srvRating = q => trainerTarget(ladderAt(clamp(q, 0, .9999)));
// the strength of the Trainer whose points are nearest these (a Link Battle opponent)
const srvRatingQ = r => { if (!S || !S.ladder || !S.ladder.pop) return .5; let bi = 0, bd = 1e9; S.ladder.pop.forEach((p, i) => { const d = Math.abs(p - r); if (d < bd) { bd = d; bi = i; } }); return ladderQ(bi); };
// a Trainer of strength q's level now (the Trainer at that strength's, at most L)
const srvLevel = (q, L = 100) => Math.max(2, Math.min(L, trainerProg(ladderAt(clamp(q, 0, .9999))).best));
const srvPlayDays = q => trainerProg(ladderAt(clamp(q, 0, .9999))).h / 24;
const srvMaturity = () => clamp(srvDays() / 30, 0, 1);

// ---------- saves ----------
const srvSlot = who => acctSlot(who);
// The old server list kept an account's save on each server it played (its key + ":srv:" + server; Server 1 had the plain
// key). The first time an account comes in now, those are gathered: a single save simply moves to the account's key;
// several, and the Trainer picks the adventure to keep (the Demo keeps the one it played last). The others aren't deleted:
// they stay on this device under ":old:" keys.
const OLD_SRV_KEY = SAVE_KEY + ":servers";   // (the server each account last played)
function oldServerSaves(who) {
  const base = acctSlot(who), out = [], b = readSave(base);
  if (b) out.push({ key: base, s: b, srv: 1 });
  try {
    for (let j = 0; j < localStorage.length; j++) {
      const k = localStorage.key(j), m = k && k.startsWith(base + ":srv:") ? k.slice(base.length + 5) : "";
      if (/^\d+$/.test(m) && +m > 1) { const s = readSave(k); if (s) out.push({ key: k, s, srv: +m }); }
    }
  } catch (e) { /* storage unavailable */ }
  return out;
}
function oneServer(who, go) {
  const list = oldServerSaves(who), named = list.filter(x => x.s.named);
  if (!list.some(x => x.srv > 1)) return go();
  const base = acctSlot(who);
  const keep = x => {
    try {
      for (const y of list) if (y !== x && y.srv > 1) { localStorage.setItem(base + ":old:" + y.srv, localStorage.getItem(y.key)); localStorage.removeItem(y.key); }
      if (x && x.srv > 1) {
        const cur = localStorage.getItem(base); if (cur) localStorage.setItem(base + ":old:1", cur);
        localStorage.setItem(base, localStorage.getItem(x.key)); localStorage.removeItem(x.key);
      }
    } catch (e) { /* storage unavailable */ }
    go();
  };
  if (named.length <= 1 || who === "demo") {
    let last = 0; try { last = (JSON.parse(localStorage.getItem(OLD_SRV_KEY)) || {})[who] || 0; } catch (e) { /* storage unavailable */ }
    return keep(named.find(x => x.srv === last) || named.sort((a, b) => (b.s.playMs || 0) - (a.s.playMs || 0))[0] || list.find(x => x.srv === 1) || null);
  }
  const p = titlePanel(`<div class="eyebrow">One server</div><h2>Which adventure continues?</h2>
    <p class="tnote">Kanto Squad now runs on a single server, where every Trainer plays together. You have adventures from ${named.length} of the old servers: pick the one to keep playing. The others stay saved on this device.</p>
    <div class="stack srvlist" style="gap:6px">${named.sort((a, b) => (b.s.playMs || 0) - (a.s.playMs || 0)).map(x => `<button class="srvrow" data-keep="${x.srv}">
      <span class="srvn"><b>${esc(x.s.name)}</b><span class="tiny dim">from S${x.srv}</span></span>
      <span class="tiny srvme">Trainer Level ${x.s.lvl} · ${x.s.badges || 0} Badge${x.s.badges === 1 ? "" : "s"} · ${Object.keys(x.s.ops || {}).length} Pokémon · ${Math.round((x.s.playMs || 0) / 36e5)} h played</span></button>`).join("")}</div>`);
  if (!p) return keep(named[0]);
  p.onclick = null;   // (a choice has to be made)
  p.querySelectorAll("[data-keep]").forEach(b => b.onclick = () => { sfx("heal"); p.remove(); keep(named.find(x => x.srv === +b.dataset.keep)); });
}
// a save that was on another server joins this one (from migrate): the server's Trainers, Clubs and chat are new to it
function joinOneServer(s) {
  if ((s.server || 1) === 1) return;
  const L = s.ladder, fresh = ladderInit(1);
  s.ladder = { ...fresh, pts: L.pts, best: L.best, tickets: L.tickets, tTime: L.tTime, wins: L.wins, losses: L.losses, week: L.week, day: L.day };
  const club = s.guild && s.gw && (s.gw.list || []).find(g => g.id === s.guild);
  s.guild = null; s.gw = null; s.gReq = []; s.chat = null; s.npc = {}; s.server = 1;
  mailTo(s, { from: "Event Center", tag: "gift", title: "Welcome to the one server!", body: `Kanto Squad now runs on a single server. Your adventure came along; the Trainers you meet are new to you${club ? `, and ${club.name} stayed behind, so find a new Club in the Clubs list` : ""}. Here's something to start again with.`, rewards: { orundum: 1000, permit: 5 } });
}

// ---------- Rookie Week: a new Trainer's first days ----------
// A 7-day login bonus (one reward for each day you log in, over your first 14 days) and Rookie Missions to finish within
// your first 7 days (claim them until day 14).
const ROOKIE_LOGIN = [{ orundum: 300, rec2: 5 }, { lmd: 20000, rare: 3 }, { permit: 5, held: "leftovers" }, { rec3: 5, rare: 5 },
  { orundum: 500, abilitycapsule: 1 }, { lmd: 50000, held: "lifeorb" }, { orundum: 1500, permit: 10, op: "eevee" }];
// (Badges and Champion titles from any region: a game can start outside Kanto)
const saveBadges = s => Math.max(s.badges || 0, ...Object.entries(s.regions || {}).map(([id, r]) => badgeShare(id, r.badges || 0)));   // (Alola's stamps: their share of eight)
const saveChamp = s => !!s.champion || Object.values(s.regions || {}).some(r => r.champ);
const ROOKIE_GOALS = [
  { id: "b1", n: "Earn your first Gym Badge", ok: s => saveBadges(s) >= 1, rw: { orundum: 200, rec2: 5 } },
  { id: "dex30", n: "Catch 30 kinds of Pokémon", ok: s => Object.keys(s.dex.caught).length >= 30, rw: { permit: 5 } },
  { id: "lv30", n: "Train a Pokémon to Lv 30", ok: s => Object.values(s.ops).some(p => p.lvl >= 30), rw: { rec3: 5 } },
  { id: "b4", n: "Earn 4 Gym Badges in one region", ok: s => saveBadges(s) >= 4, rw: { orundum: 400, rare: 5 } },
  { id: "great", n: "Reach the Great Ball tier in Ranked Battles", ok: s => tierIdx(s.ladder.best) >= 2, rw: { tokens: 300 } },
  { id: "b8", n: "Earn all 8 Gym Badges in one region", ok: s => saveBadges(s) >= 8, rw: { orundum: 800, rare: 10, held: "choiceband" } },
  { id: "champ", n: "Become a Champion", ok: saveChamp, rw: { orundum: 1500, abilitypatch: 1 } },
];
const rookieInit = () => ({ n: 0, day: "", got: [], goals: {} });
const rookieAge = () => (Date.now() - ((S && S.created) || Date.now())) / SERVER_DAY;
const rookieOn = () => !!(S && S.launch && rookieAge() < ROOKIE_DAYS && featOn("rookie"));
const rookieReady = () => rookieOn() && (S.launch.got.length < S.launch.n || ROOKIE_GOALS.some(g => S.launch.goals[g.id] === "done"));
// once a minute or so (tickTimers): count the login day, mark missions done in time
function rookieTick() {
  const L = S.launch; if (!L || !rookieOn()) return;
  if (L.day !== today() && L.n < ROOKIE_LOGIN.length) { L.n++; L.day = today(); }
  if (rookieAge() < ROOKIE_GOAL_DAYS) for (const g of ROOKIE_GOALS) if (!L.goals[g.id] && g.ok(S)) L.goals[g.id] = "done";
}
function rookieModal() {
  const L = S.launch, age = rookieAge(), left = ms => { const h = Math.max(0, Math.ceil(ms / 36e5)); return h > 48 ? `${Math.ceil(h / 24)} days left` : `${h} hours left`; };
  const end = S.created + ROOKIE_DAYS * SERVER_DAY, goalEnd = S.created + ROOKIE_GOAL_DAYS * SERVER_DAY;
  const tile = (rw, i) => { const got = L.got.includes(i), ready = !got && i < L.n;
    return `<button class="lday${got ? " got" : ""}${ready ? " ready" : ""}" ${ready ? `data-act="rookieDay" data-i="${i}"` : "disabled"}><b>Day ${i + 1}</b><span class="tiny">${rewardText(rw)}</span>${got ? '<i class="tiny">Received</i>' : ""}</button>`; };
  const goal = g => { const st = L.goals[g.id];
    return `<div class="lgoal"><div><b>${esc(g.n)}</b><div class="tiny dim">${rewardText(g.rw)}</div></div>${st === "got" ? '<span class="tiny dim">Received</span>' : st === "done" ? `<button class="btn sm" data-act="rookieGoal" data-id="${g.id}">Claim</button>` : `<span class="tiny dim">${age < ROOKIE_GOAL_DAYS ? "In progress" : "Ended"}</span>`}</div>`; };
  openModal(`<div class="stack"><div class="eyebrow">Rookie Week · ${left(end - Date.now())}</div><h2>Welcome, new Trainer!</h2>
    <section class="stack" style="gap:6px"><h3>7-day login bonus</h3><div class="ldays">${ROOKIE_LOGIN.map(tile).join("")}</div><p class="tiny dim">One reward for each day you log in during your first ${ROOKIE_DAYS} days.</p></section>
    <section class="stack" style="gap:6px"><h3>Rookie Missions</h3><p class="tiny dim">Finish them within your first ${ROOKIE_GOAL_DAYS} days on the server (${age < ROOKIE_GOAL_DAYS ? left(goalEnd - Date.now()) : "over"}).</p>${ROOKIE_GOALS.map(goal).join("")}</section>
    <button class="btn wide" data-act="closeModal">Close</button></div>`);
}
const SERVER_ACT = {
  rookie: () => { sfx("tap"); rookieModal(); },
  rookieDay: d => {
    const i = +d.i, L = S.launch; if (!rookieOn() || L.got.includes(i) || i >= L.n) return;
    L.got.push(i); const list = give(ROOKIE_LOGIN[i]); save(); sfx("win"); rewardModal(`Day ${i + 1} login bonus`, list, "Rookie Week");
  },
  rookieGoal: d => {
    const g = ROOKIE_GOALS.find(x => x.id === d.id), L = S.launch; if (!g || !rookieOn() || L.goals[g.id] !== "done") return;
    L.goals[g.id] = "got"; const list = give(g.rw); save(); sfx("win"); rewardModal("Rookie Mission", list, g.n);
  },
};
