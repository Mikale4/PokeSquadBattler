
// =====================================================================
//  POKÉMON, MOVES, ABILITIES AND HELD ITEMS
//  A Pokémon knows one move per slot: S1 is free to use every turn, S2 and S3 have cooldowns.
//  Each move has its slot (MOVES[k].s): light attacks S1, mid-power attacks and status moves S2, big attacks S3. Moves are
//  learned as in FireRed/LeafGreen: by level (a new one asks to replace the move in its slot), from TMs and HMs, and again
//  at the Move Reminder. Skills keep the move's real type, category, power, accuracy and added effects (MOVES in a3a_dex.js).
// =====================================================================
const CAT_N = { P: "Physical", S: "Special", X: "Status" };
const CD = { 1: 0, 2: 3, 3: 4 };
const SPREAD = .75; // moves that hit every opposing Pokémon deal 75% damage when they hit two or more, as in Double Battles
function moveTarget(M) {
  if (M.tg === "foes") return "aoe_enemies";
  if (M.tg === "self") return "self";
  if (M.tg === "team") return "team";
  if (M.tg === "ally") return "ally_single";
  if (M.tg === "partners") return "partners";   // (Heal Pulse: every partner on the field)
  if (M.tg === "field") return M.sp === "haze" ? "field" : "team";
  return "enemy";
}
// how a move looks in battle: contact moves run in, the rest fly across (or burst over every target)
function moveAnim(M, target) {
  if (M.c === "X") return target === "enemy" || target === "aoe_enemies" ? "status" : /recover|softboiled|rest/.test(M.sp || "") || M.hl ? "heal" : "buff";
  if (M.sp === "selfdestruct" || M.sp === "explosion") return "boom";
  if (target === "aoe_enemies") return M.ct ? "spin" : ["Rock", "Grass", "Normal", "Bug"].includes(M.t) ? "volley" : "nova";
  return M.ct ? "melee" : "shoot";
}
// the power a move shows: Magnitude's range, "varies" where the battle decides it (Gyro Ball, Flail, Low Kick...); the number in
// MOVES[k].p stays what the AI and the optimizer count on (Magnitude's 70 is about its average roll)
const POW_RANGE = { magnitude: "10–150", eruption: "10–150", waterspout: "10–150", dragonenergy: "10–150", crushgrip: "10–150", wringout: "10–150", hardpress: "10–150",
  weight: "10–150", heavy: "10–150", gyroball: "10–150", electroball: "10–150" };   // (Low Kick, Grass Knot, Heat Crash, Heavy Slam, Gyro Ball, Electro Ball: the owner's rule, 2026-10-15)
function powText(k) {
  const M = MOVES[k]; if (!M || M.c === "X" || !M.p) return "";
  return POW_RANGE[M.sp] || (M.sp === "weight" || VAR_P[M.sp] ? "varies" : String(M.p));
}
function makeSkill(key, slot) {
  const M = MOVES[key], target = moveTarget(M);
  const sk = { slot, key, name: M.n, type: M.t, cat: M.c, pow: M.p, acc: M.a, cd: CD[slot], target, M, anim: moveAnim(M, target) };
  if (M.c === "X" && slot === 1) sk.cd = 0;
  if (VAR_P[M.sp]) { sk.pow = M.sp === "ragefist" || M.sp === "storedpower" ? M.p + 50 : VAR_P[M.sp]; sk.vary = 1; }   // (Rage Fist and the moves like it: one hit taken, the usual; Stored Power and Power Trip: one raised stage)   // Gyro Ball, Flail, Heavy Slam...: power that depends on the battle
  if (POW_RANGE[M.sp]) { sk.vary = 1; sk.range = POW_RANGE[M.sp]; }   // Magnitude: 10 to 150 a use (its average counts)
  if (M.hit) sk.hits = M.hit;
  sk.mk = masteryKind(sk);
  sk.desc = moveDesc(sk);
  return sk;
}
// What each Mastery rank (+6%) improves: damage (attacks, and Metronome's pick), healing, accuracy (status moves
// that can miss), or else turn meter given back after use (status moves that never miss)
function masteryKind(sk) {
  const M = sk.M;
  if (M.c !== "X" || M.sp === "metronome") return "dmg";
  if (M.hl || M.sp === "recover" || M.sp === "softboiled") return "heal";
  if (M.a && M.a < 100 && sk.target !== "self" && sk.target !== "team") return "acc";
  return "tm";
}
const MASTERY_TXT = { acc: "Mastery: +6% accuracy per rank", tm: "Mastery: the user gets 6% turn meter back per rank" };
// ---------- generated move text ----------
const P = v => Math.round(v * 100) + "%";
const statList = st => st.map(([s, n]) => `${STAGE_N[s]} ${n > 0 ? "+" : ""}${n}`).join(", ");
// the shields beyond Protect and Detect: what they stop, and what a contact move they stop costs its user
const SHIELD_TXT = {
  ragepowder: "Draws the other side's single-target moves to the user for as long as it stays on the field (with two up on one side, the newest draws them). It goes up by itself the moment its user comes onto the field with a partner beside it, if it's ready (that isn't the user's turn: the move just goes on cooldown). Grass types, Overcoat and Safety Goggles pay it no mind",
  kingsshield: "Protects the user from damaging moves until its next turn (status moves get through); a contact move it stops lowers the attacker's Attack by 2",
  spikyshield: "Protects the user from moves from the other side until its next turn; a contact move it stops costs the attacker 1/8 of its max HP",
  banefulbunker: "Protects the user from moves from the other side until its next turn; a contact move it stops poisons the attacker",
  obstruct: "Protects the user from damaging moves until its next turn (status moves get through); a contact move it stops lowers the attacker's Defense by 2",
  silktrap: "Protects the user from damaging moves until its next turn (status moves get through); a contact move it stops lowers the attacker's Speed by 1",
  burningbulwark: "Protects the user from damaging moves until its next turn (status moves get through); a contact move it stops burns the attacker",
  // (and the terrain moves whose effect is their own)
  risingvoltage: "Double power against a target on the ground in Electric Terrain",
  terrainpulse: "In a terrain, with the user on the ground: the terrain's type (Electric, Grass, Fairy or Psychic) and double power",
  steelroller: "Ends the terrain when it hits (it works without one too: the owner's rule)",
  floralhealing: "Restores half the target's max HP, two thirds in Grassy Terrain",
  doubleshock: "The user loses its Electric type (without it, the move still works: the owner's rule)",
  dragonenergy: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)",
  outrage: "The user becomes confused after it (no lock here)", thrash: "The user becomes confused after it (no lock here)",
  petaldance: "The user becomes confused after it (no lock here)", ragingfury: "The user becomes confused after it (no lock here)",
  moongeistbeam: "Ignores the target's Ability", sunsteelstrike: "Ignores the target's Ability",
  photongeyser: "Ignores the target's Ability; physical when the user's Attack is higher than its Sp. Atk",
};
// the field moves that go up by themselves as their user comes onto the field (the owner's rule, like Trick Room: autoField in a7_engine.js)
const ENTRY_MOVES = new Set(["sunnyday", "raindance", "sandstorm", "hail", "snowscape", "terrain", "stealthrock", "spikes", "toxicspikes", "stickyweb",
  "reflect", "lightscreen", "auroraveil", "safeguard", "mist", "luckychant", "gravity", "wonderroom", "magicroom", "iondeluge", "powder",
  "future", "laserfocus", "lockon"]);   // (Ion Deluge and Powder: the owner's rules, 2026-10-19; Future Sight and Doom Desire, 2026-10-20; Laser Focus and Lock-On, 2026-10-21)
const entryTxt = sp => sp === "future" ? "It's used by itself the moment its user comes onto the field, if it's ready and none of the user's attacks is already on the way (that isn't the user's turn: the move just goes on cooldown); it can still be used by hand" :
  sp === "laserfocus" || sp === "lockon" ? "It's used by itself the moment its user comes onto the field, if it's ready (that isn't the user's turn: the move just goes on cooldown), and lasts until the end of the user's next turn; it can still be used by hand" : `It goes up by itself the moment its user comes onto the field${["stealthrock", "spikes", "toxicspikes", "stickyweb"].includes(sp) ? " (with a Pokémon left on the other side's bench to hit)" : sp === "auroraveil" ? " in hail or snow" : sp === "powder" ? " (on the opposing Pokémon there that aren't covered yet)" : ""}, if it's ready (that isn't the user's turn: the move just goes on cooldown). `
  + `While ${["stealthrock", "spikes", "toxicspikes", "stickyweb"].includes(sp) ? "every layer is" : "it's"} already up the move stays ready${["sunnyday", "raindance", "sandstorm", "hail", "snowscape", "terrain"].includes(sp) ? ", and it replaces any other " + (sp === "terrain" ? "terrain" : "weather") + ", whoever set it" : ""}; it can still be used by hand`;
