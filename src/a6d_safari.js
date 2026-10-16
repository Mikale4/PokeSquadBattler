
// =====================================================================
//  SAFARI ZONE AREAS — three themed areas open each week (the same for every Trainer), plus the Whole Park.
//  A type area also has every Pokémon of its type from Johto, Hoenn, Sinnoh and Unova (ty); the rest list theirs.
//  In an area, half of all 5★ catches are its featured 5★ (70% split between two in a "Joint" area),
//  half of the 4★ catches its featured 4★, and a fifth of the 3★ catches its featured 3★.
//  (Internal names kept the sister game's: banner, feat6 = featured 5★, feat5 = 4★, feat4 = 3★.)
// =====================================================================
const BANNER_THEMES = [
  { id: "fire", ty: "Fire", n: "Flame Burst", sub: "Fire-type area", d: "The ground's warm and the grass smells of smoke. Fire types gather here this week.", six: ["charizard", "flareon"], five: ["arcanine", "ninetales", "rapidash", "magmar"], four: ["ponyta"], col: "#ee8130" },
  { id: "water", ty: "Water", n: "Tidal Pools", sub: "Water-type area", d: "The Safari Zone's lakes are brimming. Fish, shells and something huge in the deep water.", six: ["blastoise", "gyarados", "lapras", "vaporeon"], five: ["starmie", "cloyster", "golduck", "kingler"], four: ["psyduck", "staryu", "horsea"], col: "#6390f0" },
  { id: "grass", ty: "Grass", n: "Overgrowth", sub: "Grass-type area", d: "The long grass is taller than you are. Watch your step.", six: ["venusaur"], five: ["vileplume", "victreebel", "exeggutor", "tangela"], four: ["oddish", "bellsprout", "exeggcute"], col: "#7ac74c" },
  { id: "eevee", n: "Eeveelution Meadow", sub: "Joint area", d: "Eevee and its evolutions take turns in the spotlight, two at a time.", joint: 1, six: ["eevee", "vaporeon", "jolteon", "flareon", "espeon", "umbreon", "leafeon", "glaceon", "sylveon"], five: ["ditto", "persian"], four: ["meowth"], col: "#c8a06a" },
  { id: "fossil", n: "Fossil Dig Site", sub: "Mt. Moon · Cinnabar Lab", d: "Prehistoric Pokémon, brought back to life by the Cinnabar Lab: from Kanto's Helix and Dome Fossils to Galar's fossil halves.", dk: "Prehistoric Pokémon, brought back to life by the Cinnabar Lab from the Helix Fossil, the Dome Fossil and the Old Amber.", six: ["aerodactyl", "omastar", "kabutops", "cradily", "armaldo", "rampardos", "bastiodon", "carracosta", "archeops", "tyrantrum", "aurorus", "dracozolt", "arctozolt", "dracovish", "arctovish"], five: ["omanyte", "kabuto", "onix", "lileep", "anorith", "cranidos", "shieldon", "tirtouga", "archen"], four: ["geodude"], col: "#b6a136" },
  { id: "dragon", ty: "Dragon", n: "Dragon's Den", sub: "Dragon area", d: "Mist hangs over the water. Some say a Dragonite lives at the bottom of the lake.", six: ["dragonite", "dragonair", "dratini"], five: ["onix", "arbok"], four: ["horsea", "seadra", "magikarp"], col: "#6f35fc" },
  { id: "dojo", n: "Fighting Dojo", sub: "Joint area · Saffron City", d: "The Karate Master's prize Pokémon, both of them this time.", joint: 1, six: ["hitmonlee", "hitmonchan"], five: ["primeape", "poliwrath", "machoke"], four: ["mankey", "machop"], col: "#c22e28" },
  { id: "ghost", ty: "Ghost", n: "Lavender Nights", sub: "Ghost area · Lavender Town", d: "Something moves in the fog by Pokémon Tower. Bring a Silph Scope.", six: ["gengar"], five: ["haunter", "marowak", "hypno"], four: ["gastly", "cubone", "zubat"], col: "#735797" },
  { id: "psychic", ty: "Psychic", n: "Saffron Mindscape", sub: "Psychic area", d: "Spoons bend on their own around here.", six: ["alakazam", "mrmime"], five: ["kadabra", "hypno", "slowbro", "jynx", "starmie"], four: ["drowzee", "slowpoke", "exeggcute"], col: "#f95587" },
  { id: "classic", n: "Safari Classics", sub: "Joint area · Fuchsia City", d: "The Safari Zone the way it was in Red and Blue. Two of Kangaskhan, Tauros, Chansey, Scyther and Pinsir star each week.", joint: 1, six: ["kangaskhan", "tauros", "chansey", "scyther", "pinsir"], five: ["venomoth", "rhydon", "dodrio"], four: ["doduo", "rhyhorn", "paras", "nidoranf", "nidoranm"], col: "#5d8a3a" },
  { id: "bugs", ty: "Bug", n: "Viridian Canopy", sub: "Bug area", d: "Bug Catchers swear the forest is busier than ever.", six: ["scyther", "pinsir"], five: ["butterfree", "beedrill", "venomoth"], four: ["caterpie", "weedle", "paras", "venonat"], col: "#a6b91a" },
  { id: "rock", ty: ["Rock", "Ground"], n: "Rock Tunnel", sub: "Rock and Ground area", d: "Pitch black, full of Zubat, and worth it for what lives in the walls.", six: ["golem", "aerodactyl"], five: ["onix", "graveler", "sandslash", "rhydon", "marowak"], four: ["geodude", "rhyhorn", "cubone", "diglett"], col: "#9a7a3a" },
  { id: "power", ty: "Electric", n: "Power Plant Surge", sub: "Electric area", d: "The abandoned Power Plant is crackling again.", six: ["jolteon"], five: ["raichu", "magneton", "electrode", "electabuzz", "pikachu"], four: ["magnemite", "voltorb"], col: "#f7d02c" },
  { id: "ice", ty: "Ice", n: "Seafoam Chill", sub: "Ice area", d: "Cold currents from the Seafoam Islands bring Ice types ashore.", six: ["lapras"], five: ["dewgong", "cloyster", "jynx"], four: ["seel", "shellder"], col: "#96d9d6" },
  { id: "snooze", ty: "Normal", n: "Snorlax Snooze Fest", sub: "Normal area", d: "Something big is blocking the path again. Bring a Poké Flute.", six: ["snorlax", "chansey"], five: ["clefable", "wigglytuff", "lickitung", "persian"], four: ["jigglypuff", "meowth"], col: "#a8a77a" },
  { id: "silph", n: "Silph Co. Labs", sub: "Silph Co. · Saffron City", d: "Silph's researchers let a few experiments loose in the park.", six: ["porygon"], five: ["ditto", "magneton", "electrode"], four: ["magnemite", "voltorb", "grimer", "koffing"], col: "#3a7ad8" },
  { id: "prize", n: "Prize Corner Picks", sub: "Celadon Game Corner", d: "The Pokémon you'd save up Coins for, out in the wild for a change.", six: ["dratini", "porygon", "scyther", "pinsir"], five: ["clefairy", "abra"], four: ["nidorina", "nidorino"], col: "#d8402e" },
  { id: "starters", n: "Kanto Starters", sub: "Joint area · Prof. Oak's lab", d: "Prof. Oak opened his pens: two of the three starters roam the park this week.", joint: 1, six: ["venusaur", "charizard", "blastoise"], five: ["pikachu", "raichu"], four: ["pidgey", "rattata"], col: "#e3350d" },
  { id: "heavy", n: "Heavyweights", sub: "Joint area", d: "The biggest Pokémon around, two of them at a time.", joint: 1, six: ["snorlax", "lapras", "gyarados", "dragonite", "wailord", "steelix", "metagross", "hippowdon", "mamoswine", "rhyperior"], five: ["rhydon", "onix", "nidoking", "nidoqueen", "aggron", "torterra", "golurk"], four: ["rhyhorn", "magikarp"], col: "#5a6a8a" },
  // (far: an area about the other regions, which opens once the Kanto Journey is complete: BANNER_KANTO)
  { id: "johto", far: 1, n: "Johto Starters", sub: "Joint area · Prof. Elm's lab", d: "Prof. Elm sent his starters over from New Bark Town: two of the three roam the park this week.", joint: 1,
    six: ["meganium", "typhlosion", "feraligatr", "chikorita", "cyndaquil", "totodile"], five: ["furret", "noctowl", "ledian", "ariados", "ampharos", "togetic", "flaaffy"],
    four: ["sentret", "hoothoot", "ledyba", "spinarak", "mareep", "pichu", "togepi"], col: "#c8a03a" },
  { id: "hoenn", far: 1, n: "Hoenn Starters", sub: "Joint area · Prof. Birch's lab", d: "Prof. Birch is doing fieldwork in the park, and his three starters came along.", joint: 1,
    six: ["sceptile", "blaziken", "swampert", "treecko", "torchic", "mudkip"], five: ["linoone", "beautifly", "dustox", "swellow", "pelipper", "mightyena", "kirlia", "ludicolo", "shiftry"],
    four: ["zigzagoon", "wurmple", "taillow", "wingull", "poochyena", "ralts", "lotad", "seedot"], col: "#3aa86a" },
  { id: "sinnoh", far: 1, n: "Sinnoh Starters", sub: "Joint area · Prof. Rowan's lab", d: "Prof. Rowan let Turtwig, Chimchar and Piplup out to study how they get on with Kanto.", joint: 1,
    six: ["torterra", "infernape", "empoleon", "turtwig", "chimchar", "piplup"], five: ["staravia", "bibarel", "kricketune", "luxio", "roselia", "staraptor", "luxray"],
    four: ["starly", "bidoof", "kricketot", "shinx", "budew", "burmy"], col: "#5a7ae0" },
  { id: "unova", far: 1, n: "Unova Starters", sub: "Joint area · Prof. Juniper's lab", d: "Prof. Juniper's starters, all the way from Nuvema Town. Two at a time.", joint: 1,
    six: ["serperior", "emboar", "samurott", "snivy", "tepig", "oshawott"], five: ["watchog", "herdier", "liepard", "tranquill", "zebstrika", "boldore", "swoobat"],
    four: ["patrat", "lillipup", "purrloin", "pidove", "blitzle", "roggenrola", "woobat"], col: "#7a7a8a" },
  { id: "pseudo", far: 1, n: "Pseudo-Legend Peak", sub: "Joint area", d: "The strongest dragons and monsters that aren't legends: Dragonite, Tyranitar, Salamence, Metagross, Garchomp and Hydreigon, two at a time.", joint: 1,
    six: ["dragonite", "tyranitar", "salamence", "metagross", "garchomp", "hydreigon", "goodra", "kommoo", "dragapult", "baxcalibur"], five: ["flygon", "altaria", "kingdra", "aerodactyl", "noivern", "haxorus"], four: ["trapinch", "swablu", "horsea", "noibat", "axew"], col: "#7038f8" },
  { id: "kalos", far: 1, n: "Kalos Starters", sub: "Joint area · Prof. Sycamore's lab", d: "Prof. Sycamore sent Chespin, Fennekin and Froakie over from Lumiose City. Two at a time.", joint: 1,
    six: ["chesnaught", "delphox", "greninja", "chespin", "fennekin", "froakie"], five: ["talonflame", "pyroar", "vivillon", "diggersby", "fletchinder", "florges"], four: ["fletchling", "bunnelby", "scatterbug", "litleo", "flabebe"], col: "#3a7ad8" },
  { id: "alola", far: 1, n: "Alola Starters", sub: "Joint area · Prof. Kukui's lab", d: "Prof. Kukui's starters, straight from Iki Town. Two of them roam the park this week.", joint: 1,
    six: ["decidueye", "incineroar", "primarina", "rowlet", "litten", "popplio"], five: ["toucannon", "gumshoos", "vikavolt", "lycanroc", "ribombee", "araquanid"], four: ["pikipek", "yungoos", "grubbin", "rockruff", "cutiefly"], col: "#e8902e" },
  { id: "galar", far: 1, n: "Galar Starters", sub: "Joint area · Prof. Magnolia's lab", d: "Grookey, Scorbunny and Sobble, sent by Prof. Magnolia from Wedgehurst. Two at a time.", joint: 1,
    six: ["rillaboom", "cinderace", "inteleon", "grookey", "scorbunny", "sobble"], five: ["corviknight", "greedent", "thievul", "boltund", "dubwool", "drednaw"], four: ["rookidee", "skwovet", "nickit", "yamper", "wooloo", "chewtle"], col: "#c8325a" },
  { id: "paldea", far: 1, n: "Paldea Starters", sub: "Joint area · Naranja and Uva Academy", d: "Sprigatito, Fuecoco and Quaxly, on an exchange visit from Paldea's academy. Two at a time.", joint: 1,
    six: ["meowscarada", "skeledirge", "quaquaval", "sprigatito", "fuecoco", "quaxly"], five: ["pawmot", "lokix", "spidops", "dachsbun", "arboliva", "kilowattrel"], four: ["lechonk", "tarountula", "nymble", "pawmi", "fidough", "smoliv"], col: "#d8402e" },
  { id: "paradox", far: 1, n: "Area Zero Expedition", sub: "Joint area · the Great Crater of Paldea", d: "Something strange came up from the bottom of the Great Crater: Pokémon from the ancient past and the far future.", joint: 1,
    six: ["greattusk", "screamtail", "brutebonnet", "fluttermane", "slitherwing", "sandyshocks", "roaringmoon", "walkingwake", "gougingfire", "ragingbolt",
      "irontreads", "ironbundle", "ironhands", "ironjugulis", "ironmoth", "ironthorns", "ironvaliant", "ironleaves", "ironboulder", "ironcrown"], five: [], col: "#5a3a8a" },
  { id: "ultra", far: 1, n: "Ultra Wormhole", sub: "Joint area · Ultra Space", d: "A wormhole opened over the park. The Ultra Beasts that came through are as strange as they are strong.", joint: 1,
    six: ["nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord", "naganadel", "stakataka", "blacephalon"], five: [], four: ["poipole"], col: "#3a9ab8" },
  { id: "steel", far: 1, ty: "Steel", n: "Iron Works", sub: "Steel area", d: "Something is gnawing on the park's fences. Steel types, from every region.", six: [], five: [], col: "#b8b8d0" },
  { id: "dark", far: 1, ty: "Dark", n: "Midnight Alley", sub: "Dark area", d: "The park after dark belongs to the Dark types.", six: [], five: [], col: "#705848" },
  { id: "fairy", far: 1, ty: "Fairy", n: "Fairy Garden", sub: "Fairy area", d: "The flower beds are glowing at night. Fairy types have moved in.", six: [], five: [], col: "#ee99ac" },
  { id: "sky", far: 1, ty: "Flying", n: "Sky Pillar Winds", sub: "Flying area", d: "Strong winds blow birds and dragons in from every region.", six: [], five: [], col: "#a890f0" },
  { id: "toxic", far: 1, ty: "Poison", n: "Toxic Marsh", sub: "Poison area", d: "The Safari Zone's marsh has gone purple. Don't drink the water.", six: [], five: [], col: "#a040a0" },
  { id: "fight", far: 1, ty: "Fighting", n: "Black Belt Training", sub: "Fighting area", d: "Black Belts from every region train here this week, with their Pokémon.", six: [], five: [], col: "#c03028" },
].map(t => {
  // (the listed ones first, then the rest of the type's, by rarity; no legendaries)
  const ofType = r => t.ty ? OP_KEYS.filter(k => !OPS[k].leg && OPS[k].rar === r && [].concat(t.ty).some(y => OPS[k].types.includes(y))) : [];
  const pool = (l, r) => [...new Set([...(l || []), ...ofType(r)])].filter(k => OPS[k] && !OPS[k].leg && OPS[k].rar === r);
  return { ...t, six: pool(t.six, 5), five: pool(t.five, 4), four: pool(t.four, 3) };
}).filter(t => t.six.length);
// the weekly areas open once every region is open and done (specialSafari in a6_state.js); in a week that began before that, the
// areas stay Kanto's (an area never changes while it's open): the ones about the other regions sit out and the rest keep their
// Kanto Pokémon (dk: their description then)
const BANNER_KANTO = BANNER_THEMES.filter(t => !t.far).map(t => ({ ...t, d: t.dk || t.d, six: t.six.filter(kantoMon), five: t.five.filter(kantoMon), four: t.four.filter(kantoMon) })).filter(t => t.six.length);
const BANNERS_PER_WEEK = 3;
const weekEnds = () => WEEK0 + (weekId() + 1) * WEEK_MS;
// this week's areas (deterministic: every Trainer sees the same ones; Kanto's in a week that began before your regions were all done)
function bannersNow() {
  const w = weekId(), T = !S || specialSafari(WEEK0 + w * WEEK_MS) ? BANNER_THEMES : BANNER_KANTO;
  const cycleLen = Math.ceil(T.length / BANNERS_PER_WEEK), cycle = Math.floor(w / cycleLen), pos = w % cycleLen;
  const rng = seeded(hash("safaricycle" + cycle)), order = T.slice();
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const out = [];
  for (let k = 0; k < BANNERS_PER_WEEK; k++) {
    const t = order[(pos * BANNERS_PER_WEEK + k) % order.length], r = seeded(hash(t.id + w));
    const sx = t.six.slice().sort(() => r() - .5), fv = t.five.slice().sort(() => r() - .5);
    out.push({ id: t.id + "@" + w, theme: t, n: t.n, sub: t.sub, d: t.d, col: t.col, joint: !!t.joint && sx.length > 1,
      feat6: t.joint && sx.length > 1 ? sx.slice(0, 2) : [sx[0]], feat5: fv.slice(0, 3), feat4: t.four.slice(0, 3), ends: weekEnds() });
  }
  return out;
}
const STD_BANNER = { id: "standard", n: "The Whole Park", sub: "Safari Zone · Fuchsia City", d: "Every Pokémon from the regions you've opened can turn up, except the Legendary and Mythical ones.", col: "#5d8a3a", feat6: [], feat5: [], feat4: [], std: true };

