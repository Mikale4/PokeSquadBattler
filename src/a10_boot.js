
// =====================================================================
//  LAUNCHERS
// =====================================================================
const convWave = (w, lv, g) => w.map(s => ({ op: grownAt(s.op, s.LV || lv, g), LV: s.LV || lv, boss: s.boss, hpX: s.hpX, moves: s.moves, held: s.held, ...(s.ab ? { ab: s.ab } : {}), ...(s.aura ? { aura: s.aura, ...(s.auraN ? { auraN: s.auraN } : {}) } : {}) }));   // (evolved for its level; g: a Journey's generation, journeyG; aura: a Totem Pokémon's, a4g_alola.js, or a Dynamax ace's, a4h_galar.js; ab: an Ability of its own, Hop's Wooloo's Run Away)
const journeyG = nd => nd.ep.id === "kanto" ? null : regionGen(nd.ep.id);   // (Kanto's keep Red and Blue's rule: grownAt)
const allySpecs = ids => ids.filter(owned).map(k => ({ op: k, prog: S.ops[k] }));
const recFor = lv => lv < 20 ? "rec1" : lv < 40 ? "rec2" : lv < 60 ? "rec3" : "rec4";
const battleXp = lv => Math.round(30 + lv * lv * .75);
// (Stadium teams keep the PvP limits: one Legendary, one Mythical, one Ultra Beast, one Paradox)
const PVP_TEAMS = new Set(["arena", "defense", "friendly"]);
function squadOrToast(mode) {
  const ids = S.team[mode].filter(owned);
  if (!ids.length) { toast("Choose at least one Pokémon."); return null; }
  const cc = clauseClash(ids.map(k => S.ops[k].held)); if (cc) { toast(`Item Clause: only one ${HELD[cc].n} per team.`); return null; }
  const clash = PVP_TEAMS.has(mode) && pvpClash(ids, pvpLimits(mode === "friendly" ? "friendly" : "ranked")); if (clash) { toast(pvpText(clash)); return null; }
  return ids;
}
// Exp. for the team; returns the level-up report for the results screen. Each Pokémon gets xp (half again with a Lucky Egg);
// what one can't take (at the level cap, or past it) is shared evenly by the ones that still can (and what fills one of them up
// is shared again by the rest).
function opsXp(ids, xp) {
  xp = Math.round(xp * expBoost());   // (coming back, or catching up on an older server: a6k_offers.js)
  const team = ids.filter(owned), egg = k => S.ops[k].held === "luckyegg" ? 1.5 : 1;
  const got = new Map(team.map(k => [k, 0])), room = new Map(team.map(k => [k, xpRoom(k)])), passed = new Map(team.map(k => [k, 0]));
  const take = (k, base) => { const g = Math.min(base * egg(k), room.get(k) - got.get(k)); got.set(k, got.get(k) + g); return base - g / egg(k); };
  let pool = 0;
  for (const k of team) { const left = take(k, xp); passed.set(k, left); pool += left; }
  for (let i = 0; i < team.length && pool > .5; i++) {
    const open = team.filter(k => room.get(k) - got.get(k) > .5); if (!open.length) break;
    const share = pool / open.length; pool = 0;
    for (const k of open) pool += take(k, share);
  }
  return team.map(k => {
    const p = S.ops[k], from = p.lvl, n = Math.round(got.get(k));
    opXp(k, n);
    if (p.lvl > from) S.daily.upgrade++;
    return { k, from, to: p.lvl, xp: n, cap: p.lvl >= levelCap(k), passed: Math.round(passed.get(k)), evo: canEvolveNow(k) };
  });
}
// the Amulet Coin: while a team member holds it, battles pay twice the Poké Dollars
const coin = (ids, rw) => rw.lmd && ids.some(k => S.ops[k] && S.ops[k].held === "amuletcoin") ? { ...rw, lmd: rw.lmd * 2 } : rw;
function teamScreen(mode, title, cost, foes, back, launch) {
  closeModal();
  UI.team = null;
  route("team", { mode, title, cost, foes, from: mode === "story" ? "story" : "battle", back, launch });
}
function needSanity(n) {
  tickTimers();
  if (S.sanity >= n) return true;
  toast("Not enough PP."); sanityModal(); return false;
}
function chapterPayout(ch) {
  if (S.chRw[ch.id] || !chapterCleared(ch)) return null;
  S.chRw[ch.id] = 1;
  return give(ch.reward);
}
function chapterModal(ch, list) {
  const chs = ch.ep.chapters, i = chs.indexOf(ch), nx = chs[i + 1];
  openModal(`<div class="stack" style="align-items:center;text-align:center">
    <div class="eyebrow">Chapter ${ch.no} complete</div><h2>${esc(ch.title)}</h2>
    ${ch.reward.op ? `<img class="px" src="${sprFull(ch.reward.op)}" alt="" style="height:150px;image-rendering:pixelated"><p class="small"><b>${esc(OPS[ch.reward.op].n)}</b> joined your team!</p>` : ""}
    <div class="rewards">${rewardsHTML(list)}</div>
    ${nx ? `<p class="small dim">Chapter ${nx.no}, ${esc(nx.title)}, is now open.</p><button class="btn wide" data-act="chapter" data-c="${nx.id}">Continue</button>` : `<p class="small dim">You've seen everything ${REGION_NAME[ch.ep.id]} has to offer... for now.</p><button class="btn wide" data-act="closeModal">Close</button>`}
  </div>`);
  sfx("win");
}
// (part: a Journey in parts has each part's own eight)
function badgeModal(i, then, rid = "kanto", part = 1) {
  const L = regionBadges(rid, part), b = L[i];
  openModal(`<div class="stack" style="align-items:center;text-align:center">
    <div class="eyebrow">${b.gym}${PART_NAME[rid] ? ` · Part ${part}` : ""}</div><div class="bigbadge">${badgeSVG(i, true, L)}</div>
    <h2>You received the ${b.n}!</h2>
    <p class="small dim">${rid === "kanto" ? `Your Pokémon get +5% ${b.sn}` : (REGION_BADGES[rid] || []).length > 8 ? `Every stamp counts toward your Badge bonus as its share of eight (${REGION_BADGES[rid].length} stamps = 8 Badges): ${statBadges()} now` : `Your Badge bonus counts your most Badges in one region: ${statBadges()} now`}${capBattle() ? `, and can now grow up to <b>Lv ${levelCap()}</b> (2 below ${esc(capWho(capBattle()))}'s strongest Pokémon)` : ""}.</p>
    <button class="btn wide" data-act="closeModal">OK</button></div>`);
  jingle({ johto: "joBadge", hoenn: "hoBadge", sinnoh: "siBadge", unova: "unBadge", kalos: "kaBadge", alola: "alZCrystal", galar: "gaBadge", paldea: "paBadge" }[rid] || "badge");
  if (then) { const m = $("#modal"); const obs = new MutationObserver(() => { if (m.hidden) { obs.disconnect(); then(); } }); obs.observe(m, { attributes: true }); }
}

// ---------- journey ----------
let STARTER_RES = null;
async function readStory(nd) {
  closeModal();
  if (UI.view !== "chapter") route("chapter", nd.ch.id);
  if (nd.music) music(nd.music);   // (a stage's own place, where it names one: Hoenn's)
  await playScene(nd.pre || [], `${nd.id} ${nd.name}`, nd.env, nd);
  if (nd.starter && !S.starter) {
    await new Promise(res => { STARTER_RES = res; starterModal(); });
    if (nd.post) await playScene(nd.post, `${nd.id} ${nd.name}`, nd.env, nd);
  } else if (nd.starter && ndPart(nd) > 1 && !regionRec(nd.ep.id).starter2) {   // (a Journey's Part 2: its own starter, at Lv 5)
    await new Promise(res => { STARTER_RES = res; partStarterModal(nd); });
    if (nd.post) await playScene(nd.post, `${nd.id} ${nd.name}`, nd.env, nd);
  }
  if (nodeStars(nd.id)) return;
  S.story[nd.id] = 1;
  const list = [...give({ orundum: 30, lmd: 600 }), ...(nd.reward ? give(nd.reward) : [])];   // (and what its scenes hand you)
  rerender();
  const ch = chapterPayout(nd.ch);
  if (ch) chapterModal(nd.ch, ch); else rewardModal("Story complete", list, `${nd.id} ${nd.name}`);
}
async function openChest(nd) {
  closeModal();
  if (nodeStars(nd.id)) return;
  if (UI.view !== "chapter") route("chapter", nd.ch.id);
  if (nd.pre) { if (nd.music) music(nd.music); await playScene(nd.pre, `${nd.id} ${nd.name}`, nd.env, nd); }
  S.story[nd.id] = 1;
  const list = give(nd.reward);
  sfx("heal"); const ij = { hoenn: "hoItem", sinnoh: "siItem", unova: "unItem", kalos: "kaItem", alola: "alItem", galar: "gaItem", paldea: "paItem" }[nd.ep.id]; if (ij) jingle(ij); rerender();
  const ch = chapterPayout(nd.ch);
  if (ch) chapterModal(nd.ch, ch); else rewardModal("Received!", list, `${nd.id} ${nd.name}`);
}
function nodeFoes(nd) { return nodeWaves(nd).flat().map(s => ({ op: s.op, LV: s.LV || nd.lv, held: s.held })); }
function nodeDrops(nd, first) {
  const lv = nd.lv || 5;
  return first ? { orundum: nd.type === "boss" ? 150 : nd.type === "side" ? 100 : 60, lmd: 100 + lv * 25, [recFor(lv)]: 3 }
    : { lmd: 80 + lv * 18, [recFor(lv)]: 2, ...(lv >= 20 ? { summ: 1 } : {}) };
}
async function launchNode(id) {
  const nd = NODES[id], cost = nodeCost(nd), all = squadOrToast("story"), ids = all && all.filter(k => journeyOk(k, nd));
  if (all && !ids.length) { toast(`Only ${REGION_NAME[nd.ep.id]}'s Pokémon can battle in the ${REGION_NAME[nd.ep.id]} Journey.`); return; }
  if (!ids || !needSanity(cost)) return;
  const first = !nodeStars(id);
  route("chapter", nd.ch.id);
  if (first && nd.pre && nd.pre.length) { if (nd.badgeWin != null) music(nd.ep.id === "unova" ? unovaGymHall(nd) : nd.ep.id === "alola" ? alolaHall(nd) : nd.ep.id === "galar" ? galarHall(nd) : nd.ep.id === "paldea" ? paldeaHall(nd) : { johto: "joGymHall", hoenn: "hoGymHall", sinnoh: "siGymHall", kalos: "kaGymHall" }[nd.ep.id] || "gymHall"); else if (nd.music) music(nd.music); await playScene(nd.pre, `${nd.id} ${nd.name}`, nd.env, nd); }
  spendSanity(cost); S.stats.battles++; save();
  let chList = null, badgeGot = null;
  const waves = nodeWaves(nd).map(w => convWave(w, nd.lv, journeyG(nd)));
  startBattle({
    allies: ids.filter(owned).map(k => ({ op: k, prog: journeyProg(k, nd) })), waves, env: nd.env, weather: nd.weather, wild: !!nd.wild,   // (at most the region's level cap)
    trainer: nd.trainer && nd.trainer.name, trainerSpr: nd.trainer && nd.trainer.spr, intro: nd.trainer && nd.trainer.intro, lose: nd.trainer && nd.trainer.lose, ball: nd.trainer && nd.trainer.ball,
    title: nd.name, sub: `${nd.id} · ${nd.ch.title}`, ...nodeMusic(nd),
    onWin(res, B) {
      const goal = nodeTurnGoal(nd);
      const missions = [{ n: "Win the battle", ok: true }, { n: "None of your Pokémon fainted", ok: !res.lost }, { n: `Win within ${goal} of your turns`, ok: res.turns <= goal }];
      const stars = missions.filter(m => m.ok).length, prev = nodeStars(id);
      S.story[id] = Math.max(prev, stars); journeyWin(nd);
      S.stats.wins++; S.daily.clear++; live("clear");
      const list = give(coin(ids, nodeDrops(nd, first)));
      if (stars === 3 && prev < 3) list.push(...give({ prime: 1 }));
      if (B.tally.payday) list.push(...give(coin(ids, { lmd: B.tally.payday })));
      const pick = ids.some(k => S.ops[k] && abilityOf(S.ops[k].ab || OPS[k].ab).id === "PICKUP"); if (pick) list.push(...give(coin(ids, { lmd: 100 + nd.lv * 20 })));
      list.push(...ballFetch(ids, cost, 1));   // (Ball Fetch)
      const cat = nd.catch && first ? nd.catch : null;
      if (cat) { const lvAt = Math.min(levelCap(cat), (waves.flat().find(s => s.op === cat) || {}).LV || nd.lv); const r = grantOp(cat, lvAt); list.unshift({ k: "op:" + cat, n: 1, isNew: r.isNew }); }
      if (nd.gift && first) { const r = grantOp(nd.gift, Math.min(levelCap(nd.gift), nd.giftLv || nd.lv)); list.unshift({ k: "op:" + nd.gift, n: 1, isNew: r.isNew }); }
      if (nd.reward && first && nd.type !== "chest" && !nd.chest) list.push(...give(nd.reward));   // (what its scenes hand you: items, held items, TMs, Pokémon)
      // (each region's Badges and Champion title are its own: badgesIn, regionChamp; a Journey in parts has each part's Badges)
      const rid = nd.ep.id, part = ndPart(nd);
      if (nd.badgeWin != null && partBadges(rid, part) <= nd.badgeWin) { setPartBadges(rid, part, nd.badgeWin + 1); badgeGot = nd.badgeWin; live("badge"); }
      if (nd.champion && !regionChamp(rid)) { if (rid === "kanto") { S.champion = true; S.hofMs = S.playMs || 0; } else { regionRec(rid).champ = true; regionRec(rid).hofMs = S.playMs || 0; } }   // the Hall of Fame debut, in play time
      if (nd.id === journeyEnd(rid) && first) { regionRec(rid).done = Date.now(); if (!S.region) S.region = rid; }   // the region's Journey is complete: the next region can be chosen (nextRegions)
      const levels = opsXp(ids, battleXp(nd.lv));
      chList = chapterPayout(nd.ch);
      return { rewards: list, missions, levels };
    },
    onLose() { S.sanity += Math.max(0, cost - 1); journeyLoss(nd); return { rewards: [] }; },   // (the region's first: the Professor's help)
    onQuit() { S.sanity += Math.max(0, cost - 1); save(); },
    async onClose(res) {
      if (!res.win) return;
      if (first && nd.post && nd.post.length) await playScene(nd.post, `${nd.id} ${nd.name}`, nd.env, nd);
      rerender();
      const fin = () => { if (chList) chapterModal(nd.ch, chList); };
      if (badgeGot != null) badgeModal(badgeGot, fin, nd.ep.id, ndPart(nd)); else fin();
    },
    retry: () => launchNode(id),
  });
}
// battle and victory themes for a Journey stage: Gyms, the League, legendary Pokémon, then wild and Trainer battles
function nodeMusic(nd) {
  const who = (nd.trainer && nd.trainer.name) || "";
  if (nd.ep.id === "johto") return johtoMusic(nd, who);
  if (nd.ep.id === "hoenn") return hoennMusic(nd, who);
  if (nd.ep.id === "sinnoh") return sinnohMusic(nd, who);
  if (nd.ep.id === "unova") return unovaMusic(nd, who);
  if (nd.ep.id === "kalos") return kalosMusic(nd, who);
  if (nd.ep.id === "alola") return alolaMusic(nd, who);
  if (nd.ep.id === "galar") return galarMusic(nd, who);
  if (nd.ep.id === "paldea") return paldeaMusic(nd, who);
  if (nd.champion || /Champion/.test(who)) return { bgm: "champion", winBgm: "fame" };
  if (/Elite Four/.test(who)) return { bgm: "champion", winBgm: "trainerWin" };
  if (nd.badgeWin != null) return { bgm: "gym", winBgm: "gymWin" };
  // Team Rocket (the Grunts, Jessie & James, Giovanni outside his Gym): one of Miror B.'s themes
  if (/Team Rocket|Jessie|Giovanni/.test(who)) return { bgm: pickOf(ROCKET_THEMES), winBgm: "trainerWin" };
  if (nd.catch === "mewtwo" || nodeWaves(nd).flat().some(s => s.op === "mewtwo")) return { bgm: "mewtwo", winBgm: "wildWin" };
  if (nd.catch && OPS[nd.catch].leg) return { bgm: "legend", winBgm: "wildWin" };
  return {};
}
// Johto's (HeartGold/SoulSilver's): Lance and Red the Champion's theme, the Elite Four and Gym Leaders the Gym Leader's, the rival his
// own, Team Rocket theirs, the beasts, Ho-Oh and Lugia their own, everyone else Johto's Trainer and wild themes
const JOHTO_LEGEND_BGM = { raikou: "joRaikou", entei: "joEntei", suicune: "joSuicune", hooh: "joHooh", lugia: "joLugia" };
function johtoMusic(nd, who) {
  if (nd.champion || /Champion|Pokémon Trainer Red/.test(who)) return { bgm: "joChampion", winBgm: "joFame" };
  if (/Elite Four/.test(who)) return { bgm: "joGym", winBgm: "joTrainerWin" };
  const kt = nd.ch && nd.ch.kanto;   // (Crystal's trip to Kanto: its Leaders, Trainers and wild Pokémon battle to HeartGold/SoulSilver's Kanto versions)
  if (/^Leader /.test(who)) return { bgm: kt ? "joGymKanto" : "joGym", winBgm: "joGymWin" };
  if (nd.rivalWaves || nd.trainer && nd.trainer.spr === "jo_silver") return { bgm: "joRival", winBgm: "joTrainerWin" };   // (his rematch stages too)
  if (/Team Rocket|Executive/.test(who)) return { bgm: "joRocket", winBgm: "joTrainerWin" };
  if (nd.catch && JOHTO_LEGEND_BGM[nd.catch]) return { bgm: JOHTO_LEGEND_BGM[nd.catch], winBgm: "joWildWin" };
  if (kt) return nd.trainer ? { bgm: "joTrainerKanto", winBgm: "joTrainerWin" } : { bgm: "joWildKanto", winBgm: "joWildWin" };
  return nd.trainer ? { bgm: "joTrainer", winBgm: "joTrainerWin" } : { bgm: "joWild", winBgm: "joWildWin" };
}
// Hoenn's (Ruby/Sapphire's, as Emerald plays them): Wallace the Champion's theme and the Hall of Fame, the Elite Four theirs, Gym Leaders (Tate & Liza too) the
// Gym Leader's, the rival theirs, Team Magma and Team Aqua theirs (Maxie and Archie the leaders' one), Groudon, Kyogre and Rayquaza
// the Super-Ancient Pokémon's, the Regis theirs; Wally, as in the games, the Trainer theme, and Latias and Latios the wild one
const HOENN_LEGEND_BGM = { kyogre: "hoAncient", groudon: "hoAncient", rayquaza: "hoAncient", regirock: "hoRegi", regice: "hoRegi", registeel: "hoRegi", deoxysspeed: "hoDeoxys" };
function hoennMusic(nd, who) {
  if (nd.champion || /Champion/.test(who)) return { bgm: "hoChampion", winBgm: "hoFame" };
  if (who === "Steven") return { bgm: "hoChampion", winBgm: "hoLeagueWin" };   // (Steven in Meteor Falls, after the League)
  if (/Elite Four/.test(who)) return { bgm: "hoE4", winBgm: "hoLeagueWin" };
  if (/^Leaders? /.test(who)) return { bgm: "hoGym", winBgm: "hoGymWin" };
  if (nd.rivalWaves) return { bgm: "hoRival", winBgm: "hoTrainerWin" };
  if (/Magma Leader|Aqua Leader/.test(who)) return { bgm: "hoBoss", winBgm: "hoTeamWin" };
  if (/Team Magma|Team Aqua|Magma Admin|Aqua Admin/.test(who)) return { bgm: "hoTeam", winBgm: "hoTeamWin" };
  if (nd.catch && HOENN_LEGEND_BGM[nd.catch]) return { bgm: HOENN_LEGEND_BGM[nd.catch], winBgm: "hoWildWin" };
  return nd.trainer ? { bgm: "hoTrainer", winBgm: "hoTrainerWin" } : { bgm: "hoWild", winBgm: "hoWildWin" };
}
// Sinnoh's (Platinum's, pret/pokeplatinum's enc_effects.c): Cynthia the Champion's theme and the Hall of Fame, the Elite Four theirs, Gym
// Leaders the Gym Leader's (and Flint & Volkner's tag battle, as in the Fight Area), Barry his own, Cyrus the Galactic Boss's, the
// Commanders theirs, the Grunts Team Galactic's; the lake trio, Dialga and Palkia, Giratina, the Regis and Arceus their own; Heatran,
// Regigigas, Rotom, Darkrai and the other regions' Legendaries (Ramanas Park's) the Legendary theme; Cresselia and Shaymin, as in
// Platinum, the wild one
const SINNOH_LEGEND_BGM = { uxie: "siLakeTrio", mesprit: "siLakeTrio", azelf: "siLakeTrio", dialga: "siDialga", palkia: "siDialga", giratinaorigin: "siGiratina", giratina: "siGiratina",
  regirock: "siRegi", regice: "siRegi", registeel: "siRegi", arceus: "siArceus", heatran: "siLegend", regigigas: "siLegend", rotom: "siLegend", darkrai: "siLegend",
  ...Object.fromEntries(["articuno", "zapdos", "moltres", "raikou", "entei", "suicune", "latias", "latios", "hooh", "lugia", "mewtwo", "kyogre", "groudon", "rayquaza"].map(k => [k, "siLegend"])) };
function sinnohMusic(nd, who) {
  if (nd.champion || /^Champion/.test(who)) return { bgm: "siChampion", winBgm: "siFame" };
  if (/ & Leader /.test(who)) return { bgm: "siGym", winBgm: "siGymWin" };
  if (/Elite Four/.test(who)) return { bgm: "siE4", winBgm: "siE4Win" };
  if (/^Leaders? /.test(who)) return { bgm: "siGym", winBgm: "siGymWin" };
  if (nd.rivalWaves) return { bgm: "siRival", winBgm: "siTrainerWin" };
  if (/Galactic Boss/.test(who)) return { bgm: "siBoss", winBgm: "siTeamWin" };
  if (/Commander/.test(who)) return { bgm: "siCommander", winBgm: "siTeamWin" };
  if (/Galactic/.test(who)) return { bgm: "siTeam", winBgm: "siTeamWin" };
  const leg = nd.catch || (nd.wild && nodeWaves(nd).length === 1 && nodeWaves(nd)[0].length === 1 ? nodeWaves(nd)[0][0].op : null);   // (Ramanas Park's Lv 100 Giratina can't be caught)
  if (leg && SINNOH_LEGEND_BGM[leg]) return { bgm: SINNOH_LEGEND_BGM[leg], winBgm: "siWildWin" };
  return nd.trainer ? { bgm: "siTrainer", winBgm: "siTrainerWin" } : { bgm: "siWild", winBgm: "siWildWin" };
}
// Unova's (the owner's download: Black/White's Super Music Collection, "un:", and Black 2/White 2's, "u2:"; each part its own game's
// version where the sequel rearranged a theme, as the proposal in the session notes maps them): Iris the Champion's theme and the
// Hall of Fame, Alder (and the Subway Bosses) the Champion theme of Black/White, Cynthia her own, the Elite Four theirs, Gym Leaders
// the Gym Leader's, the rivals theirs, N, Ghetsis, Colress on the Frigate and Team Plasma their own, the World Tournament's
// Leaders and Champions their region's versions, the legendary dragons, Kyurem, Black Kyurem, the Regis, the lake trio and the other
// regions' Legendaries their own, the Swords of Justice and the Forces of Nature the Legendary theme, and a lone strong wild Pokémon
// (Volcarona, Musharna on a Friday) the strong wild one
const UNOVA_LEGEND_BGM = { reshiram: "unDragon", zekrom: "unDragon", kyurem: "unKyurem", kyuremblack: "u2BlackKyurem", regirock: "u2Regi", regice: "u2Regi", registeel: "u2Regi",
  regigigas: "u2Regi", uxie: "u2LakeTrio", mesprit: "u2LakeTrio", azelf: "u2LakeTrio", heatran: "u2LegendSinnoh", cresselia: "u2LegendSinnoh", latios: "u2LegendSinnoh",
  cobalion: "unLegend", terrakion: "unLegend", virizion: "unLegend", tornadus: "unLegend", landorus: "unLegend", victini: "unLegend" };
const unovaGymHall = nd => ndPart(nd) < 2 ? "unGymHall" : ["unGymHall", "u2VirbankGym", "u2CasteliaGym", "u2NimbasaGym", "u2DriftveilGym", "u2MistraltonGym", "u2OpelucidGym", "u2HumilauGym"][nd.badgeWin] || "unGymHall";
function unovaMusic(nd, who) {
  const p2 = ndPart(nd) > 1, P = (a, b) => p2 ? b : a;
  if (nd.champion || /^Champion Iris/.test(who)) return { bgm: "u2Iris", winBgm: "unFame" };
  if (/Alder|Subway Boss/.test(who)) return { bgm: "unChampion", winBgm: "unChampionWin" };
  if (who === "Cynthia") return { bgm: "unCynthiaBattle", winBgm: "unChampionWin" };
  if (/Elite Four/.test(who)) return { bgm: "unE4", winBgm: "unGymWin" };
  if (/^World Tournament/.test(nd.name)) return /Colress/.test(who) ? { bgm: "u2PWTFinal", winBgm: "u2PWTVictory" } : { bgm: /^Leader/.test(who) ? "u2Gym" : "u2Trainer", winBgm: "u2PWTWin" };
  if (/^Leaders? /.test(who)) return { bgm: P("unGym", "u2Gym"), winBgm: "unGymWin" };
  if (nd.rivalWaves) return { bgm: P("unRival", "u2Rival"), winBgm: "unTrainerWin" };
  if (who === "N") return { bgm: p2 ? "u2NBattle" : /N's Castle/.test(nd.name) ? "unNFinal" : "unNBattle", winBgm: "unTeamWin" };
  if (who === "Ghetsis") return { bgm: P("unGhetsis", "u2Ghetsis"), winBgm: "unTeamWin" };
  if (who === "Colress") return /Plasma Frigate/.test(nd.name) ? { bgm: "u2Colress", winBgm: "unTeamWin" } : { bgm: "u2Trainer", winBgm: "unTrainerWin" };
  if (/Team Plasma|Zinzolin|Shadow Triad/.test(who)) return { bgm: P("unTeam", "u2Team"), winBgm: "unTeamWin" };
  const W = nodeWaves(nd), leg = nd.catch || (nd.wild && W.length === 1 && W[0].length === 1 ? W[0][0].op : null);
  if (leg && UNOVA_LEGEND_BGM[leg]) return { bgm: UNOVA_LEGEND_BGM[leg], winBgm: "unWildWin" };
  if (nd.wild && W.length === 1 && W[0].length === 1) return { bgm: "unStrongWild", winBgm: "unWildWin" };
  return nd.trainer ? { bgm: P("unTrainer", "u2Trainer"), winBgm: "unTrainerWin" } : { bgm: P("unWild", "u2Wild"), winBgm: "unWildWin" };
}
// Kalos's (X and Y's, Bulbapedia's list of battle themes): Diantha the Champion's theme and the Hall of Fame, the Elite Four theirs (Malva
// in every battle of hers, as in X and Y), Gym Leaders and AZ the Gym Leader's, Korrina at the top of the Tower of Mastery her own and
// in Geosenge Town the Trainer one, your four friends theirs (Battle! (Friend)), Lysandre his own, the rest of Team Flare theirs, Xerneas,
// Yveltal and Zygarde theirs, Mewtwo and the Legendary birds Mewtwo's; X and Y have no Elite Four victory theme (the Gym Leader's stands in)
const KALOS_LEGEND_BGM = { xerneas: "kaXYZ", yveltal: "kaXYZ", zygarde: "kaXYZ", mewtwo: "kaMewtwo", articuno: "kaMewtwo", zapdos: "kaMewtwo", moltres: "kaMewtwo" };
const KALOS_FRIENDS = /^(Shauna|Tierno|Trevor|Serena|Calem|Tierno & Trevor)$/;
function kalosMusic(nd, who) {
  if (nd.champion || /^Champion/.test(who)) return { bgm: "kaChampion", winBgm: "kaFame" };
  if (/Elite Four|Malva|Battle Chatelaine/.test(who)) return { bgm: "kaE4", winBgm: "kaGymWin" };
  if (/Korrina/.test(who)) return /Tower of Mastery/.test(nd.name) ? { bgm: "kaKorrina", winBgm: "kaGymWin" } : nd.badgeWin != null ? { bgm: "kaGym", winBgm: "kaGymWin" } : { bgm: "kaTrainer", winBgm: "kaTrainerWin" };
  if (/^Leaders? |AZ$/.test(who)) return { bgm: "kaGym", winBgm: "kaGymWin" };
  if (nd.rivalWaves || KALOS_FRIENDS.test(who)) return { bgm: "kaFriend", winBgm: "kaTrainerWin" };
  if (/Lysandre/.test(who)) return { bgm: "kaLysandreBattle", winBgm: "kaTeamWin" };
  if (/^Team Flare/.test(who)) return { bgm: "kaTeam", winBgm: "kaTeamWin" };
  const W = nodeWaves(nd), leg = nd.catch || (nd.wild && W.length === 1 && W[0].length === 1 ? W[0][0].op : null);
  if (leg && KALOS_LEGEND_BGM[leg]) return { bgm: KALOS_LEGEND_BGM[leg], winBgm: "kaWildWin" };
  return nd.trainer ? { bgm: "kaTrainer", winBgm: "kaTrainerWin" } : { bgm: "kaWild", winBgm: "kaWildWin" };
}
// Alola's (Sun and Moon's and Ultra Sun and Ultra Moon's, Bulbapedia's list of battle themes): the Totems and their victory, the kahunas'
// grand trials and their victory (which the Elite Four share), the captains Sun and Moon's Trainer theme, Hau his own and, on the
// Champion's throne, Ultra Sun and Ultra Moon's Champion battle; Gladion, Team Skull (its Grunts, Plumeria, Guzma), the Aether
// Foundation and Lusamine, the Ultra Recon Squad and the Battle Royal theirs; the Tapus, Solgaleo and Lunala (Necrozma's own form
// too), Dusk Mane Necrozma, the Necrozma of Megalo Tower (Ultra Necrozma's theme) and the Ultra Beasts theirs; Episode RR's Grunts and
// its five bosses theirs; wild and Trainer battles Ultra Sun and Ultra Moon's remixes
const ALOLA_LEGEND_BGM = { tapukoko: "alTapu", tapulele: "alTapu", tapubulu: "alTapu", tapufini: "alTapu", solgaleo: "alSolgaleo", lunala: "alSolgaleo", necrozma: "alSolgaleo", necrozmaduskmane: "alNecrozma",
  nihilego: "alUB", buzzwole: "alUB", pheromosa: "alUB", xurkitree: "alUB", celesteela: "alUB", kartana: "alUB", guzzlord: "alUB", blacephalon: "alUB", stakataka: "alUB" };
function alolaMusic(nd, who) {
  if (nd.champion) return { bgm: "alChampion", winBgm: "alChampWin" };
  if (/^Totem /.test(who)) return { bgm: "alTotem", winBgm: "alTotemWin" };
  if (/^Island Kahuna/.test(who)) return { bgm: "alKahuna", winBgm: "alKahunaWin" };
  if (/^Elite Four/.test(who)) return { bgm: "alE4", winBgm: "alKahunaWin" };
  if (/^Captain/.test(who)) return { bgm: "alCaptain", winBgm: "alTrainerWin" };
  if (/^The Royal/.test(who)) return { bgm: "alRoyal", winBgm: "alTrainerWin" };
  if (/Hau$/.test(who)) return { bgm: "alHauBattle", winBgm: "alTrainerWin" };
  if (/Gladion$/.test(who)) return { bgm: "alGladionBattle", winBgm: "alTrainerWin" };
  if (/Plumeria/.test(who)) return { bgm: "alAdmin", winBgm: "alSkullWin" };
  if (/Guzma/.test(who)) return { bgm: "alSkullBoss", winBgm: "alSkullWin" };
  if (/^Team Skull/.test(who)) return { bgm: "alSkull", winBgm: "alSkullWin" };
  if (/Lusamine/.test(who)) return { bgm: "alLusamineBattle", winBgm: "alAetherWin" };
  if (/Faba|Aether/.test(who)) return { bgm: "alAetherBattle", winBgm: "alAetherWin" };
  if (/Ultra Recon Squad/.test(who)) return { bgm: "alSquadBattle", winBgm: "alTrainerWin" };
  if (/Giovanni/.test(who)) return { bgm: "alGiovanni", winBgm: "alTrainerWin" };
  if (/Archie|Maxie/.test(who)) return { bgm: "alMagmaAqua", winBgm: "alTrainerWin" };
  if (/Cyrus/.test(who)) return { bgm: "alCyrus", winBgm: "alTrainerWin" };
  if (/Lysandre/.test(who)) return { bgm: "alLysandre", winBgm: "alTrainerWin" };
  if (/Ghetsis/.test(who)) return { bgm: "alGhetsis", winBgm: "alTrainerWin" };
  if (/Rainbow Rocket/.test(who)) return { bgm: "alRR", winBgm: "alTrainerWin" };
  const W = nodeWaves(nd), leg = nd.catch || (nd.wild && W.length === 1 && W[0].length === 1 ? W[0][0].op : null);
  if (/Megalo Tower/.test(nd.name)) return { bgm: "alUltraNecrozma", winBgm: "alWildWin" };
  if (leg && ALOLA_LEGEND_BGM[leg]) return { bgm: ALOLA_LEGEND_BGM[leg], winBgm: "alWildWin" };
  if (leg && OPS[leg] && OPS[leg].leg) return { bgm: "alSolgaleo", winBgm: "alWildWin" };   // (the Legendaries of the Ultra Space Wilds)
  return nd.trainer ? { bgm: "alTrainer", winBgm: "alTrainerWin" } : { bgm: "alWild", winBgm: "alWildWin" };
}
// Galar's (Sword and Shield's, by the Super Music Collection's titles): Leon the Champion's theme and its victory; the Gym Leaders the Gym
// Leader's (Piers his own), and in Wyndon Stadium (the Champion Cup's Finals and its rematch) the Finals', with the Champion Cup's
// victory; Hop, Bede and Marnie their own themes, Hop's and Marnie's Decisive Battle themes in the Champion Cup and Hop's in his last
// battles; Team Yell, Oleana and Rose theirs; Eternatus's two forms, Zacian and Zamazenta, and every Dynamax Pokémon the Max Raid theme
// (the Max Lair's the Dynamax Adventure's); the expansions' Klara, Avery, Mustard (his last battle Serious Mustard's), Peony, Calyrex and
// its steeds, the Legendary giants and birds. The album gives Sordward and Shielbert and Macro Cosmos's staff no theme: the Trainer one
const GALAR_LEGEND_BGM = { zacian: "gaZacian", zamazenta: "gaZacian", zaciancrowned: "gaZacian", zamazentacrowned: "gaZacian", calyrex: "gaCalyrexBattle",
  calyrexice: "gaRiderBattle", calyrexshadow: "gaRiderBattle", glastrier: "gaSteeds", spectrier: "gaSteeds", regirock: "gaGiants", regice: "gaGiants", registeel: "gaGiants",
  regieleki: "gaGiants", regidrago: "gaGiants", articunogalar: "gaBirds", zapdosgalar: "gaBirds", moltresgalar: "gaBirds" };
function galarMusic(nd, who) {
  const cup = /^Wyndon Stadium|^Champion Cup/.test(nd.name), W = nodeWaves(nd);
  if (nd.champion || /Leon$/.test(who)) return { bgm: "gaChampion", winBgm: "gaChampionWin" };
  if (/Hop$/.test(who)) return cup || /Zamazenta|Champion Cup/.test(nd.name) ? { bgm: "gaHopFinal", winBgm: cup ? "gaCupWin" : "gaTrainerWin" } : { bgm: "gaHopBattle", winBgm: "gaTrainerWin" };
  if (/Marnie$/.test(who)) return cup ? { bgm: "gaMarnieFinal", winBgm: "gaCupWin" } : { bgm: "gaMarnieBattle", winBgm: "gaTrainerWin" };
  if (/Piers$/.test(who)) return { bgm: "gaPiers", winBgm: "gaGymWin" };
  if (/^Gym Leader /.test(who)) return cup ? { bgm: "gaFinals", winBgm: "gaCupWin" } : /Bede$/.test(who) ? { bgm: "gaBedeBattle", winBgm: "gaGymWin" } : { bgm: "gaGym", winBgm: "gaGymWin" };
  if (/Bede$/.test(who)) return { bgm: "gaBedeBattle", winBgm: "gaTrainerWin" };
  if (/^Team Yell/.test(who)) return { bgm: "gaYell", winBgm: "gaTrainerWin" };
  if (/Oleana/.test(who)) return { bgm: "gaOleana", winBgm: "gaTrainerWin" };
  if (/Rose$/.test(who)) return { bgm: "gaRoseBattle", winBgm: "gaTrainerWin" };
  if (/Klara$/.test(who)) return { bgm: "gaKlaraBattle", winBgm: "gaTrainerWin" };
  if (/Avery$/.test(who)) return { bgm: "gaAveryBattle", winBgm: "gaTrainerWin" };
  if (/Mustard$/.test(who)) return /Last Battle/.test(nd.name) ? { bgm: "gaMustardFinal", winBgm: "gaMustardWin" } : { bgm: "gaMustardBattle", winBgm: "gaMustardWin" };
  if (/Peony$/.test(who)) return { bgm: "gaPeonyBattle", winBgm: "gaTrainerWin" };
  if (/^Gym Trainer/.test(who)) return { bgm: "gaTrainer", winBgm: "gaGymTrainerWin" };
  const leg = nd.catch || (nd.wild && W.length === 1 && W[0].length === 1 ? W[0][0].op : null);
  if (/Eternatus/.test(nd.name)) return { bgm: /Eternamax/.test(nd.name) ? "gaEternamax" : "gaEternatus", winBgm: "gaWildWin" };
  if (leg && GALAR_LEGEND_BGM[leg]) return { bgm: GALAR_LEGEND_BGM[leg], winBgm: "gaWildWin" };
  if (nd.wild && W.flat().some(s => s.auraN)) return { bgm: /^Max Lair/.test(nd.name) ? "gaAdventureBattle" : "gaMaxRaid", winBgm: "gaMaxRaidWin" };
  return nd.trainer ? { bgm: "gaTrainer", winBgm: "gaTrainerWin" } : { bgm: "gaWild", winBgm: "gaWildWin" };
}
// Ball Fetch (the owner's rule): after each Journey stage won with it on the team, Quick Battles too, a 10% chance of a Safari Ball;
// one roll a battle, however many have it
const BALL_FETCH_CHANCE = .1;
function ballFetch(ids, cost, n) {
  if (!ids.some(k => S.ops[k] && abilityOf(S.ops[k].ab || OPS[k].ab).id === "BALL_FETCH")) return [];
  let got = 0; for (let i = 0; i < n; i++) if (Math.random() < BALL_FETCH_CHANCE) got++;
  return got ? give({ permit: got }) : [];
}
function sweepNode(id, x) {
  const nd = NODES[id], cost = nodeCost(nd) * x, ids = S.team.story.filter(owned).filter(k => journeyOk(k, nd));
  if (nodeStars(id) < 3) return;
  if (!ids.length) { toast(`Your Journey team has none of ${REGION_NAME[nd.ep.id]}'s Pokémon: win a ${REGION_NAME[nd.ep.id]} stage with them first.`); return; }
  if (!needSanity(cost)) return;
  spendSanity(cost);
  let list = [];
  for (let k = 0; k < x; k++) list = list.concat(give(coin(ids, nodeDrops(nd, false))));
  list = list.concat(ballFetch(ids, nodeCost(nd), x));   // (Ball Fetch: each Quick Battle rolls)
  opsXp(ids, battleXp(nd.lv) * x);
  list.push({ k: "xp", n: battleXp(nd.lv) * x });
  S.daily.clear += x; S.stats.battles += x; S.stats.wins += x;
  closeModal(); rerender();
  rewardModal(x > 1 ? `Quick Battle ×${x}` : "Quick Battle", list, `${nd.id} ${nd.name}`);
}

// ---------- explore ----------
function huntWaves(h, l) { return huntWavesSpec(h, l).map(w => convWave(w, HUNT_LV[l - 1])); }
function huntDrops(h, l, ids = []) {
  const list = [], lv = HUNT_LV[l - 1];
  // Cerulean Cave: Exp. Candy, bigger the deeper you go, and sometimes a Rare Candy
  if (huntKind(h) === "candy") {
    const bag = [{ rec1: 6 }, { rec1: 3, rec2: 3 }, { rec2: 5 }, { rec2: 3, rec3: 2 }, { rec3: 3, rec4: 1 }, { rec3: 2, rec4: 2 }][l - 1];
    if (R() < .1 + l * .04) list.push(...give({ rare: 1 }));
    return list.concat(give(coin(ids, { ...bag, lmd: 300 + l * 200 })));
  }
  // Rocket Hideout: Poké Dollars, about four times what the other areas pay
  if (huntKind(h) === "money") return give(coin(ids, { lmd: 3000 + l * 2500 + Math.round(R() * 1000) * l }));
  if (R() < (h.stone === "linkcord" ? .1 + l * .04 : .2 + l * .08)) list.push(...give({ [h.stone]: 1 }));
  if (R() < .1 + l * .05) list.push(...give({ summ: 1 }));
  if (R() < Math.min(.9, .25 + l * .12)) {
    const pool = h.items.filter(k => HELD[k].t < 3 || l >= 4);
    list.push(...give({ held: pick(pool) }));
  }
  return list.concat(give(coin(ids, { lmd: 800 + l * 700, [recFor(lv)]: 2 })));
}
function launchHunt(id, l) {
  const h = HUNTS.find(x => x.id === id), cost = HUNT_COST[l - 1], ids = squadOrToast("hunt");
  if (!huntLeft(id)) { toast(`No tries left in ${h.n} today. Get another with Gems, or come back tomorrow.`); return; }
  if (!ids || !needSanity(cost)) return;
  route("hunt", id);
  spendSanity(cost); S.stats.battles++; save();
  startBattle({
    allies: allySpecs(ids), waves: huntWaves(h, l), env: h.env, weather: h.weather, wild: true, title: h.n, sub: `Explore · ${h.code}-${l}`,
    onWin() {
      S.hunt[id] = Math.max(S.hunt[id] || 0, l); S.stats.wins++; S.stats.patrols++; S.daily.clear++; useHuntTries(id, 1);
      const list = huntDrops(h, l, ids);
      return { rewards: list, levels: opsXp(ids, battleXp(HUNT_LV[l - 1])) };
    },
    onLose() { S.sanity += Math.max(0, cost - 1); return { rewards: [] }; },
    onQuit() { S.sanity += Math.max(0, cost - 1); save(); },
    retry: () => launchHunt(id, l),
  });
}
// Quick Battle: up to three clears at once, one try each
function sweepHunt(id, l) {
  const h = HUNTS.find(x => x.id === id), n = Math.min(3, huntLeft(id)), cost = HUNT_COST[l - 1] * n;
  if ((S.hunt[id] || 0) < l || !n || !needSanity(cost)) return;
  spendSanity(cost); useHuntTries(id, n);
  let list = [];
  for (let k = 0; k < n; k++) list = list.concat(huntDrops(h, l, S.team.hunt.filter(owned)));
  opsXp(S.team.hunt.filter(owned), battleXp(HUNT_LV[l - 1]) * n);
  S.daily.clear += n; S.stats.battles += n; S.stats.wins += n; S.stats.patrols += n;
  rerender(); rewardModal(n > 1 ? `Quick Battle ×${n}` : "Quick Battle", list, `${h.code}-${l} ${h.n}`);
}

// ---------- Battle Tower ----------
function launchTower(w, f) {
  const T = towerFloor(w, f), all = squadOrToast("tower"), ids = all && all.filter(k => towerOk(k, w));
  if (all && !ids.length) { toast(`Only ${REGION_NAME[w]}'s Pokémon can battle in the ${REGION_NAME[w]} Wing.`); return; }
  if (!T || !ids || !towerOpen(w) || f !== towerDone(w) + 1) return;
  route("tower");
  S.stats.battles++;
  startBattle({
    allies: ids.filter(owned).map(k => ({ op: k, prog: towerProg(k, T) })), waves: T.waves.map(wv => convWave(wv, T.lv, wingGen(w))), env: T.env,   // (the wing's region, at most the floor's cap) bb: T.bb, title: `${REGION_NAME[w]} Wing · Floor ${f}`, sub: "Battle Tower", bgm: T.bgm || (f % 5 === 0 ? TOWER_STAR_THEME : TOWER_THEME), winBgm: T.winBgm || (f % 5 === 0 ? "gymWin" : "trainerWin"),
    trainer: T.trainer.name, trainerSpr: T.trainer.spr, intro: T.trainer.intro, lose: T.trainer.lose, ball: T.trainer.ball,
    onWin() {
      S.towerW[w] = Math.max(towerDone(w), f); S.tower = Object.values(S.towerW).reduce((a, n) => a + n, 0); S.stats.wins++; S.daily.clear++;
      if (T.winJingle) jingle(T.winJingle);   // (a Frontier Brain's Symbol)
      return { rewards: give(coin(ids, T.reward)), levels: opsXp(ids, Math.round(battleXp(T.lv) * .6)) };
    },
    retry: () => launchTower(w, f),
  });
}

// =====================================================================
//  ACTIONS (event delegation on data-act)
// =====================================================================
function quip() {
  const st = $(".stage"); if (!st || !S.assistant) return;
  const key = S.assistant, lines = QUIPS[key] || QUIPS._;
  st.querySelector(".quip") && st.querySelector(".quip").remove();
  const q = document.createElement("div"); q.className = "quip";
  q.innerHTML = `<b>${esc(OPS[key].n)}</b>${esc(pick(lines))}`;
  st.appendChild(q); cry(key);
  const img = st.querySelector(".assist");
  if (img) img.animate([{ transform: "translateX(-50%) translateY(0)" }, { transform: "translateX(-50%) translateY(-16px)" }, { transform: "translateX(-50%) translateY(0)" }], { duration: 360, easing: "ease-out" });
  clearTimeout(quip.t); quip.t = setTimeout(() => q.remove(), 3600);
}
function introModal() {
  openModal(`<div class="stack" style="align-items:center;text-align:center">
    <img class="px" src="${trainerURL(avatar())}" alt="" style="height:120px;image-rendering:pixelated">
    <div class="eyebrow">A new adventure</div>
    <h1>Welcome to the world of Pokémon!</h1>
    <p class="small dim" style="max-width:36ch">Lead a team of up to six Pokémon, three on the field at a time: switch them in and out, and choose who comes in when one faints. Every move has a type: hit a Pokémon's weakness for double damage, and moves that match the user's type get a 50% boost. Your level cap is 2 levels below the strongest Pokémon in your next Gym Leader, rival, villain boss or Elite Four battle: beat them to raise it. Choose the region your Journey starts in, earn its eight Gym Badges, evolve your Pokémon, catch more in the Safari Zone, and fill your Pokédex.</p>
    <button class="btn wide" data-act="introGo">Choose your region</button>
    <p class="tiny dim">Unofficial, non-commercial fan game. Pokémon © Nintendo, Game Freak and Creatures Inc. Sprites from Pokémon Showdown.</p>
  </div>`);
}
SCREENS.events = eventsScreen;   // the Event Center (a6j_live.js)
const ACT = {
  ...META_ACT,
  ...SERVER_ACT,
  ...LIVE_ACT,
  ...OFFER_ACT,
  ...PASS_ACT,
  ...LUCKY_ACT,
  ...SLOT_ACT,
  ...FEST_ACT,
  ...GB_ACT,
  ...STADIUM_ACT,
  ...SOCIAL_ACT,
  ...HOME_ACT,
  go: d => { if (d.v === "op" && d.a !== UI.arg) UI.opTab = "info"; closeModal(); route(d.v, d.a || null); },
  poke: () => quip(),
  missions: () => missionsModal(),
  settings: () => { closeModal(); route("settings"); },
  sanity: () => sanityModal(),
  closeModal: () => closeModal(),
  introGo: () => { S.seenIntro = true; regionPickModal(); },
  // a new game's region (one with a Journey); then its first stage, the Professor's lab and its starters
  pickRegion: d => {
    if (!journeyOf(d.v)) { toast(`The ${REGION_NAME[d.v]} Journey is coming soon.`); return; }
    if (!S.region) openRegion(d.v);
    closeModal(); const nd = journeyMain(S.region)[0]; route("chapter", nd.ch.id); nodeSheet(nd);
  },
  // a Journey's Part 2 starter (its own giver, at Lv 5: readStory)
  pickPartStarter: d => {
    const r = regionRec(d.v); if (r.starter2 || !regionStarters(d.v).includes(d.k)) return;
    r.starter2 = d.k; grantOp(d.k, 5); if (S.ops[d.k]) S.ops[d.k].pot = Math.max(3, S.ops[d.k].pot); starterBerry(d.k);
    closeModal(); cry(d.k); sfx("win"); toast(`You chose ${OPS[d.k].n}! It's holding Berry Juice.`, "gold"); save();
    if (STARTER_RES) { const res = STARTER_RES; STARTER_RES = null; res(); }
  },
  pickStarter: d => {
    if (S.starter) return;
    if (!S.region) openRegion("kanto");   // (the lab reached without choosing a region: Kanto's)
    S.starter = d.k; regionRec(S.region).starter = d.k; grantOp(d.k, 5); S.ops[d.k].pot = 3; S.assistant = d.k; starterBerry(d.k);
    for (const m in S.team) S.team[m] = [d.k];
    closeModal(); cry(d.k); sfx("win"); toast(`You chose ${OPS[d.k].n}! It's holding Berry Juice.`, "gold"); save();
    if (STARTER_RES) { const r = STARTER_RES; STARTER_RES = null; r(); }
  },

  // journey
  chapter: d => { closeModal(); route("chapter", d.c); },
  openNode: d => {
    const nd = NODES[d.id];
    if (!nodeOpen(nd)) { toast(nd.type === "side" ? "Clear the stage before this side stage first." : "Clear the previous stage first."); return; }
    if (UI.view !== "chapter" || UI.arg !== nd.ch.id) route("chapter", nd.ch.id);
    nodeSheet(nd);
  },
  startNode: d => {
    const nd = NODES[d.id];
    if (nd.type === "story") return readStory(nd);
    if (nd.type === "chest" || nd.chest) return openChest(nd);   // (a side stage can be a gift too: chest: 1)
    if (!S.starter) { toast(`Choose your first Pokémon at ${profFull()}'s lab first.`); return; }
    teamScreen("story", `${nd.id} ${nd.name}`, nodeCost(nd), nodeFoes(nd), ["chapter", nd.ch.id], { kind: "node", id: nd.id });
  },
  sweep: d => sweepNode(d.id, +d.x),

  // team select
  teamBack: () => { const b = UI.arg && UI.arg.back; UI.team = null; route(b ? b[0] : "home", b ? b[1] : null); },
  // a place in the team: pick a Pokémon up, then tap another place to swap (or an empty one to move it); tap it again to remove it
  slot: d => {
    const T = UI.team, ids = T.ids, k = +d.k;
    if (T.sel == null) { if (ids[k]) T.sel = k; }
    else if (T.sel === k) { ids.splice(k, 1); T.sel = null; }
    else { const a = ids[T.sel]; if (k < ids.length) { ids[T.sel] = ids[k]; ids[k] = a; } else { ids.splice(T.sel, 1); ids.push(a); } T.sel = null; }
    sfx("tap"); rerender();
  },
  pickTeam: d => {
    const ids = UI.team.ids, i = ids.indexOf(d.k);
    UI.team.sel = null;
    const pvpC = i < 0 && UI.arg && PVP_TEAMS.has(UI.arg.mode) && pvpClash([...ids, d.k], pvpLimits(UI.arg.mode === "friendly" ? "friendly" : "ranked"));
    if (i >= 0) ids.splice(i, 1);
    else if (ids.length >= ROSTER) { toast("Your team is full. Tap a Pokémon in your team twice to take it off."); return; }
    else if (pvpC) { toast(pvpText(pvpC)); return; }
    else ids.push(d.k);
    sfx("tap"); rerender();
  },
  deploy: () => {
    const a = UI.arg, L2 = a.launch, c = clauseClash(UI.team.ids.map(k => S.ops[k] && S.ops[k].held));
    if (c) { toast(`Item Clause: only one ${HELD[c].n} per team.`); return; }
    const pc = PVP_TEAMS.has(a.mode) && pvpClash(UI.team.ids, pvpLimits(a.mode === "friendly" ? "friendly" : "ranked")); if (pc) { toast(pvpText(pc)); return; }
    S.team[a.mode] = UI.team.ids.slice(); save();
    if (L2.kind === "node") launchNode(L2.id);
    else if (L2.kind === "hunt") launchHunt(L2.id, L2.l);
    else if (L2.kind === "tower") launchTower(L2.w || "kanto", L2.f);
    else if (L2.kind === "ladder") launchLadder(L2.i, L2.rev);
    else if (L2.kind === "defense") { route("arena"); toast("Team registered!"); }
    else if (L2.kind === "gboss") launchGuildBoss();
    else if (L2.kind === "friendly") launchFriendly(L2.i);
  },
  elf: d => { UI.el = d.e; rerender(); },

  // battle hub
  huntLv: d => { UI.huntLv[d.h] = +d.l; rerender(); },
  huntGo: d => {
    const h = HUNTS.find(x => x.id === d.h), l = +d.l;
    if (!huntLeft(h.id)) { toast(`No tries left in ${h.n} today. Get another with Gems, or come back tomorrow.`); return; }
    teamScreen("hunt", `${h.code}-${l} ${h.n}`, HUNT_COST[l - 1], huntWaves(h, l).flat(), ["hunt", h.id], { kind: "hunt", id: h.id, l });
  },
  huntSweep: d => sweepHunt(d.h, +d.l),
  huntBuy: d => { const h = HUNTS.find(x => x.id === d.h); if (buyHuntTry(d.h)) { sfx("coin"); toast(`One more try in ${h.n} today.`, "gold"); save(); rerender(); } else toast("Not enough Gems."); },
  towerGo: d => { const T = towerFloor(d.w, +d.f); teamScreen("tower", `Battle Tower · ${REGION_NAME[d.w]} Wing · Floor ${T.f}`, 0, T.waves.map(w => convWave(w, T.lv, wingGen(d.w))).flat(), ["tower", null], { kind: "tower", w: d.w, f: T.f }); },
  towerTab: d => { UI.tw = d.v; route("tower"); },

  // Pokémon
  toggleAll: () => { UI.all = !UI.all; rerender(); },
  clsf: d => { UI.cls = d.c; rerender(); },
  sortf: d => { UI.sort = d.s; rerender(); },
  opTab: d => { UI.opTab = d.t; rerender(); },
  skUp: d => { if (skillUp(d.k, +d.i)) { sfx("heal"); toast(`${MOVES[S.ops[d.k].mv[+d.i]].n}: Mastery ${RANK[S.ops[d.k].sk[+d.i]]}.`); } rerender(); },
  rec: d => { const lv = S.ops[d.k].lvl; if (useRecord(d.k, d.it)) { sfx("tap"); if (S.ops[d.k].lvl > lv) { S.daily.upgrade++; toast(`${OPS[d.k].n} grew to Lv ${S.ops[d.k].lvl}!`); } } rerender(); },
  autoLv: d => { const lv = S.ops[d.k].lvl, n = autoLevel(d.k); if (n) { sfx("heal"); if (S.ops[d.k].lvl > lv) S.daily.upgrade++; toast(`Used ${n} Exp. Candy. Lv ${lv} → ${S.ops[d.k].lvl}.`); } rerender(); },
  evolve: async d => {
    const from = d.k, to = d.to;
    if (!evoOptions(from).some(o => o.to === to && o.ok)) return;
    await evolveScene(from, to);
    if (evolve(from, to)) { UI.opTab = "info"; route("op", to); checkAchievements(); }
  },
  hold: d => { if (equipHeld(d.k, d.it)) { sfx("tap"); toast(`${OPS[d.k].n} is now holding the ${HELD[d.it].n}.`); } rerender(); },
  unhold: d => { equipHeld(d.k, null); sfx("tap"); rerender(); },
  assistant: d => { S.assistant = d.k; toast(`${OPS[d.k].n} is now your partner!`); rerender(); },
  depotTab: d => { UI.depotTab = d.t === "keys" ? "items" : d.t; rerender(); },
  dexF: d => { UI.dexF = d.v; rerender(); },
  dexR: d => { UI.dexR = +d.v; rerender(); },
  regionSoon: d => regionSoonModal(d.v),
  jrTab: d => { UI.jr = d.v; rerender(); },
  // the next region (nextRegions): its Professor and three starters, then it opens
  regionStart: d => { if (nextRegions().includes(d.v)) regionStartModal(d.v); },
  pickRegionStarter: d => {
    if (!nextRegions().includes(d.v) || !regionStarters(d.v).includes(d.k)) return;
    const came = openRegion(d.v), r = grantOp(d.k, 5); S.regions[d.v].starter = d.k;
    if (S.ops[d.k]) S.ops[d.k].pot = Math.max(3, S.ops[d.k].pot);
    const berry = starterBerry(d.k);
    if (journeyOf(d.v)) S.team.story = [d.k];
    cry(d.k); sfx("win"); save(); rerender();
    regionOpenModal(d.v, d.k, [{ k: "op:" + d.k, n: 1, isNew: r.isNew }, berry, ...came]);
  },
  dexEntry: d => { if (S.dex.seen[d.k] || S.dex.caught[d.k]) cry(d.k); dexModal(d.k); },

  // Safari Zone
  hhBanner: d => { UI.hhB = d.b; sfx("tap"); rerender(); },
  // Safari Points: trade them for the area's featured 5★
  spark: d => {
    const B = bannerById(UI.hhB), k = d.k; if (!B.feat6.includes(k) || ((S.gacha.spark || {})[B.id] || 0) < SPARK) return;
    S.gacha.spark[B.id] -= SPARK; const r = grantOp(k); live("spark"); save(); sfx("win"); rerender(); rewardModal("Safari Points traded!", [{ k: "op:" + k, n: 1, isNew: r.isNew }], B.n);
  },
  pull: async d => {
    const n = +d.n, B = bannerById(UI.hhB), c = throwCost(B, n);
    if (!c.ok) { toast(c.why || "Not enough Gems or Safari Balls."); return; }
    if (c.cur === "orundum") { gemsOut(c.amt, "Safari"); if (c.disc) S.gacha.disc = today(); if (c.half) S.gacha.half[B.id] = 1; }
    else if (WALLET.includes(c.cur)) S[c.cur] -= c.amt; else S.inv[c.cur] -= c.amt;
    const res = headhunt(n, B.id); save(); renderTop();
    await gachaReveal(res);
    checkAchievements(); rerender();
  },

  // research
  claimDaily: d => {
    const m = DAILIES.find(x => x.id === d.id);
    if (!m || S.daily.claimed[m.id] || (S.daily[m.id] || 0) < m.goal) return;
    S.daily.claimed[m.id] = 1; give(m.reward); sfx("heal"); renderTop(); missionsModal();
  },
  claimAllDaily: () => { if (S.daily.claimed.all) return; S.daily.claimed.all = 1; give(DAILY_ALL); sfx("win"); renderTop(); missionsModal(); },

  // shops
  shopTab: d => { UI.shopTab = d.t; rerender(); },
  // moves
  learnYes: () => { const q = S.learnQ.shift(); if (q && learnMove(q.k, q.m)) { toast(`${OPS[q.k].n} learned ${MOVES[q.m].n}!`, "gold"); sfx("heal"); } save(); closeModal(); rerender(); },
  learnNo: () => { const q = S.learnQ.shift(); if (q) toast(`${OPS[q.k].n} did not learn ${MOVES[q.m].n}.`); save(); closeModal(); rerender(); },
  remind: d => remindModal(d.k),
  remindDo: d => { if (remindMove(d.k, d.m)) { sfx("heal"); toast(`${OPS[d.k].n} remembered ${MOVES[d.m].n}!`, "gold"); save(); remindModal(d.k); rerender(); } },
  tmCase: d => tmCaseModal(d.k),
  mint: d => mintModal(d.k),
  mintUse: d => { if (useMint(d.k, d.n)) { sfx("heal"); toast(`${OPS[d.k].n}'s nature is now ${natName(d.n)}!`, "gold"); save(); closeModal(); rerender(); } },
  abItem: d => abilityModal(d.k, d.it),
  abUse: d => { if (useAbilityItem(d.k, d.it, d.a)) { sfx("heal"); toast(`${OPS[d.k].n}'s Ability is now ${abilityOf(d.a).name}!`, "gold"); save(); closeModal(); rerender(); } },
  buyTM: d => { const n = +d.n; if (!buyTM(n)) return; sfx("coin"); save(); rerender(); toast(`You bought ${tmName(n)} ${MOVES[TM_MOVE[n]].n}!`, "gold"); tmTeachModal(n); },
  tmTeach: d => { const n = +d.n; if (teachTM(d.k, n)) { sfx("heal"); toast(`${OPS[d.k].n} learned ${MOVES[TM_MOVE[n]].n}!`, "gold"); save(); closeModal(); rerender(); } },
  buy: d => {
    const sh = SHOP[d.t], it = sh && shopItems(sh).find(x => x.id === d.id), cur = sh && sh.cur;
    if (!it || have(cur) < it.cost) { toast(`Not enough ${itemName(cur)}.`); return; }
    if (cur === "orundum") gemsOut(it.cost, "Shop"); else if (WALLET.includes(cur)) S[cur] -= it.cost; else S.inv[cur] -= it.cost;
    let list;
    if (it.give.op) { const r = grantOp(it.give.op); list = [{ k: "op:" + it.give.op, n: 1, isNew: r.isNew }]; }
    else list = give(it.give);
    sfx("heal");
    if (UI.view === "shop") rerender(); else renderTop();
    rewardModal(d.t === "elixir" ? "PP restored!" : "Thank you!", list, it.n);
  },
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset, el, e); }
});

