
// =====================================================================
//  PEOPLE — the simulated Trainers behind the Battle Stadium ladders.
//  Every Trainer (ladder index i) has a personality rebuilt from the save's ladder seed: an archetype, temperament,
//  typing style, favourite Pokémon, a time zone and play schedule. They come online and go offline on their own,
//  chat in the Union Room and Club chat, answer the player, message after Stadium battles, run and join Clubs,
//  contribute and join Raid Battles. Lines come from CHAT_LINES (a6c_lines.js); personal state lives in S.npc.
//  (Internal names kept the sister game's: guild = Club, guild boss = Raid Battle, world chat = Union Room.)
// =====================================================================
const ARCHS = [
  { id: "veteran", v: ["elder", "chill", "mentor"], w: q => .4 + q, soc: [.3, .7], warm: [.4, .8], salt: [.1, .5], help: [.5, .95] },
  { id: "newbie", v: ["newbie", "warm", "hype"], w: q => 1.8 * (1 - q) * (1 - q), soc: [.3, .85], warm: [.5, .95], salt: [0, .3], help: [0, .2] },
  { id: "whale", v: ["whale", "hype", "snarky"], w: q => 1.3 * q * q, soc: [.3, .8], warm: [.3, .7], salt: [.1, .5], help: [.2, .6] },
  { id: "f2p", v: ["f2p", "salty", "chill"], w: () => .7, soc: [.3, .7], warm: [.3, .7], salt: [.3, .7], help: [.3, .7] },
  { id: "collector", v: ["warm", "hype"], w: () => .6, soc: [.4, .8], warm: [.6, .95], salt: [0, .3], help: [.2, .6] },
  { id: "lore", v: ["lore", "rp", "chill"], w: () => .45, soc: [.3, .7], warm: [.5, .9], salt: [0, .3], help: [.4, .8] },
  { id: "memer", v: ["meme", "snarky", "hype"], w: () => .7, soc: [.6, 1], warm: [.4, .8], salt: [.2, .6], help: [.1, .5] },
  { id: "tryhard", v: ["tryhard", "snarky", "mentor"], w: q => .2 + q * 1.2, soc: [.3, .7], warm: [.2, .6], salt: [.4, .8], help: [.4, .8] },
  { id: "casual", v: ["chill", "warm"], w: () => 1, soc: [.2, .6], warm: [.5, .9], salt: [.1, .4], help: [.2, .6] },
  { id: "mentor", v: ["mentor", "warm", "elder"], w: q => .15 + q * .6, soc: [.4, .8], warm: [.6, 1], salt: [0, .2], help: [.8, 1] },
  { id: "salty", v: ["salty", "snarky"], w: () => .45, soc: [.4, .8], warm: [.1, .4], salt: [.7, 1], help: [.1, .5] },
  { id: "lurker", v: ["shy", "chill"], w: () => 1.1, soc: [0, .07], warm: [.3, .8], salt: [0, .4], help: [.1, .5] },
  { id: "hypebeast", v: ["hype", "meme"], w: () => .5, soc: [.6, 1], warm: [.6, 1], salt: [0, .3], help: [.1, .4] },
  { id: "roleplayer", v: ["rp", "lore", "warm"], w: () => .22, soc: [.4, .8], warm: [.6, .95], salt: [0, .2], help: [.3, .7] },
  { id: "recruiter", v: ["warm", "tryhard", "hype"], w: q => .12 + q * .3, soc: [.6, 1], warm: [.6, .95], salt: [0, .3], help: [.5, .9] },
  { id: "shy", v: ["shy", "warm"], w: () => .5, soc: [.1, .35], warm: [.6, 1], salt: [0, .2], help: [.2, .6] },
  // the second 16 families (the owner's ask; wave 2: a Trainer's own roll moves them here, so everyone else keeps their family). top: the
  // chat topics the family brings up more (×, only what's going on)
  { id: "specialist", wave2: 1, v: ["tryhard", "warm"], w: q => .3 + q * .5, soc: [.3, .7], warm: [.4, .8], salt: [.1, .5], help: [.4, .8], top: { fav_mon: 1.5, pvp_meta: 1.2 } },
  { id: "challenger", wave2: 1, v: ["tryhard", "meme"], w: q => .2 + q * .5, soc: [.3, .7], warm: [.3, .7], salt: [.2, .6], help: [.3, .7], top: { cleared_stage: 2, stuck_stage: 1.5, tower: 1.5 } },
  { id: "gossip", wave2: 1, v: ["snarky", "hype", "warm"], w: () => .5, soc: [.75, 1], warm: [.4, .8], salt: [.2, .6], help: [.1, .5], top: { pvp_climb: 1.5, event_news: 2, irl: 1.2 } },
  { id: "creative", wave2: 1, v: ["warm", "chill"], w: () => .45, soc: [.3, .7], warm: [.6, .95], salt: [0, .3], help: [.2, .6], top: { fav_mon: 1.5, irl: 1.3, lore: 1.2 } },
  { id: "scientist", wave2: 1, v: ["mentor", "tryhard"], w: q => .15 + q * .5, soc: [.3, .6], warm: [.3, .7], salt: [.1, .4], help: [.5, .9], top: { items_rng: 1.5, pvp_meta: 1.3, ivs: 1.3 } },
  { id: "foodie", wave2: 1, v: ["chill", "warm"], w: () => .45, soc: [.4, .85], warm: [.5, .9], salt: [0, .3], help: [.2, .5], top: { irl: 2 } },
  { id: "student", wave2: 1, v: ["newbie", "meme", "chill"], w: q => .5 + (1 - q) * .6, soc: [.4, .85], warm: [.4, .8], salt: [.1, .5], help: [.1, .5], top: { irl: 1.5, ask_help: 1.3 } },
  { id: "worker", wave2: 1, v: ["chill", "salty"], w: () => .8, soc: [.2, .6], warm: [.4, .8], salt: [.2, .5], help: [.3, .7], top: { irl: 1.5, leave: 1.5 } },
  { id: "traveler", wave2: 1, v: ["chill", "hype"], w: () => .35, soc: [.3, .7], warm: [.5, .9], salt: [0, .3], help: [.2, .6], top: { irl: 1.8 } },
  { id: "wholesome", wave2: 1, v: ["warm", "shy"], w: () => .45, soc: [.5, .9], warm: [.85, 1], salt: [0, .1], help: [.4, .8], top: { pull_win: 1.2 } },
  { id: "philosopher", wave2: 1, v: ["lore", "chill"], w: () => .3, soc: [.2, .6], warm: [.4, .8], salt: [0, .3], help: [.3, .6], top: { lore: 1.8, quiet: 1.2 } },
  { id: "gambler", wave2: 1, v: ["hype", "salty", "whale"], w: () => .4, soc: [.4, .8], warm: [.3, .7], salt: [.3, .7], help: [.1, .4], top: { ev_lucky: 2.5, ev_lottery: 2.5, pull_win: 1.3, pull_loss: 1.3 } },
  { id: "achiever", wave2: 1, v: ["tryhard", "warm"], w: q => .2 + q * .6, soc: [.3, .7], warm: [.3, .7], salt: [.1, .5], help: [.3, .7], top: { cleared_stage: 1.8, tower: 1.5, pvp_climb: 1.3 } },
  { id: "rival", wave2: 1, v: ["snarky", "tryhard"], w: q => .2 + q * .5, soc: [.5, .9], warm: [.2, .6], salt: [.3, .7], help: [.1, .5], top: { pvp_win: 1.8, pvp_loss: 1.5, pvp_climb: 1.3 } },
  { id: "caretaker", wave2: 1, v: ["warm", "mentor"], w: () => .4, soc: [.3, .7], warm: [.8, 1], salt: [0, .2], help: [.4, .8], top: { fav_mon: 1.5 } },
  { id: "superstitious", wave2: 1, v: ["shy", "meme", "warm"], w: () => .35, soc: [.3, .7], warm: [.4, .8], salt: [.2, .5], help: [.1, .5], top: { pull_win: 1.4, pull_loss: 1.4, pity_salt: 1.3, ev_lucky: 1.3 } },
];
const ARCH_BY = Object.fromEntries(ARCHS.map(A => [A.id, A]));
// each family holds a dozen or so personalities (PERSONAS in a6c_lines.js: 200 in all); a Trainer is one of them
const PERSONA_FAM = {}, PERSONA_BY = {};
const personaList = fam => PERSONA_FAM[fam] || (PERSONA_FAM[fam] = (typeof PERSONAS !== "undefined" ? PERSONAS : []).filter(P => P.a === fam));
const personaOf = p => p && p.persona ? PERSONA_BY[p.persona] || (PERSONA_BY[p.persona] = PERSONAS.find(P => P.id === p.persona)) : null;
const personaName = p => { const P = personaOf(p); return P ? P.n : ARCH_NAME[p.arch]; };
// a Trainer's family, from their strength: the first roll of their own random stream picks among the first 16 families (person()
// makes the same pick), then a roll of their own (key) moves them to one of the 16 newer ones by those families' share, so everyone
// who stays keeps the family they had
const ARCHS1 = ARCHS.filter(A => !A.wave2), ARCHS2 = ARCHS.filter(A => A.wave2);
const famPick = (L, q, x) => { const tot = L.reduce((a, A) => a + A.w(q), 0); x *= tot; for (const c of L) { x -= c.w(q); if (x <= 0) return c; } return L[0]; };
function archPick(q, rng, key) {
  const A = famPick(ARCHS1, q, rng());
  if (key == null || !ARCHS2.length) return A;
  const r = seeded(hash("family2:" + key)), w1 = ARCHS1.reduce((a, B) => a + B.w(q), 0), w2 = ARCHS2.reduce((a, B) => a + B.w(q), 0);
  return r() < w2 / (w1 + w2) ? famPick(ARCHS2, q, r()) : A;
}
// ---------- a thousand families, two thousand more personalities (the owner's ask, 2026-10-15) ----------
// A family is a temperament and a motivation (a6c2_traits.js: 40 × 25 = 1,000), and each makes two personalities: "Cheerful Shiny
// Hunter", and with a life of its own "Night-Shift Shiny Hunter" (every motivation meets 40 different lives). Each family belongs to
// one of the 32 base families (ARCHS: their share of the Trainers stays as it was), one its temperament and motivation suit where it
// can; each base gets its share of the personalities, and never more than it has Trainers for, so every personality has someone
// (placeFamilies: once from the Trainers' expected families, then again for each save's own, when its personalities are dealt).
const cap1 = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const GEN_FAMILIES = [];
// which base family each family belongs to, for these Trainers (n: how many each base family has): its share of all the
// personalities less the ones it already has, two a family, within what its Trainers can take; the families with the fewest
// suited bases go first, each to the suited base with the most room left (both its temperament and motivation suit it, then
// either, then any)
function placeFamilies(n) {
  const gen = PERSONAS.filter(P => P.gen), old = {}; for (const P of PERSONAS) if (!P.gen) old[P.a] = (old[P.a] || 0) + 1;
  const NF = GEN_FAMILIES.length, total = PERSONAS.filter(P => !P.gen).length + 2 * NF, ids = ARCHS.map(A => A.id), tot = ids.reduce((a, id) => a + (n[id] || 0), 0) || 1;
  const room0 = id => Math.max(0, Math.floor(((n[id] || 0) - (old[id] || 0)) / 2)), tgt = {};
  for (const id of ids) tgt[id] = Math.max(0, (n[id] || 0) / tot * total - (old[id] || 0)) / 2;
  const ts = ids.reduce((a, id) => a + tgt[id], 0) || 1, cap = {}; let given = 0;
  for (const id of ids) { tgt[id] *= NF / ts; cap[id] = Math.min(room0(id), Math.floor(tgt[id])); given += cap[id]; }
  const gap = id => tgt[id] - cap[id];
  while (given < NF) { const id = ids.filter(id => cap[id] < room0(id)).sort((a, b) => gap(b) - gap(a))[0] || ids.slice().sort((a, b) => gap(b) - gap(a))[0]; cap[id]++; given++; }
  const room = { ...cap }, roomy = list => list.filter(b => room[b] > 0).sort((a, b) => room[b] / cap[b] - room[a] / cap[a] || (a < b ? -1 : 1))[0];
  for (const F of GEN_FAMILIES.slice().sort((a, b) => (a.both.length || 9) - (b.both.length || 9) || a.either.length - b.either.length || a.ti - b.ti || a.mi - b.mi)) {
    F.a = roomy(F.both) || roomy(F.either) || roomy(ids); room[F.a]--;
  }
  const at = Object.fromEntries(GEN_FAMILIES.map(F => [F.id, F.a]));
  for (const P of gen) P.a = at[P.fam];
  for (const k in PERSONA_FAM) delete PERSONA_FAM[k];
}
function genPersonas() {
  if (typeof TRAIT_TEMPER === "undefined" || typeof PERSONAS === "undefined") return [];
  const T = TRAIT_TEMPER, M = TRAIT_MOTIVE, fams = [];
  T.forEach((t, ti) => M.forEach((m, mi) => { const both = t.b.filter(b => m.b.includes(b) && ARCH_BY[b]); fams.push({ id: t.id + "-" + m.id, n: t.n + " " + m.pl, t, m, ti, mi, both, either: [...new Set([...t.b, ...m.b])].filter(b => ARCH_BY[b]) }); }));
  // each motivation's 40 lives, in an order of its own; speech, schedule, region and type spread over the families
  const L = TRAIT_LIFE, SP = TRAIT_SPEECH, SC = TRAIT_SCHED, RG = TRAIT_REGION;
  const lives = M.map((m, mi) => { const r = seeded(hash("lives:" + m.id)); return L.map((x, k) => [r(), k]).sort((a, b) => a[0] - b[0]).map(x => L[x[1]]); });
  const region = R => R.say.map(s => R.id === "kanto" ? s : "done:" + s);   // (another region's lines only once the Trainer's own Kanto Journey is done)
  const out = [];
  for (const F of fams) {
    const { t, m, ti, mi } = F, life = lives[mi][ti % L.length], sp1 = SP[(ti * 7 + mi * 3) % SP.length], sp2 = SP[(ti * 3 + mi * 11 + 17) % SP.length];
    const sc = SC[(ti + mi * 7) % SC.length], r1 = RG[(ti * 7 + mi) % RG.length], r2 = RG[(ti * 3 + mi * 7 + 5) % RG.length];
    // (a favourite type: Dark comes with Ghost, so a Trainer still on their Kanto Journey, where no Pokémon is Dark-type, has favourites of it)
    const tyOf = t => t === "Dark" ? ["Dark", "Ghost"] : [t];
    const typed = m.id === "typed", ty1 = typed || (ti + mi) % 2 === 0 ? tyOf(TYPES[(ti * 5 + mi) % TYPES.length]) : null, ty2 = typed || (ti + mi) % 2 === 1 ? tyOf(TYPES[(ti * 11 + mi * 3 + 7) % TYPES.length]) : null;
    const fam = F.id, base = { a: null, v: t.v, t: t.t, top: m.top, ...(m.ps ? { ps: m.ps } : {}), hi: t.hi, fam, gen: 1 };
    GEN_FAMILIES.push(F);
    out.push({ ...base, id: "g-" + fam, n: t.n + " " + m.n, ty: ty1, st: { ...sp1.st, ...t.st }, sch: sc.sch, mood: t.mood, fight: t.fight, bio: cap1(m.bio),
      say: [...t.say, ...m.say, sp1.say, ...region(r1)], core: { temper: t.id, motive: m.id, speech: sp1.id, sched: sc.id, region: r1.id, type: ty1 && ty1[0] } });
    out.push({ ...base, id: "g-" + fam + "-2", n: life.n + " " + m.n, ty: ty2, st: { ...sp2.st, ...t.st }, sch: life.sch, mood: life.mood, fight: m.fight, bio: cap1(life.bio) + ", " + m.bio,
      say: [...life.say, ...m.say, t.say[0], sp2.say, ...region(r2)], core: { temper: t.id, motive: m.id, life: life.id, speech: sp2.id, region: r2.id, type: ty2 && ty2[0] } });
  }
  return out;
}
PERSONAS.push(...genPersonas());
// (until a save deals them: each base family's Trainers as archPick deals them at every strength)
{ const E = {}; for (const A of ARCHS) E[A.id] = 0;
  for (let j = 0; j < LADDER_N; j++) {
    const q = ladderQ(j), w1 = ARCHS1.reduce((a, A) => a + A.w(q), 0), w2 = ARCHS2.reduce((a, A) => a + A.w(q), 0), p2 = w2 / (w1 + w2);
    for (const A of ARCHS1) E[A.id] += A.w(q) / w1 * (1 - p2);
    for (const A of ARCHS2) E[A.id] += A.w(q) / w2 * p2;
  }
  if (GEN_FAMILIES.length) placeFamilies(E); }