// ---------- event areas: they open with the Event Center's calendar (a6j_live.js) ----------
// Legendary Safari: a legendary is the featured 5★ (they turn up nowhere else in the Safari Zone); Ultra Ball Tickets throw
// here. Great Ball Safari: Great Ball Tickets only, 5★ and 4★ twice as likely. Step-Up Safari: five ×10 steps, each dearer
// and with a bigger guarantee, once per event. Mythical Distribution (a surprise): a Mythical, with Mystic Tickets.
// The Legendaries take turns week by week (Kanto to Unova, forms too); the Mythicals take turns at the Distributions.
const LEGEND_ROTA = OP_KEYS.filter(k => OPS[k].leg && !OPS[k].myth), MYTH_ROTA = OP_KEYS.filter(k => OPS[k].myth);
const STEP_UP = [{ cost: 2400, four: 1 }, { cost: 3600, four: 2 }, { cost: 4800, four: 2, five: true }, { cost: 5400, four: 2, x2: true }, { cost: 6000, four: 2, five: true, feat: true }];
const stepOf = B => (S.gacha.step || {})[B.id] || 0;
const stepText = st => [st.four ? `at least ${st.four === 1 ? "one" : "two"} 4★` : "", st.five ? (st.feat ? "a featured 5★" : "a 5★") : "", st.x2 ? "5★ chance doubled" : ""].filter(Boolean).join(", ");
function areaFor(ev) {
  // (the regions you had open when it opened: regionOk)
  const w = Math.floor(ev.start / (7 * 864e5)), r = seeded(hash(ev.id)), four = SAFARI_POOL(4, ev.start).sort(() => r() - .5).slice(0, 3);
  const ok = k => regionOk(k, ev.start), LR = LEGEND_ROTA.filter(ok), MR = MYTH_ROTA.filter(ok);
  const base = { id: ev.id, ev: true, kind: ev.key, ends: ev.end, feat5: four, feat4: [] };
  if (ev.key === "legend") { const k = ev.legend && ok(ev.legend) ? ev.legend : LR[w % LR.length]; return { ...base, n: `Legendary Safari: ${OPS[k].n}`, sub: "Event area · Cerulean Cave", d: `${OPS[k].n} has been seen in the Safari Zone. It turns up nowhere else in the park.`, col: "#3a6ad8", feat6: [k], ticket: "uball" }; }
  if (ev.fest) { const F = FESTS[ev.fest], six = F.six.filter(k => OPS[k] && ok(k) && (OPS[k].rar === 5 || ev.fest === "anniv")), five = F.five.filter(k => OPS[k] && ok(k) && OPS[k].rar === 4);
    return { ...base, n: `${F.n} Safari`, sub: "Festival area", d: F.d, col: F.col, feat6: six.length ? six.slice(0, 2) : [SAFARI_POOL(5, ev.start)[0]], joint: six.length > 1, feat5: five.length ? five : four }; }
  if (ev.key === "myth") { const k = ev.myth && ok(ev.myth) ? ev.myth : MR[hash("myth" + ev.start) % MR.length];
    return { ...base, n: `Mythical Distribution: ${OPS[k].n}`, sub: "Event area · Mystic Ticket", d: "A Mythical Pokémon, for a few days only. It turns up nowhere else in the park.", col: "#e85aa8", feat6: [k], ticket: "mticket" }; }
  if (ev.key === "great") return { ...STD_BANNER, ...base, n: "Great Ball Safari", sub: "Ticket area · Great Ball Tickets only", d: "The whole park, with 5★ and 4★ Pokémon twice as likely. Only Great Ball Tickets throw here.", col: "#3a8ad8", feat6: [], feat5: [], std: true, rate5: .06, rate4: .36, ticket: "gball", only: true };
  const k = SAFARI_POOL(5, ev.start).filter(x => !OPS[x].leg).sort(() => r() - .5)[0];
  return { ...base, n: `Step-Up Safari: ${OPS[k].n}`, sub: "Event area · five steps", d: `Five ×10 steps, each one dearer with a bigger guarantee. The last one is sure to catch ${OPS[k].n}.`, col: "#d8902e", feat6: [k], step: true };
}
// (the Whole Park alone until every region is open and done: specialSafari, the owner's rule)
const eventAreas = () => typeof eventsNow === "function" && S && specialSafari() ? eventsNow().filter(e => e.type === "area").map(areaFor) : [];
const safariAreas = () => [...eventAreas(), ...(!S || specialSafari() ? bannersNow() : []), STD_BANNER];
const bannerById = id => id === "standard" ? STD_BANNER : safariAreas().find(b => b.id === id) || safariAreas()[0];
// the area this week's first slot features (kept for anything that wants "the" featured Pokémon)
function bannerToday() { const b = bannersNow()[0]; return { feat6: b.feat6[0], feat5: b.feat5 }; }
// Monday: the new areas are open, with a Safari Ball to try them
function areaMail() {
  const w = weekId();
  if (S.areaWeek == null) { S.areaWeek = w; return; }
  if (S.areaWeek >= w || !specialSafari()) return;
  S.areaWeek = w;
  const names = bannersNow().map(b => `${b.n} (${b.feat6.map(k => OPS[k].n).join(" & ")})`).join(", ");
  sendMail({ from: "Safari Zone Warden", tag: "gift", title: "New Safari Zone areas are open!", body: `This week: ${names}. Here's a Safari Ball to try your luck.`, rewards: { permit: 1 } });
}
