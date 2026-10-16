// =====================================================================
//  PASSES — missions, the Trainer Pass (battle pass), event passes, the Poké Pass (monthly card), the Growth Fund,
//  Professor Oak's Investment Plan and the Monthly Check-In
// =====================================================================
// One action counts everywhere (live() in a6j_live.js): the same battle advances a daily mission, a weekly one and the
// season's, and every mission you claim gives Pass XP to every pass that's running.

// ---------- what you did today, this week, this month ----------
const PERIOD = () => { const now = Date.now(), d = Math.floor(now / 864e5) * 864e5; return { d: "d" + d, w: "w" + weekStart(now), m: "m" + new Date(now).toISOString().slice(0, 7) }; };
function passCount(kind, n) {
  if (!S || !S.pass) return;
  const c = S.pass.cnt, P = PERIOD();
  for (const k of [P.d, P.w, P.m]) { const o = (c[k] = c[k] || {}); o[kind] = (o[kind] || 0) + n; }
  for (const k of Object.keys(c)) if (![P.d, P.w, P.m].includes(k) && Object.keys(c).length > 6) delete c[k];
}
const doneIn = (per, kind) => ((S.pass.cnt[PERIOD()[per]] || {})[kind]) || 0;
// missions: [kind, goal, text, Pass XP]
const MISSIONS = {
  d: [["pp", 300, "Spend 300 PP", 100], ["win", 10, "Win 10 battles", 100], ["throw", 10, "Throw 10 times in the Safari Zone", 80], ["ranked", 3, "Win 3 Ranked Battles", 80], ["recharge", 1, "Recharge once", 60]],
  w: [["win", 60, "Win 60 battles", 300], ["catch", 5, "Add 5 Pokémon to your Pokédex", 300], ["mastery", 15, "Raise Mastery 15 times", 300], ["gems", 5000, "Spend 5,000 Gems", 300], ["raid", 50000, "Deal 50,000 Raid Battle damage", 300]],
  m: [["throw", 150, "Throw 150 times in the Safari Zone", 1000], ["ranked", 60, "Win 60 Ranked Battles", 1000], ["gems", 50000, "Spend 50,000 Gems", 1000], ["evolve", 10, "Evolve 10 Pokémon", 800]],
};
const MISSION_NAME = { d: "Daily", w: "Weekly", m: "Season" };
const missionId = (per, j) => PERIOD()[per] + ":" + j;
const missionReady = (per, j) => { const [k, g] = MISSIONS[per][j]; return doneIn(per, k) >= g && !S.pass.mgot.includes(missionId(per, j)); };

// ---------- the passes ----------
const PASS_XP = 400;
const season = () => new Date().toISOString().slice(0, 7);
const seasonEnd = () => { const d = new Date(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1); };
// the Trainer Pass: 30 levels a month (UTC). Free for everyone, Premium 1,980 Gems (its row pays double), Premium+ 3,980
// (10 levels at once, and its own row pays triple)
const TP_FREE = j => j % 5 === 4 ? { permit: 1 } : j % 2 ? { rec2: 3 } : { orundum: 60 };
const TP_PREM = j => j === 9 ? { uball: 6 } : j === 19 ? { bottlecap: 2 } : j === 29 ? { goldbottlecap: 2 } : j % 3 === 2 ? { gball: 4 } : j % 2 ? { rare: 6 } : { orundum: 300 };
const TP_PLUS = j => j === 29 ? { gold5: 3 } : j % 10 === 4 ? { free10: 3 } : null;
// the event pass: the Mewtwo Research Pass, the 15th to the 28th of each month; 20 levels, Mewtwo at the end of Premium
const EP_NAME = "Mewtwo Research Pass";
const epOn = () => { const d = new Date().getUTCDate(); return d >= 15 && d <= 28; };
const epId = () => season() + ":ep";
const epEnd = () => { const d = new Date(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 29); };
const EP_FREE = j => j % 4 === 3 ? { uball: 1 } : { orundum: 80 };
const EP_PREM = j => j === 19 ? { op: "mewtwo" } : j % 5 === 4 ? { uball: 3 } : j % 2 ? { rare: 4 } : { orundum: 200 };
const passInit = () => ({ cnt: {}, mgot: [], season: "", xp: 0, prem: 0, got: { f: [], p: [], x: [] }, ep: { id: "", xp: 0, prem: 0, got: { f: [], p: [] } },
  poke: { from: 0, until: 0, got: 0 }, fund: { bought: false, got: [] }, invest: { at: 0, got: 0 }, checkin: { month: "", got: [] } });
