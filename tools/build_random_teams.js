// The Random Battle formats on the Showdown server fork (the owner's ask, 2026-10-21): pools of teams the game's own team builder
// makes ahead of time, one drawn for each player as a battle starts (the fork's server/pokesquad.ts, randomTeam):
//  - pokesquad/random-teams.json, [Gen 9] PokeSquad Random Battle: six random fully evolved Pokémon (every one with two or more
//    moves, Legendaries too: one Legendary, one Mythical, one Ultra Beast and one Paradox at most, one of each species), their sets
//    built as a team by the game's optimizer (npcOptimize at the Legend tier: moves, Abilities, natures, items under the Item
//    Clause), in random order (the first three lead: no team preview, as in Showdown's Random Battle); every Pokémon in at least
//    three different sets (the owner's ask, 2026-10-21: until it has three, its next team bans a move of each set it has had, then
//    it takes them in turn; top-up teams for any still short)
//  - pokesquad/random-trainer-teams.json, [Gen 9] PokeSquad Random Trainer Battle: top Trainers' teams (npcAccount at the Legend
//    tier: each archetype's plan from the team config), leads first (npcLeads), made the way the Bot's are (tools/build_bot_teams.js)
// Lv 100 (the owner's pick). Built on the server's engine bundle (build.sh writes it first) in worker processes at a low priority;
// each team checked by the server's own rules (validateTeam). Rerun after changing the team config, the optimizer or the battle
// rules, then push the fork.
//   node tools/build_random_teams.js [random=2000] [trainer=1000] [workers=3]
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os'), { fork } = require('child_process');
const ROOT = path.join(__dirname, '..'), SERVER = path.join(ROOT, 'showdown', 'server');
const ENGINE = path.join(SERVER, 'pokesquad', 'engine.js');

// the engine bundle in a sandbox, with the stand-ins server/pokesquad.ts gives it
function sandbox() {
  const dummy = () => new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : dummy(), apply: () => dummy(), construct: () => dummy(), set: () => true });
  const blank = () => new Proxy({}, { get: (t, k) => t[k] || (t[k] = {}) });
  const c = { console, setTimeout, clearTimeout, setInterval, clearInterval, performance, Math, JSON, Date, URLSearchParams, document: dummy(), localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'node' }, location: { search: '', href: '' }, RES_DATA: blank(), SPR_DATA: blank(), Image() {}, Audio() {}, requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  c.window = c; c.globalThis = c; c.self = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync(ENGINE, 'utf8'), c);
  return c;
}

