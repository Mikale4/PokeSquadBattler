
// =====================================================================
//  POKÉMON TRAINER CLUB — local accounts on the title screen
//  Accounts live in this browser only (ACCT_KEY), each with its own save key. Guest play keeps the original
//  save key, so existing progress stays where it was; the Demo plays on its own key (a9f_demo.js).
// =====================================================================
const ACCT_KEY = "pokemon_kanto_squad_accounts";
const DEMO_KEY = SAVE_KEY + ":demo";
let SESSION = null; // { id: "guest" | "demo" | "hot" | account id, name }

function acctData() {
  try { const d = JSON.parse(localStorage.getItem(ACCT_KEY)); if (d && Array.isArray(d.list)) return d; } catch (e) { /* storage unavailable */ }
  return { list: [], remember: null };
}
function acctStore(d) { try { localStorage.setItem(ACCT_KEY, JSON.stringify(d)); } catch (e) { /* storage unavailable */ } }
const acctSlot = id => id === "guest" ? SAVE_KEY : id === "demo" ? DEMO_KEY : SAVE_KEY + ":acct:" + id;
const rememberedAcct = () => { const d = acctData(); return d.remember && d.list.find(a => a.id === d.remember) || null; };
function readSave(key) { try { const s = JSON.parse(localStorage.getItem(key)); return s && s.v === 2 ? s : null; } catch (e) { return null; } }
async function pwHash(salt, pw) {
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + pw));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let h = ""; for (let i = 0; i < 8; i++) h += hash(i + ":" + salt + ":" + pw).toString(16).padStart(8, "0");
  return h;
}

// a card over the title screen (log in, News, Demo); tapping outside it closes it
function titlePanel(html) {
  const root = $("#title"); if (!root) return null;
  const old = root.querySelector(".tpanel"); if (old) old.remove();
  const p = document.createElement("div"); p.className = "tpanel"; p.innerHTML = `<div class="tcard">${html}</div>`;
  p.onclick = ev => { if (ev.target === p) p.remove(); };
  root.appendChild(p);
  return p;
}

