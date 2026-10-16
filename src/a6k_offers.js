// =====================================================================
//  OFFERS — packages and promotions, bought with Gems (a Recharge stands in for buying Gems: there is no real money)
// =====================================================================
// Every offer says what's in it, roughly what that's worth in Gems, what it costs, and exactly when it ends (or how many
// are left on the server). They come from what you do: Trainer Level, Ranked tiers, Gym Badges and bosses, Team Power, VIP,
// your first day and week, how long you've played, coming back after a break, being nearly there (IVs, pity), plus flash
// sales, daily and weekly deals, server-wide limited stock (the server's Trainers buy it too) and an escalating bundle chain.

// what things are worth in Gems (for the "worth about" line)
const GEM_VALUE = { orundum: 1, permit: 600, gball: 600, uball: 600, mticket: 600, free10: 6000, gold5: 15000, rare: 150, rec1: 20, rec2: 60, rec3: 200, rec4: 600,
  summ: 100, prime: 300, tokens: 3, cert: 20, lmd: .02, bottlecap: 1500, goldbottlecap: 6000, abilitycapsule: 1000, abilitypatch: 3000 };
function worth(rw) {
  let v = 0;
  for (const [k, n] of Object.entries(rw)) {
    if (k === "op") { const o = OPS[n]; v += o.leg ? 20000 : [0, 0, 0, 1000, 4000, 12000][o.rar]; }
    else if (k === "held") for (const h of [].concat(n)) v += [0, 300, 800, 2000][HELD[h].t] || 500;
    else if (GEM_VALUE[k] != null) v += GEM_VALUE[k] * n;
    else if (/^mint_/.test(k)) v += 500 * n; else if (/stone$/.test(k)) v += 300 * n; else v += 100 * n;
  }
  return Math.round(v);
}
const offersInit = () => ({ unlocked: {}, bought: {}, popped: {}, last: Date.now(), boost: {} });
const OH = 36e5, OD = 864e5;   // (an hour, a day)

// ---------- the offers ----------
const LEVEL_PACKS = [[10, 300, { orundum: 500, rec2: 10, permit: 3 }], [20, 680, { orundum: 1200, rec3: 8, op: "pikachu" }], [30, 1280, { orundum: 2500, uball: 2, rare: 10 }],
  [40, 1980, { orundum: 4000, uball: 4, bottlecap: 1 }], [50, 3280, { orundum: 6000, free10: 1, goldbottlecap: 1 }], [60, 6480, { orundum: 12000, gold5: 1, free10: 1 }]];
const TIER_PACKS = { 2: [980, { gball: 6, tokens: 300 }], 3: [1980, { uball: 3, held: "lifeorb", tokens: 500 }], 4: [3280, { gold5: 1, tokens: 800 }],
  5: [3280, { free10: 1, bottlecap: 2 }], 6: [6480, { gold5: 1, goldbottlecap: 1 }], 7: [6480, { free10: 2, goldbottlecap: 1, held: "choicescarf" }] };
const BADGE_PACKS = { 2: ["Cascade Pack", 480, { orundum: 800, rec2: 10, waterstone: 1 }], 4: ["Rainbow Pack", 980, { orundum: 1500, rec3: 6, leafstone: 1, permit: 2 }],
  6: ["Volcano Pack", 1980, { orundum: 3000, firestone: 1, uball: 2 }], 8: ["Team Rocket Conqueror Pack", 3280, { orundum: 6000, uball: 3, held: "choiceband" }] };
const POWER_PACKS = [[5000, 680, { rec3: 10, orundum: 1000 }], [15000, 1280, { rare: 15, uball: 1 }], [30000, 1980, { bottlecap: 2, orundum: 2500 }], [60000, 3280, { goldbottlecap: 1, free10: 1 }]];
const VIP_PACKS = { 1: [300, { orundum: 600, permit: 2 }], 3: [980, { uball: 3, rare: 10 }], 5: [1980, { free10: 1, bottlecap: 1 }], 8: [3280, { gold5: 1, goldbottlecap: 1 }], 10: [6480, { gold5: 2, free10: 2 }] };
const WEEK_DEALS = [["Safari Ball Monday", 1500, { permit: 5 }], ["Exp. Candy Tuesday", 900, { rec3: 10 }], ["Evolution Wednesday", 900, { firestone: 1, waterstone: 1, thunderstone: 1, leafstone: 1, moonstone: 1 }],
  ["Held Item Thursday", 1200, { held: ["leftovers", "sitrusberry"] }], ["Legendary Ticket Friday", 1500, { uball: 4 }], ["Mint Saturday", 900, { mint_adamant: 1, mint_modest: 1 }], ["Rare Candy Sunday", 900, { rare: 12 }]];