function moveDesc(sk) {
  const M = sk.M, out = [], who = sk.target === "aoe_enemies" ? "each target" : "the target";
  const fixed = { dragonrage: "Deals 40 damage", sonicboom: "Deals 20 damage", nightshade: "Deals damage equal to the user's level", seismictoss: "Deals damage equal to the user's level",
    psywave: "Deals random damage between half and 1.5× the user's level (Loaded Dice: always 1.5×)", superfang: "Takes half the target's current HP", endeavor: "Cuts the target's HP down to the user's" }[M.sp];
  if (fixed) out.push(fixed + " (+6% per Mastery rank)");
  if (M.crash) out.push("If it misses, the user crashes and loses a quarter of its max HP");
  if (sk.target === "aoe_enemies" && M.p) out.push(`Hits every opposing Pokémon (${P(SPREAD)} damage each when it hits two or more)`);
  if (M.hit && M.sp !== "tripleaxel") out.push(M.hit[0] === M.hit[1] ? `Strikes ${M.hit[0]} times` : `Strikes ${M.hit[0]} to ${M.hit[1]} times`);
  if (M.pri > 0) out.push(`Priority +${M.pri}: the user gets +${M.pri * 10}% turn meter when it's sent out (each priority move it knows adds its own)`);
  if (M.n === "Thunder" || M.n === "Hurricane") out.push("Never misses in rain; 50% accuracy in harsh sunlight");
  if (M.n === "Blizzard") out.push("Never misses in hail or snow");
  if (["firepledge", "grasspledge", "waterpledge"].includes(sk.key)) out.push("After a different Pledge from a teammate in the same round: a combined 150-power move, with a sea of fire (Fire + Grass), a swamp (Grass + Water) or a rainbow (Water + Fire) for 4 rounds");
  if (M.cr) out.push("High critical-hit ratio");
  if (M.ail && M.c !== "X") out.push(`${M.ac}% chance to ${{ PAR: "paralyze", BRN: "burn", FRZ: "freeze", PSN: "poison", TOX: "badly poison", SLP: "put to sleep", CNF: "confuse", TRAP: "bind", INFAT: "infatuate", DISABLE: "disable (no S2 or S3 for 2 turns)" }[M.ail]} ${who}`);
  if (M.ail && M.c === "X") {
    const obj = sk.target === "aoe_enemies" ? "every opposing Pokémon" : "the target";
    out.push((M.ail === "SLP" ? `Puts ${obj} to sleep` : { PAR: "Paralyzes", BRN: "Burns", FRZ: "Freezes", PSN: "Poisons", TOX: "Badly poisons", CNF: "Confuses", INFAT: "Infatuates", DISABLE: "Disables (no S2 or S3 for 2 turns)", SEED: "Plants a Leech Seed on", TRAP: "Binds" }[M.ail] + " " + obj) + (M.ac < 100 && M.ac ? ` (${M.ac}%)` : ""));
  }
  if (M.fl) out.push(`${M.fl}% chance to make ${who} flinch (it loses its next turn)`);
  if (M.st) {
    const t = M.sw === "self" ? (sk.target === "team" ? "your team's" : "the user's") : M.sw === "foes" ? "every opposing Pokémon's" : "the target's";
    out.push(`${M.sc < 100 ? M.sc + "% chance: " : ""}${t} ${statList(M.st)}${M.pre ? " before it strikes" : ""}`);
  }
  if (M.dr > 0) out.push(`The user recovers ${M.dr}% of the damage dealt`);
  if (M.dr < 0) out.push(`The user takes ${-M.dr}% of the damage dealt as recoil`);
  if (M.hl && sk.target !== "partners" && sk.target !== "team") out.push(`Restores ${M.hl}% of the user's max HP (+6% per Mastery rank)`);
  const sp = { transform: "Transforms into the target: copies its types, stats, stat changes and moves. The copy has an HP bar of its own, as big as the user's max HP: when it's knocked out, the user turns back into itself with the HP and status it had (the stat changes stay)", metronome: "Uses a random damaging move",
    splash: "But nothing happens!", haze: "Resets the stat changes of every Pokémon in battle", rest: "Fully restores HP and cures status, then sleeps through its next turn (fails at full HP)",
    reflect: "Reflect: your team takes a third less physical damage for 5 turns", lightscreen: "Light Screen: your team takes a third less special damage for 5 turns",
    substitute: "Uses 1/4 of the user's max HP to make a Substitute that takes hits for it", mist: "Mist: your team's stats can't be lowered for 5 turns",
    focusenergy: "Focus Energy: the user's critical-hit ratio rises sharply",
    payday: "Coins scatter: extra Poké Dollars after a win",
    explosion: "The user faints", selfdestruct: "The user faints", roar: "Scares the target off: its turn meter and stat changes reset",
    whirlwind: "Blows the target away: a random Pokémon from its bench comes in (a boss or a wild Pokémon loses its turn meter and stat changes instead)", fissure: "One-hit KO if it lands (30%). Fails against bosses",
    horndrill: "One-hit KO if it lands (30%). Fails against bosses", guillotine: "One-hit KO if it lands (30%). Fails against bosses", toxic: "",
    sheercold: "One-hit KO if it lands (30%). Fails against bosses",
    recover: "", softboiled: "", leechseed: "", disable: "",
    protect: "Protects the user: moves from the other side fail until its next turn", detect: "Protects the user: moves from the other side fail until its next turn",
    endure: "The user holds on with 1 HP until its next turn", safeguard: "Safeguard: your team can't be given a status condition or confused for 5 turns",
    raindance: "Makes it rain for about five rounds: Water moves +50%, Fire moves −50%", sunnyday: "Makes the sunlight harsh for about five rounds: Fire moves +50%, Water moves −50%",
    sandstorm: "Whips up a sandstorm for about five rounds: hurts all but Rock, Ground and Steel types, and gives all three Sp. Def +1", hail: "Hail and snow (one weather) for about five rounds: all but Ice types lose 1/16 of their max HP each turn, and Ice types' Defense +1",
    bellydrum: "The user loses half its max HP and maxes out its Attack", psychup: "Copies the target's stat changes", refresh: "Cures the user's burn, poison or paralysis",
    aromatherapy: "Cures the status conditions of your whole team, bench included", facade: "Double power while the user is burned, poisoned or paralyzed",
    focuspunch: "Never loses focus here (the owner's rule), but only 70% accuracy", revenge: "Double power if the user was hit since its last turn",
    knockoff: "50% stronger against a target holding an item, which it knocks off for the rest of the battle",
    rapidspin: "Frees the user from Bind and Leech Seed", falseswipe: "Always leaves the target with at least 1 HP",
    struggle: "Used when nothing else can be: the user takes 25% of the damage as recoil",
    weight: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)", heavy: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)",
    gyroball: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)", electroball: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)",
    flail: "The less HP the user has left, the stronger (20 to 200 power)", wringout: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)",
    hardpress: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)", hex: "Double power against a target with a status condition",
    venoshock: "Double power against a poisoned target", brine: "Double power against a target at half HP or less", acrobatics: "Double power if the user holds no item",
    wakeupslap: "Double power against a sleeping target, and wakes it up", assurance: "Double power if the target was already hit since the user's last turn",
    tantrum: "Double power if the user's last move failed",
    retaliate: "Double power if a teammate fainted since the user's last turn", lashout: "Double power if the user's stats were lowered since its last turn",
    weatherball: "In weather it becomes that weather's type (Fire, Water, Rock or Ice) and doubles in power", ragefist: `${M.p} power, plus 50 for every hit the user has taken (up to 250)`, storedpower: `${M.p} power, plus 50 for every raised stage on the user's stat badge, accuracy and evasion too (up to 250)`,
    foulplay: "Uses the target's Attack instead of the user's", bodypress: "Uses the user's Defense instead of its Attack",
    psyshock: "Hits the target's Defense instead of its Sp. Def", chipaway: "Ignores the target's stat changes", alwayscrit: "Always lands a critical hit",
    feint: "Hits through Protect and Detect", thief: "Steals the target's held item if the user holds none", pluck: "Eats the target's Berry, if it holds one",
    incinerate: "Burns up the target's Berry", uturn: "The user switches out after attacking", dragontail: "Drags out a random Pokémon from the target's bench",
    finalgambit: "Deals damage equal to the user's HP, and the user faints", counter: "It can't be chosen: when an opposing physical move damages the user, it hits back at that attacker by itself for twice the damage once the attack is over, if it's ready (that isn't the user's turn: the move just goes on cooldown)",
    mirrorcoat: "It can't be chosen: when an opposing special move damages the user, it hits back at that attacker by itself for twice the damage once the attack is over, if it's ready (that isn't the user's turn: the move just goes on cooldown)", synchronoise: "Only hits a Pokémon that shares a type, its status condition, its Ability or its nature with the user",
    freezedry: "Super effective against Water types", steelbeam: "The user loses a quarter of its max HP, hit or miss (the owner's rule; Magic Guard keeps it)", burnup: "The user loses its Fire type (without it, the move still works: the owner's rule)",
    expandingforce: "In Psychic Terrain, with the user on the ground: 50% stronger and hits every foe", grassyglide: "A +1 priority move (in Grassy Terrain): the user gets +10% turn meter when it's sent out", burningjealousy: "Burns a target with any stat at +2 or higher (as its stat badge shows: boosts from moves, items, Abilities and the field)",
    poltergeist: "", clearsmog: "Resets the target's stat changes", fakeout: "Works on any turn, not just the user's first on the field",
    mistyexplosion: "The user faints; 50% stronger in Misty Terrain", tripleaxel: `Strikes three times, at ${M.p}, ${M.p * 2} and ${M.p * 3} power; each strike can miss`,
    eruption: "Random power from 10 to 150, like Magnitude (Loaded Dice: always 150)", metalburst: "It can't be chosen: when an opposing attack damages the user, it hits back at that attacker by itself for 1.5 times the damage once the attack is over, if it's ready (that isn't the user's turn: the move just goes on cooldown)",
    present: "A gift of 40 (40%), 80 (30%) or 120 power (10%), or it restores 1/4 of the target's max HP (20%); physical when the user's Attack is higher than its Sp. Atk, special otherwise; with Loaded Dice, always the 120-power gift, and it never misses",
    fusion: "Double power if the other Fusion move (Fusion Flare or Fusion Bolt) was used since the user's last turn",
    smellingsalts: "Double power against a paralyzed target, and cures its paralysis", healblock: "The other side can't restore HP for 5 turns",
    strengthsap: "Restores HP equal to the target's Attack stat, then lowers its Attack", partingshot: "Lowers the target's Attack and Sp. Atk, then the user switches out",
    hiddenpower: "Takes the type of the last attack used on the user (its own first type until then), and it's physical when the user's Attack is higher than its Sp. Atk (a house rule)", sketch: "Copies the move the opposing Pokémon has in this Sketch's slot (S1 Sketch its S1 move, S2 Sketch its S2, S3 Sketch its S3) and uses it at once. The copied move takes Sketch's place for good, in every battle; the Move Reminder teaches Sketch again",
    hazardhit: M.n === "Stone Axe" ? "Leaves pointed stones around the other side (Stealth Rock)" : "Leaves a layer of spikes around the other side (Spikes)",
    collision: "×1.5555 when it's super effective (the owner's rule)", direclaw: "May poison, paralyze or put the target to sleep (50%)",
    glaiverush: "", hydrosteam: "In harsh sunlight it's 50% stronger instead of weaker",
    ivycudgel: "Takes the type of Ogerpon's mask (Water, Fire or Rock; Grass with the Teal Mask)", lastrespects: "50 power, plus 50 for each fainted teammate (up to 300)",
    psyblade: "50% stronger in Electric Terrain", saltcure: "The target loses 1/8 of its max HP every turn (1/4 for Water and Steel types)",
    fickle: "Double power half the time (the owner's rule)",
    shelltrap: "It can't be chosen: when an opposing attack damages the user, it strikes back with this by itself once that attack is over, if it's ready (that isn't the user's turn: the move just goes on cooldown)",
    spectralthief: "Steals the target's stat rises before it hits (ones fixed to an item, an Ability or the field stay)",
    thousandarrows: "Hits Pokémon off the ground too (Flying types, Levitate...) for ×1, and knocks them down: Ground moves hit them for as long as they stay out",
    anchor: "Each Pokémon it hits loses all its turn meter, like Arena Trap (Run Away keeps it)",
    boltbeak: "Double power when the user's Speed is raised (+1 or more)",
    coreenforcer: "Ignores the targets' Abilities, and suppresses the Ability of each one that has moved since the user's last turn",
    flyingpress: "Fighting and Flying at once against the target's types; double power, and it never misses, when the target's evasiveness is raised", filletaway: "The user loses half its max HP; its Attack, Sp. Atk and Speed rise by 2",
    shedtail: "The user loses half its max HP and switches out, leaving a Substitute for the Pokémon that comes in",
    multiattack: "Takes the type of Silvally's Memory",
    stickyweb: "A sticky web around the other side lowers the Speed of each grounded Pokémon sent in",
    afteryou: "A partner on the field gets a full turn meter: it moves next", allyswitch: "Until the user's next turn, single-target attacks aimed at it or a partner hit the other one",
    assist: "Uses a random move of a teammate's (the bench too)", bestow: "Gives the user's held item to a target that holds none",
    conversion2: "It can't be chosen: just before an opposing attack's damage, the user becomes a type the attack doesn't affect, or else one that resists it, if this is ready (that isn't the user's turn: the move just goes on cooldown; the type lasts until it leaves the field)", courtchange: "Swaps the two sides' hazards, screens, Safeguard, Mist and Tailwind",
    craftyshield: "Until the user's next turn, the other side's status moves fail against the user's team", doodle: "The user and its partners take the target's Ability",
    electrify: "The target's next move becomes Electric type", embargo: "The target can't use its held item for 5 turns",
    encore: "For 2 turns the target can only use its last move (on a turn that move isn't ready, it uses Struggle)", entrainment: "The target's Ability becomes the user's",
    fairylock: "For a round nobody can switch out", foresight: "The target's evasiveness is ignored, and Normal and Fighting moves hit it if it's a Ghost type",
    miracleeye: "The target's evasiveness is ignored, and Psychic moves hit it if it's a Dark type", addtype: M.n === "Forest's Curse" ? "Adds the Grass type to the target's types" : "Adds the Ghost type to the target's types",
    gravity: "For 5 rounds everything is grounded (Ground moves hit Flying types and Levitate), every Pokémon's accuracy +2, and Fly, Bounce and the jumping moves can't be used",
    grudge: "If the user faints from an attack before its next turn, the attacker can't use that move again this battle",
    guardsplit: "Averages the user's and the target's Defense and Sp. Def", powersplit: "Averages the user's and the target's Attack and Sp. Atk",
    heartswap: "Swaps every stat change with the target", imprison: "The other side can't use any move the user knows",
    instruct: "A partner uses its last move again at once", iondeluge: "For 5 rounds Normal-type moves become Electric type, on both sides",
    magiccoat: "It can't be chosen: when an opposing Pokémon uses a status move on the user (a status condition or a stat drop), it bounces the move back by itself, and any other until the user's next turn, if it's ready (that isn't the user's turn: the move just goes on cooldown)", magicroom: "For 5 rounds held items have no effect (using it again ends it)",
    wonderroom: "For 5 rounds every Pokémon's Defense and Sp. Def swap (using it again ends it)", mimic: "Copies the target's last move into Mimic's place for the rest of the battle",
    mudsport: "For 5 rounds Electric-type moves are a third as strong", watersport: "For 5 rounds Fire-type moves are a third as strong",
    nightmare: "A sleeping target loses 1/4 of its max HP every turn while it sleeps", octolock: "The target can't switch out, and its Defense and Sp. Def fall by 1 every turn",
    perishsong: "The user and its target each faint after 3 of their own turns, unless they switch out", powder: "Covers every opposing Pokémon on the field in powder, until it uses a Fire-type move: that move fails, and the explosion costs it and each of its partners on the field 1/4 of their max HP",
    powertrick: "Swaps the user's Attack and Defense", psychoshift: "Passes the user's status condition to the target",
    purify: "Cures a partner's status condition, and the user gets back half its max HP if it does", quash: "The target's turn meter drops to 0",
    recycle: "The user gets back the held item it used up", revivalblessing: "Revives a fainted teammate with half its max HP",
    simplebeam: "The target's Ability becomes Simple", snatch: "It can't be chosen: when an opposing Pokémon uses a move that raises its own (or its team's) stats or heals it, the user takes the boost or the healing instead, by itself, if it's ready (that isn't the user's turn: the move just goes on cooldown; the other Pokémon's move is still used, for nothing)",
    spite: "The target can't use its last move for its next 2 turns", spotlight: "The other side's single-target attacks go to the partner it lights up, for as long as that partner stays on the field (the newest redirect draws them). It goes up by itself the moment its user comes onto the field, on the partner best able to take the hits, if it's ready (that isn't the user's turn: the move just goes on cooldown)",
    stockpile: "Defense and Sp. Def +1 and one Stockpile (up to 3)", swallow: "Restores 1/4, 1/2 or all of its max HP by its Stockpiles (1, 2, 3), then uses them up",
    spitup: "100 power for each Stockpile (up to 300), then uses them up", telekinesis: "For 3 turns every move hits the target, and Ground moves don't",
    topsyturvy: "Turns the target's stat changes the other way", torment: "The target can't use the same move twice in a row",
    teatime: "Every Pokémon on the field eats its Berry", matblock: "Until the user's next turn, the other side's attacks fail against the user's team",
    quickguard: "Until the user's next turn, priority moves fail against the user's team", wideguard: "Until the user's next turn, spread moves fail against the user's team",
    mefirst: "Uses the target's strongest ready attack against it, 50% stronger",
    belch: "Only works once the user has eaten a Berry this battle (a Poison-type user needs no Berry)", naturalgift: "Its type and power come from the user's Berry, which it uses up",
    fling: "Throws the user's held item (its power and effect depend on the item)", lastresort: "While the user is under Encore or Disable: double power (140), no cooldown, and usable despite them",
    trumpcard: "40, 50, 60, 80, then 200 power with each use in a battle", bide: "It can't be chosen: the user starts storing energy by itself the moment it comes onto the field, if it's ready. The moment the second opposing attack since its last turn is over, it strikes the last attacker for twice the damage those two did (that isn't the user's turn: the move just goes on cooldown). Once each time it comes in",
    skydrop: "Lifts the target into the sky (it can't move or be reached) and drops it on the user's next turn. Fails on a target of 200 kg or more",
    future: "Strikes every Pokémon the other side has on the field 2 rounds later", terablast: "Physical when the user's Attack is higher than its Sp. Atk (no Terastallizing here)",
    upperhand: "When it's ready, it also strikes by itself first at an opposing Pokémon using a priority move, which flinches and loses that move (like Pursuit, it isn't the user's turn). Chosen like any move, its flinch costs the target its next turn",
    teleport: "The user switches out (last)", batonpass: "The user switches out, passing on its stat changes", spikes: "Spikes on the other side hurt each Pokémon sent in (up to 3 layers)",
    toxicspikes: "Poisons each Pokémon sent in on the other side (2 layers: badly)", stealthrock: "Pointed stones hurt each Pokémon sent in on the other side, more for Rock weaknesses",
    defog: "Clears hazards, the target's screens and the terrain, and lowers the target's evasiveness", roost: "Restores half of the user's max HP",
    synthesis: "Restores half the user's max HP (2/3 in harsh sunlight, 1/4 in other weather)", wish: "Half of the user's max HP comes back to its place at the end of its next turn",
    aquaring: "Restores 1/16 of the user's max HP every turn", ingrain: "Restores 1/16 of the user's max HP every turn, but it can't be switched out; nothing can drag it out, and it's on the ground",
    lifedew: "Restores 1/4 of the max HP of the user and its teammates on the field", healpulse: "Restores half of the max HP of each of the user's partners on the field",
    painsplit: "Shares out the user's and the target's HP evenly", healingwish: "The user faints; the next Pokémon sent in is fully healed",
    memento: "The user faints; the target's Attack and Sp. Atk −2", tailwind: "Your team's Speed +2 for about 4 rounds, and +10% turn meter at once for the user and its partners on the field",
    auroraveil: "In hail or snow: your team takes a third less damage for 5 turns", luckychant: "Your team can't take critical hits for 5 turns",
    trickroom: "For about five rounds the slowest Pokémon move first. It sets itself up the moment its user comes onto the field, if it's ready (that isn't the user's turn: the move just goes on cooldown); it can still be used by hand, and while a Trick Room is up it ends it (automatic or not)", terrain: sk.key === "mistyterrain" ? "Sets Misty Terrain for about five rounds: Pokémon on the ground can't get a status condition or confusion, and it cures the ones they already have (a house rule); Dragon moves against them do half damage" : "Sets the terrain for about five rounds", snowscape: "Hail and snow (one weather) for about five rounds: all but Ice types lose 1/16 of their max HP each turn, and Ice types' Defense +1",
    yawn: "Makes the target drowsy: it falls asleep at the end of its next turn", curse: "Ghost types: lose half their HP to curse the target (1/4 HP every turn); others: Attack and Defense +1, Speed −1",
    taunt: "The target can only use damaging moves for 3 turns", gastroacid: "Suppresses the target's Ability", worryseed: "Changes the target's Ability to Insomnia",
    soak: "Makes the target pure Water type", reflecttype: "The user takes on the target's types", conversion: "It can't be chosen: just before an opposing attack's damage, the user becomes a type that resists it, if this is ready (that isn't the user's turn: the move just goes on cooldown; the type lasts until it leaves the field)",
    camouflage: "The user takes the terrain's type (Electric, Grass, Fairy or Psychic), or becomes Normal type with none", magnetrise: "The user floats: Ground moves can't hit it for 5 turns", meanlook: "The target can't be switched out",
    destinybond: "If a move knocks the user out before its next turn, the attacker faints too", lockon: "The user's next attack can't miss, until the end of its next turn",
    laserfocus: "The user's next attack is a critical hit, until the end of its next turn", acupressure: "A random stat of the user's +2", powerswap: "Swaps Attack and Sp. Atk changes with the target",
    guardswap: "Swaps Defense and Sp. Def changes with the target", speedswap: "Swaps Speed stats with the target", roleplay: "Copies the target's Ability",
    skillswap: "Swaps Abilities with the target", trick: "Swaps held items with the target", helpinghand: "A teammate's next move is 50% stronger",
    followme: "Draws the other side's single-target moves to the user for as long as it stays on the field (with two up on one side, the newest draws them). It goes up by itself the moment its user comes onto the field with a partner beside it, if it's ready (that isn't the user's turn: the move just goes on cooldown)", mirrormove: "Uses the move the opposing target has in this Mirror Move's slot, at once and with the user's own stats, this one time: the Mirror Move stays (S1, S2 and S3 Mirror Move; a house rule)",
    copycat: "Uses the move the opposing target has in this Copycat's slot, at once and with the user's own stats, this one time: the Copycat stays (S1, S2 and S3 Copycat; a house rule)", sleeptalk: "While asleep, uses one of the user's other moves at random", naturepower: "Becomes Thunderbolt in Electric Terrain, Energy Ball in Grassy, Moonblast in Misty, Psychic in Psychic Terrain, Tri Attack with none",
    venomdrench: "Lowers a poisoned target's Attack, Sp. Atk and Speed", rototiller: "Raises the Attack and Sp. Atk of Grass types on the field",
    magneticflux: "Raises the Defense and Sp. Def of your Electric-type teammates", flowershield: "Raises the Defense of Grass types on the field",
    dragoncheer: "Your teammates get pumped (Dragon types more)", brickbreak: "Shatters Reflect, Light Screen and Aurora Veil first",
    solar: "×1.5 in harsh sunlight, ×0.5 in rain, sandstorm, hail or snow",
    semi: `The user goes out of reach (only a few moves can hit it) and the move lands on its next turn${M.n === "Phantom Force" || M.n === "Shadow Force" ? "; it breaks through Protect" : ""}`,
    ramp: "Doubles in power every time the user uses it in a battle, other moves in between or not (up to 16×)",
    uproar: "Nobody on the field can fall asleep for three turns (using it again while that lasts doesn't stretch it)", pursuit: "When the other side switches a Pokémon out or uses U-turn, Volt Switch, Flip Turn, Teleport or Baton Pass, the user strikes it first by itself, at double power (outside its own turn; then Pursuit goes on cooldown)",
    magnitude: "Random power from 10 to 150 (Loaded Dice: always 150)",
    fellstinger: "If it knocks the target out, the user's Attack +3", icespinner: "Ends the terrain", flameburst: "The bursting flame hits the target's partners for 1/16 of their max HP",
    smackdown: "Knocks the target down for as long as it stays in: Ground moves hit it (Flying types too), and it falls out of Fly or Bounce",
    snore: "Only works while the user is asleep, and then it snores by itself", charge: "The user's next Electric move has double power",
    defensecurl: "Rollout is twice as strong for as long as the user stays in", minimize: "Stomp, Body Slam, Dragon Rush, Heavy Slam, Heat Crash and Steamroller hit it twice as hard and never miss it",
    growth: "+2 to each in harsh sunlight", pollenpuff: "Also restores half the max HP of each of the user's partners on the field", triattack: "20% chance to burn, paralyze or freeze the target",
    throatchop: "The target can't use sound moves for 2 turns", psychicnoise: "The target can't restore HP or use healing moves for 2 turns",
    secretpower: "30% chance of an extra effect from the field: Electric Terrain paralyzes, Grassy Terrain puts to sleep, Misty Terrain Sp. Atk −1, Psychic Terrain Speed −1; harsh sunlight burns, rain Attack −1, sandstorm accuracy −1, hail or snow freezes (both, with weather and terrain up; paralysis on a plain field)" }[M.sp];
  if (SHIELD_TXT[sk.key]) out.push(SHIELD_TXT[sk.key]); else if (sp) out.push(sp);
  if (ENTRY_MOVES.has(M.sp)) out.push(entryTxt(M.sp));
  if (!out.length && M.c !== "X") out.push("A plain attack");
  if (MASTERY_TXT[sk.mk]) out.push(MASTERY_TXT[sk.mk]);
  return out.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(". ") + ".";
}

