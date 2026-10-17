
// =====================================================================
//  SCREENS (1/2): shell, home, journey map, stage sheet, team select, dialogue
// =====================================================================
const UI = { view: "home", arg: null, el: "all", cls: "all", sort: "cp", all: false, opTab: "info", team: null, depotTab: "items", shopTab: "mart", hhB: null, dexF: "all" };

// ---------- hold for a tip: a button with data-tip shows it in a bubble while it's held; the tap that ends the hold is dropped ----------
const HOLD = { t: 0, el: null, shown: false, swallow: 0 };
function tipShow(el) {
  const scr = $("#screen") || document.body, sr = scr.getBoundingClientRect(), k = sr.width / (scr.offsetWidth || sr.width), r = el.getBoundingClientRect();
  const b = document.createElement("div"); b.className = "holdtip"; b.textContent = el.dataset.tip; scr.appendChild(b);
  const w = b.offsetWidth, h = b.offsetHeight, cx = (r.left + r.width / 2 - sr.left) / k, above = (r.top - sr.top) / k - h - 10;
  b.style.left = Math.max(6, Math.min(scr.offsetWidth - w - 6, cx - w / 2)) + "px";
  b.style.top = (above > 6 ? above : (r.bottom - sr.top) / k + 10) + "px";
  HOLD.shown = true;
}
function tipHide() { clearTimeout(HOLD.t); clearTimeout(HOLD.out); for (const b of $$(".holdtip")) b.remove(); }
document.addEventListener("pointerdown", e => {
  tipHide(); HOLD.shown = false; HOLD.el = null;
  const el = e.target.closest && e.target.closest("[data-tip]"); if (!el || !el.dataset.tip) return;
  Object.assign(HOLD, { el, x: e.clientX, y: e.clientY, t: setTimeout(() => tipShow(el), 420) });
}, true);
document.addEventListener("pointermove", e => { if (HOLD.el && !HOLD.shown && Math.hypot(e.clientX - HOLD.x, e.clientY - HOLD.y) > 12) { clearTimeout(HOLD.t); HOLD.el = null; } }, true);
for (const ev of ["pointerup", "pointercancel"]) document.addEventListener(ev, () => {
  clearTimeout(HOLD.t);
  if (HOLD.shown) { HOLD.swallow = Date.now(); HOLD.out = setTimeout(tipHide, 4000); }   // it stays a moment to finish reading
  HOLD.el = null;
}, true);
document.addEventListener("click", e => { if (HOLD.swallow && Date.now() - HOLD.swallow < 500) { HOLD.swallow = 0; e.stopPropagation(); e.preventDefault(); } }, true);
document.addEventListener("contextmenu", e => { if (e.target.closest && e.target.closest("[data-tip], .squad .slot, .roster .rcell")) e.preventDefault(); });

function toast(msg, cls = "") { const t = document.createElement("div"); t.className = "toast " + cls; t.textContent = msg; $("#toast").appendChild(t); setTimeout(() => t.remove(), 2600); }
function openModal(html, cls) { const m = $("#modal"); m.className = cls || ""; m.innerHTML = `<div class="mbox" role="dialog">${html}</div>`; m.hidden = false; m.onclick = e => { if (e.target === m) closeModal(); }; }
function closeModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; m.className = ""; if (typeof learnCheck === "function") learnCheck(); }
const starRow = (n, max = 5) => { let s = ""; for (let k = 1; k <= max; k++) s += k <= n ? IC.star : ""; return `<div class="rstars">${s}</div>`; };
// a Pokémon portrait: sprite on a type-tinted disc, with level and IV badges
function opHTML(key, o = {}) {
  const op = OPS[key], p = o.prog !== undefined ? o.prog : S.ops[key];
  const own = !!p;
  return `<div class="pt ${own || o.show ? "" : "locked"}" style="--s:${o.s || 72}px;--gc:${TC[op.types[0]]};--gc2:${TC[op.types[1] || op.types[0]]}">
    ${o.nostars ? "" : starRow(op.rar)}
    <div class="ring"><img class="px" src="${sprFront(key)}" alt="${esc(op.n)}" loading="lazy" draggable="false"></div>
    ${p && !o.nolv ? `<div class="lv num">${p.lvl}</div>${p.pot > 1 && !o.noiv ? `<span class="potb">IV${p.pot}</span>` : ""}${p.held ? `<span class="heldb">${heldIcon(p.held)}</span>` : ""}` : ""}
  </div>`;
}
const pnameHTML = k => `<div class="pname">${esc(OPS[k].n)}<span class="sty">${OPS[k].types.map(t => `<i style="background:${TC[t]}"></i>`).join("")}</span></div>`;
const elChip = t => typeChip(t);
function enHTML(spec, s = 46) { return opHTML(spec.op, { s, prog: progForLV(spec.op, spec.LV || 1), nostars: 1, show: 1, noiv: 1 }); }
function itemIcon(k) { if (k === "sanity") return IC.sanity; if (k === "xp") return IC.xp; if (HELD[k]) return heldIcon(k); return (ITEMS[k] && ITEMS[k].ic) || resIcon(k); }
const itemName = k => k === "xp" ? "Exp. Points" : k === "rank" ? "Rank" : HELD[k] ? HELD[k].n : (ITEMS[k] && ITEMS[k].n) || k;
function rewardsHTML(list) {
  const merged = [];
  for (const r of list) { const m = merged.find(x => x.k === r.k && !r.k.startsWith("op:")); if (m) m.n += r.n; else merged.push({ ...r }); }
  return merged.map(r => {
    if (r.k.startsWith("op:")) { const k = r.k.slice(3); return `<div class="rw">${opHTML(k, { s: 54, nostars: 1, nolv: 1, show: 1 })}<span>${r.isNew === false ? "IVs up!" : "Caught!"}</span><span class="tiny dim">${esc(OPS[k].n)}</span></div>`; }
    if (r.k.startsWith("tm:")) { const n = +r.k.slice(3); return `<div class="rw"><div class="ri" style="width:54px;height:54px">${tmIcon(n)}</div><span class="num">×${r.n}</span><span class="tiny dim">${esc(tmName(n).replace(/ \(.*\)$/, "") + " " + MOVES[TM_MOVE[n]].n)}</span></div>`; }
    if (r.k.startsWith("key:")) { const id = r.k.slice(4); return `<div class="rw"><div class="ri" style="width:54px;height:54px">${keyIcon(id)}</div><span class="num">Key item</span><span class="tiny dim">${esc(keyName(id))}</span></div>`; }
    if (r.k.startsWith("held:")) { const k = r.k.slice(5); return `<div class="rw"><div class="ri" style="width:54px;height:54px">${heldIcon(k)}</div><span class="num">×${r.n}</span><span class="tiny dim">${esc(HELD[k].n)}</span></div>`; }
    if (r.k === "dmg") return `<div class="rw"><div class="ri" style="width:54px;height:54px">${IC.battles}</div><span class="num">${fmtFull(r.n)}</span><span class="tiny dim">Damage</span></div>`;
    if (r.k === "pts") return `<div class="rw"><div class="ri" style="width:54px;height:54px">${tierBadge(UI.arenaTab === "rta" && BT.cfg && /^Link/.test(BT.cfg.sub || "") ? S.rta.pts : S.ladder.pts, 46)}</div><span class="num ${r.n >= 0 ? "good" : "bad"}">${r.n >= 0 ? "+" : ""}${r.n}</span><span class="tiny dim">Rating</span></div>`;
    return `<div class="rw"><div class="ri" style="width:54px;height:54px">${r.k === "xp" ? IC.xp : r.k === "rank" ? IC.arena : itemIcon(r.k)}</div><span class="num">${r.k === "rank" ? "#" + r.n : "×" + fmt(r.n)}</span><span class="tiny dim">${esc(itemName(r.k))}</span></div>`;
  }).join("");
}
const back = (act, label, data = "") => `<button class="btn ghost sm backbtn" data-act="${act}" ${data}>${IC.back.replace("<svg", '<svg width="16" height="16"')}${label}</button>`;
// player looks: every character in the owner's resources/player sprites (the same the server's Trainers wear, DOC_SPR). You
// start as Gen 1's heroes, Red or Leaf; the others are bought in the Boutique (Shops) and worn from the Trainer Card. A look
// you don't own (an old save's) becomes Leaf (the heroines) or Red.
const AVATARS = [["red", "Red"], ["leaf", "Leaf"], ["ashkanto", "Ash (Kanto)"], ["ashhoenn", "Ash (Hoenn)"], ["ashsinnoh", "Ash (Sinnoh)"], ["ashunova", "Ash (Unova)"],
  ["brendan", "Brendan"], ["brendanoras", "Brendan (Omega Ruby)"], ["may", "May"], ["mayoras", "May (Alpha Sapphire)"], ["ethan", "Ethan"], ["kris", "Kris"], ["lyra", "Lyra"],
  ["lucas", "Lucas"], ["dawn", "Dawn"], ["nate", "Nate"], ["n", "N"], ["calem", "Calem"], ["serena", "Serena"], ["elio", "Elio"]];
