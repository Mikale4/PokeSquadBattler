
// =====================================================================
//  JOHTO JOURNEY — a retelling of Pokémon Crystal (the owner's rule: each region tells its base version's story): Professor Elm's
//  errand, eight Gyms, Eusine and the Suicune chase, Team Rocket's return, the Clear Bell and the Tin Tower, the Dragon Shrine, the
//  Elite Four and Champion Lance, Crystal's trip to Kanto, then Red at the top of Mt. Silver. Each battle takes its strongest
//  version's team, out of Gold/Silver's, Crystal's and HeartGold/SoulSilver's (the most total power after the region lock and the
//  Lv 36 rule; a tie goes to Crystal), and the Gyms go in the order of their levels (Pryce's Lv 34 before Jasmine's 35). Kanto's
//  Gym Leaders award no Badges here: Kanto has its own Journey. The Team Rocket Executives go by their HeartGold/SoulSilver names.
//  Dialogue is original. Only Johto's Pokémon (Gen 2's) battle on your side here (journeyOk); its wild stages catch them. The other
//  versions' teams, the rematches and the extras are Johto's wing of the Battle Tower (TOWER_WING.johto, below).
//  Stage ids start with "jo" (REGION_CODE in a4_story.js): jo1-1, joS1-1; chapters joc1...
// =====================================================================
Object.assign(SPK, {
  elm: { n: "Prof. Elm", t: "rg_elm" }, aide: { n: "Elm's Aide", t: "jo_scientist" }, jmom: { n: "Mom", t: "jo_mom" }, mrpoke: { n: "Mr. Pokémon", t: "jo_gentleman" },
  silver: { n: "???", t: "jo_silver" }, silver2: { n: "Silver", t: "jo_silver" }, kurt: { n: "Kurt", t: "jo_kurt" },
  sage: { n: "Sage", t: "jo_sage" }, kimono: { n: "Kimono Girl", t: "jo_kimono" }, jgrunt: { n: "Team Rocket Grunt", t: "jo_grunt" }, jgruntf: { n: "Team Rocket Grunt", t: "jo_gruntf" },
  proton: { n: "Proton", t: "jo_proton" }, petrel: { n: "Petrel", t: "jo_petrel" }, ariana: { n: "Ariana", t: "jo_ariana" }, archer: { n: "Archer", t: "jo_archer" },
  falkner: { n: "Falkner", t: "rg_falkner" }, bugsy: { n: "Bugsy", t: "rg_bugsy" }, whitney: { n: "Whitney", t: "rg_whitney" }, morty: { n: "Morty", t: "rg_morty" },
  chuck: { n: "Chuck", t: "rg_chuck" }, jasmine: { n: "Jasmine", t: "rg_jasmine" }, pryce: { n: "Pryce", t: "rg_pryce" }, clair: { n: "Clair", t: "rg_clair" },
  will: { n: "Will", t: "rg_will" }, jkoga: { n: "Koga", t: "rg_koga" }, jbruno: { n: "Bruno", t: "rg_bruno" }, karen: { n: "Karen", t: "rg_karen" },
  jlance: { n: "Lance", t: "jo_lance" }, jred: { n: "Red", t: "jo_red" }, jhiker: { n: "Hiker", t: "jo_hiker" }, director: { n: "Radio Tower Director", t: "jo_gentleman" },
  eusine: { n: "Eusine", t: "jo_eusine" }, elder: { n: "Dragon Shrine Master", t: "jo_sage" },
  jbrock: { n: "Brock", t: "jo_brock" }, jmisty: { n: "Misty", t: "jo_misty" }, jsurge: { n: "Lt. Surge", t: "jo_surge" }, jerika: { n: "Erika", t: "jo_erika" },
  janine: { n: "Janine", t: "jo_janine" }, jsabrina: { n: "Sabrina", t: "jo_sabrina" }, jblaine: { n: "Blaine", t: "jo_blaine" }, jblue: { n: "Blue", t: "jo_blue" },
});
const WJ = WG(2);
const joTM = mv => (TMS.find(t => t[3] === mv && t[1] === 2) || [])[0];   // (a Gen 2 TM or HM by its move, for a stage's reward: tmId in a6_state.js loads after this file)
// Silver takes the starter strong against yours, from Professor Elm's lab
const JOHTO_RIVAL_OF = { chikorita: "cyndaquil", cyndaquil: "totodile", totodile: "chikorita" };
const JOHTO_RIVAL_LINE = { chikorita: ["chikorita", "bayleef", "meganium"], cyndaquil: ["cyndaquil", "quilava", "typhlosion"], totodile: ["totodile", "croconaw", "feraligatr"] };
const johtoStarter = () => { const k = regionStarter("johto"); return JOHTO_RIVAL_OF[k] ? k : "chikorita"; };
const silverMon = st => JOHTO_RIVAL_LINE[JOHTO_RIVAL_OF[johtoStarter()]][st];