const SEVEN_DAY = [["Day 1 Starter Pack", 120, { orundum: 300, permit: 3, rec2: 5 }], ["Day 2 Level Pack", 480, { rec3: 10, rare: 5 }], ["Day 3 Safari Pack", 980, { free10: 1 }],
  ["Day 4 Evolution Pack", 680, { firestone: 1, waterstone: 1, thunderstone: 1, leafstone: 1, rare: 5 }], ["Day 5 Power Pack", 1280, { bottlecap: 1, held: "expertbelt" }],
  ["Day 6 Ranked Pack", 980, { tokens: 800, gball: 4 }], ["Day 7 Champion Pack", 1980, { uball: 4, goldbottlecap: 1 }]];
const CHAIN = [[60, { permit: 1, rec2: 5 }], [300, { permit: 2, rare: 3 }], [980, { gball: 5, rec3: 5 }], [1980, { uball: 3, bottlecap: 1 }], [3280, { free10: 1, rare: 10 }], [6480, { gold5: 1, goldbottlecap: 1 }]];
const FLASH = [["Safari Ball Flash Sale", { permit: 10 }], ["Candy Flash Sale", { rec4: 6, rare: 10 }], ["Ticket Flash Sale", { uball: 5 }], ["IV Flash Sale", { bottlecap: 2 }], ["Safari Pass Flash Sale", { free10: 1 }]];
const LIMITED = { n: "Legendary Starter Pack", cost: 3280, give: { uball: 6, gold5: 1 }, stock: 100 };   // a week's server-wide stock