const LOOK_COST = 3000;   // Gems, in the Boutique
const LEAF_LIKE = ["leaf", "lyra", "kris", "may", "mayoras", "dawn", "hilda", "rosa", "serena", "selene", "gloria"];
const ownsLook = (k, s = S) => k === "red" || k === "leaf" || !!(s && (s.looks || []).includes(k));
const lookOf = (k, s = S) => AVATARS.some(a => a[0] === k) && ownsLook(k, s) ? k : LEAF_LIKE.includes(k) ? "leaf" : "red";
const avatar = () => lookOf(S.avatar);

// ---------- shell ----------
function renderTop() {
  tickTimers();
  const mx = maxSanity(S.lvl);
  $("#topbar").innerHTML = `
    <button class="me" data-act="settings" aria-label="Trainer Card">
      <div class="me-av">${mugImg(avatar())}</div>
      <div style="min-width:0;text-align:left"><div class="me-name">${esc(S.name)} <span class="num">Lv ${S.lvl}</span></div><div class="me-xp"><i style="width:${S.lvl >= TRAINER_MAX ? 100 : S.xp / pxpNeed(S.lvl) * 100}%"></i></div></div>
    </button>
    <div class="res">
      <button class="pill" data-act="sanity" aria-label="PP">${IC.sanity}<span id="sanPill">${S.sanity}<small>/${mx}</small></span></button>
      <div class="pill">${IC.lmd}<span>${fmt(S.lmd)}</span></div>
      ${featOn("events") ? `<button class="pill" data-act="rechargeTab" aria-label="Gems: Recharge">${IC.orundum}<span>${fmt(S.orundum)}</span><b class="plus${rechargeLeft() <= 0 ? " on" : ""}">+</b></button>` : `<div class="pill">${IC.orundum}<span>${fmt(S.orundum)}</span></div>`}
    </div>`;
  const tabs = [["home", "Home", IC.home], ["story", "Journey", IC.story], ["battle", "Battle", IC.battles, "explore"], ["ops", "Pokémon", IC.ops, "party"], ["hh", "Safari", IC.pokeball, "safari"]].filter(t => !t[3] || featOn(t[3]));
  const on = { op: "ops", dex: "ops", team: UI.arg && UI.arg.from || "story", hunt: "battle", tower: "battle", arena: "battle", chapter: "story", shop: "home", depot: "home", inbox: "home", ach: "home", settings: "home", chat: "home", guild: "home", events: "home" }[UI.view] || UI.view;
  $("#tabs").innerHTML = tabs.map(([v, n, ic]) => `<button class="${on === v ? "on" : ""}" data-act="go" data-v="${v}">${ic}<span>${n}</span>${badge(v) ? '<i class="dot"></i>' : ""}</button>`).join("");
}
function badge(v) {
  if (v === "home") return (featOn("research") && dailyReady()) || (featOn("mail") && unclaimedMail().length > 0) || (featOn("chat") && chatUnread() > 0);
  if (v === "story") return !!nextNode();
  if (v === "battle") return featOn("ranked") && (S.ladder.tickets >= ticketsMax() || S.ladder.log.some(x => x.t > S.ladder.seen));
  if (v === "ops") return Object.keys(S.ops).some(canEvolveNow);
  if (v === "hh") return S.permit > 0 || S.orundum >= 600 || S.inv.free10 > 0 || S.inv.gold5 > 0;
  return false;
}
const dailyReady = () => DAILIES.some(d => !S.daily.claimed[d.id] && S.daily[d.id] >= d.goal);
function route(view, arg, keep) {
  if (view === "op" && !keep && UI.inGame && (UI.view !== "op" || UI.arg !== arg)) cry(arg);
  UI.view = view; UI.arg = arg;
  if (UI.inGame) metaTick();
  const el = $("#view"), st = el.scrollTop;
  el.innerHTML = (SCREENS[view] || SCREENS.home)(arg); el.dataset.v = view;   // which screen is drawn (the Demo checks it)
  el.scrollTop = keep ? st : 0;
  if (view === "home") homeWorldStart();
  renderTop(); save();
  if (UI.inGame && !BT.on) { music(screenMusic()); learnCheck(); }
}
const rerender = () => route(UI.view, UI.arg, true);

// ---------- home ----------
const QUIPS = {
  pikachu: ["Pika pika!", "Pikachu!", "Pi-ka-chu!"], bulbasaur: ["Bulba!", "Bulbasaur!"], charmander: ["Char!", "Charmander!"], squirtle: ["Squirtle!", "Squirt!"],
  snorlax: ["(Snorlax is fast asleep.)", "(A huge yawn.)"], magikarp: ["(Splash! Splash!)"], psyduck: ["Psy...yai...yai?", "(Psyduck holds its head.)"],
  meowth: ["Meowth!", "(It's eyeing your Poké Dollars.)"], eevee: ["Vee!", "Eevee!"], jigglypuff: ["Jiggly... puff...", "(It starts singing. You feel sleepy.)"],
  _: ["(It looks happy to see you.)", "(It wants to battle!)", "(It nuzzles you.)", "(It looks at you expectantly.)"],
};
function nextHint() {
  const nd = nextNode();
  if (!S.region && !S.starter) return { act: "introGo", text: "Choose the <b>region</b> your Journey starts in." };
  if (!S.starter) { const r = regionCard(S.region || "kanto"); return { act: "openNode", data: `data-id="${journeyMain(r.id)[0].id}"`, text: `Visit <b>${esc(r.prof[0])}'s lab</b> and choose your first Pokémon.` }; }
  if (featOn("mail") && S.inbox.some(m => m.tag === "welcome" && !m.claimed)) return { act: "inbox", text: "Your welcome gifts are in your <b>Mail</b>: a Safari Pass (×10) and a Master Ball." };
  if (featOn("safari") && (S.inv.free10 > 0 || S.inv.gold5 > 0)) return { act: "go", data: 'data-v="hh"', text: "Use your <b>Safari Pass</b> and <b>Master Ball</b> in the Safari Zone." };
  if (featOn("research") && dailyReady()) return { act: "missions", text: "Daily Research rewards are ready to claim." };
  const evo = Object.keys(S.ops).find(canEvolveNow);
  if (evo) return { act: "go", data: `data-v="op" data-a="${evo}"`, text: `<b>${esc(OPS[evo].n)}</b> is ready to evolve!` };
  const um = unclaimedMail().length;
  if (um && featOn("mail")) return { act: "inbox", text: `You have <b>${um}</b> unclaimed gift${um > 1 ? "s" : ""} in your Mail.` };
  if (nd) return { act: "openNode", data: `data-id="${nd.id}"`, text: `Continue your journey: <b>${nd.id} ${esc(nd.name)}</b>.` };
  if (nextRegions().length) return { act: "go", data: 'data-v="story"', text: "Choose your <b>next region</b> on the Journey tab: a new starter, and its Pokémon in the Safari Zone." };
  return featOn("explore") ? { act: "go", data: 'data-v="battle"', text: featOn("tower") ? "Climb the <b>Battle Tower</b> or find held items in <b>Explore</b>." : "Find evolution stones and held items in <b>Explore</b>." } : null;
}
const SCREENS = {};
SCREENS.home = () => {
  const ak = S.ops[S.assistant] ? S.assistant : Object.keys(S.ops)[0];
  const op = ak ? OPS[ak] : null, hint = nextHint(), nd = nextNode();
  const missionsReady = dailyReady(), mails = unclaimedMail().length, newAch = achDone() > (S.achSeen || 0);
  return `<div class="lobby">
    <section class="stage">
      ${HOME ? `<canvas class="hworld" aria-label="${esc(homeArea().n)}: your trainer and Pokémon"></canvas>` : `<div class="sky"></div><div class="hill"></div><div class="floor"></div>
      ${op ? `<img class="trainer px" src="${trainerURL(avatar())}" alt=""><img class="assist px" src="${sprFull(ak)}" alt="${esc(op.n)}" data-act="poke" draggable="false">` : `<img class="trainer solo px" src="${trainerURL(S.region ? profPic() : avatar())}" alt="">`}`}
      ${op ? `<button class="nameplate" data-act="homeEdit" aria-label="Partner ${esc(op.n)}: choose your area and Pokémon"><span class="eyebrow">${HOME ? esc(homeArea().n) + " · Partner" : "Partner Pokémon"}</span><b>${esc(op.n)} <span class="small">Lv ${S.ops[ak].lvl}</span></b><div class="row" style="gap:4px">${typeChips(op.types)}</div></button>`
      : S.region ? `<div class="nameplate"><span class="eyebrow">${esc(regionCard(S.region).town)}</span><b>${esc(profName())} is waiting</b></div>` : `<div class="nameplate"><span class="eyebrow">A new adventure</span><b>Choose your region</b></div>`}
      <div class="sidebtns left">
        ${featOn("mail") ? `<button class="sidebtn" data-act="inbox" aria-label="Mail">${IC.mail}<small>Mail</small>${mails ? `<i class="cnt num">${mails}</i>` : ""}</button>` : ""}
        ${featOn("medals") ? `<button class="sidebtn" data-act="go" data-v="ach" aria-label="Medals">${medalHTML(4, 1, 3, 30)}<small>Medals</small>${newAch ? '<i class="dot"></i>' : ""}</button>` : ""}
        ${featOn("dex") ? `<button class="sidebtn" data-act="go" data-v="dex" aria-label="Pokédex">${IC.dex}<small>Pokédex</small></button>` : ""}
      </div>
      <div class="sidebtns">
        ${featOn("events") ? `<button class="sidebtn" data-act="events" aria-label="Events">${IC.gift}<small>Events</small>${liveReady() ? '<i class="dot"></i>' : ""}</button>` : ""}
        ${rookieOn() ? `<button class="sidebtn" data-act="rookie" aria-label="Rookie Week">${IC.gift}<small>Rookie</small>${rookieReady() ? '<i class="dot"></i>' : ""}</button>` : ""}
        ${featOn("research") ? `<button class="sidebtn" data-act="missions" aria-label="Daily Research">${IC.missions}<small>Research</small>${missionsReady ? '<i class="dot"></i>' : ""}</button>` : ""}
        ${featOn("mart") ? `<button class="sidebtn" data-act="go" data-v="shop" aria-label="Shops">${IC.shop}<small>Shops</small></button>
        <button class="sidebtn" data-act="go" data-v="depot" aria-label="Bag">${IC.depot}<small>Bag</small></button>` : ""}
      </div>
    </section>
    ${featOn("chat") || featOn("club") ? `<div class="socrow">${featOn("chat") ? tickerHTML() : ""}${featOn("club") ? `<button class="clubbtn" data-act="go" data-v="guild" aria-label="Club">${IC.club}<span>Club</span>${S.guild && gbTriesLeft() > 0 ? '<i class="dot"></i>' : ""}</button>` : ""}</div>` : ""}
    ${hint ? `<button class="hint" data-act="${hint.act}" ${hint.data || ""}>${IC.pokeball.replace("<svg", '<svg width="22" height="22"')}<div><div class="eyebrow">Next</div><div class="small">${hint.text}</div></div></button>` : ""}
    ${badgeCase(REGION_BADGES[S.region] ? S.region : "kanto")}
    <div class="tiles">
      <button class="tile ls-t" data-act="go" data-v="story"><span class="ticon" style="color:var(--red)">${IC.story}</span><h3>Journey</h3><span class="tsub">${nd ? "Next: " + nd.id + " " + esc(nd.name) : nextRegions().length ? "Choose your next region" : "Journey complete!"}</span></button>
      ${featOn("explore") ? `<button class="tile ds-t" data-act="go" data-v="battle"><span class="ticon" style="color:var(--blue)">${IC.battles}</span><h3>Battle</h3><span class="tsub">${["Explore", featOn("tower") && "Tower", featOn("ranked") && "Stadium"].filter(Boolean).join(" · ")}</span></button>` : ""}
      ${featOn("safari") ? `<button class="tile" data-act="go" data-v="hh"><span class="ticon">${IC.safariball}</span><h3>Safari Zone</h3><span class="tsub">${S.permit} Safari Balls · ${fmt(S.orundum)} Gems</span></button>` : ""}
      ${featOn("dex") ? `<button class="tile" data-act="go" data-v="dex"><span class="ticon" style="color:var(--red)">${IC.dex}</span><h3>Pokédex</h3><span class="tsub">Seen ${dexSeen()} · Caught ${dexCaught()} / ${DEX_N}</span></button>` : ""}
    </div>
    <p class="tiny dim" style="text-align:center;padding:4px 8px">Unofficial, non-commercial fan game. Pokémon © Nintendo, Game Freak and Creatures. Sprites from Pokémon Showdown.</p>
  </div>`;
};

