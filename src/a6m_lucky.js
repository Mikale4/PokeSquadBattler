// =====================================================================
//  LUCKY EVENTS — Poké Wheel, Kanto Adventure Board (dice), Champion Lottery, Professor Oak's Scratch-Off, Pick-a-Box,
//  Team Rocket Treasure Hunt, Flip Cards, Lucky Bags, Choice Boxes, the server Auction and the Game Corner's slot machine
// =====================================================================
// Every one shows what can come out and how likely it is (or exactly what's inside), and when it ends. The server's Trainers
// play too: they buy Lottery tickets (the jackpot grows with theirs), race you round the Adventure Board and bid in the Auction.
// They open with the calendar (a6j_live.js eventsBetween, type "lucky"); Scratch-Off cards, Lucky Bags and Choice Boxes are
// always around.
const luckyInit = () => ({ wheel: { id: "", n: 0, free: "" }, dice: { id: "", pos: 0, laps: 0, got: [], login: "", gems: 0 }, lot: { id: "", t: 0, paid: false },
  scratch: { day: "", card: null }, box: { id: "", board: null, n: 0 }, hunt: { id: "", free: "", dug: [] }, flip: { id: "", free: "", board: null, mult: 1 },
  bag: { n: 0 }, auc: { id: "", bid: 0, paid: false }, slot: slotInit(), lotShow: null });
const luckyOn = key => typeof eventsNow === "function" ? eventsNow().find(e => e.type === "lucky" && e.key === key) || null : null;
const LUCKY_NAME = { slots: "Game Corner Fever", wheel: "Poké Wheel", dice: "Kanto Adventure Board", lottery: "Champion Lottery", box: "Pick-a-Box", hunt: "Team Rocket Treasure Hunt", flip: "Flip Cards", auction: "Server Auction" };
const pickW = (list, r = Math.random) => { const tot = list.reduce((a, x) => a + x[1], 0); let x = r() * tot; for (const e of list) { x -= e[1]; if (x <= 0) return e; } return list[list.length - 1]; };
const oddsText = list => { const tot = list.reduce((a, x) => a + x[1], 0); return list.map(([rw, w]) => `${rewardText(rw)} ${(w / tot * 100).toFixed(w / tot < .01 ? 1 : 0)}%`).join(" · "); };

// ---------- Poké Wheel (Fridays) ----------
const WHEEL = [[{ orundum: 50 }, 30], [{ rec2: 3 }, 20], [{ orundum: 150 }, 15], [{ permit: 1 }, 12], [{ gball: 2 }, 10], [{ rare: 5 }, 6], [{ uball: 2 }, 4], [{ bottlecap: 1 }, 2], [{ free10: 1 }, .8], [{ gold5: 1 }, .2]];
const WHEEL_COST = 300;
function wheelState(ev) { const W = S.lucky.wheel; if (W.id !== ev.id) Object.assign(W, { id: ev.id, n: 0, free: "" }); return W; }
const wheelFree = () => { const W = S.lucky.wheel; return W.free === today() ? 0 : 1 + VIP_PERK(vip()).spins; };
function spinWheel(ev) {
  const W = wheelState(ev); W.n++;
  // progressive: the 10th spin is sure to land on a Bottle Cap or better, the 30th on the Master Ball
  const seg = W.n === 30 ? WHEEL[9] : W.n === 10 ? pickW(WHEEL.slice(7)) : pickW(WHEEL);
  return seg[0];
}

// ---------- Kanto Adventure Board (weekends) ----------
// 24 places round Kanto. Dice: Normal (1–6), Lucky (3–6), Golden (6–12). They come from logging in (3 a day), every Recharge
// and every 1,000 Gems spent while it runs. Landing pays the space; passing Pallet Town is a lap.
const BOARD = ["Pallet Town", "Route 1", "Viridian City", "Viridian Forest", "Pewter City", "Mt. Moon", "Cerulean City", "Nugget Bridge", "Vermilion City", "S.S. Anne", "Rock Tunnel", "Lavender Town",
  "Celadon City", "Game Corner", "Saffron City", "Silph Co.", "Fuchsia City", "Safari Zone", "Seafoam Islands", "Cinnabar Island", "Power Plant", "Victory Road", "Indigo Plateau", "Cerulean Cave"];
const BOARD_PAY = j => j === 0 ? null : j === 17 ? { permit: 2 } : j === 13 ? { cert: 60 } : j === 23 ? { uball: 1, starpiece: 20 } : j === 22 ? { orundum: 300 } : j % 4 === 3 ? { starpiece: 15 } : j % 3 === 2 ? { rec2: 3, starpiece: 5 } : { orundum: 60, starpiece: 5 };
const LAPS = [[1, { orundum: 500 }], [3, { bottlecap: 1 }], [5, { uball: 5 }], [10, { goldbottlecap: 1 }]];
const DICE = { dice: [1, 6], luckydice: [3, 6], golddice: [6, 12] };
// the board's Star Piece shop (it closes with the board; leftover Star Pieces become 50 Poké Dollars each, by Mail)
const STAR_SHOP = [[{ luckydice: 1 }, 40, 10], [{ golddice: 1 }, 120, 5], [{ uball: 1 }, 60, 10], [{ bottlecap: 1 }, 250, 2], [{ rare: 5 }, 30, 10]];
function diceState(ev) { const B = S.lucky.dice; if (B.id !== ev.id) Object.assign(B, { id: ev.id, pos: 0, laps: 0, got: [], login: "", gems: 0 }); return B; }
function diceTick(ev) {
  const B = diceState(ev);
  if (B.login !== today()) { B.login = today(); give({ dice: 3 }); }
}
function rollDice(ev, kind) {
  const B = diceState(ev), [lo, hi] = DICE[kind], n = lo + Math.floor(Math.random() * (hi - lo + 1)), out = [];
  S.inv[kind]--; const from = B.pos; B.pos = (B.pos + n) % BOARD.length; if (B.pos < from || n >= BOARD.length) B.laps++;
  const rw = BOARD_PAY(B.pos); if (rw) out.push(...give(rw));
  live("dice", n);
  return { n, out, place: BOARD[B.pos] };
}
// the Trainers' laps (for the ranking): from how long they're online over the event
const npcLaps = (i, ev) => Math.floor(npcSum(i, ev.start, Math.min(Date.now(), ev.end), "hours") * .35 * (.5 + person(i).q));

