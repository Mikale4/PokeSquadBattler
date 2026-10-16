
// =====================================================================
//  SCREENS (2/2): Battle hub, Pokémon (PC Box), summary, evolution, Pokédex, Safari Zone, research, shops, Bag
// =====================================================================
SCREENS.battle = () => {
  const L = S.ladder, nd = nextNode();
  return `<div class="stack">
    <h2>Battle</h2>
    <button class="tile wide ls-t" data-act="go" data-v="story" style="min-height:76px"><span class="ticon" style="color:var(--red)">${IC.story}</span>
      <div class="eyebrow">Journey</div><h3>${esc(nd ? nd.ep.title : (journeyOf(S.region) || STORY[0]).title)}</h3><span class="tsub">${nd ? "Next: " + nd.id + " " + esc(nd.name) : nextRegions().length ? "Choose your next region" : "Journey complete!"}</span></button>
    <div class="eyebrow">Explore · evolution stones and held items, Exp. Candy, Poké Dollars · ${HUNT_TRIES} tries a day each</div>
    ${HUNTS.filter(huntOn).map(h => {
      const best = (S.hunt && S.hunt[h.id]) || 0, boss = h.boss[0], left = huntLeft(h.id);
      return `<button class="tile wide hunt${areaBg(HUNT_BG[h.id])}" data-act="go" data-v="hunt" data-a="${h.id}" style="--cc:${mapTheme(h.env === "plant" ? "city" : h.env).a}">
        <span class="ticon" style="width:60px;height:60px;right:8px;top:8px"><img class="px" src="${sprFront(boss)}" alt="" style="width:100%"></span>
        <div class="eyebrow">${h.code}-1 to ${h.code}-6 · ${best ? h.code + "-" + best + " cleared" : "not cleared"}</div><h3>${esc(h.n)}</h3><span class="tsub">${esc(h.sub)}</span>
        <span class="tsub">${huntKind(h) === "candy" ? "Exp. Candy" : huntKind(h) === "money" ? "Poké Dollars" : itemName(h.stone)}${h.weather ? " · " + WEATHER[h.weather].n : ""} · <b class="${left ? "" : "bad"}">${left}/${HUNT_TRIES + huntBought(h.id)} tries left today</b></span></button>`;
    }).join("")}
    ${featOn("tower") || featOn("ranked") ? `<div class="tiles">
      ${featOn("tower") && towerOpenWings().length ? (tw => `<button class="tile" data-act="go" data-v="tower"><span class="ticon tr"><img class="px" src="${trainerURL(towerFloor(tw, Math.min(towerDone(tw) + 1, towerFloors(tw).length)).trainer.spr)}" alt=""></span><h3>Battle Tower</h3><span class="tsub">${towerNext() ? `${REGION_NAME[tw]} Wing · Floor ${towerDone(tw) + 1}/${towerFloors(tw).length}` : "Every wing conquered!"}</span></button>`)(towerNext() || towerOpenWings()[0]) : ""}
      ${featOn("ranked") ? `<button class="tile" data-act="go" data-v="arena"><span class="ticon">${tierBadge(L.pts, 34)}</span><h3>Battle Stadium</h3><span class="tsub">Ranked: ${tierOf(L.pts).n} · ${fmtFull(L.pts)} pts · ${L.tickets}/${ticketsMax()} Tickets</span>${featOn("link") ? `<span class="tsub">Link: ${tierOf(S.rta.pts).n} · ${fmtFull(S.rta.pts)}</span>` : ""}</button>` : ""}
    </div>` : ""}
  </div>`;
};
SCREENS.hunt = id => {
  const h = HUNTS.find(x => x.id === id), best = (S.hunt && S.hunt[id]) || 0;
  const lvl = UI.huntLv && UI.huntLv[id] || Math.min(6, best + 1);
  const lv = HUNT_LV[lvl - 1], waves = huntWavesSpec(h, lvl);
  return `<div class="stack">
    <div class="spread">${back("go", "Battle", 'data-v="battle"')}<span class="eyebrow">Explore</span></div>
    ${areaBg(HUNT_BG[id]) ? `<div class="areapic${areaBg(HUNT_BG[id])}" role="img" aria-label="${esc(h.n)}"></div>` : ""}
    <h2>${h.code}-${lvl} ${esc(h.n)}</h2><p class="small dim">${esc(h.sub)}. Wild Pokémon are Lv ${lv}; the strongest one is Lv ${lv + 3}.</p>
    ${h.weather ? `<div class="hint small" style="cursor:default">${WEATHER[h.weather].ic}<span><b>${WEATHER[h.weather].n}</b> in this area.</span></div>` : ""}
    <div class="chips">${[1, 2, 3, 4, 5, 6].map(k => `<button class="chip ${k === lvl ? "on" : ""}" data-act="huntLv" data-h="${id}" data-l="${k}" ${k <= best + 1 ? "" : "disabled"}>${h.code}-${k}</button>`).join("")}</div>
    ${waves.map((w, k) => `<div><div class="tiny dim" style="margin-bottom:4px">Wave ${k + 1}</div><div class="row wrap">${w.map(s => enHTML(s, s.boss ? 56 : 46)).join("")}</div></div>`).join("")}
    <section class="sub stack" style="gap:6px"><div class="small"><b>Finds</b> <span class="dim">· every clear</span></div>
      ${huntKind(h) === "candy" ? `<div class="row wrap" style="gap:6px">${Object.entries([{ rec1: 6 }, { rec1: 3, rec2: 3 }, { rec2: 5 }, { rec2: 3, rec3: 2 }, { rec3: 3, rec4: 1 }, { rec3: 2, rec4: 2 }][lvl - 1]).map(([k, n]) => `<span class="chip">${ITEMS[k].n} ×${n}</span>`).join("")}<span class="chip">Rare Candy (${10 + lvl * 4}%)</span></div>`
      : huntKind(h) === "money" ? `<div class="row wrap" style="gap:6px"><span class="chip">${IC.lmd.replace("<svg", '<svg width="14" height="14"')} ${fmtFull(3000 + lvl * 2500)} to ${fmtFull(4000 + lvl * 3500)} Poké Dollars</span></div>`
      : `<div class="row wrap" style="gap:6px"><span class="chip">${itemName(h.stone)} (${h.stone === "linkcord" ? 10 + lvl * 4 : 20 + lvl * 8}%)</span><span class="chip">Exp. Candy</span><span class="chip">Seed of Mastery (${10 + lvl * 5}%)</span></div>
      <div class="small"><b>Held items</b> <span class="dim">· ${Math.min(90, 25 + lvl * 12)}% per clear</span></div>
      <div class="row wrap" style="gap:6px">${h.items.map(k => `<span class="chip" title="${esc(HELD[k].d)}">${HELD[k].n}</span>`).join("")}</div>`}</section>
    <div class="spread small"><span>Tries left today: <b class="${huntLeft(id) ? "" : "bad"}">${huntLeft(id)}</b> of ${HUNT_TRIES + huntBought(id)}</span>
      <button class="btn sm ${huntLeft(id) ? "ghost" : ""}" data-act="huntBuy" data-h="${id}" ${S.orundum >= huntTryCost(id) ? "" : "disabled"}>One more try <span class="cost">${IC.orundum}${huntTryCost(id)}</span></button></div>
    <div class="row">
      ${best >= lvl && huntLeft(id) ? `<button class="btn ghost" data-act="huntSweep" data-h="${id}" data-l="${lvl}">Quick Battle${Math.min(3, huntLeft(id)) > 1 ? " ×" + Math.min(3, huntLeft(id)) : ""}</button>` : ""}
      <button class="btn" style="flex:1" data-act="huntGo" data-h="${id}" data-l="${lvl}" ${huntLeft(id) ? "" : "disabled"}>${huntLeft(id) ? `Explore <span class="cost">${IC.sanity}${HUNT_COST[lvl - 1]}</span>` : "No tries left today"}</button>
    </div>
  </div>`;
};
SCREENS.tower = () => {
  // (a wing per region: the owner's rule; tabs for the open ones)
  const wings = towerOpenWings();
  if (!wings.includes(UI.tw)) UI.tw = towerNext() || wings[0];
  const w = UI.tw, n = towerFloors(w).length, done = towerDone(w), cur = Math.min(done + 1, n);
  const floors = [];
  for (let f = Math.min(n, cur + 2); f >= Math.max(1, cur - 3); f--) floors.push(towerFloor(w, f));
  return `<div class="stack">
    <div class="spread">${back("go", "Battle", 'data-v="battle"')}<span class="eyebrow">Battle Tower</span></div>
    ${wings.length > 1 ? `<div class="chips">${wings.map(id => `<button class="chip ${id === w ? "on" : ""}" data-act="towerTab" data-v="${id}">${REGION_NAME[id]} ${towerDone(id)}/${towerFloors(id).length}</button>`).join("")}</div>` : ""}
    <h2>${done >= n ? `${REGION_NAME[w]} Wing conquered!` : `${REGION_NAME[w]} Wing · Floor ${cur} of ${n}`}</h2>
    <p class="small dim">Famous Trainers from ${REGION_NAME[w]}'s games, one floor each, from the weakest up: the teams its other versions gave them, rematches, and the Trainers you meet after the League. Each floor can be cleared once; every fifth floor gives a Safari Ball and Rare Candy.</p>
    ${floors.map(T => {
      const state = T.f <= done ? "done" : T.f === cur ? "next" : "locked";
      return `<section class="panel stack" style="gap:8px;${state === "next" ? "box-shadow:inset 0 0 0 2px var(--red)" : state === "locked" ? "opacity:.55" : ""}">
        <div class="spread"><div class="row" style="gap:8px"><img class="px" src="${trainerURL(T.trainer.spr)}" alt="" style="width:40px;height:40px;object-fit:contain"><div><b>Floor ${T.f}: ${esc(T.trainer.name)}</b><div class="tiny dim">${esc(T.from)}</div>${T.who ? `<div class="tiny dim">${esc(T.who)}</div>` : ""}</div></div><span class="tiny dim">Lv ${T.lv}</span></div>
        <div class="row wrap">${T.waves.flat().map(s => enHTML(s, 40)).join("")}</div>
        <div class="spread"><div class="rewards" style="justify-content:flex-start;transform:scale(.85);transform-origin:left">${rewardsHTML(Object.entries(T.reward).map(([k, n]) => ({ k, n })))}</div>
        ${state === "next" ? `<button class="btn sm" data-act="towerGo" data-w="${w}" data-f="${T.f}">Battle</button>` : state === "done" ? `<span class="tiny good">Cleared</span>` : ""}</div>
      </section>`;
    }).join("")}
  </div>`;
};
// ---------- Pokémon (PC Box) ----------
SCREENS.ops = () => {
  let list = UI.all ? OP_KEYS.filter(k => S.dex.seen[k] || S.ops[k]) : Object.keys(S.ops);
  list = list.filter(k => (UI.el === "all" || OPS[k].types.includes(UI.el)) && (UI.cls === "all" || OPS[k].cls === UI.cls));
  const sorters = { cp: (a, b) => (S.ops[b] ? power(b, S.ops[b]) : -1) - (S.ops[a] ? power(a, S.ops[a]) : -1), rarity: (a, b) => OPS[b].rar - OPS[a].rar || OPS[a].id - OPS[b].id,
    level: (a, b) => (S.ops[b] ? S.ops[b].lvl : -1) - (S.ops[a] ? S.ops[a].lvl : -1), number: (a, b) => OPS[a].id - OPS[b].id };
  list.sort(sorters[UI.sort] || sorters.cp);
  return `<div class="stack">
    <div class="spread"><h2>Pokémon</h2><button class="chip ${UI.all ? "on" : ""}" data-act="toggleAll">${UI.all ? "Seen" : "Your Pokémon"} · ${Object.keys(S.ops).length}</button></div>
    <div class="row" style="gap:8px"><button class="btn ghost sm" data-act="go" data-v="dex">${IC.dex.replace("<svg", '<svg width="16" height="16"')} Pokédex ${dexCaught()}/${DEX_N}</button><span class="tiny dim">Lv cap ${levelCap()}</span></div>
    <div class="filters tyfs">${["all", ...TYPES].map(e => `<button class="chip ${e === "all" ? "" : "tyf"} ${UI.el === e ? "on" : ""}" data-act="elf" data-e="${e}" ${e !== "all" ? `style="--tc:${TC[e]}" aria-label="${e}"` : ""}>${e === "all" ? "All types" : typeIcon(e)}</button>`).join("")}</div>
    <div class="filters">${["all", ...CLASSES].map(c => `<button class="chip ${UI.cls === c ? "on" : ""}" data-act="clsf" data-c="${c}">${c === "all" ? "All roles" : c}</button>`).join("")}</div>
    <div class="filters">${[["cp", "CP"], ["level", "Level"], ["rarity", "Rarity"], ["number", "Number"]].map(([s, n]) => `<button class="chip ${UI.sort === s ? "on" : ""}" data-act="sortf" data-s="${s}">Sort: ${n}</button>`).join("")}</div>
    <div class="roster">${list.map(k => `<button class="rcell ${S.ops[k] && canEvolveNow(k) ? "ready" : ""}" data-act="go" data-v="op" data-a="${k}">${opHTML(k)}${pnameHTML(k)}<div class="pw">${S.ops[k] ? "CP " + fmt(power(k, S.ops[k])) : dexNo(OPS[k].id)}</div></button>`).join("") || '<p class="small dim">No Pokémon match these filters.</p>'}</div>
  </div>`;
};
const statBar = (n, v, max = 255) => `<div class="sbar"><span>${n}</span><b class="num">${v}</b><i><em style="width:${Math.min(100, v / max * 100)}%;background:${v >= 100 ? "#3ddc84" : v >= 70 ? "#f2c14e" : "#ff8a5a"}"></em></i></div>`;
SCREENS.op = key => {
  const op = OPS[key], p = S.ops[key], tab = p ? UI.opTab : "info";
  if (p) pmv(key);
  const prog = p || mkProg(5, key), st = opStats(key, prog).st;
  const tabs = [["info", "Summary"], ["skills", "Moves"], ["upgrade", "Train"], ["evo", "Evolve"], ["item", "Item"]];
  let body = "";
  if (tab === "info") {
    const ab = p ? abilityOf(p.ab || op.ab) : op.passives[0], [nUp, nDn] = p ? NATURES[p.nat] || [] : [];
    body = `<section class="panel"><div class="spread"><h3>Stats${p ? "" : " (Lv 5)"}</h3>${p ? `<span class="small">CP <b class="num">${fmtFull(power(key, p))}</b></span>` : ""}</div>
      <div class="statgrid" style="margin-top:8px">
        <div><span>HP</span><b>${st.hp}</b></div>${[["atk", "Attack"], ["def", "Defense"], ["spa", "Sp. Atk"], ["sdf", "Sp. Def"], ["spe", "Speed"]].map(([s, n]) =>
          `<div class="${s === nUp ? "nup" : s === nDn ? "ndn" : ""}"><span>${n}${s === nUp ? " ▲" : s === nDn ? " ▼" : ""}</span><b>${st[s]}</b></div>`).join("")}</div>
      <div class="eyebrow" style="margin:12px 0 6px">Base stats · total ${op.b.reduce((a, b) => a + b, 0)}</div>
      ${["HP", "Atk", "Def", "SpA", "SpD", "Spe"].map((n, i) => statBar(n, op.b[i])).join("")}</section>
    <section class="panel stack" style="gap:8px">
      ${p ? `<div><div class="spread"><b>Nature · ${natName(p.nat)}</b><button class="btn sm ghost" data-act="mint" data-k="${key}" ${MINT_NATURES.some(n => S.inv["mint_" + n] > 0 && n !== p.nat) ? "" : "disabled"}>Use a Mint</button></div>
        <p class="small dim">${natText(p.nat)}. Mints from the Poké Mart change it.</p></div>` : ""}
      <div><b>Ability · ${esc(ab.name)}</b><p class="small dim">${esc(ab.text)}</p>
        <div class="row wrap" style="gap:4px;margin-top:4px">${op.abs.map(a => `<span class="chip ${a.k === ab.key ? "on" : ""}" style="cursor:default">${esc(abilityOf(a.k).name)}${a.h ? " · Hidden" : ""}</span>`).join("")}</div>
        ${p && op.abs.length > 1 ? `<div class="row" style="gap:6px;margin-top:6px">${["abilitycapsule", "abilitypatch"].map(it => `<button class="btn sm ghost" style="flex:1" data-act="abItem" data-k="${key}" data-it="${it}" ${S.inv[it] > 0 && abilityChoices(key, it).length ? "" : "disabled"}><span class="cost">${ITEMS[it].ic}</span>${ITEMS[it].n} ×${S.inv[it] || 0}</button>`).join("")}</div>` : ""}</div>
      <div><b>${op.types.join(" / ")} type</b>${matchupHTML(op.types)}</div>
      <div><b>Role · ${op.cls}</b><p class="small dim">${{ Attacker: "Hits hard from range with special moves.", "All-Rounder": "Balanced offense and bulk.", Speedster: "Fast: acts often and strikes first.", Defender: "Tough and hard to knock out.", Supporter: "Puts foes to sleep, heals or sets up the team." }[op.cls]}</p></div>
      ${p ? `<div><b>IVs · ${IV_WORD[p.pot]}</b><p class="small dim">IV rank ${p.pot}/6 (each rank adds about 3 to every stat at Lv 100). Catch it again, or use a Bottle Cap, to raise it.</p>
        ${p.pot < 6 && (S.inv.bottlecap > 0 || S.inv.goldbottlecap > 0) ? `<div class="row" style="gap:6px;margin-top:6px">${["bottlecap", "goldbottlecap"].map(it => `<button class="btn sm ghost" style="flex:1" data-act="capUse" data-k="${key}" data-it="${it}" ${S.inv[it] > 0 ? "" : "disabled"}><span class="cost">${itemIcon(it)}</span>${ITEMS[it].n} ×${S.inv[it] || 0}</button>`).join("")}</div>` : ""}</div>` : `<p class="small dim">${S.dex.caught[key] ? "You don't have this Pokémon right now." : "Not caught yet. Find it in the Safari Zone or on your journey."}</p>`}
    </section>`;
  } else if (tab === "skills") {
    // one move per slot; empty slots say when it learns one. The Move Reminder and TMs teach others.
    const nx = nextMoveLevel(key, p.lvl), rem = remindable(key).length, tmN = Object.keys(S.tms).filter(n => tmFits(key, +n)).length;
    body = `<section class="panel stack" style="gap:10px">${[1, 2, 3].map(slot => {
      const i = slot - 1, m = p.mv[i];
      if (!m) return `<div class="ab"><div class="abicon empty">S${slot}</div><div class="stack" style="gap:2px;min-width:0"><b class="dim">No S${slot} move yet</b>
        <p class="tiny dim">${slot === 1 ? "Without an S1 move it uses Struggle when nothing else is ready. " : ""}${(() => { const l = op.learn.find(([lv, k]) => lv > p.lvl && slotOf(k) === slot); return l ? `Learns ${esc(MOVES[l[1]].n)} at Lv ${l[0]}.` : "A TM can teach it one."; })()}</p></div></div>`;
      const sk = skillFor(m, slot), r = p.sk[i], c = skillCost(r), lv = (op.learn.find(([, k]) => k === m) || [])[0];
      return `<div class="ab"><div class="abicon" style="--tc:${TC[sk.type]}">S${slot}</div>
        <div class="stack" style="gap:4px;min-width:0"><div class="spread"><b>${esc(sk.name)}</b><span class="row" style="gap:4px">${typeChip(sk.type)}${catChip(sk.cat)}</span></div>
        <div class="tiny dim">${sk.pow ? `Power ${sk.range || (sk.weight || sk.vary ? "varies" : sk.pow)} · ` : ""}Accuracy ${sk.acc ? (sk.mk === "acc" && r > 1 ? `${Math.min(100, Math.round(sk.acc * (1 + .06 * (r - 1))))}% (base ${sk.acc}%)` : sk.acc + "%") : "—"} ·${sk.slot === 1 ? "No cooldown" : `Cooldown ${sk.cd}`}${lv ? ` · learned at Lv ${lv}` : " · from a TM"}</div>
        <p class="small dim">${esc(sk.desc)}</p>
        <div class="spread"><div class="row" style="gap:6px"><b class="tiny">Mastery ${RANK[r]}</b><div class="pips">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= r ? "on" : ""}"></i>`).join("")}</div></div>
        ${r < MAX_SK ? `<button class="btn sm ghost" data-act="skUp" data-k="${key}" data-i="${i}" ${(S.inv.summ || 0) >= c.summ && S.lmd >= c.lmd ? "" : "disabled"}><span class="cost">${IC.summ}${c.summ}</span><span class="cost">${IC.lmd}${fmt(c.lmd)}</span></button>` : '<span class="tiny good">Mastered</span>'}</div></div></div>`;
    }).join('<div class="divider"></div>')}
      <div class="row" style="gap:8px"><button class="btn ghost sm" style="flex:1" data-act="remind" data-k="${key}" ${rem ? "" : "disabled"}>Move Reminder${rem ? ` · ${rem}` : ""}</button>
        <button class="btn ghost sm" style="flex:1" data-act="tmCase" data-k="${key}" ${tmN ? "" : "disabled"}>${RES_DATA.item.tmcase ? pxIcon(RES_DATA.item.tmcase).replace("<svg", '<svg width="18" height="18"') : ""} Use a TM${tmN ? ` · ${tmN}` : ""}</button></div>
      <details class="lset"><summary>Level-up moves${nx ? ` · next at Lv ${nx}` : ""}</summary><div class="lsrows">${op.learn.map(([lv, k]) => `<div class="lsrow ${p.mv.includes(k) ? "on" : lv > p.lvl ? "later" : ""}"><span class="num">Lv ${lv}</span><b>${esc(MOVES[k].n)}</b>${typeChip(MOVES[k].t)}<span class="tiny">S${slotOf(k)}</span></div>`).join("")}</div></details>
      <p class="tiny dim">It knows one move per slot. New moves come with levels (it asks before forgetting one), from TMs bought at the Poké Mart, and from the Move Reminder. Mastery runs 1 to 5 (★) per slot: each rank adds 6% (damage, healing, accuracy, or turn meter given back) and ★ also cuts the cooldown by one turn. Seeds of Mastery are found while exploring.</p></section>`;
  }
  else if (tab === "upgrade") {
    const cap = levelCap(key), need = xpNeed(p.lvl, key);
    body = `<section class="panel stack" style="gap:8px">
      <div class="spread"><h3>Lv ${p.lvl}<span class="dim small"> / ${cap}</span></h3><span class="small dim num">${p.lvl >= cap ? "Level cap" : `${fmtFull(p.xp)}/${fmtFull(need)} Exp.`}</span></div>
      <div class="bar"><i style="width:${p.lvl >= cap ? 100 : p.xp / need * 100}%"></i></div>
      <div class="row wrap">${["rec1", "rec2", "rec3", "rec4", "rare"].map(it => `<button class="btn ghost sm" data-act="rec" data-k="${key}" data-it="${it}" ${S.inv[it] > 0 && p.lvl < cap ? "" : "disabled"} title="${ITEMS[it].n}"><span class="cost">${ITEMS[it].ic}×${S.inv[it] || 0}</span></button>`).join("")}
        <button class="btn sm blue" data-act="autoLv" data-k="${key}" ${p.lvl < cap && ["rec1", "rec2", "rec3", "rec4"].some(i => S.inv[i] > 0) ? "" : "disabled"}>Auto</button></div>
      <p class="tiny dim">${p.lvl >= cap ? (cap >= 100 ? "Lv 100 is the highest level." : `${REGION_NAME[regionOf(key)]}'s Pokémon will only grow past Lv ${cap} once you beat ${capBattle(key) ? esc(capWho(capBattle(key))) + ` (${capBattle(key).nd.id})` : "the next big battle"}.`) : "Exp. Candy gives Exp. Points; a Rare Candy gives a whole level."}</p>
    </section>`;
  } else if (tab === "evo") {
    const opts = evoOptions(key), line = evoLine(key);
    body = `<section class="panel stack" style="gap:10px">
      <h3>Evolution</h3>
      <div class="evoline">${line.map(([k, d]) => `<button class="${k === key ? "cur" : ""} ${S.dex.caught[k] ? "" : "unowned"}" data-act="go" data-v="op" data-a="${k}" style="--d:${d}">${opHTML(k, { s: 48, nostars: 1, show: 1, prog: S.ops[k] || null })}<span class="tiny">${esc(OPS[k].n)}</span></button>`).join("")}</div>
      ${opts.length ? opts.map(o => `<div class="evorow"><img class="px" src="${sprFront(o.to)}" alt=""><div style="flex:1;min-width:0"><b>${esc(OPS[o.to].n)}</b><div class="tiny dim">${o.lv ? `Evolves at Lv ${o.lv}` : `Use ${an(evoItemName(o.item))} (you have ${evoHave(o.item, S.ops[key])}${HELD[o.item] && S.ops[key].held === o.item ? ", the one it holds" : ""})`}${o.bonus ? ` · a ${OPS[o.bonus].n} turns up too` : ""}${S.ops[o.to] ? " · you already have one: they'll merge and IVs go up" : ""}</div></div>
        <button class="btn sm ${o.ok ? "" : "ghost"}" data-act="evolve" data-k="${key}" data-to="${o.to}" ${o.ok ? "" : "disabled"}>${o.ok ? "Evolve" : esc(o.why)}</button></div>`).join("")
      : `<p class="small dim">${op.from ? `${esc(op.n)} doesn't evolve any further.` : `${esc(op.n)} doesn't evolve.`}</p>`}
      <p class="tiny dim">Evolution keeps level, IVs, Mastery and held item. Pokémon that evolve by trading in the games use a Linking Cord here.</p>
    </section>`;
  } else if (tab === "item") {
    const owned = HELD_KEYS.filter(k => (S.held[k] || 0) > 0);
    body = `<section class="panel stack" style="gap:8px"><h3>Held item</h3>
      ${p.held ? `<div class="evorow"><span class="ri" style="width:40px;height:40px">${heldIcon(p.held)}</span><div style="flex:1"><b>${esc(HELD[p.held].n)}</b><div class="tiny dim">${esc(HELD[p.held].d)}</div></div><button class="btn sm ghost" data-act="unhold" data-k="${key}">Take</button></div>` : `<p class="small dim">${esc(op.n)} isn't holding anything.</p>`}</section>
      <section class="stack" style="gap:6px"><h3>Your held items</h3>
      ${owned.length ? owned.map(k => { const free = heldFree(k), bad = HELD[k].only && !HELD[k].only.includes(key); return `<div class="evorow"><span class="ri" style="width:36px;height:36px">${heldIcon(k)}</span><div style="flex:1;min-width:0"><b>${esc(HELD[k].n)}</b> <span class="tiny dim">×${S.held[k]}${free < S.held[k] ? ` (${free} free)` : ""}</span><div class="tiny dim">${esc(HELD[k].d)}</div></div>
        <button class="btn sm ghost" data-act="hold" data-k="${key}" data-it="${k}" ${free > 0 && p.held !== k ? "" : "disabled"}>${bad ? "Give (no effect)" : "Give"}</button></div>`; }).join("") : '<p class="small dim">No held items yet. Explore wild areas or visit the BP Exchange.</p>'}</section>`;
  }
  return `<div class="stack">
    <div class="spread">${back("go", "Pokémon", 'data-v="ops"')}${p ? `<button class="btn ghost sm" data-act="assistant" data-k="${key}" ${S.assistant === key ? "disabled" : ""}>${S.assistant === key ? "Partner" : "Make partner"}</button>` : ""}</div>
    <section class="panel opcard" style="--tc:${TC[op.types[0]]};--tc2:${TC[op.types[1] || op.types[0]]}">
      <div class="opart"><img class="px" src="${sprFull(key)}" alt="${esc(op.n)}"></div>
      <div class="meta"><div class="tiny num dim">${dexNo(op.id)} · ${esc(op.genus)} Pokémon</div>
        <h2 style="font-size:26px">${esc(op.n)}</h2>
        <div class="row" style="gap:4px">${typeChips(op.types)}</div>
        ${starRow(op.rar).replace('class="rstars"', 'class="rstars" style="justify-content:flex-start;height:14px;margin-top:4px"')}
        ${p ? `<div class="small" style="margin-top:4px">Lv <b>${p.lvl}</b> · CP <b class="num">${fmtFull(power(key, p))}</b></div>${canEvolveNow(key) ? `<button class="btn sm" style="margin-top:6px" data-act="opTab" data-t="evo">Ready to evolve!</button>` : ""}` : `<div class="small dim">${S.dex.caught[key] ? "Caught before" : S.dex.seen[key] ? "Seen" : "Unknown"}</div>`}
      </div>
    </section>
    ${p ? `<div class="tabs2">${tabs.map(([k, n]) => `<button class="${tab === k ? "on" : ""}" data-act="opTab" data-t="${k}">${n}${k === "evo" && canEvolveNow(key) ? '<i class="dot" style="position:static;display:inline-block;margin-left:4px"></i>' : ""}</button>`).join("")}</div>` : ""}
    ${body}
  </div>`;
};
// "What? Bulbasaur is evolving!"
function evolveScene(from, to) {
  return new Promise(resolve => {
    const root = $("#gacha");
    root.innerHTML = `<div class="gwrap evo"><div class="evostage"><img class="px a" src="${sprFull(from)}" alt=""><img class="px b" src="${sprFull(to)}" alt=""></div>
      <div class="evotext" id="evT">What? ${esc(OPS[from].n)} is evolving!</div><button class="btn" id="evDone" hidden>Continue</button></div>`;
    root.hidden = false; sfx("special"); music("evolution");
    const st = $(".evostage");
    setTimeout(() => st.classList.add("go"), 300);
    setTimeout(() => { st.classList.add("done"); $("#evT").textContent = `Congratulations! Your ${OPS[from].n} evolved into ${OPS[to].n}!`; cry(to); jingle("evolved"); $("#evDone").hidden = false; }, 3400);
    root.onclick = ev => { if (ev.target.id === "evDone") { root.hidden = true; root.innerHTML = ""; resolve(); } };
  });
}

// ---------- Pokédex ----------
SCREENS.dex = () => {
  const f = UI.dexF;
  const reg = UI.dexR || 0;   // the region: its Pokémon by their number (Kanto 1-151, Johto to 251, Hoenn to 386, Sinnoh to 493, Unova to 649, Kalos to 721, Alola to 809, Galar to 905, Paldea to 1025)
  const list = OP_KEYS.filter(k => OPS[k].gen === reg + 1 && (f === "all" || (f === "caught" ? S.dex.caught[k] : f === "seen" ? S.dex.seen[k] && !S.dex.caught[k] : !S.dex.seen[k])));
  return `<div class="stack">
    <div class="spread">${back("go", "Pokémon", 'data-v="ops"')}<span class="eyebrow">National Pokédex</span></div>
    <section class="panel dexhead"><div class="spread"><div><div class="eyebrow">${esc(profName())}'s Pokédex</div><h2>Seen ${dexSeen()} · Caught ${dexCaught()}</h2></div><span class="num" style="font:900 30px var(--f-title)">${Math.floor(dexCaught() / DEX_N * 100)}%</span></div>
      <div class="bar" style="margin-top:8px"><i style="width:${dexCaught() / DEX_N * 100}%"></i></div>
      <p class="small dim" style="margin-top:6px">${oakRating()}</p></section>
    <div class="filters">${REGIONS.map((n, i) => `<button class="chip ${reg === i ? "on" : ""}" data-act="dexR" data-v="${i}">${n}</button>`).join("")}</div>
    <div class="filters">${[["all", "All"], ["caught", "Caught"], ["seen", "Seen only"], ["unknown", "Unknown"]].map(([v, n]) => `<button class="chip ${f === v ? "on" : ""}" data-act="dexF" data-v="${v}">${n}</button>`).join("")}</div>
    <div class="dexgrid">${list.map(k => {
      const op = OPS[k], c = S.dex.caught[k], s = S.dex.seen[k];
      return `<button class="dexcell ${c ? "caught" : s ? "seen" : "unk"}" data-act="dexEntry" data-k="${k}"><span class="num tiny">${dexNo(op.id)}</span><img class="px" src="${sprFront(k)}" alt="" loading="lazy"><span class="tiny">${s || c ? esc(op.n) : "???"}</span>${c ? `<i class="ball">${IC.pokeball}</i>` : ""}</button>`;
    }).join("")}</div>
  </div>`;
};
function oakRating() {
  const n = dexCaught();
  return n >= DEX_N ? `${profName()}: ` + "Your Pokédex is entirely complete! Congratulations!" : n >= DEX_N * .8 ? `${profName()}: ` + "Wonderful! You're so close to completing the Pokédex!"
    : n >= DEX_N * .5 ? `${profName()}: ` + "You're well on your way! There are still rare Pokémon out there." : n >= 60 ? `${profName()}: ` + "Good! Try the Safari Zone and Explore to find more."
    : n >= 10 ? `${profName()}: ` + "You're getting the hang of it! Keep catching." : `${profName()}: ` + "You still have lots to do. Look for Pokémon in grassy areas!";
}
function dexModal(k) {
  const op = OPS[k], c = S.dex.caught[k], s = S.dex.seen[k];
  const where = [];
  for (const id in NODES) { const nd = NODES[id]; if (nd.catch === k || nd.gift === k || (nd.reward && nd.reward.op === k)) where.push(`${id} ${nd.name}`); }
  for (const ch of STORY[0].chapters) if (ch.reward.op === k) where.push(`Chapter ${ch.no} reward`);
  for (const h of HUNTS) if (h.mobs.includes(k) || h.boss.includes(k)) where.push(`seen in ${h.n}`);
  if (SHOP.prize.items.some(i => i.give.op === k)) where.push("Game Corner Prize Corner");
  if (!op.leg) where.push(`Safari Zone (${op.rar}★)`);
  if (op.from) where.push(`evolve ${OPS[op.from].n}`);
  openModal(`<div class="stack">
    <div class="row" style="gap:12px"><div class="dexpic ${s || c ? "" : "unk"}"><img class="px" src="${sprFull(k)}" alt=""></div>
      <div><div class="eyebrow">${dexNo(op.id)}</div><h2>${s || c ? esc(op.n) : "???"}</h2>${s || c ? `<div class="small dim">${esc(op.genus)} Pokémon</div><div class="row" style="gap:4px;margin-top:4px">${typeChips(op.types)}</div>` : ""}</div></div>
    ${s || c ? `<div class="statgrid small"><div><span>Height</span><b>${(op.h / 10).toFixed(1)} m</b></div><div><span>Weight</span><b>${(op.w / 10).toFixed(1)} kg</b></div>
      <div><span>Ability</span><b>${esc(op.passives[0].name)}</b></div><div><span>Catch rate</span><b>${op.cr}</b></div></div>
      ${matchupHTML(op.types)}
      ${["HP", "Atk", "Def", "SpA", "SpD", "Spe"].map((n, i) => statBar(n, op.b[i])).join("")}
      <div class="small"><b>Learns:</b> <span class="dim">${op.learn.map(([lv, m]) => `${esc(MOVES[m].n)} (${lv})`).join(" · ") || "nothing by level"}</span></div>
      <div class="small"><b>Where to find it:</b> <span class="dim">${esc(where.join(" · ") || "Unknown")}</span></div>` : `<p class="small dim">You haven't seen this Pokémon yet.</p>`}
    <div class="row" style="gap:8px">${S.ops[k] ? `<button class="btn" style="flex:1" data-act="go" data-v="op" data-a="${k}">Summary</button>` : ""}<button class="btn ghost" style="flex:1" data-act="closeModal">Close</button></div>
  </div>`);
}

// ---------- Safari Zone ----------
SCREENS.hh = () => {
  const list = safariAreas();
  if (!UI.hhB || !list.some(b => b.id === UI.hhB)) UI.hhB = list[0].id;
  const B = bannerById(UI.hhB), std = !!B.std, names = ks => ks.map(k => esc(OPS[k].n)).join(", ");
  const pct = x => (Math.round(x * 1000) / 10) + "%", p5 = fiveNow(B), r4 = B.rate4 || MID_RATE, sp = (S.gacha.spark || {})[B.id] || 0;
  const c1 = B.step ? null : throwCost(B, 1), c10 = throwCost(B, 10), step = B.step ? stepOf(B) : 0;
  const cost = c => !c.ok ? `<small>${esc(c.why)}</small>` : c.cur === "orundum" ? `${IC.orundum}${fmtFull(c.amt)}${c.disc ? ' <small class="good">day\'s first</small>' : c.half ? ' <small class="good">half price</small>' : ""}` : `${c.cur === "permit" ? IC.permit : itemIcon(c.cur)}${c.amt}`;
  const passOK = !B.step && !B.only;
  // each ticket throws in one kind of event area: say so, take you there when it's open, or say when it opens next (a surprise stays a surprise)
  const TICKET_AREA = { gball: ["great", "Great Ball Safari"], uball: ["legend", "Legendary Safari"], mticket: ["myth", "Mythical Distribution"] };
  const tickets = ["gball", "uball", "mticket"].filter(k => S.inv[k] > 0).map(k => {
    const [key, where] = TICKET_AREA[k], here = B.ticket === k, open = list.find(b => b.ev && b.kind === key);
    const next = !open && key !== "myth" && eventsBetween(Date.now(), Date.now() + 14 * DAY).filter(e => e.type === "area" && e.key === key && e.start > Date.now()).sort((a, c) => a.start - c.start)[0];
    const note = here ? "used here" : open ? `for the ${where}: open now, tap to go` : next ? `for the ${where}, opens ${new Date(next.start).toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" })}` : `for the ${where} (a surprise event)`;
    return open && !here ? `<button class="mat" data-act="hhBanner" data-b="${open.id}">${itemIcon(k)}${S.inv[k]} ${esc(ITEMS[k].n)}s <small class="dim">${note}</small></button>`
      : `<span class="mat">${itemIcon(k)}${S.inv[k]} ${esc(ITEMS[k].n)}s <small class="dim">${note}</small></span>`;
  }).join("");
  return `<div class="stack">
    ${rateUpOn() ? `<div class="hint"><span class="small"><b>Double-Rate Safari!</b> Every area's 5★ chance is doubled for ${dur(eventsNow().find(e => e.type === "rateup").end - Date.now())}.</span></div>` : rateUpTeaser() ? `<div class="hint"><span class="small"><b>Something special begins in ${dur(rateUpTeaser().start - Date.now())}…</b></span></div>` : ""}
    <div class="areachips">${list.map(b => `<button class="chip ${b.id === B.id ? "on" : ""}" style="--ac:${b.col}" data-act="hhBanner" data-b="${b.id}">${b.ev ? '<i class="stag">EVENT</i> ' : ""}${b.std && !b.ev ? "Whole Park" : esc(b.n.replace(/^(Legendary Safari|Mythical Distribution|Step-Up Safari): /, ""))}</button>`).join("")}</div>
    <section class="panel banner-card safari tall${areaBg("safari-zone")}" style="--ac:${B.col}">
      ${std ? `<div class="bcrowd">${["kangaskhan", "tauros", "chansey", "scyther", "pinsir", "eevee"].map(k => `<img class="px" src="${sprFull(k)}" alt="">`).join("")}</div>`
        : B.feat6.length > 1 ? `<img class="px bmain duo a" src="${sprFull(B.feat6[1])}" alt="${esc(OPS[B.feat6[1]].n)}"><img class="px bmain duo" src="${sprFull(B.feat6[0])}" alt="${esc(OPS[B.feat6[0]].n)}">`
        : `<img class="px bmain solo" src="${sprFull(B.feat6[0])}" alt="${esc(OPS[B.feat6[0]].n)}">`}
      <div class="eyebrow" style="color:${B.col}">${esc(B.sub)}</div>
      <h2>${esc(B.n)}</h2>
      ${std ? `<p class="small" style="max-width:24ch">${esc(B.d)}</p>` : `<div class="row wrap" style="gap:4px">${starRow(5).replace('class="rstars"', 'class="rstars" style="justify-content:flex-start"')}${[...new Set(B.feat6.flatMap(k => OPS[k].types))].map(typeChip).join("")}</div>
      <p class="small" style="max-width:26ch">${esc(B.d)}</p>
      <p class="tiny" style="max-width:28ch"><b>${B.joint ? "70% of 5★ catches split between" : "Half of all 5★ catches are"} ${names(B.feat6)}.</b>${B.feat5.length ? ` Featured 4★: ${names(B.feat5)}.` : ""}${B.feat4.length ? ` Often seen: ${names(B.feat4)}.` : ""}</p>`}
      ${B.ends ? `<p class="tiny dim">Closes in ${dur(B.ends - Date.now())} · ${new Date(B.ends).toISOString().slice(5, 16).replace("T", " ")} UTC${B.ev ? "" : " · new areas every Monday"}</p>` : ""}
    </section>
    <div class="small dim">Odds: 5★ ${pct(rate5(B))}${p5 > rate5(B) ? ` <b class="good">(now ${pct(p5)})</b>` : ""} · 4★ ${pct(r4)} · 3★ ${pct(1 - Math.min(1, p5 + r4))}. ${S.gacha.pity >= 50 ? "Your 5★ chance is rising: +3% each throw until you catch one." : `${50 - S.gacha.pity} throws until the 5★ chance starts rising (+3% a throw: a 5★ is certain by throw 83).`}</div>
    ${!std && B.feat6.length ? `<div class="small">${S.gacha.guar ? `<b class="good">Your next 5★ in a featured area is sure to be ${B.feat6.length > 1 ? "one of the featured ones" : OPS[B.feat6[0]].n}</b> (you missed the last 50/50).` : `Miss the featured 5★ and your next 5★ in a featured area is sure to be featured.`}</div>
      <div class="spread small"><span><span class="ico">${itemIcon("spoint")}</span> Safari Points here: <b>${sp}/${SPARK}</b> <span class="tiny dim">(one a throw; they expire when the area closes)</span></span></div>
      ${sp >= SPARK ? `<div class="row wrap" style="gap:6px">${B.feat6.map(k => `<button class="btn sm" data-act="spark" data-k="${k}">Trade ${SPARK} for ${esc(OPS[k].n)}</button>`).join("")}</div>` : ""}` : ""}
    ${B.step ? `<div class="stack" style="gap:4px">${STEP_UP.map((st, j) => `<div class="lgoal${j === step ? " on" : ""}"><div><b>Step ${j + 1}${j === step ? " · next" : j < step ? " · done" : ""}</b><div class="tiny dim">×10 for ${fmtFull(st.cost)} Gems: ${stepText(st)}</div></div></div>`).join("")}</div>` : ""}
    ${passOK && S.inv.free10 > 0 ? `<button class="btn wide freepull" data-act="pullFree10">${IC.free10.replace("<svg", '<svg width="26" height="26"')}<span>Use a Safari Pass: 10 free throws<br><small>×${S.inv.free10}</small></span></button>` : ""}
    ${S.inv.gold5 > 0 ? `<button class="btn wide freepull master" data-act="pullGold5">${IC.gold5.replace("<svg", '<svg width="26" height="26"')}<span>Throw the Master Ball: a random 5★ Pokémon<br><small>×${S.inv.gold5}</small></span></button>` : ""}
    ${S.gacha.firstTen && !B.step ? `<div class="hint">${IC.star.replace("<svg", '<svg width="20" height="20"')}<span class="small">Your first ten throws are guaranteed to catch at least one 4★ Pokémon.</span></div>` : ""}
    <div class="row" style="gap:10px">
      ${c1 ? `<button class="btn ghost" style="flex:1" data-act="pull" data-n="1" ${c1.ok ? "" : "disabled"}>Throw ×1<br><span class="cost">${cost(c1)}</span></button>` : ""}
      <button class="btn" style="flex:1" data-act="pull" data-n="10" ${c10.ok ? "" : "disabled"}>${B.step && STEP_UP[step] ? `Step ${step + 1}: ×10` : "Throw ×10"}<br><span class="cost">${cost(c10)}</span></button>
    </div>
    <div class="mats"><span class="mat">${IC.permit}${S.permit} Safari Balls</span>${tickets}<span class="mat">${IC.orundum}${fmt(S.orundum)} Gems</span><span class="mat">${IC.cert}${S.cert} Coins</span></div>
    <p class="tiny dim">Catching a Pokémon you already have raises its IVs (up to 6). Once its IVs are perfect, you get Game Corner Coins instead. Throws use an area's own tickets first, then Safari Balls, then Gems (600 each; the day's first ×1 costs 60; ×10 costs 5,400; your first ×10 in each event area is half price).</p>
  </div>`;
};
// throw animation: balls wobble (Poké, Great or Ultra Ball by rarity), then "Gotcha!" cards
function gachaReveal(results, master) {
  return new Promise(resolve => {
    const top = Math.max(...results.map(r => OPS[r.key].rar));
    const root = $("#gacha");
    root.innerHTML = `<div class="gwrap"><canvas class="gcv" id="gcv"></canvas><div class="gtitle" id="gT"><div class="eyebrow">Safari Zone</div><h1>${master ? "Go, Master Ball!" : "Throw!"}</h1><p class="small">Tap to skip</p></div><div class="ggrid" id="gG" hidden></div><button class="btn" id="gDone" hidden>Done</button></div>`;
    root.hidden = false;
    const cv = $("#gcv"), g = cv.getContext("2d"), dpr = pxRatio();
    const W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.scale(dpr, dpr);
    const kind = master ? "master" : BALL_OF(top), t0 = performance.now();
    const bg = RES_DATA.area["safari-zone"] ? Object.assign(new Image(), { src: resPng(RES_DATA.area["safari-zone"]) }) : null;
    let run = true;
    const loop = () => {
      if (!run || !cv.isConnected) return; requestAnimationFrame(loop);
      const t = (performance.now() - t0) / 1000;
      if (bg && bg.naturalWidth) {   // the FireRed/LeafGreen Safari Zone, filling the screen
        const s = Math.max(W / bg.naturalWidth, H / bg.naturalHeight);
        g.imageSmoothingEnabled = false; g.drawImage(bg, (W - bg.naturalWidth * s) / 2, (H - bg.naturalHeight * s) / 2, bg.naturalWidth * s, bg.naturalHeight * s);
      } else {
        const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#f2c87a"); sky.addColorStop(.6, "#c8b05a"); sky.addColorStop(1, "#6a8a3a");
        g.fillStyle = sky; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 18; k++) { const x = (k * 97 % W), y = H * .62 + (k % 3) * 12; g.fillStyle = "#4a7a2a"; g.beginPath(); g.moveTo(x - 14, y + 30); g.lineTo(x, y + Math.sin(t * 3 + k) * 3); g.lineTo(x + 14, y + 30); g.fill(); }
      }
      const k = Math.min(1, t / .7), bx = lerp(-30, W / 2, k), by = H * .66 - Math.sin(k * Math.PI) * H * .3;
      const wob = t > .8 && t < 2.3 ? Math.sin((t - .8) * 9) * .5 * (1 - (t - .8) / 1.6) : 0;
      if (t < 2.4) drawBall(g, bx, t > .7 ? H * .66 : by, 26, kind, t < .7 ? t * 16 : wob, 0);
      else { const f = Math.min(1, (t - 2.4) * 4); g.globalAlpha = 1 - f; drawBall(g, W / 2, H * .66, 26 + f * 30, kind, 0, f); g.globalAlpha = 1; g.fillStyle = `rgba(255,255,255,${1 - f})`; g.fillRect(0, 0, W, H); }
      if (t > 2.3 && t < 2.6) { g.fillStyle = "#fff"; g.font = "900 34px Nunito, Arial"; g.textAlign = "center"; g.fillText("Gotcha!", W / 2, H * .35); }
    };
    loop(); sfx("warp");
    setTimeout(() => sfx("tap"), 1000); setTimeout(() => sfx("tap"), 1500); setTimeout(() => sfx("win"), 2300);
    let stage = 0;
    const show = () => {
      if (stage || !$("#gT")) return;
      stage = 1; $("#gT").hidden = true; const G = $("#gG"); G.hidden = false;
      if (results.length === 1) { G.style.gridTemplateColumns = "1fr"; G.style.maxWidth = "240px"; }
      G.innerHTML = results.map((r, i) => { const op = OPS[r.key]; return `<div class="gcard r${op.rar}" style="--rc:${TC[op.types[0]]};animation-delay:${i * .12}s">${r.isNew ? '<span class="gnew">NEW</span>' : r.iv ? '<span class="gnew iv">IV↑</span>' : r.coins ? `<span class="gnew iv">+${r.coins}C</span>` : ""}<img class="px" src="${sprFull(r.key)}" alt="${esc(op.n)}"><span class="gst">${"★".repeat(op.rar)}<br>${esc(op.n)}</span></div>`; }).join("");
      if (top >= 5) sfx("win"); else sfx("heal");
      jingle("caught");
      cry(results.find(r => OPS[r.key].rar === top).key, { at: .25 }); // the best catch calls out
      setTimeout(() => { if ($("#gDone")) $("#gDone").hidden = false; stage = 2; }, results.length * 120 + 500);
    };
    root.onclick = ev => {
      if (ev.target.id === "gDone") { run = false; root.hidden = true; root.innerHTML = ""; resolve(); return; }
      if (stage === 0) show();
    };
    setTimeout(show, 2800);
  });
}
// your first region's Professor and three Pokémon (Professor Oak's, in Kanto)
function starterModal() {
  const r = regionCard(S.region || "kanto");
  openModal(`<div class="stack" style="text-align:center;align-items:center">
    <img class="px" src="${profURL(r)}" alt="" style="width:88px;height:88px;object-fit:contain">
    <div class="eyebrow">${esc(r.prof[0].replace(/^Prof\. /, "Professor "))}'s Lab</div><h2>Choose your first Pokémon</h2>
    <p class="small dim">Each is strong against one of the others: Grass beats Water, Water beats Fire, Fire beats Grass.</p>
    <div class="starters">${r.starters.map(k => `<button class="starter" data-act="pickStarter" data-k="${k}" style="--tc:${TC[OPS[k].types[0]]}"><img class="px" src="${sprFull(k)}" alt=""><b>${OPS[k].n}</b><span class="row" style="gap:3px;justify-content:center">${typeChips(OPS[k].types)}</span></button>`).join("")}</div>
  </div>`);
  m0Click();
}

// ---------- research / shops / bag ----------
function missionsModal() {
  const dl = DAILIES.map(d => {
    const v = Math.min(d.goal, S.daily[d.id] || 0), cl = S.daily.claimed[d.id];
    return `<div class="sub stack" style="gap:6px"><div class="spread"><b class="small">${d.n}</b><span class="small num">${v}/${d.goal}</span></div>
      <div class="bar"><i style="width:${v / d.goal * 100}%"></i></div>
      <div class="spread"><span class="row tiny">${Object.entries(d.reward).map(([k, n]) => `<span class="cost">${itemIcon(k)}${fmt(n)}</span>`).join(" ")}</span>
      <button class="btn sm" data-act="claimDaily" data-id="${d.id}" ${v >= d.goal && !cl ? "" : "disabled"}>${cl ? "Claimed" : "Claim"}</button></div></div>`;
  }).join("");
  openModal(`<div class="stack"><div class="eyebrow">Resets daily</div><h2>Daily Research</h2>${dl}
    <div class="sub spread"><span class="small">Finish all of today's research: <span class="cost">${IC.permit}1</span></span>
      <button class="btn sm" data-act="claimAllDaily" ${DAILIES.every(d => S.daily.claimed[d.id]) && !S.daily.claimed.all ? "" : "disabled"}>${S.daily.claimed.all ? "Claimed" : "Claim"}</button></div>
    <button class="btn ghost wide" data-act="go" data-v="ach">${medalHTML(4, 1, 3, 22)} Medals · ${achDone()}/${achTotal}</button>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
