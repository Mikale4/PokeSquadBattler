
// =====================================================================
//  BATTLE STADIUM LADDERS
//  Ranked Battles: battle other Trainers' Registered Teams (played by the AI); your own Registered Team
//  gets battled while you're away. Link Battles: matchmaking, a pick/ban draft and a timed live battle.
//  Both run against a simulated population of Trainers whose teams, training and battle AI get stronger
//  the higher they rank. (Internal names kept the sister game's: ladder, rta, Doctor = simulated Trainer.)
// =====================================================================
// tiers are Poké Balls; `ball` is the item sprite (tools/item_icons.json) drawn as the tier badge
const TIERS = [
  { n: "Beginner", min: 0, c: "#9aa3b5", ball: "ball_premier" }, { n: "Poké Ball", min: 1300, c: "#e3350d", ball: "pokeball" },
  { n: "Great Ball", min: 1600, c: "#3b7dd8", ball: "greatball" }, { n: "Ultra Ball", min: 1900, c: "#d8a019", ball: "ultraball" },
  { n: "Master Ball", min: 2200, c: "#7a3fb8", ball: "masterball" }, { n: "Veteran", min: 2500, c: "#b8902a", ball: "ball_luxury" },
  { n: "Expert", min: 2800, c: "#e85aa8", ball: "ball_dream" }, { n: "Legend", min: 3100, c: "#d8203a", ball: "ball_cherish" },
];
const tierIdx = p => { let i = 0; while (i < TIERS.length - 1 && p >= TIERS[i + 1].min) i++; return i; };
const tierOf = p => TIERS[tierIdx(p)];
const TIER_REWARD = [
  { tokens: 100, orundum: 50 }, { tokens: 150, orundum: 100 }, { tokens: 220, orundum: 150 }, { tokens: 300, orundum: 220 },
  { tokens: 400, orundum: 300, permit: 1 }, { tokens: 500, orundum: 400, permit: 1 }, { tokens: 650, orundum: 500, permit: 2 }, { tokens: 800, orundum: 650, permit: 3 },
];
// the server's 3,000 Trainers. There were 1,500 until the Johto-to-Unova update: the newer ones (1,500 and up) fall in between them by
// strength (ladderQ), so a save's Trainers keep their names, strength, personalities and Clubs (ladderGrow, guildGrow)
const LADDER_N = 3000, LADDER_OLD = 1500, LADDER_START = 1000, TICKETS_MAX = 10, TICKET_MS = 30 * 60000, REFRESH_MS = 3 * 60000;
const WEEK_MS = 7 * 864e5, WEEK0 = Date.UTC(2024, 0, 1); // weeks start Monday 00:00 UTC
const weekId = () => Math.floor((Date.now() - WEEK0) / WEEK_MS);
// Trainer strength q (0..1) <-> ladder rating: most Trainers sit low, a few maxed-out ones at the very top
const qRating = q => 900 + 2450 * Math.pow(q, 2.3);
const ratingQ = r => clamp(Math.pow(clamp((r - 900) / 2450, 0, 1), 1 / 2.3), .02, 1);
// player names are built from Kanto words, Pokémon and Trainer-ish handles
const DOC_W1 = ["Pallet", "Viridian", "Pewter", "Cerulean", "Vermilion", "Lavender", "Celadon", "Fuchsia", "Saffron", "Cinnabar", "Indigo", "Kanto", "Pika", "Bulba",
  "Char", "Squirtle", "Eevee", "Snorlax", "Gengar", "Dragonite", "Mew", "Psyduck", "Magikarp", "Zubat", "Onix", "Lapras", "Jiggly", "Clefairy", "Meowth", "Silph", "Safari", "Moon"];
const DOC_W2 = ["Trainer", "Master", "Fan", "Ace", "Kid", "Hunter", "Champ", "Rival", "Breeder", "Ranger", "Lover", "Main", "Enjoyer", "Collector", "Tamer", "Keeper",
  "Scout", "Rookie", "Veteran", "Hero", "Nerd", "Catcher", "Dex", "Battler", "Camper", "Dreamer", "Captain", "Wanderer"];
// what simulated Trainers look like: every character in the owner's resources/player sprites, and nothing else (their front
// pictures, cut by tools/pack_backs.py). You and the Demo are Red or Leaf for now (AVATARS in a9a_screens.js).
const DOC_SPR = ["red", "leaf", "ashkanto", "ashhoenn", "ashsinnoh", "ashunova", "brendan", "brendanoras", "may", "mayoras", "ethan", "kris", "lyra",
  "lucas", "dawn", "nate", "n", "calem", "serena", "elio"];

// ---------- Pokémon value for team building (cached) ----------
const META = {};
const topStats = k => opStats(k, progForLV(k, 100), false).st;
function metaScore(k) {
  if (META[k] != null) return META[k];
  const op = OPS[k];
  let v = cpOf(topStats(k), [MAX_SK, MAX_SK, MAX_SK]);
  if (isMedicK(k)) v *= 1.12;
  if (isAoeK(k)) v *= 1.06;
  return META[k] = v * (1 + .03 * op.types.length) * abDrag(k);
}
// what its best Ability does to that: Truant (it loafs every other turn), Slow Start (half Attack and Speed for its first five
// turns) and Defeatist (half its attacks below half HP) hold a Pokémon back, so Slaking and Regigigas aren't the stars their
// stats say; Huge Power and Pure Power double its Attack (Azumarill, Medicham). The best one it can have counts
const AB_DRAG = { TRUANT: .55, KLUTZ: .95, STALL: .95, HUGE: 1.3 };   // (Slow Start and Defeatist aren't drawbacks any more: the owner's rules)
const abDrag = k => Math.max(...OPS[k].abs.map(a => AB_DRAG[abilityOf(a.k).id] || 1));
const isMedicK = k => OPS[k].cls === "Supporter" || OPS[k].skills.some(s => s.target === "ally_single" || s.target === "partners" || s.target === "team" && (s.M.hl || /recover|softboiled/.test(s.M.sp || "")));
const isAoeK = k => OPS[k].skills.some(s => s.target === "aoe_enemies" && s.pow > 0);
const isTankK = k => OPS[k].cls === "Defender";
// how far a Pokémon's training is from fully maxed (level, IVs, Mastery), 0..1
const investOf = (k, prog) => cpOf(opStats(k, prog, false).st, prog.sk) / Math.max(1, cpOf(topStats(k), [MAX_SK, MAX_SK, MAX_SK]));
const withLeader = ids => ids;   // Pokémon teams have no leader slot
// pick n Pokémon from `pool` the way a Trainer of strength q would: strong players build balanced teams
// (L: the PvP limits to keep, for a Trainer's Registered Team; a pick that would break them is passed over)
function buildSquad(pool, n, q, rng, avoid = [], L = null, first = []) {
  const left = pool.filter(k => !avoid.includes(k));
  const out = [];
  for (const k of first) if (left.includes(k) && (!L || pvpFits(out, k, L))) { out.push(k); left.splice(left.indexOf(k), 1); }   // (their starter goes along)
  const val = k => metaScore(k) * (.75 + .5 * rng());
  while (out.length < n && left.length) {
    let cand;
    if (rng() > .25 + q * .75) cand = left[Math.floor(rng() * left.length)];
    else {
      const needHeal = !out.some(isMedicK) && q > .2, needTank = !out.some(isTankK) && q > .5, needAoe = !out.some(isAoeK) && q > .4;
      // strong players also avoid stacking one type
      const dupType = k => out.filter(x => OPS[x].types[0] === OPS[k].types[0]).length;
      const sc = k => val(k) * (needHeal && isMedicK(k) ? 1.5 : 1) * (needTank && isTankK(k) ? 1.25 : 1) * (needAoe && isAoeK(k) ? 1.15 : 1)
        * (isMedicK(k) && out.some(isMedicK) ? .55 : 1) * (q > .5 ? Math.pow(.75, dupType(k)) : 1);
      cand = left.slice().sort((a, b) => sc(b) - sc(a))[0];
    }
    left.splice(left.indexOf(cand), 1);
    if (!L || pvpFits(out, cand, L)) out.push(cand);   // (one Legendary too many stays in the box)
  }
  return out;
}

