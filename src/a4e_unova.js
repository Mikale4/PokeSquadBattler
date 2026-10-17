// =====================================================================
//  UNOVA JOURNEY — two parts, both to be beaten (the owner's rule, 2026-10-15): Part 1 is Black/White's story (Cheren and Bianca, N
//  and Team Plasma, Reshiram, Alder), Part 2 Black 2/White 2's, two years later (Hugh, Neo Team Plasma, Colress, Kyurem, Champion Iris).
//  Each part has its own level caps, its own eight Gym Badges (PART_BADGES in a2_core.js) and its own starter (Part 2's from Bianca);
//  Part 2 opens once Part 1 is done, and the Unova Champion title, the Hall of Fame and the Journey's completion come in Part 2. Each
//  part's own post-game stays in it. Version exclusives are Black's and Black 2's (the owner's pick): in Black your dragon is Reshiram
//  and N's Zekrom, Opelucid's Leader is Drayden, and Black's wild Pokémon are the ones you meet. Every story battle takes its strongest
//  version's team; in Black 2/White 2 that's Challenge Mode's, at the levels it shows (the owner's pick). Dialogue is original.
//  Only Unova's Pokémon (Gen 5's) battle on your side here (journeyOk); its wild stages catch them.
//  Stage ids start with "un" (REGION_CODE in a4_story.js): un1-1, unS1-1, chapters unc1...; Part 2's chapters carry on the numbers.
// =====================================================================
PART_NAME.unova = ["Black/White", "Black 2/White 2"];
Object.assign(SPK, {
  ujuniper: { n: "Prof. Juniper", t: "un_juniper" }, umom: { n: "Mom", t: "un_mom" }, ucheren: { n: "Cheren", t: "un_cheren" }, ubianca: { n: "Bianca", t: "un_bianca" },
  un: { n: "N", t: "un_n" }, ughetsis: { n: "Ghetsis", t: "un_ghetsis" }, ugrunt: { n: "Team Plasma Grunt", t: "un_grunt" }, ugruntf: { n: "Team Plasma Grunt", t: "un_gruntf" },
  utriad: { n: "Shadow Triad", t: "un_shadow" }, usage: { n: "Sage" }, uzinzolin: { n: "Zinzolin", t: "un_zinzolin" }, urood: { n: "Rood", t: "un_rood" },
  ucilan: { n: "Cilan", t: "un_cilan" }, uchili: { n: "Chili", t: "un_chili" }, ucress: { n: "Cress", t: "un_cress" }, ulenora: { n: "Lenora", t: "un_lenora" },
  uburgh: { n: "Burgh", t: "un_burgh" }, uelesa: { n: "Elesa", t: "un_elesa" }, uclay: { n: "Clay", t: "un_clay" }, uskyla: { n: "Skyla", t: "un_skyla" },
  ubrycen: { n: "Brycen", t: "un_brycen" }, udrayden: { n: "Drayden", t: "un_drayden" }, uiris: { n: "Iris", t: "un_iris" },
  ushauntal: { n: "Shauntal", t: "un_shauntal" }, ugrimsley: { n: "Grimsley", t: "un_grimsley" }, ucaitlin: { n: "Caitlin", t: "un_caitlin" }, umarshal: { n: "Marshal", t: "un_marshal" },
  ualder: { n: "Alder", t: "un_alder" }, ufennel: { n: "Fennel", t: "un_fennel" }, ucedric: { n: "Cedric Juniper", t: "un_cedric" }, ulooker: { n: "Looker" },
  ucynthia: { n: "Cynthia", t: "un_cynthia" }, ubfather: { n: "Bianca's Father" }, uhiker: { n: "Hiker", t: "un_hiker" },
  // (Part 2's: two years later, Cheren, Elesa, Iris and Ghetsis have new looks, and the new Team Plasma new uniforms)
  uhugh: { n: "Hugh", t: "un_hugh" }, ucheren2: { n: "Cheren", t: "un_cheren2" }, uroxie: { n: "Roxie", t: "un_roxie" }, uelesa2: { n: "Elesa", t: "un_elesa2" },
  umarlon: { n: "Marlon", t: "un_marlon" }, uiris2: { n: "Iris", t: "un_iris2" }, ucolress: { n: "Colress", t: "un_colress" }, ughetsis2: { n: "Ghetsis", t: "un_ghetsis2" },
  ugrunt2: { n: "Team Plasma Grunt", t: "un_grunt2" }, ugruntf2: { n: "Team Plasma Grunt", t: "un_gruntf2" }, umom2: { n: "Mom", t: "un_mom2" }, ubenga: { n: "Benga", t: "un_benga" },
});
const WU = WG(5);
// The starters' lines; in Part 1 Cheren takes the starter strong against yours and Bianca the one weak to yours (Black/White), each
// with the elemental monkey of their own: Cheren's is your starter's type, Bianca's the type strong against it
const UNOVA_LINE = { snivy: ["snivy", "servine", "serperior"], tepig: ["tepig", "pignite", "emboar"], oshawott: ["oshawott", "dewott", "samurott"] };
const UNOVA_STRONG = { snivy: "tepig", tepig: "oshawott", oshawott: "snivy" }, UNOVA_WEAK = { snivy: "oshawott", tepig: "snivy", oshawott: "tepig" };
const MONKEY = { snivy: ["pansage", "simisage"], tepig: ["pansear", "simisear"], oshawott: ["panpour", "simipour"] };   // (the monkey of each starter's type)
const unovaStarter = () => { const k = regionStarter("unova"); return UNOVA_LINE[k] ? k : "snivy"; };
const cherenMon = st => UNOVA_LINE[UNOVA_STRONG[unovaStarter()]][st], biancaMon = st => UNOVA_LINE[UNOVA_WEAK[unovaStarter()]][st];
const cherenMonkey = (ev = 0) => MONKEY[unovaStarter()][ev], biancaMonkey = (ev = 0) => MONKEY[UNOVA_STRONG[unovaStarter()]][ev];
// the Striaton brother whose type beats your starter, and the Dreamyard's monkey that beats him (and the stone it evolves with)
const TRIO = { snivy: ["Chili", "un_chili", "pansear", "panpour", "waterstone"], tepig: ["Cress", "un_cress", "panpour", "pansage", "leafstone"], oshawott: ["Cilan", "un_cilan", "pansage", "pansear", "firestone"] };
const trio = () => TRIO[unovaStarter()];
const cherenTR = (intro, lose) => TR("Cheren", "un_cheren", intro, lose), biancaTR = (intro, lose) => TR("Bianca", "un_bianca", intro, lose);
const plasmaTR = (intro, lose, f) => TR("Team Plasma Grunts", f ? "un_gruntf" : "un_grunt", intro, lose);
const MONKEY_ITEM = { pansage: "miracleseed", pansear: "charcoal", panpour: "mysticwater" };
// Part 2 (Black 2/White 2): your own starter from Bianca (S.regions.unova.starter2; Part 1's until you choose one). Hugh takes the one
// strong against yours, and from the World Tournament on the monkey of the third type, neither yours nor his starter's
const unova2Starter = () => { const k = (myRegions().unova || {}).starter2 || regionStarter("unova"); return UNOVA_LINE[k] ? k : "snivy"; };
const hughMon = st => UNOVA_LINE[UNOVA_STRONG[unova2Starter()]][st], hughMonkey = (ev = 0) => MONKEY[UNOVA_WEAK[unova2Starter()]][ev];
const hughTR = (intro, lose) => TR("Hugh", "un_hugh", intro, lose);

