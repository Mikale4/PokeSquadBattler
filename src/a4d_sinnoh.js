
// =====================================================================
//  SINNOH JOURNEY — Platinum's story: Professor Rowan's briefcase on Route 201, eight Gyms, Team Galactic and its Commanders,
//  the lake guardians, Spear Pillar and the Distortion World, the Elite Four and Champion Cynthia, then the Battle Zone, Stark
//  Mountain and Spear Pillar's Dialga and Palkia. Every story battle uses the strongest of its Diamond/Pearl, Platinum and Brilliant
//  Diamond/Shining Pearl teams (the owner's rule, 2026-10-15), and the Gyms come in the order those teams set: Fantina's Diamond/
//  Pearl team is the stronger, so she is the fifth Leader, as in Diamond and Pearl. Where the versions' Pokémon differ, head-to-head
//  battles decided (the same random Gen 4 teams against each): Platinum's Volkner, Aaron, Bertha and Flint, BDSP's Fantina, Lucian,
//  Cynthia and League Barry (BDSP's are Diamond/Pearl's Pokémon and levels with held items); everywhere else Platinum's are the
//  higher-levelled, and the Legendaries are at their highest version's level (Heatran and Regigigas Diamond/Pearl's 70). The other
//  versions' teams and the rematches are the Battle Tower's Sinnoh wing (TOWER_WING below). The other versions' catches are side
//  stages (the owner's pick): BDSP's Grand Underground (its Hideaways at their Badge-scaled levels, the Skull and Armor Fossils),
//  Ramanas Park (every room at Lv 70: its Regis and birds replace Platinum's Lv 30 ruins and Lv 60 roamers, the stronger encounters;
//  the Distortion Room's Lv 100 Giratina is only beaten), the Mythicals Darkrai, Shaymin and Arceus, and Manaphy's Egg, a side gift
//  (chest: 1). Dialogue is original.
//  Only Sinnoh's Pokémon (Gen 4's) battle on your side here (journeyOk); its wild stages catch them. Gifts from other regions'
//  generations (Cynthia's Togepi, Bebe's Eevee, the Veilstone Porygon) wait for their region (grantOp).
//  Stage ids start with "si" (REGION_CODE in a4_story.js): si1-1, siS1-1; chapters sic1... `music` on a stage: the place's track while
//  its scene plays (Platinum's, a8c_sfx.js).
// =====================================================================
// Professor Rowan's assistant: Dawn while you look like a boy, Lucas while you look like a girl (Platinum: the one you aren't)
const sinnohAssistDawn = () => { try { return !LEAF_LIKE.includes(avatar()); } catch (e) { return true; } };
const sinnohAssistName = () => sinnohAssistDawn() ? "Dawn" : "Lucas";
Object.assign(SPK, {
  rowan: { n: "Prof. Rowan", t: "si_rowan" }, smom: { n: "Mom", t: "si_mom" }, barry: { n: "Barry", t: "si_barry" }, looker: { n: "Looker" },
  sassist: { get n() { return sinnohAssistName(); }, get t() { return sinnohAssistDawn() ? "si_dawn" : "si_lucas"; } },
  cynthia: { n: "Cynthia", t: "si_cynthia" }, cyrus: { n: "Cyrus", t: "si_cyrus" }, mars: { n: "Mars", t: "si_mars" }, jupiter: { n: "Jupiter", t: "si_jupiter" },
  saturn: { n: "Saturn", t: "si_saturn" }, charon: { n: "Charon", t: "si_charon" }, sgrunt: { n: "Team Galactic Grunt", t: "si_grunt" }, sgruntf: { n: "Team Galactic Grunt", t: "si_gruntf" },
  roark: { n: "Roark", t: "si_roark" }, gardenia: { n: "Gardenia", t: "si_gardenia" }, maylene: { n: "Maylene", t: "si_maylene" }, wake: { n: "Crasher Wake", t: "si_wake" },
  fantina: { n: "Fantina", t: "si_fantina" }, byron: { n: "Byron", t: "si_byron" }, candice: { n: "Candice", t: "si_candice" }, volkner: { n: "Volkner", t: "si_volkner" },
  aaron: { n: "Aaron", t: "si_aaron" }, bertha: { n: "Bertha", t: "si_bertha" }, flint: { n: "Flint", t: "si_flint" }, lucian: { n: "Lucian", t: "si_lucian" },
  cheryl: { n: "Cheryl", t: "si_cheryl" }, mira: { n: "Mira", t: "si_mira" }, riley: { n: "Riley", t: "si_riley" }, marley: { n: "Marley", t: "si_marley" },
  buck: { n: "Buck", t: "si_buck" }, palmer: { n: "Palmer", t: "si_palmer" }, sjasmine: { n: "Jasmine", t: "rg_jasmine" }, bebe: { n: "Bebe" },
  grandma: { n: "Cynthia's Grandmother" }, shiker: { n: "Hiker", t: "si_hiker" },
});
const WS = WG(4);
// a line that changes the scene's music (m) or plays a jingle over it (j): Platinum's cues at Spear Pillar and the Hall of Origin
const LM = (s, t, m) => ({ s, t, m }), LJ = (s, t, j) => ({ s, t, j });
// Barry takes the starter strong against yours from Professor Rowan's briefcase; the rest of his team is two of Buizel, Roselia and
// Ponyta (the two types his starter doesn't cover) with Starly's line, then Heracross and Munchlax, as in Platinum
const SINNOH_RIVAL_OF = { turtwig: "chimchar", chimchar: "piplup", piplup: "turtwig" };
const SINNOH_RIVAL_LINE = { turtwig: ["turtwig", "grotle", "torterra"], chimchar: ["chimchar", "monferno", "infernape"], piplup: ["piplup", "prinplup", "empoleon"] };
const BARRY_TWO = { chimchar: ["buizel", "roselia"], piplup: ["ponyta", "roselia"], turtwig: ["buizel", "ponyta"] };
const BARRY_GROWN = { buizel: "floatzel", roselia: "roserade", ponyta: "rapidash" };
const sinnohStarter = () => { const k = regionStarter("sinnoh"); return SINNOH_RIVAL_OF[k] ? k : "turtwig"; };
const barryMon = st => SINNOH_RIVAL_LINE[SINNOH_RIVAL_OF[sinnohStarter()]][st];
const barryTwo = (grown = false) => BARRY_TWO[SINNOH_RIVAL_OF[sinnohStarter()]].map(k => grown ? BARRY_GROWN[k] : k);
const barryTR = (intro, lose) => TR("Barry", "si_barry", intro, lose);