// everything on offer now: [{ id, n, d, cost, give, until, tag, cat, left }]
function offersNow() {
  if (!S || !S.offers) return [];
  const O = S.offers, now = Date.now(), out = [], bought = id => O.bought[id] || 0;
  const add = (id, n, cost, give, x = {}) => { if (bought(id) < (x.limit || 1) && !(x.until && x.until <= now)) out.push({ id, n, cost, give, ...x }); };
  const unlockedFor = (id, hours) => { const t = O.unlocked[id]; return t && now < t + hours * OH ? t + hours * OH : null; };
  // milestones you reached: each pack stays 72 hours from when it unlocked (VIP packs stay)
  for (const [lv, cost, give] of LEVEL_PACKS) { const u = unlockedFor("lv" + lv, 72); if (u) add("lv" + lv, `Trainer Level ${lv} Pack`, cost, give, { until: u, tag: "LEVEL", cat: "For you" }); }
  for (const t in TIER_PACKS) { const u = unlockedFor("tier" + t, 72); if (u) add("tier" + t, `${TIERS[t].n} Trainer Pack`, TIER_PACKS[t][0], TIER_PACKS[t][1], { until: u, tag: "RANKED", cat: "For you" }); }
  for (const b in BADGE_PACKS) { const u = unlockedFor("badge" + b, 72); if (u) add("badge" + b, BADGE_PACKS[b][0], BADGE_PACKS[b][1], BADGE_PACKS[b][2], { until: u, tag: "JOURNEY", cat: "For you" }); }
  { const u = unlockedFor("mewtwo", 48); if (u) add("mewtwo", "Mewtwo Conqueror Pack", 6480, { goldbottlecap: 1, uball: 6, held: "lifeorb" }, { until: u, tag: "BOSS", cat: "For you" }); }
  for (const [pw, cost, give] of POWER_PACKS) { const u = unlockedFor("pow" + pw, 72); if (u) add("pow" + pw, `${fmtFull(pw)} Team Power Pack`, cost, give, { until: u, tag: "POWER", cat: "For you" }); }
  for (const v in VIP_PACKS) if (vip() >= +v) add("vip" + v, `VIP ${v} Pack`, VIP_PACKS[v][0], VIP_PACKS[v][1], { tag: "VIP " + v, cat: "VIP" });
  // your first day and week, your account's age, coming back, nearly there
  const age = now - (S.created || now);
  if (age < 24 * OH) { const u = S.created + 24 * OH; add("first24a", "First-Day Starter Pack", 60, { orundum: 200, permit: 2 }, { until: u, tag: "24 HOURS", cat: "New Trainer" }); add("first24b", "First-Day Growth Pack", 480, { rec3: 8, rare: 8 }, { until: u, tag: "24 HOURS", cat: "New Trainer" }); add("first24c", "First-Day Safari Pack", 980, { free10: 1, gball: 2 }, { until: u, tag: "24 HOURS", cat: "New Trainer" }); }
  const day = Math.floor(age / OD);
  if (day < 7) { const [n, cost, give] = SEVEN_DAY[day]; add("week" + day, n, cost, give, { until: S.created + (day + 1) * OD, tag: "DAY " + (day + 1), cat: "New Trainer" }); }
  for (const a of [3, 14, 30, 60, 90]) { const u = unlockedFor("age" + a, 48); if (u) add("age" + a, `${a}-Day Trainer Pack`, a >= 30 ? 1980 : 980, a >= 30 ? { free10: 1, bottlecap: 1 } : { uball: 3, rare: 8 }, { until: u, tag: "THANK YOU", cat: "For you" }); }
  { const u = unlockedFor("comeback", 72); if (u) add("comeback", "Welcome Back Pack", 480, { orundum: 1500, rec4: 4, permit: 5 }, { until: u, tag: "WELCOME BACK", cat: "For you" }); }
  { const u = unlockedFor("almostIV", 24); if (u) add("almostIV", "Perfect IVs Pack", 900, { bottlecap: 1, orundum: 300 }, { until: u, tag: "ALMOST THERE", cat: "For you" }); }
  { const u = unlockedFor("almostPity", 6); if (u) add("almostPity", "Lucky Throw Pack", 1800, { permit: 5 }, { until: u, tag: "ALMOST THERE", cat: "For you" }); }
  // the shop's own rhythm: today's deal, this week's deal, flash sales, the server-wide limited pack, the bundle chain
  const d0 = Math.floor(now / OD) * OD, wd = (new Date(d0).getUTCDay() + 6) % 7, [dn, dc, dg] = WEEK_DEALS[wd];
  add("daily" + d0, `Daily Deal: ${dn}`, dc, dg, { until: d0 + OD, tag: "TODAY", cat: "Deals" });
  const w0 = weekStart(now); add("weekly" + w0, "Weekly Deal: Trainer Supply Crate", 2980, { uball: 4, gball: 4, rare: 10, bottlecap: 1 }, { until: w0 + 7 * OD, tag: "THIS WEEK", cat: "Deals" });
  for (const f of flashSales(now)) add(f.id, f.n, f.cost, f.give, { until: f.end, tag: `FLASH −${f.off}%`, cat: "Deals", was: f.was });
  const left = limitedLeft(w0, now) - bought("ltd" + w0);
  if (left > 0) add("ltd" + w0, LIMITED.n, LIMITED.cost, LIMITED.give, { until: w0 + 7 * OD, tag: "LIMITED", cat: "Deals", left, stock: LIMITED.stock });
  const step = CHAIN.findIndex((x, j) => !bought("chain" + Math.floor(now / (30 * OD)) + ":" + j));
  if (step >= 0) add("chain" + Math.floor(now / (30 * OD)) + ":" + step, `Trainer Supply Chain · Bundle ${step + 1} of ${CHAIN.length}`, CHAIN[step][0], CHAIN[step][1], { tag: "CHAIN", cat: "Deals", note: step < CHAIN.length - 1 ? "Buy it to unlock the next bundle." : "The last bundle this month." });
  return out;
}
// flash sales: three a day, two hours each, at times that differ by server and day
function flashSales(now) {
  const out = [];
  for (let d = Math.floor(now / OD) * OD - OD; d <= now; d += OD) {
    const r = seeded(hash(`flash:${srvId()}:${d}`));
    for (let k = 0; k < 3; k++) {
      const start = d + Math.floor(r() * 22) * OH, end = start + 2 * OH, [n, give] = FLASH[Math.floor(r() * FLASH.length)], was = worth(give), off = 60 + Math.floor(r() * 4) * 5;
      if (now >= start && now < end) out.push({ id: `flash${start}`, n, give, end, was, off, cost: Math.round(was * (1 - off / 100) / 10) * 10 });
    }
  }
  return out;
}
// what's left of the week's limited pack: the server's Trainers buy it too (most of it in the first days)
const limitedLeft = (w0, now) => Math.max(0, LIMITED.stock - Math.round(LIMITED.stock * (1 - Math.exp(-(now - w0) / OH / 40)) * (.8 + .4 * seeded(hash("ltd" + srvId() + w0))())));

