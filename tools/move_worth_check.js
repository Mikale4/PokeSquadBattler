// Does a move-worth table (tools/move_worth.js) make the optimizer better? Each of the top Trainers' teams (a completed Kanto
// Journey, Lv 100, Legend access) is optimized twice, as a team: with the table and without it. Then the two versions battle with
// the Expert AI on fixed seeds, sides swapped: each team against itself (with vs without) and against the next team (with vs
// without, both ways). Prints, per table, the share of battles the version with the table wins (draws count half).
//   node tools/move_worth_check.js table.json [table2.json ...] [--teams=40] [--workers=4] [--skip=0]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const PAGE = require('url').pathToFileURL(path.join(__dirname, '..', 'Pokemon Kanto Squad.html')).href;
const files = process.argv.slice(2).filter(a => !a.startsWith('--')), opt = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const TEAMS = +(opt.teams || 40), WORKERS = +(opt.workers || 4), SKIP = +(opt.skip || 0);
const tables = files.map(f => ({ f: path.basename(f), t: JSON.parse(fs.readFileSync(f, 'utf8')) }));

async function worker(browser, wi) {
  const page = await browser.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(PAGE); await page.waitForTimeout(500);
  await page.evaluate(([TEAMS, SKIP]) => {
    enterGuest(); closeModal();
    S.story[JOURNEY_END] = 3; for (const id of REGION_IDS) openRegion(id, 0); MOVE_WORTH_ON = false;
    const idx = S.ladder.pop.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).slice(SKIP, SKIP + TEAMS).map(x => x[1]);
    window.MC = { docs: idx.map(i => ladderDoc(i)) };
  }, [TEAMS, SKIP]);
  const res = [];
  for (const T of tables) {
    const r = await page.evaluate(([T, wi, W]) => {
      const C = window.MC, n = C.docs.length;
      const build = (d, on) => {
        MOVE_WORTH.g = T.g; MOVE_WORTH.s = T.s; MOVE_WORTH_ON = on; NPC_BUILD.clear(); ITEM_ROWS.clear();
        const prog = {}; for (const k of d.team) prog[k] = { ...d.prog[k], mv: (d.prog[k].mv || []).slice() };
        const acc = { ...d, roster: d.team.slice(), team: d.team.slice(), prog, badges: 8, lvl: 100 };
        try { return npcOptimize(acc, npcAccess(100, T_LEGEND), true); } finally { MOVE_WORTH_ON = false; }
      };
      const on = [], off = [];
      for (let i = 0; i < n; i++) { on.push(build(C.docs[i], true)); off.push(build(C.docs[i], false)); }
      let changed = 0, mons = 0;
      for (let i = 0; i < n; i++) for (const k of on[i].team) { mons++; changed += on[i].prog[k].mv.filter((m, j) => m !== off[i].prog[k].mv[j]).length; }
      const specs = (a, foe) => npcLeads(a, foe.team.map(k => npcSpec(foe, k)));
      let w = 0, games = 0, draws = 0;
      for (let i = wi; i < n; i += W) for (const [x, y, tag] of [[on[i], off[i], 0], [on[i], off[(i + 1) % n], 1], [on[(i + 1) % n], off[i], 2]]) for (const swap of [false, true]) {
        R = seeded(5300 + i * 31 + tag * 7 + (swap ? 1 : 0));
        const A = swap ? y : x, E = swap ? x : y;
        const B = makeBattle({ allies: specs(A, E), waves: [specs(E, A)], auto: true, aiStyle: "expert", enemyStyle: "expert", sim: true });
        let s = 0; const t0 = Date.now(); while (!B.over && s < 4000 && Date.now() - t0 < 90000) { B.step(); B.ev.length = 0; s++; }
        R = Math.random; games++;
        if (!B.result || B.result.draw) { w += .5; draws++; } else if (B.result.win !== swap) w++;
      }
      return { w, games, draws, changed: changed / Math.max(1, mons) };
    }, [T.t, wi, WORKERS]);
    res.push(r);
    console.log(`worker ${wi} ${T.f}: ${r.w}/${r.games} (${r.draws} draws), ${r.changed.toFixed(2)} moves changed per Pokémon`);
  }
  if (errs.length) console.log(`worker ${wi} ERRORS`, JSON.stringify(errs.slice(0, 5)));
  await page.close();
  return res;
}

(async () => {
  const browser = await chromium.launch();
  const parts = await Promise.all([...Array(WORKERS)].map((_, i) => worker(browser, i)));
  await browser.close();
  tables.forEach((T, ti) => {
    const w = parts.reduce((a, p) => a + p[ti].w, 0), g = parts.reduce((a, p) => a + p[ti].games, 0), d = parts.reduce((a, p) => a + p[ti].draws, 0);
    const p = w / g, se = Math.sqrt(p * (1 - p) / g);
    console.log(`${T.f}: with the table wins ${(p * 100).toFixed(1)}% of ${g} battles (±${(196 * se).toFixed(1)}, ${d} draws), ${parts[0][ti].changed.toFixed(2)} moves changed per Pokémon`);
  });
  process.exit(0);
})();