// ---------- a simulated Trainer ----------
// deterministic from the ladder seed and the Trainer's index; q decides team size, rarity, training and AI
const DOC_CACHE = new Map();
// ---------- Trainer names (the owner's ask, 2026-10-15: every Pokémon, every region's towns and routes, every trainer class,
// lowercase, underscores, short nicknames and personality names, well over a thousand pieces; trainerHandle in a6b_ladder.js)
// every region's towns, cities and landmarks, as a handle writes them (no spaces or apostrophes)
const NAME_PLACES = [
  "Pallet", "Viridian", "Pewter", "Cerulean", "Vermilion", "Lavender", "Celadon", "Fuchsia", "Saffron", "Cinnabar", "Indigo", "MtMoon", "RockTunnel", "Seafoam",
  "Safari", "VictoryRoad", "DiglettsCave", "PowerPlant", "CeruleanCave", "ViridianForest", "Silph", "Sevii", "OneIsland", "FourIsland", "SevenIsland", "Tanoby",
  "NewBark", "Cherrygrove", "Violet", "Azalea", "Goldenrod", "Ecruteak", "Olivine", "Cianwood", "Mahogany", "Blackthorn", "SproutTower", "UnionCave",
  "SlowpokeWell", "IlexForest", "NationalPark", "BurnedTower", "TinTower", "BellTower", "WhirlIslands", "MtMortar", "IcePath", "DragonsDen", "MtSilver", "LakeOfRage",
  "Littleroot", "Oldale", "Petalburg", "Rustboro", "Dewford", "Slateport", "Mauville", "Verdanturf", "Fallarbor", "Lavaridge", "Fortree", "Lilycove", "Mossdeep",
  "Sootopolis", "Pacifidlog", "EverGrande", "PetalburgWoods", "GraniteCave", "FieryPath", "MtChimney", "MeteorFalls", "ShoalCave", "SeafloorCavern", "SkyPillar",
  "MtPyre", "NewMauville", "BattleFrontier", "Twinleaf", "Sandgem", "Jubilife", "Oreburgh", "Floaroma", "Eterna", "Hearthome", "Solaceon", "Veilstone", "Pastoria",
  "Celestic", "Canalave", "Snowpoint", "Sunyshore", "SurvivalArea", "ResortArea", "FightArea", "OreburghMine", "EternaForest", "MtCoronet", "GreatMarsh",
  "OldChateau", "IronIsland", "LakeAcuity", "LakeValor", "LakeVerity", "StarkMountain", "SpearPillar", "Nuvema", "Accumula", "Striaton", "Nacrene", "Castelia",
  "Nimbasa", "Driftveil", "Mistralton", "Icirrus", "Opelucid", "Lacunosa", "Undella", "BlackCity", "WhiteForest", "Aspertia", "Floccesy", "Virbank", "Lentimas",
  "Humilau", "Anville", "Dreamyard", "PinwheelForest", "ChargestoneCave", "TwistMountain", "DragonspiralTower", "GiantChasm", "RelicCastle", "Vaniville",
  "Aquacorde", "Santalune", "Lumiose", "Camphrier", "Ambrette", "Cyllage", "Geosenge", "Shalour", "Coumarine", "Laverre", "Dendemille", "Anistar", "Couriway",
  "Snowbelle", "Kiloude", "PrismTower", "LostHotel", "FrostCavern", "TerminusCave", "ParfumPalace", "GlitteringCave", "ReflectionCave", "Iki", "Hauoli", "Heahea",
  "Paniola", "Konikoni", "Malie", "PoTown", "Seafolk", "TapuVillage", "Melemele", "Akala", "UlaUla", "Poni", "WelaVolcano", "LushJungle", "PoniCanyon",
  "Lanakila", "AetherParadise", "Hokulani", "Postwick", "Wedgehurst", "Motostoke", "Turffield", "Hulbury", "Hammerlocke", "StowOnSide", "Ballonlea", "Circhester",
  "Spikemuth", "Wyndon", "WildArea", "GlimwoodTangle", "SlumberingWeald", "IsleOfArmor", "CrownTundra", "Freezington", "Obsidian", "Crimson", "Cobalt", "Coronet",
  "Alabaster", "JubilifeVillage", "CaboPoco", "Mesagoza", "Cortondo", "Artazon", "Levincia", "Cascarrafa", "PortoMarinada", "Medali", "Montenevera",
  "Alfornada", "Zapapico", "LosPlatos", "AreaZero", "GlasebergPeak", "CasseroyaLake", "Kitakami", "Mossui", "Blueberry", "Terarium", "Pyrite", "Phenac", "Agate",
  "Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Hisui", "Paldea", "Orre",
];
// every generation's trainer classes
const NAME_CLASSES = [
  "Youngster", "Lass", "BugCatcher", "Hiker", "Camper", "Picnicker", "Sailor", "Fisherman", "Swimmer", "BirdKeeper", "BlackBelt", "Psychic", "Juggler", "Tamer",
  "Beauty", "Biker", "Burglar", "Rocker", "Gentleman", "Scientist", "SuperNerd", "Engineer", "Gambler", "CueBall", "Channeler", "CoolTrainer", "AceTrainer",
  "PokeManiac", "Pokefan", "Medium", "Sage", "KimonoGirl", "Schoolboy", "Schoolgirl", "Teacher", "Officer", "Firebreather", "Skier", "Boarder", "Twins",
  "RuinManiac", "Kindler", "AromaLady", "BattleGirl", "NinjaBoy", "HexManiac", "ParasolLady", "Triathlete", "Expert", "Collector", "Guitarist", "DragonTamer",
  "Breeder", "Ranger", "RichBoy", "Lady", "Tuber", "BugManiac", "Idol", "Artist", "Socialite", "Cyclist", "Backpacker", "Clown", "Waiter", "Waitress", "Worker",
  "Veteran", "Policeman", "Jogger", "Rancher", "Cameraman", "Reporter", "Detective", "Baker", "Doctor", "Nurse", "Pilot", "Preschooler", "Musician", "Dancer",
  "Harlequin", "Janitor", "Linebacker", "Roughneck", "Schoolkid", "Smasher", "Striker", "Hoopster", "Infielder", "FurisodeGirl", "RisingStar", "PunkGuy",
  "PunkGirl", "Tourist", "FairyTaleGirl", "Garcon", "Chef", "Maid", "Butler", "Golfer", "OfficeWorker", "Surfer", "Captain", "TrialGuide", "Kahuna", "GymTrainer",
  "LeagueStaff", "Model", "Madame", "Postman", "CafeMaster", "Delinquent", "Student", "StarGrunt", "Warden", "Survey", "Pokeathlete", "Astronomer", "Fossilmaniac",
  "Archaeologist", "Diver", "Lifeguard", "Mountaineer", "Explorer", "Cowgirl", "Cowboy", "Ninja", "Samurai", "Monk", "Knight", "Interviewer", "Sightseer",
  "Ruffian", "Pokekid", "BeautyQueen", "Fairy", "BattleGirl", "Wrestler", "Pugilist", "Boxer", "Pitcher", "Catcher", "Archer", "Climber", "Hunter", "Trapper",
  "Herder", "Farmer", "Gardener", "Florist", "Lumberjack", "Miner", "Driller", "Welder", "Mechanic", "Courier", "Bard", "Painter", "Poet", "Sculptor",
];
// short nicknames
const NAME_NICKS = [
  "Kai", "Mia", "Leo", "Zoe", "Max", "Ava", "Eli", "Ivy", "Jay", "Kim", "Lou", "Mo", "Ned", "Pip", "Rae", "Sam", "Tess", "Uma", "Vic", "Wes", "Xan", "Yui", "Zed",
  "Bo", "Cal", "Dee", "Eve", "Fin", "Gus", "Hal", "Ira", "Jo", "Kit", "Lux", "Mac", "Nia", "Oli", "Pat", "Quin", "Rio", "Sky", "Tia", "Val", "Wyn", "Yas", "Zia",
  "Abby", "Ben", "Cass", "Dex", "Ellie", "Finn", "Gigi", "Hana", "Isa", "Jules", "Kenji", "Lena", "Milo", "Nico", "Otto", "Pia", "Ravi", "Suki", "Theo", "Ulla",
  "Vera", "Wren", "Yuki", "Zara", "Ari", "Bex", "Cleo", "Dani", "Emi", "Fox", "Gil", "Hugo", "Iris", "Jojo", "Kiki", "Lulu", "Momo", "Nell", "Odie", "Poppy",
  "Remy", "Sol", "Toby", "Ume", "Vivi", "Willa", "Yoyo", "Zuzu", "Aki", "Ben", "Coco", "Desi", "Ezra", "Faye", "Gemma", "Haru", "Indy", "Jun", "Kaya", "Liam",
  "Mika", "Noor", "Omar", "Priya", "Rin", "Sora", "Taro", "Ugo", "Vlad", "Yara", "Zane", "Ace", "Bea", "Chip", "Duke", "Echo", "Flo", "Goose", "Honey", "Jinx",
  "Koko", "Lucky", "Mango", "Nugget", "Olive", "Peanut", "Rusty", "Sunny", "Tofu", "Waffle", "Biscuit", "Muffin", "Noodle", "Pickle", "Bean", "Mochi", "Taco",
  "Pudding", "Pixel", "Sparky", "Bubbles", "Button", "Cookie", "Dumpling", "Ginger", "Jelly", "Maple", "Nacho", "Pepper", "Ziggy", "Sprout", "Pebble", "Bramble",
  "Clover", "Ember", "Frost", "Nova", "Onyx", "Raven", "Storm", "Sage", "Juniper", "Cedar", "Rowan", "Hazel", "Aspen", "Willow", "Basil", "Fern",
];
// words that go with each personality family
const NAME_FAMILY = {
  veteran: ["OG", "Vet", "Elder", "Oldschool", "Legacy", "Retro", "DayOne", "Classic"], newbie: ["Rookie", "Newb", "Fresh", "Noob", "Starter", "FirstTimer", "Lil", "Baby"],
  whale: ["Whale", "Rich", "Gems", "Deluxe", "Platinum", "Gold", "Big", "Premium"], f2p: ["F2P", "Free", "Budget", "Thrifty", "NoSpend", "Frugal", "Grindy", "Saver"],
  collector: ["Collector", "Dex", "Hoarder", "Shiny", "Complete", "AllOf", "Gotta", "Catcher"], lore: ["Lore", "Myth", "Legend", "Ancient", "Fable", "Rune", "Saga", "Tome"],
  memer: ["Meme", "Lol", "Bruh", "Yeet", "Derp", "Goofy", "Chaos", "Silly"], tryhard: ["Sweat", "Meta", "Tryhard", "Clutch", "Ranked", "Competitive", "Pro", "Elite"],
  casual: ["Chill", "Casual", "Comfy", "Cozy", "Lazy", "Easy", "Mellow", "Breezy"], mentor: ["Coach", "Sensei", "Prof", "Tutor", "Guide", "Mentor", "Teach", "Wise"],
  salty: ["Salty", "Tilted", "Grumpy", "Mad", "Rage", "Cranky", "Sour", "Annoyed"], lurker: ["Lurk", "Quiet", "Ghost", "Silent", "Hidden", "Shadow", "Afk", "Watcher"],
  hypebeast: ["Hype", "Lit", "Fire", "Turbo", "Mega", "Ultra", "Hyper", "Max"], roleplayer: ["Sir", "Lady", "Knight", "Lord", "Bard", "Squire", "Dame", "Baron"],
  recruiter: ["Recruit", "Club", "Squad", "Team", "Crew", "Guild", "Join", "Captain"], shy: ["Shy", "Soft", "Timid", "Quiet", "Gentle", "Bashful", "Meek", "Little"],
  specialist: ["Mono", "Only", "Pure", "Typed", "OneType", "Devoted", "True", "Loyal"], challenger: ["Nuzlocke", "Challenge", "Hardcore", "Solo", "NoItems", "Ironman", "Monotype", "Locke"],
  gossip: ["Tea", "Gossip", "Drama", "Spill", "Rumor", "News", "Chatty", "Buzz"], creative: ["Art", "Doodle", "Sketch", "Pixel", "Paint", "Craft", "Color", "Muse"],
  scientist: ["Calc", "Lab", "Data", "Stats", "Math", "Theory", "Graph", "Research"], foodie: ["Snack", "Berry", "Ramen", "Sushi", "Curry", "Cake", "Tea", "Toast"],
  student: ["Study", "Class", "Homework", "Exam", "Campus", "Freshman", "Notes", "Quiz"], worker: ["Shift", "NineToFive", "Office", "Overtime", "Commute", "Lunch", "Weekday", "Desk"],
  traveler: ["Roam", "Trek", "Wander", "Voyage", "Nomad", "Journey", "Trail", "Passport"], wholesome: ["Kind", "Sunny", "Happy", "Sweet", "Cheer", "Smile", "Hug", "Bright"],
  philosopher: ["Deep", "Think", "Zen", "Ponder", "Muse", "Sage", "Wonder", "Dream"], gambler: ["Lucky", "Coin", "Slots", "Jackpot", "Dice", "Roll", "Bet", "Spin"],
  achiever: ["Grind", "Medal", "Complete", "Trophy", "Goal", "Badge", "Perfect", "Streak"], rival: ["Rival", "Versus", "Beatyou", "Nemesis", "Challenger", "Smug", "Better", "Faster"],
  caretaker: ["Nurse", "Daycare", "Carer", "Heal", "Gentle", "Keeper", "Tender", "Cuddle"], superstitious: ["Lucky", "Charm", "Omen", "Hex", "Jinx", "Fortune", "Clover", "Ritual"],
};
// endings
const NAME_SUFFIX = ["Fan", "Main", "Enjoyer", "Lover", "Stan", "Gamer", "Plays", "TV", "Live", "Jr", "Pro", "King", "Queen", "Kid", "Ace", "Hero", "Champ", "Master",
  "Rival", "Buddy", "Pal", "Fanatic", "Nerd", "Geek", "Head", "Bro", "Sis", "Squad", "Club", "Crew", "Fam", "Life", "Mode", "Time", "Zone", "Land", "World", "Dex",
  "Ball", "Run", "Rush", "Dash", "Spark", "Storm", "Blaze", "Wave", "Bolt", "Frost", "Shade", "Star", "Moon", "Sun", "Trainer", "Tamer", "Keeper", "Scout", "Rookie"];