// ---------- unlocking (once a minute or so, from liveTick) ----------
function offerTick() {
  const O = S.offers, now = Date.now(), unlock = id => { if (!O.unlocked[id]) { O.unlocked[id] = now; (O.queue = O.queue || []).push(id); } };
  for (const [lv] of LEVEL_PACKS) if (S.lvl >= lv) unlock("lv" + lv);
  for (const t in TIER_PACKS) if (tierIdx(S.ladder.best) >= +t) unlock("tier" + t);
  for (const b in BADGE_PACKS) if (statBadges() >= +b) unlock("badge" + b);
  if (S.dex.caught.mewtwo) unlock("mewtwo");
  const pw = topTeam(ROSTER).reduce((a, k) => a + power(k, S.ops[k]), 0);
  for (const [p] of POWER_PACKS) if (pw >= p) unlock("pow" + p);
  for (const a of [3, 14, 30, 60, 90]) if (now - (S.created || now) >= a * OD) unlock("age" + a);
  // nearly there: a team Pokémon one IV rank short of perfect; 60 throws without a 5★ (once per stretch of bad luck)
  if (topTeam(ROSTER).some(k => S.ops[k].pot === 5) && !O.unlocked.almostIV) unlock("almostIV");
  if (S.gacha.pity >= 60 && (O.pityAt || 0) !== S.gacha.total - S.gacha.pity) { O.pityAt = S.gacha.total - S.gacha.pity; delete O.unlocked.almostPity; delete O.bought.almostPity; unlock("almostPity"); }
  // coming back after a week away: a Welcome Back Pack, and a week of double Exp (free)
  if (now - (O.last || now) >= 7 * OD) { delete O.unlocked.comeback; delete O.bought.comeback; unlock("comeback"); O.boost.comeback = now + 7 * OD; sendMail({ from: "Event Center", tag: "gift", title: "Welcome back!", body: "We missed you! Your Pokémon earn double Exp. for the next 7 days, and there's a Welcome Back Pack in the Shops.", rewards: { orundum: 500, rec3: 5 } }); }
  O.last = now;
  // starting on a server that's been open a while: a catch-up Exp. boost for two weeks
  if (!O.catchup) { O.catchup = true; if ((S.created || now) - serverOpened(srvId()) > 60 * OD) { O.boost.catchup = (S.created || now) + 14 * OD; } }
}
// the Exp. boosts (battles): double after coming back, +50% while catching up on an older server
const expBoost = () => { if (!S || !S.offers) return 1; const b = S.offers.boost, now = Date.now(); return (b.comeback > now ? 2 : 1) * (b.catchup > now ? 1.5 : 1); };
// a newly unlocked offer pops up once on the home screen, when nothing else is open ("You just unlocked this")
function offerPopup() {
  const O = S.offers; if (!O.queue || !O.queue.length || BT.on || !$("#modal").hidden || !UI.inGame || UI.view !== "home" || (typeof DRAFT !== "undefined" && DRAFT)) return;   // (only on the home screen)
  const id = O.queue.shift(), off = offersNow().find(o => o.id === id); if (!off) return;
  openModal(`<div class="stack" style="text-align:center"><div class="eyebrow">New offer unlocked</div><h2>${esc(off.n)}</h2>
    <p class="small">${rewardText(off.give)}</p><p class="small">Worth about <b>${fmtFull(worth(off.give))} Gems</b> · ${fmtFull(off.cost)} Gems</p>
    ${off.until ? `<p class="tiny dim">Available until ${new Date(off.until).toISOString().slice(5, 16).replace("T", " ")} UTC</p>` : ""}
    <div class="row" style="gap:8px"><button class="btn ghost" style="flex:1" data-act="closeModal">Later</button><button class="btn" style="flex:1" data-act="offersGo">View</button></div></div>`);
}

