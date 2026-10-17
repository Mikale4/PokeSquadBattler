// =====================================================================
//  LIVE SERVICE — the event layer of a server-based mobile gacha game
// =====================================================================
// docs/live-service-plan.md maps the whole design. This part is the backbone: Recharges (a free Gem pack once an hour, standing
// in for buying Gems: there is no real money), the Gem ledger, VIP, `live()` (every action the game counts reports here once,
// so one action advances every event that listens: "mission stacking"), the scheduler (which events run on this server
// now), rushes and tallies with rankings against the server's 3,000 Trainers, the Event Center, and those Trainers' own
// economy (they recharge, spend and throw too, even while the game is closed: worked out from the clock and their persona).
// Each part opens with the adventure (featOn in a6_state.js): what hasn't opened yet doesn't count or pay.

// ---------- Recharge and the Gem ledger ----------
const RECHARGE_MS = 36e5;
// the packs a Recharge can bring, and how likely each is (small ones are common, like real top-ups)
const GEM_PACKS = [
  { id: "g1", n: "Gem Pouch", g: 60, w: 40 }, { id: "g2", n: "Gem Bag", g: 300, w: 25 }, { id: "g3", n: "Gem Box", g: 980, w: 15 },
  { id: "g4", n: "Gem Chest", g: 1980, w: 10 }, { id: "g5", n: "Gem Trunk", g: 3280, w: 6 }, { id: "g6", n: "Gem Vault", g: 6480, w: 4 }];
const PACK_W = GEM_PACKS.reduce((a, p) => a + p.w, 0);
function rollPack(rng = Math.random, big = 1) {
  const w = GEM_PACKS.map((p, i) => p.w * Math.pow(big, i)), tot = w.reduce((a, b) => a + b, 0);
  let x = rng() * tot; for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) return GEM_PACKS[i]; }
  return GEM_PACKS[0];
}
const rechargeInit = () => ({ t: 0, first: {}, total: 0, n: 0, log: [], vipDay: "" });
const rechargeLeft = () => S && S.recharge ? Math.max(0, RECHARGE_MS - (Date.now() - (S.recharge.t || 0))) : RECHARGE_MS;
// Gems in and out, kept apart by where they came from (earned, recharged, bonus) and counted for events when spent
function gemsIn(n, kind = "free") { S.orundum += n; S.gemLog[kind] = (S.gemLog[kind] || 0) + n; }
function gemsOut(n, why) { if (!n) return; S.orundum -= n; S.gemLog.spent = (S.gemLog.spent || 0) + n; live("gems", n, { why }); }
// a Recharge: a random pack; the first time each pack comes up it's doubled (the extra are Bonus Gems)
function doRecharge() {
  if (!S || rechargeLeft() > 0) return null;
  const R = S.recharge, P = rollPack(), bonus = R.first[P.id] ? 0 : P.g, before = vip();
  R.first[P.id] = 1; R.t = Date.now(); R.total += P.g; R.n++;
  gemsIn(P.g, "paid"); if (bonus) gemsIn(bonus, "bonus");
  R.log.unshift({ t: R.t, id: P.id, g: P.g, bonus }); R.log = R.log.slice(0, 20);
  live("recharge", P.g);
  // your first Recharge ever: the First Top-Up gift, and three more days of it by Mail
  if (R.n === 1) { sendMail({ from: "Event Center", tag: "gift", title: "First Top-Up gift!", body: "Thanks for your first Recharge! Pikachu joins you, with Gems and Safari Balls, and more arrives each of the next three days.", rewards: { op: "pikachu", orundum: 1000, permit: 10 } }); R.ftDay = today(); R.ftLeft = 3; }
  return { P, bonus, vipUp: vip() > before };
}

// ---------- VIP ----------
// from the Gems you've recharged in all: more PP, Ranked Tickets, a daily VIP gift and (later) extra spins and VIP packs
// (everyone recharges, so VIP spreads out over months: VIP 1 on the first day, VIP 10 after half a year of hourly Recharges)
const VIP_AT = [0, 1000, 5000, 15000, 40000, 80000, 150000, 250000, 400000, 650000, 1000000];
function vipOf(total) { let v = 0; for (let i = 1; i < VIP_AT.length; i++) if (total >= VIP_AT[i]) v = i; return v; }
function vip() { return S && S.recharge ? vipOf(S.recharge.total) : 0; }
const VIP_PERK = v => ({ pp: v * 3, tickets: Math.floor(v / 2), spins: v ? 1 + Math.floor(v / 3) : 0, gift: v ? { orundum: 30 * v, lmd: 3000 * v, ...(v >= 5 ? { rare: v - 4 } : {}) } : null });
function ticketsMax() { return TICKETS_MAX + VIP_PERK(vip()).tickets; }

// ---------- the event hook ----------
// Everything the game counts calls live(kind, n) once: throw (Safari throws), gems (Gems spent), recharge (Gems recharged),
// pp (PP spent), lvl, badge, clear (Journey stages), battle, win, ranked, link, catch (new Pokédex entries), evolve,
// mastery, raid (Raid damage). Every running event that counts that kind adds it.
const liveInit = () => ({ tot: {}, ev: {}, seenCal: "" });
function live(kind, n = 1, data = {}) {
  if (!S || !S.live || !n) return;
  const L = S.live; L.tot[kind] = (L.tot[kind] || 0) + n;
  if (featOn("passes")) passCount(kind, n);
  if (featOn("lucky")) luckyLive(kind, n);
  if (featOn("rush")) festLive(kind, n);
  for (const ev of eventsNow()) {
    const T = EVENT_TYPE[ev.type]; if (!T || !T.counts || !evOpen(ev) || !T.counts(ev, kind, data)) continue;
    const st = evState(ev); st.pts += n;
  }
}

// ---------- events: what runs, when ----------
// Every event is { id, type, key, start, end, n (name), ... }; its progress in this save is S.live.ev[id]. The schedule comes
// from the week (the calendar, weeks start Monday 00:00 UTC) and the day; Journey Milestones are always there.
const DAY = 864e5, HOUR = 36e5;
const dayStart = t => Math.floor(t / DAY) * DAY;
const weekStart = t => { const d = dayStart(t), wd = (new Date(d).getUTCDay() + 6) % 7; return d - wd * DAY; };   // Monday 00:00 UTC
// rushes: a ranking on one thing over the event, with milestones on the way and Mail for your place at the end.
// what: shown to players; kind: the live() kind it counts; val: a current value instead of a count (Team Power...)
const RUSH = {
  level: { n: "Training Rush", what: "PP spent", kind: "pp", ms: [300, 1000, 2500, 5000, 10000] },
  journey: { n: "Journey Milestones", what: "Journey stars", val: () => Object.values(S.story || {}).reduce((a, x) => a + (x || 0), 0), ms: [10, 30, 60, 100, 150] },
  safari: { n: "Safari Rush", what: "Safari throws", kind: "throw", ms: [10, 30, 60, 100, 200] },
  evolve: { n: "Evolution Rush", what: "evolutions", kind: "evolve", ms: [1, 3, 6, 10, 20] },
  power: { n: "Team Power Rush", what: "Team Power (your best six)", val: () => topTeam(ROSTER).reduce((a, k) => a + power(k, S.ops[k]), 0), ms: [2000, 6000, 15000, 30000, 60000] },
  ranked: { n: "Ranked Rush", what: "Ranked Battle wins", kind: "ranked", ms: [3, 8, 15, 25, 40] },
  gems: { n: "Gem Consumption Rush", what: "Gems spent", kind: "gems", ms: [1000, 5000, 10000, 25000, 50000] },
  dex: { n: "Pokédex Rush", what: "Pokémon in your Pokédex", val: () => Object.keys(S.dex.caught).length, ms: [20, 40, 70, 100, 130] },
  recharge: { n: "Recharge Rush", what: "Gems recharged", kind: "recharge", ms: [300, 1980, 6480, 15000, 30000] },
  raid: { n: "Raid Rush", what: "Raid Battle damage", kind: "raid", ms: [5000, 20000, 50000, 100000, 200000] },
  champ: { n: "Server Championship", what: "Ranked Battle wins", kind: "ranked", ms: [5, 10, 20, 35, 50] },
};
// what a rush pays: milestones (claim them as you go) and your final place (by Mail when it ends)
const RUSH_MS_PAY = [{ orundum: 100, rec2: 3 }, { orundum: 200, gball: 2 }, { orundum: 300, permit: 1, rare: 2 }, { orundum: 500, gball: 5 }, { orundum: 800, uball: 2 }];
const RUSH_PAY = [[1, { orundum: 3000, uball: 5, permit: 5 }], [3, { orundum: 2000, uball: 3, permit: 3 }], [10, { orundum: 1200, uball: 2, permit: 2 }], [50, { orundum: 700, gball: 5 }],
  [100, { orundum: 400, gball: 3 }], [500, { orundum: 200, gball: 1 }], [Infinity, { orundum: 50 }]];
