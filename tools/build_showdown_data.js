// PokeSquad Battler's data for Showdown's teambuilder (phase 2 of the Showdown server, the owner's pick, 2026-10-20).
// Reads the engine bundle (showdown/server/pokesquad/engine.js: run node tools/build_engine.js first) and Showdown's own dex (the
// server fork's dist: node build there) and writes the client fork's play.pokemonshowdown.com/pokesquad/data.js:
// PokeSquadData (every Pokémon the game has, by Showdown's ids; what each learns: learnPool, every way the game teaches a move;
// each move's slot, type, category, power, accuracy, priority and the game's own text; each Pokémon's Abilities (OPS[k].abs) and
// the game's Ability and held item texts; the Stadium's rules: modeRules("showdown")), then tools/showdown_data_loader.js, which
// waits for Showdown's data to load and lays this over it as the "gen9pokesquad" mod. Rerun after data changes.
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const ENGINE = path.join(ROOT, "showdown", "server", "pokesquad", "engine.js");
const DEX = path.join(ROOT, "showdown", "server", "dist", "sim", "dex.js");
const OUT = path.join(ROOT, "showdown", "client", "play.pokemonshowdown.com", "pokesquad", "data.js");
if (![ENGINE, DEX, path.dirname(path.dirname(OUT))].every(f => fs.existsSync(f))) {
  console.log("build_showdown_data: no Showdown forks checked out (showdown/server built, showdown/client): skipped");
  process.exit(0);
}
const { Dex } = require(DEX);
const toID = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// the engine, in a sandbox like the server's (server/pokesquad.ts)
const dummy = () => new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => "" : k === "length" ? 0 : dummy(), apply: () => dummy(), construct: () => dummy(), set: () => true });
const blank = () => new Proxy({}, { get: (t, k) => t[k] || (t[k] = {}) });
const c = { console, setTimeout, clearTimeout, setInterval, clearInterval, performance, Math, JSON, Date, URLSearchParams,
  document: dummy(), localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, navigator: { userAgent: "node" }, location: { search: "", href: "" },
  RES_DATA: blank(), SPR_DATA: blank(), Image() {}, Audio() {}, requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false, addEventListener() {} }) };
c.window = c; c.globalThis = c; c.self = c;
vm.createContext(c);
vm.runInContext(fs.readFileSync(ENGINE, "utf8"), c, { filename: "engine.js" });
const G = vm.runInContext(`(() => {
  const R = modeRules("showdown");
  const mons = OP_KEYS.filter(k => !OPS[k].bf).sort((a, b) => OPS[a].id - OPS[b].id || OP_KEYS.indexOf(a) - OP_KEYS.indexOf(b));
  return {
    mons: mons.map(k => ({ k, n: OPS[k].n, gen: OPS[k].gen, types: OPS[k].types, b: OPS[k].b, ab: OPS[k].ab, abs: OPS[k].abs, groups: pvpGroups(k), learn: [...new Set(learnPool(k))] })),
    moves: Object.keys(MOVES).map(k => { const M = MOVES[k], s = slotOf(k), sk = skillFor(k, s); return { k, n: M.n, s, cd: sk.cd, t: M.t, c: M.c, p: M.c === "X" ? 0 : M.sp === "ragefist" ? M.p : (sk.pow || M.p || 0), rage: M.sp === "ragefist" ? 1 : 0, a: M.a || 0, pri: M.pri || 0, d: sk.desc || "" }; }),
    abilities: [...new Set(mons.flatMap(k => OPS[k].abs.map(a => a.k)))].map(k => { const A = abilityOf(k); return { k, n: A.name, d: A.text || "", works: A.id !== "NONE" }; }),
    held: Object.keys(HELD).map(k => ({ k, n: HELD[k].n, d: HELD[k].d || "", src: HELD[k].src || "" })),
    ban: { pokemon: [...R.ban.pokemon], moves: [...R.ban.moves], items: [...R.ban.items], abilities: [...R.ban.abilities] }, limits: R.limits,
    cd: CD, iv: ivOf(6), level: 100, itemClause: [...ITEM_CLAUSE],
  };
})()`, c);

