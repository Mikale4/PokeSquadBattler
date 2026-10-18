
// =====================================================================
//  META — Mail (Mystery Gifts), Medals, Trainer Card + Settings, and the title screen
// =====================================================================
const GAME_VER = "2.0.0";
const MAIL_DAYS = 30;            // gifts expire after this many days; claimed mail is cleared after the same time
const GIFT_MS = 3 * 3600000;     // a letter from someone in Kanto every few hours of real time
const DAY_MS = 864e5;

// ---------- mail ----------
function mailTo(s, m) {
  s.inbox = s.inbox || [];
  const mail = { id: ++s.mailSeq, t: Date.now(), from: m.from && m.from !== "@prof" ? m.from : profName(s), title: m.title, body: m.body || "", rewards: m.rewards || {},
    claimed: false, read: false, exp: m.noExp ? 0 : Date.now() + MAIL_DAYS * DAY_MS, tag: m.tag || "" };
  s.inbox.unshift(mail);
  return mail;
}
function sendMail(m, quiet) { const mail = mailTo(S, m); if (!quiet && featOn("mail")) toast(`New mail: ${m.title}`, "gold"); return mail; }   // (before Mail opens, it waits there quietly)
const hasRewards = m => Object.keys(m.rewards).length > 0;
const unclaimedMail = () => (S.inbox || []).filter(m => !m.claimed && hasRewards(m));
function purgeMail() {
  const now = Date.now();
  S.inbox = (S.inbox || []).filter(m => !(m.exp && now > m.exp) && !(m.claimed && now - m.t > MAIL_DAYS * DAY_MS)).slice(0, 120);
}
function claimMail(m) {
  if (!m || m.claimed || !hasRewards(m)) { if (m) m.read = true; return []; }
  m.claimed = true; m.read = true;
  return give(m.rewards);
}
// every new Trainer starts with a Safari Pass (10 free throws) and a Master Ball (a guaranteed random 5★)
function welcomeMail(s) {
  mailTo(s, { from: "Mystery Gift", tag: "welcome", noExp: 1, title: "Welcome to the world of Pokémon!",
    body: "A gift to start your journey: a Safari Pass for ten free throws in the Safari Zone, and a Master Ball, which always catches a random 5★ Pokémon. Use both in the Safari Zone.",
    rewards: { free10: 1, gold5: 1 } });
  s.welcome = 1;
}
const LOGIN_GIFTS = [{ orundum: 100 }, { lmd: 5000 }, { rec2: 4 }, { orundum: 150 }, { summ: 2, rare: 1 }, { held: "sitrusberry", lmd: 3000 }, { permit: 2 }];
function dailyLogin() {
  if (S.lastLogin === today()) return;
  S.lastLogin = today(); S.stats.loginDays++;
  const n = S.stats.loginDays, day = (n - 1) % 7;
  sendMail({ from: "Pokémon Center", tag: "login", title: `Daily Login · Day ${n}`,
    body: `Welcome back, Trainer! Here is your login gift for day ${day + 1} of 7${day === 6 ? ", the best one" : ""}. We hope to see you again tomorrow!`, rewards: LOGIN_GIFTS[day] });
}
const GIFTS = [
  { from: "Mom", title: "From home", body: "I saved some of your prize money for you, sweetie. Don't forget to change your underwear!", rewards: { lmd: 5000 } },
  { from: "@prof", title: "Research supplies", body: "Your Pokédex data has been a great help! Please take these for your Pokémon.", rewards: { rec2: 3, summ: 1 } },
  { from: "Bill", title: "From the PC", body: "Hiya! I found these lying around in the Storage System. They're all yours!", rewards: { orundum: 80, rec1: 4 } },
  { from: "Daisy", title: "A little something", body: "My brother Blue is so proud he won't say it, but he thinks you're a great rival. Here!", rewards: { rare: 1, lmd: 2000 } },
  { from: "Nurse Joy", title: "Pokémon Center", body: "We hope to see you again! Here's an Elixir for the road.", rewards: { prime: 1 } },
  { from: "Safari Zone Warden", title: "Free admission", body: "You returned my gold teeth! Come by the park any time. These are on the house.", rewards: { permit: 1 } },
  { from: "Celadon Dept. Store", title: "Loyalty reward", body: "Thank you for shopping with us! Please enjoy this complimentary item.", rewards: { held: "lumberry", lmd: 1500 } },
  { from: "Fan Club Chairman", title: "Let me tell you about my Rapidash", body: "Did I tell you about my Rapidash? It's so fast! Anyway, take this for listening.", rewards: { summ: 2 } },
  { from: "Mr. Fuji", title: "Thank you", body: "The Pokémon of Lavender Town rest peacefully thanks to you.", rewards: { orundum: 100 } },
  { from: "Game Corner", title: "Lucky coins", body: "A lucky Trainer like you deserves a few coins. Come try the Prize Corner!", rewards: { cert: 15 } },
];
function castGift() {
  if (Date.now() - S.lastGift < GIFT_MS || S.inbox.some(m => m.tag === "gift" && !m.claimed)) return;
  S.lastGift = Date.now();
  sendMail({ ...pick(GIFTS), tag: "gift" });
}
// a gift every five Trainer Levels
function rankGifts() {
  while (S.lvlGift + 5 <= S.lvl) {
    S.lvlGift += 5;
    const L2 = S.lvlGift;
    sendMail({ from: "Pokémon League", tag: "rank", title: `Trainer Level ${L2}`, body: `You reached Trainer Level ${L2}. Keep it up!`,
      rewards: L2 % 10 === 0 ? { orundum: 100 + L2 * 4, permit: 1 } : { orundum: 100 + L2 * 4 } });
  }
}
// Mew arrives as a Mystery Gift once Mewtwo is caught
function mewGift() {
  if (S.mewSent || !S.dex.caught.mewtwo) return;
  S.mewSent = 1;
  sendMail({ from: "Mystery Gift", tag: "welcome", noExp: 1, title: "Mystery Gift: Mew", body: "A Pokémon said to carry the genetic code of every Pokémon has been found under a truck near the S.S. Anne... Mew wants to join you!", rewards: { op: "mew" } });
}

// ---------- the Professor's help ----------
// Lose a Journey battle and that region's Professor writes, sorry the Journey has been so hard, with a starter of the region for free
// (the owner's rules, 2026-10-16): the two you didn't choose, one a loss, two at most in a region. After the first loss you choose one
// of the two; after another (once that one's claimed) the last one comes. At that battle's level cap, holding Berry Juice like every
// starter. You, the Demo (which tries every Journey battle before it plans around it: progress in a9g_demo.js) and the Trainers
// (trainerLoss in a6b_ladder.js) alike. (Saves from the first day of this kept S.rescued: one letter sent)
const RESCUE_LOSSES = 1, RESCUE_MAX = 2;
const chosenStarters = id => id === "kanto" ? [S.starter, (S.regions.kanto || {}).starter] : [(S.regions[id] || {}).starter, (S.regions[id] || {}).starter2];
const giftsIn = id => (S.gifts || {})[id] || [];
const rescueOptions = id => regionStarters(id).filter(k => !chosenStarters(id).includes(k) && !giftsIn(id).includes(k));
const rescueCount = id => !S ? 0 : (S.rescueN || {})[id] != null ? S.rescueN[id] : S.rescued && S.rescued[id] ? 1 : 0;
const rescued = id => rescueCount(id) > 0;
const rescuePending = id => (S.inbox || []).some(m => m.tag === "rescue" && !m.claimed && m.rewards.pick === id);
function journeyLoss(nd) {
  const rid = nd.ep.id; S.lossRun = S.lossRun || {};
  const n = S.lossRun[nd.id] = (S.lossRun[nd.id] || 0) + 1, c = rescueCount(rid), opts = rescueOptions(rid);
  if (n < RESCUE_LOSSES || c >= RESCUE_MAX || rescuePending(rid) || !opts.length) return null;
  S.rescueN = S.rescueN || {}; S.rescueN[rid] = c + 1;
  const r = regionCard(rid), who = nd.trainer ? nd.trainer.name : `the wild Pokémon of ${nd.name}`, lv = stageCap(nd), last = opts.length === 1;
  return sendMail({ from: r.prof[0], tag: "rescue", noExp: 1, title: last ? "One more partner for you" : "A new partner for you",
    body: last ? `I heard ${who} gave you a hard time again. Please take ${OPS[opts[0]].n} too, the last of ${r.n}'s first partners. It will join you right away, at Lv ${lv}, holding Berry Juice.`
      : `I heard ${who} gave you a hard time. I'm sorry your ${r.n} Journey has been so difficult. Let me help: please choose ${opts.map(k => OPS[k].n).join(" or ")}, the first partners you didn't pick. It will join you right away, at Lv ${lv}, holding Berry Juice.`,
    rewards: { pick: rid, lv } });
}
const journeyWin = nd => { if (S.lossRun) delete S.lossRun[nd.id]; };   // (a win ends the run of losses)
function rescueModal(m) {
  const id = m.rewards.pick, r = regionCard(id), opts = rescueOptions(id);
  openModal(`<div class="stack" style="text-align:center;align-items:center">
    <img class="px" src="${profURL(r)}" alt="" style="width:88px;height:88px;object-fit:contain">
    <div class="eyebrow">${esc(r.prof[0])} · ${esc(r.n)}</div><h2>${opts.length === 1 ? "One more partner" : "Choose a new partner"}</h2>
    <p class="small dim">${opts.length === 1 ? `The last of ${esc(r.n)}'s first partners.` : `The first partners you didn't pick.`} It joins you at Lv ${m.rewards.lv || 5}, holding Berry Juice.</p>
    <div class="starters">${opts.map(k => `<button class="starter" data-act="pickRescue" data-id="${m.id}" data-k="${k}" style="--tc:${TC[OPS[k].types[0]]}"><img class="px" src="${sprFull(k)}" alt=""><b>${OPS[k].n}</b><span class="row" style="gap:3px;justify-content:center">${typeChips(OPS[k].types)}</span></button>`).join("")}</div>
    <button class="btn ghost wide" data-act="closeModal">Not yet</button>
  </div>`);
}

