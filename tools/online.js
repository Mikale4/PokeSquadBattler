// =====================================================================
//  ONLINE — "PokeSquad Battler Online.html" (tools/build_online.js puts this into a copy of the built game; never edit the output).
//  Online battles only (the owner's ask, 2026-10-19), laid out like Pokémon Showdown: no title screen, no story, no save. A home
//  screen (your name and look, your team, Find a Battle, Battle a Friend), the Teambuilder (any six Pokémon at Lv 100, the moves of
//  their slots, Ability, nature and held item, an Optimize button from the game's own optimizer, import and export as text), the
//  team preview (choose your three leads), then the battle on the game's own battle screen and engine.
//  The server (server/server.js) only pairs the players and passes their choices: both phones build the same battle from the same
//  seed and play every choice in the same order (cfg.online in a8b_battle.js), so the battle never travels, only the choices.
//  Rules: the Stadium's (the team config's limits, the Item Clause and its bans, modeRules("online")), every Pokémon at Lv 100,
//  maximum IVs and Mastery, no Badge bonus. Teams and your name stay on this device (localStorage "pks_online"); the game's
//  saves are never touched (writes to any other key are switched off on this page).
//  ?server=ws://localhost:8787 points it at another server (the default: ONLINE_SERVER below).
// =====================================================================
(() => {
  const KEY = "pks_online", PROTO = 1, LEVEL = 100, TIMER = 45, PREVIEW_SECS = 60;
  const ONLINE_SERVER = "wss://pokesquad-battler.onrender.com";
  try {
    const set = Storage.prototype.setItem, rm = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (k, v) { if (String(k).startsWith(KEY)) set.call(this, k, v); };
    Storage.prototype.removeItem = function (k) { if (String(k).startsWith(KEY)) rm.call(this, k); };
    Storage.prototype.clear = function () {};
  } catch (e) { /* no storage */ }
  const P = Object.assign({ name: "", look: "red", token: null, teams: [], cur: 0 }, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* full or blocked */ } };
  const SERVER = new URLSearchParams(location.search).get("server") || ONLINE_SERVER;
  const ON = { view: "home", ws: null, up: false, n: 0, tries: 0, lobby: null, code: null, match: null, edit: null, slot: 0, q: "", msg: "" };

  // ---------- the rules ----------
  const RULES = modeRules("online");
  const SPECIES = OP_KEYS.filter(k => !OPS[k].bf).sort((a, b) => OPS[a].id - OPS[b].id || OPS[a].n.localeCompare(OPS[b].n));
  const POOL = {};
  const pool = k => POOL[k] || (POOL[k] = [...new Set(learnPool(k))].filter(m => MOVES[m] && m !== "struggle"));
  const itemsFor = k => HELD_KEYS.filter(h => !HELD[h].only || HELD[h].only.includes(k)).sort((a, b) => HELD[a].n.localeCompare(HELD[b].n));
  const abName = a => abilityOf(a).name;
  function monErrors(m) {
    const op = OPS[m.k], out = [];
    if (!op || op.bf) return ["Unknown Pokémon"];
    if (RULES.ban.pokemon.has(m.k)) out.push(`${op.n} is banned`);
    m.mv.forEach((x, i) => { if (!x) return; if (!MOVES[x] || MOVES[x].s !== i + 1 || !pool(m.k).includes(x)) out.push(`${op.n} can't use ${MOVES[x] ? MOVES[x].n : x} in S${i + 1}`); else if (RULES.ban.moves.has(x)) out.push(`${MOVES[x].n} is banned`); });
    if (!m.mv[0]) out.push(`${op.n} needs an S1 move`);
    if (!op.abs.some(a => a.k === m.ab)) out.push(`${op.n} can't have ${abName(m.ab)}`); else if (RULES.ban.abilities.has(m.ab)) out.push(`${abName(m.ab)} is banned`);
    if (!NATURES[m.nat]) out.push(`${op.n} needs a nature`);
    if (m.held && (!HELD[m.held] || !itemsFor(m.k).includes(m.held))) out.push(`${op.n} can't hold that item`); else if (m.held && RULES.ban.items.has(m.held)) out.push(`${HELD[m.held].n} is banned`);
    return out;
  }
  function teamErrors(t) {
    const out = [], mons = (t && t.mons) || [];
    if (!mons.length) return ["The team is empty"];
    if (mons.length > ROSTER) out.push(`Six Pokémon at most`);
    for (const m of mons) out.push(...monErrors(m));
    const keys = mons.map(m => m.k);
    if (new Set(keys).size < keys.length) out.push("The same Pokémon twice");
    const g = pvpClash(keys, RULES.limits); if (g) out.push(`Too many ${{ legendary: "Legendary Pokémon", mythical: "Mythical Pokémon", ultraBeast: "Ultra Beasts", paradox: "Paradox Pokémon" }[g] || g} (${RULES.limits[g]} at most)`);
    for (const h of ITEM_CLAUSE) if (mons.filter(m => m.held === h).length > 1) out.push(`Item Clause: one ${HELD[h].n} per team`);
    return out;
  }
  // the game's own optimizer: the moves, Ability, nature and held item that work best (an Item Clause item a teammate holds is left out)
  function optimize(k, team) {
    const c = { meta: poolMeta() }, B = bestBuild(k, { ...c, pool: pool(k) }), nat = optNature(k, B.mv, B.ab, c);
    const taken = new Set((team ? team.mons : []).filter(m => m.k !== k).map(m => m.held).filter(h => ITEM_CLAUSE.includes(h)));
    const held = itemsFor(k).filter(h => !taken.has(h)).map(h => [h, itemValue(k, h, B, c)]).sort((a, b) => b[1] - a[1])[0];
    return { k, mv: B.mv.slice(0, 3).map(x => x || null), ab: B.ab, nat, held: held ? held[0] : null };
  }
  const blank = k => ({ k, mv: defaultMoves(k, LEVEL).slice(0, 3).map(x => x || null), ab: OPS[k].ab, nat: "hardy", held: null });
  // a team member as the battle builds it: Lv 100, maximum IVs and Mastery, no Badge bonus for either side
  const spec = m => ({ op: m.k, prog: { ...progForLV(m.k, LEVEL), pot: 6, sk: [MAX_SK, MAX_SK, MAX_SK], mv: m.mv.slice(), ab: m.ab, nat: m.nat, held: m.held || null }, mine: false, badges: 0 });

  // ---------- import and export, as text (Showdown's style) ----------
  function teamText(t) {
    return t.mons.map(m => [`${OPS[m.k].n}${m.held ? " @ " + HELD[m.held].n : ""}`, `Ability: ${abName(m.ab)}`, `${natName(m.nat)} Nature`,
      ...m.mv.map((x, i) => x ? `- ${MOVES[x].n} (S${i + 1})` : null).filter(Boolean)].join("\n")).join("\n\n");
  }
  const low = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  function parseTeam(txt) {
    const byName = {}; for (const k of SPECIES) if (!byName[low(OPS[k].n)]) byName[low(OPS[k].n)] = k;
    const item = {}; for (const h of HELD_KEYS) item[low(HELD[h].n)] = h;
    const move = {}; for (const k in MOVES) move[low(MOVES[k].n)] = k;
    const mons = [];
    for (const block of String(txt).split(/\n\s*\n/)) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean); if (!lines.length) continue;
      const [nm, it] = lines[0].split("@").map(s => s.trim()), k = byName[low(nm.replace(/\(.*\)/, ""))]; if (!k) continue;
      const m = blank(k); m.held = it ? item[low(it)] || null : null; m.mv = [null, null, null];
      for (const l of lines.slice(1)) {
        if (/^ability:/i.test(l)) { const a = OPS[k].abs.find(x => low(abName(x.k)) === low(l.slice(8))); if (a) m.ab = a.k; }
        else if (/nature$/i.test(l) || /^nature:/i.test(l)) { const n = Object.keys(NATURES).find(x => low(natName(x)) === low(l.replace(/nature:?/i, ""))); if (n) m.nat = n; }
        else if (/^-/.test(l)) { const x = move[low(l.slice(1).replace(/\(S\d\)/i, ""))]; if (x && MOVES[x].s) m.mv[MOVES[x].s - 1] = x; }
      }
      mons.push(m); if (mons.length === ROSTER) break;
    }
    return mons;
  }

  // ---------- the connection ----------
  function connect() {
    if (ON.ws && ON.ws.readyState <= 1) return;
    let ws; try { ws = new WebSocket(SERVER); } catch (e) { ON.up = false; draw(); return; }
    ON.ws = ws;
    ws.onopen = () => { ON.tries = 0; ws.send(JSON.stringify({ t: "hello", v: PROTO, name: myName(), look: P.look, token: P.token })); };
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (x) { return; } onNet(m); };
    ws.onclose = () => { if (ON.ws !== ws) return; ON.up = false; ON.ws = null; draw(); setTimeout(connect, Math.min(15000, 1000 * 2 ** ON.tries++)); };
  }
  const net = m => { if (ON.ws && ON.ws.readyState === 1) ON.ws.send(JSON.stringify(m)); };
  setInterval(() => net({ t: "ping" }), 20000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) connect(); });
  const myName = () => (P.name || "").trim() || "Trainer";
  function onNet(m) {
    const M = ON.match;
    switch (m.t) {
      case "welcome": ON.up = true; ON.n = m.n; P.token = m.token; keep(); draw(); break;
      case "count": ON.n = m.n; if (ON.view === "home") draw(); break;
      case "old": alert("A newer version of PokeSquad Battler is out: reload the page."); break;
      case "queued": ON.lobby = "queue"; draw(); break;
      case "room": ON.lobby = "room"; ON.code = m.code; draw(); break;
      case "nocode": toast("No room with that code"); break;
      case "cancelled": ON.lobby = null; ON.code = null; draw(); break;
      case "match": {
        ON.lobby = null; ON.code = null;
        const t = curTeam();
        ON.match = { id: m.id, side: m.side, seed: m.seed, opp: m.opp, teams: {}, orders: {}, log: [], sent: [], inbox: new Map() };
        net({ t: "team", team: { name: t.name, mons: t.mons } });
        go("wait"); break;
      }
      case "teams": if (!M) break; M.teams = { A: m.A, E: m.E }; preview(); break;
      case "start": if (!M) break; M.orders = m.orders; battle(); break;
      case "choice": if (!M) break; M.inbox.set(m.n, m.c); if (M.waiter && M.waiter.n === m.n) { const w = M.waiter; M.waiter = null; M.inbox.delete(m.n); w.res(m.c); } break;
      case "resume": resume(m); break;
      case "desync": endOnline("The battle went out of sync on the two phones, so it was called off (no result).", null); break;
      case "away": toast(`${M ? M.opp.name : "Your opponent"} lost the connection: ${m.secs} s to come back`); break;
      case "back": toast(`${M ? M.opp.name : "Your opponent"} is back`); break;
      case "left": endOnline(`${M ? M.opp.name : "Your opponent"} left the battle. You win!`, true); break;
      case "forfeit": endOnline(`${M ? M.opp.name : "Your opponent"} forfeited. You win!`, true); break;
    }
  }
  // back after a dropped connection: a battle still running on this page carries on (the choices it missed come in, the ones it
  // sent that never arrived go again); after a reload the battle is rebuilt and replays every choice so far, fast
  function resume(m) {
    const M = ON.match;
    if (M && M.id === m.id && BT.on) {
      for (const c of M.sent) if (c.n >= m.log.length) net({ t: "choice", n: c.n, c: c.c });
      m.log.forEach((c, n) => { if (n >= M.next && !M.inbox.has(n)) M.inbox.set(n, c); });
      if (M.waiter && M.inbox.has(M.waiter.n)) { const w = M.waiter, c = M.inbox.get(w.n); M.waiter = null; M.inbox.delete(w.n); w.res(c); }
      return;
    }
    ON.match = { id: m.id, side: m.side, seed: m.seed, opp: m.opp, teams: m.teams, orders: m.orders, log: m.log, sent: [], inbox: new Map() };
    const mine = m.teams[m.side];
    if (!mine) { const t = curTeam(); net({ t: "team", team: { name: t.name, mons: t.mons } }); go("wait"); return; }
    if (!(m.teams.A && m.teams.E)) { go("wait"); return; }
    if (!(m.orders.A && m.orders.E)) { preview(); return; }
    battle(m.log);
  }

  // ---------- the battle ----------
  const hashOf = B => { let s = B.turn + "|"; for (const u of [...B.units, ...B.bench.A, ...B.bench.E].sort((a, b) => a.uid - b.uid)) s += `${u.uid}:${u.hp}:${u.status || ""}:${u.slot}:${Math.round(u.atb * 100)};`;
    let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function battle(log = []) {
    const M = ON.match; if (!M || BT.on) return;
    const team = side => (M.orders[side] || []).map(i => M.teams[side].mons[i]).filter(Boolean).map(spec);
    M.next = 0; M.log = log.slice();
    const fast = log.length > 0, speed0 = S.settings.speed;
    const O = {
      me: M.side, seed: M.seed, timer: TIMER,
      queued: () => M.next < M.log.length ? M.log[M.next++] : null,
      send: c => { const n = M.next++; M.sent.push({ n, c }); net({ t: "choice", n, c }); },
      wait: () => new Promise(res => { const n = M.next++; if (M.inbox.has(n)) { const c = M.inbox.get(n); M.inbox.delete(n); res(c); } else M.waiter = { n, res }; }),
      check: B => { net({ t: "hash", n: M.next, h: hashOf(B) }); if (O.fast && M.next >= M.log.length) { O.fast = false; BT.speed = speed0 || 1; } },
      forfeit: () => { net({ t: "forfeit" }); ON.match = null; },
      fast,
    };
    $("#online").hidden = true;
    const done = res => { if (ON.match === M) { net({ t: "over" }); ON.match = null; } };
    startBattle({ allies: team("A"), waves: [team("E")], online: O, title: "Online Battle", sub: `${myName()} vs ${M.opp.name}`, trainer: M.opp.name, trainerSpr: M.opp.look,
      env: "gym", pvp: true, friendly: true, bgm: stadiumTheme(),
      onWin: (r, B) => { done(r); return { rewards: [] }; }, onLose: (r, B) => { done(r); return { rewards: [] }; },
      onClose: () => back(), onQuit: () => back() });
    if (fast) BT.speed = 16;   // (a rejoined battle replays the choices so far at speed)
  }
  function endOnline(text, win) {
    ON.match = null;
    if (BT.on) { BT.quit = true; if (BT.inputRes) { const r = BT.inputRes; BT.inputRes = null; r("quit"); } closeBattle(); }
    back(); ON.msg = text; draw();
  }
  const back = () => { $("#online").hidden = false; VIEW_ME = "A"; go("home"); };

  // ---------- the team preview: both teams, and your three leads ----------
  function preview() {
    const M = ON.match; if (!M) return;
    const opp = M.teams[M.side === "A" ? "E" : "A"], bad = teamErrors(opp);
    if (bad.length) { net({ t: "forfeit" }); endOnline(`${M.opp.name}'s team breaks the rules (${bad[0]}), so the battle was called off.`, null); return; }
    M.pick = M.teams[M.side].mons.map((_, i) => i); M.ready = false; M.until = Date.now() + PREVIEW_SECS * 1000;
    go("preview");
    const tick = () => { if (ON.view !== "preview" || M.ready || ON.match !== M) return; if (Date.now() >= M.until) ready(); else { const el = $("#oTime"); if (el) el.textContent = Math.ceil((M.until - Date.now()) / 1000) + " s"; setTimeout(tick, 250); } };
    tick();
  }
  function ready() { const M = ON.match; if (!M || M.ready) return; M.ready = true; net({ t: "order", order: M.pick }); draw(); }

  // ---------- screens ----------
  const curTeam = () => P.teams[P.cur] || P.teams[0] || null;
  const sprImg = (k, cls = "") => `<img class="px o-spr ${cls}" src="${sprFront(k)}" alt="">`;
  const go = v => { ON.view = v; draw(); };
  function draw() {
    const el = $("#online"); if (!el) return;
    const v = ON.view;
    el.innerHTML = `<div class="o-in">${v === "home" ? home() : v === "builder" ? builder() : v === "team" ? teamEd() : v === "mon" ? monEd() : v === "wait" ? waiting() : v === "preview" ? previewHTML() : ""}</div>`;
    bind(el);
  }
  const status = () => ON.up ? `<span class="o-dot on"></span>${ON.n} online` : `<span class="o-dot"></span>${ON.ws ? "Connecting…" : "Can't reach the server"}`;
  function home() {
    const t = curTeam(), bad = t ? teamErrors(t) : ["No team yet"];
    const lob = ON.lobby === "queue" ? `<div class="panel stack"><b>Looking for an opponent…</b><span class="small dim">Anyone who taps Find a Battle now is your match.</span><button class="btn ghost wide" data-a="cancel">Cancel</button></div>`
      : ON.lobby === "room" ? `<div class="panel stack" style="text-align:center"><span class="eyebrow">Your room code</span><b class="o-code">${ON.code}</b><span class="small dim">Your friend taps Battle a Friend and enters it.</span><button class="btn ghost wide" data-a="cancel">Cancel</button></div>` : "";
    return `<div class="o-head"><div><b class="o-logo">PokeSquad Battler</b><small>Online battles</small></div><span class="o-stat">${status()}</span></div>
      ${ON.msg ? `<div class="panel o-note">${esc(ON.msg)}</div>` : ""}
      <div class="panel o-me"><img class="o-av" src="${trainerURL(P.look)}" alt="" data-a="look"><div class="stack" style="gap:4px;flex:1">
        <span class="eyebrow">Your name</span><input id="oName" maxlength="18" placeholder="Trainer" value="${esc(P.name)}"></div></div>
      ${ON.look ? `<div class="panel o-looks">${AVATARS.map(([k, n]) => `<button data-a="setlook" data-k="${k}" class="${k === P.look ? "on" : ""}"><img src="${trainerURL(k)}" alt=""><small>${esc(n)}</small></button>`).join("")}</div>` : ""}
      <div class="panel stack"><div class="spread"><span class="eyebrow">Your team</span><button class="btn sm ghost" data-a="builder">Teambuilder</button></div>
        ${t ? `<select id="oTeam">${P.teams.map((x, i) => `<option value="${i}"${i === P.cur ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select>
        <div class="o-six">${t.mons.map(m => sprImg(m.k)).join("")}</div>` : `<span class="small dim">Build a team of up to six in the Teambuilder.</span>`}
        ${t && bad.length ? `<span class="small bad">${esc(bad[0])}</span>` : ""}</div>
      ${lob || `<div class="stack"><button class="btn wide" data-a="find"${!ON.up || bad.length ? " disabled" : ""}>Find a Battle</button>
        <div class="row" style="gap:8px"><button class="btn ghost" style="flex:1" data-a="mkroom"${!ON.up || bad.length ? " disabled" : ""}>Create a room</button>
          <input id="oCode" maxlength="5" placeholder="CODE" style="width:90px;text-transform:uppercase"><button class="btn ghost" data-a="join"${!ON.up || bad.length ? " disabled" : ""}>Join</button></div></div>`}
      <p class="tiny dim" style="text-align:center">Lv 100, the Stadium's rules: one Legendary, one Mythical, one Ultra Beast and one Paradox Pokémon, the Item Clause. Battles run on PokeSquad Battler's own rules.</p>`;
  }
  function builder() {
    return `<div class="o-head"><button class="btn sm ghost" data-a="home">Back</button><b>Teambuilder</b><button class="btn sm" data-a="newteam">New team</button></div>
      ${P.teams.map((t, i) => { const bad = teamErrors(t); return `<div class="panel stack"><div class="spread"><b>${esc(t.name)}</b><span class="small ${bad.length ? "bad" : "good"}">${bad.length ? "Not legal yet" : "Ready"}</span></div>
        <div class="o-six">${t.mons.map(m => sprImg(m.k)).join("")}</div>
        <div class="row" style="gap:6px"><button class="btn sm" data-a="editteam" data-i="${i}">Edit</button><button class="btn sm ghost" data-a="export" data-i="${i}">Export</button>
          <button class="btn sm ghost" data-a="dupteam" data-i="${i}">Copy</button><button class="btn sm red" data-a="delteam" data-i="${i}">Delete</button></div></div>`; }).join("")}
      <div class="panel stack"><span class="eyebrow">Import a team</span><textarea id="oImport" rows="5" placeholder="Paste a team: one Pokémon per block, like Pokémon Showdown's export"></textarea>
        <button class="btn sm ghost" data-a="import">Import</button></div>`;
  }
  function teamEd() {
    const t = ON.edit, bad = teamErrors(t);
    return `<div class="o-head"><button class="btn sm ghost" data-a="builder">Done</button><input id="oTName" maxlength="24" value="${esc(t.name)}" style="flex:1;margin:0 8px"></div>
      ${bad.length ? `<div class="panel o-note bad small">${bad.map(esc).join("<br>")}</div>` : `<div class="panel o-note good small">Ready to battle</div>`}
      ${t.mons.map((m, i) => `<button class="panel o-mon" data-a="editmon" data-i="${i}">${sprImg(m.k)}<span class="stack" style="gap:2px;text-align:left">
        <b>${esc(OPS[m.k].n)}${m.held ? ` <small class="dim">@ ${esc(HELD[m.held].n)}</small>` : ""}</b><span class="row" style="gap:3px">${typeChips(OPS[m.k].types)}</span>
        <small class="dim">${esc(abName(m.ab))} · ${esc(natName(m.nat))} · ${m.mv.map(x => x ? esc(MOVES[x].n) : "—").join(" / ")}</small></span></button>`).join("")}
      ${t.mons.length < ROSTER ? `<button class="btn wide ghost" data-a="addmon">Add a Pokémon</button>` : ""}`;
  }
  function monEd() {
    const t = ON.edit, m = t.mons[ON.slot];
    if (!m) {   // choosing the Pokémon
      const q = low(ON.q), list = SPECIES.filter(k => !q || low(OPS[k].n).includes(q) || OPS[k].types.some(x => low(x) === q)).slice(0, 60);
      return `<div class="o-head"><button class="btn sm ghost" data-a="team">Back</button><b>Choose a Pokémon</b><span></span></div>
        <input id="oQ" placeholder="Search by name or type" value="${esc(ON.q)}" autocomplete="off">
        <div class="o-list">${list.map(k => `<button class="o-pick" data-a="pickmon" data-k="${k}">${sprImg(k)}<span><b>${esc(OPS[k].n)}</b><span class="row" style="gap:3px">${typeChips(OPS[k].types)}</span></span></button>`).join("")}</div>`;
    }
    const op = OPS[m.k], bad = monErrors(m);
    const sel = (id, opts, cur) => `<select id="${id}">${opts.map(([v, n]) => `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
    const mvOpts = s => [["", "—"], ...pool(m.k).filter(x => MOVES[x].s === s).sort((a, b) => MOVES[a].n.localeCompare(MOVES[b].n)).map(x => [x, `${MOVES[x].n} · ${MOVES[x].t}${MOVES[x].c === "X" ? " status" : ` ${MOVES[x].p || "—"}`}`])];
    return `<div class="o-head"><button class="btn sm ghost" data-a="team">Done</button><b>${esc(op.n)}</b><button class="btn sm red" data-a="delmon">Remove</button></div>
      <div class="panel o-mon">${sprImg(m.k)}<span class="stack" style="gap:3px"><span class="row" style="gap:3px">${typeChips(op.types)}</span>
        <small class="dim">Lv ${LEVEL} · base ${op.b.join(" / ")}</small><button class="btn sm" data-a="optimize">Optimize</button></span></div>
      ${bad.length ? `<div class="panel o-note bad small">${bad.map(esc).join("<br>")}</div>` : ""}
      <div class="panel stack o-form">
        <label>S1 ${sel("oS1", mvOpts(1), m.mv[0] || "")}</label><label>S2 ${sel("oS2", mvOpts(2), m.mv[1] || "")}</label><label>S3 ${sel("oS3", mvOpts(3), m.mv[2] || "")}</label>
        <label>Ability ${sel("oAb", op.abs.map(a => [a.k, abName(a.k) + (a.h ? " (Hidden)" : "")]), m.ab)}</label>
        <label>Nature ${sel("oNat", Object.keys(NATURES).map(n => [n, natName(n) + (NATURES[n].length ? ` (+${NATURES[n][0]} −${NATURES[n][1]})` : "")]), m.nat)}</label>
        <label>Held item ${sel("oHeld", [["", "None"], ...itemsFor(m.k).map(h => [h, HELD[h].n])], m.held || "")}</label>
        <p class="tiny dim">${m.held ? esc(HELD[m.held].d) : ""}</p><p class="tiny dim">${esc(abilityOf(m.ab).text)}</p></div>`;
  }
  function waiting() {
    const M = ON.match;
    return `<div class="o-head"><b>Online Battle</b><span></span></div><div class="panel stack" style="text-align:center"><b>${M ? `Matched with ${esc(M.opp.name)}!` : "…"}</b>
      <span class="small dim">Swapping teams…</span></div>`;
  }
  function previewHTML() {
    const M = ON.match; if (!M) return "";
    const mine = M.teams[M.side].mons, opp = M.teams[M.side === "A" ? "E" : "A"].mons;
    return `<div class="o-head"><b>Team Preview</b><span class="o-stat" id="oTime"></span></div>
      <div class="panel stack"><span class="eyebrow">${esc(M.opp.name)}'s team</span><div class="o-six">${opp.map(m => sprImg(m.k)).join("")}</div></div>
      <div class="panel stack"><span class="eyebrow">Your order: the first three lead</span>
        <div class="o-order">${M.pick.map((i, n) => `<button data-a="order" data-n="${n}" class="${n < ACTIVE ? "lead" : ""}${M.sel === n ? " sel" : ""}">${sprImg(mine[i].k)}<small>${n < ACTIVE ? "Lead" : "Bench"}</small></button>`).join("")}</div>
        <span class="small dim">Tap two to swap them.</span></div>
      <button class="btn wide" data-a="ready"${M.ready ? " disabled" : ""}>${M.ready ? `Waiting for ${esc(M.opp.name)}…` : "Ready"}</button>`;
  }
  function bind(el) {
    const val = id => { const x = $("#" + id, el); return x ? x.value : ""; };
    const on = (id, ev, f) => { const x = $("#" + id, el); if (x) x["on" + ev] = f; };
    on("oName", "change", () => { P.name = val("oName").trim().slice(0, 18); keep(); if (ON.ws) { ON.ws.close(); } });
    on("oTeam", "change", () => { P.cur = +val("oTeam"); keep(); draw(); });
    on("oTName", "change", () => { ON.edit.name = val("oTName").trim() || "Team"; save(); });
    on("oQ", "input", () => { ON.q = val("oQ"); const c = el.querySelector("#oQ"), pos = c.selectionStart; draw(); const n = $("#oQ"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } });
    const m = ON.edit && ON.edit.mons[ON.slot];
    for (const [id, f] of [["oS1", v => m.mv[0] = v || null], ["oS2", v => m.mv[1] = v || null], ["oS3", v => m.mv[2] = v || null], ["oAb", v => m.ab = v], ["oNat", v => m.nat = v], ["oHeld", v => m.held = v || null]])
      on(id, "change", () => { f(val(id)); save(); draw(); });
    for (const b of el.querySelectorAll("[data-a]")) b.onclick = () => act(b.dataset.a, b.dataset);
  }
  const save = () => { if (ON.edit) P.teams[ON.editI] = ON.edit; keep(); };
  function act(a, d) {
    sfx("tap");
    const t = ON.edit;
    switch (a) {
      case "home": go("home"); break;
      case "builder": ON.edit = null; go("builder"); break;
      case "look": ON.look = !ON.look; draw(); break;
      case "setlook": P.look = d.k; ON.look = false; keep(); if (ON.ws) ON.ws.close(); draw(); break;
      case "find": ON.msg = ""; net({ t: "find" }); break;
      case "mkroom": ON.msg = ""; net({ t: "room" }); break;
      case "join": { const c = ($("#oCode").value || "").trim().toUpperCase(); if (c.length === 5) { ON.msg = ""; net({ t: "room", code: c }); } else toast("Enter the 5-letter room code"); break; }
      case "cancel": net({ t: "cancel" }); break;
      case "newteam": P.teams.push({ name: "Team " + (P.teams.length + 1), mons: [] }); keep(); ON.editI = P.teams.length - 1; ON.edit = P.teams[ON.editI]; go("team"); break;
      case "editteam": ON.editI = +d.i; ON.edit = JSON.parse(JSON.stringify(P.teams[+d.i])); go("team"); break;
      case "dupteam": P.teams.push({ ...JSON.parse(JSON.stringify(P.teams[+d.i])), name: P.teams[+d.i].name + " (copy)" }); keep(); draw(); break;
      case "delteam": if (confirm(`Delete ${P.teams[+d.i].name}?`)) { P.teams.splice(+d.i, 1); P.cur = Math.min(P.cur, Math.max(0, P.teams.length - 1)); keep(); draw(); } break;
      case "export": { const txt = teamText(P.teams[+d.i]); try { navigator.clipboard.writeText(txt); toast("Team copied as text"); } catch (e) { prompt("Copy the team", txt); } break; }
      case "import": { const mons = parseTeam($("#oImport").value); if (!mons.length) { toast("No Pokémon found in that text"); break; } P.teams.push({ name: "Imported team", mons }); keep(); toast(`Imported ${mons.length} Pokémon`); draw(); break; }
      case "team": go("team"); break;
      case "addmon": ON.slot = t.mons.length; ON.q = ""; go("mon"); break;
      case "editmon": ON.slot = +d.i; go("mon"); break;
      case "pickmon": t.mons[ON.slot] = blank(d.k); save(); go("mon"); break;
      case "delmon": t.mons.splice(ON.slot, 1); save(); go("team"); break;
      case "optimize": t.mons[ON.slot] = optimize(t.mons[ON.slot].k, t); save(); toast("Optimized with the game's optimizer"); draw(); break;
      case "order": { const M = ON.match, n = +d.n; if (!M || M.ready) break; if (M.sel == null) M.sel = n; else { [M.pick[M.sel], M.pick[n]] = [M.pick[n], M.pick[M.sel]]; M.sel = null; } draw(); break; }
      case "ready": ready(); break;
    }
  }

  // ---------- the page ----------
  const css = document.createElement("style");
  css.textContent = `#online{position:absolute;inset:0;z-index:30;background:var(--bg);overflow:auto;padding:calc(10px + var(--sat)) 12px calc(16px + var(--sab))}
    #online .o-in{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
    #online .o-head{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px}
    #online .o-head small{display:block;color:var(--dim, #6b7280);font-size:12px}
    #online .o-logo{font:900 22px var(--f-head, inherit);color:#e8402c;letter-spacing:.5px}
    #online .o-stat{font-size:13px;display:flex;align-items:center;gap:5px}
    #online .o-dot{width:9px;height:9px;border-radius:50%;background:#c33;display:inline-block}#online .o-dot.on{background:#2bb673}
    #online .o-me{display:flex;gap:12px;align-items:center}#online .o-av{width:64px;height:64px;object-fit:contain;image-rendering:pixelated;cursor:pointer}
    #online .o-looks{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:6px}
    #online .o-looks button{background:none;border:2px solid transparent;border-radius:10px;padding:2px;display:flex;flex-direction:column;align-items:center}
    #online .o-looks button.on{border-color:#e8402c}#online .o-looks img{width:52px;height:52px;object-fit:contain;image-rendering:pixelated}#online .o-looks small{font-size:10px}
    #online .o-six{display:flex;gap:2px;flex-wrap:wrap}#online .o-six .o-spr{width:44px;height:44px}
    #online .o-code{font:900 34px monospace;letter-spacing:6px}
    #online .o-note{padding:10px 12px}
    #online .o-mon{display:flex;gap:10px;align-items:center;width:100%;text-align:left;cursor:pointer}#online .o-mon .o-spr{width:56px;height:56px;flex:none}
    #online .o-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
    #online .o-pick{display:flex;gap:6px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:4px;text-align:left}#online .o-pick .o-spr{width:44px;height:44px;flex:none}
    #online .o-form label{display:flex;flex-direction:column;gap:3px;font-size:12px;font-weight:700}
    #online input,#online select,#online textarea{width:100%;font:inherit;font-size:15px;padding:8px 10px;border:2px solid var(--line);border-radius:10px;background:#fff;color:var(--text)}
    #online .o-order{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
    #online .o-order button{background:var(--card);border:2px solid var(--line);border-radius:12px;padding:4px;display:flex;flex-direction:column;align-items:center}
    #online .o-order button.lead{border-color:#2bb673}#online .o-order button.sel{border-color:#e8402c;box-shadow:0 0 0 3px #e8402c55}#online .o-order .o-spr{width:52px;height:52px}
    #online .bad{color:var(--bad)}#online .good{color:#1f9d55}
    #online .px{image-rendering:pixelated}`;
  document.head.appendChild(css);
  const root = document.createElement("div"); root.id = "online"; $("#screen").appendChild(root);
  // into a save that only lives on this page (the battle screen reads its settings and your look); the Game Boy buttons scroll
  const sv = newSave(); Object.assign(sv, { named: true, seenIntro: true, name: myName(), looks: AVATARS.map(a => a[0]), avatar: P.look });
  hideTitle(); SESSION = { id: "online", name: "Online" };
  enterGame("pks_tmp_online", { save: sv });
  closeModal();
  window.openModal = () => {};   // (the game's own pop-ups have no place here)
  const syncLook = () => { if (S) { S.avatar = P.look; S.name = myName(); } };
  setInterval(syncLook, 1000);
  window.gbApp = k => { const el = $("#online"); if (el && !el.hidden && (k === "up" || k === "down")) el.scrollBy({ top: (k === "up" ? -1 : 1) * el.clientHeight * .45, behavior: "smooth" }); };
  document.title = "PokeSquad Battler · Online";
  if (!P.teams.length) {   // (a first team to try it with, built by the optimizer one Pokémon at a time, so the Item Clause holds)
    const t = { name: "Starter team", mons: [] };
    for (const k of ["charizard", "blastoise", "venusaur", "pikachu", "snorlax", "lapras"]) if (OPS[k]) t.mons.push(optimize(k, t));
    P.teams.push(t); keep();
  }
  draw();
  connect();
  window.PKS_ONLINE = { P, ON, teamErrors, optimize, parseTeam, teamText, spec, net };   // (tests)
})();