// tallies: milestones only. Daily ones reset at 00:00 UTC; Gem Rebate gives Gems back for Gems spent
const TALLY = {
  dailyRecharge: { n: "Daily Recharge", what: "Gems recharged today", kind: "recharge", ms: [60, 980, 3280, 6480], pay: [{ permit: 1 }, { orundum: 300, rare: 3 }, { permit: 3, rec3: 3 }, { gold5: 1 }] },
  cumRecharge: { n: "Cumulative Recharge", what: "Gems recharged this week", kind: "recharge", ms: [300, 1980, 6480, 15000, 30000, 60000],
    pay: [{ permit: 2 }, { permit: 5, gball: 5 }, { free10: 1, uball: 2 }, { gold5: 1, rare: 10, op: "lapras" }, { free10: 2, uball: 5 }, { gold5: 2, free10: 2, op: "porygon" }] },
  dailySpend: { n: "Daily Spending", what: "Gems spent today", kind: "gems", ms: [600, 3000, 6000], pay: [{ lmd: 10000 }, { permit: 5, rare: 2 }, { permit: 10, rec3: 5 }] },
  cumSpend: { n: "Cumulative Spending", what: "Gems spent this week", kind: "gems", ms: [5000, 10000, 25000, 50000, 100000],
    pay: [{ permit: 2 }, { permit: 4, rare: 5 }, { free10: 1 }, { gold5: 1, choicebox: 1 }, { free10: 2, gold5: 1, choicebox: 1 }] },
  rebate: { n: "Gem Rebate", what: "Gems spent during the rebate", kind: "gems", ms: [1000, 5000, 10000, 25000, 50000], pay: [{ orundum: 100 }, { orundum: 600 }, { orundum: 1200 }, { orundum: 3000 }, { orundum: 6500 }] },
};
// the weekly calendar (Monday = 0): one rush a day, the Gem Consumption Rush and Gem Rebate over Wednesday and Thursday
const WEEK_RUSH = ["level", "safari", "gems", "evolve", "recharge", "raid", "champ"];
// the Ranked Race: every week, your place in Ranked Battles when it ends pays by Mail (if you battled in Ranked that week)
const RACE = { n: "Ranked Race", what: "Ranked Battles this week" };
const RACE_PAY = [[1, { orundum: 3000, held: "choicescarf" }], [10, { orundum: 2000, tokens: 500 }], [100, { orundum: 1000, tokens: 300 }],
  [500, { orundum: 500, tokens: 150 }], [Infinity, { orundum: 200 }]];
// Journey Milestones: not an event with an end, just the Journey's stars, always there (its ranking too)
const MILESTONES = { id: "mile:journey", type: "mile", key: "journey", start: 0, end: Infinity };   // (since the world began)
const EV_CACHE = { t: 0, list: [] };
// every event that overlaps [from, to)
function eventsBetween(from, to) {
  const srv = srvId(), out = [MILESTONES];
  const add = (type, key, start, end, x = {}) => { if (end > start && end > from && start < to) out.push({ id: `${type}:${key}@${start}`, type, key, start, end, ...x }); };
  for (let d = dayStart(from) - 7 * DAY; d < to; d += DAY) {
    const wd = (new Date(d).getUTCDay() + 6) % 7;
    if (wd === 2) { add("rush", "gems", d, d + 2 * DAY); add("tally", "rebate", d, d + 2 * DAY); }   // Wednesday and Thursday
    else add("rush", WEEK_RUSH[wd], d, d + DAY);
    if (wd === 0) add("area", "step", d, d + 3 * DAY);         // Step-Up Safari: Monday to Wednesday
    if (wd === 1) add("area", "great", d, d + 2 * DAY);        // Great Ball Safari: Tuesday and Wednesday
    if (wd === 4) add("area", "legend", d, d + 3 * DAY);       // Legendary Safari: Friday to Sunday
    if (wd === 0) add("lucky", "slots", d, d + DAY);           // Game Corner Fever: Monday
    if (wd === 1) add("lucky", "flip", d, d + DAY);            // Flip Cards: Tuesday
    if (wd === 3) add("lucky", "hunt", d, d + DAY);            // Team Rocket Treasure Hunt: Thursday
    if (wd === 4) add("lucky", "wheel", d, d + DAY);           // Poké Wheel: Friday
    if (wd === 5) add("lucky", "dice", d, d + 2 * DAY);        // Kanto Adventure Board: the weekend
    if (new Date(d).getUTCDate() === 1) add("lucky", "box", d, d + 7 * DAY);   // Pick-a-Box: the 1st to the 7th
    // surprises: about one Mythical Distribution a month, and some days a 12-hour Double-Rate (teased three hours ahead,
    // never announced further out)
    const rr = seeded(hash(`surprise:${srv}:${d}`));
    if (wd === 2 && rr() < .22) add("area", "myth", d, d + 3 * DAY);
    if (rr() < .14) { const h = 12 + Math.floor(rr() * 8); add("rateup", "double", d + h * HOUR, d + (h + 12) * HOUR, { teaser: d + (h - 3) * HOUR }); }
    // every day: the Recharge and Spending tallies, the Champion Lottery (drawn at 00:00 UTC) and the Server Auction
    add("tally", "dailyRecharge", d, d + DAY); add("tally", "dailySpend", d, d + DAY);
    add("lucky", "lottery", d, d + DAY); add("lucky", "auction", d, d + DAY);
  }
  for (let w = weekStart(from); w < to; w += 7 * DAY) { add("tally", "cumRecharge", w, w + 7 * DAY); add("tally", "cumSpend", w, w + 7 * DAY); add("race", "ranked", w, w + 7 * DAY); }
  // festivals: the seasons, the anniversary and the Team Rocket Crossover, each with its own Safari area
  for (const f of festivalsBetween(from, to)) { add("fest", f.key, f.start, f.end); add("area", "fest-" + f.key, f.start, f.end, { fest: f.key }); }
  return out;
}
function eventsNow() {
  const now = Date.now();
  if (now - EV_CACHE.t > 30000 || now < EV_CACHE.t) { EV_CACHE.t = now; EV_CACHE.list = eventsBetween(now, now + 1).filter(e => e.start <= now && e.end > now); }
  return EV_CACHE.list;
}
const evState = ev => (S.live.ev[ev.id] = S.live.ev[ev.id] || { pts: 0, got: [], done: false });
const evName = ev => ev.type === "fest" ? FESTS[ev.key].n : ev.type === "lucky" ? LUCKY_NAME[ev.key] : ev.type === "area" ? areaFor(ev).n : ev.type === "rateup" ? "Double-Rate Safari" : ev.type === "race" ? RACE.n : (ev.type === "rush" || ev.type === "mile" ? RUSH : TALLY)[ev.key].n;
const evDef = ev => ev.type === "rush" || ev.type === "mile" ? RUSH[ev.key] : ev.type === "tally" ? TALLY[ev.key] : null;
// which part of the adventure has to be open for an event to show and count (featOn in a6_state.js)
const EV_FEAT = { mile: "events", area: "events", rateup: "events", rush: "rush", tally: "rush", fest: "rush", race: "ranked", lucky: "lucky" };
const LUCKY_FEAT = { slots: "slots" };   // (Game Corner Fever needs the Game Corner)
// (the Safari Zone's event areas: once every region is open and done, specialSafari)
const evOpen = ev => featOn(EV_FEAT[ev.type] || "events") && (ev.type !== "lucky" || featOn(LUCKY_FEAT[ev.key] || "lucky")) && (ev.type !== "area" || specialSafari());
// the Double-Rate Safari: every area's 5★ chance doubled; teased three hours before (hidden until then)
const rateUpOn = () => !!S && eventsNow().some(e => e.type === "rateup");
const rateUpTeaser = () => { if (!S) return null; const now = Date.now(); return eventsBetween(now, now + 4 * HOUR).find(e => e.type === "rateup" && e.start > now && e.teaser <= now) || null; };
// what counts for an event: the kind it tallies, while it runs
const EVENT_TYPE = {
  rush: { counts: (ev, kind) => !RUSH[ev.key].val && RUSH[ev.key].kind === kind },
  tally: { counts: (ev, kind) => TALLY[ev.key].kind === kind },
  race: { counts: (ev, kind) => kind === "rankedPlay" },
  mile: {}, area: {}, rateup: {}, lucky: {}, fest: {},
};
// your score in an event: what you've done since it began, or the current value it ranks
const evScore = ev => { const D = evDef(ev); return !D ? 0 : D.val ? D.val() : (S.live.ev[ev.id] || {}).pts || 0; };
const evMsPay = (ev, j) => ev.type === "rush" || ev.type === "mile" ? RUSH_MS_PAY[j] : TALLY[ev.key].pay[j];