const UNOVA_JOURNEY = {
  id: "unova", title: "Unova Journey", sub: "Two years, two stories",
  blurb: "Part 1: leave Nuvema Town with Cheren and Bianca, earn Unova's eight Gym Badges and stop N and Team Plasma. Part 2, two years later: a new partner, a new rival, eight new Badges, Neo Team Plasma and Champion Iris.",
  chapters: [
    // ======================== Part 1: Black/White ========================
    { id: "c1", part: 1, title: "Nuvema Town to Striaton City", env: "route", map: "route", reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Nuvema Town: Professor Juniper's Gift", env: "lab", starter: 1, pre: [
          L("narr", "Nuvema Town, in the far south of Unova. A box with a red ribbon has arrived in your room: a present from Professor Juniper."),
          L("ucheren", "There you are. Bianca's late, as usual. The Professor said we could each have a Pokémon, and you get to choose first, since it came to your house."),
          L("ubianca", "Sorry, sorry! I'm here! Ooh, is that the box? Go on, open it!"),
        ], post: [
          L("ubianca", "Then I'll take this one! And now that we've all got a Pokémon... let's battle! Right here!"),
          L("ucheren", "In your room? ...Fine. But I'm battling the winner."),
        ] },
        // (the first rival battles are below the games' Lv 5, README, House rules: no Unova starter knows its type's move at Lv 5 here,
        // so even Bianca's, the one weak to yours, won 81% against a Lv 5 Snivy and 94% against a Lv 5 Oshawott; at Lv 4 every starter
        // wins 98-100% against Bianca's and Cheren's)
        { id: "b", type: "battle", name: "Your Room: Bianca", lv: 4, env: "lab", get trainer() { return biancaTR("Okay, my Pokémon, let's do our very best! Um, what do we do first?", "Wah, we lost! But that was so much fun! ...Oh no, your room."); },
          rivalWaves: () => [[{ op: biancaMon(0), LV: 4, moves: { snivy: ["tackle", "leer"], tepig: ["tackle", "tailwhip"], oshawott: ["tackle", "tailwhip"] }[biancaMon(0)] }]], pre: [
          L("ubianca", "A battle! Our very first one! Don't go easy on me, okay?"),
        ], post: [
          L("narr", "Books on the floor, the bed pushed aside, the TV tipped over. Cheren heals both your Pokémon and sighs at the mess."),
        ] },
        { id: "c", type: "battle", name: "Your Room: Cheren", lv: 4, reward: { key: "un_xtransceiver" }, env: "lab", get trainer() { return cherenTR("I'm going to be Champion one day. This is where I start.", "Hm. I see. I'll have to think about this."); },
          rivalWaves: () => [[{ op: cherenMon(0), LV: 4, moves: { snivy: ["tackle", "leer"], tepig: ["tackle", "tailwhip"], oshawott: ["tackle", "tailwhip"] }[cherenMon(0)] }]], pre: [
          L("ucheren", "My turn. My Pokémon has the type advantage over yours, so don't expect this to be easy."),
        ], post: [
          L("umom", "So you've all chosen your partners! Here, this Xtransceiver is for you: now you can call each other wherever you go. Go and thank the Professor."),
        ] },
        { id: "d", type: "story", name: "Professor Juniper's Lab", env: "lab", pre: [
          L("ujuniper", "Welcome! I'm Professor Juniper. I study where Pokémon come from. Here's a Pokédex for each of you: it records every Pokémon you meet."),
          L("ujuniper", "Unova is full of Pokémon you won't find anywhere else. Go and meet them all. Come with me to Route 1: I'll show you how to catch one."),
          L("ubfather", "Bianca's not going anywhere! ...I'll talk to her again. Off you go, the rest of you."),
        ] },
        // (the owner's rule, 2026-10-15: Route 1 and Route 2 field one wild Pokémon for each one you can have there, as Black/White's
        // own wild battles are one-on-one: up to three at once beat a lone Lv 5 starter every time)
        { id: "e", type: "battle", name: "Route 1", lv: 3, env: "route", wild: 1, catch: "lillipup", reward: { key: "un_pokeballs" }, waves: [WU("lillipup:3")], pre: [
          L("ujuniper", "Watch: my Minccino weakens a wild Patrat first, then... a Poké Ball! See? Now you try. Here are five Poké Balls."),
          L("ubianca", "A race to Accumula Town! Whoever catches the most Pokémon wins! Ready, go!"),
        ], post: [L("narr", "Gotcha! Lillipup was caught! The long fur around its face senses what's going on around it.")] },
        { id: "f", type: "story", name: "Accumula Town: Team Plasma", env: "city", pre: [
          L("narr", "In Accumula Town's plaza, a crowd has gathered. A man in a long robe stands before a line of knights in grey: Team Plasma."),
          L("ughetsis", "I am Ghetsis of Team Plasma. We keep Pokémon in Poké Balls, order them about, make them fight... Are we sure they're happy? Pokémon must be liberated."),
          L("narr", "The crowd murmurs. Ghetsis and his knights march off. Then a young man with long green hair steps out of the crowd."),
          L("un", "Your Pokémon... it was talking just now. ...You can't hear it? How sad. I'm N. Let me hear more of its voice."),
        ] },
        // (N here, Bianca on Route 2 and Cheren at the Trainers' School don't set the level cap, the owner's rule, 2026-10-15: the Striaton
        // Gym does from the start, as the first Gym does in Kanto and Hoenn; at cap 5-6 a team of one to three lost to them)
        { id: "g", type: "boss", name: "Accumula Town: N", lv: 7, noCap: 1, env: "city", trainer: TR("N", "un_n", "Let me hear your Pokémon's voice. Is it truly happy with you?", "...Your Pokémon said something I've never heard before. Interesting."),
          waves: [WU("purrloin:7!")], pre: [
          L("un", "As long as Pokémon are kept in Poké Balls, they'll never be perfect beings. I'll show you what I mean."),
        ], post: [L("un", "I have to change the world. To free every Pokémon. ...Goodbye.")] },
        { id: "h", type: "battle", name: "Route 2", lv: 5, env: "route", wild: 1, catch: "purrloin", reward: { key: "un_runningshoes" }, waves: [WU("patrat:4", "purrloin:5")], pre: [
          L("umom", "Wait up! You forgot these: Running Shoes. Now you'll be able to keep up with Bianca."),
          L("narr", "Route 2 runs north to Striaton City. A Purrloin is watching you from the grass, waiting to see what you'll drop."),
        ], post: [L("narr", "Gotcha! Purrloin was caught! It lures people in with its cute act, then steals their things.")] },
        { id: "i", type: "battle", name: "Route 2: Bianca", lv: 7, noCap: 1, env: "route", get trainer() { return biancaTR("I caught a new Pokémon! Want to see? Of course you do!", "Ohhh... you're really good at this."); },
          rivalWaves: () => [WU("lillipup:6", biancaMon(0) + ":7!")], pre: [
          L("ubianca", "There you are! I've been training! A little! Let's battle!"),
        ] },
        { id: "j", type: "chest", name: "The Dreamyard: a Gift", get reward() { return { op: trio()[3], lmd: 1000 }; }, env: "forest", pre: [
          L("narr", "Striaton's Gym is closed until its Leaders come back. East of town lies the Dreamyard, the ruins of a lab that once studied dreams."),
          LR("narr", () => `A girl by the ruins has a Pokémon that needs a Trainer: a ${OPS[trio()[3]].n}. "The Gym's Leader is strong against your partner," she says. "This one's strong against him."`),
        ] },
        { id: "k", type: "side", name: "The Dreamyard: Munna", lv: 10, env: "forest", wild: 1, catch: "munna", waves: [WU("patrat:9", "purrloin:9"), WU("munna:10!")], pre: [
          L("narr", "Among the Dreamyard's broken walls, a pink Pokémon floats in its sleep, trailing a faint mist. It eats dreams."),
        ], post: [L("narr", "Gotcha! Munna was caught! The mist from its forehead shows the dreams it has eaten.")] },
        { id: "l", type: "battle", name: "Striaton City: the Trainers' School", lv: 8, noCap: 1, reward: { oranberry: 3 }, env: "city", get trainer() { return cherenTR("I've been studying type matchups. Let me test what I've learned.", "Practice is practice. I'll do better when it counts."); },
          rivalWaves: () => [WU("purrloin:8", cherenMon(0) + ":8!@oranberry")], pre: [
          L("ucheren", "The Gym Leader's back. Before you go in, a practice battle. I want to see how far you've come."),
        ], post: [L("ucheren", "Take these Oran Berries. A Pokémon holding one eats it when it's hurt.")] },
        { id: "m", type: "battle", name: "Striaton Gym: Waitress Tia", lv: 10, env: "gym", trainer: TR("Waitress Tia", "un_waitress", "Welcome to the Striaton restaurant! Today's special is a battle!", "Thank you, come again!"),
          waves: [WU("patrat:10", "purrloin:10")] },
        { id: "n", type: "boss", name: "Striaton Gym: the Three Brothers", lv: 14, env: "gym", badgeWin: 0, get reward() { return { tm: [tmId("workup", 5), tmId("cut", 5)] }; },
          get trainer() { const t = trio(); return TR("Leader " + t[0], t[1], `I'm ${t[0]}, one of Striaton's three Gym Leaders. I'll be your opponent: my Pokémon have the type advantage over your partner!`, "We lost! Well played. The Trio Badge is yours."); },
          get waves() { return [WU("lillipup:12+", trio()[2] + ":14!")]; }, pre: [
          L("ucilan", "Welcome to the Striaton Gym. We're three brothers, and three Gym Leaders: Cilan, Chili and Cress."),
          LR("narr", () => `The brothers look at your partner and nod to each other. ${trio()[0]} steps forward: the one whose type beats yours.`),
        ], post: [
          LR("narr", () => `${trio()[0]} hands you TM83 Work Up with the Trio Badge.`),
          L("ufennel", "You're the Trainer Professor Juniper told me about! I'm Fennel. I study dreams. Could you help me? I need Dream Mist from a Munna. Here, take HM01 Cut first."),
        ] },
      ] },
    { id: "c2", part: 1, title: "The Dreamyard and Wellspring Cave", env: "forest", map: "forest", reward: { lmd: 4000, orundum: 300 },
      nodes: [
        { id: "a", type: "battle", name: "The Dreamyard: Team Plasma", lv: 10, reward: { key: "un_cgear" }, env: "forest", trainer: plasmaTR("Team Plasma needs this Munna's Dream Mist. Out of the way!", "We lost... to a kid!"),
          waves: [WU("patrat:10"), WU("purrloin:10")], pre: [
          L("narr", "With Cut you reach the back of the Dreamyard. Bianca is there, hiding behind a wall: two people in grey are kicking a Munna."),
          L("ugrunt", "Come on, make Dream Mist! Team Plasma's going to use it to make people let go of their Pokémon!"),
          L("ubianca", "Stop it! It's crying! ...Please, help me!"),
        ], post: [
          L("ughetsis", "What a disgrace. You can't even get Dream Mist out of a Munna? Leave it. We go."),
          L("narr", "A Musharna drifts out of the ruins, wraps the little Munna in its mist and leaves Dream Mist behind. Fennel gives you a C-Gear for your trouble."),
        ] },
        { id: "b", type: "battle", name: "Route 3", lv: 10, env: "route", wild: 1, catch: "blitzle", waves: [WU("pidove:9", "patrat:9"), WU("blitzle:10", "pidove:10")], pre: [
          L("narr", "Route 3 passes a preschool and the Pokémon Day Care. In the tall grass, a Blitzle's mane crackles with electricity."),
        ], post: [L("narr", "Gotcha! Blitzle was caught! Its mane flashes when it discharges electricity.")] },
        { id: "c", type: "side", name: "Route 3: Pidove", lv: 9, env: "route", wild: 1, catch: "pidove", waves: [WU("patrat:9", "purrloin:9"), WU("pidove:10", "pidove:9")], pre: [
          L("narr", "A flock of Pidove pecks at crumbs by the preschool. They follow anyone who might feed them."),
        ], post: [L("narr", "Gotcha! Pidove was caught! It lives in towns and parks, and isn't afraid of people.")] },
        { id: "d", type: "battle", name: "Route 3: Twins Kumi & Amy", lv: 11, env: "route", trainer: TR("Twins Kumi & Amy", "un_twins", "We battle together! Two against one... no wait, two against two!", "We lost together, too..."),
          waves: [WU("purrloin:10", "purrloin:10")] },
        { id: "e", type: "battle", name: "Route 3: Cheren", lv: 14, env: "route", get trainer() { return cherenTR("Let's see whose team has grown stronger since Striaton.", "...You're getting stronger faster than I am. Why?"); },
          rivalWaves: () => [WU("purrloin:12", cherenMon(0) + ":14!@oranberry")], pre: [
          L("ucheren", "I've been thinking about what it takes to be Champion. Strength. Nothing else matters. Battle me."),
        ] },
        { id: "f", type: "battle", name: "Wellspring Cave: Team Plasma", lv: 12, reward: { key: "un_healballs" }, env: "cave", trainer: plasmaTR("This little girl's Pokémon is liberated now. Go home!", "You... you're not normal."),
          waves: [WU("patrat:12"), WU("patrat:12", "patrat:12")], pre: [
          L("narr", "Two Team Plasma Grunts run past with a preschooler's Pokémon and vanish into Wellspring Cave. Cheren follows you in."),
          L("ucheren", "Stealing a child's Pokémon and calling it liberation? Let's go. I'll battle beside you."),
        ], post: [L("narr", "The Grunts hand the Pokémon back and flee. The little girl hugs it, then gives you three Heal Balls.")] },
        { id: "g", type: "battle", name: "Wellspring Cave", lv: 12, env: "cave", wild: 1, catch: "roggenrola", waves: [WU("woobat:11", "roggenrola:11"), WU("roggenrola:12", "woobat:12")], pre: [
          L("narr", "Water drips from the ceiling of Wellspring Cave. Roggenrola sit still in the dark, their single ear-shaped hexagon listening."),
        ], post: [L("narr", "Gotcha! Roggenrola was caught! Its body is as hard as steel, and its core holds energy.")] },
        { id: "h", type: "side", name: "Wellspring Cave: Woobat", lv: 12, env: "cave", wild: 1, catch: "woobat", waves: [WU("roggenrola:11", "roggenrola:11"), WU("woobat:12", "woobat:13")], pre: [
          L("narr", "Something flutters past your face and sticks to the cave wall with its nose: a Woobat."),
        ], post: [L("narr", "Gotcha! Woobat was caught! Wherever it's been, it leaves a heart-shaped mark.")] },
        { id: "i", type: "side", name: "Wellspring Cave: Drilbur", lv: 13, env: "cave", wild: 1, catch: "drilbur", waves: [WU("woobat:12", "roggenrola:12"), WU("drilbur:13!")], pre: [
          L("narr", "A cloud of dust bursts up from the cave floor. Something is spinning down there like a drill."),
        ], post: [L("narr", "Gotcha! Drilbur was caught! It tunnels through the ground at fifty kilometres an hour.")] },
      ] },
    { id: "c3", part: 1, title: "Nacrene City and Pinwheel Forest", env: "forest", map: "forest", reward: { lmd: 5000, orundum: 300, moonstone: 1 },
      nodes: [
        { id: "a", type: "boss", name: "Nacrene City: N", lv: 13, env: "city", trainer: TR("N", "un_n", "Your Pokémon still say they like you. I want to understand why.", "...So that's it. There's a world where people and Pokémon need each other. I don't accept it."),
          waves: [WU("pidove:13", "timburr:13", "tympole:13!")], pre: [
          L("narr", "Nacrene City is a town of old warehouses turned into studios and cafés. Outside the museum, someone is waiting for you."),
          L("un", "I'm looking for a Pokémon called Zekrom, the dragon of legend. I'll become a hero, and with it, I'll free every Pokémon. Now, let me hear your friends again."),
        ] },
        { id: "b", type: "battle", name: "Nacrene Gym: Scientist Satomi", lv: 17, env: "gym", trainer: TR("Scientist Satomi", "un_scientistf", "The Gym is a library. Every book here has a lesson about battling.", "I'll have to look that one up..."),
          waves: [WU("herdier:17")] },
        { id: "c", type: "boss", name: "Nacrene Gym: Lenora", lv: 20, env: "gym", badgeWin: 1, reward: { tm: tmId("retaliate", 5) },
          trainer: TR("Leader Lenora", "un_lenora", "I'm Lenora, the Nacrene Gym Leader and the museum's director. Let me research you with this battle!", "What a result! I can't argue with that. The Basic Badge is yours."),
          waves: [WU("herdier:18+", "watchog:20!")], pre: [
          L("ulenora", "Normal types look plain, but they're the foundation everything is built on. My Watchog's Retaliate hits twice as hard if you knock out a friend first."),
          L("narr", "Normal types fear only Fighting moves, and Ghost moves can't touch them."),
        ], post: [
          L("ulenora", "Take this too: TM67 Retaliate."),
          L("narr", "An alarm goes off in the museum. Team Plasma has broken in and stolen the Dragon Skull! They ran into Pinwheel Forest."),
          L("ulenora", "Burgh, the Castelia Gym Leader, is on the other side of the forest. We'll trap them between us. Go!"),
        ] },
        { id: "d", type: "battle", name: "Pinwheel Forest: Team Plasma", lv: 16, env: "forest", trainer: plasmaTR("You'll never catch us in this forest!", "Hey, no fair! Run!"),
          waves: [WU("sandile:16"), WU("purrloin:16")], pre: [
          L("narr", "Grey uniforms flicker between the trees. The Grunts have split up to lose you."),
        ] },
        { id: "e", type: "battle", name: "Pinwheel Forest: the Dragon Skull", lv: 16, reward: { moonstone: 1 }, env: "forest", trainer: plasmaTR("Fine, take your silly skull back! But Team Plasma won't forget this!", "Here, take it! Just take it!"),
          waves: [WU("patrat:16"), WU("patrat:14", "patrat:14", "sandile:14")], pre: [
          L("uburgh", "I'm Burgh. Lenora called me. They can't get past me to the north, so they're all yours."),
        ], post: [
          L("usage", "I am Gorm, one of the Seven Sages of Team Plasma. Return what we liberated? ...Very well. This time."),
          L("ulenora", "The Dragon Skull's safe. Thank you! Here, a Moon Stone. Some Pokémon evolve when it touches them."),
        ] },
        { id: "f", type: "battle", name: "Pinwheel Forest", lv: 17, env: "forest", wild: 1, catch: "sewaddle", waves: [WU("venipede:15", "cottonee:16"), WU("sewaddle:17", "venipede:16")], pre: [
          L("narr", "Inside the forest, the light comes through the leaves in green spots. Sewaddle wrap themselves in leaves to make clothes."),
        ], post: [L("narr", "Gotcha! Sewaddle was caught! It makes its clothes from leaves and sticky silk.")] },
        { id: "g", type: "side", name: "Pinwheel Forest: Venipede", lv: 16, env: "forest", wild: 1, catch: "venipede", waves: [WU("sewaddle:15", "cottonee:15"), WU("venipede:16", "venipede:17")], pre: [
          L("narr", "A Venipede is crawling along a fallen trunk, its antennae twitching. Its bite is poisonous."),
        ], post: [L("narr", "Gotcha! Venipede was caught! It uses the feelers on its head and tail to sense its surroundings.")] },
        { id: "h", type: "side", name: "Pinwheel Forest: Cottonee", lv: 16, env: "forest", wild: 1, catch: "cottonee", waves: [WU("sewaddle:15", "venipede:15"), WU("cottonee:16", "cottonee:17")], pre: [
          L("narr", "Puffs of cotton drift through the trees. Cottonee ride the wind, and gather on Pokémon that stay still too long."),
        ], post: [L("narr", "Gotcha! Cottonee was caught! It shoots cotton out to keep from being blown away.")] },
        { id: "i", type: "side", name: "Pinwheel Forest's Edge: Sawk", lv: 15, env: "route", wild: 1, catch: "sawk", waves: [WU("timburr:14", "tympole:14"), WU("sawk:15!")], pre: [
          L("narr", "In the open field before the forest, a blue Pokémon in a karate gi is training alone. It bows, then attacks."),
        ], post: [L("narr", "Gotcha! Sawk was caught! It ties its belt tight when it gets serious.")] },
        { id: "j", type: "side", name: "Pinwheel Forest's Edge: Timburr", lv: 14, env: "route", wild: 1, catch: "timburr", waves: [WU("tympole:14", "pidove:14"), WU("timburr:14", "timburr:13")], pre: [
          L("narr", "A little grey Pokémon is carrying a square log as big as itself. It swings it at you."),
        ], post: [L("narr", "Gotcha! Timburr was caught! It always carries square logs, and swings them around to fight.")] },
        { id: "k", type: "side", name: "Pinwheel Forest's Edge: Tympole", lv: 15, env: "sea", wild: 1, catch: "tympole", waves: [WU("timburr:14", "pidove:14"), WU("tympole:15", "tympole:14")], pre: [
          L("narr", "In the creek by the forest, a chorus of Tympole is singing in high-pitched voices people can't hear."),
        ], post: [L("narr", "Gotcha! Tympole was caught! It talks with the others by sound waves.")] },
        { id: "l", type: "chest", name: "Nacrene City: Dye's Trade", reward: { op: "petilil", lmd: 1500 }, env: "city", pre: [
          L("narr", "In a Nacrene house, a woman named Dye has a Petilil she'd like to trade for a Cottonee. Your Cottonee waves goodbye; Petilil hops over."),
        ] },
      ] },
    { id: "c4", part: 1, title: "Castelia City", env: "city", map: "city", reward: { lmd: 6000, orundum: 400 },
      nodes: [
        { id: "a", type: "story", name: "Skyarrow Bridge", env: "sea", pre: [
          L("narr", "The Skyarrow Bridge, the longest in Unova, crosses the bay to Castelia City. Ahead, skyscrapers fill the sky."),
        ] },
        { id: "b", type: "chest", name: "Castelia City: the Stone", get reward() { return { [trio()[4]]: 1, lmd: 1000 }; }, env: "city", pre: [
          LR("narr", () => `On Castelia's pier a scientist gives you a ${{ waterstone: "Water", leafstone: "Leaf", firestone: "Fire" }[trio()[4]]} Stone. "Your ${OPS[trio()[3]].n} evolves with one of those," he says.`),
          L("narr", "You put the stone in your Bag. Your monkey sniffs at it, curious."),
        ] },
        { id: "c", type: "battle", name: "Castelia City: Team Plasma", lv: 17, reward: { held: "yacheberry" }, env: "city", trainer: plasmaTR("This Munna's been liberated! Finders keepers!", "Ugh. Go ahead, take the stupid Munna..."),
          waves: [WU("sandile:17", "sandile:17")], pre: [
          L("ubianca", "My Munna! Someone in grey just grabbed it and ran!"),
          L("uburgh", "Team Plasma again. They went into that building across from my Gym. Let's go get it back."),
          L("uiris", "Hey! You're Bianca's friend, right? I'm Iris! I'll keep watch out here. Go!"),
        ], post: [
          L("ughetsis", "Ah. The Trainer from Accumula. Long ago, two brothers founded Unova with a dragon. When they quarreled, the dragon split in two... Keep the Munna. We'll meet again."),
          L("uiris", "You got it back! Here, a Yache Berry. You're really strong, you know that?"),
        ] },
        { id: "d", type: "battle", name: "Castelia Gym: Harlequin Jack", lv: 20, env: "gym", trainer: TR("Harlequin Jack", "un_harlequin", "Surprise! The Gym's a giant beehive, and I'm the stinger!", "Ha... ha... I'm finished."),
          waves: [WU("sewaddle:20", "venipede:20")] },
        { id: "e", type: "boss", name: "Castelia Gym: Burgh", lv: 23, env: "gym", badgeWin: 2, reward: { tm: tmId("strugglebug", 5) },
          trainer: TR("Leader Burgh", "un_burgh", "I'm Burgh, an artist, and the Castelia Gym Leader. Let me show you the art of Bug-type Pokémon!", "Wonderful! A masterpiece of a battle. The Insect Badge is yours."),
          waves: [WU("whirlipede:21+", "dwebble:21+"), WU("leavanny:23!")], pre: [
          L("uburgh", "When I battle, inspiration comes to me. Your battle with my Bugs will be my next painting!"),
          L("narr", "Bug types are weak to Fire, Flying and Rock moves. Whirlipede is part Poison, and Dwebble part Rock."),
        ], post: [L("uburgh", "And take this: TM76 Struggle Bug.")] },
        { id: "f", type: "battle", name: "Castelia City: Bianca", lv: 20, env: "city", get trainer() { return biancaTR("I've been training too! Want to see how much?", "Wow. You're so strong. Am I even getting stronger?"); },
          rivalWaves: () => [WU("herdier:18", biancaMonkey() + ":18", "munna:18"), WU(biancaMon(1) + ":20!")], pre: [
          L("ubianca", "Thank you for getting Munna back! It's a little scared, but it's okay. Let's battle, so it gets its confidence back!"),
        ] },
      ] },
    { id: "c5", part: 1, title: "The Desert Resort and Nimbasa City", env: "volcano", map: "volcano", reward: { lmd: 7000, orundum: 400 },
      nodes: [
        { id: "a", type: "battle", name: "Route 4: Cheren", lv: 22, env: "route", weather: "sand", get trainer() { return cherenTR("I got the Insect Badge before you. Let's see if that means anything.", "...I'm not strong enough. What am I missing?"); },
          rivalWaves: () => [WU("pidove:20", cherenMonkey() + ":20"), WU("liepard:20", cherenMon(1) + ":22!@sitrusberry")], pre: [
          L("narr", "North of Castelia, Route 4 runs through the sand toward Nimbasa City. The wind never stops blowing."),
          L("ucheren", "Wait. Before we cross the desert, battle me."),
        ] },
        { id: "b", type: "battle", name: "Desert Resort", lv: 20, env: "volcano", weather: "sand", wild: 1, catch: "sandile", waves: [WU("darumaka:19", "scraggy:19"), WU("sandile:20", "dwebble:20")], pre: [
          L("narr", "The Desert Resort is a sea of sand around the half-buried Relic Castle. Sandile swim through the sand with only their eyes showing."),
        ], post: [L("narr", "Gotcha! Sandile was caught! The dark membranes over its eyes protect them from the sun.")] },
        { id: "c", type: "side", name: "Desert Resort: Darumaka", lv: 20, env: "volcano", weather: "sand", wild: 1, catch: "darumaka", waves: [WU("sandile:19", "scraggy:19"), WU("darumaka:20", "darumaka:21")], pre: [
          L("narr", "A round red Pokémon is dozing in the hot sand, curled up like a little doll."),
        ], post: [L("narr", "Gotcha! Darumaka was caught! When it sleeps, it pulls its limbs in and its fire burns low.")] },
        { id: "d", type: "side", name: "Desert Resort: Scraggy", lv: 20, env: "volcano", weather: "sand", wild: 1, catch: "scraggy", waves: [WU("sandile:19", "darumaka:19"), WU("scraggy:20", "scraggy:21")], pre: [
          L("narr", "A Scraggy holding up its baggy skin like trousers headbutts anyone who looks at it."),
        ], post: [L("narr", "Gotcha! Scraggy was caught! Its skin is rubbery and protects it from attacks.")] },
        { id: "e", type: "side", name: "Desert Resort: Sigilyph", lv: 20, env: "volcano", weather: "sand", wild: 1, catch: "sigilyph", waves: [WU("maractus:20", "dwebble:21"), WU("sigilyph:20!")], pre: [
          L("narr", "By the ruins, a strange bird hangs in the air without moving, as if it's guarding something. Its body looks like an ancient painting."),
        ], post: [L("narr", "Gotcha! Sigilyph was caught! It never strays from the route it once guarded.")] },
        { id: "f", type: "side", name: "Desert Resort: Maractus", lv: 20, env: "volcano", weather: "sand", wild: 1, catch: "maractus", waves: [WU("sandile:19", "scraggy:19"), WU("maractus:20", "dwebble:20")], pre: [
          L("narr", "A cactus is dancing. Maractus moves to a rhythm only it can hear."),
        ], post: [L("narr", "Gotcha! Maractus was caught! It dances to scare off the bird Pokémon that peck at its flowers.")] },
        { id: "g", type: "side", name: "Desert Resort: Dwebble", lv: 20, env: "volcano", weather: "sand", wild: 1, catch: "dwebble", waves: [WU("sandile:19", "darumaka:19"), WU("dwebble:20", "dwebble:21")], pre: [
          L("narr", "A small rock is walking across the sand on orange legs. Dwebble carves its home out of stone."),
        ], post: [L("narr", "Gotcha! Dwebble was caught! When it finds a good stone, it hollows it out to live in.")] },
        { id: "h", type: "side", name: "Relic Castle: Yamask", lv: 21, env: "cave", weather: "sand", wild: 1, catch: "yamask", waves: [WU("sandile:20", "sandile:20"), WU("yamask:21", "yamask:22")], pre: [
          L("narr", "Sand pours down the stairs of Relic Castle. Something is weeping in the dark, holding a mask."),
        ], post: [L("narr", "Gotcha! Yamask was caught! The mask it carries is said to be its face when it was human.")] },
        // (the Backpacker offers the Cover and Plume Fossils, and you keep one: the Cover Fossil here, revived at Lv 25 as in the games)
        { id: "i", type: "side", name: "Relic Castle: the Cover Fossil", lv: 22, env: "cave", weather: "sand", wild: 1, gift: "tirtouga", giftLv: 25, waves: [WU("sandile:21", "yamask:22")], pre: [
          L("narr", "Deep in Relic Castle's sand, a Backpacker has dug up two fossils and can only carry one home. The wild Pokémon don't like her digging."),
        ], post: [L("narr", "You choose the Cover Fossil. At the Nacrene Museum it comes back to life: Tirtouga, a sea turtle from a hundred million years ago.")] },
        { id: "j", type: "battle", name: "Nimbasa City: Team Plasma", lv: 18, reward: { key: ["un_ultraballs", "un_bicycle"], tm: tmId("strength", 5) }, env: "city", trainer: plasmaTR("Hand over the Day Care's Pokémon! It's for their own good!", "Retreat! Retreat!"),
          waves: [WU("watchog:18", "trubbish:18")], pre: [
          L("narr", "In the gate to Nimbasa City, Professor Juniper gives you and Cheren ten Ultra Balls. In the city, two Grunts have cornered the Day-Care Man."),
        ], post: [L("narr", "The Day-Care Man gives you a Bicycle to say thank you."), L("narr", "North of the Battle Institute, a man gives you HM04 Strength.")] },
        { id: "k", type: "boss", name: "Nimbasa City: N", lv: 22, env: "city", trainer: TR("N", "un_n", "I am the king of Team Plasma. Now, battle me, and show me if your bond is real.", "...I see. I'll need more power. I'll need the dragon."),
          waves: [WU("sandile:22", "scraggy:22"), WU("darumaka:22", "sigilyph:22!")], pre: [
          L("ubfather", "Bianca! You're coming home! It's too dangerous out here!"),
          L("uelesa", "Let her go her own way. Your daughter's a strong Trainer. She'll be fine."),
          L("narr", "In the amusement park, N asks you to ride the Ferris wheel with him. At the top, he tells you who he really is."),
          L("un", "I love Ferris wheels. The way they turn... like mathematics. I'm Team Plasma's king. Ghetsis asked me to free the Pokémon with him."),
        ] },
        { id: "l", type: "battle", name: "Nimbasa Gym: Lady Colette", lv: 25, env: "gym", trainer: TR("Lady Colette", "un_lady", "Elesa's Gym is a roller coaster. Hold on to your hat!", "My hair's a mess now..."),
          waves: [WU("emolga:25")] },
        { id: "m", type: "boss", name: "Nimbasa Gym: Elesa", lv: 27, env: "gym", badgeWin: 3, reward: { tm: tmId("voltswitch", 5) },
          trainer: TR("Leader Elesa", "un_elesa", "I'm Elesa, the Nimbasa Gym Leader. My Pokémon and I will dazzle you!", "Hmm... you're more dazzling than I thought. The Bolt Badge is yours."),
          waves: [WU("emolga:25+", "emolga:25+"), WU("zebstrika:27!")], pre: [
          L("uelesa", "My Emolga use Volt Switch to dart in and out of battle. Can your Pokémon keep up?"),
          L("narr", "Electric types are weak to Ground moves only. Emolga is part Flying, so Ground moves miss it: Rock and Ice moves work instead."),
        ], post: [L("uelesa", "This is yours too: TM72 Volt Switch.")] },
      ] },
    { id: "c6", part: 1, title: "Driftveil City", env: "sea", map: "sea", reward: { lmd: 8000, orundum: 400, thunderstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 5: Cheren", lv: 26, env: "route", get trainer() { return cherenTR("I need to know if I'm getting stronger. Battle me.", "I lost again. Is strength really all there is?"); },
          rivalWaves: () => [WU("liepard:24", cherenMonkey() + ":24@" + ({ pansage: "miracleseed", pansear: "charcoal", panpour: "mysticwater" })[cherenMonkey()]), WU("tranquill:24", cherenMon(1) + ":26!@sitrusberry")], pre: [
          L("narr", "Route 5 runs west from Nimbasa toward the Driftveil Drawbridge. Street performers play by the trailers."),
        ] },
        { id: "b", type: "battle", name: "Route 5: Preschoolers Sarah & Billy", lv: 26, env: "route", trainer: TR("Preschoolers Sarah & Billy", "un_preschooler", "Our Herdier are the strongest! Wanna see?", "Waaah! We lost!"),
          waves: [WU("herdier:26@sitrusberry", "herdier:26@sitrusberry")], pre: [
          L("ualder", "Ho there! I'm Alder. I just travel around. You two look like you've been fighting with clenched fists. Have a battle with these little ones, together. For fun!"),
          L("ucheren", "For fun? ...Fine. I'll battle beside you."),
        ], post: [
          L("ualder", "See? Wasn't that fun? Battles aren't only about winning. ...Oh, and I'm the Champion. Ha ha!"),
          L("narr", "Elesa calls Clay, the Driftveil Gym Leader, and the Driftveil Drawbridge lowers across the river."),
        ] },
        { id: "c", type: "battle", name: "Route 5", lv: 22, env: "route", wild: 1, catch: "minccino", waves: [WU("liepard:22", "trubbish:22"), WU("minccino:22", "gothita:22")], pre: [
          L("narr", "Minccino scamper through the grass on Route 5, tidying everything with their bushy tails."),
        ], post: [L("narr", "Gotcha! Minccino was caught! It loves cleaning, and dusts with its tail.")] },
        { id: "d", type: "side", name: "Route 5: Gothita", lv: 22, env: "route", wild: 1, catch: "gothita", waves: [WU("minccino:21", "trubbish:21"), WU("gothita:22", "gothita:23")], pre: [
          L("narr", "A little Gothita is staring at the night sky, though it's the middle of the day. It's said to watch things no one else can see."),
        ], post: [L("narr", "Gotcha! Gothita was caught! It stares at things people and Pokémon can't see.")] },
        { id: "e", type: "side", name: "Route 5: Trubbish", lv: 22, env: "route", wild: 1, catch: "trubbish", waves: [WU("minccino:21", "liepard:21"), WU("trubbish:22", "trubbish:23")], pre: [
          L("narr", "A bag of rubbish behind the trailers is moving. It burps, and the air goes green."),
        ], post: [L("narr", "Gotcha! Trubbish was caught! It came from a bag of rubbish that a chemical reaction brought to life.")] },
        { id: "f", type: "battle", name: "The Cold Storage: Team Plasma", lv: 23, env: "ice", trainer: plasmaTR("Clay's men caught us, but we got away when the bridge came down! Now get lost!", "Lord Zinzolin will hear of this..."),
          waves: [WU("watchog:23", "scraggy:23"), WU("liepard:24")], pre: [
          L("uclay", "Clay, Gym Leader. Them Plasma folks I caught got loose when the bridge came down. I'll see you in my Gym once you've rounded 'em up. They're in the Cold Storage."),
          L("ucheren", "There are eight of them. You take four, I'll take four."),
        ] },
        { id: "g", type: "battle", name: "The Cold Storage: Zinzolin's Guards", lv: 24, env: "ice", trainer: plasmaTR("You won't lay a finger on Lord Zinzolin!", "Lord Zinzolin, run!"),
          waves: [WU("trubbish:24"), WU("sandile:23", "watchog:23")], post: [
          L("uzinzolin", "Brrr. I am Zinzolin, one of the Seven Sages. How rude, to come between Team Plasma and the Pokémon we liberate."),
          L("uclay", "Got 'em. ...Then that Ghetsis fella shows up at my Gym door and talks me into lettin' 'em go. Says they'll answer for it some other way. Hmph."),
        ] },
        { id: "h", type: "battle", name: "Driftveil Gym: Worker Don", lv: 29, env: "cave", trainer: TR("Worker Don", "un_worker", "The Gym's a mine. You dig your way down to the boss!", "I've hit bedrock..."),
          waves: [WU("krokorok:29")] },
        { id: "i", type: "boss", name: "Driftveil Gym: Clay", lv: 31, env: "cave", badgeWin: 4,
          trainer: TR("Leader Clay", "un_clay", "Clay, Driftveil Gym Leader. Ground types, the toughest there are. Let's see what you've got, kid!", "Hmph. You're tough. Here's the Quake Badge."),
          waves: [WU("krokorok:29+", "palpitoad:29+"), WU("excadrill:31!")], pre: [
          L("uclay", "I built this city out of a mine. Excadrill dug half of it. It'll dig through your team too!"),
          L("narr", "Ground types are weak to Water, Grass and Ice moves. Electric moves don't touch them, and Excadrill's Steel half shrugs off Poison."),
        ] },
        { id: "j", type: "battle", name: "Driftveil City: Bianca", lv: 28, get reward() { return { tm: tmId("fly", 5) }; }, env: "city", get trainer() { return biancaTR("I've been thinking a lot. About whether I'm good at this. Let's battle!", "Thanks. I think I know what I want to do now."); },
          rivalWaves: () => [WU("herdier:26", biancaMonkey() + ":26", "musharna:26"), WU(biancaMon(1) + ":28!")], pre: [
          L("ubianca", "Hi! I'm going to Route 6 too. But first, let's battle!"),
        ], post: [L("ubianca", "Here, HM02 Fly! Now you can fly back to any town you've been to. Isn't that great?")] },
      ] },
    { id: "c7", part: 1, title: "Chargestone Cave and Mistralton City", env: "cave", map: "cave", reward: { lmd: 9000, orundum: 500 },
      nodes: [
        { id: "a", type: "battle", name: "Route 6", lv: 24, env: "route", wild: 1, catch: "karrablast", waves: [WU("deerling:22", "foongus:23"), WU("karrablast:24", "vanillite:23")], pre: [
          L("narr", "Route 6 winds west of Driftveil past the Season Research Lab, where they study how Deerling change with the seasons."),
        ], post: [L("narr", "Gotcha! Karrablast was caught! Something about Shelmet makes it evolve. No one knows why.")] },
        { id: "b", type: "side", name: "Route 6: Deerling", lv: 24, env: "route", wild: 1, catch: "deerling", waves: [WU("foongus:23", "karrablast:22"), WU("deerling:24", "deerling:23")], pre: [
          L("narr", "A Deerling bounds through the grass. The colour of its coat changes with every season."),
        ], post: [L("narr", "Gotcha! Deerling was caught! Its scent changes with the season, too.")] },
        { id: "c", type: "side", name: "Route 6: Foongus", lv: 25, env: "forest", wild: 1, catch: "foongus", waves: [WU("deerling:24", "karrablast:24"), WU("foongus:25", "foongus:23")], pre: [
          L("narr", "There's a Poké Ball lying in the grass. You reach for it... and it stands up. Foongus disguise themselves as Poké Balls."),
        ], post: [L("narr", "Gotcha! Foongus was caught! No one knows why it looks like a Poké Ball.")] },
        { id: "d", type: "side", name: "Route 6: Vanillite", lv: 25, env: "ice", wild: 1, catch: "vanillite", waves: [WU("deerling:23", "foongus:23"), WU("vanillite:25", "vanillite:23")], pre: [
          L("narr", "A little ice-cream cone is floating over the grass, breathing out a cold mist. Vanillite was born from icicles in the morning sun."),
        ], post: [L("narr", "Gotcha! Vanillite was caught! Its breath is −50°C.")] },
        { id: "e", type: "side", name: "Driftveil Drawbridge: Ducklett", lv: 25, env: "sea", wild: 1, catch: "ducklett", waves: [WU("ducklett:22", "ducklett:23"), WU("ducklett:25!")], pre: [
          L("narr", "A shadow sweeps across the Driftveil Drawbridge. A flock of Ducklett is diving at the bridge, chasing something."),
        ], post: [L("narr", "Gotcha! Ducklett was caught! It's a better swimmer than flier, and dives for its food.")] },
        { id: "f", type: "battle", name: "Chargestone Cave: Team Plasma", lv: 28, reward: { tm: tmId("bulldoze", 5) }, env: "cave", trainer: plasmaTR("The king's orders! No one gets through Chargestone Cave!", "The king will be... disappointed."),
          waves: [WU("sandile:26", "scraggy:26", "watchog:26"), WU("scraggy:28")], pre: [
          L("uclay", "Galvantula webs across the cave mouth. Hold on... there. Here, TM78 Bulldoze: I owed you one for the Badge. Now get in there, kid."),
          L("utriad", "Our master Ghetsis wishes to see you. ...N is waiting inside. Go."),
          L("un", "Team Plasma is waiting deeper in the cave. Watch yourself. ...I don't want your Pokémon getting hurt."),
        ] },
        { id: "g", type: "battle", name: "Chargestone Cave: Team Plasma Again", lv: 28, reward: { held: "luckyegg" }, env: "cave", trainer: plasmaTR("You think you're a hero? N is the hero!", "Ugh, how?"),
          waves: [WU("trubbish:27", "liepard:27"), WU("liepard:28")], pre: [
          L("ujuniper", "There you are! I'm studying the Klink here. Bianca's my bodyguard! Here, a Lucky Egg: Pokémon holding it gain more Exp."),
        ] },
        { id: "h", type: "battle", name: "Chargestone Cave", lv: 26, env: "cave", wild: 1, catch: "joltik", waves: [WU("ferroseed:25", "klink:25"), WU("joltik:26", "boldore:24")], pre: [
          L("narr", "Magnetised stones float in the air of Chargestone Cave and crackle with static. Joltik cling to the rocks, drinking electricity."),
        ], post: [L("narr", "Gotcha! Joltik was caught! It can't make electricity, so it steals it from other Pokémon.")] },
        { id: "i", type: "side", name: "Chargestone Cave: Ferroseed", lv: 26, env: "cave", wild: 1, catch: "ferroseed", waves: [WU("joltik:25", "klink:25"), WU("ferroseed:26", "ferroseed:25")], pre: [
          L("narr", "A spiked metal seed is stuck to the cave ceiling. When it falls, its spikes sink into the rock: Ferroseed."),
        ], post: [L("narr", "Gotcha! Ferroseed was caught! It absorbs the iron in rocks.")] },
        { id: "j", type: "side", name: "Chargestone Cave: Klink", lv: 26, env: "cave", wild: 1, catch: "klink", waves: [WU("joltik:25", "ferroseed:25"), WU("klink:26", "klink:27")], pre: [
          L("narr", "Two gears spin in the dark, meshed together. Klink's two halves are always a pair."),
        ], post: [L("narr", "Gotcha! Klink was caught! Its two bodies were made for each other.")] },
        { id: "k", type: "side", name: "Chargestone Cave: Tynamo", lv: 27, env: "cave", wild: 1, catch: "tynamo", waves: [WU("joltik:26", "klink:26"), WU("tynamo:27!")], pre: [
          L("narr", "On the cave's lowest floor, a tiny eel glows faintly in a puddle. Tynamo swim in schools that light up together."),
        ], post: [L("narr", "Gotcha! Tynamo was caught! One alone gives off little electricity, but a school of them is like lightning.")] },
        { id: "l", type: "boss", name: "Chargestone Cave: N", lv: 28, env: "cave", trainer: TR("N", "un_n", "A Pokédex records Pokémon as data and nothing else. I won't let that kind of world continue.", "...My friends are tired. But my plans haven't changed."),
          waves: [WU("boldore:28", "ferroseed:28"), WU("joltik:28", "klink:28!")], pre: [
          L("un", "Professor Juniper wants to know about the Pokémon of this cave. She'll put them in her little machine and call it research. Is that what you want too?"),
        ], post: [L("un", "Ghetsis is looking for the stones that hold the legendary dragons. I'll find mine, and become the hero. Then we'll battle again.")] },
        { id: "m", type: "story", name: "Mistralton City", env: "city", pre: [
          L("ucedric", "Ah! You're my daughter's young friend. I'm Cedric Juniper. Let me upgrade your Pokédex. ...There. It can see forms and Shiny colours now."),
          L("uskyla", "I'm Skyla, the Gym Leader. And a pilot! A Pokémon at the Celestial Tower isn't feeling well. Ring the bell at the top for it, would you? Then come and battle me!"),
        ] },
        { id: "n", type: "battle", name: "Celestial Tower", lv: 28, env: "tower", wild: 1, catch: "litwick", waves: [WU("elgyem:27", "litwick:27"), WU("litwick:28", "elgyem:28")], pre: [
          L("narr", "The Celestial Tower is where people come to remember the Pokémon they've lost. Litwick drift up and down its stairs, lighting the way."),
        ], post: [L("narr", "Gotcha! Litwick was caught! Its flame burns on the life force of others. Some say it leads people astray.")] },
        { id: "o", type: "side", name: "Celestial Tower: Elgyem", lv: 28, env: "tower", wild: 1, catch: "elgyem", waves: [WU("litwick:27", "litwick:27"), WU("elgyem:28", "elgyem:29")], pre: [
          L("narr", "Near the top of the tower, something with a big head is watching you and flashing its fingertips in a code."),
        ], post: [L("narr", "Gotcha! Elgyem was caught! It's said to have come from a desert where a UFO crashed.")] },
        { id: "p", type: "battle", name: "Mistralton Gym: Pilot Ted", lv: 32, env: "gym", trainer: TR("Pilot Ted", "un_pilot", "The Gym's cannons will fire you all over the hangar. Hope you don't get airsick!", "Mayday, mayday!"),
          waves: [WU("ducklett:32", "sigilyph:32")] },
        { id: "q", type: "boss", name: "Mistralton Gym: Skyla", lv: 35, env: "gym", badgeWin: 5, reward: { tm: tmId("acrobatics", 5) },
          trainer: TR("Leader Skyla", "un_skyla", "I'm Skyla, the Mistralton Gym Leader. Thanks for ringing the bell! Now, let's take to the skies!", "You're amazing! The Jet Badge is yours, and you've earned it."),
          waves: [WU("swoobat:33+", "unfezant:33+"), WU("swanna:35!")], pre: [
          L("uskyla", "I fly cargo all over Unova with my Swanna. Flying types catch the wind and don't let go!"),
          L("narr", "Flying types are weak to Electric, Ice and Rock moves, and Ground moves can't touch them. Swanna is part Water: Electric hits it twice as hard."),
        ], post: [
          L("uskyla", "Here, TM62 Acrobatics!"),
          L("un", "Ghetsis wants the Light Stone and the Dark Stone. One of them holds the dragon that will choose me. If you're a hero too, the other will choose you."),
        ] },
        { id: "r", type: "chest", name: "Route 7: a Trade", reward: { op: "emolga", lmd: 2000 }, env: "route", pre: [
          L("narr", "In a Hiker's house on Route 7, a man named Manny wants a Boldore for his collection. He gives you his Emolga, Minipete, in exchange."),
        ] },
      ] },
    { id: "c8", part: 1, title: "Twist Mountain and Icirrus City", env: "ice", map: "cave", reward: { lmd: 10000, orundum: 500, icestone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Twist Mountain: Cheren", lv: 35, get reward() { return { tm: tmId("surf", 5) }; }, env: "ice", get trainer() { return cherenTR("Strength... I keep winning against everyone but you. Battle me.", "Why do I want to be strong? ...I don't know anymore."); },
          rivalWaves: () => [WU("unfezant:33@scopelens", cherenMonkey(1) + ":33@" + ({ pansage: "miracleseed", pansear: "charcoal", panpour: "mysticwater" })[cherenMonkey()]), WU("liepard:33@sitrusberry", cherenMon(1) + ":35!@leftovers")], pre: [
          L("narr", "At the foot of Twist Mountain, Cheren is waiting in the snow."),
        ], post: [
          L("ualder", "Ha! Good battle, both of you. Cheren, you want to be strong. But what will you do with that strength, once you have it? Think about that."),
          L("ualder", "Here, HM03 Surf for each of you. The water will take you to places you haven't been."),
        ] },
        { id: "b", type: "side", name: "Mistralton Cave: Axew", lv: 31, env: "cave", wild: 1, catch: "axew", waves: [WU("boldore:30", "woobat:30"), WU("axew:31", "axew:30")], pre: [
          L("narr", "With Surf and Strength, Mistralton Cave opens up. Small dragons with tusks are scraping marks on the walls: Axew."),
        ], post: [L("narr", "Gotcha! Axew was caught! It sharpens its tusks on the rocks. They grow back if they break.")] },
        { id: "c", type: "side", name: "Mistralton Cave: Cobalion", lv: 42, env: "cave", wild: 1, catch: "cobalion", waves: [WU("cobalion:42!")], pre: [
          L("narr", "An old man in the cave tells a legend: once, when a human war set a forest ablaze, three Pokémon saved the Pokémon living there."),
          L("narr", "In the Guidance Chamber at the back of the cave, a blue Pokémon with a steel body turns to face you. It led the Pokémon out of the fire."),
        ], post: [L("narr", "Gotcha! Cobalion was caught! Its heart is as hard as steel.")] },
        { id: "d", type: "side", name: "Rumination Field: Virizion", lv: 42, env: "forest", wild: 1, catch: "virizion", waves: [WU("virizion:42!")], pre: [
          L("narr", "On the far side of Pinwheel Forest, a clearing called the Rumination Field. A green Pokémon with horns like blades is waiting there."),
        ], post: [L("narr", "Gotcha! Virizion was caught! Its horns are sharp as blades, and it moves too fast for the eye.")] },
        { id: "e", type: "chest", name: "Route 18: the Larvesta Egg", reward: { op: "larvesta", lmd: 2000, tm: tmId("waterfall", 5) }, env: "sea", pre: [
          L("narr", "With Surf you reach Route 18 and its rest house. A Pokémon Ranger has an Egg she found in a far-off land, and she'd like it to hatch with a Trainer like you."),
          L("narr", "The Egg is hot to the touch. Before long it hatches: Larvesta, the Pokémon said to have been born from the sun."),
          L("narr", "On Route 18 you also get HM05 Waterfall."),
        ] },
        { id: "f", type: "side", name: "Route 18: Crustle", lv: 35, env: "sea", wild: 1, catch: "crustle", waves: [WU("scraggy:33", "dwebble:31"), WU("crustle:35!")], pre: [
          L("narr", "Route 18's dark grass is full of strong Pokémon. A Crustle drags its huge rock along the beach."),
        ], post: [L("narr", "Gotcha! Crustle was caught! It fights over its rock with others of its kind.")] },
        { id: "g", type: "side", name: "Route 17: Frillish", lv: 25, env: "sea", wild: 1, catch: "frillish", waves: [WU("basculin:20", "alomomola:22"), WU("frillish:25", "frillish:24")], pre: [
          L("narr", "Surfing toward Route 18, you feel something wrap around your leg in the water. A Frillish's veil-like arms."),
        ], post: [L("narr", "Gotcha! Frillish was caught! It wraps its veil-like arms around prey and drags it down.")] },
        { id: "h", type: "side", name: "Route 17: Alomomola", lv: 25, env: "sea", wild: 1, catch: "alomomola", waves: [WU("basculin:20", "frillish:22"), WU("alomomola:25", "alomomola:24")], pre: [
          L("narr", "A pink heart-shaped fish swims up to a hurt Basculin and wraps it in its fins. Alomomola heal the Pokémon around them."),
        ], post: [L("narr", "Gotcha! Alomomola was caught! Its special membrane heals wounds.")] },
        { id: "i", type: "battle", name: "Twist Mountain", lv: 30, env: "ice", wild: 1, catch: "cubchoo", waves: [WU("gurdurr:29", "boldore:29"), WU("cubchoo:30", "woobat:30")], pre: [
          L("narr", "Twist Mountain's tunnels wind deep underground. Clay is checking on the mines. Snow drifts in through cracks in the rock."),
          L("ucheren", "There's a Grunt arguing with a Worker... He says they've found 'that item'. They're heading for the tower north of Icirrus!"),
        ], post: [L("narr", "Gotcha! Cubchoo was caught! Its runny nose is the source of its moves. If it's not runny, it's not well.")] },
        { id: "j", type: "side", name: "Twist Mountain: Cryogonal", lv: 30, env: "ice", wild: 1, catch: "cryogonal", waves: [WU("cubchoo:29", "woobat:29"), WU("cryogonal:30!")], pre: [
          L("narr", "In the coldest tunnel, a snowflake the size of a person hangs in the air, humming."),
        ], post: [L("narr", "Gotcha! Cryogonal was caught! It's made of ice crystals, and it catches prey with chains of ice.")] },
        { id: "k", type: "side", name: "Twist Mountain: Gurdurr", lv: 30, env: "cave", wild: 1, catch: "gurdurr", waves: [WU("boldore:29", "cubchoo:29"), WU("gurdurr:30", "gurdurr:29")], pre: [
          L("narr", "A Gurdurr is carrying a steel beam through the mine as if it weighed nothing."),
        ], post: [L("narr", "Gotcha! Gurdurr was caught! It's so strong that a team of wrestlers can't move it.")] },
        { id: "l", type: "side", name: "Icirrus City: the Puddles", lv: 33, env: "sea", wild: 1, catch: "shelmet", waves: [WU("palpitoad:31", "stunfisk:31"), WU("shelmet:33", "palpitoad:33")], pre: [
          L("narr", "Icirrus City is a quiet town by the marshes. When it's not winter, the streets are full of puddles, and the puddles are full of Pokémon."),
        ], post: [L("narr", "Gotcha! Shelmet was caught! Something about Karrablast makes it evolve.")] },
        { id: "m", type: "side", name: "Icirrus City: Stunfisk", lv: 32, env: "sea", wild: 1, catch: "stunfisk", waves: [WU("palpitoad:31", "shelmet:31"), WU("stunfisk:32", "stunfisk:31")], pre: [
          L("narr", "You step into a puddle and get a shock. Something flat is buried in the mud, grinning."),
        ], post: [L("narr", "Gotcha! Stunfisk was caught! It buries itself in mud and shocks anyone who steps on it.")] },
        { id: "n", type: "side", name: "Icirrus City: Palpitoad", lv: 33, env: "sea", wild: 1, catch: "palpitoad", waves: [WU("shelmet:31", "stunfisk:31"), WU("palpitoad:33", "palpitoad:32")], pre: [
          L("narr", "A chorus of Palpitoad is singing in the marsh, the bumps on their heads trembling with each note."),
        ], post: [L("narr", "Gotcha! Palpitoad was caught! Its vibrations can stun other Pokémon.")] },
        { id: "o", type: "side", name: "Desert Resort: the Darmanitan Statue", lv: 35, env: "volcano", weather: "sand", wild: 1, catch: "darmanitan", waves: [WU("darmanitan:35!")], pre: [
          L("narr", "A woman in Icirrus City gives you a RageCandyBar, an old Mahogany Town sweet. Back in the Desert Resort, you hold it out to one of the Darmanitan statues by Relic Castle."),
          L("narr", "The statue sniffs. Its stone cracks. It was never a statue at all.")], post: [L("narr", "Gotcha! Darmanitan was caught! When it's hurt, it turns to stone and thinks with a calm mind.")] },
        { id: "p", type: "battle", name: "Icirrus Gym: Black Belt Kendrew", lv: 37, env: "ice", trainer: TR("Black Belt Kendrew", "un_blackbelt", "The ice is slippery! Can you keep your footing?", "I slipped..."),
          waves: [WU("cubchoo:37")] },
        { id: "q", type: "boss", name: "Icirrus Gym: Brycen", lv: 39, env: "ice", badgeWin: 6, reward: { tm: tmId("frostbreath", 5) },
          trainer: TR("Leader Brycen", "un_brycen", "I am Brycen, the Icirrus Gym Leader. I was an actor once. Show me the bond between you and your Pokémon in this frozen place!", "Your bond is real. The Freeze Badge is yours."),
          waves: [WU("vanillish:37+", "cryogonal:37+"), WU("beartic:39!")], pre: [
          L("ubrycen", "Ice is cold and hard, but it breaks easily. Can your Pokémon keep their spirits up in this cold?"),
          L("narr", "Ice types are weak to Fire, Fighting, Rock and Steel moves."),
        ], post: [
          L("ubrycen", "Take TM79 Frost Breath as well."),
          L("utriad", "Our master Ghetsis has a message for you. He awaits you at Dragonspiral Tower."),
        ] },
      ] },
    { id: "c9", part: 1, title: "Dragonspiral Tower and Relic Castle", env: "tower", map: "tower", reward: { lmd: 11000, orundum: 600 },
      nodes: [
        { id: "a", type: "battle", name: "Dragonspiral Tower: Team Plasma", lv: 34, reward: { key: "un_oldgateau" }, env: "tower", trainer: plasmaTR("Our king is awakening the dragon! Nobody disturbs him!", "No... the king..."),
          waves: [WU("watchog:34"), WU("liepard:34")], pre: [
          L("ucedric", "Dragonspiral Tower is the oldest building in Unova. Team Plasma broke through the wall! Here, an Old Gateau. Be careful in there."),
          L("ubrycen", "Cheren and I will hold them off down here. Go up!"),
        ] },
        { id: "b", type: "battle", name: "Dragonspiral Tower: Giallo's Grunts", lv: 34, env: "tower", trainer: plasmaTR("Lord Giallo says not one step further!", "Lord Giallo... forgive us..."),
          waves: [WU("liepard:33", "liepard:33"), WU("watchog:32", "krokorok:32", "scraggy:32")], pre: [
          L("usage", "I am Giallo of the Seven Sages. The king is upstairs, with the dragon. My Grunts will see that you don't interrupt them."),
        ] },
        { id: "c", type: "battle", name: "Dragonspiral Tower: the Last Grunts", lv: 34, env: "tower", trainer: plasmaTR("This is the last line! You'll never reach the king!", "The king..."),
          waves: [WU("krokorok:34"), WU("trubbish:33", "liepard:33")] },
        { id: "d", type: "story", name: "Dragonspiral Tower: the Dragon Awakens", env: "tower", pre: [
          L("narr", "At the top of the tower, lightning tears the sky. A black dragon rises behind N: Zekrom, the dragon of ideals."),
          L("un", "Zekrom has chosen me. I am the hero. With it, I'll make a world where Pokémon are free. If you want to stop me, find the other dragon. Find Reshiram, the dragon of truth."),
          L("narr", "N climbs onto Zekrom's back and flies off into the storm."),
          L("ualder", "So, the king of Team Plasma has a legendary dragon. ...Go to Relic Castle. If the Light Stone is anywhere, it's there."),
        ] },
        { id: "e", type: "battle", name: "Dragonspiral Tower", lv: 32, env: "tower", wild: 1, catch: "golett", waves: [WU("mienfoo:31", "druddigon:31"), WU("golett:32", "mienfoo:32")], pre: [
          L("narr", "The tower's lower floors are home to Pokémon as old as the tower itself. A Golett lumbers through the rubble."),
        ], post: [L("narr", "Gotcha! Golett was caught! It was made from clay by an ancient people to guard them.")] },
        { id: "f", type: "side", name: "Dragonspiral Tower: Mienfoo", lv: 32, env: "tower", wild: 1, catch: "mienfoo", waves: [WU("golett:31", "druddigon:31"), WU("mienfoo:32", "mienfoo:33")], pre: [
          L("narr", "In the grass outside the tower, a Mienfoo is practising its kicks."),
        ], post: [L("narr", "Gotcha! Mienfoo was caught! It strikes faster than the eye can follow.")] },
        { id: "g", type: "side", name: "Dragonspiral Tower: Druddigon", lv: 33, env: "tower", wild: 1, catch: "druddigon", waves: [WU("golett:31", "mienfoo:31"), WU("druddigon:33!")], pre: [
          L("narr", "A Druddigon is warming its wings in the sun by the tower's entrance. It doesn't like being disturbed."),
        ], post: [L("narr", "Gotcha! Druddigon was caught! It warms its body in the sun before it can move.")] },
        { id: "h", type: "side", name: "Dragonspiral Tower: Sawsbuck", lv: 35, env: "tower", wild: 1, catch: "sawsbuck", waves: [WU("deerling:31", "mienfoo:31"), WU("sawsbuck:35!")], pre: [
          L("narr", "In the dark grass around the tower, a Sawsbuck wears the season in its antlers."),
        ], post: [L("narr", "Gotcha! Sawsbuck was caught! It migrates with the seasons.")] },
        { id: "i", type: "battle", name: "Relic Castle: Team Plasma", lv: 35, env: "cave", weather: "sand", trainer: plasmaTR("Lord Ryoku says Ghetsis is testing you. We're the test!", "We failed the test..."),
          waves: [WU("watchog:34", "krokorok:34", "krokorok:34"), WU("scraggy:35", "watchog:35")], pre: [
          L("narr", "A Worker has cleared the sand from Relic Castle's lower floors. The stairs go down, and down."),
          L("usage", "I am Ryoku of the Seven Sages. Ghetsis wishes to see what you're made of. Go on, then. Show us."),
        ] },
        { id: "j", type: "battle", name: "Relic Castle: the Deep Floors", lv: 36, env: "cave", weather: "sand", trainer: plasmaTR("You made it this far? It doesn't matter, the Stone isn't here!", "Ugh... go see Ghetsis yourself."),
          waves: [WU("garbodor:36"), WU("trubbish:35", "liepard:35")] },
        { id: "k", type: "battle", name: "Relic Castle", lv: 36, env: "cave", weather: "sand", wild: 1, catch: "krokorok", waves: [WU("cofagrigus:34", "krokorok:35"), WU("krokorok:36", "cofagrigus:36")], pre: [
          L("narr", "Relic Castle's deep floors are full of quicksand and Pokémon that have never seen the sun."),
        ], post: [L("narr", "Gotcha! Krokorok was caught! It sees in the dark with a membrane over its eyes.")] },
        { id: "l", type: "side", name: "Relic Castle: Cofagrigus", lv: 36, env: "cave", weather: "sand", wild: 1, catch: "cofagrigus", waves: [WU("krokorok:35", "krokorok:35"), WU("cofagrigus:36!")], pre: [
          L("narr", "A golden coffin stands upright in a buried hall. Its lid opens, and four black hands reach out."),
        ], post: [L("narr", "Gotcha! Cofagrigus was caught! It's said to swallow grave robbers.")] },
        { id: "m", type: "story", name: "Relic Castle: Ghetsis", env: "cave", pre: [
          L("ughetsis", "Welcome. The Light Stone is not here, I'm afraid. N has his dragon. Find the stone, wake the dragon of truth... and face our king. That is what I want."),
          L("ualder", "Ghetsis. Whatever you're planning, you won't get away with it."),
          L("ughetsis", "Ah, the Champion. We'll see."),
        ] },
        { id: "n", type: "story", name: "Nacrene Museum: the Light Stone", reward: { key: "un_lightstone" }, env: "lab", pre: [
          L("ulenora", "The Dragon Skull Team Plasma tried to steal wasn't what they were after. It was this: the Light Stone. It's been in our museum all along."),
          L("ujuniper", "The Light Stone holds Reshiram, the dragon of truth. It's yours. If anyone can wake it, it's you."),
        ] },
      ] },
    { id: "c10", part: 1, title: "Opelucid City", env: "city", map: "city", reward: { lmd: 12000, orundum: 600, dragonscale: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 8: Bianca", lv: 40, reward: { key: "un_fullrestore" }, env: "route", weather: "rain", get trainer() { return biancaTR("I'm going to help the Professor with her research! But first, one more battle with you!", "Thank you. That was my best battle ever."); },
          rivalWaves: () => [WU("stoutland:38", biancaMonkey(1) + ":38", "musharna:38"), WU(biancaMon(2) + ":40!")], pre: [
          L("narr", "Rain is always falling on Route 8 and the Moor of Icirrus. Bianca is waiting at the Tubeline Bridge gate."),
          L("ubianca", "I've decided something. I'm not going to be the strongest Trainer. I'm going to work with Professor Juniper. But I still want to battle you!"),
        ], post: [L("ubianca", "Here, a Full Restore. You're going to need it. Go get 'em!")] },
        { id: "b", type: "story", name: "Tubeline Bridge", env: "sea", pre: [
          L("ughetsis", "So you have the Light Stone. Excellent. Our king awaits you at the Pokémon League. Defeat the Elite Four, then face him there."),
          L("utriad", "Whatever happens, Lord Ghetsis has foreseen it."),
        ] },
        { id: "c", type: "battle", name: "Route 9", lv: 33, env: "route", wild: 1, catch: "pawniard", waves: [WU("garbodor:32", "gothorita:32"), WU("pawniard:33", "liepard:33")], pre: [
          L("narr", "Route 9 runs from the Tubeline Bridge to Opelucid City, past Shopping Mall Nine. Pawniard hunt in packs here."),
        ], post: [L("narr", "Gotcha! Pawniard was caught! Its whole body is made of blades.")] },
        { id: "d", type: "side", name: "Route 9: Gothorita", lv: 34, env: "route", wild: 1, catch: "gothorita", waves: [WU("pawniard:32", "garbodor:32"), WU("gothorita:34", "gothorita:33")], pre: [
          L("narr", "A Gothorita sits in the grass looking up at the stars, though the sun is high."),
        ], post: [L("narr", "Gotcha! Gothorita was caught! On starry nights it controls sleeping children like puppets.")] },
        { id: "e", type: "battle", name: "Route 9: Hooligans Jim & Cas", lv: 37, env: "route", trainer: TR("Hooligans Jim & Cas", "un_roughneck", "This is our turf! Two on two, let's go!", "Aw, man..."),
          waves: [WU("scraggy:37", "scraggy:37")] },
        { id: "f", type: "story", name: "Opelucid City", env: "city", pre: [
          L("ughetsis", "People of Opelucid! Our king has woken the legendary dragon Zekrom! He is a hero! Free your Pokémon!"),
          L("udrayden", "I am Drayden, the mayor of this city and its Gym Leader. That man is dangerous. The legend says the dragons split when the twin heroes quarrelled: truth against ideals."),
          L("uiris", "Hi again! I'm training to be a Dragon Master with Drayden. The dragon of truth will wake when it finds a hero it believes in. Maybe that's you!"),
        ] },
        { id: "g", type: "battle", name: "Opelucid Gym: Ace Trainer Tom", lv: 39, env: "gym", trainer: TR("Ace Trainer Tom", "un_acetrainer", "Drayden's dragons are the strongest in Unova. Get past mine first!", "My dragons..."),
          waves: [WU("deino:39", "fraxure:39", "druddigon:39")] },
        { id: "h", type: "boss", name: "Opelucid Gym: Drayden", lv: 43, env: "gym", badgeWin: 7, reward: { tm: tmId("dragontail", 5) },
          trainer: TR("Leader Drayden", "un_drayden", "I am Drayden. Dragon types are proud, and strong. Show me the strength to stand against the man who has the dragon!", "Splendid. You have the strength we need. Take the Legend Badge."),
          waves: [WU("fraxure:41+", "druddigon:41+"), WU("haxorus:43!")], pre: [
          L("udrayden", "Haxorus's tusks can cut through steel. Dragons are hit hard by Ice and Dragon moves... if you can land one."),
          L("narr", "Dragon types are weak to Ice and Dragon moves. Druddigon's Rough Skin hurts anything that touches it."),
        ], post: [L("udrayden", "And this: TM82 Dragon Tail.")] },
        { id: "i", type: "chest", name: "Opelucid City: the Professor's Gift", reward: { gold5: 1, lmd: 3000 }, env: "city", pre: [
          L("ujuniper", "You've got all eight Badges! Then take this: a Master Ball. It catches any Pokémon without fail. Use it well."),
        ] },
        { id: "j", type: "side", name: "Route 7: the Storm", lv: 40, env: "route", weather: "rain", wild: 1, catch: "tornadus", waves: [WU("tornadus:40!")], pre: [
          L("narr", "A woman in the Route 10 gate says a strange storm has hit Route 7. There, an old lady pulls you into her house. 'It's Tornadus,' she says. 'The wind spirit.'"),
          L("narr", "You step outside. Above the storm, something with a cloud for a body is flying in circles, laughing."),
        ], post: [L("narr", "Gotcha! Tornadus was caught! It flies at 300 kilometres an hour, and leaves storms behind it.")] },
      ] },
    { id: "c11", part: 1, title: "Victory Road", env: "cave", map: "cave", reward: { lmd: 13000, orundum: 600 },
      nodes: [
        { id: "a", type: "battle", name: "Route 10: Cheren", lv: 45, reward: { key: "un_maxrevives" }, env: "route", get trainer() { return cherenTR("I know what I want now. Not just strength. Strength to protect people. Let's battle!", "...I'm glad it was you. Go. Stop N."); },
          rivalWaves: () => [WU("unfezant:43@scopelens", cherenMonkey(1) + ":43@" + ({ pansage: "miracleseed", pansear: "charcoal", panpour: "mysticwater" })[cherenMonkey()]), WU("liepard:43@sitrusberry", cherenMon(2) + ":45!@leftovers")], pre: [
          L("narr", "Route 10 leads to the Badge Check Gates and Victory Road. Cheren is on the bridge."),
          L("ucheren", "Before you go to the League... I want to see how strong we've both become."),
        ], post: [L("ubianca", "Wait, wait! I'm here too! Take these Max Revives. And good luck!")] },
        { id: "b", type: "battle", name: "Route 10", lv: 36, env: "route", wild: 1, catch: "vullaby", waves: [WU("bouffalant:35", "foongus:35"), WU("vullaby:36", "bouffalant:35")], pre: [
          L("narr", "Route 10 is a long road of tall grass, overlooked by the Badge Check Gates. A Vullaby circles overhead in its broken shell."),
        ], post: [L("narr", "Gotcha! Vullaby was caught! Its wings are too small to fly far, so it wears the bones of its prey to protect its bottom.")] },
        { id: "c", type: "side", name: "Route 10: Bouffalant", lv: 35, env: "route", wild: 1, catch: "bouffalant", waves: [WU("vullaby:34", "foongus:34"), WU("bouffalant:35", "bouffalant:34")], pre: [
          L("narr", "A herd of Bouffalant charges across the route. Their afros soak up the force of the collision."),
        ], post: [L("narr", "Gotcha! Bouffalant was caught! Its huge afro cushions its headbutts.")] },
        { id: "d", type: "side", name: "Route 10: Amoonguss", lv: 40, env: "forest", wild: 1, catch: "amoonguss", waves: [WU("bouffalant:39", "vullaby:36"), WU("amoonguss:40!")], pre: [
          L("narr", "In Route 10's dark grass, two big Poké Balls are lying side by side. They aren't Poké Balls."),
        ], post: [L("narr", "Gotcha! Amoonguss was caught! It sways the Poké Ball patterns on its arms to lure prey.")] },
        { id: "e", type: "battle", name: "Victory Road", lv: 40, env: "cave", wild: 1, catch: "deino", waves: [WU("durant:39", "heatmor:39"), WU("deino:40", "boldore:38")], pre: [
          L("narr", "Victory Road climbs through cliffs and caves to the Pokémon League. In the dark, something bites at everything it touches: a Deino."),
        ], post: [L("narr", "Gotcha! Deino was caught! It can't see, so it bites at anything that moves.")] },
        { id: "f", type: "side", name: "Victory Road: Durant", lv: 40, env: "cave", wild: 1, catch: "durant", waves: [WU("heatmor:38", "boldore:38"), WU("durant:40", "durant:39")], pre: [
          L("narr", "A column of steel ants marches through the tunnel. Durant work together to build nests in the rock."),
        ], post: [L("narr", "Gotcha! Durant was caught! It has steel armour and fights off Heatmor in groups.")] },
        { id: "g", type: "side", name: "Victory Road: Heatmor", lv: 40, env: "volcano", wild: 1, catch: "heatmor", waves: [WU("durant:38", "durant:38"), WU("heatmor:40!")], pre: [
          L("narr", "A Heatmor breathes fire through its long snout and sucks up Durant. They hate each other."),
        ], post: [L("narr", "Gotcha! Heatmor was caught! Its body is like a furnace.")] },
        { id: "h", type: "side", name: "Victory Road: Excadrill", lv: 41, env: "cave", wild: 1, catch: "excadrill", waves: [WU("durant:39", "boldore:39"), WU("excadrill:41!")], pre: [
          L("narr", "A dust cloud spins out of the cave floor. Something with steel claws is drilling up toward you."),
        ], post: [L("narr", "Gotcha! Excadrill was caught! It can drill through steel.")] },
        { id: "i", type: "side", name: "Victory Road: Fraxure", lv: 40, env: "route", wild: 1, catch: "fraxure", waves: [WU("heatmor:38", "vullaby:38"), WU("fraxure:40!")], pre: [
          L("narr", "On the rough ground outside, a Fraxure is slicing at a boulder with its tusks."),
        ], post: [L("narr", "Gotcha! Fraxure was caught! It sharpens its tusks on rocks and battles for territory.")] },
        { id: "j", type: "side", name: "Victory Road: Terrakion", lv: 42, env: "cave", wild: 1, catch: "terrakion", waves: [WU("terrakion:42!")], pre: [
          L("narr", "In the Trial Chamber, deep in Victory Road, a grey Pokémon as solid as a mountain is waiting. It smashed the rocks so the others could escape the fire."),
        ], post: [L("narr", "Gotcha! Terrakion was caught! Its charge can smash through a castle wall.")] },
        { id: "k", type: "battle", name: "Victory Road: Veteran Martell", lv: 46, env: "cave", trainer: TR("Veteran Martell", "un_veteran", "You've come all this way to reach the League. One last test!", "You're ready. Go."),
          waves: [WU("gigalith:45", "eelektross:46")] },
      ] },
    { id: "c12", part: 1, title: "The Pokémon League and N's Castle", env: "plateau", map: "plateau", reward: { lmd: 20000, orundum: 1000 },
      nodes: [
        { id: "a", type: "boss", name: "Elite Four Shauntal", lv: 50, env: "plateau",
          trainer: TR("Elite Four Shauntal", "un_shauntal", "I'm Shauntal of the Elite Four. I write novels about the Pokémon I battle. Let me write a chapter about yours!", "...My Pokémon and I were so moved, we forgot to win."),
          waves: [WU("cofagrigus:48", "jellicent:48"), WU("golurk:48", "chandelure:50!")], pre: [
          L("narr", "Unova's Pokémon League: four towers around a central statue. You can challenge the Elite Four in any order."),
          L("narr", "Ghost types are weak to Ghost and Dark moves, and Normal and Fighting moves can't touch them."),
        ] },
        { id: "b", type: "boss", name: "Elite Four Grimsley", lv: 50, env: "plateau",
          trainer: TR("Elite Four Grimsley", "un_grimsley", "I'm Grimsley of the Elite Four. Life is a serious battle, and you have to live with the cards you're dealt. Let's see your hand.", "Whether you win or lose, you live with it. Well played."),
          waves: [WU("scrafty:48", "krookodile:48"), WU("liepard:48", "bisharp:50!")], pre: [
          L("narr", "Dark types are weak to Fighting, Bug and Fairy moves, and Psychic moves can't touch them."),
        ] },
        { id: "c", type: "boss", name: "Elite Four Caitlin", lv: 50, env: "plateau",
          trainer: TR("Elite Four Caitlin", "un_caitlin", "I'm Caitlin of the Elite Four. I hope you'll show me something worth waking up for.", "That was... a pleasant dream."),
          waves: [WU("reuniclus:48", "musharna:48"), WU("sigilyph:48", "gothitelle:50!")], pre: [
          L("narr", "Psychic types are weak to Bug, Ghost and Dark moves."),
        ] },
        { id: "d", type: "boss", name: "Elite Four Marshal", lv: 50, env: "plateau",
          trainer: TR("Elite Four Marshal", "un_marshal", "I'm Marshal of the Elite Four, Alder's student. Fighting Pokémon. Let's test our strength!", "Whew! You're as strong as they said."),
          waves: [WU("throh:48", "sawk:48"), WU("conkeldurr:48", "mienshao:50!")], pre: [
          L("narr", "Fighting types are weak to Flying, Psychic and Fairy moves."),
        ] },
        { id: "e", type: "story", name: "The Champion's Room", env: "plateau", pre: [
          L("narr", "The statue lowers you into the Champion's temple. Alder is on his knees. Zekrom stands over him, and N beside it."),
          L("un", "I've defeated the Champion. Now I'll build my castle here, and Unova will listen to me."),
          L("narr", "The ground shakes. A castle rises out of the earth around the Pokémon League, and a bridge reaches out to you."),
          L("ucheren", "Alder! ...We'll handle this. Go!"),
        ] },
        { id: "f", type: "story", name: "N's Castle", env: "tower", pre: [
          L("narr", "Six of the Seven Sages block the castle gate. Then the Gym Leaders arrive, one after another: Lenora, Burgh, Elesa, Clay, Skyla, Brycen, Drayden."),
          L("uclay", "We'll keep these Sages busy. You go on up, kid!"),
          L("narr", "Inside, a woman named Anthea heals your Pokémon. On the fourth floor is N's room: toys everywhere, a basketball hoop, a train set. A child's room."),
        ] },
        { id: "g", type: "boss", name: "N's Castle: Reshiram", lv: 50, env: "tower", wild: 1, catch: "reshiram", waves: [WU("reshiram:50!")], pre: [
          L("un", "Zekrom, come to me. ...And now, if you are a hero, the stone will answer you."),
          L("narr", "The Light Stone leaves your Bag. It glows, and flames pour out of it. Reshiram, the dragon of truth, wants to see whether you are worthy of it."),
        ], post: [L("narr", "Gotcha! Reshiram was caught! The dragon of truth has chosen you.")] },
        { id: "h", type: "boss", name: "N's Castle: N", lv: 52, env: "tower",
          trainer: TR("N", "un_n", "Zekrom chose me, and Reshiram chose you. Two heroes. Let's see which of us is right!", "...Your truth and my ideals. Maybe neither of us was wrong."),
          waves: [WU("zekrom:52!", "carracosta:50", "vanilluxe:50"), WU("archeops:50", "zoroark:50", "klinklang:50")], pre: [
          L("un", "Pokémon and people. Should they be together, or apart? We'll let our dragons decide."),
        ] },
        { id: "i", type: "boss", name: "N's Castle: Ghetsis", lv: 54, env: "tower",
          trainer: TR("Ghetsis", "un_ghetsis", "N was never anything but my puppet, raised to be a perfect king. I wanted Team Plasma to rule Unova! And I'll crush you myself!", "Impossible! I am Ghetsis of Team Plasma!"),
          waves: [WU("cofagrigus:52", "bouffalant:52", "seismitoad:52"), WU("bisharp:52", "eelektross:52", "hydreigon:54!")], pre: [
          L("ughetsis", "Liberate Pokémon? Nonsense. If people let go of their Pokémon, only Team Plasma will have them. Only I will!"),
        ], post: [
          L("ualder", "It's over, Ghetsis. Cheren, take him away."),
          L("un", "In Accumula Town, your Pokémon said they liked being with you. I couldn't understand it. Now I think I do. ...Goodbye."),
          L("narr", "N climbs onto Zekrom and flies away through the castle wall. The credits roll... and Unova's story goes on."),
        ] },
      ] },
    { id: "c13", part: 1, title: "After the Credits", env: "route", map: "sea", reward: { lmd: 25000, orundum: 1200 },
      nodes: [
        { id: "a", type: "story", name: "Nuvema Town: the Seven Sages", reward: { key: "un_superrod" }, env: "city", pre: [
          L("ulooker", "Your mother's twin? No, no. I am Looker, of the International Police. The Seven Sages are still at large. Will you help me find them? Here, a Super Rod."),
          L("ucedric", "And I've upgraded your Pokédex to the National Pokédex. Pokémon from far away have started turning up in eastern Unova."),
          L("narr", "One by one, you find the Sages: Rood on Route 18, Gorm in the Dreamyard, Zinzolin in the Cold Storage, Giallo on Route 14. None of them fights. Looker takes them away."),
        ] },
        { id: "b", type: "battle", name: "Chargestone Cave: Bronius's Grunts", lv: 63, env: "cave", trainer: plasmaTR("Lord Bronius isn't going anywhere! Not while we're here!", "Lord Bronius..."),
          waves: [WU("watchog:63", "scrafty:63"), WU("liepard:62", "garbodor:62", "liepard:62")], pre: [
          L("usage", "I am Bronius. I won't be caught so easily. Grunts!"),
        ], post: [L("usage", "...I see. Ghetsis lied to all of us. I'll go quietly.")] },
        { id: "c", type: "battle", name: "Relic Castle: Ryoku's Lookout", lv: 64, reward: { key: "un_ragecandybar" }, env: "cave", weather: "sand", trainer: plasmaTR("Lord Ryoku's catching the sun Pokémon for Ghetsis. You can't come in!", "Ghetsis is gone? Then what are we doing here?"),
          waves: [WU("krookodile:64")], pre: [
          L("ujuniper", "There's a Pokémon at the very bottom of Relic Castle that people used to worship as the sun. Ryoku went down there. Be careful. Oh, and take this RageCandyBar!"),
        ], post: [L("usage", "I am Ryoku. Volcarona would have been Ghetsis's... but Ghetsis is finished. Looker, I'm yours.")] },
        { id: "d", type: "side", name: "Relic Castle: Volcarona", lv: 70, env: "volcano", wild: 1, catch: "volcarona", waves: [WU("volcarona:70!@silverpowder")], pre: [
          L("narr", "In the deepest room of Relic Castle, the air shimmers with heat. A great moth spreads its six burning wings. When ash darkened the skies long ago, it's said to have been a second sun."),
        ], post: [L("narr", "Gotcha! Volcarona was caught! Its wings scatter scales of fire.")] },
        { id: "e", type: "side", name: "The Dreamyard: Musharna", lv: 50, env: "forest", wild: 1, catch: "musharna", waves: [WU("musharna:50!")], pre: [
          L("narr", "Every Friday, a Musharna floats in the Dreamyard's basement, wrapped in its dream mist. It's the one that saved the little Munna."),
        ], post: [L("narr", "Gotcha! Musharna was caught! The mist it gives off shows the dreams of everyone nearby.")] },
        { id: "f", type: "side", name: "Liberty Garden: Team Plasma", lv: 20, env: "sea", trainer: plasmaTR("Victini belongs to Team Plasma now! We'll use its power!", "We were never going to win, were we..."),
          waves: [WU("patrat:18", "sandile:17", "patrat:17"), WU("sandile:18", "scraggy:17", "watchog:20!")], pre: [
          L("narr", "With a Liberty Pass, a boat takes you from Castelia to Liberty Garden, the island with the lighthouse. Team Plasma got there first."),
        ] },
        { id: "g", type: "side", name: "Liberty Garden: Victini", lv: 15, env: "tower", wild: 1, catch: "victini", waves: [WU("victini:15!")], pre: [
          L("narr", "In the lighthouse's basement, a little Pokémon with V-shaped ears is waiting. It brings victory to whoever it chooses."),
        ], post: [L("narr", "Gotcha! Victini was caught! It shares its endless energy with those it trusts.")] },
        { id: "h", type: "side", name: "Giant Chasm: Kyurem", lv: 75, env: "ice", weather: "hail", wild: 1, catch: "kyurem", waves: [WU("kyurem:75!")], pre: [
          L("narr", "East of Lacunosa Town, a meteor once made a crater: the Giant Chasm. An old woman in Lacunosa says a monster comes out of it on cold nights."),
          L("narr", "As you near the pit at the forest's heart, snow falls out of a clear sky. In a small cave, a grey dragon is waiting, its body half frozen: Kyurem."),
        ], post: [L("narr", "Gotcha! Kyurem was caught! It's said to be the empty shell left when the first dragon split in two.")] },
        { id: "i", type: "side", name: "Abundant Shrine: Landorus", lv: 70, env: "route", weather: "sand", wild: 1, catch: "landorus", waves: [WU("landorus:70!")], pre: [
          L("narr", "Long ago, Landorus punished Tornadus and Thundurus for their storms. At the Abundant Shrine on Route 14, with both of them beside you (Thundurus from a trade), it comes down from the sky."),
        ], post: [L("narr", "Gotcha! Landorus was caught! Wherever it goes, the harvest is rich.")] },
        { id: "j", type: "boss", name: "Undella Town: Cynthia", lv: 77, reward: { tm: tmId("dive", 5) }, env: "sea",
          trainer: TR("Cynthia", "un_cynthia", "I'm Cynthia, the Sinnoh Champion. I'm on holiday here, but I'm never too tired for a battle. Shall we?", "That was wonderful. I can see why Unova's talking about you."),
          waves: [WU("spiritomb:75", "eelektross:75", "milotic:75"), WU("braviary:75", "lucario:75", "garchomp:77!")], pre: [
          L("narr", "Undella Town is a seaside resort, busy in summer and quiet the rest of the year. A girl on the beach gives you HM06 Dive."),
          L("narr", "In Caitlin's villa, a woman in black is reading on the sofa."),
          L("ucynthia", "There was a young Trainer in Sinnoh who beat me, and Giratina too. You remind me of them."),
        ] },
        { id: "k", type: "boss", name: "The Pokémon League: Champion Alder", lv: 77, env: "plateau",
          trainer: TR("Champion Alder", "un_alder", "I'm Alder, Unova's Champion. When I lost my first partner, I went wandering. I've learned a few things on the road. Let me show you!", "Ha! You're a fine Trainer. A fine one. Unova's in good hands."),
          waves: [WU("accelgor:75", "bouffalant:75", "druddigon:75"), WU("vanilluxe:75", "escavalier:75", "volcarona:77!")], pre: [
          L("narr", "On the roof of the Celestial Tower, Alder rings the bell for the partner he lost. 'Come to the League,' he says. 'I'll be waiting.'"),
          L("ualder", "The Elite Four are stronger now, and so am I. Let's have a battle we'll both remember."),
        ], post: [
          L("ualder", "That's how a battle should feel! ...You've seen Unova from one end to the other. But the story's not over."),
          L("narr", "Part 1 of the Unova Journey is complete. Two years pass..."),
        ] },
      ] },
    // ======================== Part 2: Black 2/White 2, two years later (Challenge Mode's teams, at its levels) ========================
    { id: "c14", part: 2, title: "Aspertia City and Floccesy Town", env: "route", map: "route", reward: { lmd: 4000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Aspertia City: Bianca's Case", env: "city", starter: 1, giver: ["Bianca", "un_bianca"], pre: [
          L("narr", "Two years have passed. Aspertia City, in Unova's far southwest, sits on a hill above the sea. Professor Juniper's assistant has come to town."),
          L("uhugh", "There you are! I'm Hugh, remember? Bianca's up at the Aspertia Outlook with Pokémon for us. Let's go!"),
          L("ubianca", "Hi! I'm Bianca, Professor Juniper's assistant now. I've brought Pokémon from her lab. Choose one: it's yours."),
        ], post: [
          L("uhugh", "Then I'll take the one that's strong against yours. Team Plasma took my little sister's Purrloin five years ago. I'm getting strong enough to take it back. Battle me!"),
        ] },
        // (Hugh's starter is the one strong against yours: the first rival battle is below the games' Lv 5, as in the other Journeys,
        // README, House rules: Lv 4, where every starter wins 98-100%; Challenge Mode's is Lv 6)
        { id: "b", type: "battle", name: "Aspertia Outlook: Hugh", lv: 4, reward: { key: "un_biancaballs" }, env: "city", get trainer() { return hughTR("My partner and I are going to beat you, then Team Plasma!", "Argh! We lost? ...We'll get stronger. Both of us."); },
          rivalWaves: () => [[{ op: hughMon(0), LV: 4, moves: { snivy: ["tackle", "leer"], tepig: ["tackle", "tailwhip"], oshawott: ["tackle", "tailwhip"] }[hughMon(0)] }]], pre: [
          L("ubianca", "A battle already? Okay! Have fun, both of you!"),
        ], post: [L("ubianca", "Here's a Pokédex for each of you, and ten Poké Balls. The Professor wants to know about every Pokémon in Unova. Good luck!")] },
        { id: "c", type: "battle", name: "Route 19", lv: 4, env: "route", wild: 1, catch: "patrat", waves: [WU("purrloin:3", "patrat:3"), WU("patrat:4", "purrloin:4")], pre: [
          L("ubianca", "Let me show you how to catch a Pokémon! My Lillipup weakens it, and then... a Poké Ball! Now you try."),
          L("ualder", "Ho there! You're new Trainers, eh? I'm Alder. I live in Floccesy Town, just ahead. Your friend Hugh's gone on to Route 20."),
        ], post: [L("narr", "Gotcha! Patrat was caught! It keeps watch over its nest by storing food in its cheeks.")] },
        { id: "d", type: "battle", name: "Floccesy Ranch: Hugh", lv: 9, env: "route", get trainer() { return hughTR("You again! I've been training at the ranch. Let's see who's grown more!", "Grr... You're tough. Fine, I'll keep training."); },
          rivalWaves: () => [WU(hughMon(0) + ":9!")], pre: [
          L("narr", "Floccesy Ranch: sheep-like Mareep and Herdier out in the fields. The ranchers' Herdier has gone missing."),
        ], post: [
          L("narr", "In the woods behind the ranch, a Team Plasma Grunt in a black uniform has cornered the Herdier. He throws something at you and runs: a TM. The Herdier is safe."),
        ] },
        { id: "e", type: "battle", name: "Route 20", lv: 10, env: "forest", wild: 1, catch: "sewaddle", waves: [WU("pidove:9", "patrat:10"), WU("sewaddle:10", "venipede:10")], pre: [
          L("narr", "Route 20's dark grass runs around the ranch. Sewaddle wrap themselves in leaves in the shade."),
        ], post: [L("narr", "Gotcha! Sewaddle was caught! It makes its clothes from leaves and sticky silk.")] },
        { id: "f", type: "battle", name: "Floccesy Town: Alder's Students", lv: 10, env: "route", trainer: TR("School Kids Seymour & Cassie", "un_schoolkid", "Alder's teaching us to battle! Watch this!", "Mr. Alder, we lost!"),
          get waves() { return [WU(MONKEY[UNOVA_WEAK[unova2Starter()]][0] + ":10"), WU(MONKEY[UNOVA_STRONG[unova2Starter()]][0] + ":10")]; }, pre: [
          L("ualder", "These two have been learning from me. Battle them, would you? Then I'll tell you something good: the Aspertia Gym's open again."),
        ] },
        { id: "g", type: "battle", name: "Aspertia Gym: Youngster Pedro", lv: 10, env: "gym", trainer: TR("Youngster Pedro", "un_youngster", "Our Gym Leader's new, but he's tough. You'll see!", "He really is tough... I mean, you are!"),
          waves: [WU("patrat:10", "lillipup:10")] },
        { id: "h", type: "boss", name: "Aspertia Gym: Cheren", lv: 14, env: "gym", badgeWin: 0, get reward() { return { tm: [tmId("workup", 5), tmId("return", 5)], key: "un_cgear" }; },
          trainer: TR("Leader Cheren", "un_cheren2", "I'm Cheren, the Aspertia Gym Leader. Two years ago I was a Trainer like you. Now I want to help you find what you're looking for. Let's begin!", "You found it, I think. The Basic Badge is yours."),
          waves: [WU("patrat:12+", "pidove:12+"), WU("lillipup:14!@oranberry")], pre: [
          L("ucheren2", "I used to think strength was everything. A wise man showed me what it's for. I'll show you what I learned."),
          L("narr", "Normal types fear only Fighting moves, and Ghost moves can't touch them. Every Pokémon here knows Work Up."),
        ], post: [L("ucheren2", "Here, TM83 Work Up."), L("ubianca", "Congratulations! Here, TM27 Return, and a C-Gear. Oh, and Cheren says Virbank City's Gym is next. It's a Poison Gym!")] },
      ] },
    { id: "c15", part: 2, title: "Virbank City", env: "city", map: "city", reward: { lmd: 5000, orundum: 300 },
      nodes: [
        { id: "a", type: "battle", name: "Virbank Complex", lv: 13, env: "plant", wild: 1, catch: "pidove", waves: [WU("patrat:12", "pidove:12"), WU("pidove:13", "patrat:13")], pre: [
          L("narr", "Virbank City is a port town with a rock club for a Gym. Next door, the Virbank Complex is a maze of factories and pipes."),
        ], post: [L("narr", "Gotcha! Pidove was caught! It lives in towns and parks, and isn't afraid of people.")] },
        { id: "b", type: "battle", name: "Virbank Gym: Roughneck Nicky", lv: 15, env: "gym", trainer: TR("Roughneck Nicky", "un_roughneck", "This is Roxie's band's house. You want to see her? Get through me!", "The song's over..."),
          waves: [WU("grimer:15", "koffing:15")] },
        { id: "c", type: "boss", name: "Virbank Gym: Roxie", lv: 19, env: "gym", badgeWin: 1, reward: { tm: tmId("venoshock", 5) },
          trainer: TR("Leader Roxie", "un_roxie", "I'm Roxie, the Virbank Gym Leader! You came to my show, so I'll poison you with my song!", "Ugh! You beat my band and me! Take the Toxic Badge!"),
          waves: [WU("koffing:17+@oranberry", "grimer:17+"), WU("whirlipede:19!@sitrusberry")], pre: [
          L("uroxie", "My dad wants me to quit and run the ferry with him. As if! Poison and music, that's me!"),
          L("narr", "Poison types are weak to Ground and Psychic moves. Whirlipede is part Bug, so Fire and Flying moves hit it too."),
        ], post: [L("uroxie", "Here, TM09 Venoshock! Rock on!")] },
        { id: "d", type: "battle", name: "Virbank City: Team Plasma", lv: 15, get reward() { return { tm: tmId("cut", 5) }; }, env: "sea", trainer: TR("Team Plasma Grunt", "un_grunt2", "Team Plasma is back, and we take what we want! Move!", "Retreat to the ship!"),
          waves: [WU("patrat:15")], pre: [
          L("narr", "On the pier, a line of people in black uniforms: Team Plasma, but not as it was. Hugh and Roxie face them down."),
          L("uhugh", "Team Plasma! Where's my sister's Purrloin?! ...Help me out here!"),
        ], post: [L("uroxie", "That's the end of that song. Here, HM01 Cut. And one of them ran off toward Route 20!")] },
        { id: "e", type: "battle", name: "Route 20: the Fleeing Grunt", lv: 15, env: "route", trainer: TR("Team Plasma Grunt", "un_gruntf2", "You followed me all the way out here? Ugh!", "Fine, fine. We travel by ship. That's all I'm saying!"),
          waves: [WU("purrloin:15")], post: [
          L("narr", "Roxie's father, the ferry captain, offers you and Hugh a ride to Castelia City."),
        ] },
      ] },
    { id: "c16", part: 2, title: "Castelia City", env: "city", map: "city", reward: { lmd: 6000, orundum: 400 },
      nodes: [
        { id: "a", type: "battle", name: "Castelia Sewers: Team Plasma", lv: 18, get reward() { return { tm: tmId("strength", 5) }; }, env: "cave", trainer: TR("Team Plasma Grunts", "un_grunt2", "Two kids in the sewers? You're too late, we've got what we needed!", "Too late anyway! Ha!"),
          waves: [WU("sandile:18"), WU("scraggy:18")], pre: [
          L("uiris", "Hi! I'm Iris, the Champion. Team Plasma's been hanging around the Castelia Sewers. Burgh's away. Can you two check it out?"),
          L("uhugh", "Together, then. Two on two!"),
        ], post: [
          L("uburgh", "Sorry I wasn't here! The Gym's open now. ...Hm? Who's that?"),
          L("ucolress", "My name is Colress. You two bring out your Pokémon's strength rather well. I'll be watching. Goodbye."),
          L("uhugh", "Here, HM04 Strength. I'm going after them."),
        ] },
        { id: "b", type: "battle", name: "Castelia Park", lv: 17, env: "route", wild: 1, catch: "cottonee", waves: [WU("pidove:16", "cottonee:16"), WU("cottonee:17", "pidove:16")], pre: [
          L("narr", "Past the sewers, a quiet park among the skyscrapers. Cottonee drift through the grass."),
        ], post: [L("narr", "Gotcha! Cottonee was caught! It shoots cotton out to keep from being blown away.")] },
        { id: "c", type: "battle", name: "Castelia Gym: Harlequin Gary", lv: 21, env: "gym", trainer: TR("Harlequin Gary", "un_harlequin", "Welcome to the cocoons! Hop in, and who knows where you'll end up!", "I'm all wrapped up..."),
          waves: [WU("sewaddle:21", "combee:21", "dwebble:21")] },
        { id: "d", type: "boss", name: "Castelia Gym: Burgh", lv: 26, env: "gym", badgeWin: 2, reward: { tm: tmId("strugglebug", 5) },
          trainer: TR("Leader Burgh", "un_burgh", "Burgh, Gym Leader and artist! It's been two years since I've had a challenger this inspiring. Let's battle!", "Bravo! The Insect Badge is yours."),
          waves: [WU("dwebble:24+@sitrusberry", "shelmet:24+"), WU("karrablast:24+", "leavanny:26!@sitrusberry")], pre: [
          L("uburgh", "Shelmet and Karrablast evolve together, did you know? Life is art. Battle is art!"),
          L("narr", "Bug types are weak to Fire, Flying and Rock moves."),
        ], post: [L("uburgh", "And take this: TM76 Struggle Bug."), L("ucolress", "Splendid. Meet me on Route 4. I'd like to see your Pokémon's strength up close.")] },
      ] },
    { id: "c17", part: 2, title: "Route 4 and Nimbasa City", env: "volcano", map: "volcano", reward: { lmd: 7000, orundum: 400 },
      nodes: [
        { id: "a", type: "boss", name: "Route 4: Colress", lv: 25, reward: { key: "un_protein" }, env: "city", trainer: TR("Colress", "un_colress", "I study how to draw out a Pokémon's full strength. Will you help my research?", "Fascinating! Your Pokémon grow stronger with you. I'll remember this."),
          waves: [WU("magnemite:23", "klink:25!")], pre: [
          L("narr", "A sleeping Crustle blocks Route 4. Colress points a strange machine at it, and it wakes up and wanders off."),
          L("ucolress", "Science can wake a Pokémon or bring out its power. Let's see what yours can do."),
        ], post: [L("ucolress", "Take this Protein. A small thank-you for the data.")] },
        { id: "b", type: "chest", name: "Route 4: a Trade", reward: { op: "petilil", lmd: 1500 }, env: "route", pre: [
          L("narr", "A woman on Route 4 has a Petilil named Petulia and wants a Cottonee. You make the trade."),
        ] },
        { id: "c", type: "side", name: "Route 4: Mandibuzz", lv: 25, env: "volcano", weather: "sand", wild: 1, catch: "mandibuzz", waves: [WU("mandibuzz:25!")], pre: [
          L("narr", "Every Thursday, a big vulture lands on Route 4 and looks over the people passing by. It's a Mandibuzz."),
        ], post: [L("narr", "Gotcha! Mandibuzz was caught! It dresses itself in bones it has collected.")] },
        { id: "d", type: "battle", name: "Desert Resort", lv: 20, env: "volcano", weather: "sand", wild: 1, catch: "dwebble", waves: [WU("sandile:19", "darumaka:19"), WU("dwebble:20", "maractus:19")], pre: [
          L("narr", "The Desert Resort's sandstorm still blows around Relic Castle. Nurse Mariah sets up a tent to heal travellers."),
        ], post: [L("narr", "Gotcha! Dwebble was caught! When it finds a good stone, it hollows it out to live in.")] },
        { id: "e", type: "battle", name: "Nimbasa City: the Subway Bosses", lv: 28, env: "plant", trainer: TR("Subway Bosses Ingo & Emmet", "un_ingo", "Welcome to Gear Station! We are the Subway Bosses. All aboard for a battle!", "Bravo! Your train has arrived at victory!"),
          waves: [WU("gurdurr:28", "boldore:28")], pre: [
          L("narr", "Outside Gear Station, two men in black and white uniforms wave you over. Another young Trainer joins you: it's a Multi Battle."),
        ] },
        { id: "f", type: "battle", name: "Nimbasa Gym: Beauty Nikola", lv: 29, env: "gym", trainer: TR("Beauty Nikola", "un_beauty2", "Elesa's Gym is a fashion show now! Walk the runway with me!", "My outfit's ruined!"),
          waves: [WU("elekid:29", "flaaffy:29")] },
        { id: "g", type: "boss", name: "Nimbasa Gym: Elesa", lv: 32, env: "gym", badgeWin: 3, reward: { tm: tmId("voltswitch", 5) },
          trainer: TR("Leader Elesa", "un_elesa2", "I'm Elesa, the Nimbasa Gym Leader! Let's light up the runway together!", "You sparkled more than I did! Take the Bolt Badge."),
          waves: [WU("emolga:30+@sitrusberry", "flaaffy:30+"), WU("joltik:30+", "zebstrika:32!@sitrusberry")], pre: [
          L("uelesa2", "I'm a model too, you know. My Pokémon and I put on a show!"),
          L("narr", "Electric types are weak to Ground moves only. Emolga is part Flying (Rock and Ice moves instead), and Joltik part Bug."),
        ], post: [L("uelesa2", "This is yours too: TM72 Volt Switch.")] },
        { id: "h", type: "battle", name: "Nimbasa City: Team Plasma", lv: 29, env: "city", trainer: TR("Team Plasma Grunts", "un_grunt2", "We need a power source for our weapon. Out of our way!", "We'll find another one..."),
          waves: [WU("trubbish:29"), WU("watchog:29")], pre: [
          L("narr", "Outside the Big Stadium, Hugh is shouting at four Grunts. Two of them turn on you."),
        ], post: [
          L("uhugh", "Five years ago they took my sister's Purrloin. She still cries about it. I'll get it back. Thanks for the help."),
        ] },
      ] },
    { id: "c18", part: 2, title: "Driftveil City and the World Tournament", env: "sea", map: "sea", reward: { lmd: 8000, orundum: 500 },
      nodes: [
        { id: "a", type: "battle", name: "Route 5: the Hidden Grotto", lv: 24, get reward() { return { tm: tmId("fly", 5) }; }, env: "route", wild: 1, catch: "minccino", waves: [WU("liepard:23", "trubbish:23"), WU("minccino:24", "gothita:24")], pre: [
          L("ubianca", "Here, HM02 Fly! And look: a Hidden Grotto. Rare Pokémon hide in places like this. Go on, take a look!"),
        ], post: [L("narr", "Gotcha! Minccino was caught! It loves cleaning, and dusts with its tail.")] },
        { id: "b", type: "battle", name: "Driftveil Drawbridge: Motorcyclist Charles", lv: 28, env: "sea", trainer: TR("Motorcyclist Charles", "un_biker", "No one crosses my bridge without a battle! Three on three!", "Okay, okay, you can cross."),
          waves: [WU("sigilyph:28", "archen:28", "tirtouga:28")] },
        { id: "c", type: "side", name: "Driftveil Drawbridge: Ducklett", lv: 26, env: "sea", wild: 1, catch: "ducklett", waves: [WU("ducklett:23", "ducklett:24"), WU("ducklett:26!")], pre: [
          L("narr", "Shadows of Ducklett flicker across the drawbridge as they dive for fish."),
        ], post: [L("narr", "Gotcha! Ducklett was caught! It's a better swimmer than flier.")] },
        { id: "d", type: "boss", name: "Driftveil City: Rood", lv: 30, env: "city", gift: "zorua", giftLv: 25, trainer: TR("Rood", "un_rood", "I was a Sage of Team Plasma. Now we return the Pokémon we took. Let me see your heart in battle.", "Your Pokémon trust you. Then I can trust you with this."),
          waves: [WU("herdier:30", "swoobat:30!")], pre: [
          L("narr", "In Driftveil, the old Team Plasma lives quietly in a house by the sea. Their leader is an old man named Rood."),
          L("urood", "The new Team Plasma follows Ghetsis. We follow N, wherever he is now. We've given back every Pokémon we could."),
        ], post: [L("urood", "This Zorua was N's friend. It's been waiting for someone worthy. Take it with you.")] },
        { id: "e", type: "battle", name: "Driftveil Gym: Worker Tavarius", lv: 32, env: "cave", trainer: TR("Worker Tavarius", "un_worker", "Clay's Gym is all conveyor belts now. Don't get lost!", "I'm going in circles..."),
          waves: [WU("drilbur:32", "baltoy:32", "sandile:32")] },
        { id: "f", type: "boss", name: "Driftveil Gym: Clay", lv: 36, env: "cave", badgeWin: 4, reward: { tm: tmId("bulldoze", 5) },
          trainer: TR("Leader Clay", "un_clay", "Clay. Same Gym Leader, same tough Pokémon. Come on, kid!", "Dang! You're the real deal. Here's the Quake Badge."),
          waves: [WU("krokorok:34+@sitrusberry", "sandslash:34+"), WU("onix:34+", "excadrill:36!@sitrusberry")], pre: [
          L("uclay", "I run the Pokémon World Tournament now too. Beat me, and you'll get to see it."),
          L("narr", "Ground types are weak to Water, Grass and Ice moves; Electric moves don't touch them. Onix is part Rock."),
        ], post: [L("uclay", "And here's TM78 Bulldoze. Don't say I never gave you nothin'.")] },
        { id: "g", type: "battle", name: "World Tournament: Hugh", lv: 25, env: "plateau", get trainer() { return hughTR("A tournament! I'm not losing in the first round!", "Gah! Well, you'd better win the whole thing, then!"); },
          rivalWaves: () => [WU(hughMon(1) + ":25", hughMonkey(1) + ":25", "tranquill:25!")], pre: [
          L("narr", "The Pokémon World Tournament, south of Driftveil. For your first visit, the Driftveil Tournament: everyone's Pokémon at Lv 25."),
        ] },
        { id: "h", type: "battle", name: "World Tournament: Cheren", lv: 25, env: "plateau", trainer: TR("Leader Cheren", "un_cheren2", "Clay talked me into entering. I'm glad he did.", "You've come a long way since your first Badge."),
          waves: [WU("stoutland:25", "cinccino:25", "watchog:25!")] },
        { id: "i", type: "boss", name: "World Tournament: Colress", lv: 25, env: "plateau", trainer: TR("Colress", "un_colress", "The final! A perfect chance to measure your strength.", "Wonderful data. Thank you."),
          waves: [WU("magneton:25", "elgyem:25", "klink:25!")] },
        { id: "j", type: "battle", name: "The Plasma Frigate: the Deck", lv: 33, env: "sea", trainer: TR("Team Plasma Grunts", "un_grunt2", "Intruders on the Frigate! Get them!", "This ship's too small for you..."),
          waves: [WU("koffing:33"), WU("trubbish:33")], pre: [
          L("narr", "A huge black ship is docked at the PWT's pier: the Plasma Frigate. Hugh and Cheren storm aboard with you."),
        ] },
        { id: "k", type: "battle", name: "The Plasma Frigate: Below Deck", lv: 32, env: "sea", trainer: TR("Team Plasma Grunts", "un_grunt2", "Four against three? Fine by us!", "The Sage won't be happy..."),
          waves: [WU("golbat:32", "liepard:32"), WU("grimer:32", "krokorok:32")], pre: [
          L("ucheren2", "I'll battle beside you. Hugh, take the next pair!"),
        ] },
        { id: "l", type: "battle", name: "The Plasma Frigate: the Hold", lv: 32, env: "sea", trainer: TR("Team Plasma Grunts", "un_grunt2", "You won't reach Lord Zinzolin!", "Lord Zinzolin..."),
          waves: [WU("koffing:32", "watchog:32"), WU("grimer:32", "raticate:32")], post: [
          L("uzinzolin", "Brrr... Team Plasma will rule Unova, and the world will freeze. You can't stop us. Shadow Triad, take them away."),
          L("narr", "Three figures appear out of nowhere. In a blink, you're standing back on the pier. The Frigate is sailing away."),
        ] },
      ] },
    { id: "c19", part: 2, title: "Relic Passage and Chargestone Cave", env: "cave", map: "cave", reward: { lmd: 9000, orundum: 500 },
      nodes: [
        { id: "a", type: "battle", name: "Relic Passage", lv: 29, env: "cave", wild: 1, catch: "boldore", waves: [WU("woobat:28", "gurdurr:28"), WU("boldore:29", "woobat:29")], pre: [
          L("narr", "A new tunnel, the Relic Passage, links the PWT to the Castelia Sewers and to the bottom of Relic Castle."),
        ], post: [L("narr", "Gotcha! Boldore was caught! Its crystals glow when its energy overflows.")] },
        { id: "b", type: "side", name: "Relic Castle: Volcarona", lv: 35, env: "volcano", weather: "sand", wild: 1, catch: "volcarona", waves: [WU("volcarona:35!")], pre: [
          L("narr", "At the very bottom of Relic Castle, in a room no one has entered for centuries, a great moth with burning wings is resting."),
        ], post: [L("narr", "Gotcha! Volcarona was caught! Ancient people worshipped it as the sun.")] },
        { id: "c", type: "chest", name: "Route 6: the Season Research Lab", get reward() { return { op: "deerling", lmd: 2000, tm: tmId("surf", 5) }; }, env: "route", pre: [
          L("ucheren2", "Unova's getting colder. Lacunosa, Castelia, Driftveil... something's wrong. Take HM03 Surf. You'll need it."),
          L("narr", "At the Season Research Lab, a scientist has a Deerling with an unusual Ability, Serene Grace. He'd like it to travel with you."),
          L("narr", "Then a blue Pokémon with a steel body leaps down in front of you, looks you over, and runs off: Cobalion."),
        ] },
        { id: "d", type: "battle", name: "Route 6", lv: 26, env: "route", wild: 1, catch: "shelmet", waves: [WU("deerling:25", "karrablast:23"), WU("shelmet:26", "foongus:26")], pre: [
          L("narr", "Route 6 again, two years later. The Shelmet and Karrablast still don't get along."),
        ], post: [L("narr", "Gotcha! Shelmet was caught! Something about Karrablast makes it evolve.")] },
        { id: "e", type: "side", name: "Mistralton Cave: Axew", lv: 30, env: "cave", wild: 1, catch: "axew", waves: [WU("boldore:28", "woobat:28"), WU("axew:30", "axew:29")], pre: [
          L("narr", "In Mistralton Cave, an old man tells the legend of the Swords of Justice. An Axew is sharpening its tusks on the wall."),
        ], post: [L("narr", "Gotcha! Axew was caught! Its tusks grow back if they break.")] },
        { id: "f", type: "battle", name: "Chargestone Cave", lv: 31, env: "cave", wild: 1, catch: "tynamo", waves: [WU("joltik:30", "ferroseed:30"), WU("tynamo:31", "klink:30")], pre: [
          L("ubianca", "See how the floating stones move? They're magnetic! I'm here researching Tynamo for the Professor."),
          L("narr", "On a bridge deep in the cave, a voice you can't place drifts down from above: someone means to save the Pokémon, and stop a friend."),
        ], post: [L("narr", "Gotcha! Tynamo was caught! A school of them together can shock like lightning.")] },
        { id: "g", type: "battle", name: "Chargestone Cave: Ace Trainer Corky", lv: 36, env: "cave", trainer: TR("Ace Trainer Corky", "un_acetrainer", "A Triple Battle in the dark! Can you keep track of all three?", "That's three losses at once..."),
          waves: [WU("klink:36", "unfezant:36", "sandslash:36")] },
      ] },
    { id: "c20", part: 2, title: "Mistralton City and Reversal Mountain", env: "route", map: "route", reward: { lmd: 10000, orundum: 500 },
      nodes: [
        { id: "a", type: "chest", name: "Mistralton City: the Professor", reward: { gold5: 1, lmd: 3000 }, env: "city", pre: [
          L("ujuniper", "It's been a while! Your Pokédex is coming along nicely. Here, a Master Ball. And the Celestial Tower: ring its bell, and Skyla will be waiting."),
        ] },
        { id: "b", type: "battle", name: "Route 7", lv: 33, env: "route", wild: 1, catch: "zebstrika", waves: [WU("watchog:31", "tranquill:31"), WU("zebstrika:33", "cubchoo:32")], pre: [
          L("narr", "Route 7 is lined with tall grass and walkways. Zebstrika gallop through it, crackling."),
        ], post: [L("narr", "Gotcha! Zebstrika was caught! It runs as fast as lightning.")] },
        { id: "c", type: "chest", name: "Route 7: a Trade", reward: { op: "gigalith", lmd: 2000 }, env: "route", pre: [
          L("narr", "In a house on Route 7, a Hiker named Manny wants an Emolga. He trades you his Gigalith for it."),
        ] },
        { id: "d", type: "battle", name: "Celestial Tower", lv: 33, env: "tower", wild: 1, catch: "elgyem", waves: [WU("litwick:31", "litwick:32"), WU("elgyem:33", "litwick:33")], pre: [
          L("narr", "The Celestial Tower, where people remember the Pokémon they've lost. On the roof, you ring the bell."),
        ], post: [L("narr", "Gotcha! Elgyem was caught! It flashes its fingertips to talk.")] },
        { id: "e", type: "battle", name: "Mistralton Gym: Pilot Winslow", lv: 40, env: "gym", trainer: TR("Pilot Winslow", "un_pilot", "The turbines are on! Hold on tight!", "Blown away..."),
          waves: [WU("sigilyph:40")] },
        { id: "f", type: "boss", name: "Mistralton Gym: Skyla", lv: 42, env: "gym", badgeWin: 5, reward: { tm: tmId("acrobatics", 5) },
          trainer: TR("Leader Skyla", "un_skyla", "Skyla, Gym Leader and cargo pilot! Ready for takeoff? Let's battle!", "That was some flying! The Jet Badge is yours."),
          waves: [WU("swoobat:40+", "skarmory:40+@sitrusberry"), WU("sigilyph:40+", "swanna:42!@sitrusberry")], pre: [
          L("uskyla", "Twist Mountain and the Tubeline Bridge are closed. After this, I'll fly you and the Professor to Lentimas Town!"),
          L("narr", "Flying types are weak to Electric, Ice and Rock moves. Skarmory is part Steel: Fire and Electric moves work best."),
        ], post: [L("uskyla", "Here, TM62 Acrobatics!")] },
        { id: "g", type: "story", name: "Lentimas Town", reward: { key: "un_lunarwing" }, env: "volcano", pre: [
          L("ujuniper", "Two years ago, Reshiram and Zekrom each chose a hero. Now Unova is getting colder. Drayden, the mayor of Opelucid, knows the old legends. We must ask him."),
          L("narr", "In a strange house on the way, a girl who isn't quite there gives you a Lunar Wing."),
        ] },
        { id: "h", type: "battle", name: "Reversal Mountain: Hiker Markus & Backpacker Kiyo", lv: 41, env: "cave", trainer: TR("Hiker Markus & Backpacker Kiyo", "un_hiker", "Two of us, two of you! Good thing you brought a friend!", "You two make a great team."),
          waves: [WU("gurdurr:41", "crustle:41"), WU("golbat:41", "swanna:41")], pre: [
          L("ubianca", "Reversal Mountain! A Legendary Pokémon is said to live deep inside. I'll come with you, and we'll battle together!"),
        ] },
        { id: "i", type: "battle", name: "Reversal Mountain", lv: 35, env: "cave", wild: 1, catch: "excadrill", waves: [WU("boldore:33", "woobat:33"), WU("excadrill:35", "boldore:35")], pre: [
          L("narr", "Inside the dormant crater, rainwater has made a lake. A dust cloud spins on the cave floor."),
        ], post: [L("narr", "Gotcha! Excadrill was caught! It can drill through steel.")] },
        { id: "j", type: "side", name: "The Strange House: Gothorita", lv: 34, env: "tower", wild: 1, catch: "gothorita", waves: [WU("litwick:32", "gothita:31"), WU("gothorita:34!")], pre: [
          L("narr", "The Strange House by Lentimas Town is full of things that move on their own. A Gothorita is watching you from the stairs."),
        ], post: [L("narr", "Gotcha! Gothorita was caught! On starry nights it controls sleeping children like puppets.")] },
      ] },
    { id: "c21", part: 2, title: "Undella Town and Lacunosa Town", env: "sea", map: "sea", reward: { lmd: 11000, orundum: 600 },
      nodes: [
        { id: "a", type: "battle", name: "Undella Town: Hugh", lv: 45, env: "sea", get trainer() { return hughTR("Team Plasma's ship was spotted near here. Battle me, then let's go find it!", "...You're really strong. I'm glad you're on my side."); },
          rivalWaves: () => [WU("unfezant:43@scopelens", hughMonkey(1) + ":43@" + MONKEY_ITEM[hughMonkey()]), WU(hughMon(2) + ":45!@" + MONKEY_ITEM[MONKEY[UNOVA_STRONG[unova2Starter()]][0]])], pre: [
          L("narr", "Undella Town, the seaside resort. Hugh is waiting at the gate, fists clenched."),
        ] },
        { id: "b", type: "side", name: "Undella Bay: Jellicent", lv: 40, env: "sea", wild: 1, catch: "jellicent", waves: [WU("frillish:35", "frillish:36"), WU("jellicent:40!")], pre: [
          L("narr", "Every Monday, a big Jellicent floats into Undella Bay and drifts there all day."),
        ], post: [L("narr", "Gotcha! Jellicent was caught! It's said to make its home in sunken ships.")] },
        { id: "c", type: "side", name: "Route 13: Cobalion", lv: 45, env: "route", wild: 1, catch: "cobalion", waves: [WU("cobalion:45!")], pre: [
          L("narr", "In a clearing on Route 13, the blue Pokémon from Route 6 is waiting for you. This time it doesn't run."),
        ], post: [L("narr", "Gotcha! Cobalion was caught! It once led Pokémon to safety from a burning forest.")] },
        { id: "d", type: "boss", name: "Lacunosa Town: Zinzolin", lv: 48, env: "city", trainer: TR("Zinzolin", "un_zinzolin", "Brrr! Lacunosa is the perfect place for the cold. Team Plasma will freeze all of Unova!", "Grr! Fine. This town isn't important anyway."),
          waves: [WU("cryogonal:46", "sneasel:48!"), WU("golbat:43", "garbodor:43")], pre: [
          L("narr", "In Lacunosa Town, everyone stays in at night. An old woman tells of a meteor that fell long ago, and a monster that came with the cold wind."),
          L("uhugh", "Zinzolin! And a Grunt. Partner, help me out! Two on two!"),
        ] },
        { id: "e", type: "side", name: "Route 11: Virizion", lv: 45, env: "forest", wild: 1, catch: "virizion", waves: [WU("virizion:45!")], pre: [
          L("narr", "On Route 11, a green Pokémon with horns like blades leaps down and stands in your way."),
        ], post: [L("narr", "Gotcha! Virizion was caught! It moves too fast for the eye to follow.")] },
        // (a wild stage's catch sits young enough to be caught: Route 11's Karrablast are Lv 36, and from Lv 36 a trade evolution has
        // happened, README, House rules; its Shelmet, Lv 37-39, are Accelgor)
        { id: "f", type: "battle", name: "Route 11", lv: 39, env: "forest", wild: 1, catch: "karrablast", waves: [WU("shelmet:37", "amoonguss:37"), WU("karrablast:35", "shelmet:39")], pre: [
          L("narr", "Route 11 runs east from Opelucid along a river. Shelmet and Karrablast eye each other warily in the grass."),
        ], post: [L("narr", "Gotcha! Karrablast was caught! It evolves when it meets a Shelmet.")] },
      ] },
    { id: "c22", part: 2, title: "Opelucid City Frozen", env: "ice", map: "city", reward: { lmd: 12000, orundum: 600, dragonscale: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 9", lv: 40, env: "route", wild: 1, catch: "pawniard", waves: [WU("garbodor:39", "minccino:38"), WU("pawniard:40", "gothorita:39")], pre: [
          L("narr", "Route 9, past Shopping Mall Nine. Pawniard hunt in packs here, their blades flashing."),
        ], post: [L("narr", "Gotcha! Pawniard was caught! Its whole body is made of blades.")] },
        { id: "b", type: "battle", name: "Opelucid Gym: Veteran Lucius", lv: 50, env: "gym", trainer: TR("Veteran Lucius", "un_veteran", "Drayden's Gym is guarded by dragons. Show me you can face one!", "Hmph. You'll do."),
          waves: [WU("fraxure:50")] },
        { id: "c", type: "boss", name: "Opelucid Gym: Drayden", lv: 52, env: "gym", badgeWin: 6, reward: { tm: tmId("dragontail", 5) },
          trainer: TR("Leader Drayden", "un_drayden", "I am Drayden. Two years ago, a young Trainer stood here where you stand. Show me you are their equal!", "You are. The Legend Badge is yours."),
          waves: [WU("druddigon:50+@sitrusberry", "flygon:50+"), WU("altaria:50+", "haxorus:52!@sitrusberry")], pre: [
          L("udrayden", "Iris left this Gym to become the Champion. I have new dragons now. Let us see if you can stand against them."),
          L("narr", "Dragon types are weak to Ice and Dragon moves. Flygon is part Ground, and Altaria part Flying: Ice hits both four times as hard."),
        ], post: [
          L("udrayden", "Take TM82 Dragon Tail as well."),
          L("udrayden", "The legend says Reshiram and Zekrom were once one dragon. Kyurem appeared in the same age. My family has kept this since then: the DNA Splicers."),
        ] },
        { id: "d", type: "story", name: "Opelucid City: the Frigate Attacks", env: "ice", pre: [
          L("narr", "A shadow falls over the city. The Plasma Frigate is flying overhead, and it's firing ice. In minutes, Opelucid is frozen solid."),
          L("uzinzolin", "Drayden! Hand over the DNA Splicers, or the whole city stays frozen!"),
        ] },
        { id: "e", type: "battle", name: "Opelucid City: Team Plasma", lv: 48, env: "ice", trainer: TR("Team Plasma Grunts", "un_grunt2", "The city's frozen! No one's coming to help you!", "The cold's getting to me..."),
          waves: [WU("watchog:48", "muk:48"), WU("golbat:48", "garbodor:48")] },
        { id: "f", type: "battle", name: "Opelucid City: South of the Gym", lv: 48, env: "ice", trainer: TR("Team Plasma Grunt", "un_grunt2", "Lord Zinzolin's waiting for you. If you get past me!", "You got past me..."),
          waves: [WU("seviper:48", "weezing:48")] },
        { id: "g", type: "boss", name: "Opelucid Gym: Zinzolin", lv: 52, env: "ice", trainer: TR("Zinzolin", "un_zinzolin", "You again! I'll freeze you myself!", "Brrr... No matter. The Shadow Triad has what we came for."),
          waves: [WU("cryogonal:50", "cryogonal:50"), WU("weavile:52!")] },
        { id: "h", type: "boss", name: "Opelucid City: the Shadow Triad", lv: 52, env: "ice", trainer: TR("Shadow Triad", "un_shadow", "...", "...We do not have the Splicers. They are already on the Frigate."),
          waves: [WU("pawniard:50", "pawniard:50"), WU("absol:52!")], pre: [
          L("narr", "One of the three figures in black is still in the city, near the Route 11 gate. He turns to face you."),
        ], post: [L("uhugh", "Humilau City's the coldest place in Unova right now. That's where they're headed. I'll meet you there!")] },
      ] },
    { id: "c23", part: 2, title: "Humilau City", env: "sea", map: "sea", reward: { lmd: 13000, orundum: 600, waterstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Humilau Gym: Ace Trainer Enzio", lv: 50, env: "sea", trainer: TR("Ace Trainer Enzio", "un_acetrainer", "Ride the lily pads! Marlon's out at the end!", "I fell in..."),
          waves: [WU("basculin:50", "basculin:50", "azumarill:50")] },
        { id: "b", type: "boss", name: "Humilau Gym: Marlon", lv: 55, env: "sea", badgeWin: 7, reward: { tm: tmId("scald", 5) },
          trainer: TR("Leader Marlon", "un_marlon", "Marlon, Humilau Gym Leader! The sea's my home. Let's make some waves!", "You're stronger than the tide! The Wave Badge is yours."),
          waves: [WU("wailord:53+", "mantine:53+"), WU("carracosta:53+@sitrusberry", "jellicent:55!@sitrusberry")], pre: [
          L("umarlon", "Team Plasma? The ocean accepts every river that flows into it. I'm not chasing anybody. Let's just battle!"),
          L("narr", "Water types are weak to Grass and Electric moves. Mantine is part Flying (Electric hits it four times as hard); Jellicent is part Ghost."),
        ], post: [L("umarlon", "Here, TM55 Scald!")] },
        { id: "c", type: "chest", name: "Humilau City: a Trade", reward: { op: "tangrowth", lmd: 2000 }, env: "sea", pre: [
          L("narr", "In Humilau City, a man named Slick wants a Mantine. He gives you his Tangrowth, Tangles, in exchange."),
        ] },
        { id: "d", type: "battle", name: "Route 22", lv: 42, env: "route", wild: 1, catch: "mienfoo", waves: [WU("amoonguss:39", "mienfoo:40"), WU("mienfoo:42", "amoonguss:39")], pre: [
          L("narr", "Route 22 climbs from Humilau toward the Giant Chasm. Mienfoo practise their kicks on the rocks."),
        ], post: [L("narr", "Gotcha! Mienfoo was caught! It strikes faster than the eye can follow.")] },
        { id: "e", type: "side", name: "Route 22: Terrakion", lv: 45, reward: { key: "un_colressmachine" }, env: "route", wild: 1, catch: "terrakion", waves: [WU("terrakion:45!")], pre: [
          L("narr", "In the middle of Route 22, a grey Pokémon as solid as a mountain stands in your way. Then Colress walks up, holding a machine."),
          L("ucolress", "For you: the Colress Machine. It can wake something sleeping in Seaside Cave. I'm curious what you'll do with it."),
        ], post: [L("narr", "Gotcha! Terrakion was caught! It smashed the rocks so the others could escape the fire.")] },
        { id: "f", type: "side", name: "Seaside Cave: Crustle", lv: 42, env: "cave", wild: 1, catch: "crustle", waves: [WU("crustle:42!")], pre: [
          L("narr", "In Seaside Cave, a boulder blocks the way. The Colress Machine hums... and the boulder gets up. It's a Crustle."),
        ], post: [L("narr", "Gotcha! Crustle was caught! The Colress Machine sparks and breaks.")] },
        // (Seaside Cave's Eelektrik is Lv 42; from Lv 36 its Thunder Stone evolution has happened, so the one you catch is Lv 35)
        { id: "g", type: "side", name: "Seaside Cave: Eelektrik", lv: 42, env: "cave", wild: 1, catch: "eelektrik", waves: [WU("boldore:40", "woobat:40"), WU("eelektrik:35!")], pre: [
          L("narr", "On the cave's lower floor, something long glows in the dark water."),
        ], post: [L("narr", "Gotcha! Eelektrik was caught! It wraps around prey and shocks it.")] },
      ] },
    { id: "c24", part: 2, title: "The Plasma Frigate", env: "sea", map: "sea", reward: { lmd: 14000, orundum: 700 },
      nodes: [
        { id: "a", type: "battle", name: "The Plasma Frigate: the Deck", lv: 50, env: "sea", trainer: TR("Team Plasma Grunt", "un_grunt2", "This is Team Plasma's ship! Get off!", "Run! The kid's too strong!"),
          waves: [WU("watchog:50", "garbodor:50")], pre: [
          L("narr", "Outside Seaside Cave, the Plasma Frigate rides at anchor. Marlon walks down its gangplank, dripping."),
          L("umarlon", "Changed my mind. The sea doesn't want these people. Go on, I'll watch your back!"),
        ] },
        { id: "b", type: "battle", name: "The Plasma Frigate: the North Entrance", lv: 50, env: "sea", trainer: TR("Team Plasma Grunts", "un_grunt2", "Two of us, two of you. Let's go!", "Report to Lord Zinzolin..."),
          waves: [WU("golbat:50", "drapion:50"), WU("seviper:50", "garbodor:50")], pre: [
          L("uhugh", "I'm right behind you, partner! Let's take them together!"),
        ] },
        { id: "c", type: "battle", name: "The Plasma Frigate: B1F", lv: 51, env: "sea", trainer: TR("Team Plasma Grunts", "un_gruntf2", "Warp panels, switches... you'll never find your way!", "How did you get through?"),
          waves: [WU("krookodile:51"), WU("deino:49", "deino:49", "sneasel:49")] },
        { id: "d", type: "battle", name: "The Plasma Frigate: B1F, the Last Rooms", lv: 51, env: "sea", trainer: TR("Team Plasma Grunts", "un_grunt2", "Turn back! The Command Center's off-limits!", "The Command Center..."),
          waves: [WU("drapion:51"), WU("weezing:51")] },
        { id: "e", type: "boss", name: "The Plasma Frigate: the Command Center", lv: 54, env: "plant", trainer: TR("Zinzolin", "un_zinzolin", "Welcome to the heart of the Frigate! Behold its power source... Kyurem!", "Brrr! It doesn't matter. Kyurem is ours, and the Frigate flies!"),
          waves: [WU("cryogonal:52", "cryogonal:52", "weavile:54!"), WU("liepard:49", "watchog:49", "scolipede:49")], pre: [
          L("narr", "In the Command Center, a grey dragon is chained in a tank of ice: Kyurem, powering the ship."),
          L("uhugh", "Zinzolin! And another Grunt. Partner, together!"),
        ], post: [
          L("narr", "The Shadow Triad sends you off the ship again. The Frigate lifts out of the water and flies north."),
          L("ucheren2", "I saw it go. It's heading for the Giant Chasm."),
        ] },
      ] },
    { id: "c25", part: 2, title: "The Giant Chasm", env: "ice", map: "cave", reward: { lmd: 16000, orundum: 800 },
      nodes: [
        { id: "a", type: "battle", name: "Giant Chasm: the Crater Forest", lv: 51, reward: { key: "un_maxrevives" }, env: "ice", weather: "hail", trainer: TR("Team Plasma Grunt", "un_grunt2", "You're too late! The Frigate's landed!", "...Too late for me."),
          waves: [WU("weezing:51", "muk:51")], pre: [
          L("urood", "We came to help. The old Team Plasma owes Unova that much. Take these Max Revives. We'll hold the others back. Go!"),
        ] },
        { id: "b", type: "battle", name: "Giant Chasm", lv: 47, env: "ice", weather: "hail", wild: 1, catch: "vanillish", waves: [WU("vanillish:45", "excadrill:45"), WU("vanillish:47", "vanilluxe:47")], pre: [
          L("narr", "Snow falls inside the Giant Chasm, even in summer. The Frigate sits on a mound of ice in the middle of the crater."),
        ], post: [L("narr", "Gotcha! Vanillish was caught! It cools the air around it with icy particles.")] },
        { id: "c", type: "battle", name: "The Plasma Frigate: the South Entrance", lv: 50, env: "plant", trainer: TR("Team Plasma Grunts", "un_grunt2", "Both of us at once! Take this!", "Two of us weren't enough..."),
          waves: [WU("scraggy:50", "scrafty:50", "whirlipede:50"), WU("trubbish:50", "golbat:50", "garbodor:50")] },
        { id: "d", type: "battle", name: "The Plasma Frigate: B2F", lv: 51, env: "plant", trainer: TR("Team Plasma Grunts", "un_gruntf2", "The password? We'll never tell you! ...Oh. You found it.", "So much for security."),
          waves: [WU("krookodile:51"), WU("raticate:51", "watchog:51")] },
        { id: "e", type: "boss", name: "The Plasma Frigate: Kyurem's Cage", lv: 55, env: "plant", trainer: TR("Zinzolin", "un_zinzolin", "Freeze! Freeze, all of you! Lord Ghetsis will make Unova a world of ice!", "Brrr... I am finished."),
          waves: [WU("cryogonal:53", "cryogonal:53"), WU("weavile:55!")] },
        { id: "f", type: "boss", name: "The Plasma Frigate: Colress", lv: 56, env: "plant", trainer: TR("Colress", "un_colress", "I joined Team Plasma for one reason: to find out how to bring out a Pokémon's full power. Show me, one last time!", "...So the answer is the bond between Trainer and Pokémon. How unscientific. And how wonderful."),
          waves: [WU("magneton:54@eviolite", "beheeyem:54", "metang:54"), WU("magnezone:54", "klinklang:56!@airballoon")], pre: [
          L("ucolress", "Ghetsis was an old acquaintance. He needed a scientist; I needed a laboratory. Shall we?"),
        ], post: [L("ucolress", "I'm done with Team Plasma. Ghetsis is through that door. Go.")] },
        { id: "g", type: "boss", name: "Ghetsis's Quarters: the Shadow Triad", lv: 55, env: "plant", trainer: TR("Shadow Triad", "un_shadow", "Lord Ghetsis is not to be disturbed.", "...Go, then."),
          waves: [WU("pawniard:53", "pawniard:53"), WU("absol:55!")] },
        { id: "h", type: "boss", name: "Ghetsis's Quarters: the Second Shadow", lv: 55, env: "plant", trainer: TR("Shadow Triad", "un_shadow", "...", "..."),
          waves: [WU("pawniard:53", "pawniard:53"), WU("banette:55!")] },
        { id: "i", type: "boss", name: "Ghetsis's Quarters: the Third Shadow", lv: 55, env: "plant", trainer: TR("Shadow Triad", "un_shadow", "...", "We owe Lord Ghetsis our lives. ...Take this. It belongs to your friend's sister."),
          waves: [WU("pawniard:53", "pawniard:53"), WU("accelgor:55!")], post: [
          L("uhugh", "That's... her Purrloin! It's a Liepard now. ...Thank you. Thank you. Now let's finish this."),
        ] },
        { id: "j", type: "boss", name: "The Inner Cave: Black Kyurem", lv: 55, env: "ice", weather: "hail", wild: 1, waves: [WU("kyuremblack:55!")], pre: [
          L("ughetsis2", "You're too late, child! Kyurem, freeze them!"),
          L("narr", "A black dragon crashes through the cavern roof: Zekrom, with N on its back. 'Stop this, Ghetsis!'"),
          L("ughetsis2", "N, you useless boy. You brought me exactly what I needed. DNA Splicers!"),
          L("narr", "Kyurem and Zekrom are pulled together in a flash of light and ice, and become one: Black Kyurem. Ghetsis's cane crackles; no Poké Ball will work here."),
        ], post: [L("narr", "Black Kyurem staggers. Light pours out of it, and Kyurem and Zekrom fall apart again, exhausted.")] },
        { id: "k", type: "boss", name: "The Inner Cave: Ghetsis", lv: 56, env: "ice", trainer: TR("Ghetsis", "un_ghetsis2", "I am Ghetsis! The one who will rule Unova! I don't need Kyurem to crush a child like you!", "No... NO! How can this be?!"),
          waves: [WU("cofagrigus:54@leftovers", "seismitoad:54", "eelektross:54"), WU("drapion:54", "toxicroak:54", "hydreigon:56!@lifeorb")], pre: [
          L("ughetsis2", "Two years ago, a child like you ruined everything. I won't let it happen twice!"),
        ], post: [
          L("narr", "Ghetsis stops making sense. The Shadow Triad appears, and carries him away. This time, Team Plasma is finished for good."),
          L("un", "Thank you. You saved Zekrom, and Kyurem too. ...Go to the Pokémon League. I'll see you again."),
        ] },
      ] },
    { id: "c26", part: 2, title: "Victory Road and the Pokémon League", env: "plateau", map: "plateau", reward: { lmd: 22000, orundum: 1000 },
      nodes: [
        { id: "a", type: "battle", name: "Route 23", lv: 49, get reward() { return { tm: tmId("waterfall", 5) }; }, env: "route", wild: 1, catch: "vullaby", waves: [WU("sawk:48", "bouffalant:49"), WU("vullaby:47", "mienfoo:48")], pre: [
          L("narr", "Route 23 leads to the Badge Check Gate and Victory Road. N is waiting at the entrance."),
          L("un", "Here, HM05 Waterfall. Victory Road has changed since I last came this way."),
        ], post: [L("narr", "Gotcha! Vullaby was caught! It wears a broken skull to protect its rear.")] },
        { id: "b", type: "battle", name: "Victory Road: Hugh", lv: 61, get reward() { return { tm: tmId("thunderbolt", 5) }; }, env: "cave", get trainer() { return hughTR("My sister's got her Pokémon back. Now I can battle for me. Let's go, partner!", "That was the best battle of my life. Go win the League!"); },
          rivalWaves: () => [WU("unfezant:59@scopelens", hughMonkey(1) + ":59@" + MONKEY_ITEM[hughMonkey()]), WU("bouffalant:59", hughMon(2) + ":61!@" + MONKEY_ITEM[MONKEY[UNOVA_STRONG[unova2Starter()]][0]])], pre: [
          L("uhugh", "Wait! Before you go to the League... one more battle. I owe you that."),
        ], post: [L("uhugh", "Here, TM24 Thunderbolt. A thank-you, for my sister.")] },
        { id: "c", type: "battle", name: "Victory Road", lv: 50, env: "cave", wild: 1, catch: "zweilous", waves: [WU("golurk:49", "druddigon:48"), WU("zweilous:50", "boldore:48")], pre: [
          L("narr", "Victory Road winds up through ruins and waterfalls to the Pokémon League. A two-headed dragon snaps at you from the dark."),
        ], post: [L("narr", "Gotcha! Zweilous was caught! Its two heads fight over food.")] },
        { id: "d", type: "battle", name: "Victory Road: Veteran Hugo", lv: 58, env: "cave", trainer: TR("Veteran Hugo", "un_veteran", "The League is just ahead. Show me you've earned the right to climb.", "You've earned it."),
          waves: [WU("fraxure:58", "zweilous:58", "flygon:58")] },
        { id: "e", type: "boss", name: "Elite Four Shauntal", lv: 62, env: "plateau",
          trainer: TR("Elite Four Shauntal", "un_shauntal", "I'm Shauntal. I've been writing about the hero who saved Unova two years ago. Maybe I'll write about you next!", "...That was a chapter worth writing."),
          waves: [WU("cofagrigus:60@leftovers", "drifblim:60@flyinggem", "golurk:60@expertbelt"), WU("banette:60@muscleband", "chandelure:62!@choicescarf")], pre: [
          L("narr", "The Pokémon League again, two years on. The Elite Four are stronger, and their Pokémon hold battle items now."),
        ] },
        { id: "f", type: "boss", name: "Elite Four Grimsley", lv: 62, env: "plateau",
          trainer: TR("Elite Four Grimsley", "un_grimsley", "Grimsley. Two years ago a Trainer beat me fair and square. Let's see if lightning strikes twice.", "Some days the cards just fall your way."),
          waves: [WU("liepard:60@normalgem", "scrafty:60@leftovers", "krookodile:60@expertbelt"), WU("absol:60@muscleband", "bisharp:62!@quickclaw")] },
        { id: "g", type: "boss", name: "Elite Four Caitlin", lv: 62, env: "plateau",
          trainer: TR("Elite Four Caitlin", "un_caitlin", "Caitlin. I learned to battle in another region, at the Battle Castle. Let me show you what I learned.", "Elegant. I enjoyed that."),
          waves: [WU("musharna:60@zoomlens", "sigilyph:60@expertbelt", "reuniclus:60@leftovers"), WU("gothitelle:60@wiseglasses", "metagross:62!@lifeorb")] },
        { id: "h", type: "boss", name: "Elite Four Marshal", lv: 62, env: "plateau",
          trainer: TR("Elite Four Marshal", "un_marshal", "Marshal. Alder's student. My fists and my Pokémon's: let them talk!", "...Hah. My master would be proud of you."),
          waves: [WU("throh:60@leftovers", "sawk:60@muscleband", "mienshao:60@expertbelt"), WU("lucario:60@wiseglasses", "conkeldurr:62!@flameorb")] },
        { id: "i", type: "boss", name: "Champion Iris", lv: 63, env: "plateau", champion: 1,
          trainer: TR("Champion Iris", "un_iris2", "I'm Iris, the Champion! I've been looking forward to this. My dragons and I are going to give it everything!", "Aww, I lost! But you know what? That was really, really fun. You're amazing!", "ultra"),
          waves: [WU("hydreigon:61@wiseglasses", "druddigon:61@lifeorb", "aggron:61@muscleband"), WU("archeops:61@flyinggem", "lapras:61@widelens", "haxorus:63!@focussash")], pre: [
          L("uiris2", "I used to be the Gym Leader in Opelucid, and now I'm the Champion. The Pokémon League is where people and Pokémon understand each other best. Let's battle!"),
        ], post: [
          L("ujuniper", "Congratulations, Champion! Two years ago, someone like you saved Unova. Now you have too."),
          L("narr", "Your Pokémon are entered into the Hall of Fame. You are the Champion of Unova! Their level cap keeps rising with the rest of your Journey, and lifts to Lv 100 once it's done."),
        ] },
      ] },
    { id: "c27", part: 2, title: "Two Years Later: After the League", env: "route", map: "sea", reward: { lmd: 30000, orundum: 1500 },
      nodes: [
        { id: "a", type: "story", name: "Aspertia City: the National Pokédex", env: "city", pre: [
          L("ucedric", "My daughter asked me to upgrade your Pokédex to the National Pokédex. There! Pokémon from far-off regions are turning up all over Unova now."),
          L("uhugh", "My sister's so happy. She says she dreamed about a Zoroark calling from Victory Road. Weird, huh?"),
        ] },
        { id: "b", type: "boss", name: "Floccesy Town: Alder", lv: 63, env: "route", trainer: TR("Alder", "un_alder", "The new Champion! I'm not the Champion any more, but I'm not done battling. Let's go!", "Ha! What a battle! My grandson Benga's at the Black Tower. Go and see it!"),
          waves: [WU("accelgor:61", "escavalier:61", "bouffalant:61"), WU("conkeldurr:61", "braviary:61", "volcarona:63!@sitrusberry")], pre: [
          L("ualder", "My first partner was a Volcarona. I lost it to illness long ago. This one hatched from its Egg's line. Let's see what the Champion can do!"),
        ] },
        { id: "c", type: "boss", name: "Undella Town: Hugh", lv: 68, get reward() { return { tm: tmId("dive", 5) }; }, env: "sea", get trainer() { return hughTR("I'm helping the old Team Plasma return the Pokémon they took. But first: a Champion's battle!", "You're the best partner I could have asked for."); },
          rivalWaves: () => [WU("unfezant:66@scopelens", hughMonkey(1) + ":66@" + MONKEY_ITEM[hughMonkey()], "bouffalant:66@muscleband"), WU("flygon:66@dragonfang", "eelektross:66@leftovers", hughMon(2) + ":68!@" + MONKEY_ITEM[MONKEY[UNOVA_STRONG[unova2Starter()]][0]])], pre: [
          L("uhugh", "Here, HM06 Dive. Now we're even. ...No, we're not. Battle me!"),
        ] },
        { id: "d", type: "boss", name: "Undella Town: Cynthia", lv: 82, env: "sea", trainer: TR("Cynthia", "un_cynthia", "We meet again, Champion. My Pokémon have grown too. Shall we?", "Wonderful. Unova really does make strong Trainers."),
          waves: [WU("spiritomb:80", "milotic:80", "togekiss:80"), WU("lucario:80", "glaceon:80", "garchomp:82!")], pre: [
          L("narr", "Cynthia is back at Caitlin's villa in Undella for the summer. She's reading the same book."),
        ] },
        { id: "e", type: "side", name: "Cave of Being: Mesprit", lv: 65, env: "tower", wild: 1, catch: "mesprit", waves: [WU("mesprit:65!")], pre: [
          L("narr", "Behind a waterfall on Route 20, the Cave of Being. Three lights flash past you and scatter across Unova. One lands on the Celestial Tower's roof: Mesprit."),
        ], post: [L("narr", "Gotcha! Mesprit was caught!")] },
        { id: "f", type: "side", name: "Route 23: Azelf", lv: 65, env: "route", wild: 1, catch: "azelf", waves: [WU("azelf:65!")], pre: [
          L("narr", "The second light came down on Route 23, by the boulders: Azelf."),
        ], post: [L("narr", "Gotcha! Azelf was caught!")] },
        { id: "g", type: "side", name: "Nacrene City: Uxie", lv: 65, env: "city", wild: 1, catch: "uxie", waves: [WU("uxie:65!")], pre: [
          L("narr", "The third light floats outside the Nacrene Museum, eyes closed: Uxie."),
        ], post: [L("narr", "Gotcha! Uxie was caught!")] },
        { id: "h", type: "side", name: "Clay Tunnel: Regirock", lv: 65, reward: { key: "un_ironkey" }, env: "cave", wild: 1, catch: "regirock", waves: [WU("regirock:65!")], pre: [
          L("narr", "Under Clay Tunnel lie the Underground Ruins. A hint on a statue opens a hidden chamber, and a body of stone stirs."),
        ], post: [L("narr", "Gotcha! Regirock was caught! It leaves you the Iron Key: the Iron Chamber can open now.")] },
        { id: "i", type: "side", name: "Underground Ruins: Registeel", lv: 65, env: "cave", wild: 1, catch: "registeel", waves: [WU("registeel:65!")], pre: [
          L("narr", "The Iron Key opens the Iron Chamber. Registeel's body hums like struck metal."),
        ], post: [L("narr", "Gotcha! Registeel was caught!")] },
        { id: "j", type: "side", name: "Twist Mountain: Regigigas", lv: 68, env: "cave", wild: 1, catch: "regigigas", waves: [WU("regigigas:68!")], pre: [
          L("narr", "With the three giants beside you (Regice from a traded Iceberg Key), a new chamber opens in Twist Mountain. Regigigas, the one that moved the continents, wakes slowly."),
        ], post: [L("narr", "Gotcha! Regigigas was caught!")] },
        { id: "k", type: "side", name: "Reversal Mountain: Heatran", lv: 68, env: "volcano", wild: 1, catch: "heatran", waves: [WU("heatran:68!")], pre: [
          L("narr", "With the Magma Stone from Route 18, the chamber deep in Reversal Mountain opens. Bianca's been studying it. Heatran crawls out of the heat."),
        ], post: [L("narr", "Gotcha! Heatran was caught!")] },
        { id: "l", type: "side", name: "Marvelous Bridge: Cresselia", lv: 68, env: "sea", wild: 1, catch: "cresselia", waves: [WU("cresselia:68!")], pre: [
          L("narr", "On Marvelous Bridge, the Lunar Wing from the Strange House glows. A crescent of light comes down to meet it: Cresselia."),
        ], post: [L("narr", "Gotcha! Cresselia was caught!")] },
        { id: "m", type: "side", name: "The Dreamyard: Latios", lv: 68, env: "forest", wild: 1, catch: "latios", waves: [WU("latios:68!")], pre: [
          L("narr", "Something blue streaks across the Dreamyard. You chase it through the ruins until it turns and attacks: Latios."),
        ], post: [L("narr", "Gotcha! Latios was caught! It dropped a Soul Dew.")] },
        { id: "n", type: "side", name: "The Nature Preserve: Haxorus", lv: 60, env: "forest", wild: 1, catch: "haxorus", waves: [WU("fraxure:57", "fraxure:58"), WU("haxorus:60!")], pre: [
          L("narr", "With Professor Juniper's Permit, a plane takes you from Mistralton to the Nature Preserve. A golden Haxorus is waiting in the clearing."),
        ], post: [L("narr", "Gotcha! Haxorus was caught! Its scales shine gold.")] },
        { id: "o", type: "boss", name: "N's Castle: N", lv: 75, reward: { key: "un_darkstone" }, env: "tower", trainer: TR("N", "un_n", "Thank you for coming. Zekrom and I want to know: what kind of Trainer are you now?", "...I understand. Zekrom wants to go with you. It's sleeping now, as a stone."),
          waves: [WU("zekrom:75!")], pre: [
          L("narr", "A Zoroark leads you from Victory Road into the ruins of N's Castle. N is waiting in the throne room."),
          L("un", "Two years ago a Trainer showed me that people and Pokémon belong together. I wanted to thank them. You'll do."),
        ], post: [L("narr", "N gives you the Dark Stone. 'Take it to Dragonspiral Tower,' he says. 'It will wake there.'")] },
        { id: "p", type: "boss", name: "Dragonspiral Tower: Zekrom", lv: 70, env: "tower", wild: 1, catch: "zekrom", waves: [WU("zekrom:70!")], pre: [
          L("narr", "At the top of Dragonspiral Tower, the Dark Stone crackles with lightning and wakes. Zekrom, the dragon of ideals, wants to see your ideals for itself."),
        ], post: [L("narr", "Gotcha! Zekrom was caught! The dragon of ideals has chosen you.")] },
        { id: "q", type: "boss", name: "Giant Chasm: Kyurem", lv: 70, reward: { key: "un_dnasplicers" }, env: "ice", weather: "hail", wild: 1, catch: "kyurem", waves: [WU("kyurem:70!")], pre: [
          L("narr", "In the back cavern of the Giant Chasm, Kyurem is resting where Ghetsis chained it. Cheren and Bianca arrive behind you."),
          L("ubianca", "It's lonely, I think. It's been waiting for something to fill the empty part of it."),
        ], post: [
          L("narr", "Gotcha! Kyurem was caught! It leaves behind the DNA Splicers: with them, it can join with Zekrom again."),
          L("narr", "You've done it: the Unova Journey is complete, both parts of it."),
        ] },
      ] },
  ],
};
STORY.push(UNOVA_JOURNEY);
indexJourney(UNOVA_JOURNEY);
// The Battle Tower's Unova wing (TOWER_WING in a4_story.js; the owner's rule: every canon battle the Journey leaves out goes to the
// Tower): Black/White's League rematch, Black City's market and the Battle Subway's Bosses; Black 2/White 2's Normal Mode Gym and Elite
// Four teams (the Journey has Challenge Mode's, the owner's pick; Iris's Normal team has the same six, so it's left out), both modes'
// League rematches, the post-game Trainers (Hugh's daily battle, Colress, N's four seasonal teams, the Shadow Triad at Icirrus, the
// Striaton brothers, GAME FREAK's Morimoto and Nishino, Cheren's and Bianca's Memory Link teams), the Black Tower's Bosses (Black 2's,
// Benga last), and the Pokémon World Tournament: the Driftveil Tournament's later entrants, Bianca's Mix team, the Unova Leaders, all
// 46 Leaders' World Leaders teams, the Champions and the Type Experts (the other regions' own Leaders tournaments use weaker teams of
// the same Leaders, so they're left out). Generated from the canon sheets (session notes: unova_extras_canon.md, unova_b2w2_canon.md):
// levels are Challenge Mode's where it has its own, Power Herb is left off (not one of the game's items). Cheren's and Bianca's follow
// your Part 1 starter, Hugh's your Part 2 one. The floors sort themselves by level.
// <tower-wing: generated from the canon sheets>
if (typeof TOWER_WING === "object") TOWER_WING.unova = [
  { n: "Elite Four Shauntal", t: "un_shauntal", from: "Black/White, League rematch", waves: [WU("cofagrigus:71", "jellicent:71", "golurk:71"), WU("froslass:71", "drifblim:71", "chandelure:73!")] },
  { n: "Elite Four Grimsley", t: "un_grimsley", from: "Black/White, League rematch", waves: [WU("sharpedo:71", "scrafty:71", "krookodile:71"), WU("liepard:71", "drapion:71", "bisharp:73!")] },
  { n: "Elite Four Caitlin", t: "un_caitlin", from: "Black/White, League rematch", waves: [WU("musharna:71", "sigilyph:71", "reuniclus:71"), WU("gothitelle:71", "bronzong:71", "metagross:73!")] },
  { n: "Elite Four Marshal", t: "un_marshal", from: "Black/White, League rematch", waves: [WU("breloom:71", "throh:71", "sawk:71"), WU("mienshao:71", "toxicroak:71", "conkeldurr:73!")] },
  { n: "Roughneck Johnny", t: "un_roughneck", from: "Black/White, Black City market", waves: [WU("gothitelle:65", "krookodile:65", "galvantula:65!")] },
  { n: "Backpacker Kiyo", t: "un_backpacker", from: "Black/White, Black City market", waves: [WU("beartic:65", "excadrill:65", "heatmor:65!")] },
  { n: "Subway Boss Ingo", t: "un_ingo", from: "Battle Subway, Single Train, 21st battle", waves: [WU("crustle:50@rockyhelmet", "klinklang:50@occaberry", "garbodor:50!@blacksludge")] },
  { n: "Subway Boss Ingo", t: "un_ingo", from: "Battle Subway, Super Single Train, 49th battle", waves: [WU("excadrill:50@lifeorb", "haxorus:50@yacheberry", "chandelure:50!@whiteherb")] },
  { n: "Subway Boss Emmet", t: "un_emmet", from: "Battle Subway, Double Train, 21st battle", waves: [WU("crustle:50@rockyhelmet", "klinklang:50@steelgem"), WU("garbodor:50@blacksludge", "durant:50!@occaberry")] },
  { n: "Subway Boss Emmet", t: "un_emmet", from: "Battle Subway, Super Double Train, 49th battle", waves: [WU("excadrill:50@lifeorb", "haxorus:50@yacheberry"), WU("chandelure:50@whiteherb", "eelektross:50!@magnet")] },
  { n: "Subway Bosses Ingo & Emmet", t: "un_ingo", from: "Battle Subway, Multi Train, 21st battle", waves: [WU("garbodor:50@blacksludge", "klinklang:50@occaberry"), WU("durant:50@occaberry", "galvantula:50!@scopelens")] },
  { n: "Subway Bosses Ingo & Emmet", t: "un_ingo", from: "Battle Subway, Super Multi Train, 49th battle", waves: [WU("excadrill:50@lifeorb", "haxorus:50@yacheberry"), WU("eelektross:50@magnet", "archeops:50!@sitrusberry")] },
  { n: "Leader Cheren", t: "un_cheren2", from: "Black 2/White 2, Normal Mode", waves: [WU("patrat:11", "lillipup:13!")] },
  { n: "Leader Roxie", t: "un_roxie", from: "Black 2/White 2, Normal Mode", waves: [WU("koffing:16", "whirlipede:18!")] },
  { n: "Leader Burgh", t: "un_burgh", from: "Black 2/White 2, Normal Mode", waves: [WU("swadloon:22", "dwebble:22", "leavanny:24!@sitrusberry")] },
  { n: "Leader Elesa", t: "un_elesa2", from: "Black 2/White 2, Normal Mode", waves: [WU("emolga:28", "flaaffy:28", "zebstrika:30!@sitrusberry")] },
  { n: "Leader Clay", t: "un_clay", from: "Black 2/White 2, Normal Mode", waves: [WU("krokorok:31", "sandslash:31", "excadrill:33!@sitrusberry")] },
  { n: "Leader Skyla", t: "un_skyla", from: "Black 2/White 2, Normal Mode", waves: [WU("swoobat:37", "skarmory:37", "swanna:39!@sitrusberry")] },
  { n: "Leader Drayden", t: "un_drayden", from: "Black 2/White 2, Normal Mode", waves: [WU("druddigon:46", "flygon:46", "haxorus:48!@sitrusberry")] },
  { n: "Leader Marlon", t: "un_marlon", from: "Black 2/White 2, Normal Mode", waves: [WU("carracosta:49", "wailord:49", "jellicent:51!@sitrusberry")] },
  { n: "Elite Four Shauntal", t: "un_shauntal", from: "Black 2/White 2, Normal Mode", waves: [WU("cofagrigus:56", "drifblim:56"), WU("golurk:56", "chandelure:58!@sitrusberry")] },
  { n: "Elite Four Grimsley", t: "un_grimsley", from: "Black 2/White 2, Normal Mode", waves: [WU("liepard:56", "scrafty:56"), WU("krookodile:56", "bisharp:58!@sitrusberry")] },
  { n: "Elite Four Caitlin", t: "un_caitlin", from: "Black 2/White 2, Normal Mode", waves: [WU("musharna:56", "sigilyph:56"), WU("reuniclus:56", "gothitelle:58!@sitrusberry")] },
  { n: "Elite Four Marshal", t: "un_marshal", from: "Black 2/White 2, Normal Mode", waves: [WU("throh:56", "sawk:56"), WU("mienshao:56", "conkeldurr:58!@sitrusberry")] },
  { n: "Elite Four Shauntal", t: "un_shauntal", from: "Black 2/White 2, League rematch, Normal Mode", waves: [WU("cofagrigus:72", "mismagius:72", "froslass:72"), WU("drifblim:72@flyinggem", "golurk:72", "chandelure:74!@sitrusberry")] },
  { n: "Elite Four Shauntal", t: "un_shauntal", from: "Black 2/White 2, League rematch, Challenge Mode", waves: [WU("cofagrigus:77@leftovers", "gengar:77@expertbelt", "froslass:77@wiseglasses"), WU("drifblim:77@flyinggem", "golurk:77@muscleband", "chandelure:79!@choicescarf")] },
  { n: "Elite Four Grimsley", t: "un_grimsley", from: "Black 2/White 2, League rematch, Normal Mode", waves: [WU("liepard:72@normalgem", "honchkrow:72", "scrafty:72"), WU("krookodile:72", "houndoom:72", "bisharp:74!@sitrusberry")] },
  { n: "Elite Four Grimsley", t: "un_grimsley", from: "Black 2/White 2, League rematch, Challenge Mode", waves: [WU("honchkrow:77@scopelens", "scrafty:77@leftovers", "krookodile:77@muscleband"), WU("houndoom:77@wiseglasses", "tyranitar:77@focusband", "bisharp:79!@quickclaw")] },
  { n: "Elite Four Caitlin", t: "un_caitlin", from: "Black 2/White 2, League rematch, Normal Mode", waves: [WU("musharna:72", "sigilyph:72", "gothitelle:72"), WU("gallade:72", "reuniclus:72@leftovers", "metagross:74!@sitrusberry")] },
  { n: "Elite Four Caitlin", t: "un_caitlin", from: "Black 2/White 2, League rematch, Challenge Mode", waves: [WU("musharna:77@zoomlens", "alakazam:77@expertbelt", "gothitelle:77@wiseglasses"), WU("gallade:77@muscleband", "reuniclus:77@leftovers", "metagross:79!@lifeorb")] },
  { n: "Elite Four Marshal", t: "un_marshal", from: "Black 2/White 2, League rematch, Normal Mode", waves: [WU("throh:72", "sawk:72@muscleband", "lucario:72"), WU("mienshao:72", "medicham:72", "conkeldurr:74!@sitrusberry")] },
  { n: "Elite Four Marshal", t: "un_marshal", from: "Black 2/White 2, League rematch, Challenge Mode", waves: [WU("throh:77@focusband", "sawk:77@muscleband", "lucario:77@wiseglasses"), WU("mienshao:77@ejectbutton", "machamp:77@expertbelt", "conkeldurr:79!@flameorb")] },
  { n: "Champion Iris", t: "un_iris2", from: "Black 2/White 2, League rematch, Normal Mode", waves: [WU("hydreigon:76", "druddigon:76@lifeorb", "archeops:76"), WU("aggron:76", "lapras:76", "haxorus:78!@focussash")] },
  { n: "Champion Iris", t: "un_iris2", from: "Black 2/White 2, League rematch, Challenge Mode", waves: [WU("hydreigon:81@wiseglasses", "salamence:81@lifeorb", "archeops:81@flyinggem"), WU("aggron:81@muscleband", "lapras:81@zoomlens", "haxorus:83!@focussash")] },
  { n: "Hugh", t: "un_hugh", from: "Black 2/White 2, Driftveil City, daily", waves: () => ({ snivy: [WU("unfezant:68@scopelens", "simipour:68@salacberry", "bouffalant:68@muscleband"), WU("flygon:68@dragongem", "eelektross:68@leftovers", "emboar:70!@focussash")], tepig: [WU("unfezant:68@scopelens", "simisage:68@salacberry", "bouffalant:68@muscleband"), WU("flygon:68@dragongem", "eelektross:68@leftovers", "samurott:70!@focussash")], oshawott: [WU("unfezant:68@scopelens", "simisear:68@salacberry", "bouffalant:68@muscleband"), WU("flygon:68@dragongem", "eelektross:68@leftovers", "serperior:70!@focussash")] })[unova2Starter()] },
  { n: "Colress", t: "un_colress", from: "Black 2/White 2, P2 Laboratory, daily", waves: [WU("magneton:76@eviolite", "rotomwash:76@lifeorb", "metagross:76@muscleband"), WU("beheeyem:76@leftovers", "magnezone:76@wiseglasses", "klinklang:78!@airballoon")] },
  { n: "N", t: "un_n", from: "Black 2/White 2, N's Castle, spring team", waves: [WU("politoed:82@lifeorb", "lanturn:80", "tentacruel:80@damprock"), WU("omastar:80@damprock", "kabutops:80", "starmie:80")] },
  { n: "N", t: "un_n", from: "Black 2/White 2, N's Castle, summer team", waves: [WU("ninetales:82@lifeorb", "arcanine:80", "rapidash:80"), WU("shiftry:80@heatrock", "ninjask:80@heatrock", "leafeon:80")] },
  { n: "N", t: "un_n", from: "Black 2/White 2, N's Castle, autumn team", waves: [WU("hippowdon:82@lifeorb", "gastrodon:80@smoothrock", "cradily:80@smoothrock"), WU("armaldo:80", "scizor:80", "rhyperior:80")] },
  { n: "N", t: "un_n", from: "Black 2/White 2, N's Castle, winter team", waves: [WU("abomasnow:82@lifeorb", "vanilluxe:80@icyrock", "cloyster:80"), WU("mamoswine:80", "froslass:80@icyrock", "glaceon:80")] },
  { n: "Cheren", t: "un_cheren", from: "Black 2/White 2, Memory Link (his Black/White post-game team)", waves: () => ({ snivy: [WU("liepard:67@sitrusberry", "simisage:67@miracleseed", "unfezant:67@scopelens"), WU("gigalith:67@leftovers", "haxorus:67@dragongem", "emboar:69!@focussash")], tepig: [WU("liepard:67@sitrusberry", "simisear:67@charcoal", "unfezant:67@scopelens"), WU("gigalith:67@leftovers", "haxorus:67@dragongem", "samurott:69!@focussash")], oshawott: [WU("liepard:67@sitrusberry", "simipour:67@mysticwater", "unfezant:67@scopelens"), WU("gigalith:67@leftovers", "haxorus:67@dragongem", "serperior:69!@focussash")] })[unovaStarter()] },
  { n: "Bianca", t: "un_bianca", from: "Black 2/White 2, Memory Link (her Black/White post-game team)", waves: () => ({ snivy: [WU("stoutland:68", "simisear:68", "musharna:68"), WU("mienshao:68", "chandelure:68", "samurott:70!")], tepig: [WU("stoutland:68", "simipour:68", "musharna:68"), WU("mienshao:68", "chandelure:68", "serperior:70!")], oshawott: [WU("stoutland:68", "simisage:68", "musharna:68"), WU("mienshao:68", "chandelure:68", "emboar:70!")] })[unovaStarter()] },
  { n: "Morimoto", t: "un_veteran", from: "Black 2/White 2, GAME FREAK, Castelia City, before the Hall of Fame", waves: [WU("pansage:16@oranberry", "pansear:16@oranberry", "panpour:16!@oranberry")] },
  { n: "Morimoto", t: "un_veteran", from: "Black 2/White 2, GAME FREAK, Castelia City, after the Hall of Fame", waves: [WU("liepard:78", "simipour:78@petayaberry", "simisear:78@petayaberry"), WU("simisage:78@petayaberry", "swoobat:78", "zebstrika:80!")] },
  { n: "Nishino", t: "un_hiker", from: "Black 2/White 2, GAME FREAK, Castelia City, before the Hall of Fame", waves: [WU("clefairy:18!@leftovers")] },
  { n: "Nishino", t: "un_hiker", from: "Black 2/White 2, GAME FREAK, Castelia City, after the Hall of Fame", waves: [WU("clefable:78@leftovers", "azumarill:78@leftovers", "lickilicky:78@leftovers"), WU("wigglytuff:78@leftovers", "alomomola:78@leftovers", "snorlax:80!@leftovers")] },
  { n: "Shadow Triad", t: "un_shadow", from: "Black 2/White 2, Icirrus City, Single Battle", waves: [WU("bisharp:70", "bisharp:70", "absol:72!")] },
  { n: "Shadow Triad", t: "un_shadow", from: "Black 2/White 2, Icirrus City, Triple Battle", waves: [WU("bisharp:70", "accelgor:72", "bisharp:70")] },
  { n: "Shadow Triad", t: "un_shadow", from: "Black 2/White 2, Icirrus City, Rotation Battle", waves: [WU("banette:72", "bisharp:70", "bisharp:70")] },
  { n: "Leader Cilan", t: "un_cilan", from: "Black 2/White 2, Striaton restaurant (Multi Battle)", waves: [WU("maractus:70@muscleband", "ferrothorn:70@leftovers", "simisage:72!@lifeorb")] },
  { n: "Leader Chili", t: "un_chili", from: "Black 2/White 2, Striaton restaurant (Multi Battle)", waves: [WU("heatmor:70@leftovers", "darmanitan:70@muscleband", "simisear:72!@lifeorb")] },
  { n: "Leader Cress", t: "un_cress", from: "Black 2/White 2, Striaton restaurant (Multi Battle)", waves: [WU("basculin:70@muscleband", "slowking:70@leftovers", "simipour:72!@lifeorb")] },
  { n: "Boss Trainer Abed", t: "un_acetrainer", from: "Black 2/White 2, Black Tower, Area 1", waves: [WU("unfezant:58@scopelens", "pawniard:58@muscleband", "boldore:58!@quickclaw")] },
  { n: "Boss Trainer Bess", t: "un_acetrainerf", from: "Black 2/White 2, Black Tower, Area 2", waves: [WU("watchog:61@shellbell", "swoobat:61@wiseglasses", "basculin:61!@mysticwater")] },
  { n: "Boss Trainer Carlen", t: "un_veteran", from: "Black 2/White 2, Black Tower, Area 3", waves: [WU("bouffalant:64@muscleband", "swanna:64@wacanberry", "scolipede:64!@lifeorb")] },
  { n: "Boss Trainer Danelle", t: "un_veteranf", from: "Black 2/White 2, Black Tower, Area 4", waves: [WU("gigalith:67@quickclaw", "seviper:67@blacksludge", "durant:67!@occaberry")] },
  { n: "Boss Trainer Ellas", t: "un_acetrainer", from: "Black 2/White 2, Black Tower, Area 5", waves: [WU("bronzong:70@quickclaw", "kabutops:70@choiceband", "golurk:70!@choicescarf")] },
  { n: "Boss Trainer Freira", t: "un_acetrainerf", from: "Black 2/White 2, Black Tower, Area 6", waves: [WU("porygonz:73@petayaberry", "breloom:73@toxicorb", "armaldo:73!@choicescarf")] },
  { n: "Boss Trainer Gaius", t: "un_veteran", from: "Black 2/White 2, Black Tower, Area 7", waves: [WU("gyarados:76@wacanberry", "weavile:76@focussash", "dusknoir:76!@leftovers")] },
  { n: "Boss Trainer Harmony", t: "un_veteranf", from: "Black 2/White 2, Black Tower, Area 8", waves: [WU("infernape:79@lifeorb", "archeops:79@liechiberry", "tornadus:79!@mentalherb")] },
  { n: "Boss Trainer Ira", t: "un_acetrainer", from: "Black 2/White 2, Black Tower, Area 9", waves: [WU("hydreigon:82@chopleberry", "articuno:82@icegem", "entei:82!@lifeorb")] },
  { n: "Benga", t: "un_benga", from: "Black 2/White 2, Black Tower, Area 10", waves: [WU("latios:85@whiteherb", "garchomp:85@lifeorb", "volcarona:85!@focussash")] },
  { n: "Leader Cheren", t: "un_cheren2", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("stoutland:25", "zangoose:25", "cinccino:25"), WU("watchog:25", "cinccino:25", "watchog:25!")] },
  { n: "Leader Roxie", t: "un_roxie", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("scolipede:25", "seviper:25", "garbodor:25"), WU("golbat:25", "garbodor:25", "golbat:25!")] },
  { n: "Leader Burgh", t: "un_burgh", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("leavanny:25", "vespiquen:25", "crustle:25"), WU("escavalier:25", "crustle:25", "escavalier:25!")] },
  { n: "Leader Elesa", t: "un_elesa2", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("zebstrika:25", "flaaffy:25", "galvantula:25"), WU("emolga:25", "galvantula:25", "emolga:25!")] },
  { n: "Leader Clay", t: "un_clay", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("excadrill:25", "claydol:25", "krokorok:25"), WU("palpitoad:25", "krokorok:25", "palpitoad:25!")] },
  { n: "X", t: "un_acetrainer", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("archeops:25", "simisage:25", "rufflet:25"), WU("frillish:25", "rufflet:25", "frillish:25!")] },
  { n: "Makina", t: "un_acetrainerf", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("tirtouga:25", "simisear:25", "vullaby:25"), WU("ferroseed:25", "vullaby:25", "ferroseed:25!")] },
  { n: "Fidel", t: "un_veteran", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("whimsicott:25", "simipour:25", "cubchoo:25"), WU("growlithe:25", "cubchoo:25", "growlithe:25!")] },
  { n: "Theodora", t: "un_veteranf", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("lilligant:25", "alomomola:25", "purrloin:25"), WU("vanillite:25", "purrloin:25", "vanillite:25!")] },
  { n: "Allan", t: "un_blackbelt", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("throh:25", "sudowoodo:25", "scrafty:25"), WU("boldore:25", "scrafty:25", "boldore:25!")] },
  { n: "Jocelyn", t: "un_battlegirl", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("sawk:25", "heracross:25", "gurdurr:25"), WU("nosepass:25", "gurdurr:25", "nosepass:25!")] },
  { n: "Dmitri", t: "un_scientist", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("golduck:25", "tranquill:25", "klink:25"), WU("koffing:25", "klink:25", "koffing:25!")] },
  { n: "Levina", t: "un_scientistf", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("lopunny:25", "swanna:25", "deerling:25"), WU("grimer:25", "deerling:25", "grimer:25!")] },
  { n: "Rylan", t: "un_psychic", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("cofagrigus:25", "sigilyph:25", "solosis:25"), WU("elgyem:25", "solosis:25", "elgyem:25!")] },
  { n: "Destiny", t: "un_psychicf", from: "Black 2/White 2, World Tournament, Driftveil Tournament", waves: [WU("mrmime:25", "swoobat:25", "gothita:25"), WU("litwick:25", "gothita:25", "litwick:25!")] },
  { n: "Bianca", t: "un_bianca2", from: "Black 2/White 2, World Tournament, Mix Tournament", waves: [WU("musharna:50", "dewott:50", "pignite:50"), WU("servine:50", "audino:50", "fraxure:50!")] },
  { n: "Leader Cilan", t: "un_cilan", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("simisage:50@grassgem", "ferrothorn:50@apicotberry", "maractus:50@lumberry"), WU("jumpluff:50@yacheberry", "whimsicott:50@occaberry", "lilligant:50!@petayaberry")] },
  { n: "Leader Chili", t: "un_chili", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("simisear:50@firegem", "heatmor:50@salacberry", "darmanitan:50@fightinggem"), WU("arcanine:50@dragongem", "camerupt:50@passhoberry", "magmortar:50!@petayaberry")] },
  { n: "Leader Cress", t: "un_cress", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("simipour:50@watergem", "golduck:50@petayaberry", "floatzel:50@liechiberry"), WU("azumarill:50@sitrusberry", "slowking:50@lumberry", "basculin:50!@salacberry")] },
  { n: "Leader Lenora", t: "un_lenora", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("watchog:50@salacberry", "audino:50@sitrusberry", "clefable:50@steelgem"), WU("kangaskhan:50@chopleberry", "sawsbuck:50@liechiberry", "dunsparce:50!@apicotberry")] },
  { n: "Leader Burgh", t: "un_burgh", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("leavanny:50@cobaberry", "vespiquen:50@apicotberry", "crustle:50@salacberry"), WU("escavalier:50@occaberry", "accelgor:50@petayaberry", "durant:50!@liechiberry")] },
  { n: "Leader Elesa", t: "un_elesa2", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("zebstrika:50@liechiberry", "ampharos:50@shucaberry", "galvantula:50@sitrusberry"), WU("emolga:50@flyinggem", "eelektross:50@salacberry", "stunfisk:50!@petayaberry")] },
  { n: "Leader Clay", t: "un_clay", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("excadrill:50@liechiberry", "claydol:50@ganlonberry", "krookodile:50@chopleberry"), WU("seismitoad:50@rindoberry", "mamoswine:50@icegem", "golurk:50!@ghostgem")] },
  { n: "Leader Skyla", t: "un_skyla", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("swanna:50@wacanberry", "unfezant:50@liechiberry", "swoobat:50@petayaberry"), WU("archeops:50@flyinggem", "braviary:50@normalgem", "mandibuzz:50!@apicotberry")] },
  { n: "Leader Brycen", t: "un_brycen", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("cryogonal:50@petayaberry", "beartic:50@liechiberry", "vanilluxe:50@occaberry"), WU("weavile:50@chopleberry", "dewgong:50@wacanberry", "walrein:50!@salacberry")] },
  { n: "Leader Drayden", t: "un_drayden", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("haxorus:50@dragongem", "druddigon:50@salacberry", "hydreigon:50@petayaberry"), WU("flygon:50@liechiberry", "altaria:50@apicotberry", "salamence:50!@yacheberry")] },
  { n: "Leader Cheren", t: "un_cheren2", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("stoutland:50@salacberry", "zangoose:50@chopleberry", "cinccino:50@rawstberry"), WU("lopunny:50@liechiberry", "castform:50@petayaberry", "bouffalant:50!@normalgem")] },
  { n: "Leader Roxie", t: "un_roxie", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("scolipede:50@liechiberry", "seviper:50@shucaberry", "garbodor:50@salacberry"), WU("crobat:50@payapaberry", "drapion:50@sitrusberry", "amoonguss:50!@ganlonberry")] },
  { n: "Leader Marlon", t: "un_marlon", from: "Black 2/White 2, World Tournament, Unova Leaders Tournament", waves: [WU("jellicent:50@rindoberry", "carracosta:50@liechiberry", "starmie:50@ganlonberry"), WU("alomomola:50@apicotberry", "mantine:50@petayaberry", "wailord:50!@sitrusberry")] },
  { n: "Leader Brock", t: "un_brock", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("onix:50@eviolite", "golem:50@lumberry", "kabutops:50@focussash"), WU("tyranitar:50@chopleberry", "aerodactyl:50@choicescarf", "rhyperior:50!@expertbelt")] },
  { n: "Leader Misty", t: "un_misty", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("starmie:50@choicescarf", "lanturn:50@sitrusberry", "jellicent:50@leftovers"), WU("lapras:50@zoomlens", "quagsire:50@focussash", "blastoise:50!@salacberry")] },
  { n: "Leader Lt. Surge", t: "un_ltsurge", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("raichu:50@lifeorb", "electrode:50@focussash", "magnezone:50@airballoon"), WU("electivire:50@expertbelt", "jolteon:50@shucaberry", "lanturn:50!@widelens")] },
  { n: "Leader Erika", t: "un_erika", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("vileplume:50@blacksludge", "venusaur:50@expertbelt", "cradily:50@leftovers"), WU("exeggutor:50@tangaberry", "tangrowth:50", "abomasnow:50!@focussash")] },
  { n: "Leader Janine", t: "un_janine", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("venomoth:50@widelens", "weezing:50@rockyhelmet", "tentacruel:50@chestoberry"), WU("roserade:50@leftovers", "nidoqueen:50@lifeorb", "crobat:50!@blacksludge")] },
  { n: "Leader Sabrina", t: "un_sabrina", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("alakazam:50@kasibberry", "metagross:50@expertbelt", "exeggutor:50@tangaberry"), WU("slowking:50@choicespecs", "espeon:50@leftovers", "sigilyph:50!@lifeorb")] },
  { n: "Leader Blaine", t: "un_blaine", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("arcanine:50@focussash", "ninetales:50@chartiberry", "charizard:50@lifeorb"), WU("magmortar:50@choicescarf", "flareon:50@passhoberry", "rotomheat:50!@flameorb")] },
  { n: "Leader Giovanni", t: "un_giovanni", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Kanto)", waves: [WU("rhyperior:50@lifeorb", "garchomp:50@choicescarf", "nidoking:50@choicespecs"), WU("gliscor:50@flyinggem", "krookodile:50@expertbelt", "hippowdon:50!@quickclaw")] },
  { n: "Leader Falkner", t: "un_falkner", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("pidgeot:50@lifeorb", "crobat:50@redcard", "aerodactyl:50@focussash"), WU("honchkrow:50@choicescarf", "xatu:50@leftovers", "swellow:50!@flameorb")] },
  { n: "Leader Bugsy", t: "un_bugsy", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("scizor:50@sitrusberry", "shuckle:50@rockyhelmet", "heracross:50@choiceband"), WU("pinsir:50@lifeorb", "armaldo:50@quickclaw", "yanmega:50!@focussash")] },
  { n: "Leader Whitney", t: "un_whitney", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("miltank:50@lumberry", "blissey:50@leftovers", "tauros:50@lifeorb"), WU("ambipom:50@focussash", "ursaring:50@toxicorb", "lopunny:50!@chopleberry")] },
  { n: "Leader Morty", t: "un_morty", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("gengar:50@widelens", "mismagius:50@sitrusberry", "banette:50@ghostgem"), WU("dusknoir:50@leftovers", "chandelure:50@lifeorb", "froslass:50!@focussash")] },
  { n: "Leader Chuck", t: "un_chuck", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("poliwrath:50@sitrusberry", "machamp:50@choiceband", "conkeldurr:50@fightinggem"), WU("hitmontop:50@widelens", "hitmonchan:50@leftovers", "hitmonlee:50!@lifeorb")] },
  { n: "Leader Jasmine", t: "un_jasmine", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("steelix:50@rockyhelmet", "magnezone:50@quickclaw", "forretress:50@ironball"), WU("skarmory:50@leftovers", "metagross:50@airballoon", "lucario:50!@lifeorb")] },
  { n: "Leader Pryce", t: "un_pryce", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("mamoswine:50@focussash", "jynx:50@psychicgem", "dewgong:50@lumberry"), WU("cloyster:50@kingsrock", "lapras:50@chestoberry", "weavile:50!@icegem")] },
  { n: "Leader Clair", t: "un_clair", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Johto)", waves: [WU("kingdra:50@chestoberry", "dragonite:50@yacheberry", "altaria:50@leftovers"), WU("salamence:50@dragongem", "druddigon:50@rockyhelmet", "garchomp:50!@focussash")] },
  { n: "Leader Roxanne", t: "un_roxanne", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("probopass:50@airballoon", "armaldo:50@lumberry", "cradily:50@leftovers"), WU("aggron:50@focussash", "carracosta:50@watergem", "golem:50!@groundgem")] },
  { n: "Leader Brawly", t: "un_brawly", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("hariyama:50@chestoberry", "scrafty:50@leftovers", "breloom:50@focussash"), WU("machamp:50@choiceband", "mienshao:50@lifeorb", "heracross:50!@choicescarf")] },
  { n: "Leader Wattson", t: "un_wattson", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("manectric:50@lifeorb", "magnezone:50@leftovers", "electrode:50@airballoon"), WU("rotomwash:50@widelens", "ampharos:50@expertbelt", "raichu:50!@focussash")] },
  { n: "Leader Flannery", t: "un_flannery", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("torkoal:50@leftovers", "camerupt:50@passhoberry", "chandelure:50@focussash"), WU("blaziken:50@airballoon", "houndoom:50@lifeorb", "magmortar:50!@shucaberry")] },
  { n: "Leader Norman", t: "un_norman", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("slaking:50@ejectbutton", "ambipom:50@normalgem", "bouffalant:50@lifeorb"), WU("staraptor:50@choiceband", "exploud:50@expertbelt", "sawsbuck:50!@chestoberry")] },
  { n: "Leader Winona", t: "un_winona", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("altaria:50", "sigilyph:50@lifeorb", "gyarados:50@leftovers"), WU("skarmory:50@rockyhelmet", "tropius:50@yacheberry", "honchkrow:50!@darkgem")] },
  { n: "Leader Tate", t: "un_tate", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("solrock:50@passhoberry", "xatu:50@focussash", "bronzong:50@lumberry"), WU("reuniclus:50@lifeorb", "gallade:50@scopelens", "claydol:50!@kasibberry")] },
  { n: "Leader Liza", t: "un_liza", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("lunatone:50@expertbelt", "xatu:50@focussash", "bronzong:50@rockyhelmet"), WU("gothitelle:50@leftovers", "gardevoir:50@lumberry", "claydol:50!@sitrusberry")] },
  { n: "Leader Juan", t: "un_juan", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Hoenn)", waves: [WU("kingdra:50@habanberry", "walrein:50@leftovers", "crawdaunt:50@lifeorb"), WU("whiscash:50@chestoberry", "relicanth:50@damprock", "politoed:50!@widelens")] },
  { n: "Leader Roark", t: "un_roark", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("rampardos:50@focussash", "probopass:50@airballoon", "archeops:50@lifeorb"), WU("crustle:50", "golem:50@choiceband", "relicanth:50!@liechiberry")] },
  { n: "Leader Gardenia", t: "un_gardenia", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("roserade:50@choicescarf", "tropius:50@heatrock", "breloom:50@focussash"), WU("tangrowth:50@salacberry", "leafeon:50@yacheberry", "torterra:50!@choiceband")] },
  { n: "Leader Maylene", t: "un_maylene", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("lucario:50@focussash", "infernape:50@firegem", "toxicroak:50@payapaberry"), WU("gallade:50@cobaberry", "medicham:50@choicescarf", "machamp:50!@scopelens")] },
  { n: "Leader Crasher Wake", t: "un_wake", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("floatzel:50@lifeorb", "empoleon:50@petayaberry", "ludicolo:50@leftovers"), WU("gastrodon:50@rindoberry", "poliwrath:50@salacberry", "gyarados:50!@wacanberry")] },
  { n: "Leader Fantina", t: "un_fantina", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("mismagius:50@salacberry", "drifblim:50@flyinggem", "spiritomb:50@sitrusberry"), WU("dusknoir:50@apicotberry", "jellicent:50@ghostgem", "gengar:50!@focussash")] },
  { n: "Leader Byron", t: "un_byron", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("bastiodon:50@airballoon", "excadrill:50@lifeorb", "bronzong:50@ironball"), WU("magnezone:50@shucaberry", "aggron:50@choiceband", "forretress:50!@lightclay")] },
  { n: "Leader Candice", t: "un_candice", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("froslass:50@petayaberry", "abomasnow:50@occaberry", "weavile:50@chopleberry"), WU("glaceon:50@lifeorb", "mamoswine:50@salacberry", "glalie:50!@rockgem")] },
  { n: "Leader Volkner", t: "un_volkner", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Sinnoh)", waves: [WU("electivire:50@salacberry", "luxray:50@liechiberry", "raichu:50@grassgem"), WU("rotomfan:50@kingsrock", "jolteon:50@airballoon", "electrode:50!@electricgem")] },
  { n: "Leader Cilan", t: "un_cilan", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("simisage:50@grassgem", "ferrothorn:50@choiceband", "serperior:50@leftovers"), WU("jumpluff:50@focussash", "whimsicott:50@mentalherb", "lilligant:50!@miracleseed")] },
  { n: "Leader Chili", t: "un_chili", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("simisear:50@firegem", "heatmor:50@focussash", "darmanitan:50@lifeorb"), WU("arcanine:50", "camerupt:50@shucaberry", "emboar:50!@expertbelt")] },
  { n: "Leader Cress", t: "un_cress", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("simipour:50@watergem", "crawdaunt:50@choicescarf", "samurott:50@leftovers"), WU("azumarill:50@choiceband", "slowking:50@expertbelt", "seismitoad:50!@rindoberry")] },
  { n: "Leader Lenora", t: "un_lenora", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("watchog:50@focussash", "braviary:50", "cinccino:50@lifeorb"), WU("kangaskhan:50@chopleberry", "sawsbuck:50@choicescarf", "lickilicky:50!@expertbelt")] },
  { n: "Leader Burgh", t: "un_burgh", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("leavanny:50@focussash", "vespiquen:50@leftovers", "crustle:50@salacberry"), WU("heracross:50@choicescarf", "accelgor:50@brightpowder", "durant:50!@widelens")] },
  { n: "Leader Elesa", t: "un_elesa2", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("zebstrika:50@lifeorb", "ampharos:50@shucaberry", "luxray:50@expertbelt"), WU("emolga:50@flyinggem", "eelektross:50@choiceband", "stunfisk:50!@sitrusberry")] },
  { n: "Leader Clay", t: "un_clay", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("excadrill:50@focussash", "flygon:50@liechiberry", "krookodile:50@choiceband"), WU("seismitoad:50@lifeorb", "mamoswine:50@icegem", "golurk:50!@leftovers")] },
  { n: "Leader Skyla", t: "un_skyla", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("swanna:50@focussash", "jumpluff:50@flyinggem", "drifblim:50@expertbelt"), WU("archeops:50@sitrusberry", "braviary:50@whiteherb", "mandibuzz:50!@salacberry")] },
  { n: "Leader Brycen", t: "un_brycen", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("cryogonal:50@widelens", "beartic:50@brightpowder", "vanilluxe:50@leftovers"), WU("weavile:50@focussash", "dewgong:50@lifeorb", "walrein:50!@expertbelt")] },
  { n: "Leader Drayden", t: "un_drayden", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("haxorus:50@focussash", "druddigon:50@rockyhelmet", "hydreigon:50@choicespecs"), WU("flygon:50@widelens", "altaria:50@yacheberry", "salamence:50!@whiteherb")] },
  { n: "Leader Cheren", t: "un_cheren2", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("stoutland:50@focussash", "porygonz:50@chopleberry", "cinccino:50@kingsrock"), WU("lickilicky:50@expertbelt", "castform:50@lumberry", "bouffalant:50!@leftovers")] },
  { n: "Leader Roxie", t: "un_roxie", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("scolipede:50@choicescarf", "toxicroak:50@focussash", "garbodor:50@expertbelt"), WU("crobat:50@psychicgem", "drapion:50@scopelens", "amoonguss:50!@blacksludge")] },
  { n: "Leader Marlon", t: "un_marlon", from: "Black 2/White 2, World Tournament, World Leaders Tournament (Unova)", waves: [WU("jellicent:50@expertbelt", "carracosta:50@lumberry", "starmie:50@focussash"), WU("quagsire:50@rindoberry", "cloyster:50@kingsrock", "wailord:50!@choicescarf")] },
  { n: "Red", t: "un_red", from: "Black 2/White 2, World Tournament, Champions Tournament", waves: [WU("pikachu:50@lightball", "venusaur:50@whiteherb", "charizard:50@focussash"), WU("blastoise:50@choicescarf", "snorlax:50@quickclaw", "lapras:50!@sitrusberry")] },
  { n: "Blue", t: "un_blue", from: "Black 2/White 2, World Tournament, Champions Tournament", waves: [WU("aerodactyl:50@choiceband", "exeggutor:50@lifeorb", "gyarados:50@kingsrock"), WU("alakazam:50@focussash", "arcanine:50@expertbelt", "machamp:50!@whiteherb")] },
  { n: "Lance", t: "un_lance", from: "Black 2/White 2, World Tournament, Champions Tournament", waves: [WU("dragonite:50@focussash", "salamence:50@expertbelt", "kingdra:50@scopelens"), WU("haxorus:50@choicescarf", "hydreigon:50@whiteherb", "flygon:50!")] },
  { n: "Steven", t: "un_steven", from: "Black 2/White 2, World Tournament, Champions Tournament", waves: [WU("metagross:50@occaberry", "aggron:50@airballoon", "excadrill:50@focussash"), WU("archeops:50@sitrusberry", "cradily:50@expertbelt", "armaldo:50!@whiteherb")] },
  { n: "Wallace", t: "un_wallace", from: "Black 2/White 2, World Tournament, Champions Tournament", waves: [WU("milotic:50@rockyhelmet", "sharpedo:50@focussash", "walrein:50@leftovers"), WU("ludicolo:50@lifeorb", "swampert:50@rindoberry", "starmie:50!@expertbelt")] },
  { n: "Cynthia", t: "un_cynthia", from: "Black 2/White 2, World Tournament, Champions Tournament", waves: [WU("garchomp:50@focussash", "spiritomb:50@rockyhelmet", "roserade:50@whiteherb"), WU("togekiss:50@leftovers", "lucario:50@lifeorb", "glaceon:50!@choicescarf")] },
  { n: "Alder", t: "un_alder", from: "Black 2/White 2, World Tournament, Champions Tournament", waves: [WU("volcarona:50@chartiberry", "conkeldurr:50@lifeorb", "reuniclus:50@leftovers"), WU("krookodile:50@expertbelt", "chandelure:50@choicescarf", "braviary:50!@choiceband")] },
  { n: "Castor", t: "un_scientist", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Poison)", waves: [WU("muk:50@airballoon", "swalot:50@shucaberry", "dustox:50@occaberry"), WU("skuntank:50@choicescarf", "victreebel:50@lifeorb", "gengar:50!@focussash")] },
  { n: "Homer", t: "un_hiker", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Ground)", waves: [WU("krookodile:50@choicescarf", "camerupt:50", "gastrodon:50@leftovers"), WU("claydol:50@sitrusberry", "hippowdon:50@yacheberry", "steelix:50!@chopleberry")] },
  { n: "Walter", t: "un_veteran", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Bug)", waves: [WU("heracross:50@choiceband", "galvantula:50@lifeorb", "scolipede:50@salacberry"), WU("parasect:50@sitrusberry", "ninjask:50@focussash", "forretress:50!@ironball")] },
  { n: "Ferly", t: "un_psychic", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Ghost)", waves: [WU("cofagrigus:50@rockyhelmet", "drifblim:50@sitrusberry", "sableye:50@lumberry"), WU("golurk:50@choiceband", "gengar:50@expertbelt", "banette:50!@focussash")] },
  { n: "Margaret", t: "un_veteranf", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Steel)", waves: [WU("aggron:50@chopleberry", "bronzong:50@expertbelt", "magnezone:50@leftovers"), WU("skarmory:50@flyinggem", "steelix:50@ironball", "bisharp:50!@focussash")] },
  { n: "Delphine", t: "un_psychicf", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Psychic)", waves: [WU("starmie:50@brightpowder", "beheeyem:50@payapaberry", "sigilyph:50@choicescarf"), WU("exeggutor:50@leftovers", "jynx:50@focussash", "medicham:50!@lumberry")] },
  { n: "Drakon", t: "un_acetrainer", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Dragon)", waves: [WU("salamence:50@lifeorb", "druddigon:50@expertbelt", "altaria:50@leftovers"), WU("dragonite:50@widelens", "kingdra:50@whiteherb", "garchomp:50!@habanberry")] },
  { n: "Vito", t: "un_veteran", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Dark)", waves: [WU("shiftry:50@grassgem", "honchkrow:50@lifeorb", "absol:50@scopelens"), WU("skuntank:50@blacksludge", "crawdaunt:50@choiceband", "sableye:50!@focussash")] },
  { n: "Impera", t: "un_veteranf", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Dark)", waves: [WU("umbreon:50@rockyhelmet", "scrafty:50@bigroot", "sharpedo:50@kingsrock"), WU("spiritomb:50@leftovers", "cacturne:50@focussash", "krookodile:50!@lifeorb")] },
  { n: "Bonnie", t: "un_acetrainerf", from: "Black 2/White 2, World Tournament, Type Expert Tournament (Dark)", waves: [WU("drapion:50@blacksludge", "liepard:50@normalgem", "mandibuzz:50@leftovers"), WU("bisharp:50@focussash", "weavile:50@lifeorb", "houndoom:50!")] },
];
// </tower-wing>
// Each stage's place music (a stage's `music` plays while its scene does: a8c_sfx.js's "un:"/"u2:" keys), by its place: Part 1 Black/
// White's, Part 2 Black 2/White 2's where the sequel has its own (as the proposal in the session notes maps them; Wellspring Cave, the
// Desert Resort and the other caves play Chargestone Cave's theme, Twist Mountain the Cold Storage's, the Celestial Tower and the
// Giant Chasm Dragonspiral Tower's, Pinwheel Forest the Dreamyard's)
const UNOVA_PLACE_BGM = [
  [/Your Room|Nuvema|Seven Sages/, "unNuvema", "unNuvema"], [/Juniper's Lab|Professor's Gift/, "unLab", "unLab"], [/^Route 1$/, "unRoute1"], [/Accumula/, "unAccumula"],
  [/Aspertia/, "unNuvema", "u2Aspertia"], [/Route 19|Route 20|Floccesy Town/, "unRoute2", "u2Route19"], [/Floccesy Ranch/, "u2Ranch", "u2Ranch"],
  [/^Route 2|^Route 3/, "unRoute2"], [/Striaton/, "unStriaton"], [/Dreamyard|Pinwheel/, "unDreamyard"], [/Wellspring|Desert Resort|Chargestone|Mistralton Cave|Seaside Cave/, "unChargestone"],
  [/Nacrene/, "unNacrene"], [/Skyarrow/, "unSkyarrow"], [/Castelia Sewers/, "u2Sewers", "u2Sewers"], [/Castelia Gym/, "unGymHall", "u2CasteliaGym"], [/Castelia/, "unCastelia"],
  [/Virbank Gym/, "u2VirbankGym", "u2VirbankGym"], [/Virbank/, "u2Virbank", "u2Virbank"], [/Relic Castle|Relic Passage/, "unRelic"],
  [/Route 4|Route 5|Route 16/, "unRoute4"], [/Nimbasa Gym/, "unGymHall", "u2NimbasaGym"], [/Subway Boss/, "unGearStation"], [/Nimbasa/, "unNimbasa"], [/Cold Storage|Twist Mountain|Clay Tunnel/, "unColdStorage"],
  [/Drawbridge/, "unDrawbridge"], [/World Tournament/, "u2PWTArena", "u2PWTArena"], [/Plasma Frigate|the Command Center/, "u2Frigate", "u2Frigate"], [/Driftveil Gym/, "unGymHall", "u2DriftveilGym"],
  [/Driftveil/, "unDriftveil"], [/Route 6|Route 7|Route 8|Route 9|Route 17|Route 18|Route 11|Route 12/, "unRoute6"], [/Celestial Tower|Giant Chasm/, "unDragonspiral"],
  [/Mistralton Gym/, "unGymHall", "u2MistraltonGym"], [/Mistralton/, "unMistralton"], [/Icirrus/, "unIcirrus"], [/Dragon Awakens/, "unDragonspiralTop"], [/Dragonspiral/, "unDragonspiral"],
  [/Tubeline/, "unTubeline"], [/Opelucid Gym/, "unGymHall", "u2OpelucidGym"], [/Opelucid/, "unOpelucid", "u2Frozen"], [/Lentimas/, "u2Lentimas", "u2Lentimas"],
  [/Reversal Mountain/, "u2Reversal", "u2Reversal"], [/Strange House/, "u2Strange", "u2Strange"], [/Undella/, "unUndella"], [/Route 13|Route 14|Abundant Shrine/, "unRoute12"],
  [/Lacunosa/, "unLacunosa"], [/Humilau Gym/, "u2HumilauGym", "u2HumilauGym"], [/Humilau/, "u2Humilau", "u2Humilau"], [/Route 22|Route 21/, "u2Route22", "u2Route22"],
  [/Route 23/, "u2Route23", "u2Route23"], [/Route 10/, "unRoute10"], [/Victory Road/, "unVictory"], [/Elite Four|Champion's Room|Pokémon League/, "unLeague"],
  [/N's Castle/, "unNCastle", "u2NCastle"], [/Ghetsis's Quarters|Inner Cave/, "u2FrigateRaid", "u2FrigateRaid"], [/Cave of Being/, "u2Being", "u2Being"],
  [/Underground Ruins/, "u2Ruins", "u2Ruins"], [/Marvelous Bridge/, "unMarvelous"], [/Nature Preserve/, "unRoute6"], [/Liberty Garden/, "unSkyarrow"],
];
for (const ch of UNOVA_JOURNEY.chapters) for (const nd of ch.nodes) if (!nd.music) {
  const hit = UNOVA_PLACE_BGM.find(r => r[0].test(nd.name));
  if (hit) nd.music = (ch.part || 1) > 1 ? hit[2] || hit[1] : hit[1];
}
