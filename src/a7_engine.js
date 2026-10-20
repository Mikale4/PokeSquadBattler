
// =====================================================================
//  BATTLE ENGINE — turn meters (Speed decides how often a Pokémon moves), the main-series damage formula
//  (STAB, type matchups, critical hits, accuracy, spread moves), status conditions, stat stages, weather,
//  Abilities and held items. It emits events (and battle text) for the battle director.
//  Teams of up to six: three on the field at a time (B.units), the rest on the bench (B.bench). When one faints, its
//  trainer chooses who comes in next: you always pick yours (B.step returns "replace", even on Auto), opposing trainers
//  and the Demo pick the best matchup (aiReplacement). A Pokémon can also be switched out instead of moving.
// =====================================================================
// Showdown's battle text (a3c_showdown_text.js, from smogon/pokemon-showdown data/text): the main games' wording.
// psT(id, key, {POKEMON, TEAM, SOURCE, ITEM, MOVE...}) gives that line, filled in and capitalized, or null if it has none.
function psT(id, key, v = {}) {
  const e = [PS_TEXT.moves, PS_TEXT.default, PS_TEXT.abilities, PS_TEXT.items].map(t => t[id]).find(x => x && x[key]);
  if (!e) return null;
  const s = e[key].replace(/\{INFLECT:(\w+):s=([^:}]*):p=([^}]*)\}/g, (m, k, a, b) => +v[k] === 1 ? a : b)
    .replace(/\{(\w+)\}/g, (m, k) => v[k] != null ? v[k] : m).replace(/\*\*/g, "").trim().replace(/^\((.*)\)$/, "$1");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// whose side the battle text is told from (online battles, the owner's ask, 2026-10-19: the second player is team E and reads the
// same battle from their side); "A" everywhere else
let VIEW_ME = "A";
// (the Showdown server, tools/showdown_adapter.js: each Pokémon and side in the battle text as a token, filled in from each player's
// side by its translator: \u0001uid\u0002 a Pokémon, \u0001uid\u0003 the same starting a sentence, \u0004team\u0005 a team)
let TEXT_TOKENS = false;
const psTeam = team => TEXT_TOKENS ? `\u0004${team}\u0005` : team === VIEW_ME ? "your team" : "the opposing team";
// the weather and terrain lines in their tables (a2_core.js) are Showdown's: started, still going (each turn), ended
for (const [w, id] of Object.entries({ sun: "sunnyday", rain: "raindance", sand: "sandstorm", hail: "hail" })) if (WEATHER[w] && psT(id, "start"))
  Object.assign(WEATHER[w], { turn: psT(id, "start"), start: psT(id, "upkeep"), end: psT(id, "end") });
for (const [t, id] of Object.entries({ electric: "electricterrain", grassy: "grassyterrain", misty: "mistyterrain", psychic: "psychicterrain" })) if (TERRAIN[t] && psT(id, "start"))
  Object.assign(TERRAIN[t], { start: psT(id, "start"), end: psT(id, "end") });
const ACTIVE = 3, ROSTER = 6;
let UID = 0;
const DMG_SCALE = .62;   // squad battles last longer than one-on-one ones: every hit is scaled down
const STALEMATE_TURNS = 500;
// the battle AI's weights (a7_engine.js aiPlan), tuned in head-to-head battles against earlier versions
const AIW = { twMix: .75, killBase: .25, killTw: .6, fuOver: .35, fuSetup: .3, resist: .65, superEff: 1.2, heal: .8, cd: .012, status: 1, flinch: .3,
  // feeding an absorbing Ability (base + per unit of threat), and switching: stuck (best option worth less than swStuckV) needs a
  // bench matchup swStuck better; a weak best option (under swWeakV) needs one swWeak better
  absorbBase: .4, absorbTw: .8, swStuckV: .02, swStuck: .15, swWeakV: .3, swWeak: .45 };
// switching on look-ahead (aiSwitch): what a Pokémon still standing is worth beyond its HP (a turn later), the margin a switch must
// win by, the copies of the battle per batch and the most batches, the bench Pokémon played out, a status condition, a stat stage on the field, and how much better a
// bench Pokémon must match up before a switch is played out at all; and for the Expert AI's pick after a faint (aiReplacement), the
// bench Pokémon played out and the margin one must win by over the best matchup; how many rounds each copy plays out (the Expert
// AI two: 55.6% against one round's 49% in head-to-heads, 2026-10-19); and what a replacement's guaranteed first turn counts for when
// a copy ends before it (owedHit)
const AISW = { alive: .15, margin: .5, margin0: .1, low: .5, k: 8, rounds: 3, cands: 2, status: .1, stage: .03, better: .4, repCands: 3, repMargin: .05, rounds0: 1, roundsX: 2, owed: 1 };
function makeBattle(cfg) {
  const B = { units: [], ev: [], wave: 0, waves: cfg.waves, over: false, result: null, turn: 0, allyTurns: 0, actor: null, waiting: null,
    tally: { crits: 0, kills: 0, payday: 0, superEff: 0 }, auto: !!cfg.auto, aiStyle: cfg.aiStyle || "balanced", enemyStyle: cfg.enemyStyle || "balanced", weather: (cfg.weather === "snow" ? "hail" : cfg.weather) || null,
    depth: 0, allyCount: cfg.allies.length, dmgDone: {}, avgL: 10, trainer: cfg.trainer || null, wild: !!cfg.wild, sim: !!cfg.sim, real: !cfg.sim && !cfg.from && !cfg.probe,
    bench: { A: [], E: [] }, gone: [], needPick: null, wxEnd: 0, pivotQ: [] };
  B.baseWx = B.weather; B.wx0 = B.weather;   // (wx0: the stage's own weather, what a new wave starts with)
  // (a Pokémon knocked out by a move: its faint, its "fainted!" and what goes with it wait until the move is done, so the move's
  // other lines, "It's super effective!", recoil, drain, come first, as in the games and on Showdown; they come out before the end
  // of the turn's own lines and before anyone leaves or comes onto the field: B.koQ, kill and act)
  const KO_OUT = new Set(["recall", "sendin", "end", "turn"]);
  const releaseKO = () => { if (B.koQ && B.koQ.length) B.ev.push(...B.koQ.splice(0)); };
  const ev = e => { if (B.koQ && B.koQ.length && KO_OUT.has(e.k)) releaseKO(); B.ev.push(e); };
  const msg = (t, extra) => { if (B.acting && /But it failed!|avoided the attack!|doesn't affect|is unaffected!/.test(t)) B.failed = true; ev({ k: "msg", t, ...(extra || {}) }); };
  const has = (u, id) => u.eff.some(e => e.id === id);
  const effOf = (u, id) => u.eff.find(e => e.id === id);
  const allies = u => B.units.filter(x => x.team === u.team && x.alive);
  const enemies = u => B.units.filter(x => x.team !== u.team && x.alive && !commanding(x));   // (a Tatsugiri inside Dondozo can't be hit)
  // Commander (the owner's rule): a Tatsugiri with it, while a Dondozo is on its side of the field, is inside its mouth: it can't act and
  // nothing can hit it, and Dondozo's Attack, Defense, Sp. Atk, Sp. Def and Speed are +2 (fixedStage) for as long as it's there
  const commanding = x => x.alive && x.key === "tatsugiri" && pv(x, "COMMANDER") && B.units.some(d => d !== x && d.alive && d.team === x.team && d.key === "dondozo");
  // an Ability in effect: none while Gastro Acid suppresses it or another Pokémon's Neutralizing Gas is in battle
  // (speed: whether anyone in this battle, bench included, has Neutralizing Gas or Cloud Nine/Air Lock at all, checked as each step starts;
  // nobody can gain one without copying it from someone counted already, so most battles skip those scans: abScan)
  // (a Neutralizing Gas holder leaving the field, the last one there: the games say the gas wore off)
  const gasLeaves = u => { if (u.passives.some(p => p.id === "NEUTRAL") && !u.flags.noAbility && !B.units.some(x => x !== u && x.alive && !x.flags.noAbility && x.passives.some(p => p.id === "NEUTRAL"))) msg(psT("neutralizinggas", "end")); };
  const gasOn = u => B.gasMaybe !== false && !(u.held === "abilityshield") && B.units.some(x => x.alive && x !== u && !x.flags.noAbility && x.passives.some(p => p.id === "NEUTRAL"));
  const abScan = () => { const all = [...B.units, ...(B.bench ? [...(B.bench.A || []), ...(B.bench.E || [])] : [])]; B.gasMaybe = all.some(x => x.passives.some(p => p.id === "NEUTRAL")); B.cloudMaybe = all.some(x => x.passives.some(p => p.id === "CLOUD")); };
  const pv = (u, id) => u.flags.noAbility || gasOn(u) ? undefined : u.passives.find(p => p.id === id);
  // the target's Ability, unless the attacker's Mold Breaker ignores it
  const MOLD_MOVES = new Set(["moongeistbeam", "sunsteelstrike", "photongeyser", "coreenforcer"]);
  const tab = (att, tar, id) => att && att !== tar && (pv(att, "MOLD") || (att.lastSkill && MOLD_MOVES.has(att.lastSkill.key)) || (pv(att, "MYCELIUM") && att.lastSkill && att.lastSkill.M.c === "X")) && !item(tar, "abilityshield") ? undefined : pv(tar, id);   // (an Ability Shield holds)
  const item = (u, k) => u.held === k && !u.flags.itemUsed && !noItems(u) && !(u.passives[0] && u.passives[0].id === "KLUTZ" && !u.flags.noAbility);   // (Klutz: its item does nothing)
  // the held item in effect (null once used up or knocked off), and using it up (Unburden notices)
  const heldX = u => u.held && !u.flags.itemUsed && !noItems(u) ? HELD[u.held] : null;
  // the field's longer effects (Gravity, Magic Room, Wonder Room, the Sports, Ion Deluge, Fairy Lock) last until B.turn reaches them
  const fieldOn = k => (B[k] || 0) > B.turn;
  const noItems = u => fieldOn("magicRoom") || has(u, "EMBARGO");   // (Magic Room, Embargo: held items do nothing)
  const berryOk = u => !enemies(u).some(f => pv(f, "UNNERVE") || (pv(f, "MOXIE") || {}).unnerve);   // (As One is Unnerve too)
  function useUp(u, line) {
    if (u.held && HELD[u.held] && HELD[u.held].berry) { u.flags.ateBerry = true; if (pv(u, "CUD_CHEW")) u.flags.cud = { key: u.held, skip: u === B.actor }; }   // (ateBerry: Belch; Cud Chew)
    u.flags.itemUsed = true; u.flags.unburden = true; if (line) msg(line); fxEv(u);
    // Symbiosis (the owner's rule): a partner on the field with it hands over its own item at once
    const sy = u.alive && B.units.find(x => x !== u && x.alive && x.team === u.team && pv(x, "SYMBIOSIS") && x.held && !x.flags.itemUsed);
    if (sy) { u.held = sy.held; u.flags.itemUsed = false; sy.held = null; sy.flags.itemUsed = false; msg(`${Nm(sy)} shared its ${HELD[u.held].n} with ${nm(u)}!`); fxEv(u); fxEv(sy); }
  }
  // Cud Chew (the owner's rule): the Berry it ate, eaten again at the end of its next turn, its effect again (a Berry that only works
  // when it's hit, a type-resist Berry, Jaboca or Rowap, does nothing the second time)
  function eatAgain(u, key) {
    const H = HELD[key]; if (!H || !u.alive) return;
    msg(`${Nm(u)} ate its ${H.n} again with Cud Chew!`);
    const ripen = pv(u, "RIPEN") ? 2 : 1;
    if (H.healAt) heal(u, (H.healFlat || u.max.hp * H.heal) * ripen);
    if (H.seHeal) heal(u, u.max.hp / 4 * ripen);
    if (H.hitBoost && H.stat) stage(u, u, H.stat, 1);
    if (H.pinch) {
      if (["atk", "def", "spa", "sdf", "spe"].includes(H.pinch)) stage(u, u, H.pinch, 1);
      else if (H.pinch === "crit") addEff(u, "FOCUS", 99, u, true);
      else if (H.pinch === "random") { const st = ["atk", "def", "spa", "sdf", "spe"].filter(s => u.stages[s] < 6); if (st.length) stage(u, u, pick(st), 2); }
      else if (H.pinch === "acc") addEff(u, "LOCKON", 2, u, true);
      else if (H.pinch === "first") { if (!(B.nextQ = B.nextQ || []).includes(u.uid)) B.nextQ.push(u.uid); msg(psT("custapberry", "activate", { POKEMON: nm(u) })); }   // (Custap: its turn at once, the owner's rule)
    }
    if (H.cure) { if (u.status && H.cure.includes(u.status)) { u.status = null; u.sTurn = 0; } if (has(u, "CNF") && H.cure.includes("CNF")) removeEff(u, "CNF"); }
    fxEv(u);
  }
  // HP and pinch Berries (and Berry Juice): checked whenever it loses HP
  function hpItems(u) {
    const H = heldX(u); if (!H || !u.alive || (H.berry && !berryOk(u))) return;
    const f = u.hp / u.max.hp, glut = !!H.berry && ((u.hp < u.max.hp && pv(u, "GLUTTONY")) || u.flags.teatime);   // (Teatime: every Berry now)   // (Gluttony: at any damage, a house rule)
    if (H.healAt && (f <= H.healAt || glut) && u.hp < u.max.hp) { useUp(u); heal(u, (H.healFlat || u.max.hp * H.heal) * (H.berry && pv(u, "RIPEN") ? 2 : 1), `${Nm(u)} restored its HP using its ${H.n}!`); if (H.berry && pv(u, "CHEEK_POUCH")) heal(u, u.max.hp / 3); return; }
    if (H.pinch && (f <= .25 || glut)) {
      useUp(u, `${Nm(u)} ate its ${H.n}!`);
      if (["atk", "def", "spa", "sdf", "spe"].includes(H.pinch)) stage(u, u, H.pinch, 1);
      else if (H.pinch === "crit") addEff(u, "FOCUS", 99, u, true);
      else if (H.pinch === "random") { const st = ["atk", "def", "spa", "sdf", "spe"].filter(s => u.stages[s] < 6); if (st.length) stage(u, u, pick(st), 2); }
      else if (H.pinch === "acc") addEff(u, "LOCKON", 2, u, true);
      else if (H.pinch === "first") { if (!(B.nextQ = B.nextQ || []).includes(u.uid)) B.nextQ.push(u.uid); msg(psT("custapberry", "activate", { POKEMON: nm(u) })); }   // (Custap: its turn at once, the owner's rule)
    }
  }
  // status Berries (Lum cures everything), and the Mental Herb
  function statusItems(u) {
    const H = heldX(u); if (!H || !u.alive) return;
    if (u.held === "mentalherb" && ["INFAT", "TAUNT", "DISABLE", "HEALBLOCK"].some(id => has(u, id))) { for (const id of ["INFAT", "TAUNT", "DISABLE", "HEALBLOCK"]) removeEff(u, id); useUp(u, `${Nm(u)} used its Mental Herb to come back to its senses!`); return; }
    if (!H.cure || (H.berry && !berryOk(u))) return;
    const st = u.status && H.cure.includes(u.status), cnf = has(u, "CNF") && H.cure.includes("CNF");
    if (!st && !cnf) return;
    useUp(u, `${Nm(u)}'s ${H.n} cured it!`);
    if (st) { u.status = null; u.sTurn = 0; }
    if (cnf) removeEff(u, "CNF");
    fxEv(u);
  }
  // "the opposing Onix" mid-sentence, "The opposing Onix" at the start of one
  const nm = u => TEXT_TOKENS ? `\u0001${u.uid}\u0002` : (u.team !== VIEW_ME ? (B.wild ? "the wild " : "the opposing ") : "") + u.n;
  const Nm = u => { if (TEXT_TOKENS) return `\u0001${u.uid}\u0003`; const s = nm(u); return s.charAt(0).toUpperCase() + s.slice(1); };
  const fxEv = u => {
    const list = [];
    if (u.status) list.push([u.status, 0]);
    for (const e of u.eff) list.push([e.id, e.turns]);
    const stages = shownStages(u); u.fxKey = JSON.stringify(stages);   // (the stat badge: what moves made plus the fixed stages)
    ev({ k: "fx", u: u.uid, list, sh: u.shield, stages, st: u.status });
  };

  // ---------- units ----------
  const newStages = () => ({ atk: 0, def: 0, spa: 0, sdf: 0, spe: 0, acc: 0, eva: 0 });
  function buildUnit(spec, team, slot) {
    const def = OPS[spec.op], prog = spec.prog || progForLV(spec.op, spec.LV);
    // `mine`: the player's Badge bonuses apply (their own Pokémon, wherever they stand); `badges`: a simulated Trainer's own
    const { st } = opStats(spec.op, prog, spec.mine != null ? spec.mine : team === "A" && !!spec.prog, spec.badges);
    if (spec.hpX) st.hp = Math.round(st.hp * spec.hpX);
    // a Dynamax or Gigantamax Pokémon (Galar's aces, its Max Raid Pokémon): double HP, as in the games (the owner's rule, 2026-10-16);
    // what works in shares of its max HP (poison, Leech Seed, weather...) goes by its normal HP, as there (chipHp)
    const dmax = /^(Dynamax|Gigantamax)$/.test(spec.auraN || ""), hp1 = st.hp;
    if (dmax) st.hp *= 2;
    // Raid Battles: a fixed HP pool shared by the Club. Effects that work in fractions of max HP (poison, Leech Seed,
    // Recover, Super Fang...) use the Pokémon's normal HP instead, so they can't take out or restore the whole pool.
    const baseHp = st.hp;
    if (spec.maxHp) st.hp = Math.round(spec.maxHp);
    const u = { uid: ++UID, key: spec.op, spr: spec.op, def, isOp: true, team, slot, n: def.n, types: def.types.slice(), el: def.types[0], cls: def.cls,
      lvl: prog.lvl, boss: !!spec.boss, max: st, hp: spec.hpNow != null ? Math.max(1, Math.min(st.hp, Math.round(spec.hpNow))) : st.hp, shield: 0, atb: 0, stages: newStages(), status: null, sTurn: 0, eff: [],
      cool: { 1: 0, 2: 0, 3: 0 }, skills: spec.moves ? skillsFrom(spec.moves) : skillsOf(spec.op, prog), sk: prog.sk.slice(), passives: [abilityOf(prog.ab || spec.ab || def.ab)], held: prog.held || spec.held || null, held0: prog.held || spec.held || null,
      nat: prog.nat || null, pot: prog.pot != null ? prog.pot : 3, badges: spec.badges, npc: !!spec.npc, backup: !!spec.backup, own: team === "A" && !!spec.prog && !spec.npc, aura: spec.aura || null, auraN: spec.auraN || null, dmax,
      size: dmax ? 1.7 : spec.aura && !spec.auraN ? 1.4 : 1,   // (drawn bigger: a Dynamax or Gigantamax Pokémon, a Totem; the owner's ask, a8a_render.js)
      flags: {}, alive: true, lastSkill: null };
    // Multitype: Arceus takes its Plate's type
    const PL = u.held && HELD[u.held]; if (u.passives[0] && u.passives[0].id === "MULTITYPE" && PL && (u.passives[0].memory ? PL.memory : /plate$/.test(u.held) && PL.boost)) { u.plateType = PL.memory || PL.boost; u.types = [u.plateType]; u.el = u.plateType; }
    if (spec.maxHp) u.chipHp = baseHp;
    if (dmax && !u.chipHp) u.chipHp = hp1;
    return u;
  }
  // ---------- forms that change in battle ----------
  // a battle form (OPS[key].bf: Sunny Castform, Zen Darmanitan...): its types and stats (HP and level kept), the same moves
  function becomeForm(u, key, line, withHp) {
    const F = OPS[key]; if (!F || u.spr === key || u.flags.transformed) return;
    const prog = { lvl: u.lvl, pot: u.pot, nat: u.nat, sk: u.sk };
    const st = opStats(key, prog, u.team === "A", u.team === "A" ? undefined : (u.badges || 0)).st;
    for (const s of ["atk", "def", "spa", "sdf", "spe"]) u.max[s] = st[s];
    if (withHp && st.hp > u.max.hp && !u.chipHp) { u.hp += st.hp - u.max.hp; u.max.hp = st.hp; }   // (Complete Zygarde: its max HP rises too)
    u.types = F.types.slice(); u.spr = key;
    ev({ k: "transform", u: u.uid, to: key }); if (line) msg(line); fxEv(u);
  }
  // Zen Mode and Zero to Hero (the owner's rule): the first hit from an opposing attack turns Darmanitan Zen and Palafin Hero, for the
  // rest of the battle (switching out too)
  // Truant (each opposing hit: Attack +1) and Klutz (the attacker's Ability becomes Klutz), the owner's rules
  const NO_OVERWRITE = new Set(["MULTITYPE", "STANCE", "ZEN", "SCHOOLING", "SHIELDS_DOWN", "POWER_CONSTRUCT", "DISGUISE", "ICE_FACE", "BATTLE_BOND", "HERO", "COMMANDER", "KLUTZ"]);
  function hitAbilities(tar, att) {
    if (pv(tar, "TRUANT")) stage(tar, tar, "atk", 1, "Truant");
    if (pv(tar, "KLUTZ") && att.alive && att.passives[0] && !NO_OVERWRITE.has(att.passives[0].id) && !item(att, "abilityshield")) { att.passives = [abilityOf("klutz")]; msg(`${Nm(att)}'s Ability became Klutz!`); fxEv(att); }
  }
  function hitForms(u) {
    if (pv(u, "ZEN") && !u.flags.zen) { u.flags.zen = true; formCheck(u); }
    if (pv(u, "HERO") && !u.flags.hero) { u.flags.hero = true; formCheck(u); }
  }
  // Ash-Greninja's Water Shuriken: 3 strikes of 20, 40 and 60 power, each able to miss (like Triple Axel), its priority kept
  const ASH_SHURIKEN = "Ash-Greninja's Water Shuriken: 3 strikes, 20, 40 and 60 power, each strike able to miss (like Triple Axel). It goes first (priority).";
  function ashShuriken(u) { u.skills = u.skills.map(s => s.key === "watershuriken" && !s.axel ? { ...s, pow: 20, hits: [3, 3], axel: true, desc: ASH_SHURIKEN } : s); }
  const axelLike = sk => sk.M.sp === "tripleaxel" || !!sk.axel;
  const COUNTERS = { counter: "P", mirrorcoat: "S", metalburst: "*" };   // (the counters and the damage that sets each off: counterStrikes)
  // (the moves that can't be chosen, as they go off by themselves: Shell Trap, the counters, Conversion and Conversion 2)
  const SELF_GOING = new Set(["shelltrap", "counter", "mirrorcoat", "metalburst", "conversion", "conversion2", "magiccoat", "snatch", "bide"]);
  const STRIKES = [2, 2, 2, 3, 3, 3, 4, 5], avgStrikes = h => { const l = STRIKES.filter(n => n >= h[0] && n <= h[1]); return l.length ? l.reduce((a, b) => a + b, 0) / l.length : (h[0] + h[1]) / 2; };   // (Triple Axel, Triple Kick, Ash-Greninja's Water Shuriken)
  // Forecast (the owner's rule): Castform's form follows its held rock, not the weather. A Heat Rock makes it Sunny Castform with
  // Drought, a Damp Rock Rainy Castform with Drizzle, an Icy Rock Snowy Castform with Snow Warning (their weather goes off as it comes
  // in, 8 rounds with the rock); anything else, a Smooth Rock too, plain Castform, and Forecast does nothing. Losing the rock (Knock
  // Off, Trick, Thief...) turns it back to plain Castform with Forecast; the weather it set stays.
  const CASTFORM_ROCK = { heatrock: ["castformsunny", "drought"], damprock: ["castformrainy", "drizzle"], icyrock: ["castformsnowy", "snow-warning"] };
  function castformItem(u) {
    if (!u.alive || u.key !== "castform" || u.flags.transformed) return;
    if (u.flags.forecast == null) u.flags.forecast = !!(u.passives[0] && u.passives[0].id === "FORECAST");   // (its own Ability, from the start)
    if (!u.flags.forecast) return;
    const h = Object.keys(CASTFORM_ROCK).find(h => item(u, h)), R = h && CASTFORM_ROCK[h];
    if (R && OPS[R[0]]) { if (u.spr !== R[0]) { becomeForm(u, R[0], `${Nm(u)} transformed!`); u.passives = [abilityOf(R[1])]; } }
    else if (u.spr !== u.key) { becomeBase(u); u.passives = [abilityOf("forecast")]; msg(`${Nm(u)} returned to its normal form!`); }
  }
  // Zen Mode (Darmanitan at half HP) and the other forms that change in battle, each time one could change
  function formCheck(u) {
    if (!u.alive) return;
    if (pv(u, "MIMICRY")) { const tt = B.terrain && { electric: "Electric", grassy: "Grass", misty: "Fairy", psychic: "Psychic" }[B.terrain.t], want = tt ? [tt] : OPS[u.spr].types;
      if (want.join() !== u.types.join()) { u.types = want.slice(); msg(tt ? `${Nm(u)}'s type changed to ${tt}!` : `${Nm(u)} returned to its original type!`); fxEv(u); } }
    castformItem(u);   // (Forecast: its held rock, not the weather)
    const sch = pv(u, "SCHOOLING");
    if (sch && OPS.wishiwashischool && u.lvl >= 20) {
      if (u.hp > u.max.hp / 4 && u.spr !== "wishiwashischool") becomeForm(u, "wishiwashischool", `${Nm(u)} formed a school!`);
      else if (u.hp <= u.max.hp / 4 && u.spr === "wishiwashischool") { becomeBase(u); msg(`${Nm(u)} stopped schooling!`); }
    }
    if (pv(u, "SHIELDS_DOWN") && OPS.miniorcore) {
      if (u.hp <= u.max.hp / 2 && u.spr !== "miniorcore") becomeForm(u, "miniorcore", `${Nm(u)}'s shell broke away: Shields Down!`);
      else if (u.hp > u.max.hp / 2 && u.spr === "miniorcore") { becomeBase(u); msg(`${Nm(u)}'s shell came back!`); }
    }
    if (pv(u, "POWER_CONSTRUCT") && OPS.zygardecomplete && u.hp <= u.max.hp / 2 && u.spr !== "zygardecomplete") {
      msg(`You sense the presence of many!`); becomeForm(u, "zygardecomplete", `${Nm(u)} transformed into its Complete Forme!`, true);
    }
    if (pv(u, "ICE_FACE") && u.spr === "eiscuenoice" && (inWeather("hail") || inWeather("snow"))) { becomeBase(u); msg(`${Nm(u)}'s ice face came back!`); }
    const zen = pv(u, "ZEN"), zk = u.key === "darmanitangalar" ? "darmanitangalarzen" : "darmanitanzen";
    if (zen && OPS[zk] && u.flags.zen && u.spr !== zk) becomeForm(u, zk, `${Nm(u)}'s Zen Mode triggered!`);   // (once hit: hitForms)
    if (pv(u, "HERO") && OPS.palafinhero && u.flags.hero && u.spr !== "palafinhero") becomeForm(u, "palafinhero", `${Nm(u)} underwent a heroic transformation!`);
  }
  function becomeBase(u) {
    if (u.spr === u.key) return;
    const prog = { lvl: u.lvl, pot: u.pot, nat: u.nat, sk: u.sk };
    const st = opStats(u.key, prog, u.team === "A", u.team === "A" ? undefined : (u.badges || 0)).st;
    for (const s of ["atk", "def", "spa", "sdf", "spe"]) u.max[s] = st[s];
    u.types = (u.plateType ? [u.plateType] : OPS[u.key].types).slice(); u.spr = u.key;
    ev({ k: "transform", u: u.uid, to: u.key }); fxEv(u);
  }
  function startEffects(list) {
    for (const u of list) {
      // Illusion: it comes in looking like the last Pokémon on its bench, until a damaging move hits it
      if (pv(u, "ILLUSION")) u.flags.illusionReady = true;   // (Illusion, the owner's rule: the first single-target opposing move goes for one of the attacker's partners)
      formCheck(u);
      // a Totem Pokémon's aura (Alola's trials, the owner's pick): its stats rise as it comes in, shown as stat stages fixed to the
      // aura (fixedStage) for as long as it stays on the field; Galar's Dynamax aces have one too (auraN "Dynamax", the owner's pick:
      // the game has no Dynamax, so a Gym Leader's Dynamax ace and a Max Raid's Pokémon battle with an aura instead, a4h_galar.js)
      if (u.aura && u.alive && !u.flags.auraOn) { u.flags.auraOn = true; const up = STAGE_KEYS.filter(s => u.aura[s]).map(s => STAGE_N[s]);
        msg(`${Nm(u)}'s ${u.auraN ? u.auraN + " aura" : "aura"} flared to life!${u.dmax ? " Its HP is doubled!" : ""}${up.length ? ` Its ${up.length > 1 ? up.slice(0, -1).join(", ") + " and " + up[up.length - 1] : up[0]} rose!` : ""}`); fxEv(u); }
      // (the owner's rules) turn meter on coming onto the field by priority bracket, 10% a point (2026-10-19): each priority move it
      // knows adds its own (Quick Attack +10%, Extreme Speed +20%, Fake Out +30%, Protect +40%, Helping Hand +50%; Grassy Glide +10%),
      // a priority Ability its bracket (Prankster and Gale Wings +1, Triage +3) and Quick Draw and the Quick Claw +1; they add up,
      // with no other conditions (priBracket, PRI_AB in a3b_kits.js)
      const pri = u.skills.reduce((a, s) => a + priBracket(s.M), 0) + u.passives.reduce((a, p) => a + (PRI_AB[p.key] || 0), 0) + (item(u, "quickclaw") ? 1 : 0);
      if (pri && u.alive) {
        if (item(u, "quickclaw")) msg(psT("quickclaw", "activate", { POKEMON: nm(u) }));
        u.atb = clamp(u.atb + 10 * pri, 0, 100); ev({ k: "tm", u: u.uid, tm: u.atb, v: 10 * pri });
      }
      if (item(u, "berserkgene")) { useUp(u, `${Nm(u)}'s Berserk Gene kicked in!`); stage(u, u, "atk", 2); tryStatus(u, u, "CNF", false); }
      castformItem(u);   // (Castform holding a Heat, Damp or Icy Rock: that form, and its weather Ability goes off below)
      const pxb = pv(u, "PARADOX");   // Booster Energy (the owner's rule): the Paradox Ability's boost without the sun or the terrain, for as long as it's held (fixedStage)
      if (pxb && item(u, "boosterenergy") && !(pxb.w ? inWeather(pxb.w) : inTerrain(pxb.t))) msg(`${Nm(u)}'s Booster Energy activated its ${u.passives[0].name}!`);
      const foes = enemies(u);
      for (const p of u.passives) {
        if (p.id === "INTIMIDATE") { msg(`${Nm(u)}'s Intimidate!`); for (const f of foes) { if (pv(f, "GUARD_DOG") && !f.flags.noAbility && !gasOn(f)) { stage(f, f, "atk", 1, "Guard Dog"); continue; } const blk = !f.flags.noAbility && !gasOn(f) && f.passives.find(q => q.noIntim); if (blk) { msg(`${Nm(f)}'s ${blk.name} kept it from being intimidated!`); continue; } if (stage(u, f, "atk", -1) && pv(f, "RATTLED")) stage(f, f, "spe", 1, "Rattled"); if (item(f, "adrenalineorb")) { useUp(f, `${Nm(f)}'s Adrenaline Orb kicked in!`); stage(f, f, "spe", 1); } } }
        else if (p.id === "DOWNLOAD") { stage(u, u, "atk", 1, "Download"); stage(u, u, "spa", 1, "Download"); }
        else if (p.id === "NEUTRAL") msg(psT("neutralizinggas", "start"));   // (as in the games: it says so; what it does is gasOn)
        else if (p.id === "ARENA_TRAP") { msg(`${Nm(u)}'s ${p.name}! The opposing team can't get away!`); for (const f of foes) if (!pv(f, "RUN_AWAY")) f.atb = 0; }
        else if (p.id === "SLOW_START") { u.flags.slowStart = 2; msg(`${Nm(u)} can't get it going!`); }   // (the owner's rule: 2 turns, then every stat +2: fixedStage)
        else if (p.id === "MAGNET_PULL") { const st = foes.filter(f => f.types.includes("Steel") && !pv(f, "RUN_AWAY")); if (st.length) { msg(`${Nm(u)}'s Magnet Pull! The opposing Steel types can't get away!`); for (const f of st) f.atb = 0; } }
        else if (p.id === "RUN_AWAY") u.atb = clamp(u.atb + 25, 0, 100);
        else if (p.id === "IMPOSTER" && foes.length) transform(u, foes.slice().sort((a, b) => cpOf(b.max) - cpOf(a.max))[0], true);
        else if (p.id === "CLOUD" && B.weather) {   // Cloud Nine, Air Lock (the owner's rule): the weather ends for good, an area's own too
          const old = B.weather; B.weather = null; B.baseWx = null; B.wxEnd = 0;
          msg(`${Nm(u)}'s ${p.name}! ${WEATHER[old] ? WEATHER[old].end : "The weather cleared up."}`); ev({ k: "weather", w: null });
          for (const x of B.units) if (x.alive) formCheck(x);
        }
        else if (p.id === "DROUGHT" && B.weather !== (p.w || "sun")) {
          // Drought, Drizzle, Sand Stream, Snow Warning: their weather for about five rounds (eight with its rock); a weather that's
          // already up keeps the rounds it has left (the owner's rule: nothing resets it)
          const w = p.w || "sun", rock = { sun: "heatrock", rain: "damprock", sand: "smoothrock", hail: "icyrock" }[w];
          B.weather = w; B.wxEnd = fieldRounds(item(u, rock) ? 8 : 5);
          msg(w === "sun" ? `${Nm(u)}'s Drought intensified the sun's rays!` : `${Nm(u)}'s ${p.name}!`); if (w !== "sun" && WEATHER[w]) msg(WEATHER[w].turn); ev({ k: "weather", w });
          for (const x of B.units) if (x.alive) formCheck(x);
        }
        else if (p.id === "SURGE" && !(B.terrain && B.terrain.t === p.t)) setTerrain(u, p.t);
        else if (p.id === "ENTRY_BOOST") for (const s of p.stats || [p.stat]) stage(u, u, s, 1, p.name);   // (Supreme Overlord: two stats)
        else if (p.id === "SCREEN_CLEANER") { let any = false; for (const tm of ["A", "E"]) for (const id of ["REFLECT", "LSCREEN", "VEIL"]) if ((B.side && B.side[tm] && B.side[tm][id]) || B.units.some(x => x.team === tm && has(x, id))) { clearSide(tm, id); any = true; } if (any) msg(`${Nm(u)}'s Screen Cleaner swept the screens away!`); }
        else if (p.id === "CURIOUS") for (const a of allies(u)) { if (a !== u && Object.values(a.stages).some(v => v)) { a.stages = newStages(); msg(`${Nm(a)}'s stat changes were removed!`); fxEv(a); } }
        else if (p.id === "HOSPITALITY") for (const a of allies(u)) { if (a !== u) heal(a, hpBase(a) / 4, `${Nm(a)} drank down all the matcha that ${nm(u)} made!`); }
        else if (p.id === "HONEY") {   // Honey Gather (the owner's rule): its partners get back 1/4 of their HP, and it and they slow down (Speed -1)
          for (const a of allies(u)) if (a !== u) heal(a, hpBase(a) / 4, `${Nm(a)} ate the honey ${nm(u)} gathered!`);
          for (const a of allies(u)) stage(u, a, "spe", -1, "Honey Gather");
        }
        else if (p.id === "SYRUP" && !u.flags.syrup) { u.flags.syrup = 1; msg(`A supersweet aroma is wafting from the syrup covering ${nm(u)}!`); for (const f of foes) stage(u, f, "eva", -1); }
        else if (p.id === "COSTAR") { const a = allies(u).find(a => a !== u && Object.values(a.stages).some(v => v)); if (a) { u.stages = { ...a.stages }; msg(`${Nm(u)} copied ${nm(a)}'s stat changes!`); fxEv(u); } }
        else if (p.id === "TERA_SHIFT" && OPS.terapagosterastal && u.spr !== "terapagosterastal") becomeForm(u, "terapagosterastal", `${Nm(u)} transformed!`, true);
        else if ((p.id === "HERO" || p.id === "ZEN") && (u.flags.hero || u.flags.zen)) formCheck(u);   // (Hero or Zen already: the rest of the battle)
        else if (p.id === "TRACE" && foes.length) {
          const t = pick(foes.filter(f => !["TRACE", "IMPOSTER", "NEUTRAL", "NONE"].includes((f.passives[0] || {}).id)));
          if (t) { u.passives = [abilityOf(t.passives[0].key)]; msg(`${Nm(u)} traced ${nm(t)}'s ${t.passives[0].name}!`); abilityCure(u); }
        }
        else if (p.id === "FRISK") { const it = foes.filter(f => f.held && !f.flags.itemUsed); if (it.length) for (const f of it) msg(psT("frisk", "activate", { POKEMON: nm(u), TARGET: nm(f), ITEM: HELD[f.held].n })); }
        else if (p.id === "FOREWARN" && foes.length) {
          let best = null; for (const f of foes) for (const s of f.skills) if (s.M.c !== "X" && (!best || s.pow > best.s.pow)) best = { f, s };
          if (best) msg(`${Nm(u)}'s Forewarn alerted it to ${best.s.name}!`);
        }
        else if (p.id === "ANTICIPATION" && foes.some(f => f.skills.some(s => s.M.c !== "X" && (OHKO.has(s.M.sp) || typeEff(s.M.t, u.types) > 1)))) msg(`${Nm(u)} shuddered!`);
      }
    }
    for (const u of list) autoTrickRoom(u);   // (Trick Room sets itself up as its user comes in: the owner's rule)
    for (const u of list) autoField(u);   // (so do the weather, terrain, entry hazards, screens and rooms: the owner's rule)
    for (const u of list) autoRedirect(u);   // (so do Follow Me, Rage Powder and Spotlight: the owner's rule)
    for (const u of list) autoBide(u);   // (and Bide starts storing energy: the owner's rule, 2026-10-19)
  }
  // Bide (the owner's rule, 2026-10-19): it can't be chosen. Its user starts storing energy by itself the moment it comes onto the
  // field, if the move is ready, and keeps storing until it goes off (bideStrikes); once a time on the field
  function autoBide(u) {
    if (!u.alive || B.over || !B.units.includes(u) || u.flags.bide) return;
    const s = u.skills.find(x => x.M.sp === "bide" && skillReady(u, x)); if (!s) return;
    u.flags.bide = { hits: 0, dmg: 0, by: null, act: null }; addEff(u, "BIDE", 999, u); msg(`${Nm(u)} is storing energy!`);
  }
  // a move that goes off by itself when something happens (Magic Coat, Snatch): ready, its Pokémon on the field and able to move
  const reactReady = (x, sp) => x.alive && B.units.includes(x) && !x.flags.semi && x.status !== "SLP" && x.status !== "FRZ" && !has(x, "TAUNT") && x.skills.find(k => k.M.sp === sp && skillReady(x, k));
  const reactEv = (x, s, t) => { ev({ k: "act", u: x.uid, slot: s.slot, key: s.key, name: s.name, type: s.type, cat: s.cat, anim: s.anim, s3: false, t: t && t.uid, tgt: s.target, quiet: 1 }); msg(`${Nm(x)} used ${s.name}!`); };
  // Snatch takes a move that raises its user's (or its team's) stats or heals them (the owner's rule, 2026-10-19)
  const SNATCH_SP = new Set(["bellydrum", "focusenergy", "aquaring", "ingrain", "filletaway", "acupressure", "lifedew"]);
  const snatchable = sk => { const M = sk.M; return M.c === "X" && (sk.target === "self" || sk.target === "team") && !!(M.hf || M.hl > 0 || SNATCH_SP.has(M.sp) || (M.st && M.sw === "self" && M.st.some(([, n]) => n > 0))); };
  // the field moves (the owner's rule, like Trick Room): weather, terrain, entry hazards, Reflect, Light Screen, Aurora Veil, Safeguard,
  // Mist, Lucky Chant, Gravity, Wonder Room and Magic Room go up by themselves the moment their user comes onto the field, if the move
  // is ready. It isn't the user's turn (the move goes on cooldown). When it's already up (that weather or terrain, the screen, every
  // layer of the hazard, the room) the move stays ready; a different weather or terrain is replaced, whoever set it. Aurora Veil only
  // in snow, hazards only with an opposing Pokémon left on the bench to hit
  const ENTRY_SIDE = { reflect: "REFLECT", lightscreen: "LSCREEN", auroraveil: "VEIL", safeguard: "SAFEGUARD", mist: "MIST", luckychant: "LUCKY" };
  const ENTRY_HZ = { stealthrock: h => h.sr, spikes: h => h.spikes >= 3, toxicspikes: h => h.tspikes >= 2, stickyweb: h => h.web };
  const powderProof = (u, x) => x.types.includes("Grass") || item(x, "safetygoggles") || tab(u, x, "OVERCOAT");   // (powder moves don't affect it)
  function entryReady(u, s) {
    const sp = s.M.sp;
    if (WX_MOVE[sp]) return B.weather !== WX_MOVE[sp];
    if (sp === "terrain") return !!TERRAIN_MOVE[s.key] && !(B.terrain && B.terrain.t === TERRAIN_MOVE[s.key]);
    if (ENTRY_HZ[sp]) return benchOf(foeTeam(u)).length > 0 && !ENTRY_HZ[sp](sideHz(foeTeam(u)));
    if (sp === "auroraveil" && !(inWeather("hail") || inWeather("snow"))) return false;
    if (ENTRY_SIDE[sp]) return !has(u, ENTRY_SIDE[sp]);
    if (sp === "gravity") return !fieldOn("gravity");
    if (sp === "wonderroom" || sp === "magicroom") return !fieldOn(sp === "wonderroom" ? "wonderRoom" : "magicRoom");
    if (sp === "iondeluge") return !fieldOn("ionDeluge");
    if (sp === "powder") return enemies(u).some(x => x.alive && !has(x, "POWDER") && !powderProof(u, x));
    return false;
  }
  function autoField(u) {
    if (!u.alive || B.over || !B.units.includes(u) || u.flags.semi || has(u, "TAUNT") || u.status === "SLP" || u.status === "FRZ") return;
    const s = u.skills.find(x => ENTRY_MOVES.has(x.M.sp) && skillReady(u, x) && entryReady(u, x)); if (!s) return;
    act(u, s.slot, null, null, true);
  }
  // Trick Room (the owner's rule): its user sets it up by itself the moment it comes onto the field, if the move is ready. It isn't the
  // user's turn (its turn meter stays; the move goes on cooldown), like Pursuit and Upper Hand. Like the move used by hand, it ends a
  // Trick Room that's already up, as in the main games
  // (a Trainer's backup setter, sent in while the room is up because nobody else is left, doesn't end its own team's room)
  function autoTrickRoom(u) {
    if (!u.alive || B.over || !B.units.includes(u) || u.flags.semi || has(u, "TAUNT") || u.status === "SLP" || u.status === "FRZ") return;
    if (u.backup && B.trickRoom > B.turn) return;
    const s = u.skills.find(x => x.M.sp === "trickroom" && skillReady(u, x)); if (!s) return;
    act(u, s.slot, null, null, true);
  }
  // Follow Me, Rage Powder and Spotlight (the owner's rule, like Trick Room): used by themselves the moment their user comes onto
  // the field, if the move is ready and a partner is out there to cover; not the user's turn (the move goes on cooldown). Spotlight
  // can't light up its own user (as in the main games), so it goes on the partner best able to take the hits, one not setting up
  function autoRedirect(u) {
    if (!u.alive || B.over || !B.units.includes(u) || u.flags.semi || has(u, "TAUNT") || u.status === "SLP" || u.status === "FRZ" || has(u, "FOLLOWME")) return;
    const mates = allies(u).filter(x => x !== u && x.alive); if (!mates.length) return;
    const s = u.skills.find(x => x.M.sp === "followme" && skillReady(u, x)) || u.skills.find(x => x.M.sp === "spotlight" && skillReady(u, x)); if (!s) return;
    act(u, s.slot, s.M.sp === "spotlight" ? spotlightOn(mates) : null, null, true);
  }
  // Spotlight's partner: the one best able to take the hits (its HP left times its bulk), not one with a setup move
  function spotlightOn(mates) {
    const sets = x => x.skills.some(k => k.M.c === "X" && k.M.st && k.M.st.some(([, v]) => v > 0) && k.M.sw !== "target");
    const soak = x => x.hp / x.max.hp * (x.max.hp * (x.max.def + x.max.sdf)) * (sets(x) ? .4 : 1);
    return mates.slice().sort((a, b) => soak(b) - soak(a))[0];
  }
  // on its own turn too (the owner's rule): a Follow Me, Rage Powder or Spotlight user uses it the moment it's ready, over any other
  // move, whenever a partner is out there to cover (every AI style, Auto included)
  function redirectNow(u) {
    if (has(u, "TAUNT") || has(u, "FOLLOWME") || allies(u).some(a => a !== u && (effOf(a, "FOLLOWME") || {}).src === u.uid)) return null;   // (its redirect is already up: it lasts)
    const mates = allies(u).filter(x => x !== u && x.alive); if (!mates.length) return null;
    const s = u.skills.find(x => x.M.sp === "followme" && skillReady(u, x)) || u.skills.find(x => x.M.sp === "spotlight" && skillReady(u, x)); if (!s) return null;
    return { slot: s.slot, t: s.M.sp === "spotlight" ? spotlightOn(mates) : null, v: 99 };
  }
  // the shields that only stop damaging moves (status moves get through), as in the main games
  const ATTACK_ONLY = new Set(["kingsshield", "obstruct", "silktrap", "burningbulwark"]);
  // a contact move stopped by a shield pays for it (Protective Pads and a Punching Glove's punches don't touch it): King's Shield
  // Attack −2 (its Generation 6 effect, the owner's rule), Spiky Shield 1/8 of the attacker's max HP, Baneful Bunker poison,
  // Obstruct Defense −2, Silk Trap Speed −1, Burning Bulwark a burn
  function shieldHit(x, u, sk) {
    const M = sk.M, k = (effOf(x, "PROTECT") || {}).shield;
    if (!M.ct || !u.alive || pv(u, "LONG_REACH") || item(u, "protectivepads") || (item(u, "punchingglove") && M.pu)) return;
    if (k === "kingsshield") stage(x, u, "atk", -2);
    else if (k === "spikyshield") chip(u, hpBase(u) / 8, `${Nm(u)} was hurt by ${nm(x)}'s Spiky Shield!`);
    else if (k === "banefulbunker") tryStatus(x, u, "PSN", false);
    else if (k === "obstruct") stage(x, u, "def", -2);
    else if (k === "silktrap") stage(x, u, "spe", -1);
    else if (k === "burningbulwark") tryStatus(x, u, "BRN", false);
  }
  const sideHz = team => (B.hazards || (B.hazards = { A: { sr: 0, spikes: 0, tspikes: 0 }, E: { sr: 0, spikes: 0, tspikes: 0 } }))[team];
  // a terrain for about five rounds (eight with a Terrain Extender): the terrain moves, the Surge Abilities, Seed Sower
  function setTerrain(u, tt) {
    B.terrain = { t: tt, until: fieldRounds(item(u, "terrainextender") ? 8 : 5) }; msg(TERRAIN[tt].start); ev({ k: "terrain", t: tt, tr: B.trickRoom > B.turn ? 1 : 0 }); terrainSeeds();
    for (const x of B.units) if (x.alive) formCheck(x);   // (Mimicry)
  }
  // a terrain ends (its rounds are up, Ice Spinner, Steel Roller, Defog): Mimicry and Quark Drive follow
  function endTerrain() {
    msg(TERRAIN[B.terrain.t].end); B.terrain = null; ev({ k: "terrain", t: null, tr: B.trickRoom > B.turn ? 1 : 0 });
    for (const x of B.units) if (x.alive) formCheck(x);
  }
  // the highest of its stats (Beast Boost, Protosynthesis, Quark Drive)
  const bestStat = u => ["atk", "def", "spa", "sdf", "spe"].reduce((a, s) => u.max[s] > u.max[a] ? s : a, "atk");
  // how many on its team have fainted (Supreme Overlord, Last Respects)
  const fainted = team => B.gone.filter(x => x.team === team && !x.alive).length + B.units.filter(x => x.team === team && !x.alive).length;
  // ball and bomb moves (Bulletproof) and pulse moves (Mega Launcher)
  const BALLISTIC = new Set(["aurasphere", "barrage", "beakblast", "bulletseed", "eggbomb", "electroball", "energyball", "focusblast", "gyroball", "iceball", "magnetbomb",
    "mistball", "mudbomb", "octazooka", "pollenpuff", "pyroball", "rockblast", "rockwrecker", "searingshot", "seedbomb", "shadowball", "sludgebomb", "weatherball", "zapcannon", "syrupbomb"]);
  const PULSE = new Set(["aurasphere", "darkpulse", "dragonpulse", "waterpulse", "originpulse", "terrainpulse", "healpulse"]);
  // moves another move can't call (Assist, Me First, Instruct)
  const CALL_BAN = new Set(["conversion", "conversion2", "shelltrap", "comeuppance", "assist", "mefirst", "metronome", "copycat", "copycat1", "copycat3", "mirrormove", "mirrormove1", "mirrormove3", "sleeptalk", "mimic", "sketch", "sketch1", "sketch3", "struggle", "transform", "bide", "skydrop",
    "protect", "detect", "endure", "counter", "mirrorcoat", "metalburst", "followme", "ragepowder", "snatch", "instruct", "focuspunch", "teleport", "batonpass"]);
  // Natural Gift: each Berry's type and power
  const NG = {};
  for (const [t, list] of Object.entries({ Fire: "cheri occa", Water: "chesto passho", Electric: "pecha wacan", Grass: "rawst rindo liechi", Ice: "aspear yache ganlon",
    Fighting: "leppa chople salac", Poison: "oran kebia petaya", Ground: "persim shuca apicot", Flying: "lum coba lansat", Psychic: "sitrus payapa starf",
    Bug: "figy tanga enigma", Rock: "wiki charti micle", Ghost: "mago kasib custap", Dragon: "aguav haban jaboca", Dark: "iapapa colbur rowap maranga",
    Steel: "babiri", Normal: "chilan", Fairy: "roseli kee" })) for (const b of list.split(" ")) NG[b + "berry"] = [t, ["liechi", "ganlon", "salac", "petaya", "apicot", "lansat", "starf", "enigma", "micle", "custap", "jaboca", "rowap", "kee", "maranga"].includes(b) ? 100 : 80];
  // Fling: what an item hits for, and what some of them do
  const flingPow = it => !it ? 0 : it === "ironball" ? 130 : /plate$/.test(it) ? 90 : ["thickclub", "hardstone", "rockyhelmet", "roomservice"].includes(it) ? 90 : (HELD[it] || {}).berry || /herb$|scarf$|incense$|sash$|band$|specs$/.test(it) ? 10 : 30;
  function flingFx(u, x, it) {
    if (it === "flameorb") tryStatus(u, x, "BRN", false);
    else if (it === "toxicorb") tryStatus(u, x, "TOX", false);
    else if (it === "lightball") tryStatus(u, x, "PAR", false);
    else if ((it === "kingsrock" || it === "razorfang") && !pv(x, "INNER_FOCUS")) flinchIt(x);
    else if (it === "whiteherb") { for (const k in x.stages) if (x.stages[k] < 0) x.stages[k] = 0; fxEv(x); }
    else if (it === "mentalherb") for (const id of ["INFAT", "TAUNT", "DISABLE", "HEALBLOCK", "ENCORE", "TORMENT"]) removeEff(x, id);
  }
  // Teatime's status Berries (the HP and pinch ones go through hpItems)
  function statusTea(x) { const H = heldX(x); if (!H || !H.cure) return false; useUp(x, `${Nm(x)} ate its ${H.n}!`); if (x.status && H.cure.includes(x.status)) { x.status = null; x.sTurn = 0; } if (H.cure.includes("CNF")) removeEff(x, "CNF"); fxEv(x); return true; }
  // Future Sight and Doom Desire land on every Pokémon the other side has on the field when they come (a spread move)
  function futureHits() {
    for (const f of (B.future || []).filter(f => B.turn >= f.at)) {
      B.future = B.future.filter(y => y !== f);
      const att = B.byId(f.by); if (!att) continue;
      const sk = { ...makeSkill(f.key, MOVES[f.key].s), cd: 0 }, live = att.alive && B.units.includes(att);
      for (const tar of B.units.filter(y => y.team === f.team && y.alive && !commanding(y))) {
        const r = damageOf(att, tar, sk, {});
        msg(`${Nm(tar)} took the ${sk.name} attack!`);
        if (r.e === 0) { msg(`It doesn't affect ${nm(tar)}...`); continue; }
        applyDamage(live ? att : null, tar, r.dmg, live ? { cat: sk.M.c } : { cat: null });
      }
    }
  }
  // ---------- the bench: who's left, filling empty places, switching ----------
  const benchOf = team => B.bench[team].filter(x => x.alive);
  const emptySlots = team => [0, 1, 2].filter(s => !B.units.some(x => x.team === team && x.alive && x.slot === s));
  const aliveCount = team => B.units.filter(x => x.team === team && x.alive).length + benchOf(team).length;
  const sideName = team => TEXT_TOKENS ? `\u0006${team}\u0007` : team === VIEW_ME ? "You" : B.trainer || "The opponent";
  // a Pokémon from the bench takes a place on the field (events: the line, then "sendin" for the Poké Ball)
  function enter(team, slot, x, line, atb) {
    B.bench[team].splice(B.bench[team].indexOf(x), 1);
    x.slot = slot; x.atb = atb; x.fresh = true;
    B.units.push(x);
    for (const id in (B.side && B.side[team]) || {}) if (B.side[team][id] > B.turn) addEff(x, id, 99, null, true);   // (Reflect, Light Screen...: the side's)
    if (!B.sim && team === "E") dexSee(x.key);
    if (!TEXT_TOKENS || line) msg(line || (team === VIEW_ME ? `Go! ${x.n}!` : B.wild ? `A wild ${x.n} appeared!` : `${sideName(team)} sent out ${x.n}!`));   // (Showdown says its own)
    ev({ k: "sendin", u: x.uid, team, slot });
    arrive(x); terrainSeeds();
    startEffects([x]);
    // (the screen draws every newcomer afresh: its badge and icons as it arrives, Tailwind's Speed, the weather's and the field's
    // fixed stages, the side's screens, even when they're what it had when it left)
    if (x.alive && B.units.includes(x) && !cfg.from) fxEv(x);
  }
  // entry hazards on its side (Stealth Rock, Spikes, Toxic Spikes), and a Healing Wish waiting for it
  function arrive(x) {
    const hz = B.hazards && B.hazards[x.team];
    if (B.healWish && B.healWish[x.team]) { B.healWish[x.team] = false; x.status = null; heal(x, x.max.hp, `The healing wish came true for ${nm(x)}!`); fxEv(x); }
    if (!hz || pv(x, "MAGIC_GUARD") || item(x, "heavydutyboots")) return;
    if (hz.sr) chip(x, hpBase(x) * typeEff("Rock", x.types) / 8, `Pointed stones dug into ${nm(x)}!`);
    if (x.alive && hz.spikes && grounded(x)) chip(x, hpBase(x) * [0, 1 / 8, 1 / 6, 1 / 4][hz.spikes], `${Nm(x)} was hurt by the spikes!`);
    if (x.alive && hz.web && grounded(x)) { msg(`${Nm(x)} was caught in a sticky web!`); stage(null, x, "spe", -1); }
    if (x.alive && hz.tspikes && grounded(x)) {
      if (x.types.includes("Poison")) { hz.tspikes = 0; msg(psT("toxicspikes", "end", { TEAM: psTeam(x.team) })); hzEv(x.team); }
      else tryStatus(null, x, hz.tspikes > 1 ? "TOX" : "PSN", false);
    }
  }
  // a Pokémon sent in to take a fainted one's place (the owner's rule): protected like Protect until its first turn (moves from the
  // other side fail; Feint and the like break it, Unseen Fist gets through). Entry hazards, the weather and its status still hurt it.
  // Not one dragged in (Roar, Dragon Tail...) or coming in on a pivot move (U-turn, Volt Switch...): those go through switchOut
  function sendIn(team, slot, x) {
    const old = B.units.find(u => u.team === team && u.slot === slot && !u.alive);
    if (old) { B.units.splice(B.units.indexOf(old), 1); B.gone.push(old); ev({ k: "clear", u: old.uid }); }
    enter(team, slot, x, null, R() * 10);
    if (x.alive && B.units.includes(x) && !has(x, "PROTECT")) { addEff(x, "PROTECT", 99, x, true); const pe = effOf(x, "PROTECT"); if (pe) pe.shield = "replace"; msg(`${Nm(x)} is protected until its first turn!`); ev({ k: "aura", u: x.uid }); }
  }
  // leaving the field ends stat changes and volatile effects (a status condition stays), as in the games
  function switchOut(u, x, forced) {
    const slot = u.slot;
    if (u.orig) untransform(u, false);
    const pass = forced === "baton" ? { stages: { ...u.stages }, shield: u.shield, eff: u.eff.filter(e => ["SUB", "FOCUS", "AQUARING", "INGRAIN", "MAGNETRISE", "CNF", "SEED", "CURSE"].includes(e.id)) } : null;
    if (pv(u, "REGEN") && u.alive) u.hp = Math.min(u.max.hp, u.hp + Math.floor(u.max.hp / 3));
    u.flags.wasOut = true; u.flags.booster = false; u.flags.bide = null; u.flags.stock = 0; u.flags.stun = false;   // (Zero to Hero; Booster Energy's boost, Bide and Stockpile end)
    u.aura = null;   // (a Totem's aura ends when it leaves the field, as in the games)
    for (const x of B.units) { const sd = effOf(x, "SKYDROP"); if (sd && sd.src === u.uid) removeEff(x, "SKYDROP"); }
    if (u.passives[0] && u.passives[0].key === "natural-cure") { u.status = null; u.sTurn = 0; }
    u.stages = newStages(); u.eff = []; u.shield = 0; u.atb = 0; if (u.status === "TOX") u.sTurn = 1; u.flags.noAbility = false; loveEnds(u);
    if (forced !== true && !TEXT_TOKENS) msg(u.team === VIEW_ME ? `${u.n}, come back!` : `${sideName(u.team)} withdrew ${u.n}!`);
    gasLeaves(u);
    ev({ k: "recall", u: u.uid, forced: forced === true });
    B.units.splice(B.units.indexOf(u), 1); u.slot = -1; B.bench[u.team].push(u);
    enter(x.team, slot, x, forced === true ? `${x.n} was dragged out!` : null, 0);
    if (pass && x.alive) { x.stages = pass.stages; x.shield = pass.shield; x.eff.push(...pass.eff.map(e => ({ ...e }))); fxEv(x); }
    if (forced && forced.sub && x.alive) { x.shield = forced.sub; x.eff.push({ id: "SUB", turns: 99 }); msg(`${Nm(x)} is behind the decoy!`); fxEv(x); }   // (Shed Tail)
    terrainSeeds();
  }
  // Bind and Wrap hold a Pokémon in place
  const canSwitch = u => benchOf(u.team).length > 0 && !fieldOn("fairyLock") && (item(u, "shedshell") || (!has(u, "TRAP") && !has(u, "INGRAIN") && !has(u, "NOSWITCH") && !trapped(u) && !pulled(u)));

  const hpBase = u => u.chipHp || u.max.hp;
  // hit by another Pokémon's move since its own last turn (Revenge doubles, Focus Punch fails)
  const wasHit = u => u.hitT != null && u.hitT > (u.actT == null ? -1 : u.actT);
  // ---------- stats ----------
  const inWeather = w => B.weather === w && !(B.cloudMaybe !== false && B.units.some(x => x.alive && pv(x, "CLOUD")));
  // a weather Ability's own weather is up (Ice Body and Snow Cloak, listed for hail, work in snow too)
  const abWeather = w => w === "hail" ? inWeather("hail") || inWeather("snow") : inWeather(w);
  // the Ability that keeps this weather's damage off it (Sand Rush and Sand Veil in a sandstorm, Ice Body and Snow Cloak in hail)
  const weatherProof = (u, w) => ["WSPEED", "WEVA", "WHEAL"].some(id => { const p = pv(u, id); return p && p.w === w; });
  // on the ground (terrains and Spikes reach it): not Flying, no Levitate, no Magnet Rise
  const grounded = u => fieldOn("gravity") || !has(u, "TELEKINESIS") && grounded0(u);
  const grounded0 = u => item(u, "ironball") || has(u, "SMACKDOWN") || (!u.types.includes("Flying") && !pv(u, "IMMUNE_TYPE") && !has(u, "MAGNETRISE") && !item(u, "airballoon"));
  const inTerrain = (t, u) => B.terrain && B.terrain.t === t && (!u || grounded(u));
  // Weather Ball takes the weather's type; everything else its own
  const WB_TYPE = { sun: "Fire", rain: "Water", sand: "Rock", hail: "Ice", snow: "Ice" };
  const mtype = (att, sk) => { const t1 = mtype1(att, sk); return att && sk.M.c !== "X" && has(att, "ELECTRIFY") ? "Electric" : t1 === "Normal" && sk.M.c !== "X" && fieldOn("ionDeluge") ? "Electric"
    : sk.M.sp === "naturalgift" && att && NG[att.held] ? NG[att.held][0] : t1; };
  const TERRAIN_TYPE = { electric: "Electric", grassy: "Grass", misty: "Fairy", psychic: "Psychic" };
  const mtype1 = (att, sk) => { const t = mtype0(att, sk), ate = att && sk.M.c !== "X" && pv(att, "ATE");
    return ate && (ate.sound ? sk.M.so : t === "Normal") ? ate.type : sk.M.sp === "ivycudgel" && att ? att.types[1] || att.types[0] : sk.key === "aurawheel" && att && att.flags.hangry ? "Dark" : t; };
  const mtype0 = (att, sk) => att && pv(att, "NORMALIZE") && sk.M.c !== "X" ? "Normal" : sk.key === "terrainpulse" && att && B.terrain && inTerrain(B.terrain.t, att) ? TERRAIN_TYPE[B.terrain.t] : sk.M.sp === "weatherball" && B.weather && inWeather(B.weather) ? WB_TYPE[B.weather] : (sk.key === "judgment" || sk.key === "multiattack") && att && att.plateType ? att.plateType : sk.M.sp === "hiddenpower" && att ? att.flags.hpType || att.types[0] : sk.M.t;   // (Hidden Power: the last attack used on it, the owner's rule)
  // ---------- fixed stat stages (the owner's rule) ----------
  // Every stat change that comes from an item, an Ability, the field (Tailwind, Gravity, the weather, a terrain) or a status is a stat
  // stage, shown on the stat badge with the ones moves make (Choice Band: Atk+1). They're fixed to their source: they last while it
  // does, and Haze, Clear Smog, White Herb, Topsy-Turvy, Psych Up, Spectral Thief and Baton Pass don't remove, flip, copy or pass them;
  // Simple and Contrary don't change them, Clear Body, Defiant and Competitive don't react to them, and critical hits and Unaware leave
  // out only the stages moves made. Together with those, ±6 at most.
  const STAGE_KEYS = ["atk", "def", "spa", "sdf", "spe", "acc", "eva"];
  function fixedStage(u, s) {
    if (!u || !u.alive) return 0;
    const st = u.status, sun = inWeather("sun");
    // Slow Start (the owner's rule): its first 2 turns Attack and Speed −2, then every stat +2
    const slow = pv(u, "SLOW_START") && u.flags.slowStart != null ? (u.flags.slowStart > 0 ? -2 : 2) : 0;
    let n = slow > 0 && s !== "acc" && s !== "eva" ? 2 : slow < 0 && (s === "atk" || s === "spe") ? -2 : 0;
    if (s === "atk") {
      if (pv(u, "HUGE")) n += 2;                       // Huge Power, Pure Power
      if (pv(u, "HUSTLE")) n += 1;
      if (pv(u, "GORILLA")) n += 1;                    // Gorilla Tactics (no move lock)
      if (pv(u, "TOXIC_BOOST") && (st === "PSN" || st === "TOX")) n += 1;
      if (pv(u, "GUTS") && st) n += 1; else if (st === "BRN") n -= 2;   // a burn: Attack −2 (Guts ignores it)
      if (sun && allies(u).some(a => pv(a, "FLOWER_GIFT"))) n += 1;
      if ((pv(u, "DROUGHT") || {}).atkSun && sun) n += 1;   // Orichalcum Pulse
      if (item(u, "choiceband") || item(u, "muscleband") || item(u, "lifeorb")) n += 1;
      if (item(u, "lightball") && HELD.lightball.only.includes(u.key)) n += 2;   // (the Pikachu line: house rule)
      if (item(u, "thickclub") && (u.key === "cubone" || u.key === "marowak")) n += 2;
    } else if (s === "spa") {
      if (item(u, "choicespecs") || item(u, "wiseglasses") || item(u, "lifeorb")) n += 1;
      if (pv(u, "FLARE_BOOST") && st === "BRN") n += 1;
      if (pv(u, "PLUSMINUS") && allies(u).some(a => a !== u && pv(a, "PLUSMINUS"))) n += 1;
      if (item(u, "lightball") && HELD.lightball.only.includes(u.key)) n += 2;
      if (pv(u, "SOLAR") && sun) n += 1;
      if ((pv(u, "SURGE") || {}).spaTer && inTerrain("electric")) n += 1;   // Hadron Engine
      if (item(u, "souldew") && (u.key === "latias" || u.key === "latios")) n += 1;   // Soul Dew (the owner's rule: Generation 3's Sp. Atk and Sp. Def +1 too)
    } else if (s === "def") {
      if (pv(u, "MARVEL") && st) n += 1;
      if (inWeather("hail") && u.types.includes("Ice")) n += 1;   // (hail and snow are one weather)
      if (item(u, "eviolite") && canEvolve(u.key)) n += 1;
      if (item(u, "metalpowder") && u.key === "ditto") n += 2;
      if (pv(u, "FUR_COAT")) n += 2;
      if (pv(u, "GRASS_PELT") && inTerrain("grassy")) n += 1;
    } else if (s === "sdf") {
      if (item(u, "assaultvest")) n += 1;
      if (sun && allies(u).some(a => pv(a, "FLOWER_GIFT"))) n += 1;
      if (item(u, "eviolite") && canEvolve(u.key)) n += 1;
      if (inWeather("sand") && u.types.some(t => t === "Rock" || t === "Ground" || t === "Steel")) n += 1;   // (Ground and Steel types too: the owner's house rule; in the main games only Rock)
      if (item(u, "souldew") && (u.key === "latias" || u.key === "latios")) n += 1;   // Soul Dew
    } else if (s === "spe") {
      if (item(u, "choicescarf")) n += 1;
      if (item(u, "quickpowder") && u.key === "ditto") n += 2;
      if (item(u, "ironball")) n -= 2;
      if (pv(u, "QUICK_FEET") && st) n += 1; else if (st === "PAR") n -= 2;   // paralysis: Speed −2 (Quick Feet ignores it)
      const ws = pv(u, "WSPEED"); if (ws && inWeather(ws.w)) n += 2;             // Swift Swim, Chlorophyll, Sand Rush, Slush Rush
      if (pv(u, "UNBURDEN") && !(u.held && !u.flags.itemUsed)) n += 2;            // Unburden (the owner's rule): whenever it holds no item
      if (B.tailwind && B.tailwind[u.team] > B.turn) n += 2;
      const ts = pv(u, "TSPEED"); if (ts && inTerrain(ts.t)) n += 2;             // Surge Surfer
    } else if (s === "acc") {
      if (pv(u, "ACC")) n += 1;                          // Compound Eyes
      if (pv(u, "HUSTLE")) n -= 1;
      if (item(u, "widelens") || item(u, "zoomlens")) n += 1;
      if (fieldOn("gravity")) n += 2;
      if (allies(u).some(x => pv(x, "VICTORY_STAR"))) n += 1;
    } else if (s === "eva") {
      const we = pv(u, "WEVA"); if (we && abWeather(we.w)) n += 1;   // Sand Veil, Snow Cloak
      if (item(u, "brightpowder") || item(u, "laxincense")) n += 1;
      if (pv(u, "TANGLED") && has(u, "CNF")) n += 3;   // Tangled Feet
    }
    if (u.aura && u.aura[s]) n += u.aura[s];   // (a Totem Pokémon's aura, while it's on the field: startEffects)
    if (s !== "acc" && s !== "eva" && u.key === "dondozo" && B.units.some(x => x !== u && x.team === u.team && commanding(x))) n += 2;   // (Commander)
    { const wtA = pv(u, "WEIGHT"); if (wtA) { if (wtA.mul > 1) n += s === "atk" || s === "def" ? 1 : s === "spe" ? -2 : 0; else if (s === "spe") n += 2; } }   // Heavy Metal: Atk +1, Def +1, Spe -2; Light Metal: Spe +2 (the owner's rules)
    if (s !== "acc" && s !== "eva") {
      // Protosynthesis and Quark Drive: its highest stat in harsh sunlight or Electric Terrain, or while it holds Booster Energy
      const px = pv(u, "PARADOX"); if (px && s === bestStat(u) && (item(u, "boosterenergy") || (px.w ? inWeather(px.w) : inTerrain(px.t)))) n += 1;
      // the Ruin Abilities: everyone else's stat −1
      if (s !== "spe" && B.units.some(x => x.alive && x !== u && (pv(x, "RUIN") || {}).stat === s)) n -= 1;
    }
    return n;
  }
  // what the stat badge shows: the stages moves made plus the fixed ones, ±6 together
  function shownStages(u) { const o = {}; for (const s of STAGE_KEYS) { const v = clamp((u.stages[s] || 0) + fixedStage(u, s), -6, 6); if (v) o[s] = v; } return o; }
  function syncFx() {
    for (const u of B.units) {
      if (u.alive && u.key === "castform") castformItem(u);
      if (u.key === "tatsugiri") { const c = commanding(u); if (c !== !!u.flags.cmd) {   // (Commander: in or out of Dondozo's mouth)
        u.flags.cmd = c; const d = B.units.find(x => x.alive && x.team === u.team && x.key === "dondozo");
        if (c) msg(`${Nm(u)} went inside ${d ? nm(d) : "Dondozo"}'s mouth! It's giving the orders now!`); else if (u.alive) msg(`${Nm(u)} came out!`);
        if (u.alive) ev({ k: "semi", u: u.uid, on: c ? 1 : 0 });
      } }
      if (!cfg.from && u.alive && u.fxKey !== JSON.stringify(shownStages(u))) fxEv(u);   // (not in the AI's look-ahead copies: nobody sees them)
    }
  }   // (and Castform when its rock is lost)
  function statOf(u, s, ignoreStage) {
    const ws = fieldOn("wonderRoom") && (s === "def" || s === "sdf") ? (s === "def" ? "sdf" : "def") : s;   // (Wonder Room swaps Defense and Sp. Def)
    // the stages moves made (ignoreStage: a critical hit or Unaware leaves them out) and the fixed ones, ±6 together
    return u.max[ws] * stageMult(clamp((ignoreStage ? 0 : u.stages[s]) + fixedStage(u, s), -6, 6));
  }
  // turn-meter tempo: Speed relative to the battle's average level, so it matters at Lv 5 as much as at Lv 70
  // Arena Trap holds grounded Pokémon (not Flying-type, no Levitate) while its user is in battle: their turn meter fills 10% slower
  // Magnet Pull does the same to opposing Steel types (Flying or not), and stacks with Arena Trap
  // Arena Trap holds grounded opposing Pokémon, Magnet Pull opposing Steel types: they can't switch out and fill their turn meters
  // 10% slower; Run Away (the owner's rule) is never trapped
  const trapped = u => !pv(u, "RUN_AWAY") && enemies(u).some(f => { const p = pv(f, "ARENA_TRAP"); return p && (p.all ? !pv(u, "ARENA_TRAP") : grounded(u)); });   // (Shadow Tag: every foe but another Shadow Tag)
  const pulled = u => !pv(u, "RUN_AWAY") && u.types.includes("Steel") && enemies(u).some(f => pv(f, "MAGNET_PULL"));
  const trSpe = u => { const s = statOf(u, "spe"); if (!(B.trickRoom > B.turn)) return s; const al = B.units.filter(x => x.alive), m = al.reduce((a, x) => a + statOf(x, "spe"), 0) / (al.length || 1); return m * m / Math.max(5, s); };
  const effSpd = u => (70 + .45 * trSpe(u) * 50 / Math.max(5, B.avgL)) * (trapped(u) ? .9 : 1) * (pulled(u) ? .9 : 1) * (item(u, "laggingtail") || item(u, "fullincense") || pv(u, "STALL") ? .6 : 1) * (pledgeOn(u.team, "swamp") ? .25 : 1);
  const critStage = (u, sk) => (has(u, "FOCUS") ? 2 : 0) + (pv(u, "SUPER_LUCK") ? 2 : 0) + (sk && sk.M.cr ? 1 : 0) + (item(u, "scopelens") || item(u, "razorclaw") ? 1 : 0) + ((item(u, "luckypunch") && u.key === "chansey") || (item(u, "leek") && u.key === "farfetchd") ? 3 : 0);
  const critChance = n => [1 / 24, 1 / 8, 1 / 2, 1][clamp(n, 0, 3)];
  const sureCrit = (att, sk) => sk && (sk.M.sp === "alwayscrit" || has(att, "LASER"));
  const sniperCrit = att => pv(att, "SNIPER") && !wasHit(att);   // Sniper (the owner's rule): not hurt since its last turn, its damaging moves crit
  const mastery = (u, sk) => 1 + .06 * ((u.sk[sk.slot - 1] || 1) - 1);
  const cdOf = (u, sk) => Math.max(0, (sk.cd || 0) - ((u.sk[sk.slot - 1] || 1) >= MAX_SK && sk.slot > 1 ? 1 : 0));

  // ---------- conditions ----------
  function addEff(u, id, turns, src, quiet) {
    if (!u.alive) return;
    if (src && src.team !== u.team) { const v = allies(u).find(a => (pv(a, "TEAM_VEIL") || { list: [] }).list.includes(id)); if (v) { msg(`${Nm(u)} is protected by ${nm(v)}'s ${v.passives[0].name}!`); return; } }   // (Aroma Veil)
    const ex = effOf(u, id);
    if (ex) { ex.turns = Math.max(ex.turns, turns); ex.skip = u === B.actor; }
    else u.eff.push({ id, turns, skip: u === B.actor, src: src && src.uid });
    if (!quiet) ev({ k: "txt", u: u.uid, s: FX[id].n, c: FX[id].b ? "buff" : "debuff" });
    fxEv(u);
    if (id === "TAUNT" || id === "HEALBLOCK") statusItems(u);   // (a Mental Herb answers them at once)
  }
  function removeEff(u, id) { const n = u.eff.length; u.eff = u.eff.filter(e => e.id !== id); if (id === "SUB") u.shield = 0; if (n !== u.eff.length) fxEv(u); }
  const PS_ST = { BRN: "brn", PSN: "psn", TOX: "tox", PAR: "par", SLP: "slp", FRZ: "frz", CNF: "confusion", INFAT: "attract", SEED: "leechseed" };
  const statusLine = (what, tar, src) => (what === "TRAP" && src ? psT("bind", "start", { POKEMON: nm(tar), SOURCE: nm(src) }) : PS_ST[what] && psT(PS_ST[what], "start", { POKEMON: nm(tar) })) || `${Nm(tar)} ${STATUS_TXT[what]}`;
  const STATUS_TXT = { BRN: "was burned!", PSN: "was poisoned!", TOX: "was badly poisoned!", PAR: "is paralyzed! It may be unable to move!", SLP: "fell asleep!", FRZ: "was frozen solid!",
    CNF: "became confused!", INFAT: "fell in love!", SEED: "was seeded!", TRAP: "was squeezed and bound!", DISABLE: "had its S2 and S3 moves disabled!" };
  const TYPE_IMMUNE = { BRN: "Fire", PSN: "Poison", TOX: "Poison", PAR: "Electric", FRZ: "Ice", SEED: "Grass" };
  // tries to give a status condition or volatile condition; `loud` reports failures (for status moves)
  function tryStatus(src, tar, what, loud, opts = {}) {
    if (!tar.alive) return false;
    if (what === "SPORE") what = pick(["PSN", "PAR", "SLP"]);
    const fail = t => { if (loud) msg(t || "But it failed!"); return false; };
    const major = MAJOR.includes(what);
    if (what === "SLP" && uproarOn()) return fail(psT("uproar", "block", { POKEMON: nm(tar) }));
    if (major && tar.status) return fail(loud && tar.status === what ? `${Nm(tar)} is already ${{ BRN: "burned", PSN: "poisoned", TOX: "poisoned", PAR: "paralyzed", SLP: "asleep", FRZ: "frozen" }[what]}!` : null);
    if (!major && has(tar, what)) return fail();
    if (what === "TRAP" && tab(src, tar, "RUN_AWAY")) { msg(`${Nm(tar)}'s Run Away keeps it from being trapped!`); return false; }
    if (TYPE_IMMUNE[what] && tar.types.includes(TYPE_IMMUNE[what]) && !((what === "PSN" || what === "TOX") && src && pv(src, "CORROSION"))) return fail(`It doesn't affect ${nm(tar)}...`);
    if ((what === "PSN" || what === "TOX") && tar.types.includes("Steel") && !(src && pv(src, "CORROSION"))) return fail(`It doesn't affect ${nm(tar)}...`);
    const px0 = tar.passives[0]; if (px0 && px0.noStatus && px0.noStatus.includes(what) && tab(src, tar, px0.id)) return fail(`${Nm(tar)}'s ${px0.name} prevents it!`);
    if (major && tar.spr !== "miniorcore" && tab(src, tar, "SHIELDS_DOWN")) return fail(`${Nm(tar)}'s shell keeps it safe!`);
    const veil = allies(tar).find(a => { const v = pv(a, "TEAM_VEIL"); return v && v.list.includes(what); });
    if (veil && src !== tar) return fail(`${Nm(tar)} is protected by ${nm(veil)}'s ${veil.passives[0].name}!`);
    if (what === "FRZ" && inWeather("sun")) return false;
    if (src && src !== tar && src.team !== tar.team && has(tar, "SAFEGUARD") && !pv(src, "INFILTRATOR") && (major || what === "CNF")) return fail(`${Nm(tar)} is protected by Safeguard!`);
    const ns = tab(src, tar, "NO_STATUS"); if (ns && ns.list.includes(what)) return fail(`${Nm(tar)}'s ${tar.passives[0].name} prevents it!`);
    if (major && inWeather("sun") && tab(src, tar, "LEAF_GUARD")) return fail(`${Nm(tar)}'s Leaf Guard prevents it!`);
    if ((major || what === "CNF") && inTerrain("misty", tar)) return fail(`${Nm(tar)} surrounds itself with a protective mist!`);
    if (what === "SLP" && inTerrain("electric", tar)) return fail(`${Nm(tar)} is protected by the Electric Terrain!`);
    if (tar.shield > 0 && src !== tar && src.team !== tar.team && !opts.sound && !pv(src, "INFILTRATOR") && opts.direct) return fail();
    if (what === "SLP" || what === "FRZ") { /* no extra checks */ }
    if (major) {
      tar.status = what;
      tar.sTurn = what === "SLP" ? (opts.turns || ri(1, 3)) : what === "TOX" ? 1 : what === "FRZ" ? 3 : 0;
      if (what === "SLP" && pv(tar, "EARLY_BIRD")) tar.sTurn = Math.ceil(tar.sTurn / 2);
      ev({ k: "status", u: tar.uid, s: what }); msg(statusLine(what, tar, src));
      fxEv(tar);
      if (pv(tar, "SYNC") && src && src !== tar && src.alive && ["BRN", "PSN", "TOX", "PAR"].includes(what)) { msg(`${Nm(tar)}'s Synchronize!`); tryStatus(tar, src, what, false); }
      if ((what === "PSN" || what === "TOX") && src && src !== tar && pv(src, "PUPPETEER")) tryStatus(src, tar, "CNF", false);   // Poison Puppeteer
    } else {
      const turns = { CNF: ri(2, 4), INFAT: 3, SEED: 99, TRAP: src && item(src, "gripclaw") ? 7 : ri(2, 4), DISABLE: 2 }[what] || 2;
      tar.eff.push({ id: what, turns, skip: tar === B.actor, src: src && src.uid });
      msg(statusLine(what, tar, src)); fxEv(tar);
    }
    statusItems(tar);
    return true;
  }
  function pledgeOn(team, k) { return !!(B.pledgeFx && B.pledgeFx[team] && B.pledgeFx[team][k] > B.turn); }
  const uproarOn = () => !!(B.uproar && B.turn < B.uproar.until);
  // a status-blocking Ability it has just gained (Trace, Role Play, Skill Swap, Worry Seed, Transform) cures that condition at once
  function abilityCure(u) {
    const ns = pv(u, "NO_STATUS"); if (!ns || !u.alive) return;
    if (u.status && ns.list.includes(u.status)) { const s = u.status; u.status = null; u.sTurn = 0; msg(psT(PS_ST[s], "end", { POKEMON: nm(u) }) || `${Nm(u)} was cured!`); fxEv(u); }
    for (const id of ["CNF", "INFAT", "TAUNT"]) if (ns.list.includes(id) && has(u, id)) { removeEff(u, id); msg(psT({ CNF: "confusion", INFAT: "attract", TAUNT: "taunt" }[id], "end", { POKEMON: nm(u) })); }
  }
  // infatuation ends when the Pokémon it's for faints or leaves the field
  function loveEnds(u) {
    for (const x of B.units) { const l = x.alive && x !== u && effOf(x, "INFAT"); if (l && l.src === u.uid) { removeEff(x, "INFAT"); msg(psT("attract", "end", { POKEMON: nm(x) })); } }
  }
  function cureAll(u) { u.status = null; u.sTurn = 0; u.eff = u.eff.filter(e => !["CNF", "INFAT"].includes(e.id)); fxEv(u); }
  // stat stages; returns true if anything changed
  function stage(src, tar, s, n, why) {
    if (!tar.alive) return false;
    if (pv(tar, "CONTRARY")) n = -n;   // (Contrary: the other way round)
    if (pv(tar, "SIMPLE")) n *= 2;      // (Simple: doubled)
    if (n < 0 && src && src !== tar) {
      if (has(tar, "MIST") && !pv(src, "INFILTRATOR")) { msg(`${Nm(tar)} is protected by the mist!`); return false; }
      if (item(tar, "clearamulet")) { msg(psT("clearamulet", "block", { POKEMON: nm(tar) })); return false; }
      if (src.team !== tar.team && tar.types.includes("Grass")) { const fv = allies(tar).find(a => pv(a, "FLOWER_VEIL")); if (fv) { msg(`${Nm(tar)} is protected by ${nm(fv)}'s Flower Veil!`); return false; } }
      // Mirror Armor (the owner's rule): a drop from another Pokémon is that Pokémon's instead (a bounced drop doesn't bounce again)
      if (tab(src, tar, "MIRROR_ARMOR") && !B.mirrorBounce && src.alive) { msg(`${Nm(tar)}'s Mirror Armor bounced the stat drop back!`); B.mirrorBounce = true; try { stage(tar, src, s, n); } finally { B.mirrorBounce = false; } return false; }
      const nd = tab(src, tar, "NO_DROP"); if (nd && (nd.stats === "all" || nd.stats === s)) { msg(`${Nm(tar)}'s ${tar.passives[0].name} prevents its ${STAGE_N[s]} from being lowered!`); return false; }
    }
    // (with the fixed stages, ±6 at most together: a Choice Band's +1 leaves room for +5)
    const fxs = fixedStage(tar, s), old = tar.stages[s], v = clamp(old + n, Math.min(old, Math.max(-6, -6 - fxs)), Math.max(old, Math.min(6, 6 - fxs)));
    if (v === old) { msg(psT("default", n > 0 ? "boost0" : "unboost0", { POKEMON: nm(tar), STAT: STAGE_N[s] })); return false; }
    tar.stages[s] = v; if (v < old) tar.lowerT = B.turn; else tar.raiseT = B.turn;
    msg(why ? `${Nm(tar)}'s ${why} ${Math.abs(v - old) > 1 ? "sharply " : ""}${v > old ? "raised" : "lowered"} its ${STAGE_N[s]}!` : psT("default", (v > old ? "boost" : "unboost") + (Math.abs(v - old) > 1 ? Math.min(3, Math.abs(v - old)) : ""), { POKEMON: nm(tar), STAT: STAGE_N[s] }));
    ev({ k: "txt", u: tar.uid, s: `${STAGE_S[s]} ${v - old > 0 ? "▲" : "▼"}${Math.abs(v - old) > 1 ? Math.abs(v - old) : ""}`, c: v > old ? "buff" : "debuff" });
    fxEv(tar);
    if (n < 0 && src && src !== tar && src.team !== tar.team) { const df = pv(tar, "DEFIANT"); if (df) stage(tar, tar, df.stat, 2, tar.passives[0].name); }
    if (v < old && item(tar, "whiteherb")) { for (const k in tar.stages) if (tar.stages[k] < 0) tar.stages[k] = 0; useUp(tar, `${Nm(tar)} returned its stats to normal using its White Herb!`); }
    if (v < old && src && src !== tar && item(tar, "ejectpack") && benchOf(tar.team).length && B.units.includes(tar)) { useUp(tar, `${Nm(tar)} is switched out with the Eject Pack!`); B.pivotQ.push({ uid: tar.uid }); }
    if (v > old && !B.mirroring) for (const f of enemies(tar)) if (pv(f, "OPPORTUNIST")) { B.mirroring = true; stage(f, f, s, v - old, "Opportunist"); B.mirroring = false; }
    if (v > old && !B.mirroring) for (const f of enemies(tar)) if (pv(f, "RIVALRY")) { B.mirroring = true; stage(f, f, s, v - old, "Rivalry"); B.mirroring = false; }
    if (v > old && !B.mirroring) for (const f of enemies(tar)) if (item(f, "mirrorherb")) { B.mirroring = true; useUp(f, `${Nm(f)} used its Mirror Herb to mirror its opponent's stat changes!`); stage(f, f, s, v - old); B.mirroring = false; }
    return true;
  }
  function addATB(u, amount, quiet) {
    if (!u.alive) return;
    u.atb = clamp(u.atb + amount * 100, 0, 100);
    ev({ k: "tm", u: u.uid, tm: u.atb, v: amount * 100, quiet });
  }
  function heal(u, n, why) {
    if (!u.alive || n <= 0 || has(u, "HEALBLOCK")) return 0;
    const g = Math.min(Math.round(n), u.max.hp - u.hp); if (g <= 0) return 0;
    u.hp += g; ev({ k: "heal", u: u.uid, n: g, hp: u.hp, sh: u.shield });
    if (why) msg(why);
    return g;
  }
  // indirect damage (poison, weather, recoil...) — Magic Guard ignores it
  function chip(u, n, why) {
    if (!u.alive || pv(u, "MAGIC_GUARD")) return;
    if (why) msg(why);
    applyDamage(null, u, Math.max(1, Math.floor(n)), { trueDmg: true });
  }
  function revive(u, pct) {
    if (!u || u.alive) return;
    u.alive = true; u.hp = Math.max(1, Math.round(u.max.hp * pct)); u.eff = []; u.status = null; u.shield = 0; u.atb = 0; u.stages = newStages();
    ev({ k: "revive", u: u.uid, hp: u.hp });
  }

  // ---------- damage ----------
  function kill(u, killer) {
    if (!B.koOn || B.koIn) return kill0(u, killer);
    const at = B.ev.length; B.koIn = true;
    try { return kill0(u, killer); } finally { B.koIn = false; (B.koQ || (B.koQ = [])).push(...B.ev.splice(at)); }
  }
  function kill0(u, killer) {
    if (u.orig && u.alive) { untransform(u, true); return; }   // (Transform's copy takes the knockout: the owner's rule)
    const bond = has(u, "DBOND"), grudge = has(u, "GRUDGE");
    if (grudge && killer && killer.alive && killer !== u && killer.lastSkill && killer.lastSkill.key !== "struggle") {
      (killer.flags.lost || (killer.flags.lost = {}))[killer.lastSkill.key] = 1; msg(`${Nm(killer)}'s ${killer.lastSkill.name} lost all its power due to the grudge!`);
    }
    u.alive = false; u.hp = 0; u.eff = []; u.shield = 0; u.atb = 0; u.status = null; u.flags.semi = null; loveEnds(u);
    (B.faintT || (B.faintT = {}))[u.team] = B.turn;
    if (u.team === "E") B.tally.kills++;
    ev({ k: "death", u: u.uid }); msg(`${Nm(u)} fainted!`);
    gasLeaves(u);
    const mx = killer && killer.alive && killer !== u && pv(killer, "MOXIE");
    if (mx) stage(killer, killer, mx.stat === "best" ? bestStat(killer) : mx.stat || "atk", 1, killer.passives[0].name);   // (Moxie, Beast Boost, the Neighs, As One)
    for (const x of B.units) if (x.alive && x !== u && pv(x, "SOUL_HEART")) stage(x, x, "spa", 1, "Soul-Heart");
    // Power of Alchemy, Receiver (the owner's rule): a partner on the field with it takes the fainted ally's Ability
    const ua = u.passives[0];
    if (ua && !["RECEIVER", "TRACE", "IMPOSTER", "ILLUSION", "WONDER_GUARD", "NONE", "FORECAST", "HUNGER", "COMMANDER", ...NO_OVERWRITE].includes(ua.id))
      for (const x of B.units) if (x.alive && x !== u && x.team === u.team && pv(x, "RECEIVER")) { x.passives = [abilityOf(ua.key)]; msg(`${Nm(x)} took over ${nm(u)}'s ${ua.name}!`); }
    // Battle Bond (the owner's rule: Generations 7 and 8's form change and Generation 9's boost): its first knockout of an opposing
    // Pokémon makes it Ash-Greninja for the rest of the battle (its Water Shuriken a Triple Axel), and every knockout raises its
    // Attack, Sp. Atk and Speed by 1
    if (killer && killer.alive && killer !== u && killer.team !== u.team && pv(killer, "BATTLE_BOND")) {
      if (!killer.flags.bonded && OPS.greninjaash) {
        killer.flags.bonded = true; msg(`${Nm(killer)} became fully charged due to its bond with its Trainer!`);
        becomeForm(killer, "greninjaash", `${Nm(killer)} became Ash-Greninja!`); ashShuriken(killer);
      }
      for (const s of ["atk", "spa", "spe"]) stage(killer, killer, s, 1, "Battle Bond");
    }
    if (bond && killer && killer.alive && killer !== u && killer.team !== u.team) { msg(`${Nm(u)} took its attacker down with it!`); killer.hp = 0; ev({ k: "dmg", u: killer.uid, n: 0, hp: 0, sh: 0, dot: 1 }); kill(killer, null); }
  }
  function applyDamage(att, tar, dmg, meta) {
    if (!tar.alive) return 0;
    let dealt = dmg;
    if (!meta.trueDmg && tar.shield > 0 && !meta.bypassSub) {
      const soak = Math.min(tar.shield, dealt); tar.shield -= soak; dealt -= soak;
      ev({ k: "dmg", u: tar.uid, n: soak, hp: tar.hp, sh: tar.shield, sub: 1 });
      if (tar.shield <= 0) { tar.shield = 0; removeEff(tar, "SUB"); msg(`${Nm(tar)}'s substitute faded!`); } else msg(`The substitute took damage for ${nm(tar)}!`);
      return 0;
    }
    // Telepathy (the owner's rule): a partner hurt by an opposing attack takes half; the Telepathy Pokémon on the field takes the other half
    if (att && att.team !== tar.team && (meta.cat === "P" || meta.cat === "S") && !meta.trueDmg && !meta.shared && dealt > 1) {
      const tp = B.units.find(x => x !== tar && x.alive && x.team === tar.team && pv(x, "TELEPATHY"));
      if (tp) { const half = Math.floor(dealt / 2); dealt -= half; msg(`${Nm(tp)} took half the hit for ${nm(tar)} with Telepathy!`); applyDamage(att, tp, half, { cat: meta.cat, shared: true }); }
    }
    // Endure, Sturdy and Focus Band hold on with 1 HP
    if (!meta.trueDmg && dealt >= tar.hp) {
      if (has(tar, "ENDURE")) { dealt = tar.hp - 1; meta.endure = `${Nm(tar)} endured the hit!`; }
      else if (tab(att, tar, "STURDY") && tar.hp === tar.max.hp && !tar.flags.sturdyUsed) { dealt = tar.hp - 1; tar.flags.sturdyUsed = true; meta.endure = `${Nm(tar)} endured the hit thanks to Sturdy!`; }
      else if (item(tar, "focusband") && R() < .1) { dealt = tar.hp - 1; meta.endure = `${Nm(tar)} hung on using its Focus Band!`; }
      else if (item(tar, "focussash") && tar.hp === tar.max.hp) { dealt = tar.hp - 1; useUp(tar); meta.endure = `${Nm(tar)} hung on using its Focus Sash!`; }
    }
    tar.hp -= dealt;
    ev({ k: "dmg", u: tar.uid, n: dealt, crit: !!meta.crit, hp: Math.max(0, tar.hp), sh: tar.shield, dot: !!meta.trueDmg, eff: meta.eff });
    if (tar.hp > 0 && dealt > 0 && att && att.team !== tar.team && (meta.cat === "P" || meta.cat === "S")) { hitForms(tar); hitAbilities(tar, att); }
    if (meta.endure) msg(meta.endure);
    if (att) {
      B.dmgDone[att.uid] = (B.dmgDone[att.uid] || 0) + dealt;
      if (att !== tar && dealt > 0) {
        tar.hitT = B.turn; tar.hitsTaken = (tar.hitsTaken || 0) + 1;
        const c = meta.cat; if (c === "P" || c === "S") (tar.lastHit || (tar.lastHit = {}))[c] = { dmg: dealt, by: att.uid, t: B.turn };
        if (tar.flags.bide && att.team !== tar.team) {   // (Bide: each opposing attack counts once, however many strikes; bideStrikes)
          const b = tar.flags.bide; b.dmg += dealt; b.by = att.uid; if (b.act !== B.actN) { b.act = B.actN; b.hits++; }
          if (b.hits >= 2 && !(B.bideQ || (B.bideQ = [])).includes(tar.uid)) B.bideQ.push(tar.uid);
        }   // (Bide)
      }
    }
    if (tar.hp <= 0) kill(tar, att);
    else hpItems(tar);
    return dealt;
  }
  // Synchronoise (the owner's rule) hits a Pokémon that shares a type, its status condition (poison and bad poison count as one),
  // its Ability (one that's been suppressed doesn't count) or its nature with the user
  const POISONED = s => s === "TOX" ? "PSN" : s;
  const abKey = u => !u.flags.noAbility && !gasOn(u) && u.passives[0] && u.passives[0].key;
  const syncs = (att, tar) => tar.types.some(x => att.types.includes(x)) || (!!att.status && POISONED(att.status) === POISONED(tar.status))
    || (!!abKey(att) && abKey(att) === abKey(tar)) || (!!att.nat && att.nat === tar.nat);
  // multiplier from type matchups, with Scrappy and Levitate
  function effOn(att, tar, sk) {
    const t = mtype(att, sk);
    if (sk.M.sp === "thousandarrows" && !grounded(tar)) return 1;   // (Flying types, Levitate, Air Balloon...: x1, then knocked down)
    if (t === "Ground" && !item(tar, "ironball") && !has(tar, "SMACKDOWN") && !fieldOn("gravity") && (tab(att, tar, "IMMUNE_TYPE") || has(tar, "MAGNETRISE") || has(tar, "TELEKINESIS") || item(tar, "airballoon"))) return item(att, "ringtarget") ? 1 : 0;
    if (sk.M.sp === "synchronoise" && !syncs(att, tar)) return 0;
    if (t === "Fire" && sk.M.c !== "X" && tab(att, tar, "HEATPROOF")) return item(att, "ringtarget") ? 1 : 0;   // Heatproof (the owner's rule): no Fire damage at all (a Ring Target's holder hits it for ×1)
    if (item(att, "ringtarget") && absorbs(tar, sk, att)) return 1;   // an Ability's immunity too (Lightning Rod, Volt Absorb...): ×1
    const ttypes = tar.types;
    let e = typeEff(t, ttypes);
    if (sk.M.sp === "flyingpress") e *= typeEff("Flying", ttypes);   // (Flying Press: Fighting and Flying in one)
    // (Color Change: before the damage it becomes a type that resists the move, convert, so a hit sized up beforehand lands resisted)
    if (e > .5 && sk.M.c !== "X" && t !== "???" && pv(tar, "COLOR_CHANGE") && att.team !== tar.team && TYPES.some(d => typeEff(t, [d]) > 0 && typeEff(t, [d]) < 1)) e = .5;
    if (sk.M.sp === "freezedry" && ttypes.includes("Water")) e = e / CHART.Ice.Water * 2;
    // an Iron Ball grounds a Flying type; Scrappy hits Ghosts; a Ring Target's holder hits anything immune for ×1
    if (e === 0 && t === "Ground" && (item(tar, "ironball") || has(tar, "SMACKDOWN") || fieldOn("gravity"))) e = typeEff(t, tar.types.filter(x => CHART[t][x] !== 0));
    if (e === 0 && has(tar, "FORESIGHT") && (t === "Normal" || t === "Fighting") && tar.types.includes("Ghost")) e = typeEff(t, tar.types.filter(x => x !== "Ghost"));
    if (e === 0 && has(tar, "MIRACLEEYE") && t === "Psychic" && tar.types.includes("Dark")) e = typeEff(t, tar.types.filter(x => x !== "Dark"));
    if (e === 0 && pv(att, "SCRAPPY") && (t === "Normal" || t === "Fighting") && tar.types.includes("Ghost")) e = typeEff(t, tar.types.filter(x => x !== "Ghost"));
    if (e === 0 && item(att, "ringtarget")) e = 1;
    if (e <= 1 && sk.M.c !== "X" && att !== tar && tab(att, tar, "WONDER_GUARD")) return 0;   // (Wonder Guard: only super-effective hits land)
    return e;
  }
  // power that depends on the battle: weight, Speed, HP, stat changes, status, what happened since the user's last turn
  const sumUp = st => Object.values(st).reduce((a, v) => a + Math.max(0, v), 0);
  const wt = u => (OPS[u.key] || OPS[u.spr]).w * (item(u, "floatstone") ? .5 : 1) * ((pv(u, "WEIGHT") || {}).mul || 1);
  function movePower(att, tar, sk) {
    const M = sk.M, sp = M.sp, hp = att.hp / att.max.hp, thp = tar.hp / tar.max.hp;
    if (MAG_ROLL.has(sk.key)) return sk.rolled || (item(att, "loadeddice") ? 150 : 71);   // (rolled when used; its average when the AI sizes it up)
    if (sp === "flail") return hp >= .6875 ? 20 : hp >= .354 ? 40 : hp >= .208 ? 80 : hp >= .104 ? 100 : hp >= .042 ? 150 : 200;
    if (sp === "present") return B.presentPow || (item(att, "loadeddice") ? 120 : 65);   // (its roll; 65 when the AI sizes it up, 120 with Loaded Dice)
    if (sp === "lastrespects") return 50 + 50 * Math.min(5, fainted(att.team));   // Last Respects: +50 for each fainted teammate
    if (sp === "naturalgift") return (NG[att.held] || [0, 0])[1];
    if (sp === "fling") return flingPow(att.held);
    if (sp === "spitup") return 100 * (att.flags.stock || 0);
    if (sp === "trumpcard") return [40, 50, 60, 80, 200][Math.min(4, att.flags.trump || 0)];
    if (sp === "fickle") return B.fickleX ? 160 : 80;                 // Fickle Beam: double power half the time (the owner's rule)
    if (sp === "ragefist") return Math.min(350, (M.p || 50) + 50 * (att.hitsTaken || 0));   // Rage Fist, Rage, Punishment and Stored Power: 50, +50 a hit taken
    let p = sk.pow;
    if (sp === "lastresort" && lrBoost(att)) p *= 2;
    const since = x => x != null && x > (att.actT == null ? -1 : att.actT);
    if (sp === "hex" && tar.status) p *= 2;
    if (sp === "boltbeak" && (shownStages(att).spe || 0) >= 1) p *= 2;   // (the owner's rule: Speed +1 or more)
    if (sp === "flyingpress" && (shownStages(tar).eva || 0) >= 1) p *= 2;   // (the owner's rule: the target's evasiveness raised, Minimize too)
    if (sp === "venoshock" && (tar.status === "PSN" || tar.status === "TOX")) p *= 2;
    if (sp === "brine" && thp <= .5) p *= 2;
    if (sp === "acrobatics" && (!att.held || att.flags.itemUsed)) p *= 2;
    if (sp === "wakeupslap" && tar.status === "SLP") p *= 2;
    if (sp === "smellingsalts" && tar.status === "PAR") p *= 2;
    if (sp === "assurance" && since(tar.hitT)) p *= 2;
    if (sp === "payback" && since(tar.actT)) p *= 2;
    if (sp === "tantrum" && att.flags.failed) p *= 2;
    if (sp === "retaliate" && since(B.faintT && B.faintT[att.team])) p *= 2;
    if (sp === "lashout" && since(att.lowerT)) p *= 2;
    if (sp === "weatherball" && B.weather && inWeather(B.weather)) p *= 2;
    if (sp === "knockoff" && tar.held && !tar.flags.itemUsed && !tab(att, tar, "STICKY")) p *= 1.5;
    if (sp === "expandingforce" && inTerrain("psychic", att)) p *= 1.5;
    if (sp === "mistyexplosion" && inTerrain("misty", att)) p *= 1.5;
    if (sk.key === "risingvoltage" && tar && inTerrain("electric", tar)) p *= 2;   // (Rising Voltage: double against a target on the ground in Electric Terrain)
    if (sk.key === "terrainpulse" && B.terrain && inTerrain(B.terrain.t, att)) p *= 2;   // (Terrain Pulse: the terrain's type, 100 power, the user on the ground)
    // (the owner's rules) Solar Beam and Solar Blade: x1.5 in harsh sunlight, x0.5 in rain, sandstorm, hail and snow
    if (sp === "solar") { if (inWeather("sun")) p *= 1.5; else if (["rain", "sand", "hail", "snow"].some(w => inWeather(w))) p *= .5; }
    // Rollout, Fury Cutter, Echoed Voice, Round: double power for every earlier use in this battle (other moves in between don't reset it)
    if (sp === "ramp") p *= 2 ** rampN(att, sk.key);
    if (sp === "pursuit" && tar.flags.leaving) p *= 2;
    if (sk.key === "rollout" && has(att, "DEFCURL")) p *= 2;   // Defense Curl: Rollout twice as strong
    return p;
  }
  // the doubling moves: how many times the user has used this one (up to RAMP_MAX doublings: 16x, Rollout's most in the games)
  const RAMP_MAX = 4;
  const rampN = (u, key) => Math.min(RAMP_MAX, u.flags["ramp:" + key] || 0);
  // out of reach (Fly, Bounce, Dig, Dive, Phantom Force) until the user's next turn: only the games' own exceptions reach it (some
  // twice as hard), and No Guard or Lock-On
  const SEMI_REACH = { skydrop: ["gust", "twister", "thunder", "hurricane", "skyuppercut", "smackdown"], fly: ["gust", "twister", "thunder", "hurricane", "skyuppercut", "smackdown"], dig: ["earthquake", "magnitude", "fissure"], dive: ["surf", "whirlpool"] };
  SEMI_REACH.bounce = SEMI_REACH.fly;
  const RAMPAGE = new Set(["outrage", "thrash", "petaldance", "ragingfury"]);
  const MAG_ROLL = new Set(["magnitude", "eruption", "waterspout", "dragonenergy", "crushgrip", "wringout", "hardpress", "heatcrash", "heavyslam", "lowkick", "grassknot", "electroball", "gyroball"]);
  const SEMI_DOUBLE = { fly: ["gust", "twister"], bounce: ["gust", "twister"], dig: ["earthquake", "magnitude"], dive: ["surf", "whirlpool"] };
  // Minimize: these moves hit a minimized Pokémon twice as hard and never miss it; these thaw a frozen target like Fire moves
  const MINI_HIT = new Set(["stomp", "steamroller", "bodyslam", "dragonrush", "heatcrash", "heavyslam", "maliciousmoonsault", "supercellslam", "doubleironbash"]);
  const THAW = new Set(["scald", "scorchingsands", "steameruption", "matchagotcha"]);
  // moves whose added effect is their own (secondary): Sheer Force powers them up and cancels it, like status chances
  const SLICE = new Set(["aerialace", "aircutter", "airslash", "aquacutter", "behemothblade", "bitterblade", "ceaselessedge", "crosspoison", "cut", "furycutter",
    "kowtowcleave", "leafblade", "mightycleave", "nightslash", "populationbomb", "psyblade", "psychocut", "razorleaf", "razorshell", "sacredsword", "secretsword", "slash",
    "solarblade", "stoneaxe", "tachyoncutter", "xscissor"]);
  const SECONDARY_SP = new Set(["triattack", "secretpower", "throatchop", "psychicnoise"]);
  // Pledges: two different ones from one side, the second within a round of the first (since its user's last turn), make the
  // second a 150-power combined move with a field effect for 4 rounds: a sea of fire or a swamp on the other side, a rainbow on yours
  const PLEDGE = { firepledge: "fire", grasspledge: "grass", waterpledge: "water" };
  const PLEDGE_COMBO = { "fire+grass": ["Fire", "fire"], "grass+water": ["Grass", "swamp"], "fire+water": ["Water", "rainbow"] };
  const PLEDGE_TXT = { fire: "firepledge", swamp: "grasspledge", rainbow: "waterpledge" };
  const outOfReach = (att, tar, sk) => outOfReach0(att, tar, sk) || (has(tar, "SKYDROP") && (effOf(tar, "SKYDROP") || {}).src !== att.uid && !SEMI_REACH.fly.includes(sk.key) && !pv(att, "NO_GUARD"));
  const outOfReach0 = (att, tar, sk) => !!(tar.flags.semi && tar !== att && !(SEMI_REACH[tar.flags.semi.key] || []).includes(sk.key) && !pv(att, "NO_GUARD") && !pv(tar, "NO_GUARD") && !has(att, "LOCKON"));
  const MAGNITUDE = [[4, 10, 5], [5, 30, 10], [6, 50, 20], [7, 70, 30], [8, 90, 20], [9, 110, 10], [10, 150, 5]];   // [magnitude, power, chance %]
  // (the owner's rule: these roll their power like Magnitude, 10 to 150, about 71 on average; Loaded Dice: always 150)
  const FIXED = { dragonrage: () => 40, sonicboom: () => 20, nightshade: u => u.lvl, seismictoss: u => u.lvl, psywave: u => Math.max(1, Math.floor(u.lvl * (item(u, "loadeddice") ? 1.5 : .5 + R()))) };   // (Loaded Dice: Psywave at its most, a house rule)
  function damageOf(att, tar, sk, opts = {}) {
    const M = sk.M, e = effOn(att, tar, sk);
    if (e === 0) return { dmg: 0, e: 0 };
    // fixed damage ignores stats, type effectiveness (immunities aside) and boosts, but Mastery still adds its 6% per rank
    if (M.sp === "superfang") return { dmg: Math.max(1, Math.floor(Math.min(tar.hp, hpBase(tar)) / 2 * (tar.boss ? .5 : 1) * mastery(att, sk))), e: 1 };
    if (FIXED[M.sp]) return { dmg: Math.max(1, Math.round(FIXED[M.sp](att) * DMG_SCALE * 1.5 * mastery(att, sk))), e: 1 };
    if (M.sp === "endeavor") return { dmg: Math.max(0, Math.min(tar.hp, hpBase(tar)) - att.hp), e: 1 };
    if (M.sp === "finalgambit") return { dmg: att.hp, e: 1 };
    if (M.sp === "counter" || M.sp === "mirrorcoat") { const h = att.lastHit && att.lastHit[M.sp === "counter" ? "P" : "S"]; return { dmg: h ? Math.max(1, Math.round(h.dmg * 2)) : 0, e: 1 }; }
    if (M.sp === "metalburst") { const h = att.lastHit && (B.counterCat ? att.lastHit[B.counterCat] : [att.lastHit.P, att.lastHit.S].filter(Boolean).sort((a, b) => b.dmg - a.dmg)[0]); return { dmg: h ? Math.max(1, Math.round(h.dmg * 1.5)) : 0, e: 1 }; }
    const crit = opts.crit, phys = M.sp === "terablast" || M.sp === "hiddenpower" || M.sp === "present" || sk.key === "photongeyser" ? statOf(att, "atk") > statOf(att, "spa") : M.c === "P", t = mtype(att, sk);
    let pow = movePower(att, tar, sk) * mastery(att, sk);
    if (has(att, "CHARGE") && t === "Electric") pow *= 2;                                                // Charge
    if (has(tar, "MINIMIZE") && MINI_HIT.has(sk.key)) pow *= 2;                                         // Minimize
    if (tar.flags.semi && (SEMI_DOUBLE[tar.flags.semi.key] || []).includes(sk.key)) pow *= 2;            // Earthquake on a digger...
    if (axelLike(sk)) pow *= (B.hitIdx || 0) + 1;   // Triple Axel and Ash-Greninja's Water Shuriken: 20, 40, 60; Triple Kick: 10, 20, 30
    if (M.sp === "fusion") { const other = sk.key === "fusionflare" ? "fusionbolt" : "fusionflare"; if (B.fusion && B.fusion[other] != null && B.fusion[other] > (att.actT == null ? -1 : att.actT)) pow *= 2; }
    if (pv(att, "TECHNICIAN") && sk.pow <= 60) pow *= 1.5;
    if (pv(att, "IRON_FIST") && M.pu) pow *= 1.5;   // (the owner's rule: 50%)
    if (pv(att, "SHARPNESS") && SLICE.has(sk.key)) pow *= 1.5;
    const fp = pv(att, "FLAGPOW"); if (fp && (fp.flag === "pulse" ? PULSE.has(sk.key) : M[fp.flag] && !(fp.flag === "ct" && pv(att, "LONG_REACH")))) pow *= fp.mul;   // Strong Jaw, Mega Launcher, Tough Claws, Punk Rock
    const ate = pv(att, "ATE"); if (ate && ate.mul && (ate.sound ? M.so : M.t === "Normal")) pow *= ate.mul;
    if (M.c !== "X" && pv(att, "NORMALIZE")) pow *= 1.5;   // Normalize (the owner's rule: every move type-changing Ability ×1.5)                           // Pixilate, Refrigerate, Galvanize
    const tpw = pv(att, "TYPEPOW"); if (tpw && tpw.type === t) pow *= tpw.mul;                                                           // Steelworker, Dragon's Maw, Transistor...
    if (pv(att, "WATER_BUBBLE") && t === "Water") pow *= 2;
    for (const a of allies(att)) if (a !== att) { const ap = pv(a, "ALLYPOW"), st2 = pv(a, "TYPEPOW"); if (ap && (!ap.special || M.c === "S")) pow *= ap.mul; if (st2 && st2.allies && st2.type === t) pow *= st2.mul; }   // Power Spot, Battery, Steely Spirit
    if (B.units.some(x => x.alive && (pv(x, "AURA") || {}).type === t) && !B.units.some(x => x.alive && pv(x, "AURA_BREAK"))) pow *= 1.5;   // Fairy Aura, Dark Aura (the owner's rule: ×1.5; Aura Break cancels them)
    if (pv(att, "STAKEOUT") && tar.fresh) pow *= 2;
    if (pv(att, "RECKLESS") && M.dr < 0) pow *= 1.5;   // (50%)
    if (pv(att, "SHEER_FORCE") && (M.ail || M.fl || (M.st && M.sw !== "self") || SECONDARY_SP.has(M.sp))) pow *= 1.5;   // (50%)
    const pin = pv(att, "PINCH"); if (pin && pin.type === t && att.hp < att.max.hp / 3) pow *= 1.5;
    if (has(att, "FLASHFIRE") && t === "Fire") pow *= 1.5;
    if (pv(att, "SAND_FORCE") && inWeather("sand") && ["Rock", "Ground", "Steel"].includes(t)) pow *= 1.5;   // (50%)
    // Analytic (the owner's rules; 2026-10-16): with its Speed down a stage or more (as the badge shows it, paralysis and an Iron Ball
    // too), its moves are 50% stronger, and 50% more for each stage further down: ×1.5 at -1, ×2 at -2 ... ×4 at -6
    if (pv(att, "ANALYTIC")) { const ss = clamp((att.stages.spe || 0) + fixedStage(att, "spe"), -6, 6); if (ss <= -1) pow *= 1 + .5 * -ss; }
    if (has(att, "HELPED")) pow *= 1.5;
    // terrains: Electric, Grass and Psychic moves from the ground +30%; Earthquake on the ground halved in Grassy Terrain, Dragon moves into Misty
    if (inTerrain("electric", att) && t === "Electric" || inTerrain("grassy", att) && t === "Grass" || inTerrain("psychic", att) && t === "Psychic") pow *= 1.5;   // (a terrain's own type: ×1.5, Generation 7's, the owner's rule)
    if (M.sp === "psyblade" && inTerrain("electric")) pow *= 1.5;
    if (M.sp === "collision" && e > 1) pow *= 1.5555;                   // Collision Course, Electro Drift (the owner's rule: ×1.5555, not ×1.3333)
    if (B.meFirst) pow *= 1.5;                                             // Me First
    if (t === "Electric" && fieldOn("mudSport") || t === "Fire" && fieldOn("waterSport")) pow /= 3;   // Mud Sport, Water Sport
    if (inTerrain("grassy", tar) && ["earthquake", "bulldoze", "magnitude"].includes(sk.key)) pow *= .5;
    if (inTerrain("misty", tar) && t === "Dragon") pow *= .5;
    if (M.sp === "facade" && ["BRN", "PSN", "TOX", "PAR"].includes(att.status)) pow *= 2;
    if (M.sp === "revenge" && wasHit(att)) pow *= 2;
    const H = heldX(att); if (H && H.boost === t) pow *= 1.5;   // type-boosting items (the owner's rule: ×1.5)
    if (H && H.types && H.only.includes(att.key) && (H.types === "all" || H.types.includes(t))) pow *= H.types === "all" ? 1.2 : 1.5;   // the orbs and the Soul Dew (×1.5), Ogerpon's masks (×1.2)
    if (H && H.gem === t && !opts.noGem) pow *= 1.3;
    if (item(att, "metronome") && att.metroN) pow *= 1 + .2 * Math.min(5, att.metroN);
    if (item(att, "punchingglove") && M.pu) pow *= 1.1;
    // which stats meet: Foul Play uses the target's Attack, Body Press the user's Defense, Psyshock hits Defense;
    // Unaware (either side) and Chip Away ignore stat changes
    const aStat = M.sp === "bodypress" ? "def" : phys ? "atk" : "spa", dStat = phys || M.sp === "psyshock" ? "def" : "sdf", aSrc = M.sp === "foulplay" ? tar : att;
    const ignA = !!tab(att, tar, "UNAWARE"), ignD = !!pv(att, "UNAWARE") || M.sp === "chipaway";
    let A = statOf(aSrc, aStat, ignA), D = statOf(tar, dStat, ignD);
    if (crit) { A = Math.max(A, statOf(aSrc, aStat, true)); D = Math.min(D, statOf(tar, dStat, true)); }
    let d = ((2 * att.lvl / 5 + 2) * pow * A / Math.max(1, D)) / 50 + 2;
    if (sk.target === "aoe_enemies") d *= SPREAD;
    const umb = item(att, "utilityumbrella") || item(tar, "utilityumbrella");
    if (inWeather("rain") && !umb) d *= t === "Water" ? 1.5 : t === "Fire" ? .5 : 1;
    if (inWeather("sun") && !umb) d *= t === "Fire" ? 1.5 : t === "Water" ? (M.sp === "hydrosteam" ? 1.5 : .5) : 1;
    if (crit) d *= pv(att, "SNIPER") ? 2.25 : 1.5;
    d *= opts.roll == null ? .85 + R() * .15 : opts.roll;
    if (att.types.includes(t)) d *= pv(att, "ADAPT") ? 2 : 1.5;
    d *= e;
    if (!crit && !pv(att, "INFILTRATOR") && (has(tar, phys ? "REFLECT" : "LSCREEN") || has(tar, "VEIL"))) d *= 2 / 3;
    const rs = tab(att, tar, "RESIST"); if (rs && rs.types.includes(t)) d *= .5;
    const dsk = tab(att, tar, "ABSORB"); if (dsk && dsk.dry && t === "Fire") d *= 1.25;   // Dry Skin: Fire hurts it 25% more
    if (tab(att, tar, "MULTISCALE") && tar.hp === tar.max.hp) d *= .5;
    { const fl = tab(att, tar, "FILTER"); if (fl && e > 1) d *= 1 - (fl.cut || .25); }   // Filter, Solid Rock, Prism Armor (the owner's rule: 50%)
    const RB = heldX(tar); if (RB && RB.resist === t && (e > 1 || t === "Normal") && berryOk(tar)) d *= .5;
    if (pv(att, "TINTED") && e < 1) d *= 2;
    if (item(att, "expertbelt") && e > 1) d *= 1.2;
    if (allies(tar).some(a => a !== tar && pv(a, "FRIEND_GUARD"))) d *= .5;   // Friend Guard (the owner's rule: 50%)
    if (!phys && tab(att, tar, "ICE_SCALES")) d *= .5;
    if (tab(att, tar, "FLUFFY")) { if (M.ct && !pv(att, "LONG_REACH")) d *= .5; if (t === "Fire") d *= 2; }
    if (M.so && (tab(att, tar, "FLAGPOW") || {}).guard) d *= .5;   // Punk Rock
    if (t === "Fire" && tab(att, tar, "WATER_BUBBLE")) d *= .5;
    if (tab(att, tar, "TERA_SHELL") && tar.hp >= tar.max.hp && e > .5) d *= .5 / e;   // Tera Shell: not very effective at full HP
    return { dmg: Math.max(1, Math.round(d * DMG_SCALE)), e };
  }
  function accOf(att, tar, sk) {
    const M = sk.M;
    if (outOfReach(att, tar, sk)) return 0;
    if (has(tar, "MINIMIZE") && MINI_HIT.has(sk.key)) return 1;
    if (M.sp === "flyingpress" && (shownStages(tar).eva || 0) >= 1) return 1;
    if (has(tar, "TELEKINESIS") && !OHKO.has(M.sp)) return 1;
    if (!M.a || sk.target === "self" || sk.target === "team") return 1;
    if (pv(att, "NO_GUARD") || pv(tar, "NO_GUARD") || has(att, "LOCKON")) return 1;
    if (OHKO.has(M.sp)) return .3;
    const storm = M.n === "Thunder" || M.n === "Hurricane";   // never miss in rain, 50% accuracy in harsh sunlight
    if ((storm && inWeather("rain")) || (M.n === "Blizzard" && (inWeather("hail") || inWeather("snow")))) return 1;
    const kn = pv(att, "NO_DROP");
    // accuracy and evasion stages, the fixed ones included (Wide Lens, Compound Eyes, Gravity, Bright Powder, Sand Veil...); Keen Eye,
    // Unaware, Foresight and Miracle Eye leave out only the evasion stages moves made
    const eva = clamp((kn && kn.eva || pv(att, "UNAWARE") || has(tar, "FORESIGHT") || has(tar, "MIRACLEEYE") ? 0 : tar.stages.eva) + fixedStage(tar, "eva"), -6, 6);
    const acc = clamp(att.stages.acc + fixedStage(att, "acc"), -6, 6);
    // (Loaded Dice: a multi-strike move's accuracy is 100%, the owner's rule; the accuracy and evasion stages still count)
    // (and Keen Eye and Illuminate: every move of theirs 100% accurate, the owner's rule)
    let a = ((sk.hits || M.sp === "present") && item(att, "loadeddice") || (kn && kn.sure) ? 100 : storm && inWeather("sun") ? 50 : M.a) / 100 * stageMult(clamp(acc - eva, -6, 6), true);
    if (sk.mk === "acc") a *= mastery(att, sk); // status moves that can miss: Mastery adds accuracy
    if (M.c === "X" && tar.team !== att.team && tab(att, tar, "WONDER_SKIN")) a = Math.min(a, .5);
    return clamp(a, 0, 1);
  }
  // what the AI and the target hints expect a move to do to a target (average damage, accuracy included)
  // the Pokémon an attack aimed at tar really hits: Follow Me draws single-target attacks, Lightning Rod every Electric-type
  // attack aimed at its side (single-target or spread; Mold Breaker ignores it)
  function redirect(att, sk, tar) {
    if (!tar || tar.team === att.team || sk.M.c === "X" || !["enemy", "aoe_enemies"].includes(sk.target)) return tar;
    const asw = sk.target === "enemy" && effOf(tar, "ALLYSWITCH"), mate = asw && B.byId(asw.mate); if (mate && mate.alive && B.units.includes(mate)) return mate;   // (Ally Switch)
    if (pv(att, "NO_REDIRECT")) return tar;
    // (Rage Powder is a powder: Grass types, Overcoat and Safety Goggles pay it no mind)
    // (two up on one side: the newest draws the attacks, as in the main games; when it leaves, the other one does again)
    if (sk.target === "enemy") { const fm = enemies(att).filter(f => has(f, "FOLLOWME") && !(effOf(f, "FOLLOWME").powder && (att.types.includes("Grass") || pv(att, "OVERCOAT") || item(att, "safetygoggles")))).sort((a, b) => (effOf(b, "FOLLOWME").at || 0) - (effOf(a, "FOLLOWME").at || 0))[0]; if (fm) return fm; }
    { const t = mtype(att, sk), rod = enemies(att).find(f => drawsIn(att, f, t)); if (rod) return rod; }   // (Lightning Rod, Storm Drain, Earth Eater)
    return tar;
  }
  function expectedDamage(att, tar, sk) {
    if (!sk || !tar || !tar.alive) return 0;
    const rd = redirect(att, sk, tar);
    if (rd !== tar) return !legacy(att) && absorbs(rd, sk, att) && !item(att, "ringtarget") ? -1 : 0;   // it would go to a Follow Me or Lightning Rod user instead (who soaks it up)
    if (has(tar, "PROTECT") && tar.team !== att.team) return 0;
    if (sk.M.pri > 0 && tar.team !== att.team && (inTerrain("psychic", tar) || allies(tar).some(a => tab(att, a, "NO_PRIORITY")))) return 0;   // (a priority move that would fail)
    // one-hit KO moves: the target's HP at their 30% accuracy, unless it's a boss or a higher level (then they always fail)
    if (OHKO.has(sk.M.sp)) return effOn(att, tar, sk) === 0 || tar.boss || tar.lvl > att.lvl || tab(att, tar, "STURDY") ? 0 : Math.round(tar.hp * accOf(att, tar, sk));
    if (!(sk.pow > 0 || FIXED[sk.M.sp] || ["superfang", "endeavor", "finalgambit", "counter", "mirrorcoat"].includes(sk.M.sp))) return 0;
    const soaks = absorbs(tar, sk, att);
    if (soaks && !item(att, "ringtarget")) return -1;
    if (!legacy(att) && sk.M.so && pv(tar, "SOUNDPROOF")) return 0;
    if (BALLISTIC.has(sk.key) && tab(att, tar, "BULLETPROOF")) return 0;
    const pc = sureCrit(att, sk) || sniperCrit(att) ? 1 : has(tar, "LUCKY") || tab(att, tar, "NO_CRIT") ? 0 : critChance(critStage(att, sk));
    // (a 2-5-strike move strikes 3 times on average: 2, 2, 2, 3, 3, 3, 4, 5, as nHits rolls it)
    const hits = sk.hits ? (pv(att, "SKILL_LINK") || item(att, "loadeddice") || sk.hits[0] === sk.hits[1] ? sk.hits[1] : avgStrikes(sk.hits)) : 1;
    const nc = damageOf(att, tar, sk, { roll: .925 }).dmg, cr = damageOf(att, tar, sk, { roll: .925, crit: true }).dmg;
    const odds = 1;   // (Focus Punch never loses its focus here, the owner's rule)
    let d = Math.round(((1 - pc) * nc + pc * cr) * hits * accOf(att, tar, sk) * odds * (axelLike(sk) ? 2 : 1));
    if (!legacy(att) && tar.hp === tar.max.hp && d >= tar.hp && !(sk.hits && sk.hits[1] > 1) && ((tab(att, tar, "STURDY") && !tar.flags.sturdyUsed) || item(tar, "focussash"))) d = Math.floor(tar.hp * .79);   // it holds on with 1 HP: a big hit, not a knockout
    if (soaks && pv(tar, "ABSORB")) d -= Math.min(tar.max.hp - tar.hp, hpBase(tar) / 4);   // (Volt Absorb and the like heal it first)
    return d;
  }
  const WIND = new Set(["gust", "twister", "hurricane", "aircutter", "heatwave", "icywind", "blizzard", "fairywind", "petalblizzard", "whirlwind", "bleakwindstorm", "wildboltstorm", "sandsearstorm", "springtidestorm"]);
  // an Ability that draws in every attack of its type aimed at its side: Lightning Rod, Storm Drain, and (the owner's rule) Earth Eater and Flash Fire
  const drawsIn = (att, f, t) => { const r = tab(att, f, "ROD"), a = tab(att, f, "ABSORB"); return !!((r && (r.type || "Electric") === t) || (a && a.draw && a.type === t) || (t === "Fire" && tab(att, f, "FLASH_FIRE"))); };   // (and Flash Fire, the owner's rule)
  const absorbs = (tar, sk, att) => {
    const t = att ? mtype(att, sk) : sk.M.t, a = tab(att, tar, "ABSORB"), rod = tab(att, tar, "ROD"), sip = tab(att, tar, "SIPPER");
    return (a && a.type === t) || (t === "Fire" && tab(att, tar, "FLASH_FIRE")) || (rod && (rod.type || "Electric") === t) || (sip && (sip.wind ? WIND.has(sk.key) : sip.type === t));
  };
  function attackOnce(att, tar, sk, first) {
    if (!att.alive || !tar.alive) return { dealt: 0 };
    const M = sk.M;
    if (M.sp === "fusion") (B.fusion = B.fusion || {})[sk.key] = B.turn;
    B.fickleX = M.sp === "fickle" && first !== false && R() < .5; if (B.fickleX) msg(`${Nm(att)} is going all out for this attack!`);
    if (M.sp === "present") {
      const r = item(att, "loadeddice") ? 1 : R();   // (Loaded Dice: always the 120-power gift, the owner's rule)
      if (r < .2) { if (!heal(tar, hpBase(tar) / 4, `${Nm(tar)} had its HP restored.`)) msg(`${Nm(tar)} can't receive the gift!`); return { dealt: 0 }; }
      B.presentPow = r < .6 ? 40 : r < .9 ? 80 : 120;
    } else B.presentPow = 0;
    // abilities that soak up a move's type
    // (a Ring Target's holder hits it anyway, for ×1: the Ability still heals, powers up or raises its Sp. Atk first)
    if (absorbs(tar, sk, att)) {
      const a = pv(tar, "ABSORB"), ring = item(att, "ringtarget");
      if (a) { if (!heal(tar, hpBase(tar) / 4, `${Nm(tar)} restored HP using its ${tar.passives[0].name}!`) && !ring) msg(`It doesn't affect ${nm(tar)}...`); }
      else if (pv(tar, "FLASH_FIRE")) { addEff(tar, "FLASHFIRE", 99, tar, true); msg(psT("flashfire", "start", { POKEMON: nm(tar) })); }
      else if (pv(tar, "SIPPER")) { const sp2 = pv(tar, "SIPPER"); msg(`${Nm(tar)}'s ${tar.passives[0].name}!`); stage(tar, tar, sp2.stat, sp2.n || 1); }
      else {
        // (when Lightning Rod or Storm Drain drew the attack, the turn has said so already)
        const line = `${Nm(tar)}'s ${tar.passives[0].name} took the attack!`, last = B.ev.slice().reverse().find(e => e.k === "msg");
        if (!last || last.t !== line) msg(line);
        stage(tar, tar, "spa", 1);
      }
      if (!ring) return { dealt: 0, absorbed: true };
    }
    // Conversion, Conversion 2 and Color Change (the owner's rules, 2026-10-16): before the damage is worked out, the target may become
    // a type that resists the attack (convert); the first strike only
    if (first && M.c !== "X" && att.team !== tar.team) convert(tar, mtype(att, sk));
    const cs = critStage(att, sk), noCrit = tab(att, tar, "NO_CRIT") || has(tar, "LUCKY");
    const crit = !noCrit && !FIXED[M.sp] && M.sp !== "superfang" && (sureCrit(att, sk) || sniperCrit(att) || (pv(att, "MERCILESS") && ["PSN", "TOX"].includes(tar.status)) || R() < critChance(cs));
    const r = damageOf(att, tar, sk, { crit });
    if (r.e === 0) { msg(`It doesn't affect ${nm(tar)}...`); return { dealt: 0, immune: true }; }
    // Disguise (Mimikyu) and Ice Face (Eiscue, physical hits) take the first hit for it
    // Disguise (the owner's rule: Generation 7's) takes the first damaging hit for Mimikyu, no damage at all; Ice Face the same for Eiscue
    // (any damaging hit), and snow or hail brings its ice back (formCheck)
    if (r.dmg > 0 && !tar.flags.busted && tab(att, tar, "DISGUISE")) { tar.flags.busted = true; msg("Its disguise served it as a decoy!"); msg(`${Nm(tar)}'s disguise was busted!`); return { dealt: 0 }; }
    if (r.dmg > 0 && OPS.eiscuenoice && tar.spr !== "eiscuenoice" && tab(att, tar, "ICE_FACE")) { becomeForm(tar, "eiscuenoice", `${Nm(tar)}'s ice face shattered!`); return { dealt: 0 }; }
    const hp0 = tar.hp;
    if (M.sp === "falseswipe") r.dmg = Math.max(0, Math.min(r.dmg, tar.hp - 1));
    const bypassSub = !!M.so || pv(att, "INFILTRATOR");
    const RB = heldX(tar), rt = mtype(att, sk);
    if (RB && RB.resist === rt && (r.e > 1 || rt === "Normal") && berryOk(tar) && r.dmg > 0) useUp(tar, `${Nm(tar)}'s ${RB.n} weakened the damage!`);
    const GM = heldX(att); if (GM && GM.gem === rt && r.dmg > 0) useUp(att, `The ${GM.n} strengthened ${nm(att)}'s power!`);
    const dealt = applyDamage(att, tar, r.dmg, { crit, eff: r.e, bypassSub, cat: M.c });
    if (dealt > 0) hitItems(att, tar, sk, r.e);
    if (crit) { msg("A critical hit!"); B.tally.crits++; if (tar.alive && pv(tar, "ANGER") && tar.stages.atk < 6) { tar.stages.atk = 6; msg(psT("angerpoint", "boost", { POKEMON: nm(tar) })); fxEv(tar); } }
    else if (tar.alive && dealt > 0 && pv(tar, "ANGER") && tar.stages.atk < 6) stage(tar, tar, "atk", 1, "Anger Point");
    if ((M.t === "Fire" || THAW.has(sk.key)) && tar.status === "FRZ" && tar.alive) { tar.status = null; msg(`${Nm(tar)} thawed out!`); fxEv(tar); }
    // contact abilities and on-hit reactions (Protective Pads and the Punching Glove avoid them)
    if (tar.alive && att.alive && dealt > 0 && M.ct && !pv(att, "LONG_REACH") && !item(att, "protectivepads") && !(item(att, "punchingglove") && M.pu)) {
      const ca = pv(tar, "CONTACT"), spored = ca && ca.what === "SPORE" && (att.types.includes("Grass") || pv(att, "OVERCOAT") || item(att, "safetygoggles"));
      if (ca && !spored && R() < ca.chance) { msg(`${Nm(tar)}'s ${tar.passives[0].name}!`); tryStatus(tar, att, ca.what, false); }
      if (pv(att, "TOUCH") && R() < .3) tryStatus(att, tar, "PSN", false);
      if (pv(tar, "BARBS") && !pv(att, "MAGIC_GUARD")) chip(att, att.max.hp / 8, `${Nm(att)} was hurt by ${nm(tar)}'s ${tar.passives[0].name}!`);
      const mm = pv(tar, "MUMMY");
      if (mm && att.alive && !["MUMMY", "MULTITYPE"].includes((att.passives[0] || {}).id)) {
        if (mm.swap) { const a = att.passives; att.passives = tar.passives; tar.passives = a; msg(`${Nm(att)} swapped Abilities with ${nm(tar)}!`); }   // Wandering Spirit
        else { att.passives = [abilityOf(tar.passives[0].key)]; msg(`${Nm(att)}'s Ability became ${tar.passives[0].name}!`); }   // Mummy, Lingering Aroma
      }
      const cd = pv(tar, "CONTACT_DROP"); if (cd && att.alive) stage(tar, att, cd.stat, -1, null);   // Gooey, Tangling Hair
      if (pv(tar, "HONEY") && att.alive) stage(tar, att, "spe", -1, null);   // (Honey Gather: Gooey's effect too)
      if (pv(tar, "PERISH_BODY") && att.alive && !has(att, "PERISH")) {   // Perish Body (the owner's rule): Perish Song for it and the attacker
        addEff(att, "PERISH", 3, tar, true); if (!has(tar, "PERISH")) addEff(tar, "PERISH", 3, tar, true); msg(`${Nm(tar)}'s Perish Body! Both Pokémon will faint in three turns!`);
      }
      if (pv(tar, "PICKPOCKET") && !tar.held && att.held && !att.flags.itemUsed && !item(att, "stickybarb")) { tar.held = att.held; tar.flags.itemUsed = false; att.held = null; msg(`${Nm(tar)} stole ${nm(att)}'s ${HELD[tar.held].n}!`); }
    }
    if (tar.alive && dealt > 0 && tar.disguise) { tar.spr = tar.disguise.spr; tar.n = tar.disguise.n; tar.disguise = null; tar.flags.illusionGone = true; ev({ k: "transform", u: tar.uid, to: tar.spr }); msg(`${Nm(tar)}'s illusion wore off!`); }
    if (tar.alive && dealt > 0) formCheck(tar);
    if (dealt > 0) abilityHit(att, tar, sk, hp0);
    if (tar.alive && dealt > 0 && M.c === "P" && pv(tar, "WEAK_ARMOR")) { stage(tar, tar, "def", -1); stage(tar, tar, "spe", 2); }
    if (tar.alive && dealt > 0 && mtype(att, sk) === "Dark" && pv(tar, "JUSTIFIED")) stage(tar, tar, "atk", 1, "Justified");
    if (!tar.alive && att.alive && M.ct && pv(tar, "AFTERMATH") && !pv(att, "MAGIC_GUARD") && !damp()) chip(att, att.max.hp / 4, `${Nm(att)} was caught in the aftermath!`);
    if (tar.alive && dealt > 0 && ["Bug", "Ghost", "Dark"].includes(mtype(att, sk)) && pv(tar, "RATTLED")) stage(tar, tar, "spe", 1, "Rattled");
    if (tar.alive && att.alive && dealt > 0 && pv(tar, "CURSED") && R() < .3 && !has(att, "DISABLE")) { msg(`${Nm(tar)}'s Cursed Body!`); tryStatus(tar, att, "DISABLE", false); }
    return { dealt, crit, e: r.e };
  }
  // what a hit sets off in the generations 6 to 9 Abilities: the target's (Stamina, Berserk, Emergency Exit, Cotton Down, Sand
  // Spit, Seed Sower, Toxic Debris, Electromorphosis, Innards Out) and the attacker's (Magician, Toxic Chain)
  function abilityHit(att, tar, sk, hp0) {
    const M = sk.M, t = mtype(att, sk), half = tar.max.hp / 2, crossed = hp0 > half && tar.hp <= half;
    if (!tar.alive) { if (pv(tar, "INNARDS") && att.alive && att !== tar) chip(att, hp0, `${Nm(att)} was hurt by ${nm(tar)}'s Innards Out!`); }
    if (tar.flags.gulp && att.alive && att !== tar) { const prey = tar.flags.gulp; tar.flags.gulp = null; chip(att, att.max.hp / 4, `${Nm(tar)} spat out its prey at ${nm(att)}!`); if (att.alive) { if (prey === "arrokuda") stage(tar, att, "def", -1); else tryStatus(tar, att, "PAR", false); } }
    else {
      const hb = pv(tar, "HIT_BOOST"); if (hb && (!hb.types || hb.types.includes(t))) stage(tar, tar, hb.stat, hb.n, tar.passives[0].name);
      const bz = pv(tar, "BERSERK");
      if (bz && crossed) { if (bz.shell) { for (const st of ["atk", "spa", "spe"]) stage(tar, tar, st, 1); for (const st of ["def", "sdf"]) stage(tar, tar, st, -1); } else stage(tar, tar, "spa", 1, "Berserk"); }
      if (pv(tar, "EJECT_HALF") && crossed && benchOf(tar.team).length && B.units.includes(tar)) { msg(`${Nm(tar)}'s ${tar.passives[0].name}!`); B.pivotQ.push({ uid: tar.uid }); }
      if (pv(tar, "COTTON_DOWN")) { msg(`${Nm(tar)}'s Cotton Down!`); for (const x of B.units) if (x.alive && x.team !== tar.team) stage(tar, x, "spe", -1); }   // (the opposing side only: the owner's rule, 2026-10-16)
      if (pv(tar, "SAND_SPIT") && B.weather !== "sand") { B.weather = "sand"; B.wxEnd = fieldRounds(item(tar, "smoothrock") ? 8 : 5); msg(`${Nm(tar)}'s Sand Spit!`); if (WEATHER.sand) msg(WEATHER.sand.turn); ev({ k: "weather", w: "sand" }); }
      if (pv(tar, "SEED_SOWER") && !(B.terrain && B.terrain.t === "grassy")) setTerrain(tar, "grassy");
      if (pv(tar, "TOXIC_DEBRIS") && M.c === "P") { const hz = sideHz(att.team); if (hz.tspikes < 2) { hz.tspikes++; msg(psT("toxicspikes", "start", { TEAM: psTeam(att.team) })); hzEv(att.team); } }
      const ch = pv(tar, "CHARGED"); if (ch && (!ch.wind || WIND.has(sk.key)) && !has(tar, "CHARGE")) { addEff(tar, "CHARGE", 99, tar, true); msg(`Being hit by ${M.n} charged ${nm(tar)} with power!`); }
    }
    if (att.alive && pv(att, "MAGICIAN") && !att.held && tar.held && !tar.flags.itemUsed && !item(tar, "stickybarb")) { att.held = tar.held; att.flags.itemUsed = false; tar.held = null; msg(`${Nm(att)} stole ${nm(tar)}'s ${HELD[att.held].n}!`); }
    if (tar.alive && pv(att, "TOXIC_CHAIN") && R() < .3) tryStatus(att, tar, "TOX", false);
  }
  // the chance an attack flinches its target (its own, or King's Rock, Razor Fang and Stench; Serene Grace doubles it)
  const flinchOf = (u, s) => { const M = s.M, f = M.fl || (M.c !== "X" && (item(u, "kingsrock") || item(u, "razorfang") || pv(u, "STENCH")) ? 10 : 0); return Math.min(1, f / 100 * (pv(u, "SERENE") ? 2 : 1)); };
  // a flinch (the owner's rule, 2026-10-19): the Pokémon loses its next turn (canMove), instead of 40% turn meter. Upper Hand going
  // off by itself costs the priority move instead (flinchT); Steadfast still raises Speed
  function flinchIt(x) {
    msg(`${Nm(x)} flinched!`); x.flags.flinchT = B.turn;
    if (!B.upperHanding) x.flags.stun = true;
    if (pv(x, "STEADFAST")) stage(x, x, "spe", 1, "Steadfast");
  }
  // added effects of a damaging move on one target (status, flinch, stat drops)
  function secondary(att, tar, sk, fx = {}) {
    const M = sk.M;
    if (!tar.alive || tab(att, tar, "SHIELD_DUST") || item(tar, "covertcloak") || pv(att, "SHEER_FORCE")) return;
    const sg = pv(att, "SERENE") || pledgeOn(att.team, "rainbow") ? 2 : 1;   // (Serene Grace or a rainbow: they don't stack)
    if (M.ail && R() < M.ac / 100 * sg) tryStatus(att, tar, M.ail, false);
    const fl = M.fl || (item(att, "kingsrock") || item(att, "razorfang") || pv(att, "STENCH") ? 10 : 0);
    if (fl && !fx.flinched && R() < fl / 100 * sg) {
      fx.flinched = true;
      if (pv(tar, "INNER_FOCUS")) { /* never flinches */ }
      else flinchIt(tar);   // (Upper Hand's trigger: the priority move is cancelled instead)
    }
    if (M.st && M.sw !== "self" && R() < M.sc / 100 * sg) for (const [s, n] of M.st) stage(att, tar, s, n);
    if (M.sp === "triattack" && R() < .2 * sg) tryStatus(att, tar, pick(["BRN", "PAR", "FRZ"]), false);   // Tri Attack: one of the three
    if (M.sp === "direclaw" && R() < .5 * sg) tryStatus(att, tar, pick(["PSN", "PAR", "SLP"]), false);   // Dire Claw: one of the three
    if (M.sp === "saltcure" && tar.alive && !has(tar, "SALTCURE")) { addEff(tar, "SALTCURE", 99, att, true); msg(`${Nm(tar)} is being salt cured!`); }
    if (M.sp === "throatchop" && tar.alive) addEff(tar, "THROAT", 2, att);                                  // no sound moves for 2 turns
    if (M.sp === "psychicnoise" && tar.alive && !has(tar, "HEALBLOCK")) { addEff(tar, "HEALBLOCK", 2, att, true); msg(psT("healblock", "start", { POKEMON: nm(tar) })); }
    if (M.sp === "secretpower" && R() < .3 * sg) secretPower(att, tar);
  }
  // Smack Down: grounded for as long as it stays on the field (Ground moves hit it, Flying types too), and out of Fly or Bounce
  function smackDown(x) {
    const flying = x.flags.semi && ["fly", "bounce"].includes(x.flags.semi.key), up = flying || !grounded(x);
    if (flying) { x.flags.semi = null; ev({ k: "semi", u: x.uid, on: 0 }); }
    removeEff(x, "MAGNETRISE"); addEff(x, "SMACKDOWN", 99, x, true);
    if (up) msg(psT("smackdown", "start", { POKEMON: nm(x) }));
  }
  // a combined Pledge's field: a sea of fire or a swamp around the other side, a rainbow on the user's, for 4 rounds
  function pledgeField(u, fx) {
    const side = fx === "rainbow" ? u.team : foeTeam(u);
    ((B.pledgeFx || (B.pledgeFx = { A: {}, E: {} }))[side])[fx] = fieldRounds(4);
    msg(psT(PLEDGE_TXT[fx], "start", { TEAM: psTeam(side) }));
  }
  // Secret Power's extra effect comes from the field (the owner's rule): the terrain's and the weather's, both when both are up
  // (paralysis when there's neither, as on plain ground in the games)
  function secretPower(att, tar) {
    const fx = [], ter = B.terrain && B.terrain.t, wx = B.weather && inWeather(B.weather) ? B.weather : null;
    if (ter) fx.push({ electric: "PAR", grassy: "SLP", misty: ["spa", -1], psychic: ["spe", -1] }[ter]);
    if (wx) fx.push({ sun: "BRN", rain: ["atk", -1], sand: ["acc", -1], hail: "FRZ", snow: "FRZ" }[wx]);
    if (!fx.length) fx.push("PAR");
    for (const f of fx) if (f && tar.alive) { if (typeof f === "string") tryStatus(att, tar, f, false); else stage(att, tar, f[0], f[1]); }
  }

  // ---------- special moves ----------
  // Transform and Imposter (the owner's rule, 2026-10-15): the copy is a body of its own, like a Substitute, with a fresh HP bar as big as
  // the user's own max HP and no status. When the copy is knocked out (or the user leaves the field) the user is itself again, with the
  // HP, status, moves and cooldowns it had (Transform's own cooldown kept running); the stat changes it has then stay
  function transform(u, t, quiet) {
    if (!t || !t.alive || t.flags.transformed || u.flags.transformed) { if (!quiet) msg("But it failed!"); return; }
    u.orig = { spr: u.spr, types: u.types.slice(), skills: u.skills, max: { ...u.max }, passives: u.passives.slice(), hp: u.hp, status: u.status, sTurn: u.sTurn, cool: { ...u.cool } };
    u.flags.transformed = true; u.spr = t.key; u.types = t.types.slice(); u.skills = t.skills; u.cool = { 1: 0, 2: 0, 3: 0 };
    for (const s of ["atk", "def", "spa", "sdf", "spe"]) u.max[s] = t.max[s];
    u.stages = { ...t.stages }; u.passives = t.passives.slice();
    u.hp = u.max.hp; u.status = null; u.sTurn = 0;
    ev({ k: "transform", u: u.uid, to: t.key, hp: u.hp });
    msg(`${Nm(u)} transformed into ${t.n}!`); fxEv(u); abilityCure(u);
  }
  function untransform(u, broke) {
    const o = u.orig; if (!o) return;
    Object.assign(u, { spr: o.spr, types: o.types, skills: o.skills, max: o.max, passives: o.passives, hp: o.hp, status: o.status, sTurn: o.sTurn, cool: o.cool });
    u.orig = null; u.flags.transformed = false;
    ev({ k: "transform", u: u.uid, to: u.spr, hp: u.hp });
    if (broke) { msg(`${Nm(u)}'s transformation broke! It's back to its old self.`); fxEv(u); }
  }
  const SELF_KO = new Set(["selfdestruct", "explosion", "mistyexplosion", "finalgambit"]);
  function damp() { return B.units.some(x => x.alive && pv(x, "DAMP")); }

  // ---------- targeting + AI ----------
  function targetable(u) { return enemies(u); }
  // value of a status move against (or for) a target, roughly on the same scale as "fraction of HP removed"
  function statusValue(u, sk, t) {
    const M = sk.M, sp = M.sp;
    if (sp === "splash") return .01;
    if (sp === "transform") return u.flags.transformed ? -1 : 1.2;
    if (sp === "metronome") return .45;
    const v2 = statusValue2(u, sk, t); if (v2 != null) return v2;
    if (sp === "haze") { const foeUp = enemies(u).reduce((a, f) => a + Object.values(f.stages).filter(v => v > 0).reduce((x, y) => x + y, 0), 0), myDown = allies(u).reduce((a, f) => a + Object.values(f.stages).filter(v => v < 0).reduce((x, y) => x - y, 0), 0); return (foeUp + myDown) * .18; }
    if (sp === "rest") return !inTerrain("electric", u) && !inTerrain("misty", u) && (u.hp < u.max.hp * .4 || (u.status && u.status !== "SLP")) ? .9 : -1;
    if (M.hl || sp === "recover" || sp === "softboiled") { const tg = sk.target === "ally_single" ? t : sk.target === "partners" ? allies(u).filter(x => x !== u).sort((a, b) => a.hp / a.max.hp - b.hp / b.max.hp)[0] : u; if (!tg) return -1; return tg.hp < tg.max.hp * .6 ? (1 - tg.hp / tg.max.hp) * 1.4 : -1; }
    // (behind screens a teammate's Weakness Policy survives the super-effective hit that powers it up)
    if (sp === "reflect" || sp === "lightscreen") return has(u, sp === "reflect" ? "REFLECT" : "LSCREEN") ? -1 : (combos(u, "screen") ? screenWorth(u, sp === "reflect" ? "P" : "S") : .45) + (combos(u, "wp") && allies(u).some(x => item(x, "weaknesspolicy")) ? .1 : 0);
    if (sp === "mist") return has(u, "MIST") ? -1 : .15;
    if (sp === "focusenergy") return has(u, "FOCUS") ? -1 : .3;
    if (sp === "substitute") return u.shield > 0 || u.hp < u.max.hp * .5 ? -1 : .3 + (combos(u, "fp") ? .3 * fpNext(u) : 0);   // hits on the substitute don't break Focus Punch
    if (sp === "roar") return t.atb / 100 * .4 + Object.values(t.stages).reduce((a, v) => a + Math.max(0, v), 0) * .15 + (combos(u, "phaze") ? hazardChip(t.team) * 1.5 : 0);
    if (sp === "protect" || sp === "detect") {
      const inc = enemies(u).reduce((a, f) => a + bestHitOn(f, u), 0); if (has(u, "PROTECT")) return -1;
      return Math.min(.5, inc / Math.max(1, u.hp) * .35) + (combos(u, "fp") && wasHit(u) ? .5 * fpNext(u) : 0);   // Protect, then a sure Focus Punch
    }
    if (sp === "endure") {
      if (has(u, "ENDURE")) return -1;
      const payoff = combos(u, "endure") && u.skills.some(s => ["reversal", "flail", "endeavor"].includes(s.key) && (u.cool[s.slot] || 0) <= 1);
      const lethal = enemies(u).reduce((a, f) => a + bestHitOn(f, u), 0) >= u.hp;
      if (payoff && lethal) return .55;   // hang on at 1 HP, then Reversal or Flail at full power, or Endeavor
      return u.hp > u.max.hp * .35 ? -1 : .3;
    }
    if (sp === "safeguard") return has(u, "SAFEGUARD") ? -1 : .2 + .1 * enemies(u).filter(f => f.skills.some(s => s.M.c === "X" && s.M.ail)).length;
    if (WX_MOVE[sp]) {
      const w = WX_MOVE[sp]; if (B.weather === w) return -1;
      const old = x => x.skills.filter(s => s.M.c !== "X" && ({ rain: "Water", sun: "Fire" }[w] === s.M.t)).length * .12 + (x.passives.some(p => p.w === w) ? .2 : 0);
      // everything it powers up: boosted and weakened attacks, sure-hit Thunder, Hurricane and Blizzard, Speed-doubling and other
      // weather Abilities, and in sand or snow the Rock- or Ice-types' extra bulk (and no chip)
      const cold = w === "snow" || w === "hail";
      const gain = x => {
        let g = 0;
        for (const s of x.skills) if (s.M.c !== "X") {
          const t = s.M.t;
          if (w === "rain") g += t === "Water" ? .15 : t === "Fire" ? -.08 : (s.key === "thunder" || s.key === "hurricane") ? .15 : 0;
          if (w === "sun") g += t === "Fire" ? .15 : t === "Water" ? -.08 : 0;
          if (cold && s.key === "blizzard") g += .15;
        }
        for (const p of x.passives) if (p.w === w || (cold && (p.w === "hail" || p.w === "snow"))) g += p.id === "WSPEED" ? .45 : .2;
        if (w === "sand" && x.types.some(t => t === "Rock" || t === "Ground" || t === "Steel")) g += .12;
        if (w === "sand" && pv(x, "SAND_FORCE")) g += .2;
        if (cold && x.types.includes("Ice")) g += .12;
        if (w === "sun" && pv(x, "SOLAR")) g += .2;
        return g;
      };
      const f = legacy(u) ? old : gain;
      return .05 + allies(u).reduce((a, x) => a + f(x), 0) - enemies(u).reduce((a, x) => a + f(x), 0);
    }
    if (sp === "defensecurl" && combos(u, "curl") && !has(u, "DEFCURL") && u.skills.some(s => s.key === "rollout" || s.key === "iceball")) return .4;
    if (sp === "charge" && combos(u, "charge") && !has(u, "CHARGE") && u.skills.some(s => s.M.t === "Electric" && s.M.c !== "X" && s.M.p > 0 && skillReady(u, s) && s !== sk)) return .35;
    if (sp === "bellydrum") return u.hp > u.max.hp * .65 && u.stages.atk < 2 && u.max.atk >= u.max.spa ? .8 : -1;
    if (sp === "psychup") { const d = t ? Object.keys(t.stages).reduce((a, s) => a + t.stages[s] - u.stages[s], 0) : 0; return d > 1 ? d * .15 : -1; }
    if (sp === "refresh") return ["BRN", "PSN", "TOX", "PAR"].includes(u.status) ? .45 : -1;
    if (sp === "aromatherapy") { const n = [...allies(u), ...benchOf(u.team)].filter(x => x.status).length; return n ? .25 * n : -1; }
    if (M.ail) {
      if (!t || !t.alive) return -1;
      // its own or a teammate's Hex (any status) or Venoshock (poison) then hits this target for double
      const doubles = combos(u, "hex") && !t.status && allies(u).some(x => x.skills.some(s => (s.M.sp === "hex" && MAJOR.includes(M.ail)) || (s.M.sp === "venoshock" && (M.ail === "PSN" || M.ail === "TOX")))) ? .12 : 0;
      const major = MAJOR.includes(M.ail);
      if (major && t.status) return -1;
      if (!major && has(t, M.ail)) return -1;
      if (TYPE_IMMUNE[M.ail] && t.types.includes(TYPE_IMMUNE[M.ail])) return -1;
      if ((major || M.ail === "CNF") && inTerrain("misty", t)) return -1;   // (Misty Terrain: no status or confusion on the ground)
      if (M.ail === "SLP" && inTerrain("electric", t)) return -1;           // (Electric Terrain: no sleep on the ground)
      if (M.t === "Electric" && typeEff("Electric", t.types) === 0 && !item(u, "ringtarget")) return -1;
      if (M.pw && t.types.includes("Grass")) return -1;
      if (!legacy(u)) {
        if (M.so && pv(t, "SOUNDPROOF")) return -1;
        if (M.pw && (tab(u, t, "OVERCOAT") || item(t, "safetygoggles"))) return -1;
        if (major && inWeather("sun") && tab(u, t, "LEAF_GUARD")) return -1;
        if (["PSN", "TOX", "SEED"].includes(M.ail) && pv(t, "MAGIC_GUARD")) return -1;   // no damage from it
      }
      const ns = pv(t, "NO_STATUS"); if (ns && ns.list.includes(M.ail)) return -1;
      if (M.ail === "SLP" && uproarOn()) return -1;
      if (has(t, "SAFEGUARD") && (major || M.ail === "CNF")) return -1;
      let v = { SLP: .75, PAR: .55, BRN: .5, TOX: .5, PSN: .4, FRZ: .8, CNF: .35, INFAT: .3, SEED: .45, DISABLE: .25, TRAP: .3 }[M.ail] || .3;
      if (M.ail === "PAR" && B.trickRoom > B.turn && !legacy(u)) v = .15;   // (under Trick Room its Speed -2 puts the target first: only the lost turns count)
      if (M.st) v -= M.st.reduce((a, [, n]) => a + Math.max(0, n), 0) * .1;   // Swagger and Flatter raise the target's stats too
      if (!legacy(u)) {
        if (M.ail === "BRN" && pv(t, "MAGIC_GUARD")) v *= .5;                      // only the halved Attack counts
        if (M.ail === "SLP" && pv(t, "EARLY_BIRD")) v *= .5;                        // it wakes up twice as fast
        if (["PSN", "TOX", "BRN", "PAR"].includes(M.ail) && pv(t, "SYNC") && !u.status) v -= .45;   // it comes straight back
      }
      v += doubles;   // its own Hex or Venoshock hits this target for double afterwards
      return v * accOf(u, t, sk) * (sk.target === "aoe_enemies" ? 1.3 : 1) * (.6 + .4 * t.hp / t.max.hp);
    }
    if (M.st) {
      const self = M.sw === "self";
      const tg = self ? u : t;
      if (!tg) return -1;
      if (!self && !legacy(u) && M.st.some(([, n]) => n < 0) && tab(u, tg, "DEFIANT")) return -1;   // Defiant and Competitive: +2 for them
      let v = 0;
      for (const [s, n] of M.st) {
        const cur = tg.stages[s];
        const room = s === "spe" && B.trickRoom > B.turn && !legacy(u);   // (under Trick Room the slower side moves first: Speed works the other way)
        if (self) v += cur >= 4 ? 0 : (n > 0 ? .22 * n : 0) * (room ? -1 : s === "atk" ? (u.max.atk >= u.max.spa ? 1.2 : .3) : s === "spa" ? (u.max.spa > u.max.atk ? 1.2 : .3) : 1);
        else v += cur <= -3 ? 0 : -n * .14 * (room ? -1 : 1);
      }
      if (self && v > 0 && enemies(u).some(f => pv(f, "RIVALRY") || item(f, "mirrorherb"))) v *= .4;
      return v * (M.sw === "foes" ? 1.5 : 1) * (u.hp / u.max.hp > .4 ? 1 : .4);
    }
    return .1;
  }
  // the later generations' status moves, for the AI (null: not one of these)
  function statusValue2(u, sk, t) {
    const sp = sk.M.sp, foes = enemies(u), fb = benchOf(foeTeam(u)).length, mine = benchOf(u.team);
    const hzF = B.hazards && B.hazards[foeTeam(u)], hzM = B.hazards && B.hazards[u.team];
    const hpf = x => x.hp / x.max.hp;
    switch (sp) {
      case "teleport": case "batonpass": {
        if (!mine.length) return -1;
        const cur = matchup(u, foes), best = Math.max(...mine.map(x => matchup(x, foes)));
        const pass = sp === "batonpass" ? sumUp(u.stages) * .15 : 0;
        return best > cur + .4 || pass > .3 ? .3 + pass : -1;
      }
      case "partingshot": return mine.length && foes.some(f => f.stages.atk > -6 || f.stages.spa > -6) ? .25 : -1;
      // the moves that were left out (each worth something only where it does something)
      case "afteryou": return t && t !== u && t.atb < 60 && threatRaw(t) > threatRaw(u) * 1.3 ? .1 : -1;
      case "instruct": return t && t !== u && t.lastSkill && t.lastSkill.M.c !== "X" && t.lastSkill.M.p >= 80 ? .2 : -1;
      case "purify": return t && t !== u && t.status ? .15 + (1 - hpf(u)) * .2 : -1;
      case "iondeluge": return fieldOn("ionDeluge") ? -1 : .01;
      case "allyswitch": case "doodle": case "electrify": case "entrainment": case "fairylock": case "simplebeam": case "spotlight": case "teatime": case "addtype": return .01;
      case "assist": return [...allies(u), ...mine].some(x => x !== u && x.skills.some(s => s.M.c !== "X")) ? .2 : -1;
      case "bestow": return t && u.held && !u.flags.itemUsed && ["flameorb", "toxicorb", "laggingtail", "ironball", "stickybarb"].includes(u.held) && !t.held ? .2 : -1;
      case "conversion2": return t && t.lastSkill && t.lastSkill.M.c !== "X" && typeEff(t.lastSkill.M.t, u.types) >= 1 ? .1 : -1;
      case "courtchange": return (hzM && (hzM.sr || hzM.spikes || hzM.tspikes || hzM.web)) || foes.some(f => has(f, "REFLECT") || has(f, "LSCREEN") || has(f, "VEIL")) ? .3 : -1;
      case "craftyshield": return foes.some(f => f.skills.some(s => s.M.c === "X" && s.target !== "self" && s.target !== "team" && skillReady(f, s))) ? .08 : -1;
      case "matblock": return foes.some(f => f.atb > 50) ? .12 : -1;
      case "quickguard": return foes.some(f => f.skills.some(s => s.M.pri > 0 && skillReady(f, s))) ? .1 : -1;
      case "wideguard": return foes.some(f => f.skills.some(s => s.target === "aoe_enemies" && s.M.c !== "X" && skillReady(f, s))) ? .12 : -1;
      case "embargo": return t && t.held && !t.flags.itemUsed && !has(t, "EMBARGO") ? .08 : -1;
      case "encore": return t && t.lastSkill && !has(t, "ENCORE") ? (t.lastSkill.M.c === "X" ? .3 : .1) : -1;
      case "foresight": return t && !has(t, "FORESIGHT") && t.types.includes("Ghost") && u.skills.some(s => ["Normal", "Fighting"].includes(s.M.t) && s.M.c !== "X") ? .15 : -1;
      case "miracleeye": return t && !has(t, "MIRACLEEYE") && t.types.includes("Dark") && u.skills.some(s => s.M.t === "Psychic" && s.M.c !== "X") ? .15 : -1;
      case "gravity": return !fieldOn("gravity") && foes.some(f => !grounded(f)) && [...allies(u), ...mine].some(x => x.skills.some(s => s.M.t === "Ground" && s.M.c !== "X")) ? .2 : -1;
      case "grudge": return hpf(u) < .3 ? .12 : -1;
      case "guardsplit": return t && t.max.def + t.max.sdf > (u.max.def + u.max.sdf) * 1.3 ? .15 : -1;
      case "powersplit": return t && t.max.atk + t.max.spa > (u.max.atk + u.max.spa) * 1.3 ? .15 : -1;
      case "heartswap": return t && sumUp(t.stages) - sumUp(u.stages) >= 2 ? .1 * (sumUp(t.stages) - sumUp(u.stages)) : -1;
      case "imprison": return has(u, "IMPRISON") ? -1 : foes.some(f => f.skills.some(s => u.skills.some(x => x.key === s.key && x !== sk))) ? .08 : -1;
      case "magiccoat": return foes.some(f => f.skills.some(s => s.M.c === "X" && (s.M.ail || s.M.st) && skillReady(f, s))) ? .1 : -1;
      case "magicroom": return fieldOn("magicRoom") ? -1 : .02;
      case "wonderroom": return fieldOn("wonderRoom") ? -1 : .02;
      case "mimic": return t && t.lastSkill && t.lastSkill.M.c !== "X" && t.lastSkill.M.p >= 80 ? .15 : -1;
      case "mudsport": return !fieldOn("mudSport") && foes.some(f => f.skills.some(s => s.M.t === "Electric" && s.M.c !== "X")) ? .1 : -1;
      case "watersport": return !fieldOn("waterSport") && foes.some(f => f.skills.some(s => s.M.t === "Fire" && s.M.c !== "X")) ? .1 : -1;
      case "nightmare": return t && t.status === "SLP" && t.sTurn > 1 && !has(t, "NIGHTMARE") ? .25 : -1;
      case "octolock": return t && !has(t, "OCTOLOCK") ? .2 : -1;
      case "perishsong": return t && !has(t, "PERISH") && mine.length && sumUp(t.stages) >= 2 && sumUp(u.stages) < 2 ? .1 * sumUp(t.stages) : -1;
      case "powder": { const n = enemies(u).filter(f => !has(f, "POWDER") && !powderProof(u, f) && f.skills.some(s => s.M.t === "Fire" && s.M.c !== "X" && skillReady(f, s))).length; return n ? .15 * n : -1; }   // (every foe on the field)
      case "powertrick": return u.max.def > u.max.atk * 1.3 ? .25 : -1;
      case "psychoshift": return u.status && t && !t.status ? .3 : -1;
      case "quash": return t && t.atb > 60 ? .1 : -1;
      case "recycle": return u.held && u.flags.itemUsed ? .2 : -1;
      case "revivalblessing": return B.gone.some(y => y.team === u.team && !y.alive) ? .5 : -1;
      case "snatch": return foes.some(f => f.skills.some(s => s.M.c === "X" && (s.target === "self" || s.target === "team") && skillReady(f, s))) ? .08 : -1;
      case "spite": case "torment": return t && t.lastSkill && t.lastSkill.M.c !== "X" ? .1 : -1;
      case "stockpile": return (u.flags.stock || 0) < 3 ? .2 : -1;
      case "swallow": return (u.flags.stock || 0) && hpf(u) < .5 ? .3 + .1 * u.flags.stock : -1;
      case "telekinesis": return -1;
      case "topsyturvy": return t && sumUp(t.stages) >= 2 ? .12 * sumUp(t.stages) : -1;
      case "mefirst": return t && t.skills.some(s => s.M.c !== "X" && s.M.p >= 70 && skillReady(t, s)) ? .3 : -1;
      case "filletaway": return hpf(u) > .7 && !u.stages.atk ? .45 : -1;
      case "shedtail": return mine.length && hpf(u) > .6 ? .3 : -1;
      case "healblock": return t && !has(t, "HEALBLOCK") && t.skills.some(s => s.M.hl || ["recover", "softboiled", "roost", "synthesis", "rest", "wish"].includes(s.M.sp)) ? .2 : -1;
      case "strengthsap": return t && t.team !== u.team ? Math.min(.6, (1 - hpf(u)) * .8) + (statOf(t, "atk") > statOf(t, "spa") ? .1 : 0) : -1;
      case "sketch": {
        const m = t && t.team !== u.team && t.skills.find(x => x.slot === sk.slot && x.key !== "struggle"); if (!m || isSketch(m.key)) return -1;
        if (u.own && !sketchWorth(u, m.key)) return -1;   // (your own Pokémon keeps it: only a move that's good for it)
        const ns = { ...makeSkill(m.key, sk.slot), cd: 0 }, v = ns.M.c === "X" ? statusValue(u, ns, ns.target === "enemy" ? t : u) : expectedDamage(u, t, ns) / t.max.hp;
        return v > 0 ? Math.min(1, v) + .15 : -1;
      }
      case "stealthrock": return hzF && hzF.sr || !fb ? -1 : .2 + .06 * fb + (phazeSide(u) ? .25 : 0);
      case "spikes": return hzF && hzF.spikes >= 3 || !fb ? -1 : .15 + .04 * fb + (phazeSide(u) ? .2 : 0);
      case "stickyweb": return hzF && hzF.web || !fb ? -1 : .12 + .04 * fb;
      case "toxicspikes": return hzF && hzF.tspikes >= 2 || !fb ? -1 : .12 + .04 * fb + (phazeSide(u) ? .15 : 0) + (combos(u, "hex") && allies(u).some(x => x.skills.some(s => s.M.sp === "venoshock" || s.M.sp === "hex")) ? .1 : 0);
      case "defog": return (hzM && (hzM.sr || hzM.spikes || hzM.tspikes || hzM.web)) || foes.some(f => has(f, "REFLECT") || has(f, "LSCREEN") || has(f, "VEIL")) ? .3 : -1;
      case "wish": return !has(u, "WISH") && hpf(u) < .7 ? .3 : -1;
      case "aquaring": case "ingrain": return has(u, sp === "aquaring" ? "AQUARING" : "INGRAIN") ? -1 : .12;
      case "painsplit": return t && t.hp > u.hp * 1.3 ? (t.hp - u.hp) / 2 / u.max.hp * 1.2 : -1;
      case "healingwish": return mine.some(x => hpf(x) < .5 || x.status) && hpf(u) < .3 ? .4 : -1;
      case "memento": return hpf(u) < .25 && t ? .35 : -1;
      case "tailwind": {
        if (B.tailwind && B.tailwind[u.team] > B.turn) return -1;
        if (legacy(u)) return .3;
        const mine = avgSpe(sideLeft(u.team)), theirs = avgSpe(sideLeft(u.team === "A" ? "E" : "A"));   // doubling helps most when it decides who's faster
        return .3 + .6 * clamp(1 - Math.abs(mine * 2 - theirs * 1.2) / Math.max(1, theirs * 2), 0, 1) + (mine < theirs ? .25 : 0);
      }
      case "auroraveil": return (inWeather("hail") || inWeather("snow")) && !has(u, "VEIL") ? (combos(u, "screen") ? screenWorth(u, "P") + screenWorth(u, "S") - .15 : .5) : -1;
      case "luckychant": return has(u, "LUCKY") ? -1 : .05;
      case "trickroom": {
        if (legacy(u)) { const s0 = avgSpe(allies(u)) < avgSpe(foes); return B.trickRoom > B.turn ? (s0 ? -1 : .3) : (s0 ? .45 : -1); }
        const mine = avgSpe(sideLeft(u.team)), theirs = avgSpe(sideLeft(u.team === "A" ? "E" : "A"));
        const gap = clamp((theirs - mine) / Math.max(1, theirs), -1, 1);   // how much slower this side is
        return B.trickRoom > B.turn ? (gap > 0 ? -1 : .3 + .8 * -gap) : (gap > .05 ? .45 + 1.6 * gap : -1);
      }
      case "terrain": {
        const tt = TERRAIN_MOVE[sk.key]; if (B.terrain && B.terrain.t === tt) return -1;
        const boost = { electric: "Electric", grassy: "Grass", psychic: "Psychic" }[tt];
        const n = boost ? allies(u).reduce((a, x) => a + x.skills.filter(s => s.M.c !== "X" && s.M.t === boost).length, 0) : 0;
        return .05 + .08 * n + (tt === "misty" && foes.some(f => f.skills.some(s => s.M.ail && s.M.c === "X")) ? .15 : 0);
      }
      case "yawn": return t && !t.status && !has(t, "YAWN") && !inTerrain("electric", t) && !inTerrain("misty", t) ? .4 : -1;
      case "curse": return u.types.includes("Ghost") ? (t && !has(t, "CURSE") && hpf(u) > .55 ? .45 : -1) : (u.stages.atk < 4 && u.max.atk >= u.max.spa ? .3 : -1);
      case "taunt": return t && !has(t, "TAUNT") && !((pv(t, "NO_STATUS") || {}).list || []).includes("TAUNT") && t.skills.some(s => s.M.c === "X" && skillReady(t, s)) ? .3 : .02;
      case "gastroacid": return t && !t.flags.noAbility && t.passives[0] && t.passives[0].id !== "NONE" ? .15 : -1;
      case "worryseed": case "soak": case "reflecttype": case "conversion": case "camouflage": case "roleplay": case "skillswap": return .05;
      case "magnetrise": return !has(u, "MAGNETRISE") && foes.some(f => f.skills.some(s => s.M.t === "Ground" && s.M.c !== "X")) ? .3 : -1;
      case "meanlook": return t && !has(t, "NOSWITCH") && !pv(t, "RUN_AWAY") ? .04 : -1;
      case "destinybond": return hpf(u) < .3 ? .45 : -1;
      case "lockon": return u.skills.some(s => s.M.c !== "X" && (OHKO.has(s.M.sp) || (s.M.a && s.M.a < 80))) && !has(u, "LOCKON") ? .25 : -1;
      case "laserfocus": return has(u, "LASER") ? -1 : .2;
      case "acupressure": return .25;
      case "powerswap": case "guardswap": { if (!t) return -1; const ks = sp === "powerswap" ? ["atk", "spa"] : ["def", "sdf"]; const d = ks.reduce((a, s) => a + t.stages[s] - u.stages[s], 0); return d > 1 ? d * .15 : -1; }
      case "speedswap": return t && t.max.spe > u.max.spe * 1.2 ? .2 : -1;
      case "trick": return t && u.held && ["flameorb", "toxicorb", "laggingtail", "ironball", "stickybarb"].includes(u.held) ? .25 : -1;   // (Choice items don't lock here: they'd be a gift)
      case "helpinghand": return allies(u).some(x => x !== u) ? .12 : -1;
      case "followme": {
        const cover = combos(u, "fp") ? Math.max(0, ...allies(u).filter(x => x !== u && FP_SAFE(x)).map(x => .4 * fpNext(x))) : 0;
        return (allies(u).some(x => x !== u && hpf(x) < .5) && hpf(u) > .6 ? .2 : .03) + cover;
      }
      case "mirrormove": case "copycat": {   // (the move in the opposing target's slot, used this once: worth what that move is worth to the user, as Sketch's)
        const m = t && t.team !== u.team && t.skills.find(x => x.slot === sk.slot && x.key !== "struggle"); if (!m || !copyable(m.key)) return -1;
        const ns = { ...makeSkill(m.key, sk.slot), cd: 0 }, v = ns.M.c === "X" ? statusValue(u, ns, ns.target === "enemy" ? t : u) : expectedDamage(u, t, ns) / t.max.hp;
        return v > 0 ? Math.min(1, v) : -1;
      }
      case "sleeptalk": return -1;   // only usable while asleep
      case "naturepower": return .3;
      case "venomdrench": return foes.some(f => f.status === "PSN" || f.status === "TOX") ? .3 : -1;
      case "rototiller": case "flowershield": return allies(u).some(x => x.types.includes("Grass")) ? .15 : -1;
      case "magneticflux": return allies(u).some(x => x.types.includes("Electric")) ? .15 : -1;
      case "dragoncheer": return allies(u).some(x => x !== u && !has(x, "FOCUS")) ? .15 : -1;
    }
    return null;
  }
  const isHealSkill = s => !!(s.M.hl || ["recover", "softboiled", "rest", "roost", "synthesis"].includes(s.M.sp));
  // what a screen saves (cfg.comboKeys "screen"): a third of each foe's best hit of that kind on each partner, over the rounds it
  // lasts, so against hard hitters a screen goes up before anything else
  const screenWorth = (u, cat) => {
    const al = allies(u).filter(x => x.alive), fs = enemies(u).filter(f => f.alive); let v = 0;
    for (const f of fs) for (const x of al) { let m = 0; for (const s of f.skills) if (s.M.c === cat && skillReady(f, s)) m = Math.max(m, expectedDamage(f, x, s)); v += Math.min(1, m / Math.max(1, x.hp)); }
    return .15 + v * .2;
  };
  const bestHitOn = (f, t) => { let m = 0; for (const s of f.skills) if (s.M.c !== "X" && skillReady(f, s)) m = Math.max(m, expectedDamage(f, t, s)); return m; };
  const WX_MOVE = { raindance: "rain", sunnyday: "sun", sandstorm: "sand", hail: "hail", snowscape: "hail" };   // (Snowscape: the same weather as Hail)
  const TERRAIN_MOVE = { electricterrain: "electric", grassyterrain: "grassy", mistyterrain: "misty", psychicterrain: "psychic" };
  const GRAV_BAN = new Set(["fly", "bounce", "skydrop", "highjumpkick", "jumpkick", "splash", "magnetrise", "telekinesis", "flyingpress"]);
  // Last Resort (the owner's rule): a Pokémon under Encore or Disable hits with it at double power, with no cooldown, despite them
  function lrBoost(u) { return has(u, "ENCORE") || has(u, "DISABLE"); }
  function skillReady(u, s) {
    if (!s) return false;
    if (s.M.sp !== "struggle") {
      if ((u.flags.lost || {})[s.key]) return false;                                                     // Grudge
      if ((effOf(u, "SPITE") || {}).key === s.key) return false;                                         // Spite
      if (has(u, "TORMENT") && u.lastSkill && u.lastSkill.key === s.key) return false;                   // Torment
      if (enemies(u).some(f => has(f, "IMPRISON") && f.skills.some(x => x.key === s.key))) return false;  // Imprison
      if (fieldOn("gravity") && GRAV_BAN.has(s.key)) return false;                                         // Gravity
      if (s.M.sp === "belch" && !u.flags.ateBerry && !u.types.includes("Poison")) return false;           // Belch: after a Berry (a Poison type needs none)
    }
    if (s.M.c === "X" && has(u, "TAUNT") && s.M.sp !== "struggle") return false;   // (Taunt: attacks only; Assault Vest doesn't stop status moves here, the owner's rule)
    if (s.M.so && has(u, "THROAT")) return false;       // Throat Chop: no sound moves
    if (s.M.sp === "snore" && u.status !== "SLP") return false;   // Snore only works while asleep
    if (s.M.hf && has(u, "HEALBLOCK")) return false;    // Psychic Noise: no healing moves
    if (s.slot === 1) return true;
    if (s.M.sp === "lastresort" && lrBoost(u)) return true;   // (Last Resort under Encore or Disable: always ready)
    if (has(u, "DISABLE")) return false;
    return (u.cool[s.slot] || 0) === 0;
  }
  // ---------- the battle AI ----------
  // Every useful (move, target) pair is scored in one currency, a share of the other team's fighting strength:
  //  - damage counts by how dangerous the target is (how hard it hits our side, how often it moves), plus a knockout bonus
  //    that grows if the target hasn't moved yet (removing it before it acts saves that hit);
  //  - teamwork: if the Pokémon on our side that move before the target's next turn can finish it together with this hit,
  //    the hit earns a share of that knockout; if they would knock it out anyway, piling on is worth little;
  //  - status moves count by how dangerous the target is; heals by how much HP they restore and how close the Pokémon is to fainting.
  // Moves that would do nothing (heals at full HP, a status on a Pokémon that has one or is immune, a stat that can't go higher,
  // a move into an immunity) are only "harmless" fillers, and moves an Ability absorbs count against the AI.
  const OHKO = new Set(["fissure", "horndrill", "guillotine", "sheercold"]);
  const isDmgSkill = s => s.M.c !== "X";
  const harmless = -.05;
  const avgSpe = list => list.reduce((a, x) => a + statOf(x, "spe"), 0) / (list.length || 1);
  // a whole side still in the battle (field and bench): speed control is judged on both teams, not just who's out now
  const sideLeft = team => [...B.units.filter(x => x.alive && x.team === team), ...(B.bench[team] || []).filter(x => x.alive)];
  // tests only (cfg.legacyAI = "A" or "E"): that side plays by the AI's rules from before the absorb and switching fixes
  const legacy = u => !!cfg.legacyAI && u && u.team === cfg.legacyAI;
  // a team a person plays: you (team A, unless on Auto), and in an online battle the other player too (cfg.humans); picks: who
  // chooses its Pokémon after a faint or a pivot move on the picker (cfg.pick: you; an online battle: both)
  const humanT = t => !!(cfg.humans && cfg.humans.includes(t));
  const picks = t => t === "A" ? !!cfg.pick : humanT(t);
  // the AI's combo know-how (Protect or Substitute into Focus Punch, Endure into Reversal, Defense Curl into Rollout, Charge,
  // phazing into hazards, Weakness Policy, Rest's wake-up helpers); cfg.noCombo turns it off for one side in head-to-heads
  // what a hit that lands 2 rounds later is worth against one landing now (Future Sight, Doom Desire; tuned in head-to-heads)
  let FUTURE_WAIT = 1;
  // (cfg.comboKeys: only those pieces off, to measure each one: fp, endure, curl, charge, phaze, wp, rest, hex, screen, future)
  const combos = (u, key) => !legacy(u) && !(cfg.noCombo && u && u.team === cfg.noCombo && (!cfg.comboKeys || !key || cfg.comboKeys.includes(key)));
  let AI_ACTOR = null;   // the Pokémon whose move is being chosen: it knows whether it has been hit since its last turn
  const FP_SAFE = x => x && x.alive && !wasHit(x);
  // Focus Punch next turn: its share of the best target's HP if nothing hits it before then
  const fpNext = x => {
    return 0;   // (Focus Punch never loses its focus here, the owner's rule: nothing to cover)
    const s = x.skills.find(k => k.M.sp === "focuspunch"); if (!s || (x.cool[s.slot] || 0) > 1) return 0;
    let m = 0; for (const f of enemies(x)) if (f.alive) m = Math.max(m, Math.min(1, damageOf(x, f, s, { roll: .925 }).dmg * accOf(x, f, s) / Math.max(1, f.hp)));
    return m;
  };
  // a side with a phazer (Roar, Whirlwind, Dragon Tail, Circle Throw): its entry hazards hit every Pokémon it drags in, so they're
  // worth laying first (Hazard Phazing; cfg.comboKeys "phaze")
  const phazeSide = u => combos(u, "phaze") && sideLeft(u.team).some(x => x.skills.some(s => ["roar", "whirlwind", "dragontail"].includes(s.M.sp)));
  // what an entry hazard takes off a Pokémon of this team on the way in (the bench's average), for phazing
  const hazardChip = team => {
    const hz = B.hazards && B.hazards[team], bench = benchOf(team); if (!hz || !bench.length) return 0;
    return bench.reduce((a, x) => a + (pv(x, "MAGIC_GUARD") || item(x, "heavydutyboots") ? 0 : (hz.sr ? typeEff("Rock", x.types) / 8 : 0)
      + (grounded(x) ? [0, 1 / 8, 1 / 6, 1 / 4][hz.spikes || 0] + (hz.tspikes && !x.status && !x.types.includes("Poison") && !x.types.includes("Steel") ? .08 : 0) : 0)), 0) / bench.length;
  };
  const PHAZE_HIT = new Set(["whirlwind", "dragontail", "circlethrow"]);
  // how hard a Pokémon hits the other side: its best ready move's share of an opposing Pokémon's HP, times how often it moves.
  // `fast` (the Expert's look-ahead) uses its best attacking stat instead.
  function threatRaw(t, fast) {
    if (fast) return Math.max(statOf(t, "atk"), statOf(t, "spa")) * effSpd(t);
    const foes = enemies(t); if (!foes.length) return 0;
    let best = 0;
    for (const s of t.skills) {
      if (!isDmgSkill(s)) continue;
      let v = 0;
      for (const f of foes) { const d = Math.max(0, expectedDamage(t, f, s)) / f.max.hp; v = s.target === "aoe_enemies" ? v + Math.min(1, d) : Math.max(v, Math.min(1, d)); }
      best = Math.max(best, v * (skillReady(t, s) ? 1 : .6));
    }
    const support = t.skills.some(isHealSkill) || t.skills.some(s => s.M.ail === "SLP" || s.M.ail === "PAR") ? .08 : 0;
    return (best + support + .04) * effSpd(t);
  }
  // what hitting this target costs: contact Abilities and the Rocky Helmet, Cursed Body, Aftermath on a knockout, and
  // Abilities that power it up when hit (Justified, Weak Armor, Rattled). Small: they break ties between similar hits.
  function hitBack(u, f, s, kills) {
    const M = s.M, contact = M.ct && !item(u, "protectivepads") && !(item(u, "punchingglove") && M.pu), t = mtype(u, s);
    let c = 0;
    if (contact) {
      const ca = pv(f, "CONTACT"); if (ca && !u.status && !(ca.what === "INFAT" && has(u, "INFAT"))) c += .3 * .2;
      if (item(f, "rockyhelmet") && !pv(u, "MAGIC_GUARD")) c += .05;
      if (kills && pv(f, "AFTERMATH") && !pv(u, "MAGIC_GUARD")) c += .08;
    }
    if (pv(f, "CURSED") && !kills) c += .03;
    if (!kills && t === "Dark" && pv(f, "JUSTIFIED")) c += .06;
    if (!kills && M.c === "P" && pv(f, "WEAK_ARMOR")) c += .03;
    if (!kills && ["Bug", "Ghost", "Dark"].includes(t) && pv(f, "RATTLED")) c += .02;
    return c;
  }
  function aiPlan(u, style = "balanced", fast = false) {
    const prev = AI_ACTOR; AI_ACTOR = u;
    try { return aiPlan0(u, style, fast); } finally { AI_ACTOR = prev; }
  }
  function aiPlan0(u, style, fast) {
    const foes = targetable(u), al = allies(u), out = [];
    if (!foes.length) return [{ slot: 1, t: null, v: 0 }];
    const T = new Map(); let tsum = 0;
    for (const f of foes) { const r = threatRaw(f, fast); T.set(f, r); tsum += r; }
    const tavg = tsum / foes.length || 1;
    const tw = f => 1 - AIW.twMix + AIW.twMix * T.get(f) / tavg;   // how dangerous a foe is, against the average foe (1)
    const selfW = 1 - AIW.twMix + AIW.twMix * threatRaw(u, fast) / tavg;
    // who on our side moves before each foe's next turn, and what they could add to a knockout
    const order = fast ? null : predictOrder(B.units.filter(x => x.alive).length + 2);
    const bestHit = (a, f) => { let m = 0; for (const s of a.skills) if (isDmgSkill(s) && skillReady(a, s)) m = Math.max(m, expectedDamage(a, f, s)); return m; };
    const fuCache = new Map();
    const followUp = f => {
      if (!order) return 0;
      if (fuCache.has(f)) return fuCache.get(f);
      let sum = 0; const seen = new Set();
      for (const uid of order) { if (uid === f.uid) break; if (seen.has(uid)) continue; seen.add(uid); const a = B.byId(uid); if (a && a !== u && a.team === u.team) sum += bestHit(a, f); }
      fuCache.set(f, sum); return sum;
    };
    const hpEff = (s, f) => f.shield > 0 && !s.M.so && !pv(u, "INFILTRATOR") && !OHKO.has(s.M.sp) ? f.hp + f.shield : f.hp;
    function dmgValue(s, f, d) {
      if (d < 0) return { v: legacy(u) ? -.6 * tw(f) : -(AIW.absorbBase + AIW.absorbTw * tw(f)), kill: false };   // an Ability soaks it up: heals it a quarter or powers it up
      if (d <= 0) return { v: 0, kill: false };
      // the share of its remaining HP this takes, times how dangerous it is: hitting what's already hurt and hits hard
      // finishes the most dangerous Pokémon first (the order that loses the least HP over a battle)
      const hp = hpEff(s, f);
      let v = tw(f) * Math.min(1, d / Math.max(1, hp));
      const kill = d >= hp * .97 ? 1 : d >= hp * .8 ? .45 : 0;       // expected damage is an average: a near miss often still knocks out
      if (!kill && pv(f, "ANGER") && f.max.atk >= f.max.spa && f.stages.atk < 6) v *= s.hits ? .75 : .9;   // each hit angers it: +1 Attack
      if (kill) v += (AIW.killBase + AIW.killTw * tw(f) * (.4 + f.atb / 100)) * kill; // gone before it moves again
      else if (!fast) {
        const fu = followUp(f);
        if (fu >= hp) v *= AIW.fuOver;                                 // the Pokémon moving next finish it anyway
        else if (d + fu >= hp) v += tw(f) * AIW.fuSetup;               // together they knock it out before it moves
      }
      return { v, kill: kill === 1 };
    }
    const push = (s, t, v) => out.push({ slot: s.slot, t, v: v + R() * .01 });
    // a status move Magic Bounce or Magic Coat (up, or ready to go off by itself: the owner's rule, 2026-10-19) would send back
    const bounces = (f, M) => !!(M.ail || M.st) && (tab(u, f, "MAGIC_BOUNCE") || has(f, "MAGICCOAT") || !!reactReady(f, "magiccoat"));
    const cdCost = s => cdOf(u, s) * AIW.cd;
    for (const s1 of u.skills) {
      const s = s1.M.sp === "expandingforce" && inTerrain("psychic", u) ? { ...s1, target: "aoe_enemies" } : s1;   // (every foe in Psychic Terrain)
      if (!skillReady(u, s) || SELF_GOING.has(s.M.sp)) continue;   // (Shell Trap, the counters and the Conversions are never chosen: they go off by themselves)
      const M = s.M, sp = M.sp;
      if (SELF_KO.has(sp) && damp()) continue;
      if (sp === "splash") { push(s, null, harmless); continue; }
      if (sp === "metronome") { push(s, null, .25); continue; }
      if (isDmgSkill(s)) {
        // a Pledge after a teammate's different one becomes the 150-power combined move; Pollen Puff heals the partners too
        const lp = B.lastPledge, pledgeMul = PLEDGE[s.key] && lp && lp.team === u.team && lp.by !== u.uid && lp.key !== s.key && lp.turn > (u.actT == null ? -1 : u.actT) ? 1.8 : 1;
        const puff = sp === "pollenpuff" ? al.filter(g => g !== u).reduce((a, g) => { const miss = (g.max.hp - g.hp) / g.max.hp; if (miss < .25 || has(g, "HEALBLOCK")) return a; const hh = Math.min(miss, .5);
          return a + (.25 + .75 * threatRaw(g, fast) / tavg) * hh / (g.hp / g.max.hp + hh) * AIW.heal; }, 0) : 0;
        const adjust = (v, kills, dealt) => {
          v = v * pledgeMul + puff;
          if (SELF_KO.has(sp)) v -= selfW * (u.hp / u.max.hp) * 1.2 + .3;
          if (RAMPAGE.has(s.key) && !pv(u, "OWN_TEMPO") && !has(u, "CNF") && !inTerrain("misty", u)) v -= selfW * .1;   // (confused after it)
          if (M.dr < 0 && !pv(u, "ROCK_HEAD")) v -= selfW * Math.min(u.hp, dealt * -M.dr / 100) / u.max.hp * .8;
          if (M.dr > 0) v += .5 * selfW * Math.min(u.max.hp - u.hp, dealt * M.dr / 100) / u.max.hp;
          return v - cdCost(s);
        };
        // Future Sight and Doom Desire (the owner's rule: every Pokémon the other side has out takes it 2 rounds later): nothing lands
        // now, so no knockout to count (whoever is out then takes it: its share of their HP); and not while this user's last one is
        // still coming (it would fail). (No discount for the wait: the user keeps acting meanwhile and the hit lands even if it
        // faints; a third off lost 37-43 in 80 mirror battles, 2026-10-10)
        if (sp === "future" && combos(u, "future")) {
          if ((B.future || []).some(x => x.by === u.uid)) { push(s, null, harmless); continue; }
          let v = 0; for (const f of foes) { const d = expectedDamage(u, f, s); if (d > 0) v += tw(f) * Math.min(.95, d / Math.max(1, hpEff(s, f))); }
          if (s.M.t === "Psychic" && inTerrain("psychic", u)) v *= .25;   // (in Psychic Terrain the boosted Psychic attacks land now: the owner's rule)
          push(s, null, v > 0 ? v * FUTURE_WAIT - cdCost(s) : harmless); continue;
        }
        if (s.target === "aoe_enemies") {
          let v = 0, kills = 0, dealt = 0;
          for (const f of foes) { const d = expectedDamage(u, f, s), r = dmgValue(s, f, d); v += r.v; kills += r.kill ? 1 : 0; dealt += Math.max(0, d); }
          push(s, null, dealt <= 0 && v >= 0 ? harmless : adjust(v, kills, dealt));
        } else for (const f of foes) {
          const d = expectedDamage(u, f, s), r = dmgValue(s, f, d);
          let v = d === 0 ? harmless : adjust(r.v, r.kill, Math.max(0, d));   // an immunity: it would do nothing
          if ((sp === "pursuit" || sp === "upperhand") && !r.kill) v = harmless;   // (the owner's rule) kept ready for their trigger, used only for a knockout
          if (d > 0 && !r.kill) { const e = effOn(u, f, s); v *= e < 1 ? AIW.resist : e > 1 ? AIW.superEff : 1; }
          // added effects: a chance to burn, paralyze or freeze a Pokémon that has no status yet
          if (d > 0 && M.ail && M.ac && !f.status && MAJOR.includes(M.ail) && !(TYPE_IMMUNE[M.ail] && f.types.includes(TYPE_IMMUNE[M.ail]))) v += M.ac / 100 * .25 * tw(f);
          // a chance to flinch it: a flinch costs its next turn (the owner's rule, 2026-10-19), worth more the more dangerous it is
          if (d > 0 && !r.kill && combos(u, "flinch") && !f.flags.stun && !pv(f, "INNER_FOCUS") && !(f.shield > 0)) { const fl = flinchOf(u, s); if (fl) v += fl * AIW.flinch * tw(f); }
          if (d > 0 && !legacy(u)) v -= hitBack(u, f, s, r.kill);
          // a super-effective hit that leaves a Weakness Policy holder standing gives it +2 Attack and Sp. Atk
          if (d > 0 && !r.kill && combos(u, "wp") && item(f, "weaknesspolicy") && effOn(u, f, s) > 1) v -= .25 * tw(f);
          // a phazing attack drags in a Pokémon that takes the entry hazards on its side
          if (d > 0 && !r.kill && combos(u, "phaze") && PHAZE_HIT.has(sp)) v += hazardChip(f.team) * 1.2;
          push(s, f, v);
        }
        continue;
      }
      // status moves
      if (sp === "transform") { push(s, null, u.flags.transformed ? harmless : 1.2); continue; }
      if (s.target === "partners") {
        let v = 0;
        for (const g of al.filter(x => x !== u)) {
          const missing = (g.max.hp - g.hp) / g.max.hp; if (missing < .25) continue;
          const h = Math.min(missing, (M.hl || 50) / 100 * mastery(u, s)), hp = g.hp / g.max.hp;
          v += (.25 + .75 * threatRaw(g, fast) / tavg) * h / (hp + h) * AIW.heal;
        }
        push(s, null, v > 0 ? v : harmless); continue;
      }
      if (s.target === "ally_single" || isHealSkill(s)) {
        const cands = s.target === "ally_single" ? al : [u];
        for (const g of cands) {
          const missing = (g.max.hp - g.hp) / g.max.hp, tg = s.target === "ally_single" ? g : null;
          if (sp === "rest" && (inTerrain("electric", g) || inTerrain("misty", g))) { push(s, tg, harmless); continue; }
          if (sp === "rest") {
            const danger = !fast && foes.reduce((a, f) => a + bestHit(f, g), 0) >= g.hp;
            const cure = g.status && g.status !== "SLP" ? .2 : 0;
            const sh = pv(g, "SHED"), wake = !combos(g, "rest") ? 1 : item(g, "chestoberry") || item(g, "lumberry") ? 0 : sh && (!sh.w || inWeather(sh.w)) ? 1 - sh.chance : pv(g, "EARLY_BIRD") ? .5 : 1;
            const snore = combos(g, "rest") && g.skills.some(x => x.M.sp === "snore") ? .5 : 1;
            const v = missing * .9 * selfW * (danger ? 1.3 : .8) + cure - .25 * wake * snore;    // minus the two turns spent asleep (or fewer)
            push(s, null, missing >= .5 || cure ? v : harmless); continue;
          }
          if (isHealSkill(s)) {
            if (missing < .25) { push(s, tg, harmless); continue; }
            // the share of its life it gets back, weighted like damage: by how much this Pokémon matters
            const h = Math.min(missing, (M.hl || 50) / 100 * mastery(u, s)), hp = g.hp / g.max.hp;
            const danger = !fast && foes.reduce((a, f) => a + bestHit(f, g), 0) >= g.hp ? 1.5 : 1;   // could faint before it moves again
            const gw = g === u ? selfW : .25 + .75 * threatRaw(g, fast) / tavg;
            push(s, tg, gw * h / (hp + h) * AIW.heal * danger);
          } else { const v = statusValue(u, s, g); push(s, tg, v > 0 ? v : harmless); }
        }
        continue;
      }
      if (s.target === "enemy") {
        for (const f of foes) {
          let v = statusValue(u, s, f);
          if (has(f, "PROTECT") && !ATTACK_ONLY.has(effOf(f, "PROTECT").shield)) v = -1;   // (Protect, Detect, Spiky Shield and Baneful Bunker stop status moves too)
          if (bounces(f, M)) v = -1;   // (it would come back at the user)
          if (v > 0) { v *= tw(f) * AIW.status; if (!fast && followUp(f) >= f.hp) v *= .2; }   // no need to put to sleep what is about to faint
          push(s, f, v > 0 ? v : harmless);
        }
        continue;
      }
      if (s.target === "aoe_enemies") { const v = foes.reduce((a, x) => a + (bounces(x, M) ? 0 : Math.max(0, statusValue(u, s, x)) * tw(x)), 0); push(s, null, v > 0 ? v : harmless); continue; }
      // self and team: stat boosts, screens, Mist, Focus Energy, Substitute, Haze
      let v = statusValue(u, s, u);
      if (v > 0 && M.st && M.sw === "self") {
        // boosts pay off over several turns: worth less when the battle is nearly over
        const left = foes.reduce((a, f) => a + f.hp / f.max.hp, 0);
        v *= Math.min(1, .35 + left * .3);
        if (M.st.every(([k, n]) => { const t = u.stages[k] + fixedStage(u, k); return n > 0 ? t >= 6 : t <= -6; })) v = harmless;
      }
      push(s, null, v > .01 ? v : harmless);
    }
    // tactics: Aggressive leans on damage, Careful on healing, screens and boosts
    if (style === "aggressive" || style === "safe") for (const c of out) {
      const s = u.skills.find(x => x.slot === c.slot), dmg = isDmgSkill(s);
      if (c.v > 0) c.v *= style === "aggressive" ? (dmg ? 1.2 : .8) : (dmg ? .95 : 1.3);
    }
    if (!out.length) out.push({ slot: 1, t: null, v: 0 });
    return out.sort((a, b) => b.v - a.v);
  }
  function defaultTarget(u, sk) {
    if (sk.target === "ally_single") return allies(u).sort((a, b) => a.hp / a.max.hp - b.hp / b.max.hp)[0];
    const c = aiPlan(u, "balanced", true).find(x => x.slot === sk.slot && x.t);
    return (c && c.t) || targetable(u)[0];
  }
  // ---------- who comes in: sizing up a matchup ----------
  // how a Pokémon would do against the other side's Pokémon on the field: its best hit's share of each one's HP against their
  // best hit's share of its own (moving first helps both ways), plus a little for its own HP left
  function matchup(x, foes) {
    if (!foes.length) return x.hp / x.max.hp;
    let v = 0;
    for (const f of foes) {
      let give = 0, take = 0;
      for (const s of x.skills) if (isDmgSkill(s)) give = Math.max(give, expectedDamage(x, f, s));
      for (const s of f.skills) if (isDmgSkill(s)) take = Math.max(take, expectedDamage(f, x, s));
      const first = effSpd(x) > effSpd(f);
      v += Math.min(1.2, give / Math.max(1, f.hp)) * (first ? 1.15 : 1) - Math.min(1.2, take / Math.max(1, x.hp)) * (first ? .9 : 1.1);
    }
    return v / foes.length + .25 * x.hp / x.max.hp - (x.status ? .1 : 0);
  }
  const fieldFoes = team => B.units.filter(f => f.team !== team && f.alive);
  // a trainer's pick for an empty place: whoever on the bench matches up best against what's on the field
  function aiReplacement(team, slot) {
    const foes = fieldFoes(team); let b = benchOf(team);
    if (!b.length) return null;
    // a Trainer's backup setter (the owner's rule) waits while its team's field is up; it comes in once it's gone (faded, replaced,
    // Trick Room over), or when nobody else is left
    const go = b.filter(x => !(x.backup && fieldUp(x))); if (go.length) b = go;
    const ranked = b.map(x => [x, matchup(x, foes) + (legacy(x) ? 0 : planPick(x, team)) + R() * .01]).sort((a, c) => c[1] - a[1]), top = ranked[0][0];
    // (the Expert AI plays its best few out on copies of the battle first, like a switch: aiSwitch; the backup setter's rule stays)
    if (slot == null || cfg.from || cfg.probe || ranked.length < 2 || legacy(top) || !combos(top, "replace") || (team === "A" ? B.aiStyle : B.enemyStyle) !== "expert" || top.backup) return top;
    const opts = ranked.slice(0, AISW.repCands).map(([x]) => x).filter(x => !x.backup);
    const k = lookPick(team, opts.map(x => C => C.sendInNow(team, slot, x.uid)), AISW.repMargin);
    return opts[k] || top;
  }
  // what a setter brings onto the field (its weather or terrain Ability, a weather or terrain move, Trick Room), and whether it's up
  function fieldOf(x) {
    const p = x.passives.find(p => p.id === "DROUGHT" || p.id === "SURGE");
    if (p) return p.id === "DROUGHT" ? { w: p.w || "sun" } : { t: p.t };
    for (const s of x.skills) {
      if (WX_MOVE[s.M.sp]) return { w: WX_MOVE[s.M.sp] };
      if (s.M.sp === "terrain" && TERRAIN_MOVE[s.key]) return { t: TERRAIN_MOVE[s.key] };
      if (s.M.sp === "trickroom") return { tr: 1 };
    }
    return null;
  }
  const fieldUp = x => { const f = fieldOf(x); return !!f && (f.w ? B.weather === f.w : f.t ? !!(B.terrain && B.terrain.t === f.t) : B.trickRoom > B.turn); };
  // the team's plan in that pick (the backup setters an archetype keeps on the bench): a weather Ability brings its weather back
  // once it's gone (a weather that's up keeps its rounds, so not while it lasts), and a Trick Room setter, which sets the room up as
  // it comes in, comes in for a slower side while the room is down, never while it's up (its room would end the one there)
  function planPick(x, team) {
    let v = 0;
    if (x.backup && fieldOf(x) && !fieldUp(x)) v += 2;   // (the backup setter: first in once its field is down)
    const wp = x.passives.find(p => p.id === "DROUGHT"), w = wp && (wp.w || "sun");
    if (w && B.weather !== w && !B.units.some(u => u.alive && pv(u, "CLOUD"))) v += .6;
    if (x.skills.some(s => s.M.sp === "trickroom" && skillReady(x, s))) {
      const slower = avgSpe(sideLeft(team)) < avgSpe(sideLeft(team === "A" ? "E" : "A"));
      v += B.trickRoom > B.turn ? (slower ? -1 : .3) : (slower ? .6 : 0);
    }
    return v;
  }
  // switching out: only when this Pokémon loses its matchup badly, its best move isn't worth much, and someone on the
  // bench wins the matchup by a clear margin. Never right after coming in (no ping-pong), never a boss or a wild Pokémon.
  // Also when it's stuck: nothing it can do is worth anything (its attacks are absorbed, can't land or barely scratch) and
  // anyone on the bench does better; or its best move is weak and the bench has a much better matchup (a Ground type for the
  // Jolteon its Electric moves feed).
  // (A Pokémon that just came in stays a turn, so nobody ping-pongs; but not one that's stuck, like a lead whose every attack
  // the other side soaks up. And whoever comes in must be able to hurt something out there.)
  // A Trainer's Follow Me, Rage Powder or Spotlight user never switches out by choice: it's there to stay and draw the attacks; and
  // their backup setter only comes in for a Pokémon that fainted, once the team's field is down (the owner's rules, 2026-10-15)
  const REDIRECTS = new Set(["followme", "spotlight"]);
  // (the old way, still the legacy AI's: switchPlan below weighs a switch on copies of the battle)
  function aiSwitchOld(u, bestV) {
    const stuck = !legacy(u) && bestV <= AIW.swStuckV;
    if ((u.fresh && !stuck) || u.boss || (B.wild && u.team === "E") || !canSwitch(u)) return null;
    if (u.npc && u.skills.some(s => REDIRECTS.has(s.M.sp))) return null;
    const foes = fieldFoes(u.team); if (!foes.length) return null;
    const cur = matchup(u, foes);
    let bar;
    if (legacy(u)) { if (cur > -.2 || bestV > .5) return null; bar = cur + .5; }
    else if (stuck) bar = cur + AIW.swStuck;
    else if (bestV < AIW.swWeakV) bar = cur + AIW.swWeak;
    else if (cur <= -.2 && bestV <= .5) bar = cur + .5;
    else return null;
    // an opposing Pursuit ready to strike makes leaving costlier
    if (!legacy(u) && foes.some(f => !f.flags.semi && f.skills.some(s => s.M.sp === "pursuit" && skillReady(f, s)))) bar += .3;
    const hurts = y => legacy(u) || y.skills.some(s => isDmgSkill(s) && foes.some(f => expectedDamage(y, f, s) > 0));
    let x = null;
    for (const y of benchOf(u.team)) { if (y.backup || !hurts(y)) continue; const m = matchup(y, foes); if (m > bar) { bar = m; x = y; } }
    return x;
  }
  // switching out (the owner's ask, 2026-10-19: weigh everything before committing to a switch). A Pokémon that comes in on a switch
  // has no protection and an empty turn meter, so every opposing Pokémon can hit it before it moves, and the switch costs the turn;
  // one that comes in after a faint is protected until its first turn. So letting a worn-down Pokémon take its last turn and faint
  // is often better than pulling it out. The decision is played out on copies of the battle with the same dice, about a round
  // each: staying (its best move) against switching to each of the two bench Pokémon that match up best. The engine does the rest:
  // damage, speed and Trick Room, Abilities, held items, the weather, terrain and screens, entry hazards and entry effects
  // (Intimidate, a setter's move), Pursuit, the protected replacement after a faint. Then it compares what's left: every
  // Pokémon's HP and whether it's still standing (a Pokémon still standing is worth a turn later), status conditions and the stat
  // stages of those on the field. A switch has to come out ahead by a margin. It's only played out when one could pay: this one is
  // stuck, its best move is weak or its matchup is bad, or someone on the bench matches up much better. Never right after coming in
  // (unless stuck), never a boss or a wild Pokémon, never a Trainer's Follow Me user or backup setter (the owner's rules).
  // A switch by choice is rated very low (the owner's rule, 2026-10-20): this is three on three with a turn meter, not singles, so
  // the Pokémon that comes in starts with an empty meter and all three opposing Pokémon move before it does, and the switch costs
  // the turn. So one at half its HP or less never switches out (it takes its last turns: the one that replaces it after it faints
  // comes in protected), and otherwise a switch has to come out ahead by half a healthy Pokémon's worth (AISW.margin; the combo
  // key "stay" off: the old way, AISW.margin0, for head-to-heads)
  function swValue(C, team) {
    let v = 0; const owed = combos({ team }, "owed");
    for (const x of [...C.units, ...C.bench.A, ...C.bench.E]) {
      if (!x.alive) continue;
      let w = AISW.alive + x.hp / x.max.hp - (x.status ? AISW.status : 0);
      if (C.units.includes(x)) for (const k of ["atk", "def", "spa", "sdf", "spe"]) w += AISW.stage * (x.stages[k] || 0);
      // (a replacement still protected when the copy ends: its first turn is guaranteed, so it counts, worth the share of an
      // opposing Pokémon's HP its best ready attack would take; the owner's ask, 2026-10-19)
      if (owed && C.units.includes(x) && x.eff.some(e => e.id === "PROTECT" && e.shield === "replace")) w += AISW.owed * owedHit(C, x);
      v += x.team === team ? w : -w;
    }
    if (C.over && C.result) v += C.result.win === (team === "A") ? 20 : -20;
    return v;
  }
  // the share of an opposing Pokémon's HP (the most it can take from one on the field) a Pokémon's best ready attack would take
  function owedHit(C, x) {
    let best = 0;
    for (const f of C.units) {
      if (!f.alive || f.team === x.team) continue;
      for (const s of x.skills) if (s.M.c !== "X" && !(x.cool[s.slot] > 0)) best = Math.max(best, Math.min(1, Math.max(0, C.estimate(x, f, s)) / Math.max(1, f.hp)));
    }
    return best;
  }
  // one decision played out on copies of the battle, the same dice for each option: then about a round (every Pokémon on the field
  // moving once, and two more turns), two for the Expert AI
  function lookRoll(team, decide, seeds, each) {
    let sum = 0; const real = R;
    try {
      for (const sd of seeds) {
        R = seeded(sd);
        const C = makeBattle({ from: B, waves: B.waves, allies: [], turnLimit: cfg.turnLimit, legacyAI: cfg.legacyAI });
        decide(C); C.ev.length = 0;
        const H = ((team === "A" ? B.aiStyle : B.enemyStyle) === "expert" ? AISW.roundsX : AISW.rounds0) * C.units.filter(x => x.alive).length + 2;
        for (let turns = 0, n = 0; turns < H && n < 3 * H && !C.over; n++) {
          const r = C.step(); if (r === "input") C.autoAct();
          if (C.ev.some(e => e.k === "turn")) turns++; C.ev.length = 0;
        }
        const v = swValue(C, team); sum += v; if (each) each.push(v);
      }
    } finally { R = real; }
    return sum / seeds.length;
  }
  // the option to take among several played out (the first: the one taken unless another is clearly better): in batches of AISW.k
  // copies, the same dice for every option, another is taken only when it's ahead of the first by the margin even allowing for the
  // dice (its average gain less one standard error); one that can't get there is dropped; at most AISW.rounds batches
  function lookPick(team, opts, margin, look) {
    const s0 = Math.floor(Math.random() * 1e9);
    const est = c => { const k = c.d.length, m = c.d.reduce((a, x) => a + x, 0) / k, sd = Math.sqrt(c.d.reduce((a, x) => a + (x - m) ** 2, 0) / Math.max(1, k - 1)); return { m, se: sd / Math.sqrt(k) }; };
    let left = opts.slice(1).map((f, i) => ({ i: i + 1, f, d: [] })), best = 0;
    for (let r = 0; r < AISW.rounds && left.length && !best; r++) {
      const seeds = [...Array(AISW.k)].map((_, i) => s0 + (r * AISW.k + i) * 7919), st = [];
      lookRoll(team, opts[0], seeds, st); if (look) (look[0] = look[0] || []).push(...st);
      for (const c of left) { const e = []; lookRoll(team, c.f, seeds, e); e.forEach((v, j) => c.d.push(v - st[j])); if (look) (look[c.i] = look[c.i] || []).push(...e); }
      for (const c of left) Object.assign(c, est(c));
      left = left.filter(c => c.m + c.se > margin).sort((a, b) => (b.m - b.se) - (a.m - a.se));
      if (left.length && left[0].m - left[0].se > margin) best = left[0].i;
    }
    return best;
  }
  function aiSwitch(u, bestV, ch) {
    if (legacy(u) || !combos(u, "switch") || !ch) return aiSwitchOld(u, bestV);
    const stuck = bestV <= AIW.swStuckV;
    if ((u.fresh && !stuck) || u.boss || (B.wild && u.team === "E") || !canSwitch(u)) return null;
    if (u.npc && u.skills.some(s => REDIRECTS.has(s.M.sp))) return null;
    const stay = combos(u, "stay");
    if (stay && u.hp <= AISW.low * u.max.hp) return null;
    const foes = fieldFoes(u.team); if (!foes.length) return null;
    const hurts = y => y.skills.some(s => isDmgSkill(s) && foes.some(f => expectedDamage(y, f, s) > 0));
    const cur = matchup(u, foes);
    const cands = benchOf(u.team).filter(y => !y.backup && hurts(y)).map(y => [y, matchup(y, foes)]).filter(c => c[1] > cur).sort((a, b) => b[1] - a[1]).slice(0, AISW.cands);
    if (!cands.length) return null;
    if (!stuck && bestV >= AIW.swWeakV && cur > -.2 && cands[0][1] - cur < AISW.better) return null;   // (nothing to gain: no need to play it out)
    const mine = C => { const cu = C.byId(u.uid); C.waiting = cu; C.actor = cu; return cu; };
    const look = cfg.onSwitchLook ? [] : null;   // (tests: each copy's value, per option)
    const k = lookPick(u.team, [C => { mine(C); C.playerAct(ch.slot, ch.t ? C.byId(ch.t.uid) : null); }, ...cands.map(([y]) => C => { mine(C); C.playerSwitch(y.uid); })], stay ? AISW.margin : AISW.margin0, look);
    const best = k ? cands[k - 1][0] : null;
    if (look) { const avg = a => a ? a.reduce((x, y) => x + y, 0) / a.length : 0; cfg.onSwitchLook(u, { stay: avg(look[0]), tried: cands.map(([y], i) => [y.n, avg(look[i + 1])]), best: best && best.n, bestV, stuck, cur }); }
    return best;
  }
  function aiChoose(u, style = "balanced") {
    const rd = redirectNow(u); if (rd) return rd;
    let ch;
    if (style === "expert") ch = expertChoose(u);
    else { const best = aiPlan(u, style === "rollout" ? "balanced" : style, style === "rollout")[0]; ch = { slot: best.slot, t: best.t, v: best.v }; }
    if (style !== "rollout") { const x = aiSwitch(u, ch.v, ch); if (x) return { sw: x }; }
    return ch;
  }

  // ---------- Expert: the best few plans, each played out on copies of the battle ----------
  function expertValue(C, team) {
    let v = 0;
    const val = x => x.alive ? 1 + x.hp / x.max.hp + Math.min(.3, x.shield / x.max.hp) + (x.status ? -.15 : 0) : 0;
    for (const x of [...C.units, ...C.bench.A, ...C.bench.E]) v += x.team === team ? 1.3 * val(x) : -val(x);
    if (C.over) v += C.result.win === (team === "A") ? 40 : -40;
    return v;
  }
  // the contenders come from the plan (useless moves never get this far); each is played out against the same dice rolls,
  // with both sides using the plan's quick version, and its plan score is added so one lucky rollout can't pick a bad move
  function expertChoose(u) {
    const plan = aiPlan(u, "balanced", false), top = plan[0];
    const cands = plan.filter((c, i) => i < 4 && c.v > 0 && c.v >= top.v * .55);
    if (cands.length <= 1) return { slot: top.slot, t: top.t, v: top.v };
    const K = Math.max(6, Math.floor(60 / cands.length)), seed0 = Math.floor(Math.random() * 1e9), real = R;
    let best = cands[0], bs = -Infinity;
    try {
      for (const c of cands) {
        let sum = 0;
        for (let k = 0; k < K; k++) {
          R = seeded(seed0 + k * 7919);
          const C = makeBattle({ from: B, waves: B.waves, allies: [], turnLimit: cfg.turnLimit, legacyAI: cfg.legacyAI }), cu = C.byId(u.uid);
          C.waiting = cu; C.actor = cu;
          C.playerAct(c.slot, c.t ? C.byId(c.t.uid) : null); C.ev.length = 0;
          for (let n = 0; n < 20 && !C.over; n++) { const r = C.step(); if (r === "input") C.autoAct(); C.ev.length = 0; }
          sum += expertValue(C, u.team);
        }
        const sc = sum / K + 2 * c.v;
        if (sc > bs) { bs = sc; best = c; }
      }
    } finally { R = real; }
    return { slot: best.slot, t: best.t, v: best.v };
  }

  // ---------- turn flow ----------
  function advance() {
    // an extra turn (Quick Claw, Quick Draw) or a Custap Berry's: that Pokémon goes next, before the meters move on (the owner's rules,
    // 2026-10-18; B.nextQ, oldest first)
    while (B.nextQ && B.nextQ.length) { const n = B.byId(B.nextQ.shift()); if (n && n.alive && B.units.includes(n)) { n.atb = 100; return n; } }
    const al = B.units.filter(x => x.alive);
    let best = null, bt = Infinity;
    for (const u of al) { const t = (100 - u.atb) / effSpd(u); if (t < bt) { bt = t; best = u; } }
    for (const u of al) u.atb = clamp(u.atb + effSpd(u) * bt, 0, 100);
    best.atb = 100;
    return best;
  }
  function predictOrder(n) {
    const snap = B.units.filter(x => x.alive).map(u => ({ u, atb: u.atb, spd: effSpd(u) })), out = [];
    for (const id of B.nextQ || []) if (out.length < n && snap.some(s => s.u.uid === id)) out.push(id);   // (queued extra turns first)
    for (let i = 0; i < n && snap.length; i++) {
      const nx = snap.reduce((a, b) => (100 - b.atb) / b.spd < (100 - a.atb) / a.spd ? b : a);
      const dt = Math.max(0, (100 - nx.atb) / nx.spd);
      for (const s of snap) s.atb = clamp(s.atb + s.spd * dt, 0, 100);
      nx.atb = 0; out.push(nx.u.uid);
    }
    return out;
  }
  function endTurn(u) {
    releaseKO(); B.koOn = false;   // (the move is done: its knockouts first)
    syncFx();   // (fixed stages its move changed: the weather, a status, an item lost...)
    if (u.flags.cud) { if (u.flags.cud.skip) u.flags.cud.skip = false; else { const k = u.flags.cud.key; u.flags.cud = null; if (u.alive && pv(u, "CUD_CHEW") && B.units.includes(u)) eatAgain(u, k); } }   // (Cud Chew: the end of its next turn)
    if (u.alive && pv(u, "HUNGER") && B.units.includes(u)) { u.flags.hangry = !u.flags.hangry; msg(u.flags.hangry ? `${Nm(u)} got hangry!` : `${Nm(u)} is full again!`); }   // Hunger Switch
    if (u.alive && !u.fresh && B.units.includes(u)) {
      if (pv(u, "SPEED_BOOST")) stage(u, u, "spe", 1, "Speed Boost");
      if (pv(u, "MOODY")) {
        const up = ["atk", "def", "spa", "sdf", "spe"].filter(x => u.stages[x] < 6), s1 = up.length ? pick(up) : null;
        if (s1) stage(u, u, s1, 2, "Moody"); const dn = ["atk", "def", "spa", "sdf", "spe"].filter(x => x !== s1 && u.stages[x] > -6); if (dn.length) stage(u, u, pick(dn), -1, "Moody");
      }
      if (pv(u, "BAD_DREAMS")) for (const f of enemies(u)) if (f.alive && f.status === "SLP" && !pv(f, "MAGIC_GUARD")) chip(f, hpBase(f) / 8, `${Nm(f)} is tormented by ${nm(u)}'s Bad Dreams!`);
    }
    if (u.flags.slowStart > 0 && !u.fresh) { u.flags.slowStart--; if (!u.flags.slowStart && pv(u, "SLOW_START")) msg(`${Nm(u)} finally got its act together! Its stats rose sharply!`); }
    if (u.alive && B.units.includes(u)) formCheck(u);   // (Zen Mode checks at the end of each turn too)
    // Quick Draw (30%) and the Quick Claw (20%): after its turn, a chance to move again at once (the owner's rules, 2026-10-18)
    if (u.alive && B.units.includes(u) && !(B.nextQ || []).includes(u.uid)) {
      const why = u.passives.some(p => p.key === "quick-draw") && R() < .3 ? "Quick Draw" : item(u, "quickclaw") && R() < .2 ? "Quick Claw" : null;
      if (why) { (B.nextQ = B.nextQ || []).push(u.uid); msg(`${Nm(u)}'s ${why} let it move again!`); fxEv(u); }
    }
    u.fresh = false; u.actT = B.turn;
    if (u.alive) {
      let changed = false;
      for (const e of u.eff) { if (e.skip) e.skip = false; else if (e.turns < 90) { e.turns--; changed = true; } }
      const gone = u.eff.filter(e => e.turns <= 0);
      for (const e of gone) {
        if (TEAM_FX[e.id]) { const k = `${u.team}:${e.id}:${B.turn}`; if (!B.offSaid) B.offSaid = new Set(); if (!B.offSaid.has(k)) { B.offSaid.add(k); msg(screenEnd(e.id, u.team)); } }
        else if (e.id === "TRAP") msg(`${Nm(u)} was freed from Bind!`);
        else if (e.id === "DISABLE") msg(`${Nm(u)}'s moves are no longer disabled!`);
        else if (e.id === "CNF") msg(`${Nm(u)} snapped out of its confusion!`);
        else if (e.id === "YAWN") tryStatus(null, u, "SLP", true);
        else if (e.id === "WISH" && e.amt) heal(u, e.amt, `${Nm(u)}'s wish came true!`);
        else if (e.id === "TAUNT") msg(`${Nm(u)} shook off the taunt!`);
        else if (e.id === "HEALBLOCK") msg(psT("healblock", "end", { POKEMON: nm(u) }));
        else if (e.id === "MAGNETRISE") msg(psT("magnetrise", "end", { POKEMON: nm(u) }));
        else if (e.id === "PERISH" && u.alive) { msg(`${Nm(u)}'s perish count fell to 0.`); u.hp = 0; ev({ k: "dmg", u: u.uid, n: 0, hp: 0, sh: 0, dot: 1 }); kill(u, null); }
      }
      u.eff = u.eff.filter(e => e.turns > 0);
      const per = effOf(u, "PERISH"); if (per && changed && u.alive) msg(`${Nm(u)}'s perish count fell to ${per.turns}.`);
      if (changed && gone.length) fxEv(u);
    }
    checkOver();
  }
  function checkOver() {
    B.actor = null; B.waiting = null;
    const a = aliveCount("A"), f = aliveCount("E");
    if (!a) { B.over = true; B.result = { win: false, alive: 0, turns: B.allyTurns }; }
    else if (!f && B.waveByWave && B.wave < B.waves.length - 1) nextWave();
    else if (!f) { B.over = true; B.result = { win: true, alive: a, lost: B.allyCount - a, turns: B.allyTurns }; }
    // timed fights (Raid Battles): your team withdraws when its turns run out
    if (!B.over && cfg.turnLimit && B.allyTurns >= cfg.turnLimit) { B.over = true; B.result = { win: false, timeUp: true, alive: a, turns: B.allyTurns }; }
    // a battle nobody can win (say, Water moves into Water Absorb) ends in a draw instead of going on forever
    if (!B.over && B.turn >= STALEMATE_TURNS) { B.over = true; B.result = { win: false, stalemate: true, alive: a, turns: B.allyTurns }; msg("The battle went on so long that both sides called it a draw!"); }
  }
  // the next wave of a normal stage, once this one is beaten: a new battle (the owner's rule, 2026-10-15). Your Pokémon keep their HP
  // (and a status, as between battles in the games); their cooldowns, used-up held items, stat stages and effects start over, and so
  // does the field (the stage's own weather, no terrain, rooms, screens or hazards). Then the new wave's leads and yours come in on
  // entry, the fastest first, as at the start
  function nextWave() {
    B.wave++;
    for (const u of B.units.filter(x => x.team === "E")) { B.units.splice(B.units.indexOf(u), 1); B.gone.push(u); ev({ k: "clear", u: u.uid }); }
    for (const u of [...B.units.filter(x => x.team === "A"), ...B.bench.A]) {
      if (u.orig) untransform(u, false);
      u.cool = { 1: 0, 2: 0, 3: 0 }; u.stages = newStages(); u.eff = []; u.shield = 0; u.aura = null; u.held = u.held0 !== undefined ? u.held0 : u.held;
      Object.assign(u.flags, { itemUsed: false, ateBerry: false, booster: false, bide: null, stock: 0, noAbility: false, wasOut: false, stun: false });
      if (u.status === "TOX") u.sTurn = 1;
      u.atb = R() * 10;
    }
    if (B.weather !== B.wx0) { B.weather = B.wx0; ev({ k: "weather", w: B.weather }); }
    B.baseWx = B.wx0; B.wxEnd = 0; B.terrain = null; B.trickRoom = 0; B.tailwind = null;
    for (const k of ["gravity", "wonderRoom", "magicRoom", "fairyLock", "mudSport", "waterSport", "ionDeluge"]) B[k] = 0;
    ev({ k: "terrain", t: null, tr: 0 });
    B.side = { A: {}, E: {} }; B.hazards = null; hzEv("A"); hzEv("E");
    msg(B.wild ? "More wild Pokémon appeared!" : `${sideName("E")} is ready for round ${B.wave + 1}!`);
    const foes = clause(B.waves[B.wave].slice(0, cap), "E").map((s, i) => buildUnit(s, "E", i < lead ? i : -1));
    const first = foes.slice(0, lead); B.bench.E = foes.slice(lead);
    for (const x of first) { x.atb = R() * 10; B.units.push(x); if (!B.sim) dexSee(x.key); msg(B.wild ? `A wild ${x.n} appeared!` : `${sideName("E")} sent out ${x.n}!`); ev({ k: "sendin", u: x.uid, team: "E", slot: x.slot }); }
    for (const u of B.units) if (u.alive) fxEv(u);
    B.perNow = Math.max(2, B.units.filter(x => x.alive).length);
    startEffects(B.units.filter(x => x.alive).map(u => [u, statOf(u, "spe") + R() * .01]).sort((a, b) => b[1] - a[1]).map(x => x[0]));
  }
  // start-of-turn upkeep: weather, poison, burns, seeds, binding, items. Returns false if it fainted.
  function upkeep(u) {
    const H = hpBase(u);
    if (inWeather("sand") && !u.types.some(t => ["Rock", "Ground", "Steel"].includes(t)) && !(weatherProof(u, "sand") || pv(u, "OVERCOAT") || pv(u, "SAND_FORCE") || item(u, "safetygoggles"))) chip(u, H / 16, `${Nm(u)} is buffeted by the sandstorm!`);
    if (u.alive && inWeather("hail") && !u.types.includes("Ice") && !(weatherProof(u, "hail") || pv(u, "OVERCOAT") || item(u, "safetygoggles"))) chip(u, H / 16, `${Nm(u)} is buffeted by the hail!`);
    if (u.alive && has(u, "CURSE")) chip(u, H / 4, `${Nm(u)} is afflicted by the curse!`);
    if (u.alive && has(u, "NIGHTMARE")) { if (u.status === "SLP") chip(u, H / 4, `${Nm(u)} is locked in a nightmare!`); else removeEff(u, "NIGHTMARE"); }
    const oc = u.alive && effOf(u, "OCTOLOCK"); if (oc) { const by = B.byId(oc.src); if (by && by.alive && B.units.includes(by)) { stage(by, u, "def", -1); stage(by, u, "sdf", -1); } else removeEff(u, "OCTOLOCK"); }
    if (u.alive && pledgeOn(u.team, "fire") && !u.types.includes("Fire")) chip(u, H / 8, psT("firepledge", "damage", { POKEMON: nm(u) }));
    if (u.alive && u.status === "BRN") chip(u, H / 16 * ((pv(u, "RESIST") || {}).burn || 1), `${Nm(u)} was hurt by its burn!`);
    if (u.alive && (u.status === "PSN" || u.status === "TOX") && pv(u, "POISON_HEAL")) { if (u.hp < u.max.hp) heal(u, H / 8, `${Nm(u)} restored HP with its Poison Heal.`); }
    else {
      const tb = pv(u, "TOXIC_BOOST");   // (Toxic Boost, the owner's rule: no damage from poison)
      if (u.alive && u.status === "PSN" && !tb) chip(u, H / 8, `${Nm(u)} was hurt by poison!`);
      if (u.alive && u.status === "TOX") { if (!tb) chip(u, H / 16 * u.sTurn, `${Nm(u)} was hurt by poison!`); u.sTurn = Math.min(15, u.sTurn + 1); }
    }
    const seed = effOf(u, "SEED");
    if (u.alive && seed && !pv(u, "MAGIC_GUARD")) {
      const src = B.units.find(x => x.uid === seed.src), n = Math.max(1, Math.floor(H / 8));
      chip(u, n, `${Nm(u)}'s health is sapped by Leech Seed!`);
      if (src && src.alive) { if (pv(u, "OOZE")) chip(src, n); else heal(src, n * (item(src, "bigroot") ? 1.3 : 1)); }
    }
    if (u.alive && has(u, "TRAP")) { const by = B.byId(effOf(u, "TRAP").src); chip(u, H / (by && item(by, "bindingband") ? 6 : 8), `${Nm(u)} is hurt by Bind!`); }
    if (u.alive && item(u, "blacksludge")) { if (u.types.includes("Poison")) { if (u.hp < H) heal(u, H / 16, `${Nm(u)} restored a little HP using its Black Sludge!`); } else chip(u, H / 8, `${Nm(u)} is hurt by its Black Sludge!`); }
    if (u.alive && item(u, "stickybarb")) chip(u, H / 8, `${Nm(u)} is hurt by its Sticky Barb!`);
    if (!u.alive) return false;
    const wh = pv(u, "WHEAL"); if (wh && abWeather(wh.w)) heal(u, H / 16, `${Nm(u)} restored HP with its ${u.passives[0].name}.`);
    // Dry Skin: 1/8 back every turn in rain, 1/8 lost every turn in harsh sunlight
    if (u.alive && has(u, "SALTCURE")) chip(u, H / (u.types.includes("Water") || u.types.includes("Steel") ? 4 : 8), `${Nm(u)} is hurt by Salt Cure!`);
    const dsk = pv(u, "ABSORB"); if (u.alive && dsk && dsk.dry) { if (inWeather("rain")) heal(u, H / 8, `${Nm(u)} restored HP with its Dry Skin.`); else if (inWeather("sun")) chip(u, H / 8, `${Nm(u)} was hurt by its Dry Skin!`); }
    if (pv(u, "SOLAR") && inWeather("sun")) chip(u, H / 8);
    if (u.alive && item(u, "leftovers") && u.hp < H) heal(u, H / 16, `${Nm(u)} restored a little HP using its Leftovers!`);
    const root = item(u, "bigroot") ? 1.3 : 1;
    if (u.alive && has(u, "AQUARING")) heal(u, H / 16 * root, `A veil of water restored ${nm(u)}'s HP!`);
    if (u.alive && has(u, "INGRAIN")) heal(u, H / 16 * root, `${Nm(u)} absorbed nutrients with its roots!`);
    if (u.alive && inTerrain("grassy", u)) heal(u, H / 16, `${Nm(u)}'s HP was restored by the Grassy Terrain.`);
    if (u.alive && pv(u, "HARVEST") && u.flags.itemUsed && ["sitrusberry", "lumberry"].includes(u.held) && (inWeather("sun") || R() < .5)) { u.flags.itemUsed = false; u.flags.unburden = false; msg(`${Nm(u)} harvested one ${HELD[u.held].n}!`); }
    if (u.alive && pv(u, "HEALER") && R() < .3) { const a = allies(u).find(x => x !== u && x.status); if (a) { a.status = null; a.sTurn = 0; msg(`${Nm(u)}'s Healer cured ${nm(a)}!`); fxEv(a); } }
    const sh = pv(u, "SHED");
    if (u.alive && u.status && sh && (!sh.w || inWeather(sh.w)) && R() < sh.chance) { msg(`${Nm(u)}'s ${u.passives[0].name} cured its status condition!`); u.status = null; u.sTurn = 0; fxEv(u); }
    return u.alive;
  }
  // can it move this turn? (sleep, freeze, paralysis, love, confusion, recharge)
  function canMove(u) {
    const stun = u.flags.stun; u.flags.stun = false;   // (a flinch lasts until its next turn, whatever happens on it)
    if (has(u, "SKYDROP")) { msg(`${Nm(u)} is held up in the sky and can't move!`); return false; }
    if (has(u, "RECHARGE")) { removeEff(u, "RECHARGE"); msg(`${Nm(u)} must recharge!`); return false; }
    if (pv(u, "TRUANT")) { if (u.flags.loaf) { u.flags.loaf = false; msg(`${Nm(u)} is loafing around!`); ev({ k: "txt", u: u.uid, s: "Loafing", c: "txt" }); return false; } u.flags.loaf = true; }
    if (u.status === "SLP") {
      u.sTurn--;
      if (u.sTurn > 0) {
        msg(`${Nm(u)} is fast asleep.`); ev({ k: "txt", u: u.uid, s: "Zzz", c: "txt" });
        const st = u.skills.find(s => s.M.sp === "sleeptalk" && skillReady(u, s));
        if (st) { const pick2 = pick(u.skills.filter(s => s !== st && s.M.sp !== "struggle")); if (pick2) { u.cool[st.slot] = cdOf(u, st); msg(`${Nm(u)} used Sleep Talk!`); callMove(u, pick2.key, st.slot); } }
        else { const sn = u.skills.find(s => s.M.sp === "snore"); if (sn) callMove(u, "snore", sn.slot); }   // a sleeping Pokémon snores by itself
        return false;
      }
      u.status = null; msg(`${Nm(u)} woke up!`); fxEv(u);
    }
    if (u.status === "FRZ") {
      u.sTurn--;
      if (u.sTurn > 0 && R() >= .2) { msg(`${Nm(u)} is frozen solid!`); return false; }
      u.status = null; msg(`${Nm(u)} thawed out!`); fxEv(u);
    }
    if (stun) { msg(`${Nm(u)} flinched and couldn't move!`); ev({ k: "txt", u: u.uid, s: "Flinch", c: "debuff" }); return false; }
    if (u.status === "PAR" && R() < .25) { msg(`${Nm(u)} is paralyzed! It can't move!`); ev({ k: "txt", u: u.uid, s: "PAR", c: "debuff" }); return false; }
    if (has(u, "INFAT") && R() < .5) { msg(`${Nm(u)} is immobilized by love!`); return false; }
    if (has(u, "CNF")) {
      msg(`${Nm(u)} is confused!`);
      if (R() < 1 / 3) {
        msg("It hurt itself in its confusion!");
        const d = Math.max(1, Math.round((((2 * u.lvl / 5 + 2) * 40 * statOf(u, "atk") / Math.max(1, statOf(u, "def"))) / 50 + 2) * DMG_SCALE));
        applyDamage(null, u, d, { trueDmg: true });
        return false;
      }
    }
    return u.alive;
  }
  // landing: Fly and the like coming down on the user's next turn; free: a move used outside the user's own turn (Pursuit), which
  // leaves its turn meter and turn alone (the move still goes on cooldown)
  const DANCES = new Set(["swordsdance", "dragondance", "quiverdance", "featherdance", "petaldance", "fierydance", "revelationdance", "teeterdance", "victorydance", "aquastep", "clangoroussoul"]);
  function act(u, slot, t, landing, free) {
    const was = B.koOn; B.koOn = true;
    try { return act0(u, slot, t, landing, free); } finally { B.koOn = was; if (!was) releaseKO(); }
  }
  function act0(u, slot, t, landing, free) {
    let sk = landing ? u.skills.find(s => s.key === landing.key) || { ...makeSkill(landing.key, landing.slot), cd: 0 } : u.skills.find(s => s.slot === slot) || u.skills[0];
    if (!landing && !skillReady(u, sk)) { sk = u.skills.find(s => s.slot === 1) || u.skills[0]; if (!skillReady(u, sk)) sk = { ...makeSkill("struggle", 1), cd: 0 }; }
    // Encore (the owner's rule): only its last move, and on a turn that move isn't ready, Struggle
    const enc = !landing && !free && effOf(u, "ENCORE"), encSk = enc && u.skills.find(s => s.key === enc.key);
    if (encSk && encSk !== sk && sk.M.sp !== "lastresort") { if (skillReady(u, encSk)) { sk = encSk; t = null; } else { msg(`${Nm(u)} must do an encore, but ${encSk.name} isn't ready!`); sk = { ...makeSkill("struggle", 1), cd: 0 }; } }
    if (sk.M.sp === "expandingforce" && inTerrain("psychic", u)) sk = { ...sk, target: "aoe_enemies" };   // (Expanding Force in Psychic Terrain: every foe)
    const M = sk.M;
    // U-turn, Volt Switch, Flip Turn, Teleport, Baton Pass: an opposing Pursuit strikes first, before the move resolves
    if (!free && PIVOT.has(M.sp) && !landing) { pursue(u); if (!u.alive || B.over) { ev({ k: "end", u: u.uid }); endTurn(u); return; } }
    if (pv(u, "STANCE") && OPS.aegislashblade && M.sp !== "struggle") {
      // (the owner's rule: each change also gives +1 to the higher of Attack and Sp. Atk in Blade Forme, of Defense and Sp. Def in Shield
      // Forme; a tie goes to the side of the move it's using in Blade Forme, to Defense in Shield Forme)
      if (M.c !== "X" && u.spr !== "aegislashblade") { becomeForm(u, "aegislashblade", `${Nm(u)} changed to Blade Forme!`); stage(u, u, u.max.atk > u.max.spa ? "atk" : u.max.spa > u.max.atk ? "spa" : M.c === "S" ? "spa" : "atk", 1, "Stance Change"); }
      else if (sk.key === "kingsshield" && u.spr === "aegislashblade") { becomeBase(u); msg(`${Nm(u)} changed to Shield Forme!`); stage(u, u, u.max.sdf > u.max.def ? "sdf" : "def", 1, "Stance Change"); }
    }
    // Upper Hand (the owner's rule): an opposing Pokémon with it ready strikes first, by itself, at one using a priority move; the
    // priority move flinches and doesn't happen (no turn lost: the move is what it loses). Chosen like any move, it's a normal hit
    // whose flinch costs the target its next turn
    if (!free && !landing && M.pri > 0) {
      u.flags.flinchT = null; upperHand(u);
      if (!u.alive || B.over) { ev({ k: "end", u: u.uid }); endTurn(u); return; }
      if (u.flags.flinchT === B.turn) { msg(`${Nm(u)} couldn't use ${sk.name}!`); ev({ k: "end", u: u.uid }); endTurn(u); return; }
    }
    // Powder: a Fire-type move explodes in its face
    // (the owner's rule, 2026-10-19: the user and each of its partners on the field lose 1/4 of their max HP; the powder is gone)
    if (has(u, "POWDER") && M.c !== "X" && mtype(u, sk) === "Fire") {
      removeEff(u, "POWDER"); msg("When the flame touched the powder on the Pokémon, it exploded!"); if (sk.slot > 1) u.cool[sk.slot] = cdOf(u, sk);
      for (const x of allies(u)) if (x.alive) chip(x, hpBase(x) / 4, x === u ? null : `${Nm(x)} was caught in the explosion!`);
      ev({ k: "end", u: u.uid }); if (free) checkOver(); else endTurn(u); return;
    }
    if (pv(u, "PROTEAN") && M.sp !== "struggle") { const pt = mtype(u, sk); if (pt !== "???" && !(u.types.length === 1 && u.types[0] === pt)) { u.types = [pt]; msg(`${Nm(u)}'s ${u.passives[0].name} made it the ${pt} type!`); fxEv(u); } }   // (Protean, Libero: before every move, Generation 8's effect)
    u.metroN = u.lastSkill && u.lastSkill.key === sk.key ? (u.metroN || 0) + 1 : 0;
    u.lastSkill = sk;
    let targets, rodMsg = null;
    if (M.sp === "spotlight" && t && t !== u && t.alive && t.team === u.team && B.units.includes(t)) targets = [t];
    else if (M.sp === "bide" && t && t.alive && t.team !== u.team && B.units.includes(t)) targets = [t];   // (Bide going off: bideStrikes)   // (Spotlight on a partner, as in the main games: autoRedirect, redirectNow)
    else if (sk.target === "enemy") {
      if (!t || !t.alive || t.team === u.team || !B.units.includes(t)) t = defaultTarget(u, sk);
      const r = redirect(u, sk, t); if (r && r !== t && drawsIn(u, r, mtype(u, sk)) && !has(r, "FOLLOWME")) rodMsg = r; t = r;   // (Lightning Rod, Storm Drain or Earth Eater)
      // Illusion (the owner's rule): the first opposing single-target move after it comes in goes for one of the attacker's partners
      // instead (with no partner there, it hits as normal); either way the illusion is used up
      if (t && t.team !== u.team && t.flags.illusionReady && pv(t, "ILLUSION")) {
        t.flags.illusionReady = false; const mates = allies(u).filter(x => x !== u);
        if (mates.length) { const r2 = pick(mates); msg(`${Nm(t)}'s Illusion fooled ${nm(u)}! The move went for ${nm(r2)} instead!`); t = r2; } else msg(`${Nm(t)}'s Illusion wore off!`);
      }
      targets = t ? [t] : [];
    }
    else if (sk.target === "ally_single") { if (!t || !t.alive || t.team !== u.team) t = defaultTarget(u, sk); targets = [t]; }
    else if (sk.target === "partners") targets = allies(u).filter(x => x !== u);   // Heal Pulse: every partner on the field
    else if (sk.target === "self") targets = [u];
    else if (sk.target === "team") targets = allies(u);
    else if (sk.target === "field") targets = B.units.filter(x => x.alive);
    else {   // spread attacks: a Lightning Rod, Storm Drain or Earth Eater on the other side takes the whole attack of its type
      targets = enemies(u);
      const rod = M.c !== "X" && !pv(u, "NO_REDIRECT") && targets.find(f => drawsIn(u, f, mtype(u, sk)));
      if (rod && targets.length > 1) { targets = [rod]; rodMsg = rod; }
    }
    // (Hidden Power, the owner's rule: each Pokémon an attack is used on remembers its type, for its own Hidden Power)
    if (M.c !== "X") { const ty = mtype(u, sk); if (ty && ty !== "???") for (const x of targets) if (x && x !== u) x.flags.hpType = ty; }
    ev({ k: "act", u: u.uid, slot, key: sk.key, name: sk.name, type: sk.type, cat: sk.cat, anim: sk.anim, s3: sk.slot === 3 && !landing, t: targets[0] && targets[0].uid, tgt: sk.target, land: landing ? 1 : 0 });
    msg(`${Nm(u)} used ${sk.name}!`, { big: 1 });
    if (rodMsg) msg(`${Nm(rodMsg)}'s ${rodMsg.passives[0].name} took the attack!`);
    B.ctxKill = false; B.failed = false; B.acting = true; B.actN = (B.actN || 0) + 1;
    if (sk.slot > 1 && !landing && !(M.sp === "lastresort" && lrBoost(u))) u.cool[sk.slot] = cdOf(u, sk) + (enemies(u).some(f => pv(f, "PRESSURE")) ? 1 : 0);
    // Fly, Bounce, Dig, Dive, Phantom Force (the owner's rule): this turn the user goes out of reach; the move lands on its next turn
    if ((M.sp === "semi" || M.sp === "skydrop") && !landing) {
      const lift = targets[0];
      if (M.sp === "skydrop" && (!lift || lift.team === u.team || lift.boss || wt(lift) >= 2000 || lift.shield > 0 || has(lift, "PROTECT") || outOfReach(u, lift, sk))) { msg("But it failed!"); B.acting = false; ev({ k: "end", u: u.uid }); endTurn(u); return; }
      if (fieldOn("gravity") && GRAV_BAN.has(sk.key)) { msg(`${Nm(u)} can't use ${sk.name} because of gravity!`); B.acting = false; ev({ k: "end", u: u.uid }); endTurn(u); return; }
      if (M.sp === "skydrop") { addEff(lift, "SKYDROP", 3, u, true); msg(`${Nm(u)} took ${nm(lift)} into the sky!`); }
      u.flags.semi = { key: sk.key, slot: sk.slot, t: targets[0] && targets[0].uid };
      if (M.sp !== "skydrop") msg(psT(sk.key, "prepare", { POKEMON: nm(u) }) || `${Nm(u)} is out of reach!`);   // (Sky Drop said its own)
      ev({ k: "semi", u: u.uid, on: 1, key: sk.key });
      B.acting = false; ev({ k: "end", u: u.uid }); endTurn(u); return;
    }
    // Snatch (the owner's rule, 2026-10-19): it can't be chosen. When an opposing Pokémon uses a move that raises its stats or heals it,
    // a Pokémon that knows Snatch, ready, takes the boost or the healing for itself by itself (not its turn: Snatch goes on cooldown,
    // like Counter). The move is still used (its turn and cooldown are spent); it just does nothing for its user
    let snatcher = !free && snatchable(sk) && enemies(u).find(f => has(f, "SNATCH"));   // (a Snatch called by another move: until its next turn)
    if (snatcher) removeEff(snatcher, "SNATCH");
    else if (!free && snatchable(sk)) for (const f of enemies(u)) { const s = reactReady(f, "snatch"); if (s) { f.cool[s.slot] = cdOf(f, s); reactEv(f, s, u); snatcher = f; break; } }
    if (snatcher) { msg(`${Nm(snatcher)} snatched ${nm(u)}'s move!`); callMove(snatcher, sk.key, sk.slot); B.acting = false; ev({ k: "end", u: u.uid }); endTurn(u); return; }
    useMove(u, sk, targets);
    if (B.sketched && B.sketched.u === u) { const x = B.sketched; B.sketched = null; if (u.alive && !B.over) sketchUse(u, x.sk, x.t); }   // (Sketch: the copied move, at once)
    if (M.sp === "skydrop" && landing) for (const x of B.units) { const sd = effOf(x, "SKYDROP"); if (sd && sd.src === u.uid) removeEff(x, "SKYDROP"); }
    (u.flags.used || (u.flags.used = {}))[sk.key] = 1;   // (Last Resort)
    if (M.sp === "trumpcard") u.flags.trump = (u.flags.trump || 0) + 1;
    removeEff(u, "ELECTRIFY");   // (Powder stays until a Fire-type move sets it off: the owner's rule, 2026-10-19)
    // Dancer: a dance move is danced again right away by every other Dancer on the field
    if (DANCES.has(sk.key) && !B.dancing) { B.dancing = true; for (const x of B.units.slice()) if (x !== u && x.alive && pv(x, "DANCER")) { msg(`${Nm(x)}'s Dancer!`); callMove(x, sk.key, sk.slot); } B.dancing = false; }
    if (M.sp === "ramp") u.flags["ramp:" + sk.key] = rampN(u, sk.key) + 1;
    B.acting = false; u.flags.failed = B.failed; B.lastMove = sk.key;
    if (u.alive && M.so && item(u, "throatspray")) { useUp(u, `${Nm(u)}'s Throat Spray kicked in!`); stage(u, u, "spa", 1); }
    // one-shot boosts are used up by the move
    if (M.c !== "X") { removeEff(u, "LOCKON"); removeEff(u, "LASER"); removeEff(u, "HELPED"); }
    if (u.alive && sk.mk === "tm" && mastery(u, sk) > 1 && !free) addATB(u, mastery(u, sk) - 1, true); // status moves that never miss
    ev({ k: "end", u: u.uid });
    if (B.shellQ && B.shellQ.length && !B.shellTrapping && !B.over) shellTraps();
    if (B.counterQ && B.counterQ.length && !B.shellTrapping && !B.over) counterStrikes();
    if (B.bideQ && B.bideQ.length && !B.biding && !B.over) bideStrikes();
    if (free) checkOver(); else endTurn(u);
  }
  // Shell Trap (the owner's rule): it can't be chosen. A Pokemon an opposing attack damages strikes back with it by itself as soon as
  // that attack is over, if it's ready and can move; that isn't its turn (its turn meter stays), the move goes on cooldown, like Pursuit
  function shellTraps() {
    B.shellTrapping = true;
    try {
      for (const uid of B.shellQ.splice(0)) {
        const x = B.byId(uid); if (!x || !x.alive || B.over || !B.units.includes(x) || x.flags.semi || x.status === "SLP" || x.status === "FRZ" || !enemies(x).some(f => f.alive)) continue;
        const s = x.skills.find(k => k.M.sp === "shelltrap" && skillReady(x, k)); if (s) act(x, s.slot, null, null, true);
      }
    } finally { B.shellTrapping = false; }
  }
  // the counters (the owner's rule, 2026-10-16): Counter (physical damage), Mirror Coat (special) and Metal Burst and Comeuppance
  // (either) can't be chosen. A Pokemon an opposing attack of their kind damaged strikes back at that attacker by itself as soon as
  // the attack is over, if the move is ready and it can move: that isn't its turn (its turn meter stays), the move goes on cooldown,
  // like Shell Trap. A strike back never sets off another
  function counterStrikes() {
    B.shellTrapping = true;
    try {
      for (const [uid, by, cat] of B.counterQ.splice(0)) {
        const x = B.byId(uid), a = B.byId(by);
        if (!x || !x.alive || B.over || !B.units.includes(x) || x.flags.semi || x.status === "SLP" || x.status === "FRZ") continue;
        if (!a || !a.alive || !B.units.includes(a)) continue;
        const s = x.skills.find(k => COUNTERS[k.M.sp] && (COUNTERS[k.M.sp] === "*" || COUNTERS[k.M.sp] === cat) && skillReady(x, k)); if (!s) continue;
        B.counterBy = a; B.counterCat = cat;
        try { act(x, s.slot, null, null, true); } finally { B.counterBy = null; B.counterCat = null; }
      }
    } finally { B.shellTrapping = false; }
  }
  // Bide going off (the owner's rule, 2026-10-19): the moment the second opposing attack since its user's last turn is over, it strikes
  // the last attacker for twice the damage those attacks did, if it can move (not its turn: the move goes on cooldown). Then it's done
  // until its user comes onto the field again (autoBide)
  function bideStrikes() {
    B.biding = true;
    try {
      for (const uid of B.bideQ.splice(0)) {
        const x = B.byId(uid); if (!x || !x.alive || B.over || !B.units.includes(x) || !x.flags.bide || x.flags.semi || x.status === "SLP" || x.status === "FRZ") continue;
        const s = x.skills.find(k => k.M.sp === "bide" && skillReady(x, k)); if (!s) continue;
        act(x, s.slot, B.byId(x.flags.bide.by), null, true);
      }
    } finally { B.biding = false; }
  }
  // Conversion and Conversion 2 (the owner's rule, 2026-10-16): they can't be chosen. Just before an opposing attack's damage, a
  // Pokemon that knows one, ready, becomes a type that resists the attack (Conversion 2: one the attack doesn't affect at all, when
  // there is one, else one that resists it), picked at random among them, if that's better than what it is. That isn't its turn: the
  // move goes on cooldown. With both, Conversion 2 goes when an immunity is there, else Conversion first. Its type is back when it leaves
  function convert(x, t) {
    if (!t || t === "???" || !x.alive || x.flags.semi) return;
    const imm = TYPES.filter(d => typeEff(t, [d]) === 0), res = TYPES.filter(d => typeEff(t, [d]) > 0 && typeEff(t, [d]) < 1), now = typeEff(t, x.types);
    const ready = sp => x.skills.find(k => k.M.sp === sp && skillReady(x, k));
    // (Color Change, the Ability, does what Conversion does, with no cooldown: it goes before Conversion, so the move stays ready)
    const order = imm.length ? ["conversion2", "COLOR_CHANGE", "conversion"] : ["COLOR_CHANGE", "conversion", "conversion2"];
    for (const sp of order) {
      const s = sp === "COLOR_CHANGE" ? pv(x, "COLOR_CHANGE") && { name: "Color Change", ab: true } : ready(sp); if (!s) continue;
      const pool = sp === "conversion2" && imm.length ? imm : res, best = pool === imm ? 0 : .5;
      if (!pool.length || now <= best) continue;
      const nt = pick(pool); x.types = [nt]; if (!s.ab) x.cool[s.slot] = cdOf(x, s);
      if (s.ab) msg(`${Nm(x)}'s Color Change made it the ${nt} type!`); else { msg(`${Nm(x)}'s ${s.name}!`); msg(`${Nm(x)} transformed into the ${nt} type!`); }
      fxEv(x);
      return;
    }
  }
  // Spectral Thief: the target's stat rises become the user's before the hit (ones fixed to an item, an Ability or the field stay)
  function stealBoosts(u, x) {
    const up = Object.keys(x.stages).filter(k => x.stages[k] > 0); if (!up.length) return;
    for (const k of up) { u.stages[k] = clamp((u.stages[k] || 0) + x.stages[k], -6, 6); x.stages[k] = 0; }
    msg(`${Nm(u)} stole the target's boosted stats!`); fxEv(u); fxEv(x);
  }
  // the move Sketch just copied, used right away in the same turn (the owner's rule): on the Pokémon it was copied from when it's an
  // attack on one target, else as the move goes; it starts its own cooldown. Fly, Dig and the like, and Shell Trap, wait for a turn
  function sketchUse(u, ns, t0) {
    if (["semi", "skydrop"].includes(ns.M.sp) || SELF_GOING.has(ns.M.sp)) return;
    let tg;
    if (ns.target === "enemy") tg = [t0 && t0.alive && B.units.includes(t0) ? t0 : defaultTarget(u, ns)];
    else if (ns.target === "ally_single") tg = [defaultTarget(u, ns)];
    else if (ns.target === "partners") tg = allies(u).filter(x => x !== u);
    else if (ns.target === "self") tg = [u];
    else if (ns.target === "team") tg = allies(u);
    else if (ns.target === "field") tg = B.units.filter(x => x.alive);
    else tg = enemies(u);
    tg = tg.filter(Boolean); if (!tg.length && ns.target !== "field") return;
    ev({ k: "act", u: u.uid, slot: ns.slot, key: ns.key, name: ns.name, type: ns.type, cat: ns.cat, anim: ns.anim, s3: false, t: tg[0] && tg[0].uid, tgt: ns.target });
    msg(`${Nm(u)} used ${ns.name}!`, { big: 1 });
    if (ns.slot > 1) u.cool[ns.slot] = cdOf(u, ns);
    u.lastSkill = ns; B.acting = true;
    useMove(u, ns, tg);
    B.acting = false;
  }
  // (what Copycat and Mirror Move can use: anything but Sketch, Copycat and Mirror Move themselves)
  const copyable = k => !!MOVES[k] && !isSketch(k) && !["copycat", "mirrormove"].includes(MOVES[k].sp) && !SELF_GOING.has(MOVES[k].sp);   // (nor what only goes off by itself)
  const PIVOT = new Set(["uturn", "teleport", "batonpass"]);
  function callMove(u, key, slot) {
    if (!MOVES[key]) { msg("But it failed!"); return; }
    const virt = { ...makeSkill(key, slot), slot, cd: 0 };
    ev({ k: "act", u: u.uid, slot, key: virt.key, name: virt.name, type: virt.type, cat: virt.cat, anim: virt.anim, s3: false, t: null, tgt: virt.target, quiet: 1 });
    msg(`${Nm(u)} used ${virt.name}!`);
    const tg = virt.target === "aoe_enemies" ? enemies(u) : virt.target === "self" ? [u] : virt.target === "team" ? allies(u) : virt.target === "partners" ? allies(u).filter(x => x !== u) : virt.target === "field" ? B.units.filter(x => x.alive) : [defaultTarget(u, virt)].filter(Boolean);
    useMove(u, virt, tg);
  }
  // ---------- held items that answer a hit ----------
  function hitItems(att, tar, sk, e) {
    const M = sk.M, t = mtype(att, sk), H = heldX(tar), contact = M.ct && !item(att, "protectivepads") && !(item(att, "punchingglove") && M.pu);
    if (contact && att.alive && item(tar, "rockyhelmet") && !pv(att, "MAGIC_GUARD")) chip(att, att.max.hp / 6, psT("rockyhelmet", "damage", { POKEMON: nm(att) }));
    if (contact && att.alive && !att.held && item(tar, "stickybarb")) { att.held = "stickybarb"; att.flags.itemUsed = false; tar.held = null; msg(`The Sticky Barb attached itself to ${nm(att)}!`); }
    if (!H || !tar.alive) { if (H && !tar.alive && tar.held === "airballoon") tar.flags.itemUsed = true; return; }
    const k = tar.held, bOk = !H.berry || berryOk(tar);
    if (k === "airballoon") useUp(tar, `${Nm(tar)}'s Air Balloon popped!`);
    else if (k === "weaknesspolicy" && e > 1) { useUp(tar, `${Nm(tar)}'s Weakness Policy kicked in!`); stage(tar, tar, "atk", 2); stage(tar, tar, "spa", 2); }
    else if ({ absorbbulb: "Water", luminousmoss: "Water", cellbattery: "Electric", snowball: "Ice" }[k] === t) {
      useUp(tar, `${Nm(tar)}'s ${H.n} kicked in!`); stage(tar, tar, { absorbbulb: "spa", luminousmoss: "sdf", cellbattery: "atk", snowball: "atk" }[k], 1);
    }
    else if (H.hitBoost === M.c && bOk) { useUp(tar, `${Nm(tar)} ate its ${H.n}!`); stage(tar, tar, H.stat, 1); }
    else if (H.retaliate === M.c && bOk && att.alive) { useUp(tar, `${Nm(tar)} ate its ${H.n}!`); chip(att, att.max.hp / 8, `${Nm(att)} was hurt by ${nm(tar)}'s ${H.n}!`); }
    else if (H.seHeal && e > 1 && bOk) { useUp(tar); heal(tar, tar.max.hp * H.seHeal, `${Nm(tar)} restored its HP using its ${H.n}!`); }
    else if (k === "ejectbutton" && benchOf(tar.team).length && B.units.includes(tar)) { useUp(tar, `${Nm(tar)} is switched out with the Eject Button!`); B.pivotQ.push({ uid: tar.uid }); }
    else if (k === "redcard") tar.redCard = true;
  }
  // terrain seeds: +1 to a defense when their terrain is on the field
  function terrainSeeds() {
    const SEED = { electricseed: ["electric", "def"], grassyseed: ["grassy", "def"], mistyseed: ["misty", "sdf"], psychicseed: ["psychic", "sdf"] };
    for (const x of B.units) { const s2 = x.alive && heldX(x) && SEED[x.held]; if (s2 && B.terrain && B.terrain.t === s2[0]) { useUp(x, `${Nm(x)}'s ${HELD[x.held].n} kicked in!`); stage(x, x, s2[1], 1); } }
  }

  // ---------- hazards and screens ----------
  // the hazards on a side go (Rapid Spin, Defog): the games name each one that disappears
  function clearHazards(team) {
    const hz = B.hazards && B.hazards[team]; if (!(hz && (hz.sr || hz.spikes || hz.tspikes || hz.web))) return;
    for (const [k, id] of [["sr", "stealthrock"], ["spikes", "spikes"], ["tspikes", "toxicspikes"], ["web", "stickyweb"]]) if (hz[k]) msg(psT(id, "end", { TEAM: psTeam(team) }));
    B.hazards[team] = { sr: 0, spikes: 0, tspikes: 0 }; hzEv(team);
  }
  // (for the battlefield: the hazards on a side, now)
  const hzEv = team => ev({ k: "side", team, hz: { ...((B.hazards && B.hazards[team]) || { sr: 0, spikes: 0, tspikes: 0 }) } });
  const foeTeam = u => u.team === "A" ? "E" : "A";
  // the effects a move puts on a whole side, and the line when they go
  const TEAM_FX = { REFLECT: "reflect", LSCREEN: "lightscreen", VEIL: "auroraveil", SAFEGUARD: "safeguard", LUCKY: "luckychant", MIST: "mist" };
  // the side conditions (Reflect, Light Screen, Aurora Veil, Safeguard, Mist, Lucky Chant), as in the main games: one per side for a
  // number of rounds, on every Pokémon that side has out, the ones that come in later too (B.side[team][id]: the turn it ends; each
  // Pokémon out carries it as an effect, for the damage math and the screens drawn on the field)
  function addSide(team, id, rounds) {
    (B.side || (B.side = { A: {}, E: {} }))[team][id] = fieldRounds(rounds);
    for (const a of B.units.filter(x => x.team === team && x.alive)) addEff(a, id, 99, null, true);
  }
  function clearSide(team, id) {
    if (B.side && B.side[team]) delete B.side[team][id];
    for (const a of B.units.filter(x => x.team === team)) removeEff(a, id);
  }
  const screenEnd = (id, team) => psT(TEAM_FX[id], "end", { TEAM: psTeam(team) });
  const fieldRounds = n => B.turn + n * Math.max(2, B.units.filter(x => x.alive).length);
  // a field effect lasts turns, not single moves (the owner's rule: its counter only ever goes down). Its end is kept in moves (B.turn
  // counts every Pokémon's move), so when the number of Pokémon on the field changes (a faint, one sent in) each timed effect is
  // stretched or shrunk to keep the turns it has left: Future Sight's and Doom Desire's strikes the same
  function rescaleField() {
    const per = Math.max(2, B.units.filter(x => x.alive).length), was = B.perNow || per; B.perNow = per;
    if (per === was) return;
    const f = end => end > B.turn ? B.turn + (end - B.turn) * per / was : end;
    if (B.wxEnd) B.wxEnd = f(B.wxEnd);
    if (B.terrain) B.terrain.until = f(B.terrain.until);
    for (const k of ["trickRoom", "gravity", "wonderRoom", "magicRoom", "mudSport", "waterSport", "fairyLock", "ionDeluge"]) if (B[k]) B[k] = f(B[k]);
    if (B.uproar) B.uproar.until = f(B.uproar.until);
    for (const tm of ["A", "E"]) {
      if (B.tailwind && B.tailwind[tm]) B.tailwind[tm] = f(B.tailwind[tm]);
      for (const id in (B.side && B.side[tm]) || {}) B.side[tm][id] = f(B.side[tm][id]);
      for (const fx in (B.pledgeFx && B.pledgeFx[tm]) || {}) B.pledgeFx[tm][fx] = f(B.pledgeFx[tm][fx]);
    }
    for (const x of B.future || []) x.at = f(x.at);
  }
  // what's left of each timed field effect, in turns (fieldRounds' rounds): weather (no number for an area's own, which stays),
  // terrain, Trick Room, Gravity, the rooms, the Sports, Uproar; each side's Tailwind, screens, Safeguard, Mist and Lucky Chant
  function fieldTimers() {
    const per = B.perNow || Math.max(2, B.units.filter(x => x.alive).length), left = end => Math.max(1, Math.ceil((end - B.turn) / per)), out = [];   // (the count the ends were last kept to: rescaleField)
    if (B.weather) out.push({ id: "wx:" + B.weather, n: B.wxEnd > B.turn ? left(B.wxEnd) : null });
    if (B.terrain) out.push({ id: "ter:" + B.terrain.t, n: left(B.terrain.until) });
    for (const k of ["trickRoom", "gravity", "wonderRoom", "magicRoom", "mudSport", "waterSport", "ionDeluge"]) if (B[k] > B.turn) out.push({ id: k, n: left(B[k]) });
    if (B.uproar && B.uproar.until > B.turn) out.push({ id: "uproar", n: left(B.uproar.until) });
    for (const tm of ["A", "E"]) {
      if (B.tailwind && B.tailwind[tm] > B.turn) out.push({ id: "tailwind", side: tm, n: left(B.tailwind[tm]) });
      for (const id in (B.side && B.side[tm]) || {}) if (B.side[tm][id] > B.turn) out.push({ id, side: tm, n: left(B.side[tm][id]) });
    }
    return out;
  }
  // after a damaging move hits one target
  function afterHit(u, x, sk) {
    const sp = sk.M.sp, holds = y => y.held && !y.flags.itemUsed, sticky = y => !!tab(u, y, "STICKY");
    if (sp === "knockoff" && x.alive && holds(x) && !sticky(x)) { msg(`${Nm(u)} knocked off ${nm(x)}'s ${HELD[x.held].n}!`); x.held = null; x.flags.unburden = true; }
    if (sp === "thief" && u.alive && x.alive && holds(x) && !holds(u) && !sticky(x)) { u.held = x.held; u.flags.itemUsed = false; x.held = null; x.flags.unburden = true; msg(`${Nm(u)} stole ${nm(x)}'s ${HELD[u.held].n}!`); }
    if ((sp === "pluck" || sp === "incinerate") && holds(x) && ["sitrusberry", "lumberry"].includes(x.held) && !sticky(x)) {
      const b = x.held; x.held = null; x.flags.unburden = true;
      if (sp === "incinerate") msg(`${Nm(x)}'s ${HELD[b].n} was burned up!`);
      else if (u.alive) { msg(psT("bugbite", "removeItem", { SOURCE: nm(u), ITEM: HELD[b].n })); if (b === "sitrusberry") heal(u, u.max.hp / 4); else cureAll(u); }
    }
    if (sp === "clearsmog" && x.alive) { x.stages = newStages(); msg(`${Nm(x)}'s stat changes were removed!`); fxEv(x); }
    if (sp === "wakeupslap" && x.alive && x.status === "SLP") { x.status = null; msg(`${Nm(x)} woke up!`); fxEv(x); }
    if (sp === "smellingsalts" && x.alive && x.status === "PAR") { x.status = null; msg(`${Nm(x)} was cured of paralysis!`); fxEv(x); }
    if (sp === "burningjealousy" && x.alive && x.raiseT != null && x.raiseT > (u.actT == null ? -1 : u.actT)) tryStatus(u, x, "BRN", false);
    if (sp === "dragontail" && x.alive && !x.boss && !(B.wild && x.team === "E") && benchOf(x.team).length) { if (pv(x, "SUCTION") || pv(x, "GUARD_DOG")) msg(`${Nm(x)} anchors itself with Suction Cups!`); else switchOut(x, pick(benchOf(x.team)), true); }
    // Whirlwind (house rule: a 60-power attack): blows the target away, so a random Pokémon from its bench comes in; a boss, a
    // wild Pokémon or one with nobody to come in loses its turn meter and stat changes instead
    if (sp === "whirlwind" && x.alive) {
      msg(`${Nm(x)} was blown away!`);
      if (!x.boss && !(B.wild && x.team === "E") && benchOf(x.team).length) switchOut(x, pick(benchOf(x.team)), true);
      else { x.atb = 0; x.stages = newStages(); ev({ k: "tm", u: x.uid, tm: 0, v: -100, quiet: 1 }); fxEv(x); }
    }
  }
  // the status moves from later generations; true when handled
  function statusMove(u, sk, targets) {
    const M = sk.M, sp = M.sp, t = targets[0], foes = foeTeam(u);
    const fail = () => { msg("But it failed!"); return true; };
    const hz = () => sideHz(foes);
    switch (sp) {
      case "teleport": case "batonpass":
        if (!benchOf(u.team).length) return fail();
        B.pivotQ.push({ uid: u.uid, keep: sp === "batonpass" }); return true;
      case "afteryou": if (!t || t === u || !t.alive) return fail(); t.atb = 100; ev({ k: "tm", u: t.uid, tm: 100, v: 100 }); msg(`${Nm(t)} took the kind offer!`); return true;
      case "allyswitch": { const p = allies(u).find(x => x !== u); if (!p) return fail(); addEff(u, "ALLYSWITCH", 99, u, true); addEff(p, "ALLYSWITCH", 99, u, true); effOf(u, "ALLYSWITCH").mate = p.uid; effOf(p, "ALLYSWITCH").mate = u.uid; msg(`${Nm(u)} and ${nm(p)} switched places!`); return true; }
      case "bestow": if (!t || !u.held || u.flags.itemUsed || (t.held && !t.flags.itemUsed) || /plate$|memory$/.test(u.held)) return fail(); t.held = u.held; t.flags.itemUsed = false; u.held = null; u.flags.unburden = true; msg(`${Nm(t)} received ${HELD[t.held].n} from ${nm(u)}!`); return true;
      case "conversion2": { const last = t && t.lastSkill; if (!last) return fail(); const lt = mtype(t, last), ok = TYPES.filter(x => typeEff(lt, [x]) < 1 && !(u.types.length === 1 && u.types[0] === x)); if (!ok.length) return fail(); const nt = pick(ok); u.types = [nt]; msg(`${Nm(u)} transformed into the ${nt} type!`); fxEv(u); return true; }
      case "courtchange": {
        const A = sideHz("A"), E = sideHz("E"); B.hazards.A = E; B.hazards.E = A; hzEv("A"); hzEv("E");
        const sd = B.side || (B.side = { A: {}, E: {} }); B.side = { A: sd.E || {}, E: sd.A || {} };
        for (const x of B.units) if (x.alive) { x.eff = x.eff.filter(e => !TEAM_FX[e.id]); for (const id in B.side[x.team]) if (B.side[x.team][id] > B.turn) x.eff.push({ id, turns: 99 }); fxEv(x); }
        if (B.tailwind) B.tailwind = { A: B.tailwind.E || 0, E: B.tailwind.A || 0 };
        msg(`${Nm(u)} swapped the battle effects affecting each side of the field!`); return true;
      }
      case "craftyshield": case "matblock": case "quickguard": case "wideguard": {
        const id = { craftyshield: "CRAFTY", matblock: "MATBLOCK", quickguard: "QUICKGUARD", wideguard: "WIDEGUARD" }[sp];
        for (const a of allies(u)) addEff(a, id, 99, u, true);
        msg({ CRAFTY: "Crafty Shield protected", MATBLOCK: `${Nm(u)} intends to flip up a mat and block incoming attacks! It protected`, QUICKGUARD: "Quick Guard protected", WIDEGUARD: "Wide Guard protected" }[id] + ` ${psTeam(u.team)}!`);
        ev({ k: "aura", u: u.uid, team: 1 }); return true;
      }
      case "doodle": { if (!t || !t.passives[0] || ["TRACE", "IMPOSTER", "NONE", "ILLUSION", "MULTITYPE", "ZEN", "STANCE", "SCHOOLING", "SHIELDS_DOWN", "POWER_CONSTRUCT", "DISGUISE", "ICE_FACE"].includes(t.passives[0].id)) return fail(); for (const a of allies(u)) { a.passives = [abilityOf(t.passives[0].key)]; abilityCure(a); } msg(`${Nm(u)} and its partners copied ${nm(t)}'s ${t.passives[0].name}!`); return true; }
      case "electrify": if (!t) return fail(); addEff(t, "ELECTRIFY", 99, u, true); msg(`${Nm(t)}'s moves have been electrified!`); return true;
      case "embargo": if (!t || has(t, "EMBARGO")) return fail(); addEff(t, "EMBARGO", 5, u, true); msg(`${Nm(t)} can't use items anymore!`); return true;
      case "encore": { const last = t && t.lastSkill; if (!last || ["encore", "struggle", "transform", "mimic", "sketch", "sketch1", "sketch3", "mirrormove"].includes(last.key) || has(t, "ENCORE") || !t.skills.some(s => s.key === last.key)) return fail(); addEff(t, "ENCORE", 2, u, true); effOf(t, "ENCORE").key = last.key; msg(`${Nm(t)} must do an encore!`); return true; }
      case "entrainment": if (!t || !u.passives[0] || item(t, "abilityshield") || ["TRACE", "IMPOSTER", "ILLUSION", "MULTITYPE", "ZEN", "STANCE", "SCHOOLING", "DISGUISE"].includes((t.passives[0] || {}).id)) return fail(); t.passives = [abilityOf(u.passives[0].key)]; abilityCure(t); msg(`${Nm(t)} acquired ${u.passives[0].name}!`); return true;
      case "fairylock": B.fairyLock = fieldRounds(1); msg("No one will be able to run away during the next turn!"); return true;
      case "foresight": case "miracleeye": { if (!t) return fail(); const id = sp === "foresight" ? "FORESIGHT" : "MIRACLEEYE"; addEff(t, id, 99, u, true); t.stages.eva = Math.min(0, t.stages.eva); msg(`${Nm(u)} identified ${nm(t)}!`); return true; }
      case "addtype": { const ty = sk.key === "forestscurse" ? "Grass" : "Ghost"; if (!t || t.types.includes(ty)) return fail(); t.types = (t.flags.addType ? t.types.filter(x => x !== t.flags.addType) : t.types).concat([ty]); t.flags.addType = ty; msg(`${ty} type was added to ${nm(t)}!`); fxEv(t); return true; }
      case "gravity":
        if (fieldOn("gravity")) return fail(); B.gravity = fieldRounds(5); msg("Gravity intensified!");
        for (const x of B.units) { if (x.alive && x.flags.semi && ["fly", "bounce", "skydrop"].includes(x.flags.semi.key)) { x.flags.semi = null; ev({ k: "semi", u: x.uid, on: 0 }); msg(`${Nm(x)} fell from the sky due to the gravity!`); } removeEff(x, "MAGNETRISE"); removeEff(x, "TELEKINESIS"); removeEff(x, "SKYDROP"); }
        return true;
      case "grudge": addEff(u, "GRUDGE", 99, u, true); msg(`${Nm(u)} wants its target to bear a grudge!`); return true;
      case "guardsplit": case "powersplit": { if (!t) return fail(); for (const k of sp === "guardsplit" ? ["def", "sdf"] : ["atk", "spa"]) { const avg = Math.floor((u.max[k] + t.max[k]) / 2); u.max[k] = avg; t.max[k] = avg; } msg(sp === "guardsplit" ? `${Nm(u)} shared its guard with the target!` : `${Nm(u)} shared its power with the target!`); return true; }
      case "heartswap": { if (!t) return fail(); [u.stages, t.stages] = [{ ...t.stages }, { ...u.stages }]; msg(`${Nm(u)} switched stat changes with the target!`); fxEv(u); fxEv(t); return true; }
      case "imprison": if (has(u, "IMPRISON")) return fail(); addEff(u, "IMPRISON", 99, u, true); msg(`${Nm(u)} sealed any moves its target shares with it!`); return true;
      case "instruct": { const last = t && t !== u && t.alive && t.lastSkill; if (!last || CALL_BAN.has(last.key) || last.key === "instruct" || last.M.sp === "semi" || last.M.sp === "skydrop" || !MOVES[last.key]) return fail(); msg(`${Nm(t)} followed ${nm(u)}'s instructions!`); callMove(t, last.key, last.slot); return true; }
      case "iondeluge": B.ionDeluge = fieldRounds(5); msg("A deluge of ions showers the battlefield!"); return true;   // (both sides, 5 rounds: the owner's rule, 2026-10-19)
      case "magiccoat": addEff(u, "MAGICCOAT", 99, u, true); msg(`${Nm(u)} shrouded itself with Magic Coat!`); return true;
      case "magicroom": case "wonderroom": { const k = sp === "magicroom" ? "magicRoom" : "wonderRoom"; if (fieldOn(k)) { B[k] = 0; msg(sp === "magicroom" ? "Magic Room wore off, and held items' effects returned to normal!" : "Wonder Room wore off, and Defense and Sp. Def stats returned to normal!"); return true; } B[k] = fieldRounds(5); msg(sp === "magicroom" ? "It created a bizarre area in which Pokémon's held items lose their effects!" : "It created a bizarre area in which Defense and Sp. Def stats are swapped!"); return true; }
      case "mimic": { const last = t && t.lastSkill; if (!last || ["mimic", "sketch", "sketch1", "sketch3", "struggle", "transform", "metronome"].includes(last.key) || !MOVES[last.key] || u.skills.some(s => s.key === last.key)) return fail(); const ns = { ...makeSkill(last.key, sk.slot), cd: 0 }; u.skills = u.skills.map(x => x === sk ? ns : x); msg(`${Nm(u)} learned ${MOVES[last.key].n}!`); return true; }
      case "mudsport": case "watersport": { const k = sp === "mudsport" ? "mudSport" : "waterSport"; if (fieldOn(k)) return fail(); B[k] = fieldRounds(5); msg(sp === "mudsport" ? "Electricity's power was weakened!" : "Fire's power was weakened!"); return true; }
      case "nightmare": if (!t || t.status !== "SLP" || has(t, "NIGHTMARE")) return fail(); addEff(t, "NIGHTMARE", 99, u, true); msg(`${Nm(t)} began having a nightmare!`); return true;
      case "octolock": if (!t || has(t, "OCTOLOCK")) return fail(); addEff(t, "OCTOLOCK", 99, u, true); if (!has(t, "NOSWITCH")) addEff(t, "NOSWITCH", 99, u, true); msg(`${Nm(t)} can no longer escape because of Octolock!`); return true;
      case "perishsong":   // (the owner's rule) the user and its target: each faints after 3 of its own turns unless it switches out
        if (!t || t === u || has(t, "PERISH")) return fail();
        if (tab(u, t, "SOUNDPROOF")) { msg(`${Nm(t)}'s Soundproof blocks the move!`); return true; }
        addEff(t, "PERISH", 3, u, true); if (!has(u, "PERISH")) addEff(u, "PERISH", 3, u, true);
        msg(`${Nm(u)} and ${nm(t)} heard the song: both will faint in three turns!`); return true;
      case "powder": {   // (every opposing Pokémon on the field, until it uses a Fire-type move: the owner's rule, 2026-10-19)
        const on = enemies(u).filter(x => x.alive && !has(x, "POWDER")); if (!on.length) return fail();
        for (const x of on) { if (powderProof(u, x)) { msg(`It doesn't affect ${nm(x)}...`); continue; } addEff(x, "POWDER", 999, u, true); msg(`${Nm(x)} is covered in powder!`); }
        return true;
      }
      case "powertrick": [u.max.atk, u.max.def] = [u.max.def, u.max.atk]; msg(`${Nm(u)} switched its Attack and Defense!`); return true;
      case "psychoshift": { if (!t || !u.status || t.status) return fail(); const st = u.status; if (!tryStatus(u, t, st, true)) return true; u.status = null; u.sTurn = 0; msg(`${Nm(u)} was cured!`); fxEv(u); return true; }
      case "purify": { if (!t || !t.status) return fail(); t.status = null; t.sTurn = 0; msg(`${Nm(t)} was purified!`); fxEv(t); heal(u, hpBase(u) / 2, `${Nm(u)} had its HP restored.`); return true; }
      case "quash": if (!t) return fail(); t.atb = 0; ev({ k: "tm", u: t.uid, tm: 0, v: -100 }); msg(`${Nm(t)}'s move was postponed!`); return true;
      case "recycle": if (!u.held || !u.flags.itemUsed) return fail(); u.flags.itemUsed = false; u.flags.unburden = false; msg(`${Nm(u)} found one ${HELD[u.held].n}!`); fxEv(u); return true;
      case "revivalblessing": {
        const x = B.gone.find(y => y.team === u.team && !y.alive); if (!x) return fail();
        B.gone.splice(B.gone.indexOf(x), 1); revive(x, .5); x.slot = -1; B.bench[u.team].push(x); msg(`${x.n} was revived and is ready to fight again!`); return true;
      }
      case "simplebeam": if (!t || item(t, "abilityshield") || ["SIMPLE", "TRUANT", "MULTITYPE", "STANCE", "SCHOOLING"].includes((t.passives[0] || {}).id)) return fail(); t.passives = [abilityOf("simple")]; msg(`${Nm(t)} acquired Simple!`); return true;
      case "snatch": addEff(u, "SNATCH", 99, u, true); msg(`${Nm(u)} waits for a target to make a move!`); return true;
      case "spite": { const last = t && t.lastSkill; if (!last || last.key === "struggle") return fail(); addEff(t, "SPITE", 2, u, true); effOf(t, "SPITE").key = last.key; msg(`It reduced ${nm(t)}'s ${last.name}!`); return true; }
      case "spotlight": if (!t) return fail(); addEff(t, "FOLLOWME", 99, u, true); if (effOf(t, "FOLLOWME")) effOf(t, "FOLLOWME").at = B.fmSeq = (B.fmSeq || 0) + 1; msg(`${Nm(t)} became the center of attention!`); return true;   // (until the partner leaves the field: the owner's rule)
      case "stockpile": { if ((u.flags.stock || 0) >= 3) return fail(); u.flags.stock = (u.flags.stock || 0) + 1; msg(`${Nm(u)} stockpiled ${u.flags.stock}!`); stage(u, u, "def", 1); stage(u, u, "sdf", 1); return true; }
      case "swallow": { const n = u.flags.stock || 0; if (!n) return fail(); heal(u, hpBase(u) * [0, .25, .5, 1][n], `${Nm(u)} had its HP restored.`); u.flags.stock = 0; stage(u, u, "def", -n); stage(u, u, "sdf", -n); return true; }
      case "telekinesis": if (!t || fieldOn("gravity") || has(t, "TELEKINESIS") || item(t, "ironball") || has(t, "SMACKDOWN")) return fail(); addEff(t, "TELEKINESIS", 3, u, true); msg(`${Nm(t)} was hurled into the air!`); return true;
      case "topsyturvy": { if (!t || !Object.values(t.stages).some(v => v)) return fail(); for (const k in t.stages) t.stages[k] = -t.stages[k]; msg(`${Nm(t)}'s stat changes were all reversed!`); fxEv(t); return true; }
      case "torment": if (!t || has(t, "TORMENT")) return fail(); addEff(t, "TORMENT", 99, u, true); msg(`${Nm(t)} was subjected to torment!`); return true;
      case "teatime": {
        msg("It's teatime! Everyone dug in to their Berries!");
        for (const x of B.units.slice()) if (x.alive) { const H = heldX(x); if (!H || !H.berry) continue; x.flags.teatime = true; hpItems(x); x.flags.teatime = false; if (heldX(x) && heldX(x).berry) { if (!statusTea(x)) useUp(x, `${Nm(x)} ate its ${H.n}!`); } }
        return true;
      }
      case "filletaway": {   // half its max HP for +2 Attack, Sp. Atk and Speed
        if (u.hp <= u.max.hp / 2) return fail();
        chip(u, u.max.hp / 2); for (const st of ["atk", "spa", "spe"]) stage(u, u, st, 2); return true;
      }
      case "shedtail": {   // half its max HP makes a substitute for the Pokémon that comes in
        if (u.hp <= u.max.hp / 2 || !benchOf(u.team).length) return fail();
        chip(u, u.max.hp / 2); msg(`${Nm(u)} shed its tail to create a decoy!`); B.pivotQ.push({ uid: u.uid, keep: "shed", sub: Math.floor(u.max.hp / 4) }); return true;
      }
      case "partingshot": {   // the target's Attack and Sp. Atk down, then the user switches out
        for (const x of targets) if (x.alive && x.team !== u.team) { stage(u, x, "atk", -1); stage(u, x, "spa", -1); }
        if (benchOf(u.team).length) B.pivotQ.push({ uid: u.uid }); return true;
      }
      case "healblock":
        for (const x of targets) if (x.alive && x.team !== u.team && !has(x, "HEALBLOCK")) { addEff(x, "HEALBLOCK", 4, u, true); msg(psT("healblock", "start", { POKEMON: nm(x) })); }
        return true;
      case "strengthsap": {   // heals what the target's Attack is (after its changes), then lowers it
        if (!t || !t.alive || t.team === u.team) return fail();
        const a = statOf(t, "atk"); heal(u, Math.min(hpBase(u), a), `${Nm(u)} had its HP restored.`); stage(u, t, "atk", -1); return true;
      }
      case "sketch": {   // (the owner's rule, 2026-10-15) the move the opposing target has in this Sketch's slot takes its place, for good, and
        // is used at once (act: sketchUse). Your own Pokémon keep it in every battle (B.real: not the AI's look-ahead or a simulation)
        const tm = t && t.team !== u.team && t.alive && t.skills.find(x => x.slot === sk.slot && x.key !== "struggle");
        if (!tm || !MOVES[tm.key] || isSketch(tm.key)) return fail();
        const ns = makeSkill(tm.key, sk.slot);   // (its slot's own cooldown from now on)
        u.skills = u.skills.filter(x => x.slot !== ns.slot && x.key !== "struggle").concat([ns]).sort((a, b) => a.slot - b.slot);
        msg(`${Nm(u)} sketched ${ns.name}!`);
        if (B.real && u.own && !u.flags.transformed && typeof S !== "undefined" && S && S.ops && S.ops[u.key]) pmv(u.key)[ns.slot - 1] = ns.key;
        B.sketched = { u, sk: ns, t };
        return true;
      }
      case "stealthrock": if (hz().sr) return fail(); hz().sr = 1; msg(`Pointed stones float in the air around ${foes === "A" ? "your team" : "the opposing team"}!`); hzEv(foes); return true;
      case "spikes": if (hz().spikes >= 3) return fail(); hz().spikes++; msg(psT("spikes", "start", { TEAM: psTeam(foes) })); hzEv(foes); return true;
      case "toxicspikes": if (hz().tspikes >= 2) return fail(); hz().tspikes++; msg(psT("toxicspikes", "start", { TEAM: psTeam(foes) })); hzEv(foes); return true;
      case "stickyweb": if (hz().web) return fail(); hz().web = 1; msg(psT("stickyweb", "start", { TEAM: psTeam(foes) })); hzEv(foes); return true;
      case "defog":
        clearHazards("A"); clearHazards("E");
        if (B.terrain) endTerrain();   // (and the terrain, as from Generation 8)
        if (t) { for (const id of ["REFLECT", "LSCREEN", "VEIL", "SAFEGUARD", "MIST"]) if (allies(t).some(a => has(a, id))) { clearSide(t.team, id); msg(screenEnd(id, t.team)); } stage(u, t, "eva", -1); }
        return true;
      case "synthesis": {
        const f = B.weather && inWeather(B.weather) ? (B.weather === "sun" ? 2 / 3 : 1 / 4) : 1 / 2;
        if (!heal(u, hpBase(u) * f * mastery(u, sk), psT("default", "heal", { POKEMON: nm(u) }))) msg(`${Nm(u)}'s HP is full!`); return true;
      }
      case "wish": if (has(u, "WISH")) return fail(); addEff(u, "WISH", 1, u, true); effOf(u, "WISH").amt = Math.floor(u.max.hp / 2); msg(`${Nm(u)} made a wish!`); return true;
      case "aquaring": if (has(u, "AQUARING")) return fail(); addEff(u, "AQUARING", 99, u, true); msg(`${Nm(u)} surrounded itself with a veil of water!`); return true;
      case "ingrain": if (has(u, "INGRAIN")) return fail(); addEff(u, "INGRAIN", 99, u, true); msg(`${Nm(u)} planted its roots!`); return true;
      case "painsplit": { if (!t) return fail(); const avg = Math.floor((u.hp + t.hp) / 2); for (const x of [u, t]) { const d = avg - x.hp; if (d > 0) heal(x, d); else if (d < 0) applyDamage(null, x, -d, { trueDmg: true }); } msg("The battlers shared their pain!"); return true; }
      case "healingwish": case "memento":
        if (sp === "memento" && t) { stage(u, t, "atk", -2); stage(u, t, "spa", -2); }
        if (sp === "healingwish") { if (!benchOf(u.team).length) return fail(); (B.healWish || (B.healWish = {}))[u.team] = true; }
        u.hp = 0; ev({ k: "dmg", u: u.uid, n: 0, hp: 0, sh: 0, dot: 1 }); kill(u, null); return true;
      case "tailwind":
        if (B.tailwind && B.tailwind[u.team] > B.turn) return fail();
        (B.tailwind || (B.tailwind = {}))[u.team] = fieldRounds(4); msg(psT("tailwind", "start", { TEAM: psTeam(u.team) })); ev({ k: "aura", u: u.uid, team: 1 });
        for (const a of allies(u)) addATB(a, .1);   // (the owner's rule: +10% turn meter for the user and its partners on the field)
        return true;
      case "auroraveil":
        if (!(inWeather("hail") || inWeather("snow")) || has(u, "VEIL")) return fail();
        addSide(u.team, "VEIL", item(u, "lightclay") ? 8 : 5); msg(`Aurora Veil made ${u.team === "A" ? "your team" : "the opposing team"} stronger against physical and special moves!`); ev({ k: "aura", u: u.uid, team: 1 }); return true;
      case "luckychant": if (has(u, "LUCKY")) return fail(); addSide(u.team, "LUCKY", 5); msg(`Lucky Chant shielded ${u.team === "A" ? "your team" : "the opposing team"} from critical hits!`); return true;
      case "trickroom":
        if (B.trickRoom > B.turn) { B.trickRoom = 0; msg("The twisted dimensions returned to normal!"); ev({ k: "terrain", t: B.terrain && B.terrain.t, tr: 0 }); return true; }
        B.trickRoom = fieldRounds(item(u, "roomservice") ? 8 : 5); msg(`${Nm(u)} twisted the dimensions!`); ev({ k: "terrain", t: B.terrain && B.terrain.t, tr: 1 }); return true;   // (Room Service: 8 rounds, the owner's rule)
      case "terrain": {
        const tt = TERRAIN_MOVE[sk.key]; if (B.terrain && B.terrain.t === tt) return fail();
        setTerrain(u, tt); return true;
      }
      case "yawn": if (!t || t.status || has(t, "YAWN") || inTerrain("electric", t) || inTerrain("misty", t)) return fail(); addEff(t, "YAWN", 1, u, true); effOf(t, "YAWN").skip = true; msg(psT("yawn", "start", { POKEMON: nm(t) })); return true;
      case "curse":
        if (u.types.includes("Ghost")) {
          if (!t || has(t, "CURSE")) return fail();
          applyDamage(null, u, Math.floor(hpBase(u) / 2), { trueDmg: true }); addEff(t, "CURSE", 99, u, true); msg(psT("curse", "start", { SOURCE: nm(u), POKEMON: nm(t) })); return true;
        }
        stage(u, u, "spe", -1); stage(u, u, "atk", 1); stage(u, u, "def", 1); return true;
      case "taunt": { if (!t || has(t, "TAUNT")) return fail(); const ns = tab(u, t, "NO_STATUS"); if (ns && ns.list.includes("TAUNT")) { msg(`${Nm(t)}'s ${t.passives[0].name} prevents it!`); return true; } }
        addEff(t, "TAUNT", 3, u, true); msg(`${Nm(t)} fell for the taunt!`); return true;
      case "gastroacid": if (!t || t.flags.noAbility || item(t, "abilityshield")) return fail(); t.flags.noAbility = true; msg(`${Nm(t)}'s Ability was suppressed!`); return true;
      case "worryseed": if (!t || item(t, "abilityshield")) return fail(); t.passives = [abilityOf("insomnia")]; msg(`${Nm(t)} acquired Insomnia!`); abilityCure(t); return true;   // (it wakes a sleeper)
      case "soak": if (!t) return fail(); t.types = ["Water"]; msg(`${Nm(t)} transformed into the Water type!`); fxEv(t); return true;
      case "reflecttype": if (!t) return fail(); u.types = t.types.slice(); msg(`${Nm(u)}'s type became the same as ${nm(t)}'s type!`); fxEv(u); return true;
      case "conversion": { const ty = u.skills[0] && u.skills[0].type; if (!ty || (u.types.length === 1 && u.types[0] === ty)) return fail(); u.types = [ty]; msg(`${Nm(u)} transformed into the ${ty} type!`); fxEv(u); return true; }
      case "camouflage": { const ty = (B.terrain && TERRAIN_TYPE[B.terrain.t]) || "Normal"; u.types = [ty]; msg(`${Nm(u)} transformed into the ${ty} type!`); fxEv(u); return true; }
      case "magnetrise": if (has(u, "MAGNETRISE")) return fail(); addEff(u, "MAGNETRISE", 5, u, true); msg(`${Nm(u)} levitated with electromagnetism!`); return true;
      case "meanlook": if (!t || has(t, "NOSWITCH")) return fail(); if (tab(u, t, "RUN_AWAY")) { msg(`${Nm(t)}'s Run Away keeps it from being trapped!`); return true; } addEff(t, "NOSWITCH", 99, u, true); msg(`${Nm(t)} can no longer escape!`); return true;
      case "destinybond": addEff(u, "DBOND", 99, u, true); msg(`${Nm(u)} is hoping to take its attacker down with it!`); return true;
      case "lockon": addEff(u, "LOCKON", 2, u, true); msg(`${Nm(u)} took aim at ${t ? nm(t) : "the target"}!`); return true;
      case "laserfocus": addEff(u, "LASER", 2, u, true); msg(`${Nm(u)} concentrated intensely!`); return true;
      case "acupressure": { const st = ["atk", "def", "spa", "sdf", "spe", "acc", "eva"].filter(s => u.stages[s] < 6); if (!st.length) return fail(); stage(u, u, pick(st), 2); return true; }
      case "powerswap": case "guardswap": {
        if (!t) return fail(); for (const s of sp === "powerswap" ? ["atk", "spa"] : ["def", "sdf"]) [u.stages[s], t.stages[s]] = [t.stages[s], u.stages[s]];
        msg(psT("default", sp === "powerswap" ? "swapOffensiveBoost" : "swapDefensiveBoost", { POKEMON: nm(u) })); fxEv(u); fxEv(t); return true;
      }
      case "speedswap": if (!t) return fail(); [u.max.spe, t.max.spe] = [t.max.spe, u.max.spe]; msg(`${Nm(u)} switched Speed with its target!`); return true;
      case "roleplay": if (!t || !t.passives[0] || ["TRACE", "IMPOSTER", "NONE"].includes(t.passives[0].id)) return fail(); u.passives = [abilityOf(t.passives[0].key)]; msg(psT("roleplay", "changeAbility", { POKEMON: nm(u), SOURCE: nm(t), ABILITY: t.passives[0].name })); abilityCure(u); return true;
      case "skillswap": if (!t || item(t, "abilityshield") || item(u, "abilityshield")) return fail(); [u.passives, t.passives] = [t.passives, u.passives]; msg(`${Nm(u)} swapped Abilities with its target!`); abilityCure(u); abilityCure(t); return true;
      case "trick": {
        if (!t || (!u.held && !t.held) || tab(u, t, "STICKY")) return fail();
        [u.held, t.held] = [t.held, u.held]; [u.flags.itemUsed, t.flags.itemUsed] = [t.flags.itemUsed, u.flags.itemUsed];
        msg(`${Nm(u)} switched items with its target!`); if (!u.held) u.flags.unburden = true; if (!t.held) t.flags.unburden = true; return true;
      }
      case "helpinghand": { const a = allies(u).find(x => x !== u); if (!a) return fail(); addEff(a, "HELPED", 2, u, true); msg(`${Nm(u)} is ready to help ${nm(a)}!`); return true; }
      case "followme": addEff(u, "FOLLOWME", 99, u, true); { const fe = effOf(u, "FOLLOWME"); if (fe) { fe.powder = !!sk.M.pw; fe.at = B.fmSeq = (B.fmSeq || 0) + 1; } } msg(`${Nm(u)} became the center of attention!`); return true;   // (until the user leaves the field: the owner's rule)
      case "venomdrench": {
        const ps = targets.filter(x => x.status === "PSN" || x.status === "TOX"); if (!ps.length) return fail();
        for (const x of ps) { stage(u, x, "atk", -1); stage(u, x, "spa", -1); stage(u, x, "spe", -1); } return true;
      }
      case "rototiller": case "flowershield": {
        const g = B.units.filter(x => x.alive && x.types.includes("Grass")); if (!g.length) return fail();
        for (const x of g) { if (sp === "rototiller") { stage(u, x, "atk", 1); stage(u, x, "spa", 1); } else stage(u, x, "def", 1); } return true;
      }
      case "magneticflux": { const e = allies(u).filter(x => x.types.includes("Electric")); if (!e.length) return fail(); for (const x of e) { stage(u, x, "def", 1); stage(u, x, "sdf", 1); } return true; }
      case "dragoncheer": { const a = allies(u).filter(x => x !== u); if (!a.length) return fail(); for (const x of a) addEff(x, "FOCUS", 99, u, true); msg("Your team is getting pumped!".replace("Your team", u.team === "A" ? "Your team" : "The opposing team")); return true; }
    }
    return false;
  }
  function useMove(u, sk, targets) {
    const M = sk.M, sp = M.sp;
    if (sp === "sleeptalk") { msg("But it failed!"); return; }   // only works while asleep (canMove)
    if (sp === "snore" && u.status !== "SLP") { msg("But it failed!"); return; }
    if (sp === "naturepower") return callMove(u, ({ electric: "thunderbolt", grassy: "energyball", misty: "moonblast", psychic: "psychic" })[B.terrain && B.terrain.t] || "triattack", sk.slot);
    // Copycat and Mirror Move (the owner's rules, 2026-10-16): like Sketch, the move the opposing target has in this move's slot, used at
    // once with the user's own stats (act: sketchUse, through B.sketched), but only this once: the Copycat or Mirror Move stays
    if (sp === "copycat" || sp === "mirrormove") { const t = targets[0], tm = t && t.team !== u.team && t.alive && t.skills.find(x => x.slot === sk.slot && x.key !== "struggle");
      if (!tm || !copyable(tm.key)) { msg("But it failed!"); return; }
      msg(`${Nm(u)} copied ${nm(t)}'s ${tm.name}!`); B.sketched = { u, sk: makeSkill(tm.key, sk.slot), t }; return; }
    if (sp === "assist") { const pool = [...allies(u), ...benchOf(u.team)].filter(x => x !== u).flatMap(x => x.skills).filter(s => !CALL_BAN.has(s.key) && MOVES[s.key]); return pool.length ? callMove(u, pick(pool).key, sk.slot) : msg("But it failed!"); }
    if (sp === "mefirst") {
      const tg = targets[0], best = tg && tg.skills.filter(s => s.M.c !== "X" && !CALL_BAN.has(s.key) && skillReady(tg, s)).sort((a, b) => b.pow - a.pow)[0];
      if (!best) { msg("But it failed!"); return; }
      B.meFirst = true; try { callMove(u, best.key, sk.slot); } finally { B.meFirst = false; } return;
    }
    if (sp === "bide") {   // (going off: bideStrikes; called by another move, it does nothing)
      const b = u.flags.bide; if (!B.biding || !b) { msg("But it failed!"); return; }
      u.flags.bide = null; removeEff(u, "BIDE"); msg(`${Nm(u)} unleashed its energy!`);
      const tg = b.by != null && B.byId(b.by);
      if (!tg || !tg.alive || !B.units.includes(tg) || !b.dmg) { msg("But it failed!"); return; }
      applyDamage(u, tg, Math.max(1, b.dmg * 2), { cat: "P" }); return;
    }
    if (sp === "future") {   // Future Sight and Doom Desire (the owner's rule): the whole other side on the field takes it 2 rounds later
      if ((B.future || []).some(f => f.by === u.uid)) { msg("But it failed!"); return; }
      (B.future || (B.future = [])).push({ team: foeTeam(u), by: u.uid, key: sk.key, at: fieldRounds(2) });
      msg(sk.key === "doomdesire" ? `${Nm(u)} chose Doom Desire as its destiny!` : `${Nm(u)} foresaw an attack!`); return;
    }
    if ((sp === "naturalgift" && !(heldX(u) && NG[u.held] && berryOk(u))) || (sp === "fling" && (!heldX(u) || /gem$/.test(u.held))) || (sp === "spitup" && !u.flags.stock)) { msg("But it failed!"); return; }
    if (sp === "fling") B.flung = u.held;
    // the counters hit back at the attacker that set them off (counterStrikes)
    if (COUNTERS[sp]) {
      const by = B.counterBy;
      if (!by || !by.alive || !B.units.includes(by)) { msg("But it failed!"); return; }
      targets = [by];
    }
    if (sp === "splash") { msg("But nothing happened!"); return; }
    if (SELF_KO.has(sp) && damp()) { msg(psT("damp", "block", { SOURCE: nm(u), MOVE: M.n })); return; }
    if (sp === "metronome") {
      const k = pick(METRONOME), virt = { ...makeSkill(k, sk.slot), slot: sk.slot, cd: 0 };
      msg(`Waggling a finger let it use ${virt.name}!`);
      ev({ k: "act", u: u.uid, slot: sk.slot, key: virt.key, name: virt.name, type: virt.type, cat: virt.cat, anim: virt.anim, s3: false, t: null, tgt: virt.target, quiet: 1 });
      const tg = virt.target === "aoe_enemies" ? enemies(u) : virt.target === "self" ? [u] : virt.target === "team" ? allies(u) : [defaultTarget(u, virt)].filter(Boolean);
      return useMove(u, virt, tg);
    }
    if (sp === "transform") return transform(u, targets[0]);
    // Protect and Detect: moves from the other side fail against it until its next turn
    if (sp === "feint") for (const x of targets) if (has(x, "PROTECT")) { removeEff(x, "PROTECT"); msg(`${Nm(x)} fell for the feint!`); }
    if (sk.key === "phantomforce" || sk.key === "shadowforce") for (const x of targets) if (has(x, "PROTECT")) { removeEff(x, "PROTECT"); msg(psT(sk.key, "activate", { TARGET: nm(x) })); }
    // Psychic Terrain: a priority move can't touch a Pokémon of the other side that's on the ground (as in the main games)
    if (M.pri > 0) { const pt = targets.filter(x => x.team !== u.team && inTerrain("psychic", x)); for (const x of pt) msg(`${Nm(x)} is protected by the Psychic Terrain!`); if (pt.length) { targets = targets.filter(x => !pt.includes(x)); if (!targets.length) return; } }
    if (M.pri > 0) { const blk = targets.find(x => x.team !== u.team && allies(x).some(a => tab(u, a, "NO_PRIORITY"))); if (blk) { const a = allies(blk).find(a => pv(a, "NO_PRIORITY")); msg(`${Nm(a)}'s ${a.passives[0].name} makes ${M.n} fail!`); return; } }
    if (M.c === "X") {   // Crafty Shield and Good as Gold: the other side's status moves can't reach them
      const blk = targets.filter(x => x.team !== u.team && (has(x, "CRAFTY") || tab(u, x, "GOOD_AS_GOLD")));
      for (const x of blk) msg(has(x, "CRAFTY") ? `${Nm(x)} is protected by Crafty Shield!` : `${Nm(x)}'s Good as Gold makes it immune!`);
      if (blk.length) { targets = targets.filter(x => !blk.includes(x)); if (!targets.length) return; }
    }
    const guarded = x => (has(x, "PROTECT") && !(M.c === "X" && ATTACK_ONLY.has(effOf(x, "PROTECT").shield))) || (M.c !== "X" && has(x, "MATBLOCK")) || (M.pri > 0 && has(x, "QUICKGUARD")) || (sk.target === "aoe_enemies" && has(x, "WIDEGUARD"));
    const shielded = targets.filter(x => x.team !== u.team && guarded(x) && !(M.ct && pv(u, "UNSEEN_FIST")));
    for (const x of shielded) { msg(`${Nm(x)} protected itself!`); if (has(x, "PROTECT")) shieldHit(x, u, sk); }
    if (shielded.length) { targets = targets.filter(x => !shielded.includes(x)); if (!targets.length) return; }
    // a status move can't reach a Pokémon that's out of reach either
    if (M.c === "X" && sk.target === "enemy") {
      const away = targets.filter(x => x.team !== u.team && outOfReach(u, x, sk));
      for (const x of away) msg(psT("default", "miss", { POKEMON: nm(x) }));
      if (away.length) { targets = targets.filter(x => !away.includes(x)); if (!targets.length) return; }
    }
    if (sp === "endeavor" && targets[0] && targets[0].hp <= u.hp) { msg("But it failed!"); return; }
    if (sp === "brickbreak" && targets[0] && allies(targets[0]).some(a => has(a, "REFLECT") || has(a, "LSCREEN") || has(a, "VEIL"))) {
      for (const id of ["REFLECT", "LSCREEN", "VEIL"]) clearSide(targets[0].team, id);
      msg("It shattered the barrier!");
    }
    if (OHKO.has(sp) && targets[0] && (targets[0].boss || targets[0].lvl > u.lvl)) { msg(`${Nm(targets[0])} is unaffected!`); return; }
    const dmgMove = M.c !== "X";
    if (dmgMove) {
      let total = 0, anyHit = false;
      const aoe = sk.target === "aoe_enemies";
      // Magnitude: 4 to 10 (10 to 150 power), as in the games; Loaded Dice makes it a 10 (a house rule)
      if (MAG_ROLL.has(sk.key)) {
        let r = R() * 100; const row = item(u, "loadeddice") ? [10, 150] : MAGNITUDE.find(m => (r -= m[2]) < 0) || MAGNITUDE[3];
        if (sp === "magnitude") msg(psT("magnitude", "activate", { NUMBER: row[0] })); sk = { ...sk, pow: row[1], rolled: row[1] };
      }
      // Pledges: a different one from a teammate since this Pokémon's last turn makes this the combined move
      let combo = null;
      if (PLEDGE[sk.key]) {
        const lp = B.lastPledge;
        if (lp && lp.team === u.team && lp.by !== u.uid && lp.key !== sk.key && lp.turn > (u.actT == null ? -1 : u.actT)) {
          combo = PLEDGE_COMBO[[PLEDGE[lp.key], PLEDGE[sk.key]].sort().join("+")]; B.lastPledge = null;
          msg(psT("default", "combine")); sk = { ...sk, pow: 150, type: combo[0], M: { ...sk.M, t: combo[0] } };
        } else B.lastPledge = { team: u.team, key: sk.key, by: u.uid, turn: B.turn };
      }
      // Skull Bash and Meteor Beam (the owner's rule): the user's stat rises before the damage
      if (M.pre && M.st && M.sw === "self") for (const [s, n] of M.st) stage(u, u, s, n);
      const nHits = !sk.hits ? 1 : pv(u, "SKILL_LINK") ? sk.hits[1] : sk.hits[0] === sk.hits[1] ? sk.hits[0] : item(u, "loadeddice") ? sk.hits[1] : pick([2, 2, 2, 3, 3, 3, 4, 5].filter(n => n >= sk.hits[0] && n <= sk.hits[1]));
      for (const x of targets) {
        if (!x.alive || !u.alive) continue;
        if (R() >= accOf(u, x, sk)) {
          ev({ k: "atk", a: u.uid, t: [x.uid], anim: sk.anim, type: sk.type, aoe: aoe ? 1 : 0, miss: 1, sp: sk.slot > 1 }); msg(`${Nm(x)} avoided the attack!`); ev({ k: "txt", u: x.uid, s: "MISS", c: "txt" });
          if (item(u, "blunderpolicy")) { useUp(u, `${Nm(u)}'s Blunder Policy kicked in!`); stage(u, u, "spe", 2); }
          if (M.crash) chip(u, u.max.hp / 4, `${Nm(u)} kept going and crashed!`);   // (a quarter of its max HP: the owner's rule)
          continue;
        }
        if (OHKO.has(sp) && tab(u, x, "STURDY")) { msg(`${Nm(x)}'s Sturdy keeps the one-hit KO off!`); continue; }
        if (OHKO.has(sp)) { ev({ k: "atk", a: u.uid, t: [x.uid], anim: sk.anim, type: sk.type, sp: 1 }); applyDamage(u, x, x.hp, { bypassSub: true }); msg("It's a one-hit KO!"); anyHit = true; continue; }
        if (sp === "spectralthief" && x.team !== u.team) stealBoosts(u, x);
        // (fx: this attack on this target; it flinches at most once, however many strikes roll it)
        let effSeen = null, hitsDone = 0, dealtHere = 0; const fx = {};
        for (let h = 0; h < nHits; h++) {
          if (!x.alive || !u.alive) break;
          if (h > 0 && axelLike(sk) && !item(u, "loadeddice") && R() >= accOf(u, x, sk)) break;   // each strike of Triple Axel (and Ash-Greninja's Water Shuriken) can miss; with Loaded Dice every strike lands once the first does
          ev({ k: "atk", a: u.uid, t: [x.uid], anim: sk.anim, type: sk.type, aoe: aoe ? 1 : 0, h, n: nHits, sp: sk.slot > 1 });
          B.hitIdx = h;
          const r = attackOnce(u, x, sk, h === 0);
          if (r.immune || r.absorbed) break;
          hitsDone++; anyHit = true; dealtHere += r.dealt; total += r.dealt; effSeen = r.e;
          // each strike of a multi-strike move rolls the added effects, as in the games: King's Rock, Razor Fang and Stench flinch,
          // Twineedle's poison, Double Iron Bash's flinch (the owner's ask, 2026-10-16); a single strike rolls them after its messages
          if (nHits > 1) secondary(u, x, sk, fx);
        }
        if (nHits > 1 && hitsDone) msg(`The Pokémon was hit ${hitsDone} time${hitsDone > 1 ? "s" : ""}!`);
        if (effSeen > 1) { msg(`It's super effective${aoe ? ` on ${nm(x)}` : ""}!`); if (u.team === "A") B.tally.superEff++; }
        else if (effSeen != null && effSeen < 1) msg(psT("default", aoe ? "resistedSpread" : "resisted", { POKEMON: nm(x) }));
        B.hitIdx = 0;
        if (hitsDone && nHits === 1) secondary(u, x, sk, fx);
        if (hitsDone) afterHit(u, x, sk);
        if (hitsDone && sp === "fellstinger" && !x.alive && u.alive) stage(u, u, "atk", 3);   // Fell Stinger: Attack +3 on a knockout
        if (hitsDone && sp === "flameburst") for (const q of allies(x)) if (q !== x) chip(q, hpBase(q) / 16, psT("flameburst", "damage", { POKEMON: nm(q) }));
        if (hitsDone && sp === "smackdown" && x.alive) smackDown(x);
        if (hitsDone && sp === "thousandarrows" && x.alive) smackDown(x);
        // Thousand Waves, Anchor Shot, Spirit Shackle (the owner's rule): Arena Trap's effect on each Pokémon hit, its turn meter gone
        if (hitsDone && sp === "anchor" && x.alive && x.team !== u.team && !pv(x, "RUN_AWAY")) { x.atb = 0; ev({ k: "tm", u: x.uid, tm: 0, v: -100 }); msg(`${Nm(x)} can't get away!`); }
        // Core Enforcer: suppresses the Ability of a Pokémon that has moved since the user's last turn (this game's "already moved this turn")
        if (hitsDone && sp === "coreenforcer" && x.alive && x.actT != null && x.actT > (u.actT == null ? -1 : u.actT) && !x.flags.noAbility && !item(x, "abilityshield") && x.passives[0] && x.passives[0].id !== "NONE") { x.flags.noAbility = true; msg(`${Nm(x)}'s Ability was suppressed!`); }
        // Shell Trap: a Pokémon an opposing attack damaged strikes back once the attack is over (shellTraps)
        if (dealtHere > 0 && x.alive && x.team !== u.team && !B.shellTrapping && x.skills.some(k => k.M.sp === "shelltrap") && !(B.shellQ || (B.shellQ = [])).includes(x.uid)) B.shellQ.push(x.uid);
        // Counter, Mirror Coat, Metal Burst and Comeuppance (the owner's rule, 2026-10-16) go off the same way: a Pokemon an opposing
        // attack of their kind damaged (physical for Counter, special for Mirror Coat, either for the other two) strikes back (counterStrikes)
        if (dealtHere > 0 && x.alive && x.team !== u.team && !B.shellTrapping && (M.c === "P" || M.c === "S") && x.skills.some(k => COUNTERS[k.M.sp]) && !(B.counterQ || (B.counterQ = [])).some(q => q[0] === x.uid)) B.counterQ.push([x.uid, u.uid, M.c]);
        if (sp === "payday" && hitsDone && u.team === "A") { B.tally.payday += 2 * u.lvl; msg("Coins were scattered everywhere!"); }
      }
      // drain, recoil, self-KO, recharge
      if (u.alive && M.dr > 0 && total > 0) {
        const n = Math.max(1, Math.round(total * M.dr / 100 * (item(u, "bigroot") ? 1.3 : 1))), oozer = targets.find(x => pv(x, "OOZE"));
        if (oozer) chip(u, n, `${Nm(u)} sucked up the liquid ooze!`); else heal(u, n, sp === "dreameater" && targets[0].status === "SLP" ? `${Nm(targets[0])}'s dream was eaten!` : `${Nm(targets[0])} had its energy drained!`);
      }
      if (u.alive && M.dr < 0 && total > 0 && !pv(u, "ROCK_HEAD")) chip(u, Math.max(1, total * -M.dr / 100), `${Nm(u)} was damaged by the recoil!`);
      if (u.alive && sp === "steelbeam") chip(u, u.max.hp / 4, `${Nm(u)} lost some of its HP!`);   // (a quarter of its max HP, hit or miss: the owner's rule)
      const sheered = pv(u, "SHEER_FORCE") && (M.ail || M.fl || (M.st && M.sw !== "self") || SECONDARY_SP.has(sp));
      if (u.alive && item(u, "lifeorb") && anyHit && !sheered) chip(u, u.max.hp / 10, `${Nm(u)} lost some of its HP!`);
      if (u.alive && item(u, "shellbell") && total > 0) heal(u, total / 8);
      if (u.alive && M.st && M.sw === "self" && !M.pre && anyHit && R() < M.sc / 100) for (const [s, n] of M.st) stage(u, u, s, n);
      if ((sp === "icespinner" || sk.key === "steelroller") && anyHit && B.terrain) endTerrain();
      if (mtype(u, sk) === "Electric") removeEff(u, "CHARGE");   // Charge is spent on the next Electric move
      if (combo) pledgeField(u, combo[1]);
      // Pollen Puff (the owner's rule): the attack, and every partner on the field gets half its max HP back
      if (sp === "pollenpuff" && u.alive) for (const q of allies(u)) if (q !== u) heal(q, hpBase(q) / 2, psT("default", "heal", { POKEMON: nm(q) }));
      // Uproar (the owner's rule): nobody on the field can fall asleep for 3 rounds
      if (sp === "uproar" && u.alive && !(B.uproar && B.uproar.until > B.turn)) { B.uproar = { until: fieldRounds(3), by: u.uid }; msg(psT("uproar", "start", { POKEMON: nm(u) })); }   // (one going on isn't stretched: it still hits)
      if (SELF_KO.has(sp) && u.alive) { u.hp = 0; ev({ k: "dmg", u: u.uid, n: 0, hp: 0, sh: 0, dot: 1 }); kill(u, null); }
      if (sp === "rapidspin" && u.alive && anyHit) {
        if (has(u, "TRAP") || has(u, "SEED")) { removeEff(u, "TRAP"); removeEff(u, "SEED"); msg(`${Nm(u)} spun free!`); }
        clearHazards(u.team);
      }
      if (RAMPAGE.has(sk.key) && u.alive && anyHit) tryStatus(u, u, "CNF", false);   // (the owner's rule: confused after it, no lock)
      if (sp === "burnup" && u.alive && anyHit && u.types.includes(M.t)) { u.types = u.types.filter(t => t !== M.t); if (!u.types.length) u.types = ["???"]; msg(M.t === "Fire" ? `${Nm(u)} burned itself out!` : `${Nm(u)} used up all its electricity!`); fxEv(u); }
      if (sp === "naturalgift") useUp(u);
      if (sp === "fling" && B.flung) { const it = B.flung, x = targets[0]; B.flung = null; useUp(u, `${Nm(u)} flung its ${HELD[it].n}!`); if (anyHit && x && x.alive) flingFx(u, x, it); }
      if (sp === "spitup" && u.alive) { const n = u.flags.stock || 0; u.flags.stock = 0; stage(u, u, "def", -n); stage(u, u, "sdf", -n); }
      if ((sk.key === "surf" || sk.key === "dive") && u.alive && pv(u, "GULP") && !u.flags.gulp) { u.flags.gulp = u.hp > u.max.hp / 2 ? "arrokuda" : "pikachu"; msg(`${Nm(u)} caught ${u.flags.gulp === "arrokuda" ? "an Arrokuda" : "a Pikachu"}!`); }
      if (sp === "hazardhit" && u.alive && anyHit) { const side = foeTeam(u), hz = sideHz(side);
        if (sk.key === "stoneaxe") { if (!hz.sr) { hz.sr = 1; msg(`Pointed stones float in the air around ${psTeam(side)}!`); hzEv(side); } }
        else if (hz.spikes < 3) { hz.spikes++; msg(psT("spikes", "start", { TEAM: psTeam(side) })); hzEv(side); } }
      // U-turn, Volt Switch, Flip Turn: back to the trainer, who picks who comes in
      if (sp === "uturn" && u.alive && anyHit && benchOf(u.team).length && !B.over) B.pivotQ.push({ uid: u.uid });
      // Red Card: the attacker is dragged out
      for (const x of targets) if (x.redCard && u.alive && B.units.includes(u) && benchOf(u.team).length && !u.boss) { x.redCard = false; useUp(x, `${Nm(x)} held up its Red Card against ${nm(u)}!`); switchOut(u, pick(benchOf(u.team)), true); break; }
      return;
    }
    // ---- status moves ----
    if (sp === "haze") { for (const x of B.units) if (x.alive) { x.stages = newStages(); fxEv(x); } msg("All stat changes were eliminated!"); return; }
    if (sp === "rest") {
      if (uproarOn()) { msg(psT("uproar", "blockSelf", { POKEMON: nm(u) })); return; }
      if (inWeather("sun") && pv(u, "LEAF_GUARD")) { msg("But it failed!"); return; }
      if (u.hp >= u.max.hp && !u.status) { msg("But it failed!"); return; }
      if (inTerrain("electric", u) || inTerrain("misty", u)) { msg("But it failed!"); return; }   // (it can't fall asleep there)
      u.status = null; tryStatus(u, u, "SLP", false, { turns: 2 }); heal(u, hpBase(u)); msg(`${Nm(u)} slept and became healthy!`); return;
    }
    if (sp === "reflect" || sp === "lightscreen" || sp === "mist") {
      const id = { reflect: "REFLECT", lightscreen: "LSCREEN", mist: "MIST" }[sp];
      if (has(u, id)) { msg("But it failed!"); return; }   // (already up: it doesn't start over, as in the main games)
      addSide(u.team, id, id !== "MIST" && item(u, "lightclay") ? 8 : 5);   // (a Light Clay lengthens the screens, not Mist)
      msg({ REFLECT: "Reflect made your team stronger against physical moves!", LSCREEN: "Light Screen made your team stronger against special moves!", MIST: "Your team became shrouded in mist!" }[id].replace("Your team", u.team === "A" ? "Your team" : "The opposing team").replace("your team", u.team === "A" ? "your team" : "the opposing team"));
      ev({ k: "aura", u: u.uid, team: 1 });
      return;
    }
    if (sp === "focusenergy") { if (has(u, "FOCUS")) { msg("But it failed!"); return; } addEff(u, "FOCUS", 99, u, true); msg(`${Nm(u)} is getting pumped!`); return; }
    if (sp === "protect" || sp === "detect") { addEff(u, "PROTECT", 99, u, true); const pe = effOf(u, "PROTECT"); if (pe) pe.shield = sk.key; msg(`${Nm(u)} protected itself!`); ev({ k: "aura", u: u.uid }); return; }
    if (sp === "endure") { addEff(u, "ENDURE", 99, u, true); msg(`${Nm(u)} braced itself!`); return; }
    if (sp === "safeguard") {
      if (has(u, "SAFEGUARD")) { msg("But it failed!"); return; }
      addSide(u.team, "SAFEGUARD", 5);
      msg(psT("safeguard", "start", { TEAM: psTeam(u.team) })); ev({ k: "aura", u: u.uid, team: 1 }); return;
    }
    if (WX_MOVE[sp]) {
      // weather from a move lasts about five rounds, then the battle's own weather (if any) comes back
      const w = WX_MOVE[sp]; if (B.weather === w) { msg("But it failed!"); return; }
      const rock = { sun: "heatrock", rain: "damprock", sand: "smoothrock", hail: "icyrock", snow: "icyrock" }[w];
      B.weather = w; B.wxEnd = fieldRounds(item(u, rock) ? 8 : 5);
      for (const x of B.units) if (x.alive) formCheck(x);   // (Castform's Forecast)
      msg(sp === "snowscape" ? psT("snowscape", "start") || WEATHER[w].turn : WEATHER[w].turn); ev({ k: "weather", w }); return;
    }
    if (sp === "bellydrum") {
      if (u.hp <= hpBase(u) / 2 || u.stages.atk >= 6) { msg("But it failed!"); return; }
      applyDamage(null, u, Math.floor(hpBase(u) / 2), { trueDmg: true }); u.stages.atk = 6;
      msg(`${Nm(u)} cut its own HP and maximized its Attack!`); ev({ k: "txt", u: u.uid, s: "Atk ▲6", c: "buff" }); fxEv(u); return;
    }
    if (sp === "psychup") { const t = targets[0]; if (!t) { msg("But it failed!"); return; } u.stages = { ...t.stages }; msg(`${Nm(u)} copied ${nm(t)}'s stat changes!`); fxEv(u); return; }
    if (sp === "refresh") { if (!["BRN", "PSN", "TOX", "PAR"].includes(u.status)) { msg("But it failed!"); return; } u.status = null; u.sTurn = 0; msg(`${Nm(u)}'s status returned to normal!`); fxEv(u); return; }
    if (sp === "charge") { addEff(u, "CHARGE", 99, u, true); msg(psT("charge", "start", { POKEMON: nm(u) })); }
    if (sp === "defensecurl") addEff(u, "DEFCURL", 99, u, true);
    if (sp === "minimize") addEff(u, "MINIMIZE", 99, u, true);
    if (sk.target === "partners" && !targets.length) { msg("But it failed!"); return; }
    if (statusMove(u, sk, targets)) return;
    if (sp === "aromatherapy") {
      msg("A soothing aroma wafted through the area!");
      for (const a of [...allies(u), ...benchOf(u.team)]) if (a.status) { a.status = null; a.sTurn = 0; fxEv(a); }
      ev({ k: "aura", u: u.uid, team: 1 }); return;
    }
    if (sp === "substitute") {
      if (u.shield > 0 || u.hp <= u.max.hp / 4) { msg(u.shield > 0 ? `${Nm(u)} already has a substitute!` : "But it does not have enough HP left to make a substitute!"); return; }
      applyDamage(null, u, Math.floor(hpBase(u) / 4), { trueDmg: true }); u.shield = Math.floor(hpBase(u) / 4); addEff(u, "SUB", 99, u, true); msg(`${Nm(u)} put in a substitute!`); return;
    }
    if (sp === "roar") {
      for (const x of targets) {
        if (!x.alive) continue;
        if (pv(x, "SUCTION") || pv(x, "GUARD_DOG")) { msg(`${Nm(x)} anchors itself with Suction Cups!`); continue; }
        msg(`${Nm(x)} was scared off!`);
        const b = benchOf(x.team);
        if (b.length && !x.boss && !(B.wild && x.team === "E")) { switchOut(x, pick(b), true); continue; }
        x.atb = 0; x.stages = newStages(); ev({ k: "tm", u: x.uid, tm: 0, v: -100, quiet: 1 }); fxEv(x);
      }
      return;
    }
    if (M.hl || sp === "recover" || sp === "softboiled") {
      const fh = sk.key === "floralhealing" && B.terrain && B.terrain.t === "grassy" ? 4 / 3 : 1;   // (Floral Healing: two thirds in Grassy Terrain)
      for (const x of targets) if (!heal(x, hpBase(x) * (M.hl || 50) / 100 * fh * mastery(u, sk), `${Nm(x)} had its HP restored.`)) msg(`${Nm(x)}'s HP is full!`);
      return;
    }
    let any = false;
    for (const x of targets) {
      if (!x.alive) continue;
      const foe = x.team !== u.team;
      if (foe && R() >= accOf(u, x, sk)) { msg(`${Nm(x)} avoided the attack!`); ev({ k: "txt", u: x.uid, s: "MISS", c: "txt" }); continue; }
      if (foe && M.so && pv(x, "SOUNDPROOF")) { msg(`${Nm(x)}'s Soundproof blocks the move!`); continue; }
      if (foe && tab(u, x, "GOOD_AS_GOLD")) { msg(`${Nm(x)}'s Good as Gold makes it immune!`); continue; }
      if (foe && M.pw && (x.types.includes("Grass") || item(x, "safetygoggles") || tab(u, x, "OVERCOAT"))) { msg(`It doesn't affect ${nm(x)}...`); continue; }
      if (foe && M.t === "Electric" && M.ail && typeEff("Electric", x.types) === 0 && !item(u, "ringtarget")) { msg(`It doesn't affect ${nm(x)}...`); continue; }
      if (foe && x.shield > 0 && !M.so && !pv(u, "INFILTRATOR")) { msg("But it failed!"); continue; }
      // Magic Coat (the owner's rule, 2026-10-19): it can't be chosen. A Pokémon that knows it, ready, bounces a status move aimed at
      // it back by itself (not its turn: the move goes on cooldown, like Counter), and any other until its next turn
      if (foe && !B.bouncing && (M.ail || M.st) && !tab(u, x, "MAGIC_BOUNCE") && !has(x, "MAGICCOAT")) { const mc = reactReady(x, "magiccoat"); if (mc) { x.cool[mc.slot] = cdOf(x, mc); reactEv(x, mc, null); addEff(x, "MAGICCOAT", 1, x, true); } }
      // Magic Bounce: the move comes back at its user (once: a bounced move doesn't bounce again)
      if (foe && !B.bouncing && (tab(u, x, "MAGIC_BOUNCE") || has(x, "MAGICCOAT")) && (M.ail || M.st)) { msg(`${Nm(x)} bounced the ${M.n} back!`); B.bouncing = true; try { if (M.ail) tryStatus(x, u, M.ail, true, { direct: true }); if (M.st) for (const [s2, n2] of M.st) stage(x, u, s2, n2); } finally { B.bouncing = false; } continue; }
      if (M.ail) { if (tryStatus(u, x, M.ail, sk.target !== "aoe_enemies", { sound: !!M.so, direct: true })) any = true; }
      if (M.st) for (const [s, n] of M.st) if (stage(u, x, s, sp === "growth" && inWeather("sun") ? 2 * n : n)) any = true;   // (Growth: +2 each in harsh sunlight)
    }
    if (M.ail === "DISABLE" && !any) { /* message already shown */ }
    if (sk.anim === "buff") ev({ k: "aura", u: u.uid, team: sk.target === "team" ? 1 : 0 });
  }

  B.has = has; B.targetable = targetable; B.allies = allies; B.enemies = enemies; B.predictOrder = predictOrder;
  B.byId = uid => B.units.find(x => x.uid === uid) || B.bench.A.find(x => x.uid === uid) || B.bench.E.find(x => x.uid === uid) || B.gone.find(x => x.uid === uid);
  B.usable = (u, slot) => { const sk = u.skills.find(s => s.slot === slot); return slot === 1 || (!!sk && !SELF_GOING.has(sk.M.sp) && skillReady(u, sk)); };   // (Shell Trap only goes off by itself)
  B.effStat = { spd: effSpd, atk: u => statOf(u, "atk"), def: u => statOf(u, "def"), spa: u => statOf(u, "spa"), sdf: u => statOf(u, "sdf"), spe: u => statOf(u, "spe") };
  B.estimate = (u, t, s) => expectedDamage(u, t, s);
  B.effOn = (u, t, s) => effOn(u, t, s);   // (tests: the type matchup a move gets)
  B.shownStages = shownStages; B.fixedStage = fixedStage;
  B.useMove = (u, slot, t) => act(u, slot, t);   // (tests: a Pokémon uses the move in that slot now, as on its turn)
  B.switchNow = (u, x) => switchOut(u, x, false);   // (tests: a Pokémon switches out for one on its bench)
  B.sendInNow = (team, slot, uid) => { const x = benchOf(team).find(y => y.uid === uid); if (x) sendIn(team, slot, x); };   // (the look-ahead's copies: aiReplacement)
  if (cfg.futureWait != null) FUTURE_WAIT = cfg.futureWait;   // (tools: tuning the wait)
  B.plan = (u, style) => aiPlan(u, style || "balanced");   // (for tests: the scored options)
  // what one move would be worth to this Pokémon right now, were it its ready move (tools/move_worth.js samples it in top-tier
  // battles to teach the optimizer what moves are worth in play: MOVE_WORTH): v, the AI's best option with it; and for Pursuit and
  // Upper Hand, which wait for their trigger, stand: what standing ready is worth (a foe that may pivot or switch out, at double
  // power; a foe with a priority attack ready, whose move it cancels). B.bestWithout: its best option without one slot's move.
  B.bestWithout = (u, slot, fast = true) => {
    const keep = u.skills; u.skills = keep.filter(s => s.slot !== slot);
    try { let v = 0; if (u.skills.length) for (const c of aiPlan(u, "balanced", fast)) if (u.skills.some(s => s.slot === c.slot)) v = Math.max(v, c.v); return v; }
    finally { u.skills = keep; }
  };
  B.worthOf = (u, key, fast = true) => {   // (fast: the AI's quick look, as for a default target)
    const M = MOVES[key]; if (!M || !u.alive || !B.units.includes(u)) return { v: 0, stand: 0 };
    const keep = u.skills, cool = u.cool, sk = makeSkill(key, M.s || 1);
    let v = 0, stand = 0;
    u.skills = [sk]; u.cool = { ...cool, [sk.slot]: 0 };
    try {
      for (const c of aiPlan(u, "balanced", fast)) if (c.slot === sk.slot) v = Math.max(v, c.v);
      if (M.sp === "pursuit" || M.sp === "upperhand") {
        let w = 0;
        for (const f of enemies(u)) {
          if (!f.alive) continue;
          const p = M.sp === "pursuit" ? (f.skills.some(s => PIVOT.has(s.M.sp) && skillReady(f, s)) ? .35 : .05)
            : f.skills.some(s => s.M.pri > 0 && s.M.c !== "X" && skillReady(f, s)) ? .4 : 0;
          if (!p) continue;
          const d = Math.max(0, expectedDamage(u, f, sk)) * (M.sp === "pursuit" ? 2 : 1);
          w += p * (Math.min(1, d / Math.max(1, f.hp)) + (M.sp === "upperhand" && d > 0 ? .3 : 0));
        }
        stand = w;
      }
    } finally { u.skills = keep; u.cool = cool; }
    return { v, stand };
  };
  B.effOn = (u, t, s) => effOn(u, t, s);
  B.damageBy = team => B.units.filter(u => u.team === team).reduce((a, u) => a + (B.dmgDone[u.uid] || 0), 0);
  B.step = () => {
    if (B.over) return "over";
    abScan(); syncFx();
    // U-turn, Volt Switch, Flip Turn, Teleport, Baton Pass: the trainer picks who comes in (you on the picker)
    while (B.pivotQ.length) {
      const pv0 = B.pivotQ.shift(), u = B.units.find(x => x.uid === pv0.uid);
      if (u && u.alive && benchOf(u.team).length && !fieldOn("fairyLock")) {
        if (picks(u.team)) { B.needPick = u.slot; B.needPivot = pv0; B.needTeam = u.team; return "replace"; }
        switchOut(u, aiReplacement(u.team), pv0.keep ? (pv0.keep === "shed" ? { sub: pv0.sub } : "baton") : false); return "sendin";
      }
    }
    // empty places are filled before anyone moves. Each trainer chooses: the opponent first (the best matchup against what's
    // on the field), then you, on the picker even on Auto (B.replace answers); headless battles pick the best matchup
    for (const team of ["E", "A"]) for (const slot of emptySlots(team)) {
      if (!benchOf(team).length) break;
      if (picks(team)) { B.needPick = slot; B.needTeam = team; return "replace"; }
      sendIn(team, slot, aiReplacement(team, slot)); return "sendin";
    }
    const u = advance(); B.actor = u; B.turn++;
    rescaleField();
    if (u.flags.bide) Object.assign(u.flags.bide, { hits: 0, dmg: 0, by: null });   // (Bide counts the attacks between its user's turns)
    // (Follow Me, Rage Powder and Spotlight aren't among them: they last as long as their Pokémon stays on the field, the owner's rule)
    for (const id of ["PROTECT", "ENDURE", "DBOND", "MAGICCOAT", "SNATCH", "GRUDGE"]) if (has(u, id)) removeEff(u, id);
    for (const a of B.units) for (const e of a.eff.slice()) if (["CRAFTY", "MATBLOCK", "QUICKGUARD", "WIDEGUARD", "ALLYSWITCH"].includes(e.id) && e.src === u.uid) removeEff(a, e.id);
    for (const [k, line] of [["gravity", "Gravity returned to normal!"], ["magicRoom", "Magic Room wore off, and held items' effects returned to normal!"],
      ["wonderRoom", "Wonder Room wore off, and Defense and Sp. Def stats returned to normal!"], ["mudSport", "The effects of Mud Sport have faded."],
      ["waterSport", "The effects of Water Sport have faded."], ["ionDeluge", "The deluge of ions stopped."], ["fairyLock", null]]) if (B[k] && B.turn >= B[k]) { B[k] = 0; if (line) msg(line); }
    futureHits();
    if (B.terrain && B.turn >= B.terrain.until) endTerrain();
    if (B.trickRoom && B.turn >= B.trickRoom) { B.trickRoom = 0; msg("The twisted dimensions returned to normal!"); ev({ k: "terrain", t: B.terrain && B.terrain.t, tr: 0 }); }
    for (const tm of ["A", "E"]) for (const fx in (B.pledgeFx && B.pledgeFx[tm]) || {}) if (B.turn >= B.pledgeFx[tm][fx]) { delete B.pledgeFx[tm][fx]; msg(psT(PLEDGE_TXT[fx], "end", { TEAM: psTeam(tm) })); }
    if (B.uproar && B.turn >= B.uproar.until) { const by = B.byId(B.uproar.by); B.uproar = null; if (by) msg(psT("uproar", "end", { POKEMON: nm(by) })); }
    for (const tm of ["A", "E"]) if (B.tailwind && B.tailwind[tm] && B.turn >= B.tailwind[tm]) { B.tailwind[tm] = 0; msg(psT("tailwind", "end", { TEAM: psTeam(tm) })); }
    for (const tm of ["A", "E"]) for (const id in (B.side && B.side[tm]) || {}) if (B.turn >= B.side[tm][id]) { clearSide(tm, id); msg(screenEnd(id, tm)); }
    if (B.wxEnd && B.turn >= B.wxEnd) { const old = B.weather; B.wxEnd = 0; B.weather = B.baseWx; msg(WEATHER[old].end + (B.weather ? " " + WEATHER[B.weather].turn : "")); ev({ k: "weather", w: B.weather }); }
    if (B.wxEnd === 0) for (const x of B.units) if (x.alive) formCheck(x);
    if (u.team === "A") B.allyTurns++;
    u.atb = 0;
    // the turn counter (a turn: every Pokémon on the field acting once, the rounds the field effects last) and what each timed
    // effect has left, for the battle screen (the owner's rule)
    const rd = Math.floor(B.rf || 0) + 1; B.rf = (B.rf || 0) + 1 / (B.perNow || Math.max(2, B.units.filter(x => x.alive).length));
    ev({ k: "turn", u: u.uid, tms: B.units.filter(x => x.alive).map(x => [x.uid, x.atb]), rd, fx: fieldTimers() });
    for (const s in u.cool) if (u.cool[s] > 0) u.cool[s]--;
    if (u.orig && u.orig.cool) for (const s in u.orig.cool) if (u.orig.cool[s] > 0) u.orig.cool[s]--;
    const up = upkeep(u);
    // Flame Orb and Toxic Orb: the holder starts its turn burned or badly poisoned (the first damage comes next turn)
    if (up && u.alive && !u.status && item(u, "toxicorb")) { msg(`${Nm(u)}'s Toxic Orb activated!`); tryStatus(u, u, "TOX", false); }
    else if (up && u.alive && !u.status && item(u, "flameorb")) { msg(`${Nm(u)}'s Flame Orb activated!`); tryStatus(u, u, "BRN", false); }
    if (up && commanding(u)) { ev({ k: "end", u: u.uid }); endTurn(u); return "acted"; }   // (Commander: inside Dondozo, it doesn't act)
    if (!up || !canMove(u)) { if (u.flags.semi) { u.flags.semi = null; ev({ k: "semi", u: u.uid, on: 0 }); } ev({ k: "end", u: u.uid }); endTurn(u); return "acted"; }
    if (u.flags.semi) { const s = u.flags.semi; u.flags.semi = null; act(u, s.slot, B.byId(s.t), s); return "acted"; }
    if (u.team === "A" ? !B.auto : humanT(u.team)) { B.waiting = u; return "input"; }
    const ch = aiChoose(u, u.team === "A" ? B.aiStyle : B.enemyStyle); if (cfg.onDecide) cfg.onDecide(u, ch, B); perform(u, ch); return "acted";
  };
  function perform(u, ch) { if (ch.sw) doSwitch(u, ch.sw); else act(u, ch.slot, ch.t); }
  function doSwitch(u, x) { pursue(u); if (u.alive && B.units.includes(u)) { switchOut(u, x); ev({ k: "end", u: x.uid }); } checkOver(); }
  // Pursuit (the owner's rule): an opposing Pokémon on the field that knows it, has it ready and can move strikes a Pokémon its trainer
  // switches out, or one using a pivot move, before it goes, by itself, at double power; it isn't the striker's turn (its turn meter
  // stays), but Pursuit (an S2 move) goes on cooldown. The one furthest along its turn meter goes.
  // Upper Hand: like Pursuit, the opposing Pokémon on the field that has it ready and can move, furthest along its turn meter, strikes
  // by itself (not its turn: its turn meter stays; Upper Hand, an S2 move, goes on cooldown)
  function upperHand(u) {
    B.upperHanding = true;
    try {
      const ok = f => f.alive && !f.flags.semi && !has(f, "RECHARGE") && !has(f, "SKYDROP") && f.status !== "SLP" && f.status !== "FRZ" && f.skills.some(s => s.M.sp === "upperhand" && skillReady(f, s));
      const f = enemies(u).filter(ok).sort((a, b) => b.atb - a.atb)[0]; if (!f) return;
      act(f, f.skills.find(s => s.M.sp === "upperhand").slot, u, null, true);
    } finally { B.upperHanding = false; }
  }
  function pursue(u) {
    const ok = f => f.alive && !f.flags.semi && !has(f, "RECHARGE") && f.status !== "SLP" && f.status !== "FRZ" && f.skills.some(s => s.M.sp === "pursuit" && skillReady(f, s));
    const f = enemies(u).filter(ok).sort((a, b) => b.atb - a.atb)[0]; if (!f) return;
    u.flags.leaving = true; act(f, f.skills.find(s => s.M.sp === "pursuit").slot, u, null, true); u.flags.leaving = false;
  }
  B.playerAct = (slot, t) => { const u = B.waiting; if (!u) return; if (!B.usable(u, slot)) slot = 1; act(u, slot, t); };
  B.playerSwitch = uid => { const u = B.waiting, x = B.bench[u ? u.team : "A"].find(y => y.uid === uid && y.alive); if (!u || !x || !canSwitch(u)) return false; doSwitch(u, x); return true; };
  B.autoAct = () => { const u = B.waiting; if (!u) return; const ch = aiChoose(u, B.aiStyle); if (cfg.onDecide) cfg.onDecide(u, ch, B); perform(u, ch); };
  // your pick for an empty place (B.step returned "replace"); a missing pick gets the best matchup
  B.replace = uid => {
    const slot = B.needPick, team = B.needTeam || "A"; if (slot == null) return;
    const x = benchOf(team).find(y => y.uid === uid) || aiReplacement(team);
    const piv = B.needPivot; B.needPick = null; B.needPivot = null; B.needTeam = null;
    if (!x) return;
    if (piv) { const u = B.units.find(y => y.uid === piv.uid); if (u && u.alive) switchOut(u, x, piv.keep ? (piv.keep === "shed" ? { sub: piv.sub } : "baton") : false); }
    else sendIn(team, slot, x);
  };
  // what the AI would do for this Pokémon, without doing it (an online battle's timer runs out: the player's own phone works the move
  // out and sends it, so both phones play the same; the Pokémon it would switch to comes back as its uid)
  B.aiChoice = u => { const ch = aiChoose(u, "balanced"); return ch.sw ? { sw: ch.sw.uid } : { slot: ch.slot, t: ch.t ? ch.t.uid : null }; };
  B.benchOf = benchOf; B.canSwitch = canSwitch; B.aiReplacement = aiReplacement; B.aiSwitch = aiSwitch; B.matchup = x => matchup(x, fieldFoes(x.team));

  // ---------- setup ----------
  // three lead, the rest wait on the bench (a probe, the Demo's matchup table, puts everyone on the field)
  const cap = cfg.probe ? 1e9 : ROSTER, lead = cfg.probe ? 1e9 : ACTIVE;
  const clauseOff = [];
  const clause = (specs, team) => { const seen = new Set(); return specs.map(s => { const h = (s.prog && s.prog.held) || s.held;
    if (!ITEM_CLAUSE.includes(h)) return s; if (!seen.has(h)) { seen.add(h); return s; }
    clauseOff.push([team, OPS[s.op] ? OPS[s.op].n : s.op, HELD[h].n]); return { ...s, held: null, prog: s.prog ? { ...s.prog, held: null } : s.prog }; }); };
  if (cfg.from) {
    // a working copy of another battle for look-ahead: units are copied, static move data is shared
    const F = cfg.from, map = new Map();
    for (const u of [...F.units, ...F.bench.A, ...F.bench.E]) map.set(u.uid, { ...u, max: { ...u.max }, stages: { ...u.stages }, eff: u.eff.map(e => ({ ...e })), cool: { ...u.cool }, flags: { ...u.flags } });
    B.units = F.units.map(u => map.get(u.uid));
    B.bench = { A: F.bench.A.map(u => map.get(u.uid)), E: F.bench.E.map(u => map.get(u.uid)) };
    Object.assign(B, { wave: F.wave, waveByWave: F.waveByWave, wx0: F.wx0, over: F.over, result: F.result, turn: F.turn, allyTurns: F.allyTurns, allyCount: F.allyCount, needPick: null,
      weather: F.weather, wxEnd: F.wxEnd, baseWx: F.baseWx, avgL: F.avgL, terrain: F.terrain && { ...F.terrain }, trickRoom: F.trickRoom, tailwind: F.tailwind && { ...F.tailwind }, uproar: F.uproar && { ...F.uproar }, pledgeFx: F.pledgeFx && { A: { ...F.pledgeFx.A }, E: { ...F.pledgeFx.E } }, lastPledge: F.lastPledge,
      hazards: F.hazards && { A: { ...F.hazards.A }, E: { ...F.hazards.E } }, gravity: F.gravity, magicRoom: F.magicRoom, wonderRoom: F.wonderRoom,
      side: F.side && { A: { ...F.side.A }, E: { ...F.side.E } }, mudSport: F.mudSport, waterSport: F.waterSport, ionDeluge: F.ionDeluge, fairyLock: F.fairyLock, future: (F.future || []).map(x => ({ ...x })), healWish: F.healWish && { ...F.healWish }, faintT: F.faintT && { ...F.faintT }, lastMove: F.lastMove, tally: { ...F.tally }, dmgDone: { ...F.dmgDone }, trainer: F.trainer, wild: F.wild, sim: true,
      nextQ: (F.nextQ || []).slice(), perNow: F.perNow, rf: F.rf,
      auto: true, aiStyle: "rollout", enemyStyle: "rollout", actor: F.actor && map.get(F.actor.uid), waiting: F.waiting && map.get(F.waiting.uid), ev: [] });
    return B;
  }
  const roster = clause(cfg.allies.slice(0, cap), "A").map((s, i) => buildUnit(s, "A", i < lead ? i : -1));
  const mine = roster.slice(0, lead); B.bench.A = roster.slice(lead); B.allyCount = roster.length;
  B.units.push(...mine);
  // the opponents: a normal stage's waves (cfg.waveByWave: wild areas, Explore, ordinary Trainers) come in one at a time, each only once
  // the last is beaten, as a new battle (nextWave; the owner's rule, 2026-10-15); a big battle's (Gym Leaders, rivals, the League, the
  // Battle Tower, the Stadium...) are one team in order, its first three leading
  B.waveByWave = !!cfg.waveByWave && !cfg.probe && B.waves.length > 1;
  const foes = clause((B.waveByWave ? B.waves[0] : B.waves.flat()).slice(0, cap), "E").map((s, i) => buildUnit(s, "E", i < lead ? i : -1));
  const first = foes.slice(0, lead); B.bench.E = foes.slice(lead);
  B.units.push(...first);
  for (const u of first) { u.atb = R() * 10; if (!B.sim) dexSee(u.key); }
  B.avgL = B.waves.flat().concat(cfg.allies.map(s => ({ LV: (s.prog || {}).lvl || s.LV }))).reduce((a, s) => a + (s.LV || 10), 0) / (B.waves.flat().length + cfg.allies.length);
  B.ev = [];
  if (B.weather) msg(WEATHER[B.weather].start);
  for (const [tm, n, it] of clauseOff) msg(`Item Clause: ${tm === "A" ? "your" : "the opposing"} ${n}'s ${it} won't work (one per team).`);
  // (both sides' leads in Speed order, the fastest first, as in the main games: the slower setter's weather or terrain is the one
  // that stays, from an Ability or a move; the owner's rule)
  B.perNow = Math.max(2, B.units.filter(x => x.alive).length);
  startEffects([...mine, ...first].map(u => [u, statOf(u, "spe") + R() * .01]).sort((a, b) => b[1] - a[1]).map(x => x[0]));
  return B;
}
// the order a trainer sends a team out against another they can see (Ranked and Link Battles, the Demo): the three with the
// best matchups lead, the rest keep their order on the bench
function leadOrder(specs, foeSpecs, weather) {
  if (specs.length <= ACTIVE || !foeSpecs.length) return specs.slice();
  const B = makeBattle({ allies: specs, waves: [foeSpecs], auto: true, sim: true, probe: true, weather });
  for (const u of B.units) for (const k in u.stages) u.stages[k] = 0;   // a probe: no Intimidate from the whole team at once
  const A = B.units.filter(u => u.team === "A");
  const lead = A.map((u, i) => [i, B.matchup(u)]).sort((a, b) => b[1] - a[1]).slice(0, ACTIVE).map(x => x[0]).sort((a, b) => a - b);
  return [...lead, ...specs.map((_, i) => i).filter(i => !lead.includes(i))].map(i => specs[i]);
}
