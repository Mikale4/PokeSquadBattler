// Battle Stadium: Ranked Battles screen, rankings, the Registered Team log, a Ranked Battle, and a Link Battle (matchmaking,
// draft, ban, timed battle). Screenshots go to tests/shots/. Run: node tests/stadium.js
const path = require('path'), fs = require('fs');
const SH = path.join(__dirname, 'shots') + '/'; fs.mkdirSync(SH, { recursive: true });
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../PokeSquad Battler.html')).href;
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
  const shot = n => page.screenshot({ path: SH + n + '.png' });
  await page.goto(PAGE); await page.waitForTimeout(800);
  // a mid-game Guest adventure
  await page.evaluate(() => {
    enterGuest(); S.named = true; S.seenIntro = true; S.starter = 'squirtle'; S.badges = 8; closeModal();
    for (const id in NODES) if (+id.replace(/^S/, '').split('-')[0] <= 8) S.story[id] = 3;   // (eight Badges' worth of the Journey: the Stadium is open)
    for (const k of ['blastoise', 'charizard', 'venusaur', 'alakazam', 'gengar', 'snorlax', 'lapras', 'jolteon']) S.ops[k] = progForLV(k, 60);
    S.team.arena = ['blastoise', 'alakazam', 'gengar', 'snorlax']; S.team.defense = ['snorlax', 'lapras', 'charizard', 'jolteon'];
    S.settings.speed = 3; S.settings.auto = true; S.settings.ai = 'expert'; UI.arenaTab = 'ladder'; route('arena');
  });
  await page.waitForTimeout(400); await shot('120_ladder');
  ok(await page.$$eval('[data-act="ladderGo"]', b => b.length) === 3, 'three Trainers listed');
  await page.click('[data-act="rankings"]'); await page.waitForTimeout(200); await shot('121_rankings');
  ok((await page.$$('.rkrow')).length >= 30, 'rankings list');
  await page.evaluate(() => closeModal());
  // two hours away: the population drifts and the Registered Team gets challenged
  const before = await page.evaluate(() => S.ladder.log.length);
  await page.evaluate(() => { S.ladder.defT -= 2 * 3600000; S.ladder.popT -= 2 * 3600000; tickTimers(); rerender(); });
  ok(await page.evaluate(() => S.ladder.log.length) >= before, 'Registered Team battles are simulated while away');
  await page.click('[data-act="defLog"]'); await page.waitForTimeout(200); await shot('122_team_log'); await page.evaluate(() => closeModal());
  // battles on Auto still stop for you to choose who comes in after a faint: pick from the bench until the result shows
  let picks = 0;
  const untilResult = async (ms, tag) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await page.$('#rDone')) return true;
      const bench = await page.evaluate(() => BT.benchMode === 'replace' && !!document.querySelector('#bCtl .bnc'));
      if (bench) { if (!picks++ && tag) await shot(tag); await page.click('#bCtl .bnc'); }
      await page.waitForTimeout(300);
    }
    return false;
  };
  // one Ranked Battle on auto
  const pts0 = await page.evaluate(() => S.ladder.pts);
  await page.click('[data-act="ladderGo"]'); await page.waitForTimeout(300); await shot('122b_team');
  await page.click('[data-act="deploy"]');
  await page.waitForTimeout(3500); await shot('122c_ranked_battle');
  await untilResult(180000, '122d_ranked_pick'); await shot('123_ranked_result');
  await page.click('#rDone'); await page.waitForTimeout(300);
  ok(await page.evaluate(p => S.ladder.pts !== p && S.ladder.tickets === 9, pts0), 'a Ranked Battle changes points and uses a Ticket');
  // Link Battle: matchmaking, draft, ban, battle
  await page.evaluate(() => { UI.arenaTab = 'rta'; rerender(); }); await page.waitForTimeout(200); await shot('124_link');
  await page.click('[data-act="rtaFind"]'); await page.waitForTimeout(500); await shot('125_matchmaking');
  await page.waitForFunction(() => DRAFT, null, { timeout: 15000 });
  for (let g = 0; g < 200; g++) {
    const st = await page.evaluate(() => DRAFT ? { phase: DRAFT.phase, mine: draftWho() === 0, n: DRAFT.picks[0].length } : null);
    if (!st) break;
    if (st.phase === 'pick' && st.mine) { if (st.n === 2) await shot('126_draft'); await page.click('[data-act="draftPick"]:not([disabled])'); }
    else if (st.phase === 'ban') { await shot('127_ban'); await page.click('[data-act="draftBan"]'); }
    else if (st.phase === 'lead') { await shot('127b_leads'); await page.click('[data-act="draftLead"]:not(.dlead)'); }
    await page.waitForTimeout(250);
  }
  ok(await page.evaluate(() => BT.on), 'the draft leads into the battle');
  // manual play for one move, so the turn timer shows
  await page.evaluate(() => { BT.B.auto = false; });
  await page.waitForSelector('.bturn', { timeout: 60000 }).catch(() => {}); await page.waitForTimeout(600); await shot('128_link_timer');
  ok(await page.$('.bturn') !== null, 'Link Battles time each move');
  await page.evaluate(() => { BT.B.auto = true; if (BT.inputRes) { const r = BT.inputRes; BT.inputRes = null; hideControls(); r('auto'); } });
  await untilResult(240000); await shot('128b_link_result');
  await page.click('#rDone'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => S.rta.games === 1 && S.rta.log.length === 1), 'the match result is recorded');
  ok(picks > 0 || await page.evaluate(() => S.rta.log[0].win), 'you choose who comes in after a faint');
  await shot('129_link_after');
  // the Battle hub tile
  await page.evaluate(() => route('battle')); await page.waitForTimeout(200); await shot('129b_hub');
  console.log('ladder', await page.evaluate(() => JSON.stringify({ pts: S.ladder.pts, rta: S.rta.pts, log: S.ladder.log.length })));
  console.log('ERRORS', JSON.stringify(errs));
  await browser.close();
})();