// ---------- Abilities ----------
const ABILITY = {
  overgrow: ["Overgrow", "Grass-type moves are 50% stronger while its HP is below 1/3.", { id: "PINCH", type: "Grass" }],
  blaze: ["Blaze", "Fire-type moves are 50% stronger while its HP is below 1/3.", { id: "PINCH", type: "Fire" }],
  torrent: ["Torrent", "Water-type moves are 50% stronger while its HP is below 1/3.", { id: "PINCH", type: "Water" }],
  swarm: ["Swarm", "Bug-type moves are 50% stronger while its HP is below 1/3.", { id: "PINCH", type: "Bug" }],
  static: ["Static", "Pokémon that make contact with it may be paralyzed (30%).", { id: "CONTACT", what: "PAR", chance: .3 }],
  "poison-point": ["Poison Point", "Pokémon that make contact with it may be poisoned (30%).", { id: "CONTACT", what: "PSN", chance: .3 }],
  "flame-body": ["Flame Body", "Pokémon that make contact with it may be burned (30%).", { id: "CONTACT", what: "BRN", chance: .3 }],
  "effect-spore": ["Effect Spore", "Pokémon that make contact with it may be poisoned, paralyzed or put to sleep (30%; not Grass types, Overcoat or Safety Goggles).", { id: "CONTACT", what: "SPORE", chance: .3 }],
  "cute-charm": ["Cute Charm", "Pokémon that make contact with it may fall in love with it (30%).", { id: "CONTACT", what: "INFAT", chance: .3 }],
  "poison-touch": ["Poison Touch", "Its contact moves may poison the target (30%).", { id: "TOUCH" }],
  stench: ["Stench", "Its damaging moves may make the target flinch (10%, each strike of a multi-strike move).", { id: "STENCH" }],
  intimidate: ["Intimidate", "Lowers the Attack of every opposing Pokémon by 1 when the battle starts.", { id: "INTIMIDATE" }],
  levitate: ["Levitate", "It floats, so Ground-type moves can't hit it (a Ring Target's holder still does, for ×1).", { id: "IMMUNE_TYPE", type: "Ground" }],
  "water-absorb": ["Water Absorb", "Water-type moves heal it by 1/4 of its max HP instead of hurting it (a Ring Target's holder's heal it and hurt it, for ×1).", { id: "ABSORB", type: "Water" }],
  "volt-absorb": ["Volt Absorb", "Electric-type moves heal it by 1/4 of its max HP instead of hurting it (a Ring Target's holder's heal it and hurt it, for ×1).", { id: "ABSORB", type: "Electric" }],
  "dry-skin": ["Dry Skin", "Water-type moves heal it by 1/4 of its max HP instead of hurting it (a Ring Target's holder's heal it and hurt it, for ×1). It heals 1/8 of its max HP every turn in rain and loses 1/8 every turn in harsh sunlight, and Fire-type moves hurt it 25% more.", { id: "ABSORB", type: "Water", dry: 1 }],
  "flash-fire": ["Flash Fire", "Draws in every Fire-type attack aimed at its side, like Lightning Rod. Fire-type moves don't hurt it; they power up its own Fire-type moves by 50% instead (a Ring Target's holder's power it up and hurt it, for ×1).", { id: "FLASH_FIRE" }],
  "lightning-rod": ["Lightning Rod", "Draws in every Electric-type attack aimed at its side. Electric-type moves don't hurt it; they raise its Sp. Atk by 1 instead (a Ring Target's holder's still raise it, and hurt it for ×1).", { id: "ROD", type: "Electric" }],
  "thick-fat": ["Thick Fat", "Takes half damage from Fire- and Ice-type moves.", { id: "RESIST", types: ["Fire", "Ice"] }],
  insomnia: ["Insomnia", "It can't fall asleep.", { id: "NO_STATUS", list: ["SLP"] }],
  "vital-spirit": ["Vital Spirit", "It can't fall asleep.", { id: "NO_STATUS", list: ["SLP"] }],
  limber: ["Limber", "It can't be paralyzed.", { id: "NO_STATUS", list: ["PAR"] }],
  immunity: ["Immunity", "It can't be poisoned.", { id: "NO_STATUS", list: ["PSN", "TOX"] }],
  "own-tempo": ["Own Tempo", "It can't be confused, and Intimidate doesn't affect it.", { id: "NO_STATUS", list: ["CNF"], noIntim: 1 }],
  oblivious: ["Oblivious", "It can't be infatuated or taunted, and Intimidate doesn't affect it.", { id: "NO_STATUS", list: ["INFAT", "TAUNT"], noIntim: 1 }],
  "magma-armor": ["Magma Armor", "It can't be frozen.", { id: "NO_STATUS", list: ["FRZ"] }],
  "water-veil": ["Water Veil", "It can't be burned.", { id: "NO_STATUS", list: ["BRN"] }],
  "inner-focus": ["Inner Focus", "It never flinches, and Intimidate doesn't affect it.", { id: "INNER_FOCUS", noIntim: 1 }],
  "clear-body": ["Clear Body", "Other Pokémon can't lower its stats.", { id: "NO_DROP", stats: "all" }],
  "hyper-cutter": ["Hyper Cutter", "Other Pokémon can't lower its Attack.", { id: "NO_DROP", stats: "atk" }],
  "keen-eye": ["Keen Eye", "Its moves are 100% accurate, other Pokémon can't lower its accuracy, and its moves ignore evasiveness.", { id: "NO_DROP", stats: "acc", eva: 1, sure: 1 }],
  "big-pecks": ["Big Pecks", "Other Pokémon can't lower its Defense.", { id: "NO_DROP", stats: "def" }],
  sturdy: ["Sturdy", "At full HP it can't be knocked out by one hit: it holds on with 1 HP. One-hit KO moves don't affect it.", { id: "STURDY" }],
  "rock-head": ["Rock Head", "It takes no recoil damage.", { id: "ROCK_HEAD" }],
  "shed-skin": ["Shed Skin", "33% chance each turn to shed its status condition.", { id: "SHED", chance: .33 }],
  "natural-cure": ["Natural Cure", "30% chance each turn to shake off its status condition, and it's cured of it when it switches out.", { id: "SHED", chance: .3 }],
  hydration: ["Hydration", "Cures its status condition every turn while it rains.", { id: "SHED", chance: 1, w: "rain" }],
  guts: ["Guts", "Attack +1 while it has a status condition, and a burn doesn't lower its Attack.", { id: "GUTS" }],
  "compound-eyes": ["Compound Eyes", "Accuracy +1.", { id: "ACC", amount: 1.3 }],
  "shield-dust": ["Shield Dust", "Immune to the added effects of damaging moves.", { id: "SHIELD_DUST" }],
  "battle-armor": ["Battle Armor", "Critical hits can't land on it.", { id: "NO_CRIT" }],
  "shell-armor": ["Shell Armor", "Critical hits can't land on it.", { id: "NO_CRIT" }],
  "swift-swim": ["Swift Swim", "Speed +2 in rain.", { id: "WSPEED", w: "rain" }],
  chlorophyll: ["Chlorophyll", "Speed +2 in harsh sunlight.", { id: "WSPEED", w: "sun" }],
  "sand-rush": ["Sand Rush", "Speed +2 in a sandstorm, and the sandstorm doesn't hurt it.", { id: "WSPEED", w: "sand" }],
  "sand-veil": ["Sand Veil", "Evasiveness +1 in a sandstorm, and the sandstorm doesn't hurt it.", { id: "WEVA", w: "sand" }],
  "snow-cloak": ["Snow Cloak", "Evasiveness +1 in hail and snow, and it doesn't hurt it.", { id: "WEVA", w: "hail" }],
  "rain-dish": ["Rain Dish", "Heals 1/16 of its max HP every turn while it rains.", { id: "WHEAL", w: "rain" }],
  "ice-body": ["Ice Body", "Heals 1/16 of its max HP every turn in hail and snow, and it doesn't hurt it.", { id: "WHEAL", w: "hail" }],
  "solar-power": ["Solar Power", "In harsh sunlight Sp. Atk +1, but it loses 1/8 of its max HP every turn.", { id: "SOLAR" }],
  synchronize: ["Synchronize", "If it is burned, poisoned, badly poisoned or paralyzed, the Pokémon that did it gets the same condition.", { id: "SYNC" }],
  download: ["Download", "When it enters battle, raises its Attack and Sp. Atk by 1.", { id: "DOWNLOAD" }],
  pressure: ["Pressure", "Opposing Pokémon that use an S2 or S3 move wait 1 extra turn before they can use it again.", { id: "PRESSURE" }],
  damp: ["Damp", "No Pokémon in the battle can use Self-Destruct or Explosion, and Aftermath doesn't work.", { id: "DAMP" }],
  "liquid-ooze": ["Liquid Ooze", "Pokémon that drain its HP lose that HP instead.", { id: "OOZE" }],
  soundproof: ["Soundproof", "Sound-based moves don't affect it.", { id: "SOUNDPROOF" }],
  "early-bird": ["Early Bird", "Wakes up from sleep twice as fast.", { id: "EARLY_BIRD" }],
  pickup: ["Pickup", "Picks up extra Poké Dollars after each win.", { id: "PICKUP" }],
  technician: ["Technician", "Moves with 60 power or less are 50% stronger.", { id: "TECHNICIAN" }],
  "sheer-force": ["Sheer Force", "Moves with added effects deal 50% more damage, but the added effects don't happen.", { id: "SHEER_FORCE" }],
  hustle: ["Hustle", "Attack +1, but accuracy −1.", { id: "HUSTLE" }],
  "iron-fist": ["Iron Fist", "Punching moves are 50% stronger.", { id: "IRON_FIST" }],
  reckless: ["Reckless", "Moves with recoil or crash damage are 50% stronger.", { id: "RECKLESS" }],
  "no-guard": ["No Guard", "Moves used by it or against it always hit.", { id: "NO_GUARD" }],
  "skill-link": ["Skill Link", "Multi-strike moves always hit the maximum number of times.", { id: "SKILL_LINK" }],
  "serene-grace": ["Serene Grace", "The added effects of its moves are twice as likely to happen.", { id: "SERENE" }],
  adaptability: ["Adaptability", "Same-type moves get a ×2 boost instead of ×1.5.", { id: "ADAPT" }],
  "magic-guard": ["Magic Guard", "Only attacks hurt it: no damage from poison, burns, recoil, binding or Leech Seed.", { id: "MAGIC_GUARD" }],
  multiscale: ["Multiscale", "Takes half damage while its HP is full.", { id: "MULTISCALE" }],
  "marvel-scale": ["Marvel Scale", "Defense +1 while it has a status condition.", { id: "MARVEL" }],
  filter: ["Filter", "Super-effective hits deal 50% less damage to it.", { id: "FILTER", cut: .5 }],   // (the owner's rule)
  "tinted-lens": ["Tinted Lens", "Its not-very-effective hits deal double damage.", { id: "TINTED" }],
  sniper: ["Sniper", "Its critical hits deal ×2.25 damage instead of ×1.5, and if nothing has hurt it since its last turn, its damaging moves are critical hits.", { id: "SNIPER" }],   // (the owner's rule)
  "weak-armor": ["Weak Armor", "When a physical move hits it, its Defense falls by 1 and its Speed rises by 2.", { id: "WEAK_ARMOR" }],
  "anger-point": ["Anger Point", "Every hit it takes raises its Attack by 1, and a critical hit maxes out its Attack.", { id: "ANGER" }],
  defiant: ["Defiant", "When another Pokémon lowers its stats, its Attack rises by 2.", { id: "DEFIANT", stat: "atk" }],
  competitive: ["Competitive", "When another Pokémon lowers its stats, its Sp. Atk rises by 2.", { id: "DEFIANT", stat: "spa" }],
  steadfast: ["Steadfast", "Each time it flinches (losing its next turn), its Speed rises by 1.", { id: "STEADFAST" }],
  moxie: ["Moxie", "Knocking out a Pokémon raises its Attack by 1.", { id: "MOXIE" }],
  scrappy: ["Scrappy", "Its Normal- and Fighting-type moves can hit Ghost-type Pokémon, and Intimidate doesn't affect it.", { id: "SCRAPPY", noIntim: 1 }],
  infiltrator: ["Infiltrator", "Its moves pass through Reflect, Light Screen, Aurora Veil, Safeguard, Mist and Substitute.", { id: "INFILTRATOR" }],
  "cursed-body": ["Cursed Body", "When hit by a move, 30% chance to Disable the attacker.", { id: "CURSED" }],
  "friend-guard": ["Friend Guard", "While it is standing, its allies take 50% less damage.", { id: "FRIEND_GUARD" }],   // (the owner's rule)
  imposter: ["Imposter", "Transforms into an opposing Pokémon as soon as the battle starts. Like Transform, the copy has an HP bar of its own (as big as its max HP), and when it's knocked out it turns back into itself.", { id: "IMPOSTER" }],
  "arena-trap": ["Arena Trap", "When it enters battle, every opposing Pokémon's turn meter drops to 0. While it's in battle, grounded opposing Pokémon can't switch out and fill their turn meter 10% slower (Flying types, Levitate and Run Away escape).", { id: "ARENA_TRAP" }],
  rattled: ["Rattled", "Its Speed rises by 1 when a Bug-, Ghost- or Dark-type move hits it, or when it's intimidated.", { id: "RATTLED" }],
  unnerve: ["Unnerve", "Opposing Pokémon are too nervous to eat Berries.", { id: "UNNERVE" }],
  "run-away": ["Run Away", "Always ready to bolt: starts every battle with 25% turn meter, and nothing traps it (Arena Trap, Magnet Pull, Bind and the like, Mean Look, Block).", { id: "RUN_AWAY" }],
  // later generations' Abilities
  "cloud-nine": ["Cloud Nine", "When it comes onto the field, it ends the weather for good (an area's own weather too); while it's in battle, any weather set later has no effect.", { id: "CLOUD" }],
  aftermath: ["Aftermath", "If a contact move knocks it out, the attacker loses 1/4 of its max HP.", { id: "AFTERMATH" }],
  analytic: ["Analytic", "With its Speed down a stage or more, its moves are 50% stronger, and 50% more for each stage further down (×1.5 at -1, ×2 at -2 ... ×4 at -6).", { id: "ANALYTIC" }],
  anticipation: ["Anticipation", "The first time an attack from the other side is aimed at it, it protects itself (Protect, until its next turn). Once a battle.", { id: "ANTICIPATION" }],   // (the owner's rule, 2026-10-21)
  drought: ["Drought", "Turns the sunlight harsh for about five rounds when it enters battle.", { id: "DROUGHT" }],
  forewarn: ["Forewarn", "The first time an attack from the other side is aimed at it, it protects itself (Protect, until its next turn). Once a battle.", { id: "FOREWARN" }],   // (the owner's rule, 2026-10-21)
  frisk: ["Frisk", "When it comes onto the field, it knocks off a random opposing Pokémon's held item (Sticky Hold keeps it). Once a battle.", { id: "FRISK" }],   // (the owner's rule, 2026-10-21)
  gluttony: ["Gluttony", "It eats its HP Berry the moment it takes any damage.", { id: "GLUTTONY" }],
  harvest: ["Harvest", "50% chance each turn to grow back a Berry it has used (every turn in harsh sunlight).", { id: "HARVEST" }],
  healer: ["Healer", "30% chance each turn to cure a teammate on the field of its status condition.", { id: "HEALER" }],
  illuminate: ["Illuminate", "Its moves are 100% accurate, other Pokémon can't lower its accuracy, and its moves ignore evasiveness.", { id: "NO_DROP", stats: "acc", eva: 1, sure: 1 }],
  justified: ["Justified", "Being hit by a Dark-type move raises its Attack by 1.", { id: "JUSTIFIED" }],
  "leaf-guard": ["Leaf Guard", "In harsh sunlight it can't get a status condition, and Rest fails.", { id: "LEAF_GUARD" }],
  "magnet-pull": ["Magnet Pull", "When it enters battle, opposing Steel types' turn meters drop to 0. While it's in battle, opposing Steel types can't switch out and fill their turn meter 10% slower (on top of Arena Trap).", { id: "MAGNET_PULL" }],
  "mold-breaker": ["Mold Breaker", "Its moves ignore the target's Ability (Levitate, Sturdy, Water Absorb, Multiscale...).", { id: "MOLD" }],
  "neutralizing-gas": ["Neutralizing Gas", "While it's in battle, every other Pokémon's Ability has no effect.", { id: "NEUTRAL" }],
  overcoat: ["Overcoat", "Weather doesn't hurt it, and powder moves and Effect Spore don't affect it.", { id: "OVERCOAT" }],
  "quick-feet": ["Quick Feet", "Speed +1 while it has a status condition (and paralysis doesn't lower its Speed).", { id: "QUICK_FEET" }],
  regenerator: ["Regenerator", "Restores 1/3 of its max HP when it's switched out.", { id: "REGEN" }],
  rivalry: ["Rivalry", "Whenever an opposing Pokémon's stat rises, the same stat of its own rises as much.", { id: "RIVALRY" }],
  "sand-force": ["Sand Force", "In a sandstorm its Rock-, Ground- and Steel-type moves are 50% stronger, and the sandstorm doesn't hurt it.", { id: "SAND_FORCE" }],
  "sticky-hold": ["Sticky Hold", "Its held item can't be taken or knocked off.", { id: "STICKY" }],
  "tangled-feet": ["Tangled Feet", "Evasiveness +3 while it's confused.", { id: "TANGLED" }],
  trace: ["Trace", "When it enters battle, it copies an opposing Pokémon's Ability.", { id: "TRACE" }],
  unaware: ["Unaware", "Ignores the other Pokémon's stat changes, both attacking and defending.", { id: "UNAWARE" }],
  unburden: ["Unburden", "Speed +2 whenever it holds no item: from the start, or once its item is used up or lost.", { id: "UNBURDEN" }],
  "wonder-skin": ["Wonder Skin", "Status moves aimed at it are at most 50% accurate.", { id: "WONDER_SKIN" }],
  // ---------- generations 2 to 5 ----------
  drizzle: ["Drizzle", "Makes it rain for about five rounds when it enters battle.", { id: "DROUGHT", w: "rain" }],
  "sand-stream": ["Sand Stream", "Whips up a sandstorm for about five rounds when it enters battle.", { id: "DROUGHT", w: "sand" }],
  "snow-warning": ["Snow Warning", "Makes it snow for about five rounds when it enters battle.", { id: "DROUGHT", w: "hail" }],
  "air-lock": ["Air Lock", "When it comes onto the field, it ends the weather for good (an area's own weather too); while it's in battle, any weather set later has no effect.", { id: "CLOUD" }],
  "solid-rock": ["Solid Rock", "Super-effective hits deal 50% less damage to it.", { id: "FILTER", cut: .5 }],   // (the owner's rule)
  "white-smoke": ["White Smoke", "Other Pokémon can't lower its stats.", { id: "NO_DROP", stats: "all" }],
  turboblaze: ["Turboblaze", "Its moves ignore the target's Ability (Levitate, Sturdy, Water Absorb, Multiscale...).", { id: "MOLD" }],
  teravolt: ["Teravolt", "Its moves ignore the target's Ability (Levitate, Sturdy, Water Absorb, Multiscale...).", { id: "MOLD" }],
  "slush-rush": ["Slush Rush", "Speed +2 in snow or hail, and the hail doesn't hurt it.", { id: "WSPEED", w: "hail" }],
  heatproof: ["Heatproof", "Fire-type attacks don't hurt it at all, and it can't be burned.", { id: "HEATPROOF", noStatus: ["BRN"] }],   // (the owner's rule)
  "storm-drain": ["Storm Drain", "Draws in every Water-type attack aimed at its side. Water-type moves don't hurt it; they raise its Sp. Atk by 1 instead (a Ring Target's holder's still raise it, and hurt it for ×1).", { id: "ROD", type: "Water" }],
  "sap-sipper": ["Sap Sipper", "Grass-type moves don't hurt it; they raise its Attack by 1 instead (a Ring Target's holder's still raise it, and hurt it for ×1).", { id: "SIPPER", type: "Grass", stat: "atk" }],
  "motor-drive": ["Motor Drive", "Electric-type moves don't hurt it; they raise its Speed by 1 instead (a Ring Target's holder's still raise it, and hurt it for ×1).", { id: "SIPPER", type: "Electric", stat: "spe" }],
  "wind-rider": ["Wind Rider", "Wind moves (Gust, Hurricane, Heat Wave, Icy Wind...) don't hurt it; they raise its Attack by 1 instead.", { id: "SIPPER", wind: 1, stat: "atk" }],
  "huge-power": ["Huge Power", "Attack +2.", { id: "HUGE" }],
  "pure-power": ["Pure Power", "Attack +2.", { id: "HUGE" }],
  "speed-boost": ["Speed Boost", "Its Speed rises by 1 at the end of each of its turns.", { id: "SPEED_BOOST" }],
  moody: ["Moody", "At the end of each of its turns, one of its stats rises by 2 and another falls by 1.", { id: "MOODY" }],
  "bad-dreams": ["Bad Dreams", "At the end of each of its turns, every sleeping opposing Pokémon loses 1/8 of its max HP.", { id: "BAD_DREAMS" }],
  prankster: ["Prankster", "A +1 priority Ability: +10% turn meter whenever it comes onto the field, like knowing a +1 priority move (the owner's rule).", { id: "PRANKSTER" }],
  "super-luck": ["Super Luck", "Its moves are more likely to be critical hits (two stages higher).", { id: "SUPER_LUCK" }],
  "shadow-tag": ["Shadow Tag", "When it enters battle, every opposing Pokémon's turn meter drops to 0. While it's in battle, opposing Pokémon can't switch out and fill their turn meter 10% slower (Run Away still escapes).", { id: "ARENA_TRAP", all: 1 }],
  plus: ["Plus", "Sp. Atk +1 while a partner with Plus or Minus is in battle.", { id: "PLUSMINUS" }],
  minus: ["Minus", "Sp. Atk +1 while a partner with Plus or Minus is in battle.", { id: "PLUSMINUS" }],
  klutz: ["Klutz", "Its held item has no effect in battle, and an opposing attack that hurts it makes the attacker's Ability Klutz too.", { id: "KLUTZ" }],   // (the owner's rule)
  "rough-skin": ["Rough Skin", "A Pokémon that makes contact with it loses 1/8 of its max HP.", { id: "BARBS" }],
  "iron-barbs": ["Iron Barbs", "A Pokémon that makes contact with it loses 1/8 of its max HP.", { id: "BARBS" }],
  "light-metal": ["Light Metal", "Speed +2, and it weighs half as much (Low Kick and Grass Knot hurt it less, its Heavy Slam less).", { id: "WEIGHT", mul: .5 }],   // (the owner's rule)
  "heavy-metal": ["Heavy Metal", "Attack +1, Defense +1 and Speed -2, and it weighs twice as much (its Heavy Slam and Heat Crash hit harder, and so do Low Kick and Grass Knot on it).", { id: "WEIGHT", mul: 2 }],   // (the owner's rule)
  contrary: ["Contrary", "Stat changes work the other way on it: a rise is a fall, a fall a rise.", { id: "CONTRARY" }],
  simple: ["Simple", "Stat changes on it are doubled.", { id: "SIMPLE" }],
  pickpocket: ["Pickpocket", "When a Pokémon makes contact with it and it holds nothing, it steals that Pokémon's held item.", { id: "PICKPOCKET" }],
  "magic-bounce": ["Magic Bounce", "Status moves aimed at it by the other side bounce back at their user.", { id: "MAGIC_BOUNCE" }],
  "suction-cups": ["Suction Cups", "It can't be forced out (Roar, Whirlwind, Dragon Tail, Circle Throw).", { id: "SUCTION" }],
  "poison-heal": ["Poison Heal", "Poisoned, it restores 1/8 of its max HP every turn instead of losing HP.", { id: "POISON_HEAL" }],
  truant: ["Truant", "It can only act every other turn: the turn after it moves, it loafs around. Each opposing attack that hurts it gives it Attack +1.", { id: "TRUANT" }],   // (the owner's rule)
  "honey-gather": ["Honey Gather", "When it comes onto the field, its partners get back 1/4 of their max HP, and it and its partners get Speed -1. A Pokémon that makes contact with it has its Speed lowered by 1.", { id: "HONEY" }],   // (the owner's rule)
  normalize: ["Normalize", "All its moves are Normal type and 50% stronger.", { id: "NORMALIZE" }],   // (the owner's rule: ×1.5)
  "flare-boost": ["Flare Boost", "Sp. Atk +1 while it's burned.", { id: "FLARE_BOOST" }],
  "toxic-boost": ["Toxic Boost", "Attack +1 while it's poisoned, and poison doesn't hurt it.", { id: "TOXIC_BOOST" }],
  mummy: ["Mummy", "A Pokémon that makes contact with it gets Mummy as its Ability.", { id: "MUMMY" }],
  defeatist: ["Defeatist", "When a hit drops it to half HP or below, it switches out (like Emergency Exit).", { id: "EJECT_HALF" }],   // (the owner's rule)
  illusion: ["Illusion", "Each time it comes onto the field, the first opposing single-target move aimed at it goes for one of the attacker's partners instead (with no partner there, it hits as normal).", { id: "ILLUSION" }],   // (the owner's rule)
  "wonder-guard": ["Wonder Guard", "Only super-effective attacks can hurt it (status conditions, weather and the like still do).", { id: "WONDER_GUARD" }],
  stall: ["Stall", "It's slow to act: its turn meter fills 40% slower, like a Lagging Tail.", { id: "STALL" }],
  telepathy: ["Telepathy", "When a partner on the field is hurt by an opposing attack, it takes half of that damage itself (the partner takes the rest).", { id: "TELEPATHY" }],   // (the owner's rule)
  forecast: ["Forecast", "Castform's form follows its held rock: a Heat Rock makes it Sunny Castform (Fire) with Drought, a Damp Rock Rainy Castform (Water) with Drizzle, an Icy Rock Snowy Castform (Ice) with Snow Warning. With anything else it stays a Normal type and nothing happens; losing the rock turns it back.", { id: "FORECAST" }],   // (the owner's rule)
  "flower-gift": ["Flower Gift", "In harsh sunlight, Attack and Sp. Def +1 for it and its partners on the field.", { id: "FLOWER_GIFT" }],
  "zen-mode": ["Zen Mode", "The first time an opposing attack hits it, Darmanitan becomes Zen Darmanitan (Fire/Psychic, a special attacker) for the rest of the battle.", { id: "ZEN" }],   // (the owner's rule)
  multitype: ["Multitype", "Arceus takes the type of the Plate it holds (and so does its Judgment).", { id: "MULTITYPE" }],
  "victory-star": ["Victory Star", "Accuracy +1 for it and its partners on the field.", { id: "VICTORY_STAR" }],
  "slow-start": ["Slow Start", "For its first two turns in battle, Attack and Speed −2; after that, every stat +2.", { id: "SLOW_START" }],
  "color-change": ["Color Change", "Just before an opposing attack's damage, it becomes a type that resists the attack, like Conversion, every time it would help (an Ability has no cooldown). The type lasts until it leaves the field.", { id: "COLOR_CHANGE" }],   // (the owner's rule, 2026-10-16)
  protean: ["Protean", "Before every move it uses, it becomes that move's type (Generation 8's effect).", { id: "PROTEAN" }],
  "battle-bond": ["Battle Bond", "The first time it knocks out an opposing Pokémon it becomes Ash-Greninja (for the rest of the battle), and every knockout raises its Attack, Sp. Atk and Speed by 1. Ash-Greninja's Water Shuriken strikes 3 times, 20, 40 and 60 power, each strike able to miss, like Triple Axel.", { id: "BATTLE_BOND" }],   // (the owner's rule: Generations 7 and 8's form change and Generation 9's boost both)
  sharpness: ["Sharpness", "Its slicing moves (Slash, Leaf Blade, Night Slash, X-Scissor, Air Slash, Sacred Sword...) are 50% stronger.", { id: "SHARPNESS" }],
  // generations 6 to 9
  "strong-jaw": ["Strong Jaw", "Its biting moves (Bite, Crunch, the Fangs...) are 50% stronger.", { id: "FLAGPOW", flag: "bi", mul: 1.5 }],
  "mega-launcher": ["Mega Launcher", "Its pulse moves (Aura Sphere, Dark Pulse, Dragon Pulse, Water Pulse...) are 50% stronger.", { id: "FLAGPOW", flag: "pulse", mul: 1.5 }],
  "tough-claws": ["Tough Claws", "Its contact moves are 50% stronger.", { id: "FLAGPOW", flag: "ct", mul: 1.5 }],
  "punk-rock": ["Punk Rock", "Its sound moves are 50% stronger, and sound moves hurt it half as much.", { id: "FLAGPOW", flag: "so", mul: 1.5, guard: 1 }],
  aerilate: ["Aerilate", "Its Normal-type moves become Flying type and 50% stronger.", { id: "ATE", type: "Flying", mul: 1.5 }],   // (for the Mega Evolutions to come: the owner's rule)
  pixilate: ["Pixilate", "Its Normal-type moves become Fairy type and 50% stronger.", { id: "ATE", type: "Fairy", mul: 1.5 }],   // (the owner's rule: every move type-changing Ability ×1.5)
  refrigerate: ["Refrigerate", "Its Normal-type moves become Ice type and 50% stronger.", { id: "ATE", type: "Ice", mul: 1.5 }],
  galvanize: ["Galvanize", "Its Normal-type moves become Electric type and 50% stronger.", { id: "ATE", type: "Electric", mul: 1.5 }],
  "liquid-voice": ["Liquid Voice", "Its sound moves become Water type and 50% stronger.", { id: "ATE", type: "Water", sound: 1, mul: 1.5 }],
  steelworker: ["Steelworker", "Its Steel-type moves are 50% stronger.", { id: "TYPEPOW", type: "Steel", mul: 1.5 }],
  "steely-spirit": ["Steely Spirit", "Its Steel-type moves and its partners' are 50% stronger.", { id: "TYPEPOW", type: "Steel", mul: 1.5, allies: 1 }],
  "dragons-maw": ["Dragon's Maw", "Its Dragon-type moves are 50% stronger.", { id: "TYPEPOW", type: "Dragon", mul: 1.5 }],
  transistor: ["Transistor", "Its Electric-type moves are 50% stronger.", { id: "TYPEPOW", type: "Electric", mul: 1.5 }],
  "rocky-payload": ["Rocky Payload", "Its Rock-type moves are 50% stronger.", { id: "TYPEPOW", type: "Rock", mul: 1.5 }],
  "water-bubble": ["Water Bubble", "Its Water-type moves are twice as strong, Fire-type moves hurt it half as much, and it can't be burned.", { id: "WATER_BUBBLE", noStatus: ["BRN"] }],
  "fairy-aura": ["Fairy Aura", "While it's on the field, every Pokémon's Fairy-type moves are 50% stronger.", { id: "AURA", type: "Fairy" }],   // (the owner's rule)
  "dark-aura": ["Dark Aura", "While it's on the field, every Pokémon's Dark-type moves are 50% stronger.", { id: "AURA", type: "Dark" }],
  "aura-break": ["Aura Break", "While it's on the field, Fairy Aura and Dark Aura do nothing.", { id: "AURA_BREAK" }],   // (the owner's rule)
  "power-spot": ["Power Spot", "Its partners' moves are 50% stronger.", { id: "ALLYPOW", mul: 1.5 }],   // (the owner's rule: 50%)
  battery: ["Battery", "Its partners' special moves are 50% stronger.", { id: "ALLYPOW", mul: 1.5, special: 1 }],   // (the owner's rule: 50%)
  "supreme-overlord": ["Supreme Overlord", "Its Attack and Sp. Atk rise by 1 every time it comes onto the field (like Intrepid Sword).", { id: "ENTRY_BOOST", stats: ["atk", "spa"] }],   // (the owner's rule, 2026-10-20: Sp. Atk too)
  stakeout: ["Stakeout", "Its moves are twice as strong against a Pokémon that hasn't acted since coming onto the field.", { id: "STAKEOUT" }],
  "gorilla-tactics": ["Gorilla Tactics", "Attack +1 (and it can still use any of its moves).", { id: "GORILLA" }],
  merciless: ["Merciless", "Its moves always land a critical hit on a poisoned target.", { id: "MERCILESS" }],
  "tablets-of-ruin": ["Tablets of Ruin", "Every opposing Pokémon on the field: Attack −1.", { id: "RUIN", stat: "atk" }],
  "sword-of-ruin": ["Sword of Ruin", "Every opposing Pokémon on the field: Defense −1.", { id: "RUIN", stat: "def" }],
  "vessel-of-ruin": ["Vessel of Ruin", "Every opposing Pokémon on the field: Sp. Atk −1.", { id: "RUIN", stat: "spa" }],
  "beads-of-ruin": ["Beads of Ruin", "Every opposing Pokémon on the field: Sp. Def −1.", { id: "RUIN", stat: "sdf" }],
  protosynthesis: ["Protosynthesis", "In harsh sunlight, or while it holds Booster Energy, its highest stat +1.", { id: "PARADOX", w: "sun" }],
  "quark-drive": ["Quark Drive", "In Electric Terrain, or while it holds Booster Energy, its highest stat +1.", { id: "PARADOX", t: "electric" }],
  "orichalcum-pulse": ["Orichalcum Pulse", "It makes the sunlight harsh when it comes in, and in harsh sunlight Attack +1.", { id: "DROUGHT", w: "sun", atkSun: 1 }],
  "hadron-engine": ["Hadron Engine", "It sets Electric Terrain when it comes in, and in Electric Terrain Sp. Atk +1.", { id: "SURGE", t: "electric", spaTer: 1 }],
  "electric-surge": ["Electric Surge", "It sets Electric Terrain when it comes onto the field.", { id: "SURGE", t: "electric" }],
  "grassy-surge": ["Grassy Surge", "It sets Grassy Terrain when it comes onto the field.", { id: "SURGE", t: "grassy" }],
  "psychic-surge": ["Psychic Surge", "It sets Psychic Terrain when it comes onto the field.", { id: "SURGE", t: "psychic" }],
  "misty-surge": ["Misty Surge", "It sets Misty Terrain when it comes onto the field.", { id: "SURGE", t: "misty" }],
  "seed-sower": ["Seed Sower", "When an attack hits it, it sets Grassy Terrain.", { id: "SEED_SOWER" }],
  "surge-surfer": ["Surge Surfer", "Speed +2 in Electric Terrain.", { id: "TSPEED", t: "electric" }],
  "grass-pelt": ["Grass Pelt", "Defense +1 in Grassy Terrain.", { id: "GRASS_PELT" }],
  "fur-coat": ["Fur Coat", "Defense +2.", { id: "FUR_COAT" }],
  fluffy: ["Fluffy", "Contact moves hurt it half as much, but Fire-type moves twice as much.", { id: "FLUFFY" }],
  "ice-scales": ["Ice Scales", "Special moves hurt it half as much.", { id: "ICE_SCALES" }],
  "prism-armor": ["Prism Armor", "Super-effective hits deal 50% less damage to it (nothing ignores it).", { id: "FILTER", cut: .5 }],
  "shadow-shield": ["Shadow Shield", "Takes half damage while its HP is full (nothing ignores it).", { id: "MULTISCALE" }],
  "full-metal-body": ["Full Metal Body", "Other Pokémon can't lower its stats (nothing ignores it).", { id: "NO_DROP", stats: "all" }],
  "mirror-armor": ["Mirror Armor", "When another Pokémon would lower its stats, that Pokémon's are lowered instead (its own moves still lower its own).", { id: "MIRROR_ARMOR" }],   // (the owner's rule)
  "tera-shell": ["Tera Shell", "While its HP is full, every damaging move is not very effective on it.", { id: "TERA_SHELL" }],
  comatose: ["Comatose", "It's always drowsing: no status condition can affect it.", { id: "NO_STATUS", list: ["SLP", "PAR", "BRN", "PSN", "TOX", "FRZ"] }],
  "purifying-salt": ["Purifying Salt", "No status condition can affect it, and Ghost-type moves hurt it half as much.", { id: "RESIST", types: ["Ghost"], noStatus: ["SLP", "PAR", "BRN", "PSN", "TOX", "FRZ"] }],
  "thermal-exchange": ["Thermal Exchange", "It can't be burned, and being hit by a Fire-type move raises its Attack by 1.", { id: "HIT_BOOST", types: ["Fire"], stat: "atk", n: 1, noStatus: ["BRN"] }],
  "shields-down": ["Shields Down", "Minior: above half HP its Meteor shell keeps every status condition off it; at half HP or below it becomes its Core.", { id: "SHIELDS_DOWN" }],
  "sweet-veil": ["Sweet Veil", "It and its partners can't fall asleep.", { id: "TEAM_VEIL", list: ["SLP"] }],
  "pastel-veil": ["Pastel Veil", "It and its partners can't be poisoned.", { id: "TEAM_VEIL", list: ["PSN", "TOX"] }],
  "aroma-veil": ["Aroma Veil", "It and its partners can't be infatuated, taunted, disabled or Heal Blocked.", { id: "TEAM_VEIL", list: ["INFAT", "TAUNT", "DISABLE", "HEALBLOCK"] }],
  "flower-veil": ["Flower Veil", "The other side can't lower the stats of the Grass types on its side.", { id: "FLOWER_VEIL" }],
  "good-as-gold": ["Good as Gold", "Other Pokémon's status moves don't affect it.", { id: "GOOD_AS_GOLD" }],
  "armor-tail": ["Armor Tail", "The other side's priority moves can't hit it or its partners.", { id: "NO_PRIORITY" }],
  "queenly-majesty": ["Queenly Majesty", "The other side's priority moves can't hit it or its partners.", { id: "NO_PRIORITY" }],
  dazzling: ["Dazzling", "The other side's priority moves can't hit it or its partners.", { id: "NO_PRIORITY" }],
  bulletproof: ["Bulletproof", "Ball and bomb moves (Shadow Ball, Sludge Bomb, Focus Blast, Seed Bomb...) don't affect it.", { id: "BULLETPROOF" }],
  gooey: ["Gooey", "A Pokémon that makes contact with it has its Speed lowered by 1.", { id: "CONTACT_DROP", stat: "spe" }],
  "tangling-hair": ["Tangling Hair", "A Pokémon that makes contact with it has its Speed lowered by 1.", { id: "CONTACT_DROP", stat: "spe" }],
  "wandering-spirit": ["Wandering Spirit", "A Pokémon that makes contact with it swaps Abilities with it.", { id: "MUMMY", swap: 1 }],
  "lingering-aroma": ["Lingering Aroma", "A Pokémon that makes contact with it gets Lingering Aroma as its Ability.", { id: "MUMMY" }],
  "toxic-debris": ["Toxic Debris", "When a physical move hits it, poison spikes scatter on the attacker's side (Toxic Spikes).", { id: "TOXIC_DEBRIS" }],
  "sand-spit": ["Sand Spit", "When an attack hits it, it whips up a sandstorm.", { id: "SAND_SPIT" }],
  "cotton-down": ["Cotton Down", "When an attack hits it, every opposing Pokémon on the field has its Speed lowered by 1.", { id: "COTTON_DOWN" }],
  electromorphosis: ["Electromorphosis", "Being hit charges it: its next Electric-type move is twice as strong.", { id: "CHARGED" }],
  "wind-power": ["Wind Power", "Being hit by a wind move charges it: its next Electric-type move is twice as strong.", { id: "CHARGED", wind: 1 }],
  stamina: ["Stamina", "Every hit it takes raises its Defense by 1.", { id: "HIT_BOOST", stat: "def", n: 1 }],
  "water-compaction": ["Water Compaction", "Being hit by a Water-type move sharply raises its Defense (+2).", { id: "HIT_BOOST", types: ["Water"], stat: "def", n: 2 }],
  "steam-engine": ["Steam Engine", "Being hit by a Fire- or Water-type move maxes out its Speed.", { id: "HIT_BOOST", types: ["Fire", "Water"], stat: "spe", n: 6 }],
  berserk: ["Berserk", "When a hit drops it to half HP or below, its Sp. Atk rises by 1.", { id: "BERSERK" }],
  "anger-shell": ["Anger Shell", "When a hit drops it to half HP or below, its Attack, Sp. Atk and Speed rise by 1 and its Defense and Sp. Def fall by 1.", { id: "BERSERK", shell: 1 }],
  "emergency-exit": ["Emergency Exit", "When a hit drops it to half HP or below, it switches out.", { id: "EJECT_HALF" }],
  "wimp-out": ["Wimp Out", "When a hit drops it to half HP or below, it switches out.", { id: "EJECT_HALF" }],
  "innards-out": ["Innards Out", "When an attack knocks it out, the attacker loses as much HP as it had left.", { id: "INNARDS" }],
  magician: ["Magician", "When its attack hits and it holds no item, it steals the target's.", { id: "MAGICIAN" }],
  "toxic-chain": ["Toxic Chain", "Its attacks may badly poison the target (30%).", { id: "TOXIC_CHAIN" }],
  "poison-puppeteer": ["Poison Puppeteer", "A Pokémon it poisons becomes confused as well.", { id: "PUPPETEER" }],
  "beast-boost": ["Beast Boost", "Knocking out a Pokémon raises its highest stat by 1.", { id: "MOXIE", stat: "best" }],
  "chilling-neigh": ["Chilling Neigh", "Knocking out a Pokémon raises its Attack by 1.", { id: "MOXIE", stat: "atk" }],
  "grim-neigh": ["Grim Neigh", "Knocking out a Pokémon raises its Sp. Atk by 1.", { id: "MOXIE", stat: "spa" }],
  "as-one-glastrier": ["As One", "Unnerve and Chilling Neigh: the other side can't eat Berries, and knocking out a Pokémon raises its Attack by 1.", { id: "MOXIE", stat: "atk", unnerve: 1 }],
  "as-one-spectrier": ["As One", "Unnerve and Grim Neigh: the other side can't eat Berries, and knocking out a Pokémon raises its Sp. Atk by 1.", { id: "MOXIE", stat: "spa", unnerve: 1 }],
  "soul-heart": ["Soul-Heart", "Whenever another Pokémon faints, its Sp. Atk rises by 1.", { id: "SOUL_HEART" }],
  opportunist: ["Opportunist", "When an opposing Pokémon's stats rise, its own rise the same way.", { id: "OPPORTUNIST" }],
  costar: ["Costar", "When it comes onto the field it copies a partner's stat changes.", { id: "COSTAR" }],
  "intrepid-sword": ["Intrepid Sword", "Its Attack rises by 1 every time it comes onto the field (as in Generation 8).", { id: "ENTRY_BOOST", stat: "atk" }],
  "dauntless-shield": ["Dauntless Shield", "Its Defense rises by 1 every time it comes onto the field (as in Generation 8).", { id: "ENTRY_BOOST", stat: "def" }],
  "screen-cleaner": ["Screen Cleaner", "When it comes onto the field, Reflect, Light Screen and Aurora Veil end on both sides.", { id: "SCREEN_CLEANER" }],
  "curious-medicine": ["Curious Medicine", "When it comes onto the field, its partners' stat changes are reset.", { id: "CURIOUS" }],
  hospitality: ["Hospitality", "When it comes onto the field, its partners get back 1/4 of their max HP.", { id: "HOSPITALITY" }],
  "supersweet-syrup": ["Supersweet Syrup", "When it comes onto the field, the other side's evasiveness falls by 1.", { id: "SYRUP" }],
  "tera-shift": ["Tera Shift", "Terapagos takes its Terastal Form when it comes onto the field.", { id: "TERA_SHIFT" }],
  "zero-to-hero": ["Zero to Hero", "The first time an opposing attack hits it, Palafin becomes Hero Palafin for the rest of the battle.", { id: "HERO" }],   // (the owner's rule)
  schooling: ["Schooling", "Wishiwashi (Lv 20 and up) forms a mighty school above 1/4 of its HP, and goes solo at 1/4 or below.", { id: "SCHOOLING" }],
  "power-construct": ["Power Construct", "At half HP or below, Zygarde becomes its Complete Forme (and its max HP rises).", { id: "POWER_CONSTRUCT" }],
  "stance-change": ["Stance Change", "Aegislash takes its Blade Forme to attack and its Shield Forme when it protects itself; each change gives +1 to the higher of Attack and Sp. Atk (Blade) or of Defense and Sp. Def (Shield).", { id: "STANCE" }],   // (the owner's rule)
  "ice-face": ["Ice Face", "The first damaging hit, physical or special, only breaks Eiscue's ice face (it takes no damage); snow or hail brings the ice back.", { id: "ICE_FACE" }],   // (the owner's rule: like Generation 7's Disguise)
  disguise: ["Disguise", "The first damaging hit only busts Mimikyu's disguise, and it takes no damage (Generation 7's effect).", { id: "DISGUISE" }],   // (the owner's rule)
  "long-reach": ["Long Reach", "Its moves never make contact (Rough Skin, Static and the like don't trigger).", { id: "LONG_REACH" }],
  "unseen-fist": ["Unseen Fist", "Its contact moves hit through Protect and Detect.", { id: "UNSEEN_FIST" }],
  "propeller-tail": ["Propeller Tail", "Its moves go where it aims them: Follow Me, Lightning Rod and Storm Drain can't draw them away.", { id: "NO_REDIRECT" }],
  stalwart: ["Stalwart", "Its moves go where it aims them: Follow Me, Lightning Rod and Storm Drain can't draw them away.", { id: "NO_REDIRECT" }],
  corrosion: ["Corrosion", "It can poison Steel- and Poison-type Pokémon.", { id: "CORROSION" }],
  triage: ["Triage", "A +3 priority Ability: +30% turn meter when it comes onto the field.", { id: "PRIORITY_AB" }],
  "gale-wings": ["Gale Wings", "A +1 priority Ability: +10% turn meter when it comes onto the field.", { id: "PRIORITY_AB" }],
  "quick-draw": ["Quick Draw", "Lets it move in the +1 priority bracket: +10% turn meter when it comes onto the field, and after each of its turns a 30% chance to move again at once.", { id: "PRIORITY_AB" }],
  "guard-dog": ["Guard Dog", "Intimidate raises its Attack instead, and nothing can force it out (Roar, Whirlwind, Dragon Tail).", { id: "GUARD_DOG", noIntim: 1 }],
  "minds-eye": ["Mind's Eye", "Its Normal- and Fighting-type moves hit Ghost types, and its moves ignore evasiveness.", { id: "SCRAPPY", noIntim: 1 }],
  libero: ["Libero", "Before every move it uses, it becomes that move's type (Generation 8's effect).", { id: "PROTEAN" }],
  "well-baked-body": ["Well-Baked Body", "Fire-type moves don't hurt it; they sharply raise its Defense (+2) instead.", { id: "SIPPER", type: "Fire", stat: "def", n: 2 }],
  "earth-eater": ["Earth Eater", "Draws in every Ground-type attack aimed at its side, and Ground-type moves heal it by 1/4 of its max HP instead of hurting it.", { id: "ABSORB", type: "Ground", draw: 1 }],   // (the owner's rule: it draws them in, like Lightning Rod)
  ripen: ["Ripen", "Its Berries restore twice as much HP.", { id: "RIPEN" }],
  "cheek-pouch": ["Cheek Pouch", "Eating a Berry also restores 1/3 of its max HP.", { id: "CHEEK_POUCH" }],
  "cud-chew": ["Cud Chew", "When it eats a Berry, it eats the same Berry again at the end of its next turn and gets its effect again (a Berry that only works when it's hit does nothing the second time).", { id: "CUD_CHEW" }],   // (the owner's rule)
  symbiosis: ["Symbiosis", "When a partner on the field uses up its item, it hands that partner its own item at once.", { id: "SYMBIOSIS" }],
  dancer: ["Dancer", "When another Pokémon uses a dance move (Swords Dance, Dragon Dance, Quiver Dance, Revelation Dance...), it dances it right after.", { id: "DANCER" }],
  "power-of-alchemy": ["Power of Alchemy", "When a partner on the field faints, it takes that partner's Ability.", { id: "RECEIVER" }],
  receiver: ["Receiver", "When a partner on the field faints, it takes that partner's Ability.", { id: "RECEIVER" }],
  "ball-fetch": ["Ball Fetch", "After each Journey stage won with it on the team (a Quick Battle too), a 10% chance to bring back a Safari Ball (one roll a battle, however many have it).", { id: "BALL_FETCH" }],   // (the owner's rule)
  "gulp-missile": ["Gulp Missile", "Surf or Dive catches prey (an Arrokuda, or a Pikachu at half HP or below); the next attacker to hit it gets it spat back: 1/4 of its max HP, and Defense -1 or paralysis.", { id: "GULP" }],
  "hunger-switch": ["Hunger Switch", "Morpeko switches between Full Belly and Hangry Mode every turn; its Aura Wheel is Electric type full and Dark type hangry.", { id: "HUNGER" }],
  "rks-system": ["RKS System", "Silvally takes the type of the Memory it holds (from the BP Exchange), and so does its Multi-Attack.", { id: "MULTITYPE", memory: 1 }],
  commander: ["Commander", "While a Dondozo is on its side of the field, Tatsugiri goes inside its mouth: it can't act and nothing can hit it, and Dondozo's Attack, Defense, Sp. Atk, Sp. Def and Speed are +2 for as long as it's there.", { id: "COMMANDER" }],   // (the owner's rule)
  mimicry: ["Mimicry", "While a terrain is up it takes the terrain's type (Electric, Grass, Fairy or Psychic).", { id: "MIMICRY" }],
  "mycelium-might": ["Mycelium Might", "Its status moves ignore the target's Ability (Insomnia, Clear Body, Magic Bounce and the like).", { id: "MYCELIUM" }],
  "perish-body": ["Perish Body", "A Pokémon that makes contact with it starts Perish Song's count for both: each faints after 3 of its own turns unless it switches out.", { id: "PERISH_BODY" }],
};
const abilityOf = k => { const a = ABILITY[k] || [k, "", { id: "NONE" }]; return { name: a[0], text: a[1], ...a[2], key: k }; };

