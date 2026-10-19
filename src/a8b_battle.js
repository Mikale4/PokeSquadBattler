
//  BATTLE DIRECTOR — battle text, Poké Ball send-outs, Pokémon Showdown's move animations (a8e_showdown_scene.js), camera, HUD
//  BATTLE DIRECTOR — battle text, Poké Ball send-outs, move effects by type, camera, HUD
//  Three Pokémon a side on the field, up to three more on each bench: when one faints you choose who comes in (the
//  bench picker, also on Auto), and on your turn you can switch instead of using a move.
// =====================================================================
const VU = uid => BT.vus.get(uid);
const avg = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
BT.balls = [];

// ---------- camera shots ----------
const aspect = () => Math.min(1.7, BT.W / BT.H);
const fitDist = (extent, minD, fov = .62) => Math.max(minD, extent / (2 * Math.tan(fov / 2) * aspect()));
function focusShot(vu) {
  // from the side, so the other team never stands between the camera and the Pokémon
  return { tx: vu.pos.x + vu.dir * 8, ty: 52 * vu.bs, tz: vu.pos.z, yaw: -.25 + vu.dir * .25, pitch: .18, dist: fitDist(240, 620 * vu.bs), fov: .62, roll: -vu.dir * .02 };
}
function impactShot(a, t) {
  const d = Math.hypot(a.pos.x - t.pos.x, a.pos.z - t.pos.z);
  return { tx: (a.pos.x + t.pos.x) / 2, ty: 50, tz: (a.pos.z + t.pos.z) / 2, yaw: lerp(BT.home.yaw, -.2, .5) - a.dir * .2, pitch: .2, dist: fitDist(d + 260, 460), fov: .62, roll: 0 };
}
function aoeShot(ts, a) {
  return { tx: avg(ts.map(t => t.pos.x)), ty: 46, tz: avg(ts.map(t => t.pos.z)), yaw: BT.home.yaw - a.dir * .22, pitch: .24, dist: fitDist(520, 600, .66), fov: .66, roll: 0 };
}
function nudgeShot(px, pz, k, zoom) {
  const h = BT.home;
  return { ...h, tx: lerp(h.tx, px, k), tz: lerp(h.tz, pz, k), dist: h.dist * (1 - (1 - zoom) * .4) };
}
function twoShot(a, t) {
  if (!t || t === a) return nudgeShot(a.pos.x, a.pos.z, .12, .95);
  return { ...nudgeShot((a.pos.x + t.pos.x) / 2, (a.pos.z + t.pos.z) / 2, .22, .9), yaw: BT.home.yaw + a.dir * .05 };
}

// ---------- movement ----------
async function moveTo(vu, x, z, speedMul = 1) {
  const sx = vu.pos.x, sz = vu.pos.z, d = Math.hypot(x - sx, z - sz);
  if (d < 4) return;
  setPose(vu, "run", 0, false);
  await btween(clamp(d * .9, 150, 420) / speedMul, k => { vu.pos.x = lerp(sx, x, k); vu.pos.z = lerp(sz, z, k); vu.y = Math.sin(k * Math.PI) * 14; });
  vu.y = 0; setPose(vu, "idle");
}
async function engage(a, t) {
  const x = t.pos.x - a.dir * 75 * t.bs, z = t.pos.z + (a.pos.z > t.pos.z ? 6 : -6);
  if (Math.hypot(a.pos.x - x, a.pos.z - z) < 12) return;
  await moveTo(a, x, z, 1.2);
}
async function returnHome() {
  const list = [...BT.vus.values()].filter(vu => !vu.dead && (Math.hypot(vu.pos.x - vu.home.x, vu.pos.z - vu.home.z) > 3 || vu.y > 1));
  await Promise.all(list.map(async vu => {
    if (vu.y > 1) { const y0 = vu.y; await btween(160, k => { vu.y = y0 * (1 - k); }); }
    await moveTo(vu, vu.home.x, vu.home.z, 1.3);
  }));
}

// ---------- fx helpers ----------
const tcol = t => TC[t] || "#ffffff";
// the synthesized whooshes and zaps stand in only when the move being used has no sound of its own (moveSound, a8c_sfx.js)
const mfx = k => { if (!(BT.act && BT.act.snd)) sfx(k); };
// Poké Balls in flight (send-outs and catches)
function drawBalls(K) {
  const g = BT.g;
  BT.balls = BT.balls.filter(b => BT.clock - b.t0 < b.dur + (b.hold || 0));
  for (const b of BT.balls) {
    const k = clamp((BT.clock - b.t0) / b.dur, 0, 1), p = v3.lerp(b.from, b.to, k); p[1] += Math.sin(k * Math.PI) * b.h;
    const s = proj(K, ...p); if (!s) continue;
    drawBall(g, s[0], s[1], 7 * s[2] + 3, b.kind, k * 14, k >= 1 ? 1 : 0);
  }
}
async function throwBall(vu, kind = "poke", vol = .45) {
  const tr = BT.tr && BT.tr[vu.team];
  const to = [vu.home.x, 30, vu.home.z], from = tr && tr.x != null ? [tr.x, tr.h * .62, tr.z] : vu.team === "A" ? [vu.home.x - 260, 120, vu.home.z - 160] : [vu.home.x + 300, 160, vu.home.z + 220];
  if (tr) tr.throwT = BT.clock;
  BT.balls.push({ from, to, t0: BT.clock, dur: 420, h: 90, kind, hold: 120 });
  await bwait(440);
  const burst = BALL_BURST[kind] || "#ffffff";   // each ball sparkles in its own colour
  BT.rings.push({ x: vu.home.x, z: vu.home.z, r0: 6, r1: 70, t0: BT.clock, dur: 420, col: burst, w: 4 });
  addParts([vu.home.x, 30, vu.home.z], 18, { col: burst, speed: 160, life: 420, size: 2.6, g: 60 });
  vu.spawnT = BT.clock; sfx("warp"); cry(vu.u.key, { vol });
}
// the S3 cut-in: a horizontal strip (tools/pack_cutins.py) across the screen in the move's type colour, the same for both sides
const CUTIN_COL = { Normal: "grey", Fire: "orange", Water: "blue", Electric: "gold", Grass: "mint", Ice: "sky", Fighting: "red", Poison: "purple", Ground: "brown",
  Flying: "sky", Psychic: "purple", Bug: "lime", Rock: "brown", Ghost: "purple", Dragon: "blue", Dark: "grey", Steel: "steel", Fairy: "purple" };
