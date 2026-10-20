// Pokémon Showdown's learnsets, trimmed, for tools/build_data.py (the owner's picks, 2026-10-20: fill the level-up and TM moves
// PokeAPI misses, and add every game's egg and move-tutor moves). Reads the Showdown server fork's built data (showdown/server,
// Mikale4/PokeSquad-Showdown: node build there first) and writes tools/showdown_learnsets.json, so the game builds without the
// fork: { speciesid: { L: { move: level (the newest generation's) }, M: { move: [generations] }, E: [moves], T: [moves] } },
// and _base: { formid: the species id whose learnset a form without its own uses }. Only the main games' codes count
// (L level-up, M machine, E egg, T tutor; not events, transfers or virtual console). Rerun after updating the fork.
const fs = require("fs"), path = require("path");
const fork = path.join(__dirname, "..", "showdown", "server", "dist");
const { Learnsets } = require(path.join(fork, "data", "learnsets.js"));
const { Dex } = require(path.join(fork, "sim", "dex.js"));
const out = { _base: {} };
for (const [id, entry] of Object.entries(Learnsets)) {
  const ls = entry.learnset; if (!ls) continue;
  const L = {}, M = {}, E = new Set(), T = new Set(), gL = {};
  for (const [move, codes] of Object.entries(ls)) for (const c of codes) {
    const m = /^(\d)([LMET])(\d*)/.exec(c); if (!m) continue;
    const g = +m[1];
    if (m[2] === "L") { if (!(move in gL) || g > gL[move]) { gL[move] = g; L[move] = +m[3] || 1; } }
    else if (m[2] === "M") (M[move] = M[move] || []).includes(g) || M[move].push(g);
    else if (m[2] === "E") E.add(move);
    else T.add(move);
  }
  out[id] = { L, M, E: [...E].sort(), T: [...T].sort() };
}
for (const sp of Dex.species.all()) {
  if (out[sp.id] || !sp.exists) continue;
  const base = [sp.changesFrom, sp.baseSpecies].map(s => s && Dex.species.get(s).id).find(b => b && out[b]);
  if (base) out._base[sp.id] = base;
}
const file = path.join(__dirname, "showdown_learnsets.json");
fs.writeFileSync(file, JSON.stringify(out));
console.log(`wrote ${path.relative(path.join(__dirname, ".."), file)}: ${Object.keys(out).length - 1} learnsets, ${Object.keys(out._base).length} forms that use their species', ${Math.round(fs.statSync(file).size / 1024)} KB`);