// ---- a worker: teams [from, to) of one kind, sent back as the game's keys and names
if (process.argv[2] === '--worker') {
  const [kind, from, to] = [process.argv[3], +process.argv[4], +process.argv[5]];
  const c = sandbox();
  vm.runInContext(`
    const RT_POOL = OP_KEYS.filter(k => !OPS[k].evo.length && OPS[k].skills.length >= 2);
    function rtNames(o, order) {
      return order.map(k => ({ k, mv: (o.prog[k].mv || []).filter(Boolean), ab: o.prog[k].ab, nat: o.prog[k].nat, held: o.prog[k].held || null }))
        .map(m => ({ ...m, mvNames: m.mv.map(x => MOVES[x] ? MOVES[x].n : x), heldName: m.held && HELD[m.held] ? HELD[m.held].n : '' }));
    }
    // three different sets for every Pokémon (the owner's ask, 2026-10-21): until it has three, its next team bans one move of each
    // set it has had (its S3 move first, then its S2, then its S1), so the optimizer builds it another; then it takes the three in
    // turn, each with the moves its own set was built without
    const VAR = {};
    function banFor(k) {
      const v = VAR[k] || (VAR[k] = { sets: [], n: 0, fail: 0 });
      if (v.sets.length < 3 && v.fail < 3) {
        if (!v.sets.length) return { ban: [], fresh: true };
        const slot = (v.sets.length === 1 ? [2, 1, 0] : [1, 2, 0])[v.fail];
        return { ban: [...new Set(v.sets.map(s => s.mv[slot]).filter(Boolean))], fresh: true };
      }
      const s = v.sets[v.n++ % v.sets.length];
      return { ban: s.ban, fresh: false };
    }
    function recordSet(k, mv, b) {
      const v = VAR[k], key = mv.join('/');
      if (!b.fresh) return;
      if (!v.sets.some(s => s.key === key)) { v.sets.push({ key, mv: mv.slice(), ban: b.ban }); v.fail = 0; } else v.fail++;
    }
    // a team built around these Pokémon (the rest random): one of each species, the PvP limits; built as a team; in random order
    function rtTeam(R0, first) {
      const team = [], ids = new Set();
      for (const k of first) if (!ids.has(OPS[k].id) && pvpFits(team, k)) { team.push(k); ids.add(OPS[k].id); }
      while (team.length < 6) {
        const k = RT_POOL[Math.floor(R0() * RT_POOL.length)];
        if (ids.has(OPS[k].id) || !pvpFits(team, k)) continue;
        team.push(k); ids.add(OPS[k].id);
      }
      const prog = {}; for (const k of team) prog[k] = { lvl: 100, ab: OPS[k].ab, nat: 'hardy', mv: [] };
      const bans = {}; for (const k of team) bans[k] = banFor(k);
      const moveBan = {}; for (const k of team) if (bans[k].ban.length) moveBan[k] = bans[k].ban;
      const o = npcOptimize({ team: team.slice(), roster: team.slice(), prog, badges: 8, lvl: 100, moveBan }, npcAccess(100, T_LEGEND), true);
      for (const k of team) recordSet(k, (o.prog[k].mv || []).filter(Boolean), bans[k]);
      const order = team.slice(); for (let j = order.length - 1; j > 0; j--) { const r = Math.floor(R0() * (j + 1)); [order[j], order[r]] = [order[r], order[j]]; }
      return { name: 'Random', team: rtNames(o, order) };
    }
    // six random fully evolved Pokémon
    function rtRandom(i) { return rtTeam(seeded(hash('random:' + i)), []); }
    // a top-up team for a Pokémon that has fewer than three sets yet: the sets it already has come in from the main process
    function rtTopup(i, k, have) {
      VAR[k] = VAR[k] || { sets: have.map(mv => ({ key: mv.join('/'), mv, ban: [] })), n: 0, fail: 0 };
      return rtTeam(seeded(hash('topup:' + k + ':' + i)), [k]);
    }
    // a top Trainer's team, as the Bot's (tools/build_bot_teams.js)
    function rtTrainer(i) {
      const d = npcAccount(seeded(hash('trainer:' + i)), .99, null, T_LEGEND);
      const prog = {}; for (const k of d.team) prog[k] = { ...d.prog[k], mv: (d.prog[k].mv || []).slice() };
      const o = npcOptimize({ ...d, roster: d.team.slice(), team: d.team.slice(), prog, badges: 8, lvl: 100 }, npcAccess(100, T_LEGEND), true);
      let order = o.team.slice();
      try { order = npcLeads(o, []).map(s => s.op); } catch (e) {}
      return { name: archName(o.arch || d.arch) || 'Balanced', team: rtNames(o, order) };
    }
  `, c);
  if (kind === 'topup') {
    // (from: a file of { k, have }: each Pokémon that has fewer than three sets, and the move sets it has: teams built around it until
    // it has three, or six tries)
    const jobs = JSON.parse(fs.readFileSync(process.argv[4], 'utf8')), topup = vm.runInContext('rtTopup', c), count = vm.runInContext('k => (VAR[k] || { sets: [] }).sets.length', c);
    let i = 0;
    for (const j of jobs) for (let a = 0; a < 6 && count(j.k) < 3; a++) {
      let t = null;
      try { t = topup(a, j.k, j.have); } catch (e) { t = { error: String(e && e.message || e) }; }
      process.send({ i: i++, t, k: j.k });
    }
    process.exit(0);
  }
  const make = vm.runInContext(kind === 'random' ? 'rtRandom' : 'rtTrainer', c);
  for (let i = from; i < to; i++) {
    let t = null;
    try { t = make(i); } catch (e) { t = { error: String(e && e.message || e) }; }
    process.send({ i, t });
    if (i % 100 === 99) vm.runInContext('ITEM_ROWS.clear()', c);   // (the item values' cache has no limit of its own)
  }
  process.exit(0);
}

