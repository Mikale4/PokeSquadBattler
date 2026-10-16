// =====================================================================
//  TALK: what a Trainer understands of a message, and how they answer it in their own voice
// =====================================================================
// readMsg() picks out what a message asks (a build, "is it good", what beats something, where to find it, how it evolves,
// the game's rules, things about the Trainer) and what it names (Pokémon, types, moves, Gym Leaders, Trainers). talkAnswer()
// works out a real answer from the game's data (the same move values, items, natures and Abilities the Demo and the
// simulated Trainers use) and says it the way that Trainer would: detail, openers and closers by personality (VOICE in
// a6c_lines.js), then their typing style (styleText). talkReply() queues it like a person typing; Trainers answer each other
// the same way when one speaks to another (talkFollow).

// ---------- reading a message ----------
const AMBIG_TYPES = new Set(["Normal", "Dark", "Rock", "Ground", "Steel", "Fairy", "Flying"]);
function readMsg(txt) {
  const low = " " + String(txt).replace(/:[a-z]+:/g, " ").toLowerCase().replace(/[’`]/g, "'") + " ", t = low.replace(/[^a-z0-9'é\-. ]/g, " ");
  const has = re => re.test(low);
  const ops = OP_KEYS.filter(k => OPS[k].n.length > 2).map(k => [k, low.search(new RegExp("[^a-z]" + OPS[k].n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?[^a-z]"))])
    .filter(x => x[1] >= 0).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const types = TYPES.filter(ty => { const w = ty.toLowerCase(); return AMBIG_TYPES.has(ty) ? new RegExp("[^a-z]" + w + "[- ]?(type|types|moves?|attacks?)[^a-z]").test(low) : new RegExp("[^a-z]" + w + "[^a-z]").test(low); });
  const moves = Object.keys(MOVES).filter(k => MOVES[k].n.length > 4 && t.includes(" " + MOVES[k].n.toLowerCase().replace(/[^a-z0-9'é\-. ]/g, " ") + " ") && !ops.some(o => OPS[o].n.toLowerCase() === MOVES[k].n.toLowerCase()));
  const leader = JOURNEY_BOSSES.find(n => low.includes(" " + n.toLowerCase().replace("lt. ", "")) || low.includes(n.toLowerCase()));
  const stage = (low.match(/[^0-9](\d{1,2}-\d{1,2})[^0-9]/) || [])[1];
  const items = HELD_KEYS.filter(k => low.includes(HELD[k].n.toLowerCase()));
  const q = /\?/.test(low) || /^\s*(how|what|why|who|which|where|when|should|does|do|is|are|can|could|any|would|will|wanna|want)\b/.test(low);
  const you = /\b(you|your|ur|u|yours|ya)\b/.test(low);
  const I = {
    ops, types, moves, leader, stage: stage && NODES[stage] ? stage : null, items, q, you, mine: /\b(my|mine|i have|i got)\b/.test(low),
    greet: /\b(hi|hello|hey+|heya|hiya|yo|sup|gm|good (morning|evening|afternoon)|howdy|greetings|alola)\b|^\s*o\/\s*$/.test(low),
    bye: /\b(bye|cya|see (ya|you)|gn|good ?night|later|gtg|g2g|smell ya later|ttyl)\b/.test(low),
    thanks: /\b(thanks|thank you|thank u|ty|thx|tysm|appreciate (it|you)|cheers)\b/.test(low),
    congrats: /\b(grats|congrats|congratulations|gz|gratz|nice (catch|pull|one|win)|well done|ggs?)\b/.test(low),
    sorry: /\b(rip|unlucky|f in chat|sorry for|that sucks|pain)\b/.test(low),
    howru: /\b(how are (you|u|ya)|how r u|how'?s it going|hows it going|how (you|u) doing|wyd|what are (you|u) (doing|up to)|what'?s up|whats up|how'?s your day)\b/.test(low),
    compliment: /\b(nice|cool|awesome|great|amazing|sick|insane|love|beautiful|cute) (team|profile|pok[eé]mon|lineup|build|name|club|avatar)\b|\b(you'?re|ur|you are) (cool|awesome|nice|great|good|funny|the best)\b|\bgood (player|trainer)\b/.test(low),
    rude: RUDE.test(low), laugh: /\b(lol|lmao|haha+|xd|lmfao|rofl|kek)\b/.test(low),
    help: /\b(help|advice|tips?|recommend|suggest|should i|what should|which (one|is better)|how (do|can|should) i|any ideas?|idk (what|how|which)|teach me|explain)\b/.test(low),
    build: /\b(build|builds|moveset|move set|set ?up|what moves?|which moves?|moves? (should|to|for)|held items?|what item|which item|nature|ability|run on|give it|should it hold|hold)\b/.test(low),
    rate: /\b(how good|any good|worth (it|building|investing|raising|using)|viable|meta|tier|good or bad|overrated|underrated|is .{1,24} (good|bad|strong|weak|trash|op|worth)|are .{1,24} (good|bad|strong|weak|worth))\b/.test(low),
    counter: /\b(counter|counters|against|vs\.?|versus|beat|beating|weak to|weakness|weaknesses|super ?effective|struggling with|stuck on|can'?t beat|cant beat|deal with|lose to|losing to)\b/.test(low),
    where: /\bwhere\b.*\b(find|get|catch|buy|farm|is)\b|\bhow (do|can|did) (i|you|u) (get|find|catch|obtain)\b/.test(low),
    evolve: /\bevol(ve|ves|ving|ution|utions)\b/.test(low),
    fav: /\b(fav|favou?rite|best friend|main|love most)\b/.test(low),
    rank: /\b(rank|ranked|rating|points|elo|ladder|legend)\b/.test(low),
    club: /\b(club|guild|clan)\b/.test(low),
    team: /\b(team|lineup|registered|run|use)\b/.test(low),
    howlong: /\bhow long\b|\bsince when\b|\bstart(ed)? playing\b|\bplaying long\b/.test(low),
    level: /\b(trainer )?(level|lv)\b/.test(low),
    battle: /\b(wanna|want to|let'?s|can we|shall we|could we|down to|up for)\b.{0,12}\b(battle|fight|duel|spar|1v1|link battle)\b|\bbattle me\b|\bfight me\b|\b1v1 me\b/.test(low),
    join: /\b(join|invite|let me in|add me)\b.{0,20}\b(club|guild|you)\b|\binvite me\b|\bcan i join\b/.test(low),
    lore: /\b(lore|story|mew|missingno|giovanni|rocket|oak|lavender|ghost|mewtwo|bill|kanto|gen ?1|silph|cinnabar|mansion|truck)\b/.test(low),
    who: /\bwho are (you|u)\b|\btell me about (yourself|you)\b|\babout you\b/.test(low),
    yes: /^\s*(yes|yeah|yep|yup|sure|ok|okay|k|ya)\b/.test(low), no: /^\s*(no|nope|nah|naw)\b/.test(low),
    explain: /\b(explain|elaborate|what do (you|u) mean|what does (that|it|this) mean|how does (it|that|this|(your|ur|the) (team|plan|core|strategy)) work|tell me more|more (details?|info)|go on|break (it|that) down|walk me through|in detail|strateg(y|ies)|game ?plan|how do (you|u) play)\b/.test(low),
    why: /(^|[^a-z])why\b/.test(low),
    lead: /\b(lead|leads|leading|opener|open with|send out first)\b/.test(low),
    hard: /\b(hard|harder|difficult|tough|easy|sweaty|brutal|what'?s .{0,12}like|how is|how'?s)\b/.test(low),
    climb: /\b(get to|reach|climb|make it to|push to|get into|get out of)\b/.test(low),
    farm: /\b(explore|farm|farming|grind|grinding)\b/.test(low) && /\b(which|what|where|best|first|should|worth)\b/.test(low) || /\b(which|what|best) (explore )?area\b/.test(low),
  };
  // a Ranked tier: the last one named, when the message is about Ranked (a Ball's name alone is the item)
  const tierCtx = /\b(tiers?|rank|ranked|ladder|stadium)\b/.test(low);
  let at = -1;
  const item = /\b(a|an|the|my|your|ur|his|her|their) (master|ultra|great|pok[eé]) ?ball\b/.test(low);
  TIER_RE.forEach((re, k) => { const m = low.search(re); if (m >= 0 && (tierCtx || ((I.hard || I.climb) && !(k >= 1 && k <= 4 && item))) && m >= at) { at = m; I.tier = k; } });
  // a playstyle: Bulky Offense, a rain team, an Intimidate core...
  for (const [A, re, subs] of ARCH_RE()) { const m = low.match(re); if (m) { I.arch = { A, sub: subs.find(s => m[0] === s.toLowerCase()) || null }; break; } }
  I.faq = TALK_FAQ.find(f => f.re.test(low)) || null;
  I.cat = /\b(physical|special|choice band|choice specs|muscle band|wise glasses)\b/.test(low); I.low = low;
  return I;
}
const TIER_RE = [/\bbeginners?\b/, /\bpok[eé] ?ball\b/, /\bgreat ball\b/, /\bultra ball\b/, /\bmaster ball\b/, /\bveterans?\b/, /\bexperts?\b/, /\blegends?\b/];
// the playstyles' names (ARCHETYPES in a6g_teams.js); a weather or speed word only counts as "a rain team", "a Trick Room core"...
const ARCH_RE = () => ARCH_RE.v || (ARCH_RE.v = ARCHETYPES.map(A => {
  const esc = s => s.toLowerCase().replace(/[+]/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim().split(" ").map(w => w.replace(/[.*?^${}()|[\]\\]/g, "\\$&")).join("[- ]?(?:\\+ |and |& )?");
  const plain = ["rain", "sun", "sand", "snow", "balance", "stall", "tailwind", "trickroom", "redirect"].includes(A.id);
  const name = plain ? `${esc(A.n)} (team|teams|archetype|playstyle|core|offense|comp)` : esc(A.n);
  return [A, new RegExp("\\b(" + [...A.subs.map(esc), name].join("|") + ")\\b"), A.subs];
}));
// the player's message names a Trainer: their whole name, or it without its digits ("CharKeeper"), or an @mention. A name
// that's just a Pokémon or a place ("Snorlax16", "Lavender") only counts at the start of the message or after @, so
// "is snorlax any good?" isn't a message to Snorlax16.
const WORDY = () => WORDY.v || (WORDY.v = (() => { const P = NAME_PARTS();
  return new Set([...OP_KEYS.map(k => OPS[k].n.toLowerCase()), ...[...DOC_W1, ...DOC_W2, ...P.mon, ...P.route, ...P.place, ...P.cls, ...P.nick, ...P.suffix, ...Object.values(NAME_FAMILY).flat(), ...Object.values(P.title).flat()].map(w => w.toLowerCase())]); })());
const reEsc = w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function addressees(txt, cands) {
  const t = " " + String(txt).toLowerCase() + " ", start = String(txt).toLowerCase().trimStart();
  return cands.filter(i => {
    const n = npcName(i).toLowerCase(), base = n.replace(/_?\d+$/, "").replace(/^the_?(?=[a-z])/, "");
    if (t.includes("@" + n) || t.includes("@" + base)) return true;
    if (WORDY().has(base) || WORDY().has(n)) return new RegExp("^(the)?" + reEsc(base) + "(\\d+)?([^a-z0-9]|$)").test(start);
    return (n.length > 2 && t.includes(n)) || (base.length > 3 && new RegExp("[^a-z]" + reEsc(base) + "[^a-z]").test(t));
  });
}

// ---------- what the game knows: builds, ratings, matchups, where things are ----------
const an = w => (/^[aeiou]/i.test(w) ? "an " : "a ") + w;
const listAnd = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
// (abbreviations keep their dot: "Sp. Atk", "Exp. Candy", "Lv 5"; a private-use mark stands in for their space while splitting)
const ABBR_DOT = s => String(s).replace(/\b(Sp|Exp|Lv|St|Dr|Mr)\. /g, "$1.\ue000");
const sentences = s => ABBR_DOT(s).split(/(?<=[.!?])[ ]+/).map(x => x.replace(/\ue000/g, " "));
const firstSentence = s => sentences(s)[0].replace(/\.$/, "");
// a message is short: long answers go out as a few messages, split between sentences
function chunks(parts, max = 150) {
  const out = [];
  for (const part of parts) {
    let cur = "";
    // a sentence that's too long on its own breaks at its commas
    const bits = sentences(part).flatMap(sn => sn.length <= max ? [sn] : sn.split(/(?<=,) /).reduce((a, w) => { if (a.length && (a[a.length - 1] + " " + w).length <= max) a[a.length - 1] += " " + w; else a.push(w); return a; }, []));
    for (const sn of bits) { if (cur && (cur + " " + sn).length > max) { out.push(cur); cur = sn; } else cur = cur ? cur + " " + sn : sn; }
    if (cur) out.push(cur);
  }
  return out;
}
const tmText = s => String(s).replace(/^(TM|HM|TR)(\d+) \(Gen (\d)\)$/, "$1$2, Gen $3");
// every move it can know: level-up (any level) and TMs
const learnPool = k => [...OPS[k].learn.map(([, m]) => m), ...OPS[k].tms.map(n => TM_MOVE[n]).filter(Boolean), ...(sketcher(k) ? sketchable() : [])];   // (Smeargle: anything it could sketch)
function howLearn(k, m) {
  const lv = OPS[k].learn.find(([, x]) => x === m);
  if (lv) return `Lv ${lv[0] || 1}`;
  const tm = TMS.find(([id, , , mm]) => mm === m && OPS[k].tms.includes(id));
  return tm ? tm[2] : "a TM";
}
// where an item comes from, in a few words
function itemWhere(k) {
  const CUR = { lmd: "Poké Dollars", tokens: "BP", cert: "Coins", orundum: "Gems" };
  for (const sh of Object.values(SHOP)) { if (sh.hidden) continue; const it = sh.items.find(x => x.give.held === k || x.give[k]); if (it) return `the ${sh.n} (${fmtFull(it.cost)} ${CUR[sh.cur] || ""})`.replace(" )", ")"); }
  const h = HUNTS.find(x => (x.items || []).includes(k)); return h ? `Explore in ${h.n}` : null;
}
// a build from the optimizer the Demo uses (a6h_build.js): the Ability and moves that work best together out of every move it can
// learn, the nature for those moves and the held item worth most to it, against the Trainers near your rating (on your own team
// when it's yours)
function buildOf(k, mine) {
  const c = { meta: S && S.ladder ? playerMeta() : poolMeta() };
  if (mine && S && S.ops[k]) c.team = topTeam(ROSTER).map(x => ({ k: x, ab: S.ops[x].ab || OPS[x].ab, mv: pmv(x) }));
  const B = bestBuild(k, { ...c, pool: learnPool(k) });
  return { mv: B.mv, ab: B.ab, nat: optNature(k, B.mv, B.ab, c), item: HELD_KEYS.map(h => [h, itemValue(k, h, B, c)]).sort((a, b) => b[1] - a[1])[0][0] };
}
function buildFacts(k, mine) {
  const { mv, item, nat, ab } = buildOf(k, mine), A = abilityOf(ab);
  const f = { k, op: OPS[k].n, moves: mv.filter(Boolean), mv, item, itemN: HELD[item].n, itemWhy: firstSentence(HELD[item].d), itemWhere: itemWhere(item),
    nat: natName(nat), natText: natText(nat), ab: A.name, abWhy: firstSentence(A.text), hidden: hiddenAbilities(k).includes(ab), notes: [] };
  // tailored to their own Pokémon: what to change, and how to get it
  const p = mine && S.ops[k];
  if (p) {
    const cur = pmv(k);
    for (let s = 0; s < 3; s++) if (mv[s] && cur[s] !== mv[s]) f.notes.push(`${cur[s] ? `swap ${MOVES[cur[s]].n} for` : "teach it"} ${MOVES[mv[s]].n} (${tmText(howLearn(k, mv[s])).replace(/^Lv (\d+)$/, (m, l) => +l <= p.lvl ? `Move Reminder, it's a Lv ${l} move` : `it learns it at Lv ${l}`)})`);
    if (p.held !== item) f.notes.push(p.held ? `swap its ${HELD[p.held].n} for ${an(HELD[item].n)}` : `it's not holding anything yet`);
    if (p.nat !== nat) f.notes.push(`${an(natName(nat))} Mint would fix its ${natName(p.nat)} nature`);
    if ((p.ab || OPS[k].ab) !== ab) f.notes.push(f.hidden ? `an Ability Patch gets it ${A.name}` : `an Ability Capsule gets it ${A.name}`);
  }
  return f;
}
const RANKED = () => RANKED.v || (RANKED.v = OP_KEYS.slice().sort((a, b) => metaScore(b) - metaScore(a)));
function rateFacts(k) {
  const r = RANKED().indexOf(k) + 1, op = OPS[k];
  const tier = r <= 10 ? 4 : r <= 30 ? 3 : r <= 65 ? 2 : r <= 105 ? 1 : 0;
  const evo = op.evo[0] && OPS[op.evo[0].to];
  return { k, op: op.n, r, tier, types: op.types.join("/"), cls: op.cls, evo: evo ? evo.n : null, meta: metaPool().includes(k), bst: op.b.reduce((a, b) => a + b, 0) };
}
// what to use against something: a Pokémon, a type, a Gym Leader or a Journey stage
function counterFacts(I, asker) {
  let types = [], what = null, foes = [];
  if (I.leader || I.stage) {
    const nd = I.stage ? NODES[I.stage] : Object.values(NODES).find(n => (n.waves || n.rivalWaves) && n.name.toLowerCase().startsWith(I.leader.toLowerCase().replace("lt. ", "lt. ")) && (n.badgeWin != null || /Elite Four|Champion/.test(n.name) || n.type === "boss"))
      || Object.values(NODES).find(n => (n.waves || n.rivalWaves) && n.name.includes(I.leader));
    const waves = nd && nodeWaves(nd);   // (a rival's team depends on your starter: none yet before you pick one)
    if (nd && waves && waves.length) { foes = [...new Set(waves.flat().map(s => s.op))]; what = I.leader || nd.name; const c = {}; for (const f of foes) for (const ty of OPS[f].types) c[ty] = (c[ty] || 0) + 1; types = Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 2); }
  }
  if (!types.length && I.ops.length) { types = OPS[I.ops[0]].types; what = OPS[I.ops[0]].n; foes = [I.ops[0]]; }
  if (!types.length && I.types.length) { types = [I.types[0]]; what = I.types[0] + " types"; }
  if (!types.length) return null;
  const vs = foes.length ? foes.map(f => OPS[f].types) : [types];
  const score = ty => vs.reduce((a, ts) => a + typeEff(ty, ts), 0) / vs.length;
  const good = TYPES.filter(ty => score(ty) > 1.2).sort((a, b) => score(b) - score(a)).slice(0, 3);
  // who to send: their own Pokémon with a strong super-effective move, else the meta
  let picks = [];
  if (asker === -1) picks = Object.keys(S.ops).map(k => [k, Math.max(0, ...pmv(k).filter(Boolean).map(m => MOVES[m].c === "X" ? 0 : score(MOVES[m].t) * (MOVES[m].p || 60) * (OPS[k].types.includes(MOVES[m].t) ? 1.5 : 1))) * (1 + S.ops[k].lvl / 50)])
    .filter(x => x[1] > 120).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => OPS[x[0]].n);
  const meta = metaPool().filter(k => OPS[k].types.some(ty => good.includes(ty))).slice(0, 2).map(k => OPS[k].n);
  return { what, types, good, picks, meta, foes: foes.slice(0, 4).map(f => OPS[f].n) };
}
function whereFind(k) {
  const op = OPS[k], where = [];
  for (const id in NODES) { const nd = NODES[id]; if (nd.catch === k || nd.gift === k || (nd.reward && nd.reward.op === k)) where.push(`Journey stage ${id} (${nd.name})`); }
  for (const h of HUNTS) if (h.mobs.includes(k) || h.boss.includes(k)) where.push(`${h.n} in Explore`);
  if (SHOP.prize.items.some(i => i.give.op === k)) where.push("the Game Corner Prize Corner");
  if (!op.leg) where.push(`the Safari Zone (${op.rar}★)`);
  if (op.from) { const e = OPS[op.from].evo.find(x => x.to === k); where.push(`evolving ${OPS[op.from].n}${e && e.lv ? ` at Lv ${e.lv}` : e && e.item ? ` with ${an(evoItemName(e.item))}` : ""}`); }
  return where;
}
function evoFacts(k) {
  const op = OPS[k], out = { op: op.n, into: [], from: op.from ? OPS[op.from].n : null };
  for (const e of op.evo) out.into.push(`${OPS[e.to].n} ${e.lv ? `at Lv ${e.lv}` : e.item === "linkcord" ? "with a Linking Cord (it evolves by trading in the games)" : e.item ? `with ${an(evoItemName(e.item))}` : ""}`.trim());
  return out;
}
// the player's team at a glance: the type that hits most of it
function teamFacts() {
  const ids = (S.team.story || []).filter(owned); if (!ids.length) return null;
  const hit = TYPES.map(ty => [ty, ids.filter(k => typeEff(ty, OPS[k].types) > 1).length]).sort((a, b) => b[1] - a[1])[0];
  const cover = TYPES.filter(ty => ids.every(k => typeEff(ty, OPS[k].types) <= 1) === false).length;
  const fix = TYPES.filter(ty => typeEff(hit[0], [ty]) < 1).slice(0, 2);
  return { n: ids.length, weak: hit[0], weakN: hit[1], fix, healer: ids.some(isMedicK), names: ids.map(k => OPS[k].n), cover };
}