// every Pokémon (all 1,025, as a handle writes them: "MrMime", "Farfetchd", "Flabebe"), every route (Kanto and Johto's 1 to 46,
// Hoenn's 101 to 134, Sinnoh's 201 to 230), and the words in the personalities' titles ("WeatherWizard", "RaidCaptain")
const NAME_PARTS = () => NAME_PARTS.v || (NAME_PARTS.v = (() => {
  const clean = w => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]/g, "");
  const seen = new Set(), mon = [];
  for (const d of DEX) if (d.id <= 1025 && !seen.has(d.id)) { seen.add(d.id); const w = clean(d.n.replace(/♀|♂/g, "")); if (w) mon.push(w); }
  const route = [];
  for (const [a, b] of [[1, 46], [101, 134], [201, 230]]) for (let n = a; n <= b; n++) route.push("Route" + n);
  const STOP = new Set(["the", "of", "a", "an", "and", "in", "on", "to", "for", "with", "at", "by"]);
  const title = {}; for (const P of (typeof PERSONAS !== "undefined" ? PERSONAS : [])) title[P.id] = P.n.split(/[\s-]+/).map(clean).filter(w => w && !STOP.has(w.toLowerCase()) && !/^\d+$/.test(w));
  const uniq = a => [...new Set(a)];
  return { mon, route, place: uniq(NAME_PLACES), cls: uniq(NAME_CLASSES), nick: uniq(NAME_NICKS), suffix: uniq(NAME_SUFFIX), title };
})());
// a Trainer's handle (the owner's rule: as varied as real players'): one of a dozen shapes, from a Pokémon, a place or route, a
// trainer class, a nickname, an ending, and the Trainer's own personality (its family's words and its title), written CamelCase,
// all lowercase, with underscores or Capital_Underscores, often with a number; 16 letters at most
function trainerHandle(rng, ctx = {}) {
  const P = NAME_PARTS(), pick = a => a[Math.floor(rng() * a.length)];
  const fam = ctx.fam && NAME_FAMILY[ctx.fam] || null, title = ctx.persona && P.title[ctx.persona.id] || null;
  const SHAPES = [
    [12, () => [pick(P.mon)]], [10, () => [pick(P.mon), pick(P.cls)]], [7, () => [pick(P.place), pick(P.mon)]], [6, () => [pick(P.place), pick(P.cls)]],
    [5, () => [pick(P.route), pick(rng() < .5 ? P.cls : P.mon)]], [10, () => [pick(P.nick)]], [7, () => [pick(P.nick), pick(P.mon)]],
    [6, () => [pick(P.cls), pick(P.nick)]], [7, () => [pick(P.mon), pick(P.suffix)]], [4, () => [pick(P.place), pick(P.suffix)]],
    [fam ? 10 : 0, () => [pick(fam), pick(rng() < .5 ? P.mon : P.nick)]], [fam ? 4 : 0, () => [pick(P.nick), pick(fam)]],
    [title && title.length ? 6 : 0, () => title.length > 1 ? title.slice(-2) : [title[0], pick(P.mon)]],
  ];
  for (let tries = 0; ; tries++) {
    let r = rng() * SHAPES.reduce((a, s) => a + s[0], 0), shape = SHAPES[0];
    for (const s of SHAPES) { r -= s[0]; if (r < 0) { shape = s; break; } }
    let parts = shape[1]();
    if (rng() < .08) parts = ["The", ...parts];
    const st = rng(), word = w => w.charAt(0).toUpperCase() + w.slice(1);
    let n = st < .38 ? parts.map(word).join("") : st < .62 ? parts.join("").toLowerCase() : st < .82 ? parts.join("_").toLowerCase() : parts.map(word).join("_");
    const nr = rng();
    if (nr < .25) n += Math.floor(rng() * 99 + 1); else if (nr < .33) n += String(Math.floor(rng() * 100)).padStart(2, "0"); else if (nr < .4) n += Math.floor(100 + rng() * 900);
    if (n.length <= 16 || tries > 8) return n.slice(0, 16);
  }
}
// a Trainer's name. Its account's dice are drawn just as they always were (so the team they roll next stays the same), and the name
// itself comes from a roll of its own on what they drew
const legacyNameDraws = rng => (rng() < .2 ? "The" : "") + DOC_W1[Math.floor(rng() * DOC_W1.length)] + (rng() < .6 ? DOC_W2[Math.floor(rng() * DOC_W2.length)] : "") + (rng() < .55 ? Math.floor(rng() * 99 + 1) : "");
const docName = rng => trainerHandle(seeded(hash("name:" + legacyNameDraws(rng))));
const docSpr = key => DOC_SPR[Math.floor(seeded(hash(key + ":spr"))() * DOC_SPR.length)];
// every Trainer's name on a ladder, all different: each keeps its first roll unless a Trainer before it (or you) already has
// that name, then it rolls again. A name can come from their own personality (its family and title: personaFor)
let NAME_TABLE = null;
function ladderName(seed, i) {
  const me = ((S && S.name) || "").toLowerCase();
  if (!NAME_TABLE || NAME_TABLE.seed !== seed || NAME_TABLE.me !== me) {
    const taken = new Set(me ? [me] : []), names = [];
    for (let j = 0; j < LADDER_N; j++) {
      const fam = archPick(ladderQ(j), seeded(hash("persona" + seed + ":" + j)), seed + ":" + j).id;
      const ctx = { fam, persona: typeof personaFor === "function" && S && S.ladder && S.ladder.seed === seed ? personaFor(j, fam) : null }, rng = seeded(hash("handle:" + seed + ":" + j));
      let n = trainerHandle(rng, ctx);
      for (let k = 1; taken.has(n.toLowerCase()) && k < 40; k++) n = trainerHandle(rng, ctx);
      if (taken.has(n.toLowerCase())) n += j;
      taken.add(n.toLowerCase()); names.push(n);
    }
    if (NAME_TABLE) DOC_CACHE.clear();
    NAME_TABLE = { seed, me, names };
  }
  return NAME_TABLE.names[i];
}
// tier: the Stadium tier they're shown at (their points in Ranked, the matched rating in Link Battles): Master Ball and up
// build for that tier, so the label and the team always agree (a Trainer whose points drift over a line trains up or down)
// the playstyle of the Trainer npcDoctor is building, from their personality (PERSONAS' ps): pickArchetype in a6g_teams.js runs it
let NPC_PLAYSTYLE = null;
function npcDoctor(seed, i, q, tier) {
  const ad = S && S.ladder && seed === S.ladder.seed && S.ladder.adapt && S.ladder.adapt[i];
  const P = S && S.ladder && seed === S.ladder.seed && i >= 0 && i < LADDER_N ? trainerProg(i) : null;   // (their progress: trainerProg)
  const key = seed + ":" + i, ck = key + (tier != null ? ":t" + tier : "") + (ad ? ":a" + ad.n : "") + (P ? ":p" + Math.floor(P.stages / 12) + ":" + Math.floor(P.best / 3) + ":" + P.gens.size : ":d" + Math.floor(srvDays()));   // (rebuilt as they go: every dozen stages, 3 levels or a new region)
  if (DOC_CACHE.has(ck)) return DOC_CACHE.get(ck);
  const rng = seeded(hash(key));
  const first = docName(rng);   // (the name takes the first draws, so the team that follows stays the same)
  const name = S && S.ladder && seed === S.ladder.seed && i >= 0 && i < LADDER_N ? ladderName(seed, i) : first;
  // (the playstyle they work toward: their personality's, else the one their regions were chosen for, trainerPlan)
  NPC_PLAYSTYLE = S && S.ladder && seed === S.ladder.seed && i >= 0 && i < LADDER_N && typeof personaOf === "function" ? (personaOf(person(i)) || {}).ps || (trainerPlan(i) ? [trainerPlan(i).id] : null) : null;
  let doc;
  try { doc = { i, name, q, spr: docSpr(key), ...npcAccount(rng, q, undefined, tier, P && { ...P, i }) }; } finally { NPC_PLAYSTYLE = null; }
  if (ad) doc = { ...doc, team: counterTeam(doc, ad.vs.filter(k => S.ops[k]).map(k => ({ op: k, prog: S.ops[k], mine: true })), 2), adapted: ad };
  DOC_CACHE.set(ck, doc);
  if (DOC_CACHE.size > 600) DOC_CACHE.delete(DOC_CACHE.keys().next().value);
  return doc;
}
// the meta: the Pokémon top Trainers all end up running (the open regions': yours by default, playerGens)
const META_POOL = {};
const metaPool = (done = playerGens()) => { const G = toGens(done), key = [...G].sort().join(); return META_POOL[key] || (META_POOL[key] = OP_KEYS.filter(k => !OPS[k].evo.length && OPS[k].rar >= 4 && genOk(k, G)).sort((a, b) => metaScore(b) - metaScore(a)).slice(0, 36)); };
function npcAccount(rng, q, size, tier, P) {
  // a ladder Trainer (P: their progress in this world, trainerProg in a6i_servers.js): their Pokémon are at the level their
  // Journey has got them to, from the regions they have open, with the starter they picked; their tier (their points) keeps
  // the levels within its own (the owner's rule: tiers[].levels in the team config). Without P (the viability checks, the
  // Battle Tower): a Trainer of strength q at the tier's levels, every region open
  const shown = tier != null ? tier : qTier(q), band = tierLevels(shown);
  const early = P ? clamp(P.h / 20, .1, 1) : 1;
  const L = P ? (band ? clamp(P.best, band[0], band[1]) : P.best) : band ? clamp(tierLevelOf(q, shown, band) + Math.round((rng() - .5) * 4), band[0], band[1]) : clamp(Math.round(5 + 95 * Math.pow(q, 1.1)), 4, 100);
  const wR = { 3: Math.max(.25, 1 - q * .9), 4: .5 + q * .4, 5: .12 + q * q * 1.3 };
  const done = P ? P.gens : ALL_GENS;   // (the regions open to them: their own Journeys, not yours)
  const pool = fieldable(L, true, done).filter(k => !TEAM_BAN.pokemon.has(k) && fitsBand(k, band)), roster = [];   // (the team config's bans: a6g_teams.js)
  // (8 even on day one: enough for a Link Battle draft; more as they go)
  const want = size || Math.round(Math.max(8, Math.min(8 + q * 22, P ? 6 + P.stages / 5 : 8 + q * 22)));
  // the starter they picked in their first region, grown as far as its level and their open regions allow
  let starter = null;
  if (P) { const st = trainerStarter(P.route[0], P.i), g = st && grownIn(st, L, done); if (g && !TEAM_BAN.pokemon.has(g)) { roster.push(g); starter = g; } }
  // (and any starter a Professor sent them after five losses in a row: trainerRescues)
  if (P) for (const k of trainerRescues(P)) { const g = grownIn(k, L, done); if (g && !roster.includes(g) && !TEAM_BAN.pokemon.has(g)) roster.push(g); }
  for (let t = 0; t < want * 8 && roster.length < want && pool.length; t++) {
    const k = pool[Math.floor(rng() * pool.length)];
    if (!roster.includes(k) && rng() < (wR[OPS[k].rar] || .3) / 1.6) roster.push(k);
  }
  // the best Trainers own most of the meta, and the legendaries
  if (q > .7 && L >= 50) for (const k of metaPool(done)) if (!roster.includes(k) && minLevelOf(k) <= L && fitsBand(k, band) && rng() < (q - .7) / .3 && !TEAM_BAN.pokemon.has(k)) roster.push(k);
  // (a ladder Trainer's Legendaries come with their Journeys: one done is one whose Legendaries they've met)
  if (q > .8 && L >= 65) for (const k of legendsNow(done)) if (!roster.includes(k) && (!P || P.done.includes(regionOf(k))) && rng() < (q - .8) * 2.5 && !TEAM_BAN.pokemon.has(k)) roster.push(k);
  const prog = {};
  for (const k of roster) {
    const lvl = band ? monLevelIn(L, k, band, rng) : clamp(q > .9 && L >= 95 ? 100 : L + Math.round((rng() - .6) * 10), Math.min(100, minLevelOf(k)), 100);
    const p = progForLV(k, lvl);
    p.pot = q > .95 && early >= 1 ? 6 : Math.min(6, 1 + Math.floor(5 * q * q * (.6 + .6 * rng()) * early));   // IVs come with duplicates, over time
    if (q > .9 && L >= 95) p.sk = [MAX_SK, MAX_SK, MAX_SK];
    // what it came with: a nature and one of its regular Abilities, at random (Mints and Ability items change them)
    const regs = regularAbilities(k);
    p.nat = NATURE_KEYS[Math.floor(rng() * NATURE_KEYS.length)];
    p.ab = regs.length ? regs[Math.floor(rng() * regs.length)] : OPS[k].ab;
    prog[k] = p;
  }
  const team = buildSquad(roster, ROSTER, q, rng, [], pvpLimits("ranked"), starter ? [starter] : []);   // (the PvP limits: one Legendary, one Mythical, one Ultra Beast, one Paradox)
  // they play like you do: every Pokémon built by the optimizer out of what they have so far (a6h_build.js; each on its own,
  // team synergy is the top tiers' craft), Expert tactics.
  // Master Ball and up: the tier's levels, Badges, archetypes and (Legend) competitive sets (a6g_teams.js)
  return topTierAccount(npcOptimize({ roster, prog, badges: P ? Math.min(8, Math.max(0, ...Object.values(P.badges))) : badgesAt(L), ai: "expert", team, lvl: L, gens: done }, npcAccess(L, shown), false), q, rng, tier);
}
// the starter a Trainer picks in a region (the owner's rule: they pick one too): the one of their favourite type if there is
// one, else the one their playstyle wants most (its type among the plan's sweepers), else their own pick
function trainerStarter(region, i) {
  const list = regionStarters(region);
  if (i == null) return list[0];
  const ty = trainerType(i), A = trainerPlan(i), tyOf = k => OPS[grownAt(k, 100)] ? OPS[grownAt(k, 100)].types : OPS[k].types;
  const own = list.find(k => tyOf(k).includes(ty)); if (own) return own;
  if (A) { const want = {}; for (const R of A.roles) for (const k of COMP_POOL()) if (R.ok(k)) for (const t of OPS[k].types) want[t] = (want[t] || 0) + R.sc(k);
    const best = list.slice().sort((a, b) => tyOf(b).reduce((s, t) => s + (want[t] || 0), 0) - tyOf(a).reduce((s, t) => s + (want[t] || 0), 0))[0]; if (best) return best; }
  return list[hash("starter:" + i + region) % list.length];
}
// the Professor's help for a Trainer (journeyLoss in a9c_meta.js, the owner's rule: a region's first lost Journey battle brings a free
// starter of that region). Trainers try every battle too, but their Journeys are worked out from the clock rather than battled, so
// whether they lost one in a region is their own fixed chance: about three in four where their starter is weak against the first
// Gym (Charmander against Brock: they lose there), two in five otherwise (at one of the region's first big battles), more for the
// slower Trainers. Their pick: one of the other two of their favourite type, else either. { k, at: the stage's place in the
// region's main stages, nd } or null
const TRAINER_LOSS = new Map();
function trainerLoss(i, region) {
  const key = i + ":" + region; if (TRAINER_LOSS.has(key)) return TRAINER_LOSS.get(key);
  let out = null;
  if (journeyOf(region)) {
    const st = trainerStarter(region, i), gt = gymTypesOf(region)[0], tys = OPS[st].types, r = seeded(hash("rescue:" + i + ":" + region));
    const weak = !!gt && (typeEff(gt, tys) > 1 || Math.max(...tys.map(t => typeEff(t, [gt]))) < 1);
    if (r() < Math.min(.95, (weak ? .75 : .4) + (regionHours(i) >= 3.5 ? .15 : 0))) {
      const M = journeyMain(region), gym = M.find(nd => nd.id === chapter1End(region)) || M[0], caps = M.filter(x => isCapBattle(x) && x.trainer);
      const nd = weak ? gym : caps[Math.floor(r() * Math.min(4, caps.length))] || gym, others = regionStarters(region).filter(k => k !== st), ty = trainerType(i);
      out = { nd, at: M.indexOf(nd), k: others.find(k => OPS[grownAt(k, 100)].types.includes(ty)) || others[hash("rescuepick:" + i + region) % others.length] };
      // (a second loss later in the region, for about half of those who lost one: the last starter, the Professor's second gift)
      const later = caps.filter(x => M.indexOf(x) > out.at), nd2 = later[Math.floor(r() * Math.min(4, later.length))];
      if (nd2 && r() < (weak ? .6 : .4) + (regionHours(i) >= 3.5 ? .1 : 0)) Object.assign(out, { nd2, at2: M.indexOf(nd2), k2: others.find(k => k !== out.k) });
    }
  }
  TRAINER_LOSS.set(key, out);
  return out;
}
// the ones a Trainer has by now (P: trainerProg with their i): each region they've finished, or are past that battle in
const trainerRescues = P => P.route.map(id => [id, trainerLoss(P.i, id)]).filter(([id, L]) => L && (P.done.includes(id) || id === P.region && P.stage > L.at))
  .flatMap(([id, L]) => L.k2 && (P.done.includes(id) || P.stage > L.at2) ? [L.k, L.k2] : [L.k]);
