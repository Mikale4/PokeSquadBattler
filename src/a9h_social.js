
// =====================================================================
//  SCREENS (social): the Union Room (chat), Trainer profiles, Clubs and Raid Battles. Rules in a6e_people.js.
// =====================================================================
IC.chat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 9h8M8 12h5"/></svg>';
IC.club = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 20c.6-3.4 3-5 6-5s5.4 1.6 6 5M12 15.6c1-.4 2.3-.6 4-.6 3 0 5.4 1.6 6 5"/></svg>';
const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const ago2 = ms => ms < 60e3 ? "just now" : ms < 3600e3 ? Math.floor(ms / 60e3) + "m ago" : ms < 864e5 ? Math.floor(ms / 3600e3) + "h ago" : Math.floor(ms / 864e5) + "d ago";
const rwChips = rw => Object.entries(rw || {}).map(([k, n]) => `<span class="cost">${itemIcon(k)}${fmt(n)}</span>`).join(" ");
// every Trainer has a look (a6b_ladder.js docSpr); the player's is their own
const avatarKey = i => i === -1 ? avatar() : docSpr(S.ladder.seed + ":" + i), avatarOf = i => trainerURL(avatarKey(i));
const emblem = g => `<span class="gem" style="--gc:${g.col}"><img class="px" src="${sprFront(g.em)}" alt=""></span>`;
// (and the battle's display settings, ported from Arknights Tactics: S3 cut-ins, screen shake, damage numbers; the owner's ask, 2026-10-18)
const SET_DEF = { ticker: true, whisperToasts: true, filter: false, cutins: true, shake: true, dmgNums: true };
// chat emotes: HeartGold/SoulSilver's (resources/emotes, tools/pack_emotes.py), written :name: in a message and drawn animated
const EMOTES = ["dots", "note", "happy", "grumpy", "exclaim", "heart", "laugh", "angry", "question", "sick", "sad", "alert"];
const emoteHTML = (n, size = 20) => `<i class="emote" style="--es:${size}px;--ei:${EMOTES.indexOf(n)}" title="${n}"></i>`;
const withEmotes = html => html.replace(/:([a-z]+):/g, (w, n) => EMOTES.includes(n) ? emoteHTML(n) : w);
const noEmotes = t => t.replace(/\s*:([a-z]+):/g, (w, n) => EMOTES.includes(n) ? "" : w);
(() => { if (RES_DATA.emotes) { const st = document.createElement("style"); st.textContent = `:root{--emotes:url(${resPng(RES_DATA.emotes)})}`; document.head.appendChild(st); } })();
const setv = k => S.settings[k] != null ? S.settings[k] : SET_DEF[k];
const RUDE_WORDS = /\b(stupid|idiot|dumb|trash|garbage|moron|shut up|stfu|loser|pathetic|clown|cringe)\b/gi;
const filterTxt = t => setv("filter") ? t.replace(RUDE_WORDS, w => w[0] + "*".repeat(w.length - 1)) : t;

