// Data and sprite check: every Pokémon has front and back sprites (the owner's PNG stills, and they load), its menu picture decodes
// back to the same pixels, every kit move exists, every Ability has a battle effect, every evolution target exists, and
// every trainer sprite the Journey uses is embedded.
// Also saves a screenshot of a completed Pokédex. Run: node tests/figures.js
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const SH = path.join(__dirname, 'shots') + '/'; fs.mkdirSync(SH, { recursive: true });
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../Pokemon Kanto Squad.html')).href;
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(PAGE);
  await page.waitForFunction(() => SPR.ready, null, { timeout: 30000 });
  const report = await page.evaluate(() => {
    const bad = [];
    for (const k of OP_KEYS) {
      for (const [s, n] of [['f', 'front'], ['b', 'back']]) {
        const a = SPR.ani[s + ':' + k];
        if (!a) bad.push(`${k}: no ${n} sprite`); else if (!(a.w > 0 && a.h > 0)) bad.push(`${k}: ${n} sprite is empty`);   // (still PNGs since the Gen 5 expansion)
      }
      if (!SPR.icon[k]) bad.push(k + ': no menu icon');
      if (!OPS[k].skills.length) bad.push(k + ': no moves');
      // FireRed/LeafGreen moves: every level-up move and TM exists, has a slot and a sound
      for (const [lv, m] of OPS[k].learn) if (!MOVES[m] || ![1, 2, 3].includes(MOVES[m].s) || !(RES_DATA.msfx || {})[m]) bad.push(`${k}: level-up move ${m} (Lv ${lv}) is missing, has no slot or no sound`);
      for (const n of OPS[k].tms) if (!TM_MOVE[n]) bad.push(`${k}: unknown TM ${n}`);
      for (const lv of [5, 30, 100]) defaultMoves(k, lv).forEach((m, i) => { if (m && MOVES[m].s !== i + 1) bad.push(`${k}: Lv ${lv} default ${m} in the wrong slot`); });
      if (OPS[k].passives[0].id === 'NONE') bad.push(k + ': ability ' + OPS[k].ab + ' has no effect');
      for (const e of OPS[k].evo) if (!OPS[e.to]) bad.push(k + ': evolves into unknown ' + e.to);
    }
    const trainers = new Set();
    for (const id in NODES) { const nd = NODES[id]; if (nd.trainer) trainers.add(nd.trainer.spr); }
    for (const id in SPK) if (SPK[id].t && SPK[id].t !== 'me') trainers.add(SPK[id].t);
    for (const [, s] of ARENA_CLS) trainers.add(s);
    for (const w of towerWings()) for (const T of towerFloors(w)) trainers.add(T.trainer.spr);   // (every Battle Tower wing's Trainers)
    for (const t of trainers) if (!SPR.box['t:' + t] && !(RES_DATA.trainer || {})[t]) bad.push('trainer sprite missing: ' + t);   // (Showdown's set, or the owner's pack: tools/trainer_sprites.json)
    // every move has Pokémon Showdown's animation (its own, or the one Showdown gives it), and every picture those use is here
    for (const k of Object.keys(MOVES)) if (!BattleMoveAnims[PS_ALIAS[k] || k] || typeof BattleMoveAnims[PS_ALIAS[k] || k].anim !== 'function') bad.push(`${k}: no Showdown animation`);
    for (const [k, e] of Object.entries(BattleEffects)) if (e.url && !psImg(e.url)) bad.push(`Showdown effect ${k}: picture ${e.url} is missing`);
    for (const s of Object.values(PS_STATUS)) if (!BattleStatusAnims[s]) bad.push(`status animation ${s} is missing`);
    // the battle text is Showdown's: weather and terrain lines from its text, status lines resolve, nothing left unfilled
    for (const [w, id] of Object.entries({ sun: 'sunnyday', rain: 'raindance', sand: 'sandstorm', hail: 'hail' })) if (WEATHER[w].turn !== psT(id, 'start') || WEATHER[w].end !== psT(id, 'end')) bad.push(`weather ${w}: not Showdown's text`);
    if (WEATHER.snow !== WEATHER.hail) bad.push('hail and snow should be one weather');
    for (const [t, id] of Object.entries({ electric: 'electricterrain', grassy: 'grassyterrain', misty: 'mistyterrain', psychic: 'psychicterrain' })) if (TERRAIN[t].start !== psT(id, 'start')) bad.push(`terrain ${t}: not Showdown's text`);
    for (const id of ['brn', 'psn', 'tox', 'par', 'slp', 'frz', 'confusion', 'attract', 'leechseed']) { const s = psT(id, 'start', { POKEMON: 'x' }); if (!s || /[{}]/.test(s)) bad.push(`status text ${id}: ${s}`); }
    for (const l of ['weather-sunnyday.jpg', 'weather-raindance.jpg', 'weather-sandstorm.png', 'weather-hail.png', 'weather-electricterrain.png', 'weather-grassyterrain.png', 'weather-mistyterrain.png', 'weather-psychicterrain.png', 'weather-trickroom.png']) if (!psImg(l)) bad.push(`weather layer ${l} is missing`);
    // every Pokémon a battle puts out has evolved if it's at or past its evolution level, or Lv 36 for a stone or trade evolution
    // (the Journey with each starter, Explore, the Battle Tower); a Kanto Pokémon only into Kanto's evolutions (grownAt), and
    // never into another region's
    if (!S) enterGuest();   // (the Journey's rival needs a starter)
    // (another region's Journey: its own generation's Pokémon or earlier, growing only within them: journeyG)
    const under = (k, lv, g) => (OPS[k].evo || []).some(e => lv >= (e.lv || 36) && (g ? genOf(e.to) <= g : !kantoMon(k) || kantoMon(e.to))), was = S.starter, wasR = S.regions;
    for (const nd of Object.values(NODES)) if (nd.waves || nd.rivalWaves) for (const x of nodeWaves(nd).map(w => convWave(w, nd.lv, journeyG(nd))).flat()) if (journeyG(nd) ? genOf(x.op) > journeyG(nd) : !kantoMon(x.op)) bad.push(`${nd.id} ${nd.name}: ${x.op} isn't a ${REGION_NAME[nd.ep.id]} Journey Pokémon`);
    {
      for (const [st, jst, hst, sst, kst, ast, gst, pst] of [['bulbasaur', 'chikorita', 'treecko', 'turtwig', 'chespin', 'rowlet', 'grookey', 'sprigatito'], ['charmander', 'cyndaquil', 'torchic', 'chimchar', 'fennekin', 'litten', 'scorbunny', 'fuecoco'], ['squirtle', 'totodile', 'mudkip', 'piplup', 'froakie', 'popplio', 'sobble', 'quaxly']]) { S.starter = st; S.regions = { kanto: { at: 0, starter: st }, johto: { at: 0, starter: jst }, hoenn: { at: 0, starter: hst }, sinnoh: { at: 0, starter: sst }, kalos: { at: 0, starter: kst }, alola: { at: 0, starter: ast }, galar: { at: 0, starter: gst }, paldea: { at: 0, starter: pst } }; for (const nd of Object.values(NODES)) if (nd.waves || nd.rivalWaves) for (const x of nodeWaves(nd).map(w => convWave(w, nd.lv, journeyG(nd))).flat()) if (under(x.op, x.LV, journeyG(nd))) bad.push(`${nd.id} ${nd.name}: ${x.op} Lv ${x.LV} should have evolved`); }
      S.starter = was; S.regions = wasR;
      for (const h of HUNTS) for (let l = 1; l <= HUNT_LV.length; l++) for (const x of huntWaves(h, l).flat()) if (under(x.op, x.LV)) bad.push(`Explore ${h.n} ${l}: ${x.op} Lv ${x.LV} should have evolved`);
      // (every wing's floors: the house rule within the region lock, the region's own Pokémon, a picture for every Trainer, real items)
      for (const w of towerWings()) for (let f = 1; f <= towerFloors(w).length; f++) { const T = towerFloor(w, f), g = wingGen(w);
        for (const x of T.waves.map(wv => convWave(wv, T.lv, g)).flat()) { if (under(x.op, x.LV, g)) bad.push(`Tower ${w} ${f}: ${x.op} Lv ${x.LV} should have evolved`); if (regionForm(x.op, g) !== x.op) bad.push(`Tower ${w} ${f}: ${x.op} isn't a ${REGION_NAME[w]} Pokémon`); }
        for (const x of T.waves.flat()) if (x.held && !HELD[x.held]) bad.push(`Tower ${w} ${f}: no item ${x.held}`); }
      // a wild stage's catch is one of the Pokémon you battle there
      for (const nd of Object.values(NODES)) if (nd.wild && nd.catch && !nodeWaves(nd).flat().some(x => x.op === nd.catch)) bad.push(`${nd.id} ${nd.name}: you catch ${nd.catch} but never battle one`);
      // and the stage cards show the same Pokémon you'll meet
      for (const nd of Object.values(NODES)) if (nd.waves) for (const x of nd.waves.flat()) if (under(x.op, x.LV || nd.lv, journeyG(nd))) bad.push(`${nd.id} ${nd.name}: the stage lists ${x.op} Lv ${x.LV || nd.lv}`);
    }
    const types = {}; for (const k of OP_KEYS) for (const t of OPS[k].types) types[t] = (types[t] || 0) + 1;
    const rar = {}; for (const k of OP_KEYS) rar[OPS[k].rar] = (rar[OPS[k].rar] || 0) + 1;
    return { pokemon: OP_KEYS.length, moves: Object.keys(MOVES).length, sprites: SPR.loaded + '/' + SPR.total, types, rarity: rar, safari: [3, 4, 5].map(r => SAFARI_POOL(r).length), bad };
  });
  // the menus' animated GIFs (encoded in the browser) decode back to the sheet's frames, pixel for pixel
  const gif = await page.evaluate(async () => {
    const bad = [], t0 = performance.now(); let frames = 0, bytes = 0;
    for (const k of OP_KEYS) {
      const url = gifOf('f:' + k);
      if (!url.startsWith('data:image/gif')) { bad.push(k + ': no animated GIF'); continue; }
      const a = SPR.ani['f:' + k], { S, ox, oy } = squareOf(a), data = Uint8Array.from(atob(url.split(',')[1]), c => c.charCodeAt(0));
      bytes += data.length;
      const dec = new ImageDecoder({ data, type: 'image/gif' }); await dec.tracks.ready;
      const n = dec.tracks.selectedTrack.frameCount;
      if (n !== a.seq.length / 2) { bad.push(`${k}: ${n} GIF frames, expected ${a.seq.length / 2}`); dec.close(); continue; }
      const c = new OffscreenCanvas(S, S), g = c.getContext('2d', { willReadFrequently: true });
      const r = new OffscreenCanvas(a.w, a.h), rg = r.getContext('2d', { willReadFrequently: true });
      for (let i = 0; i < n; i++) {
        const { image } = await dec.decode({ frameIndex: i });
        if (image.displayWidth !== S) bad.push(`${k}: GIF is ${image.displayWidth} wide, expected ${S}`);
        g.clearRect(0, 0, S, S); g.drawImage(image, 0, 0); image.close();
        rg.clearRect(0, 0, a.w, a.h); drawAniFrame(rg, a, a.seq[i * 2], 0, 0, a.w, a.h);
        const got = g.getImageData(ox, oy, a.w, a.h).data, want = rg.getImageData(0, 0, a.w, a.h).data;
        let diff = 0;
        for (let j = 0; j < got.length; j += 4) {
          const on = got[j + 3] > 127;
          if (on !== want[j + 3] > 127 || on && (got[j] !== want[j] || got[j + 1] !== want[j + 1] || got[j + 2] !== want[j + 2])) diff++;
        }
        if (diff) { bad.push(`${k} frame ${i}: ${diff} pixels differ`); break; }
        frames++;
      }
      dec.close();
    }
    return { gifs: OP_KEYS.length, frames, kb: Math.round(bytes / 1024), ms: Math.round(performance.now() - t0), bad };
  });
  report.bad.push(...gif.bad); delete gif.bad; report.gif = gif;
  console.log(JSON.stringify(report, null, 1));
  await page.evaluate(() => { enterGuest(); S.named = true; S.seenIntro = true; closeModal(); for (const k of OP_KEYS) dexCatch(k); route('dex'); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: SH + 'dex_full.png', fullPage: false });
  await browser.close();
  process.exit(report.bad.length ? 1 : 0);
})();