// ---------- Held Items ----------
// tier: 1 common (Explore drops), 2 uncommon, 3 rare (BP Exchange, bosses)
const HELD = {
  leftovers: { n: "Leftovers", t: 2, d: "Restores 1/16 of its max HP every turn." },
  quickclaw: { n: "Quick Claw", t: 1, d: "Lets it move in the +1 priority bracket: +10% turn meter when it's sent out, and after each of its turns a 20% chance to move again at once. One per team (Item Clause)." },
  scopelens: { n: "Scope Lens", t: 1, d: "Raises its critical-hit ratio." },
  widelens: { n: "Wide Lens", t: 1, d: "Accuracy +1." },
  brightpowder: { n: "Bright Powder", t: 1, d: "Evasiveness +1." },
  kingsrock: { n: "King's Rock", t: 1, d: "Its damaging moves may make the target flinch, losing its next turn (10%, each strike of a multi-strike move). One per team (Item Clause)." },
  focusband: { n: "Focus Band", t: 2, d: "10% chance to hold on with 1 HP instead of fainting." },
  shellbell: { n: "Shell Bell", t: 2, d: "Restores HP equal to 1/8 of the damage it deals." },
  expertbelt: { n: "Expert Belt", t: 2, d: "Super-effective moves deal 20% more damage." },
  eviolite: { n: "Eviolite", t: 2, d: "Defense and Sp. Def +1 while the holder can still evolve." },
  muscleband: { n: "Muscle Band", t: 1, d: "Attack +1. Item Clause: one per team." },
  wiseglasses: { n: "Wise Glasses", t: 1, d: "Sp. Atk +1. Item Clause: one per team." },
  sitrusberry: { n: "Sitrus Berry", t: 1, d: "Restores 1/4 of its max HP when its HP drops below half. Once per battle." },
  lumberry: { n: "Lum Berry", t: 1, d: "Cures any status condition or confusion. Once per battle." },
  choiceband: { n: "Choice Band", t: 3, d: "Attack +1. Item Clause: one per team." },
  choicespecs: { n: "Choice Specs", t: 3, d: "Sp. Atk +1. Item Clause: one per team." },
  choicescarf: { n: "Choice Scarf", t: 3, d: "Speed +1. Item Clause: one per team." },
  lifeorb: { n: "Life Orb", t: 3, d: "Attack and Sp. Atk +1, but it loses 1/10 of its max HP each time it attacks (not on moves Sheer Force powers up, and never with Magic Guard). Item Clause: one per team." },
  assaultvest: { n: "Assault Vest", t: 3, d: "Sp. Def +1 (status moves still allowed). Item Clause: one per team." },
  // (house rule, the owner's: the whole Pikachu line, not only Pikachu)
  lightball: { n: "Light Ball", t: 3, only: ["pichu", "pikachu", "raichu", "raichualola"], d: "The Pikachu line only (Pichu, Pikachu, Raichu and Alolan Raichu): Attack and Sp. Atk +2." },
  thickclub: { n: "Thick Club", t: 3, only: ["cubone", "marowak"], d: "Cubone and Marowak only: Attack +2." },
  luckypunch: { n: "Lucky Punch", t: 3, only: ["chansey"], d: "Chansey only: maxes out its critical-hit ratio (every hit is a critical hit)." },
  leek: { n: "Leek", t: 3, only: ["farfetchd"], d: "Farfetch'd only: maxes out its critical-hit ratio (every hit is a critical hit)." },
  metalpowder: { n: "Metal Powder", t: 3, only: ["ditto"], d: "Ditto only: Defense +2, even after it transforms." },
};
// a type-boosting item for every type (+20%)
const TYPE_ITEM = { Normal: "silkscarf:Silk Scarf", Fire: "charcoal:Charcoal", Water: "mysticwater:Mystic Water", Electric: "magnet:Magnet", Grass: "miracleseed:Miracle Seed",
  Ice: "nevermeltice:Never-Melt Ice", Fighting: "blackbelt:Black Belt", Poison: "poisonbarb:Poison Barb", Ground: "softsand:Soft Sand", Flying: "sharpbeak:Sharp Beak",
  Psychic: "twistedspoon:Twisted Spoon", Bug: "silverpowder:Silver Powder", Rock: "hardstone:Hard Stone", Ghost: "spelltag:Spell Tag", Dragon: "dragonfang:Dragon Fang",
  Dark: "blackglasses:Black Glasses", Steel: "metalcoat:Metal Coat", Fairy: "fairyfeather:Fairy Feather" };