// ---------- log in / register ----------
function loginPanel(tab, err) {
  const d = acctData(), guestSave = readSave(acctSlot("guest")), cur = SESSION && !["demo", "guest", "hot"].includes(SESSION.id) ? SESSION : null;
  const reg = tab === "register";
  const p = titlePanel(`
    <div class="tclub">${IC.pokeball}<span>Pokémon Trainer Club</span></div>
    <div class="tabs2"><button class="${reg ? "" : "on"}" data-tab="login">Log In</button><button class="${reg ? "on" : ""}" data-tab="register">Sign Up</button></div>
    <h2>${reg ? "New Trainer" : "Welcome back!"}</h2>
    <div class="tfield"><label for="tId">Trainer ID</label><input id="tId" maxlength="16" autocomplete="username" spellcheck="false" placeholder="3–16 letters or numbers"></div>
    <div class="tfield"><label for="tPw">Password</label><input id="tPw" type="password" maxlength="64" autocomplete="${reg ? "new-password" : "current-password"}"></div>
    ${reg ? `<div class="tfield"><label for="tPw2">Confirm password</label><input id="tPw2" type="password" maxlength="64" autocomplete="new-password"></div>` : ""}
    <label class="tcheck"><input type="checkbox" id="tRem" checked> Stay logged in on this device</label>
    ${reg && guestSave && guestSave.named && !d.list.length ? `<label class="tcheck"><input type="checkbox" id="tCarry" checked> Bring this device's Guest adventure along (${esc(guestSave.name)}, ${guestSave.badges || 0} Badges, ${Object.keys(guestSave.ops || {}).length} Pokémon)</label>` : ""}
    <div class="terr" id="tErr">${err ? esc(err) : ""}</div>
    <button class="btn wide" id="tGo">${reg ? "Create account" : "Log in"}</button>
    ${!reg && d.list.length ? `<div class="stack" style="gap:6px"><div class="tnote">Trainers on this device</div>${d.list.map(a => `<button class="tacct" data-fill="${esc(a.name)}"><b>${esc(a.name)}</b><span class="tiny dim">${a.last ? "Last played " + new Date(a.last).toLocaleDateString() : ""}</span></button>`).join("")}</div>` : ""}
    <div class="spread"><button class="tlink" id="tGuest">Play as Guest</button>${cur ? `<button class="tlink" id="tOut">Log out ${esc(cur.name)}</button>` : ""}</div>
    <p class="tnote">Accounts are kept in this browser only. This isn't an online account, so don't reuse a real password.</p>`);
  if (!p) return;
  const go = async () => {
    const id = ($("#tId").value || "").trim(), pw = $("#tPw").value || "", rem = $("#tRem").checked;
    const fail = m => { $("#tErr").textContent = m; sfx("tap"); };
    if (!/^[A-Za-z0-9 _.-]{3,16}$/.test(id)) return fail("Trainer ID: 3–16 letters, numbers, spaces, _ . or -.");
    if (pw.length < 4) return fail("Password: at least 4 characters.");
    const D = acctData(), ex = D.list.find(a => a.name.toLowerCase() === id.toLowerCase());
    if (reg) {
      if (ex) return fail("That Trainer ID is already registered on this device.");
      if (pw !== $("#tPw2").value) return fail("The passwords don't match.");
      const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const a = { id: "a" + Date.now().toString(36) + Math.floor(Math.random() * 1e4), name: id, salt, hash: await pwHash(salt, pw), created: Date.now(), last: Date.now() };
      D.list.push(a); D.remember = rem ? a.id : null; acctStore(D);
      if ($("#tCarry") && $("#tCarry").checked) {
        // the Guest adventure moves to the new account
        try { localStorage.setItem(acctSlot(a.id), localStorage.getItem(acctSlot("guest"))); localStorage.removeItem(acctSlot("guest")); } catch (e) { /* storage unavailable */ }
      }
      sfx("win"); enterAccount(a, true);
    } else {
      if (!ex) return fail("No Trainer with that ID on this device. Sign up first.");
      if (await pwHash(ex.salt, pw) !== ex.hash) return fail("Wrong password.");
      D.remember = rem ? ex.id : null; acctStore(D);
      sfx("heal"); enterAccount(ex);
    }
  };
  p.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { sfx("tap"); loginPanel(b.dataset.tab); });
  p.querySelectorAll("[data-fill]").forEach(b => b.onclick = () => { $("#tId").value = b.dataset.fill; $("#tPw").focus(); });
  $("#tGo").onclick = go;
  for (const el of p.querySelectorAll("input")) el.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  $("#tGuest").onclick = () => { sfx("heal"); enterGuest(); };
  if ($("#tOut")) $("#tOut").onclick = () => logout();
  setTimeout(() => { const f = $("#tId"); if (f && !matchMedia("(pointer:coarse)").matches) f.focus(); }, 60);
}
// into the game (adventures from the old server list are gathered first: oneServer in a6i_servers.js)
function enterAccount(a, isNew) {
  const D = acctData(), x = D.list.find(y => y.id === a.id); if (x) { x.last = Date.now(); acctStore(D); }
  oneServer(a.id, () => {
    SESSION = { id: a.id, name: a.name };
    hideTitle();
    enterGame(acctSlot(a.id), { name: a.name });
    if (isNew) toast(`Welcome to the Pokémon Trainer Club, ${a.name}!`, "gold");
  });
}
function enterGuest() {
  oneServer("guest", () => {
    SESSION = { id: "guest", name: "Guest" };
    hideTitle();
    enterGame(acctSlot("guest"));
  });
}
// write the current save straight away (leaving the game, logging out, page hidden)
function flushSave() { clearTimeout(saveTimer); if (S) { try { localStorage.setItem(SAVE_SLOT, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } } }
function leaveGame(msg) { flushSave(); S = null; UI.inGame = false; showTitle(msg); }
function logout() {
  const D = acctData(); D.remember = null; acctStore(D);
  const who = SESSION && SESSION.name; SESSION = null;
  leaveGame(who ? `Logged out ${who}` : "Logged out");
}

// load a save and open the game: the title screen hands over to this
function enterGame(slot, opts = {}) {
  SAVE_SLOT = slot;
  S = migrate(opts.save || load() || newSave());
  Object.assign(UI, { view: "home", arg: null, el: "all", cls: "all", all: false, opTab: "info", team: null, hhB: null, huntLv: {} });
  closeModal();
  tickTimers();
  setDevicePref("shell", S.settings.shell || "classic"); setDevicePref("sound", S.settings.sound !== false);
  applyShell();
  UI.inGame = true;
  route("home");
  if (!S.named) { nameModal(opts.name); return; }
  afterLogin();
}

// ---------- News ----------
function newsPanel() {
  const p = titlePanel(`<div class="eyebrow">News</div><h2>Version ${GAME_VER}</h2>
    <div class="tnotes">
      <div><b>Music.</b> The FireRed and LeafGreen soundtrack: Pallet Town, the routes, Gym Leader and Champion battles, Lavender Town and more, with their victory themes and jingles.</div>
      <div><b>Battle Stadium.</b> Ranked Battles against 3,000 Trainers, from the Beginner tier up to Legend, with a Registered Team that battles while you're away. Link Battles: pick five, ban one, then a live 4 v 4 with 20 seconds a move.</div>
      <div><b>Clubs and Raid Battles.</b> Join or start a Club, contribute every day, and take on a huge Pokémon together with two Raid Passes a day.</div>
      <div><b>The Union Room.</b> Chat with the Trainers you battle. They answer, message you after battles and invite you to their Clubs.</div>
      <div><b>New Safari Zone areas every week.</b> Three themed areas, including Joint areas with two featured 5★ Pokémon.</div>
      <div><b>Pokémon Trainer Club.</b> Each Trainer on this device has their own adventure. Guest keeps the progress you already had.</div>
      <div><b>Demo.</b> Watch a runner play from a brand-new save all the way to a complete Pokédex.</div>
      <div><b>Cries, item sprites and Expert tactics.</b> Pokémon cry in battle and in the Pokédex; items and types have their sprites; Auto can now look ahead.</div>
    </div>
    <button class="btn wide" id="tNewsX">Close</button>`);
  if (p) $("#tNewsX").onclick = () => p.remove();
}
