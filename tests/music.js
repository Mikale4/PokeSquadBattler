// Music: the FireRed/LeafGreen tracks in resources/audio/music (and the Johto Journey's HeartGold/SoulSilver ones in resources/audio/johto, the Hoenn Journey's Ruby/Sapphire ones in resources/audio/hoenn, the Sinnoh Journey's Diamond/Pearl and Platinum ones in resources/audio/sinnoh, the Kalos Journey's X and Y ones in resources/audio/kalos) load and play on the right screens, in battle and after a win,
// the jingles play over them, and the volume setting works. Run: node tests/music.js
const path = require('path'), fs = require('fs');
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../PokeSquad Battler.html')).href;
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
  // every file the game names exists
  const src = fs.readFileSync(path.resolve(__dirname, '../src/a8c_sfx.js'), 'utf8');
  const files = [...src.matchAll(/"(\d-\d\d\. [^"]+\.mp3)"/g)].map(m => m[1]);
  const missing = files.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/music', f)));
  ok(files.length >= 36 && !missing.length, `all ${files.length} tracks the game names are in resources/audio/music${missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''}`);
  // the Johto Journey's HeartGold/SoulSilver tracks are in resources/audio/johto
  const jo = [...src.matchAll(/"jo:([^"]+\.mp3)"/g)].map(m => m[1]);
  const joMissing = jo.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/johto', f)));
  ok(jo.length >= 42 && !joMissing.length, `all ${jo.length} Johto tracks the game names are in resources/audio/johto${joMissing.length ? ' (missing: ' + joMissing.join(', ') + ')' : ''}`);
  // and the Hoenn Journey's Ruby/Sapphire tracks in resources/audio/hoenn
  const ho = [...new Set([...src.matchAll(/"ho:([^"]+\.mp3)"/g)].map(m => m[1]))];
  const hoMissing = ho.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/hoenn', f)));
  ok(ho.length === 85 && !hoMissing.length, `all ${ho.length} Hoenn tracks the game names are in resources/audio/hoenn${hoMissing.length ? ' (missing: ' + hoMissing.join(', ') + ')' : ''}`);
  // and the Sinnoh Journey's Diamond/Pearl and Platinum tracks in resources/audio/sinnoh
  const si = [...new Set([...src.matchAll(/"si:([^"]+\.mp3)"/g)].map(m => m[1]))];
  const siMissing = si.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/sinnoh', f)));
  ok(si.length === 89 && !siMissing.length, `all ${si.length} Sinnoh tracks the game names are in resources/audio/sinnoh${siMissing.length ? ' (missing: ' + siMissing.join(', ') + ')' : ''}`);
  // and the Kalos Journey's X and Y tracks in resources/audio/kalos (the owner's download: the core set and its extras)
  const ka = [...new Set([...src.matchAll(/"ka:([^"]+\.mp3)"/g)].map(m => m[1]))];
  const kaMissing = ka.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/kalos', f)));
  ok(ka.length === 126 && !kaMissing.length, `all ${ka.length} Kalos tracks the game names are in resources/audio/kalos${kaMissing.length ? ' (missing: ' + kaMissing.join(', ') + ')' : ''}`);
  // and the Alola Journey's Sun and Moon and Ultra Sun and Ultra Moon tracks in resources/audio/alola (the owner's download: the core set and its extras)
  const al = [...new Set([...src.matchAll(/"al:([^"]+\.mp3)"/g)].map(m => m[1]))];
  const alMissing = al.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/alola', f)));
  ok(al.length === 184 && !alMissing.length, `all ${al.length} Alola tracks the game names are in resources/audio/alola${alMissing.length ? ' (missing: ' + alMissing.join(', ') + ')' : ''}`);
  // and the Galar Journey's in resources/audio/galar (the owner's download: the Sword and Shield + Expansion Pass Super Music Collection, its expanded upload)
  const ga = [...new Set([...src.matchAll(/"ga:([^"]+\.mp3)"/g)].map(m => m[1]))];
  const gaMissing = ga.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/galar', f)));
  ok(ga.length === 163 && !gaMissing.length, `all ${ga.length} Galar tracks the game names are in resources/audio/galar${gaMissing.length ? ' (missing: ' + gaMissing.join(', ') + ')' : ''}`);
  // and the Paldea Journey's in resources/audio/paldea (the owner's download: the whole Scarlet and Violet + The Hidden Treasure of Area Zero Super Music Collection)
  const pa = [...new Set([...src.matchAll(/"pa:([^"]+\.mp3)"/g)].map(m => m[1]))];
  const paMissing = pa.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/paldea', f)));
  ok(pa.length === 208 && !paMissing.length, `all ${pa.length} Paldea tracks the game names are in resources/audio/paldea${paMissing.length ? ' (missing: ' + paMissing.join(', ') + ')' : ''}`);
  // Pokémon Showdown's battle themes (the Battle Stadium's cycle) are in resources/audio/showdown
  const sd = (src.match(/const SD_THEMES = \[([^\]]+)\]/) || [, ""])[1].match(/"([a-z0-9-]+)"/g).map(x => x.slice(1, -1));
  const sdMissing = sd.filter(f => !fs.existsSync(path.resolve(__dirname, '../resources/audio/showdown', f + '.mp3')));
  ok(sd.length === 19 && !sdMissing.length, `all ${sd.length} of Showdown's battle themes are in resources/audio/showdown${sdMissing.length ? ' (missing: ' + sdMissing.join(', ') + ')' : ''}`);
  // the current track: which one, and whether it actually loaded and plays
  const now = () => page.evaluate(() => new Promise(res => {
    const el = MUS.el; if (!el) return res({ key: MUS.key, el: false });
    const done = () => res({ key: MUS.key, file: decodeURIComponent(el.src.split('/').pop()), playing: !el.paused, dur: Math.round(el.duration || 0), err: el.error && el.error.code });
    if (el.readyState >= 1) done(); else { el.addEventListener('loadedmetadata', done, { once: true }); el.addEventListener('error', done, { once: true }); setTimeout(done, 3000); }
  }));
  await page.goto(PAGE); await page.waitForTimeout(1200);
  let m = await now(); ok(m.key === 'title' && m.playing && m.dur > 60 && !m.err, `title screen plays ${m.file} (${m.dur}s)`);
  await page.evaluate(() => { enterGuest(); S.named = true; S.seenIntro = true; S.starter = 'squirtle'; S.ops.squirtle = mkProg(20, 'squirtle'); S.team.story = ['squirtle']; closeModal(); route('home'); });
  await page.waitForTimeout(900); m = await now(); ok(m.key === 'home' && m.playing && !m.err, `home plays ${m.file}`);
  const screens = [['chapter', 'c5', 'lavender'], ['hh', null, 'gameCorner'], ['chat', null, 'union'], ['shop', null, 'center'], ['inbox', null, 'mystery'], ['arena', null, 'plateau']];
  for (const [v, a, want] of screens) { await page.evaluate(([v, a]) => route(v, a), [v, a]); await page.waitForTimeout(700); m = await now(); ok(m.key === want && !m.err, `${v}${a ? ' ' + a : ''} plays ${m.file}`); }
  // a wild battle: battle theme, then the victory theme
  await page.evaluate(() => { S.settings.speed = 3; S.settings.auto = true; startBattle({ allies: [{ op: 'squirtle', prog: S.ops.squirtle }], waves: [[{ op: 'rattata', LV: 2 }]], wild: true, title: 'Test', sub: 'Test', onWin: () => ({ rewards: [] }) }); });
  await page.waitForTimeout(800); m = await now(); ok(m.key === 'wild' && m.playing, `wild battles play ${m.file}`);
  await page.waitForSelector('#rDone', { timeout: 60000 }); await page.waitForTimeout(300);
  m = await now(); ok(m.key === 'wildWin' && m.playing, `winning plays ${m.file}`);
  await page.click('#rDone'); await page.waitForTimeout(700); m = await now(); ok(m.key === 'plateau', `back on the Stadium screen: ${m.file}`);
  // Ranked, Link and friendly battles: a theme picked at random each battle (never the same twice in a row), Showdown's included
  const picks = await page.evaluate(() => Array.from({ length: 80 }, () => stadiumTheme()));
  ok(new Set(picks).size >= 12 && picks.every((k, i) => i === 0 || k !== picks[i - 1]) && picks.some(k => k.startsWith('sd:')) && !picks.some(k => /subway|kanto-gym|elite4|homika|miror/.test(k)),
    `the Stadium cycles its battle themes (${new Set(picks).size} different in 80 battles, none twice in a row)`);
  // the owner's picks elsewhere: the Battle Tower, Raid Battles, Team Rocket
  const where = await page.evaluate(() => { const rocket = Object.values(NODES).find(n => n.trainer && /Team Rocket Grunt/.test(n.trainer.name)), gio = Object.values(NODES).find(n => n.badgeWin != null && n.trainer && /Giovanni/.test(n.trainer.name));
    return { rocket: nodeMusic(rocket).bgm, gioGym: nodeMusic(gio).bgm, tower: [TOWER_THEME, TOWER_STAR_THEME], raid: RAID_THEMES }; });
  ok(/miror/.test(where.rocket) && where.gioGym === 'gym' && /subway/.test(where.tower[0]) && /kanto-gym/.test(where.tower[1]) && where.raid.length === 2, `Team Rocket, the Battle Tower and Raid Battles have their own themes (${JSON.stringify(where)})`);
  await page.evaluate(() => { startBattle({ allies: [{ op: 'squirtle', prog: S.ops.squirtle }], waves: [[{ op: 'rattata', LV: 2 }]], title: 'Test', sub: 'Test', pvp: true, bgm: 'sd:xy-trainer', onWin: () => ({ rewards: [] }) }); });
  await page.waitForTimeout(900); m = await now(); ok(m.key === 'sd:xy-trainer' && m.playing && m.dur > 30 && !m.err, `a Showdown theme plays in a Stadium battle: ${m.file} (${m.dur}s)`);
  await page.waitForSelector('#rDone', { timeout: 60000 }); await page.click('#rDone'); await page.waitForTimeout(700);
  // a Gym battle picks the Gym Leader theme
  ok(await page.evaluate(() => nodeMusic(Object.values(NODES).find(n => n.badgeWin === 0)).bgm === 'gym' && nodeMusic(Object.values(NODES).find(n => n.champion)).bgm === 'champion'), 'Gym Leaders and the Champion have their own themes');
  // the Johto Journey: its chapters play Johto's places, its battles Johto's themes
  await page.evaluate(() => { S.regions = { johto: { at: Date.now(), starter: 'totodile' } }; S.region = 'johto'; route('chapter', 'joc1'); }); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'joRoute29' && m.playing && m.dur > 30 && !m.err, `a Johto chapter plays ${m.file} (${m.dur}s)`);
  const jm = await page.evaluate(() => { const J = Object.values(NODES).filter(n => n.ep.id === 'johto'), f = p => J.find(p);
    return { gym: nodeMusic(f(n => n.badgeWin === 0)).bgm, champ: nodeMusic(f(n => n.champion)).bgm, fame: nodeMusic(f(n => n.champion)).winBgm, rival: nodeMusic(f(n => n.rivalWaves)).bgm,
      rocket: nodeMusic(f(n => n.trainer && /Archer/.test(n.trainer.name))).bgm, lugia: nodeMusic(f(n => n.catch === 'lugia')).bgm, red: nodeMusic(f(n => n.trainer && /Red/.test(n.trainer.name))).bgm,
      wild: nodeMusic(f(n => n.wild && n.catch === 'sentret')).bgm, trainer: nodeMusic(f(n => n.trainer && /Joey/.test(n.trainer.name))).bgm,
      kanto: nodeMusic(f(n => n.ch.kanto && n.trainer && /Brock/.test(n.trainer.name))).bgm }; });   // (Crystal's trip to Kanto: HeartGold/SoulSilver's Kanto Gym Leader theme)
  ok(jm.gym === 'joGym' && jm.champ === 'joChampion' && jm.fame === 'joFame' && jm.rival === 'joRival' && jm.rocket === 'joRocket' && jm.lugia === 'joLugia' && jm.red === 'joChampion' && jm.wild === 'joWild' && jm.trainer === 'joTrainer' && jm.kanto === 'joGymKanto',
    `Johto's battles have Johto's themes (${JSON.stringify(jm)})`);
  // Johto's Battle Tower wing: HeartGold/SoulSilver's Battle Tower over its floors, its reception desk while you pick a team, the Frontier Brains' theme
  const jb = await page.evaluate(() => { const b = towerFloors('johto').find(T => /Frontier/.test(T.from)); return { brain: b && b.bgm, brainWin: b && b.winBgm, hall: BGM.joGymHall }; });
  ok(jb.brain === 'joFrontierBrain' && jb.brainWin === 'joFrontierWin' && !!jb.hall, `Johto's Frontier Brains and Gym hall have their tracks (${JSON.stringify(jb)})`);
  await page.evaluate(() => { UI.tw = 'johto'; route('tower'); }); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'joBattleTower' && m.playing && m.dur > 30 && !m.err, `the Battle Tower's Johto wing plays ${m.file} (${m.dur}s)`);
  await page.evaluate(() => teamScreen('tower', 'Battle Tower', 0, [], ['tower', null], { kind: 'tower', w: 'johto', f: 1 })); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'joTowerDesk' && m.playing && m.dur > 30 && !m.err, `picking a team for a Johto floor plays ${m.file} (${m.dur}s)`);
  // the Hoenn Journey: its chapters play Hoenn's places, its battles Hoenn's themes
  await page.evaluate(() => { S.regions = { hoenn: { at: Date.now(), starter: 'mudkip' } }; S.region = 'hoenn'; route('chapter', 'hoc1'); }); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'hoRoute101' && m.playing && m.dur > 30 && !m.err, `a Hoenn chapter plays ${m.file} (${m.dur}s)`);
  const hm = await page.evaluate(() => { const H = Object.values(NODES).filter(n => n.ep.id === 'hoenn'), f = p => H.find(p);
    return { gym: nodeMusic(f(n => n.badgeWin === 0)).bgm, twins: nodeMusic(f(n => n.badgeWin === 6)).bgm, champ: nodeMusic(f(n => n.champion)).bgm, fame: nodeMusic(f(n => n.champion)).winBgm,
      e4: nodeMusic(f(n => n.trainer && /Elite Four/.test(n.trainer.name))).bgm, rival: nodeMusic(f(n => n.rivalWaves)).bgm, grunt: nodeMusic(f(n => n.trainer && /Team Aqua Grunt/.test(n.trainer.name))).bgm,
      boss: nodeMusic(f(n => n.trainer && /Magma Leader/.test(n.trainer.name))).bgm, kyogre: nodeMusic(f(n => n.catch === 'kyogre')).bgm, regi: nodeMusic(f(n => n.catch === 'regice')).bgm,
      wally: nodeMusic(f(n => n.trainer && n.trainer.name === 'Wally')).bgm, wild: nodeMusic(f(n => n.wild && n.catch === 'poochyena')).bgm }; });
  ok(hm.gym === 'hoGym' && hm.twins === 'hoGym' && hm.champ === 'hoChampion' && hm.fame === 'hoFame' && hm.e4 === 'hoE4' && hm.rival === 'hoRival' && hm.grunt === 'hoTeam' && hm.boss === 'hoBoss'
    && hm.kyogre === 'hoAncient' && hm.regi === 'hoRegi' && hm.wally === 'hoTrainer' && hm.wild === 'hoWild', `Hoenn's battles have Hoenn's themes (${JSON.stringify(hm)})`);
  // a Hoenn track loads and plays (a battle theme, a file name with the album's double spaces)
  await page.evaluate(() => music('hoRival')); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'hoRival' && m.playing && m.dur > 30 && !m.err, `a Hoenn battle theme plays ${m.file} (${m.dur}s)`);
  // Emerald's own tracks: the clash in Sootopolis, Rayquaza's arrival, and the Battle Tower's Hoenn wing (the Battle Frontier while you
  // look over its floors, the Battle Tower's lobby while you pick a team, the Frontier Brains' battles)
  const he = await page.evaluate(() => { const H = Object.values(NODES).filter(n => n.ep.id === 'hoenn'), brain = towerFloors('hoenn').find(T => /Frontier/.test(T.from));
    return { clash: H.find(n => n.name === 'The Clash in Sootopolis').music, ray: H.find(n => n.name === 'Rayquaza Descends').music, brain: brain && brain.bgm, brainWin: brain && brain.winBgm }; });
  ok(he.clash === 'hoAbnormal' && he.ray === 'hoRayquaza' && he.brain === 'hoFrontierBrain' && he.brainWin === 'hoGymWin', `Emerald's own tracks have their places (${JSON.stringify(he)})`);
  await page.evaluate(() => { UI.tw = 'hoenn'; route('tower'); }); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'hoFrontier' && m.playing && m.dur > 30 && !m.err, `the Battle Tower's Hoenn wing plays ${m.file} (${m.dur}s)`);
  await page.evaluate(() => teamScreen('tower', 'Battle Tower', 0, [], ['tower', null], { kind: 'tower', w: 'hoenn', f: 1 })); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'hoBattleTower' && m.playing && m.dur > 30 && !m.err, `picking a team for a Hoenn floor plays ${m.file} (${m.dur}s)`);
  await page.evaluate(() => music('hoRayquaza')); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'hoRayquaza' && m.playing && m.dur > 20 && !m.err, `Rayquaza's arrival plays ${m.file} (${m.dur}s)`);
  // Emerald's encounter themes in the stages' scenes (the rival's follows who the rival is), Deoxys, and each Frontier Brain's facility
  const en = await page.evaluate(() => { const H = Object.values(NODES).filter(n => n.ep.id === 'hoenn'), f = name => H.find(n => n.name === name), R = f("Route 103: the Professor's Kid");
    const look = l => { S.avatar = l; return R.music; }, may = look('red'), brendan = look('leaf'); S.avatar = 'red';
    const tucker = towerFloors('hoenn').find(T => /Dome Ace/.test(T.trainer.name)), anabel = towerFloors('hoenn').find(T => /Salon Maiden/.test(T.trainer.name));
    return { may, brendan, help: f("Route 101: Professor Birch's Bag").music, aqua: f('Petalburg Woods: Team Aqua').music, magma: f('Mt. Chimney: Admin Tabitha').music,
      josh: f('Rustboro Gym: Youngster Josh').music, e4: f('Elite Four Drake').music, champ: f('Champion Wallace').music, boat: f("Mr. Briney's Boat").music,
      deoxys: f('Birth Island: Deoxys').music, deoxysBattle: nodeMusic(f('Birth Island: Deoxys')).bgm, tucker: tucker.lobby, anabel: anabel.lobby || null, symbol: tucker.winJingle, jingle: !!JINGLE[tucker.winJingle] }; });
  ok(en.may === 'hoMeetMay' && en.brendan === 'hoMeetBrendan' && en.help === 'hoHelp' && en.aqua === 'hoMeetAqua' && en.magma === 'hoMeetMagma' && en.josh === 'hoEyesYoungster'
    && en.e4 === 'hoMeetE4' && en.champ === 'hoMeetChampion' && en.boat === 'hoSailing' && en.deoxys === 'hoDeoxysAppears' && en.deoxysBattle === 'hoDeoxys'
    && en.tucker === 'hoDome' && en.anabel === 'hoBattleTower' && en.symbol === 'hoSymbol' && en.jingle, `Hoenn's encounter themes, Deoxys and the Frontier's facilities have their places (${JSON.stringify(en)})`);
  await page.evaluate(() => { const T = towerFloors('hoenn').find(T => /Pike Queen/.test(T.trainer.name)); teamScreen('tower', 'Battle Tower', 0, [], ['tower', null], { kind: 'tower', w: 'hoenn', f: T.f }); }); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'hoPike' && m.playing && m.dur > 30 && !m.err, `picking a team for Pike Queen Lucy plays ${m.file} (${m.dur}s)`);
  await page.evaluate(() => music('hoEyesAce')); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'hoEyesAce' && m.playing && m.dur > 20 && !m.err, `an encounter theme plays ${m.file} (${m.dur}s)`);
  // the Sinnoh Journey: its chapters play Sinnoh's places, its battles Sinnoh's themes, and a Platinum track plays (a file name with the
  // album's double spaces)
  await page.evaluate(() => { S.regions = { sinnoh: { at: Date.now(), starter: 'piplup' } }; S.region = 'sinnoh'; route('chapter', 'sic1'); }); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'siRoute201' && m.playing && m.dur > 30 && !m.err, `a Sinnoh chapter plays ${m.file} (${m.dur}s)`);
  const sm = await page.evaluate(() => { const N = Object.values(NODES).filter(n => n.ep.id === 'sinnoh'), f = p => N.find(p), who = re => f(n => n.trainer && re.test(n.trainer.name));
    return { gym: nodeMusic(f(n => n.badgeWin === 0)).bgm, champ: nodeMusic(f(n => n.champion)).bgm, fame: nodeMusic(f(n => n.champion)).winBgm, e4: nodeMusic(who(/Elite Four Aaron/)).bgm,
      rival: nodeMusic(f(n => n.rivalWaves)).bgm, grunt: nodeMusic(who(/Team Galactic Grunts?$/)).bgm, commander: nodeMusic(who(/^Commander/)).bgm, boss: nodeMusic(who(/Galactic Boss/)).bgm,
      giratina: nodeMusic(f(n => n.catch === 'giratinaorigin')).bgm, palkia: nodeMusic(f(n => n.catch === 'palkia')).bgm, azelf: nodeMusic(f(n => n.catch === 'azelf')).bgm,
      tag: nodeMusic(who(/Flint & Leader Volkner/)).bgm, wild: nodeMusic(f(n => n.wild && n.catch === 'shinx')).bgm }; });
  ok(sm.gym === 'siGym' && sm.champ === 'siChampion' && sm.fame === 'siFame' && sm.e4 === 'siE4' && sm.rival === 'siRival' && sm.grunt === 'siTeam' && sm.commander === 'siCommander' && sm.boss === 'siBoss'
    && sm.giratina === 'siGiratina' && sm.palkia === 'siDialga' && sm.azelf === 'siLakeTrio' && sm.tag === 'siGym' && sm.wild === 'siWild', `Sinnoh's battles have Sinnoh's themes (${JSON.stringify(sm)})`);
  await page.evaluate(() => music('siDialga')); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'siDialga' && m.playing && m.dur > 30 && !m.err, `a Sinnoh battle theme plays ${m.file} (${m.dur}s)`);
  // the Kalos Journey: its chapters play Kalos's places, its battles X and Y's themes, and a Friends Theme plays (its double quotes are
  // single quotes in the file name)
  await page.evaluate(() => { S.regions = { kalos: { at: Date.now(), starter: 'froakie' } }; S.region = 'kalos'; route('chapter', 'kac1'); }); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'kaRoute1' && m.playing && m.dur > 30 && !m.err, `a Kalos chapter plays ${m.file} (${m.dur}s)`);
  const km = await page.evaluate(() => { const N = Object.values(NODES).filter(n => n.ep.id === 'kalos'), f = p => N.find(p), who = re => f(n => n.trainer && re.test(n.trainer.name));
    return { gym: nodeMusic(f(n => n.badgeWin === 0)).bgm, champ: nodeMusic(f(n => n.champion)).bgm, fame: nodeMusic(f(n => n.champion)).winBgm, e4: nodeMusic(who(/Elite Four Malva/)).bgm,
      rival: nodeMusic(f(n => n.rivalWaves)).bgm, grunt: nodeMusic(who(/Team Flare Grunts?$/)).bgm, lysandre: nodeMusic(who(/Lysandre/)).bgm, korrina: nodeMusic(f(n => /Tower of Mastery: Korrina/.test(n.name))).bgm,
      xerneas: nodeMusic(f(n => n.catch === 'xerneas')).bgm, mewtwo: nodeMusic(f(n => n.catch === 'mewtwo')).bgm, wild: nodeMusic(f(n => n.wild && n.catch === 'fletchling')).bgm }; });
  ok(km.gym === 'kaGym' && km.champ === 'kaChampion' && km.fame === 'kaFame' && km.e4 === 'kaE4' && km.rival === 'kaFriend' && km.grunt === 'kaTeam' && km.lysandre === 'kaLysandreBattle'
    && km.korrina === 'kaKorrina' && km.xerneas === 'kaXYZ' && km.mewtwo === 'kaMewtwo' && km.wild === 'kaWild', `Kalos's battles have Kalos's themes (${JSON.stringify(km)})`);
  await page.evaluate(() => music('kaFriendsMeet')); await page.waitForTimeout(900);
  m = await now(); ok(m.key === 'kaFriendsMeet' && m.playing && m.dur > 30 && !m.err, `an X and Y track plays ${m.file} (${m.dur}s)`);
  // jingles pause the track and it carries on afterwards
  await page.evaluate(() => jingle('badge')); await page.waitForTimeout(400);
  ok(await page.evaluate(() => !!MUS.jingle && MUS.el.paused), 'a jingle pauses the music');
  await page.waitForTimeout(10000);
  ok(await page.evaluate(() => !MUS.jingle && !MUS.el.paused), 'the music carries on after the jingle');
  // volume: off stops it, on brings it back
  await page.evaluate(() => { route('settings'); }); await page.waitForTimeout(500);
  await page.click('[data-act="setMusic"][data-v="0"]'); await page.waitForTimeout(600);
  ok(await page.evaluate(() => !MUS.el && S.settings.music === 0), 'Music: Off stops it');
  await page.click('[data-act="setMusic"][data-v="0.8"]'); await page.waitForTimeout(900);
  m = await now(); ok(m.playing && await page.evaluate(() => S.settings.music === .8), `Music: High plays ${m.file} again`);
  console.log('ERRORS', JSON.stringify(errs));
  if (errs.length) process.exitCode = 1;
  await browser.close();
})();
