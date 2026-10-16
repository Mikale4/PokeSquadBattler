// =====================================================================
//  GAME CORNER SLOTS — HeartGold/SoulSilver's slot machine (resources/slots, tools/pack_slots.py), drawn on a canvas at the
//  DS's own 256 x 192 a screen: the top screen (Smeargle painting at its easel in the TV, the ROUND / GET counters) above the
//  bottom one (the reels, CREDIT and PAYOUT), or beside it in landscape. The rules and the odds are in a6m_lucky.js (slotSpin,
//  slotOdds); this plays them. Tap to spin, tap a reel (or anywhere) to stop one; they stop on their own too. On the Game Boy:
//  A spins and stops, SELECT shows the odds, B closes. It also replays the Champion Lottery's draw (slotsDraw).
// =====================================================================
const SL = { on: false, img: null, m: null, cv: null, g: null, land: false, mode: "play", st: "idle", reels: [], res: null, t: 0,
  bg: "main", bgT: 0, paint: null, smg: 0, emote: null, emoteT: 0, credit: 0, pay: 0, banner: "", lines: [], winT: 0, strips: {}, raf: 0, draw: null };
const SL_LINE_COL = ["#4aa8ff", "#ffa531", "#ffa531", "#52d04a", "#52d04a"];   // the lamps' colours: middle blue, rows orange, diagonals green
const SL_PANEL = { B: 0, P: 1, 7: 2, M: 3, R: 4 };                               // the reel symbols in the atlas
const SL_DRAW = { R: 0, P: 1, M: 2, B: 3, ball: 4, 7: 5, starter: [6, 8, 7], blank: 9 };   // Smeargle's paintings (+10: in pencil)
const SL_EMOTE = { sad: 0, miss: 1, happy: 2, angry: 3, note: 4, scribble: 5, excited: 6, alert: 7 };
function slAtlas() {
  if (!SL.img && RES_DATA.slots) { SL.img = new Image(); SL.img.src = resPng(RES_DATA.slots); SL.m = RES_DATA.slotsMeta; }
  return SL.img && SL.img.naturalWidth ? SL : null;
}
slAtlas();   // (loaded up front, so the machine opens at once)
const slPiece = (b, x, y) => SL.g.drawImage(SL.img, b[0], b[1], b[2], b[3], Math.round(x), Math.round(y), b[2], b[3]);
// the machine's own lettering (the HP-bar font, recoloured)
const slTextW = t => [...t.toUpperCase()].reduce((a, ch) => a + (SL.m.font[ch] ? SL.m.font[ch][2] - 1 : 3), 0);
function slText(t, x, y, center) {
  t = t.toUpperCase(); if (center) x -= slTextW(t) / 2;
  for (const ch of t) { const b = SL.m.font[ch]; if (b) SL.g.drawImage(SL.img, b[0], b[1], b[2] + 1, b[3] + 1, Math.round(x), y, b[2] + 1, b[3] + 1); x += b ? b[2] - 1 : 3; }
}
// digits: the lit cells over the frame's unlit ones (blank cells stay unlit)
function slDigits(cells, v, big, ox = 0, oy = 0, zero) {
  const D = SL.m[big ? "big" : "small"], off = big ? 1 : 2, s = v == null ? "" : String(Math.max(0, Math.floor(v))).slice(-cells.length).padStart(cells.length, zero ? "0" : " ");
  cells.forEach(([x, y], j) => slPiece(s[j] === " " || s[j] == null ? D[0] : D[off + +s[j]], ox + x, oy + y));
}
// a reel strip, drawn once: 21 symbols (24 px each), or the Starter Bonus's three starters (120 px each)
function slStrip(r, bonus) {
  const k = (bonus ? "b" : "n") + r; if (SL.strips[k]) return SL.strips[k];
  const c = document.createElement("canvas"), M = SL.m; c.width = 32; c.height = bonus ? 360 : SLOT_N * 24;
  const g = c.getContext("2d");
  if (bonus) for (let s = 0; s < 3; s++) { const b = M.starter[s * 3 + r]; g.drawImage(SL.img, b[0], b[1], 32, 120, 0, s * 120, 32, 120); }
  else for (let s = 0; s < SLOT_N; s++) { const b = M.panel[SL_PANEL[SLOT_REELS[r][s]]]; g.drawImage(SL.img, b[0], b[1], 32, 24, 0, s * 24, 32, 24); }
  return (SL.strips[k] = c);
}