// who's which personality: each family's Trainers take its personalities in turn (in an order shuffled per save), so all of them have Trainers
let PERSONA_DEAL = null;
function personaFor(i, fam) {
  if (i >= 0 && i < LADDER_N && (!PERSONA_DEAL || PERSONA_DEAL.seed !== S.ladder.seed)) {
    // (this save's Trainers' families first: the generated families go where this save has the Trainers for them)
    const turn = {}, order = {}, deal = [], fs = [], n = {};
    for (let j = 0; j < LADDER_N; j++) { fs[j] = archPick(ladderQ(j), seeded(hash("persona" + S.ladder.seed + ":" + j)), S.ladder.seed + ":" + j).id; n[fs[j]] = (n[fs[j]] || 0) + 1; }
    if (GEN_FAMILIES.length) placeFamilies(n);
    for (let j = 0; j < LADDER_N; j++) {
      const f = fs[j], L = personaList(f);
      if (!order[f]) { const r = seeded(hash("personas:" + S.ladder.seed + ":" + f)); order[f] = L.map((P, k) => [r(), k]).sort((a, b) => a[0] - b[0]).map(x => x[1]); turn[f] = 0; }
      deal[j] = L[order[f][turn[f]++ % L.length]];
    }
    PERSONA_DEAL = { seed: S.ladder.seed, deal };
  }
  const list = personaList(fam);
  if (!list.length) return null;
  if (i < 0 || i >= LADDER_N) return list[hash("persona200:" + S.ladder.seed + ":" + i) % list.length];
  const P = PERSONA_DEAL.deal[i];
  return P && P.a === fam ? P : list[hash("persona200:" + S.ladder.seed + ":" + i) % list.length];
}
// what a personality changes: the voice their corpus lines lean to, their traits, favourites, play hours and typing
function applyPersona(p, P, r) {
  p.persona = P.id;
  if (P.v) p.voices[p.voices.length - 1] = P.v;
  for (const k in P.t || {}) p[k] = clamp(p[k] + P.t[k], 0, 1);
  if (P.sch) { p.start = (P.sch[0] + Math.floor(r() * 2)) % 24; p.len = clamp(P.sch[1] * 2.5, 6, 16) * (.8 + r() * .5); }   // (their personality's hours, the start and how long, kept: a lot of play, the owner's rule)
  if (P.st) Object.assign(p.style, P.st);
  const pool = P.op ? P.op.filter(k => OPS[k]) : P.ty ? OP_KEYS.filter(k => OPS[k].types.some(t => P.ty.includes(t))) : null;
  if (pool && pool.length) {
    const fav = [];
    while (fav.length < 3 && pool.length) fav.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    for (const k of p.fav) if (fav.length < 3 && !fav.includes(k)) fav.push(k);
    p.fav = fav;
  }
}
// their favourites among the regions they have open (their own Journeys: the owner's rule): their favourites from those regions,
// then ones their personality loves, then any they'd like there
function favsIn(p, P, key, gens) {
  const r = seeded(hash("favG" + key + [...gens].join())), fav = p.favAll.filter(k => genOk(k, gens));
  const own = P ? (P.op ? P.op.filter(k => OPS[k] && genOk(k, gens)) : P.ty ? OP_KEYS.filter(k => genOk(k, gens) && OPS[k].types.some(t => P.ty.includes(t))) : []) : [];
  for (const pool of [own, OP_KEYS.filter(k => genOk(k, gens) && OPS[k].rar >= (p.q > .6 ? 4 : 3))])
    while (fav.length < 3 && pool.length) { const k = pool.splice(Math.floor(r() * pool.length), 1)[0]; if (!fav.includes(k)) fav.push(k); }
  return fav;
}
const kantoFav = (p, P, key) => favsIn(p, P, key, KANTO_ONLY);
// a Trainer's favourites, bio and Trainer Level for now: their open regions' (trainerGens) and their own progress
function personEra(p) {
  const ladder = p.i != null && p.i >= 0 && p.i < LADDER_N, gens = ladder ? trainerGens(p.i) : playerGens(), e = [...gens].sort().join();
  if (ladder) { p.lvl = trainerAcctLv(p.i); p.joined = Math.max(1, Math.floor(srvDays()) + 1); }
  if (p.era !== e) { p.era = e; p.fav = gens.size >= 9 ? p.favAll : favsIn(p, personaOf(p), p.i, gens); p.bio = fillBio(p.bioT, p); }
  return p;
}
const ARCH_NAME = { veteran: "Veteran", newbie: "New Trainer", whale: "Big spender", f2p: "Free-to-play", collector: "Collector", lore: "Kanto historian", memer: "Joker",
  tryhard: "Competitive", casual: "Casual", mentor: "Mentor", salty: "Salty", lurker: "Lurker", hypebeast: "Hype", roleplayer: "Roleplayer", recruiter: "Recruiter", shy: "Shy",
  specialist: "Type Specialist", challenger: "Challenge Runner", gossip: "Gossip", creative: "Creative", scientist: "Scientist", foodie: "Foodie", student: "Student",
  worker: "Working Adult", traveler: "Traveler", wholesome: "Wholesome", philosopher: "Philosopher", gambler: "Gambler", achiever: "Achiever", rival: "Rival",
  caretaker: "Caretaker", superstitious: "Superstitious" };
// the emotes a Trainer adds to a message now and then, by their voice (HeartGold/SoulSilver's, :name: in the text: EMOTES in a9h_social.js)
const EMOTE_OF = { hype: ["exclaim", "note", "laugh"], warm: ["heart", "happy", "note"], meme: ["laugh", "sick", "dots"], salty: ["grumpy", "angry", "dots"],
  shy: ["dots", "sad", "heart"], chill: ["happy", "note"], whale: ["laugh", "heart", "exclaim"], f2p: ["sad", "dots", "sick"], tryhard: ["angry", "exclaim", "grumpy"],
  newbie: ["question", "happy", "sad"], lore: ["dots", "note"], rp: ["note", "happy"], elder: ["happy", "dots"], mentor: ["happy", "exclaim"], snarky: ["grumpy", "dots"] };
const KAO = ["(｡•̀ᴗ-)✧", "(╯°□°)╯︵ ┻━┻", "ʕ•ᴥ•ʔ", "(´；ω；`)", "(￣▽￣)", "( ˘ω˘ )", "(ง •̀_•́)ง", "¯\\_(ツ)_/¯", "(⌐■_■)", "(・・;)", "(*^▽^*)", "( •̀ ω •́ )✧"];
const LAUGHS = ["lol", "lol", "lmao", "LOL", "xD", "haha", "hahaha", "kek", "www", "lmfao", "ahaha", "rofl", "hehe"];
const ABBR = { you: "u", your: "ur", "you're": "ur", are: "r", though: "tho", "right now": "rn", "to be honest": "tbh", "i don't know": "idk", "in my opinion": "imo",
  probably: "prob", because: "cuz", please: "pls", thanks: "thx", okay: "ok", people: "ppl", really: "rly", tonight: "tn", tomorrow: "tmrw", seriously: "srsly",
  definitely: "def", something: "smth", honestly: "honestly", "not gonna lie": "ngl", "oh my god": "omg", "for real": "fr", "by the way": "btw", "let me know": "lmk" };
const ABBR_RE = new RegExp("\\b(" + Object.keys(ABBR).join("|") + ")\\b", "gi");
const TZS = [-8, -7, -6, -5, -5, -4, -3, 0, 0, 1, 1, 2, 3, 5.5, 7, 8, 8, 8, 9, 9, 10, 11];
// the Journey's big names, for {leader} in chat (someone with no Journey of their own: Kanto's)
const JOURNEY_BOSSES = ["Brock", "Misty", "Lt. Surge", "Erika", "Koga", "Sabrina", "Blaine", "Giovanni", "Lorelei", "Bruno", "Agatha", "Lance", "Blue"];
// A Trainer's own Journey, for their chat (the Journey revamp's phase 4: their chat follows their progress): the region they're on (or
// the last one they finished), where they are in it (a stage and chapter where its Journey is built, else one of its places), the next
// big battle's Trainer, their latest Badge there, their starter there, the regions they have left
const isLadder = p => !!p && p.i != null && p.i >= 0 && p.i < LADDER_N;
function journeyCtx(p) {
  if (!isLadder(p) || typeof trainerProg !== "function") return null;
  const P = trainerProg(p.i), rid = P.region || P.done[P.done.length - 1] || "kanto", ep = journeyOf(rid), r = regionCard(rid) || REGION_KANTO;
  const frac = P.region ? clamp(P.stage / Math.max(1, P.n), 0, .999) : .999;
  let b = Math.min(8, P.badges[rid] || 0), stage, chapter, leader, part = 1, RB = REGION_BADGES[rid];
  if (ep) {
    const M = journeyMain(rid), at = Math.floor(frac * M.length), nd = M[at];
    stage = nd.id; chapter = nd.ch.title;
    // (a Journey in parts: the part they're on, and its own Badges so far)
    if (PART_NAME[rid]) { part = ndPart(nd); RB = regionBadges(rid, part); b = M.slice(0, at).filter(x => ndPart(x) === part && x.badgeWin != null).length; }
    else if (RB && RB.length > 8) b = M.slice(0, at).filter(x => x.badgeWin != null).length;   // (Alola's stamps: all twelve, not their share of eight)
    const boss = M.slice(at).find(isCapBattle) || M.filter(isCapBattle).pop();
    leader = boss ? boss.trainer.name.replace(/^(Leaders?|Elite Four|Champion|Pokémon Trainer|Executive|(Magma|Aqua) (Leader|Admin)|Commanders?|Galactic Boss|(Island )?Kahuna|Captain|Team Skull (Boss|Admin)|Aether (Branch Chief|President)|Ultra Recon Squad|Team Rainbow Rocket Boss) /, "") : "the Champion";
  } else {
    // (a region with more trials than Badges, Alola's eleven: the share of its eight that's done)
    const A = r.areas || [], G = r.gyms || [], gi = Math.floor(b / 8 * G.length);
    stage = A[Math.min(A.length - 1, Math.floor(frac * A.length))] || r.n; chapter = stage;
    leader = P.region && gi < G.length ? G[gi][0] : (r.champ || ["the Champion"])[0];
  }
  const g = r.gyms && r.gyms[Math.max(0, Math.floor(b / 8 * r.gyms.length) - 1)];
  const badge = !b ? "" : RB ? RB[b - 1].n : g ? (r.gymLabel ? `${g[0]}'s ${g[2].toLowerCase()}` : g[2]) : "";
  const prev = P.region ? P.done[P.done.length - 1] : P.done[P.done.length - 2], st = trainerStarter(rid, p.i);
  // (the Professor's help, if it came to them here: trainerLoss; {help} the starter, {hprof} who sent it, {wall} who they lost to)
  const HL = ep ? trainerLoss(p.i, rid) : null, hk = HL && (!P.region || P.stage > HL.at) ? HL.k : null, wn = HL && HL.nd;
  return { P, rid, region: REGION_NAME[rid], stage, chapter, leader, badge, badges: b, prev: prev ? REGION_NAME[prev] : null, part: PART_NAME[rid] ? part : null,
    help: hk ? OPS[hk].n : null, hprof: r.prof[0].split(" or ")[0], wall: wn && wn.trainer ? wn.trainer.name.replace(/^(Leaders?|Pokémon Trainer|Rival) /, "") : null, helpFrac: HL ? HL.at / journeyMain(rid).length : 0,
    starter: st && OPS[st] ? OPS[st].n : "my starter", left: Math.max(0, REGION_IDS.filter(id => journeyOf(id)).length - P.champs), frac };   // (left: the built Journeys they haven't finished)
}
// the Safari Zone's featured areas and event areas are there for someone once every region is open and done: a Trainer's own Journeys
// (all nine), yours for anyone else (specialSafari); until then it's the Whole Park, with the 5★ of their own open regions
const specialFor = p => isLadder(p) && typeof trainerProg === "function" ? trainerProg(p.i).champs >= REGION_IDS.length : specialSafari();
const PARK_FIVES = {};
const parkFives = p => { const G = isLadder(p) ? trainerGens(p.i) : playerGens(), key = [...G].sort().join(); return PARK_FIVES[key] || (PARK_FIVES[key] = OP_KEYS.filter(k => OPS[k].rar === 5 && !OPS[k].leg && genOk(k, G))); };
function stat(k, n = 1) { S.stats[k] = (S.stats[k] || 0) + n; }
function spend(k, n) { if (k === "orundum") gemsOut(n, "Club"); else if (WALLET.includes(k)) S[k] -= n; else if (k === "sanity") S.sanity -= n; else if (HELD[k]) S.held[k] = (S.held[k] || 0) - n; else S.inv[k] = (S.inv[k] || 0) - n; }