// ---------- journey ----------
// the FireRed/LeafGreen area previews (resources/areas): one CSS class per place, so each picture is in the page once.
// Used by the Journey's chapter cards and maps, the Explore areas and the Safari Zone.
(() => {
  const st = document.createElement("style");
  st.textContent = Object.keys(RES_DATA.area).map(a => `.ar-${a}{--bg:url(${resPng(RES_DATA.area[a])})}`).join("");
  document.head.appendChild(st);
})();
const areaBg = a => a && RES_DATA.area[a] ? " hasbg ar-" + a : "";
const chapterBg = cid => areaBg(CHAPTER_BG[cid]);
// a region's Professor, as a picture (Kanto's Oak is the FireRed/LeafGreen one; the others' are rg_ pictures)
const profURL = r => trainerURL(r.id === "kanto" ? "oak" : "rg_" + r.prof[1]);
// a region as a tile: its Professor, town, Gyms or trials, its League (act: what tapping it does; eyebrow: its state; row: pictures)
const regionTile = (r, act, eyebrow, row, soon = true) => `<button class="tile wide rgn${soon ? " soon" : ""}" data-act="${act}" data-v="${r.id}" style="--cc:${r.col}">
      <img class="chtr px" src="${profURL(r)}" alt="">
      <div class="eyebrow">${eyebrow}</div><h3>The ${r.n} Journey</h3>
      <span class="tsub">${esc(r.prof[0])}, ${esc(r.town)}${r.gyms ? ` · ${r.challenge ? esc(r.challenge) : r.gyms2 ? `two parts, ${r.gyms.length + r.gyms2.length} Gyms` : `${r.gyms.length} Gyms`}, ${r.e4Label ? "the Champion Cup" : "the Elite Four"} and ${r.champLabel ? esc(r.champLabel) : `Champion ${esc(r.champ[0])}`}` : r.id === "kanto" ? " · 8 Gyms, the Elite Four and Champion Blue" : ""}</span>
      ${row ? `<span class="soonrow">${row}</span>` : ""}</button>`;