// ---------- opening and closing ----------
function slotsOpen(mode = "play", draw = null) {
  if (!S) return;
  if (!slAtlas()) { if (SL.img) SL.img.onload = () => slotsOpen(mode, draw); return; }   // (the picture is still loading)
  const el = $("#slots"); if (!el) return;
  closeModal();
  Object.assign(SL, { on: true, mode, draw, st: "idle", res: null, lines: [], paint: null, emote: null, smg: 0, t: performance.now() });
  const T = slotState(); SL.credit = S.cert; SL.pay = 0;
  slReels(mode === "play" && !!T.bonus);
  SL.bg = T.bonus && mode === "play" ? "starterBg" : "main";
  el.innerHTML = `<div class="slwrap"><canvas id="slCv" aria-label="Slot machine"></canvas></div><div class="slbar" id="slBar"></div>`;
  el.hidden = false; SL.cv = $("#slCv"); SL.g = SL.cv.getContext("2d");
  SL.cv.addEventListener("pointerdown", slTap);
  slSize(); slBar();
  if (SL.ro) SL.ro.disconnect(); SL.ro = new ResizeObserver(() => SL.on && slSize()); SL.ro.observe($("#slots .slwrap"));
  music("gameCorner");
  cancelAnimationFrame(SL.raf); SL.raf = requestAnimationFrame(slFrame);
  if (mode === "draw") setTimeout(() => SL.on && SL.mode === "draw" && slotPress(), 700);
}
function slotsClose() {
  const el = $("#slots"); if (el) { el.hidden = true; el.innerHTML = ""; }
  SL.on = false; cancelAnimationFrame(SL.raf);
  if (UI.inGame) { renderTop(); rerender(); }
}
// the canvas at the DS's size, scaled to fit (portrait: one screen above the other; landscape: side by side)
function slSize() {
  const wrap = $("#slots .slwrap"); if (!wrap || !SL.cv) return;
  const W = wrap.clientWidth, H = wrap.clientHeight; SL.land = W > H * 1.1;
  const cw = SL.land ? 512 : 256, ch = SL.land ? 192 : 384, dpr = pxRatio();
  let k = Math.min(W / cw, H / ch);
  // a DS pixel is a whole number of device pixels when that costs little; otherwise drawn bigger and scaled down smoothly
  const whole = Math.floor(k * dpr) / dpr; if (whole >= k * .9) k = whole;
  const N = clamp(Math.ceil(k * dpr - .01), 1, 4);
  SL.cw = cw; SL.ch = ch; SL.N = N;
  if (SL.cv.width !== cw * N || SL.cv.height !== ch * N) { SL.cv.width = cw * N; SL.cv.height = ch * N; }
  SL.cv.style.width = Math.round(cw * k) + "px"; SL.cv.style.height = Math.round(ch * k) + "px";
}
function slReels(bonus) {
  SL.reels = [0, 1, 2].map(r => ({ r, bonus, L: bonus ? 360 : SLOT_N * 24, pos: bonus ? Math.floor(Math.random() * 3) * 120 + 24 : Math.floor(Math.random() * SLOT_N) * 24, v: 0, spin: false, stop: null }));
}

