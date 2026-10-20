// What moves are worth in real battles, for the optimizer (MOVE_WORTH in a6h_build.js; build.sh embeds tools/move_worth.json).
// Plays battles (the Balanced AI: quick, and the situations are what count) between the top Trainers' teams (a completed Kanto
// Journey: every region's Pokémon, Lv 100, optimized without this table) and every few steps asks the battle AI what each move a
// Pokémon on the field could know would be worth right then, were it its ready move (B.worthOf in a7_engine.js; for Pursuit and
// Upper Hand also what waiting for their trigger is worth). Two measures: "alone" (the move as its only one) and "marginal"
// (beyond what its other two moves, its actual ones, ready or not, would do then: B.bestWithout; a heal counts when the Pokémon
// is low, a second attack only when it beats the first). Against what the optimizer's own table gives each move (moveIn0, no team
// context), per Pokémon and slot (one move per slot, so only moves of the same slot compete): the factor is how much more or less
// a move is worth in play than the table says, scaled so the slot's moves average out as before. Written: a factor per move (the
// median over the Pokémon that can learn it, weighted by how often each was seen) and, per Pokémon, the ones that differ from it.
//   node tools/move_worth.js [minutes per worker, 20] [workers, 4] [top Trainers, 160] [--mode=marginal|alone] [--damp=1]
//                            [--raw=file: keep the samples] [--fit=file: fit kept samples, no battles] [--out=file]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const PAGE = require('url').pathToFileURL(path.join(__dirname, '..', 'PokeSquad Battler.html')).href;
const pos = process.argv.slice(2).filter(a => !a.startsWith('--')), opt = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const MIN = +pos[0] || 20, WORKERS = +pos[1] || 4, TOP = +pos[2] || 160;
const MODE = opt.mode || 'marginal', DAMP = +(opt.damp || 1), OUT = opt.out || path.join(__dirname, 'move_worth.json');

async function worker(browser, wi) {
  const page = await browser.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(PAGE, { timeout: 300000 }); await page.waitForTimeout(500);
  await page.evaluate(([wi, TOP]) => {
    enterGuest(); closeModal();
    S.story[JOURNEY_END] = 3; for (const id of REGION_IDS) openRegion(id, 0);   // (a completed Kanto Journey: every region's Pokémon)
    MOVE_WORTH_ON = false;      // (the table's own values: what the factor is measured against)
    const idx = S.ladder.pop.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).slice(0, TOP).map(x => x[1]);
    window.MW = { docs: idx.map(i => ladderDoc(i)), rng: seeded(7100 + wi * 977), acc: {}, base: {}, pool: {}, battles: 0, samples: 0 };
  }, [wi, TOP]);
  const t0 = Date.now();
  while (Date.now() - t0 < MIN * 60000) {
    const left = MIN * 60000 - (Date.now() - t0);
    const st = await page.evaluate(ms => {
      const W = window.MW, t1 = Date.now(), r = W.rng;
      const poolOf = k => W.pool[k] || (W.pool[k] = [...new Set(learnPool(k))].filter(m => MOVES[m] && MOVES[m].s && !SET_SKIP.has(m)));
      const specs = (d, foe) => npcLeads(d, foe.team.map(k => npcSpec(foe, k)));
      while (Date.now() - t1 < ms) {
        const a = W.docs[Math.floor(r() * W.docs.length)], b = W.docs[Math.floor(r() * W.docs.length)]; if (a === b) continue;
        R = seeded(Math.floor(r() * 1e9));
        const B = makeBattle({ allies: specs(a, b), waves: [specs(b, a)], auto: true, aiStyle: "balanced", enemyStyle: "balanced", sim: true });
        const docOf = u => u.team === "A" ? a : b;
        let s = 0; const tb = Date.now();
        while (!B.over && s < 3000 && Date.now() - tb < 90000) {
          B.step(); B.ev.length = 0; s++;
          if (s % 4) continue;
          W.samples++;
          for (const u of B.units.filter(x => x.alive)) {
            const p = docOf(u).prog[u.key] || {}, ab = p.ab || OPS[u.key].ab, held = p.held || null;
            const A = W.acc[u.key] || (W.acc[u.key] = {}), rest = [0, 1, 2, 3].map(s => s ? B.bestWithout(u, s) : 0);
            for (const m of poolOf(u.key)) {
              const bk = u.key + "|" + m + "|" + ab + "|" + held;
              if (W.base[bk] == null) W.base[bk] = moveIn0(u.key, m, ab, held, null);
              const x = A[m] || (A[m] = [0, 0, 0, 0]), w = B.worthOf(u, m);
              // [alone, marginal, the table's value, samples]
              x[0] += w.v + w.stand; x[1] += Math.max(0, w.v - rest[MOVES[m].s || 1]) + w.stand; x[2] += W.base[bk]; x[3]++;
            }
          }
        }
        R = Math.random; W.battles++;
      }
      return { battles: W.battles, samples: W.samples };
    }, Math.min(60000, left));
    console.log(`worker ${wi}: ${st.battles} battles, ${st.samples} samples, ${Math.round((Date.now() - t0) / 60000)} min`);
  }
  const acc = await page.evaluate(() => window.MW.acc);
  if (errs.length) console.log(`worker ${wi} ERRORS`, JSON.stringify(errs.slice(0, 5)));
  await page.close();
  return acc;
}

