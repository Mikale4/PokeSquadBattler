// Archetype viability (ARCHETYPES[].vi in src/a6g_teams.js): how often each archetype's Legend teams beat equally trained teams of
// six strong Pokémon picked at random (Lv 100, perfect IVs, ★ Mastery, optimized together like a Legend's), in Expert head-to-head
// battles on fixed seeds with the sides swapped. Rerun after changing the archetypes, the optimizer or the battle rules.
//   node tools/viability.js [teams per archetype] [archetype ids...] [--patch=file.json]
//   (--patch: a JSON file of { roles: {id: role}, archetypes: [archetype] } laid over the team config first, to try changes
//   without a build: roles replace those with the same id, archetypes those with the same id or join the list)
const { chromium } = require('playwright');
const PAGE = require('url').pathToFileURL(require('path').join(__dirname, '..', 'PokeSquad Battler.html')).href;
const args = process.argv.slice(2).filter(a => !a.startsWith('--')), PATCH = (process.argv.find(a => a.startsWith('--patch=')) || '').slice(8);
const N = +args[0] || 8, ONLY = args.slice(1), PATCHED = PATCH ? JSON.parse(require('fs').readFileSync(PATCH, 'utf8')) : null;
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(PAGE, { timeout: 300000 }); await page.waitForTimeout(500);
  if (PATCHED) await page.evaluate(P => {
    Object.assign(TEAM_CONFIG.roles, P.roles || {});
    for (const a of P.archetypes || []) { const i = TEAM_CONFIG.archetypes.findIndex(x => x.id === a.id); if (i >= 0) TEAM_CONFIG.archetypes[i] = a; else TEAM_CONFIG.archetypes.push(a); }
    reloadTeamConfig();
  }, PATCHED);
  const ids = ONLY.length ? ONLY : await page.evaluate(() => (enterGuest(), closeModal(), ARCHETYPES.map(A => A.id)));
  const out = {};
  for (const id of ids) {
    const t0 = Date.now();
    Object.assign(out, await page.evaluate(([N, ONLY]) => {
    enterGuest(); closeModal();
    S.story[JOURNEY_END] = 3; for (const id of REGION_IDS) openRegion(id, 0);   // (a completed Kanto Journey: every region's Pokémon, the late game's meta)
    const real = pickArchetype, res = {};
    // the strong pool: within the PvP limits (one Legendary, one Mythical, one Ultra Beast, one Paradox), so a random six takes 2 to 4
    // of the 30 strongest of those, and the rest at random from the 40 strongest outside them (the 45 strongest overall were nearly
    // all Legendary or Paradox: every "random" team ended on the same few, Garchomp and Baxcalibur every time, 2026-10-15)
    const byMeta = COMP_POOL().slice().sort((a, b) => metaScore(b) - metaScore(a));
    const grouped = byMeta.filter(k => pvpGroups(k).length).slice(0, 30), plain = byMeta.filter(k => !pvpGroups(k).length).slice(0, 40);
    const randomTeam = rng => {
      const team = [], nG = 2 + Math.floor(rng() * 3);   // (2 to 4 of the limits' groups, as strong teams run)
      for (let n = 0; team.length < nG && n < 200; n++) { const k = grouped[Math.floor(rng() * grouped.length)]; if (!team.includes(k) && pvpFits(team, k)) team.push(k); }
      for (let n = 0; team.length < ROSTER && n < 2000; n++) { const k = plain[Math.floor(rng() * plain.length)]; if (!team.includes(k)) team.push(k); }
      const prog = {}; for (const k of team) prog[k] = { ...progForLV(k, 100), pot: 6, sk: [MAX_SK, MAX_SK, MAX_SK], ab: OPS[k].ab, nat: "hardy" };
      return npcOptimize({ roster: team.slice(), team, prog, badges: 8 }, npcAccess(100, T_LEGEND), true);
    };
    const specs = a => a.team.map(k => ({ op: k, prog: a.prog[k], mine: false, badges: 8 }));
    for (const A of ARCHETYPES) {
      if (ONLY.length && !ONLY.includes(A.id)) continue;
      pickArchetype = (q, rng) => ({ A, sub: A.subs[Math.floor(rng() * A.subs.length)] });
      let w = 0, n = 0;
      for (let i = 0; i < N; i++) {
        // (seeds scrambled through hash: consecutive seeds start alike, and every "random" team came out much the same, 2026-10-15)
        const arch = npcAccount(seeded(hash("vi:arch:" + i)), .99, null, T_LEGEND), rnd = randomTeam(seeded(hash("vi:rnd:" + i)));
        // (each side sends its leads out as in a real battle: the Trainer's plan, npcLeads; the random team by the matchup)
        const aSpecs = npcLeads(arch, specs(rnd)), rSpecs = leadOrder(specs(rnd), specs(arch));
        for (const swap of [false, true]) {
          R = seeded(hash("vi:battle:" + i));
          const B = makeBattle({ allies: swap ? rSpecs : aSpecs, waves: [swap ? aSpecs : rSpecs], auto: true, aiStyle: "expert", enemyStyle: "expert", sim: true });
          let s = 0; const t0 = Date.now(); while (!B.over && s < 4000 && Date.now() - t0 < 90000) { B.step(); B.ev.length = 0; s++; }   // (a battle over 90 s counts as a draw)
          R = Math.random;
          n++; if (B.result && !B.result.draw && B.result.win !== swap) w++; else if (!B.result || B.result.draw) w += .5;
        }
      }
      res[A.id] = Math.round(w / n * 100);
    }
    pickArchetype = real;
    return res;
  }, [N, [id]]));
    console.log(id, out[id], Math.round((Date.now() - t0) / 1000) + "s");
  }
  console.log(JSON.stringify(out)); if (errs.length) console.log('ERRORS', JSON.stringify(errs));
  await browser.close();
})();