// Showdown's ids (the server knows each Pokémon by its Showdown name: server/pokesquad.ts)
const spId = k => { const sp = Dex.species.get(k); return sp.exists ? sp.id : null; };
// a move only PokeSquad has: Sketch, Copycat and Mirror Move in the other slots ("Sketch (S1)", id sketchs1; the server's moveKey reads it)
const SLOTTED = /^(sketch|copycat|mirrormove)([13])$/;
const mvId = k => Dex.moves.get(k).exists ? Dex.moves.get(k).id : SLOTTED.test(k) ? k.replace(SLOTTED, "$1s$2") : null;
const missing = [];
const moves = [], moveIx = {};
for (const m of G.moves) {
  const id = mvId(m.k); if (!id) { missing.push("move " + m.k); continue; }
  // the short text: the first sentence that says what the move does (not its priority's turn meter or its Mastery)
  const sent = m.d.split(/(?<=[.!?])(?<!\b(?:Sp|Lv|No|vs|St|Mt)\.)\s+(?=[A-Z])/).filter(Boolean);
  const short = sent.find(s => !/^(Priority [+-]\d|Mastery:)/.test(s)) || sent[0] || "";
  const sl = SLOTTED.exec(m.k);
  moveIx[m.k] = moves.length;
  // (rage: Stored Power, Rage, Punishment and Payback work like Rage Fist here, 50 power plus 50 a hit taken: the site's tooltip counts
  // the hits, from the turn meter's line, so their power is the base 50, not the one-hit 100 the game's AI counts on)
  moves.push([id, sl ? `${m.n} (S${m.s})` : 0, m.s, m.t, m.c, m.p, m.a, m.pri, short, m.d, sl ? sl[1] : 0, m.rage]);
}
const species = [], fix = {}, abil = {}, learn = {}, seen = new Set();
const AB_ID = a => toID(a);
for (const m of G.mons) {
  const id = spId(m.k);
  if (!id) { missing.push("species " + m.k); continue; }
  if (seen.has(id)) { missing.push("species twice " + m.k + "=" + id); continue; }
  seen.add(id);
  const sp = Dex.species.get(id);
  species.push([id, m.gen, m.groups.join(",")]);
  const f = {};
  const types = m.types.map(t => t[0].toUpperCase() + t.slice(1));
  if (types.join("/") !== sp.types.join("/")) f.types = types;
  const st = { hp: m.b[0], atk: m.b[1], def: m.b[2], spa: m.b[3], spd: m.b[4], spe: m.b[5] };
  if (Object.keys(st).some(s => st[s] !== sp.baseStats[s])) f.baseStats = st;
  if (Object.keys(f).length) fix[id] = f;
  // its Abilities, the game's default first; [id, hidden]
  const abs = m.abs.slice().sort((a, b) => (b.k === m.ab) - (a.k === m.ab) || a.h - b.h);
  abil[id] = abs.map(a => [AB_ID(a.k), a.h ? 1 : 0]);
  learn[id] = m.learn.filter(k => k in moveIx).map(k => moveIx[k].toString(36)).join(",");
}
const abText = G.abilities.map(a => [AB_ID(a.k), a.n, a.d, a.works ? 1 : 0]).filter(a => Dex.abilities.get(a[0]).exists);
// held items: the Berries, then the rest, by name (the ones Showdown has no item for, Lucky Egg and Amulet Coin, do nothing in a battle)
const items = G.held.map(h => [toID(h.k), h.n, h.d]).filter(h => Dex.items.get(h[0]).exists || !missing.push("item " + h[0]))
  .sort((a, b) => /berry$/.test(b[0]) - /berry$/.test(a[0]) || (a[1] < b[1] ? -1 : 1)).map(([id, , d]) => [id, d]);
const data = { v: new Date().toISOString().slice(0, 10), level: G.level, iv: G.iv, cd: G.cd, limits: G.limits, itemClause: G.itemClause.map(toID),
  ban: { pokemon: G.ban.pokemon.map(spId).filter(Boolean), moves: G.ban.moves.map(mvId).filter(Boolean), items: G.ban.items.map(toID), abilities: G.ban.abilities.map(AB_ID) },
  moves, species, fix, abil, learn, abText, items };
const head = "// PokeSquad Battler's data for Showdown's teambuilder: generated by tools/build_showdown_data.js in Mikale4/PokeSquadBattler. Never edit.\n";
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, head + "window.PokeSquadData = " + JSON.stringify(data) + ";\n" + fs.readFileSync(path.join(__dirname, "showdown_data_loader.js"), "utf8"));
console.log(`${species.length} Pokémon (${Object.keys(fix).length} with their own types or stats), ${moves.length} moves, ${abText.length} Abilities, ${items.length} held items`
  + ` -> ${path.relative(ROOT, OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)` + (missing.length ? `\nleft out: ${missing.join(", ")}` : ""));
