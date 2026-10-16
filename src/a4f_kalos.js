
// =====================================================================
//  KALOS JOURNEY — X and Y's story: a partner from Professor Sycamore by way of Tierno in Aquacorde Town, four friends on the road
//  (Shauna, Tierno, Trevor and your neighbor, Serena or Calem), eight Gyms, Team Flare and Lysandre's ultimate weapon under Geosenge
//  Town, Xerneas waking in their Secret HQ and Lysandre's last stand, the Elite Four, Champion Diantha and AZ; then X and Y's own
//  post-game: Looker's Bureau in Lumiose City, the Legendary Pokémon of the Sea Spirit's Den and the Unknown Dungeon, and Zygarde at
//  the bottom of Terminus Cave, the Journey's end. X and Y have the same team for every story battle (the owner's rule takes each
//  battle's strongest version's: here there is only one), so the version differences are the wild Pokémon and the Legendary: X's
//  catches are the main stages, Y's the side stages beside them (the other regions' rule for the other versions' catches), and
//  both Legendaries are here (the owner's pick, 2026-10-15): X's Xerneas in the story, Y's Yveltal in a side stage after it, Lv 50.
//  No Mega Evolution (the game has none): a Trainer whose Pokémon holds a Mega Stone keeps the Pokémon, without the stone.
//  Only Kalos's Pokémon (Gen 6's) battle on your side here (journeyOk); its wild stages catch them. Gifts from other generations
//  (Sycamore's Kanto partner, the Snorlax, Korrina's Lucario, the Lapras) wait for their region (grantOp).
//  Stage ids start with "ka" (REGION_CODE in a4_story.js): ka1-1, kaS1-1; chapters kac1... `music` on a stage: the place's track
//  while its scene plays (X and Y's, a8c_sfx.js). Dialogue is original.
// =====================================================================
// your neighbor: Serena while you look like a boy, Calem while you look like a girl (X and Y: the one you aren't; LEAF_LIKE, a9a_screens.js)
const kalosRivalSerena = () => { try { return !LEAF_LIKE.includes(avatar()); } catch (e) { return true; } };
const kalosRivalName = () => kalosRivalSerena() ? "Serena" : "Calem";
const kalosRivalSpr = () => kalosRivalSerena() ? "ka_serena" : "ka_calem";
Object.assign(SPK, {
  sycamore: { n: "Prof. Sycamore", t: "ka_sycamore" }, kmom: { n: "Mom", t: "ka_mom" }, krival: { get n() { return kalosRivalName(); }, get t() { return kalosRivalSpr(); } },
  shauna: { n: "Shauna", t: "ka_shauna" }, tierno: { n: "Tierno", t: "ka_tierno" }, trevor: { n: "Trevor", t: "ka_trevor" },
  lysandre: { n: "Lysandre", t: "ka_lysandre" }, xerosic: { n: "Xerosic", t: "ka_xerosic" }, kgrunt: { n: "Team Flare Grunt", t: "ka_grunt" }, kgruntf: { n: "Team Flare Grunt", t: "ka_gruntf" },
  celosia: { n: "Celosia" }, bryony: { n: "Bryony", t: "ka_bryony" }, aliana: { n: "Aliana" }, mable: { n: "Mable" },
  viola: { n: "Viola", t: "ka_viola" }, kgrant: { n: "Grant", t: "ka_grant" }, korrina: { n: "Korrina", t: "ka_korrina" }, ramos: { n: "Ramos", t: "ka_ramos" },
  clemont: { n: "Clemont", t: "ka_clemont" }, valerie: { n: "Valerie", t: "ka_valerie" }, olympia: { n: "Olympia", t: "ka_olympia" }, wulfric: { n: "Wulfric", t: "ka_wulfric" },
  malva: { n: "Malva", t: "ka_malva" }, siebold: { n: "Siebold", t: "ka_siebold" }, wikstrom: { n: "Wikstrom", t: "ka_wikstrom" }, drasna: { n: "Drasna", t: "ka_drasna" },
  diantha: { n: "Diantha", t: "ka_diantha" }, az: { n: "AZ", t: "ka_az" }, sina: { n: "Sina", t: "ka_sina" }, dexio: { n: "Dexio", t: "ka_dexio" },
  emma: { n: "Emma", t: "ka_emma" }, essentia: { n: "Essentia", t: "ka_essentia" }, klooker: { n: "Looker" }, gurkinn: { n: "Gurkinn" }, alexa: { n: "Alexa" },
  kcaretaker: { n: "Caretaker" }, kpresident: { n: "Factory President" },
});
const WK = WG(6);
// your starter's lines: Shauna takes the starter weak to yours, your neighbor the one strong against it (X and Y). Each of your
// friends keeps one line of teams: the neighbor Meowstic, Absol and the starter, then an Eevee evolution and Altaria; Tierno's
// Corphish line, Trevor's Pikachu and Flabébé lines, Shauna's starter
const KALOS_LINE = { chespin: ["chespin", "quilladin", "chesnaught"], fennekin: ["fennekin", "braixen", "delphox"], froakie: ["froakie", "frogadier", "greninja"] };
const KALOS_STRONG = { chespin: "fennekin", fennekin: "froakie", froakie: "chespin" }, KALOS_WEAK = { chespin: "froakie", fennekin: "chespin", froakie: "fennekin" };
const kalosStarter = () => { const k = regionStarter("kalos"); return KALOS_LINE[k] ? k : "chespin"; };
const kalosRivalMon = st => KALOS_LINE[KALOS_STRONG[kalosStarter()]][st], shaunaMon = st => KALOS_LINE[KALOS_WEAK[kalosStarter()]][st];
// (the neighbor's Eevee evolution: Jolteon with Fennekin's line, Flareon with Froakie's, Vaporeon with Chespin's, as in X and Y)
const kalosRivalEevee = () => ({ fennekin: "jolteon", froakie: "flareon", chespin: "vaporeon" })[KALOS_STRONG[kalosStarter()]];
// (Professor Sycamore's Kanto partner: the one that covers your Kalos partner's weakness)
const kalosKantoGift = (st = kalosStarter()) => ({ chespin: "squirtle", fennekin: "bulbasaur", froakie: "charmander" })[st];   // (st: any starter, journeyGifts)
// (the Legendary bird that waits in the Sea Spirit's Den: X and Y's by your starter)
const kalosBird = (st = kalosStarter()) => ({ chespin: "articuno", fennekin: "zapdos", froakie: "moltres" })[st];
const kalosRivalTR = (intro, lose) => TR(kalosRivalName(), kalosRivalSpr(), intro, lose);
const shaunaTR = (intro, lose) => TR("Shauna", "ka_shauna", intro, lose);

