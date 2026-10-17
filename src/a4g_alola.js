
// =====================================================================
//  ALOLA JOURNEY — Ultra Sun and Ultra Moon's story (the owner's pick, 2026-10-15): a partner from Professor Kukui on Route 1,
//  Hau and Lillie, Nebby the Cosmog, the island challenge across Melemele, Akala, Ula'ula and Poni (the captains' trials with
//  their Totem Pokémon and the kahunas' grand trials), Team Skull and Guzma, the Aether Foundation and Lusamine, the Ultra Recon
//  Squad and Necrozma, which steals Nebby's light at the Altar of the Sunne and is beaten at the top of Megalo Tower, then Mount
//  Lanakila, the first Pokémon League of Alola and its first Champion battle, with Hau. Then Ultra Sun and Ultra Moon's own
//  post-game: the Ultra Beasts of Poni Grove, Nebby, the guardian deities, the Ultra Warp Ride's Legendaries and Ultra Beasts, and
//  Episode RR, Team Rainbow Rocket's Giovanni, the Journey's end.
//  Each story battle takes its strongest version's team (the owner's rule: Sun and Moon's or Ultra Sun and Ultra Moon's, by the
//  game's power estimate after the region lock and the Lv 36 house rule, a tie to Ultra Sun/Ultra Moon): Sun and Moon's Dexio,
//  Totem Wishiwashi (Lana's trial) and Totem Vikavolt (Sophocles's), Ultra Sun and Ultra Moon's everywhere else. Sun's side is
//  the main version (the owner's pick): Ultra Sun's characters and Totem where the versions differ (Dulse, Totem Gumshoos, Mallow
//  and Sophocles in Mina's trial), its exclusives the main catches and Moon's the side stages beside them; the other version's
//  Totems are side stages beside their trial (wild battles, like the other versions' catches), and every other team is in the
//  Battle Tower's Alola wing (TOWER_WING below).
//  Alola has no Gyms: every trial and grand trial gives a stamp (ALOLA_BADGES, the owner's pick: twelve, counted as their share of
//  eight for the Badge bonus, badgeShare in a2_core.js). A Totem keeps its aura (the owner's pick): stat stages fixed to the aura,
//  shown on its badge from the first turn (TOT below; fixedStage in a7_engine.js). No Z-Moves or Ultra Burst: a Trainer's Z-Crystal
//  and Mega Stone are left out, and the Necrozma of Megalo Tower battles as Dusk Mane Necrozma, with Ultra Necrozma's aura.
//  Only Alola's Pokémon (Gen 7's, with the Alolan forms) battle on your side here (journeyOk); its wild stages catch them. Gifts
//  from other generations (the Eevee Egg, the Aerodactyl, the Porygon, the Legendaries of Ultra Space) count as Alola's too and join at once (journeyGifts).
//  Stage ids start with "al" (REGION_CODE in a4_story.js): al1-1, alS1-1; chapters alc1... `music` on a stage: the place's track
//  while its scene plays (Sun and Moon's and Ultra Sun and Ultra Moon's, a8c_sfx.js). Dialogue is original.
// =====================================================================
Object.assign(SPK, {
  alkukui: { n: "Prof. Kukui", t: "al_kukui" }, almom: { n: "Mom", t: "al_mom" }, alhau: { n: "Hau", t: "al_hau" }, allillie: { n: "Lillie", t: "al_lillie" },
  allilliez: { n: "Lillie", t: "al_lilliez" }, algladion: { n: "Gladion", t: "al_gladion" }, alhala: { n: "Hala", t: "al_hala" }, alilima: { n: "Ilima", t: "al_ilima" },
  allana: { n: "Lana", t: "al_lana" }, alkiawe: { n: "Kiawe", t: "al_kiawe" }, almallow: { n: "Mallow", t: "al_mallow" }, alolivia: { n: "Olivia", t: "al_olivia" },
  alsophocles: { n: "Sophocles", t: "al_sophocles" }, alacerola: { n: "Acerola", t: "al_acerola" }, alnanu: { n: "Nanu", t: "al_nanu" }, almina: { n: "Mina", t: "al_mina" },
  alhapu: { n: "Hapu", t: "al_hapu" }, almolayne: { n: "Molayne", t: "al_molayne" }, alkahili: { n: "Kahili", t: "al_kahili" }, alburnet: { n: "Prof. Burnet", t: "al_burnet" },
  alguzma: { n: "Guzma", t: "al_guzma" }, alplumeria: { n: "Plumeria", t: "al_plumeria" }, algrunt: { n: "Team Skull Grunt", t: "al_grunt" }, algruntf: { n: "Team Skull Grunt", t: "al_gruntf" },
  allusamine: { n: "Lusamine", t: "al_lusamine" }, alfaba: { n: "Faba", t: "al_faba" }, alwicke: { n: "Wicke", t: "al_wicke" },
  aldulse: { n: "Dulse", t: "al_dulse" }, alzossie: { n: "Zossie", t: "al_zossie" }, alsoliera: { n: "Soliera", t: "al_soliera" }, alphyco: { n: "Phyco", t: "al_phyco" },
  alcolress: { n: "Colress", t: "al_colress" }, alrotom: { n: "Rotom Pokédex" }, alsamson: { n: "Samson Oak", t: "al_samson" }, alroyal: { n: "The Masked Royal", t: "al_royal" },
  algiovanni: { n: "Giovanni", t: "al_giovanni" }, alrrgrunt: { n: "Team Rainbow Rocket Grunt", t: "al_rrgrunt" },
});
const WA = WG(7);
// a Totem Pokémon (or an Ultra Beast in its world): its aura, stat stages fixed to it while it's on the field (the owner's pick)
const TOT = (spec, aura) => WA(spec).map(s => ({ ...s, aura }));
const ALL1 = { atk: 1, def: 1, spa: 1, sdf: 1, spe: 1 }, ALL2 = { atk: 2, def: 2, spa: 2, sdf: 2, spe: 2 };
// Alola's twelve stamps, one for each trial and grand trial in Ultra Sun and Ultra Moon's order (the owner's pick: Alola has no
// Gyms). Each counts toward the Badge bonus as its share of eight (badgeShare in a2_core.js). Drawn in the trial's type color
const ALOLA_BADGES = [
  { n: "Verdant Cavern Stamp", gym: "Verdant Cavern", leader: "Ilima", trial: "Captain Ilima's trial", type: "Normal", col: "#b8b088", path: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" },
  { n: "Melemele Stamp", gym: "Iki Town", leader: "Hala", trial: "Kahuna Hala's grand trial", type: "Fighting", col: "#c84a3a", path: "M5 9a2 2 0 0 1 3.5-1.5A2 2 0 0 1 12 7a2 2 0 0 1 3.5.5A2 2 0 0 1 19 9v6a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" },
  { n: "Brooklet Hill Stamp", gym: "Brooklet Hill", leader: "Lana", trial: "Captain Lana's trial", type: "Water", col: "#5a8ae8", path: "M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z" },
  { n: "Wela Volcano Stamp", gym: "Wela Volcano Park", leader: "Kiawe", trial: "Captain Kiawe's trial", type: "Fire", col: "#f0803a", path: "M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-2-1-4-3-5 1 2 0 4-2 4-1.5 0-2.5-1.5-2-3 .5-2 1-4 1-7z" },
  { n: "Lush Jungle Stamp", gym: "Lush Jungle", leader: "Mallow", trial: "Captain Mallow's trial", type: "Grass", col: "#5aa84a", path: "M20 3C11 3 4 8 4 16c0 2 1 4 2 5 1-6 5-10 10-12-4 3-7 7-8 12 9 0 12-9 12-18z" },
  { n: "Akala Stamp", gym: "the Ruins of Life", leader: "Olivia", trial: "Kahuna Olivia's grand trial", type: "Rock", col: "#b8a040", path: "M8 3h8l5 5v8l-5 5H8l-5-5V8z" },
  { n: "Hokulani Stamp", gym: "Hokulani Observatory", leader: "Sophocles", trial: "Captain Sophocles's trial", type: "Electric", col: "#f0c830", path: "M13 2L5 14h6l-2 8 10-13h-6z" },
  { n: "Thrifty Megamart Stamp", gym: "the abandoned Thrifty Megamart", leader: "Acerola", trial: "Captain Acerola's trial", type: "Ghost", col: "#7a5aa8", path: "M12 3a7 7 0 0 1 7 7v11l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2L5 21V10a7 7 0 0 1 7-7z" },
  { n: "Ula'ula Stamp", gym: "Malie City", leader: "Nanu", trial: "Kahuna Nanu's grand trial", type: "Dark", col: "#6a5a4a", path: "M15 3a9 9 0 1 0 6 15A8 8 0 0 1 15 3z" },
  { n: "Vast Poni Stamp", gym: "Vast Poni Canyon", leader: "", trial: "the captainless trial", type: "Dragon", col: "#6a48d8", path: "M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6z" },
  { n: "Seafolk Stamp", gym: "Seafolk Village", leader: "Mina", trial: "Captain Mina's trial", type: "Fairy", col: "#e890b0", path: "M12 21C5 15 3 11 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 13z" },
  { n: "Poni Stamp", gym: "Exeggutor Island", leader: "Hapu", trial: "Kahuna Hapu's grand trial", type: "Ground", col: "#c8a860", path: "M2 20l6-12 4 5 3-9 7 16z" },
];
REGION_BADGES.alola = ALOLA_BADGES;
// your partner's lines: Hau takes the starter weak to yours (Ultra Sun and Ultra Moon); his Eevee evolution from Malie City on,
// Teacher Emily's Pokémon, Gladion's Silvally Memory and Kukui's ace are the type strong against yours, and Ilima's Smeargle
// knows a move that hits your starter hard
const ALOLA_LINE = { rowlet: ["rowlet", "dartrix", "decidueye"], litten: ["litten", "torracat", "incineroar"], popplio: ["popplio", "brionne", "primarina"] };
const ALOLA_WEAK = { rowlet: "popplio", litten: "rowlet", popplio: "litten" }, ALOLA_STRONG = { rowlet: "litten", litten: "popplio", popplio: "rowlet" };
const alolaStarter = () => { const k = regionStarter("alola"); return ALOLA_LINE[k] ? k : "rowlet"; };
const hauMon = st => ALOLA_LINE[ALOLA_WEAK[alolaStarter()]][st];
const hauEevee = () => ({ rowlet: "flareon", litten: "vaporeon", popplio: "leafeon" })[alolaStarter()];
const emilyMon = () => ALOLA_STRONG[alolaStarter()];
const ilimaMove = () => ({ rowlet: "ember", litten: "watergun", popplio: "leafage" })[alolaStarter()];
const gladionMemory = () => ({ rowlet: "firememory", litten: "watermemory", popplio: "grassmemory" })[alolaStarter()];
const kukuiAce = () => ALOLA_LINE[ALOLA_STRONG[alolaStarter()]][2];
// (Gladion's Kanto partner in his title defense: the starter of your starter's type)
const gladionKanto = () => ({ rowlet: "venusaur", litten: "charizard", popplio: "blastoise" })[alolaStarter()];
const hauTR = (intro, lose) => TR("Pokémon Trainer Hau", "al_hau", intro, lose);
const gladionTR = (intro, lose, title = "Team Skull Gladion") => TR(title, "al_gladion", intro, lose);
const skullTR = (intro, lose, n = "Team Skull Grunt", f = false) => TR(n, f ? "al_gruntf" : "al_grunt", intro, lose);
// a trial's Totem: a wild battle named for it, with its captain's picture on the map (the captainless trial: the Trial Guide's)
const totemTR = (name, spr) => TR("Totem " + name, spr, "", "");
// the stage where a trial or grand trial is won, for the music (a10_boot.js) and the stamp's scene
// the four Ultra Space Wilds the Ultra Warp Ride reaches (Ultra Sun and Ultra Moon), and what's in them
const ALOLA_WORLDS = {
  "Cliff World": "Red warp holes lead to the Cliff World: crags and wind, where Legendary Pokémon of the sky and the storm rest between their travels.",
  "Water World": "Blue warp holes lead to the Water World, an endless sea under strange stars, home to Legendary Pokémon of the lakes and the deep.",
  "Rocky World": "Green warp holes lead to the Rocky World, grassland and stone, where the Swords of Justice and other Legendary Pokémon roam.",
  "Cave World": "Yellow warp holes lead to the Cave World, a maze of glittering caverns, where the Regis sleep and the rulers of time, space and the underworld wait.",
};
const alolaHall = nd => /Kahuna/.test((nd.trainer || {}).name || "") ? "alKahunaTheme" : "alTotemAppears";

const ALOLA_JOURNEY = {
  id: "alola", title: "Alola Journey", sub: "The Island Challenge",
  blurb: "Leave Route 1 with a partner from Professor Kukui, take Alola's island challenge across its four islands, stop Team Skull, the Aether Foundation and Necrozma, and win the first battle for the title of Alola's Champion.",
  chapters: [
    { id: "c1", title: "Melemele Island: Route 1 and Iki Town", env: "route", map: "route", reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Route 1: A New Home in Alola", music: "alWaking", pre: [
          L("narr", "Three months ago, a professor in Alola video-called you in Kanto and made you a Trainer Passport. Today the boxes are unpacked, and the house on Route 1 smells like the sea."),
          L("almom", "Morning! Professor Kukui is here to take you to Iki Town, to meet the island's kahuna. Our Meowth already likes it here. I think you will too."),
          L("alkukui", "Alola! Welcome to Melemele Island, cousin. Come on, the kahuna's waiting, yeah? And on the way... well, you'll see."),
        ] },
        { id: "b", type: "story", name: "Route 1: Three Pokémon", starter: 1, music: "alKukui", pre: [
          L("narr", "Halfway up Route 1, a wild Yungoos jumps out of the grass and bares its teeth. Before it can bite, three Pokémon tumble out of the bushes and chase it away."),
          L("alkukui", "Woo! Rowlet, Litten and Popplio. Kahuna Hala asked me to find a partner for you, and here they are. Go on: pick the one you want to travel with."),
        ], post: [
          L("alhau", "Alola! You're the new kid, right? I'm Hau. Tutu, I mean Kahuna Hala, is my grandpa. Ooh, can I have one too? I'll take this one!"),
          L("alhau", "Now we both have a Pokémon, so we have to battle. That's how it works!"),
        ] },
        // (Hau's starter is the one weak to yours; the first rival battle is below the games' Lv 5 all the same: README, House rules)
        { id: "c", type: "battle", name: "Route 1: Hau", lv: 4, env: "route", music: "alHau", get trainer() { return hauTR("This is my first battle ever! Let's make it a good one!", "Aw, you won! That was so much fun. Our Pokémon did great!"); },
          rivalWaves: () => [[{ op: hauMon(0), LV: 4, moves: { popplio: ["pound", "growl", "watergun"], rowlet: ["tackle", "growl", "leafage"], litten: ["scratch", "growl", "ember"] }[hauMon(0)] }]], post: [
          L("alkukui", "Now that's a battle, yeah! Here, let me heal them up. Iki Town's just up these stairs."),
        ] },
        { id: "d", type: "battle", name: "Mahalo Trail: Nebby on the Bridge", lv: 4, env: "route", wild: 1, music: "alBridge", reward: { key: "al_sparklingstone" }, waves: [WA("spearow:4")], pre: [
          L("narr", "Hala is away, so Kukui sends you up Mahalo Trail to find him. On the old rope bridge, a girl in a white hat is begging a strange little Pokémon to come back."),
          L("allillie", "Please, help it! Nebby got out of my bag, and the Spearow are attacking it!"),
        ], post: [
          L("narr", "Nebby flashes with light. The bridge snaps. As you fall, a Pokémon with a shell like a mask swoops down, catches you both, and is gone again: Tapu Koko, Melemele's guardian deity."),
          L("allillie", "I'm Lillie. I'm Professor Kukui's assistant. Please... don't tell anyone about Nebby. And take this: Nebby found it on the bridge. It's a Sparkling Stone."),
        ] },
        { id: "e", type: "story", name: "Iki Town: Kahuna Hala", music: "alIki", reward: { key: "al_passport" }, pre: [
          L("alhala", "So you're the new arrival! And Tapu Koko saved you on the bridge? Ho ho! Then the guardian has its eye on you."),
          L("alhala", "Tomorrow we hold a festival for Tapu Koko. Come, and bring that stone. I think it has a purpose."),
          L("alkukui", "And here: a Pokédex and your Trainer Passport. Fill it with Alola's Pokémon, yeah? Every island's got its own."),
        ] },
        { id: "f", type: "battle", name: "Route 1: Pikipek", lv: 3, env: "route", wild: 1, catch: "pikipek", music: "alRoute1", reward: { key: "al_pokeballs" }, waves: [WA("yungoos:3", "grubbin:3"), WA("pikipek:3")], pre: [
          L("alkukui", "Watch my Rockruff: weaken it first, then throw the Poké Ball. Here, ten Poké Balls. Have a go!"),
          L("narr", "At the top of Route 1, two strangers in strange suits are watching the sky. One of them mutters about \"the Blinding One\"."),
        ], post: [L("narr", "Gotcha! Pikipek was caught! It pecks at trees at sixteen times a second.")] },
        { id: "g", type: "side", name: "Route 1: Grubbin", lv: 3, env: "route", wild: 1, catch: "grubbin", music: "alRoute1", waves: [WA("pikipek:3"), WA("grubbin:3")], pre: [
          L("narr", "A Grubbin is digging at the roots of a tree with its big jaws. It wants nothing more than to be left alone."),
        ], post: [L("narr", "Gotcha! Grubbin was caught! It grips trees with its jaws and drinks their sap.")] },
        { id: "h", type: "side", name: "Route 1: Yungoos", lv: 4, env: "route", wild: 1, catch: "yungoos", music: "alRoute1", waves: [WA("pikipek:3"), WA("yungoos:4")], pre: [
          L("narr", "The Yungoos that jumped you this morning is back, prowling the grass by day for something to eat."),
        ], post: [L("narr", "Gotcha! Yungoos was caught! Its stomach takes up most of its long body.")] },
        { id: "i", type: "side", name: "Route 1: Alolan Rattata", lv: 4, env: "route", wild: 1, catch: "rattataalola", music: "alRoute1", waves: [WA("pikipek:3"), WA("rattataalola:4")], pre: [
          L("narr", "After dark, the Yungoos sleep and the Alolan Rattata come out: black-furred, with long whiskers, and leaders of their own little gangs."),
        ], post: [L("narr", "Gotcha! Alolan Rattata was caught! In Alola, Rattata learned to live by night.")] },
        { id: "j", type: "battle", name: "Iki Town: The Festival Battle", lv: 7, env: "city", music: "alFestival", get trainer() { return hauTR("It's the festival battle! Tapu Koko's watching, so let's give it a real show!", "That was awesome! I think Tapu Koko liked it too!"); },
          rivalWaves: () => [WA("pichu:6", hauMon(0) + ":7!")], pre: [
          L("narr", "Iki Town's festival fills the stage with music and malasadas. Hala calls you and Hau up to battle in Tapu Koko's honor."),
        ], post: [
          L("narr", "A cry rings out from the ruins above the town. Tapu Koko approves."),
          L("alhala", "Then it is decided. Take the island challenge, both of you! Travel all four islands, clear the captains' trials and the kahunas' grand trials, and grow strong together."),
        ] },
        { id: "k", type: "story", name: "Professor Kukui's Pokémon Research Lab", music: "alLab", pre: [
          L("allillie", "Professor Kukui's lab is by the beach. Watch your step: the roof has holes, from his Pokémon practicing their moves."),
          L("alkukui", "Got a surprise for you, cousin: a Rotom lives in your Pokédex now! It'll talk to you, map Alola, tell you everything it learns."),
          L("alrotom", "Bzzt! Pleased to meet you! Let's fill in every page, okay? Bzzt!"),
          L("narr", "For a moment the sky goes dark, as if something swallowed the sun. Kukui laughs it off as an eclipse nobody predicted."),
        ] },
        { id: "l", type: "battle", name: "Trainers' School: Teacher Emily", lv: 10, env: "city", music: "alSchool", reward: { key: "al_expshare" }, trainer: TR("Teacher Emily", "al_teacher", "You've beaten my four students? Then the lesson today is type matchups. Pay attention!", "Top marks! You've learned that lesson well."),
          get waves() { return [WA(emilyMon() + ":10!")]; }, pre: [
          L("alkukui", "The Trainers' School is where Alola's kids learn to battle. Beat four of the students and their teacher, and I'll give you an Exp. Share."),
        ], post: [
          L("narr", "A boy with pink-streaked hair is waiting by the gate: Ilima, the Trial Captain of Melemele. He'll be watching your challenge, he says, and he leaves with a smile."),
        ] },
        { id: "m", type: "side", name: "Trainers' School: Alolan Meowth", lv: 7, env: "city", wild: 1, catch: "meowthalola", music: "alSchool", waves: [WA("grimeralola:7"), WA("meowthalola:7")], pre: [
          L("narr", "In the grass behind the school, an Alolan Meowth with a smug face and blue-gray fur watches the students go by."),
        ], post: [L("narr", "Gotcha! Alolan Meowth was caught! It was a pet of Alola's royal family, and it acts like it.")] },
      ] },
    { id: "c2", title: "Hau'oli City and Ilima's Trial", env: "city", map: "city", reward: { lmd: 4000, orundum: 300, thunderstone: 1 },
      nodes: [
        { id: "b", type: "battle", name: "Hau'oli City: Team Skull", lv: 9, env: "city", music: "alSkullAppears", trainer: skullTR("Yo yo yo! Hand over those amulets, or Team Skull's gonna make you!", "Ugh. Skull don't lose... usually."),
          waves: [WA("zubat:9")], pre: [
          L("narr", "Near the Malasada Shop, two Grunts in skull bandanas sway toward you, waving their hands. Hau takes one; you take the other."),
        ] },
        { id: "a", type: "side", name: "Hau'oli City: Alolan Grimer", lv: 8, env: "city", wild: 1, catch: "grimeralola", music: "alHauoli", waves: [WA("meowthalola:7"), WA("grimeralola:8")], pre: [
          L("narr", "Hau'oli City's streets are spotless. That's partly the Alolan Grimer: they eat the city's garbage, and their crystal teeth glitter as they chew."),
        ], post: [L("narr", "Gotcha! Alolan Grimer was caught! The poisons it eats form the crystals along its body.")] },
        { id: "c", type: "boss", name: "Hau'oli City: Captain Ilima", lv: 11, env: "city", music: "alHauoli", trainer: TR("Captain Ilima", "al_ilima", "I'm Ilima, the captain of Melemele. Let me see what kind of Trainer you are before you come to my trial.", "Splendid! You'll do very well in Verdant Cavern."),
          get waves() { return [[...WA("yungoos:10"), { ...WA("smeargle:11!")[0], moves: ["tackle", "", ilimaMove()] }]]; }, pre: [
          L("alilima", "My Smeargle paints its moves with its tail. Today it's painted one just for your partner. Ready?"),
        ] },
        { id: "d", type: "battle", name: "Route 2: Cutiefly", lv: 9, env: "route", wild: 1, catch: "cutiefly", music: "alRoute2", waves: [WA("yungoos:8", "meowthalola:8"), WA("cutiefly:9")], pre: [
          L("narr", "Route 2 runs past berry fields and Hau'oli's cemetery. Cutiefly dart from flower to flower, following the auras of things that are alive."),
        ], post: [L("narr", "Gotcha! Cutiefly was caught! It can sense the aura of flowers, and of people.")] },
        { id: "e", type: "side", name: "Route 2: Crabrawler", lv: 10, env: "route", wild: 1, catch: "crabrawler", music: "alRoute2", waves: [WA("yungoos:9"), WA("crabrawler:10")], pre: [
          L("narr", "Something is punching a berry pile. When you get close, a Crabrawler grabs your sleeve and drags you toward the beach."),
        ], post: [L("narr", "Gotcha! Crabrawler was caught! It punches everything, aiming to be the top of the pile.")] },
        { id: "f", type: "battle", name: "Big Wave Beach: Team Skull", lv: 9, env: "sea", music: "alBeach", trainer: skullTR("You again? We were just tellin' this surf dude his beach belongs to Skull now!", "Wack! We're outta here!"),
          waves: [WA("drowzee:9")] },
        { id: "g", type: "story", name: "Verdant Cavern: Ilima's Trial", music: "alTrialBegins", pre: [
          L("alilima", "Welcome to Verdant Cavern, the site of my trial! Find the three Pokémon hiding in the cave's dens and defeat them. Then the trial's true challenge will appear."),
          L("narr", "You can't leave a trial once it starts, and you can't catch the Pokémon in it. Your partner looks up at you, ready."),
        ] },
        { id: "h", type: "battle", name: "Verdant Cavern: The Dens", lv: 11, env: "cave", wild: 1, music: "alTrialSite", waves: [WA("yungoos:11", "yungoos:11"), WA("gumshoos:11")], pre: [
          L("narr", "Yungoos burst out of the first two dens. The third den's Pokémon keeps moving from hole to hole, until two familiar Grunts blunder in and corner it for you."),
        ] },
        { id: "i", type: "battle", name: "Verdant Cavern: Team Skull", lv: 11, env: "cave", music: "alSkullAppears", trainer: skullTR("We're here to wreck the trial! Team Skull says trials are lame!", "Lame... we're lame..."),
          waves: [WA("drowzee:11")] },
        { id: "j", type: "boss", name: "Verdant Cavern: Totem Gumshoos", lv: 12, env: "cave", wild: 1, badgeWin: 0, trainer: totemTR("Gumshoos", "al_ilima"),
          waves: [[...TOT("gumshoos:12!@pechaberry", { def: 1 }), ...WA("yungoos:10")]], pre: [
          L("narr", "At the back of the cave, on a stone pedestal, something glints. A huge shadow drops down in front of it: Totem Gumshoos, wrapped in a shimmering aura."),
          L("narr", "A Totem's aura raises its stats from the start, and it can call allies to help it."),
        ], post: [
          L("alilima", "You've cleared my trial! Congratulations. Your first stamp of the island challenge: may many more follow."),
          L("narr", "Two strangers in the cave's mouth ask Ilima about the Totem's aura, then walk away whispering about light."),
        ] },
        { id: "k", type: "side", name: "Verdant Cavern: Ultra Moon's Totem Alolan Raticate", lv: 12, env: "cave", wild: 1, music: "alTrialSite",
          waves: [[...TOT("raticatealola:12!@pechaberry", { def: 1 }), ...WA("rattataalola:10")]], pre: [
          L("narr", "In Ultra Moon, Ilima's trial ends with a different Totem: a huge Alolan Raticate, gorged on the cave's berries, with an Alolan Rattata at its side."),
        ] },
        { id: "l", type: "side", name: "Verdant Cavern: Alolan Diglett", lv: 10, env: "cave", wild: 1, catch: "diglettalola", music: "alCave", waves: [WA("zubat:9"), WA("diglettalola:10")], pre: [
          L("narr", "With the trial over, Verdant Cavern goes quiet. Little Alolan Diglett poke their heads out of the floor, golden hairs waving."),
        ], post: [L("narr", "Gotcha! Alolan Diglett was caught! Its three golden hairs can sense what's happening above ground.")] },
      ] },
    { id: "c3", title: "Melemele Island: Route 3 and Hala's Grand Trial", env: "route", map: "route", reward: { lmd: 5000, orundum: 400, icestone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Melemele Meadow: Oricorio", lv: 11, env: "forest", wild: 1, catch: "oricoriopompom", music: "alCave", waves: [WA("cutiefly:10", "cutiefly:10"), WA("oricoriopompom:11")], pre: [
          L("alkukui", "Lillie went looking for Nebby in Melemele Meadow. Mind finding her, cousin?"),
          L("narr", "Yellow flowers cover the meadow. The Oricorio here sip their nectar and turn into bright, bouncy dancers."),
        ], post: [L("narr", "Gotcha! Oricorio was caught! Yellow nectar made it a cheerleader, the Pom-Pom Style.")] },
        { id: "b", type: "battle", name: "Seaward Cave: Ultra Recon Squad Dulse", lv: 13, env: "cave", music: "alSquad", trainer: TR("Ultra Recon Squad Dulse", "al_dulse", "We are searching for someone strong enough to protect the Blinding One. Show us your strength.", "You are strong. Stronger than the Pokémon of our world, perhaps."),
          waves: [WA("furfrou:13")], pre: [
          L("narr", "Nebby has crawled through a gap into Seaward Cave. Lillie finds it, and with it two people in white suits and masks."),
          L("alzossie", "That's a Cosmog! We know about those. They open holes in the sky, and bad things come through. You should be careful, okay?"),
        ] },
        { id: "c", type: "battle", name: "Route 3: Hau", lv: 13, env: "route", music: "alRoute2", get trainer() { return hauTR("Hey! Before your grand trial, let's warm up. My team's been training too!", "Haha, you're really good! Tutu's gonna have his hands full."); },
          rivalWaves: () => [WA("noibat:11", "pikachu:12", hauMon(0) + ":13!@sitrusberry")] },
        { id: "d", type: "side", name: "Ten Carat Hill: Rockruff", lv: 12, env: "cave", wild: 1, catch: "rockruff", music: "alTenCarat", waves: [WA("zubat:11", "roggenrola:11"), WA("rockruff:12")], pre: [
          L("narr", "At the heart of Ten Carat Hill, sunlight falls into a hollow full of grass. A Rockruff is sharpening its teeth on the stones."),
        ], post: [L("narr", "Gotcha! Rockruff was caught! It's friendly, but it rubs the rocks around its neck against you, and they hurt.")] },
        { id: "e", type: "side", name: "Kala'e Bay: Wishiwashi", lv: 15, env: "sea", wild: 1, catch: "wishiwashi", music: "alRoute2", waves: [WA("tentacool:14", "magikarp:14"), WA("wishiwashi:15")], pre: [
          L("narr", "Past Seaward Cave, Kala'e Bay's still water is full of tiny fish Pokémon. Alone, a Wishiwashi is weak and its eyes tear up. Together, it's something else."),
        ], post: [L("narr", "Gotcha! Wishiwashi was caught! When it's in danger, its eyes shine and its friends gather.")] },
        { id: "f", type: "side", name: "Melemele Sea: Mareanie", lv: 17, env: "sea", wild: 1, catch: "mareanie", music: "alRoute2", waves: [WA("corsola:17", "wishiwashi:17"), WA("mareanie:17")], pre: [
          L("narr", "A Corsola in the shallows calls for help, and a Mareanie answers: it's been eating Corsola's branches."),
        ], post: [L("narr", "Gotcha! Mareanie was caught! It feeds on the branches of Corsola, and sometimes takes one home.")] },
        { id: "g", type: "boss", name: "Iki Town: Kahuna Hala's Grand Trial", lv: 16, env: "city", badgeWin: 1, music: "alKahunaTheme", trainer: TR("Island Kahuna Hala", "al_hala", "As kahuna of Melemele, I will test everything your trial taught you. Show me your strength, and the strength of your bond!", "Ho ho! A fine grand trial. You have Melemele's blessing."),
          waves: [WA("machop:15", "makuhita:15"), WA("crabrawler:16!")], pre: [
          L("alhala", "A grand trial is a kahuna's battle. Clear it, and you have completed this island's challenge."),
        ], post: [
          L("alhala", "Take the Melemele Stamp. Now Akala awaits. Ride a Mantine across the waves from Big Wave Beach, and greet Akala's captains for me!"),
        ] },
      ] },
    { id: "c4", title: "Akala Island: Heahea City to Brooklet Hill", env: "route", map: "route", reward: { lmd: 5000, orundum: 400, waterstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Heahea City: Pokémon Trainer Dexio", lv: 16, env: "city", music: "alHeahea", trainer: TR("Pokémon Trainer Dexio", "al_dexio", "A Trainer from Kanto who's beaten a kahuna? I'm from Kalos. Let's compare notes, in battle.", "Remarkable. Alola's Trainers grow up fast."),
          waves: [WA("slowpoke:15", "espeon:16!")], pre: [
          L("narr", "You surf to Akala on a Mantine and land at Heahea Beach. Outside the Tide Song Hotel, a visitor from Kalos is waiting for a challenger."),
        ] },
        { id: "b", type: "battle", name: "Route 4: Mudbray", lv: 13, env: "route", wild: 1, catch: "mudbray", music: "alRoute4", waves: [WA("pikipek:12", "grubbin:12"), WA("mudbray:13")], pre: [
          L("narr", "Route 4 climbs into Akala's ranch country. A Mudbray is rolling in the mud by the road, perfectly happy."),
        ], post: [L("narr", "Gotcha! Mudbray was caught! It loves playing in the mud, and it can carry ten times its own weight.")] },
        { id: "c", type: "battle", name: "Paniola Town: Hau", lv: 16, env: "city", music: "alPaniola", get trainer() { return hauTR("I passed Tutu's grand trial too! Let's see whose team's grown more!", "No way! I'm gonna have to train even harder!"); },
          rivalWaves: () => [WA("pikachu:15", "noibat:14", "eevee:" + (alolaStarter() === "popplio" ? 16 : 14)), WA(hauMon(1) + ":16!")] },
        { id: "d", type: "battle", name: "Paniola Town: Team Skull", lv: 14, env: "city", music: "alSkullAppears", trainer: skullTR("Paniola's got nice Pokémon. Team Skull's gonna borrow some. Permanently.", "Fine! Keep your town!"),
          waves: [WA("rattataalola:14")] },
        { id: "e", type: "chest", name: "Paniola Ranch: The Nursery's Egg", reward: { op: "eevee", lmd: 1500 }, music: "alRanch", pre: [
          L("almallow", "I'm Mallow, a captain! You'll see my trial later. Here, the Pokémon Nursery wants you to have this Egg. Something cute's in there, I can tell."),
          L("narr", "The Egg hatches into an Eevee, a Pokémon from Kanto, and it joins your team."),
        ] },
        { id: "f", type: "battle", name: "Route 5: Team Skull Gladion", lv: 18, env: "route", music: "alGladion", get trainer() { return gladionTR("Team Skull paid me to get rid of you. Nothing personal. Let's get this over with.", "...Hmph. You're strong. Type: Null, we're leaving."); },
          rivalWaves: () => [WA("zorua:17", "zubat:17"), WA("typenull:18!")], pre: [
          L("narr", "On Route 5, Hau is picking himself up off the ground. A pale boy in black stands over him with a Pokémon wearing a heavy mask."),
          L("algladion", "The name's Gladion. I just beat your friend. You're next."),
        ] },
        { id: "g", type: "side", name: "Route 5: Fomantis", lv: 15, env: "route", wild: 1, catch: "fomantis", music: "alRoute4", waves: [WA("pikipek:14"), WA("fomantis:15")], pre: [
          L("narr", "A Fomantis is sunbathing in the grass, so still and so pink it looks like a flower."),
        ], post: [L("narr", "Gotcha! Fomantis was caught! It sleeps all day in the sun and moves at night.")] },
        { id: "h", type: "side", name: "Route 5: Trumbeak", lv: 19, env: "route", wild: 1, catch: "trumbeak", music: "alRoute4", waves: [WA("grubbin:18", "fomantis:18"), WA("trumbeak:19")], pre: [
          L("narr", "North on Route 5, a Trumbeak lands on a branch and fires seeds from its beak at the passing Trainers."),
        ], post: [L("narr", "Gotcha! Trumbeak was caught! It can shoot seeds from its beak like bullets.")] },
        { id: "i", type: "battle", name: "Brooklet Hill: Dewpider", lv: 16, env: "sea", wild: 1, catch: "dewpider", music: "alTrialSite", waves: [WA("wishiwashi:15", "wishiwashi:15"), WA("dewpider:16")], pre: [
          L("allana", "I'm Lana, the captain here. My trial's up the hill. Oh, and there's a Dewpider in the grass. It wears a bubble of water on its head."),
        ], post: [L("narr", "Gotcha! Dewpider was caught! The bubble on its head lets it breathe on land.")] },
        { id: "j", type: "side", name: "Brooklet Hill: Morelull", lv: 16, env: "forest", wild: 1, catch: "morelull", music: "alTrialSite", waves: [WA("wishiwashi:15"), WA("morelull:16")], pre: [
          L("narr", "When night falls on Brooklet Hill, little lights blink on in the grass: Morelull, glowing as they doze."),
        ], post: [L("narr", "Gotcha! Morelull was caught! Its flashing spores put anything that sees them to sleep.")] },
        { id: "k", type: "boss", name: "Brooklet Hill: Totem Wishiwashi", lv: 20, env: "sea", wild: 1, weather: "rain", badgeWin: 2, reward: { key: "al_fishingrod" }, trainer: totemTR("Wishiwashi", "al_lana"),
          waves: [[...TOT("wishiwashi:20!@sitrusberry", { def: 1 }), ...WA("wishiwashi:18", "alomomola:18")]], pre: [
          L("allana", "This is my trial. Something's been splashing in the water. Chase it to the lake at the top of the hill, and... well, see what happens."),
          L("narr", "Rain starts to fall. The splashing fish gather in the last lake, and gather, and gather, until a school as big as a whale rises out of the water: Totem Wishiwashi."),
        ], post: [
          L("allana", "You did it! The Totem's school scattered back into the lake. Here's your stamp. And a Fishing Rod: you'll catch something big someday. Probably."),
        ] },
        { id: "l", type: "side", name: "Brooklet Hill: Ultra Sun and Ultra Moon's Totem Araquanid", lv: 20, env: "sea", wild: 1, weather: "rain", music: "alTrialSite",
          waves: [[...TOT("araquanid:20!@wacanberry", { spe: 1 }), ...WA("dewpider:18", "masquerain:18")]], pre: [
          L("narr", "In Ultra Sun and Ultra Moon, the rain over Brooklet Hill brings a different Totem out of the lake: Araquanid, its head in a great bubble of water."),
        ] },
        { id: "m", type: "battle", name: "Paniola Ranch: Ultra Recon Squad Dulse", lv: 20, env: "route", music: "alSquad", trainer: TR("Ultra Recon Squad Dulse", "al_dulse", "We study the power you call Z-Power. Let us measure yours, with the Pokémon of our world.", "...The readings are higher than expected."),
          waves: [WA("poipole:20!")], pre: [
          L("narr", "A herd of Sudowoodo blocks the road south of Paniola Ranch. When you clear it, Dulse is waiting, with a small purple Pokémon from beyond an Ultra Wormhole."),
        ] },
        { id: "n", type: "battle", name: "Route 6: Team Skull", lv: 17, env: "route", music: "alSkullAppears", trainer: skullTR("We're just collectin' a toll here! Two Pokémon per person!", "Toll's cancelled. Forever, I guess."),
          waves: [WA("drowzee:17")], pre: [
          L("narr", "Two Grunts are hassling a girl with a big hat and a bigger Mudsdale at the Royal Avenue gate. She says nothing, and battles one of them herself. Her name is Hapu."),
        ] },
        { id: "o", type: "side", name: "Route 6: Oricorio (Pa'u Style)", lv: 16, env: "route", wild: 1, catch: "oricoriopau", music: "alRoute4", waves: [WA("mudbray:15"), WA("oricoriopau:16")], pre: [
          L("narr", "The pink flowers on Route 6 make Oricorio relaxed and dreamy: they sway like hula dancers."),
        ], post: [L("narr", "Gotcha! Oricorio was caught! Pink nectar made it a hula dancer, the Pa'u Style.")] },
      ] },
    { id: "c5", title: "Akala Island: Royal Avenue to Lush Jungle", env: "volcano", map: "volcano", reward: { lmd: 6000, orundum: 400, firestone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Battle Royal Dome: The Battle Royal", lv: 20, env: "city", music: "alRoyalDome", get trainer() { return TR("The Royal, Gladion and Hau", "al_royal", "Welcome, challengers, to the Battle Royal! Four Trainers, one ring, and no friends once the bell rings!", "What a finish! The crowd goes wild!"); },
          rivalWaves: () => [WA("rockruff:20", "typenull:20", hauMon(1) + ":20!")], pre: [
          L("narr", "On Royal Avenue, the Battle Royal Dome roars. A masked wrestler called the Royal pulls you, Hau and Gladion into the ring together."),
          L("alroyal", "In a Battle Royal, every Trainer fights everyone else at once! Show the Dome what you've got!"),
        ], post: [
          L("alkiawe", "That was some battle. I'm Kiawe, a captain. My trial's at Wela Volcano Park. Come and see my dance."),
        ] },
        { id: "b", type: "side", name: "Route 7: Pyukumuku", lv: 17, env: "sea", wild: 1, catch: "pyukumuku", music: "alRoute4", waves: [WA("tentacool:16", "wingull:16"), WA("pyukumuku:17")], pre: [
          L("narr", "Route 7's black-sand beach is covered with Pyukumuku. The locals throw them back into the sea, and they wash right back up."),
        ], post: [L("narr", "Gotcha! Pyukumuku was caught! If you step on it, it punches back with its insides. Really.")] },
        { id: "c", type: "battle", name: "Wela Volcano Park: Salandit", lv: 17, env: "volcano", wild: 1, catch: "salandit", music: "alTrialSite", waves: [WA("cubone:16", "fletchinder:17"), WA("salandit:17")], pre: [
          L("narr", "Steam rises around Wela Volcano Park. A Salandit flicks its tongue from the rocks and breathes out a sweet, poisonous gas."),
        ], post: [L("narr", "Gotcha! Salandit was caught! Its poison gas is sweet-smelling, and it makes its foes dizzy.")] },
        { id: "d", type: "battle", name: "Wela Volcano Park: Hiker David", lv: 19, env: "volcano", music: "alKiaweTrial", trainer: TR("Hiker David", "al_hiker", "You picked me as the odd one out? Ha! Good eye. Now let's battle!", "Whew! I danced my best."),
          waves: [WA("magmar:19")], pre: [
          L("alkiawe", "My trial: watch the dance three times, and tell me what's changed. Whoever you pick, battles you."),
          L("narr", "In the second dance, a Hiker has slipped in among the Alolan Marowak. He's not hard to spot."),
        ] },
        { id: "e", type: "boss", name: "Wela Volcano Park: Totem Alolan Marowak", lv: 22, env: "volcano", wild: 1, badgeWin: 3, trainer: totemTR("Alolan Marowak", "al_kiawe"),
          waves: [[...TOT("marowakalola:22!@thickclub", { spe: 2 }), ...WA("salazzle:20")]], pre: [
          L("narr", "The third dance. One Marowak is bigger than the others, and its flaming bone spins faster. You point at it, and the Totem leaps into battle."),
        ], post: [
          L("alkiawe", "Your eyes, your Pokémon, your heart: all sharp. Here's my stamp. And Charizard will carry you over the island now, whenever you need."),
        ] },
        { id: "f", type: "side", name: "Wela Volcano Park: Sun and Moon's Totem Salazzle", lv: 22, env: "volcano", wild: 1, music: "alTrialSite",
          waves: [[...TOT("salazzle:22!@petayaberry", { sdf: 1 }), ...WA("salandit:20", "salandit:20")]], pre: [
          L("narr", "In Sun and Moon, the dancers at the volcano led to a different Totem: Salazzle, which keeps calling Salandit to its side."),
        ] },
        { id: "g", type: "battle", name: "Route 8: Wimpod", lv: 18, env: "route", wild: 1, catch: "wimpod", music: "alRoute4", waves: [WA("trumbeak:18", "salandit:18"), WA("wimpod:18")], pre: [
          L("narr", "Through Dividing Peak Tunnel and onto Route 8. A scientist from Unova, Colress, stops to talk with the Ultra Recon Squad. A Wimpod scuttles past, terrified of everyone."),
        ], post: [L("narr", "Gotcha! Wimpod was caught! It's the coward of the seashore, and it cleans up whatever it finds.")] },
        { id: "h", type: "side", name: "Route 8: Stufful", lv: 19, env: "route", wild: 1, catch: "stufful", music: "alRoute4", waves: [WA("yungoos:18"), WA("stufful:19")], pre: [
          L("narr", "A Stufful flails its arms when you get close. It's cute, and it's far stronger than it looks."),
        ], post: [L("narr", "Gotcha! Stufful was caught! It hates being touched, and it hits hard when it is.")] },
        { id: "i", type: "battle", name: "Lush Jungle: Passimian", lv: 21, env: "forest", wild: 1, catch: "passimian", music: "alMallowTrial", waves: [WA("trumbeak:20", "fomantis:20"), WA("passimian:21")], pre: [
          L("narr", "The Lush Jungle is green and loud. A troop of Passimian pass a berry from hand to hand, then one turns and charges at you."),
        ], post: [L("narr", "Gotcha! Passimian was caught! Its troop works together, and its berry is its prize.")] },
        { id: "j", type: "side", name: "Lush Jungle: Oranguru (Ultra Moon)", lv: 21, env: "forest", wild: 1, catch: "oranguru", music: "alMallowTrial", waves: [WA("trumbeak:20"), WA("oranguru:21")], pre: [
          L("narr", "In Ultra Moon, the jungle's wise Oranguru sit in the treetops instead, giving orders to the other Pokémon with a fan of leaves."),
        ], post: [L("narr", "Gotcha! Oranguru was caught! It's so wise it will even scold a Trainer who mistreats Pokémon.")] },
        { id: "k", type: "side", name: "Lush Jungle: Comfey", lv: 20, env: "forest", wild: 1, catch: "comfey", music: "alMallowTrial", waves: [WA("fomantis:20"), WA("comfey:20")], pre: [
          L("narr", "A Comfey floats by, trailing a garland of flowers it picked and wove itself."),
        ], post: [L("narr", "Gotcha! Comfey was caught! The scent of its flowers soothes anything nearby.")] },
        { id: "l", type: "side", name: "Lush Jungle: Steenee", lv: 20, env: "forest", wild: 1, catch: "steenee", music: "alMallowTrial", waves: [WA("trumbeak:20"), WA("steenee:20")], pre: [
          L("narr", "A Steenee is bouncing along the path, its sepals swinging. It smells like fruit."),
        ], post: [L("narr", "Gotcha! Steenee was caught! It's full of energy, and it kicks with its strong legs.")] },
        { id: "m", type: "side", name: "Lush Jungle: Bounsweet (Sun and Moon)", lv: 17, env: "forest", wild: 1, catch: "bounsweet", music: "alMallowTrial", waves: [WA("fomantis:17"), WA("bounsweet:17")], pre: [
          L("narr", "In Sun and Moon, little Bounsweet live in the jungle too, giving off a smell so sweet that bird Pokémon carry them off."),
        ], post: [L("narr", "Gotcha! Bounsweet was caught! Its sweet scent is a favorite of Trainers... and of Toucannon.")] },
        { id: "n", type: "boss", name: "Lush Jungle: Totem Lurantis", lv: 24, env: "forest", wild: 1, badgeWin: 4, trainer: totemTR("Lurantis", "al_mallow"),
          waves: [[...TOT("lurantis:24!", { spe: 2 }), ...WA("kecleon:22", "comfey:22")]], pre: [
          L("almallow", "My trial is cooking! Find me a Mago Berry, Honey and a Big Root, and I'll make the Mallow Special. Its smell will bring out the Totem."),
          L("narr", "The pot bubbles. Out of the jungle steps Totem Lurantis, pink blades raised, its aura flickering like sunlight."),
        ], post: [
          L("almallow", "You did it! That was the best ingredient hunt ever. Here's your stamp. Akala's grand trial is next!"),
        ] },
        { id: "o", type: "side", name: "Lush Jungle: Sun and Moon's Totem Lurantis", lv: 24, env: "forest", wild: 1, music: "alMallowTrial",
          waves: [[...TOT("lurantis:24!", { spe: 2 }), ...WA("trumbeak:22", "castform:22")]], pre: [
          L("narr", "In Sun and Moon, Totem Lurantis called different allies to the pot: a Trumbeak, and a Castform to bring out the sun."),
        ] },
      ] },
    { id: "c6", title: "Akala Island: Konikoni City and the Ruins of Life", env: "city", map: "city", reward: { lmd: 7000, orundum: 500, moonstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "Heahea City: The Dimensional Research Lab", music: "alBurnet", pre: [
          L("alburnet", "Welcome to the Dimensional Research Lab! I'm Burnet, and yes, I'm married to Kukui. We study Ultra Space: other worlds, beyond holes in the sky."),
          L("alburnet", "Sometimes, the creatures of those worlds come through. We call them Ultra Beasts. Nobody really knows what they want."),
          L("allillie", "...Nebby came from a place like that. I'm sure of it."),
        ] },
        { id: "b", type: "battle", name: "Diglett's Tunnel: Team Skull", lv: 23, env: "cave", music: "alCave", trainer: skullTR("Two of you? Fine! Two of us! Team Skull tag-team, let's go!", "Our tag-team got tagged..."),
          waves: [WA("ekans:23", "salandit:23")], pre: [
          L("narr", "Two Grunts block the far end of Diglett's Tunnel. Hau steps up beside you: this one's a double."),
        ] },
        { id: "c", type: "story", name: "Konikoni City", music: "alKonikoni", reward: { thunderstone: 1 }, pre: [
          L("narr", "Konikoni City glows with lanterns. A detective in a trench coat gives you a Thunder Stone and says he's here on business, Ultra-sized business."),
          L("narr", "At the jewelry shop, Olivia's Probopass hands you a note: the kahuna is waiting at the Ruins of Life."),
        ] },
        { id: "d", type: "battle", name: "Memorial Hill: Team Skull", lv: 24, env: "route", music: "alSkullAppears", trainer: skullTR("This Slowpoke is Team Skull property now. Back off!", "Ugh, Aether showed up AND you showed up?"),
          waves: [WA("raticatealola:24")], pre: [
          L("narr", "On Memorial Hill, a man in a white coat waves you over. He's Faba, of the Aether Foundation, and a Grunt has a wild Slowpoke cornered."),
          L("alfaba", "Do deal with that ruffian. The Aether Foundation protects Pokémon, of course, but I protect my lab coat."),
        ] },
        { id: "e", type: "boss", name: "Akala Outskirts: Team Skull Admin Plumeria", lv: 27, env: "route", music: "alSkullAppears", trainer: TR("Team Skull Admin Plumeria", "al_plumeria", "So you're the kid who keeps beating my Grunts. They're idiots, but they're my idiots.", "Hmph. Not bad. You'll see me again."),
          waves: [WA("golbat:26", "salandit:27!")], pre: [
          L("alplumeria", "I'm Plumeria. The Grunts call me Big Sis. Let's see what you've got."),
        ] },
        { id: "f", type: "boss", name: "Ruins of Life: Kahuna Olivia's Grand Trial", lv: 28, env: "cave", badgeWin: 5, music: "alKahunaTheme", trainer: TR("Island Kahuna Olivia", "al_olivia", "I'm Olivia, kahuna of Akala. Rocks are like people: you have to polish them to see them shine. Let's polish!", "Ah, what a brilliant shine. You've earned Akala's blessing."),
          waves: [WA("anorith:27", "lileep:27"), WA("lycanrocmidnight:28!")], pre: [
          L("narr", "Inside the Ruins of Life, beneath Tapu Lele's shrine, Olivia waits. Lillie is there too, with Professor Burnet, to cheer you on."),
        ], post: [
          L("alolivia", "The Akala Stamp is yours. Two islands down, two to go."),
        ] },
        { id: "g", type: "side", name: "Hano Beach: Sandygast", lv: 23, env: "sea", wild: 1, catch: "sandygast", music: "alBeach", waves: [WA("pyukumuku:22"), WA("sandygast:23")], pre: [
          L("narr", "On Hano Beach, a sandcastle with a shovel stuck in it turns around and looks at you. It's a Sandygast."),
        ], post: [L("narr", "Gotcha! Sandygast was caught! It controls anyone who puts a hand in its mouth.")] },
      ] },
    { id: "c7", title: "Aether Paradise", env: "plant", map: "city", reward: { lmd: 7000, orundum: 500 },
      nodes: [
        { id: "a", type: "story", name: "Hano Grand Resort", music: "alShip", pre: [
          L("alfaba", "Congratulations on your grand trial. The Aether Foundation would be honored to show you our home: Aether Paradise. My ferry is at your disposal."),
          L("allillie", "I... think I'll stay here. Please, go without me."),
        ] },
        { id: "b", type: "story", name: "Aether Paradise: President Lusamine", music: "alAether", pre: [
          L("alwicke", "Welcome! I'm Wicke. Aether Paradise is a sanctuary for Pokémon that were hurt, or abandoned. Our president will be so glad to meet you."),
          L("allusamine", "How lovely. I'm Lusamine. I love every Pokémon, every one... and I protect them all."),
        ] },
        { id: "c", type: "boss", name: "Aether Paradise: An Ultra Beast", lv: 27, env: "plant", wild: 1, music: "alWormhole", waves: [TOT("nihilego:27!", { def: 2 })], pre: [
          L("narr", "The air above the conservation deck tears open. Something like a jellyfish made of glass drifts out of the hole: an Ultra Beast. The Aether Paradise's walls block every Poké Ball."),
        ], post: [
          L("narr", "The Ultra Beast slips back through the wormhole. The Ultra Recon Squad pull off their masks."),
          L("aldulse", "We come from Ultra Megalopolis. Once, our world was full of light. Then a Pokémon called Necrozma stole it. We came here to keep it from stealing yours."),
          L("allusamine", "Then the Aether Foundation and the Ultra Recon Squad will protect Alola together. Wicke, see our guests to Ula'ula."),
        ] },
      ] },
    { id: "c8", title: "Ula'ula Island: Malie City and Mount Hokulani", env: "city", map: "city", reward: { lmd: 8000, orundum: 500, thunderstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Malie City: Hau", lv: 30, env: "city", music: "alMalie", get trainer() { return hauTR("I caught some new partners on Akala! Ready to see them?", "You're too much! I'm gonna get stronger, you'll see!"); },
          rivalWaves: () => [WA(hauEevee() + ":28", "noibat:28", "tauros:28"), WA("raichualola:29", hauMon(1) + ":30!")] },
        { id: "b", type: "battle", name: "Malie City: Team Skull", lv: 28, env: "city", music: "alSkullAppears", trainer: skullTR("Wanna buy a Strange Souvenir? No? Then battle me!", "Fine, I'll give it to you. Dang it."),
          waves: [WA("mareanie:28")] },
        { id: "c", type: "story", name: "Malie Garden and the Library", music: "alMalie", pre: [
          L("alkukui", "Ula'ula's my favorite island, cousin. See that mountain? Mount Lanakila. I'm building something up there. Something big."),
          L("narr", "In Malie Library, Lillie looks for a book about the legends of Alola. A girl with a big hat, Hapu, and a girl in a patched dress, Acerola, find it for her."),
        ] },
        { id: "d", type: "side", name: "Malie Garden: Araquanid", lv: 26, env: "forest", wild: 1, catch: "araquanid", music: "alMalie", waves: [WA("meowthalola:25"), WA("araquanid:26")], pre: [
          L("narr", "Among the garden's ponds, an Araquanid floats in its water bubble, watching over a little Dewpider."),
        ], post: [L("narr", "Gotcha! Araquanid was caught! It uses its bubble as a weapon, or to protect its young.")] },
        { id: "e", type: "battle", name: "Route 10: Team Skull", lv: 29, env: "route", music: "alSkullAppears", trainer: skullTR("We're stealin' the bus stop sign! Without it, no bus! No bus, no Trainers! Genius!", "...Okay, we'll put it back.", "Team Skull Grunts"),
          waves: [WA("houndour:29"), WA("golbat:29")] },
        { id: "f", type: "battle", name: "Mount Hokulani: Minior", lv: 28, env: "plateau", wild: 1, catch: "minior", music: "alRoute10", waves: [WA("skarmory:27", "fearow:27"), WA("minior:28")], pre: [
          L("narr", "The Exeggutor Express drops you on Mount Hokulani. Rocky shells lie in the grass, fallen from the sky: Minior, waiting for their shells to break."),
        ], post: [L("narr", "Gotcha! Minior was caught! It comes from the ozone layer, and its core is the color of what it ate.")] },
        { id: "g", type: "battle", name: "Hokulani Observatory: The Pinger", lv: 30, env: "plant", wild: 1, music: "alBurnet", waves: [WA("elekid:29"), WA("electabuzz:30")], pre: [
          L("alsophocles", "My trial! Line up the Charjabug on the Roller to power the Pinger. When it pings, Pokémon come. That's... the theory."),
          L("narr", "The first two lines of Charjabug light the Pinger up, and wild Electric types come running at the signal."),
        ] },
        { id: "h", type: "boss", name: "Hokulani Observatory: Totem Vikavolt", lv: 29, env: "plant", wild: 1, badgeWin: 6, trainer: totemTR("Vikavolt", "al_sophocles"),
          waves: [[...TOT("vikavolt:29!@occaberry", ALL1), ...WA("charjabug:28", "charjabug:28")]], pre: [
          L("narr", "The third line overloads the Pinger. With a crackle, a huge Vikavolt buzzes down from the dome, drawn by the power, two Charjabug charging along behind it."),
        ], post: [
          L("alsophocles", "The Totem's drained the Pinger... but you cleared it! Here's your stamp. Now I have to fix everything."),
        ] },
        { id: "i", type: "side", name: "Hokulani Observatory: Ultra Sun and Ultra Moon's Totem Togedemaru", lv: 33, env: "plant", wild: 1, music: "alBurnet",
          waves: [[...TOT("togedemaru:33!@sitrusberry", { def: 2 }), ...WA("skarmory:32", "dedenne:31")]], pre: [
          L("narr", "In Ultra Sun and Ultra Moon, the overloaded Pinger draws a Totem Togedemaru instead, which soaks up the blast with its Lightning Rod."),
        ] },
        { id: "j", type: "boss", name: "Malie Garden: Team Skull Boss Guzma", lv: 34, env: "forest", music: "alGuzma", trainer: TR("Team Skull Boss Guzma", "al_guzma", "Guzma! What is wrong with you? Destruction in human form, that's me. And I'm gonna wreck you.", "...Again! Another loss! What's wrong with me?!"),
          waves: [WA("masquerain:34", "golisopod:34!")], pre: [
          L("narr", "In the tea garden, a tall man with white hair and a yellow-and-black jacket is taunting Kukui. He's Guzma, the boss of Team Skull."),
          L("alkukui", "Long time, Guzma. Cousin, battle him for me, yeah? Show him what the island challenge does for a Trainer."),
        ] },
        { id: "k", type: "side", name: "Route 11: Komala", lv: 27, env: "route", wild: 1, catch: "komala", music: "alRoute10", waves: [WA("trumbeak:26"), WA("komala:27")], pre: [
          L("narr", "A Komala hangs from a branch by Route 11, hugging a log. It's asleep. It's always asleep."),
        ], post: [L("narr", "Gotcha! Komala was caught! It spends its whole life asleep, clinging to its log.")] },
        { id: "l", type: "side", name: "Route 11: Shiinotic", lv: 27, env: "forest", wild: 1, catch: "shiinotic", music: "alRoute10", waves: [WA("trumbeak:26"), WA("shiinotic:27")], pre: [
          L("narr", "At night on Route 11, eerie lights wobble through the trees: Shiinotic, luring lost travelers to sleep."),
        ], post: [L("narr", "Gotcha! Shiinotic was caught! Its flashing lights confuse its prey, and it drains their energy.")] },
        { id: "m", type: "side", name: "Route 12: Alolan Graveler", lv: 30, env: "route", wild: 1, catch: "graveleralola", music: "alRoute10", waves: [WA("mudbray:29"), WA("graveleralola:30")], pre: [
          L("narr", "Route 12's rocks crackle with electricity. One of them gets up and walks: an Alolan Graveler, eating dravite crystals."),
        ], post: [L("narr", "Gotcha! Alolan Graveler was caught! The crystals it eats make it magnetic.")] },
        { id: "n", type: "side", name: "Blush Mountain: Togedemaru", lv: 30, env: "plant", wild: 1, catch: "togedemaru", music: "alRoute10", waves: [WA("charjabug:29"), WA("togedemaru:30")], pre: [
          L("narr", "Around Blush Mountain's power plant, Togedemaru curl up and catch the lightning on their spines."),
        ], post: [L("narr", "Gotcha! Togedemaru was caught! The long spine on its back works as a lightning rod.")] },
        { id: "o", type: "side", name: "Blush Mountain: Turtonator", lv: 30, env: "volcano", wild: 1, catch: "turtonator", music: "alRoute10", waves: [WA("graveleralola:29"), WA("turtonator:30")], pre: [
          L("narr", "A Turtonator lies on Blush Mountain's warm slope. The spikes on its shell explode at the slightest touch."),
        ], post: [L("narr", "Gotcha! Turtonator was caught! Its shell is coated in explosive sulfur.")] },
        { id: "p", type: "side", name: "Blush Mountain: Charjabug", lv: 30, env: "plant", wild: 1, catch: "charjabug", music: "alRoute10", waves: [WA("togedemaru:29"), WA("charjabug:30")], pre: [
          L("narr", "A Charjabug is plugged into nothing at all, humming. Blush Mountain's magnetic field charges it up."),
        ], post: [L("narr", "Gotcha! Charjabug was caught! It stores electricity in its body, like a battery.")] },
      ] },
    { id: "c9", title: "Ula'ula Island: Tapu Village and Acerola's Trial", env: "route", map: "route", reward: { lmd: 9000, orundum: 600, duskstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "Route 13 and Tapu Village", music: "alSquad", pre: [
          L("algladion", "Lillie's here on Ula'ula? Then keep her and her Cosmog away from Team Skull. Promise me."),
          L("alphyco", "Long ago, Necrozma came to Alola, right here. The guardian deities fought it. Our ancestors sealed it in Megalo Tower... until it broke free."),
        ] },
        { id: "b", type: "battle", name: "Tapu Village: Alolan Vulpix", lv: 31, env: "ice", wild: 1, catch: "vulpixalola", music: "alRoute10", waves: [WA("gumshoos:30"), WA("vulpixalola:31")], pre: [
          L("narr", "Snow drifts down from Mount Lanakila onto Tapu Village. An Alolan Vulpix, white as the snow, breathes out a puff of ice."),
        ], post: [L("narr", "Gotcha! Alolan Vulpix was caught! In Alola's mountains, Vulpix learned to breathe ice instead of fire.")] },
        { id: "c", type: "side", name: "Tapu Village: Alolan Sandshrew (Ultra Moon)", lv: 31, env: "ice", wild: 1, catch: "sandshrewalola", music: "alRoute10", waves: [WA("gumshoos:30"), WA("sandshrewalola:31")], pre: [
          L("narr", "In Ultra Moon, the snowy village is home to Alolan Sandshrew instead, rolling in the snow with their shells of ice."),
        ], post: [L("narr", "Gotcha! Alolan Sandshrew was caught! Its shell is made of hard ice.")] },
        { id: "d", type: "side", name: "Haina Desert: Alolan Dugtrio", lv: 33, env: "cave", wild: 1, weather: "sand", catch: "dugtrioalola", music: "alHaina", waves: [WA("dugtrioalola:32"), WA("dugtrioalola:33")], pre: [
          L("narr", "Haina Desert's sandstorm never stops. Three golden-haired heads pop up from the sand, and down again."),
        ], post: [L("narr", "Gotcha! Alolan Dugtrio was caught! Its golden hair is said to bring good luck.")] },
        { id: "e", type: "battle", name: "Route 15: Team Skull", lv: 33, env: "route", music: "alAetherHouse", trainer: skullTR("The girl with the Cosmog's comin' with us! Out of the way!", "Okay, okay, we're goin'!"),
          waves: [WA("drowzee:33")], pre: [
          L("narr", "The Aether House on Route 15 is a home for children and Pokémon with nowhere else to go. Acerola, who grew up there, says she's Ula'ula's Trial Captain."),
          L("narr", "As you leave, a Grunt grabs for Lillie's bag. Nebby squeaks inside it."),
        ] },
        { id: "f", type: "side", name: "Route 14: Bruxish", lv: 32, env: "sea", wild: 1, catch: "bruxish", music: "alRoute10", waves: [WA("wishiwashi:31"), WA("bruxish:32")], pre: [
          L("narr", "Off Route 14's shore, something grinds its teeth so loudly you can hear it from the beach. A Bruxish surfaces, glaring."),
        ], post: [L("narr", "Gotcha! Bruxish was caught! It grinds its teeth to send out psychic waves.")] },
        { id: "g", type: "battle", name: "Thrifty Megamart: The Ghosts", lv: 30, env: "tower", wild: 1, music: "alAcerolaTrial", waves: [WA("gastly:30", "haunter:30", "gengar:30")], pre: [
          L("alacerola", "Surprise! I'm Acerola, the captain of Ula'ula. My trial is in the old Thrifty Megamart. Take pictures of the ghosts inside with your Poké Finder. If you dare!"),
          L("narr", "A conveyor belt moves by itself. A shopping cart rattles. Dolls float off the shelves. Every ghost you photograph attacks."),
        ] },
        { id: "h", type: "boss", name: "Thrifty Megamart: Totem Mimikyu", lv: 35, env: "tower", wild: 1, badgeWin: 7, trainer: totemTR("Mimikyu", "al_acerola"),
          waves: [[...TOT("mimikyu:35!@lumberry", ALL1), ...WA("banette:32", "jellicent:33")]], pre: [
          L("narr", "In the back room, the Poké Finder won't close. Something is standing right behind you. You turn: a Mimikyu, huge, its cloth head tilted."),
        ], post: [
          L("alacerola", "You cleared it! Here's your stamp. ...Hey, wait. That back room? This building never had a back room."),
        ] },
        { id: "i", type: "side", name: "Thrifty Megamart: Sun and Moon's Totem Mimikyu", lv: 33, env: "tower", wild: 1, music: "alAcerolaTrial",
          waves: [[...TOT("mimikyu:33!@lumberry", ALL1), ...WA("haunter:27", "gengar:27")]], pre: [
          L("narr", "In Sun and Moon, the Totem Mimikyu in the back room called Gastly's evolved kin to help: a Haunter and a Gengar."),
        ] },
        { id: "j", type: "side", name: "Thrifty Megamart: Mimikyu", lv: 32, env: "tower", wild: 1, catch: "mimikyu", music: "alAcerolaTrial", waves: [WA("haunter:31"), WA("mimikyu:32")], pre: [
          L("narr", "With the trial over, the Megamart's ghosts are still there. Mimikyu shuffle down the aisles in their homemade Pikachu disguises."),
        ], post: [L("narr", "Gotcha! Mimikyu was caught! It just wants to be loved, so it dresses up like Pikachu.")] },
        { id: "k", type: "boss", name: "Route 15: Team Skull Admin Plumeria", lv: 38, env: "route", music: "alAetherHouse", trainer: TR("Team Skull Admin Plumeria", "al_plumeria", "You've been pushing Team Skull around all over Alola. That ends now.", "...You win. But Team Skull doesn't give up."),
          waves: [WA("golbat:37", "salazzle:38!")], pre: [
          L("narr", "Back at the Aether House, Plumeria's Grunts are everywhere. Hau and Acerola take them on while you face Plumeria."),
        ], post: [
          L("alplumeria", "We took a kid's Yungoos. Want it back? Come to Po Town. If you've got the guts."),
        ] },
      ] },
    { id: "c10", title: "Ula'ula Island: Po Town and Nanu's Grand Trial", env: "city", map: "city", reward: { lmd: 10000, orundum: 600, linkcord: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 16: Team Skull", lv: 35, env: "route", music: "alSkullAppears", trainer: skullTR("Skull's takin' over this Pokémon Center's café! The Moomoo Milk's ours!", "Fine! Drink your milk!"),
          waves: [WA("trubbish:35")] },
        { id: "b", type: "battle", name: "Ula'ula Meadow: Ribombee", lv: 34, env: "forest", wild: 1, catch: "ribombee", music: "alRoute10", waves: [WA("oricorio:33", "oricorio:33"), WA("ribombee:34")], pre: [
          L("narr", "Ula'ula Meadow is a sea of red flowers. Ribombee roll pollen into little balls, and fiery Oricorio dance in the petals."),
        ], post: [L("narr", "Gotcha! Ribombee was caught! Its pollen puffs can heal, or knock a foe out.")] },
        { id: "c", type: "side", name: "Ula'ula Meadow: Oricorio (Baile Style)", lv: 34, env: "forest", wild: 1, catch: "oricorio", music: "alRoute10", waves: [WA("ribombee:33"), WA("oricorio:34")], pre: [
          L("narr", "The red nectar makes Oricorio passionate, stamping and flaring like flamenco dancers."),
        ], post: [L("narr", "Gotcha! Oricorio was caught! Red nectar made it a fiery dancer, the Baile Style.")] },
        { id: "d", type: "battle", name: "Route 17: Team Skull's Gate", lv: 36, env: "route", weather: "rain", music: "alSkullAppears", trainer: skullTR("Po Town's Team Skull turf! Nobody gets in!", "Go on, then. Go see the boss. Your funeral.", "Team Skull Grunts"),
          waves: [WA("rattataalola:36", "haunter:36"), WA("mareanie:36", "grimeralola:36"), WA("pawniard:36", "scraggy:36")], pre: [
          L("narr", "Rain pours down on Route 17. An officer in a dingy police station waves you on with a sigh. At the gate to Po Town, Grunts stand in a line."),
        ] },
        { id: "e", type: "battle", name: "Po Town: Team Skull", lv: 37, env: "city", weather: "rain", music: "alPoTown", trainer: skullTR("Welcome to Po Town! We trashed it ourselves!", "Ugh, go away! The boss is in the big house!", "Team Skull Grunts"),
          waves: [WA("spinarak:36", "trubbish:36"), WA("drowzee:37", "golbat:37"), WA("ekans:37", "salandit:37")], pre: [
          L("narr", "Po Town is surrounded by a wall and covered in graffiti. Its Pokémon Center's nurse is a Grunt: healing costs ten dollars."),
        ] },
        { id: "f", type: "battle", name: "Shady House: Team Skull", lv: 38, env: "tower", music: "alPoTown", trainer: skullTR("Password? You don't know the password? Then BATTLE!", "...The password's 'Guzma Is the Greatest'. Okay, go.", "Team Skull Grunts"),
          waves: [WA("drowzee:38", "fomantis:38"), WA("trubbish:38", "houndour:38"), WA("haunter:38", "grimeralola:38")] },
        { id: "g", type: "boss", name: "Shady House: Team Skull Boss Guzma", lv: 41, env: "tower", music: "alGuzma", trainer: TR("Team Skull Boss Guzma", "al_guzma", "You came all the way to Po Town for a Yungoos? Fine. Guzma's gonna make it worth the trip!", "Every time... Take the stupid Yungoos."),
          waves: [WA("masquerain:41", "pinsir:41", "golisopod:41!")], pre: [
          L("alguzma", "Big bad Guzma's sitting on his throne, and you just walked in. Bold."),
        ] },
        { id: "h", type: "battle", name: "Aether House: Gladion", lv: 43, env: "city", music: "alGladion", get trainer() { return gladionTR("Plumeria took Lillie. She took her to the Aether Foundation. Battle me. I need to know you can help me get her back.", "...You'll do. Let's go."); },
          rivalWaves: () => [WA("golbat:42", "zoroark:42", "typenull:43!")], pre: [
          L("alhau", "Lillie's gone! The Yungoos was a trick to get you away from her. Team Skull took her and Nebby!"),
        ], post: [
          L("alnanu", "Kid. That cop in the rain on Route 17? That's me. Nanu, Ula'ula's kahuna. If you want to save her, you'd better pass my grand trial first."),
        ] },
        { id: "i", type: "boss", name: "Malie City: Kahuna Nanu's Grand Trial", lv: 44, env: "city", badgeWin: 8, music: "alNanu", trainer: TR("Island Kahuna Nanu", "al_nanu", "I never wanted to be kahuna. Tapu Bulu picked me anyway. Let's get this over with, kid.", "...Huh. You're the real thing. Go get her."),
          waves: [WA("sableye:43", "krokorok:43"), WA("persianalola:44!")], pre: [
          L("narr", "Nanu meets you by Malie City's pier at sunset, an Alolan Persian at his feet."),
        ], post: [
          L("alnanu", "The Ula'ula Stamp. Gladion's got a boat waiting. Aether Paradise. Don't be late."),
        ] },
      ] },
    { id: "c11", title: "Aether Paradise: The Rescue", env: "plant", map: "city", reward: { lmd: 11000, orundum: 600 },
      nodes: [
        { id: "a", type: "battle", name: "Aether Paradise: The Docks", lv: 41, env: "plant", music: "alInfiltration", trainer: TR("Aether Foundation Employees", "al_employee", "Intruders at the docks! By order of the president, you will not pass!", "We can't hold them!"),
          waves: [WA("dugtrioalola:40", "toucannon:40"), WA("kecleon:40", "stoutland:40"), WA("primeape:40", "arcanine:41!")], pre: [
          L("narr", "Gladion's boat slips into Aether Paradise's docks. The Employees who smiled at you last time stand in your way."),
        ] },
        { id: "b", type: "boss", name: "Aether Paradise: Branch Chief Faba", lv: 43, env: "plant", music: "alAetherEyes", trainer: TR("Aether Branch Chief Faba", "al_faba", "The president is very busy. Busy with matters far beyond children. I shall dismiss you.", "Impossible! My genius, defeated by a child?"),
          waves: [WA("hypno:43!")] },
        { id: "c", type: "battle", name: "Aether Paradise: The Secret Labs", lv: 41, env: "plant", music: "alAetherLabs", trainer: TR("Aether Foundation Employees", "al_employeef", "These labs are off limits! Especially Lab B!", "The files... they'll see the files..."),
          waves: [WA("mukalola:41", "magneton:41", "porygon2:41"), WA("huntail:41", "gorebyss:41")], pre: [
          L("narr", "Faba sends you down to the labs: a trick to buy time. In Lab B, you and Hau find the files on Cosmog, and on the Ultra Beasts Lusamine has been calling into Alola."),
        ] },
        { id: "d", type: "battle", name: "Aether Paradise: The Entrance", lv: 42, env: "plant", music: "alInfiltration", trainer: TR("Aether Foundation Employees", "al_employee", "We protect Pokémon! And the president! Mostly the president!", "Please... let the president explain..."),
          waves: [WA("anorith:41", "lileep:41"), WA("magmar:42", "houndoom:42"), WA("electabuzz:42", "manectric:42")], pre: [
          L("narr", "Wicke heals your team in secret. Gladion fights beside you now, then Hau: two Multi Battles on the way back up."),
        ] },
        { id: "e", type: "boss", name: "Aether Paradise: Faba and an Employee", lv: 45, env: "plant", music: "alAetherEyes", trainer: TR("Aether Branch Chief Faba and an Employee", "al_faba", "Then we shall battle two against two! My genius, doubled!", "...The key to the mansion. Take it, and be gone."),
          waves: [WA("ledian:42", "pupitar:42"), WA("claydol:44", "bruxish:44", "hypno:45!")], pre: [
          L("narr", "Faba blocks the elevator with an Employee at his side. Hau steps up beside you."),
        ] },
        { id: "f", type: "battle", name: "Lusamine's Mansion: Team Skull", lv: 42, env: "city", music: "alSkullAppears", trainer: skullTR("Team Skull works for Aether now! The boss says so!", "The boss... he's gonna be mad...", "Team Skull Grunts"),
          waves: [WA("golbat:42", "raticatealola:42")] },
        { id: "g", type: "boss", name: "Lusamine's Mansion: Team Skull Boss Guzma", lv: 45, env: "city", music: "alGuzma", trainer: TR("Team Skull Boss Guzma", "al_guzma", "Lusamine said I could be her number one. Nobody's taking that from me. Nobody!", "...Why? Why can't I ever win?!"),
          waves: [WA("masquerain:45", "pinsir:45", "vikavolt:45"), WA("golisopod:45!")], pre: [
          L("narr", "Guzma has just beaten Gladion. Team Skull and the Aether Foundation were working together all along."),
        ] },
        { id: "h", type: "battle", name: "Lusamine's Mansion: Ultra Recon Squad Dulse", lv: 47, env: "city", music: "alSquad", trainer: TR("Ultra Recon Squad Dulse", "al_dulse", "We trusted the president. Now she means to go after Necrozma alone. We must see if you can stop her.", "Then go. Quickly."),
          waves: [WA("poipole:47!")] },
        { id: "i", type: "boss", name: "Lusamine's Mansion: Aether President Lusamine", lv: 47, env: "city", music: "alLusamine", trainer: TR("Aether President Lusamine", "al_lusamine", "Necrozma, the Blinding One. It is beautiful, and it is mine to protect. Not yours. Not the Squad's. Mine!", "How dare you... Oh, how ugly. How very ugly."),
          waves: [WA("clefable:47", "lilligant:47", "lopunny:47"), WA("milotic:47", "bewear:47!")], pre: [
          L("allusamine", "Lillie, my darling, is right here. And her Cosmog is the key to Ultra Space. I'll use it to find Necrozma myself."),
        ] },
        { id: "j", type: "chest", name: "Lusamine Opens the Ultra Wormhole", reward: { gold5: 1, lmd: 3000, key: "al_moonflute" }, music: "alLusamineWormhole", pre: [
          L("narr", "Lusamine forces Nebby to open an Ultra Wormhole. She and Guzma step through it and are gone. Nebby, drained, curls into a hard golden shell: Cosmoem."),
          L("allillie", "I'm going after my mother. Nebby can take us there, once it's... grown. Will you come with me?"),
          L("algladion", "Take my Master Ball. You'll need it more than I do. Lillie... be careful."),
          L("allillie", "And take this: the Moon Flute. The legends say the two flutes, played together at the Altar of the Sunne, call the Legendary Pokémon. The Sun Flute is somewhere on Poni Island."),
        ] },
      ] },
    { id: "c12", title: "Poni Island: Vast Poni Canyon and Necrozma", env: "cave", map: "cave", reward: { lmd: 12000, orundum: 600, dawnstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "Seafolk Village", music: "alSeafolk", pre: [
          L("narr", "Seafolk Village is built on boats. Lillie carries Cosmoem in her bag, quiet now. A girl in paint-splashed clothes waves from a rooftop."),
          L("almina", "Hi! I'm Mina. I'm a captain too, sort of. Poni's legends say the Altar of the Sunne is where the Legendary Pokémon comes. You'll need two flutes."),
        ] },
        { id: "b", type: "chest", name: "Seafolk Village: An Aerodactyl", reward: { op: "aerodactyl", lmd: 2000 }, music: "alSeafolk", pre: [
          L("narr", "An Ace Trainer in the village gives you an Aerodactyl, revived from a fossil: an ancient Pokémon first found in Kanto."),
        ] },
        { id: "c", type: "side", name: "Seafolk Village: Dhelmise", lv: 45, env: "sea", wild: 1, catch: "dhelmise", music: "alSeafolk", waves: [WA("wishiwashi:44"), WA("dhelmise:45")], pre: [
          L("narr", "A fishing line from the village dock snags on something heavy. It's an anchor, tangled in seaweed, and it's moving."),
        ], post: [L("narr", "Gotcha! Dhelmise was caught! The seaweed is the real Pokémon; the anchor is just its weapon.")] },
        { id: "d", type: "story", name: "Ruins of Hope: Tapu Fini", music: "alRuins", pre: [
          L("alhapu", "Poni's had no kahuna for years. Tapu Fini hasn't picked one. ...Hm? Tapu Fini? It's giving me a Sparkling Stone?"),
          L("narr", "Tapu Fini rises from the mist of its ruins and names Hapu kahuna of Poni. The Sun Flute, she says, lies on Exeggutor Island."),
        ] },
        { id: "e", type: "battle", name: "Exeggutor Island: Alolan Exeggutor", lv: 43, env: "route", wild: 1, catch: "exeggutoralola", music: "alPoni", reward: { key: "al_sunflute" }, waves: [WA("pinsir:42", "pinsir:43"), WA("exeggutoralola:43")], pre: [
          L("narr", "Exeggutor Island is crowded with Alolan Exeggutor, tall as palm trees, and a few Pinsir pestering them. One Exeggutor lifts you up to the summit, where the Sun Flute waits."),
        ], post: [L("narr", "Gotcha! Alolan Exeggutor was caught! Alola's sun made it grow tall, and its tail is a head too.")] },
        { id: "f", type: "battle", name: "Ancient Poni Path: Team Skull's Last Stand", lv: 45, env: "route", music: "alPoni", trainer: skullTR("Where's the boss? Where's Guzma?! You did somethin' to him!", "...He's gone. The boss is really gone.", "Team Skull Grunts"),
          waves: [WA("ekans:45"), WA("fomantis:45", "raticatealola:45", "mareanie:45"), WA("golbat:45", "houndour:45")], post: [
          L("alplumeria", "That's enough. Stand down. ...Sorry. Guzma went with Lusamine. Please, if you find him, bring him home."),
        ] },
        { id: "g", type: "battle", name: "Vast Poni Canyon: Ultra Recon Squad Dulse", lv: 49, env: "cave", music: "alSquad", trainer: TR("Ultra Recon Squad Dulse", "al_dulse", "Necrozma is near. We can feel it. You are our only hope now. Prove it, one last time.", "...Yes. You can do it. You must."),
          waves: [WA("poipole:49!")] },
        { id: "h", type: "battle", name: "Vast Poni Canyon: Hakamo-o", lv: 44, env: "cave", wild: 1, catch: "hakamoo", music: "alCanyon", waves: [WA("dugtrioalola:43", "lycanroc:44"), WA("hakamoo:44")], pre: [
          L("narr", "Vast Poni Canyon is Alola's first trial site. Jangmo-o train on its ledges, and when one is in trouble, a scale-clad Hakamo-o answers its call."),
        ], post: [L("narr", "Gotcha! Hakamo-o was caught! It clangs its scales together before it battles.")] },
        { id: "i", type: "side", name: "Vast Poni Canyon: Lycanroc (Midday Form)", lv: 44, env: "cave", wild: 1, catch: "lycanroc", music: "alCanyon", waves: [WA("dugtrioalola:43"), WA("lycanroc:44")], pre: [
          L("narr", "By day, Midday Form Lycanroc hunt in the canyon, fast and silent."),
        ], post: [L("narr", "Gotcha! Lycanroc was caught! It strikes so fast its foes don't see it coming.")] },
        { id: "j", type: "side", name: "Vast Poni Canyon: Lycanroc (Midnight Form)", lv: 44, env: "cave", wild: 1, catch: "lycanrocmidnight", music: "alCanyon", waves: [WA("dugtrioalola:43"), WA("lycanrocmidnight:44")], pre: [
          L("narr", "By night, Midnight Form Lycanroc stalk the canyon instead: fierce, and willing to take a hit to land one."),
        ], post: [L("narr", "Gotcha! Lycanroc was caught! The angrier it gets, the stronger it hits.")] },
        { id: "k", type: "battle", name: "Vast Poni Canyon: The Trial's Dragons", lv: 44, env: "cave", wild: 1, music: "alCanyon", waves: [WA("jangmoo:42"), WA("hakamoo:44")], pre: [
          L("narr", "The canyon's trial has no captain. Its Dragon types leap down on you as you climb toward the pedestal at the top."),
        ] },
        { id: "l", type: "boss", name: "Vast Poni Canyon: Totem Kommo-o", lv: 49, env: "cave", wild: 1, badgeWin: 9, trainer: totemTR("Kommo-o", "al_trialguide"),
          waves: [[...TOT("kommoo:49!@roseliberry", ALL1), ...WA("noivern:48", "scizor:46")]], pre: [
          L("narr", "At the pedestal, scales clatter like a drum. Totem Kommo-o steps out of the shadows, its aura burning. This is the oldest trial in Alola."),
        ], post: [
          L("narr", "The trial is cleared. No captain is here to say it, but the Vast Poni Stamp is yours."),
        ] },
        { id: "m", type: "side", name: "Vast Poni Canyon: Sun and Moon's Totem Kommo-o", lv: 45, env: "cave", wild: 1, music: "alCanyon",
          waves: [[...TOT("kommoo:45!@mentalherb", ALL1), ...WA("hakamoo:32", "scizor:32")]], pre: [
          L("narr", "In Sun and Moon, the canyon's Totem Kommo-o called a Hakamo-o of its own line to its side."),
        ] },
        { id: "n", type: "boss", name: "Altar of the Sunne: Necrozma", lv: 50, env: "tower", wild: 1, music: "alLegendAppears", waves: [WA("necrozmaduskmane:50!")], pre: [
          L("narr", "You and Lillie play the two flutes. Cosmoem glows, and Solgaleo, the Legendary Pokémon of the sun, rises over the altar. It's Nebby."),
          L("narr", "An Ultra Wormhole splits the sky. Lusamine and Guzma fall out of it, beaten. And behind them comes Necrozma. It tears into Nebby, and takes its body for its own."),
        ], post: [
          L("narr", "Necrozma flees into the sky, still fused with Nebby. Alola goes dark. Ultra Wormholes open everywhere."),
          L("aldulse", "We will not help the president. But we will help you. Take our Lunala. It will carry you to Ultra Megalopolis."),
        ] },
        { id: "o", type: "story", name: "The Ultra Warp Ride", music: "alWarpRide", pre: [
          L("narr", "Lunala spreads its wings and dives into the wormhole. Ultra Space streams past in every color, and then, darkness: Ultra Megalopolis, a city that lost its light."),
          L("alsoliera", "Necrozma is at the top of Megalo Tower. It is weakened. If you defeat it there, the light may return. To your world, and to ours."),
        ] },
        { id: "p", type: "boss", name: "Megalo Tower: Necrozma", lv: 60, env: "tower", wild: 1, music: "alUltraNecrozmaAppears", waves: [TOT("necrozmaduskmane:60!", ALL1)], pre: [
          L("narr", "At the top of Megalo Tower, Necrozma blazes with stolen light, so bright it hurts to look at. It roars, and its aura flares to life."),
        ], post: [
          L("narr", "Necrozma breaks apart, and Nebby tumbles free. Light pours back into Ultra Megalopolis, and through the wormhole, into Alola."),
        ] },
        { id: "q", type: "chest", name: "Ultra Megalopolis: Poipole", reward: { op: "poipole", lmd: 3000 }, music: "alMegalopolis", pre: [
          L("alsoliera", "Thank you. This Poipole wants to go with you. It likes you. Please, take it, as our thanks."),
        ] },
      ] },
    { id: "c13", title: "Poni Island: Mina's Trial and Hapu's Grand Trial", env: "sea", map: "sea", reward: { lmd: 12000, orundum: 700, shinystone: 1 },
      nodes: [
        { id: "a", type: "boss", name: "Seafolk Village: Captain Mina", lv: 51, env: "sea", music: "alSeafolk", reward: { key: "al_pinkpetal" }, trainer: TR("Captain Mina", "al_mina", "My trial's different. First, battle me. Then go see every captain, and bring me back a petal from each!", "Nice! Here's my Pink Petal. Off you go!"),
          waves: [WA("mawile:51", "granbull:51"), WA("ribombee:51!")] },
        { id: "b", type: "boss", name: "Hau'oli Cemetery: Captain Ilima", lv: 51, env: "route", music: "alRoute2", reward: { key: "al_orangepetal" }, trainer: TR("Captain Ilima", "al_ilima", "Mina's trial? How exciting. My Orange Petal is yours, if you can take it!", "Splendid, as always. The Orange Petal is yours."),
          waves: [WA("gumshoos:51", "smeargle:51"), WA("komala:51!")] },
        { id: "c", type: "boss", name: "Lush Jungle: Captain Mallow", lv: 51, env: "forest", music: "alMallowTrial", reward: { key: ["al_bluepetal", "al_greenpetal"] }, trainer: TR("Captain Mallow", "al_mallow", "A petal? Lana and I both have one for you! But you have to beat me first. Lana says that's fair.", "You win! Here are the Blue and Green Petals."),
          waves: [WA("trevenant:51", "shiinotic:51"), WA("tsareena:51!")] },
        { id: "d", type: "boss", name: "Wela Volcano Park: Captain Kiawe", lv: 51, env: "volcano", music: "alKiaweTrial", reward: { key: "al_redpetal" }, trainer: TR("Captain Kiawe", "al_kiawe", "The Red Petal burns like my Fire types. Show me your flame!", "Your flame burns brighter. Take the Red Petal."),
          waves: [WA("arcanine:51", "talonflame:51"), WA("marowakalola:51!")] },
        { id: "e", type: "battle", name: "Wela Volcano Park: Hiker David", lv: 48, env: "volcano", music: "alKiaweTrial", trainer: TR("Hiker David", "al_hiker", "I'm still dancing! Kiawe's moves are hard to forget!", "Still got it. Mostly."),
          waves: [WA("magmar:48")] },
        { id: "f", type: "boss", name: "Hokulani Observatory: Captain Sophocles", lv: 51, env: "plant", music: "alBurnet", reward: { key: "al_yellowpetal" }, trainer: TR("Captain Sophocles", "al_sophocles", "I fixed the Pinger! Let's test it. With a battle!", "Okay, okay, take the Yellow Petal! Nanu's got the Purple one for Acerola."),
          waves: [WA("togedemaru:51", "magnezone:51"), WA("golemalola:51!")] },
        { id: "g", type: "boss", name: "Seafolk Village: Totem Ribombee", lv: 55, env: "sea", wild: 1, badgeWin: 10, reward: { key: "al_purplepetal" }, trainer: totemTR("Ribombee", "al_mina"),
          waves: [[...TOT("ribombee:55!@occaberry", ALL2), ...WA("pelipper:52", "blissey:53")]], pre: [
          L("alnanu", "Acerola's petal? She's busy at the Aether House. Here, the purple one. Don't make me battle for it, kid."),
          L("almina", "Seven petals: now I weave them into the Rainbow Flower. Its scent will bring my Totem right to the houseboat. Get ready!"),
          L("narr", "A huge Ribombee drifts down onto Mina's houseboat, wrapped in an aura stronger than any you've faced."),
        ], post: [
          L("almina", "You cleared it! Alola's newest trial, and you're the first. Here's your stamp. Hapu's waiting for you."),
        ] },
        { id: "h", type: "boss", name: "Exeggutor Island: Kahuna Hapu's Grand Trial", lv: 54, env: "route", badgeWin: 11, music: "alKahunaTheme", trainer: TR("Island Kahuna Hapu", "al_hapu", "I'm Poni's new kahuna, and this is my first grand trial. I won't hold back. Neither will Mudsdale.", "...You've completed the island challenge. All of Alola is proud of you."),
          waves: [WA("golurk:53", "gastrodon:53", "flygon:53"), WA("mudsdale:54!")], post: [
          L("alhapu", "The Poni Stamp. That's every island. Professor Kukui's League is waiting on Mount Lanakila."),
        ] },
      ] },
    { id: "c14", title: "Mount Lanakila and the Pokémon League", env: "ice", map: "ice", reward: { lmd: 20000, orundum: 1500, permit: 10 },
      nodes: [
        { id: "a", type: "battle", name: "Mount Lanakila: Pokémon Trainer Gladion", lv: 55, env: "ice", music: "alLanakila", get trainer() { return gladionTR("I left Team Skull. Type: Null is Silvally now, and we're stronger than ever. One more battle, before the League.", "...You're the one Lillie believed in. I get it now.", "Pokémon Trainer Gladion"); },
          rivalWaves: () => [WA("crobat:53", "zoroark:53", "lucario:" + (alolaStarter() === "litten" ? 55 : 53)), WA("silvally:55!@" + gladionMemory())] },
        { id: "b", type: "side", name: "Mount Lanakila: Drampa (Ultra Moon)", lv: 48, env: "ice", wild: 1, catch: "drampa", music: "alLanakila", waves: [WA("vulpixalola:47"), WA("drampa:48")], pre: [
          L("narr", "In Ultra Moon, a Drampa lives in Mount Lanakila's icy caves. It flies down to the villages to play with the children."),
        ], post: [L("narr", "Gotcha! Drampa was caught! It's gentle with children, and fierce with anyone who bothers them.")] },
        { id: "c", type: "boss", name: "Mount Lanakila: Necrozma", lv: 65, env: "ice", wild: 1, catch: "necrozma", music: "alSummit", waves: [WA("necrozma:65!")], pre: [
          L("narr", "At the crater, something black and jagged lies in the snow: Necrozma, weakened, its light gone. It rises, and reaches for the light of your stamps."),
        ], post: [
          L("narr", "Gotcha! Necrozma was caught! Colress, of all people, is waiting at the summit to see it, and to congratulate you."),
        ] },
        { id: "d", type: "boss", name: "Elite Four Molayne", lv: 57, env: "plateau", music: "alLeague", trainer: TR("Elite Four Molayne", "al_molayne", "I was Ula'ula's captain once. Now I'm Steel. Let's see what your island challenge built.", "Excellent. You'd have made a fine captain."),
          waves: [WA("klefki:56", "bisharp:56", "magnezone:56"), WA("metagross:56", "dugtrioalola:57!")], pre: [
          L("narr", "Kukui's Pokémon League stands at the top of Mount Lanakila. Four doors, four Elite Four, in any order you like."),
        ] },
        { id: "e", type: "boss", name: "Elite Four Olivia", lv: 57, env: "plateau", music: "alLeague", trainer: TR("Elite Four Olivia", "al_olivia", "The kahuna of Akala, now Elite Four. My rocks have been polished by many battles. Let's see yours.", "You shine brighter than any jewel."),
          waves: [WA("armaldo:56", "cradily:56", "gigalith:56"), WA("probopass:56", "lycanrocmidnight:57!")] },
        { id: "f", type: "boss", name: "Elite Four Acerola", lv: 57, env: "plateau", music: "alLeague", trainer: TR("Elite Four Acerola", "al_acerola", "I'm Elite Four now! My Ghost types are so excited to play with you!", "Aww! That was so much fun, though!"),
          waves: [WA("banette:56", "drifblim:56", "dhelmise:56"), WA("froslass:56", "palossand:57!")] },
        { id: "g", type: "boss", name: "Elite Four Kahili", lv: 57, env: "plateau", music: "alLeague", trainer: TR("Elite Four Kahili", "al_kahili", "I came back from the golf tour for this. Flying types, like a perfect drive: straight to the green.", "A hole in one. For you, not me."),
          waves: [WA("braviary:56", "hawlucha:56", "oricorio:56"), WA("mandibuzz:56", "toucannon:57!")] },
        { id: "h", type: "boss", name: "The Champion's Throne: Hau", lv: 60, env: "plateau", champion: 1, music: "alLeague", get trainer() { return hauTR("I had to be the one, you know? The first challenger for the first Champion. Use everything you've got!", "I lost... but I'm happy. You're Alola's Champion. The first one ever!"); },
          rivalWaves: () => [WA("raichualola:59", hauEevee() + ":58", "tauros:58"), WA("noivern:58", "crabominable:59", hauMon(2) + ":60!")], pre: [
          L("narr", "The Champion's throne is empty. You sit in it. Then Kukui's voice echoes through the chamber: there's one more battle."),
          L("alhau", "It's me! I wanted to battle you here more than anything. Let's make it the best battle Alola's ever seen!"),
        ], post: [
          L("alkukui", "Woo! Alola, meet your first Champion! I'm so proud of you, cousin. And of you, Hau."),
          L("narr", "Your Pokémon are entered into the Hall of Fame. Their level cap keeps rising with the rest of your Journey, and lifts to Lv 100 once it's done."),
        ] },
      ] },
    { id: "c15", title: "Alola's First Champion", env: "route", map: "route", reward: { orundum: 1500, permit: 5, rec4: 3 },
      nodes: [
        { id: "a", type: "story", name: "Iki Town: The Champion's Festival", music: "alIki", pre: [
          L("narr", "Iki Town throws a festival for Alola's first Champion. Guzma and Plumeria tell the Grunts that Team Skull is finished. Gladion is leaving to train in Kanto and Johto."),
          L("alhau", "The Ultra Recon Squad says there's something strange on Poni Island. Wanna go see? Together?"),
        ] },
        { id: "b", type: "chest", name: "Ancient Poni Path: Gladion's Gift", reward: { op: "typenull", lmd: 3000 }, music: "alPoni", pre: [
          L("alwicke", "Gladion asked me to give you this. A Type: Null, like his. He said you'd treat it well."),
        ] },
        { id: "c", type: "boss", name: "Poni Grove: Blacephalon", lv: 60, env: "forest", wild: 1, catch: "blacephalon", music: "alUBs", waves: [TOT("blacephalon:60!", { spa: 2 })], pre: [
          L("alzossie", "Ultra Beasts, coming through a wormhole in Poni Grove! Hau's catching one for us. You catch the others, okay?"),
          L("narr", "Something with a head like a firework juggles its own explosive head, then sets it alight. Blacephalon."),
        ], post: [L("narr", "Gotcha! Blacephalon was caught!")] },
        { id: "d", type: "side", name: "Poni Grove: Stakataka (Ultra Moon)", lv: 60, env: "forest", wild: 1, catch: "stakataka", music: "alUBs", waves: [TOT("stakataka:60!", { def: 2 })], pre: [
          L("narr", "In Ultra Moon, the wormhole in Poni Grove lets out a wall of stones instead, each one alive: Stakataka."),
        ], post: [L("narr", "Gotcha! Stakataka was caught!")] },
        { id: "e", type: "boss", name: "Mahalo Trail: Nebby", lv: 60, env: "route", wild: 1, catch: "solgaleo", music: "alLegendAppears", waves: [WA("solgaleo:60!")], pre: [
          L("allilliez", "I'm a Trainer now, too! And Nebby... Nebby wants to go with you. It's waiting on the bridge, where we first met. Catch it, please. It'll be happy with you."),
        ], post: [L("narr", "Gotcha! Solgaleo was caught! Nebby, all grown up, nuzzles you like it did on the bridge.")] },
        { id: "f", type: "side", name: "Mahalo Trail: Lunala (Ultra Moon)", lv: 60, env: "route", wild: 1, catch: "lunala", music: "alLegendAppears", waves: [WA("lunala:60!")], pre: [
          L("narr", "In Ultra Moon, Nebby grew into Lunala, the Legendary Pokémon of the moon, and it waits for you on the bridge in its place."),
        ], post: [L("narr", "Gotcha! Lunala was caught!")] },
        { id: "g", type: "side", chest: 1, name: "The Lake of the Sunne: Cosmog", reward: { op: "cosmog", lmd: 3000 }, music: "alWilds", pre: [
          L("narr", "Through a wormhole at the altar, on the far side of the world, Solgaleo and Lunala meet over the Lake of the Sunne. Light falls between them, and a little Cosmog floats down to you."),
        ] },
        { id: "h", type: "side", name: "Ruins of Conflict: Tapu Koko", lv: 60, env: "cave", wild: 1, catch: "tapukoko", music: "alRuins", waves: [WA("tapukoko:60!")], pre: [
          L("narr", "Melemele's guardian waits in the Ruins of Conflict, the one that saved you on Mahalo Trail. It wants a battle with the new Champion."),
        ], post: [L("narr", "Gotcha! Tapu Koko was caught!")] },
        { id: "i", type: "side", name: "Ruins of Life: Tapu Lele", lv: 60, env: "cave", wild: 1, catch: "tapulele", music: "alRuins", waves: [WA("tapulele:60!")], pre: [
          L("narr", "In the Ruins of Life, Akala's guardian scatters glittering scales that heal, and harm."),
        ], post: [L("narr", "Gotcha! Tapu Lele was caught!")] },
        { id: "j", type: "side", name: "Ruins of Abundance: Tapu Bulu", lv: 60, env: "cave", wild: 1, catch: "tapubulu", music: "alRuins", waves: [WA("tapubulu:60!")], pre: [
          L("narr", "Across Haina Desert, Ula'ula's guardian waits in the Ruins of Abundance, ringing the bell in its tail."),
        ], post: [L("narr", "Gotcha! Tapu Bulu was caught!")] },
        { id: "k", type: "side", name: "Ruins of Hope: Tapu Fini", lv: 60, env: "cave", wild: 1, catch: "tapufini", music: "alRuins", waves: [WA("tapufini:60!")], pre: [
          L("narr", "In the Ruins of Hope, Poni's guardian rises out of its mist one more time, to test the Champion."),
        ], post: [L("narr", "Gotcha! Tapu Fini was caught!")] },
        { id: "l", type: "side", chest: 1, name: "Hau'oli City: Magearna", reward: { op: "magearna", lmd: 3000 }, music: "alHauoli", pre: [
          L("narr", "In the Shopping Mall's antiques shop, the owner keeps a mechanical Pokémon made five hundred years ago. It's been waiting for a Champion. Magearna is yours."),
        ] },
        { id: "m", type: "side", name: "Resolution Cave: Zygarde", lv: 60, env: "cave", wild: 1, catch: "zygarde", music: "alCave", waves: [WA("zygarde:60!")], pre: [
          L("narr", "Deep in Resolution Cave, past Poni Meadow, Zygarde watches over Alola's ecosystem, as it watched over Kalos's."),
        ], post: [L("narr", "Gotcha! Zygarde was caught! It first appeared in Kalos, and it watches over Alola too.")] },
      ] },
    { id: "c16", title: "The Ultra Warp Ride", env: "sea", map: "sea", reward: { orundum: 1500, permit: 5, rec4: 3 },
      nodes: [
        { id: "a", type: "story", name: "Altar of the Sunne: The Ultra Warp Ride", music: "alWarpRide", pre: [
          L("narr", "At the Altar of the Sunne, the wormhole Necrozma opened never closed. The Ultra Recon Squad's Lunala will carry you through it whenever you like."),
          L("narr", "Each color of warp hole leads to a different world of Ultra Space: Legendary Pokémon from every region in the four wilds, and in the white holes, the Ultra Beasts' own worlds."),
        ] },
        ...[["Cliff World", [["articuno"], ["zapdos"], ["moltres"], ["cresselia"], ["rayquaza"], ["landorus"], ["hooh"], ["tornadus"], ["thundurus", 1], ["yveltal", 1]]],
          ["Water World", [["uxie"], ["mesprit"], ["azelf"], ["suicune"], ["kyurem"], ["latios"], ["lugia", 1], ["latias", 1], ["kyogre", 1]]],
          ["Rocky World", [["mewtwo"], ["cobalion"], ["terrakion"], ["virizion"], ["raikou"], ["dialga"], ["reshiram"], ["xerneas"], ["entei", 1], ["zekrom", 1]]],
          ["Cave World", [["regirock"], ["regice"], ["registeel"], ["giratina"], ["groudon"], ["heatran"], ["palkia", 1], ["regigigas", 1]]]].flatMap(([world, list]) => [{
          id: "t" + world, type: "story", name: `Ultra Space Wilds: the ${world}`, music: "alWarpRide", pre: [L("narr", ALOLA_WORLDS[world])] }, ...list.map(([k, um]) => ({
          id: "w" + k, type: "side", name: `Ultra Space Wilds, ${world}: ${OPS[k] ? OPS[k].n : k}${um ? " (Ultra Moon)" : ""}`, lv: 60, env: world === "Water World" ? "sea" : world === "Cave World" ? "cave" : "route", wild: 1, catch: k, music: "alWilds",
          waves: [WA(k + ":60!")], pre: [L("narr", `Lunala dives through a warp hole into the ${world}. A Legendary Pokémon from another region waits there${um ? ", as it does in Ultra Moon" : ""}.`)],
          post: [L("narr", `Gotcha! ${OPS[k] ? OPS[k].n : k} was caught!`)] }))]),
        { id: "tu", type: "story", name: "Ultra Space: the Ultra Beasts' Worlds", music: "alWarpRide", pre: [
          L("narr", "The white warp holes are rarer. Each leads to the home world of one kind of Ultra Beast. The Aether Foundation sells Beast Balls for them now."),
        ] },
        // (the Ultra Beasts' worlds: each at its highest version's level, with its aura; Sun and Moon's Looker missions had Buzzwole, Xurkitree and Celesteela at Lv 65 and Guzzlord at Lv 70)
        { id: "u1", type: "side", name: "Ultra Deep Sea: Nihilego", lv: 60, env: "sea", wild: 1, catch: "nihilego", music: "alUltraSpace", waves: [TOT("nihilego:60!", { sdf: 2 })], pre: [L("narr", "The Ultra Deep Sea is quiet and blue. Nihilego drift through it like jellyfish made of glass.")], post: [L("narr", "Gotcha! Nihilego was caught!")] },
        { id: "u2", type: "side", name: "Ultra Jungle: Buzzwole", lv: 65, env: "forest", wild: 1, catch: "buzzwole", music: "alUJungle", waves: [TOT("buzzwole:65!", { def: 2 })], pre: [L("narr", "In the Ultra Jungle, enormous trees, and something showing off its enormous muscles between them: Buzzwole.")], post: [L("narr", "Gotcha! Buzzwole was caught!")] },
        { id: "u3", type: "side", name: "Ultra Desert: Pheromosa (Ultra Moon)", lv: 60, env: "route", wild: 1, catch: "pheromosa", music: "alUDesert", waves: [TOT("pheromosa:60!", { spe: 2 })], pre: [L("narr", "In Ultra Moon, the white hole opens on the Ultra Desert, where Pheromosa dart across the sand faster than the eye can follow.")], post: [L("narr", "Gotcha! Pheromosa was caught!")] },
        { id: "u4", type: "side", name: "Ultra Plant: Xurkitree", lv: 65, env: "plant", wild: 1, catch: "xurkitree", music: "alUPlant", waves: [TOT("xurkitree:65!", { spa: 2 })], pre: [L("narr", "The Ultra Plant hums with power lines. One of them is a living thing, crackling with electricity: Xurkitree.")], post: [L("narr", "Gotcha! Xurkitree was caught!")] },
        { id: "u5", type: "side", name: "Ultra Crater: Celesteela (Ultra Moon)", lv: 65, env: "plateau", wild: 1, catch: "celesteela", music: "alUCrater", waves: [TOT("celesteela:65!", { def: 2 })], pre: [L("narr", "In Ultra Moon, a white hole leads to the Ultra Crater, where Celesteela tower like launch towers.")], post: [L("narr", "Gotcha! Celesteela was caught!")] },
        { id: "u6", type: "side", name: "Ultra Forest: Kartana", lv: 60, env: "forest", wild: 1, catch: "kartana", music: "alUForest", waves: [TOT("kartana:60!", { atk: 2 })], pre: [L("narr", "The Ultra Forest's trees are paper-white. Something folded like a paper doll slices through one: Kartana.")], post: [L("narr", "Gotcha! Kartana was caught!")] },
        { id: "u7", type: "side", name: "Ultra Ruin: Guzzlord", lv: 70, env: "cave", wild: 1, catch: "guzzlord", music: "alURuin", waves: [TOT("guzzlord:70!", { atk: 2 })], pre: [L("narr", "The Ultra Ruin is all that's left of a city. Something ate the rest. It's still hungry: Guzzlord.")], post: [L("narr", "Gotcha! Guzzlord was caught!")] },
      ] },
    { id: "c17", title: "Episode RR: Team Rainbow Rocket", env: "tower", map: "tower", reward: { orundum: 2000, permit: 10, rec4: 5 },
      nodes: [
        { id: "a", type: "battle", name: "Festival Plaza: Team Rainbow Rocket", lv: 50, env: "city", music: "alRREyes", trainer: TR("Team Rainbow Rocket Grunt", "al_rrgrunt", "This plaza belongs to Team Rainbow Rocket now! Prepare for trouble!", "This won't stop the boss! Nothing will!"),
          waves: [WA("raticate:50@oranberry", "arbok:50@lumberry", "golbat:50@rockyhelmet")], pre: [
          L("alsophocles", "Champion! Somebody's hacked Festival Plaza. They call themselves Team Rainbow Rocket! Hold them off while I take it back!"),
        ] },
        { id: "b", type: "battle", name: "Aether Paradise: Team Rainbow Rocket", lv: 61, env: "plant", music: "alRREyes", trainer: TR("Team Rainbow Rocket Grunts", "al_rrgrunt", "The boss took this whole island! Who's gonna stop us, you?", "Yes. You, apparently."),
          waves: [WA("primeape:61", "persian:61"), WA("haunter:61", "golbat:61")], pre: [
          L("narr", "On TV: Team Rainbow Rocket has taken Aether Paradise and turned Lusamine's mansion into a castle. Lusamine is their hostage."),
          L("allilliez", "My mother needs us. I'm coming with you. I'm a Trainer now, remember?"),
        ] },
        { id: "c", type: "boss", name: "Aether Paradise: Faba and an Employee", lv: 63, env: "plant", music: "alAetherEyes", trainer: TR("Faba and an Aether Foundation Employee", "al_faba", "The president never appreciated my genius. Giovanni does! Rainbow Rocket offered me everything!", "No! Not again!"),
          waves: [WA("granbull:61", "scrafty:61", "shiinotic:61"), WA("claydol:63", "bruxish:63", "hypno:63!")], pre: [
          L("narr", "Faba has joined Team Rainbow Rocket. Lillie and her Clefairy fight at your side."),
        ] },
        { id: "d", type: "boss", name: "Aether Paradise: Faba", lv: 63, env: "plant", music: "alAetherEyes", trainer: TR("Aether Foundation Faba", "al_faba", "That was a warm-up! My real team is here!", "...I shall be demoted to intern, won't I."),
          waves: [WA("claydol:63", "bruxish:63", "raichualola:63"), WA("alakazam:63", "hypno:63!")] },
        { id: "e", type: "battle", name: "Team Rocket's Castle: The Entrance", lv: 62, env: "tower", music: "alRRCastle", trainer: TR("Team Rainbow Rocket Grunts", "al_rrgrunt", "Two of us, one of you! Easy!", "Two of you, plus Guzma?!"),
          waves: [WA("raticate:62", "fearow:62")], pre: [
          L("alguzma", "Nobody wrecks Alola but me. Move over, Champ. Guzma's got your back."),
        ] },
        { id: "f", type: "boss", name: "Team Rocket's Castle: Team Aqua Archie", lv: 66, env: "sea", music: "alRRCastle", trainer: TR("Team Aqua Archie", "al_archie", "In my world, Kyogre drowned the land and Team Aqua won. Bwahaha! Let's see you swim!", "...So this world's different. Fine. I'm off home."),
          waves: [WA("mightyena:64", "crobat:64", "muk:64"), WA("sharpedo:64", "kyogre:66!")], pre: [
          L("narr", "Each wing of the castle ends with the leader of a villainous team from a world where they won, and that world's Legendary Pokémon."),
        ] },
        { id: "g", type: "boss", name: "Team Rocket's Castle: Team Magma Maxie", lv: 66, env: "volcano", music: "alRRCastle", trainer: TR("Team Magma Maxie", "al_maxie", "In my world, Groudon dried the oceans, and humanity flourished. Fufufu. Your world could too.", "Fufu... Perhaps my world needs rethinking."),
          waves: [WA("mightyena:64", "crobat:64", "weezing:64"), WA("camerupt:64", "groudon:66!")] },
        { id: "h", type: "boss", name: "Team Rocket's Castle: Team Galactic Cyrus", lv: 67, env: "tower", music: "alRRCastle", trainer: TR("Team Galactic Cyrus", "al_cyrus", "I made a new world, free of spirit. It is perfect, and it is empty. Show me what spirit is worth.", "...Spirit. I will think on it."),
          waves: [WA("houndoom:65", "honchkrow:65", "crobat:65"), WA("weavile:65", "dialga:67!")] },
        { id: "i", type: "boss", name: "Team Rocket's Castle: Team Flare Lysandre", lv: 67, env: "plant", music: "alRRCastle", trainer: TR("Team Flare Lysandre", "al_lysandre", "In my world, the ultimate weapon fired. Only the chosen remain. Will you be chosen?", "...Beautiful. Your strength is beautiful."),
          waves: [WA("mienshao:65", "honchkrow:65", "pyroar:65"), WA("gyarados:65", "xerneas:67!")] },
        { id: "j", type: "boss", name: "Team Rocket's Castle: Team Plasma Ghetsis", lv: 68, env: "tower", music: "alRRCastle", trainer: TR("Team Plasma Ghetsis", "al_ghetsis", "I rule my world with Zekrom at my side! No one, NO ONE, is my equal!", "Impossible! Impossible!"),
          waves: [WA("cofagrigus:66", "bouffalant:66", "bisharp:66"), WA("hydreigon:66", "zekrom:68!")], post: [
          L("narr", "Colress steps in and sends Ghetsis back to his own world, with one of his machines. Lusamine is safe. One room is left: the Trophy Room."),
        ] },
        { id: "k", type: "boss", name: "Team Rocket's Castle: Team Rainbow Rocket Giovanni", lv: 70, env: "tower", music: "alRRCastle", trainer: TR("Team Rainbow Rocket Boss Giovanni", "al_giovanni", "I gathered the leaders of every world's evil teams, and every world's Legendary Pokémon. And now, the Champion of Alola. Let me test your strength.", "...Interesting. Very interesting. This world isn't ready for me. Not yet."),
          waves: [WA("dugtrio:68@smoothrock", "nidoking:68", "nidoqueen:68"), WA("rhyperior:68", "mewtwo:70!")], pre: [
          L("algiovanni", "I am Giovanni. In my world, Team Rocket rules. Now I'll rule this one, with the power of Mewtwo."),
        ], post: [
          L("narr", "Giovanni steps through a portal into another world, and is gone. Colress's machine returns the castle to Lusamine's mansion. Alola is safe."),
          L("narr", "You've done it: the Alola Journey is complete."),
        ] },
        { id: "l", type: "side", chest: 1, name: "Aether House: A Porygon", reward: { op: "porygon", lmd: 3000 }, music: "alAetherHouse", pre: [
          L("narr", "The Aether Foundation sends a thank-you gift to the Aether House for you: a Porygon, a Pokémon made in Kanto."),
        ] },
      ] },
  ],
};
STORY.push(ALOLA_JOURNEY);
indexJourney(ALOLA_JOURNEY);
// The Battle Tower's Alola wing (TOWER_WING in a4_story.js; the owner's rule: every Alola battle the Journey leaves out goes to the Tower):
// Sun and Moon's teams for the story battles where their Pokémon differ (level-only copies left out) and Sun and Moon's own battles
// (Ilima at the Trainers' School, Lana, Kiawe and Mallow after Olivia, Molayne on Mount Hokulani, Lusamine in Ultra Space, Hau on Mount
// Lanakila, Kukui on the Champion's throne, Hala's Elite Four), Ultra Moon's Dexio and Sina and its side of Mina's trial, both games'
// post-game battles (Anabel, Mina, Nanu, Dexio, Guzma, the captains, Hala, Ryuki's Kantonian Gym, Aristo), the Elite Four rematches
// and title defenses that differ, and the Battle Tree's Red and Blue. No Z-Crystals or Mega Stones: their holders keep no item.
// GAME FREAK's Morimoto and Iwao and the Eevee users have no picture in the owner's pack, so they're left out. Floors sort by level.
const SMA = "Sun and Moon", USA = "Ultra Sun", UMA = "Ultra Moon", USUMA = "Ultra Sun and Ultra Moon";
const KAHUNA_BGM = { bgm: "alKahuna", winBgm: "alKahunaWin" }, CAPTAIN_BGM = { bgm: "alCaptain", winBgm: "alTrainerWin" }, E4_BGM = { bgm: "alE4", winBgm: "alKahunaWin" },
  SUMMIT_BGM = { bgm: "alSummitBattle", winBgm: "alChampionBorn" }, SKULL_BGM = { bgm: "alSkullBoss", winBgm: "alSkullWin" }, AETHER_BGM = { bgm: "alAetherBattle", winBgm: "alAetherWin" };