// ---- the main process: the workers, then Showdown's names, the server's check, the files
const [NR, NT, W] = [+(process.argv[2] || 2000), +(process.argv[3] || 1000), +(process.argv[4] || 3)];
const { Dex } = require(path.join(SERVER, 'dist', 'sim', 'dex.js'));
const toID = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
// (as many as asked for, with a few spare for any the server's check turns down)
const want = { random: Math.ceil(NR * 1.05), trainer: Math.ceil(NT * 1.1) };
function build(kind, n) {
  return new Promise(done => {
    const got = new Array(n).fill(null); let left = W, count = 0;
    const per = Math.ceil(n / W);
    for (let w = 0; w < W; w++) {
      const from = w * per, to = Math.min(n, from + per);
      if (from >= to) { left--; continue; }
      const child = fork(__filename, ['--worker', kind, from, to], { stdio: 'inherit' });
      try { os.setPriority(child.pid, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
      child.on('message', m => { got[m.i] = m.t; if (++count % 100 === 0) console.log(`${kind}: ${count}/${n}`); });
      child.on('exit', () => { if (--left === 0) done(got); });
    }
    if (left === 0) done(got);
  });
}
// the top-up: the jobs split over the workers, every team they make
function topup(jobs) {
  return new Promise(done => {
    const got = []; let left = 0;
    const per = Math.ceil(jobs.length / W);
    for (let w = 0; w < W; w++) {
      const part = jobs.slice(w * per, (w + 1) * per); if (!part.length) continue;
      const file = path.join(os.tmpdir(), `pokesquad-topup-${process.pid}-${w}.json`); fs.writeFileSync(file, JSON.stringify(part));
      left++;
      const child = fork(__filename, ['--worker', 'topup', file], { stdio: 'inherit' });
      try { os.setPriority(child.pid, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
      child.on('message', m => got.push(m));
      child.on('exit', () => { try { fs.unlinkSync(file); } catch (e) {} if (--left === 0) done(got); });
    }
    if (left === 0) done(got);
  });
}
(async () => {
  const t0 = Date.now();
  const raw = { random: await build('random', want.random), trainer: await build('trainer', want.trainer) };
  // Showdown's names for everything (the server finds the game's keys from them: server/pokesquad.ts, tools/showdown_adapter.js)
  const SLOTTED = /^(sketch|copycat|mirrormove)([13])$/;
  const set = m => ({
    species: Dex.species.get(m.k).exists ? Dex.species.get(m.k).name : m.k,
    item: m.held ? (Dex.items.get(m.held).exists ? Dex.items.get(m.held).name : m.heldName) : '',
    ability: Dex.abilities.get(toID(m.ab)).exists ? Dex.abilities.get(toID(m.ab)).name : m.ab,
    nature: m.nat ? m.nat[0].toUpperCase() + m.nat.slice(1) : 'Hardy',
    moves: m.mv.map((k, i) => SLOTTED.test(k) ? `${m.mvNames[i]} (S${k.slice(-1)})` : Dex.moves.get(k).exists ? Dex.moves.get(k).name : m.mvNames[i]),
  });
  // each one checked by the server's own rules
  const c = sandbox();
  const keys = {}; for (const k of vm.runInContext('Object.keys(OPS)', c)) { const sp = Dex.species.get(k); keys[toID(sp.exists ? sp.name : k)] = k; keys[k] = k; }
  c.PokeSquad.setNames({ name: k => (Dex.species.get(k).exists ? Dex.species.get(k).name : k), key: s => keys[toID(s)] || keys[toID(Dex.species.get(s).name)] || null });
  const moveKey = s => s.moves.join('/');
  for (const [kind, n, file] of [['random', NR, 'random-teams.json'], ['trainer', NT, 'random-trainer-teams.json']]) {
    const teams = [], dropped = [];
    const take = (t, keep) => {
      if (!t || t.error) { dropped.push(t ? t.error : 'not built'); return; }
      const sets = t.team.map(set), problems = c.PokeSquad.validateTeam(sets);
      if (problems) dropped.push(`${t.name}: ${problems[0]}`); else if (!keep || keep(sets)) teams.push({ name: t.name, team: sets });
    };
    for (const t of raw[kind]) { if (teams.length >= n) break; take(t); }
    if (kind === 'random') {
      // every Pokémon with three different sets (by its moves): top-up teams for those with fewer, each kept only if it brings one
      // of them a set it didn't have
      const have = () => { const h = {}; for (const t of teams) for (const s of t.team) (h[s.species] = h[s.species] || new Set()).add(moveKey(s)); return h; };
      // (rounds: a top-up team's other five can be Pokémon short of three too)
      for (let round = 1; round <= 3; round++) {
        const h0 = have(), jobs = Object.entries(h0).filter(([, v]) => v.size < 3)
          .map(([sp, v]) => ({ k: keys[toID(sp)], have: [...v].map(x => x.split('/').map(toID)) })).filter(j => j.k);
        if (!jobs.length) break;
        console.log(`top-up ${round}: ${jobs.length} Pokémon with fewer than three sets`);
        for (const m of await topup(jobs)) {
          take(m.t, sets => { const s = sets.find(x => keys[toID(x.species)] === m.k), h = have(); return !!s && (h[s.species] || new Set()).size < 3 && !(h[s.species] || new Set()).has(moveKey(s)); });
        }
      }
      const h1 = have(), short = Object.entries(h1).filter(([, v]) => v.size < 3);
      console.log(`sets per Pokémon (by moves): ${Object.keys(h1).length} Pokémon, ${Object.keys(h1).length - short.length} with three or more`
        + (short.length ? `; fewer: ${short.map(([sp, v]) => `${sp} ${v.size}`).join(', ')}` : ''));
    }
    // (a team a line: the server reads the file once)
    fs.writeFileSync(path.join(SERVER, 'pokesquad', file), '[\n' + teams.map(t => JSON.stringify(t)).join(',\n') + '\n]\n');
    const by = {}; for (const t of teams) by[t.name] = (by[t.name] || 0) + 1;
    const mons = {}; for (const t of teams) for (const s of t.team) mons[s.species] = (mons[s.species] || 0) + 1;
    console.log(`${teams.length} teams -> showdown/server/pokesquad/${file}` + (kind === 'trainer' ? `; by plan: ${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}` : `; ${Object.keys(mons).length} different Pokémon`)
      + (dropped.length ? `\nleft out ${dropped.length}: ${[...new Set(dropped)].slice(0, 5).join(' | ')}` : ''));
  }
  console.log(`${Math.round((Date.now() - t0) / 1000)} s`);
})();