// ---------- the server's Trainers play too ----------
// A Trainer's day: how long they're online (their schedule and persona), what they recharge (whales most, free-to-play
// Trainers never), the Gems they earn and spend (more while a Gem Consumption Rush runs, less the day before one: they save
// up for it too), the PP they spend, battles they win, Pokémon they catch and evolve. Worked out from the clock, so they keep
// playing while the game is closed. Values for a window add up their days (part days pro rata).
// A Recharge is free, so everyone uses it: once for each hour they're online, as diligently as their persona is (free-to-play
// Trainers never miss free Gems); the pack is as random for them as for you
const NPC_DILIGENT = { whale: .95, tryhard: .95, collector: .9, f2p: .95, veteran: .85, hypebeast: .8, mentor: .7, recruiter: .7, salty: .7, memer: .6,
  roleplayer: .6, lore: .6, newbie: .5, lurker: .5, shy: .5, casual: .45, specialist: .8, challenger: .7, gossip: .6, creative: .5, scientist: .8, foodie: .5,
  student: .55, worker: .5, traveler: .45, wholesome: .6, philosopher: .5, gambler: .85, achiever: .95, rival: .85, caretaker: .6, superstitious: .65 };
function npcDay(i, d) {
  const p = person(i), r = seeded(hash(S.ladder.seed + ":day:" + i + ":" + d)), q = p.q;
  const hours = clamp(p.len * p.act * (.5 + r()), 0, 20);
  let recharge = 0; for (let n = Math.round(hours * (NPC_DILIGENT[p.arch] || .6) * (.7 + .6 * r())); n > 0; n--) recharge += rollPack(r).g;
  // how long they'd been on the server that day (nothing before they joined; new Trainers catch and evolve the most)
  const jd = p.joined - (dayStart(Date.now()) - d) / DAY;
  if (jd < 0) return { hours: 0, recharge: 0, spent: 0, throws: 0, pp: 0, ranked: 0, evolve: 0, raid: 0, catch: 0 };
  const free = 250 + q * 450;
  // saving up for the Gem Consumption Rush (Wednesday and Thursday)
  const wd = (new Date(d).getUTCDay() + 6) % 7, rushNext = wd === 1, rushOn = wd === 2 || wd === 3;
  const spent = Math.round((free + recharge) * (p.arch === "f2p" ? .6 : .85) * (rushOn ? 1.8 : rushNext ? .4 : 1) * (.7 + .6 * r()));
  return { hours, recharge, spent, throws: Math.floor(spent / 600) + (r() < .5 ? 1 : 0), pp: Math.round(hours * 120 * (.6 + .5 * q)),
    ranked: Math.round(hours * 1.2 * (.25 + .6 * q) * r() * 2), evolve: Math.round((2.5 * Math.exp(-jd / 15) + .2) * (.5 + r())),
    raid: Math.round(hours * 1500 * q * q * r()), catch: Math.round(4 * Math.exp(-jd / 12) * (.5 + r() * q)) };
}
function npcSum(i, from, to, key) {
  let s = 0;
  for (let d = dayStart(from); d < to; d += DAY) { const a = Math.max(from, d), b = Math.min(to, d + DAY); if (b > a) s += npcDay(i, d)[key] * (b - a) / DAY; }
  return Math.round(s);
}
// a Trainer's lifetime recharge (their VIP), since they joined this server (the last 60 days counted, the rest scaled alike)
function npcRechargeTotal(i) {
  const now = Date.now(), open = serverOpened(srvId()), p = person(i);
  const from = p.joined >= Math.floor(srvDays()) ? open : Math.max(open, now - p.joined * DAY), span = now - from, look = Math.min(span, 60 * DAY);
  return look <= 0 ? 0 : Math.round(npcSum(i, now - look, now, "recharge") * span / look);
}
const npcVip = i => vipOf(npcRechargeTotal(i));
// a Trainer's current values for the rushes that rank one: Trainer Level, Team Power, Pokédex, Journey stars
// a Trainer's Pokémon level without building their team: Master Ball and up run Lv 100 teams (topTierAccount), the rest have
// trained as far as their strength and the server's age allow (npcAccount)
const npcMonLv = i => trainerProg(i).best;   // (their own progress: trainerProg in a6i_servers.js)
// how many kinds of Pokémon a Trainer has caught by now (their open regions', more as they go), and their Legendaries (the
// regions whose Journeys they've finished, more the longer they've played since)
const GEN_SIZE = {}; const genSize = G => { const k = [...G].sort().join(); return GEN_SIZE[k] || (GEN_SIZE[k] = OP_KEYS.filter(x => !OPS[x].form && genOk(x, G)).length); };
const npcDex = (P, q) => Math.min(genSize(P.gens), Math.round(3 + P.stages * 1.4 * (.6 + .6 * q)));
const npcLegends = (P, q) => { const n = LEGENDS.filter(k => P.done.includes(regionOf(k))).length; return Math.min(n, Math.floor(n * Math.min(1, P.sinceFirst / 40) * (.3 + .7 * q))); };
// the first moment Trainer i's progress passes a test (Infinity: not yet): their progress only grows, so a search over time
function trainerWhen(i, test, now = Date.now()) {
  const W = worldStart(); if (!test(trainerProg(i, now))) return Infinity;
  let lo = W, hi = now;
  for (let n = 0; n < 22 && hi - lo > 6e5; n++) { const mid = (lo + hi) / 2; if (test(trainerProg(i, mid))) hi = mid; else lo = mid; }
  return hi;
}   // (the tier's levels: tierLevelOf)
// their Team CP from that level (fitted to their real Registered Teams, npcPower, 2026-10-09: Lv 100 teams ~110,000), for
// sorting all 3,000 at once; the top of a ranking is then counted from the real teams (serverRanking)
const TIER_CP = { [T_MASTER]: .83, [T_VETERAN]: .91, [T_EXPERT]: 1, [T_LEGEND]: 1.05 };
const npcPowerEst = i => Math.round(110000 * Math.pow(npcMonLv(i) / 100, 2.9) * (TIER_CP[tierIdx(S.ladder.pop[i])] || 1));
// each Pokémon's CP on a Trainer's Registered Team (what the Stadium shows)
const docCPs = d => d.team.map(k => Math.round(cpOf(opStats(k, d.prog[k], false, d.badges || 0).st, d.prog[k].sk)));
// the Battle Tower floors a team of this level clears (in the wings of its regions' Journeys: gens; a trained team takes on a few levels more)
// a Trainer's Battle Tower floors: in each wing they've opened, those whose cap (2 under the floor's strongest) their own Pokémon of
// that region reach (the owner's rules: region lock and floor caps, trainerWingLv); L alone (no progress): their best everywhere
const trainerWingLv = (P, w) => P.done.includes(w) ? P.best : P.region === w ? P.lv : 0;
const towerReach = (L, gens, P) => towerWings().filter(id => !gens || gens === true || gens.has(REGION_IDS.indexOf(id) + 1)).reduce((a, id) => a + towerFloors(id).filter(T => towerCap(T) <= (P ? trainerWingLv(P, id) : L)).length, 0);
function npcValue(i, key) {
  const p = person(i), L = p.lvl;
  if (key === "power") return npcPowerEst(i);
  if (key === "dex") return npcDex(trainerProg(i), p.q);   // (Kanto's 151 until the Kanto Journey is complete)
  if (key === "journey") { const P = trainerProg(i); return Math.round(Object.values(P.badges).reduce((a, b) => a + b, 0) * 22 + P.champs * 40 + P.best * .6); }
  return 0;
}
// an event's ranking: every Trainer on the server and you, by score
function evRanking(ev, now = Date.now()) {
  const D = evDef(ev), until = Math.min(now, ev.end), cacheKey = ev.id + ":" + Math.floor(until / 60000);
  if (evRanking.k === cacheKey) return evRanking.v;
  const rows = [];
  for (let i = 0; i < LADDER_N; i++) {
    const v = D.val ? npcValue(i, ev.key) : npcSum(i, ev.start, until, D.kind === "throw" ? "throws" : D.kind === "gems" ? "spent" : D.kind);
    rows.push({ i, v });
  }
  rows.push({ me: true, v: evScore(ev) });
  rows.sort((a, b) => b.v - a.v || (a.me ? -1 : 1));
  evRanking.k = cacheKey; evRanking.v = rows;
  return rows;
}
const evRank = ev => evRanking(ev).findIndex(r => r.me) + 1;
// one row of any Trainer ranking: the place, the Trainer (name, VIP and their Registered Team under it) and the score.
// `o.badge` adds the Stadium's tier badge, `o.name` a name other than the server's (the Stadium's ladder names).
// A Trainer's team takes a moment to work out the first time, so the rows show at once and the teams fill in (rankFill).
// Tapping a row opens that Trainer's card (profModal, as in the chat); from a ranking window the card has a Back button to it.
const rankMinis = ks => ks.slice(0, 6).map(k => `<img class="px" src="${sprFront(k)}" alt="${esc(OPS[k].n)}" title="${esc(OPS[k].n)}" loading="lazy">`).join("");
function rankRow(r, n, val, o = {}) {
  const name = r.me ? esc(S.name) + " (you)" : esc(o.name || npcName(r.i));
  if (!r.me && !rankRow.q) rankRow.q = setTimeout(rankFill, 0);
  const mine = o.show === "top" ? topTeam(ROSTER) : o.show === "best" ? topTeam(1) : (S.team.defense || []).filter(owned);
  return `<div class="rkrow ev${o.badge ? " tb" : ""} ${r.me ? "me" : ""}" data-act="rkProf" data-i="${r.me ? -1 : r.i}"><span class="num">#${fmtFull(n)}</span>${o.badge || ""}<div class="rkwho"><b>${name} <small class="tiny dim">VIP ${r.me ? vip() : npcVip(r.i)}</small></b><span class="rkteam"${r.me ? "" : ` data-rki="${r.i}"${o.show === "best" ? ' data-rkbest="1"' : ""}`}>${r.me ? rankMinis(mine) : ""}</span></div><span class="num">${val}</span></div>`;
}
function rankFill() {
  rankRow.q = 0; if (!S) return;
  const t = performance.now();
  for (const el of document.querySelectorAll(".rkteam[data-rki]")) {
    if (performance.now() - t > 12) { rankRow.q = setTimeout(rankFill, 16); return; }   // a few at a time, so the window stays smooth
    const d = ladderDoc(+el.dataset.rki), cps = el.dataset.rkbest ? docCPs(d) : null;
    el.innerHTML = rankMinis(cps ? [d.team[cps.indexOf(Math.max(...cps))]] : d.team); el.removeAttribute("data-rki");
  }
}
const rushPay = rank => RUSH_PAY.find(([top]) => rank <= top)[1];

