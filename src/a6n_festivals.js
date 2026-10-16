// =====================================================================
//  FESTIVALS — seasonal events, the anniversary and the Team Rocket Crossover
// =====================================================================
// Each festival brings a themed Safari area, its own currency (earned from battles won, Safari throws and Recharges while it
// runs), a festival shop that closes when it ends (leftover currency turns into Poké Dollars, by Mail), a 7-day festival login
// and a festival rush ranked against the server's Trainers. Dates are the real ones (Easter and Lunar New Year move each year).
const FESTS = {
  newyear: { n: "New Year Festival", cur: "stardust", six: ["snorlax", "kangaskhan"], five: ["clefable", "wigglytuff", "persian"], col: "#d8402e", d: "Fireworks over Celadon City and a New Year's crowd in the Safari Zone." },
  lunar: { n: "Lunar New Year", cur: "stardust", six: ["gyarados"], five: ["arcanine", "ninetales", "persian"], col: "#c22e28", d: "Red lanterns line Saffron City; a red Gyarados story goes round the Union Room." },
  valentine: { n: "Valentine's Week", cur: "stardust", six: ["chansey"], five: ["clefable", "wigglytuff", "jynx"], col: "#f06aa8", d: "Pink everywhere: Chansey and the Fairy types are out in force." },
  easter: { n: "Spring Egg Hunt", cur: "stardust", six: ["chansey", "exeggutor"], five: ["clefable", "tangela", "venomoth"], col: "#8ac84c", d: "Eggs are hidden all over the Safari Zone. Who laid them?" },
  anniv: { n: "Anniversary Festival", cur: "cometshard", six: ["mew"], five: ["dragonair", "porygon", "lapras"], col: "#e8b82e", d: "Kanto Squad's anniversary: Mew comes out to celebrate, and every Gem pack's double bonus is back." },
  summer: { n: "Summer Beach Festival", cur: "stardust", six: ["lapras", "blastoise"], five: ["starmie", "golduck", "kingler"], col: "#3aa8d8", d: "Cinnabar's beaches are packed, and so are the waters." },
  halloween: { n: "Lavender Halloween", cur: "stardust", six: ["gengar"], five: ["haunter", "marowak", "hypno"], col: "#735797", d: "Lavender Town after dark. Bring a Silph Scope." },
  harvest: { n: "Harvest Festival", cur: "stardust", six: ["venusaur", "exeggutor"], five: ["victreebel", "vileplume", "tangela"], col: "#c8902e", d: "Berries are in season: Grass types gather for the harvest." },
  xmas: { n: "Winter Holidays", cur: "stardust", six: ["lapras"], five: ["jynx", "cloyster", "dewgong"], col: "#3a8ad8", d: "Snow on the Seafoam Islands and gifts under Professor Oak's tree." },
  rocket: { n: "Team Rocket Crossover", cur: "nugget", six: ["gengar", "gyarados"], five: ["arbok", "weezing", "persian"], col: "#2a2a3a", d: "Jessie and James have taken over the Game Corner. Prepare for trouble... and prizes!" },
};
const FEST_LOGIN = [{ orundum: 300 }, { festcur: 200 }, { rare: 5 }, { festcur: 300 }, { gball: 3 }, { festcur: 500 }, { uball: 3 }];
// the festival shop: [reward, price in the festival's currency, how many]
const FEST_SHOP = [[{ permit: 1 }, 250, 10], [{ uball: 1 }, 300, 10], [{ rare: 5 }, 150, 10], [{ bottlecap: 1 }, 1200, 3], [{ goldbottlecap: 1 }, 4000, 1], [{ free10: 1 }, 2500, 2], [{ gold5: 1 }, 6000, 1], [{ held: "leftovers" }, 800, 2]];
// the festival's dates in a year: [key, start, days]
function festDates(y) {
  const D = (m, d) => Date.UTC(y, m - 1, d), easter = (() => { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return Date.UTC(y, mo - 1, da); })();
  const lunar = { 2026: D(2, 17), 2027: D(2, 6), 2028: D(1, 26), 2029: D(2, 13), 2030: D(2, 3), 2031: D(1, 23), 2032: D(2, 11) }[y] || D(2, 5);
  const nov1 = new Date(D(11, 1)).getUTCDay(), thanks = D(11, 1 + ((4 - nov1 + 7) % 7) + 21);
  return [["newyear", D(1, 1), 7], ["lunar", lunar, 7], ["valentine", D(2, 10), 7], ["easter", easter - 3 * 864e5, 7], ["anniv", D(4, 1), 10], ["summer", D(7, 15), 14],
    ["halloween", D(10, 25), 8], ["harvest", thanks - 864e5, 5], ["xmas", D(12, 20), 14], ...[1, 4, 7, 10].map(m => ["rocket", D(m, 15), 10])];
}
function festivalsBetween(from, to) {
  const out = [];
  for (let y = new Date(from).getUTCFullYear() - 1; y <= new Date(to).getUTCFullYear(); y++) for (const [key, start, days] of festDates(y)) { const end = start + days * 864e5; if (end > from && start < to) out.push({ key, start, end }); }
  return out;
}
const festNow = () => typeof eventsNow === "function" ? eventsNow().filter(e => e.type === "fest") : [];
const festCur = key => FESTS[key].cur;
function festState(ev) { const F = (S.fest = S.fest || {}); if (!F[ev.id]) F[ev.id] = { pts: 0, login: [], day: "", shop: {}, paid: false }; return F[ev.id]; }
// the currency it brings (from live()): 20 a battle won, 5 a Safari throw, 1 for every 20 Gems recharged
function festLive(kind, n) {
  for (const ev of festNow()) {
    const g = kind === "win" ? 20 * n : kind === "throw" ? 5 * n : kind === "recharge" ? Math.floor(n / 20) : 0; if (!g) continue;
    const F = festState(ev); F.pts += g; give({ [festCur(ev.key)]: g });
  }
}
// the Trainers' festival points (the rush): from their battles and throws over the festival
const npcFest = (i, ev) => { const until = Math.min(Date.now(), ev.end); return npcSum(i, ev.start, until, "ranked") * 20 * 3 + npcSum(i, ev.start, until, "throws") * 5; };
// when a festival ends: leftover currency becomes Poké Dollars, the rush pays your place
function festTick() {
  const now = Date.now();
  for (const ev of (typeof eventsBetween === "function" ? eventsBetween(now - 9 * 864e5, now) : []).filter(e => e.type === "fest" && e.end <= now)) {
    const F = (S.fest || {})[ev.id]; if (!F || F.paid) continue; F.paid = true;
    const cur = festCur(ev.key), left = S.inv[cur] || 0, rows = evRankingRaw(ev, i => npcFest(i, ev), F.pts), rank = rows.findIndex(r => r.me) + 1;
    const rewards = F.pts > 0 ? { ...rushPay(rank) } : {}; if (left) { S.inv[cur] = 0; rewards.lmd = (rewards.lmd || 0) + left * 100; }
    if (Object.keys(rewards).length) sendMail({ from: "Event Center", tag: "rank", title: `${FESTS[ev.key].n} has ended`, body: `${F.pts ? `You finished #${fmtFull(rank)} in the festival rush with ${fmtFull(F.pts)} points. ` : ""}${left ? `Your ${fmtFull(left)} leftover ${ITEMS[cur].n} became ${fmtFull(left * 100)} Poké Dollars.` : ""}`, rewards });
  }
}
function festModal(id) {
  const ev = festNow().find(e => e.id === id); if (!ev) return;
  const Fd = FESTS[ev.key], F = festState(ev), cur = festCur(ev.key), day = Math.floor((Date.now() - ev.start) / 864e5), rows = evRankingRaw(ev, i => npcFest(i, ev), F.pts);
  const loginRw = j => { const rw = { ...FEST_LOGIN[j] }; if (rw.festcur) { rw[cur] = rw.festcur; delete rw.festcur; } return rw; };
  openModal(`<div class="stack"><div class="eyebrow">Festival</div><h2>${esc(Fd.n)}</h2><p class="small">${esc(Fd.d)}</p><p class="tiny dim">${endsText(ev.end)}</p>
    <p class="small">You have <b>${fmtFull(S.inv[cur] || 0)} ${ITEMS[cur].n}</b>: 20 for each battle won, 5 a Safari throw, 1 for every 20 Gems recharged. The shop closes when the festival ends; leftover ${ITEMS[cur].n} becomes Poké Dollars (100 each).</p>
    <button class="btn sm" data-act="evArea" data-b="${esc(eventsNow().find(e => e.type === "area" && e.fest === ev.key) ? eventsNow().find(e => e.type === "area" && e.fest === ev.key).id : "")}">The festival's Safari area</button>
    <h3>Festival login</h3><div class="ldays">${FEST_LOGIN.map((_, j) => { const got = F.login.includes(j), ready = !got && j <= day && j === F.login.length && F.day !== today();
      return `<button class="lday${got ? " got" : ""}${ready ? " ready" : ""}" ${ready ? `data-act="festLogin" data-id="${esc(ev.id)}" data-j="${j}"` : "disabled"}><b>Day ${j + 1}</b><span class="tiny">${rewardText(loginRw(j))}</span></button>`; }).join("")}</div>
    <h3>Festival shop</h3>${FEST_SHOP.map(([rw, price, max], j) => { const n = F.shop[j] || 0;
      return `<div class="lgoal"><div><b>${rewardText(rw)}</b><div class="tiny dim">${fmtFull(price)} ${ITEMS[cur].n} · ${max - n} left</div></div><button class="btn sm" data-act="festBuy" data-id="${esc(ev.id)}" data-j="${j}" ${n < max && (S.inv[cur] || 0) >= price ? "" : "disabled"}>Buy</button></div>`; }).join("")}
    <h3>Festival rush</h3>${rows.slice(0, 5).map((r, j) => rankRow(r, j + 1, fmtFull(r.v))).join("")}
      <div class="tiny dim">Points are the ${ITEMS[cur].n} you've earned (spending it doesn't lower them). You're #${fmtFull(rows.findIndex(r => r.me) + 1)}; places pay by Mail at the end, like the rushes.</div>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
const FEST_ACT = {
  fest: d => { sfx("tap"); festModal(d.id); },
  festLogin: d => { const ev = festNow().find(e => e.id === d.id), j = +d.j; if (!ev) return; const F = festState(ev); if (F.login.includes(j) || j !== F.login.length || F.day === today()) return;
    F.login.push(j); F.day = today(); const rw = { ...FEST_LOGIN[j] }; if (rw.festcur) { rw[festCur(ev.key)] = rw.festcur; delete rw.festcur; } const list = give(rw); save(); rewardModal(`${FESTS[ev.key].n} · day ${j + 1}`, list); },
  festBuy: d => { const ev = festNow().find(e => e.id === d.id), j = +d.j; if (!ev) return; const F = festState(ev), [rw, price, max] = FEST_SHOP[j], cur = festCur(ev.key);
    if ((F.shop[j] || 0) >= max || (S.inv[cur] || 0) < price) return; S.inv[cur] -= price; F.shop[j] = (F.shop[j] || 0) + 1; const list = give(rw); save(); rewardModal("Festival shop", list); },
};
