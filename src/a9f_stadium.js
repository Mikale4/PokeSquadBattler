
// =====================================================================
//  BATTLE STADIUM — Ranked Battles and Link Battles (screens, draft, launchers). Rules in a6b_ladder.js.
// =====================================================================
// a tier's badge is its Poké Ball sprite on a ring in the tier's colour
function tierBadge(p, size = 52) {
  const t = tierOf(p), b = RES_DATA.item[t.ball];
  return `<span class="tbadge" style="--tc:${t.c};--s:${size}px" title="${t.n}">${b ? `<img class="px" src="${resPng(b)}" alt="${t.n}">` : IC.pokeball}</span>`;
}
// true while the Demo (a9g_demo.js) is playing: opponents in the draft think faster
const DEMO_ON = () => typeof DEMO === "object" && !!DEMO && !!DEMO.on;
const TIER_BALL = ["poke", "poke", "great", "ultra", "master", "ultra", "master", "master"]; // what a tier's Trainers throw
const aiLabel = s => (AI_NAME[s] || s) + " tactics";
const agoShort = t => { const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 60 ? m + "m ago" : m < 1440 ? Math.round(m / 60) + "h ago" : Math.round(m / 1440) + "d ago"; };
const rtaRank = p => 1 + S.ladder.pop.filter((x, i) => trainerTarget(i) > p).length;   // (each Trainer's own progress: trainerTarget)
const docLine = doc => pick(["Let's battle!", "My team's ready. Are you?", "I've been waiting for a real challenge!", "Show me what you've got!", "No holding back!", "Let's make this a good one!"]);