// ---------- settling events that ended ----------
// a rush pays your place by Mail; unclaimed milestones of anything that ended are sent by Mail too
function liveTick() {
  if (!S || !S.live) return;
  const now = Date.now();
  if (now - (liveTick.t || 0) < 20000) return; liveTick.t = now;
  firstsTick(); if (featOn("offers")) { offerTick(); offerPopup(); } passTick(); investTick(); if (featOn("lucky")) luckyTick(); festTick();
  const R = S.recharge;
  if (R.ftLeft > 0 && R.ftDay !== today()) { R.ftLeft--; R.ftDay = today(); sendMail({ from: "Event Center", tag: "gift", title: `First Top-Up gift · day ${4 - R.ftLeft}`, body: "More of your First Top-Up gift.", rewards: { orundum: 300, rare: 3, rec3: 2 } }); }
  // the anniversary (1 April): every Gem pack's first-time double comes back
  const y = new Date(now).getUTCFullYear(), anni = Date.UTC(y, 3, 1);
  if (now >= anni && (R.resetYear || 0) < y && (S.created || 0) < anni) { R.resetYear = y; R.first = {}; sendMail({ from: "Event Center", tag: "gift", title: "Anniversary: double Gems are back!", body: "Happy anniversary! Every Gem pack's first-time double bonus is back for your next Recharges." }); }
  for (const ev of eventsNow()) if (ev.type === "area" && ev.key === "myth" && evOpen(ev) && !(S.live.ev[ev.id] || {}).mailed) {
    evState(ev).mailed = true;
    sendMail({ from: "Safari Zone Warden", tag: "gift", title: "A Mythical Distribution has begun!", body: `${OPS[areaFor(ev).feat6[0]].n} can be found in the Safari Zone until ${new Date(ev.end).toUTCString().slice(0, 22)} UTC. Here are 3 Mystic Tickets to try your luck.`, rewards: { mticket: 3 } });
  }
  for (const ev of eventsBetween(now - 8 * DAY, now)) {
    if (ev.end > now || ev.end < (S.created || 0)) continue;
    // the Ranked Race: your place when the week ended, if you battled in Ranked that week
    if (ev.type === "race") {
      const st = S.live.ev[ev.id]; if (!st || st.done) continue; st.done = true;
      const rank = ladderRank(), rw = RACE_PAY.find(([top]) => rank <= top)[1];
      sendMail({ from: "Battle Stadium", tag: "rank", title: `Ranked Race · #${fmtFull(rank)}`, body: `This week's Ranked Race is over. You battled ${fmtFull(st.pts)} time${st.pts === 1 ? "" : "s"} in Ranked Battles and finished #${fmtFull(rank)} on the server. Here are your rewards.`, rewards: rw });
      continue;
    }
    const D0 = evDef(ev); if (!D0 || (!S.live.ev[ev.id] && !D0.val)) continue;   // nothing to settle
    const st = evState(ev); if (st.done) continue;
    st.done = true;
    const D = evDef(ev), score = D.val ? evScore(ev) : st.pts, owed = {};
    D.ms.forEach((m, j) => { if (score >= m && !st.got.includes(j)) for (const [k, n] of Object.entries(evMsPay(ev, j))) owed[k] = k === "held" ? [].concat(owed[k] || [], n) : (owed[k] || 0) + n; });
    if (ev.type === "rush" && score > 0) {
      const rank = evRank(ev), rw = rushPay(rank);
      sendMail({ from: "Event Center", tag: "rank", title: `${evName(ev)} · #${fmtFull(rank)}`, body: `${evName(ev)} has ended. You finished #${fmtFull(rank)} with ${fmtFull(score)} ${D.what}.`, rewards: rw });
    }
    if (Object.keys(owed).length) sendMail({ from: "Event Center", tag: "gift", title: `${evName(ev)} · milestones`, body: `Milestone rewards you hadn't claimed from ${evName(ev)}.`, rewards: owed });
  }
  // forget old events
  for (const id of Object.keys(S.live.ev)) { const at = +id.split("@")[1]; if (at && now - at > 21 * DAY) delete S.live.ev[id]; }
}
// can anything be claimed right now
const evClaimable = ev => { const D = evDef(ev); if (!D || !evOpen(ev)) return false; const sc = evScore(ev), st = S.live.ev[ev.id] || { got: [] }; return D.ms.some((m, j) => sc >= m && !st.got.includes(j)); };
const liveReady = () => !!S && featOn("events") && (rechargeLeft() <= 0 || (featOn("passes") && passReady()) || (S.recharge.vipDay !== today() && vip() > 0) || eventsNow().some(evClaimable) || (featOn("server") && srvGoalReady()));

