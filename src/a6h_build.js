// ---------- Optimal builds ----------
// What a serious Trainer gives a Pokémon, judged from its own moves and item, its teammates and the Pokémon it will meet
// (the meta). The Demo, Stadium Trainers, Legend sets and the chat's build advice all ask here.

// how often each slot gets used (S1 has no cooldown, S2 and S3 wait 3 and 4 turns)
const SLOT_USE = { 1: 1, 2: .6, 3: .5 };
const WX_SET = { raindance: "rain", sunnyday: "sun", sandstorm: "sand", hail: "snow", snowscape: "snow" };
// moves that pay off most on a Pokémon's first turn (a Quick Claw's +30% turn meter gets them up sooner)
// (the moves a Quick Claw's turn meter gets in sooner: Trick Room, weather, terrain, hazards, screens and rooms go up by themselves on entry)
const FIRST_TURN = new Set(["tailwind"]);
const WX_AB = { drought: "sun", "orichalcum-pulse": "sun", drizzle: "rain", "sand-stream": "sand", "snow-warning": "snow" };
const STATUS_HURT = { SLP: .6, FRZ: .5, PAR: .4, TOX: .35, PSN: .25, BRN: .3, CNF: .15, INFAT: .1 };

// the meta: what a list of Pokémon ({ k, mv, ab, held }) attack with and do. atk[type], phys, contact and sound are shares
// of their attack power; the rest are shares of the Pokémon (status[s]: how likely one inflicts it, wx[w]: sets that weather)
function metaOf(mons) {
  const m = { atk: {}, phys: 0, contact: 0, sound: 0, status: {}, intim: 0, drops: 0, setup: 0, flinch: 0, wx: {}, defT: {},
    screens: 0, berry: 0, statusMoves: 0, drain: 0, powder: 0, levitate: 0, inacc: 0, immune: {}, n: mons.length };
  let tot = 0, accW = 0;
  for (const x of mons) {
    const types = OPS[x.k].types, ab = abilityOf(x.ab || OPS[x.k].ab), got = {};
    for (const t of types) m.defT[t] = (m.defT[t] || 0) + 1;
    if (ab.id === "INTIMIDATE") m.intim++;
    if (ab.id === "IMMUNE_TYPE" && ab.type === "Ground") m.levitate++;
    // immune[t]: the share immune to t-type attacks, by a type (Flying to Ground) or an Ability (Levitate, Lightning Rod, Volt Absorb...)
    const imm = new Set(Object.keys(CHART).filter(at => types.some(d => CHART[at][d] === 0)));
    const ai = ab.id === "ABSORB" || ab.id === "IMMUNE_TYPE" ? ab.type : ab.id === "FLASH_FIRE" ? "Fire" : ab.id === "ROD" ? "Electric" : null;
    if (ai) imm.add(ai);
    for (const t of imm) m.immune[t] = (m.immune[t] || 0) + 1;
    if (WX_AB[ab.key]) m.wx[WX_AB[ab.key]] = (m.wx[WX_AB[ab.key]] || 0) + 1;
    if (x.held && /berry$/.test(x.held)) m.berry++;
    let drops = 0, setup = 0, flinch = 0, screens = 0, statusMv = 0, drain = 0, powder = 0;
    (x.mv || []).forEach((k, i) => {
      const M = MOVES[k]; if (!M) return;
      const f = SLOT_USE[i + 1] || .5;
      if (M.c !== "X") {
        const w = (M.p || 60) * f * (types.includes(M.t) ? 1.5 : 1) * (M.tg === "foes" ? 1.3 : 1);
        tot += w; m.atk[M.t] = (m.atk[M.t] || 0) + w;
        if (M.c === "P") m.phys += w; if (M.ct) m.contact += w; if (M.so) m.sound += w;
        if (M.a) { accW += w; m.inacc += w * (1 - M.a / 100); } else accW += w;
        if (M.dr > 0) drain = 1;
        if (M.fl) flinch = Math.max(flinch, M.fl / 100);
      }
      if (M.ail) { const p = M.c === "X" ? (M.a ? M.a / 100 : 1) : (M.ac || 0) / 100; got[M.ail] = Math.max(got[M.ail] || 0, p); if (M.c === "X") statusMv = 1; if (/powder|spore/.test(k)) powder = 1; }
      if (M.st && M.sw !== "self" && M.st.some(([, n]) => n < 0)) drops = Math.max(drops, (M.sc || 100) / 100);
      if (M.st && M.sw === "self" && M.c === "X" && M.st.some(([, n]) => n > 0)) setup = 1;
      if (WX_SET[M.sp]) m.wx[WX_SET[M.sp]] = (m.wx[WX_SET[M.sp]] || 0) + 1;
      if (k === "reflect" || k === "lightscreen" || k === "auroraveil") screens = 1;
    });
    for (const s in got) m.status[s] = (m.status[s] || 0) + got[s];
    m.drops += drops; m.setup += setup; m.flinch += flinch; m.screens += screens; m.statusMoves += statusMv; m.drain += drain; m.powder += powder;
  }
  const n = Math.max(1, mons.length);
  for (const t in m.atk) m.atk[t] /= tot || 1;
  m.phys /= tot || 1; m.contact /= tot || 1; m.sound /= tot || 1; m.inacc /= accW || 1;
  for (const s in m.status) m.status[s] /= n;
  for (const t in m.defT) m.defT[t] /= n;
  for (const t in m.immune) m.immune[t] /= n;
  for (const w in m.wx) m.wx[w] = Math.min(1, m.wx[w] / n * ROSTER);   // a team with one setter has that weather
  for (const f of ["intim", "drops", "setup", "flinch", "screens", "berry", "statusMoves", "drain", "powder", "levitate"]) m[f] /= n;
  m.statusAny = Math.min(1, Object.values(m.status).reduce((a, b) => a + b, 0));
  return m;
}
// the competitive pool at Lv 100 with their usual builds (what Stadium Trainers meet; no ladder needed)
const poolMeta = () => poolMeta.v || (poolMeta.v = metaOf(COMP_POOL().map(k => ({ k, mv: defaultMoves(k, 100, true), ab: OPS[k].ab }))));
// what the player meets in the Stadium: the teams of the Trainers rated nearest to them
function playerMeta() {
  if (!S || !S.ladder || !S.ladder.pop) return poolMeta();
  const pts = Math.max(S.ladder.pts || 0, (S.rta && S.rta.pts) || 0), key = S.ladder.seed + ":" + tierIdx(pts);
  if (playerMeta.key === key) return playerMeta.v;
  const near = S.ladder.pop.map((p, i) => [i, Math.abs(p - pts)]).sort((a, b) => a[1] - b[1]).slice(0, 60);
  const mons = [];
  for (const [i] of near) { const d = ladderDoc(i); for (const k of d.team) mons.push({ k, mv: d.prog[k].mv, ab: d.prog[k].ab, held: d.prog[k].held }); }
  playerMeta.key = key; playerMeta.v = metaOf(mons);
  return playerMeta.v;
}

// how much damage a Pokémon of these types expects from the meta, and the part of it one attacking type brings
const dmgIn = (types, meta) => Object.keys(meta.atk).reduce((a, t) => a + meta.atk[t] * typeEff(t, types), 0) || 1;
const dmgPart = (t, types, meta) => (meta.atk[t] || 0) * typeEff(t, types) / dmgIn(types, meta);
// the same for an average Pokémon of the pool (teammates when the team isn't known)
const avgPart = (t, meta) => { const P = COMP_POOL(); return P.reduce((a, k) => a + dmgPart(t, OPS[k].types, meta), 0) / P.length; };

