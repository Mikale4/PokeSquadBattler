// Title screen and the Pokémon Trainer Club: Guest play, sign up (carrying Guest progress over), separate saves,
// log out, the remembered Trainer, a wrong password, adventures from the old server list coming together on the one
// server. Run: node tests/accounts.js
const path = require('path');
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../Pokemon Kanto Squad.html')).href;
const { chromium } = require('playwright');
// throwaway local test account (stored only in the test browser's localStorage)
const TEST_ID = 'TestTrainer', TEST_PW = 'test-pass-1234';
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) process.exitCode = 1; };
  // the title is ready once PRESS START shows; tapping the screen starts
  const title = async () => { await page.waitForSelector('#ttap:not([hidden])', { timeout: 10000 }); await page.waitForTimeout(200); };
  const start = async () => { await page.mouse.click(195, 520); await page.waitForTimeout(400); };
  await page.goto(PAGE); await title();
  // 1. Guest play: everyone plays on the one server, with only the Journey open at first
  await start(); await page.click('#tGuest'); await page.waitForTimeout(900);
  ok(await page.evaluate(() => SAVE_SLOT === SAVE_KEY && S.server === 1 && serverCount() === 1), 'a new Guest plays on the one server');
  ok(await page.evaluate(() => !featOn('mail') && !featOn('safari') && !$('#view [data-act="inbox"]') && $$('#tabs [data-act="go"]').length === 2), 'a new adventure starts with only the Journey open');
  await page.evaluate(() => { S.named = true; S.name = 'Guesty'; S.lmd = 424242; closeModal(); save(); ACT.toTitle(); }); await title();
  // 2. sign up with the Guest adventure carried over
  await start();
  await page.click('.tpanel [data-tab=register]'); await page.waitForTimeout(200);
  await page.fill('#tId', TEST_ID); await page.fill('#tPw', TEST_PW); await page.fill('#tPw2', TEST_PW);
  ok(await page.$('#tCarry') !== null, 'sign-up offers to bring the Guest adventure along');
  await page.click('#tGo'); await page.waitForTimeout(1200);
  ok(await page.evaluate(() => SESSION && SESSION.name === 'TestTrainer' && SAVE_SLOT.includes(':acct:')), 'signed up and logged in');
  ok(await page.evaluate(() => S.lmd === 424242 && S.name === 'Guesty'), 'the Guest adventure came along');
  await page.evaluate(() => { S.lmd = 777; save(); }); await page.waitForTimeout(300);
  // 3. remembered login: reload, and PRESS START goes straight in
  await page.reload(); await title();
  ok((await page.textContent('#tuser')).includes('TestTrainer'), 'the title remembers the Trainer');
  await start(); await page.waitForTimeout(600);
  ok(await page.evaluate(() => S && S.lmd === 777), 'the remembered Trainer loads their own save');
  // 4. log out, wrong password, right password
  await page.evaluate(() => ACT.logout()); await title();
  await start();
  await page.fill('#tId', TEST_ID); await page.fill('#tPw', 'wrong-password'); await page.click('#tGo'); await page.waitForTimeout(500);
  ok((await page.textContent('#tErr')).includes('Wrong password') && await page.evaluate(() => !S), 'a wrong password is refused');
  await page.fill('#tPw', TEST_PW); await page.click('#tGo'); await page.waitForTimeout(900);
  ok(await page.evaluate(() => S && S.lmd === 777), 'logs back in to the same save');
  // 5. the Guest save is now a fresh one, separate from the account
  await page.evaluate(() => ACT.logout()); await title();
  await start(); await page.click('#tGuest'); await page.waitForTimeout(900);
  ok(await page.evaluate(() => S.lmd !== 777 && S.lmd !== 424242 && !S.named), 'Guest and Trainer Club saves are separate');
  // 6. the News card
  await page.evaluate(() => ACT.toTitle()); await title();
  await page.click('[data-act="titleNews"]'); await page.waitForTimeout(200);
  ok(await page.$('#tNewsX') !== null, 'News opens on the title screen');
  // 7. adventures from the old server list: two Guest saves (Server 1 and S7) → the Trainer picks one, the other is kept aside
  await page.evaluate(() => {
    const a = newSave(); a.named = true; a.name = 'OnS1'; a.lmd = 111;
    const b = newSave(7); b.named = true; b.name = 'OnS7'; b.lmd = 777777; b.server = 7;
    localStorage.setItem(SAVE_KEY, JSON.stringify(a)); localStorage.setItem(SAVE_KEY + ':srv:7', JSON.stringify(b));
    ACT.toTitle();
  }); await title();
  await start(); await page.click('#tGuest'); await page.waitForTimeout(500);
  ok(await page.$('.tpanel [data-keep="7"]') !== null, 'with saves on two old servers, the Trainer picks the adventure to keep');
  await page.click('.tpanel [data-keep="7"]'); await page.waitForTimeout(900);
  ok(await page.evaluate(() => S.name === 'OnS7' && S.server === 1 && SAVE_SLOT === SAVE_KEY && !localStorage.getItem(SAVE_KEY + ':srv:7') && JSON.parse(localStorage.getItem(SAVE_KEY + ':old:1')).name === 'OnS1'), 'the chosen adventure moves to the one server; the other is kept aside');
  ok(await page.evaluate(() => S.inbox.some(m => m.title === 'Welcome to the one server!')), 'an adventure from another server gets a welcome');
  console.log('ERRORS', JSON.stringify(errs));
  if (errs.length) process.exitCode = 1;
  await browser.close();
})();