if (typeof TOWER_WING === "object") TOWER_WING.alola = [
  // ---- Sun and Moon's story ----
  { n: "Island Kahuna Hala", t: "al_hala", from: SMA + ": the grand trial, Iki Town", waves: [WA("mankey:14", "makuhita:14"), WA("crabrawler:15!")], ...KAHUNA_BGM },
  { n: "Captain Ilima", t: "al_ilima", from: SMA + ": the Trainers' School, after Hala's grand trial", waves: [WA("smeargle:14", "gumshoos:15!")], ...CAPTAIN_BGM },
  { n: "Pokémon Trainer Dexio", t: "al_dexio", from: USA + ": Heahea City", waves: [WA("mimejr:15", "espeon:15!")] },
  { n: "Pokémon Trainer Sina", t: "al_sina", from: UMA + ": Heahea City", waves: [WA("smoochum:15", "glaceon:15!")] },
  { n: "Pokémon Trainer Sina", t: "al_sina", from: "Moon: Heahea City", waves: [WA("delibird:15", "glaceon:16!")] },
  { n: "Captain Lana", t: "al_lana", from: SMA + ": Brooklet Hill, after Olivia's grand trial", waves: [WA("chinchou:26", "shellder:26"), WA("araquanid:27!")], ...CAPTAIN_BGM },
  { n: "Captain Kiawe", t: "al_kiawe", from: "Sun: Royal Avenue, after Olivia's grand trial", waves: [WA("growlithe:26", "fletchinder:26"), WA("marowakalola:27!")], ...CAPTAIN_BGM },
  { n: "Captain Mallow", t: "al_mallow", from: "Moon: Lush Jungle, after Olivia's grand trial", waves: [WA("phantump:26", "shiinotic:26"), WA("steenee:27!")], ...CAPTAIN_BGM },
  { n: "Island Kahuna Olivia", t: "al_olivia", from: SMA + ": the grand trial, Ruins of Life", waves: [WA("nosepass:26", "boldore:26"), WA("lycanrocmidnight:27!")], ...KAHUNA_BGM },
  { n: "Pokémon Trainer Molayne", t: "al_molayne", from: SMA + ": the summit of Mount Hokulani", waves: [WA("skarmory:29", "metang:29"), WA("dugtrioalola:30!")] },
  { n: "Team Skull Boss Guzma", t: "al_guzma", from: SMA + ": Malie Garden", waves: [WA("ariados:30", "golisopod:31!")], ...SKULL_BGM },
  { n: "Team Skull Boss Guzma", t: "al_guzma", from: SMA + ": the Shady House, Po Town", waves: [WA("ariados:36", "golisopod:37!")], ...SKULL_BGM },
  { n: "Team Skull Gladion", t: "al_gladion", from: SMA + ": the Aether House", waves: [WA("golbat:37", "sneasel:37"), WA("typenull:38!")], bgm: "alGladionBattle" },
  { n: "Aether Branch Chief Faba and an Employee", t: "al_faba", from: SMA + ": Aether Paradise", waves: [WA("ledian:38"), WA("slowbro:39", "bruxish:39", "hypno:40!")], ...AETHER_BGM },
  { n: "Team Skull Boss Guzma", t: "al_guzma", from: SMA + ": Aether Paradise", waves: [WA("ariados:40", "masquerain:40", "pinsir:40"), WA("golisopod:41!")], ...SKULL_BGM },
  { n: "Aether President Lusamine", t: "al_lusamine", from: SMA + ": Lusamine's mansion", waves: [WA("clefable:41", "lilligant:41", "mismagius:41"), WA("milotic:41", "bewear:41!")], bgm: "alLusamineBattle", winBgm: "alAetherWin" },
  { n: "Island Kahuna Hapu", t: "al_hapu", from: SMA + ": the grand trial, Vast Poni Canyon", waves: [WA("dugtrioalola:47", "gastrodon:47", "flygon:47"), WA("mudsdale:48!")], ...KAHUNA_BGM },
  // (fused with Nihilego in Ultra Space, each of her Pokémon has an aura of one stage, as in Sun and Moon)
  { n: "Aether President Lusamine", t: "al_lusamine", from: SMA + ": Ultra Space, fused with Nihilego", waves: [[...TOT("clefable:50", { sdf: 1 }), ...TOT("lilligant:50", { spa: 1 }), ...TOT("mismagius:50", { spe: 1 })], [...TOT("milotic:50", { atk: 1 }), ...TOT("bewear:50!", { def: 1 })]], bgm: "alLusamineBattle", winBgm: "alAetherWin" },
  { n: "Pokémon Trainer Gladion", t: "al_gladion", from: SMA + ": Mount Lanakila", waves: () => [WA("crobat:52", "weavile:52", "lucario:52"), WA("silvally:53!@" + gladionMemory())], bgm: "alGladionBattle" },
  { n: "Pokémon Trainer Hau", t: "al_hau", from: SMA + ": the peak of Mount Lanakila", waves: () => [WA("raichualola:53", hauEevee() + ":53", "komala:53"), WA(hauMon(2) + ":54!")], bgm: "alHauBattle" },
  { n: "Elite Four Hala", t: "al_hala", from: SMA + ": the Pokémon League", waves: [WA("hariyama:54", "primeape:54", "bewear:54"), WA("poliwrath:54", "crabominable:55!")], ...E4_BGM },
  { n: "Elite Four Olivia", t: "al_olivia", from: SMA + ": the Pokémon League", waves: [WA("relicanth:54", "carbink:54", "golemalola:54"), WA("probopass:54", "lycanrocmidnight:55!")], ...E4_BGM },
  { n: "Elite Four Acerola", t: "al_acerola", from: SMA + ": the Pokémon League", waves: [WA("sableye:54", "drifblim:54", "dhelmise:54"), WA("froslass:54", "palossand:55!")], ...E4_BGM },
  { n: "Elite Four Kahili", t: "al_kahili", from: SMA + ": the Pokémon League", waves: [WA("skarmory:54", "crobat:54", "oricorio:54"), WA("mandibuzz:54", "toucannon:55!")], ...E4_BGM },
  { n: "Pokémon Professor Kukui", t: "al_kukui", from: SMA + ": the Champion's throne, the first Champion battle", waves: () => [WA("lycanroc:57", "ninetalesalola:56", "braviary:56"), WA("magnezone:56", "snorlax:56", kukuiAce() + ":58!")], ...SUMMIT_BGM },
  // ---- Ultra Moon's side of Mina's trial ----
  { n: "Captain Lana", t: "al_lana", from: UMA + ": Mina's trial, Lush Jungle", waves: [WA("lanturn:51", "cloyster:51"), WA("araquanid:51!")], ...CAPTAIN_BGM },
  { n: "Island Kahuna Nanu", t: "al_nanu", from: UMA + ": Mina's trial, the Aether House", waves: [WA("sableye:52", "absol:52"), WA("persianalola:53!")], ...KAHUNA_BGM },
  // ---- Sun and Moon's post-game ----
  { n: "Pokémon Trainer Anabel", t: "al_anabel", from: SMA + ": the Route 8 motel, joining the Ultra Beast Task Force", waves: [WA("alakazam:61", "weavile:61", "mismagius:61"), WA("salamence:61", "snorlax:61!")] },
  { n: "Captain Mina", t: "al_mina", from: SMA + ": the Route 8 motel and Poni Gauntlet", waves: [WA("klefki:61", "granbull:61", "shiinotic:61"), WA("wigglytuff:61", "ribombee:61!")], ...CAPTAIN_BGM },
  { n: "Pokémon Trainer Dexio", t: "al_dexio", from: SMA + ": Ancient Poni Path", waves: [WA("espeon:61", "raichualola:61", "slowking:61"), WA("metagross:61", "alakazam:61!")] },
  { n: "Island Kahuna Nanu", t: "al_nanu", from: SMA + ": Seafolk Village", waves: [WA("sableye:63", "krookodile:63", "honchkrow:63"), WA("absol:63", "persianalola:63!")], ...KAHUNA_BGM },
  { n: "Pokémon Trainer Guzma", t: "al_guzma", from: SMA + ": Hau'oli City's beachfront", waves: [WA("golisopod:63", "ariados:63", "masquerain:63"), WA("pinsir:63", "scizor:63!")], ...SKULL_BGM },
  { n: "Elite Four Hala", t: "al_hala", from: SMA + ": the Pokémon League rematch", waves: [WA("hariyama:63", "primeape:63", "bewear:63"), WA("poliwrath:63", "crabominable:63!")], ...E4_BGM },
  { n: "Elite Four Olivia", t: "al_olivia", from: SMA + ": the Pokémon League rematch", waves: [WA("relicanth:63", "carbink:63", "golemalola:63"), WA("probopass:63", "lycanrocmidnight:63!")], ...E4_BGM },
  { n: "Elite Four Acerola", t: "al_acerola", from: SMA + ": the Pokémon League rematch", waves: [WA("sableye:63", "drifblim:63", "dhelmise:63"), WA("froslass:63", "palossand:63!")], ...E4_BGM },
  { n: "Elite Four Kahili", t: "al_kahili", from: SMA + ": the Pokémon League rematch", waves: [WA("skarmory:63", "crobat:63", "oricorio:63"), WA("mandibuzz:63", "toucannon:63!")], ...E4_BGM },
  { n: "Pokémon Trainer Hau", t: "al_hau", from: SMA + ": the first title defense", waves: () => [WA("raichualola:63", hauEevee() + ":63", "komala:63"), WA("crabominable:63", hauMon(2) + ":63!")], bgm: "alChampion", winBgm: "alChampionBorn" },
  { n: "Pokémon Trainer Gladion", t: "al_gladion", from: SMA + ": a title defense", waves: () => [WA("crobat:63", "weavile:63", "porygonz:63"), WA("lucario:63", "silvally:63!@" + gladionMemory())], ...SUMMIT_BGM },
  { n: "Island Kahuna Hapu", t: "al_hapu", from: SMA + ": a title defense", waves: [WA("dugtrioalola:63", "gastrodon:63", "krookodile:63"), WA("flygon:63", "mudsdale:63!")], ...SUMMIT_BGM },
  { n: "Aether Foundation Faba", t: "al_faba", from: SMA + ": a title defense, and Aether Paradise", waves: [WA("slowbro:61", "bruxish:61", "raichualola:61"), WA("alakazam:61", "hypno:61!")], ...SUMMIT_BGM },
  { n: "Pokémon Trainer Molayne", t: "al_molayne", from: SMA + ": a title defense", waves: [WA("skarmory:61", "sandslashalola:61", "magnezone:61"), WA("metagross:61", "dugtrioalola:61!")], ...SUMMIT_BGM },
  // ---- Ultra Sun and Ultra Moon's post-game ----
  { n: "Twins Harper and Sarah", t: "al_twins", from: USUMA + ": Konikoni City, after the League", waves: [WA("luvdisc:56", "corsola:56")] },
  { n: "Pokémon Trainer Ryuki", t: "al_ryuki", from: USUMA + ": the Kantonian Gym, Malie City", waves: [WA("turtonator:58", "drampa:58", "garchomp:58"), WA("dragonite:58", "kommoo:58!")], bgm: "alKantonianGym" },
  { n: "Captain Ilima", t: "al_ilima", from: USUMA + ": the Trainers' School, after the League", waves: [WA("gumshoos:60", "smeargle:60"), WA("komala:60!")], ...CAPTAIN_BGM },
  { n: "Captain Lana", t: "al_lana", from: USUMA + ": Brooklet Hill, after the League", waves: [WA("lanturn:60", "cloyster:60"), WA("araquanid:60!")], ...CAPTAIN_BGM },
  { n: "Captain Kiawe", t: "al_kiawe", from: USA + ": Royal Avenue, after the League", waves: [WA("arcanine:60", "talonflame:60"), WA("marowakalola:60!")], ...CAPTAIN_BGM },
  { n: "Captain Mallow", t: "al_mallow", from: UMA + ": Lush Jungle, after the League", waves: [WA("trevenant:60", "shiinotic:60"), WA("tsareena:60!")], ...CAPTAIN_BGM },
  { n: "Island Kahuna Hala", t: "al_hala", from: USUMA + ": Iki Town, after the League", waves: [WA("hariyama:63", "machamp:63", "bewear:63"), WA("poliwrath:63", "crabominable:63!")], ...KAHUNA_BGM },
  { n: "Pokémon Trainer Dexio", t: "al_dexio", from: USUMA + ": the Aether Base, Route 16", waves: [WA("espeon:63", "raichualola:63", "slowking:63"), WA("metagross:63", "alakazam:63", "zygarde10:63!")] },
  { n: "Veteran Aristo", t: "al_aristo", from: USUMA + ": the peak of Mount Lanakila, after every skilled Trainer", waves: [WA("carbink:65@lightclay", "torkoal:65@heatrock", "pelipper:65@damprock"), WA("ninetalesalola:65@icyrock", "gigalith:65!@smoothrock")] },
  { n: "Elite Four Molayne", t: "al_molayne", from: USUMA + ": the Pokémon League rematch", waves: [WA("klefki:66", "bisharp:66", "magnezone:66"), WA("metagross:66", "dugtrioalola:66!")], ...E4_BGM },
  { n: "Elite Four Olivia", t: "al_olivia", from: USUMA + ": the Pokémon League rematch", waves: [WA("armaldo:66", "cradily:66", "gigalith:66"), WA("probopass:66", "lycanrocmidnight:66!")], ...E4_BGM },
  { n: "Elite Four Acerola", t: "al_acerola", from: USUMA + ": the Pokémon League rematch", waves: [WA("banette:66", "drifblim:66", "dhelmise:66"), WA("froslass:66", "palossand:66!")], ...E4_BGM },
  { n: "Elite Four Kahili", t: "al_kahili", from: USUMA + ": the Pokémon League rematch", waves: [WA("braviary:66", "hawlucha:66", "oricorio:66"), WA("mandibuzz:66", "toucannon:66!")], ...E4_BGM },
  { n: "Youngster Tristan", t: "al_tristan", from: USUMA + ": a title defense", waves: [WA("emolga:66", "sharpedo:66", "exeggutoralola:66"), WA("magmortar:66", "tauros:66!")], ...SUMMIT_BGM },
  { n: "Pokémon Trainer Plumeria", t: "al_plumeria", from: USUMA + ": a title defense", waves: [WA("gengar:67", "mukalola:67", "crobat:67"), WA("toxapex:67", "salazzle:67!")], ...SUMMIT_BGM },
  { n: "Pokémon Trainer Ryuki", t: "al_ryuki", from: USUMA + ": a title defense", waves: [WA("garchomp:67", "drampa:67", "turtonator:67"), WA("dragonite:67", "kommoo:67!")], ...SUMMIT_BGM },
  { n: "Captain Sophocles", t: "al_sophocles", from: USUMA + ": a title defense", waves: [WA("togedemaru:67", "magnezone:67", "electivire:67"), WA("vikavolt:67", "golemalola:67!")], ...SUMMIT_BGM },
  { n: "Aether President Lusamine", t: "al_lusamine", from: USUMA + ": a title defense, on the first of the month", waves: [WA("clefable:68", "lilligant:68", "lopunny:68"), WA("milotic:68", "bewear:68!")], ...SUMMIT_BGM },
  { n: "Pokémon Trainer Guzma", t: "al_guzma", from: USUMA + ": a title defense", waves: [WA("golisopod:68", "vikavolt:68", "pinsir:68"), WA("masquerain:68", "scizor:68!")], ...SUMMIT_BGM },
  { n: "Island Kahuna Hapu", t: "al_hapu", from: USUMA + ": a title defense", waves: [WA("golurk:68", "gastrodon:68", "krookodile:68"), WA("flygon:68", "mudsdale:69!")], ...SUMMIT_BGM },
  { n: "Pokémon Professor Kukui", t: "al_kukui", from: USUMA + ": a title defense", waves: () => [WA("lycanroc:69", "ninetalesalola:68", "braviary:68"), WA("magnezone:68", "snorlax:68", kukuiAce() + ":68!")], ...SUMMIT_BGM },
  { n: "Pokémon Trainer Hau", t: "al_hau", from: USUMA + ": the first title defense", waves: () => [WA("raichualola:69", hauEevee() + ":68", "tauros:68"), WA("noivern:68", "crabominable:69", hauMon(2) + ":70!")], bgm: "alChampion", winBgm: "alChampionBorn" },
  { n: "Pokémon Trainer Gladion", t: "al_gladion", from: USUMA + ": a title defense, a month after Episode RR", waves: () => [WA("crobat:68", "zoroark:68", "porygonz:68"), WA("lucario:68", gladionKanto() + ":68", "silvally:70!@" + gladionMemory())], ...SUMMIT_BGM },
  { n: "Pokémon Trainer Blue", t: "al_blue", from: USUMA + ": the Battle Tree, your first visit", waves: [WA("alakazam:69", "aerodactyl:69", "arcanine:69"), WA("gyarados:69", "machamp:69", "exeggutor:69!")], bgm: "alTreeBoss", winBgm: "alTrainerWin" },
  { n: "Pokémon Trainer Red", t: "al_red", from: USUMA + ": the Battle Tree, your first visit", waves: [WA("venusaur:70", "charizard:70", "blastoise:70"), WA("lapras:69", "snorlax:69", "pikachu:74!@lightball")], bgm: "alTreeBoss", winBgm: "alTrainerWin" },
];
