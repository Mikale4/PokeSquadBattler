
// =====================================================================
//  SAVE STATE + PROGRESSION
//  Pokémon levels (1–100) are capped by Gym Badges. Catching a Pokémon you already have raises its IVs.
//  Pokémon evolve by level, by evolution stone, or with a Linking Cord (for the trade evolutions).
// =====================================================================
const SAVE_KEY = "pokemon_kanto_squad_v1";
let S = null;          // null on the title screen; enterGame() (a9e_accounts.js) loads a save
let SAVE_SLOT = SAVE_KEY; // the active save: Guest keeps SAVE_KEY, accounts and the Demo have their own keys
// per-device preferences that the title screen needs before any save is loaded (sound, Game Boy frame colour)
const DEVICE_KEY = "pokemon_kanto_squad_device";
function devicePrefs() { try { return { sound: true, shell: "classic", ...JSON.parse(localStorage.getItem(DEVICE_KEY) || "{}") }; } catch (e) { return { sound: true, shell: "classic" }; } }
function setDevicePref(k, v) { const d = devicePrefs(); d[k] = v; try { localStorage.setItem(DEVICE_KEY, JSON.stringify(d)); } catch (e) { /* storage unavailable */ } }
const soundOn = () => S ? S.settings.sound !== false : devicePrefs().sound !== false;
// The level cap follows the Journey's big battles: your Pokémon can grow up to 2 levels below the strongest Pokémon in your next
// Gym Leader, rival, Giovanni, Elite Four or Champion battle (Brock's Onix is Lv 14, so the cap before him is Lv 12), never below
// the cap you already had (after Misty's 21 → 19, Blue's level-20 team keeps it at 19). The post-game's battles go on raising it, and
// it's 100 once the whole Journey is done (the owner's rule, 2026-10-17: no longer at the Champion).
const CAP_BELOW = 2;
const CAP_STEPS = {};
// (a stage with noCap is a Trainer battle that doesn't set it: Unova's opening, the owner's rule, a4e_unova.js)
// (and a Journey's last stage, whatever it is: Mewtwo, Zygarde, Pecharunt..., so the cap keeps rising to the very end: the owner's
// rule, 2026-10-17, as the cap no longer jumps to 100 at the Champion)
const JOURNEY_LAST = {};
const isCapBattle = nd => !!nd.trainer && !nd.noCap && (nd.type === "boss" || !!nd.rivalWaves)
  || !!nd.ep && nd.id === (JOURNEY_LAST[nd.ep.id] || (JOURNEY_LAST[nd.ep.id] = journeyEnd(nd.ep.id)));
// (every stage fields its waves as one team, three at a time: the wave-by-wave rule and the first chapter's softer stages are gone,
// the owner's rule, 2026-10-16, as the Professor's gifts cover the early game: journeyLoss in a9c_meta.js. The engine can still bring
// waves in one at a time, cfg.waveByWave and nextWave in a7_engine.js; nothing asks for it)

const aceLevel = nd => Math.max(...nodeWaves(nd).map(w => convWave(w, nd.lv, journeyG(nd))).flat().map(s => s.LV || nd.lv));
// Each region has its own caps (the Journey revamp): a Pokémon's cap is its own region's Journey's (genOf/regionOf in
// a6i_servers.js), Lv 100 once that whole Journey is done, or while the region's Journey is still coming soon. With no
// Pokémon named: the Journey you're on. A Journey in parts (Unova's, PART_NAME in a4_story.js) has each part's own run of caps (the
// owner's rule, 2026-10-15): the part you're on sets it (regionPart), from Lv 5 again in Part 2, and a part's stages battle at that
// part's cap (stageCap); a part before the last keeps its highest cap once its battles are done (the last is 100 once the Journey's done)
const partCapSteps = (ep, part = 1) => { if (!ep) return []; const k = ep.id + ":" + part;
  return CAP_STEPS[k] || (CAP_STEPS[k] = ep.chapters.filter(ch => (ch.part || 1) === part).flatMap(ch => ch.nodes).filter(isCapBattle).map(nd => ({ nd, ace: aceLevel(nd), lv: aceLevel(nd) - CAP_BELOW }))); };
const capSteps = (id = "kanto", part) => partCapSteps(journeyOf(id), part || regionPart(id));
const capRegion = key => key && OPS[key] ? (S && S.region && gensOf(key).length > 1 && gensOf(key).includes(REGION_IDS.indexOf(S.region) + 1) ? S.region : regionOf(key)) : (S && S.region) || "kanto";   // (a Pokémon of two regions: the one you're on, when it's one of them)
const regionChamp = id => id === "kanto" ? !!S.champion : !!(myRegions()[id] || {}).champ;
// a region's whole Journey cleared, post-game and all (its last stage)
const journeyDone = id => { const e = journeyEnd(id); return !!e && nodeStars(e) > 0; };
// the battle that sets a region's cap right now (null once its whole Journey is done), and the cap. The Champion doesn't lift it to
// 100 any more (the owner's rule, 2026-10-17): the post-game's battles go on raising it, and it's 100 once the Journey is complete
const regionCapBattle = id => !journeyOf(id) || journeyDone(id) ? null : (capSteps(id).find(c => !nodeStars(c.nd.id)) || null);
function partCap(ep, part = 1) {
  if (!ep || journeyDone(ep.id)) return 100;
  let cap = 5;
  for (const c of partCapSteps(ep, part)) { cap = Math.max(cap, c.lv); if (!nodeStars(c.nd.id)) return cap; }
  return part < epParts(ep) ? cap : 100;
}
function regionCap(id) { const ep = journeyOf(id); return ep ? partCap(ep, regionPart(id)) : 100; }
const stageCap = nd => partCap(nd.ep, ndPart(nd));
function capBattle(key) { return regionCapBattle(capRegion(key)); }
function levelCap(key) { return regionCap(capRegion(key)); }
// the cap once this battle is beaten (for its stage card)
function capAfter(nd) {
  let cap = 5, past = false;
  for (const c of partCapSteps(nd.ep, ndPart(nd))) { cap = Math.max(cap, c.lv); if (past) return cap; if (c.nd === nd) past = true; }
  return ndPart(nd) < epParts(nd.ep) ? cap : 100;
}
// each part's Gym Badges in a Journey in parts (Part 1's are the region's own count, badgesIn/setBadges; the later parts' S.regions[id].pb)
const partBadges = (id, part = 1) => part > 1 ? (((myRegions()[id] || {}).pb || {})[part] || 0) : badgesIn(id);
function setPartBadges(id, part, n) { if (part <= 1) return setBadges(id, n); const r = regionRec(id); r.pb = r.pb || {}; r.pb[part] = Math.max(r.pb[part] || 0, n); }
const capWho = c => c.nd.trainer ? c.nd.trainer.name.replace(/^Leader /, "") : c.nd.name;   // (a Journey's wild last stage: its own name, Mewtwo)
const maxSanity = l => 80 + Math.floor(l * 1.5) + (S && S.recharge ? VIP_PERK(vip()).pp : 0);   // (VIP adds some)
const SAN_MS = 30000;
const pxpNeed = l => 100 + 50 * l;
const TRAINER_MAX = 100;   // the highest Trainer Level
// growth rates (PokeAPI ids): 1 slow, 2 medium, 3 fast, 4 medium slow, 5 erratic, 6 fluctuating
const GROWTH = { 1: 1.25, 2: 1, 3: .8, 4: 1.1, 5: 1.15, 6: 1.2 };
const xpNeed = (l, key) => Math.round((10 + l * l * .9) * (GROWTH[OPS[key] ? OPS[key].gr : 2] || 1));
const effLV = p => p.lvl;
// mv: its moves [S1, S2, S3] (what it knows at that level when it joins you); nat: its nature; ab: its Ability, one of its
// species' regular Abilities at random (the Hidden one only with an Ability Patch)
const randNature = () => NATURE_KEYS[Math.floor(Math.random() * NATURE_KEYS.length)];
const regularAbilities = key => OPS[key].abs.filter(a => !a.h).map(a => a.k);
const hiddenAbilities = key => OPS[key].abs.filter(a => a.h).map(a => a.k);
const randAbility = key => { const r = regularAbilities(key); return r.length ? r[Math.floor(Math.random() * r.length)] : OPS[key].ab; };
const mkProg = (lvl = 5, key) => ({ lvl, xp: 0, pot: 1, sk: [1, 1, 1], held: null, t: Date.now(), mv: key ? defaultMoves(key, lvl) : null,
  nat: randNature(), ab: key ? randAbility(key) : null });