SCREENS.arena = () => {
  tickTimers();
  const tab = UI.arenaTab === "rta" && featOn("link") ? "rta" : "ladder";   // (Link Battles open later in the Journey)
  return `<div class="stack">
    <div class="spread">${back("go", "Battle", 'data-v="battle"')}<span class="eyebrow">Battle Stadium</span></div>
    ${featOn("link") ? `<div class="tabs2"><button class="${tab === "ladder" ? "on" : ""}" data-act="arenaTab" data-t="ladder">Ranked Battles</button><button class="${tab === "rta" ? "on" : ""}" data-act="arenaTab" data-t="rta">Link Battles</button></div>` : ""}
    ${tab === "ladder" ? ladderHTML() : rtaHTML()}
  </div>`;
};
function tierCard(p, best, lines, side) {
  const t = tierOf(p), nx = TIERS[tierIdx(p) + 1];
  return `<section class="panel tiercard" style="--tc:${t.c}">${tierBadge(p)}
    <div class="tc-main"><div class="eyebrow" style="color:${t.c}">${t.n}${tierIdx(p) >= 1 && tierIdx(p) <= 4 ? " tier" : ""}</div><div class="tc-pts num">${fmtFull(p)} <small>pts</small></div>
      <div class="tiny dim">${lines}</div>
      ${nx ? `<div class="bar thin" style="margin-top:5px"><i style="width:${clamp((p - t.min) / (nx.min - t.min), 0, 1) * 100}%;background:${t.c}"></i></div><div class="tiny dim">${nx.min - p} pts to ${nx.n} · Best: ${tierOf(best).n}</div>` : `<div class="tiny" style="color:${t.c}">Top tier · Best ${fmtFull(best)} pts</div>`}</div>
    <div class="tc-side small">${side}</div></section>`;
}
function ladderHTML() {
  const L = S.ladder, now = Date.now(), opps = ladderOpps(), unseen = L.log.filter(x => x.t > L.seen).length, cool = now - L.oppT < REFRESH_MS;
  return `${tierCard(L.pts, L.best, `Rank #${fmtFull(ladderRank())} of ${fmtFull(LADDER_N + 1)} Trainers`,
      `<div>Tickets <b class="num">${L.tickets}/${ticketsMax()}</b></div>${L.tickets < ticketsMax() ? `<div class="tiny dim num">+1 in <span data-cd="tix">${dur(TICKET_MS - (now - L.tTime))}</span></div>` : ""}<div class="tiny dim">W ${L.wins} · L ${L.losses}</div>`)}
    <div class="row"><button class="btn ghost sm" style="flex:1" data-act="defense">Registered Team</button><button class="btn ghost sm" style="flex:1" data-act="rankings" data-t="ladder">Rankings</button>
      <button class="btn ghost sm" style="flex:1" data-act="defLog">Battle log${unseen ? ` <span class="badge-n">${unseen}</span>` : ""}</button></div>
    ${defenseSpecs().length ? "" : `<div class="hint" data-act="defense">${IC.pokeball.replace("<svg", '<svg width="20" height="20"')}<span class="small">Register a team. Other Trainers battle it while you're away, and its wins and losses move your rank too.</span></div>`}
    <div class="spread"><h3>Trainers near your rank</h3><button class="btn ghost sm" data-act="ladderRefresh" ${cool ? "disabled" : ""}>${cool ? `Refresh in <span data-cd="ref">${dur(REFRESH_MS - (now - L.oppT))}</span>` : "Refresh"}</button></div>
    ${opps.map(i => { const d = modeDoc(ladderDoc(i), "ranked"), p = L.pop[i], to = tierOf(p);
      return `<section class="panel stack" style="gap:8px">
        <div class="spread"><div class="row" style="gap:8px"><img class="px tav" src="${trainerURL(d.spr)}" alt=""><div><b>${docTitle(d)}</b><div class="tiny dim"><span class="row" style="gap:4px;display:inline-flex;vertical-align:middle">${tierBadge(p, 18)}<span style="color:${to.c};font-weight:800">${to.n}</span></span> · ${fmtFull(p)} pts</div><div class="tiny dim">Team CP <span class="num">${fmtFull(npcPower(d))}</span></div></div></div>
          <button class="btn sm" data-act="ladderGo" data-i="${i}" ${L.tickets > 0 ? "" : "disabled"}>Battle</button></div>
        <div class="row">${d.team.map(k => opHTML(k, { s: 48, prog: d.prog[k], nostars: 1, show: 1 })).join("")}</div>
        <div class="tiny dim">Win <b class="good">+${eloDelta(L.pts, p, true, eloK(L.pts))}</b> · Lose <b class="bad">${eloDelta(L.pts, p, false, eloK(L.pts))}</b> · Plays with ${aiLabel(d.ai)}</div></section>`; }).join("")}
    <p class="tiny dim">Each battle uses a Ticket (one refills every 30 minutes). Daily rewards arrive by Mail every day at 00:00 UTC: the ${tierOf(L.pts).n} tier pays ${rewardText(TIER_REWARD[tierIdx(L.pts)])} a day, and days you miss are paid when you're back (a week at most).
      Higher tiers bring fully trained teams and smarter tactics, and your Registered Team gets challenged more often.</p>`;
}
function rtaHTML() {
  const R = S.rta, n = Object.keys(S.ops).length;
  return `${tierCard(R.pts, R.best, R.place > 0 ? `Placement: ${R.place} match${R.place > 1 ? "es" : ""} left` : `Rank #${fmtFull(rtaRank(R.pts))} · Top ${Math.max(.1, Math.round(rtaRank(R.pts) / (LADDER_N + 1) * 1000) / 10)}%`,
      `<div>W ${R.wins} · L ${R.losses}</div><div class="tiny dim">${R.streak > 1 ? `${R.streak} win streak` : R.streak < -1 ? `${-R.streak} losses in a row` : "&nbsp;"}</div>`)}
    <button class="btn wide" data-act="rtaFind" ${n >= DRAFT_PICKS ? "" : "disabled"}>${n >= DRAFT_PICKS ? "Find a Link Battle" : `Catch ${DRAFT_PICKS} Pokémon to play`}</button>
    <div class="row"><button class="btn ghost sm" style="flex:1" data-act="rankings" data-t="rta">Rankings</button></div>
    <section class="sub small dim stack" style="gap:4px"><b style="color:var(--text)">How it works</b>
      <span>Matchmaking pairs you with a Trainer near your rating. Pick in turns (1-2-2-2-2-1) until each side has 5 Pokémon, then ban one of theirs: the remaining 4 v 4 battle live, 20 seconds per move.</span>
      <span>Higher tiers bring bigger boxes, type counter-picks, smarter bans and Expert tactics. Win 3 in a row for bonus points; placement matches move your rating faster.</span></section>
    ${R.log.length ? `<h3>Recent matches</h3>${R.log.slice(0, 8).map(m => `<div class="sub spread small"><span><b class="${m.win ? "good" : "bad"}">${m.win ? "Win" : "Loss"}</b> vs ${esc(m.name)} <span class="tiny dim">(${tierOf(m.pts).n})</span></span><span class="num">${m.d > 0 ? "+" : ""}${m.d} · <span class="tiny dim">${agoShort(m.t)}</span></span></div>`).join("")}` : ""}
    <p class="tiny dim">Daily rewards by tier arrive by Mail every day at 00:00 UTC: the ${tierOf(R.pts).n} tier pays ${rewardText(TIER_REWARD[tierIdx(R.pts)])} a day, and days you miss are paid when you're back (a week at most).</p>`;
}
function rankingsModal(mode) {
  const L = S.ladder, mine = mode === "rta" ? S.rta.pts : L.pts;
  const rows = L.pop.map((p, i) => ({ i, p: mode === "rta" ? Math.round(trainerTarget(i) + (seeded(hash(L.seed + "rta" + i))() - .5) * 140 * Math.max(.15, srvMaturity())) : p }));
  rows.push({ me: true, p: mine });
  rows.sort((a, b) => b.p - a.p);
  const at = rows.findIndex(r => r.me);
  const show = rows.slice(0, 30).map((r, k) => [k, r]).concat(at >= 30 ? [[-1], ...rows.slice(Math.max(30, at - 3), at + 4).map((r, j) => [Math.max(30, at - 3) + j, r])] : []);
  openModal(`<div class="stack"><div class="eyebrow">${mode === "rta" ? "Link Battles" : "Ranked Battles"}</div><h2>Rankings</h2>
    <div class="stack" style="gap:3px">${show.map(([k, r]) => k < 0 ? '<div class="tiny dim" style="text-align:center">⋯</div>' : rankRow(r, k + 1, fmtFull(r.p), { badge: tierBadge(r.p, 22), name: r.me ? "" : ladderName(S.ladder.seed, r.i) })).join("")}</div>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
function defLogModal() {
  const L = S.ladder; L.seen = Date.now(); save();
  openModal(`<div class="stack"><div class="eyebrow">Ranked Battles</div><h2>Registered Team log</h2>
    ${L.log.length ? L.log.map(x => { const d = ladderDoc(x.i);
      return `<div class="sub stack" style="gap:6px"><div class="spread"><span><b class="${x.held ? "good" : "bad"}">${x.held ? "Won" : "Lost"}</b> · ${docTitle(d)} <span class="tiny dim">(${tierOf(L.pop[x.i]).n})</span></span>
        <span class="num small">${x.d > 0 ? "+" : ""}${x.d} · <span class="tiny dim">${agoShort(x.t)}</span></span></div>
        <div class="spread"><div class="row" style="gap:4px">${x.team.map(k => opHTML(k, { s: 36, prog: d.prog[k], nostars: 1, show: 1 })).join("")}</div>
        ${!x.held && !x.rev ? `<button class="btn sm" data-act="ladderRevenge" data-i="${x.i}" data-t="${x.t}" ${L.tickets > 0 ? "" : "disabled"}>Rematch</button>` : ""}</div></div>`; }).join("")
      : '<p class="small dim">No challengers yet. Register a team; other Trainers battle it while you are away.</p>'}
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}

// ---------- launchers ----------
function launchLadder(i, revenge) {
  const L = S.ladder, ids = squadOrToast("arena");
  if (!ids) return;
  tickTimers();
  if (L.tickets <= 0) { toast("No Tickets left. One refills every 30 minutes."); return; }
  route("arena");
  if (L.tickets >= ticketsMax()) L.tTime = Date.now();
  L.tickets--; S.stats.battles++;
  if (revenge) L.rev[i] = 1;
  save();
  const doc = modeDoc(ladderDoc(i), "ranked"), t = tierIdx(L.pop[i]);   // (Ranked's own rules: the team config's modes)
  startBattle({
    allies: allySpecs(ids), waves: [npcLeads(doc, allySpecs(ids))], env: "gym", enemyStyle: doc.ai, pvp: true, bgm: stadiumTheme(),
    title: doc.name, sub: `Ranked Battle · ${TIERS[t].n} · ${fmtFull(L.pop[i])} pts`,
    trainer: doc.name, trainerSpr: doc.spr, intro: docLine(doc), lose: pick(["Good game!", "Well played!", "GG! I'll get you next time.", "Ugh, so close!"]), ball: TIER_BALL[t],
    onWin() {
      const d = ladderResult(i, true); S.stats.wins++; S.stats.versus++; S.daily.arena++; ladderOpps(true); noteLoss(i, ids);
      if (typeof contractDM === "function") contractDM(i, true);
      return { rewards: [{ k: "pts", n: d }, ...give({ tokens: 20 + tierIdx(L.pts) * 4 })] };
    },
    onLose() { const d = ladderResult(i, false); ladderOpps(true); if (typeof contractDM === "function") contractDM(i, false); return { rewards: [{ k: "pts", n: d }, ...give({ tokens: 5 })] }; },
    onQuit() { ladderResult(i, false); ladderOpps(true); save(); },
  });
}
let DRAFT = null;
function rtaFind() {
  if (Object.keys(S.ops).length < DRAFT_PICKS) { toast(`Catch at least ${DRAFT_PICKS} Pokémon first.`); return; }
  const opp = rtaOpponent(), t0 = Date.now(), wait = 1800 + Math.random() * 2600;
  openModal(`<div class="stack" style="align-items:center;text-align:center"><div class="eyebrow">Link Battles</div><h2 id="mmH">Searching for a Trainer…</h2>
    <div class="mmspin">${IC.pokeball}</div><p class="small dim num" id="mmT">0:00</p><p class="tiny dim">Your rating: ${tierOf(S.rta.pts).n} · ${S.rta.pts}</p>
    <button class="btn ghost wide" data-act="rtaCancel">Cancel</button></div>`);
  const tick = setInterval(() => {
    const el = $("#mmT"); if (!el) { clearInterval(tick); return; }
    el.textContent = dur(Date.now() - t0);
    if (Date.now() - t0 >= wait) {
      clearInterval(tick);
      $("#mmH").textContent = "Trainer found!";
      el.textContent = `${opp.name} · ${tierOf(opp.pts).n}`;
      sfx("special");
      setTimeout(() => { if ($("#mmH")) { closeModal(); draftStart(opp); } }, 900);
    }
  }, 200);
}
function draftStart(opp) {
  DRAFT = { opp, first: Math.random() < .5 ? 0 : 1, step: 0, picks: [[], []], ban: [null, null], phase: "pick", until: 0 };
  $("#draft").hidden = false;
  draftNext();
}
const draftWho = () => DRAFT.first === 0 ? DRAFT_ORDER[DRAFT.step] : 1 - DRAFT_ORDER[DRAFT.step];
const myProg = k => S.ops[k];
function draftNext() {
  const D = DRAFT; if (!D) return;
  clearTimeout(D.tm);
  if (D.phase === "pick" && D.step >= DRAFT_ORDER.length) { D.phase = "ban"; D.until = Date.now() + 20000; }
  if (D.phase === "pick") {
    D.until = Date.now() + (draftWho() === 0 ? 25000 : 99999);
    if (draftWho() === 1) {
      // the opponent thinks for a moment before each pick
      D.tm = setTimeout(() => {
        const avail = D.opp.roster.filter(k => !D.picks[1].includes(k));
        draftDo(1, draftPick(avail, k => D.opp.prog[k], D.picks[1], D.picks[0], D.opp.q, Math.random, D.opp.arch && D.opp.team));
      }, (700 + Math.random() * 1800 * (1.2 - D.opp.q)) / (DEMO_ON() ? 4 : 1));
    } else D.tm = setTimeout(() => draftAuto(), 25000);
  } else if (D.phase === "ban") {
    if (D.ban[1] == null) D.ban[1] = draftBan(D.picks[0], myProg, D.opp.q);
    D.tm = setTimeout(() => { if (DRAFT === D && D.ban[0] == null) draftBanDo(draftBan(D.picks[1], k => D.opp.prog[k], 1)); }, 20000);
  }
  draftRender();
}
function draftAuto() {
  const D = DRAFT; if (!D || D.phase !== "pick" || draftWho() !== 0) return;
  draftDo(0, draftPick(Object.keys(S.ops).filter(k => !D.picks[0].includes(k)), myProg, D.picks[0], D.picks[1], 1));
}
function draftDo(side, k) {
  const D = DRAFT; if (!D || D.phase !== "pick" || draftWho() !== side || !k || D.picks[side].includes(k)) return;
  const clash = pvpClash([...D.picks[side], k], pvpLimits("link")); if (clash) { if (side === 0) toast(pvpText(clash)); return; }   // (the PvP limits)
  D.picks[side].push(k); D.step++; sfx("tap"); cry(k, { vol: side === 0 ? .4 : .25 });
  draftNext();
}
function draftBanDo(k) {
  const D = DRAFT; if (!D || D.phase !== "ban" || D.ban[0] != null || !D.picks[1].includes(k)) return;
  D.ban[0] = k; D.phase = "lead"; D.lead = []; D.until = Date.now() + 20000; clearTimeout(D.tm); sfx("special");
  D.tm = setTimeout(() => draftLeadAuto(D), 20000);
  draftRender();
}
// then you choose your three leads from the six you have left (time's up: the best matchups against their six)
const draftMine = D => D.picks[0].filter(k => k !== D.ban[1]), draftTheirs = D => D.picks[1].filter(k => k !== D.ban[0]);
function draftLeadAuto(D) {
  if (DRAFT !== D || D.phase !== "lead") return;
  const best = leadOrder(draftMine(D).map(k => ({ op: k, prog: S.ops[k] })), draftTheirs(D).map(k => npcSpec(D.opp, k))).slice(0, ACTIVE).map(s => s.op);
  for (const k of best) if (D.lead.length < ACTIVE && !D.lead.includes(k)) D.lead.push(k);
  draftLeadDone(D);
}
function draftLeadDo(k) {
  const D = DRAFT; if (!D || D.phase !== "lead" || !draftMine(D).includes(k)) return;
  const i = D.lead.indexOf(k);
  if (i >= 0) D.lead.splice(i, 1); else D.lead.push(k);
  sfx("tap");
  if (D.lead.length >= ACTIVE) draftLeadDone(D); else draftRender();
}
function draftLeadDone(D) {
  D.phase = "done"; clearTimeout(D.tm); sfx("special");
  draftRender();
  D.tm = setTimeout(draftBattle, 2200 / (DEMO_ON() ? 4 : 1));
}
function draftBattle() {
  const D = DRAFT; if (!D) return;
  const left = draftMine(D), mine = [...D.lead, ...left.filter(k => !D.lead.includes(k))];
  const mySpecs = mine.map(k => ({ op: k, prog: S.ops[k] })), theirs = draftLeads(D.opp, draftTheirs(D), mySpecs);
  $("#draft").hidden = true; $("#draft").innerHTML = ""; DRAFT = null;
  S.stats.battles++; save();
  const t = tierIdx(D.opp.pts);
  startBattle({
    allies: mySpecs, waves: [theirs], env: "gym", enemyStyle: D.opp.ai, timer: 20, pvp: true, bgm: stadiumTheme(),
    title: D.opp.name, sub: `Link Battle · ${TIERS[t].n} · ${fmtFull(D.opp.pts)}`,
    trainer: D.opp.name, trainerSpr: D.opp.spr, intro: docLine(D.opp), lose: pick(["GG!", "Good game!", "Nice draft!", "You read my picks..."]), ball: TIER_BALL[t],
    onWin() {
      const d = rtaResult(D.opp, true); S.stats.wins++; S.stats.versus++; S.daily.arena++; noteLoss(D.opp.i, mine);
      if (typeof contractDM === "function" && D.opp.i != null) contractDM(D.opp.i, true, "rta");
      return { rewards: [{ k: "pts", n: d }, ...give({ tokens: 15 + tierIdx(S.rta.pts) * 3 })] };
    },
    onLose() { const d = rtaResult(D.opp, false); if (typeof contractDM === "function" && D.opp.i != null) contractDM(D.opp.i, false, "rta"); return { rewards: [{ k: "pts", n: d }] }; },
    onQuit() { rtaResult(D.opp, false); save(); },
    onClose() { UI.arenaTab = "rta"; rerender(); },
  });
}
function draftRender() {
  const D = DRAFT, root = $("#draft"); if (!D || !root) return;
  const me = draftWho() === 0 && D.phase === "pick", ot = tierOf(D.opp.pts);
  const phase = D.phase === "pick" ? (me ? `Your pick (${D.picks[0].length + 1}/${DRAFT_PICKS})` : `${esc(D.opp.name)} is picking…`) : D.phase === "ban" ? "Ban one of their Pokémon"
    : D.phase === "lead" ? `Choose your three leads (${D.lead.length}/${ACTIVE})` : "The battle is starting!";
  const slot = (k, side, i) => {
    const banned = k && D.ban[1 - side] === k, can = D.phase === "ban" && side === 1 && k, lead = D.phase === "lead" && side === 0 && k && !banned, li = lead ? D.lead.indexOf(k) : -1;
    const act = can ? `data-act="draftBan" data-k="${k}"` : lead ? `data-act="draftLead" data-k="${k}"` : "";
    return `<div class="dslot ${banned ? "banned" : ""} ${can || (lead && li < 0) ? "bannable" : ""} ${li >= 0 ? "dlead" : ""}" ${act} style="${k ? `--tc:${TC[OPS[k].types[0]]}` : ""}">${k ? `<img class="px dhead" src="${sprFront(k)}" alt="${esc(OPS[k].n)}"><span class="dsn">${esc(OPS[k].n)}</span>` : `<span class="tiny dim">${i + 1}</span>`}${banned ? '<span class="dban">BANNED</span>' : ""}${li >= 0 ? `<span class="dleadn">${li + 1}</span>` : ""}</div>`;
  };
  const pool = Object.keys(S.ops).sort((a, b) => power(b, S.ops[b]) - power(a, S.ops[a]));
  root.innerHTML = `<div class="drwrap">
    <div class="drtop"><div class="spread"><div><small>Link Battle · Draft</small><b>vs ${esc(D.opp.name)}</b></div><span class="row" style="gap:6px">${tierBadge(D.opp.pts, 26)}<span class="tiny" style="color:${ot.c};font-weight:800">${ot.n} · ${D.opp.pts}</span></span></div>
      <div class="drtimer"><i id="drBar"></i></div></div>
    <div class="drphase ${me || D.phase === "ban" ? "mine" : ""}">${phase}</div>
    <div class="drteams"><div><div class="tiny dim">You</div><div class="drslots">${[...Array(DRAFT_PICKS).keys()].map(i => slot(D.picks[0][i], 0, i)).join("")}</div></div>
      <div><div class="row tiny dim" style="gap:6px"><img class="px" src="${trainerURL(D.opp.spr)}" alt="" style="width:20px;height:20px;object-fit:contain">${esc(D.opp.name)}</div><div class="drslots">${[...Array(DRAFT_PICKS).keys()].map(i => slot(D.picks[1][i], 1, i)).join("")}</div></div></div>
    ${D.phase === "pick" ? `<div class="drroster">${pool.map(k => `<button class="rcell ${D.picks[0].includes(k) ? "sel" : ""}" data-act="draftPick" data-k="${k}" ${me && !D.picks[0].includes(k) ? "" : "disabled"}>${opHTML(k)}${pnameHTML(k)}<div class="pw">CP ${fmt(power(k, S.ops[k]))}</div></button>`).join("")}</div>`
      : `<p class="small dim" style="text-align:center;padding:10px">${D.phase === "ban" ? `Tap one of their ${DRAFT_PICKS} Pokémon. They're banning one of yours at the same time.`
        : D.phase === "lead" ? `They banned <b>${esc(OPS[D.ban[1]].n)}</b>. Tap three of your Pokémon to lead: they go out first, the other three wait on the bench.`
        : `You banned <b>${esc(OPS[D.ban[0]].n)}</b>. They banned <b>${esc(OPS[D.ban[1]].n)}</b>.`}</p>`}
  </div>`;
  const bar = () => { const b = $("#drBar"); if (!b || DRAFT !== D) return; const tot = D.phase === "pick" ? 25000 : 20000; b.style.width = clamp((D.until - Date.now()) / tot, 0, 1) * 100 + "%"; requestAnimationFrame(bar); };
  bar();
}

const STADIUM_ACT = {
  arenaTab: d => { UI.arenaTab = d.t; rerender(); },
  ladderGo: d => {
    const i = +d.i, doc = modeDoc(ladderDoc(i), "ranked");
    if (S.ladder.tickets <= 0) { toast("No Tickets left. One refills every 30 minutes."); return; }
    teamScreen("arena", `Ranked Battle · ${doc.name}`, 0, doc.team.map(k => npcSpec(doc, k)), ["arena", null], { kind: "ladder", i });
  },
  ladderRefresh: () => { if (Date.now() - S.ladder.oppT < REFRESH_MS) return; ladderOpps(true); sfx("tap"); rerender(); },
  ladderRevenge: d => {
    const x = S.ladder.log.find(e => e.t === +d.t && e.i === +d.i); if (!x || x.held || x.rev) return;
    x.rev = 1; closeModal();
    const doc = modeDoc(ladderDoc(x.i), "ranked");
    teamScreen("arena", `Rematch · ${doc.name}`, 0, doc.team.map(k => npcSpec(doc, k)), ["arena", null], { kind: "ladder", i: x.i, rev: 1 });
  },
  defense: () => teamScreen("defense", "Registered Team", 0, [], ["arena", null], { kind: "defense" }),
  rankings: d => rankingsModal(d.t),
  defLog: () => { defLogModal(); rerender(); },
  rtaFind: () => rtaFind(),
  rtaCancel: () => closeModal(),
  draftPick: d => draftDo(0, d.k),
  draftBan: d => draftBanDo(d.k),
  draftLead: d => draftLeadDo(d.k),
};
