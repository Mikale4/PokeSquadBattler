// The PokeSquad Bot's teams (the Showdown server fork's bot, the owner's ask, 2026-10-20): teams of six the way the game builds its
// top Trainers' (npcAccount at the Legend tier, every region open, optimized at Lv 100 like the viability checks: npcOptimize),
// leads first (npcLeads), each checked by the server's own rules (the engine bundle's validateTeam), written as Showdown sets to the
// server fork's pokesquad/bot-teams.json. Rerun after changing the team config, the optimizer or the battle rules, then push the fork.
//   node tools/build_bot_teams.js [teams=60]
const fs = require('fs'), path = require('path'), vm = require('vm');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const GAME = require('url').pathToFileURL(path.join(ROOT, 'PokeSquad Battler.html')).href;
const OUT = path.join(ROOT, 'showdown', 'server', 'pokesquad', 'bot-teams.json');
const { Dex } = require(path.join(ROOT, 'showdown', 'server', 'dist', 'sim', 'dex.js'));
const N = +process.argv[2] || 60;
const toID = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

(async () => {
  const browser = await chromium.launch(), page = await browser.newPage(), errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(GAME, { timeout: 300000 }); await page.waitForTimeout(800);
  const raw = await page.evaluate(N => {
    enterGuest(); closeModal();
    S.story[JOURNEY_END] = 3; for (const id of REGION_IDS) openRegion(id, 0);
    const out = [];
    for (let i = 0; out.length < N * 1.5 && i < N * 4; i++) {
      const d = npcAccount(seeded(hash('bot:' + i)), .99, null, T_LEGEND);
      const prog = {}; for (const k of d.team) prog[k] = { ...d.prog[k], mv: (d.prog[k].mv || []).slice() };
      NPC_BUILD.clear(); ITEM_ROWS.clear();
      const o = npcOptimize({ ...d, roster: d.team.slice(), team: d.team.slice(), prog, badges: 8, lvl: 100 }, npcAccess(100, T_LEGEND), true);
      let order = o.team.slice();
      try { order = npcLeads(o, []).map(s => s.op); } catch (e) {}
      out.push({ name: archName(o.arch || d.arch) || 'Balanced', team: order.map(k => ({ k, mv: (o.prog[k].mv || []).filter(Boolean), ab: o.prog[k].ab, nat: o.prog[k].nat, held: o.prog[k].held || null })) });
    }
    return out.map(t => ({ ...t, team: t.team.map(m => ({ ...m, mvNames: m.mv.map(x => MOVES[x] ? MOVES[x].n : x), heldName: m.held && HELD[m.held] ? HELD[m.held].n : '' })) }));
  }, N);
  await browser.close();
  if (errs.length) console.log('page errors:', errs.slice(0, 3).join(' | '));

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
  const dummy = () => new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : dummy(), apply: () => dummy(), construct: () => dummy(), set: () => true });
  const blank = () => new Proxy({}, { get: (t, k) => t[k] || (t[k] = {}) });
  const c = { console, setTimeout, clearTimeout, setInterval, clearInterval, performance, Math, JSON, Date, URLSearchParams, document: dummy(), localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'node' }, location: { search: '', href: '' }, RES_DATA: blank(), SPR_DATA: blank(), Image() {}, Audio() {}, requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  c.window = c; c.globalThis = c; c.self = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'showdown', 'server', 'pokesquad', 'engine.js'), 'utf8'), c);
  const keys = {}; for (const k of vm.runInContext('Object.keys(OPS)', c)) { const sp = Dex.species.get(k); keys[toID(sp.exists ? sp.name : k)] = k; keys[k] = k; }
  c.PokeSquad.setNames({ name: k => (Dex.species.get(k).exists ? Dex.species.get(k).name : k), key: s => keys[toID(s)] || keys[toID(Dex.species.get(s).name)] || null });
  const teams = [], dropped = [];
  for (const t of raw) {
    if (teams.length >= N) break;
    const sets = t.team.map(set), problems = c.PokeSquad.validateTeam(sets);
    if (problems) dropped.push(`${t.name}: ${problems[0]}`); else teams.push({ name: t.name, team: sets });
  }
  fs.writeFileSync(OUT, JSON.stringify(teams, null, 1) + '\n');
  const arch = {}; for (const t of teams) arch[t.name] = (arch[t.name] || 0) + 1;
  console.log(`${teams.length} teams -> ${path.relative(ROOT, OUT)}; by plan: ${Object.entries(arch).map(([k, v]) => `${k} ${v}`).join(', ')}`
    + (dropped.length ? `\nleft out ${dropped.length}: ${dropped.slice(0, 5).join(' | ')}` : ''));
})();
