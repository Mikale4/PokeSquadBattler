
// =====================================================================
//  GALAR JOURNEY — Sword and Shield's story (Sword's side, the owner's pick, 2026-10-16): Leon's present in Postwick, Hop and the
//  mysterious Pokémon in the Slumbering Weald, Professor Magnolia and Sonia, the Wild Area, the Gym Challenge's eight stadiums (Milo,
//  Nessa, Kabu, Bea, Opal, Gordie, Piers and Raihan), Team Yell and Marnie, Bede and Chairman Rose's Wishing Stars, the Champion Cup
//  in Wyndon, Rose Tower and Oleana, the Darkest Day, Eternatus and Champion Leon; then Sword and Shield's own post-game (Sordward and
//  Shielbert, the rampaging Dynamax Pokémon in the stadiums, Zacian and Hop's Zamazenta, the Champion Cup rematch) and the two
//  expansions in the Journey (the owner's pick): The Isle of Armor (Mustard's dojo, Klara, Kubfu and Urshifu) and The Crown Tundra
//  (Peony, Calyrex, the Legendary titans and birds), the Journey's end.
//  Sword is the main version (the owner's pick): Bea and Gordie are the Gyms that give the Badges, and Shield's Allister and Melony are
//  side-stage battles right beside them with no Badge; Sword's catches are the main stages and Shield's the side stages beside them; you
//  catch Zacian and Zamazenta is a side stage. Every other Shield-only battle is a side stage beside Sword's (Shielbert beside Sordward,
//  Avery beside Klara). Each story battle takes its strongest version's team (the owner's rule); Sword and Shield share every other
//  team, so the rest of Galar's battles (rematches, the Battle Tower, the Galarian Star Tournament) are its Battle Tower wing below.
//  No Dynamax here (the owner's pick, 2026-10-16): a Pokémon the games Dynamax or Gigantamax, a Gym Leader's ace, a rival's, a Max
//  Raid's, battles with an aura instead, Defense and Sp. Def +1 as stat stages fixed to it while it's on the field (DYN below; the
//  Totems' aura in a7_engine.js, its own name "Dynamax aura" or "Gigantamax aura"); a Max Raid catch is an ordinary wild stage.
//  Only Galar's Pokémon (Gen 8's, with the Galarian forms; the Hisuian ones are Sinnoh's) battle on your side here (journeyOk); its wild stages catch them.
//  Gifts from other generations (Leon's Charmander, the Type: Null, the Legendaries of other regions) wait for their region.
//  Stage ids start with "ga" (REGION_CODE in a4_story.js): ga1-1, gaS1-1; chapters gac1... `music` on a stage: the place's track
//  while its scene plays (the Super Music Collection's, a8c_sfx.js). Dialogue is original.
// =====================================================================
Object.assign(SPK, {
  galeon: { n: "Leon", t: "ga_leon" }, gahop: { n: "Hop", t: "ga_hop" }, gamom: { n: "Mom" }, gahopmom: { n: "Hop's Mom" },
  gamagnolia: { n: "Prof. Magnolia", t: "ga_magnolia" }, gasonia: { n: "Sonia", t: "ga_sonia" }, gasoniap: { n: "Professor Sonia", t: "ga_soniaprof" },
  gabede: { n: "Bede", t: "ga_bede" }, gabedel: { n: "Bede", t: "ga_bedeleader" }, gamarnie: { n: "Marnie", t: "ga_marnie" },
  garose: { n: "Chairman Rose", t: "ga_rose" }, garoseinc: { n: "Chairman Rose", t: "ga_roseincog" }, gaoleana: { n: "Oleana", t: "ga_oleana" },
  gamilo: { n: "Milo", t: "ga_milo" }, ganessa: { n: "Nessa", t: "ga_nessa" }, gakabu: { n: "Kabu", t: "ga_kabu" }, gabea: { n: "Bea", t: "ga_bea" },
  gaallister: { n: "Allister", t: "ga_allister" }, gaopal: { n: "Opal", t: "ga_opal" }, gagordie: { n: "Gordie", t: "ga_gordie" }, gamelony: { n: "Melony", t: "ga_melony" },
  gapiers: { n: "Piers", t: "ga_piers" }, garaihan: { n: "Raihan", t: "ga_raihan" }, gasordward: { n: "Sordward", t: "ga_sordward" }, gashielbert: { n: "Shielbert", t: "ga_shielbert" },
  gayell: { n: "Team Yell Grunt", t: "ga_yell" }, gayellf: { n: "Team Yell Grunt", t: "ga_yellf" }, gastaff: { n: "League Staff", t: "ga_staff" }, gaballguy: { n: "Ball Guy", t: "ga_ballguy" },
  gamustard: { n: "Mustard", t: "ga_mustard" }, gahoney: { n: "Honey" }, gaklara: { n: "Klara", t: "ga_klara" }, gaavery: { n: "Avery", t: "ga_avery" },
  gapeony: { n: "Peony", t: "ga_peony" }, gapeonia: { n: "Peonia", t: "ga_peonia" }, gahyde: { n: "Hyde" }, gacalyrex: { n: "Calyrex" },
  garotom: { n: "Rotom Phone" }, gacara: { n: "Cara Liss" },
});
// "species:level" as WG(8) reads it (Galar's Journey grows its opponents within Gen 8: grownAt), except that where a Pokémon could evolve
// into a Galarian form or into another, it takes the Galarian one, as it does in Galar (Koffing into Galarian Weezing, Mime Jr. into
// Galarian Mr. Mime, Galarian Slowpoke into Galarian Slowbro)
function gaGrown(k, lv) {
  for (let n = 0; n < 3; n++) { const c = (OPS[k].evo || []).filter(e => lv >= (e.lv || EVO_ITEM_LV) && OPS[e.to] && genOf(e.to) <= 8); if (!c.length) break; k = (c.find(e => /galar$/.test(e.to)) || c[lv % c.length]).to; }
  return k;
}
const WGA = (...list) => WG(8)(...list.map(x => { const [spec, held] = x.split("@"), [k, rest = ""] = spec.split(":"), LV = parseInt(rest, 10) || 0;
  return (LV && OPS[k] ? gaGrown(k, LV) : k) + (rest ? ":" + rest : "") + (held ? "@" + held : ""); }));
// a Pokémon the games Dynamax or Gigantamax (a Gym Leader's or a rival's ace, a Max Raid's, the stadiums' rampaging Pokémon): its aura,
// Defense and Sp. Def +1 as stat stages fixed to it while it's on the field (the owner's pick: the game has no Dynamax)
const DMAX = { def: 1, sdf: 1 };
const DYN = (spec, n = "Dynamax") => WGA(spec).map(s => ({ ...s, aura: DMAX, auraN: n }));
const GMX = spec => DYN(spec, "Gigantamax");
// Galar's eight, in Sword's Gym order (the owner's pick: Bea and Gordie; Shield's Allister and Melony are side stages beside them, no Badge).
// Gen 8 Badges raise no stats. Pictures: the owner's sheet (pack_badges.py: galar_grass ... galar_dragon, by type, the names repeat)
const GALAR_BADGES = [
  { n: "Grass Badge", pic: "galar_grass", gym: "Turffield Stadium", leader: "Milo", type: "Grass", col: "#5aa84a", path: "M20 3C11 3 4 8 4 16c0 2 1 4 2 5 1-6 5-10 10-12-4 3-7 7-8 12 9 0 12-9 12-18z" },
  { n: "Water Badge", pic: "galar_water", gym: "Hulbury Stadium", leader: "Nessa", type: "Water", col: "#3a8ad8", path: "M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z" },
  { n: "Fire Badge", pic: "galar_fire", gym: "Motostoke Stadium", leader: "Kabu", type: "Fire", col: "#e8642e", path: "M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-2-1-4-3-5 1 2 0 4-2 4-1.5 0-2.5-1.5-2-3 .5-2 1-4 1-7z" },
  { n: "Fighting Badge", pic: "galar_fighting", gym: "Stow-on-Side Stadium", leader: "Bea", type: "Fighting", col: "#c84a3a", path: "M5 9a2 2 0 0 1 3.5-1.5A2 2 0 0 1 12 7a2 2 0 0 1 3.5.5A2 2 0 0 1 19 9v6a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" },
  { n: "Fairy Badge", pic: "galar_fairy", gym: "Ballonlea Stadium", leader: "Opal", type: "Fairy", col: "#e890b0", path: "M12 21C5 15 3 11 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 13z" },
  { n: "Rock Badge", pic: "galar_rock", gym: "Circhester Stadium", leader: "Gordie", type: "Rock", col: "#b8a040", path: "M2 20l6-12 4 5 3-9 7 16z" },
  { n: "Dark Badge", pic: "galar_dark", gym: "Spikemuth", leader: "Piers", type: "Dark", col: "#5a4a5a", path: "M15 3a9 9 0 1 0 6 15A8 8 0 0 1 15 3z" },
  { n: "Dragon Badge", pic: "galar_dragon", gym: "Hammerlocke Stadium", leader: "Raihan", type: "Dragon", col: "#5a5ad8", path: "M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6z" },
];
REGION_BADGES.galar = GALAR_BADGES;
// (Hop's Wooloo has Run Away in Sword and Shield, not the species' usual Fluffy: `ab`, kept by convWave)
// your starter's lines (Sword and Shield): Hop takes the starter weak to yours, and the one strong against it stays with Leon, who
// brings it to the Championship with the Pokémon that covers it (Seismitoad, Mr. Rime or Rhyperior)
const GALAR_LINE = { grookey: ["grookey", "thwackey", "rillaboom"], scorbunny: ["scorbunny", "raboot", "cinderace"], sobble: ["sobble", "drizzile", "inteleon"] };
const GALAR_WEAK = { grookey: "sobble", scorbunny: "grookey", sobble: "scorbunny" }, GALAR_STRONG = { grookey: "scorbunny", scorbunny: "sobble", sobble: "grookey" };
const galarStarter = () => { const k = regionStarter("galar"); return GALAR_LINE[k] ? k : "grookey"; };
const hopMon = st => GALAR_LINE[GALAR_WEAK[galarStarter()]][st];
const leonAce = () => GALAR_LINE[GALAR_STRONG[galarStarter()]][2];
const leonSix = () => ({ grookey: "seismitoad", scorbunny: "mrrime", sobble: "rhyperior" })[galarStarter()];
const hopTR = (intro, lose) => TR("Pokémon Trainer Hop", "ga_hop", intro, lose);
const bedeTR = (intro, lose, t = "ga_bede") => TR("Pokémon Trainer Bede", t, intro, lose);
const marnieTR = (intro, lose, t = "ga_marnie") => TR("Pokémon Trainer Marnie", t, intro, lose);
const yellTR = (intro, lose, f = false, n = "Team Yell Grunt") => TR(n, f ? "ga_yellf" : "ga_yell", intro, lose);
const gaGymTR = (n, f, intro, lose) => TR("Gym Trainer " + n, f ? "ga_stafff" : "ga_staff", intro, lose);
// a Gym Leader's stage, for the music while its scene plays (a10_boot.js): the Gym Leader's Theme, Spikemuth's own street for Piers
const galarHall = nd => /Piers/.test((nd.trainer || {}).name || "") ? "gaSpikemuth" : "gaLeaderTheme";
// What a stage's scenes hand you is its `reward`, given on its first clear (the owner's rule, 2026-10-16): items, held items, a TM, a
// Pokémon, and story key items (ga_*, tools/key_items/galar.json). gaTM: a Gen 8 TM by its move (tmId in a6_state.js loads after this file)
const gaTM = mv => (TMS.find(t => t[3] === mv && t[1] === 8) || [])[0];
// Leon's gift in Motostoke: the item that powers up your starter's moves
const GALAR_STARTER_ITEM = { grookey: "miracleseed", scorbunny: "charcoal", sobble: "mysticwater" };