// (a card's pictures: rg_<key> in tools/trainer_sprites.json, or a full key, un_cheren2, where a story's Leader has its own picture)
const STAGE_KEYS_UI = ["atk", "def", "spa", "sdf", "spe"];   // (a Totem's aura on its stage card)
const rgKey = k => k.includes("_") ? k : "rg_" + k;
const gymRow = r => r.gyms.map(g => `<img class="px" src="${trainerURL(rgKey(g[3]))}" alt="${esc(g[0])}" title="${esc(g[0])}: ${g[1]}">`).join("");
const starterRow = r => r.starters.map(k => `<img class="px" src="${sprFront(k)}" alt="${esc(OPS[k].n)}" title="${esc(OPS[k].n)}">`).join("");
// The Journey tab: the Journey you're on (a chip for each one you've opened, when there's more than one), the regions you've opened
// whose Journeys are coming soon, the next regions to choose (nextRegions) and the rest, coming soon
SCREENS.story = () => {
  const mine = Object.keys(myRegions()), built = STORY.map(ep => ep.id).filter(id => !mine.length ? id === "kanto" : mine.includes(id));
  if (!built.includes(UI.jr)) UI.jr = built.includes(S.region) ? S.region : built[0] || "kanto";
  const ep = journeyOf(UI.jr) || STORY[0], rid = ep.id, cb = regionCapBattle(rid), next = nextRegions(), parts = PART_NAME[rid], part = regionPart(rid);
  const opened = REGIONS_SOON.filter(r => mine.includes(r.id) && !journeyOf(r.id)), later = REGIONS_SOON.filter(r => !mine.includes(r.id) && !next.includes(r.id));
  return `<div class="stack">
    ${built.length > 1 ? `<div class="areachips">${built.map(id => `<button class="chip ${id === rid ? "on" : ""}" style="--ac:${regionCard(id).col}" data-act="jrTab" data-v="${id}">${REGION_NAME[id]}</button>`).join("")}</div>` : ""}
    <section class="panel ep-card">
      <div class="eyebrow">${esc(ep.sub)}</div><h1 style="margin-top:4px;font-size:28px">${esc(ep.title)}</h1>
      <p class="small dim" style="margin-top:6px;max-width:42ch">${esc(ep.blurb)}</p>
      ${REGION_BADGES[rid] ? badgeCase(rid, "sm") : ""}
      ${parts ? `<p class="tiny dim" style="margin-top:6px">Two parts, each with its own Gym Badges and level caps: Part 1, ${esc(parts[0])}'s story, then Part 2, ${esc(parts[1])}'s. You're on <b>Part ${part}</b>.</p>` : ""}
      <p class="tiny dim" style="margin-top:6px">Level cap for ${REGION_NAME[rid]}'s Pokémon${parts ? ` in Part ${part}` : ""}: <b>Lv ${regionCap(rid)}</b>${journeyDone(rid) ? " (the Journey is complete)" : cb ? (cb.lv < regionCap(rid) ? ` · the starting cap (${esc(capWho(cb))}'s strongest Pokémon is Lv ${cb.ace}, ${cb.nd.id} ${esc(cb.nd.name)})` : ` · 2 below ${esc(capWho(cb))}'s strongest Pokémon (Lv ${cb.ace}, ${cb.nd.id} ${esc(cb.nd.name)})`) : ""}</p>
      <p class="tiny dim">Only ${REGION_NAME[rid]}'s Pokémon battle in this Journey${rid === "kanto" ? " (the 151 from Gen 1; the Alolan and Galarian forms are their own regions')" : ""}; everywhere else, any Pokémon you own.</p>
    </section>
    ${ep.chapters.map((ch, i) => {
      const open = nodeOpen(ch.nodes[0]), done = chapterCleared(ch);
      const head = parts && (!i || (ep.chapters[i - 1].part || 1) !== (ch.part || 1)) ? `<div class="eyebrow">Part ${ch.part || 1} · ${esc(parts[(ch.part || 1) - 1])}</div>` : "";
      const battles = ch.nodes.filter(n => n.waves || n.rivalWaves), stars = battles.reduce((a, n) => a + nodeStars(n.id), 0);
      const boss = ch.nodes.find(n => n.badgeWin != null || n.champion || n.catch === "mewtwo");
      return `${head}<button class="tile wide chap${chapterBg(ch.id)}" data-act="chapter" data-c="${ch.id}" ${open ? "" : "disabled"} style="--cc:${mapTheme(ch.map).a}">
        ${boss && boss.trainer ? `<img class="chtr px" src="${trainerURL(boss.trainer.spr)}" alt="">` : boss ? `<img class="chtr px" src="${sprFront(boss.catch)}" alt="">` : ""}
        <div class="eyebrow">Chapter ${ch.no}${done ? " · Cleared" : ""}</div><h3>${esc(ch.title)}</h3>
        <span class="tsub">${open ? `${stars}/${battles.length * 3} stars${boss && boss.badgeWin != null ? " · " + regionBadges(rid, ch.part || 1)[boss.badgeWin].n : ""}` : "Clear the previous chapter to unlock"}</span></button>`;
    }).join("")}
    ${opened.length ? `<div class="eyebrow">Your other regions · Journeys coming soon</div>
    ${opened.map(r => regionTile(r, "regionSoon", `${r.n} · Open · Journey coming soon`, starterRow(r))).join("")}` : ""}
    ${next.length ? `<div class="eyebrow">Choose your next region</div>
    <p class="tiny dim" style="margin-top:-4px">Its Professor gives you one of its three starters at Lv 5, and its Pokémon start turning up in the Safari Zone. One region at a time: once all nine Journeys are done, the Safari Zone's other areas open too.</p>
    ${next.map(id => regionTile(regionCard(id), "regionStart", `${REGION_NAME[id]} · Gen ${regionGen(id)}${journeyOf(id) ? "" : " · Journey coming soon"}`, starterRow(regionCard(id)), false)).join("")}` : ""}
    ${later.length ? `<div class="eyebrow">Still to come · one region at a time</div>
    ${later.map(r => regionTile(r, "regionSoon", `${r.n} · Gen ${regionGen(r.id)}${journeyOf(r.id) ? S.region && myRegions()[S.region] && regionDoneAt(S.region) == null ? ` · after ${REGION_NAME[S.region]}` : "" : " · Coming soon"}`, gymRow(r), !journeyOf(r.id))).join("")}` : ""}
  </div>`;
};
// a Gym's Badge picture, from the owner's sheet (tools/pack_badges.py): by its name (Kalos's, Unova's), or by region and type where the
// names repeat (Galar's and Paldea's Grass Badges; a Galar Gym whose Leader differs by version shows Sword's)
const soonBadge = (rid, g) => { const B = RES_DATA.badge || {}, nm = String(g[2] || "").replace(/ Badge$/, "").toLowerCase();
  return rid === "galar" || rid === "paldea" ? B[rid + "_" + String(g[1]).toLowerCase()] : B[nm] || null; };
// a region that's coming soon: its Gyms, Elite Four, Champion and places to Explore
function regionSoonModal(id) {
  const r = REGIONS_SOON.find(x => x.id === id); if (!r) return;
  const n = OP_KEYS.filter(k => OPS[k].gen === REGIONS.indexOf(r.n) + 1 && !OPS[k].form).length, open = !!myRegions()[id];
  const pic = (k, t) => `<img class="px" src="${trainerURL(rgKey(k))}" alt="" title="${esc(t)}">`;
  const ep = journeyOf(id), soon = ep ? "" : `The region's Journey and ${r.gymLabel ? r.gymLabel.toLowerCase() : "Gyms"} are on the way.`;
  openModal(`<div class="stack"><div class="eyebrow">${r.n} · ${ep ? (open ? "Open" : "Journey") : open ? "Open · Journey coming soon" : "Coming soon"}</div><h2>The ${r.n} Journey</h2>
    <p class="small">${esc(r.prof[0])} is waiting in ${esc(r.town)} with ${r.starters.map(k => OPS[k].n).join(", ").replace(/, ([^,]*)$/, " and $1")}.${ep ? ` Its Journey has ${ep.chapters.length} chapters and ${journeyMain(id).length} stages, from ${esc(r.town)} to the Pokémon League.` : ""} ${soon}
      ${open ? `You've opened ${r.n}: its ${n} Pokémon turn up in the Safari Zone, and you can battle with them everywhere${ep ? "; its Journey takes them alone" : " but other regions' Journeys"}.` : nextRegions().includes(id) ? `Choose it as your next region and its ${n} Pokémon come to the Safari Zone.` : !S.region && ep ? `Start your adventure here, or in another region.` : ep ? `Its ${n} Pokémon come once you choose it as your next region, after finishing the Journey you're on.` : `It stays locked until its Journey is here: then you can choose it as your next region, and its ${n} Pokémon come to the Safari Zone.`}</p>
    <div class="row" style="gap:4px">${r.starters.map(k => `<img class="px" src="${sprFront(k)}" alt="" style="width:56px;height:56px">`).join("")}</div>
    <div class="eyebrow">${r.gymLabel || "Gyms"}</div>
    ${[r.gyms, r.gyms2].filter(Boolean).map((G, j) => `${r.gyms2 ? `<div class="tiny dim">Part ${j + 1}${PART_NAME[id] ? `, ${esc(PART_NAME[id][j])}` : ""}</div>` : ""}<div class="soongyms">${G.map((g, i) => `<div>${pic(g[3], g[0])}<span><b>${i + 1}. ${esc(g[0])}</b>${typeChip(g[1])}<span class="tiny dim">${soonBadge(id, g) ? `<img class="px" src="${resPng(soonBadge(id, g))}" alt="" style="width:16px;height:16px;vertical-align:middle;margin-right:3px">` : ""}${esc(g[2])}</span></span></div>`).join("")}</div>`).join("")}
    <div class="eyebrow">${r.e4Label || r.leagueLabel || "Elite Four and Champion"}</div>
    <div class="soonrow big">${[...r.e4, r.champ].map(([nm, k]) => `<span>${pic(k, nm)}<span class="tiny">${esc(nm)}</span></span>`).join("")}</div>
    <div class="eyebrow">Places</div>
    <p class="small">${r.areas.map(esc).join(" · ")}</p>
    ${nextRegions().includes(id) ? `<button class="btn wide" data-act="regionStart" data-v="${id}">Choose ${r.n}</button>` : ""}
    ${!S.region ? `<button class="btn wide" data-act="introGo">Back to the regions</button>` : `<button class="btn wide ${nextRegions().includes(id) ? "ghost" : ""}" data-act="closeModal">${nextRegions().includes(id) ? "Not now" : "OK"}</button>`}</div>`);
}
// a new game: the region to start in (one with a Journey; the others are coming soon)
function regionPickModal() {
  const all = [REGION_KANTO, ...REGIONS_SOON];
  openModal(`<div class="stack"><div class="eyebrow">A new adventure</div><h2>Choose your region</h2>
    <p class="small dim">Your first Journey: its Professor gives you your first Pokémon, and its Pokémon are the ones you'll catch. Once its Journey is done you choose the next region, one at a time. Everyone in this world starts today too.</p>
    ${all.map(r => journeyOf(r.id) ? regionTile(r, "pickRegion", `${r.n} · Gen ${regionGen(r.id)}`, starterRow(r), false) : regionTile(r, "regionSoon", `${r.n} · Journey coming soon`, starterRow(r))).join("")}
  </div>`);
}
// the next region's Professor and starters
function regionStartModal(id) {
  const r = regionCard(id);
  openModal(`<div class="stack" style="text-align:center;align-items:center">
    <img class="px" src="${profURL(r)}" alt="" style="width:88px;height:88px;object-fit:contain">
    <div class="eyebrow">${esc(r.prof[0])} · ${esc(r.town)}</div><h2>Welcome to ${r.n}!</h2>
    <p class="small dim">Choose your partner for ${r.n}: it joins you at Lv 5. ${r.n}'s Pokémon start turning up in the Safari Zone${journeyOf(id) ? ", and its Journey takes them alone" : `; its Journey is coming soon`}.</p>
    <div class="starters">${r.starters.map(k => `<button class="starter" data-act="pickRegionStarter" data-v="${id}" data-k="${k}" style="--tc:${TC[OPS[k].types[0]]}"><img class="px" src="${sprFull(k)}" alt=""><b>${OPS[k].n}</b><span class="row" style="gap:3px;justify-content:center">${typeChips(OPS[k].types)}</span></button>`).join("")}</div>
    <button class="btn ghost wide" data-act="closeModal">Not yet</button>
  </div>`);
}
// a Journey's Part 2 starter (its first stage: readStory), one of the region's three at Lv 5, from the part's own giver (nd.giver:
// [name, picture]; Bianca, for Professor Juniper, in Unova)
function partStarterModal(nd) {
  const id = nd.ep.id, r = regionCard(id), g = nd.giver || [r.prof[0], rgKey(r.prof[1])];
  openModal(`<div class="stack" style="text-align:center;align-items:center">
    <img class="px" src="${trainerURL(g[1])}" alt="" style="width:88px;height:88px;object-fit:contain">
    <div class="eyebrow">${esc(g[0])} · Part ${ndPart(nd)}</div><h2>Choose your partner</h2>
    <p class="small dim">Part ${ndPart(nd)} of the ${r.n} Journey${PART_NAME[id] ? `, ${esc(PART_NAME[id][ndPart(nd) - 1])}'s story,` : ""} starts with a new partner. It joins you at Lv 5.</p>
    <div class="starters">${r.starters.map(k => `<button class="starter" data-act="pickPartStarter" data-v="${id}" data-k="${k}" style="--tc:${TC[OPS[k].types[0]]}"><img class="px" src="${sprFull(k)}" alt=""><b>${OPS[k].n}</b><span class="row" style="gap:3px;justify-content:center">${typeChips(OPS[k].types)}</span></button>`).join("")}</div>
  </div>`);
  m0Click();
}
// a region just opened: its starter, anything that waited for it
function regionOpenModal(id, k, list) {
  openModal(`<div class="stack" style="align-items:center;text-align:center"><div class="eyebrow">${esc(regionCard(id).prof[0])}</div><h2>${REGION_NAME[id]} is open!</h2>
    <div class="rewards">${rewardsHTML(list)}</div>
    <p class="small dim">${esc(OPS[k].n)} joins you at Lv 5, and ${REGION_NAME[id]}'s Pokémon now turn up in the Safari Zone.${journeyOf(id) ? "" : ` The ${REGION_NAME[id]} Journey is coming soon.`}${nextRegions().length ? " You can choose another region whenever you like." : specialSafari() ? " Every region is open: the Safari Zone's weekly areas and event areas are open too!" : ""}</p>
    <button class="btn wide" data-act="closeModal">OK</button></div>`);
}
function mapTheme(m) {
  return { route: { a: "#7ac25a", b: "#2f6a2a", c: "#fff" }, forest: { a: "#3f8a4a", b: "#173a1e", c: "#d8f2a8" }, cave: { a: "#8a7a6a", b: "#2a221c", c: "#f2d8a8" },
    city: { a: "#7aa8e0", b: "#2a4a7a", c: "#fff" }, sea: { a: "#4a9ae0", b: "#1a4a8a", c: "#e8f6ff" }, tower: { a: "#8a5ab8", b: "#2a1a4a", c: "#e8d8ff" },
    plateau: { a: "#c8a03a", b: "#3a2a5a", c: "#fff2c8" }, volcano: { a: "#e0703a", b: "#5a1a0a", c: "#ffe0b0" }, ice: { a: "#8ac8f2", b: "#2a5a8a", c: "#fff" } }[m] || { a: "#7ac25a", b: "#2f6a2a", c: "#fff" };
}
SCREENS.chapter = cid => {
  const ch = chapterById(cid), th = mapTheme(ch.map);
  const XS = [50, 24, 70, 32, 74, 28, 60];
  let mainI = 0, cy = 80;
  const pos = [];
  ch.nodes.forEach((nd, i) => {
    if (nd.type !== "side") { pos[i] = { x: XS[mainI % XS.length], y: cy }; mainI++; cy += 112; return; }
    const pr = pos[i - 1] || { x: 50, y: 80 };
    // (a side stage beside the stage before it; a run of them zigzags in two columns by the edge and pushes the next stage down)
    const x = pr.side ? (pr.x < 50 ? (pr.x <= 11 ? 27 : 11) : (pr.x >= 89 ? 73 : 89)) : pr.x < 50 ? Math.max(11, pr.x - 18) : Math.min(89, pr.x + 18);
    pos[i] = { x, y: pr.y + (pr.side ? 66 : 50), side: true }; cy = Math.max(cy, pos[i].y + 62);   // (a run's next side stage a little lower: its label clears the one before)
  });
  const H = Math.max(80 + mainI * 112 + 40, ...pos.map(q => q.y + 60)), rng = seeded(hash(cid + "map"));   // (a long run of side stages reaches further down)
  const main = ch.nodes.map((n, i) => [n, pos[i]]).filter(([n]) => n.type !== "side");
  let d = "";
  main.forEach(([, p], i) => { const x = p.x * 4, y = p.y; if (!i) d = `M${x} ${y}`; else { const q = main[i - 1][1]; d += ` C${q.x * 4} ${(q.y + y) / 2} ${x} ${(q.y + y) / 2} ${x} ${y}`; } });
  let deco = "";
  for (let k = 0; k < 26; k++) {
    const x = rng() * 400, y = rng() * H, r = 6 + rng() * 22;
    deco += ["route", "forest"].includes(ch.map) ? `<path d="M${x} ${y} l${r * .5} ${-r} l${r * .5} ${r}z" fill="#ffffff" opacity="${.06 + rng() * .08}"/>`
      : ch.map === "sea" || ch.map === "ice" ? `<path d="M${x} ${y} q${r / 2} ${-r / 3} ${r} 0 t${r} 0" stroke="#fff" fill="none" opacity="${.12 + rng() * .1}"/>`
      : `<circle cx="${x}" cy="${y}" r="${r / 2}" fill="${th.c}" opacity="${.05 + rng() * .06}"/>`;
  }
  const sideLines = ch.nodes.map((n, i) => n.type === "side" && i ? `<path d="M${pos[i - 1].x * 4} ${pos[i - 1].y} L${pos[i].x * 4} ${pos[i].y}" stroke="${th.c}" stroke-width="2" stroke-dasharray="4 6" opacity=".6" fill="none"/>` : "").join("");
  const icon = nd => nd.trainer && (nd.type === "boss" || nd.badgeWin != null) ? `<img class="px" src="${trainerURL(nd.trainer.spr)}" alt="">` : nd.catch && (nd.type === "side" || nd.type === "boss") ? `<img class="px" src="${sprFront(nd.catch)}" alt="">`
    : nd.type === "story" ? IC.book : nd.type === "chest" || nd.chest ? IC.chest : nd.wild ? IC.pokeball : IC.battles;
  const nx = nextNode();
  return `<div class="stack">
    <div class="spread">${back("go", "Journey", 'data-v="story"')}<span class="eyebrow">Chapter ${ch.no}</span></div>
    <h2>${esc(ch.title)}</h2>
    <div class="mapwrap" style="background:linear-gradient(180deg,${th.a},${th.b})">${chapterBg(cid) ? `<div class="mapbg${chapterBg(cid)}"></div>` : ""}
      <svg class="map" viewBox="0 0 400 ${H}" preserveAspectRatio="none" style="height:${H}px">${deco}
        <path d="${d}" stroke="#000" stroke-width="12" fill="none" opacity=".25"/><path d="${d}" stroke="#f4ecd0" stroke-width="7" fill="none" opacity=".9"/><path d="${d}" stroke="#c8b888" stroke-width="2" stroke-dasharray="6 8" fill="none"/>${sideLines}</svg>
      ${ch.nodes.map((nd, i) => {
        const open = nodeOpen(nd), st = nodeStars(nd.id), done = st > 0;
        return `<button class="mnode ${nd.type} ${open ? "" : "locked"} ${done ? "done" : ""} ${nx === nd ? "next" : ""}" style="left:${pos[i].x}%;top:${pos[i].y}px" data-act="openNode" data-id="${nd.id}" aria-label="${nd.id} ${esc(nd.name)}">
          <span class="disc">${open ? icon(nd) : IC.lock}</span><span class="lbl">${nd.id}${nd.type === "side" ? " · Side" : ""}</span>
          ${nd.waves || nd.rivalWaves ? `<span class="nst">${[1, 2, 3].map(k => k <= st ? IC.star : IC.starOff).join("")}</span>` : ""}</button>`;
      }).join("")}
    </div>
    <p class="tiny dim">Chapter reward: ${rewardText(ch.reward)}.</p>
  </div>`;
};
const rewardText = rw => Object.entries(rw).map(([k, n]) => k === "op" ? OPS[n].n + " joins your team" : k === "held" ? [].concat(n).map(h => an(HELD[h].n)).join(", ") : `${fmt(n)} ${itemName(k)}`).join(", ");
function nodeSheet(nd) {
  const st = nodeStars(nd.id), cost = nodeCost(nd);
  const waves = nd.waves || nd.rivalWaves ? (S.starter || !nd.rivalWaves ? nodeWaves(nd) : null) : null;
  const goal = nodeTurnGoal(nd);
  openModal(`<div class="stack">
    <div class="spread"><div><div class="eyebrow">${nd.id} · ${{ story: "Story", battle: nd.wild ? "Wild Pokémon" : "Trainer Battle", side: "Side Stage", chest: "Event", boss: nd.wild ? "Boss Pokémon" : "Gym & League" }[nd.type]}</div><h2 style="margin-top:4px">${esc(nd.name)}</h2></div>
      ${nd.waves || nd.rivalWaves ? `<div class="nstars">${[1, 2, 3].map(k => k <= st ? IC.star : IC.starOff).join("")}</div>` : ""}</div>
    ${nd.trainer ? `<div class="row" style="gap:10px"><img class="px" src="${trainerURL(nd.trainer.spr)}" alt="" style="width:64px;height:64px;object-fit:contain"><div class="small"><b>${esc(nd.trainer.name)}</b>${nd.trainer.intro ? `<div class="dim">“${esc(nd.trainer.intro)}”</div>` : ""}</div></div>` : ""}
    ${nd.weather ? `<div class="hint small" style="cursor:default">${WEATHER[nd.weather].ic} <span><b>${WEATHER[nd.weather].n}.</b> ${{ sun: "Fire moves +50%, Water moves −50%.", rain: "Water moves +50%, Fire moves −50%.", sand: "Pokémon that aren't Rock or Ground types lose 1/16 HP every turn.", hail: "Pokémon that aren't Ice types lose 1/16 HP every turn, and Ice types' Defense is ×1.5." }[nd.weather]}</span></div>` : ""}
    ${waves ? waves.map((w, k) => `<div><div class="tiny dim" style="margin-bottom:4px">${waves.length > 1 ? `${nd.wild ? "Wave" : "Round"} ${k + 1} of ${waves.length}` : nd.wild ? "Wild Pokémon" : "Opponent's team"}</div><div class="row wrap">${w.map(s => enHTML(s, s.boss ? 56 : 46)).join("")}</div></div>`).join("") : ""}
    ${waves ? `<div class="small dim">Types: ${[...new Set(waves.flat().flatMap(s => OPS[s.op].types))].map(typeChip).join(" ")}</div>` : ""}
    ${waves ? waves.flat().filter(s => s.held && HELD[s.held]).map(s => `<div class="hint small" style="cursor:default"><span class="ri" style="width:22px;height:22px">${heldIcon(s.held)}</span><span>${esc(OPS[s.op].n)} holds ${/^[AEIOU]/.test(HELD[s.held].n) ? "an" : "a"} <b>${esc(HELD[s.held].n)}</b>: ${esc(HELD[s.held].d)}</span></div>`).join("") : ""}
    ${waves ? waves.flat().filter(s => s.aura).map(s => { const up = STAGE_KEYS_UI.filter(k => s.aura[k]); return `<div class="hint small" style="cursor:default">${IC.star.replace("<svg", '<svg width="18" height="18"')}<span>${esc(OPS[s.op].n)}'s ${s.auraN ? esc(s.auraN) + " aura" : "aura"}: <b>${up.map(k => STAGE_N[k]).join(", ").replace(/, ([^,]*)$/, " and $1")} +${s.aura[up[0]]}</b> from its first turn, as stat stages on its badge, for as long as it stays in.</span></div>`; }).join("") : ""}
    ${nd.catch && !S.dex.caught[nd.catch] ? `<div class="hint small" style="cursor:default">${IC.pokeball.replace("<svg", '<svg width="20" height="20"')}<span>First clear: catch <b>${esc(OPS[nd.catch].n)}</b>!</span></div>` : ""}
    ${nd.gift && !st ? `<div class="hint small" style="cursor:default">${IC.gift.replace("<svg", '<svg width="20" height="20"')}<span>First clear: receive <b>${esc(OPS[nd.gift].n)}</b>.</span></div>` : ""}
    ${nd.badgeWin != null && partBadges(nd.ep.id, ndPart(nd)) <= nd.badgeWin ? `<div class="hint small" style="cursor:default">${badgeSVG(nd.badgeWin, true, regionBadges(nd.ep.id, ndPart(nd))).replace("<svg", '<svg width="22" height="22"')}<span>Win to earn the <b>${regionBadges(nd.ep.id, ndPart(nd))[nd.badgeWin].n}</b>${nd.ep.id === "kanto" ? `: +5% ${BADGES[nd.badgeWin].sn} for your Pokémon` : " (your most Badges in one region raise your Pokémon's stats)"}.</span></div>` : ""}
    ${isCapBattle(nd) && !st && !journeyDone(nd.ep.id) ? `<div class="hint small" style="cursor:default">${IC.star.replace("<svg", '<svg width="18" height="18"')}<span>Its strongest Pokémon is <b>Lv ${aceLevel(nd)}</b>${capBattle() && capBattle().nd === nd ? `, so your level cap is <b>Lv ${levelCap()}</b>` : ""}. Winning raises the cap to <b>Lv ${capAfter(nd)}</b>.</span></div>` : ""}
    ${waves ? `<div class="stack" style="gap:4px"><div class="tiny dim">Star goals</div>
      ${["Win the battle", "None of your Pokémon faint", `Win within ${goal} of your turns`].map((m, k) => `<div class="mission">${k < st ? IC.star : IC.starOff}<span>${m}</span></div>`).join("")}</div>
      <div><div class="tiny dim" style="margin-bottom:4px">${st ? "Rewards" : "First clear"}${st < 3 ? " · first 3-star clear adds a Max Elixir" : ""}</div><div class="rewards" style="justify-content:flex-start">${rewardsHTML([...Object.entries(nodeDrops(nd, !st)).map(([k, n]) => ({ k, n })), ...(!st && nd.reward && nd.type !== "chest" && !nd.chest ? rwList(nd.reward) : [])])}</div></div>` : ""}
    ${nd.type === "chest" || nd.chest ? `<div class="rewards" style="justify-content:flex-start">${rewardsHTML(rwList(nd.reward))}</div>` : nd.type === "story" && nd.reward && !st ? `<div class="tiny dim">You'll receive</div><div class="rewards" style="justify-content:flex-start">${rewardsHTML(rwList(nd.reward))}</div>` : ""}
    <div class="row">
      ${waves && st >= 3 ? `<button class="btn ghost" data-act="sweep" data-id="${nd.id}" data-x="1">Quick Battle</button><button class="btn ghost" data-act="sweep" data-id="${nd.id}" data-x="3">×3</button>` : ""}
      <button class="btn" style="flex:1" data-act="startNode" data-id="${nd.id}" ${(nd.type === "chest" || nd.chest) && st ? "disabled" : ""}>${nd.type === "story" ? (st ? "Replay" : "Start") : nd.type === "chest" || nd.chest ? (st ? "Done" : "Go") : `Battle! <span class="cost">${IC.sanity}${cost}</span>`}</button>
    </div>
    ${waves && st < 3 ? '<p class="tiny dim">Get 3 stars to unlock Quick Battle.</p>' : ""}
  </div>`);
}

// ---------- team select ----------
// Six places: the top row are your leads (sent out first), the bottom row waits on the bench. Tap a Pokémon in the roster to
// add or remove it; tap one in a place to pick it up, then another place to swap them (tap it again to take it off the team).
// Or drag: a Pokémon onto another place swaps them, one from the list onto a place puts it there, one dragged back to the list
// leaves the team (teamDrag below).
SCREENS.team = arg => {
  const key = arg.mode;
  // (a Journey stage: its own region's Pokémon only, journeyOk; a Battle Tower floor its wing's, towerOk)
  const jnd = arg.launch && arg.launch.kind === "node" ? NODES[arg.launch.id] : null, tw = arg.launch && arg.launch.kind === "tower" ? arg.launch.w || "kanto" : null;
  const fits = k => (!jnd || journeyOk(k, jnd)) && (!tw || towerOk(k, tw));
  if (!UI.team || UI.team.key !== key) UI.team = { key, ids: (S.team[key] || []).filter(owned).filter(fits).slice(0, ROSTER), sel: null };
  const ids = UI.team.ids;
  const pool = Object.keys(S.ops).filter(fits).filter(k => UI.el === "all" || OPS[k].types.includes(UI.el)).sort((a, b) => power(b, S.ops[b]) - power(a, S.ops[a]));
  const myPw = ids.reduce((a, k) => a + power(k, S.ops[k]), 0);
  const foeTypes = [...new Set((arg.foes || []).flatMap(s => OPS[s.op].types))];
  const strong = TYPES.filter(t => (arg.foes || []).some(s => typeEff(t, OPS[s.op].types) > 1));
  return `<div class="stack">
    <div class="spread">${back("teamBack", "Back")}<div class="eyebrow">${esc(arg.title || "")}</div></div>
    <h2>Choose your team</h2>
    ${foeTypes.length ? `<div class="small">Opponents: ${foeTypes.map(typeChip).join(" ")}</div><div class="small"><span class="dim">Super effective:</span> ${strong.map(typeChip).join(" ") || "—"}</div>` : ""}
    <div class="squad six">${[0, 1, 2, 3, 4, 5].map(k => {
      const id = ids[k], lab = k === 0 ? '<div class="sqlab">Leads · sent out first</div>' : k === ACTIVE ? '<div class="sqlab">Bench</div>' : "";
      return `${lab}<div class="slot ${k < ACTIVE ? "lead" : ""} ${UI.team.sel === k ? "picked" : ""}">${id ? `<button data-act="slot" data-k="${k}" aria-label="${esc(OPS[id].n)}">${opHTML(id, { s: 58 })}</button>` : `<button class="empty" data-act="slot" data-k="${k}" aria-label="Empty place"></button>`}</div>`;
    }).join("")}</div>
    <p class="tiny dim" style="margin-top:-6px">${UI.team.sel != null ? `Tap another place to swap ${esc(OPS[ids[UI.team.sel]].n)} · tap it again to take it off the team` : "Three on the field at a time: when one faints, you choose who comes in. Drag a Pokémon to another place (or tap it, then tap the place)."}</p>
    ${jnd ? `<p class="tiny dim" style="margin:0">The ${REGION_NAME[jnd.ep.id]} Journey: ${REGION_NAME[jnd.ep.id]}'s Pokémon only${stageCap(jnd) < 100 ? `, battling at Lv ${stageCap(jnd)} at most` : ""}.</p>` : ""}
    <div class="spread small"><span>Team CP <b class="num">${fmtFull(myPw)}</b> · Lv cap ${levelCap()}</span>${arg.cost ? `<span class="cost">${IC.sanity}${arg.cost}</span>` : ""}</div>
    ${(() => { const c = clauseClash(ids.map(k => S.ops[k].held)); return c ? `<p class="small" style="color:var(--bad,#d33);margin:0">Item Clause: only one ${esc(HELD[c].n)} per team (${esc(ids.filter(k => S.ops[k].held === c).map(k => OPS[k].n).join(" and "))} both hold one).</p>` : ""; })()}
    <button class="btn wide" data-act="deploy" ${ids.length && !clauseClash(ids.map(k => S.ops[k].held)) ? "" : "disabled"}>${arg.launch && arg.launch.kind === "defense" ? "Register this team" : "Battle!"}</button>
    ${arg.launch && arg.launch.kind === "defense" ? `<p class="tiny dim">Other Trainers battle your Registered Team while you're away. It's played by the AI, with your Badge bonuses.</p>` : ""}
    <div class="filters tyfs">${["all", ...TYPES].map(e => `<button class="chip ${e === "all" ? "" : "tyf"} ${UI.el === e ? "on" : ""}" data-act="elf" data-e="${e}" ${e !== "all" ? `style="--tc:${TC[e]}" aria-label="${e}"` : ""}>${e === "all" ? "All types" : typeIcon(e)}</button>`).join("")}</div>
    <div class="roster">${pool.map(k => {
      const se = (arg.foes || []).some(s => skillsOf(k, S.ops[k]).some(sk => sk.cat !== "X" && typeEff(sk.type, OPS[s.op].types) > 1));
      return `<button class="rcell ${ids.includes(k) ? "sel" : ""} ${se ? "adv" : ""}" data-act="pickTeam" data-k="${k}">${opHTML(k)}${pnameHTML(k)}<div class="pw">CP ${fmt(power(k, S.ops[k]))}</div></button>`;
    }).join("")}</div>
    <p class="tiny dim">A glowing frame means that Pokémon has a move that is super effective against this opponent.</p>
  </div>`;
};

// dragging on the team screen: places swap; the list below fills a place; a team member dragged to the list leaves the team.
// Places drag at once; list cells after a short hold, so the list still scrolls.
const TDRAG = { from: null };
function teamDrop(from, j) {   // j: a place, or -1 for the list
  const ids = UI.team.ids, i = from.i != null ? from.i : ids.indexOf(from.key);
  UI.team.sel = null;
  if (j < 0) { if (i >= 0) ids.splice(i, 1); return; }
  if (i >= 0) { if (i === j) return; if (j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]]; else ids.push(ids.splice(i, 1)[0]); return; }
  if (j < ids.length) ids[j] = from.key;
  else if (ids.length < ROSTER) ids.push(from.key);
  else toast("Your team is full. Drop it on a Pokémon to swap them.");
}
function dragEnd(drop) {
  const D = TDRAG; clearTimeout(D.hold); clearInterval(D.scroll);
  if (D.ghost) D.ghost.remove();
  for (const el of $$(".dropto, .dragfrom")) el.classList.remove("dropto", "dragfrom");
  if (drop && D.on && UI.view === "team") {
    const tgt = D.over;
    if (tgt != null) { teamDrop(D.from, tgt); sfx("tap"); rerender(); }
    HOLD.swallow = Date.now();   // the click that ends the drag isn't a tap
  }
  TDRAG.from = null; TDRAG.on = false; TDRAG.ghost = null; TDRAG.over = null;
}
document.addEventListener("pointerdown", e => {
  if (!S || UI.view !== "team" || !UI.team || e.button > 0 || !e.target.closest) return;
  const slot = e.target.closest(".squad .slot button[data-k]"), cell = !slot && e.target.closest(".roster .rcell[data-k]");
  const from = slot ? (UI.team.ids[+slot.dataset.k] ? { i: +slot.dataset.k } : null) : cell ? { key: cell.dataset.k } : null;
  if (!from) return;
  Object.assign(TDRAG, { from, src: slot || cell, x: e.clientX, y: e.clientY, on: false, ready: !!slot, over: null });
  clearTimeout(TDRAG.hold); if (cell) TDRAG.hold = setTimeout(() => { TDRAG.ready = true; }, 260);
});
// what's under the finger: a place, or the list (to leave the team)
function dragOver(x, y) {
  const D = TDRAG, scr = $("#screen") || document.body, sr = scr.getBoundingClientRect(), k = sr.width / (scr.offsetWidth || sr.width);
  D.ghost.style.left = (x - sr.left) / k + "px"; D.ghost.style.top = (y - sr.top) / k + "px";
  const under = document.elementFromPoint(x, y), place = under && under.closest(".squad .slot");
  const btn = place && place.querySelector("button[data-k]"), list = !place && under && under.closest(".roster");
  for (const el of $$(".dropto")) el.classList.remove("dropto");
  D.over = btn ? +btn.dataset.k : list && D.from.i != null ? -1 : null;
  if (place && btn) place.classList.add("dropto"); else if (list && D.from.i != null) list.classList.add("dropto");
}
document.addEventListener("pointermove", e => {
  const D = TDRAG; if (!D.from) return;
  const far = Math.hypot(e.clientX - D.x, e.clientY - D.y) > 8;
  if (!D.on) {
    if (!far) return;
    if (!D.ready) { dragEnd(false); return; }   // moving a list cell before the hold: that's scrolling
    const pt = D.src.querySelector(".pt"); if (!pt) { dragEnd(false); return; }
    D.on = true; D.src.classList.add("dragfrom");
    D.ghost = pt.cloneNode(true); D.ghost.classList.add("dragghost"); ($("#screen") || document.body).appendChild(D.ghost);
    // near the top or bottom of the screen, it scrolls (the team and the list don't always fit at once)
    D.scroll = setInterval(() => {
      const v = $("#view"); if (!v || !D.on) return;
      const r = v.getBoundingClientRect(), dy = D.py < r.top + 56 ? -12 : D.py > r.bottom - 56 ? 12 : 0;
      if (dy) { v.scrollTop += dy; dragOver(D.px, D.py); }
    }, 30);
  }
  D.px = e.clientX; D.py = e.clientY;
  dragOver(e.clientX, e.clientY);
});
document.addEventListener("pointerup", () => { if (TDRAG.from) dragEnd(true); });
document.addEventListener("pointercancel", () => { if (TDRAG.from) dragEnd(false); });
// a held list cell mustn't scroll the page while it's dragged
document.addEventListener("touchmove", e => { if (TDRAG.from && (TDRAG.on || TDRAG.ready)) e.preventDefault(); }, { passive: false });

// ---------- dialogue ----------
// The cutscenes' backgrounds: the owner's painted backgrounds (resources/scenes, tools/pack_scenes.py), by place and by your clock
// (dawn 5-7, day, sunset 17-19, night 19-5, where a painting comes in that light). A place none of them fits (labs, Gyms,
// buildings, the Pokémon Tower, the Elite Four) keeps the drawn one (sceneSVG).
const SCENE_STAGE = [[/Rival in the Lab|Oak's Parcel|Fossil Lab|Celadon Mansion|Lapras on 7F|Silph|Game Corner|Hideout|Pokémon Mansion|Prepare for Trouble|Pokémon Tower|Power Plant|Elite Four|Champion/, null],
  [/A World of Pokémon|Route 22|Safari Zone/, "plains"], [/Into Mt\. Moon/, "mountain"], [/Clefairy|Rock Tunnel|Cerulean Cave|Unknown Dungeon|Mewtwo/, "cavenight"],
  [/Nugget Bridge/, "lake"], [/Pokémaniac's Cottage/, "beach"], [/S\.S\. Anne/, "pier"], [/Snorlax/, "woodland"], [/Cycling Road/, "path2"], [/Seafoam Caves/, "cave2"],
  [/Seafoam/, "ocean"], [/Victory Road/, "cliff"], [/Moltres/, "mountainb"]];
const SCENE_ENV = { route: "path", forest: "tallgrass", city: "woodland", cave: "cave", sea: "beach", ice: "snow", volcano: "mountainb", safari: "plains" };
function sceneArt(title, env, nd) {
  if (nd && (nd.badgeWin != null || (nd.type !== "story" && /Gym/.test(nd.name)))) return null;   // (Gym battles are indoors)
  const hit = SCENE_STAGE.find(([re]) => re.test(title || "")), k = hit ? hit[1] : SCENE_ENV[env];
  if (!k || !RES_DATA.scene) return null;
  const h = new Date().getHours(), t = h >= 19 || h < 5 ? "night" : h >= 17 ? "sunset" : h < 7 ? "dawn" : "day";
  const f = RES_DATA.scene[k + "_" + t] || RES_DATA.scene[k + "_day"];
  return f ? resPng(f) : null;
}
function sceneSVG(env) {
  const th = mapTheme(env), rng = seeded(hash(env + "scene"));
  const day = !["cave", "tower", "plateau", "volcano"].includes(env);
  const sky = { route: ["#4a8ad8", "#8ec4f2", "#dff2ff"], forest: ["#1e4a2a", "#4a8a4a", "#a8d88a"], city: ["#5a9ae0", "#a8d0f2", "#f2f8ff"], sea: ["#3a7ad8", "#7ab8f2", "#d8f0ff"],
    cave: ["#0c0a10", "#2a2430", "#4a3e48"], tower: ["#140a24", "#3a1a52", "#7a4a8a"], plateau: ["#0a0614", "#2a1a4a", "#6a3a8a"], volcano: ["#2a0a06", "#7a2a10", "#e07a3a"],
    ice: ["#3a5a80", "#8ab0d8", "#e8f4ff"], lab: ["#3a4a5a", "#7a90a8", "#d8e2ec"], gym: ["#202838", "#384a68", "#6a7ea0"], plant: ["#1a1e2a", "#3a4258", "#8a92a8"] }[env] || ["#4a8ad8", "#8ec4f2", "#dff2ff"];
  let hills = "";
  for (let k = 0; k < 7; k++) { const x = rng() * 400, r = 80 + rng() * 120; hills += `<ellipse cx="${x}" cy="${620 + rng() * 40}" rx="${r}" ry="${r * .45}" fill="${shade(th.a, -.1 - rng() * .2)}"/>`; }
  let trees = "";
  if (env === "route" || env === "forest") for (let k = 0; k < 14; k++) { const x = rng() * 420 - 10, h = 50 + rng() * 60; trees += `<rect x="${x - 4}" y="${640 - h * .3}" width="8" height="${h * .3}" fill="#5a3a1e"/><circle cx="${x}" cy="${640 - h * .5}" r="${h * .32}" fill="${shade("#3f8a3a", -rng() * .3)}"/>`; }
  let fx = "";
  if (!day) for (let k = 0; k < 40; k++) fx += `<circle cx="${rng() * 400}" cy="${rng() * 420}" r="${rng() * 1.3 + .3}" fill="#fff" opacity="${.2 + rng() * .6}"/>`;
  else for (let k = 0; k < 5; k++) { const x = rng() * 400, y = 80 + rng() * 200; fx += `<ellipse cx="${x}" cy="${y}" rx="${40 + rng() * 40}" ry="${10 + rng() * 8}" fill="#fff" opacity=".55"/>`; }
  return `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" style="position:absolute;inset:0;width:100%;height:100%">
    <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".6" stop-color="${sky[1]}"/><stop offset=".85" stop-color="${sky[2]}"/></linearGradient></defs>
    <rect width="400" height="800" fill="url(#sk)"/>${fx}${hills}${trees}
    <rect y="640" width="400" height="160" fill="${shade(th.a, -.25)}"/><rect y="640" width="400" height="6" fill="${shade(th.a, .15)}" opacity=".6"/></svg>`;
}
function playScene(lines, title, env, nd) {
  return new Promise(resolve => {
    const root = $("#dlg"), th = mapTheme(env), art = sceneArt(title, env, nd);
    root.innerHTML = `<div class="dwrap">
      ${art ? `<div class="dbg dpaint" style="background-image:url(${art})"></div>` : `<div class="dbg" style="background:${th.b}">${sceneSVG(env)}</div>`}
      <img class="dchar left px" id="dL" alt="" hidden><img class="dchar right px" id="dR" alt="" hidden>
      <div class="dtop"><span class="ttl">${esc(title || "")}</span><div class="row"><button class="tog" id="dAuto">AUTO</button><button class="tog" id="dSkip">SKIP</button></div></div>
      <div class="dbox" id="dBox"><div class="dname" id="dName" hidden></div><div class="dtext" id="dText"></div><div class="dnext" id="dNext" hidden>▼</div></div>
    </div>`;
    root.hidden = false;
    let i = -1, typing = 0, full = "", auto = false, timer = 0, autoT = 0;
    const Lf = $("#dL"), Rr = $("#dR"), side = {};
    const done = () => { clearInterval(timer); clearTimeout(autoT); root.hidden = true; root.innerHTML = ""; resolve(); };
    const showLine = () => {
      i++; if (i >= lines.length) return done();
      const ln = lines[i], sp = SPK[ln.s] || { n: ln.s };
      if (ln.m) music(ln.m); if (ln.j) jingle(ln.j);   // (a line can change the scene's music, or play a jingle over it: Sinnoh's Spear Pillar)
      const nm = $("#dName"), name = ln.s === "me" ? S.name : sp.n; nm.hidden = !name; nm.textContent = name || "";
      $("#dBox").classList.toggle("dnarr", ln.s === "narr");
      const spr = sp.t === "me" ? avatar() : sp.t;
      if (spr) {
        const isRight = ln.s !== "me", img = isRight ? Rr : Lf;
        if (side[isRight ? "R" : "L"] !== ln.s) { img.classList.add("enter"); img.src = trainerURL(spr); img.hidden = false; side[isRight ? "R" : "L"] = ln.s; requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("enter"))); }
        Lf.classList.toggle("dim", isRight); Rr.classList.toggle("dim", !isRight);
      } else { Lf.classList.add("dim"); Rr.classList.add("dim"); }
      full = ln.t.replace(/\{name\}/g, S.name); let n = 0; const tx = $("#dText"); tx.textContent = ""; $("#dNext").hidden = true;
      clearInterval(timer);
      typing = 1;
      timer = setInterval(() => { n += 2; tx.textContent = full.slice(0, n); if (n >= full.length) { clearInterval(timer); typing = 0; $("#dNext").hidden = false; if (auto) autoT = setTimeout(showLine, 1100 + full.length * 18); } }, 22);
    };
    root.onclick = ev => {
      if (ev.target.closest("#dSkip")) return done();
      if (ev.target.closest("#dAuto")) { auto = !auto; $("#dAuto").classList.toggle("on", auto); if (auto && !typing) showLine(); return; }
      clearTimeout(autoT);
      if (typing) { clearInterval(timer); typing = 0; $("#dText").textContent = full; $("#dNext").hidden = false; if (auto) autoT = setTimeout(showLine, 1200); }
      else showLine();
    };
    showLine();
  });
}
