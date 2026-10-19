// =====================================================================
//  COMPETITIVE TEAMS: the archetypes top Stadium Trainers build, and the sets Legend Trainers give them
// =====================================================================
// Tiers come from a Trainer's strength (qTier: the Stadium tier their true rating sits in):
// Every tier's Pokémon levels are the team config's (tiers[].levels, the owner's: Beginner 1-30, Poké Ball 31-50, Great Ball 51-70,
// Ultra Ball 71-90, Master Ball 91-100, Lv 100 above): tierLevels, tierLevelOf, monLevelIn.
// The rates are the config's tiers (the owner's, 2026-10-15): half of every Trainer below Master Ball runs an archetype team; from
// Master Ball up everyone does, with all 8 Badge bonuses (instead of the hidden bonus weaker Trainers get):
//   Master Ball: ★ Mastery on every move for half, perfect IVs and fully optimized sets for a quarter
//   Veteran:     half of each
//   Expert:      ★ Mastery for all, perfect IVs and fully optimized sets for three in four
//   Legend:      all of it: perfect IVs and competitive sets, moves, Abilities, items and natures chosen for the role
//                and the team (the setter carries its weather rock, Swift Swim sweepers run Swift Swim, Trick Room attackers
//                run minus-Speed natures, no two hold the same item, attacks cover what teammates don't)
// The archetypes are the owner's (the team config): weather (Rain; Sun, Sand and Snow with their setters' Abilities and a backup
// setter on the bench), speed control (Trick Room with a backup setter, Tailwind with a priority setter), Priority Offense, Follow Me
// setup, Hazard Phazing, Hyper Offense, Bulky Offense, Balance and Stall. Each is a list of roles filled from every Pokémon by what
// they can really do (who has Drought, who learns Follow Me, who's slow enough for Trick Room), then whoever best covers the team's
// shared weaknesses. Some join another as a second plan (the config's overlaps: Tailwind, Priority Offense, Follow Me and Hazard
// Phazing). Archetype Trainers lead with their setters and keep the backups on the bench (npcLeads).

const T_MASTER = 4, T_VETERAN = 5, T_EXPERT = 6, T_LEGEND = 7;
// a tier's Pokémon levels, [lowest, highest] (the team config's; null: a Trainer's own level, as before the owner set them)
const tierLevels = t => { const T = TEAM_CONFIG.tiers[t]; return T && Array.isArray(T.levels) && T.levels.length === 2 ? T.levels : null; };
// a Trainer's level in tier t: where their rating sits in the tier's points (the stronger, the higher), within its levels
function tierLevelOf(q, t, band = tierLevels(t)) {
  if (!band) return null;
  // (Beginner from the lowest rating there is, a brand-new Trainer's, so its levels start at its lowest)
  const lo = t === 0 ? qRating(0) : TIERS[t].min, hi = TIERS[t + 1] ? TIERS[t + 1].min : lo + 300, f = clamp((qRating(q) - lo) / (hi - lo), 0, 1);
  return Math.round(band[0] + f * (band[1] - band[0]));
}
// one Pokémon's level on a Trainer of level L in that band: a few below to a few above, never outside the tier's levels or below
// the level it evolves at (one that can't be that low isn't fielded there: fitsBand)
const monLevelIn = (L, k, band, rng) => clamp(L + Math.round((rng() - .6) * 10), Math.max(band[0], minLevelOf(k)), band[1]);
const fitsBand = (k, band) => !band || minLevelOf(k) <= band[1];
const qTier = q => tierIdx(qRating(q));
// ---------- what a Pokémon can do ----------
const LEARN_SET = {};
const learns = (k, m) => !!MOVES[m] && (LEARN_SET[k] || (LEARN_SET[k] = new Set(learnPool(k)))).has(m);
const learnsAny = (k, ms) => ms.find(m => learns(k, m)) || null;
const hasAb = (k, a) => OPS[k].abs.some(x => x.k === a);
const isT = (k, t) => OPS[k].types.includes(t);
const bs = k => OPS[k].b;   // [HP, Attack, Defense, Sp. Atk, Sp. Def, Speed]
const offOf = k => Math.max(bs(k)[1], bs(k)[3]);
const bulkOf = k => bs(k)[0] + (bs(k)[2] + bs(k)[4]) / 2;
const physK = k => bs(k)[1] >= bs(k)[3];
const SETUP_P = ["dragondance", "swordsdance", "shellsmash", "bellydrum", "bulkup", "coil", "honeclaws", "curse"];
const SETUP_S = ["quiverdance", "nastyplot", "calmmind", "shellsmash", "growth", "workup"];
const RECOVER = ["softboiled", "recover", "slackoff", "roost", "moonlight", "morningsun", "synthesis", "milkdrink", "shoreup", "wish", "rest"];
const HAZARDS = ["stealthrock", "spikes", "toxicspikes"], PHAZE = ["roar", "whirlwind", "dragontail", "circlethrow"];
const STATUSERS = ["toxic", "willowisp", "thunderwave", "spore", "sleeppowder", "yawn"], PIVOTS = ["uturn", "voltswitch", "flipturn"];
const setupOf = k => learnsAny(k, physK(k) ? SETUP_P : SETUP_S) || learnsAny(k, ["agility", "rockpolish"]);
// priority attacks (Fake Out has a role of its own): each one a Pokémon knows adds 10% turn meter a point of priority the moment it's sent out
const PRI_ATK = () => PRI_ATK.v || (PRI_ATK.v = Object.keys(MOVES).filter(m => MOVES[m].pri > 0 && MOVES[m].c !== "X" && MOVES[m].p > 0 && m !== "fakeout"));
const priAtks = k => PRI_ATK().filter(m => learns(k, m));
const PLEDGES = ["firepledge", "waterpledge", "grasspledge"];
// who can stand in a competitive team: fully evolved, any of them, Legendaries, Mythicals, Ultra Beasts and Paradox Pokémon too, within
// the PvP limits every PvP team keeps, theirs and yours (pvpLimits; the owner's rule). The config's rules.restricted is empty; a Pokémon
// put there would go only to the very strongest Trainers, and never as a setter or support
const RESTRICTED = TEAM_CONFIG.rules.restricted || [];
// the PvP limits (the owner's rule, the team config's rules.limits, a mode's own limits on top): at most this many Legendary, Mythical,
// Ultra Beast and Paradox Pokémon on a team, in every Stadium mode (Ranked, Link, Friendly), for every Trainer and for you
const pvpLimits = mode => ({ ...(TEAM_CONFIG.rules.limits || {}), ...(((TEAM_CONFIG.modes || {})[mode] || {}).limits || {}) });
// the first group a team has too many of (null: none)
const pvpClash = (keys, L = pvpLimits()) => { for (const g in L) if (L[g] != null && keys.filter(k => pvpGroups(k).includes(g)).length > L[g]) return g; return null; };
const pvpFits = (team, k, L = pvpLimits()) => !pvpClash([...team, k], L);
// a team kept within the limits: each in order, unless it's one too many
const pvpTrim = (keys, L = pvpLimits()) => { const out = []; for (const k of keys) if (pvpFits(out, k, L)) out.push(k); return out; };
const pvpText = g => `In Stadium battles a team can have ${({ 1: "one", 2: "two", 3: "three" })[pvpLimits()[g]] || pvpLimits()[g]} ${PVP_GROUPS[g]} Pokémon at most.`;
// (fully evolved, plus the ones that still evolve but stand in competitive teams with an Eviolite: the config's rules.nfe, Porygon2...)
const COMP_POOL = () => COMP_POOL.v || (COMP_POOL.v = OP_KEYS.filter(k => (!OPS[k].evo.length || (TEAM_CONFIG.rules.nfe || []).includes(k)) && OPS[k].skills.length >= 2));

