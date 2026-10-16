// Runs the title screen's Demo headless at top speed until it reaches 100% (or a time limit) and reports progress.
// Run: node tests/demo.js [minutes=90]
const path = require('path'), fs = require('fs');
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../Pokemon Kanto Squad.html')).href;
const LIMIT = (+process.argv[2] || 90) * 60000;
const SH = path.join(__dirname, 'shots') + '/'; fs.mkdirSync(SH, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  page.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && /\[demo\]/.test(m.text()))) errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(PAGE);
  await page.waitForTimeout(1000);
  // start a new Demo from the title screen, then switch it to headless speed
  await page.click('[data-act="titleDemo"]'); await page.waitForTimeout(300);
  await page.screenshot({ path: SH + '400_demo_panel.png' });
  await page.click('#tDemoNew');
  if (!process.env.DEMO_WATCH) await page.evaluate(() => { DEMO.fast = true; DEMO.speed = 16; });
  else { await page.waitForTimeout(6000); await page.screenshot({ path: SH + '401_demo_playing.png' }); await page.evaluate(() => { DEMO.fast = true; DEMO.speed = 16; }); }
  const t0 = Date.now(); let last = '';
  while (Date.now() - t0 < LIMIT) {
    await page.waitForTimeout(15000);
    const st = await page.evaluate(() => ({ on: DEMO.on, g: S ? demoGoals() : null, log: DEMO.log.slice(-1)[0], errors: DEMO.errors,
      lvl: S && S.lvl, ops: S && Object.keys(S.ops).length, badges: S && S.badges, days: Math.round(DEMO.skew / 864e5 * 10) / 10 }));
    const line = `${Math.round((Date.now() - t0) / 1000)}s ${st.g ? Math.floor(st.g.pct) + '% stages ' + st.g.nodesDone + ' explore ' + st.g.hunts + ' tower ' + st.g.tower + ' ranked ' + st.g.cc + ' link ' + st.g.rt + ' dex ' + st.g.dex : ''} badges ${st.badges} lvl ${st.lvl} mons ${st.ops} +${st.days}d errs ${st.errors} | ${st.log}`;
    if (line !== last) console.log(line); last = line;
    if (!st.on) break;
  }
  await page.screenshot({ path: SH + '402_demo_end.png' });
  const end = await page.evaluate(() => ({ on: DEMO.on, log: DEMO.log.slice(-40) }));
  console.log('--- last log ---\n' + end.log.join('\n'));
  console.log('demo still running:', end.on, '| errors:', JSON.stringify(errs.slice(0, 20), null, 1));
  await browser.close();
})();