// ---------- the server layer: goals, firsts, rankings, groups, merges ----------
// Server goals: what the whole server does together (you and its 3,000 Trainers); reach one and everyone on the server
// gets its reward (a server this old has long since reached them all, so a new Trainer collects them when the Server tab
// opens). Worked out from a sample of the Trainers (one in 25, over the server's last 30 days, scaled up).
const SERVER_GOALS = [
  { id: "throws", n: "Safari throws on the server", key: "throws", mine: "throw", ms: [20000, 100000, 300000, 1000000], pay: [{ gball: 2 }, { uball: 1, gball: 3 }, { free10: 1 }, { gold5: 1 }] },
  { id: "recharge", n: "Gems recharged on the server", key: "recharge", mine: "recharge", ms: [5e6, 2e7, 1e8, 5e8], pay: [{ orundum: 300 }, { orundum: 800 }, { free10: 1 }, { uball: 5 }] },
  { id: "pp", n: "PP spent on the server", key: "pp", mine: "pp", ms: [1e6, 5e6, 2e7, 1e8], pay: [{ rare: 5 }, { rec4: 3 }, { rare: 20 }, { gold5: 1 }] },
];
const srvGoalReady = () => SERVER_GOALS.some(G => G.ms.some((m, j) => !((S.srvGoals || {})[G.id] || []).includes(j) && serverTotal(G.key) >= m));
function serverTotal(key) {
  const now = Date.now(), ck = srvId() + ":" + key + ":" + Math.floor(now / HOUR), C = (serverTotal.c = serverTotal.c || {});
  if (C[ck] == null) {
    const open = serverOpened(srvId()), span = now - open, look = Math.min(span, 30 * DAY);
    let t = 0; for (let i = 12; i < LADDER_N; i += 25) t += npcSum(i, now - look, now, key);
    C[ck] = Math.round(t * 25 * (look > 0 ? span / look : 0));
  }
  const g = SERVER_GOALS.find(x => x.key === key);
  return C[ck] + ((S.live.tot || {})[g.mine] || 0);
}
// "First on the server to...": when the server's fastest Trainers get there (from how fast they progress), and when you did.
// Be first and the record (and a title) is yours; otherwise you see your place.
const FIRSTS = [
  { id: "badges8", n: "earn all 8 Gym Badges", mine: () => statBadges() >= 8, test: P => Math.max(0, ...Object.values(P.badges)) >= 8 },
  { id: "champ", n: "become the Champion", mine: () => !!S.champion || Object.values(myRegions()).some(r => r.champ), test: P => P.champs > 0 },
  { id: "lv100", n: "train a Pokémon to Lv 100", mine: () => Object.values(S.ops).some(p => p.lvl >= 100), test: P => P.best >= 100 },
  { id: "legend", n: "reach the Legend tier in Ranked Battles", mine: () => S.ladder.best >= TIERS[TIERS.length - 1].min, test: (P, i) => trainerTarget(i, P) >= TIERS[TIERS.length - 1].min },
  { id: "towerwing", n: "conquer a wing of the Battle Tower", mine: () => towerOpenWings().some(id => towerLeft(id) <= 0),
    test: P => towerWings().some(id => (P.gens === true || !P.gens || P.gens.has(REGION_IDS.indexOf(id) + 1)) && towerFloors(id)[towerFloors(id).length - 1].lv <= P.best + 2 && P.sinceFirst >= towerFloors(id).length / 10) },   // (about six minutes a floor, after their first Journey)
  { id: "dex151", n: "complete the Pokédex", dex: DEX_N, mine: () => dexCaught() >= DEX_N, test: (P, i) => npcDex(P, ladderQ(i)) >= DEX_N },   // (the id from the Kanto days)
];
// when Trainer i first got there, in days since the world began (Infinity if not yet): from their own progress (trainerWhen)
function npcFirstDay(i, F) {
  const t = trainerWhen(i, P => F.test(P, i));
  return t === Infinity ? Infinity : (t - worldStart()) / DAY;
}
function legendDay(i, n) {
  if (n <= 0) return Infinity;
  const q = ladderQ(i), t = trainerWhen(i, P => npcLegends(P, q) >= n);
  return t === Infinity ? Infinity : t;
}
function firstsBoard(F) {
  const open = serverOpened(srvId()), rows = [];
  for (let i = LADDER_N - 60; i < LADDER_N; i++) { const d = npcFirstDay(i, F); if (d < Infinity) rows.push({ i, t: open + d * DAY }); }
  const mine = (S.firsts || {})[F.id]; if (mine) rows.push({ me: true, t: mine });
  return rows.filter(r => r.t <= Date.now()).sort((a, b) => a.t - b.t);
}
// note when you get there (liveTick), and pay the first (a title and Gems) and the top 10
function firstsTick() {
  S.firsts = S.firsts || {};
  const nL = LEGENDS.filter(k => S.dex.caught[k]).length; S.legendAt = S.legendAt || [];
  while (S.legendAt.length < nL) S.legendAt.push(Date.now());   // (a save from before these were kept: from now)
  for (const F of FIRSTS) if (!S.firsts[F.id] && F.mine()) {
    S.firsts[F.id] = Date.now();
    const rank = firstsBoard(F).findIndex(r => r.me) + 1, title = `${serverName(srvId())}'s first to ${F.n}`;
    if (rank === 1) { S.titles = [...new Set([...(S.titles || []), title])]; S.title = S.title || title; }
    if (rank <= 10) sendMail({ from: "Event Center", tag: "rank", title: rank === 1 ? "A server first!" : `#${rank} on the server to ${F.n}`, body: rank === 1 ? `You're the first Trainer on the server to ${F.n}! The title "${title}" is yours (choose it on your Trainer Card).` : `You're the #${rank} Trainer on the server to ${F.n}.`, rewards: rank === 1 ? { orundum: 2000, uball: 3 } : { orundum: 500 } });
  }
}
// all-time server rankings
const SERVER_RANKS = [
  { id: "lvl", n: "Trainer Level", d: "Trainer Level, from the Exp. every battle and task gives.", me: () => S.lvl, npc: i => person(i).lvl },   // (the level on their Trainer card)
  { id: "power", n: "Team Power", d: "The CP of a Trainer's six strongest Pokémon, added up.", me: () => topTeam(ROSTER).reduce((a, k) => a + power(k, S.ops[k]), 0), npc: npcPowerEst,
    exact: d => docCPs(d).reduce((a, b) => a + b, 0), show: "top" },
  { id: "dex", n: "Pokédex", d: `Pokémon caught for the National Pokédex, out of ${DEX_N}.`, me: () => dexCaught(), npc: i => npcValue(i, "dex"), exact: (d, v) => Math.max(v, d.roster.length) },
  { id: "ranked", n: "Ranked points", d: "Ranked Battle points right now.", me: () => S.ladder.pts, npc: i => S.ladder.pop[i] },
  { id: "vip", n: "VIP", d: "VIP level, from Recharges.", me: () => vip(), npc: i => npcVip(i) },
  { id: "tower", n: "Battle Tower floors", d: "Battle Tower floors cleared, in every region's wing.", me: () => S.tower || 0, npc: i => towerReach(npcMonLv(i), trainerGens(i), trainerProg(i)),
    exact: d => towerReach(d.team.reduce((a, k) => a + d.prog[k].lvl, 0) / d.team.length) },
  { id: "best", n: "Strongest Pokémon", d: "The CP of a Trainer's single strongest Pokémon.", me: () => Math.max(0, ...Object.keys(S.ops).map(k => power(k, S.ops[k]))), npc: i => Math.round(npcPowerEst(i) / 6 * 1.12),
    exact: d => Math.max(...docCPs(d)), show: "best" },
  { id: "legend", n: "Legendaries", d: `Legendary and Mythical Pokémon caught (their forms too), out of ${LEGENDS.length}. With the same number, whoever got there first ranks higher.`, me: () => LEGENDS.filter(k => S.dex.caught[k]).length,
    when: legendDay, meWhen: n => (S.legendAt || [])[n - 1] || Date.now(),
    npc: i => npcLegends(trainerProg(i), ladderQ(i)), exact: (d, v) => Math.max(v, LEGENDS.filter(k => d.roster.includes(k)).length) },
  { id: "perfect", n: "Perfect-IV Pokémon", d: "Pokémon with perfect IVs.", me: () => Object.values(S.ops).filter(p => p.pot >= 6).length, npc: i => Math.floor(trainerProg(i).h / 6 * ladderQ(i)),
    exact: (d, v) => Math.max(v, d.roster.filter(k => d.prog[k] && d.prog[k].pot >= 6).length) },
  { id: "mastery", n: "Mastery ranks", d: "Mastery ranks raised, over every move of every Pokémon.", me: () => Object.values(S.ops).reduce((a, p) => a + p.sk.reduce((b, x) => b + x - 1, 0), 0), npc: i => Math.round(person(i).lvl * 1.8 * (.5 + person(i).q)) },
];
// a ranking of everyone: each Trainer's value from the estimate, then the top 40 counted from their real Registered Teams (what
// their profile and the Stadium show), a few at a time after the list shows (rankRefine redraws it). Ties share a place (rankPlace).
function serverRanking(R) {
  const ck = srvId() + Math.floor(Date.now() / (R.id === "vip" ? HOUR : 60000)), C = (serverRanking.c = serverRanking.c || {});
  if (!C[R.id] || C[R.id].ck !== ck) {
    const rows = []; for (let i = 0; i < LADDER_N; i++) { const v = R.npc(i); rows.push({ i, v, t: R.when ? R.when(i, v) : 0 }); }
    rows.sort(rankCmp);
    C[R.id] = { ck, rows, todo: R.exact ? rows.slice(0, 40) : [] };
    if (C[R.id].todo.length) setTimeout(() => rankRefine(R), 0);
  }
  const v = R.me();
  return [...C[R.id].rows, { me: true, v, t: R.meWhen ? R.meWhen(v) : 0 }].sort(rankCmp);
}
// higher first; then whoever got there first (rankings with a `when`); then you, then the stronger Trainer
const rankCmp = (a, b) => b.v - a.v || (a.t || 0) - (b.t || 0) || (a.me ? -1 : b.me ? 1 : b.i - a.i);
function rankRefine(R) {
  const C = serverRanking.c && serverRanking.c[R.id]; if (!C || !S) return;
  const t = performance.now();
  while (C.todo.length && performance.now() - t < 12) { const r = C.todo.shift(); r.v = Math.round(R.exact(ladderDoc(r.i), r.v)); if (R.when) r.t = R.when(r.i, r.v); }
  if (C.todo.length) { setTimeout(() => rankRefine(R), 16); return; }
  C.rows.sort(rankCmp);
  const el = $("#srvRanks"); if (el && UI.srvRank !== "club" && (UI.srvRank || "lvl") === R.id) el.innerHTML = srvRanksHTML();
}
// a row's place: tied values share the place of the first of them
const rankPlace = (rows, j, val = r => r.v) => { let k = j; while (k > 0 && val(rows[k - 1]) === val(rows[j])) k--; return k + 1; };
// Clubs by the Team Power of their members (yours counts you)
function clubRanking() {
  const mine = myGuild();
  return guildList().map(g => ({ g, v: g.mem.reduce((a, i) => a + (i < 0 ? 0 : npcValue(i, "power")), 0) + (mine && mine.id === g.id ? SERVER_RANKS[1].me() : 0) })).sort((a, b) => b.v - a.v);
}