for (const t in TYPE_ITEM) { const [k, n] = TYPE_ITEM[t].split(":"); HELD[k] = { n, t: 1, boost: t, d: `${t}-type moves deal 50% more damage.` }; }
// every other held item with a battle effect, from Gen 2 to Gen 9 (Mega Stones, Z-Crystals and Tera items aside: those mechanics
// aren't in this game). src: where to get it (mart: the Poké Mart, bp: the BP Exchange, explore: Explore finds). berry: a Berry
// (Unnerve stops it; Harvest and Pluck know it); the rest of the fields are read by the battle engine (a7_engine.js heldX).
Object.assign(HELD, {
  cheriberry: {"n": "Cheri Berry", "t": 1, "d": "Cures paralysis once.", "berry": 1, "cure": ["PAR"], "src": "mart"},
  chestoberry: {"n": "Chesto Berry", "t": 1, "d": "Cures sleep once.", "berry": 1, "cure": ["SLP"], "src": "mart"},
  pechaberry: {"n": "Pecha Berry", "t": 1, "d": "Cures poison once.", "berry": 1, "cure": ["PSN", "TOX"], "src": "mart"},
  rawstberry: {"n": "Rawst Berry", "t": 1, "d": "Cures a burn once.", "berry": 1, "cure": ["BRN"], "src": "mart"},
  aspearberry: {"n": "Aspear Berry", "t": 1, "d": "Cures freezing once.", "berry": 1, "cure": ["FRZ"], "src": "mart"},
  persimberry: {"n": "Persim Berry", "t": 1, "d": "Cures confusion once.", "berry": 1, "cure": ["CNF"], "src": "mart"},
  oranberry: {"n": "Oran Berry", "t": 1, "d": "Restores 10 HP when its HP drops below half. Once per battle.", "berry": 1, "healAt": 0.5, "healFlat": 10, "src": "mart"},
  berryjuice: {"n": "Berry Juice", "t": 1, "d": "Restores 20 HP when its HP drops below half. Once per battle.", "healAt": 0.5, "healFlat": 20, "src": "mart"},
  figyberry: {"n": "Figy Berry", "t": 1, "d": "Restores 1/3 of its max HP when its HP drops to 1/4. Once per battle.", "berry": 1, "healAt": 0.25, "heal": 0.3333333333333333, "src": "mart"},
  wikiberry: {"n": "Wiki Berry", "t": 1, "d": "Restores 1/3 of its max HP when its HP drops to 1/4. Once per battle.", "berry": 1, "healAt": 0.25, "heal": 0.3333333333333333, "src": "mart"},
  magoberry: {"n": "Mago Berry", "t": 1, "d": "Restores 1/3 of its max HP when its HP drops to 1/4. Once per battle.", "berry": 1, "healAt": 0.25, "heal": 0.3333333333333333, "src": "mart"},
  aguavberry: {"n": "Aguav Berry", "t": 1, "d": "Restores 1/3 of its max HP when its HP drops to 1/4. Once per battle.", "berry": 1, "healAt": 0.25, "heal": 0.3333333333333333, "src": "mart"},
  iapapaberry: {"n": "Iapapa Berry", "t": 1, "d": "Restores 1/3 of its max HP when its HP drops to 1/4. Once per battle.", "berry": 1, "healAt": 0.25, "heal": 0.3333333333333333, "src": "mart"},
  liechiberry: {"n": "Liechi Berry", "t": 2, "d": "At 1/4 of its max HP: Attack +1. Once per battle.", "berry": 1, "pinch": "atk", "src": "mart"},
  ganlonberry: {"n": "Ganlon Berry", "t": 2, "d": "At 1/4 of its max HP: Defense +1. Once per battle.", "berry": 1, "pinch": "def", "src": "mart"},
  salacberry: {"n": "Salac Berry", "t": 2, "d": "At 1/4 of its max HP: Speed +1. Once per battle.", "berry": 1, "pinch": "spe", "src": "mart"},
  petayaberry: {"n": "Petaya Berry", "t": 2, "d": "At 1/4 of its max HP: Sp. Atk +1. Once per battle.", "berry": 1, "pinch": "spa", "src": "mart"},
  apicotberry: {"n": "Apicot Berry", "t": 2, "d": "At 1/4 of its max HP: Sp. Def +1. Once per battle.", "berry": 1, "pinch": "sdf", "src": "mart"},
  lansatberry: {"n": "Lansat Berry", "t": 2, "d": "At 1/4 of its max HP: its critical-hit ratio rises sharply. Once per battle.", "berry": 1, "pinch": "crit", "src": "mart"},
  starfberry: {"n": "Starf Berry", "t": 2, "d": "At 1/4 of its max HP: a random stat +2. Once per battle.", "berry": 1, "pinch": "random", "src": "mart"},
  micleberry: {"n": "Micle Berry", "t": 2, "d": "At 1/4 of its max HP: its next move can't miss. Once per battle.", "berry": 1, "pinch": "acc", "src": "mart"},
  custapberry: {"n": "Custap Berry", "t": 2, "d": "At 1/4 of its max HP: it takes its turn at once, right after the attack that brought it there. Once per battle.", "berry": 1, "pinch": "first", "src": "mart"},
  occaberry: {"n": "Occa Berry", "t": 1, "d": "Halves the damage of one super-effective Fire-type hit.", "berry": 1, "resist": "Fire", "src": "mart"},
  passhoberry: {"n": "Passho Berry", "t": 1, "d": "Halves the damage of one super-effective Water-type hit.", "berry": 1, "resist": "Water", "src": "mart"},
  wacanberry: {"n": "Wacan Berry", "t": 1, "d": "Halves the damage of one super-effective Electric-type hit.", "berry": 1, "resist": "Electric", "src": "mart"},
  rindoberry: {"n": "Rindo Berry", "t": 1, "d": "Halves the damage of one super-effective Grass-type hit.", "berry": 1, "resist": "Grass", "src": "mart"},
  yacheberry: {"n": "Yache Berry", "t": 1, "d": "Halves the damage of one super-effective Ice-type hit.", "berry": 1, "resist": "Ice", "src": "mart"},
  chopleberry: {"n": "Chople Berry", "t": 1, "d": "Halves the damage of one super-effective Fighting-type hit.", "berry": 1, "resist": "Fighting", "src": "mart"},
  kebiaberry: {"n": "Kebia Berry", "t": 1, "d": "Halves the damage of one super-effective Poison-type hit.", "berry": 1, "resist": "Poison", "src": "mart"},
  shucaberry: {"n": "Shuca Berry", "t": 1, "d": "Halves the damage of one super-effective Ground-type hit.", "berry": 1, "resist": "Ground", "src": "mart"},
  cobaberry: {"n": "Coba Berry", "t": 1, "d": "Halves the damage of one super-effective Flying-type hit.", "berry": 1, "resist": "Flying", "src": "mart"},
  payapaberry: {"n": "Payapa Berry", "t": 1, "d": "Halves the damage of one super-effective Psychic-type hit.", "berry": 1, "resist": "Psychic", "src": "mart"},
  tangaberry: {"n": "Tanga Berry", "t": 1, "d": "Halves the damage of one super-effective Bug-type hit.", "berry": 1, "resist": "Bug", "src": "mart"},
  chartiberry: {"n": "Charti Berry", "t": 1, "d": "Halves the damage of one super-effective Rock-type hit.", "berry": 1, "resist": "Rock", "src": "mart"},
  kasibberry: {"n": "Kasib Berry", "t": 1, "d": "Halves the damage of one super-effective Ghost-type hit.", "berry": 1, "resist": "Ghost", "src": "mart"},
  habanberry: {"n": "Haban Berry", "t": 1, "d": "Halves the damage of one super-effective Dragon-type hit.", "berry": 1, "resist": "Dragon", "src": "mart"},
  colburberry: {"n": "Colbur Berry", "t": 1, "d": "Halves the damage of one super-effective Dark-type hit.", "berry": 1, "resist": "Dark", "src": "mart"},
  babiriberry: {"n": "Babiri Berry", "t": 1, "d": "Halves the damage of one super-effective Steel-type hit.", "berry": 1, "resist": "Steel", "src": "mart"},
  roseliberry: {"n": "Roseli Berry", "t": 1, "d": "Halves the damage of one super-effective Fairy-type hit.", "berry": 1, "resist": "Fairy", "src": "mart"},
  chilanberry: {"n": "Chilan Berry", "t": 1, "d": "Halves the damage of one Normal-type hit.", "berry": 1, "resist": "Normal", "src": "mart"},
  jabocaberry: {"n": "Jaboca Berry", "t": 2, "d": "When a physical move hits it, the attacker loses 1/8 of its max HP. Once per battle.", "berry": 1, "retaliate": "P", "src": "mart"},
  rowapberry: {"n": "Rowap Berry", "t": 2, "d": "When a special move hits it, the attacker loses 1/8 of its max HP. Once per battle.", "berry": 1, "retaliate": "S", "src": "mart"},
  keeberry: {"n": "Kee Berry", "t": 2, "d": "When a physical move hits it: Defense +1. Once per battle.", "berry": 1, "hitBoost": "P", "stat": "def", "src": "mart"},
  marangaberry: {"n": "Maranga Berry", "t": 2, "d": "When a special move hits it: Sp. Def +1. Once per battle.", "berry": 1, "hitBoost": "S", "stat": "sdf", "src": "mart"},
  enigmaberry: {"n": "Enigma Berry", "t": 2, "d": "Restores 1/4 of its max HP when a super-effective move hits it. Once per battle.", "berry": 1, "seHeal": 0.25, "src": "mart"},
  normalgem: {"n": "Normal Gem", "t": 1, "d": "Its first Normal-type move is 30% stronger (used up).", "gem": "Normal", "src": "explore"},
  firegem: {"n": "Fire Gem", "t": 1, "d": "Its first Fire-type move is 30% stronger (used up).", "gem": "Fire", "src": "explore"},
  watergem: {"n": "Water Gem", "t": 1, "d": "Its first Water-type move is 30% stronger (used up).", "gem": "Water", "src": "explore"},
  electricgem: {"n": "Electric Gem", "t": 1, "d": "Its first Electric-type move is 30% stronger (used up).", "gem": "Electric", "src": "explore"},
  grassgem: {"n": "Grass Gem", "t": 1, "d": "Its first Grass-type move is 30% stronger (used up).", "gem": "Grass", "src": "explore"},
  icegem: {"n": "Ice Gem", "t": 1, "d": "Its first Ice-type move is 30% stronger (used up).", "gem": "Ice", "src": "explore"},
  fightinggem: {"n": "Fighting Gem", "t": 1, "d": "Its first Fighting-type move is 30% stronger (used up).", "gem": "Fighting", "src": "explore"},
  poisongem: {"n": "Poison Gem", "t": 1, "d": "Its first Poison-type move is 30% stronger (used up).", "gem": "Poison", "src": "explore"},
  groundgem: {"n": "Ground Gem", "t": 1, "d": "Its first Ground-type move is 30% stronger (used up).", "gem": "Ground", "src": "explore"},
  flyinggem: {"n": "Flying Gem", "t": 1, "d": "Its first Flying-type move is 30% stronger (used up).", "gem": "Flying", "src": "explore"},
  psychicgem: {"n": "Psychic Gem", "t": 1, "d": "Its first Psychic-type move is 30% stronger (used up).", "gem": "Psychic", "src": "explore"},
  buggem: {"n": "Bug Gem", "t": 1, "d": "Its first Bug-type move is 30% stronger (used up).", "gem": "Bug", "src": "explore"},
  rockgem: {"n": "Rock Gem", "t": 1, "d": "Its first Rock-type move is 30% stronger (used up).", "gem": "Rock", "src": "explore"},
  ghostgem: {"n": "Ghost Gem", "t": 1, "d": "Its first Ghost-type move is 30% stronger (used up).", "gem": "Ghost", "src": "explore"},
  dragongem: {"n": "Dragon Gem", "t": 1, "d": "Its first Dragon-type move is 30% stronger (used up).", "gem": "Dragon", "src": "explore"},
  darkgem: {"n": "Dark Gem", "t": 1, "d": "Its first Dark-type move is 30% stronger (used up).", "gem": "Dark", "src": "explore"},
  steelgem: {"n": "Steel Gem", "t": 1, "d": "Its first Steel-type move is 30% stronger (used up).", "gem": "Steel", "src": "explore"},
  fairygem: {"n": "Fairy Gem", "t": 1, "d": "Its first Fairy-type move is 30% stronger (used up).", "gem": "Fairy", "src": "explore"},
  flameplate: {"n": "Flame Plate", "t": 2, "d": "Fire-type moves deal 50% more damage.", "boost": "Fire", "src": "explore"},
  splashplate: {"n": "Splash Plate", "t": 2, "d": "Water-type moves deal 50% more damage.", "boost": "Water", "src": "explore"},
  zapplate: {"n": "Zap Plate", "t": 2, "d": "Electric-type moves deal 50% more damage.", "boost": "Electric", "src": "explore"},
  meadowplate: {"n": "Meadow Plate", "t": 2, "d": "Grass-type moves deal 50% more damage.", "boost": "Grass", "src": "explore"},
  icicleplate: {"n": "Icicle Plate", "t": 2, "d": "Ice-type moves deal 50% more damage.", "boost": "Ice", "src": "explore"},
  fistplate: {"n": "Fist Plate", "t": 2, "d": "Fighting-type moves deal 50% more damage.", "boost": "Fighting", "src": "explore"},
  toxicplate: {"n": "Toxic Plate", "t": 2, "d": "Poison-type moves deal 50% more damage.", "boost": "Poison", "src": "explore"},
  earthplate: {"n": "Earth Plate", "t": 2, "d": "Ground-type moves deal 50% more damage.", "boost": "Ground", "src": "explore"},
  skyplate: {"n": "Sky Plate", "t": 2, "d": "Flying-type moves deal 50% more damage.", "boost": "Flying", "src": "explore"},
  mindplate: {"n": "Mind Plate", "t": 2, "d": "Psychic-type moves deal 50% more damage.", "boost": "Psychic", "src": "explore"},
  insectplate: {"n": "Insect Plate", "t": 2, "d": "Bug-type moves deal 50% more damage.", "boost": "Bug", "src": "explore"},
  stoneplate: {"n": "Stone Plate", "t": 2, "d": "Rock-type moves deal 50% more damage.", "boost": "Rock", "src": "explore"},
  spookyplate: {"n": "Spooky Plate", "t": 2, "d": "Ghost-type moves deal 50% more damage.", "boost": "Ghost", "src": "explore"},
  dracoplate: {"n": "Draco Plate", "t": 2, "d": "Dragon-type moves deal 50% more damage.", "boost": "Dragon", "src": "explore"},
  dreadplate: {"n": "Dread Plate", "t": 2, "d": "Dark-type moves deal 50% more damage.", "boost": "Dark", "src": "explore"},
  ironplate: {"n": "Iron Plate", "t": 2, "d": "Steel-type moves deal 50% more damage.", "boost": "Steel", "src": "explore"},
  pixieplate: {"n": "Pixie Plate", "t": 2, "d": "Fairy-type moves deal 50% more damage.", "boost": "Fairy", "src": "explore"},
  seaincense: {"n": "Sea Incense", "t": 2, "d": "Water-type moves deal 50% more damage.", "boost": "Water", "src": "explore"},
  waveincense: {"n": "Wave Incense", "t": 2, "d": "Water-type moves deal 50% more damage.", "boost": "Water", "src": "explore"},
  oddincense: {"n": "Odd Incense", "t": 2, "d": "Psychic-type moves deal 50% more damage.", "boost": "Psychic", "src": "explore"},
  rockincense: {"n": "Rock Incense", "t": 2, "d": "Rock-type moves deal 50% more damage.", "boost": "Rock", "src": "explore"},
  roseincense: {"n": "Rose Incense", "t": 2, "d": "Grass-type moves deal 50% more damage.", "boost": "Grass", "src": "explore"},
  laxincense: {"n": "Lax Incense", "t": 1, "d": "Evasiveness +1.", "src": "explore"},
  fullincense: {"n": "Full Incense", "t": 1, "d": "It moves later: its turn meter fills slower.", "src": "explore"},
  focussash: {"n": "Focus Sash", "t": 3, "d": "At full HP, it holds on with 1 HP instead of fainting from one hit (used up).", "src": "bp"},
  rockyhelmet: {"n": "Rocky Helmet", "t": 3, "d": "Pokémon that make contact with it lose 1/6 of their max HP.", "src": "bp"},
  weaknesspolicy: {"n": "Weakness Policy", "t": 3, "d": "Hit by a super-effective move: Attack and Sp. Atk +2 (used up).", "src": "bp"},
  heavydutyboots: {"n": "Heavy-Duty Boots", "t": 3, "d": "Unhurt by Stealth Rock, Spikes and Toxic Spikes.", "src": "bp"},
  airballoon: {"n": "Air Balloon", "t": 2, "d": "It floats, so Ground-type moves miss it, until a hit pops the balloon.", "src": "bp"},
  ejectbutton: {"n": "Eject Button", "t": 2, "d": "When a move hits it, it switches out at once (used up).", "src": "bp"},
  ejectpack: {"n": "Eject Pack", "t": 2, "d": "When its stats are lowered, it switches out at once (used up).", "src": "bp"},
  redcard: {"n": "Red Card", "t": 2, "d": "When a move hits it, the attacker is dragged out of battle (used up).", "src": "bp"},
  blacksludge: {"n": "Black Sludge", "t": 2, "d": "Poison types restore 1/16 of their max HP every turn; anyone else loses 1/8.", "src": "bp"},
  toxicorb: {"n": "Toxic Orb", "t": 2, "d": "Badly poisons the holder at the start of its turn (if it has no status yet).", "src": "bp"},
  flameorb: {"n": "Flame Orb", "t": 2, "d": "Burns the holder at the start of its turn (if it has no status yet).", "src": "bp"},
  lightclay: {"n": "Light Clay", "t": 2, "d": "Reflect, Light Screen and Aurora Veil last 8 turns instead of 5.", "src": "bp"},
  bigroot: {"n": "Big Root", "t": 1, "d": "HP it drains (Giga Drain, Leech Seed, Ingrain, Aqua Ring) is 30% more.", "src": "bp"},
  bindingband: {"n": "Binding Band", "t": 1, "d": "Its binding moves squeeze for 1/6 of max HP instead of 1/8.", "src": "bp"},
  gripclaw: {"n": "Grip Claw", "t": 1, "d": "Its binding moves last 7 turns.", "src": "bp"},
  ironball: {"n": "Iron Ball", "t": 1, "d": "Speed −2, and it's grounded (Ground moves hit it).", "src": "bp"},
  laggingtail: {"n": "Lagging Tail", "t": 1, "d": "It moves later: its turn meter fills slower.", "src": "bp"},
  razorclaw: {"n": "Razor Claw", "t": 2, "d": "Raises its critical-hit ratio.", "src": "bp"},
  razorfang: {"n": "Razor Fang", "t": 2, "d": "Its damaging moves may make the target flinch, losing its next turn (10%, each strike of a multi-strike move). One per team (Item Clause).", "src": "bp"},
  zoomlens: {"n": "Zoom Lens", "t": 1, "d": "Accuracy +1 (the same as a Wide Lens).", "src": "bp"},
  metronome: {"n": "Metronome", "t": 2, "d": "Each time it uses the same move in a row, that move is 20% stronger (up to double).", "src": "bp"},
  throatspray: {"n": "Throat Spray", "t": 1, "d": "After it uses a sound move: Sp. Atk +1 (used up).", "src": "bp"},
  blunderpolicy: {"n": "Blunder Policy", "t": 1, "d": "If one of its moves misses: Speed +2 (used up).", "src": "bp"},
  roomservice: {"n": "Room Service", "t": 1, "d": "A Trick Room its holder sets up lasts 8 rounds instead of 5.", "src": "bp"},
  adrenalineorb: {"n": "Adrenaline Orb", "t": 1, "d": "When Intimidate hits it: Speed +1 (used up).", "src": "bp"},
  absorbbulb: {"n": "Absorb Bulb", "t": 1, "d": "Hit by a Water-type move: Sp. Atk +1 (used up).", "src": "bp"},
  cellbattery: {"n": "Cell Battery", "t": 1, "d": "Hit by an Electric-type move: Attack +1 (used up).", "src": "bp"},
  luminousmoss: {"n": "Luminous Moss", "t": 1, "d": "Hit by a Water-type move: Sp. Def +1 (used up).", "src": "bp"},
  snowball: {"n": "Snowball", "t": 1, "d": "Hit by an Ice-type move: Attack +1 (used up).", "src": "bp"},
  protectivepads: {"n": "Protective Pads", "t": 2, "d": "Its contact moves don't trigger the target's contact effects (Rocky Helmet, Static...).", "src": "bp"},
  safetygoggles: {"n": "Safety Goggles", "t": 2, "d": "Unhurt by weather, and powder moves don't affect it.", "src": "bp"},
  utilityumbrella: {"n": "Utility Umbrella", "t": 2, "d": "Rain and harsh sunlight don't change its moves' damage, or the damage it takes.", "src": "bp"},
  covertcloak: {"n": "Covert Cloak", "t": 3, "d": "Immune to the added effects of damaging moves.", "src": "bp"},
  clearamulet: {"n": "Clear Amulet", "t": 3, "d": "Other Pokémon can't lower its stats.", "src": "bp"},
  mirrorherb: {"n": "Mirror Herb", "t": 2, "d": "When an opposing Pokémon's stats rise, it copies the rise (used up).", "src": "bp"},
  punchingglove: {"n": "Punching Glove", "t": 2, "d": "Its punching moves are 10% stronger and don't make contact.", "src": "bp"},
  loadeddice: {"n": "Loaded Dice", "t": 3, "d": "Its multi-strike moves always strike the most times they can, at 100% accuracy (double and triple strikes too: once the first strike lands, every strike does), Magnitude is always 10 and the moves like it (Eruption, Heat Crash, Low Kick, Electro Ball, Gyro Ball...) always hit for 150, Present is always its 120-power gift and never misses, and Psywave always does its most.", "src": "bp"},
  abilityshield: {"n": "Ability Shield", "t": 2, "d": "Its Ability can't be changed, suppressed or ignored (Mold Breaker).", "src": "bp"},
  terrainextender: {"n": "Terrain Extender", "t": 2, "d": "Terrains it sets last about 8 rounds instead of 5.", "src": "bp"},
  heatrock: {"n": "Heat Rock", "t": 1, "d": "Harsh sunlight it brings lasts about 8 rounds instead of 5. Castform holding it becomes Sunny Castform, with Drought.", "src": "bp"},
  damprock: {"n": "Damp Rock", "t": 1, "d": "Rain it brings lasts about 8 rounds instead of 5. Castform holding it becomes Rainy Castform, with Drizzle.", "src": "bp"},
  smoothrock: {"n": "Smooth Rock", "t": 1, "d": "A sandstorm it brings lasts about 8 rounds instead of 5.", "src": "bp"},
  icyrock: {"n": "Icy Rock", "t": 1, "d": "Hail or snow it brings lasts about 8 rounds instead of 5. Castform holding it becomes Snowy Castform, with Snow Warning.", "src": "bp"},
  shedshell: {"n": "Shed Shell", "t": 2, "d": "It can always be switched out, even when trapped.", "src": "bp"},
  floatstone: {"n": "Float Stone", "t": 1, "d": "Halves its weight.", "src": "bp"},
  ringtarget: {"n": "Ring Target", "t": 3, "d": "Its moves hit Pokémon that would otherwise be immune to them, by type or by Ability (Levitate, Lightning Rod, Volt Absorb, Flash Fire...), for ×1 damage; the Ability still does its part (Lightning Rod still draws the attack and raises Sp. Atk). Thunder Wave reaches Ground types. Item Clause: one per team.", "src": "bp"},
  stickybarb: {"n": "Sticky Barb", "t": 1, "d": "Hurts the holder by 1/8 of its max HP every turn; it sticks to an attacker without a held item that makes contact.", "src": "bp"},
  electricseed: {"n": "Electric Seed", "t": 1, "d": "In Electric Terrain: Defense +1 (used up).", "src": "bp"},
  grassyseed: {"n": "Grassy Seed", "t": 1, "d": "In Grassy Terrain: Defense +1 (used up).", "src": "bp"},
  mistyseed: {"n": "Misty Seed", "t": 1, "d": "In Misty Terrain: Sp. Def +1 (used up).", "src": "bp"},
  psychicseed: {"n": "Psychic Seed", "t": 1, "d": "In Psychic Terrain: Sp. Def +1 (used up).", "src": "bp"},
  mentalherb: {"n": "Mental Herb", "t": 1, "d": "Snaps it out of infatuation, Taunt, Disable or Heal Block once (used up).", "src": "bp"},
  whiteherb: {"n": "White Herb", "t": 1, "d": "Restores its lowered stats once (used up).", "src": "bp"},
  berserkgene: {"n": "Berserk Gene", "t": 2, "d": "When it enters battle: Attack +2, but it becomes confused (used up). Item Clause: one per team.", "src": "bp"},
  luckyegg: {"n": "Lucky Egg", "t": 3, "d": "Out of battle: the holder earns 50% more Exp. Points.", "src": "bp"},
  amuletcoin: {"n": "Amulet Coin", "t": 3, "d": "Out of battle: doubles the Poké Dollars your battles pay, while it's on your team.", "src": "bp"},
  quickpowder: {"n": "Quick Powder", "t": 3, "d": "Ditto only: Speed +2, even after it transforms.", "only": ["ditto"], "src": "bp"},
});
HELD.sitrusberry.berry = 1; HELD.lumberry.berry = 1; HELD.sitrusberry.healAt = .5; HELD.sitrusberry.heal = .25;
HELD.lumberry.cure = ["PAR", "SLP", "PSN", "TOX", "BRN", "FRZ", "CNF"];
HELD.sitrusberry.src = HELD.lumberry.src = "mart";
// generations 4 to 9: Booster Energy (the Paradox Pokémon's Abilities without sun or terrain), the legendary orbs and the Soul Dew
// (their own Pokémon's two types' moves +50%, like every type-boosting item), Ogerpon's masks (every move of the Ogerpon wearing it +20%)
Object.assign(HELD, {
  boosterenergy: { n: "Booster Energy", t: 3, src: "bp", paradox: 1, d: "A Paradox Pokémon (Protosynthesis or Quark Drive) holding it gets its Ability's boost without harsh sunlight or Electric Terrain: its highest stat +1 for as long as it holds it (never used up). Item Clause: one per team." },
  adamantorb: { n: "Adamant Orb", t: 2, src: "bp", only: ["dialga", "dialgaorigin"], types: ["Dragon", "Steel"], d: "Dialga's Dragon- and Steel-type moves are 50% stronger." },
  lustrousorb: { n: "Lustrous Orb", t: 2, src: "bp", only: ["palkia", "palkiaorigin"], types: ["Dragon", "Water"], d: "Palkia's Dragon- and Water-type moves are 50% stronger." },
  griseousorb: { n: "Griseous Orb", t: 2, src: "bp", only: ["giratina", "giratinaorigin"], types: ["Dragon", "Ghost"], d: "Giratina's Dragon- and Ghost-type moves are 50% stronger." },
  souldew: { n: "Soul Dew", t: 2, src: "bp", only: ["latias", "latios"], types: ["Dragon", "Psychic"], d: "Latias and Latios only: Sp. Atk and Sp. Def +1 (Generation 3's effect), and their Dragon- and Psychic-type moves are 50% stronger." },
  wellspringmask: { n: "Wellspring Mask", t: 2, src: "bp", only: ["ogerponwellspring"], types: "all", d: "Wellspring Mask Ogerpon's moves are 20% stronger." },
  hearthflamemask: { n: "Hearthflame Mask", t: 2, src: "bp", only: ["ogerponhearthflame"], types: "all", d: "Hearthflame Mask Ogerpon's moves are 20% stronger." },
  cornerstonemask: { n: "Cornerstone Mask", t: 2, src: "bp", only: ["ogerponcornerstone"], types: "all", d: "Cornerstone Mask Ogerpon's moves are 20% stronger." },
});
// Silvally's Memories (its RKS System takes the Memory's type, and so does its Multi-Attack); nothing else can use one
for (const t of ["Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"]) HELD[t.toLowerCase() + "memory"] = { n: `${t} Memory`, t: 2, memory: t, only: ["silvally"], src: "bp",
  d: `Silvally holding it becomes ${t} type, and so does its Multi-Attack. No effect on any other Pokémon.` };