// ---------- the buttons under the machine ----------
function slBar() {
  const bar = $("#slBar"); if (!bar) return;
  const T = slotState(), how = SL.mode === "play" ? slotPayWith() : null, free = slotFree();
  const main = SL.st === "spin" ? "Stop" : SL.mode === "draw" ? (SL.st === "done" ? "" : "Draw")
    : how === "bonus" ? `Starter Bonus · round ${T.bonus.r + 1}/${SLOT_BONUS.rounds}` : how === "replay" ? "Replay · free spin" : how === "fever" ? `Free spin (${free} left)` : `Spin · ${SLOT_BET} Coins`;
  const html = `<div class="slrow"><span class="mat">${IC.cert}${fmtFull(S.cert)} Coins</span><span style="flex:1"></span>
    ${SL.mode === "play" ? '<button class="btn ghost sm" data-act="slotOdds">Odds</button>' : ""}<button class="btn ghost sm" data-act="slotsClose">Close</button></div>
    ${main ? `<button class="btn wide" data-act="slotPress" ${SL.st === "spin" || SL.st === "idle" ? "" : "disabled"} ${SL.mode === "play" && SL.st === "idle" && !how ? "disabled" : ""}>${main}</button>` : ""}`;
  if (bar.dataset.h !== html) { bar.innerHTML = html; bar.dataset.h = html; }
}

