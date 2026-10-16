// Balance check: auto-vs-auto win rates for every Journey stage, with random teams of six (three on the field) at the level cap the player
// would have there (Pokémon picked so their evolution stage fits the level). Run: node tests/sim.js [runs]
const path = require('path');
const { chromium } = require('playwright');
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../Pokemon Kanto Squad.html')).href;
const RUNS = +process.argv[2] || 24;
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(PAGE);
  await page.waitForTimeout(500);
  const out = await page.evaluate(RUNS => {
    enterGuest(); closeModal();   // the title screen has no save until a Trainer enters
    S.starter = 'charmander';
    // Pokémon a player could field at a given level: not legendary, and evolved no further than that level allows
    const minLv = minLevelOf;   // (the game's own: evolution levels, Shedinja, and Lv 50 for the Ultra Beasts and Paradox Pokémon)
    const pool = lv => OP_KEYS.filter(k => !OPS[k].leg && minLv(k) <= lv && OPS[k].skills.length >= 2 && !OPS[k].evo.some(e => e.lv && e.lv <= lv));
    const rows = [];
    let badges = 0, cap = 5;
    for (const ch of STORY[0].chapters) for (const nd of ch.nodes) {
      if (!(nd.waves || nd.rivalWaves)) continue;
      // the level cap is the strongest Pokémon of the next Gym Leader, rival, Giovanni, Elite Four or Champion battle
      const next = capSteps().find(c => STORY[0].chapters.flatMap(x => x.nodes).indexOf(c.nd) >= STORY[0].chapters.flatMap(x => x.nodes).indexOf(nd));
      cap = ch.id === 'c11' ? 75 : Math.max(cap, next ? next.lv : 100);
      const lv = Math.min(cap, Math.max(5, (nd.lv || 5) + 3)); S.badges = badges;
      let wins = 0, turns = 0, lost = 0;
      const P = pool(lv);
      for (let r = 0; r < RUNS; r++) {
        const team = []; while (team.length < ROSTER) { const k = P[Math.floor(Math.random() * P.length)]; if (!team.includes(k)) team.push(k); }
        if (nd.id === '1-2') team.splice(1);
        const B = makeBattle({ allies: team.map(k => ({ op: k, prog: { lvl: lv, xp: 0, pot: 2, sk: [1, 1, 1], held: null } })), waves: nodeWaves(nd).map(w => convWave(w, nd.lv)), auto: true, weather: nd.weather, trainer: nd.trainer && nd.trainer.name, wild: nd.wild });
        let n = 0; while (!B.over && n < 4000) { B.step(); B.ev.length = 0; n++; }
        if (B.result && B.result.win) { wins++; turns += B.result.turns; lost += B.result.lost; }
      }
      rows.push(`${nd.id.padEnd(5)} ${(nd.name).slice(0, 38).padEnd(38)} lv${String(lv).padStart(3)} vs ${String(nd.lv).padStart(2)}  win ${String(Math.round(wins / RUNS * 100)).padStart(3)}%  turns ${wins ? (turns / wins).toFixed(1) : '-'}  lost ${wins ? (lost / wins).toFixed(1) : '-'}`);
      if (nd.badgeWin != null) badges = nd.badgeWin + 1;
    }
    return rows;
  }, RUNS);
  console.log(out.join('\n'));
  console.log('ERRORS', JSON.stringify(errs.slice(0, 5), null, 1));
  await browser.close();
})();