const JOHTO_JOURNEY = {
  id: "johto", title: "Johto Journey", sub: "The Johto League Challenge",
  blurb: "Leave New Bark Town with a partner from Professor Elm, earn Johto's eight Gym Badges, stop Team Rocket's return, and climb to the Pokémon League and beyond.",
  chapters: [
    { id: "c1", title: "New Bark Town to Violet City", env: "route", map: "route", reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "Professor Elm's Lab", env: "lab", starter: 1, pre: [
          L("narr", "New Bark Town, where the winds of a new beginning blow. Professor Elm's lab sits at the edge of town."),
          L("elm", "There you are! I study how Pokémon evolve, and something strange has come up: a friend of mine, Mr. Pokémon, says he's found something amazing."),
          L("elm", "I'm swamped with research, so would you go and see him for me? You can't go alone, of course. Take one of these Pokémon."),
        ], post: [
          L("elm", "A fine choice! Mr. Pokémon lives a little past Cherrygrove City, on Route 30. Call me if anything happens."),
          L("narr", "Outside, a red-haired boy is staring through the lab's window. He walks off without a word."),
        ] },
        { id: "b", type: "battle", name: "Route 29", lv: 3, env: "route", wild: 1, catch: "sentret", waves: [WJ("sentret:2", "pidgey:3"), WJ("sentret:3", "rattata:3")], pre: [
          L("narr", "Route 29 winds west through tall grass. A Sentret stands on its tail to see over it."),
        ], post: [L("narr", "Gotcha! Sentret was caught!")] },
        { id: "c", type: "story", name: "Mr. Pokémon's House", music: "joOak", pre: [
          L("mrpoke", "Ah, Professor Elm sent you! Look at this: a Pokémon Egg. The couple who run the Day-Care found it and gave it to me. Please take it to Elm: he's the expert."),
          L("oak", "Hello! I'm Oak, visiting from Kanto. I heard Mr. Pokémon had something rare, so I came to look."),
          L("oak", "You have the look of a Trainer who cares for Pokémon. Take this Pokédex: it records every Pokémon you meet. Now I must hurry to Goldenrod for my radio show!"),
          L("narr", "Your phone rings. Professor Elm sounds frantic: \"Come back! Something terrible has happened at the lab!\""),
        ] },
        // (Lv 4, not Gold and Silver's 5: like Kanto's first battle with Blue, so a Lv 5 starter can win it; at 5 Cyndaquil won 1% of the time)
        { id: "d", type: "battle", name: "Cherrygrove City: the Stranger", lv: 4, env: "city", trainer: TR("???", "jo_silver", "You got a Pokémon from the lab too. What a waste. A wimp like you doesn't deserve one.", "Hmph. Are you happy you won?"),
          rivalWaves: () => [[{ op: silverMon(0), LV: 4, moves: { chikorita: ["tackle", "growl"], cyndaquil: ["tackle", "leer"], totodile: ["scratch", "leer"] }[silverMon(0)] }]], pre: [
          L("silver", "...You. You got a Pokémon at the lab. I'm going to be the world's greatest Trainer, so get out of my way."),
        ], post: [
          L("silver", "My name? I'm going to be the world's greatest Pokémon Trainer. Remember that."),
          L("narr", "Back in New Bark Town, a police officer is at the lab: someone broke in and stole one of Professor Elm's Pokémon."),
          L("narr", "The officer asks if you got the thief's name. You remember what he muttered when he left: Silver."),
          L("elm", "The thief? A boy with red hair... That's who you battled! I'll leave it to the police. You've done enough: go on and take the Gym challenge."),
        ] },
        { id: "e", type: "battle", name: "Route 30: Youngster Joey", lv: 4, env: "route", trainer: TR("Youngster Joey", "jo_youngster", "Check out my Rattata! I raised it myself, and it's awesome!", "My Rattata... I need to train it more."),
          waves: [WJ("rattata:4")], pre: [
          L("narr", "Back on Route 30 after delivering the Egg, a boy in shorts stops you. He's very proud of his Rattata."),
        ] },
        { id: "f", type: "battle", name: "Route 31", lv: 5, env: "route", wild: 1, catch: "hoothoot", waves: [WJ("ledyba:4", "spinarak:4"), WJ("hoothoot:5", "caterpie:4")], pre: [
          L("narr", "Evening falls on Route 31. Hoothoot start calling from the trees, one foot always tucked up."),
        ], post: [L("narr", "Gotcha! Hoothoot was caught!")] },
        { id: "g", type: "side", name: "Dark Cave", lv: 5, env: "cave", wild: 1, catch: "dunsparce", waves: [WJ("zubat:3", "geodude:3"), WJ("dunsparce:4!")], pre: [
          L("narr", "Dark Cave is pitch-black past its entrance. Something burrows away from your footsteps with a drill-like tail."),
        ], post: [L("narr", "Gotcha! Dunsparce was caught! It's rarely seen: most people never notice one.")] },
        { id: "h", type: "battle", name: "Sprout Tower: Sage Li", lv: 10, env: "tower", reward: { tm: joTM("flash") }, trainer: TR("Sage Li", "jo_sage", "So good of you to come here! Sprout Tower is a place of training.", "Ah, I see. You and your Pokémon are in harmony."),
          waves: [WJ("bellsprout:7", "bellsprout:7"), WJ("hoothoot:10")], pre: [
          L("narr", "At the top of Sprout Tower, the red-haired boy is just leaving. He has beaten the Elder, and he vanishes with an Escape Rope."),
          L("sage", "That boy is strong, but he does not treat his Pokémon as friends. The great pillar here sways with the wind, as a Bellsprout does."),
          L("sage", "People and Pokémon grow together here. Show me your bond."),
        ], post: [L("sage", "Take this Flash. And go on to the Violet Gym: Falkner will be waiting.")] },
        { id: "i", type: "battle", name: "Violet Gym: Bird Keeper Abe", lv: 9, env: "gym", trainer: TR("Bird Keeper Abe", "jo_birdkeeper", "Let me see if you're good enough to face Falkner!", "This can't be true!"),
          waves: [WJ("spearow:9")] },
        { id: "j", type: "boss", name: "Falkner, the Elegant Master of Flying Pokémon", lv: 13, env: "gym", badgeWin: 0, reward: { tm: joTM("mudslap") },
          trainer: TR("Leader Falkner", "rg_falkner", "People say you can clip Flying-type Pokémon's wings with a jolt of electricity. I won't allow such insults!", "...Darn! My dad's cherished bird Pokémon... All right. Take this: the Zephyr Badge."),
          waves: [WJ("pidgey:9+", "pidgeotto:13!")], pre: [
          L("falkner", "I'm Falkner, the Violet Pokémon Gym Leader. My father trained bird Pokémon before me, and I'll show you their true power!"),
          L("falkner", "Electric, Ice and Rock moves are what my birds fear. Do you have any?"),
        ], post: [
          L("falkner", "Take this as well: TM31, Mud-Slap."),
          L("falkner", "The Zephyr Badge raises your Pokémon's strength. There are Gyms in cities ahead: test your skills there."),
        ] },
      ] },
    { id: "c2", title: "Union Cave to Azalea Town", env: "cave", map: "cave", reward: { lmd: 4000, orundum: 300 },
      nodes: [
        { id: "a", type: "chest", name: "The Mystery Egg", reward: { op: "togepi", lmd: 1000 }, pre: [
          L("aide", "Oh, I'm glad I caught you! Professor Elm wants you to have the Egg from Mr. Pokémon. It hatches when it's carried around."),
          L("narr", "A few steps out of Violet City, the Egg starts to wobble... and out pops Togepi! It looks happy to see you."),
        ] },
        { id: "b", type: "story", name: "The Ruins of Alph", pre: [
          L("narr", "South of Violet City lie the Ruins of Alph: stone chambers covered in strange letters, and the Unown that look just like them."),
          L("narr", "A scientist says the carvings are messages left by people who lived with Pokémon long ago. No one can read them yet."),
        ] },
        { id: "b1", type: "side", name: "Ruins of Alph: the Grass Outside", lv: 20, env: "route", wild: 1, catch: "natu", waves: [WJ("natu:18", "smeargle:20"), WJ("natu:22", "smeargle:22")], pre: [
          L("narr", "The grass around the ruins is full of Natu, staring at the sun without moving. Smeargle leave paint marks on the stones."),
        ], post: [L("narr", "Gotcha! Natu was caught! It's said to see both the past and the future.")] },
        { id: "c", type: "battle", name: "Route 32", lv: 6, env: "route", wild: 1, catch: "mareep", waves: [WJ("mareep:6", "hoppip:6"), WJ("bellsprout:6", "mareep:6")], pre: [
          L("narr", "Route 32 runs south along the coast. Mareep graze in the grass, their wool crackling with static."),
        ], post: [L("narr", "Gotcha! Mareep was caught!")] },
        { id: "c1", type: "side", name: "Route 32 by Night", lv: 8, env: "route", wild: 1, catch: "wooper", waves: [WJ("wooper:6", "zubat:6"), WJ("wooper:8", "ekans:6")], pre: [
          L("narr", "After dark, Wooper climb out of the ponds along Route 32, their skin coated in slime against the cold."),
        ], post: [L("narr", "Gotcha! Wooper was caught!")] },
        { id: "d", type: "battle", name: "Union Cave", lv: 7, env: "cave", wild: 1, waves: [WJ("zubat:6", "geodude:6"), WJ("sandshrew:7", "onix:8")], pre: [
          L("jhiker", "Every Friday, they say, a huge Pokémon cries out from deep in this cave. Spooky, eh?"),
        ] },
        { id: "e", type: "battle", name: "Slowpoke Well: Team Rocket", lv: 12, env: "cave", reward: { permit: 1 }, trainer: TR("Executive Proton", "jo_proton", "We're cutting off Slowpoke's tails to sell them! Scram!", "Team Rocket, finished? No way!"),
          waves: [WJ("rattata:9", "zubat:9", "ekans:11"), WJ("zubat:8", "koffing:12!")], pre: [
          L("narr", "Kurt, the Azalea Town Apricorn craftsman, chased the Grunt at the entrance away, then jumped into the well after the rest... and hurt his back in the fall."),
          L("kurt", "Ow, my back! You there! Team Rocket is down here, cutting the tails off the Slowpoke! Give them a thrashing for me!"),
          L("proton", "I'm Proton, an Executive of Team Rocket. Slowpoke Tails sell for a fortune, you know. Get lost, kid: Team Rocket is back in business!"),
        ], post: [
          L("proton", "Fine! We're leaving. But Team Rocket will rise again, you'll see!"),
          L("kurt", "Thank you! I'm Kurt: I make Poké Balls out of Apricorns. Here, take this Lure Ball, and come by my house any time."),
        ] },
        { id: "f", type: "battle", name: "Azalea Gym: Twins Amy & May", lv: 10, env: "forest", trainer: TR("Twins Amy & May", "jo_twins", "Hi! Are you challenging the Leader? No way! We'll battle you together!", "Our bugs lost! Oh well..."),
          waves: [WJ("ledyba:10", "spinarak:10")] },
        { id: "g", type: "boss", name: "Bugsy, the Walking Bug Pokémon Encyclopedia", lv: 17, env: "forest", badgeWin: 1, reward: { tm: joTM("furycutter") },
          trainer: TR("Leader Bugsy", "rg_bugsy", "I'm Bugsy! I never lose when it comes to Bug Pokémon. My research says they're the most fascinating Pokémon!", "Whoa, amazing! You're an expert on Pokémon! My research isn't complete yet. Here, take the Hive Badge."),
          waves: [WJ("metapod:15+", "kakuna:15+"), WJ("scyther:17!@sitrusberry")], pre: [
          L("bugsy", "Bug Pokémon evolve fast, and even a Metapod can be a wall with Harden. Let me show you what my studies have taught me!"),
        ], post: [
          L("bugsy", "And take this: TM49, Fury Cutter."),
          L("bugsy", "Bug Pokémon are deep, aren't they? Fire and Flying moves are their weakness: remember that, the way I do."),
        ] },
        { id: "h", type: "battle", name: "Azalea Town: the Rival", lv: 18, env: "city", trainer: TR("Silver", "jo_silver", "The Gym Badge? You? It's wasted on a wimp like you.", "...Humph! I won't lose again."),
          rivalWaves: () => [WJ("gastly:14", "zubat:16"), WJ(silverMon(1) + ":18!")], pre: [
          L("silver2", "...Team Rocket was back at the well? You beat them? Don't make me laugh. You're a liar."),
          L("silver2", "Team Rocket is pathetic anyway. They act tough in a crowd, and they're nothing alone. I hate the weak, Pokémon or people."),
        ], post: [L("silver2", "I'm not going to waste my time on weak Pokémon. I only want the strong ones. You'll see.")] },
        { id: "i", type: "side", name: "Ilex Forest", lv: 10, env: "forest", wild: 1, catch: "pineco", reward: { tm: joTM("cut") }, waves: [WJ("oddish:6", "paras:5"), WJ("pineco:10", "metapod:6")], pre: [
          L("narr", "The charcoal maker's apprentice has lost his boss's Farfetch'd in the forest. You herd it back, and the boss gives you HM01 Cut."),
          L("narr", "Ilex Forest is so thick that no light reaches the ground. A tiny shrine stands among the trees, said to honor the forest's protector."),
          L("narr", "Headbutt a tree and Pineco drop out of the branches, ready to explode at whatever bumped it."),
        ], post: [L("narr", "Gotcha! Pineco was caught!")] },
      ] },
    { id: "c3", title: "Goldenrod City", env: "city", map: "city", reward: { lmd: 5000, orundum: 300, sunstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "The Biggest City in Johto", pre: [
          L("narr", "Goldenrod City: a Radio Tower, a Department Store, a Game Corner and a Magnet Train station. People from all over Johto come here."),
          L("narr", "Its Gym Leader, Whitney, is famous for one thing: her Miltank's Rollout."),
        ] },
        { id: "b", type: "battle", name: "Goldenrod Gym: Lass Carrie", lv: 18, env: "gym", trainer: TR("Lass Carrie", "jo_lass", "Don't let my Pokémon's cute looks fool you. They can whip you!", "Darn... I thought you were weak..."),
          waves: [WJ("snubbull:18")] },
        { id: "c", type: "boss", name: "Whitney, the Incredibly Pretty Girl", lv: 20, env: "gym", badgeWin: 2, reward: { tm: joTM("attract") },
          trainer: TR("Leader Whitney", "rg_whitney", "Hi! I'm Whitney! Everyone was into Pokémon, so I got into it too! They're super-cute!", "Waaaah! You're mean! That's not fair!"),
          waves: [WJ("clefairy:18+"), WJ("miltank:20!")], pre: [
          L("whitney", "You want to battle? Just so you know, I'm really strong! My Miltank's Rollout gets stronger every turn it keeps rolling!"),
          L("narr", "Rollout hits harder each turn it carries on. Fighting moves are Normal types' weakness."),
        ], post: [
          L("whitney", "...Sniff... Okay, okay. Here's the Plain Badge. It makes your Pokémon faster. And it's not because you made me cry!"),
          L("whitney", "Oh, and this too: TM45, Attract."),
          L("narr", "At the Goldenrod Flower Shop, the owner hears you beat Whitney and gives you a SquirtBottle: there's a strange tree on Route 36 that hates water."),
        ] },
        { id: "d", type: "battle", name: "Route 35: Yanma", lv: 13, env: "route", wild: 1, catch: "yanma", waves: [WJ("pidgey:12", "drowzee:12"), WJ("yanma:13", "nidoranm:12")], pre: [
          L("narr", "A Bug Catcher on Route 35 swears he's seen dragonflies by the pond today. Something buzzes past, fast enough to leave a blur."),
        ], post: [L("narr", "Gotcha! Yanma was caught! It can see in every direction at once.")] },
        { id: "f", type: "side", name: "National Park: Bug-Catching Contest", lv: 14, env: "forest", music: "joBugContest", wild: 1, waves: [WJ("caterpie:7", "venonat:10"), WJ("pinsir:14", "scyther:14!")], pre: [
          L("narr", "On Tuesdays, Thursdays and Saturdays the National Park holds its Bug-Catching Contest. One Park Ball, one Pokémon, twenty minutes."),
        ], post: [L("narr", "The judges look over every Trainer's catch... and call your name. First place!")] },
        { id: "e", type: "battle", name: "Route 36: the Odd Tree", lv: 20, env: "route", wild: 1, catch: "sudowoodo", waves: [WJ("sudowoodo:20!")], pre: [
          L("narr", "A strange tree blocks Route 36. It wiggles when you look away. You spray it with the Flower Shop's SquirtBottle..."),
          L("narr", "The tree hates water! It jumps up: it's a Pokémon!"),
        ], post: [L("narr", "Gotcha! Sudowoodo was caught! It's a Rock type, whatever it pretends to be.")] },
      ] },
    { id: "c4", title: "Ecruteak City", env: "tower", map: "tower", reward: { lmd: 6000, orundum: 400 },
      nodes: [
        { id: "a", type: "story", name: "The Burned Tower", pre: [
          L("narr", "Ecruteak City is old Johto: two towers once stood here. Lightning struck one, and it burned for three days."),
          L("narr", "Three Pokémon died in the fire. A rainbow-colored Pokémon came down from the sky and brought them back to life, and it never returned."),
          L("narr", "Its home, they say, was the other tower: the Tin Tower, still standing. Its Sages let no one climb it."),
          L("narr", "Morty, the Gym Leader, isn't at his Gym: he's in the Burned Tower with a stranger in a white suit."),
          L("eusine", "My name's Eusine. I'm looking for Suicune, one of the three Pokémon from the legend. Morty and I believe they rest under this tower."),
        ] },
        { id: "b", type: "battle", name: "Burned Tower: the Rival", lv: 22, env: "tower", trainer: TR("Silver", "jo_silver", "...Oh, it's you. I came here looking for the legendary Pokémon. They say it's here.", "...Humph! This is why I hate battling wimps. There's no challenge."),
          rivalWaves: () => [WJ("haunter:20", "magnemite:18", "zubat:20"), WJ(silverMon(1) + ":22!")], pre: [
          L("silver2", "...Oh, it's you. There's no legendary Pokémon here, whatever the old stories say. Waste of time. Want to make it worth my while?"),
        ], post: [
          L("narr", "A hole opens in the floor. You fall to the basement... and three Pokémon are there: Raikou, Entei and Suicune."),
          L("narr", "They stare at you a moment, then bolt past you and out into Johto. Suicune stops on the stairs to look back at you, then it's gone too."),
          L("eusine", "Suicune... it looked at you! I've chased it for ten years, and it looked at you. I'll follow it wherever it goes."),
          L("narr", "Raikou and Entei roam Johto from now on. Morty heads back to his Gym."),
        ] },
        { id: "c", type: "battle", name: "Ecruteak Dance Theater", lv: 17, env: "city", music: "joDanceTheater", reward: { tm: joTM("surf") }, trainer: TR("Kimono Girls", "jo_kimono", "Our dance is our battle. Please watch closely.", "Your Pokémon are wonderful. You've raised them with care."),
          waves: [WJ("flareon:17", "espeon:17", "umbreon:17"), WJ("vaporeon:17", "jolteon:17")], pre: [
          L("kimono", "We are the Kimono Girls of Ecruteak: Naoko, Sayo, Zuki, Kuni and Miki. Each of us dances with one of Eevee's evolutions."),
        ], post: [L("kimono", "A gentleman in the theater was so moved he left you his HM. Please, take it.")] },
        { id: "d", type: "battle", name: "Ecruteak Gym: Medium Grace", lv: 21, env: "tower", trainer: TR("Medium Grace", "jo_medium", "Morty sees what others can't. Can you see me?", "I couldn't win!"),
          waves: [WJ("haunter:20", "haunter:20")] },
        { id: "e", type: "boss", name: "Morty, the Mystic Seer of the Future", lv: 25, env: "tower", badgeWin: 3, reward: { tm: joTM("shadowball") },
          trainer: TR("Leader Morty", "rg_morty", "Here in Ecruteak, Pokémon have been revered. It's said that a rainbow-colored Pokémon will appear before a truly powerful Trainer.", "I'm not good enough yet... All right. This Fog Badge is yours."),
          waves: [WJ("gastly:21+", "haunter:21+"), WJ("haunter:23+", "gengar:25!")], pre: [
          L("morty", "I've trained here all my life so I might see that Pokémon. I can see a shadow of the future... Is it you?"),
          L("narr", "Normal and Fighting moves pass straight through Ghost types. Dark and Ghost moves hit them hard."),
        ], post: [
          L("morty", "I see. Your journey has taken you to far-away places. The Fog Badge will help your Pokémon on the road ahead."),
          L("morty", "Take this with you: TM30, Shadow Ball."),
        ] },
      ] },
    { id: "c5", title: "Olivine and Cianwood", env: "sea", map: "sea", reward: { lmd: 7000, orundum: 400, waterstone: 1 },
      nodes: [
        { id: "a0", type: "battle", name: "Route 38", lv: 16, env: "route", wild: 1, catch: "snubbull", waves: [WJ("miltank:13", "raticate:16"), WJ("snubbull:16", "snubbull:16")], pre: [
          L("narr", "West of Ecruteak, Route 38 runs past a ranch where Miltank graze. Today the grass is full of Snubbull."),
        ], post: [L("narr", "Gotcha! Snubbull was caught! It looks fierce, but it's actually timid.")] },
        { id: "a", type: "story", name: "Olivine Lighthouse", reward: { tm: joTM("strength") }, pre: [
          L("silver2", "...The Gym Leader isn't here. She's up in the Lighthouse, looking after a sick Pokémon. Pathetic. A weak Pokémon should be left behind."),
          L("narr", "In the Olivine Café, a sailor who's always eating there gives you HM04, Strength."),
          L("narr", "Olivine City's lighthouse guides ships at night, but its light has gone dim. Its Ampharos, Amphy, is sick."),
          L("jasmine", "I'm Jasmine, the Gym Leader. I can't leave Amphy like this. There's a pharmacy in Cianwood City, across the sea, but..."),
          L("jasmine", "If you could bring back medicine, I'd... I'll be waiting for you at the Gym after."),
        ] },
        { id: "b", type: "battle", name: "Olivine Lighthouse", lv: 20, env: "tower", trainer: TR("Sailor Huey", "jo_sailor", "Men of the sea are always spoiling for a good fight!", "Argh! You're tough!"),
          waves: [WJ("poliwag:18", "poliwhirl:20")] },
        { id: "c", type: "battle", name: "Route 41: Whirl Islands", lv: 24, env: "sea", music: "joSurf", wild: 1, catch: "mantine", waves: [WJ("tentacool:22", "tentacruel:24"), WJ("mantine:24", "shellder:22")], pre: [
          L("narr", "Whirlpools spin between the Whirl Islands. Mantine glide over the waves; Remoraid cling underneath."),
        ], post: [L("narr", "Gotcha! Mantine was caught!")] },
        { id: "c2", type: "battle", name: "Cianwood City: Eusine", lv: 27, env: "sea", music: "joEusine", trainer: TR("Mysticalman Eusine", "jo_eusine", "Suicune was just here, on the beach! ...You're the one it looked at. Let me see why.", "I see... Your Pokémon really are something. No wonder Suicune is interested in you."),
          waves: [WJ("drowzee:25", "haunter:25"), WJ("electrode:27!")], pre: [
          L("narr", "On Cianwood's north beach, Suicune stands looking out to sea. It turns to you, then runs off over the water."),
          L("eusine", "Suicune! ...Gone again. You! It looked right at you. I have to know what it sees in you."),
        ] },
        { id: "d", type: "battle", name: "Cianwood Gym: Blackbelt Yoshi", lv: 27, env: "gym", trainer: TR("Blackbelt Yoshi", "jo_blackbelt", "My Fighting Pokémon trained right beside me under the waterfall!", "Wha-what?! Did I lose?"),
          waves: [WJ("hitmonlee:27")] },
        { id: "e", type: "boss", name: "Chuck, His Roaring Fists Do the Talking", lv: 31, env: "gym", badgeWin: 4, reward: { tm: [joTM("dynamicpunch"), joTM("fly")] },
          trainer: TR("Leader Chuck", "rg_chuck", "WAHAHAH! So you've come this far! Let me tell you, I'm tough! My Pokémon will crush stones and shatter bones!", "Wha? Huh? I lost? How about that! Take the Storm Badge, you're worthy."),
          waves: [WJ("primeape:29+"), WJ("poliwrath:31!@sitrusberry")], pre: [
          L("chuck", "Watch this! I'll smash this boulder with my bare hands... Hah! Now it's your turn: fight me!"),
          L("narr", "Psychic and Flying moves hit Fighting types hard."),
        ], post: [
          L("chuck", "The Storm Badge lets you fly to any town you've visited. And here's TM01: DynamicPunch! Wahahah! Now go, get stronger!"),
          L("narr", "Chuck's wife thanks you for giving him a good battle and gives you HM02, Fly."),
          L("narr", "At the Cianwood pharmacy, you tell the pharmacist about Amphy. He hands over a SecretPotion."),
        ] },
        { id: "f", type: "chest", name: "Cianwood City: Shuckle", reward: { op: "shuckle", lmd: 2000 }, pre: [
          L("narr", "A man in Cianwood City who calls himself Mania is afraid someone will steal his beloved Shuckle. He asks you to look after it."),
          L("narr", "Shuckle joins you! It keeps Berries in its shell, and they slowly turn to juice."),
        ] },
        { id: "g", type: "story", name: "Amphy's Light", pre: [
          L("narr", "You bring the SecretPotion up the Lighthouse. Amphy drinks it... and its tail lights up, brighter than ever. The beam sweeps out over the sea."),
          L("jasmine", "Amphy, you're better! ...Thank you. Thank you so much. I'll stay with it until it's strong again. When you come back to Olivine, please challenge me at the Gym."),
        ] },
      ] },
    { id: "c6", title: "Mahogany Town and Olivine", env: "ice", map: "cave", reward: { lmd: 8000, orundum: 500 },
      nodes: [
        { id: "a", type: "battle", name: "Lake of Rage: the Red Gyarados", lv: 30, env: "sea", wild: 1, waves: [WJ("magikarp:15", "magikarp:18"), WJ("gyarados:30!")], pre: [
          L("narr", "On Route 42, Suicune stands in an Apricorn grove. You step toward it, and it bounds away east toward Mahogany Town."),
          L("narr", "North of Mahogany Town, the Lake of Rage is swarming with Gyarados, far too many for one lake. One of them is red."),
          L("narr", "It rears up from the water, furious!"),
        ], post: [
          L("narr", "The red Gyarados sinks back under the water, leaving a shiny Red Scale on the shore. You pick it up."),
          L("jlance", "That was impressive. I'm Lance, a Trainer like you. Somebody is forcing these Magikarp to evolve, with a radio signal from Mahogany Town. Will you help me find it?"),
        ] },
        { id: "b", type: "battle", name: "Team Rocket's Hideout", lv: 19, env: "plant", trainer: TR("Team Rocket Grunts", "jo_grunt", "Intruder! The Persian statues saw you! You're not leaving!", "Darn it! You're too strong!"),
          waves: [WJ("drowzee:17", "zubat:19"), WJ("zubat:16", "grimer:17", "rattata:18")], pre: [
          L("narr", "In Mahogany Town, Lance's Dragonite flattens the souvenir shop's 'clerk'. Behind a cabinet, Lance finds stairs going down."),
          L("jlance", "Team Rocket's hideout. The Persian statues have cameras in their eyes: walk past one and Grunts come running. Let's go."),
        ] },
        { id: "c", type: "battle", name: "Rocket Hideout: Executive Petrel", lv: 24, env: "plant", trainer: TR("Executive Petrel", "jo_petrel", "Team Rocket's radio waves are making the Magikarp at the lake evolve. And you're in our way!", "Bah! I can't believe it!"),
          waves: [WJ("zubat:22", "koffing:22"), WJ("raticate:24!")], pre: [
          L("petrel", "Our boss Giovanni vanished three years ago. But we've been working on a way to bring him back... This is his office, and you're trespassing."),
        ], post: [L("narr", "The Murkrow on the desk squawks the generator room's password: 'Hail Giovanni'.")] },
        { id: "d", type: "battle", name: "Rocket Hideout: Executive Ariana", lv: 27, env: "plant", trainer: TR("Executive Ariana", "jo_ariana", "We were testing a radio that makes Pokémon evolve. You've ruined our experiment, little Trainer.", "Tch, you really are strong. What a shame."),
          waves: [WJ("drowzee:18", "grimer:20"), WJ("arbok:25", "gloom:25", "murkrow:27!")], pre: [
          L("narr", "Lance meets you on the second floor and heals your Pokémon with his own medicine. Ahead, by the generator room, a woman in black and a Grunt are waiting."),
          L("ariana", "Electrode power the transmitter. Stop us if you can!"),
        ] },
        { id: "d1", type: "battle", name: "The Generator's Electrode", lv: 23, env: "plant", wild: 1, reward: { tm: joTM("whirlpool") }, waves: [WJ("electrode:23", "electrode:23"), WJ("electrode:23!")], pre: [
          L("jlance", "These Electrode power the transmitter. I don't like it, but we have to knock them out to stop the signal."),
        ], post: [L("jlance", "That ends the radio. The Magikarp will calm down now. Here: take this HM, Whirlpool. But Team Rocket's plan isn't done... Keep your eyes open.")] },
        { id: "e", type: "battle", name: "Mahogany Gym: Skier Diana", lv: 29, env: "ice", weather: "hail", trainer: TR("Skier Diana", "jo_skier", "Ice Pokémon are tough and fast! Let's see you keep your footing!", "I lost my footing!"),
          waves: [WJ("jynx:29")] },
        { id: "f", type: "boss", name: "Pryce, the Teacher of Winter's Harshness", lv: 34, env: "ice", weather: "hail", badgeWin: 5, reward: { tm: joTM("icywind") },
          trainer: TR("Leader Pryce", "rg_pryce", "Pokémon have many experiences in their lives, just as we do. I, too, have seen and suffered much in my life.", "Ah, I am impressed by your prowess. You've earned the Glacier Badge."),
          waves: [WJ("seel:30+", "dewgong:32+"), WJ("piloswine:34!@sitrusberry")], pre: [
          L("pryce", "Since I am your elder, let me show you what I mean. I have been with Pokémon since before you were born."),
          L("narr", "Hail falls in the Mahogany Gym. Ice types are fine in it; everyone else takes a little damage each turn."),
        ], post: [
          L("pryce", "The Glacier Badge raises your Pokémon's special power. And take this: TM16, Icy Wind."),
          L("pryce", "When the ice melts, there's a path. Find yours."),
        ] },
        { id: "h", type: "boss", name: "Jasmine, the Steel-Clad Defense Girl", lv: 35, env: "plant", badgeWin: 6, reward: { tm: joTM("irontail") },
          trainer: TR("Leader Jasmine", "rg_jasmine", "Thank you for helping Amphy. ...But this is a Gym battle, so I won't hold back. My Steel-type Pokémon, please do your best.", "...Well done. Here is the Mineral Badge."),
          waves: [WJ("magnemite:30+", "magnemite:30+"), WJ("steelix:35!")], pre: [
          L("narr", "Back in Olivine, Amphy's light sweeps the harbor again. Jasmine is waiting at her Gym."),
          L("jasmine", "Steel types are tough, and few moves hurt them much. Fire, Fighting and Ground do. ...Please don't be too hard on Steelix."),
        ], post: [
          L("jasmine", "The Mineral Badge raises your Pokémon's Defense. And, um... please take this too: TM23, Iron Tail."),
          L("jasmine", "I'll be cheering for you."),
        ] },
      ] },
    { id: "c7", title: "The Radio Tower", env: "city", map: "city", reward: { lmd: 9000, orundum: 500 },
      nodes: [
        { id: "a", type: "story", name: "Team Rocket Takes the Tower", pre: [
          L("narr", "Every radio in Johto plays the same message: \"Giovanni! Can you hear us? We did it! Where are you?\""),
          L("narr", "Team Rocket has taken over the Goldenrod Radio Tower, to call their lost boss back."),
        ] },
        { id: "b", type: "battle", name: "Radio Tower: the Lower Floors", lv: 25, env: "plant", trainer: TR("Team Rocket Grunts", "jo_grunt", "The Radio Tower is ours now! Get lost!", "Ugh... the boss won't be happy..."),
          waves: [WJ("raticate:24", "raticate:24"), WJ("grimer:23", "grimer:23", "muk:25!")] },
        { id: "c", type: "battle", name: "Radio Tower: the Director", lv: 32, env: "plant", trainer: TR("Executive Petrel", "jo_petrel", "Hello, I'm the Director of the Radio Tower! ...Hah! Fooled you!", "I knew I should have stuck to disguises..."),
          waves: [WJ("koffing:30", "koffing:30", "koffing:30"), WJ("koffing:30", "weezing:32!", "koffing:30")], pre: [
          L("petrel", "The real Director? He's locked up in the Underground warehouse. Our boss will hear us from anywhere once we broadcast on every channel!"),
        ], post: [L("narr", "The fake Director drops the Basement Key. The way into the Goldenrod Underground is open.")] },
        { id: "d", type: "battle", name: "Goldenrod Underground: the Rival", lv: 34, env: "cave", trainer: TR("Silver", "jo_silver", "...Hold it. I've been waiting for you. My Pokémon are stronger than yours now.", "...Why? Why do I lose? I've assembled the strongest Pokémon..."),
          rivalWaves: () => [WJ("golbat:32", "magnemite:30", "haunter:32"), WJ("sneasel:34", silverMon(1) + ":34!")], pre: [
          L("silver2", "Team Rocket again. Weaklings in a crowd. I'll crush them myself, after I'm done with you."),
        ], post: [L("silver2", "...I lost. Lance beat me too, at their hideout. He said I don't love my Pokémon... What does that even mean?")] },
        { id: "e", type: "story", name: "The Real Director", pre: [
          L("narr", "Past three shutters and a maze of Grunts, the real Director is tied up in the warehouse under the Department Store."),
          L("director", "Thank you! They took my tower and my disguise. Here is the Card Key: it opens the door on the third floor. Please, take back the tower!"),
        ] },
        { id: "f", type: "battle", name: "Radio Tower: Executive Proton", lv: 33, env: "plant", trainer: TR("Executive Proton", "jo_proton", "They say I'm the cruelest one in Team Rocket. Want to find out why?", "No way! I'm the one who's scared!"),
          waves: [WJ("golbat:28", "weezing:33!")], pre: [
          L("proton", "You again, from the Slowpoke Well? You got a Card Key? Doesn't matter. Nobody gets past the fourth floor."),
        ] },
        { id: "g", type: "battle", name: "Radio Tower: Executive Ariana", lv: 32, env: "plant", trainer: TR("Executive Ariana", "jo_ariana", "You again! You ruined our experiment at the hideout. I won't let you ruin this too.", "Tch, you really are strong. What a shame."),
          waves: [WJ("arbok:32", "vileplume:32", "murkrow:32!")] },
        { id: "h", type: "boss", name: "Radio Tower: Executive Archer", lv: 38, env: "plant", trainer: TR("Executive Archer", "jo_archer", "We are Team Rocket, and we will return Giovanni to his rightful place! Stand aside, child!", "...Giovanni, forgive us. We have failed again. Team Rocket is finished."),
          waves: [WJ("houndour:35", "koffing:35"), WJ("houndoom:38!")], pre: [
          L("archer", "I am Archer, and I lead Team Rocket while our boss is away. We've waited three years for this broadcast!"),
        ], post: [
          L("archer", "Team Rocket is disbanding. We'll go into hiding... and wait for him."),
          L("director", "You saved my tower! Please take this: the Clear Bell. It's said to ring true for a Pokémon of legend, at the Tin Tower in Ecruteak."),
        ] },
        { id: "i", type: "battle", name: "Tin Tower: the Wise Trio", lv: 32, env: "tower", trainer: TR("Sages Gaku, Masa & Koji", "jo_sage", "The bell you carry... We have guarded this tower for Suicune's sake. Prove you are worthy of it.", "You are worthy. Go in."),
          waves: [WJ("noctowl:32", "flareon:32"), WJ("noctowl:32", "jolteon:32"), WJ("noctowl:32", "vaporeon:32!")], pre: [
          L("narr", "The Clear Bell opens the Tin Tower to you. Three Sages bar the way: Gaku, Masa and Koji, the Wise Trio."),
          L("eusine", "The Wise Trio... They're testing you, not me. Of course they are."),
        ] },
        { id: "j", type: "battle", name: "Tin Tower: Suicune", lv: 40, env: "tower", weather: "rain", wild: 1, catch: "suicune", waves: [WJ("suicune:40!")], pre: [
          L("narr", "The Clear Bell chimes. Raikou and Entei flash past you and away... but Suicune stays, and steps toward you."),
          L("eusine", "It chose you, then. ...Go on. Show it what you showed me."),
        ], post: [
          L("narr", "Gotcha! Suicune was caught! It purifies any water it runs across."),
          L("eusine", "I'll keep studying the legends. Maybe the bird of the rainbow is next. ...Take care of Suicune."),
        ] },
      ] },
    { id: "c8", title: "Blackthorn City", env: "ice", map: "cave", reward: { lmd: 10000, orundum: 600 },
      nodes: [
        { id: "a", type: "battle", name: "The Ice Path", lv: 25, env: "ice", weather: "hail", wild: 1, catch: "swinub", reward: { tm: joTM("waterfall") }, waves: [WJ("swinub:22", "golbat:23"), WJ("jynx:24", "swinub:25")], pre: [
          L("narr", "The Ice Path's floors are frozen smooth: take one step and you slide until you hit something. On its first floor lies HM07, Waterfall."),
        ], post: [L("narr", "Gotcha! Swinub was caught! Its nose finds food even under the snow.")] },
        { id: "s1", type: "side", name: "Mt. Mortar: the Karate King", lv: 34, env: "cave", gift: "tyrogue", giftLv: 10, trainer: TR("Karate King Kiyo", "jo_blackbelt", "Hwaaah! I am the Karate King! I've trained alone in the depths of this cave!", "Waaaargh! I'm overwhelmed!"),
          waves: [WJ("hitmonlee:34"), WJ("hitmonchan:34!")], pre: [
          L("narr", "With Waterfall, you can reach the bottom of Mt. Mortar. A man in a karate gi is training alone there, as he has for months."),
        ], post: [L("narr", "The Karate King gives you a Pokémon he's been raising: Tyrogue. It could grow into Hitmonlee, Hitmonchan or Hitmontop.")] },
        { id: "b", type: "side", name: "Ice Path: Delibird", lv: 24, env: "ice", weather: "hail", wild: 1, catch: "delibird", waves: [WJ("swinub:23", "zubat:22"), WJ("delibird:24!")], pre: [
          L("narr", "Deep in the Ice Path, a red-and-white bird is carrying food in its tail, the way it does for its chicks."),
        ], post: [L("narr", "Gotcha! Delibird was caught! It shares the food it carries with anyone lost in the mountains.")] },
        { id: "s1", type: "side", name: "Route 45: Skarmory", lv: 27, env: "route", wild: 1, catch: "skarmory", waves: [WJ("phanpy:20", "geodude:23"), WJ("graveler:25", "skarmory:27!")], pre: [
          L("narr", "Route 45 runs south from Blackthorn down a rocky mountainside. Phanpy roll down the slopes; a steel-winged bird circles overhead."),
        ], post: [L("narr", "Gotcha! Skarmory was caught! Its feathers are as sharp as swords.")] },
        { id: "s2", type: "side", name: "Raikou", lv: 40, env: "route", wild: 1, catch: "raikou", waves: [WJ("raikou:40!")], pre: [
          L("narr", "Thunder rolls over the route, though the sky is clear. Raikou, the Pokémon from the Burned Tower, stands in the tall grass."),
        ], post: [L("narr", "Gotcha! Raikou was caught! The lightning that fell on the tower lives in it, they say.")] },
        { id: "c", type: "battle", name: "Blackthorn Gym: Cooltrainer Mike", lv: 38, env: "volcano", trainer: TR("Cooltrainer Mike", "jo_acetrainer", "My chance of losing? Not even one percent!", "That's odd. I won't hit one percent ever again..."),
          waves: [WJ("dragonair:38")] },
        { id: "d", type: "boss", name: "Clair, the Blessed User of Dragon Pokémon", lv: 41, env: "volcano", music: "joClair",
          trainer: TR("Leader Clair", "rg_clair", "I am Clair. The world's best dragon master. I can hold my own against even the League's Elite Four.", "I lost? I don't believe it. There must be some mistake..."),
          waves: [WJ("gyarados:38+", "dragonair:38+", "dragonair:38+"), WJ("kingdra:41!@sitrusberry")], pre: [
          L("clair", "Do you still want to take me on? ...Fine. Let's do it! As a Gym Leader, I will use my full power against any opponent!"),
          L("narr", "Dragon moves hit Dragon types hard; Ice moves too. Kingdra, though, is part Water: only Dragon moves are super effective on it. Gyarados fears Electric moves most."),
        ], post: [
          L("clair", "...I won't give you the Badge. Not yet. Dragon users have to prove themselves: go into the Dragon's Den behind this Gym and take the Master's test at the Dragon Shrine. Then we'll talk."),
        ] },
        { id: "e", type: "battle", name: "The Dragon's Den", lv: 37, env: "sea", badgeWin: 7, gift: "dratini", giftLv: 15, reward: { tm: joTM("dragonbreath") }, trainer: TR("Dragon Clan Trainers", "jo_acetrainer", "Outsiders don't train in the Den. Show us you deserve to.", "...You may pass. The Master is waiting."),
          waves: [WJ("dratini:35", "dratini:35"), WJ("horsea:33", "horsea:33", "seadra:35"), WJ("dragonair:37!")], pre: [
          L("narr", "The Dragon's Den is a cave lake behind the Gym, the sacred home of the dragon clan's Pokémon. The Dragon Shrine stands on an island in the middle."),
          L("narr", "The clan's Trainers stand between you and the shrine: Twins Lea and Pia, Cooltrainer Cara and Cooltrainer Darin."),
        ], post: [
          L("elder", "Clair sent you? Then answer me: what are Pokémon to you? ...Friends. And what matters most in battle? ...To care for them. Ha! You understand. You pass."),
          L("clair", "...Fine. Here is the Rising Badge. Hurry up and take it! And this, TM24: DragonBreath. Now go to the League, and don't you dare lose after beating me."),
          L("elder", "And take this Dratini. You answered as a true Trainer would: it knows ExtremeSpeed. Raise it with the care you've shown me."),
        ] },
      ] },
    { id: "c9", title: "The Pokémon League", env: "plateau", map: "plateau", reward: { lmd: 20000, orundum: 1500, permit: 10 },
      nodes: [
        { id: "a", type: "chest", name: "Professor Elm's Gift", reward: { gold5: 1, lmd: 3000 }, pre: [
          L("elm", "You have all eight Johto Badges! I always knew you'd make it. Here, take this Master Ball: it catches any Pokémon without fail."),
          L("narr", "East of New Bark Town, Route 27 leads through Tohjo Falls and on to Victory Road and the Indigo Plateau, where the Pokémon League waits."),
        ] },
        { id: "b", type: "battle", name: "Victory Road: the Rival", lv: 40, env: "cave", music: "joVictoryRoad", trainer: TR("Silver", "jo_silver", "...Hold it. You're going to take the Pokémon League challenge? Don't make me laugh.", "...I couldn't win. I gave it everything I had..."),
          rivalWaves: () => [WJ("sneasel:36", "golbat:38", "magneton:37"), WJ("kadabra:37", "haunter:37", silverMon(2) + ":40!")], pre: [
          L("silver2", "How did someone like you get this far? Whatever. I'm invincible now. I've been training with my Pokémon, the way Lance said."),
        ], post: [L("silver2", "What you have that I don't... I'm going to figure it out. I'll keep training. ...Go on. Get to the League.")] },
        { id: "s1", type: "side", name: "Entei", lv: 40, env: "volcano", weather: "sun", wild: 1, catch: "entei", waves: [WJ("entei:40!")], pre: [
          L("narr", "The air on Route 27 shimmers with heat. Entei, born of the Burned Tower's fire, has stopped running. It turns to face you."),
        ], post: [L("narr", "Gotcha! Entei was caught! Volcanoes erupt when it barks, they say.")] },
        { id: "c", type: "battle", name: "Victory Road", lv: 34, env: "cave", music: "joVictoryRoad", wild: 1, catch: "ursaring", waves: [WJ("graveler:32", "golbat:33"), WJ("ursaring:33", "onix:34")], pre: [
          L("narr", "Victory Road climbs through the mountain to the Indigo Plateau. Only Trainers with eight Badges may pass."),
        ], post: [L("narr", "Gotcha! Ursaring was caught!")] },
        { id: "d", type: "boss", name: "Elite Four Will", lv: 42, env: "plateau",
          trainer: TR("Elite Four Will", "rg_will", "Welcome to the Pokémon League. I am Will. I have trained all around the world, making my Psychic Pokémon powerful.", "I... I can't... believe it... I'll keep training. Go: the next one is waiting.", "ultra"),
          waves: [WJ("xatu:40", "exeggutor:41", "slowbro:41"), WJ("jynx:41", "xatu:42!")], pre: [
          L("will", "I've finally been able to join the Elite Four. I can only keep getting better! Losing is not an option!"),
        ] },
        { id: "e", type: "boss", name: "Elite Four Koga", lv: 44, env: "plateau",
          trainer: TR("Elite Four Koga", "rg_koga", "Fwahahahaha! I am Koga of the Elite Four. I live in shadows, a ninja!", "Ah! You have proven your worth!", "ultra"),
          waves: [WJ("ariados:40", "venomoth:41", "forretress:43"), WJ("muk:42", "crobat:44!")], pre: [
          L("jkoga", "My intricate style will confound and destroy you! Confusion, poison, paralysis: you will not be able to escape!"),
        ] },
        { id: "f", type: "boss", name: "Elite Four Bruno", lv: 46, env: "plateau",
          trainer: TR("Elite Four Bruno", "rg_bruno", "I am Bruno of the Elite Four! Through rigorous training, people and Pokémon can become stronger without limit.", "Having lost, I have no right to say anything... Go face your next challenge!", "ultra"),
          waves: [WJ("hitmontop:42", "hitmonlee:42", "hitmonchan:42"), WJ("onix:43", "machamp:46!")], pre: [
          L("jbruno", "I've lived and trained with my fighting Pokémon! And that will never change! We will grind you down with our superior power!"),
        ] },
        { id: "g", type: "boss", name: "Elite Four Karen", lv: 47, env: "plateau",
          trainer: TR("Elite Four Karen", "rg_karen", "I am Karen of the Elite Four. You're the one who's been beating everyone? I love Dark-type Pokémon.", "Well, aren't you good. I like that in a Trainer. Strong Pokémon. Weak Pokémon. That is only the selfish perception of people.", "ultra"),
          waves: [WJ("umbreon:42", "vileplume:42", "gengar:45"), WJ("murkrow:44", "houndoom:47!")], pre: [
          L("karen", "I find their wild, tough image so appealing. And they're so strong. Think you can take them? Just try to entertain me."),
        ], post: [L("karen", "Truly skilled Trainers should try to win with the Pokémon they love best. Go on: the Champion is waiting.")] },
        { id: "h", type: "boss", name: "Champion Lance", lv: 50, env: "plateau", champion: 1,
          trainer: TR("Champion Lance", "jo_lance", "Lance the dragon master. I've been waiting for you. I knew that you, with your skills, would eventually reach me here.", "...It's over. But it's an odd feeling. I'm not angry that I lost. In fact, I feel happy.", "ultra"),
          waves: [WJ("gyarados:46", "dragonite:49", "dragonite:49"), WJ("aerodactyl:48", "charizard:48", "dragonite:50!@sitrusberry")], pre: [
          L("jlance", "There's no need for words now. We will battle to determine who is the stronger of the two of us. As the most powerful Trainer and as the Pokémon League Champion..."),
          L("jlance", "I, Lance the dragon master, accept your challenge!"),
        ], post: [
          L("jlance", "Happy that I witnessed the rise of a great new Champion! You're the new Johto Champion. Come with me: your partners will be recorded in the Hall of Fame."),
          L("narr", "Your Johto Pokémon are entered into the Hall of Fame. Their level cap keeps rising with the rest of your Journey, and lifts to Lv 100 once it's done."),
        ] },
      ] },
    // Crystal's trip to Kanto (its own post-game, the owner's rule): the S.S. Aqua, Kanto's eight Gym Leaders with each one's
    // strongest Johto-games team (HeartGold/SoulSilver's, Blue's Crystal's), the Machine Part, the Snorlax and Silver at Mt. Moon. The
    // Gyms go by their levels, Blue last (he battles only once the other seven are beaten); Kanto's Leaders award no Badges here
    { id: "c10", title: "Kanto", env: "city", map: "city", kanto: 1, reward: { lmd: 25000, orundum: 1500, permit: 10 },
      nodes: [
        { id: "a", type: "story", name: "The S.S. Ticket", pre: [
          L("elm", "Our new Champion! Here: an S.S. Ticket. The S.S. Aqua sails from Olivine to Vermilion City, in Kanto. Professor Oak would love to see you there."),
          L("narr", "The S.S. Aqua is a fast ship: Olivine to Vermilion in a single night."),
        ] },
        { id: "b", type: "battle", name: "The S.S. Aqua: Sailor Stanly", lv: 41, env: "sea", music: "joSSAqua", trainer: TR("Sailor Stanly", "jo_sailor", "No passengers in the crew's quarters! ...Unless you can get past me.", "Whoa! You've got sea legs after all!"),
          waves: [WJ("machop:39", "psyduck:34"), WJ("machoke:41!")], pre: [
          L("narr", "A gentleman on board has lost his granddaughter: she ran off to see the ship's captain. A sailor stands in the way of the crew's quarters."),
        ], post: [L("narr", "You find the girl in the captain's cabin, pretending to steer the ship. Her grandfather can't thank you enough. At dawn, the S.S. Aqua docks in Vermilion City.")] },
        { id: "c", type: "story", name: "Vermilion City", music: "joVermilion", pre: [
          L("narr", "Kanto! Vermilion City's harbor is busy, but a huge Snorlax is asleep in front of Diglett's Cave, and nobody can get past it."),
          L("narr", "Kanto has eight Gym Leaders of its own. Their Badges are for Kanto's challengers, but every one of them wants to battle Johto's new Champion."),
        ] },
        { id: "d", type: "boss", name: "Fuchsia Gym: Janine", lv: 50, env: "gym", music: "joCerulean", reward: { tm: joTM("toxic") },
          trainer: TR("Leader Janine", "jo_janine", "I'm Janine, Koga's daughter. Father joined the Elite Four, so this Gym is mine now. Watch closely!", "...You saw through every trick. Father would be impressed."),
          waves: [WJ("weezing:44+", "ariados:47+", "ariados:47+"), WJ("crobat:47+", "venomoth:50!@sitrusberry")], pre: [
          L("narr", "East of Vermilion, the coastal routes lead south to Fuchsia City. Its Gym is a maze of invisible walls, and every Trainer in it is dressed as the Leader."),
          L("janine", "Fufufu! Did you find the real me? My Poison types will do the rest. ...Psychic moves? Don't you dare."),
        ], post: [L("janine", "You've earned this, from the Fuchsia Gym: TM06, Toxic.")] },
        { id: "e", type: "boss", name: "Vermilion Gym: Lt. Surge", lv: 53, env: "gym", music: "joVermilion",
          trainer: TR("Leader Lt. Surge", "jo_surge", "Hey, kid! Johto's Champion, huh? Electric Pokémon saved me in the war. Let's see how you handle a shock!", "Whoa! You're the real deal, kid! I salute you!"),
          waves: [WJ("electrode:47+", "electrode:47+", "magneton:47+"), WJ("raichu:51+", "electabuzz:53!@sitrusberry")], pre: [
          L("jsurge", "My Electrode explode, my Magneton never quit, and my Raichu's quick on the draw. Ground moves? Yeah, those hurt."),
        ] },
        { id: "f", type: "battle", name: "Route 24: the Machine Part", lv: 39, env: "route", music: "joRoute24", trainer: TR("Team Rocket Grunt", "jo_grunt", "Team Rocket's finished? Not me! I swiped a part from the Power Plant!", "...Fine! I hid it in the Gym's pool. Happy?"),
          waves: [WJ("golbat:39!")], pre: [
          L("narr", "The Power Plant's generator is dead: someone stole a vital part, so the Magnet Train can't run. In Cerulean City, a man in black runs out of the Gym and north to Nugget Bridge."),
        ], post: [L("narr", "The Machine Part is at the bottom of the Cerulean Gym's pool. But the Gym is empty: Misty is out on a date at Cerulean Cape.")] },
        { id: "g", type: "boss", name: "Cerulean Gym: Misty", lv: 54, env: "gym", music: "joCerulean",           trainer: TR("Leader Misty", "jo_misty", "You interrupted my date! You'd better make it up to me with a real battle!", "...Fine, you win. You really are good."),
          waves: [WJ("golduck:49+", "quagsire:49+"), WJ("lapras:52+", "starmie:54!@sitrusberry")], pre: [
          L("jmisty", "My Water Pokémon are tougher than ever. Grass and Electric moves? Quagsire doesn't even feel the Electric ones."),
        ], post: [L("narr", "The Machine Part goes back to the Power Plant, and the generator hums to life. At Lavender's radio station they give you the EXPN Card: it adds a channel to your radio, the Poké Flute, a tune that wakes any Pokémon.")] },
        { id: "h", type: "battle", name: "Vermilion City: Snorlax", lv: 50, env: "route", music: "joPokeFlute", wild: 1, catch: "snorlax", waves: [WJ("snorlax:50!")], pre: [
          L("narr", "You hold the radio up to the sleeping Snorlax and tune it to the Poké Flute channel. Its eyes snap open... and it's hungry."),
        ], post: [L("narr", "Gotcha! Snorlax was caught! Diglett's Cave is open: it runs under the mountains to Pewter City.")] },
        { id: "i", type: "boss", name: "Pewter Gym: Brock", lv: 54, env: "gym", music: "joPewter",
          trainer: TR("Leader Brock", "jo_brock", "Johto's Champion, in my Gym? My rock-hard willpower is ready!", "Your Pokémon are tougher than rock. Well fought!"),
          waves: [WJ("graveler:51+", "rhyhorn:51+", "omastar:53+"), WJ("kabutops:52+", "onix:54!@sitrusberry")], pre: [
          L("jbrock", "I'm Brock. My Rock types have trained with the fossils from Mt. Moon. Water moves hit nearly all of them hard."),
        ] },
        { id: "j", type: "battle", name: "Mt. Moon: the Rival", lv: 50, env: "cave", music: "joMtMoon", trainer: TR("Silver", "jo_silver", "...Hold it. I've been training here, the way I should have from the start. Battle me.", "...I lost. But I'm not angry. Strange."),
          rivalWaves: () => [WJ("sneasel:46", "golbat:47", "magneton:46"), WJ("alakazam:48", "gengar:48", silverMon(2) + ":50!")], pre: [
          L("silver2", "...It's you. I came to Kanto to get stronger, with my Pokémon this time. Not just for me."),
        ], post: [L("silver2", "My Pokémon and I... we'll keep at it. Together. ...Next time, I win.")] },
        { id: "k", type: "boss", name: "Saffron Gym: Sabrina", lv: 55, env: "gym", music: "joPewter",
          trainer: TR("Leader Sabrina", "jo_sabrina", "I foresaw your coming. I've waited for this battle.", "...Your power is greater than I saw."),
          waves: [WJ("espeon:53+", "mrmime:53+"), WJ("alakazam:55!@sitrusberry")], pre: [
          L("jsabrina", "My Psychic Pokémon read your every move. Ghost moves hit every one of them hard; Bug and Dark moves, most."),
        ] },
        { id: "l", type: "boss", name: "Celadon Gym: Erika", lv: 56, env: "forest", music: "joCeladon", reward: { tm: joTM("gigadrain") },
          trainer: TR("Leader Erika", "jo_erika", "Oh, I must have dozed off... A battle with Johto's Champion? How lovely.", "Oh! I concede. You are remarkably strong."),
          waves: [WJ("jumpluff:51+", "tangela:52+"), WJ("victreebel:56+", "bellossom:56!@sitrusberry")], pre: [
          L("jerika", "I arrange flowers, and I raise Grass Pokémon. Fire, Ice, Flying and Poison moves wilt them, I'm afraid."),
        ], post: [L("jerika", "Please accept this: TM19, Giga Drain.")] },
        { id: "m", type: "boss", name: "Cinnabar Gym: Blaine", lv: 59, env: "volcano", music: "joCinnabar",
          trainer: TR("Leader Blaine", "jo_blaine", "My Gym burned down with the volcano, but my fire didn't! Hope you brought Burn Heal!", "I'm burned out... That was a hot one!"),
          waves: [WJ("magcargo:54+", "magmar:54+"), WJ("rapidash:59!@whiteherb")], pre: [
          L("narr", "Cinnabar Island's volcano erupted and buried the town. Blaine moved his Gym into a cave on the Seafoam Islands."),
          L("jblaine", "Quiz time! What puts out a fire? Water, Ground and Rock! Now show me!"),
        ] },
        { id: "n", type: "boss", name: "Viridian Gym: Blue", lv: 58, env: "gym", music: "joPewter",
          trainer: TR("Leader Blue", "jo_blue", "So you're Johto's Champion. I was Kanto's once, for about five minutes. Let's see who's tougher!", "...What? I lost? Heh. You're the real thing."),
          waves: [WJ("pidgeot:56+", "alakazam:54+", "rhydon:56+"), WJ("gyarados:58+", "exeggutor:58+", "arcanine:58!")], pre: [
          L("narr", "The Viridian Gym's Leader is back: Blue, Professor Oak's grandson, who was once Kanto's Champion. He only battles Trainers who've beaten Kanto's other seven Leaders."),
          L("jblue", "My team covers every type. Ready? Let's go!"),
        ], post: [
          L("jblue", "You beat all eight of Kanto's Leaders too. Gramps will want to hear about this."),
          L("oak", "Remarkable! Johto's League and Kanto's Leaders. There's a mountain on the border, Mt. Silver, that only the strongest Trainers may climb. You have my permission."),
        ] },
      ] },
    { id: "c11", title: "Mt. Silver", env: "cave", map: "cave", reward: { orundum: 2000, permit: 10, rec4: 5 },
      nodes: [
        { id: "a", type: "story", name: "The Silent Mountain", pre: [
          L("narr", "Mt. Silver stands on the border of Johto and Kanto. Only Trainers the League recognizes may climb it, and Professor Oak has given you his. The Pokémon inside are fierce."),
          L("narr", "A Trainer is said to wait at the very top, silent, as if he's been there for years."),
        ] },
        { id: "b", type: "side", name: "Tin Tower: Ho-Oh", lv: 60, env: "tower", weather: "sun", wild: 1, catch: "hooh", waves: [WJ("hooh:60!")], pre: [
          L("narr", "With Raikou, Entei and Suicune together, the Tin Tower's Sage hands you a feather that shines every color: the Rainbow Wing."),
          L("narr", "At the top of the Tin Tower, the Rainbow Wing grows warm. Ho-Oh, the Pokémon from the legend, lands on the roof."),
        ], post: [L("narr", "Gotcha! Ho-Oh was caught! The legend was true.")] },
        { id: "b2", type: "side", name: "Whirl Islands: Lugia", lv: 60, env: "sea", weather: "rain", wild: 1, catch: "lugia", waves: [WJ("lugia:60!")], pre: [
          L("narr", "In Pewter City, an old man who once saw a silver bird over the sea gives you a feather that glitters silver: the Silver Wing."),
          L("narr", "Deep under the Whirl Islands, the Silver Wing begins to shine. A vast Pokémon rises from the water: Lugia, the guardian of the seas."),
        ], post: [L("narr", "Gotcha! Lugia was caught!")] },
        { id: "c", type: "side", name: "The Ilex Forest Shrine", lv: 30, env: "forest", wild: 1, catch: "celebi", waves: [WJ("celebi:30!")], pre: [
          L("kurt", "This GS Ball... I've studied it for ages, and I can't open it. But it reacts when I bring it near the shrine in Ilex Forest. Try it."),
          L("narr", "You set the GS Ball on the shrine. A Pokémon steps out of the light: Celebi, the voice of the forest, which travels through time."),
        ], post: [L("narr", "Gotcha! Celebi was caught!")] },
        { id: "d0", type: "battle", name: "The Foot of Mt. Silver", lv: 42, env: "route", wild: 1, catch: "sneasel", waves: [WJ("donphan:42", "ursaring:42"), WJ("sneasel:38", "sneasel:42")], pre: [
          L("narr", "Night on the slopes below Mt. Silver. Sneasel prowl in the grass, looking for nests to raid."),
        ], post: [L("narr", "Gotcha! Sneasel was caught!")] },
        { id: "d", type: "battle", name: "Mt. Silver Cave", lv: 44, env: "cave", wild: 1, catch: "larvitar", waves: [WJ("golbat:44", "donphan:44"), WJ("larvitar:20", "ursaring:44", "larvitar:15")], pre: [
          L("narr", "Deep in Mt. Silver, a Larvitar is eating its way through the rock. It has been chewing on the mountain since it hatched."),
        ], post: [L("narr", "Gotcha! Larvitar was caught! It eats soil, and grows into a Pokémon that can level mountains.")] },
        { id: "e", type: "battle", name: "Mt. Silver's Upper Floors", lv: 47, env: "cave", wild: 1, catch: "misdreavus", waves: [WJ("golbat:47", "donphan:47"), WJ("misdreavus:45", "ursaring:47")], pre: [
          L("narr", "The cave's upper floors are dark and cold. Something giggles in the dark and pulls at your hair: a Misdreavus."),
        ], post: [L("narr", "Gotcha! Misdreavus was caught! It feeds on the fright of the people it startles.")] },
        { id: "f", type: "boss", name: "Red", lv: 88, env: "ice", weather: "hail",
          trainer: TR("Pokémon Trainer Red", "jo_red", "...", "...", "master"),
          // (HeartGold/SoulSilver's team, the strongest; his Pikachu is a Raichu by the Lv 36 house rule and keeps its Light Ball)
          waves: [WJ("pikachu:88!@lightball", "lapras:80", "snorlax:82"), WJ("venusaur:84", "charizard:84", "blastoise:84")], pre: [
          L("narr", "Snow blows sideways at the summit. A boy in a red cap stands looking out over Kanto and Johto. He turns."),
          L("jred", "..."),
          L("jred", "......"),
        ], post: [
          L("jred", "..."),
          L("narr", "Red smiles, just a little. When the snow clears, he's gone."),
          L("narr", "You've done it: the Johto Journey is complete."),
        ] },
      ] },
  ],
};
STORY.push(JOHTO_JOURNEY);
indexJourney(JOHTO_JOURNEY);