// what a serious Trainer gives it: a nature that raises the attacking stat it uses (Speed instead when it's fast) and lowers the
// one it doesn't, or bulk for Defenders and Supporters; and its species' best Ability (OPS[key].ab, picked in build_data.py)
function bestNature(key) {
  const op = OPS[key], b = op.b, phys = b[1] >= b[3];
  if (op.cls === "Defender" || op.cls === "Supporter") return phys ? (b[2] <= b[4] ? "impish" : "careful") : (b[2] <= b[4] ? "bold" : "calm");
  return phys ? (b[5] >= 90 ? "jolly" : "adamant") : (b[5] >= 90 ? "timid" : "modest");
}
const bestAbility = key => OPS[key].ab;
// the item that would give it that Ability (null if it has it, or no item can)
function abilityItemFor(key, ab) {
  for (const it of ["abilitycapsule", "abilitypatch"]) if (abilityChoices(key, it).includes(ab)) return it;
  return null;
}
// a Pokémon's moves, filled in from its level if it has none yet
const pmv = key => { const p = S.ops[key]; if (!p) return [null, null, null]; if (!Array.isArray(p.mv)) p.mv = defaultMoves(key, p.lvl); return p.mv; };
// IV rank 1–6 (raised by catching duplicates); shown as IVs on the summary screen
const ivOf = pot => 10 + pot * 3;
const IV_WORD = ["", "Decent", "Above average", "Good", "Very good", "Fantastic", "Perfect"];

// play statistics behind the Medals
const newStats = () => ({ battles: 0, wins: 0, crits: 0, kills: 0, flawless: 0, versus: 0, patrols: 0, fives: 0, evolutions: 0, loginDays: 0, superEff: 0 });
function newSave(server = 1) {
  const s = {
    v: 2, server, world: { start: Date.now() }, launch: rookieInit(), featSeen: {}, featNew: [], looks: [], name: "Red", named: false, lvl: 1, xp: 0, seenIntro: false, starter: null,
    playerId: String(10000 + Math.floor(R() * 89999)), created: Date.now(),
    inbox: [], mailSeq: 0, achv: {}, lastLogin: "", lastGift: Date.now(), lvlGift: 1,
    sanity: maxSanity(1), sTime: Date.now(),
    lmd: 3000, orundum: 1200, permit: 0, cert: 0, tokens: 0, prime: 3,
    inv: { rec1: 10, rec2: 2, rec3: 0, rec4: 0, rare: 2, summ: 3 }, held: { sitrusberry: 1, silkscarf: 1 },
    badges: 0, champion: false, chRw: {}, hunt: {}, playMs: 0, hofMs: null, regions: {}, region: null, first: null, waitOps: [],
    ops: {}, dex: { seen: {}, caught: {} },
    story: {}, team: { story: [], hunt: [], tower: [], arena: [], defense: [], gboss: [], friendly: [] }, bio: "", tms: {}, learnQ: [],
    assistant: null, tower: 0, towerW: {}, frlg: 1, hoE: 1, joS: 1, sevii: 1, home: { map: "pallet", party: [] },
    ladder: ladderInit(server), rta: rtaInit(), recharge: rechargeInit(), gemLog: { free: 1200, paid: 0, bonus: 0, spent: 0 }, live: liveInit(), offers: offersInit(), pass: passInit(), lucky: luckyInit(),
    gacha: { pity: 0, firstTen: true, total: 0, guar: false, spark: {}, step: {}, disc: "", half: {} },
    daily: { day: today(), clear: 0, sanity: 0, hh: 0, upgrade: 0, arena: 0, rune: 0, claimed: {}, hunt: {}, huntBuy: {} },
    settings: { speed: 1, auto: false, sound: true, ai: "balanced", text: "normal", shell: "classic" }, stats: newStats(),
  };
  welcomeMail(s);
  return s;
}
function load() {
  try { const raw = localStorage.getItem(SAVE_SLOT); if (raw) { const s = JSON.parse(raw); if (s && s.v === 2) return s; } } catch (e) { /* storage unavailable */ }   // (the owner's rule, 2026-10-15: a version 1 save starts over in a new world)
  return null;
}
let saveTimer = 0;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { if (S) { try { localStorage.setItem(SAVE_SLOT, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } } }, 150);
}
// play time for the Trainer Card: real time with the game open and in view (the Demo's time skips don't count)
let PLAY_T = 0;
function tickTimers() {
  const now = Date.now(), mx = maxSanity(S.lvl), pt = performance.now();
  if (PLAY_T && !document.hidden) S.playMs = (S.playMs || 0) + Math.min(5000, pt - PLAY_T);
  PLAY_T = pt;
  if (S.sanity >= mx) S.sTime = now;
  else { const n = Math.floor((now - S.sTime) / SAN_MS); if (n > 0) { S.sanity = Math.min(mx, S.sanity + n); S.sTime += n * SAN_MS; if (S.sanity >= mx) S.sTime = now; } }
  ladderTick(now);
  worldTick(now);
  rookieTick();
  liveTick();
  if (S.daily.day !== today()) S.daily = { day: today(), clear: 0, sanity: 0, hh: 0, upgrade: 0, arena: 0, rune: 0, claimed: {}, hunt: {}, huntBuy: {} };
}

// ---------- inventory ----------
const WALLET = ["lmd", "orundum", "permit", "cert", "tokens", "prime"];
function have(k) { return WALLET.includes(k) ? S[k] : k === "sanity" ? S.sanity : HELD[k] ? (S.held[k] || 0) : (S.inv[k] || 0); }
// a stage's reward, as its card shows it (the owner's rule, 2026-10-18: only items that do something; a gift of balls is Safari Balls,
// and the story's keepsakes are gone): items, held items, TMs and HMs (tm: a TM id, tmId), Pokémon
// a reward as the list rewardsHTML shows (a stage's card)
const rwList = rw => Object.entries(rw || {}).flatMap(([k, v]) => k === "op" ? [{ k: "op:" + v, n: 1 }] : k === "held" ? [].concat(v).map(h => ({ k: "held:" + h, n: 1 }))
  : k === "tm" ? [].concat(v).map(n => ({ k: "tm:" + n, n: 1 })) : [{ k, n: v }]);