// ---------- the archetypes: from the team config (config/team_config.json, edited on the Team Config page,
// "Pokemon Kanto Squad Team Config.html"; build.sh embeds it as TEAM_CONFIG). Never write archetypes or roles here. ----------
// A role (TEAM_CONFIG.roles[id]): the Pokémon that fit it, each with a fit score (higher is picked first), the moves, Abilities and
// items it's there for and which of them it keeps (the rest is optimized), whether it leads, waits on the bench (a backup setter)
// or is needed (a team that can't fill it isn't that archetype), whether it keeps a priority move beside its job (turn meter by its priority
// when it comes in), how much raw strength counts against the fit when it's picked (power, fitWeight), moves it keeps only in
// some archetypes (onlyIn: Growth in Sun teams), and its kind (setter, wall, phazer...: what Trainers say it does in chat).
// An archetype: its sub-archetypes, each a list of [role, how many] slots (filled in order), then the strongest of the rest; the
// archetypes it can join as a second plan (overlaps) and how often it does (overlapChance, %).
const roleCfg = id => TEAM_CONFIG.roles[id] || { name: id, kind: id, pokemon: {}, moves: [], abilities: [], items: [], keep: {} };
const roleKind = id => roleCfg(id).kind || id;
// moves a role keeps only on some of its Pokémon: "special" (Sp. Atk at least its Attack), "notType:Water"...
const movesIfOk = (conds, k) => (conds || []).every(c => c === "special" ? bs(k)[3] >= bs(k)[1] : c.startsWith("notType:") ? !isT(k, c.slice(8)) : true);
function cfgRole(id) {
  const C = roleCfg(id), fit = C.pokemon || {}, K = C.keep || {}, only = C.onlyIn || {};
  const mv = C.moves && C.moves.length ? C.moves : null;
  // a move it keeps only in some archetypes (Growth only in Sun teams): ids, the team's archetypes
  const mvOk = (m, ids) => !only[m] || !only[m].length || only[m].some(a => ids.includes(a));
  return { r: id, kind: C.kind || id, name: C.name, ok: k => fit[k] != null, sc: k => fit[k] || 0,
    mv, ab: C.abilities && C.abilities.length ? C.abilities : null, item: C.items && C.items.length ? C.items : null, mvOk,
    // (a role there for moves it always keeps takes only a Pokémon that learns one, one allowed in this team)
    // (kn: whether this Trainer's Pokémon can know it now, at its level and with their TMs; anyone's learnset otherwise)
    can: (k, ids, kn = learns) => !(K.moves && mv) || mv.some(m => mvOk(m, ids) && kn(k, m)),
    lead: !!C.lead && !C.bench, bench: !!C.bench, need: !!C.need, power: C.power, fitWeight: C.fitWeight,
    pri: !!C.priorityMove, setup: !!C.setupSweeper, keep: K, mvIf: C.movesIf && C.movesIf.length ? k => movesIfOk(C.movesIf, k) : null,
    // (the owner's picks for the role, taken before anyone else it fits: list; what one of them always runs there: keepFor)
    list: C.list && C.list.length ? C.list : null, keepFor: C.keepFor || {},
    // (a backup setter: the lead setter's role it backs up; oneHolds: items one of this role's Pokémon always holds, Ring Target)
    backupOf: C.backupOf || null, oneHolds: C.oneHolds && C.oneHolds.length ? C.oneHolds : null };
}
// a role by its id (roles are shared: an archetype's, or the one it joined; "cover" is the rest of the team)
const ROLE = id => ROLE.c[id] || (ROLE.c[id] = cfgRole(id)); ROLE.c = {};
const archetypesOf = cfg => cfg.archetypes.map(a => {
  const roles = [], slots = {};
  // (a slot is [role, how many, how many come along when this plan joins another]: by default all of a role it needs, none of the rest)
  for (const S of a.subs) slots[S.name] = S.slots.map(([id, n, j]) => { const R = ROLE(id); if (!roles.includes(R)) roles.push(R); return [R, n, j != null ? j : R.need ? n : 0]; });
  return { id: a.id, vi: a.weight, n: a.name, subs: a.subs.map(S => S.name), slots, roles, coverMaxSpeed: a.coverMaxSpeed, sub: Object.fromEntries(a.subs.map(S => [S.name, S])),
    overlaps: a.overlaps || [], overlapChance: a.overlapChance || 0 };
});
const ARCHETYPES = archetypesOf(TEAM_CONFIG);
// a changed team config in place (tools/viability.js --patch tries roles and archetypes without a build): the roles read anew
function reloadTeamConfig() { ROLE.c = {}; ARCHETYPES.splice(0, ARCHETYPES.length, ...archetypesOf(TEAM_CONFIG)); NPC_BUILD.clear(); }
const archById = id => ARCHETYPES.find(a => a.id === id);
// a Trainer's plan as they'd name it: "Sun", or "Sun + Follow Me" with a second plan; and its sub-archetypes
const archName = arch => arch ? arch.n + (arch.over ? " + " + arch.over.n : "") : "";
const archSub = arch => arch ? arch.sub + (arch.over ? ", " + arch.over.sub : "") : "";
// the archetype ids a Trainer's team plays (its own, and the one that joined it)
const archIds = arch => arch ? [arch.id, ...(arch.over ? [arch.over.id] : [])] : [];
// the plans Trainers quote in chat (a6c_lines.js has the first wording; the config's wins)
for (const a of TEAM_CONFIG.archetypes) { if (a.plan) ARCH_PLAN[a.id] = a.plan; for (const S of a.subs) if (S.plan) ARCH_SUB_PLAN[S.name] = S.plan; }
// the rules for every Trainer team (TEAM_CONFIG.rules), and a mode's own on top (TEAM_CONFIG.modes: Ranked, Link, Friendly; a mode
// added later takes the default's)
const banSet = b => ({ pokemon: new Set((b && b.pokemon) || []), moves: new Set((b && b.moves) || []), abilities: new Set((b && b.abilities) || []), items: new Set((b && b.items) || []) });
const TEAM_BAN = banSet(TEAM_CONFIG.rules.ban);
function modeRules(mode) {
  const D = TEAM_CONFIG.modes.default || {}, M = (mode && TEAM_CONFIG.modes[mode]) || {}, own = M.inherit === false ? M : { ...D, ...M, ban: undefined };
  const b = banSet(TEAM_CONFIG.rules.ban), add = x => { if (!x) return; for (const k of ["pokemon", "moves", "abilities", "items"]) for (const v of x[k] || []) b[k].add(v); };
  add(D.ban); if (mode && TEAM_CONFIG.modes[mode]) add(TEAM_CONFIG.modes[mode].ban);
  return { ban: b, limits: pvpLimits(mode) };
}
// a Trainer as a mode fields them ("ranked", "link", "friendly", or a mode added later): a Pokémon that mode bans, or one past
// the PvP limits (one Legendary, one Mythical, one Ultra Beast, one Paradox), gives its place to the next in their box; a banned item comes off. The same Trainer when the
// mode adds nothing to what every Trainer team already follows.
function modeDoc(doc, mode) {
  if (!doc) return doc;
  const R = modeRules(mode), B = R.ban, team = [];
  const fits = k => doc.prog[k] && !B.pokemon.has(k) && pvpFits(team, k, R.limits);
  for (const k of doc.team) if (fits(k)) team.push(k);
  for (const k of doc.roster || []) if (team.length < doc.team.length && !team.includes(k) && fits(k)) team.push(k);
  const badItem = k => doc.prog[k] && doc.prog[k].held && B.items.has(doc.prog[k].held);
  const roster = (doc.roster || []).filter(k => doc.prog[k] && !B.pokemon.has(k));
  if (team.join() === doc.team.join() && !(doc.roster || []).some(badItem) && roster.length === (doc.roster || []).length) return doc;
  const prog = { ...doc.prog }; for (const k in prog) if (badItem(k)) prog[k] = { ...prog[k], held: null };
  return { ...doc, team, prog, roster: [...team, ...roster.filter(k => !team.includes(k))] };
}
// a priority move (Grassy Glide counts: it has priority in Grassy Terrain): 10% turn meter a point of priority for each one known, the moment it comes in
const isPri = m => MOVES[m] && (MOVES[m].pri > 0 || MOVES[m].sp === "grassyglide");
function roleLocks(acc, ac) {
  const out = {}, used = new Set(), ids = archIds(acc.arch); if (!archById(acc.arch.id)) return out;
  // (a Trick Room team keeps no move that slows the other side down, the owner's rule: Thunder Wave is no status move for it)
  const tr = acc.team.some(k => { const R = acc.roles[k] && acc.roles[k] !== "cover" ? ROLE(acc.roles[k]) : null; return R && R.mv && R.keep.moves && R.mv.includes("trickroom"); });
  for (const k of acc.team) {
    const R0 = acc.roles[k] && acc.roles[k] !== "cover" ? ROLE(acc.roles[k]) : null; if (!R0) continue;
    const keep = R0.keep || {};
    const R = { ...R0, mv: keep.moves ? R0.mv : null, ab: keep.abilities ? R0.ab : null, item: keep.items ? R0.item : null, setup: !!keep.setup && R0.setup };
    const pr = acc.prog[k] || {}, P = new Set([...levelMoves(k, pr.lvl || 100), ...OPS[k].tms.filter(n => !ac.tms || ac.tms.has(n)).map(n => TM_MOVE[n]).filter(Boolean)]);
    const L = out[k] = { keys: [] };
    if (R.ab) { const a = R.ab.find(a => hasAb(k, a) && (ac.patch || !hiddenAbilities(k).includes(a))); if (a) L.ab = a; }
    // (a setter that has the field's own Ability sets it with that, whether its role asks for the Ability or the move: Electric
    // Terrain's lead can be a Pokémon with the move or one with Electric Surge, whichever hits less hard)
    else if (SETTER_KINDS.has(R0.kind) && R0.ab) { const a = R0.ab.find(a => hasAb(k, a) && (WX_AB[a] || abilityOf(a).id === "SURGE") && (ac.patch || !hiddenAbilities(k).includes(a))); if (a) L.ab = a; }
    if (R.mv && (!R.mvIf || R.mvIf(k)) && !(SETTER_KINDS.has(R.kind) && L.ab && (WX_AB[L.ab] || abilityOf(L.ab).id === "SURGE"))) {   // (Drought, Drizzle, Sand Stream and Snow Warning set the weather themselves, and the Surge Abilities and Hadron Engine their terrain)
      // (an attacking role keeps the first of its moves on the side it hits harder from, Psychic for a special attacker, Psychic Fangs
      // for a physical one; a setter or support takes a different one from its teammates in the same role where it can)
      const can0 = R.mv.filter(m => P.has(m) && R.mvOk(m, ids) && !(tr && slowsFoe(m))), off = ["attacker", "nuke", "spread", "sweeper", "abuser"].includes(R.kind), cat = physK(k) ? "P" : "S";
      const can = off && can0.some(m => MOVES[m].c === cat) ? can0.filter(m => MOVES[m].c === cat) : can0, m = off ? can[0] : can.find(m => !used.has(R.r + ":" + m)) || can[0];
      if (m) { L.keys.push(m); used.add(R.r + ":" + m); }
    }
    if (R.setup) { const m = [...(physK(k) ? SETUP_P : SETUP_S), "agility", "rockpolish"].find(m => P.has(m)); if (m && !L.keys.some(x => slotOf(x) === slotOf(m))) L.keys.push(m); }
    // priority attackers keep their two best priority attacks (in different slots)
    if (keep.priorityAttacks) for (const m of [...P].filter(m => PRI_ATK().includes(m)).sort((a, b) => moveValue(k, b) - moveValue(k, a)))
      if (L.keys.length < 2 && !L.keys.some(x => slotOf(x) === slotOf(m))) L.keys.push(m);
    if (R.pri && (L.keys.length || !R.mv)) {   // (a role there for its priority, with no move job of its own, keeps one too)
      const pm = [...P].filter(m => isPri(m) && !L.keys.some(x => slotOf(x) === slotOf(m))).sort((a, b) => moveValue(k, b) - moveValue(k, a))[0];
      if (pm) L.keys.push(pm);
    }
    if (R.item) L.items = R.item;
    // what the owner says this Pokémon always runs in the role: a move (Bolt Beak, Fishious Rend), an item (Ring Target, Light Ball)
    const kf = (R0.keepFor || {})[k];
    if (kf) { for (const m of kf.moves || []) if (P.has(m) && !L.keys.includes(m)) { L.keys = L.keys.filter(x => slotOf(x) !== slotOf(m)); L.keys.push(m); }
      if (kf.items && kf.items.length) L.items = kf.items; }
    // a setter with neither the field's Ability nor its role's own move: the move that brings the field instead (Sunny Day for
    // Drought, a Trainer still building their playstyle)
    if (SETTER_KINDS.has(R0.kind) && R0.ab && !(L.ab && (WX_AB[L.ab] || abilityOf(L.ab).id === "SURGE")) && !L.keys.some(m => R0.mv && R0.mv.includes(m))) {
      const sub = fieldMoves(R0.ab).find(m => P.has(m)); if (sub && !L.keys.some(x => slotOf(x) === slotOf(sub))) L.keys.push(sub);
    }
    // a lead setter doing a support's job too (acc.cover, buildArch): it keeps that move (Aurora Veil, Follow Me, a screen)
    const cv = acc.cover && acc.cover[k], cm = cv && coverMove(ROLE(cv), k, ids, (_, m) => P.has(m), L.keys.map(slotOf));
    if (cm && !L.keys.some(x => slotOf(x) === slotOf(cm))) L.keys.push(cm);
  }
  // an item one of a role's Pokémon always holds (the config's oneHolds; the owner's rule: every Electric Terrain team has a Ring
  // Target): the one the owner named for it (Regieleki), else the strongest of that type with no item of its own to keep (Item
  // Clause: one a team)
  for (const R of new Set(acc.team.map(k => acc.roles[k]).filter(r => r && r !== "cover").map(ROLE))) for (const o of R.oneHolds || []) {
    const mem = acc.team.filter(k => acc.roles[k] === R.r && out[k]);
    if (mem.some(k => (out[k].items || []).includes(o.item))) continue;
    const pick = mem.filter(k => !(out[k].items && out[k].items.length) && (!o.type || isT(k, o.type))).sort((a, b) => offOf(b) - offOf(a))[0]
      || mem.filter(k => !(out[k].items && out[k].items.length)).sort((a, b) => offOf(b) - offOf(a))[0];
    if (pick) out[pick].items = [o.item];
  }
  return out;
}