// a Pokémon at this level, evolved as far as its level and the regions open allow (the owner's rule: an evolution into a region
// not open yet waits, no Blissey from Chansey with only Kanto open)
function grownIn(k, lv, gens) {
  for (let n = 0; n < 3; n++) { const c = (OPS[k].evo || []).filter(e => lv >= (e.lv || EVO_ITEM_LV) && OPS[e.to] && genOk(e.to, gens)); if (!c.length) break; k = c[lv % c.length].to; }
  return k;
}
// the Gym Badges of a Trainer whose Pokémon are this level: every Gym Leader below it. They work like yours (+5% to one
// stat each), and they're the only bonus a simulated Trainer's Pokémon get
let GYM_LVS = null;
const badgesAt = L => (GYM_LVS = GYM_LVS || Object.values(NODES).filter(n => n.badgeWin != null).map(n => n.lv)).filter(lv => lv < L).length;
// battle spec for one of a Trainer's Pokémon (their own Badges, never the player's). npc: a Trainer's (their Follow Me users never
// switch out by choice); backup: their plan's backup setter (it waits on the bench while the team's field is up: the owner's rules)
const npcSpec = (doc, k) => ({ op: k, prog: doc.prog[k], mine: false, badges: doc.badges || 0, npc: true, backup: !!(doc.arch && doc.roles && docRole(doc, k).kind === "backup") });
const npcPower = doc => doc.team.reduce((a, k) => a + Math.round(cpOf(opStats(k, doc.prog[k], false, doc.badges || 0).st, doc.prog[k].sk)), 0);
const docTitle = doc => esc(doc.name);

