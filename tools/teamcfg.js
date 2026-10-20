// =====================================================================
//  TEAM CONFIG — "PokeSquad Battler Team Config.html" (tools/build_teamcfg.js puts this into a copy of the built game).
//  The owner's editor for how Trainer teams are made in every Stadium mode (Ranked, Link, Friendly and any added later):
//    Roles       the Pokémon that fit each role (with how well), the moves, Abilities and held items it's there for, and which of
//                those it always keeps (the rest of its set is optimized), whether it leads, keeps a priority move, sets up
//    Archetypes  each archetype and its sub-archetypes: the role slots in order, the pool for the rest of the six, the moves,
//                Abilities and items the team favors or bans, the plan Trainers describe in chat, how often it's picked
//    Rules       for every Trainer team: the Item Clause, the PvP limits, the restricted list (empty), what no team may have
//    Tiers       per Ranked tier: how many run an archetype team, perfect IVs, optimized sets, max Mastery
//    Modes       per mode: what that mode bans on top; a mode added later takes the Default's
//  Export writes config/team_config.json into the project folder (it asks for the folder once and remembers it); the game reads
//  it when it's built (build.sh embeds it as TEAM_CONFIG, a6g_teams.js builds every Trainer team from it).
//  Unsaved edits are kept on this device between visits. It never writes to the game's saves.
// =====================================================================
(() => {
  // storage: this page's own draft only, never a game save
  try {
    const set = Storage.prototype.setItem, rm = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (k, v) { if (String(k).startsWith("pks_teamcfg")) set.call(this, k, v); };
    Storage.prototype.removeItem = function (k) { if (String(k).startsWith("pks_teamcfg")) rm.call(this, k); };
    Storage.prototype.clear = function () {};
  } catch (e) { /* no storage */ }
  // quiet: no music or sounds on this page (the game underneath starts its title music; nothing here may play)
  try {
    HTMLMediaElement.prototype.play = function () { this.pause(); return Promise.resolve(); };
    const hush = () => document.querySelectorAll("audio, video").forEach(a => { a.pause(); a.muted = true; });
    hush(); new MutationObserver(hush).observe(document.documentElement, { childList: true, subtree: true });
    for (const C2 of [window.AudioContext, window.webkitAudioContext].filter(Boolean)) { C2.prototype.resume = function () { return Promise.resolve(); }; }
    for (const f of ["music", "jingle", "sfx", "cry"]) try { window[f] = () => {}; } catch (e) { /* a constant */ }
    // the game's music player (a8c_sfx.js) keeps its track in a script-made Audio, and one waiting for the first tap: both off
    const off = () => { try { MUS.want = null; if (MUS.el) MUS.el.pause(); if (MUS.jingle) MUS.jingle.pause(); MUS.el = null; MUS.jingle = null; } catch (e) { /* none */ } };
    off(); setInterval(off, 1000);
  } catch (e) { /* fine */ }

  const clone = o => JSON.parse(JSON.stringify(o));
  const ORIGINAL = typeof TEAM_CONFIG_DEFAULT !== "undefined" && TEAM_CONFIG_DEFAULT ? TEAM_CONFIG_DEFAULT : TEAM_CONFIG;
  const DRAFT_KEY = "pks_teamcfg_draft";
  // ---------- the game's data ----------
  const byDex = (a, b) => OPS[a].id - OPS[b].id;
  const POOL = COMP_POOL().slice().sort(byDex);   // fully evolved, at least two moves: who can stand in a competitive team
  const ALLMON = Object.keys(OPS).sort(byDex);
  const MOVE_KEYS = Object.keys(MOVES).filter(m => m !== "struggle").sort((a, b) => MOVES[a].n.localeCompare(MOVES[b].n));
  const AB_KEYS = [...new Set(ALLMON.flatMap(k => OPS[k].abs.map(a => a.k)))].filter(a => ABILITY[a]).sort((a, b) => abilityOf(a).name.localeCompare(abilityOf(b).name));
  const ITEM_KEYS = HELD_KEYS.slice().sort((a, b) => HELD[a].n.localeCompare(HELD[b].n));
  const TYPE_LIST = TYPES.slice();
  const LEARN = {}; const learnsM = (k, m) => (LEARN[k] || (LEARN[k] = new Set(learnPool(k)))).has(m);
  const hasAbK = (k, a) => OPS[k].abs.some(x => x.k === a);
  const KIND_HELP = Object.fromEntries(Object.keys(ROLE_NAME).map(k => [k, ROLE_NAME[k]]));
  const nameOf = { pokemon: k => OPS[k] ? OPS[k].n : k, moves: k => MOVES[k] ? MOVES[k].n : k, abilities: k => ABILITY[k] ? abilityOf(k).name : k, items: k => HELD[k] ? HELD[k].n : k };
  const exists = { pokemon: k => !!OPS[k], moves: k => !!MOVES[k], abilities: k => !!ABILITY[k], items: k => !!HELD[k] };
  const esc2 = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- the config being edited ----------
  let C = clone(TEAM_CONFIG), dirty = false, note = "";
  try { const d = localStorage.getItem(DRAFT_KEY); if (d) { const x = JSON.parse(d); if (JSON.stringify(x) !== JSON.stringify(TEAM_CONFIG)) { C = x; dirty = true; note = "Your unsaved changes from last time are back. Export to save them, or Undo all to start from the game's config."; } } } catch (e) { /* none */ }
  const fix = () => {   // fill in anything an older or hand-made file lacks
    C.roles = C.roles || {}; C.archetypes = C.archetypes || []; C.rules = C.rules || {}; C.tiers = C.tiers || []; C.modes = C.modes || {};
    C.rules.itemClause = C.rules.itemClause || []; C.rules.restricted = C.rules.restricted || []; C.rules.limits = C.rules.limits || { legendary: 1, mythical: 1, ultraBeast: 1, paradox: 1 };
    C.rules.ban = Object.assign({ pokemon: [], moves: [], abilities: [], items: [] }, C.rules.ban || {});
    for (const id in C.roles) { const R = C.roles[id]; R.pokemon = R.pokemon || {}; R.moves = R.moves || []; R.abilities = R.abilities || []; R.items = R.items || []; R.keep = Object.assign({ moves: false, abilities: false, items: false, setup: false, priorityAttacks: false }, R.keep || {}); R.movesIf = R.movesIf || []; }
    for (const A of C.archetypes) { A.overlaps = A.overlaps || []; A.overlapChance = A.overlapChance || 0; }
    for (const A of C.archetypes) for (const S of A.subs) { S.slots = S.slots || []; S.favor = Object.assign({ moves: [], abilities: [], items: [] }, S.favor || {}); S.ban = Object.assign({ pokemon: [], moves: [], abilities: [], items: [] }, S.ban || {}); }
    C.modes.default = C.modes.default || {}; for (const m in C.modes) C.modes[m].ban = Object.assign({ pokemon: [], items: [] }, C.modes[m].ban || {});
    for (const m of ["ranked", "link", "friendly"]) C.modes[m] = C.modes[m] || { ban: { pokemon: [], items: [] } };
  };
  fix();
  const changed = () => { dirty = true; try { localStorage.setItem(DRAFT_KEY, JSON.stringify(C)); } catch (e) { /* full */ } };
  const UI2 = { tab: "roles", role: Object.keys(C.roles)[0], arch: (C.archetypes[0] || {}).id, sub: 0, roleQ: "", open: {}, pick: {} };
  const usedIn = id => C.archetypes.flatMap(A => A.subs.filter(S => S.slots.some(([r]) => r === id)).map(S => `${A.name} · ${S.name}`));
  const kinds = () => [...new Set([...Object.keys(ROLE_JOB), ...Object.keys(ROLE_NAME), ...Object.values(C.roles).map(R => R.kind).filter(Boolean)])].sort();

  // ---------- pickers: a searchable grid of Pokémon, moves, Abilities or items bound to part of the config ----------
  // mode "fit": a { key: fit } map (Pokémon that fit a role, with how well: 1 to 5 stars); "set": a list; "list": an ordered list
  let PICK = {};
  const fitRange = map => { const v = Object.values(map); return v.length ? [Math.min(...v), Math.max(...v)] : [0, 100]; };
  const starsOf = (map, k) => { const [lo, hi] = fitRange(map); return hi > lo ? 1 + Math.round((map[k] - lo) / (hi - lo) * 4) : 3; };
  const valueFor = (map, n) => { const [lo, hi] = fitRange(map); return hi > lo ? Math.round((lo + (n - 1) / 4 * (hi - lo)) * 10) / 10 : n * 20; };
  function picker(id, P) {
    // P: { kind, mode, get(), set(v), title, help, pool?, ctx? (k => small note), smart? [[label, fn]] }
    PICK[id] = P;
    const F = UI2.pick[id] = UI2.pick[id] || { q: "", type: "", slot: "", cat: "", only: false };
    const v = P.get(), sel = P.mode === "fit" ? Object.keys(v) : v.slice(), has = k => P.mode === "fit" ? v[k] != null : v.includes(k);
    const universe = P.pool || { pokemon: POOL, moves: MOVE_KEYS, abilities: AB_KEYS, items: ITEM_KEYS }[P.kind];
    const q = F.q.trim().toLowerCase();
    let list = universe.filter(k => !q || nameOf[P.kind](k).toLowerCase().includes(q) || k.includes(q));
    if (F.type) list = list.filter(k => P.kind === "pokemon" ? OPS[k].types.includes(F.type) : P.kind === "moves" ? MOVES[k].t === F.type : true);
    if (F.slot && P.kind === "moves") list = list.filter(k => String(MOVES[k].s) === F.slot);
    if (F.cat && P.kind === "moves") list = list.filter(k => MOVES[k].c === F.cat);
    if (F.only) list = list.filter(has);
    list = [...list.filter(has), ...list.filter(k => !has(k))];   // (the chosen first)
    const missing = sel.filter(k => !exists[P.kind](k));
    const count = sel.length, open = UI2.open[id] != null ? UI2.open[id] : !P.closed;
    const chip = k => chipHTML(id, P, k, has(k), v);
    const chosen = P.mode === "list" ? `<div class="ordered">${v.map((k, i) => `<span class="oi">${i + 1}. ${esc2(nameOf[P.kind](k))}<button data-a="up" data-p="${id}" data-i="${i}" title="Earlier">↑</button><button data-a="dn" data-p="${id}" data-i="${i}" title="Later">↓</button><button data-a="rm" data-p="${id}" data-k="${esc2(k)}" title="Remove">×</button></span>`).join("") || '<span class="dim">None yet: pick below.</span>'}</div>` : "";
    return `<section class="pk${open ? " open" : ""}" data-pk="${id}">
      <header data-a="fold" data-p="${id}"><b>${esc2(P.title)}</b><span class="cnt">${count}</span><span class="fold">${open ? "▾ hide" : "▸ show"}</span>${P.help ? `<span class="help">${esc2(P.help)}</span>` : ""}</header>
      ${open ? `<div class="pkbody">
        ${missing.length ? `<div class="warn">Not in the game: ${missing.map(esc2).join(", ")} <button data-a="dropmissing" data-p="${id}">Remove them</button></div>` : ""}
        ${chosen}
        <div class="tools">
          <input type="search" placeholder="Search ${P.kind === "pokemon" ? "Pokémon" : P.kind}" value="${esc2(F.q)}" data-q="${id}">
          ${P.kind === "pokemon" || P.kind === "moves" ? `<select data-f="type" data-p="${id}"><option value="">Any type</option>${TYPE_LIST.map(t => `<option${F.type === t ? " selected" : ""}>${t}</option>`).join("")}</select>` : ""}
          ${P.kind === "moves" ? `<select data-f="slot" data-p="${id}"><option value="">Any slot</option>${[1, 2, 3].map(s => `<option value="${s}"${F.slot === String(s) ? " selected" : ""}>S${s}</option>`).join("")}</select>
            <select data-f="cat" data-p="${id}"><option value="">Any category</option>${[["P", "Physical"], ["S", "Special"], ["X", "Status"]].map(([c, n]) => `<option value="${c}"${F.cat === c ? " selected" : ""}>${n}</option>`).join("")}</select>` : ""}
          <label class="chk"><input type="checkbox" data-f="only" data-p="${id}"${F.only ? " checked" : ""}> Chosen only</label>
          ${(P.smart || []).map(([label], i) => `<button class="g" data-a="smart" data-p="${id}" data-i="${i}">${esc2(label)}</button>`).join("")}
          <button class="g" data-a="clear" data-p="${id}">Clear</button>
        </div>
        <div class="grid ${P.kind}" data-grid="${id}">${list.slice(0, 400).map(chip).join("") || '<span class="dim">Nothing matches.</span>'}${list.length > 400 ? `<span class="dim">…and ${list.length - 400} more: search to narrow it down.</span>` : ""}</div>
      </div>` : ""}
    </section>`;
  }
  function chipHTML(id, P, k, on, v) {
    const note = P.ctx ? P.ctx(k) : "";
    if (P.kind === "pokemon") {
      const st = on && P.mode === "fit" ? `<span class="stars">${[1, 2, 3, 4, 5].map(n => `<i data-a="star" data-p="${id}" data-k="${k}" data-n="${n}" class="${n <= starsOf(v, k) ? "s on" : "s"}">★</i>`).join("")}</span>` : "";
      return `<button class="ch mon${on ? " on" : ""}" data-a="tog" data-p="${id}" data-k="${k}" title="${esc2(OPS[k].n)} · ${OPS[k].types.join("/")}${note ? " · " + esc2(note) : ""}"><img src="${sprFront(k)}" alt=""><span class="nm">${esc2(OPS[k].n)}</span><span class="ty">${OPS[k].types.map(t => `<em class="t" style="background:${TC[t]}">${t.slice(0, 3)}</em>`).join("")}</span>${st}${note ? `<span class="nt">${esc2(note)}</span>` : ""}</button>`;
    }
    if (P.kind === "moves") { const M = MOVES[k];
      return `<button class="ch mv${on ? " on" : ""}" data-a="tog" data-p="${id}" data-k="${k}" title="${esc2(M.n)}: ${esc2(moveDesc(makeSkill(k, M.s)))}"><b>${esc2(M.n)}</b><span class="row2"><em class="t" style="background:${TC[M.t] || "#777"}">${M.t}</em><em class="c c${M.c}">${{ P: "Phys", S: "Spec", X: "Status" }[M.c]}</em><em>S${M.s}</em>${M.p ? `<em>${powText(k)}</em>` : ""}</span>${note ? `<span class="nt">${esc2(note)}</span>` : ""}</button>`; }
    if (P.kind === "abilities") { const A = abilityOf(k);
      return `<button class="ch ab${on ? " on" : ""}" data-a="tog" data-p="${id}" data-k="${k}" title="${esc2(A.name)}: ${esc2(A.text)}"><b>${esc2(A.name)}</b>${note ? `<span class="nt">${esc2(note)}</span>` : ""}</button>`; }
    const H = HELD[k];
    return `<button class="ch it${on ? " on" : ""}" data-a="tog" data-p="${id}" data-k="${k}" title="${esc2(H.n)}: ${esc2(H.d)}"><span class="ic">${heldIcon(k)}</span><b>${esc2(H.n)}</b>${note ? `<span class="nt">${esc2(note)}</span>` : ""}</button>`;
  }
  function pickToggle(id, k) {
    const P = PICK[id]; if (!P) return; const v = P.get();
    if (P.mode === "fit") { const m = { ...v }; if (m[k] != null) delete m[k]; else m[k] = valueFor(v, 3); P.set(m); }
    else P.set(v.includes(k) ? v.filter(x => x !== k) : [...v, k]);
    changed();
  }

  // ---------- the tabs ----------
  const TABS = [["roles", "Roles"], ["archetypes", "Archetypes"], ["rules", "Rules"], ["tiers", "Tiers"], ["modes", "Modes"], ["check", "Check & export"]];
  function rolesTab() {
    const ids = Object.keys(C.roles).sort((a, b) => C.roles[a].name.localeCompare(C.roles[b].name));
    if (!C.roles[UI2.role]) UI2.role = ids[0];
    const q = UI2.roleQ.toLowerCase(), R = C.roles[UI2.role];
    const side = `<aside><input type="search" placeholder="Search roles" value="${esc2(UI2.roleQ)}" data-rq="1">
      <div class="btns"><button data-a="newrole">New role</button>${R ? `<button class="g" data-a="duprole">Duplicate</button><button class="g" data-a="delrole">Delete</button>` : ""}</div>
      <nav>${ids.filter(id => !q || C.roles[id].name.toLowerCase().includes(q) || id.includes(q) || (C.roles[id].kind || "").includes(q)).map(id => `<button class="li${id === UI2.role ? " on" : ""}" data-a="role" data-k="${id}">${esc2(C.roles[id].name)}<small>${esc2(C.roles[id].kind || "")} · ${Object.keys(C.roles[id].pokemon).length} Pokémon${usedIn(id).length ? "" : " · not used"}</small></button>`).join("")}</nav></aside>`;
    if (!R) return `<div class="cols">${side}<main><p class="dim">No roles yet.</p></main></div>`;
    const rid = UI2.role, inRole = k => R.pokemon[k] != null, mons = Object.keys(R.pokemon);
    const learners = m => mons.filter(k => learnsM(k, m)).length, abHolders = a => mons.filter(k => hasAbK(k, a)).length;
    const noMove = R.keep.moves && R.moves.length ? mons.filter(k => !R.moves.some(m => learnsM(k, m))) : [];
    const noAb = R.keep.abilities && R.abilities.length ? mons.filter(k => !R.abilities.some(a => hasAbK(k, a))) : [];
    const main = `<main>
      <div class="frm">
        <label>Name<input type="text" data-v="role.name" value="${esc2(R.name)}"></label>
        <label>Kind <small>(what Trainers say it does in chat)</small><select data-v="role.kind">${kinds().map(k => `<option value="${k}"${R.kind === k ? " selected" : ""}>${esc2(k)}${KIND_HELP[k] ? " · " + esc2(KIND_HELP[k]) : ""}</option>`).join("")}<option value="__new">New kind…</option></select></label>
        <div class="used">Used in: ${usedIn(rid).map(esc2).join(" · ") || '<span class="dim">no archetype yet (add it as a slot on the Archetypes tab)</span>'}<span class="dim"> · id ${esc2(rid)}</span></div>
      </div>
      <div class="flags">
        <label class="chk"><input type="checkbox" data-v="role.lead"${R.lead ? " checked" : ""}> Leads (sent out first)</label>
        <label class="chk"><input type="checkbox" data-v="role.bench"${R.bench ? " checked" : ""}> Waits on the bench (a backup setter: never a lead)</label>
        <label class="chk"><input type="checkbox" data-v="role.need"${R.need ? " checked" : ""}> The plan needs it (a Trainer who can't fill it runs another archetype; it also comes along when its archetype joins another)</label>
        <label class="chk"><input type="checkbox" data-v="role.priorityMove"${R.priorityMove ? " checked" : ""}> Keeps a priority move beside its job (+30% turn meter)</label>
        <label class="chk"><input type="checkbox" data-v="role.setupSweeper"${R.setupSweeper ? " checked" : ""}> Setup sweeper</label>
        <label class="chk"><input type="checkbox" data-v="role.keep.setup"${R.keep.setup ? " checked" : ""}> Always keeps a setup move</label>
        <label class="chk"><input type="checkbox" data-v="role.keep.priorityAttacks"${R.keep.priorityAttacks ? " checked" : ""}> Keeps its two best priority attacks</label>
      </div>
      <div class="frm">
        <label>Raw strength in the pick <small>(0 to 2: 2 picks the strongest, as attackers are; 0 only by the stars below; empty: 2, or 1 for a setter or support)</small><input type="number" min="0" max="3" step="0.1" data-v="role.power" value="${R.power == null ? "" : R.power}"></label>
        <label>How much the stars count <small>(0 to 1: 0.9 picks almost only by fit, as walls are; empty: 0.45, or 0.7 for a setter or support)</small><input type="number" min="0" max="1" step="0.05" data-v="role.fitWeight" value="${R.fitWeight == null ? "" : R.fitWeight}"></label>
        <label class="wide">Moves it keeps only in some archetypes <small>(move: archetype ids, e.g. <code>growth: sun</code>; one per line)</small><textarea data-onlyin="1" rows="2">${esc2(Object.entries(R.onlyIn || {}).map(([m, a]) => m + ": " + a.join(", ")).join("\n"))}</textarea></label>
      </div>
      ${picker("role.pokemon", { kind: "pokemon", mode: "fit", title: "Pokémon that fit", help: "Tap to add or remove; the stars say how well it fits (more stars, picked first). Fully evolved Pokémon only: only they stand in competitive teams.",
        get: () => R.pokemon, set: v => { R.pokemon = v; },
        ctx: k => R.moves.length && !R.moves.some(m => learnsM(k, m)) ? "learns none of its moves" : "",
        smart: [["Add all that learn its moves", () => { for (const k of POOL) if (R.moves.some(m => learnsM(k, m)) && R.pokemon[k] == null) R.pokemon[k] = valueFor(R.pokemon, 3); }],
          ["Add all with its Abilities", () => { for (const k of POOL) if (R.abilities.some(a => hasAbK(k, a)) && R.pokemon[k] == null) R.pokemon[k] = valueFor(R.pokemon, 3); }]] })}
      ${noMove.length ? `<div class="warn">${noMove.length} of its Pokémon learn none of the moves it always keeps: ${noMove.slice(0, 8).map(k => OPS[k].n).join(", ")}${noMove.length > 8 ? "…" : ""}</div>` : ""}
      <div class="keep"><label class="chk"><input type="checkbox" data-v="role.keep.moves"${R.keep.moves ? " checked" : ""}> Always keeps one of these moves (the first it can learn; otherwise its moves are optimized freely)</label>
        <label class="chk"><input type="checkbox" data-mif="special"${R.movesIf.includes("special") ? " checked" : ""}> Only on Pokémon whose Sp. Atk is at least their Attack</label>
        <label class="chk">Not on <select data-mif="notType"><option value="">(any type is fine)</option>${TYPE_LIST.map(t => `<option${R.movesIf.includes("notType:" + t) ? " selected" : ""}>${t}</option>`).join("")}</select> types</label></div>
      ${picker("role.moves", { kind: "moves", mode: "list", title: "Moves it's there for", help: "In order: it takes the first one it can learn.", get: () => R.moves, set: v => { R.moves = v; },
        ctx: k => mons.length ? `${learners(k)}/${mons.length} learn it` : "", closed: false })}
      ${noAb.length ? `<div class="warn">${noAb.length} of its Pokémon can't have the Abilities it always keeps: ${noAb.slice(0, 8).map(k => OPS[k].n).join(", ")}${noAb.length > 8 ? "…" : ""}</div>` : ""}
      <div class="keep"><label class="chk"><input type="checkbox" data-v="role.keep.abilities"${R.keep.abilities ? " checked" : ""}> Always has one of these Abilities when it can</label></div>
      ${picker("role.abilities", { kind: "abilities", mode: "list", title: "Abilities it's there for", get: () => R.abilities, set: v => { R.abilities = v; },
        ctx: k => mons.length ? `${abHolders(k)}/${mons.length} can have it` : "", pool: AB_KEYS })}
      <div class="keep"><label class="chk"><input type="checkbox" data-v="role.keep.items"${R.keep.items ? " checked" : ""}> Always holds one of these (the first one still free on the team)</label></div>
      ${picker("role.items", { kind: "items", mode: "list", title: "Held items it's there for", help: "In order: the first one the team still has free.", get: () => R.items, set: v => { R.items = v; } })}
    </main>`;
    return `<div class="cols">${side}${main}</div>`;
  }
  function archTab() {
    const A = C.archetypes.find(a => a.id === UI2.arch) || C.archetypes[0]; if (A) UI2.arch = A.id;
    const side = `<aside><div class="btns"><button data-a="newarch">New archetype</button>${A ? `<button class="g" data-a="duparch">Duplicate</button><button class="g" data-a="delarch">Delete</button>` : ""}</div>
      <nav>${C.archetypes.map((a, i) => `<button class="li${a === A ? " on" : ""}" data-a="arch" data-k="${esc2(a.id)}">${esc2(a.name)}<small>${a.subs.length} sub-archetype${a.subs.length === 1 ? "" : "s"} · weight ${a.weight}</small></button><span class="mv2"><button data-a="archup" data-i="${i}" title="Earlier">↑</button><button data-a="archdn" data-i="${i}" title="Later">↓</button></span>`).join("")}</nav></aside>`;
    if (!A) return `<div class="cols">${side}<main><p class="dim">No archetypes yet.</p></main></div>`;
    UI2.sub = Math.min(UI2.sub, A.subs.length - 1);
    const S = A.subs[UI2.sub], roleIds = Object.keys(C.roles).sort((a, b) => C.roles[a].name.localeCompare(C.roles[b].name));
    const total = S ? S.slots.reduce((a, [, n]) => a + (+n || 0), 0) : 0;
    const main = `<main>
      <div class="frm">
        <label>Name<input type="text" data-v="arch.name" value="${esc2(A.name)}"></label>
        <label>Id <small>(Trainers' playstyles name it; change with care)</small><input type="text" data-v="arch.id" value="${esc2(A.id)}"></label>
        <label>How often it's picked <small>(weight; measured by tools/viability.js; the tiers decide how hard Legends lean on it)</small><input type="number" min="0" data-v="arch.weight" value="${A.weight}"></label>
        <label>Slowest the rest of the team may be <small>(base Speed, e.g. 70 for Trick Room; empty for any)</small><input type="number" min="0" data-v="arch.coverMaxSpeed" value="${A.coverMaxSpeed == null ? "" : A.coverMaxSpeed}"></label>
        <label>How often it joins another plan <small>(%, of the Trainers running one of the archetypes ticked below)</small><input type="number" min="0" max="100" data-v="arch.overlapChance" value="${A.overlapChance || 0}"></label>
        <div class="wide"><small class="dim">It can join (as a second plan, bringing the slots marked "comes along"):</small><div class="flags">${C.archetypes.filter(a => a !== A).map(a => `<label class="chk"><input type="checkbox" data-ovl="${esc2(a.id)}"${(A.overlaps || []).includes(a.id) ? " checked" : ""}> ${esc2(a.name)}</label>`).join("")}</div></div>
        <label class="wide">The plan <small>(Trainers say it in chat)</small><textarea data-v="arch.plan" rows="2">${esc2(A.plan)}</textarea></label>
      </div>
      <div class="subs">${A.subs.map((s, i) => `<button class="${i === UI2.sub ? "on" : ""}" data-a="sub" data-i="${i}">${esc2(s.name)}</button>`).join("")}<button class="g" data-a="newsub">+ Sub-archetype</button></div>
      ${S ? `<div class="frm">
        <label>Sub-archetype name<input type="text" data-v="sub.name" value="${esc2(S.name)}"></label>
        <label class="wide">Its plan <small>(Trainers say it in chat)</small><textarea data-v="sub.plan" rows="2">${esc2(S.plan)}</textarea></label>
        <div class="btns"><button class="g" data-a="dupsub">Duplicate it</button><button class="g" data-a="delsub"${A.subs.length < 2 ? " disabled" : ""}>Delete it</button></div>
      </div>
      <h3>Role slots <small>${total} of ${ROSTER}${total < ROSTER ? ` · the other ${ROSTER - total}: the strongest Pokémon from the pool below` : total > ROSTER ? " · more than a team holds: the last ones won't fit" : ""}</small></h3>
      <table class="slots"><tr><th>#</th><th>Role</th><th>How many</th><th>Comes along <small>(when it joins another plan; empty: all of a role it needs)</small></th><th></th></tr>
        ${S.slots.map(([id, n], i) => `<tr><td>${i + 1}</td><td><select data-slot="${i}" data-f="role">${roleIds.map(r => `<option value="${r}"${r === id ? " selected" : ""}>${esc2(C.roles[r].name)}</option>`).join("")}${C.roles[id] ? "" : `<option selected value="${esc2(id)}">${esc2(id)} (missing!)</option>`}</select>
          <button class="g sm" data-a="gorole" data-k="${esc2(id)}">Edit role</button></td>
          <td><input type="number" min="1" max="6" data-slot="${i}" data-f="n" value="${n}"></td>
          <td><input type="number" min="0" max="6" data-slot="${i}" data-f="j" value="${S.slots[i][2] == null ? "" : S.slots[i][2]}"></td>
          <td><button data-a="slotup" data-i="${i}">↑</button><button data-a="slotdn" data-i="${i}">↓</button><button data-a="slotrm" data-i="${i}">×</button></td></tr>`).join("")}
      </table>
      <div class="btns"><button data-a="slotadd">+ Role slot</button><button class="g" data-a="slotnew">+ New role here</button></div>
      <p class="dim">Slots fill in order; a role's lead flag puts it in front (three at most). Restricted Pokémon (Rules tab) and bans still apply.</p>
      ${picker("sub.cover", { kind: "pokemon", mode: "fit", title: "Pokémon for the rest of the team", help: "Empty: any strong Pokémon (the strongest first, covering the team's weaknesses).", get: () => S.cover || {}, set: v => { S.cover = Object.keys(v).length ? v : null; }, closed: true })}
      ${picker("sub.favor.moves", { kind: "moves", mode: "set", title: "Moves the team favors", help: "They count 25% more when its sets are built.", get: () => S.favor.moves, set: v => { S.favor.moves = v; }, closed: true })}
      ${picker("sub.favor.abilities", { kind: "abilities", mode: "set", title: "Abilities the team favors", get: () => S.favor.abilities, set: v => { S.favor.abilities = v; }, closed: true })}
      ${picker("sub.favor.items", { kind: "items", mode: "set", title: "Held items the team favors", get: () => S.favor.items, set: v => { S.favor.items = v; }, closed: true })}
      ${picker("sub.ban.pokemon", { kind: "pokemon", mode: "set", title: "Pokémon this team never uses", get: () => S.ban.pokemon, set: v => { S.ban.pokemon = v; }, closed: true })}
      ${picker("sub.ban.moves", { kind: "moves", mode: "set", title: "Moves this team never uses", get: () => S.ban.moves, set: v => { S.ban.moves = v; }, closed: true })}
      ${picker("sub.ban.abilities", { kind: "abilities", mode: "set", title: "Abilities this team never uses", get: () => S.ban.abilities, set: v => { S.ban.abilities = v; }, closed: true })}
      ${picker("sub.ban.items", { kind: "items", mode: "set", title: "Held items this team never uses", get: () => S.ban.items, set: v => { S.ban.items = v; }, closed: true })}` : ""}
    </main>`;
    return `<div class="cols">${side}${main}</div>`;
  }
  function rulesTab() {
    const R = C.rules;
    return `<main class="solo">
      <p class="dim">These hold for every Trainer team in every Stadium mode (each mode can ban more on the Modes tab). The Item Clause is the game's house rule for everyone, you too.</p>
      ${picker("rules.itemClause", { kind: "items", mode: "set", title: "Item Clause: one per team", get: () => R.itemClause, set: v => { R.itemClause = v; } })}
      <div class="frm"><b>PvP limits: the most a team may have, in every Stadium mode, for every Trainer and for the player</b>
        ${[["legendary", "Legendary"], ["mythical", "Mythical"], ["ultraBeast", "Ultra Beast"], ["paradox", "Paradox"]].map(([g, n]) => `<label>${n} Pokémon<input type="number" min="0" max="6" data-v="rules.limits.${g}" value="${R.limits[g] == null ? "" : R.limits[g]}"></label>`).join("")}</div>
      ${picker("rules.nfe", { kind: "pokemon", mode: "set", title: "Not fully evolved, but they stand in competitive teams (with an Eviolite: Defense and Sp. Def +1)", pool: ALLMON, get: () => R.nfe || [], set: v => { R.nfe = v; } })}
      ${picker("rules.restricted", { kind: "pokemon", mode: "set", title: "Only the very strongest Trainers field these, and never as a setter or support (empty, the owner's rule: every team may field any Pokémon within the PvP limits)", pool: ALLMON, get: () => R.restricted, set: v => { R.restricted = v; } })}
      ${picker("rules.ban.pokemon", { kind: "pokemon", mode: "set", title: "No Trainer team has these Pokémon", pool: ALLMON, get: () => R.ban.pokemon, set: v => { R.ban.pokemon = v; }, closed: true })}
      ${picker("rules.ban.moves", { kind: "moves", mode: "set", title: "No Trainer team uses these moves", get: () => R.ban.moves, set: v => { R.ban.moves = v; }, closed: true })}
      ${picker("rules.ban.abilities", { kind: "abilities", mode: "set", title: "No Trainer team uses these Abilities", get: () => R.ban.abilities, set: v => { R.ban.abilities = v; }, closed: true })}
      ${picker("rules.ban.items", { kind: "items", mode: "set", title: "No Trainer team holds these items", get: () => R.ban.items, set: v => { R.ban.items = v; }, closed: true })}
    </main>`;
  }
  function tiersTab() {
    // (below Master Ball a Trainer keeps their own training: those three columns don't apply there)
    const col = (i, f, max = 100) => i < T_MASTER && f !== "archetypeChance" ? '<span class="dim">their own</span>' : `<input type="number" min="0" max="${max}" data-tier="${i}" data-f="${f}" value="${C.tiers[i][f] == null ? 0 : C.tiers[i][f]}">`;
    return `<main class="solo">
      <p class="dim">Per Ranked tier (the tier a Trainer's rating sits in; Link Battles use the same tiers by their own rating). Pokémon levels: every Trainer's Pokémon in that tier are within them (a stronger Trainer in the tier sits higher; a Pokémon that can't be that low isn't fielded there). From Master Ball up, archetype teams have all eight Badges; below it, a Trainer who runs one builds it from what they could have caught.</p>
      <table class="tiers"><tr><th>Tier</th><th>Pokémon levels</th><th>Run an archetype team %</th><th>Perfect IVs %</th><th>Optimized as a team %</th><th>Max Mastery %</th><th>Lean on strong archetypes</th></tr>
        ${C.tiers.map((T, i) => `<tr><td><b>${esc2(T.name)}</b></td><td class="lvs"><input type="number" min="1" max="100" data-tier="${i}" data-f="lvLo" value="${(T.levels || [1, 100])[0]}" aria-label="${esc2(T.name)}: lowest level"> to <input type="number" min="1" max="100" data-tier="${i}" data-f="lvHi" value="${(T.levels || [1, 100])[1]}" aria-label="${esc2(T.name)}: highest level"></td><td>${col(i, "archetypeChance")}</td><td>${col(i, "perfectIVs")}</td><td>${col(i, "optimized")}</td><td>${col(i, "maxMastery")}</td>
          <td><select data-tier="${i}" data-f="favorStrong">${[[0, "Not at all: every archetype as often"], [1, "Some (by weight)"], [2, "Hard (weight squared)"], [3, "Very hard (cubed)"]].map(([v, n]) => `<option value="${v}"${(+T.favorStrong || 0) === v ? " selected" : ""}>${n}</option>`).join("")}</select></td></tr>`).join("")}
      </table>
      <p class="dim">Below Master Ball, Trainers keep their own IVs, sets and Mastery (only the archetype chance applies).</p>
    </main>`;
  }
  function modesTab() {
    const ids = Object.keys(C.modes), name = m => ({ default: "Default: every Stadium mode, and any added later", ranked: "Ranked Battles", link: "Link Battles", friendly: "Friendly battles" }[m] || C.modes[m].name || m);
    return `<main class="solo">
      <p class="dim">When a mode sends a Trainer's team out: a Pokémon it bans (or one past the PvP limits on the Rules tab) gives its place to the next in their box, and a banned item comes off. A mode's own list adds to the Default's.</p>
      ${ids.map(m => { const M = C.modes[m];
        return `<div class="mode"><h3>${esc2(name(m))}${["default", "ranked", "link", "friendly"].includes(m) ? "" : ` <button class="g sm" data-a="delmode" data-k="${esc2(m)}">Delete</button>`}</h3>

          ${picker("mode." + m + ".pokemon", { kind: "pokemon", mode: "set", title: "Pokémon banned here", pool: ALLMON, get: () => M.ban.pokemon, set: v => { M.ban.pokemon = v; }, closed: true })}
          ${picker("mode." + m + ".items", { kind: "items", mode: "set", title: "Held items banned here", get: () => M.ban.items, set: v => { M.ban.items = v; }, closed: true })}</div>`; }).join("")}
      <div class="btns"><button data-a="newmode">+ A mode (for one added later)</button></div>
    </main>`;
  }
  function problems() {
    const out = [];
    for (const [id, R] of Object.entries(C.roles)) {
      if (!Object.keys(R.pokemon).length) out.push(["bad", `Role “${R.name}”: no Pokémon fit it.`]);
      for (const k of Object.keys(R.pokemon)) if (!OPS[k]) out.push(["warn", `Role “${R.name}”: ${k} isn't a Pokémon in the game (skipped).`]);
      for (const [kind, list] of [["moves", R.moves], ["abilities", R.abilities], ["items", R.items]]) for (const k of list) if (!exists[kind](k)) out.push(["warn", `Role “${R.name}”: ${k} isn't in the game (skipped).`]);
      if (R.keep.moves && R.moves.length) { const n = Object.keys(R.pokemon).filter(k => OPS[k] && !R.moves.some(m => learnsM(k, m))).length; if (n) out.push(["warn", `Role “${R.name}”: ${n} of its Pokémon learn none of the moves it always keeps.`]); }
      if (!usedIn(id).length) out.push(["info", `Role “${R.name}” isn't in any archetype.`]);
      if (!ROLE_JOB[R.kind] && !ROLE_NAME[R.kind]) out.push(["info", `Role “${R.name}”: Trainers have no chat line yet for its kind “${R.kind}” (they'll describe it by its moves).`]);
    }
    const ids = new Set();
    for (const A of C.archetypes) {
      if (ids.has(A.id)) out.push(["bad", `Two archetypes share the id “${A.id}”.`]); ids.add(A.id);
      if (!A.subs.length) out.push(["bad", `${A.name}: no sub-archetypes.`]);
      if (!(A.weight > 0)) out.push(["warn", `${A.name}: weight 0, so no Trainer picks it.`]);
      for (const S of A.subs) {
        const t = S.slots.reduce((a, [, n]) => a + (+n || 0), 0);
        if (t > ROSTER) out.push(["warn", `${A.name} · ${S.name}: ${t} role slots, more than the ${ROSTER} a team holds (the last ${t - ROSTER} never get a place).`]);
        for (const [id] of S.slots) if (!C.roles[id]) out.push(["bad", `${A.name} · ${S.name}: the role “${id}” doesn't exist.`]);
        if (S.cover) for (const k of Object.keys(S.cover)) if (!OPS[k]) out.push(["warn", `${A.name} · ${S.name}: ${k} isn't a Pokémon in the game (skipped).`]);
      }
    }
    return out;
  }
  function checkTab() {
    const P = problems(), bad = P.filter(p => p[0] === "bad").length;
    return `<main class="solo">
      <div class="exp"><button class="big" data-a="export">Export to the project folder</button><button class="g" data-a="download">Download a copy</button><button class="g" data-a="open">Open a file…</button>
        <p class="dim">Export writes <b>config/team_config.json</b> in the project folder (the first time it asks for that folder: the one with this page in it). The game uses it from its next build: tell Claude, or run <code>sh src/build.sh</code>. ${bad ? `<b class="bad">${bad} problem${bad > 1 ? "s" : ""} below will stop the build.</b>` : ""}</p></div>
      <h3>Check</h3>
      ${P.length ? `<ul class="probs">${P.map(([c, t]) => `<li class="${c}">${esc2(t)}</li>`).join("")}</ul>` : '<p class="ok">Everything checks out.</p>'}
      <h3>Undo</h3>
      <div class="btns"><button class="g" data-a="undo">Undo all: back to the game's config</button><button class="g" data-a="reset">Back to the original (as first made from the game's code)</button></div>
    </main>`;
  }

  // ---------- drawing ----------
  let root;
  function render() {
    PICK = {};
    const y = root && root.querySelector(".body") ? root.querySelector(".body").scrollTop : 0;
    const body = { roles: rolesTab, archetypes: archTab, rules: rulesTab, tiers: tiersTab, modes: modesTab, check: checkTab }[UI2.tab]();
    root.innerHTML = `<header class="top"><h1>Team Config <small>PokeSquad Battler · how Trainer teams are made</small></h1>
        <nav class="tabs">${TABS.map(([k, n]) => `<button class="${UI2.tab === k ? "on" : ""}" data-a="tab" data-k="${k}">${n}</button>`).join("")}</nav>
        <span class="state ${dirty ? "dirty" : ""}">${dirty ? "Unsaved changes" : "Saved"}</span><button data-a="export">Export</button></header>
      ${note ? `<div class="note">${esc2(note)} <button class="g sm" data-a="hidenote">OK</button></div>` : ""}
      <div class="body">${body}</div>`;
    const b = root.querySelector(".body"); if (b) b.scrollTop = y;
  }
  // only a picker's grid again (typing in its search box keeps the focus)
  function renderGrid(id) {
    const sec = root.querySelector(`[data-pk="${CSS.escape(id)}"]`); if (!sec) return render();
    const P = PICK[id], tmp = document.createElement("div"); tmp.innerHTML = picker(id, P);
    const g = tmp.querySelector(`[data-grid="${CSS.escape(id)}"]`), old = sec.querySelector(`[data-grid="${CSS.escape(id)}"]`);
    if (g && old) old.replaceWith(g);
  }

  // ---------- editing ----------
  const pathSet = (path, val) => {
    const R = C.roles[UI2.role], A = C.archetypes.find(a => a.id === UI2.arch), S = A && A.subs[UI2.sub];
    const [o, ...rest] = path.split("."), base = { role: R, arch: A, sub: S, rules: C.rules }[o]; if (!base) return;
    let t = base; for (const p of rest.slice(0, -1)) t = t[p];
    const last = rest[rest.length - 1];
    if (o === "arch" && last === "id") { const nid = String(val).trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_"); if (!nid || C.archetypes.some(a => a !== A && a.id === nid)) return alert("That id is taken (or empty)."); A.id = nid; UI2.arch = nid; return; }
    t[last] = val;
  };
  const newId = (base, taken) => { let id = base.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "") || "role", n = 2; const b0 = id; while (taken(id)) id = b0 + "_" + n++; return id; };
  const blankRole = name => ({ name, kind: "attacker", pokemon: {}, moves: [], abilities: [], items: [], keep: { moves: false, abilities: false, items: false, setup: false, priorityAttacks: false }, lead: false, priorityMove: false, setupSweeper: false, movesIf: [] });
  const blankSub = name => ({ name, plan: "", slots: [], cover: null, favor: { moves: [], abilities: [], items: [] }, ban: { pokemon: [], moves: [], abilities: [], items: [] } });
  const ACT = {
    tab: d => { UI2.tab = d.k; },
    hidenote: () => { note = ""; },
    role: d => { UI2.role = d.k; },
    newrole: () => { const name = prompt("The new role's name:", "New role"); if (!name) return false; const id = newId(name, x => !!C.roles[x]); C.roles[id] = blankRole(name); UI2.role = id; changed(); },
    duprole: () => { const R = C.roles[UI2.role], id = newId(UI2.role + "_copy", x => !!C.roles[x]); C.roles[id] = { ...clone(R), name: R.name + " (copy)" }; UI2.role = id; changed(); },
    delrole: () => { const used = usedIn(UI2.role); if (!confirm(`Delete the role “${C.roles[UI2.role].name}”?${used.length ? "\nIt's taken out of: " + used.join(", ") : ""}`)) return false;
      for (const A of C.archetypes) for (const S of A.subs) S.slots = S.slots.filter(([r]) => r !== UI2.role); delete C.roles[UI2.role]; UI2.role = Object.keys(C.roles)[0]; changed(); },
    arch: d => { UI2.arch = d.k; UI2.sub = 0; },
    archup: d => { const i = +d.i; if (i > 0) { [C.archetypes[i - 1], C.archetypes[i]] = [C.archetypes[i], C.archetypes[i - 1]]; changed(); } },
    archdn: d => { const i = +d.i; if (i < C.archetypes.length - 1) { [C.archetypes[i + 1], C.archetypes[i]] = [C.archetypes[i], C.archetypes[i + 1]]; changed(); } },
    newarch: () => { const name = prompt("The new archetype's name:", "New archetype"); if (!name) return false; const id = newId(name, x => C.archetypes.some(a => a.id === x));
      C.archetypes.push({ id, name, plan: "", weight: 50, coverMaxSpeed: null, subs: [blankSub("Standard")] }); UI2.arch = id; UI2.sub = 0; changed(); },
    duparch: () => { const A = C.archetypes.find(a => a.id === UI2.arch), id = newId(A.id + "_copy", x => C.archetypes.some(a => a.id === x)); C.archetypes.push({ ...clone(A), id, name: A.name + " (copy)" }); UI2.arch = id; changed(); },
    delarch: () => { const A = C.archetypes.find(a => a.id === UI2.arch); if (!confirm(`Delete the archetype “${A.name}” and its sub-archetypes? (Its roles stay.)`)) return false; C.archetypes = C.archetypes.filter(a => a !== A); UI2.arch = (C.archetypes[0] || {}).id; changed(); },
    sub: d => { UI2.sub = +d.i; },
    newsub: () => { const A = C.archetypes.find(a => a.id === UI2.arch), name = prompt("The new sub-archetype's name:", "New sub-archetype"); if (!name) return false; A.subs.push(blankSub(name)); UI2.sub = A.subs.length - 1; changed(); },
    dupsub: () => { const A = C.archetypes.find(a => a.id === UI2.arch), S = A.subs[UI2.sub]; A.subs.push({ ...clone(S), name: S.name + " (copy)" }); UI2.sub = A.subs.length - 1; changed(); },
    delsub: () => { const A = C.archetypes.find(a => a.id === UI2.arch); if (A.subs.length < 2 || !confirm(`Delete “${A.subs[UI2.sub].name}”?`)) return false; A.subs.splice(UI2.sub, 1); UI2.sub = 0; changed(); },
    slotadd: () => { const S = curSub(); S.slots.push([UI2.role && C.roles[UI2.role] ? UI2.role : Object.keys(C.roles)[0], 1]); changed(); },
    slotnew: () => { const S = curSub(), A = C.archetypes.find(a => a.id === UI2.arch), name = prompt("The new role's name:", `${A.name} · new role`); if (!name) return false;
      const id = newId(A.id + "_" + name.replace(/^.*·\s*/, ""), x => !!C.roles[x]); C.roles[id] = blankRole(name); S.slots.push([id, 1]); UI2.role = id; UI2.tab = "roles"; changed(); },
    slotup: d => { const S = curSub(), i = +d.i; if (i > 0) { [S.slots[i - 1], S.slots[i]] = [S.slots[i], S.slots[i - 1]]; changed(); } },
    slotdn: d => { const S = curSub(), i = +d.i; if (i < S.slots.length - 1) { [S.slots[i + 1], S.slots[i]] = [S.slots[i], S.slots[i + 1]]; changed(); } },
    slotrm: d => { curSub().slots.splice(+d.i, 1); changed(); },
    gorole: d => { if (C.roles[d.k]) { UI2.role = d.k; UI2.tab = "roles"; } },
    newmode: () => { const name = prompt("The mode's name (as the game will call it, e.g. Battle Frontier):"); if (!name) return false; const id = newId(name, x => !!C.modes[x]);
      C.modes[id] = { name, ban: { pokemon: [], items: [] } }; changed(); alert(`Its id is “${id}”: the mode's code fields Trainers with modeDoc(doc, "${id}").`); },
    delmode: d => { if (!confirm("Delete this mode's rules?")) return false; delete C.modes[d.k]; changed(); },
    fold: d => { const P = PICK[d.p], open = UI2.open[d.p] != null ? UI2.open[d.p] : !(P && P.closed); UI2.open[d.p] = !open; },
    tog: d => pickToggle(d.p, d.k),
    star: d => { const P = PICK[d.p], v = { ...P.get() }; v[d.k] = valueFor(P.get(), +d.n); P.set(v); changed(); },
    up: d => { const P = PICK[d.p], v = P.get().slice(), i = +d.i; if (i > 0) { [v[i - 1], v[i]] = [v[i], v[i - 1]]; P.set(v); changed(); } },
    dn: d => { const P = PICK[d.p], v = P.get().slice(), i = +d.i; if (i < v.length - 1) { [v[i + 1], v[i]] = [v[i], v[i + 1]]; P.set(v); changed(); } },
    rm: d => { const P = PICK[d.p]; P.set(P.get().filter(x => x !== d.k)); changed(); },
    clear: d => { const P = PICK[d.p]; if (!confirm(`Clear “${P.title}”?`)) return false; P.set(P.mode === "fit" ? {} : []); changed(); },
    smart: d => { const P = PICK[d.p]; P.smart[+d.i][1](); changed(); },
    dropmissing: d => { const P = PICK[d.p], v = P.get(); if (P.mode === "fit") { const m = {}; for (const k in v) if (exists[P.kind](k)) m[k] = v[k]; P.set(m); } else P.set(v.filter(k => exists[P.kind](k))); changed(); },
    export: () => { exportCfg(); return false; },
    download: () => { download(); return false; },
    open: () => { openFile(); return false; },
    undo: () => { if (!confirm("Throw away every change since the game's config (the one in the game now)?")) return false; C = clone(TEAM_CONFIG); fix(); dirty = false; try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* none */ } },
    reset: () => { if (!confirm("Go back to the original config, as first made from the game's code? (Export to keep it.)")) return false; C = clone(ORIGINAL); fix(); changed(); },
  };
  const curSub = () => { const A = C.archetypes.find(a => a.id === UI2.arch); return A.subs[UI2.sub]; };

  // ---------- saving: into the project folder (File System Access, the folder remembered), or a download ----------
  const idb = (op, val) => new Promise(res => { try { const r = indexedDB.open("pks_teamcfg", 1); r.onupgradeneeded = () => r.result.createObjectStore("h");
    r.onsuccess = () => { try { const tx = r.result.transaction("h", op === "get" ? "readonly" : "readwrite"), st = tx.objectStore("h"), q = op === "get" ? st.get("dir") : st.put(val, "dir"); q.onsuccess = () => res(q.result); q.onerror = () => res(null); } catch (e) { res(null); } }; r.onerror = () => res(null); } catch (e) { res(null); } });
  const text = () => { C.saved = new Date().toISOString(); return JSON.stringify(C, null, 1); };
  function download() {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text()], { type: "application/json" })); a.download = "team_config.json"; a.click();
    note = "Downloaded team_config.json: put it in the project's config folder (replacing the one there)."; render();
  }
  async function exportCfg() {
    const P = problems().filter(p => p[0] === "bad");
    if (P.length && !confirm(`${P.length} problem${P.length > 1 ? "s" : ""} will stop the game's build until fixed (Check & export tab). Export anyway?`)) return;
    if (!window.showDirectoryPicker) return download();
    try {
      let dir = await idb("get");
      if (dir && (await dir.queryPermission({ mode: "readwrite" })) !== "granted" && (await dir.requestPermission({ mode: "readwrite" })) !== "granted") dir = null;
      if (!dir) {
        alert("Pick the project folder: the one this page is in (the game's project folder).");
        dir = await showDirectoryPicker({ id: "pks_project", mode: "readwrite" });
      }
      // the project folder has src/ and config/ (or at least src/)
      try { await dir.getDirectoryHandle("src"); } catch (e) { alert(`“${dir.name}” doesn't look like the project folder (it has no src folder). Pick the folder this page is in.`); await idb("put", null); return; }
      const cfg = await dir.getDirectoryHandle("config", { create: true }), fh = await cfg.getFileHandle("team_config.json", { create: true });
      const w = await fh.createWritable(); await w.write(text()); await w.close();
      dirty = false; try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* none */ }
      await idb("put", dir);   // (remember the folder for next time; if it can't, the save still stands)
      note = `Saved to ${dir.name}/config/team_config.json. The game uses it from its next build (tell Claude, or run sh src/build.sh).`;
      render();
    } catch (e) { if (e && e.name === "AbortError") return; alert("Couldn't save there (" + (e && e.message) + "). Downloading a copy instead."); download(); }
  }
  function openFile() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = async () => { const f = inp.files[0]; if (!f) return; try { const x = JSON.parse(await f.text()); if (!x.roles || !x.archetypes) throw new Error("no roles or archetypes in it"); C = x; fix(); changed(); note = `Opened ${f.name}. Export to make it the game's.`; render(); } catch (e) { alert("That file isn't a team config: " + e.message); } };
    inp.click();
  }

  // ---------- events ----------
  function mount() {
    const css = document.createElement("style");
    css.textContent = `
#tcfg{position:fixed;inset:0;z-index:99999;background:#151821;color:#e8ecf5;font:14px/1.4 system-ui,"Segoe UI",Arial,sans-serif;display:flex;flex-direction:column;overflow:hidden}
#tcfg *{box-sizing:border-box}#tcfg button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:6px 11px;background:#e3350d;color:#fff;font-weight:600}
#tcfg button.g{background:#2f3547;color:#dfe5f2;font-weight:500}#tcfg button.sm{padding:3px 8px;font-size:12px}#tcfg button:disabled{opacity:.4;cursor:default}
#tcfg input[type=text],#tcfg input[type=search],#tcfg input[type=number],#tcfg select,#tcfg textarea{background:#202534;color:#fff;border:1px solid #384056;border-radius:7px;padding:6px 8px;font:inherit}
#tcfg input[type=number]{width:90px}#tcfg textarea{width:100%;resize:vertical}
#tcfg .top{display:flex;align-items:center;gap:12px;padding:10px 16px;background:#1c2030;border-bottom:1px solid #2c3244;flex-wrap:wrap}
#tcfg h1{font-size:18px;margin:0;margin-right:auto}#tcfg h1 small{font-weight:400;color:#8b94ab;font-size:12px;margin-left:6px}
#tcfg .tabs{display:flex;gap:4px;flex-wrap:wrap}#tcfg .tabs button{background:#262b3c;color:#cfd6e6;font-weight:500}#tcfg .tabs button.on{background:#e3350d;color:#fff}
#tcfg .state{color:#7fd38a;font-size:12px}#tcfg .state.dirty{color:#ffcc66}
#tcfg .note{background:#253049;color:#dfe8ff;padding:8px 16px;display:flex;gap:10px;align-items:center}
#tcfg .body{flex:1;overflow:auto}#tcfg .cols{display:flex;min-height:100%}
#tcfg aside{width:270px;flex:none;border-right:1px solid #2c3244;padding:12px;display:flex;flex-direction:column;gap:8px;background:#181c27;position:sticky;top:0;align-self:flex-start;max-height:100%;overflow:auto}
#tcfg aside input{width:100%}#tcfg aside nav{display:flex;flex-direction:column;gap:3px}
#tcfg .li{background:#202534;color:#e8ecf5;text-align:left;font-weight:500;width:100%}#tcfg .li.on{background:#3a2b2f;outline:2px solid #e3350d}
#tcfg .li small{display:block;color:#8b94ab;font-size:11px;font-weight:400}#tcfg .mv2{display:flex;gap:2px;justify-content:flex-end;margin:-2px 0 2px}#tcfg .mv2 button{padding:0 6px;background:#262b3c;font-size:11px}
#tcfg main{flex:1;padding:14px 18px;min-width:0;display:flex;flex-direction:column;gap:12px}#tcfg main.solo{max-width:1100px}
#tcfg .btns{display:flex;gap:6px;flex-wrap:wrap}
#tcfg .frm{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end}#tcfg .frm label{display:flex;flex-direction:column;gap:3px;color:#aab3c8;font-size:12px}
#tcfg .frm label.wide{flex-basis:100%}#tcfg .frm small,#tcfg h3 small{color:#7c859b;font-weight:400}
#tcfg .used{color:#aab3c8;font-size:12px;flex-basis:100%}
#tcfg .flags,#tcfg .keep{display:flex;flex-wrap:wrap;gap:6px 18px}#tcfg .chk{display:flex;align-items:center;gap:6px;color:#cfd6e6}
#tcfg .keep{background:#1c2130;border-radius:8px;padding:7px 10px;margin-bottom:-8px}
#tcfg h3{margin:4px 0 0;font-size:15px}
#tcfg .pk{border:1px solid #2c3244;border-radius:10px;background:#1a1e2a}
#tcfg .pk header{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;flex-wrap:wrap}
#tcfg .pk .cnt{background:#e3350d;border-radius:9px;padding:0 7px;font-size:12px;font-weight:700}#tcfg .pk .help{color:#8b94ab;font-size:12px;flex-basis:100%}#tcfg .pk .fold{margin-left:auto;color:#8b94ab;font-size:12px}
#tcfg .pkbody{padding:0 12px 12px;display:flex;flex-direction:column;gap:8px}
#tcfg .tools{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#tcfg .grid{display:flex;flex-wrap:wrap;gap:5px;max-height:420px;overflow:auto;padding:2px}
#tcfg .ch{background:#232838;color:#cfd6e6;font-weight:400;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:5px 8px;border:1px solid transparent;text-align:left}
#tcfg .ch.on{background:#3a2a2c;border-color:#e3350d;color:#fff}
#tcfg .ch.mon{width:118px;align-items:center;text-align:center}#tcfg .ch.mon img{width:48px;height:48px;object-fit:contain;image-rendering:pixelated}
#tcfg .ch .nm{font-size:12px;font-weight:600}#tcfg .ch .ty{display:flex;gap:2px}
#tcfg em.t,#tcfg em.c{font-style:normal;font-size:10px;border-radius:4px;padding:0 4px;color:#fff;text-shadow:0 1px 1px #0007}
#tcfg em.c{background:#555}#tcfg em.cP{background:#c92112}#tcfg em.cS{background:#4f5870}#tcfg em.cX{background:#8c888c}
#tcfg .ch .row2{display:flex;gap:3px;flex-wrap:wrap;font-size:11px;color:#aab3c8}#tcfg .ch .row2 em{font-style:normal}
#tcfg .ch.mv{width:178px}#tcfg .ch.ab{width:160px}#tcfg .ch.it{width:170px;flex-direction:row;align-items:center;gap:6px;flex-wrap:wrap}
#tcfg .ch .ic{width:24px;height:24px;flex:none}#tcfg .ch .ic svg{width:24px;height:24px}
#tcfg .ch .nt{font-size:10px;color:#ffcc66}#tcfg .stars{display:flex}#tcfg .stars i{font-style:normal;color:#4a5068;font-size:14px;padding:0 1px;cursor:pointer}#tcfg .stars i.on{color:#ffcc33}
#tcfg .ordered{display:flex;flex-wrap:wrap;gap:5px}#tcfg .oi{background:#2a3044;border-radius:7px;padding:3px 4px 3px 9px;display:flex;align-items:center;gap:3px}
#tcfg .oi button{padding:0 6px;background:#3a4258;font-size:12px}
#tcfg .warn{background:#3d321b;color:#ffd98a;border-radius:8px;padding:6px 10px}#tcfg .dim{color:#8b94ab}
#tcfg .subs{display:flex;gap:5px;flex-wrap:wrap}#tcfg .subs button{background:#262b3c;color:#cfd6e6}#tcfg .subs button.on{background:#e3350d;color:#fff}
#tcfg table{border-collapse:collapse}#tcfg td.lvs{white-space:nowrap}#tcfg td.lvs input{width:56px}#tcfg table.tiers{display:block;overflow-x:auto;max-width:100%}#tcfg td,#tcfg th{padding:5px 8px;border-bottom:1px solid #2a3042;text-align:left}#tcfg th{color:#8b94ab;font-weight:500;font-size:12px}
#tcfg .slots select{min-width:260px}#tcfg .slots button{padding:2px 8px;margin-right:2px;background:#2f3547}
#tcfg .mode{border:1px solid #2c3244;border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
#tcfg .exp{display:flex;flex-wrap:wrap;gap:8px;align-items:center}#tcfg .exp p{flex-basis:100%;margin:2px 0}#tcfg button.big{font-size:16px;padding:10px 18px}
#tcfg .probs{margin:0;padding-left:18px}#tcfg .probs .bad,#tcfg .bad{color:#ff8f7a}#tcfg .probs .warn{background:none;padding:0;color:#ffd98a}#tcfg .probs .info{color:#9aa5bd}#tcfg .ok{color:#7fd38a}
#tcfg code{background:#262b3c;border-radius:5px;padding:1px 5px}
@media (max-width:820px){#tcfg .cols{flex-direction:column}#tcfg aside{width:auto;align-self:stretch;position:static;max-height:240px;border-right:0;border-bottom:1px solid #2c3244}#tcfg .ch.mon{width:96px}#tcfg .ch.mv,#tcfg .ch.ab,#tcfg .ch.it{width:46%}}`;
    document.head.appendChild(css);
    root = document.createElement("div"); root.id = "tcfg"; document.body.appendChild(root);
    const act = (el, e) => { const fn = ACT[el.dataset.a]; if (!fn) return; e.preventDefault(); e.stopPropagation(); if (fn(el.dataset, el, e) !== false) render(); };
    // clicks here are this page's alone, caught before the game underneath sees them (its title screen takes a first tap as
    // "tap to start" and would swallow it)
    window.addEventListener("click", e => {
      if (!root.contains(e.target)) return;
      e.stopPropagation();
      const el = e.target.closest("[data-a]"); if (el && root.contains(el)) act(el, e);
    }, true);
    for (const ev of ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend"]) window.addEventListener(ev, e => { if (root.contains(e.target)) e.stopPropagation(); }, true);
    root.addEventListener("input", e => {
      const t = e.target;
      if (t.dataset.q) { UI2.pick[t.dataset.q].q = t.value; renderGrid(t.dataset.q); }
      else if (t.dataset.rq) { UI2.roleQ = t.value; const pos = t.selectionStart; render(); const n = root.querySelector("[data-rq]"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    });
    root.addEventListener("change", e => {
      const t = e.target, d = t.dataset;
      if (d.v) {
        let v = t.type === "checkbox" ? t.checked : t.type === "number" ? (t.value === "" ? null : +t.value) : t.value;
        if (d.v === "role.kind" && v === "__new") { v = (prompt("The new kind's name (one word; Trainers will describe it by its moves until it has a chat line):") || "").trim().toLowerCase(); if (!v) return render(); }
        pathSet(d.v, v); changed(); render(); return;
      }
      if (d.mif != null) {
        const R = C.roles[UI2.role]; R.movesIf = R.movesIf.filter(c => d.mif === "special" ? c !== "special" : !c.startsWith("notType:"));
        if (d.mif === "special" && t.checked) R.movesIf.push("special"); if (d.mif === "notType" && t.value) R.movesIf.push("notType:" + t.value);
        changed(); render(); return;
      }
      if (d.slot != null) {
        const S = curSub(), i = +d.slot;
        if (d.f === "role") S.slots[i][0] = t.value;
        else if (d.f === "j") { if (t.value === "") S.slots[i].length = 2; else S.slots[i][2] = Math.max(0, Math.min(6, Math.round(+t.value) || 0)); }
        else S.slots[i][1] = Math.max(1, Math.min(6, +t.value || 1));
        changed(); render(); return;
      }
      if (d.ovl != null) { const A = C.archetypes.find(a => a.id === UI2.arch); A.overlaps = (A.overlaps || []).filter(x => x !== d.ovl); if (t.checked) A.overlaps.push(d.ovl); changed(); render(); return; }
      if (d.onlyin != null) {
        const R = C.roles[UI2.role], o = {};
        for (const line of t.value.split(/\n+/)) { const [m, a] = line.split(":"); const mk = (m || "").trim().toLowerCase().replace(/[^a-z0-9]/g, ""); const ids = (a || "").split(",").map(x => x.trim()).filter(Boolean); if (mk && ids.length) o[mk] = ids; }
        if (Object.keys(o).length) R.onlyIn = o; else delete R.onlyIn; changed(); render(); return;
      }
      if (d.tier != null && (d.f === "lvLo" || d.f === "lvHi")) {   // a tier's Pokémon levels, 1 to 100, lowest never above highest
        const T = C.tiers[+d.tier], v = Math.max(1, Math.min(100, Math.round(+t.value) || 1)), L = (T.levels || [1, 100]).slice();
        if (d.f === "lvLo") { L[0] = v; L[1] = Math.max(L[1], v); } else { L[1] = v; L[0] = Math.min(L[0], v); }
        T.levels = L; changed(); render(); return;
      }
      if (d.tier != null) { const T = C.tiers[+d.tier]; T[d.f] = d.f === "favorStrong" ? +t.value : Math.max(0, Math.min(100, +t.value || 0)); changed(); render(); return; }
      if (d.mode != null) { C.modes[d.mode][d.f] = t.value === "" ? null : Math.max(0, Math.min(6, +t.value)); changed(); render(); return; }
      if (d.f && d.p) { const F = UI2.pick[d.p]; F[d.f] = t.type === "checkbox" ? t.checked : t.value; renderGrid(d.p); }
    });
    // typing here never reaches the game's own keys underneath (the Game Boy buttons, the Demo's shortcuts)
    for (const ev of ["keydown", "keyup", "keypress"]) root.addEventListener(ev, e => e.stopPropagation());
    window.addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
    render();
  }

  // the game stays out of sight underneath (no save is opened: this page only reads the game's data)
  try { if (typeof hideTitle === "function") hideTitle(); } catch (e) { /* fine */ }
  document.title = "PokeSquad Battler · Team Config";
  // the page at once (a click never lands on the game underneath); the Pokémon pictures fill in when the sprites are ready
  mount();
  const pics = () => (typeof SPR !== "undefined" && SPR.ready) ? render() : setTimeout(pics, 150);
  pics();
})();