// ---------- saying it their way ----------
const vpick = a => a && a.length ? a[Math.floor(Math.random() * a.length)] : "";
// their family's voice, with their personality's own greeting and "how are you" first
const VOICE_P = {};
const VOICEOF = p => {
  const V = VOICE[p.arch] || VOICE.casual, P = personaOf(p);
  return !P ? V : VOICE_P[P.id] || (VOICE_P[P.id] = { ...V, hi: [P.hi, P.hi, ...V.hi.slice(0, 1)], mood: [P.mood, P.mood, ...V.mood.slice(0, 1)] });
};
const detailOf = p => clamp((VOICEOF(p).d) + (p.help > .75 ? 1 : p.help < .2 ? -1 : 0), p.arch === "newbie" ? 0 : 1, 3);
function fillV(s, p, x = {}) {
  const g = guildOf(p.i);
  return String(s).replace(/\{op\}/g, x.op || OPS[p.fav[0]].n).replace(/\{OP\}/g, (x.op || OPS[p.fav[0]].n).toUpperCase()).replace(/\{genus\}/g, x.genus || "")
    .replace(/\{dex\}/g, x.dex || "").replace(/\{to\}/g, x.to || "").replace(/\{guild\}/g, g ? g.name : "my Club").replace(/\{fav\}/g, OPS[p.fav[0]].n)
    .replace(/\{tier\}/g, tierOf(S.ladder.pop[p.i]).n).replace(/\{pts\}/g, fmtFull(S.ladder.pop[p.i])).replace(/\s+/g, " ").trim();
}
const join2 = (...a) => a.filter(Boolean).join(" ").replace(/\s+/g, " ").replace(/\s+([.,!?])/g, "$1").trim();
// an answer in their voice: an opener, the parts, a closer
function voiced(p, kind, parts, x = {}) {
  const V = VOICEOF(p), opn = (kind === "build" && V.openBuild) || (x.op && V.openOp) || V.open, cls = V.close;
  const o = fillV(vpick(opn), p, x), c = fillV(vpick(cls), p, x);
  const out = parts.filter(Boolean).slice();
  if (o) out[0] = join2(o, out[0]);
  if (c && out.length) out[out.length - 1] = join2(out[out.length - 1], c);
  return out;
}
function sayBuild(p, f, x, dMin = 0) {
  const V = VOICEOF(p), d = Math.max(dMin, V.openBuild ? Math.min(1, detailOf(p)) : detailOf(p)), terse = V.terse;
  const [m1, m2, m3] = f.mv.map(m => m ? MOVES[m].n : null);
  const movesTxt = terse ? f.moves.map(m => MOVES[m].n).join(" / ") : listAnd(f.moves.map(m => MOVES[m].n));
  const parts = [];
  if (d === 0) parts.push(`${f.itemN} is good on it? And ${m3 || m2 || m1} maybe`);
  else if (d === 1) parts.push(terse ? `${movesTxt}. ${f.itemN}.` : `${movesTxt}, with ${an(f.itemN)}`);
  else {
    parts.push(terse ? `${movesTxt}. ${f.itemN}.` : `Teach it ${movesTxt}, and give it ${an(f.itemN)}${d >= 3 ? ` (${f.itemWhy.charAt(0).toLowerCase() + f.itemWhy.slice(1)})` : ""}.`);
    parts.push(terse ? `${f.nat}. ${f.ab}${f.hidden ? " (Patch)" : ""}.` : `${f.nat} nature (${f.natText}) and ${f.ab}${f.hidden ? ", it's a Hidden Ability so you'll need an Ability Patch" : ""}.`);
    if (d >= 3 && f.itemWhere) parts[1] += ` ${f.itemN} is at ${f.itemWhere}.`;
  }
  if (p.arch === "f2p" && f.itemWhere && d >= 1) parts.push(`${f.itemN} costs ${f.itemWhere.replace(/^.*\(|\)$/g, "")}, the only thing worth paying for.`);
  if (p.arch === "whale" && d >= 1) parts.push("Then just max its IVs and Mastery.");
  if (f.notes.length && d >= 1) parts.push((terse ? "Yours: " : "For yours: ") + f.notes.slice(0, d >= 2 ? 3 : 1).join(", ") + ".");
  return voiced(p, "build", parts, x);
}
const RATE_WORD = [["pretty weak, honestly", "not great", "a bit weak"], ["niche, but it can work", "usable", "fine for the Journey"], ["solid", "good", "a solid pick"], ["really strong", "great", "very good"], ["one of the best in the game", "top tier", "busted"]];
function sayRate(p, f, x) {
  const d = detailOf(p);
  let verdict = vpick(RATE_WORD[f.tier]);
  if (p.arch === "collector") verdict = f.tier >= 2 ? "amazing, and so cute" : "underrated, and adorable";
  if (p.arch === "salty" && f.tier < 4) verdict = vpick(["overrated", "mid", "fine until it gets swept"]);
  if (p.arch === "tryhard") verdict = f.tier >= 3 ? `top ${f.r <= 10 ? 10 : 30}, run it` : f.tier === 2 ? "mid" : "don't";
  const parts = [`${VOICEOF(p).openOp ? "" : f.op + "? "}${verdict.charAt(0).toUpperCase() + verdict.slice(1)}.`];
  if (d >= 2) parts.push(`${f.types} ${f.cls}, base stat total ${f.bst}.${f.meta ? " You'll see it all over Ranked." : ""}${f.evo ? ` It gets a lot better once it evolves into ${f.evo}.` : ""}`);
  else if (d >= 1) parts.push(f.meta ? "You'll see it all over Ranked." : f.evo ? `Evolve it into ${f.evo} first.` : `${f.types} ${f.cls}, base stat total ${f.bst}.`);
  return voiced(p, "help", parts, x);
}
function sayCounter(p, f, x) {
  const d = detailOf(p), terse = VOICEOF(p).terse;
  if (!f.good.length) return voiced(p, "help", [`${f.what} doesn't have an easy weakness. Just bring your strongest hitters`], x);
  const parts = [terse ? `${listAnd(f.good)} moves.` : `${listAnd(f.good)} moves work best against ${f.what}${f.foes.length > 1 && d >= 2 ? ` (${listAnd(f.foes)})` : ""}.`];
  if (f.picks.length && d >= 1) parts.push(terse ? `Use your ${listAnd(f.picks)}.` : `Your ${listAnd(f.picks)} would do great there.`);
  else if (f.meta.length && d >= 1) parts.push(`${listAnd(f.meta)} ${f.meta.length > 1 ? "are" : "is"} great for that.`);
  return voiced(p, "help", parts, x);
}
function sayAnswer(p, txt, x) { return voiced(p, "help", [txt], x); }