const GALAR_JOURNEY = {
  id: "galar", title: "Galar Journey", sub: "The Gym Challenge",
  blurb: "Set out from Postwick with a partner from Champion Leon, take on Galar's Gym Challenge in its eight stadiums, win the Champion Cup, face the Darkest Day, and battle Leon for the title of Champion.",
  chapters: [
    { id: "c1", title: "Postwick and Wedgehurst", env: "route", map: "route", reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Postwick: The Champion's Exhibition", music: "gaExhibition", reward: { key: "ga_dadsbag" }, pre: [
          L("narr", "Postwick, the smallest town in Galar: a few farmhouses, a lot of Wooloo, and the gate to a forest nobody is allowed into."),
          L("narr", "On your Rotom Phone, Champion Leon's Charizard wins another exhibition match in Wyndon, and the crowd goes wild. Chairman Rose of the Pokémon League waves from the stands."),
          L("gamom", "Hop's at the door again. Leon's coming home today, and he's bringing you both a present! Take your dad's old bag and hat. Off you go."),
          L("gahop", "Come on, come on! My brother's train gets into Wedgehurst any minute. The Champion's coming home!"),
        ] },
        { id: "b", type: "story", name: "Wedgehurst Station: Leon Comes Home", music: "gaLeon", pre: [
          L("narr", "A crowd has packed the station in Wedgehurst. In the middle of it, in a cape covered in sponsors' logos, the unbeatable Champion strikes his famous pose."),
          L("galeon", "Hop! And you must be Hop's best friend. I've heard all about you. Let's head home. I'll lead the way!"),
          L("gahop", "...Lee's the best Trainer in Galar. He's also the worst at directions. Let's not lose him."),
        ] },
        { id: "c", type: "story", name: "Postwick: Leon's Present", starter: 1, music: "gaPostwick", pre: [
          L("narr", "In the yard behind Hop's house, three Pokémon tumble out of Leon's Poké Balls: Grookey, drumming with its stick, Scorbunny, hopping on the spot, and shy Sobble."),
          L("galeon", "These three are for you two. Pick your partner, and that's the first page of your story. Our guest goes first, Hop."),
        ], post: [
          L("gahop", "Then I'll take this one! We're going to be the best team in Galar. Lee, watch us!"),
          L("galeon", "Hop picked the one yours is strong against. Ha! And the last one stays with me."),
        ] },
        // (Hop's starter is the one weak to yours; the first rival battle is below the games' Lv 5 all the same: README, House rules. Hop
        // has two Pokémon here, and they come one at a time, as in Sword and Shield, against your one: a normal stage, not a big battle)
        { id: "d", type: "battle", name: "Postwick: Hop", lv: 4, env: "route", music: "gaHop", get trainer() { return hopTR("You're my rival now, all right? So our first battle is starting right now! Watch me, Lee!", "Wait... I lost? Our first battle and I lost! Ha! You're good."); },
          get waves() { return [[{ ...WGA("wooloo:3")[0], moves: ["tackle"], ab: "run-away" }], [{ ...WGA(hopMon(0) + ":4")[0], moves: { grookey: ["scratch", "growl"], scorbunny: ["tackle", "growl"], sobble: ["pound", "growl"] }[hopMon(0)] }]]; }, post: [
          L("galeon", "What a match! You both treated your Pokémon well. That's what makes a Trainer worth watching."),
        ] },
        { id: "e", type: "battle", name: "Slumbering Weald", lv: 3, env: "forest", wild: 1, music: "gaWeald", waves: [WGA("skwovet:2"), WGA("rookidee:2"), WGA("skwovet:3")], pre: [
          L("narr", "Next morning, the gate to the Slumbering Weald hangs open, and the Wooloo that was pushing at it is gone. Hop doesn't think twice: you're both going in after it."),
          L("gahop", "The adults say nobody comes back from the Weald the same. That's just a story... right?"),
        ] },
        { id: "f", type: "story", name: "Slumbering Weald: In the Fog", music: "gaFog", pre: [
          L("narr", "The fog thickens until you can't see your own feet. Something howls. A great wolf-like Pokémon steps out of the white, and your partner's attacks pass straight through it."),
          L("narr", "The fog swallows everything. When you wake up, Leon and his Charizard are standing over you, and the lost Wooloo is safe in Leon's arms."),
          L("galeon", "You went into the Weald for a Wooloo? Brave, both of you. A Pokémon your moves couldn't touch, huh... Get strong enough, and maybe one day you'll find out what it was."),
          L("gahop", "This is chapter one of my legend. Our legend!"),
        ] },
        { id: "g", type: "battle", name: "Route 1: Skwovet", lv: 4, env: "route", wild: 1, catch: "skwovet", music: "gaRoute1", waves: [WGA("caterpie:3"), WGA("skwovet:4")], pre: [
          L("narr", "Wooloo have wandered onto the straight path to Wedgehurst again, so you take the long way through the grass. There are five Poké Balls in your dad's old bag."),
          L("narr", "A Skwovet stuffs its cheeks with berries under a tree. It only ever feels safe with its cheeks full."),
        ], post: [L("narr", "Gotcha! Skwovet was caught! It hides berries all over Galar, then forgets where it put them.")] },
        { id: "h", type: "side", name: "Route 1: Wooloo", lv: 5, env: "route", wild: 1, catch: "wooloo", music: "gaRoute1", waves: [WGA("skwovet:4"), WGA("wooloo:5")], pre: [
          L("narr", "One of the Wooloo blocking the road rolls off into the grass. Its fleece is so thick that blows bounce off it."),
        ], post: [L("narr", "Gotcha! Wooloo was caught! Galar's Trainers knit its fleece into warm clothes.")] },
        { id: "i", type: "side", name: "Route 1: Rookidee", lv: 5, env: "route", wild: 1, catch: "rookidee", music: "gaRoute1", waves: [WGA("hoothoot:4"), WGA("rookidee:5")], pre: [
          L("narr", "A Rookidee pecks at a much bigger Pokémon's tail, just to show it can."),
        ], post: [L("narr", "Gotcha! Rookidee was caught! It's small, but it picks fights with Pokémon much bigger than itself.")] },
        { id: "j", type: "side", name: "Route 1: Blipbug", lv: 4, env: "route", wild: 1, catch: "blipbug", music: "gaRoute1", waves: [WGA("grubbin:3"), WGA("blipbug:4")], pre: [
          L("narr", "Blipbug feel their way through the grass with the hairs on their bodies. They're cleverer than they look."),
        ], post: [L("narr", "Gotcha! Blipbug was caught! It gathers information with its hairs, and it learns quickly.")] },
        { id: "k", type: "side", name: "Route 1: Nickit", lv: 5, env: "route", wild: 1, catch: "nickit", music: "gaRoute1", waves: [WGA("skwovet:4"), WGA("nickit:5")], pre: [
          L("narr", "A fox's tail flicks out of the grass and a berry goes missing. A Nickit, wiping out its tracks as it goes."),
        ], post: [L("narr", "Gotcha! Nickit was caught! It steals food from other Pokémon and sweeps away its footprints.")] },
        { id: "l", type: "story", name: "Wedgehurst: The Pokémon Research Lab", music: "gaSonia", pre: [
          L("narr", "Leon takes you to the Pokémon Research Lab on the east side of Wedgehurst, where his childhood friend, Sonia, is the assistant."),
          L("gasonia", "Leon! You're late. As usual. Oh, these two are your new Trainers? Here: a Pokédex each. My gran's the professor, and she lives across Route 2. Go and see her."),
          L("gahop", "Professor Magnolia! She's the one who studies Dynamax. Come on!"),
        ] },
        { id: "m", type: "battle", name: "Route 2: Novice Trainers", lv: 6, env: "route", music: "gaEyesYoungster", reward: { key: "ga_pokeballs" },
          trainer: TR("Youngster Jake, Lass Lauren and Youngster Benjamin", "ga_youngster", "We started our Gym Challenge practice today! You too? Let's see whose Pokémon are better!", "Aww. You're going to be great in the Gym Challenge."),
          waves: [WGA("skwovet:6"), WGA("chewtle:6"), WGA("blipbug:5"), WGA("nickit:7")], pre: [
          L("galeon", "Here's a Trainer tip: every Trainer you meet on a route is a lesson. And here's twenty Poké Balls. Go and catch some friends!"),
        ] },
        { id: "n", type: "battle", name: "Route 2: Galarian Zigzagoon", lv: 6, env: "route", wild: 1, catch: "zigzagoongalar", music: "gaRoute1", waves: [WGA("rookidee:5"), WGA("zigzagoongalar:6")], pre: [
          L("narr", "A Zigzagoon zigzags across the path, but this one is black and white, and sticks out its tongue at you. Galar's Zigzagoon are a rowdy bunch."),
        ], post: [L("narr", "Gotcha! Galarian Zigzagoon was caught! It's said to be the oldest kind of Zigzagoon there is.")] },
        { id: "o", type: "side", name: "Route 2: Yamper", lv: 7, env: "route", wild: 1, catch: "yamper", music: "gaRoute1", waves: [WGA("purrloin:5"), WGA("yamper:7")], pre: [
          L("narr", "A Yamper races up and down the riverbank, sparks crackling off its tail every time it barks."),
        ], post: [L("narr", "Gotcha! Yamper was caught! Its tail makes electricity as it runs.")] },
        { id: "p", type: "side", name: "Route 2: Chewtle", lv: 6, env: "sea", wild: 1, catch: "chewtle", music: "gaRoute1", waves: [WGA("magikarp:5"), WGA("chewtle:6")], pre: [
          L("narr", "Something in the lake bites your fishing line clean through. A Chewtle, chewing on whatever it can find."),
        ], post: [L("narr", "Gotcha! Chewtle was caught! It bites anything that moves to sharpen the horn on its head.")] },
        { id: "q", type: "side", name: "Route 2: Arrokuda", lv: 6, env: "sea", wild: 1, catch: "arrokuda", music: "gaRoute1", waves: [WGA("magikarp:5"), WGA("arrokuda:6")], pre: [
          L("narr", "A fish like an arrow shoots out of the water and snaps at your lure: Arrokuda."),
        ], post: [L("narr", "Gotcha! Arrokuda was caught! It charges at prey jaw first.")] },
        { id: "r", type: "boss", name: "Route 2: Hop at Professor Magnolia's", lv: 8, env: "route", music: "gaHop", get trainer() { return hopTR("Lee won't endorse us unless we show him something special. So let's give him a battle he won't forget!", "That's it, I'm sure of it now: you're my rival!"); },
          rivalWaves: () => [[{ ...WGA("wooloo:6")[0], ab: "run-away" }, ...WGA("rookidee:5", hopMon(0) + ":8!")]], pre: [
          L("gamagnolia", "So you're the two Leon has told me about. Leon dear, endorse them for the Gym Challenge. You won't regret it."),
          L("galeon", "An endorsement from the Champion is a big deal, Professor. Hop, you and your friend can show me with a battle. Out in the garden!"),
        ] },
        { id: "s", type: "story", name: "Professor Magnolia's House: Two Wishing Stars", music: "gaWedgehurst", reward: { key: "ga_campinggear" }, pre: [
          L("galeon", "Right! I'll endorse you both for the Gym Challenge. Win eight Badges in the stadiums, then face me for the title!"),
          L("narr", "Two Wishing Stars fall from the sky into the garden, glowing red. Professor Magnolia picks them up with a smile."),
          L("gamagnolia", "The Wishing Stars hold Galar's Dynamax energy. It's that energy that lets the Gym Leaders' Pokémon grow giant in the stadiums. Keep your eyes open, you two."),
          L("narr", "Next morning, your mom meets you at Wedgehurst Station with camping gear and a hug. The train leaves for Motostoke and the Gym Challenge."),
        ] },
      ] },
    { id: "c2", title: "The Wild Area and Motostoke", env: "route", map: "route", reward: { lmd: 4000, orundum: 300, moonstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "The Wild Area: Wooloo on the Tracks", music: "gaStation", pre: [
          L("narr", "The train stops halfway: a flock of Wooloo is lying across the tracks. You and Hop will have to walk to Motostoke, through the Wild Area."),
          L("gasonia", "Welcome to the Wild Area! Pokémon of every kind live here, and the weather changes which ones come out. And those red lights? Dens. Pokémon there Dynamax all by themselves."),
        ] },
        { id: "b", type: "battle", name: "Rolling Fields", lv: 9, env: "route", wild: 1, music: "gaWildSouth", waves: [WGA("bunnelby:8", "wingull:8"), WGA("electrike:9", "pancham:9")], pre: [
          L("narr", "The grass of the Rolling Fields goes on for miles, and every patch of it rustles with Pokémon you've never seen before."),
        ] },
        { id: "c", type: "side", name: "Rolling Fields: A Max Raid Battle", lv: 15, env: "route", wild: 1, catch: "wooloo", music: "gaMaxRaid", waves: [DYN("wooloo:15!")], pre: [
          L("narr", "A den in the Rolling Fields glows red. A Wooloo inside has soaked up the Dynamax energy and grown as tall as a house."),
          L("narr", "A Dynamax Pokémon's aura raises its Defense and Sp. Def from the start, for as long as it stays out."),
        ], post: [L("narr", "Gotcha! Wooloo was caught! Back to its usual size, it bounces off happily.")] },
        { id: "d", type: "side", name: "The Wild Area: Pokémon Breeder Chloe", lv: 13, env: "route", music: "gaEyesBreeder", trainer: TR("Pokémon Breeder Chloe", "ga_breederf", "I raise all three of Galar's starters! Want to see how they're doing?", "They're doing great... just not as great as yours!"),
          waves: [WGA("grookey:13"), WGA("scorbunny:13"), WGA("sobble:13")] },
        { id: "e", type: "story", name: "Motostoke: The Steam City", music: "gaMotostoke", get reward() { return { held: GALAR_STARTER_ITEM[galarStarter()] }; }, pre: [
          L("narr", "Motostoke is all brick, steam and cogs, built in tiers up the hill to its stadium. Sonia shows you the Pokémon Center, then Leon catches up with you on the upper tier."),
          L("galeon", "A little something for the road: the item that powers up your partner's moves. Now go sign up at the stadium!"),
          L("narr", "At the reception desk, a boy with curly white hair looks you up and down. \"Chairman Rose endorsed me. And who endorsed you? Oh, the Champion. I see.\" He walks off without giving his name."),
        ] },
        { id: "f", type: "battle", name: "Budew Drop Inn: Team Yell", lv: 9, env: "city", music: "gaYellAppears", trainer: yellTR("Hey, hey! Gym Challengers don't get a room here tonight! Team Yell's orders!", "Aw, no! Marnie's gonna hear about this!"),
          waves: [WGA("zigzagoongalar:9"), WGA("nickit:9"), WGA("zigzagoongalar:9", "nickit:9")], pre: [
          L("narr", "In the lobby of the Budew Drop Inn, a gang in black and pink is blocking the stairs. Hop takes one side of the double battle with you."),
        ], post: [
          L("gamarnie", "Team Yell! Enough. Sorry about them. They're my fans, and they get carried away. I'm Marnie. See you at the opening ceremony."),
        ] },
        { id: "g", type: "story", name: "Motostoke Stadium: The Opening Ceremony", music: "gaCeremony", pre: [
          L("narr", "Next morning, the stadium is full to the roof. The Gym Leaders walk out onto the pitch one by one to the roar of the crowd: Milo, Nessa, Kabu, Bea, Opal, Gordie, Piers, Raihan."),
          L("garose", "Welcome, challengers, to the Gym Challenge! Eight Badges, eight stadiums, and at the end, the Champion Cup. I can't wait to see what you'll show us!"),
        ] },
        { id: "h", type: "boss", name: "Motostoke: Hop", lv: 14, env: "city", music: "gaHop", get trainer() { return hopTR("The Gym Challenge has officially started, and so has our rivalry! Let's see who's grown more since yesterday!", "Not bad! You're the reason I'm going to get even stronger."); },
          rivalWaves: () => [[{ ...WGA("wooloo:11")[0], ab: "run-away" }, ...WGA("rookidee:12", hopMon(0) + ":14!")]], pre: [
          L("gahop", "Route 3's that way, then Galar Mine, then Turffield and the first Gym! But first, one more battle. For luck!"),
        ] },
      ] },
    { id: "c3", title: "Route 3, Galar Mine and Turffield", env: "route", map: "route", reward: { lmd: 5000, orundum: 400, leafstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 3: Schoolkids", lv: 13, env: "route", music: "gaRoute3", trainer: TR("Schoolgirl Hannah and New Schoolboys Marvin and Peter", "ga_schoolkidf", "Our teacher says Gym Challengers are the best practice there is!", "We'll study harder next time!"),
          waves: [WGA("pancham:13"), WGA("budew:12", "gossifleur:12"), WGA("sizzlipede:13", "dottler:14")] },
        { id: "b", type: "story", name: "Route 3: Sonia and the Legend", music: "gaOldLegend", reward: { key: "ga_escaperope" }, pre: [
          L("gasonia", "Want to hear a story? Long ago, the Darkest Day came over Galar. A great black storm. Two young heroes stood up to it with a sword and a shield, and they saved Galar."),
          L("gasonia", "Gran says it's just a legend. I'm not so sure. Here: an Escape Rope. Every researcher needs one."),
        ] },
        { id: "c", type: "battle", name: "Route 3: Gossifleur", lv: 13, env: "route", wild: 1, catch: "gossifleur", music: "gaRoute3", waves: [WGA("machop:12", "klink:12"), WGA("gossifleur:13")], pre: [
          L("narr", "A Gossifleur spins slowly in the breeze on Route 3, scattering pollen. Anything that breathes it in feels very, very relaxed."),
        ], post: [L("narr", "Gotcha! Gossifleur was caught! It whirls around and sings in the sunshine.")] },
        { id: "d", type: "side", name: "Route 3: Sizzlipede", lv: 13, env: "route", wild: 1, catch: "sizzlipede", music: "gaRoute3", waves: [WGA("mudbray:12"), WGA("sizzlipede:13")], pre: [
          L("narr", "Something hot slithers out from under a rock. Sizzlipede store flammable gas in their bodies, and they're warm to the touch."),
        ], post: [L("narr", "Gotcha! Sizzlipede was caught! It wraps its prey in its warm body.")] },
        { id: "e", type: "side", name: "Route 3: Corvisquire", lv: 18, env: "route", wild: 1, catch: "corvisquire", music: "gaRoute3", waves: [WGA("rookidee:13"), WGA("corvisquire:18")], pre: [
          L("narr", "A Corvisquire circles above the path, much stronger than anything else here. Smart Trainers keep their distance. You don't."),
        ], post: [L("narr", "Gotcha! Corvisquire was caught! It's clever enough to use tools in battle.")] },
        { id: "f", type: "battle", name: "Galar Mine: The Workers", lv: 14, env: "cave", music: "gaMine", trainer: TR("Workers Keith, Georgia and Russel", "ga_worker", "Hey, this mine's still working! Gym Challengers always think they can just stroll through!", "Fine, fine. Mind the carts on the way out."),
          waves: [WGA("roggenrola:14"), WGA("timburr:14", "timburr:14", "timburr:14"), WGA("rolycoly:15")] },
        { id: "g", type: "battle", name: "Galar Mine: Rolycoly", lv: 14, env: "cave", wild: 1, catch: "rolycoly", music: "gaMine", waves: [WGA("woobat:12", "diglett:12"), WGA("rolycoly:14")], pre: [
          L("narr", "The mine's walls glitter with crystals. Something round and black rolls along the cart tracks: a Rolycoly, burning like a lump of coal."),
        ], post: [L("narr", "Gotcha! Rolycoly was caught! Galar's people once burned the coal that falls off its body.")] },
        { id: "h", type: "boss", name: "Galar Mine: Bede", lv: 16, env: "cave", music: "gaBede", trainer: bedeTR("Ah, the Champion's little favorite. I'm Bede, and Chairman Rose himself endorsed me. Let me show you the difference between us.", "...You're lucky. That's all this was. Luck."),
          waves: [WGA("solosis:13", "gothita:15"), WGA("hatenna:16!")], pre: [
          L("narr", "Just before the mine's exit, the boy from the stadium is waiting for you with his arms folded."),
        ] },
        { id: "i", type: "battle", name: "Route 4: Galarian Meowth", lv: 15, env: "route", wild: 1, catch: "meowthgalar", music: "gaRoute3", waves: [WGA("budew:13", "joltik:14"), WGA("meowthgalar:15")], pre: [
          L("narr", "Route 4's fields run north to Turffield. A Meowth with a coat like steel wool hisses at you from a fence."),
        ], post: [L("narr", "Gotcha! Galarian Meowth was caught! Living with Galar's seafaring Vikings made its body hard as iron.")] },
        { id: "j", type: "side", name: "Route 4: Milcery", lv: 15, env: "route", wild: 1, catch: "milcery", music: "gaRoute3", waves: [WGA("cutiefly:13"), WGA("milcery:15")], pre: [
          L("narr", "A sweet smell drifts over the field. A Milcery, made of cream, bobs between the flowers."),
        ], post: [L("narr", "Gotcha! Milcery was caught! It's said to have been born from the sweet scent in the air.")] },
        { id: "k", type: "battle", name: "Route 4: Trainers", lv: 15, env: "route", music: "gaEyesBreeder", trainer: TR("Pokémon Breeder Jaime and Poké Kids Shane and Sunny", "ga_breeder", "Look at my Meowth's fur! Isn't it the shiniest you've ever seen?", "Very shiny. Also very beaten."),
          waves: [WGA("meowthgalar:14", "seedot:14", "butterfree:15"), WGA("pikachu:15"), WGA("milcery:15")] },
        { id: "l", type: "story", name: "Turffield: The Geoglyph", music: "gaTurffield", pre: [
          L("narr", "Turffield is farmland and Wooloo. Above the town, cut into the hillside, is a huge, ancient picture."),
          L("gasonia", "The geoglyph! It shows a giant Pokémon, and a hero. Gran thinks Dynamax has been part of Galar for a very, very long time."),
          L("gahop", "I beat Milo already! He's tough, but you'll be fine. Go get your first Badge!"),
        ] },
        { id: "m", type: "battle", name: "Turffield Stadium: Gym Trainers", lv: 17, env: "gym", music: "gaGymMission", trainer: gaGymTR("Samuel, Mark and Leah", false, "Round up the Wooloo, and get through us too! That's Milo's Gym Mission!", "The Wooloo listened to you better than us!"),
          waves: [WGA("gossifleur:16"), WGA("budew:16", "oddish:17"), WGA("bounsweet:17", "oddish:17")], pre: [
          L("narr", "Turffield's Gym Mission: herd twenty Wooloo through the pitch, while a Yamper barks them the wrong way and Milo's Gym Trainers stand in your way."),
        ] },
        { id: "n", type: "boss", name: "Turffield Stadium: Gym Leader Milo", lv: 20, env: "gym", badgeWin: 0, reward: { tm: gaTM("magicalleaf"), key: "ga_grassuniform" },
          trainer: TR("Gym Leader Milo", "ga_milo", "My Pokémon and I grow strong together on the farm, like the wheat. Let's see if you can stand up to a good, strong breeze!", "You've been well raised! Here's the Grass Badge, as you've earned it."),
          waves: [WGA("gossifleur:19"), DYN("eldegoss:20!")], pre: [
          L("gamilo", "Leon endorsed you? Then you'll know what this is: a real Gym battle, in front of a real crowd. Don't hold back, mind!"),
          L("narr", "Fire, Flying, Ice, Poison and Bug moves hit Grass types hard. Milo's ace Dynamaxes as it comes out: its aura raises its Defense and Sp. Def."),
        ], post: [
          L("gamilo", "Take TM10 as well, Magical Leaf. And the Grass Uniform: you'll be wearing it with pride, I hope!"),
        ] },
      ] },
    { id: "c4", title: "Route 5 and Hulbury", env: "sea", map: "sea", reward: { lmd: 5000, orundum: 400, waterstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 5: Trainers", lv: 18, env: "route", music: "gaEyesBreeder", trainer: TR("Pokémon Breeders Debra and Adrian, and Cook Stuart", "ga_breederf", "The Pokémon Nursery's just down the road. Battle me while you're passing?", "Off you go. Mind the bridge, there's trouble on it."),
          waves: [WGA("minccino:17", "steenee:19"), WGA("stufful:17", "cutiefly:18", "ralts:19"), WGA("applin:20")] },
        { id: "b", type: "battle", name: "Route 5: Applin", lv: 17, env: "route", wild: 1, catch: "applin", music: "gaRoute3", waves: [WGA("dottler:16"), WGA("applin:17")], pre: [
          L("narr", "An apple sits at the foot of a tree on Route 5. Then it looks at you. Applin spend their whole lives inside an apple."),
        ], post: [L("narr", "Gotcha! Applin was caught! A sweet apple or a tart apple decides what it becomes.")] },
        { id: "c", type: "battle", name: "Route 5: Galarian Farfetch'd", lv: 20, env: "route", wild: 1, catch: "farfetchdgalar", music: "gaRoute3", waves: [WGA("cherubi:17", "skwovet:17"), WGA("farfetchdgalar:20")], pre: [
          L("narr", "A Farfetch'd with a thick leek like a spear stands in the road, daring anyone to pass. In Galar, they're warriors."),
        ], post: [L("narr", "Gotcha! Galarian Farfetch'd was caught! Its leek is its weapon and its shield.")] },
        { id: "d", type: "side", name: "Route 5: Dottler", lv: 18, env: "route", wild: 1, catch: "dottler", music: "gaRoute3", waves: [WGA("blipbug:16"), WGA("dottler:18")], pre: [
          L("narr", "A Dottler sits perfectly still in the grass, peering out of its shell with psychic power."),
        ], post: [L("narr", "Gotcha! Dottler was caught! It barely moves, but it's always watching.")] },
        { id: "e", type: "side", name: "Route 5: Eldegoss", lv: 22, env: "route", wild: 1, catch: "eldegoss", music: "gaRoute3", waves: [WGA("gossifleur:17"), WGA("eldegoss:22")], pre: [
          L("narr", "Cotton drifts on the wind from an Eldegoss resting by the river. Its seeds are full of nutrients."),
        ], post: [L("narr", "Gotcha! Eldegoss was caught! Its cotton seeds help plants grow wherever they land.")] },
        { id: "f", type: "side", chest: 1, name: "Route 5: The Pokémon Nursery's Toxel", reward: { op: "toxel", lmd: 2000 }, music: "gaRoute3", pre: [
          L("narr", "The Nursery worker on Route 5 has a Toxel nobody came back for. \"It's a handful,\" she says, \"but it'll grow up into something wonderful with the right Trainer.\""),
        ] },
        { id: "g", type: "battle", name: "Route 5: Team Yell", lv: 18, env: "route", music: "gaYellAppears", reward: { key: "ga_rotombike" }, trainer: yellTR("This doctor's not crossing the bridge! Nobody gets to Hulbury unless Marnie gets there first!", "Ugh, come on! Marnie's never gonna let us hear the end of this..."),
          waves: [WGA("zigzagoongalar:17", "thievul:18"), WGA("sableye:18")], post: [
          L("narr", "The doctor Team Yell was blocking is the inventor of the Rotom Bike. He gives you one, by way of a thank-you."),
        ] },
        { id: "h", type: "boss", name: "Route 5: Hop", lv: 21, env: "route", music: "gaHop", get trainer() { return hopTR("One Badge each! Now let's see who's ready for Nessa!", "Brilliant! You're always one step ahead."); },
          rivalWaves: () => [[{ ...WGA("wooloo:18")[0], ab: "run-away" }, ...WGA("corvisquire:19", hopMon(1) + ":21!")]] },
        { id: "i", type: "story", name: "Hulbury: The Chairman in Disguise", music: "gaHulbury", pre: [
          L("narr", "Hulbury is a fishing port with a lighthouse, gulls, and the smell of the sea. A crowd has gathered around a man in shorts and sunglasses. It's Chairman Rose, in what he thinks is a disguise."),
          L("garoseinc", "Ah, Leon's challenger! Bede's just been to see me. Off you go to the stadium, and join me at the Captain's Table for dinner afterwards!"),
          L("gaoleana", "Chairman, your schedule. We're leaving."),
        ] },
        { id: "j", type: "battle", name: "Hulbury Stadium: Gym Trainers", lv: 21, env: "gym", music: "gaGymMission", reward: { key: "ga_lcnessa" }, trainer: gaGymTR("Julia, Heather and Lynn", true, "Nessa's at the lighthouse, and her Gym Mission's all switches and waterfalls. Good luck!", "Splash! You're through."),
          waves: [WGA("tympole:21"), WGA("krabby:20", "corphish:20"), WGA("remoraid:20", "chewtle:21")], pre: [
          L("narr", "Nessa meets you at the lighthouse, gives you her League Card and dares you to make it through her Gym's pipes and switches."),
        ] },
        { id: "k", type: "boss", name: "Hulbury Stadium: Gym Leader Nessa", lv: 24, env: "sea", badgeWin: 1, reward: { tm: gaTM("whirlpool") },
          trainer: TR("Gym Leader Nessa", "ga_nessa", "I'm Nessa, and I'm going to wash you right out of the Gym Challenge. Ready to be swept away?", "You're even stronger than I heard. The Water Badge is yours!"),
          waves: [WGA("goldeen:22", "arrokuda:23"), GMX("drednaw:24!")], pre: [
          L("ganessa", "My Drednaw's been looking forward to this. Don't keep it waiting!"),
          L("narr", "Grass and Electric moves hit Water types hard; Drednaw is part Rock, so Fighting and Ground work too, but not Electric. Nessa's Drednaw Gigantamaxes."),
        ], post: [
          L("ganessa", "And take TM36 with it: Whirlpool. A souvenir from Hulbury!"),
          L("narr", "At the Captain's Table, Chairman Rose talks about Galar's energy, and the future. Then Oleana hurries him away, and Sonia frowns."),
        ] },
        { id: "l", type: "battle", name: "Galar Mine No. 2: Trainers", lv: 22, env: "cave", music: "gaMine", trainer: TR("Workers Francis and Yvonne, and Rail Staff Vincent", "ga_worker", "The second mine's flooded in places. Watch your step, and your Pokémon!", "Right, through you go."),
          waves: [WGA("carkol:21"), WGA("roggenrola:20", "timburr:21"), WGA("drilbur:22", "onix:23")] },
        { id: "m", type: "boss", name: "Galar Mine No. 2: Bede", lv: 23, env: "cave", music: "gaBede", trainer: bedeTR("The Chairman asked me to find Wishing Stars, and you're in my way. Again.", "This... changes nothing. I'll still be the one who becomes Champion."),
          waves: [WGA("solosis:21", "gothita:22"), WGA("ponytagalar:22", "hatenna:23!")], pre: [
          L("gahop", "It's him again. Be careful: he's a lot stronger than last time."),
        ] },
        { id: "n", type: "battle", name: "Galar Mine No. 2: Team Yell", lv: 22, env: "cave", music: "gaYellAppears", trainer: yellTR("Here comes the Champion's pet challenger! Team Yell's not letting you out of this mine!", "Wait, wait, Kabu's coming! Run for it!"),
          waves: [WGA("linoonegalar:22", "pancham:21"), WGA("thievul:21", "liepard:22")], post: [
          L("gakabu", "Team Yell, in my mine? Off with you. You two: I am Kabu, and I'll be waiting for you at Motostoke Stadium. Train hard."),
        ] },
        { id: "o", type: "side", name: "Galar Mine No. 2: Galarian Stunfisk", lv: 25, env: "cave", wild: 1, catch: "stunfiskgalar", music: "gaMine", waves: [WGA("chewtle:21"), WGA("stunfiskgalar:25")], pre: [
          L("narr", "Something that looks like a lost item is lying on the mine's floor. Step on it, and the trap snaps shut: a Galarian Stunfisk."),
        ], post: [L("narr", "Gotcha! Galarian Stunfisk was caught! The iron in Galar's mud changed its body.")] },
        { id: "p", type: "side", name: "Galar Mine No. 2: Drednaw", lv: 24, env: "cave", wild: 1, catch: "drednaw", music: "gaMine", waves: [WGA("chewtle:21"), WGA("drednaw:24")], pre: [
          L("narr", "A Drednaw guards a pool in the mine, snapping its jaws at anything that comes close."),
        ], post: [L("narr", "Gotcha! Drednaw was caught! Its jaws can bite through iron.")] },
      ] },
    { id: "c5", title: "Motostoke Outskirts and Kabu", env: "city", map: "city", reward: { lmd: 6000, orundum: 400, firestone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Motostoke Outskirts: Night Patrol", lv: 23, env: "city", music: "gaMotostoke", trainer: TR("Madame Caroline and Police Officer Raymond", "ga_madame", "Out so late? The Outskirts aren't safe at night, dear. Let me see if you can look after yourself.", "My, my. You can."),
          waves: [WGA("yamper:22", "swoobat:24"), WGA("growlithe:23")], pre: [
          L("narr", "It's dark by the time you come out of the mine into the Motostoke Outskirts, under the city's great wall and its steaming pipes."),
        ] },
        { id: "b", type: "battle", name: "Motostoke Outskirts: Impidimp", lv: 24, env: "city", wild: 1, catch: "impidimp", music: "gaMotostoke", waves: [WGA("pawniard:22", "roggenrola:22"), WGA("impidimp:24")], pre: [
          L("narr", "Something giggles in the dark and tugs your bag. Impidimp feed on the frustration of the people and Pokémon they pester."),
        ], post: [L("narr", "Gotcha! Impidimp was caught! It sneaks into homes to steal food, just to annoy people.")] },
        { id: "c", type: "side", name: "Motostoke Outskirts: Hatenna", lv: 24, env: "city", wild: 1, catch: "hatenna", music: "gaMotostoke", waves: [WGA("koffing:22"), WGA("hatenna:24")], pre: [
          L("narr", "A Hatenna peeks out from behind a pipe. It can sense people's feelings, and it runs from anyone who's angry."),
        ], post: [L("narr", "Gotcha! Hatenna was caught! It only trusts Trainers with calm hearts.")] },
        { id: "d", type: "boss", name: "Budew Drop Inn: Marnie", lv: 26, env: "city", music: "gaMarnie", reward: { key: "ga_lckabu" }, trainer: marnieTR("You and me, we're rivals now. Let's see if you're worth all the fuss.", "Hmph. Fine. You've got a good team. Here, Kabu's League Card: you'll need it."),
          waves: [WGA("croagunk:24", "scraggy:24"), WGA("morpeko:26!")], pre: [
          L("narr", "Back at the Budew Drop Inn, Marnie is waiting in the lobby with her Morpeko on her shoulder. It looks hungry. It always looks hungry."),
        ] },
        { id: "e", type: "battle", name: "Motostoke Stadium: The Gym Mission", lv: 25, env: "gym", wild: 1, catch: "sizzlipede", music: "gaGymMission", waves: [WGA("vulpix:24"), WGA("litwick:25"), WGA("sizzlipede:25")], pre: [
          L("narr", "Kabu's Gym Mission is a race: three patches of grass, three wild Pokémon, and a Gym Trainer in each one trying to beat you to them."),
        ], post: [L("narr", "Gotcha! Sizzlipede was caught! Five points, and the mission's cleared.")] },
        { id: "f", type: "boss", name: "Motostoke Stadium: Gym Leader Kabu", lv: 27, env: "volcano", badgeWin: 2, reward: { tm: gaTM("willowisp") },
          trainer: TR("Gym Leader Kabu", "ga_kabu", "Every Trainer who makes it past me is ready for the rest of the Gym Challenge. Every one who doesn't, isn't. Which are you?", "You have shown me your strength. The Fire Badge is yours."),
          waves: [WGA("ninetales:25", "arcanine:25"), GMX("centiskorch:27!")], pre: [
          L("gakabu", "I have been the wall in front of the third Gym for many years. My flames have not gone out yet!"),
          L("narr", "Water, Ground and Rock moves hit Fire types hard. Kabu's Centiskorch Gigantamaxes, and its aura raises its Defense and Sp. Def."),
        ], post: [
          L("gakabu", "Take this as well: TM38, Will-O-Wisp. Keep your own flame burning."),
          L("narr", "Milo, Nessa and Kabu see you and Hop off at the edge of town. Three Badges each: the north of the Wild Area is open to you now."),
        ] },
      ] },
    { id: "c6", title: "The Wild Area and Hammerlocke", env: "route", map: "route", reward: { lmd: 6000, orundum: 500, thunderstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "The Wild Area: Bede and Hop", music: "gaWildNorth", pre: [
          L("narr", "Back in the Wild Area, Bede is waiting for Hop. Their battle is short. Bede's Pokémon don't give Hop's an inch."),
          L("gabede", "And that is why the Chairman chose me. The Champion's little brother? Please. You're an embarrassment to him."),
          L("gahop", "...I'm fine. I'm fine! I'll catch up with you in Hammerlocke."),
        ] },
        { id: "b", type: "battle", name: "Motostoke Riverbank: Boltund", lv: 28, env: "route", wild: 1, catch: "boltund", music: "gaWildNorth", waves: [WGA("corvisquire:26", "eldegoss:27"), WGA("boltund:28")], pre: [
          L("narr", "North of the lakes, along the Motostoke Riverbank, a Boltund races the wind. Its legs are full of electricity."),
        ], post: [L("narr", "Gotcha! Boltund was caught! It can run for three days without stopping.")] },
        { id: "c", type: "side", name: "Motostoke Riverbank: Dubwool", lv: 28, env: "route", wild: 1, catch: "dubwool", music: "gaWildNorth", waves: [WGA("greedent:26"), WGA("dubwool:28")], pre: [
          L("narr", "A Dubwool grazes by the river, its fleece so springy that the Riverbank's Pokémon bounce off it."),
        ], post: [L("narr", "Gotcha! Dubwool was caught! Carpets woven from its wool are prized all over Galar.")] },
        { id: "d", type: "battle", name: "Bridge Field: Cufant", lv: 28, env: "route", wild: 1, catch: "cufant", music: "gaWildNorth", waves: [WGA("thievul:26", "carkol:26"), WGA("cufant:28")], pre: [
          L("narr", "A Cufant lumbers across Bridge Field, digging up the ground with its trunk in search of copper."),
        ], post: [L("narr", "Gotcha! Cufant was caught! It can lift five tons with its trunk.")] },
        { id: "e", type: "side", name: "Bridge Field: Cramorant", lv: 28, env: "route", wild: 1, catch: "cramorant", music: "gaWildNorth", waves: [WGA("milcery:26"), WGA("cramorant:28")], pre: [
          L("narr", "A Cramorant dives into the lake and comes up with an Arrokuda stuck in its throat. It doesn't seem to mind."),
        ], post: [L("narr", "Gotcha! Cramorant was caught! It's so strong it can knock out anything with one hit... and then forget about it.")] },
        { id: "f", type: "side", name: "Giant's Mirror: Galarian Corsola (Shield)", lv: 29, env: "route", wild: 1, catch: "corsolagalar", music: "gaWildNorth", waves: [WGA("nickit:28"), WGA("corsolagalar:29")], pre: [
          L("narr", "In Shield, a pale, ghostly Corsola haunts the shore of Giant's Mirror, where Sword's Galarian Farfetch'd walk."),
        ], post: [L("narr", "Gotcha! Galarian Corsola was caught! It was a Corsola from long ago, killed by a sudden change in the sea.")] },
        { id: "g", type: "side", name: "Stony Wilderness: A Max Raid Battle", lv: 35, env: "route", wild: 1, catch: "greedent", music: "gaMaxRaid", waves: [DYN("greedent:35!")], pre: [
          L("narr", "With three Badges, you can take on stronger dens. In the Stony Wilderness, a Greedent has Dynamaxed, its cheeks stuffed as big as boulders."),
        ], post: [L("narr", "Gotcha! Greedent was caught! It's back to its normal size, and still hungry.")] },
        { id: "h", type: "side", name: "The Wild Area: Pokémon Breeder Chloe", lv: 30, env: "route", music: "gaEyesBreeder", trainer: TR("Pokémon Breeder Chloe", "ga_breederf", "My starters have evolved! Let's see whose have grown more!", "Yours, apparently. They're beautiful."),
          waves: [WGA("raboot:30"), WGA("drizzile:30"), WGA("thwackey:30")] },
        { id: "i", type: "story", name: "Hammerlocke: The Old Castle", music: "gaHammerlocke", pre: [
          L("narr", "Hammerlocke is built around an ancient castle, and its stadium is built into the castle itself. Bede is reporting to Chairman Rose and Oleana at the gate."),
          L("garose", "Ah, Leon's challenger! Come and see something: this stadium is also Galar's power plant. The energy that lights the whole region comes from Dynamax energy, deep below."),
          L("galeon", "Hop lost to Bede? ...He'll bounce back. He always does. Now, Rose wanted to see me, which way's the meeting? This way? No?"),
          L("narr", "At the Hammerlocke Vault, a tall man in a hoodie with a phone in his hand is waiting: Raihan, Leon's rival and the Gym Leader here. Upstairs, Sonia tells you the story of the tapestries."),
        ] },
      ] },
    { id: "c7", title: "Route 6 and Stow-on-Side", env: "route", map: "route", reward: { lmd: 7000, orundum: 500, sunstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 6: Team Yell", lv: 30, env: "route", music: "gaYellAppears", reward: { key: "ga_lcopal" }, trainer: yellTR("You again? Team Yell's not letting you past this bridge!", "Aww, man! We've gotta tell Marnie... no, wait, we'd better not tell Marnie."),
          waves: [WGA("stunky:29", "linoonegalar:30"), WGA("liepard:30")], pre: [
          L("narr", "On the bridge out of Hammerlocke, two Team Yell Grunts block the way. Hop catches up, but he can't bring himself to battle."),
        ], post: [
          L("gahop", "I keep thinking about Bede. About Lee. If I lose, people will say his brother's a joke. I need to think. See you in Stow-on-Side."),
          L("gaopal", "My, my. I'm Opal, the Gym Leader of Ballonlea. I've been watching you, and you're not bad at all. Here's my League Card. Don't keep me waiting too long."),
        ] },
        { id: "b", type: "battle", name: "Route 6: Trainers", lv: 31, env: "route", music: "gaEyesArtist", trainer: TR("Beauty Anita, Medical Team Iwan and Evelyn, and Model Nicola", "ga_beauty", "Route 6 is all cliffs and ladders, and Trainers at the top of each one. That's us!", "You climbed right over us."),
          waves: [WGA("clefairy:29", "clefable:30"), WGA("pawniard:31", "togetic:31"), WGA("skorupi:30", "pawniard:30")] },
        { id: "c", type: "battle", name: "Route 6: Silicobra", lv: 30, env: "route", wild: 1, catch: "silicobra", music: "gaRoute6", waves: [WGA("hippopotas:28", "trapinch:28"), WGA("silicobra:30")], pre: [
          L("narr", "Route 6 is hot and dry, and the sand itself moves: a Silicobra, sifting the ground for anything to eat."),
        ], post: [L("narr", "Gotcha! Silicobra was caught! It stores the sand it swallows in a sac on its neck.")] },
        { id: "d", type: "side", name: "Route 6: Galarian Yamask", lv: 31, env: "route", wild: 1, catch: "yamaskgalar", music: "gaRoute6", waves: [WGA("duskull:29"), WGA("yamaskgalar:31")], pre: [
          L("narr", "By the stone arch, a Yamask drifts through the dust, carrying a clay tablet instead of a mask: a Galarian Yamask, filled with an ancient grudge."),
        ], post: [L("narr", "Gotcha! Galarian Yamask was caught! It's said to be the spirit of a clay tablet with a painting on it.")] },
        { id: "e", type: "story", name: "Route 6: Cara Liss's Fossils", music: "gaRoute6", pre: [
          L("narr", "At the top of Route 6, a scientist called Cara Liss is waiting by a strange machine. She can restore Fossil Pokémon, if you bring her two Fossils to put together."),
          L("gacara", "The top half of one, the bottom half of another! Stick them together and a Pokémon comes out. What else could it have looked like? Well, that's science."),
        ] },
        { id: "f", type: "chest", name: "Route 6: The Fossilized Bird and Drake", reward: { op: "dracozolt", lmd: 3000 }, music: "gaRoute6", pre: [
          L("narr", "Sword's Digging Duo turn up a Fossilized Bird and a Fossilized Drake. Cara Liss puts them together, and out comes Dracozolt."),
        ] },
        { id: "g", type: "side", chest: 1, name: "Route 6: The Fossilized Fish and Drake", reward: { op: "dracovish", lmd: 3000 }, music: "gaRoute6", pre: [
          L("narr", "A Fossilized Fish and a Fossilized Drake, put together: Dracovish, with its jaws on top of its head."),
        ] },
        { id: "h", type: "side", chest: 1, name: "Route 6: The Fossilized Bird and Dino", reward: { op: "arctozolt", lmd: 3000 }, music: "gaRoute6", pre: [
          L("narr", "A Fossilized Bird and a Fossilized Dino, put together: Arctozolt, shivering in the heat of Route 6."),
        ] },
        { id: "i", type: "side", chest: 1, name: "Route 6: The Fossilized Fish and Dino", reward: { op: "arctovish", lmd: 3000 }, music: "gaRoute6", pre: [
          L("narr", "A Fossilized Fish and a Fossilized Dino, Shield's pair: Arctovish, frozen solid at the head."),
        ] },
        { id: "j", type: "boss", name: "Stow-on-Side: Hop", lv: 33, env: "city", music: "gaHop", get trainer() { return hopTR("I've changed my whole team! I've been thinking about it nonstop since Bede. Let's battle!", "...I'm not good enough yet. But I'm going to be. You'll see."); },
          rivalWaves: () => [WGA("cramorant:" + (galarStarter() === "grookey" ? 28 : 29), "toxel:29", "silicobra:30"), WGA(hopMon(1) + ":33!")], pre: [
          L("narr", "Stow-on-Side is a market town carved into the cliffs, with an ancient mural on the hillside above the stadium. Hop is waiting at the bottom of the stairs."),
        ] },
        { id: "k", type: "battle", name: "Stow-on-Side Stadium: Gym Trainers", lv: 33, env: "gym", music: "gaGymMission", trainer: gaGymTR("Ian, Claire and Simon", false, "Bea's Gym Mission spins you around in a cup until you can't stand up! Then you battle us!", "You've got good balance. And a good team."),
          waves: [WGA("stufful:31", "bewear:32"), WGA("farfetchdgalar:32"), WGA("hitmonlee:33", "hitmonchan:33")] },
        { id: "l", type: "boss", name: "Stow-on-Side Stadium: Gym Leader Bea", lv: 36, env: "gym", badgeWin: 3, reward: { tm: gaTM("revenge") },
          trainer: TR("Gym Leader Bea", "ga_bea", "I train every hour I'm awake. My Pokémon and I don't lose. Show me your fighting spirit!", "...You win. The Fighting Badge is yours. I'll train even harder."),
          waves: [WGA("hitmontop:34", "pangoro:34"), WGA("sirfetchd:35"), GMX("machamp:36!")], pre: [
          L("gabea", "I'm Bea. I don't waste words before a battle. My Pokémon will speak for me."),
          L("narr", "Flying, Psychic and Fairy moves hit Fighting types hard. Bea's Machamp Gigantamaxes."),
        ], post: [
          L("gabea", "TM42. Revenge. Take it."),
        ] },
        { id: "m", type: "side", big: 1, name: "Stow-on-Side Stadium: Gym Trainers (Shield)", lv: 33, env: "gym", music: "gaGymMission", trainer: gaGymTR("Clive, Lynne and Roy", true, "In Shield, Allister's Gym Trainers spin the cups. And we use Ghost types!", "Spooky... you're spookily good."),
          waves: [WGA("pumpkaboosmall:31", "phantump:31", "pumpkaboosuper:31"), WGA("corsolagalar:32"), WGA("haunter:33", "drifblim:33")] },
        { id: "n", type: "side", big: 1, name: "Stow-on-Side Stadium: Gym Leader Allister (Shield)", lv: 36, env: "tower", reward: { tm: gaTM("hex") },
          trainer: TR("Gym Leader Allister", "ga_allister", "...Um. I'm Allister. My Ghost Pokémon are my friends. Please... don't be scared of them.", "...You won. You weren't scared at all."),
          waves: [WGA("yamaskgalar:34", "mimikyu:34"), WGA("cursola:35"), GMX("gengar:36!")], pre: [
          L("narr", "In Shield, Stow-on-Side's Gym Leader is Allister, a shy boy who never takes off his mask. Ghost and Dark moves hit Ghost types hard; Normal and Fighting moves pass right through them. His Gengar Gigantamaxes."),
        ], post: [
          L("gaallister", "...Um. This is for you, too. TM77... Hex."),
        ] },
        { id: "o", type: "boss", name: "Stow-on-Side: Bede at the Mural", lv: 35, env: "city", music: "gaMuralCrumbles", trainer: bedeTR("The Chairman needs Wishing Stars, and there are some hidden in this mural. If I have to knock it down, I'll knock it down!", "No... no, no, no. I can't lose. Not to you. Not now."),
          waves: [WGA("duosion:32", "gothorita:32"), WGA("ponytagalar:33", "hattrem:35!")], pre: [
          L("narr", "A crash from the hillside: Bede has borrowed Chairman Rose's Copperajah, and he's ordering it to smash the ancient mural."),
        ] },
        { id: "p", type: "story", name: "Stow-on-Side: The Truth Behind the Mural", music: "gaMuralTruth", pre: [
          L("garose", "Bede. Damaging a historical monument? I'm afraid you're disqualified from the Gym Challenge. Come along."),
          L("narr", "The cracked mural crumbles. Behind it are two statues: two heroes, one holding a sword and one a shield, and beside them, two great Pokémon."),
          L("gasonia", "The heroes didn't defeat the Darkest Day alone. Those Pokémon... the legend was about them all along!"),
        ] },
      ] },
    { id: "c8", title: "Glimwood Tangle and Ballonlea", env: "forest", map: "forest", reward: { lmd: 7000, orundum: 500, shinystone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Glimwood Tangle: Trainers", lv: 34, env: "forest", music: "gaGlimwood", trainer: TR("Cook Derek, Daring Couple Robert and Jacqueline, and Madame Judy", "ga_cook", "The mushrooms here glow in the dark. Some of them glow at you.", "Mind the mushrooms on your way out!"),
          waves: [WGA("milcery:33", "sinistea:33", "shiinotic:34"), WGA("ninetales:34", "kirlia:34"), WGA("indeedee:33", "indeedeef:33")], pre: [
          L("narr", "The Glimwood Tangle is a forest where the sun never reaches. Huge mushrooms glow in every color, and the path goes round and round."),
        ] },
        { id: "b", type: "battle", name: "Glimwood Tangle: Indeedee", lv: 35, env: "forest", wild: 1, catch: "indeedee", music: "gaGlimwood", waves: [WGA("shiinotic:34", "morelull:34"), WGA("indeedee:35")], pre: [
          L("narr", "An Indeedee bows to you politely from beside a mushroom. It reads your feelings with its horns, and it seems to like what it sees."),
        ], post: [L("narr", "Gotcha! Indeedee was caught! It serves its Trainer devotedly, sensing what they need.")] },
        { id: "c", type: "side", name: "Glimwood Tangle: Sinistea", lv: 35, env: "forest", wild: 1, catch: "sinistea", music: "gaGlimwood", waves: [WGA("phantump:34"), WGA("sinistea:35")], pre: [
          L("narr", "A chipped teacup bobs along by itself between the trees. There's something in the tea: a Sinistea."),
        ], post: [L("narr", "Gotcha! Sinistea was caught! It lives in cold, leftover black tea.")] },
        { id: "d", type: "side", name: "Glimwood Tangle: Hattrem", lv: 35, env: "forest", wild: 1, catch: "hattrem", music: "gaGlimwood", waves: [WGA("ponyta:34"), WGA("hattrem:35")], pre: [
          L("narr", "A Hattrem swings its braids at a Pokémon that got too close. It can't stand loud feelings."),
        ], post: [L("narr", "Gotcha! Hattrem was caught! It calms down any Pokémon that gets too emotional, by force.")] },
        { id: "e", type: "side", name: "Glimwood Tangle: Morgrem", lv: 38, env: "forest", wild: 1, catch: "morgrem", music: "gaGlimwood", waves: [WGA("impidimp:34"), WGA("morgrem:38")], pre: [
          L("narr", "Behind a big tree, a Morgrem is waiting with a grin. It bows, then tries to stab you with its hair."),
        ], post: [L("narr", "Gotcha! Morgrem was caught! It flatters its foes, then strikes when their guard is down.")] },
        { id: "f", type: "side", name: "Glimwood Tangle: Galarian Ponyta (Shield)", lv: 35, env: "forest", wild: 1, catch: "ponytagalar", music: "gaGlimwood", waves: [WGA("shiinotic:34"), WGA("ponytagalar:35")], pre: [
          L("narr", "In Shield, a Ponyta with a mane like a rainbow mist walks through the glowing woods. Galar's Ponyta live in the Glimwood Tangle."),
        ], post: [L("narr", "Gotcha! Galarian Ponyta was caught! Its mane is full of healing power.")] },
        { id: "g", type: "story", name: "Ballonlea Stadium: Marnie", music: "gaBallonlea", reward: { key: "ga_lcmarnie" }, pre: [
          L("narr", "Ballonlea is a village of glowing trees and fairy lights deep in the forest. Marnie is in the stadium lobby with her Morpeko."),
          L("gamarnie", "Here, my League Card. We're proper rivals now, you and me. Opal's quiz is weird. Just so you know."),
        ] },
        { id: "h", type: "battle", name: "Ballonlea Stadium: Opal's Quiz", lv: 35, env: "gym", music: "gaGymMission", trainer: gaGymTR("Annette, Teresa and Theodora", true, "Opal will ask you a quiz question during our battle. Answer right and you'll be stronger. Answer wrong... well!", "Correct! You've passed the quiz."),
          waves: [WGA("spritzee:34", "slurpuff:34"), WGA("swirlix:34", "aromatisse:34"), WGA("morgrem:35", "gardevoir:35")] },
        { id: "i", type: "boss", name: "Ballonlea Stadium: Gym Leader Opal", lv: 38, env: "gym", badgeWin: 4, reward: { tm: gaTM("drainingkiss") },
          trainer: TR("Gym Leader Opal", "ga_opal", "I'm looking for an heir, someone with the pink of a true Fairy-type Trainer. Let's see if it's you. First question: what's my favorite color?", "You have some pink in you after all. The Fairy Badge, dearie."),
          waves: [WGA("weezinggalar:36", "mawile:36"), WGA("togekiss:37"), GMX("alcremie:38!")], pre: [
          L("narr", "Poison and Steel moves hit Fairy types hard. Opal's Galarian Weezing and Mawile cover those weaknesses; her Alcremie Gigantamaxes."),
        ], post: [
          L("gaopal", "And TM87, Draining Kiss. A little pink to take with you."),
          L("gaopal", "You're not quite what I'm looking for in an heir, but you'll do very well indeed. Now. Come along to Hammerlocke, I'll give you a lift."),
        ] },
        { id: "j", type: "story", name: "Hammerlocke: Opal's Apprentice", music: "gaHammerlocke", pre: [
          L("narr", "In Hammerlocke, Bede is still trying to get back into the Gym Challenge. Opal looks him over, and decides she's found her heir. She takes him back to Ballonlea, protesting."),
          L("narr", "Then the ground shakes. The stadium has exploded with red light: a new Power Spot, right in the middle of the city."),
          L("galeon", "Leave this to the adults. You two, carry on with the Gym Challenge. Raihan's Gym will be waiting!"),
        ] },
      ] },
    { id: "c9", title: "Routes 7 and 8, and Circhester", env: "ice", map: "ice", reward: { lmd: 8000, orundum: 600, icestone: 1 },
      nodes: [
        { id: "a", type: "boss", name: "Route 7: Hop", lv: 37, env: "route", music: "gaHop", get trainer() { return hopTR("New team! I took everything I learned and built it from scratch. This is the real me!", "...Yeah. You're still ahead. But I'm getting closer. I can feel it."); },
          rivalWaves: () => [WGA("trevenant:34", "heatmor:34", "snorlax:35"), WGA("boltund:35", hopMon(2) + ":37!")], pre: [
          L("narr", "On the bridge over Route 7, Hop has been waiting for you, with a team you've never seen before."),
        ] },
        { id: "b", type: "battle", name: "Route 7: Trainers", lv: 35, env: "route", music: "gaEyesArtist", trainer: TR("Model Mila and Cabbie Bruce", "ga_model", "Route 7 is the way to the ruins on Route 8. You'd better be able to handle a battle first.", "You can handle it."),
          waves: [WGA("ribombee:35", "vespiquen:36"), WGA("corvisquire:35", "rufflet:36")] },
        { id: "c", type: "battle", name: "Route 8: The Ruins", lv: 37, env: "route", music: "gaEyesArtist", trainer: TR("Doctor Joanna, Backpacker Barbara and Colleagues Jordan and Alison", "ga_doctorf", "Route 8 is a maze of ruins and ladders. And Trainers, of course!", "Find your way out alright?"),
          waves: [WGA("roselia:36", "hattrem:36"), WGA("dreepy:36", "vullaby:37"), WGA("excadrill:36", "lucario:37", "hippowdon:36", "perrserker:37")], pre: [
          L("narr", "Route 8 winds through the ruins of an ancient city, all ladders and broken walls. Falinks patrol the paths in formation."),
        ] },
        { id: "d", type: "battle", name: "Route 8: Falinks", lv: 39, env: "route", wild: 1, catch: "falinks", music: "gaRoute6", waves: [WGA("sandaconda:38", "corviknight:38"), WGA("falinks:39")], pre: [
          L("narr", "Six small soldiers march out of a hole in the ruins in perfect step: one Pokémon, Falinks, and its five troopers."),
        ], post: [L("narr", "Gotcha! Falinks was caught! The brass leads the troopers, and they all follow its orders.")] },
        { id: "e", type: "side", name: "Route 8: Sandaconda", lv: 39, env: "route", wild: 1, catch: "sandaconda", music: "gaRoute6", waves: [WGA("toxel:38"), WGA("sandaconda:39")], pre: [
          L("narr", "A Sandaconda coils in the dry grass of the ruins, its sand sac full to bursting."),
        ], post: [L("narr", "Gotcha! Sandaconda was caught! It can spray out a hundred kilos of sand at once.")] },
        { id: "f", type: "battle", name: "Steamdrift Way: Galarian Darumaka", lv: 35, env: "ice", wild: 1, catch: "darumakagalar", music: "gaCirchester", waves: [WGA("vanillite:34", "vanillish:39"), WGA("darumakagalar:35")], pre: [
          L("narr", "The snow starts on Steamdrift Way. A Darumaka as white as a snowball rolls past: in Sword, Galar's Darumaka live in the cold."),
        ], post: [L("narr", "Gotcha! Galarian Darumaka was caught! Its fire sac has become an ice sac in the cold.")] },
        { id: "g", type: "side", name: "Steamdrift Way: Snom", lv: 35, env: "ice", wild: 1, catch: "snom", music: "gaCirchester", waves: [WGA("vanillite:34"), WGA("snom:35")], pre: [
          L("narr", "A Snom munches on the frost on a branch. Snow seems to collect on its back."),
        ], post: [L("narr", "Gotcha! Snom was caught! It eats the snow on the ground to grow.")] },
        { id: "h", type: "story", name: "Circhester: The Hero's Bath", music: "gaCirchester", reward: { key: "ga_lcgordie" }, pre: [
          L("narr", "Circhester is a town of old stone and hot springs. The Hero's Bath steams in the town square, where the hero of legend is said to have rested."),
          L("gahop", "I lost to the Gym Leader. Again. Here, take the League Card. I'm going to rethink my whole team. Again!"),
        ] },
        { id: "i", type: "battle", name: "Circhester Stadium: Gym Trainers", lv: 39, env: "gym", music: "gaGymMission", trainer: gaGymTR("Abigail, Kiera, Oliver and Wendy", true, "Gordie's mission is a field of hidden pitfalls. And a sandstorm in the last one!", "You didn't fall for it!"),
          waves: [WGA("boldore:38"), WGA("crustle:38"), WGA("carkol:39"), WGA("sudowoodo:39")] },
        { id: "j", type: "boss", name: "Circhester Stadium: Gym Leader Gordie", lv: 42, env: "cave", badgeWin: 5, reward: { tm: gaTM("rocktomb") },
          trainer: TR("Gym Leader Gordie", "ga_gordie", "Big plans, kid? Mine are bigger. My rocks don't move for anyone!", "You moved them anyway. The Rock Badge is yours. Respect."),
          waves: [WGA("barbaracle:40", "shuckle:40"), WGA("stonjourner:41"), GMX("coalossal:42!")], pre: [
          L("gagordie", "My mom's the other Gym Leader around here, you know. She'd never let me hear the end of it if I lost. So I won't."),
          L("narr", "Water, Grass, Fighting, Ground and Steel moves hit Rock types hard. Gordie's Coalossal Gigantamaxes; water and fire make its Speed soar."),
        ], post: [
          L("gagordie", "Here, TM48, Rock Tomb. Don't tell my mom I went easy on you. I didn't."),
        ] },
        { id: "k", type: "side", big: 1, name: "Circhester Stadium: Gym Trainers (Shield)", lv: 39, env: "gym", music: "gaGymMission", trainer: gaGymTR("Lewis, Liana, Alexander and Micah", false, "In Shield, Melony runs this Gym, and her trainers use Ice types. Hope you dressed warmly!", "Brr. Nicely done."),
          waves: [WGA("snom:38"), WGA("cloyster:38"), WGA("beartic:39"), WGA("avalugg:39")] },
        { id: "l", type: "side", big: 1, name: "Circhester Stadium: Gym Leader Melony (Shield)", lv: 42, env: "ice", reward: { tm: gaTM("icywind") },
          trainer: TR("Gym Leader Melony", "ga_melony", "Oh my, aren't you a dear. I'm Melony, Gordie's mother. Now, let me show you how cold Ice-types can be!", "Oh, you've beaten me fair and square. Well done, sweetie."),
          waves: [WGA("frosmoth:40", "darmanitangalar:40"), WGA("eiscue:41"), GMX("lapras:42!")], pre: [
          L("narr", "In Shield, Circhester's Gym Leader is Melony, Gordie's mother. Fire, Fighting, Rock and Steel moves hit Ice types hard. Her Lapras Gigantamaxes."),
        ], post: [
          L("gamelony", "Here you are, sweetie: TM27, Icy Wind. Do wrap up warm."),
        ] },
        { id: "m", type: "boss", name: "Circhester: Hop", lv: 41, env: "ice", music: "gaHop", get trainer() { return hopTR("Rebuilt from scratch. Again! This is it. This time I'm beating you!", "I lost... and I don't mind. It was a great battle. Thanks, mate."); },
          rivalWaves: () => [WGA("dubwool:40", "corviknight:40", "pincurchin:39"), WGA("snorlax:39", hopMon(2) + ":41!")] },
      ] },
    { id: "c10", title: "Route 9 and Spikemuth", env: "sea", map: "sea", reward: { lmd: 8000, orundum: 600, duskstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 9: Team Yell and a Drednaw", lv: 40, env: "sea", music: "gaYellAppears", trainer: yellTR("Go, Drednaw, go! Nobody gets to Spikemuth! Team Yell's got this road!", "Aww, everybody run!", true),
          waves: [WGA("linoonegalar:39", "pangoro:40")], pre: [
          L("narr", "On Route 9, Team Yell are cheering on a huge wild Drednaw blocking the road, and holding up the doctor who made your Rotom Bike."),
        ], post: [
          L("narr", "The doctor upgrades your Rotom Bike to ride on water. Circhester Bay is open to you."),
        ] },
        { id: "b", type: "battle", name: "Circhester Bay: Pincurchin", lv: 41, env: "sea", wild: 1, catch: "pincurchin", music: "gaRoute10", waves: [WGA("cramorant:39", "wingull:39"), WGA("pincurchin:41")], pre: [
          L("narr", "Circhester Bay is icy water and small beaches. A Pincurchin clings to a rock, its spines crackling with electricity."),
        ], post: [L("narr", "Gotcha! Pincurchin was caught! It eats seaweed with its sharp teeth, and makes electricity from it.")] },
        { id: "c", type: "battle", name: "Circhester Bay: Trainers", lv: 41, env: "sea", music: "gaEyesArtist", trainer: TR("Black Belts Carter and Reece, and Swimmer Logan", "ga_blackbelt", "Training in the freezing sea! That's how we toughen up!", "Brr... you're tougher than the sea."),
          waves: [WGA("grapploct:41"), WGA("sawk:41", "throh:41"), WGA("wishiwashi:40", "wailord:40")] },
        { id: "d", type: "side", name: "Circhester Bay: Clobbopus", lv: 34, env: "sea", wild: 1, catch: "clobbopus", music: "gaRoute10", waves: [WGA("shellder:34"), WGA("clobbopus:34")], pre: [
          L("narr", "A Clobbopus climbs out of the water and punches the sand. It's curious, and punching is how it finds things out."),
        ], post: [L("narr", "Gotcha! Clobbopus was caught! Its tentacles grow back if they're torn off.")] },
        { id: "e", type: "side", name: "Circhester Bay: Grapploct", lv: 50, env: "sea", wild: 1, catch: "grapploct", music: "gaRoute10", waves: [WGA("shellder:40"), WGA("grapploct:50")], pre: [
          L("narr", "A Grapploct swims in slow circles around an iceberg, much stronger than anything else in the bay. It's waiting for someone to get close."),
        ], post: [L("narr", "Gotcha! Grapploct was caught! Its whole body is muscle, and it grapples like a pro wrestler.")] },
        { id: "f", type: "side", name: "Route 9: Morpeko", lv: 42, env: "sea", wild: 1, catch: "morpeko", music: "gaRoute10", waves: [WGA("thievul:41"), WGA("morpeko:42")], pre: [
          L("narr", "A Morpeko scampers along the shore, chewing seeds. When it gets hungry, its whole mood flips."),
        ], post: [L("narr", "Gotcha! Morpeko was caught! It's never without its seeds, which it toasts with its own electricity.")] },
        { id: "g", type: "side", name: "Route 9: Perrserker", lv: 42, env: "sea", wild: 1, catch: "perrserker", music: "gaRoute10", waves: [WGA("thievul:41"), WGA("perrserker:42")], pre: [
          L("narr", "A Perrserker stalks the beach, the steel spikes on its head glinting in the cold sun."),
        ], post: [L("narr", "Gotcha! Perrserker was caught! The hair on its head has hardened into steel.")] },
        { id: "h", type: "boss", name: "Outer Spikemuth: Marnie", lv: 44, env: "city", music: "gaMarnie", trainer: marnieTR("The front gate's shut. There's a back way in, but rivals don't get to use it unless they beat me.", "You've earned it. Come on. And Team Yell: go home."),
          waves: [WGA("liepard:42", "toxicroak:43"), WGA("scrafty:43", "morpeko:44!")], pre: [
          L("narr", "Spikemuth's shutters are down, locking out every Gym Challenger. Marnie waves you down a side path, with Team Yell cheering behind her."),
        ] },
        { id: "i", type: "battle", name: "Spikemuth: The Gym Mission", lv: 43, env: "city", music: "gaSpikemuth", trainer: yellTR("Welcome to Spikemuth's Gym Mission! Team Yell are the Gym Trainers here! Ha!", "Fine, fine. Piers is waiting. He's not gonna go easy.", false),
          waves: [WGA("linoonegalar:42"), WGA("thievul:42"), WGA("scrafty:42"), WGA("weavile:43"), WGA("liepard:43", "drapion:43")], pre: [
          L("narr", "Spikemuth has no Power Spot and no stadium: its Gym is the town's one long street. Team Yell are its Gym Trainers, and they're all out tonight."),
          L("gamarnie", "Team Yell shut the gates so nobody else could finish the Gym Challenge before me. That's not how I want to win. Go on, I'll catch up."),
        ] },
        { id: "j", type: "boss", name: "Spikemuth: Gym Leader Piers", lv: 46, env: "city", badgeWin: 6, reward: { tm: gaTM("snarl") },
          trainer: TR("Gym Leader Piers", "ga_piers", "I'm Piers, and this is my stage. No Dynamax in Spikemuth, mate. Just us and our Pokémon. Let's rock!", "You and your Pokémon have a tune of your own. The Dark Badge. Take care of my sister in the Champion Cup."),
          waves: [WGA("scrafty:44", "malamar:45"), WGA("skuntank:45", "obstagoon:46!")], pre: [
          L("narr", "Fighting, Bug and Fairy moves hit Dark types hard. Spikemuth has no Power Spot, so Piers's Obstagoon never Dynamaxes."),
        ], post: [
          L("gayell", "Piers says you get this too! TM85, Snarl! Spikemuth's own!"),
        ] },
      ] },
    { id: "c11", title: "Hammerlocke and Raihan", env: "plateau", map: "plateau", reward: { lmd: 9000, orundum: 700, dragonscale: 1 },
      nodes: [
        { id: "a", type: "story", name: "Route 7: Dynamax Everywhere", music: "gaHurry", pre: [
          L("narr", "Through the Route 9 Tunnel and back on Route 7, Hop is waiting, out of breath."),
          L("gahop", "Pokémon are Dynamaxing all over Galar, outside the stadiums! Lee's out there stopping them. Come on, to Hammerlocke!"),
        ] },
        { id: "b", type: "battle", name: "Route 7: Gentleman Caden", lv: 44, env: "route", music: "gaEyesArtist", trainer: TR("Gentleman Caden", "ga_gentleman", "One last battle before the final Gym, perhaps? I insist.", "Splendid. Raihan will be a fine test for you."),
          waves: [WGA("doublade:44", "passimian:44@hardstone", "polteageist:44!")] },
        { id: "c", type: "story", name: "Hammerlocke: The Red Light", music: "gaHammerlocke", pre: [
          L("gamagnolia", "Chairman Rose asked me to look into this red light. It's Dynamax energy, coming up from deep underground. Sonia, my dear, I want you to find out what the Darkest Day really was."),
          L("galeon", "Raihan's waiting for you in the stadium. The Champion Cup's next. Don't let this distract you!"),
        ] },
        { id: "d", type: "battle", name: "Hammerlocke Vault: Gym Trainer Sebastian", lv: 45, env: "plateau", weather: "rain", music: "gaGymMission", trainer: gaGymTR("Sebastian", false, "Raihan's Gym has no mission, just Double Battles. In the rain!", "The rain didn't stop you."),
          waves: [WGA("pelipper:45", "sliggoo:45")], pre: [
          L("narr", "Raihan's Gym battles are held in the Hammerlocke Vault, and every Gym Trainer brings a weather setter and a Dragon type."),
        ] },
        { id: "e", type: "battle", name: "Hammerlocke Vault: Gym Trainer Camilla", lv: 45, env: "plateau", weather: "sun", music: "gaGymMission", trainer: gaGymTR("Camilla", true, "Sunshine and a Dragon type. Feel the heat!", "Too hot for me."),
          waves: [WGA("ninetales:45", "turtonator:45")] },
        { id: "f", type: "battle", name: "Hammerlocke Vault: Gym Trainer Aria", lv: 45, env: "plateau", weather: "hail", music: "gaGymMission", trainer: gaGymTR("Aria", true, "Hail and a Dragon type. Can you keep warm?", "Raihan's next. Good luck!"),
          waves: [WGA("abomasnow:45", "hakamoo:45")] },
        { id: "g", type: "boss", name: "Hammerlocke Stadium: Gym Leader Raihan", lv: 48, env: "plateau", weather: "sand", badgeWin: 7, reward: { tm: gaTM("breakingswipe") },
          trainer: TR("Gym Leader Raihan", "ga_raihan", "I'm the one who's going to beat Leon one day. Let's see if you're worth a selfie! Sandstorm, let's go!", "Ha! You're the real deal. Take the Dragon Badge, and go beat Leon for me. Well, until I do it."),
          waves: [WGA("gigalith:46", "flygon:47"), WGA("sandaconda:46"), GMX("duraludon:48!")], pre: [
          L("narr", "Raihan's Gigalith whips up a sandstorm as the battle begins. Ice, Dragon and Fairy moves hit Dragon types hard; Duraludon is part Steel, so Fighting and Ground work better on it. His Duraludon Gigantamaxes."),
        ], post: [
          L("garaihan", "Oh, and TM99, Breaking Swipe. Take it with the Badge."),
          L("narr", "Eight Badges. Hop beats Raihan right after you, and the train to Wyndon and the Champion Cup is waiting."),
        ] },
      ] },
    { id: "c12", title: "Route 10 and the Champion Cup", env: "ice", map: "ice", reward: { lmd: 10000, orundum: 800, rare: 2 },
      nodes: [
        { id: "a", type: "battle", name: "Route 10: Trainers in the Snow", lv: 46, env: "ice", weather: "hail", music: "gaRoute10", trainer: TR("Doctor Graham, Postman Harper and Hiker Donald", "ga_doctor", "Route 10's always snowing. You'll need more than a scarf to get through!", "Off to Wyndon with you, then!"),
          waves: [WGA("gardevoir:45"), WGA("pelipper:46", "noctowl:46"), WGA("gigalith:46", "rhydon:46")], pre: [
          L("narr", "Route 10 climbs through a blizzard toward Wyndon. Every battle here is fought in the hail."),
        ] },
        { id: "b", type: "battle", name: "Route 10: Stonjourner", lv: 45, env: "ice", wild: 1, catch: "stonjourner", weather: "hail", music: "gaRoute10", waves: [WGA("abomasnow:44", "beartic:45"), WGA("stonjourner:45")], pre: [
          L("narr", "Standing stones loom out of the snow. One of them turns its head: in Sword, Stonjourner stand on Route 10 like the stones of an ancient circle."),
        ], post: [L("narr", "Gotcha! Stonjourner was caught! Once a year, Stonjourner gather in a ring on the same day.")] },
        { id: "c", type: "side", name: "Route 10: Eiscue (Shield)", lv: 45, env: "ice", wild: 1, catch: "eiscue", weather: "hail", music: "gaRoute10", waves: [WGA("vanillish:44"), WGA("eiscue:45")], pre: [
          L("narr", "In Shield, an Eiscue waddles through the snow where Sword's Stonjourner stand, cooling its head in a block of ice."),
        ], post: [L("narr", "Gotcha! Eiscue was caught! It drifted to Galar from far away, keeping its head on ice.")] },
        { id: "d", type: "side", name: "Route 10: Duraludon", lv: 46, env: "ice", wild: 1, catch: "duraludon", weather: "hail", music: "gaRoute10", waves: [WGA("snover:45"), WGA("duraludon:46")], pre: [
          L("narr", "A Duraludon stands still in the snow like a skyscraper. Its body is made of a light, strong metal."),
        ], post: [L("narr", "Gotcha! Duraludon was caught! Its metal body is light and strong, but it chips easily.")] },
        { id: "e", type: "side", name: "Route 10: Galarian Mr. Mime", lv: 41, env: "ice", wild: 1, catch: "mrmimegalar", weather: "hail", music: "gaRoute10", waves: [WGA("cubchoo:36"), WGA("mrmimegalar:41")], pre: [
          L("narr", "A Mr. Mime tap-dances across the ice, perfectly balanced. Galar's are Ice types."),
        ], post: [L("narr", "Gotcha! Galarian Mr. Mime was caught! It makes the ground freeze with its tap dancing.")] },
        { id: "f", type: "story", name: "Wyndon: The Champion Cup", music: "gaWyndon", pre: [
          L("narr", "Wyndon is the biggest city in Galar: Rose Tower, the monorail, the hotels and, at the top of it all, Wyndon Stadium, home of the Champion Cup."),
          L("gahop", "We made it! Eight Badges each. Now we find out which of us gets to face Lee!"),
        ] },
        { id: "g", type: "boss", name: "Wyndon Stadium: The Semifinal, Marnie", lv: 49, env: "plateau", music: "gaWyndonStadium", trainer: marnieTR("Win this, and I'm one step closer to taking Spikemuth's Gym off my brother's hands. So I'm not losing.", "...Fine. Go on, then. Win the whole thing for both of us.", "ga_marnieleague"),
          waves: [WGA("liepard:47", "toxicroak:47", "scrafty:47"), WGA("morpeko:48"), GMX("grimmsnarl:49!")], pre: [
          L("narr", "The Champion Cup's semifinals: the challengers who won all eight Badges battle in front of a full Wyndon Stadium. Your first opponent: Marnie."),
        ] },
        { id: "h", type: "boss", name: "Wyndon Stadium: The Semifinal, Hop", lv: 49, env: "plateau", music: "gaWyndonStadium", get trainer() { return hopTR("This is the one that counts! The winner faces Lee. Let's make it the best battle of our lives!", "...I lost. And I'm not even sad. You're amazing. Go show Lee."); },
          rivalWaves: () => [WGA("dubwool:48", "corviknight:48", "pincurchin:47"), WGA("snorlax:47"), DYN(hopMon(2) + ":49!")], pre: [
          L("narr", "Hop won his semifinal in minutes. Now the two of you face each other for a place in the Finals."),
        ] },
        { id: "i", type: "battle", name: "Wyndon: The Monorail Key", lv: 47, env: "city", music: "gaWyndon", trainer: TR("Macro Cosmos's Eric", "ga_clerk", "Rose Tower's off-limits! I've got the monorail key, and I'm not handing it over!", "Not again! Run!"),
          waves: [WGA("meowthgalar:47", "durant:47"), WGA("mawile:47", "excadrill:47"), WGA("ferroseed:47", "steelix:47")], pre: [
          L("narr", "Leon hasn't come back from his meeting at Rose Tower. Piers knows a way in: the monorail, if you can get the key from the staff member Oleana gave it to."),
          L("gapiers", "He'll hide. You chase. Marnie and Team Yell'll cheer you on. Me, I'll sing. That should cover it."),
        ] },
        { id: "j", type: "battle", name: "Rose Tower: Macro Cosmos", lv: 49, env: "tower", music: "gaRoseTower", trainer: TR("Macro Cosmos's Elijah, Jane, Mateo and Kevin", "ga_clerk", "Visitors aren't allowed in Rose Tower! Security, Steel-types, now!", "The Chairman won't be happy about this..."),
          waves: [WGA("durant:48"), WGA("cufant:48", "bronzong:48"), WGA("klang:48", "mawile:48"), WGA("steelix:49", "stunfiskgalar:49")], pre: [
          L("narr", "Piers and Marnie hold the entrance. You and Hop ride the great lift up Rose Tower, and Macro Cosmos's staff come at you on every floor. Hop battles at your side."),
        ] },
        { id: "k", type: "boss", name: "Rose Tower: Oleana", lv: 52, env: "tower", music: "gaTowerTop", trainer: TR("Macro Cosmos's Oleana", "ga_oleana", "The Chairman is busy. I will not let children disturb him. You'll be leaving now, one way or another.", "...It doesn't matter. The Chairman has all the Wishing Stars he needs."),
          waves: [WGA("froslass:50", "tsareena:50", "salazzle:50"), WGA("milotic:51"), GMX("garbodor:52!")], pre: [
          L("narr", "At the top of the tower, it isn't Leon or Rose waiting for you. It's Oleana."),
        ] },
        { id: "l", type: "story", name: "Rose Tower: A Thousand Years from Now", music: "gaRose", pre: [
          L("garose", "In a thousand years, Galar will run out of energy. I can solve that now. Today. I simply can't wait."),
          L("galeon", "Chairman, please. Not before the Championship match. Let's talk tomorrow, after."),
          L("narr", "Leon promises to take you to dinner after the Finals. Left alone in his office, Chairman Rose looks out over Galar and says he will change the course of history."),
        ] },
      ] },
    { id: "c13", title: "The Finals and the Darkest Day", env: "plateau", map: "plateau", reward: { lmd: 15000, orundum: 1000, rare: 3, prime: 1 },
      nodes: [
        { id: "a", type: "boss", name: "Wyndon Stadium: Bede Returns", lv: 53, env: "plateau", music: "gaFinalsBegin", trainer: TR("Gym Leader Bede", "ga_bedeleader", "I was thrown out of the Gym Challenge, but I'm back. Beat me, and I'll quit as a Trainer. That's how sure I am.", "...I'm not quitting. I'll take over from Opal and become a Gym Leader. Remember that!"),
          waves: [WGA("mawile:51", "gardevoir:51"), WGA("rapidashgalar:52"), GMX("hatterene:53!")], pre: [
          L("narr", "The Finals' opening ceremony: Leon leads the crowd in Chairman Rose's absence. Before the first match can start, a challenger in a pink Fairy uniform walks onto the pitch. Bede."),
        ] },
        { id: "b", type: "boss", name: "Wyndon Stadium: The Finals, Nessa", lv: 53, env: "sea", weather: "rain", music: "gaFinals", trainer: TR("Gym Leader Nessa", "ga_nessa", "The Finals! The tide's coming in, and it's bringing my best team with it!", "Swept away again... You're incredible."),
          waves: [WGA("golisopod:51", "pelipper:51", "barraskewda:52"), WGA("seaking:52"), GMX("drednaw:53!")], pre: [
          L("narr", "The Finals: you against the Gym Leaders who made it through, one after another. First, Nessa, with her Pelipper's rain."),
        ] },
        { id: "c", type: "boss", name: "Wyndon Stadium: The Finals, Bea", lv: 54, env: "gym", music: "gaFinals", trainer: TR("Gym Leader Bea", "ga_bea", "I lost to you once. I trained every day since. Now, again!", "...I see. I still have a long way to go."),
          waves: [WGA("hawlucha:52", "grapploct:52", "sirfetchd:53"), WGA("falinks:53"), GMX("machamp:54!")] },
        { id: "d", type: "side", big: 1, name: "Wyndon Stadium: The Finals, Allister (Shield)", lv: 54, env: "tower", music: "gaFinals", trainer: TR("Gym Leader Allister", "ga_allister", "...In Shield, it's me in the Finals. My friends and I... we've practiced. A lot.", "...Thank you. That was fun. My friends think so too."),
          waves: [WGA("dusknoir:52", "chandelure:52", "cursola:53"), WGA("polteageist:53"), GMX("gengar:54!")] },
        { id: "e", type: "boss", name: "Wyndon Stadium: The Finals, Raihan", lv: 55, env: "plateau", weather: "sun", music: "gaFinals", trainer: TR("Gym Leader Raihan", "ga_raihan", "Leon's only beaten by Leon. That's why I'm going to be the one who beats him. Which means first, I beat you!", "...Next year. Next year I'm going all the way."),
          waves: [WGA("torkoal:53", "goodra:54", "turtonator:54"), WGA("flygon:54"), GMX("duraludon:55!")], pre: [
          L("narr", "Piers lost his match to Raihan. Raihan leads with Torkoal, and the sun blazes over the pitch."),
        ] },
        { id: "f", type: "story", name: "Wyndon Stadium: The Darkest Day", music: "gaDarkestDay", pre: [
          L("narr", "Leon walks onto the pitch for the Championship Match. Then the giant screens flicker, and Chairman Rose appears on every one of them."),
          L("garose", "I couldn't wait any longer. I have begun my plan to give Galar a thousand years of energy. I've woken the Pokémon that brought the Darkest Day!"),
          L("narr", "Red light bursts from Hammerlocke in the distance. Leon is already running. \"Stay here,\" he says. You don't."),
        ] },
        { id: "g", type: "battle", name: "Slumbering Weald: Deep in the Forest", lv: 46, env: "forest", wild: 1, catch: "orbeetle", music: "gaDeepForest", waves: [WGA("weezinggalar:45", "corviknight:46"), WGA("orbeetle:47")], pre: [
          L("gahop", "The legend! Two heroes, a sword and a shield. If we can find them, we can help Lee. They must be in the Slumbering Weald!"),
        ], post: [L("narr", "Gotcha! Orbeetle was caught! Its brain is so large, it can see what's happening miles away.")] },
        { id: "h", type: "side", name: "Slumbering Weald: Galarian Weezing", lv: 46, env: "forest", wild: 1, catch: "weezinggalar", music: "gaDeepForest", waves: [WGA("stunfiskgalar:45"), WGA("weezinggalar:46")], pre: [
          L("narr", "A Weezing with chimneys on its heads breathes in the Weald's polluted air, and breathes out clean air."),
        ], post: [L("narr", "Gotcha! Galarian Weezing was caught! It purifies the air of factories, Galar's gift to the world.")] },
        { id: "i", type: "story", name: "Slumbering Weald: The Rusted Sword and Shield", music: "gaFog", reward: { key: "ga_rustedsword" }, pre: [
          L("narr", "Two great Pokémon appear in the fog, and vanish again. Sonia arrives in time to see the space where they were."),
          L("gasonia", "Zacian and Zamazenta. Those are their names. The heroes' Pokémon... It was them, all along!"),
          L("narr", "At an ancient stone altar in the heart of the Weald lie a rusted sword and a rusted shield. You take the sword. Hop takes the shield."),
        ] },
        { id: "j", type: "story", name: "Hammerlocke: Under the Stadium", music: "gaBizarre", pre: [
          L("gaoleana", "My own Pokémon Dynamaxed by itself... Raihan stopped it. The Chairman is down there. In the Energy Plant. Please. Go."),
          L("narr", "You ride the lift down into the Energy Plant under Hammerlocke Stadium. The air hums with red energy."),
        ] },
        { id: "k", type: "boss", name: "Energy Plant: Chairman Rose", lv: 57, env: "plant", music: "gaEnergyPlant", trainer: TR("Macro Cosmos's Rose", "ga_rose", "I've woken Eternatus. Galar's energy problem is solved, for a thousand years. If you want to stop me, you'll have to defeat me!", "...So be it. Leon is already at the top. Go and see for yourself."),
          waves: [WGA("escavalier:55", "ferrothorn:55", "perrserker:55"), WGA("klinklang:56"), GMX("copperajah:57!")] },
        { id: "l", type: "boss", name: "Energy Plant: Eternatus", lv: 60, env: "plant", wild: 1, music: "gaEternatusAppears", waves: [WGA("eternatus:60!")], pre: [
          L("narr", "On the roof of the Energy Plant, Leon and Charizard face a huge, skeletal Pokémon pulsing with red light. Leon throws a Poké Ball. It breaks out at once, and turns on you."),
        ] },
        { id: "m", type: "boss", name: "Energy Plant: Eternamax Eternatus", lv: 60, env: "plant", wild: 1, catch: "eternatus", music: "gaEternamax", waves: [DYN("eternatus:60!", "Eternamax")], pre: [
          L("narr", "Eternatus swallows the red light and grows, and grows, into its Eternamax form. Leon is down. Then the rusted sword and shield shine, and two Pokémon leap down from the sky to stand at your side: Zacian and Zamazenta."),
        ], post: [
          L("narr", "Gotcha! Eternatus was caught! The heroes' Pokémon look at you, then at the sky, and disappear."),
        ] },
        { id: "n", type: "boss", champion: 1, name: "Wyndon Stadium: Champion Leon", lv: 65, env: "plateau", music: "gaWyndonStadium",
          get trainer() { return TR("Champion Leon", "ga_leon", "The match Rose interrupted! Three days late, and the crowd's never been louder. I'm going to have a champion time. Let's go!", "...That was the best match I've ever had. Galar, meet your new Champion!"); },
          get waves() { return [WGA("aegislash:62", "dragapult:62", "haxorus:63"), WGA(leonSix() + ":64", leonAce() + ":64"), GMX("charizard:65!")]; }, pre: [
          L("narr", "Three days later. Rose has turned himself in. The Championship Match is back on, and the whole of Galar is watching."),
          L("galeon", "I've never lost an official match. Not once. Show me everything, and let's see if that changes today!"),
        ], post: [
          L("narr", "Confetti falls over Wyndon Stadium. Leon raises your arm in front of everyone: the new Champion of Galar. Your Pokémon will now obey you all the way to Lv 100."),
        ] },
      ] },
    // (Sword and Shield's own post-game: Sordward and Shielbert. Sword's side: you battle Sordward, and Shielbert's battles are side
    // stages beside his; at the tower summit the enraged Pokémon is Zamazenta and you catch Zacian, Shield's Zamazenta a side stage)
    { id: "c14", title: "Sordward and Shielbert", env: "city", map: "city", reward: { orundum: 1500, permit: 5, rec4: 3 },
      nodes: [
        { id: "a", type: "story", name: "Postwick: The Champion Comes Home", music: "gaPostwick", reward: { gold5: 1 }, pre: [
          L("narr", "The Slumbering Weald is quiet again. At home, Professor Magnolia drops by with a Master Ball, as a thank-you from all of Galar."),
          L("gamagnolia", "Galar will never forget what you did, dear. Nor will I."),
        ] },
        { id: "b", type: "side", chest: 1, name: "Postwick: Leon's Charmander", reward: { op: "charmander", lmd: 3000 }, music: "gaPostwick", pre: [
          L("narr", "Upstairs in Leon's old bedroom, there's a Poké Ball with a note: \"For the new Champion. Look after it.\" Inside is a Charmander, a Pokémon from Kanto."),
        ] },
        { id: "c", type: "boss", name: "Slumbering Weald: Hop", lv: 60, env: "forest", music: "gaHop", get trainer() { return hopTR("Champion! Ha, that's going to take some getting used to. Battle me? I want to know how far I've come.", "...I want to be a Pokémon Professor, I think. I want to help Pokémon and Trainers like you. Thanks, mate."); },
          rivalWaves: () => [WGA("dubwool:59", "corviknight:59", "pincurchin:58"), WGA("snorlax:58", "cramorant:58"), WGA(hopMon(2) + ":60!")], pre: [
          L("narr", "Hop is sitting at the altar in the heart of the Weald, thinking."),
        ] },
        { id: "d", type: "story", name: "Slumbering Weald: Two Celebrities", music: "gaSonia", pre: [
          L("gasoniap", "I'm Professor Sonia now, can you believe it? Gran's retiring. And I've written a book about the real history of Galar! Let's put the sword and shield back where they belong."),
          L("narr", "As you set the rusted sword and shield back on the altar, two men in matching suits stride into the clearing. They say they're Sordward and Shielbert, descendants of Galar's first kings, and that Sonia's book is full of lies."),
          L("gasordward", "The sword and the shield are ours by right! And you, \"Champion\", have stolen our glory. Our ancestors defeated the Darkest Day, not some pair of dogs!"),
        ] },
        { id: "e", type: "boss", name: "Slumbering Weald: Sordward", lv: 60, env: "forest", music: "gaBizarre", trainer: TR("Pokémon Trainer Sordward", "ga_sordward", "My brother takes the boy. I'll take the Champion. Prepare to be humbled by royalty!", "Hmph! This changes nothing. We have the shield, and our plan has only begun!"),
          waves: [WGA("sirfetchd:60", "golisopod:60"), WGA("doublade:60", "bisharp:60!")] },
        { id: "f", type: "side", big: 1, name: "Slumbering Weald: Shielbert (Shield)", lv: 60, env: "forest", music: "gaBizarre", trainer: TR("Pokémon Trainer Shielbert", "ga_shielbert", "In Shield, it's me you face, and my brother takes on the boy. A shield never yields!", "...Our plan will proceed regardless."),
          waves: [WGA("sirfetchd:60", "bronzong:60"), WGA("falinks:60", "klinklang:60!")] },
        { id: "g", type: "story", name: "Wedgehurst: The Power Spot Detector", music: "gaLab", pre: [
          L("gasoniap", "My Power Spot Detector's picking up something huge at Turffield Stadium. If those two are behind it, that's where they'll be."),
        ] },
        { id: "h", type: "boss", name: "Turffield Stadium: A Rampaging Tsareena", lv: 62, env: "gym", wild: 1, music: "gaMaxRaid", waves: [DYN("tsareena:62!")], pre: [
          L("narr", "Milo and Piers were in the middle of an exhibition match when a Dynamax Tsareena stormed onto the pitch, out of control. Hop arrives, and you all take it on together."),
        ], post: [
          L("narr", "The Tsareena shrinks back down, dazed. In the stadium's shop, Sordward and Shielbert are laughing. They made it Dynamax against its will."),
        ] },
        { id: "i", type: "boss", name: "Hulbury Stadium: A Rampaging Gyarados", lv: 62, env: "sea", wild: 1, music: "gaMaxRaid", waves: [DYN("gyarados:62!")], pre: [
          L("narr", "Nessa is waiting in Hulbury Stadium's foyer. On the pitch, a Dynamax Gyarados thrashes in a storm of its own making."),
        ] },
        { id: "j", type: "boss", name: "Motostoke Stadium: A Rampaging Torkoal", lv: 62, env: "volcano", wild: 1, weather: "sun", music: "gaMaxRaid", waves: [DYN("torkoal:62!")], pre: [
          L("narr", "In Motostoke Stadium, a Dynamax Torkoal has turned the sunlight harsh. Kabu sends out his Centiskorch beside you."),
        ] },
        { id: "k", type: "boss", name: "Wedgehurst: Sordward and Shielbert", lv: 62, env: "lab", music: "gaBizarre", trainer: TR("Pokémon Trainers Sordward and Shielbert", "ga_sordshiel", "Hand over the Wishing Stars, Professor! ...What? A Double Battle with the Champion and this upstart? Very well!", "Never mind. We have what we came for. Didn't you notice your new assistant?"),
          waves: [WGA("golisopod:62", "doublade:62", "bisharp:62"), WGA("bronzong:62", "falinks:60", "klinklang:60!")], pre: [
          L("narr", "Sordward and Shielbert have turned up at Sonia's lab, demanding Wishing Stars. Hop calls them weirdos to their faces, and they challenge you both."),
        ], post: [
          L("narr", "While you battled, Sonia's new assistant slipped out with the Wishing Stars. He was working for the brothers all along. They want to use the stars on Zacian and Zamazenta."),
        ] },
        { id: "l", type: "boss", name: "Stow-on-Side Stadium: A Rampaging Conkeldurr", lv: 62, env: "gym", wild: 1, music: "gaMaxRaid", waves: [DYN("conkeldurr:62!")], pre: [
          L("narr", "In Stow-on-Side Stadium, Bea is holding the doors shut on a Dynamax Conkeldurr. This time it's just you against it."),
        ] },
        { id: "m", type: "side", name: "Stow-on-Side Stadium: A Rampaging Dusknoir (Shield)", lv: 62, env: "tower", wild: 1, music: "gaMaxRaid", waves: [DYN("dusknoir:62!")], pre: [
          L("narr", "In Shield, it's Allister's stadium, and the Pokémon running wild is a Dynamax Dusknoir."),
        ] },
        { id: "n", type: "boss", name: "Ballonlea Stadium: Gym Leader Bede", lv: 63, env: "gym", music: "gaBede", trainer: TR("Gym Leader Bede", "ga_bedeleader", "I dealt with the Dynamax Pokémon myself, thank you. What I want is to battle you, as the Gym Leader of Ballonlea!", "...Fine. I accept that you are the Champion. For now."),
          waves: [WGA("mawile:61", "gardevoir:61"), WGA("rapidashgalar:62", "hatterene:63!")], pre: [
          L("narr", "Bede has taken over as Ballonlea's Gym Leader, and Opal looks very pleased about it."),
        ] },
        { id: "o", type: "boss", name: "Circhester Stadium: A Rampaging Gigalith", lv: 62, env: "cave", wild: 1, music: "gaMaxRaid", waves: [DYN("gigalith:62!")], pre: [
          L("narr", "Gordie's stadium in Circhester: a Dynamax Gigalith, glowing red, crystals spiking out of its body."),
        ] },
        { id: "p", type: "side", name: "Circhester Stadium: A Rampaging Froslass (Shield)", lv: 62, env: "ice", wild: 1, music: "gaMaxRaid", waves: [DYN("froslass:62!")], pre: [
          L("narr", "In Shield, Melony's stadium has a Dynamax Froslass instead, freezing the pitch over."),
        ] },
        { id: "q", type: "boss", name: "Hammerlocke Stadium: A Rampaging Haxorus", lv: 62, env: "plateau", wild: 1, music: "gaMaxRaid", waves: [DYN("haxorus:62!")], pre: [
          L("narr", "Raihan's stadium: a Dynamax Haxorus, its tusks as big as the stadium's gates. Sonia's Yamper sparks the lift to the Energy Plant open afterwards."),
        ] },
        { id: "r", type: "boss", name: "Energy Plant: Sordward", lv: 64, env: "plant", music: "gaBizarre", trainer: TR("Pokémon Trainer Sordward", "ga_sordward", "We'll make Zacian and Zamazenta Dynamax and rampage, and prove those mutts were never heroes! Then our ancestors will have the glory they deserve!", "No... the plan is already in motion. Go and look, if you dare."),
          waves: [WGA("sirfetchd:64", "golisopod:64"), WGA("doublade:64", "bisharp:64!")] },
        { id: "s", type: "side", big: 1, name: "Energy Plant: Shielbert (Shield)", lv: 64, env: "plant", music: "gaBizarre", trainer: TR("Pokémon Trainer Shielbert", "ga_shielbert", "In Shield, I guard the way up. The hero's Pokémon will rampage, and everyone will see!", "...Too late. It has begun."),
          waves: [WGA("sirfetchd:64", "bronzong:64"), WGA("falinks:64", "klinklang:64!")] },
        { id: "t", type: "boss", name: "Energy Plant Summit: The Enraged Zamazenta", lv: 70, env: "plant", wild: 1, music: "gaZacian", waves: [WGA("zamazenta:70!")], pre: [
          L("narr", "At the top of the Energy Plant, Shielbert has lured Zamazenta with the rusted shield and pumped it full of Galar particles. It's out of control. Only you can stop it."),
        ], post: [
          L("narr", "Zamazenta charges at Hop, and another Pokémon leaps between them: Zacian. Zamazenta flees, and Zacian settles in the middle of the arena, waiting. For you."),
        ] },
        { id: "u", type: "boss", name: "Energy Plant Summit: Zacian", lv: 70, env: "plant", wild: 1, catch: "zaciancrowned", music: "gaZacian", waves: [WGA("zaciancrowned:70!")], pre: [
          L("narr", "Zacian takes up the rusted sword in its jaws, and it becomes a sword itself: the Crowned Sword. It wants to see if you're worthy."),
        ], post: [
          L("narr", "Gotcha! Zacian was caught, with the rusted sword it carries! Sordward and Shielbert admit everything and ask Piers to take them to the police."),
        ] },
        { id: "v", type: "side", name: "Energy Plant Summit: Zamazenta (Shield)", lv: 70, env: "plant", wild: 1, catch: "zamazentacrowned", music: "gaZacian", waves: [WGA("zamazentacrowned:70!")], pre: [
          L("narr", "In Shield it's the other way round: Zacian rampages, and Zamazenta takes up the rusted shield and becomes the Crowned Shield for you to catch."),
        ], post: [L("narr", "Gotcha! Zamazenta was caught, with its rusted shield!")] },
        { id: "w", type: "boss", name: "Slumbering Weald: Hop and Zamazenta", lv: 70, env: "forest", music: "gaHopFinal", get trainer() { return hopTR("Zamazenta chose me! Can you believe it? So there's only one thing left to do, right? One more battle, the best one ever!", "...That's it. I'm going to be a Pokémon Professor. Zamazenta and I will help everyone. Thanks for everything, Champion."); },
          rivalWaves: () => [WGA("dubwool:69", "snorlax:68", "pincurchin:68"), WGA("corviknight:69", hopMon(2) + ":70"), WGA("zamazentacrowned:70!")], pre: [
          L("narr", "In the heart of the Slumbering Weald, Hop has calmed Zamazenta, and it has let him catch it. In a Poké Ball. He can hardly believe it either."),
        ] },
      ] },
    // (the Champion Cup rematch: Sword and Shield's base post-game. The Gym Leaders, Marnie, Bede, Piers, Hop and Leon in the order of
    // their levels, Shield's Gym Leaders as side stages beside Sword's; the Gym Challengers you meet in its first round are Battle Tower floors)
    { id: "c15", title: "The Champion Cup Rematch", env: "plateau", map: "plateau", reward: { orundum: 1500, permit: 5, rec4: 3 },
      nodes: [
        { id: "a", type: "boss", name: "Spikemuth: Gym Leader Marnie", lv: 60, env: "city", music: "gaMarnie", trainer: TR("Gym Leader Marnie", "ga_marnieleague", "Piers handed me the Gym. Spikemuth's mine to look after now. First thing I want? A battle with the Champion.", "...Yeah. Spikemuth's going to be fine. So am I."),
          waves: [WGA("liepard:59", "toxicroak:59", "scrafty:59"), WGA("morpeko:60", "grimmsnarl:60!")], pre: [
          L("narr", "Spikemuth has a new Gym Leader. Piers is managing his own band now, and Marnie has the stage."),
        ] },
        { id: "b", type: "story", name: "Wyndon Stadium: Defending the Title", music: "gaWyndonStadium", pre: [
          L("narr", "Once a Champion, always a challenger: the Champion Cup can be played again and again. The Gym Leaders have trained hard since the Finals, and so have Hop and Leon."),
          L("galeon", "I'm the chairman of the Battle Tower now, but I'll always make time for a Champion Cup. Rematch? Rematch!"),
        ] },
        { id: "c", type: "side", chest: 1, name: "Battle Tower: Type: Null", reward: { op: "typenull", lmd: 3000, held: ["fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"].map(t => t + "memory") }, music: "gaBattleTower", pre: [
          L("narr", "At the Battle Tower, the old Rose Tower, a League Staff member hands you a Type: Null and its Memories. It's a Pokémon from Alola."),
        ] },
        { id: "d", type: "boss", name: "Champion Cup Rematch: Gym Leader Milo", lv: 62, env: "gym", music: "gaFinals", trainer: TR("Gym Leader Milo", "ga_milo", "A rematch with the Champion! The crops can wait a day. Let's go!", "Ha! You've grown even taller since last time."),
          waves: [WGA("shiftry:60", "eldegoss:60", "bellossom:61"), WGA("cherrim:61"), GMX("flapple:62!")] },
        { id: "e", type: "side", big: 1, name: "Champion Cup Rematch: Gym Leader Milo (Shield)", lv: 62, env: "gym", music: "gaFinals", trainer: TR("Gym Leader Milo", "ga_milo", "In Shield, I've brought a sweeter team! Same Milo, though.", "Lovely battle, that."),
          waves: [WGA("ludicolo:60", "eldegoss:60", "bellossom:61"), WGA("cherrim:61"), GMX("appletun:62!")] },
        { id: "f", type: "boss", name: "Champion Cup Rematch: Gym Leader Nessa", lv: 62, env: "sea", weather: "rain", music: "gaFinals", trainer: TR("Gym Leader Nessa", "ga_nessa", "The tide's turned since the Finals. I'm not going to be swept away twice!", "...Three times, then. You're unbelievable."),
          waves: [WGA("golisopod:60", "pelipper:60", "quagsire:61"), WGA("toxapex:61"), GMX("drednaw:62!")] },
        { id: "g", type: "boss", name: "Champion Cup Rematch: Gym Leader Kabu", lv: 62, env: "volcano", weather: "sun", music: "gaFinals", trainer: TR("Gym Leader Kabu", "ga_kabu", "A Champion who keeps training. Good. So have I.", "The fire in you burns brighter than mine. For now."),
          waves: [WGA("torkoal:60", "ninetales:60", "arcanine:61"), WGA("salazzle:61"), GMX("centiskorch:62!")] },
        { id: "h", type: "boss", name: "Champion Cup Rematch: Gym Leader Bea", lv: 62, env: "gym", music: "gaFinals", trainer: TR("Gym Leader Bea", "ga_bea", "I've trained every day since the Finals. Every day.", "...Every day, again, then."),
          waves: [WGA("hawlucha:60", "grapploct:60", "sirfetchd:61"), WGA("falinks:61"), GMX("machamp:62!")] },
        { id: "i", type: "side", big: 1, name: "Champion Cup Rematch: Gym Leader Allister (Shield)", lv: 62, env: "tower", music: "gaFinals", trainer: TR("Gym Leader Allister", "ga_allister", "...In Shield, I'm the one in the rematch. My friends wanted to see you again.", "...They had fun. Me too."),
          waves: [WGA("dusknoir:60", "chandelure:60", "cursola:61"), WGA("runerigus:61"), GMX("gengar:62!")] },
        { id: "j", type: "boss", name: "Champion Cup Rematch: Gym Leader Gordie", lv: 62, env: "cave", music: "gaFinals", trainer: TR("Gym Leader Gordie", "ga_gordie", "Rock-solid and reloaded. My mom says hi, by the way. And good luck.", "Rocks crumble, I guess. Respect, Champ."),
          waves: [WGA("barbaracle:60", "shuckle:60", "stonjourner:61"), WGA("tyranitar:61"), GMX("coalossal:62!")] },
        { id: "k", type: "side", big: 1, name: "Champion Cup Rematch: Gym Leader Melony (Shield)", lv: 62, env: "ice", music: "gaFinals", trainer: TR("Gym Leader Melony", "ga_melony", "In Shield, it's me, dear. Wrap up warm!", "Oh, well done. You've warmed me right up, sweetie."),
          waves: [WGA("frosmoth:60", "mrrime:60", "eiscue:61"), WGA("darmanitangalar:61"), GMX("lapras:62!")] },
        { id: "l", type: "boss", name: "Champion Cup Rematch: Pokémon Trainer Piers", lv: 62, env: "city", music: "gaPiers", trainer: TR("Pokémon Trainer Piers", "ga_piers", "I'm not a Gym Leader any more, so this is just for the music. Still no Dynamax, mind.", "Good gig. Cheers."),
          waves: [WGA("scrafty:60", "malamar:60", "skuntank:61"), WGA("toxtricity:61", "obstagoon:62!")] },
        { id: "m", type: "boss", name: "Champion Cup Rematch: Gym Leader Raihan", lv: 62, env: "plateau", weather: "sun", music: "gaFinals", trainer: TR("Gym Leader Raihan", "ga_raihan", "Beating Leon was my job! Now I've got to beat you first. Fine by me!", "Gah! Selfie anyway? For the loser's album."),
          waves: [WGA("torkoal:60", "goodra:60", "turtonator:61"), WGA("flygon:61"), GMX("duraludon:62!")] },
        { id: "n", type: "boss", name: "Champion Cup Rematch: Gym Leader Bede", lv: 63, env: "gym", music: "gaFinals", trainer: TR("Gym Leader Bede", "ga_bedeleader", "Opal says a Gym Leader must always rise to a challenge. So I'm rising.", "...Next time, then. There will be a next time."),
          waves: [WGA("mawile:61", "gardevoir:61", "rapidashgalar:62"), WGA("sylveon:62"), GMX("hatterene:63!")] },
        { id: "o", type: "boss", name: "Champion Cup Rematch: Pokémon Trainer Hop", lv: 70, env: "plateau", music: "gaHopFinal", get trainer() { return hopTR("A professor-in-training still needs a good battle now and then! Zamazenta's been waiting all week!", "Brilliant! I'll write this one up in my notes."); },
          rivalWaves: () => [WGA("dubwool:69", "snorlax:68", hopMon(2) + ":70"), GMX("corviknight:70"), WGA("zamazentacrowned:70!")] },
        { id: "p", type: "boss", name: "Champion Cup Rematch: Pokémon Trainer Leon", lv: 70, env: "plateau", music: "gaChampion", trainer: TR("Pokémon Trainer Leon", "ga_leon", "The former Champion against the Champion! Let's have a champion time, one more time!", "That's a champion time for sure! Again sometime?"),
          get waves() { return [WGA("aegislash:70", "dragapult:68", leonSix() + ":69"), WGA(leonAce() + ":70"), GMX("charizard:70!")]; } },
      ] },
    // (The Isle of Armor, the owner's pick: in the Journey after Sword and Shield's own post-game, so its Trainers have their "after the
    // Darkest Day" levels; Sword's Klara is your rival here, Shield's Avery a side stage beside each of her battles; the Tower of Darkness
    // is the main path and the Tower of Waters its side stages, as Kalos's two fossils are)
    { id: "c16", title: "The Isle of Armor", env: "sea", map: "sea", reward: { orundum: 1500, permit: 5, rec4: 3 },
      nodes: [
        { id: "a", type: "battle", name: "Wedgehurst Station: Galarian Slowpoke", lv: 12, env: "city", wild: 1, catch: "slowpokegalar", music: "gaStation", waves: [WGA("slowpokegalar:12")], pre: [
          L("narr", "A Slowpoke with a yellow-tipped head is lying across the platform at Wedgehurst Station, and the ticket man can't get it to move. A girl with an Armor Pass is watching, tapping her foot."),
        ], post: [L("narr", "Gotcha! Galarian Slowpoke was caught! In Galar, Slowpoke eat a spicy seed called Galarica.")] },
        { id: "b", type: "boss", name: "Fields of Honor: Klara", lv: 60, env: "sea", music: "gaKlara", trainer: TR("Pokémon Trainer Klara", "ga_klara", "You're the new student who ran away? No? Well, you're here now, so battle me anyway!", "Wait, you're the Champion?! Why didn't you SAY so?"),
          waves: [WGA("venipede:58", "slowpokegalar:60!")], pre: [
          L("narr", "The train takes you to the Isle of Armor, home of the Master Dojo. Outside the station, a student flees from the girl from the platform. She decides you'll do instead."),
        ] },
        { id: "c", type: "side", big: 1, name: "Fields of Honor: Avery (Shield)", lv: 60, env: "sea", music: "gaAvery", trainer: TR("Pokémon Trainer Avery", "ga_avery", "In Shield, I'm the student you meet here. The Amazing Avery! And you are in my way.", "Hmph! Psychic powers don't work on the Champion, apparently."),
          waves: [WGA("abra:58", "slowpokegalar:60!")] },
        { id: "d", type: "boss", name: "Master Dojo: Dojo Master Mustard", lv: 61, env: "gym", music: "gaMustard", reward: { key: "ga_expcharm" }, trainer: TR("Dojo Master Mustard", "ga_mustard", "Ooh, a new student! The Champion, even? Ha! I trained Leon, you know. Let's see what you've got, before anything else!", "Oh-ho! Splendid, splendid! Welcome to the Master Dojo!"),
          waves: [WGA("mienfoo:61", "shinx:61!")], pre: [
          L("narr", "The Master Dojo sits on a hill in the middle of the island. Honey, the Dojo Matron, welcomes you, her son Hyde gives you an Exp. Charm, and an old man in a tracksuit bounces up to you."),
          L("gamustard", "I was Galar's Champion for eighteen years, you know! Now I teach. And to my best student, I'll give the Dojo's secret armor. If you pass three trials, that is!"),
        ] },
        { id: "e", type: "battle", name: "Soothing Wetlands: Mustard's Slowpoke", lv: 60, env: "sea", wild: 1, music: "gaIsle", waves: [WGA("slowpokegalar:60@salacberry"), WGA("slowpokegalar:60@salacberry"), WGA("slowpokegalar:60@salacberry")], pre: [
          L("narr", "Trial one: three of Mustard's Slowpoke have run off with Klara's uniform. Mustard trained them himself, so they're very, very fast. For Slowpoke."),
        ] },
        { id: "f", type: "chest", name: "Master Dojo: Honey's Gift, Bulbasaur", reward: { op: "bulbasaur", lmd: 5000 }, music: "gaDojo", pre: [
          L("gahoney", "Well done on the first trial, dear! Mustard and I keep Pokémon that can Gigantamax. Take one to look after: this Bulbasaur, say?"),
          L("narr", "Bulbasaur is a Pokémon from Kanto, a long way from home."),
        ] },
        { id: "g", type: "side", chest: 1, name: "Master Dojo: Honey's Gift, Squirtle", reward: { op: "squirtle", lmd: 5000 }, music: "gaDojo", pre: [
          L("narr", "Honey's other Pokémon is a Squirtle, the one you'd have taken instead. It's from Kanto too."),
        ] },
        { id: "h", type: "boss", name: "Warm-Up Tunnel: Klara", lv: 63, env: "cave", music: "gaKlaraBattle", trainer: TR("Pokémon Trainer Klara", "ga_klara", "Trial two: Max Mushrooms! And they're MINE. Sorry, not sorry!", "Ugh, fine! Take the mushrooms. Everybody's eating Max Soup tonight anyway."),
          waves: [WGA("slowpokegalar:62", "koffing:62", "whirlipede:63!")], pre: [
          L("narr", "The Forest of Focus has been picked clean of Max Mushrooms, so you go through the Training Lowlands to the Warm-Up Tunnel. Klara got there first."),
        ] },
        { id: "i", type: "side", big: 1, name: "Warm-Up Tunnel: Avery (Shield)", lv: 63, env: "cave", music: "gaAveryBattle", trainer: TR("Pokémon Trainer Avery", "ga_avery", "The mushrooms are mine, obviously. My psychic powers found them first!", "Hmph. My psychic powers are... tired today."),
          waves: [WGA("slowpokegalar:62", "woobat:62", "kadabra:63!")] },
        { id: "j", type: "boss", name: "Master Dojo Battle Court: Klara", lv: 67, env: "gym", music: "gaKlaraBattle", trainer: TR("Pokémon Trainer Klara", "ga_klara", "Trial three, the Battle Court! A little Toxic Spikes on your side before we start... that's not cheating, is it?", "...Okay. That WAS cheating. And I still lost. I'm sorry."),
          waves: [WGA("skorupi:65", "weezinggalar:66", "whirlipede:66"), DYN("slowbrogalar:67!")], pre: [
          L("narr", "The last trial is a battle on the Dojo's Battle Court, a Power Spot. Klara slips Toxic Spikes onto your side of the court before the battle, and Dynamaxes her Galarian Slowbro."),
        ] },
        { id: "k", type: "side", big: 1, name: "Master Dojo Battle Court: Avery (Shield)", lv: 67, env: "gym", music: "gaAveryBattle", trainer: TR("Pokémon Trainer Avery", "ga_avery", "A little Psychic Terrain before we start. For ambience. The Amazing Avery always wins!", "...Not always, apparently."),
          waves: [WGA("ponytagalar:65", "swoobat:66", "kadabra:66"), DYN("slowbrogalar:67!")] },
        { id: "l", type: "chest", name: "Master Dojo: The Secret Armor", reward: { op: "kubfu", lmd: 5000 }, music: "gaSecretArmor", pre: [
          L("gamustard", "Here it is: the Dojo's secret armor! Kubfu! It's a shy one, but it's strong. Become best friends with it, and take it to the Towers of Two Fists."),
        ] },
        { id: "m", type: "battle", name: "Tower of Darkness: The Students", lv: 68, env: "tower", music: "gaTowerDarkness", trainer: TR("Master Dojo Students", "ga_blackbelt", "Only Kubfu may climb the Tower of Darkness! Show us its strength, floor by floor!", "Go on up. The master is waiting at the top."),
          waves: [WGA("zorua:65"), WGA("scraggy:66"), WGA("inkay:67"), WGA("krokorok:68")], pre: [
          L("narr", "Two towers stand on the island, and Kubfu may train in only one of them. The Tower of Darkness, on Challenge Road, teaches the Single Strike style."),
        ] },
        { id: "n", type: "boss", name: "Tower of Darkness: Dojo Master Mustard", lv: 70, env: "tower", music: "gaMustardBattle", reward: { scrollofdarkness: 1 }, trainer: TR("Dojo Master Mustard", "ga_mustard", "Top floor! My partner and I have been waiting. Show me how far you and Kubfu have come!", "Wonderful! Now, read the scroll, Kubfu. It's time."),
          waves: [WGA("kubfu:70!@focussash")], post: [
          L("narr", "Kubfu reads the Scroll of Darkness hanging at the top of the tower, and the Scroll comes with you: hold it up to Kubfu and it becomes Urshifu, Single Strike Style."),
        ] },
        { id: "o", type: "side", name: "Tower of Waters: The Students", lv: 68, env: "tower", music: "gaTowerWaters", trainer: TR("Master Dojo Students", "ga_blackbelt", "The Tower of Waters teaches the Rapid Strike style! Flowing water wears down any stone!", "Up you go, then!"),
          waves: [WGA("psyduck:65"), WGA("krabby:66"), WGA("marill:67"), WGA("poliwhirl:68")], pre: [
          L("narr", "The other tower, on Challenge Beach: the Tower of Waters. In the games you may only climb one. Here, Kubfu can learn both styles."),
        ] },
        { id: "p", type: "side", big: 1, name: "Tower of Waters: Dojo Master Mustard", lv: 70, env: "tower", music: "gaMustardBattle", reward: { scrollofwaters: 1 }, trainer: TR("Dojo Master Mustard", "ga_mustard", "The top of the Tower of Waters! Same partner, same old me!", "Ha! Now read the scroll, and flow like water!"),
          waves: [WGA("kubfu:70!@focussash")], post: [
          L("narr", "You take the Scroll of Waters: hold it up to a Kubfu, and it becomes Urshifu, Rapid Strike Style."),
        ] },
        { id: "q", type: "battle", name: "Stepping-Stone Sea: Flapple", lv: 60, env: "sea", wild: 1, catch: "flapple", music: "gaIsle", waves: [WGA("applin:60", "skwovet:60"), WGA("flapple:60")], pre: [
          L("narr", "On the little islands of the Stepping-Stone Sea, shaking a Berry tree sometimes brings down more than Berries. In Sword, it's a Flapple."),
        ], post: [L("narr", "Gotcha! Flapple was caught! It flies on wings made of apple skin.")] },
        { id: "r", type: "side", name: "Stepping-Stone Sea: Appletun (Shield)", lv: 60, env: "sea", wild: 1, catch: "appletun", music: "gaIsle", waves: [WGA("greedent:60"), WGA("appletun:60")], pre: [
          L("narr", "In Shield, the Berry trees of the Stepping-Stone Sea drop an Appletun instead, as sweet as a pie."),
        ], post: [L("narr", "Gotcha! Appletun was caught! Its back is covered in sweet nectar.")] },
        { id: "s", type: "chest", name: "Workout Sea: The Galarica Cuff", reward: { galaricacuff: 1, lmd: 5000 }, music: "gaIsle", pre: [
          L("narr", "On a tiny island in the Workout Sea, a woman weaves Galarica Twigs into a cuff. Put it on a Galarian Slowpoke's arm, and the Shellder that bites it becomes Galarian Slowbro."),
        ] },
        { id: "t", type: "boss", name: "Honeycalm Island: Dynamax Vespiquen", lv: 80, env: "forest", wild: 1, music: "gaMaxRaid", reward: { key: "ga_maxhoney" }, waves: [DYN("vespiquen:80!")], pre: [
          L("narr", "Mustard says Urshifu can't drink Max Soup without a secret ingredient. Hop thinks it's honey. On Honeycalm Island, you shake the giant tree, and a Dynamax Vespiquen comes down to defend it."),
        ], post: [L("narr", "The Vespiquen shrinks back to size and flies off, leaving the Max Honey behind. Mustard knew all along, of course.")] },
        { id: "u", type: "boss", name: "Master Dojo Battle Court: Mustard's Last Battle", lv: 75, env: "gym", music: "gaMustardFinal", trainer: TR("Dojo Master Mustard", "ga_mustard", "No more holding back. This is the team I had as Champion. My Urshifu and I are going to give it everything!", "Wahaha! That's my student! The Master Dojo is proud of you."),
          waves: [WGA("mienshao:73", "luxray:73", "corviknight:74"), WGA("lycanroc:75", "kommoo:75"), GMX("urshifurapidstrike:75!")], pre: [
          L("narr", "Mustard's own Urshifu learned the other style, the Rapid Strike, and he Gigantamaxes it on the Battle Court."),
        ] },
        { id: "w", type: "side", chest: 1, name: "Master Dojo: Hyde's Porygon", reward: { op: "porygon", lmd: 3000 }, music: "gaDojo", pre: [
          L("narr", "Hyde, who invented the Exp. Charm, gives you a Porygon he's been tinkering with, a Pokémon from Kanto."),
        ] },
      ] },
    // (The Crown Tundra: Peony's adven-tour, its three Legendary Clues and the Ultra Beasts, the Journey's end with Peony at the Max Lair.
    // Calyrex's steed is the player's choice of carrot in both games: Glastrier and the Ice Rider are the main path, Spectrier and the
    // Shadow Rider its side stages; Regieleki main, Regidrago a side stage. The Max Lair's Dynamax Adventure Legendaries are side stages)
    { id: "c17", title: "The Crown Tundra", env: "ice", map: "ice", reward: { orundum: 2000, permit: 10, rec4: 5 },
      nodes: [
        { id: "a", type: "boss", name: "Slippery Slope: Peony", lv: 70, env: "ice", music: "gaPeonyBattle", trainer: TR("Pokémon Trainer Peony", "ga_peony", "Peony's the name! I was a Gym Leader once, Steel types, top-notch! Peonia says I'm too old for adventures. Let's prove her wrong!", "Bwahaha! Strong! You're my expedition chief now, chief!"),
          waves: [WGA("copperajah:70", "aggron:70!@sitrusberry")], pre: [
          L("narr", "The Crown Tundra: snowfields, mountains and an enormous tree glowing red on the horizon. Outside the station, a big man in an orange coat is arguing with his daughter."),
          L("gapeonia", "Dad, you are NOT going on another adventure. ...Unless they say yes. Go on, battle him. Please?"),
        ] },
        { id: "b", type: "story", name: "Freezington: The Adven-tour", music: "gaFreezington", pre: [
          L("gapeony", "Three Legendary Clues, chief! Old tales of Legendary Pokémon right here in the tundra. We'll solve the lot! Freezington's our base."),
          L("narr", "Peony is Chairman Rose's younger brother. He doesn't talk about it much. In the Freeze Inn, the three clues are waiting on the table."),
        ] },
        { id: "c", type: "boss", name: "Freezington: Calyrex", lv: 80, env: "ice", wild: 1, music: "gaCalyrexBattle", waves: [WGA("calyrex:80!")], pre: [
          L("narr", "Clue one: the King of Bountiful Harvests. You place Peony's \"pillow\", an old wooden crown, on Freezington's statue. A small Pokémon with a head like a bulb appears and attacks."),
        ], post: [
          L("gacalyrex", "(Speaking through Peony) I am Calyrex. Long ago, this land bloomed under my rule. My steed has left me. Help me find it."),
        ] },
        { id: "d", type: "boss", name: "Snowslide Slope: Glastrier", lv: 75, env: "ice", wild: 1, music: "gaSteeds", reward: { key: "ga_reinsofunity" }, waves: [WGA("glastrier:75!")], pre: [
          L("narr", "Calyrex's steed loved carrots. You plant the seeds on the Snowslide Slope, and an Iceroot Carrot grows overnight. A huge white horse gallops into Freezington after it."),
        ], post: [L("narr", "Calyrex drives Glastrier away. It leaves a White Mane Hair behind, and Peony weaves it into the Reins of Unity.")] },
        { id: "e", type: "side", name: "Old Cemetery: Spectrier", lv: 75, env: "ice", wild: 1, music: "gaSteeds", waves: [WGA("spectrier:75!")], pre: [
          L("narr", "Planted in the Old Cemetery instead, the seeds grow a Shaderoot Carrot, and a black horse made of shadow comes for it: Spectrier, the other steed."),
        ] },
        { id: "f", type: "side", chest: 1, name: "Freezington: Fwoofy", reward: { op: "cosmog", lmd: 3000 }, music: "gaFreezington", pre: [
          L("narr", "An old woman across from the peddler has been looking after a strange little Pokémon she calls Fwoofy. She'd like you to take it: a Cosmog, a Pokémon from Alola."),
        ] },
        { id: "g", type: "boss", name: "Crown Shrine: Calyrex, the Ice Rider", lv: 80, env: "ice", wild: 1, catch: "calyrexice", music: "gaRiderBattle", waves: [WGA("calyrexice:80!")], pre: [
          L("narr", "At the Crown Shrine on the mountain's peak, Calyrex mounts Glastrier with the Reins of Unity. As one, they ask you to prove your strength."),
        ], post: [L("narr", "Gotcha! Calyrex was caught, with its steed! The Reins of Unity can part them, or join them again.")] },
        { id: "h", type: "side", name: "Crown Shrine: Calyrex, the Shadow Rider", lv: 80, env: "ice", wild: 1, catch: "calyrexshadow", music: "gaRiderBattle", waves: [WGA("calyrexshadow:80!")], pre: [
          L("narr", "With Spectrier as its steed, Calyrex becomes the Shadow Rider, and its power turns to ghostly fire."),
        ], post: [L("narr", "Gotcha! Calyrex was caught, with Spectrier!")] },
        { id: "i", type: "boss", name: "Rock Peak Ruins: Regirock", lv: 70, env: "cave", wild: 1, catch: "regirock", music: "gaGiants", waves: [WGA("regirock:70!")], pre: [
          L("narr", "Clue two: the terrible titans. Each ruin's door has a riddle; inside, you light every dot on the floor, and a giant wakes up. The first is Regirock, a Pokémon from Hoenn."),
        ], post: [L("narr", "Gotcha! Regirock was caught!")] },
        { id: "j", type: "boss", name: "Iceberg Ruins: Regice", lv: 70, env: "ice", wild: 1, catch: "regice", music: "gaGiants", waves: [WGA("regice:70!")], post: [L("narr", "Gotcha! Regice was caught!")] },
        { id: "k", type: "boss", name: "Iron Ruins: Registeel", lv: 70, env: "cave", wild: 1, catch: "registeel", music: "gaGiants", waves: [WGA("registeel:70!")], post: [L("narr", "Gotcha! Registeel was caught!")] },
        { id: "l", type: "boss", name: "Split-Decision Ruins: Regieleki", lv: 70, env: "cave", wild: 1, catch: "regieleki", music: "gaGiants", waves: [WGA("regieleki:70!")], pre: [
          L("narr", "With all three titans, the Split-Decision Ruins open. Two patterns of dots on the floor: electric or dragon. Light the electric one, and Regieleki wakes."),
        ], post: [L("narr", "Gotcha! Regieleki was caught! It's said to be pure electricity, held inside a shell.")] },
        { id: "m", type: "side", name: "Split-Decision Ruins: Regidrago", lv: 70, env: "cave", wild: 1, catch: "regidrago", music: "gaGiants", waves: [WGA("regidrago:70!")], pre: [
          L("narr", "The dragon pattern wakes Regidrago instead, a giant made from crystallized dragon energy. In the games you can only wake one of the two."),
        ], post: [L("narr", "Gotcha! Regidrago was caught!")] },
        { id: "n", type: "side", name: "Giant's Bed: Regigigas", lv: 100, env: "cave", wild: 1, catch: "regigigas", music: "gaMaxRaid", waves: [DYN("regigigas:100!")], pre: [
          L("narr", "With all five giants together, a dormant den in the Giant's Bed wakes, and their master rises from it, Dynamaxed: Regigigas, a Pokémon from Sinnoh."),
        ], post: [L("narr", "Gotcha! Regigigas was caught!")] },
        { id: "o", type: "boss", name: "Frostpoint Field: Galarian Articuno", lv: 70, env: "ice", wild: 1, catch: "articunogalar", music: "gaBirds", waves: [WGA("articunogalar:70!")], pre: [
          L("narr", "Clue three: on Dyna Tree Hill, three Legendary birds are fighting around the giant red tree. Your Rotom Phone rings, and they scatter across Galar. Galarian Articuno stays in the tundra, hiding among its own mirages."),
        ], post: [L("narr", "Gotcha! Galarian Articuno was caught! Its gaze can freeze its foes in place with psychic power.")] },
        { id: "p", type: "boss", name: "The Wild Area: Galarian Zapdos", lv: 70, env: "route", wild: 1, catch: "zapdosgalar", music: "gaBirds", waves: [WGA("zapdosgalar:70!")], pre: [
          L("narr", "Galarian Zapdos runs instead of flying, around the lakes of the Wild Area, faster than anything with legs should run."),
        ], post: [L("narr", "Gotcha! Galarian Zapdos was caught! Its kicks are as fast as lightning.")] },
        { id: "q", type: "boss", name: "The Isle of Armor: Galarian Moltres", lv: 70, env: "sea", wild: 1, catch: "moltresgalar", music: "gaBirds", waves: [WGA("moltresgalar:70!")], pre: [
          L("narr", "Galarian Moltres circles the Isle of Armor, wreathed in dark flames. You whistle, and it comes down to fight."),
        ], post: [L("narr", "Gotcha! Galarian Moltres was caught! Its flames burn with malice, not heat.")] },
        { id: "r", type: "story", name: "Freezington: The End of the Adven-tour", music: "gaCredits2", reward: { key: ["ga_lcpeony", "ga_goldexpuniform"] }, pre: [
          L("gapeony", "All three clues, chief! Every one! Here: my rare League Card. Best adventure of my life."),
          L("gapeonia", "Dad. Will you come on an adventure with me? In the Max Lair? ...Thanks. You can keep the Gold Expedition Uniform, Champion. You earned it."),
        ] },
        { id: "s", type: "battle", name: "Old Cemetery: Dragapult", lv: 65, env: "ice", wild: 1, catch: "dragapult", music: "gaTundra", waves: [WGA("drakloak:62", "sinistea:62"), WGA("dragapult:65")], pre: [
          L("narr", "Mist hangs over the Old Cemetery. Something flies out of it at incredible speed, launching smaller ghosts like missiles: Dragapult."),
        ], post: [L("narr", "Gotcha! Dragapult was caught! The Dreepy in its horns enjoy being fired at the enemy.")] },
        { id: "t", type: "battle", name: "Path to the Peak: Frosmoth", lv: 65, env: "ice", wild: 1, catch: "frosmoth", music: "gaTundra", waves: [WGA("snom:62"), WGA("frosmoth:65")], pre: [
          L("narr", "On the Path to the Peak, a Frosmoth glides through the falling snow, scattering icy scales."),
        ], post: [L("narr", "Gotcha! Frosmoth was caught! Its icy scales freeze anything that touches them.")] },
        { id: "u", type: "battle", name: "Snowslide Slope: Galarian Darmanitan", lv: 67, env: "ice", wild: 1, catch: "darmanitangalar", music: "gaTundra", waves: [WGA("darumakagalar:62"), WGA("darmanitangalar:67")], pre: [
          L("narr", "In Sword, a Galarian Darmanitan prowls the Snowslide Slope, a snowball balanced on its head."),
        ], post: [L("narr", "Gotcha! Galarian Darmanitan was caught! It never lets its snowball melt.")] },
        { id: "v", type: "side", name: "Old Cemetery: Galarian Rapidash (Shield)", lv: 67, env: "ice", wild: 1, catch: "rapidashgalar", music: "gaTundra", waves: [WGA("ponytagalar:62"), WGA("rapidashgalar:67")], pre: [
          L("narr", "In Shield, a Galarian Rapidash walks among the graves where Sword's Darmanitan would be, its horn glowing."),
        ], post: [L("narr", "Gotcha! Galarian Rapidash was caught!")] },
        ...[["virizion", "Giant's Bed", 70, "green"], ["cobalion", "the Frigid Sea", 70, "dark blue"], ["terrakion", "Lakeside Cave", 70, "gray"], ["keldeo", "Ballimere Lake", 65, ""]].map(([k, place, lv, prints]) => ({
          id: "j" + k, type: "side", name: `${place[0].toUpperCase() + place.slice(1)}: ${OPS[k] ? OPS[k].n : k}`, lv, env: /Sea|Lake/.test(place) ? "sea" : /Cave/.test(place) ? "cave" : "ice", wild: 1, catch: k, music: "gaTundra",
          waves: [WGA(k + ":" + lv + "!")], pre: [L("narr", prints ? `Sonia's Pokémon Finder follows ${prints} footprints across the tundra to ${place}, and one of the Swords of Justice, a Pokémon from Unova, is waiting there.`
            : "New footprints on the island in Ballimere Lake. You cook curry there with the three Swords of Justice, and the fourth comes to share it: Keldeo, from Unova.")],
          post: [L("narr", `Gotcha! ${OPS[k] ? OPS[k].n : k} was caught!`)] })),
        { id: "w", type: "story", name: "Max Lair: They Came From the Ultra Beyond", music: "gaMaxLair", pre: [
          L("narr", "A wormhole has opened over the Max Lair. Ultra Beasts are turning up in its dens, and Necrozma with them. Peony's taken up residence by the entrance, delighted."),
          L("narr", "In the Max Lair's Dynamax Adventures, a team of rented Pokémon fights through three Max Raids to reach a Legendary Pokémon waiting at the bottom. Every one of them Dynamaxes."),
        ] },
        ...[["articuno"], ["zapdos"], ["moltres"], ["mewtwo"], ["raikou"], ["entei"], ["suicune"], ["hooh"], ["lugia", 1], ["latios"], ["latias", 1], ["groudon"], ["kyogre", 1], ["rayquaza"], ["uxie"], ["mesprit"], ["azelf"],
          ["dialga"], ["palkia", 1], ["heatran"], ["giratina"], ["cresselia"], ["tornadus"], ["thundurus", 1], ["reshiram"], ["zekrom", 1], ["landorus"], ["kyurem"], ["xerneas"], ["yveltal", 1], ["zygarde"],
          ["tapukoko"], ["tapulele"], ["tapubulu"], ["tapufini"], ["solgaleo"], ["lunala", 1], ["nihilego"], ["buzzwole"], ["pheromosa"], ["xurkitree"], ["celesteela"], ["kartana"], ["guzzlord"], ["necrozma"], ["stakataka"], ["blacephalon"]].map(([k, sh]) => ({
          id: "x" + k, type: "side", name: `Max Lair: ${OPS[k] ? OPS[k].n : k}${sh ? " (Shield)" : ""}`, lv: 70, env: "cave", wild: 1, catch: k, music: "gaAdventureBattle",
          waves: [DYN(k + ":70!")], pre: [L("narr", `At the bottom of a Dynamax Adventure, a Dynamax ${OPS[k] ? OPS[k].n : k} is waiting${sh ? ", as it does in Shield" : ""}. It's a Pokémon from ${REGION_NAME[regionOf(k)]}.`)],
          post: [L("narr", `Gotcha! ${OPS[k] ? OPS[k].n : k} was caught!`)] })),
        { id: "y", type: "boss", name: "Max Lair: Peony", lv: 74, env: "cave", music: "gaPeonyBattle", trainer: TR("Pokémon Trainer Peony", "ga_peony", "Chief! You've seen every Legendary in the Crown Tundra. One more adventure, then: a battle with the old Steel-type Gym Leader, at full power!", "Bwahahaha! What an adventure! What a Champion!"),
          waves: [WGA("perrserker:74", "bronzong:73", "scizor:73"), WGA("aggron:74"), WGA("copperajah:74!")], pre: [
          L("narr", "Peony waits by the Max Lair's entrance every day now, ready for a battle with whoever comes by."),
        ], post: [
          L("narr", "Galar's Champion, from the Slumbering Weald to the Crown Tundra. You've done it: the Galar Journey is complete."),
        ] },
      ] },
  ],
};
STORY.push(GALAR_JOURNEY);
indexJourney(GALAR_JOURNEY);
// The Battle Tower's Galar wing (TOWER_WING in a4_story.js; the owner's rule: every Galar battle the Journey leaves out goes to the Tower):
// the Galarian Star Tournament's twenty competitors (each with the three Pokémon they bring; the other version's Milo, Allister and Melony
// too), Leon at the top of each tier of the Battle Tower (Lv 50: his Charizard always last, two of his tier's sets ahead of it), Klara's and
// Avery's rematches at the Master Dojo, and Pokémon Breeder Chloe after you become Champion. Floors sort by level. Honey's battle at the
// Dojo is left out: the owner's pack has no picture of her.
const SWA = "Sword", SHA = "Shield", SWSH = "Sword and Shield", GST = "the Galarian Star Tournament";
const GST_BGM = { bgm: "gaFinals", winBgm: "gaCupWin" }, LEON_TOWER_BGM = { bgm: "gaChampion", winBgm: "gaChampionWin" }, DOJO_BGM = { winBgm: "gaMustardWin" };
if (typeof TOWER_WING === "object") TOWER_WING.galar = [
  // ---- the Battle Tower: Leon, the last battle of each tier (Lv 50, the Tower's Flat Rules) ----
  { n: "Battle Tower Leon", t: "ga_leontower", from: SWSH + ": the Battle Tower, the Beginner tier", waves: [WGA("haxorus:50@scopelens", "aegislash:50@sitrusberry"), GMX("charizard:50!@chartiberry")], ...LEON_TOWER_BGM },
  { n: "Battle Tower Leon", t: "ga_leontower", from: SWSH + ": the Battle Tower, the Poké Ball tier", waves: [WGA("rhyperior:50@weaknesspolicy", "seismitoad:50@damprock"), GMX("charizard:50!@chartiberry")], ...LEON_TOWER_BGM },
  { n: "Battle Tower Leon", t: "ga_leontower", from: SWSH + ": the Battle Tower, the Great Ball tier", waves: [WGA("dragapult:50@liechiberry", "rillaboom:50@leftovers"), GMX("charizard:50!@chartiberry")], ...LEON_TOWER_BGM },
  { n: "Battle Tower Leon", t: "ga_leontower", from: SWSH + ": the Battle Tower, the Ultra Ball tier", waves: [WGA("inteleon:50@focussash", "mrrime:50@expertbelt"), GMX("charizard:50!@chartiberry")], ...LEON_TOWER_BGM },
  { n: "Battle Tower Leon", t: "ga_leontower", from: SWSH + ": the Battle Tower, the Master Ball tier", waves: [WGA("cinderace:50@lifeorb", "aegislash:50@weaknesspolicy"), GMX("charizard:50!@chartiberry")], ...LEON_TOWER_BGM },
  // ---- after you become Champion ----
  { n: "Pokémon Breeder Chloe", t: "ga_breederf", from: SWSH + ": the Wild Area, after you become Champion", waves: [WGA("inteleon:60", "rillaboom:60", "cinderace:60!")], bgm: "gaTowerBattle" },
  { n: "Pokémon Trainer Klara", t: "ga_klara", from: SWA + ": the Master Dojo, after her rare League Card", waves: [WGA("drapion:65", "weezinggalar:66", "scolipede:66"), DYN("slowbrogalar:67!")], bgm: "gaKlaraBattle", ...DOJO_BGM },
  { n: "Pokémon Trainer Avery", t: "ga_avery", from: SHA + ": the Master Dojo, after his rare League Card", waves: [WGA("rapidashgalar:65", "swoobat:66", "alakazam:66"), DYN("slowbrogalar:67!")], bgm: "gaAveryBattle", ...DOJO_BGM },
  { n: "Gym Leader Klara", t: "ga_klara", from: SWA + ": the Master Dojo, after " + GST, waves: [WGA("slowkinggalar:68", "weezinggalar:68", "drapion:68"), WGA("scolipede:69"), DYN("slowbrogalar:70!")], bgm: "gaKlaraBattle", ...DOJO_BGM },
  { n: "Gym Leader Avery", t: "ga_avery", from: SHA + ": the Master Dojo, after " + GST, waves: [WGA("slowbrogalar:68", "rapidashgalar:68", "swoobat:68"), WGA("alakazam:69"), DYN("slowkinggalar:70!")], bgm: "gaAveryBattle", ...DOJO_BGM },
  // ---- the Galarian Star Tournament: every competitor, with the three Pokémon they bring ----
  { n: "Pokémon Trainer Hop", t: "ga_hop", from: SWA + ": " + GST, waves: () => [WGA("dubwool:69", "zamazentacrowned:70"), GMX(hopMon(2) + ":70!")], ...GST_BGM },
  { n: "Gym Leader Milo", t: "ga_milo", from: SWA + ": " + GST, waves: [WGA("shiftry:72", "cherrim:73"), GMX("flapple:74!")], ...GST_BGM },
  { n: "Gym Leader Milo", t: "ga_milo", from: SHA + ": " + GST, waves: [WGA("ludicolo:72", "cherrim:73"), GMX("appletun:74!")], ...GST_BGM },
  { n: "Gym Leader Nessa", t: "ga_nessa", from: SWSH + ": " + GST, waves: [WGA("golisopod:72", "toxapex:73"), GMX("drednaw:74!")], ...GST_BGM },
  { n: "Gym Leader Kabu", t: "ga_kabu", from: SWSH + ": " + GST, waves: [WGA("torkoal:72", "arcanine:73"), GMX("centiskorch:74!")], ...GST_BGM },
  { n: "Gym Leader Bea", t: "ga_bea", from: SWA + ": " + GST, waves: [WGA("hawlucha:72", "falinks:73"), GMX("machamp:74!")], ...GST_BGM },
  { n: "Gym Leader Allister", t: "ga_allister", from: SHA + ": " + GST, waves: [WGA("dusknoir:72", "cursola:73"), GMX("gengar:74!")], ...GST_BGM },
  { n: "Gym Leader Bede", t: "ga_bedeleader", from: SWSH + ": " + GST, waves: [WGA("mawile:72", "rapidashgalar:73"), GMX("hatterene:74!")], ...GST_BGM },
  { n: "Pokémon Trainer Opal", t: "ga_opal", from: SWSH + ": " + GST, waves: [WGA("weezinggalar:68", "togekiss:69"), GMX("alcremie:70!")], ...GST_BGM },
  { n: "Gym Leader Gordie", t: "ga_gordie", from: SWA + ": " + GST, waves: [WGA("shuckle:72", "tyranitar:73"), GMX("coalossal:74!")], ...GST_BGM },
  { n: "Gym Leader Melony", t: "ga_melony", from: SHA + ": " + GST, waves: [WGA("mrrime:72", "darmanitangalar:73"), GMX("lapras:74!")], ...GST_BGM },
  { n: "Gym Leader Marnie", t: "ga_marnieleague", from: SWSH + ": " + GST, waves: [WGA("morpeko:73", "scrafty:72"), GMX("grimmsnarl:74!")], ...GST_BGM },
  { n: "Pokémon Trainer Piers", t: "ga_piers", from: SWSH + ": " + GST + " (he never Dynamaxes)", waves: [WGA("skuntank:73", "toxtricity:73", "obstagoon:74!")], ...GST_BGM },
  { n: "Gym Leader Raihan", t: "ga_raihan", from: SWSH + ": " + GST, waves: [WGA("flygon:75", "goodra:74"), GMX("duraludon:76!")], ...GST_BGM },
  { n: "Pokémon Trainer Leon", t: "ga_leon", from: SWSH + ": " + GST, waves: [WGA("aegislash:80", "dragapult:78"), GMX("charizard:80!")], ...GST_BGM },
  { n: "Gym Leader Klara", t: "ga_klara", from: SWA + ": " + GST, waves: [WGA("slowkinggalar:68", "scolipede:69"), DYN("slowbrogalar:70!")], ...GST_BGM },
  { n: "Gym Leader Avery", t: "ga_avery", from: SHA + ": " + GST, waves: [WGA("slowbrogalar:68", "alakazam:69"), DYN("slowkinggalar:70!")], ...GST_BGM },
  { n: "Dojo Master Mustard", t: "ga_mustard", from: SWSH + ": " + GST + " (his Urshifu the style yours isn't)", waves: [WGA("mienshao:80", "kommoo:80"), GMX("urshifurapidstrike:80!")], ...GST_BGM },
  { n: "Pokémon Trainer Peony", t: "ga_peony", from: SWSH + ": " + GST, waves: [WGA("perrserker:74", "aggron:74"), GMX("copperajah:74!")], ...GST_BGM },
  { n: "Pokémon Trainer Sordward", t: "ga_sordward", from: SWSH + ": " + GST + " (he never Dynamaxes)", waves: [WGA("sirfetchd:65", "golisopod:65", "bisharp:65!")], ...GST_BGM },
  { n: "Pokémon Trainer Shielbert", t: "ga_shielbert", from: SWSH + ": " + GST + " (he never Dynamaxes)", waves: [WGA("sirfetchd:65", "bronzong:65", "klinklang:65!")], ...GST_BGM },
];
