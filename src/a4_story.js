
// =====================================================================
//  JOURNEY — a retelling of Pokémon Red and Blue across Kanto: eight Gyms, Team Rocket, the Elite Four,
//  the Champion, and Cerulean Cave. Gym Leaders use their Red/Blue teams. Dialogue is original.
//  Node types: story · battle · side · chest · boss
//  Waves are lists of "species:level" (":12+" = Gym Leader strength, ":14!" = ace / boss).
// =====================================================================
const SPK = {
  narr: { n: "" },
  oak: { n: "Prof. Oak", t: "oak" }, blue: { n: "Blue", t: "blue" }, champ: { n: "Blue", t: "bluechampion" }, mom: { n: "Mom" },
  brock: { n: "Brock", t: "brock" }, misty: { n: "Misty", t: "misty" }, surge: { n: "Lt. Surge", t: "ltsurge" }, erika: { n: "Erika", t: "erika" },
  koga: { n: "Koga", t: "koga" }, sabrina: { n: "Sabrina", t: "sabrina" }, blaine: { n: "Blaine", t: "blaine" }, giovanni: { n: "Giovanni", t: "giovanni" },
  lorelei: { n: "Lorelei", t: "lorelei" }, bruno: { n: "Bruno", t: "bruno" }, agatha: { n: "Agatha", t: "agatha" }, lance: { n: "Lance", t: "lance" },
  grunt: { n: "Team Rocket Grunt", t: "teamrocketgruntm" }, gruntf: { n: "Team Rocket Grunt", t: "teamrocketgruntf" }, bill: { n: "Bill", t: "bill" },
  fuji: { n: "Mr. Fuji", t: "mrfuji" }, daisy: { n: "Daisy", t: "daisy" }, sci: { n: "Scientist", t: "scientist" }, bug: { n: "Bug Catcher", t: "bugcatcher" },
  hiker: { n: "Hiker", t: "hiker" }, jj: { n: "Jessie & James", t: "jessiejames" }, nurse: { n: "Nurse Joy", t: "nurse" }, me: { n: "", t: "me" },
  celio: { n: "Celio" }, gideon: { n: "Gideon", t: "scientist" },
};
const L = (s, t) => ({ s, t });
// "pidgey:4" → { op: "pidgey", LV: 4 }; "+" marks a Gym Leader's Pokémon, "!" the ace (a boss), "@item" what it holds
// ("pikachu:81!@lightball"). WG(g): the same for the Journey of generation g (its Pokémon grow within it: grownAt)
const WG = g => (...list) => list.map(x => {
  const [spec, held] = x.split("@"), [k, rest = ""] = spec.split(":"), LV = parseInt(rest, 10) || 0, op = LV ? grownAt(k, LV, g) : k;
  return { op, LV, ...(rest.endsWith("!") ? { boss: 1, hpX: 1.8 } : rest.endsWith("+") ? { hpX: 1.15 } : {}), ...(held ? { held } : {}) };
});
const W = WG(null);
const TR = (name, spr, intro, lose, ball = "poke") => ({ name, spr, intro, lose, ball });
// a Pokémon at this level, evolved as far as its level allows (house rule: anything the Journey, Explore or the Battle Tower puts
// in battle at or past an evolution level has evolved, and from Lv 36 its stone or trade evolution too; Eevee's stone goes by its level)
const EVO_ITEM_LV = 36;
// (a Kanto Pokémon grows into Kanto's evolutions only, as in Red and Blue: Agatha's Golbat stays a Golbat, Bruno's Onix an Onix,
// Erika's Gloom becomes a Vileplume, never a Bellossom; the other regions' Pokémon, in the Battle Tower, grow as they do. g: a
// region's Journey, whose Pokémon grow only into evolutions from its generation or earlier: Johto's Sneasel stays a Sneasel)
function grownAt(k, lv, g) {
  const fits = (from, to) => g ? genOf(to) <= g : !kantoMon(from) || kantoMon(to);
  for (let n = 0; n < 3; n++) { const c = (OPS[k].evo || []).filter(e => lv >= (e.lv || EVO_ITEM_LV) && OPS[e.to] && fits(k, e.to)); if (!c.length) break; k = c[lv % c.length].to; }
  return k;
}
// (the owner's rule, 2026-10-15: the Journey tells FireRed/LeafGreen's story, and each battle takes its strongest version's team, by the
// total power of its Pokémon after the region lock and the house rule: Lt. Surge's, Erika's and Blaine's are Let's Go's, Koga's,
// Sabrina's and Giovanni's Gym team Yellow's, the Elite Four's and the Champion's Red and Blue's, the rest FireRed/LeafGreen's. Blue
// keeps his own line throughout, so his team stays one team; the weaker teams are in the Battle Tower's Kanto wing)
// Blue's team follows your starter: he always picks the one with the type advantage
const STARTERS = ["bulbasaur", "charmander", "squirtle"];
const RIVAL_OF = { bulbasaur: "charmander", charmander: "squirtle", squirtle: "bulbasaur" };
const RIVAL_LINE = { charmander: ["charmander", "charmeleon", "charizard"], squirtle: ["squirtle", "wartortle", "blastoise"], bulbasaur: ["bulbasaur", "ivysaur", "venusaur"] };
// your starter in a region (the one you chose there: S.regions; Kanto's is S.starter on older saves and tests)
const regionStarter = id => (S && S.regions && S.regions[id] && S.regions[id].starter) || (id === "kanto" || !S || !S.regions || !Object.keys(S.regions).length ? S && S.starter : null) || null;
const kantoStarter = () => { const k = regionStarter("kanto"); return RIVAL_OF[k] ? k : "bulbasaur"; };
const rivalMon = st => RIVAL_LINE[RIVAL_OF[kantoStarter()]][st];
// the champion's last two depend on his starter (as in Red and Blue)
const champExtras = () => ({ charmander: ["exeggutor", "gyarados"], squirtle: ["arcanine", "exeggutor"], bulbasaur: ["gyarados", "arcanine"] }[RIVAL_OF[kantoStarter()]]);
const champBase = () => champExtras().map(k => ({ exeggutor: "exeggcute", arcanine: "growlithe" })[k] || k);   // (the same two, before they evolve)