// ---------- Union Room (chat) ----------
function msgHTML(m, ch) {
  if (m.i === -2) return `<div class="cmsg sys"><span>${esc(m.txt)}</span></div>`;
  const me = m.i === -1, g = ch === "world" ? (me ? myGuild() : guildOf(m.i)) : null;
  return `<div class="cmsg ${me ? "me" : ""}"><button class="cav" data-act="prof" data-i="${m.i}" aria-label="Profile">${mugImg(avatarKey(m.i))}</button>
    <div class="cbody"><div class="cname">${g ? `<span class="gtag" style="color:${g.col}">[${esc(g.tag)}]</span>` : ""}<b data-act="prof" data-i="${m.i}">${esc(npcName(m.i))}</b><span class="ctime">${hhmm(m.t)}</span></div><div class="ctext">${withEmotes(esc(filterTxt(m.txt)))}</div></div></div>`;
}
const chatTabKey = () => UI.chatTab || "world";
SCREENS.chat = () => {
  chatInit();
  const tab = chatTabKey(), C = S.chat, dmI = tab.startsWith("dm:") ? +tab.slice(3) : null;
  if (tab === "world") C.unread.world = 0;
  if (tab === "guild") C.unread.guild = 0;
  if (dmI != null) { const st = npcState(dmI); C.unread.dm = Math.max(0, C.unread.dm - (st.unread || 0)); st.unread = 0; }
  const tabs = [["world", "Union Room", C.unread.world], ["guild", "Club", C.unread.guild], ["dms", "Messages", C.unread.dm]];
  let body = "";
  if (tab === "dms") {
    const th = Object.keys(C.dm).map(Number).filter(i => C.dm[i].length).sort((a, b) => C.dm[b].slice(-1)[0].t - C.dm[a].slice(-1)[0].t);
    body = th.length ? `<div class="stack dmlist" style="gap:6px">${th.map(i => { const last = C.dm[i].slice(-1)[0], st = npcState(i);
      return `<button class="dmrow" data-act="chatTab" data-t="dm:${i}"><img class="px" src="${avatarOf(i)}" alt=""><div class="mtx"><b>${esc(npcName(i))} ${isOnline(i) ? '<i class="ondot"></i>' : ""}</b><span class="tiny dim">${last.i === -1 ? "You: " : ""}${esc(last.txt.slice(0, 60))}</span></div>${st.unread ? `<span class="ubadge">${st.unread}</span>` : `<span class="tiny dim">${ago2(Date.now() - last.t)}</span>`}</button>`; }).join("")}</div>`
      : `<p class="small dim">No messages yet. Tap a Trainer's name in the Union Room to see their profile and message them.</p>`;
  } else if (tab === "guild" && !S.guild) body = `<p class="small dim">You're not in a Club yet.</p><button class="btn wide" data-act="go" data-v="guild">Find a Club</button>`;
  else {
    const list = dmI != null ? (C.dm[dmI] || []) : C[tab];
    body = `<div class="clog" id="clog">${list.map(m => msgHTML(m, tab)).join("") || `<p class="small dim">Say hi!</p>`}</div>`;
  }
  const head = dmI != null ? `<div class="spread">${back("chatTab", "Messages", 'data-t="dms"')}<button class="btn ghost sm" data-act="prof" data-i="${dmI}">${esc(npcName(dmI))} ${isOnline(dmI) ? '<i class="ondot"></i>' : `<span class="tiny dim">· ${ago2(lastSeen(dmI))}</span>`}</button></div>`
    : `<div class="spread">${back("go", "Home", 'data-v="home"')}<span class="eyebrow">${tab === "world" ? fmtFull(onlineNow().length) + " Trainers online" : tab === "guild" && myGuild() ? esc(myGuild().name) : "Messages"}</span></div>
      <div class="tabs2">${tabs.map(([k, n, u]) => `<button class="${tab === k ? "on" : ""}" data-act="chatTab" data-t="${k}">${n}${u ? ` <span class="ubadge">${u > 99 ? "99+" : u}</span>` : ""}</button>`).join("")}</div>`;
  const canType = tab === "world" || (tab === "guild" && S.guild) || dmI != null;
  return `<div class="chatscr">${head}${body}
    ${canType ? `${UI.emotes ? `<div class="emrow">${EMOTES.map(n => `<button data-act="emoteAdd" data-n="${n}" aria-label="${n}">${emoteHTML(n, 26)}</button>`).join("")}</div>` : ""}
      <form class="cinput" id="cform" onsubmit="return false"><button class="btn ghost sm embtn" data-act="emotePick" aria-label="Emotes">${emoteHTML("happy", 22)}</button><input id="cin" class="tinput" maxlength="200" autocomplete="off" placeholder="${dmI != null ? "Message " + esc(npcName(dmI)) : tab === "guild" ? "Message your Club" : "Say something in the Union Room"}"><button class="btn sm" data-act="chatSend">Send</button></form>` : ""}</div>`;
};
// new messages are added in place so typing isn't interrupted
chatUpdated = (ch, m, dmWith) => {
  if (!S || !UI.inGame) return;
  if (UI.view === "chat") {
    const tab = chatTabKey(), here = tab === ch || (ch === "dm" && tab === "dm:" + dmWith);
    const log = $("#clog");
    if (here && log) {
      const near = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
      if (log.querySelector("p.small")) log.innerHTML = "";
      log.insertAdjacentHTML("beforeend", msgHTML(m, ch)); while (log.children.length > CHAT_MAX) log.firstChild.remove(); if (near || m.i === -1) log.scrollTop = log.scrollHeight;
      if (ch === "world") S.chat.unread.world = 0; else if (ch === "guild") S.chat.unread.guild = 0; else { S.chat.unread.dm = Math.max(0, S.chat.unread.dm - 1); npcState(dmWith).unread = 0; }
    } else { for (const b of $$('#view .tabs2 [data-act="chatTab"]')) { const k = b.dataset.t, u = k === "dms" ? S.chat.unread.dm : S.chat.unread[k]; b.innerHTML = b.textContent.replace(/\s*\d+\+?$/, "") + (u ? ` <span class="ubadge">${u > 99 ? "99+" : u}</span>` : ""); } }
  }
  if (UI.view === "home") tickerUpdate();
  if (ch === "dm" && m.i >= 0 && !(UI.view === "chat" && chatTabKey() === "dm:" + dmWith) && setv("whisperToasts") && featOn("chat") && !DEMO_ON() && !BT.on) { const t = noEmotes(m.txt); toast(`${npcName(m.i)}: ${t.slice(0, 40)}${t.length > 40 ? "…" : ""}`); }
};
function tickerHTML() {
  chatInit();
  if (!setv("ticker")) return `<button class="ticker mini" data-act="go" data-v="chat"><span class="tk">${IC.chat.replace("<svg", '<svg width="16" height="16"')}Union Room</span>${chatUnread() ? `<span class="ubadge">${chatUnread()}</span>` : ""}</button>`;
  const m = S.chat.world.slice(-1)[0], u = S.chat.unread.guild + S.chat.unread.dm;
  return `<button class="ticker" data-act="go" data-v="chat"><span class="tk">${IC.chat.replace("<svg", '<svg width="16" height="16"')}Union Room</span><span class="tmsg">${m ? `<b>${esc(npcName(m.i))}:</b> ${withEmotes(esc(filterTxt(m.txt)))}` : "Chat with other Trainers"}</span>${u ? `<span class="ubadge">${u}</span>` : ""}</button>`;
}
function tickerUpdate() { const t = $(".ticker"); if (t) t.outerHTML = tickerHTML(); }
function chatScrollEnd() { const log = $("#clog"); if (log) log.scrollTop = log.scrollHeight; }
const chatUnread = () => S.chat ? S.chat.unread.guild + S.chat.unread.dm : 0;