// what an Ability is worth to this Pokémon: roughly the share of its strength it adds. c: { mv, held, team: [{ k, ab, mv }], meta }
function abilityValue(k, abKey, c = {}) {
  const A = abilityOf(abKey), op = OPS[k], types = op.types, b = op.b, meta = c.meta || poolMeta();
  const mv = (c.mv || defaultMoves(k, 100, true)).filter(m => MOVES[m]), held = c.held || null;
  const mates = (c.team || []).filter(x => x.k !== k);
  // its attacks, weighted by how much they do and how often they're used
  const atks = mv.map((m, i) => [m, MOVES[m], moveValue(k, m) * (SLOT_USE[MOVES[m].s] || .5)]).filter(([, M]) => M.c !== "X");
  const aw = atks.reduce((a, x) => a + x[2], 0) || 1, share = f => atks.filter(([m, M]) => f(M, m)).reduce((a, x) => a + x[2], 0) / aw;
  const shareW = f => atks.reduce((a, [m, M, w]) => a + w * (f(M, m) || 0), 0) / aw;   // (f: a number for each attack, its share weighted by it)
  const phys = share(M => M.c === "P"), DEF = .5, part = t => dmgPart(t, types, meta);
  const status = list => list.reduce((a, s) => a + (meta.status[s] || 0) * (s === "BRN" ? .2 + .5 * phys : STATUS_HURT[s] || .2), 0);
  const wxOn = w => Math.min(1, (mates.concat([{ k, ab: abKey, mv }]).some(x => WX_AB[x.ab] === w || (x.mv || []).some(m => MOVES[m] && WX_SET[MOVES[m].sp] === w)) ? 1 : 0) + (meta.wx[w] || 0) * .4);
  const consumable = held && (/berry$|sash|gem|herb|seed$|balloon|whiteherb|powerherb|weaknesspolicy|blunderpolicy|adrenalineorb|ejectbutton|redcard/.test(held));
  const orb = held === "flameorb" || held === "toxicorb";
  switch (A.id) {
    case "PINCH": return 0;   // in its moves (abMoveMul), like the other Abilities that power up attacks
    case "CONTACT": return meta.contact * A.chance * ({ PAR: .4, PSN: .25, BRN: .2 + .5 * meta.phys, SPORE: .4, INFAT: .15 }[A.what] || .2) * .6;
    case "TOUCH": return share(M => M.ct) * .3 * .25 * .6;
    case "STENCH": return .1 * .3 * .6 + .18 * shareW(M => M.fl ? 0 : overStrikes(.1, strikesOf(M, abKey, held)) - .1);   // (each strike of a multi-strike move can flinch)
    case "INTIMIDATE": return meta.phys * .35;
    case "IMMUNE_TYPE": return DEF * part(A.type);
    case "ABSORB": return DEF * part(A.type) * 1.25;
    case "FLASH_FIRE": return DEF * part("Fire") + .15 * share(M => M.t === "Fire") * Math.min(1, (meta.atk.Fire || 0) * 5);
    case "ROD": {
      // it takes every opposing Electric-type attack aimed at its side, spread ones whole: what it saves itself and its partners
      const T = A.type || "Electric", self = DEF * part(T);   // (Lightning Rod: Electric; Storm Drain: Water)
      const allies = mates.length ? mates.reduce((a, x) => a + dmgPart(T, OPS[x.k].types, meta), 0) / mates.length : avgPart(T, meta);
      const spa = (1 - phys) * Math.min(1, (meta.atk[T] || 0) * 4) * .15;
      return self + DEF * allies * 2 * .8 + spa;
    }
    case "RESIST": return DEF * A.types.reduce((a, t) => a + part(t), 0) * .5;
    case "HEATPROOF": return DEF * part("Fire") + .03;   // (immune to Fire, can't be burned)
    case "NO_STATUS": return status(A.list) * .4;
    case "INNER_FOCUS": return meta.intim * phys * .3 + meta.flinch * .08;
    case "NO_DROP": return A.stats === "all" ? meta.intim * phys * .3 + meta.drops * .12 : A.stats === "atk" ? meta.intim * phys * .3 + meta.drops * .03 : meta.drops * .02 + (A.eva ? .01 : 0);
    case "STURDY": return held === "focussash" ? .01 : .05 + .1 * clamp(1 - (b[0] + b[2] + b[4]) / 330, 0, 1);
    case "ROCK_HEAD": return 0;
    case "SHED": return meta.statusAny * .35 * A.chance * (A.w ? wxOn(A.w) : 1) + (mv.includes("rest") ? .06 * A.chance * (A.w ? wxOn(A.w) : 1) : 0);   // wakes from Rest early
    case "GUTS": return orb ? 0 : phys * meta.statusAny * .2;
    case "ACC": return 0;
    case "SHIELD_DUST": return .02;
    case "NO_CRIT": return .03;
    case "WSPEED": return wxOn(A.w === "hail" ? "snow" : A.w) * (b[5] < 110 ? .4 : .25);
    case "WEVA": return wxOn(A.w === "hail" ? "snow" : A.w) * .1;
    case "WHEAL": return wxOn(A.w === "hail" ? "snow" : A.w) * .06;
    case "SOLAR": return wxOn("sun") * ((1 - phys) * .45 - .1);
    case "SYNC": return meta.statusAny * .05;
    case "DOWNLOAD": return .22;
    case "PRESSURE": return .06;
    case "DAMP": return .01;
    case "OOZE": return meta.drain * .1;
    case "SOUNDPROOF": return DEF * meta.sound;
    case "EARLY_BIRD": return (meta.status.SLP || 0) * .3 + (mv.includes("rest") ? .04 : 0);
    case "PICKUP": return .002;
    case "BALL_FETCH": return .002;   // (a Safari Ball now and then after a Journey win: nothing in battle)
    case "TECHNICIAN": case "SHEER_FORCE": case "HUSTLE": case "IRON_FIST": case "RECKLESS": case "SKILL_LINK": case "SERENE": case "ADAPT":
    case "TINTED": case "SCRAPPY": return 0;
    case "NO_GUARD": return -meta.inacc * DEF * .5;   // foes never miss it either
    case "MAGIC_GUARD": return .05 + (held === "lifeorb" ? .1 : 0) + ((meta.status.PSN || 0) + (meta.status.TOX || 0) + (meta.status.BRN || 0)) * .1;
    case "MULTISCALE": return DEF * .25;
    case "MARVEL": return meta.statusAny * DEF * .3;
    case "FILTER": return DEF * Object.keys(meta.atk).filter(t => typeEff(t, types) > 1).reduce((a, t) => a + part(t), 0) * (A.cut || .25);
    case "SNIPER": return (.04 + (held === "scopelens" || held === "razorclaw" ? .08 : 0) + share(M => M.cr) * .08) * .5;
    case "WEAK_ARMOR": return meta.phys * .03;
    case "ANGER": return phys * .25;
    case "DEFIANT": return (A.stat === "atk" ? phys : 1 - phys) * (meta.intim + meta.drops) * .4;
    case "STEADFAST": return meta.flinch * .05;
    case "MOXIE": return (A.stat === "spa" ? 1 - phys : A.stat === "best" ? .8 : phys) * .15 + (A.unnerve ? .02 : 0);
    case "INFILTRATOR": return meta.screens * .2;
    case "CURSED": return .04;
    case "FRIEND_GUARD": return .2;   // (50% less damage for its partners)
    case "IMPOSTER": return .5;
    case "ARENA_TRAP": return .12;
    case "MAGNET_PULL": return (meta.defT.Steel || 0) * .25;
    case "RATTLED": return ((meta.atk.Bug || 0) + (meta.atk.Ghost || 0) + (meta.atk.Dark || 0)) * .2;
    case "UNNERVE": return meta.berry * .05;
    case "RUN_AWAY": return .04;
    case "CLOUD": return Object.keys(meta.wx).reduce((a, w) => a + meta.wx[w] * .1, 0) - (mates.some(x => WX_AB[x.ab] || (x.mv || []).some(m => MOVES[m] && WX_SET[MOVES[m].sp])) ? .3 : 0);
    case "AFTERMATH": return meta.contact * .04;
    // (its Speed down: by its own moves, Hammer Arm, Ice Hammer, Curse; by an Iron Ball; or by the other side's Icy Wind and the like)
    case "ANALYTIC": return (mv.some(m => MOVES[m].st && MOVES[m].sw === "self" && MOVES[m].st.some(([s, n]) => s === "spe" && n < 0)) ? .45 : 0) + (held === "ironball" ? .35 : 0) + meta.drops * .15 + .03;
    case "DROUGHT": if (A.atkSun) return phys * .33 + .15;   // (Orichalcum Pulse: its sun and its Attack in it)
    {
      // its weather for the whole side: the sun (Fire stronger, Water weaker, Chlorophyll and Solar Power on), rain (the other way,
      // Swift Swim, Thunder and Hurricane sure to hit), a sandstorm (Rock, Ground and Steel types' Sp. Def, Sand Rush and Sand Force), snow (Ice types'
      // Defense, Blizzard sure to hit, Slush Rush and Ice Body)
      const w = A.w || "sun", up = { sun: "Fire", rain: "Water" }[w], down = { sun: "Water", rain: "Fire" }[w];
      const ABW = { sun: ["chlorophyll", "solar-power", "leaf-guard", "harvest", "flower-gift"], rain: ["swift-swim", "rain-dish", "hydration", "dry-skin"],
        sand: ["sand-rush", "sand-force", "sand-veil"], hail: ["slush-rush", "ice-body", "snow-cloak"] }[w] || [];
      const typeGain = x => (w === "sand" && OPS[x.k] && OPS[x.k].types.includes("Rock") ? .08 : 0) + (w === "hail" && OPS[x.k] && OPS[x.k].types.includes("Ice") ? .06 : 0);
      const gain = x => (x.mv || []).reduce((a, m) => { const M = MOVES[m]; return !M || M.c === "X" ? a : a + (M.t === up ? .15 : M.t === down ? -.08 : 0)
        + (w === "rain" && (m === "thunder" || m === "hurricane") ? .08 : 0) + (w === "hail" && m === "blizzard" ? .08 : 0); }, 0) + (ABW.includes(x.ab) ? .3 : 0) + typeGain(x);
      return .03 + gain({ k, mv, ab: "" }) + mates.reduce((a, x) => a + gain(x), 0) * .5 - (up ? (meta.atk[up] || 0) * .3 : 0);
    }
    case "HUGE": return phys * .45;
    case "SPEED_BOOST": return .25;
    case "MOODY": return .2;
    case "BAD_DREAMS": return (meta.status.SLP || 0) * .3 + .02;
    case "PRANKSTER": return .06 + share(M => false) + mv.filter(m => MOVES[m].c === "X").length * .02;
    case "SUPER_LUCK": return .03 + share(M => M.cr) * .05 + (held === "scopelens" || held === "razorclaw" ? .05 : 0);
    case "PLUSMINUS": return mates.some(x => abilityOf(x.ab).id === "PLUSMINUS") ? (1 - phys) * .3 : 0;
    case "KLUTZ": return held === "flameorb" || held === "toxicorb" || held === "laggingtail" || held === "ironball" || held === "stickybarb" ? 0 : -.1;
    case "BARBS": return meta.contact * .08;
    case "WEIGHT": return A.mul > 1 ? .05 : .12;   // (Heavy Metal: Atk +1, Def +1, Spe -2; Light Metal: Spe +2)
    case "CONTRARY": return mv.some(m => MOVES[m] && MOVES[m].st && MOVES[m].sw === "self" && MOVES[m].st.some(([, n]) => n < 0)) ? .3 : .02 + meta.intim * phys * .3;
    case "SIMPLE": return mv.some(m => MOVES[m] && MOVES[m].c === "X" && MOVES[m].st && MOVES[m].st.some(([, n]) => n > 0)) ? .25 : .02;
    case "PICKPOCKET": return meta.contact * .03;
    case "MAGIC_BOUNCE": return meta.statusMoves * .25 + .02;
    case "SUCTION": return .02;
    case "POISON_HEAL": return held === "toxicorb" ? .35 : ((meta.status.PSN || 0) + (meta.status.TOX || 0)) * .3;
    case "TRUANT": return -.4;   // (Attack +1 for each opposing hit softens it a little)
    case "NORMALIZE": return types.includes("Normal") ? .12 : -.05;   // (every move Normal and ×1.5)
    case "FLARE_BOOST": return held === "flameorb" ? (1 - phys) * .3 - .04 : (meta.status.BRN || 0) * (1 - phys) * .2;
    case "TOXIC_BOOST": return held === "toxicorb" ? phys * .3 - .08 : ((meta.status.PSN || 0) + (meta.status.TOX || 0)) * phys * .2;
    case "MUMMY": return meta.contact * .02;
    case "DEFEATIST": return -.1;
    case "ILLUSION": return .06;
    case "WONDER_GUARD": return .6 * (1 - Object.keys(meta.atk).filter(t => typeEff(t, types) > 1).reduce((a, t) => a + (meta.atk[t] || 0), 0));
    case "STALL": return -.15;
    case "FORECAST": return .03;
    case "FLOWER_GIFT": return wxOn("sun") * .2;
    case "ZEN": return .05;
    case "MULTITYPE": return .1;
    case "VICTORY_STAR": return .04 + share(M => M.a && M.a < 100) * .08;
    case "SLOW_START": return .3;   // (the owner's rule: 2 turns at Attack and Speed −2, then every stat +2)
    case "COLOR_CHANGE": return .2;   // (it resists every attack before the damage: convert)
    case "PROTEAN": return .2;
    case "SHARPNESS": return 0;
    case "SIPPER": return A.wind ? .03 : DEF * part(A.type) * 1.25 + .03;
    case "HARVEST": return held && /berry$/.test(held) ? .1 + wxOn("sun") * .05 : 0;
    case "HEALER": return meta.statusAny * .08;
    case "JUSTIFIED": return phys * (meta.atk.Dark || 0) * 1.5;
    case "LEAF_GUARD": return wxOn("sun") * meta.statusAny * .3;
    case "MOLD": return .04 + share(M => M.t === "Ground") * meta.levitate * .8;
    case "NEUTRAL": return .06;
    case "OVERCOAT": return meta.powder * .2 + ((meta.wx.sand || 0) + (meta.wx.snow || 0)) * .03;
    case "QUICK_FEET": return orb ? .3 : meta.statusAny * .2;
    case "REGEN": return mv.some(m => MOVES[m].sp === "followme") ? 0 : .1;   // (a Follow Me or Rage Powder user stays out: nothing to regenerate)
    case "RIVALRY": return meta.setup * .2;
    case "SAND_FORCE": return wxOn("sand") * share(M => ["Rock", "Ground", "Steel"].includes(M.t)) * .5;
    case "STICKY": return .01;
    case "TANGLED": return .01;
    case "TRACE": return .06;
    case "UNAWARE": return meta.setup * .35;
    case "UNBURDEN": return .25;   // (the owner's rule: Speed +2 whenever it holds no item; itemValue charges a lasting item for it)
    case "WONDER_SKIN": return meta.statusMoves * .15;
    case "ANTICIPATION": case "FOREWARN": case "FRISK": return .003;
    // generations 6 to 9 (what powers up its attacks is in abMoveMul)
    case "FLAGPOW": case "ATE": case "AURA": return A.guard ? .03 : 0;
    case "TYPEPOW": return A.allies ? .03 + mates.filter(x => (x.mv || []).some(m => MOVES[m] && MOVES[m].t === A.type && MOVES[m].c !== "X")).length * .03 : 0;
    case "WATER_BUBBLE": return DEF * part("Fire") * .5 + status(["BRN"]) * .4;
    case "AURA_BREAK": return .02;
    case "ALLYPOW": return mates.length ? .15 : .05;
    case "STAKEOUT": return .08;
    case "BATTLE_BOND": return .3;
    case "COMMANDER": return mates.some(x => x.k === "dondozo") ? .35 : -.05;   // (with a Dondozo: +2 to all its stats, Tatsugiri out of reach)
    case "CUD_CHEW": return held && /berry$/.test(held) ? .1 : .01;   // (its Berry twice)
    case "TELEPATHY": return .06 + .06 * Math.min(1, (b[0] + b[2] + b[4]) / 3 / 100);   // (shares its partners' hits: better on a bulky Pokémon)   // (after a knockout: Ash-Greninja, Attack, Sp. Atk and Speed +1)
    case "GORILLA": return phys * .4;
    case "MERCILESS": return ((meta.status.PSN || 0) + (meta.status.TOX || 0)) * .3;
    case "RUIN": return { atk: meta.phys, def: phys, spa: 1 - meta.phys, sdf: 1 - phys }[A.stat] * .2;
    case "PARADOX": return A.w ? wxOn(A.w) * .3 : (mates.some(x => (abilityOf(x.ab).t === "electric")) ? .3 : .05);
    case "SURGE": return .08 + share(M => M.t === { electric: "Electric", grassy: "Grass", psychic: "Psychic" }[A.t]) * .33 + (A.spaTer ? (1 - phys) * .33 : 0);
    case "SEED_SOWER": return .05;
    case "TSPEED": return .08 + (mates.some(x => abilityOf(x.ab).t === A.t) ? .25 : 0);
    case "GRASS_PELT": return .03;
    case "FUR_COAT": return meta.phys * .45;
    case "FLUFFY": return meta.contact * .3 - DEF * part("Fire") * .5;
    case "ICE_SCALES": return (1 - meta.phys) * .35;
    case "TERA_SHELL": return .15;
    case "SHIELDS_DOWN": return .05 + meta.statusAny * .1;
    case "TEAM_VEIL": return status(A.list.filter(x => ["SLP", "PSN", "TOX"].includes(x))) * .3 + .02;
    case "FLOWER_VEIL": return .02;
    case "GOOD_AS_GOLD": return meta.statusMoves * .3 + .05;
    case "NO_PRIORITY": return .05;
    case "BULLETPROOF": return .05;
    case "CONTACT_DROP": return meta.contact * .06;
    case "TOXIC_DEBRIS": return meta.phys * .05;
    case "SAND_SPIT": return .03;
    case "COTTON_DOWN": return .05;   // (the opposing side's Speed only, its own side's no longer: the owner's rule)
    case "CHARGED": return share(M => M.t === "Electric") * (A.wind ? .05 : .15);
    case "HIT_BOOST": return A.types ? DEF * A.types.reduce((a, t) => a + part(t), 0) * .2 + (A.noStatus ? status(A.noStatus) * .4 : 0) : .1;
    case "BERSERK": return (1 - phys) * .12 + (A.shell ? .05 : 0);
    case "EJECT_HALF": return .02;
    case "INNARDS": return .05;
    case "MAGICIAN": return .02;
    case "TOXIC_CHAIN": return .1;
    case "PUPPETEER": return .02;
    case "SOUL_HEART": return (1 - phys) * .15;
    case "OPPORTUNIST": return meta.setup * .15;
    case "COSTAR": return .02;
    case "ENTRY_BOOST": return A.stat === "atk" ? phys * .2 : .05;
    case "SCREEN_CLEANER": case "CURIOUS": return .01;
    case "HOSPITALITY": return mates.length ? .05 : .01;
    case "HONEY": return mates.length ? .02 : -.01;
    case "PERISH_BODY": case "RECEIVER": case "SYMBIOSIS": return .02;
    case "MIRROR_ARMOR": return .08;
    case "SYRUP": return .03;
    case "TERA_SHIFT": return .05;
    case "HERO": return .1;
    case "SCHOOLING": return .3;
    case "POWER_CONSTRUCT": return .15;
    case "STANCE": return .2;
    case "ICE_FACE": return .1;
    case "DISGUISE": return .2;
    case "LONG_REACH": return .02;
    case "UNSEEN_FIST": return .04;
    case "NO_REDIRECT": return .02;
    case "CORROSION": return mv.includes("toxic") ? .05 : .01;
    case "PRIORITY_AB": return .1;
    case "GUARD_DOG": return meta.intim * phys * .4 + .02;
    case "RIPEN": return held && /berry$/.test(held) ? .06 : 0;
    case "CHEEK_POUCH": return held && /berry$/.test(held) ? .05 : 0;
    default: return 0;
  }
}
// how much an Ability changes what one of its attacks is worth (so moves get picked with the Ability in mind)
const resistShare = t => (resistShare.m || (resistShare.m = {}))[t] != null ? resistShare.m[t]
  : (resistShare.m[t] = COMP_POOL().filter(x => { const e = typeEff(t, OPS[x].types); return e > 0 && e < 1; }).length / COMP_POOL().length);