const HELD_KEYS = Object.keys(HELD);
// each evolution item's text: what it evolves (the Linking Cord and the Soothe Bell stand for trading and friendship)
const evoItemName = k => (ITEMS[k] || HELD[k] || {}).n || k;
function evoItemText(k) {
  const who = OP_KEYS.filter(x => OPS[x].evo.some(e => e.item === k)).map(x => OPS[x].n), list = who.length > 1 ? who.slice(0, -1).join(", ") + " and " + who.at(-1) : who[0] || "";
  return k === "linkcord" ? `Evolves Pokémon that evolve by trading: ${list}.` : k === "soothebell" ? `Evolves Pokémon that evolve by friendship: ${list}.`
    : HELD[k] ? `${HELD[k].d} Also evolves ${list} (used up).` : `Evolves ${list}.`;
}
// the Item Clause: a team holds at most one of each of these (Choice items don't lock moves here)
const ITEM_CLAUSE = (TEAM_CONFIG.rules && TEAM_CONFIG.rules.itemClause) || [];   // (the team config's list: the Team Config page edits it)
// the first Item Clause item that two of these held items share (null if none)
const clauseClash = helds => { const seen = new Set(); for (const h of helds) { if (!ITEM_CLAUSE.includes(h)) continue; if (seen.has(h)) return h; seen.add(h); } return null; };
const heldIcon = k => { if (RES_DATA.item[k]) return pxIcon(RES_DATA.item[k]); const h = HELD[k]; const col = h && h.boost ? TC[h.boost] : h && h.t === 3 ? "#7a3fb8" : h && h.t === 2 ? "#3b7dd8" : "#c8a06a";
  return `<svg viewBox="0 0 24 24"><path d="M5 9h14l-2 12H7z" fill="${col}" stroke="${shade(col, -.5)}" stroke-width="1.3"/><path d="M8 9a4 4 0 0 1 8 0" stroke="${shade(col, -.5)}" stroke-width="1.6" fill="none"/><circle cx="12" cy="15" r="2.2" fill="#fff" opacity=".7"/></svg>`; };

