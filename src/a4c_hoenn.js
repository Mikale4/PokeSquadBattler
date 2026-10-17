
// =====================================================================
//  HOENN JOURNEY — a retelling of Pokémon Emerald (the strongest version: the owner's rule): Professor Birch's Bag on Route 101,
//  eight Gyms with Juan as the eighth, Team Magma and Team Aqua both after the land and the sea, Groudon and Kyogre waking and
//  Rayquaza stopping them, the Elite Four and Champion Wallace, then the super-ancient Pokémon in the Terra and Marine Caves.
//  Each battle uses its strongest version's team out of Ruby/Sapphire, Emerald and Omega Ruby/Alpha Sapphire (the owner's rule: the
//  highest total power after the region lock and the Lv 36 rule, a tie going to Emerald): Norman and Drake are Ruby/Sapphire's, Winona,
//  Sidney, Phoebe, Wally, the Winstrates, the rival's line, Maxie at Mt. Chimney, Archie and most Grunts Omega Ruby/Alpha Sapphire's
//  (a later Pokémon written as Hoenn's own: Phoebe's Dusknoir is a Dusclops, Wally's Gallade a Kirlia, grown into a Gardevoir), the rest
//  Emerald's. Emerald's post-game story stays: the super-ancient Pokémon and Steven in Meteor Falls, the Journey's end. Dialogue is original.
//  Only Hoenn's Pokémon (Gen 3's) battle on your side here (journeyOk); its wild stages catch them. Where Emerald lines up a row of
//  Grunts, a stage has one or two of them, each with their own party. What isn't Emerald's story (Ruby/Sapphire's and Omega Ruby/
//  Alpha Sapphire's different teams, Emerald's rematches, Steven after the League, the Battle Frontier's Brains, the Delta Episode)
//  is the Battle Tower's Hoenn wing, at the end of this file.
//  Stage ids start with "ho" (REGION_CODE in a4_story.js): ho1-1, hoS1-1; chapters hoc1... `music` on a stage: the place's track
//  while its scene plays (Ruby/Sapphire's, which Emerald uses too: a8c_sfx.js).
// =====================================================================
// Professor Birch's child, your rival: the one you aren't (in Emerald you choose Brendan or May): May while you look like a boy,
// Brendan while you look like a girl (LEAF_LIKE, a9a_screens.js)
const hoennRivalMay = () => { try { return !LEAF_LIKE.includes(avatar()); } catch (e) { return true; } };
const hoennRivalName = () => hoennRivalMay() ? "May" : "Brendan";
const hoennRivalSpr = () => hoennRivalMay() ? "ho_may" : "ho_brendan";
Object.assign(SPK, {
  birch: { n: "Prof. Birch", t: "ho_birch" }, hmom: { n: "Mom", t: "ho_mom" }, norman: { n: "Norman", t: "ho_norman" }, wally: { n: "Wally", t: "ho_wally" },
  hrival: { get n() { return hoennRivalName(); }, get t() { return hoennRivalSpr(); } },
  briney: { n: "Mr. Briney", t: "ho_briney" }, mrstone: { n: "Mr. Stone", t: "ho_stone" }, steven: { n: "Steven", t: "ho_steven" }, devon: { n: "Devon Researcher", t: "ho_scientist" },
  stern: { n: "Captain Stern" }, cozmo: { n: "Prof. Cozmo" }, wsci: { n: "Weather Institute Scientist", t: "ho_scientist" }, oldcouple: { n: "Old Woman", t: "ho_oldcouple" },
  roxanne: { n: "Roxanne", t: "ho_roxanne" }, brawly: { n: "Brawly", t: "ho_brawly" }, wattson: { n: "Wattson", t: "ho_wattson" }, flannery: { n: "Flannery", t: "ho_flannery" },
  winona: { n: "Winona", t: "ho_winona" }, tateliza: { n: "Tate & Liza", t: "ho_tateliza" }, juan: { n: "Juan", t: "ho_juan" }, wallace: { n: "Wallace", t: "ho_wallace" },
  sidney: { n: "Sidney", t: "ho_sidney" }, phoebe: { n: "Phoebe", t: "ho_phoebe" }, glacia: { n: "Glacia", t: "ho_glacia" }, drake: { n: "Drake", t: "ho_drake" },
  maxie: { n: "Maxie", t: "ho_maxie" }, archie: { n: "Archie", t: "ho_archie" }, tabitha: { n: "Tabitha", t: "ho_tabitha" },
  matt: { n: "Matt", t: "ho_matt" }, shelly: { n: "Shelly", t: "ho_shelly" }, magma: { n: "Team Magma Grunt", t: "ho_magma" }, aqua: { n: "Team Aqua Grunt", t: "ho_aqua" },
});
// a line whose words are worked out when it's shown (it names your rival)
const LR = (s, f) => ({ s, get t() { return f(); } });
const WH = WG(3);
const hoTM = mv => (TMS.find(t => t[3] === mv && t[1] === 3) || [])[0];   // (a Gen 3 TM or HM by its move, for a stage's reward: tmId in a6_state.js loads after this file)
// the rival takes the starter strong against yours from Professor Birch's Bag. One line of teams, the strongest (Omega Ruby/Alpha
// Sapphire's), by your starter: Route 110, Route 119 and Lilycove, the starter's line last (Emerald's Rustboro battle has no team on
// it: it's in the Battle Tower)
const HOENN_RIVAL_OF = { treecko: "torchic", torchic: "mudkip", mudkip: "treecko" };
const HOENN_RIVAL_LINE = { treecko: ["treecko", "grovyle", "sceptile"], torchic: ["torchic", "combusken", "blaziken"], mudkip: ["mudkip", "marshtomp", "swampert"] };
const hoennStarter = () => { const k = regionStarter("hoenn"); return HOENN_RIVAL_OF[k] ? k : "treecko"; };
const birchMon = st => HOENN_RIVAL_LINE[HOENN_RIVAL_OF[hoennStarter()]][st];
const birchTeam = n => ({
  treecko: [["wailmer:18", "shroomish:18"], ["wailmer:31", "shroomish:31"], ["swellow:37", "wailord:37", "breloom:37"]],
  torchic: [["shroomish:18", "slugma:18"], ["shroomish:31", "slugma:31"], ["swellow:37", "breloom:37", "magcargo:37"]],
  mudkip: [["slugma:18", "wailmer:18"], ["slugma:31", "wailmer:31"], ["swellow:37", "magcargo:37", "wailord:37"]],
}[hoennStarter()][n]);
const hoennRivalTR = (intro, lose) => TR(hoennRivalName(), hoennRivalSpr(), intro, lose);