// ---------- Champion Lottery (every day, drawn at 00:00 UTC) ----------
// Tickets 300 Gems (up to 50 a day). Every ticket on the server, yours and the Trainers', adds 100 Gems to the jackpot.
const LOT_COST = 300, LOT_MAX = 50, LOT_PRIZES = [["1st", 1, "jackpot + a Master Ball"], ["2nd", 3, { goldbottlecap: 1 }], ["3rd", 10, { orundum: 5000 }], ["4th", 50, { uball: 3 }]];
const npcLotTickets = (i, ev) => { const p = person(i), r = seeded(hash("lot" + ev.id + i))(); return p.arch === "f2p" ? (r < .3 ? 1 : 0) : Math.floor(r * r * (p.arch === "whale" ? 50 : p.arch === "collector" || p.arch === "tryhard" ? 12 : 4) * Math.min(1, (Math.min(Date.now(), ev.end) - ev.start) / (ev.end - ev.start) * 1.4)); };
function lotPool(ev) {
  const ck = ev.id + Math.floor(Date.now() / 60000); if (lotPool.k === ck) return lotPool.v;
  let t = 0; for (let i = 0; i < LADDER_N; i++) t += npcLotTickets(i, ev);
  const mine = S.lucky.lot.id === ev.id ? S.lucky.lot.t : 0;
  lotPool.k = ck; lotPool.v = { npc: t, mine, total: t + mine, jackpot: 10000 + (t + mine) * 100 };
  return lotPool.v;
}
// drawn once it ends: your chance at each prize is your share of the tickets
function lotDraw(ev) {
  const L = S.lucky.lot; if (L.id !== ev.id || L.paid || !L.t) return; L.paid = true;
  const P = lotPool(ev), r = seeded(hash("draw" + ev.id + srvId())), won = [];
  for (const [n, k, rw] of LOT_PRIZES) for (let j = 0; j < k; j++) if (r() < L.t / Math.max(1, P.total - won.length)) { won.push([n, rw]); break; }
  const rewards = {}; for (const [n, rw] of won) mergeRw(rewards, rw === "jackpot + a Master Ball" ? { orundum: P.jackpot, gold5: 1 } : rw);
  if (!won.length) mergeRw(rewards, { orundum: 50 * L.t });
  S.lucky.lotShow = { id: ev.id, t: L.t, total: P.total, won: won.map(w => w[0]) };   // (the draw, to watch on the slot machine)
  sendMail({ from: "Celadon Game Corner", tag: "gift", title: `Champion Lottery: ${won.length ? won.map(w => w[0] + " prize").join(", ") + "!" : "no prize this time"}`, body: `${fmtFull(P.total)} tickets were in the draw, ${L.t} of them yours.${won.length ? "" : " Here's 50 Gems for each of your tickets."}`, rewards });
}

// ---------- Professor Oak's Scratch-Off (always: a free card a day, more for 200 Gems) ----------
// The card's prize is drawn first (odds below), then the nine squares are filled to show it: three of a kind wins.
const SCRATCH = [[null, 50], ["pokeball", 25, { permit: 2 }], ["greatball", 15, { gball: 3 }], ["ultraball", 7, { uball: 3 }], ["pikachu", 2.5, { op: "pikachu", orundum: 500 }], ["masterball", .5, { gold5: 1 }]];
const SCRATCH_SYMS = ["pokeball", "greatball", "ultraball", "pikachu", "masterball"];
function newCard() {
  const [win, , rw] = pickW(SCRATCH.map(x => [x, x[1]]))[0], cells = [];
  if (win) cells.push(win, win, win);
  while (cells.length < 9) { const s = SCRATCH_SYMS[Math.floor(Math.random() * SCRATCH_SYMS.length)]; if (cells.filter(c => c === s).length < (s === win ? 3 : 2)) cells.push(s); }
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  return { cells, open: [], win, rw: rw || null };
}
const symIcon = s => s === "pikachu" ? `<img class="px" src="${sprFront("pikachu")}" alt="Pikachu">` : itemIcon({ pokeball: "permit", greatball: "gball", ultraball: "uball", masterball: "gold5" }[s]);