// a new month starts a new season (unclaimed rewards of the last one go by Mail)
function passTick() {
  const P = S.pass;
  if (P.season !== season()) {
    if (P.season) { const owed = {}; tpLevels().forEach(j => { if (!P.got.f.includes(j)) mergeRw(owed, TP_FREE(j)); if (P.prem && !P.got.p.includes(j)) mergeRw(owed, TP_PREM(j)); if (P.prem > 1 && TP_PLUS(j) && !P.got.x.includes(j)) mergeRw(owed, TP_PLUS(j)); }); if (Object.keys(owed).length) sendMail({ from: "Event Center", tag: "gift", title: "Trainer Pass: last season's rewards", body: "Rewards you reached but hadn't claimed in last month's Trainer Pass.", rewards: owed }); }
    Object.assign(P, { season: season(), xp: 0, prem: 0, got: { f: [], p: [], x: [] } });
  }
  if (epOn() && P.ep.id !== epId()) P.ep = { id: epId(), xp: 0, prem: 0, got: { f: [], p: [] } };
  // a Poké Pass bought before missed days could be collected: its days so far count as collected
  if (P.poke.got == null) { const from = P.poke.until ? dayStart(P.poke.until - POKE_PASS.days * DAY) : 0; P.poke = { from, until: P.poke.until || 0, got: !from ? 0 : P.poke.until <= Date.now() ? POKE_PASS.days : pokeDays(from) - (P.poke.day === today() ? 0 : 1) }; }
}
// every reward reached and not yet claimed, on every row this player has
const tpDue = () => { const P = S.pass, out = []; for (let j = 0; j < tpLevel(); j++) { if (!P.got.f.includes(j)) out.push(["f", j]); if (P.prem && !P.got.p.includes(j)) out.push(["p", j]); if (P.prem > 1 && TP_PLUS(j) && !P.got.x.includes(j)) out.push(["x", j]); } return out; };
const epDue = () => { const E = S.pass.ep, out = []; if (!epOn()) return out; for (let j = 0; j < epLevel(); j++) { if (!E.got.f.includes(j)) out.push(["f", j]); if (E.prem && !E.got.p.includes(j)) out.push(["p", j]); } return out; };
const mergeRw = (o, rw) => { for (const [k, n] of Object.entries(rw)) o[k] = k === "op" || k === "held" ? n : (o[k] || 0) + n; return o; };
const tpLevel = () => Math.min(30, Math.floor(S.pass.xp / PASS_XP) + (S.pass.prem > 1 ? 10 : 0));
const tpLevels = () => Array.from({ length: tpLevel() }, (_, j) => j);
const epLevel = () => Math.min(20, Math.floor(S.pass.ep.xp / PASS_XP));

// ---------- the Poké Pass, the Growth Fund, the Investment Plan, the Check-In ----------
// the Poké Pass: Gems at once and every day for 30 days; a day you miss can be collected later
const POKE_PASS = { cost: 1980, now: 980, daily: 180, days: 30 };
const pokeDays = from => Math.min(POKE_PASS.days, Math.floor((dayStart(Date.now()) - from) / DAY) + 1);   // (its days so far)
const pokeOwed = () => { const P = S.pass.poke; return P.from ? Math.max(0, pokeDays(P.from) - P.got) : 0; };
// the Growth Fund: Gems back every 5 Trainer Levels, from Lv 5 to Lv 100
const FUND = { cost: 1000, at: [100, 150, 200, 300, 400, 500, 700, 900, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000, 10000].map((g, j) => [5 + j * 5, g]) };
// Professor Oak's Investment Plan: in your first 7 days on the server, Gems now for a Safari Pass and Rare Candies at once,
// then 1,000 Gems on each of 7 days (the first straight away)
const INVEST = { cost: 5000, now: { free10: 1, rare: 10 }, back: 1000, days: 7 };
const investOn = () => !!S && Date.now() - (S.created || 0) < 7 * DAY;
// the Monthly Check-In follows the calendar: a reward for every day of the month, and any day so far can still be claimed
// (the month's last day holds the Master Ball)
const monthDays = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); };
const CHECKIN = (j, n = monthDays()) => j === n - 1 ? { gold5: 1 } : j % 7 === 6 ? { free10: 1 } : j % 3 === 2 ? { uball: 1 } : j % 2 ? { rec3: 2 } : { orundum: 100 };
const checkinGot = () => S.pass.checkin.month === season() ? S.pass.checkin.got : [];
const checkinDue = () => Array.from({ length: new Date().getUTCDate() }, (_, j) => j).filter(j => !checkinGot().includes(j));