const HOENN_JOURNEY = {
  id: "hoenn", title: "Hoenn Journey", sub: "The Hoenn League Challenge",
  blurb: "Start in Littleroot Town with a partner from Professor Birch's Bag, earn Hoenn's eight Gym Badges, stop Team Magma and Team Aqua before the land and the sea swallow Hoenn, and face the Elite Four at Ever Grande City.",
  chapters: [
    { id: "c1", title: "Littleroot Town to Rustboro City", env: "route", map: "route", reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Route 101: Professor Birch's Bag", env: "route", starter: 1, music: "hoHelp", pre: [
          L("narr", "The moving truck bumps to a stop. Your family has come all the way from Johto to Littleroot Town, in the Hoenn region."),
          L("hmom", "We're here! Your father's the new Gym Leader in Petalburg City, so this is home now. Go and say hello to our neighbor, Professor Birch."),
          L("narr", "The Professor isn't home. Out on Route 101, someone is shouting for help: a man is backed up a tree by a Zigzagoon."),
          L("birch", "You there! Please, help me! In my Bag, there's a Poké Ball. Quickly, use it!"),
        ], post: [
          L("narr", "You throw the Poké Ball and your new partner faces the Zigzagoon."),
        ] },
        { id: "b", type: "battle", name: "Route 101: the Wild Zigzagoon", lv: 2, env: "route", wild: 1, waves: [WH("zigzagoon:2")], post: [
          L("birch", "Whew! Thank you! I'm Professor Birch. I study Pokémon out in the wild, which is how I end up up a tree now and then."),
          LR("birch", () => `You handled that Pokémon like you were made for each other. Keep it! And go and find my kid, ${hoennRivalName()}, on Route 103: you two should get along.`),
        ] },
        { id: "c", type: "battle", name: "Route 103: the Professor's Kid", reward: { key: ["ho_pokedex", "ho_pokeballs", "ho_runningshoes"] }, get music() { return hoennRivalMay() ? "hoMeetMay" : "hoMeetBrendan"; }, lv: 5, env: "route", get trainer() { return hoennRivalTR("Oh, you're our new neighbor! You got a Pokémon from my dad? Let's see what it can do!", "Wow, you're good! You really did get that one from my dad, huh?"); },
          // (Lv 3, not the games' 5: here a starter knows its type's move from the start, the newest games' learnsets, so Mudkip's only
          // attack is a Water Gun the rival's Treecko resists: it won none of 300 battles at Lv 5 and 15% at Lv 4; at Lv 3 every starter
          // wins about every time. Kanto's Blue and Johto's Silver are a level under their games too: README, House rules)
          rivalWaves: () => [[{ op: birchMon(0), LV: 3, moves: { treecko: ["pound", "leer"], torchic: ["scratch", "growl"], mudkip: ["tackle", "growl"] }[birchMon(0)] }]], pre: [
          LR("hrival", () => `Hi! I'm ${hoennRivalName()}. I'm helping my dad fill in his records of Hoenn's Pokémon. You just moved in, right? Let's battle!`),
        ], post: [
          L("birch", "You two battled already? Then you're a real Trainer. Take this Pokédex: it records every Pokémon you see and catch."),
          L("hrival", "And here are some Poké Balls from me. I'm going to fill my Pokédex faster than you, though!"),
          L("hmom", "Off on an adventure? Then wear these Running Shoes. And go and see your father in Petalburg City!"),
        ] },
        { id: "d", type: "battle", name: "Route 102", lv: 4, env: "route", wild: 1, catch: "poochyena", waves: [WH("poochyena:3", "wurmple:3"), WH("zigzagoon:4", "lotad:4")], pre: [
          L("narr", "West of Oldale Town, Route 102 winds through tall grass. A Poochyena bares its fangs at anything that moves, then darts back into the grass."),
        ], post: [L("narr", "Gotcha! Poochyena was caught! It chases anything that moves, and doesn't give up.")] },
        { id: "e", type: "story", name: "Petalburg City: Wally's First Pokémon", music: "hoPetalburg", pre: [
          L("norman", "So you've come all this way on your own! You've got a Pokémon of your own, too. I'm proud of you."),
          L("wally", "Um... excuse me. I'm Wally. I'm moving to Verdanturf Town, where the air is clean, because I'm sick so often. I'd like a Pokémon to keep me company..."),
          L("norman", "Then take my Zigzagoon and this Poké Ball, Wally. My child will go with you to catch one."),
          L("narr", "In the grass of Route 102, Wally's Zigzagoon weakens a wild Ralts, and Wally throws his ball with both hands. It shakes... and clicks. A Ralts!"),
          L("wally", "I did it! Thank you so much. Ralts and I will look after each other."),
          L("norman", "If you want to become a strong Trainer, go to Rustboro City and challenge its Gym Leader, Roxanne. Once you have four Badges, come back and I'll battle you."),
          L("narr", "As you leave Petalburg, a man in sunglasses watches you from the side of the road. He smiles, and strolls off."),
        ] },
        { id: "f", type: "side", name: "Route 102: a Shy Pokémon", lv: 4, env: "route", wild: 1, catch: "ralts", waves: [WH("wurmple:4", "poochyena:4"), WH("ralts:4!")], pre: [
          L("narr", "Something small is hiding in the grass, peeking out from under a helmet of green. Ralts senses what people feel, and it hides from anyone hostile."),
        ], post: [L("narr", "Gotcha! Ralts was caught! It seems happy to feel your mood.")] },
        { id: "g", type: "battle", name: "Route 104", lv: 5, env: "route", wild: 1, catch: "taillow", waves: [WH("poochyena:4", "wingull:4"), WH("taillow:5", "marill:5")], pre: [
          L("narr", "Route 104 runs along the coast north of Petalburg. A little cottage sits on the beach, and Taillow wheel overhead, small but fearless."),
        ], post: [L("narr", "Gotcha! Taillow was caught! It takes on foes much bigger than itself.")] },
        { id: "h", type: "battle", name: "Petalburg Woods: Team Aqua", reward: { key: "ho_greatball" }, music: "hoMeetAqua", lv: 9, env: "forest", trainer: TR("Team Aqua Grunt", "ho_aqua", "Hand over those documents, Devon boy! ...Who are you? Fine, I'll take care of you first!", "Grr! You little pest!"),
          waves: [WH("poochyena:9")], pre: [
          L("devon", "Have you seen any Shroomish around here? I love that little Pokémon... Oh! Who are you?"),
          L("aqua", "Hey, you! Devon Corporation's researcher! Give me those papers you're carrying!"),
        ], post: [
          L("aqua", "Fine, keep your papers. But my friends are already in Rustboro... Hah!"),
          L("devon", "Thank you! Those documents were very important. Please, take this Great Ball. What were those people after, I wonder?"),
        ] },
        { id: "i", type: "side", name: "Petalburg Woods", lv: 6, env: "forest", wild: 1, catch: "slakoth", waves: [WH("shroomish:5", "silcoon:5"), WH("cascoon:5", "slakoth:6")], pre: [
          L("narr", "Petalburg Woods is dim even at noon. A Slakoth hangs from a branch, as still as it's been all day."),
        ], post: [L("narr", "Gotcha! Slakoth was caught! It sleeps twenty hours a day, and eats only the leaves it can reach without moving.")] },
        { id: "j", type: "battle", name: "Rustboro Gym: Youngster Josh", reward: { tm: hoTM("cut") }, music: "hoEyesYoungster", lv: 10, env: "gym", trainer: TR("Youngster Josh", "ho_youngster", "Roxanne goes to the Trainers' School like me! But you won't get to her!", "Wow! You're really strong!"),
          waves: [WH("geodude:10")], pre: [
          L("narr", "Rustboro City, a city of stone: the Devon Corporation's tower, the Pokémon Trainers' School, and the Gym of Hoenn's first Leader."),
          L("narr", "In the Cutter's House, a man who loves trimming trees gives you HM01 Cut."),
        ] },
        { id: "k", type: "boss", name: "Roxanne, the Rock-Loving Honor Student", reward: { tm: hoTM("rocktomb") }, lv: 15, env: "gym", badgeWin: 0,
          trainer: TR("Leader Roxanne", "ho_roxanne", "I learned everything I know about battles at the Trainers' School. Let me show you what Rock-type Pokémon can do!", "I lost... I see I still have much more to learn. Here: the Stone Badge is yours."),
          waves: [WH("geodude:12+", "geodude:12+", "nosepass:15!@oranberry")], pre: [
          L("roxanne", "Hello, I'm Roxanne, the Rustboro Gym Leader. I became a Gym Leader so I could put what I learned at the Trainers' School to use in battle."),
          L("narr", "Rock types shrug off Normal and Flying moves. Water, Grass, Fighting, Ground and Steel moves hit them hard."),
        ], post: [L("roxanne", "The Stone Badge raises your Pokémon's Attack. And take this TM: Rock Tomb. It drops rocks on your opponent and slows it down.")] },
      ] },
    { id: "c2", title: "Dewford Town and Slateport City", env: "sea", map: "sea", reward: { lmd: 4000, orundum: 300 },
      nodes: [
        { id: "a", type: "battle", name: "Rusturf Tunnel: the Devon Goods", reward: { key: ["ho_devongoods", "ho_letter", "ho_pokenav"] }, music: "hoMeetAqua", lv: 13, env: "cave", trainer: TR("Team Aqua Grunt", "ho_aqua", "Don't come any closer! I'll... I'll do something to this Wingull!", "...Okay, okay! I give up! Take the stupid parts!"),
          waves: [WH("poochyena:13")], pre: [
          L("narr", "Outside the Gym, the Grunt from Petalburg Woods bolts out of the Devon Corporation with a package under his arm. He runs east, to Route 116."),
          L("briney", "Help! That ruffian ran into the tunnel with my darling Peeko! He's taken my Wingull!"),
          L("narr", "Rusturf Tunnel stops after a few steps: its digging was abandoned. The Grunt is cornered at the end."),
        ], post: [
          L("briney", "Peeko! Oh, you're safe! Thank you, thank you. I'm Mr. Briney. If you ever need to cross the sea, you come to my cottage on Route 104."),
          L("mrstone", "You got our Devon Goods back? Splendid! I'm the president of the Devon Corporation. Would you do me two favors?"),
          L("mrstone", "Take this letter to my son Steven, in Dewford Town, and these Goods to Captain Stern at the shipyard in Slateport City. And take a PokéNav, too!"),
        ] },
        { id: "c", type: "side", name: "Route 116", lv: 7, env: "route", wild: 1, catch: "nincada", waves: [WH("poochyena:6", "whismur:7"), WH("nincada:7", "taillow:7")], pre: [
          L("narr", "East of Rustboro, Route 116's grass hums. Nincada spend years underground, sipping sap from tree roots, and come up to see the sun."),
        ], post: [L("narr", "Gotcha! Nincada was caught! When it evolves, its old shell sometimes moves on its own...")] },
        { id: "d", type: "story", name: "Mr. Briney's Boat", reward: { key: "ho_oldrod" }, music: "hoSailing", pre: [
          L("briney", "Dewford, is it? Leave it to Peeko and me! We'll have you there before you know it. Hold on tight!"),
          L("narr", "The little boat cuts across the waves to Dewford Town, a fishing village on an island. A fisherman on the pier gives you an Old Rod."),
        ] },
        { id: "e", type: "battle", name: "Dewford Gym: Battle Girl Laura", music: "hoEyesPsychic", lv: 13, env: "gym", trainer: TR("Battle Girl Laura", "ho_battlegirl", "The Gym is pitch-black, but my Meditite can sense you coming!", "The lights are coming on... I've lost!"),
          waves: [WH("meditite:13")] },
        { id: "f", type: "boss", name: "Brawly, a Big Wave in Fighting", reward: { tm: hoTM("bulkup") }, lv: 19, env: "gym", badgeWin: 1,
          trainer: TR("Leader Brawly", "ho_brawly", "I'm Brawly! I came here for the big waves and the tough training. Ready to get swept away?", "Whoa, you wiped me out! Here's the Knuckle Badge. You earned it."),
          waves: [WH("machop:16+", "meditite:16+", "makuhita:19!@sitrusberry")], pre: [
          L("brawly", "I trained in Granite Cave's darkness and on Dewford's biggest waves. My Fighting Pokémon hit like a breaker!"),
          L("narr", "Fighting types hit Normal, Rock, Steel, Ice and Dark hard. Flying and Psychic moves hit them hard."),
        ], post: [L("brawly", "With the Knuckle Badge, Pokémon you trade for listen to you up to Lv 30. And take Bulk Up: it toughens your body to hit harder and take hits.")] },
        { id: "g", type: "battle", name: "Granite Cave", reward: { tm: hoTM("flash") }, lv: 11, env: "cave", wild: 1, catch: "aron", waves: [WH("makuhita:10", "zubat:9"), WH("aron:11", "abra:10")], music: "hoWoods", pre: [
          L("narr", "Granite Cave is north of Dewford. A hiker at the entrance hands you HM05 Flash for the dark floors below. Aron chew on the iron ore in the walls."),
        ], post: [L("narr", "Gotcha! Aron was caught! It eats iron, and has been known to munch on railway tracks.")] },
        { id: "h", type: "story", name: "Granite Cave: Steven", reward: { tm: hoTM("steelwing") }, music: "hoWoods", pre: [
          L("steven", "My name's Steven. I'm interested in rare stones, so I travel here and there... Oh? A letter for me, from my father? Thank you."),
          L("steven", "Your Pokémon look strong. If you keep training, you could become the Champion, you know. Here: Steel Wing. A token of thanks."),
          L("narr", "Steven walks off into the darkness, looking at the walls as if they were pictures in a gallery."),
        ] },
        { id: "i", type: "side", name: "Granite Cave B2F", lv: 12, env: "cave", wild: 1, catch: "sableye", waves: [WH("aron:11", "geodude:11"), WH("sableye:12!")], pre: [
          L("narr", "The deepest floor of Granite Cave glitters. A Sableye is digging for gems with its claws; it eats them, and they become its eyes."),
        ], post: [L("narr", "Gotcha! Sableye was caught!")] },
        { id: "j", type: "battle", name: "Oceanic Museum: Team Aqua", music: "hoMuseum", lv: 16, env: "city", trainer: TR("Team Aqua Grunts", "ho_aqua", "We're here for Captain Stern's parts! Get lost, kid!", "Ugh... Our boss isn't going to like this."),
          waves: [WH("carvanha:16"), WH("zubat:14", "carvanha:14")], pre: [
          L("narr", "Mr. Briney sails on to Slateport City. Captain Stern is at the Oceanic Museum, and a line of people in striped shirts and blue bandanas is waiting at the door: Team Aqua."),
          L("aqua", "Those parts you've got are for Stern's submarine, right? Hand them over! We're Team Aqua, and we have big plans for the sea!"),
        ], post: [
          L("archie", "Hold it right there! Kid, I'm Archie, the leader of Team Aqua. All life came from the sea, so we're going to give the sea more room. Don't get in our way again."),
          L("narr", "Archie and his Grunts leave. Captain Stern, shaken, gladly takes the Devon Goods."),
          L("stern", "These are the parts for my submarine! Thank you. With them, we can explore the seafloor at last."),
        ] },
      ] },
    { id: "c3", title: "Mauville City", env: "city", map: "city", reward: { lmd: 5000, orundum: 300, thunderstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 110: the Rival", reward: { key: "ho_itemfinder" }, get music() { return hoennRivalMay() ? "hoMeetMay" : "hoMeetBrendan"; }, lv: 20, env: "route", get trainer() { return hoennRivalTR("Hey, it's been ages! Let's see how far you've come.", "Wow... I can't believe how strong you've gotten."); },
          rivalWaves: () => [WH(...birchTeam(0), birchMon(1) + ":20!")], pre: [
          L("hrival", "There you are! I've been filling my Pokédex all the way from Littleroot. How's your adventure going? Let's battle!"),
        ], post: [L("hrival", "You've gotten really good! Here: an Itemfinder. It beeps when there's an item hidden nearby. I'm going to keep looking for new Pokémon!")] },
        { id: "b", type: "battle", name: "Route 110", lv: 13, env: "route", wild: 1, catch: "electrike", waves: [WH("electrike:12", "gulpin:12"), WH("wingull:12", "electrike:13")], pre: [
          L("narr", "Route 110 runs north to Mauville under the Cycling Road. Electrike race through the grass, building up static in their fur."),
        ], post: [L("narr", "Gotcha! Electrike was caught! It stores electricity by running fast.")] },
        { id: "b1", type: "side", name: "Route 110: Minun and Plusle", lv: 13, env: "route", wild: 1, catch: "minun", waves: [WH("plusle:13", "gulpin:12"), WH("minun:13!")], pre: [
          L("narr", "Sparks fly in the grass: a Plusle, cheering on a Minun. The two always seem to be together."),
        ], post: [L("narr", "Gotcha! Minun was caught! It cheers on its partners with pom-poms of sparks.")] },
        { id: "c", type: "battle", name: "Mauville City: Wally", reward: { tm: hoTM("rocksmash") }, lv: 17, env: "city", trainer: TR("Wally", "ho_wally", "I want to challenge the Gym Leader! Please battle me, so my uncle sees I can do it!", "...I lost. I'll train more, Ralts and I. Then we'll battle again!"),
          waves: [WH("ralts:17")], music: "hoRustboro", pre: [
          L("narr", "Mauville City is a city under one roof. Wally and his uncle are arguing in front of the Gym."),
          L("wally", "I've gotten stronger with Ralts! I want to take on the Gym Leader! ...If I can beat you, Uncle will let me. Please!"),
        ], post: [L("wally", "You're so strong. I'll go back to Verdanturf and train. Let's register each other in our PokéNavs: someday I'll be strong enough to battle you again!"),
          L("narr", "In a house near the Gym, a man who loves breaking rocks gives you HM06 Rock Smash. It shatters cracked boulders.")] },
        { id: "d", type: "battle", name: "Mauville Gym: Guitarist Kirk", music: "hoEyesPsychic", lv: 17, env: "gym", trainer: TR("Guitarist Kirk", "ho_guitarist", "My Pokémon and I make music with electricity! Feel the beat!", "My guitar strings snapped..."),
          waves: [WH("electrike:17", "voltorb:17")] },
        { id: "e", type: "boss", name: "Wattson, the Cheerfully Electrifying Man", reward: { tm: hoTM("shockwave") }, lv: 24, env: "plant", badgeWin: 2,
          trainer: TR("Leader Wattson", "ho_wattson", "Wahahahah! I'm Wattson. I built this city, and my Electric Pokémon keep it running. Let's see your spark!", "Wahahahah! Fine, I lost! Take the Dynamo Badge!"),
          waves: [WH("voltorb:20+", "electrike:20+"), WH("magneton:22+", "manectric:24!@sitrusberry")], pre: [
          L("wattson", "I've decided to give everything I've got to young Trainers like you. So you'd better give everything you've got back, wahahahah!"),
          L("narr", "Ground moves stop Electric types cold. Magneton is part Steel, too: Fire and Fighting hurt it."),
        ], post: [L("wattson", "The Dynamo Badge raises your Pokémon's Speed. And take this TM: Shock Wave. It never misses!")] },
        { id: "f", type: "side", name: "Route 117", reward: { tm: hoTM("strength") }, lv: 14, env: "route", wild: 1, catch: "illumise", waves: [WH("oddish:13", "poochyena:13"), WH("illumise:14!", "marill:13")], pre: [
          L("narr", "Route 117, the road to Verdanturf Town, is full of flowers. At dusk, Illumise trail a sweet scent through the air, and the Volbeat follow it."),
        ], post: [L("narr", "Gotcha! Illumise was caught! It guides Volbeat to draw shapes of light in the night sky."),
          L("narr", "In Verdanturf Town, Rock Smash breaks the last boulder in Rusturf Tunnel. Wanda and her boyfriend are together again, and he gives you HM04 Strength.")] },
      ] },
    { id: "c4", title: "Mt. Chimney and Lavaridge Town", env: "volcano", map: "volcano", reward: { lmd: 6000, orundum: 400, firestone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 111: the Winstrate Family", music: "hoEyesTwins", lv: 22, env: "route", trainer: TR("The Winstrates", "ho_cooltrainer", "Welcome to the Winstrates' house! Every one of us is a Trainer. Can you beat the whole family?", "You beat us all! Here, Victoria's Macho Brace. It's yours."),
          waves: [WH("taillow:17@oranberry", "zigzagoon:19@oranberry"), WH("roselia:20@oranberry"), WH("goldeen:16", "numel:16"), WH("meditite:22!")], pre: [
          L("narr", "North of Mauville, Route 111 passes a house with a sign out front: the Winstrate family welcomes challengers, one after another."),
        ] },
        { id: "b", type: "battle", name: "Fiery Path", lv: 16, env: "volcano", wild: 1, catch: "torkoal", waves: [WH("numel:15", "koffing:15"), WH("torkoal:16", "grimer:15")], music: "hoWoods", pre: [
          L("narr", "Grunts in red hoods are blocking the cable car to Mt. Chimney: Team Magma. So you go round through the Fiery Path, a tunnel hot with volcanic gas."),
        ], post: [L("narr", "Gotcha! Torkoal was caught! It burns coal in its shell, and puffs out black smoke when it's in danger.")] },
        { id: "c", type: "side", name: "Route 113: Spinda in the Ash", lv: 16, env: "route", wild: 1, catch: "spinda", waves: [WH("spinda:15", "slugma:15"), WH("spinda:16!")], music: "hoRoute113", pre: [
          L("narr", "On Route 113, Mt. Chimney's ash falls like snow. A Spinda staggers through it, dizzy; no two Spinda have the same spots."),
        ], post: [L("narr", "Gotcha! Spinda was caught! Its wobbly steps somehow dodge attacks.")] },
        { id: "d", type: "battle", name: "Route 114", lv: 17, env: "route", wild: 1, catch: "swablu", waves: [WH("swablu:16", "seviper:16"), WH("lombre:16", "lotad:15")], music: "hoFallarbor", pre: [
          L("narr", "Past Fallarbor Town, Route 114 climbs toward Meteor Falls. Swablu wipe things clean with their cotton wings; a Seviper hisses from the long grass."),
        ], post: [L("narr", "Gotcha! Swablu was caught! It perches on people's heads like a fluffy hat.")] },
        { id: "e", type: "story", name: "Meteor Falls", music: "hoOrigin", pre: [
          L("narr", "In Fallarbor Town, Professor Cozmo's assistant is worried: the Professor went to Meteor Falls with some people who wanted to see a Meteorite."),
          L("magma", "Thanks for the tour, Professor! This Meteorite is just what Team Magma needs. Now, to Mt. Chimney!"),
          L("cozmo", "They took my Meteorite! I only wanted to show them what I'd found..."),
          L("archie", "Team Magma, here already? I'm Archie of Team Aqua. Team Magma wants to make the land bigger: they'll plug the sea with lava if we let them. We'll stop them. Don't you get in the way."),
        ] },
        { id: "e1", type: "side", name: "Meteor Falls", lv: 17, env: "cave", wild: 1, catch: "solrock", waves: [WH("zubat:16", "goldeen:16"), WH("solrock:17!")], pre: [
          L("narr", "The falls roar into a cave full of meteorite fragments. A Solrock floats in the spray, glowing like the sun."),
        ], post: [L("narr", "Gotcha! Solrock was caught! It's said to come from space, like the meteorites here.")] },
        { id: "f", type: "battle", name: "Mt. Chimney: Admin Tabitha", music: "hoMeetMagma", lv: 22, env: "volcano", weather: "sun", trainer: TR("Magma Admin Tabitha", "ho_tabitha", "Hehehe! You came all the way up here? Team Magma doesn't take kindly to meddlers!", "Hehehe... You beat me? Our leader will finish you off!"),
          waves: [WH("poochyena:22", "koffing:22"), WH("numel:18", "poochyena:20"), WH("numel:22", "zubat:22")], pre: [
          L("narr", "The cable car is running again. At the top of Mt. Chimney, Team Magma and Team Aqua are fighting everywhere. A machine sits by the crater, with the Meteorite fitted into it."),
          L("archie", "Kid! Team Magma is going to use that Meteorite to make the volcano erupt! Stop their leader, quick!"),
          L("tabitha", "Hehehe! Team Magma's dream is about to come true. You want our leader? You'll have to get past me first!"),
        ] },
        { id: "g", type: "boss", name: "Mt. Chimney: Magma Leader Maxie", reward: { key: "ho_meteorite" }, music: "hoMeetMagma", lv: 27, env: "volcano", weather: "sun", trainer: TR("Magma Leader Maxie", "ho_maxie", "I'm Maxie, the leader of Team Magma. We will make the land bigger, for people and Pokémon alike. You'll understand, in time.", "...I see. I underestimated you. Very well: we give up on this volcano."),
          waves: [WH("mightyena:25", "golbat:25", "camerupt:27!")], pre: [
          L("maxie", "The land is where life thrives. More land means more life... A child wouldn't understand. Then let me teach you!"),
        ], post: [
          L("maxie", "This isn't over. Team Magma will find another way. Let's go."),
          L("archie", "Hah! You sent Maxie packing! ...Don't think this makes us friends, kid. Team Aqua has its own plans."),
          L("narr", "You take the Meteorite out of the machine. Professor Cozmo will want it back."),
        ] },
        { id: "h", type: "side", name: "Jagged Pass", lv: 20, env: "volcano", wild: 1, catch: "spoink", waves: [WH("numel:20", "machop:20"), WH("spoink:20", "spoink:21")], music: "hoWoods", pre: [
          L("narr", "Jagged Pass zigzags down Mt. Chimney's far side to Lavaridge Town. A Team Magma Grunt is pacing halfway down, glancing at the cliff. Spoink bounce along the ledges: if one stops bouncing, its heart stops."),
        ], post: [L("narr", "Gotcha! Spoink was caught! The pearl on its head boosts its psychic power.")] },
        { id: "i", type: "chest", name: "Lavaridge Town: the Old Woman's Egg", reward: { op: "wynaut", lmd: 2000 }, music: "hoOldale", pre: [
          L("narr", "Lavaridge Town is famous for its hot springs. An old woman in the sand baths has an Egg she can't look after, and she gives it to you."),
          L("narr", "The warm sand does its work: the Egg hatches into Wynaut! It's always grinning."),
        ] },
        { id: "j", type: "battle", name: "Lavaridge Gym: Kindler Cole", music: "hoEyesHiker", lv: 23, env: "volcano", weather: "sun", trainer: TR("Kindler Cole", "ho_kindler", "Fire Pokémon and hot springs! Lavaridge has it all! Feel the heat!", "Whoa! I'm all steamed up!"),
          waves: [WH("numel:23")] },
        { id: "k", type: "boss", name: "Flannery, One with a Fiery Passion That Burns", reward: { tm: hoTM("overheat"), key: "ho_gogoggles" }, lv: 29, env: "volcano", weather: "sun", badgeWin: 3,
          trainer: TR("Leader Flannery", "ho_flannery", "I'm Flannery, the Lavaridge Gym Leader! I just became one, but I'll still burn you to a crisp!", "Oh... I guess I was trying too hard. Here: the Heat Badge."),
          waves: [WH("numel:24+", "slugma:24+"), WH("camerupt:26+", "torkoal:29!@whiteherb")], pre: [
          L("flannery", "My grandfather was the Gym Leader before me. I'll show you the hot moves he taught me!"),
          L("narr", "The sun blazes in the Lavaridge Gym: Fire moves are 50% stronger, Water moves weaker."),
        ], post: [
          L("flannery", "With the Heat Badge, traded Pokémon listen to you up to Lv 50. And take Overheat: it's my strongest Fire move."),
          L("hrival", "You beat Flannery? Amazing! Here, take these Go-Goggles: they'll keep the sand out of your eyes in the desert on Route 111. I'm going to challenge your dad!"),
        ] },
      ] },
    { id: "c5", title: "The Desert and Petalburg City", env: "safari", map: "volcano", reward: { lmd: 7000, orundum: 400, leafstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Route 111: the Desert", lv: 21, env: "safari", weather: "sand", wild: 1, catch: "trapinch", waves: [WH("sandshrew:20", "baltoy:20"), WH("trapinch:21", "cacnea:21")], music: "hoRoute111", pre: [
          L("narr", "With the Go-Goggles you can walk through Route 111's sandstorm. Trapinch dig pits in the sand and wait at the bottom with their jaws open."),
        ], post: [L("narr", "Gotcha! Trapinch was caught! Its jaws can crush boulders.")] },
        { id: "b", type: "side", name: "Route 111: Cacnea in the Sand", lv: 21, env: "safari", weather: "sand", wild: 1, catch: "cacnea", waves: [WH("baltoy:21", "sandshrew:21"), WH("cacnea:21!")], pre: [
          L("narr", "A Cacnea stands perfectly still in the sandstorm, waiting for a traveler. It lives where it hardly ever rains."),
        ], post: [L("narr", "Gotcha! Cacnea was caught!")] },
        { id: "c", type: "chest", name: "Mirage Tower: the Root Fossil", reward: { op: "lileep", lmd: 3000 }, music: "hoRustboro", pre: [
          L("narr", "Deep in the desert, a tower of sand shimmers into view: Mirage Tower. At the top lie two fossils. You pick up the Root Fossil, and the tower starts to crumble. You run!"),
          L("devon", "A Root Fossil! Our new machine can bring it back to life. Give me a moment... There! A Pokémon from a hundred million years ago: Lileep!"),
        ] },
        { id: "d", type: "battle", name: "Petalburg Gym: Cooltrainer Berke", music: "hoEyesAce", lv: 26, env: "gym", trainer: TR("Cooltrainer Berke", "ho_cooltrainer", "Welcome to the One-Hit KO Room! Hit hard, hit first: that's the only strategy!", "The Leader's room is past this door. Good luck!"),
          waves: [WH("vigoroth:26")], pre: [
          L("norman", "Four Badges. You've kept your promise, so I'll keep mine. Come through the rooms of my Gym, and we'll battle as two Trainers."),
        ] },
        { id: "e", type: "boss", name: "Norman, a Man in Pursuit of Power", reward: { tm: [hoTM("facade"), hoTM("surf")] }, lv: 31, env: "gym", badgeWin: 4,
          trainer: TR("Leader Norman", "ho_norman", "I'm your father, but I'm a Gym Leader too. I'll battle you with everything I have!", "...I lost? You've grown more than I ever imagined. Take the Balance Badge.", "great"),
          waves: [WH("slaking:28+", "vigoroth:30+", "slaking:31!")], pre: [
          L("norman", "Slaking is so strong it only needs to attack every other turn. Can you make the most of the turns it rests?"),
          L("narr", "Normal types have no weaknesses but Fighting. Ghost types can't be hit by their Normal moves."),
        ], post: [
          L("norman", "The Balance Badge raises your Pokémon's Defense. And take Facade: it hits twice as hard when your Pokémon is poisoned, paralyzed or burned."),
          L("narr", "Next door, Wally's father is waiting with HM03 Surf. Wally's health is so much better, he says, thanks to your friendship."),
        ] },
        { id: "f", type: "side", name: "New Mauville", reward: { tm: hoTM("thunderbolt") }, lv: 25, env: "plant", wild: 1, waves: [WH("magnemite:24", "voltorb:24"), WH("voltorb:25", "voltorb:25", "voltorb:25!")], pre: [
          L("narr", "Wattson asks a favor: the old generator in New Mauville, under Route 110, is about to overload. Three Voltorb are sitting among the items on the floor."),
        ], post: [L("narr", "You switch the generator off. Wattson is so relieved he gives you a TM: Thunderbolt.")] },
      ] },
    { id: "c6", title: "Fortree City", env: "forest", map: "forest", reward: { lmd: 8000, orundum: 500 },
      nodes: [
        { id: "a", type: "battle", name: "Route 118", reward: { key: "ho_goodrod" }, lv: 25, env: "sea", wild: 1, catch: "carvanha", waves: [WH("wingull:24", "electrike:24"), WH("carvanha:25", "linoone:24")], music: "hoRoute119", pre: [
          L("narr", "With Surf, you can cross the water east of Mauville to Route 118. A fisherman gives you a Good Rod. Carvanha swarm in the channel."),
          L("steven", "We meet again! Some Trainers raise one type of Pokémon. Others raise all kinds. Which will you be? I'll be looking forward to seeing."),
        ], post: [L("narr", "Gotcha! Carvanha was caught! Its fangs can tear through a boat's hull.")] },
        { id: "b", type: "battle", name: "Weather Institute: Admin Shelly", lv: 28, env: "lab", music: "hoMeetAqua", gift: "castform", giftLv: 25,
          trainer: TR("Aqua Admin Shelly", "ho_shelly", "Ahahaha! A kid, here? The Institute's weather research is Team Aqua's now. Run along!", "Ahahaha! You're too much! Fine, we're leaving. For now."),
          waves: [WH("mightyena:28", "golbat:28"), WH("carvanha:28", "mightyena:28!")], pre: [
          L("narr", "Team Aqua has taken over the Weather Institute on Route 119. They want its research on making it rain, and the weather Pokémon it's studying."),
          L("shelly", "With this research, our boss can make the rains come whenever he likes. More rain, more sea. Ahahaha!"),
        ], post: [
          L("wsci", "Thank you! They were after our Castform. It changes its form with the weather, you see. We'd like you to have it."),
        ] },
        { id: "c", type: "battle", name: "Route 119: the Rival", reward: { tm: hoTM("fly") }, get music() { return hoennRivalMay() ? "hoMeetMay" : "hoMeetBrendan"; }, lv: 33, env: "forest", get trainer() { return hoennRivalTR("I was worried you'd stopped training! Let's battle!", "I keep losing to you... You're really something."); },
          rivalWaves: () => [WH(...birchTeam(1), birchMon(1) + ":33!")], pre: [
          L("hrival", "Hey! I just got through the Weather Institute. Have you been training? Let me see!"),
        ], post: [L("hrival", "You're amazing. Here, take HM02 Fly: you can fly to any town you've been to. Why don't you fly home and say hi to your mom?")] },
        { id: "d", type: "side", name: "Route 119: the Long Grass", lv: 26, env: "forest", wild: 1, catch: "tropius", waves: [WH("linoone:25", "kecleon:25"), WH("tropius:26!")], pre: [
          L("narr", "Route 119's grass grows taller than you. A Tropius lumbers through it; children in the south love the fruit that grows around its neck."),
        ], post: [L("narr", "Gotcha! Tropius was caught!")] },
        { id: "e", type: "side", name: "Route 119: Feebas", lv: 22, env: "sea", wild: 1, catch: "feebas", waves: [WH("barboach:20", "tentacool:20"), WH("feebas:22!")], pre: [
          L("narr", "A fisherman swears there are only six spots on this whole river where Feebas bite. You find one."),
        ], post: [L("narr", "Gotcha! Feebas was caught! It's shabby to look at, but it's said to grow into the most beautiful Pokémon of all.")] },
        { id: "f", type: "battle", name: "Route 120: Steven and the Devon Scope", reward: { key: "ho_devonscope" }, lv: 30, env: "forest", wild: 1, catch: "kecleon", waves: [WH("kecleon:30!")], music: "hoRoute120", pre: [
          L("narr", "Something invisible is blocking the path to the Fortree Gym. On a bridge on Route 120, Steven is staring at an empty patch of air."),
          L("steven", "There's something here we can't see. This is a Devon Scope: it shows things that are hiding. Let's see what it is!"),
          L("narr", "The Devon Scope shows a Kecleon, colored exactly like the bridge behind it. It lunges!"),
        ], post: [
          L("narr", "Gotcha! Kecleon was caught!"),
          L("steven", "Well done. Take the Devon Scope: there's another Kecleon in Fortree, I hear. I have a feeling we'll meet again."),
        ] },
        { id: "g", type: "side", name: "Route 120: Absol", lv: 27, env: "forest", wild: 1, catch: "absol", waves: [WH("mightyena:25", "linoone:26"), WH("absol:27!")], pre: [
          L("narr", "People say Absol brings disaster. It's the other way round: it appears to warn people that one is coming."),
        ], post: [L("narr", "Gotcha! Absol was caught! It senses earthquakes and storms before they strike.")] },
        { id: "h", type: "battle", name: "Fortree Gym: Bird Keeper Humberto", music: "hoEyesAce", lv: 30, env: "gym", trainer: TR("Bird Keeper Humberto", "ho_birdkeeper", "Winona's Gym spins and spins! You'll get dizzy before you reach her!", "I'm the one who's dizzy..."),
          waves: [WH("skarmory:30")], pre: [
          L("narr", "Fortree City is built in the treetops, its houses linked by rope bridges. With the Devon Scope, the Kecleon blocking the Gym steps aside."),
        ] },
        { id: "i", type: "boss", name: "Winona, the Bird User Taking Flight into the World", reward: { tm: hoTM("aerialace") }, lv: 35, env: "gym", badgeWin: 5,
          trainer: TR("Leader Winona", "ho_winona", "I am Winona. I have become one with the bird Pokémon, and we soar into the skies together. Let our graceful dance begin!", "Never before have I seen a Trainer command Pokémon so gracefully. The Feather Badge is yours.", "great"),
          waves: [WH("swellow:33+", "pelipper:33+"), WH("skarmory:33+", "altaria:35!")], pre: [
          L("winona", "However difficult the situation, my bird Pokémon and I keep flying."),
          L("narr", "Electric, Ice and Rock moves hit Flying types hard. Altaria is part Dragon: Ice moves hit it four times as hard."),
        ], post: [L("winona", "With the Feather Badge, traded Pokémon listen to you up to Lv 70. And take Aerial Ace: it's too fast to miss.")] },
      ] },
    { id: "c7", title: "Mt. Pyre and the Hideouts", env: "tower", map: "tower", reward: { lmd: 9000, orundum: 500, moonstone: 1 },
      nodes: [
        { id: "a", type: "battle", name: "Mt. Pyre", lv: 28, env: "tower", wild: 1, catch: "shuppet", waves: [WH("shuppet:27", "duskull:27"), WH("shuppet:28", "duskull:29")], music: "hoPyre", pre: [
          L("narr", "On Route 121, Team Aqua Grunts run south to Mt. Pyre, a mountain where people lay their Pokémon to rest. Inside, Shuppet and Duskull drift between the graves."),
        ], post: [L("narr", "Gotcha! Shuppet was caught! It's drawn to feelings of envy and grudges.")] },
        { id: "b", type: "battle", name: "Mt. Pyre Summit: Team Aqua", reward: { key: "ho_magmaemblem" }, music: "hoMeetAqua", lv: 35, env: "tower", trainer: TR("Team Aqua Grunts", "ho_aqua", "Our boss is taking care of business. Nobody gets past!", "Argh! Boss, I tried!"),
          waves: [WH("carvanha:33", "mightyena:35"), WH("mightyena:34", "golbat:34")], pre: [
          L("narr", "Mist hangs over Mt. Pyre's summit. An old couple guards two orbs on a shrine there, and Team Aqua is standing between you and them."),
        ], post: [
          L("archie", "Team Magma beat us to it and took the Blue Orb. Fine: the Red Orb is ours! Who's this... the kid from Slateport again? You're too late."),
          L("oldcouple", "They took both Orbs! The Red and Blue Orbs must never be parted... Team Magma dropped this as they ran. Their emblem: perhaps it opens their hiding place."),
          L("oldcouple", "Long ago, a Pokémon of the land and a Pokémon of the sea fought so fiercely the world nearly ended. The Orbs calmed them, and they went to sleep."),
        ] },
        { id: "c", type: "side", name: "Mt. Pyre Summit: Chimecho", lv: 28, env: "tower", wild: 1, catch: "chimecho", waves: [WH("shuppet:28", "vulpix:28"), WH("chimecho:28!")], music: "hoPyreTop", pre: [
          L("narr", "A sound like wind chimes comes through the mist. A Chimecho is calling, its cry echoing seven times over."),
        ], post: [L("narr", "Gotcha! Chimecho was caught!")] },
        { id: "d", type: "battle", name: "Magma Hideout: Admin Tabitha", music: "hoMeetMagma", lv: 33, env: "volcano", trainer: TR("Magma Admin Tabitha", "ho_tabitha", "Hehehe! How did you find our hideout? Doesn't matter: you're too late!", "Hehehe... Our leader is already awakening it. Go see for yourself!"),
          waves: [WH("mightyena:29"), WH("numel:26", "mightyena:28"), WH("zubat:30", "camerupt:33!")], pre: [
          L("narr", "Halfway down Jagged Pass, the Magma Emblem glows, and a door opens in the cliff: Team Magma's hideout, dug deep into the volcano."),
        ] },
        { id: "e", type: "boss", name: "Magma Hideout: Magma Leader Maxie", music: "hoMeetMagma", lv: 39, env: "volcano", weather: "sun", trainer: TR("Magma Leader Maxie", "ho_maxie", "You again! But it's done: the super-ancient Pokémon is awake. Groudon, the creator of the land!", "...It's gone. It didn't even look at me. What have I done?", "great"),
          waves: [WH("mightyena:37", "crobat:38", "camerupt:39!")], pre: [
          L("narr", "In the deepest chamber, a huge red Pokémon sleeps in a pool of lava. Maxie holds up the Blue Orb. It glows... and Groudon opens its eyes."),
          L("maxie", "Groudon! Wake, and give us the land! ...Child, you won't stop this now."),
        ], post: [
          L("narr", "Groudon tears through the rock and escapes. Maxie stares at the empty pool."),
          L("maxie", "The Blue Orb should have let me control it... I'll find it again. This isn't over."),
        ] },
        { id: "f", type: "story", name: "Slateport Harbor: the Submarine", music: "hoSlateport", pre: [
          L("stern", "The submarine is ready! We found an undersea cavern on Route 128, and..."),
          L("archie", "Attention, Captain Stern! Team Aqua is borrowing your submarine. We'll take good care of it!"),
          L("archie", "And you, kid: if you want to stop us, come to our hideout in Lilycove City. Wahahaha!"),
          L("narr", "Archie and a Grunt climb aboard, and the submarine slips under the water."),
        ] },
        { id: "g", type: "battle", name: "Lilycove City: the Rival", get music() { return hoennRivalMay() ? "hoMeetMay" : "hoMeetBrendan"; }, lv: 39, env: "city", get trainer() { return hoennRivalTR("Let's see whose Pokémon are being raised better!", "You won again... You really are tough."); },
          rivalWaves: () => [WH(...birchTeam(2), birchMon(2) + ":39!")], pre: [
          L("narr", "Lilycove City sits where the land meets the sea, with Hoenn's biggest Department Store. Your rival is waiting outside it."),
        ], post: [L("hrival", "My dad wants a complete Pokédex, but I keep finding new Pokémon instead. Are you going to take the League challenge? ...I thought so. I'm going home to Littleroot for a while. See you!")] },
        { id: "h", type: "battle", name: "Team Aqua Hideout", music: "hoMeetAqua", lv: 37, env: "plant", trainer: TR("Team Aqua Grunts", "ho_aqua", "An intruder in the hideout! Get it!", "This hideout's supposed to be secret!"),
          waves: [WH("mightyena:34", "golbat:36"), WH("carvanha:37")], pre: [
          L("narr", "In a cove at the edge of Lilycove, a cave opens onto the sea: Team Aqua's hideout. Grunts run everywhere, and warp panels lead round in circles."),
        ] },
        { id: "i", type: "chest", name: "The Leader's Office", reward: { gold5: 1, lmd: 3000 }, music: "hoHideout", pre: [
          L("narr", "Archie's office has three Poké Balls lying on the floor. You reach for one... and it opens its eyes: an Electrode! A second one is an Electrode too."),
          L("narr", "The third is real: a Master Ball, which catches any Pokémon without fail. Team Aqua won't be needing it."),
        ] },
        { id: "j", type: "battle", name: "Team Aqua Hideout: Admin Matt", music: "hoMeetAqua", lv: 32, env: "plant", trainer: TR("Aqua Admin Matt", "ho_matt", "Hehehe! You made it to the dock! Too bad, the boss is already gone!", "Hehe... Doesn't matter! The boss is long gone!", "great"),
          waves: [WH("carvanha:32", "mightyena:32", "sharpedo:32!")], pre: [
          L("matt", "The boss took the submarine to the seafloor! I'll hold you here until he's done, hehehe!"),
        ], post: [L("narr", "The submarine's dock is empty. Team Aqua is gone, but the Grunt guarding the sea path out of Lilycove has left too: the way east is open.")] },
      ] },
    { id: "c8", title: "Mossdeep City and the Seafloor Cavern", env: "sea", map: "sea", reward: { lmd: 10000, orundum: 600, waterstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "Mossdeep City", music: "hoRustboro", pre: [
          L("narr", "Mossdeep City is an island town with a Space Center and a Gym. Steven is at the Space Center, holding a letter."),
          L("steven", "Team Magma sent this. They say they'll steal the rocket fuel here. I'll keep watch. You go on to the Gym."),
        ] },
        { id: "b", type: "battle", name: "Mossdeep Gym: Psychic Samantha", music: "hoEyesPsychic", lv: 36, env: "gym", trainer: TR("Psychic Samantha", "ho_psychicf", "I can see your next move already. And my Xatu sees even further.", "...I didn't foresee that."),
          waves: [WH("xatu:36")] },
        { id: "c", type: "boss", name: "Tate & Liza, the Mystic Combination", reward: { tm: hoTM("calmmind") }, lv: 42, env: "gym", badgeWin: 6,
          trainer: TR("Leaders Tate & Liza", "ho_tateliza", "Hehehe... Were you surprised? That there are two Gym Leaders? We're twins! We don't need to talk to understand each other!", "Our minds were one... and we still lost. The Mind Badge is yours.", "great"),
          waves: [WH("claydol:41+", "xatu:41+"), WH("lunatone:42+@sitrusberry", "solrock:42!@sitrusberry")], pre: [
          L("tateliza", "Two minds... as one. Can you... beat both of us... at the same time?"),
          L("narr", "Bug, Ghost and Dark moves hit Psychic types hard. Claydol, Lunatone and Solrock are part Ground or Rock, too: Water and Grass moves hurt them."),
        ], post: [L("tateliza", "With the Mind Badge, your Pokémon's Sp. Atk and Sp. Def go up, and you can use Dive outside battle. And take Calm Mind.")] },
        { id: "d", type: "battle", name: "Space Center: Team Magma", music: "hoMeetMagma", lv: 32, env: "plant", trainer: TR("Team Magma Grunts", "ho_magma", "The fuel's for our leader! Out of the way!", "Ugh... Maxie's upstairs. He'll deal with you!"),
          waves: [WH("zubat:32", "mightyena:32", "baltoy:32")], pre: [
          L("narr", "An alarm sounds across Mossdeep: Team Magma has stormed the Space Center. Three Grunts stand back to back on the stairs."),
        ] },
        { id: "e", type: "boss", name: "Space Center: Maxie and Tabitha", reward: { tm: hoTM("dive") }, music: "hoMeetMagma", lv: 44, env: "plant", trainer: TR("Magma Leader Maxie & Admin Tabitha", "ho_maxie", "Groudon is gone, so we'll make the land ourselves: dump the rocket fuel into Mt. Chimney and let it erupt!", "...Stopped again. Perhaps... perhaps our goal was wrong from the start.", "great"),
          waves: [WH("camerupt:36", "mightyena:38", "golbat:40"), WH("mightyena:42", "crobat:43", "camerupt:44!")], pre: [
          L("steven", "Maxie, Tabitha! Two against one isn't fair. Let's do this together: my Metang, Skarmory and Aggron are with you!"),
          L("maxie", "Steven Stone. And the child. Fine: Tabitha, take them both!"),
        ], post: [
          L("maxie", "Team Magma... will go. I need to think."),
          L("steven", "You were wonderful. Come by my house: I have something that will help you. It's HM08 Dive: with it, you can go under the deep sea."),
        ] },
        { id: "f", type: "battle", name: "Route 124: Under the Sea", lv: 32, env: "sea", wild: 1, catch: "clamperl", waves: [WH("chinchou:26", "clamperl:30"), WH("clamperl:32")], music: "hoDive", pre: [
          L("narr", "Under Route 124 the sea is deep and blue. Clamperl clamp shut on the seafloor; it makes one pearl in its life."),
        ], post: [L("narr", "Gotcha! Clamperl was caught!")] },
        { id: "f1", type: "side", name: "Route 126: Relicanth", lv: 33, env: "sea", wild: 1, catch: "relicanth", waves: [WH("clamperl:32", "chinchou:26"), WH("relicanth:33!")], music: "hoDive", pre: [
          L("narr", "Deep in Route 126, a Pokémon that hasn't changed in a hundred million years swims by: Relicanth. People thought it was extinct."),
        ], post: [L("narr", "Gotcha! Relicanth was caught!")] },
        { id: "g", type: "side", name: "Shoal Cave", lv: 28, env: "ice", wild: 1, catch: "spheal", waves: [WH("golbat:28", "spheal:28"), WH("snorunt:28", "spheal:29")], music: "hoPyre", pre: [
          L("narr", "Shoal Cave, north of Mossdeep, floods and drains with the tides. Spheal roll across the ice floors of its deepest room."),
        ], post: [L("narr", "Gotcha! Spheal was caught! It rolls everywhere, because rolling is faster than walking.")] },
        { id: "h", type: "battle", name: "Seafloor Cavern: Admin Shelly", music: "hoMeetAqua", lv: 39, env: "cave", trainer: TR("Aqua Admin Shelly", "ho_shelly", "Ahahaha! You followed us all the way down here? You've got guts, I'll give you that!", "Ahahaha! You're too much! But you're still too late!", "great"),
          waves: [WH("carvanha:39", "mightyena:39"), WH("sharpedo:38", "mightyena:38!")], pre: [
          L("narr", "On Route 128, Stern's stolen submarine is moored at a crack in the seafloor. You dive down after it: the Seafloor Cavern."),
          L("shelly", "Our boss is waking up the Pokémon of the sea, the one that made the oceans long ago! Nobody's stopping him now!"),
        ] },
        { id: "i", type: "boss", name: "Seafloor Cavern: Aqua Leader Archie", music: "hoMeetAqua", lv: 43, env: "cave", trainer: TR("Aqua Leader Archie", "ho_archie", "It's you again! Team Aqua is going to take the sea back for all living things! Stand aside!", "...I lost? ...But it doesn't matter. Look!", "great"),
          waves: [WH("mightyena:41+", "muk:41+"), WH("crobat:41+", "sharpedo:43!")], pre: [
          L("narr", "In the deepest chamber, a huge Pokémon is asleep in the water, glowing faintly blue: Kyogre."),
          L("archie", "This is it. The Pokémon that created the seas. With the Red Orb, it'll do what I say. And the land will sink back into the sea where it came from!"),
        ], post: [
          L("narr", "Archie holds up the Red Orb... and it glows by itself. Kyogre's eyes snap open. With a roar, it breaks out through the cavern and is gone."),
          L("archie", "It... it isn't listening to me? The Red Orb was supposed to control it!"),
          L("maxie", "Archie, you fool! Groudon is loose too. Come up and see what the two of them are doing!"),
          L("narr", "Outside, the sky over Hoenn's eastern seas flickers: one moment a downpour, the next a blinding sun. On Route 128, Steven lands beside you. \"It's coming from Sootopolis,\" he says."),
        ] },
      ] },
    { id: "c9", title: "Sootopolis City and Sky Pillar", env: "sea", map: "sea", reward: { lmd: 12000, orundum: 600 },
      nodes: [
        { id: "a", type: "story", name: "The Clash in Sootopolis", music: "hoAbnormal", pre: [
          L("narr", "Sootopolis City sits inside the crater of an old volcano. In the water at its heart, Groudon and Kyogre are fighting: scorching sun and torrential rain, again and again."),
          L("steven", "Their power is too great for anyone to stop. ...Come. There's someone you should meet, in the Cave of Origin."),
          L("wallace", "I'm Wallace. I was this city's Gym Leader, and I guard the Cave of Origin. There is a third super-ancient Pokémon: Rayquaza, the lord of the sky. It may be able to calm them."),
          L("wallace", "It sleeps at the top of the Sky Pillar, on Route 131. I'll open the way. Will you climb it?"),
        ] },
        { id: "b", type: "battle", name: "Sky Pillar", lv: 38, env: "tower", wild: 1, catch: "altaria", waves: [WH("claydol:36", "sableye:36"), WH("golbat:37", "altaria:38")], music: "hoChimney", pre: [
          L("narr", "Wallace opens the door of the Sky Pillar, a tower of ancient stone reaching up into the clouds. Its floors are cracked and crumbling."),
        ], post: [L("narr", "Gotcha! Altaria was caught! It sings in a beautiful soprano, high above the clouds.")] },
        { id: "c", type: "story", name: "Rayquaza Descends", reward: { tm: hoTM("waterfall") }, music: "hoRayquaza", pre: [
          L("narr", "At the top of the Sky Pillar, a long green Pokémon is coiled, asleep. As you step closer, Rayquaza opens its eyes... and flies off toward Sootopolis."),
          L("narr", "Back in the crater, Rayquaza roars. Groudon and Kyogre stop. The sun and the rain fade, and the two super-ancient Pokémon slip away, one into the land, one into the sea."),
          L("maxie", "...We wanted to make the world better. We nearly ended it. Archie, let's go to Mt. Pyre and return the Orbs."),
          L("wallace", "Thank you. Take HM07 Waterfall. Rayquaza has gone back to the Sky Pillar. And Juan, my teacher, is waiting at the Sootopolis Gym."),
        ] },
        { id: "d", type: "side", name: "Sky Pillar: Rayquaza", lv: 70, env: "plateau", wild: 1, catch: "rayquaza", waves: [WH("rayquaza:70!")], music: "hoChimney", pre: [
          L("narr", "Rayquaza is back at the top of the Sky Pillar, under an open sky. It has lived in the ozone layer for hundreds of millions of years. It turns to face you."),
        ], post: [L("narr", "Gotcha! Rayquaza was caught! The Pokémon of the sky has chosen you.")] },
        { id: "e", type: "battle", name: "Sootopolis Gym: Beauty Bridget", music: "hoEyesLass", lv: 40, env: "gym", trainer: TR("Beauty Bridget", "ho_beauty", "The ice floor is the hardest part of this Gym. Did you step on every tile once?", "...You did. Lovely."),
          waves: [WH("azumarill:40")] },
        { id: "f", type: "boss", name: "Juan, the Gym Leader with the Beauty of Pure Water", reward: { tm: hoTM("waterpulse") }, lv: 46, env: "sea", weather: "rain", badgeWin: 7,
          trainer: TR("Leader Juan", "ho_juan", "Ahahaha, excellent! I am Juan. It was I who taught Wallace the art of battle. Let me show you water's beauty, and its power.", "Ahahaha! You are the winner! I see the talent Wallace saw. Here: the Rain Badge.", "great"),
          waves: [WH("luvdisc:41+", "whiscash:41+", "sealeo:43+"), WH("crawdaunt:43+", "kingdra:46!@chestoberry")], pre: [
          L("juan", "Wallace became the Champion, so his old teacher keeps his Gym. Don't think that makes me any easier!"),
          L("narr", "It's raining in the Sootopolis Gym: Water moves are 50% stronger. Electric and Grass moves hit Water types hard; Kingdra is part Dragon, and only Dragon moves hit it hard."),
        ], post: [L("juan", "With the Rain Badge, every Pokémon listens to you, and you can climb Waterfalls. And take Water Pulse. Ever Grande City lies east of here: Wallace awaits.")] },
        { id: "g", type: "side", name: "Meteor Falls: the Back Room", lv: 25, env: "cave", wild: 1, catch: "bagon", waves: [WH("golbat:33", "solrock:33"), WH("bagon:25!")], music: "hoOrigin", pre: [
          L("narr", "With Waterfall, you can climb into the back of Meteor Falls. A Bagon is butting its head against a rock: it dreams of flying, and keeps jumping off cliffs to try."),
        ], post: [L("narr", "Gotcha! Bagon was caught! Its dream comes true when it becomes a Salamence.")] },
        { id: "h", type: "battle", name: "Victory Road: Wally", lv: 48, env: "cave", trainer: TR("Wally", "ho_wally", "I've been waiting for you! I'm not sick anymore, and I've gotten strong. Let's battle!", "...I lost again. But I'm not sad. Thank you, for everything.", "great"),
          waves: [WH("altaria:46", "delcatty:46", "roselia:46"), WH("magneton:46", "kirlia:48!")], music: "hoVictory", pre: [
          L("narr", "Ever Grande City's Victory Road tunnels through the mountain to the Pokémon League. Only Trainers with eight Badges may pass. Just past the first bridges, someone is waiting."),
          L("wally", "Do you remember? You helped me catch Ralts. Since then, I've trained with all my strength. Now I'm going to the League too!"),
        ], post: [L("wally", "I'll keep training. You go on ahead: you're going to be the Champion, I just know it.")] },
        { id: "i", type: "battle", name: "Victory Road", lv: 42, env: "cave", wild: 1, catch: "lairon", waves: [WH("hariyama:40", "loudred:39"), WH("lairon:40", "golbat:40")], music: "hoVictory", pre: [
          L("narr", "Victory Road climbs on through the mountain. Lairon charge along the tunnels, and Golbat swarm in the dark."),
        ], post: [L("narr", "Gotcha! Lairon was caught! It charges into anything in its way, iron-hard body first.")] },
      ] },
    { id: "c10", title: "The Pokémon League", env: "plateau", map: "plateau", reward: { lmd: 20000, orundum: 1500, permit: 10 },
      nodes: [
        { id: "a", type: "story", name: "Ever Grande City", music: "hoEverGrande", pre: [
          L("narr", "Ever Grande City is all flowers and waterfalls, with the Pokémon League at its top. Two Cooltrainers at the door check your eight Badges."),
          L("narr", "Inside, four rooms lead one after another to the Champion's. There's no going back once you step in."),
        ] },
        { id: "b", type: "boss", name: "Elite Four Sidney", music: "hoMeetE4", lv: 52, env: "plateau",
          trainer: TR("Elite Four Sidney", "ho_sidney", "I like that look you've got. I'm Sidney of the Elite Four. Let's have a battle that we can only stage here in the Pokémon League!", "Well, how do you like that? I lost! Go on: the next one's waiting.", "ultra"),
          waves: [WH("mightyena:50", "shiftry:50", "cacturne:50"), WH("sharpedo:50", "absol:52!")], pre: [
          L("sidney", "I'll warn you: Dark-type Pokémon don't fight fair. That's what makes it fun. Let's have some fun!"),
        ] },
        { id: "c", type: "boss", name: "Elite Four Phoebe", music: "hoMeetE4", lv: 53, env: "plateau",
          trainer: TR("Elite Four Phoebe", "ho_phoebe", "I trained on Mt. Pyre, and I can sense the spirits of Pokémon. I'm Phoebe of the Elite Four. Can you hear them too?", "...You're so strong. I'll go back to Mt. Pyre and train more. Go on!", "ultra"),
          waves: [WH("dusclops:51", "banette:51", "sableye:51"), WH("banette:51", "dusclops:53!")], pre: [
          L("phoebe", "There's a bond between Ghost Pokémon and me. Let's see if you can break it!"),
        ] },
        { id: "d", type: "boss", name: "Elite Four Glacia", music: "hoMeetE4", lv: 53, env: "ice",
          trainer: TR("Elite Four Glacia", "ho_glacia", "Welcome. I'm Glacia of the Elite Four. I came all this way looking for a Trainer whose fire could melt my ice.", "...You and your Pokémon. How hot your spirits burn! My ice moves can't touch you.", "ultra"),
          waves: [WH("sealeo:50", "glalie:50", "sealeo:52"), WH("glalie:52", "walrein:53!@sitrusberry")], pre: [
          L("glacia", "I have yet to find one. Will you be the one to disappoint me?"),
          L("narr", "Fire, Fighting, Rock and Steel moves hit Ice types hard. Walrein and Sealeo are part Water: Electric and Grass hit them too."),
        ] },
        { id: "e", type: "boss", name: "Elite Four Drake", music: "hoMeetE4", lv: 55, env: "plateau",
          trainer: TR("Elite Four Drake", "ho_drake", "I am the last of the Elite Four, Drake. What do you think a Trainer needs to battle with Dragon Pokémon?", "Superb. You have what it takes: a pure heart, and the strength to match it. Go!", "ultra"),
          waves: [WH("shelgon:52", "altaria:54", "flygon:53"), WH("flygon:53", "salamence:55!@sitrusberry")], pre: [
          L("drake", "If you don't know the answer, you'll never beat my dragons!"),
        ] },
        { id: "f", type: "boss", name: "Champion Wallace", music: "hoMeetChampion", lv: 58, env: "plateau", champion: 1,
          trainer: TR("Champion Wallace", "ho_wallace", "Welcome. I'm Wallace, the Hoenn League Champion. You climbed the Sky Pillar for Hoenn. Now show me the beauty of your Pokémon.", "I, the Champion, fall in defeat... That was wonderful work. You are the new Hoenn League Champion!", "ultra"),
          waves: [WH("wailord:57", "tentacruel:55", "ludicolo:56"), WH("whiscash:56", "gyarados:56", "milotic:58!@sitrusberry")], pre: [
          L("wallace", "A Trainer and Pokémon battling as one are as beautiful as any art. Let's create that together, one last time today!"),
          L("narr", "Wallace's team is all Water: Electric and Grass moves are your friends here. Ludicolo and Whiscash are the exceptions: watch their second types."),
        ], post: [
          L("hrival", "Wait! I came to give you some advice before you face... You already won? You're the Champion?!"),
          L("birch", "Congratulations! And look at your Pokédex. You've done my research proud!"),
          L("wallace", "Come. Let's record you and your partners in the Hall of Fame."),
          L("narr", "Your Hoenn Pokémon are entered into the Hall of Fame. Their level cap keeps rising with the rest of your Journey, and lifts to Lv 100 once it's done."),
        ] },
      ] },
    { id: "c11", title: "The Super-Ancient Pokémon", env: "sea", map: "sea", reward: { orundum: 2000, permit: 10, rec4: 5 },
      nodes: [
        { id: "a", type: "story", name: "A Bulletin on TV", reward: { key: "ho_ssticket" }, music: "hoLittleroot", pre: [
          L("hmom", "Welcome home, Champion! Oh, look at the TV: they're talking about a strange Pokémon flying over Hoenn. Was it red or blue? Red, they said."),
          L("norman", "A letter came for you from Mr. Briney: a ticket for the S.S. Tidal. And the Weather Institute keeps reporting strange weather out at sea. The world is wide, my child."),
        ] },
        { id: "b", type: "side", name: "Latias", lv: 40, env: "route", wild: 1, catch: "latias", waves: [WH("latias:40!")], pre: [
          L("narr", "A red shape streaks over the grass and stops in front of you. Latias, the Pokémon from the news, has been roaming all of Hoenn."),
        ], post: [L("narr", "Gotcha! Latias was caught! It understands what people say, and covers itself in glittering down to hide.")] },
        { id: "c", type: "side", name: "Southern Island: Latios", lv: 50, env: "forest", wild: 1, catch: "latios", waves: [WH("latios:50!@souldew")], music: "hoShip", pre: [
          L("narr", "An Eon Ticket takes you to Southern Island, a tiny island far to the south. Deep in its forest, beside a strange stone sphere, Latios is waiting."),
        ], post: [L("narr", "Gotcha! Latios was caught! It only opens its heart to Trainers with a compassionate spirit.")] },
        { id: "d", type: "story", name: "The Sealed Chamber", music: "hoSealed", pre: [
          L("narr", "In Pacifidlog Town, an old man talks of three Pokémon sealed away long ago: one of rock, one of ice, one of steel."),
          L("narr", "Under the sea on Route 134 you find a chamber covered in Braille. You dig through its wall, and the inscription reads: FIRST COMES WAILORD. LAST COMES RELICANTH."),
          L("narr", "With Wailord first in line and Relicanth last, the ground shakes. Far away, three doors have opened."),
        ] },
        { id: "e", type: "side", name: "Desert Ruins: Regirock", lv: 40, env: "cave", wild: 1, catch: "regirock", waves: [WH("regirock:40!")], music: "hoSealed", pre: [
          L("narr", "LEFT, LEFT, DOWN, DOWN. THEN, USE ROCK SMASH. In the Desert Ruins of Route 111, the wall crumbles. Regirock's body is made of rocks from all over the world."),
        ], post: [L("narr", "Gotcha! Regirock was caught!")] },
        { id: "f", type: "side", name: "Island Cave: Regice", lv: 40, env: "ice", wild: 1, catch: "regice", waves: [WH("regice:40!")], music: "hoSealed", pre: [
          L("narr", "STAY CLOSE TO THE WALL. RUN AROUND ONE LAP. In the Island Cave on Route 105, you walk the room's walls all the way round... and it opens on Regice, made of Ice Age ice."),
        ], post: [L("narr", "Gotcha! Regice was caught!")] },
        { id: "g", type: "side", name: "Ancient Tomb: Registeel", lv: 40, env: "cave", wild: 1, catch: "registeel", waves: [WH("registeel:40!")], music: "hoSealed", pre: [
          L("narr", "THOSE WHO INHERIT OUR WILL, SHINE IN THE MIDDLE. In the Ancient Tomb on Route 120, you use Flash at the center of the room. Registeel's body is harder than any metal."),
        ], post: [L("narr", "Gotcha! Registeel was caught!")] },
        { id: "h", type: "chest", name: "Steven's House: a Beldum", reward: { op: "beldum", lmd: 5000 }, music: "hoRustboro", pre: [
          L("narr", "Steven's house in Mossdeep is empty. On the table is a Poké Ball and a note."),
          L("steven", "\"I'm going on a journey to train myself again. Please look after this Pokémon for me. Steven.\""),
        ] },
        { id: "i", type: "side", name: "Birth Island: Deoxys", lv: 30, env: "plateau", wild: 1, catch: "deoxysspeed", waves: [WH("deoxysspeed:30!")], music: "hoDeoxysAppears", pre: [
          L("narr", "An AuroraTicket takes the S.S. Tidal to Birth Island, far out at sea. A strange triangle on the ground moves each time you step toward it, until it explodes into light: Deoxys, a Pokémon from space."),
        ], post: [L("narr", "Gotcha! Deoxys was caught! Its DNA was changed by a laser, they say, and it can change its form.")] },
        { id: "j", type: "boss", name: "Terra Cave: Groudon", lv: 70, env: "volcano", weather: "sun", wild: 1, catch: "groudon", waves: [WH("groudon:70!")], music: "hoWoods", pre: [
          L("narr", "The Weather Institute calls: a terrible drought has fallen on one of Hoenn's routes. There, a cave has opened in the ground: the Terra Cave."),
          L("narr", "In its depths, the air burns. Groudon, the Pokémon that raised the continents, has been resting here since Sootopolis."),
        ], post: [L("narr", "Gotcha! Groudon was caught!")] },
        { id: "k", type: "boss", name: "Marine Cave: Kyogre", lv: 70, env: "sea", weather: "rain", wild: 1, catch: "kyogre", waves: [WH("kyogre:70!")], music: "hoWoods", pre: [
          L("narr", "Now the Weather Institute reports heavy rain over the sea. Under it, a trench leads down to the Marine Cave."),
          L("narr", "The water inside is still. Kyogre, the Pokémon that filled the seas, rises to meet you."),
        ], post: [L("narr", "Gotcha! Kyogre was caught! The land and the sea are at peace.")] },
        { id: "l", type: "boss", name: "Meteor Falls: Steven", lv: 78, env: "cave", music: "hoOrigin",
          trainer: TR("Steven", "ho_steven", "I knew you'd find me. I've been training here, where the meteorites fall. Now that you're the Champion, show me what that means.", "...Congratulations. You and your Pokémon have become stronger than I ever imagined. I'll keep training too.", "master"),
          waves: [WH("skarmory:77", "claydol:75", "aggron:76"), WH("cradily:76", "armaldo:76", "metagross:78!@sitrusberry")], pre: [
          L("narr", "With Waterfall, a new chamber has opened in the back of Meteor Falls. Someone is standing among the fallen stones, looking up at the light from above."),
          L("steven", "Hello, Champion. I've been wandering again, and I found my way back here. Shall we have the battle we never had?"),
        ], post: [
          L("steven", "The bonds between you and your Pokémon... that's the strongest thing I've ever seen. Hoenn is in good hands."),
          L("narr", "You've done it: the Hoenn Journey is complete."),
        ] },
      ] },
  ],
};
STORY.push(HOENN_JOURNEY);
indexJourney(HOENN_JOURNEY);