// =====================================================================
//  BOOT
// =====================================================================
function migrate(s) {
  // the Kanto Journey follows FireRed/LeafGreen (2026-10-15): the rival joins the Pokémon Tower (chapter 5's stages move up one),
  // Moltres moves to Mt. Ember (S9-1 is S7-2), Yellow's Jessie & James go to the Battle Tower (S4-1)
  if (s.frlg == null && s.story) {
    const st = s.story, mv = (a, b) => { if (st[a] != null) { st[b] = st[a]; delete st[a]; } };
    for (let n = 7; n >= 2; n--) mv("5-" + n, "5-" + (n + 1));
    mv("S9-1", "S7-2"); delete st["S4-1"];
  }
  s.frlg = 1;
  // the Hoenn Journey's strongest teams (2026-10-15): Emerald's Rustboro rival battle went to the Battle Tower, so chapter 2's later
  // stages move down one (ho2-3 is ho2-2...)
  if (s.hoE == null && s.story) {
    const st = s.story, mv = (a, b) => { if (st[a] != null) { st[b] = st[a]; delete st[a]; } };
    delete st["ho2-2"]; for (let n = 3; n <= 8; n++) mv("ho2-" + n, "ho2-" + (n - 1));
  }
  s.hoE = 1;
  // the Johto Journey's strongest teams (2026-10-15): Pryce's Gym comes before Jasmine's (chapter 5's Jasmine, jo5-10, is chapter
  // 6's last stage, jo6-8), and Crystal's trip to Kanto is chapter 10 (Mt. Silver's stages and chapter reward move to chapter 11)
  if (s.joS == null && s.story) {
    const st = s.story, mv = (a, b) => { if (st[a] != null) { st[b] = st[a]; delete st[a]; } };
    for (const k of Object.keys(st).filter(k => /^joS?10-/.test(k))) mv(k, k.replace("10-", "11-"));
    mv("jo5-10", "jo6-8");
    if (s.chRw && s.chRw.joc10) { s.chRw.joc11 = s.chRw.joc10; delete s.chRw.joc10; }
  }
  s.joS = 1;
  // the Kanto Journey's Sevii Islands (2026-10-16): FireRed/LeafGreen's post-game is chapter 10, so Cerulean Cave is chapter 11 (10-n is
  // 11-n, its chapter reward too); their Battle Tower floors moved into the Journey, so the Kanto wing's floors cleared count without them
  if (s.sevii == null && s.story) {
    const st = s.story, mv = (a, b) => { if (st[a] != null) { st[b] = st[a]; delete st[a]; } };
    for (const k of Object.keys(st).filter(k => /^S?10-/.test(k))) mv(k, k.replace("10-", "11-"));
    if (s.chRw && s.chRw.c10) { s.chRw.c11 = s.chRw.c10; delete s.chRw.c10; }
    const n = (s.towerW && s.towerW.kanto) || 0;
    if (n) { s.towerW.kanto = n - towerFloors("kanto", true).slice(0, n).filter(o => o.moved).length; s.tower = Object.values(s.towerW).reduce((a, v) => a + v, 0); }
  }
  s.sevii = 1;
  delete s.keys;   // (the story's keepsakes, 2026-10-16 to 10-18: gone, the owner's rule)
  const fresh = newSave(), featsBefore = s.featSeen == null;
  for (const k in fresh) if (s[k] == null) s[k] = fresh[k];
  // features open with the Journey (featOn in a6_state.js): a save from before that already has what it has reached, without
  // a note for each
  if (featsBefore) {
    const done = id => ((s.story || {})[id] || 0) > 0;
    for (const [id, , at] of FEATURES) if (done(at)) s.featSeen[id] = 1;
  }
  joinOneServer(s);
  // the Battle Tower's wings (2026-10-15): floors cleared in the old 30-floor Tower count in Kanto's wing
  if (s.tower && !Object.keys(s.towerW).length) { s.towerW.kanto = Math.min(s.tower, towerCount(["kanto"])); s.tower = s.towerW.kanto; }
  // regions (the Journey revamp's phase 2): a game from before has Kanto's Journey; one that had completed it had every region's
  // Pokémon, and keeps them (each region open since then)
  if (s.seenIntro && !Object.keys(s.regions || {}).length) {
    const W = (s.world && s.world.start) || s.created || Date.now(), end = s.regionsMs || (((s.story || {})[JOURNEY_END] || 0) > 0 ? W : null);
    s.regions = { kanto: { at: W, starter: s.starter || null, done: end } };
    if (end) for (const id of REGION_IDS) if (!s.regions[id]) s.regions[id] = { at: end, starter: null, done: end };
    s.region = "kanto"; s.first = "kanto";
  }
  delete s.regionsMs;
  if (s.avatar) s.avatar = lookOf(s.avatar, s);   // (a look it doesn't own: Red or Leaf)
  if (s.lvl > TRAINER_MAX) { s.lvl = TRAINER_MAX; s.xp = 0; }   // (the Trainer Level cap was 120)
  s.dex = { seen: {}, caught: {}, ...(s.dex || {}) };
  s.held = s.held || {}; s.inv = s.inv || {}; s.hunt = s.hunt || {}; s.chRw = s.chRw || {};
  s.stats = { ...newStats(), ...(s.stats || {}) };
  s.gacha = { ...fresh.gacha, ...(s.gacha || {}) };
  s.settings = { ...fresh.settings, ...(s.settings || {}) };
  for (const k of Object.keys(s.ops)) {
    if (!OPS[k]) { delete s.ops[k]; continue; }
    const p = s.ops[k]; p.sk = (p.sk || [1, 1, 1]).map(v => Math.min(MAX_SK, v)); if (p.held === undefined) p.held = null; s.dex.caught[k] = 1; s.dex.seen[k] = 1;
    // moves (from the FireRed/LeafGreen update): older saves start with what each Pokémon knows at its level
    // moves no longer in the game, or now in another slot, give way to the best it would know at its level
    const dm = defaultMoves(k, p.lvl);
    p.mv = Array.isArray(p.mv) ? [0, 1, 2].map(i => p.mv[i] && MOVES[p.mv[i]] && slotOf(p.mv[i]) === i + 1 ? p.mv[i] : dm[i]) : dm;
    // natures and Abilities (from the all-generations update): a random nature, and its species' Ability it had as default
    if (!NATURES[p.nat]) p.nat = randNature();
    if (!p.ab || !OPS[k].abs.some(a => a.k === p.ab)) p.ab = OPS[k].abs.some(a => a.k === OPS[k].ab && !a.h) ? OPS[k].ab : randAbility(k);
  }
  // TMs bought before every generation's TMs arrived were numbered as in FireRed/LeafGreen (Gen 3)
  s.tms = s.tms || {};
  for (const n of Object.keys(s.tms)) if (+n < 1000) { const id = 3000 + +n; if (TM_MOVE[id]) s.tms[id] = (s.tms[id] || 0) + s.tms[n]; delete s.tms[n]; }
  s.learnQ = (s.learnQ || []).filter(q => s.ops[q.k] && MOVES[q.m]);
  s.daily.hunt = s.daily.hunt || {}; s.daily.huntBuy = s.daily.huntBuy || {};
  for (const k in s.team) s.team[k] = (s.team[k] || []).filter(x => s.ops[x]);
  if (!s.ops[s.assistant]) s.assistant = Object.keys(s.ops)[0] || null;
  s.inbox = s.inbox || [];
  if (!s.ladder || !Array.isArray(s.ladder.pop)) s.ladder = ladderInit();
  ladderGrow(s.ladder);   // (1,500 Trainers before the Johto-to-Unova update, 3,000 now)
  if (!s.rta) s.rta = rtaInit();
  s.team.defense = s.team.defense || [];
  s.team.friendly = s.team.friendly || (s.team.arena || []).slice();
  if (typeof s.bio !== "string") s.bio = "";
  s.team.gboss = s.team.gboss || [];
  delete s.arena;
  if (!s.welcome) welcomeMail(s);
  return s;
}
let booted = false;
function start(data) {
  if (!booted) {
    booted = true;
    UI.huntLv = {};
    gbInit(); applyShell();
    preloadSprites().then(() => { if (UI.inGame && $("#modal").hidden && $("#gacha").hidden && $("#dlg").hidden && !BT.on) rerender(); });
    let tick = 0;
    setInterval(() => {
      if (!S) return;
      if (BT.on) { tickTimers(); return; }
      if (++tick % 30 === 0 && UI.inGame && $("#modal").hidden && $("#gacha").hidden && $("#dlg").hidden) { metaTick(); renderTop(); }
      const sig = () => [S.sanity, S.ladder.tickets, S.ladder.log.length].join("|");
      const before = sig();
      tickTimers();
      const now = Date.now(), L = S.ladder;
      if (before !== sig()) { save(); if (UI.view === "arena" && !$("#modal").innerHTML) rerender(); else renderTop(); }
      for (const el of $$("[data-cd]")) {
        const left = { tix: TICKET_MS - (now - L.tTime), ref: REFRESH_MS - (now - L.oppT), recharge: rechargeLeft() }[el.dataset.cd];
        el.textContent = dur(Math.max(0, left));
      }
    }, 1000);
    window.addEventListener("pagehide", flushSave);
    document.addEventListener("visibilitychange", () => { if (document.hidden) flushSave(); });
    if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ save: S, slot: SAVE_SLOT, session: SESSION }));
  }
  // hot reload keeps playing the same save; otherwise the title screen, where the Trainer logs in
  if (data && data.save) { SESSION = data.session || { id: "hot", name: data.save.name }; enterGame(data.slot || SAVE_KEY, { save: data.save }); }
  else showTitle();
}
if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start);
else start(window.claude && window.claude.hot && window.claude.hot.data || {});
</script>
