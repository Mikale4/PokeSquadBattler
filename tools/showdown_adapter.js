// =====================================================================
//  PokeSquad for Pokémon Showdown (the owner's pick, 2026-10-19: a real Showdown server running PokeSquad's own battles).
//  tools/build_engine.js puts this after the game's engine parts (src/, up to a7_engine.js) into one script that the Showdown
//  server fork loads into a sandbox (its server/pokesquad.ts). The battles are the game's own (makeBattle): this file only drives
//  them with Showdown's battle-stream commands (>player, >p1 move 1 2, >p2 switch 4, >p1 team 213456, >p1 default) and turns their
//  events into Showdown's battle protocol (|switch|, |move|, |-damage|...), so Showdown's own client can show them.
//  - Two players, three on the field each (Showdown's triples layout), one Pokémon acting at a time (the turn meter): a request
//    asks only for the Pokémon whose turn it is (the client passes for the others); the other player gets a wait request.
//  - The battle text is the game's own (each engine message as |-message|); Showdown's own lines go [silent], for the animations,
//    HP bars and status icons only.
//  - Lv 100, maximum IVs and Mastery, no Badge bonus; the Stadium's rules (validateTeam: the team config's limits, the Item Clause,
//    its bans), at most one move per slot (S1, S2, S3).
//  - Dice: each battle has its own (seeded from Showdown's seed), used only while its rules run.
//  - The turn meter (phase 3, 2026-10-20): |custom|-pokesquadmeter|<whose turn it is>|<each Pokémon on the field's meter, 0-100:
//    "p1a: Name=72;p2b: Name=30">|<who acts next, in order: "p1a: Name;p2a: Name"> (no order: the last one stands). The client
//    fork draws a meter bar under each HP bar and the order as icons. One when a Pokémon's turn starts, one after each action.
// =====================================================================
globalThis.PokeSquad = (() => {
  const LEVEL = 100;
  const toID = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  let SD = { name: k => OPS[k] ? OPS[k].n : k, key: s => OPS[toID(s)] ? toID(s) : null };   // (species names Showdown knows: set by the server, setNames)
  const setNames = f => { SD = f; };
  const ABK = {}; for (const k of Object.keys(OPS)) for (const a of OPS[k].abs) ABK[k + ":" + toID(a.k)] = a.k;
  const abKey = (k, s) => ABK[k + ":" + toID(s)] || ABK[k + ":" + toID(String(s).replace(/-/g, " "))] || null;
  // (Sketch, Copycat and Mirror Move in S1 and S3 are "Sketch (S1)"... in Showdown's teambuilder: tools/build_showdown_data.js)
  const moveKey = s => { const id = toID(s), slotted = id.replace(/^(sketch|copycat|mirrormove)s([13])$/, "$1$2");
    return MOVES[id] ? id : MOVES[slotted] ? slotted : /^hiddenpower/.test(id) && MOVES.hiddenpower ? "hiddenpower" : null; };
  const itemKey = s => { const id = toID(s); return HELD[id] ? id : null; };
  const sdMove = k => k.replace(/^(sketch|copycat|mirrormove)([13])$/, "$1s$2");   // (a move's id on the site)

  // ---------- team validation (the Stadium's rules) ----------
  const RULES = () => modeRules("showdown");
  // a Showdown team (its sets) as PokeSquad's: each move goes to its own slot; the problems, in plain words
  function readTeam(sets) {
    const out = [], problems = [], R = RULES();
    for (const set of sets || []) {
      const k = SD.key(set.species), nm = set.name || set.species;
      if (!k || !OPS[k] || OPS[k].bf) { problems.push(`${set.species} isn't a Pokémon PokeSquad Battler has.`); continue; }
      const m = { k, mv: [null, null, null], ab: OPS[k].ab, nat: "hardy", held: null };
      for (const mv of set.moves || []) {
        if (!mv) continue; const x = moveKey(mv);
        if (!x || !learnPool(k).includes(x)) { problems.push(`${nm} can't learn ${mv} in PokeSquad Battler.`); continue; }
        const s = MOVES[x].s; if (!s) { problems.push(`${mv} can't be used.`); continue; }
        if (m.mv[s - 1]) { problems.push(`${nm}: ${MOVES[m.mv[s - 1]].n} and ${MOVES[x].n} are both S${s} moves (one move per slot).`); continue; }
        if (R.ban.moves.has(x)) problems.push(`${MOVES[x].n} is banned.`);
        m.mv[s - 1] = x;
      }
      if (!m.mv[0]) problems.push(`${nm} needs an S1 move (one with no cooldown).`);
      if (set.ability) { const a = abKey(k, set.ability); if (!a) problems.push(`${nm} can't have ${set.ability}.`); else { m.ab = a; if (R.ban.abilities.has(a)) problems.push(`${set.ability} is banned.`); } }
      if (set.nature) { const n = toID(set.nature); if (NATURES[n]) m.nat = n; }
      if (set.item) {
        const h = itemKey(set.item);
        if (!h) problems.push(`${set.item} isn't a held item in PokeSquad Battler.`);
        else if (HELD[h].only && !HELD[h].only.includes(k)) problems.push(`${nm} can't hold ${HELD[h].n}.`);
        else { m.held = h; if (R.ban.items.has(h)) problems.push(`${HELD[h].n} is banned.`); }
      }
      if (R.ban.pokemon.has(k)) problems.push(`${OPS[k].n} is banned.`);
      out.push(m);
    }
    const keys = out.map(m => m.k);
    if (!out.length) problems.push("Your team is empty.");
    if (out.length > ROSTER) problems.push("Six Pokémon at most.");
    if (new Set(keys).size < keys.length) problems.push("The same Pokémon twice.");
    const g = pvpClash(keys, R.limits);
    if (g) problems.push(`Too many ${{ legendary: "Legendary Pokémon", mythical: "Mythical Pokémon", ultraBeast: "Ultra Beasts", paradox: "Paradox Pokémon" }[g] || g}: ${R.limits[g]} at most.`);
    for (const h of ITEM_CLAUSE) if (out.filter(m => m.held === h).length > 1) problems.push(`Item Clause: one ${HELD[h].n} per team.`);
    return { team: out, problems };
  }
  const validateTeam = sets => { const r = readTeam(sets); return r.problems.length ? r.problems : null; };
  // the format's rules as Showdown lists a format's clauses at the start of a battle (|rule|Name: what it does): the ones readTeam
  // checks and the battle keeps, in Showdown's words where it has the same rule (the owner's ask, 2026-10-20)
  const LIMIT_N = { legendary: ["Legendary Clause", "Legendary Pokémon"], mythical: ["Mythical Clause", "Mythical Pokémon"], ultraBeast: ["Ultra Beast Clause", "Ultra Beast"], paradox: ["Paradox Clause", "Paradox Pokémon"] };
  const RULE_LINES = () => {
    const R = RULES(), n = x => ["no", "one", "two", "three", "four", "five", "six"][x] || x, bans = Object.values(R.ban).reduce((a, b) => a + b.size, 0);
    return ["PokeSquad Battler: three on the field, the turn meter, S1/S2/S3 cooldowns, the house rules",
      "Species Clause: Limit one of each Pokémon",
      ...Object.entries(R.limits).map(([g, x]) => LIMIT_N[g] ? `${LIMIT_N[g][0]}: Limit ${n(x)} ${LIMIT_N[g][1]}${x > 1 && g === "ultraBeast" ? "s" : ""}` : `${g}: Limit ${n(x)}`),
      `Item Clause: Limit one each of ${[...ITEM_CLAUSE].map(h => HELD[h] ? HELD[h].n : h).join(", ")}`,
      "Move Slot Rule: One move for each slot, S1, S2 and S3, and an S1 move (one with no cooldown)",
      ...(bans ? [`Bans: ${[...R.ban.pokemon].map(k => OPS[k] ? OPS[k].n : k).concat([...R.ban.moves].map(k => MOVES[k] ? MOVES[k].n : k), [...R.ban.abilities], [...R.ban.items].map(h => HELD[h] ? HELD[h].n : h)).join(", ")}`] : []),
      "Adjust Level = 100: Every Pokémon is level 100, with top IVs and no Gym Badge bonus",
      `Endless Battle Clause: After ${STALEMATE_TURNS} Pokémon turns, the battle is a draw`,
      "HP Percentage Mod: HP is shown in percentages"];
  };
  const spec = m => ({ op: m.k, prog: { ...progForLV(m.k, LEVEL), pot: 6, sk: [MAX_SK, MAX_SK, MAX_SK], mv: m.mv.slice(), ab: m.ab, nat: m.nat, held: m.held || null }, mine: false, badges: 0 });

  // ---------- Showdown's names for things ----------
  const SIDE = { A: "p1", E: "p2" }, TEAM = { p1: "A", p2: "E" }, POS = "abc";
  const STAT = { atk: "atk", def: "def", spa: "spa", sdf: "spd", spe: "spe", acc: "accuracy", eva: "evasion" };
  const STATUS = { BRN: "brn", PSN: "psn", TOX: "tox", PAR: "par", SLP: "slp", FRZ: "frz" };
  const WEATHER_ID = { sun: "SunnyDay", rain: "RainDance", sand: "Sandstorm", hail: "Hail", snow: "Snowscape" };
  const TERRAIN_NAME = { electric: "Electric Terrain", grassy: "Grassy Terrain", misty: "Misty Terrain", psychic: "Psychic Terrain" };
  const HZ = { sr: "Stealth Rock", spikes: "Spikes", tspikes: "Toxic Spikes", web: "Sticky Web" };
  // a Pokémon's effects as Showdown's volatiles (the badges on its HP bar: "Confused", "Leech Seed", "Drowsy"...; the owner's ask,
  // 2026-10-20), by the names Showdown's client knows them by; Protect is its bubble too; the Perish count by the turns left
  const VOL = { CNF: "confusion", INFAT: "Attract", SEED: "Leech Seed", TRAP: "Bind", TAUNT: "Taunt", ENCORE: "Encore", DISABLE: "Disable",
    HEALBLOCK: "Heal Block", TORMENT: "Torment", EMBARGO: "Embargo", YAWN: "Yawn", CURSE: "Curse", NIGHTMARE: "Nightmare", INGRAIN: "Ingrain",
    AQUARING: "Aqua Ring", MAGNETRISE: "Magnet Rise", SMACKDOWN: "Smack Down", FOCUS: "Focus Energy", CHARGE: "Charge", FLASHFIRE: "Flash Fire",
    IMPRISON: "Imprison", TELEKINESIS: "Telekinesis", OCTOLOCK: "Octolock", SALTCURE: "Salt Cure", POWDER: "Powder", ELECTRIFY: "Electrify",
    LASER: "Laser Focus", FOLLOWME: "Follow Me", MAGICCOAT: "Magic Coat", SNATCH: "Snatch", GRUDGE: "Grudge", DBOND: "Destiny Bond",
    ENDURE: "Endure", BIDE: "Bide", THROAT: "Throat Chop", HELPED: "Helping Hand", SUB: "Substitute", PROTECT: "Protect" };
  const volOf = e => e.id === "PERISH" ? `perish${Math.max(0, Math.min(3, e.turns))}` : VOL[e.id] || null;
  // the effects on a side (B.side: the turn each ends; B.tailwind) and on the whole field (Trick Room goes with the terrain: syncField)
  const SIDE_FX = { REFLECT: "Reflect", LSCREEN: "Light Screen", VEIL: "Aurora Veil", SAFEGUARD: "Safeguard", LUCKY: "Lucky Chant", MIST: "Mist" };
  const ROOMS = { gravity: "Gravity", wonderRoom: "Wonder Room", magicRoom: "Magic Room" };
  const TARGET = { enemy: "any", aoe_enemies: "allAdjacentFoes", self: "self", team: "allies", partners: "allies", field: "all", ally_single: "adjacentAlly" };
  // Showdown narrates these itself from its own lines: the game's message for them is left out (its line goes unsilenced instead)
  const OWN_TEXT = /^(.+) used (.+)!$|^(.+) fainted!$/;
  // the lines about a hit that Showdown writes before its damage
  const HIT_TEXT = /^(It's (super|not very) effective|A critical hit|It's a one-hit KO)/;
  // the game's battle text, told from one player's side (the engine writes each Pokémon and team as a token: TEXT_TOKENS)
  function tell(B, text, viewer, names) {
    const me = TEAM[viewer];
    return String(text)
      .replace(/\u0001(\d+)([\u0002\u0003])/g, (_, id, c) => { const u = B.byId(+id); if (!u) return "it"; const o = u.team !== me ? (c === "\u0003" ? "The opposing " : "the opposing ") : ""; return o + u.n; })
      .replace(/\u0004([AE])\u0005/g, (_, t) => t === me ? "your team" : "the opposing team")
      .replace(/\u0006([AE])\u0007/g, (_, t) => t === me ? "You" : names[t]);
  }

  // ---------- a battle ----------
  class Battle {
    constructor(options) {
      this.send = options.send; this.format = options.formatid; this.inputLog = [`>start ${JSON.stringify({ formatid: options.formatid, seed: options.seed })}`];
      this.seed = options.seed || [1, 2, 3, 4];
      this.dice = seeded((this.seed.reduce ? this.seed.reduce((a, b) => (a * 31 + (+b || 0)) >>> 0, 7) : +this.seed) || 1);
      this.players = { p1: null, p2: null }; this.sides = [{ id: "p1", requestState: "" }, { id: "p2", requestState: "" }];
      this.lines = []; this.log = []; this.B = null; this.round = 0; this.ended = false; this.prngSeed = this.seed;
      this.prng = { getSeed: () => this.seed };
      this.lastSt = {}; this.shown = {}; this.posOf = {};
    }
    // (Showdown's battle-stream calls)
    setPlayer(slot, o) {
      this.inputLog.push(`>player ${slot} ${JSON.stringify({ name: o.name, avatar: o.avatar, team: o.team })}`);
      const sets = typeof o.team === "string" ? (globalThis.PS_UNPACK ? PS_UNPACK(o.team) : []) : o.team || [];
      const t = readTeam(sets);
      this.players[slot] = { name: o.name || slot, avatar: o.avatar || "", team: t.team, order: null };
      this.add(`|player|${slot}|${o.name || slot}|${o.avatar || ""}|${o.rating || ""}`);
      if (this.players.p1 && this.players.p2 && !this.previewed) this.preview();
    }
    preview() {
      this.previewed = true;
      this.add("|gametype|triples", "|gen|9", "|tier|[Gen 9] PokeSquad", ...RULE_LINES().map(r => `|rule|${r}`),
        `|teamsize|p1|${this.players.p1.team.length}`, `|teamsize|p2|${this.players.p2.team.length}`, "|clearpoke");
      for (const s of ["p1", "p2"]) for (const m of this.players[s].team) this.add(`|poke|${s}|${SD.name(m.k)}|${m.held ? "item" : ""}`);
      this.add("|teampreview|6");
      for (const s of ["p1", "p2"]) this.request(s, { teamPreview: true, maxChosenTeamSize: this.players[s].team.length, side: this.sideInfo(s) });
    }
    choose(slot, choice) {
      this.inputLog.push(`>${slot} ${choice}`);
      const p = this.players[slot]; if (!p || this.ended) return false;
      const c = String(choice).trim();
      if (!this.B) {   // the team preview: the order (Showdown's "team 213456")
        const m = c.match(/^team\s+([\d,\s]+)/) || (c === "default" ? ["", p.team.map((_, i) => i + 1).join("")] : null);
        if (!m) return this.err(slot, "Choose your team order first");
        const ids = [...m[1].replace(/[\s,]/g, "")].map(d => +d - 1).filter(i => i >= 0 && i < p.team.length);
        p.order = [...new Set([...ids, ...p.team.map((_, i) => i)])];
        this.sides[+slot.slice(1) - 1].requestState = "";
        if (this.players.p1.order && this.players.p2.order) this.begin();
        else this.request(slot, { wait: true, side: this.sideInfo(slot) });
        return true;
      }
      const B = this.B, team = TEAM[slot];
      if (B.needPick != null && (B.needTeam || "A") === team) {   // a pick after a faint or a pivot move
        let uid = null;
        const sw = c.split(",").map(x => x.trim()).find(x => /^switch\s+\d+/.test(x));
        if (sw) { const x = this.order(team)[+sw.split(/\s+/)[1] - 1]; if (x && B.benchOf(team).includes(x)) uid = x.uid; }
        else if (c !== "default") return this.err(slot, "Choose who comes in");
        if (uid == null) { const x = this.run(() => B.aiReplacement(team)); uid = x ? x.uid : null; }
        this.run(() => B.replace(uid)); this.go(); return true;
      }
      const u = B.waiting;
      if (!u || u.team !== team) return this.err(slot, "It isn't your turn");
      const mine = c.split(",").map(x => x.trim()).filter(x => x && x !== "pass");
      const pick = mine[0] || "default";
      let done = false;
      if (pick === "default") { const ch = this.ai(u); if (ch.sw) done = this.run(() => B.playerSwitch(ch.sw)); if (!done) this.run(() => B.playerAct(ch.slot || 1, ch.t != null ? B.byId(ch.t) : null)); done = true; }
      else if (/^switch\s+\d+/.test(pick)) {
        const x = this.order(team)[+pick.split(/\s+/)[1] - 1];
        if (!x || !B.benchOf(team).includes(x)) return this.err(slot, "That Pokémon can't come in");
        if (!B.canSwitch(u)) return this.err(slot, `${u.n} can't be switched out`);
        done = this.run(() => B.playerSwitch(x.uid));
        if (!done) return this.err(slot, "That switch isn't possible");
      } else if (/^move\s+/.test(pick)) {
        const [, a, b] = pick.split(/\s+/), skills = u.skills.slice().sort((x, y) => x.slot - y.slot);
        const sk = /^\d+$/.test(a) ? skills[+a - 1] : skills.find(s => toID(s.name) === toID(a) || s.key === toID(a) || sdMove(s.key) === toID(a));
        if (!sk) return this.err(slot, "That move isn't there");
        if (!B.usable(u, sk.slot)) return this.err(slot, `${sk.name} isn't ready yet`);
        const loc = +b, foe = team === "A" ? "E" : "A";
        const t = loc > 0 ? B.units.find(x => x.team === foe && x.slot === loc - 1 && x.alive) : loc < 0 ? B.units.find(x => x.team === team && x.slot === -loc - 1 && x.alive) : null;
        this.run(() => B.playerAct(sk.slot, t || null)); done = true;
      } else return this.err(slot, "Choose a move or a switch");
      this.go(); return done;
    }
    undoChoice(slot) { this.err(slot, "Can't undo: a choice is played at once"); }
    win(slot) { this.finish(slot ? this.players[slot] && this.players[slot].name : null); }
    lose(slot) { this.finish(slot === "p1" ? this.players.p2 && this.players.p2.name : this.players.p1 && this.players.p1.name); }
    tiebreak() { this.finish(null); }
    resetRNG() {}
    showOpenTeamSheets() {}
    // (the room's battle stream lets go of the battle as the room closes, Showdown's battle.destroy(): nothing is sent after it)
    destroy() { this.ended = true; this.B = null; this.lines = []; this.send = () => {}; }
    add(...lines) { for (const l of lines) { this.lines.push(l); this.log.push(l); } }
    getDebugLog() { return this.log.join("\n"); }
    sendUpdates() { if (this.lines.length) { this.send("update", this.lines); this.lines = []; } }
    err(slot, text) { this.send("sideupdate", `${slot}\n|error|[Invalid choice] ${text}`); return false; }
    request(slot, r) { this.sides[+slot.slice(1) - 1].requestState = r.wait ? "wait" : r.teamPreview ? "teampreview" : r.forceSwitch ? "switch" : "move"; this.send("sideupdate", `${slot}\n|request|${JSON.stringify(r)}`); }
    ai(u) { const prev = R; R = Math.random; try { return this.B.aiChoice(u); } finally { R = prev; } }   // (the timer ran out: the AI's choice, on its own random numbers)
    // the battle's rules run on its own dice
    run(f) { const prev = R; R = this.dice; try { return f(); } finally { R = prev; } }

    // ---------- the battle itself ----------
    begin() {
      const t = s => this.players[s].order.map(i => this.players[s].team[i]).map(spec);
      this.run(() => { UID = 0; this.B = makeBattle({ allies: t("p1"), waves: [t("p2")], auto: false, pick: true, humans: ["E"], sim: true, aiStyle: "balanced", enemyStyle: "balanced", trainer: this.players.p2.name }); });
      this.add("|start");
      // (the leads come onto the field, as in Showdown: player 1's, then player 2's)
      for (const t of ["A", "E"]) for (const u of this.B.units.filter(x => x.team === t).sort((a, b) => a.slot - b.slot)) { this.placed(u, u.slot); this.hp(u, c => `|switch|${this.ident(u)}|${this.details(u)}|${c}`); this.shown[u.uid] = 1; }
      this.go();
    }
    // play on until someone has to choose (or it's over), turning the events into Showdown's lines
    go() {
      const B = this.B;
      for (let n = 0; n < 5000; n++) {
        this.flushEvents();
        if (B.over) return this.over();
        const r = this.run(() => B.step());
        this.flushEvents();
        if (B.over) return this.over();
        if (r === "replace") { const team = B.needTeam || "A", s = SIDE[team], other = s === "p1" ? "p2" : "p1";
          this.request(s, { forceSwitch: [0, 1, 2].map(i => i === B.needPick), side: this.sideInfo(s) }); this.request(other, { wait: true, side: this.sideInfo(other) }); return; }
        if (r === "input") { const u = B.waiting, s = SIDE[u.team], other = s === "p1" ? "p2" : "p1";
          this.request(s, { active: [0, 1, 2].map(i => i === u.slot ? this.activeInfo(u) : null), side: this.sideInfo(s) }); this.request(other, { wait: true, side: this.sideInfo(other) }); return; }
      }
    }
    over() {
      if (this.ended) return; const res = this.B.result || {};
      this.finish(res.stalemate || res.timeUp ? null : res.win ? this.players.p1.name : this.players.p2.name);
    }
    finish(winner) {
      if (this.ended) return; this.ended = true;
      this.add(winner ? `|win|${winner}` : "|tie");
      this.sendUpdates();
      const alive = t => this.B ? [...this.B.units, ...this.B.bench[t]].filter(u => u.team === t && u.alive).length : 0;
      this.send("end", JSON.stringify({ winner: winner || "", seed: this.seed, turns: this.round, p1: this.players.p1 && this.players.p1.name, p2: this.players.p2 && this.players.p2.name,
        score: [alive("A"), alive("E")], inputLog: this.inputLog, log: this.log }));
    }
    // (Showdown's names: a Pokémon on the field is p1a/p1b/p1c by its place, one on the bench just p1)
    // (a Pokémon's place is where Showdown last saw it come in, until it's told it left: a move's lines are written once the move is
    // over, and Dragon Tail, Roar or a Red Card may have taken its target off the field by then)
    ident(u) { const p = this.posOf[u.uid] || (u.slot >= 0 && this.B.units.includes(u) ? POS[u.slot] : ""); return `${SIDE[u.team]}${p}: ${u.n}`; }
    placed(u, slot) { for (const id in this.posOf) { const x = this.B.byId(+id); if (x && x !== u && x.team === u.team && this.posOf[id] === POS[slot]) delete this.posOf[id]; } this.posOf[u.uid] = POS[slot]; }
    details(u) { return SD.name(u.spr || u.key) + (u.lvl !== 100 ? `, L${u.lvl}` : ""); }
    // (hp: what it had at that moment, an event's own: a line written later in the same update mustn't show what came after it, so
    // Stealth Rock as a Pokémon comes in shows its damage)
    cond(u, hp = u.alive ? u.hp : 0) { return hp > 0 ? `${hp}/${u.max.hp}${u.status && STATUS[u.status] ? " " + STATUS[u.status] : ""}` : "0 fnt"; }
    // (as a percentage, the way Showdown shows the other side's Pokémon: rounded up, 99 until it's full)
    condPub(u, hp = u.alive ? u.hp : 0) { if (hp <= 0) return "0 fnt"; let p = Math.ceil(100 * hp / u.max.hp); if (p >= 100 && hp < u.max.hp) p = 99; return `${Math.max(1, p)}/100${u.status && STATUS[u.status] ? " " + STATUS[u.status] : ""}`; }
    // a line with a Pokémon's HP: exact for its own player (and the full log), a percentage for the other player and spectators
    // (Showdown's |split|, its HP Percentage Mod)
    hp(u, line, hp) { this.add(`|split|${SIDE[u.team]}`, line(this.cond(u, hp)), line(this.condPub(u, hp))); }
    order(team) { const B = this.B; return [...[0, 1, 2].map(i => B.units.find(x => x.team === team && x.slot === i)).filter(Boolean), ...B.bench[team]]; }
    sideInfo(slot) {
      const p = this.players[slot];
      // (before the battle: the game's Lv 100 stats, as the battle will have them: the Pokémon's IVs, its nature, no Badges)
      const pre = m => { const st = calcStats(m.k, LEVEL, spec(m).prog.pot, m.nat); return { hp: st.hp, stats: { atk: st.atk, def: st.def, spa: st.spa, spd: st.sdf, spe: st.spe } }; };
      if (!this.B) return { name: p.name, id: slot, pokemon: p.team.map(m => ({ ident: `${slot}: ${OPS[m.k].n}`, details: SD.name(m.k), condition: `${pre(m).hp}/${pre(m).hp}`, active: false, stats: pre(m).stats,
        moves: m.mv.filter(Boolean).map(sdMove), baseAbility: toID(m.ab), item: m.held || "", pokeball: "pokeball", ability: toID(m.ab) })) };
      return { name: p.name, id: slot, pokemon: this.order(TEAM[slot]).map(u => ({ ident: this.ident(u), details: this.details(u), condition: this.cond(u), active: this.B.units.includes(u),
        stats: { atk: u.max.atk, def: u.max.def, spa: u.max.spa, spd: u.max.sdf, spe: u.max.spe }, moves: u.skills.map(s => sdMove(s.key)), baseAbility: toID(u.passives[0] && u.passives[0].key),
        item: u.held && !u.flags.itemUsed ? u.held : "", pokeball: "pokeball", ability: toID(u.passives[0] && u.passives[0].key),
        pokesquadCooldowns: Object.fromEntries(this.cooldowns(u).split(",").map(x => x.split(":")).map(([m, n]) => [m, +n])) })) };
    }
    activeInfo(u) {
      const B = this.B, skills = u.skills.slice().sort((x, y) => x.slot - y.slot);
      // (slot and cooldown: the site's move buttons show them where Showdown shows PP)
      return { moves: skills.map(s => ({ move: sdMove(s.key) !== s.key ? `${s.name} (S${s.slot})` : s.name, id: sdMove(s.key), slot: s.slot, cooldown: s.slot > 1 ? Math.max(0, u.cool[s.slot] || 0) : 0,
        pp: B.usable(u, s.slot) ? 1 : 0, maxpp: 1,
        target: TARGET[s.target] || "normal", disabled: !B.usable(u, s.slot) })), trapped: !B.canSwitch(u) };
    }
    // our events as Showdown's lines (silent: the text is the game's own, each message as |-message|)
    flushEvents() {
      const B = this.B; if (!B || !B.ev.length) return;
      const evs = B.ev.splice(0), U = id => B.byId(id);
      // (an attack's damage lines wait for its "It's super effective!" and "A critical hit!" lines, as on Showdown, where the
      // damage comes after them: its "(... lost 45% of its health!)")
      let pend = []; const flush = () => { if (pend.length) { this.add(...pend); pend = []; } };
      for (const e of evs) {
        const u = e.u != null ? U(e.u) : null;
        if (pend.length && e.k !== "msg" && !(e.k === "dmg" && !e.dot && !e.sub) && e.k !== "fx" && e.k !== "status") flush();
        switch (e.k) {
          case "msg": {   // (player 2 gets its own copy, told from its side: Showdown's |split|; spectators read player 1's)
            if (!e.t) break;
            const names = { A: this.players.p1.name, E: this.players.p2.name }, a = tell(B, e.t, "p1", names), b = tell(B, e.t, "p2", names);
            if (!HIT_TEXT.test(a)) flush();
            if (OWN_TEXT.test(a)) break;
            if (a === b) this.add(`|-message|${a}`); else this.add("|split|p2", `|-message|${b}`, `|-message|${a}`);
            break;
          }
          case "turn": { if (e.rd && e.rd !== this.round) { this.round = e.rd; this.add(`|turn|${e.rd}`); }
            if (u && e.tms) this.add(this.meterLine(u, e.tms.map(([id, v]) => [U(id), v]))); break; }
          case "act": { if (!u) break; const t = e.t != null ? U(e.t) : null; this.add(`|move|${this.ident(u)}|${MOVES[e.key] ? MOVES[e.key].n : e.name}|${t && t !== u ? this.ident(t) : ""}`); break; }
          case "dmg": if (u) {
            // an attack's damage says how much it took (Showdown's text); poison, recoil, hazards... keep only the game's own line
            if (!e.dot && !e.sub && e.n > 0) { const id = this.ident(u); if (e.crit) pend.push(`|-crit|${id}|[silent]`); pend.push(`|split|${SIDE[u.team]}`, `|-damage|${id}|${this.cond(u, e.hp)}`, `|-damage|${id}|${this.condPub(u, e.hp)}`); }
            else this.hp(u, c => `|-damage|${this.ident(u)}|${c}|[silent]`, e.hp);
          } break;
          case "heal": case "revive": if (u) this.hp(u, c => `|-heal|${this.ident(u)}|${c}|[silent]`, e.hp); break;
          case "death": if (u) { this.add(`|faint|${this.ident(u)}`); delete this.shown[u.uid]; delete this.posOf[u.uid]; } break;
          case "recall": if (u) { delete this.shown[u.uid]; delete this.posOf[u.uid]; } break;
          case "sendin": if (u) { this.placed(u, e.slot != null ? e.slot : u.slot); this.hp(u, c => `|switch|${this.ident(u)}|${this.details(u)}|${c}`, e.hp); this.lastSt[u.uid] = { st: u.status || null, stages: {} }; this.shown[u.uid] = 1; } break;   // (Showdown clears a Pokémon's boosts as it comes in)   // (Showdown says "Go!" from each side)
          case "status": case "fx": if (u) this.syncStatus(u); break;
          case "transform": if (u) this.hp(u, c => `|-formechange|${this.ident(u)}|${SD.name(e.to || u.spr)}|${c}|[silent]`); break;
          case "weather": this.add(`|-weather|${WEATHER_ID[e.w] || "none"}|[silent]`); break;
          case "terrain": this.syncField(e); break;
          case "side": this.syncHazards(e); break;
        }
      }
      flush();
      for (const u of B.units) if (u.alive) this.syncStatus(u);   // (a fixed stage changes with the weather, the terrain, an item...)
      this.syncSides(); this.syncItems();
      if (!B.over) this.add(this.meterLine(B.waiting || null, B.units.filter(x => x.alive).map(x => [x, x.atb]), B.predictOrder(6).map(U)));
    }
    // (the screens, Tailwind and the rooms, as Showdown draws them: the battle text already says when each starts and ends)
    syncSides() {
      const B = this.B, on = {}, was = this.fxOn || {};
      for (const t of ["A", "E"]) {
        const side = `${SIDE[t]}: ${this.players[SIDE[t]].name}`;
        for (const id in SIDE_FX) if (B.side && B.side[t] && B.side[t][id] > B.turn) on[`${side}|move: ${SIDE_FX[id]}`] = "side";
        if (B.tailwind && B.tailwind[t] > B.turn) on[`${side}|move: Tailwind`] = "side";
      }
      for (const k in ROOMS) if (B[k] > B.turn) on[`move: ${ROOMS[k]}`] = "field";
      for (const k in on) if (!was[k]) this.add(`|-${on[k]}start|${k}|[silent]`);
      for (const k in was) if (!on[k]) this.add(`|-${was[k]}end|${k}|[silent]`);
      this.fxOn = on;
    }
    // (a held item used up, or one that changed hands: Showdown shows it gone, or the new one)
    syncItems() {
      const items = this.items || (this.items = {});
      for (const u of this.B.units) {
        if (!u.alive) continue;
        const now = u.held && !u.flags.itemUsed ? u.held : "", was = items[u.uid];
        if (was === undefined) { items[u.uid] = now; continue; }
        if (now === was) continue;
        if (was && HELD[was]) this.add(`|-enditem|${this.ident(u)}|${HELD[was].n}|[silent]`);
        if (now && HELD[now]) this.add(`|-item|${this.ident(u)}|${HELD[now].n}|[silent]`);
        items[u.uid] = now;
      }
    }
    // (each move's cooldown, the turns of its own until it's ready: "trickroom:2,glaciallance:0"; S1 moves have none)
    cooldowns(u) { return u.skills.map(s => `${sdMove(s.key)}:${s.slot > 1 ? Math.max(0, u.cool[s.slot] || 0) : 0}`).join(","); }
    meterLine(actor, meters, order) {
      const id = u => u && this.B.units.includes(u) ? this.ident(u) : "";
      // (each Pokémon on the field: ident=meter=its cooldowns, so the site's tooltips show cooldowns where Showdown shows PP)
      return `|custom|-pokesquadmeter|${id(actor)}|${meters.filter(([u]) => id(u)).map(([u, v]) => `${id(u)}=${Math.round(v)}=${this.cooldowns(u)}`).join(";")}`
        + (order ? `|${order.map(id).filter(Boolean).join(";")}` : "");
    }
    syncStatus(u) {
      if (!this.shown[u.uid]) return;   // (not before Showdown has it on the field: its switch-in line comes first)
      // (the stat badge: the stages moves made plus the ones fixed to an item, an Ability, the weather or a status, as the game shows them)
      // (its effects as Showdown's volatiles: the badges on its HP bar, Protect's bubble, a Substitute's doll: VOL)
      const id = this.ident(u), was = this.lastSt[u.uid] || { st: null, stages: {} }, now = { st: u.status || null, stages: this.B.shownStages(u), vol: [...new Set(u.eff.map(volOf).filter(Boolean))] };
      for (const v of was.vol || []) if (!now.vol.includes(v)) this.add(`|-end|${id}|${v}|[silent]`);
      for (const v of now.vol) if (!(was.vol || []).includes(v)) this.add(`|-start|${id}|${v}|[silent]`);
      if (now.st !== was.st) this.add(now.st ? `|-status|${id}|${STATUS[now.st] || now.st.toLowerCase()}|[silent]` : `|-curestatus|${id}|${STATUS[was.st] || ""}|[silent]`);
      for (const k in STAT) { const d = (now.stages[k] || 0) - (was.stages[k] || 0); if (d) this.add(`|-${d > 0 ? "boost" : "unboost"}|${id}|${STAT[k]}|${Math.abs(d)}|[silent]`); }
      this.lastSt[u.uid] = now;
    }
    syncField(e) {
      const ter = e.t ? TERRAIN_NAME[e.t] : null, tr = !!e.tr;
      if (ter !== this.ter) { if (this.ter) this.add(`|-fieldend|move: ${this.ter}|[silent]`); if (ter) this.add(`|-fieldstart|move: ${ter}|[silent]`); this.ter = ter; }
      if (tr !== !!this.tr) { this.add(tr ? "|-fieldstart|move: Trick Room|[silent]" : "|-fieldend|move: Trick Room|[silent]"); this.tr = tr; }
    }
    syncHazards(e) {
      const s = SIDE[e.team], was = (this.hz || (this.hz = {}))[s] || {}, now = e.hz || {}, side = `${s}: ${this.players[s].name}`;
      for (const k in HZ) {
        const a = +(was[k] || 0), b = +(now[k] || 0);
        for (let i = a; i < b; i++) this.add(`|-sidestart|${side}|move: ${HZ[k]}|[silent]`);
        if (b === 0 && a > 0) this.add(`|-sideend|${side}|move: ${HZ[k]}|[silent]`);
      }
      this.hz[s] = { ...now };
    }
  }
  return { Battle, validateTeam, readTeam, setNames, toID };
})();