// ---------- what a Pokémon knows ----------
// prog.mv = [S1, S2, S3] move keys (null: nothing in that slot yet). A Pokémon with no S1 struggles.
const SKILL_CACHE = {};
const skillFor = (k, slot) => SKILL_CACHE[k + slot] || (SKILL_CACHE[k + slot] = makeSkill(k, slot));
const slotOf = k => (MOVES[k] && MOVES[k].s) || 2;
function skillsFrom(mv) {
  const out = [];
  mv.forEach((k, i) => { if (k && MOVES[k]) out.push(skillFor(k, i + 1)); });
  if (!out.some(s => s.slot === 1)) out.unshift(skillFor("struggle", 1));
  return out;
}
const movesOf = (k, prog) => prog && prog.mv ? prog.mv : defaultMoves(k, prog ? prog.lvl : 100);
const skillsOf = (k, prog) => skillsFrom(movesOf(k, prog));
// level-up moves it has learned by this level (oldest first), and the ones it learns at exactly this level
const levelMoves = (k, lvl) => [...new Set(OPS[k].learn.filter(([l]) => l <= lvl).map(([, m]) => m))];
const movesAtLevel = (k, lvl) => OPS[k].learn.filter(([l]) => l === lvl).map(([, m]) => m);
const nextMoveLevel = (k, lvl) => (OPS[k].learn.find(([l]) => l > lvl) || [])[0] || null;
// TMs, HMs and TRs from every generation (TMS from a3a_dex.js: [id, generation, "TM01 (Gen 1)", move]; id = generation * 1000 +
// that generation's number, so TM01 (Gen 1) Mega Punch and TM01 (Gen 2) Dynamic Punch are different TMs)
const TM_MOVE = Object.fromEntries(TMS.map(t => [t[0], t[3]]));
// priority brackets (the owner's rule, 2026-10-19): the games' priority, +1 to +5, is 10% turn meter a point when a Pokémon comes in.
// A move's own (Grassy Glide +1, its bracket in Grassy Terrain), and the priority Abilities' and the Quick Claw's
const priBracket = M => !M ? 0 : M.sp === "grassyglide" ? 1 : Math.max(0, M.pri || 0);
const PRI_AB = { prankster: 1, triage: 3, "gale-wings": 1, "quick-draw": 1 };
const tmId = (move, gen) => (TMS.find(t => t[3] === move && (!gen || t[1] === gen)) || [])[0];   // a TM or HM by its move (and generation): a stage's reward tm

const TM_LABEL = Object.fromEntries(TMS.map(t => [t[0], t[2]]));
const tmName = n => TM_LABEL[n] || "TM";
const tmKind = n => (TM_LABEL[n] || "TM").slice(0, 2);   // TM, HM or TR
const canLearnTM = (k, n) => OPS[k].tms.includes(n);
// how good a move is for this Pokémon (default movesets, and the AI's and Demo's choices): attacks by expected power (type
// match, its better attacking stat, accuracy, strikes, added effects), status moves by what they do
const FIXED_V = { dragonrage: 55, sonicboom: 35, nightshade: 65, seismictoss: 65, psywave: 55, superfang: 80, endeavor: 45, finalgambit: 45, counter: 50,
  mirrorcoat: 50, metalburst: 55 };