const STORY = [{
  id: "kanto", title: "Kanto Journey", sub: "Pokémon League Challenge",
  blurb: "Leave Pallet Town with your first partner, earn all eight Gym Badges, stop Team Rocket, and challenge the Pokémon League.",
  chapters: [
    { id: "c1", title: "Pallet Town to Pewter City", env: "route", map: "route", badge: 0, reward: { lmd: 3000, orundum: 300 },
      nodes: [
        { id: "a", type: "story", name: "A World of Pokémon", starter: 1, pre: [
          L("oak", "Hello there! Welcome to the world of Pokémon! My name is Oak. People call me the Pokémon Prof."),
          L("oak", "This world is inhabited by creatures called Pokémon. Some people keep them as pets; others use them to battle. I study them."),
          L("blue", "Gramps! I'm fed up with waiting! You said you'd give me a Pokémon today!"),
          L("oak", "Patience, Blue. You'll get one too. First, our other young Trainer gets to choose. Go on, pick one of these three."),
        ], post: [
          L("blue", "Then I'll take this one! Hey, why don't we have a battle? Our Pokémon are raring to go!"),
        ] },
        { id: "b", type: "battle", name: "Rival in the Lab", lv: 5, env: "lab", trainer: TR("Blue", "blue", "I'll make my Pokémon fight! Smell ya later? Not yet!", "What? Unbelievable! I picked the wrong Pokémon!"),
          rivalWaves: () => [[{ op: rivalMon(0), LV: 4, moves: { charmander: ["scratch", "growl"], squirtle: ["tackle", "tailwhip"], bulbasaur: ["tackle", "growl"] }[rivalMon(0)] }]], pre: [
          L("oak", "A battle between friends! Remember: Fire beats Grass, Grass beats Water, and Water beats Fire. Tap your opponent to aim, then choose a move."),
        ], post: [
          L("blue", "Okay! I'll make my Pokémon battle to toughen it up! Gramps, see ya!"),
          L("oak", "Well done. The bond between Trainer and Pokémon grows with every battle."),
        ] },
        { id: "c", type: "battle", name: "Route 1", lv: 3, env: "route", wild: 1, catch: "pidgey", reward: { permit: 5 }, waves: [W("pidgey:3", "rattata:3")], pre: [
          L("narr", "Tall grass rustles on Route 1. Wild Pokémon live here; Trainers who walk the grass meet them."),
          L("oak", "Weaken a wild Pokémon and you can catch it. Take these Poké Balls!"),
        ], post: [L("narr", "Gotcha! The wild Pidgey was caught!")] },
        { id: "d", type: "chest", name: "Oak's Parcel", reward: { lmd: 1500, rec1: 6, permit: 3 }, pre: [
          L("oak", "You brought my Parcel from the Viridian Poké Mart? Thank you! Ah, my custom Poké Balls."),
          L("oak", "Here is a Pokédex. It records every Pokémon you see and catch. Completing it is my dream! And take a few Safari Balls; the Safari Zone near Fuchsia City is open to visitors."),
        ] },
        { id: "e", type: "battle", name: "Viridian Forest", lv: 6, env: "forest", trainer: TR("Bug Catcher Rick", "bugcatcher", "Hey! You have Pokémon! Come on! Let's battle 'em!", "No! Caterpie can't cut it!"),
          waves: [W("caterpie:6", "weedle:6"), W("metapod:7", "kakuna:7")], pre: [
          L("bug", "Bug Pokémon evolve quickly! Caterpie becomes Metapod and then Butterfree. Did you know?"),
        ] },
        { id: "f", type: "side", name: "Spark in the Forest", lv: 7, env: "forest", wild: 1, catch: "pikachu", waves: [W("pikachu:7!")], pre: [
          L("narr", "Something yellow darts between the trees, crackling with electricity."),
        ], post: [L("narr", "Gotcha! Pikachu was caught! It eyes its Poké Ball suspiciously, but stays by your side.")] },
        { id: "g", type: "battle", name: "Pewter Gym: Camper Liam", lv: 10, env: "gym", trainer: TR("Camper Liam", "camper", "Stop right there! You're light-years from facing Brock!", "Darn! Light-years isn't time... it measures distance!"),
          waves: [W("geodude:10", "sandshrew:11")], pre: [] },
        { id: "h", type: "boss", name: "Brock, the Rock-Solid Leader", lv: 13, env: "gym", badgeWin: 0, reward: { tm: tmId("rocktomb", 3) },
          trainer: TR("Leader Brock", "brock", "I believe in rock-hard defense and determination. Show me your best!", "I took you for granted. As proof of your victory, here's the Boulder Badge!"),
          waves: [W("geodude:12+", "onix:14!")], pre: [
          L("brock", "So, you're here. I'm Brock, Pewter's Gym Leader. My rock-hard willpower is evident even in my Pokémon."),
          L("brock", "Rock-type Pokémon shrug off Normal and Flying moves. Water and Grass, though... we'll see what you brought."),
        ], post: [
          L("brock", "The Boulder Badge raises the Attack of your Pokémon. And with one Badge, they'll grow stronger for you: up to Lv 22."),
          L("brock", "Take this with you, too: TM39, Rock Tomb."),
          L("narr", "The Boulder Badge glints in your Trainer Case. Seven more to go."),
        ] },
      ] },
    { id: "c2", title: "Mt. Moon to Cerulean City", env: "cave", map: "cave", badge: 1, reward: { lmd: 4000, orundum: 300, moonstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "Into Mt. Moon", pre: [
          L("narr", "Mt. Moon. Meteorites fell here long ago, and the cave is said to be home to rare Pokémon."),
          L("hiker", "Watch your step! Zubat swarm in the dark, and the Geodude look just like rocks."),
          L("narr", "Deeper in, men in black uniforms marked with a red R are digging through the rock."),
        ] },
        { id: "b", type: "battle", name: "Mt. Moon B1F", lv: 9, env: "cave", wild: 1, catch: "zubat", waves: [W("zubat:9", "geodude:9", "paras:10")] },
        { id: "c", type: "battle", name: "Team Rocket in the Cave", lv: 12, env: "cave", trainer: TR("Team Rocket Grunt", "teamrocketgruntm", "We're pulling a big job here! Get lost, kid!", "Darn it all! I'm telling the boss!"),
          waves: [W("rattata:12", "zubat:12"), W("ekans:13", "sandshrew:12")], pre: [
          L("grunt", "Team Rocket will find the fossils revived from Mt. Moon's meteorites! They're worth a fortune!"),
        ] },
        { id: "d", type: "side", name: "Clefairy Under the Moon", lv: 12, env: "cave", wild: 1, catch: "clefairy", waves: [W("clefairy:11", "clefairy:12!")], pre: [
          L("narr", "In a hidden chamber, a ring of Clefairy dances around a glowing stone. They notice you."),
        ], post: [L("narr", "Gotcha! A Clefairy was caught! The others scatter, leaving a Moon Stone behind.")] },
        { id: "e", type: "battle", name: "Super Nerd Miguel", lv: 12, env: "cave", trainer: TR("Super Nerd Miguel", "supernerd", "Hey, stop! I found these fossils! They're both mine!", "Okay! I'll share! Take one!"),
          waves: [W("grimer:12", "voltorb:12", "koffing:12")] },
        { id: "f", type: "battle", name: "Nugget Bridge", lv: 17, env: "route", trainer: TR("Blue", "blue", "Yo! You're still struggling along back here?", "Hey! Take it easy! You won already!"),
          rivalWaves: () => [W("pidgeotto:17", "kadabra:16"), W("rattata:15", rivalMon(1) + ":18")], pre: [
          L("blue", "I caught a whole bunch of Pokémon on the way here. Let me show you how strong they are!"),
        ], post: [L("blue", "Hmph! At least you're raising your Pokémon. I'm off to see Bill. Smell ya later!")] },
        { id: "g", type: "battle", name: "Cerulean Gym: Swimmer Luis", lv: 16, env: "sea", weather: "rain", trainer: TR("Swimmer Luis", "swimmerm", "Splash! I'm first up! Let's do it!", "That can't be! I lost!"),
          waves: [W("horsea:16", "shellder:16")] },
        { id: "h", type: "boss", name: "Misty, the Tomboyish Mermaid", lv: 20, env: "sea", weather: "rain", badgeWin: 1, reward: { tm: tmId("waterpulse", 3) },
          trainer: TR("Leader Misty", "misty", "My policy is an all-out offensive with Water-type Pokémon!", "Wow! You're too much! All right, you can have the Cascade Badge.", "great"),
          waves: [W("staryu:18+", "starmie:21!")], pre: [
          L("misty", "Hi, you're a new face! What's your policy on Pokémon? Mine is all-out offense with Water types!"),
          L("narr", "It's raining in the Cerulean Gym. Water-type moves are 50% stronger, and Fire-type moves are weaker."),
        ], post: [L("misty", "The Cascade Badge raises your Pokémon's Sp. Def, and they'll follow you up to Lv 26. And take this: TM03, Water Pulse. Now go! I've got training to do.")] },
      ] },
    { id: "c3", title: "Vermilion City", env: "city", map: "city", badge: 2, reward: { lmd: 5000, orundum: 300, thunderstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "The Pokémaniac's Cottage", pre: [
          L("bill", "Hiya! I'm a Pokémon... No, I'm not! Call me Bill! I'm a true Pokémaniac!"),
          L("bill", "I fused myself with a Pokémon by accident. Help me run the Cell Separation System, would you?"),
          L("narr", "With a whir, Bill steps out of the teleporter, human again."),
          L("bill", "Thanks! Here, take this S.S. Anne ticket. The cruise ship is in Vermilion City; there are Trainers aboard from all over."),
        ] },
        { id: "b", type: "battle", name: "Route 6", lv: 15, env: "route", wild: 1, catch: "meowth", waves: [W("oddish:15", "bellsprout:15"), W("meowth:16", "pidgey:15")] },
        { id: "c", type: "battle", name: "S.S. Anne: Gentleman", lv: 18, env: "sea", trainer: TR("Gentleman Brooks", "gentleman", "Competing against the young keeps me youthful.", "Good fight. Ah, I feel young again!"),
          waves: [W("growlithe:18", "ponyta:18")] },
        { id: "d", type: "battle", name: "S.S. Anne: Rival", lv: 19, env: "sea", reward: { tm: tmId("cut", 3) }, trainer: TR("Blue", "blue", "Bonjour! Are you surprised to see me here?", "Humph! At least you're raising your Pokémon!"),
          rivalWaves: () => [W("pidgeotto:19", "raticate:16"), W("kadabra:18", rivalMon(1) + ":20")], pre: [
          L("blue", "I got an invitation too. Let me check out your Pokémon! I'll show you what a real Trainer does!"),
        ], post: [L("narr", "Up in his cabin, the S.S. Anne's captain is seasick. You rub his back until he feels better, and he thanks you with HM01, Cut.")] },
        { id: "e", type: "side", name: "Diglett's Cave", lv: 19, env: "cave", wild: 1, catch: "diglett", waves: [W("diglett:18", "diglett:18"), W("dugtrio:22!")] },
        { id: "f", type: "battle", name: "Vermilion Gym: Sailor Dwayne", lv: 21, env: "plant", trainer: TR("Sailor Dwayne", "sailor", "This is no place for kids! Prepare to be shocked!", "You're not so bad, kid."),
          waves: [W("pikachu:21", "pikachu:21")] },
        { id: "g", type: "boss", name: "Lt. Surge, the Lightning American", lv: 25, env: "plant", badgeWin: 2, reward: { tm: tmId("shockwave", 3) },
          trainer: TR("Leader Lt. Surge", "ltsurge", "Hey, kid! Electric Pokémon saved me during the war! They'll zap you, just like my enemies!", "Whoa! You're the real deal, kid! Fine then, take the Thunder Badge!", "great"),
          waves: [W("voltorb:25+", "magnemite:25+", "raichu:26!")], pre: [
          L("surge", "Hey, kid! What do you think you're doing here? Ground types don't feel a thing from my Electric attacks, but do you even have one?"),
        ], post: [L("surge", "The Thunder Badge raises your Pokémon's Defense. And they'll listen to you up to Lv 32! Here, kid, take this TM too: TM34, Shock Wave!")] },
      ] },
    { id: "c4", title: "Rock Tunnel to Celadon City", env: "city", map: "city", badge: 3, reward: { lmd: 6000, orundum: 400, leafstone: 1 },
      nodes: [
        { id: "a", type: "story", name: "Rock Tunnel", reward: { tm: tmId("flash", 3) }, pre: [
          L("narr", "Back on Route 2, Professor Oak's aide sees how many kinds of Pokémon you've caught and gives you HM05, Flash."),
          L("narr", "Rock Tunnel is pitch-black. Without Flash, Trainers feel their way along the walls."),
          L("hiker", "Ooh, you sure startled me! You've got Pokémon? Then you know the rules!"),
        ] },
        { id: "b", type: "battle", name: "Rock Tunnel", lv: 21, env: "cave", wild: 1, catch: "machop", waves: [W("geodude:20", "zubat:20"), W("machop:21", "onix:22")] },
        { id: "c", type: "chest", name: "Celadon Mansion", reward: { op: "eevee", lmd: 2000 }, pre: [
          L("narr", "On the top floor of Celadon Mansion, a Poké Ball rests on a table with a note: 'Take good care of me.'"),
          L("narr", "Inside is an Eevee. Its genes are unstable: an evolution stone can turn it into Vaporeon, Jolteon or Flareon."),
        ] },
        { id: "d", type: "battle", name: "Rocket Game Corner", lv: 23, env: "city", trainer: TR("Team Rocket Grunt", "teamrocketgruntm", "I'm guarding this poster! Go away, or else!", "Dang! Our hideout might be discovered!"),
          waves: [W("raticate:22", "golbat:22"), W("koffing:23", "grimer:23")], pre: [
          L("grunt", "There's no hideout behind this poster. Definitely not. Now beat it!"),
        ] },
        { id: "e", type: "boss", name: "Giovanni's Hideout", lv: 26, env: "plant", trainer: TR("Giovanni", "giovanni", "So! I must say, I am impressed you got here!", "WHAT! This can't be!"),
          waves: [W("onix:25+", "rhyhorn:24+", "kangaskhan:29!")], pre: [
          L("giovanni", "Team Rocket captures Pokémon from around the world. They're important tools for keeping our criminal enterprise going."),
          L("giovanni", "I will not tolerate you meddling in my plans. You shall now experience pain!"),
        ], post: [L("giovanni", "I see that you raise Pokémon with utmost care. I shall return to my training. Keep the Silph Scope."), L("narr", "Giovanni leaves behind the Silph Scope. It can see through the ghosts of Lavender Town.")] },
        { id: "f", type: "battle", name: "Celadon Gym: Lass & Beauty", lv: 24, env: "forest", weather: "sun", trainer: TR("Beauty Tamia", "beauty", "Welcome to the Celadon Gym. Mind the flowers!", "Oh! I'm so sorry for my rudeness!"),
          waves: [W("weepinbell:23", "gloom:23"), W("exeggcute:24", "weepinbell:24")] },
        { id: "g", type: "boss", name: "Erika, the Nature-Loving Princess", lv: 33, env: "forest", badgeWin: 3, reward: { tm: tmId("gigadrain", 3) },
          trainer: TR("Leader Erika", "erika", "I am Erika, Leader of Celadon Gym. I teach the art of flower arranging. My Pokémon are of the Grass type.", "Oh! I concede defeat. You are remarkably strong. I must confer upon you the Rainbow Badge.", "great"),
          waves: [W("tangela:33+", "weepinbell:33+", "vileplume:34!")], pre: [
          L("erika", "Hello. Lovely weather, isn't it? It's so pleasant in my greenhouse. Oh, dear... I must have dozed off."),
          L("narr", "Every Pokémon in Erika's greenhouse knows how to put its opponents to sleep. Grass types shrug off Water, Electric and Ground moves."),
        ], post: [L("erika", "The Rainbow Badge raises your Pokémon's Sp. Atk, and they'll follow you up to Lv 44. Please take this as well: TM19, Giga Drain.")] },
      ] },
    { id: "c5", title: "Lavender Town to Fuchsia City", env: "tower", map: "tower", badge: 4, reward: { lmd: 7000, orundum: 400 },
      nodes: [
        { id: "a", type: "story", name: "The Pokémon Tower", pre: [
          L("narr", "Lavender Town. The Pokémon Tower is a resting place for Pokémon that have passed on."),
          L("fuji", "Team Rocket killed a Marowak trying to protect its child. Its spirit cannot rest. And now they hold me prisoner here..."),
          L("narr", "Through the Silph Scope, the shadowy ghosts on the tower stairs take shape."),
        ] },
        { id: "a2", type: "battle", name: "Pokémon Tower: Rival", lv: 25, env: "tower", trainer: TR("Blue", "blue", "Hey! What brings you here? Your Pokémon don't look dead!", "What? You stinker! I took it easy on you, too!"),
          rivalWaves: () => [W("pidgeotto:25", "kadabra:20", champBase()[0] + ":23"), W(champBase()[1] + ":22", rivalMon(1) + ":25!")], pre: [
          L("blue", "I can at least make them faint! Let's go, pal!"),
        ], post: [L("blue", "How's your Pokédex coming? I just caught a Cubone! I can't find the grown-up Marowak yet. Smell ya later!")] },
        { id: "b", type: "battle", name: "Tower Channelers", lv: 25, env: "tower", trainer: TR("Channeler Hope", "channeler", "Be gone... Intruders...", "Wha? Where am I?"),
          waves: [W("gastly:24", "gastly:24"), W("haunter:26", "cubone:25")], pre: [
          L("narr", "Ghost types shrug off Normal and Fighting moves completely. Psychic and Ghost moves hit them hard."),
        ] },
        { id: "c", type: "boss", name: "The Restless Soul", lv: 30, env: "tower", wild: 1, waves: [W("marowak:30!")], pre: [
          L("narr", "Be gone... Be gone..."),
          L("narr", "The ghost is Cubone's mother, Marowak. Calm its spirit so it can rest."),
        ], post: [L("narr", "The Marowak's spirit is calmed. It fades away peacefully."), L("fuji", "Thank you. Take this Poké Flute; its tune can wake even the deepest sleeper.")] },
        { id: "d", type: "side", name: "Snorlax Blocks the Way", lv: 30, env: "route", wild: 1, catch: "snorlax", waves: [W("snorlax:30!")], pre: [
          L("narr", "A sleeping Pokémon blocks the road. It doesn't budge. You play the Poké Flute..."),
          L("narr", "Snorlax woke up! It attacked in a grumpy rage!"),
        ], post: [L("narr", "Gotcha! Snorlax was caught! It went straight back to sleep in its Poké Ball.")] },
        { id: "e", type: "battle", name: "Cycling Road", lv: 29, env: "route", reward: { tm: tmId("fly", 3) }, trainer: TR("Biker Jared", "biker", "We're the toughest bikers on Cycling Road!", "Whoa! You're the real deal!"),
          waves: [W("koffing:28", "grimer:28"), W("weezing:29", "muk:29")], pre: [
          L("narr", "Snorlax is out of the way. In a hidden house off Route 16, a girl gives you HM02, Fly. Cycling Road runs south from the gate."),
        ] },
        { id: "f", type: "chest", name: "The Safari Zone Warden", reward: { permit: 5, rec2: 4, lmd: 3000, tm: [tmId("surf", 3), tmId("strength", 3)] }, pre: [
          L("narr", "Deep in the Safari Zone you reach the Secret House, and its prize is yours: HM03, Surf."),
          L("narr", "The Safari Zone Warden lost his gold teeth somewhere in the park. You find them in the grass."),
          L("narr", "Warden: Thank you! Take HM04, Strength, and some Safari Balls on the house. Rare Pokémon live in my park: Chansey, Kangaskhan, Tauros, Scyther and more."),
        ] },
        { id: "g", type: "battle", name: "Fuchsia Gym: Jugglers", lv: 33, env: "gym", trainer: TR("Juggler Nate", "juggler", "Strength isn't the key for Pokémon. It's strategy!", "Hm? Strategy isn't everything?"),
          waves: [W("hypno:31", "kadabra:31"), W("hypno:33", "hypno:33")] },
        { id: "h", type: "boss", name: "Koga, the Poisonous Ninja Master", lv: 47, env: "gym", badgeWin: 4, reward: { tm: tmId("toxic", 3) },
          trainer: TR("Leader Koga", "koga", "Fwahahaha! A mere child like you dares to challenge me?", "Humph! You have proven your worth! Here, take the Soul Badge.", "ultra"),
          waves: [W("venonat:44+", "venonat:46+"), W("venonat:48+", "venomoth:50!")], pre: [
          L("koga", "I shall show you true terror as a ninja master! You shall feel the despair of poison and sleep techniques!"),
        ], post: [L("koga", "The Soul Badge raises your Pokémon's Speed, and they'll obey you up to Lv 47. Take this TM too: TM06, Toxic. Poison is the ninja's art.")] },
      ] },
    { id: "c6", title: "Saffron City", env: "city", map: "city", badge: 5, reward: { lmd: 8000, orundum: 500, linkcord: 1 },
      nodes: [
        { id: "a", type: "story", name: "Silph Co. Takeover", pre: [
          L("narr", "Team Rocket has taken over Silph Co., the company that makes Poké Balls. They want its newest invention: the Master Ball."),
          L("sci", "Please, help us! They've locked down every floor!"),
        ] },
        { id: "b", type: "battle", name: "Silph Co. Labs", lv: 33, env: "plant", trainer: TR("Scientist Ted", "scientist", "Electricity! It's our future!", "My calculations were off!"),
          waves: [W("magneton:33", "electrode:33"), W("magneton:35", "electrode:35")] },
        { id: "c", type: "chest", name: "Lapras on 7F", reward: { op: "lapras", lmd: 2000 }, pre: [
          L("sci", "Oh, thank you! Team Rocket was going to take this Pokémon. Please, it should be with someone like you. It's a Lapras."),
        ] },
        { id: "d", type: "battle", name: "Silph Co.: Rival", lv: 37, env: "plant", trainer: TR("Blue", "blue", "What kept you? Let's see what you're made of!", "Hah! I was just testing you."),
          // as in Red/Blue and FireRed/LeafGreen: Pidgeot 37, Alakazam 35, his starter fully evolved at 40, and two of Growlithe,
          // Exeggcute and Gyarados by his starter (the same two the Champion has, before they evolve)
          rivalWaves: () => { const [a, b] = champExtras(), c = { arcanine: "growlithe", exeggutor: "exeggcute" }[b] || b; return [W("pidgeot:37", a + ":38", c + ":35"), W("alakazam:35", rivalMon(2) + ":40")]; }, pre: [
          L("blue", "Hah! I knew you'd show up. I'm going to beat you, then the boss!"),
        ] },
        { id: "e", type: "boss", name: "Giovanni at Silph Co.", lv: 40, env: "plant", reward: { gold5: 1 }, trainer: TR("Giovanni", "giovanni", "Ah, you again. It seems you have the gift. Too bad it will be wasted.", "Arrgh! I lost again!?"),
          waves: [W("nidorino:37+", "rhyhorn:37+"), W("kangaskhan:35+", "nidoqueen:41!")], pre: [
          L("giovanni", "The president of Silph and I are discussing a business proposal. A child has no place here."),
        ], post: [L("giovanni", "Blast it all! You ruined our plans for Silph! But Team Rocket will never fall!"), L("sci", "You saved us! I'm Silph's president. Please, take this: the Master Ball, our newest invention. It never fails.")] },
        { id: "f", type: "side", name: "The Fighting Dojo", lv: 36, env: "gym", gift: "hitmonlee", trainer: TR("Karate Master Koichi", "blackbelt", "Hwaah! You're the one who wants to take on our dojo?", "Hwa! Arrgh! Beaten! As a reward, take one of our prized fighters."),
          waves: [W("primeape:32", "machoke:32"), W("primeape:34", "machamp:36!")], post: [L("narr", "The Karate Master gives you Hitmonlee, the Kicking Pokémon.")] },
        { id: "g", type: "battle", name: "Saffron Gym: Psychics", lv: 36, env: "tower", trainer: TR("Psychic Johan", "psychic", "You know that power too!", "I knew it would end like this!"),
          waves: [W("slowpoke:34", "kadabra:34"), W("slowbro:37", "mrmime:36")] },
        { id: "h", type: "boss", name: "Sabrina, the Master of Psychic Pokémon", lv: 50, env: "tower", badgeWin: 5, reward: { tm: tmId("calmmind", 3) },
          trainer: TR("Leader Sabrina", "sabrina", "I had a vision of your arrival! I have had psychic powers since I was a child.", "This loss shocks me! But a loss is a loss. Take the Marsh Badge.", "ultra"),
          waves: [W("abra:50+", "kadabra:50+", "alakazam:50!")], pre: [
          L("sabrina", "I dislike fighting, but if you wish, I will show you my powers!"),
          L("narr", "Psychic types are only weak to Bug and Ghost moves. Dark types don't exist in Kanto yet."),
        ], post: [L("sabrina", "The Marsh Badge makes your Pokémon's Sp. Atk even stronger, and they'll obey up to Lv 52. Take this TM as well: TM04, Calm Mind.")] },
      ] },
    { id: "c7", title: "Cinnabar and the Sevii Islands", env: "sea", map: "sea", badge: 6, reward: { op: "aerodactyl", lmd: 9000, orundum: 500, firestone: 1 },
      nodes: [
        { id: "a", type: "story", name: "Seafoam Islands", pre: [
          L("narr", "You surf south from Fuchsia. The Seafoam Islands are a frozen maze of caves, and something powerful sleeps in their depths."),
        ] },
        { id: "b", type: "battle", name: "Seafoam Caves", lv: 38, env: "ice", weather: "hail", wild: 1, catch: "seel", waves: [W("seel:33", "slowbro:37"), W("cloyster:38", "golduck:38")], pre: [
          L("narr", "Hail falls inside the caves. Every Pokémon that isn't an Ice type loses a little HP each turn."),
        ] },
        { id: "c", type: "side", name: "Articuno", lv: 50, env: "ice", weather: "hail", wild: 1, catch: "articuno", waves: [W("articuno:50!")], pre: [
          L("narr", "A bird of legend spreads wings of ice. The air freezes around Articuno."),
        ], post: [L("narr", "Gotcha! Articuno was caught!")] },
        { id: "d", type: "battle", name: "Pokémon Mansion", lv: 39, env: "volcano", wild: 1, catch: "growlithe", waves: [W("growlithe:35", "ponyta:38", "weezing:38"), W("muk:38", "magmar:40")], pre: [
          L("narr", "A diary in the burnt mansion: 'July 5. We named the newly discovered Pokémon Mew.' ... 'Feb. 6. Mew gave birth. We named the newborn Mewtwo.'"),
        ] },
        { id: "e", type: "chest", name: "The Fossil Lab", reward: { op: "omanyte", lmd: 3000 }, pre: [
          L("sci", "Ah, you have a fossil from Mt. Moon! Leave it with me... There! A Pokémon that lived in ancient seas: Omanyte!"),
          L("sci", "And the Old Amber from Pewter Museum holds the DNA of an ancient flying Pokémon. I'll have that ready when you've earned the Volcano Badge."),
        ] },
        { id: "f", type: "battle", name: "Cinnabar Gym: Super Nerds", lv: 38, env: "volcano", weather: "sun", trainer: TR("Super Nerd Erik", "supernerd", "Do you know how hot Pokémon fire breath can get?", "Yow! Hot, hot, hot!"),
          waves: [W("ninetales:36", "arcanine:36"), W("ninetales:38", "rapidash:40")] },
        { id: "g", type: "boss", name: "Blaine, the Hotheaded Quiz Master", lv: 47, env: "volcano", weather: "sun", badgeWin: 6, reward: { tm: tmId("fireblast", 3) },
          trainer: TR("Leader Blaine", "blaine", "Hah! I am Blaine! I am the Leader of Cinnabar Gym! My fiery Pokémon will incinerate all challengers!", "I have burned down to nothing! Not even ashes remain! You have earned the Volcano Badge!", "ultra"),
          waves: [W("magmar:47+", "rapidash:47+"), W("ninetales:47+", "arcanine:48!")], pre: [
          L("blaine", "Hah! You better have Burn Heal! The sun burns hot in my Gym: Water moves are weaker here."),
        ], post: [L("blaine", "The Volcano Badge heightens the Attack of your Pokémon, and they'll obey you up to Lv 56. Take this TM too: TM38, Fire Blast!"), L("sci", "And here is your Aerodactyl, revived from the Old Amber!")] },
        { id: "h", type: "story", name: "One Island", reward: { tm: tmId("rocksmash", 3) }, pre: [
          L("narr", "Bill is waiting at the Pokémon Center. \"Want to come with me to One Island? My friend Celio is building a machine to link far-off lands.\""),
          L("narr", "Bill hands you a Tri-Pass, and the Seagallop ferry carries you south to the Sevii Islands. Celio asks one favour: take a Meteorite to the Game Corner owner on Two Island."),
          L("narr", "But the owner isn't there. His daughter Lostelle went to pick Berries in the forest on Three Island, and hasn't come back."),
          L("narr", "Before you set off, a man on One Island gives you HM06, Rock Smash."),
        ] },
        { id: "i", type: "side", name: "Mt. Ember: Moltres", lv: 50, env: "volcano", weather: "sun", wild: 1, catch: "moltres", waves: [W("moltres:50!")], pre: [
          L("narr", "Mt. Ember towers over One Island. They say its peak blazes with fire at night. At the summit, Moltres, the legendary bird of fire, spreads its wings."),
        ], post: [L("narr", "Gotcha! Moltres was caught!")] },
        // (FireRed/LeafGreen's Kindle Road and Mt. Ember Trainers, on the way to Moltres: side stages, each a few of them one after another,
        // their teams as FireRed/LeafGreen's; they were the Battle Tower's until 2026-10-16, the owner's pick)
        { id: "l", type: "side", name: "Kindle Road: the Swimmers", lv: 38, env: "sea", trainer: TR("Swimmer Garrett", "kt_swimmer_fr", "The water off Kindle Road is the best in the Sevii Islands! Race you!", "You swim like a Gyarados!"),
          waves: [W("psyduck:35", "psyduck:36", "golduck:37"), W("shellder:35", "cloyster:35", "wartortle:38"), W("seadra:37", "seadra:37", "starmie:38!")], pre: [
          L("narr", "Kindle Road runs north from One Island's harbor to Mt. Ember, half beach and half sea. Swimmers Abigail, Garrett, Maria and Finn want a battle, one after another."),
        ] },
        { id: "m", type: "side", name: "Kindle Road: Fisherman Tommy", lv: 35, env: "sea", trainer: TR("Fisherman Tommy", "kt_fisherman_fr", "Shh! You'll scare the fish! ...Oh, a Trainer? Then let's battle!", "My line snapped!"),
          waves: [W("goldeen:33", "goldeen:33", "seaking:35"), W("seaking:35", "seaking:35!")], pre: [
          L("narr", "A Fisherman sits on Kindle Road's rocks with five Pokémon he's reeled in himself."),
        ] },
        { id: "n", type: "side", name: "Kindle Road: the Campers", lv: 36, env: "route", trainer: TR("Picnicker Claire", "kt_picnicker_fr", "We came to camp by the hot spring! Want to battle us?", "Aww, our picnic is ruined!"),
          waves: [W("meowth:35", "meowth:35", "pikachu:35"), W("clefairy:35", "nidorino:36", "raticate:36"), W("sandslash:36!")], pre: [
          L("narr", "Picnicker Claire and Camper Bryce have pitched a tent near the Ember Spa. They take you on together."),
        ] },
        { id: "o", type: "side", name: "Kindle Road: the Fighters", lv: 39, env: "route", trainer: TR("Crush Kin Mik & Kia", "kt_crushkin_fr", "We train on Kindle Road every day! Show us your strength!", "Our muscles weren't enough..."),
          waves: [W("hitmonlee:38", "hitmonchan:38", "machop:37"), W("machoke:37", "machop:38", "machoke:38"), W("machoke:39", "primeape:39!")], pre: [
          L("narr", "Crush Girl Tanya, Black Belts Hugh and Shea, and the Crush Kin Mik and Kia train along Kindle Road. Each wants a turn."),
        ] },
        { id: "p", type: "side", name: "Mt. Ember: the Trainers", lv: 40, env: "volcano", trainer: TR("Pokémon Ranger Logan", "kt_ranger_fr", "Mt. Ember is no place for the careless. Let's see if you're ready for it.", "You'll be fine up there."),
          waves: [W("bellsprout:38", "gloom:38", "gloom:38"), W("hitmonchan:38", "hitmonchan:38", "mankey:37"), W("primeape:37", "exeggcute:37", "exeggutor:40!")], pre: [
          L("narr", "At the foot of Mt. Ember wait Pokémon Rangers Beth and Logan and the Crush Girls Jocelyn and Sharon, fresh from the Ember Spa."),
        ] },
        { id: "j", type: "battle", name: "Three Island: the Bikers", lv: 39, env: "city", trainer: TR("Cue Ball Paxton", "cueball", "We don't need kids like you on our island!", "We're getting out of here. This island's boring anyway!"),
          waves: [W("koffing:37", "grimer:37", "koffing:38"), W("grimer:38", "weezing:39", "muk:39!")], pre: [
          L("narr", "A gang of Bikers has taken over Three Island. Their leader says you'll have to beat all four of them, one after another."),
        ] },
        { id: "k", type: "battle", name: "Berry Forest: Lostelle", lv: 34, env: "forest", wild: 1, catch: "exeggcute", reward: { held: "iapapaberry" }, waves: [W("gloom:35", "venonat:34", "exeggcute:35"), W("pidgeotto:37", "hypno:30!")], pre: [
          L("narr", "Lostelle is huddled in the deepest part of Berry Forest, too frightened to move. A wild Hypno is swinging its pendulum at her!"),
        ], post: [L("narr", "Lostelle thanks you and gives you an Iapapa Berry. Back on One Island, Celio's machine is working. Bill takes the ferry home with you.")] },
      ] },
    { id: "c8", title: "Viridian City", env: "route", map: "route", badge: 7, reward: { lmd: 10000, orundum: 600 },
      nodes: [
        { id: "a", type: "story", name: "The Last Gym", pre: [
          L("narr", "The Viridian Gym, closed since your journey began, has finally opened its doors. Its Leader has returned."),
        ] },
        { id: "b", type: "side", name: "The Power Plant", lv: 42, env: "plant", wild: 1, catch: "zapdos", waves: [W("magneton:40", "electrode:40", "electabuzz:42"), W("zapdos:50!")], pre: [
          L("narr", "The abandoned Power Plant hums with static. Deep inside, a bird of legend crackles with lightning."),
        ], post: [L("narr", "Gotcha! Zapdos was caught!")] },
        { id: "c", type: "battle", name: "Viridian Gym: Cooltrainers", lv: 41, env: "gym", trainer: TR("Cooltrainer Samuel", "acetrainer", "The Viridian Leader is the strongest in Kanto!", "You're stronger than the Leader thinks!"),
          waves: [W("nidoking:39", "nidoqueen:39"), W("rhyhorn:41", "dugtrio:40")] },
        { id: "d", type: "battle", name: "Route 22: Rival", lv: 47, env: "route", trainer: TR("Blue", "blue", "Hey! I've been looking for you! I already beat every Gym!", "What!? I don't believe it!"),
          rivalWaves: () => [W("pidgeot:47", "rhyhorn:45", champBase()[0] + ":45"), W(champBase()[1] + ":47", "alakazam:50", rivalMon(2) + ":53!")], pre: [
          L("blue", "I'm heading for the Pokémon League. Before that, I'll show you what a real Trainer looks like!"),
        ] },
        { id: "e", type: "boss", name: "Giovanni, Leader of Viridian Gym", lv: 53, env: "gym", badgeWin: 7, reward: { tm: tmId("earthquake", 3) },
          trainer: TR("Leader Giovanni", "giovanni", "Fwahahaha! This is my hideout! I am the leader of Team Rocket, and the Viridian Gym Leader!", "Ha! That was a truly intense fight! You have won! As proof, here is the Earth Badge!", "ultra"),
          waves: [W("dugtrio:50+", "persian:53+", "nidoqueen:53+"), W("nidoking:55+", "rhydon:55!")], pre: [
          L("giovanni", "For our third meeting, I shall battle you with everything I have. Show me the strength that defeated Team Rocket!"),
        ], post: [L("giovanni", "Take this TM: TM26, Earthquake. It is the move of a true Ground-type master."), L("giovanni", "Having lost, I cannot face my underlings. Team Rocket is finished forever. I will dedicate my life to the study of Pokémon."), L("narr", "The Earth Badge! All eight Badges are yours. Your Pokémon will obey you up to Lv 70. The Pokémon League awaits.")] },
      ] },
    { id: "c9", title: "The Pokémon League", env: "plateau", map: "plateau", badge: 8, reward: { lmd: 20000, orundum: 1500, permit: 10 },
      nodes: [
        { id: "a", type: "story", name: "Victory Road", pre: [
          L("narr", "Victory Road: a long cave where only Trainers with all eight Badges may pass. At its end stands the Indigo Plateau."),
        ] },
        { id: "b", type: "battle", name: "Victory Road", lv: 47, env: "cave", weather: "sand", wild: 1, catch: "machoke", waves: [W("machoke:35", "golem:47"), W("golbat:46", "onix:47", "marowak:46")], pre: [
          L("narr", "A sandstorm blows through the cave. Rock, Ground and Steel aside, everyone takes a little damage each turn."),
        ] },
        { id: "d", type: "boss", name: "Elite Four Lorelei", lv: 55, env: "ice",
          trainer: TR("Elite Four Lorelei", "lorelei", "Welcome to the Pokémon League! I am Lorelei of the Elite Four! No one can best me when it comes to icy Pokémon!", "How dare you! ...You're better than I thought. Go on ahead.", "ultra"),
          waves: [W("dewgong:54", "cloyster:53", "slowbro:54"), W("jynx:56", "lapras:56!")], pre: [
          L("lorelei", "Freezing moves are powerful! Your Pokémon will be at my mercy when they are frozen solid!"),
        ] },
        { id: "e", type: "boss", name: "Elite Four Bruno", lv: 56, env: "gym",
          trainer: TR("Elite Four Bruno", "bruno", "I am Bruno of the Elite Four! Through rigorous training, people and Pokémon can become stronger!", "Why? How could I lose?", "ultra"),
          waves: [W("onix:53", "hitmonchan:55", "hitmonlee:55"), W("onix:56", "machamp:58!")], pre: [
          L("bruno", "We will grind you down with our superior power! Hoo hah!"),
        ] },
        { id: "f", type: "boss", name: "Elite Four Agatha", lv: 58, env: "tower",
          trainer: TR("Elite Four Agatha", "agatha", "I am Agatha of the Elite Four! Oak's taken a lot of interest in you, child.", "Oh, my! You're something special, child!", "ultra"),
          waves: [W("gengar:56", "golbat:56", "haunter:55"), W("arbok:58", "gengar:60!")], pre: [
          L("agatha", "That old duff was once tough and handsome. Now he wants to fiddle with his Pokédex! He's wrong. Pokémon are for fighting!"),
        ] },
        { id: "g", type: "boss", name: "Elite Four Lance", lv: 60, env: "plateau",
          trainer: TR("Elite Four Lance", "lance", "I lead the Elite Four. You can call me Lance the dragon Trainer.", "That's it! I hate to admit it, but you are a Pokémon master!", "ultra"),
          waves: [W("gyarados:58", "dragonair:56", "dragonair:56"), W("aerodactyl:60", "dragonite:62!")], pre: [
          L("lance", "Dragons are mystical Pokémon. They're hard to catch and raise, but their powers are superior! Ice is their one great weakness."),
        ] },
        { id: "h", type: "boss", name: "Champion Blue", lv: 63, env: "plateau", champion: 1,
          trainer: TR("Champion Blue", "bluechampion", "Hey! I was looking forward to seeing you here! I'm the most powerful Trainer in the world!", "NO! That can't be! You beat my best! After all that work to become League Champ? My reign is over already?", "ultra"),
          rivalWaves: () => [W("pidgeot:61", "alakazam:59", "rhydon:61"), W(champExtras()[0] + ":61", champExtras()[1] + ":63", rivalMon(2) + ":65!")], pre: [
          L("champ", "While working on my Pokédex, I looked all over for powerful Pokémon. I assembled teams that would beat any Pokémon type."),
          L("champ", "And now I'm the Pokémon League Champion! Do you know what that means? I'll tell you: I am the most powerful Trainer in the world!"),
        ], post: [
          L("oak", "Congratulations! You are the new Pokémon League Champion! You've grown up so much since you first left Pallet Town."),
          L("oak", "Blue... You lost because you forgot to treat your Pokémon with trust and love. Without them, you will never become a Champ again."),
          L("narr", "Your Pokémon are entered into the Hall of Fame. Their level cap keeps rising with the rest of your Journey, and lifts to Lv 100 once it's done."),
        ] },
      ] },
    // FireRed/LeafGreen's post-game (the owner's pick, 2026-10-16): Celio's Network Machine needs the Ruby and the Sapphire. Team Rocket
    // on Mt. Ember and in Icefall Cave, Gideon and the Rocket Warehouse; then Cerulean Cave opens. Its battles were the Battle Tower's
    { id: "c10", title: "The Sevii Islands", env: "sea", map: "sea", badge: 8, reward: { lmd: 15000, orundum: 1000, rec4: 3 },
      nodes: [
        { id: "a", type: "story", name: "Celio's Request", pre: [
          L("narr", "Back from the Indigo Plateau, you find Bill waiting at the Cinnabar Pokémon Center. Celio has been asking for you."),
          L("bill", "Celio's machine links the Sevii Islands with Kanto. Now he wants to link it with Hoenn, far to the south, but it needs two gems: a Ruby and a Sapphire."),
          L("celio", "The Ruby is said to lie deep inside Mt. Ember. Would you find it for me? I can't leave the machine."),
        ] },
        { id: "b", type: "battle", name: "Mt. Ember: Team Rocket", lv: 37, env: "volcano", trainer: TR("Team Rocket Grunt", "kt_grunt_fr", "This mountain's off limits! Team Rocket's digging here!", "Gah! Fine, go dig for it yourself!"),
          waves: [W("cubone:37", "marowak:37", "rattata:35"), W("raticate:35", "sandshrew:35", "sandslash:35!")], pre: [
          L("narr", "Two Team Rocket Grunts guard the way into Mt. Ember. Team Rocket was meant to be finished, but these two are still digging for a treasure."),
        ], post: [
          L("grunt", "The boss is gone, but the warehouse is still there... Goldeen need log. Yes, nah, Chansey."),
          L("narr", "Their muttering sounds like a password. For what, you can't tell yet."),
        ] },
        { id: "c", type: "story", name: "The Ruby Path", pre: [
          L("narr", "Past the grunts, a passage winds down into the heart of the volcano: the Ruby Path. Dotted letters on its walls show the way."),
          L("narr", "At the very bottom, something glows red. The Ruby!"),
          L("celio", "The Ruby! Thank you. Here, let me upgrade your Tri-Pass: with this Rainbow Pass, the ferries will take you to every one of the Sevii Islands."),
          L("celio", "The Sapphire is said to be on Six Island, in a ruin called Dotted Hole."),
        ] },
        { id: "d", type: "battle", name: "Icefall Cave: Team Rocket", lv: 38, env: "cave", reward: { tm: tmId("waterfall", 3) }, trainer: TR("Team Rocket Grunt", "kt_grunt_fr", "A kid? Scram! These Pokémon are worth a fortune!", "Grr... We're leaving!"),
          waves: [W("zubat:38", "zubat:38", "golbat:38!")], pre: [
          L("narr", "On Four Island you meet Lorelei of the Elite Four, home on her island. Team Rocket is in Icefall Cave, catching Pokémon to sell."),
          L("lorelei", "They're after the Pokémon of Icefall Cave. Come with me: together we'll drive them out."),
        ], post: [
          L("lorelei", "Thank you. The Pokémon here will be safe now."),
          L("narr", "Deeper in the cave, by a frozen waterfall, you find HM07, Waterfall."),
        ] },
        { id: "e", type: "story", name: "Dotted Hole: the Sapphire", pre: [
          L("narr", "On Six Island, the ruins of Dotted Hole are sealed with dotted letters. Deep inside, you find the Sapphire."),
          L("narr", "But a man in a lab coat snatches it from your hand: Gideon, a Silph Co. scientist."),
          L("gideon", "Thank you! Team Rocket will pay me well for this. You'll never find their warehouse!"),
          L("narr", "He's gone. The grunts' password must open a warehouse somewhere. Five Island's meadow is the only place left to look."),
        ] },
        { id: "f", type: "battle", name: "Rocket Warehouse", lv: 49, env: "plant", trainer: TR("Team Rocket Grunt", "kt_grunt_fr", "How do you know the password?! Get out of here!", "No! Not our warehouse!"),
          waves: [W("machop:48", "machop:48", "machoke:48"), W("hypno:49", "hypno:49!")], pre: [
          L("narr", "In Five Island's meadow stands a Team Rocket warehouse. You say the password, and the door slides open."),
        ] },
        { id: "g", type: "boss", name: "Rocket Warehouse: the Admins", lv: 54, env: "plant", trainer: TR("Admin Archer", "kt_archer", "Without Giovanni, Team Rocket is still Team Rocket. We will wait for his return.", "Hmph. Team Rocket will rise again, mark my words.", "ultra"),
          // (Archer's Houndoom has no Kanto form, so it's left out, as in the Battle Tower)
          waves: [W("muk:52", "arbok:53", "vileplume:54"), W("golbat:53", "weezing:54!")], pre: [
          L("narr", "Deep in the warehouse, Team Rocket's Admins, Ariana and Archer, stand back to back. They battle you one after the other."),
        ] },
        { id: "h", type: "boss", name: "Rocket Warehouse: Gideon", lv: 46, env: "plant", trainer: TR("Scientist Gideon", "kt_scientist_fr", "You found me? Fine. Silph's finest machines will deal with you!", "No... Take it, take the Sapphire!", "ultra"),
          waves: [W("voltorb:46", "electrode:46", "magnemite:46"), W("magneton:46", "porygon:46!")], pre: [
          L("gideon", "This Sapphire is my ticket out of Silph. Team Rocket pays far better!"),
        ], post: [
          L("narr", "You take the Sapphire back to One Island. Celio sets it beside the Ruby, and his machine hums to life: the Sevii Islands, Kanto and Hoenn are linked."),
          L("celio", "It works! Thank you. Trainers in Hoenn can trade with us now."),
          L("narr", "Back on the mainland, word comes from Cerulean City: the guard at the cave by the Pokémon Center has stepped aside."),
        ] },
      ] },
    { id: "c11", title: "Cerulean Cave", env: "cave", map: "cave", badge: 8, reward: { orundum: 2000, permit: 10, rec4: 5 },
      nodes: [
        { id: "a", type: "story", name: "The Unknown Dungeon", pre: [
          L("narr", "Now that you are Champion, and Celio's machine is running, the guard at Cerulean Cave lets you pass. Only the strongest Pokémon live inside."),
          L("narr", "The deeper you go, the colder the air feels. Something is waiting at the bottom."),
        ] },
        { id: "b", type: "battle", name: "Cerulean Cave 1F", lv: 60, env: "cave", wild: 1, catch: "ditto", waves: [W("ditto:58", "electrode:60", "wigglytuff:60"), W("parasect:60", "alakazam:62", "chansey:62")] },
        { id: "c", type: "battle", name: "Cerulean Cave B1F", lv: 59, env: "cave", wild: 1, waves: [W("raichu:58", "magneton:58", "rhydon:59"), W("marowak:59", "dodrio:60", "machamp:60")] },
        { id: "d", type: "boss", name: "Mewtwo", lv: 70, env: "cave", wild: 1, catch: "mewtwo", waves: [W("mewtwo:70!")], pre: [
          L("narr", "At the bottom of the cave, a Pokémon created by genetic manipulation opens its eyes. Its psychic power fills the chamber."),
          L("narr", "Mewtwo: ..."),
        ], post: [L("narr", "Gotcha! Mewtwo was caught!"), L("narr", "Your Pokédex hums. One Kanto entry is still missing: #151, Mew. Keep an eye on your Mystery Gifts.")] },
      ] },
  ],
}];
// Flatten for lookups. Stage codes: chapter-number-stage (1-1…), side stages S1-1. Each region's Journey is a STORY entry with
// its region's id (REGION_IDS in a6i_servers.js); Kanto's stage codes are bare, every other region's start with its code
// (Johto's "jo1-1", "joS1-1"; its chapters "joc1"), so stage ids never clash (the Journey revamp's region framework)
const REGION_CODE = { kanto: "", johto: "jo", hoenn: "ho", sinnoh: "si", unova: "un", kalos: "ka", alola: "al", galar: "ga", paldea: "pa" };
const NODES = {};
function indexJourney(ep) { const rc = REGION_CODE[ep.id] || ""; ep.chapters.forEach((ch, ci) => {
  let mc = 0, sc = 0;
  ch.no = String(ci + 1); ch.ep = ep; if (rc && !ch.id.startsWith(rc)) ch.id = rc + ch.id;
  ch.nodes.forEach((nd, i) => { nd.id = rc + (nd.type === "side" ? `S${ci + 1}-${++sc}` : `${ci + 1}-${++mc}`); nd.ch = ch; nd.ep = ep; nd.idx = i; nd.env = nd.env || ch.env; NODES[nd.id] = nd; });
}); }
for (const ep of STORY) indexJourney(ep);   // (the other regions' Journeys add themselves: a4b_johto.js)
// a region's Journey (null while it's coming soon), its main stages, its last stage (clearing it completes the Journey), a chapter by id
const journeyOf = id => STORY.find(e => e.id === id) || null;
const journeyMain = id => { const ep = journeyOf(id); return ep ? ep.chapters.flatMap(ch => ch.nodes).filter(nd => nd.type !== "side") : []; };
const journeyEnd = id => { const m = journeyMain(id); return m.length ? m[m.length - 1].id : null; };
// A region whose games tell two stories has a Journey in two parts (the owner's rule, 2026-10-15: Unova's Part 1 is Black/White's
// story, its Part 2 Black 2/White 2's, two years later; both must be beaten). Each chapter has its `part`; each part has its own
// level caps (partCap in a6_state.js), its own eight Badges (PART_BADGES in a2_core.js) and its own starter; Part 2 opens once
// Part 1's last stage is cleared, and the region's Champion title and completion come in Part 2. PART_NAME[id]: what each part is called
const PART_NAME = {};
const ndPart = nd => (nd.ch && nd.ch.part) || 1;
const epParts = ep => ep ? Math.max(1, ...ep.chapters.map(ch => ch.part || 1)) : 1;
const partMain = (ep, part) => ep.chapters.filter(ch => (ch.part || 1) === part).flatMap(ch => ch.nodes).filter(nd => nd.type !== "side");
const partEnd = (ep, part) => { const m = partMain(ep, part); return m.length ? m[m.length - 1] : null; };
// the part of a region's Journey you're on: the first whose last stage you haven't cleared (the last, once every one is)
const regionPart = id => { const ep = journeyOf(id); if (!ep || !S) return 1; for (let p = 1; p < epParts(ep); p++) { const e = partEnd(ep, p); if (e && !nodeStars(e.id)) return p; } return epParts(ep); };
const chapterById = cid => { for (const ep of STORY) for (const ch of ep.chapters) if (ch.id === cid) return ch; return null; };
// the Kanto Journey's last stage (Mewtwo, at the bottom of Cerulean Cave): clearing it completes the Journey
const JOURNEY_END = journeyEnd("kanto");
// (a Journey's first chapter, and the first of each of its parts, where your team is a starter and a catch or two: a Gym Leader's or an
// ace's extra HP is a third of its usual, ×1.25 for an ace instead of ×1.8; the owner's ask, 2026-10-15: no wall before the first Gym)