function abMoveMul(k, ab, m, held) {
  const M = MOVES[m]; if (!M || M.c === "X" || !ab) return 1;
  const n = strikesOf(M), A = abilityOf(ab), fx = 1 + (M.ail && M.ac ? overStrikes(M.ac / 100, n) / 4 : 0) + (M.fl ? overStrikes(M.fl / 100, n) / 5 : 0);   // what moveValue gave its added effect
  switch (A.id) {
    case "TECHNICIAN": return M.p > 0 && M.p <= 60 ? 1.5 : 1;
    case "SKILL_LINK": return M.hit && M.hit[0] !== M.hit[1] ? M.hit[1] / 3 : 1;   // (always the most strikes: 5, not 3 on average; Loaded Dice then only adds its accuracy, diceMul)
    case "NO_GUARD": return M.a ? 100 / M.a : 1;
    case "NO_DROP": return A.sure && M.a ? 100 / M.a : 1;   // (Keen Eye and Illuminate: their moves are 100% accurate)
    case "ACC": return M.a ? Math.min(100, M.a * 4 / 3) / M.a : 1;   // (Compound Eyes: accuracy +1)
    case "SHEER_FORCE": return M.ail || M.fl || (M.st && M.sw !== "self") || ["triattack", "secretpower", "throatchop", "psychicnoise"].includes(M.sp) ? 1.5 / fx : 1;
    case "SERENE": return (1 + (M.ail && M.ac ? overStrikes(M.ac / 50, n) / 4 : 0) + (M.fl ? overStrikes(M.fl / 50, n) / 5 : 0)) / fx * (M.st && M.sw !== "self" && M.sc < 100 ? 1.05 : 1);
    case "IRON_FIST": return M.pu ? 1.5 : 1;
    case "FLAGPOW": return (A.flag === "pulse" ? ["aurasphere", "darkpulse", "dragonpulse", "waterpulse", "originpulse", "terrainpulse"].includes(m) : M[A.flag]) ? A.mul : 1;
    case "ATE": return (A.sound ? M.so : M.t === "Normal") ? (A.mul || 1) * (OPS[k].types.includes(A.type) && !OPS[k].types.includes(M.t) ? 1.5 : 1) : 1;
    case "TYPEPOW": return M.t === A.type ? A.mul : 1;
    case "WATER_BUBBLE": return M.t === "Water" ? 2 : 1;
    case "AURA": return M.t === A.type ? 1.5 : 1;
    case "NORMALIZE": return M.c === "X" ? 1 : 1.5 * (OPS[k].types.includes("Normal") && M.t !== "Normal" ? 1.5 : 1) / (OPS[k].types.includes(M.t) && M.t !== "Normal" ? 1.5 : 1);   // (Normal and ×1.5: Normal STAB gained, its own lost)
    case "STAKEOUT": return 1.15;
    case "GORILLA": return M.c === "P" ? 1.5 : 1;
    case "SHARPNESS": return ["aerialace", "aircutter", "airslash", "crosspoison", "cut", "furycutter", "leafblade", "nightslash", "psychocut", "razorleaf", "razorshell", "sacredsword", "secretsword", "slash", "solarblade", "xscissor"].includes(m) ? 1.5 : 1;
    case "RECKLESS": return M.dr < 0 || M.crash ? 1.5 : 1;
    case "ROCK_HEAD": return M.dr < 0 ? 1 / .9 : 1;   // no recoil
    case "MAGIC_GUARD": return M.dr < 0 || M.sp === "steelbeam" ? 1 / .9 : 1;   // no recoil, no HP lost to Steel Beam, Chloroblast or Mind Blown
    case "ADAPT": return OPS[k].types.includes(M.t) ? 4 / 3 : 1;
    case "HUSTLE": return (M.c === "P" ? 1.5 : 1) * (M.a ? .75 : 1);   // (Attack +1, accuracy −1)
    case "GUTS": return M.c === "P" && (held === "flameorb" || held === "toxicorb") ? 1.5 : 1;
    case "PINCH": return M.t === A.type ? 1.1 : 1;
    case "TINTED": return 1 + .8 * resistShare(M.t);
    case "SCRAPPY": return M.t === "Normal" || M.t === "Fighting" ? 1 + .8 * (poolMeta().defT.Ghost || 0) : 1;
    case "SNIPER": return M.cr ? 1.1 : 1;
    case "MOLD": return M.t === "Ground" ? 1 + .8 * poolMeta().levitate : 1;
    default: return 1;
  }
}
// what top-tier battles say a move is worth (MOVE_WORTH, from tools/move_worth.js: the battle AI's value for the move in thousands
// of sampled battle situations, against what moveIn would give it, per slot): a factor per move, and per Pokémon where it differs.
// Pursuit and Upper Hand count what waiting for their trigger is worth. MOVE_WORTH_ON: off for head-to-head checks.
let MOVE_WORTH_ON = true;
// (the moves that go up by themselves on entry keep the table's own value: the samples only see what a move is worth on a
// Pokémon's turn, never the free use it gets coming in; a head-to-head with them left neutral won 61.3% vs 60.0%, 2026-10-14; Follow
// Me, Rage Powder and Spotlight too: up on entry for as long as their Pokémon stays out)
const worthF = (k, m) => { const sp = (MOVES[m] || {}).sp; if (!MOVE_WORTH_ON || typeof MOVE_WORTH === "undefined" || ENTRY_MOVES.has(sp) || sp === "followme" || sp === "spotlight" || sp === "shelltrap" || sp === "counter" || sp === "mirrorcoat" || sp === "metalburst" || sp === "conversion" || sp === "conversion2") return 1; const s = MOVE_WORTH.s[k]; return s && s[m] != null ? s[m] : MOVE_WORTH.g[m] != null ? MOVE_WORTH.g[m] : 1; };
// Loaded Dice (the owner's rule, 2026-10-16): every multi-strike move strikes its most times at 100% accuracy. A 2-5-strike move is worth
// 5/3 of its average (Skill Link gives that already, abMoveMul), and a move that can miss 100/its accuracy; Triple Axel and Triple
// Kick roll each strike, their power rising 1:2:3, so at a they deal (a + 2a² + 3a³)/6 of their whole. Twineedle and Double Kick
// (two sure strikes) gain nothing
const diceAcc = M => !M.a || M.a >= 100 ? 1 : M.sp === "tripleaxel" ? 6 / (M.a / 100 + 2 * (M.a / 100) ** 2 + 3 * (M.a / 100) ** 3) : 100 / M.a;
const diceGain = (M, ab) => M && M.sp === "present" ? 120 / (VAR_P.present * (M.a || 100) / 100) : !M || !M.hit ? 1 :   // (Present: its 120-power gift, never missing)
   (M.hit[0] !== M.hit[1] && !(ab && abilityOf(ab).id === "SKILL_LINK") ? M.hit[1] / 3 : 1) * diceAcc(M);