const KALOS_JOURNEY = {
  id: "kalos", title: "Kalos Journey", sub: "The Kalos League Challenge",
  blurb: "Set out from Vaniville Town with four new friends and a partner from Professor Sycamore, earn Kalos's eight Gym Badges, stop Lysandre and Team Flare's ultimate weapon, and face Champion Diantha.",
  chapters: [
    { id: "c1", title: "Vaniville Town to Santalune City", env: "route", map: "route", reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Vaniville Town", music: "kaVaniville", pre: [
          L("narr", "Vaniville Town, a quiet village in the hills of southern Kalos. You've only just moved in, and the boxes are barely unpacked."),
          L("narr", "Your family's Fletchling flutters up the stairs, finds you still asleep, and dive-bombs the bed. You're awake."),
          L("kmom", "Morning, sleepyhead! Our neighbors came by. Go and say hello. And say hello to Rhyhorn on your way out, would you?"),
          LR("krival", () => `Oh, you're up! I'm ${kalosRivalName()}, from next door. This is Shauna. Professor Sycamore asked us to meet you. Come on, everyone's waiting in Aquacorde Town!`),
          L("shauna", "Everyone's getting a Pokémon today! Including you! Let's go, let's go!"),
        ] },
        { id: "b", type: "story", name: "Aquacorde Town: Professor Sycamore's Pokémon", starter: 1, music: "kaFriendsMeet", pre: [
          L("narr", "In Aquacorde Town, two more friends are waiting at a table by the river: Tierno, who loves to dance, and Trevor, who wants to be a researcher."),
          L("tierno", "The Professor gave me a box of Pokémon to hand out. Three of them! And you get to choose first."),
          L("trevor", "Professor Sycamore wants each of us to have one. And a Pokédex. Here's yours: it fills in every Pokémon you meet."),
        ], post: [
          L("shauna", "Then I'll take this one! It's so cute! Ooh, ooh, and now we should battle. Right now!"),
          LR("krival", () => `And this one's mine. Pay attention: it's strong against yours.`),
        ] },
        // (Shauna's starter is the one weak to yours, so her battle stays at X and Y's Lv 5, as Unova's Bianca's does; the neighbor's,
        // strong against yours, comes much later: README, House rules, the first rival battle)
        { id: "c", type: "battle", name: "Aquacorde Town: Shauna", music: "kaBattleCue", lv: 5, env: "route", get trainer() { return shaunaTR("My very first battle! What do I do? Oh, I know: do your best!", "Aww, I lost! But that was so much fun. Let's do it again sometime!"); },
          rivalWaves: () => [[{ op: shaunaMon(0), LV: 5, moves: { chespin: ["tackle", "growl", "vinewhip"], fennekin: ["scratch", "tailwhip", "ember"], froakie: ["pound", "growl", "bubble"] }[shaunaMon(0)] }]], pre: [
          L("shauna", "Wait! Before you go home, battle me! I want to see what my partner can do!"),
        ], post: [
          L("shauna", "There! I healed both our Pokémon. Tierno gave you the Professor's letter for your mom, right? Go show her!"),
        ] },
        { id: "d", type: "story", name: "Vaniville Town: The Professor's Letter", reward: { key: "ka_townmap" }, music: "kaHurry1", pre: [
          L("kmom", "A letter from Professor Sycamore? What lovely handwriting. ...He wants you to go on a journey with your Pokémon. Well, of course you'll go!"),
          L("kmom", "Here: a Town Map, and a fresh set of clothes. A Trainer has to look sharp in Kalos!"),
          L("narr", "On your way out, Mom's Rhyhorn ambles over and nudges you. It has known you since you were a baby, and it's going to miss you."),
        ] },
        { id: "e", type: "battle", name: "Route 2", reward: { key: "ka_pokeballs" }, lv: 3, env: "route", wild: 1, catch: "fletchling", music: "kaHurry2", waves: [WK("bunnelby:3", "scatterbug:2"), WK("fletchling:3")], pre: [
          LR("krival", () => `Watch. First you weaken it... then you throw the Poké Ball. See? Easy. Here, ten Poké Balls each. Now you try!`),
          L("narr", "Fletchling hop through the grass on Route 2, singing. They're braver than they look."),
        ], post: [L("narr", "Gotcha! Fletchling was caught! It sings beautifully, and fights fiercely for its territory.")] },
        { id: "f", type: "side", name: "Route 2: Bunnelby", lv: 3, env: "route", wild: 1, catch: "bunnelby", music: "kaRoute2", waves: [WK("pidgey:3", "zigzagoon:3"), WK("bunnelby:3")], pre: [
          L("narr", "Something is digging under the hedges along Route 2. Two long ears poke out of the dirt: a Bunnelby."),
        ], post: [L("narr", "Gotcha! Bunnelby was caught! Its ears can dig through solid rock.")] },
        { id: "g", type: "battle", name: "Santalune Forest", lv: 4, env: "forest", wild: 1, catch: "scatterbug", music: "kaForest", waves: [WK("caterpie:3", "weedle:3"), WK("scatterbug:3", "pikachu:4")], pre: [
          L("shauna", "Can I come with you through the forest? I'll heal your Pokémon whenever you want. Deal?"),
          L("narr", "Santalune Forest is bright and green, with paths winding between the trees. Scatterbug crawl along the branches."),
        ], post: [L("narr", "Gotcha! Scatterbug was caught! The pattern on its wings, once it evolves, depends on where in the world it grew up.")] },
        { id: "h", type: "side", name: "Route 22: Litleo", lv: 6, env: "route", wild: 1, catch: "litleo", music: "kaRoute4", waves: [WK("psyduck:6", "bunnelby:6"), WK("litleo:6")], pre: [
          L("narr", "Route 22 runs along the river west of Santalune City. A young Litleo is prowling the long grass, trying to look fierce."),
        ], post: [L("narr", "Gotcha! Litleo was caught! It leaves its pride to live on its own, and gets stronger for it.")] },
        { id: "i", type: "battle", name: "Santalune City: Roller Skater Rinka", reward: { key: "ka_rollerskates" }, lv: 7, env: "city", music: "kaEyesRoller", trainer: TR("Roller Skater Rinka", "ka_rollerf", "You don't have Roller Skates? In Kalos? Beat me and I'll give you a pair!", "Whoa, you're fast even without skates! Here, take these."),
          waves: [WK("zigzagoon:7")], pre: [
          L("narr", "Santalune City has a fountain, a Trainers' School and a Gym. A Roller Skater spins to a stop in front of you, blocking the way."),
        ] },
        { id: "j", type: "battle", name: "Santalune Gym: Lass Charlotte", lv: 9, env: "gym", music: "kaEyesLass", trainer: TR("Lass Charlotte", "ka_lass", "Don't get stuck in the web! Viola's photos look much better with a challenger caught in them!", "I'm the one who got caught..."),
          waves: [WK("kakuna:7", "combee:9")] },
        { id: "k", type: "boss", name: "Santalune Gym: Leader Viola", get reward() { return { tm: tmId("infestation", 6), key: "ka_expshare" }; }, lv: 12, env: "forest", badgeWin: 0,
          trainer: TR("Leader Viola", "ka_viola", "I'm Viola, the Santalune Gym Leader, and a photographer! I'll catch the look on your face when you lose, right in my lens!", "You and your Pokémon make a great picture! Here: the Bug Badge."),
          waves: [WK("surskit:10+", "vivillon:12!")], pre: [
          L("viola", "Bug Pokémon are so photogenic! Every shot is a masterpiece. Ready? Say cheese!"),
          L("narr", "Fire, Flying and Rock moves hit Bug types hard. Surskit is part Water, so Electric works on it too."),
        ], post: [
          L("viola", "And take TM83, Infestation. It traps your opponent and keeps on biting."),
          L("alexa", "You beat my little sister? Impressive! I'm Alexa, a journalist. Here, take this Exp. Share. And come and visit me in Lumiose City!"),
        ] },
      ] },
    { id: "c2", title: "Lumiose City and Camphrier Town", env: "city", map: "city", reward: { lmd: 4000, orundum: 300, shinystone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 4", lv: 7, env: "route", wild: 1, catch: "flabebe", music: "kaSinaDexio", waves: [WK("budew:8", "ledyba:8"), WK("flabebe:7")], pre: [
          L("narr", "Route 4 is a garden: hedges, fountains and beds of flowers all the way to Lumiose City. Each flower seems to have a tiny Pokémon riding on it."),
          L("sina", "Have you seen a Flabébé? It's one of the Fairy-type Pokémon. We work for Professor Sycamore. I'm Sina, and this is Dexio."),
          L("dexio", "Fairy is a new type to many Trainers. We're studying how it battles against the others. The Professor's lab is just ahead."),
        ], post: [L("narr", "Gotcha! Flabébé was caught! It can't live without its flower, and it gives the flower its power in return.")] },
        { id: "b", type: "story", name: "Lumiose City: Professor Sycamore's Lab", music: "kaSycamore", pre: [
          L("narr", "Lumiose City is huge: avenues, cafés and boutiques in a ring around Prism Tower. A blackout keeps everyone in its southern half for now."),
          L("sycamore", "Welcome to my lab! I'm Professor Sycamore. I study Mega Evolution, a strange power that some Pokémon have. And you've all come so far already!"),
          L("sycamore", "Here's what I'd like: fill your Pokédex, travel Kalos, and learn everything your partners can teach you. But first... how about a battle? With me!"),
        ] },
        { id: "c", type: "battle", name: "Sycamore Pokémon Lab: Professor Sycamore", lv: 10, env: "lab", music: "kaLab", trainer: TR("Pokémon Professor Sycamore", "ka_sycamore", "Show me how you and your Pokémon work together. Allons-y!", "Magnifique! I learn more from a battle than from a book."),
          waves: [WK("bulbasaur:10", "charmander:10", "squirtle:10")] },
        { id: "d", type: "chest", name: "Sycamore's Gift: a Partner from Kanto", get reward() { return { op: kalosKantoGift(), lmd: 1500 }; }, music: "kaLab", pre: [
          L("sycamore", "These three came all the way from Kanto. Take one with you: the one that covers your partner's weak spots, I think."),
          L("narr", "Downstairs, a tall man with a mane of red hair is talking with Sina. He introduces himself as Lysandre."),
          L("lysandre", "I want to make the world a more beautiful place. That's why I study Pokémon too. ...A pleasure to meet you, young Trainer."),
          LR("krival", () => `That's Lysandre, the head of Lysandre Labs. They made the Holo Caster. Let's grab a drink at Café Soleil, then it's on to Route 5.`),
        ] },
        { id: "e", type: "battle", name: "Route 5", lv: 10, env: "route", wild: 1, catch: "pancham", music: "kaRoute4", waves: [WK("bunnelby:9", "furfrou:9"), WK("pancham:10", "skiddo:10")], pre: [
          L("narr", "Route 5 has a skate park, a Berry tree and grassy slopes. A Lucario runs straight up to you, and its Trainer rolls in on skates behind it."),
          L("korrina", "Sorry! My Lucario likes your aura, I think. I'm Korrina, the Gym Leader in Shalour City. See you there!"),
        ], post: [L("narr", "Gotcha! Pancham was caught! It tries hard to glare, but it can't help looking cute.")] },
        { id: "f", type: "side", name: "Route 5: Skiddo", lv: 10, env: "route", wild: 1, catch: "skiddo", music: "kaRoute4", waves: [WK("abra:10", "doduo:10"), WK("skiddo:10")], pre: [
          L("narr", "Skiddo graze on the slopes of Route 5. Kalos people have ridden their kind for generations."),
        ], post: [L("narr", "Gotcha! Skiddo was caught! It makes energy from sunlight with the leaves on its back.")] },
        { id: "g", type: "side", name: "Route 5: Furfrou", lv: 9, env: "route", wild: 1, catch: "furfrou", music: "kaRoute4", waves: [WK("bunnelby:8", "pancham:9"), WK("furfrou:9")], pre: [
          L("narr", "A wild Furfrou trots past, its coat wild and shaggy. In Lumiose they'd trim it into a Star or a Heart."),
        ], post: [L("narr", "Gotcha! Furfrou was caught! Long ago, its kind guarded the kings of Kalos.")] },
        { id: "h", type: "battle", name: "Route 5: Tierno", lv: 12, env: "route", music: "kaFriendsReunited", trainer: TR("Tierno", "ka_tierno", "Ready to dance? My Pokémon and I've been practicing our moves!", "Aw man, you outdanced me! Gotta work on my rhythm."),
          waves: [WK("corphish:12!")], pre: [
          L("tierno", "Hey! Trevor and I have been catching Pokémon. Let's battle! I'm gonna make a dance team out of my Pokémon one day."),
        ], post: [
          L("trevor", "Did you know? Sometimes five wild Pokémon jump out at once: a horde! Be careful in the tall grass."),
        ] },
        { id: "i", type: "story", name: "Camphrier Town: Shabboneau Castle", music: "kaCamphrier", pre: [
          L("narr", "Camphrier Town is very old, and a little sleepy. At its north end stands Shabboneau Castle, home to a lonely caretaker."),
          L("kcaretaker", "The bridge on Route 7? Ah. A Snorlax is asleep on it, and nothing will wake it. Nothing but the Poké Flute, and that's at Parfum Palace."),
          L("shauna", "A palace! Ooh, let's go! It's past Route 6, right? Come on!"),
        ] },
        { id: "j", type: "battle", name: "Route 6: Palais Lane", lv: 12, env: "route", wild: 1, catch: "espurr", music: "kaRoute4", waves: [WK("oddish:11", "sentret:11"), WK("espurr:12", "honedge:11")], pre: [
          L("narr", "Route 6, Palais Lane, is an avenue of tall trees leading to the palace. In the long grass, something with huge eyes is watching you."),
        ], post: [L("narr", "Gotcha! Espurr was caught! The organ in its ears lets out enough psychic power to send a wrestler flying, so it keeps them folded.")] },
        { id: "k", type: "side", name: "Route 6: Honedge", lv: 12, env: "route", wild: 1, catch: "honedge", music: "kaRoute4", waves: [WK("espurr:11", "kecleon:11"), WK("honedge:12")], pre: [
          L("narr", "A sword lies in the grass by the lane. It moves on its own. Whatever you do, don't take hold of its hilt."),
        ], post: [L("narr", "Gotcha! Honedge was caught! It is a sword with a spirit in it, said to have once been a hero's.")] },
        { id: "l", type: "story", name: "Parfum Palace", reward: { tm: [tmId("cut", 6), tmId("protect", 6)] }, music: "kaPalace", pre: [
          L("narr", "Parfum Palace is all gold, mirrors and gardens. Its owner is in a state: his prized Furfrou has run off into the garden maze."),
          L("narr", "Searching the maze, you find HM01, Cut, tucked in a hedge in its southwest corner."),
          L("narr", "You find the Furfrou hiding in a hedge and bring it back. To thank you, the owner puts on a fireworks show from the balcony."),
          L("shauna", "Ooh, so pretty! ...Oh, and can we borrow your Poké Flute? A Snorlax is blocking Route 7!"),
          L("narr", "The owner's butler hands over the Poké Flute, and TM17, Protect, for good measure."),
        ] },
        { id: "m", type: "battle", name: "Route 7: Snorlax", lv: 15, env: "route", wild: 1, catch: "snorlax", music: "kaRoute4", waves: [WK("snorlax:15!")], pre: [
          L("kcaretaker", "You got the Poké Flute? Give it here, I'll play it. But be ready: Snorlax will wake up hungry, and grumpy."),
          L("narr", "The Poké Flute's tune rings out across the bridge. Snorlax yawns, stretches... and glares at you."),
        ], post: [
          L("narr", "Gotcha! Snorlax was caught! It isn't happy unless it eats nine hundred pounds of food a day."),
          L("narr", "The palace owner turns up to make peace with the caretaker, and lets him keep the Poké Flute, to practice."),
        ] },
      ] },
    { id: "c3", title: "Route 7 to Cyllage City", env: "cave", map: "cave", reward: { lmd: 5000, orundum: 300, sachet: 1, whippeddream: 1 },
      nodes: [
        // (one Multi Battle in X and Y: big, so both teams come as one, without setting the level cap)
        { id: "a", type: "battle", name: "Route 7: Tierno & Trevor", lv: 16, big: 1, env: "route", music: "kaBattleCue", trainer: TR("Tierno & Trevor", "ka_trevor", "Two of us, two of you! Let's see some teamwork!", "We lost, but that was a great battle. You two make a good team!"),
          waves: [WK("pikachu:14", "flabebe:14"), WK("corphish:16!")], pre: [
          L("narr", "West of the Battle Chateau, Tierno and Trevor want a Multi Battle."),
          LR("krival", () => `A Multi Battle? Then I'm with you. Two against two. Let's show them how it's done!`),
        ] },
        // (X's Swirlix is the main catch here, Y's Spritzee the side stage beside it: the same goes for Clauncher and Skrelp)
        { id: "b", type: "battle", name: "Route 7: Rivière Walk", lv: 14, env: "route", wild: 1, catch: "swirlix", music: "kaRoute4", waves: [WK("smeargle:14", "flabebe:13"), WK("swirlix:14")], pre: [
          L("narr", "Route 7 follows the river past the Day Care and the Battle Chateau. Something in the flowers smells of cotton candy."),
        ], post: [L("narr", "Gotcha! Swirlix was caught! It eats nothing but sweets, so its fur is sticky and sweet too.")] },
        { id: "c", type: "side", name: "Route 7: Spritzee", lv: 14, env: "route", wild: 1, catch: "spritzee", music: "kaRoute4", waves: [WK("roselia:14", "ducklett:14"), WK("spritzee:14")], pre: [
          L("narr", "In Pokémon Y, a sweet perfume drifts over these flowerbeds instead. Its source is a small, round Pokémon: Spritzee."),
        ], post: [L("narr", "Gotcha! Spritzee was caught! Noblewomen of old kept them in place of perfume.")] },
        { id: "d", type: "battle", name: "Connecting Cave: Pokémon Breeder Mercy", lv: 12, env: "cave", music: "kaGlittering", trainer: TR("Pokémon Breeder Mercy", "ka_breederf", "I raise all kinds of Pokémon. Let me show you how happy they are!", "They're happy even when they lose. That's what matters!"),
          waves: [WK("ducklett:12", "pikachu:12"), WK("litleo:12", "oddish:12")], pre: [
          L("narr", "Connecting Cave links Route 7 to Route 8. The Zubat living here have given it a nickname: Zubat Roost."),
        ] },
        { id: "e", type: "battle", name: "Route 8: Muraille Coast", lv: 15, env: "sea", wild: 1, catch: "inkay", music: "kaRoute8", waves: [WK("spoink:14", "drifloon:14"), WK("inkay:15")], pre: [
          L("narr", "Route 8 runs along the cliffs above the sea. Sina and Dexio find you there and add the Coastal Kalos list to your Pokédex."),
          L("narr", "Something in the grass is flashing its lights at you, and your head goes fuzzy: an Inkay."),
        ], post: [L("narr", "Gotcha! Inkay was caught! The lights on its body make its enemies lose the will to fight.")] },
        { id: "f", type: "story", name: "Ambrette Town: the Fossil Lab", get reward() { return { tm: tmId("rocksmash", 6) }; }, music: "kaAquacorde", pre: [
          LR("krival", () => `There you are! The Fossil Lab's down there. Maybe they know something about Mega Stones. Let's ask.`),
          L("narr", "A girl outside the Pokémon Center gives you TM94, Rock Smash. The scientists at the Fossil Lab don't know about Mega Stones, but their assistant is digging in Glittering Cave."),
        ] },
        { id: "g", type: "side", name: "Ambrette Town: Binacle", lv: 18, env: "sea", wild: 1, catch: "binacle", music: "kaAquacorde", waves: [WK("dwebble:18"), WK("binacle:18")], pre: [
          L("narr", "With Rock Smash, you crack open the rocks along Ambrette's beach. One of them holds two pairs of eyes."),
        ], post: [L("narr", "Gotcha! Binacle was caught! Two of them share one rock, and they don't always agree on where to go.")] },
        { id: "h", type: "battle", name: "Route 9: Spikes Passage", lv: 16, env: "safari", wild: 1, catch: "helioptile", music: "kaRoute8", waves: [WK("sandile:15", "hippopotas:15"), WK("helioptile:16")], pre: [
          L("narr", "Route 9 is too rough to cross on foot. A Rhyhorn that lives there carries you across, smashing the rocks out of its way."),
        ], post: [L("narr", "Gotcha! Helioptile was caught! The frills on its head turn sunlight into electricity.")] },
        { id: "i", type: "battle", name: "Glittering Cave: Team Flare", lv: 20, env: "cave", music: "kaFlare", trainer: TR("Team Flare Grunts", "ka_grunt", "We're Team Flare! These Fossils are ours. Stylish people get what they want!", "Ugh! Our perfect plan, ruined... how unstylish."),
          waves: [WK("houndour:18", "zubat:18"), WK("scraggy:20", "croagunk:20")], pre: [
          L("narr", "Deep in Glittering Cave, where the moss glows green, people in red suits are poking at the walls."),
          L("kgrunt", "Team Flare wants only one thing: a better world, for us! And for that we need money. Fossils sell for a lot of money."),
          LR("krival", () => `Two of them up ahead? Then I'll battle with you. Let's clear them out.`),
        ] },
        // (in the cave the Fossil Lab's assistant offers a choice of two Fossils: here the Jaw Fossil, and the Sail Fossil is the side stage beside it)
        { id: "j", type: "chest", name: "Glittering Cave: the Jaw Fossil", reward: { op: "tyrunt", lmd: 2000 }, music: "kaGlittering", pre: [
          L("narr", "At the very end of the cave, the Fossil Lab's assistant has just dug up two Fossils. He'd like you to have one: the Jaw Fossil."),
          L("narr", "Back in Ambrette, the Fossil Lab brings it back to life: Tyrunt, a Pokémon from a hundred million years ago!"),
        ] },
        { id: "k", type: "side", chest: 1, name: "Glittering Cave: the Sail Fossil", reward: { op: "amaura", lmd: 2000 }, music: "kaAquacorde", pre: [
          L("narr", "The other Fossil from the dig is the Sail Fossil. In Ambrette's Fossil Lab it comes back to life as Amaura, a Pokémon from the Ice Age."),
        ] },
        { id: "l", type: "battle", name: "Cyllage Gym: Hiker Bernard", get reward() { return { tm: tmId("strength", 6) }; }, lv: 21, env: "gym", music: "kaEyesHiker", trainer: TR("Hiker Bernard", "ka_hiker", "Climbing this Gym's wall is nothing to a Hiker! Neither is beating you!", "I slipped..."),
          waves: [WK("rhyhorn:21", "nosepass:21", "onix:21")], pre: [
          L("narr", "Cyllage City climbs a cliffside by the sea. Its Gym Leader, Grant, gives you HM04 Strength before you head up: a Gym full of climbing walls."),
        ] },
        { id: "m", type: "boss", name: "Cyllage Gym: Leader Grant", get reward() { return { tm: tmId("rocktomb", 6) }; }, lv: 25, env: "cave", badgeWin: 1,
          trainer: TR("Leader Grant", "ka_grant", "I'm Grant, the Cyllage Gym Leader. Climbing and battling are the same: you find a way past the wall in front of you.", "You climbed right over me. Here: the Cliff Badge."),
          waves: [WK("amaura:25+", "tyrunt:25!")], pre: [
          L("kgrant", "My partners are from the age of fossils. Their power was buried for a very long time. Let's see you get over it!"),
          L("narr", "Rock types take big hits from Water, Grass, Fighting, Ground and Steel moves. Amaura is part Ice and Tyrunt part Dragon: Fighting and Steel hit Amaura four times as hard."),
        ], post: [L("kgrant", "And TM39, Rock Tomb. It drops rocks on your foe and slows it down. Keep climbing!")] },
      ] },
    { id: "c4", title: "Geosenge Town and Shalour City", env: "cave", map: "cave", reward: { lmd: 6000, orundum: 400, sunstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 10: Menhir Trail", lv: 20, env: "route", wild: 1, catch: "hawlucha", music: "kaRoute8", waves: [WK("eevee:19", "golett:19"), WK("hawlucha:20")], pre: [
          L("narr", "Route 10 is lined with standing stones, hundreds of them, in rows that no one can explain. A Pokémon in a wrestling mask leaps off one of them."),
        ], post: [L("narr", "Gotcha! Hawlucha was caught! It shows off its moves with a flourish before every attack.")] },
        { id: "b", type: "battle", name: "Route 10: Team Flare", lv: 23, env: "route", music: "kaFlare", trainer: TR("Team Flare Grunts", "ka_gruntf", "You again? We'd been looking forward to a rematch, you know!", "Two losses in a row... that's so not stylish."),
          waves: [WK("houndour:21", "golbat:23"), WK("electrike:23", "croagunk:21")], pre: [
          L("narr", "A few Team Flare Grunts are studying the standing stones. They haven't forgotten Glittering Cave."),
        ] },
        { id: "c", type: "story", name: "Geosenge Town", music: "kaGeosenge", pre: [
          L("narr", "Geosenge Town is built among more of the strange stones. Legend says they once channeled an overwhelming power."),
          L("narr", "A Team Flare Grunt is staring at a pile of rocks in the corner of town. He looks around, steps up to it... and disappears."),
        ] },
        { id: "d", type: "battle", name: "Geosenge Town: Korrina", lv: 25, env: "route", music: "kaGeosenge", trainer: TR("Leader Korrina", "ka_korrina", "Hi again! My Lucario want to see your aura up close. A battle's the best way!", "Wow! Your bond with your Pokémon is really something. See you in Shalour!"),
          waves: [WK("lucario:25", "lucario:25!")] },
        { id: "e", type: "battle", name: "Route 11: Miroir Way", lv: 22, env: "route", wild: 1, catch: "dedenne", music: "kaRoute8", waves: [WK("staravia:22", "nidorino:21"), WK("dedenne:22")], pre: [
          L("narr", "Professor Sycamore calls on the Holo Caster: Shalour City is just ahead, and the Mega Evolution guru lives there. In the grass, something sparks."),
        ], post: [L("narr", "Gotcha! Dedenne was caught! Its whiskers act as antennae, and it can steal power from outlets.")] },
        { id: "f", type: "side", name: "Reflection Cave: Carbink", lv: 23, env: "cave", wild: 1, catch: "carbink", music: "kaForest", waves: [WK("mrmime:22", "wobbuffet:22"), WK("carbink:23")], pre: [
          L("narr", "The walls of Reflection Cave shine like mirrors. One of the crystals glitters a little too brightly, and floats off the ground."),
        ], post: [L("narr", "Gotcha! Carbink was caught! It was born from the high pressure and heat underground.")] },
        { id: "g", type: "battle", name: "Reflection Cave: Ace Trainer Emil", lv: 26, env: "cave", music: "kaEyesAce", trainer: TR("Ace Trainer Emil", "ka_acetrainer", "In a cave full of mirrors, I see myself winning. Over and over.", "The mirrors lied..."),
          waves: [WK("absol:26", "pinsir:25")] },
        { id: "h", type: "story", name: "Shalour City: the Tower of Mastery", music: "kaShalour", pre: [
          L("narr", "Shalour City sits on the sea, beside the Tower of Mastery. A huge Lucario statue guards its door."),
          L("gurkinn", "I am Gurkinn, the keeper of this tower. My granddaughter Korrina told me about you. Mega Evolution, they say, is born from a bond between Trainer and Pokémon."),
          L("gurkinn", "Two of you have come, and both have strong bonds. Show me, then. Battle each other, here, before the tower!"),
        ] },
        { id: "i", type: "battle", name: "Tower of Mastery: the Neighbor", lv: 30, env: "tower", music: "kaBattleCue", get trainer() { return kalosRivalTR("I've wanted to battle you for a while now. I won't hold back!", "...You're strong. Really strong. I'm going to train harder."); },
          rivalWaves: () => [WK("meowstic:28", "absol:28", kalosRivalMon(1) + ":30!")], pre: [
          LR("krival", () => `I always thought I'd be the best of us. Then you showed up. Let's settle it.`),
        ], post: [
          L("gurkinn", "Splendid! The bond you share with your Pokémon is the kind this tower was built to honor. Now, Korrina is waiting at her Gym."),
        ] },
        { id: "j", type: "battle", name: "Shalour Gym: Roller Skater Dash", lv: 30, env: "gym", music: "kaEyesRoller", trainer: TR("Roller Skater Dash", "ka_roller", "This Gym's a skate park! Keep up or fall down!", "I wiped out!"),
          waves: [WK("heracross:30")] },
        { id: "k", type: "boss", name: "Shalour Gym: Leader Korrina", get reward() { return { tm: tmId("poweruppunch", 6) }; }, lv: 32, env: "gym", badgeWin: 2,
          trainer: TR("Leader Korrina", "ka_korrina", "Time for the real thing! I'm Korrina, the Shalour Gym Leader. My Lucario are sitting this one out. Let's go!", "That's it! You won fair and square. The Rumble Badge is yours!"),
          waves: [WK("mienfoo:29+", "machoke:28+", "hawlucha:32!")], pre: [
          L("korrina", "Fighting types are all about power and guts. I hope you've got both!"),
          L("narr", "Flying, Psychic and Fairy moves hit Fighting types hard. Hawlucha is part Flying: Electric, Ice, Rock and Psychic moves work on it."),
        ], post: [L("korrina", "Take TM98, Power-Up Punch: it gets stronger each time it lands. And meet me at the top of the Tower of Mastery!")] },
        { id: "l", type: "battle", name: "Tower of Mastery: Korrina's Lucario", lv: 32, env: "tower", music: "kaTower", trainer: TR("Leader Korrina", "ka_korrina", "Up here, as equals! Me and my Lucario against you and yours!", "That's the power of a real bond. You've got it, no question."),
          waves: [WK("lucario:32!")], pre: [
          L("narr", "At the top of the tower, on a balcony high above the sea, Korrina waits with her two Lucario."),
        ] },
        { id: "m", type: "chest", name: "Tower of Mastery: a Lucario Joins You", get reward() { return { op: "lucario", lmd: 2000, tm: tmId("surf", 6) }; }, music: "kaTower", pre: [
          L("korrina", "One of my Lucario keeps looking at you. I think it wants to go with you. Take it on your journey!"),
          LR("krival", () => `Here, take HM03, Surf. You'll need it. The next Gym's in Coumarine City. I'll be waiting there.`),
        ] },
      ] },
    { id: "c5", title: "Coumarine City", env: "sea", map: "sea", reward: { lmd: 7000, orundum: 400, waterstone: 1 },
      nodes: [
        { id: "a", type: "chest", name: "Route 12: the Lapras", reward: { op: "lapras", lmd: 2000 }, music: "kaRoute8", pre: [
          L("narr", "Near the gate to Route 12, a Pokémon Breeder tells you about the Lapras that saved him from drowning. He wants it to see the world, and asks you to take it."),
        ] },
        { id: "b", type: "battle", name: "Azure Bay: Swimmer Kieran", lv: 27, env: "sea", music: "kaEyesSwimmer", trainer: TR("Swimmer Kieran", "ka_swimmer", "Azure Bay is the best water in Kalos! Shall we race? I mean battle!", "You swim circles around me!"),
          waves: [WK("remoraid:27", "skrelp:27", "wailmer:27")], pre: [
          L("narr", "With Surf, Azure Bay opens up: blue water, small sandy islands, and a strange empty cave in the middle, the Sea Spirit's Den."),
        ] },
        { id: "c", type: "battle", name: "Coumarine City: the Good Rod", reward: { key: "ka_goodrod" }, lv: 25, env: "sea", wild: 1, catch: "clauncher", music: "kaCoumarine", waves: [WK("staryu:25"), WK("clauncher:25")], pre: [
          L("narr", "A Fisherman on Coumarine's pier gives you the Good Rod. Something with one big claw bites before the lure hits the water."),
        ], post: [L("narr", "Gotcha! Clauncher was caught! It knocks down its prey with blasts of water from its claw.")] },
        { id: "d", type: "side", name: "Coumarine City: Skrelp", lv: 25, env: "sea", wild: 1, catch: "skrelp", music: "kaCoumarine", waves: [WK("shellder:25"), WK("skrelp:25")], pre: [
          L("narr", "In Pokémon Y, what bites at Coumarine's pier looks like rotting kelp: Skrelp, hiding among the seaweed."),
        ], post: [L("narr", "Gotcha! Skrelp was caught! It disguises itself as rotting kelp to hide from its enemies.")] },
        { id: "e", type: "battle", name: "Coumarine City: the Neighbor", get reward() { return { tm: tmId("fly", 6) }; }, lv: 33, env: "city", music: "kaSycamore", get trainer() { return kalosRivalTR("I've been training nonstop since Shalour. Let's battle in front of the Gym!", "Again? ...You really are something. Go on, Ramos is waiting."); },
          rivalWaves: () => [WK("meowstic:31", "absol:31", kalosRivalMon(1) + ":33!")], pre: [
          L("narr", "At Seaside Station, Professor Sycamore and the actress Diantha are waiting. The Professor gives you HM02, Fly."),
          L("diantha", "So you're the Trainer Professor Sycamore talks about. I'd love to battle you one day. Until then!"),
          LR("krival", () => `There you are. Battle me first. I want to see how far you've come.`),
        ] },
        { id: "f", type: "battle", name: "Coumarine Gym: Pokémon Ranger Twiggy", lv: 31, env: "gym", music: "kaCoumarine", trainer: TR("Pokémon Ranger Twiggy", "ka_rangerf", "This Gym is a giant tree! Ramos planted it himself, you know.", "I'm all twisted up..."),
          waves: [WK("gloom:29", "exeggutor:31")] },
        { id: "g", type: "boss", name: "Coumarine Gym: Leader Ramos", get reward() { return { tm: tmId("grassknot", 6) }; }, lv: 34, env: "forest", badgeWin: 3,
          trainer: TR("Leader Ramos", "ka_ramos", "Hohoho! I'm Ramos, the Coumarine Gym Leader. Plants grow slow and steady, and so do my Pokémon!", "Hohoho! You've grown into a fine Trainer. The Plant Badge is yours."),
          waves: [WK("jumpluff:30+", "weepinbell:31+", "gogoat:34!")], pre: [
          L("ramos", "A gardener knows patience. Let's see if you know it too!"),
          L("narr", "Fire, Ice, Flying, Poison and Bug moves hit Grass types hard. Jumpluff and Weepinbell have a second type: Flying and Poison."),
        ], post: [L("ramos", "And TM86, Grass Knot. The heavier your foe, the harder it falls. Off with you, young sprout!")] },
      ] },
    { id: "c6", title: "The Kalos Power Plant and Lumiose City", env: "plant", map: "city", reward: { lmd: 8000, orundum: 500, thunderstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 13: Lumiose Badlands", lv: 33, env: "safari", weather: "sand", music: "kaFlare", trainer: TR("Team Flare Grunt", "ka_grunt", "The Power Plant's off-limits! Team Flare's using the electricity for something big!", "Fine! Go in! You'll see!"),
          waves: [WK("houndoom:31", "golbat:33")], pre: [
          L("narr", "Sina and Dexio meet you at Coumarine's south gate: the road to Lumiose is closed, because something's wrong at the Kalos Power Plant. Route 13 is dust and sand."),
        ] },
        { id: "b", type: "battle", name: "Kalos Power Plant: Team Flare", lv: 34, env: "plant", music: "kaPlant", trainer: TR("Team Flare Grunts", "ka_grunt", "Lumiose's power is ours! Our boss needs it all!", "This is so not stylish..."),
          waves: [WK("scraggy:32", "croagunk:32"), WK("mightyena:34")] },
        { id: "c", type: "boss", name: "Kalos Power Plant: Team Flare Admin and Aliana", lv: 38, env: "plant", music: "kaFlare", trainer: TR("Team Flare Aliana", "ka_gruntf", "Battling us is a waste of energy, you know. We've already got what we need.", "Fine. Let the power go. It doesn't matter anymore."),
          waves: [WK("houndoom:36"), WK("mightyena:38!")], pre: [
          L("narr", "At the heart of the plant, a Team Flare Admin and a scientist in a red visor are running the machines."),
          L("aliana", "I'm Aliana, one of Team Flare's scientists. We're borrowing a little electricity. For a beautiful purpose. Our Admin will handle you first."),
        ], post: [L("narr", "Team Flare leaves the plant, and the power to Lumiose comes back on. Outside the gate, a very tall man looks at you for a long moment, and walks away.")] },
        { id: "d", type: "story", name: "Lumiose City: Prism Tower", music: "kaPrismTower", pre: [
          L("shauna", "Did you hear? Someone saved the Power Plant! Whoever it was, now Prism Tower's going to light up again. Come and watch!"),
          L("clemont", "Ready, Bonnie? Three, two, one... Prism Tower, on! I'm Clemont, the Lumiose Gym Leader. My Gym is the tower. Come up when you're ready!"),
        ] },
        { id: "e", type: "battle", name: "Lumiose Gym: Ace Trainer Rico", lv: 36, env: "gym", music: "kaEyesAce", trainer: TR("Ace Trainer Rico", "ka_acetrainer", "Answer the Gym's quiz wrong and you battle me! ...You answered right? Well, battle me anyway!", "Shocking..."),
          waves: [WK("ampharos:36")] },
        { id: "f", type: "boss", name: "Lumiose Gym: Leader Clemont", get reward() { return { tm: tmId("thunderbolt", 6) }; }, lv: 37, env: "plant", badgeWin: 4,
          trainer: TR("Leader Clemont", "ka_clemont", "I'm Clemont, the Lumiose Gym Leader, and an inventor! The future is now, thanks to science! Let's battle!", "Brilliant! I'll have to invent something new. Here: the Voltage Badge."),
          waves: [WK("emolga:35+", "magneton:35+", "heliolisk:37!")], pre: [
          L("clemont", "Electric types are fast and clever, just like my inventions. Well, my inventions are mostly clever."),
          L("narr", "Ground moves stop Electric types cold, except for Emolga, which flies. Magneton is part Steel: Fire and Fighting work on it too."),
        ], post: [L("clemont", "Take TM24, Thunderbolt, too. A classic! Oh, and Professor Sycamore is here at the tower to see you.")] },
        { id: "g", type: "story", name: "Prism Tower: Lysandre", reward: { held: "kingsrock" }, music: "kaSycamore", pre: [
          L("sycamore", "Congratulations! And look who's here: Lysandre came to see you."),
          L("lysandre", "You've grown stronger. Good. Did you know, three thousand years ago a king of Kalos had my family name? He wanted a world of beauty too."),
          L("lysandre", "Some people only take. If the world could be rid of them... Well. Here, a King's Rock, for the young Trainer. I'll be watching you."),
        ] },
      ] },
    { id: "c7", title: "Laverre City and the Poké Ball Factory", env: "tower", map: "tower", reward: { lmd: 9000, orundum: 500, duskstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 14: Laverre Nature Trail", lv: 30, env: "forest", wild: 1, catch: "goomy", music: "kaGlittering", waves: [WK("haunter:31", "quagsire:30"), WK("goomy:30")], pre: [
          L("narr", "Route 14 is a swamp under heavy branches, dim even at noon. A little purple slime slides out of a puddle."),
        ], post: [L("narr", "Gotcha! Goomy was caught! Its slimy skin keeps it from drying out, and keeps enemies from grabbing it.")] },
        { id: "b", type: "battle", name: "Route 14: the Neighbor", lv: 37, env: "forest", music: "kaFriendsReunited", get trainer() { return kalosRivalTR("A friendly battle, before Laverre. My partner's fully grown now. Is yours?", "...Again. But I'm getting closer. I can feel it."); },
          rivalWaves: () => [WK("meowstic:35", "absol:35", kalosRivalMon(2) + ":37!")], pre: [
          L("trevor", "Can I compare our Pokédexes? ...Huh. You've seen more than me. Hm."),
          LR("krival", () => `My turn. Let's battle!`),
        ], post: [
          L("narr", "Further on, Shauna leads everyone into a spooky old house by the trail, where a strange man tells a ghost story. Then it's on to Laverre City."),
        ] },
        { id: "c", type: "battle", name: "Laverre Gym: Furisode Girl Katherine", lv: 40, env: "gym", music: "kaEyesFurisode", trainer: TR("Furisode Girl Katherine", "ka_furisode", "Valerie's Gym is like a doll's house. Do you like dolls?", "I'm not cute when I lose..."),
          waves: [WK("slurpuff:40")], pre: [
          L("narr", "Laverre City is built around a huge, ancient tree. Its Gym is pink, delicate, and full of dolls."),
        ] },
        { id: "d", type: "boss", name: "Laverre Gym: Leader Valerie", get reward() { return { tm: tmId("dazzlinggleam", 6) }; }, lv: 42, env: "tower", badgeWin: 5,
          trainer: TR("Leader Valerie", "ka_valerie", "Oh... a challenger. I'm Valerie, the Laverre Gym Leader. I love Fairy types... they are so lovely. Shall we?", "You... are lovely too. The Fairy Badge is yours."),
          waves: [WK("mawile:38+", "mrmime:39+", "sylveon:42!")], pre: [
          L("valerie", "I came here from Johto, you know. I design clothes. Fairies inspire me. They are soft, and very strong."),
          L("narr", "Poison and Steel moves hit Fairy types hard; Dragon moves do nothing to them. Mawile is part Steel: use Fire or Ground on it."),
        ], post: [L("valerie", "And this... TM99, Dazzling Gleam. It shines like a fairy's wings.")] },
        { id: "e", type: "battle", name: "Poké Ball Factory: Team Flare", lv: 37, env: "plant", music: "kaPlant", trainer: TR("Team Flare Grunts", "ka_grunt", "The factory's ours! All the Poké Balls in Kalos are ours!", "Sweet as you are, you're super annoying!"),
          waves: [WK("toxicroak:37"), WK("mightyena:36", "golbat:36")], pre: [
          L("narr", "North of Laverre, Team Flare has taken over the Poké Ball Factory. Shauna distracts the guard, and you slip in."),
          LR("krival", () => `I'll take this one! You go on ahead. The president's on the top floor.`),
        ] },
        { id: "f", type: "battle", name: "Poké Ball Factory: Team Flare Admin", lv: 38, env: "plant", music: "kaFlare", trainer: TR("Team Flare Admin", "ka_gruntf", "Taking the president's office was the most stylish part of the plan. You're ruining it!", "Not... stylish..."),
          waves: [WK("scraggy:37", "houndoom:38!")] },
        { id: "g", type: "boss", name: "Poké Ball Factory: Celosia & Bryony", lv: 41, env: "plant", music: "kaFlare", trainer: TR("Team Flare Celosia & Bryony", "ka_bryony", "Two scientists. Two of you. How fun.", "Hmph. Let them have their factory."),
          waves: [WK("manectric:41"), WK("liepard:41!")], pre: [
          L("celosia", "I am Celosia, and this is Bryony. We need the factory's Master Balls. Team Flare's dream needs them."),
          L("bryony", "Mm. And the President won't give them up. So we'll just take them."),
          LR("krival", () => `Not without a fight! I'm with you. Two against two.`),
        ] },
        { id: "h", type: "chest", name: "Poké Ball Factory: the President's Thanks", reward: { gold5: 1, lmd: 10000 }, music: "kaLaverre", pre: [
          L("kpresident", "You drove them out! Thank you. Please, choose a reward: a Master Ball, or a Big Nugget? ...Oh, take both. You've earned them."),
        ] },
        { id: "i", type: "side", name: "Route 15: Klefki", lv: 35, env: "route", wild: 1, catch: "klefki", music: "kaRoute15", waves: [WK("mightyena:34", "liepard:34"), WK("klefki:35")], pre: [
          L("narr", "Route 15 runs through autumn woods to Dendemille Town. Something jingles in the leaves: a ring of keys, with a Pokémon attached."),
        ], post: [L("narr", "Gotcha! Klefki was caught! It collects keys, and never lets go of one it likes.")] },
        { id: "j", type: "side", name: "The Lost Hotel: Punk Couple Zoya & Asa", lv: 42, env: "city", music: "kaEyesPunk", trainer: TR("Punk Couple Zoya & Asa", "ka_punk", "This old hotel's our turf. Wanna go?", "Whatever. The hotel's still ours."),
          waves: [WK("garbodor:42", "pangoro:42!")], pre: [
          L("narr", "Off Route 15 stands the Lost Hotel, abandoned years ago. The Punks who hang out there say a ghost girl haunts it."),
        ] },
      ] },
    { id: "c8", title: "Dendemille Town to Anistar City", env: "ice", map: "sea", reward: { lmd: 10000, orundum: 600, linkcord: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 16: Mélancolie Path", lv: 35, env: "forest", wild: 1, catch: "phantump", music: "kaRoute15", waves: [WK("klefki:34", "floatzel:35"), WK("phantump:35")], pre: [
          L("narr", "Route 16 is full of dead trees and old stumps. One of the stumps has eyes, and it's following you."),
        ], post: [L("narr", "Gotcha! Phantump was caught! It's said to be a spirit that came to live in a rotting stump.")] },
        { id: "b", type: "side", name: "Route 16: Pumpkaboo", lv: 35, env: "forest", wild: 1, catch: "pumpkaboo", music: "kaRoute15", waves: [WK("klefki:34", "phantump:34"), WK("pumpkaboo:35")], pre: [
          L("narr", "A pumpkin is sitting in the long grass, glowing faintly. In Kalos, they say Pumpkaboo carry lost spirits to the afterlife."),
        ], post: [L("narr", "Gotcha! Pumpkaboo was caught! It lights up in the dark, and sings in an eerie voice.")] },
        { id: "c", type: "story", name: "Dendemille Town", music: "kaDendemille", pre: [
          L("narr", "Dendemille Town is a farming town with a windmill, and a blizzard is blowing down from the mountains."),
          L("trevor", "A Mamoswine on Route 17 won't give anyone rides through the snow. It's scared of something in Frost Cavern. Let's go and look. Together?"),
        ] },
        // (Bergmite is Lv 39-40 in the cavern, past the Lv 37 it evolves at: the house rule would make it an Avalugg, so the catch sits young
        // enough to be caught, as Sinnoh's Mantyke does)
        { id: "d", type: "battle", name: "Frost Cavern", lv: 39, env: "ice", weather: "hail", wild: 1, catch: "bergmite", music: "kaForest", waves: [WK("jynx:39", "beartic:39"), WK("bergmite:36")], pre: [
          L("narr", "Frost Cavern is a cave of ice, with frozen waterfalls on every floor. Little blocks of ice are skating across the floor."),
        ], post: [L("narr", "Gotcha! Bergmite was caught! It covers itself in ice, and fixes cracks with cold air.")] },
        { id: "e", type: "battle", name: "Frost Cavern: Team Flare", lv: 42, env: "ice", weather: "hail", music: "kaFlare", trainer: TR("Team Flare Grunts", "ka_gruntf", "This Abomasnow's making a great blizzard for us! Keep out!", "Ugh! Mable, help!"),
          waves: [WK("golbat:42", "manectric:42")], pre: [
          L("narr", "At the top of the cavern, two Grunts and a scientist are tormenting an Abomasnow. Its rage is what's causing the blizzard outside."),
          L("trevor", "That's not right! I'll help you. Let's get them away from it!"),
        ] },
        { id: "f", type: "boss", name: "Frost Cavern: Mable", lv: 48, env: "ice", weather: "hail", music: "kaFlare", trainer: TR("Team Flare Mable", "ka_gruntf", "I'm Mable. I'm testing how strong Pokémon get when they're angry. You're interrupting.", "...My data's good enough. We're leaving."),
          waves: [WK("houndoom:48!")], post: [
          L("narr", "Team Flare runs. The Abomasnow calms down, and the blizzard stops. The Mamoswine on Route 17 is ready to give rides again."),
        ] },
        { id: "g", type: "story", name: "Anistar City: the Sundial", music: "kaAnistar", pre: [
          L("narr", "Anistar City is famous for its sundial, a huge crystal some say fell from space. An old man tells a legend."),
          L("narr", "Three thousand years ago, a great war. Eight hundred years ago, Xerneas lit Kalos with its shining horns, and the land grew green with life. And Yveltal spread its wings, and Kalos went dark, and living things began to fall."),
          LR("krival", () => `Xerneas, the giver of life. Yveltal, the bringer of destruction. ...I wonder if they're still out there somewhere.`),
        ] },
        { id: "h", type: "battle", name: "Anistar City: the Neighbor", lv: 46, env: "city", music: "kaBattleCue", get trainer() { return kalosRivalTR("One more battle before the Gym. I've got a new teammate!", "...I'm glad we're friends. And rivals. Go win your Badge."); },
          rivalWaves: () => [WK("meowstic:44", "absol:44"), WK(kalosRivalEevee() + ":44", kalosRivalMon(2) + ":46!")] },
        { id: "i", type: "battle", name: "Anistar Gym: Psychic Arthur", lv: 46, env: "gym", music: "kaEyesPsychic", trainer: TR("Psychic Arthur", "ka_psychic", "This Gym floats in outer space. Or does it? Your mind will decide.", "My mind is... blank."),
          waves: [WK("reuniclus:46")] },
        { id: "j", type: "boss", name: "Anistar Gym: Leader Olympia", get reward() { return { tm: tmId("calmmind", 6) }; }, lv: 48, env: "tower", badgeWin: 6,
          trainer: TR("Leader Olympia", "ka_olympia", "I am Olympia, the Anistar Gym Leader. I have seen the future. A battle with you was in it. So was its ending.", "...The future changed. The Psychic Badge is yours."),
          waves: [WK("sigilyph:44+", "slowking:45+", "meowstic:48!")], pre: [
          L("olympia", "The stars move as they must. So do we. Come."),
          L("narr", "Bug, Ghost and Dark moves hit Psychic types hard. Sigilyph is part Flying; Slowking is part Water: Electric works on both."),
        ], post: [L("olympia", "TM04, Calm Mind. Keep your thoughts clear, child. Dark days are coming. I have seen them.")] },
      ] },
    { id: "c9", title: "Lysandre Labs and the Ultimate Weapon", env: "plant", map: "volcano", reward: { lmd: 11000, orundum: 600 },
      nodes: [
        { id: "a", type: "story", name: "Anistar City: Lysandre's Broadcast", music: "kaDarkSkies", pre: [
          L("narr", "Outside the Gym, every Holo Caster in Kalos switches on at once. It's Lysandre."),
          L("lysandre", "People of Kalos. I am Lysandre, the leader of Team Flare. The world is shrinking, and its resources with it. There is not enough for everyone."),
          L("lysandre", "So Team Flare will use the ultimate weapon. Only those of us who are chosen will remain. Everyone else... farewell."),
          LR("krival", () => `Lysandre... is Team Flare's boss? We have to stop him. He'll be in Lumiose. At his café!`),
        ] },
        { id: "b", type: "battle", name: "Lumiose City: Lysandre Café", lv: 46, env: "city", music: "kaDarkSkies", trainer: TR("Team Flare Grunts", "ka_grunt", "The café's closed! For you, anyway!", "Okay, okay! The password's \"open sesame\"!"),
          waves: [WK("scrafty:46"), WK("liepard:46")], pre: [
          L("narr", "In Lysandre Café, a waiter and a waitress take off their aprons. Underneath: Team Flare uniforms."),
        ] },
        { id: "c", type: "boss", name: "Lysandre Labs: Lysandre", lv: 49, env: "plant", music: "kaLabs", trainer: TR("Team Flare Lysandre", "ka_lysandre", "You've come. Then I'll test your resolve. If you lose, you'll lose everything.", "...Such strength. Then go deeper, if you want to stop me. You'll need the Elevator Key."),
          waves: [WK("mienfoo:45", "murkrow:45"), WK("pyroar:47", "gyarados:49!")], pre: [
          L("narr", "Behind a sliding cabinet, a staircase leads down into Lysandre Labs. Lysandre is waiting in a dark room below."),
          L("lysandre", "Some people would rather take than give. They're why the world is ugly. Can a Trainer like you understand that?"),
        ] },
        { id: "d", type: "boss", name: "Lysandre Labs: Aliana", lv: 48, env: "plant", music: "kaFlare", trainer: TR("Team Flare Aliana", "ka_gruntf", "You want the Elevator Key? It's with one of us scientists. Guess which!", "Not me. Keep looking."),
          waves: [WK("mightyena:46", "druddigon:48!")] },
        // (two battles in X and Y, Celosia then Bryony: a normal stage, so they come one after the other)
        { id: "e", type: "battle", name: "Lysandre Labs: Celosia & Bryony", lv: 48, env: "plant", music: "kaFlare", trainer: TR("Team Flare Celosia & Bryony", "ka_bryony", "One at a time, this time. Celosia first.", "The stones on Route 10 are graves, you know. Of the Pokémon the weapon killed. It'll happen again."),
          waves: [WK("manectric:46", "drapion:48!"), WK("liepard:46", "bisharp:48!")] },
        { id: "f", type: "boss", name: "Lysandre Labs: Mable", reward: { key: "ka_elevatorkey" }, lv: 48, env: "plant", music: "kaFlare", trainer: TR("Team Flare Mable", "ka_gruntf", "Looking for this? The Elevator Key. Beat me, and it's yours.", "Fine. Take it. It won't change anything."),
          waves: [WK("houndoom:46", "weavile:48!")] },
        { id: "g", type: "story", name: "Lysandre Labs: AZ", music: "kaPrison", pre: [
          L("narr", "The elevator goes down. Behind bars, sits the very tall man from Route 13. Lysandre stands outside the cell."),
          L("lysandre", "This is AZ. He shares his name with the king of Kalos from three thousand years ago. He carries the key to the ultimate weapon. Or did."),
          L("az", "Three thousand years ago, a king's Pokémon was taken by war. He built a machine to bring it back. Then he made it a weapon, and ended the war. Please. Do not let it be used again."),
        ] },
        { id: "h", type: "boss", name: "Lysandre Labs: Xerosic", lv: 48, env: "plant", music: "kaFlareEyes", trainer: TR("Team Flare Xerosic", "ka_xerosic", "I'm Xerosic. Lysandre wants me to see if you're the chosen one. If you win, we'll call off the plan. Promise!", "Wonderful! Now, press one of these buttons. One stops the weapon. Or does it?"),
          waves: [WK("crobat:46", "malamar:48!")], post: [
          L("xerosic", "Red or blue? ...Ah, it doesn't matter. I have a remote. The weapon wakes either way!"),
        ] },
        { id: "h1", type: "story", name: "Geosenge Town: the Ultimate Weapon", music: "kaWeapon", pre: [
          L("narr", "Far away in Geosenge Town, the ground splits open. A huge flower of metal rises out of the earth: the ultimate weapon."),
          L("narr", "Houses crumble around it. Its petals turn toward the sky, and the people of Geosenge run."),
        ] },
        { id: "i", type: "battle", name: "Geosenge Town: Team Flare", lv: 45, env: "volcano", music: "kaFlareEyes", trainer: TR("Team Flare Grunt", "ka_grunt", "The weapon's charging! No one gets into the Secret HQ!", "Go, then. It's too late anyway!"),
          waves: [WK("manectric:45", "scrafty:45", "golbat:45")], pre: [
          L("narr", "Geosenge Town is in ruins around the weapon. The pile of rocks where the Grunt vanished is the door to Team Flare's Secret HQ."),
          LR("krival", () => `I'm coming with you. Don't argue.`),
        ] },
        { id: "j", type: "boss", name: "Team Flare Secret HQ: Lysandre", lv: 51, env: "plant", music: "kaFlareHQ", trainer: TR("Team Flare Lysandre", "ka_lysandre", "Still you come. Then I'll keep you busy until the weapon is ready.", "Magnificent. But it's too late. The weapon is drinking the power of a Legendary Pokémon right now."),
          waves: [WK("mienshao:47", "honchkrow:47"), WK("pyroar:49", "gyarados:51!")], pre: [
          LR("krival", () => `Why, Lysandre? Why do this?`),
          L("lysandre", "Because people fight over what can't be shared. The weak go without. The only answer is fewer people. And Pokémon... are only used for war. Better they are gone."),
        ] },
        { id: "k", type: "battle", name: "Team Flare Secret HQ: the Walkway", lv: 50, env: "plant", music: "kaFlareHQ", trainer: TR("Team Flare Admins & Grunts", "ka_grunt", "Two by two! Team Flare doesn't lose to kids!", "The weapon... it needs that power!"),
          waves: [WK("toxicroak:50", "liepard:48"), WK("manectric:50", "mightyena:48"), WK("houndoom:50", "scrafty:48")], pre: [
          L("narr", "Behind Lysandre, a window looks down on the Legendary Pokémon far below, its life being drained into the weapon. Admins and Grunts wait in pairs on the walkway down."),
          LR("krival", () => `Pairs, huh? Then we battle as a pair. Stay close!`),
        ] },
        { id: "k1", type: "battle", name: "Team Flare Secret HQ: the Basement", lv: 50, env: "plant", music: "kaFlareHQ", trainer: TR("Team Flare Admins", "ka_gruntf", "Team Flare makes its last stand here! Nobody touches the Legendary Pokémon!", "No... it's waking up..."),
          waves: [WK("swalot:50"), WK("liepard:47", "manectric:48"), WK("golbat:50"), WK("mightyena:47", "houndoom:48!")], pre: [
          L("shauna", "Wait for me! I followed you in. You didn't think I'd let you two do this alone, did you? I'll open the door down there!"),
          L("narr", "In the dark basement, the last four Admins stand between you and the Legendary Pokémon. Shauna and your neighbor draw some away; the rest are yours, one by one."),
        ] },
        { id: "l", type: "boss", name: "Team Flare Secret HQ: Xerneas", lv: 50, env: "forest", wild: 1, catch: "xerneas", music: "kaLegendAwoken", waves: [WK("xerneas:50!")], pre: [
          L("narr", "In the deepest chamber, a tree of gray stone stands under the weapon's roots. The Admins are gone. The tree begins to glow."),
          L("narr", "Its branches open into shining horns of every color: Xerneas, the Pokémon of life, waking from its thousand-year sleep. It takes back the power the weapon stole, and turns to you."),
        ], post: [L("narr", "Gotcha! Xerneas was caught! It is said that it can share eternal life.")] },
        // (the owner's pick, 2026-10-15: both Legendaries. Pokémon Y's Yveltal sleeps in the same chamber as a cocoon of dark wings)
        { id: "m", type: "side", name: "Team Flare Secret HQ: Yveltal", lv: 50, env: "tower", wild: 1, catch: "yveltal", music: "kaLegendAwoken", waves: [WK("yveltal:50!")], pre: [
          L("narr", "In Pokémon Y, it's a cocoon of dark wings that hangs in this chamber instead. Here it hangs beside the stone tree, and it opens too: Yveltal, the Pokémon of destruction."),
        ], post: [L("narr", "Gotcha! Yveltal was caught! When its wings spread, it is said to drain the life of everything around it.")] },
        { id: "n", type: "boss", name: "Team Flare Secret HQ: Lysandre's Last Stand", lv: 53, env: "volcano", music: "kaDarkSkies", trainer: TR("Team Flare Boss Lysandre", "ka_lysandre", "That Legendary Pokémon's power belongs to the weapon. I'll take it back!", "...So this is how it ends. My beautiful world... will never be."),
          waves: [WK("mienshao:49", "honchkrow:49"), WK("pyroar:51", "gyarados:53!")], pre: [
          L("narr", "Lysandre walks into the chamber wearing a machine on his back, made to drain the Legendary Pokémon's power back into the weapon."),
          L("lysandre", "I tried to build a better world by giving. People only took more. So I chose the chosen. This is my last stand."),
          L("shauna", "We can share, though! We all helped each other get here. You battle with your Pokémon too, Lysandre. Doesn't that mean something?"),
        ] },
        { id: "n1", type: "story", name: "Team Flare Secret HQ: the Weapon Fires", music: "kaFiringX", pre: [
          L("lysandre", "My beautiful world will never be. Then I'll give the weapon what power is left, and end it here, for all of us."),
          L("narr", "The weapon fires with the last of its power. You run. Behind you, a ball of light shoots into the sky, crashes down, and the weapon sinks back into the earth, taking the Secret HQ with it."),
        ] },
        { id: "o", type: "story", name: "Geosenge Town: the Crater", music: "kaAZ", pre: [
          L("narr", "Where the Secret HQ stood there is only a crater. Your friends are safe: Shauna, Tierno, Trevor, and two masked heroes who look a lot like Sina and Dexio."),
          L("az", "I am the king who built the weapon. I lived three thousand years because of it. I have wandered all that time, looking for my Pokémon... my Floette. It never came back."),
          L("sycamore", "On the Holo Caster: Are you all right? Please, come to Couriway Town. I want to talk with you, face to face."),
        ] },
      ] },
    { id: "c10", title: "Couriway Town to Snowbelle City", env: "route", map: "route", reward: { lmd: 12000, orundum: 600 },
      nodes: [
        { id: "a", type: "battle", name: "Route 18: Black Belt Yanis", lv: 50, env: "cave", music: "kaEyesBlackBelt", trainer: TR("Black Belt Yanis", "ka_blackbelt", "Route 18's an old mining road. Only the strong make it to Couriway!", "Strong! You're strong!"),
          waves: [WK("sawk:49", "pangoro:50")], pre: [
          L("narr", "Route 18 runs through the mountains past an old coal mine, Terminus Cave. Something huge is said to sleep at its bottom."),
        ] },
        { id: "b", type: "side", name: "Terminus Cave: Noibat", lv: 45, env: "cave", wild: 1, catch: "noibat", music: "kaGlittering", waves: [WK("durant:44", "sandslash:45"), WK("noibat:45")], pre: [
          L("narr", "Terminus Cave's tunnels are dark and empty. Something swoops down from the ceiling, screeching."),
        ], post: [L("narr", "Gotcha! Noibat was caught! Its ultrasonic waves can make even a wrestler dizzy.")] },
        { id: "c", type: "battle", name: "Couriway Town: Professor Sycamore", lv: 50, env: "city", music: "kaSycamore", trainer: TR("Pokémon Professor Sycamore", "ka_sycamore", "I should have seen what Lysandre was. I'm sorry. Now, a battle: I've been training too!", "You're even stronger than I hoped. Thank you, for everything."),
          waves: [WK("venusaur:50", "charizard:50", "blastoise:50!")], pre: [
          L("narr", "Couriway Town is built around waterfalls. Professor Sycamore is waiting on the bridge."),
        ] },
        { id: "d", type: "battle", name: "Route 19: Shauna", lv: 51, env: "route", music: "kaRoute18", get trainer() { return shaunaTR("I've gotten so much stronger since Aquacorde! This time I'm going to win!", "Aww! But that's okay. I'm just so happy we're all still here."); },
          rivalWaves: () => [WK("delcatty:49", "goodra:49", shaunaMon(2) + ":51!")], pre: [
          L("narr", "Route 19 crosses a long bridge over a great valley, Grande Vallée Way. Halfway across, Shauna's waiting."),
        ] },
        { id: "e", type: "battle", name: "Route 19: Tierno", lv: 52, env: "route", music: "kaRoute18", trainer: TR("Tierno", "ka_tierno", "My turn! My dance team's all ready. Let's dance!", "Okay, okay, you win. But we were in rhythm the whole time!"),
          waves: [WK("talonflame:48", "roserade:49", "crawdaunt:52!")] },
        { id: "f", type: "battle", name: "Route 19: Trevor", get reward() { return { tm: tmId("waterfall", 6) }; }, lv: 51, env: "route", music: "kaFriendsForever", trainer: TR("Trevor", "ka_trevor", "I'll heal your Pokémon first. I want a fair battle. Ready?", "I lost... but I've seen so many Pokémon because of you. Thanks."),
          waves: [WK("raichu:49", "aerodactyl:49", "florges:51!")], post: [
          L("shauna", "That's from all of us: HM05, Waterfall. Go get your last Badge!"),
        ] },
        { id: "g", type: "battle", name: "Route 19: Grande Vallée Way", lv: 47, env: "sea", wild: 1, catch: "sliggoo", music: "kaRoute18", waves: [WK("quagsire:48", "carnivine:46"), WK("sliggoo:47")], pre: [
          L("narr", "At the far end of the bridge the route drops into swamps. Something big and slimy is lying in the shallows."),
        ], post: [L("narr", "Gotcha! Sliggoo was caught! The shell on its head is the remains of its own horn.")] },
        { id: "h", type: "side", name: "Route 20: Winding Woods", lv: 49, env: "forest", wild: 1, catch: "trevenant", music: "kaForest", waves: [WK("noctowl:48", "amoonguss:48"), WK("trevenant:49")], pre: [
          L("narr", "The Winding Woods twist so much that you keep ending up where you started. The trees seem to move when you aren't looking. One of them does."),
        ], post: [L("narr", "Gotcha! Trevenant was caught! It controls the trees of the forest with its roots.")] },
        { id: "i", type: "story", name: "Pokémon Village", music: "kaVillage", pre: [
          L("narr", "Beyond the woods lies the Pokémon Village, where Pokémon that were abandoned by their Trainers live in peace."),
          L("wulfric", "Hey there! I'm Wulfric. I come here to check on these folks. You're a challenger? Then let's head back to Snowbelle. My Gym's waiting!"),
        ] },
        { id: "j", type: "battle", name: "Snowbelle Gym: Ace Trainer Viktor", lv: 55, env: "ice", weather: "hail", music: "kaEyesAce", trainer: TR("Ace Trainer Viktor", "ka_acetrainer", "Wulfric's Gym spins like a clock. Get it wrong and you're back at the start!", "Frozen solid..."),
          waves: [WK("delibird:54", "mamoswine:55")] },
        { id: "k", type: "boss", name: "Snowbelle Gym: Leader Wulfric", get reward() { return { tm: tmId("icebeam", 6) }; }, lv: 59, env: "ice", weather: "hail", badgeWin: 7,
          trainer: TR("Leader Wulfric", "ka_wulfric", "Hah! I'm Wulfric, the Snowbelle Gym Leader. They say I'm the strongest Leader in Kalos. Let's see if they're right!", "Hah! That was the most fun I've had in years. The Iceberg Badge is yours!"),
          waves: [WK("abomasnow:56+", "cryogonal:55+", "avalugg:59!")], pre: [
          L("wulfric", "You remind me of me, back when I was starting out. So I'll go all out. Fair warning!"),
          L("narr", "Hail falls in the Snowbelle Gym. Fire, Fighting, Rock and Steel moves hit Ice types hard; Abomasnow is part Grass: Fire hits it four times as hard."),
        ], post: [L("wulfric", "Take TM13, Ice Beam, too. Now on to Victory Road. The Pokémon League is waiting for you!")] },
      ] },
    { id: "c11", title: "Victory Road and the Pokémon League", env: "plateau", map: "plateau", reward: { lmd: 20000, orundum: 1500, permit: 10 },
      nodes: [
        { id: "a", type: "battle", name: "Victory Road: Ace Trainer Robbie", lv: 57, env: "cave", music: "kaEyesAce", trainer: TR("Ace Trainer Robbie", "ka_acetrainer", "Eight Badges? Show me. ...Good. Now show me you've earned them!", "You've earned them. Go on through."),
          waves: [WK("carbink:56", "raichu:56", "kingdra:57")], pre: [
          L("narr", "Victory Road winds through caves and over ancient ruins on its way to the Pokémon League. Only Trainers with eight Badges are let through."),
        ] },
        { id: "b", type: "battle", name: "Victory Road: Veteran Inga", lv: 61, env: "cave", music: "kaVictory", trainer: TR("Veteran Inga", "ka_veteranf", "I've walked this road many times. Let me see how you walk it.", "You walk it very well."),
          waves: [WK("talonflame:61")] },
        { id: "c", type: "battle", name: "Victory Road: the Neighbor", lv: 61, env: "plateau", music: "kaVictory", get trainer() { return kalosRivalTR("I've been thinking since Geosenge. I don't just want to win. I want to see how you and your Pokémon think. And feel.", "...I see it now. Thank you. Go be the Champion."); },
          rivalWaves: () => [WK("meowstic:57", kalosRivalEevee() + ":57", "altaria:58"), WK("absol:59", kalosRivalMon(2) + ":61!")] },
        { id: "d", type: "boss", name: "Elite Four Malva", lv: 65, env: "volcano", weather: "sun",
          trainer: TR("Elite Four Malva", "ka_malva", "I'm Malva of the Elite Four. So you're the hero who brought down Team Flare. How nice. Let's see you survive me.", "...How annoying. You really are strong.", "ultra"),
          waves: [WK("pyroar:63", "torkoal:63"), WK("chandelure:63", "talonflame:65!")], pre: [
          L("malva", "I do the news on TV, you know. I'd hate to have to report on your defeat. No, I'd love it."),
          L("narr", "The Blazing Chamber is ringed with fire, and the sun beats down: Fire moves are 50% stronger, Water moves weaker."),
        ] },
        { id: "e", type: "boss", name: "Elite Four Siebold", lv: 65, env: "sea", weather: "rain",
          trainer: TR("Elite Four Siebold", "ka_siebold", "I am Siebold, a chef, and of the Elite Four. A battle is like a dish. Let us see what you serve.", "A delicious battle. I am grateful.", "ultra"),
          waves: [WK("clawitzer:63", "gyarados:63"), WK("starmie:63", "barbaracle:65!")], pre: [
          L("siebold", "Water is the essence of every great dish. And of every great battle."),
          L("narr", "Rain falls in the Flood Chamber: Water moves are 50% stronger. Electric and Grass moves hit Water types hard."),
        ] },
        { id: "f", type: "boss", name: "Elite Four Wikstrom", lv: 65, env: "plateau",
          trainer: TR("Elite Four Wikstrom", "ka_wikstrom", "Well met, young knight! I am Wikstrom of the Elite Four. My Steel Pokémon and I shall not yield!", "A glorious defeat! Your blade is the sharper!", "ultra"),
          waves: [WK("klefki:63", "probopass:63"), WK("scizor:63", "aegislash:65!")], pre: [
          L("wikstrom", "Steel is honor! Steel is strength! En garde!"),
        ] },
        { id: "g", type: "boss", name: "Elite Four Drasna", lv: 65, env: "plateau",
          trainer: TR("Elite Four Drasna", "ka_drasna", "Oh, how lovely! I'm Drasna of the Elite Four. My dear Dragons will put on such a show for you!", "Oh my, my! You've made an old woman very happy.", "ultra"),
          waves: [WK("dragalge:63", "druddigon:63"), WK("altaria:63", "noivern:65!")], pre: [
          L("drasna", "Dragons are proud, you know. They don't like to lose any more than I do. Hohoho!"),
        ] },
        { id: "h", type: "boss", name: "Champion Diantha", lv: 68, env: "plateau", champion: 1,
          trainer: TR("Champion Diantha", "ka_diantha", "I'm Diantha, the Champion. I've played many roles on the screen, but this one is my favorite. Let's make it a battle to remember!", "Witnessing the noble spirits of you and your Pokémon... it moves me. You're the new Champion of Kalos!", "master"),
          waves: [WK("hawlucha:64", "tyrantrum:65", "aurorus:65"), WK("gourgeist:65", "goodra:66", "gardevoir:68!")], pre: [
          L("diantha", "I've been waiting since Coumarine. Show me what you and your Pokémon have become!"),
        ], post: [
          L("narr", "Diantha takes you up to the Hall of Fame, where your Kalos Pokémon are recorded for all time. From now on they'll obey you all the way to Lv 100."),
        ] },
        { id: "i", type: "battle", name: "Lumiose City: AZ", reward: { key: "ka_honorofkalos" }, lv: 60, env: "city", music: "kaLumiose", trainer: TR("Pokémon Trainer AZ", "ka_az", "Champion. I would like to know what it is to be a Trainer. Please. Battle me.", "...So that is a Trainer. I feel free. Free of the man who built the weapon."),
          waves: [WK("torkoal:60", "golurk:60", "sigilyph:60!")], pre: [
          L("narr", "A few days later, Lumiose City throws a parade for the five friends who saved Kalos. Professor Sycamore gives you the Honor of Kalos."),
          L("narr", "Then the crowd parts. The tall man, AZ, steps onto the stage."),
        ] },
        { id: "j", type: "story", name: "Lumiose City: Floette Comes Home", music: "kaEnding", pre: [
          L("narr", "Something small drifts down out of the sky: a Floette, carrying a flower no one in Kalos has ever seen. AZ falls to his knees. After three thousand years, his Pokémon has come home."),
          L("sycamore", "It was waiting, all this time, for him to become the man it knew again. ...What an ending. Or should I say, what a beginning?"),
        ] },
      ] },
    { id: "c12", title: "Kiloude City and the Looker Bureau", env: "city", map: "city", reward: { orundum: 1500, permit: 5, rec4: 3 },
      nodes: [
        { id: "a", type: "story", name: "Lumiose Station: the TMV Pass", reward: { key: "ka_tmvpass" }, music: "kaTMV", pre: [
          L("kmom", "The Champion of Kalos, in my kitchen! Professor Sycamore called. He's waiting for you at Lumiose Station."),
          L("sycamore", "There's the Champion! Sina and Dexio have upgraded your Pokédex to the National Pokédex. And here: a TMV Pass. The train goes all the way to Kiloude City."),
          L("narr", "Kiloude City, at the end of the line, has the Battle Maison and the Friend Safari. The Battle Maison's challenges are in the Battle Tower's Kalos wing."),
        ] },
        { id: "b", type: "story", name: "The Looker Bureau", music: "kaLookerTale", pre: [
          L("narr", "Back in Lumiose, an anonymous Holo Clip asks you to visit an office near Rouge Plaza: the Looker Bureau."),
          L("klooker", "Ah, the new Champion! I am a detective. Call me... Looker. Lumiose has troubles, many troubles. I need an assistant. First, a test: find the five Looker Tickets I have hidden around the city."),
          L("narr", "You find all five. Looker's next case: children skipping school to play in a back alley off South Boulevard."),
        ] },
        { id: "c", type: "battle", name: "South Boulevard: the Secret Base", lv: 56, env: "city", music: "kaLooker", trainer: TR("Schoolgirl Callie & New Schoolboy Macon", "ka_schoolgirl", "This is our secret base! Grown-ups and Champions keep out!", "Fine, fine. The base is yours."),
          waves: [WK("rapidash:53", "leavanny:53", "kingler:53"), WK("spiritomb:56!")], post: [
          L("narr", "At the end of the alley lives a girl named Emma, with an Espurr she calls Mimi. Looker offers her a room at the Bureau, if she'll be his assistant."),
          L("emma", "...Okay. If Mimi likes it. Mimi's scared of grown-ups. Will you help us make friends?"),
        ] },
        { id: "d", type: "battle", name: "Lumiose Station: the Lumiose Gang", lv: 58, env: "city", music: "kaEyesPunk", trainer: TR("Lumiose Gang Members", "ka_punkf", "Emma doesn't hang with us anymore 'cause of that detective! So we took a tourist's Pokémon. Beat us and you get 'em back!", "Okay, okay! We'll give 'em back. Maybe we'll get real jobs or something."),
          waves: [WK("mandibuzz:58"), WK("pangoro:56", "bouffalant:56"), WK("druddigon:56", "krookodile:56!")], pre: [
          L("narr", "A tourist's Pokémon were stolen at Lumiose Station, and Emma's old friends, the Lumiose Gang, are behind it. Looker has no Pokémon, so you battle in his place."),
        ] },
        { id: "e", type: "battle", name: "Lumiose's Back Alleys: the Poké Ball Thief", lv: 60, env: "city", music: "kaLooker", trainer: TR("???", "ka_veteranf", "...", "...Battle over. Your Poké Balls, please."),
          waves: [WK("jellicent:58", "volcarona:60!"), WK("whimsicott:57", "mawile:57", "granbull:57"), WK("persian:60!")], pre: [
          L("klooker", "A thief battles Trainers in the back alleys, then steals their Poké Balls when their guard is down. You will be the bait. I will be in the shadows. Go!"),
          L("narr", "A woman, then a little girl, then a young lady: three alleys, three disguises, and every time the thief wears a robotic suit underneath."),
        ], post: [
          L("narr", "Mimi runs up to the thief, happy, as if she knows her. The thief calls herself Essentia. When Looker steps in to protect Mimi, Essentia strikes him and flees."),
        ] },
        { id: "f", type: "battle", name: "The Looker Bureau: Butler Chalmers", lv: 62, env: "city", music: "kaLookerTrouble", trainer: TR("Butler Chalmers", "ka_butler", "My mistress has a request. First, I must be sure you are strong enough to hear it.", "Very good. Please go to Hotel Richissime's Royal Suite. My mistress does not like to wait."),
          waves: [WK("braviary:62!")], pre: [
          L("narr", "Looker is in the hospital, or so he says. A butler walks into the Bureau. He was a Team Flare Admin once."),
        ] },
        { id: "g", type: "boss", name: "Hotel Richissime: Malva", lv: 63, env: "volcano", music: "kaRichissime", trainer: TR("Pokémon Trainer Malva", "ka_malva", "You came. Good. Battle me first. I don't talk business with weaklings.", "Hmph. Fine. Now listen."),
          waves: [WK("pyroar:63!")], post: [
          L("malva", "Essentia is Emma. Xerosic made that suit, and he's controlling her with it. I was in Team Flare too. His projects make me sick."),
          L("malva", "Make him disappear. He's under Lysandre Café. I'll open the way. Prepare well."),
        ] },
        { id: "h", type: "battle", name: "Lysandre Labs: the Hidden Floor", lv: 62, env: "plant", music: "kaLabs", trainer: TR("Scientist Sonia & the Lumiose Gang", "ka_scientistf", "Intruder on the hidden floor! Security!", "...Shift's over anyway."),
          waves: [WK("elgyem:60", "klinklang:60"), WK("weezing:61", "heliolisk:59"), WK("druddigon:59", "krookodile:61!")], pre: [
          L("narr", "Malva's password takes the elevator to a hidden floor. Xerosic's scientists are there, and the Lumiose Gang, working as security."),
          L("narr", "In the room Nix guarded: stolen Poké Balls, and Xerosic's notes on the Expansion Suit. It makes its wearer stronger, hacks Poké Balls, disguises her... and lets someone control her from far away."),
        ] },
        { id: "i", type: "boss", name: "Lysandre Labs: Essentia", lv: 70, env: "plant", music: "kaEssentia", trainer: TR("Pokémon Trainer Essentia", "ka_essentia", "...", "...Where am I? Mr. Looker?"),
          waves: [WK("jellicent:64", "volcarona:66"), WK("whimsicott:63", "mawile:63", "granbull:63"), WK("persian:66"), WK("crobat:68", "malamar:70!")], pre: [
          L("xerosic", "You're the one who keeps interfering with my trials! Then you'll be my next test subject. Essentia! Battle! And again! And again! The suit never gets tired."),
          L("narr", "After the third battle, Looker and Mimi burst in. Mimi's cry reaches Emma inside the suit. Xerosic tells her to keep battling anyway."),
        ], post: [
          L("narr", "Xerosic switches off the remote control. Emma wakes up, remembering nothing. Looker arrests Xerosic, but first, he invites everyone to dinner."),
        ] },
        { id: "j", type: "story", name: "The Looker Bureau: Looker's Letter", music: "kaLookerSad", pre: [
          L("emma", "Mr. Looker's coming back from the hospital today! ...Mimi? What's that? A letter?"),
          L("klooker", "I am of the International Police. The case is closed, so I must leave Kalos. Champion, I leave you my code name: Looker. Emma, Mimi: I have bought the building. Live here, always."),
          L("narr", "At Lysandre Café, Xerosic gives Emma the Expansion Suit, without its remote control, and his Pokémon, so the new head of the Looker Bureau can keep Lumiose safe. Then Looker leads him away to the train."),
        ] },
      ] },
    { id: "c13", title: "The Legendary Pokémon of Kalos", env: "cave", map: "cave", reward: { orundum: 2000, permit: 10, rec4: 5 },
      nodes: [
        // (a chapter starts with a main stage: the map draws a side stage's path from the stage before it)
        { id: "a", type: "battle", name: "Terminus Cave: Black Belt Ricardo", lv: 52, env: "cave", music: "kaEyesBlackBelt", trainer: TR("Black Belt Ricardo", "ka_blackbelt", "Something huge lives at the bottom of this mine. I'm training until I'm ready for it!", "I'm not ready... but you might be."),
          waves: [WK("hariyama:52")], pre: [
          L("narr", "Since you became Champion, the Ace Trainer who blocked the way into the deepest part of Terminus Cave has stepped aside."),
        ] },
        // (X and Y: the bird that roams Kalos and settles in the Sea Spirit's Den follows your starter: Articuno with Chespin, Zapdos with Fennekin, Moltres with Froakie)
        { id: "b", type: "side", name: "Sea Spirit's Den: the Legendary Bird", lv: 70, env: "sea", wild: 1, get catch() { return kalosBird(); }, music: "kaRoute8", get waves() { return [WK(kalosBird() + ":70!")]; }, pre: [
          L("narr", "A Legendary bird from Kanto has been roaming Kalos ever since you became Champion. After you've crossed its path enough times, it settles in the Sea Spirit's Den in Azure Bay."),
        ], post: [L("narr", "Gotcha! The Legendary bird was caught!")] },
        { id: "c", type: "side", name: "Unknown Dungeon: Mewtwo", lv: 70, env: "cave", wild: 1, catch: "mewtwo", music: "kaGlittering", waves: [WK("mewtwo:70!")], pre: [
          L("narr", "Upriver from the Pokémon Village, a cave lets in only Champions: the Unknown Dungeon. In its single chamber stands Mewtwo, its back to the entrance."),
        ], post: [L("narr", "Gotcha! Mewtwo was caught!")] },
        { id: "d", type: "boss", name: "Terminus Cave: Zygarde", lv: 70, env: "cave", wild: 1, catch: "zygarde", music: "kaGlittering", waves: [WK("zygarde:70!")], pre: [
          L("narr", "At the very bottom of Terminus Cave, in a chamber no miner reached, something green and black uncoils. It has been watching over Kalos's ecosystem since long before the war three thousand years ago."),
          L("narr", "Zygarde, the Order Pokémon. When the balance of life and destruction is threatened, it is said to unleash its power."),
        ], post: [
          L("narr", "Gotcha! Zygarde was caught! Life, destruction and order: Kalos's three Legendary Pokémon have all come to you."),
          L("narr", "You've done it: the Kalos Journey is complete."),
        ] },
      ] },
  ],
};
STORY.push(KALOS_JOURNEY);
indexJourney(KALOS_JOURNEY);
// The Battle Tower's Kalos wing (TOWER_WING in a4_story.js; the owner's rule: every X and Y battle the Journey leaves out goes to the
// Tower). X and Y have one team for each story battle, so the wing is their rematches and post-game: the Gym Leaders, the Elite Four and
// Diantha at the Battle Chateau (its plain battles, without a Writ of Challenge; a Leader's rematch team only where its Pokémon differ:
// Clemont's first Chateau team, Magneton and Heliolisk, is the same as his rematch's once the house rule evolves its Magneton), your
// neighbor's daily battle in Kiloude City (it follows your starter), Essentia's rematch at the Looker Bureau, and the Battle Maison's
// four Chatelaines. No Mega Stones: their Pokémon keep no item where they held one. The floors sort themselves by level.
const XY = "X and Y";
if (typeof TOWER_WING === "object") TOWER_WING.kalos = [
  { n: "Leader Viola", t: "ka_viola", from: XY + ": the Battle Chateau", waves: [WK("masquerain:40", "vivillon:40!")] },
  { n: "Leader Grant", t: "ka_grant", from: XY + ": the Battle Chateau", waves: [WK("aurorus:40", "tyrantrum:40!")] },
  { n: "Leader Korrina", t: "ka_korrina", from: XY + ": the Battle Chateau", waves: [WK("hawlucha:40", "machamp:40!")] },
  { n: "Leader Ramos", t: "ka_ramos", from: XY + ": the Battle Chateau", waves: [WK("jumpluff:40", "gogoat:40!")] },
  { n: "Leader Valerie", t: "ka_valerie", from: XY + ": the Battle Chateau", waves: [WK("mawile:40", "sylveon:40!")] },
  { n: "Leader Olympia", t: "ka_olympia", from: XY + ": the Battle Chateau", waves: [WK("sigilyph:40", "meowstic:40!")] },
  { n: "Leader Wulfric", t: "ka_wulfric", from: XY + ": the Battle Chateau", waves: [WK("cryogonal:40", "avalugg:40!")] },
  { n: "Leader Korrina", t: "ka_korrina", from: XY + ": the Battle Chateau rematch", waves: [WK("hawlucha:50", "lucario:50!")] },
  { n: "Leader Ramos", t: "ka_ramos", from: XY + ": the Battle Chateau rematch", waves: [WK("victreebel:50", "gogoat:50!")] },
  { n: "Leader Clemont", t: "ka_clemont", from: XY + ": the Battle Chateau rematch", waves: [WK("magnezone:50", "heliolisk:50!")] },
  { n: "Leader Olympia", t: "ka_olympia", from: XY + ": the Battle Chateau rematch", waves: [WK("slowking:50", "meowstic:50!")] },
  { n: "Leader Wulfric", t: "ka_wulfric", from: XY + ": the Battle Chateau rematch", waves: [WK("abomasnow:50", "avalugg:50!")] },
  { n: "Elite Four Malva", t: "ka_malva", from: XY + ": the Battle Chateau", waves: [WK("pyroar:55", "chandelure:55", "talonflame:55!")] },
  { n: "Elite Four Siebold", t: "ka_siebold", from: XY + ": the Battle Chateau", waves: [WK("clawitzer:55", "starmie:55", "barbaracle:55!")] },
  { n: "Elite Four Wikstrom", t: "ka_wikstrom", from: XY + ": the Battle Chateau", waves: [WK("scizor:55", "probopass:55", "aegislash:55!")] },
  { n: "Elite Four Drasna", t: "ka_drasna", from: XY + ": the Battle Chateau", waves: [WK("dragalge:55", "altaria:55", "noivern:55!")] },
  { n: "Champion Diantha", t: "ka_diantha", from: XY + ": the Battle Chateau", waves: [WK("hawlucha:60", "gourgeist:60"), WK("goodra:60", "gardevoir:60!")] },
  { get n() { return kalosRivalName(); }, get t() { return kalosRivalSpr(); }, from: XY + ": Kiloude City, every day after the Battle Maison", waves: () => [WK("meowstic:66", "clefable:68", kalosRivalEevee() + ":66"), WK("absol:68", "altaria:67", kalosRivalMon(2) + ":70!")] },
  { n: "Pokémon Trainer Essentia", t: "ka_essentia", from: XY + ": the Looker Bureau, on Tuesdays, Thursdays and Saturdays", waves: [WK("crobat:73", "malamar:75!")] },
  // (the Battle Maison's Chatelaines, Lv 50: each format's 20th battle and its Super 50th; they battle to X and Y's Elite Four theme)
  { n: "Battle Chatelaine Nita", t: "ka_nita", from: XY + ": the Battle Maison, Single Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("purugly:50@bigroot", "wigglytuff:50@shellbell", "grumpig:50!@wiseglasses")] },
  { n: "Battle Chatelaine Evelyn", t: "ka_evelyn", from: XY + ": the Battle Maison, Double Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("primeape:50@scopelens", "persian:50@lifeorb"), WK("pachirisu:50@sitrusberry", "lumineon:50!@expertbelt")] },
  { n: "Battle Chatelaine Dana", t: "ka_dana", from: XY + ": the Battle Maison, Triple Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("piloswine:50@persimberry", "dragalge:50@brightpowder", "whimsicott:50@sitrusberry"), WK("magneton:50@shucaberry", "girafarig:50@colburberry", "magcargo:50!@whiteherb")] },
  { n: "Battle Chatelaine Morgan", t: "ka_morgan", from: XY + ": the Battle Maison, Rotation Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("mantine:50@wacanberry", "sawsbuck:50@shellbell"), WK("swalot:50@blacksludge", "klefki:50!@apicotberry")] },
  { n: "Battle Chatelaine Nita", t: "ka_nita", from: XY + ": the Battle Maison, Super Single Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("tornadus:50@yacheberry", "thundurus:50@sitrusberry", "landorus:50!@choicescarf")] },
  { n: "Battle Chatelaine Evelyn", t: "ka_evelyn", from: XY + ": the Battle Maison, Super Double Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("raikou:50@airballoon", "entei:50@lifeorb"), WK("suicune:50@lumberry", "latios:50!@laxincense")] },
  { n: "Battle Chatelaine Dana", t: "ka_dana", from: XY + ": the Battle Maison, Super Triple Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("articuno:50@chartiberry", "zapdos:50@petayaberry", "moltres:50@whiteherb"), WK("regirock:50@luminousmoss", "regice:50@zoomlens", "registeel:50!@kingsrock")] },
  { n: "Battle Chatelaine Morgan", t: "ka_morgan", from: XY + ": the Battle Maison, Super Rotation Battles", bgm: "kaE4", winBgm: "kaGymWin", waves: [WK("cobalion:50@marangaberry", "terrakion:50@sitrusberry"), WK("virizion:50@cobaberry", "latias:50!@laxincense")] },
];