// ---------- Trainer profiles ----------
function profModal(i) {
  if (i === -1) return myProfModal();
  if (i < 0) return;
  const p = person(i), doc = ladderDoc(i), g = guildOf(i), pts = S.ladder.pop[i], st = npcState(i), on = isOnline(i);
  const inMine = g && g.id === S.guild, sent = (S.gSent || []).some(x => x.i === i);
  openModal(`<div class="stack">
    <div class="row" style="gap:12px;align-items:center"><div class="pavatar"><img class="px" src="${avatarOf(i)}" alt=""></div>
      <div style="min-width:0"><div class="eyebrow">${on ? '<i class="ondot"></i> Online' : "Last seen " + ago2(lastSeen(i))}</div><h2 style="margin:2px 0">${esc(p.name)}</h2>
      <div class="small dim">Trainer Lv ${p.lvl} · ${esc(personaName(p))}</div></div></div>
    <p class="small" style="font-style:italic">"${esc(p.bio)}"</p>
    <div class="statgrid small"><div><span>Ranked Battles</span><b class="row" style="gap:4px">${tierBadge(pts, 18)}${tierOf(pts).n} · ${fmtFull(pts)}</b></div><div><span>Club</span><b>${g ? `[${esc(g.tag)}] ${esc(g.name)}` : "None"}</b></div>
      <div><span>Trainer since</span><b>${p.joined} days</b></div><div><span>Battled you</span><b>${st.met || 0}×</b></div></div>
    <div class="eyebrow">Favourite Pokémon</div><div class="row">${p.fav.map(k => opHTML(k, { s: 52, nolv: 1, show: 1, nostars: 1 })).join("")}</div>
    <div class="eyebrow">Registered Team${doc.arch ? ` · ${esc(archName(doc.arch))} <span class="dim" style="text-transform:none;letter-spacing:0">(${esc(archSub(doc.arch))})</span>` : ""}</div><div class="row">${doc.team.map(k => opHTML(k, { s: 52, prog: doc.prog[k], nostars: 1, show: 1 })).join("")}</div>
    <div class="row wrap"><button class="btn sm" data-act="friendly" data-i="${i}">Battle</button><button class="btn sm ghost" data-act="whisper" data-i="${i}">Message</button>
      ${canInvite() && !inMine ? `<button class="btn ghost sm" data-act="ginvite" data-i="${i}" ${sent || myGuild().mem.length >= guildCap(myGuild()) ? "disabled" : ""}>${sent ? "Invite sent" : "Invite to Club"}</button>` : ""}
      ${inMine && canInvite() && g.lead !== i ? `<button class="btn ghost sm" data-act="gkick" data-i="${i}">Remove from Club</button>` : ""}
      ${inMine && myRole() === "leader" && g.lead !== i ? `<button class="btn ghost sm" data-act="gpromote" data-i="${i}">${g.off.includes(i) ? "Remove Co-leader" : "Make Co-leader"}</button>` : ""}
      <button class="btn ghost sm" data-act="block" data-i="${i}">${S.blocked[i] ? "Unblock" : "Block"}</button></div>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}

// your own profile, as other Trainers see it (About me, team and all); Edit goes to the Trainer Card
function myProfModal() {
  const g = myGuild(), pts = S.ladder.pts, team = (S.team.defense || []).filter(owned), fav = [S.assistant, ...topTeam(3)].filter((k, n, a) => k && owned(k) && a.indexOf(k) === n).slice(0, 3);
  openModal(`<div class="stack">
    <div class="row" style="gap:12px;align-items:center"><div class="pavatar"><img class="px" src="${avatarOf(-1)}" alt=""></div>
      <div style="min-width:0"><div class="eyebrow"><i class="ondot"></i> Online · that's you</div><h2 style="margin:2px 0">${esc(S.name)}</h2><div class="small dim">Trainer Lv ${S.lvl}</div></div></div>
    <p class="small" style="font-style:italic">${S.bio ? `"${esc(S.bio)}"` : '<span class="dim">No About me yet. Write one on your Trainer Card.</span>'}</p>
    <div class="statgrid small"><div><span>Ranked Battles</span><b class="row" style="gap:4px">${tierBadge(pts, 18)}${tierOf(pts).n} · ${fmtFull(pts)}</b></div><div><span>Club</span><b>${g ? `[${esc(g.tag)}] ${esc(g.name)}` : "None"}</b></div>
      <div><span>Trainer since</span><b>${(d => d + (d === 1 ? " day" : " days"))(Math.max(1, Math.ceil((Date.now() - (S.created || Date.now())) / 864e5)))}</b></div><div><span>Pokédex</span><b>${dexCaught()}/${DEX_N}</b></div></div>
    ${fav.length ? `<div class="eyebrow">Favourite Pokémon</div><div class="row">${fav.map(k => opHTML(k, { s: 52, nolv: 1, show: 1, nostars: 1 })).join("")}</div>` : ""}
    ${team.length ? `<div class="eyebrow">Registered Team</div><div class="row">${team.map(k => opHTML(k, { s: 52, nostars: 1, show: 1 })).join("")}</div>` : ""}
    <button class="btn sm" data-act="editProfile">Edit profile</button>
    <button class="btn ghost wide" data-act="closeModal">Close</button></div>`);
}
// a friendly battle against a Trainer's Registered Team: no Ranked points, no record, no rewards, no PP. They may message you after.
const FRIENDLY = {
  intro: { mentor: "A friendly? Sure, let's learn something!", veteran: "Alright, let's see what you've got.", recruiter: "Show me if you're Club material!", tryhard: "Friendly or not, I'm not going easy.",
    whale: "My team's maxed, just so you know.", f2p: "Free battle, my favourite kind.", collector: "Be nice to my babies!", lore: "A battle, as in the days of the old League!",
    roleplayer: "*draws a Poké Ball* En garde, Trainer!", memer: "prepare to get vibe-checked", salty: "Fine. Let's get this over with.", newbie: "Okay! I'll do my best!",
    casual: "Sure, let's have some fun.", shy: "Um... please go easy...", hypebeast: "LET'S GOOO! FRIENDLY BATTLE!", lurker: "...",
    specialist: "My type against your team. Let's go!", challenger: "Timer's running!", gossip: "Ooh, everyone's going to hear about this!", creative: "Let's make it a pretty battle!",
    scientist: "For science!", foodie: "Winner picks dinner!", student: "One battle, then studying. Promise.", worker: "Off the clock. Let's battle.", traveler: "Battle from the road!",
    wholesome: "Have fun! Good luck!", philosopher: "A battle is a conversation. Let's talk.", gambler: "I like these odds!", achiever: "Every battle counts!", rival: "Finally! Let's go, rival!",
    caretaker: "Let's keep it gentle!", superstitious: "The signs are good. Let's battle!" },
  lose: { mentor: "Well played! You're getting good.", veteran: "Good game. You earned that.", recruiter: "Great battle! You'd fit in at my Club.", tryhard: "That was a fluke. Rematch.",
    whale: "Huh. Maybe I need more Gems.", f2p: "Beaten by skill, not spending. Respect.", collector: "Aww, my poor team!", lore: "A worthy battle, like Red against Blue.",
    roleplayer: "*kneels* You have bested me, Trainer!", memer: "skill issue (mine)", salty: "Whatever. RNG.", newbie: "Wow, you're so good!",
    casual: "Gg, that was fun.", shy: "Gg... you're really good.", hypebeast: "GG!! THAT WAS INSANE!", lurker: "gg",
    specialist: "Gg. My type will get you next time.", challenger: "Gg. New personal worst, at least.", gossip: "Gg! Wait till everyone hears!", creative: "Gg, that was beautiful.",
    scientist: "Interesting result. Noted.", foodie: "Gg. Dinner's on me.", student: "Gg. Okay, now I really have to study.", worker: "Gg. Back to work.", traveler: "Gg! Greetings from the road!",
    wholesome: "Gg! You did amazing!", philosopher: "A loss is a lesson. Gg.", gambler: "Gg. The odds weren't with me.", achiever: "Gg. I'll be back for that.", rival: "Gg. This isn't over, rival.",
    caretaker: "Gg! Let's heal up.", superstitious: "Gg. Should've worn my lucky shirt." },
};
function launchFriendly(i) {
  const ids = squadOrToast("friendly"); if (!ids) return;
  const doc = modeDoc(ladderDoc(i), "friendly"), p = person(i), back = (UI.arg && UI.arg.back) || ["chat", null];   // (Friendly battles' own rules: the team config's modes)
  UI.team = null; route(back[0], back[1]);
  startBattle({
    allies: allySpecs(ids), waves: [npcLeads(doc, allySpecs(ids))], env: "gym", enemyStyle: doc.ai, pvp: true, bgm: stadiumTheme(),
    title: doc.name, sub: "Friendly battle · no points", friendly: true, trainer: doc.name, trainerSpr: doc.spr,
    intro: (personaOf(p) ? fillV(personaOf(p).fight, p, { to: S.name }) : FRIENDLY.intro[p.arch]) || "Let's battle!", lose: FRIENDLY.lose[p.arch] || "Good game!", ball: TIER_BALL[tierIdx(S.ladder.pop[i])],
    onWin() { friendlyDM(i, true); return { rewards: [] }; },
    onLose() { friendlyDM(i, false); return { rewards: [] }; },
    retry: () => launchFriendly(i),
  });
}
// afterwards: a message in their own words, sometimes
function friendlyDM(i, playerWon) {
  chatInit();
  const p = person(i); if (!isOnline(i) || Math.random() > .35 + p.warm * .4) return;
  S.chat.q.push({ at: Date.now() + 5000 + Math.random() * 15000, ch: "dm", i, topic: playerWon ? "dm_gg_loss" : "dm_gg_win", sl: { to: S.name }, dm: i });
}

// ---------- Clubs ----------
const POL = { open: "Anyone can join", approval: "Approval required", closed: "Invite only" };
function guildCard(g, act) {
  const full = g.mem.length >= guildCap(g), req = (S.gReq || []).some(x => x.gid === g.id);
  return `<div class="sub stack" style="gap:6px"><div class="row" style="gap:10px;align-items:center">${emblem(g)}<div style="min-width:0;flex:1"><b>${esc(g.name)}</b> <span class="tiny dim">[${esc(g.tag)}]</span>
    <div class="tiny dim">Lv ${g.lvl} · ${g.mem.length}/${guildCap(g)} members · ${POL[g.pol]}${g.minLvl ? ` · Trainer Lv ${g.minLvl}+` : ""}</div></div></div>
    <p class="tiny" style="margin:0">${esc(g.desc)}</p>
    ${act ? `<button class="btn sm" data-act="gjoin" data-g="${g.id}" ${full || g.pol === "closed" || req || S.lvl < g.minLvl ? "disabled" : ""}>${req ? "Request sent" : full ? "Full" : g.pol === "closed" ? "Invite only" : S.lvl < g.minLvl ? `Needs Lv ${g.minLvl}` : g.pol === "open" ? "Join" : "Ask to join"}</button>` : ""}</div>`;
}
SCREENS.guild = () => {
  guildWorld();
  const g = myGuild();
  if (!g) {
    const q = (UI.gSearch || "").toLowerCase();
    const list = guildList().filter(x => !q || x.name.toLowerCase().includes(q) || x.tag.toLowerCase().includes(q))
      .sort((a, b) => (q ? 0 : ((b.mem.length < guildCap(b) && b.minLvl <= S.lvl) - (a.mem.length < guildCap(a) && a.minLvl <= S.lvl)) * 10) + (b.lvl - a.lvl) + (Math.abs(a.q - ratingQ(S.ladder.best)) - Math.abs(b.q - ratingQ(S.ladder.best))) * 8).slice(0, 25);
    const inv = (S.gInv || []).filter(x => guildById(x.gid) && x.t <= Date.now());
    const cool = S.gLeft && Date.now() - S.gLeft < 3600e3;
    return `<div class="stack">
      <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="eyebrow">Clubs</span></div>
      <h2>Find a Club</h2>
      <p class="small dim">Club members contribute together every day and team up against a huge Pokémon in the weekly Raid Battle.</p>
      ${cool ? `<div class="hint"><span class="small">You left a Club recently. You can join another in ${dur(3600e3 - (Date.now() - S.gLeft))}.</span></div>` : ""}
      ${inv.length ? `<h3>Invitations</h3>${inv.map(x => { const gg = guildById(x.gid); return `<div class="sub stack" style="gap:6px"><span class="small"><b>${esc(npcName(x.i))}</b> invited you to <b>${esc(gg.name)}</b></span>${guildCard(gg)}
        <div class="row"><button class="btn sm" data-act="ginvAccept" data-g="${gg.id}" ${cool ? "disabled" : ""}>Accept</button><button class="btn ghost sm" data-act="ginvDecline" data-g="${gg.id}">Decline</button></div></div>`; }).join("")}` : ""}
      ${(S.gReq || []).length ? `<div class="sub small">Waiting for approval: ${(S.gReq || []).map(x => guildById(x.gid) ? esc(guildById(x.gid).name) : "").join(", ")}</div>` : ""}
      <div class="row"><input id="gsearch" class="tinput" style="flex:1" placeholder="Search Clubs" value="${esc(UI.gSearch || "")}"><button class="btn ghost sm" data-act="gsearch">Search</button></div>
      <button class="btn wide" data-act="gcreate" ${cool ? "disabled" : ""}>Start a Club · <span class="cost">${IC.lmd}50K</span></button>
      <h3>${q ? "Results" : "Recommended"}</h3>
      ${list.map(x => guildCard(x, !cool)).join("") || '<p class="small dim">No Clubs found.</p>'}
    </div>`;
  }
  const tab = UI.gTab || "members", role = myRole(), b = gBoss(g), apps = (S.gApps || []).length;
  const tabs = [["members", "Members"], ["donate", "Contribute"], ["boss", "Raid"], ...(canInvite() ? [["recruit", "Recruit" + (apps ? ` (${apps})` : "")]] : []), ...(role === "leader" ? [["manage", "Manage"]] : [])];
  let body = "";
  if (tab === "members") {
    const order = { leader: 0, officer: 1, member: 2 }, roleOf = i => i === g.lead ? "leader" : g.off.includes(i) ? "officer" : "member";
    const mem = g.mem.slice().sort((a, c) => order[roleOf(a)] - order[roleOf(c)] || (c === -1 ? 1 : a === -1 ? -1 : isOnline(c) - isOnline(a)));
    body = mem.map(i => { const me = i === -1, on = me || isOnline(i), don = g.don && g.don.day === today() && g.don.by[i], tries = (b.tries && b.tries[i]) || 0;
      return `<button class="mrow" data-act="prof" data-i="${i}"><img class="px" src="${avatarOf(i)}" alt=""><div class="mtx"><b>${esc(npcName(i))}${me ? " (you)" : ""} ${on ? '<i class="ondot"></i>' : ""}</b>
        <span class="tiny dim">${roleOf(i) !== "member" ? `<span class="gold">${roleOf(i) === "leader" ? "Club Leader" : "Co-leader"}</span> · ` : ""}Lv ${me ? S.lvl : person(i).lvl} · ${tierOf(me ? S.ladder.pts : S.ladder.pop[i]).n}${on ? "" : " · " + ago2(lastSeen(i))}</span></div>
        <span class="tiny">${don ? IC.check.replace("<svg", '<svg width="14" height="14"') : ""} ${tries}/2</span></button>`; }).join("");
  } else if (tab === "donate") {
    const by = g.don && g.don.day === today() ? g.don.by : {}, mine = by[-1];
    body = `<p class="small dim">Contribute once a day. Contributions level up the Club (room for more members) and earn you rewards. ${Object.keys(by).length} of ${g.mem.length} members have contributed today.</p>
      ${DONATIONS.map(d => `<div class="sub spread"><div><b class="small">${d.n} contribution</b><div class="row tiny" style="gap:4px;flex-wrap:wrap">${rwChips(d.cost)} → +${d.xp} Club EXP · you get ${rwChips(d.give)}</div></div>
        <button class="btn sm" data-act="gdonate" data-id="${d.id}" ${mine || Object.entries(d.cost).some(([k, n]) => have(k) < n) ? "disabled" : ""}>${mine === d.id ? "Done" : "Give"}</button></div>`).join("")}`;
  } else if (tab === "boss") {
    const ranks = Object.entries(b.hits).map(([i, d]) => [+i, d]).sort((x, y) => y[1] - x[1]).slice(0, 10);
    body = `<div class="gboss" style="--tc:${TC[OPS[b.key].types[0]]}"><img class="px" src="${sprFull(b.key)}" alt=""><div><div class="eyebrow">This week's Raid Battle</div><h2 style="margin:2px 0">${esc(OPS[b.key].n)}</h2><div class="row" style="gap:4px">${typeChips(OPS[b.key].types)}</div><div class="small">Stage ${b.stage} · Lv ${gbLV(b.stage)}</div></div></div>
      <div class="bar boss"><i style="width:${b.hp / b.max * 100}%"></i></div><div class="spread tiny"><span class="num">${fmtFull(Math.round(b.hp))} / ${fmtFull(b.max)} HP</span><span>Resets in ${dur(weekEnds() - Date.now())}</span></div>
      <p class="small dim">Each member gets 2 Raid Passes a day, ${GB_TURNS} turns each. The damage you deal stays; every stage the Club clears sends rewards to all members' Mail.</p>
      <button class="btn wide" data-act="gbossGo" ${gbTriesLeft() > 0 ? "" : "disabled"}>Join the Raid · ${gbTriesLeft()}/2 Raid Passes left today</button>
      <h3>Damage this week</h3>${ranks.map(([i, d], k) => `<div class="spread small"><span>${k + 1}. ${esc(npcName(i))}</span><span class="num">${fmt(d)}</span></div>`).join("") || '<p class="small dim">Nobody has battled it yet.</p>'}
      <h3>Recent battles</h3>${b.log.slice(0, 8).map(x => `<div class="spread tiny"><span>${esc(npcName(x.i))}</span><span class="num">${fmt(x.dmg)} · ${ago2(Date.now() - x.t)}</span></div>`).join("")}`;
  } else if (tab === "recruit") {
    const sent = S.gSent || [];
    const recs = onlineNow().filter(i => !guildOf(i) && person(i).lvl >= g.minLvl).sort((a, c) => person(c).q - person(a).q).slice(0, 12);
    body = `${apps ? `<h3>Asking to join</h3>${S.gApps.map(a => `<div class="mrow"><img class="px" src="${avatarOf(a.i)}" alt=""><div class="mtx" data-act="prof" data-i="${a.i}"><b>${esc(npcName(a.i))}</b><span class="tiny dim">Lv ${person(a.i).lvl} · ${tierOf(S.ladder.pop[a.i]).n} · ${ago2(Date.now() - a.t)}</span></div>
        <button class="btn sm" data-act="gappOk" data-i="${a.i}">Accept</button><button class="btn ghost sm" data-act="gappNo" data-i="${a.i}">Decline</button></div>`).join("")}` : ""}
      <h3>Trainers looking for a Club</h3><p class="tiny dim">Online now, without a Club. You can also invite anyone from their profile in the Union Room or the Battle Stadium.</p>
      ${recs.map(i => `<div class="mrow"><img class="px" src="${avatarOf(i)}" alt=""><div class="mtx" data-act="prof" data-i="${i}"><b>${esc(npcName(i))} <i class="ondot"></i></b><span class="tiny dim">Lv ${person(i).lvl} · ${tierOf(S.ladder.pop[i]).n} · ${ARCH_NAME[person(i).arch]}</span></div>
        <button class="btn sm" data-act="ginvite" data-i="${i}" ${sent.some(x => x.i === i) || g.mem.length >= guildCap(g) ? "disabled" : ""}>${sent.some(x => x.i === i) ? "Sent" : "Invite"}</button></div>`).join("") || '<p class="small dim">Nobody right now. Check back later.</p>'}`;
  } else if (tab === "manage") {
    body = `<label class="small dim">Description</label><textarea id="gdesc" class="tinput" rows="3" maxlength="160">${esc(g.desc)}</textarea>
      <label class="small dim">Who can join</label><div class="filters">${Object.entries(POL).map(([k, n]) => `<button class="chip ${g.pol === k ? "on" : ""}" data-act="gpol" data-p="${k}">${n}</button>`).join("")}</div>
      <label class="small dim">Minimum Trainer Level</label><div class="filters">${[0, 10, 20, 40, 60, 80].map(l => `<button class="chip ${g.minLvl === l ? "on" : ""}" data-act="gmin" data-l="${l}">${l || "Any"}</button>`).join("")}</div>
      <button class="btn wide" data-act="gsave">Save</button>`;
  }
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<button class="btn ghost sm" data-act="chatGuild">${IC.chat.replace("<svg", '<svg width="16" height="16"')} Club chat${S.chat.unread.guild ? ` <span class="ubadge">${S.chat.unread.guild}</span>` : ""}</button></div>
    <section class="panel guildcard" style="--gc:${g.col}"><div class="row" style="gap:12px;align-items:center">${emblem(g)}<div style="min-width:0;flex:1"><div class="eyebrow">${role === "leader" ? "Club Leader" : role === "officer" ? "Co-leader" : "Member"} · ${POL[g.pol]}</div>
      <h2 style="margin:2px 0">${esc(g.name)} <span class="small dim">[${esc(g.tag)}]</span></h2><div class="small">Lv ${g.lvl} · ${g.mem.length}/${guildCap(g)} members</div></div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${g.xp / gxpNeed(g.lvl) * 100}%"></i></div><p class="tiny dim" style="margin:6px 0 0">${esc(g.desc)}</p></section>
    <div class="tabs2">${tabs.map(([k, n]) => `<button class="${tab === k ? "on" : ""}" data-act="gTab" data-t="${k}">${n}</button>`).join("")}</div>
    ${body}
    <button class="btn ghost wide" data-act="gleave">${role === "leader" && g.mem.length > 1 ? "Leave (a Co-leader takes over)" : "Leave the Club"}</button>
  </div>`;
};
function createGuildModal(err) {
  openModal(`<div class="stack"><h2>Start a Club</h2>${err ? `<p class="small bad">${esc(err)}</p>` : ""}
    <label class="small dim">Name (3–20 characters)</label><input id="gname" class="tinput" maxlength="20">
    <label class="small dim">Tag (2–4 letters)</label><input id="gtag" class="tinput" maxlength="4" style="text-transform:uppercase">
    <label class="small dim">Description</label><textarea id="gdesc2" class="tinput" rows="3" maxlength="160">Friendly Club. Contribute daily and join the Raid!</textarea>
    <p class="tiny dim">Costs 50,000 Poké Dollars and needs Trainer Level 10. Your partner Pokémon becomes the Club's mascot. You can change who can join later.</p>
    <button class="btn wide" data-act="gcreateGo" ${S.lmd >= 50000 && S.lvl >= 10 ? "" : "disabled"}>Start · <span class="cost">${IC.lmd}50K</span></button><button class="btn ghost wide" data-act="closeModal">Cancel</button></div>`);
}
function launchGuildBoss() {
  const g = myGuild(), ids = squadOrToast("gboss");
  if (!g || !ids) return;
  if (gbTriesLeft() <= 0) { toast("No Raid Passes left today."); route("guild"); return; }
  const b = gBoss(g); b.tries[-1] = (b.tries[-1] || 0) + 1;
  route("guild"); S.stats.battles++; save();
  const stage = b.stage, key = b.key;
  const finish = (res, B) => {
    const dmg = Math.round(B.damageBy("A")), cleared = gbHit(g, -1, dmg);
    stat("bossHits"); stat("bossDmg", dmg); live("raid", dmg);
    const list = give({ lmd: 1500 + Math.round(dmg / 4), ...(dmg > b.ref ? { rec3: 2 } : { rec2: 3 }) });
    if (Math.random() < .4) { const on = g.mem.filter(i => i >= 0 && isOnline(i)); if (on.length) later(4000, "guild", pick(on), dmg > b.ref ? "reply_congrats" : "g_banter", { to: S.name }); }
    return { rewards: [{ k: "dmg", n: dmg }, ...list], note: `${fmtFull(dmg)} damage${cleared ? ` · stage ${stage} cleared!` : ""}` };
  };
  startBattle({
    allies: allySpecs(ids), waves: [[{ op: key, LV: gbLV(stage), maxHp: b.max, hpNow: b.hp, boss: true }]], env: "plateau", turnLimit: GB_TURNS, bgm: pickOf(RAID_THEMES),
    title: `Raid ${OPS[key].n} · Stage ${stage}`, sub: `Raid Battle · ${g.name}`,
    onWin: finish, onLose: finish,
    onQuit() { save(); },
  });
}

// ---------- actions ----------
const SOCIAL_ACT = {
  chatTab: d => { UI.chatTab = d.t; route("chat"); chatScrollEnd(); },
  chatGuild: () => { UI.chatTab = "guild"; route("chat"); chatScrollEnd(); },
  emotePick: () => { const v = ($("#cin") || {}).value || ""; UI.emotes = !UI.emotes; rerender(); const i = $("#cin"); if (i) { i.value = v; i.focus(); } chatScrollEnd(); },
  emoteAdd: d => { const i = $("#cin"); if (!i) return; i.value = (i.value.trimEnd() + " :" + d.n + ": ").trimStart().slice(0, 200); i.focus(); sfx("tap"); },
  chatSend: () => {
    const inp = $("#cin"); if (!inp) return;
    const v = inp.value.trim(); if (!v) return;
    inp.value = "";
    const tab = chatTabKey();
    if (tab.startsWith("dm:")) playerSay("dm", v, +tab.slice(3)); else playerSay(tab, v);
    sfx("tap"); inp.focus();
  },
  prof: d => profModal(+d.i),
  whisper: d => { closeModal(); UI.chatTab = "dm:" + d.i; chatInit(); S.chat.dm[d.i] = S.chat.dm[d.i] || []; route("chat"); chatScrollEnd(); const i = $("#cin"); if (i) i.focus(); },
  block: d => { const i = +d.i; if (S.blocked[i]) delete S.blocked[i]; else S.blocked[i] = 1; toast(S.blocked[i] ? `${npcName(i)} is blocked.` : `${npcName(i)} is unblocked.`); profModal(i); },
  unblockAll: () => { S.blocked = {}; rerender(); },
  ginvite: d => { const i = +d.i; inviteNpc(i); toast(`Invite sent to ${npcName(i)}.`); if (!$("#modal").hidden) profModal(i); else rerender(); },
  gkick: d => { kickMember(+d.i); closeModal(); rerender(); },
  gpromote: d => { promoteMember(+d.i); closeModal(); rerender(); },
  gTab: d => { UI.gTab = d.t; rerender(); },
  gsearch: () => { UI.gSearch = ($("#gsearch") || {}).value || ""; rerender(); },
  gjoin: d => { const g = guildById(d.g), r = requestJoin(g); toast(r === "joined" ? `Welcome to ${g.name}!` : r === "sent" ? "Request sent. The Club's leaders will decide." : r === "level" ? `Needs Trainer Level ${g.minLvl}.` : "This Club is invite only."); rerender(); },
  ginvAccept: d => { const g = guildById(d.g); if (g && g.mem.length < guildCap(g)) { joinGuild(g); toast(`Welcome to ${g.name}!`); } else toast("That Club is full now."); S.gInv = (S.gInv || []).filter(x => x.gid !== d.g); rerender(); },
  ginvDecline: d => { S.gInv = (S.gInv || []).filter(x => x.gid !== d.g); rerender(); },
  gcreate: () => createGuildModal(),
  gcreateGo: () => {
    const name = (($("#gname") || {}).value || "").trim(), tag = (($("#gtag") || {}).value || "").trim().toUpperCase(), desc = (($("#gdesc2") || {}).value || "").trim().slice(0, 160);
    if (name.length < 3) return createGuildModal("The name needs at least 3 characters.");
    if (!/^[A-Z0-9]{2,4}$/.test(tag)) return createGuildModal("The tag needs 2–4 letters or numbers.");
    if (guildList().some(g => g.name.toLowerCase() === name.toLowerCase())) return createGuildModal("That name is taken.");
    if (S.lmd < 50000 || S.lvl < 10) return;
    S.lmd -= 50000; createGuild(name, tag, desc || "Friendly Club.", "approval", 0, S.assistant || "pikachu");
    closeModal(); sfx("win"); toast(`${name} is founded!`); UI.gTab = "recruit"; route("guild");
  },
  gleave: () => openModal(`<div class="stack"><h2>Leave the Club?</h2><p class="small dim">You won't be able to join another Club for an hour.</p><div class="row"><button class="btn red sm" data-act="gleaveGo">Leave</button><button class="btn ghost sm" data-act="closeModal">Stay</button></div></div>`),
  gleaveGo: () => { leaveGuild(); closeModal(); UI.gTab = "members"; rerender(); },
  gdonate: d => { const list = donate(d.id); if (list) { sfx("heal"); rewardModal("Thanks for contributing!", list, myGuild().name); } rerender(); },
  friendly: d => { const i = +d.i, doc = modeDoc(ladderDoc(i), "friendly"); closeModal(); teamScreen("friendly", `Friendly battle · ${doc.name}`, 0, doc.team.map(k => npcSpec(doc, k)), [UI.view, UI.arg], { kind: "friendly", i }); },
  editProfile: () => { closeModal(); route("settings"); setTimeout(() => { const el = $("#pbio"); if (el) { el.scrollIntoView({ block: "center" }); el.focus(); } }, 50); },
  gbossGo: () => { const g = myGuild(), b = gBoss(g); teamScreen("gboss", `Raid Battle · ${OPS[b.key].n}`, 0, [{ op: b.key, LV: gbLV(b.stage) }], ["guild", null], { kind: "gboss" }); },
  gappOk: d => { if (!acceptApp(+d.i)) toast("The Club is full."); rerender(); },
  gappNo: d => { denyApp(+d.i); rerender(); },
  gpol: d => { myGuild().pol = d.p; rerender(); },
  gmin: d => { myGuild().minLvl = +d.l; rerender(); },
  gsave: () => { const g = myGuild(); g.desc = (($("#gdesc") || {}).value || g.desc).slice(0, 160); toast("Saved."); rerender(); },
  setTog: d => { S.settings[d.k] = !setv(d.k); save(); rerender(); },
  exportSave: () => { const code = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); try { navigator.clipboard.writeText(code); toast("Save code copied."); } catch (e) { openModal(`<div class="stack"><h2>Save code</h2><textarea class="tinput" rows="6">${code}</textarea><button class="btn wide" data-act="closeModal">Close</button></div>`); } },
  importSave: () => openModal(`<div class="stack"><h2>Load a save code</h2><p class="tiny dim">This replaces the adventure in this save.</p><textarea id="scode" class="tinput" rows="6"></textarea><button class="btn wide" data-act="importGo">Load</button><button class="btn ghost wide" data-act="closeModal">Cancel</button></div>`),
  importGo: () => { try { const s = JSON.parse(decodeURIComponent(escape(atob((($("#scode") || {}).value || "").trim())))); if (!s || s.v !== 1) throw 0; enterGame(SAVE_SLOT, { save: s }); toast("Save loaded."); } catch (e) { toast("That code didn't work."); } },
};
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target && e.target.id === "cin") { e.preventDefault(); SOCIAL_ACT.chatSend(); } });