function give(rw) {
  const out = [];
  for (const k in rw) {
    const v = rw[k];
    if (k === "op") { const r = grantOp(v); out.push({ k: "op:" + v, n: 1, isNew: r.isNew }); continue; }
    if (k === "tm") { for (const n of [].concat(v)) if (TM_MOVE[n]) { S.tms[n] = (S.tms[n] || 0) + 1; out.push({ k: "tm:" + n, n: 1 }); } continue; }
    if (k === "held") { for (const h of [].concat(v)) { S.held[h] = (S.held[h] || 0) + 1; out.push({ k: "held:" + h, n: 1 }); } continue; }
    if (k === "sanityMax") { S.sanity = Math.max(S.sanity, maxSanity(S.lvl)); S.sTime = Date.now(); out.push({ k: "sanity", n: maxSanity(S.lvl) }); continue; }
    if (HELD[k]) { S.held[k] = (S.held[k] || 0) + v; out.push({ k: "held:" + k, n: v }); continue; }
    if (WALLET.includes(k)) S[k] += v; else if (k === "sanity") S.sanity += v; else S.inv[k] = (S.inv[k] || 0) + v;
    if (k === "orundum" && S.gemLog) S.gemLog.free = (S.gemLog.free || 0) + v;   // earned Gems (Recharges add theirs in gemsIn)
    out.push({ k, n: v });
  }
  return out;
}
function spendSanity(n) {
  S.sanity -= n; S.daily.sanity += n; S.xp += n * 10; live("pp", n);
  let ups = 0;
  while (S.lvl < TRAINER_MAX && S.xp >= pxpNeed(S.lvl)) { S.xp -= pxpNeed(S.lvl); S.lvl++; ups++; }
  if (S.lvl >= TRAINER_MAX) S.xp = 0;   // (nothing more to fill)
  if (ups) { live("lvl", ups); S.sanity = Math.max(S.sanity, maxSanity(S.lvl)); gemsIn(30 * ups); toast(`Trainer Level ${S.lvl}! PP restored, +${30 * ups} Gems.`, "gold"); }
}

// ---------- stats ----------
// The main-series stat formula (IVs from the IV rank, no EVs), plus Gym Badge boosts for your own Pokémon.
function calcStats(key, L, pot, nat) {
  const b = OPS[key].b, iv = ivOf(pot), [up, down] = NATURES[nat] || [];
  const f = (B, s) => Math.floor((Math.floor((2 * B + iv) * L / 100) + 5) * (s === up ? 1.1 : s === down ? .9 : 1));
  // (base HP 1, Shedinja's: always exactly 1 HP, as in every main game)
  return { hp: b[0] === 1 ? 1 : Math.floor((2 * b[0] + iv) * L / 100) + L + 10, atk: f(b[1], "atk"), def: f(b[2], "def"), spa: f(b[3], "spa"), sdf: f(b[4], "sdf"), spe: f(b[5], "spe") };
}
const BADGE_BOOST = .05;
// Gym Badges by region (S.badges is Kanto's; the others' are in S.regions); the stat bonus is from the region where you have the
// most, 8 at most (as the Trainers': trainerBadges)
const badgesIn = id => id === "kanto" ? S.badges || 0 : (myRegions()[id] || {}).badges || 0;
const statBadges = () => S ? Math.min(8, Math.max(S.badges || 0, ...Object.keys(myRegions()).flatMap(id => [badgeShare(id, badgesIn(id)), partBadges(id, 2)]))) : 0;   // (a Journey in parts: its best part's; Alola's stamps: their share of eight, badgeShare)
function setBadges(id, n) { if (id === "kanto") S.badges = Math.max(S.badges || 0, n); else regionRec(id).badges = Math.max(badgesIn(id), n); }
function opStats(key, p, mine = true, badges) {
  const st = calcStats(key, p.lvl, p.pot, p.nat), nb = badges != null ? badges : mine && S ? statBadges() : 0;
  for (let i = 0; i < Math.min(8, nb); i++) { const k = BADGES[i].stat; st[k] = Math.round(st[k] * (1 + BADGE_BOOST)); }
  return { st, held: p.held || null };
}
// Combat Power: one number for how strong a Pokémon is right now
function cpOf(st, sk) {
  const off = Math.max(st.atk, st.spa), df = (st.def + st.sdf) / 2;
  return Math.round((off + 15) * Math.sqrt(df + 15) * Math.sqrt(st.hp + 15) / 10 * (1 + st.spe / 400) * (1 + .03 * ((sk || [1, 1, 1]).reduce((a, b) => a + b, 0) - 3)));
}
const power = (key, p) => cpOf(opStats(key, p).st, p.sk);
const progForLV = (key, LV) => ({ lvl: LV, xp: 0, pot: 3, sk: [Math.min(MAX_SK, 1 + Math.floor(LV / 25)), Math.min(MAX_SK, 1 + Math.floor(LV / 25)), Math.min(MAX_SK, 1 + Math.floor(LV / 25))], held: null });
const owned = k => !!S.ops[k];
const topTeam = (n = 4) => Object.keys(S.ops).sort((a, b) => power(b, S.ops[b]) - power(a, S.ops[a])).slice(0, n);

// ---------- leveling ----------
function opXp(key, n) {
  const p = S.ops[key]; if (!p) return 0;
  const cap = levelCap(key);
  if (p.lvl >= cap) { p.xp = 0; return 0; }
  p.xp += n; let ups = 0;
  while (p.lvl < cap && p.xp >= xpNeed(p.lvl, key)) { p.xp -= xpNeed(p.lvl, key); p.lvl++; ups++; }
  if (p.lvl >= cap) p.xp = 0;
  if (ups) learnLevels(key, p.lvl - ups, p.lvl);
  return ups;
}
// how much Exp. it can still take before the level cap stops it
function xpRoom(key) {
  const p = S.ops[key], cap = levelCap(key); if (!p || p.lvl >= cap) return 0;
  let n = -p.xp; for (let l = p.lvl; l < cap; l++) n += xpNeed(l, key);
  return Math.max(0, n);
}
function useRecord(key, it) {
  const p = S.ops[key]; if (!p || !(S.inv[it] > 0) || p.lvl >= levelCap(key)) return false;
  S.inv[it]--;
  if (it === "rare") { p.lvl++; p.xp = 0; learnLevels(key, p.lvl - 1, p.lvl); } else opXp(key, ITEMS[it].xp);
  return true;
}
function autoLevel(key) {
  let used = 0;
  for (const it of ["rec1", "rec2", "rec3", "rec4"]) while (S.inv[it] > 0 && S.ops[key].lvl < levelCap(key)) { useRecord(key, it); used++; }
  return used;
}
// Mastery: each rank adds 6% to the move's damage, healing, accuracy or turn meter refund (masteryKind in a3b_kits.js);
// rank ★ also cuts its cooldown by 1
const skillCost = r => ({ summ: [0, 1, 2, 3, 5][r], lmd: 800 * r });
function skillUp(key, i) {
  const p = S.ops[key]; if (!p || p.sk[i] >= MAX_SK || !pmv(key)[i]) return false;
  const c = skillCost(p.sk[i]); if ((S.inv.summ || 0) < c.summ || S.lmd < c.lmd) return false;
  S.inv.summ -= c.summ; S.lmd -= c.lmd; p.sk[i]++; S.daily.upgrade++; live("mastery"); return true;
}