// "which Explore area should I farm?": for you, from your Pokédex, Bag, team and Journey, in the Demo's order (a stone that
// evolves one of yours into a Pokémon you haven't got, Exp. Candy while your team is under the level cap, Poké Dollars when
// you're low); for anyone else, what each area is for (HUNTS, huntDrops). Every area is open to everyone from the first Pokémon on
function exploreFacts(from) {
  const byOpen = HUNTS.slice(), first = byOpen[0];
  const cave = HUNTS.find(h => huntKind(h) === "candy"), hide = HUNTS.find(h => huntKind(h) === "money");
  const best = HUNTS.map(h => { const t3 = h.items.filter(k => HELD[k] && HELD[k].t === 3); return t3.length ? `${HELD[t3[0]].n} in ${h.n}` : null; }).filter(Boolean).slice(0, 4);
  const general = [
    `Every area is open from your first Pokémon on, whatever region you're in. ${cave.n} is the Exp. Candy farm, with the odd Rare Candy, and ${hide.n} pays the most Poké Dollars.`,
    `For a stone, farm its area: ${listAnd(byOpen.filter(h => h.stone).map(h => `${ITEMS[h.stone].n} in ${h.n}`))}.`,
    `Deeper levels drop more, and the best held items only from level 4: ${listAnd(best)}.`,
  ];
  if (from !== -1 || !S) return { mine: [], general };
  const open = HUNTS.filter(h => huntOn(h)), mine = [];
  if (!open.length) return { mine: ["Explore opens as soon as you have your first Pokémon: every area at once."], general };
  // (the open area whose stone evolves the most of yours into Pokémon you haven't got)
  const evos = Object.keys(S.ops).flatMap(k => OPS[k].evo.filter(e => e.item && !S.dex.caught[e.to] && !(evoHave(e.item, S.ops[k]) > 0)).map(e => ({ k, ...e })));
  const need = open.filter(h => h.stone).map(h => ({ h, es: evos.filter(e => e.item === h.stone).filter((e, j, a) => a.findIndex(y => y.k === e.k) === j) })).filter(x => x.es.length).sort((a, b) => b.es.length - a.es.length)[0];
  if (need) mine.push(`${need.h.n}: ${need.es.length > 1 ? ITEMS[need.h.stone].n + "s evolve" : an(ITEMS[need.h.stone].n) + " evolves"} your ${listAnd(need.es.slice(0, 3).map(e => `${OPS[e.k].n} into ${OPS[e.to].n}`))}, new for your Pokédex.`);
  const team = (S.team.story || []).filter(owned), behind = (team.length ? team : topTeam(ROSTER)).filter(k => S.ops[k].lvl < levelCap()).length;
  if (behind) mine.push(huntOn(cave) ? `${cave.n} for Exp. Candy: ${behind} of your team ${behind === 1 ? "is" : "are"} under the level cap (Lv ${levelCap()}).` : `Every area drops some Exp. Candy; ${cave.n} has the big bags.`);
  if (S.lmd < 20000 && huntOn(hide)) mine.push(`${hide.n} if you're short on Poké Dollars.`);
  if (!mine.length) { const deep = open.filter(h => h.items.length).pop(); if (deep) mine.push(`Nothing you need right now, so ${deep.n} for held items, at the deepest level you can clear.`); }
  return { mine, general };
}
const first0 = () => HUNTS.find(h => h.stone);
function exploreTalk(p, from, x) {
  const F = exploreFacts(from), d = detailOf(p);
  if (F.mine.length) return voiced(p, "help", [...F.mine.slice(0, d >= 2 ? 3 : 1), ...(d >= 3 ? [F.general[0]] : [])], x);
  if (d === 0) return voiced(p, "help", [`${first0().n} for ${ITEMS[first0().stone].n}s, ${HUNTS.find(h => huntKind(h) === "candy").n} for Exp. Candy`], x);
  return voiced(p, "help", F.general.slice(0, d), x);
}