// ---------- the Passes tab (Event Center) ----------
function passesHTML() {
  passTick();
  const P = S.pass, now = Date.now(), lv = tpLevel(), dayN = new Date().getUTCDate() - 1, mon = season(), due = checkinDue(), monN = new Date().toLocaleString("en", { month: "long", timeZone: "UTC" });
  const mrow = (per, j) => { const [k, g, t, xp] = MISSIONS[per][j], n = Math.min(g, doneIn(per, k)), got = P.mgot.includes(missionId(per, j));
    return `<div class="lgoal"><div><b>${esc(t)}</b><div class="tiny dim">${fmtFull(n)}/${fmtFull(g)} · ${xp} Pass XP</div></div>${got ? '<span class="tiny dim">Done</span>' : n >= g ? `<button class="btn sm" data-act="mClaim" data-per="${per}" data-j="${j}">Claim</button>` : ""}</div>`; };
  const track = (n, levels, at, f, p, x, got, prem, act) => `<div class="passrow">${Array.from({ length: levels }, (_, j) => `<div class="pcell${j < at ? " on" : ""}"><b>${j + 1}</b>
      <button class="pr" data-act="${act}" data-t="f" data-j="${j}" ${j < at && !got.f.includes(j) ? "" : "disabled"}>${rewardText(f(j))}</button>
      <button class="pr prem" data-act="${act}" data-t="p" data-j="${j}" ${prem && j < at && !got.p.includes(j) ? "" : "disabled"}>${rewardText(p(j))}</button>
      ${x && x(j) ? `<button class="pr plus" data-act="${act}" data-t="x" data-j="${j}" ${prem > 1 && j < at && !got.x.includes(j) ? "" : "disabled"}>${rewardText(x(j))}</button>` : ""}</div>`).join("")}</div>`;
  return `<section class="panel stack" style="gap:6px"><h3>Missions</h3><p class="tiny dim">Each claimed mission gives Pass XP to every pass running. Daily ones reset at 00:00 UTC, weekly ones on Monday, season ones each month.</p>
      ${["d", "w", "m"].map(per => `<div class="eyebrow">${MISSION_NAME[per]}</div>${MISSIONS[per].map((_, j) => mrow(per, j)).join("")}`).join("")}</section>
    <section class="panel stack" style="gap:6px"><div class="spread"><h3>Trainer Pass · ${mon}</h3><span class="tiny dim">Ends in ${dur(seasonEnd() - now)}</span></div>
      ${tpDue().length ? `<button class="btn sm" data-act="tpAll">Collect all (${tpDue().length})</button>` : ""}
      <div class="tiny dim">Level ${lv}/30 · ${fmtFull(P.xp % PASS_XP)}/${PASS_XP} XP to the next. Free track for everyone; Premium adds the second row, at double rewards; Premium+ adds 10 levels at once and the third row, at triple rewards.</div>
      ${P.prem < 1 ? `<div class="row" style="gap:6px"><button class="btn sm" data-act="tpBuy" data-v="1" ${S.orundum >= 1980 ? "" : "disabled"}>Premium ${IC.orundum}1,980</button><button class="btn sm" data-act="tpBuy" data-v="2" ${S.orundum >= 3980 ? "" : "disabled"}>Premium+ ${IC.orundum}3,980</button></div>` : P.prem < 2 ? `<button class="btn sm" data-act="tpBuy" data-v="2" ${S.orundum >= 2000 ? "" : "disabled"}>Upgrade to Premium+ ${IC.orundum}2,000</button>` : ""}
      ${track("tp", 30, lv, TP_FREE, TP_PREM, TP_PLUS, P.got, P.prem, "tpClaim")}</section>
    ${epOn() ? `<section class="panel stack" style="gap:6px"><div class="spread"><h3>${EP_NAME}</h3><span class="tiny dim">Ends in ${dur(epEnd() - now)}</span></div>
      <div class="tiny dim">An event pass: the same missions fill it. Level ${epLevel()}/20. Premium (1,980 Gems) ends with Mewtwo.</div>
      ${P.ep.prem ? "" : `<button class="btn sm" data-act="epBuy" ${S.orundum >= 1980 ? "" : "disabled"}>Premium ${IC.orundum}1,980</button>`}
      ${epDue().length ? `<button class="btn sm" data-act="epAll">Collect all (${epDue().length})</button>` : ""}
      ${track("ep", 20, epLevel(), EP_FREE, EP_PREM, null, P.ep.got, P.ep.prem, "epClaim")}</section>` : `<p class="tiny dim">The ${EP_NAME} runs from the 15th to the 28th of each month.</p>`}
    ${featOn("offers") ? `<section class="panel stack" style="gap:6px"><h3>Poké Pass</h3>
      <div class="tiny dim">A monthly card: ${fmtFull(POKE_PASS.now)} Gems at once and ${POKE_PASS.daily} Gems for each of ${POKE_PASS.days} days (${fmtFull(POKE_PASS.now + POKE_PASS.daily * POKE_PASS.days)} in all) for ${fmtFull(POKE_PASS.cost)} Gems. Missed a day? Its Gems wait for you.</div>
      ${pokeOwed() ? `<button class="btn sm" data-act="pokeDay">Claim ${fmtFull(pokeOwed() * POKE_PASS.daily)} Gems (${pokeOwed()} day${pokeOwed() > 1 ? "s" : ""})</button>` : ""}
      ${P.poke.until > now ? `<span class="tiny dim">${pokeDays(P.poke.from)}/${POKE_PASS.days} days · ${Math.ceil((P.poke.until - now) / DAY)} left</span>` : `<button class="btn sm" data-act="pokeBuy" ${S.orundum >= POKE_PASS.cost ? "" : "disabled"}>Buy ${IC.orundum}${fmtFull(POKE_PASS.cost)}</button>`}</section>
    <section class="panel stack" style="gap:6px"><h3>Growth Fund</h3>
      <div class="tiny dim">Buy once for ${fmtFull(FUND.cost)} Gems; Gems come back as your Trainer Level grows: ${FUND.at.map(([l, g]) => `Lv ${l}: ${fmtFull(g)}`).join(" · ")}.</div>
      ${P.fund.bought ? `<div class="tiny">${P.fund.got.length}/${FUND.at.length} received</div>` + FUND.at.map(([l, g], j) => P.fund.got.includes(j) ? "" : `<div class="lgoal"><span class="tiny">Trainer Level ${l}: ${fmtFull(g)} Gems</span>${S.lvl >= l ? `<button class="btn sm" data-act="fundClaim" data-j="${j}">Claim</button>` : `<span class="tiny dim">Lv ${S.lvl}/${l}</span>`}</div>`).join("") : `<button class="btn sm" data-act="fundBuy" ${S.orundum >= FUND.cost ? "" : "disabled"}>Buy ${IC.orundum}${fmtFull(FUND.cost)} (${fmtFull(FUND.at.reduce((a, x) => a + x[1], 0))} Gems back in all)</button>`}</section>
    ${investOn() || P.invest.at ? `<section class="panel stack" style="gap:6px"><h3>${esc(profFull())}'s Investment Plan</h3>
      <div class="tiny dim">For your first 7 days on the server (${P.invest.at ? "invested" : dur(S.created + 7 * DAY - now) + " left"}): pay ${fmtFull(INVEST.cost)} Gems, get ${rewardText(INVEST.now)} at once, then ${fmtFull(INVEST.back)} Gems on each of ${INVEST.days} days, starting today (by Mail).</div>
      ${P.invest.at ? `<div class="tiny">${P.invest.got}/${INVEST.days} paid so far.</div>` : `<button class="btn sm" data-act="investBuy" ${S.orundum >= INVEST.cost ? "" : "disabled"}>Invest ${IC.orundum}${fmtFull(INVEST.cost)}</button>`}</section>` : ""}` : ""}
    <section class="panel stack" style="gap:6px"><div class="spread"><h3>Monthly Check-In · ${monN}</h3>${due.length ? `<button class="btn sm" data-act="checkinAll">Claim ${due.length > 1 ? "all " + due.length : "today's"}</button>` : ""}</div>
      <div class="tiny dim">A reward for every day of the month. Missed a day? Any day so far this month can still be claimed.</div>
      <div class="ldays ck">${Array.from({ length: monthDays() }, (_, j) => { const got = checkinGot().includes(j), ready = !got && j <= dayN; return `<button class="lday${got ? " got" : ""}${ready ? " ready" : ""}" ${ready ? `data-act="checkin" data-j="${j}"` : "disabled"}><b>${j + 1}</b><span class="tiny">${rewardText(CHECKIN(j))}</span></button>`; }).join("")}</div></section>`;
}
const PASS_ACT = {
  mClaim: d => { const per = d.per, j = +d.j; if (!missionReady(per, j)) return; S.pass.mgot.push(missionId(per, j)); S.pass.mgot = S.pass.mgot.slice(-80);
    const xp = MISSIONS[per][j][3]; S.pass.xp += xp; if (epOn()) S.pass.ep.xp += xp; live("passXp", xp); save(); sfx("heal"); toast(`+${xp} Pass XP`, "gold"); rerender(); },
  tpBuy: d => { const v = +d.v, P = S.pass, cost = v === 2 ? (P.prem === 1 ? 2000 : 3980) : 1980; if (P.prem >= v || S.orundum < cost) return; gemsOut(cost, "Pass"); P.prem = v; save(); sfx("win"); rerender(); },
  tpClaim: d => { const P = S.pass, j = +d.j, t = d.t, rw = t === "f" ? TP_FREE(j) : t === "p" ? TP_PREM(j) : TP_PLUS(j);
    if (j >= tpLevel() || P.got[t].includes(j) || (t === "p" && !P.prem) || (t === "x" && P.prem < 2) || !rw) return;
    P.got[t].push(j); if (t === "x" && j === 29) { S.titles = [...new Set([...(S.titles || []), `Trainer Pass ${P.season} Champion`])]; }
    const list = give(rw); save(); sfx("heal"); rerender(); rewardModal(`Trainer Pass · level ${j + 1}`, list); },
  tpAll: () => { const P = S.pass, due = tpDue(); if (!due.length) return; const all = {};
    for (const [t, j] of due) { const rw = t === "f" ? TP_FREE(j) : t === "p" ? TP_PREM(j) : TP_PLUS(j); if (!rw) continue; P.got[t].push(j); mergeRw(all, rw);
      if (t === "x" && j === 29) S.titles = [...new Set([...(S.titles || []), `Trainer Pass ${P.season} Champion`])]; }
    const list = give(all); save(); sfx("heal"); rerender(); rewardModal(`Trainer Pass · ${due.length} rewards`, list); },
  epAll: () => { const E = S.pass.ep, due = epDue(); if (!due.length) return; const all = {};
    for (const [t, j] of due) { E.got[t].push(j); mergeRw(all, t === "f" ? EP_FREE(j) : EP_PREM(j)); }
    const list = give(all); save(); sfx("heal"); rerender(); rewardModal(`${EP_NAME} · ${due.length} rewards`, list); },
  epBuy: () => { const P = S.pass; if (P.ep.prem || S.orundum < 1980 || !epOn()) return; gemsOut(1980, "Pass"); P.ep.prem = 1; save(); sfx("win"); rerender(); },
  epClaim: d => { const E = S.pass.ep, j = +d.j, t = d.t; if (!epOn() || j >= epLevel() || E.got[t].includes(j) || (t === "p" && !E.prem)) return;
    E.got[t].push(j); const list = give(t === "f" ? EP_FREE(j) : EP_PREM(j)); save(); sfx("heal"); rerender(); rewardModal(`${EP_NAME} · level ${j + 1}`, list); },
  pokeBuy: () => { const P = S.pass; if (P.poke.until > Date.now() || S.orundum < POKE_PASS.cost) return;
    if (pokeOwed()) PASS_ACT.pokeDay();   // (the last pass's days first)
    gemsOut(POKE_PASS.cost, "Pass"); P.poke = { from: dayStart(Date.now()), until: Date.now() + POKE_PASS.days * DAY, got: 1 }; gemsIn(POKE_PASS.now + POKE_PASS.daily, "bonus"); save(); sfx("win"); rerender(); toast(`Poké Pass: +${POKE_PASS.now + POKE_PASS.daily} Gems`, "gold"); },
  pokeDay: () => { const P = S.pass, n = pokeOwed(); if (!n) return; P.poke.got += n; gemsIn(n * POKE_PASS.daily, "bonus"); save(); sfx("heal"); rerender(); toast(`Poké Pass: +${fmtFull(n * POKE_PASS.daily)} Gems`, "gold"); },
  fundBuy: () => { const F = S.pass.fund; if (F.bought || S.orundum < FUND.cost) return; gemsOut(FUND.cost, "Fund"); F.bought = true; save(); sfx("win"); rerender(); },
  fundClaim: d => { const F = S.pass.fund, j = +d.j; if (!F.bought || F.got.includes(j) || S.lvl < FUND.at[j][0]) return; F.got.push(j); gemsIn(FUND.at[j][1], "bonus"); save(); sfx("win"); rerender(); toast(`Growth Fund: +${fmtFull(FUND.at[j][1])} Gems`, "gold"); },
  investBuy: () => { const I = S.pass.invest; if (I.at || !investOn() || S.orundum < INVEST.cost) return; gemsOut(INVEST.cost, "Investment"); I.at = Date.now(); const list = give(INVEST.now); investTick(); save(); sfx("win"); rerender(); rewardModal("Investment Plan", list, `${fmtFull(INVEST.back)} Gems on each of ${INVEST.days} days, starting today (by Mail)`); },
  checkin: d => { const C = S.pass.checkin, mon = season(), j = d.j != null ? +d.j : new Date().getUTCDate() - 1; if (C.month !== mon) { C.month = mon; C.got = []; } if (C.got.includes(j) || j >= new Date().getUTCDate()) return; C.got.push(j); const list = give(CHECKIN(j)); save(); sfx("heal"); rerender(); rewardModal(`Check-In · day ${j + 1}`, list); },
  checkinAll: () => { const C = S.pass.checkin, mon = season(), due = checkinDue(); if (!due.length) return; if (C.month !== mon) { C.month = mon; C.got = []; } let list = []; for (const j of due) { C.got.push(j); list = list.concat(give(CHECKIN(j))); } save(); sfx("win"); rerender(); rewardModal(`Check-In · ${due.length} day${due.length > 1 ? "s" : ""}`, list); },
};
// the Investment Plan pays once a day, the first straight away (from liveTick)
function investTick() {
  const I = S.pass.invest; if (!I.at || I.got >= INVEST.days) return;
  const due = Math.min(INVEST.days, Math.floor((Date.now() - I.at) / DAY) + 1);
  while (I.got < due) { I.got++; sendMail({ from: profName(), tag: "gift", title: `Investment Plan · day ${I.got} of ${INVEST.days}`, body: "Here's your return on the Investment Plan.", rewards: { orundum: INVEST.back } }); }
}
const passReady = () => !!S && !!S.pass && (["d", "w", "m"].some(per => MISSIONS[per].some((_, j) => missionReady(per, j))) || (featOn("offers") && pokeOwed() > 0) || checkinDue().length > 0);
