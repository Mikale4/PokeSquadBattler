// Social systems: weekly Safari Zone areas, the Union Room and replies, Clubs (join, contribute, Raid Battle), profiles, the Trainer Card.
// Screenshots go to tests/shots/. Run: node tests/social.js
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
  await page.evaluate(() => { localStorage.clear(); enterGuest(); S.named = true; S.seenIntro = true; S.starter = 'squirtle'; S.ops.squirtle = mkProg(10, 'squirtle'); S.assistant = 'squirtle';
    for (const id in NODES) if (+id.replace(/^S/, '').split('-')[0] <= 3) S.story[id] = 3;   // (three chapters in: the Union Room and Clubs are open)
    route('home'); closeModal(); });
  await page.waitForTimeout(400); await shot('300_home');
  ok(await page.$('.ticker') !== null, 'the home screen shows the Union Room');
  // Safari Zone: the Whole Park alone until every region is open and done (the owner's rule), then three weekly areas too
  await page.evaluate(() => route('hh')); await page.waitForTimeout(200);
  ok(await page.evaluate(() => [...document.querySelectorAll('.areachips .chip')].length) === 1, 'the Whole Park alone while regions wait');
  await page.evaluate(() => { const t = Date.now() - 30 * 864e5; regionRec('kanto').done = t; for (const id of REGION_IDS) if (!S.regions[id]) S.regions[id] = { at: t, starter: null, done: t }; route('hh'); });
  await page.waitForTimeout(200); await shot('301_areas');
  // (an event area, like a Legendary Safari, gets its own chip on top while it runs)
  ok(await page.evaluate(() => [...document.querySelectorAll('.areachips .chip')].filter(c => !/^EVENT/i.test(c.textContent.trim())).length) === 4, 'every region done: three weekly areas and the Whole Park');
  // Union Room: the world talks, and answers the player
  await page.evaluate(() => { UI.chatTab = 'world'; route('chat'); });
  const before = await page.evaluate(() => S.chat.world.length);
  ok(before >= 5, `the Union Room has recent messages when you arrive (${before})`);
  await page.fill('#cin', 'hey everyone, who should I put on my team first?'); await page.click('[data-act="chatSend"]');
  for (let k = 0; k < 8; k++) { await page.evaluate(() => { for (const x of S.chat.q) x.at -= 20000; tickTimers(); }); await page.waitForTimeout(120); }
  const replies = await page.evaluate(() => { const i = S.chat.world.findIndex(m => m.i === -1); return S.chat.world.slice(i + 1).filter(m => m.i >= 0).length; });
  ok(replies >= 1, `other Trainers reply (${replies})`);
  await shot('302_chat');
  console.log('sample lines:', JSON.stringify(await page.evaluate(() => S.chat.world.slice(-6).map(m => npcName(m.i) + ': ' + m.txt))));
  // personalities differ
  const kinds = await page.evaluate(() => new Set(Array.from({ length: 300 }, (_, i) => person(i).arch + person(i).style.laugh)).size);
  ok(kinds > 40, `varied personalities (${kinds} archetype/style combos in 300 Trainers)`);
  // the personalities: every one has Trainers, each inside its own family, favourites that fit it, and its own lines in chat
  const pers = await page.evaluate(() => {
    const seen = new Set(), bad = [];
    for (let i = 0; i < LADDER_N; i++) {
      const p = person(i), P = personaOf(p);
      if (!P || P.a !== p.arch) { bad.push(i); continue; }
      seen.add(P.id);
      if ((P.op && !p.fav.some(k => P.op.includes(k))) || (P.ty && !OPS[p.fav[0]].types.some(t => P.ty.includes(t)))) bad.push(i);
    }
    const own = Array.from({ length: 30 }, (_, k) => npcLine(person(k * 7), 'persona', {}));
    const fam = {}; for (const P of PERSONAS) fam[P.a] = (fam[P.a] || 0) + 1;
    return { total: PERSONAS.length, names: new Set(PERSONAS.map(P => P.n)).size, seen: seen.size, families: Object.keys(fam).length, sizes: Object.values(fam).every(n => n >= 12), gen: GEN_FAMILIES.length,
      bad: bad.length, own: own.filter(t => t && !/\{\w+\}/.test(t)).length };
  });
  // Trainers explain their own team, its Pokémon and the Ranked tiers, and "explain it" follows on from what they just said
  const talk = await page.evaluate(() => {
    const say = (i, t) => { const r = talkAnswer(i, -1, t, 'dm'); return r.parts ? r.parts.join(' ') : ''; };
    // (a world a month old: a new game's world starts with everyone at the beginning, the Journey revamp)
    S.world.start = Date.now() - 30 * 864e5; ladderDrift(S.ladder, 48); DOC_CACHE.clear();
    let i = LADDER_N - 1; while (i > 0 && !(ladderDoc(i).arch && tierIdx(S.ladder.pop[i]) >= T_MASTER)) i--;
    const d = ladderDoc(i), A = d.arch.n, k = d.team[1];
    say(i, 'what team do you run?');
    const follow = say(i, 'can you explain it to me please'), why = say(i, `why do you use ${OPS[k].n}?`);
    const tier = say(i, `is ${TIERS[tierIdx(S.ladder.pop[i])].n.toLowerCase()} tier hard?`), climb = say(i, 'how do I get to master ball?');
    return { team: follow.includes(A) && d.team.every(x => follow.includes(OPS[x].n)), member: why.includes(OPS[k].cls) && why.includes(MOVES[d.prog[k].mv[2]].n),
      tier: /myself|came up through|haven't made/.test(tier) && tier.includes('points'), climb: climb.includes('Master Ball') && climb.includes('to go') };
  });
  ok(talk.team && talk.member && talk.tier && talk.climb, `Trainers explain their team, one of its Pokémon and the tiers (${JSON.stringify(talk)})`);
  ok(pers.total >= 2396 && pers.gen === 1000 && pers.names === pers.total && pers.seen === pers.total && pers.families === 32 && pers.sizes && pers.bad === 0 && pers.own === 30,
    `1,000 families and 2,396 personalities over the 32 base families, all in use, each Trainer in its family with fitting favourites (${JSON.stringify(pers)})`);
  // Clubs: join an open one, contribute, Raid Battle
  await page.evaluate(() => { S.lvl = 30; S.lmd = 500000; route('guild'); }); await page.waitForTimeout(200); await shot('303_club_find');
  await page.evaluate(() => { const g = guildList().find(x => x.pol === 'open' && x.mem.length < guildCap(x) && x.minLvl <= S.lvl); requestJoin(g); });
  ok(await page.evaluate(() => !!S.guild && myGuild().mem.includes(-1)), 'joined an open Club');
  await page.evaluate(() => { UI.gTab = 'donate'; rerender(); }); await page.click('[data-act="gdonate"][data-id="lmd"]'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => myGuild().don.by[-1] === 'lmd'), 'contributed');
  await page.evaluate(() => { closeModal(); UI.gTab = 'boss'; rerender(); }); await page.waitForTimeout(200); await shot('304_raid');
  const hp0 = await page.evaluate(() => gBoss(myGuild()).hp);
  await page.evaluate(() => { S.settings.speed = 3; S.settings.auto = true; S.badges = 6; for (const k of ['blastoise', 'alakazam', 'snorlax', 'jolteon']) S.ops[k] = progForLV(k, 55); S.team.gboss = ['blastoise', 'alakazam', 'snorlax', 'jolteon']; });
  await page.click('[data-act="gbossGo"]'); await page.waitForTimeout(300);
  await page.click('[data-act="deploy"]');
  await page.waitForTimeout(3500); await shot('305_raid_battle');
  await page.waitForSelector('#rDone', { timeout: 240000 }); await shot('306_raid_result');
  await page.click('#rDone'); await page.waitForTimeout(300);
  ok(await page.evaluate(h => gBoss(myGuild()).hp < h || gBoss(myGuild()).stage > 1, hp0), 'the Raid Battle dealt damage');
  ok(await page.evaluate(() => gbTriesLeft() === 1), 'one Raid Pass left today');
  console.log('raid', JSON.stringify(await page.evaluate(() => { const b = gBoss(myGuild()); return { key: b.key, stage: b.stage, hp: Math.round(b.hp), max: b.max, ref: b.ref, mine: b.hits[-1] }; })));
  // a Club member's profile
  await page.evaluate(() => profModal(myGuild().mem.find(i => i >= 0))); await page.waitForTimeout(200); await shot('307_profile');
  await page.evaluate(() => closeModal());
  // Trainer Card: chat options and save codes
  await page.evaluate(() => route('settings')); await page.waitForTimeout(200);
  await page.click('[data-act="setTog2"][data-k="filter"][data-v="1"]');
  ok(await page.evaluate(() => S.settings.filter === true), 'the rude-word filter can be switched on');
  await page.evaluate(() => { const el = [...document.querySelectorAll('#view h3')].find(h => h.textContent === 'Union Room'); if (el) el.scrollIntoView(); }); await page.waitForTimeout(100); await shot('308_trainer_card');
  // landscape home
  await page.setViewportSize({ width: 844, height: 390 }); await page.evaluate(() => route('home')); await page.waitForTimeout(400); await shot('310_home_landscape');
  console.log('ERRORS', JSON.stringify(errs));
  if (errs.length) process.exitCode = 1;
  await browser.close();
})();