// ---------- what they know first-hand: their own team (the plan, each Pokémon's job and set, the leads), the Ranked tiers, the
// playstyles; and "explain it" / "why?" about what they just told this Trainer (st.said, for 15 minutes) ----------
function bestMoveOf(k, pr) {
  let best = null, bv = -1;
  for (const m of (pr && pr.mv) || []) { const M = MOVES[m]; if (!M || !M.p) continue; const v = M.p * (OPS[k].types.includes(M.t) ? 1.5 : 1) * (M.tg === "foes" ? .75 : 1); if (v > bv) { bv = v; best = m; } }
  return best;
}
// what one of its moves does: a status move's effect, an attack's super-effective targets
function moveUse(k, m) {
  const M = MOVES[m]; if (!M) return null;
  if (M.c === "X" || !M.p) {
    const fx = { SLP: "puts foes to sleep", PAR: "paralyzes foes", TOX: "badly poisons foes", PSN: "poisons foes", BRN: "burns foes", FRZ: "freezes foes", CNF: "confuses foes", SEED: "drains foes" }[M.ail];
    if (fx) return `${fx} with ${M.n}`;
    if (M.hl || ["recover", "roost", "softboiled", "rest", "synthesis", "moonlight", "morningsun", "slackoff", "milkdrink", "wish", "shoreup"].includes(m)) return `heals itself with ${M.n}`;
    if (M.st && M.st.some(([, v]) => v > 0) && M.sw !== "target") return `boosts itself with ${M.n}`;
    if (M.st && M.st.some(([, v]) => v < 0)) return `weakens foes with ${M.n}`;
    return `uses ${M.n}`;
  }
  const se = TYPES.filter(ty => typeEff(M.t, [ty]) > 1);
  return se.length ? `hits ${listAnd(se.slice(0, 3))} types super effectively with ${M.n}` : `attacks with ${M.n}`;
}
// one Pokémon's job on the team, in words: the role's job only when it really has the move or Ability for it
function memberJob(doc, k, A) {
  const pr = doc.prog[k] || {}, mv = (pr.mv || []).filter(Boolean), role = doc.roles && doc.roles[k], R = A && role && role !== "cover" ? ROLE(role) : null, J = ROLE_JOB[roleKind(role)];
  const best = bestMoveOf(k, pr), bestN = best ? MOVES[best].n : "its attacks";
  const roleMv = R && R.mv ? mv.find(m => R.mv.includes(m)) : null;
  const setup = R && R.setup ? mv.find(m => SETUP_P.includes(m) || SETUP_S.includes(m) || m === "agility" || m === "rockpolish") : null;
  let t;
  if (roleKind(role) === "setter" && WX_AB[pr.ab]) t = `{n} ${WX_TALK[WX_AB[pr.ab]]} with ${abilityOf(pr.ab).name} as it comes in`;
  else if (roleKind(role) === "setter" && SURGE_TALK[pr.ab]) t = `{n} sets up ${SURGE_TALK[pr.ab]} with ${abilityOf(pr.ab).name} as it comes in`;
  else if (roleKind(role) === "backup" && WX_AB[pr.ab]) t = `{n} waits on the bench with ${abilityOf(pr.ab).name}, to ${WX_BACK[WX_AB[pr.ab]]} if it ends`;
  else if (roleKind(role) === "backup" && SURGE_TALK[pr.ab]) t = `{n} waits on the bench with ${abilityOf(pr.ab).name}, to set up ${SURGE_TALK[pr.ab]} again if it ends`;
  else if (roleKind(role) === "backup" && roleMv) t = `{n} waits on the bench with ${MOVES[roleMv].n}, in case the first one ends`;
  else if (J && J.need === "pri" && mv.some(isPri)) t = J.t.replace("{best}", bestN);
  else if (J && J.need === "mv" && roleMv) t = J.t.replace("{mv}", MOVES[roleMv].n);
  else if (J && J.need === "ab" && R && R.ab && R.ab.includes(pr.ab)) t = J.t;
  else if (J && !J.need) t = J.t.replace("{best}", bestN) + (setup ? `, after ${MOVES[setup].n}` : "") + (R && R.ab && R.ab.includes(pr.ab) ? ` and ${abilityOf(pr.ab).name}` : "");
  else t = "{n} hits with " + bestN;
  // a lead setter that does a support's or hazard setter's job too (doc.cover, buildArch in a6g_teams.js)
  const cv = doc.cover && doc.cover[k], cm = cv && ROLE(cv).mv ? mv.find(m => ROLE(cv).mv.includes(m)) : null;
  if (cm && roleKind(role) === "setter") t += roleKind(cv) === "hazard" ? `, and it sets ${MOVES[cm].n} too` : `, and it's the team's support too, with ${MOVES[cm].n}`;
  // a lead whose job is a first-turn move: its priority moves and Quick Claw give it +30% turn meter each the moment it's sent out
  if (R && (R.pri || J && J.need === "pri") && J && J.need && !/ hits with /.test(t)) {
    const pri = mv.filter(m => isPri(m)), qc = pr.held === "quickclaw", n = pri.length + (qc ? 1 : 0);
    if (n) t += `; with ${listAnd([...(qc ? ["its Quick Claw"] : []), ...pri.map(m => MOVES[m].n)])} it starts at +${30 * n}% turn meter, so it goes first`;
  }
  return t.replace("{n}", OPS[k].n);
}
function memberBrief(doc, k, A) {
  const J = ROLE_JOB[roleKind(doc.roles && doc.roles[k])], job = memberJob(doc, k, A);
  if (J && J.need && !/ hits with /.test(job)) return job;
  const best = bestMoveOf(k, doc.prog[k]);
  return `${OPS[k].n}, ${an(OPS[k].cls)}, ${best ? moveUse(k, best) : "fights with what it has"}`;
}
const setText = (k, pr) => `${listAnd((pr.mv || []).filter(Boolean).map(m => MOVES[m].n))}, with ${abilityOf(pr.ab || OPS[k].ab).name}${pr.held ? ` and ${an(HELD[pr.held].n)}` : ""}, ${natName(pr.nat)} nature`;
const archOf = doc => doc.arch && ARCHETYPES.find(a => a.id === doc.arch.id);
const leadsOf = (doc, A) => A ? doc.team.filter(k => docRole(doc, k).lead).slice(0, ACTIVE) : [];
const teamWeak = team => { const hit = TYPES.map(ty => [ty, team.filter(k => typeEff(ty, OPS[k].types) > 1).length]).sort((a, b) => b[1] - a[1])[0]; return hit && hit[1] >= 3 ? { type: hit[0], n: hit[1] } : null; };
function teamTalk(p, doc, x) {
  const A = archOf(doc), d = detailOf(p), parts = [];
  if (A) {
    const O = doc.arch.over && archById(doc.arch.over.id);
    parts.push(`It's ${an(A.n)} team, ${doc.arch.sub}: ${ARCH_PLAN[A.id]}.`);
    if (O) parts.push(`With ${O.n} on top, ${doc.arch.over.sub}: ${ARCH_PLAN[O.id]}.`);
    const works = doc.team.some(k => { const J = ROLE_JOB[roleKind(doc.roles[k])]; return J && J.need && !/ hits with /.test(memberJob(doc, k, A)); });
    if (d >= 1 && ARCH_SUB_PLAN[doc.arch.sub] && works) parts.push(ARCH_SUB_PLAN[doc.arch.sub] + ".");
  } else parts.push("No set archetype, just my strongest six, each built on its own.");
  const jobs = doc.team.map(k => memberBrief(doc, k, A));
  parts.push((d >= 2 ? jobs : jobs.slice(0, 3)).join(". ") + ".");
  const leads = leadsOf(doc, A);
  if (d >= 1) parts.push(leads.length ? `I lead with ${listAnd(leads.map(k => OPS[k].n))}${leads.length < ACTIVE ? ", and the rest of my leads depend on who I'm up against" : ""}.` : "My leads depend on who I'm up against.");
  const w = d >= 2 && teamWeak(doc.team);
  if (w) parts.push(`Its weak spot is ${w.type} moves: ${w.n} of the six are weak to them.`);
  return voiced(p, "help", parts, x);
}
// one of their Pokémon: its job on the team (its role, its class, what each move does), then what was asked (its held item and
// why it holds it, one of its moves) or its whole set, and the house rule behind it
function memberRole(doc, k, A) {
  const pr = doc.prog[k] || {}, role = doc.roles && doc.roles[k], J = ROLE_JOB[roleKind(role)], uses = (pr.mv || []).filter(Boolean).map(m => moveUse(k, m)).filter(Boolean);
  const special = J && J.need, job = memberJob(doc, k, A), cls = OPS[k].cls;
  // a Pokémon with a team job (a setter, a pivot, Intimidate) says it first; anyone else is described by what its moves do
  return special && !/ hits with /.test(job) ? `${job}. As ${an(cls)} it also ${listAnd(uses)}` : `${OPS[k].n} is my ${cls}${role === "cover" ? ", covering the team's weak spots" : ""}: it ${listAnd(uses)}`;
}
// physical or special: which side its attacks are on, how its Attack and Sp. Atk compare, and what its item and nature do to that
// (an Item Clause item a teammate holds is a reason too); honest when its item doesn't fit its moves
const CAT_ITEM = { choiceband: "atk", muscleband: "atk", choicespecs: "spa", wiseglasses: "spa" };
function catTalk(doc, k, pr, low = "") {
  const b = OPS[k].b, N = NATURES[pr.nat] || [], nm = s => N[0] === s ? 1.1 : N[1] === s ? .9 : 1, names = a => listAnd(a.map(m => MOVES[m].n));
  const dmg = (pr.mv || []).filter(m => MOVES[m] && MOVES[m].p && MOVES[m].c !== "X"), P = dmg.filter(m => MOVES[m].c === "P"), Sp = dmg.filter(m => MOVES[m].c === "S");
  const side = P.length > Sp.length ? "physical" : Sp.length > P.length ? "special" : "mixed", usual = b[3] > b[1] ? "special" : "physical";
  const boost = CAT_ITEM[pr.held], mult = { choiceband: 1.5, choicespecs: 1.5, muscleband: 1.1, wiseglasses: 1.1 }[pr.held] || 1;
  const atk = Math.round(b[1] * nm("atk") * (boost === "atk" ? mult : 1)), spa = Math.round(b[3] * nm("spa") * (boost === "spa" ? mult : 1));
  const out = [side === "mixed" ? `Its attacks are mixed: ${names(P)} physical, ${names(Sp)} special.`
    : `Mine's ${side}: ${names(side === "physical" ? P : Sp)}${(side === "physical" ? Sp : P).length ? `, with ${names(side === "physical" ? Sp : P)} on the other side` : ""}.`];
  const statLine = `Its ${usual === "special" ? `Sp. Atk (${b[3]}) is higher than its Attack (${b[1]})` : `Attack (${b[1]}) is higher than its Sp. Atk (${b[3]})`}, so ${usual} is usually the better way.`;
  const mateOf = h => doc.team.find(o => o !== k && doc.prog[o] && doc.prog[o].held === h);
  let stats = false;
  if (boost && side !== "mixed" && (boost === "atk") !== (side === "physical")) {
    // the item helps the other side: its S1 move (no cooldown, the one it uses most) may be on that side, and the other Choice item may be a teammate's
    out.push(`Fair point, the ${HELD[pr.held].n} doesn't help its ${side} moves.`);
    const S1 = MOVES[(pr.mv || [])[0]];
    if (S1 && S1.p && (S1.c === "P") === (boost === "atk")) out.push(`It does power up ${S1.n}, its S1 move: no cooldown, so it's the one it uses most.`);
    const rivalItem = { atk: "choicespecs", spa: "choiceband" }[boost], mate = rivalItem && mateOf(rivalItem);
    if (mate) out.push(`The ${HELD[rivalItem].n} is on my ${OPS[mate].n}, and it's one per team.`);
  } else if (side !== "mixed" && side !== usual) {
    out.push(statLine); stats = true;
    const mine = side === "physical" ? atk : spa, other = side === "physical" ? spa : atk;
    if (mine > other) out.push(`But with ${[boost ? `the ${HELD[pr.held].n}` : null, nm(side === "physical" ? "atk" : "spa") > 1 ? `${an(natName(pr.nat))} nature` : null].filter(Boolean).join(" and ") || "its set"} its ${side === "physical" ? "Attack" : "Sp. Atk"} works out to about ${mine} against ${other}, so the ${side} side hits harder.`);
    const rival = { physical: "choicespecs", special: "choiceband" }[side], mate = mateOf(rival);
    if (mate) out.push(`And my ${OPS[mate].n} has the ${HELD[rival].n} (one per team).`);
  }
  // asked about the other side ("is physical Charizard good?"): what its stats say
  const other = usual === "special" ? "physical" : "special";
  if (!stats && new RegExp("\\b" + other + "\\b").test(low)) out.push(statLine);
  return out;
}
function memberTalk(p, doc, k, x, I = {}) {
  const A = archOf(doc), pr = doc.prog[k] || {}, parts = [memberRole(doc, k, A) + "."], it = (I.items || [])[0], mv = (I.moves || []).find(m => (pr.mv || []).includes(m));
  if (it) parts.push(pr.held === it ? `It holds ${an(HELD[it].n)}${ITEM_FOR[it] ? " " + ITEM_FOR[it] : ""}: ${HELD[it].d}` : `It holds ${pr.held ? an(HELD[pr.held].n) : "nothing"}, not ${an(HELD[it].n)}.`);
  else if (mv) parts.push(`${MOVES[mv].n}: ${moveDesc(makeSkill(mv, MOVES[mv].s))}.`);
  else parts.push(`It runs ${setText(k, pr)}.`);
  if (I.cat || (it && CAT_ITEM[it])) parts.push(...catTalk(doc, k, pr, I.low));
  if (I.faq && (I.q || I.help || I.why)) parts.push(I.faq.a);
  else if (!it && !mv && pr.held && detailOf(p) >= 2) parts.push(`The ${HELD[pr.held].n} is there ${ITEM_FOR[pr.held] || "for its effect"}: ${HELD[pr.held].d}`);
  return voiced(p, "help", parts, { ...x, op: OPS[k].n });
}
function leadTalk(p, doc, x) {
  const A = archOf(doc), leads = leadsOf(doc, A);
  return voiced(p, "help", leads.length ? [`I lead with ${listAnd(leads.map(k => OPS[k].n))}${leads.length < ACTIVE ? ", and the rest depends on who I'm up against" : ""}.`, leads.map(k => memberBrief(doc, k, A)).join(". ") + "."]
    : ["Depends on who I'm up against: I send out whoever matches up best."], x);
}
// a Ranked tier, from where they stand: what you meet there, its points, how many are in it, and (for you) how far you are
function tierTalk(p, t, from, I, x, again) {
  const T = TIERS[t], nx = TIERS[t + 1], mine = tierIdx(S.ladder.pop[p.i]), d = detailOf(p);
  // what you meet there, with the tier's Pokémon levels (the team config's)
  const lvOf = i => { const b = tierLevels(i); return b ? (b[0] === b[1] ? `, their Pokémon all Lv ${b[0]}` : `, their Pokémon Lv ${b[0]} to ${b[1]}`) : ""; };
  const meetOf = i => { const m = TIER_TALK[i].meet, j = m.indexOf(";"), lv = lvOf(i); return j < 0 ? m + lv : m.slice(0, j) + lv + m.slice(j); };
  const K = { hard: TIER_TALK[t].hard, meet: meetOf(t) };
  const me = mine === t ? `I'm in ${T.n} myself, and it's ${K.hard}` : mine > t ? `I came up through ${T.n}. It's ${K.hard}` : `I haven't made ${T.n} yet, but from what I've seen it's ${K.hard}`;
  const below = t > 0 ? meetOf(t - 1) : null;
  const parts = again ? [`Because ${K.meet}.${below && t >= T_MASTER ? ` One tier down, in ${TIERS[t - 1].n}, ${below}.` : ""}`] : [`${me}: ${K.meet}.`];
  if (d >= 1) parts.push(`${T.n} is ${nx ? `${fmtFull(T.min)} to ${fmtFull(nx.min - 1)} points` : `${fmtFull(T.min)} points and up`}, and ${fmtFull(S.ladder.pop.filter(v => tierIdx(v) === t).length)} Trainers on the server are in it right now.`);
  if (from === -1 && (d >= 2 || (I && I.climb))) {
    const pt = tierIdx(S.ladder.pts);
    parts.push(pt < t ? `You're in ${TIERS[pt].n} at ${fmtFull(S.ladder.pts)}, so that's ${fmtFull(T.min - S.ladder.pts)} points to go. A win against a Trainer near your rating is worth about ${Math.round(eloK(S.ladder.pts) / 2)} points.`
      : pt === t ? "You're in it already, so you know." : `You're past it already, in ${TIERS[pt].n}.`);
  }
  return voiced(p, "help", parts, x);
}
// a playstyle: its plan, the sub-style asked about, which Pokémon fit its first jobs, and whether it's what they run
function archTalk(p, doc, A, sub, x) {
  const parts = [`${A.n}: ${ARCH_PLAN[A.id]}.`], d = detailOf(p), mineA = doc.arch && doc.arch.id === A.id;
  if (sub && ARCH_SUB_PLAN[sub]) parts.push(`${sub}: ${ARCH_SUB_PLAN[sub]}.`);
  else if (d >= 2) parts.push(`It comes as ${listAnd(A.subs)}.`);
  if (d >= 2) {
    const G = doc.gens || (kantoDoneAt(doc.lvl || 0) ? ALL_GENS : KANTO_ONLY), done = G.size > 1;
    const fits = A.roles.filter(R => R.r !== "cover" && !R.bench).slice(0, 2).map(R => { const c = COMP_POOL().filter(k => R.ok(k) && genOk(k, G)).sort((a, b) => R.sc(b) - R.sc(a)).slice(0, 2).map(k => OPS[k].n); return c.length ? `${ROLE_NAME[R.kind] || R.name} like ${listAnd(c)}` : null; }).filter(Boolean);
    if (fits.length) parts.push(`${done ? "These days" : "In Kanto"} that's ${listAnd(fits)}.`);
  }
  if (mineA) parts.push(`It's what I run: ${listAnd(doc.team.map(k => OPS[k].n))}.`);
  return voiced(p, "help", parts, x);
}
function ownTalk(p, i, from, txt, I, st, op, x) {
  if (i < 0 || i >= LADDER_N) return null;
  const doc = ladderDoc(i), low = String(txt).toLowerCase(), now = Date.now();
  const said = st.said && st.said.to === from && now - st.said.t < 15 * 60e3 ? st.said : null;
  const note = (k, o = {}) => { st.said = { k, to: from, t: now, ...o }; };
  const onTeam = op && doc.team.includes(op);
  const vague = !I.ops.length && I.tier == null && !I.arch && !I.leader && !I.types.length && !I.items.length && !I.stage;
  const more = I.explain || I.why || (I.help && /\b(it|that|this|them)\b/.test(low));
  // one of their own Pokémon: its job on the team and its set
  if (onTeam && (I.you || (said && said.k === "team")) && (I.q || I.why || I.explain || I.help || I.build || I.rate)) { note("member", { op }); return { parts: memberTalk(p, doc, op, x, I) }; }
  // "is your team Bulky Offense?"
  if (I.you && I.arch && !more) {
    const A = archOf(doc), team = listAnd(doc.team.map(k => OPS[k].n));
    note("team");
    return { parts: voiced(p, "help", [A && A.id === I.arch.A.id ? `Yes, ${A.n}, ${doc.arch.sub}: ${team}.` : `No, ${A ? `mine's ${an(A.n)} team, ${doc.arch.sub}` : "mine's not an archetype team"}: ${team}.`], x) };
  }
  // their team's plan
  if ((I.you && (I.team || /\b(strateg(y|ies)|game ?plan|plan|core|archetype|playstyle)\b/.test(low)) && more) || (more && vague && said && said.k === "team")) { note("team"); return { parts: teamTalk(p, doc, x) }; }
  if (I.you && I.lead && (I.q || I.help)) { note("team"); return { parts: leadTalk(p, doc, x) }; }
  // more about what they just said
  if (more && vague && said) {
    if (said.k === "member" && doc.team.includes(said.op)) return { parts: memberTalk(p, doc, said.op, x, I) };
    if (said.k === "build" && OPS[said.op]) return { parts: sayBuild(p, buildFacts(said.op, from === -1 && !!S.ops[said.op]), { ...x, op: OPS[said.op].n }, 3) };
    if (said.k === "rank" || said.k === "tier") return { parts: tierTalk(p, said.tier != null ? said.tier : tierIdx(S.ladder.pop[i]), from, I, x, true) };
    if (said.k === "arch") { const A = ARCHETYPES.find(a => a.id === said.arch); if (A) return { parts: archTalk(p, doc, A, said.sub, x) }; }
  }
  // a Ranked tier: what it's like there, from where they stand
  if (I.tier != null && (I.q || I.help || I.hard || I.climb)) { note("tier", { tier: I.tier }); return { parts: tierTalk(p, I.tier, from, I, x) }; }
  if (I.rank && (I.hard || I.climb) && I.q) {
    const t = I.climb && from === -1 ? Math.min(TIERS.length - 1, tierIdx(S.ladder.pts) + 1) : tierIdx(S.ladder.pop[i]);
    note("tier", { tier: t }); return { parts: tierTalk(p, t, from, I, x) };
  }
  // a playstyle
  if (I.arch && (I.q || I.help || I.explain)) { note("arch", { arch: I.arch.A.id, sub: I.arch.sub }); return { parts: archTalk(p, doc, I.arch.A, I.arch.sub, x) }; }
  return null;
}

// a question about one of their own details (traitGroups/traitOf in a6e_people.js): "what's your favourite dessert?", "least favourite
// vegetable?", "cats or dogs?", "what do you think of Trick Room?", "what's your hobby?". The group whose label the message names (the
// longest one), asked the way that group is answered; null when it's none of those
const TRAIT_Q = () => TRAIT_Q.v || (TRAIT_Q.v = (() => {
  const idx = [], you = s => s.replace(/\btheir\b/g, "your").replace(/\bthey'd\b/g, "you'd").replace(/\bthey're\b/g, "you're").replace(/\bthey've\b/g, "you've").replace(/\bthey\b|\bthem\b/g, "you");
  for (const g of traitGroups()) {
    const keys = new Set([you(g.key)]);
    if (g.kind === "pref") { const m = /^(.+) or (.+)$/.exec(g.key); if (m && !m[1].includes(",")) keys.add(m[2] + " or " + m[1]); const w = /^which (.+)$/.exec(g.key); if (w) keys.add(w[1]); }
    if (/^pk:|^least:[A-Z]/.test(g.id)) keys.add(g.key.replace(/ pokemon$/, ""));
    if (/^mv:/.test(g.id)) keys.add(g.key.replace(/ type move$/, " move"));
    if (/^gen:/.test(g.id)) { keys.add(g.key.replace(/ pokemon$/, "")); keys.add(g.key.replace(/^gen/, "generation")); }
    if (/^lim:/.test(g.id)) keys.add(g.key.replace(/ pokemon$/, "") + " pokemon");
    if (/^letter:/.test(g.id)) keys.add(g.key.replace("starting with", "that starts with"));
    for (const k of keys) if (k) idx.push({ g, k, re: new RegExp("(^| )" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "( |$)") });
  }
  return idx.sort((a, b) => b.k.length - a.k.length);
})());
function traitTalk(p, txt, I) {
  const low = traitNorm(txt).replace(/\b(favorite|favourites?|favorites|fav|faves?|favs)\b/g, "favourite").replace(/\bcolor/g, "colour").replace(/\bflavor/g, "flavour")
    .replace(/\bwould you\b/g, "you'd").replace(/\bur\b/g, "your").replace(/\bu\b/g, "you");
  if (!(I.q || I.you || /\?/.test(txt))) return null;
  const least = /\bleast favourite\b|\bworst\b|\bhate the most\b/.test(low), fav = /\bfavourite\b/.test(low), or = / or /.test(low) || /\bwhich\b/.test(low);
  const opin = /\b(what do you think|thoughts on|how do you feel about|do you like|opinion (on|of|about)|how do you like|you like|you feel about|you think (of|about))\b/.test(low);
  const yours = /\byou(r|'d|'re|'ve)?\b/.test(low);
  for (const { g, re } of TRAIT_Q()) {
    if (!re.test(low)) continue;
    const ok = g.kind === "least" ? least : g.kind === "fav" ? fav && !least : g.kind === "pref" ? or || fav : g.kind === "op" ? opin : yours;
    if (ok) return traitSay(p, g, true);
  }
  return null;
}
// what they'd say about themselves
function selfParts(p, I) {
  const doc = ladderDoc(p.i), g = guildOf(p.i), out = [], fav = OPS[p.fav[0]].n, A = p.arch, pts = S.ladder.pop[p.i], tier = tierOf(pts).n;
  if (I.fav) out.push(A === "collector" ? `All of them!! But ${fav} most` : A === "tryhard" ? `${OPS[doc.team[0]].n}, because it wins. Personally? ${fav}` : `${fav}, always. ${OPS[p.fav[1]].n} too`);
  if (I.rank) out.push(A === "tryhard" ? `${tier}, ${fmtFull(pts)}. Pushing higher` : A === "salty" ? `Stuck in ${tier} at ${fmtFull(pts)}, thanks to matchmaking` : A === "casual" || A === "lurker" ? `${tier} I think? Wherever Auto takes me` : `${tier}, ${fmtFull(pts)} points`);
  if (I.club) out.push(g ? (g.lead === p.i ? `I run ${g.name} [${g.tag}]` : `I'm in ${g.name} [${g.tag}]`) + (g.pol !== "closed" && g.mem.length < guildCap(g) && !S.guild ? ", want in?" : "") : "No Club right now");
  if (I.team && !I.fav && !I.rank) out.push(doc.arch ? `I run ${an(archName(doc.arch))} team, ${archSub(doc.arch)}: ${listAnd(doc.team.map(k => OPS[k].n))}` : `My Registered Team is ${listAnd(doc.team.map(k => OPS[k].n))}`);
  if (I.howlong) out.push(A === "veteran" ? `${p.joined} days, since near the start` : `${p.joined} days now`);
  if (I.level && !out.length) out.push(`Trainer Lv ${p.lvl}`);
  if (I.who && !out.length) { const bio = p.bio.replace(/[.!?…]+$/, "");
    out.push(`${personaOf(p) ? personaName(p) + " here" : ARCH_NAME[A] + " Trainer"}, ${p.joined} days in. ${bio ? bio + ". " : ""}Favourite is ${fav}`); }
  return out;
}

// ---------- the reply ----------
// from: who spoke (-1 the player, or a Trainer's index); returns { parts } (their own words) or { topic } (a line from the corpus)
function talkAnswer(i, from, txt, ch) {
  const p = person(i), st = npcState(i), I = readMsg(txt), x = { to: from === -1 ? S.name : npcName(from) };
  if (from === -1) st.aff = (st.aff || 0) + (I.rude ? -.3 : .03);
  if (I.rude) return { topic: "reply_insulted" };
  if (from === -1 && (st.aff || 0) < -.5 && Math.random() < .7) return { parts: [vpick(["Not after how you talked to me.", "Nah.", "Ask someone else."])] };
  const greetPre = I.greet && !I.howru ? fillV(vpick(VOICEOF(p).hi), p, x) : "";
  const withHi = r => { if (r && r.parts && greetPre) r.parts[0] = join2(greetPre, r.parts[0]); return r; };
  // a follow-up to their own "which Pokémon?"
  const pend = st.ask && Date.now() - st.ask.t < 10 * 60e3 ? st.ask : null;
  if (pend && I.ops.length && !I.rate && !I.where && !I.evolve && !I.counter) { I.build = I.build || pend.k === "build"; }
  st.ask = null;
  const op = I.ops[0], mine = from === -1 && op && (I.mine || !!S.ops[op]);
  if (op) Object.assign(x, { op: OPS[op].n, genus: OPS[op].genus || "", dex: String(OPS[op].id) });
  const own = ownTalk(p, i, from, txt, I, st, op, x);
  if (own) return withHi(own);
  const tr = traitTalk(p, txt, I);
  if (tr) return withHi({ parts: [/[.!?~)]$/.test(tr) ? tr : tr + "."] });
  // low-effort Trainers sometimes don't bother with real questions
  const asks = I.build || I.rate || I.counter || I.where || I.evolve || I.faq || I.farm || (I.help && I.q);
  if (asks && p.help < .15 && p.arch !== "newbie" && Math.random() < .5) return withHi({ parts: [vpick(["idk tbh", "no idea, ask a Mentor", "couldn't tell you", "ask in the Union Room, someone will know"])] });
  if (I.build && op) { st.said = { k: "build", op, to: from, t: Date.now() }; return withHi({ parts: sayBuild(p, buildFacts(op, mine), x) }); }
  if ((I.build || I.help || I.q) && /\bmy (team|squad|lineup)\b/.test(txt.toLowerCase()) && from === -1) {
    const T = teamFacts();
    if (T) return withHi({ parts: voiced(p, "help", [`${T.weakN} of your ${T.n} are weak to ${T.weak} moves, so ${T.fix.length ? `a ${T.fix.join(" or ")} type would cover that` : "watch out for those"}.${T.healer ? "" : " A Supporter that heals would help too."}`], x) });
  }
  if (I.rate && op) return withHi({ parts: sayRate(p, rateFacts(op), x) });
  if (I.counter && (I.leader || I.stage || op || I.types.length)) { const f = counterFacts(I, from); if (f) return withHi({ parts: sayCounter(p, f, x) }); }
  if (I.where && op) { const w = whereFind(op); return withHi({ parts: sayAnswer(p, w.length ? `You can get ${OPS[op].n} from ${listAnd(w.slice(0, detailOf(p) >= 2 ? 4 : 2))}.` : `${OPS[op].n} isn't something you can catch, sadly.`, x) }); }
  if (I.where && I.items.length) { const w = itemWhere(I.items[0]); return withHi({ parts: sayAnswer(p, w ? `${HELD[I.items[0]].n}: ${w}.` : `${HELD[I.items[0]].n} drops in Explore, keep farming.`, x) }); }
  if (I.evolve && op) { const e = evoFacts(op); return withHi({ parts: sayAnswer(p, e.into.length ? `${e.op} evolves into ${listAnd(e.into)}.` : e.from ? `${e.op} is fully evolved (it comes from ${e.from}).` : `${e.op} doesn't evolve.`, x) }); }
  if (I.farm && !I.items.length && !op && (I.q || I.help)) return withHi({ parts: exploreTalk(p, from, x) });
  if (I.faq && (I.q || I.help)) return withHi({ parts: sayAnswer(p, I.faq.a, x) });
  if (I.build || (I.help && I.q && !I.you)) { st.ask = { k: "build", t: Date.now() }; return withHi({ parts: [fillV(vpick(VOICEOF(p).ask), p, x)] }); }
  if (I.rate && I.items.length) return withHi({ parts: sayAnswer(p, `${HELD[I.items[0]].n}: ${firstSentence(HELD[I.items[0]].d)}.`, x) });
  // about them
  if (I.you && (I.q || I.who)) {
    const s = selfParts(p, I);
    if (s.length) { st.said = { k: I.team && !I.fav && !I.rank ? "team" : I.rank ? "rank" : "self", tier: tierIdx(S.ladder.pop[i]), to: from, t: Date.now() }; return withHi({ parts: [s.join(". ") + "."] }); }
  }
  if (I.join) {
    const g = guildOf(i);
    if (from === -1 && g && !S.guild && g.pol !== "closed" && g.mem.length < guildCap(g) && (g.lead === i || g.off.includes(i) || Math.random() < .5)) { setTimeout(() => offerInvite(i, Date.now() + 6000), 0); return withHi({ parts: [vpick(["Sure! Sending you an invite.", "Of course, invite's coming!", "Yes! Check your Mail for the invite."])] }); }
    return withHi({ parts: [g ? `Ask ${npcName(g.lead)}, they run ${g.name}.` : "I'm not in a Club right now, sorry."] });
  }
  if (I.battle) return withHi({ parts: [fillV(vpick(VOICEOF(p).battle), p, x)] });
  if (I.howru) return { parts: [fillV(vpick(VOICEOF(p).mood), p, x)] };
  if (I.compliment) return withHi({ parts: [fillV(vpick(VOICEOF(p).thx), p, x)] });
  if (I.thanks) return { topic: "reply_thanks_back" in (typeof CHAT_LINES !== "undefined" ? CHAT_LINES : {}) ? "reply_thanks_back" : "reply_thanks" };
  if (I.congrats) return { topic: "reply_thanks" };
  if (I.sorry) return { parts: [vpick(["it is what it is", "yeah... thanks", "next time", "pain. thanks though"])] };
  if (I.bye) return { topic: ch === "dm" ? "dm_friendly_bye" : "reply_bye" };
  if (I.greet) return { topic: ch === "dm" && !st.talked ? "dm_hello" : "reply_greet" };
  if (op) return { topic: p.fav.includes(op) ? "reply_op_love" : metaScore(op) > metaScore(RANKED()[30]) ? "reply_op_love" : "reply_op_meh", sl: { op2: OPS[op].n, opK: op } };
  if (I.lore) return { topic: "reply_lore" };
  if (I.laugh) return { topic: "reply_laugh" };
  if (I.q) return { topic: I.you ? "reply_question_me" : "reply_unsure" };
  return { topic: ch === "dm" ? "dm_reply_default" : "reply_default" };
}
// answer: queue their reply (one or a few messages, typed at their own pace)
function talkReply(i, ch, from, txt, o = {}) {
  const p = person(i), now = Date.now();
  if (S.blocked[i]) return;
  if (p.arch === "lurker" && Math.random() < (ch === "dm" ? .35 : .55)) return;
  const r = talkAnswer(i, from, txt, ch), to = from === -1 ? S.name : npcName(from), dm = ch === "dm" ? i : undefined;
  let at = o.at || ((ch === "dm" && !isOnline(i, now)) ? nextOnline(i, now) : now + 2500 + Math.random() * 5000 * (1.2 - p.soc));
  npcState(i).talked = 1;
  if (r.parts) for (const raw of chunks(r.parts)) {
    const t2 = styleText(p, raw); at += 1200 + t2.length * (55 + Math.random() * 40);
    S.chat.q.push({ at, ch, i, txt: t2, dm, toI: from, depth: o.depth || 0 });
  } else { at += 2000 + Math.random() * 4000; S.chat.q.push({ at, ch, i, topic: r.topic, sl: { to, ...(r.sl || {}) }, dm, toI: from, depth: o.depth || 0 }); }
  if (from === -1) S.chat.lastTo = { ...(S.chat.lastTo || {}), [ch]: { i, t: at } };
}
// one Trainer spoke to another (or answered them): the other may answer back, a couple of exchanges at most
function talkFollow(x, txt) {
  const j = x.toI; if (j == null || j < 0 || j === x.i || x.ch === "dm" || (x.depth || 0) >= 2) return;
  if (!isOnline(j) || S.blocked[j]) return;
  if (x.ch === "guild" && !(S.guild && guildOf(j) && guildOf(j).id === S.guild)) return;
  const q = person(j), I = readMsg(txt);
  const keen = I.q || I.greet || I.thanks || I.congrats || I.rude || I.compliment || I.howru ? .55 : .2;
  if (Math.random() > keen * (.4 + q.soc * .8)) return;
  talkReply(j, x.ch, x.i, txt, { depth: (x.depth || 0) + 1, at: Date.now() + 3000 + Math.random() * 9000 });
}

// ---------- bios that fit the Trainer ----------
// a claim in a bio is kept for Trainers it fits ("Happy to help with builds" only for helpful ones); the rest suit anyone
const BIO_FIT = [
  [/help with builds|ask me about builds|mentoring|ask me how/i, p => p.help >= .6 || ["mentor", "veteran", "recruiter"].includes(p.arch)],
  [/recruiting|club leader|co-leader/i, p => p.arch === "recruiter"],
  [/free-to-play|one gem pack|saving gems/i, p => p.arch === "f2p"],
  [/spent|whale/i, p => p.arch === "whale"],
  [/new trainer|beginner|still learning|returning player|back after/i, p => ["newbie", "casual"].includes(p.arch)],
  [/legend or bust|not here to make friends|counterpick|banning your|draft nerd|climbing to legend|competitive/i, p => ["tryhard", "whale", "veteran", "rival", "achiever", "specialist"].includes(p.arch)],
  [/theorist|ghost believer|under the truck|fossil|lore/i, p => ["lore", "roleplayer", "memer", "collector", "philosopher", "superstitious", "creative"].includes(p.arch)],
  [/completionist|collecting|gotta catch|pok[eé]dex|cute pok[eé]mon|cries and the sprites|perfect ivs/i, p => ["collector", "casual", "shy", "achiever", "caretaker"].includes(p.arch)],
  [/salty|50\/50|luck stat|hate me|owes me|pity/i, p => ["salty", "f2p", "memer", "casual", "gambler", "superstitious"].includes(p.arch)],
  [/former legend/i, p => ["veteran", "whale", "tryhard"].includes(p.arch)],
  [/day one|since launch/i, p => p.joined >= Math.floor(srvDays()) - 60],   // (only someone who's been here since the server opened)
  [/returning player|back after/i, p => p.joined >= 60],
  [/disappointment|studying for exams|will trade pp|professional|spirit animal|national treasure/i, p => ["memer", "casual", "hypebeast", "f2p", "student", "worker", "gossip"].includes(p.arch)],
  [/please go easy|please be nice|don't challenge/i, p => ["shy", "newbie", "casual", "lurker"].includes(p.arch)],
];
function pickBio(roll, p) {
  const fits = DOC_BIOS.filter(b => BIO_FIT.every(([re, ok]) => !re.test(b) || ok(p)));
  const list = fits.length ? fits : DOC_BIOS;
  return list[Math.floor(roll * list.length) % list.length];
}