// =====================================================================
//  THE BATTLE TOWER'S HOENN WING — every battle of Hoenn's games that isn't in the Journey (the owner's rule: extra content goes to
//  the Battle Tower): the weaker versions' teams for the Journey's battles (a team that only changes levels is left out), Emerald's
//  Gym Leader rematches and its Rustboro rival battle, the Battle Frontier's Brains, and Omega Ruby/Alpha Sapphire's own battles and
//  the Delta Episode. The region lock and the Lv 36 rule apply through WH: Omega Ruby/Alpha Sapphire's later Pokémon battle as
//  Hoenn's own (Dusknoir as a Dusclops, Froslass as a Snorunt, which grows into a Glalie), and ones with no Hoenn form are left out
//  (Zinnia's Tyrantrum, Goodra and Noivern; Sidney's Scrafty, Zoroark and Mandibuzz...). Mega Stones don't exist here.
// =====================================================================
// (the Frontier Brains' music: their battle theme, the Gym Leader victory, the Symbol fanfare, their facility's lobby)
const hoBrain = lobby => ({ bgm: "hoFrontierBrain", winBgm: "hoGymWin", winJingle: "hoSymbol", lobby });
if (typeof TOWER_WING === "object") TOWER_WING.hoenn = [
  // Ruby/Sapphire
  { n: "Leader Roxanne", t: "ho_roxanne", from: "Ruby/Sapphire", waves: [WH("geodude:14", "nosepass:15!")] },
  { n: "Leader Brawly", t: "ho_brawly", from: "Ruby/Sapphire", waves: [WH("machop:17", "makuhita:18!")] },
  { n: "Leader Wattson", t: "ho_wattson", from: "Ruby/Sapphire", waves: [WH("magnemite:22", "voltorb:20", "magneton:23!")] },
  { n: "Leader Flannery", t: "ho_flannery", from: "Ruby/Sapphire", waves: [WH("slugma:26", "slugma:26", "torkoal:28!")] },
  { n: "Leaders Tate & Liza", t: "ho_tateliza", from: "Ruby/Sapphire", waves: [WH("lunatone:42", "solrock:42!")] },
  { n: "Leader Wallace", t: "ho_wallacers", from: "Ruby/Sapphire", waves: [WH("luvdisc:40", "whiscash:42", "sealeo:40"), WH("seaking:42", "milotic:43!")] },
  { n: "Champion Steven", t: "ho_steven", from: "Ruby/Sapphire", waves: [WH("skarmory:57", "claydol:55", "aggron:56"), WH("cradily:56", "armaldo:56", "metagross:58!@sitrusberry")] },
  { n: "May", t: "ho_mayrs", from: "Ruby/Sapphire, Lilycove City", waves: [WH("swellow:31", "wailmer:32"), WH("shroomish:32", "combusken:34!")] },
  { n: "Brendan", t: "ho_brendanrs", from: "Ruby/Sapphire, Lilycove City", waves: [WH("swellow:31", "shroomish:32"), WH("numel:32", "marshtomp:34!")] },
  { n: "May", t: "ho_mayrs", from: "Ruby/Sapphire, Lilycove City", waves: [WH("swellow:31", "numel:32"), WH("wailmer:32", "grovyle:34!")] },
  { n: "Magma Admin Tabitha", t: "ho_tabitha", from: "Ruby, Mt. Chimney", waves: [WH("numel:20", "poochyena:20", "numel:20!")] },
  { n: "Magma Admin Courtney", t: "ho_courtney", from: "Ruby, Weather Institute", waves: [WH("numel:28", "mightyena:28!")] },
  { n: "Magma Admin Tabitha", t: "ho_tabitha", from: "Ruby, Magma Hideout", waves: [WH("numel:32", "mightyena:32", "camerupt:32!")] },
  { n: "Magma Admin Courtney", t: "ho_courtney", from: "Ruby, Seafloor Cavern", waves: [WH("camerupt:38", "mightyena:38!")] },
  { n: "Magma Leader Maxie", t: "ho_maxie", from: "Ruby, Seafloor Cavern", waves: [WH("mightyena:41", "crobat:41", "camerupt:43!")] },
  { n: "Aqua Admin Matt", t: "ho_matt", from: "Sapphire, Mt. Chimney", waves: [WH("carvanha:20", "poochyena:20", "carvanha:20!")] },
  { n: "Aqua Leader Archie", t: "ho_archie", from: "Sapphire, Mt. Chimney", waves: [WH("mightyena:24", "golbat:24", "sharpedo:25!")] },
  { n: "Cooltrainer Vito", t: "ho_cooltrainer", from: "Ruby/Sapphire, Victory Road", waves: [WH("swellow:42", "kadabra:42"), WH("manectric:42", "shiftry:42!")] },
  // Emerald: its teams for the Journey's battles where a stronger version's are there
  { n: "Leader Norman", t: "ho_norman", from: "Emerald", waves: [WH("spinda:27", "vigoroth:27"), WH("linoone:29", "slaking:31!@sitrusberry")] },
  { n: "Leader Winona", t: "ho_winona", from: "Emerald", waves: [WH("swablu:29", "tropius:29", "pelipper:30"), WH("skarmory:31", "altaria:33!@oranberry")] },
  { n: "Elite Four Sidney", t: "ho_sidney", from: "Emerald", waves: [WH("mightyena:46", "shiftry:48", "cacturne:46"), WH("crawdaunt:48", "absol:49!@sitrusberry")] },
  { n: "Elite Four Drake", t: "ho_drake", from: "Emerald", waves: [WH("shelgon:52", "altaria:54", "kingdra:53"), WH("flygon:53", "salamence:55!@sitrusberry")] },
  { n: "Aqua Admin Matt", t: "ho_matt", from: "Emerald, Aqua Hideout", waves: [WH("mightyena:34", "golbat:34!")] },
  { n: "Aqua Leader Archie", t: "ho_archie", from: "Emerald and Sapphire, Seafloor Cavern", waves: [WH("mightyena:41", "crobat:41", "sharpedo:43!")] },
  { n: "The Winstrates", t: "ho_cooltrainer", from: "Emerald and Ruby/Sapphire, Route 111", waves: [WH("taillow:16@oranberry", "zigzagoon:16@oranberry", "roselia:17@oranberry"), WH("marill:15", "numel:15", "meditite:18!")] },
  { n: "Brendan", t: "ho_brendan", from: "Emerald, Rustboro City", waves: [WH("lotad:13", "torchic:15!")] },
  { n: "May", t: "ho_may", from: "Emerald, Rustboro City", waves: [WH("torkoal:13", "mudkip:15!")] },
  { n: "Brendan", t: "ho_brendan", from: "Emerald, Rustboro City", waves: [WH("wingull:13", "treecko:15!")] },
  { n: "May", t: "ho_may", from: "Emerald, Lilycove City", waves: [WH("tropius:31", "pelipper:32"), WH("ludicolo:32", "combusken:34!")] },
  { n: "Brendan", t: "ho_brendan", from: "Emerald, Lilycove City", waves: [WH("tropius:31", "ludicolo:32"), WH("slugma:32", "marshtomp:34!")] },
  { n: "May", t: "ho_may", from: "Emerald, Lilycove City", waves: [WH("tropius:31", "slugma:32"), WH("pelipper:32", "grovyle:34!")] },
  { n: "Cooltrainer Vito", t: "ho_cooltrainer", from: "Emerald, Victory Road", waves: [WH("dodrio:42", "kadabra:42"), WH("electrode:42", "shiftry:42!")] },
  // Emerald: the Gym Leaders' rematches (Double Battles there), the first and the strongest set
  { n: "Leader Roxanne", t: "ho_roxanne", from: "Emerald rematch", waves: [WH("golem:32", "kabuto:35@sitrusberry"), WH("onix:35", "nosepass:37!@sitrusberry")] },
  { n: "Leader Roxanne", t: "ho_roxanne", from: "Emerald rematch (strongest)", waves: [WH("aerodactyl:47", "golem:47", "omastar:47"), WH("kabutops:50@sitrusberry", "steelix:50", "nosepass:52!@sitrusberry")] },
  { n: "Leader Brawly", t: "ho_brawly", from: "Emerald rematch", waves: [WH("machamp:33@sitrusberry", "meditite:33"), WH("hitmontop:35", "hariyama:37!@sitrusberry")] },
  { n: "Leader Brawly", t: "ho_brawly", from: "Emerald rematch (strongest)", waves: [WH("hitmonlee:46", "hitmonchan:46", "machamp:48@sitrusberry"), WH("medicham:48", "hitmontop:50", "hariyama:52!@sitrusberry")] },
  { n: "Leader Wattson", t: "ho_wattson", from: "Emerald rematch", waves: [WH("mareep:36", "electrode:36"), WH("magneton:38@sitrusberry", "manectric:40!@sitrusberry")] },
  { n: "Leader Wattson", t: "ho_wattson", from: "Emerald rematch (strongest)", waves: [WH("electabuzz:50", "raichu:51", "ampharos:51"), WH("electrode:53", "magneton:53@sitrusberry", "manectric:55!@sitrusberry")] },
  { n: "Leader Flannery", t: "ho_flannery", from: "Emerald rematch", waves: [WH("magcargo:38@whiteherb", "ponyta:36"), WH("camerupt:38@whiteherb", "torkoal:40!@whiteherb")] },
  { n: "Leader Flannery", t: "ho_flannery", from: "Emerald rematch (strongest)", waves: [WH("arcanine:51", "magcargo:53@whiteherb", "houndoom:51"), WH("rapidash:51", "camerupt:53@whiteherb", "torkoal:55!@whiteherb")] },
  { n: "Leader Norman", t: "ho_norman", from: "Emerald rematch", waves: [WH("chansey:42", "slaking:42@sitrusberry"), WH("spinda:43", "slaking:45!@sitrusberry")] },
  { n: "Leader Norman", t: "ho_norman", from: "Emerald rematch (strongest)", waves: [WH("slaking:57@sitrusberry", "blissey:57", "kangaskhan:55"), WH("tauros:57", "spinda:58", "slaking:60!@sitrusberry")] },
  { n: "Leader Winona", t: "ho_winona", from: "Emerald rematch", waves: [WH("dratini:40@sitrusberry", "tropius:38", "pelipper:41"), WH("skarmory:43", "altaria:45!@chestoberry")] },
  { n: "Leader Winona", t: "ho_winona", from: "Emerald rematch (strongest)", waves: [WH("noctowl:53", "tropius:54", "pelipper:55"), WH("dragonite:55@sitrusberry", "skarmory:58", "altaria:60!@chestoberry")] },
  { n: "Leaders Tate & Liza", t: "ho_tateliza", from: "Emerald rematch", waves: [WH("slowpoke:48", "claydol:49", "xatu:49@chestoberry"), WH("lunatone:50@chestoberry", "solrock:50!@sitrusberry")] },
  { n: "Leaders Tate & Liza", t: "ho_tateliza", from: "Emerald rematch (strongest)", waves: [WH("hypno:63", "claydol:64", "slowking:63"), WH("xatu:64@chestoberry", "lunatone:65@chestoberry", "solrock:65!@sitrusberry")] },
  { n: "Leader Juan", t: "ho_juan", from: "Emerald rematch", waves: [WH("poliwag:46", "whiscash:46", "walrein:48"), WH("crawdaunt:48@chestoberry", "kingdra:51!@chestoberry")] },
  { n: "Leader Juan", t: "ho_juan", from: "Emerald rematch (strongest)", waves: [WH("lapras:61", "whiscash:63", "politoed:61"), WH("walrein:63", "crawdaunt:63@chestoberry", "kingdra:66!@chestoberry")] },
  // the Battle Frontier (Emerald's post-game; its Brains battle at Lv 50: Silver, then Gold Symbol). The Factory Head, Noland, uses
  // rental Pokémon picked at random, so he has no team of his own. The Brains battle to Emerald's Frontier Brain theme
  // and win to its Gym Leader victory and the Symbol fanfare;
  // picking a team plays their facility's lobby (`hoBrain`)
  { n: "Dome Ace Tucker", t: "ho_tucker", ...hoBrain("hoDome"), from: "Battle Frontier, Silver Symbol", waves: [WH("swampert:50@focusband", "salamence:50@lumberry", "charizard:50!@whiteherb")] },
  { n: "Dome Ace Tucker", t: "ho_tucker", ...hoBrain("hoDome"), from: "Battle Frontier, Gold Symbol", waves: [WH("swampert:50@leftovers", "metagross:50@quickclaw", "latias:50!@chestoberry")] },
  { n: "Arena Tycoon Greta", t: "ho_greta", ...hoBrain("hoArena"), from: "Battle Frontier, Silver Symbol", waves: [WH("heracross:50@salacberry", "umbreon:50@leftovers", "shedinja:50!@brightpowder")] },
  { n: "Arena Tycoon Greta", t: "ho_greta", ...hoBrain("hoArena"), from: "Battle Frontier, Gold Symbol", waves: [WH("umbreon:50@chestoberry", "gengar:50@leftovers", "breloom:50!@lumberry")] },
  { n: "Pike Queen Lucy", t: "ho_lucy", ...hoBrain("hoPike"), from: "Battle Frontier, Silver Symbol", waves: [WH("seviper:50@quickclaw", "shuckle:50@chestoberry", "milotic:50!@leftovers")] },
  { n: "Pike Queen Lucy", t: "ho_lucy", ...hoBrain("hoPike"), from: "Battle Frontier, Gold Symbol", waves: [WH("seviper:50@focusband", "steelix:50@brightpowder", "gyarados:50!@chestoberry")] },
  { n: "Palace Maven Spenser", t: "ho_spenser", ...hoBrain("hoPalace"), from: "Battle Frontier, Silver Symbol", waves: [WH("crobat:50@brightpowder", "slaking:50@scopelens", "lapras:50!@quickclaw")] },
  { n: "Palace Maven Spenser", t: "ho_spenser", ...hoBrain("hoPalace"), from: "Battle Frontier, Gold Symbol", waves: [WH("arcanine:50@whiteherb", "slaking:50@scopelens", "suicune:50!@kingsrock")] },
  { n: "Pyramid King Brandon", t: "ho_brandon", ...hoBrain("hoPyramid"), from: "Battle Frontier, Silver Symbol", waves: [WH("regirock:50@quickclaw", "registeel:50@leftovers", "regice:50!@chestoberry")] },
  { n: "Pyramid King Brandon", t: "ho_brandon", ...hoBrain("hoPyramid"), from: "Battle Frontier, Gold Symbol", waves: [WH("articuno:50@scopelens", "zapdos:50@lumberry", "moltres:50!@brightpowder")] },
  { n: "Salon Maiden Anabel", t: "ho_anabel", ...hoBrain("hoBattleTower"), from: "Battle Frontier, Silver Symbol", waves: [WH("alakazam:50@brightpowder", "entei:50@lumberry", "snorlax:50!@quickclaw")] },
  { n: "Salon Maiden Anabel", t: "ho_anabel", ...hoBrain("hoBattleTower"), from: "Battle Frontier, Gold Symbol", waves: [WH("raikou:50@lumberry", "latios:50@brightpowder", "snorlax:50!@chestoberry")] },
  // Omega Ruby/Alpha Sapphire (Mega Stones left out)
  { n: "Leader Flannery", t: "ho_flannery", from: "Omega Ruby/Alpha Sapphire", waves: [WH("slugma:26", "numel:26", "torkoal:28!")] },
  { n: "Elite Four Glacia", t: "ho_glacia", from: "Omega Ruby/Alpha Sapphire", waves: [WH("glalie:52", "snorunt:52", "glalie:52"), WH("snorunt:52", "walrein:54!")] },
  { n: "Elite Four Drake", t: "ho_drake", from: "Omega Ruby/Alpha Sapphire", waves: [WH("altaria:53", "flygon:53", "kingdra:53"), WH("flygon:53", "salamence:55!")] },
  { n: "May", t: "ho_mayoras", from: "Omega Ruby/Alpha Sapphire, Route 103 after the League", waves: [WH("swellow:48", "raichu:48", "wailord:48"), WH("breloom:48", "blaziken:50!")] },
  { n: "Brendan", t: "ho_brendanoras", from: "Omega Ruby/Alpha Sapphire, Route 103 after the League", waves: [WH("swellow:48", "raichu:48", "breloom:48"), WH("magcargo:48", "swampert:50!")] },
  { n: "May", t: "ho_mayoras", from: "Omega Ruby/Alpha Sapphire, Route 103 after the League", waves: [WH("swellow:48", "raichu:48", "magcargo:48"), WH("wailord:48", "sceptile:50!")] },
  { n: "Magma Admin Tabitha", t: "ho_tabitha", from: "Omega Ruby, Meteor Falls (with a Grunt)", waves: [WH("koffing:23"), WH("mightyena:23", "numel:23!")] },
  { n: "Aqua Admin Shelly", t: "ho_shelly", from: "Alpha Sapphire, Meteor Falls (with a Grunt)", waves: [WH("grimer:23"), WH("mightyena:23", "carvanha:23!")] },
  { n: "Magma Admin Tabitha", t: "ho_tabitha", from: "Omega Ruby, Mt. Chimney", waves: [WH("koffing:24", "numel:24!")] },
  { n: "Aqua Admin Shelly", t: "ho_shelly", from: "Alpha Sapphire, Mt. Chimney", waves: [WH("grimer:24", "carvanha:24!")] },
  { n: "Magma Admin Courtney", t: "ho_courtney", from: "Omega Ruby, Southern Island (with a Grunt)", waves: [WH("koffing:29"), WH("camerupt:31!")] },
  { n: "Aqua Admin Matt", t: "ho_matt", from: "Alpha Sapphire, Southern Island (with a Grunt)", waves: [WH("grimer:29"), WH("sharpedo:31!")] },
  { n: "Magma Admin Tabitha", t: "ho_tabitha", from: "Omega Ruby, Weather Institute", waves: [WH("camerupt:32!")] },
  { n: "Aqua Admin Shelly", t: "ho_shelly", from: "Alpha Sapphire, Weather Institute", waves: [WH("sharpedo:32!")] },
  { n: "Magma Admin Courtney", t: "ho_courtney", from: "Omega Ruby, Mt. Pyre and the hideout", waves: [WH("camerupt:39!")] },
  { n: "Aqua Admin Matt", t: "ho_matt", from: "Alpha Sapphire, Mt. Pyre and the hideout", waves: [WH("sharpedo:39!")] },
  { n: "Magma Leader Maxie", t: "ho_maxie", from: "Omega Ruby, Seafloor Cavern", waves: [WH("mightyena:41", "weezing:41"), WH("crobat:41", "camerupt:43!")] },
  { n: "Wally", t: "ho_wally", from: "Omega Ruby/Alpha Sapphire, Battle Maison", waves: [WH("roselia:79@brightpowder", "azumarill:79@assaultvest"), WH("magneton:79@airballoon", "kirlia:81!")] },
  { n: "Elite Four Sidney", t: "ho_sidney", from: "Omega Ruby/Alpha Sapphire rematch", waves: [WH("shiftry:70", "sharpedo:70", "absol:72!")] },
  { n: "Elite Four Phoebe", t: "ho_phoebe", from: "Omega Ruby/Alpha Sapphire rematch", waves: [WH("banette:71", "misdreavus:71"), WH("dusclops:71", "sableye:73!")] },
  { n: "Elite Four Glacia", t: "ho_glacia", from: "Omega Ruby/Alpha Sapphire rematch", waves: [WH("snorunt:72", "walrein:72", "glalie:74!")] },
  { n: "Elite Four Drake", t: "ho_drake", from: "Omega Ruby/Alpha Sapphire rematch", waves: [WH("altaria:73", "kingdra:73"), WH("flygon:73", "salamence:75!")] },
  { n: "Champion Steven", t: "ho_steven", from: "Omega Ruby/Alpha Sapphire rematch", waves: [WH("skarmory:77", "claydol:77", "aggron:77"), WH("aerodactyl:77", "metagross:79!")] },
  { n: "Secret Base Expert Aarune", t: "ho_aarune", from: "Omega Ruby/Alpha Sapphire", waves: [WH("flygon:53!@normalgem")] },
  // the Delta Episode (Omega Ruby/Alpha Sapphire's after-story)
  { n: "Magma Admin Courtney", t: "ho_courtney", from: "Delta Episode (Omega Ruby), Petalburg City", waves: [WH("camerupt:53!")] },
  { n: "Aqua Admin Matt", t: "ho_matt", from: "Delta Episode (Alpha Sapphire), Petalburg City", waves: [WH("sharpedo:53!")] },
  { n: "Zinnia", t: "ho_zinnia", from: "Delta Episode, Granite Cave", waves: [WH("altaria:55", "salamence:57!")] },
  { n: "Team Magma Grunts", t: "ho_magma", from: "Delta Episode (Omega Ruby), Devon Corporation", waves: [WH("mightyena:48", "golbat:50", "weezing:51"), WH("golbat:49", "camerupt:49!")] },
  { n: "Team Aqua Grunts", t: "ho_aqua", from: "Delta Episode (Alpha Sapphire), Devon Corporation", waves: [WH("mightyena:48", "golbat:50", "muk:51"), WH("golbat:49", "sharpedo:49!")] },
  { n: "Magma Admin Courtney", t: "ho_courtney", from: "Delta Episode (Omega Ruby), Space Center (with a Grunt)", waves: [WH("mightyena:51", "weezing:51"), WH("camerupt:55!")] },
  { n: "Aqua Admin Matt", t: "ho_matt", from: "Delta Episode (Alpha Sapphire), Space Center (with a Grunt)", waves: [WH("mightyena:51", "muk:51"), WH("sharpedo:55!")] },
  { n: "Zinnia", t: "ho_zinnia", from: "Delta Episode, Sky Pillar", waves: [WH("altaria:60", "salamence:62!")] },
];