// ---------- evolution ----------
// options: [{to, lv?, item?, ok, why}]
function evoOptions(key) {
  const p = S.ops[key]; if (!p) return [];
  return OPS[key].evo.map(e => {
    // (into a region you haven't opened: it waits for that region, the owner's rule: no Crobat before Johto)
    if (!regionOk(e.to)) return { ...e, ok: false, why: `Once you open ${REGION_NAME[regionOf(e.to)]}` };
    if (e.lv) return { ...e, ok: p.lvl >= e.lv, why: p.lvl >= e.lv ? "" : `Reaches Lv ${e.lv}` };
    const n = evoHave(e.item, p);
    return { ...e, ok: n > 0, why: n > 0 ? "" : `Needs ${an(evoItemName(e.item))}` };
  });
}
// an evolution item: in the Bag, or (King's Rock, Metal Coat, Razor Claw, Razor Fang) a held item, the one the Pokémon holds or a spare
const evoHave = (it, p) => HELD[it] ? (p && p.held === it ? 1 : 0) + Math.max(0, heldFree(it)) : S.inv[it] || 0;
function evoUse(it, p) {
  if (!HELD[it]) { S.inv[it]--; return; }
  if (p.held === it) { p.held = null; S.held[it] = Math.max(0, (S.held[it] || 0) - 1); } else S.held[it]--;
}
const canEvolveNow = key => evoOptions(key).some(o => o.ok);
function evolve(key, to) {
  live("evolve");
  const o = evoOptions(key).find(x => x.to === to);
  if (!o || !o.ok) return false;
  const p = S.ops[key];
  if (o.item) evoUse(o.item, p);
  delete S.ops[key];
  const ex = S.ops[to];
  if (ex) {
    // already owned: the two merge into the stronger one, and IVs go up
    ex.lvl = Math.max(ex.lvl, p.lvl); ex.xp = 0; ex.pot = Math.min(6, Math.max(ex.pot, p.pot) + 1);
    ex.sk = ex.sk.map((v, i) => Math.max(v, p.sk[i] || 1));
    if (p.held) { if (!ex.held) ex.held = p.held; else S.held[p.held] = (S.held[p.held] || 0) + 1; }
  } else {
    // the same Ability if the new species has it, else the one in the same place (regular or hidden) on its list
    if (p.ab && !OPS[to].abs.some(a => a.k === p.ab)) {
      const was = OPS[key].abs.find(a => a.k === p.ab), list = OPS[to].abs.filter(a => !!a.h === !!(was && was.h));
      const i = was ? OPS[key].abs.filter(a => !!a.h === !!was.h).indexOf(was) : 0;
      p.ab = (list[Math.min(i, list.length - 1)] || OPS[to].abs[0]).k;
    }
    S.ops[to] = p;
  }
  for (const m in S.team) S.team[m] = [...new Set(S.team[m].map(k => k === key ? to : k))].filter(k => S.ops[k]);
  if (S.assistant === key) S.assistant = to;
  dexCatch(to); S.stats.evolutions++; S.daily.upgrade++;
  // it keeps its moves, and learns what the new species learns at its level (Kadabra's Confusion at Lv 16)
  for (const m of movesAtLevel(to, S.ops[to].lvl)) offerMove(to, m);
  // Nincada: a Shedinja turns up in the empty Poké Ball too (a new one, or its IVs go up if you have it)
  if (o.bonus && OPS[o.bonus]) {
    const r = grantOp(o.bonus, S.ops[to].lvl);
    if (r.isNew) toast(`${OPS[o.bonus].n} appeared in the empty Poké Ball!`, "gold");
  }
  return true;
}

// ---------- Explore: tries per day ----------
// HUNT_TRIES a day for each area (a4_story.js); a try is used by a win (or each Quick Battle). Extra tries cost Gems:
// 60, then 30 more for each one bought that day, up to 300.
const huntUsed = id => (S.daily.hunt || {})[id] || 0;
const huntBought = id => (S.daily.huntBuy || {})[id] || 0;
const huntLeft = id => Math.max(0, HUNT_TRIES + huntBought(id) - huntUsed(id));
const huntTryCost = id => Math.min(300, 60 + 30 * huntBought(id));
function useHuntTries(id, n) { (S.daily.hunt || (S.daily.hunt = {}))[id] = huntUsed(id) + n; }
function buyHuntTry(id) {
  const c = huntTryCost(id); if (S.orundum < c) return false;
  gemsOut(c, "Explore"); (S.daily.huntBuy || (S.daily.huntBuy = {}))[id] = huntBought(id) + 1; return true;
}

// ---------- natures (Mints) and Abilities (Ability Capsule, Ability Patch) ----------
// A Mint gives the Pokémon that nature; the Capsule switches it to another regular Ability; the Patch to its Hidden Ability (or,
// on a Pokémon that has it, back to a regular one). The Poké Mart sells Mints, the BP Exchange the Capsule and the Patch.
function useMint(key, nat) {
  const p = S.ops[key], it = "mint_" + nat;
  if (!p || !(S.inv[it] > 0) || p.nat === nat) return false;
  S.inv[it]--; p.nat = nat; return true;
}
// the Abilities this item could give it
function abilityChoices(key, item) {
  const p = S.ops[key]; if (!p) return [];
  const cur = p.ab || OPS[key].ab, hid = hiddenAbilities(key).includes(cur);
  if (item === "abilitycapsule") return hid ? [] : regularAbilities(key).filter(a => a !== cur);
  if (item === "abilitypatch") return hid ? regularAbilities(key) : hiddenAbilities(key).filter(a => a !== cur);
  return [];
}
function useAbilityItem(key, item, ab) {
  const p = S.ops[key];
  if (!p || !(S.inv[item] > 0) || !abilityChoices(key, item).includes(ab)) return false;
  S.inv[item]--; p.ab = ab; return true;
}