// ---------- the Event Center ----------
function endsText(t) {
  if (t === Infinity) return "Always on";
  const ms = t - Date.now(), at = new Date(t).toISOString().slice(5, 16).replace("T", " ");
  return `${ms > 0 ? "Ends in " + dur(ms) : "Ended"} · ${at} UTC`;
}
const EV_CAT = { mile: "Journey", fest: "Festivals", area: "Safari Zone", rateup: "Safari Zone", lucky: "Lucky Events", race: "Rushes", rush: "Rushes", tally: "Recharge & Spending" };
function eventsScreen() {
  const TABS = [["now", "Events", "events"], ["pass", "Passes", "passes"], ["cal", "Calendar", "rush"], ["srv", "Server", "server"], ["vip", "VIP", "events"]].filter(t => featOn(t[2]));
  if (!TABS.some(t => t[0] === UI.evTab)) UI.evTab = "now";
  const tab = UI.evTab, now = Date.now(), list = eventsNow().filter(evOpen);
  const card = ev => {
    if (ev.type === "area") { const A = areaFor(ev); return `<button class="evcard" data-act="evArea" data-b="${esc(A.id)}"><div class="spread"><b>${esc(A.n)}</b><i class="stag">EVENT</i></div><div class="tiny dim">${esc(A.d)}</div><div class="tiny dim">${endsText(ev.end)}</div></button>`; }
    if (ev.type === "fest") return `<button class="evcard" data-act="fest" data-id="${esc(ev.id)}"><div class="spread"><b>${esc(FESTS[ev.key].n)}</b><i class="stag">FESTIVAL</i></div><div class="tiny dim">${esc(FESTS[ev.key].d)}</div><div class="tiny dim">${endsText(ev.end)}</div></button>`;
    if (ev.type === "lucky") return `<button class="evcard" data-act="lucky" data-k="${ev.key}"><div class="spread"><b>${esc(LUCKY_NAME[ev.key])}</b><i class="stag">LUCKY</i></div><div class="tiny dim">${endsText(ev.end)}</div></button>`;
    if (ev.type === "race") { const st = S.live.ev[ev.id] || { pts: 0 }; return `<button class="evcard" data-act="evRace" data-id="${esc(ev.id)}"><div class="spread"><b>${RACE.n}</b><i class="stag">WEEKLY</i></div><div class="tiny dim">${fmtFull(st.pts)} Ranked Battle${st.pts === 1 ? "" : "s"} this week · you're #${fmtFull(ladderRank())} in Ranked Battles</div><div class="tiny dim">${endsText(ev.end)}</div></button>`; }
    if (ev.type === "rateup") return `<button class="evcard" data-act="go" data-v="hh"><div class="spread"><b>Double-Rate Safari</b><i class="stag">SURPRISE</i></div><div class="tiny dim">Every area's 5★ chance is doubled.</div><div class="tiny dim">${endsText(ev.end)}</div></button>`;
    const D = evDef(ev), sc = evScore(ev), st = S.live.ev[ev.id] || { got: [] }, next = D.ms.find(m => sc < m);
    return `<button class="evcard" data-act="evOpen" data-id="${esc(ev.id)}"><div class="spread"><b>${esc(evName(ev))}</b>${evClaimable(ev) ? '<i class="dot"></i>' : ""}</div>
      <div class="tiny dim">${esc(D.what)}: <b>${fmtFull(sc)}</b>${next != null ? ` · next milestone ${fmtFull(next)}` : " · all milestones reached"}${ev.type === "rush" || ev.type === "mile" ? ` · #${fmtFull(evRank(ev))}` : ""}</div>
      <div class="evbar"><i style="width:${Math.min(100, sc / D.ms[D.ms.length - 1] * 100)}%"></i></div><div class="tiny dim">${endsText(ev.end)}</div></button>`;
  };
  const cal = () => {
    const days = [];
    for (let d = dayStart(now); d < dayStart(now) + 7 * DAY; d += DAY) {
      const evs = eventsBetween(d, d + DAY).filter(e => (e.start >= d || d === dayStart(now)) && evOpen(e) && e.type !== "mile").filter(e => !["dailyRecharge", "dailySpend", "lottery", "auction"].includes(e.key) && e.type !== "rateup" && !(e.key === "myth" && e.start > now));
      days.push(`<div class="calday"><b>${d === dayStart(now) ? "Today" : d === dayStart(now) + DAY ? "Tomorrow" : new Date(d).toUTCString().slice(0, 11)}</b>${[...new Set(evs.map(evName))].map(n => `<span class="tiny">${esc(n)}</span>`).join("")}</div>`);
    }
    const tz = rateUpTeaser();
    return `${tz ? `<div class="hint"><span class="small"><b>Something special begins in ${dur(tz.start - Date.now())}…</b></span></div>` : ""}<p class="tiny dim">Plan ahead: events start and end at 00:00 UTC (surprises aren't on the calendar). Save your Gems for a Gem Consumption Rush, your throws for a Safari Rush. Every day: the Daily Recharge and Daily Spending tallies${featOn("lucky") ? ", the Champion Lottery and the Server Auction" : ""}.</p>${days.join("")}`;
  };
  const vipPanel = () => {
    const v = vip(), R = S.recharge, nx = VIP_AT[v + 1], P = VIP_PERK(v), left = rechargeLeft();
    return `<section class="panel stack" style="gap:8px"><div class="spread"><h3>Recharge</h3><span class="tiny dim">once an hour, free</span></div>
      <p class="small">A Recharge brings a random Gem pack, as if you'd bought it. The first time each pack comes up, its Gems are doubled.</p>
      ${left > 0 ? `<button class="btn wide" disabled>Next Recharge in <span data-cd="recharge">${dur(left)}</span></button>` : `<button class="btn wide" data-act="recharge">Recharge now</button>`}
      <div class="tiny dim">${GEM_PACKS.map(p => `${p.n}: ${fmtFull(p.g)} Gems · ${(p.w / PACK_W * 100).toFixed(0)}%${R.first[p.id] ? "" : " · <b>first time ×2</b>"}`).join("<br>")}</div>
      <div class="tiny dim">You've recharged ${fmtFull(R.total)} Gems (${R.n} Recharge${R.n === 1 ? "" : "s"}). Gems: ${fmtFull(S.gemLog.free || 0)} earned · ${fmtFull(S.gemLog.paid || 0)} recharged · ${fmtFull(S.gemLog.bonus || 0)} bonus · ${fmtFull(S.gemLog.spent || 0)} spent. Recharge events and rankings count recharged Gems only.</div></section>
    <section class="panel stack" style="gap:8px"><div class="spread"><h3>VIP ${v}</h3>${nx ? `<span class="tiny dim">${fmtFull(nx - R.total)} more recharged Gems to VIP ${v + 1}</span>` : '<span class="tiny dim">Top VIP</span>'}</div>
      ${nx ? `<div class="evbar"><i style="width:${(R.total - VIP_AT[v]) / (nx - VIP_AT[v]) * 100}%"></i></div>` : ""}
      <div class="tiny dim">VIP ${v}: +${P.pp} max PP, +${P.tickets} Ranked Tickets${P.gift ? `, a daily gift of ${rewardText(P.gift)}` : ""}.</div>
      ${v ? (R.vipDay === today() ? '<button class="btn ghost wide" disabled>Today\'s VIP gift received</button>' : '<button class="btn wide" data-act="vipGift">Claim today\'s VIP gift</button>') : ""}
      <div class="tiny dim">${VIP_AT.slice(1).map((x, j) => `VIP ${j + 1}: ${fmtFull(x)}`).join(" · ")}</div></section>`;
  };
  const cats = {};
  for (const ev of list) (cats[EV_CAT[ev.type]] = cats[EV_CAT[ev.type]] || []).push(ev);
  return `<div class="stack">
    <div class="tabs2 evtabs">${TABS.map(([t, n]) => `<button class="${tab === t ? "on" : ""}" data-act="evTab" data-t="${t}">${n}${(t === "vip" && rechargeLeft() <= 0) || (t === "pass" && passReady()) ? ' <i class="dot"></i>' : ""}</button>`).join("")}</div>
    ${tab === "cal" ? cal() : tab === "vip" ? vipPanel() : tab === "srv" ? serverPanelHTML() : tab === "pass" ? passesHTML() : `${rateUpTeaser() ? `<div class="hint"><span class="small"><b>Something special begins in ${dur(rateUpTeaser().start - Date.now())}…</b></span></div>` : ""}${rookieOn() ? `<button class="evcard" data-act="rookie"><b>Rookie Week</b><div class="tiny dim">Your 7-day login bonus and Rookie Missions</div></button>` : ""}
      ${Object.entries(cats).map(([c, evs]) => `<h3>${c}</h3>${evs.map(card).join("")}${c === "Lucky Events" && featOn("lucky") ? `<button class="evcard" data-act="lucky" data-k="scratch"><div class="spread"><b>${esc(profFull())}'s Scratch-Off</b><i class="stag">DAILY</i></div><div class="tiny dim">A free card every day.</div></button>` : ""}`).join("")}`}
  </div>`;
}
function serverPanelHTML() {
  const goal = G => { const t = serverTotal(G.key), got = (S.srvGoals || {})[G.id] || [];
    return `<div class="stack" style="gap:4px"><div class="spread"><b>${esc(G.n)}</b><span class="tiny num">${fmtFull(t)}</span></div>${G.ms.map((m, j) => `<div class="lgoal"><div class="tiny">${fmtFull(m)}: ${rewardText(G.pay[j])}</div>${got.includes(j) ? '<span class="tiny dim">Received</span>' : t >= m ? `<button class="btn sm" data-act="srvGoal" data-id="${G.id}" data-j="${j}">Claim</button>` : `<span class="tiny dim">${Math.floor(t / m * 100)}%</span>`}</div>`).join("")}</div>`; };
  const first = F => { const b = firstsBoard(F), me = b.findIndex(r => r.me);
    return `<div class="lgoal"><div><b>First to ${esc(F.n)}</b><div class="tiny dim">${b.length ? (b[0].me ? "You!" : esc(npcName(b[0].i))) + ` · server day ${Math.floor((b[0].t - serverOpened()) / DAY) + 1}` : "Nobody yet"}${me > 0 ? ` · you were #${me + 1}` : ""}</div></div></div>`; };
  return `<section class="panel stack" style="gap:8px"><h3>The ${esc(serverName())} server</h3>
      <div class="tiny dim">${openedText()}. Everyone plays here, from Trainers who started this week to veterans from launch day.</div></section>
    <section class="panel stack" style="gap:8px"><h3>Server goals</h3><p class="tiny dim">Everything the server does together, you and its Trainers. Reach a goal and everyone on the server gets its reward.</p>${SERVER_GOALS.map(goal).join("")}</section>
    <section class="panel stack" style="gap:6px"><h3>Server firsts</h3>${FIRSTS.map(first).join("")}
      ${(S.titles || []).length ? `<div class="tiny dim">Your title</div>${chipRow("setTitle", S.title || "-", [["-", "None"], ...S.titles.map(t => [t, t])])}` : ""}</section>
    <section class="panel stack" id="srvRanks" style="gap:6px">${srvRanksHTML()}</section>`;
}
// the server rankings: the chips, what the chosen one counts, its top 10 (and your place)
function srvRanksHTML() {
  const R = SERVER_RANKS.find(x => x.id === (UI.srvRank || "lvl")) || SERVER_RANKS[0];
  const club = UI.srvRank === "club", rows = club ? null : serverRanking(R), meAt = rows ? rows.findIndex(r => r.me) : -1;
  const key = R.when ? r => r.v > 0 ? r.v + ":" + r.t : 0 : r => r.v, day = t => Math.floor((t - serverOpened(srvId())) / DAY) + 1;
  const val = r => fmtFull(r.v) + (R.when && r.v > 0 && r.t < Infinity ? `<small class="tiny dim rkday" title="${new Date(r.t).toLocaleString()}">day ${fmtFull(day(r.t))}</small>` : "");
  return `<h3>Server rankings</h3>${chipRow("srvRank", club ? "club" : R.id, [...SERVER_RANKS.map(x => [x.id, x.n]), ["club", "Club Power"]])}
      <div class="tiny dim">${club ? "Clubs by their members' Team Power, added up. Tied Clubs share a place." : esc(R.d) + (R.when ? "" : " Tied Trainers share a place.")}</div>
      ${club ? clubRanking().slice(0, 10).map((x, j, a) => `<div class="rkrow ev ${myGuild() && myGuild().id === x.g.id ? "me" : ""}"><span class="num">#${rankPlace(a, j)}</span><b>${esc(x.g.name)} <small class="tiny dim">[${esc(x.g.tag)}]</small></b><span class="num">${fmtFull(x.v)}</span></div>`).join("")
        : rows.slice(0, 10).map((r, j) => rankRow(r, rankPlace(rows, j, key), val(r), { show: R.show })).join("") + (meAt >= 10 ? rankRow(rows[meAt], rankPlace(rows, meAt, key), val(rows[meAt]), { show: R.show }) : "")}`;
}
function evModal(id) {
  const ev = eventsNow().find(e => e.id === id); if (!ev) return;
  if (ev.type === "race") return raceModal(ev);
  const D = evDef(ev), sc = evScore(ev), st = evState(ev);
  const ms = D.ms.map((m, j) => `<div class="lgoal"><div><b>${fmtFull(m)} ${esc(D.what)}</b><div class="tiny dim">${rewardText(evMsPay(ev, j))}</div></div>${st.got.includes(j) ? '<span class="tiny dim">Received</span>' : sc >= m ? `<button class="btn sm" data-act="evClaim" data-id="${esc(ev.id)}" data-j="${j}">Claim</button>` : `<span class="tiny dim">${fmtFull(sc)}/${fmtFull(m)}</span>`}</div>`).join("");
  let rank = "";
  if (ev.type === "rush" || ev.type === "mile") {
    const rows = evRanking(ev), me = rows.findIndex(r => r.me);
    const row = (r, n) => rankRow(r, n, fmtFull(r.v));
    rank = `<section class="stack" style="gap:4px"><h3>Ranking</h3>${rows.slice(0, 10).map((r, j) => row(r, j + 1)).join("")}
      ${me >= 10 ? row({ me: true, v: sc }, me + 1) : ""}
      ${ev.type === "rush" ? `<div class="tiny dim">Paid by Mail when it ends: ${RUSH_PAY.map(([t, rw]) => `${t === Infinity ? "Everyone who took part" : t === 1 ? "#1" : "Top " + t}: ${rewardText(rw)}`).join(" · ")}</div>` : ""}</section>`;
  }
  openModal(`<div class="stack"><div class="eyebrow">${esc(EV_CAT[ev.type])}</div><h2>${esc(evName(ev))}</h2>
    <p class="small">${ev.type === "mile" ? `Your stars across the Journey: claim each milestone as you reach it. It never ends.` : `Counts ${esc(D.what)}${D.val ? " (your current total)" : " while the event runs"}. ${endsText(ev.end)}.`}</p>
    <section class="stack" style="gap:4px"><h3>Milestones</h3>${ms}</section>${rank}
    <button class="btn wide" data-act="closeModal">Close</button></div>`);
}
// the Ranked Race: this week's standing and what each place pays
function raceModal(ev) {
  const st = S.live.ev[ev.id] || { pts: 0 }, rank = ladderRank();
  openModal(`<div class="stack"><div class="eyebrow">Rushes · every week</div><h2>${RACE.n}</h2>
    <p class="small">Battle in Ranked Battles this week, and your place on the server when the week ends pays by Mail. You've battled ${fmtFull(st.pts)} time${st.pts === 1 ? "" : "s"} this week and you're <b>#${fmtFull(rank)}</b> right now. ${endsText(ev.end)}.</p>
    <div class="tiny dim">${RACE_PAY.map(([top, rw]) => `${top === Infinity ? "Everyone who battled" : top === 1 ? "#1" : "Top " + top}: ${rewardText(rw)}`).join("<br>")}</div>
    <div class="row" style="gap:8px"><button class="btn ghost" style="flex:1" data-act="closeModal">Close</button><button class="btn" style="flex:1" data-act="raceGo">Battle Stadium</button></div></div>`);
}
let RANK_BACK = null;   // the ranking window a Trainer's card was opened from
const LIVE_ACT = {
  rkProf: d => {
    sfx("tap"); const m = $("#modal"), box = m.hidden ? null : m.querySelector(".mbox");
    RANK_BACK = box ? { html: box.innerHTML, cls: m.className, y: box.scrollTop } : null;
    profModal(+d.i);
    const close = [...m.querySelectorAll('[data-act="closeModal"]')].pop();
    if (RANK_BACK && close) close.insertAdjacentHTML("beforebegin", '<button class="btn wide" data-act="rkBack">Back to the ranking</button>');
  },
  rkBack: () => { sfx("tap"); const b = RANK_BACK; if (!b) return closeModal(); RANK_BACK = null; openModal(b.html, b.cls); $("#modal .mbox").scrollTop = b.y; },
  evRace: d => { sfx("tap"); const ev = eventsNow().find(e => e.id === d.id); if (ev) raceModal(ev); },
  raceGo: () => { closeModal(); UI.arenaTab = "ladder"; route("arena"); },
  events: () => { sfx("tap"); route("events"); },
  rechargeTab: () => { sfx("tap"); UI.evTab = "vip"; route("events"); },
  evTab: d => { UI.evTab = d.t; rerender(); },
  evOpen: d => { sfx("tap"); evModal(d.id); },
  evArea: d => { sfx("tap"); if (!specialSafari()) { toast("The Safari Zone's event areas open once you've opened every region and finished its Journey."); return; } UI.hhB = d.b; route("hh"); },
  srvGoal: d => {
    const G = SERVER_GOALS.find(x => x.id === d.id), j = +d.j; if (!G || !featOn("server")) return;
    const got = (S.srvGoals = S.srvGoals || {}); if ((got[G.id] || []).includes(j) || serverTotal(G.key) < G.ms[j]) return;
    got[G.id] = [...(got[G.id] || []), j]; const list = give(G.pay[j]); save(); sfx("win"); rerender(); rewardModal("Server goal reached!", list, `${fmtFull(G.ms[j])} ${G.n}`);
  },
  srvRank: d => { sfx("tap"); UI.srvRank = d.v; rerender(); },
  setTitle: d => { S.title = d.v === "-" ? "" : d.v; rerender(); },
  evClaim: d => {
    const ev = eventsNow().find(e => e.id === d.id), j = +d.j; if (!ev) return;
    const D = evDef(ev), st = evState(ev); if (st.got.includes(j) || evScore(ev) < D.ms[j]) return;
    st.got.push(j); const list = give(evMsPay(ev, j)); save(); sfx("win"); rewardModal(evName(ev), list, `${fmtFull(D.ms[j])} ${D.what}`);
  },
  recharge: () => {
    const r = doRecharge(); if (!r) return;
    save(); sfx("win"); renderTop(); if (UI.view === "events") rerender();
    // how close the next recharge reward is ("only 1,200 more Gems to...")
    const near = eventsNow().filter(e => evDef(e) && evDef(e).kind === "recharge").map(e => { const D = evDef(e), sc = evScore(e), nx = D.ms.find(m => sc < m); return nx ? [nx - sc, evName(e)] : null; }).filter(Boolean).sort((a, b) => a[0] - b[0])[0];
    rewardModal("Recharge complete!", [{ k: "orundum", n: r.P.g + r.bonus }], `${r.P.n}: ${fmtFull(r.P.g)} Gems${r.bonus ? ` + ${fmtFull(r.bonus)} first-time bonus` : ""}${r.vipUp ? ` · You reached VIP ${vip()}!` : ""}${near ? ` · ${fmtFull(near[0])} more recharged Gems to the next ${near[1]} reward` : ""}`);
  },
  vipGift: () => {
    const v = vip(), P = VIP_PERK(v); if (!v || S.recharge.vipDay === today()) return;
    S.recharge.vipDay = today(); const list = give(P.gift); save(); sfx("win"); rerender(); rewardModal(`VIP ${v} daily gift`, list);
  },
};