// ---------- Ranked Battles ladder ----------
// a server's Trainers: the same for every account on that server (its seed), rated as far as the server has got (a6i_servers.js)
function ladderInit(server = 1) {
  const seed = hash("server:" + server), rng = seeded(seed);
  const pop = [];
  for (let i = 0; i < LADDER_N; i++) pop.push(ladderRoll(i, rng));   // (a new world: everyone starts at the same points)
  return { seed, pts: LADDER_START, best: LADDER_START, tickets: TICKETS_MAX, tTime: Date.now(), popT: Date.now(), defT: Date.now(), week: weekId(),
    pop, opps: null, oppT: 0, log: [], seen: 0, wins: 0, losses: 0, rev: {} };
}
// a Trainer's strength (0 to 1): the first 1,500 by their number, the rest in between them
// ladder Trainer i's own progress (their Pokémon's level in their tier) and whether they've finished their Kanto Journey
// (trainerProg in a6i_servers.js: their own Journeys; trainerDone: they've been Champion somewhere; trainerGens: their open regions)
const trainerLv = i => S && S.ladder ? trainerProg(i).best : 100;
const trainerDone = i => !!(S && S.ladder) && trainerProg(i).champs > 0;
const trainerKanto = trainerDone;
const trainerGens = i => S && S.ladder ? trainerProg(i).gens : ALL_GENS;
const ladderQ = i => i < LADDER_OLD ? (i + .5) / LADDER_OLD : (i - LADDER_OLD + 1) / LADDER_OLD - 1e-4;
// the Trainer nearest a strength
const ladderAt = q => clamp(Math.round(q * LADDER_OLD - .5), 0, LADDER_OLD - 1);
function ladderRoll(i, rng) { return Math.round(LADDER_START + (rng() - .5) * 40); }
// a save from the 1,500 days: the newer Trainers' ratings join its ladder
function ladderGrow(L) {
  if (!L || !Array.isArray(L.pop) || L.pop.length >= LADDER_N) return;
  const rng = seeded(hash("grow:" + L.seed));
  for (let i = L.pop.length; i < LADDER_N; i++) L.pop.push(ladderRoll(i, rng));
}
const ladderDoc = i => npcDoctor(S.ladder.seed, i, ladderQ(i), tierIdx(S.ladder.pop[i] != null ? S.ladder.pop[i] : trainerTarget(i)));
const ladderRank = () => 1 + S.ladder.pop.filter(p => p > S.ladder.pts).length;
const eloK = p => p < 1600 ? 48 : p < 2500 ? 36 : 28;
const winChance = (me, them) => 1 / (1 + Math.pow(10, (them - me) / 400));
function eloDelta(me, them, win, k) {
  const e = winChance(me, them);
  if (win) return Math.max(4, Math.round(k * (1 - e)));
  return -Math.max(2, Math.round(k * e * (me < TIERS[1].min ? .5 : 1)));
}
function ladderOpps(force) {
  const L = S.ladder, P = L.pts;
  if (L.opps && !force) return L.opps;
  const bands = [[P - 140, P - 10], [P - 10, P + 110], [P + 110, P + 280]], used = new Set();
  L.opps = bands.map(([lo, hi]) => {
    for (let wide = 0; wide < 6; wide++) {
      const c = L.pop.map((p, i) => [p, i]).filter(([p, i]) => p >= lo - wide * 80 && p <= hi + wide * 80 && !used.has(i));
      if (c.length) { const [, i] = c[Math.floor(Math.random() * c.length)]; used.add(i); return i; }
    }
    return Math.floor(Math.random() * LADDER_N);
  });
  L.oppT = Date.now();
  return L.opps;
}
// the population keeps battling while you're away: ratings drift toward where each Trainer's own progress puts them (trainerTarget)
function ladderDrift(L, hours) {
  if (hours <= 0) return;
  const pull = Math.min(1, .25 * hours), sd = 10 * Math.sqrt(Math.min(hours, 48)), rng = seeded(hash(L.seed + ":" + Math.floor(Date.now() / 60000)));
  for (let i = 0; i < L.pop.length; i++) {
    const r = trainerTarget(i);
    L.pop[i] = Math.max(0, Math.round(L.pop[i] + (r - L.pop[i]) * pull + (rng() + rng() - 1) * sd));
  }
}
// your Registered Team as the other side of a battle (your Badge bonuses apply)
const defenseSpecs = () => pvpTrim((S.team.defense || []).filter(owned), pvpLimits("ranked")).map(k => ({ op: k, prog: S.ops[k], mine: true }));   // (the PvP limits)
// other Trainers battle your Registered Team while you're away (higher tiers get challenged more often)
function ladderDefense(L, hours) {
  const def = defenseSpecs();
  if (!def.length || hours <= 0) return 0;
  const rate = .4 + .45 * tierIdx(L.pts);
  let n = Math.min(12, Math.floor(hours * rate + Math.random()));
  let done = 0;
  while (n-- > 0) {
    const band = L.pop.map((p, i) => [p, i]).filter(([p]) => Math.abs(p - L.pts) < 160);
    if (!band.length) break;
    const [ap, i] = band[Math.floor(Math.random() * band.length)], doc0 = ladderDoc(i), doc = { ...doc0, team: counterTeam(doc0, def, doc0.arch ? 2 : 3) };
    const B = makeBattle({ allies: npcLeads(doc, def), waves: [def], auto: true, aiStyle: "aggressive", enemyStyle: "aggressive", sim: true });
    let g = 0; while (!B.over && g++ < 3000) { const r = B.step(); if (r === "input") B.autoAct(); B.ev.length = 0; }
    const held = !(B.result && B.result.win);
    const d = Math.round(eloDelta(L.pts, ap, held, eloK(L.pts)) * .6);
    L.pts = Math.max(0, L.pts + d); L.pop[i] = Math.max(0, L.pop[i] - d);
    L.log.unshift({ t: Date.now(), i, held, d, team: doc.team.slice() });
    if (held) { S.stats.defWins = (S.stats.defWins || 0) + 1; noteLoss(i, def.map(s => s.op)); }
    done++;
  }
  L.log = L.log.slice(0, 30);
  return done;
}
// the tier rewards (the owner's rule, 2026-10-15: every day, not every week): by Mail at 00:00 UTC, for the tier you're in; the days
// the game wasn't open are paid when you're back, a week of them at most (PAY_DAYS)
const DAY0 = Date.UTC(2024, 0, 1), stadiumDay = () => Math.floor((Date.now() - DAY0) / 864e5), PAY_DAYS = 7;
function dailyPay(L, label) {
  const d = stadiumDay();
  if (L.day === d) return null;
  const gap = L.day == null ? 1 : d - L.day, n = clamp(gap, 1, PAY_DAYS), tier = tierIdx(L.pts);
  L.day = d;
  return { label, tier, n, gap, rewards: Object.fromEntries(Object.entries(TIER_REWARD[tier]).map(([k, v]) => [k, v * n])) };
}
// called from tickTimers: tickets, population drift, Registered Team battles, daily rewards
function ladderTick(now) {
  const L = S.ladder;
  const tmax = ticketsMax();
  if (L.tickets >= tmax) L.tTime = now;
  else { const n = Math.floor((now - L.tTime) / TICKET_MS); if (n > 0) { L.tickets = Math.min(tmax, L.tickets + n); L.tTime += n * TICKET_MS; if (L.tickets >= tmax) L.tTime = now; } }
  const h = (now - L.popT) / 3600000;
  if (h >= .25) { ladderDrift(L, h); L.popT = now; }
  const dh = (now - L.defT) / 3600000;
  if (dh >= .5 && !BT.on) { if (ladderDefense(L, dh)) L.best = Math.max(L.best, L.pts); L.defT = now; }
  const pays = [dailyPay(L, "Ranked Battles"), dailyPay(S.rta, "Link Battles")].filter(Boolean);
  for (const p of pays) sendMail({ from: "Battle Stadium", tag: "rank", title: `Daily rewards · ${p.label}`, body: p.n > 1 ? `You're in the ${TIERS[p.tier].n} tier. Here are your daily rewards for ${p.gap > p.n ? `the last ${p.n} days (a week at most)` : `the ${p.n} days since you last played`}. Keep battling!` : `You're in the ${TIERS[p.tier].n} tier today. Here are your daily rewards. Keep battling!`, rewards: p.rewards });
}
function ladderResult(i, win) {
  const L = S.ladder, them = L.pop[i];
  const d = eloDelta(L.pts, them, win, eloK(L.pts)) + (win && L.rev[i] ? 4 : 0);
  L.pts = Math.max(0, L.pts + d); L.pop[i] = Math.max(0, them - Math.round(d * .5)); live("rankedPlay"); if (win) live("ranked");
  L.best = Math.max(L.best, L.pts);
  if (win) L.wins++; else L.losses++;
  delete L.rev[i];
  return d;
}