// ---------- building a team ----------
// the team's shared weaknesses: three or more members weak to one type is a hole
function weakCost(team) {
  let c = 0;
  for (const t of TYPES) { const w = team.filter(k => typeEff(t, OPS[k].types) > 1).length, r = team.filter(k => typeEff(t, OPS[k].types) < 1).length; if (w >= 3) c += (w - 2) * 2 - r * .5; else if (w > r + 1) c += .5; }
  return c;
}
// one of the best few, the best most often (about 3 in 4)
const rankPick = (ranked, rng) => { const w = ranked.slice(0, 4).map((_, i) => 1 / ((i + 1) * (i + 1))), tot = w.reduce((a, b) => a + b, 0); let x = rng() * tot; for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) return ranked[i][0]; } return ranked[0][0]; };
// An archetype's team: every role filled from every fully evolved Pokémon, Legendaries, Mythicals, Ultra Beasts and Paradox Pokémon
// too, within the PvP limits (the owner's rule: every archetype gets the best role choices the limits allow). The one place each
// limited group has (one Legendary, one Mythical...) goes where it does the most: the first role to take one gives it up in turn
// to the roles after it, and the stronger team is kept.
function archetypeTeam(A, q, rng, sub, ok = () => true, O = null, osub = null) {
  const restrictedOk = q > .9 && rng() < .6, seed = Math.floor(rng() * 2147483646) + 1;
  const build = hold => buildArch(A, sub, ok, O, osub, restrictedOk, seed, hold);
  let best = build({});
  for (const [i, g] of best.groups) {
    const t = build({ [i]: [g] });
    if (t.team.length >= ROSTER && (!t.short || best.short) && (t.worth > best.worth || (best.short && !t.short))) best = t;
  }
  return { team: best.team, roles: best.roles, cover: best.cover, short: best.short };
}
// one try at it (hold: the groups a pick may not take, by its place in the order); each pick has its own seeded randomness, so
// two tries differ only where the hold changes them. worth: what the team's picks are worth for their roles, for comparing tries
function buildArch(A, sub, ok, O, osub, restrictedOk, seed, hold) {
  // a role goes to the strongest Pokémon that does the job well: power counts most (squared), fit for the role scales it, and
  // a little for not stacking the team's weaknesses (a role's own power and fitWeight change the mix: a wall is picked for
  // walling)
  const team = [], roles = {}, groups = [], S = A.sub[sub] || {}, OS = O ? O.sub[osub] || {} : {}, sb = banSet(S.ban), ob = banSet(OS.ban);
  const ids = [A.id, ...(O ? [O.id] : [])];
  let worth = 0, rng = seeded(seed);
  const held = k => (hold[team.length] || []).some(g => pvpGroups(k).includes(g));
  const free = k => !team.includes(k) && !TEAM_BAN.pokemon.has(k) && !sb.pokemon.has(k) && !ob.pokemon.has(k) && !(RESTRICTED.includes(k) && !restrictedOk) && pvpFits(team, k);
  const taken = k => !free(k) || held(k);
  const took = (k, v) => { for (const g of pvpGroups(k)) groups.push([team.length, g]); worth += v; team.push(k); };
  const pow = k => Math.pow(metaScore(k) / 15000, 2);
  // the slots in order; with a second plan joining, the roles this plan needs come first, then the part of the other plan that
  // comes along when it joins (its core: Tailwind's setter, Follow Me's redirector and two setup sweepers...), then the rest of this one
  const own = A.slots[sub] || A.slots[A.subs[0]], other = O ? O.slots[osub] || O.slots[O.subs[0]] : null;
  const slots = other ? [...own.filter(([R]) => R.need), ...other.filter(([, , j]) => j > 0).map(([R, , j]) => [R, j]), ...own.filter(([R]) => !R.need)] : own;
  let short = null;   // (a role the plan needs that no Pokémon could fill: this isn't the archetype for this Trainer)
  // two setters a weather, terrain or Trick Room team (the owner's rule, 2026-10-15): the lead one and its backup, which waits on the
  // bench until the field is down. A Pokémon whose every Ability brings the team's weather or terrain (Kyogre, Groudon, Koraidon,
  // Miraidon) is one of them or nothing, never one of its sweepers
  const setAbs = new Set(own.filter(([R]) => SETTER_KINDS.has(R.kind) && R.ab).flatMap(([R]) => R.ab));
  const forcedSetter = k => setAbs.size > 0 && OPS[k].abs.every(x => setAbs.has(x.k));
  // (3 sweepers at least on a team with a backup setter, 4 when a setter also does a support's job: the config's rules.sweepers;
  // a slot that would leave less room than that isn't filled)
  const SW = TEAM_CONFIG.rules.sweepers || {}, swKind = new Set(SW.kinds || ["sweeper"]);
  const twoSet = own.some(([R]) => R.kind === "backup"), swMin = twoSet ? SW.min || 0 : 0, swIn = () => team.filter(k => swKind.has(ROLE(roles[k]).kind)).length;
  const jobs = {};   // (a lead setter that also does a support's or hazard setter's job: that role's id)
  for (const [R, cnt] of slots) for (let n = 0; n < cnt; n++) {
    if (team.length >= ROSTER) { if (R.need && !Object.values(roles).includes(R.r) && !Object.values(jobs).includes(R.r)) short = short || R.r; break; }
    // on a two-setter team, a lead setter that can do this job does it as well (the owner's rule: Alolan Ninetales' Aurora Veil,
    // Indeedee's Follow Me; Hippowdon's Stealth Rock), which leaves the place to a sweeper; one extra job each
    if (twoSet && COVER_KINDS.has(R.kind)) {
      const by = team.find(k => ROLE(roles[k]).kind === "setter" && !jobs[k] && coverMove(R, k, ids, ok.knows || learns, jobSlots(ROLE(roles[k]), k, ok.knows || learns, ok.knows ? !!ok.patch : true)));
      if (by) { jobs[by] = R.r; continue; }
      if (swMin && ROSTER - team.length - 1 < swMin - swIn()) continue;
    }
    rng = seeded(seed + team.length * 7919);
    const helper = !!R.mv && !R.setup && R.kind !== "pivot";   // a setter or support: the job matters more than raw power
    // (the fit is graded against every Pokémon free for the role, held ones too, so tries that hold one back compare fairly)
    let all = COMP_POOL().filter(k => free(k) && ok(k) && R.ok(k) && R.can(k, ids, ok.knows) && !(helper && RESTRICTED.includes(k)) && !(swKind.has(R.kind) && forcedSetter(k)));
    // a Trainer still building their playstyle (ok.grow: the owner's rule) uses what they have: an unevolved Pokémon in place of
    // the one it'll become (Chansey for Blissey), with a little less of its fit, and a setter's move in place of its Ability
    // (Sunny Day for Drought) when nobody with the Ability is there
    const FIT = new Map(all.map(k => [k, R.sc(k)])), fitOf = k => FIT.has(k) ? FIT.get(k) : R.sc(k);
    if (ok.grow) {
      // (never a second of one line: no Glimmet beside Glimmora; and a role there for its Ability gets a stand-in that can have it,
      // a Hidden one only with an Ability Patch)
      const line = k => { let x = k; while (OPS[x] && OPS[x].from && OPS[OPS[x].from]) x = OPS[x].from; return x; }, lines = new Set(team.map(line));
      const abOk = x => !(R.ab && R.keep.abilities) || R.ab.some(a => hasAb(x, a) && (ok.patch !== false || !hiddenAbilities(x).includes(a)));
      for (const k of COMP_POOL()) {
        if (!R.ok(k) || ok(k) || (swKind.has(R.kind) && forcedSetter(k)) || lines.has(line(k))) continue;
        let x = OPS[k].from; while (x && OPS[x] && !ok(x)) x = OPS[x].from;
        if (x && OPS[x] && !FIT.has(x) && free(x) && abOk(x) && R.can(x, ids, ok.knows) && !(helper && RESTRICTED.includes(x))) { FIT.set(x, R.sc(k) * .85); all.push(x); }
      }
      // (a setter's move in place of its Ability: the field's own type first, Fire types for Sunny Day, Electric for Electric Terrain)
      const subs = SETTER_KINDS.has(R.kind) && R.ab ? fieldMoves(R.ab) : [], fty = FIELD_TYPE[(R.ab || []).find(a => FIELD_TYPE[a])];
      if (subs.length && !all.some(k => R.ab.some(a => hasAb(k, a)))) for (const x of ok.pool ? ok.pool() : COMP_POOL()) {
        if (FIT.has(x) || !free(x) || !ok(x) || lines.has(line(x)) || !subs.some(m => (ok.knows || learns)(x, m))) continue;
        FIT.set(x, (60 + bulkOf(x) / 4) * (fty && fty.some(t => OPS[x].types.includes(t)) ? 1.6 : 1)); all.push(x);
      }
    }
    // a setter whose job is an Ability it keeps (Drizzle, Drought, Sand Stream, Snow Warning) takes a Pokémon that has it, if one's free
    if (R.ab && R.keep.abilities && SETTER_KINDS.has(R.kind)) { const w = all.filter(k => R.ab.some(a => hasAb(k, a))); if (w.length) all = w; }
    let cands = all.filter(k => !held(k));
    // the owner's picks for the role first (their sweeper lists); the rest it fits only when a Trainer can't field any of them
    if (R.list) { const own = cands.filter(k => R.list.includes(k)); if (own.length) cands = own; }
    if (!cands.length) { if (R.need) short = short || R.r; break; }
    const fitAll = all.map(fitOf), lo = Math.min(...fitAll), hi = Math.max(...fitAll), fit = cands.map(fitOf);
    const pe = R.power != null ? R.power : helper ? 1 : 2, fw = R.fitWeight != null ? R.fitWeight : helper ? .7 : .45, pw = k => Math.pow(pow(k), pe / 2);
    const val = (k, i) => pw(k) * (1 - fw + fw * (hi > lo ? (fit[i] - lo) / (hi - lo) : 1));
    const ranked = cands.map((k, i) => [k, val(k, i) * (.9 + .2 * rng()) - weakCost([...team, k]) * .05, val(k, i)]).sort((x, y) => y[1] - x[1]);
    const k = rankPick(ranked, rng);
    roles[k] = R.r; took(k, ranked.find(x => x[0] === k)[2]);   // (the role's id: rain_setter, stall_wall...; roleKind gives its kind)
    // the lead setter is the less offensive of the two, the backup the more offensive one (the owner's rule): Pelipper leads, Kyogre waits
    // (only when each can do the other's job: set the field, with the Ability or with the move, whichever it has)
    if (R.kind === "backup" && R.backupOf) { const l = team.find(x => roles[x] === R.backupOf), L0 = ROLE(R.backupOf);
      const sets = (Q, x) => (!!Q.ab && Q.ab.some(a => hasAb(x, a))) || (!!Q.mv && Q.mv.some(m => (ok.knows || learns)(x, m)));
      if (l && offOf(l) > offOf(k) && sets(R, l) && sets(L0, k)) { roles[l] = R.r; roles[k] = R.backupOf; } }
  }
  // the rest: the strongest who suit the plan (slow enough under Trick Room: coverMaxSpeed; the sub-archetype's own pool, fit
  // scores counting, when it has one), nudged toward covering the team's weaknesses
  const cover = S.cover && Object.keys(S.cover).length ? S.cover : null, cv = cover ? Object.values(cover) : [], clo = Math.min(...cv), chi = Math.max(...cv);
  const coverFit = k => !cover ? 1 : .55 + .45 * (chi > clo ? (cover[k] - clo) / (chi - clo) : 1);
  const maxSpe = [A.coverMaxSpeed, O && O.coverMaxSpeed].filter(x => x != null);
  while (team.length < ROSTER) {
    rng = seeded(seed + team.length * 7919);
    const ranked = COMP_POOL().filter(k => !taken(k) && ok(k) && (!cover || cover[k] != null) && maxSpe.every(m => bs(k)[5] <= m)).map(k => [k, pow(k) * coverFit(k) * (.9 + .2 * rng()) - weakCost([...team, k]) * .05]).sort((x, y) => y[1] - x[1]);
    if (!ranked.length) break;
    const k = rankPick(ranked, rng);
    roles[k] = "cover"; took(k, pow(k) * coverFit(k));
  }
  return { team: leadsFirst(team, roles), roles, cover: jobs, short, groups, worth: worth - weakCost(team) * .3 };
}
// the setters (a backup waits on the bench: never a lead), and the jobs a lead setter can do besides its own: a support's (screens,
// Aurora Veil in snow, Follow Me) or a hazard setter's. The move it would keep for it (Aurora Veil first on a snow team), in a slot
// its own job doesn't use (avoid: Trick Room and Rain Dance share slot 2 with every support move), or null
// the moves that bring a field an Ability brings (a setter's stand-in job: Sunny Day for Drought, the owner's rule)
const FIELD_MOVES = { drought: ["sunnyday"], "orichalcum-pulse": ["sunnyday"], drizzle: ["raindance"], "sand-stream": ["sandstorm"], "snow-warning": ["snowscape", "hail"],
  "psychic-surge": ["psychicterrain"], "electric-surge": ["electricterrain"], "hadron-engine": ["electricterrain"], "grassy-surge": ["grassyterrain"], "misty-surge": ["mistyterrain"] };