// ---------- moves: learning by level, the Move Reminder, TMs ----------
// Reaching a level where its species learns a move: an empty slot takes the move at once; otherwise the Pokémon wants to
// learn it and you choose whether it forgets the move in that slot (S.learnQ, shown by learnPrompt in a9b_screens.js).
// A move it skipped or forgot can be taught again at the Move Reminder.
function learnLevels(key, from, to) {
  if (!S.ops[key]) return;
  for (let l = from + 1; l <= to; l++) for (const m of movesAtLevel(key, l)) offerMove(key, m);
}
function offerMove(key, m) {
  const p = S.ops[key]; if (!p || !MOVES[m] || pmv(key).includes(m)) return;
  const i = slotOf(m) - 1;
  if (!p.mv[i]) { p.mv[i] = m; toast(`${OPS[key].n} learned ${MOVES[m].n}!`); return; }
  if (!S.learnQ.some(q => q.k === key && q.m === m)) S.learnQ.push({ k: key, m });
}
function learnMove(key, m) { if (!S.ops[key] || !MOVES[m]) return false; pmv(key)[slotOf(m) - 1] = m; return true; }
// the Move Reminder: any move its species learns by level, up to its level, for a fee by slot
const remindable = key => { const p = S.ops[key]; return p ? levelMoves(key, p.lvl).filter(m => !pmv(key).includes(m)) : []; };
const REMIND_COST = { 1: 500, 2: 1000, 3: 2000 };
function remindMove(key, m) {
  const c = REMIND_COST[slotOf(m)];
  if (!remindable(key).includes(m) || S.lmd < c) return false;
  S.lmd -= c; learnMove(key, m); return true;
}
// TMs: the Poké Mart sells six of FireRed/LeafGreen's TMs and HMs at a time, a new six every 15 minutes. Each one teaches a
// move once, to a Pokémon that's compatible with it (S.tms: machine number -> how many you have).
const TM_ROTATE = 15 * 60e3, TM_PRICE = { 1: 1500, 2: 2500, 3: 4000 };
function tmStock(now = Date.now()) {
  const rng = seeded(hash("tm:" + Math.floor(now / TM_ROTATE))), pool = TMS.map(([n]) => n), out = [];
  while (out.length < 6 && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out.sort((a, b) => a - b);
}
const tmPrice = n => TM_PRICE[slotOf(TM_MOVE[n])];
const tmIcon = n => { const t = typeFile(MOVES[TM_MOVE[n]].t).toLowerCase(), k = (tmKind(n) === "HM" ? "hm_" : "tm_") + t; return RES_DATA.item[k] ? pxIcon(RES_DATA.item[k]) : RES_DATA.item["tm_normal"] ? pxIcon(RES_DATA.item["tm_normal"]) : IC.chest; };
function buyTM(n) { if (!tmStock().includes(n) || S.lmd < tmPrice(n)) return false; S.lmd -= tmPrice(n); S.tms[n] = (S.tms[n] || 0) + 1; return true; }
// who could use this TM right now (compatible, and doesn't know the move yet)
const tmFits = (key, n) => !!S.ops[key] && canLearnTM(key, n) && !pmv(key).includes(TM_MOVE[n]);
function teachTM(key, n) {
  if (!(S.tms[n] > 0) || !tmFits(key, n)) return false;
  if (!--S.tms[n]) delete S.tms[n];
  return learnMove(key, TM_MOVE[n]);
}

// ---------- held items ----------
// every starter comes holding Berry Juice (the owner's rule, 2026-10-15, in place of the Sitrus Berry: each region's starter, Unova's
// second too; 20 HP is most of a Lv 5 starter's): one more in the Bag, on the starter unless it already holds something (a starter you
// already had keeps its item, and the Berry Juice waits in the Bag)
function starterBerry(k) { S.held.berryjuice = (S.held.berryjuice || 0) + 1; const p = S.ops[k]; if (p && !p.held) p.held = "berryjuice"; return { k: "held:berryjuice", n: 1 }; }
const heldUsed = k => Object.values(S.ops).filter(p => p.held === k).length;
const heldFree = k => (S.held[k] || 0) - heldUsed(k);
function equipHeld(key, item) {
  const p = S.ops[key]; if (!p) return false;
  if (item && heldFree(item) <= 0) return false;
  p.held = item || null; return true;
}

// ---------- Pokédex ----------
function dexSee(k) { if (S && OPS[k] && !S.dex.seen[k]) S.dex.seen[k] = 1; }
function dexCatch(k) {
  if (!OPS[k]) return;
  if (!S.dex.caught[k]) { live("catch"); if (LEGENDS.includes(k)) (S.legendAt = S.legendAt || []).push(Date.now()); }   // (when you reached each Legendary count)
  S.dex.seen[k] = 1; S.dex.caught[k] = 1;
}
// (by species: a form counts for its species' entry)
const dexCount = o => new Set(Object.keys(o).filter(k => OPS[k]).map(k => OPS[k].id)).size;
const dexSeen = () => dexCount(S.dex.seen);
const dexCaught = () => dexCount(S.dex.caught);

// ---------- catching ----------
const certFor = r => [0, 0, 0, 5, 20, 60][r];
// level a newly caught Pokémon starts at: grows with your Badges, within its region's level cap
const catchLevel = key => Math.min(levelCap(key), 5 + statBadges() * 5);
function grantOp(key, lvl) {
  // a Pokémon from a region you haven't opened (a prize, a gift, a pass): it waits for that region (the owner's rule), and comes
  // when you open it (openRegion)
  if (S.regions && !regionOk(key)) { (S.waitOps = S.waitOps || []).push({ k: key, lvl: lvl || 0 }); toast(`${OPS[key].n} will join you once you open ${REGION_NAME[regionOf(key)]}.`); return { key, isNew: false, wait: true }; }
  dexCatch(key);
  if (!S.ops[key]) { S.ops[key] = mkProg(lvl || catchLevel(key), key); if (!S.assistant) S.assistant = key; return { key, isNew: true }; }
  const p = S.ops[key];
  if (p.pot < 6) { p.pot++; return { key, isNew: false, iv: true }; }
  S.cert += certFor(OPS[key].rar);
  return { key, isNew: false, coins: certFor(OPS[key].rar) };
}
// Safari Zone: everything but the legendaries can turn up; this week's areas feature some (a6d_safari.js)
// (the regions you've opened: playerGens; t is when the area opened, so an area never changes while it's open)
const SAFARI_POOL = (r, t) => { const G = playerGens(t); return OP_KEYS.filter(k => OPS[k].rar === r && !OPS[k].leg && genOk(k, G)); };
// 5★ 3% (+3% per throw after 50 without one, so one is certain by throw 83), 4★ 18%, 3★ 79%. An area can have its own
// odds (the Great Ball Safari doubles both), and a Double-Rate event doubles every area's 5★ chance (a6j_live.js)
const TOP_RATE = .03, MID_RATE = .18, SPARK = 120;
const rate5 = B => (B && B.rate5 || TOP_RATE) * (typeof rateUpOn === "function" && rateUpOn() ? 2 : 1);
const fiveNow = B => Math.min(1, rate5(B) + Math.max(0, S.gacha.pity - 49) * .03);
function rollRarity(B) {
  const top = fiveNow(B), r = R();
  if (r < top) return 5; if (r < top + (B && B.rate4 || MID_RATE)) return 4; return 3;
}
// one throw in area B (a weekly area, the Whole Park, or null for any Pokémon of the rolled rarity)
// In an area with a featured 5★, a 5★ is the featured one half the time (70% split between two in a Joint area); miss it and
// your next 5★ in a featured area is sure to be featured (the guarantee carries over between areas). Every throw in a
// featured area also earns a Safari Point there: SPARK of them trade for its featured 5★ (they expire with the area).
function pullOne(B, forceMin, sureFeat) {
  let rar = rollRarity(B); if (forceMin && rar < forceMin) rar = forceMin;
  if (rar === 5) { S.gacha.pity = 0; S.stats.fives++; } else S.gacha.pity++;
  S.gacha.total++;
  let key = null;
  if (B && !B.std && B.feat6.length) (S.gacha.spark || (S.gacha.spark = {}))[B.id] = (S.gacha.spark[B.id] || 0) + 1;
  if (B && !B.std) {
    if (rar === 5 && B.feat6.length) {
      if (sureFeat || S.gacha.guar || R() < (B.joint ? .7 : .5)) { key = pick(B.feat6); S.gacha.guar = false; }
      else S.gacha.guar = true;
    }
    else if (rar === 4 && B.feat5.length && R() < .5) key = pick(B.feat5);
    else if (rar === 3 && B.feat4.length && R() < .2) key = pick(B.feat4);
  }
  if (!key) key = pick(SAFARI_POOL(rar));
  return grantOp(key);
}
// what n throws cost in area B: its own tickets first (Great Ball Tickets are the only way into the Great Ball Safari), then
// Safari Balls, then Gems: 600 each, the day's first ×1 for 60, ×10 for 5,400, your first ×10 in each event area at half
// price, a Step-Up step's own price
function throwCost(B, n) {
  if (B.only) return S.inv[B.ticket] >= n ? { ok: true, cur: B.ticket, amt: n } : { ok: false, why: `This area only takes ${ITEMS[B.ticket].n}s.` };
  if (B.step) {
    const st = STEP_UP[stepOf(B)]; if (!st) return { ok: false, why: "You've finished every step here." };
    if (n !== 10) return { ok: false, why: "Step-Up throws come ten at a time." };
    return S.orundum >= st.cost ? { ok: true, cur: "orundum", amt: st.cost } : { ok: false, why: "Not enough Gems." };
  }
  if (B.ticket && (S.inv[B.ticket] || 0) >= n) return { ok: true, cur: B.ticket, amt: n };
  if (S.permit >= n) return { ok: true, cur: "permit", amt: n };
  const disc = n === 1 && S.gacha.disc !== today(), half = n === 10 && B.ev && !(S.gacha.half || {})[B.id];
  const amt = n === 1 ? (disc ? 60 : 600) : half ? 2700 : 5400;
  return S.orundum >= amt ? { ok: true, cur: "orundum", amt, disc, half } : { ok: false, why: "Not enough Gems or Safari Balls." };
}
// n throws in area `bannerId` (a weekly area id, an event area's id, or "standard" for the Whole Park). A Step-Up area's ×10
// carries its step's guarantees: at least one 4★, two 4★, a 5★, the 5★ chance doubled, a featured 5★
function headhunt(n, bannerId) {
  const B = bannerById(bannerId || safariAreas()[0].id), res = [];
  const step = B.kind === "step" && n === 10 ? STEP_UP[stepOf(B)] : null;
  for (let i = 0; i < n; i++) {
    const last = i === n - 1 && n === 10 && S.gacha.firstTen && !res.some(r => OPS[r.key].rar >= 4);
    let min = last ? 4 : 0, feat = false;
    if (step) {
      const four = res.filter(r => OPS[r.key].rar >= 4).length, five = res.some(r => OPS[r.key].rar === 5);
      if (i === n - 1 && step.five && !five) { min = 5; feat = !!step.feat; }
      else if (step.four - four >= n - i) min = Math.max(min, 4);
    }
    const B2 = step && step.x2 ? { ...B, rate5: (B.rate5 || TOP_RATE) * 2 } : B;
    res.push(pullOne(B2, min, feat));
  }
  if (step) S.gacha.step[B.id] = stepOf(B) + 1;
  if (n === 10) S.gacha.firstTen = false;
  S.daily.hh += n; live("throw", n, { banner: B.id });
  return res;
}

// Pokémon a Trainer could plausibly have at a level (no Lv 10 Dragonite), excluding legendaries
// (Shedinja comes with Ninjask: Nincada's evolution leaves it; a Pokémon whose evolution needs an item counts as Lv 25)
// (the Ultra Beasts and the Paradox Pokémon don't evolve and aren't Legendary, but they're met at Lv 50 and up, as in their games: no
// Lv 10 Raging Bolt on the Tower's first floor)
const BIG_LONE = k => !OPS[k].from && !OPS[k].leg && OPS[k].b.reduce((a, v) => a + v, 0) >= 570;
const minLevelOf = k => { let lv = BIG_LONE(k) ? 50 : 1, x = k; while (OPS[x].from && OPS[OPS[x].from]) { const e = OPS[OPS[x].from].evo.find(e => e.to === x || e.bonus === x) || {}; lv = Math.max(lv, e.lv || 25); x = OPS[x].from; } return lv; };
// (gens: the regions open, a set of generations, genOk: yours by default, playerGens; true is every region, false Kanto's: older calls)
const fieldable = (lv, finalOnly, all = playerGens()) => { const G = toGens(all); return OP_KEYS.filter(k => !OPS[k].leg && genOk(k, G) && minLevelOf(k) <= lv + 3 && (!finalOnly || !OPS[k].evo.some(e => e.lv && e.lv <= lv))); };


// ---------- Journey progress ----------
const nodeStars = id => S.story[id] || 0;
function nodeOpen(nd) {
  if (nd.idx === 0) { const chs = nd.ep.chapters, ci = chs.indexOf(nd.ch); return ci === 0 || chapterCleared(chs[ci - 1]); }
  let prev = nd.ch.nodes[nd.idx - 1];
  for (let i = nd.idx - 2; prev.type === "side" && i >= 0; i--) prev = nd.ch.nodes[i];   // (past any run of side stages: the stage before them)
  return nodeStars(prev.id) > 0;
}
const chapterCleared = ch => ch.nodes.every(n => n.type === "side" || nodeStars(n.id) > 0);
// the next stage of your Journey: the region you're on (S.region), else any Journey you've opened and not finished
function nextNode() {
  const here = S && S.region, eps = STORY.filter(ep => ep.id === here).concat(STORY.filter(ep => ep.id !== here && (!S.regions || myRegions()[ep.id])));
  for (const ep of eps) for (const ch of ep.chapters) for (const nd of ch.nodes) if (nd.type !== "side" && nodeOpen(nd) && !nodeStars(nd.id)) return nd;
  return null;
}
// the Pokémon a Journey stage takes: its own region's (the owner's rule: each Journey is locked to its region's Pokémon; Kanto's
// are Gen 1's, regional forms their region's); the PvP modes and Explore take any you own, the Battle Tower its wing's (towerOk)
const journeyGen = nd => regionGen(nd.ep.id);
// (the owner's rule, 2026-10-15) in a Journey stage every Pokémon you bring battles at most at that region's level cap right now: a
// Lv 70 Steelix, evolved from a Kanto Onix, fights Falkner at Lv 7. Only for that battle: its real level, Exp. and the rest don't change
// (in a Journey in parts, that part's own cap: stageCap)
const journeyProg = (k, nd) => { const p = S.ops[k], cap = stageCap(nd); return p && p.lvl > cap ? { ...p, lvl: cap } : p; };
const journeyOk = (k, nd) => gensOf(k).includes(journeyGen(nd));
// the Battle Tower (the owner's rules, 2026-10-17): a wing takes its own region's Pokémon only (towerOk, as journeyOk: gensOf), and a
// floor's cap is 2 levels below its strongest opposing Pokémon (towerCap, CAP_BELOW, as a Journey battle's): for you, the Demo
// (towerSquad/towerSim) and the Trainers (towerReach, trainerWingLv)
const towerGen = w => REGION_IDS.indexOf(w) + 1;
const towerOk = (k, w) => gensOf(k).includes(towerGen(w));
const towerCap = T => Math.max(1, T.lv - CAP_BELOW);
const towerProg = (k, T) => { const p = S.ops[k], cap = towerCap(T); return p && p.lvl > cap ? { ...p, lvl: cap } : p; };

// ---------- features open as the adventure goes on ----------
// A new Trainer starts with their first region's Professor and the Journey; everything else opens on the way, a little at a time, each with a
// note the first time (featCheck, then featPopup on the home screen). [id, name, the Journey stage that opens it, where it
// is, what it's for]
const FEATURES = [
  ["party", "Your Pokémon", "1-1", "the Pokémon tab", "Every Pokémon you own: summaries, moves, levels, held items and evolutions."],
  ["mail", "Mail", "1-2", "the home screen", "Gifts, login rewards and letters arrive in your Mail. {prof} has sent you a welcome gift!"],
  ["safari", "Safari Zone", "ch1", "the Safari tab", "Throw Safari Balls (or Gems) to catch new Pokémon. Your welcome gift holds a Safari Pass for ten throws and a Master Ball."],
  ["dex", "Pokédex", "1-4", "the home screen", "{prof}'s Pokédex records every Pokémon you see and catch."],
  ["mart", "Poké Mart and Bag", "1-4", "Shops and Bag, on the home screen", "Spend Poké Dollars on Exp. Candy, evolution stones, Berries and more; your items are in the Bag."],
  ["research", "Daily Research", "1-5", "Research, on the home screen", "A few goals every day, for Gems and items."],
  ["rookie", "Rookie Week", "1-5", "Rookie, on the home screen", "A login bonus for each of your first days, and Rookie Missions to finish within your first 7 days on the server."],
  ["medals", "Medals", "1-6", "the home screen", "Goals for everything you do, each with a reward by Mail."],
  ["explore", "Explore", "1-1", "the Battle tab", "Battle wild Pokémon for evolution stones, held items, Exp. Candy and Poké Dollars, 3 tries a day in each area. Every area is open to everyone, whatever region you're in or how far your Journey has got."],
  ["events", "Event Center", "2-1", "Events, on the home screen", "A free Recharge every hour brings Gems and raises your VIP, Journey Milestones pay for your stars, and the Safari Zone's events are listed. The Gem Shop opens in Shops."],
  ["chat", "Union Room", "2-2", "the home screen", "Chat with the server's Trainers. They'll message you after battles, too."],
  ["passes", "Passes", "2-3", "Event Center, Passes", "Daily, weekly and season missions fill the Trainer Pass, and the Monthly Check-In has a reward for every day of the month."],
  ["offers", "Offers", "2-4", "Shops, Offers", "Packages and deals for Gems and Lucky Bags; and in the Event Center's Passes: the Poké Pass, the Growth Fund and {prof}'s Investment Plan."],
  ["lucky", "Lucky Events", "2-5", "Event Center, Events", "{prof}'s Scratch-Off (a free card every day), the daily Champion Lottery and Server Auction, and the Poké Wheel, Adventure Board and more on their days."],
  ["tower", "Battle Tower", "2-7", "the Battle tab", "Famous Trainers from each region's games, a wing per region: the teams its other versions gave them, rematches, and the Trainers you meet after the League."],
  ["rush", "Rushes and the Calendar", "3-2", "Event Center", "Rushes rank the server on one thing at a time, Recharge and Spending tallies pay as you go, festivals come with the seasons, and the Calendar shows the week ahead."],
  ["club", "Clubs", "3-4", "Club, on the home screen", "Join a Club: contribute every day and take on Raid Battles together."],
  ["ranked", "Ranked Battles", "3-6", "Battle tab, Battle Stadium", "Battle other Trainers' Registered Teams for points, from the Beginner tier up to Legend. The weekly Ranked Race pays your place by Mail."],
  ["tm", "TMs", "4-3", "Shops, TMs", "{store}'s TM corner: six TMs at a time, each teaching its move once."],
  ["boutique", "Boutique", "4-3", "Shops, Boutique", "{store}'s Boutique: new looks for your Trainer (every Trainer you meet wears one), worn from your Trainer Card."],
  ["prize", "Prize Corner", "4-4", "Shops, Prize Corner", "Trade Game Corner Coins for rare Pokémon and Safari Balls."],
  ["slots", "Game Corner", "4-4", "Shops, Prize Corner", "Smeargle's slot machine: 3 Coins a spin, and 7-7-7 starts the Starter Bonus. Game Corner Fever on Mondays gives 20 free spins."],
  ["server", "Server", "4-7", "Event Center, Server", "Goals the whole server shares, its firsts and its all-time rankings."],
  ["evostones", "More evolution items", "2-6", "Shops, Poké Mart", "The Poké Mart now sells the other regions' evolution items: the Sun, Ice, Oval, Shiny, Dusk and Dawn Stones, the Soothe Bell for Pokémon that evolve by friendship, and Kalos to Paldea's everyday ones (the Sachet, Whipped Dream, Sweets, Apples, Cracked Pot and Unremarkable Teacup)."],
  ["linkcord", "Linking Cord", "6-1", "Shops, Poké Mart", "The Poké Mart's evolution items now include the Linking Cord (it evolves Kadabra, Machoke, Graveler, Haunter and the other Pokémon that evolve by trading) and the items the rest evolve with: King's Rock, Metal Coat, Dragon Scale, Up-Grade, Dubious Disc, Protector, Electirizer, Magmarizer, Reaper Cloth, Deep Sea Tooth and Scale, Prism Scale, Razor Claw, Razor Fang, the Leek, the Galarica Cuff and Wreath, the Scrolls of Darkness and Waters, Black Augurite, the Peat Block, the Auspicious and Malicious Armor, the Leader's Crest, the Metal Alloy and the Gimmighoul Coin."],
  ["link", "Link Battles", "5-3", "Battle tab, Battle Stadium", "A live draft and battle against another Trainer. Their Battle Points buy held items at the BP Exchange (Shops)."],
  ["regions", "The next region", JOURNEY_END, "the Journey tab", "Your first Journey is complete! Choose the next region on the Journey tab: its Professor gives you one of its three starters at Lv 5, and its Pokémon start turning up in the Safari Zone. One region at a time; once you've opened all nine, the Safari Zone's other areas open too (the weekly areas, the Legendary Safari, the Mythical Distributions and the other event areas)."],
];
const FEAT = Object.fromEntries(FEATURES.map(f => [f[0], f]));
const featOn = id => !!S && (!FEAT[id] || nodeStars(firstStage(FEAT[id][2])) > 0);
// Features open along your first Journey, whichever region it is (the owner's rule): FEATURES name Kanto's stages, and
// another region's first Journey opens each at the stage the same part of the way through
const FIRST_MAP = {};
// ("ch1": the end of your first Journey's first chapter, whichever region it is: the Safari Zone opens there, the owner's rule, 2026-10-15)
const chapter1End = id => { const ep = journeyOf(id) || journeyOf("kanto"), M = ep.chapters[0].nodes.filter(nd => nd.type !== "side"); return M[M.length - 1].id; };
function firstStage(kid) {
  if (kid === "ch1") return chapter1End((S && S.first) || "kanto");
  const f = S && S.first; if (!f || f === "kanto" || !journeyOf(f)) return kid;
  const key = f + ":" + kid; if (FIRST_MAP[key]) return FIRST_MAP[key];
  const K = journeyMain("kanto"), i = K.findIndex(nd => nd.id === kid), M = journeyMain(f);
  return (FIRST_MAP[key] = i < 0 ? kid : M[Math.min(M.length - 1, Math.round(i / Math.max(1, K.length - 1) * (M.length - 1)))].id);
}
// ---------- your regions (the Journey revamp: docs/journey-revamp-plan.md) ----------
// S.regions: the regions you've opened, { id: { at, starter, done, badges, champ } } (at: when you opened it; done: when you
// completed its Journey; a Journey in parts, PART_NAME in a4_story.js, adds starter2, its Part 2 starter, and pb: { 2: Part 2's Badges });
// S.region: the one you're on; S.first: your first Journey's. A new game opens the region you choose (one
// with a Journey: Kanto's, so far) and its Professor gives you its starter. Once every region you've opened is done you choose the
// next (the owner's rule: one at a time), and its starter joins you at Lv 5. A region whose Journey is still coming soon counts as
// done once it's open (its Pokémon come; its Journey later). Only your open regions' Pokémon turn up in the Safari Zone, and
// prizes, gifts and evolutions from the others wait for them (grantOp, evoOptions); the Safari Zone's other areas (the weekly
// ones, the event areas) open once all nine are open and done (specialSafari). Each Journey takes its own region's Pokémon only
// (journeyOk); everything else takes any you own. A Trainer's regions are their own (trainerGens).
const KANTO_ONLY = new Set([1]);
// what a region's Journey gives you: its catches and gifts, its chests' and chapters' Pokémon (Kalos's by your starter: every one). Each
// counts as that region's too (the owner's rule, 2026-10-16: Clair's Dratini battles in Johto's Journey, the Max Lair's Legendaries
// in Galar's): MORE_GENS, gensOf
function journeyGifts(ep) {
  const out = [], add = k => { if (k && OPS[k] && !out.includes(k)) out.push(k); };
  const own = (o, f) => { const d = o && Object.getOwnPropertyDescriptor(o, f); return d && !d.get ? d.value : null; };
  if (ep.id === "kalos") for (const st of regionStarters("kalos")) { add(kalosKantoGift(st)); add(kalosBird(st)); }
  for (const ch of ep.chapters) {
    add((own(ch, "reward") || {}).op);
    for (const nd of ch.nodes) { add(own(nd, "catch")); add(own(nd, "gift")); add((own(nd, "reward") || {}).op); }
  }
  return out;
}
for (const ep of STORY) { const g = REGION_IDS.indexOf(ep.id) + 1; for (const k of journeyGifts(ep)) if (!gensOf(k).includes(g)) (MORE_GENS[k] = MORE_GENS[k] || []).push(g); }
const toGens = x => x instanceof Set ? x : x === true ? ALL_GENS : KANTO_ONLY;
const myRegions = () => (S && S.regions) || {};
const regionGen = id => REGION_IDS.indexOf(id) + 1;
const regionAt = id => (myRegions()[id] || {}).at;
const regionDoneAt = id => { const r = myRegions()[id]; return !r ? null : journeyOf(id) ? r.done || null : r.at; };
// the regions open to you at t, as generations (Kanto's before a new game's first choice)
function playerGens(t = Date.now()) { const g = new Set(); for (const id in myRegions()) if (regionAt(id) <= t) g.add(regionGen(id)); return g.size ? g : KANTO_ONLY; }
const regionOk = (k, t) => genOk(k, playerGens(t));
const legendsNow = (all = playerGens()) => { const G = toGens(all); return LEGENDS.filter(k => genOk(k, G)); };
// every region open and done by t: the Safari Zone's other areas (an area that opened before stays as it opened)
const specialSafari = (t = Date.now()) => !!S && REGION_IDS.every(id => { const d = regionDoneAt(id); return d != null && d <= t; });
// the regions you can choose next: none until every one you've opened is done, and only those whose Journey is built (the owner's
// rule, 2026-10-15: one region at a time, each finished before the next; a region still coming soon stays locked until it's built)
const nextRegions = () => !S || !S.region || Object.keys(myRegions()).some(id => regionDoneAt(id) == null) ? [] : REGION_IDS.filter(id => !myRegions()[id] && journeyOf(id));
// open a region: you're on it now, and whatever waited for it comes (prizes, gifts: grantOp)
function openRegion(id, at = Date.now()) {
  if (!S.regions) S.regions = {};
  if (!S.regions[id]) S.regions[id] = { at, starter: null, done: null };
  S.region = id; if (!S.first) S.first = id;
  if (journeyOf(id) && typeof UI !== "undefined") UI.jr = id;   // (the Journey tab shows the new Journey)
  const came = [], wait = S.waitOps || [];
  S.waitOps = wait.filter(x => !regionOk(x.k));
  for (const x of wait) if (regionOk(x.k)) { const r = grantOp(x.k, x.lvl || null); came.push({ k: "op:" + x.k, n: 1, isNew: r.isNew }); }
  return came;
}
// your first region (Kanto's until a new game chooses), its Professor and its Department Store: who sends the welcome gift and the
// research supplies, whose Pokédex it is, whose Investment Plan and Scratch-Off, where the TM corner and the Boutique are
const firstRegion = (s = S) => (s && (s.first || s.region)) || "kanto";
const profName = (s = S) => (regionCard(firstRegion(s)) || REGION_KANTO).prof[0];
const profFull = (s = S) => profName(s).replace(/^Prof\. /, "Professor ");
const profPic = (s = S) => { const r = regionCard(firstRegion(s)) || REGION_KANTO; return r.id === "kanto" ? "oak" : "rg_" + r.prof[1]; };
const DEPT_STORE = { kanto: "Celadon Dept. Store", johto: "Goldenrod Dept. Store", hoenn: "Lilycove Dept. Store", sinnoh: "Veilstone Dept. Store", kalos: "Lumiose City", alola: "Hau'oli City's Shopping Mall", galar: "Wyndon", paldea: "Mesagoza" };   // (Kalos has no store: Lumiose's boutiques; Galar's are in Wyndon, Paldea's in Mesagoza)
const deptStore = (s = S) => DEPT_STORE[firstRegion(s)] || "the Department Store";
// the regions you're Champion of, and when your first title came (the Hall of Fame debut, in play time)
const champRegions = () => REGION_IDS.filter(id => regionChamp(id));
const hofDebut = () => { const t = [S.champion ? S.hofMs : null, ...Object.values(myRegions()).map(r => r.champ ? r.hofMs : null)].filter(x => x != null); return t.length ? Math.min(...t) : null; };
// a region's record, made if it's missing (a save from before, a test that set up a Journey by hand)
const regionRec = id => (S.regions || (S.regions = {}))[id] || (S.regions[id] = { at: (S.world && S.world.start) || Date.now(), starter: id === "kanto" ? S.starter : null, done: null });
// a Trainer's own Kanto Journey (the owner's rule: their progress, never yours): done once their Pokémon are at the level of its
// last battle (Mewtwo, Lv 70), so everyone from the Ultra Ball tier up and the strongest in Great Ball fields every region's Pokémon,
// the rest Kanto's. (Your own Journey still decides the Safari Zone.)
const KANTO_LV = () => (NODES[JOURNEY_END] || {}).lv || 70;
const kantoDoneAt = L => L >= KANTO_LV();
// every Explore area is open to everyone once Explore is, from the first Pokémon on (the owner's rule, 2026-10-15: not tied to a region
// or the Journey; you, the Demo and the Trainers alike)
const huntOn = h => featOn("explore");
// each Shops tab and the feature that opens it (the PP refill behind the PP button is always there)
const SHOP_FEAT = { offers: "offers", mart: "mart", tm: "tm", prize: "prize", bp: "link", gems: "events", boutique: "boutique" };
const shopOn = t => !SHOP_FEAT[t] || featOn(SHOP_FEAT[t]);
// what just opened: a toast now, a note on the home screen
function featCheck() {
  if (!S || !S.featSeen) return;
  const fresh = [];
  for (const [id, n] of FEATURES) if (!S.featSeen[id] && featOn(id)) { S.featSeen[id] = 1; fresh.push(id); }
  if (!fresh.length) return;
  S.featNew = [...(S.featNew || []), ...fresh];
  toast(`New: ${fresh.map(featName).join(", ")}!`, "gold");
}
const featText = t => t.replace(/\{prof\}/g, profFull()).replace(/\{store\}/g, deptStore());
const featName = id => id.startsWith("hunt:") ? `Explore ${HUNTS.find(h => h.id === id.slice(5)).n}` : FEAT[id][1];
function featPopup() {
  if (!S || !(S.featNew || []).length || !UI.inGame || BT.on || UI.view !== "home" || !$("#modal").hidden || (typeof DRAFT !== "undefined" && DRAFT)) return;
  const list = S.featNew; S.featNew = [];
  openModal(`<div class="stack"><div class="eyebrow">Something new</div><h2>${list.length > 1 ? "New features!" : esc(featName(list[0])) + " is open!"}</h2>
    ${list.map(id => { const h = id.startsWith("hunt:") && HUNTS.find(x => x.id === id.slice(5)), f = FEAT[id];
      return `<section class="stack" style="gap:2px"><b>${esc(featName(id))}</b><span class="tiny dim">${h ? `the Battle tab · ${esc(h.sub)}` : esc(f[3])}</span><span class="small">${h ? `A new Explore area for ${huntKind(h) === "candy" ? "Exp. Candy and Rare Candies" : huntKind(h) === "money" ? "Poké Dollars" : itemName(h.stone) + "s and held items"}.` : esc(featText(f[4]))}</span></section>`; }).join("")}
    <button class="btn wide" data-act="closeModal">Got it</button></div>`);
}