// ---------- Medals ----------
const tier = (goal, reward) => [goal, reward];
const ownedKeys = () => Object.keys(S.ops);
const ACH_CATS = ["Journey", "Pokédex", "Training", "Battle", "Stadium", "Clubs", "Safari", "Login"];
const ACH = [
  ...BADGES.map((b, i) => ({ id: "badge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at the ${b.gym}`, v: () => S.badges > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 7 ? 3 : 0 })] })),
  { id: "champ", cat: "Journey", n: "Champion", d: () => "Become the Pokémon League Champion", v: () => S.champion ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Johto's: jbadge0-7, the Johto Champion)
  ...JOHTO_BADGES.map((b, i) => ({ id: "jbadge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at the ${b.gym}`, v: () => badgesIn("johto") > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 7 ? 3 : 0 })] })),
  { id: "jchamp", cat: "Journey", n: "Johto Champion", d: () => "Beat Champion Lance at the Indigo Plateau, in your Johto Journey", v: () => regionChamp("johto") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Hoenn's: hbadge0-7, the Hoenn Champion)
  ...HOENN_BADGES.map((b, i) => ({ id: "hbadge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at the ${b.gym}`, v: () => badgesIn("hoenn") > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 7 ? 3 : 0 })] })),
  { id: "hchamp", cat: "Journey", n: "Hoenn Champion", d: () => "Beat Champion Wallace at the Pokémon League in Ever Grande City, in your Hoenn Journey", v: () => regionChamp("hoenn") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Sinnoh's: sbadge0-7, the Sinnoh Champion)
  ...SINNOH_BADGES.map((b, i) => ({ id: "sbadge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at the ${b.gym}`, v: () => badgesIn("sinnoh") > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 7 ? 3 : 0 })] })),
  { id: "schamp", cat: "Journey", n: "Sinnoh Champion", d: () => "Beat Champion Cynthia at the Pokémon League, in your Sinnoh Journey", v: () => regionChamp("sinnoh") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Unova's: ubadge0-15, Part 1's eight Badges then Part 2's; Part 1 complete; the Unova Champion, Part 2's Iris)
  ...[...UNOVA_BADGES, ...UNOVA2_BADGES].map((b, i) => ({ id: "ubadge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at the ${b.gym}, in Part ${i < 8 ? 1 : 2} of your Unova Journey`,
    v: () => partBadges("unova", i < 8 ? 1 : 2) > i % 8 ? 1 : 0, tiers: [tier(1, { orundum: 200 + (i % 8) * 50, permit: i % 8 === 7 ? 3 : 0 })] })),
  { id: "upart1", cat: "Journey", n: "Two Years Ago", d: () => `Complete Part 1 of your Unova Journey, ${PART_NAME.unova ? PART_NAME.unova[0] : "Black/White"}'s story`, v: () => !!S && regionPart("unova") > 1 ? 1 : 0, tiers: [tier(1, { orundum: 800, permit: 3 })] },
  { id: "uchamp", cat: "Journey", n: "Unova Champion", d: () => "Beat Champion Iris at the Pokémon League, in Part 2 of your Unova Journey", v: () => regionChamp("unova") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Kalos's: kbadge0-7, the Kalos Champion)
  ...KALOS_BADGES.map((b, i) => ({ id: "kbadge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at the ${b.gym}`, v: () => badgesIn("kalos") > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 7 ? 3 : 0 })] })),
  { id: "kchamp", cat: "Journey", n: "Kalos Champion", d: () => "Beat Champion Diantha at the Pokémon League, in your Kalos Journey", v: () => regionChamp("kalos") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Alola's: abadge0-11, a stamp for each trial and grand trial, and the Alola Champion)
  ...ALOLA_BADGES.map((b, i) => ({ id: "abadge" + i, cat: "Journey", n: b.n, d: () => `Clear ${b.trial} at ${b.gym}`, v: () => badgesIn("alola") > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + Math.floor(i * 2 / 3) * 50, permit: i === 11 ? 3 : 0 })] })),
  { id: "achamp", cat: "Journey", n: "Alola Champion", d: () => "Win the first Champion battle of the Alola League, in your Alola Journey", v: () => regionChamp("alola") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Galar's: gbadge0-7, Sword's eight Gyms, and the Galar Champion)
  ...GALAR_BADGES.map((b, i) => ({ id: "gbadge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at ${b.gym}, in your Galar Journey`, v: () => badgesIn("galar") > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 7 ? 3 : 0 })] })),
  { id: "gchamp", cat: "Journey", n: "Galar Champion", d: () => "Beat Champion Leon in Wyndon Stadium, in your Galar Journey", v: () => regionChamp("galar") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] },
  // (Paldea's: pbadge0-7, Victory Road's eight Gyms; a Medal for each Titan and each Team Star base, Arven's Titan Badges and the squads'
  // Star Badges, which the Badge case leaves out (the owner's pick, 2026-10-16: only the eight Gym Badges count); the Paldea Champion)
  ...(typeof PALDEA_BADGES === "object" ? [
    ...PALDEA_BADGES.map((b, i) => ({ id: "pbadge" + i, cat: "Journey", n: b.n, d: () => `Defeat ${b.leader} at ${b.gym}, in your Paldea Journey`, v: () => badgesIn("paldea") > i ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 7 ? 3 : 0 })] })),
    ...PALDEA_TITANS.map((t, i) => ({ id: "ptitan" + i, cat: "Journey", n: t.n, d: () => `Defeat ${t.titan} with Arven, in your Paldea Journey (Arven's Titan Badge)`, v: () => paldeaMark("titanWin", i) ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 4 ? 2 : 0 })] })),
    ...PALDEA_STARS.map((t, i) => ({ id: "pstar" + i, cat: "Journey", n: t.n, d: () => `Defeat ${t.boss} at ${t.base}, in your Paldea Journey (a Star Badge)`, v: () => paldeaMark("starWin", i) ? 1 : 0, tiers: [tier(1, { orundum: 200 + i * 50, permit: i === 4 ? 2 : 0 })] })),
    { id: "pchamp", cat: "Journey", n: "Paldea Champion", d: () => "Beat Top Champion Geeta at the Pokémon League, in your Paldea Journey", v: () => regionChamp("paldea") ? 1 : 0, tiers: [tier(1, { orundum: 1000, permit: 5 })] }] : []),
  { id: "stages", cat: "Journey", n: "Pathfinder", d: g => `Clear ${g} Journey stages`, v: () => Object.keys(S.story).filter(k => NODES[k] && S.story[k] > 0).length,
    tiers: [tier(5, { orundum: 100 }), tier(20, { orundum: 200 }), tier(50, { orundum: 400, permit: 1 })] },
  { id: "stars", cat: "Journey", n: "Ace Trainer", d: g => `Earn 3 stars on ${g} battles`, v: () => Object.keys(S.story).filter(k => NODES[k] && S.story[k] >= 3).length,
    tiers: [tier(5, { orundum: 100 }), tier(20, { orundum: 250 }), tier(50, { orundum: 500, permit: 2 })] },
  { id: "caught", cat: "Pokédex", n: "Pokédex", d: g => `Catch ${g} different Pokémon`, v: () => dexCaught(),
    tiers: [tier(10, { orundum: 150 }), tier(30, { orundum: 300 }), tier(60, { orundum: 500, permit: 1 }), tier(100, { orundum: 800, permit: 2 }), tier(151, { orundum: 1500, permit: 5 }), tier(250, { orundum: 2000, permit: 5 }),
      tier(400, { orundum: 2500, permit: 8 }), tier(550, { orundum: 3000, permit: 10 }), tier(DEX_N, { orundum: 5000, permit: 15 })] },
  { id: "seen", cat: "Pokédex", n: "Pokémon Watcher", d: g => `See ${g} different Pokémon`, v: () => dexSeen(), tiers: [tier(25, { orundum: 100 }), tier(75, { orundum: 250 }), tier(151, { orundum: 500 }), tier(300, { orundum: 800 }), tier(DEX_N, { orundum: 1200 })] },
  { id: "legend", cat: "Pokédex", n: "Legendary", d: g => `Catch ${g} Legendary or Mythical Pokémon`, v: () => LEGENDS.filter(k => S.dex.caught[k]).length,
    tiers: [tier(1, { orundum: 300 }), tier(3, { orundum: 600, permit: 2 }), tier(5, { orundum: 1000, permit: 3 }), tier(15, { orundum: 1500, permit: 5 }),
      tier(30, { orundum: 2500, permit: 8 }), tier(LEGENDS.length, { orundum: 5000, permit: 15 })] },
  { id: "fives", cat: "Pokédex", n: "Rare Finds", d: g => `Own ${g} 5★ Pokémon`, v: () => ownedKeys().filter(k => OPS[k].rar === 5).length,
    tiers: [tier(1, { orundum: 200 }), tier(5, { orundum: 400, permit: 1 }), tier(15, { orundum: 800, permit: 2 }), tier(30, { orundum: 1500, permit: 4 })] },
  { id: "types", cat: "Pokédex", n: "Type Collector", d: g => `Own Pokémon of ${g} different types`, v: () => new Set(ownedKeys().flatMap(k => OPS[k].types)).size,
    tiers: [tier(5, { orundum: 150 }), tier(10, { orundum: 300 }), tier(15, { orundum: 600, permit: 1 })] },
  { id: "evos", cat: "Training", n: "Evolution", d: g => `Evolve Pokémon ${g} times`, v: () => S.stats.evolutions,
    tiers: [tier(1, { orundum: 100 }), tier(10, { orundum: 300, rare: 2 }), tier(40, { orundum: 600, permit: 1 })] },
  { id: "lv", cat: "Training", n: "Level Up", d: g => `Raise a Pokémon to Lv ${g}`, v: () => Math.max(0, ...Object.values(S.ops).map(p => p.lvl)),
    tiers: [tier(20, { orundum: 100 }), tier(40, { orundum: 250 }), tier(60, { orundum: 500, permit: 1 }), tier(100, { orundum: 1500, permit: 3 })] },
  { id: "mastery", cat: "Training", n: "Move Master", d: g => `Master ${g} move${g > 1 ? "s" : ""} (Mastery ★)`, v: () => Object.values(S.ops).reduce((a, p) => a + p.sk.filter(r => r >= MAX_SK).length, 0),
    tiers: [tier(1, { orundum: 200, summ: 2 }), tier(5, { orundum: 400, summ: 4 }), tier(20, { orundum: 800, permit: 2 })] },
  { id: "ivs", cat: "Training", n: "Perfect IVs", d: g => `Max the IVs of ${g} Pokémon`, v: () => Object.values(S.ops).filter(p => p.pot >= 6).length,
    tiers: [tier(1, { orundum: 500, permit: 1 }), tier(5, { orundum: 1000, permit: 3 })] },
  { id: "plv", cat: "Training", n: "Veteran Trainer", d: g => `Reach Trainer Level ${g}`, v: () => S.lvl,
    tiers: [tier(10, { orundum: 200 }), tier(20, { orundum: 400, permit: 1 }), tier(40, { orundum: 800, permit: 2 }), tier(60, { orundum: 1200, permit: 3 })] },
  { id: "wins", cat: "Battle", n: "Battle Girl", d: g => `Win ${g} battles`, v: () => S.stats.wins,
    tiers: [tier(10, { orundum: 100 }), tier(50, { orundum: 300 }), tier(200, { orundum: 600, permit: 1 }), tier(1000, { orundum: 1500, permit: 3 })] },
  { id: "superEff", cat: "Battle", n: "Type Expert", d: g => `Land ${g} super-effective hits`, v: () => S.stats.superEff,
    tiers: [tier(25, { orundum: 100 }), tier(250, { orundum: 300 }), tier(2000, { orundum: 800, permit: 1 })] },
  { id: "kills", cat: "Battle", n: "Knockout Artist", d: g => `Knock out ${g} opposing Pokémon`, v: () => S.stats.kills,
    tiers: [tier(100, { orundum: 100 }), tier(1000, { orundum: 300 }), tier(5000, { orundum: 800, permit: 1 })] },
  { id: "flawless", cat: "Battle", n: "Untouchable", d: g => `Win ${g} battles without a Pokémon fainting`, v: () => S.stats.flawless,
    tiers: [tier(10, { orundum: 150 }), tier(50, { orundum: 400 }), tier(200, { orundum: 800, permit: 2 })] },
  { id: "tower", cat: "Battle", n: "Battle Tower", d: g => `Clear ${g} Battle Tower floors, in any wing`, v: () => S.tower,
    tiers: [tier(10, { orundum: 150 }), tier(25, { orundum: 300, permit: 1 }), tier(50, { orundum: 500, permit: 2 }), tier(100, { orundum: 1000, permit: 3 }), tier(200, { orundum: 1500, permit: 5 })] },
  // (a wing's own: a quarter, half, then all of its floors)
  ...towerWings().map(id => { const N = towerFloors(id).length, W = `the Battle Tower's ${REGION_NAME[id]} Wing`;
    return { id: "tower_" + id, cat: "Battle", n: `${REGION_NAME[id]} Wing`, d: g => g >= N ? `Conquer ${W}` : `Clear ${g} floors of ${W}`, v: () => towerDone(id),
      tiers: [tier(Math.ceil(N / 4), { orundum: 200 }), tier(Math.ceil(N / 2), { orundum: 400, permit: 1 }), tier(N, { orundum: 1000, permit: 3 })] }; }),
  { id: "link", cat: "Battle", n: "Stadium Star", d: g => `Win ${g} Ranked or Link Battles`, v: () => S.stats.versus,
    tiers: [tier(5, { tokens: 100 }), tier(25, { tokens: 300, orundum: 200 }), tier(100, { tokens: 600, permit: 2 })] },
  { id: "explore", cat: "Battle", n: "Explorer", d: g => `Clear ${g} Explore battles`, v: () => S.stats.patrols,
    tiers: [tier(10, { lmd: 10000 }), tier(50, { orundum: 300, rare: 2 }), tier(200, { orundum: 600, linkcord: 2 })] },
  // Battle Stadium (a9f_stadium.js): the best tier reached in each ladder (tier index 1 = Poké Ball ... 7 = Legend)
  { id: "ranked", cat: "Stadium", n: "Ranked Climber", d: g => `Reach the ${TIERS[g].n} tier in Ranked Battles`, v: () => tierIdx(S.ladder.best),
    tiers: [tier(1, { tokens: 100 }), tier(2, { tokens: 200, orundum: 100 }), tier(3, { tokens: 300, orundum: 200 }), tier(4, { tokens: 400, permit: 1 }), tier(5, { tokens: 500, permit: 2 }), tier(6, { tokens: 650, permit: 3 }), tier(7, { tokens: 800, permit: 5 })] },
  { id: "linked", cat: "Stadium", n: "Draft Master", d: g => `Reach the ${TIERS[g].n} tier in Link Battles`, v: () => tierIdx(S.rta.best),
    tiers: [tier(1, { tokens: 100 }), tier(2, { tokens: 200, orundum: 100 }), tier(3, { tokens: 300, orundum: 200 }), tier(4, { tokens: 400, permit: 1 }), tier(5, { tokens: 500, permit: 2 }), tier(6, { tokens: 650, permit: 3 }), tier(7, { tokens: 800, permit: 5 })] },
  { id: "defended", cat: "Stadium", n: "Iron Wall", d: g => `Your Registered Team wins ${g} battles while you're away`, v: () => S.stats.defWins || 0,
    tiers: [tier(1, { tokens: 50 }), tier(10, { tokens: 200 }), tier(25, { tokens: 400, permit: 1 })] },
  // Clubs and the Union Room (a6e_people.js)
  { id: "chats", cat: "Clubs", n: "Union Room Regular", d: g => `Send ${g} message${g > 1 ? "s" : ""} in the Union Room, Club chat or Messages`, v: () => S.stats.chats || 0,
    tiers: [tier(1, { orundum: 50 }), tier(25, { orundum: 150 }), tier(100, { orundum: 300, permit: 1 })] },
  { id: "club", cat: "Clubs", n: "Club Member", d: () => "Join or start a Club", v: () => S.guild || S.stats.guilds ? 1 : 0, tiers: [tier(1, { orundum: 200, lmd: 5000 })] },
  { id: "donations", cat: "Clubs", n: "Team Player", d: g => `Contribute to your Club ${g} times`, v: () => S.stats.donations || 0,
    tiers: [tier(1, { cert: 20 }), tier(10, { cert: 60, orundum: 200 }), tier(50, { cert: 150, permit: 2 })] },
  { id: "raids", cat: "Clubs", n: "Raid Battler", d: g => `Join ${g} Raid Battles`, v: () => S.stats.bossHits || 0,
    tiers: [tier(1, { orundum: 100 }), tier(10, { orundum: 300, rare: 2 }), tier(50, { orundum: 800, permit: 2 })] },
  { id: "raidDmg", cat: "Clubs", n: "Raid Heavy Hitter", d: g => `Deal ${fmtFull(g)} damage in Raid Battles`, v: () => S.stats.bossDmg || 0,
    tiers: [tier(5000, { orundum: 150 }), tier(50000, { orundum: 400, summ: 3 }), tier(500000, { orundum: 1000, permit: 3 })] },
  { id: "recruits", cat: "Clubs", n: "Recruiter", d: g => `Bring ${g} Trainers into your Club`, v: () => S.stats.recruits || 0,
    tiers: [tier(1, { orundum: 100 }), tier(10, { orundum: 400, permit: 1 })] },
  { id: "pulls", cat: "Safari", n: "Safari Regular", d: g => `Throw ${g} Safari Balls`, v: () => S.gacha.total,
    tiers: [tier(10, { orundum: 100 }), tier(50, { orundum: 300, permit: 1 }), tier(100, { orundum: 500, permit: 2 }), tier(300, { orundum: 1000, permit: 3 })] },
  { id: "luck", cat: "Safari", n: "Lucky Catch", d: g => `Catch ${g} 5★ Pokémon in the Safari Zone`, v: () => S.stats.fives,
    tiers: [tier(1, { orundum: 150 }), tier(5, { orundum: 400, permit: 1 }), tier(20, { orundum: 1000, permit: 3 })] },
  { id: "login", cat: "Login", n: "Daily Trainer", d: g => `Log in on ${g} days`, v: () => S.stats.loginDays,
    tiers: [tier(3, { orundum: 100 }), tier(7, { orundum: 300, permit: 1 }), tier(30, { orundum: 800, permit: 2 }), tier(100, { orundum: 1500, permit: 5 })] },
];
for (const a of ACH) for (const t of a.tiers) for (const k in t[1]) if (!t[1][k]) delete t[1][k];
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
// Medal pictures: Black 2/White 2's Medals (resources/medals, tools/pack_medals.py), six colours of 28 designs. Each Medal has its
// own design ([row, column] in a colour's four rows: Poké Balls and hearts, winged ones, gears and crowns, stars); its colour is
// how far it's got: bronze for the first tier, then silver, gold, blue, red and pink (a one-tier Medal is gold), greyed out
// until it's earned.
const MEDAL_DESIGN = { champ: [1, 3], stages: [3, 0], stars: [3, 2], caught: [0, 0], seen: [0, 1], legend: [2, 7], fives: [3, 4], types: [3, 5], evos: [2, 2],
  lv: [2, 0], mastery: [2, 1], ivs: [2, 3], plv: [1, 1], wins: [1, 0], superEff: [0, 2], kills: [0, 3], flawless: [3, 3], tower: [2, 4], link: [2, 5], explore: [3, 1],
  ranked: [2, 6], linked: [3, 6], defended: [0, 4], chats: [0, 5], club: [1, 2], donations: [0, 6], raids: [0, 7], raidDmg: [0, 3], recruits: [0, 6], pulls: [0, 0],
  luck: [3, 4], login: [3, 0] };
const MEDAL_TIER_COL = [0, 5, 4, 1, 2, 3, 3];   // the sheet's colours: 0 bronze, 1 blue, 2 red, 3 pink, 4 gold, 5 silver
const medalHTML = (col, row, c, size = 32, off = false) => `<i class="medal${off ? " off" : ""}" style="--ms:${size}px;--mx:${c};--my:${col * 4 + row}"></i>`;
function achMedal(a, size) {
  const [row, c] = MEDAL_DESIGN[a.id] || [3, 7], i = S.achv[a.id] || 0;
  return medalHTML(a.tiers.length === 1 ? 4 : MEDAL_TIER_COL[Math.max(0, i - 1)], row, c, size, i === 0);
}
(() => { if (RES_DATA.medals) { const st = document.createElement("style"); st.textContent = `:root{--medals:url(${resPng(RES_DATA.medals)})}`; document.head.appendChild(st); } })();
const achTierName = (a, i) => a.tiers.length > 1 ? `${a.n} ${ROMAN[i + 1]}` : a.n;
const achDone = () => ACH.reduce((n, a) => n + (S.achv[a.id] || 0), 0);
const achTotal = ACH.reduce((n, a) => n + a.tiers.length, 0);
function checkAchievements(silent) {
  const got = [];
  for (const a of ACH) {
    let i = S.achv[a.id] || 0;
    const v = a.v();
    while (i < a.tiers.length && v >= a.tiers[i][0]) {
      if (!silent) mailTo(S, { from: "Pokémon League", tag: "ach", title: `Medal: ${achTierName(a, i)}`, body: `${a.d(a.tiers[i][0])}. Your reward is attached.`, rewards: a.tiers[i][1] });
      got.push(achTierName(a, i)); i++;
    }
    S.achv[a.id] = i;
  }
  if (got.length && !silent && featOn("medals")) { toast(`Medal earned: ${got[0]}${got.length > 1 ? ` (+${got.length - 1} more)` : ""}. Reward sent to your Mail.`, "gold"); sfx("heal"); }
  return got;
}
function recordBattle(res, B) {
  live("battle"); if (res.win) live("win");
  S.stats.kills += B.tally.kills; S.stats.superEff += B.tally.superEff; S.daily.rune = (S.daily.rune || 0) + B.tally.superEff;
  if (res.win && !res.lost) S.stats.flawless++;
}
function metaTick() {
  if (!UI.inGame || BT.on) return;
  purgeMail(); dailyLogin(); rankGifts(); castGift(); mewGift(); areaMail(); checkAchievements(); featCheck(); featPopup();
}

// ---------- screens: mail ----------
const SENDER_SPR = { "Prof. Oak": "oak", Bill: "bill", Daisy: "daisy", "Nurse Joy": "nurse", "Pokémon Center": "nurse", "Mr. Fuji": "mrfuji", "Celadon Dept. Store": "martclerk",
  "Safari Zone Warden": "gentleman", "Fan Club Chairman": "gentleman", "Game Corner": "gamer" };
// (every region's Professor writes with their own picture)
for (const r of [REGION_KANTO, ...REGIONS_SOON]) SENDER_SPR[r.prof[0]] = r.id === "kanto" ? "oak" : "rg_" + r.prof[1];
const mailIcon = m => SENDER_SPR[m.from] ? `<img class="px" src="${trainerURL(SENDER_SPR[m.from])}" alt="">` : ({ welcome: IC.greet, gift: IC.gift, login: IC.pokeball, ach: medalHTML(4, 1, 3, 28), rank: IC.star }[m.tag] || IC.letter);
const ago = t => { const d = Math.floor((Date.now() - t) / DAY_MS); return d < 1 ? "Today" : d === 1 ? "Yesterday" : d + " days ago"; };
const rewardChips = r => Object.entries(r).filter(([k]) => k !== "lv").map(([k, n]) => k === "pick" ? `<span class="cost">${rescueOptions(n).map(x => `<img class="px" src="${sprFront(x)}" alt="" style="width:18px;height:18px">`).join("")}A partner of your choice</span>` : k === "op" ? `<span class="cost"><img class="px" src="${sprFront(n)}" alt="" style="width:18px;height:18px">${esc(OPS[n].n)}</span>` : k === "held" ? `<span class="cost">${heldIcon(n)}${esc(HELD[n].n)}</span>` : `<span class="cost">${itemIcon(k)}${fmt(n)}</span>`).join(" ");
const mailRewardList = r => Object.entries(r).map(([k, n]) => k === "op" ? { k: "op:" + n, n: 1 } : k === "held" ? { k: "held:" + n, n: 1 } : { k, n });
SCREENS.inbox = () => {
  purgeMail();
  const list = S.inbox, open = unclaimedMail().filter(m => !m.rewards.pick).length;   // (a Professor's partner is chosen from its letter)
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="eyebrow">Mail</span></div>
    <div class="spread"><h2>Mail</h2><button class="btn sm" data-act="claimAllMail" ${open ? "" : "disabled"}>Claim all${open ? ` · ${open}` : ""}</button></div>
    <p class="small dim">Mystery Gifts, login gifts, Medal rewards and letters arrive here. Gifts expire after ${MAIL_DAYS} days.</p>
    ${list.length ? list.map(m => `<button class="mailrow ${m.read && (m.claimed || !hasRewards(m)) ? "done" : ""}" data-act="openMail" data-id="${m.id}">
      <span class="mi">${mailIcon(m)}</span>
      <span class="mt"><b>${esc(m.title)}</b><span class="tiny dim">${esc(m.from)} · ${ago(m.t)}${m.exp && !m.claimed ? ` · expires in ${Math.max(1, Math.ceil((m.exp - Date.now()) / DAY_MS))}d` : ""}</span>
        ${hasRewards(m) ? `<span class="row tiny" style="gap:6px">${rewardChips(m.rewards)}</span>` : ""}</span>
      <span class="ms">${m.claimed ? IC.check : hasRewards(m) || !m.read ? '<i class="dot" style="position:static"></i>' : ""}</span>
    </button>`).join("") : '<p class="small dim">No mail right now.</p>'}
    ${list.some(m => m.claimed || (m.read && !hasRewards(m))) ? `<button class="btn ghost wide" data-act="clearMail">Delete read and claimed mail</button>` : ""}
  </div>`;
};
function mailModal(m) {
  m.read = true;
  openModal(`<div class="stack"><div class="row" style="gap:10px"><span class="mi">${mailIcon(m)}</span><div><div class="eyebrow">${esc(m.from)} · ${ago(m.t)}</div><h2 style="font-size:20px">${esc(m.title)}</h2></div></div>
    <p class="small" style="line-height:1.5">${esc(m.body)}</p>
    ${hasRewards(m) ? m.rewards.pick ? `<div class="row" style="gap:4px;justify-content:center">${(m.claimed ? [] : rescueOptions(m.rewards.pick)).map(k => `<img class="px" src="${sprFront(k)}" alt="" style="width:56px;height:56px">`).join("")}</div>` : `<div class="rewards">${rewardsHTML(mailRewardList(m.rewards))}</div>` : ""}
    ${hasRewards(m) && !m.claimed ? `<button class="btn wide" data-act="claimMail" data-id="${m.id}">${m.rewards.pick ? "Choose your partner" : "Claim"}</button>` : `<button class="btn ghost wide" data-act="closeMail">${m.claimed ? "Claimed" : "Close"}</button>`}
  </div>`);
  save();
}

// ---------- screens: Medals ----------
SCREENS.ach = () => {
  checkAchievements();
  S.achSeen = achDone();
  const cat = UI.achCat || "All", list = ACH.filter(a => cat === "All" || a.cat === cat);
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="eyebrow">Medals</span></div>
    <h2>Medals</h2>
    <section class="panel stack" style="gap:6px"><div class="spread small"><span>Earned</span><b class="num">${achDone()} / ${achTotal}</b></div>
      <div class="bar"><i style="width:${achDone() / achTotal * 100}%"></i></div><p class="tiny dim">Every Medal sends its reward to your Mail.</p></section>
    <div class="filters">${["All", ...ACH_CATS].map(c => `<button class="chip ${cat === c ? "on" : ""}" data-act="achCat" data-c="${c}">${c}</button>`).join("")}</div>
    ${list.map(a => {
      const i = S.achv[a.id] || 0, full = i >= a.tiers.length, t = a.tiers[Math.min(i, a.tiers.length - 1)], v = a.v();
      const bm = /^([jhsukap]?)badge(\d+)$/.exec(a.id), bi = bm ? (bm[1] === "a" ? +bm[2] : +bm[2] % 8) : -1, bl = bm ? { "": BADGES, j: JOHTO_BADGES, h: HOENN_BADGES, s: SINNOH_BADGES, u: +bm[2] < 8 ? UNOVA_BADGES : UNOVA2_BADGES, k: KALOS_BADGES, a: ALOLA_BADGES, p: typeof PALDEA_BADGES === "object" ? PALDEA_BADGES : BADGES }[bm[1]] : BADGES;
      return `<div class="achrow ${full ? "full" : ""}"><span class="ai">${bi >= 0 ? badgeSVG(bi, full, bl) : achMedal(a, 34)}</span>
        <div class="stack" style="gap:4px;min-width:0;flex:1"><div class="spread"><b class="small">${esc(achTierName(a, Math.min(i, a.tiers.length - 1)))}</b>
          <span class="pipsA">${a.tiers.map((_, k) => `<i class="${k < i ? "on" : ""}"></i>`).join("")}</span></div>
          <span class="tiny dim">${esc(a.d(t[0]))}</span>
          ${full ? `<span class="tiny good">Earned</span>` : `<div class="bar"><i style="width:${Math.min(100, v / t[0] * 100)}%"></i></div>
          <div class="spread tiny"><span class="num">${fmt(Math.min(v, t[0]))} / ${fmt(t[0])}</span><span class="row" style="gap:6px">${rewardChips(t[1])}</span></div>`}
        </div></div>`;
    }).join("")}
  </div>`;
};

// ---------- screens: Trainer Card + settings ----------
// ---------- the Trainer Card, FireRed/LeafGreen style (the owner's kit, cleaned and recoloured by tools/pack_card.py) ----------
// Stars as in FireRed/LeafGreen, the first for entering the Hall of Fame; once Champion, one each for a complete Pokédex, the Battle
// Tower's top floor and Legend rank in Ranked or Link Battles. The card turns green, bronze, silver and gold with them.
function cardStars() {
  if (!champRegions().length) return 0;
  return 1 + (dexCaught() >= DEX_N) + towerConquered() + (tierOf(S.ladder.pts).n === "Legend" || tierOf(S.rta.pts).n === "Legend");
}
const playClock = (ms, secs) => { const t = Math.floor((ms || 0) / 1000), m = Math.floor(t / 60) % 60; return Math.floor(t / 3600) + ":" + String(m).padStart(2, "0") + (secs ? ":" + String(t % 60).padStart(2, "0") : ""); };
function trainerCardHTML() {
  const k = cardStars(), pic = n => resPng(RES_DATA.card[n]);
  // positions are the card's own pixels (228 x 148)
  const L = (x, y, h) => `<span class="tct" style="left:${x / 2.28}%;top:${y / 1.48}%">${h}</span>`;
  const Rt = (x, y, h) => `<span class="tct" style="right:${(228 - x) / 2.28}%;top:${y / 1.48}%">${h}</span>`;
  const box = (x, y, w, h, inner) => `<span class="tcb" style="left:${x / 2.28}%;top:${y / 1.48}%;width:${w / 2.28}%;height:${h / 1.48}%">${inner}</span>`;
  const rows = [["HALL OF FAME DEBUT", hofDebut() != null ? playClock(hofDebut(), true) : "--:--:--"],
    ["RANKED BATTLES", `W: ${S.ladder.wins || 0}  L: ${S.ladder.losses || 0}`], ["LINK BATTLES", `W: ${S.rta.wins || 0}  L: ${S.rta.losses || 0}`],
    ["BATTLE TOWER FLOORS", String(S.tower || 0)], ["BATTLES WON", String(S.stats.wins || 0)]];
  const party = (S.team.story && S.team.story.length ? S.team.story : byPower()).filter(x => S.ops[x]).slice(0, 6);
  return `<div class="tcard2" data-act="flipCard" role="button" tabindex="0" aria-label="Trainer Card: tap to turn it over">
    <div class="tc-in${UI.cardBack ? " flip" : ""}">
      <div class="tc-face" style="background-image:url(${pic("front" + k)})">
        <span class="tct tcid" style="left:${130 / 2.28}%;width:${88 / 2.28}%;top:${13 / 1.48}%">IDNo.${esc(S.playerId)}</span>
        ${L(22, 34, "NAME: " + esc(S.name))}${S.title ? L(22, 46, `<small>${esc(S.title)}</small>`) : ""}
        ${L(22, 59, "MONEY")}${Rt(138, 59, "₽" + S.lmd)}
        ${L(22, 76, "POKéDEX")}${Rt(138, 76, String(dexCaught()))}
        ${L(22, 92, "TIME")}${Rt(138, 92, playClock(S.playMs))}
        ${box(146, 34, 80, 80, `<img class="px" src="${trainerURL(avatar())}" alt="">`)}
        ${firstRegion() === "kanto" || !REGION_BADGES[firstRegion()] ? BADGES.map((b, i) => i < S.badges ? box(26 + 24 * i, 122, 16, 16, badgePic(b) ? `<img src="${resPng(badgePic(b))}" alt="${b.n}" title="${b.n}">` : `<img class="px" src="${pic("badge" + (i + 1))}" alt="${b.n}" title="${b.n}">`) : "").join("")
          : regionBadges(firstRegion()).map((b, i) => i < badgesIn(firstRegion()) ? box(26 + 24 * i, 122, 16, 16, badgeSVG(i, true, regionBadges(firstRegion()))) : "").join("")}
      </div>
      <div class="tc-face tc-back" style="background-image:url(${pic("back" + k)})">
        ${L(140, 15, esc(S.name))}
        ${rows.map(([n, v], i) => L(14, 41 + 16 * i, n) + Rt(214, 41 + 16 * i, v)).join("")}
        ${party.map((p, i) => box(20.5 + 32 * i, 118, 26, 26, `<img class="px" src="${sprFront(p)}" alt="${esc(OPS[p].n)}">`)).join("")}
      </div>
    </div>
  </div>`;
}
const MUSIC_LEVELS = [[0, "Off"], [.3, "Low"], [.55, "Medium"], [.8, "High"]];
const chipRow = (act, cur, opts, tips) => `<div class="filters">${opts.map(([v, n]) => `<button class="chip ${String(cur) === String(v) ? "on" : ""}" data-act="${act}" data-v="${v}"${tips && tips[v] ? ` data-tip="${esc(tips[v])}"` : ""}>${n}</button>`).join("")}</div>`;
SCREENS.settings = () => {
  const st = S.settings;
  return `<div class="stack">
    <div class="spread">${back("go", "Home", 'data-v="home"')}<span class="eyebrow">Trainer Card</span></div>
    ${RES_DATA.card && RES_DATA.card.front0 ? trainerCardHTML() : ""}
    <section class="panel tcard">
      <p class="tiny dim">Tap the card to turn it over. Trainer Level <b>${S.lvl}</b> · Medals <b>${achDone()}/${achTotal}</b> · started ${new Date(S.created).toLocaleDateString()}.
        Stars: entering the Hall of Fame, then a complete Pokédex, the Battle Tower's top floor and Legend rank.</p>
      ${Object.keys(REGION_BADGES).filter(id => id === firstRegion() || badgesIn(id)).map(id => `<div class="tiny dim" style="margin-top:6px">${REGION_NAME[id]}</div>${badgeCase(id)}`).join("")}
      <p class="tiny dim" style="margin-top:4px">Each Gym Badge gives your Pokémon +5% to one stat (your most in one region count). The level cap is 2 levels below the strongest Pokémon of your next Gym Leader, rival, villain boss or Elite Four battle.${champRegions().length ? ` Champion of ${champRegions().map(id => REGION_NAME[id]).join(", ").replace(/, ([^,]*)$/, " and $1")}!` : ""}</p>
    </section>
    <section class="panel stack" style="gap:10px"><h3>Profile</h3>
      <label class="small dim" for="pname">Name</label>
      <div class="row" style="gap:8px"><input id="pname" class="tinput" maxlength="12" value="${esc(S.name)}"><button class="btn sm" data-act="saveName">Save</button></div>
      <label class="small dim" for="pbio">About me <span class="tiny">(other Trainers see it on your profile)</span></label>
      <div class="row" style="gap:8px"><input id="pbio" class="tinput" maxlength="60" value="${esc(S.bio || "")}" placeholder="Your motto, your favourite Pokémon..."><button class="btn sm" data-act="saveBio">Save</button></div>
      <div class="spread"><span class="small dim">Look</span>${featOn("boutique") ? '<button class="btn ghost sm" data-act="boutiqueGo">More in the Boutique</button>' : ""}</div><div class="avgrid">${AVATARS.filter(([k]) => ownsLook(k)).map(([k, n]) => `<button class="${avatar() === k ? "on" : ""}" data-act="setAvatar" data-v="${k}"><img class="px" src="${trainerURL(k)}" alt=""><span>${n}</span></button>`).join("")}</div></section>
    <section class="panel stack" style="gap:10px"><h3>Game Boy</h3>
      <span class="small dim">Shape <span class="tiny">(Hybrid follows your screen: upright is the Gameboy, wide is the Switch; this device only)</span></span>${chipRow("setLayout", devicePrefs().layout || "hybrid", LAYOUTS)}
      <span class="small dim">Frame colour (Off fills the screen)</span>${chipRow("setShell", S.settings.shell || "classic", SHELLS)}
      <p class="tiny dim">The buttons work: D-pad to move, A to confirm, B to go back, START for the menu, SELECT for Auto in battle. On a keyboard: arrows, Z, X, Enter and Shift.</p></section>
    <section class="panel stack" style="gap:10px"><h3>Options</h3>
      <span class="small dim">Music</span>${chipRow("setMusic", musicVol(), MUSIC_LEVELS)}
      <span class="small dim">Sound effects and cries</span>${chipRow("setSound", st.sound ? 1 : 0, [[1, "On"], [0, "Off"]])}
      <span class="small dim">Battle speed</span>${chipRow("setSpeed", st.speed, [[1, "1×"], [2, "2×"], [3, "3×"]])}
      <span class="small dim">Start battles on Auto</span>${chipRow("setAuto", st.auto ? 1 : 0, [[1, "On"], [0, "Off"]])}
      <span class="small dim">Auto-battle tactics <span class="tiny">(hold one to see what it does)</span></span>${chipRow("setAi", st.ai, AI_STYLES.map(k => [k, AI_NAME[k]]), AI_TIP)}
      <span class="small dim">S3 move cut-ins <span class="tiny">(the Pokémon's picture that sweeps across for its big move)</span></span>${chipRow("setTog2", setv("cutins") ? 1 : 0, [[1, "On"], [0, "Off"]]).replace(/data-v=/g, 'data-k="cutins" data-v=')}
      <span class="small dim">Screen shake</span>${chipRow("setTog2", setv("shake") ? 1 : 0, [[1, "On"], [0, "Off"]]).replace(/data-v=/g, 'data-k="shake" data-v=')}
      <span class="small dim">Damage numbers</span>${chipRow("setTog2", setv("dmgNums") ? 1 : 0, [[1, "On"], [0, "Off"]]).replace(/data-v=/g, 'data-k="dmgNums" data-v=')}</section>
    <section class="panel stack" style="gap:10px"><h3>Union Room</h3>
      <span class="small dim">Union Room chat on the home screen</span>${chipRow("setTog2", setv("ticker") ? 1 : 0, [[1, "On"], [0, "Off"]]).replace(/data-v=/g, 'data-k="ticker" data-v=')}
      <span class="small dim">Message pop-ups</span>${chipRow("setTog2", setv("whisperToasts") ? 1 : 0, [[1, "On"], [0, "Off"]]).replace(/data-v=/g, 'data-k="whisperToasts" data-v=')}
      <span class="small dim">Filter rude words</span>${chipRow("setTog2", setv("filter") ? 1 : 0, [[1, "On"], [0, "Off"]]).replace(/data-v=/g, 'data-k="filter" data-v=')}
      <div class="spread"><div><span class="small dim">Blocked Trainers</span><div class="tiny">${Object.keys(S.blocked || {}).length ? Object.keys(S.blocked).map(i => esc(npcName(+i))).join(", ") : "Nobody"}</div></div>${Object.keys(S.blocked || {}).length ? `<button class="btn ghost sm" data-act="unblockAll">Unblock all</button>` : ""}</div></section>
    <section class="panel stack" style="gap:10px"><h3>Save data</h3>
      <p class="tiny dim">${SESSION && SESSION.id === "guest" ? "Playing as Guest." : SESSION && SESSION.id === "demo" ? "This is the Demo's own save." : SESSION && SESSION.id !== "hot" ? `Pokémon Trainer Club: <b>${esc(SESSION.name)}</b>.` : ""} On the <b>${esc(serverName())}</b> server. Your progress is saved in this browser only.</p>
      <div class="row" style="gap:8px"><button class="btn ghost sm" style="flex:1" data-act="exportSave">Copy save code</button><button class="btn ghost sm" style="flex:1" data-act="importSave">Load save code</button></div>
      <button class="btn ghost wide" data-act="toTitle">Return to the title screen</button>
      ${SESSION && !["guest", "demo", "hot"].includes(SESSION.id) ? `<button class="btn ghost wide" data-act="logout">Log out</button>` : ""}
      <button class="btn red wide" data-act="askReset">Delete save data</button></section>
    <p class="tiny dim" style="text-align:center">Pokémon Kanto Squad · Ver ${GAME_VER}<br>An unofficial, non-commercial fan game. Pokémon © Nintendo, Game Freak and Creatures Inc. Sprites from Pokémon Showdown; data from PokeAPI.</p>
  </div>`;
};
function resetModal() {
  openModal(`<div class="stack"><div class="eyebrow bad">Warning</div><h2>Delete all saved data?</h2>
    <p class="small dim">This deletes this adventure: your Pokémon, Badges, Pokédex, items, mail and Medals. Other Trainers' saves on this device aren't touched. Next time you press START, a brand-new adventure begins. This can't be undone.</p>
    <label class="small" for="rconf">Type <b>DELETE</b> to confirm</label>
    <input id="rconf" class="tinput" autocomplete="off" autocapitalize="characters" placeholder="DELETE">
    <div class="row" style="gap:10px"><button class="btn ghost" style="flex:1" data-act="closeModal">No</button><button class="btn red" style="flex:1" data-act="doReset">Yes, delete</button></div></div>`);
}
function nameModal(def) {
  openModal(`<div class="stack" style="text-align:center;align-items:center"><img class="px" src="${trainerURL("oak")}" alt="" style="width:80px;height:80px;object-fit:contain">
    <div class="eyebrow">A new Trainer</div><h2>First, what is your name?</h2>
    <div class="avpick">${["red", "leaf"].map(a => `<button class="${(S.avatar || "red") === a ? "on" : ""}" data-act="pickAvatar" data-v="${a}"><img class="px" src="${trainerURL(a)}" alt=""><span>${a === "red" ? "Red" : "Leaf"}</span></button>`).join("")}</div>
    <input id="nname" class="tinput" maxlength="12" value="${esc((def || "").slice(0, 12))}" placeholder="${S.avatar === "leaf" ? "Leaf" : "Red"}" style="text-align:center;width:100%">
    <p class="tiny dim">You can change your name and your look later on your Trainer Card.</p>
    <button class="btn wide" data-act="nameGo">That's me!</button></div>`);
  m0Click();
}
function m0Click() { const m = $("#modal"); m.onclick = null; setTimeout(() => { m.onclick = e => { if (e.target === m && !$("#nname") && !$(".starters")) closeModal(); }; }, 0); }

// ---------- title screen ----------
// A mobile-game login screen: a top-down Kanto scene with a trainer and Pokémon walking about (the home screen's overworld,
// a9i_home.js; the drawn sky, hills and hopping Pokémon if those pictures are missing), logo, load bar, "Tap to Start".
const TITLE = { on: false, raf: 0, t0: 0, mons: [], clouds: [] };
function showTitle(msg) {
  closeModal();
  for (const id of ["dlg", "gacha"]) { const e = $("#" + id); if (e) { e.hidden = true; e.innerHTML = ""; } }
  clearTimeout(TITLE.hideT);   // (back on the title before the last fade-out finished)
  let el = $("#title");
  if (!el) { el = document.createElement("div"); el.id = "title"; $("#screen").appendChild(el); }
  el.innerHTML = `<canvas id="tcv"></canvas>
    <div class="tlogo"><div class="tball">${IC.pokeball}</div><h1>Pokémon</h1><div class="tsub">Kanto Squad</div></div>
    <div class="tload" id="tload"><div class="tbar"><i id="tbarI"></i></div><span id="tloadT">Loading Pokémon… 0%</span></div>
    <div class="ttap" id="ttap" hidden>PRESS START</div>
    <div class="tfoot l"><button class="tbtn" data-act="titleAcct">${IC.ops}<span>Trainer Club</span></button><button class="tbtn" data-act="titleNews">${IC.mail}<span>News</span></button></div>
    <div class="tfoot"><button class="tbtn demo" data-act="titleDemo">${IC.battles}<span>Demo</span></button><button class="tbtn" data-act="titleCredits">${IC.book}<span>Credits</span></button></div>
    <div class="tuser" id="tuser">${(() => { const r = rememberedAcct(); return r ? `Trainer ${esc(r.name)}` : msg ? esc(msg) : "Log in or play as Guest"; })()}</div>
    <div class="tver">Ver ${GAME_VER}<br>Unofficial fan game. Pokémon © Nintendo / Game Freak / Creatures Inc.</div>`;
  el.hidden = false; el.classList.remove("out");
  UI.inGame = false; TITLE.on = true; TITLE.t0 = performance.now(); TITLE.world = null; TITLE.last = 0;
  music("title");
  const rng = seeded(151);
  const cast = ["pikachu", "bulbasaur", "charmander", "squirtle", "eevee", "jigglypuff", "psyduck", "snorlax", "meowth", "clefairy", "gengar", "dragonite", "mew", "lapras", "pidgey", "magikarp"];
  TITLE.mons = cast.map((k, i) => ({ k, x: rng(), lane: i % 3, sp: .03 + rng() * .03, ph: rng() * 7, fly: ["pidgey", "dragonite", "mew", "gengar"].includes(k) }));
  TITLE.clouds = Array.from({ length: 6 }, () => ({ x: rng(), y: .08 + rng() * .25, w: .12 + rng() * .14, v: .004 + rng() * .006 }));
  el.onclick = e => { if (e.target.closest("[data-act]") || e.target.closest(".tpanel")) return; if ($("#ttap") && !$("#ttap").hidden) titleStart(); };
  cancelAnimationFrame(TITLE.raf); titleLoop();
}
function titleLoop() {
  const cv = $("#tcv"); if (!TITLE.on || !cv) return;
  TITLE.raf = requestAnimationFrame(titleLoop);
  const dpr = pxRatio(), W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
  const t = (performance.now() - TITLE.t0) / 1000;
  // load bar follows the real sprite loading, then "Tap to Start"
  const p = SPR.ready ? Math.min(1, Math.max(t / 1.2, SPR.loaded / Math.max(1, SPR.total))) : Math.min(.99, SPR.loaded / Math.max(1, SPR.total)), lt = $("#tloadT");
  if (lt) { $("#tbarI").style.width = p * 100 + "%"; lt.textContent = p < 1 ? `Loading Pokémon… ${Math.floor(p * 100)}%` : "Ready"; if (p >= 1 && $("#ttap").hidden) { $("#ttap").hidden = false; $("#tload").classList.add("done"); } }
  if (titleWorldFrame(cv, performance.now())) return;
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#2a6ad8"); sky.addColorStop(.55, "#7ab8f2"); sky.addColorStop(.8, "#d8f0ff");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // sun rays
  g.save(); g.translate(W * .78, H * .16); g.rotate(t * .05); g.fillStyle = "#ffffff18";
  for (let k = 0; k < 12; k++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(-W * .06, -H); g.lineTo(W * .06, -H); g.fill(); }
  g.restore(); circ(g, W * .78, H * .16, Math.min(W, H) * .06, "#fff8d8");
  for (const c of TITLE.clouds) { const x = ((c.x + t * c.v) % 1.3 - .15) * W, y = c.y * H; g.fillStyle = "#ffffffcc"; g.beginPath(); g.ellipse(x, y, c.w * W, c.w * W * .28, 0, 0, 7); g.ellipse(x + c.w * W * .4, y - c.w * W * .12, c.w * W * .5, c.w * W * .25, 0, 0, 7); g.fill(); }
  // hills
  const hill = (y0, amp, col, ph) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x / W * 5 + ph) * amp); g.lineTo(W, H); g.fill(); };
  hill(H * .66, H * .03, "#6aa86a", 1); hill(H * .74, H * .025, "#5a9a4a", 3); hill(H * .82, H * .02, "#4a8a3a", 5);
  // the parade
  for (const m of TITLE.mons) {
    const a = SPR.ani["f:" + m.k]; if (!a) continue;
    const x = ((m.x - t * m.sp) % 1.25 + 1.25) % 1.25 * W * 1.1 - W * .1;
    const base = [H * .72, H * .8, H * .9][m.lane], hop = m.fly ? Math.sin(t * 2 + m.ph) * 10 - H * .18 : -Math.abs(Math.sin(t * 5 + m.ph)) * 10;
    const sc = Math.min(W, H) / 330 * [0.85, 1, 1.15][m.lane], bw = a.w, bh = a.h;
    g.fillStyle = "#00000022"; g.beginPath(); g.ellipse(x, base, bw * sc * .35, 4, 0, 0, 7); g.fill();
    drawAniFrame(g, a, aniFrame(a, (t + m.ph) * 1000), x - bw * sc / 2, base + hop - bh * sc, bw * sc, bh * sc);
  }
}
function hideTitle() {
  const el = $("#title"); if (!el) return;
  TITLE.on = false; cancelAnimationFrame(TITLE.raf);
  el.classList.add("out"); clearTimeout(TITLE.hideT); TITLE.hideT = setTimeout(() => { el.hidden = true; el.innerHTML = ""; }, 450);
}
// PRESS START: straight in as the remembered Trainer, otherwise the Trainer Club log-in
function titleStart() {
  if (!$("#ttap") || $("#ttap").hidden || $("#title .tpanel")) return;
  sfx("special");
  const r = rememberedAcct();
  if (r) enterAccount(r); else loginPanel("login");
}
function afterLogin() {
  metaTick(); renderTop();
  if (!S.seenIntro) introModal(); else if (UI.view === "home") rerender();
}

// ---------- free Safari throws ----------
async function manifestWith(results, master) { save(); renderTop(); await gachaReveal(results, master); checkAchievements(); rerender(); }

const META_ACT = {
  inbox: () => { closeModal(); route("inbox"); },
  openMail: d => { const m = S.inbox.find(x => x.id === +d.id); if (m) { mailModal(m); if (UI.view === "inbox") { const st = $("#view").scrollTop; $("#view").innerHTML = SCREENS.inbox(); $("#view").scrollTop = st; renderTop(); } } },
  closeMail: () => { closeModal(); if (UI.view === "inbox") rerender(); },
  claimMail: d => {
    const m = S.inbox.find(x => x.id === +d.id); if (m && m.rewards.pick && !m.claimed) { rescueModal(m); return; }
    const list = claimMail(m); if (!list.length) return;
    sfx("heal"); rerender(); rewardModal("Received!", list, m.title);
  },
  // the Professor's help (journeyLoss): the partner you chose, at the letter's level, holding Berry Juice
  pickRescue: d => {
    const m = S.inbox.find(x => x.id === +d.id); if (!m || m.claimed || !m.rewards.pick || !rescueOptions(m.rewards.pick).includes(d.k)) return;
    const r = grantOp(d.k, Math.min(100, m.rewards.lv || 5)); if (S.ops[d.k]) S.ops[d.k].pot = Math.max(3, S.ops[d.k].pot);
    const id = m.rewards.pick; S.gifts = S.gifts || {}; S.gifts[id] = [...giftsIn(id), d.k];   // (the next letter brings the last one)
    const berry = starterBerry(d.k); m.claimed = true; m.read = true;
    closeModal(); cry(d.k); sfx("win"); save(); rerender();
    rewardModal("A new partner!", [{ k: "op:" + d.k, n: 1, isNew: r.isNew }, berry], m.title);
  },
  claimAllMail: () => {
    let list = []; for (const m of unclaimedMail().filter(x => !x.rewards.pick)) list = list.concat(claimMail(m));
    if (!list.length) return;
    sfx("win"); rerender(); rewardModal("Received!", list, "Mail");
  },
  clearMail: () => { S.inbox = S.inbox.filter(m => !(m.claimed || (m.read && !hasRewards(m)))); sfx("tap"); rerender(); },
  achCat: d => { UI.achCat = d.c; rerender(); },
  setMusic: d => { setMusicVol(+d.v); rerender(); },
  setSound: d => { S.settings.sound = d.v === "1"; setDevicePref("sound", S.settings.sound); rerender(); },
  setSpeed: d => { S.settings.speed = +d.v; rerender(); },
  setAuto: d => { S.settings.auto = d.v === "1"; rerender(); },
  setAi: d => { S.settings.ai = d.v; rerender(); },
  setTog2: d => { S.settings[d.k] = d.v === "1"; rerender(); },
  setAvatar: d => { if (ownsLook(d.v)) S.avatar = d.v; rerender(); },
  boutiqueGo: () => { sfx("tap"); UI.shopTab = "boutique"; route("shop"); },
  buyLook: d => {
    const k = d.k, look = AVATARS.find(a => a[0] === k); if (!look || ownsLook(k) || S.orundum < LOOK_COST || !featOn("boutique")) return;
    gemsOut(LOOK_COST, "Boutique"); S.looks = [...(S.looks || []), k]; save(); sfx("win"); rerender();
    openModal(`<div class="stack" style="align-items:center;text-align:center"><div class="eyebrow">Boutique</div><img class="px" src="${trainerURL(k)}" alt="" style="height:120px;image-rendering:pixelated"><h2>${esc(look[1])} is yours!</h2>
      <div class="row" style="gap:8px;width:100%"><button class="btn ghost" style="flex:1" data-act="closeModal">Later</button><button class="btn" style="flex:1" data-act="wearLook" data-k="${k}">Wear it</button></div></div>`);
  },
  wearLook: d => { if (!ownsLook(d.k)) return; S.avatar = d.k; closeModal(); save(); sfx("heal"); renderTop(); rerender(); toast(`You're wearing ${AVATARS.find(a => a[0] === d.k)[1]}'s look.`); },
  pickAvatar: d => { S.avatar = d.v; $$(".avpick button").forEach(b => b.classList.toggle("on", b.dataset.v === d.v)); const n = $("#nname"); if (n) n.placeholder = d.v === "leaf" ? "Leaf" : "Red"; },
  flipCard: () => { UI.cardBack = !UI.cardBack; const c = $(".tcard2 .tc-in"); if (c) c.classList.toggle("flip", UI.cardBack); },
  saveBio: () => { const el = $("#pbio"); if (!el) return; S.bio = el.value.replace(/\s+/g, " ").trim().slice(0, 60); save(); sfx("tap"); toast(S.bio ? "About me saved!" : "About me cleared."); },
  saveName: () => { const v = ($("#pname") || {}).value; S.name = (v || "").trim().slice(0, 12) || (S.avatar === "leaf" ? "Leaf" : "Red"); toast("Name saved."); rerender(); },
  askReset: () => resetModal(),
  doReset: () => {
    if ((($("#rconf") || {}).value || "").trim().toUpperCase() !== "DELETE") { toast("Type DELETE to confirm."); return; }
    clearTimeout(saveTimer);
    try { localStorage.removeItem(SAVE_SLOT); } catch (e) { /* storage unavailable */ }
    S = null; UI.inGame = false; closeModal(); showTitle("Save data deleted");
  },
  toTitle: () => leaveGame(),
  logout: () => logout(),
  titleAcct: () => { sfx("tap"); loginPanel("login"); },
  titleNews: () => { sfx("tap"); newsPanel(); },
  titleDemo: () => { sfx("tap"); demoPanel(); },
  titleCredits: () => {
    openModal(`<div class="stack" style="text-align:center"><h2>Credits</h2>
      <p class="small dim">Pokémon Kanto Squad is an unofficial, non-commercial fan game made with love for Pokémon Red and Blue.</p>
      <p class="small dim">Pokémon and all related names are © Nintendo, Game Freak and Creatures Inc.</p>
      <p class="small dim">Pokémon battle and overworld sprites, trainer sprites, item icons and cries come from the owner's collections, with trainer sprites from Pokémon Showdown's sprite collection too; the Berserk Gene's icon is Pokémon Showdown's (the games never drew one). Species, move and ability data come from PokeAPI.</p>
      <p class="small dim">Type icons by icedt (DS style) and Squid Eevee (Minecraft style). Overworld item balls by OneWingedNatu. Battle backgrounds and platforms from Pokémon Platinum, ripped by Sunday-Domeko. Cut-in strips and Medals ripped by redblueyellow. HP bars ripped by GameMaster12. Chat emotes ripped by Lemon. Move animations, weather and battle text from Pokémon Showdown (smogon/pokemon-showdown and pokemon-showdown-client) by Guangcong Luo and its contributors; its effect art by SailorCosmos, Kalalokki, Modeling Clay, Jajoken and Ridaz, rocks from Pokémon Online (Gilad). The Game Corner's slot machine ripped by Smol_Sanston. Gym Badges by VictorV111 (deviantart.com/victorv111). Area previews, the Trainer Card, the Poké Balls and the music are from Pokémon FireRed and LeafGreen.</p>
      <p class="small dim">Move and battle sounds are the Gen 3 attack sounds of Ruby, Sapphire, FireRed and LeafGreen.</p>
      <p class="small dim">Music is the FireRed and LeafGreen soundtrack; the Johto Journey plays the HeartGold and SoulSilver soundtrack, the Hoenn Journey the Ruby and Sapphire soundtrack with Emerald's own tracks, and the Sinnoh Journey the Diamond and Pearl soundtrack with Platinum's own tracks (each the Super Music Collection). Ranked, Link and friendly battles also cycle through the battle themes from Pokémon Showdown's audio (play.pokemonshowdown.com).</p>
      <button class="btn wide" data-act="closeModal">Close</button></div>`);
  },
  nameGo: () => {
    const v = (($("#nname") || {}).value || "").trim().slice(0, 12);
    S.name = v || (S.avatar === "leaf" ? "Leaf" : "Red"); S.named = true; closeModal(); sfx("tap"); afterLogin();
  },
  pullFree10: async () => {
    const B = bannerById(UI.hhB); if (!(S.inv.free10 > 0) || B.step || B.only) return;
    S.inv.free10--;
    await manifestWith(headhunt(10, B.id));
  },
  pullGold5: async () => {
    if (!(S.inv.gold5 > 0)) return;
    S.inv.gold5--; S.daily.hh++; live("throw", 1, { banner: "master" });
    await manifestWith([pullOne(null, 5)], true);
  },
};