// "X wants to learn Y!": one queued move at a time (S.learnQ, from learnLevels in a6_state.js), whenever no battle or other
// window is up
const moveCard = (m, tag) => { const M = MOVES[m], sk = skillFor(m, M.s); return `<div class="mvc"><span class="tiny dim">${tag}</span><b>${esc(M.n)}</b>
  <span class="row" style="gap:3px">${typeChip(M.t)}${catChip(M.c)}</span><span class="tiny">${M.p ? `Power ${powText(m)}` : "Status move"} · Accuracy ${M.a ? M.a + "%" : "—"}</span><span class="tiny dim">${esc(sk.desc)}</span></div>`; };
function learnPrompt() {
  const q = S.learnQ[0]; if (!q) return false;
  const p = S.ops[q.k];
  if (!p || pmv(q.k).includes(q.m)) { S.learnQ.shift(); return learnPrompt(); }
  const i = slotOf(q.m) - 1, old = p.mv[i];
  if (!old) { learnMove(q.k, q.m); S.learnQ.shift(); toast(`${OPS[q.k].n} learned ${MOVES[q.m].n}!`); save(); return learnPrompt(); }
  openModal(`<div class="stack learnbox"><div class="row" style="gap:10px"><img class="px" src="${sprFront(q.k)}" alt="" style="width:56px;height:56px;object-fit:contain">
      <div><div class="eyebrow">Lv ${p.lvl} · S${i + 1} move</div><h3>${esc(OPS[q.k].n)} wants to learn ${esc(MOVES[q.m].n)}!</h3></div></div>
    <p class="small">But it already knows ${esc(MOVES[old].n)} in S${i + 1}, and can only know one S${i + 1} move. Forget ${esc(MOVES[old].n)} to learn ${esc(MOVES[q.m].n)}?</p>
    <div class="mvcmp">${moveCard(q.m, "New move")}${moveCard(old, "Knows now")}</div>
    <button class="btn wide" data-act="learnYes">Forget ${esc(MOVES[old].n)} · learn ${esc(MOVES[q.m].n)}</button>
    <button class="btn ghost wide" data-act="learnNo">Keep ${esc(MOVES[old].n)}</button>
    <p class="tiny dim" style="text-align:center">Whichever it doesn't keep can be taught again at the Move Reminder.</p></div>`, "learn");
  $("#modal").onclick = null;   // answer it: tapping outside doesn't skip the question
  return true;
}
// (the Demo asks these itself, at moments when nothing else is going on: demoLearn in a9g_demo.js)
function learnCheck() {
  clearTimeout(learnCheck.t);
  if (DEMO_ON()) return;
  learnCheck.t = setTimeout(() => { if (S && S.learnQ && S.learnQ.length && UI.inGame && !BT.on && !DEMO_ON() && $("#modal").hidden && $("#gacha").hidden && $("#dlg").hidden) learnPrompt(); }, 450);
}
// the Move Reminder: moves its species learns by level, up to its level, for Poké Dollars
// Mints: pick the nature it gets
function mintModal(key) {
  const p = S.ops[key], own = MINT_NATURES.filter(n => S.inv["mint_" + n] > 0 && n !== p.nat);
  openModal(`<div class="stack"><div><div class="eyebrow">${esc(OPS[key].n)} · ${natName(p.nat)} nature (${natText(p.nat)})</div><h2>Use a Mint</h2></div>
    ${own.length ? `<div class="stack" style="gap:6px">${own.map(n => `<div class="evorow"><span class="ri" style="width:36px;height:36px">${ITEMS["mint_" + n].ic}</span>
      <div style="flex:1;min-width:0"><b>${esc(ITEMS["mint_" + n].n)}</b> <span class="tiny dim">×${S.inv["mint_" + n]}</span><div class="tiny dim">${natText(n)}</div></div>
      <button class="btn sm" data-act="mintUse" data-k="${key}" data-n="${n}">Use</button></div>`).join("")}</div>` : `<p class="small dim">You have no Mints that would change it. The Poké Mart sells them.</p>`}
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
// the Ability Capsule and Ability Patch: pick the Ability it gets
function abilityModal(key, item) {
  const p = S.ops[key], list = abilityChoices(key, item), cur = abilityOf(p.ab || OPS[key].ab);
  openModal(`<div class="stack"><div><div class="eyebrow">${esc(OPS[key].n)} · ${esc(cur.name)}</div><h2>${ITEMS[item].n}</h2><p class="small dim">${esc(ITEMS[item].d)}</p></div>
    ${list.length ? `<div class="stack" style="gap:6px">${list.map(a => { const A = abilityOf(a); return `<div class="evorow"><div style="flex:1;min-width:0"><b>${esc(A.name)}</b>${hiddenAbilities(key).includes(a) ? ' <span class="tiny dim">Hidden Ability</span>' : ""}<div class="tiny dim">${esc(A.text)}</div></div>
      <button class="btn sm" data-act="abUse" data-k="${key}" data-it="${item}" data-a="${a}">Use</button></div>`; }).join("")}</div>` : `<p class="small dim">It has no other Ability this item could give it.</p>`}
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
function remindModal(key) {
  const p = S.ops[key], list = remindable(key); pmv(key);
  openModal(`<div class="stack"><div class="shophead"><img class="px" src="${trainerURL("movetutor")}" alt=""><div><div class="eyebrow">${esc(OPS[key].n)} · Lv ${p.lvl}</div><h2>Move Reminder</h2>
      <p class="small dim">"I can make a Pokémon remember a move it would have learned by now. For a fee, of course!"</p></div></div>
    ${list.length ? `<div class="stack" style="gap:6px">${list.sort((a, b) => slotOf(a) - slotOf(b) || MOVES[a].n.localeCompare(MOVES[b].n)).map(m => { const s = slotOf(m), c = REMIND_COST[s], cur = p.mv[s - 1]; return `<div class="evorow"><span class="abicon sm" style="--tc:${TC[MOVES[m].t]}">S${s}</span>
      <div style="flex:1;min-width:0"><b>${esc(MOVES[m].n)}</b> <span class="row" style="gap:3px;display:inline-flex">${typeChip(MOVES[m].t)}${catChip(MOVES[m].c)}</span><div class="tiny dim">${MOVES[m].p ? `Power ${powText(m)} · ` : ""}${cur ? `replaces ${esc(MOVES[cur].n)}` : `fills its empty S${s}`}</div></div>
      <button class="btn sm" data-act="remindDo" data-k="${key}" data-m="${m}" ${S.lmd >= c ? "" : "disabled"}><span class="cost">${IC.lmd}${fmt(c)}</span></button></div>`; }).join("")}</div>`
      : `<p class="small dim">${esc(OPS[key].n)} hasn't forgotten any moves it could know by Lv ${p.lvl}.</p>`}
    <p class="tiny dim">You have ${IC.lmd.replace("<svg", '<svg width="12" height="12"')} ${fmtFull(S.lmd)} Poké Dollars.</p>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
// the TM Case: your TMs this Pokémon can learn
function tmCaseModal(key) {
  const p = S.ops[key], list = Object.keys(S.tms).map(Number).filter(n => tmFits(key, n)).sort((a, b) => a - b); pmv(key);
  openModal(`<div class="stack"><div class="eyebrow">${esc(OPS[key].n)} · TM Case</div><h2>Use a TM</h2>
    ${list.length ? `<div class="stack" style="gap:6px">${list.map(n => { const m = TM_MOVE[n], s = slotOf(m), cur = p.mv[s - 1]; return `<div class="evorow"><span class="ri" style="width:34px;height:34px">${tmIcon(n)}</span>
      <div style="flex:1;min-width:0"><b>${tmName(n)} ${esc(MOVES[m].n)}</b> <span class="tiny">×${S.tms[n]}</span><div class="tiny dim">S${s} · ${MOVES[m].t}${MOVES[m].p ? ` · Power ${powText(m)}` : ""} · ${cur ? `replaces ${esc(MOVES[cur].n)}` : `fills its empty S${s}`}</div></div>
      <button class="btn sm" data-act="tmTeach" data-k="${key}" data-n="${n}">Teach</button></div>`; }).join("")}</div>`
      : `<p class="small dim">None of your TMs fit ${esc(OPS[key].n)}. The Poké Mart sells six at a time.</p>`}
    <p class="tiny dim">A TM teaches its move once.</p>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
// after buying a TM: who can learn it
function tmTeachModal(n) {
  const m = TM_MOVE[n], fits = Object.keys(S.ops).filter(k => tmFits(k, n)).sort((a, b) => power(b, S.ops[b]) - power(a, S.ops[a]));
  openModal(`<div class="stack"><div class="row" style="gap:10px"><span class="ri" style="width:40px;height:40px">${tmIcon(n)}</span><div><div class="eyebrow">${tmName(n)} · S${slotOf(m)} move</div><h2>${esc(MOVES[m].n)}</h2></div></div>
    <p class="small dim">${esc(skillFor(m, slotOf(m)).desc)}</p>
    ${fits.length ? `<div class="tmfits">${fits.map(k => { const cur = S.ops[k].mv[slotOf(m) - 1]; return `<button class="rcell" data-act="tmTeach" data-k="${k}" data-n="${n}">${opHTML(k)}${pnameHTML(k)}<div class="pw">${cur ? `for ${esc(MOVES[cur].n)}` : "new"}</div></button>`; }).join("")}</div>`
      : `<p class="small dim">None of your Pokémon can learn it yet.</p>`}
    <button class="btn ghost wide" data-act="closeModal">Keep it in the TM Case</button></div>`);
}
// the Shops' tabs: Offers first (packages and deals, a6k_offers.js), then each shop
const shopTabsHTML = tab => `<div class="tabs2">${shopOn("offers") ? `<button class="${tab === "offers" ? "on" : ""}" data-act="shopTab" data-t="offers">Offers</button>` : ""}${Object.entries(SHOP).filter(([k, v]) => !v.hidden && shopOn(k)).map(([k, v]) => `<button class="${tab === k ? "on" : ""}" data-act="shopTab" data-t="${k}">${v.n}</button>`).join("")}${shopOn("boutique") ? `<button class="${tab === "boutique" ? "on" : ""}" data-act="shopTab" data-t="boutique">Boutique</button>` : ""}</div>`;
SCREENS.shop = () => {
  if (!shopOn(UI.shopTab)) UI.shopTab = "mart";   // (a tab that hasn't opened yet)
  if (UI.shopTab === "boutique") return boutiqueHTML();
  if (UI.shopTab === "offers") return `<div class="stack"><div class="spread">${back("go", "Home", 'data-v="home"')}<span class="mat">${IC.orundum}${fmt(S.orundum)} Gems</span></div>${shopTabsHTML("offers")}${offersHTML()}</div>`;
  const tab = SHOP[UI.shopTab] && !SHOP[UI.shopTab].hidden ? UI.shopTab : "mart", sh = SHOP[tab], cur = sh.cur;
  if (tab === "tm") return tmShopHTML();
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="mat">${itemIcon(cur)}${fmt(have(cur))} ${itemName(cur)}</span></div>
    <div class="shophead"><img class="px" src="${trainerURL({ mart: "martclerk", prize: "gamer", bp: "acetrainerf", gems: "lady" }[tab])}" alt=""><div><h2>${sh.n}</h2><p class="small dim">${{ mart: "Celadon Dept. Store: everything a Trainer needs.", prize: "The Game Corner's prize counter. Trade Coins for rare Pokémon.", bp: "Spend Battle Points from Link Battles on powerful held items.", gems: "Trade Gems for Safari Balls and Max Elixirs." }[tab]}</p></div></div>
    ${tab === "prize" && featOn("slots") ? `<button class="btn wide" data-act="slotsOpen">Play the slots${slotFree() ? ` · ${slotFree()} free spins (Game Corner Fever)` : ` · ${SLOT_BET} Coins a spin`}</button>` : ""}
    ${shopTabsHTML(tab)}
    ${[...new Set(shopItems(sh).map(shopSec))].map(sec => `${new Set(shopItems(sh).map(shopSec)).size > 1 ? `<div class="eyebrow shopsec">${sec}</div>` : ""}<div class="tiles">${shopItems(sh).filter(it => shopSec(it) === sec).map(it => {
      const k = Object.keys(it.give)[0], v = it.give[k], ic = k === "op" ? `<img class="px" src="${sprFront(v)}" alt="" style="width:100%">` : k === "held" ? heldIcon(v) : itemIcon(k === "sanityMax" ? "sanity" : k);
      const sub = k === "op" ? `${OPS[v].rar}★ ${OPS[v].types.join("/")}${S.ops[v] ? " · owned" : ""}` : k === "held" ? HELD[v].d : it.d || (ITEMS[k] && ITEMS[k].d) || "";
      return `<button class="tile shopit" data-act="buy" data-t="${tab}" data-id="${it.id}" ${have(cur) >= it.cost ? "" : "disabled"}>
      <div class="shophd"><span class="ticon">${ic}</span><h3>${esc(it.n)}</h3></div><span class="tsub">${esc(sub)}${have(k) && k !== "op" && k !== "held" && ITEMS[k] ? ` · you have ${have(k)}` : ""}</span><span class="tsub cost">${itemIcon(cur)}${fmt(it.cost)}</span></button>`;
    }).join("")}</div>`).join("")}
  </div>`;
};
// the Boutique: the looks you can wear (AVATARS), Gems each; what you own is worn from here or the Trainer Card
function boutiqueHTML() {
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="mat">${IC.orundum}${fmt(S.orundum)} Gems</span></div>
    <div class="shophead"><img class="px" src="${trainerURL("beauty")}" alt=""><div><h2>Boutique</h2><p class="small dim">${esc(deptStore())}'s Boutique: a new look for your Trainer, ${fmtFull(LOOK_COST)} Gems each. Every Trainer you meet on the server wears one of these.</p></div></div>
    ${shopTabsHTML("boutique")}
    <div class="tiles">${AVATARS.map(([k, n]) => { const own = ownsLook(k), on = avatar() === k;
      return `<div class="tile look${on ? " on" : ""}"><div class="lookpic"><img class="px" src="${trainerURL(k)}" alt=""></div><h3>${esc(n)}</h3>
        ${on ? '<span class="tsub">Wearing</span>' : own ? `<button class="btn sm ghost" data-act="wearLook" data-k="${k}">Wear</button>` : `<button class="btn sm" data-act="buyLook" data-k="${k}" ${S.orundum >= LOOK_COST ? "" : "disabled"}>${IC.orundum}${fmtFull(LOOK_COST)}</button>`}</div>`; }).join("")}</div>
  </div>`;
}
// the TM counter: six TMs (or HMs) at a time, a new six every 15 minutes
function tmShopHTML() {
  const stock = tmStock(), left = TM_ROTATE - Date.now() % TM_ROTATE, mine = Object.keys(S.ops);
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="mat">${itemIcon("lmd")}${fmt(have("lmd"))} ${itemName("lmd")}</span></div>
    <div class="shophead"><img class="px" src="${trainerURL("martclerk")}" alt=""><div><h2>TMs</h2><p class="small dim">${esc(deptStore())}'s TM corner: six TMs at a time, from every generation's TMs, HMs and TRs. Each teaches its move once.</p></div></div>
    ${shopTabsHTML("tm")}
    <div class="spread small"><span class="dim">New TMs in <b class="num" id="tmLeft">${dur(left)}</b></span><span class="dim">In your TM Case: <b>${Object.values(S.tms).reduce((a, b) => a + b, 0)}</b></span></div>
    <div class="tiles">${stock.map(n => {
      const m = TM_MOVE[n], M = MOVES[m], fits = mine.filter(k => tmFits(k, n)).length, c = tmPrice(n);
      return `<button class="tile shopit" data-act="buyTM" data-n="${n}" ${S.lmd >= c ? "" : "disabled"}>
      <div class="shophd"><span class="ticon">${tmIcon(n)}</span><h3>${tmName(n)} ${esc(M.n)}</h3></div><span class="tsub row" style="gap:3px">${typeChip(M.t)}${catChip(M.c)}<span>S${M.s}${M.p ? ` · Power ${powText(m)}` : ""}</span></span>
      <span class="tsub">${fits ? `${fits} of your Pokémon can learn it` : "None of your Pokémon can learn it yet"}${S.tms[n] ? ` · you have ${S.tms[n]}` : ""}</span><span class="tsub cost">${itemIcon("lmd")}${fmt(c)}</span></button>`;
    }).join("")}</div>
  </div>`;
}
SCREENS.depot = () => {
  const tab = UI.depotTab;
  const extra = ["gball", "uball", "mticket", "bottlecap", "goldbottlecap", "wticket", "dice", "luckydice", "golddice", "tkey", "seamap", "fticket", "luckybag", "luckybag2", "choicebox", "starpiece"];
  const items = ["rec1", "rec2", "rec3", "rec4", "rare", "summ", ...STONES, "permit", "prime", "cert", "tokens", "free10", "gold5", ...extra].filter(k => ![...extra, "free10", "gold5"].includes(k) || have(k) > 0);
  const held = HELD_KEYS.filter(k => (S.held[k] || 0) > 0), keys = Object.keys(S.keys || {}).filter(id => KEY_ITEMS[id]);
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="eyebrow">Bag</span></div>
    <h2>Bag</h2>
    <div class="tabs2"><button class="${tab === "items" ? "on" : ""}" data-act="depotTab" data-t="items">Items</button><button class="${tab === "held" ? "on" : ""}" data-act="depotTab" data-t="held">Held items · ${held.reduce((a, k) => a + S.held[k], 0)}</button>${keys.length ? `<button class="${tab === "keys" ? "on" : ""}" data-act="depotTab" data-t="keys">Key Items · ${keys.length}</button>` : ""}</div>
    ${tab === "keys" ? `<div class="baglist">${keys.map(id => `<div class="bagrow"><span class="ri">${keyIcon(id)}</span><div style="flex:1;min-width:0"><b>${esc(keyName(id))}</b><div class="tiny dim">${esc(KEY_ITEMS[id].d || "A keepsake from your Journey.")}</div></div></div>`).join("")}</div>`
      : tab === "items" ? `<div class="baglist">${items.map(k => `<div class="bagrow"><span class="ri">${itemIcon(k)}</span><div style="flex:1;min-width:0"><b>${esc(ITEMS[k].n)}</b><div class="tiny dim">${esc(ITEMS[k].d || "")}</div></div><span class="num">×${fmt(have(k))}</span></div>`).join("")}</div>`
      : held.length ? `<div class="baglist">${held.map(k => `<div class="bagrow"><span class="ri">${heldIcon(k)}</span><div style="flex:1;min-width:0"><b>${esc(HELD[k].n)}</b><div class="tiny dim">${esc(HELD[k].d)}</div></div><span class="num">×${S.held[k]}${heldUsed(k) ? `<small class="dim"> (${heldUsed(k)} held)</small>` : ""}</span></div>`).join("")}</div><p class="tiny dim">Give held items to Pokémon from their summary (Item tab).</p>`
      : '<p class="small dim">No held items yet. Explore wild areas, or trade BP at the BP Exchange.</p>'}
  </div>`;
};
function sanityModal() {
  openModal(`<div class="stack"><div class="shophead"><img class="px" src="${trainerURL("nurse")}" alt=""><div><div class="eyebrow">Pokémon Center</div><h2>PP</h2></div></div><p class="small dim">Battles use PP. You regain 1 PP every 30 seconds, a Trainer Level up restores it, and a Max Elixir fills it to max.</p>
    <div class="spread"><span class="cost">${IC.sanity}<b class="num">${S.sanity}/${maxSanity(S.lvl)}</b></span><span class="tiny dim">${S.sanity < maxSanity(S.lvl) ? "+1 in " + dur(SAN_MS - (Date.now() - S.sTime)) : "Full"}</span></div>
    <button class="btn wide" data-act="buy" data-t="elixir" data-id="e_pp" ${S.prime >= 1 ? "" : "disabled"}>Use a Max Elixir <span class="tiny">(you have ${S.prime})</span></button>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
function rewardModal(title, list, sub = "") {
  openModal(`<div class="stack" style="align-items:center;text-align:center"><div class="eyebrow">${esc(sub)}</div><h2>${esc(title)}</h2>
    <div class="rewards">${rewardsHTML(list)}</div><button class="btn wide" data-act="closeModal">OK</button></div>`);
}