const diceMul = (m, ab, held) => held === "loadeddice" ? diceGain(MOVES[m], ab) : 1;
const movePick = (k, m, ab, held) => moveValue(k, m) * abMoveMul(k, ab, m, held) * diceMul(m, ab, held) * worthF(k, m);

// ---------- moves: the best set of three ----------
// c (a team's context): { meta, team: [{ k, ab, mv }], wx: the weather its team sets, tr: it sets Trick Room }
const COVER_SAMPLE = () => COVER_SAMPLE.v || (COVER_SAMPLE.v = COMP_POOL().map(k => OPS[k].types));
// how well a set of attacking types hits the pool: the average of its best multiplier against each Pokémon (2 at most); against
// c.cover instead when a plan is for given foes (their types: the Demo's plan for a Journey battle, demoFoes in a9g_demo.js)
const COVER = new Map();
const coverIn = (ts, sample) => !ts.length ? .5 : sample.reduce((a, d) => a + Math.min(2, Math.max(...ts.map(t => typeEff(t, d)))), 0) / sample.length;
const coverOf = (ts, sample) => { if (sample) return coverIn(ts, sample); if (!ts.length) return .5; const id = ts.slice().sort().join(); if (!COVER.has(id)) COVER.set(id, COVER_SAMPLE().reduce((a, d) => a + Math.min(2, Math.max(...ts.map(t => typeEff(t, d)))), 0) / COVER_SAMPLE().length); return COVER.get(id); };
// what a team gets out of a weather: Speed-doubling Abilities, the attacks it powers up, Rock- or Ice-types' extra bulk
// the terrain a team's Surge Ability sets up
const TERRAIN_SET = { electricterrain: "electric", grassyterrain: "grassy", mistyterrain: "misty", psychicterrain: "psychic" };
const teamTerrain = team => { for (const x of team || []) { const A = abilityOf(x.ab || OPS[x.k].ab); if (A.id === "SURGE") return A.t; } return null; };
function wxBenefit(w, team) {
  let g = 0;
  for (const x of team || []) {
    const A = abilityOf(x.ab || OPS[x.k].ab);
    if (A.id === "WSPEED" && (A.w === w || (w === "snow" && A.w === "hail"))) g += 1;
    if ((A.id === "SOLAR" || A.id === "LEAF_GUARD" || A.id === "HARVEST") && w === "sun") g += .4;
    if (A.id === "SAND_FORCE" && w === "sand") g += .5;
    for (const m of x.mv || []) {
      const M = MOVES[m]; if (!M || M.c === "X") continue;
      if (w === "rain") g += M.t === "Water" ? .3 : M.t === "Fire" ? -.15 : (m === "thunder" || m === "hurricane") ? .25 : 0;
      if (w === "sun") g += M.t === "Fire" ? .3 : M.t === "Water" ? -.15 : 0;
      if (w === "snow" && m === "blizzard") g += .25;
    }
    if (w === "sand" && OPS[x.k].types.some(t => t === "Rock" || t === "Ground" || t === "Steel")) g += .25;   // (Sp. Def +1 for all three: the owner's house rule)
    if (w === "snow" && OPS[x.k].types.includes("Ice")) g += .4;   // (hail and snow are one weather: Ice types' bulk, and immune to its damage)
    if (w === "snow" && (A.id === "WEVA" || A.id === "WHEAL") && A.w === "hail") g += .4;
    if (A.id === "ABSORB" && A.dry) g += w === "rain" ? .3 : w === "sun" ? -.3 : 0;   // Dry Skin
    for (const m of x.mv || []) { const M = MOVES[m]; if (!M) continue;
      if (M.sp === "solar") g += w === "sun" ? .2 : w ? -.2 : 0;                        // Solar Beam: x1.5 in sun, x0.5 in the rest
      if ((m === "thunder" || m === "hurricane") && w === "sun") g -= .15;              // 50% accuracy in harsh sunlight
      if (m === "growth" && w === "sun") g += .15;
      if (M.sp === "synthesis") g += w === "sun" ? .15 : w ? -.15 : 0; }
  }
  return g;
}
// what a move is worth to this Pokémon on this team: attacks by how hard it really hits (Chansey's are weak, so Soft-Boiled
// stays), healing by how bulky it is, weather and Trick Room by what the team gets from them
// Weather Ball's type in a weather; an attack's type for coverage (Weather Ball's in the team's weather)
const WB_TYPE = { rain: "Water", sun: "Fire", sand: "Rock", snow: "Ice", hail: "Ice" };
const mvType = (m, c) => MOVES[m].sp === "weatherball" && c && WB_TYPE[c.wx] ? WB_TYPE[c.wx] : MOVES[m].t;
// Sketch on one of your own Pokémon keeps the move for good (the owner's rule): the battle AI only sketches a move among the 30 best
// that slot could get for this Pokémon from every move it could sketch (its Ability and held item counted)
const SKETCH_BEST = new Map(), SKETCH_TOP = 30;
function sketchWorth(u, m) {
  const p = typeof S !== "undefined" && S && S.ops && S.ops[u.key], ab = p ? p.ab || OPS[u.key].ab : OPS[u.key].ab, held = p ? p.held : null, s = slotOf(m);
  const key = [u.key, s, ab, held].join("|");
  if (!SKETCH_BEST.has(key)) { const v = sketchable().filter(x => slotOf(x) === s).map(x => moveIn(u.key, x, ab, held, {})).sort((a, c) => c - a); SKETCH_BEST.set(key, v[Math.min(v.length - 1, SKETCH_TOP - 1)] || 0); }
  return moveIn(u.key, m, ab, held, {}) >= SKETCH_BEST.get(key);
}
// (a plan for given foes, c.cover: an attack is worth how hard its type hits them on average, Water Gun against Roxanne's Rock-types)
const effIn = (t, sample) => sample.reduce((a, d) => a + typeEff(t, d), 0) / sample.length;
function moveIn(k, m, ab, held, c) {
  let v = moveIn0(k, m, ab, held, c);
  if (c && c.cover && v > 0 && MOVES[m] && MOVES[m].c !== "X") v *= effIn(mvType(m, c), c.cover);
  return c && c.favor && v > 0 && (c.favor.moves || []).includes(m) ? v * 1.25 : v;   // (a move the team's sub-archetype favors: the team config)
}
// a move that slows the other side down (the owner's rule: never on a Trick Room team, where the slower side moves first): a Speed
// drop on the foes (Icy Wind, Electroweb, Rock Tomb, Scary Face, String Shot...), paralysis (Speed -2 here: Thunder Wave, Glare,
// Nuzzle) and Sticky Web; an attack only when that's its sure effect (half the time or more), so Thunderbolt and Bleakwind Storm stay
const slowsFoe = m => { const M = MOVES[m]; if (!M) return false;
  const sure = M.c === "X" || (M.sc || M.ac || 0) >= 50;
  return M.sp === "stickyweb" || (sure && M.st && M.sw !== "self" && M.st.some(([s, n]) => s === "spe" && n < 0)) || (sure && M.ail === "PAR"); };