// ---------- Trainers learn from losing to you ----------
// A Trainer you beat (in Ranked, a Link Battle, or when they challenge your Registered Team) rethinks their team: the ones that
// matched up worst against the team that beat them make way for Pokémon from their box that match up better (an archetype
// keeps its setters). It sticks until you beat them again. They also counter-pick when they challenge your Registered Team.
function noteLoss(i, keys) {
  if (!S || !S.ladder || i == null || i < 0 || i >= LADDER_N || !keys || !keys.length) return;
  const A = (S.ladder.adapt = S.ladder.adapt || {}), a = A[i] || { n: 0 };
  A[i] = { n: a.n + 1, vs: keys.slice(0, ROSTER), t: Date.now() };
}
// their six against these foes: up to `swaps` of them traded for better matchups from their box
function counterTeam(doc, foes, swaps) {
  if (!foes.length) return doc.team.slice();
  const roster = doc.roster.filter(k => doc.prog[k]), sc = specMatch(roster.map(k => npcSpec(doc, k)), foes), score = {};
  roster.forEach((k, j) => score[k] = sc[j]);
  const keep = k => doc.arch && doc.roles && (docRole(doc, k).lead || docRole(doc, k).need);   // (the plan's leads and the roles it needs stay)
  const team = doc.team.slice(), bench = roster.filter(k => !team.includes(k)).sort((x, y) => score[y] - score[x]);
  for (let n = 0; n < swaps && bench.length; n++) {
    const worst = team.filter(k => !keep(k)).sort((x, y) => score[x] - score[y])[0]; if (!worst) break;
    const rest = team.filter(k => k !== worst), b = bench.findIndex(k => pvpFits(rest, k, pvpLimits("ranked")));   // (within the PvP limits)
    if (b < 0 || score[bench[b]] <= score[worst] + .05) break;
    team[team.indexOf(worst)] = bench.splice(b, 1)[0];
  }
  return team;
}