const SINNOH_JOURNEY = {
  id: "sinnoh", title: "Sinnoh Journey", sub: "The Sinnoh League Challenge",
  blurb: "Leave Twinleaf Town with a partner from Professor Rowan's briefcase, earn Sinnoh's eight Gym Badges, stop Team Galactic at Spear Pillar, and face Champion Cynthia.",
  chapters: [
    { id: "c1", title: "Twinleaf Town to Oreburgh City", env: "route", map: "route", reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Twinleaf Town", music: "siTwinleaf", pre: [
          L("narr", "Twinleaf Town, a quiet place at the edge of Sinnoh, with snow still lying in the shade. On TV, a special report: Professor Rowan is back from Kanto."),
          L("barry", "Hey! Did you see that? A Pokémon professor, right here in Sinnoh! We're going to get Pokémon from him. Meet me on Route 201. If you're late, I'm fining you!"),
          L("smom", "Going out with Barry? Then stay out of the tall grass. Wild Pokémon live there, and you don't have one of your own yet."),
        ] },
        { id: "b", type: "story", name: "Route 201: Professor Rowan's Briefcase", env: "route", starter: 1, music: "siIntro", pre: [
          L("barry", "Okay, here's the plan: we run through the tall grass to Sandgem Town, and the Professor gives us Pokémon. Ready? Three, two..."),
          L("rowan", "Stop right there! Two children, walking into the tall grass with no Pokémon? Have you lost your senses?"),
          LR("sassist", () => `Professor! You left your briefcase! ...Oh. Hello. I'm ${sinnohAssistName()}, the Professor's assistant.`),
          L("rowan", "Hmm. You have the eyes of people who would go into that grass whatever I said. Then go with a partner. Choose one from my briefcase."),
        ], post: [
          L("barry", "Then I'll take this one! It's strong against yours, so I'm going to win. Let's battle, right now!"),
        ] },
        // (Lv 3, not Platinum's 5, as in the other regions' first rival battles (README, House rules): Barry's starter is the one strong
        // against yours, and a Lv 5 Piplup, whose only attack is Pound, won 0% of 300 battles against his Lv 5 Turtwig and 46% at Lv 4;
        // at Lv 3 every starter wins every time)
        { id: "c", type: "battle", name: "Route 201: Barry", lv: 5, env: "route", get trainer() { return barryTR("I picked the strong one, so I can't lose! Here I come!", "What?! I lost? ...Then I'm fining you for being too strong!"); },
          rivalWaves: () => [[{ op: barryMon(0), LV: 3, moves: { chimchar: ["scratch", "leer"], piplup: ["pound", "growl"], turtwig: ["tackle", "withdraw"] }[barryMon(0)] }]], pre: [
          L("barry", "A battle's the best way to get to know a Pokémon. Let's go!"),
        ], post: [
          L("rowan", "So. You chose your partners and battled at once. Look after them. We'll speak again in Sandgem Town."),
        ] },
        { id: "d", type: "story", name: "Lake Verity", reward: { key: "si_runningshoes" }, music: "siLake", pre: [
          L("narr", "Mom gives you Running Shoes, and Barry drags you to Lake Verity: he's heard a Legendary Pokémon lives in the lake."),
          L("cyrus", "...This lake's calm is a lie. One day I will hold time and space in my hands, and make a world without such lies. Excuse me."),
          L("narr", "The man in the gray suit walks off. Something in the lake seems to be watching you, but neither of you has a single Poké Ball."),
          L("barry", "No Poké Balls? Then it can't be caught today! To Sandgem, to the Professor's lab! Last one there pays a fine!"),
        ] },
        { id: "e", type: "story", name: "Sandgem Town: Professor Rowan's Lab", reward: { key: "si_pokeballs" }, music: "siLab", pre: [
          L("rowan", "Ninety percent of all Pokémon are linked to evolution in some way. I study that. To study it, I need a record of every Pokémon in Sinnoh."),
          L("rowan", "That is what this Pokédex is for. I'm giving it to you. Go and see every Pokémon in this region, and come back to tell me about them."),
          LR("sassist", () => `I'll show you around Sandgem! And on Route 202 I'll show you how to catch a Pokémon. Here, take these Poké Balls.`),
        ] },
        { id: "f", type: "battle", name: "Route 202", lv: 4, env: "route", wild: 1, catch: "shinx", music: "siRoute201", waves: [WS("bidoof:3", "starly:3"), WS("shinx:4", "kricketot:3")], pre: [
          LR("sassist", () => `Weaken it first, then throw the ball. Watch! ...See? Now you try. That little one with the yellow tail is a Shinx.`),
        ], post: [L("narr", "Gotcha! Shinx was caught! Its fur glows when it's in danger.")] },
        { id: "g", type: "side", name: "Lake Verity's Shore", lv: 4, env: "route", wild: 1, catch: "starly", music: "siLake", waves: [WS("bidoof:3", "bidoof:4"), WS("starly:4!")], pre: [
          L("narr", "Starly flock along Lake Verity's shore. On their own they're weak, but a flock of them puts up a fight."),
        ], post: [L("narr", "Gotcha! Starly was caught!")] },
        { id: "h", type: "story", name: "Jubilife City", reward: { key: "si_townmap" }, music: "siJubilife", pre: [
          L("narr", "Jubilife City, the biggest city in Sinnoh: the TV station, the Trainers' School, the Pokétch Company, and crowds everywhere."),
          L("looker", "Ah, you are a Trainer, yes? I am... a detective. Call me Looker. There is a group calling itself Team Galactic. If you see them, be careful."),
          L("barry", "There you are! Mom's Parcel? For me? Thanks! Here, a Town Map. The first Gym is in Oreburgh City. Race you!"),
        ] },
        { id: "i", type: "battle", name: "Route 203: Barry", lv: 9, env: "route", music: "siRoute203", get trainer() { return barryTR("Wait up! Let's see whose Pokémon grew faster!", "Augh! You beat me again? Then I'll have to win the first Badge before you!"); },
          rivalWaves: () => [WS("starly:7", barryMon(0) + ":9!")], pre: [
          L("barry", "I've been training on Route 202 the whole time! Battle me, then we go to Oreburgh. Ready? No? Too bad!"),
        ] },
        { id: "j", type: "story", name: "Oreburgh Mine", reward: { tm: tmId("rocksmash", 4) }, music: "siMine", pre: [
          L("narr", "In Oreburgh Gate a Hiker gives you HM06 Rock Smash. Oreburgh City is a mining town, and its Gym Leader is down in the mine."),
          L("roark", "A challenger? Then come up to the Gym. I'll be waiting for you there, after I finish this shift."),
        ] },
        { id: "k", type: "battle", name: "Oreburgh Gym: Youngster Jonathon", lv: 11, env: "gym", music: "siOreburgh", trainer: TR("Youngster Jonathon", "si_youngster", "Roark's the strongest in Oreburgh! You'll have to get past me first!", "Whoa... You're strong!"),
          waves: [WS("geodude:11")] },
        { id: "l", type: "boss", name: "Roark, Roark the Rock", reward: { tm: tmId("stealthrock", 4) }, lv: 14, env: "gym", badgeWin: 0,
          trainer: TR("Leader Roark", "si_roark", "I'm Roark, the Oreburgh Gym Leader. I dig up fossils in the mine, and I raise Rock-type Pokémon. Let's see what you're made of!", "...I lost? Well, a Leader has to give credit where it's due. Here: the Coal Badge."),
          waves: [WS("geodude:12+", "onix:12+", "cranidos:14!")], pre: [
          L("roark", "My Cranidos was revived from a fossil, a Pokémon from a hundred million years ago. Its headbutt can crush rock!"),
          L("narr", "Rock types shrug off Normal and Flying moves. Water, Grass, Fighting, Ground and Steel moves hit them hard."),
        ], post: [L("roark", "Take this TM too: Stealth Rock. It scatters sharp rocks around your opponents' side. The next Gym's in Eterna City.")] },
      ] },
    { id: "c2", title: "Floaroma Town and Eterna City", env: "forest", map: "forest", reward: { lmd: 4000, orundum: 300, leafstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Jubilife City: Team Galactic", lv: 11, env: "city", music: "siJubilife", trainer: TR("Team Galactic Grunts", "si_grunt", "We're Team Galactic! Hand over the Professor's research, or else!", "Ugh... We'll get it another time!"),
          waves: [WS("stunky:11"), WS("glameow:11")], pre: [
          L("narr", "Back in Jubilife, two people in bowl-cut haircuts and space suits have cornered Professor Rowan and his assistant at the north exit."),
          L("sgrunt", "Give us the Professor's research on evolution! Team Galactic will use it to make a new world!"),
          LR("sassist", () => `Two against one? Then we'll fight two on two. Come on, let's battle them together!`),
        ], post: [
          L("rowan", "Hmph. Team Galactic... They want to use evolution's power for themselves. Be careful on your journey."),
        ] },
        { id: "b", type: "battle", name: "Route 204", lv: 6, env: "route", wild: 1, catch: "budew", music: "siRoute203", waves: [WS("starly:5", "bidoof:5"), WS("budew:5", "kricketot:5")], pre: [
          L("narr", "Route 204 runs north out of Jubilife through the Ravaged Path. Budew doze in the grass, their buds closed tight against the cold."),
        ], post: [L("narr", "Gotcha! Budew was caught! When its bud opens, the scent of its pollen spreads.")] },
        { id: "c", type: "battle", name: "Floaroma Meadow: Team Galactic", reward: { key: ["si_workskey", "si_honey"] }, lv: 13, env: "route", music: "siFloaroma", trainer: TR("Team Galactic Grunts", "si_grunt", "This guy's got Honey, and we want it! Scram, kid!", "We got beat... Fine, we're going back to the Windworks!"),
          waves: [WS("stunky:13"), WS("zubat:11", "zubat:11")], pre: [
          L("narr", "Floaroma Town is full of flowers. A girl is crying: her father went to work at the Valley Windworks, and men in space suits locked him in."),
          L("narr", "In Floaroma Meadow, two Grunts are shaking down an old man for his Honey."),
        ], post: [L("narr", "The Grunts drop a key as they run: the Works Key. The old man gives you a jar of Honey to thank you.")] },
        { id: "d", type: "battle", name: "Valley Windworks: Team Galactic", lv: 13, env: "plant", music: "siGalactic", trainer: TR("Team Galactic Grunts", "si_grunt", "Who let you in here? This power plant belongs to Team Galactic now!", "Ack! The Commander's going to be mad..."),
          waves: [WS("glameow:13", "zubat:13"), WS("glameow:11", "stunky:11")] },
        { id: "e", type: "boss", name: "Valley Windworks: Commander Mars", lv: 17, env: "plant", music: "siGalactic", trainer: TR("Commander Mars", "si_mars", "I'm Mars, one of Team Galactic's Commanders. We're collecting this plant's electricity. Do you mind? ...Too bad!", "Ugh, you're tough! Fine. We've got enough power anyway."),
          waves: [WS("zubat:15", "purugly:17!@oranberry")], pre: [
          L("mars", "Our boss wants to make a new universe. Electricity is just the start. You're in the way, so I'll just have to beat you!"),
        ], post: [
          L("charon", "Mars, my dear. We've collected plenty of electricity. Do leave the child alone and come along. Heh heh heh."),
          L("mars", "Don't tell me what to do, Charon! ...Fine. Let's go."),
          L("looker", "I came as fast as I could... and they are gone. Team Galactic may have a hideout in Eterna City. I will look into it."),
        ] },
        { id: "f", type: "side", name: "Valley Windworks: Drifloon", lv: 22, env: "route", wild: 1, catch: "drifloon", music: "siRoute205", waves: [WS("pachirisu:13", "shellos:13"), WS("drifloon:22!")], pre: [
          L("narr", "Every Friday a balloon-like Pokémon drifts in front of the Valley Windworks. Children who grab its string are said to vanish."),
        ], post: [L("narr", "Gotcha! Drifloon was caught! It floats along on the wind, and gathers where spirits wander.")] },
        { id: "g", type: "battle", name: "Route 205", lv: 11, env: "route", wild: 1, catch: "buizel", music: "siRoute205", waves: [WS("shellos:10", "pachirisu:11"), WS("buizel:11", "bidoof:10")], pre: [
          L("narr", "Past the bridge, Route 205 runs along the river to Eterna Forest. Buizel paddle with their twin tails like propellers."),
        ], post: [L("narr", "Gotcha! Buizel was caught! It inflates its flotation sac to keep its head above water.")] },
        { id: "g1", type: "side", name: "Route 205: Shellos", lv: 11, env: "sea", wild: 1, catch: "shellos", music: "siRoute205", waves: [WS("pachirisu:10", "bidoof:10"), WS("shellos:11", "shellos:12")], pre: [
          L("narr", "On this side of Mt. Coronet the Shellos are pink. On the east side, people say, they're blue. No one is quite sure why."),
        ], post: [L("narr", "Gotcha! Shellos was caught!")] },
        { id: "h", type: "battle", name: "Eterna Forest", reward: { soothebell: 1 }, lv: 13, env: "forest", wild: 1, catch: "buneary", music: "siForest", waves: [WS("budew:10", "kricketot:10"), WS("buneary:13", "gastly:11")], pre: [
          L("cheryl", "Excuse me... I'm Cheryl. I'm trying to get through the forest, but I'm a little scared on my own. Could we go together? My Chansey can heal your Pokémon."),
          L("narr", "Eterna Forest is so thick that daylight hardly reaches the ground. Buneary hop through the undergrowth, their ears curled up."),
        ], post: [
          L("narr", "Gotcha! Buneary was caught! It rolls up its ears when it senses danger."),
          L("cheryl", "We made it! Thank you. Please, take this Soothe Bell. Pokémon that hear its ring feel calm and happy."),
        ] },
        { id: "i", type: "story", name: "Eterna City", reward: { tm: tmId("cut", 4) }, music: "siEterna", pre: [
          L("narr", "Eterna City is old, and proud of it. In its square stands a statue of a Pokémon said to have shaped Sinnoh."),
          L("cyrus", "...Long ago, the Pokémon that created time and space were born in Sinnoh. Two of them. This statue is a crude reminder. Good day."),
          L("cynthia", "Hello. I'm Cynthia. I study the myths of Sinnoh. Do you know about the Pokémon of time and space too? Interesting..."),
          L("cynthia", "Take this HM, Cut. It'll help you get around. And if you see Team Galactic in this town, please be careful."),
        ] },
        { id: "j", type: "battle", name: "Eterna Gym: Lass Caroline", lv: 17, env: "gym", trainer: TR("Lass Caroline", "si_lass", "Every time a Trainer loses here, the Gym's clock moves on. You won't move it!", "The clock moved... Gardenia's next."),
          waves: [WS("cherubi:17", "roselia:17")] },
        { id: "k", type: "boss", name: "Gardenia, Master of Vivid Plant Pokémon", reward: { tm: tmId("grassknot", 4) }, lv: 22, env: "forest", badgeWin: 1,
          trainer: TR("Leader Gardenia", "si_gardenia", "I'm Gardenia, the Eterna Gym Leader. I love Grass-type Pokémon more than anything! You'll love them too, after this!", "Amazing! You're really strong. Here, the Forest Badge is yours."),
          waves: [WS("turtwig:20+", "cherrim:20+", "roserade:22!@sitrusberry")], pre: [
          L("gardenia", "Grass types aren't just pretty. They drain and poison and put you to sleep. Ready?"),
          L("narr", "Fire, Flying, Bug, Ice and Poison moves hit Grass types hard."),
        ], post: [L("gardenia", "And take Grass Knot: it hits heavier Pokémon harder. Oh, and there's an old chateau in the forest... I'm too scared to go in. Ghosts!")] },
        { id: "l", type: "battle", name: "Team Galactic Eterna Building", lv: 19, env: "plant", music: "siGalactic", trainer: TR("Team Galactic Grunts", "si_grunt", "An intruder in the Eterna Building? Get them!", "Don't go up there! The Commander's on 4F!"),
          waves: [WS("zubat:17", "stunky:17"), WS("croagunk:19", "glameow:19")], pre: [
          L("narr", "Team Galactic's building in Eterna City has a statue of a Pokémon out front. A Grunt looks remarkably like Looker in a wig."),
          L("looker", "Psst! It is I, in disguise. They have taken a bicycle shop owner's Clefairy. Up the stairs! I will keep watch."),
        ] },
        { id: "m", type: "boss", name: "Galactic Eterna Building: Commander Jupiter", reward: { key: "si_bicycle" }, lv: 23, env: "plant", music: "siGalactic", trainer: TR("Commander Jupiter", "si_jupiter", "You beat our Grunts? Then I'll give you the beating they couldn't.", "Not bad... It's no fun losing. We're done with this building anyway."),
          waves: [WS("zubat:21", "skuntank:23!@sitrusberry")], pre: [
          L("jupiter", "I'm Jupiter, a Commander of Team Galactic. We were studying the Pokémon of Sinnoh's myths here. Children shouldn't poke their noses into adults' work."),
        ], post: [L("narr", "Jupiter abandons the building, and her Grunts scramble after her. The Clefairy is freed, and its owner, Rad Rickshaw, gives you a Bicycle.")] },
        { id: "n", type: "chest", name: "Cynthia's Egg", reward: { op: "togepi", lmd: 1500 }, music: "siEterna", pre: [
          L("cynthia", "You drove Team Galactic out of their building? Thank you. Here, take this Egg. I'd like it to hatch with a Trainer like you."),
          L("narr", "The Egg wobbles, warm in your hands... and hatches into Togepi! It's full of happiness."),
        ] },
        { id: "o", type: "side", name: "Old Chateau: Rotom", lv: 20, env: "tower", wild: 1, catch: "rotom", music: "siChateau", waves: [WS("gastly:15", "gastly:16"), WS("rotom:20!")], pre: [
          L("narr", "With Cut, the path to the Old Chateau in Eterna Forest is open. It has been empty for a hundred years. At night, the old TV on the second floor flickers on by itself."),
        ], post: [L("narr", "Gotcha! Rotom was caught! Its body of plasma can slip into machines.")] },
        { id: "p", type: "side", name: "Floaroma Meadow: the Honey Tree", lv: 12, env: "forest", wild: 1, catch: "combee", music: "siFloaroma", waves: [WS("burmy:10", "cherubi:11"), WS("combee:12", "aipom:12")], pre: [
          L("narr", "You slather Honey on a golden tree in the meadow and wait. A day later, something is buzzing around it."),
        ], post: [L("narr", "Gotcha! Combee was caught! Its three faces each gather nectar from a different flower.")] },
        // (the Grand Underground, Brilliant Diamond/Shining Pearl's: its Hideaways' Pokémon scale with your Badges, at the canon levels)
        { id: "p1", type: "side", name: "Grand Underground: Grassland Cave", reward: { key: "si_explorerkit" }, lv: 18, env: "forest", wild: 1, catch: "cherubi", music: "siUnderground", waves: [WS("kricketot:16", "budew:17"), WS("cherubi:18", "combee:17")], pre: [
          L("narr", "The Underground Man in Eterna City gives you an Explorer Kit. Below Sinnoh runs a maze of tunnels, the Grand Underground, with hideaways where Pokémon live."),
          L("narr", "In the Grassland Cave, grass grows under a glowing ceiling. A Cherubi is nibbling at the small berry on its head."),
        ], post: [L("narr", "Gotcha! Cherubi was caught! Its berry is full of nutrients for evolving.")] },
        { id: "p2", type: "side", name: "Grand Underground: the Skull Fossil", lv: 18, env: "cave", wild: 1, gift: "cranidos", giftLv: 20, music: "siUnderground", waves: [WS("geodude:16", "onix:17"), WS("skorupi:18")], pre: [
          L("narr", "Digging in the walls of the Rocky Cave, you hit something hard: a Skull Fossil. The wild Pokémon don't like the noise."),
        ], post: [L("narr", "At the Oreburgh Mining Museum the Skull Fossil is brought back to life: Cranidos, a Pokémon from a hundred million years ago!")] },
      ] },
    { id: "c3", title: "Mt. Coronet and Hearthome City", env: "cave", map: "cave", reward: { lmd: 5000, orundum: 300, shinystone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 206: Cycling Road", lv: 18, env: "route", wild: 1, catch: "kricketune", music: "siBike", waves: [WS("gligar:16", "kricketune:17"), WS("ponyta:17", "kricketune:18")], pre: [
          L("narr", "Cycling Road runs high above Route 206. Underneath, among the rocks, Kricketune play their chirping melodies."),
        ], post: [L("narr", "Gotcha! Kricketune was caught! It plays its songs by striking its arms against its body.")] },
        { id: "b", type: "side", name: "Wayward Cave: the Hidden Entrance", lv: 20, env: "cave", wild: 1, catch: "gible", music: "siGate", waves: [WS("zubat:18", "bronzor:18"), WS("gible:19!")], pre: [
          L("mira", "Um... I'm Mira. I got lost in the dark. Can I follow you? My Kadabra will help you battle."),
          L("narr", "Under Cycling Road there's a second way into Wayward Cave. In the dark, something small with big jaws is lying in wait."),
        ], post: [L("narr", "Gotcha! Gible was caught! It lives in warm caves, and leaps out at whatever comes close.")] },
        { id: "c", type: "battle", name: "Mt. Coronet", lv: 18, env: "cave", wild: 1, catch: "chingling", music: "siGate", waves: [WS("zubat:17", "geodude:18"), WS("chingling:17", "bronzor:18")], pre: [
          L("narr", "Mt. Coronet splits Sinnoh in two. Its peak is said to be where the world began."),
          L("cyrus", "...You again. People have spirit, and spirit makes them weak and unhappy. The world itself is incomplete. I will make it complete. That is all."),
        ], post: [L("narr", "Gotcha! Chingling was caught! It rings like a bell with every hop.")] },
        { id: "d", type: "story", name: "Hearthome City", music: "siHearthome", pre: [
          L("narr", "Hearthome City is where people and Pokémon come together: Amity Square, the Contest Hall, and a Gym that's closed today."),
          L("fantina", "Ah, a challenger? I am so sorry! I am Fantina, the Gym Leader, and today I am at the Contest Hall. Come back when you have more Badges: then we will battle, oui?"),
          L("smom", "Surprise! I came to watch the Contests. Look at you, a real Trainer. Your Pokémon look happy. That's what matters most."),
        ] },
        { id: "e", type: "chest", name: "Bebe's Eevee", reward: { op: "eevee", lmd: 2000 }, music: "siHearthome", pre: [
          L("bebe", "I'm Bebe. I take care of the PC storage system. You have so many Pokémon to look after! Here: this Eevee needs a Trainer. Raise it well."),
        ] },
        { id: "f", type: "battle", name: "Route 209: Barry", lv: 27, env: "route", music: "siRoute209", get trainer() { return barryTR("You're here! Let's see whose team is tougher now. I've been training like crazy!", "Gah! I lost again?! You're way too strong!"); },
          rivalWaves: () => [WS("staravia:25", barryTwo()[0] + ":23", barryTwo()[1] + ":23", barryMon(1) + ":27!")], pre: [
          L("barry", "I heard you got the Forest Badge! I've got two too. So we're even! Except now I'm going to win!"),
        ], post: [L("barry", "I'm off to Solaceon Town! I'm going to be stronger than everyone, you'll see!")] },
        { id: "g", type: "side", name: "Hallowed Tower: Spiritomb", lv: 25, env: "tower", wild: 1, catch: "spiritomb", music: "siChateau", waves: [WS("duskull:22", "gastly:22"), WS("spiritomb:25!")], pre: [
          L("narr", "On Route 209 stands a crumbling tower with a crack in it. You fit the Odd Keystone from the Underground into the crack... and 108 spirits answer."),
        ], post: [L("narr", "Gotcha! Spiritomb was caught! It was bound to the stone for mischief 500 years ago.")] },
        { id: "h", type: "story", name: "Solaceon Town and the Ruins", reward: { tm: tmId("defog", 4) }, music: "siSolaceon", pre: [
          L("narr", "Solaceon Town is small and peaceful, with a Pokémon Day Care and ruins full of Unown, the Pokémon shaped like letters."),
          L("narr", "Deep in the Solaceon Ruins you find HM05 Defog. North of town, a crowd of Psyduck holding their heads blocks Route 210."),
        ] },
        { id: "i", type: "side", name: "Grand Underground: Dazzling Cave", lv: 26, env: "cave", wild: 1, catch: "misdreavus", music: "siUnderground", waves: [WS("gastly:25", "kadabra:25"), WS("misdreavus:26", "chingling:25")], pre: [
          L("narr", "The Dazzling Cave's crystals throw light everywhere. Something giggles behind them and pulls at your hair: a Misdreavus."),
        ], post: [L("narr", "Gotcha! Misdreavus was caught! It feeds on the fright of the people it startles.")] },
        { id: "j", type: "side", name: "Grand Underground: Still-Water Cavern", lv: 26, env: "cave", wild: 1, catch: "murkrow", music: "siUnderground", waves: [WS("bidoof:25", "buneary:25"), WS("murkrow:26", "croagunk:25")], pre: [
          L("narr", "A dark lake fills the Still-Water Cavern. Black feathers drift on it: a Murkrow is perched on a stalactite, watching."),
        ], post: [L("narr", "Gotcha! Murkrow was caught! It's said to bring bad luck to anyone who sees it at night.")] },
      ] },
    { id: "c4", title: "Veilstone City", env: "city", map: "city", reward: { lmd: 6000, orundum: 400, duskstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 215: Ace Trainer Dennis", lv: 25, env: "route", weather: "rain", music: "siRoute210", trainer: TR("Ace Trainer Dennis", "si_acetrainer", "It always rains on Route 215. A good Trainer battles in any weather!", "Soaked and beaten..."),
          waves: [WS("gligar:24", "drifblim:25", "buizel:24")], pre: [
          L("narr", "Rain never stops falling on Route 215, east of Solaceon. Veilstone City lies at its end, carved out of the rock."),
        ] },
        { id: "b", type: "chest", name: "Veilstone City: a Gift", reward: { op: "porygon", lmd: 2000 }, music: "siVeilstone", pre: [
          L("narr", "In a house behind Veilstone's Pokémon Center, a man has a Pokémon made of computer code. He'd like you to have it: a Porygon."),
        ] },
        { id: "c", type: "battle", name: "Veilstone Gym: Black Belt Colby", lv: 27, env: "gym", music: "siVeilstone", trainer: TR("Black Belt Colby", "si_blackbelt", "Hwah! Our Leader fights barefoot, even in the snow! Can you match her spirit?", "I'm beaten... But my spirit isn't!"),
          waves: [WS("machoke:23", "machoke:25", "machoke:27")] },
        { id: "d", type: "boss", name: "Maylene, the Barefoot, Fighting Genius", reward: { tm: tmId("drainpunch", 4) }, lv: 32, env: "gym", badgeWin: 2,
          trainer: TR("Leader Maylene", "si_maylene", "I'm Maylene, the Veilstone Gym Leader. I fight alongside my Pokémon, and we both train hard. Let's go!", "...I accept my defeat. You've earned the Cobble Badge."),
          waves: [WS("meditite:28+", "machoke:29+", "lucario:32!")], pre: [
          L("maylene", "Lucario and I train together every day. It reads the aura of everything around it. You won't surprise it!"),
          L("narr", "Fighting types hit Normal, Rock, Steel, Ice and Dark hard. Flying, Psychic and Fairy moves hit them hard. Lucario is part Steel: Fire and Ground hurt it too."),
        ], post: [L("maylene", "Take Drain Punch: it heals you as it hits. ...I needed this loss. I'll train even harder.")] },
        { id: "e", type: "battle", name: "Galactic Warehouse", reward: { tm: tmId("fly", 4) }, lv: 26, env: "plant", music: "siGalactic", trainer: TR("Team Galactic Grunts", "si_grunt", "You want the Pokédex back? Come and take it!", "Our warehouse... Fine! Take your stupid Pokédex!"),
          waves: [WS("zubat:24", "stunky:26"), WS("zubat:24", "croagunk:26")], pre: [
          LR("sassist", () => `Help! A Galactic Grunt grabbed my Pokédex and ran into their warehouse! Will you come with me? Let's battle them together!`),
        ], post: [
          L("looker", "Well done! I followed them too. Look, in their warehouse: HM02 Fly. Take it. They are moving something to Pastoria. Hmm..."),
        ] },
        { id: "f", type: "side", name: "Grand Underground: Big Bluff Cavern", lv: 30, env: "cave", wild: 1, catch: "bronzor", gift: "shieldon", giftLv: 20, music: "siUnderground", waves: [WS("geodude:29", "onix:29"), WS("bronzor:30", "skorupi:30")], pre: [
          L("narr", "Big Bluff Cavern is all cliffs and ledges. A Bronzor hangs in the air, unmoving, and an Armor Fossil sticks out of the wall behind it."),
        ], post: [
          L("narr", "Gotcha! Bronzor was caught! Bronzor were found in ancient tombs, people say."),
          L("narr", "At the Oreburgh Mining Museum the Armor Fossil is brought back to life: Shieldon, with a face as hard as steel."),
        ] },
      ] },
    { id: "c5", title: "Pastoria City and the Great Marsh", env: "sea", map: "sea", reward: { lmd: 7000, orundum: 400, waterstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 214: Collector Brady", lv: 21, env: "route", music: "siRoute210", trainer: TR("Collector Brady", "si_collector", "I collect rare Pokémon! Want to see my whole collection? All six!", "My precious collection..."),
          waves: [WS("skorupi:21", "carnivine:21", "tangela:21"), WS("tropius:21", "croagunk:21", "yanma:21")], pre: [
          L("narr", "Route 214 runs south from Veilstone. In its cliffs is the Maniac Tunnel, and at its end, Valor Lakefront."),
        ] },
        { id: "b", type: "side", name: "Maniac Tunnel: Hippopotas", lv: 24, env: "cave", wild: 1, catch: "hippopotas", music: "siGate", waves: [WS("unown:22", "unown:23"), WS("hippopotas:24!")], pre: [
          L("narr", "A man has been digging this tunnel for years, hoping to find Unown. Hippopotas have moved into the sand he's left behind."),
        ], post: [L("narr", "Gotcha! Hippopotas was caught! It covers itself in sand to keep from overheating.")] },
        { id: "c", type: "battle", name: "Pastoria City: Barry", lv: 36, env: "city", music: "siSolaceon", get trainer() { return barryTR("Pastoria's Gym Leader is my master! Well, he will be. First I beat you!", "I can't believe it... I lost in front of my future master's Gym!"); },
          rivalWaves: () => [WS("staravia:34", barryTwo()[0] + ":32", barryTwo()[1] + ":32", barryMon(1) + ":36!")], pre: [
          L("barry", "Hey! Are you going to the Gym? Battle me first. If I win, I'm the one who gets to challenge Crasher Wake first!"),
        ] },
        { id: "d", type: "battle", name: "Pastoria Gym: Fisherman Walter", lv: 33, env: "gym", music: "siSolaceon", trainer: TR("Fisherman Walter", "si_fisherman", "The water's up! You'll have to get past me and the waves!", "My line snapped!"),
          waves: [WS("whiscash:33")] },
        { id: "e", type: "boss", name: "Crasher Wake, the Torrential Masked Master", reward: { tm: tmId("brine", 4) }, lv: 37, env: "sea", weather: "rain", badgeWin: 3,
          trainer: TR("Leader Wake", "si_wake", "I'm the Pastoria Gym Leader, the masked marvel of the wrestling ring: Crasher Wake! My Water Pokémon will wash you away!", "Hmm! Wonderful! Your Pokémon are strong! The Fen Badge is yours!", "great"),
          waves: [WS("gyarados:33+", "quagsire:34+", "floatzel:37!@sitrusberry")], pre: [
          L("wake", "Water Pokémon are the champions of the ring! Quick, strong, and impossible to pin down!"),
          L("narr", "It's raining in the Pastoria Gym: Water moves are 50% stronger. Electric and Grass moves hit Water types hard; Quagsire is part Ground, and only Grass hurts it much."),
        ], post: [
          L("wake", "Take Brine too! It hits twice as hard when your opponent's hurt. Hm? What's that noise from the Great Marsh?"),
        ] },
        { id: "f", type: "battle", name: "Route 213: the Great Marsh Bomber", lv: 31, env: "route", music: "siValor", trainer: TR("Team Galactic Grunt", "si_grunt", "That was just a test! The real bomb's going to be way bigger! Get away from me!", "Don't tell anyone I lost..."),
          waves: [WS("croagunk:31")], pre: [
          L("narr", "A small explosion shakes the Great Marsh. A Galactic Grunt runs out of it, heading east along Route 213. You give chase."),
          L("looker", "There! The one in the space suit! I will block the way; you battle him!"),
        ] },
        { id: "g", type: "story", name: "Valor Lakefront: Cynthia", reward: { key: "si_secretpotion" }, music: "siValor", pre: [
          L("cynthia", "You chased off Team Galactic again? You're quite something. Here, take this SecretPotion: it will cure the Psyduck on Route 210."),
          L("cynthia", "Three Pokémon live in Sinnoh's three lakes, they say: one of knowledge, one of emotion, one of willpower. I wonder what Team Galactic wants with lakes..."),
        ] },
        { id: "h", type: "battle", name: "The Great Marsh", lv: 28, env: "safari", wild: 1, catch: "skorupi", music: "siMarsh", waves: [WS("bibarel:27", "quagsire:27"), WS("skorupi:28", "carnivine:28")], pre: [
          L("narr", "Pastoria's Great Marsh is a Safari Zone: deep mud, a tram over the reeds, and Pokémon found nowhere else in Sinnoh."),
        ], post: [L("narr", "Gotcha! Skorupi was caught! It grips its prey with its tail claws, which can hold on for hours.")] },
        { id: "h1", type: "side", name: "The Great Marsh: Carnivine", lv: 28, env: "safari", wild: 1, catch: "carnivine", music: "siMarsh", waves: [WS("wooper:27", "yanma:28"), WS("carnivine:28!")], pre: [
          L("narr", "Something hangs from a tree in the marsh, smelling sweetly of rot. Carnivine wait for prey to wander into their jaws."),
        ], post: [L("narr", "Gotcha! Carnivine was caught!")] },
        { id: "h2", type: "side", name: "Route 212: Croagunk in the Rain", lv: 25, env: "route", weather: "rain", wild: 1, catch: "croagunk", music: "siRoute209", waves: [WS("shellos:24", "wooper:24"), WS("croagunk:25", "buizel:24")], pre: [
          L("narr", "Rain falls on Route 212 south of Pastoria. Croagunk croak in the puddles, puffing out their poison sacs."),
        ], post: [L("narr", "Gotcha! Croagunk was caught!")] },
        { id: "h3", type: "side", name: "Pokémon Mansion: the Maid Knockout", lv: 35, env: "city", music: "siRoute209", trainer: TR("Lady Celeste", "si_lady", "Beat my five Maids in just the right number of turns, and you may battle me. My Blissey is waiting.", "My! You're as elegant as you are strong."),
          waves: [WS("clefairy:25", "clefairy:27", "clefairy:29"), WS("clefairy:31", "clefairy:33", "blissey:35!")], pre: [
          L("narr", "Mr. Backlot's Pokémon Mansion stands on Route 212, with a garden full of rare Pokémon. Its Maids have a challenge for visitors."),
        ] },
        { id: "h4", type: "side", name: "Grand Underground: Riverbank Cave", lv: 33, env: "cave", wild: 1, catch: "stunky", music: "siUnderground", waves: [WS("bibarel:33", "croagunk:33"), WS("stunky:33!")], pre: [
          L("narr", "With Strength you can push the Grand Underground's boulders aside. Behind one, in the Riverbank Cave, something smells awful: a Stunky, tail up."),
        ], post: [L("narr", "Gotcha! Stunky was caught! Its spray stinks for a whole day.")] },
        { id: "h5", type: "side", name: "Grand Underground: Spacious Cave", lv: 34, env: "cave", wild: 1, catch: "munchlax", music: "siUnderground", waves: [WS("machoke:33", "graveler:33"), WS("munchlax:34", "pachirisu:33")], pre: [
          L("narr", "With Defog, the mist in the Spacious Cave clears. A Munchlax is sitting in the middle of it, eating something it found on the floor."),
        ], post: [L("narr", "Gotcha! Munchlax was caught! It eats its own weight in food every day.")] },
        { id: "h6", type: "side", name: "Grand Underground: Sunlit Cavern", lv: 35, env: "cave", wild: 1, catch: "purugly", music: "siUnderground", waves: [WS("bibarel:34", "luxio:34"), WS("purugly:35!")], pre: [
          L("narr", "Sunlight leaks into the Sunlit Cavern through cracks above. A big, round cat is lying in the warmest patch, and doesn't want to share it."),
        ], post: [L("narr", "Gotcha! Purugly was caught! It wraps its forked tail around its waist to look bigger.")] },
      ] },
    { id: "c6", title: "Hearthome City Again and Celestic Town", env: "tower", map: "tower", reward: { lmd: 8000, orundum: 500 },
      nodes: [
        { id: "a", type: "battle", name: "Hearthome Gym: Ace Trainer Allen", lv: 30, env: "tower", music: "siHearthome", trainer: TR("Ace Trainer Allen", "si_acetrainer", "In Fantina's Gym, you have to find the right door in the dark. Can you find your way past me?", "I'm the one who's lost..."),
          waves: [WS("gastly:26", "haunter:28", "gengar:30")], pre: [
          L("fantina", "Ah! You have come back with four Badges! Now I am ready. My Gym is very dark: follow the lamps!"),
        ] },
        { id: "b", type: "boss", name: "Fantina, the Alluring, Soulful Dancer", reward: { tm: tmId("shadowclaw", 4) }, lv: 36, env: "tower", badgeWin: 4,
          trainer: TR("Leader Fantina", "si_fantina", "I am Fantina, the Hearthome Gym Leader! My Ghost Pokémon dance like the will-o'-the-wisp. Shall we dance?", "You are so very strong! I see why you won so much. The Relic Badge is for you."),
          waves: [WS("drifblim:32+@zoomlens", "gengar:34+@colburberry", "mismagius:36!@expertbelt")], pre: [
          L("fantina", "I came to Sinnoh for the Contests, and I fell in love with Hearthome. My Pokémon too! Now, show me your best!"),
          L("narr", "Normal and Fighting moves pass straight through Ghost types. Ghost and Dark moves hit them hard; Drifblim is part Flying and Gengar part Poison."),
        ], post: [L("fantina", "Take Shadow Claw also. It strikes from the shadows, and finds the weak spot easily. Au revoir!")] },
        { id: "c", type: "battle", name: "Route 210: Double Team Zac & Jen", lv: 36, env: "route", music: "siRoute210", trainer: TR("Double Team Zac & Jen", "si_acetrainer", "We battle as a team! Two Pokémon, one heart!", "Our teamwork wasn't enough..."),
          waves: [WS("gyarados:36", "raichu:36")], pre: [
          L("narr", "The SecretPotion cures the Psyduck's headaches, and they waddle off. North of them, Route 210 disappears into thick fog."),
          L("cynthia", "Oh, you're heading to Celestic Town? My grandmother lives there. Would you take her this Old Charm for me?"),
        ] },
        { id: "d", type: "battle", name: "Celestic Town: Team Galactic", lv: 32, env: "city", music: "siEterna", trainer: TR("Team Galactic Grunt", "si_grunt", "Nobody gets into the ruins! Boss's orders!", "The Boss is going to... Oh no, he's right here."),
          waves: [WS("houndour:32", "golbat:30")], pre: [
          L("narr", "Celestic Town is Sinnoh's oldest town, built around a small shrine. A Galactic Grunt is blocking the way into the ruins."),
        ] },
        { id: "e", type: "boss", name: "Celestic Ruins: Galactic Boss Cyrus", reward: { tm: tmId("surf", 4) }, lv: 36, env: "tower", music: "siGalacticAppears", trainer: TR("Galactic Boss Cyrus", "si_cyrus", "I am Cyrus, the leader of Team Galactic. Spirit only makes people suffer. I will create a new world without it.", "...I see. That was my mistake. No matter. Our plan does not change."),
          waves: [WS("sneasel:34", "golbat:34", "murkrow:36!@sitrusberry")], pre: [
          L("narr", "In the ruins, a mural shows three small Pokémon around a towering one. The man from Lake Verity is studying it."),
          L("cyrus", "Azelf, Mesprit, Uxie: the lake guardians. With their power I can reach the Pokémon of time and space. ...You've followed me a long way. Then let us battle."),
        ], post: [
          L("cyrus", "I have learned what I needed here. Excuse me."),
          L("grandma", "So you're the one my granddaughter talks about. Thank you for the Old Charm. Take this HM, Surf. The library in Canalave has the old stories."),
        ] },
      ] },
    { id: "c7", title: "Canalave City and Iron Island", env: "sea", map: "sea", reward: { lmd: 9000, orundum: 500, dawnstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 218", lv: 28, env: "sea", wild: 1, catch: "chatot", music: "siRoute203", waves: [WS("mrmime:28", "floatzel:29"), WS("chatot:28", "gastrodon:30")], pre: [
          L("narr", "With Surf, the sea west of Jubilife opens up. Route 218 crosses it to Canalave City. Chatot perch on the posts, chattering."),
        ], post: [L("narr", "Gotcha! Chatot was caught! It mimics whatever it hears, people's words included.")] },
        { id: "b", type: "battle", name: "Canalave City: Barry", lv: 38, env: "city", music: "siCanalave", get trainer() { return barryTR("You're going to the Canalave Gym? Then beat me first! My Pokémon have all evolved!", "No way... Even with my whole team? Okay. You're strong. For now!"); },
          rivalWaves: () => [WS("staraptor:36", "heracross:37", barryTwo(true)[0] + ":35"), WS(barryTwo(true)[1] + ":35", barryMon(2) + ":38!")], pre: [
          L("barry", "Canalave City! A town of sailors and libraries. And me! Let's battle on the bridge!"),
        ], post: [L("barry", "There's an island called Iron Island off the coast. They say strong Trainers go there. You should go!")] },
        { id: "c", type: "battle", name: "Iron Island: Ace Trainer Jonah", reward: { tm: tmId("strength", 4) }, lv: 38, env: "cave", music: "siMine", trainer: TR("Ace Trainer Jonah", "si_acetrainer", "Iron Island's mine is the best training ground in Sinnoh. Show me your training!", "So that's your training..."),
          waves: [WS("quagsire:35", "staraptor:36", "hippopotas:38")], pre: [
          L("riley", "I'm Riley. Something's wrong in the mine: the Pokémon are restless. Take this HM, Strength. Let's go down together. My Lucario will fight beside you."),
        ] },
        { id: "d", type: "battle", name: "Iron Island B2F: Team Galactic", lv: 34, env: "cave", music: "siGalactic", trainer: TR("Team Galactic Grunts", "si_grunt", "We're taking the Steel-type Pokémon in this mine for Team Galactic!", "Two on two and we still lost?!"),
          waves: [WS("zubat:34", "houndour:34", "golbat:34"), WS("glameow:34", "croagunk:34", "stunky:34")], pre: [
          L("riley", "There they are. Team Galactic. Ready? Lucario and I will take the left."),
        ] },
        { id: "e", type: "chest", name: "Riley's Egg", reward: { op: "riolu", lmd: 2000 }, music: "siMine", pre: [
          L("riley", "Thanks to you, the island is quiet again. Please take this Egg. A Pokémon that can read aura will hatch from it."),
          L("narr", "The Egg hatches into Riolu! It senses your feelings in your aura."),
        ] },
        { id: "f", type: "battle", name: "Canalave Gym: Worker Gary", lv: 37, env: "gym", music: "siCanalave", trainer: TR("Worker Gary", "si_worker", "The Gym's lifts are tough work! And so am I!", "Back to work..."),
          waves: [WS("magnemite:37")] },
        { id: "g", type: "boss", name: "Byron, the Man with the Steel Body", reward: { tm: tmId("flashcannon", 4) }, lv: 41, env: "gym", badgeWin: 5,
          trainer: TR("Leader Byron", "si_byron", "Gwahahaha! I'm Byron, the Canalave Gym Leader, and my son Roark's dad! My Steel Pokémon are as hard as my body!", "Gwahahaha! I'm beaten! Take the Mine Badge, you've earned it!", "great"),
          waves: [WS("magneton:37+", "steelix:38+", "bastiodon:41!@sitrusberry")], pre: [
          L("byron", "My son's Rock types are tough, but Steel is tougher. Let's see you put a dent in us!"),
          L("narr", "Steel types resist most moves. Fire, Fighting and Ground moves hit them hard; Bastiodon is part Rock, and Fighting and Ground hit it four times as hard."),
        ], post: [L("byron", "And take Flash Cannon! Gwahahaha! Now off you go!")] },
        { id: "h", type: "story", name: "Canalave Library", music: "siCanalave", pre: [
          L("rowan", "In the oldest books here, Sinnoh's myths say Dialga ruled time and Palkia space, and three lake guardians kept the balance. Team Galactic is after the guardians."),
          L("rowan", "We will split up. My assistant and I will go to Lake Verity. Barry, Lake Acuity. You: Lake Valor. Go!"),
          L("narr", "The building shakes. Somewhere far to the east, a huge explosion has gone off: at Lake Valor."),
        ] },
      ] },
    { id: "c8", title: "The Three Lakes and Snowpoint City", env: "ice", map: "sea", reward: { lmd: 10000, orundum: 600, icestone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Lake Valor: Team Galactic", lv: 37, env: "sea", music: "siGalactic", trainer: TR("Team Galactic Grunts", "si_grunt", "We drained the lake! Now nothing's in our way!", "Commander Saturn will handle you!"),
          waves: [WS("glameow:35", "murkrow:35"), WS("golbat:37")], pre: [
          L("narr", "Lake Valor is gone. Team Galactic's bomb has drained it, and fish Pokémon flop on the mud. Grunts guard the cavern in the middle."),
        ] },
        { id: "b", type: "boss", name: "Valor Cavern: Commander Saturn", lv: 40, env: "cave", music: "siGalactic", trainer: TR("Commander Saturn", "si_saturn", "I'm Saturn, a Commander of Team Galactic. You're too late. Azelf is ours.", "...Interesting. You're strong. Mars should have finished at Lake Verity by now."),
          waves: [WS("golbat:38", "bronzor:38", "toxicroak:40!@sitrusberry")], pre: [
          L("saturn", "It took a bomb to catch it. Azelf, the Being of Willpower. Do you know what we can do with it?"),
        ], post: [L("saturn", "Lake Verity. Mars is there. You'd better hurry... if you can.")] },
        { id: "c", type: "battle", name: "Lake Verity: Team Galactic", lv: 37, env: "route", music: "siGalactic", trainer: TR("Team Galactic Grunts", "si_grunt", "The Professor's no match for us! And neither are you!", "You beat us... but the Commander's got what we came for!"),
          waves: [WS("glameow:33", "golbat:33", "murkrow:36"), WS("croagunk:37")], pre: [
          LR("sassist", () => `You came back! They're everywhere! The Professor's holding them off, but Mars is at the lake!`),
        ] },
        { id: "d", type: "boss", name: "Lake Verity: Commander Mars", lv: 40, env: "route", music: "siGalactic", trainer: TR("Commander Mars", "si_mars", "You again! Too late, kid. We've caught Mesprit.", "Grr! You're getting stronger and stronger. But we've got what we came for!"),
          waves: [WS("golbat:38", "bronzor:38", "purugly:40!@sitrusberry")], pre: [
          L("mars", "Mesprit, the Being of Emotion. It's ours now. Want to try and take it back?"),
        ], post: [L("rowan", "They've taken Mesprit... The last guardian is at Lake Acuity, where Barry went. Go, quickly! Through Mt. Coronet and north!")] },
        { id: "e", type: "battle", name: "Route 216", reward: { tm: tmId("rockclimb", 4) }, lv: 34, env: "ice", weather: "hail", wild: 1, catch: "snover", music: "siRoute216", waves: [WS("sneasel:33", "snorunt:33"), WS("snover:34", "zubat:33")], pre: [
          L("narr", "North of Mt. Coronet, Sinnoh is snow. Route 216 is a blizzard. Snover huddle in the drifts, their snowy coats thick on their backs."),
        ], post: [
          L("narr", "Gotcha! Snover was caught! The berries that grow on its belly ripen in winter."),
          L("narr", "On Route 217, in a cabin half-buried in the snow, you find HM08 Rock Climb. Snowpoint's Badge will let you use it on rocky walls."),
        ] },
        { id: "f", type: "battle", name: "Snowpoint Gym: Ace Trainer Isaiah", lv: 44, env: "ice", weather: "hail", music: "siSnowpoint", trainer: TR("Ace Trainer Isaiah", "si_acetrainer", "Slide across the ice and smash the snowballs if you want to reach Candice!", "Your footing's better than mine!"),
          waves: [WS("piloswine:44")], pre: [
          L("narr", "Snowpoint City sits at Sinnoh's northern tip. At Acuity Lakefront, Barry stopped you: you need Snowpoint's Badge to climb to the lake."),
        ] },
        { id: "g", type: "boss", name: "Candice, the Diamond Dust Girl", reward: { tm: tmId("avalanche", 4) }, lv: 44, env: "ice", weather: "hail", badgeWin: 6,
          trainer: TR("Leader Candice", "si_candice", "I'm Candice, the Snowpoint Gym Leader! I put my focus into everything. My Ice Pokémon too! Let's go, focus!", "Wow! You're great! I'm going to focus on training harder! Here, the Icicle Badge.", "great"),
          waves: [WS("sneasel:40+", "piloswine:40+"), WS("abomasnow:42+", "froslass:44!@sitrusberry")], pre: [
          L("candice", "Ice types are tough to beat in the snow! Hail hurts everyone else, you know!"),
          L("narr", "Hail falls in the Snowpoint Gym. Fire, Fighting, Rock and Steel moves hit Ice types hard."),
        ], post: [L("candice", "Take Avalanche! It hits back twice as hard. And with the Icicle Badge you can climb rocky walls with Rock Climb.")] },
        { id: "h", type: "story", name: "Lake Acuity", music: "siGalactic", pre: [
          L("narr", "At the top of the snowy path, Lake Acuity is still, and Barry is on his knees beside it."),
          L("jupiter", "So, the kid from Eterna. Your friend here? Pathetic. Uxie is ours. Now all three are. Bye!"),
          L("barry", "I couldn't stop her... I couldn't do anything. ...I'm going to get stronger. Strong enough that this never happens again."),
        ] },
      ] },
    { id: "c9", title: "Team Galactic HQ", env: "plant", map: "city", reward: { lmd: 11000, orundum: 600 },
      nodes: [
        { id: "a", type: "battle", name: "Veilstone City: the Galactic Warehouse", lv: 41, env: "plant", music: "siVeilstone", trainer: TR("Team Galactic Grunts", "si_grunt", "Intruder at the warehouse! Stop them!", "They're getting into HQ!"),
          waves: [WS("golbat:41"), WS("houndour:38", "murkrow:40")], pre: [
          L("looker", "Team Galactic's headquarters is here, in Veilstone. I have the Storage Key. Through the warehouse, we can get inside. Shall we?"),
        ] },
        { id: "b", type: "battle", name: "Team Galactic HQ", lv: 42, env: "plant", music: "siHQ", trainer: TR("Scientist Darrius", "si_scientist", "These experiments are for Team Galactic's new world! Don't interfere!", "My data... ruined..."),
          waves: [WS("porygon2:42")], pre: [
          L("narr", "In a meeting hall, Cyrus speaks to his followers: \"We will create a new world, a perfect one. Spirit is incomplete. It will not exist there.\""),
          L("looker", "A new world... He means to remake everything. You must stop him. I will find where they keep the lake guardians."),
        ] },
        { id: "c", type: "boss", name: "Galactic HQ: Galactic Boss Cyrus", reward: { gold5: 1 }, lv: 46, env: "plant", music: "siHQDeep", trainer: TR("Galactic Boss Cyrus", "si_cyrus", "You came this far? Then I'll show you the strength that will build a new world.", "...So. That is all. It makes no difference."),
          waves: [WS("sneasel:44", "crobat:44", "honchkrow:46!@sitrusberry")], pre: [
          L("cyrus", "The lake guardians' crystals have made a Red Chain. With it, I will call Dialga and Palkia to Mt. Coronet's peak. The new world will be mine alone."),
        ], post: [L("cyrus", "Take this. It is a Master Ball. I have no further need of it. The guardians are below, if you care about them. I am leaving for Spear Pillar.")] },
        { id: "d", type: "boss", name: "Galactic HQ: Commander Saturn", lv: 44, env: "plant", music: "siHQDeep", trainer: TR("Commander Saturn", "si_saturn", "The Boss gave you a Master Ball? He must expect you to follow. Then I'll see if you're worth it.", "...I can't win. Fine. Press the button."),
          waves: [WS("golbat:42", "bronzor:42", "toxicroak:44!@sitrusberry")], pre: [
          L("charon", "Heh heh heh. Saturn, keep the child busy. I have work to do."),
        ], post: [
          L("saturn", "The red button frees the three of them. The Boss made a second chain... for something on Mt. Coronet. I don't know if this is right anymore."),
          L("narr", "Azelf, Mesprit and Uxie flash out of their cages, and away to their lakes."),
        ] },
        { id: "e", type: "chest", name: "Looker's Black Flute", reward: { key: "si_blackflute", lmd: 3000 }, music: "siHQ", pre: [
          L("narr", "Cyrus's Master Ball catches any Pokémon without fail. Looker meets you at the door."),
          L("looker", "The Boss has gone to Spear Pillar, at Mt. Coronet's peak. I will try to follow. Take this Black Flute; it may help."),
        ] },
      ] },
    { id: "c10", title: "Spear Pillar and the Distortion World", env: "plateau", map: "plateau", reward: { lmd: 12000, orundum: 800 },
      nodes: [
        { id: "a", type: "battle", name: "Mt. Coronet: Team Galactic", lv: 43, env: "cave", music: "siCoronet", trainer: TR("Team Galactic Grunts", "si_grunt", "The Boss is at the peak! Nobody passes!", "Go ahead, then! You'll see!"),
          waves: [WS("stunky:43"), WS("murkrow:43")], pre: [
          L("narr", "Mt. Coronet's inside is a maze of caves and cliffs. Team Galactic's Grunts are on every floor, all the way up to the summit."),
        ] },
        { id: "a1", type: "side", name: "Mt. Coronet: the Summit", lv: 38, env: "ice", weather: "hail", wild: 1, catch: "bronzong", music: "siCoronet", waves: [WS("snover:36", "machoke:36"), WS("bronzong:37", "abomasnow:38")], pre: [
          L("narr", "Near the summit, hail lashes the mountainside. Ancient Bronzong stand among the rocks as if they'd been placed there."),
        ], post: [L("narr", "Gotcha! Bronzong was caught! People once prayed to it for rain.")] },
        { id: "b", type: "battle", name: "Spear Pillar: Team Galactic", lv: 43, env: "plateau", music: "siSpear", trainer: TR("Team Galactic Grunts", "si_grunt", "You came all the way up here? We'll take you on two at once!", "Just you wait... The Boss is about to make history!"),
          waves: [WS("croagunk:39", "croagunk:43"), WS("stunky:41", "glameow:41")] },
        { id: "c", type: "boss", name: "Spear Pillar: Commanders Mars & Jupiter", lv: 46, env: "plateau", music: "siSpear", trainer: TR("Commanders Mars & Jupiter", "si_mars", "Two Commanders against one kid? This'll be quick!", "We lost? ...It doesn't matter. Look!", "great"),
          waves: [WS("bronzor:44", "golbat:44", "purugly:46!@sitrusberry"), WS("bronzor:44", "golbat:44", "skuntank:46!@sitrusberry")], pre: [
          L("mars", "You've come to stop the Boss? You'll have to get through both of us!"),
          L("barry", "Hold it! Two against one isn't fair. So I'm here! Let's do this together. I've trained my hardest since Lake Acuity!"),
        ], post: [L("barry", "We did it! Here, let me heal your Pokémon. Now go stop him!")] },
        { id: "d", type: "story", name: "Spear Pillar: Time and Space", music: "siLegendAppears", pre: [
          L("cyrus", "Too late. With the Red Chain, I call you. Dialga! Palkia! Come forth!"),
          LM("narr", "The air splits open. Two vast Pokémon appear above the ruins: Dialga, whose heart makes time move, and Palkia, which holds space together.", "siCatastrophe"),
          LM("narr", "The lake guardians arrive, but cannot hold them. Then a shadow spreads across the stones, and the pillars twist.", "siGiratinaAppears"),
          L("narr", "Something huge rises out of the shadow: Giratina. It seizes Cyrus, and drags him down into another world."),
          L("cynthia", "Giratina... the Pokémon banished for its violence. This rift leads to its world: the Distortion World. I'll come with you. Let's go!"),
        ] },
        { id: "e", type: "boss", name: "Distortion World: Galactic Boss Cyrus", lv: 48, env: "tower", music: "siDistortion", trainer: TR("Galactic Boss Cyrus", "si_cyrus", "This place is the world I sought: no spirit, no hope, no joy. And still you come. Why?", "...Why. Why do I lose to you? ...I will find my answer. Here. Alone."),
          waves: [WS("houndoom:45", "honchkrow:47", "crobat:46"), WS("gyarados:46", "weavile:48!@sitrusberry")], pre: [
          L("narr", "In the Distortion World, waterfalls flow sideways and islands float upside down. Cyrus is standing alone at its heart."),
          L("cyrus", "Giratina showed me a world where nothing changes. I will make a new one from it. You will not stop me."),
        ], post: [L("cynthia", "Your Pokémon are worn out. Let me heal them. ...Look, Giratina is coming. You have to calm it.")] },
        { id: "f", type: "boss", name: "Distortion World: Giratina", lv: 47, env: "tower", wild: 1, catch: "giratinaorigin", music: "siGiratinaAppears", waves: [WS("giratinaorigin:47!")], pre: [
          L("narr", "Giratina appears in front of you, in the form it takes in its own world: legs gone, its wings now shadowy tendrils."),
        ], post: [
          L("narr", "Gotcha! Giratina was caught! The Distortion World grows quiet."),
          L("narr", "The rift carries you and Cynthia out to Sendoff Spring, near Mt. Coronet. Cyrus stays behind."),
        ] },
        { id: "g", type: "story", name: "Sandgem Town: Home", music: "siSandgem", pre: [
          L("rowan", "So you returned. ...Good. Good. Team Galactic is finished. And you have been to a world no one has seen. Rest a little."),
          L("rowan", "Then go east, to Sunyshore City. Its Gym is the last before the Pokémon League. And the guardians wait at their lakes."),
        ] },
        { id: "h", type: "side", name: "Acuity Cavern: Uxie", lv: 50, env: "cave", wild: 1, catch: "uxie", music: "siLakeCave", waves: [WS("uxie:50!")], pre: [
          L("narr", "In the cavern on Lake Acuity's island, Uxie floats with its eyes closed. It's said that looking into them wipes your memory."),
        ], post: [L("narr", "Gotcha! Uxie, the Being of Knowledge, was caught!")] },
        { id: "i", type: "side", name: "Valor Cavern: Azelf", lv: 50, env: "cave", wild: 1, catch: "azelf", music: "siLakeCave", waves: [WS("azelf:50!")], pre: [
          L("narr", "Lake Valor has filled again. In its cavern, Azelf waits: the Being of Willpower, which gave people the will to act."),
        ], post: [L("narr", "Gotcha! Azelf was caught!")] },
        { id: "j", type: "side", name: "Mesprit, Roaming Sinnoh", lv: 50, env: "route", wild: 1, catch: "mesprit", music: "siLakeCave", waves: [WS("mesprit:50!")], pre: [
          L("narr", "Mesprit flew out of Verity Cavern the moment you entered, and has been roaming Sinnoh ever since. Today, on Route 222, it stops."),
        ], post: [L("narr", "Gotcha! Mesprit, the Being of Emotion, was caught!")] },
      ] },
    { id: "c11", title: "Sunyshore City", env: "city", map: "sea", reward: { lmd: 14000, orundum: 600, thunderstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 222", lv: 40, env: "route", wild: 1, catch: "gastrodon", music: "siRoute209", waves: [WS("electabuzz:39", "chatot:38"), WS("floatzel:40", "gastrodon:40")], pre: [
          L("narr", "Route 222 runs along the beach to Sunyshore City. Fishermen line the shore, Electabuzz roam the grass, and Gastrodon ooze along the tideline."),
        ], post: [L("narr", "Gotcha! Gastrodon was caught! The ones on this side of Mt. Coronet are blue.")] },
        { id: "a1", type: "side", name: "Route 223: Mantyke", lv: 19, env: "sea", wild: 1, catch: "mantyke", music: "siSurf", waves: [WS("tentacool:19", "wingull:19"), WS("mantyke:19!")], pre: [
          L("narr", "Out at sea on Route 223, a small Mantyke glides over the waves, looking for a Remoraid to swim with."),
        ], post: [L("narr", "Gotcha! Mantyke was caught!")] },
        { id: "b", type: "story", name: "Vista Lighthouse", music: "siSunyshore", pre: [
          L("narr", "Sunyshore City runs on solar panels, laid out like walkways. Its Gym Leader built them."),
          L("flint", "You're the challenger? Good. Volkner's bored. Nobody's beaten him in ages, so he's stopped caring. Go wake him up. He's at the lighthouse."),
          L("volkner", "...A challenger. Fine. I'll be at the Gym. I hope you're strong enough to make this interesting."),
        ] },
        { id: "c", type: "battle", name: "Sunyshore Gym: Ace Trainer Destiny", lv: 48, env: "gym", music: "siSunyshore", trainer: TR("Ace Trainer Destiny", "si_acetrainerf", "The gears turn to open the path. Can you keep up?", "You kept up... and then some."),
          waves: [WS("electabuzz:47", "raichu:48")] },
        { id: "d", type: "boss", name: "Volkner, the Shining, Shocking Star", reward: { tm: [tmId("chargebeam", 4), tmId("waterfall", 4) /* from Jasmine */] }, lv: 50, env: "plant", badgeWin: 7,
          trainer: TR("Leader Volkner", "si_volkner", "I'm Volkner, the Sunyshore Gym Leader. ...Show me a battle that gives me a jolt.", "...You did it. That's the first battle in years I've enjoyed. The Beacon Badge is yours.", "ultra"),
          waves: [WS("jolteon:46+", "raichu:46+"), WS("luxray:48+", "electivire:50!@sitrusberry")], pre: [
          L("volkner", "I've been the strongest Leader for so long, I forgot what a battle feels like. Remind me."),
          L("narr", "Ground moves stop Electric types cold. Electivire can stop Electric moves too: its Motor Drive turns them into speed."),
        ], post: [
          L("volkner", "Take Charge Beam too. ...Thanks. I'd forgotten why I became a Trainer."),
          L("sjasmine", "You beat Volkner? Then please, take this HM. Waterfall. I came from Johto to see the sea here... and a battle like that. The Pokémon League is past Victory Road."),
        ] },
      ] },
    { id: "c12", title: "The Pokémon League", env: "plateau", map: "plateau", reward: { lmd: 20000, orundum: 1500, permit: 10 },
      nodes: [
        { id: "a", type: "battle", name: "Victory Road", lv: 43, env: "cave", wild: 1, catch: "gabite", music: "siVictory", waves: [WS("rhydon:41", "magneton:41"), WS("gabite:43!", "golbat:41")], pre: [
          L("narr", "Victory Road is a cave of waterfalls and cliffs: you need every HM you have. Only Trainers with eight Badges may pass."),
        ], post: [L("narr", "Gotcha! Gabite was caught! It hoards shiny things in its nest.")] },
        { id: "b", type: "battle", name: "Victory Road: Ace Trainer Omar", lv: 48, env: "cave", music: "siVictory", trainer: TR("Ace Trainer Omar", "si_acetrainer", "Everyone on Victory Road wants to be Champion. So do I!", "Then... it's you."),
          waves: [WS("mamoswine:45", "mothim:46", "rampardos:48")] },
        // (Brilliant Diamond/Shining Pearl's team: the stronger one, by head-to-head battles; it follows your starter)
        { id: "c", type: "battle", name: "Pokémon League: Barry", lv: 55, env: "plateau", music: "siLeague", get trainer() { return barryTR("Here you are. I knew you'd come. Battle me before the Elite Four. I've got something to prove!", "...I lost. But I'm not sad! It means I've still got room to grow. Go on. Win it all!"); },
          rivalWaves: () => ({ turtwig: [WS("staraptor:49@focussash", "floatzel:49@quickclaw", "heracross:51"), WS("roserade:49@bigroot", "snorlax:52", "infernape:55!@expertbelt")],
            chimchar: [WS("staraptor:49@focussash", "roserade:49@bigroot", "heracross:51"), WS("rapidash:49@expertbelt", "snorlax:52", "empoleon:55!@quickclaw")],
            piplup: [WS("staraptor:49@focussash", "floatzel:49@quickclaw", "heracross:51"), WS("rapidash:49@expertbelt", "snorlax:52", "torterra:55!@leftovers")] })[sinnohStarter()], pre: [
          L("barry", "I've been training since Lake Acuity. Not to beat you. To be strong enough to protect the people I care about. ...But I still want to beat you!"),
        ] },
        { id: "d", type: "boss", name: "Elite Four Aaron", lv: 53, env: "plateau", music: "siE4Appear",
          trainer: TR("Elite Four Aaron", "si_aaron", "I'm Aaron of the Elite Four. I love Bug Pokémon. They're beautiful, and they're strong. Let me show you!", "I lost with the Bugs I love... I'll train harder. Go on, the next one's waiting.", "ultra"),
          waves: [WS("yanmega:49", "scizor:49", "vespiquen:50"), WS("heracross:51", "drapion:53!@sitrusberry")], pre: [
          L("aaron", "Bug Pokémon fight with everything they have. That's why I love them. And that's why I won't lose!"),
        ] },
        { id: "e", type: "boss", name: "Elite Four Bertha", lv: 55, env: "plateau", music: "siE4Appear",
          trainer: TR("Elite Four Bertha", "si_bertha", "Well, hello there. I'm Bertha of the Elite Four. My Ground Pokémon and I won't go easy on you, dearie.", "My, my. You're quite something. Go on: the next room is waiting.", "ultra"),
          waves: [WS("whiscash:50", "gliscor:53", "hippowdon:52"), WS("golem:52", "rhyperior:55!@sitrusberry")], pre: [
          L("bertha", "Let's have a nice, friendly battle, shall we? Ahahaha!"),
        ] },
        { id: "f", type: "boss", name: "Elite Four Flint", lv: 57, env: "volcano", music: "siE4Appear", weather: "sun",
          trainer: TR("Elite Four Flint", "si_flint", "I'm Flint of the Elite Four! You woke Volkner up, didn't you? Then let's burn this place down!", "...Whoa. My fire's out. You're a blaze yourself!", "ultra"),
          waves: [WS("houndoom:52", "flareon:55", "rapidash:53"), WS("infernape:55", "magmortar:57!@sitrusberry")], pre: [
          L("flint", "My Fire Pokémon and I burn hot! Let's see if you can take the heat!"),
          L("narr", "The sun blazes in Flint's room: Fire moves are 50% stronger, Water moves weaker."),
        ] },
        { id: "g", type: "boss", name: "Elite Four Lucian", lv: 63, env: "plateau", music: "siE4Appear",
          trainer: TR("Elite Four Lucian", "si_lucian", "...Ah, I've been reading. I'm Lucian of the Elite Four. My Psychic Pokémon will see through you.", "I underestimated you. Go on: the Champion is waiting. She is... stronger than I am.", "ultra"),
          waves: [WS("mrmime:59@lightclay", "girafarig:59@mentalherb", "medicham:60@muscleband"), WS("alakazam:60@lifeorb", "bronzong:63!@sitrusberry")], pre: [
          L("lucian", "A battle is like a book. I'd like to read the next chapter of yours."),
        ] },
        { id: "h", type: "boss", name: "Champion Cynthia", lv: 66, env: "plateau", champion: 1,
          trainer: TR("Champion Cynthia", "si_cynthia", "I'm Cynthia, the Champion. Thank you, for Mt. Coronet and for the Distortion World. Now: as the Champion, I accept your challenge!", "...That was wonderful. Congratulations. You're the new Sinnoh League Champion!", "master"),
          waves: [WS("spiritomb:61@sitrusberry", "roserade:60@expertbelt", "gastrodon:60@leftovers"), WS("lucario:63@wiseglasses", "milotic:63@flameorb", "garchomp:66!@yacheberry")], pre: [
          L("cynthia", "Something about you draws Pokémon to your side. I can feel it. Let's battle, with everything we have!"),
        ], post: [
          L("rowan", "Hm! You've done it. Your Pokédex, your partners, all of it. I'm proud to have given you your first Pokémon."),
          L("cynthia", "Come with me: your partners will be recorded in the Hall of Fame."),
          L("narr", "Your Sinnoh Pokémon are entered into the Hall of Fame. Their level cap keeps rising with the rest of your Journey, and lifts to Lv 100 once it's done."),
        ] },
      ] },
    { id: "c13", title: "The Battle Zone and Spear Pillar", env: "volcano", map: "volcano", reward: { orundum: 2000, permit: 10, rec4: 5 },
      nodes: [
        { id: "a", type: "story", name: "The National Pokédex", music: "siLab", pre: [
          L("narr", "Back in Sandgem, Professor Rowan has a visitor from Kanto: Professor Oak, who upgrades your Pokédex to list every Pokémon there is."),
          L("cynthia", "Barry's gone north to Snowpoint, to take a ship to the Battle Zone. You should go too. People grow there, together. No one should end up alone, like Cyrus."),
        ] },
        { id: "b", type: "battle", name: "Fight Area: Flint & Volkner", lv: 58, env: "city", music: "siFightArea", trainer: TR("Elite Four Flint & Leader Volkner", "si_flint", "You and Barry against the two of us? This'll be fun! Volkner, wake up!", "Heh! You two are a good team. Go on in!", "ultra"),
          waves: [WS("houndoom:56", "flareon:56", "magmortar:58!@sitrusberry"), WS("luxray:56", "jolteon:56", "electivire:58!@sitrusberry")], pre: [
          L("barry", "The Battle Frontier! The strongest Trainers in the world! ...But Flint and Volkner won't let me in without a battle. Help me out!"),
        ], post: [
          L("palmer", "Ho! You're Barry's friend? I'm his father, Palmer. I run the Battle Tower here. You battle well. Come visit sometime!"),
          L("buck", "Heh! I'm Buck. You're strong, huh? Something's going on at Stark Mountain. Come and see, if you dare!"),
        ] },
        { id: "c", type: "battle", name: "Route 225: Pokémon Ranger Dwayne", lv: 54, env: "route", music: "siRoute225", trainer: TR("Pokémon Ranger Dwayne", "si_ranger", "The Battle Zone's routes are wild and tough. Rangers like me keep watch out here!", "You don't need watching, that's for sure."),
          waves: [WS("donphan:54", "skarmory:54", "golduck:54")] },
        { id: "d", type: "boss", name: "Stark Mountain: Commander Mars", lv: 60, env: "volcano", music: "siStark", trainer: TR("Commander Mars", "si_mars", "You again? Team Galactic's still around, you know. Charon's in charge now. I don't like it, but here I am!", "...I give up. Team Galactic's no fun without the Boss.", "great"),
          waves: [WS("bronzong:58", "golbat:58", "purugly:60!@sitrusberry")], pre: [
          L("narr", "Stark Mountain smokes at the far end of the Battle Zone. Two Grunts at the entrance say Charon now leads what's left of Team Galactic."),
        ] },
        { id: "e", type: "boss", name: "Stark Mountain: Commander Jupiter", lv: 60, env: "volcano", music: "siStark", trainer: TR("Commander Jupiter", "si_jupiter", "Mars lost already? Then it's my turn. I'll do this one properly.", "Hmph. You know what, I'm done too. Let's go look for the Boss's world, Mars.", "great"),
          waves: [WS("bronzong:58", "golbat:58", "skuntank:60!@sitrusberry")], post: [
          L("narr", "Mars and Jupiter walk away from Team Galactic for good, to find the Distortion World and Cyrus."),
        ] },
        { id: "f", type: "story", name: "Stark Mountain: the Magma Stone", music: "siLooker", pre: [
          L("buck", "Mars and Jupiter are gone? Then let's head in. Claydol and I will battle beside you, all the way to the bottom!"),
          L("charon", "Heh heh heh! The Magma Stone! With it, Heatran and this volcano will obey me, and the world will pay me to keep it quiet!"),
          L("looker", "I think not! Croagunk, take the stone! Charon, you are under arrest. Team Galactic is finished. Truly, this time."),
          L("buck", "Wow. Looker's the real deal. I'll put the Magma Stone back. Talk to my grandpa: he knows the old story of this mountain."),
        ] },
        { id: "g", type: "side", name: "Stark Mountain: Heatran", lv: 70, env: "volcano", weather: "sun", wild: 1, catch: "heatran", waves: [WS("heatran:70!")], music: "siStark", pre: [
          L("narr", "With the Magma Stone back in its place, the heat deep in Stark Mountain rises. Heatran crawls out of the lava, its feet cutting into the rock."),
        ], post: [L("narr", "Gotcha! Heatran was caught! Its blood boils like magma.")] },
        { id: "h", type: "side", name: "Fullmoon Island: Cresselia", reward: { key: "si_lunarwing" }, lv: 50, env: "forest", wild: 1, catch: "cresselia", music: "siForest", waves: [WS("cresselia:50!")], pre: [
          L("narr", "A sailor's son in Canalave can't wake from his nightmares. On Fullmoon Island, a Pokémon glowing like the crescent moon waits by the lake."),
        ], post: [L("narr", "Gotcha! Cresselia was caught! Its Lunar Wing chases nightmares away, and the boy wakes up smiling.")] },
        { id: "j", type: "side", name: "Ramanas Park: the Discovery Room", lv: 70, env: "cave", wild: 1, catch: "regirock", music: "siRamanas", waves: [WS("regirock:70!")], pre: [
          L("narr", "On Route 221, where Pal Park stood, Ramanas Park has opened: a garden for Trainers with the National Pokédex. Its rooms hold Legendary Pokémon, and a Slate placed on a room's pedestal calls them."),
          L("narr", "The Discovery Slate glows in the first room. A Pokémon made of rocks from all over the world steps out of the light: Regirock."),
        ], post: [L("narr", "Gotcha! Regirock was caught!")] },
        { id: "k", type: "side", name: "Ramanas Park: Regice", lv: 70, env: "ice", wild: 1, catch: "regice", music: "siRamanas", waves: [WS("regice:70!")], pre: [
          L("narr", "The Discovery Slate glows again. Regice, whose body is ice from the Ice Age, appears in the cold that follows."),
        ], post: [L("narr", "Gotcha! Regice was caught!")] },
        { id: "l", type: "side", name: "Ramanas Park: Registeel", lv: 70, env: "cave", wild: 1, catch: "registeel", music: "siRamanas", waves: [WS("registeel:70!")], pre: [
          L("narr", "A third time, the Discovery Slate glows: Registeel, its body harder than any known metal."),
        ], post: [L("narr", "Gotcha! Registeel was caught!")] },
        { id: "i", type: "side", name: "Snowpoint Temple: Regigigas", lv: 70, env: "ice", wild: 1, catch: "regigigas", music: "siForest", waves: [WS("regigigas:70!")], pre: [
          L("candice", "The guard won't let you into the temple? Hm! Then I'll vouch for you. You're the Champion now!"),
          L("narr", "At the bottom of Snowpoint Temple sits a colossal statue. With the Regirock, Regice and Registeel from Ramanas Park beside you, it begins to move: Regigigas, which towed the continents into place."),
        ], post: [L("narr", "Gotcha! Regigigas was caught!")] },
        { id: "m", type: "side", name: "Ramanas Park: the Kanto Room (Articuno)", lv: 70, env: "ice", wild: 1, catch: "articuno", music: "siRamanas", waves: [WS("articuno:70!")], pre: [
          L("narr", "With the giants caught, the park's cashier sells the Kanto Slate, a Shining Pearl one. In the Kanto Room, snow begins to fall indoors: Articuno."),
        ], post: [L("narr", "Gotcha! Articuno was caught!")] },
        { id: "n", type: "side", name: "Ramanas Park: the Kanto Room (Zapdos)", lv: 70, env: "plant", wild: 1, catch: "zapdos", music: "siRamanas", waves: [WS("zapdos:70!")], pre: [
          L("narr", "The Kanto Slate crackles. Zapdos arrives in a flash of lightning."),
        ], post: [L("narr", "Gotcha! Zapdos was caught!")] },
        { id: "o", type: "side", name: "Ramanas Park: the Kanto Room (Moltres)", lv: 70, env: "volcano", wild: 1, catch: "moltres", music: "siRamanas", waves: [WS("moltres:70!")], pre: [
          L("narr", "The Kanto Slate burns hot. Moltres spreads its wings of fire."),
        ], post: [L("narr", "Gotcha! Moltres was caught!")] },
        { id: "m1", type: "side", name: "Ramanas Park: the Johto Room (Raikou)", lv: 70, env: "route", wild: 1, catch: "raikou", music: "siRamanas", waves: [WS("raikou:70!")], pre: [
          L("narr", "The Johto Slate, a Brilliant Diamond one, opens the Johto Room. Thunder rolls: Raikou."),
        ], post: [L("narr", "Gotcha! Raikou was caught!")] },
        { id: "m2", type: "side", name: "Ramanas Park: the Johto Room (Entei)", lv: 70, env: "volcano", wild: 1, catch: "entei", music: "siRamanas", waves: [WS("entei:70!")], pre: [
          L("narr", "The Johto Slate glows red. Entei stands in a ring of flame."),
        ], post: [L("narr", "Gotcha! Entei was caught!")] },
        { id: "m3", type: "side", name: "Ramanas Park: the Johto Room (Suicune)", lv: 70, env: "sea", wild: 1, catch: "suicune", music: "siRamanas", waves: [WS("suicune:70!")], pre: [
          L("narr", "The Johto Slate glows blue. Suicune runs across the water toward you."),
        ], post: [L("narr", "Gotcha! Suicune was caught!")] },
        { id: "m4", type: "side", name: "Ramanas Park: the Soul Room (Latias)", lv: 70, env: "route", wild: 1, catch: "latias", music: "siRamanas", waves: [WS("latias:70!")], pre: [
          L("narr", "The Soul Slate opens the Soul Room. A red shape, glittering with down, darts out of nowhere: Latias."),
        ], post: [L("narr", "Gotcha! Latias was caught!")] },
        { id: "m5", type: "side", name: "Ramanas Park: the Soul Room (Latios)", lv: 70, env: "route", wild: 1, catch: "latios", music: "siRamanas", waves: [WS("latios:70!")], pre: [
          L("narr", "The Soul Slate glows again. Latios folds its arms and flies to meet you."),
        ], post: [L("narr", "Gotcha! Latios was caught!")] },
        { id: "m6", type: "side", name: "Ramanas Park: the Rainbow Room (Ho-Oh)", lv: 70, env: "tower", weather: "sun", wild: 1, catch: "hooh", music: "siRamanas", waves: [WS("hooh:70!")], pre: [
          L("narr", "With the three beasts caught, the Rainbow Slate (Brilliant Diamond's) opens the Rainbow Room. Ho-Oh lands in a shower of rainbow light."),
        ], post: [L("narr", "Gotcha! Ho-Oh was caught!")] },
        { id: "m7", type: "side", name: "Ramanas Park: the Squall Room (Lugia)", lv: 70, env: "sea", weather: "rain", wild: 1, catch: "lugia", music: "siRamanas", waves: [WS("lugia:70!")], pre: [
          L("narr", "With the three birds caught, the Squall Slate (Shining Pearl's) opens the Squall Room. Wind howls, and Lugia rises."),
        ], post: [L("narr", "Gotcha! Lugia was caught!")] },
        { id: "m8", type: "side", name: "Ramanas Park: the Genome Room (Mewtwo)", lv: 70, env: "cave", wild: 1, catch: "mewtwo", music: "siRamanas", waves: [WS("mewtwo:70!")], pre: [
          L("narr", "The Genome Slate opens the Genome Room. Mewtwo, made from Mew's genes, floats at its center with its eyes closed."),
        ], post: [L("narr", "Gotcha! Mewtwo was caught!")] },
        { id: "m9", type: "side", name: "Ramanas Park: the Oceanic Room (Kyogre)", lv: 70, env: "sea", weather: "rain", wild: 1, catch: "kyogre", music: "siRamanas", waves: [WS("kyogre:70!")], pre: [
          L("narr", "With Surf, the Oceanic Room's water opens up. The Oceanic Slate calls Kyogre up from the deep."),
        ], post: [L("narr", "Gotcha! Kyogre was caught!")] },
        { id: "m10", type: "side", name: "Ramanas Park: the Tectonic Room (Groudon)", lv: 70, env: "volcano", weather: "sun", wild: 1, catch: "groudon", music: "siRamanas", waves: [WS("groudon:70!")], pre: [
          L("narr", "The Tectonic Slate shakes the Tectonic Room. Groudon breaks through the floor in a blaze of heat."),
        ], post: [L("narr", "Gotcha! Groudon was caught!")] },
        { id: "m11", type: "side", name: "Ramanas Park: the Stratospheric Room (Rayquaza)", lv: 70, env: "plateau", wild: 1, catch: "rayquaza", music: "siRamanas", waves: [WS("rayquaza:70!")], pre: [
          L("narr", "The Stratospheric Slate opens onto an empty sky. Rayquaza coils down out of it."),
        ], post: [L("narr", "Gotcha! Rayquaza was caught!")] },
        { id: "o1", type: "side", name: "Turnback Cave: Giratina", lv: 70, env: "cave", wild: 1, catch: "giratina", music: "siChateau", waves: [WS("giratina:70!")], pre: [
          L("narr", "Past Sendoff Spring, Turnback Cave loops back on itself room after room. Beyond three pillars, a shadow waits in the form Giratina takes in our world."),
        ], post: [L("narr", "Gotcha! Giratina was caught, in its Altered Forme!")] },
        { id: "o2", type: "side", name: "Ramanas Park: the Distortion Room", reward: { held: "griseousorb" }, lv: 100, env: "tower", wild: 1, music: "siDistortion", waves: [WS("giratinaorigin:100!")], pre: [
          L("narr", "With the giants and Giratina caught, the Distortion Slate opens the park's last room. Inside is the Distortion World itself, and Giratina in its Origin Forme, stronger than anything you've faced."),
          L("narr", "This one can't be caught. It can only be beaten."),
        ], post: [L("narr", "Giratina sinks back into its world. Where it stood lies a glowing golden orb: the Griseous Orb.")] },
        { id: "o3", type: "side", name: "Grand Underground: Swampy Cave", lv: 60, env: "forest", wild: 1, catch: "tangrowth", music: "siUnderground", waves: [WS("quagsire:58", "whiscash:59"), WS("tangrowth:60!")], pre: [
          L("narr", "Since the National Pokédex, new Pokémon have come into the Grand Underground. In the Swampy Cave, a mass of vines is dragging itself through the mud: Tangrowth."),
        ], post: [L("narr", "Gotcha! Tangrowth was caught! Its vines grow back as fast as they're cut.")] },
        { id: "o4", type: "side", name: "Newmoon Island: Darkrai", reward: { key: "si_membercard" }, lv: 50, env: "forest", wild: 1, catch: "darkrai", music: "siChateau", waves: [WS("darkrai:50!")], pre: [
          L("narr", "With a Member Card, the Harbor Inn in Canalave lets you stay the night. You dream of an island no map shows, and in the morning the sailor's son says his old nightmares came from there: Newmoon Island."),
          L("narr", "At the heart of the island's dark forest, a shadow with one blue eye is waiting: Darkrai, which brings nightmares to those it touches."),
        ], post: [L("narr", "Gotcha! Darkrai was caught!")] },
        { id: "o5", type: "side", name: "Flower Paradise: Shaymin", reward: { key: "si_oaksletter" }, lv: 30, env: "forest", wild: 1, catch: "shaymin", music: "siFloaroma", waves: [WS("shaymin:30!")], pre: [
          L("oak", "I have a letter for you! Come to the north end of Route 224. Write something on the white rock there, and see what happens."),
          L("narr", "The rock opens a path along the sea to a field of flowers: Flower Paradise. A small hedgehog of a Pokémon peeks out of the blossoms."),
        ], post: [L("narr", "Gotcha! Shaymin was caught! It breaks down toxins in the air and turns them into flowers.")] },
        // (a side stage that's a gift, chest: 1: in Diamond, Pearl and Platinum the Manaphy Egg came from a Pokémon Ranger mission, picked
        // up from the Poké Mart's deliveryman; no version has a Manaphy to meet)
        { id: "o6", type: "side", chest: 1, name: "Poké Mart: the Manaphy Egg", reward: { op: "manaphy", lmd: 3000 }, music: "siMart", pre: [
          L("narr", "The deliveryman at the Poké Mart has a package for you. A Pokémon Ranger found an Egg on the seafloor, far out at sea, and sent it to a Trainer who would look after it."),
          L("narr", "The Egg is warm, and glows a faint blue. Before long it hatches: Manaphy, the Pokémon said to be born in the warm seas, and to bond with any Pokémon it meets."),
        ] },
        { id: "p", type: "story", name: "The Adamant and Lustrous Orbs", reward: { held: ["adamantorb", "lustrousorb"] }, music: "siCoronet", pre: [
          L("narr", "Behind a waterfall in Mt. Coronet you find two orbs: the Adamant Orb and the Lustrous Orb. Cynthia's grandmother turns them over in her hands."),
          L("grandma", "These belong to the Pokémon of time and space. Take them to Spear Pillar. They may answer you, now that the world is calm."),
        ] },
        { id: "q", type: "boss", name: "Spear Pillar: Dialga", lv: 70, env: "plateau", wild: 1, catch: "dialga", music: "siSpear", waves: [WS("dialga:70!")], pre: [
          L("narr", "At Spear Pillar, the Adamant Orb glows blue. Time seems to stop, and then start again. Dialga steps out of a rift in the air."),
        ], post: [L("narr", "Gotcha! Dialga was caught! It is said that time flows when its heart beats.")] },
        { id: "r", type: "boss", name: "Spear Pillar: Palkia", lv: 70, env: "plateau", wild: 1, catch: "palkia", music: "siSpear", waves: [WS("palkia:70!")], pre: [
          L("narr", "The Lustrous Orb glows pink. The space around Spear Pillar folds in on itself, and Palkia appears."),
        ], post: [
          L("narr", "Gotcha! Palkia was caught! Time and space are at peace."),
          L("narr", "You've done it: the Sinnoh Journey is complete."),
        ] },
        { id: "s", type: "side", name: "Hall of Origin: Arceus", reward: { key: "si_azureflute" }, lv: 80, env: "plateau", wild: 1, catch: "arceus", music: "siOrigin", waves: [WS("arceus:80!")], pre: [
          LJ("narr", "With Dialga and Palkia caught, you play the Azure Flute at Spear Pillar. A staircase of light rises into the sky, to the Hall of Origin.", "siAzure"),
          L("narr", "At its top waits the Pokémon said to have shaped the universe out of nothing, before time and space began: Arceus, the Original One."),
        ], post: [L("narr", "Gotcha! Arceus was caught!")] },
      ] },
  ],
};
STORY.push(SINNOH_JOURNEY);
indexJourney(SINNOH_JOURNEY);
// The Battle Tower's Sinnoh wing (TOWER_WING in a4_story.js; the owner's rule: every version's battle the Journey leaves out goes to
// the Tower): the weaker versions' teams for the Journey's battles (Platinum's or Diamond/Pearl's and BDSP's: the Journey takes the
// stronger), Team Galactic's other teams, Barry's other battles, BDSP's Gym Leader, Elite Four and Champion rematches, Platinum's
// Battleground and Survival Area, Palmer's Silver and Gold Prints, and BDSP's weekend battles with Dawn or Lucas. Teams that differ
// only in level are left out; Barry's, Dawn's and Lucas's follow your Sinnoh starter. The floors sort themselves by level.
// <tower-wing: generated from the canon sheets>
if (typeof TOWER_WING === "object") TOWER_WING.sinnoh = [
  { n: "Leader Gardenia", t: "si_gardenia", from: "Brilliant Diamond/Shining Pearl", waves: [WS("cherubi:19", "turtwig:19@miracleseed", "roserade:22!@sitrusberry")] },
  { n: "Leader Maylene", t: "si_maylene", from: "Brilliant Diamond/Shining Pearl", waves: [WS("meditite:27@lightclay", "machoke:27@expertbelt", "lucario:30!@bigroot")] },
  { n: "Leader Wake", t: "si_wake", from: "Brilliant Diamond/Shining Pearl", waves: [WS("gyarados:27@widelens", "quagsire:27@damprock", "floatzel:30!@sitrusberry")] },
  { n: "Leader Byron", t: "si_byron", from: "Brilliant Diamond/Shining Pearl", waves: [WS("bronzor:36", "steelix:36@softsand", "bastiodon:39!@sitrusberry")] },
  { n: "Leader Candice", t: "si_candice", from: "Brilliant Diamond/Shining Pearl", waves: [WS("snover:38@icyrock", "sneasel:38@chopleberry"), WS("medicham:40@expertbelt", "abomasnow:42!@sitrusberry")] },
  { n: "Leader Fantina", t: "si_fantina", from: "Platinum", waves: [WS("duskull:24", "haunter:24", "mismagius:26!@sitrusberry")] },
  { n: "Leader Volkner", t: "si_volkner", from: "Brilliant Diamond/Shining Pearl", waves: [WS("raichu:46@shucaberry", "ambipom:47@chopleberry"), WS("octillery:47@expertbelt", "luxray:49!@sitrusberry")] },
  { n: "Elite Four Aaron", t: "si_aaron", from: "Brilliant Diamond/Shining Pearl", waves: [WS("dustox:53@blacksludge", "beautifly:53@wiseglasses", "vespiquen:54@sitrusberry"), WS("heracross:54@flameorb", "drapion:57!@scopelens")] },
  { n: "Elite Four Bertha", t: "si_bertha", from: "Brilliant Diamond/Shining Pearl", waves: [WS("quagsire:55@leftovers", "sudowoodo:56@sitrusberry", "golem:56@softsand"), WS("whiscash:55@rindoberry", "hippowdon:59!@chestoberry")] },
  { n: "Elite Four Flint", t: "si_flint", from: "Brilliant Diamond/Shining Pearl", waves: [WS("rapidash:58@widelens", "steelix:57@lifeorb", "drifblim:58@sitrusberry"), WS("lopunny:57@leftovers", "infernape:61!@focussash")] },
  { n: "Elite Four Lucian", t: "si_lucian", from: "Platinum", waves: [WS("mrmime:53", "espeon:55", "bronzong:54"), WS("alakazam:56", "gallade:59!@sitrusberry")] },
  { n: "Champion Cynthia", t: "si_cynthia", from: "Platinum", waves: [WS("spiritomb:58", "roserade:58", "togekiss:60"), WS("lucario:60", "milotic:58", "garchomp:62!@sitrusberry")] },
  { n: "Commander Saturn", t: "si_saturn", from: "Diamond/Pearl", waves: [WS("kadabra:35", "bronzor:35", "toxicroak:37!@sitrusberry")] },
  { n: "Commander Saturn", t: "si_saturn", from: "Diamond/Pearl", waves: [WS("kadabra:38", "bronzor:38", "toxicroak:40!@sitrusberry")] },
  { n: "Galactic Boss Cyrus", t: "si_cyrus", from: "Brilliant Diamond/Shining Pearl", waves: [WS("murkrow:40", "golbat:40", "sneasel:43!@sitrusberry")] },
  { n: "Galactic Boss Cyrus", t: "si_cyrus", from: "Brilliant Diamond/Shining Pearl", waves: [WS("honchkrow:45@scopelens", "crobat:46@quickclaw"), WS("gyarados:45@wacanberry", "weavile:48!@chopleberry")] },
  { n: "Barry", t: "si_barry", from: "Brilliant Diamond/Shining Pearl", waves: () => ({ turtwig: [WS("starly:19", "buizel:20"), WS("roselia:20", "monferno:21!")], chimchar: [WS("starly:19", "ponyta:20"), WS("roselia:20", "prinplup:21!")], piplup: [WS("starly:19", "buizel:20"), WS("ponyta:20", "grotle:21!")] })[sinnohStarter()] },
  { n: "Barry", t: "si_barry", from: "Brilliant Diamond/Shining Pearl", waves: () => ({ turtwig: [WS("starly:26@quickclaw", "buizel:26@seaincense"), WS("roselia:27@miracleseed", "monferno:31!@shellbell")], chimchar: [WS("starly:26@quickclaw", "ponyta:27@shellbell"), WS("roselia:27@miracleseed", "prinplup:31!@seaincense")], piplup: [WS("starly:26@quickclaw", "buizel:26@seaincense"), WS("ponyta:27@shellbell", "grotle:31!@miracleseed")] })[sinnohStarter()] },
  { n: "Barry", t: "si_barry", from: "Brilliant Diamond/Shining Pearl", waves: () => ({ turtwig: [WS("staravia:32@quickclaw", "buizel:33@seaincense", "heracross:32"), WS("roselia:34@bigroot", "monferno:37!@shellbell")], chimchar: [WS("staravia:32@quickclaw", "roselia:34@bigroot", "heracross:32"), WS("ponyta:34@shellbell", "prinplup:37!@seaincense")], piplup: [WS("staravia:32@quickclaw", "buizel:33@seaincense", "heracross:32"), WS("ponyta:34@shellbell", "grotle:37!@bigroot")] })[sinnohStarter()] },
  { n: "Barry", t: "si_barry", from: "Platinum", waves: () => ({ turtwig: [WS("staraptor:48", "heracross:48", "snorlax:49"), WS("floatzel:47", "roserade:47", "infernape:51!@sitrusberry")], chimchar: [WS("staraptor:48", "heracross:48", "snorlax:49"), WS("roserade:47", "rapidash:47", "empoleon:51!@sitrusberry")], piplup: [WS("staraptor:48", "heracross:48", "snorlax:49"), WS("rapidash:47", "floatzel:47", "torterra:51!@sitrusberry")] })[sinnohStarter()] },
  { n: "Barry", t: "si_barry", from: "Platinum's Survival Area", waves: () => ({ turtwig: [WS("staraptor:61", "floatzel:59", "roserade:59"), WS("heracross:61", "snorlax:63", "infernape:65!@sitrusberry")], chimchar: [WS("staraptor:61", "roserade:59", "rapidash:59"), WS("heracross:61", "snorlax:63", "empoleon:65!@sitrusberry")], piplup: [WS("staraptor:61", "rapidash:59", "floatzel:59"), WS("heracross:61", "snorlax:63", "torterra:65!@sitrusberry")] })[sinnohStarter()] },
  { n: "Barry", t: "si_barry", from: "Platinum's Survival Area, after 20 Hall of Fame entries", waves: () => ({ turtwig: [WS("staraptor:81", "floatzel:79", "roserade:79"), WS("heracross:81", "snorlax:83", "infernape:85!@sitrusberry")], chimchar: [WS("staraptor:81", "roserade:79", "rapidash:79"), WS("heracross:81", "snorlax:83", "empoleon:85!@sitrusberry")], piplup: [WS("staraptor:81", "rapidash:79", "floatzel:79"), WS("heracross:81", "snorlax:83", "torterra:85!@sitrusberry")] })[sinnohStarter()] },
  { n: "Leader Roark", t: "si_roark", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("tyranitar:68@smoothrock", "aerodactyl:66@scopelens", "armaldo:70@sitrusberry"), WS("probopass:68@focussash", "relicanth:64@choiceband", "rampardos:72!@lifeorb")] },
  { n: "Leader Gardenia", t: "si_gardenia", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("jumpluff:66@heatrock", "sunflora:70@choicescarf", "cherrim:69@focussash"), WS("breloom:68@toxicorb", "torterra:68@lifeorb", "roserade:72!")] },
  { n: "Leader Maylene", t: "si_maylene", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("hitmontop:64@expertbelt", "breloom:66@lifeorb", "heracross:68@flameorb"), WS("infernape:70@whiteherb", "medicham:72@choiceband", "lucario:74!@focussash")] },
  { n: "Leader Wake", t: "si_wake", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("politoed:68@damprock", "kingdra:68@chestoberry", "ludicolo:68@sitrusberry"), WS("huntail:70@focussash", "gyarados:70@wacanberry", "floatzel:72!@lifeorb")] },
  { n: "Leader Fantina", t: "si_fantina", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("drifblim:68@flameorb", "banette:65@ironball", "dusknoir:70@sitrusberry"), WS("mismagius:70@expertbelt", "froslass:72@focussash", "gengar:72!@lifeorb")] },
  { n: "Leader Byron", t: "si_byron", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("skarmory:69@leftovers", "steelix:69@lifeorb", "magnezone:70@focussash"), WS("empoleon:70@expertbelt", "bastiodon:72!@lumberry")] },
  { n: "Leader Candice", t: "si_candice", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("abomasnow:68@icyrock", "jynx:70@focussash", "mamoswine:68@expertbelt"), WS("froslass:70@sitrusberry", "glaceon:70@leftovers", "weavile:72!@lifeorb")] },
  { n: "Leader Volkner", t: "si_volkner", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("pelipper:70@damprock", "raichu:70@choicescarf", "luxray:70@focussash"), WS("lanturn:66@expertbelt", "jolteon:68@toxicorb", "electivire:75!@lifeorb")] },
  { n: "Elite Four Aaron", t: "si_aaron", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("yanmega:65@wiseglasses", "scizor:65@occaberry", "vespiquen:66@sitrusberry"), WS("heracross:67@flameorb", "drapion:69!@scopelens")] },
  { n: "Elite Four Aaron", t: "si_aaron", from: "Brilliant Diamond/Shining Pearl rematch, after Stark Mountain", waves: [WS("yanmega:75@wiseglasses", "scizor:75@occaberry", "vespiquen:77@sitrusberry"), WS("heracross:77@flameorb", "flygon:75@wiseglasses", "drapion:79!@scopelens")] },
  { n: "Elite Four Bertha", t: "si_bertha", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("whiscash:66@rindoberry", "gliscor:69@sitrusberry", "golem:68@softsand"), WS("hippowdon:68@chestoberry", "rhyperior:71!@muscleband")] },
  { n: "Elite Four Bertha", t: "si_bertha", from: "Brilliant Diamond/Shining Pearl rematch, after Stark Mountain", waves: [WS("whiscash:76@rindoberry", "gliscor:79@sitrusberry", "nidoking:78@lifeorb"), WS("hippowdon:78@chestoberry", "mamoswine:78@nevermeltice", "rhyperior:81!@muscleband")] },
  { n: "Elite Four Flint", t: "si_flint", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("houndoom:68@wiseglasses", "flareon:71@sitrusberry", "rapidash:69@widelens"), WS("infernape:71@focussash", "magmortar:73!@lumberry")] },
  { n: "Elite Four Flint", t: "si_flint", from: "Brilliant Diamond/Shining Pearl rematch, after Stark Mountain", waves: [WS("ninetales:78@heatrock", "houndoom:78@wiseglasses", "rapidash:79@widelens"), WS("infernape:81@focussash", "arcanine:81@shucaberry", "magmortar:83!@sitrusberry")] },
  { n: "Elite Four Lucian", t: "si_lucian", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("mrmime:69@lightclay", "espeon:71@mentalherb", "bronzong:70@muscleband"), WS("alakazam:72@lifeorb", "gallade:75!@sitrusberry")] },
  { n: "Elite Four Lucian", t: "si_lucian", from: "Brilliant Diamond/Shining Pearl rematch, after Stark Mountain", waves: [WS("mrmime:79@lightclay", "espeon:81@mentalherb", "bronzong:80@muscleband"), WS("alakazam:82@lifeorb", "slowbro:82@leftovers", "gallade:85!@sitrusberry")] },
  { n: "Champion Cynthia", t: "si_cynthia", from: "Brilliant Diamond/Shining Pearl rematch", waves: [WS("spiritomb:74@sitrusberry", "roserade:74@expertbelt", "togekiss:76@leftovers"), WS("lucario:76@wiseglasses", "milotic:74@flameorb", "garchomp:78!@yacheberry")] },
  { n: "Champion Cynthia", t: "si_cynthia", from: "Brilliant Diamond/Shining Pearl rematch, after Stark Mountain", waves: [WS("spiritomb:84@sitrusberry", "porygonz:85@expertbelt", "togekiss:86@leftovers"), WS("lucario:86@focussash", "milotic:84@flameorb", "garchomp:88!@yacheberry")] },
  { n: "Leader Roark", t: "si_roark", from: "Platinum's Battleground", waves: [WS("aerodactyl:62", "probopass:61", "golem:61"), WS("rampardos:63", "tyranitar:65!@sitrusberry")] },
  { n: "Leader Gardenia", t: "si_gardenia", from: "Platinum's Battleground", waves: [WS("jumpluff:61", "cherrim:62", "bellossom:61"), WS("torterra:63", "roserade:65!@sitrusberry")] },
  { n: "Leader Fantina", t: "si_fantina", from: "Platinum's Battleground", waves: [WS("banette:61", "mismagius:63", "drifblim:61"), WS("dusknoir:62", "gengar:65!@sitrusberry")] },
  { n: "Leader Maylene", t: "si_maylene", from: "Platinum's Battleground", waves: [WS("hitmontop:62", "medicham:63", "breloom:62"), WS("machamp:64", "lucario:66!")] },
  { n: "Leader Wake", t: "si_wake", from: "Platinum's Battleground", waves: [WS("sharpedo:61", "quagsire:61", "floatzel:63"), WS("gyarados:62", "ludicolo:65!@sitrusberry")] },
  { n: "Leader Byron", t: "si_byron", from: "Platinum's Battleground", waves: [WS("skarmory:61", "magnezone:62", "steelix:61"), WS("bastiodon:63", "aggron:65!@sitrusberry")] },
  { n: "Leader Candice", t: "si_candice", from: "Platinum's Battleground", waves: [WS("weavile:62", "mamoswine:61", "abomasnow:61"), WS("froslass:63", "glaceon:65!@sitrusberry")] },
  { n: "Leader Volkner", t: "si_volkner", from: "Platinum's Battleground", waves: [WS("jolteon:61", "raichu:61", "luxray:62"), WS("lanturn:63", "electivire:65!@sitrusberry")] },
  { n: "Cheryl", t: "si_cheryl", from: "Platinum's Battleground", waves: [WS("wobbuffet:61", "drifblim:61", "hariyama:62"), WS("wailord:63", "blissey:65!@sitrusberry")] },
  { n: "Mira", t: "si_mira", from: "Platinum's Battleground", waves: [WS("porygonz:61", "gengar:61", "magnezone:62"), WS("togekiss:63", "alakazam:65!@sitrusberry")] },
  { n: "Riley", t: "si_riley", from: "Platinum's Battleground", waves: [WS("absol:61", "ursaring:61", "metagross:62"), WS("salamence:63", "lucario:65!@sitrusberry")] },
  { n: "Marley", t: "si_marley", from: "Platinum's Battleground", waves: [WS("ninjask:61", "electrode:61", "crobat:62"), WS("weavile:63", "arcanine:65!@sitrusberry")] },
  { n: "Buck", t: "si_buck", from: "Platinum's Battleground", waves: [WS("shuckle:61", "umbreon:62", "torkoal:61"), WS("dusknoir:63", "claydol:65!@sitrusberry")] },
  { n: "Tower Tycoon Palmer", t: "si_palmer", from: "Platinum's Battle Tower (Silver Print)", bgm: "siFrontierBrain", winBgm: "siFrontierWin", waves: [WS("milotic:50@shellbell", "rhyperior:50@focusband", "dragonite:50!@lumberry")] },
  { n: "Tower Tycoon Palmer", t: "si_palmer", from: "Platinum's Battle Tower (Gold Print)", bgm: "siFrontierBrain", winBgm: "siFrontierWin", waves: [WS("regigigas:50@brightpowder", "heatran:50@focussash", "cresselia:50!@leftovers")] },
  { n: "Dawn", t: "si_dawn", from: "Brilliant Diamond/Shining Pearl, Sandgem Town", waves: () => ({ turtwig: [WS("wormadam:58", "tangrowth:59", "froslass:60"), WS("magmortar:59", "clefable:60", "empoleon:64!")], chimchar: [WS("wormadamtrash:58", "magmortar:59", "froslass:60"), WS("milotic:59", "clefable:60", "torterra:64!")], piplup: [WS("wormadamsandy:58", "milotic:59", "froslass:60"), WS("tangrowth:59", "clefable:60", "infernape:64!")] })[sinnohStarter()] },
  { n: "Lucas", t: "si_lucas", from: "Brilliant Diamond/Shining Pearl, Sandgem Town", waves: () => ({ turtwig: [WS("mothim:58", "magmortar:59", "gallade:63"), WS("tangrowth:59", "clefable:60", "empoleon:64!")], chimchar: [WS("mothim:58", "milotic:59", "gallade:63"), WS("magmortar:59", "clefable:60", "torterra:64!")], piplup: [WS("mothim:58", "tangrowth:59", "gallade:63"), WS("milotic:59", "clefable:60", "infernape:64!")] })[sinnohStarter()] },
  { n: "Dawn", t: "si_dawn", from: "Brilliant Diamond/Shining Pearl, Sandgem Town, after 10 Hall of Fame entries", waves: () => ({ turtwig: [WS("togekiss:68", "bellossom:69", "mamoswine:70"), WS("typhlosion:69", "lopunny:70", "empoleon:74!")], chimchar: [WS("crobat:68", "arcanine:69", "mrmime:70"), WS("blastoise:69", "lickilicky:70", "torterra:74!")], piplup: [WS("honchkrow:68", "gorebyss:69", "froslass:70"), WS("sceptile:69", "ambipom:70", "infernape:74!")] })[sinnohStarter()] },
  { n: "Lucas", t: "si_lucas", from: "Brilliant Diamond/Shining Pearl, Sandgem Town, after 10 Hall of Fame entries", waves: () => ({ turtwig: [WS("gliscor:68", "cradily:69", "glaceon:70"), WS("rotomheat:69", "tauros:70", "empoleon:74!")], chimchar: [WS("dusknoir:68", "flareon:69", "rampardos:70"), WS("rotomwash:69", "dunsparce:70", "torterra:74!")], piplup: [WS("absol:68", "kabutops:69", "espeon:70"), WS("rotommow:69", "porygonz:70", "infernape:74!")] })[sinnohStarter()] },
];
// </tower-wing>