function moveIn0(k, m, ab, held, c) {
  const M = MOVES[m], b = OPS[k].b; let v = movePick(k, m, ab, held);
  if (c && c.tr && slowsFoe(m)) return 1;
  if (M.c !== "X") {
    v *= Math.pow(Math.max(b[1], b[3], 20) / 95, .8);
    const w = c && c.wx;
    // Weather Ball: in the team's weather, 100 power and the weather's type (Fire, Water, Rock or Ice). A special move, so never on a
    // Pokémon that hits harder physically (the owner's rule)
    if (M.sp === "weatherball") {
      if (b[1] > b[3]) return 1;
      const wt = WB_TYPE[w], ts = OPS[k].types;
      if (wt) v *= 2 * (ts.includes(wt) ? 1.5 : 1) / (ts.includes("Normal") ? 1.5 : 1) * (w === "rain" || w === "sun" ? 1.3 : 1);
    }
    if (w === "rain") v *= M.t === "Water" ? 1.3 : M.t === "Fire" ? .8 : (m === "thunder" || m === "hurricane") ? 1.2 : 1;
    if (w === "sun") v *= M.t === "Fire" ? 1.3 : M.t === "Water" ? .8 : 1;
    if (w === "snow" && m === "blizzard") v *= 1.2;
    if (w === "sun" && (m === "thunder" || m === "hurricane")) v *= .7;   // 50% accuracy in harsh sunlight
    if (M.sp === "solar") v *= w === "sun" ? 1.4 : w ? .6 : 1;
    // the team's terrain (its own Surge Ability, or a teammate's): that type's attacks hit ×1.5 at once, Expanding Force hits every
    // foe at ×1.5 more in Psychic Terrain, Rising Voltage doubles in Electric Terrain, Misty Terrain halves Dragon moves. Future
    // Sight waits 2 rounds while the boosted Psychic attacks land now, so a Psychic Terrain team never runs it (the owner's rule)
    const SA = abilityOf(ab || OPS[k].ab), tt = (SA.id === "SURGE" && SA.t) || (c && (c.terrain || teamTerrain(c.team)));
    if (tt) {
      if (({ electric: "Electric", grassy: "Grass", psychic: "Psychic" })[tt] === M.t && M.sp !== "future") v *= 1.4;
      if (tt === "psychic" && M.sp === "expandingforce") v *= 1.7;
      if (tt === "electric" && m === "risingvoltage") v *= 1.6;
      if (tt === "misty" && M.t === "Dragon") v *= .6;
      if (tt === "psychic" && M.sp === "future" && M.t === "Psychic") return 1;
    }
    if ((M.sp === "hex" || M.sp === "venoshock") && c && c.sts) v *= 1 + .15 * Math.min(2, M.sp === "hex" ? c.sts.any : c.sts.psn);   // teammates status the targets for it
    return v;
  }
  if (M.hl || /recover|softboiled|roost|synthesis|wish|rest/.test(M.sp || "")) v *= Math.sqrt((b[0] + b[2] + b[4]) / 3 / 85);
  if (M.sp === "synthesis" && c && c.wx) v *= c.wx === "sun" ? 1.3 : .5;   // (Synthesis, Morning Sun, Moonlight: 2/3 in harsh sunlight, 1/4 in other weather)
  if (WX_SET[M.sp] && c && (c.wxG || c.team)) v = 15 + 45 * Math.min(1.6, c.wxG ? c.wxG[WX_SET[M.sp]] || 0 : wxBenefit(WX_SET[M.sp], c.team.filter(x => x.k !== k).concat([{ k, ab, mv: c.mv || [] }])));
  // (weather and terrain moves go up by themselves on entry and replace any other, the team's own too: one that fights the team's
  // weather or its Surge Ability's terrain is worse than nothing)
  if (WX_SET[M.sp] && c && c.wx && c.wx !== WX_SET[M.sp]) v = 1;
  if (M.sp === "terrain" && c) { const A = abilityOf(ab || OPS[k].ab), t = (A.id === "SURGE" && A.t) || c.terrain || teamTerrain(c.team); if (t && t !== TERRAIN_SET[m]) v = 1; }
  // (Aurora Veil only works in snow, and then it's Reflect and Light Screen at once, up by itself on entry: worth both with its own
  // Snow Warning or a snowy team, next to nothing on a team that never brings the snow)
  if (M.sp === "auroraveil" && c) {
    const snowy = x => WX_AB[x.ab || OPS[x.k].ab] === "snow" || (x.mv || []).some(mm => MOVES[mm] && WX_SET[MOVES[mm].sp] === "snow");
    const snow = WX_AB[ab || OPS[k].ab] === "snow" || c.wx === "snow" || (c.team || []).some(snowy);
    if (snow) v = 90; else if (c.wx || c.team) v = 3;
  }
  if (M.sp === "trickroom" && c && (c.teamSpe || c.team)) { const sp = c.teamSpe || c.team.reduce((a, x) => a + OPS[x.k].b[5], 0) / Math.max(1, c.team.length); v = sp < 65 ? 75 : sp < 80 ? 35 : 5; }
  return v;
}
// combos a set can carry: Protect, Detect or a Substitute before Focus Punch (nothing hits it in between, so it can't fail),
// Rest with Snore or Sleep Talk (they only work asleep, so without Rest they're dead weight), Defense Curl before Rollout,
// Charge before an Electric attack, Endure before Reversal, Flail or Endeavor, and Focus Energy with a high critical-hit move
const COVERS = ["protect", "detect", "substitute"], PINCH = ["reversal", "flail", "endeavor"];
const COMBO_MATE = new Set([...COVERS, ...PINCH, "rest", "rollout", "iceball"]);
const COMBO_PART = new Set(["focuspunch", "snore", "sleeptalk", "defensecurl", "charge", "endure", "focusenergy", "batonpass", "hex", "venoshock", "toxic", "leechseed", "followme", "ragepowder"]);
function comboBonus(k, mv, ab, held, c) {
  const has = m => mv.includes(m); let v = 0;
  if (has("snore") || has("sleeptalk")) v += has("rest") ? 25 : -40;
  if (has("defensecurl") && (has("rollout") || has("iceball"))) v += .5 * moveIn(k, has("rollout") ? "rollout" : "iceball", ab, held, c);
  if (has("charge")) { const el = mv.filter(m => m && MOVES[m] && MOVES[m].t === "Electric" && MOVES[m].c !== "X" && MOVES[m].p > 0); if (el.length) v += .3 * Math.max(...el.map(m => moveIn(k, m, ab, held, c))); }
  if (has("endure") && PINCH.some(has)) v += 25;
  if (has("focusenergy") && (mv.some(m => m && MOVES[m] && MOVES[m].cr) || held === "scopelens" || held === "razorclaw")) v += 25;   // stage 3: every hit a critical hit
  // Baton Pass after a boost passes it on; Protect or a Substitute while Toxic or Leech Seed does its work; Hex and Venoshock
  // (double power on a statused or poisoned target) with a move that inflicts it
  const M_ = m => m && MOVES[m];
  // Stored Power: 20 power plus 20 for every stat boost the user has (an S1 move, so it can be used every turn)
  if (has("batonpass") && mv.some(m => M_(m) && M_(m).c === "X" && M_(m).st && M_(m).sw !== "target" && M_(m).st.some(([, n]) => n > 0))) v += 20;
  if (COVERS.some(has) && (has("toxic") || has("leechseed"))) v += 10;
  if (has("hex") && mv.some(m => M_(m) && M_(m).c === "X" && ["SLP", "PAR", "BRN", "PSN", "TOX"].includes(M_(m).ail))) v += 15;
  if (has("venoshock") && mv.some(m => M_(m) && M_(m).c === "X" && ["PSN", "TOX"].includes(M_(m).ail))) v += 15;
  // a Follow Me or Rage Powder user stays out taking the hits (the owner's rule) and its healing moves share Follow Me's slot: an
  // attack that drains HP keeps it going
  if ((has("followme") || has("ragepowder")) && mv.some(m => M_(m) && M_(m).c !== "X" && M_(m).dr > 0)) v += 20;
  return v;
}
// a set of three (one per slot): each move as above, a second attack of a type it already has counts less, and the set as a
// whole is worth more the more of the pool it hits hard
function setValue(k, mv, ab, held, c) {
  const ts = []; let v = 0;
  mv.forEach((m, i) => {
    if (!m || !MOVES[m]) return;
    const M = MOVES[m]; let x = moveIn(k, m, ab, held, c);
    if (M.c !== "X") { const t = mvType(m, c); if (ts.includes(t)) x *= .75; ts.push(t); }
    v += x * (SLOT_USE[i + 1] || .5);
  });
  v += comboBonus(k, mv, ab, held, c) * .6;
  return v * Math.sqrt(coverOf(ts, c && c.cover) / 1.4);
}
// (moves that only work in odd cases are left out, as in Legend sets: Snore, Sleep Talk, fainting on purpose)
function optMoves(k, pool, ab, held, c) {
  const by = [[], [], []];
  for (const m of new Set(pool)) { if (!MOVES[m] || SET_SKIP.has(m)) continue; by[slotOf(m) - 1].push([m, moveIn(k, m, ab, held, c), MOVES[m].c !== "X" ? mvType(m, c) : null]); }
  const opts = by.map(l => {
    l.sort((a, b) => b[1] - a[1]);
    const top = l.slice(0, 6);
    for (const x of l) if (top.length < 12 && x[2] && !top.some(y => y[2] === x[2])) top.push(x);   // the best of each other type, for coverage
    for (const x of l) if ((COMBO_PART.has(x[0]) || COMBO_MATE.has(x[0])) && !top.includes(x)) top.push(x);   // and every combo piece it has
    return top.length ? top : [[null, 0, null]];
  });
  let best = [null, null, null], bv = -1;
  const u1 = SLOT_USE[1], u2 = SLOT_USE[2], u3 = SLOT_USE[3];
  for (const a of opts[0]) for (const b of opts[1]) for (const d of opts[2]) {
    const ts = []; let v = 0;
    for (const [x, u] of [[a, u1], [b, u2], [d, u3]]) { if (!x[0]) continue; let w = x[1]; if (x[2]) { if (ts.includes(x[2])) w *= .75; ts.push(x[2]); } v += w * u; }
    if (COMBO_PART.has(a[0]) || COMBO_PART.has(b[0]) || COMBO_PART.has(d[0])) v += comboBonus(k, [a[0], b[0], d[0]], ab, held, c) * .6;
    v *= Math.sqrt(coverOf(ts, c && c.cover) / 1.4);
    if (v > bv) { bv = v; best = [a[0], b[0], d[0]]; }
  }
  return { mv: best, v: bv };
}