// ---------- Link Battles (draft) ----------
function rtaInit() { return { pts: LADDER_START, best: LADDER_START, games: 0, wins: 0, losses: 0, streak: 0, place: 5, log: [], week: weekId() }; }
// matchmaking: a Trainer from the ladder population whose strength matches your rating (online ones queue first)
function rtaOpponent() {
  const r = S.rta.pts + (Math.random() - .45) * 120, q = srvRatingQ(r);
  const near = [];
  for (let i = 0; i < LADDER_N; i++) if (Math.abs(ladderQ(i) - q) < .02 + Math.random() * .02) near.push(i);
  const live = typeof isOnline === "function" ? near.filter(i => isOnline(i)) : [];
  const i = (live.length ? live : near.length ? near : [ladderAt(q)])[Math.floor(Math.random() * (live.length || near.length || 1))];
  const pts = Math.round(clamp(r, 0, 3400));
  const doc = npcDoctor(S.ladder.seed, i, ladderQ(i), tierIdx(pts));   // built for the tier it's shown at
  return modeDoc({ ...doc, i, pts }, "link");   // (Link Battles' own rules: the team config's modes)
}
// snake draft for teams of five (then one ban each, leaving 4 v 4)
const DRAFT_ORDER = [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1];   // seven picks each (snake order), then one ban each: six battle
const DRAFT_PICKS = DRAFT_ORDER.length / 2;
function draftValue(k, prog, mine, theirs, q) {
  let v = metaScore(k) * investOf(k, prog);
  const needHeal = !mine.some(isMedicK), needTank = !mine.some(isTankK), needAoe = !mine.some(isAoeK);
  if (isMedicK(k)) v *= needHeal ? 1.4 : .5;
  if (isTankK(k)) v *= needTank && mine.length >= 2 ? 1.2 : .85;
  if (isAoeK(k) && needAoe) v *= 1.12;
  // counter-picks: moves that hit their picks super effectively, and types their picks hit hard
  if (q > .5 && theirs.length) {
    const se = theirs.filter(x => OPS[k].skills.some(s => s.cat !== "X" && typeEff(s.type, OPS[x].types) > 1)).length;
    const weak = theirs.filter(x => OPS[x].skills.some(s => s.cat !== "X" && typeEff(s.type, OPS[k].types) > 1)).length;
    v *= 1 + .09 * se - .06 * weak;
  }
  if (mine.some(x => OPS[x].types[0] === OPS[k].types[0])) v *= .85;
  return v;
}
function draftPick(avail0, progOf, mine, theirs, q, rng = Math.random, plan) {
  const avail = avail0.filter(k => pvpFits(mine, k, pvpLimits("link")));   // (the PvP limits: one Legendary, one Mythical...)
  const sc = k => draftValue(k, progOf(k), mine, theirs, q) * (1 + (rng() - .5) * (1 - q) * .9) * (plan && plan.includes(k) ? 1.35 : 1);
  return avail.slice().sort((a, b) => sc(b) - sc(a))[0];
}
// ban the opponent's biggest threat (weaker Trainers ban less precisely)
function draftBan(theirs, progOf, q, rng = Math.random) {
  const sc = k => metaScore(k) * investOf(k, progOf(k)) * (isMedicK(k) ? 1.2 : 1) * (1 + (rng() - .5) * (1 - q));
  return theirs.slice().sort((a, b) => sc(b) - sc(a))[0];
}
function rtaResult(opp, win) {
  if (win) live("link");
  const R = S.rta, k = R.place > 0 ? 80 : eloK(R.pts);
  let d = eloDelta(R.pts, opp.pts, win, k);
  if (win) { R.streak = Math.max(0, R.streak) + 1; if (R.streak >= 3) d += 5; R.wins++; } else { R.streak = Math.min(0, R.streak) - 1; R.losses++; }
  R.pts = Math.max(0, R.pts + d); R.best = Math.max(R.best, R.pts); R.games++; if (R.place > 0) R.place--;
  R.log.unshift({ t: Date.now(), name: opp.name, pts: opp.pts, win, d });
  R.log = R.log.slice(0, 20);
  return d;
}