const fieldMoves = abs => [...new Set((abs || []).flatMap(a => FIELD_MOVES[a] || []))].filter(m => MOVES[m]);
const FIELD_TYPE = { drought: ["Fire"], "orichalcum-pulse": ["Fire"], drizzle: ["Water"], "sand-stream": ["Rock", "Ground"], "snow-warning": ["Ice"], "psychic-surge": ["Psychic"],
  "electric-surge": ["Electric"], "hadron-engine": ["Electric"], "grassy-surge": ["Grass"], "misty-surge": ["Fairy"] };
const SETTER_KINDS = new Set(["setter", "backup"]), COVER_KINDS = new Set(["support", "redirect", "screens", "veil", "hazard"]);
function coverMove(R, k, ids, kn = learns, avoid = []) {
  if (!R.mv || !R.keep.moves) return null;
  const can = R.mv.filter(m => R.mvOk(m, ids) && kn(k, m) && !avoid.includes(slotOf(m)) && (m !== "auroraveil" || ids.includes("snow") || WX_AB[OPS[k].ab] === "snow" || OPS[k].abs.some(a => WX_AB[a.k] === "snow")));
  return can.includes("auroraveil") ? "auroraveil" : can[0] || null;
}
// the slots a setter's own job takes: its Trick Room or weather move (none when an Ability it can have sets the weather or terrain;
// a Hidden one needs an Ability Patch: patch)
function jobSlots(R, k, kn = learns, patch = true) {
  if (!R.mv || !R.keep.moves || (R.ab && R.keep.abilities && R.ab.some(a => hasAb(k, a) && (patch || !hiddenAbilities(k).includes(a))))) return [];
  const m = R.mv.find(m => kn(k, m)); return m ? [slotOf(m)] : [];
}
// a team in battle order: its lead roles in front (three at most), the backups (bench roles) last, so they wait on the bench
function leadsFirst(team, roles) {
  const role = k => ROLE(roles[k] || "cover"), leads = team.filter(k => role(k).lead).slice(0, ACTIVE), bench = team.filter(k => role(k).bench && !leads.includes(k));
  return [...leads, ...team.filter(k => !leads.includes(k) && !bench.includes(k)), ...bench];
}
// which archetype: by viability (vi: how often its Legend teams beat equally trained teams of strong Pokémon picked at random,
// measured in head-to-head battles), like a real metagame. Legend Trainers lean hard on what wins (squared), the tiers below
// pick more evenly; every archetype still turns up. (Measured with tools/viability.js, last on 2026-10-15 after two setters a weather, terrain and Trick Room team (and, before, the owner's sweeper lists, Legendaries in every team, the move reworks): against random strong teams within the PvP limits, Trick Room, Sand (its Ground and Steel types' Sp. Def +1) and Snow measure strongest; Electric Terrain, Balance and Stall weakest. 32 battles each, so about ±9. The weights live in the config.)
// (skip: archetypes this Trainer can't fill; a second plan that joins it: the config's overlaps and overlapChance)
function pickArchetype(q, rng, tier = qTier(q), style = NPC_PLAYSTYLE, skip = null) {
  const T = TEAM_CONFIG.tiers[tier] || {}, p = T.favorStrong != null ? T.favorStrong : 1, w = ARCHETYPES.map(A => skip && skip.has(A.id) ? 0 : Math.pow(Math.max(0, A.vi) / 50, p)), tot = w.reduce((a, b) => a + b, 0) || 1;
  let x = rng() * tot, A = ARCHETYPES.find((_, i) => w[i] > 0) || ARCHETYPES[0];
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0 && w[i] > 0) { A = ARCHETYPES[i]; break; } }
  // a personality with a playstyle (the Rain Team Loyalist, the Trick Room Specialist...) runs it
  const want = style ? ARCHETYPES.filter(B => style.includes(B.id) && !(skip && skip.has(B.id))) : [];
  if (want.length) A = want[Math.floor(rng() * want.length)];
  const sub = A.subs[Math.floor(rng() * A.subs.length)];
  // a second plan that joins this one (Tailwind, Priority Offense, Follow Me, Hazard Phazing: its overlaps), as often as it says
  const joins = ARCHETYPES.filter(B => B !== A && B.overlaps.includes(A.id) && B.overlapChance > 0), r = rng();
  let O = null, acc = 0;
  for (const B of joins) { acc += B.overlapChance / 100; if (r < acc) { O = B; break; } }
  const osub = O ? O.subs[Math.floor(rng() * O.subs.length)] : null;
  // (the owner's rule: 1 or 2 support Pokémon a team, screens or redirection; a second plan whose core would make it 3 doesn't join)
  if (O && supportsIn(A.slots[sub] || []) + supportsIn((O.slots[osub] || []).filter(([, , j]) => j > 0).map(([R, , j]) => [R, j])) > 2) return { A, sub, O: null, osub: null };
  return { A, sub, O, osub };
}
// an archetype team this Trainer can really build (every role its plan needs filled): another plan when one can't be, the plan
// without its second one first (a playstyle their Pokémon can't fill goes the same way)
// the support Pokémon a plan's slots hold: the support role, a redirector, a screen setter, an Aurora Veil setter
const SUPPORT_KINDS = new Set(["support", "redirect", "screens", "veil"]);
const supportsIn = slots => slots.reduce((t, [R, n]) => t + (R && SUPPORT_KINDS.has(R.kind) ? n : 0), 0);
function planTeam(q, rng, tier, ok) {
  const skip = new Set(); let style = NPC_PLAYSTYLE, last = null;
  for (let n = 0; n < 10; n++) {
    let P = pickArchetype(q, rng, tier, style, skip), built = archetypeTeam(P.A, q, rng, P.sub, ok, P.O, P.osub);
    if (P.O && (built.short || built.team.length < ROSTER)) { P = { ...P, O: null, osub: null }; built = archetypeTeam(P.A, q, rng, P.sub, ok); }
    last = { ...P, built };
    if (!built.short && built.team.length >= ROSTER) return last;
    skip.add(P.A.id); if (style && style.every(id => skip.has(id))) style = null;
  }
  return last;
}
const archOfPick = P => ({ id: P.A.id, n: P.A.n, sub: P.sub, ...(P.O ? { over: { id: P.O.id, n: P.O.n, sub: P.osub } } : {}) });