// variable-power moves: a typical power
const VAR_P = { weight: 71, heavy: 71, gyroball: 71, electroball: 71, flail: 60, wringout: 71, hardpress: 71, ragefist: 100, storedpower: 100,
  eruption: 71, present: 45, spitup: 100, naturalgift: 80, fling: 40, trumpcard: 60, bide: 50 };
function moveValue(k, m) { const M = MOVES[m], v = moveValue0(k, m); return M && M.c === "X" && M.pri > 0 ? v * (1 + priBracket(M) / 15) : v; }   // (its turn meter on entry: +3, 30%, is ×1.2)
// a move's strikes (a 2-5-strike move: 3 on average, the engine's 2, 2, 2, 3, 3, 3, 4, 5), the most with Skill Link or Loaded Dice
// (ab, held: when they're known), and the chance an added effect (c, 0 to 1) comes at least once over n strikes: each strike rolls it
const strikesOf = (M, ab, held) => !M.hit ? 1 : M.hit[0] === M.hit[1] ? M.hit[0] : (ab && abilityOf(ab).id === "SKILL_LINK") || held === "loadeddice" ? M.hit[1] : 3;
const overStrikes = (c, n) => 1 - Math.pow(1 - Math.min(1, c), n);
function moveValue0(k, m) {
  const M = MOVES[m], op = OPS[k]; if (!M) return 0;
  const at = op.b[1], sa = op.b[3];
  if (M.c !== "X") {
    if (M.sp === "struggle") return 1;
    const hits = M.hit ? (M.hit[0] === M.hit[1] ? M.hit[0] : 3) : 1;
    let p = ((m === "dragonenergy" && 71) || FIXED_V[M.sp] || (M.sp === "ragefist" || M.sp === "storedpower" ? M.p + 50 : VAR_P[M.sp]) || M.p) * hits * (M.a ? M.a / 100 : 1.05);
    if (M.sp === "uturn") p *= 1.15;                                     // hits, then makes room for a better matchup
    if (M.sp === "fakeout") p *= 1.2;
    // this game's rules: the doubling moves grow over a battle, Triple Axel's strikes rise (20, 40, 60), Pursuit hits switchers for
    // double, Pollen Puff heals the partners, Skull Bash and Meteor Beam boost first; Fly and the like land a turn later; Snore only asleep
    const SP_MUL = { future: .85, skydrop: .9, belch: .5, upperhand: .45, bide: .4, spitup: .4, naturalgift: .7, fling: .6, synchronoise: .3, ramp: 2, tripleaxel: 2, pursuit: 1.2, pollenpuff: 1.2, semi: .95, snore: .15, fellstinger: 1.1, triattack: 1.05, secretpower: 1.07,
      throatchop: 1.05, psychicnoise: 1.05, flameburst: 1.05, smackdown: 1.05 };
    if (SP_MUL[M.sp]) p *= SP_MUL[M.sp];
    if (M.pre) p *= 1.1;
    if (["hex", "venoshock", "brine", "acrobatics", "wakeupslap", "assurance", "tantrum", "retaliate", "lashout", "smellingsalts", "fusion"].includes(M.sp)) p *= M.sp === "fusion" ? 1.05 : 1.2;
    if (["fissure", "horndrill", "guillotine", "sheercold"].includes(M.sp)) p = 45;
    if (M.sp === "selfdestruct" || M.sp === "explosion") p *= .3;
    if (["outrage", "thrash", "petaldance", "ragingfury"].includes(m)) p *= .92;   // (confused after it)
    if (M.sp === "belch" && op.types.includes("Poison")) p *= 2;   // (no Berry needed)
    if (M.dr < 0 || M.sp === "steelbeam") p *= .9; else if (M.dr > 0) p *= 1.1;
    if (!FIXED_V[M.sp]) {
      if (op.types.includes(M.t)) p *= 1.5; else if (M.sp === "hiddenpower") p *= 1.15;   // (Hidden Power: its own first type until an attack is used on it, then that attack's)
      // (Hidden Power, Tera Blast, Present and Photon Geyser hit with whichever of Attack and Sp. Atk is higher)
      p *= clamp(.55 + .45 * (["hiddenpower", "terablast", "present"].includes(M.sp) || m === "photongeyser" ? Math.max(at, sa) / Math.max(1, Math.min(at, sa)) : M.c === "P" ? at / Math.max(1, sa) : sa / Math.max(1, at)), .55, 1.25);
    }
    if (M.tg === "foes") p *= 1.15;
    if (M.ail && M.ac) p *= 1 + overStrikes(M.ac / 100, hits) / 4;   // (Twineedle: each strike can poison)
    if (M.fl) p *= 1 + overStrikes(M.fl / 100, hits) / 2.5;   // (a flinch: a lost turn, the owner's rule, 2026-10-19)
    if (priBracket(M)) p *= 1 + priBracket(M) / 15;   // (a priority move: 10% turn meter a point of priority whenever it's sent out)
    if (M.st && M.sw === "self" && M.st.some(([, n]) => n < 0)) p *= .85;   // Overheat, Superpower
    return p;
  }
  const acc = M.a ? M.a / 100 : 1;
  const SV = { SLP: 85, PAR: 65, BRN: 55, TOX: 60, PSN: 40, CNF: 45, INFAT: 30, SEED: 55, DISABLE: 30, TRAP: 25 };
  if (M.ail) return (SV[M.ail] || 30) * acc * (M.tg === "foes" ? 1.2 : 1) - (M.st ? 12 : 0);
  if (M.hl || M.sp === "recover" || M.sp === "softboiled") return 70;
  const SPV = { transform: 90, metronome: 55, splash: 2, rest: 50, reflect: 50, lightscreen: 50, substitute: 45, protect: 40, detect: 40, endure: 20,
    safeguard: 30, raindance: op.types.includes("Water") ? 55 : 25, sunnyday: op.types.includes("Fire") ? 55 : 25, sandstorm: 22, hail: op.types.includes("Ice") ? 45 : 22,
    snowscape: op.types.includes("Ice") ? 45 : 22, bellydrum: at > sa ? 75 : 10, psychup: 25, refresh: 25, aromatherapy: 30, haze: 30, mist: 20,
    focusenergy: 30, roar: 25, disable: 30, teleport: 20, batonpass: 30, spikes: 35, toxicspikes: 30, stealthrock: 45, defog: 15,
    roost: 70, synthesis: 65, wish: 55, aquaring: 30, ingrain: 30, lifedew: 40, healpulse: 40, painsplit: 40, healingwish: 20, memento: 25,
    tailwind: 45, auroraveil: 40, luckychant: 15, trickroom: op.b[5] < 60 ? 55 : 10, terrain: 30, yawn: 55, curse: op.types.includes("Ghost") ? 45 : 40,
    taunt: 30, gastroacid: 25, worryseed: 20, soak: 15, reflecttype: 10, conversion: 25, camouflage: 10, magnetrise: 25, meanlook: 15, destinybond: 30,
    lockon: 15, laserfocus: 25, acupressure: 35, powerswap: 15, guardswap: 15, speedswap: 15, roleplay: 15, skillswap: 15, trick: 20, helpinghand: 20,
    followme: 25, mirrormove: 30, copycat: 30, sleeptalk: 35, naturepower: 55, venomdrench: 20, rototiller: 20, magneticflux: 15, flowershield: 15,
    dragoncheer: 20, healblock: 15, strengthsap: at > sa ? 45 : 60, partingshot: 40, sketch: 50,
    afteryou: 5, allyswitch: 5, assist: 25, bestow: 5, conversion2: 30, courtchange: 15, craftyshield: 10, doodle: 5, electrify: 5, embargo: 10,
    encore: 30, entrainment: 5, fairylock: 5, foresight: 10, miracleeye: 10, addtype: 10, gravity: 15, grudge: 15, guardsplit: 15, powersplit: 15,
    heartswap: 15, imprison: 10, instruct: 15, iondeluge: 8, magiccoat: 25, magicroom: 10, wonderroom: 10, mimic: 15, mudsport: 10, watersport: 10,
    nightmare: 15, octolock: 25, perishsong: 15, powder: 15, powertrick: op.b[2] > op.b[1] + 30 ? 35 : 5, psychoshift: 20, purify: 15, quash: 10,
    recycle: 15, revivalblessing: 60, simplebeam: 5, snatch: 15, spite: 15, spotlight: 5, stockpile: 35, swallow: 40, telekinesis: 5, topsyturvy: 20,
    torment: 20, teatime: 5, matblock: 25, quickguard: 20, wideguard: 20, mefirst: 30, stickyweb: 35 };
  if (M.sp && SPV[M.sp] != null) return SPV[M.sp];
  if (M.st) {
    let v = 0;
    for (const [s, n] of M.st) {
      if (M.sw === "self") v += n * (s === "atk" ? (at >= sa ? 22 : 5) : s === "spa" ? (sa > at ? 22 : 5) : s === "spe" ? 16 : s === "eva" ? 14 : 10);
      else v += -n * (s === "atk" || s === "spa" ? 10 : s === "spe" || s === "acc" ? 9 : 8);
    }
    return v * acc * (M.sw === "foes" ? 1.3 : 1);
  }
  return 10;
}
// the best move of each slot among these
function bestMoves(k, pool) {
  const out = [null, null, null];
  for (const m of new Set(pool)) { if (!MOVES[m]) continue; const s = slotOf(m) - 1; if (!out[s] || moveValue(k, m) > moveValue(k, out[s])) out[s] = m; }
  return out;
}
// what a Pokémon knows when you meet it (wild, a Trainer's, a gift or a catch): its best level-up move for each slot by
// this level. Strong simulated Trainers also teach their Pokémon TMs (tms).
const DEF_MOVES = new Map();
function defaultMoves(k, lvl, tms) {
  const id = k + ":" + lvl + (tms ? "t" : "");
  if (!DEF_MOVES.has(id)) DEF_MOVES.set(id, bestMoves(k, [...levelMoves(k, lvl), ...(tms ? OPS[k].tms.map(n => TM_MOVE[n]).filter(Boolean) : [])]));
  return DEF_MOVES.get(id).slice();
}

// ---------- the Pokémon: Kanto to Unova ----------
const SUPPORTERS = new Set(["clefairy", "clefable", "jigglypuff", "wigglytuff", "chansey", "butterfree", "mrmime", "drowzee", "hypno", "exeggcute", "lapras", "parasect", "venomoth", "vileplume", "tangela"]);
function roleOf(d) {
  const [hp, at, df, sa, sd, sp] = d.b;
  if (SUPPORTERS.has(d.k)) return "Supporter";
  if ((df + sd + hp) / 3 >= Math.max(at, sa) && sp < 85) return "Defender";
  if (sp >= 100 && sp >= Math.max(at, sa)) return "Speedster";
  if (sa > at + 5) return "Attacker";
  return "All-Rounder";
}
const OPS = {};
const OP_KEYS = [];
const DEXN = {};
for (const d of DEX) {
  const op = { key: d.k, id: d.id, n: d.n, short: d.n, genus: d.g, types: d.t, el: d.t[0], b: d.b, rar: d.r, leg: !!d.leg, cls: roleOf(d),
    learn: d.ls, tms: d.tm, egg: d.eg || [], tutor: d.tu || [], ab: d.ab, abs: d.abs.map(([k, h]) => ({ k, h: !!h })), passives: [abilityOf(d.ab)], evo: d.evo || [], from: d.from || null,
    h: d.h, w: d.w, cr: d.cr, gr: d.gr, gen: d.gen || 1, myth: !!d.myth, form: d.form || null, bf: !!d.bf };
  // (a battle-only form, like Sunny Castform or Zen Darmanitan, is only what a Pokémon turns into in battle: never caught, owned or
  // in a team, so it isn't in OP_KEYS; a form with its own stats, like Wash Rotom, is a Pokémon of its own, but the Pokédex number
  // DEXN gives is its species')
  OPS[d.k] = op; if (!d.bf) OP_KEYS.push(d.k); if (!d.form) DEXN[d.id] = d.k;
}
// the National Pokédex: every species once (a form with its own stats is its own Pokémon, but shares its species' number)
const DEX_N = Object.keys(DEXN).length;
const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea"];   // (by generation: Sinnoh's has Hisui's too)
// the Legendary and Mythical Pokémon (forms included), and the restricted ones: the box legends and the Mythicals
const LEGENDS = OP_KEYS.filter(k => OPS[k].leg);
// the PvP limits' groups (the owner's rule: in every Stadium mode a team has at most the team config's number of each, rules.limits):
// Legendary, Mythical, Ultra Beast and Paradox (Koraidon and Miraidon count only as Legendary: the owner's rule)
const ULTRA_BEASTS = new Set(["nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon"]);
const PARADOX_MONS = new Set(["greattusk", "screamtail", "brutebonnet", "fluttermane", "slitherwing", "sandyshocks", "roaringmoon", "walkingwake", "gougingfire", "ragingbolt",
  "irontreads", "ironbundle", "ironhands", "ironjugulis", "ironmoth", "ironthorns", "ironvaliant", "ironleaves", "ironboulder", "ironcrown"]);
const PVP_GROUPS = { legendary: "Legendary", mythical: "Mythical", ultraBeast: "Ultra Beast", paradox: "Paradox" };
const pvpGroups = k => !OPS[k] ? [] : [OPS[k].leg && !OPS[k].myth ? "legendary" : null, OPS[k].myth ? "mythical" : null, ULTRA_BEASTS.has(k) ? "ultraBeast" : null, PARADOX_MONS.has(k) ? "paradox" : null].filter(Boolean);
// Kanto's 151, in their Kanto forms (the Alolan, Galarian, Hisuian and Paldean forms are their regions')
const kantoMon = k => OPS[k].gen === 1 && !OPS[k].form;
// Sketch (the owner's rule, 2026-10-15): S1, S2 and S3 Sketch (sketch1, sketch, sketch3, tools/build_data.py) each copy what an
// opposing Pokémon has in their slot, for good. A Pokémon that sketches (Smeargle) can end up with any move: Trainers' come already
// sketched (their builds pick from every move: learnPool, npcBuild)
const isSketch = m => !!MOVES[m] && MOVES[m].sp === "sketch";
const sketcher = k => !!OPS[k] && OPS[k].learn.some(([, m]) => isSketch(m));
let SKETCHABLE = null;
const sketchable = () => SKETCHABLE || (SKETCHABLE = Object.keys(MOVES).filter(m => !isSketch(m) && m !== "struggle" && MOVES[m].s));
// ---------- the regions (the owner's rule: a region's Pokémon are its generation's; a regional form is its region's: the Alolan
// forms Alola's, the Galarian ones Galar's, the Hisuian ones Sinnoh's, the Paldean ones Paldea's) ----------
const REGION_IDS = ["kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "alola", "galar", "paldea"];
const REGION_NAME = { kanto: "Kanto", johto: "Johto", hoenn: "Hoenn", sinnoh: "Sinnoh", unova: "Unova", kalos: "Kalos", alola: "Alola", galar: "Galar", paldea: "Paldea" };
// (Hisui's Pokémon are Sinnoh's, the owner's rule, 2026-10-16, as Hisui is Sinnoh long ago: the Hisuian forms, and Legends: Arceus's
// own species, Wyrdeer, Kleavor, Ursaluna (Bloodmoon Ursaluna too), Basculegion, Sneasler, Overqwil and Enamorus)
const FORM_GEN = { alola: 7, galar: 8, hisui: 4, paldea: 9 };
const HISUI_NEW = new Set(["wyrdeer", "kleavor", "ursaluna", "ursalunabloodmoon", "basculegion", "basculegionf", "sneasler", "overqwil", "enamorus", "enamorustherian"]);
const genOf = k => { const o = OPS[k]; if (!o) return 1; if (HISUI_NEW.has(k)) return 4; if (o.form) { const m = /(alola|galar|hisui|paldea)/.exec(k); if (m) return FORM_GEN[m[1]]; } return o.gen || 1; };
const regionOf = k => REGION_IDS[genOf(k) - 1];
// a Pokémon of more than one region (the owner's rules, 2026-10-16): Bloodmoon Ursaluna is Sinnoh's, with Hisui's, and Paldea's, from
// Kitakami; and a Pokémon a region's Journey gives you counts as that region's too (journeyGifts in a6_state.js fills these in). It
// counts as any of them wherever regions are checked (its Journeys, the Safari, gifts that wait, Trainers); regionOf, its own first
const MORE_GENS = { ursalunabloodmoon: [9] };
const gensOf = k => MORE_GENS[k] ? [genOf(k), ...MORE_GENS[k]] : [genOf(k)];
// a set of open regions as generation numbers: genOk(k, gens)
const genOk = (k, gens) => !gens || gensOf(k).some(g => gens.has(g));
const ALL_GENS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
// what it knows by Lv 100 (for sizing up a species: Trainers' team building, the Pokédex)
for (const k in OPS) OPS[k].skills = skillsOf(k, { lvl: 100 });
// every evolution item's text says what it evolves (held ones keep their battle effect first)
for (const k of [...STONES, ...EVO_HELD]) (ITEMS[k] || HELD[k]).d = evoItemText(k);
// final forms (nothing evolves from them any further) and whether a Pokémon can still evolve (for Eviolite)
const canEvolve = k => OPS[k].evo.length > 0;
const evoLine = k => { let b = k; while (OPS[b].from) b = OPS[b].from; const out = []; const walk = (x, d) => { out.push([x, d]); for (const e of OPS[x].evo) walk(e.to, d + 1); }; walk(b, 0); return out; };
const opLabel = op => op.n;
// Showdown sprites (embedded by build.sh) for menus and battle
const spriteURL = op => sprFront(op.key);
const headURL = op => sprFront(op.key);