// (and there, a normal wild stage sends one Pokémon a wave, as the games' wild encounters do, each wave a new battle: the owner's pick,
// 2026-10-15, so a lone Lv 5 starter can win its first route)
const nodeWaves = nd => nd.rivalWaves ? nd.rivalWaves() : nd.waves;
const nodeCost = nd => nd.type === "story" || nd.type === "chest" || nd.chest ? 0 : 5 + Math.floor((nd.lv || 1) / 10) * 2;
// the 3-star turn goal: about four of your turns per opposing Pokémon (three of yours are on the field at once), more for a boss
const nodeTurnGoal = nd => Math.max(8, 4 + 4 * (nd.waves || nd.rivalWaves ? nodeWaves(nd).flat().length : 1)) + (nd.type === "boss" ? 4 : 0);

// =====================================================================
//  EXPLORE · BATTLE TOWER · LINK BATTLES · DAILY RESEARCH · SHOPS
// =====================================================================
// Explore: wild areas to farm evolution stones, Exp. Candy, Seeds of Mastery and held items
const HUNTS = [
  { id: "forest", code: "VF", n: "Viridian Forest", sub: "Grass and Bug Pokémon in the deep woods", env: "forest", stone: "leafstone",
    mobs: ["oddish", "bellsprout", "paras", "caterpie", "weedle", "exeggcute"], boss: ["vileplume", "victreebel", "parasect"], items: ["miracleseed", "silverpowder", "silkscarf", "sharpbeak", "sitrusberry", "lumberry", "kingsrock", "meadowplate", "insectplate", "roseincense", "grassgem", "buggem", "pixieplate", "fairygem", "bigroot", "mentalherb", "grassyseed"] },
  { id: "moon", code: "MM", n: "Mt. Moon", sub: "Where the Moon Stones fall", env: "cave", stone: "moonstone",
    mobs: ["zubat", "geodude", "paras", "clefairy", "sandshrew", "onix"], boss: ["clefable", "golem", "golbat"], items: ["hardstone", "softsand", "scopelens", "brightpowder", "focusband", "stoneplate", "earthplate", "rockincense", "rockgem", "groundgem", "normalgem", "laxincense", "floatstone", "smoothrock"] },
  { id: "plant", code: "PP", n: "Power Plant", sub: "Static in the air, and Thunder Stones on the floor", env: "plant", stone: "thunderstone",
    mobs: ["magnemite", "voltorb", "pikachu", "electabuzz", "grimer"], boss: ["electrode", "raichu", "magneton"], items: ["magnet", "quickclaw", "widelens", "shellbell", "expertbelt", "zapplate", "ironplate", "electricgem", "steelgem", "cellbattery", "electricseed", "metalcoat", "ironball"] },
  { id: "seafoam", code: "SI", n: "Seafoam Islands", sub: "Frozen caves, falling hail", env: "ice", weather: "hail", stone: "waterstone",
    mobs: ["seel", "shellder", "psyduck", "slowpoke", "horsea", "krabby"], boss: ["dewgong", "cloyster", "slowbro"], items: ["mysticwater", "nevermeltice", "leftovers", "wiseglasses", "lumberry", "splashplate", "icicleplate", "seaincense", "waveincense", "watergem", "icegem", "luminousmoss", "absorbbulb", "snowball", "icyrock", "damprock", "mistyseed"] },
  { id: "mansion", code: "PM", n: "Pokémon Mansion", sub: "A burnt laboratory under a scorching sun", env: "volcano", weather: "sun", stone: "firestone",
    mobs: ["growlithe", "ponyta", "vulpix", "koffing", "grimer", "magmar"], boss: ["arcanine", "rapidash", "weezing"], items: ["charcoal", "poisonbarb", "muscleband", "eviolite", "lifeorb", "flameplate", "toxicplate", "firegem", "poisongem", "heatrock", "laggingtail", "fullincense", "stickybarb"] },
  { id: "victory", code: "VR", n: "Victory Road", sub: "A sandstorm and the toughest wild Pokémon", env: "cave", weather: "sand", stone: "linkcord",
    mobs: ["machop", "geodude", "onix", "marowak", "golbat", "kadabra"], boss: ["machamp", "golem", "alakazam"], items: ["blackbelt", "twistedspoon", "spelltag", "dragonfang", "choiceband", "fistplate", "dracoplate", "mindplate", "spookyplate", "dreadplate", "skyplate", "fightinggem", "dragongem", "psychicgem", "ghostgem", "darkgem", "flyinggem", "oddincense", "whiteherb", "psychicseed", "blackglasses", "fairyfeather", "ringtarget"] },
  // kind "candy": Exp. Candy instead of stones and held items (Chansey, whose Lucky Eggs mean more Exp., live in Cerulean Cave)
  { id: "cave", code: "CC", n: "Cerulean Cave", sub: "Chansey and their Lucky Eggs, deep in the cave", env: "cave", kind: "candy", stone: null,
    mobs: ["chansey", "ditto", "wigglytuff", "parasect", "kadabra", "electrode"], boss: ["chansey"], items: [] },
  // kind "money": Poké Dollars (Team Rocket's stash under the Celadon Game Corner, guarded by the Pay Day Pokémon)
  { id: "hideout", code: "RH", n: "Rocket Hideout", sub: "Team Rocket's stash under the Game Corner", env: "plant", kind: "money", stone: null,
    mobs: ["meowth", "rattata", "zubat", "koffing", "ekans", "grimer"], boss: ["persian", "raticate", "arbok"], items: [] },
];
// Every Explore area can be cleared HUNT_TRIES times a day (Quick Battles included); more tries cost Gems, a little more each time
const HUNT_TRIES = 3;
const huntKind = h => h.kind || "evo";
const HUNT_LV = [12, 22, 32, 44, 56, 68];
// chapter backgrounds: each chapter's signature place, from the FireRed/LeafGreen area previews (resources/areas, tools/pack_areas.py)
const CHAPTER_BG = { c1: "viridian-forest", c2: "mt-moon", c3: "digletts-cave", c4: "rock-tunnel", c5: "pokemon-tower", c6: "silph-co",
  c7: "pokemon-mansion", c8: "power-plant", c9: "victory-road", c10: "seafoam-islands", c11: "cerulean-cave" };