// ---------- Pick-a-Box (the 1st to the 7th of each month) ----------
// Twelve boxes; what's inside is listed, where isn't. A pick costs a Treasure Key or 500 Gems; finding the grand prize resets
// the board for free (or reset it any time for 1,000 Gems). A free key each day while it runs.
const BOX_SET = [[{ goldbottlecap: 1, gold5: 1 }, 1, "Grand prize"], [{ uball: 5 }, 2], [{ bottlecap: 1 }, 2], [{ orundum: 1000 }, 2], [{ orundum: 200 }, 3], [{ rare: 3 }, 2]];
function newBoard() { const b = []; for (const [rw, n, tag] of BOX_SET) for (let j = 0; j < n; j++) b.push({ rw, grand: !!tag, open: false }); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function boxState(ev) { const X = S.lucky.box; if (X.id !== ev.id) Object.assign(X, { id: ev.id, board: newBoard(), n: 0, key: "" }); if (X.key !== today()) { X.key = today(); give({ tkey: 1 }); } return X; }

// ---------- Team Rocket Treasure Hunt (Thursdays) ----------
// Nine places to dig with an Old Sea Map (3 free on the day, more for 300 Gems). Each place's finds are listed; one of them
// hides the Rocket Stash (it moves every event).
const HUNT_SPOTS = ["Mt. Moon", "Rock Tunnel", "Diglett's Cave", "Cerulean Cave", "Seafoam Islands", "Pokémon Mansion", "Power Plant", "Victory Road", "Rocket Hideout"];
const HUNT_FINDS = [[{ orundum: 150 }, 40], [{ rare: 3 }, 25], [{ gball: 2 }, 20], [{ uball: 1 }, 10], [{ bottlecap: 1 }, 5]];
const HUNT_STASH = { goldbottlecap: 1, uball: 5, orundum: 2000 };
function huntState(ev) { const T = S.lucky.hunt; if (T.id !== ev.id) Object.assign(T, { id: ev.id, free: "", dug: [] }); if (T.free !== today()) { T.free = today(); give({ seamap: 3 }); } return T; }
const stashAt = ev => Math.floor(seeded(hash("stash" + ev.id + srvId()))() * HUNT_SPOTS.length);

// ---------- Flip Cards (Tuesdays) ----------
// Twelve face-down cards: rewards, a ×2 (doubles the next reward), a free flip, and Team Rocket (ends the round; the board
// is dealt again). A flip costs a Flip Ticket (3 free on the day, more for 200 Gems).
const FLIP_SET = [[{ orundum: 100 }, 4], [{ rec3: 2 }, 2], [{ gball: 2 }, 2], [{ uball: 1 }, 1], ["x2", 1], ["free", 1], ["rocket", 1]];
function newFlips() { const b = []; for (const [c, n] of FLIP_SET) for (let j = 0; j < n; j++) b.push({ c, open: false }); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function flipState(ev) { const F = S.lucky.flip; if (F.id !== ev.id) Object.assign(F, { id: ev.id, free: "", board: newFlips(), mult: 1 }); if (F.free !== today()) { F.free = today(); give({ fticket: 3 }); } return F; }

// ---------- Lucky Bags and Choice Boxes (always) ----------
// A Lucky Bag (500 Gems) holds one of the prizes below; a Premium Lucky Bag (2,000 Gems) holds a better one, and every 10th is
// sure to hold its top prize. A Choice Box lets you pick one of three rewards.
const BAGS = { luckybag: [[{ orundum: 300 }, 40], [{ rare: 5 }, 25], [{ permit: 1 }, 20], [{ gball: 3 }, 10], [{ bottlecap: 1 }, 4], [{ orundum: 5000 }, 1]],
  luckybag2: [[{ uball: 3 }, 40], [{ bottlecap: 1 }, 30], [{ free10: 1 }, 18], [{ orundum: 10000 }, 10], [{ goldbottlecap: 1 }, 2]] };
const CHOICE = [{ orundum: 2000 }, { bottlecap: 2 }, { uball: 5 }];

// ---------- Server Auction (every day, closes at 00:00 UTC) ----------
// One lot a day. The Trainers bid as the day goes on (their best bid rises); bid at least 5% more to lead. If you're outbid
// your Gems come straight back; the top bid when it closes wins.
const AUC_LOTS = [["Mewtwo's Choice Box", { choicebox: 1, goldbottlecap: 2 }], ["Champion's Cache", { gold5: 2, free10: 1 }], ["Silph Co. Prototype Crate", { goldbottlecap: 1, uball: 10 }]];
const aucLot = ev => AUC_LOTS[Math.floor(ev.start / 864e5) % AUC_LOTS.length];
function aucNpc(ev, t = Date.now()) {
  const f = clamp((Math.min(t, ev.end) - ev.start) / (ev.end - ev.start), 0, 1), r = seeded(hash("auc" + ev.id + srvId()));
  const peak = 8000 + Math.floor(r() * 9000), bid = Math.round(1000 + (peak - 1000) * Math.pow(f, 1.6) / 10) * 10;
  const k = Math.floor(r() * 40);   // (one of the 40 strongest)
  return { bid, who: (k % 2 ? LADDER_N : LADDER_OLD) - 1 - (k >> 1) };
}
function aucSettle(ev) {
  const A = S.lucky.auc; if (A.id !== ev.id || A.paid || !A.bid) return; A.paid = true;
  const npc = aucNpc(ev, ev.end), [n, rw] = aucLot(ev);
  if (A.bid > npc.bid) sendMail({ from: "Server Auction", tag: "gift", title: `You won the ${n}!`, body: `Your bid of ${fmtFull(A.bid)} Gems was the highest.`, rewards: rw });
  else { gemsIn(A.bid, "free"); sendMail({ from: "Server Auction", tag: "gift", title: `Outbid on the ${n}`, body: `${npcName(npc.who)} won with ${fmtFull(npc.bid)} Gems. Your ${fmtFull(A.bid)} Gems are back.` }); }
}

// ---------- Celadon Game Corner slots (open with the Prize Corner; Game Corner Fever on Mondays) ----------
// HeartGold/SoulSilver's slot machine, with Smeargle painting at its easel (a9j_slots.js draws it). A spin is 3 Coins and plays
// five lines: the three rows and both diagonals. Each reel stops at random on one of its 21 stops, so every chance shown is
// exact, counted from the reels (slotOdds). Game Corner Fever (Mondays) gives 20 free spins.
const SLOT_REELS = ["7RPMRBMPRM7RPMRMBPRMP", "7RMPBRMPBR7MPRBMBRBMP", "7RPMBRPMBR7MRPBMRPBMR"];   // 7, Pikachu, Marill, Berries, Replay
const SLOT_N = 21, SLOT_BET = 3, SLOT_FEVER = 20;
const SLOT_LINES = [[1, 1, 1], [0, 0, 0], [2, 2, 2], [0, 1, 2], [2, 1, 0]];   // the rows each reel shows: middle, top, bottom, the diagonals
const SLOT_PAY = { 7: 100, P: 15, M: 6 }, SLOT_BERRY = 2;                         // three in a line; Berries on the left reel, a line
const SLOT_NAME = { 7: "7", P: "Pikachu", M: "Marill", B: "Berries", R: "Replay" };
// 7-7-7 also starts the Starter Bonus: 15 free rounds with Johto's first partners on the reels. Each reel lands on Chikorita,
// Totodile or Cyndaquil (a third each); the same one on all three pays 15 Coins, and all three of them in one bonus 100 more.
const SLOT_BONUS = { rounds: 15, pay: 15, trio: 100 }, SLOT_STARTERS = ["Chikorita", "Totodile", "Cyndaquil"];
const slotInit = () => ({ spins: 0, won: 0, replay: false, bonus: null, fever: "", feverN: 0 });
const slotState = () => S.lucky.slot || (S.lucky.slot = slotInit());
const slotSym = (r, s, row) => SLOT_REELS[r][(s + row) % SLOT_N];
function slotEval(stops) {
  const lines = []; let pay = 0, replay = false, big = false;
  SLOT_LINES.forEach((L, l) => {
    const a = slotSym(0, stops[0], L[0]), b = slotSym(1, stops[1], L[1]), c = slotSym(2, stops[2], L[2]);
    if (a === b && b === c && (SLOT_PAY[a] || a === "R")) { lines.push({ l, sym: a, pay: SLOT_PAY[a] || 0 }); pay += SLOT_PAY[a] || 0; if (a === "R") replay = true; if (a === "7") big = true; }
    else if (a === "B") { lines.push({ l, sym: "B", pay: SLOT_BERRY }); pay += SLOT_BERRY; }
  });
  return { stops, lines, pay, replay, big };
}
// the exact odds: every one of the 9,261 ways the reels can stop; the Starter Bonus is worth its expected Coins, a Replay a free spin
function slotOdds() {
  if (slotOdds.v) return slotOdds.v;
  const p1 = 1 / 27, R = SLOT_BONUS.rounds;
  const trio = 1 - 3 * (1 - p1) ** R + 3 * (1 - 2 * p1) ** R - (1 - 3 * p1) ** R;
  const bonus = R * 3 * p1 * SLOT_BONUS.pay + trio * SLOT_BONUS.trio;
  const n = { 7: 0, P: 0, M: 0, B: 0, R: 0, any: 0 }; let coins = 0, rep = 0;
  for (let a = 0; a < SLOT_N; a++) for (let b = 0; b < SLOT_N; b++) for (let c = 0; c < SLOT_N; c++) {
    const r = slotEval([a, b, c]), got = new Set(r.lines.map(x => x.sym));
    for (const g of got) n[g]++; if (got.size) n.any++;
    coins += r.pay + (r.big ? bonus : 0); if (r.replay) rep++;
  }
  const C = SLOT_N ** 3;
  return (slotOdds.v = { in: k => C / n[k], rtp: coins / C / (SLOT_BET * (1 - rep / C)), bonus, trio });
}
const oneIn = x => `1 in ${x < 10 ? x.toFixed(1) : Math.round(x)}`;
const slotOddsText = () => { const O = slotOdds();
  return `${SLOT_BET} Coins a spin play five lines (the three rows and both diagonals). On a line: 7-7-7 pays ${SLOT_PAY[7]} Coins and starts the Starter Bonus (${oneIn(O.in(7))} spins) · Pikachu ×3 ${SLOT_PAY.P} Coins (${oneIn(O.in("P"))}) · Marill ×3 ${SLOT_PAY.M} Coins (${oneIn(O.in("M"))}) · Replay ×3 a free spin (${oneIn(O.in("R"))}) · Berries on the left reel ${SLOT_BERRY} Coins (${oneIn(O.in("B"))}). Any win: ${oneIn(O.in("any"))}. Starter Bonus: ${SLOT_BONUS.rounds} free rounds; the same starter on all three reels (1 in 9 a round) pays ${SLOT_BONUS.pay} Coins, and all three starters in one bonus ${SLOT_BONUS.trio} more (${Math.round(O.trio * 100)}% of bonuses). Over time it pays back ${(O.rtp * 100).toFixed(1)}% of the Coins put in.`; };
const slotFever = () => luckyOn("slots");
const slotFree = () => { const ev = slotFever(), T = slotState(); return ev ? Math.max(0, SLOT_FEVER - (T.fever === ev.id ? T.feverN : 0)) : 0; };
// how the next spin is paid: a Starter Bonus round or a Replay is free, then Game Corner Fever's free spins, then 3 Coins
const slotPayWith = () => { const T = slotState(); return T.bonus ? "bonus" : T.replay ? "replay" : slotFree() > 0 ? "fever" : S.cert >= SLOT_BET ? "coins" : null; };
// a spin: the result is drawn (and paid) here, the machine then shows it
function slotSpin() {
  const T = slotState(), how = slotPayWith(); if (!how) return null;
  if (how === "bonus") {
    const B = T.bonus, st = [0, 1, 2].map(() => Math.floor(Math.random() * 3)), match = st[0] === st[1] && st[1] === st[2];
    let pay = 0, trio = false; B.r++;
    if (match) { pay = SLOT_BONUS.pay; if (!B.seen.includes(st[0])) { B.seen.push(st[0]); if (B.seen.length === 3) { pay += SLOT_BONUS.trio; trio = true; } } }
    B.got += pay; S.cert += pay; T.won += pay;
    const res = { how, bonus: true, starters: st, match, pay, trio, round: B.r, got: B.got, seen: [...B.seen], done: B.r >= SLOT_BONUS.rounds };
    if (res.done) T.bonus = null;
    live("slots"); save(); return res;
  }
  if (how === "replay") T.replay = false;
  else if (how === "fever") { const ev = slotFever(); if (T.fever !== ev.id) { T.fever = ev.id; T.feverN = 0; } T.feverN++; }
  else S.cert -= SLOT_BET;
  const r = slotEval([0, 1, 2].map(() => Math.floor(Math.random() * SLOT_N)));
  S.cert += r.pay; T.spins++; T.won += r.pay;
  if (r.replay) T.replay = true;
  if (r.big) T.bonus = { r: 0, got: 0, seen: [] };
  live("slots"); save();
  return { how, ...r };
}
// the Champion Lottery's draw on the machine: a line of 7s for the 1st prize, Pikachu the 2nd, Marill the 3rd, Berries the 4th
const LOT_SYM = { "1st": "7", "2nd": "P", "3rd": "M", "4th": "B" };
function slotStopsFor(sym) {
  if (sym) return [0, 1, 2].map(r => { const ok = []; for (let s = 0; s < SLOT_N; s++) if (slotSym(r, s, 1) === sym) ok.push(s); return ok[Math.floor(Math.random() * ok.length)]; });
  for (;;) { const st = [0, 1, 2].map(() => Math.floor(Math.random() * SLOT_N)); if (new Set([0, 1, 2].map(r => slotSym(r, st[r], 1))).size > 1) return st; }
}

// ---------- once a minute (liveTick): login dice, draws, the Auction ----------
function luckyTick() {
  const L = S.lucky, now = Date.now();
  const dv = luckyOn("dice"); if (dv) diceTick(dv);
  for (const ev of eventsBetween(now - 9 * 864e5, now).filter(e => e.type === "lucky" && e.end <= now)) {
    if (ev.key === "lottery") lotDraw(ev); if (ev.key === "auction") aucSettle(ev);
    if (ev.key === "dice" && L.dice.id === ev.id && !L.dice.paid && !luckyOn("dice")) { L.dice.paid = true; const n = S.inv.starpiece || 0; if (n) { S.inv.starpiece = 0; sendMail({ from: "Event Center", tag: "gift", title: "Kanto Adventure Board has closed", body: `Your ${n} leftover Star Pieces became ${fmtFull(n * 50)} Poké Dollars.`, rewards: { lmd: n * 50 } }); } }
  }
  // the Auction: if a Trainer now bids above you, your Gems come back
  const au = luckyOn("auction"); if (au && L.auc.id === au.id && L.auc.bid && !L.auc.out && aucNpc(au).bid > L.auc.bid) { L.auc.out = true; gemsIn(L.auc.bid, "free"); sendMail({ from: "Server Auction", tag: "gift", title: "You've been outbid", body: `${npcName(aucNpc(au).who)} bid ${fmtFull(aucNpc(au).bid)} Gems. Your ${fmtFull(L.auc.bid)} Gems are back; bid again before it closes.` }); L.auc.bid = 0; }
}
// dice from Recharges and spending while the board runs (from live())
function luckyLive(kind, n) {
  const dv = luckyOn("dice"); if (!dv || !S.lucky) return;
  const B = diceState(dv);
  if (kind === "recharge") give({ dice: 1 });
  if (kind === "gems") { B.gems += n; const k = Math.floor(B.gems / 1000); if (k) { B.gems -= k * 1000; give({ dice: k }); } }
}

// ---------- the windows ----------
function luckyModal(key) {
  const ev = luckyOn(key), now = Date.now(), end = ev ? `<p class="tiny dim">${endsText(ev.end)}</p>` : "";
  let h = "";
  if (key === "wheel" && ev) { const W = wheelState(ev), free = wheelFree();
    h = `<p class="small">Spin for one of these (odds shown). Spin 10 is sure to land on a Bottle Cap or better, spin 30 on the Master Ball. You've spun ${W.n} times.</p><p class="tiny dim">${oddsText(WHEEL)}</p>
      <button class="btn wide" data-act="wheelSpin" ${free > 0 || (S.inv.wticket || 0) > 0 || S.orundum >= WHEEL_COST ? "" : "disabled"}>${free > 0 ? `Free spin (${free} today)` : (S.inv.wticket || 0) > 0 ? `Spin with a Wheel Ticket (×${S.inv.wticket})` : `Spin ${IC.orundum}${WHEEL_COST}`}</button>`; }
  if (key === "dice" && ev) { const B = diceState(ev), rows = evRankingRaw(ev, i => npcLaps(i, ev), B.laps);
    h = `<p class="small">You're at <b>${BOARD[B.pos]}</b> · ${B.laps} lap${B.laps === 1 ? "" : "s"}. Dice come from logging in (3 a day), each Recharge and each 1,000 Gems you spend while the board runs.</p>
      <div class="board">${BOARD.map((p, j) => `<span class="bsq${j === B.pos ? " on" : ""}" title="${esc(p)}">${j === 0 ? "★" : j + 1}</span>`).join("")}</div>
      <div class="tiny dim">Spaces pay: ${[...new Set(BOARD.map((p, j) => BOARD_PAY(j)).filter(Boolean).map(rewardText))].join(" · ")}</div>
      <div class="row wrap" style="gap:6px">${Object.keys(DICE).map(k => `<button class="btn sm" data-act="diceRoll" data-k="${k}" ${(S.inv[k] || 0) > 0 ? "" : "disabled"}>${ITEMS[k].n} ×${S.inv[k] || 0} (${DICE[k].join("–")})</button>`).join("")}</div>
      <h3>Lap rewards</h3>${LAPS.map(([n, rw], j) => `<div class="lgoal"><span class="tiny">${n} lap${n > 1 ? "s" : ""}: ${rewardText(rw)}</span>${B.got.includes(j) ? '<span class="tiny dim">Received</span>' : B.laps >= n ? `<button class="btn sm" data-act="lapClaim" data-j="${j}">Claim</button>` : `<span class="tiny dim">${B.laps}/${n}</span>`}</div>`).join("")}
      <h3>Star Piece shop</h3><div class="tiny dim">You have ${S.inv.starpiece || 0} Star Pieces (from the board's spaces). It closes with the board; leftovers become 50 Poké Dollars each.</div>
      ${STAR_SHOP.map(([rw, price, max], j) => `<div class="lgoal"><div class="tiny"><b>${rewardText(rw)}</b> · ${price} Star Pieces · ${max - ((B.shop || {})[j] || 0)} left</div><button class="btn sm" data-act="starBuy" data-j="${j}" ${((B.shop || {})[j] || 0) < max && (S.inv.starpiece || 0) >= price ? "" : "disabled"}>Buy</button></div>`).join("")}
      <h3>Laps ranking</h3>${rows.slice(0, 5).map((r, j) => rankRow(r, j + 1, fmtFull(r.v))).join("")}${rows.findIndex(r => r.me) >= 5 ? rankRow(rows.find(r => r.me), rows.findIndex(r => r.me) + 1, fmtFull(B.laps)) : ""}`; }
  if (key === "lottery" && ev) { const P = lotPool(ev), L = S.lucky.lot, mine = L.id === ev.id ? L.t : 0;
    h = `<p class="small">${fmtFull(P.total)} tickets in today's draw (${mine} yours) · jackpot <b>${fmtFull(P.jackpot)} Gems</b>. Drawn at 00:00 UTC, when a new day's Lottery begins; prizes by Mail.</p>
      <div class="tiny dim">${LOT_PRIZES.map(([n, k, rw]) => `${n} prize ×${k}: ${typeof rw === "string" ? rw : rewardText(rw)}`).join(" · ")} · no prize: 50 Gems a ticket. Your chance at a prize ≈ your share of the tickets (${P.total ? (mine / P.total * 100).toFixed(2) : 0}% each).</div>
      <button class="btn wide" data-act="lotBuy" ${mine < LOT_MAX && S.orundum >= LOT_COST ? "" : "disabled"}>Buy a ticket ${IC.orundum}${LOT_COST} (${mine}/${LOT_MAX})</button>
      ${S.lucky.lotShow ? `<button class="btn ghost wide" data-act="lotWatch">Watch your last draw (${S.lucky.lotShow.t} ticket${S.lucky.lotShow.t === 1 ? "" : "s"})</button>` : ""}`; }
  if (key === "slots" && ev) { const free = slotFree();
    h = `<p class="small">Smeargle's slot machine at the Celadon Game Corner: <b>${SLOT_FEVER} free spins</b> today (${free} left), then ${SLOT_BET} Coins a spin.</p>
      <p class="tiny dim">${slotOddsText()}</p>
      <button class="btn wide" data-act="slotsOpen">${free ? `Play (${free} free spin${free === 1 ? "" : "s"})` : "Play"}</button>`; }
  if (key === "scratch") { const C = S.lucky.scratch, card = C.card;
    h = `<p class="small">Three of a kind wins. A free card a day; more for 200 Gems.</p><p class="tiny dim">Odds: ${SCRATCH.map(([s, w, rw]) => `${s ? rewardText(rw) : "no prize"} ${w}%`).join(" · ")}</p>
      ${card ? `<div class="scratch">${card.cells.map((s, j) => `<button class="sc${card.open.includes(j) ? " open" : ""}" data-act="scratchCell" data-j="${j}">${card.open.includes(j) ? symIcon(s) : "?"}</button>`).join("")}</div>
        <button class="btn sm" data-act="scratchAll">Scratch them all</button>` : `<button class="btn wide" data-act="scratchNew">${C.day !== today() ? "Today's free card" : `A card ${IC.orundum}200`}</button>`}`; }
  if (key === "box" && ev) { const X = boxState(ev);
    h = `<p class="small">Pick a box: a Treasure Key (×${S.inv.tkey || 0}) or 500 Gems. Inside the twelve: ${BOX_SET.map(([rw, n, t]) => `${n}× ${rewardText(rw)}${t ? " (" + t + ")" : ""}`).join(" · ")}.</p>
      <div class="boxes">${X.board.map((b, j) => `<button class="bx${b.open ? " open" : ""}" ${b.open ? "disabled" : `data-act="boxPick" data-j="${j}"`}>${b.open ? `<span class="tiny">${rewardText(b.rw)}</span>` : "?"}</button>`).join("")}</div>
      <button class="btn sm ghost" data-act="boxReset" ${S.orundum >= 1000 ? "" : "disabled"}>Reset the board ${IC.orundum}1,000</button>`; }
  if (key === "hunt" && ev) { const T = huntState(ev);
    h = `<p class="small">Dig with an Old Sea Map (×${S.inv.seamap || 0}; more for 300 Gems). Each dig finds one of: ${oddsText(HUNT_FINDS)}. One place hides the Rocket Stash: ${rewardText(HUNT_STASH)}.</p>
      <div class="boxes">${HUNT_SPOTS.map((p, j) => `<button class="bx${T.dug.includes(j) ? " open" : ""}" ${T.dug.includes(j) ? "disabled" : `data-act="huntDig" data-j="${j}"`}><span class="tiny">${esc(p)}</span></button>`).join("")}</div>`; }
  if (key === "flip" && ev) { const F = flipState(ev);
    h = `<p class="small">Flip a card: a Flip Ticket (×${S.inv.fticket || 0}) or 200 Gems. The twelve: ${FLIP_SET.map(([c, n]) => `${n}× ${c === "x2" ? "×2 (doubles the next reward)" : c === "free" ? "a free flip" : c === "rocket" ? "Team Rocket (ends the round)" : rewardText(c)}`).join(" · ")}.${F.mult > 1 ? ` <b>Next reward ×${F.mult}!</b>` : ""}</p>
      <div class="boxes">${F.board.map((b, j) => `<button class="bx${b.open ? " open" : ""}" ${b.open ? "disabled" : `data-act="flipCard" data-j="${j}"`}>${b.open ? `<span class="tiny">${b.c === "x2" ? "×2" : b.c === "free" ? "Free flip" : b.c === "rocket" ? "Team Rocket!" : rewardText(b.c)}</span>` : "?"}</button>`).join("")}</div>`; }
  if (key === "auction" && ev) { const A = S.lucky.auc, npc = aucNpc(ev), [n, rw] = aucLot(ev), mineNow = A.id === ev.id ? A.bid : 0, top = Math.max(npc.bid, mineNow), next = Math.ceil(top * 1.05 / 10) * 10;
    h = `<p class="small">Today's lot: <b>${esc(n)}</b> (${rewardText(rw)}).</p><p class="small">Top bid: <b>${fmtFull(top)} Gems</b> by ${mineNow >= npc.bid ? "you" : esc(npcName(npc.who))}.</p>
      <p class="tiny dim">Bid at least 5% more to lead. Outbid? Your Gems come straight back. The top bid when it closes wins.</p>
      <button class="btn wide" data-act="aucBid" data-v="${next}" ${S.orundum >= next ? "" : "disabled"}>Bid ${IC.orundum}${fmtFull(next)}</button>`; }
  openModal(`<div class="stack"><div class="eyebrow">Lucky event</div><h2>${key === "scratch" ? esc(profFull()) + "'s Scratch-Off" : LUCKY_NAME[key]}</h2>${end}${h || '<p class="small dim">Not running right now.</p>'}<button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
// a ranking from a value per Trainer plus yours
function evRankingRaw(ev, f, mine) { const rows = []; for (let i = LADDER_N - 300; i < LADDER_N; i++) rows.push({ i, v: f(i) }); rows.push({ me: true, v: mine }); return rows.sort((a, b) => b.v - a.v || (a.me ? -1 : 1)); }
const reopen = key => { save(); renderTop(); luckyModal(key); };
const LUCKY_ACT = {
  lucky: d => { sfx("tap"); luckyModal(d.k); },
  wheelSpin: () => { const ev = luckyOn("wheel"); if (!ev) return; const W = wheelState(ev);
    if (wheelFree() > 0) W.free = today(); else if ((S.inv.wticket || 0) > 0) S.inv.wticket--; else if (S.orundum >= WHEEL_COST) gemsOut(WHEEL_COST, "Wheel"); else return;
    const rw = spinWheel(ev), list = give(rw); live("spin"); save(); sfx("win"); rewardModal(`Poké Wheel · spin ${W.n}`, list); },
  diceRoll: d => { const ev = luckyOn("dice"); if (!ev || !(S.inv[d.k] > 0)) return; const r = rollDice(ev, d.k); sfx("tap"); toast(`Rolled ${r.n}: ${r.place}${r.out.length ? " · " + r.out.map(x => itemName(x.k.replace(/^held:/, ""))).join(", ") : ""}`, "gold"); reopen("dice"); },
  starBuy: d => { const ev = luckyOn("dice"); if (!ev) return; const B = diceState(ev), j = +d.j, [rw, price, max] = STAR_SHOP[j]; B.shop = B.shop || {};
    if ((B.shop[j] || 0) >= max || (S.inv.starpiece || 0) < price) return; S.inv.starpiece -= price; B.shop[j] = (B.shop[j] || 0) + 1; give(rw); reopen("dice"); },
  lapClaim: d => { const ev = luckyOn("dice"); if (!ev) return; const B = diceState(ev), j = +d.j; if (B.got.includes(j) || B.laps < LAPS[j][0]) return; B.got.push(j); const list = give(LAPS[j][1]); save(); rewardModal("Lap reward", list); },
  lotBuy: () => { const ev = luckyOn("lottery"); if (!ev || S.orundum < LOT_COST) return; const L = S.lucky.lot; if (L.id !== ev.id) Object.assign(L, { id: ev.id, t: 0, paid: false }); if (L.t >= LOT_MAX) return; gemsOut(LOT_COST, "Lottery"); L.t++; lotPool.k = ""; reopen("lottery"); },
  scratchNew: () => { const C = S.lucky.scratch; if (C.card) return; if (C.day !== today()) C.day = today(); else if (S.orundum >= 200) gemsOut(200, "Scratch-Off"); else return; C.card = newCard(); reopen("scratch"); },
  scratchCell: d => { const C = S.lucky.scratch; if (!C.card) return; const j = +d.j; if (!C.card.open.includes(j)) C.card.open.push(j); if (C.card.open.length < 9) return reopen("scratch"); scratchDone(); },
  scratchAll: () => { const C = S.lucky.scratch; if (!C.card) return; C.card.open = [0, 1, 2, 3, 4, 5, 6, 7, 8]; scratchDone(); },
  boxPick: d => { const ev = luckyOn("box"); if (!ev) return; const X = boxState(ev), b = X.board[+d.j]; if (!b || b.open) return;
    if ((S.inv.tkey || 0) > 0) S.inv.tkey--; else if (S.orundum >= 500) gemsOut(500, "Pick-a-Box"); else return;
    b.open = true; const list = give(b.rw); if (b.grand) X.board = newBoard(); save(); rewardModal(b.grand ? "The grand prize! (The board is dealt again.)" : "Inside the box", list); },
  boxReset: () => { const ev = luckyOn("box"); if (!ev || S.orundum < 1000) return; gemsOut(1000, "Pick-a-Box"); boxState(ev).board = newBoard(); reopen("box"); },
  huntDig: d => { const ev = luckyOn("hunt"); if (!ev) return; const T = huntState(ev), j = +d.j; if (T.dug.includes(j)) return;
    if ((S.inv.seamap || 0) > 0) S.inv.seamap--; else if (S.orundum >= 300) gemsOut(300, "Treasure Hunt"); else return;
    T.dug.push(j); const stash = j === stashAt(ev), list = give(stash ? HUNT_STASH : pickW(HUNT_FINDS)[0]); save(); rewardModal(stash ? "The Rocket Stash!" : `Found at ${HUNT_SPOTS[j]}`, list); },
  flipCard: d => { const ev = luckyOn("flip"); if (!ev) return; const F = flipState(ev), b = F.board[+d.j]; if (!b || b.open) return;
    if (F.freeFlip) F.freeFlip = false; else if ((S.inv.fticket || 0) > 0) S.inv.fticket--; else if (S.orundum >= 200) gemsOut(200, "Flip Cards"); else return;
    b.open = true;
    if (b.c === "rocket") { F.board = newFlips(); F.mult = 1; save(); return rewardModal("Team Rocket!", [], "They ran off with the board. Here's a fresh one."); }
    if (b.c === "x2") { F.mult *= 2; return reopen("flip"); }
    if (b.c === "free") { F.freeFlip = true; return reopen("flip"); }
    const rw = {}; for (const [k, n] of Object.entries(b.c)) rw[k] = n * F.mult; F.mult = 1; const list = give(rw); save(); rewardModal("Flip Cards", list); },
  bagOpen: d => { const k = d.k; if (!(S.inv[k] > 0)) return; S.inv[k]--; const B = S.lucky.bag; let rw;
    if (k === "luckybag2") { B.n++; rw = B.n % 10 === 0 ? BAGS.luckybag2[BAGS.luckybag2.length - 1][0] : pickW(BAGS.luckybag2)[0]; } else rw = pickW(BAGS.luckybag)[0];
    const list = give(rw); save(); rewardModal(ITEMS[k].n, list, k === "luckybag2" ? `${10 - B.n % 10} more until a sure top prize` : ""); },
  choiceOpen: () => { if (!(S.inv.choicebox > 0)) return; openModal(`<div class="stack"><h2>Choice Box</h2><p class="small">Pick one.</p>${CHOICE.map((rw, j) => `<button class="btn wide" data-act="choicePick" data-j="${j}">${rewardText(rw)}</button>`).join("")}<button class="btn ghost wide" data-act="closeModal">Later</button></div>`); },
  choicePick: d => { if (!(S.inv.choicebox > 0)) return; S.inv.choicebox--; const list = give(CHOICE[+d.j]); save(); rewardModal("Choice Box", list); },
  aucBid: d => { const ev = luckyOn("auction"), v = +d.v; if (!ev || S.orundum < v) return; const A = S.lucky.auc;
    if (A.id !== ev.id) Object.assign(A, { id: ev.id, bid: 0, paid: false, out: false });
    if (v < Math.ceil(Math.max(aucNpc(ev).bid, A.bid) * 1.05 / 10) * 10) return;
    if (A.bid) gemsIn(A.bid, "free"); gemsOut(v, "Auction"); A.bid = v; A.out = false; reopen("auction"); },
};
function scratchDone() {
  const C = S.lucky.scratch, card = C.card; C.card = null;
  const list = card.rw ? give(card.rw) : []; save();
  rewardModal(card.win ? "Three of a kind!" : "No match this time", list, card.win ? "" : "Better luck on the next card.");
}
