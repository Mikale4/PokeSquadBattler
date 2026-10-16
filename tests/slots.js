// The Game Corner's slot machine: the odds it shows match play, Game Corner Fever's free spins, the Starter Bonus, the
// Champion Lottery's draw, tapping the reels and the Game Boy's buttons. Screenshots in tests/shots/.
const { chromium } = require('playwright');
const path = require('path');
const PAGE = require('url').pathToFileURL(path.join(__dirname, '..', 'Pokemon Kanto Squad.html')).href;
const SHOTS = path.join(__dirname, 'shots');
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(PAGE); await page.waitForFunction(() => SPR.ready, null, { timeout: 30000 });
  const shot = n => page.screenshot({ path: path.join(SHOTS, n + '.png') });
  // the Game Corner opens with the Prize Corner (4-4): not before
  await page.evaluate(() => { localStorage.clear(); enterGuest(); S.named = true; S.seenIntro = true; closeModal(); });
  ok(await page.evaluate(() => !featOn('slots')), 'the Game Corner is closed on a new save');
  await page.evaluate(() => { for (const id in NODES) S.story[id] = 3; S.cert = 600; S.featSeen = Object.fromEntries(FEATURES.map(f => [f[0], 1])); document.getElementById('toast').style.display = 'none'; });
  ok(await page.evaluate(() => featOn('slots')), 'and opens with the Prize Corner');
  // the odds shown are the reels' own: a long run of real spins comes out the same
  const sim = await page.evaluate(() => {
    const O = slotOdds(), save0 = window.save; window.save = () => {}; S.cert = 1e9; const c0 = S.cert, T = slotState(); let n = 0, paid = 0, sevens = 0;
    for (let i = 0; i < 100000; i++) { const r = slotSpin(); if (r.how === 'coins') { n++; paid += 3; } if (r.big) sevens++; }
    while (T.bonus || T.replay) slotSpin();
    const out = { rtp: O.rtp, sevenIn: O.in('7'), anyIn: O.in('any'), simRtp: (S.cert - c0 + paid) / paid, sevens, n, text: slotOddsText() };
    window.save = save0; return out;
  });
  ok(sim.rtp > .95 && sim.rtp < .99, `pays back ${(sim.rtp * 100).toFixed(1)}% (shown in the odds)`);
  ok(Math.abs(sim.simRtp - sim.rtp) < .06, `100,000 spins paid back ${(sim.simRtp * 100).toFixed(1)}%`);
  ok(sim.sevens > 300 && sim.sevens < 560, `7-7-7 came up ${sim.sevens} times (1 in ${Math.round(sim.sevenIn)} expected)`);
  ok(/1 in 232/.test(sim.text) && /98\.\d%/.test(sim.text), 'the odds text gives the exact chances');
  // playing: the Prize Corner's button opens the machine; a spin costs 3 Coins
  await page.evaluate(() => { S.cert = 300; S.lucky.slot = slotInit(); UI.shopTab = 'prize'; route('shop'); });
  await page.click('[data-act="slotsOpen"]'); await page.waitForFunction(() => SL.on && SL.cv, null, { timeout: 5000 });
  await page.waitForTimeout(300); await shot('600_slots');
  const c0 = await page.evaluate(() => S.cert);
  await page.click('[data-act="slotPress"]'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => SL.st === 'spin'), 'the reels spin');
  const res = await page.evaluate(() => SL.res);
  ok(await page.evaluate(c0 => S.cert, c0) === c0 - (res.how === 'coins' ? 3 : 0) + res.pay, 'the spin is paid for and pays out at once (closing early loses nothing)');
  // tapping each reel stops it
  const box = await page.$eval('#slCv', c => { const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / SL.cw]; });
  for (let r = 0; r < 3; r++) await page.mouse.click(box[0] + (72 + 40 * r + 16) * box[2], box[1] + (192 + 84) * box[2]);
  await page.waitForFunction(() => SL.st !== 'spin', null, { timeout: 5000 });
  ok(true, 'tapping the reels stops them');
  await page.waitForFunction(() => SL.st === 'idle', null, { timeout: 8000 });
  // Game Corner Fever: 20 free spins
  await page.evaluate(() => { EV_CACHE.t = Date.now(); EV_CACHE.list = [...EV_CACHE.list.filter(e => e.key !== 'slots'), { id: 'lucky:slots@test', type: 'lucky', key: 'slots', start: Date.now() - 1000, end: Date.now() + 864e5 }]; slBar(); });
  ok(await page.evaluate(() => slotFree() === 20 && slotPayWith() === 'fever'), 'Game Corner Fever gives 20 free spins');
  const before = await page.evaluate(() => S.cert);
  await page.evaluate(() => slotPress()); await page.waitForTimeout(100);
  ok(await page.evaluate(b => S.cert - SL.res.pay === b && slotFree() === 19, before), 'a free spin costs no Coins');
  await page.evaluate(() => { for (const r of SL.reels) if (!r.stop) slStop(r); }); await page.waitForFunction(() => SL.st === 'idle', null, { timeout: 8000 });
  ok(await page.evaluate(() => eventsNow().filter(evOpen).some(e => e.key === 'slots')), 'Game Corner Fever is listed with the events');
  // the Starter Bonus: 15 free rounds with the starters on the reels
  await page.evaluate(() => { slotsClose(); slotState().replay = false; slotState().bonus = { r: 0, got: 0, seen: [] }; slotsOpen(); });
  let rounds = 0;
  for (; rounds < 20 && (await page.evaluate(() => !!slotState().bonus)); rounds++) {
    await page.evaluate(() => slotPress()); await page.evaluate(() => { for (const r of SL.reels) if (!r.stop) slStop(r); });
    await page.waitForFunction(() => SL.st === 'idle', null, { timeout: 8000 });
    if (rounds === 2) await shot('601_bonus');
  }
  ok(rounds === 15, `the Starter Bonus ran ${rounds} rounds`);
  ok(await page.evaluate(() => !SL.reels[0].bonus && SL.bg !== 'starterBg'), 'and the machine went back to its own reels');
  // the Champion Lottery's draw: one round a prize
  await page.evaluate(() => { slotsClose(); S.lucky.lotShow = { id: 'x', t: 4, total: 5000, won: ['1st', '3rd'] }; slotsDraw(); });
  await page.waitForFunction(() => SL.st === 'done', null, { timeout: 20000 });
  await shot('602_draw');
  ok(await page.evaluate(() => SL.draw.i === 2 && SL.res.prize === '3rd' && SL.res.lines.length === 1 && SL.res.lines[0].sym === 'M'), 'the draw showed both prizes (the 3rd as a line of Marill)');
  // the Game Boy: SELECT shows the odds, B closes
  await page.evaluate(() => { slotsClose(); slotsOpen(); gbPress('select'); });
  ok(await page.evaluate(() => !$('#modal').hidden && /Odds/.test($('#modal').textContent)), 'SELECT shows the odds');
  await shot('603_odds');
  await page.evaluate(() => { closeModal(); gbPress('b'); });
  ok(await page.evaluate(() => !SL.on && $('#slots').hidden), 'B closes the machine');
  // landscape
  await page.setViewportSize({ width: 844, height: 390 }); await page.evaluate(() => slotsOpen()); await page.waitForTimeout(400);
  ok(await page.evaluate(() => SL.land && SL.cw === 512), 'landscape puts the screens side by side');
  await shot('604_slots_land');
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await browser.close();
  console.log(bad ? `${bad} FAILED` : 'all passed');
  process.exit(bad ? 1 : 0);
})();