// and the Explore areas, each its own place
const HUNT_BG = { forest: "viridian-forest", moon: "mt-moon", plant: "power-plant", seafoam: "seafoam-islands", mansion: "pokemon-mansion", victory: "victory-road",
  cave: "cerulean-cave", hideout: "rocket-hideout" };
const HUNT_COST = [8, 10, 12, 14, 16, 18];
const huntWavesSpec = (h, l) => {
  const lv = HUNT_LV[l - 1], rng = seeded(hash(h.id + l));
  const m = () => h.mobs[Math.floor(rng() * h.mobs.length)];
  return [W(`${m()}:${lv}`, `${m()}:${lv}`, `${m()}:${lv}`), W(`${m()}:${lv}`, `${h.boss[Math.min(h.boss.length - 1, Math.floor((l - 1) / 2))]}:${lv + 3}!`)];
};

// Battle Tower (the owner's rule, 2026-10-15): a wing per region, each holding the canon battles that aren't its Journey's main story
// (other versions' teams, rematches, post-game Trainers, Frontier Brains, Master Trainers), one per floor in level order. A region's wing
// opens with its Journey (towerOpen). Each region's file fills TOWER_WING[id] with { n, t, from, waves, lv?, who?, intro?, lose? } (waves
// may be a function: a rival's team by your starter). The region lock holds here too: a later generation's Pokémon battles as the
// region's own form (Steelix is an Onix in Kanto, ORAS Phoebe's Dusknoir a Dusclops in Hoenn), one with none is left out (regionForm);
// then the house rule grows it (grownAt)
const TOWER_WING = {};
const TOWER_ENV = ["gym", "plateau", "city", "gym", "tower", "plateau"], TOWER_BB = ["tower", "factory", "arcade", "castle", "hall", "tower"];   // (Platinum's Battle Frontier rooms, five floors each)
const wingGen = id => id === "kanto" ? null : REGION_IDS.indexOf(id) + 1;
let BASE_FORM = null;
const baseForm = k => { if (!BASE_FORM) { BASE_FORM = {}; for (const x of OP_KEYS) if (!OPS[x].form && !BASE_FORM[OPS[x].id]) BASE_FORM[OPS[x].id] = x; } return BASE_FORM[OPS[k].id] || k; };
function regionForm(k, g) {
  if (!OPS[k]) return null;
  const ok = x => g ? genOf(x) <= g : kantoMon(x);
  if (ok(k)) return k;
  for (let x = OPS[k].form ? baseForm(k) : OPS[k].from, n = 0; x && OPS[x] && n < 4; x = OPS[x].from, n++) if (ok(x)) return x;
  return null;
}
const TOWER_CACHE = {};
function towerFloors(id, all) {   // (all: with the battles that moved into the Journey, for migrate)
  const key = id + (all ? "+" : "") + ":" + (S ? kantoStarter() + ":" + (regionStarter(id) || "") + ":" + ((myRegions()[id] || {}).starter2 || "") : "");   // (a rival's floors follow your starter there: Silver's; in a Journey's Part 2, its own starter's)
  if (TOWER_CACHE[key]) return TOWER_CACHE[key];
  const g = wingGen(id);
  const list = (TOWER_WING[id] || []).map((x, i) => {
    if (x.moved && !all) return null;
    const waves = (typeof x.waves === "function" ? x.waves() : x.waves).map(w => w.map(s => { const k = regionForm(s.op, g); return k && { ...s, op: grownAt(k, s.LV, g) }; }).filter(Boolean)).filter(w => w.length);
    return waves.length ? { x, i, waves, lv: x.lv || Math.max(...waves.flat().map(s => s.LV)) } : null;
  }).filter(Boolean).sort((a, b) => a.lv - b.lv || a.i - b.i);
  return TOWER_CACHE[key] = list.map((o, j) => {
    const f = j + 1, top = f === list.length, big = f % 5 === 0, blk = Math.floor((f - 1) / 5) % 6;
    return { id: `T${REGION_CODE[id] || ""}${f}`, wing: id, f, lv: o.lv, moved: !!o.x.moved, waves: o.waves, from: o.x.from || "", who: o.x.who || "", top,
      trainer: TR(o.x.n, o.x.t, o.x.intro || "", o.x.lose || "", top || big ? "ultra" : "poke"),
      // (every fifth floor a Safari Ball and Rare Candy; the wing's top floor a Safari Pass, the owner's pick, and more)
      reward: top ? { orundum: 600, free10: 1, rare: 5, lmd: 30000 } : big ? { orundum: 200, permit: 1, rare: 2 } : { orundum: 50, lmd: 1500 + o.lv * 150, ["rec" + Math.min(4, 1 + Math.floor(o.lv / 18))]: 3 },
      env: TOWER_ENV[blk], bb: TOWER_BB[blk], bgm: o.x.bgm, winBgm: o.x.winBgm, lobby: o.x.lobby, winJingle: o.x.winJingle };   // (a floor's own music: Emerald's Frontier Brains)
  });
}
const towerFloor = (id, f) => towerFloors(id)[f - 1];
const towerWings = () => REGION_IDS.filter(id => (TOWER_WING[id] || []).length);
// (a wing opens with its region's Journey: the region you start in, or one you've opened since; Kanto's on saves from before regions)
const towerOpen = id => !!S && (!!(S.regions && S.regions[id]) || (id === "kanto" && !Object.keys(S.regions || {}).length));
const towerOpenWings = () => towerWings().filter(towerOpen);
const towerDone = id => (S && S.towerW && S.towerW[id]) || 0;
const towerLeft = id => towerFloors(id).length - towerDone(id);
const towerCount = ids => (ids || towerWings()).reduce((a, id) => a + towerFloors(id).length, 0);
const towerNext = () => towerOpenWings().find(id => towerLeft(id) > 0) || null;   // (the wing to climb next)
const towerConquered = () => towerOpenWings().length > 0 && towerOpenWings().every(id => towerLeft(id) <= 0);