const PEOPLE = new Map();
const rr = (rng, [a, b]) => a + (b - a) * rng();
// the personality of Trainer i (deterministic per save), as they are now (personEra: their progress)
const person = i => personEra(personBase(i));
// who they are, without their progress (their schedule, personality, favourites: trainerProg in a6i_servers.js reads these)
function personBase(i) {
  const key = S.ladder.seed + ":" + i;
  if (PEOPLE.has(key)) { const pp = PEOPLE.get(key); if (i >= 0 && i < LADDER_N) pp.name = ladderName(S.ladder.seed, i); return pp; }   // (names can shift when you rename yourself)
  const q = ladderQ(i), name = i >= 0 && i < LADDER_N ? ladderName(S.ladder.seed, i) : docName(seeded(hash(key))), rng = seeded(hash("persona" + key));
  const A = archPick(q, rng, key);
  const extra = ["warm", "hype", "chill", "salty", "snarky", "meme", "shy"][Math.floor(rng() * 7)];
  const voices = [...A.v, extra];
  const style = {
    lower: rng() < .55, caps: rng() < .04, noPunct: rng() < .5, abbr: rng() < .45 ? .3 + rng() * .6 : 0, typo: rng() < .25 ? .1 + rng() * .25 : 0,
    laugh: LAUGHS[Math.floor(rng() * LAUGHS.length)], emote: rng() < .4 ? (EMOTE_OF[A.v[0]] || EMOTE_OF.warm) : null, emojiRate: .15 + rng() * .4,
    kao: rng() < .1, stretch: rng() < .2, exclaim: rng() < .3 ? "!!" : rng() < .2 ? "!!!" : "!", ellipsis: rng() < .15, tilde: rng() < .07,
  };
  // favourites: what they love; collectors and roleplayers pick from anywhere
  const pool = (A.id === "collector" || A.id === "roleplayer" || rng() < .3) ? OP_KEYS.filter(k => OPS[k].rar >= 4) : OP_KEYS.filter(k => OPS[k].rar >= (q > .6 ? 5 : 3));
  const fav = [];
  while (fav.length < 3) { const k = pool[Math.floor(rng() * pool.length)]; if (!fav.includes(k)) fav.push(k); }
  const p = {
    i, q, name, arch: A.id, voices,
    soc: rr(rng, A.soc), warm: rr(rng, A.warm), salt: rr(rng, A.salt), help: rr(rng, A.help), humor: rng(), loyal: rng(), ego: rng() * (.4 + q * .6),
    style, fav, tz: TZS[Math.floor(rng() * TZS.length)] + (rng() < .5 ? 0 : 1),
    // (online a lot, but not all the time: the owner's rule, 2026-10-15; most of a day, most days, at the Demo's pace a region in a few hours)
    start: 7 + Math.floor(rng() * 16), len: 8 + rng() * (A.id === "lurker" ? 5 : 8) + (q > .8 ? 2 : 0), act: .7 + rng() * .3 + (q > .8 ? .1 : 0),
    lvl: 1,   // (their Trainer Level: their own progress, trainerAcctLv; personEra keeps it up to date)
    bio: rng(),   // which bio: picked below from the ones that fit this Trainer (pickBio in a6f_talk.js)
    joined: 0,
  };
  // (everyone started when this world did, the owner's rule: joined is the world's day, personEra)
  const pr = seeded(hash("persona200:" + key)), P = personaFor(i, A.id);
  if (P) applyPersona(p, P, pr);
  p.joined = Math.max(1, Math.floor(srvDays()) + 1);
  p.bioT = P && P.bio && pr() < .4 ? P.bio : typeof DOC_BIOS !== "undefined" && DOC_BIOS.length ? pickBio(p.bio, p) : "Pokémon Trainer from Kanto.";
  p.favAll = p.fav;
  PEOPLE.set(key, p);
  if (PEOPLE.size > LADDER_N + 1000) PEOPLE.delete(PEOPLE.keys().next().value);   // (room for every Trainer: a loop over them must never push one out)
  return p;
}
// bios may use a few chat slots; fill the ones that make sense without the live world
const fillBio = (t, p) => t.replace(/\{op\}/g, OPS[p.fav[0]].n).replace(/\{op2\}/g, OPS[p.fav[1]].n).replace(/\{me\}/g, p.name).replace(/\{lvl\}/g, p.lvl)
  .replace(/\{six\}/g, OPS[p.fav.find(k => OPS[k].rar === 5) || p.fav[0]].n).replace(/\{leader\}/g, () => { const J = journeyCtx(p); return J ? J.leader : JOURNEY_BOSSES[p.i % JOURNEY_BOSSES.length]; }).replace(/\{[a-z0-9]+\}/g, "");
const npcState = i => (S.npc[i] = S.npc[i] || {});
const npcName = i => i === -1 ? S.name : i === -2 ? "System" : person(i).name;

// ---------- presence ----------
// online during their play window on days they play, plus a short daily check-in
function isOnline(i, now = Date.now()) {
  const p = person(i), local = now + p.tz * 3600e3, day = Math.floor(local / 864e5), h = (local % 864e5) / 3600e3;
  if (S.npc[i] && S.npc[i].away > now) return false;
  if (i >= 0 && i < LADDER_N && now >= worldStart() && now < worldStart() + launchHours(i) * 36e5) return true;   // (a new world's first session: trainerHours)
  if (seeded(hash(i + ":day" + day))() < p.act) {
    const s = p.start, e = s + p.len;
    if ((h >= s && h < e) || (e > 24 && h < e - 24)) return true;
  }
  const ci = hash(i + "ci" + day) % 24;
  return h >= ci && h < ci + .34;
}
let ONLINE = { t: 0, list: [] };
function onlineNow(now = Date.now()) {
  if (Math.abs(now - ONLINE.t) < 60000 && ONLINE.list.length) return ONLINE.list;
  const list = [];
  for (let i = 0; i < LADDER_N; i++) if (isOnline(i, now)) list.push(i);
  return (ONLINE = { t: now, list }).list;
}
function nextOnline(i, now) { for (let t = now; t < now + 30 * 3600e3; t += 10 * 60e3) if (isOnline(i, t)) return t + Math.random() * 5 * 60e3; return now + 24 * 3600e3; }
function lastSeen(i, now = Date.now()) { if (isOnline(i, now)) return 0; for (let t = now; t > now - 7 * 864e5; t -= 30 * 60e3) if (isOnline(i, t)) return now - t; return 7 * 864e5; }