// moves an optimized set leaves out (optMoves in a6h_build.js): fainting on purpose. (Focus Punch, Snore and Sleep Talk are in:
// comboBonus makes them worth taking only with Protect, Detect, a Substitute or Rest.)
// (Two-turn moves like Solar Beam or Sky Attack strike at once in this game, so they stay.)
// (Hyper Beam and its kind stay: they only recharge when the target survives, the owner's rule)
const SET_SKIP = new Set(["explosion", "selfdestruct", "mistyexplosion", "finalgambit", "memento", "struggle"]);

// ---------- the account: tiers on top of npcAccount's general build ----------
// called by npcAccount for Master Ball and up; turns the Trainer's roster, team and training into the tier's
function topTierAccount(acc, q, rng, shown) {
  const tier = shown != null ? shown : qTier(q);
  const T = TEAM_CONFIG.tiers[tier] || {}, pct = x => (x || 0) / 100;
  if (tier < T_MASTER) return rng() < pct(T.archetypeChance) ? lowTierComp(acc, q, rng, tier) : acc;   // (the owner's rule: half below Master Ball)
  acc.badges = 8; acc.tier = tier;
  const band = tierLevels(tier) || [100, 100];   // (the tier's levels: Master Ball 91-100, Lv 100 above)
  // every top-tier Trainer runs a competitive team (the owner's rules, 2026-10-15): perfect IVs and optimized sets (separate rolls)
  // for every Legend, three in four Experts, half of the Veterans and a quarter of the Master Ball Trainers; max Mastery for every
  // Expert and Legend and half of the Veterans and Master Ball Trainers
  // (the rates are the tier's in the team config; each a roll of its own, in this order, so the same Trainer keeps the same team)
  const roll = x => x >= 100 || (x > 0 && rng() < pct(x));
  const perfect = T.perfectIVs >= 100 || (T.perfectIVs > 0 && roll(T.perfectIVs));
  const optimized = T.optimized >= 100 || (T.optimized > 0 && roll(T.optimized));
  const mastered = T.maxMastery >= 100 || roll(T.maxMastery);
  acc.perfect = perfect; acc.optimized = optimized;
  {
    const ok = k => genOk(k, acc.gens || ALL_GENS) && fitsBand(k, band);   // (the regions their own Journeys have opened)
    if (acc.gens && acc.gens.size < 9) { ok.grow = true; ok.pool = () => COMP_POOL().filter(ok); }
    const P = planTeam(q, rng, tier, ok), built = P.built;
    acc.arch = archOfPick(P); acc.roles = built.roles; acc.cover = built.cover || {}; acc.team = built.team;
    // the roster holds the team first, plus their usual picks (the Link Battle draft favours the team)
    acc.roster = [...built.team, ...acc.roster.filter(k => !built.team.includes(k))];
  }
  // at the tier's levels with everything to hand, every Pokémon optimized like the Demo's (a6h_build.js)
  const L = clamp(acc.lvl || band[1], band[0], band[1]);
  acc.roster = acc.roster.filter(k => fitsBand(k, band));
  for (const k of acc.roster) {
    const old = acc.prog[k] || {};
    const p = progForLV(k, band[0] === band[1] ? band[0] : monLevelIn(L, k, band, rng));
    p.pot = perfect ? 6 : Math.min(5, Math.max(3, old.pot || 4));
    p.sk = mastered ? [MAX_SK, MAX_SK, MAX_SK] : [3 + Math.floor(rng() * 2), 3 + Math.floor(rng() * 2), 3 + Math.floor(rng() * 2)];
    Object.assign(p, { ab: old.ab, nat: old.nat });
    acc.prog[k] = p;
  }
  // competitive optimization (Legend, half of Expert): the six built together, for each other (npcOptimize in a6h_build.js)
  npcOptimize(acc, npcAccess(L, tier), optimized);
  acc.lvl = L;
  return acc;
}
// below Master Ball (the owner's rule): half of the Trainers run a competitive team too, at their own level and Badges, out of what
// they could field at that level (no Legendaries they haven't got). Each Pokémon optimized on its own, with what their tier has,
// like the rest of their roster; a plan their level can't fill keeps their usual team.
function lowTierComp(acc, q, rng, tier) {
  const L = acc.lvl, band = tierLevels(tier), fits = k => genOk(k, acc.gens || ALL_GENS) && minLevelOf(k) <= L && fitsBand(k, band) && (!LEGENDS.includes(k) || acc.roster.includes(k));
  // (a role there for its move takes only a Pokémon that knows it by now: a Lv 14 Butterfree hasn't learned Rage Powder yet; one new
  // to the team counts at the lowest level it can be given below)
  const ac = npcAccess(L, tier); fits.patch = ac.patch; fits.grow = true; fits.pool = () => OP_KEYS.filter(k => fits(k) && OPS[k].skills.length >= 2); fits.knows = (k, m) => levelMoves(k, (acc.prog[k] && acc.prog[k].lvl) || (band ? band[0] : Math.max(1, L - 6))).includes(m) || OPS[k].tms.some(n => ac.tms.has(n) && TM_MOVE[n] === m);
  // (a playstyle their level can't fill yet: whichever plan it can, like anyone else; none at all: their usual team)
  const P = planTeam(q, rng, tier, fits), built = P.built;
  if (built.short || built.team.length < ROSTER) return acc;
  acc.arch = archOfPick(P); acc.roles = built.roles; acc.cover = built.cover || {}; acc.team = built.team;
  acc.roster = [...built.team, ...acc.roster.filter(k => !built.team.includes(k))];
  for (const k of built.team) if (!acc.prog[k]) {
    const p = progForLV(k, band ? monLevelIn(L, k, band, rng) : clamp(L + Math.round((rng() - .6) * 10), Math.min(100, minLevelOf(k)), 100)), regs = regularAbilities(k);
    p.pot = Math.min(6, 1 + Math.floor(5 * q * q * (.6 + .6 * rng())));
    p.nat = NATURE_KEYS[Math.floor(rng() * NATURE_KEYS.length)]; p.ab = regs.length ? regs[Math.floor(rng() * regs.length)] : OPS[k].ab;
    acc.prog[k] = p;
  }
  return npcOptimize(acc, npcAccess(L, tier), false);
}
// a Trainer's team in battle order: an archetype team leads with its setters, the other leads chosen by the matchup like
// anyone else's
// (the backup setters, bench roles, go last: they wait on the bench until the plan needs them again)
const docRole = (doc, k) => ROLE((doc.roles && doc.roles[k]) || "cover");
function npcLeads(doc, foeSpecs) {
  const specs = doc.team.map(k => npcSpec(doc, k));
  if (!doc.arch) return screensLead(leadOrder(specs, foeSpecs));   // (screen users lead: screensLead in a6h_build.js)
  const lead = specs.filter(sp => docRole(doc, sp.op).lead).slice(0, ACTIVE), back = specs.filter(sp => docRole(doc, sp.op).bench && !lead.includes(sp)), rest = specs.filter(sp => !lead.includes(sp) && !back.includes(sp));
  return screensLead([...lead, ...(foeSpecs.length ? leadOrder(rest, foeSpecs) : rest), ...back]);
}
// in a Link Battle draft: their archetype's lead roles go first among what they picked, the rest by the matchup, the backups last
function draftLeads(doc, keys, foeSpecs) {
  const specs = leadOrder(keys.map(k => npcSpec(doc, k)), foeSpecs);
  if (!doc.arch) return screensLead(specs);
  const lead = specs.filter(sp => docRole(doc, sp.op).lead).slice(0, ACTIVE), back = specs.filter(sp => docRole(doc, sp.op).bench && !lead.includes(sp));
  return screensLead([...lead, ...specs.filter(sp => !lead.includes(sp) && !back.includes(sp)), ...back]);
}