// ---------- the Offers tab (Shops) ----------
function offersHTML() {
  const list = offersNow(), cats = {};
  for (const o of list) (cats[o.cat] = cats[o.cat] || []).push(o);
  const card = o => {
    const w = worth(o.give);
    return `<div class="offer"><div class="spread"><b>${esc(o.n)}</b><i class="stag">${esc(o.tag)}</i></div>
      <div class="small">${rewardText(o.give)}</div>
      <div class="tiny dim">Worth about ${fmtFull(w)} Gems${o.was ? ` · usually ${fmtFull(Math.round(o.was / 10) * 10)}` : ""}${o.left != null ? ` · ${o.left}/${o.stock} left on the server` : ""}${o.until ? ` · ends ${new Date(o.until).toISOString().slice(5, 16).replace("T", " ")} UTC (${dur(o.until - Date.now())})` : ""}${o.note ? " · " + esc(o.note) : ""}</div>
      ${o.left != null ? `<div class="evbar"><i style="width:${o.left / o.stock * 100}%"></i></div>` : ""}
      <button class="btn sm" data-act="buyOffer" data-id="${esc(o.id)}" ${S.orundum >= o.cost ? "" : "disabled"}>${IC.orundum}${fmtFull(o.cost)}</button></div>`;
  };
  const b = S.offers.boost, now = Date.now();
  return `<div class="stack">
    ${b.comeback > now || b.catchup > now ? `<div class="hint"><span class="small"><b>Exp. boost ×${expBoost()}</b>${b.comeback > now ? ` · coming back (${dur(b.comeback - now)} left)` : ""}${b.catchup > now ? ` · catching up on an older server (${dur(b.catchup - now)} left)` : ""}</span></div>` : ""}
    <p class="tiny dim">Offers cost Gems (a Recharge brings free Gems once an hour). Each shows what it's worth, so you can judge it; times are exact.</p>
    ${["For you", "New Trainer", "Deals", "VIP"].filter(c => cats[c]).map(c => `<h3>${c}</h3>${cats[c].map(card).join("")}`).join("") || '<p class="small dim">No offers right now.</p>'}
    <h3>Lucky Bags</h3><p class="tiny dim">Lucky Bag (500 Gems): ${oddsText(BAGS.luckybag)}. Premium Lucky Bag (2,000 Gems): ${oddsText(BAGS.luckybag2)}; every 10th is sure to hold the top prize (${10 - S.lucky.bag.n % 10} to go).</p>
    <div class="row wrap" style="gap:6px"><button class="btn sm" data-act="bagBuy" data-k="luckybag" ${S.orundum >= 500 ? "" : "disabled"}>Lucky Bag ${IC.orundum}500</button><button class="btn sm" data-act="bagBuy" data-k="luckybag2" ${S.orundum >= 2000 ? "" : "disabled"}>Premium ${IC.orundum}2,000</button>
      ${["luckybag", "luckybag2"].filter(k => S.inv[k] > 0).map(k => `<button class="btn sm ghost" data-act="bagOpen" data-k="${k}">Open a ${ITEMS[k].n} (×${S.inv[k]})</button>`).join("")}
      ${S.inv.choicebox > 0 ? `<button class="btn sm ghost" data-act="choiceOpen">Open a Choice Box (×${S.inv.choicebox})</button>` : ""}</div>
  </div>`;
}
const OFFER_ACT = {
  offersGo: () => { closeModal(); UI.shopTab = "offers"; route("shop"); },
  bagBuy: d => { const cost = d.k === "luckybag2" ? 2000 : 500; if (S.orundum < cost) return; gemsOut(cost, "Lucky Bag"); S.inv[d.k] = (S.inv[d.k] || 0) + 1; LUCKY_ACT.bagOpen(d); },
  buyOffer: d => {
    const o = offersNow().find(x => x.id === d.id); if (!o || S.orundum < o.cost) return;
    gemsOut(o.cost, "Offer"); S.offers.bought[o.id] = (S.offers.bought[o.id] || 0) + 1;
    const list = give(o.give); save(); sfx("win"); rerender(); rewardModal("Thank you!", list, o.n);
  },
  // Bottle Caps (IVs): one raises a Pokémon's IV rank by 1, a Gold Bottle Cap makes them perfect
  capUse: d => {
    const p = S.ops[d.k]; if (!p || p.pot >= 6 || !(S.inv[d.it] > 0)) return;
    S.inv[d.it]--; p.pot = d.it === "goldbottlecap" ? 6 : p.pot + 1; save(); sfx("heal"); toast(`${OPS[d.k].n}'s IVs are now ${IV_WORD[p.pot]}!`, "gold"); rerender();
  },
};