// Kanto's wing: what the Journey doesn't use (it takes each battle's strongest version's team: the owner's rule). The weaker versions'
// teams where their Pokémon differ (level-only copies left out: FireRed/LeafGreen's Elite Four and Champion, Yellow's and Let's Go's
// Brock), the post-game rematches and FireRed/LeafGreen's later Sevii Islands battles, and Let's Go's Trainers. Where a FireRed/LeafGreen rematch had a Pokémon with no Kanto form, the first battle's
// Pokémon in that place stands in (Lorelei's Piloswine: her Slowbro). Yellow's Blue and his Eevee follow your starter the way Red and
// Blue's does: the evolution with the type advantage (yellowBlue)
const Y = "Yellow", PE = "Let's Go Pikachu/Eevee", FR = "FireRed/LeafGreen";
const yellowBlue = () => ({ bulbasaur: "flareon", charmander: "vaporeon", squirtle: "jolteon" }[kantoStarter()]);
const YB = {   // (Yellow's rival from the Pokémon Tower on, by his Eevee's evolution: Bulbapedia's three teams)
  vaporeon: { tower: ["vulpix:23", "magnemite:22"], silph: ["magneton:35", "ninetales:37"], r22: ["magneton:45", "ninetales:47"], champ: ["ninetales:61", "magneton:63"] },
  jolteon: { tower: ["shellder:23", "vulpix:22"], silph: ["ninetales:35", "cloyster:37"], r22: ["ninetales:45", "cloyster:47"], champ: ["cloyster:61", "ninetales:63"] },
  flareon: { tower: ["magnemite:23", "shellder:22"], silph: ["cloyster:35", "magneton:37"], r22: ["cloyster:45", "magneton:47"], champ: ["magneton:61", "cloyster:63"] },
};
const yb = part => YB[yellowBlue()][part];
TOWER_WING.kanto = [
  // ---- Yellow ----
  { n: "Rival Blue", t: "kt_blue_y", from: Y + ": Oak's Lab", waves: [W("eevee:5!")] },
  { n: "Rival Blue", t: "kt_blue_y", from: Y + ": Route 22", waves: [W("spearow:9", "eevee:8!")] },
  { n: "Rival Blue", t: "kt_blue_y", from: Y + ": Cerulean City", waves: [W("spearow:18", "sandshrew:15"), W("rattata:15", "eevee:17!")] },
  { n: "Rival Blue", t: "kt_blue_y", from: Y + ": S.S. Anne", waves: [W("spearow:19", "rattata:16"), W("sandshrew:18", "eevee:20!")] },
  { n: "Rival Blue", t: "kt_blue_y", from: Y + ": Pokémon Tower", waves: () => [W("fearow:25", "sandshrew:20", yb("tower")[0]), W(yb("tower")[1], "eevee:25!")] },
  { n: "Rival Blue", t: "kt_blue_y", from: Y + ": Silph Co.", waves: () => [W("sandslash:38", yb("silph")[0], yb("silph")[1]), W("kadabra:35", yellowBlue() + ":40!")] },
  { n: "Rival Blue", t: "kt_blue_y", from: Y + ": Route 22", waves: () => [W("sandslash:47", "kadabra:50", "exeggcute:45"), W(yb("r22")[0], yb("r22")[1], yellowBlue() + ":53!")] },
  { n: "Champion Blue", t: "kt_bluechamp_y", from: Y, waves: () => [W("sandslash:61", "alakazam:59", "exeggutor:61"), W(yb("champ")[0], yb("champ")[1], yellowBlue() + ":65!")] },
  { n: "Jessie & James", t: "kt_jj_y", from: Y + ": Mt. Moon", waves: [W("ekans:14", "meowth:14", "koffing:14!")] },
  { n: "Jessie & James", t: "kt_jj_y", from: Y + ": Rocket Hideout", waves: [W("koffing:25", "meowth:25", "ekans:25!")] },
  { n: "Jessie & James", t: "kt_jj_y", from: Y + ": Pokémon Tower", waves: [W("meowth:27", "arbok:27", "weezing:27!")] },
  { n: "Jessie & James", t: "kt_jj_y", from: Y + ": Silph Co.", waves: [W("weezing:31", "arbok:31", "meowth:31!")] },
  { n: "Leader Lt. Surge", t: "kt_surge_y", from: Y, waves: [W("raichu:28!")] },
  { n: "Leader Erika", t: "kt_erika_y", from: Y, waves: [W("tangela:30", "weepinbell:32", "gloom:32!")] },
  { n: "Leader Blaine", t: "kt_blaine_y", from: Y, waves: [W("ninetales:48", "rapidash:50", "arcanine:54!")] },
  { n: "Giovanni", t: "kt_giovanni_y", from: Y + ": Rocket Hideout", waves: [W("onix:25", "rhyhorn:24", "persian:29!")] },
  { n: "Giovanni", t: "kt_giovanni_y", from: Y + ": Silph Co.", waves: [W("nidorino:37", "rhyhorn:37"), W("persian:35", "nidoqueen:41!")] },
  // ---- FireRed/LeafGreen: its Gym Leaders where another version's team is stronger, and the rematches. Its Kindle Road, Mt. Ember,
  // Icefall Cave and Rocket Warehouse battles moved into the Journey (chapter 7's side stages, chapter 10: the owner's pick,
  // 2026-10-16): `moved` keeps them out of the floors, listed so a save's floor count can be migrated ----
  { n: "Leader Lt. Surge", t: "ltsurge", from: FR, waves: [W("voltorb:21", "pikachu:18", "raichu:24!")] },
  { n: "Leader Erika", t: "erika", from: FR, waves: [W("victreebel:29", "tangela:24", "vileplume:29!")] },
  { n: "Leader Koga", t: "koga", from: FR, waves: [W("koffing:37", "muk:39"), W("koffing:37", "weezing:43!")] },
  { n: "Leader Sabrina", t: "sabrina", from: FR, waves: [W("kadabra:38", "mrmime:37"), W("venomoth:38", "alakazam:43!")] },
  { n: "Leader Blaine", t: "blaine", from: FR, waves: [W("growlithe:42", "ponyta:40"), W("rapidash:42", "arcanine:47!")] },
  { n: "Leader Giovanni", t: "giovanni", from: FR, waves: [W("rhyhorn:45", "dugtrio:42", "nidoqueen:44"), W("nidoking:45", "rhydon:50!")] },
  { moved: 1, n: "Swimmer Abigail", t: "kt_swimmerf_fr", from: FR + ": Kindle Road", waves: [W("psyduck:35", "psyduck:36", "golduck:37!")] },
  { moved: 1, n: "Picnicker Claire", t: "kt_picnicker_fr", from: FR + ": Kindle Road", waves: [W("meowth:35", "meowth:35"), W("pikachu:35", "clefairy:35!")] },
  { moved: 1, n: "Crush Girl Tanya", t: "kt_crushgirl_fr", from: FR + ": Kindle Road", waves: [W("hitmonlee:38", "hitmonchan:38!")] },
  { moved: 1, n: "Camper Bryce", t: "kt_camper_fr", from: FR + ": Kindle Road", waves: [W("nidorino:36", "raticate:36", "sandslash:36!")] },
  { moved: 1, n: "Swimmer Garrett", t: "kt_swimmer_fr", from: FR + ": Kindle Road", waves: [W("shellder:35", "cloyster:35", "wartortle:38!")] },
  { moved: 1, n: "Crush Kin Mik & Kia", t: "kt_crushkin_fr", from: FR + ": Kindle Road", waves: [W("machoke:39", "primeape:39!")] },
  { moved: 1, n: "Black Belt Hugh", t: "kt_blackbelt_fr", from: FR + ": Kindle Road", waves: [W("machop:37", "machoke:37!")] },
  { moved: 1, n: "Black Belt Shea", t: "kt_blackbelt_fr", from: FR + ": Kindle Road", waves: [W("machop:38", "machoke:38!")] },
  { moved: 1, n: "Crush Girl Sharon", t: "kt_crushgirl_fr", from: FR + ": Kindle Road", waves: [W("mankey:37", "primeape:37!")] },
  { moved: 1, n: "Swimmer Finn", t: "kt_swimmer_fr", from: FR + ": Kindle Road", waves: [W("starmie:38!")] },
  { moved: 1, n: "Swimmer Maria", t: "kt_swimmerf_fr", from: FR + ": Kindle Road", waves: [W("seadra:37", "seadra:37!")] },
  { moved: 1, n: "Fisherman Tommy", t: "kt_fisherman_fr", from: FR + ": Kindle Road", waves: [W("goldeen:33", "goldeen:33", "seaking:35"), W("seaking:35", "seaking:35!")] },
  { moved: 1, n: "Pokémon Ranger Beth", t: "kt_rangerf_fr", from: FR + ": Mt. Ember", waves: [W("bellsprout:38", "gloom:38", "gloom:38!")] },
  { moved: 1, n: "Crush Girl Jocelyn", t: "kt_crushgirl_fr", from: FR + ": Mt. Ember", waves: [W("hitmonchan:38", "hitmonchan:38!")] },
  { moved: 1, n: "Pokémon Ranger Logan", t: "kt_ranger_fr", from: FR + ": Mt. Ember", waves: [W("exeggcute:37", "exeggutor:40!")] },
  { moved: 1, n: "Team Rocket Grunt", t: "kt_grunt_fr", from: FR + ": Mt. Ember, after the League", waves: [W("cubone:37", "marowak:37!")] },
  { moved: 1, n: "Team Rocket Grunt", t: "kt_grunt_fr", from: FR + ": Mt. Ember, after the League", waves: [W("rattata:35", "raticate:35"), W("sandshrew:35", "sandslash:35!")] },
  { moved: 1, n: "Team Rocket Grunt", t: "kt_grunt_fr", from: FR + ": Icefall Cave", waves: [W("zubat:38", "zubat:38", "golbat:38!")] },
  { moved: 1, n: "Team Rocket Grunt", t: "kt_grunt_fr", from: FR + ": Rocket Warehouse", waves: [W("machop:48", "machop:48", "machoke:48!")] },
  { moved: 1, n: "Team Rocket Grunt", t: "kt_grunt_fr", from: FR + ": Rocket Warehouse", waves: [W("hypno:49", "hypno:49!")] },
  { moved: 1, n: "Scientist Gideon", t: "kt_scientist_fr", from: FR + ": Rocket Warehouse", waves: [W("voltorb:46", "electrode:46", "magnemite:46"), W("magneton:46", "porygon:46!")] },
  { moved: 1, n: "Admin Ariana", t: "kt_ariana", from: FR + ": Rocket Warehouse", waves: [W("muk:52", "arbok:53", "vileplume:54!")] },
  { moved: 1, n: "Admin Archer", t: "kt_archer", from: FR + ": Rocket Warehouse", waves: [W("golbat:53", "weezing:54!", "houndoom:55")] },   // (Houndoom: no Kanto form, left out)
  { n: "Elite Four Lorelei", t: "kt_lorelei_fr", from: FR + " rematch", waves: [W("dewgong:64", "cloyster:63", "slowbro:63"), W("jynx:66", "lapras:66!@cheriberry")] },   // (Piloswine: her Slowbro)
  { n: "Elite Four Bruno", t: "kt_bruno_fr", from: FR + " rematch", waves: [W("steelix:65", "hitmonchan:65", "hitmonlee:65"), W("steelix:66", "machamp:68!@persimberry")] },
  { n: "Elite Four Agatha", t: "kt_agatha_fr", from: FR + " rematch", waves: [W("gengar:66", "crobat:66", "haunter:65"), W("arbok:68", "gengar:70!@chestoberry")] },   // (Misdreavus: her Haunter)
  { n: "Elite Four Lance", t: "kt_lance_fr", from: FR + " rematch", waves: [W("gyarados:68", "dragonite:66", "kingdra:66"), W("aerodactyl:70", "dragonite:72!@persimberry")] },
  { n: "Champion Blue", t: "kt_bluechamp_fr", from: FR + " rematch", waves: () => [W("pidgeot:72", "alakazam:73", "rhydon:72"), W(champExtras()[0] + ":73", champExtras()[1] + ":73", rivalMon(2) + ":75!@sitrusberry")] },   // (Heracross: his Pidgeot; Tyranitar: his Rhydon)
  // ---- Let's Go Pikachu/Eevee ----
  { n: "Rival Trace", t: "kt_trace", from: PE + ": Oak's Lab", waves: [W("pikachu:6!")] },
  { n: "Rival Trace", t: "kt_trace", from: PE + ": Route 22", waves: [W("pidgey:3", "pikachu:7!")] },
  { n: "Rival Trace", t: "kt_trace", from: PE + ": Cerulean City", waves: [W("pidgey:12", "oddish:12", "pikachu:13!")] },
  { n: "Rival Trace", t: "kt_trace", from: PE + ": S.S. Anne", waves: [W("pidgeotto:20", "oddish:20", "pikachu:21!")] },
  { n: "Rival Trace", t: "kt_trace", from: PE + ": Pokémon Tower", waves: [W("pidgeotto:27", "gloom:27", "raichu:28!")] },
  { n: "Rival Trace", t: "kt_trace", from: PE + ": Route 22", waves: [W("pidgeot:50", "vileplume:50"), W("marowak:50", "raichu:51!")] },
  { n: "Champion Trace", t: "kt_trace", from: PE, waves: [W("pidgeot:56", "vileplume:56", "marowak:56"), W("rapidash:56", "slowbro:56", "raichu:57!")] },
  { n: "Champion Trace", t: "kt_trace", from: PE + " rematch", waves: [W("pidgeot:66", "vileplume:66", "marowak:66"), W("rapidash:66", "slowbro:66", "raichu:67!")] },
  { n: "Jessie & James", t: "kt_jj_pe", from: PE + ": Mt. Moon", waves: [W("ekans:12", "koffing:12!")] },
  { n: "Jessie & James", t: "kt_jj_pe", from: PE + ": Rocket Hideout", waves: [W("arbok:32", "weezing:32!")] },
  { n: "Jessie & James", t: "kt_jj_pe", from: PE + ": Pokémon Tower", waves: [W("arbok:34", "weezing:34!")] },
  { n: "Jessie & James", t: "kt_jj_pe", from: PE + ": Silph Co.", waves: [W("arbok:36", "weezing:36!")] },
  { n: "Jessie & James", t: "kt_jj_pe", from: PE + ": Route 17", waves: [W("arbok:52", "weezing:52!")] },
  { n: "Admin Archer", t: "kt_archer", from: PE + ": Rocket Hideout", waves: [W("weezing:33", "golbat:33!")] },
  { n: "Admin Archer", t: "kt_archer", from: PE + ": Silph Co., with a Grunt", waves: [W("electrode:37", "golbat:37", "weezing:37!"), W("muk:34", "raticate:34")] },
  { n: "Admin Archer", t: "kt_archer", from: PE + ": Rocket Hideout, after the League", waves: [W("electrode:54", "golbat:54"), W("magmar:54", "weezing:54!")] },
  { n: "Giovanni", t: "kt_giovanni_pe", from: PE + ": Rocket Hideout", waves: [W("persian:35", "rhyhorn:35!")] },
  { n: "Giovanni", t: "kt_giovanni_pe", from: PE + ": Silph Co.", waves: [W("persian:39", "rhyhorn:39", "nidoqueen:39!")] },
  { n: "Blue", t: "kt_blue_pe", from: PE + ": Silph Co.", waves: [W("exeggutor:38", "charizard:40!")] },
  { n: "Leader Misty", t: "kt_misty_pe", from: PE, waves: [W("psyduck:18", "starmie:19!")] },
  { n: "Leader Koga", t: "kt_koga_pe", from: PE, waves: [W("weezing:43", "muk:43"), W("golbat:43", "venomoth:44!")] },
  { n: "Leader Sabrina", t: "kt_sabrina_pe", from: PE, waves: [W("mrmime:43", "slowbro:43"), W("jynx:43", "alakazam:44!")] },
  { n: "Leader Giovanni", t: "kt_giovanni_pe", from: PE, waves: [W("dugtrio:49", "nidoqueen:49"), W("nidoking:49", "rhydon:50!")] },
  { n: "Elite Four Lorelei", t: "kt_lorelei_pe", from: PE, waves: [W("dewgong:51", "jynx:51", "cloyster:51"), W("slowbro:51", "lapras:52!")] },
  { n: "Elite Four Bruno", t: "kt_bruno_pe", from: PE, waves: [W("onix:52", "hitmonchan:52", "hitmonlee:52"), W("poliwrath:52", "machamp:53!")] },
  { n: "Elite Four Agatha", t: "kt_agatha_pe", from: PE, waves: [W("arbok:53", "gengar:53", "golbat:53"), W("weezing:53", "gengar:54!")] },
  { n: "Elite Four Lance", t: "kt_lance_pe", from: PE, waves: [W("seadra:54", "aerodactyl:54", "gyarados:54"), W("charizard:54", "dragonite:55!")] },
  { n: "Leader Brock", t: "kt_brock_pe", from: PE + " rematch", waves: [W("onix:56", "kabutops:56", "omastar:56"), W("aerodactyl:56", "golem:57!")] },
  { n: "Leader Misty", t: "kt_misty_pe", from: PE + " rematch", waves: [W("golduck:56", "dewgong:56", "vaporeon:56"), W("starmie:56", "gyarados:57!")] },
  { n: "Leader Lt. Surge", t: "kt_surge_pe", from: PE + " rematch", waves: [W("electrode:56", "jolteon:56", "electabuzz:56"), W("magneton:56", "raichu:57!")] },
  { n: "Leader Erika", t: "kt_erika_pe", from: PE + " rematch", waves: [W("tangela:56", "parasect:56", "exeggutor:56"), W("victreebel:56", "vileplume:57!")] },
  { n: "Leader Koga", t: "kt_koga_pe", from: PE + " rematch", waves: [W("tentacruel:56", "weezing:56", "golbat:56"), W("venomoth:56", "muk:57!")] },
  { n: "Leader Sabrina", t: "kt_sabrina_pe", from: PE + " rematch", waves: [W("mrmime:56", "jynx:56", "hypno:56"), W("slowbro:56", "alakazam:57!")] },
  { n: "Leader Blaine", t: "kt_blaine_pe", from: PE + " rematch", waves: [W("magmar:56", "rapidash:56", "ninetales:56"), W("flareon:56", "arcanine:57!")] },
  { n: "Elite Four Lorelei", t: "kt_lorelei_pe", from: PE + " rematch", waves: [W("dewgong:61", "jynx:61", "sandslashalola:61"), W("cloyster:61", "slowbro:61", "lapras:62!")] },
  { n: "Elite Four Bruno", t: "kt_bruno_pe", from: PE + " rematch", waves: [W("onix:62", "hitmonchan:62", "hitmonlee:62"), W("golemalola:62", "poliwrath:62", "machamp:63!")] },
  { n: "Elite Four Agatha", t: "kt_agatha_pe", from: PE + " rematch", waves: [W("arbok:63", "marowakalola:63", "golbat:63"), W("gengar:63", "weezing:63", "gengar:64!")] },
  { n: "Leader Blue", t: "kt_blue_pe", from: PE + ": Viridian Gym, after the League", waves: [W("tauros:66", "alakazam:66", "gyarados:66"), W("exeggutor:66", "aerodactyl:66", "charizard:68!")] },
  { n: "Green", t: "kt_green", from: PE + ": Cerulean Cave", waves: [W("clefable:66", "gengar:66", "victreebel:66"), W("ninetales:66", "kangaskhan:66", "blastoise:68!")] },
  { n: "Red", t: "kt_red_pe", from: PE + ": Indigo Plateau", waves: [W("pikachu:85", "machamp:85", "arcanine:85"), W("lapras:85", "snorlax:85", "venusaur:85!")] },
  // ---- Let's Go's Coach Trainers and Master Trainers (six to a floor, by place) ----
  { n: "Coach Trainer Alemana", t: "kt_coach", from: PE, waves: [W("ditto:49!")] },
  { n: "Coach Trainer Alpesh", t: "kt_coach", from: PE, waves: [W("farfetchd:29", "wigglytuff:30!")] },
  { n: "Coach Trainer Amala", t: "kt_coachf", from: PE, waves: [W("machop:16!")] },
  { n: "Coach Trainer Grantley", t: "kt_coach", from: PE, waves: [W("fearow:40", "beedrill:40", "sandslash:41!")] },
  { n: "Coach Trainer Harjit", t: "kt_coach", from: PE, waves: [W("rhydon:52", "rapidash:52", "dewgong:52"), W("seaking:52", "nidoking:52!")] },
  { n: "Coach Trainer Holly", t: "kt_coachf", from: PE, waves: [W("geodude:28!")] },
  { n: "Coach Trainer Kareem", t: "kt_coach", from: PE, waves: [W("bulbasaur:11!")] },
  { n: "Coach Trainer Leona", t: "kt_coachf", from: PE, waves: [W("machoke:32", "electabuzz:33!")] },
  { n: "Coach Trainer Mable", t: "kt_coachf", from: PE, waves: [W("omastar:44", "kabutops:44", "aerodactyl:45!")] },
  { n: "Coach Trainer Midge", t: "kt_coachf", from: PE, waves: [W("machoke:40", "magmar:41!")] },
  { n: "Coach Trainer Morimoto", t: "kt_coach", from: PE, waves: [W("kangaskhan:54", "flareon:54", "vaporeon:54"), W("jolteon:54", "machamp:54", "dragonite:54!")] },
  { n: "Coach Trainer Oberon", t: "kt_coach", from: PE, waves: [W("meowth:13!")] },
  { n: "Coach Trainer Pam", t: "kt_coachf", from: PE, waves: [W("machoke:44", "jynx:44", "kangaskhan:45!")] },
  { n: "Coach Trainer Priya", t: "kt_coachf", from: PE, waves: [W("butterfree:38", "clefable:39!")] },
  { n: "Coach Trainer Rita", t: "kt_coachf", from: PE, waves: [W("graveler:46", "dugtrio:46", "poliwrath:47!")] },
  { n: "Coach Trainer Ryan", t: "kt_coach", from: PE, waves: [W("primeape:48", "gyarados:48", "arcanine:48"), W("tauros:49!")] },
  { n: "Coach Trainer Tasha", t: "kt_coachf", from: PE, waves: [W("poliwhirl:25", "primeape:26!")] },
  { n: "Coach Trainer Will", t: "kt_coach", from: PE, waves: [W("rattata:21!")] },
  { n: "Coach Trainer Yas", t: "kt_coach", from: PE, waves: [W("jolteon:46", "flareon:47", "vaporeon:46!")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Route 4, Route 14", who: "Lass Rena, Scientist Herbert, Ace Trainer Alvin, Beauty Camille, Youngster Easton, Lass Katrina", waves: [W("bulbasaur:65", "ekans:70", "nidoranm:70"), W("golduck:75", "magikarp:65", "ivysaur:70")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Route 14, Route 23", who: "Lass Satoko, Lass Sal, Ace Trainer Edmund, Ace Trainer Percy, Ace Trainer Carlton, Ace Trainer Jirard", waves: [W("vileplume:75", "venusaur:75", "charizard:75"), W("nidoqueen:75", "nidoking:80", "dratini:65")] },
  { n: "Master Trainers", t: "kt_m_ace", from: PE + ": Celadon Condominiums, Route 10", who: "Ace Trainer Tim, Psychic Rui, Ace Trainer Christopher, Youngster Bret, Psychic Frasier, Scientist Levi", waves: [W("charmander:65", "mrmime:70", "charmeleon:70"), W("rattata:65", "alakazam:80", "electabuzz:75")] },
  { n: "Master Trainers", t: "kt_m_beauty", from: PE + ": Route 12, Route 20", who: "Beauty Suzy, Bird Keeper Wyatt, Lass Vicky, Beauty Lucy, Beauty Evette, Beauty Prita", waves: [W("squirtle:65", "pidgeot:75", "poliwag:65"), W("seadra:75", "goldeen:70", "wartortle:70")] },
  { n: "Master Trainers", t: "kt_m_beauty", from: PE + ": Route 20, Route 18", who: "Beauty Tessa, Scientist Francis, Scientist Melvin, Beauty Rose, Bug Catcher Jake, Bird Keeper Theo", waves: [W("blastoise:80", "tentacool:75", "tentacruel:80"), W("cloyster:75", "caterpie:65", "fearow:80")] },
  { n: "Master Trainers", t: "kt_m_bug", from: PE + ": Route 18, Route 11, Route 2", who: "Bug Catcher Ryouta, Bug Catcher Bryson, Hiker Paul, Black Belt Kano, Bug Catcher Bobby, Bird Keeper Louey", waves: [W("pinsir:75", "metapod:65", "sandshrew:70"), W("primeape:75", "butterfree:75", "pidgey:65")] },
  { n: "Master Trainers", t: "kt_m_bug", from: PE + ": Route 2, Viridian Forest, Route 13, Route 8", who: "Bug Catcher Hans, Bug Catcher Scott, Lass [[Ikue Otani|Ikue]], Bug Catcher Kenny, Beauty Arianna, Bug Catcher Terry", waves: [W("parasect:75", "weedle:65", "pikachu:75"), W("kakuna:65", "seaking:75", "beedrill:75")] },
  { n: "Master Trainers", t: "kt_m_hiker", from: PE + ": Route 8, Route 16, Cerulean City", who: "Hiker Richter, Bird Keeper Howie, Youngster Cid, Ace Trainer Jay, Youngster Denis, Lass Kimberly", waves: [W("cubone:70", "pidgeotto:70", "lickitung:70"), W("snorlax:75", "raticate:75", "poliwhirl:70")] },
  { n: "Master Trainers", t: "kt_m_blackbelt", from: PE + ": Cerulean City, Pewter City", who: "Black Belt Yuen, Bird Keeper Barney, Psychic Avery, Ace Trainer Grayson, Bird Keeper Ralph, Lass Marge", waves: [W("poliwrath:75", "doduo:70", "jynx:75"), W("dragonite:75", "spearow:70", "jigglypuff:70")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Pewter City, Team Rocket Hideout", who: "Lass Emma, Hiker Kenji, Scientist Adam, Youngster Shawn, Scientist Donnie, Hiker Eugine<!--</sic>-->", waves: [W("gloom:70", "kabutops:75", "arbok:75"), W("persian:75", "weezing:75", "rhydon:75")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Pokémon Tower, Route 7", who: "Lass Charlotte, Lass Emily, Psychic Vlad, Lass Hazel, Hiker Benjamin, Ace Trainer Austin", waves: [W("raichu:75", "weepinbell:70", "hypno:75"), W("lapras:75", "sandslash:75", "growlithe:70")] },
  { n: "Master Trainers", t: "kt_m_ace", from: PE + ": Route 3, Underground Path (Rt. 7-8), Saffron City", who: "Ace Trainer Ronnie, Ace Trainer Fred, Ace Trainer Dave, Hiker Jim, Lass Chel, Psychic Jaime", waves: [W("nidoranf:65", "nidorina:70", "nidorino:75"), W("onix:70", "clefairy:70", "kadabra:75")] },
  { n: "Master Trainers", t: "kt_m_ace", from: PE + ": Saffron City, Mt. Moon", who: "Ace Trainer Garret, Ace Trainer Raymond, Lass Alexandra, Bug Catcher Evan, Hiker Colson, Hiker Barnaby", waves: [W("ponyta:70", "rapidash:75", "clefable:80"), W("paras:70", "omanyte:70", "kabuto:70")] },
  { n: "Master Trainers", t: "kt_m_ace", from: PE + ": Route 6, Route 9, Silph Co., Rock Tunnel", who: "Ace Trainer Finn, Ace Trainer Arnold, Lass Yumi, Black Belt Masahiro, Ace Trainer Leopold, Scientist West", waves: [W("vulpix:70", "ninetales:75", "wigglytuff:75"), W("machop:65", "kingler:75", "zubat:70")] },
  { n: "Master Trainers", t: "kt_m_hiker", from: PE + ": Rock Tunnel, Victory Road, Viridian City", who: "Hiker Irwin, Scientist Keaton, Hiker Dillan, Lass Amy, Youngster Ken, Psychic Angelo", waves: [W("geodude:65", "golbat:75", "graveler:70"), W("oddish:65", "meowth:70", "abra:70")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Viridian City, Route 24, Route 15", who: "Lass Hana, Psychic Anton, Bug Catcher Olly, Lass Summer, Bug Catcher Lajos, Bird Keeper Seymour", waves: [W("bellsprout:65", "drowzee:70", "venonat:70"), W("exeggcute:70", "venomoth:75", "dodrio:75")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Route 15, Diglett's Cave, Route 21", who: "Lass Harleen, Bug Catcher Louie, Hiker Colin, Hiker Dexter, Beauty Nicole, Beauty Jill", waves: [W("tangela:75", "scyther:75", "diglett:70"), W("dugtrio:75", "psyduck:70", "slowpoke:70")] },
  { n: "Master Trainers", t: "kt_m_beauty", from: PE + ": Route 21, Route 5, Celadon City", who: "Beauty Haruka, Black Belt Tadashi, Ace Trainer Satch, Lass Dianne, Scientist Cory, Ace Trainer Dominic", waves: [W("slowbro:75", "mankey:70", "arcanine:75"), W("victreebel:75", "grimer:70", "gyarados:75")] },
  { n: "Master Trainers", t: "kt_m_blackbelt", from: PE + ": Fuchsia City, Vermilion City", who: "Black Belt Ryuji, Lass Mizuki, Ace Trainer Mac, Ace Trainer Jaxson, Black Belt Randy, Bird Keeper Moe", waves: [W("machoke:70", "chansey:75", "kangaskhan:75"), W("tauros:75", "machamp:75", "farfetchd:70")] },
  { n: "Master Trainers", t: "kt_m_ace", from: PE + ": Vermilion City, Pewter Museum of Science, Underground Path (Rt. 5-6), Seafoam Islands", who: "Ace Trainer Carl, Hiker Valentino, Hiker Hisato, Scientist Murray, Scientist Julian, Beauty Aina", waves: [W("krabby:70", "golem:75", "aerodactyl:75"), W("magnemite:70", "magneton:75", "seel:70")] },
  { n: "Master Trainers", t: "kt_m_beauty", from: PE + ": Seafoam Islands, Pokémon Mansion, Route 19", who: "Beauty Lois, Ace Trainer Arjun, Scientist Gordon, Ace Trainer Jace, Beauty Shelly", waves: [W("dewgong:75", "dragonair:70", "muk:75"), W("magmar:75", "shellder:70")] },
  { n: "Master Trainers", t: "kt_m_beauty", from: PE + ": Route 19, Lavender Town", who: "Beauty Beverly, Beauty Jo, Psychic Arin, Psychic Danny, Psychic Ross", waves: [W("horsea:70", "staryu:70", "gastly:70"), W("haunter:75", "gengar:80")] },
  { n: "Master Trainers", t: "kt_m_hiker", from: PE + ": Lavender Town, Power Plant, Route 17", who: "Hiker Julius, Scientist Humphrey, Scientist Elton, Scientist Albert, Hiker Farkas", waves: [W("marowak:75", "voltorb:70", "electrode:75"), W("koffing:70", "rhyhorn:70")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Route 17, Cinnabar Island, Fighting Dojo, Route 25", who: "Lass [[Aoi Yūki|Aoi]], Lass Cindy, Black Belt Cheng, Black Belt Wong, Psychic Harrison", waves: [W("eevee:75", "exeggutor:75", "hitmonlee:75"), W("hitmonchan:75", "starmie:75")] },
  { n: "Master Trainers", t: "kt_m_lass", from: PE + ": Celadon Department Store, Rocket Game Corner, Cinnabar Lab", who: "Lass Yue, Scientist Alphonse, Ace Trainer Dax, Scientist Jordan, Hiker Lionel", waves: [W("vaporeon:75", "jolteon:75", "flareon:75"), W("porygon:70", "omastar:75")] },
];

// Link Battles: Trainers from around Kanto
const ARENA_N1 = ["Ash", "Gary", "May", "Dawn", "Cilan", "Iris", "Serena", "Clemont", "Hau", "Lillie", "Hop", "Marnie", "Nemona", "Arven", "Penny", "Wally", "Barry", "Bianca", "Cheren", "Shauna", "Tierno", "Bede", "Kieran", "Carmine"];
const ARENA_CLS = [["Ace Trainer", "acetrainer"], ["Ace Trainer", "acetrainerf"], ["Pokémon Breeder", "pokemonbreeder"], ["Pokémon Ranger", "pokemonranger"], ["Psychic", "psychicf"], ["Black Belt", "blackbelt"],
  ["Battle Girl", "battlegirl"], ["Bird Keeper", "birdkeeper"], ["Swimmer", "swimmerf"], ["Hiker", "hiker"], ["Juggler", "juggler"], ["Rocker", "rocker"], ["Pokéfan", "pokefan"], ["School Kid", "schoolkid"],
  ["Twins", "twins"], ["Tuber", "tuber"], ["Dragon Tamer", "dragontamer"], ["Gamer", "gamer"], ["Hex Maniac", "hexmaniac"], ["Collector", "collector"]];

// Daily Research (resets every day)
const DAILIES = [
  { id: "clear", n: "Win 3 battles", goal: 3, reward: { orundum: 60, lmd: 2000 } },
  { id: "sanity", n: "Use 60 PP", goal: 60, reward: { orundum: 60, rec1: 3 } },
  { id: "hh", n: "Catch a Pokémon in the Safari Zone", goal: 1, reward: { orundum: 80 } },
  { id: "upgrade", n: "Train, evolve or master moves 3 times", goal: 3, reward: { rec2: 3 } },
  { id: "arena", n: "Win a Ranked Battle or Link Battle", goal: 1, reward: { tokens: 30, orundum: 40 } },
  { id: "rune", n: "Land 10 super-effective hits", goal: 10, reward: { lmd: 3000, summ: 1 } },
];
const DAILY_ALL = { permit: 1 };
// Shops: currency per tab
const SHOP = {
  mart: { n: "Poké Mart", cur: "lmd", items: [
    { id: "m_c1", n: "Exp. Candy S ×5", cost: 1000, give: { rec1: 5 } },
    { id: "m_c2", n: "Exp. Candy M ×3", cost: 2400, give: { rec2: 3 } },
    { id: "m_c3", n: "Exp. Candy L", cost: 3600, give: { rec3: 1 } },
    { id: "m_rare", n: "Rare Candy", cost: 4800, give: { rare: 1 } },
    { id: "m_seed", n: "Seed of Mastery", cost: 3000, give: { summ: 1 } },
    { id: "m_fire", n: "Fire Stone", cost: 6000, give: { firestone: 1 } },
    { id: "m_water", n: "Water Stone", cost: 6000, give: { waterstone: 1 } },
    { id: "m_thunder", n: "Thunder Stone", cost: 6000, give: { thunderstone: 1 } },
    { id: "m_leaf", n: "Leaf Stone", cost: 6000, give: { leafstone: 1 } },
    { id: "m_moon", n: "Moon Stone", cost: 9000, give: { moonstone: 1 } },
    { id: "m_cord", n: "Linking Cord", cost: 12000, give: { linkcord: 1 }, need: "linkcord" },
    // the other regions' stones and the Soothe Bell (friendship), then the items the rest evolve with
    { id: "m_sun", n: "Sun Stone", cost: 6000, give: { sunstone: 1 }, need: "evostones" },
    { id: "m_ice", n: "Ice Stone", cost: 6000, give: { icestone: 1 }, need: "evostones" },
    { id: "m_oval", n: "Oval Stone", cost: 6000, give: { ovalstone: 1 }, need: "evostones" },
    { id: "m_shiny", n: "Shiny Stone", cost: 9000, give: { shinystone: 1 }, need: "evostones" },
    { id: "m_dusk", n: "Dusk Stone", cost: 9000, give: { duskstone: 1 }, need: "evostones" },
    { id: "m_dawn", n: "Dawn Stone", cost: 9000, give: { dawnstone: 1 }, need: "evostones" },
    { id: "m_soothe", n: "Soothe Bell", cost: 9000, give: { soothebell: 1 }, need: "evostones" },
    ...["dragonscale", "upgrade", "dubiousdisc", "protector", "electirizer", "magmarizer", "reapercloth", "deepseatooth", "deepseascale", "prismscale"]
      .map(k => ({ id: "m_" + k, n: ITEMS[k].n, cost: 12000, give: { [k]: 1 }, need: "linkcord" })),
    ...EVO_HELD.map(k => ({ id: "m_evo_" + k, n: HELD[k].n, cost: 12000, give: { held: k }, need: "linkcord", evo: 1 })),
    // Kalos to Paldea: the everyday ones with the other regions' stones, the rare ones with the Linking Cord
    ...["sachet", "whippeddream", "strawberrysweet", "tartapple", "sweetapple", "syrupyapple", "crackedpot", "unremarkableteacup"].map(k => ({ id: "m_" + k, n: ITEMS[k].n, cost: 9000, give: { [k]: 1 }, need: "evostones" })),
    ...["galaricacuff", "galaricawreath", "scrollofdarkness", "scrollofwaters", "blackaugurite", "peatblock", "auspiciousarmor", "maliciousarmor", "leaderscrest", "metalalloy", "gimmighoulcoin"].map(k => ({ id: "m_" + k, n: ITEMS[k].n, cost: 15000, give: { [k]: 1 }, need: "linkcord" })),
    { id: "m_sitrus", n: "Sitrus Berry", cost: 2500, give: { held: "sitrusberry" } },
    { id: "m_lum", n: "Lum Berry", cost: 2500, give: { held: "lumberry" } },
  ] },
  tm: { n: "TMs", cur: "lmd", items: [] },   // six at a time from tmStock() (a6_state.js), drawn by tmShopHTML
  prize: { n: "Prize Corner", cur: "cert", items: [
    { id: "p_abra", n: "Abra", cost: 40, give: { op: "abra" } },
    { id: "p_clefairy", n: "Clefairy", cost: 60, give: { op: "clefairy" } },
    { id: "p_nidorina", n: "Nidorina", cost: 80, give: { op: "nidorina" } },
    { id: "p_dratini", n: "Dratini", cost: 200, give: { op: "dratini" } },
    { id: "p_scyther", n: "Scyther", cost: 260, give: { op: "scyther" } },
    { id: "p_pinsir", n: "Pinsir", cost: 260, give: { op: "pinsir" } },
    { id: "p_porygon", n: "Porygon", cost: 320, give: { op: "porygon" } },
    { id: "p_permit", n: "Safari Ball", cost: 25, give: { permit: 1 } },
  ] },
  bp: { n: "BP Exchange", cur: "tokens", items: [
    { id: "b_left", n: "Leftovers", cost: 160, give: { held: "leftovers" } },
    { id: "b_band", n: "Choice Band", cost: 260, give: { held: "choiceband" } },
    { id: "b_specs", n: "Choice Specs", cost: 260, give: { held: "choicespecs" } },
    { id: "b_scarf", n: "Choice Scarf", cost: 260, give: { held: "choicescarf" } },
    { id: "b_orb", n: "Life Orb", cost: 260, give: { held: "lifeorb" } },
    { id: "b_vest", n: "Assault Vest", cost: 220, give: { held: "assaultvest" } },
    { id: "b_belt", n: "Expert Belt", cost: 180, give: { held: "expertbelt" } },
    { id: "b_ball", n: "Light Ball", cost: 200, give: { held: "lightball" } },
    { id: "b_club", n: "Thick Club", cost: 200, give: { held: "thickclub" } },
    { id: "b_punch", n: "Lucky Punch", cost: 160, give: { held: "luckypunch" } },
    { id: "b_leek", n: "Leek", cost: 160, give: { held: "leek" } },
    { id: "b_powder", n: "Metal Powder", cost: 160, give: { held: "metalpowder" } },
  ] },
  gems: { n: "Gem Shop", cur: "orundum", items: [
    { id: "g_ball1", n: "Safari Ball", cost: 600, give: { permit: 1 } },
    { id: "g_ball10", n: "Safari Ball ×10", cost: 6000, give: { permit: 10 } },
    { id: "g_elixir", n: "Max Elixir", cost: 180, give: { prime: 1 } },
  ] },
  elixir: { n: "Max Elixir", cur: "prime", hidden: 1, items: [{ id: "e_pp", n: "Restore PP", d: "Refill your PP to max", cost: 1, give: { sanityMax: 1 } }] },
};
// the rest of the held items: Berries at the Poké Mart, battle items at the BP Exchange (price by tier); then the Mints, and the
// Ability Capsule and Ability Patch (both used from a Pokémon's Summary)
for (const [k, h] of Object.entries(HELD)) {
  if (h.src === "mart" && !SHOP.mart.items.some(x => x.give.held === k)) SHOP.mart.items.push({ id: "m_" + k, n: h.n, cost: [0, 1500, 3500, 6000][h.t], give: { held: k } });
  if (h.src === "bp" && !SHOP.bp.items.some(x => x.give.held === k)) SHOP.bp.items.push({ id: "b_" + k, n: h.n, cost: [0, 100, 160, 240][h.t], give: { held: k } });
}
for (const n of MINT_NATURES) SHOP.mart.items.push({ id: "m_mint_" + n, n: ITEMS["mint_" + n].n, cost: 10000, give: { ["mint_" + n]: 1 } });
SHOP.bp.items.splice(1, 0, { id: "b_capsule", n: "Ability Capsule", cost: 150, give: { abilitycapsule: 1 } }, { id: "b_patch", n: "Ability Patch", cost: 400, give: { abilitypatch: 1 } });
// Heart Scales, for the Move Tutor (once it opens)
SHOP.mart.items.push({ id: "m_heartscale", n: "Heart Scale", cost: 5000, give: { heartscale: 1 }, need: "tutor" });
SHOP.bp.items.splice(3, 0, { id: "b_heartscale", n: "Heart Scale", cost: 40, give: { heartscale: 1 }, need: "tutor" });
// what a shop shows right now: an item with `need` waits for that feature (FEATURES in a6_state.js)
const shopItems = sh => sh.items.filter(it => !it.need || featOn(it.need));
// the heading a shop item sits under (the evolution stones and the Linking Cord have their own: Evolution items)
const shopSec = it => { const k = Object.keys(it.give)[0], v = it.give[k];
  return STONES.includes(k) || it.evo ? "Evolution items" : k === "held" ? (HELD[v].berry || v === "berryjuice" ? "Berries" : "Held items") : k.startsWith("mint_") ? "Mints" : k.startsWith("ability") ? "Ability items" : k === "op" ? "Pokémon" : "Items"; };

// ---------- the regions: Kanto's Journey, and the others' coming soon ----------
// Kanto's card for choosing a region (the others are REGIONS_SOON below): its Professor and town, its starters
const REGION_KANTO = { id: "kanto", n: "Kanto", prof: ["Prof. Oak", "oak"], town: "Pallet Town", starters: STARTERS, col: "#d84a3a",
  gymTypes: ["Rock", "Water", "Electric", "Grass", "Poison", "Psychic", "Fire", "Ground"] };
// the types of a region's Gyms (or trials), in order
const gymTypesOf = id => { const r = regionCard(id); return r.gymTypes || r.gyms.map(g => g[1]); };
const regionCard = id => id === "kanto" ? REGION_KANTO : REGIONS_SOON.find(r => r.id === id);
const regionStarters = id => (regionCard(id) || REGION_KANTO).starters;
// The regions whose Journeys are still coming: each one's Journey, Gyms and places come later. Each: its Professor and starting town, the three starters, the eight Gyms in order [Leader, type, Badge, picture],
// the Elite Four and the Champion, and the places to Explore. Pictures: rg_<key> in tools/trainer_sprites.json.
const REGIONS_SOON = [
  { id: "johto", n: "Johto", prof: ["Prof. Elm", "elm"], town: "New Bark Town", starters: ["chikorita", "cyndaquil", "totodile"], col: "#c8a03a",
    gyms: [["Falkner", "Flying", "Zephyr Badge", "falkner"], ["Bugsy", "Bug", "Hive Badge", "bugsy"], ["Whitney", "Normal", "Plain Badge", "whitney"],
      ["Morty", "Ghost", "Fog Badge", "morty"], ["Chuck", "Fighting", "Storm Badge", "chuck"], ["Jasmine", "Steel", "Mineral Badge", "jasmine"],
      ["Pryce", "Ice", "Glacier Badge", "pryce"], ["Clair", "Dragon", "Rising Badge", "clair"]],
    e4: [["Will", "will"], ["Koga", "koga"], ["Bruno", "bruno"], ["Karen", "karen"]], champ: ["Lance", "lance2"],
    areas: ["Sprout Tower", "Union Cave", "Slowpoke Well", "Ilex Forest", "National Park", "Burned Tower", "Whirl Islands", "Mt. Mortar", "Ice Path", "Dragon's Den", "Mt. Silver"] },
  { id: "hoenn", n: "Hoenn", prof: ["Prof. Birch", "birch"], town: "Littleroot Town", starters: ["treecko", "torchic", "mudkip"], col: "#3aa86a",
    gyms: [["Roxanne", "Rock", "Stone Badge", "roxanne"], ["Brawly", "Fighting", "Knuckle Badge", "brawly"], ["Wattson", "Electric", "Dynamo Badge", "wattson"],
      ["Flannery", "Fire", "Heat Badge", "flannery"], ["Norman", "Normal", "Balance Badge", "norman"], ["Winona", "Flying", "Feather Badge", "winona"],
      ["Tate & Liza", "Psychic", "Mind Badge", "tateliza"], ["Juan", "Water", "Rain Badge", "juan"]],
    e4: [["Sidney", "sidney"], ["Phoebe", "phoebe"], ["Glacia", "glacia"], ["Drake", "drake"]], champ: ["Wallace", "wallace"],
    areas: ["Petalburg Woods", "Granite Cave", "Fiery Path", "Mt. Chimney", "Meteor Falls", "Shoal Cave", "Seafloor Cavern", "Sky Pillar", "Victory Road"] },
  { id: "sinnoh", n: "Sinnoh", prof: ["Prof. Rowan", "rowan"], town: "Twinleaf Town", starters: ["turtwig", "chimchar", "piplup"], col: "#5a7ae0",
    gyms: [["Roark", "Rock", "Coal Badge", "roark"], ["Gardenia", "Grass", "Forest Badge", "gardenia"], ["Maylene", "Fighting", "Cobble Badge", "maylene"],
      ["Crasher Wake", "Water", "Fen Badge", "crasherwake"], ["Fantina", "Ghost", "Relic Badge", "fantina"], ["Byron", "Steel", "Mine Badge", "byron"],
      ["Candice", "Ice", "Icicle Badge", "candice"], ["Volkner", "Electric", "Beacon Badge", "volkner"]],
    e4: [["Aaron", "aaron"], ["Bertha", "bertha"], ["Flint", "flint"], ["Lucian", "lucian"]], champ: ["Cynthia", "cynthia"],
    areas: ["Oreburgh Mine", "Eterna Forest", "Mt. Coronet", "Great Marsh", "Old Chateau", "Iron Island", "Lake Acuity", "Stark Mountain"] },
  // (Unova's Journey has two parts, PART_NAME: Black/White's story, then Black 2/White 2's; gyms2: Part 2's. Part 1's Opelucid Leader is
  // Drayden, Black's side: the owner's pick. The Champion is Part 2's, Iris)
  { id: "unova", n: "Unova", prof: ["Prof. Juniper", "juniper"], town: "Nuvema Town", starters: ["snivy", "tepig", "oshawott"], col: "#7a7a8a",
    gyms: [["Cilan, Chili & Cress", "Grass", "Trio Badge", "cilan"], ["Lenora", "Normal", "Basic Badge", "lenora"], ["Burgh", "Bug", "Insect Badge", "burgh"],
      ["Elesa", "Electric", "Bolt Badge", "elesa"], ["Clay", "Ground", "Quake Badge", "clay"], ["Skyla", "Flying", "Jet Badge", "skyla"],
      ["Brycen", "Ice", "Freeze Badge", "brycen"], ["Drayden", "Dragon", "Legend Badge", "drayden"]],
    gyms2: [["Cheren", "Normal", "Basic Badge", "un_cheren2"], ["Roxie", "Poison", "Toxic Badge", "un_roxie"], ["Burgh", "Bug", "Insect Badge", "burgh"],
      ["Elesa", "Electric", "Bolt Badge", "un_elesa2"], ["Clay", "Ground", "Quake Badge", "clay"], ["Skyla", "Flying", "Jet Badge", "skyla"],
      ["Drayden", "Dragon", "Legend Badge", "drayden"], ["Marlon", "Water", "Wave Badge", "un_marlon"]],
    e4: [["Shauntal", "shauntal"], ["Grimsley", "grimsley"], ["Caitlin", "caitlin"], ["Marshal", "marshal"]], champ: ["Iris", "un_iris2"],
    areas: ["Pinwheel Forest", "Desert Resort", "Relic Castle", "Chargestone Cave", "Twist Mountain", "Dragonspiral Tower", "Giant Chasm", "Victory Road"] },
  { id: "kalos", n: "Kalos", prof: ["Prof. Sycamore", "sycamore"], town: "Vaniville Town", starters: ["chespin", "fennekin", "froakie"], col: "#3a7ad8",
    gyms: [["Viola", "Bug", "Bug Badge", "viola"], ["Grant", "Rock", "Cliff Badge", "grant"], ["Korrina", "Fighting", "Rumble Badge", "korrina"],
      ["Ramos", "Grass", "Plant Badge", "ramos"], ["Clemont", "Electric", "Voltage Badge", "clemont"], ["Valerie", "Fairy", "Fairy Badge", "valerie"],
      ["Olympia", "Psychic", "Psychic Badge", "olympia"], ["Wulfric", "Ice", "Iceberg Badge", "wulfric"]],
    e4: [["Malva", "malva"], ["Siebold", "siebold"], ["Wikstrom", "wikstrom"], ["Drasna", "drasna"]], champ: ["Diantha", "diantha"],
    areas: ["Santalune Forest", "Connecting Cave", "Glittering Cave", "Reflection Cave", "Frost Cavern", "Lost Hotel", "Terminus Cave", "Pokémon Village", "Victory Road"] },
  // (Alola has the island challenge instead of Gyms: the Trial Captains' trials and each island kahuna's grand trial, a stamp for each,
  // twelve in Ultra Sun and Ultra Moon's order, ALOLA_BADGES in a4g_alola.js; Kukui founded its League, and its first Champion battle
  // is with Hau, the Journey's base story: the owner's pick)
  { id: "alola", n: "Alola", prof: ["Prof. Kukui", "kukui"], town: "Hau'oli Outskirts", starters: ["rowlet", "litten", "popplio"], col: "#e8902e", gymLabel: "Island challenge", challenge: "the island challenge's twelve trials",
    champLabel: "the first Champion battle, with Hau", leagueLabel: "Elite Four and the first Champion battle",
    gyms: [["Ilima", "Normal", "Verdant Cavern Stamp", "ilima"], ["Hala", "Fighting", "Melemele Stamp", "hala"], ["Lana", "Water", "Brooklet Hill Stamp", "lana"], ["Kiawe", "Fire", "Wela Volcano Stamp", "kiawe"],
      ["Mallow", "Grass", "Lush Jungle Stamp", "mallow"], ["Olivia", "Rock", "Akala Stamp", "olivia"], ["Sophocles", "Electric", "Hokulani Stamp", "sophocles"], ["Acerola", "Ghost", "Thrifty Megamart Stamp", "acerola"],
      ["Nanu", "Dark", "Ula'ula Stamp", "nanu"], ["Vast Poni Canyon", "Dragon", "Vast Poni Stamp", "al_trialguide"], ["Mina", "Fairy", "Seafolk Stamp", "mina"], ["Hapu", "Ground", "Poni Stamp", "hapu"]],
    e4: [["Molayne", "al_molayne"], ["Olivia", "olivia"], ["Acerola", "acerola"], ["Kahili", "kahili"]], champ: ["Hau", "al_hau"],
    areas: ["Verdant Cavern", "Ten Carat Hill", "Brooklet Hill", "Wela Volcano Park", "Lush Jungle", "Haina Desert", "Mount Lanakila", "Vast Poni Canyon", "Poni Plains"] },
  // (Galar has no Elite Four: after the eight Gyms, the Champion Cup, its semifinals and Finals. Its Journey is Sword's side, the owner's
  // pick: Bea and Gordie are the Gyms, Shield's Allister and Melony side stages beside them, a4h_galar.js)
  { id: "galar", n: "Galar", prof: ["Prof. Magnolia", "magnolia"], town: "Postwick", starters: ["grookey", "scorbunny", "sobble"], col: "#c8325a", e4Label: "Champion Cup and Champion",
    gyms: [["Milo", "Grass", "Grass Badge", "milo"], ["Nessa", "Water", "Water Badge", "nessa"], ["Kabu", "Fire", "Fire Badge", "kabu"],
      ["Bea", "Fighting", "Fighting Badge", "bea"], ["Opal", "Fairy", "Fairy Badge", "opal"], ["Gordie", "Rock", "Rock Badge", "gordie"],
      ["Piers", "Dark", "Dark Badge", "piers"], ["Raihan", "Dragon", "Dragon Badge", "raihan"]],
    e4: [["Marnie", "marnie"], ["Hop", "hop"], ["Bede", "bede"], ["Nessa", "nessa"], ["Bea", "bea"], ["Raihan", "raihan"]], champ: ["Leon", "leon"],
    areas: ["Slumbering Weald", "Wild Area", "Galar Mine", "Glimwood Tangle", "Route 9", "Energy Plant", "Isle of Armor", "Crown Tundra"] },
  // (Paldea's Journey is Scarlet's side, the owner's pick, 2026-10-16: Professor Sada, a4i_paldea.js; its Gym Badges are named by type,
  // as in Scarlet and Violet; Geeta is the Top Champion)
  { id: "paldea", n: "Paldea", prof: ["Prof. Sada", "sada"], town: "Cabo Poco", starters: ["sprigatito", "fuecoco", "quaxly"], col: "#d8402e", champLabel: "Top Champion Geeta",
    gyms: [["Katy", "Bug", "Bug Badge", "katy"], ["Brassius", "Grass", "Grass Badge", "brassius"], ["Iono", "Electric", "Electric Badge", "iono"],
      ["Kofu", "Water", "Water Badge", "kofu"], ["Larry", "Normal", "Normal Badge", "larry"], ["Ryme", "Ghost", "Ghost Badge", "ryme"],
      ["Tulip", "Psychic", "Psychic Badge", "tulip"], ["Grusha", "Ice", "Ice Badge", "grusha"]],
    e4: [["Rika", "rika"], ["Poppy", "poppy"], ["Larry", "larry"], ["Hassel", "hassel"]], champ: ["Geeta", "geeta"],
    areas: ["South Province", "Tagtree Thicket", "Asado Desert", "Glaseado Mountain", "Casseroya Lake", "Area Zero", "Kitakami", "Blueberry Academy"] },
];