// ---------- the build: Ability and moves together, then nature and item ----------
// c.pool = the moves it can have (picked anew for each Ability), else c.mv = the moves it has. Hidden Abilities need an
// Ability Patch, so they must be a little better. Returns { ab, mv, v } (v: what the Ability adds, as a share of its strength)
function bestBuild(k, c = {}) {
  const regs = regularAbilities(k), hids = hiddenAbilities(k), all = c.abs && c.abs.length ? c.abs : [...regs, ...hids];
  const held = c.held || null, plain = c.pool ? optMoves(k, c.pool, null, held, c).mv : (c.mv || defaultMoves(k, 100, true));
  const base = setValue(k, plain, null, held, c) || 1;
  let best = { ab: OPS[k].ab, mv: plain, v: -1e9 };
  for (const a of all.length ? all : [OPS[k].ab]) {
    const mv = c.pool ? optMoves(k, c.pool, a, held, c).mv : plain;
    const v = .5 * (setValue(k, mv, a, held, c) / base - 1) + abilityValue(k, a, { ...c, mv }) - (hids.includes(a) && !c.free ? .01 : 0) + (a === OPS[k].ab ? .001 : 0)
      + (c.favor && (c.favor.abilities || []).includes(a) ? .03 : 0);   // (an Ability the sub-archetype favors)
    if (v > best.v) best = { ab: a, mv, v };
  }
  return best;
}
// what an Ability is worth with these moves (to compare the one it has with the one it could have)
const abilityScore = (k, a, mv, c = {}) => .5 * (setValue(k, mv, a, c.held, c) / (setValue(k, mv, null, c.held, c) || 1) - 1) + abilityValue(k, a, { ...c, mv });
const pickAbility = (k, c = {}) => bestBuild(k, c).ab;
// the physical and special shares of what it does, and how much of it is attacking
function offShares(k, mv, ab, held, c) {
  let p = 0, sp = 0, all = 0;
  mv.forEach((m, i) => {
    if (!m || !MOVES[m]) return;
    const x = Math.max(0, moveIn(k, m, ab, held, c)) * (SLOT_USE[i + 1] || .5);
    all += x; if (MOVES[m].c === "P") p += x; if (MOVES[m].c === "S") sp += x;
  });
  return { p: p / (all || 1), s: sp / (all || 1), atk: (p + sp) / (all || 1) };
}
// the nature: +10% where it counts most, -10% where it counts least. What it does is roughly its turns x what each turn does x
// how long it lasts: +10% to the attacking stat it uses is +10% to its attacks, +10% Defense or Sp. Def keeps it in 10% longer
// against that side of the meta, and +10% Speed is only a few % more turns (turn meters soften Speed; less for slow Pokémon).
// Trick Room teams want less Speed; weather sweepers already have plenty
function optNature(k, mv, ab, c = {}) {
  const meta = c.meta || poolMeta(), o = offShares(k, mv, ab, null, c), A = abilityOf(ab || OPS[k].ab);
  const weatherFast = A.id === "WSPEED" && c.wx && (c.wx === A.w || (c.wx === "snow" && A.w === "hail"));
  const spd = .225 * (2 * OPS[k].b[5] + 100), turns = spd * .1 / (70 + spd);
  const hit = clamp(Math.pow(Math.max(OPS[k].b[1], OPS[k].b[3]) / 95, .8), .3, 1.3);   // a weak attacker's attacks matter less than its bulk
  // (a Follow Me, Rage Powder or Spotlight user wants to be bulky, its attacks matter little: it takes the hits for as long as it's
  // out, the owner's rule; how fast it is doesn't change that)
  const redirect = (mv || []).some(m => MOVES[m] && (MOVES[m].sp === "followme" || MOVES[m].sp === "spotlight"));
  const rb = redirect ? 2 : 1, ra = redirect ? .3 : 1;
  const w = { atk: .1 * o.p * hit * ra, spa: .1 * o.s * hit * ra, def: .1 * meta.phys * rb, sdf: .1 * (1 - meta.phys) * rb, spe: c.tr ? -turns : turns * (weatherFast ? .3 : 1) };
  let best = "serious", bv = 0;
  for (const n of MINT_NATURES) { const [u, d] = NATURES[n]; if (!u) continue; const v = w[u] - w[d] * 1.1; if (v > bv + 1e-9) { bv = v; best = n; } }
  return best;
}
// a held item's worth to this Pokémon with this build (b: { mv, ab }), as a share of its strength
// Ring Target: worth what its attacks lose to immunities in the field it meets (meta.immune, or topImmune for top-tier
// Trainers: the share of Pokémon immune to a type, by type or Ability), counting for each attack only the gap to its next-best
// attack (what it would use on that Pokémon instead), except spread moves, which still go off at the others and lose their whole
// hit on every immune foe (Earthquake into Flying types and Levitate, Discharge and Electroweb into Ground types, Lightning Rod and
// Volt Absorb), times RING_K. So it pays for spread attackers (Zapdos's Discharge, Jolteon's Electroweb, Earthquake users) and a
// Pokémon whose attacks are nearly all one walled type, and next to nothing where other moves cover (Gengar's Sludge Wave and Icy
// Wind for Normal types, Machamp's Payback for Gengar). More generations bring more immunities (Dark types for Psychic), and it
// counts them as they come.
const RING_K = 2;
// what the top tiers' teams are immune to (Master Ball and up run archetype teams): a few line-ups of every archetype, with the
// Ability its role wants (else the species' own), so it follows the archetypes. Top-tier Trainers judge Ring Target against
// these, the opponents they really meet, not every Pokémon counted equally (Legend teams: 47% immune to Ground, 5% to Ghost;
// every Pokémon equally: 19% and 16%, which made Gengar's Shadow Ball look walled)
function topImmune() {
  if (topImmune.v) return topImmune.v;
  const mons = [];
  for (const A of ARCHETYPES) for (const sub of A.subs) for (let s = 0; s < 2; s++) {
    const { team, roles } = archetypeTeam(A, .95, seeded(hash("topImmune:" + A.id + ":" + sub + ":" + s)), sub);
    for (const k of team) {
      const R = A.roles.find(R => R.r === roles[k]), ab = (R && R.ab && R.ab.find(a => OPS[k].abs.some(x => x.k === a))) || OPS[k].ab;
      mons.push({ k, ab, mv: [] });
    }
  }
  return (topImmune.v = metaOf(mons).immune);
}
// the items that stretch a field (a backup setter leaves them to the lead one) and the ones that hit harder
const FIELD_ITEMS = new Set(["heatrock", "damprock", "smoothrock", "icyrock", "terrainextender", "roomservice"]);
const ATTACK_ITEMS = new Set(["choiceband", "choicespecs", "lifeorb", "expertbelt", "muscleband", "wiseglasses", "berserkgene", ...Object.keys(HELD).filter(h => HELD[h].boost || (HELD[h].types && !HELD[h].only))]);
// Unburden (Speed +2 while it holds no item): an item that's never used up costs it that
const USED_UP = /berry$|sash|gem|herb|seed$|balloon|whiteherb|powerherb|weaknesspolicy|blunderpolicy|adrenalineorb|ejectbutton|ejectpack|redcard|berserkgene/;
function itemValue(k, h, b, c = {}) {
  const v = itemValue0(k, h, b, c);
  return v > -1 && abilityOf(b.ab || OPS[k].ab).id === "UNBURDEN" && !USED_UP.test(h) ? v - .25 : v;
}
function itemValue0(k, h, b, c = {}) {
  const H = HELD[h]; if (!H) return -1;
  if (H.only && !H.only.includes(k)) return -1;
  // a backup setter (the owner's rule): the lead setter holds the rock or the Terrain Extender, the offensive backup an attacking item
  if (b.backup && FIELD_ITEMS.has(h)) return -1;
  if (b.backup && ATTACK_ITEMS.has(h)) { const v = itemValue0(k, h, { ...b, backup: false }, c); return v > 0 ? v * 1.3 + .02 : v; }
  const op = OPS[k], types = op.types, bb = op.b, A = abilityOf(b.ab || op.ab), meta = c.meta || poolMeta(), DEF = .5;
  const rdr = (b.mv || []).some(m => MOVES[m] && (MOVES[m].sp === "followme" || MOVES[m].sp === "spotlight"));   // (a redirector: it wants to be bulky)
  if (rdr && (h === "ejectbutton" || h === "ejectpack")) return -1;   // (it's there to stay out and take the hits: the owner's rule)
  // attack items are worth what the Pokémon's attacks are worth: Chansey's barely dent anything
  // (a redirector's job is taking the hits, not dealing them: its attacks count for about a third)
  const mv = (b.mv || []).filter(m => MOVES[m]), o0 = offShares(k, mv, b.ab, h, c), hit = clamp(Math.pow(Math.max(bb[1], bb[3]) / 95, .8), .3, 1.3) * (rdr ? .35 : 1);
  const o = { p: o0.p * hit, s: o0.s * hit, atk: o0.atk * hit };
  const share = f => {
    let x = 0, all = 0;
    mv.forEach((m, i) => { const v = Math.max(0, moveIn(k, m, b.ab, h, c)) * (SLOT_USE[i + 1] || .5); all += v; if (f(MOVES[m], m)) x += v; });
    return x / (all || 1) * hit;   // (every use of it is about its attacks)
  };
  const shareW = g => { let x = 0, all = 0; mv.forEach((m, i) => { const v = Math.max(0, moveIn(k, m, b.ab, h, c)) * (SLOT_USE[i + 1] || .5); all += v; x += v * (g(MOVES[m], m) || 0); }); return x / (all || 1) * hit; };
  const has = list => mv.some(m => list.includes(m) || list.includes(MOVES[m].sp));
  const frail = clamp(1 - (bb[0] + bb[2] + bb[4]) / 3 / 90, 0, 1), part = t => dmgPart(t, types, meta);
  const cantPsn = types.includes("Poison") || types.includes("Steel"), cantBrn = types.includes("Fire");
  if (H.boost) return .25 * share(M => M.c !== "X" && M.t === H.boost);   // (type-boosting items ×1.5)
  if (H.memory) return .12 + .1 * (1 - resistShare(H.memory));   // (Silvally: its type and Multi-Attack's, best where little resists it)
  // (Booster Energy only where the field can't do it, the owner's rule: Protosynthesis on a sun team, Quark Drive on an Electric
  // Terrain team already have their boost, so they hold something else)
  if (H.paradox) return A.id !== "PARADOX" ? -1 : (A.w && c.wx === A.w) || (A.t && c.terrain === A.t) ? -.05 : .35 * (rdr && Math.max(bb[2], bb[4]) < Math.max(bb[1], bb[3], bb[5]) ? .25 : 1);   // (a redirector's boost wants to be a defence)   // Booster Energy (never used up: the owner's rule)
  if (h === "souldew") return .45 * share(M => M.c !== "X" && H.types.includes(M.t)) + .2 * share(M => M.c === "S") + .1;   // (Soul Dew: Sp. Atk and Sp. Def +1 too)
  if (H.types) return H.types === "all" ? .2 * share(M => M.c !== "X") : .45 * share(M => M.c !== "X" && H.types.includes(M.t));   // the orbs and the Soul Dew (×1.5), the masks (×1.2)
  if (H.gem) return .045 * share(M => M.c !== "X" && M.t === H.gem);
  if (H.resist) return typeEff(H.resist, types) > 1 ? DEF * part(H.resist) * .5 : 0;
  if (H.pinch) return H.pinch === "atk" ? .02 + .03 * o.p : H.pinch === "spa" ? .02 + .03 * o.s : .02;
  if (H.cure && h !== "lumberry") return H.cure.reduce((a, s) => a + (meta.status[s] || 0), 0) * .3 + (H.cure.includes("SLP") && has(["rest"]) ? .15 : 0);   // a Chesto Berry wakes it from Rest at once
  // Berry Juice and the Oran Berry heal a fixed 20 or 10 HP: when the build knows its level (b.lvl, the Demo's own plan) they're worth
  // what that is of the Pokémon's HP there, at the Sitrus Berry's rate (.06 for a quarter; at most about 60% counts, as it heals at
  // half HP): nearly all of a Lv 5 starter's, a sixth of a Lv 50's. On the Journey (c.journey) twice over, as a normal stage gives it
  // back every wave (nextWave in a7_engine.js). Without a level (the Trainers' builds, at their tiers' levels) they stay small
  if (H.healFlat && b.lvl) return .24 * Math.min(H.healFlat / calcStats(k, b.lvl, 0).hp, .6) * (c.journey ? 2 : 1);
  if (H.healAt) return h === "sitrusberry" ? .06 + (A.id === "HARVEST" ? .08 : 0) + (has(["bellydrum"]) ? .12 : 0) : H.heal ? .045 : .01;   // Belly Drum halves its HP: the Sitrus Berry gives a quarter back
  switch (h) {
    case "lightball": return .5;
    case "thickclub": return .45;
    case "luckypunch": case "leek": return .25 * o.atk + (A.id === "SNIPER" ? .1 : 0);
    case "metalpowder": return .2;
    case "quickpowder": return .1;
    case "choiceband": return .25 * o.p;
    case "choicespecs": return .25 * o.s;
    case "choicescarf": return c.tr ? -.2 : .15 * (bb[5] >= 50 && bb[5] <= 110 ? 1 : .5) * (rdr ? .35 : 1);   // (a redirector's extra turns are for its attacks: a third)
    case "berserkgene": return .3 * o.p - .08;
    case "lifeorb": return .25 * o.atk - (A.id === "MAGIC_GUARD" ? 0 : A.id === "SHEER_FORCE" ? .07 * (1 - share(M => M.ail || M.fl || (M.st && M.sw !== "self"))) : .07);
    case "expertbelt": return .035 * o.atk;
    case "muscleband": return .25 * o.p;   // (Attack +1, like a Choice Band)
    case "wiseglasses": return .25 * o.s;
    case "punchingglove": return .05 * share(M => M.pu);
    case "loadeddice": return .5 * shareW(M => diceGain(M, A.key) - 1) + .5 * share((M, m) => ["magnitude", "eruption", "waterspout", "dragonenergy", "crushgrip", "wringout", "hardpress", "heatcrash", "heavyslam", "lowkick", "grassknot", "electroball", "gyroball"].includes(m));   // (those roll 150 every time with it)
    case "metronome": return .05 * share((M, m) => mv[0] === m);
    case "scopelens": case "razorclaw": return .02 + (A.id === "SNIPER" ? .03 : 0) + .03 * share(M => M.cr) + (has(["focusenergy"]) ? .06 : 0);
    case "widelens": case "zoomlens": return .08 * share(M => M.a && M.a < 100);   // (accuracy +1)
    // (10% flinch with each damaging move, each strike of a multi-strike move rolling it: 27% over Bullet Seed's 3 strikes on average,
    // 41% over 5 with Skill Link; Serene Grace doubles each roll; a move that flinches by itself doesn't add it)
    case "kingsrock": case "razorfang": { const sg = A.id === "SERENE" ? 2 : 1;
      return .015 + .15 * shareW(M => M.c === "X" || M.fl ? 0 : overStrikes(.1 * sg, strikesOf(M, A.key, h)) - .1 * sg); }
    // +30% turn meter whenever it comes in: worth most to a Pokémon whose moves pay off on the first turn (Tailwind, sleep and
    // paralysis, setup boosts; weather, Trick Room, screens and hazards go up on entry anyway), and it stacks with priority moves
    case "quickclaw": return .05 + .2 * share(M => M.c === "X" && (FIRST_TURN.has(M.sp) || M.ail === "SLP" || M.ail === "PAR" || (M.st && M.sw !== "target" && M.st.some(([, n]) => n > 0))));
    case "shellbell": return .03 * o.atk;
    case "throatspray": return .1 * share(M => M.so);
    case "whiteherb": return .1 * share(M => M.st && M.sw === "self" && M.st.some(([, n]) => n < 0));
    // (a Follow Me or Rage Powder user heals where it stands: it never switches out, and its healing moves share Follow Me's slot)
    case "leftovers": return .06 + .04 * (1 - frail) + (rdr ? .06 : 0);
    case "blacksludge": return types.includes("Poison") ? .06 + .04 * (1 - frail) + (rdr ? .06 : 0) : -.1;
    case "assaultvest": return DEF * (1 - meta.phys) * .3;   // (status moves allowed: the owner's rule)
    case "rockyhelmet": return meta.contact * .06 * (1.5 - frail);
    case "focussash": return (A.id === "STURDY" ? .005 : .02 + .08 * frail) + (has(["reversal", "flail", "endeavor", "counter", "mirrorcoat"]) ? .06 : 0);   // hang on at 1 HP, then hit back
    case "lumberry": return meta.statusAny * .3 + .01 + (has(["rest"]) ? .15 : 0);
    case "weaknesspolicy": return .04 + .04 * (1 - frail) + (c.screens ? .08 : 0);   // behind the team's screens it survives the hit that powers it up
    case "airballoon": return typeEff("Ground", types) > 0 && A.id !== "IMMUNE_TYPE" ? DEF * part("Ground") * .5 : 0;
    case "heavydutyboots": return .02;
    case "toxicorb": case "flameorb": {
      // only for the Abilities that feed on a status condition, and never one its type is immune to
      if ((h === "toxicorb" && cantPsn) || (h === "flameorb" && cantBrn)) return -.2;
      const chip = h === "toxicorb" ? .08 : .04;   // what the poison or burn costs it each turn
      if (A.id === "GUTS") return .3 * o.p - chip;
      if (A.id === "QUICK_FEET") return .15 - chip - (h === "flameorb" ? .1 * o.p : 0);
      if (A.id === "MARVEL") return .1 - chip - (h === "flameorb" ? .2 * o.p : 0);
      return -.2;
    }
    case "lightclay": return has(["reflect", "lightscreen", "auroraveil"]) ? .08 : 0;
    case "heatrock": return A.id === "FORECAST" ? .4 : has(["sunnyday"]) || A.id === "DROUGHT" ? .08 : 0;   // (Castform: its form and weather Ability)
    case "damprock": return A.id === "FORECAST" ? .4 : has(["raindance"]) ? .08 : 0;
    case "smoothrock": return has(["sandstorm"]) ? .08 : 0;
    case "icyrock": return A.id === "FORECAST" ? .4 : has(["hail", "snowscape"]) ? .08 : 0;
    case "terrainextender": return has(["terrain"]) ? .05 : 0;
    case "bigroot": return .1 * share(M => M.dr > 0) + (has(["leechseed"]) ? .05 : 0);
    case "bindingband": case "gripclaw": return .1 * share(M => M.ail === "TRAP");
    case "roomservice": return has(["trickroom"]) ? .1 : 0;   // (a Trick Room extender: 8 rounds)
    case "adrenalineorb": return meta.intim * .05;
    case "covertcloak": return .03;
    case "clearamulet": return meta.intim * o.p * .3 + meta.drops * .1;
    case "mirrorherb": return meta.setup * .1;
    case "safetygoggles": return meta.powder * .2 + .005;
    case "protectivepads": return .01;
    case "laxincense": case "brightpowder": return .06;   // (evasiveness +1)
    // Ring Target: its attacks hit what's immune to them, by type or by Ability, for ×1 (RING_K above)
    // Against a Pokémon immune to one of its attacks it would use its next-best attack instead, so what Ring Target saves is the
    // gap: next to nothing for Dragonite (Dragon Tail and Fly when Stomping Tantrum can't land) or Machamp (Payback for Gengar),
    // most for Dugtrio (all Ground) or Jolteon (Electric and little else)
    case "ringtarget": {
      const imm = c.immune || meta.immune || {}, WALL = { Normal: "Ghost", Fighting: "Ghost" };
      const atks = mv.map((m, i) => ({ M: MOVES[m], v: Math.max(0, moveIn(k, m, b.ab, h, c)) * (SLOT_USE[i + 1] || .5) })).filter(a => a.M.c !== "X" && a.v > 0);
      const all = atks.reduce((s, a) => s + a.v, 0) || 1;
      let x = 0;
      for (const a of atks) {
        const f = imm[a.M.t] || 0; if (!f) continue;
        // a spread move (Earthquake, Discharge, Electroweb) still goes off at the others, so every immune foe out there just loses
        // its hit: all of it counts; a single-target one loses only the gap to the next-best attack
        if (a.M.tg === "foes") { x += f * a.v; continue; }
        const alt = Math.max(0, ...atks.filter(o => o !== a && o.M.t !== a.M.t && !(WALL[o.M.t] && WALL[o.M.t] === WALL[a.M.t])).map(o => o.v));
        x += f * Math.max(0, a.v - alt);
      }
      return RING_K * x / all * hit;
    }
    case "eviolite": return op.evo.length ? DEF * .33 : -.1;
    case "ironball": case "laggingtail": case "stickybarb": case "fullincense": return -.05;
    case "luckyegg": case "amuletcoin": return 0;
    default: return .005;
  }
}
// held items for a whole team: the most valuable pairings first, as many as it has of each, the Item Clause per team.
// builds: [{ k, mv, ab }], have(h): how many copies the team can use. Returns { k: item }, and its total worth in .v
const itemTable = (builds, c = {}) => Object.fromEntries(builds.map(x => [x.k, Object.fromEntries(HELD_KEYS.map(h => [h, itemValue(x.k, h, x, c)]))]));
function shareItems(V, have) {
  const pairs = [];
  for (const k in V) for (const h in V[k]) if (V[k][h] > 0 && have(h) > 0) pairs.push([k, h, V[k][h]]);
  pairs.sort((a, b) => b[2] - a[2]);
  const out = {}, used = {}; let v = 0;
  for (const [k, h, x] of pairs) {
    if (out[k] || (used[h] || 0) >= have(h) || (ITEM_CLAUSE.includes(h) && used[h])) continue;
    out[k] = h; used[h] = (used[h] || 0) + 1; v += x;
  }
  Object.defineProperty(out, "v", { value: v });
  return out;
}
const teamItems = (builds, have, c = {}) => shareItems(itemTable(builds, c), have);
// the team's setters lead: weather its teammates use, Trick Room for a slow team, Tailwind, screens (specs: battle specs)
// the owner's rule (2026-10-14): a team's screen users (Reflect, Light Screen, Aurora Veil) are always among its opening three, so the
// screens go up the moment the battle starts. One that isn't takes the place of the last lead that isn't a screen user, which goes to
// the front of the bench. Trainer teams only (npcLeads, draftLeads in a6g_teams.js): never the Demo's or yours
const SCREEN_MOVES = ["reflect", "lightscreen", "auroraveil"];
const isScreenUser = s => ((s.prog && s.prog.mv) || s.mv || []).some(m => SCREEN_MOVES.includes(m));
function screensLead(specs) {
  const out = specs.slice(), n = Math.min(ACTIVE, out.length);
  for (const s of out.filter(isScreenUser).slice(0, n)) {
    if (out.indexOf(s) < n) continue;
    let j = n - 1; while (j >= 0 && isScreenUser(out[j])) j--; if (j < 0) break;
    const x = out[j]; out.splice(out.indexOf(s), 1); out[j] = s; out.splice(n, 0, x);
  }
  return out;
}
function settersFirst(specs) {
  const team = specs.map(s => ({ k: s.op, ab: (s.prog && s.prog.ab) || OPS[s.op].ab, mv: (s.prog && s.prog.mv) || [] }));
  const sets = s => {
    const mv = (s.prog && s.prog.mv) || [], ab = (s.prog && s.prog.ab) || OPS[s.op].ab;
    if (WX_AB[ab] && wxBenefit(WX_AB[ab], team) >= 1) return 3;
    if (mv.some(m => MOVES[m] && WX_SET[MOVES[m].sp] && wxBenefit(WX_SET[MOVES[m].sp], team) >= 1)) return 3;
    if (mv.includes("trickroom") && team.reduce((a, x) => a + OPS[x.k].b[5], 0) / team.length < 70) return 2;
    if (mv.includes("tailwind") || mv.includes("reflect") || mv.includes("lightscreen") || mv.includes("auroraveil")) return 1;
    return 0;
  };
  const lead = specs.filter(s => sets(s) > 0).sort((a, b) => sets(b) - sets(a)).slice(0, 1);
  return [...lead, ...specs.filter(s => !lead.includes(s))];
}