// ---------- playing ----------
// A (or the button, or a tap on the machine): spin when it's still, otherwise stop the leftmost reel still turning
function slotPress(reel) {
  if (!SL.on) return;
  if (SL.st === "spin") { const r = reel != null && SL.reels[reel].spin && !SL.reels[reel].stop ? SL.reels[reel] : SL.reels.find(x => x.spin && !x.stop); if (r) slStop(r); return; }
  if (SL.st !== "idle") return;
  let res;
  if (SL.mode === "draw") {
    const D = SL.draw; if (D.i >= D.rounds.length) return;
    const p = D.rounds[D.i++]; res = { draw: true, prize: p, ...slotEval(slotStopsFor(p && LOT_SYM[p])) };
    res.lines = res.lines.filter(x => x.l === 0 && x.sym !== "R" && (p ? x.sym === LOT_SYM[p] : false));   // (the draw reads the middle line only)
  } else {
    const before = S.cert; res = slotSpin(); if (!res) { toast(`You need ${SLOT_BET} Coins (or a free spin) to play.`); return; }
    SL.credit = before - (res.how === "coins" ? SLOT_BET : 0); SL.pay = 0;
  }
  SL.res = res; SL.st = "spin"; SL.t = performance.now(); SL.lines = []; SL.emote = null;
  if (!!res.bonus !== !!SL.reels[0].bonus) slReels(!!res.bonus);
  for (const r of SL.reels) { r.spin = true; r.stop = null; r.v = 0; r.t0 = SL.t; r.auto = SL.t + 1300 + r.r * 450; }
  // Smeargle starts on its painting: in pencil, whatever is coming if it's a win (or a guess)
  const sym = res.draw ? "ball" : res.bonus ? null : (res.lines.find(x => x.sym === "7") || res.lines.find(x => x.sym !== "B") || res.lines[0] || {}).sym;
  SL.paint = { i: res.bonus ? SL_DRAW.starter[res.match ? res.starters[0] : Math.floor(Math.random() * 3)] : sym ? SL_DRAW[sym] : [0, 1, 2, 3, 5][Math.floor(Math.random() * 5)], pencil: true, k: 0 };
  if (!res.bonus && SL.bg !== "happyB") SL.bg = "main";
  if (res.how === "replay") SL.bg = "happyB";
  sfx("special");
  slBar();
  if (SL_FAST()) { for (const r of SL.reels) { r.pos = slTarget(r); r.spin = false; } slResult(); }
}
const SL_FAST = () => DEMO_ON() && DEMO.fast;
// where a reel stops: its top row on the drawn stop (a Starter Bonus reel: the starter's middle three panels)
const slTarget = r => SL.res.bonus ? SL.res.starters[r.r] * 120 + 24 : SL.res.stops[r.r] * 24;
function slStop(r) {
  const tgt = slTarget(r); let d = ((r.pos - tgt) % r.L + r.L) % r.L; if (d < 60) d += r.L;
  r.stop = { from: r.pos, d, t0: performance.now(), dur: clamp(d / 900 * 1.7, .3, .9) * 1000 * (SL.reach && SL.reels.filter(x => !x.stop).length === 1 ? 2.2 : 1) };
}
// a reach: two reels already show 7, 7 on a line and the last one is still turning
function slReachCheck() {
  if (SL.reach || SL.res.bonus || SL.res.draw) return;
  const done = SL.reels.filter(r => !r.spin); if (done.length !== 2) return;
  const sym = (r, row) => slotSym(r, SL.res.stops[r], row);
  if (SLOT_LINES.some(L => done.every(r => sym(r.r, L[r.r]) === "7"))) { SL.reach = true; SL.bg = "happyA"; slEmote("excited"); sfx("zap"); }
}
const slEmote = k => { SL.emote = SL_EMOTE[k]; SL.emoteT = performance.now(); };
// every reel has stopped: show what it was
function slResult() {
  const res = SL.res; SL.st = "result"; SL.winT = performance.now(); SL.reach = false;
  SL.lines = (res.lines || []).slice();
  if (res.draw) {
    const D = SL.draw;
    if (res.prize) { SL.paint = { i: SL_DRAW[LOT_SYM[res.prize]], pencil: false, k: 1 }; SL.smg = 2; slEmote(res.prize === "1st" ? "excited" : "happy"); SL.bg = "success"; if (res.prize === "1st") jingle("badge"); else sfx("win"); }
    else { SL.paint = { i: SL_DRAW.blank, pencil: true, k: 1 }; SL.smg = 2; slEmote("sad"); sfx("lose"); }
    SL.banner = res.prize ? `${res.prize} prize` : "No prize this time";
    setTimeout(() => { if (!SL.on || SL.mode !== "draw") return; if (D.i < D.rounds.length) { SL.st = "idle"; slotPress(); } else { SL.st = "done"; SL.banner = res.prize || D.won.length ? "Your prizes are in your Mail" : "Better luck tomorrow"; slBar(); } }, 2200);
    slBar(); return;
  }
  if (res.bonus) {
    if (res.match) { SL.paint = { i: SL_DRAW.starter[res.starters[0]], pencil: false, k: 1 }; SL.smg = 2; slEmote(res.trio ? "excited" : "happy"); SL.bg = "success"; sfx("win"); if (res.trio) jingle("caught"); }
    else { SL.paint = { i: SL_DRAW.blank + 10, pencil: true, k: 1 }; SL.smg = 2; slEmote(["miss", "scribble"][res.round % 2]); }
  } else if (res.big) { SL.paint = { i: SL_DRAW[7], pencil: false, k: 1 }; SL.smg = 2; slEmote("excited"); SL.bg = "success"; jingle("badge"); }
  else if (res.pay || res.replay) { const s = (res.lines.find(x => x.sym !== "B") || res.lines[0]).sym; SL.paint = { i: SL_DRAW[s], pencil: false, k: 1 }; SL.smg = 2; slEmote(res.replay && !res.pay ? "note" : "happy"); SL.bg = res.replay ? "happyB" : "success"; sfx(res.pay ? "win" : "heal"); }
  else { SL.paint = { i: SL_DRAW.blank + 10, pencil: true, k: 1 }; SL.smg = 2; slEmote(["sad", "miss", "scribble", "angry"][Math.floor(Math.random() * 4)]); }
  const hold = SL_FAST() ? 0 : res.big ? 2600 : res.pay || res.match ? 1300 : 450;
  setTimeout(() => {
    if (!SL.on) return;
    SL.st = "idle"; SL.credit = S.cert; SL.smg = 0;
    const T = slotState();
    if (res.big || (res.bonus && !res.done)) { if (!SL.reels[0].bonus) slReels(true); SL.bg = "starterBg"; }
    else if (res.bonus && res.done) { slReels(false); SL.bg = "main"; toast(`Starter Bonus over: ${res.got} Coins`, "gold"); }
    else SL.bg = T.replay ? "happyB" : "main";
    slBar();
  }, hold);
  slBar();
}
function slTap(e) {
  const rc = SL.cv.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * SL.cw, y = (e.clientY - rc.top) / rc.height * SL.ch;
  const [bx, by] = SL.land ? [256, 0] : [0, 192], lx = x - bx, ly = y - by;
  if (lx < 0 || ly < 0 || lx > 256 || ly > 192) return;   // (the top screen is only to look at)
  const [rx, ry] = SL.m.layout.reels, gap = SL.m.layout.reelGap, r = Math.floor((lx - rx) / gap);
  slotPress(SL.st === "spin" && r >= 0 && r < 3 && lx - rx - r * gap < 32 && ly >= ry && ly < ry + 72 ? r : undefined);
}

