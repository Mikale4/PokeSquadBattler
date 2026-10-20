// =====================================================================
//  MOVE LAB — "PokeSquad Battler Move Lab.html" (tools/build_fxlab.js puts this into a copy of the built game).
//  A battle of one to three Pokémon a side where any move can be played by any of them, either way round, slowed down, step
//  by step, to check its animation (a move that hits every opponent hits each one on the other side, as in battle).
//  It plays the game's own battle events (handle in a8b_battle.js), so a move looks exactly as it does in battle: Pokémon
//  Showdown's animation for it (a8e_showdown_scene.js). The field (weather, terrain, screens, hazards) and status tints
//  can be set from the panel, and a move that sets one (Rain Dance, Reflect, Spikes...) sets it here too.
//  It never writes to this device's saves (storage writes are switched off on this page).
// =====================================================================
(() => {
  try { for (const f of ["setItem", "removeItem", "clear"]) Storage.prototype[f] = function () {}; } catch (e) { /* no storage */ }
  // sides: your Pokémon (A) and the wild ones (E), one to three each; pick: which of yours uses the move, which of theirs it's aimed at
  const LAB = { sides: { A: ["charizard"], E: ["blastoise"] }, pick: { A: 0, E: 0 }, env: "route", speed: 1, type: "", q: "", list: [], i: 0, busy: false, auto: false, cutin: true, ready: false };
  const SP = Object.keys(OPS).sort((a, b) => OPS[a].id - OPS[b].id), MV = Object.keys(MOVES).sort((a, b) => MOVES[a].n.localeCompare(MOVES[b].n));
  const TYPES = [...new Set(MV.map(k => MOVES[k].t))].sort();
  const $l = s => document.querySelector("#lab " + s);
  const opt = (v, t, sel) => `<option value="${v}"${sel ? " selected" : ""}>${esc(t)}</option>`;
  const DEF = { A: ["charizard", "venusaur", "blastoise"], E: ["blastoise", "gengar", "snorlax"] };
  // the picked Pokémon on a side (or the first still standing there)
  const onSide = (team, i) => { const vs = [...BT.vus.values()].filter(v => v.team === team && !v.dead && !v.gone); return vs.find(v => v.u.slot === i) || vs[0]; };
  const side = rev => { const a = onSide("A", LAB.pick.A), e = onSide("E", LAB.pick.E); return rev ? [e, a] : [a, e]; };
  const move = () => LAB.list[LAB.i];
  // the field, as the battle draws it (a8e_showdown_scene.js): weather and terrain layers, screens on a side, hazards at its feet
  const WX = { sunnyday: "sun", raindance: "rain", sandstorm: "sand", hail: "hail", snowscape: "hail", chillyreception: "hail" };
  const TER = { electricterrain: "electric", grassyterrain: "grassy", mistyterrain: "misty", psychicterrain: "psychic", trickroom: "trickroom" };
  const SCR = { reflect: "REFLECT", lightscreen: "LSCREEN", auroraveil: "VEIL", safeguard: "SAFEGUARD", mist: "MIST" };
  const HZ = { stealthrock: ["sr", 1], spikes: ["spikes", 3], toxicspikes: ["tspikes", 2] };
  const SCR_N = { REFLECT: "Reflect", LSCREEN: "Light Screen", VEIL: "Aurora Veil", SAFEGUARD: "Safeguard", MIST: "Mist" };
  const teamVus = t => [...BT.vus.values()].filter(v => v.team === t);
  function setScreen(team, id, on) { for (const v of teamVus(team)) { v.effs = (v.effs || []).filter(e => e[0] !== id); if (on) v.effs.push([id, 5]); } }
  function fieldSync() {
    if (!BT.field) return;
    $l("#lWx").value = BT.field.wx.cur || ""; $l("#lTer").value = BT.field.ter.cur || "";
    const up = new Set(teamVus("A").flatMap(v => (v.effs || []).map(e => e[0]))); $l("#lScr").value = Object.keys(SCR_N).find(id => up.has(id)) || "";
    const hz = BT.field.hz.E; $l("#lHz").value = hz.sr && hz.spikes && hz.tspikes ? "all" : hz.sr ? "sr" : hz.spikes ? "spikes" + hz.spikes : hz.tspikes ? "tspikes" + hz.tspikes : "";
  }
  // a field move used by the attacker (rev: by the defender) leaves its mark, as in battle
  function fieldMove(k, rev) {
    if (!BT.field) return;
    const me = rev ? "E" : "A", foe = rev ? "A" : "E";
    if (WX[k]) fieldSet("wx", WX[k]);
    if (TER[k]) fieldSet("ter", k === "trickroom" && BT.field.ter.cur === "trickroom" ? null : TER[k]);
    if (SCR[k]) setScreen(me, SCR[k], true);
    if (HZ[k]) { const [h, max] = HZ[k], hz = BT.field.hz[foe] = { ...BT.field.hz[foe] }; hz[h] = Math.min(max, (hz[h] || 0) + 1); }
    if (k === "rapidspin" || k === "mortalspin" || k === "tidyup") BT.field.hz[me] = {};
    if (k === "defog") { BT.field.hz = { A: {}, E: {} }; for (const id in SCR_N) setScreen(foe, id, false); }
    if (k === "courtchange") BT.field.hz = { A: BT.field.hz.E, E: BT.field.hz.A };
    if (k === "brickbreak" || k === "psychicfangs" || k === "ragingbull") for (const id of ["REFLECT", "LSCREEN", "VEIL"]) setScreen(foe, id, false);
    fieldSync();
  }

  function filter() {
    const q = LAB.q.toLowerCase();
    LAB.list = MV.filter(k => (!LAB.type || MOVES[k].t === LAB.type) && (!q || MOVES[k].n.toLowerCase().includes(q)));
    LAB.i = Math.max(0, Math.min(LAB.i, LAB.list.length - 1));
    $l("#lMove").innerHTML = LAB.list.map((k, j) => opt(j, `${MOVES[k].n} · ${MOVES[k].t} · ${CAT_N[MOVES[k].c]} · S${MOVES[k].s}`, j === LAB.i)).join("");
    $l("#lCount").textContent = `${LAB.list.length} moves`;
    recipe();
  }
  function recipe() {
    const k = move(), el = $l("#lRecipe"); if (!k) { el.textContent = ""; return; }
    const M = MOVES[k], id = PS_ALIAS[k] || k, E = psEntry(k), own = BattleMoveAnims[id] ? Object.keys(BattleMoveAnims).find(x => BattleMoveAnims[x].anim === E.anim) : "tackle";
    el.innerHTML = `<b>${esc(M.n)}</b>${M.s === 3 ? " · S3 cut-in" : ""}<br><span>Showdown: ${own === id ? "its own animation" : `${esc(own)}'s animation`}</span>${E.prepareAnim ? " <span>with a charge first</span>" : ""}`;
  }
  // the battle: the attacker on your side, the defender as a wild Pokémon, both at Lv 50; it waits for a move that never comes
  async function start() {
    LAB.ready = false; busy(true);
    if (BT.on) { BT.quit = true; if (BT.inputRes) { const r = BT.inputRes; BT.inputRes = null; r("quit"); } closeBattle(); }
    S.ops = {}; for (const k of LAB.sides.A) S.ops[k] = mkProg(50, k); S.settings.auto = false;
    startBattle({ allies: LAB.sides.A.map(k => ({ op: k, prog: S.ops[k] })), waves: [LAB.sides.E.map(k => ({ op: k, LV: 50 }))], env: LAB.env, title: "Move Lab",
      sub: `${LAB.sides.A.length} vs ${LAB.sides.E.length}`, wild: true, onQuit: () => {} });
    for (let n = 0; n < 400 && !(BT.B && BT.B.waiting); n++) await new Promise(r => setTimeout(r, 50));
    BT.speed = LAB.speed; LAB.ready = true; busy(false); fieldSync();
  }
  // the two sides: how many (1 to 3), who, and (the radio) which of yours uses the move and which of theirs it's aimed at
  function sides() {
    const box = $l("#lSides"), row = (team, i) => `<div class="row"><select data-t="${team}" data-i="${i}" class="lMon">${SP.map(k => opt(k, `#${OPS[k].id} ${OPS[k].n}`, k === LAB.sides[team][i])).join("")}</select>
      <label class="chk" title="${team === "A" ? "Uses the move" : "The move's target"}"><input type="radio" name="lPick${team}" data-t="${team}" data-i="${i}"${LAB.pick[team] === i ? " checked" : ""}> ${team === "A" ? "uses it" : "target"}</label></div>`;
    box.innerHTML = [["A", "Your side"], ["E", "Their side"]].map(([team, name]) => `<label>${name} <select class="lN" data-t="${team}" style="width:auto;padding:1px 4px;margin-left:4px">${[1, 2, 3].map(n => opt(n, n, n === LAB.sides[team].length)).join("")}</select></label>
      ${LAB.sides[team].map((k, i) => row(team, i)).join("")}`).join("");
    box.querySelectorAll(".lN").forEach(el => el.onchange = () => { const t = el.dataset.t, n = +el.value, cur = LAB.sides[t];
      LAB.sides[t] = Array.from({ length: n }, (_, i) => cur[i] || DEF[t][i]); LAB.pick[t] = Math.min(LAB.pick[t], n - 1); sides(); start(); });
    box.querySelectorAll(".lMon").forEach(el => el.onchange = () => { LAB.sides[el.dataset.t][+el.dataset.i] = el.value; start(); });
    box.querySelectorAll("input[type=radio]").forEach(el => el.onchange = () => { LAB.pick[el.dataset.t] = +el.dataset.i; });
  }
  function busy(b) { LAB.busy = b; for (const id of ["#lPlay", "#lRev"]) $l(id).disabled = b || !LAB.ready; }
  // a move, as a battle shows it: the act (camera, cut-in, status and buff moves), each strike, then back home
  async function play(k, rev) {
    if (LAB.busy || !LAB.ready || !k) return;
    const [A, T] = side(rev); if (!A || !T) return;
    busy(true); BT.speed = LAB.speed;
    const M = MOVES[k], tgt = moveTarget(M), anim = moveAnim(M, tgt), self = tgt === "self" || tgt === "team" || tgt === "field";
    // who it's aimed at: the picked opponent, every opponent for a spread move, a partner for a move on an ally (itself when alone)
    const pals = teamVus(A.team).filter(v => v !== A && !v.dead && !v.gone), foes = [T, ...teamVus(T.team).filter(v => v !== T && !v.dead && !v.gone)];
    const to = self ? A : tgt === "ally_single" || tgt === "partners" ? pals[0] || A : T, hits = tgt === "aoe_enemies" ? foes : [to];
    try {
      await handle({ k: "act", u: A.uid, slot: M.s, key: k, name: M.n, type: M.t, cat: M.c, anim, s3: M.s === 3 && LAB.cutin, t: to.uid, tgt });
      // (as the battle sends them: each strike at each target in turn)
      if (M.c !== "X") { const n = M.hit ? M.hit[1] : 1; for (let h = 0; h < n; h++) for (const x of hits) await handle({ k: "atk", a: A.uid, t: [x.uid], anim, type: M.t, aoe: hits.length > 1 ? 1 : 0, sp: M.s > 1 ? 1 : 0, h, n }); }
      fieldMove(k, rev);
      await bwait(450);
      await handle({ k: "end" });
    } catch (e) { console.error(e); }
    busy(false);
  }
  // one of Showdown's shared animations (hit marks, attacks, heals, charges...), from the attacker at the defender
  function other(k) { if (!LAB.ready) return; const [A, T] = side(false); if (A && T) psOther(k, A, T); }
  async function autoplay() {
    while (LAB.auto && LAB.i < LAB.list.length) {
      $l("#lMove").value = LAB.i; recipe();
      await play(move(), false);
      await new Promise(r => setTimeout(r, 300));
      if (!LAB.auto) break;
      LAB.i++;
    }
    LAB.auto = false; $l("#lAuto").checked = false;
  }

  const css = document.createElement("style");
  css.textContent = `#bCtl,#bMsg,#bAuto,#bPause,#bSpd{display:none!important}
#lab{position:fixed;right:12px;top:12px;width:330px;max-height:calc(100vh - 24px);overflow:auto;z-index:99999;background:rgba(18,20,28,.95);color:#eef;
  font:13px/1.35 system-ui,Segoe UI,Arial,sans-serif;border-radius:12px;box-shadow:0 8px 28px #0009;padding:10px 12px}
#lab h1{font-size:15px;margin:0 0 6px;display:flex;justify-content:space-between;align-items:center}
#lab label{display:block;margin:6px 0 2px;color:#9ab;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
#lab select,#lab input[type=text]{width:100%;box-sizing:border-box;background:#262a38;color:#fff;border:1px solid #3a4054;border-radius:7px;padding:5px 6px;font:inherit}
#lab .row{display:flex;gap:6px;align-items:center;margin-top:6px}#lab .row>*{flex:1}
#lab button{background:#e3350d;color:#fff;border:0;border-radius:8px;padding:7px 8px;font:600 13px system-ui,Arial;cursor:pointer}
#lab button.g{background:#3a4054}#lab button:disabled{opacity:.45;cursor:default}
#lab .chk{display:flex;align-items:center;gap:5px;color:#cde;flex:none}
#lab #lRecipe{margin-top:8px;padding:7px;background:#232736;border-radius:8px;color:#cde;font-size:12px}#lab #lRecipe span{display:inline-block;margin:2px 6px 0 0;color:#9fd}
#lab .min{background:none;padding:0 4px;font-size:16px}
#lab.mini>*:not(h1){display:none}
@media (max-width:700px){#lab{left:8px;right:8px;top:auto;bottom:8px;width:auto;max-height:46vh}}
/* a wide window: the Game Boy moves over to the left of the panel, so the defender's side stays in view */
@media (min-width:1000px){.gb.land{max-width:calc(100vw - 366px)!important;margin-left:8px!important;margin-right:auto!important}}`;
  document.head.appendChild(css);
  GB_RESERVE = () => innerWidth >= 1000 ? 366 : 0; applyShell();   // (Gameboy, Switch: fitted beside the panel)

  function ui() {
    const el = document.createElement("div"); el.id = "lab";
    el.innerHTML = `<h1>Move Lab <button class="min" id="lMin" title="Fold the panel">–</button></h1>
      <div id="lSides"></div>
      <label>Place</label><select id="lEnv">${Object.keys(ENVS).map(k => opt(k, k, k === LAB.env)).join("")}</select>
      <div class="row"><div><label>Type</label><select id="lType">${opt("", "All types", true)}${TYPES.map(t => opt(t, t)).join("")}</select></div>
        <div><label>Search</label><input type="text" id="lQ" placeholder="Move name"></div></div>
      <label>Move <span id="lCount" style="text-transform:none"></span></label><select id="lMove" size="7"></select>
      <div class="row"><button class="g" id="lPrev" title="Previous move (←)">◀</button><button id="lPlay" title="Play (Space)">Play</button>
        <button id="lRev" title="The target uses it on the one that would (R)">Reverse</button><button class="g" id="lNext" title="Next move (→)">▶</button></div>
      <div class="row"><div><label>Speed</label><select id="lSpd">${[[.25, "¼×"], [.5, "½×"], [1, "1×"], [2, "2×"], [3, "3×"]].map(([v, t]) => opt(v, t, v === 1)).join("")}</select></div>
        <label class="chk"><input type="checkbox" id="lCut" checked> S3 cut-ins</label><label class="chk"><input type="checkbox" id="lAuto"> Play the list</label></div>
      <div id="lRecipe"></div>
      <label>A shared animation (${Object.keys(BattleOtherAnims).length})</label><div class="row"><select id="lClip">${Object.keys(BattleOtherAnims).map(k => opt(k, k)).join("")}</select><button class="g" id="lClipGo" style="flex:none">Play</button></div>
      <label>A status on the target</label><div class="row"><select id="lSt">${Object.keys(PS_STATUS).map(k => opt(k, `${k} (${PS_STATUS[k]})`)).join("")}</select><button class="g" id="lStGo" style="flex:none">Show</button></div>
      <label>The field</label>
      <div class="row"><select id="lWx" title="Weather">${opt("", "No weather", true)}${["sun", "rain", "sand", "hail"].map(w => opt(w, WEATHER[w].n)).join("")}</select>
        <select id="lTer" title="Terrain">${opt("", "No terrain", true)}${Object.keys(TERRAIN).map(t => opt(t, TERRAIN[t].n)).join("")}${opt("trickroom", "Trick Room")}</select></div>
      <div class="row"><select id="lScr" title="A screen on the attacker's side">${opt("", "No screen (attacker)", true)}${Object.entries(SCR_N).map(([id, n]) => opt(id, n)).join("")}</select>
        <select id="lHz" title="Hazards on the defender's side">${opt("", "No hazards (defender)", true)}${[["sr", "Stealth Rock"], ["spikes1", "Spikes ×1"], ["spikes2", "Spikes ×2"], ["spikes3", "Spikes ×3"], ["tspikes1", "Toxic Spikes ×1"], ["tspikes2", "Toxic Spikes ×2"], ["all", "All of them"]].map(([v, t]) => opt(v, t)).join("")}</select></div>
      <div class="row"><button class="g" id="lRestart">New battle</button><button class="g" id="lClear">Clear the field</button></div>`;
    document.body.appendChild(el);
    el.addEventListener("keydown", e => e.stopPropagation());
    $l("#lMin").onclick = () => { el.classList.toggle("mini"); $l("#lMin").textContent = el.classList.contains("mini") ? "+" : "–"; };
    sides();
    $l("#lEnv").onchange = e => { LAB.env = e.target.value; start(); };
    $l("#lType").onchange = e => { LAB.type = e.target.value; LAB.i = 0; filter(); };
    $l("#lQ").oninput = e => { LAB.q = e.target.value; LAB.i = 0; filter(); };
    $l("#lMove").onchange = e => { LAB.i = +e.target.value; recipe(); };
    $l("#lMove").ondblclick = () => play(move(), false);
    $l("#lPlay").onclick = () => play(move(), false);
    $l("#lRev").onclick = () => play(move(), true);
    const step = d => { LAB.i = (LAB.i + d + LAB.list.length) % LAB.list.length; $l("#lMove").value = LAB.i; recipe(); };
    $l("#lPrev").onclick = () => step(-1); $l("#lNext").onclick = () => step(1);
    $l("#lSpd").onchange = e => { LAB.speed = +e.target.value; if (BT.on) BT.speed = LAB.speed; };
    $l("#lCut").onchange = e => { LAB.cutin = e.target.checked; };
    $l("#lAuto").onchange = e => { LAB.auto = e.target.checked; if (LAB.auto) autoplay(); };
    $l("#lClipGo").onclick = () => other($l("#lClip").value);
    // a status shows its animation and, for a lasting one, the tint on the sprite (Clear the field takes it off)
    $l("#lStGo").onclick = () => { const [, T] = side(false); if (!T || !LAB.ready) return; const st = $l("#lSt").value; psStatus(st, T); if (PS_ST_FILTER[st]) T.st = st; };
    $l("#lWx").onchange = e => { if (BT.field) fieldSet("wx", e.target.value || null); };
    $l("#lTer").onchange = e => { if (BT.field) fieldSet("ter", e.target.value || null); };
    $l("#lScr").onchange = e => { for (const id in SCR_N) setScreen("A", id, id === e.target.value); };
    $l("#lHz").onchange = e => { if (!BT.field) return; const v = e.target.value; BT.field.hz.E = v === "all" ? { sr: 1, spikes: 3, tspikes: 2 } : v === "sr" ? { sr: 1 } : v ? { [v.replace(/\d/, "")]: +v.slice(-1) } : {}; };
    $l("#lClear").onclick = () => { if (!BT.field) return; fieldSet("wx", null); fieldSet("ter", null); BT.field.hz = { A: {}, E: {} };
      for (const v of BT.vus.values()) { v.effs = (v.effs || []).filter(e => !SCR_N[e[0]]); v.st = null; } fieldSync(); };
    $l("#lRestart").onclick = start;
    // the keyboard: ← → for the moves, Space to play, R the other way round (the game's own keys stay off while here)
    window.addEventListener("keydown", e => {
      if (e.target.closest && e.target.closest("#lab")) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "ArrowRight") step(k === "ArrowLeft" ? -1 : 1);
      else if (k === " " || k === "Enter") play(move(), false);
      else if (k === "r" || k === "R") play(move(), true);
      else return;
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
    filter();
  }

  // into the game straight away, on a save that only lives on this page
  const sv = newSave(); Object.assign(sv, { named: true, seenIntro: true, name: "Lab" });
  hideTitle(); SESSION = { id: "lab", name: "Lab" };
  enterGame("pks_move_lab", { save: sv });
  closeModal();
  document.title = "PokeSquad Battler · Move Lab";
  ui();
  const go = () => SPR.ready ? start() : setTimeout(go, 100);
  go();
})();