(async () => {
  const browser = await chromium.launch();
  const p0 = await browser.newPage(); await p0.goto(PAGE, { timeout: 300000 }); await p0.waitForTimeout(300);
  const slotOf = await p0.evaluate(() => Object.fromEntries(Object.keys(MOVES).map(m => [m, MOVES[m].s || 1]))); await p0.close();
  let acc = {};
  if (opt.fit) acc = JSON.parse(fs.readFileSync(opt.fit, 'utf8'));
  else {
    const parts = await Promise.all([...Array(WORKERS)].map((_, i) => worker(browser, i)));
    // merge: per Pokémon, per move: [alone summed, marginal summed, the table's value summed, samples]
    for (const P of parts) for (const k in P) for (const m in P[k]) {
      const x = ((acc[k] = acc[k] || {})[m] = acc[k][m] || [0, 0, 0, 0]);
      for (let i = 0; i < 4; i++) x[i] += P[k][m][i];
    }
    if (opt.raw) fs.writeFileSync(opt.raw, JSON.stringify(acc));
  }
  await browser.close();
  // the factor of each move for each Pokémon, against its slot's other moves
  const wi = MODE === 'alone' ? 0 : 1, f = {}, perMove = {};
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  for (const k in acc) for (const s of [1, 2, 3]) {
    const ms = Object.keys(acc[k]).filter(m => slotOf[m] === s && acc[k][m][3] >= 5 && acc[k][m][2] > 0);
    const W = ms.reduce((a, m) => a + acc[k][m][wi] / acc[k][m][3], 0), Bv = ms.reduce((a, m) => a + acc[k][m][2] / acc[k][m][3], 0);
    if (!ms.length || W <= 0 || Bv <= 0) continue;
    const C = W / Bv;
    for (const m of ms) {
      const x = acc[k][m], v = Math.pow(clamp(x[wi] / x[2] / C, .3, 2.5), DAMP);
      (f[k] = f[k] || {})[m] = { v, n: x[3] };
      (perMove[m] = perMove[m] || []).push([v, x[3]]);
    }
  }
  // per move: the weighted median over the Pokémon; per Pokémon: where it differs by more than 0.2, with enough samples
  const g = {}, sp = {};
  for (const m in perMove) {
    const l = perMove[m].sort((a, b) => a[0] - b[0]), tot = l.reduce((a, x) => a + x[1], 0); let c = 0, med = 1;
    for (const [v, n] of l) { c += n; if (c >= tot / 2) { med = v; break; } }
    g[m] = Math.round(med * 100) / 100;
  }
  for (const k in f) for (const m in f[k]) if (f[k][m].n >= 15 && Math.abs(f[k][m].v - g[m]) > .2) (sp[k] = sp[k] || {})[m] = Math.round(f[k][m].v * 100) / 100;
  const out = { _: `What moves are worth in top-tier battles, against the optimizer's table (tools/move_worth.js, ${opt.fit ? 'kept samples' : `${MIN} min x ${WORKERS} workers, the top ${TOP} Trainers`}, ${MODE}${DAMP !== 1 ? ', damped ' + DAMP : ''}, ${new Date().toISOString().slice(0, 10)}). g: per move; s: per Pokémon where it differs.`, g, s: sp };
  fs.writeFileSync(OUT, JSON.stringify(out) + "\n");
  const top = Object.entries(g).sort((a, b) => b[1] - a[1]);
  console.log(MODE, "moves:", Object.keys(g).length, "Pokémon overrides:", Object.keys(sp).length, "entries:", Object.values(sp).reduce((a, o) => a + Object.keys(o).length, 0));
  console.log("most underrated:", top.slice(0, 15).map(([m, v]) => m + " " + v).join(", "));
  console.log("most overrated:", top.slice(-15).map(([m, v]) => m + " " + v).join(", "));
  for (const m of ["pursuit", "upperhand", "protect", "stealthrock", "swordsdance", "uturn", "earthquake", "recover"]) if (g[m] != null) console.log(m, g[m]);
  process.exit(0);
})();