// ---------- every frame ----------
function slFrame(now) {
  if (!SL.on) return;
  SL.raf = requestAnimationFrame(slFrame);
  if (!SL.cv || !document.body.contains(SL.cv)) return;
  const g = SL.g, M = SL.m, Lo = M.layout, sec = now / 1000;
  // the reels
  if (SL.st === "spin") {
    for (const r of SL.reels) {
      if (!r.spin) continue;
      if (r.stop) {
        const k = clamp((now - r.stop.t0) / r.stop.dur, 0, 1), e = 1 - Math.pow(1 - k, 3), over = Math.sin(k * Math.PI) * (k > .7 ? 3 : 0);
        r.pos = r.stop.from - r.stop.d * e + over;
        if (k >= 1) { r.pos = slTarget(r); r.spin = false; sfx("tap"); slReachCheck(); }
      } else {
        r.v = Math.min(900, r.v + 60); r.pos -= r.v / 60;
        if (now >= r.auto + (SL.reach ? 1000 : 0) && SL.reels.slice(0, r.r).every(x => x.stop)) slStop(r);
      }
      r.pos = ((r.pos % r.L) + r.L) % r.L;
    }
    if (SL.reels.every(r => !r.spin)) slResult();
    // Smeargle paints while they turn: its pencil drawing grows as the reels stop
    SL.smg = Math.floor(sec * 5) % 2;
    if (SL.paint) SL.paint.k = (SL.reels.filter(r => !r.spin).length + .3) / 3.3;
  }
  g.setTransform(SL.N, 0, 0, SL.N, 0, 0); g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, SL.cw, SL.ch);
  // ---- the top screen ----
  const [tx, ty, tw, th] = Lo.tv;
  g.save(); g.beginPath(); g.rect(tx, ty, tw, th); g.clip();
  const bg = SL.bg, f2 = Math.floor(sec * (bg === "success" ? 6 : 2)) % 2;
  if (bg === "success" || bg === "starterBg") slPiece(M[bg][f2], Lo.bg[0], Lo.bg[1]);
  else {
    const tile = M[bg][bg === "main" ? (SL.st === "spin" ? 1 : 0) : f2], ox = bg === "main" ? 0 : Math.floor(sec * 24) % 256, oy = bg === "main" ? Math.floor(sec * 6) % 256 : 0;
    for (let x = -ox; x < 256; x += 256) for (let y = -oy; y < 192; y += 256) slPiece(tile, x, y);
  }
  // the Starter Bonus's cards: lit for the starters lined up this bonus
  const T = slotState(), bonusNow = SL.mode === "play" && (T.bonus || (SL.res && SL.res.bonus && SL.st !== "idle"));
  if (bonusNow) {
    const seen = SL.res && SL.res.bonus && SL.st !== "spin" ? SL.res.seen : T.bonus ? T.bonus.seen : [];
    M.cards.forEach((b, j) => { g.globalAlpha = seen.includes(j) ? 1 : .35; slPiece(b, Lo.cards[0] + Lo.cards[2] * j, Lo.cards[1]); }); g.globalAlpha = 1;
  }
  slPiece(M.canvas[0], Lo.canvas[0], Lo.canvas[1]);
  if (SL.paint) {   // the painting, revealed from the top as it goes
    const b = M.draw[SL.paint.i + (SL.paint.pencil && SL.paint.i < 10 ? 10 : 0)], h = Math.ceil(48 * clamp(SL.paint.k, 0, 1));
    if (h > 0) g.drawImage(SL.img, b[0], b[1], 48, h, Lo.draw[0], Lo.draw[1], 48, h);
  }
  slPiece(M.smeargle[SL.smg], Lo.smeargle[0], Lo.smeargle[1] + (SL.smg === 2 && SL.st === "result" ? -Math.abs(Math.sin(sec * 9)) * 3 : 0));
  if (SL.emote != null && now - SL.emoteT < 2200) slPiece(M.emote[SL.emote], Lo.emote[0], Lo.emote[1] - Math.min(4, (now - SL.emoteT) / 40));
  g.restore();
  slPiece(M.top[0], 0, 0);
  // the counters: ROUND and GET in the Starter Bonus (or the draw's rounds), the big pair the rounds left (or free spins)
  const R = SL.mode === "draw" ? [SL.draw.i, SL.draw.rounds.length] : bonusNow ? [SL.res && SL.res.bonus && SL.st !== "idle" ? SL.res.round : T.bonus ? T.bonus.r : 0, SLOT_BONUS.rounds] : null;
  if (R) { slDigits(Lo.round.slice(0, 2), R[0], false, 0, 0, true); slDigits(Lo.round.slice(2), R[1], false, 0, 0, true); }
  if (bonusNow) slDigits(Lo.get, SL.res && SL.res.bonus && SL.st !== "idle" ? SL.res.got : T.bonus ? T.bonus.got : 0, false, 0, 0, true);
  const big = R ? R[1] - R[0] : SL.mode === "play" && slotFree() ? slotFree() : null;
  if (big != null) slDigits(Lo.bigDigits, big, true);
  // ---- the bottom screen ----
  const [bx, by] = SL.land ? [256, 0] : [0, 192];
  const [rx, ry] = Lo.reels;
  for (const r of SL.reels) {
    const s = slStrip(r.r, r.bonus), x = bx + rx + r.r * Lo.reelGap, y = by + ry, p = Math.round(r.pos);
    g.save(); g.beginPath(); g.rect(x, y, 32, 72); g.clip();
    for (let o = -p; o < 72; o += r.L) g.drawImage(s, x, y + o);
    g.restore();
    slPiece(M.grid[r.r], x, y);
  }
  const lit = SL.st !== "idle" || slotState().replay || bonusNow ? 1 : 0, blink = SL.st === "result" && SL.lines.length && Math.floor(sec * 8) % 2;
  slPiece(M.bot[blink ? 0 : lit], bx, by);
  // the winning lines, over the reels in their lamps' colours
  if (SL.st === "result" && SL.lines.length && !SL.res.bonus) {
    g.lineWidth = 2; g.globalAlpha = .85;
    for (const w of SL.lines) {
      const L = SLOT_LINES[w.l], pts = w.sym === "B" ? [0] : [0, 1, 2];
      g.strokeStyle = SL_LINE_COL[w.l]; g.beginPath();
      pts.forEach((r, j) => { const x = bx + rx + r * Lo.reelGap + 16, y = by + ry + L[r] * 24 + 12; if (j) g.lineTo(x, y); else g.moveTo(x - 14, y); });
      if (pts.length === 1) { const y = by + ry + L[0] * 24 + 12; g.lineTo(bx + rx + 30, y); }
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  // CREDIT (counting up as the PAYOUT comes in) and PAYOUT
  if (SL.st === "result" && SL.mode === "play" && SL.res.pay) { const k = clamp((now - SL.winT) / 700, 0, 1); SL.pay = Math.round(SL.res.pay * k); }
  else if (SL.st === "spin") SL.pay = 0;
  slDigits(Lo.credit, SL.mode === "draw" ? null : SL.st === "result" ? SL.credit + SL.pay : SL.st === "idle" ? S.cert : SL.credit, false, bx, by);
  slDigits(Lo.payout, SL.mode === "draw" ? null : SL.pay || null, false, bx, by);
  // the banner and the keys under the reels
  const how = SL.mode === "play" ? slotPayWith() : null;
  const banner = SL.st === "spin" ? "Tap to stop the reels" : SL.st === "result" || SL.st === "done" ? SL.banner || slWinText() : SL.mode === "draw" ? "Champion Lottery: the draw"
    : how === "bonus" ? "Starter Bonus: tap to spin" : how === "replay" ? "Replay: tap to spin" : how === "fever" ? "Game Corner Fever: a free spin" : how ? `Tap to bet ${SLOT_BET} Coins` : "Not enough Coins";
  slText(banner, bx + Lo.banner[0], by + Lo.banner[1], true);
  for (const [x, y, t] of Lo.keys) slText(t, bx + x, by + y);
}
function slWinText() {
  const r = SL.res; if (!r) return "";
  if (r.bonus) return r.trio ? `All three starters: ${r.pay} Coins` : r.match ? `${SLOT_STARTERS[r.starters[0]]}: ${r.pay} Coins` : `Round ${r.round} of ${SLOT_BONUS.rounds}`;
  if (r.big) return `7-7-7: Starter Bonus`;
  return r.pay ? `You win ${r.pay} Coins${r.replay ? " and a Replay" : ""}` : r.replay ? "Replay" : "No win";
}
// the Champion Lottery's last draw, round by round (one for each prize you won, or one with none)
function slotsDraw() {
  const L = S.lucky.lotShow; if (!L) return;
  SL.banner = "";
  slotsOpen("draw", { t: L.t, won: L.won, rounds: L.won.length ? L.won.slice() : [null], i: 0 });
}
function slotOddsModal() {
  const M = SL.m, pic = s => { const b = M.panel[SL_PANEL[s]]; return `<i class="slpanel" style="background-position:-${b[0]}px -${b[1]}px"></i>`; };
  openModal(`<div class="stack"><div class="eyebrow">Celadon Game Corner</div><h2>Odds</h2>
    <div class="sltable">${["7", "P", "M", "R", "B"].map(s => `<div class="lgoal"><span>${s === "B" ? pic("B") : pic(s) + pic(s) + pic(s)}</span><span class="small">${s === "7" ? `${SLOT_PAY[7]} Coins + Starter Bonus` : s === "R" ? "Free spin" : s === "B" ? `${SLOT_BERRY} Coins (left reel)` : `${SLOT_PAY[s]} Coins`}</span><span class="tiny dim">${oneIn(slotOdds().in(s))}</span></div>`).join("")}</div>
    <p class="tiny dim">${slotOddsText()}</p><button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
  const st = document.createElement("style"); st.textContent = `.slpanel{background-image:url(${SL.img.src})}`; $("#modal .mbox").appendChild(st);
}
// the machine is still (the Demo waits for this before its next tap)
async function slotsIdle(ms = 9000) { const t = Date.now(); while (SL.on && SL.st !== "idle" && SL.st !== "done" && Date.now() - t < ms) await new Promise(r => setTimeout(r, 60)); }
// the Game Boy's buttons while it's open
function gbSlots(k) {
  if (k === "a" || k === "down") return slotPress();
  if (k === "select" && SL.mode === "play") return slotOddsModal();
  if (k === "b" || k === "start") return slotsClose();
}
const SLOT_ACT = {
  slotsOpen: () => { if (!featOn("slots")) return; sfx("tap"); slotsOpen(); },
  slotPress: () => slotPress(),
  slotOdds: () => { sfx("tap"); slotOddsModal(); },
  slotsClose: () => { sfx("tap"); slotsClose(); },
  lotWatch: () => { sfx("tap"); slotsDraw(); },
};