// ---------- typing style ----------
function styleText(p, txt) {
  const st = p.style, rnd = Math.random;
  let s = txt;
  if (st.abbr) s = s.replace(ABBR_RE, w => rnd() < st.abbr ? ABBR[w.toLowerCase()] || w : w);
  s = s.replace(/\b(lol|lmao|haha)\b/gi, () => st.laugh);
  if (st.lower) s = s.toLowerCase();
  if (st.noPunct) s = s.replace(/[.,](?=\s|$)/g, "").replace(/'/g, rnd() < .5 ? "" : "'");
  if (st.ellipsis && rnd() < .35) s = s.replace(/[.!]?$/, "...");
  if (st.exclaim !== "!") s = s.replace(/!+$/, st.exclaim);
  if (st.stretch && rnd() < .3) s = s.replace(/\b(so|no|yes|omg|nice|please|pls|why|what)\b/i, w => w + w.slice(-1).repeat(2 + Math.floor(rnd() * 3)));
  if (st.typo && rnd() < st.typo) { const ws = s.split(" "), j = Math.floor(rnd() * ws.length), w = ws[j]; if (w.length > 4) { const c = 1 + Math.floor(rnd() * (w.length - 3)); ws[j] = w.slice(0, c) + w[c + 1] + w[c] + w.slice(c + 2); s = ws.join(" "); } }
  if (st.caps && rnd() < .6) s = s.toUpperCase();
  if (st.emote && rnd() < st.emojiRate) s += " :" + st.emote[Math.floor(rnd() * st.emote.length)] + ":";
  else if (st.kao && rnd() < .3) s += " " + KAO[Math.floor(rnd() * KAO.length)];
  if (st.tilde && rnd() < .4) s += "~";
  return s.trim().slice(0, 180);
}

// ---------- lines ----------
const LINES_FALLBACK = {
  reply_default: ["true", "same", "fair", "real", "yeah", "mood"], greet_generic: ["hi all", "hey everyone", "o/"], reply_greet: ["hey {to}", "hi {to}!", "yo {to}"],
  reply_congrats: ["grats {to}!", "nice catch {to}", "congrats!!"], reply_condolence: ["rip", "unlucky {to}", "it'll come"], quiet: ["o7", "same", "lol"],
};
const RECENT_LINES = [];
// what a line claims has to be true of whoever says it: a maxed Pokémon, level 100 or the Hall of Fame only from a Trainer who has
// finished their own Kanto Journey (their Pokémon at Lv 70: trainerKanto); "one of my favourites too" only about one of theirs
const CLAIM_DONE = /\bto max\b|\bmaxed\b|level 100|\bLv ?100\b|Hall of Fame/i, CLAIM_FAV = /favou?rites? too|\blike \{op2\} too|\bLove \{op2\} too/i;
// (a featured area, a Legendary Safari: only for someone who has them, specialFor; "since launch", "the old days": a world a month old
// or more, since everyone started together; "Day one on...": its first day)
const CLAIM_SAFARI = /\{banner\}|\{legend\}|featured area|legendary safari|mythical distribution|50\/50|step-?up|great ball safari|event area/i;
const CLAIM_OLD = /launch|old days|back in the day|\byears\b|day one(?! on)/i, CLAIM_FRESH = /^day one on/i;
const claimsOk = (t, p, sl) => !(CLAIM_DONE.test(t) && !(p.i != null && p.i >= 0 && p.i < LADDER_N ? trainerDone(p.i) : (p.lvl || 0) >= 70))
  && !(CLAIM_FAV.test(t) && !(sl && sl.opK && p.fav.includes(sl.opK)))
  && !(CLAIM_SAFARI.test(t) && !specialFor(p)) && !(CLAIM_OLD.test(t) && srvDays() < 30) && !(CLAIM_FRESH.test(t) && srvDays() >= 1);
// a chat line about a region (its `r`: an id or a list) is said only by someone who has opened one of them: a Trainer by their own
// Journeys, anyone else by yours (the Journey revamp: a Hoenn Trainer doesn't reminisce about Lavender Town)
const lineRegionOk = (p, r) => { const G = isLadder(p) && typeof trainerGens === "function" ? trainerGens(p.i) : playerGens(); return !G || G === true || [].concat(r).some(id => G.has(REGION_IDS.indexOf(id) + 1)); };
function linePick(topic, p, sl) {
  const list = (typeof CHAT_LINES !== "undefined" && CHAT_LINES[topic]) || LINES_FALLBACK[topic] || LINES_FALLBACK.reply_default;
  let tot = 0;
  const ws = list.map(e => {
    const v = typeof e === "string" ? null : [].concat(e.v || []), t = typeof e === "string" ? e : e.t;
    let w = !v || !v.length ? 1 : v.some(x => p.voices.includes(x)) ? (v.includes(p.voices[0]) ? 4 : 2.5) : 0;
    if (v && v.length && v.every(x => x === "elder") && srvDays() < 45) w = 0;   // nobody's an old-timer on a new server
    if (RECENT_LINES.includes(t)) w *= .05;
    if (!claimsOk(t, p, sl)) w = 0;
    if (typeof e !== "string" && e.r && !lineRegionOk(p, e.r)) w = 0;   // (a line about a region: only from someone who has opened it)
    tot += w; return w;
  });
  if (tot <= 0) return typeof list[0] === "string" ? list[0] : list[0].t;
  let x = Math.random() * tot;
  for (let k = 0; k < list.length; k++) { x -= ws[k]; if (x <= 0) { const e = list[k], t = typeof e === "string" ? e : e.t; RECENT_LINES.push(t); if (RECENT_LINES.length > 80) RECENT_LINES.shift(); return t; } }
  const e = list[list.length - 1]; return typeof e === "string" ? e : e.t;
}
// the Pokémon a Trainer sees everywhere in Ranked: what's strongest at their own tier (a Beginner meets Lv 1-30 Pokémon, not the
// Master Ball meta), the furthest each line gets within the tier's levels, their own open regions' alone; below
// Master Ball no Legendaries or Mythicals (Trainers there field only the ones they've caught, so they're never everywhere)
const META_TIER = {};
function metaFor(p) {
  const pts = p && S && S.ladder && S.ladder.pop ? S.ladder.pop[p.i] : null; if (pts == null) return metaPool();
  const t = tierIdx(pts), band = tierLevels(t); if (!band) return metaPool();
  const G = trainerGens(p.i), all = [...G].sort().join(), key = t + ":" + all;   // (what they've met: their own open regions)
  return META_TIER[key] || (META_TIER[key] = OP_KEYS.filter(k => fitsBand(k, band) && genOk(k, G) && OPS[k].skills.length >= 2 && (t >= T_MASTER || !LEGENDS.includes(k)) && !OPS[k].evo.some(e => OPS[e.to] && fitsBand(e.to, band) && genOk(e.to, G)))
    .sort((a, b) => metaScore(b) - metaScore(a)).slice(0, 20));
}
const META_OPS = p => metaFor(p);
const STAGE_IDS = () => Object.values(NODES).filter(n => n.waves || n.rivalWaves).map(n => n.id);
function fillSlots(t, p, sl = {}) {
  const bn = bannersNow(), b = pick(bn), g = guildOf(p.i), J = journeyCtx(p), spec = specialFor(p);
  const val = {
    me: p.name, to: sl.to || String(pick(onlineNow())), op: OPS[p.fav[0]].n, op2: sl.op2 || OPS[pick(META_OPS(p))].n,
    six: sl.six || OPS[pick(spec ? b.feat6 : parkFives(p))].n, banner: sl.banner || (spec ? b.n : "the Whole Park"), tier: sl.tier || tierOf(S.ladder.pop[p.i]).n, pts: fmtFull(S.ladder.pop[p.i]),
    guild: sl.guild || (g ? g.name : guildList().length ? pick(guildList()).name : "my Club"), boss: sl.boss || OPS[gBossKey(g || { id: "x" })].n,
    leader: sl.leader || (J ? J.leader : pick(JOURNEY_BOSSES)), stage: sl.stage || (J ? J.stage : pick(STAGE_IDS())), ep: sl.ep || (J ? J.chapter : pick(STORY[0].chapters).title), n: sl.n || (2 + Math.floor(Math.random() * 60)),
    lvl: p.lvl, dmg: sl.dmg || fmt(Math.round((.2 + p.q * 1.5) * (1 + Math.random()) * 1e4)),
    prof: (J ? (regionCard(J.P.route[0]) || REGION_KANTO).prof[0] : S ? profName() : "Prof. Oak").split(" or ")[0],   // (their first region's Professor; Paldea's first named)
    region: J ? J.region : "Kanto", prev: J && J.prev ? J.prev : "Kanto", badge: J && J.badge ? J.badge : "Boulder Badge", badges: J ? J.badges : 1, starter: J ? J.starter : "my starter", left: J ? J.left : 8,
    help: J && J.help ? J.help : "a new starter", hprof: J ? J.hprof : "the Professor", wall: J && J.wall ? J.wall : "the first Gym",
  };
  // the Battle Tower: their own wing (their region's, or one they've opened) and how far up it they are, from their best Pokémon
  if (/\{(wing|wfl|wn|wtop)\}/.test(t)) {
    const P = J && J.P, best = P ? P.best : p.lvl, ws = towerWings().filter(id => !P || !P.gens || P.gens === true || P.gens.has(REGION_IDS.indexOf(id) + 1));
    const w = ws.includes(J && J.rid) ? J.rid : ws[0] || "kanto", F = towerFloors(w);
    const wl = P && P.done ? trainerWingLv(P, w) : best;   // (their own Pokémon of that region, by the floors' caps: towerReach)
    Object.assign(val, { wing: REGION_NAME[w], wn: F.length, wfl: F.filter(T => towerCap(T) <= wl).length, wtop: F.length ? F[F.length - 1].trainer.name : "Red" });
  }
  // the live events
  if (/\{(ev|rank|gems|jackpot|legend|fest|cur|vip|srv|lap)\}/.test(t)) {
    const evs = eventsNow(), rush = evs.find(e => e.type === "rush"), fe = evs.find(e => e.type === "fest"), lg = evs.find(e => e.type === "area" && e.key === "legend"), lot = evs.find(e => e.type === "lucky" && e.key === "lottery");
    Object.assign(val, { ev: rush ? evName(rush) : "rush", rank: 2 + Math.floor(Math.random() * 40), gems: fmtFull(Math.round((5 + Math.random() * 40) * 1000)),
      jackpot: lot ? fmtFull(lotPool(lot).jackpot) : "100,000", legend: lg ? OPS[areaFor(lg).feat6[0]].n : "Zapdos", fest: fe ? FESTS[fe.key].n : "the festival", cur: fe ? ITEMS[festCur(fe.key)].n : "Stardust",
      vip: Math.max(1, npcVip(p.i)), srv: serverName(srvId()), lap: 1 + Math.floor(Math.random() * 8) });
  }
  if (/^\d+$/.test(val.to)) val.to = npcName(+val.to);
  return t.replace(/\{(\w+)\}/g, (m, k) => val[k] != null ? val[k] : m);
}
// one of their personality's own lines ("lead:", "club:" and "noclub:" ones only when that's true of them, "done:" once their own
// Kanto Journey is complete), not one said lately; or, now and then, one of their own details (traitLine)
function personaLine(p) {
  if (Math.random() < .4) { const t = traitLine(p); if (t) return t; }
  const P = personaOf(p); if (!P) return null;
  const g = guildOf(p.i), fits = { lead: !!g && g.lead === p.i, club: !!g, noclub: !g, done: p.i != null && p.i >= 0 && p.i < LADDER_N ? trainerDone(p.i) : regionDoneAt("kanto") != null };
  const ok = P.say.map(s => { const m = /^(lead|club|noclub|done):/.exec(s); return m ? (fits[m[1]] ? s.slice(m[0].length) : null) : s; }).filter(s => s && !RECENT_LINES.includes(s) && claimsOk(s, p));
  if (!ok.length) return null;
  const t = ok[Math.floor(Math.random() * ok.length)];
  RECENT_LINES.push(t); if (RECENT_LINES.length > 80) RECENT_LINES.shift();
  return t;
}
// ---------- every Trainer's thousand details (the owner's ask, 2026-10-15) ----------
// The groups: TRAIT_GROUP_SRC (a6c2_traits.js: "kind|label|options|lines"), seven core ones from their personality (temperament,
// motivation, life, hours, how they type, favourite type and region) and 103 made from game data (a favourite Pokémon and move of
// every type, a least favourite Pokémon of every type, a favourite of every generation and of its starters, a Legendary, Mythical,
// Ultra Beast and Paradox Pokémon, an Ability, and a Pokémon for every letter). A Trainer's answer to each is worked out when it's
// needed, from their key and the group (traitOf), and agrees with what's true of them: their favourites, hours, Club, playstyle and
// their own Kanto Journey (no favourite Gen 3 Pokémon before they've met one)
const OP_SAY = { love: ["I love {t}", "Big fan of {t}"], like: ["I like {t} a lot", "{T}? Pretty good"], meh: ["{T}? No strong feelings", "No strong feelings about {t}"],
  dislike: ["Not a fan of {t}, honestly", "Can't get into {t}"], over: ["Hot take: {t}, overrated", "{T}? Overrated, if you ask me"], under: ["People sleep on {t}", "{T}? So underrated"] };
const traitNorm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9']+/g, " ").trim();
const GEN_RANGE = [[1, 151], [152, 251], [252, 386], [387, 493], [494, 649], [650, 721], [722, 809], [810, 905], [906, 1025]];
const GEN_STARTERS = [["Bulbasaur", "Charmander", "Squirtle"], ["Chikorita", "Cyndaquil", "Totodile"], ["Treecko", "Torchic", "Mudkip"], ["Turtwig", "Chimchar", "Piplup"],
  ["Snivy", "Tepig", "Oshawott"], ["Chespin", "Fennekin", "Froakie"], ["Rowlet", "Litten", "Popplio"], ["Grookey", "Scorbunny", "Sobble"], ["Sprigatito", "Fuecoco", "Quaxly"]];
const LIMIT_N = { legendary: "Legendary", mythical: "Mythical", ultraBeast: "Ultra Beast", paradox: "Paradox Pokémon" };
const traitGens = p => p.i != null && p.i >= 0 && p.i < LADDER_N ? trainerGens(p.i) : playerGens();
const traitDone = p => traitGens(p).size >= 9;
const traitHash = (p, id) => hash("trait:" + (S && S.ladder ? S.ladder.seed : 0) + ":" + p.i + ":" + id);
const hourOf = p => ((Math.floor(p.start) % 24) + 24) % 24;
// the details that have to agree with the Trainer (their hours, their Club, how social they are, their family, their playstyle)
const archIs = (p, ...ids) => ids.includes(p.arch);
const psIs = (p, id) => { const P = personaOf(p); return !!(P && P.ps && P.ps.includes(id)); };
const TRAIT_FIX = {
  "pref:early-bird-or-night-owl": p => hourOf(p) < 10 ? "early bird" : hourOf(p) >= 18 || hourOf(p) < 3 ? "night owl" : undefined,
  "own:favourite-time-to-play": p => { const h = hourOf(p); return h >= 22 || h < 5 ? "late at night" : h < 9 ? (archIs(p, "student") ? "before school" : "before work") : h >= 11 && h < 14 ? "at lunch" : h >= 18 ? "right after dinner" : ["on the bus", "weekend mornings"][traitHash(p, "tp") % 2]; },
  "own:sleep-schedule": p => { const h = hourOf(p), end = h + p.len; return h >= 20 || h < 3 || end > 26 ? "up past two every night" : h < 7 ? "wakes at dawn" : ["naps all the time", "no schedule at all", "sleeps in on weekends", ...(end <= 22 ? ["asleep by ten"] : [])][traitHash(p, "sl") % (end <= 22 ? 4 : 3)]; },
  "pref:solo-or-club-play": p => guildOf(p.i) ? "Club play" : "solo",
  "pref:chat-or-quiet": p => p.soc > .5 ? "chatting" : "staying quiet",
  "pref:introvert-or-extrovert": p => p.soc > .55 ? "extrovert" : p.soc < .4 ? "introvert" : undefined,
  "pref:saving-or-spending-gems": p => archIs(p, "whale") ? "spending" : archIs(p, "f2p") ? "saving" : undefined,
  "pref:winning-or-having-fun": p => archIs(p, "tryhard", "rival", "achiever") ? "winning" : archIs(p, "casual", "wholesome", "lurker") ? "having fun" : undefined,
  "pref:auto-or-manual-battles": p => archIs(p, "tryhard", "scientist", "rival") ? "manual" : archIs(p, "casual", "lurker", "worker") ? "Auto" : undefined,
  "own:competitiveness": p => archIs(p, "tryhard", "rival") ? "super competitive" : archIs(p, "casual", "wholesome", "lurker") ? "not at all" : undefined,
  "pref:sun-team-or-rain-team": p => psIs(p, "sun") ? "sun team" : psIs(p, "rain") ? "rain team" : undefined,
  "pref:trick-room-or-tailwind": p => psIs(p, "trickroom") ? "Trick Room" : psIs(p, "tailwind") ? "Tailwind" : undefined,
  "pref:kanto-or-newer-regions": p => traitDone(p) ? undefined : "Kanto",
  "pref:shiny-or-regular-colours": p => { const P = personaOf(p); return P && P.core && P.core.motive === "shiny" ? "shiny" : undefined; },
};
function traitGroups() {
  if (traitGroups.v) return traitGroups.v;
  const G = [], seen = new Set(), add = g => { g.key = traitNorm(g.label); if (!seen.has(g.id)) { seen.add(g.id); G.push(g); } };
  const core = p => { const P = personaOf(p); return P && P.core ? P.core : null; }, byId = (L, id) => L.find(x => x.id === id);
  const famHash = (p, L, id) => { const fit = L.filter(x => x.b && x.b.includes(p.arch)); return fit.length ? fit[traitHash(p, id) % fit.length] : null; };
  // the seven core groups: from a personality made of them, else what fits the Trainer's family (a life only from their own)
  add({ id: "core:temper", kind: "own", label: "temperament", tm: ["People say I'm {x}", "I'm pretty {x}, honestly"], val: p => { const c = core(p), T = c ? byId(TRAIT_TEMPER, c.temper) : famHash(p, TRAIT_TEMPER, "temper"); return T ? T.n.toLowerCase() : null; } });
  add({ id: "core:motive", kind: "own", label: "what drives them", tm: ["These days I'm {x}", "Mostly I'm {x}"], val: p => { const c = core(p), M = c ? byId(TRAIT_MOTIVE, c.motive) : famHash(p, TRAIT_MOTIVE, "motive"); return M ? M.bio : null; } });
  add({ id: "core:life", kind: "own", label: "life outside the game", tm: ["Outside the game: {x}", "Away from Pokémon I'm {x}"], val: p => { const c = core(p), L = c && c.life ? byId(TRAIT_LIFE, c.life) : null; return L ? L.bio : null; } });
  add({ id: "core:sched", kind: "own", label: "hours", tm: ["I'm usually on {x}", "You'll find me online {x}"], val: p => `from about ${hourOf(p)}:00, for ${Math.max(1, Math.round(p.len))} hours or so` });
  add({ id: "core:speech", kind: "own", label: "typing style", quiet: 1, tm: ["{x}"], val: p => { const c = core(p), s = c ? byId(TRAIT_SPEECH, c.speech) : null; return s ? s.say : null; } });
  add({ id: "core:type", kind: "fav", label: "type", val: p => { const c = core(p); return c && c.type || OPS[p.fav[0]].types[0]; } });
  add({ id: "core:region", kind: "fav", label: "region", val: p => { const G = traitGens(p), c = core(p), R = c ? byId(TRAIT_REGION, c.region) : TRAIT_REGION[traitHash(p, "region") % TRAIT_REGION.length];
    if (R && G.has(REGION_IDS.indexOf(R.id) + 1)) return R.n; const own = [...G].sort((a, b) => a - b)[0] || 1; return REGION_NAME[REGION_IDS[own - 1]]; } });
  // the life details
  for (const s of TRAIT_GROUP_SRC) {
    const [kind, label, o, t] = s.split("|");
    if (kind === "op") add({ id: "op:" + traitNorm(label).replace(/ /g, "-"), kind, label, opts: o ? o.split(";") : Object.keys(OP_SAY), custom: !!o });
    else add({ id: kind + ":" + traitNorm(label).replace(/ /g, "-"), kind, label, opts: o.split(";"), tm: t ? t.split(";") : null });
  }
  // from the game: their era's Pokémon (Kanto's alone until their own Kanto Journey is complete), their favourites first
  const mons = (f, G) => OP_KEYS.filter(k => f(k) && genOk(k, G)).map(k => OPS[k].n);
  const favIn = (p, f) => { const k = p.fav.find(f); return k ? OPS[k].n : undefined; };
  const cache = {}, pool = (id, f, G) => { const ck = id + ":" + [...G].sort().join(); return cache[ck] || (cache[ck] = mons(f, G)); };
  const data = (id, kind, label, f, none, opt = {}) => add({ id, kind, label, none, ...opt, val: p => {
    const G = traitGens(p), L = pool(id, f, G); if (!L.length) return null;
    if (kind === "fav") { const own = favIn(p, k => f(k) && genOk(k, G)); if (own) return own; }
    const ok = kind === "least" ? L.filter(n => !p.fav.some(k => OPS[k].n === n)) : L;
    return ok.length ? ok[traitHash(p, id) % ok.length] : null;
  } });
  for (const T of TYPES) {
    data("pk:" + T, "fav", T + "-type Pokémon", k => OPS[k].types.includes(T));
    data("least:" + T, "least", T + "-type Pokémon", k => OPS[k].types.includes(T));
    const mv = Object.keys(MOVES).filter(m => MOVES[m].t === T && MOVES[m].c !== "X" && MOVES[m].p > 0).map(m => MOVES[m].n);
    add({ id: "mv:" + T, kind: "fav", label: T + "-type move", val: p => mv.length ? mv[traitHash(p, "mv:" + T) % mv.length] : null });
  }
  GEN_RANGE.forEach(([a, b], g) => {
    const n = g + 1, none = `I haven't met any Gen ${n} Pokémon yet: I haven't been to ${REGION_NAME[REGION_IDS[g]]}`;
    data("gen:" + n, "fav", `Gen ${n} Pokémon`, k => !OPS[k].form && OPS[k].id >= a && OPS[k].id <= b, none);
    add({ id: "st:" + n, kind: "fav", label: `Gen ${n} starter`, none, val: p => !traitGens(p).has(n) ? null : GEN_STARTERS[g][traitHash(p, "st:" + n) % 3] });
  });
  for (const lim in LIMIT_N) data("lim:" + lim, "fav", LIMIT_N[lim], k => pvpGroups(k).includes(lim) && !OPS[k].form, `I haven't seen a single one yet: not in the regions I've been to`);
  const abs = [...new Set(OP_KEYS.flatMap(k => OPS[k].abs.map(a => abilityOf(a.k).name)).filter(Boolean))].sort();
  add({ id: "ab", kind: "fav", label: "Ability", val: p => abs[traitHash(p, "ab") % abs.length] });
  for (const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") data("letter:" + c, "fav", "Pokémon starting with " + c, k => !OPS[k].form && traitNorm(OPS[k].n).startsWith(c.toLowerCase()), `I haven't met one starting with ${c} yet`);
  return (traitGroups.v = G);
}
// a Trainer's answer to one group: an option, or null when they have none yet (no Gen 3 Pokémon met)
function traitOf(p, G) {
  if (G.val) { const v = G.val(p); if (v !== undefined) return v; }
  const fix = TRAIT_FIX[G.id]; if (fix) { const v = fix(p); if (v !== undefined) return v; }
  return G.opts ? G.opts[traitHash(p, G.id) % G.opts.length] : null;
}
// saying it: unprompted (a chat line) or asked (traitTalk in a6f_talk.js)
function traitSay(p, G, asked) {
  let x = traitOf(p, G); const one = a => a[Math.floor(Math.random() * a.length)], L = G.label;
  if (x == null) return asked && G.none ? G.none : null;
  if (G.kind === "op") return G.custom ? (asked ? cap1(x) : `${cap1(L)}? ${cap1(x)}`) : one(OP_SAY[x]).replace("{t}", L).replace("{T}", cap1(L));
  if (G.kind === "pref") { const o = G.opts.filter(y => y !== x); return o.length === 1 && Math.random() < .5 ? `${cap1(x)} over ${o[0]}, every time` : asked ? `${cap1(x)}, easily` : `${cap1(L)}? ${cap1(x)} for me`; }
  if (G.tm) return cap1(one(G.tm).replace(/\ba \{x\}/, (/^[aeiou]/i.test(x) ? "an " : "a ") + "{x}").replace("{x}", x));
  if (asked && G.kind !== "pref") x = cap1(x);
  if (G.kind === "least") return asked || Math.random() < .5 ? `My least favourite ${L}? ${x}` : `Not a fan of ${x}, honestly`;
  return asked ? `My favourite ${L}? ${x}` : `My favourite ${L} has to be ${x}`;
}
// one of their details, out of the blue (personaLine), not one said lately
function traitLine(p) {
  const G = traitGroups();
  for (let k = 0; k < 6; k++) {
    const g = G[Math.floor(Math.random() * G.length)]; if (g.quiet) continue;
    const t = traitSay(p, g, false);
    if (t && !RECENT_LINES.includes(t) && claimsOk(t, p)) { RECENT_LINES.push(t); if (RECENT_LINES.length > 80) RECENT_LINES.shift(); return t; }
  }
  return null;
}
function npcLine(p, topic, sl) {
  const own = topic === "persona" ? personaLine(p) : null;
  return styleText(p, fillSlots(own || linePick(topic === "persona" ? "quiet" : topic, p, sl), p, sl));
}

// ---------- chat logs ----------
const CHAT_MAX = 70;
function chatInit() {
  S.chat = S.chat || { world: [], guild: [], dm: {}, unread: { world: 0, guild: 0, dm: 0 }, next: 0, gnext: 0, last: 0, q: [] };
  S.npc = S.npc || {};
  S.blocked = S.blocked || {};
}
function pushMsg(ch, m, dmWith) {
  const C = S.chat;
  if (m.i >= 0 && S.blocked[m.i]) return;
  const list = ch === "dm" ? (C.dm[dmWith] = C.dm[dmWith] || []) : C[ch];
  list.push(m);
  if (list.length > CHAT_MAX) list.splice(0, list.length - CHAT_MAX);
  if (m.i >= 0 && ch !== "dm" && S.name && String(m.txt).toLowerCase().includes(S.name.toLowerCase())) (C.lastTo = C.lastTo || {})[ch] = { i: m.i, t: m.t };
  if (ch === "dm") { const keys = Object.keys(C.dm); if (keys.length > 40) { keys.sort((a, b) => (C.dm[a].slice(-1)[0] || {}).t - (C.dm[b].slice(-1)[0] || {}).t); delete C.dm[keys[0]]; } }
  if (m.i !== -1 && !(UI.view === "chat" && UI.chatTab === (ch === "dm" ? "dm:" + dmWith : ch))) {
    if (ch === "dm") { C.unread.dm++; npcState(dmWith).unread = (npcState(dmWith).unread || 0) + 1; }
    else if (ch === "guild") C.unread.guild++;
    else C.unread.world++;
  }
  chatUpdated(ch, m, dmWith);
}
// screens hook in here (a9h_social.js redraws the open chat, the home ticker and badges)
let chatUpdated = () => {};
function npcSay(ch, i, topic, sl = {}, at = Date.now(), dmWith) {
  const p = person(i), txt = npcLine(p, topic, sl);
  pushMsg(ch, { t: at, i, txt }, dmWith != null ? dmWith : i);
  return txt;
}
function sysMsg(ch, txt) { pushMsg(ch, { t: Date.now(), i: -2, txt }); }
// a reply in a few seconds (typing time grows with length)
function later(ms, ch, i, topic, sl, dmWith) { S.chat.q.push({ at: Date.now() + ms, ch, i, topic, sl, dm: dmWith }); }

// ---------- Union Room: what Trainers talk about ----------
function topicFor(p, now) {
  const st = npcState(p.i), local = new Date(now + p.tz * 3600e3), h = local.getUTCHours(), dayKey = Math.floor((now + p.tz * 3600e3) / 864e5);
  const w = {};
  const add = (k, v) => { w[k] = (w[k] || 0) + v; };
  if (st.greet !== dayKey) { add(h < 12 ? "greet_morning" : h >= 18 ? "greet_evening" : "greet_generic", 6); }
  const dow = new Date(now).getUTCDay();
  // (Safari talk only once their Safari Zone is open: their first chapter done)
  const saf = !isLadder(p) || typeof trainerSafariOn !== "function" || trainerSafariOn(p.i, now);
  const spec = specialFor(p); if (spec && saf) { add("banner_hype", dow <= 2 ? 1.6 : .8); add("banner_skip", .3); } if (saf) add("saving_for", .4);
  // their own Journey (phase 4 of the revamp): a new region, a Badge, a Champion title, every region done
  const J = journeyCtx(p);
  if (J) {
    if (!J.P.region) add("journey_all", .35);
    else if (J.prev && J.frac < .12) { add("journey_champ", .45); add("journey_new", .45); }
    else if (J.frac < .06) add("journey_new", .45);
    else if (J.badges) add(J.rid === "alola" ? "journey_stamp" : "journey_badge", .45);   // (Alola's island challenge: stamps)
    if (J.help && J.P.region === J.rid && J.frac < J.helpFrac + .12) add("journey_help", .4);   // (just after the Professor's help)
  }
  if (saf) { add("pull_win", .5 + p.q * .4); add("pull_loss", .7); add("pity_salt", .2 + p.salt * .4); } add("ivs", .2 + p.q * .2);
  const pvp = p.arch === "tryhard" || p.arch === "whale" ? 2 : .5;
  add("pvp_win", .4 * pvp); add("pvp_loss", .5 * pvp * (.5 + p.salt)); add("pvp_meta", .4 * pvp); add("pvp_climb", .2 * pvp); add("rta_draft", .3 * pvp); add("defense_hit", .25 * pvp);
  const nb = p.arch === "newbie" ? 3 : (1 - p.q);
  add("ask_help", .6 * nb); add("ask_build", .4 * nb); add("stuck_stage", .5 * nb * (isLadder(p) && !trainerProg(p.i).region ? 0 : 1));   // (nothing left to be stuck on: every Journey done)
  add("lore", p.arch === "lore" || p.arch === "roleplayer" ? 2 : .3); add("fav_mon", p.arch === "collector" ? 2 : .4);
  add("farming", .5); add("items_rng", .3); add("pp", .35); add("tower", .2); add("cleared_stage", .35 * (1 - p.q) + .1);
  add("irl", .6); add("random_meme", p.arch === "memer" || p.arch === "hypebeast" ? 2 : .4); add("quiet", p.arch === "lurker" || p.arch === "shy" ? 2 : .4);
  if ((S.inbox || []).some(m => /Maintenance|Compensation/.test(m.title) && now - m.t < 864e5)) add("maintenance", .8);
  if (dow === 1) add("event_news", 1);
  // the live events running on this server right now (a6j_live.js and on)
  const evs = typeof eventsNow === "function" && S ? eventsNow() : [];
  if (evs.some(e => e.type === "rush")) add("ev_rush", .8);
  if (evs.some(e => e.type === "rush" && e.key === "gems") || (typeof rushSoon === "function" && rushSoon())) add("ev_gems", 1);
  if (evs.some(e => e.type === "lucky" && e.key === "lottery")) add("ev_lottery", .3);
  if (spec && evs.some(e => e.type === "area" && e.key === "legend")) add("ev_legend", .7);
  if (evs.some(e => e.type === "lucky" && ["wheel", "dice", "box", "hunt", "flip"].includes(e.key))) add("ev_lucky", .5);
  if (evs.some(e => e.type === "fest")) add("ev_fest", 1);
  add("ev_recharge", .3);
  if (typeof srvDays === "function" && srvDays() < 14) add("ev_server", .6);
  const g = guildOf(p.i);
  if (g && g.lead === p.i && g.mem.length < guildCap(g) && g.pol !== "closed") add("guild_recruit", p.arch === "recruiter" ? 3 : 1);
  if (!g && p.soc > .4) add("lfg", .3);
  if (h >= 23 || h < 4) add("leave", 1);
  // their personality: their own lines, and what they bring up more often (only what's going on: an event's topic needs the event)
  const P = personaOf(p);
  if (P) { add("persona", 2.2); for (const k in P.top || {}) if (w[k]) w[k] *= P.top[k]; }
  const F = ARCH_BY[p.arch]; if (F && F.top) for (const k in F.top) if (w[k]) w[k] *= F.top[k];
  let tot = 0; for (const k in w) tot += w[k];
  let x = Math.random() * tot;
  for (const k in w) { x -= w[k]; if (x <= 0) return k; }
  return "quiet";
}
// who answers what (topic → reaction topic and the kind of person who reacts)
const REACT = {
  ask_help: { t: "reply_help_generic", who: p => p.help, n: [1, 2], p: .9, back: "reply_thanks" }, ask_build: { t: "reply_help_build", who: p => p.help, n: [1, 2], p: .85, back: "reply_thanks" },
  stuck_stage: { t: "reply_help_generic", who: p => p.help, n: [1, 1], p: .7, back: "reply_thanks" },
  pull_win: { t: "reply_congrats", who: p => p.warm, n: [1, 3], p: .8 }, pull_loss: { t: "reply_condolence", who: p => p.warm, n: [0, 2], p: .6, alt: ["reply_laugh", p => p.humor * (1 - p.warm)] },
  pity_salt: { t: "reply_condolence", who: p => p.warm, n: [0, 1], p: .5 }, random_meme: { t: "reply_laugh", who: p => p.humor, n: [0, 2], p: .6 },
  lore: { t: "reply_lore", who: p => p.arch === "lore" || p.arch === "roleplayer" ? 1 : .2, n: [0, 1], p: .55 }, fav_mon: { t: "reply_op_love", who: p => p.warm, n: [0, 1], p: .45, alt: ["reply_op_meh", p => p.salt] },
  pvp_meta: { t: "reply_agree", who: p => p.q, n: [0, 2], p: .6, alt: ["reply_disagree", p => p.ego] }, pvp_loss: { t: "reply_condolence", who: p => p.warm, n: [0, 1], p: .4, alt: ["reply_laugh", p => p.humor] },
  greet_morning: { t: "reply_greet", who: p => p.warm, n: [0, 2], p: .55 }, greet_evening: { t: "reply_greet", who: p => p.warm, n: [0, 2], p: .55 }, greet_generic: { t: "reply_greet", who: p => p.warm, n: [0, 1], p: .45 },
  banner_hype: { t: "reply_agree", who: p => p.soc, n: [0, 1], p: .45 }, banner_skip: { t: "reply_disagree", who: p => p.ego, n: [0, 1], p: .35 },
  irl: { t: "reply_default", who: p => p.warm, n: [0, 1], p: .4 }, pvp_climb: { t: "reply_congrats", who: p => p.warm, n: [0, 2], p: .6 }, cleared_stage: { t: "reply_congrats", who: p => p.warm, n: [0, 1], p: .45 },
  persona: { t: "reply_default", who: p => p.warm, n: [0, 1], p: .3 },
  journey_badge: { t: "reply_congrats", who: p => p.warm, n: [0, 2], p: .55 }, journey_champ: { t: "reply_congrats", who: p => p.warm, n: [1, 3], p: .8 },
  journey_new: { t: "reply_default", who: p => p.warm, n: [0, 1], p: .4 }, journey_all: { t: "reply_congrats", who: p => p.warm, n: [0, 2], p: .6 },
  journey_help: { t: "reply_default", who: p => p.warm, n: [0, 1], p: .4 },
  lfg: { t: "reply_mention", who: p => { const g = guildOf(p.i); return g && g.lead === p.i ? 1 : 0; }, n: [0, 1], p: .5 },
};
function pickBy(cands, fn, avoid = []) {
  const c = cands.filter(i => !avoid.includes(i) && !S.blocked[i]);
  let tot = 0; const ws = c.map(i => { const w = Math.max(0, fn(person(i))); tot += w; return w; });
  if (tot <= 0) return null;
  let x = Math.random() * tot;
  for (let k = 0; k < c.length; k++) { x -= ws[k]; if (x <= 0) return c[k]; }
  return c[c.length - 1];
}
function react(ch, from, topic, cands, sl = {}, said) {
  const R0 = REACT[topic]; if (!R0 || Math.random() > R0.p) return;
  // a question with something to answer (a build, a Pokémon, a Gym): helpful Trainers answer it for real
  if (said && /^(ask_help|ask_build|stuck_stage)$/.test(topic) && from >= 0) {
    const n = R0.n[0] + Math.floor(Math.random() * (R0.n[1] - R0.n[0] + 1)), used = [from];
    let at = Date.now() + 5000 + Math.random() * 9000;
    for (let k = 0; k < n; k++) { const i = pickBy(cands, p => p.help * p.help + (p.arch === "mentor" ? .5 : 0), used); if (i == null) break; used.push(i); talkReply(i, ch, from, said, { at }); at += 6000 + Math.random() * 12000; }
    return;
  }
  const n = R0.n[0] + Math.floor(Math.random() * (R0.n[1] - R0.n[0] + 1)), used = [from];
  let delay = 4000 + Math.random() * 9000;
  for (let k = 0; k < n; k++) {
    const i = pickBy(cands, p => R0.who(p) * (.3 + p.soc) * (sl.opK && p.fav.includes(sl.opK) ? 3 : 1), used); if (i == null) break;   // (a fellow fan answers sooner)
    used.push(i);
    let t = R0.t;
    if (R0.alt && Math.random() < R0.alt[1](person(i)) * .6) t = R0.alt[0];
    S.chat.q.push({ at: Date.now() + delay, ch, i, topic: t, sl: { ...sl, ...(sl.opK ? { op2: OPS[sl.opK].n } : {}), to: from === -1 ? S.name : npcName(from) }, toI: from });
    delay += 3000 + Math.random() * 12000;
  }
  if (R0.back && n && from >= 0 && Math.random() < person(from).warm) later(delay + 4000 + Math.random() * 8000, ch, from, R0.back, { to: npcName(used[1]) });
}
function worldEvent(now) {
  const on = onlineNow(now); if (!on.length) return;
  const recent = S.chat.world.slice(-4).map(m => m.i);
  const i = pickBy(on, p => p.soc * p.soc, recent); if (i == null) return;
  const p = person(i), topic = topicFor(p, now), st = npcState(i);
  if (topic.startsWith("greet")) st.greet = Math.floor((now + p.tz * 3600e3) / 864e5);
  const sl = {};
  if (topic === "pull_win") { const k = pick(specialFor(p) ? pick(bannersNow()).feat6 : parkFives(p)); sl.six = OPS[k].n; if (Math.random() < .35) sysMsg("world", `${p.name} caught a 5★ ${OPS[k].n} in the Safari Zone!`); }
  const toI = pickBy(on, q => .2 + q.soc, [i]); if (toI != null) { sl.to = npcName(toI); sl.toI = toI; }
  // (the Pokémon this post is about, so the replies talk about the same one: their own favourite, or the meta Pokémon they name)
  if (topic === "fav_mon") { sl.opK = p.fav[0]; sl.op2 = OPS[p.fav[0]].n; } else if (!sl.op2) sl.op2 = OPS[pick(META_OPS(p))].n;
  const said = npcSay("world", i, topic, sl, now);
  if (toI != null && said.toLowerCase().includes(sl.to.toLowerCase()) && now > Date.now() - 5000) talkFollow({ i, ch: "world", toI, depth: 0 }, said);
  react("world", i, topic, on, sl, said);
}
function worldGap(now) {
  const n = onlineNow(now).length;
  return clamp((35 + Math.random() * 75) * 1000 * 160 / Math.max(25, n), 18000, 240000);
}
// returning after a while: the last stretch of chat is already there
function chatBackfill(now) {
  const C = S.chat, gap = now - (C.last || 0);
  if (gap < 10 * 60e3) return;
  const span = Math.min(gap, 40 * 60e3), n = Math.min(14, Math.round(span / 120e3)), saved = C.q.length;
  for (let k = n; k > 0; k--) { const t = now - k * span / n + Math.random() * 30e3; worldEvent(t); }
  // backfilled reactions land in the past too
  for (const x of C.q.splice(saved)) emitQueued({ ...x, at: Math.min(now, x.at - 60e3) });
  C.unread.world = Math.min(C.unread.world, 9);
}
function emitQueued(x) {
  const at = Math.min(Date.now(), x.at);
  if (x.ch === "dm") { if (S.blocked[x.i]) return; if (x.txt) pushMsg("dm", { t: at, i: x.i, txt: x.txt }, x.i); else npcSay("dm", x.i, x.topic, x.sl, at, x.i); return; }
  if (x.ch === "guild" && !(S.guild && guildOf(x.i) && guildOf(x.i).id === S.guild)) return;
  let txt = x.txt;
  if (txt) pushMsg(x.ch, { t: at, i: x.i, txt }); else txt = npcSay(x.ch, x.i, x.topic, x.sl, at);
  talkFollow(x, txt || "");
}
function chatTick(now) {
  chatInit();
  const C = S.chat;
  chatBackfill(now); C.last = now;
  const due = C.q.filter(x => x.at <= now); C.q = C.q.filter(x => x.at > now);
  for (const x of due) emitQueued(x);
  if (now >= C.next) { if (C.next) worldEvent(now); C.next = now + worldGap(now); }
  if (S.guild && now >= C.gnext) { if (C.gnext) guildChatEvent(now); C.gnext = now + clamp(guildGap(), 30000, 600000); }
}

// ---------- the player talks ----------
const RUDE = /\b(stupid|idiot|dumb|trash|garbage|noob|suck|sucks|shut up|stfu|loser|l2p|cringe|clown|bad at|ez|get good|moron|pathetic|scrub|bot)\b/i;
function opsIn(txt) { const t = " " + txt.toLowerCase() + " "; return OP_KEYS.filter(k => OPS[k].n.length > 2 && new RegExp("[^a-z]" + OPS[k].n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[^a-z]").test(t)); }
function namesIn(txt, cands) { const t = txt.toLowerCase(); return cands.filter(i => { const n = npcName(i).toLowerCase(); return n.length > 2 && t.includes(n); }); }
function classify(txt) {
  const t = txt.toLowerCase();
  return {
    greet: /\b(hi|hello|hey|heya|hiya|yo|sup|gm|good (morning|evening|afternoon)|howdy|greetings|alola)\b|^o\/$/.test(t), bye: /\b(bye|cya|see (ya|you)|gn|good ?night|later|gtg|g2g|smell ya later)\b/.test(t),
    thanks: /\b(thanks|thank you|ty|thx|tysm|appreciate)\b/.test(t), q: /\?\s*$|^(how|what|why|who|which|where|when|should|does|do|is|can|any)\b/.test(t),
    pull: /\b(throw|throws|safari|catch|caught|ball|balls|area|banner|save|skip|pity|gems|rate.?up|featured)\b/.test(t),
    build: /\b(build|team|held|item|ivs?|mastery|evolve|evolution|stone|level|carry|meta|tier ?list|registered|moveset|moves?|type|counter)\b/.test(t),
    lore: /\b(lore|story|mew|missingno|giovanni|rocket|oak|lavender|ghost|mewtwo|bill|kanto|gen ?1|red|blue|silph|cinnabar|mansion)\b/.test(t),
    rude: RUDE.test(t), laugh: /\b(lol|lmao|haha+|xd|lmfao|rofl|kek)\b/.test(t), gg: /\bgg\b/.test(t),
    win: /\b(got|caught|finally|yes+)\b/.test(t) && /(5\s?★|5\*|five|legendary|shiny|featured|dragonite|snorlax|lapras)/.test(t), lose: /\b(spook|spooked|no 5|unlucky|salt|rip|pain|scam|broke out)\b/.test(t),
    guild: /\b(club|clubs|guild|recruit|lf|looking for|join)\b/.test(t),
  };
}
function playerSay(ch, txt, dmWith) {
  chatInit();
  txt = txt.trim().slice(0, 200); if (!txt) return;
  const now = Date.now(), C = S.chat;
  pushMsg(ch, { t: now, i: -1, txt }, dmWith);
  stat("chats");
  // spam: four messages in 20 seconds, or the same one twice, in this room (DMs are their own conversations)
  const mineK = "mine:" + ch, lastK = "lastMine:" + ch;
  const spam = ch !== "dm" && ((C[mineK] = (C[mineK] || []).filter(t => now - t < 20000)).push(now) >= 4 || C[lastK] === txt.toLowerCase());
  C[lastK] = txt.toLowerCase();
  const I = classify(txt), ops = opsIn(txt);
  if (ch === "dm") return dmReply(dmWith, txt, I, ops);
  const cands = ch === "guild" ? guildMembers(S.guild).filter(i => i >= 0 && isOnline(i, now)) : onlineNow(now);
  const recent = (ch === "guild" ? C.guild : C.world).slice(-12).map(m => m.i).filter(i => i >= 0);
  let named = addressees(txt, [...new Set([...recent, ...cands])]).filter(i => isOnline(i, now));
  // no name: a reply to whoever just spoke to them here
  const last = (C.lastTo || {})[ch];
  if (!named.length && last && now - last.t < 120e3 && last.t <= now && isOnline(last.i, now)) named = [last.i];
  const boost = ch === "guild" ? 1.6 : 1, sl = { to: S.name };
  const go = (fn, topic, n, extra = {}) => {
    for (let k = 0; k < n; k++) {
      const i = pickBy(cands, p => fn(p) * (.25 + p.soc), []); if (i == null) return;
      later(3000 + Math.random() * 14000 + k * 6000, ch, i, topic, { ...sl, ...extra });
    }
  };
  if (spam) { if (Math.random() < .6) go(p => p.salt + p.humor * .3, "reply_spam", 1); for (const i of cands.slice(0, 20)) npcState(i).aff = (npcState(i).aff || 0) - .02; return; }
  // named Trainers answer for themselves
  for (const i of named.slice(0, 2)) talkReply(i, ch, -1, txt);
  if (named.length) return;
  if (I.rude) { go(p => p.salt * .8 + (1 - p.warm) * .4, "reply_insulted", Math.random() < .7 ? 1 : 2); for (const i of cands) if (Math.random() < .1) npcState(i).aff = (npcState(i).aff || 0) - .05; return; }
  if (I.greet) { go(p => p.warm, "reply_greet", Math.round(Math.random() * (I.q ? 1 : 2) * boost + .3)); if (!I.q) return; }
  if (I.bye) return go(p => p.warm, "reply_bye", Math.round(Math.random() * 1.5 * boost));
  if (I.win) return go(p => p.warm + .2, "reply_congrats", 1 + Math.round(Math.random() * 1.5 * boost));
  if (I.lose) return go(p => p.warm, Math.random() < .25 ? "reply_laugh" : "reply_condolence", Math.round(.5 + Math.random() * boost));
  if (I.q) {
    // the room: one or two helpful Trainers answer for real (and a newer one might chip in)
    const n = 1 + (Math.random() < .4 * boost ? 1 : 0), used = [];
    let at = now + 4000 + Math.random() * 8000;
    for (let k = 0; k < n; k++) { const i = pickBy(cands, p => p.help * p.help + (p.arch === "mentor" ? .5 : 0), used); if (i == null) break; used.push(i); talkReply(i, ch, -1, txt, { at }); at += 5000 + Math.random() * 10000; }
    if (Math.random() < .2) { const i = pickBy(cands, p => (1 - p.q) * .5, used); if (i != null) talkReply(i, ch, -1, txt, { at: at + 4000 }); }
    return;
  }
  if (ops.length) {
    const lovers = cands.filter(i => person(i).fav.includes(ops[0]));
    if (lovers.length && Math.random() < .8) later(5000 + Math.random() * 9000, ch, pick(lovers), "reply_op_love", { ...sl, op2: OPS[ops[0]].n, opK: ops[0] });
    else go(p => p.ego + p.q * .3, metaScore(ops[0]) > metaScore(metaPool()[20]) ? "reply_op_love" : "reply_op_meh", 1, { op2: OPS[ops[0]].n, opK: ops[0] });
    return;
  }
  if (I.gg) return go(p => p.warm, "reply_default", Math.round(Math.random() * boost));
  if (I.laugh) return Math.random() < .5 ? go(p => p.humor, "reply_laugh", 1) : null;
  if (I.guild && ch === "world" && !S.guild) {
    const leaders = cands.filter(i => { const g = guildOf(i); return g && g.lead === i && g.pol !== "closed" && g.mem.length < guildCap(g); });
    if (leaders.length) { const i = pick(leaders); later(6000 + Math.random() * 10000, "dm", i, "dm_recruit", { to: S.name, guild: guildOf(i).name }, i); setTimeout(() => offerInvite(i), 0); return; }
  }
  if (Math.random() < .35 * boost) go(p => p.warm * .5 + p.soc * .5, Math.random() < .5 ? "reply_agree" : "reply_default", 1);
}
// a message to one Trainer: they read it and answer in their own voice (a6f_talk.js); offline, they answer once they're back
function dmReply(i, txt) { talkReply(i, "dm", -1, txt); }
// Stadium battles leave an impression: some Trainers send a message afterwards
function contractDM(i, playerWon, kind = "cc") {
  chatInit();
  const p = person(i), st = npcState(i), now = Date.now();
  st.met = (st.met || 0) + 1;
  let topic = null;
  if (playerWon) {
    if (Math.random() < .08 + p.salt * .2) topic = "dm_salty_loss", st.aff = (st.aff || 0) - .05;
    else if (Math.random() < .06 + p.warm * .12) topic = kind === "cc" && Math.random() < .5 ? "dm_defense_beaten" : "dm_gg_loss";
  } else if (Math.random() < .05 + p.ego * .12 + p.warm * .05) topic = "dm_gg_win";
  if (!topic || !isOnline(i, now)) return;
  S.chat.q.push({ at: now + 6000 + Math.random() * 20000, ch: "dm", i, topic, sl: { to: S.name }, dm: i });
}

// =====================================================================
//  CLUBS
// =====================================================================
const GUILD_COL = ["#e3350d", "#3b7dd8", "#f2b63a", "#2a9a5a", "#7a3fb8", "#e85aa8", "#c8a06a", "#5d8a3a", "#2a5aa8", "#d86a3a"];
// a Club's emblem is its mascot Pokémon
const GUILD_EMBLEMS = ["pikachu", "eevee", "charmander", "squirtle", "bulbasaur", "jigglypuff", "psyduck", "snorlax", "gengar", "dragonite", "lapras", "meowth",
  "clefairy", "vulpix", "growlithe", "abra", "magikarp", "gyarados", "scyther", "pidgey", "zubat", "onix", "cubone", "ditto", "porygon", "slowpoke",
  "chikorita", "cyndaquil", "totodile", "togepi", "umbreon", "espeon", "treecko", "torchic", "mudkip", "turtwig", "chimchar", "piplup", "riolu", "lucario",
  "gible", "munchlax", "snivy", "tepig", "oshawott", "zorua"].filter(k => OPS[k]);
const guildCap = g => Math.min(30, 20 + g.lvl);
const gxpNeed = l => 1500 + l * 1200;
let GIDX = null;   // npc index → Club id (rebuilt from S.gw)
function guildWorld() {
  if (S.gw && S.gw.seed === S.ladder.seed) { if ((S.gw.n || LADDER_OLD) < LADDER_N) guildGrow(); return S.gw; }
  const rng = seeded(hash("guilds" + S.ladder.seed));
  const guilds = guildsFor(0, LADDER_N, rng, new Set(), 0);
  S.gw = { seed: S.ladder.seed, list: guilds, seq: guilds.length, n: LADDER_N };
  GIDX = null;
  return S.gw;
}
// a save from the 1,500 days: the newer Trainers start Clubs of their own (one for about every 21) and join the ones with room
function guildGrow() {
  const W = S.gw, from = W.n || LADDER_OLD, rng = seeded(hash("guildgrow" + S.ladder.seed));
  const fresh = guildsFor(from, LADDER_N, rng, new Set(W.list.map(g => g.name)), W.seq, W.list);
  W.list.push(...fresh); W.seq += fresh.length; W.n = LADDER_N; GIDX = null;
}
// the Clubs Trainers [from, to) start (their leaders), then those Trainers join a Club near their own strength (old ones too)
function guildsFor(from, to, rng, used, seq, old = []) {
  const A = typeof GUILD_NAME_A !== "undefined" ? GUILD_NAME_A : ["Pallet", "Cerulean", "Celadon", "Saffron", "Indigo"],
    Bn = typeof GUILD_NAME_B !== "undefined" ? GUILD_NAME_B : ["Trainers", "Rangers", "Squad", "Club", "League"], descs = typeof GUILD_DESCS !== "undefined" ? GUILD_DESCS : ["Friendly Club, all Trainers welcome."];
  const G = Math.round((to - from) / 21), guilds = [];
  // leaders: sociable, loyal Trainers (recruiters love it)
  const cand = [];
  for (let i = from; i < to; i++) { const p = person(i); cand.push([i, p.soc * .6 + p.loyal * .4 + (p.arch === "recruiter" ? .6 : 0) + (p.arch === "lurker" ? -1 : 0) + rng() * .5]); }
  cand.sort((a, b) => b[1] - a[1]);
  const leaders = cand.slice(0, G).map(c => c[0]);
  for (const lead of leaders) {
    let name;
    for (let t = 0; t < 20; t++) { name = A[Math.floor(rng() * A.length)] + " " + Bn[Math.floor(rng() * Bn.length)]; if (!used.has(name)) break; }
    used.add(name);
    const q = person(lead).q, minLvl = Math.min(q > .8 ? 60 + Math.floor(rng() * 4) * 10 : q > .5 ? 20 + Math.floor(rng() * 4) * 10 : Math.floor(rng() * 3) * 5, Math.floor(srvLevel(.5, 100) / 5) * 5);
    const tag = name.split(" ").map(w => w[0]).join("").toUpperCase() + (rng() < .5 ? String.fromCharCode(65 + Math.floor(rng() * 26)) : "");
    guilds.push({ id: "g" + (seq + guilds.length), name, tag, col: GUILD_COL[Math.floor(rng() * GUILD_COL.length)], em: GUILD_EMBLEMS[Math.floor(rng() * GUILD_EMBLEMS.length)],
      lvl: clamp(Math.round((1 + Math.floor(q * 8 + rng() * 3)) * Math.min(1, srvDays() / 60)), 1, 12), xp: Math.floor(rng() * 1500 * Math.min(1, srvDays() / 60)), lead, off: [], mem: [lead], q,
      pol: rng() < .15 ? "closed" : q > .6 || rng() < .3 ? "approval" : "open", minLvl,
      desc: descs[Math.floor(rng() * descs.length)].replace(/\{lvl\}/g, minLvl || 1).replace(/\{tier\}/g, tierOf(srvRating(q)).n).replace(/\{op\}/g, OPS[GUILD_EMBLEMS[0]].n).replace(/\{[a-z0-9]+\}/g, ""),
      made: Date.now() - Math.floor(rng() * Math.min(600, srvDays())) * 864e5 });
  }
  // members: stronger Trainers are almost always in a Club, near their own strength
  const all = [...old.filter(g => !g.mine), ...guilds];
  for (let i = from; i < to; i++) {
    if (leaders.includes(i)) continue;
    const p = person(i);
    if (rng() > .3 + .55 * p.q - (p.arch === "lurker" ? .2 : 0)) continue;
    let best = null, bs = -1;
    for (let t = 0; t < 8; t++) { const g = all[Math.floor(rng() * all.length)]; if (g.mem.length >= guildCap(g) - 2) continue; const s = 1 - Math.abs(g.q - p.q) + rng() * .3; if (s > bs) { bs = s; best = g; } }
    if (best) best.mem.push(i);
  }
  for (const g of guilds) g.off = g.mem.filter(i => i !== g.lead).sort((a, b) => person(b).loyal - person(a).loyal).slice(0, 2);
  return guilds;
}
const guildList = () => guildWorld().list;
const guildById = id => guildList().find(g => g.id === id) || null;
function guildIndex() {
  if (GIDX && GIDX.n === S.gw.list.reduce((a, g) => a + g.mem.length, 0) + S.gw.list.length) return GIDX.map;
  const map = new Map();
  for (const g of guildList()) for (const i of g.mem) map.set(i, g.id);
  GIDX = { map, n: S.gw.list.reduce((a, g) => a + g.mem.length, 0) + S.gw.list.length };
  return map;
}
const guildOf = i => { if (i === -1) return S.guild ? guildById(S.guild) : null; const id = guildIndex().get(i); return id ? guildById(id) : null; };
const guildMembers = id => (guildById(id) || { mem: [] }).mem;
const myGuild = () => S.guild ? guildById(S.guild) : null;
const myRole = () => { const g = myGuild(); return !g ? null : g.lead === -1 ? "leader" : g.off.includes(-1) ? "officer" : "member"; };
const canInvite = () => myRole() === "leader" || myRole() === "officer";
const guildPower = g => g.mem.reduce((a, i) => a + (i === -1 ? .7 : person(i).q), 0);
function joinGuild(g) {
  if (S.guild) leaveGuild(true);
  S.guild = g.id; g.mem.push(-1); GIDX = null;
  S.gJoined = Date.now(); stat("guilds");
  S.chat.guild = [];
  sysMsg("guild", `${S.name} joined the Club.`);
  const on = g.mem.filter(i => i >= 0 && isOnline(i));
  for (let k = 0, n = Math.min(on.length, 1 + Math.floor(Math.random() * 3)); k < n; k++) later(3000 + k * 5000 + Math.random() * 6000, "guild", on[Math.floor(Math.random() * on.length)], "g_welcome", { to: S.name });
  S.gReq = []; S.gInv = (S.gInv || []).filter(x => x.gid !== g.id);
}
function leaveGuild(quiet) {
  const g = myGuild(); if (!g) return;
  g.mem = g.mem.filter(i => i !== -1); g.off = g.off.filter(i => i !== -1); GIDX = null;
  if (g.lead === -1) {
    // the Club carries on under its most loyal Co-leader, or disbands when empty
    const next = g.off[0] != null ? g.off[0] : g.mem.slice().sort((a, b) => person(b).loyal - person(a).loyal)[0];
    if (next == null) S.gw.list = S.gw.list.filter(x => x !== g);
    else { g.lead = next; g.off = g.off.filter(i => i !== next); }
  }
  S.guild = null; S.gLeft = Date.now(); S.gApps = [];
  if (!quiet) { S.chat.guild = []; }
}
function createGuild(name, tag, desc, pol, minLvl, em) {
  const g = { id: "g" + (S.gw.seq++), name, tag, col: GUILD_COL[Math.floor(Math.random() * GUILD_COL.length)], em: em || GUILD_EMBLEMS[Math.floor(Math.random() * GUILD_EMBLEMS.length)],
    lvl: 1, xp: 0, lead: -1, off: [], mem: [], q: .5, pol, minLvl, desc, made: Date.now(), mine: 1 };
  S.gw.list.push(g);
  joinGuild(g);
  return g;
}
// the player asks to join a Club; its leader (or a Co-leader) decides when they're online
function requestJoin(g) {
  S.gReq = (S.gReq || []).filter(x => x.gid !== g.id);
  if (g.pol === "open") { if (S.lvl >= g.minLvl) { joinGuild(g); return "joined"; } return "level"; }
  if (g.pol === "closed") return "closed";
  S.gReq.push({ gid: g.id, t: Date.now() });
  return "sent";
}
function offerInvite(i, at = Date.now()) {
  const g = guildOf(i); if (!g || S.guild || g.mem.length >= guildCap(g)) return;
  S.gInv = (S.gInv || []).filter(x => x.gid !== g.id);
  S.gInv.push({ gid: g.id, i, t: at });
}
// the player invites a Trainer; they think it over and answer by message
function inviteNpc(i) {
  S.gSent = (S.gSent || []).filter(x => x.i !== i);
  S.gSent.push({ i, t: Date.now(), at: isOnline(i) ? Date.now() + 8000 + Math.random() * 40000 : nextOnline(i, Date.now()) });
}
function inviteDecision(i, g) {
  const p = person(i), st = npcState(i), cur = guildOf(i);
  if (g.mem.length >= guildCap(g)) return false;
  let pr = cur ? .08 * (1 - p.loyal) : .55;
  pr += (st.aff || 0) * .6 + (g.lvl - 5) * .02;
  if (p.q > .75 && guildPower(g) / Math.max(1, g.mem.length) < .5) pr -= .3;
  if (p.arch === "lurker") pr -= .2;
  if (p.lvl < g.minLvl) pr = 0;
  return Math.random() < clamp(pr, 0, .95);
}
function moveNpc(i, g) {
  const cur = guildOf(i);
  if (cur) { cur.mem = cur.mem.filter(x => x !== i); cur.off = cur.off.filter(x => x !== i); if (cur.lead === i) { cur.lead = cur.off[0] != null ? cur.off[0] : cur.mem[0]; if (cur.lead == null) S.gw.list = S.gw.list.filter(x => x !== cur); } }
  if (g) g.mem.push(i);
  GIDX = null;
}

// ---------- Raid Battles: one huge Pokémon per week, stage after stage; members get 2 Raid Passes a day ----------
const GBOSS_KEYS = () => ["snorlax", "gyarados", "lapras", "dragonite", "articuno", "zapdos", "moltres", "mewtwo", "gengar", "onix", "charizard", "kangaskhan"].filter(k => OPS[k]);
const gbLV = stage => Math.min(100, 28 + stage * 7);
const GB_TURNS = 12;
const GB_REF_TEAM = ["blastoise", "alakazam", "snorlax", "jolteon"];
function gbRef(key, LV) {
  // damage a solid team does in one attempt, to size the HP pools (cached)
  const ck = key + ":" + LV; gbRef.c = gbRef.c || {};
  if (gbRef.c[ck]) return gbRef.c[ck];
  const B = makeBattle({ allies: GB_REF_TEAM.map(k => ({ op: k, prog: progForLV(k, LV), mine: false })), waves: [[{ op: key, LV, maxHp: 1e9, boss: true }]], auto: true, aiStyle: "balanced", turnLimit: GB_TURNS, sim: true });
  let g = 0; while (!B.over && g++ < 3000) { const r = B.step(); if (r === "input") B.autoAct(); B.ev.length = 0; }
  return (gbRef.c[ck] = Math.max(500, B.damageBy("A")));
}
const gBossKey = g => { const keys = GBOSS_KEYS(); return g.boss && g.boss.week === weekId() ? g.boss.key : keys[(weekId() + hash(g.id)) % keys.length]; };
function gBoss(g) {
  if (!g) return null;
  const w = weekId();
  if (!g.boss || g.boss.week !== w) {
    const key = gBossKey(g);
    g.boss = { week: w, key, stage: 1, ref: 0, hp: 0, max: 0, hits: {}, day: today(), tries: {}, log: [] };
    gbStage(g.boss, 1);
  }
  return g.boss;
}
function gbStage(b, stage) {
  b.stage = stage; b.ref = gbRef(b.key, gbLV(stage)); b.max = Math.round(b.ref * (7 + stage * 1.5)); b.hp = b.max;
}
function gbHit(g, who, dmg) {
  const b = gBoss(g); let cleared = 0;
  b.hits[who] = (b.hits[who] || 0) + dmg;
  b.log.unshift({ t: Date.now(), i: who, dmg }); if (b.log.length > 40) b.log.length = 40;
  while (dmg > 0) {
    const d = Math.min(dmg, b.hp); b.hp -= d; dmg -= d;
    if (b.hp <= 0) { cleared++; gbCleared(g, b); gbStage(b, b.stage + 1); }
    if (cleared > 3) break;
  }
  return cleared;
}
function gbCleared(g, b) {
  if (g.id !== S.guild) return;
  sysMsg("guild", `The Raid ${OPS[b.key].n} (stage ${b.stage}) was defeated! Stage ${b.stage + 1} is open.`);
  sendMail({ from: "Pokémon League", tag: "gift", title: `Raid Battle: ${OPS[b.key].n} stage ${b.stage} cleared`, body: `${g.name} brought down stage ${b.stage}. Here's your share of the rewards!`,
    rewards: { lmd: 2500 + b.stage * 1000, orundum: 60 + b.stage * 20, ...(b.stage % 3 === 0 ? { summ: 2 } : { rec3: 2 }) } });
  const on = g.mem.filter(i => i >= 0 && isOnline(i));
  if (on.length) later(4000 + Math.random() * 8000, "guild", pick(on), "g_boss_down", {});
}
const gbTriesLeft = () => { const g = myGuild(); if (!g) return 0; const b = gBoss(g); if (b.day !== today()) { b.day = today(); b.tries = {}; } return 2 - (b.tries[-1] || 0); };

// ---------- Club life: contributions, Raid Battles, comings and goings ----------
const DONATIONS = [
  { id: "lmd", n: "Standard", cost: { lmd: 5000 }, xp: 100, give: { cert: 20, tokens: 10 } },
  { id: "oru", n: "Generous", cost: { orundum: 300 }, xp: 300, give: { cert: 40, rec3: 2 } },
  { id: "prime", n: "Lavish", cost: { prime: 2 }, xp: 700, give: { cert: 80, summ: 1, tokens: 30 } },
];
function guildXp(g, n) { g.xp += n; while (g.xp >= gxpNeed(g.lvl) && g.lvl < 20) { g.xp -= gxpNeed(g.lvl); g.lvl++; if (g.id === S.guild) sysMsg("guild", `The Club reached level ${g.lvl}!`); } }
function donate(id) {
  const g = myGuild(), d = DONATIONS.find(x => x.id === id); if (!g || !d) return null;
  g.don = g.don && g.don.day === today() ? g.don : { day: today(), by: {} };
  if (g.don.by[-1]) return null;
  for (const [k, n] of Object.entries(d.cost)) if (have(k) < n) return null;
  for (const [k, n] of Object.entries(d.cost)) spend(k, n);
  g.don.by[-1] = id; guildXp(g, d.xp); stat("donations");
  S.gContrib = (S.gContrib || 0) + d.xp;
  sysMsg("guild", `${S.name} made a ${d.n.toLowerCase()} contribution (+${d.xp} Club EXP).`);
  const on = g.mem.filter(i => i >= 0 && isOnline(i));
  if (on.length && Math.random() < .5) later(5000 + Math.random() * 10000, "guild", pick(on), "reply_thanks", { to: S.name });
  return give(d.give);
}
function guildGap() { const g = myGuild(); if (!g) return 600000; const n = g.mem.filter(i => i >= 0 && isOnline(i)).length; return (60 + Math.random() * 150) * 1000 * 4 / Math.max(1, n); }
function guildChatEvent(now) {
  const g = myGuild(); if (!g) return;
  const on = g.mem.filter(i => i >= 0 && isOnline(i, now)); if (!on.length) return;
  const recent = S.chat.guild.slice(-3).map(m => m.i);
  const i = pickBy(on, p => .2 + p.soc, recent); if (i == null) return;
  const p = person(i), st = npcState(i), dk = today();
  const opts = [["g_banter", 3], ["g_greet", st.gg !== dk ? 4 : 0], ["g_remind_donate", g.don && g.don.day === dk && !g.don.by[-1] ? .6 : .2], ["g_lazy", .2 * p.salt],
    ["g_boss_low", gBoss(g).hp < gBoss(g).max * .15 ? 1.5 : 0], ["banner_hype", specialFor(p) ? .6 : 0], ["pull_loss", trainerSafariOn(i) ? .4 : 0], ["pull_win", trainerSafariOn(i) ? .3 : 0], ["irl", .7], ["random_meme", .3 + p.humor * .5], ["pvp_loss", .3], ["farming", .3]];
  let tot = opts.reduce((a, o) => a + o[1], 0), x = Math.random() * tot, topic = "g_banter";
  for (const [k, w] of opts) { x -= w; if (x <= 0) { topic = k; break; } }
  if (topic === "g_greet") st.gg = dk;
  const toI = pickBy(on, q => .3 + q.soc, [i]), gsl = toI != null ? { to: npcName(toI) } : {};
  gsl.op2 = OPS[pick(META_OPS(p))].n;   // (one Pokémon for the post and its replies)
  const said = npcSay("guild", i, topic, gsl, now);
  if (toI != null && said.toLowerCase().includes(gsl.to.toLowerCase())) talkFollow({ i, ch: "guild", toI, depth: 0 }, said);
  const R0 = REACT[topic] || (topic.startsWith("g_") ? { t: "reply_default", who: q => q.warm, n: [0, 1], p: .5 } : null);
  if (R0) react("guild", i, REACT[topic] ? topic : "irl", on, gsl);
}
// once a minute: simulate what members did since the last tick (bounded, so a long absence doesn't stall)
function guildTick(now) {
  if (!S.gw) return;
  const G = S.gw;
  const last = G.tick || now; G.tick = now;
  // the player's pending requests and invites
  for (const r of (S.gReq || []).slice()) {
    const g = guildById(r.gid); if (!g) { S.gReq = S.gReq.filter(x => x !== r); continue; }
    if (now - r.t < 60000 + (hash(r.gid + r.t) % 600000)) continue;
    const lead = g.lead, ok = S.lvl >= g.minLvl && g.mem.length < guildCap(g) && Math.random() < clamp(.45 + (S.ladder.best - srvRating(g.q)) / 1500 + (npcState(lead).aff || 0), .05, .95);
    if (lead >= 0 && !isOnline(lead, now) && now - r.t < 6 * 3600e3) continue;
    S.gReq = S.gReq.filter(x => x !== r);
    if (ok) { joinGuild(g); if (lead >= 0) later(4000, "dm", lead, "dm_request_accepted_thanks", { to: S.name, guild: g.name }, lead); }
    else if (lead >= 0) { later(3000, "dm", lead, "dm_request_denied_react", { to: S.name, guild: g.name }, lead); }
    break;
  }
  for (const s of (S.gSent || []).slice()) {
    if (s.at > now) continue;
    S.gSent = S.gSent.filter(x => x !== s);
    const g = myGuild(); if (!g) continue;
    if (inviteDecision(s.i, g)) {
      moveNpc(s.i, g); stat("recruits");
      later(2000, "dm", s.i, "dm_accept_invite", { to: S.name, guild: g.name }, s.i);
      sysMsg("guild", `${npcName(s.i)} joined the Club.`);
      const on = g.mem.filter(i => i >= 0 && i !== s.i && isOnline(i, now));
      if (on.length) later(5000 + Math.random() * 8000, "guild", pick(on), "g_welcome", { to: npcName(s.i) });
    } else if (person(s.i).arch !== "lurker" || Math.random() < .3) later(2000, "dm", s.i, "dm_decline_invite", { to: S.name, guild: g.name }, s.i);
  }
  const g = myGuild();
  if (!g) return;
  const b = gBoss(g), dk = today();
  g.don = g.don && g.don.day === dk ? g.don : { day: dk, by: {} };
  if (b.day !== dk) { b.day = dk; b.tries = {}; }
  const mins = clamp(Math.round((now - last) / 60000), 0, 24 * 60);
  for (const i of g.mem) {
    if (i < 0) continue;
    const p = person(i);
    // members act while they're online; a long gap is simulated in one pass
    const was = mins > 30 ? Math.random() < p.act : isOnline(i, now);
    if (!was) continue;
    if (!g.don.by[i] && Math.random() < (mins > 30 ? .8 : .03) * (.4 + p.loyal * .6)) {
      const d = p.q > .8 && Math.random() < .4 ? DONATIONS[2] : p.q > .4 && Math.random() < .5 ? DONATIONS[1] : DONATIONS[0];
      g.don.by[i] = d.id; guildXp(g, d.xp);
      if (mins <= 30 && Math.random() < .35) later(1000 + Math.random() * 4000, "guild", i, "g_donate", {});
    }
    if ((b.tries[i] || 0) < 2 && Math.random() < (mins > 30 ? .85 : .025)) {
      const dmg = Math.round(b.ref * (.35 + 1.5 * p.q * p.q) * (.6 + Math.random() * .8));
      b.tries[i] = (b.tries[i] || 0) + 1;
      gbHit(g, i, dmg);
      if (mins <= 30 && Math.random() < .3) later(1500 + Math.random() * 5000, "guild", i, "g_boss_hit", { dmg: fmt(dmg) });
    }
  }
  // comings and goings, about daily
  if (Math.random() < mins / 1440 * 1.5) {
    const leaving = g.mem.filter(i => i >= 0 && i !== g.lead).find(i => Math.random() < .03 * (1 - person(i).loyal) * (g.lvl < 3 ? 2 : 1));
    if (leaving != null) {
      if (isOnline(leaving, now)) npcSay("guild", leaving, "g_leave_self", {}, now);
      moveNpc(leaving, null);
      sysMsg("guild", `${npcName(leaving)} left the Club.`);
      const on = g.mem.filter(i => i >= 0 && isOnline(i, now));
      if (on.length) later(4000 + Math.random() * 8000, "guild", pick(on), "g_left_react", { to: npcName(leaving) });
    }
  }
  // Trainers ask to join the player's Club when it has room (open Clubs take them straight in)
  if (canInvite() && g.pol !== "closed" && g.mem.length < guildCap(g) && Math.random() < mins / 60 * (.15 + g.lvl * .02 + (S.ladder.best > 2200 ? .1 : 0))) {
    const on = onlineNow(now).filter(i => !guildOf(i) || (person(i).loyal < .25 && Math.random() < .3));
    const i = pickBy(on, p => (p.lvl >= g.minLvl ? 1 : 0) * (.3 + p.soc), []);
    if (i != null) {
      if (g.pol === "open") { moveNpc(i, g); stat("recruits"); sysMsg("guild", `${npcName(i)} joined the Club.`); later(4000, "guild", i, "g_greet", {}); }
      else if (!(S.gApps || []).some(a => a.i === i)) { S.gApps = (S.gApps || []).concat({ i, t: now }); later(2000, "dm", i, "dm_join_request", { to: S.name, guild: g.name }, i); }
    }
  }
  // recruiters with room message the Club-less player now and then
  if (!S.guild && Math.random() < mins / 1440 * 2) {
    const leads = onlineNow(now).filter(i => { const x = guildOf(i); return x && x.lead === i && x.pol !== "closed" && x.mem.length < guildCap(x) && person(i).arch === "recruiter"; });
    if (leads.length) { const i = pick(leads); later(5000, "dm", i, "dm_recruit", { to: S.name, guild: guildOf(i).name }, i); offerInvite(i, now + 5000); }
  }
}
function acceptApp(i) {
  const g = myGuild(); S.gApps = (S.gApps || []).filter(a => a.i !== i);
  if (!g || g.mem.length >= guildCap(g)) return false;
  moveNpc(i, g); stat("recruits");
  sysMsg("guild", `${npcName(i)} joined the Club.`);
  later(3000, "dm", i, "dm_request_accepted_thanks", { to: S.name, guild: g.name }, i);
  later(9000, "guild", i, "g_greet", {});
  return true;
}
function denyApp(i) { const g = myGuild(); S.gApps = (S.gApps || []).filter(a => a.i !== i); if (g) later(3000, "dm", i, "dm_request_denied_react", { to: S.name, guild: g.name }, i); }
function kickMember(i) {
  const g = myGuild(); if (!g || !canInvite() || i === g.lead) return;
  moveNpc(i, null); sysMsg("guild", `${npcName(i)} was removed from the Club.`);
  const on = g.mem.filter(x => x >= 0 && isOnline(x));
  if (on.length && Math.random() < .6) later(5000, "guild", pick(on), "g_kick_react", { to: npcName(i) });
  npcState(i).aff = (npcState(i).aff || 0) - .5;
}
function promoteMember(i) {
  const g = myGuild(); if (!g || myRole() !== "leader") return;
  if (g.off.includes(i)) g.off = g.off.filter(x => x !== i);
  else if (g.off.length < 4) { g.off.push(i); sysMsg("guild", `${npcName(i)} is now a Co-leader.`); const on = g.mem.filter(x => x >= 0 && x !== i && isOnline(x)); if (on.length) later(4000, "guild", pick(on), "g_promote", { to: npcName(i) }); }
}

// ---------- things Trainers decide on their own, about once a minute ----------
function socialTick(now, mins) {
  const C = S.chat;
  // Clubs elsewhere change too: Club-less Trainers find homes, restless ones move on
  if (Math.random() < mins / 1440 * 3) {
    for (let k = 0; k < 6; k++) {
      const i = Math.floor(Math.random() * LADDER_N), p = person(i), cur = guildOf(i);
      if (cur && (cur.id === S.guild || cur.lead === i)) continue;
      if (!cur && Math.random() < .3 + p.q * .4) { const g = pick(guildList().filter(x => x.id !== S.guild && x.pol !== "closed" && x.mem.length < guildCap(x) && Math.abs(x.q - p.q) < .25)); if (g) moveNpc(i, g); }
      else if (cur && Math.random() < .2 * (1 - p.loyal)) moveNpc(i, null);
    }
  }
  // Trainers who beat the player's Registered Team sometimes say something about it
  const L = S.ladder;
  for (const x of L.log.filter(x => x.t > (C.defSeen || 0)).slice(0, 3)) {
    if (!x.held && x.i != null && Math.random() < .12 + person(x.i).ego * .15 && isOnline(x.i, now)) S.chat.q.push({ at: now + 5000 + Math.random() * 30000, ch: "dm", i: x.i, topic: "dm_gg_win", sl: { to: S.name }, dm: x.i });
  }
  C.defSeen = Math.max(C.defSeen || 0, ...L.log.map(x => x.t), 0);
  // Trainers who like the player check in now and then
  if (Math.random() < mins / 1440 * 1.5) {
    const fans = Object.keys(S.npc).map(Number).filter(i => (S.npc[i].aff || 0) > .25 && isOnline(i, now) && !S.blocked[i]);
    if (fans.length) { const i = pick(fans); S.chat.q.push({ at: now + 3000, ch: "dm", i, topic: "dm_hello", sl: { to: S.name }, dm: i }); }
  }
  // big moments are announced in the Union Room, and people react
  for (const [key, best, label] of [["cc", L.best, "Ranked Battles"], ["rta", S.rta.best, "Link Battles"]]) {
    const t = tierIdx(best); C.tiers = C.tiers || {};
    if (C.tiers[key] == null) { C.tiers[key] = t; continue; }
    if (t > C.tiers[key]) { C.tiers[key] = t; if (t >= 2) { sysMsg("world", `${S.name} reached the ${TIERS[t].n} tier in ${label}!`); react("world", -1, "pvp_climb", onlineNow(now), { tier: TIERS[t].n }); } }
  }
}
// ---------- the world's clock (called from tickTimers) ----------
function worldTick(now) {
  if (!S || !S.ladder) return;
  chatInit();
  if (!S.gw) guildWorld();
  if (!worldTick.t || now - worldTick.t > 60000 || now < worldTick.t) {
    const mins = worldTick.t ? clamp((now - worldTick.t) / 60000, 0, 1440) : 1;
    worldTick.t = now; guildTick(now); socialTick(now, mins);
  }
  chatTick(now);
}