function cutIn(vu, skillName, type) {
  const wrap = $(".bwrap"); if (!wrap || S && !setv("cutins")) return;   // (Trainer Card, Options: S3 cut-ins)
  const d = (950 / BT.speed / 1000).toFixed(2) + "s";
  const el = document.createElement("div"), strip = RES_DATA.cutin && RES_DATA.cutin[CUTIN_COL[type] || "grey"];
  el.className = "cutin"; el.style.setProperty("--ec", tcol(type));
  el.innerHTML = `${strip ? `<div class="band strip" style="animation-duration:${d};background-image:url(${resPng(strip)})"></div>` : `<div class="band" style="animation-duration:${d}"></div><div class="lines" style="animation-duration:${d}"></div>`}
    <img class="px" src="${sprFront(vu.u.spr || vu.u.key)}" alt="" style="animation-duration:${d};${vu.team === "E" ? "left:auto;right:-6%" : "transform:scaleX(-1)"}">
    <div class="sk" style="animation-duration:${d}"><small>${esc(vu.u.n)} · ${esc(type)}</small><b>${esc(skillName)}</b></div>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 1000 / BT.speed + 60);
}

// ---------- battle text ----------
function say(t, big) {
  const b = $("#bMsg"); if (!b) return;
  b.textContent = t; b.classList.toggle("big", !!big); b.classList.add("show");
  b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
}
const msgWait = t => clamp(t.length * 16, 320, 900);

// ---------- playback ----------
async function gate() { while (BT.paused && BT.on) await new Promise(r => setTimeout(r, 120)); }
async function play(evs) {
  for (let i = 0; i < evs.length; i++) { if (BT.quit || !BT.on) return; await gate(); await handle(evs[i]); }
}
function updateStrip() {
  const el = $("#bStrip"); if (!el || !BT.B) return;
  el.innerHTML = BT.B.predictOrder(7).map(uid => { const u = BT.B.byId(uid); return `<img class="px ${u.team === "E" ? "en" : ""}" src="${sprFront(u.spr || u.key)}" alt="">`; }).join("");
}
async function handle(e) {
  const vu = e.u != null ? VU(e.u) : null;
  switch (e.k) {
    case "msg": {
      say(e.t, e.big);
      if (!e.big) await bwait(msgWait(e.t)); else await bwait(260);
      break;
    }
    case "turn": {
      BT.active = vu;
      if (e.tms) for (const [uid, tm] of e.tms) { const v = VU(uid); if (v) v.tmT = tm; }
      if (vu) { vu.tmT = 0; camTo(twoShot(vu, null), 1.6); }
      updateStrip();
      if (e.rd) fieldRow(e.rd, e.fx || []);
      if (BT.cfg.turnLimit && $("#bLimit")) $("#bLimit").innerHTML = `<b>${Math.max(0, BT.cfg.turnLimit - BT.B.allyTurns + (vu && vu.team === "A" ? 1 : 0))}</b> turns left · <b>${fmt(BT.B.damageBy("A"))}</b> damage`;
      await bwait(120);
      break;
    }
    case "clear": BT.vus.delete(e.u); break;
    case "terrain": {
      // (the terrain, Trick Room and the weather are on the field row with their turns left: fieldRow)
      fieldSet("ter", e.tr ? "trickroom" : e.t || null);
      await bwait(300); break;
    }
    case "weather": {
      fieldSet("wx", e.w || null);
      await bwait(300); break;
    }
    case "recall": {
      // back into its ball: a red beam to the trainer and the Pokémon shrinks away (Roar and Whirlwind blow it back)
      if (!vu) break;
      const tr = BT.tr && BT.tr[vu.team];
      vu.recallT = BT.clock; if (!battleSound("recall")) sfx("warp");
      if (tr && tr.x != null && !e.forced) BT.bolts.push({ from: chestW(vu), to: [tr.x, tr.h * .62, tr.z], t0: BT.clock, dur: 320, col: "#ff4b4b", len: .9, w: 1.2 });
      await bwait(460);
      BT.vus.delete(e.u); if (BT.target === vu) BT.target = null;
      break;
    }
    case "sendin": {
      const u = BT.B.byId(e.u); if (!u) break;
      for (const [uid, v] of BT.vus) if (v.team === e.team && v.u.slot === e.slot && uid !== e.u && (v.dead || v.gone)) BT.vus.delete(uid);
      const v = addVU(u, true);
      camTo({ ...nudgeShot(v.home.x, v.home.z, .3, .9) }, 2.4);
      if (e.team === "E" && BT.B.wild) { v.spawnT = BT.clock + 100; cry(u.key, { at: .1, vol: .45 }); await bwait(620); }
      else { await throwBall(v, e.team === "A" ? "poke" : BT.cfg.ball || "poke", .45); await bwait(360); }
      updateStrip();
      break;
    }
    case "act": {
      // the move's own sound (multi-strike moves play one strike per hit, in doAttack)
      BT.act = e; e.snd = hasHitSound(e.key) || moveSound(e.key);
      if (!vu) break;
      const tv = e.t != null ? VU(e.t) : null;
      if (e.quiet) break;
      if (e.s3) {
        BT.letterboxT = 1; mfx("special");
        cutIn(vu, e.name, e.type);
        camTo(focusShot(vu), 5.5);
        setPose(vu, "cast", 800);
        psOther("chargestatus", vu, vu);
        await bwait(900);
      } else if (e.slot === 2) {
        camTo(tv && tv !== vu ? twoShot(vu, tv) : focusShot(vu), 3.2);
        await bwait(200);
      } else { camTo(twoShot(vu, tv), 2.4); await bwait(80); }
      if (e.anim === "buff" || e.anim === "heal" || e.anim === "status") {
        mfx(e.anim === "heal" ? "heal" : e.anim === "buff" ? "special" : "arts");
        const group = e.tgt === "team" || e.tgt === "field" ? [...BT.vus.values()].filter(v => v.team === vu.team && !v.dead) : [];
        if (group.length > 1) camTo({ ...BT.home, tx: avg(group.map(v => v.pos.x)), dist: fitDist(420, 460), yaw: BT.home.yaw + vu.dir * .2, pitch: .2 }, 3);
        await psMove(e.key, vu, tv || vu);
      }
      break;
    }
    case "atk": await doAttack(e); break;
    // Fly, Bounce, Dig, Dive, Phantom Force: the charge (Showdown's prepare animation), then out of sight until the move lands
    case "semi": {
      if (!vu) break;
      if (e.on) { const E = psEntry(e.key); if (E.prepareAnim) await psRun(E.prepareAnim, vu, vu); vu.semi = true; }
      else vu.semi = false;
      break;
    }
    case "dmg": {
      if (!vu) break;
      vu.hp = e.hp; vu.sh = e.sh;
      if (e.sub) { floatText(e.u, "SUB", "prot"); await bwait(60); break; }
      floatText(e.u, fmtFull(e.n), e.crit ? "crit" : e.dot ? "dot" : e.eff > 1 ? "crit" : e.eff < 1 ? "prot" : "dmg");
      if (e.dot) { psResidual(vu); setPose(vu, "hit", 300); await bwait(220); break; }
      vu.flash = BT.clock + 330;
      if (vu.hp > 0) setPose(vu, "hit", 420);
      if (e.crit || e.eff > 1) { BT.shake = Math.max(BT.shake, e.eff > 1 ? 8 : 6); sfx("crit"); } else mfx("hit");
      await bwait(60);
      break;
    }
    case "heal": {
      if (!vu) break;
      vu.hp = e.hp; vu.sh = e.sh;
      floatText(e.u, "+" + fmtFull(e.n), "heal");
      if (!BT.act || BT.act.anim !== "heal") battleSound("heal");   // Leftovers, Sitrus Berry, drain moves
      if (!BT.act || BT.act.anim !== "heal") psOther("heal", vu, vu);
      await bwait(60);
      break;
    }
    case "txt": if (vu) { floatText(e.u, e.s, e.c); if (/[▲▼]/.test(e.s)) battleSound(e.c === "buff" ? "up" : "down"); await bwait(50); } break;
    case "fx": if (vu) { vu.effs = e.list; vu.sh = e.sh; vu.st = e.st; vu.stages = e.stages; } break;
    case "side": if (BT.field) BT.field.hz[e.team] = e.hz; break;
    case "status": if (vu) { psStatus(e.s, vu); if (!battleSound(e.s)) sfx("zap"); await bwait(200); } break;
    case "aura": if (vu) { const group = e.team ? [...BT.vus.values()].filter(v => v.team === vu.team && !v.dead) : [vu]; for (const v of group) psOther("selfstatus", v, v); await bwait(300); } break;
    case "transform": if (vu) { vu.flash = BT.clock + 400; if (e.hp != null) vu.hp = e.hp; psOther("shiny", vu, vu); sfx("warp"); vu.spawnT = BT.clock; await bwait(420); updateStrip(); } break;
    case "tm": if (vu) { vu.tmT = e.tm; } updateStrip(); break;
    case "death": {
      if (!vu) break;
      vu.dead = true; vu.deathT = BT.clock; vu.hp = 0; vu.sh = 0; vu.effs = []; vu.st = null; vu.stages = {};
      cry(vu.u.key, { rate: .8 }); // the fainting cry, pitched down as in the games since Black and White
      battleSound("faint");
      BT.shake = Math.max(BT.shake, 4);
      if (BT.target === vu) BT.target = null;
      updateStrip();
      await bwait(260);
      break;
    }
    case "revive": {
      if (!vu) break;
      vu.dead = false; vu.gone = false; vu.hp = e.hp; vu.lag = e.hp; vu.sh = 0; vu.effs = [];
      vu.pos.x = vu.home.x; vu.pos.z = vu.home.z; vu.spawnT = BT.clock;
      psOther("heal", vu, vu); floatText(e.u, "REVIVED", "buff");
      updateStrip(); await bwait(500);
      break;
    }
    case "end": {
      if (vu && vu.semi && BT.act && BT.act.land) vu.semi = false;   // (a landing that never struck: back in sight)
      await returnHome();
      if (BT.letterboxT) { BT.letterboxT = 0; }
      camHome(2.4); BT.act = null;
      await bwait(110);
      break;
    }
  }
}
// an attack: Showdown's animation for the move (its charge first, if it has one), aimed at the first target (beside it
// on a miss, as on Showdown); a multi-strike move's later strikes show Showdown's hit mark
async function doAttack(e) {
  const a = VU(e.a), ts = e.t.map(VU).filter(v => v && !v.dead);
  if (!a || a.dead || !ts.length) return;
  const main = ts[0], sp = e.sp, first = !e.h, key = BT.act ? BT.act.key : "struggle";
  if (BT.act && hasHitSound(BT.act.key) && !e.miss) moveSound(BT.act.key, true);   // Fury Attack, Pin Missile...: a sound per strike
  if (first) {
    camTo(ts.length > 1 ? aoeShot(ts, a) : sp ? impactShot(a, main) : twoShot(a, main), sp ? 4 : 2.4);
    const landing = a.semi; a.semi = false;   // (a move that lands after a turn out of reach: no second charge)
    await psMove(key, a, main, { miss: e.miss, noPrep: landing });
  } else {
    if (!e.miss) psOther("hitmark", main, main);
    await bwait(200);
  }
}

// ---------- HUD ----------
function moveBtn(u, sk, tgt) {
  const B = BT.B, ok = B.usable(u, sk.slot), cd = u.cool[sk.slot] || 0;
  let tag = "";
  if (tgt && sk.target === "enemy" && sk.cat !== "X") {
    const e = B.effOn(u, tgt, sk);
    tag = e === 0 ? '<span class="eff no">No effect</span>' : e > 1 ? `<span class="eff se">Super effective</span>` : e < 1 ? `<span class="eff nve">Not very effective</span>` : "";
  }
  const hl = BT.gbUsed && u.skills.indexOf(sk) === Math.min(GB.hl, u.skills.length - 1);
  return `<button class="mvbtn ${ok ? "" : "off"} ${sk.slot === 3 && ok ? "ready" : ""} ${hl ? "hl" : ""}" data-s="${sk.slot}" style="--tc:${tcol(sk.type)}" aria-label="${esc(sk.name)}">
    <b>${esc(sk.name)}</b><span class="mvmeta">${typeChip(sk.type)}${catChip(sk.cat)}${tag}</span>
    ${!ok ? `<span class="cdv">${cd ? cd + " turn" + (cd > 1 ? "s" : "") : "Disabled"}</span>` : ""}</button>`;
}
// Link Battles: each move has a time limit; when it runs out, Auto picks the move
function turnTimer(res, secs) {
  const c = $("#bCtl"); if (!c) return;
  const el = document.createElement("div"); el.className = "bturn"; el.innerHTML = "<i></i><span></span>"; c.prepend(el);
  let left = secs * 1000, last = performance.now();
  const step = now => {
    if (BT.inputRes !== res || !BT.on) return;
    if (!BT.paused) left -= now - last; last = now;
    el.firstChild.style.width = clamp(left / (secs * 1000), 0, 1) * 100 + "%"; el.lastChild.textContent = Math.ceil(Math.max(0, left) / 1000) + "s";
    if (left <= 0) { const rep = BT.benchMode === "replace"; BT.inputRes = null; hideControls(rep ? "Time's up! Auto picks who comes in" : "Time's up! Auto picks the move"); res("auto"); return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function hideControls(txt = "") { BT.picking = false; BT.allyPick = null; BT.benchMode = null; BT.benchPick = null; const c = $("#bCtl"); if (c) { c.innerHTML = txt ? `<div class="bwait">${txt}</div>` : ""; c.classList.remove("on"); } }
function showControls(u) {
  const B = BT.B;
  BT.picking = true; BT.allyPick = null;
  const valid = B.targetable(u);
  if (!BT.target || BT.target.dead || !valid.includes(BT.target.u)) {
    const best = valid.slice().sort((a, b) => a.hp / a.max.hp - b.hp / b.max.hp)[0];
    BT.target = best ? VU(best.uid) : null;
  }
  const c = $("#bCtl"); c.classList.add("on");
  const choose = slot => {
    const sk = u.skills.find(s => s.slot === slot), btn = $(`.mvbtn[data-s="${slot}"]`, c);
    if (!sk) return;
    if (!B.usable(u, slot)) { sfx("tap"); popup(skillPop(u, sk)); return; }
    if (!BT.inputRes) return;
    sfx("tap");
    if (sk.target === "ally_single") {
      BT.allyPick = slot; $$(".mvbtn", c).forEach(b => b.classList.toggle("picking", b === btn));
      const h = $("#bHint"); if (h) h.textContent = "Tap one of your Pokémon to use " + sk.name;
      return;
    }
    const r = BT.inputRes; BT.inputRes = null; hideControls();
    r({ slot, t: sk.target === "enemy" && BT.target ? BT.target.u : null });
  };
  BT.chooseMove = choose;
  const bench = B.benchOf(u.team), canSw = B.canSwitch(u);
  const draw = () => {
    BT.benchMode = null;
    const hlSw = BT.gbUsed && GB.hl >= u.skills.length;
    c.innerHTML = `<div class="bwho"><img class="bpt px" src="${sprFront(u.spr || u.key)}" alt=""><div class="bwn"><b>What will ${esc(u.n)} do?</b><small id="bHint">Tap an opponent to aim${BT.target ? ` · aiming at ${esc(BT.target.u.n)}` : ""} · hold a move for details</small></div>
        ${bench.length ? `<button class="bswbtn ${canSw ? "" : "off"} ${hlSw ? "hl" : ""}" id="bSw" aria-label="Switch Pokémon">${IC.pokeball}<b>Switch</b><small>${bench.length} left</small></button>` : ""}</div>
      <div class="mvgrid">${u.skills.map(sk => moveBtn(u, sk, BT.target && BT.target.u)).join("")}</div>`;
    for (const btn of $$(".mvbtn", c)) {
      const slot = +btn.dataset.s, sk = u.skills.find(s => s.slot === slot);
      press(btn, () => choose(slot), () => popup(skillPop(u, sk)));
    }
    const sw = $("#bSw", c);
    if (sw) sw.onclick = () => {
      sfx("tap");
      if (!canSw) { popup(`<h3>${esc(u.n)} can't be switched out!</h3><p class="small dim" style="margin-top:6px">It's trapped by Bind or Wrap until that wears off.</p>`); return; }
      showBench(c, bench, `Switch ${u.n} with…`, "Tap who comes in · hold for details", uid => {
        if (!BT.inputRes) return;
        const r = BT.inputRes; BT.inputRes = null; hideControls(); r({ sw: uid });
      }, draw);
    };
  };
  BT.switchOpen = () => { const sw = $("#bSw", c); if (sw) sw.click(); };
  BT.redrawControls = draw;
  draw();
}
// the bench: one card per Pokémon that can still battle (HP, status, types, and how it matches up against the opponents
// on the field), for switching and for choosing who comes in after a faint. back: a Back button (switching only).
function showBench(c, list, title, hint, onPick, back) {
  const B = BT.B;
  BT.benchMode = back ? "switch" : "replace"; BT.benchPick = onPick;
  const foes = list.length ? B.units.filter(x => x.alive && x.team !== list[0].team) : [];
  const edge = x => {
    // its best type matchup against the opponents on the field, from its moves and their types
    let best = 0, worst = 1;
    for (const f of foes) { for (const s of x.skills) if (s.cat !== "X" && s.pow > 0) best = Math.max(best, B.effOn(x, f, s)); for (const s of f.skills) if (s.cat !== "X" && s.pow > 0) worst = Math.max(worst, B.effOn(f, x, s)); }
    return best > 1 && worst <= 1 ? '<span class="eff se">Good matchup</span>' : worst > 1 && best <= 1 ? '<span class="eff no">Risky matchup</span>' : "";
  };
  const gi = BT.gbUsed ? Math.min(GB.hl, list.length - 1) : -1;
  c.innerHTML = `<div class="bwho"><div class="bwn"><b>${esc(title)}</b><small>${esc(hint)}</small></div>${back ? `<button class="bswbtn" id="bBack" aria-label="Back to moves"><b>Back</b></button>` : ""}</div>
    <div class="benchgrid">${list.map((x, i) => { const f = clamp(x.hp / x.max.hp, 0, 1); return `<button class="bnc ${i === gi ? "hl" : ""}" data-u="${x.uid}" aria-label="${esc(x.n)}">
      <img class="px" src="${sprFront(x.spr || x.key)}" alt=""><span class="bnn"><b>${esc(x.n)}</b><small>Lv ${x.lvl}${x.status ? ` · <i style="color:${FX[x.status].c}">${FX[x.status].s}</i>` : ""}</small>
      <i class="bnhp"><i style="width:${f * 100}%;background:${f > .5 ? "#3ddc84" : f > .2 ? "#f2c14e" : "#ff5a4a"}"></i></i><span class="mvmeta">${typeChips(x.types)}${edge(x)}</span></span></button>`; }).join("")}</div>`;
  c.classList.add("on");
  for (const b of $$(".bnc", c)) { const x = list.find(y => y.uid === +b.dataset.u); press(b, () => { sfx("tap"); onPick(x.uid); }, () => popup(unitPop(x))); }
  const bk = $("#bBack", c); if (bk) bk.onclick = () => { sfx("tap"); GB.hl = 0; back(); };
  BT.redrawBench = () => showBench(c, list, title, hint, onPick, back);
}
// after a faint: you choose who comes in (on Auto too). Link Battles keep their move timer: when it runs out, the best
// matchup goes in.
function pickReplacement() {
  const B = BT.B, list = B.benchOf("A");
  return new Promise(res => {
    BT.inputRes = res; BT.picking = false; GB.hl = 0;
    const piv = B.needPivot && B.byId(B.needPivot.uid);
    showBench($("#bCtl"), list, piv ? `${piv.n} is switching out` : "Choose the next Pokémon", piv ? "Choose who comes in · hold for details" : `${B.wild ? "The wild Pokémon" : B.trainer || "Your opponent"} is waiting · hold for details`, uid => {
      if (BT.inputRes !== res) return;
      BT.inputRes = null; hideControls(); res(uid);
    }, null);
    if (BT.cfg.timer) turnTimer(res, BT.cfg.timer);
  });
}
function skillPop(u, sk) {
  const cd = u.cool[sk.slot] || 0, rank = u.sk[sk.slot - 1] || 1;
  return `<div class="eyebrow">S${sk.slot} · Mastery ${RANK[rank]}${sk.cd ? ` · Cooldown ${sk.cd}` : ""}</div><h3 style="margin:4px 0 6px">${esc(sk.name)}</h3>
    <div class="row" style="gap:6px;margin-bottom:6px">${typeChip(sk.type)}${catChip(sk.cat)}${sk.pow ? `<span class="tag">Power ${sk.range || (sk.weight || sk.vary ? "varies" : sk.pow)}</span>` : ""}<span class="tag">Accuracy ${sk.acc ? sk.acc + "%" : "—"}</span></div>
    <p class="small">${esc(sk.desc)}</p>${cd ? `<p class="small" style="margin-top:6px;color:var(--bad)">Ready in ${cd} turn${cd > 1 ? "s" : ""}.</p>` : ""}`;
}
function unitPop(u) {
  const B = BT.B, e = B.effStat, ab = u.passives[0];
  const ss = B.shownStages ? B.shownStages(u) : u.stages;   // (the stages moves made plus the fixed ones: items, Abilities, the field, a status)
  const stg = s => ss[s] ? ` <span class="${ss[s] > 0 ? "good" : "bad"}">(${ss[s] > 0 ? "+" : ""}${ss[s]})</span>` : "";
  return `<div class="row"><img class="bpt px" src="${sprFront(u.spr || u.key)}" alt=""><div><div class="eyebrow">${u.team === "A" ? "Your Pokémon" : B.wild ? "Wild Pokémon" : "Opposing Pokémon"}${u.boss ? " · Boss" : ""}</div><h3>${esc(u.n)} <span class="small dim">Lv ${u.lvl}</span></h3>
    <div class="row" style="gap:4px;margin-top:3px">${typeChips(u.types)}</div></div></div>
    <div class="statgrid" style="margin-top:10px">
      <div><span>HP</span><b>${fmtFull(u.hp)} / ${fmtFull(u.max.hp)}</b></div><div><span>Status</span><b>${u.status ? FX[u.status].n : "Healthy"}</b></div>
      <div><span>Attack</span><b>${fmtFull(e.atk(u))}${stg("atk")}</b></div><div><span>Defense</span><b>${fmtFull(e.def(u))}${stg("def")}</b></div>
      <div><span>Sp. Atk</span><b>${fmtFull(e.spa(u))}${stg("spa")}</b></div><div><span>Sp. Def</span><b>${fmtFull(e.sdf(u))}${stg("sdf")}</b></div>
      <div><span>Speed</span><b>${fmtFull(e.spe(u))}${stg("spe")}</b></div><div><span>Acc / Eva</span><b>${ss.acc || 0} / ${ss.eva || 0}</b></div>
    </div>
    ${u.eff.length ? `<div class="stack" style="gap:4px;margin-top:10px">${u.eff.map(x => `<div class="small"><span class="tag" style="background:${FX[x.id].c};color:#fff">${FX[x.id].n}</span> <span class="dim">${FX[x.id].d}${x.turns < 90 ? " · " + x.turns + " turns" : ""}</span></div>`).join("")}</div>` : ""}
    ${ab ? `<p class="small" style="margin-top:8px"><b>Ability · ${esc(ab.name)}:</b> <span class="dim">${esc(ab.text)}</span></p>` : ""}
    ${u.held ? `<p class="small" style="margin-top:4px"><b>Held item · ${esc(HELD[u.held].n)}:</b> <span class="dim">${esc(HELD[u.held].d)}</span></p>` : ""}
    <p class="small" style="margin-top:4px"><b>Weak to:</b> <span class="dim">${defWeak(u.types).join(", ") || "nothing"}</span></p>`;
}
function popup(html) {
  const p = $("#bPop"); if (!p) return;
  p.innerHTML = `<div class="bpopbox">${html}<button class="btn ghost sm wide" style="margin-top:12px" id="bPopX">Close</button></div>`;
  p.hidden = false;
  $("#bPopX").onclick = () => { p.hidden = true; };
  p.onclick = ev => { if (ev.target === p) p.hidden = true; };
}
function press(el, onTap, onHold) {
  let timer = 0, held = false, sx = 0, sy = 0;
  el.addEventListener("pointerdown", ev => { held = false; sx = ev.clientX; sy = ev.clientY; clearTimeout(timer); timer = setTimeout(() => { held = true; onHold && onHold(ev); }, 430); });
  el.addEventListener("pointermove", ev => { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 12) clearTimeout(timer); });
  el.addEventListener("pointerup", ev => { clearTimeout(timer); if (!held) onTap(ev); });
  el.addEventListener("pointercancel", () => clearTimeout(timer));
  el.addEventListener("contextmenu", ev => ev.preventDefault());
}
function unitAt(x, y) {
  let best = null, bd = 1e9;
  for (const vu of BT.vus.values()) {
    if (!vu.scr || vu.dead || vu.gone) continue;
    const s = vu.scr.s, h = ((vu.out && vu.out.h) || 80) * s, half = Math.max(26, ((vu.out && vu.out.w) || 60) * .5) * s;
    if (x > vu.scr.x - half - 6 && x < vu.scr.x + half + 6 && y > vu.scr.y - h - 16 && y < vu.scr.y + 10) {
      const d = Math.abs(x - vu.scr.x) + Math.abs(y - (vu.scr.y - h / 2)) * .5;
      if (d < bd) { bd = d; best = vu; }
    }
  }
  return best;
}

// ---------- lifecycle ----------
function addVU(u, hidden) {
  const slot = SLOTS[Math.max(0, u.slot) % SLOTS.length], dir = u.team === "A" ? 1 : -1;
  const vu = { uid: u.uid, u, team: u.team, dir, face: dir, home: { x: -dir * slot[0], z: slot[1] }, pos: { x: -dir * slot[0], z: slot[1] }, y: 0,
    bs: u.boss ? 1.25 : 1, pose: { name: "idle", t0: 0, dur: 0 }, ph: R() * 6, hp: u.hp, lag: u.hp, sh: u.shield, tm: u.atb, tmT: u.atb,
    effs: [], st: u.status, stages: {}, dead: false, gone: false, trail: [], spawnT: hidden ? 1e15 : null, out: null, back: u.team === "A", want: dir };
  BT.vus.set(u.uid, vu);
  return vu;
}
function sizeCanvas() {
  const cv = BT.cv; if (!cv) return;
  const p = cv.parentElement;   // (its own size: the Gameboy and Switch shapes scale the whole shell on screen)
  BT.dpr = pxRatio();
  BT.W = Math.max(200, p.clientWidth); BT.H = Math.max(200, p.clientHeight);
  cv.width = Math.round(BT.W * BT.dpr); cv.height = Math.round(BT.H * BT.dpr);
  cv.style.width = BT.W + "px"; cv.style.height = BT.H + "px";
  const old = BT.home;
  BT.home = fitHome(); placeTrainers();
  if (!old) { BT.cam = { ...BT.home }; BT.camT = { ...BT.home }; }
  else if (!BT.act) Object.assign(BT.camT, BT.home);
}
// the turn counter and each timed field effect's turns left (the engine's fieldTimers), in a row under the turn order: the whole
// field's one by one, each side's together (yours marked blue, the opposing side's red), so it stays a line or two; a tap on one says
// what it is and how long it has left (the owner's rule)
const FIELD_N = { trickRoom: "Trick Room", gravity: "Gravity", wonderRoom: "Wonder Room", magicRoom: "Magic Room", mudSport: "Mud Sport", waterSport: "Water Sport", ionDeluge: "Ion Deluge",
  uproar: "Uproar", tailwind: "Tailwind", REFLECT: "Reflect", LSCREEN: "Light Screen", VEIL: "Aurora Veil", SAFEGUARD: "Safeguard", MIST: "Mist", LUCKY: "Lucky Chant" };
const WX_SHORT = { sun: "Sun", rain: "Rain", sand: "Sandstorm", hail: "Snow", snow: "Snow" };
function fieldRow(rd, fx) {
  const el = $("#bField"); if (!el) return;
  const W = f => WEATHER[f.id.slice(3)] || { n: f.id.slice(3), ic: "" };
  const nm = f => f.id.startsWith("wx:") ? WX_SHORT[f.id.slice(3)] || W(f).n : f.id.startsWith("ter:") ? (TERRAIN[f.id.slice(4)] || {}).n || f.id.slice(4) : FIELD_N[f.id] || f.id;
  const long = f => f.id.startsWith("wx:") ? W(f).n : nm(f), left = f => f.n == null ? "it stays all battle" : f.n === 1 ? "this is its last turn" : `${f.n} more turns`;
  const num = f => f.n != null ? ` <b>${f.n}</b>` : "";
  const chips = fx.filter(f => !f.side).map(f => `<span class="bfc" data-tip="${esc(long(f) + ": " + left(f))}">${f.id.startsWith("wx:") ? W(f).ic + " " : ""}${esc(nm(f))}${num(f)}</span>`);
  for (const tm of ["A", "E"]) { const mine = fx.filter(f => f.side === tm); if (!mine.length) continue;
    chips.push(`<span class="bfc s${tm}" data-tip="${esc((tm === "A" ? "Your team: " : "The opposing team: ") + mine.map(f => long(f) + ", " + left(f)).join("; "))}">${mine.map(f => esc(nm(f)) + num(f)).join(" · ")}</span>`); }
  el.innerHTML = `<span class="bfc turn" data-tip="Turn ${rd}: a turn is every Pokémon on the field moving once">Turn <b>${rd}</b></span>` + chips.join("");
  if (!el.onclick) el.onclick = ev => { const c = ev.target.closest(".bfc"); if (c && c.dataset.tip) toast(c.dataset.tip); };
}
function startBattle(cfg) {
  const B = makeBattle({ allies: cfg.allies, waves: cfg.waves, auto: S.settings.auto, aiStyle: S.settings.ai, enemyStyle: cfg.enemyStyle, turnLimit: cfg.turnLimit, weather: cfg.weather, trainer: cfg.trainer, wild: cfg.wild, waveByWave: cfg.waveByWave, pick: true });
  Object.assign(BT, { B, cfg, quit: false, paused: false, speed: S.settings.speed, clock: 0, last: 0, parts: [], bolts: [], floats: [], rings: [], psScenes: [], balls: [],
    waits: [], tweens: [], target: null, active: null, picking: false, allyPick: null, orbit: false, act: null, inputRes: null, home: null, shake: 0, shx: 0, shy: 0, flash: 0, letterbox: 1, letterboxT: 1,
    tr: null, benchMode: null, benchPick: null });
  BT.vus = new Map();
  fieldInit(cfg);
  BT.env = buildEnv(cfg.env || "route");
  // the scene (a8a_render.js): the Elite Four rooms, a Battle Tower floor's or a stage's own, the Stadium for Ranked, Link and friendly battles
  const stage = BB_STAGE.find(([re]) => re.test(cfg.title || ""));
  if (BB_E4[cfg.trainerSpr]) BT.env.bb = BB_E4[cfg.trainerSpr];
  else if (cfg.bb) BT.env.bb = cfg.bb;
  else if (stage) BT.env.bb = stage[1];
  else if (cfg.pvp) BT.env.bb = "tower";
  music(cfg.bgm || (cfg.wild || !cfg.trainer ? "wild" : "trainer"));
  const root = $("#battle");
  root.innerHTML = `<div class="bwrap">
    <canvas id="bcv"></canvas>
    <div class="btop">
      <div class="bt-title"><small>${esc(cfg.sub || "")}</small><b>${esc(cfg.title || "Battle")}</b></div>
      <button class="tog ${B.auto ? "on" : ""}" id="bAuto" aria-label="Auto battle">AUTO</button>
      <button class="tog" id="bSpd" aria-label="Battle speed">${BT.speed}×</button>
      <button class="tog" id="bPause" aria-label="Pause">II</button>
    </div>
    <div class="turnstrip" id="bStrip"></div>
    <div class="bfield${cfg.turnLimit ? " low" : ""}" id="bField"></div>
    ${cfg.turnLimit ? `<div class="blimit" id="bLimit"></div>` : ""}
    <div class="bmsg" id="bMsg"></div>
    <div class="bctl" id="bCtl"></div>
    <div class="bpop" id="bPop" hidden></div>
  </div>`;
  root.hidden = false;
  BT.cv = $("#bcv"); BT.g = BT.cv.getContext("2d");
  trainerSetup(cfg); sizeCanvas();
  for (const u of B.units) addVU(u, true);
  BT.on = true; BT.raf = requestAnimationFrame(frame);
  $("#bAuto").onclick = () => {
    B.auto = !B.auto; S.settings.auto = B.auto; save(); $("#bAuto").classList.toggle("on", B.auto); sfx("tap");
    if (B.auto && BT.inputRes) { const r = BT.inputRes; BT.inputRes = null; hideControls(); r("auto"); }
  };
  $("#bSpd").onclick = () => { BT.speed = BT.speed >= 3 ? 1 : BT.speed + 1; S.settings.speed = BT.speed; save(); $("#bSpd").textContent = BT.speed + "×"; sfx("tap"); };
  $("#bPause").onclick = () => {
    BT.paused = true; sfx("tap");
    popup(`<h2>Paused</h2><p class="small dim" style="margin:6px 0 12px">${esc(cfg.title || "")}</p>
      <div class="stack" style="gap:8px"><button class="btn wide" id="bRes">Resume</button>
      <button class="btn ghost wide" id="bAi" data-tip="${esc(AI_TIP[S.settings.ai])}">Auto tactics: ${AI_NAME[S.settings.ai]}</button>
      <button class="btn ghost wide" id="bMus">Music: ${musicVol() > 0 ? "On" : "Off"}</button>
      <button class="btn ghost wide" id="bSnd">Sound: ${S.settings.sound ? "On" : "Off"}</button>
      <button class="btn red wide" id="bQuit">${cfg.wild ? "Run away" : "Forfeit"}</button></div>`);
    $("#bPopX").remove();
    const close = () => { $("#bPop").hidden = true; BT.paused = false; };
    $("#bPop").onclick = ev => { if (ev.target === $("#bPop")) close(); };
    $("#bRes").onclick = close;
    $("#bAi").onclick = () => { S.settings.ai = AI_STYLES[(AI_STYLES.indexOf(S.settings.ai) + 1) % AI_STYLES.length]; B.aiStyle = S.settings.ai; save(); $("#bAi").textContent = "Auto tactics: " + AI_NAME[S.settings.ai]; $("#bAi").dataset.tip = AI_TIP[S.settings.ai]; };
    $("#bMus").onclick = () => { setMusicVol(musicVol() > 0 ? 0 : .55); save(); $("#bMus").textContent = "Music: " + (musicVol() > 0 ? "On" : "Off"); };
    $("#bSnd").onclick = () => { S.settings.sound = !S.settings.sound; setDevicePref("sound", S.settings.sound); save(); $("#bSnd").textContent = "Sound: " + (S.settings.sound ? "On" : "Off"); };
    $("#bQuit").onclick = () => { BT.quit = true; BT.paused = false; if (BT.inputRes) { BT.inputRes("quit"); BT.inputRes = null; } closeBattle(); cfg.onQuit && cfg.onQuit(); };
  };
  press(BT.cv, ev => {
    const r = BT.cv.getBoundingClientRect(), k = BT.W / r.width, vu = unitAt((ev.clientX - r.left) * k, (ev.clientY - r.top) * k);
    if (!vu) return;
    if (!BT.picking || !BT.B.waiting || BT.benchMode) { popup(unitPop(vu.u)); return; }
    if (BT.allyPick && vu.team === "A" && BT.inputRes) {
      const r2 = BT.inputRes; BT.inputRes = null; const slot = BT.allyPick; hideControls(); sfx("tap"); r2({ slot, t: vu.u }); return;
    }
    if (vu.team === "E" && BT.B.targetable(BT.B.waiting).includes(vu.u)) { BT.target = vu; sfx("tap"); BT.redrawControls && BT.redrawControls(); }
    else popup(unitPop(vu.u));
  }, ev => {
    const r = BT.cv.getBoundingClientRect(), k = BT.W / r.width, vu = unitAt((ev.clientX - r.left) * k, (ev.clientY - r.top) * k);
    if (vu) popup(unitPop(vu.u));
  });
  window.addEventListener("resize", sizeCanvas);
  runBattle();
}
function closeBattle() {
  BT.on = false; cancelAnimationFrame(BT.raf);
  window.removeEventListener("resize", sizeCanvas);
  const root = $("#battle"); root.hidden = true; root.innerHTML = "";
  BT.cv = null; BT.home = null;
  renderTop(); route(UI.view, UI.arg, true);
}
async function intro() {
  const h = BT.home, B = BT.B, cfg = BT.cfg;
  camTo({ ...h, tx: 220, ty: 60, yaw: h.yaw - .8, pitch: .4, dist: h.dist * 1.05 }, 1, true);
  const foes = [...BT.vus.values()].filter(v => v.team === "E"), mine = [...BT.vus.values()].filter(v => v.team === "A");
  for (const v of foes) dexSee(v.u.key);
  camTo({ ...h, tx: 170, yaw: h.yaw - .4, pitch: .26, dist: h.dist * .78 }, 1.25);
  if (B.trainer) {
    say(`${B.trainer} would like to battle!`, true); sfx("special");
    await bwait(1100);
    if (cfg.intro) { say(`${B.trainer}: “${cfg.intro}”`); await bwait(msgWait(cfg.intro) + 500); }
    camTo({ ...h, tx: 170, yaw: h.yaw - .4, pitch: .26, dist: h.dist * .78 }, 1.6);
    say(`${B.trainer} sent out ${foes.map(v => v.u.n).join(", ")}!`);
    foes.forEach((v, k) => bwait(k * 220).then(() => throwBall(v, cfg.ball || "poke", .45 / Math.sqrt(foes.length))));
    await bwait(760 + foes.length * 220);
  } else {
    foes.forEach((v, k) => { v.spawnT = BT.clock + 150 + k * 140; cry(v.u.key, { at: .15 + k * .14, vol: .45 / Math.sqrt(foes.length) }); });
    addParts([200, 10, 0], 30, { col: "#7ac25a", speed: 140, vy: 120, life: 700, size: 3, g: 300, spread: 160, add: false });
    sfx("warp");
    say(foes.length === 1 ? `${foes[0].u.boss ? "" : "A wild "}${foes[0].u.n} appeared!` : `Wild ${foes.map(v => v.u.n).join(", ")} appeared!`, true);
    await bwait(1100);
  }
  camTo({ ...h, tx: -150, yaw: h.yaw + .35, pitch: .2, dist: h.dist * .72 }, 1.6);
  await bwait(260);
  say(`Go! ${mine.map(v => v.u.n).join(", ")}!`, true);
  mine.forEach((v, k) => bwait(k * 220).then(() => throwBall(v, "poke", .45 / Math.sqrt(mine.length))));
  await bwait(760 + mine.length * 220);
  BT.letterboxT = 0;
  camHome(1.8);
  updateStrip();
  await bwait(300);
}
async function runBattle() {
  const B = BT.B;
  fieldRow(1, []);   // (Turn 1 from the start; the field effects join it with the first turn)
  await intro();
  hideControls();
  await play(B.ev.splice(0));
  while (!B.over && !BT.quit && BT.on) {
    const r = B.step();
    if (r === "replace") {
      await play(B.ev.splice(0));
      if (BT.quit || !BT.on) return;
      camHome(3);
      const uid = await pickReplacement();
      if (uid === "quit" || BT.quit) return;
      B.replace(uid === "auto" ? null : uid);
    } else if (r === "input") {
      await play(B.ev.splice(0));
      if (BT.quit || !BT.on) return;
      if (B.auto) B.autoAct();
      else {
        camHome(3);
        const ch = await new Promise(res => { BT.inputRes = res; showControls(B.waiting); if (BT.cfg.timer) turnTimer(res, BT.cfg.timer); });
        if (ch === "quit" || BT.quit) return;
        if (ch === "auto") B.autoAct(); else if (ch.sw) { if (!B.playerSwitch(ch.sw)) B.autoAct(); } else B.playerAct(ch.slot, ch.t);
      }
      hideControls();
    }
    await play(B.ev.splice(0));
  }
  if (BT.quit || !BT.on) return;
  await outro();
}
async function outro() {
  const B = BT.B, res = B.result, h = BT.home, cfg = BT.cfg;
  hideControls(); BT.active = null;
  await bwait(250);
  const mine = [...BT.vus.values()].filter(v => v.team === "A" && !v.dead);
  if (res.win) {
    for (const v of mine) setPose(v, "victory", 0, false);
    camTo({ tx: avg(mine.map(v => v.pos.x)), ty: 50, tz: avg(mine.map(v => v.pos.z)), yaw: h.yaw + .5, pitch: .12, dist: fitDist(320, 360), fov: .62, roll: 0 }, 1.8);
    BT.orbit = true; sfx("win"); music(cfg.winBgm || (cfg.trainer && !cfg.wild ? "trainerWin" : "wildWin"));
    if (B.trainer) { say(`You defeated ${B.trainer}!`, true); if (cfg.lose) { await bwait(1200); say(`${B.trainer}: “${cfg.lose}”`); } }
    else say(B.units.some(u => u.team === "E" && u.boss) ? "You won the battle!" : "You defeated the wild Pokémon!", true);
  } else if (res.stalemate) {
    sfx("lose"); stopMusic(); say("The battle went on so long that both sides called it a draw!", true);
  } else if (res.timeUp) {
    camTo({ ...h, tx: 120, pitch: .2, dist: h.dist * 1.1 }, 1.4); music("trainerWin");
    sfx("special"); say(`Time's up! Your team pulls back after dealing ${fmtFull(B.damageBy("A"))} damage.`, true);
  } else {
    const foes = [...BT.vus.values()].filter(v => v.team === "E" && !v.dead);
    for (const v of foes) setPose(v, "victory", 0, false);
    camTo({ tx: avg(foes.map(v => v.pos.x)), ty: 50, tz: 0, yaw: h.yaw - .45, pitch: .16, dist: fitDist(320, 380), fov: .62, roll: 0 }, 1.4);
    sfx("lose"); stopMusic(); say(cfg.pvp ? `${B.trainer} won the battle!` : "You are out of usable Pokémon! You blacked out!", true);
  }
  BT.letterboxT = 1;
  await bwait(1700);
  if (!cfg.friendly) recordBattle(res, B);   // a friendly battle counts for nothing: no Medals, no Daily Research
  if (DEMO_ON() && !cfg.friendly) demoBattleOver(cfg, res);   // the Demo remembers how its teams really did
  const out = res.win ? cfg.onWin(res, B) : (cfg.onLose ? cfg.onLose(res, B) : { rewards: [] });
  save();
  const el = document.createElement("div");
  el.className = "result " + (res.win ? "win" : "lose");
  const missions = out.missions || null;
  el.innerHTML = `<div class="eyebrow">${esc(cfg.sub || "")}</div>
    <h1>${res.win ? "You won!" : res.timeUp ? "Time's up!" : res.stalemate ? "It's a draw!" : cfg.pvp ? "You lost!" : "You blacked out!"}</h1>
    ${missions ? `<div class="bigstars">${[0, 1, 2].map(k => `<span class="${missions[k].ok ? "on" : ""}">${missions[k].ok ? IC.star : IC.starOff}</span>`).join("")}</div>
      <div class="stack" style="gap:4px;text-align:left">${missions.map(m => `<div class="mission">${m.ok ? IC.check : IC.cross}<span>${esc(m.n)}</span></div>`).join("")}</div>` : ""}
    ${out.levels && out.levels.length ? `<div class="lvups">${out.levels.map(l => `<div class="lvup"><img class="px" src="${sprFront(l.k)}" alt=""><span><b>${esc(OPS[l.k].n)}</b> ${l.to > l.from ? `grew to <b>Lv ${l.to}</b>!` : l.cap && !l.xp ? `is at the level cap${l.passed ? ": its Exp. was shared with the others" : ""}` : `+${fmtFull(l.xp)} Exp.`}${l.evo ? ' <span class="good">Ready to evolve!</span>' : ""}</span></div>`).join("")}</div>` : ""}
    ${!res.win && !res.timeUp ? `<p class="small dim" style="max-width:36ch;text-align:center">Level up your Pokémon, bring types that hit the opponents super effectively, evolve them, or give them held items.</p>` : ""}
    ${out.rewards && out.rewards.length ? `<div class="rewards">${rewardsHTML(out.rewards)}</div>` : ""}
    <div class="row" style="gap:10px;margin-top:6px">
      ${cfg.retry ? `<button class="btn ghost" id="rRetry">Retry</button>` : ""}
      <button class="btn" id="rDone">Continue</button>
    </div>`;
  $(".bwrap").appendChild(el);
  $("#rDone").onclick = () => { closeBattle(); cfg.onClose && cfg.onClose(res); };
  if ($("#rRetry")) $("#rRetry").onclick = () => { const r = cfg.retry; closeBattle(); r(); };
}