// the weather a team sets up and gets something out of (a setter, and enough on the team that uses it), if any
const teamWeather = builds => ["rain", "sun", "sand", "snow"].find(w => wxBenefit(w, builds) >= 1 && builds.some(x => WX_AB[x.ab] === w || (x.mv || []).some(m => m && MOVES[m] && WX_SET[MOVES[m].sp] === w)));

// ---------- simulated Trainers optimize too ----------
// They live in the game like you, so they build their Pokémon the same way, out of what they've got so far: TMs come with
// progress (none before Lv 10, all of them by Lv 90; everyone at the same stage has the same ones), the Ability Capsule from
// Lv 20 and the Ability Patch from the Great Ball tier (or Lv 60), Mints from Lv 25; held items from Lv 10: common ones first,
// uncommon from the Poké Ball tier (or Lv 50), rare ones and Pokémon-only items from the Great Ball tier (or Lv 70). One of each.
const TM_ORDER = () => TM_ORDER.v || (TM_ORDER.v = TMS.map(([n]) => n).sort((a, b) => hash("tm" + a) - hash("tm" + b)));
function npcAccess(L, tier = 0) {
  const tmB = clamp(Math.floor((L - 10) / 10), 0, 8), all = TM_ORDER(), T = (npcAccess.tm = npcAccess.tm || {});
  const tms = T[tmB] || (T[tmB] = new Set(all.slice(0, Math.round(all.length * tmB / 8))));
  const items = h => {
    const H = HELD[h]; if (!H || L < 10) return 0;
    const need = H.only || H.t === 3 ? 2 : H.t === 2 ? 1 : 0;
    return tier >= need || L >= 30 + 20 * need ? 1 : 0;
  };
  return { L, tier, tmB, tms, capsule: L >= 20, patch: tier >= 2 || L >= 60, mint: L >= 25, items };
}
// one Pokémon's moves, Ability and nature from what its Trainer can get (shared between Trainers at the same stage)
const NPC_BUILD = new Map();
function npcBuild(k, p, ac, c = {}) {
  const banAb = a => !!(c.ban && c.ban.abilities.has(a)), banMv = m => !!(c.ban && c.ban.moves.has(m));
  let abs = c.ab ? [c.ab] : ac.capsule ? (ac.patch ? null : regularAbilities(k)) : [p.ab || OPS[k].ab];
  if (c.ban && c.ban.abilities.size) { const ok = (abs || [...regularAbilities(k), ...hiddenAbilities(k)]).filter(a => !banAb(a)); abs = ok.length ? ok : abs; }
  const keys = (c.keys || (c.key ? [c.key] : [])).filter(m => !banMv(m));
  const id = [MOVE_WORTH_ON ? 1 : 0, k, p.lvl, ac.tmB, abs ? abs.join("/") : "*", ac.mint ? "" : p.nat, c.wx || "", c.terrain || "", c.tr ? 1 : 0, c.wxG ? JSON.stringify(c.wxG) : "", c.teamSpe || "", keys.join("+"), c.sts ? c.sts.any + "/" + c.sts.psn : "", c.ban ? [...c.ban.moves, ...c.ban.abilities].join(",") : "", c.favor ? [...(c.favor.moves || []), ...(c.favor.abilities || [])].join(",") : ""].join("|");
  let x = NPC_BUILD.get(id);
  if (!x) {
    // (a Trainer's Smeargle comes already sketched: any move, the owner's rule)
    let pool = sketcher(k) ? sketchable() : [...levelMoves(k, p.lvl), ...OPS[k].tms.filter(n => ac.tms.has(n)).map(n => TM_MOVE[n]).filter(Boolean)];
    if (c.ban && c.ban.moves.size) pool = pool.filter(m => !banMv(m));
    if (keys.length) pool = [...keys, ...pool.filter(m => MOVES[m] && !keys.some(x => slotOf(x) === slotOf(m)))];   // the moves its role is there for
    const B = bestBuild(k, { meta: poolMeta(), wx: c.wx, terrain: c.terrain, tr: c.tr, wxG: c.wxG, teamSpe: c.teamSpe, sts: c.sts, pool, abs: abs && abs.filter(Boolean), free: true, favor: c.favor });
    x = { mv: B.mv, ab: B.ab, nat: ac.mint ? optNature(k, B.mv, B.ab, { meta: poolMeta(), tr: c.tr, wx: c.wx }) : p.nat };
    NPC_BUILD.set(id, x); if (NPC_BUILD.size > 8000) NPC_BUILD.delete(NPC_BUILD.keys().next().value);
  }
  return x;
}
// a whole account (roster, prog, team). Alone (team = false): every Pokémon gets its own best build and item. As a team
// (competitive optimization, for Legend sets): each built alone first; then again knowing what weather or Trick Room would do
// for this team, so a setter weighs its Rain Dance by its teammates; then, if someone does set it up, the whole team plays to
// it; one of each item over the team, and the box gets what's left. An archetype team's roles keep what they're there for
// (roleLocks in a6g_teams.js; the owner's rule: the plan has to be real).
function npcOptimize(acc, ac0, team = true) {
  // the team config (a6g_teams.js): what no Trainer team may have, what this sub-archetype bans, and what it favors (with a second
  // plan joining it, both sub-archetypes')
  const subOf = a => a ? ((archById(a.id) || {}).sub || {})[a.sub] : null, S0 = acc.arch ? subOf(acc.arch) : null, S1 = acc.arch && acc.arch.over ? subOf(acc.arch.over) : null;
  const both = (x, y) => ({ moves: [...((x || {}).moves || []), ...((y || {}).moves || [])], abilities: [...((x || {}).abilities || []), ...((y || {}).abilities || [])], items: [...((x || {}).items || []), ...((y || {}).items || [])], pokemon: [...((x || {}).pokemon || []), ...((y || {}).pokemon || [])] });
  const S = S0 || S1 ? { ban: both(S0 && S0.ban, S1 && S1.ban), favor: both(S0 && S0.favor, S1 && S1.favor) } : null, sb = banSet(S && S.ban), fav = S && S.favor;
  const ban = { moves: new Set([...TEAM_BAN.moves, ...sb.moves]), abilities: new Set([...TEAM_BAN.abilities, ...sb.abilities]) }, banIt = new Set([...TEAM_BAN.items, ...sb.items]);
  const ac = banIt.size ? { ...ac0, items: h => banIt.has(h) ? 0 : ac0.items(h) } : ac0;
  const extra = { ...(ban.moves.size || ban.abilities.size ? { ban } : {}), ...(fav && ((fav.moves || []).length || (fav.abilities || []).length) ? { favor: fav } : {}) };
  const favIt = fav && (fav.items || []).length ? fav.items : null;
  // an archetype team: each role keeps the move, Ability and item it's there for (the plan has to be real), the rest optimized around it
  const locks = acc.arch && acc.roles && typeof roleLocks === "function" ? roleLocks(acc, ac) : {};
  // one Trick Room user per team, and its backup (the owner's rules): Trick Room goes up by itself when its user comes in and ends a
  // room that's up, so another user would end the team's own room; the backup only comes in once the room is down. Those whose roles
  // keep it, else the first that takes it (leads first)
  const noTR = new Set();
  const trOnce = builds => {
    const users = builds.filter(x => x.mv.includes("trickroom")).map(x => x.k);
    const keep = new Set(acc.team.filter(k => locks[k] && locks[k].keys.includes("trickroom"))); if (!keep.size && users.length) keep.add(users[0]);
    const drop = users.filter(k => !keep.has(k)); for (const k of drop) noTR.add(k);
    return drop.length > 0;
  };
  // a Trainer's Follow Me, Rage Powder or Spotlight user never switches out (the owner's rule): no move or Ability that takes it out
  // (Eject Button and Eject Pack are worth nothing to it: itemValue)
  const PIVOT_OUT = ["uturn", "voltswitch", "flipturn", "teleport", "partingshot", "batonpass", "shedtail", "chillyreception"], PIVOT_AB = ["emergency-exit", "wimp-out"];
  const noPivot = new Set();
  const pivOnce = builds => {
    const add = builds.filter(x => !noPivot.has(x.k) && x.mv.some(m => MOVES[m] && (MOVES[m].sp === "followme" || MOVES[m].sp === "spotlight")) && (x.mv.some(m => PIVOT_OUT.includes(m)) || PIVOT_AB.includes(x.ab)));
    for (const x of add) noPivot.add(x.k);
    return add.length > 0;
  };
  const banOf = k => {
    if (!noTR.has(k) && !noPivot.has(k)) return {};
    const moves = new Set(extra.ban ? extra.ban.moves : []), abilities = new Set(extra.ban ? extra.ban.abilities : []);
    if (noTR.has(k)) moves.add("trickroom");
    if (noPivot.has(k)) { for (const m of PIVOT_OUT) moves.add(m); for (const a of PIVOT_AB) abilities.add(a); }
    return { ban: { moves, abilities } };
  };
  const top = (ac.tier || 0) >= T_MASTER;   // (a top-tier Trainer meets top-tier teams: Ring Target judged against those, topImmune)
  // (backup: the plan's backup setter, which leaves the rock to the lead setter and holds an attacking item: itemValue)
  const backup = k => !!(acc.roles && acc.roles[k] && typeof ROLE === "function" && ROLE(acc.roles[k]).kind === "backup");
  const B = (k, c) => ({ k, backup: backup(k), ...npcBuild(k, acc.prog[k], ac, { ...c, ...extra, ...banOf(k), ...(locks[k] && locks[k].keys.length ? { keys: locks[k].keys } : {}), ...(locks[k] && locks[k].ab ? { ab: locks[k].ab } : {}) }) });
  // the roles' items first (leads first: the team's one Quick Claw goes to its first lead that wants it), then one of each
  const lockItems = () => {
    const got = {}, used = {};
    for (const k of acc.team) for (const h of (locks[k] && locks[k].items) || []) if (ac.items(h) && !used[h]) { got[k] = h; used[h] = 1; break; }
    return { got, used };
  };
  if (!team) {
    let all = acc.roster.map(k => B(k, {}));
    const tm = all.filter(x => acc.team.includes(x.k));
    if (trOnce(tm) | pivOnce(tm)) all = acc.roster.map(k => B(k, {}));
    // (a Trick Room team: its members built for the room, no move that slows the other side: slowsFoe)
    if (all.some(x => acc.team.includes(x.k) && x.mv.includes("trickroom"))) all = all.map(x => acc.team.includes(x.k) ? B(x.k, { tr: true }) : x);
    // (the team's weather and terrain count for its items: no Booster Energy where the field already powers the Paradox Ability)
    const tm1 = all.filter(x => acc.team.includes(x.k)), c0 = { wx: teamWeather(tm1), terrain: teamTerrain(tm1) };
    const rows = { ...itemRows(all.filter(x => !acc.team.includes(x.k)), { top, favIt }), ...itemRows(tm1, { ...c0, top, favIt }) }, { got, used } = lockItems(), clause = { ...used };
    for (const x of all) Object.assign(acc.prog[x.k], { mv: x.mv.slice(), ab: x.ab, nat: x.nat });
    // each its own best item they can get; an Item Clause item goes to whoever on the team it helps most
    for (const k of [...acc.team, ...acc.roster.filter(k => !acc.team.includes(k))]) {
      if (got[k]) { acc.prog[k].held = got[k]; continue; }
      const best = HELD_KEYS.filter(h => ac.items(h) && rows[k][h] > 0 && !(ITEM_CLAUSE.includes(h) && clause[h])).sort((a, b) => rows[k][b] - rows[k][a])[0] || null;
      if (best && ITEM_CLAUSE.includes(best)) clause[best] = 1;   // (the whole box: a Pokémon swapped in later can't bring a second one)
      acc.prog[k].held = best;
    }
    return acc;
  }
  let tb = acc.team.map(k => B(k, {}));
  if (trOnce(tb) | pivOnce(tb)) tb = acc.team.map(k => B(k, {}));
  const wxG = {}; for (const w of ["rain", "sun", "sand", "snow"]) wxG[w] = Math.round(wxBenefit(w, tb) * 2) / 2;
  const teamSpe = Math.round(tb.reduce((a, x) => a + OPS[x.k].b[5], 0) / tb.length / 5) * 5;
  const stx = (x, list) => x.mv.some(m => MOVES[m] && MOVES[m].c === "X" && list.includes(MOVES[m].ail)) || x.mv.includes("toxicspikes");
  const sts = { any: tb.filter(x => stx(x, ["SLP", "PAR", "BRN", "PSN", "TOX"])).length, psn: tb.filter(x => stx(x, ["PSN", "TOX"])).length };
  tb = acc.team.map(k => B(k, { wxG, teamSpe, sts }));
  const c = { wx: teamWeather(tb), terrain: teamTerrain(tb), tr: tb.some(x => x.mv.includes("trickroom")), wxG, teamSpe, sts, screens: tb.some(x => x.mv.some(m => ["reflect", "lightscreen", "auroraveil"].includes(m))) };
  if (c.wx || c.tr || c.terrain) tb = acc.team.map(k => B(k, c));
  if (pivOnce(tb)) tb = acc.team.map(k => B(k, c));
  const bench = acc.roster.filter(k => !acc.team.includes(k)).map(k => B(k, {}));
  for (const x of [...tb, ...bench]) Object.assign(acc.prog[x.k], { mv: x.mv.slice(), ab: x.ab, nat: x.nat });
  // (an Item Clause item a role already holds isn't handed out again; nor, below, to the box)
  const L = lockItems(), rows = itemRows(tb.filter(x => !L.got[x.k]), { ...c, top, favIt }), ti = { ...shareItems(rows, h => ITEM_CLAUSE.includes(h) && L.used[h] ? 0 : ac.items(h) - (L.used[h] || 0)), ...L.got }, used = {};
  for (const k in ti) used[ti[k]] = (used[ti[k]] || 0) + 1;
  const bi = shareItems(itemRows(bench, { top }), h => ITEM_CLAUSE.includes(h) && used[h] ? 0 : ac.items(h) - (used[h] || 0));
  for (const k of acc.roster) acc.prog[k].held = ti[k] || bi[k] || null;
  return acc;
}
// held item values for these builds (kept per build: many Trainers share them)
const ITEM_ROWS = new Map();
function itemRows(builds, c) {
  const out = {};
  for (const x of builds) {
    const id = [x.k, x.mv.join(), x.ab, c.wx || "", c.terrain || "", c.tr ? 1 : 0, c.screens ? 1 : 0, c.top ? 1 : 0, x.backup ? 1 : 0, c.favIt ? c.favIt.join(",") : ""].join("|");
    if (!ITEM_ROWS.has(id)) { ITEM_ROWS.set(id, Object.fromEntries(HELD_KEYS.map(h => [h, itemValue(x.k, h, x, { meta: poolMeta(), wx: c.wx, terrain: c.terrain, tr: c.tr, screens: c.screens, immune: c.top ? topImmune() : null }) + (c.favIt && c.favIt.includes(h) ? .03 : 0)]))); if (ITEM_ROWS.size > 8000) ITEM_ROWS.delete(ITEM_ROWS.keys().next().value); }
    out[x.k] = ITEM_ROWS.get(id);
  }
  return out;
}
// how each of these Pokémon matches up against those (a probe battle, the real damage math): what it takes off each foe per
// hit against what it loses per hit, moving first counting both ways
function specMatch(specs, foes) {
  const B = makeBattle({ allies: specs, waves: [foes], auto: true, sim: true, probe: true });
  for (const u of B.units) for (const s in u.stages) u.stages[s] = 0;
  const A = B.units.filter(u => u.team === "A"), E = B.units.filter(u => u.team === "E");
  const best = (a, t) => { let m = 0; for (const s of a.skills) if (s.M.c !== "X") m = Math.max(m, Math.max(0, B.estimate(a, t, s)) * (s.slot === 1 ? 1 : .85)); return m; };
  return A.map(a => E.reduce((acc, e) => {
    const off = Math.min(1.5, best(a, e) / e.max.hp), def = Math.min(1.5, best(e, a) / a.max.hp), first = B.effStat.spd(a) > B.effStat.spd(e);
    return acc + off * (first ? 1.15 : 1) - def * (first ? .9 : 1.1);
  }, 0) / Math.max(1, E.length));
}