// ---- Johto's Battle Tower wing (the owner's rule: what the Journey leaves out goes to the Battle Tower; floors sort by level, lv
// defaults to the strongest Pokémon). Only battles the Journey doesn't have: the weaker versions' teams for its battles where the
// Pokémon differ (never level-only copies), the rematches (HeartGold/SoulSilver's Fighting Dojo Gym Leaders, the Elite Four and
// Lance, Silver at the Indigo Plateau), HeartGold/SoulSilver's extras (the Kimono Girls' Lv 38 test, the Dragon's Den Multi
// Battle) and Frontier Brains at Lv 50 (Thorton's rentals and Argenta's random picks have no team to copy). WJ keeps the region lock and
// the Lv 36 house rule: a later generation's evolution battles as its Johto form (Honchkrow as Murkrow, Magnezone as Magneton,
// Rhyperior as Rhydon, Mamoswine as Piloswine...), one with no Johto form is left out (Staraptor, Relicanth, Milotic, Gallade,
// Salamence...), and Brock's Onix is a Steelix, a Golbat at Lv 36+ a Crobat, a Graveler a Golem, Red's Pikachu a Raichu.
// Silver's starter is the one strong against yours, so his floors work theirs out when they're played (get waves).
const JO_BRAIN = { bgm: "joFrontierBrain", winBgm: "joFrontierWin" };   // (the Frontier Brains' music, HeartGold/SoulSilver's)
TOWER_WING.johto = [
  { n: "Team Rocket Grunt", t: "jo_grunt", from: "Gold/Silver/Crystal: the Slowpoke Well", waves: [WJ("koffing:14!")],
    intro: "Slowpoke Tails sell for a fortune. Beat it, kid!", lose: "Tch. Fine, keep your Slowpoke." },
  { n: "Team Rocket Grunt", t: "jo_grunt", from: "HeartGold/SoulSilver: the Dance Theater", waves: [WJ("koffing:12!")],
    intro: "Get out of my way! I'm teaching these dancers some manners!", lose: "Ugh... I'm out of here!" },
  { n: "Rival Silver", t: "jo_silver", from: "HeartGold/SoulSilver: the Burned Tower", lv: 22,
    waves: () => [WJ("gastly:20", "zubat:20", "magnemite:18"), WJ(`${silverMon(1)}:22!`)],
    intro: "No legendary Pokémon in this dump. You'll do instead.", lose: "...Lucky. Next time you won't be." },
  { n: "Executive Proton", t: "jo_proton", from: "Gold/Silver/Crystal: the Radio Tower", waves: [WJ("golbat:36!")],
    intro: "They call me the scariest guy in Team Rocket. Let's find out why.", lose: "Scary, sure. Not strong enough, apparently." },
  { n: "Leader Janine", t: "jo_janine", from: "Gold/Silver/Crystal", waves: [WJ("ariados:33", "weezing:36", "weezing:36"), WJ("crobat:36", "venomoth:39!")],
    intro: "Father left the Gym to me. Watch closely, or you won't see a thing!", lose: "Father would have seen that coming. I'll train harder." },
  { n: "Leader Clair", t: "rg_clair", from: "Gold/Silver/Crystal", waves: [WJ("dragonair:37", "dragonair:37"), WJ("dragonair:37", "kingdra:40!")],
    intro: "I'm the best dragon master there is. I'll take you on with everything I have!", lose: "I lost? ...Fine. You win this one." },
  { n: "Kimono Girls", t: "jo_kimono", from: "HeartGold/SoulSilver: the Dance Theater, before the Bell Tower", waves: [WJ("umbreon:38", "espeon:38", "flareon:38"), WJ("jolteon:38", "vaporeon:38!")],
    who: "Zuki, Naoko, Miki, Sayo and Kuni", intro: "Our dance decides who may meet the Pokémon of legend. Please, show us your bond.", lose: "You are the one. We'll dance for you at the tower." },
  { n: "Rival Silver", t: "jo_silver", from: "HeartGold/SoulSilver: the Indigo Plateau rematch", lv: 60,
    waves: () => [WJ("sneasel:55", "magneton:55", "gengar:56"), WJ("crobat:58", "alakazam:56", `${silverMon(2)}:60!`)],
    intro: "I'm here to beat Lance. But first, you.", lose: "...Good. Then I'll get stronger, the right way." },
  { n: "Tower Tycoon Palmer", t: "jo_palmer", from: "HeartGold/SoulSilver's Battle Frontier: Silver Print, Lv 50", waves: [WJ("rhydon:50@focusband", "dragonite:50!@lumberry")], ...JO_BRAIN,
    intro: "So you're the one climbing my Tower! Let's make it a battle to remember!", lose: "Fantastic! Battles like that are why I love this place!" },
  { n: "Arcade Star Dahlia", t: "jo_dahlia", from: "HeartGold/SoulSilver's Battle Frontier: Gold Print, Lv 50", waves: [WJ("togetic:50", "zapdos:50!")], ...JO_BRAIN,
    intro: "Let's have some fun! Luck's on whoever wants it most!", lose: "Ha! You've got luck AND skill. Not fair!" },
  { n: "Castle Valet Darach", t: "jo_darach", from: "HeartGold/SoulSilver's Battle Frontier: Silver and Gold Prints, Lv 50", waves: [WJ("houndoom:50@focussash"), WJ("entei:50!@shucaberry")], ...JO_BRAIN,
    intro: "Welcome. Allow me to serve you a battle worthy of the Castle.", lose: "A superb performance. I bow to you." },
  { n: "Leader Falkner", t: "rg_falkner", from: "HeartGold/SoulSilver rematch", waves: [WJ("noctowl:52", "murkrow:54", "pidgeot:56!")],
    intro: "My birds have grown since our last battle. So have I!", lose: "Still not enough... but we'll reach you yet." },
  { n: "Leader Bugsy", t: "rg_bugsy", from: "HeartGold/SoulSilver rematch", waves: [WJ("yanma:52", "heracross:54"), WJ("pinsir:55", "scizor:56!@sitrusberry")],
    intro: "I've studied Bug Pokémon even harder since you beat me. Let me show you!", lose: "I learned something new again. Thanks!" },
  { n: "Leader Morty", t: "rg_morty", from: "HeartGold/SoulSilver rematch", waves: [WJ("misdreavus:54", "gengar:57", "gengar:57!")],
    intro: "I've seen this battle in my training. Let's see if it plays out the same.", lose: "Not as I saw it. You've changed the future." },
  { n: "Leader Whitney", t: "rg_whitney", from: "HeartGold/SoulSilver rematch", waves: [WJ("lickitung:50", "girafarig:52"), WJ("clefable:52", "miltank:58!@lumberry")],
    intro: "I'm not gonna cry this time! Me and Miltank have trained super hard!", lose: "Waaah! ...No, I'm fine. You're just really good!" },
  { n: "Leader Chuck", t: "rg_chuck", from: "HeartGold/SoulSilver rematch", waves: [WJ("hitmonchan:52", "hitmonlee:55"), WJ("primeape:56", "poliwrath:60!@sitrusberry")],
    intro: "WAHAHAH! I've been training under the waterfall all day for this!", lose: "Hwa! I'm back to the waterfall!" },
  { n: "Leader Pryce", t: "rg_pryce", from: "HeartGold/SoulSilver rematch", waves: [WJ("dewgong:58@lumberry", "piloswine:60!@sitrusberry")],
    intro: "Even an old man grows stronger when there's someone like you to chase.", lose: "Hmm. You've grown more than I have." },
  { n: "Leader Clair", t: "rg_clair", from: "HeartGold/SoulSilver rematch", waves: [WJ("dragonair:52", "aerodactyl:52", "charizard:52"), WJ("gyarados:56@wacanberry", "kingdra:56", "dragonite:60!@sitrusberry")],
    intro: "I've been waiting for you. This time, I win!", lose: "...Again?! Grr. You're really something." },
  { n: "Leader Brock", t: "jo_brock", from: "HeartGold/SoulSilver rematch", waves: [WJ("golem:55", "kabutops:55"), WJ("omastar:56", "onix:61!@sitrusberry")],
    intro: "My Pokémon and I have hardened up. Ready?", lose: "Rock solid, as always. Well fought!" },
  { n: "Leader Janine", t: "jo_janine", from: "HeartGold/SoulSilver rematch", waves: [WJ("crobat:52", "weezing:56"), WJ("ariados:58", "venomoth:59!@sitrusberry")],
    intro: "I've trained in secret since our last battle. You won't see it coming!", lose: "You saw it coming. Of course you did." },
  { n: "Leader Misty", t: "jo_misty", from: "HeartGold/SoulSilver rematch", waves: [WJ("lanturn:54", "quagsire:56"), WJ("lapras:56", "starmie:60!@colburberry")],
    intro: "My Water Pokémon are better than ever. Let's go all out!", lose: "Aww... Fine, you win. But I'll be back!" },
  { n: "Leader Lt. Surge", t: "jo_surge", from: "HeartGold/SoulSilver rematch", waves: [WJ("magneton:52", "electrode:52"), WJ("electabuzz:56@sitrusberry", "raichu:60!")],
    intro: "Ten-hut! Lightning strikes twice, kid!", lose: "At ease, soldier. You earned it!" },
  { n: "Leader Erika", t: "jo_erika", from: "HeartGold/SoulSilver rematch", waves: [WJ("jumpluff:53", "victreebel:56"), WJ("bellossom:56", "tangela:60!")],
    intro: "My garden has grown since your last visit. Will you see it bloom?", lose: "What a beautiful battle. Thank you." },
  { n: "Leader Sabrina", t: "jo_sabrina", from: "HeartGold/SoulSilver rematch", waves: [WJ("wobbuffet:53", "jynx:54", "mrmime:56"), WJ("espeon:58", "alakazam:60!")],
    intro: "This time I saw the ending. I won't say whose it was.", lose: "...It was yours." },
  { n: "Leader Blue", t: "jo_blue", from: "HeartGold/SoulSilver", waves: [WJ("gyarados:52", "exeggutor:55", "machamp:56"), WJ("arcanine:58", "rhydon:58", "pidgeot:60!@sitrusberry")],
    intro: "I'm the Viridian Gym's Leader, and the toughest in Kanto. Let's go!", lose: "What? Again? ...Heh. Not bad at all." },
  { n: "Leader Jasmine", t: "rg_jasmine", from: "HeartGold/SoulSilver rematch", waves: [WJ("skarmory:52", "magneton:56", "steelix:62!")],
    intro: "Um... I've become stronger too. Please, battle me!", lose: "You're so strong... and kind to your Pokémon." },
  { n: "Elite Four Will", t: "rg_will", from: "HeartGold/SoulSilver rematch", waves: [WJ("jynx:60", "slowbro:60", "xatu:62!@sitrusberry")],
    intro: "I've trained all over the world since you beat me. Now, witness it!", lose: "I... I still can't believe it." },
  { n: "Elite Four Koga", t: "rg_koga", from: "HeartGold/SoulSilver rematch", waves: [WJ("muk:62@blacksludge", "venomoth:63", "crobat:64!")],
    intro: "Fwahahaha! A ninja's arts sharpen with every year. Feel them!", lose: "You see through every trick. Impressive." },
  { n: "Elite Four Bruno", t: "rg_bruno", from: "HeartGold/SoulSilver rematch", waves: [WJ("hitmonlee:61", "hitmonchan:61"), WJ("hitmontop:62", "machamp:64!")],
    intro: "We've trained to our limits and past them. Hoo hah!", lose: "Why? How could we lose again?" },
  { n: "Elite Four Karen", t: "rg_karen", from: "HeartGold/SoulSilver rematch", waves: [WJ("sneasel:62", "houndoom:63"), WJ("murkrow:64", "umbreon:64!@sitrusberry")],
    intro: "Strong Pokémon, weak Pokémon. A good Trainer wins with their favorites.", lose: "Well, aren't you good. I like that in a Trainer." },
  { n: "Champion Lance", t: "jo_lance", from: "HeartGold/SoulSilver rematch", waves: [WJ("gyarados:68", "charizard:68", "dragonite:75!@sitrusberry")],
    intro: "I've been waiting for this rematch. My dragons and I hold nothing back!", lose: "Magnificent. You're a true Champion." },
  { n: "Leader Blue", t: "jo_blue", from: "HeartGold/SoulSilver rematch", waves: [WJ("exeggutor:67", "arcanine:68", "machamp:69@ironball"), WJ("rhydon:70", "tyranitar:70", "pidgeot:72!@sitrusberry")],
    intro: "I've been waiting for a real battle. Let's settle this, Champion!", lose: "Ha! Only Red ever beat me like that." },
  { n: "Leader Clair & Champion Lance", t: "rg_clair", from: "HeartGold/SoulSilver: the Dragon's Den, a Multi Battle",
    waves: [WJ("dragonair:52", "kingdra:56", "dragonite:60"), WJ("gyarados:68", "charizard:68", "dragonite:75!")],
    intro: "The dragon clan's two strongest, together. Show us what you're made of!", lose: "Splendid. The Den is proud to have seen that." },
  { n: "Pokémon Trainer Red", t: "jo_red", from: "Gold/Silver/Crystal: Mt. Silver", waves: [WJ("pikachu:81!@lightball", "espeon:73", "snorlax:75"), WJ("venusaur:77", "charizard:77", "blastoise:77")],
    intro: "...", lose: "..." },
];
