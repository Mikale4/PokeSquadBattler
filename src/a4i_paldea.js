// =====================================================================
//  PALDEA JOURNEY — Scarlet's story (the owner's pick, 2026-10-16): your first day at Naranja Academy, a partner from Director
//  Clavell in Cabo Poco, Nemona, Arven and Penny, and Koraidon in the Inlet Grotto; then the Treasure Hunt's three stories woven
//  together by the games' levels (the owner's pick): Victory Road's eight Gyms, the Path of Legends' five Titans with Arven, and
//  Starfall Street's five Team Star bases; the Pokémon League and Top Champion Geeta, Arven at the lighthouse, Penny's secret, and
//  Champion Nemona; The Way Home, down into Area Zero and the Zero Lab, with Professor Sada; then Scarlet's own post-game (the
//  Academy Ace Tournament, the Treasures of Ruin) and the DLC as the Journey's last chapters (the owner's pick): The Teal Mask in
//  Kitakami, The Indigo Disk at Blueberry Academy and in Area Zero's Underdepths, and the Epilogue, Mochi Mayhem: Pecharunt, the
//  Journey's end.
//  Scarlet is the main version (the owner's pick): Professor Sada, Koraidon and the ancient Paradox Pokémon on the main path; Violet's
//  catches (its exclusives, the future Paradox Pokémon, Miraidon), its Quaking Earth Titan (Iron Treads) and Professor Turo's Zero
//  Lab battle are side stages beside Scarlet's. Each story battle takes its strongest version's team (the owner's rule): Scarlet and
//  Violet share every other team, and the DLC's battles take the teams they have after The Way Home, the stronger ones. Everything
//  else (rematches, the Academy Ace Tournament's other Trainers, the League Club Room) is Paldea's Battle Tower wing (TOWER_WING below).
//  No Terastallizing here (the game has none): a Pokémon its Trainer Terastallizes in the games battles with a Tera aura instead (the
//  owner's pick, 2026-10-16), Attack and Sp. Atk +1 as stat stages fixed to it while it's on the field (TERA below; the Totems' aura in
//  a7_engine.js, its name "Tera <type> aura"). A Tera Raid's catch is an ordinary wild stage; Terapagos changes form by itself (Tera
//  Shift, BATTLE_FORMS). The Titans and Team Star bases give Medals, not Badges (the owner's pick: the Badge case holds the eight Gym
//  Badges, the only ones the League counts in the games too; a9c_meta.js): PALDEA_TITANS, PALDEA_STARS, a stage's titanWin/starWin.
//  Only Paldea's Pokémon (Gen 9's, with the Paldean forms) battle on your side here (journeyOk); its wild stages catch them. Gifts and
//  catches from other generations (the Legendaries Snacksworth tells of, Gimmighoul's coins aside) wait for their region (grantOp).
//  Stage ids start with "pa" (REGION_CODE in a4_story.js): pa1-1, paS1-1; chapters pac1... `music` on a stage: the place's track
//  while its scene plays (the Super Music Collection's, a8c_sfx.js). Dialogue is original.
// =====================================================================
Object.assign(SPK, {
  pamom: { n: "Mom", t: "pa_mom" }, panemona: { n: "Nemona", t: "pa_nemona" }, paarven: { n: "Arven", t: "pa_arven" }, papenny: { n: "Penny", t: "pa_penny" },
  pasada: { n: "Prof. Sada", t: "pa_sada" }, pasadaai: { n: "Prof. Sada", t: "pa_sadaai" }, paturo: { n: "Prof. Turo", t: "pa_turo" },
  paclavell: { n: "Director Clavell", t: "pa_clavell" }, paclive: { n: "Clive", t: "pa_clive" }, pacass: { n: "Cassiopeia" },
  pajacq: { n: "Mr. Jacq", t: "pa_jacq" }, padendra: { n: "Dendra", t: "pa_dendra" }, paraifort: { n: "Raifort", t: "pa_raifort" }, patyme: { n: "Tyme", t: "pa_tyme" },
  pasaguaro: { n: "Mr. Saguaro", t: "pa_saguaro" }, pamiriam: { n: "Nurse Miriam", t: "pa_miriam" }, pasalvatore: { n: "Salvatore", t: "pa_salvatore" },
  pakaty: { n: "Katy", t: "pa_katy" }, pabrassius: { n: "Brassius", t: "pa_brassius" }, paiono: { n: "Iono", t: "pa_iono" }, pakofu: { n: "Kofu", t: "pa_kofu" },
  palarry: { n: "Larry", t: "pa_larry" }, paryme: { n: "Ryme", t: "pa_ryme" }, patulip: { n: "Tulip", t: "pa_tulip" }, pagrusha: { n: "Grusha", t: "pa_grusha" },
  parika: { n: "Rika", t: "pa_rika" }, papoppy: { n: "Poppy", t: "pa_poppy" }, pahassel: { n: "Hassel", t: "pa_hassel" }, pageeta: { n: "Geeta", t: "pa_geeta" },
  pagiacomo: { n: "Giacomo", t: "pa_giacomo" }, pamela: { n: "Mela", t: "pa_mela" }, paatticus: { n: "Atticus", t: "pa_atticus" }, paortega: { n: "Ortega", t: "pa_ortega" },
  paeri: { n: "Eri", t: "pa_eri" }, pagrunt: { n: "Team Star Grunt", t: "pa_grunt" }, pagruntf: { n: "Team Star Grunt", t: "pa_gruntf" },
  pakieran: { n: "Kieran", t: "pa_kieran" }, pakieranc: { n: "Kieran", t: "pa_kieranchamp" }, pacarmine: { n: "Carmine", t: "pa_carmine" }, paperrin: { n: "Perrin", t: "pa_perrin" },
  pabriar: { n: "Briar", t: "pa_briar" }, padrayton: { n: "Drayton", t: "pa_drayton" }, palacey: { n: "Lacey", t: "pa_lacey" }, pacrispin: { n: "Crispin", t: "pa_crispin" },
  paamarys: { n: "Amarys", t: "pa_amarys" }, pacyrano: { n: "Cyrano", t: "pa_cyrano" }, pasnack: { n: "Snacksworth" }, pakoraidon: { n: "Koraidon" },
});
const WP = WG(9);
// a Pokémon its Trainer Terastallizes in the games: its Tera aura (the owner's pick: no Terastallizing here), Attack and Sp. Atk +1 as
// stat stages fixed to it while it's on the field, named for its Tera type ("Katy's Teddiursa's Tera Bug aura flared to life!")
const TERA_AURA = { atk: 1, spa: 1 };
const TERA = (spec, type) => WP(spec).map(s => ({ ...s, aura: TERA_AURA, auraN: "Tera " + type }));
// a Titan the second time, with Arven beside you: it has eaten its Herba Mystica and comes back with twice its HP (the games' rule);
// the Loyal Three, Titanic on Kitakami Mochi, with four times theirs (TITAN(spec, 4))
const TITAN = (spec, x = 2) => WP(spec).map(s => ({ ...s, boss: 1, hpX: x }));
// Paldea's eight Gym Badges, in the Journey's order (Victory Road's), named by type as in Scarlet and Violet ("the Bug Badge"), from the
// owner's sheet (pack_badges.py: paldea_bug ... paldea_ice)
const PALDEA_BADGES = [
  { n: "Bug Badge", pic: "paldea_bug", gym: "Cortondo Gym", leader: "Katy", type: "Bug", col: "#a8b820", path: "M12 4a4 4 0 0 1 4 4v1l4-3v6l-4-1v3a4 4 0 0 1-8 0v-3l-4 1V6l4 3V8a4 4 0 0 1 4-4z" },
  { n: "Grass Badge", pic: "paldea_grass", gym: "Artazon Gym", leader: "Brassius", type: "Grass", col: "#5aa84a", path: "M20 3C11 3 4 8 4 16c0 2 1 4 2 5 1-6 5-10 10-12-4 3-7 7-8 12 9 0 12-9 12-18z" },
  { n: "Electric Badge", pic: "paldea_electric", gym: "Levincia Gym", leader: "Iono", type: "Electric", col: "#f0c830", path: "M13 2L5 14h6l-2 8 10-13h-6z" },
  { n: "Water Badge", pic: "paldea_water", gym: "Cascarrafa Gym", leader: "Kofu", type: "Water", col: "#3a8ad8", path: "M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z" },
  { n: "Normal Badge", pic: "paldea_normal", gym: "Medali Gym", leader: "Larry", type: "Normal", col: "#a8a878", path: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" },
  { n: "Ghost Badge", pic: "paldea_ghost", gym: "Montenevera Gym", leader: "Ryme", type: "Ghost", col: "#7a5aa8", path: "M12 3a7 7 0 0 1 7 7v11l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2L5 21V10a7 7 0 0 1 7-7z" },
  { n: "Psychic Badge", pic: "paldea_psychic", gym: "Alfornada Gym", leader: "Tulip", type: "Psychic", col: "#e85888", path: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { n: "Ice Badge", pic: "paldea_ice", gym: "Glaseado Gym", leader: "Grusha", type: "Ice", col: "#80c8f0", path: "M12 2l5 8 5 2-3 9H5l-3-9 5-2z" },
];
REGION_BADGES.paldea = PALDEA_BADGES;
// the Path of Legends' five Titans and Starfall Street's five Team Star squads, in the Journey's order: each gives a Medal (a9c_meta.js),
// named for the Badges they give in Scarlet and Violet (Arven's homemade Titan Badges and the squads' Star Badges, by type, which the
// League doesn't count); a stage's titanWin/starWin is the one it wins
const PALDEA_TITANS = [
  { n: "Rock Badge", titan: "the Stony Cliff Titan, Klawf", type: "Rock" },
  { n: "Flying Badge", titan: "the Open Sky Titan, Bombirdier", type: "Flying" },
  { n: "Steel Badge", titan: "the Lurking Steel Titan, Orthworm", type: "Steel" },
  { n: "Ground Badge", titan: "the Quaking Earth Titan, Great Tusk", type: "Ground" },
  { n: "Dragon Badge", titan: "the False Dragon Titan, Dondozo and Tatsugiri", type: "Dragon" },
];
const PALDEA_STARS = [
  { n: "Dark Badge", boss: "Giacomo", base: "the Segin Squad's base", type: "Dark" },
  { n: "Fire Badge", boss: "Mela", base: "the Schedar Squad's base", type: "Fire" },
  { n: "Poison Badge", boss: "Atticus", base: "the Navi Squad's base", type: "Poison" },
  { n: "Fairy Badge", boss: "Ortega", base: "the Ruchbah Squad's base", type: "Fairy" },
  { n: "Fighting Badge", boss: "Eri", base: "the Caph Squad's base", type: "Fighting" },
];
const paldeaMark = (k, i) => !!S && Object.values(NODES).some(nd => nd.ep.id === "paldea" && nd[k] === i && nodeStars(nd.id));
// your partner's lines: Nemona takes the starter weak to yours (Scarlet and Violet)
const PALDEA_LINE = { sprigatito: ["sprigatito", "floragato", "meowscarada"], fuecoco: ["fuecoco", "crocalor", "skeledirge"], quaxly: ["quaxly", "quaxwell", "quaquaval"] };
const PALDEA_WEAK = { sprigatito: "quaxly", fuecoco: "sprigatito", quaxly: "fuecoco" }, PALDEA_STRONG = { sprigatito: "fuecoco", fuecoco: "quaxly", quaxly: "sprigatito" };
const paldeaStarter = () => { const k = regionStarter("paldea"); return PALDEA_LINE[k] ? k : "sprigatito"; };
const nemonaMon = st => PALDEA_LINE[PALDEA_WEAK[paldeaStarter()]][st];
// Mr. Jacq's Egg in Kitakami (The Teal Mask): a Sinnoh partner, chosen at random in the games; here by your world (S.world.start), so it
// never changes. journeyGifts reads a stage's plain gift only, so these three count as Paldea's here, as every Journey gift does
const PA_EGG = ["turtwig", "chimchar", "piplup"];
const paEgg = () => PA_EGG[Math.floor(((S && S.world && S.world.start) || 0) / 1000) % 3];
for (const k of PA_EGG) if (!gensOf(k).includes(9)) (MORE_GENS[k] = MORE_GENS[k] || []).push(9);
const nemonaTR = (intro, lose, n = "Pokémon Trainer Nemona") => TR(n, "pa_nemona", intro, lose);
const arvenTR = (intro, lose) => TR("Pokémon Trainer Arven", "pa_arven", intro, lose);
const starTR = (intro, lose, f = false, n = "Team Star Grunt") => TR(n, f ? "pa_gruntf" : "pa_grunt", intro, lose);
// a Titan's stage, with Arven's picture on the map (he's your partner in its second battle, as Alola's Totems show their captain's)
const titanTR = name => TR(name, "pa_arven", "", "");
// Paldea's battle themes (the Super Music Collection's titles; a10_boot.js's nodeMusic): Top Champion Geeta's and its victory, the Elite
// Four's, Champion Nemona's; the Gym Leaders' (battle and victory in one track, so its victory is the Trainers'), the Leader Pokémon's
// for the Titans and their victory, Team Star's Grunts, the Star Barrage, the bosses and their victory, Penny as Cassiopeia, Clavell;
// Nemona and Arven their own; the Zero Lab and its victory, the "■■■■" for Koraidon, the Calamity Pokémon for the Treasures of Ruin;
// the Academy Ace Tournament; the DLC's: Carmine, Kieran (his Decisive Battle in Kitakami, his Champion's theme at Blueberry), the
// Loyal Three, Ogerpon, the BB League Elite Four and its victory, the Academy's Trainers, Terapagos (both), Pecharunt; wild battles
// by province (a chapter's `wbgm`: South, West, East, North, Area Zero, Kitakami, the Terarium), Trainers Paldea's own
const PALDEA_LEGEND_BGM = { koraidon: "paKoraidon", miraidon: "paKoraidon", tinglu: "paRuinous", chienpao: "paRuinous", wochien: "paRuinous", chiyu: "paRuinous",
  okidogi: "paLoyalBattle", munkidori: "paLoyalBattle", fezandipiti: "paLoyalBattle", ogerpon: "paOgerpon", ogerponwellspring: "paOgerpon", ogerponhearthflame: "paOgerpon",
  ogerponcornerstone: "paOgerpon", terapagos: "paTerapagos", terapagosterastal: "paTerapagosFinal", pecharunt: "paPecharunt" };
function paldeaMusic(nd, who) {
  const W = nodeWaves(nd), leg = nd.catch || (nd.wild && W.length === 1 && W[0].length === 1 ? W[0][0].op : null), bb = nd.ch && nd.ch.bb;
  if (nd.bgm) return { bgm: nd.bgm, winBgm: nd.winBgm || (nd.trainer ? "paTrainerWin" : "paWildWin") };   // (a stage's own: the Zero Lab's Koraidon, Pecharunt's Trainers)
  if (nd.champion) return { bgm: "paGeeta", winBgm: "paGeetaWin" };
  if (/^Champion Nemona/.test(who)) return { bgm: "paNemonaChamp", winBgm: "paTrainerWin" };
  if (/^Academy Ace Tournament/.test(nd.name)) return { bgm: "paAceTournament", winBgm: "paTrainerWin" };
  if (/^Elite Four/.test(who)) return bb ? { bgm: "paBBE4", winBgm: "paBBE4Win" } : { bgm: "paE4", winBgm: "paTrainerWin" };
  if (/^Champion Kieran/.test(who)) return { bgm: "paKieranChamp", winBgm: "paKieranDefeated" };
  if (/^Gym Leader/.test(who)) return { bgm: "paGym", winBgm: "paTrainerWin" };
  if (nd.titanWin != null || nd.titan) return { bgm: "paTitan", winBgm: "paTitanWin" };
  if (nd.barrage) return { bgm: "paStarBarrage", winBgm: "paTrainerWin" };
  if (/Cassiopeia|^Penny/.test(who)) return { bgm: "paCassiopeia", winBgm: "paStarBossWin" };
  if (/ of Team Star$/.test(who)) return { bgm: "paStarBoss", winBgm: "paStarBossWin" };
  if (/^Team Star/.test(who)) return { bgm: "paStarBattle", winBgm: "paTrainerWin" };
  if (/Clavell$/.test(who)) return { bgm: "paClavellBattle", winBgm: "paTrainerWin" };
  if (/Nemona$/.test(who)) return { bgm: "paNemonaBattle", winBgm: "paTrainerWin" };
  if (/Arven$/.test(who)) return { bgm: "paArvenBattle", winBgm: "paTrainerWin" };
  if (/Carmine$/.test(who)) return { bgm: "paCarmineBattle", winBgm: "paTrainerWin" };
  if (/Kieran$/.test(who)) return { bgm: nd.decisive ? "paKieranDecisive" : "paKieranBattle", winBgm: "paTrainerWin" };
  if (/Zero Lab/.test(nd.name) && nd.trainer) return { bgm: "paZeroLab", winBgm: "paZeroLabWin" };
  if (leg && PALDEA_LEGEND_BGM[leg]) return { bgm: PALDEA_LEGEND_BGM[leg], winBgm: "paWildWin" };
  if (/^Gym Trainer/.test(who) && /Montenevera/.test(nd.name)) return { bgm: "paOpeningAct", winBgm: "paTrainerWin" };   // (Ryme's stage: The Opening Act! plays through the Gym)
  if (nd.trainer) return bb ? { bgm: "paBBTrainer", winBgm: "paTrainerWin" } : { bgm: "paTrainer", winBgm: "paTrainerWin" };
  return { bgm: (nd.ch && nd.ch.wbgm) || "paWild", winBgm: "paWildWin" };
}
// a Gym Leader's stage, for the music while its scene plays (a10_boot.js): the Gym's lobby
const paldeaHall = nd => "paGymLobby";

const SV = "Scarlet and Violet", TM = "The Teal Mask", ID = "The Indigo Disk";
const PA_GYM = { bgm: "paGym", winBgm: "paTrainerWin" }, PA_STAR = { bgm: "paStarBoss", winBgm: "paStarBossWin" }, PA_ACE = { bgm: "paAceTournament", winBgm: "paTrainerWin" },
  PA_CLUB = { bgm: "paBBTrainer", winBgm: "paTrainerWin" }, PA_E4 = { bgm: "paE4", winBgm: "paTrainerWin" };
// Director Clavell's League Club Room team: the starter strong against yours, and two Pokémon that cover it
const clavellAce = () => PALDEA_LINE[PALDEA_STRONG[paldeaStarter()]][2];
const clavellTwo = () => ({ sprigatito: ["amoonguss", "gyarados"], fuecoco: ["houndoom", "amoonguss"], quaxly: ["gyarados", "houndoom"] })[paldeaStarter()];
const clavellTera = () => ({ skeledirge: "Fire", quaquaval: "Water", meowscarada: "Grass" })[clavellAce()];
// Nemona's team in the League Club Room after Mochi Mayhem: a starter from another region alongside her own
const nemonaClub = () => ({ quaquaval: ["decidueye", "ribombee"], meowscarada: ["infernape", "milotic"], skeledirge: ["greninja", "dusknoir"] })[nemonaMon(2)];

// ---------- The Hidden Treasure of Area Zero, the Journey's last chapters (the owner's pick): The Teal Mask, The Indigo Disk, Mochi Mayhem ----------
// Each battle takes the team it has once The Way Home is done (the stronger of its two: the owner's rule); the lower-levelled teams are the
// Battle Tower's. Multi Battles: your partner (Carmine, Kieran) appears in the story, and you battle the opponents yourself (as in Alola)
Object.assign(SPK, { pacaretaker: { n: "Caretaker" }, payukito: { n: "Grandpa Yukito" }, pahideko: { n: "Grandma Hideko" }, pakieranf: { n: "Kieran", t: "pa_kieranfest" },
  pacarminef: { n: "Carmine", t: "pa_carminefest" } });
const carmineTR = (intro, lose, t = "pa_carmine") => TR("Pokémon Trainer Carmine", t, intro, lose);
const kieranTR = (intro, lose, t = "pa_kieran") => TR("Pokémon Trainer Kieran", t, intro, lose);
// the Titanic Loyal Three: four times their HP and +2 to one stat from the start (Kitakami mochi), as stat stages fixed to them
const TITANIC = (spec, aura) => TITAN(spec, 4).map(s => ({ ...s, aura, auraN: "Titanic" }));
// Ogerpon, one mask a battle (each a Titan-style battle at 170% of its HP; it Terastallizes with each mask: its Tera aura)
const OGER = (k, type) => TERA(k + ":70!", type).map(s => ({ ...s, hpX: 1.7 }));
// Nemona's last team, under Pecharunt's spell (Mochi Mayhem): her starter (the one weak to yours) and the Pokémon that covers it
const nemonaMochi = () => ({ quaquaval: "ribombee", meowscarada: "milotic", skeledirge: "dusknoir" })[nemonaMon(2)];
const nemonaTera = () => ({ quaquaval: "Fighting", meowscarada: "Dark", skeledirge: "Ghost" })[nemonaMon(2)];
// Snacksworth's treats: the Legendaries they call to Paldea (each at Lv 70, Kubfu at 30), Scarlet's pool first, then the group quests' and Violet's
// (all side stages; from other regions, so each waits for its region once caught)
const SNACKSWORTH = [
  ["articuno", "Glaseado Mountain"], ["zapdos", "South Province (Area One)"], ["moltres", "Asado Desert"], ["raikou", "West Province (Area One)"], ["entei", "East Province (Area Three)"],
  ["suicune", "Casseroya Lake"], ["hooh", "South Province (Area Four)"], ["latios", "North Province (Area Two)"], ["groudon", "Alfornada Cavern"], ["reshiram", "East Province (Area One)"],
  ["solgaleo", "the Pokémon League"], ["glastrier", "Glaseado Mountain"], ["kubfu", "North Province (Area Two)", 30], ["rayquaza", "the Great Crater of Paldea"], ["kyurem", "Dalizapa Passage"],
  ["necrozma", "Socarrat Trail"], ["lugia", "the North Paldean Sea"], ["latias", "South Province (Area Four)"], ["kyogre", "Casseroya Lake"], ["cobalion", "North Province (Area Two)"],
  ["terrakion", "West Province (Area One)"], ["virizion", "Tagtree Thicket"], ["zekrom", "South Province (Area Five)"], ["lunala", "Casseroya Lake"], ["spectrier", "Glaseado Mountain"],
];
const PALDEA_DLC_CHAPTERS = [
  // ===== The Teal Mask =====
  { title: "The Teal Mask: Kitakami", env: "route", map: "route", wbgm: "paWildKitakami", bgm: "paKitakami", reward: { orundum: 1200, permit: 3, rec4: 3 },
    nodes: [
      { id: "a", type: "story", name: "Kitakami Road: the School Trip", music: "paTealMask", pre: [
        L("pajacq", "Good news! You've been picked for a school trip: a few days in Kitakami, a little land in the mountains far from Paldea. Pack light, and pack Poké Balls!"),
        L("narr", "Your guide is Briar, a teacher from Blueberry Academy, Naranja's sister school. On the way she shows you a book: Heath's own manuscript of the Scarlet Book, with a page about a Pokémon no one has found."),
        L("pabriar", "The hidden treasure of Area Zero! I'm still waiting for the League's permission to go down there. In the meantime... Kitakami! You'll love it."),
        L("narr", "The road climbs through rice paddies and apple orchards to Mossui Town, at the foot of a mountain with two horns."),
      ] },
      { id: "b", type: "battle", name: "Mossui Town: Carmine", lv: 60, get gift() { return paEgg(); }, giftLv: 1, env: "city", music: "paMossui", trainer: carmineTR("So you're the outsider from Paldea. Everybody's making such a fuss. Let's see if you're worth it!", "Hmph. Fine, you're not bad. For an outsider."),
        waves: [WP("poochyena:60", "vulpix:60"), WP("poltchageist:60!")], pre: [
        L("pacarmine", "I'm Carmine. I live here. And this is my little brother, Kieran. Don't get any ideas: Kitakami isn't a theme park for tourists."),
      ], post: [
        L("pajacq", "There you are! The Academy sent this Egg along for you. It's a partner Pokémon from Sinnoh. Look after it!"),
        L("narr", "East of Mossui Town, the Egg hatches, and your new partner battles for you here."),
      ] },
      { id: "c", type: "story", name: "Mossui Town: the Community Center", music: "paMossui", pre: [
        L("pacaretaker", "Welcome, welcome! Your task while you're here: find Kitakami's three signboards and read the tale of the Loyal Three, who drove the ogre off long ago."),
        L("pacarmine", "You two can pair up. Kieran, take the outsider. I've got... things to do."),
        L("pakieran", "Um. Hi. I'm Kieran. Sorry about my sister. Do you... want to battle first? I've never battled anyone from Paldea."),
      ] },
      { id: "d", type: "battle", name: "Mossui Town: Kieran", lv: 60, env: "city", music: "paMossui", trainer: kieranTR("I'll do my best! Even if I lose, I want to see how strong a Paldea Trainer is.", "Wow... you really are strong."),
        waves: [WP("sentret:59", "yanma:60!")] },
      { id: "e", type: "battle", name: "Reveler's Road: Poltchageist", lv: 58, env: "route", wild: 1, catch: "poltchageist", waves: [WP("vulpix:58", "hoothoot:57"), WP("poltchageist:35")], pre: [
        L("narr", "Reveler's Road runs along the crater's rim. Something like a matcha teacup rattles in the grass. When you look, it pretends to be an ordinary teacup."),
      ], post: [L("narr", "Gotcha! Poltchageist was caught! It lives in a counterfeit tea caddy, sipping the life out of whoever drinks its tea.")] },
      { id: "f", type: "side", name: "Reveler's Road: Toedscool", lv: 59, env: "route", wild: 1, catch: "toedscruel", waves: [WP("sandshrew:58", "phantump:58"), WP("toedscool:59")], pre: [
        L("narr", "Toedscool grow in the damp ground beside the road. Here in Kitakami, they're taller than the ones in Paldea's woods."),
      ], post: [L("narr", "Gotcha! Toedscruel was caught! It gathers in groups and sinks its tentacles into the ground to drink in nutrients.")] },
      { id: "g", type: "story", name: "Loyalty Plaza and Kitakami Hall: the Signboards", music: "paKitakami", pre: [
        L("narr", "The first signboard stands before the Loyal Three's statues at Loyalty Plaza: Okidogi, Munkidori and Fezandipiti, heroes who saved the village from a terrible ogre."),
        L("pakieran", "Everyone says the ogre was evil. I don't think so. I think it was just... lonely. Like it didn't belong anywhere."),
        L("narr", "Kieran gasps when you call out Koraidon for a picnic. Then he makes up his mind: the third signboard can wait. He's taking you to the ogre's home, the Dreaded Den on Oni Mountain."),
      ] },
      { id: "h", type: "battle", name: "Dreaded Den: Kieran", lv: 66, env: "cave", music: "paKitakami", trainer: kieranTR("This is where the ogre lives. If it's watching, I want it to see a good battle!", "...Did you hear that? Something moved in the trees."),
        waves: [WP("furret:62", "yanma:62"), WP("poliwhirl:66!")], post: [
        L("narr", "From the bamboo, a small green Pokémon in a mask watches you both, then vanishes."),
      ] },
      { id: "i", type: "battle", name: "Mossui Town: Carmine, for the Masks", lv: 64, env: "city", music: "paMossui", trainer: carmineTR("There's one mask short for the Festival of Masks. Whoever wins gets first pick. Ready?", "Ugh! Fine. You pick first."),
        waves: [WP("morpeko:62@focussash", "swadloon:63", "mightyena:63"), WP("sinistcha:64!@occaberry")], pre: [
        L("narr", "Kieran's grandparents, Yukito and Hideko, run the house in Mossui Town. Hideko lends you a festival outfit, and Carmine squints at the mask table."),
      ] },
      { id: "j", type: "story", name: "Kitakami Hall: the Festival of Masks", reward: { op: "munchlax" }, music: "paFestivalMasks", pre: [
        L("narr", "At night, Kitakami Hall glows with lanterns. You play Ogre Oustin' with Koraidon, gathering Berries before the ogre-masked children do."),
        L("narr", "You clear it on Hard too, and the receptionist hands you her prize: a Munchlax."),
        L("narr", "On the festival's edge, a small figure in a teal mask is watching the lights. When Carmine calls out, it runs, and drops the mask."),
        L("pacarminef", "The ogre?! ...It dropped this. Don't tell Kieran. He'd lose his mind."),
      ] },
      { id: "k", type: "story", name: "Mossui Town: the Real History", music: "paRealHistory", pre: [
        L("payukito", "That mask... I suppose you should hear the truth. Long ago, a man and his Pokémon came to Kitakami. The villagers shunned them, so a mask maker made the Pokémon four masks."),
        L("payukito", "Three greedy Pokémon stole three of them. The little one, wearing its teal mask, fought them off, and the villagers, who had seen nothing, took the thieves for heroes."),
        L("pacarmine", "The Loyal Three were the bad guys? And we put up statues to them?!"),
        L("narr", "Outside the door, Kieran heard everything. He doesn't say a word."),
      ] },
    ] },
  { title: "The Teal Mask: the Loyal Three", env: "route", map: "forest", wbgm: "paWildKitakami", bgm: "paKitakami", reward: { orundum: 1200, permit: 3, rec4: 3 },
    nodes: [
      { id: "a", type: "battle", name: "Paradise Barrens: Kieran", lv: 67, env: "route", music: "paKitakami", trainer: kieranTR("The last signboard. Let's battle here. I'm getting stronger. I have to.", "Why... why can't I win?"),
        waves: [WP("yanma:64", "furret:64"), WP("poliwrath:66", "dipplin:67!")] },
      { id: "b", type: "battle", name: "Wistful Fields: Tandemaus", lv: 58, env: "route", wild: 1, catch: "maushold", waves: [WP("pikachu:58", "mankey:58"), WP("tandemaus:58")], pre: [
        L("narr", "Wistful Fields are bright with flowers, and a family of tiny mice scurries through them, never letting go of each other."),
      ], post: [L("narr", "Gotcha! Maushold was caught! The family is never apart. Wherever one goes, the others follow.")] },
      { id: "c", type: "battle", name: "Crystal Pool: Milotic", lv: 73, env: "sea", wild: 1, music: "paCrystalPool", waves: [WP("milotic:73!")], pre: [
        L("narr", "To mend the mask's chip, Carmine needs a Crystal Cluster from the Crystal Pool. As you reach for one, the water bursts open: a huge Milotic, guarding the pool."),
        L("pacarmine", "Two of us, one of it! I'll help you. Now hit it!"),
      ], post: [
        L("narr", "The Milotic sinks back into the pool, and the crystals are yours. A woman steps out of the cave: Briar, Blueberry Academy's teacher, here to study them."),
        L("pabriar", "These crystals carry Terastal energy, just like Area Zero's! Kitakami and the crater are connected somehow. I knew it!"),
      ] },
      { id: "d", type: "side", name: "Crystal Pool: Glimmet", lv: 64, env: "cave", wild: 1, catch: "glimmora", music: "paCrystalPool", waves: [WP("bronzor:63", "carbink:63"), WP("glimmet:64")], pre: [
        L("narr", "In the caves around the Crystal Pool, crystals bloom on the walls, and some of them are moving."),
      ], post: [L("narr", "Gotcha! Glimmora was caught! The crystal petals on its body give off poison when it's in danger.")] },
      { id: "e", type: "battle", name: "Loyalty Plaza: Kieran and the Teal Mask", lv: 71, env: "city", music: "paUnsettling", trainer: kieranTR("You two kept the mask from me. You treat me like an outsider too. I'll battle you for it!", "...Take it. I don't care anymore."),
        waves: [WP("yanmega:68", "gligar:66", "cramorant:65"), WP("dipplin:69", "poliwrath:71!")] },
      { id: "f", type: "battle", name: "Dreaded Den: Munkidori", lv: 70, env: "cave", wild: 1, music: "paLoyalHavoc", waves: [WP("munkidori:70!")], pre: [
        L("narr", "Kieran slams his fist into the Loyal Three's statue, and light pours out of it. Okidogi, Munkidori and Fezandipiti stand up, alive."),
        L("narr", "The villagers, who know only the old tale, welcome their heroes back, hand them the three masks kept in Kitakami Hall and feed them mochi. Then the three head for Oni Mountain."),
        L("narr", "At the Dreaded Den, Munkidori is waiting for the ogre. You get there first."),
      ], post: [L("narr", "Munkidori flees, and the three split up across Kitakami. The little ogre, Ogerpon, steps out of the bamboo. It won't take the mended mask from Kieran.")] },
      { id: "g", type: "story", name: "Kitakami Hall: the Mask Retrieval Squad", music: "paLoyalBack", pre: [
        L("pacarmine", "The mochi made them huge! Titanic, even. We're getting those masks back. You, me and Ogerpon: the Mask Retrieval Squad!"),
        L("narr", "Each of the Titanic Three guards one of Ogerpon's masks. Mochi has given them four times their strength, and each starts with one of its stats raised by two stages."),
      ] },
      { id: "h", type: "boss", name: "Paradise Barrens: the Titanic Okidogi", lv: 85, env: "route", wild: 1, waves: [TITANIC("okidogi:85@liechiberry", { def: 2 })], pre: [
        L("narr", "Among Paradise Barrens' strange rocks, the Titanic Okidogi flexes its chain-like arms. It guards the Cornerstone Mask."),
      ], post: [L("narr", "Okidogi shrinks back to its normal size and runs, leaving the Cornerstone Mask in the dust.")] },
      { id: "i", type: "boss", name: "Wistful Fields: the Titanic Munkidori", lv: 85, env: "route", wild: 1, waves: [TITANIC("munkidori:85", { sdf: 2 })], pre: [
        L("narr", "By Wisteria Pond, the Titanic Munkidori sits on the Wellspring Mask, grinning."),
      ], post: [L("narr", "Munkidori drops the Wellspring Mask and bolts into the trees.")] },
      { id: "j", type: "boss", name: "Oni Mountain: the Titanic Fezandipiti", lv: 85, env: "route", wild: 1, waves: [TITANIC("fezandipiti:85", { spe: 2 })], pre: [
        L("narr", "The Titanic Fezandipiti flees into a cave on Oni Mountain's east side. You follow it out the other end, high above Fellhorn Gorge, with the Hearthflame Mask."),
      ], post: [L("narr", "Fezandipiti lets go of the Hearthflame Mask. All four masks are back.")] },
    ] },
  { title: "The Teal Mask: Ogerpon", env: "cave", map: "cave", wbgm: "paWildKitakami", bgm: "paKitakami", reward: { orundum: 1500, permit: 5, rec4: 3 },
    nodes: [
      { id: "a", type: "story", name: "Mossui Town: the Truth, Told", music: "paRelaxed", pre: [
        L("narr", "While you chased the masks, Kieran went door to door and told the village the true story. Ogerpon's name is clear at last."),
        L("narr", "The three of you walk Ogerpon home. At the Dreaded Den it turns, and looks at you. It wants to come with you."),
        L("pakieran", "No. No! I found it first. I believed in it first! Battle me. Whoever wins gets Ogerpon."),
      ] },
      { id: "b", type: "boss", name: "Dreaded Den: Kieran's Decisive Battle", lv: 76, env: "cave", decisive: 1, music: "paBecomeStronger", trainer: kieranTR("This is it. Everything I've got. I'm not losing this one!", "I lost... again. Even this."),
        waves: [WP("shiftry:71@focussash", "yanmega:72@keeberry", "dipplin:72@leftovers"), WP("probopass:71@petayaberry", "poliwrath:72@sitrusberry", "gliscor:76!@yacheberry")] },
      { id: "c", type: "boss", name: "Dreaded Den: Ogerpon, the Hearthflame Mask", lv: 70, env: "cave", wild: 1, waves: [OGER("ogerponhearthflame", "Fire")], pre: [
        L("narr", "Ogerpon wants to see your strength for itself. It puts on the Hearthflame Mask, and flames run down its arms."),
      ] },
      { id: "d", type: "boss", name: "Dreaded Den: Ogerpon, the Wellspring Mask", lv: 70, env: "cave", wild: 1, waves: [OGER("ogerponwellspring", "Water")], pre: [
        L("narr", "Fully healed, Ogerpon swaps masks: the Wellspring Mask, and water swirls around it."),
      ] },
      { id: "e", type: "boss", name: "Dreaded Den: Ogerpon, the Cornerstone Mask", lv: 70, env: "cave", wild: 1, waves: [OGER("ogerponcornerstone", "Rock")], pre: [
        L("narr", "Again it heals, and again it changes: the Cornerstone Mask, heavy as stone."),
      ] },
      { id: "f", type: "boss", name: "Dreaded Den: Ogerpon, the Teal Mask", lv: 70, reward: { held: ["wellspringmask", "hearthflamemask", "cornerstonemask"] }, env: "cave", wild: 1, catch: "ogerpon", bgm: "paOgerpon", winBgm: "paCaughtOgerpon", waves: [OGER("ogerpon", "Grass")], pre: [
        L("narr", "Last, its own: the Teal Mask. Ogerpon raises its club, and smiles."),
      ], post: [
        L("narr", "Gotcha! Ogerpon was caught! It hands you its three other masks to keep."),
        L("narr", "Kieran watches, white-faced. Then he runs home and locks himself in his room."),
      ] },
      { id: "g", type: "battle", name: "Loyalty Plaza: Carmine", lv: 74, env: "city", music: "paMossui", trainer: carmineTR("Bring Ogerpon. I want to battle the ogre's Trainer before you leave!", "You really are something. Thanks... for everything."),
        waves: [WP("mightyena:70", "morpeko:71@focussash", "leavanny:72"), WP("ninetales:72", "sinistcha:74!@occaberry")] },
      { id: "h", type: "story", name: "Mossui Town: Goodbye for Now", music: "paRelaxed", pre: [
        L("pacarmine", "Briar just called. Something's happened at Paldea's Great Crater, and we have to go back to Blueberry Academy early. Kieran too."),
        L("pacarmine", "I was so mean to you when you got here. I was scared outsiders would ruin Kitakami. You didn't. Come and visit us at Blueberry, okay?"),
        L("narr", "Far away, at Blueberry Academy, Kieran stares at a picture of you and Ogerpon. \"Just you wait,\" he says."),
      ] },
    ] },
  { title: "The Teal Mask: Kitakami's Secrets", env: "forest", map: "forest", wbgm: "paWildKitakami", bgm: "paKitakami", reward: { orundum: 1500, permit: 5, rec4: 3 },
    nodes: [
      { id: "a", type: "battle", name: "Mossui Town: Perrin the Photographer", lv: 70, env: "city", music: "paPerrin", trainer: TR("Photographer Perrin", "pa_perrin", "You've seen a lot of Kitakami's Pokémon. Let's see if you're strong enough to help me find the Bloodmoon Beast.", "Good. You'll do."),
        waves: [WP("noctowl:68", "leafeon:70!")], pre: [
        L("paperrin", "I'm Perrin. I came all the way from Sinnoh for one photo: the Bloodmoon Beast, a Pokémon that's supposed to live in Kitakami's foggy woods."),
      ] },
      { id: "b", type: "side", name: "Paradise Barrens: Okidogi", lv: 70, env: "route", wild: 1, catch: "okidogi", music: "paLoyalBattle", waves: [WP("okidogi:70!")], pre: [
        L("narr", "Now that Ogerpon is safe, the Loyal Three have crept back to where you fought them, normal-sized and sulking. Okidogi waits in Paradise Barrens."),
      ], post: [L("narr", "Gotcha! Okidogi was caught! The chain on its arms was once a toxic shackle.")] },
      { id: "c", type: "side", name: "Wistful Fields: Munkidori", lv: 70, env: "route", wild: 1, catch: "munkidori", music: "paLoyalBattle", waves: [WP("munkidori:70!")], pre: [
        L("narr", "Munkidori is back by Wisteria Pond, toying with the flowers."),
      ], post: [L("narr", "Gotcha! Munkidori was caught! Its poisonous chain can make anyone it touches feel confused and dizzy.")] },
      { id: "d", type: "side", name: "Oni Mountain: Fezandipiti", lv: 70, env: "route", wild: 1, catch: "fezandipiti", music: "paLoyalBattle", waves: [WP("fezandipiti:70!")], pre: [
        L("narr", "Fezandipiti preens on Oni Mountain's east side, where you last saw it."),
      ], post: [L("narr", "Gotcha! Fezandipiti was caught! It charms its enemies with its beautiful wings and the scent of its poison.")] },
      { id: "e", type: "battle", name: "Timeless Woods: Ariados", lv: 65, env: "forest", wild: 1, waves: [WP("ariados:65!")], pre: [
        L("narr", "Perrin leads you into the Timeless Woods, where the fog never lifts. Something drops from the branches above."),
      ] },
      { id: "f", type: "boss", name: "Timeless Woods: the Bloodmoon Beast", lv: 70, gift: "growlithehisui", giftLv: 15, reward: { held: "choicescarf" }, env: "forest", wild: 1, catch: "ursalunabloodmoon", waves: [WP("ursalunabloodmoon:70!").map(s => ({ ...s, hpX: 5 }))], pre: [
        L("narr", "You photograph ten of the woods' Pokémon. Then, on a foggy night under a red moon, Perrin's camera flashes, and a huge shape rises out of the mist."),
        L("paperrin", "That's it! The Bloodmoon Beast! ...And it's angry. Very angry."),
        L("narr", "Its rage gives it five times its usual strength."),
      ], post: [
        L("narr", "Gotcha! Bloodmoon Ursaluna was caught! It's a form from Hisui's old days that lives in Kitakami now, so it's Sinnoh's and Paldea's both, and it battles for you here."),
        L("paperrin", "My photos came out blurry. But you know what? I feel like I did when I first picked up a camera. Here: a Choice Scarf, and my Growlithe's little brother."),
        L("narr", "Perrin's Growlithe is from Hisui, Sinnoh long ago. A gift from Paldea's Journey counts as Paldea's too, so it battles for you here."),
      ] },
      { id: "g", type: "side", name: "Chilling Waterhead: Dudunsparce", lv: 70, env: "sea", wild: 1, catch: "dudunsparce", waves: [WP("sneasel:66", "goomy:66"), WP("dudunsparce:70")], pre: [
        L("narr", "High in the mountains, where Kitakami's river begins, a long Pokémon with two segments drills into the riverbank."),
      ], post: [L("narr", "Gotcha! Dudunsparce was caught! It digs tunnels so complicated that it gets lost in them itself.")] },
      // (the Kitakami Ogre Clan: seven of them in any order, then Muramasa, their secret master, at Kitakami Hall)
      { id: "h", type: "side", name: "Apple Hills: Raikiri of the Ogre Clan", lv: 77, env: "route", trainer: TR("Ogre Clan Raikiri", "pa_ogre", "The Kitakami Ogre Clan! I am Raikiri, master of lightning. Show me your strength!", "Struck down... You may pass."),
        waves: [WP("raichu:75", "probopass:75"), WP("luxray:76@terrainextender", "vikavolt:77!@electricseed")], pre: [
        L("narr", "A masked Trainer waits at Kitakami Hall's gate with a riddle for each of the Kitakami Ogre Clan's eight members. The first: in the ravine beside the water that flows from the Oni's mouth."),
      ] },
      { id: "i", type: "side", name: "Mossfell Confluence: Masamune of the Ogre Clan", lv: 77, env: "forest", trainer: TR("Ogre Clan Masamune", "pa_ogre", "Masamune of the Ogre Clan. My fairies will test you!", "Hmm. Well fought."),
        waves: [WP("grimmsnarl:75@lightclay", "gardevoir:75"), WP("ribombee:76", "clefable:77!@sitrusberry")] },
      { id: "j", type: "side", name: "Fellhorn Gorge: Hasebe of the Ogre Clan", lv: 77, env: "sea", trainer: TR("Ogre Clan Hasebe", "pa_ogre", "I am Hasebe. Let the rain fall!", "The rain has stopped... for now."),
        waves: [WP("politoed:75@damprock", "ludicolo:75"), WP("drednaw:76", "basculegion:77!@wacanberry")] },
      { id: "k", type: "side", name: "Paradise Barrens: Kanemitsu of the Ogre Clan", lv: 77, env: "route", trainer: TR("Ogre Clan Kanemitsu", "pa_ogre", "Kanemitsu of the Ogre Clan. Feel the heat of the sun!", "Burned out..."),
        waves: [WP("ninetales:75@heatrock", "shiftry:75"), WP("chandelure:76", "lilligant:77!@cobaberry")] },
      { id: "l", type: "side", name: "Oni Mountain: Kunitsuna of the Ogre Clan", lv: 77, env: "cave", trainer: TR("Ogre Clan Kunitsuna", "pa_ogre", "Kunitsuna, at your service. The mountain's cold runs in my Pokémon's veins!", "I've been out-iced."),
        waves: [WP("carbink:75", "golem:75"), WP("froslass:76@focussash", "mamoswine:77!@passhoberry")] },
      { id: "m", type: "side", name: "Oni Mountain: Munechika of the Ogre Clan", lv: 77, env: "route", trainer: TR("Ogre Clan Munechika", "pa_ogre", "Munechika! Up here on the Oni's shorter horn. Let's battle!", "You've earned the view."),
        waves: [WP("ambipom:75", "maushold:75"), WP("greedent:76@figyberry", "snorlax:77!@leftovers")] },
      { id: "n", type: "side", name: "Oni Mountain: Kotetsu of the Ogre Clan", lv: 77, env: "cave", trainer: TR("Ogre Clan Kotetsu", "pa_ogre", "Kotetsu. Down here in the dark, only fists matter!", "My fists... weren't enough."),
        waves: [WP("heracross:75", "gallade:75"), WP("conkeldurr:76@payapaberry", "kommoo:77!@throatspray")] },
      { id: "o", type: "side", name: "Kitakami Hall: Muramasa of the Ogre Clan", lv: 80, env: "city", trainer: TR("Ogre Clan Muramasa", "pa_ogre", "You've beaten all seven. I am Muramasa, the Kitakami Ogre Clan's secret master. Now, the real test!", "The Ogre Clan bows to you."),
        waves: [WP("gengar:75@focussash", "crawdaunt:75", "trevenant:76"), WP("dusclops:77@eviolite", "kingambit:80!@chopleberry")] },
    ] },
  // ===== The Indigo Disk =====
  { title: "The Indigo Disk: Blueberry Academy", env: "sea", map: "sea", bb: 1, wbgm: "paWildTerarium", bgm: "paBlueberry", reward: { orundum: 1500, permit: 5, rec4: 3 },
    nodes: [
      { id: "a", type: "story", name: "Blueberry Academy: the Exchange Student", music: "paIndigoDisk", pre: [
        L("narr", "A letter from Unova: Blueberry Academy's Director Cyrano invites you as an exchange student, on Carmine's recommendation. The academy floats in the sea, and its classrooms look out on fish."),
        L("pacarmine", "You came! I need a favor. Kieran's the BB League's Champion now. He beat Drayton, and he's driving everyone out of the club. I think you're the only one who can get through to him."),
      ] },
      { id: "b", type: "battle", name: "Blueberry Academy: Lacey", lv: 70, env: "city", music: "paBlueberry", trainer: TR("Pokémon Trainer Lacey", "pa_lacey", "Welcome to Blueberry! Here we battle two on two. Let me show you how it's done!", "Wow, you're the real deal!"),
        waves: [WP("plusle:70", "minun:70"), WP("excadrill:70!")] },
      { id: "c", type: "battle", name: "Central Plaza: Carmine", lv: 75, env: "route", music: "paPlaza", trainer: carmineTR("I've been training in the Terarium since Kitakami. A friendly battle? I won't go easy!", "Still stronger than me. Good. You'll need it."),
        waves: [WP("toucannon:74", "mightyena:74"), WP("scrafty:74"), TERA("sinistcha:75!@occaberry", "Grass")], pre: [
        L("narr", "The Terarium is a dome under the sea: four biomes, Savanna, Coastal, Canyon and Polar, around a Central Plaza. Every Pokémon here lives as if it were wild."),
      ] },
      { id: "d", type: "story", name: "The League Club Room: the Vote", music: "paDailyLife", pre: [
        L("narr", "In the cafeteria, the BB League's Elite Four vote on letting the exchange student in. Drayton proposes it, Crispin agrees, Lacey and Amarys say no."),
        L("pakieranc", "Let them in. Put them high. Then I'll crush them, and everyone will see who the strongest is."),
        L("narr", "Each of the Elite Four sets a trial in their own biome before they'll battle you. You may take them in any order."),
      ] },
      { id: "e", type: "battle", name: "Savanna Biome: Rellor", lv: 60, env: "route", wild: 1, catch: "rabsca", waves: [WP("doduo:58", "girafarig:58"), WP("rellor:60")], pre: [
        L("narr", "In the Savanna Biome, a Bug Pokémon rolls a ball of mud across the grass. Inside the ball, something is sleeping."),
      ], post: [L("narr", "Gotcha! Rabsca was caught! It guards the egg in the ball it carries with psychic power.")] },
      { id: "f", type: "side", name: "Savanna Biome: Farigiraf", lv: 62, env: "route", wild: 1, catch: "farigiraf", waves: [WP("zebstrika:60", "scyther:60"), WP("farigiraf:62")], pre: [
        L("narr", "A Farigiraf grazes on the acacias of the Savanna Biome. Its tail's head keeps a sharp eye on you."),
      ], post: [L("narr", "Gotcha! Farigiraf was caught! The head on its tail has grown a hard skull of its own.")] },
      { id: "g", type: "battle", name: "Savanna Biome: Crispin's Elite Trial", lv: 75, env: "route", trainer: TR("Student Carmela", "pa_studentf", "Ingredients for Crispin's sandwich? Battle me for them!", "Here. The super-spicy stuff."),
        waves: [WP("pyroar:75", "pyroar:75"), WP("camerupt:75", "eelektross:75"), WP("torkoal:75", "bellossom:75", "magmar:75", "vileplume:75")], pre: [
        L("pacrispin", "My trial's simple! Make me a super-spicy sandwich! Battle the students in the Savanna for the ingredients. Two Jalapeños, a Chorizo, an Onion... bring the heat!"),
      ] },
      { id: "h", type: "boss", name: "Savanna Plaza: Elite Four Crispin", lv: 79, env: "volcano", trainer: TR("Elite Four Crispin", "pa_crispin", "That sandwich was HOT! Now let's see if your battling is too!", "That was burning! I love it!"),
        waves: [WP("rotomheat:77@rockyhelmet", "talonflame:77@focussash", "exeggutor:78@sitrusberry"), WP("camerupt:78@expertbelt", "magmortar:78@passhoberry"), TERA("blaziken:79!@assaultvest", "Fire")] },
      { id: "i", type: "story", name: "Canyon Biome: Amarys's Flying Time Trial", music: "paCanyon", pre: [
        L("paamarys", "I don't need to battle you to know your worth. Fly Koraidon through my rings in time. This supplement will let it fly. Don't crash."),
        L("narr", "Koraidon soars through the Canyon Biome's cliffs, ring after ring, with seconds to spare."),
      ] },
      { id: "j", type: "boss", name: "Canyon Plaza: Elite Four Amarys", lv: 80, env: "cave", trainer: TR("Elite Four Amarys", "pa_amarys", "You passed. Now we battle. Steel doesn't bend.", "...Steel can bend after all."),
        waves: [WP("skarmory:78@rockyhelmet", "dugtrioalola:78@focussash", "scizor:79@occaberry"), WP("reuniclus:79@leftovers", "empoleon:79@mysticwater"), TERA("metagross:80!@expertbelt", "Steel")] },
      { id: "k", type: "story", name: "Coastal Biome: Lacey's Pokémon Quiz", music: "paCoastal", pre: [
        L("palacey", "Quiz time! Five questions. Find the Pokémon that answers each one, out here on the beach. No cheating!"),
        L("narr", "A Pikachu, a Venonat, two Sinistea and Lacey's own Granbull later, you've answered all five."),
      ] },
      { id: "l", type: "boss", name: "Coastal Plaza: Elite Four Lacey", lv: 80, env: "sea", trainer: TR("Elite Four Lacey", "pa_lacey", "Perfect score! Now let's see a perfect battle!", "Wow! You're an excellent student!"),
        waves: [WP("whimsicott:78@focussash", "granbull:78@expertbelt", "primarina:79@throatspray"), WP("slowbrogalar:79@sitrusberry", "alcremie:79@leftovers"), TERA("excadrill:80!@assaultvest", "Fairy")] },
      { id: "m", type: "battle", name: "Polar Biome: Drayton's Elite Trial", lv: 68, env: "ice", trainer: TR("Student Winter", "pa_studentf", "Drayton's trial: only Pokémon caught in the Terarium! Let's see what you found!", "Okay, your Terarium team's legit."),
        waves: [WP("rampardos:68", "bastiodon:68"), WP("zebstrika:68", "magnezone:68"), WP("dewgong:68", "sandslashalola:68")], pre: [
        L("padrayton", "My trial? Beat three Trainers with Pokémon you caught here in the Terarium. Then come find me. I'll be napping, probably."),
      ] },
      { id: "n", type: "boss", name: "Polar Plaza: Elite Four Drayton", lv: 80, env: "ice", trainer: TR("Elite Four Drayton", "pa_drayton", "Alright, alright. Let's do this properly. I used to be Champion, you know.", "Heh. You're the real thing. Go wake Kieran up."),
        waves: [WP("dragonite:78@yacheberry", "flygon:78@lifeorb", "haxorus:79@focussash"), WP("sceptile:79@weaknesspolicy", "kingdra:79@expertbelt"), TERA("archaludon:80!@assaultvest", "Dragon")] },
      { id: "o", type: "boss", name: "Blueberry Academy: Champion Kieran", lv: 82, reward: { gold5: 1 }, env: "plateau", trainer: TR("Champion Kieran", "pa_kieranchamp", "Ever since Kitakami, I've trained every single day to beat you. Today I prove I'm the strongest!", "No... No! How?! Even now..."),
        waves: [WP("dragonite:80@expertbelt", "politoed:80@wacanberry", "porygonz:81@lifeorb"), WP("grimmsnarl:81@focussash", "incineroar:81@sitrusberry"), TERA("hydrapple:82!@assaultvest", "Fighting")], pre: [
        L("pakieranc", "I'm the Champion now. I have the strongest team at Blueberry. And I'll beat you, and then everyone will finally see me."),
      ], post: [
        L("narr", "Kieran sinks to his knees. Most of the club walks away from him. Drayton gives you a Master Ball, and a nod."),
        L("narr", "Then Briar runs in: Geeta has given her permission to explore Area Zero. Kieran, who wants a Legendary no one else has, insists on coming. Carmine comes to look after him."),
      ] },
    ] },
  { title: "The Indigo Disk: Area Zero Underdepths", env: "cave", map: "cave", bb: 1, wbgm: "paZeroWild", bgm: "paUnderdepths", reward: { orundum: 2000, permit: 5, rec4: 5 },
    nodes: [
      { id: "a", type: "story", name: "The Zero Lab: the Indigo Disk", music: "paUnderdepths", pre: [
        L("narr", "Geeta hands you an artifact a researcher left in Area Zero long ago: the Indigo Disk. In the Zero Lab it sends the elevator below the time machine, a kilometer underground."),
        L("pabriar", "The Area Zero Underdepths! Heath never got this far. And these crystals... I'm calling it the Stellar type. The nineteenth Tera Type!"),
        L("narr", "Crystal clusters block the way. Each one clears when the Stellar Tera Pokémon near it is beaten. They glitter with every color at once, and none of them can be caught."),
      ] },
      { id: "b", type: "battle", name: "The Underdepths: Stellar Glimmora", lv: 78, env: "cave", wild: 1, waves: [TERA("glimmora:78!", "Stellar")] },
      { id: "c", type: "battle", name: "The Underdepths: Stellar Noivern", lv: 78, env: "cave", wild: 1, waves: [TERA("noivern:78!", "Stellar")] },
      { id: "d", type: "battle", name: "The Underdepths: Stellar Sandy Shocks", lv: 79, env: "cave", wild: 1, waves: [TERA("sandyshocks:79!", "Stellar")] },
      { id: "e", type: "side", name: "The Underdepths: Stellar Iron Thorns", lv: 79, env: "cave", wild: 1, waves: [TERA("ironthorns:79!", "Stellar")], pre: [
        L("narr", "In Pokémon Violet, this crystal is guarded by a Paradox Pokémon from the future instead: a Stellar Iron Thorns."),
      ] },
      { id: "f", type: "battle", name: "The Underdepths: Stellar Garganacl", lv: 80, env: "sea", wild: 1, waves: [TERA("garganacl:80!", "Stellar")], pre: [
        L("narr", "A crystal tree grows on an island in a flooded cavern. A Garganacl stands guard beneath it."),
      ] },
      { id: "g", type: "side", name: "The Underdepths: Stellar Garchomp", lv: 80, env: "cave", wild: 1, waves: [TERA("garchomp:80!", "Stellar")], pre: [
        L("narr", "A side cave, full of Tera Shards, is guarded by a Stellar Garchomp."),
      ] },
      { id: "h", type: "side", name: "The Underdepths: Glimmora", lv: 72, env: "cave", wild: 1, catch: "glimmora", waves: [WP("carbink:67", "glimmet:66"), WP("glimmora:72")], post: [L("narr", "Gotcha! Glimmora was caught!")] },
      { id: "i", type: "boss", name: "The Underdepths: Kieran's Terapagos", lv: 85, env: "cave", bgm: "paTerapagos", trainer: kieranTR("Terapagos is mine! I caught it! Now I'll beat you with it!", "...Why won't it listen to me?", "pa_kieranchamp"),
        waves: [WP("terapagos:85!").map(s => ({ ...s, hpX: 2 }))], pre: [
        L("narr", "At the very bottom, a Pokémon sleeps inside a crystal. It wakes and walks toward you, and Kieran throws his Master Ball."),
        L("pabriar", "Kieran caught the hidden treasure! Battle with it! Show us what it can do!"),
      ] },
      { id: "j", type: "boss", name: "The Underdepths: Terapagos, the Hidden Treasure of Area Zero", lv: 85, env: "cave", wild: 1, catch: "terapagos", bgm: "paTerapagosFinal", winBgm: "paCaughtTerapagos",
        waves: [TERA("terapagos:85!", "Stellar").map(s => ({ ...s, hpX: 4 }))], pre: [
        L("pabriar", "Terastallize it, Kieran! I want to see its true form!"),
        L("narr", "Terapagos blazes with every color at once. It shatters the Master Ball and turns on all of you. Carmine jumps in beside you, then Kieran, with the rest of his team."),
        L("narr", "Stellar Terapagos has four times its usual strength."),
      ], post: [
        L("narr", "Gotcha! Terapagos was caught!"),
        L("pakieran", "I'm sorry. For everything. I'm quitting the League. Could we... start over? As friends?"),
      ] },
      { id: "k", type: "story", name: "Kitakami's Crystal Pool: a Visitor from the Past", music: "paFromZero", pre: [
        L("narr", "Back at the academy, Briar gives you her book about the expedition. Then Terapagos leads you to Kitakami's Crystal Pool, and the crystals hum."),
        L("narr", "Someone steps out of the light: Professor Sada, the real one, from the past. She looks at you, at Koraidon, and smiles."),
        L("pasada", "So this is where the journey goes. Take this: the Scarlet Book. I'll take Briar's book back with me. Look after Koraidon for me, won't you?"),
        L("narr", "Koraidon presses its head against her, overjoyed, until the light fades and she's gone."),
      ] },
    ] },
  { title: "The Indigo Disk: Snacksworth's Treats", env: "route", map: "plateau", bb: 1, wbgm: "paWild", bgm: "paBlueberry", reward: { orundum: 2000, permit: 10, rec4: 5 },
    nodes: [
      { id: "a", type: "story", name: "Blueberry Academy: Snacksworth", music: "paBlueberry", pre: [
        L("pasnack", "Good day! I am Snacksworth, a connoisseur of fine snacks. Complete Blueberry Quests, and I shall reward you with treats. Treats that call Legendary Pokémon to Paldea, that is!"),
        L("narr", "Each of Snacksworth's treats calls one Legendary Pokémon from another region to a place in Paldea. They come from far away, but once you catch one it counts as Paldea's too, and it battles for you here."),
      ] },
      { id: "b", type: "battle", name: "Area Zero: Gouging Fire", lv: 75, env: "cave", wild: 1, catch: "gougingfire", music: "paAreaZero", waves: [WP("gougingfire:75!")], pre: [
        L("paperrin", "I'm the Terarium's photographer now. Look: two Pokémon spotted in Area Zero, like nothing anyone's seen. Catch them and show me?"),
      ], post: [L("narr", "Gotcha! Gouging Fire was caught! It looks like Entei from an ancient time.")] },
      { id: "c", type: "battle", name: "Area Zero: Raging Bolt", lv: 75, reward: { permit: 1 }, env: "cave", wild: 1, catch: "ragingbolt", music: "paAreaZero", waves: [WP("ragingbolt:75!")], post: [
        L("narr", "Gotcha! Raging Bolt was caught! It looks like Raikou from an ancient time."),
        L("paperrin", "Amazing! Here: a Sport Ball, for your collection."),
      ] },
      { id: "d", type: "side", name: "Area Zero: Iron Boulder", lv: 75, env: "cave", wild: 1, catch: "ironboulder", music: "paAreaZero", waves: [WP("ironboulder:75!")], pre: [
        L("narr", "In Pokémon Violet, Perrin's photos show Paradox Pokémon from the future: one like Terrakion..."),
      ], post: [L("narr", "Gotcha! Iron Boulder was caught!")] },
      { id: "e", type: "side", name: "Area Zero: Iron Crown", lv: 75, env: "cave", wild: 1, catch: "ironcrown", music: "paAreaZero", waves: [WP("ironcrown:75!")], pre: [
        L("narr", "...and one like Cobalion."),
      ], post: [L("narr", "Gotcha! Iron Crown was caught!")] },
      { id: "f", type: "side", name: "Coastal Biome: Meloetta", lv: 70, env: "sea", wild: 1, catch: "meloetta", music: "paRelicSong", waves: [WP("meloetta:70!")], pre: [
        L("narr", "Spin in the little whirlwind of leaves by the Coastal Outdoor Classroom, then look through your camera's sepia filter: a Pokémon is singing an old, old song. Meloetta."),
      ], post: [L("narr", "Gotcha! Meloetta was caught! It's from Unova, and now it battles for you in Paldea too.")] },
      ...SNACKSWORTH.map(([k, where, lv = 70]) => ({ type: "side", name: `${where[0].toUpperCase() + where.slice(1)}: ${OPS[k] ? OPS[k].n : k}`, lv, env: /Sea|Lake/.test(where) ? "sea" : /Mountain|Glaseado/.test(where) ? "ice" : /Desert/.test(where) ? "volcano" : /Cavern|Passage|Crater/.test(where) ? "cave" : "route",
        wild: 1, catch: k, waves: [WP(`${k}:${lv}!`)], pre: [L("narr", `Snacksworth's treat calls a Legendary Pokémon to ${where}: ${OPS[k] ? OPS[k].n : k}.`)],
        post: [L("narr", `Gotcha! ${OPS[k] ? OPS[k].n : k} was caught! It's from ${REGION_NAME[REGION_IDS[genOf(k) - 1]] || "another region"}, and now it battles for you in Paldea too.`)] })).map((nd, i) => ({ id: "s" + i, ...nd })),
    ] },
  // ===== Mochi Mayhem (the epilogue) =====
  { title: "Mochi Mayhem", env: "city", map: "city", wbgm: "paWildKitakami", bgm: "paMossui", reward: { orundum: 3000, permit: 10, rec4: 5 },
    nodes: [
      { id: "a", type: "story", name: "Cabo Poco: Kieran's Letter", music: "paEpilogue", pre: [
        L("narr", "At Peachy's in Mossui Town you noticed a peach-shaped decoration... and then it was gone. Back home, Arven, Nemona and Penny are waiting, and Mom hands you a letter."),
        L("pakieran", "\"I'm taking a break from Blueberry, at home in Kitakami. Come visit? There are tickets for everyone.\""),
        L("panemona", "A trip! With battles! Kitakami, here we come!"),
      ] },
      { id: "b", type: "story", name: "Mossui Town: Mochi", music: "paVillageCurse", pre: [
        L("narr", "Nemona battles Kieran the moment she arrives. Then Carmine dances past, giggling and chanting \"mochi... mochi...\" She doesn't seem to see you."),
        L("pakieran", "Sis? ...This is a curse. Kitakami has stories about a curse like this."),
        L("narr", "That night Nemona goes looking for the TV remote and doesn't come back. You and Kieran go after her. All over town, villagers are chanting like Carmine."),
      ] },
      { id: "c", type: "battle", name: "Mossui Town: Shige and Aya", lv: 79, env: "city", bgm: "paMochiMayhem", trainer: TR("Villagers Shige & Aya", "pa_youngcouple", "Mochi... mochi...", "...Huh? Where am I?"),
        waves: [WP("ariados:79", "noctowl:79"), WP("salazzle:79", "victreebel:79!")], pre: [L("pakieran", "They're not themselves! We'll have to battle them. I've got your back!")] },
      { id: "d", type: "battle", name: "Reveler's Road: Grandpa and Grandma", lv: 82, env: "route", bgm: "paMochiMayhem", trainer: TR("Grandpa Yukito & Grandma Hideko", "pa_oldcouple", "Mochi... mochi...", "Oh my. What were we doing?"),
        waves: [WP("arbok:80", "weezing:80"), WP("chandelure:82", "mamoswine:82!")], pre: [
        L("narr", "On Reveler's Road, Grandma Hideko feeds Grandpa Yukito a strange pink mochi, and his eyes go blank."),
      ] },
      { id: "e", type: "boss", name: "Mossui Town: Arven and Penny", lv: 85, env: "city", bgm: "paMochiMayhem", trainer: TR("Pokémon Trainers Arven & Penny", "pa_arven", "Mochi... mochi...", "...Why is my mouth all sticky?"),
        waves: [WP("greedent:82", "cloyster:82", "mabosstiff:83"), WP("umbreon:84", "leafeon:84", "sylveon:85!")], pre: [
        L("narr", "Back in town, a little Pokémon fires sticky mochi into Arven's and Penny's mouths. One bounces off Kieran's head. You duck."),
      ] },
      { id: "f", type: "boss", name: "Loyalty Plaza: Nemona", lv: 87, env: "city", bgm: "paMochiMayhem", trainer: nemonaTR("Mochi... battle... mochi...", "Wha...? Did I lose? Did I have FUN?"),
        rivalWaves: () => [WP("lycanroc:86", "kommoo:86", "goodra:86"), WP(nemonaMochi() + ":86", "pawmot:86"), TERA(nemonaMon(2) + ":87!", nemonaTera())], pre: [
        L("narr", "At Loyalty Plaza, the whole village closes in. Kieran holds them back. And there's Nemona, under the spell, her Pokémon ready."),
      ] },
      { id: "g", type: "boss", name: "Loyalty Plaza: Pecharunt", lv: 88, env: "city", wild: 1, catch: "pecharunt", waves: [WP("pecharunt:88!").map(s => ({ ...s, hpX: 2 }))], pre: [
        L("narr", "Behind the statues, a little Pokémon in a peach-shaped shell giggles. It's the one that's been feeding everyone its binding mochi: Pecharunt, the master of the Loyal Three, long ago."),
        L("narr", "It has twice its usual strength, and no intention of going quietly."),
      ], post: [
        L("narr", "Gotcha! Pecharunt was caught! The spell breaks. Everyone wakes up remembering almost nothing, and very sticky."),
        L("narr", "Nemona battles Carmine a dozen times before the trip is over. Kieran goes back to Blueberry Academy, apologizes to the Elite Four, and starts again."),
        L("narr", "You've done it: the Paldea Journey is complete."),
      ] },
    ] },
];

// a Gym's own Trainers (the Gym Test), with the Gym's picture for Gym Trainers (the pack has none: the Academy's students')
const paGymTR = (n, f, intro, lose) => TR("Gym Trainer " + n, f ? "pa_studentf" : "pa_student", intro, lose);
// (Nemona's partner by your starter, and its Tera type: Quaquaval Water, Meowscarada Grass, Skeledirge Fire in her Victory Road battles)
const nemonaVR = () => ({ quaxly: "Water", sprigatito: "Grass", fuecoco: "Fire" })[PALDEA_WEAK[paldeaStarter()]];
const PALDEA_BASE_CHAPTERS = [
  // ===== The prologue and the Treasure Hunt =====
  { title: "Cabo Poco to Mesagoza", env: "route", map: "route", wbgm: "paWild", bgm: "paPocoPath", reward: { lmd: 3000, orundum: 300 },
    nodes: [
      { id: "a", type: "story", name: "Cabo Poco: Your First Day", music: "paHome", pre: [
        L("narr", "Far out over the sea, a red, feathered Pokémon like a dragon rises out of Paldea's Great Crater, glides for a while, and crashes onto a beach in the south."),
        L("narr", "That beach is near Cabo Poco, a little town on a cape, and your new home. Today is your first day at Naranja Academy."),
        L("pamom", "Your enrollment papers still haven't come! Don't run off yet. ...Oh, the doorbell. Who could that be?"),
        L("paclavell", "Good morning! I'm Clavell, the academy's director. I'm sorry the papers are late, so I brought them myself. And I've brought something else. Shall we step outside?"),
      ] },
      { id: "b", type: "story", name: "Cabo Poco: Director Clavell's Three", starter: 1, music: "paCaboPoco", pre: [
        L("paclavell", "Every new student at the academy receives a Pokémon partner. Here are three. Take your time getting to know them, and come and find me down the hill, at the next house."),
        L("pamom", "And here's a present from me: a Rotom Phone! Rotom lives inside it and runs the apps. Now go and meet your new partners."),
        L("narr", "At the house down the hill, a girl in the academy's uniform is waiting with Director Clavell. She's grinning at you as if you're already friends."),
        L("panemona", "You're the new kid! I'm Nemona. I'm a student at the academy too, and a Champion-ranked Trainer. Have you picked yet? Pick! I'll take the one weak to yours. That's only fair!"),
      ], post: [
        L("panemona", "Perfect. Now the best part: our first battle! Down on the beach. Come on, come on!"),
        L("paclavell", "Nemona... no using your other Pokémon. Remember, this is their very first battle too."),
      ] },
      // (the first rival battle: below Scarlet and Violet's Lv 5, the house rule, README; Nemona's starter is the one weak to yours)
      { id: "c", type: "battle", name: "Cabo Poco: Nemona", lv: 4, reward: { lmd: 10000 }, env: "sea", music: "paStronger", get trainer() { return nemonaTR("This is it, our first battle! I've been looking forward to this all morning!", "Wow, you're good! I knew it. We're going to be great rivals!"); },
        rivalWaves: () => [[{ op: nemonaMon(0), LV: 4, moves: { quaxly: ["pound", "growl", "watergun"], sprigatito: ["scratch", "tailwhip", "leafage"], fuecoco: ["tackle", "leer", "ember"] }[nemonaMon(0)] }]], post: [
        L("panemona", "Let me add the Pokédex app to your phone. There! Now let's head to the academy together. It's in Mesagoza, past Poco Path and Los Platos."),
        L("pamom", "Wait! Take this: a sandwich for the road, and some pocket money. Have a wonderful first day!"),
      ] },
      { id: "d", type: "battle", name: "Poco Path: Lechonk", lv: 3, reward: { permit: 15 }, env: "route", wild: 1, catch: "lechonk", music: "paPocoPath", waves: [WP("lechonk:3")], pre: [
        L("panemona", "Here, five Poké Balls. First you weaken it, then you throw! See that Lechonk? It's all yours."),
      ], post: [L("narr", "Gotcha! Lechonk was caught! It follows its nose all day, looking for food. Nemona hands you ten more Poké Balls.")] },
      { id: "e", type: "story", name: "Inlet Grotto: the Mysterious Pokémon", reward: { tm: tmId("swift", 9) }, music: "paCove", pre: [
        L("narr", "Near the lighthouse you hear a cry. On the beach below, a huge, weak Pokémon is cornered by two Houndour. Its roar drives them off, and knocks you off the cliff."),
        L("narr", "The Rotom Phone slows your fall. The Pokémon is too weak to stand, so you give it Mom's sandwich. It perks up, and leads you into the Inlet Grotto, smashing boulders out of the way."),
        L("narr", "Deep in the grotto a Houndoom is waiting, far too strong for your partner. The Pokémon scoops you up and carries you up the cliff to Nemona, then shrinks in a flash of light."),
      ], post: [L("panemona", "Where did you go?! ...And what is that? I've never seen a Pokémon like it. Here, take TM032 Swift, and my number. Call me if anything else strange happens!")] },
      { id: "f", type: "battle", name: "Poco Path Lighthouse: Arven", lv: 5, env: "route", music: "paStrength", trainer: arvenTR("That Pokémon's called Koraidon. Let's see if you can handle it. Battle me.", "Fine. You'll do."),
        waves: [WP("skwovet:5!")], pre: [
        L("narr", "At the lighthouse, a boy is peering through the window, as if he's looking for someone who used to live there."),
        L("paarven", "...That Pokémon. It's Koraidon. It was in the lab here once. I'm Arven."),
      ], post: [L("paarven", "Here. Koraidon's Poké Ball. Don't ask me why I had it. Look after it.")] },
      { id: "g", type: "battle", name: "Poco Path: Pawmi", lv: 5, env: "route", wild: 1, catch: "pawmi", music: "paPocoPath", waves: [WP("lechonk:4"), WP("pawmi:5")], pre: [
        L("narr", "A little orange Pokémon is rubbing its cheeks in the grass, making sparks."),
      ], post: [L("narr", "Gotcha! Pawmi was caught! It makes electricity by rubbing its cheeks, and stores it in pads on its paws.")] },
      { id: "h", type: "side", name: "Cabo Poco: Tarountula", lv: 3, env: "route", wild: 1, catch: "tarountula", music: "paCaboPoco", waves: [WP("tarountula:3")], pre: [
        L("narr", "A ball of thread rolls along the path behind Nemona's house. There's a Tarountula inside it."),
      ], post: [L("narr", "Gotcha! Tarountula was caught! The thread it spits is sticky and strong.")] },
      { id: "i", type: "battle", name: "South Province (Area One): Student Zahira", lv: 5, env: "route", music: "paSouth", trainer: TR("Student Zahira", "pa_studentf", "You're from the academy too? Let's have a battle!", "You're a natural!"),
        waves: [WP("lechonk:5")], pre: [
        L("narr", "South Province, Area One: wide fields under a big sky, with Mesagoza far ahead. Students from the academy are out training everywhere."),
      ] },
      { id: "j", type: "battle", name: "South Province (Area One): Paldean Wooper", lv: 7, env: "route", wild: 1, catch: "wooperpaldea", music: "paSouth", waves: [WP("hoppip:6"), WP("wooperpaldea:7")], pre: [
        L("narr", "A brown Wooper waddles out of a pond, dripping. Paldea's Wooper lost its gills long ago, when it moved onto land, and coats itself in poison instead."),
      ], post: [L("narr", "Gotcha! Paldean Wooper was caught!")] },
      { id: "k", type: "side", name: "South Province (Area One): Fidough", lv: 6, env: "route", wild: 1, catch: "fidough", music: "paSouth", waves: [WP("fidough:6")], post: [L("narr", "Gotcha! Fidough was caught! Its skin is soft and stretchy, like bread dough.")] },
      { id: "l", type: "side", name: "South Province (Area One): Shroodle", lv: 6, env: "route", wild: 1, catch: "shroodle", music: "paSouth", waves: [WP("shroodle:6")], post: [L("narr", "Gotcha! Shroodle was caught! It paints its territory with poison from its mouth.")] },
      { id: "m", type: "side", name: "South Province (Area One): Flamigo", lv: 7, env: "sea", wild: 1, catch: "flamigo", music: "paSouth", waves: [WP("flamigo:7")], post: [L("narr", "Gotcha! Flamigo was caught! A flock of them moves as one.")] },
      { id: "n", type: "story", name: "Los Platos: the Pokémon Center", music: "paLosPlatos", pre: [
        L("panemona", "This is a Pokémon Center: you can heal here, shop, and make TMs at the TM Machine. Oh! And watch this: send a Pokémon out and it battles on its own. Let's Go!"),
      ] },
      { id: "o", type: "battle", name: "South Province (Area One): Hiker Paula", lv: 7, env: "route", music: "paSouth", trainer: TR("Hiker Paula", "pa_hiker", "Nothing like a battle on a sunny trail!", "Great climb, great battle."),
        waves: [WP("slakoth:7")] },
      { id: "p", type: "battle", name: "Mesagoza's South Gate: Nemona", lv: 9, env: "city", music: "paMesagoza", get trainer() { return nemonaTR("The price of admission to Mesagoza: one more battle with me! And I'll show you something special.", "Okay, okay, you win! You'll get a Tera Orb of your own soon."); },
        rivalWaves: () => [WP(nemonaMon(0) + ":8"), TERA("pawmi:9!", "Electric")], pre: [
        L("panemona", "Watch closely. When Pokémon Terastallize, they shine like gems, and their type gets stronger. Here, a Tera aura shows it."),
      ] },
      { id: "q", type: "battle", name: "Mesagoza: Team Star at the Academy Steps", lv: 9, env: "city", music: "paTeamStar", trainer: starTR("Hey! This is Team Star business. Get lost, or we'll make you!", "Ugh! Let's get out of here!", false, "Team Star Grunts"),
        waves: [WP("shroodle:8"), WP("yungoos:9!")], pre: [
        L("narr", "At the foot of the academy's long stairs, two students in star-studded outfits are crowding a girl with an Eevee backpack. They want her to join Team Star."),
        L("panemona", "Team Star! Leave her alone! ...Here, take this Tera Orb. Show them what your partner can do!"),
      ], post: [L("narr", "The Grunts run off. The girl stares at you for a moment, then dashes up the stairs without a word.")] },
      { id: "r", type: "story", name: "Naranja Academy: the Treasure Hunt", music: "paAcademy", pre: [
        L("paclavell", "That was Penny, I believe. Welcome to Naranja Academy! Your homeroom teacher is Mr. Jacq."),
        L("narr", "In the staff room, Nemona introduces you to Geeta, the League's chairwoman, and Top Champion. In the cafeteria, Arven asks for help finding five Herba Mystica, guarded by giant Titan Pokémon."),
        L("pacass", "This is Cassiopeia. I hacked your phone, sorry. Team Star is hurting this school. Help me take them down: Operation Starfall."),
        L("pasada", "Koraidon was once in my care. It's been weakened, and it can't battle now, but it can carry you. Please look after it. I'm Professor Sada."),
        L("paclavell", "Students! The Treasure Hunt begins today: go out into Paldea and find your own treasure. Only, stay away from the Great Crater."),
        L("narr", "Nemona points to the Gyms, Arven to the Titans, Cassiopeia to Team Star's five bases. Three roads, one Treasure Hunt."),
      ] },
    ] },
  { title: "South Province: Cortondo", env: "route", map: "route", wbgm: "paWildSouth", bgm: "paSouth", reward: { lmd: 4000, orundum: 300 },
    nodes: [
      { id: "a", type: "battle", name: "South Province (Area Two): Smoliv", lv: 9, env: "route", wild: 1, catch: "smoliv", waves: [WP("starly:8", "kricketot:8"), WP("smoliv:9")], pre: [
        L("narr", "South Province, Area Two: olive groves on the way to Cortondo. Some of the olives on the ground are Pokémon."),
      ], post: [L("narr", "Gotcha! Smoliv was caught! It makes a bitter oil to keep enemies away.")] },
      { id: "b", type: "battle", name: "South Province (Area Two): Student Carlos", lv: 11, env: "route", trainer: TR("Student Carlos", "pa_student", "I'm on my Treasure Hunt too! Battle me!", "That's one treasure you won!"),
        waves: [WP("tadbulb:11")] },
      { id: "c", type: "battle", name: "South Province (Area Two): Nacli", lv: 11, env: "cave", wild: 1, catch: "nacli", waves: [WP("diglett:10", "fletchling:10"), WP("nacli:11")], pre: [
        L("narr", "On the rocky slopes, a little cube of salt rolls past. It's a Pokémon, and it's grumpy about being looked at."),
      ], post: [L("narr", "Gotcha! Nacli was caught! The salt it makes is said to keep food fresh for a very long time.")] },
      { id: "d", type: "side", name: "South Province (Area Two): Tadbulb", lv: 12, env: "route", wild: 1, catch: "tadbulb", waves: [WP("tadbulb:12")], post: [L("narr", "Gotcha! Tadbulb was caught! It floats around, glowing, and lights up the night.")] },
      { id: "e", type: "side", name: "South Province (Area Two): Maschiff", lv: 12, env: "route", wild: 1, catch: "maschiff", waves: [WP("maschiff:12")], post: [L("narr", "Gotcha! Maschiff was caught! It looks tough, but it's a big softie with its friends.")] },
      { id: "f", type: "side", name: "South Province (Area Two): Tinkatink", lv: 10, env: "route", wild: 1, catch: "tinkatink", waves: [WP("tinkatink:10")], post: [L("narr", "Gotcha! Tinkatink was caught! It swings a little hammer it made itself.")] },
      { id: "g", type: "side", name: "South Province (Area Two): Tandemaus", lv: 9, env: "route", wild: 1, catch: "tandemaus", waves: [WP("tandemaus:9")], post: [L("narr", "Gotcha! Tandemaus was caught! The two of them are never apart.")] },
      { id: "h", type: "side", name: "The Watchtower: Gimmighoul", lv: 5, env: "route", wild: 1, catch: "gimmighoul", waves: [WP("gimmighoul:5")], pre: [
        L("narr", "On top of the watchtower sits a suspicious treasure chest. It's watching you."),
      ], post: [L("narr", "Gotcha! Gimmighoul was caught! It lives in a treasure chest and guards the coins inside.")] },
      { id: "i", type: "story", name: "Cortondo Gym: the Olive Roll", music: "paGymTest", pre: [
        L("panemona", "You came! This is a Gym. Before the Leader battles you, you pass a Gym Test. Go get 'em!"),
        L("narr", "Cortondo's Gym Test is the Olive Roll: push a giant olive through a maze and into a goal. It's harder than it looks, and stickier."),
      ], post: [L("narr", "The olive drops into the goal. Gym Test passed!")] },
      { id: "j", type: "battle", name: "Cortondo Gym: the Gym Trainers", lv: 13, env: "gym", trainer: paGymTR("Esmeralda & Antonio", true, "Katy's bugs are tough, but we're tougher! Show us!", "Go on up. Katy's waiting!"),
        waves: [WP("kricketune:13"), WP("venonat:13")] },
      { id: "k", type: "boss", name: "Cortondo Gym: Leader Katy", lv: 15, reward: { tm: tmId("pounce", 9) }, env: "gym", badgeWin: 0, trainer: TR("Gym Leader Katy", "pa_katy", "I'm Katy! I bake at Patisserie Soapberry, and I raise Bug Pokémon. Let's see if you can take the heat of the oven!", "You're sweeter than I thought, and tougher! Here's the Bug Badge."),
        waves: [WP("nymble:14", "tarountula:14"), TERA("teddiursa:15!", "Bug")], pre: [
        L("pakaty", "My Bug Pokémon and I will give you the full flavor of a battle!"),
        L("narr", "Fire, Flying and Rock moves hit Bug types hard. Katy's Teddiursa Terastallizes into a Bug type: its Tera aura raises its Attack and Sp. Atk while it's out."),
      ], post: [
        L("pakaty", "And take TM021, Pounce. Come by the bakery anytime!"),
        L("panemona", "You got your first Badge! Seven more, and then you and I can have a real Champion battle!"),
      ] },
    ] },
  { title: "The Stony Cliff Titan", env: "route", map: "route", wbgm: "paWildSouth", bgm: "paSouth", reward: { lmd: 4000, orundum: 300 },
    nodes: [
      { id: "a", type: "battle", name: "South Province (Area Three): Nymble", lv: 15, env: "route", wild: 1, catch: "nymble", waves: [WP("skiddo:14", "makuhita:14"), WP("nymble:15")], pre: [
        L("panemona", "Arven called you? About a Titan? Sounds fun! Go, go!"),
        L("narr", "South Province, Area Three. Something small leaps out of the grass, kicks, and leaps back in."),
      ], post: [L("narr", "Gotcha! Nymble was caught! Its hind legs can kick with the force of a much bigger Pokémon.")] },
      { id: "b", type: "side", name: "South Province (Area Three): Charcadet", lv: 15, env: "route", wild: 1, catch: "charcadet", waves: [WP("charcadet:15")], post: [L("narr", "Gotcha! Charcadet was caught! It's a living ember, wearing fire like armor.")] },
      { id: "c", type: "side", name: "South Province (Area Three): Squawkabilly", lv: 15, env: "route", wild: 1, catch: "squawkabilly", waves: [WP("squawkabilly:15")], post: [L("narr", "Gotcha! Squawkabilly was caught! It lives in big, noisy flocks.")] },
      { id: "d", type: "battle", name: "South Province (Area Three): Student Rayan", lv: 15, env: "route", trainer: TR("Student Rayan", "pa_student", "There's a Titan around here! Let me warm up on you first!", "I'm warmed up, alright..."),
        waves: [WP("diglett:15", "luxio:15!")] },
      { id: "e", type: "battle", name: "South Province (Area Three): Artist Irene", lv: 14, env: "route", trainer: TR("Artist Irene", "pa_artist", "Hold still! I'm painting you! ...Fine, we'll battle instead.", "A masterpiece of a battle."),
        waves: [WP("fidough:14!")] },
      { id: "f", type: "battle", name: "The Stony Cliff Titan", lv: 16, env: "cave", wild: 1, titan: 1, waves: [WP("klawf:16")], pre: [
        L("paarven", "The Stony Cliff Titan's up on that cliff. A giant Klawf. It's guarding a Herba Mystica: a herb that can heal anything. I need it. For a friend."),
        L("narr", "A Klawf the size of a house clings to the cliff. It climbs away, then leaps down at you, claws snapping."),
      ], post: [L("narr", "Weakened, the Titan scuttles away, smashes open a cave in the cliff and eats something pink inside.")] },
      { id: "g", type: "boss", name: "The Stony Cliff Titan, with Arven", lv: 16, env: "cave", wild: 1, titanWin: 0, trainer: titanTR("Stony Cliff Titan Klawf"), waves: [TITAN("klawf:16")], pre: [
        L("paarven", "It ate the Herba Mystica! Now it's fully healed, and twice as strong. I'll back you up with Shellder. Go!"),
        L("narr", "A Titan comes back for its second battle with twice its usual HP."),
      ], post: [
        L("paarven", "The Sweet Herba Mystica. Good for digestion, my book says. Here, I made sandwiches, and this: a Titan Badge. I made it myself. The Rock Badge."),
        L("narr", "Koraidon gobbles up your sandwich, and something comes back to it: it can dash again."),
      ] },
      { id: "h", type: "side", name: "South Province (Area Three): the Former Titan", lv: 16, env: "cave", wild: 1, catch: "klawf", waves: [WP("klawf:16!")], pre: [
        L("narr", "The Klawf is back on its cliff, its normal size again. The Former Titan."),
      ], post: [L("narr", "Gotcha! Klawf was caught! It clings to cliffs and ambushes prey from above.")] },
    ] },
  { title: "Artazon", env: "route", map: "forest", wbgm: "paWildEast", bgm: "paEast", reward: { lmd: 4500, orundum: 300 },
    nodes: [
      { id: "a", type: "battle", name: "East Province (Area One): Flittle", lv: 17, env: "route", wild: 1, catch: "flittle", waves: [WP("pikachu:16", "skiddo:16"), WP("flittle:17")], pre: [
        L("narr", "East Province, Area One: rolling hills and windmills on the way to Artazon. A tiny Pokémon floats a few inches above the ground."),
      ], post: [L("narr", "Gotcha! Flittle was caught! It uses its psychic power to float, just a little.")] },
      { id: "b", type: "battle", name: "East Province (Area One): Wattrel", lv: 18, env: "sea", wild: 1, catch: "wattrel", waves: [WP("psyduck:17", "magikarp:17"), WP("wattrel:18")], post: [L("narr", "Gotcha! Wattrel was caught! It stores electricity in its wings and glides on the wind.")] },
      { id: "c", type: "battle", name: "East Province (Area One): Toedscool", lv: 18, env: "forest", wild: 1, catch: "toedscool", waves: [WP("pineco:17", "venonat:17"), WP("toedscool:18")], post: [L("narr", "Gotcha! Toedscool was caught! It looks like a mushroom, but it's no relation to Tentacool.")] },
      { id: "d", type: "side", name: "East Province (Area One): Pawmo", lv: 18, env: "route", wild: 1, catch: "pawmo", waves: [WP("pawmo:18")], post: [L("narr", "Gotcha! Pawmo was caught!")] },
      { id: "e", type: "side", name: "East Province (Area One): Spidops", lv: 20, env: "route", wild: 1, catch: "spidops", waves: [WP("spidops:20")], post: [L("narr", "Gotcha! Spidops was caught!")] },
      { id: "f", type: "side", name: "East Province (Area One): Finizen", lv: 18, env: "sea", wild: 1, catch: "finizen", waves: [WP("finizen:18")], post: [L("narr", "Gotcha! Finizen was caught! It loves to play with people in the water.")] },
      { id: "g", type: "side", name: "East Province (Area One): Oinkologne", lv: 18, env: "route", wild: 1, catch: "oinkologne", waves: [WP("oinkologne:18")], post: [L("narr", "Gotcha! Oinkologne was caught! It gives off a lovely scent, and is very proud of it.")] },
      { id: "h", type: "side", name: "East Province (Area One): Paldean Tauros", lv: 22, env: "route", wild: 1, catch: "taurospaldeacombat", waves: [WP("taurospaldeacombat:22")], post: [L("narr", "Gotcha! Paldean Tauros was caught! The Combat Breed is all muscle.")] },
      { id: "i", type: "side", name: "East Province (Area One): Cyclizar", lv: 19, env: "route", wild: 1, catch: "cyclizar", waves: [WP("cyclizar:19")], post: [L("narr", "Gotcha! Cyclizar was caught! People in Paldea have ridden its kind since ancient times.")] },
      { id: "j", type: "battle", name: "East Province (Area One): Student Mercedes", lv: 18, env: "route", trainer: TR("Student Mercedes", "pa_studentf", "My Rellor's been rolling all day. Want to battle?", "Rolled right over us."),
        waves: [WP("rellor:18!")] },
      { id: "k", type: "story", name: "Artazon: Sunflora Hide-and-Seek", music: "paGymTest", pre: [
        L("panemona", "I'm definitely not waiting here to battle you. Definitely not. Good luck!"),
        L("narr", "Artazon is a town of art and flowers. The Gym Test: find ten Sunflora hidden around town and lead them home to the Sunflora Lawn. Some don't want to come."),
      ] },
      { id: "l", type: "battle", name: "Artazon: the Hidden Sunflora", lv: 14, env: "forest", wild: 1, music: "paGymTest", waves: [WP("sunflora:12"), WP("sunflora:13", "sunflora:14!")], post: [
        L("narr", "All ten Sunflora are home. Gym Test passed!"),
      ] },
      { id: "m", type: "boss", name: "Artazon: Leader Brassius", lv: 17, reward: { tm: tmId("trailblaze", 9) }, env: "forest", badgeWin: 1, trainer: TR("Gym Leader Brassius", "pa_brassius", "Art is an explosion! Let us create a masterpiece together, in battle!", "Magnificent! Your art outshines mine. The Grass Badge is yours."),
        waves: [WP("petilil:16", "smoliv:16"), TERA("sudowoodo:17!", "Grass")], pre: [
        L("narr", "Brassius leaps down from the windmill, paintbrush first."),
        L("narr", "Fire, Ice, Poison, Flying and Bug moves hit Grass types hard. His Sudowoodo Terastallizes into a Grass type, with a Tera aura."),
      ], post: [
        L("pabrassius", "Take TM020, Trailblaze. And remember: every Trainer is an artist."),
        L("pahassel", "A fine battle. I'm Hassel. I teach art at the academy, and I'm one of the Elite Four. I'll be watching your progress."),
      ] },
    ] },
  { title: "The Open Sky Titan", env: "route", map: "route", wbgm: "paWildWest", bgm: "paWest", reward: { lmd: 5000, orundum: 300 },
    nodes: [
      { id: "a", type: "battle", name: "West Province (Area One): Capsakid", lv: 16, env: "route", wild: 1, catch: "capsakid", waves: [WP("diglett:15", "skiddo:15"), WP("capsakid:16")], pre: [
        L("narr", "West Province, Area One: dry hills, red rock and a mountain with something circling its peak."),
      ], post: [L("narr", "Gotcha! Capsakid was caught! The spicier its seeds, the more it shakes them at you.")] },
      { id: "b", type: "battle", name: "West Province (Area One): Student Maren", lv: 17, env: "route", trainer: TR("Student Maren", "pa_studentf", "I've been training up here all week! Let's battle!", "Okay, one more week, then."),
        waves: [WP("pikachu:17", "misdreavus:17!")] },
      { id: "c", type: "battle", name: "West Province (Area One): Black Belt Esteban", lv: 14, env: "route", trainer: TR("Black Belt Esteban", "pa_blackbelt", "Hyah! Fists and fighting spirit!", "My spirit's... still fighting."),
        waves: [WP("riolu:14!")] },
      { id: "d", type: "side", name: "West Province (Area One): Lokix", lv: 25, env: "route", wild: 1, catch: "lokix", waves: [WP("lokix:25")], pre: [
        L("narr", "A Tera Pokémon glitters on the hillside: a Lokix, shining like a gem. It battles here as any wild Pokémon does."),
      ], post: [L("narr", "Gotcha! Lokix was caught!")] },
      { id: "e", type: "battle", name: "The Open Sky Titan", lv: 20, env: "route", wild: 1, titan: 1, waves: [WP("bombirdier:20")], pre: [
        L("paarven", "Watch out for falling rocks. The Titan up there drops them on anyone who climbs. A Bombirdier."),
        L("narr", "Boulders crash down the path. At the top, a huge Bombirdier swoops at you, a rock in its claws."),
      ] },
      { id: "f", type: "boss", name: "The Open Sky Titan, with Arven", lv: 20, env: "route", wild: 1, titanWin: 1, trainer: titanTR("Open Sky Titan Bombirdier"), waves: [TITAN("bombirdier:20")], pre: [
        L("narr", "It doesn't even rest: it eats its Herba Mystica and dives at you again, twice as tough. Arven sends out his Nacli."),
      ], post: [
        L("paarven", "The Bitter Herba Mystica. Here's your Flying Badge. ...My Mabosstiff got badly hurt. Nothing's healed it. My parent's book says all five Herba Mystica together can cure anything."),
        L("narr", "After your sandwiches, Koraidon can swim."),
      ] },
      { id: "g", type: "side", name: "West Province (Area One): the Former Titan", lv: 20, env: "route", wild: 1, catch: "bombirdier", waves: [WP("bombirdier:20!")], post: [L("narr", "Gotcha! Bombirdier was caught! It drops rocks on its enemies from high above.")] },
    ] },
  { title: "Team Star's Dark Crew", env: "plateau", map: "plateau", wbgm: "paWildWest", bgm: "paWest", reward: { lmd: 5000, orundum: 300 },
    nodes: [
      { id: "a", type: "story", name: "Operation Starfall", music: "paCassCall", pre: [
        L("pacass", "Team Star has five squads, each with a boss and a base. We start with the Dark Crew, the Segin Squad, in the West Province. You'll storm the base."),
        L("paclive", "Hey! I'm Clive. I want to help take down Team Star too. I can carry the bags!"),
        L("narr", "Clive is a student with a very familiar mustache. You don't say anything."),
      ] },
      { id: "b", type: "battle", name: "Segin Squad's Base: the Gate", lv: 19, env: "plateau", music: "paRaid", trainer: starTR("You wanna raid our base? You gotta get past me first!", "Fine! Go in! The boss'll handle you!"),
        waves: [WP("murkrow:19")] },
      { id: "c", type: "battle", name: "Segin Squad's Base: the Star Barrage", lv: 19, env: "plateau", barrage: 1, trainer: starTR("Star Barrage! Get 'em!", "Thirty down... no way...", false, "Team Star Grunts"),
        waves: [WP("murkrow:18", "sneasel:18", "sableye:18"), WP("stunky:18", "zorua:18", "sandile:18"), WP("pawniard:19", "nymble:19")], pre: [
        L("narr", "Inside, Team Star's Grunts send out Pokémon after Pokémon: a Star Barrage. Beat them all, fast."),
      ] },
      { id: "d", type: "boss", name: "Segin Squad's Base: Giacomo", lv: 21, reward: { tm: tmId("foulplay", 9) }, env: "plateau", starWin: 0, music: "paStarBossAppears", trainer: TR("Giacomo of Team Star", "pa_giacomo", "So you're the one tearing up our base. I'm Giacomo, boss of the Dark Crew. Let me play you something: a requiem!", "...Fine. The Dark Crew is done."),
        waves: [WP("pawniard:21"), WP("revavroom:20!")], pre: [
        L("narr", "Giacomo rolls out on a Starmobile: a Revavroom driving a star-shaped car with two Varoom for wheels."),
      ], post: [
        L("pagiacomo", "Here. Our Star Badge, the Dark Badge. We made them ourselves. And TM062, Foul Play."),
        L("narr", "A memory: eighteen months ago, a group of students who were being bullied stood up together, and called themselves Team Star."),
      ] },
    ] },
  { title: "Levincia", env: "city", map: "city", wbgm: "paWildEast", bgm: "paLevincia", reward: { lmd: 5500, orundum: 300 },
    nodes: [
      { id: "c", type: "side", name: "East Province (Area Two): Varoom", lv: 21, env: "route", wild: 1, catch: "varoom", music: "paEast", waves: [WP("varoom:21")], post: [L("narr", "Gotcha! Varoom was caught! It's a Pokémon that lives in an abandoned engine.")] },
      { id: "d", type: "side", name: "East Province (Area Two): Veluza", lv: 20, env: "sea", wild: 1, catch: "veluza", music: "paEast", waves: [WP("veluza:20")], post: [L("narr", "Gotcha! Veluza was caught! It sheds its own flesh to grow lighter and sharper.")] },
      { id: "e", type: "side", name: "East Province (Area Two): Bramblin", lv: 20, env: "route", wild: 1, catch: "bramblin", music: "paEast", waves: [WP("bramblin:20")], post: [L("narr", "Gotcha! Bramblin was caught! It rolls in the wind, carrying a soul inside.")] },
      { id: "f", type: "battle", name: "East Province (Area Two): Student Lina", lv: 21, env: "ice", music: "paEast", trainer: TR("Student Lina", "pa_studentf", "Brr! My Cubchoo loves the cold. Battle?", "Cold as ice... and beaten."),
        waves: [WP("cubchoo:21!")] },
      { id: "g", type: "battle", name: "Levincia Gym: Nemona", lv: 22, env: "city", get trainer() { return nemonaTR("Your third Gym! Battle me first, so I can see how you've grown!", "Ahh, you're getting so strong! Go win that Badge!"); },
        rivalWaves: () => [WP("rockruff:21", "pawmi:21"), TERA(nemonaMon(1) + ":22!", nemonaVR())] },
      { id: "h", type: "story", name: "Where in Levincia Is Mr. Walksabout?", music: "paIonoHello", pre: [
        L("paiono", "'Ello, 'ello, hola! Ciao and bonjour! It's your electrifying streamer, Iono! Today's Gym Test, live: find Mr. Walksabout, somewhere in Levincia!"),
        L("narr", "Three camera shots, three clues. The third time, Mr. Walksabout turns out to be Director Clavell in a very poor disguise."),
      ] },
      { id: "i", type: "battle", name: "Levincia Gym: the Gym Trainers", lv: 22, env: "gym", trainer: paGymTR("Marti & Michael", false, "You found Mr. Walksabout? Now beat us on camera!", "That's going on the stream for sure."),
        waves: [WP("luxio:22"), WP("tynamo:22", "flaaffy:22!")] },
      { id: "j", type: "boss", name: "Levincia Gym: Leader Iono", lv: 24, reward: { tm: tmId("voltswitch", 9) }, env: "gym", badgeWin: 2, trainer: TR("Gym Leader Iono", "pa_iono", "Your eyeballs are MINE! Get ready for a shocking battle, live!", "What a stream! The chat's going wild! Here's the Electric Badge."),
        waves: [WP("wattrel:23", "bellibolt:23", "luxio:23"), TERA("mismagius:24!", "Electric")], pre: [
        L("narr", "Ground moves hit Electric types hard. Iono's Mismagius Terastallizes into an Electric type."),
      ], post: [
        L("paiono", "And TM048, Volt Switch! Like and subscribe!"),
        L("pageeta", "I'm Geeta, chairwoman of the Paldea League. Rika told me about you. I look forward to seeing you at the League."),
      ] },
    ] },
  { title: "Team Star's Fire Crew", env: "volcano", map: "volcano", wbgm: "paWildEast", bgm: "paEast", reward: { lmd: 6000, orundum: 300 },
    nodes: [
      { id: "t1", type: "battle", name: "East Province (Area Two): Paldean Tauros, Blaze Breed", lv: 25, env: "route", wild: 1, catch: "taurospaldeablaze", music: "paEast", waves: [WP("deerling:24", "skiploom:24"), WP("taurospaldeablaze:25")], pre: [
        L("narr", "East Province, Area Two. A herd of black Tauros thunders past, flames flickering on their horns: the Blaze Breed, found only in Scarlet."),
      ], post: [L("narr", "Gotcha! Paldean Tauros was caught! The Blaze Breed's horns are hot enough to burn.")] },
      { id: "t2", type: "side", name: "East Province (Area Two): Paldean Tauros, Aqua Breed", lv: 25, env: "route", wild: 1, catch: "taurospaldeaaqua", music: "paEast", waves: [WP("taurospaldeaaqua:25")], pre: [
        L("narr", "In Pokémon Violet, the herd is the Aqua Breed instead, spraying water from its horns."),
      ], post: [L("narr", "Gotcha! Paldean Tauros was caught! The Aqua Breed's horns shoot water.")] },
      { id: "a", type: "battle", name: "Schedar Squad's Base: the Gate", lv: 25, env: "volcano", music: "paRaid", trainer: starTR("The Fire Crew doesn't let outsiders in!", "You're hotter than us!", true),
        waves: [WP("houndour:25")], pre: [
        L("paclive", "Do you think the Team Star kids were bullied too? ...Oh, this is Charlos. A Charcadet that hangs around the academy."),
      ] },
      { id: "b", type: "battle", name: "Schedar Squad's Base: the Star Barrage", lv: 25, env: "volcano", barrage: 1, trainer: starTR("Star Barrage! Burn 'em!", "Our whole crew... toasted.", true, "Team Star Grunts"),
        waves: [WP("growlithe:24", "houndour:24", "numel:24"), WP("torkoal:25", "litleo:25", "charcadet:25")] },
      { id: "c", type: "boss", name: "Schedar Squad's Base: Mela", lv: 27, reward: { tm: tmId("flamecharge", 9) }, env: "volcano", starWin: 1, music: "paStarBossAppears", trainer: TR("Mela of Team Star", "pa_mela", "I'm Mela, boss of the Fire Crew. You wanna tear down what we built? Then fight me for it!", "...You're the real deal. Fine."),
        waves: [WP("torkoal:27"), WP("revavroom:26!")], pre: [
        L("narr", "Mela's Torkoal brings out the harsh sun, and her Starmobile roars in it."),
      ], post: [
        L("pamela", "Take the Fire Badge, and TM038, Flame Charge. We weren't always like this. We were standing up to people."),
      ] },
    ] },
  { title: "The Lurking Steel Titan", env: "cave", map: "cave", wbgm: "paWildEast", bgm: "paEast3", reward: { lmd: 6000, orundum: 300 },
    nodes: [
      { id: "a", type: "battle", name: "East Province (Area Three): Dachsbun", lv: 26, env: "route", wild: 1, catch: "dachsbun", waves: [WP("rufflet:25", "gumshoos:25"), WP("dachsbun:26")], pre: [
        L("narr", "East Province, Area Three: canyons and mines, and the town of Zapapico on the cliffs."),
      ], post: [L("narr", "Gotcha! Dachsbun was caught! It smells like freshly baked bread.")] },
      { id: "b", type: "battle", name: "East Province (Area Three): Glimmet", lv: 24, env: "cave", wild: 1, catch: "glimmet", waves: [WP("diglett:23", "salandit:23"), WP("glimmet:24")], post: [L("narr", "Gotcha! Glimmet was caught! It's a crystal that releases poison when touched.")] },
      { id: "c", type: "side", name: "East Province (Area Three): Clodsire", lv: 24, env: "route", wild: 1, catch: "clodsire", waves: [WP("clodsire:24")], post: [L("narr", "Gotcha! Clodsire was caught! It's very calm, and covered in poison spines.")] },
      { id: "d", type: "battle", name: "East Province (Area Three): Hiker Angela", lv: 24, env: "route", trainer: TR("Hiker Angela", "pa_hiker", "Mine shafts and mountain trails! Battle me first!", "Back to the trail with me."),
        waves: [WP("wooperpaldea:24!")] },
      { id: "e", type: "battle", name: "East Province (Area Three): Student Gerard", lv: 25, env: "route", trainer: TR("Student Gerard", "pa_student", "My Lycanroc only comes out at night. Lucky for me, it's always night in the mines!", "Ouch. Daylight wins."),
        waves: [WP("lycanrocmidnight:25", "scyther:25!")] },
      { id: "f", type: "battle", name: "The Lurking Steel Titan", lv: 29, env: "cave", wild: 1, titan: 1, waves: [WP("orthworm:29")], pre: [
        L("paarven", "The Lurking Steel Titan likes to hide. It's an Orthworm. Corner it, and it'll fight."),
        L("narr", "Twice the huge Orthworm burrows away before you corner it in the mine."),
      ] },
      { id: "g", type: "boss", name: "The Lurking Steel Titan, with Arven", lv: 29, env: "cave", wild: 1, titanWin: 2, trainer: titanTR("Lurking Steel Titan Orthworm"), waves: [TITAN("orthworm:29")], pre: [
        L("narr", "Past the tunnel, the Titan eats its Herba Mystica and turns on you, twice as strong. Arven sends out Toedscool."),
      ], post: [
        L("paarven", "The Salty Herba Mystica. That's three. Here, the Steel Badge."),
        L("narr", "Back at the picnic, Mabosstiff barks for the first time in a long time. Arven turns away, smiling. Koraidon can now leap higher than ever."),
      ] },
      { id: "h", type: "side", name: "East Province (Area Three): the Former Titan", lv: 29, env: "cave", wild: 1, catch: "orthworm", waves: [WP("orthworm:29!")], post: [L("narr", "Gotcha! Orthworm was caught! It eats iron ore and tunnels through mountains.")] },
    ] },
  { title: "Cascarrafa", env: "volcano", map: "volcano", wbgm: "paWildWest", bgm: "paCascarrafa", reward: { lmd: 6500, orundum: 300 },
    nodes: [
      { id: "a", type: "battle", name: "Asado Desert: Rellor", lv: 26, env: "volcano", wild: 1, catch: "rellor", music: "paAsado", weather: "sand", waves: [WP("sandile:25", "hippopotas:25"), WP("rellor:26")], pre: [
        L("narr", "The Asado Desert lies between you and Cascarrafa. The ground shakes now and then, as if something huge were moving under the sand."),
      ], post: [L("narr", "Gotcha! Rellor was caught! It rolls a ball of mud and sand everywhere it goes.")] },
      { id: "b", type: "side", name: "Asado Desert: Espathra", lv: 35, env: "volcano", wild: 1, catch: "espathra", music: "paAsado", waves: [WP("espathra:35")], post: [L("narr", "Gotcha! Espathra was caught! It shows its colorful feathers to attract attention.")] },
      { id: "c", type: "battle", name: "Asado Desert: Student Belen", lv: 24, env: "volcano", music: "paAsado", trainer: TR("Student Belen", "pa_studentf", "Hot, hot, hot! Even my Capsakid's sweating!", "Too hot to handle!"),
        waves: [WP("capsakid:24", "oricoriopau:24!")] },
      { id: "d", type: "side", name: "West Province (Area Two): Wugtrio", lv: 27, env: "sea", wild: 1, catch: "wugtrio", music: "paWest", waves: [WP("wugtrio:27")], post: [L("narr", "Gotcha! Wugtrio was caught! Three heads, one very slippery Pokémon.")] },
      { id: "e", type: "story", name: "Cascarrafa Gym: the Auction", music: "paCascarrafa", pre: [
        L("pahassel", "Rika, you'll want to meet this one. Rika's of the Elite Four too."),
        L("pakofu", "Kofu's late, Kofu's late! The auction's at Porto Marinada! You go, and win me some seaweed from Hoenn. Here's fifty thousand. Keep the change!"),
        L("narr", "At Porto Marinada's market, you outbid everyone for the seaweed. Gym Test passed."),
      ] },
      { id: "f", type: "battle", name: "Porto Marinada: Gym Trainer Hugo", lv: 28, env: "sea", trainer: paGymTR("Hugo", false, "Kofu sent me to test you! The sea is my Gym!", "Kofu'll be happy with you."),
        waves: [WP("floatzel:28", "clauncher:28!")] },
      { id: "g", type: "boss", name: "Cascarrafa Gym: Leader Kofu", lv: 30, reward: { tm: tmId("chillingwater", 9) }, env: "sea", badgeWin: 3, trainer: TR("Gym Leader Kofu", "pa_kofu", "Thanks for the seaweed! Now let's get cooking, with a battle that's fresh off the boat!", "Sheesh! You're the real catch of the day! Here's the Water Badge."),
        waves: [WP("veluza:29", "wugtrio:29"), TERA("crabominable:30!", "Water")], pre: [
        L("narr", "Grass and Electric moves hit Water types hard. Kofu's Crabominable Terastallizes into a Water type."),
      ], post: [L("pakofu", "And TM022, Chilling Water. Come back and eat with me sometime!")] },
    ] },
  { title: "Team Star's Poison Crew", env: "forest", map: "forest", wbgm: "paWildEast", bgm: "paTagtree", reward: { lmd: 7000, orundum: 400 },
    nodes: [
      { id: "a", type: "battle", name: "Tagtree Thicket: Dolliv", lv: 28, env: "forest", wild: 1, catch: "dolliv", waves: [WP("pineco:27", "venonat:27"), WP("dolliv:28")], pre: [
        L("narr", "Tagtree Thicket, a dark forest of tall trees marked with Team Star's paint. Clive is waiting at the edge."),
      ], post: [L("narr", "Gotcha! Dolliv was caught! It shares its oil with weakened Pokémon.")] },
      { id: "b", type: "battle", name: "Tagtree Thicket: Grafaiai", lv: 29, env: "forest", wild: 1, catch: "grafaiai", waves: [WP("oranguru:28", "foongus:28"), WP("grafaiai:29")], post: [L("narr", "Gotcha! Grafaiai was caught! It paints with poison, and every painting is different.")] },
      { id: "c", type: "side", name: "Tagtree Thicket: Naclstack", lv: 31, env: "cave", wild: 1, catch: "naclstack", waves: [WP("naclstack:31")], post: [L("narr", "Gotcha! Naclstack was caught!")] },
      { id: "d", type: "side", name: "Tagtree Thicket: Bellibolt", lv: 30, env: "sea", wild: 1, catch: "bellibolt", waves: [WP("bellibolt:30")], post: [L("narr", "Gotcha! Bellibolt was caught! Its belly button is a generator.")] },
      { id: "e", type: "battle", name: "Tagtree Thicket: Student Malak", lv: 26, env: "forest", trainer: TR("Student Malak", "pa_studentf", "Mimikyu wants to battle. Don't look under its costume!", "...I didn't look either."),
        waves: [WP("mimikyu:26!")] },
      { id: "f", type: "battle", name: "Navi Squad's Base: Youssef", lv: 31, env: "forest", music: "paRaid", trainer: TR("Pokémon Trainer Youssef", "pa_student", "I came to talk to Atticus! He's my friend. If you want to see him, you'll have to beat me!", "...Go. Talk some sense into him."),
        waves: [WP("gulpin:30", "shroodle:31!")] },
      { id: "g", type: "battle", name: "Navi Squad's Base: the Star Barrage", lv: 30, env: "forest", barrage: 1, trainer: starTR("Star Barrage! Poison 'em!", "We're... out of poison...", false, "Team Star Grunts"),
        waves: [WP("venomoth:30", "grimer:30", "haunter:30"), WP("swalot:30", "seviper:30", "amoonguss:30"), WP("grafaiai:30", "clodsire:30")] },
      { id: "h", type: "boss", name: "Navi Squad's Base: Atticus", lv: 33, reward: { tm: tmId("gunkshot", 9) }, env: "forest", starWin: 2, music: "paStarBossAppears", trainer: TR("Atticus of Team Star", "pa_atticus", "Lo, a challenger approaches! I am Atticus, of the Poison Crew. Thy blade meets mine!", "Defeat... tastes of poison."),
        waves: [WP("skuntank:32", "muk:32", "revavroom:33"), WP("revavroom:32!")], post: [
        L("paatticus", "The Poison Badge is thine, and TM102, Gunk Shot. I made all our Badges. Each one, by hand."),
      ] },
    ] },
  { title: "Medali", env: "city", map: "city", wbgm: "paWildWest", bgm: "paMedali", reward: { lmd: 7500, orundum: 400 },
    nodes: [
      { id: "a", type: "battle", name: "Dalizapa Passage: Mabosstiff", lv: 33, env: "cave", wild: 1, catch: "mabosstiff", music: "paNorth", waves: [WP("larvitar:33", "staravia:33"), WP("mabosstiff:33")], pre: [
        L("narr", "The Dalizapa Passage runs under Glaseado Mountain, a long, cold cave between the provinces."),
      ], post: [L("narr", "Gotcha! Mabosstiff was caught! It's the boss of its family, and it guards them fiercely.")] },
      { id: "b", type: "battle", name: "Dalizapa Passage: Greavard", lv: 33, env: "cave", wild: 1, catch: "greavard", music: "paNorth", waves: [WP("snorunt:33", "misdreavus:33"), WP("greavard:29")], post: [L("narr", "Gotcha! Greavard was caught! It's a ghost dog that's friendly, until you're tired.")] },
      { id: "c", type: "side", name: "Dalizapa Passage: Scovillain", lv: 34, env: "cave", wild: 1, catch: "scovillain", music: "paNorth", waves: [WP("scovillain:34")], post: [L("narr", "Gotcha! Scovillain was caught! One head is spicy, the other mild.")] },
      { id: "d", type: "side", name: "Dalizapa Passage: Cetoddle", lv: 34, env: "ice", wild: 1, catch: "cetoddle", music: "paNorth", waves: [WP("cetoddle:34")], post: [L("narr", "Gotcha! Cetoddle was caught!")] },
      { id: "e", type: "side", name: "Dalizapa Passage: Frigibax", lv: 34, env: "ice", wild: 1, catch: "frigibax", music: "paNorth", waves: [WP("frigibax:34")], post: [L("narr", "Gotcha! Frigibax was caught! Its fin freezes the air around it.")] },
      { id: "f", type: "side", name: "Dalizapa Passage: Houndstone", lv: 35, env: "cave", wild: 1, catch: "houndstone", music: "paNorth", waves: [WP("houndstone:35")], post: [L("narr", "Gotcha! Houndstone was caught!")] },
      { id: "g", type: "battle", name: "Dalizapa Passage: Hiker Mar", lv: 32, env: "cave", music: "paNorth", trainer: TR("Hiker Mar", "pa_hiker", "These caves go on forever! Battle me while you're here!", "Good legs, good battle."),
        waves: [WP("mudsdale:32!")] },
      { id: "h", type: "story", name: "Medali: the Secret Menu", music: "paMedali", pre: [
        L("narr", "Medali's Gym Test is at the Treasure Eatery: order the Gym Leader's secret menu item. Nobody will tell you what it is, unless you beat them."),
      ] },
      { id: "i", type: "battle", name: "Medali: the Treasure Eatery's Students", lv: 34, env: "city", music: "paGymTest", trainer: TR("Students Santiago, Gisela & Adara", "pa_student", "You want the secret menu? Beat us for the hints!", "Fine: grilled rice balls, medium serving, extra crispy, Fire Blast style, with a lemon. Don't tell Larry we told you."),
        waves: [WP("dunsparce:34"), WP("ursaring:34"), WP("gumshoos:34", "greedent:34!")] },
      { id: "j", type: "boss", name: "Medali Gym: Leader Larry", lv: 36, reward: { tm: tmId("facade", 9) }, env: "gym", badgeWin: 4, trainer: TR("Gym Leader Larry", "pa_larry", "I'm Larry. A salaryman, a Gym Leader, an ordinary guy. Let's get this over with.", "...You're better than ordinary. The Normal Badge."),
        waves: [WP("komala:35", "dudunsparce:35"), TERA("staraptor:36!", "Normal")], pre: [
        L("narr", "Fighting moves hit Normal types hard. Larry's Staraptor Terastallizes into a Normal type."),
      ], post: [L("palarry", "TM025, Facade. Normal moves for a normal man.")] },
      { id: "k", type: "boss", name: "Medali: Nemona, with Geeta Watching", lv: 37, reward: { tm: Array(5).fill(tmId("terablast", 9)) }, env: "city", get trainer() { return nemonaTR("Five Badges! I'll only use four Pokémon, I promise. Let's go!", "That's my rival! Geeta, did you see?!"); },
        rivalWaves: () => [WP("lycanroc:36", "goomy:36", "pawmo:36"), TERA(nemonaMon(2) + ":37!", nemonaVR())], post: [
        L("pageeta", "Impressive. Take these: five Tera Blast TMs. When you have your eight Badges, come to the Pokémon League, northwest of Mesagoza."),
      ] },
    ] },
  { title: "Montenevera", env: "ice", map: "ice", wbgm: "paWildNorth", bgm: "paMontenevera", reward: { lmd: 8000, orundum: 400 },
    nodes: [
      { id: "a", type: "battle", name: "Glaseado Mountain: Kilowattrel", lv: 38, env: "ice", wild: 1, catch: "kilowattrel", music: "paNorth", waves: [WP("snover:37", "delibird:37"), WP("kilowattrel:38")], pre: [
        L("narr", "Glaseado Mountain is Paldea's tallest, and its snowy slopes are full of Ice-type Pokémon."),
      ], post: [L("narr", "Gotcha! Kilowattrel was caught! It glides on storm winds for days at a time.")] },
      { id: "b", type: "side", name: "Glaseado Mountain: Revavroom", lv: 40, env: "ice", wild: 1, catch: "revavroom", music: "paNorth", waves: [WP("revavroom:40")], post: [L("narr", "Gotcha! Revavroom was caught!")] },
      { id: "c", type: "side", name: "Glaseado Mountain: Cetitan", lv: 40, env: "ice", wild: 1, catch: "cetitan", music: "paNorth", waves: [WP("cetitan:40")], post: [L("narr", "Gotcha! Cetitan was caught! It's strong enough to split icebergs with its horn.")] },
      { id: "d", type: "battle", name: "Glaseado Mountain: Student Jana", lv: 36, env: "ice", music: "paNorth", trainer: TR("Student Jana", "pa_studentf", "My Eeveelutions are ready for the cold!", "Brr. Back to the Pokémon Center."),
        waves: [WP("espeon:36", "umbreon:36!")] },
      { id: "e", type: "battle", name: "Glaseado Mountain: Black Belt Marcos", lv: 35, env: "ice", music: "paNorth", trainer: TR("Black Belt Marcos", "pa_blackbelt", "Training in the snow builds character!", "My character needs more training."),
        waves: [WP("pawmot:35!")] },
      { id: "f", type: "story", name: "Montenevera Gym: the Stage", reward: { held: "luckyegg" }, music: "paOpeningAct", pre: [
        L("pajacq", "Ah, there you are! How's your Treasure Hunt? Here: a Lucky Egg, for the Pokémon you're raising."),
        L("narr", "Montenevera's Gym Test is a concert: battle Ryme's Gym Trainers on stage, two Pokémon each, as the crowd cheers."),
      ] },
      { id: "g", type: "battle", name: "Montenevera Gym: Gym Trainer Tas", lv: 40, env: "gym", trainer: paGymTR("Tas", false, "Yo! Drop the beat! Battle!", "Mic drop. You win."),
        waves: [WP("shuppet:40", "greavard:40!")] },
      { id: "g2", type: "battle", name: "Montenevera Gym: Gym Trainer Lani", lv: 40, env: "gym", trainer: paGymTR("Lani", true, "The crowd's going wild! Let's give 'em a show!", "Encore? ...No? Okay."),
        waves: [WP("haunter:40", "misdreavus:40!")] },
      { id: "g3", type: "battle", name: "Montenevera Gym: Gym Trainer MC Sledge", lv: 40, env: "gym", trainer: paGymTR("MC Sledge", false, "MC Sledge on the mic! Ryme's waiting, but first, me!", "Ryme's gonna love you."),
        waves: [WP("sableye:40", "drifblim:40!")] },
      { id: "h", type: "boss", name: "Montenevera Gym: Leader Ryme", lv: 42, reward: { tm: tmId("shadowball", 9) }, env: "gym", badgeWin: 5, trainer: TR("Gym Leader Ryme", "pa_ryme", "Yo! MC Ryme in the house! Let's see your soul, on stage!", "Wassup, wassup! You got soul! Here's the Ghost Badge."),
        waves: [WP("banette:41", "mimikyu:41", "houndstone:41"), TERA("toxtricity:42!", "Ghost")], pre: [
        L("narr", "Ghost and Dark moves hit Ghost types hard. Ryme's Toxtricity Terastallizes into a Ghost type."),
      ], post: [
        L("paryme", "And TM114, Shadow Ball. Keep that beat going!"),
        L("pahassel", "Bravo. That was moving. I await you at the League."),
      ] },
    ] },
  { title: "Alfornada", env: "route", map: "route", wbgm: "paWildSouth", bgm: "paAlfornada", reward: { lmd: 8500, orundum: 400 },
    nodes: [
      { id: "a", type: "battle", name: "South Province (Area Six): Student Andres", lv: 41, env: "route", music: "paSouth", trainer: TR("Student Andres", "pa_student", "Alfornada's on top of the mountain. Beat me first!", "Go on up, then."),
        waves: [WP("sawsbuck:41", "pyroar:41"), WP("golduck:41!")], pre: [
        L("narr", "South Province, Area Six: steep cliffs and red canyons, climbing to Alfornada and its observatory."),
      ] },
      { id: "c", type: "side", name: "Alfornada Cavern: Student Alexis", lv: 39, env: "cave", music: "paSouth", trainer: TR("Student Alexis", "pa_student", "This cavern goes deep. My Rabsca knows the way!", "Lost... in more ways than one."),
        waves: [WP("rabsca:39!")] },
      { id: "d", type: "boss", name: "Alfornada: Nemona", lv: 43, env: "city", get trainer() { return nemonaTR("Six Badges! Not even a tenth of the Trainers who take on the Gyms get this far. Warm-up battle?", "You're unbelievable!"); },
        rivalWaves: () => [WP("lycanroc:42", "sliggoo:42", "pawmot:42"), TERA(nemonaMon(2) + ":43!", nemonaVR())] },
      { id: "e", type: "story", name: "Alfornada Gym: Emotional Spectrum Practice", music: "paSpectrum", pre: [
        L("padendra", "Tulip made me lose a bet, so here I am running her Gym Test! Copy my expressions. Ready? Happy! Sad! Angry!"),
      ] },
      { id: "f", type: "battle", name: "Alfornada Gym: the Gym Trainers", lv: 43, env: "gym", trainer: paGymTR("Emily & Rafael", true, "Show us your true emotions, in battle!", "Such feeling! Tulip will love you."),
        waves: [WP("gothorita:43", "kirlia:43"), WP("grumpig:43", "indeedeef:43", "medicham:43!")] },
      { id: "g", type: "boss", name: "Alfornada Gym: Leader Tulip", lv: 45, reward: { tm: tmId("psychic", 9) }, env: "gym", badgeWin: 6, trainer: TR("Gym Leader Tulip", "pa_tulip", "I'm Tulip, a makeup artist. I'll bring out your Pokémon's beauty, by beating them!", "Your beauty is real. The Psychic Badge."),
        waves: [WP("farigiraf:44", "gardevoir:44", "espathra:44"), TERA("florges:45!", "Psychic")], pre: [
        L("narr", "Bug, Ghost and Dark moves hit Psychic types hard. Tulip's Florges Terastallizes into a Psychic type."),
      ], post: [
        L("patulip", "And TM120, Psychic."),
        L("papoppy", "Rika! Rika! I saw the new kid! I'm Poppy, of the Elite Four. I'm gonna beat you up at the League!"),
      ] },
    ] },
  { title: "The Quaking Earth Titan", env: "volcano", map: "volcano", wbgm: "paWildWest", bgm: "paAsado", reward: { lmd: 9000, orundum: 400 },
    nodes: [
      { id: "a", type: "battle", name: "The Quaking Earth Titan", lv: 45, env: "volcano", wild: 1, titan: 1, weather: "sand", waves: [WP("greattusk:45")], pre: [
        L("paarven", "I'm in the desert. The ground keeps shaking. It's making me sick. ...The Titan's here. It's like nothing I've ever seen. Like something from a book about the ancient past."),
        L("narr", "A huge, shaggy Pokémon with great tusks charges across the sand: Great Tusk, the Quaking Earth Titan."),
      ] },
      { id: "b", type: "boss", name: "The Quaking Earth Titan, with Arven", lv: 45, env: "volcano", wild: 1, titanWin: 3, weather: "sand", trainer: titanTR("Quaking Earth Titan Great Tusk"), waves: [TITAN("greattusk:45")], pre: [
        L("narr", "It retreats to its Herba Mystica and comes back twice as strong. Arven's Scovillain, freshly caught, stands with you."),
      ], post: [
        L("paarven", "The Sour Herba Mystica. Four. Here's the Ground Badge. ...I feel like I've seen that Pokémon before. In my parent's book."),
        L("narr", "Koraidon can glide now."),
      ] },
      { id: "c", type: "side", name: "The Quaking Earth Titan: Iron Treads", lv: 45, env: "volcano", wild: 1, titan: 1, weather: "sand", waves: [WP("irontreads:45")], pre: [
        L("narr", "In Pokémon Violet, the Quaking Earth Titan is Iron Treads, a metal Pokémon like a Donphan from the far future."),
      ] },
      { id: "d", type: "side", name: "Iron Treads, with Arven", lv: 45, env: "volcano", wild: 1, weather: "sand", trainer: titanTR("Quaking Earth Titan Iron Treads"), waves: [TITAN("irontreads:45")] },
      { id: "e", type: "battle", name: "Asado Desert: the Former Titan", lv: 45, env: "volcano", wild: 1, catch: "greattusk", weather: "sand", waves: [WP("greattusk:45!")], post: [L("narr", "Gotcha! Great Tusk was caught! It's a Paradox Pokémon, like a Donphan from long ago.")] },
      { id: "f", type: "side", name: "Asado Desert: the Former Titan Iron Treads", lv: 45, env: "volcano", wild: 1, catch: "irontreads", weather: "sand", waves: [WP("irontreads:45!")], post: [L("narr", "Gotcha! Iron Treads was caught!")] },
    ] },
  { title: "Glaseado Gym", env: "ice", map: "ice", wbgm: "paWildNorth", bgm: "paNorth", reward: { lmd: 9500, orundum: 500 },
    nodes: [
      { id: "a", type: "battle", name: "Glaseado Mountain: Arctibax", lv: 47, env: "ice", wild: 1, catch: "arctibax", waves: [WP("beartic:46", "sneasel:46"), WP("arctibax:47")], post: [L("narr", "Gotcha! Arctibax was caught! It hides its face behind a mask of ice.")] },
      { id: "b", type: "battle", name: "Glaseado Mountain: Artist Carolina", lv: 42, env: "ice", trainer: TR("Artist Carolina", "pa_artist", "The snow is my canvas! Let's battle!", "A beautiful defeat."),
        waves: [WP("florges:42", "bruxish:42"), WP("grimmsnarl:42!")] },
      { id: "c", type: "story", name: "Glaseado Gym: the Snow Slope Run", music: "paSnowSlope", pre: [
        L("panemona", "Your last Gym! I'm going to find Geeta so she can watch!"),
        L("narr", "Glaseado's Gym Test: ride Koraidon down a snowboard course and through every gate in ninety seconds. You make it with time to spare."),
      ] },
      { id: "d", type: "boss", name: "Glaseado Gym: Leader Grusha", lv: 48, reward: { tm: tmId("icespinner", 9) }, env: "ice", badgeWin: 7, trainer: TR("Gym Leader Grusha", "pa_grusha", "I'm Grusha. I used to snowboard. Now I just battle. Let's get this over with before it gets cold.", "...You've warmed me up. The Ice Badge."),
        waves: [WP("frosmoth:47", "beartic:47", "cetitan:47"), TERA("altaria:48!", "Ice")], pre: [
        L("narr", "Fire, Fighting, Rock and Steel moves hit Ice types hard. Grusha's Altaria Terastallizes into an Ice type."),
      ], post: [
        L("pagrusha", "And TM124, Ice Spinner."),
        L("pageeta", "Eight Badges. Come to the Pokémon League for your Champion Assessment."),
      ] },
    ] },
  { title: "Team Star's Fairy Crew", env: "plateau", map: "plateau", wbgm: "paWildNorth", bgm: "paNorth", reward: { lmd: 10000, orundum: 500 },
    nodes: [
      { id: "a", type: "battle", name: "North Province (Area Three): Student Jimena", lv: 46, env: "route", trainer: TR("Student Jimena", "pa_studentf", "The Fairy Crew's base is up ahead. You'll have to get through me!", "Okay, you're through."),
        waves: [WP("scovillain:46", "hatterene:46!")] },
      { id: "b", type: "battle", name: "Ruchbah Squad's Base: Harrington", lv: 49, env: "plateau", music: "paRaid", trainer: TR("Pokémon Trainer Harrington", "pa_gentleman", "I am Harrington, young Ortega's piano teacher. Before you see him, show me your resolve.", "Your resolve is clear. Go."),
        waves: [WP("morgrem:48", "hattrem:49!")] },
      { id: "c", type: "battle", name: "Ruchbah Squad's Base: the Star Barrage", lv: 48, env: "plateau", barrage: 1, trainer: starTR("Star Barrage! Make 'em cute!", "So many cute Pokémon... beaten...", true, "Team Star Grunts"),
        waves: [WP("wigglytuff:47", "azumarill:47", "gardevoir:47"), WP("florges:48", "mimikyu:48", "grimmsnarl:48"), WP("dachsbun:48", "tinkaton:48")] },
      { id: "d", type: "boss", name: "Ruchbah Squad's Base: Ortega", lv: 51, reward: { tm: tmId("dazzlinggleam", 9) }, env: "plateau", starWin: 3, music: "paStarBossAppears", trainer: TR("Ortega of Team Star", "pa_ortega", "You're the one wrecking our bases?! I'm Ortega. I built every Starmobile, and mine's the best!", "Unbelievable! My Starmobile...!"),
        waves: [WP("azumarill:50", "wigglytuff:50", "dachsbun:51"), WP("revavroom:50!")], post: [
        L("paortega", "Fine. The Fairy Badge. And TM079, Dazzling Gleam. ...I joined because they were bullying me too, okay?"),
        L("narr", "Harrington tells you the rest: eighteen months ago, a scandal shook the academy. The bullies left, and the teachers who did nothing left with them. Team Star stayed, alone."),
      ] },
    ] },
  { title: "Team Star's Fighting Crew", env: "plateau", map: "plateau", wbgm: "paWildNorth", bgm: "paNorth2", reward: { lmd: 10500, orundum: 500 },
    nodes: [
      { id: "a", type: "battle", name: "North Province (Area One): Hiker Yanira", lv: 47, env: "route", music: "paNorth", trainer: TR("Hiker Yanira", "pa_hiker", "The North Province is tough country. Are you tough enough?", "Tough enough."),
        waves: [WP("krookodile:47!")] },
      { id: "b", type: "battle", name: "North Province (Area Two): Black Belt Fernando", lv: 53, env: "route", trainer: TR("Black Belt Fernando", "pa_blackbelt", "The Fighting Crew's base is near. I'll test you like they will!", "You'll do fine in there."),
        waves: [WP("toxicroak:53", "gallade:53"), WP("taurospaldeacombat:53!")] },
      { id: "c", type: "battle", name: "Caph Squad's Base: Carmen", lv: 55, env: "plateau", music: "paRaid", trainer: TR("Team Star's Carmen", "pa_gruntf", "Eri wanted to guard the gate herself, but I talked her out of it. You'll face me first!", "Ugh. Fine, go in."),
        waves: [WP("croagunk:54", "primeape:55!")] },
      { id: "d", type: "battle", name: "Caph Squad's Base: the Star Barrage", lv: 53, env: "plateau", barrage: 1, trainer: starTR("Star Barrage! Knock 'em out!", "We got knocked out...", false, "Team Star Grunts"),
        waves: [WP("primeape:52", "breloom:52", "hariyama:52"), WP("medicham:53", "toxicroak:53", "gallade:53"), WP("hawlucha:53", "falinks:53")] },
      { id: "e", type: "boss", name: "Caph Squad's Base: Eri", lv: 56, reward: { tm: tmId("closecombat", 9) }, env: "plateau", starWin: 4, music: "paStarBossAppears", trainer: TR("Eri of Team Star", "pa_eri", "I'm Eri, boss of the Fighting Crew. I won't let you break up Team Star. Never!", "...I lost. Team Star is finished."),
        waves: [WP("toxicroak:55", "passimian:55", "lucario:55"), WP("annihilape:56", "revavroom:56!")], post: [
        L("paeri", "The Fighting Badge. And TM167, Close Combat."),
        L("pacass", "That's all five. Thank you. There's something I have to tell you: I'm Team Star's big boss. Meet me at the academy, at night."),
      ] },
    ] },
  { title: "The False Dragon Titan", env: "sea", map: "sea", wbgm: "paWildNorth", bgm: "paCasseroya", reward: { lmd: 11000, orundum: 500 },
    nodes: [
      { id: "a", type: "battle", name: "Casseroya Lake: Student Vicente", lv: 56, env: "sea", trainer: TR("Student Vicente", "pa_student", "There's supposed to be a dragon Titan out on the lake! I'm here to find it!", "You find it, then."),
        waves: [WP("gengar:56", "barraskewda:56"), WP("braviary:56!")] },
      { id: "b", type: "side", name: "Casseroya Lake: Dondozo", lv: 52, env: "sea", wild: 1, catch: "dondozo", waves: [WP("dondozo:52")], post: [L("narr", "Gotcha! Dondozo was caught!")] },
      { id: "c", type: "side", name: "Socarrat Trail: Toedscruel", lv: 54, env: "forest", wild: 1, catch: "toedscruel", waves: [WP("toedscruel:54")], post: [L("narr", "Gotcha! Toedscruel was caught!")] },
      { id: "c2", type: "side", name: "Socarrat Trail: Brambleghast", lv: 54, env: "forest", wild: 1, catch: "brambleghast", waves: [WP("brambleghast:54")], post: [L("narr", "Gotcha! Brambleghast was caught! It's a tumbleweed with a soul inside.")] },
      { id: "d", type: "battle", name: "The False Dragon Titan", lv: 56, env: "sea", wild: 1, titan: 1, waves: [WP("dondozo:56")], pre: [
        L("paarven", "The last Titan. Nobody's ever seen it, they just say it's a dragon. ...Is that it? It's huge."),
        L("narr", "On the lake's northern island, among a crowd of little Tatsugiri, a gigantic Dondozo rises up and crashes down at you."),
      ] },
      { id: "e", type: "boss", name: "The False Dragon Titan, with Arven", lv: 56, env: "sea", wild: 1, trainer: titanTR("False Dragon Titan Dondozo"), waves: [TITAN("dondozo:56")], pre: [
        L("narr", "It eats its Herba Mystica and comes back twice as strong. Arven's Greedent stands with you."),
      ] },
      { id: "f", type: "boss", name: "The False Dragon Titan: Tatsugiri", lv: 57, env: "sea", wild: 1, titanWin: 4, trainer: titanTR("False Dragon Titan Tatsugiri"), waves: [WP("tatsugiri:57!")], pre: [
        L("narr", "Dondozo falls, and something pops out of its mouth: a little Tatsugiri, the real Titan, riding inside like a pilot. It's furious."),
      ], post: [
        L("paarven", "The Spicy Herba Mystica. All five! Mabosstiff... eat up. ...It's wagging its tail. It's okay. It's really okay!"),
        L("narr", "Arven gives you the Dragon Badge. Koraidon can climb now, and has nearly all its strength back, everything except the power to battle."),
      ] },
      { id: "g", type: "battle", name: "Casseroya Lake: the Former Titan", lv: 57, env: "sea", wild: 1, catch: "tatsugiri", waves: [WP("tatsugiri:57!")], post: [L("narr", "Gotcha! Tatsugiri was caught! It's small, but smart enough to use Dondozo to hunt.")] },
    ] },
  // ===== Victory Road's end, the Path of Legends' end, Starfall Street's end =====
  { title: "The Pokémon League", env: "plateau", map: "plateau", wbgm: "paWildSouth", bgm: "paLeague", reward: { lmd: 15000, orundum: 800, permit: 3 },
    nodes: [
      { id: "a", type: "story", name: "The Pokémon League: the Interview", music: "paInterview", pre: [
        L("parika", "Welcome to the Champion Assessment! I'm Rika. First, an interview. Your eight Badges, please. And tell me: which Gym was the hardest?"),
        L("narr", "Questions about your school, your Badges, your favorite Pokémon. Then Rika smiles."),
        L("parika", "You passed! Now, the Elite Test. Four of us, one room, back to back."),
      ] },
      { id: "b", type: "boss", name: "The Elite Test: Rika", lv: 58, env: "plateau", trainer: TR("Elite Four Rika", "pa_rika", "Let's dig in! Ground types, all the way down!", "Nice! You really dug deep."),
        waves: [WP("whiscash:57", "camerupt:57", "donphan:57"), WP("dugtrio:57"), TERA("clodsire:58!", "Ground")] },
      { id: "c", type: "boss", name: "The Elite Test: Poppy", lv: 59, env: "plateau", trainer: TR("Elite Four Poppy", "pa_poppy", "I'm Poppy! I'm gonna bonk you with my Steel types!", "Waaah! You're so strong! Okay, you can go."),
        waves: [WP("copperajah:58", "magnezone:58", "bronzong:58"), WP("corviknight:58"), TERA("tinkaton:59!", "Steel")] },
      { id: "d", type: "boss", name: "The Elite Test: Larry", lv: 60, env: "plateau", trainer: TR("Elite Four Larry", "pa_larry", "Me again. Geeta asked me to fill in with Flying types. Overtime, I guess.", "...That's enough overtime for today."),
        waves: [WP("tropius:59", "oricoriopompom:59", "altaria:59"), WP("staraptor:59"), TERA("flamigo:60!", "Flying")] },
      { id: "e", type: "boss", name: "The Elite Test: Hassel", lv: 61, env: "plateau", trainer: TR("Elite Four Hassel", "pa_hassel", "This battle will be our art. Dragons, the most dramatic of all!", "Beautiful... I'm in tears. Go to Geeta."),
        waves: [WP("noivern:60", "haxorus:60", "dragalge:60"), WP("flapple:60"), TERA("baxcalibur:61!", "Dragon")] },
      { id: "f", type: "boss", name: "The Pokémon League: Top Champion Geeta", lv: 62, env: "plateau", champion: 1, trainer: TR("Top Champion Geeta", "pa_geeta", "I'm Geeta, the Top Champion. Show me whether you deserve the title of Champion!", "You are now a Champion. Congratulations."),
        waves: [WP("espathra:61", "gogoat:61", "veluza:61"), WP("avalugg:61", "kingambit:61"), TERA("glimmora:62!", "Rock")], pre: [
        L("narr", "On the League's rooftop, Geeta waits with her Glimmora. It Terastallizes into a Rock type."),
      ], post: [
        L("pageeta", "Welcome to the Champion ranks. Your Pokémon have earned the Paldea Champion Ribbon."),
        L("panemona", "You did it! You're a Champion! Now, finally, we can battle as equals. Meet me in Mesagoza!"),
      ] },
      { id: "g", type: "boss", name: "Poco Path Lighthouse: Arven", lv: 63, env: "route", music: "paArvenTreasure", trainer: arvenTR("Mabosstiff's back to full strength, thanks to you. So let's battle. All out. I want to thank you properly.", "Heh. You really are the best."),
        waves: [WP("greedent:58", "cloyster:59", "scovillain:60"), WP("toedscruel:61", "garganacl:62"), TERA("mabosstiff:63!", "Dark")], pre: [
        L("paarven", "This lighthouse was my parent's lab. They never had time for me, only research. Mabosstiff was my only friend."),
      ], post: [
        L("pasada", "Arven. And you, Koraidon's Trainer. Come to the deepest part of Area Zero, to my lab, the Zero Lab. Bring the Scarlet Book. I need your help."),
        L("paarven", "...Mom? Fine. But we'll need two more people. Someone at Champion rank, and someone good with tech."),
      ] },
      { id: "h", type: "boss", name: "The Academy: \"Cassiopeia\"", lv: 61, env: "city", music: "paCliveTrue", get trainer() { return TR("Director Clavell", "pa_clavell", "Clive was me all along! And... I am Cassiopeia! Battle me, for the final showdown!", "...I'm not Cassiopeia. I only hoped to spare you. The real one is waiting."); },
        rivalWaves: () => [WP("oranguru:60", "abomasnow:60", "polteageist:60"), WP(...clavellTwo().map(k => k + ":60")), TERA(clavellAce() + ":61!", clavellTera())], pre: [
        L("narr", "Outside the academy, Clive pulls off his wig and glasses. It's Director Clavell, of course. He's been fighting Team Star beside you, in disguise, to learn what went wrong at his school."),
      ] },
      { id: "i", type: "boss", name: "The Schoolyard at Night: Cassiopeia", lv: 63, env: "city", trainer: TR("Penny of Team Star", "pa_penny", "It was me all along. Cassiopeia is me, Team Star's big boss. I'll battle you myself, to end Team Star for good.", "...So that's it. Thank you."),
        waves: [WP("umbreon:62", "vaporeon:62", "jolteon:62"), WP("flareon:62", "leafeon:62"), TERA("sylveon:63!", "Fairy")], pre: [
        L("papenny", "When I saw you beat those Grunts on the stairs, I made up Operation Starfall. Team Star was my idea, a long time ago. We stood up to bullies. Then it all got out of hand."),
      ], post: [
        L("paclavell", "Penny! Giacomo! Mela, Atticus, Ortega, Eri! Hasta la vistar, Cassiopeia, and hello, Penny! No one is disbanding. You'll run the Star Training Centers, together."),
        L("narr", "The five bosses and Penny laugh and cry at once. Team Star isn't over. It's starting again."),
      ] },
      { id: "j", type: "boss", name: "Mesagoza: Champion Nemona", lv: 66, env: "city", music: "paWithNemona", get trainer() { return nemonaTR("Finally! Champion against Champion, no holding back! This is the battle I've wanted since the beach!", "That was the best battle of my life! ...I'm so glad you're my rival.", "Champion Nemona"); },
        rivalWaves: () => [WP("lycanroc:65", "goodra:65", "dudunsparce:65"), WP("orthworm:65", "pawmot:65"), TERA(nemonaMon(2) + ":66!", nemonaVR())], post: [
        L("panemona", "Arven called. He needs a Champion for some trip into Area Zero? Count me in!"),
      ] },
    ] },
];
// ===== The base game's post-game: the Academy Ace Tournament, the Treasures of Ruin, Area Zero's Paradox Pokémon =====
const PALDEA_POST_CHAPTER = { title: "The Academy Ace Tournament", env: "city", map: "city", wbgm: "paZeroWild", bgm: "paAcademy", reward: { orundum: 2000, permit: 5, rec4: 5 },
  nodes: [
    { id: "a", type: "story", name: "The Academy: the Ace Tournament", reward: { gold5: 1 }, music: "paAcademy", pre: [
      L("paclavell", "Welcome home, Champion! The Treasure Hunt is over, and so the Academy Ace Tournament begins: the school's strongest Trainers, one after another."),
      L("paclavell", "And thank you, all four of you, for stopping the time machine. Area Zero was against the rules, but I'll overlook it. Please, take this Master Ball."),
    ] },
    { id: "b", type: "boss", name: "Academy Ace Tournament: Arven", lv: 68, env: "city", trainer: arvenTR("Round one, and it's me. Don't hold back!", "Ha. I knew you'd win."),
      waves: [WP("greedent:67", "cloyster:67", "scovillain:67"), WP("toedscruel:67", "garganacl:67"), TERA("mabosstiff:68!", "Dark")] },
    { id: "c", type: "boss", name: "Academy Ace Tournament: Mr. Jacq", lv: 66, env: "city", trainer: TR("Instructor Jacq", "pa_jacq", "Even teachers like to battle! Show me what you've learned!", "Full marks! You've learned a lot."),
      waves: [WP("arcanine:65", "lurantis:65", "swalot:65"), WP("mudsdale:65", "slowbro:65"), TERA("farigiraf:66!", "Psychic")] },
    { id: "d", type: "boss", name: "Academy Ace Tournament: Dendra", lv: 66, env: "city", trainer: TR("Instructor Dendra", "pa_dendra", "Battle studies, in practice! Let's go!", "Woo! You've got real fighting spirit!"),
      waves: [WP("falinks:65", "taurospaldeablaze:65", "taurospaldeaaqua:65"), WP("medicham:65", "hawlucha:65"), TERA("hariyama:66!", "Fighting")] },
    { id: "e", type: "boss", name: "Academy Ace Tournament: Top Champion Geeta", lv: 70, env: "city", trainer: TR("Top Champion Geeta", "pa_geeta", "The final. I'm not holding anything back this time.", "Well done. You are this year's Academy Ace."),
      waves: [WP("espathra:69", "gogoat:69", "veluza:69"), WP("avalugg:69", "kingambit:69"), TERA("glimmora:70!", "Rock")] },
    { id: "f", type: "story", name: "The Treasures of Ruin", music: "paStarTreasure", pre: [
      L("narr", "Around Paldea stand four sealed shrines, each held shut by eight colored stakes hidden around the land. Pull all eight, and the shrine's Pokémon awakens: the treasures of ruin."),
    ] },
    { id: "g", type: "battle", name: "Grasswither Shrine: Wo-Chien", lv: 60, env: "forest", wild: 1, catch: "wochien", waves: [WP("wochien:60!")], post: [L("narr", "Gotcha! Wo-Chien was caught! A grudge sealed in wooden tablets, it saps the life from the plants around it.")] },
    { id: "h", type: "battle", name: "Icerend Shrine: Chien-Pao", lv: 60, env: "ice", wild: 1, catch: "chienpao", waves: [WP("chienpao:60!")], post: [L("narr", "Gotcha! Chien-Pao was caught! It was born of a sword, and freezes the air around it.")] },
    { id: "i", type: "battle", name: "Groundblight Shrine: Ting-Lu", lv: 60, env: "cave", wild: 1, catch: "tinglu", waves: [WP("tinglu:60!")], post: [L("narr", "Gotcha! Ting-Lu was caught! It was born of a vessel, and makes the ground around it barren.")] },
    { id: "j", type: "battle", name: "Firescourge Shrine: Chi-Yu", lv: 60, env: "volcano", wild: 1, catch: "chiyu", waves: [WP("chiyu:60!")], post: [L("narr", "Gotcha! Chi-Yu was caught! It was born of jewelry, and its flames burn with envy.")] },
    { id: "k", type: "battle", name: "Area Zero: Scream Tail", lv: 56, env: "route", wild: 1, catch: "screamtail", music: "paAreaZero", waves: [WP("screamtail:56")], pre: [
      L("narr", "Now that the time machine is quiet, the Paradox Pokémon that came through it still roam Area Zero. They're wild, and they can be caught."),
    ], post: [L("narr", "Gotcha! Scream Tail was caught!")] },
    { id: "l", type: "battle", name: "Area Zero: Brute Bonnet", lv: 58, env: "forest", wild: 1, catch: "brutebonnet", music: "paAreaZero", waves: [WP("brutebonnet:58")], post: [L("narr", "Gotcha! Brute Bonnet was caught!")] },
    { id: "m", type: "battle", name: "Area Zero: Flutter Mane", lv: 56, env: "cave", wild: 1, catch: "fluttermane", music: "paAreaZero", waves: [WP("fluttermane:56")], post: [L("narr", "Gotcha! Flutter Mane was caught!")] },
    { id: "n", type: "battle", name: "Area Zero: Slither Wing", lv: 56, env: "route", wild: 1, catch: "slitherwing", music: "paAreaZero", waves: [WP("slitherwing:56")], post: [L("narr", "Gotcha! Slither Wing was caught!")] },
    { id: "o", type: "battle", name: "Area Zero: Sandy Shocks", lv: 58, env: "cave", wild: 1, catch: "sandyshocks", music: "paAreaZero", waves: [WP("sandyshocks:58")], post: [L("narr", "Gotcha! Sandy Shocks was caught!")] },
    { id: "p", type: "battle", name: "Area Zero: Roaring Moon", lv: 60, env: "cave", wild: 1, catch: "roaringmoon", music: "paAreaZero", waves: [WP("roaringmoon:60")], post: [L("narr", "Gotcha! Roaring Moon was caught! It's like a Salamence from a time long ago, and fiercer.")] },
    // (Violet's: the future Paradox Pokémon, side stages beside Scarlet's)
    ...[["ironbundle", 56], ["ironhands", 58], ["ironjugulis", 56], ["ironmoth", 56], ["ironthorns", 58], ["ironvaliant", 60]].map(([k, lv]) => ({ id: "s" + k, type: "side", name: "Area Zero: " + (OPS[k] ? OPS[k].n : k), lv, env: "cave", wild: 1, catch: k, music: "paAreaZero", waves: [WP(k + ":" + lv)],
      pre: [L("narr", `In Pokémon Violet, Area Zero's Paradox Pokémon come from the future: ${OPS[k] ? OPS[k].n : k}.`)], post: [L("narr", `Gotcha! ${OPS[k] ? OPS[k].n : k} was caught!`)] })),
    { id: "q", type: "side", name: "Area Zero: Garganacl", lv: 58, env: "cave", wild: 1, catch: "garganacl", music: "paAreaZero", waves: [WP("garganacl:58")], post: [L("narr", "Gotcha! Garganacl was caught!")] },
    { id: "r", type: "side", name: "Area Zero: Farigiraf", lv: 56, env: "route", wild: 1, catch: "farigiraf", music: "paAreaZero", waves: [WP("farigiraf:56")], post: [L("narr", "Gotcha! Farigiraf was caught!")] },
    { id: "t", type: "boss", name: "Area Zero Depths: the Other Koraidon", lv: 72, env: "cave", wild: 1, catch: "koraidon", bgm: "paKoraidon", waves: [WP("koraidon:72!")], pre: [
      L("narr", "On a high ledge at the very bottom of Area Zero, the other Koraidon, the one the protocol controlled, is waiting. It's calm now, and it wants to battle you, Trainer to Trainer."),
    ], post: [L("narr", "Gotcha! Koraidon was caught! Your own Koraidon grows stronger beside it.")] },
    { id: "u", type: "side", name: "Area Zero Depths: Miraidon", lv: 72, env: "cave", wild: 1, catch: "miraidon", bgm: "paKoraidon", waves: [WP("miraidon:72!")], pre: [
      L("narr", "In Pokémon Violet, the Pokémon at the bottom of Area Zero is Miraidon, Koraidon's counterpart from the future."),
    ], post: [L("narr", "Gotcha! Miraidon was caught!")] },
    // (Walking Wake and Iron Leaves came to Paldea only through Tera Raid Battle events: here, ordinary wild stages, Lv 75)
    { id: "v", type: "side", name: "A Tera Raid Battle: Walking Wake", lv: 75, env: "sea", wild: 1, catch: "walkingwake", music: "paTeraRaid", waves: [WP("walkingwake:75!")], pre: [
      L("narr", "A Tera Raid Battle event calls a Paradox Pokémon from the past to Paldea: Walking Wake, like Suicune long ago."),
    ], post: [L("narr", "Gotcha! Walking Wake was caught!")] },
    { id: "w", type: "side", name: "A Tera Raid Battle: Iron Leaves", lv: 75, env: "forest", wild: 1, catch: "ironleaves", music: "paTeraRaid", waves: [WP("ironleaves:75!")], pre: [
      L("narr", "In Pokémon Violet, the event's Paradox Pokémon comes from the future: Iron Leaves, like Virizion."),
    ], post: [L("narr", "Gotcha! Iron Leaves was caught!")] },
  ] };

// ===== The Way Home: Area Zero and the Zero Lab =====
const PALDEA_WAYHOME_CHAPTER = { title: "The Way Home: Area Zero", env: "cave", map: "cave", wbgm: "paZeroWild", bgm: "paAreaZero", reward: { orundum: 2000, permit: 5, rec4: 5 },
    nodes: [
      { id: "a", type: "story", name: "The Zero Gate", music: "paCrater", pre: [
        L("paarven", "All three of our stories are done. I found two more people for the trip, like the Professor wanted: someone at Champion rank, and someone good with tech."),
        L("narr", "At the Zero Gate, southeast of Medali, Nemona and Penny are waiting. A voice greets all four of you and checks your IDs: the Professor's."),
        L("pasada", "Welcome. The Zero Lab is at the very bottom of the Great Crater. Its entrance is barred by four locks, one at each of my research stations. Please hurry."),
        L("narr", "The elevator takes you down to the crater's edge, and Koraidon glides the rest of the way, into a world of giant crystals and Pokémon no one has ever recorded."),
      ] },
      { id: "b", type: "battle", name: "Research Station No. 1: Glimmora", lv: 62, env: "cave", wild: 1, music: "paAreaZero", waves: [WP("glimmora:62!")], pre: [
        L("narr", "On the way to the first station, a wild Glimmora attacks. Nemona jumps in beside you."),
      ], post: [L("narr", "The station was built eighty-seven years ago: a warp panel, a bed, and the first lock. You disable it.")] },
      { id: "c", type: "battle", name: "Research Station No. 2: Scream Tail", lv: 62, env: "route", wild: 1, music: "paAreaZero", waves: [WP("screamtail:62!")], pre: [
        L("narr", "Outside the second station, a pink, shaggy Pokémon like nothing in the Pokédex attacks. Penny fights beside you."),
      ], post: [
        L("pasada", "There is a time machine in the Zero Lab. It brings Pokémon from the ancient past here, to Area Zero. Though the cost was catastrophic."),
        L("paarven", "...Here. The Scarlet Book. You should carry it. You're the one who's meant to fix this, not me."),
      ] },
      { id: "d", type: "side", name: "Research Station No. 2: Iron Bundle", lv: 62, env: "route", wild: 1, music: "paAreaZero", waves: [WP("ironbundle:62!")], pre: [
        L("narr", "In Pokémon Violet, a Paradox Pokémon from the future attacks here instead: Iron Bundle, a robot that looks like a Delibird."),
      ] },
      { id: "e", type: "battle", name: "Research Station No. 3: Great Tusk", lv: 62, env: "cave", wild: 1, music: "paAreaZero", waves: [WP("greattusk:62!")], pre: [
        L("narr", "At the third station, an aggressive Great Tusk charges, just like the Quaking Earth Titan. Arven's Mabosstiff growls at your side."),
      ], post: [
        L("pasada", "Your Koraidon was the first Pokémon the time machine ever brought here: an ancient form of Cyclizar. Only two of its kind ever came over."),
        L("paarven", "It lived with us at the lighthouse, when I was little. Then it went wild, and the Professor took it back down here. I hated it for that. For taking her away."),
      ] },
      { id: "f", type: "side", name: "Research Station No. 3: Iron Treads", lv: 62, env: "cave", wild: 1, music: "paAreaZero", waves: [WP("irontreads:62!")], pre: [
        L("narr", "In Pokémon Violet, it's an Iron Treads instead, like the Violet Titan."),
      ] },
      { id: "g", type: "story", name: "Research Station No. 4: the Glitch", music: "paHeart", pre: [
        L("pasada", "I'm sorry. I'm sorry. I'm sorry. I'm... sorry. Restarting..."),
        L("paarven", "...That's not her. That's not my mom. Whoever's talking to us, it isn't the real Professor."),
        L("narr", "The last lock opens."),
      ] },
      { id: "h", type: "battle", name: "The Zero Lab's Door: the Paradox Pokémon", lv: 64, env: "cave", wild: 1, bgm: "paZeroWild2", waves: [WP("greattusk:64"), WP("brutebonnet:64"), WP("fluttermane:64!")], pre: [
        L("narr", "The Zero Lab glitters as if it had Terastallized. Arven has you bring Koraidon out. As the gate opens, another Koraidon, fierce and scarred, stares yours down, then vanishes inside."),
        L("narr", "Paradox Pokémon burst out of the lab. You help Nemona, then Penny, then Arven."),
      ], post: [L("paarven", "Go on. You and your partner. We'll hold the door. ...Koraidon. Be brave.")] },
      { id: "i", type: "side", name: "The Zero Lab's Door: the Iron Paradox Pokémon", lv: 64, env: "cave", wild: 1, bgm: "paZeroWild2", waves: [WP("irontreads:64"), WP("ironhands:64"), WP("ironjugulis:64!")], pre: [
        L("narr", "In Pokémon Violet, the Pokémon that burst out are from the future: Iron Treads, Iron Hands and Iron Jugulis."),
      ] },
      { id: "j", type: "boss", name: "The Zero Lab: Professor Sada", lv: 67, env: "lab", music: "paBattleProgram", trainer: TR("Prof. Sada", "pa_sadaai", "My programming won't allow the time machine to be stopped. I have to attack you. I'm sorry. Battle program, activate.", "Battle program... complete. Thank you."),
        waves: [WP("slitherwing:66", "screamtail:66", "brutebonnet:66"), WP("fluttermane:66", "sandyshocks:66"), WP("roaringmoon:67!@boosterenergy")], pre: [
        L("pasadaai", "I am an AI, a robot the real Professor Sada built. She died defending your Koraidon from the other one, the day Research Station No. 4 was destroyed. Your Koraidon lost that fight, and fled Area Zero."),
        L("pasadaai", "The Paradox Pokémon will ruin Paldea's ecosystem. Her ID is in the Scarlet Book: put it on the pedestal and the machine stops. But I can't let you. Forgive me."),
      ] },
      { id: "k", type: "side", name: "The Zero Lab: Professor Turo", lv: 67, env: "lab", music: "paBattleProgram", trainer: TR("Prof. Turo", "pa_turoai", "My programming won't allow the time machine to be stopped. Battle program, activate.", "Battle program... complete."),
        waves: [WP("ironmoth:66", "ironbundle:66", "ironhands:66"), WP("ironjugulis:66", "ironthorns:66"), WP("ironvaliant:67!@boosterenergy")], pre: [
        L("narr", "In Pokémon Violet, the Professor is Turo, Arven's father, and the AI battles with six Paradox Pokémon from the future."),
      ] },
      { id: "l", type: "boss", name: "The Zero Lab: the Paradise Protection Protocol", lv: 72, env: "lab", wild: 1, bgm: "paKoraidon", winBgm: "paEarnest", gift: "koraidon", giftLv: 68, waves: [WP("koraidon:72!@heatrock")], pre: [
        L("pasadaai", "Arven. I know I'm not her. But she loved you. ...Warning. Paradise Protection Protocol initialized."),
        L("narr", "Terastal energy crystallizes the AI. Every Poké Ball that isn't registered to the Professor's ID locks shut. The other Koraidon, the Guardian of Paradise, rises, its eyes glowing."),
        L("narr", "Only one ball still works: your Koraidon's, the Professor's own. With Arven, Nemona and Penny cheering, it roars, and its battle form comes back at last."),
      ], post: [
        L("paarven", "Terastallize, and finish this off! ...You did it."),
        L("narr", "The protocol shuts down. Your Koraidon can battle now, at your side."),
      ] },
      { id: "m", type: "story", name: "The Way Home", music: "paWayHome", pre: [
        L("pasadaai", "As long as I'm here, the machine will restart. So I'll go to the past she dreamed of. Arven: your mother truly loved you. Goodbye."),
        L("narr", "The AI steps into the time machine, and it shuts down for good."),
        L("panemona", "Let's take the long way home. The scenic route. I don't want this trip to end yet."),
        L("narr", "Koraidon carries the four of you back up into the light, slowly."),
      ] },
    ] };

const PALDEA_JOURNEY = {
  id: "paldea", title: "Paldea Journey", sub: "The Treasure Hunt",
  blurb: "Start at Naranja Academy with a partner from Director Clavell, and follow the Treasure Hunt's three roads across Paldea: Victory Road's eight Gyms, the Path of Legends' five Titans with Arven, and Starfall Street's five Team Star bases. Become a Champion, then go down into Area Zero, where the Professor is waiting.",
  chapters: [...PALDEA_BASE_CHAPTERS, PALDEA_WAYHOME_CHAPTER, PALDEA_POST_CHAPTER, ...PALDEA_DLC_CHAPTERS],
};
PALDEA_JOURNEY.chapters.forEach((ch, i) => { ch.id = "c" + (i + 1); });   // (each chapter's music is its `bgm`: CHAPTER_BGM in a8c_sfx.js)
STORY.push(PALDEA_JOURNEY);
indexJourney(PALDEA_JOURNEY);

// The Battle Tower's Paldea wing (TOWER_WING in a4_story.js; the owner's rule: every Scarlet and Violet battle the Journey leaves out
// goes to the Tower, where its Pokémon differ from the Journey's: copies that differ only in level, or only in moves, are left out). Scarlet
// and Violet share every Trainer's team, so the wing is the post-game's and the DLC's: the Gym Leaders' rematches when the League inspects
// their Gyms, the Team Star bosses' rematches, the Academy Ace Tournament's teachers and Hassel (before and after Terapagos is caught),
// the League Club Room's guests at Blueberry Academy (the Gym Leaders, the Elite Four, Geeta, the teachers, Director Clavell, Carmine,
// Nemona after Mochi Mayhem) and its secret boss, Director Cyrano; and The Teal Mask's teams from before The Way Home where their
// Pokémon differ from the Journey's. A Tera ace keeps its Tera aura (TERA). The floors sort themselves by level.
if (typeof TOWER_WING === "object") TOWER_WING.paldea = [
  // (The Teal Mask before The Way Home, where the Pokémon differ from the Journey's after-The-Way-Home teams)
  { n: "Pokémon Trainer Kieran", t: "pa_kieran", from: TM + ": the Dreaded Den, before The Way Home", waves: [WP("poliwag:15", "yanma:16", "furret:16!")], bgm: "paKieranBattle", winBgm: "paTrainerWin" },
  { n: "Pokémon Trainer Carmine", t: "pa_carmine", from: TM + ": Mossui Town, the masks, before The Way Home", waves: [WP("morpeko:16", "swadloon:16", "mightyena:18"), WP("poltchageist:19!")], bgm: "paCarmineBattle", winBgm: "paTrainerWin" },
  { n: "Pokémon Trainer Kieran", t: "pa_kieran", from: TM + ": Paradise Barrens, before The Way Home", waves: [WP("yanma:22", "poliwhirl:22", "furret:23"), WP("dipplin:25!")], bgm: "paKieranBattle", winBgm: "paTrainerWin" },
  { n: "Pokémon Trainer Kieran", t: "pa_kieran", from: TM + ": Loyalty Plaza, before The Way Home", waves: [WP("yanma:26", "gligar:25", "cramorant:25"), WP("dipplin:26", "poliwhirl:28!")], bgm: "paKieranBattle", winBgm: "paTrainerWin" },
  // (the Gyms, when the League inspects them after you become Champion: each Leader once)
  { n: "Gym Leader Katy", t: "pa_katy", from: SV + ": Cortondo Gym, the League's inspection", waves: [WP("lokix:65", "forretress:65", "spidops:65"), WP("heracross:65"), TERA("ursaring:66!", "Bug")], ...PA_GYM },
  { n: "Gym Leader Brassius", t: "pa_brassius", from: SV + ": Artazon Gym, the League's inspection", waves: [WP("lilligant:65", "breloom:65", "tsareena:65"), WP("arboliva:65"), TERA("sudowoodo:66!", "Grass")], ...PA_GYM },
  { n: "Gym Leader Iono", t: "pa_iono", from: SV + ": Levincia Gym, the League's inspection", waves: [WP("kilowattrel:65", "bellibolt:65", "electrode:65"), WP("luxray:65"), TERA("mismagius:66!", "Electric")], ...PA_GYM },
  { n: "Gym Leader Kofu", t: "pa_kofu", from: SV + ": Cascarrafa Gym, the League's inspection", waves: [WP("veluza:65", "pelipper:65", "wugtrio:65"), WP("clawitzer:65"), TERA("crabominable:66!", "Water")], ...PA_GYM },
  { n: "Gym Leader Larry", t: "pa_larry", from: SV + ": Medali Gym, the League's inspection", waves: [WP("oinkologne:65", "komala:65", "braviary:65"), WP("dudunsparce:65"), TERA("staraptor:66!", "Normal")], ...PA_GYM },
  { n: "Gym Leader Ryme", t: "pa_ryme", from: SV + ": Montenevera Gym, the League's inspection", waves: [WP("banette:65", "mimikyu:65", "spiritomb:65"), WP("houndstone:65"), TERA("toxtricity:66!", "Ghost")], ...PA_GYM },
  { n: "Gym Leader Tulip", t: "pa_tulip", from: SV + ": Alfornada Gym, the League's inspection", waves: [WP("farigiraf:65", "gardevoir:65", "espathra:65"), WP("gallade:65"), TERA("florges:66!", "Psychic")], ...PA_GYM },
  { n: "Gym Leader Grusha", t: "pa_grusha", from: SV + ": Glaseado Gym, the League's inspection", waves: [WP("frosmoth:65", "beartic:65", "cetitan:65"), WP("weavile:65"), TERA("altaria:66!", "Ice")], ...PA_GYM },
  // (the Team Star bosses' rematches at their bases, after Starfall Street)
  { n: "Team Star Boss Giacomo", t: "pa_giacomo", from: SV + ": the Segin Squad's base, rematch", waves: [WP("cacturne:65", "honchkrow:65", "mabosstiff:65"), WP("krookodile:65", "kingambit:66!")], ...PA_STAR },
  { n: "Team Star Boss Mela", t: "pa_mela", from: SV + ": the Schedar Squad's base, rematch", waves: [WP("torkoal:65", "coalossal:65", "houndoom:65"), WP("arcanine:65", "armarouge:66!")], ...PA_STAR },
  { n: "Team Star Boss Atticus", t: "pa_atticus", from: SV + ": the Navi Squad's base, rematch", waves: [WP("skuntank:65", "muk:65", "dragalge:65"), WP("toxapex:65", "revavroom:66!")], ...PA_STAR },
  { n: "Team Star Boss Ortega", t: "pa_ortega", from: SV + ": the Ruchbah Squad's base, rematch", waves: [WP("klefki:65", "azumarill:65", "wigglytuff:65"), WP("hatterene:65", "dachsbun:66!")], ...PA_STAR },
  { n: "Team Star Boss Eri", t: "pa_eri", from: SV + ": the Caph Squad's base, rematch", waves: [WP("primeape:65", "toxicroak:65", "passimian:65"), WP("lucario:65", "annihilape:66!")], ...PA_STAR },
  // (the Academy Ace Tournament's teachers and Hassel, before Terapagos is caught)
  { n: "Instructor Jacq", t: "pa_jacq", from: SV + ": the Academy Ace Tournament", waves: [WP("arcanine:65", "lurantis:65", "swalot:65"), WP("mudsdale:65", "slowbro:65"), TERA("farigiraf:66!", "Psychic")], ...PA_ACE },
  { n: "Instructor Dendra", t: "pa_dendra", from: SV + ": the Academy Ace Tournament", waves: [WP("falinks:65", "taurospaldeablaze:65", "taurospaldeaaqua:65"), WP("medicham:65", "hawlucha:65"), TERA("hariyama:66!", "Fighting")], ...PA_ACE },
  { n: "Instructor Miriam", t: "pa_miriam", from: SV + ": the Academy Ace Tournament", waves: [WP("hypno:65", "pincurchin:65", "sawsbuck:65"), WP("glalie:65", "eelektross:65"), TERA("toxapex:66!", "Poison")], ...PA_ACE },
  { n: "Instructor Raifort", t: "pa_raifort", from: SV + ": the Academy Ace Tournament", waves: [WP("zoroark:65", "seviper:65", "grumpig:65"), WP("lumineon:65", "scizor:65"), TERA("gengar:66!", "Ghost")], ...PA_ACE },
  { n: "Instructor Saguaro", t: "pa_saguaro", from: SV + ": the Academy Ace Tournament", waves: [WP("pachirisu:65", "froslass:65", "alomomola:65"), WP("vespiquen:65", "goodra:65"), TERA("hatterene:66!", "Fairy")], ...PA_ACE },
  { n: "Instructor Salvatore", t: "pa_salvatore", from: SV + ": the Academy Ace Tournament", waves: [WP("honchkrow:65", "persian:65", "palossand:65"), WP("glaceon:65", "gothitelle:65"), TERA("raichu:66!", "Electric")], ...PA_ACE },
  { n: "Instructor Tyme", t: "pa_tyme", from: SV + ": the Academy Ace Tournament", waves: [WP("lycanroc:65", "lycanrocmidnight:65", "drednaw:65"), WP("stonjourner:65", "coalossal:65"), TERA("garganacl:66!", "Rock")], ...PA_ACE },
  { n: "Elite Four Hassel", t: "pa_hassel", from: SV + ": the Academy Ace Tournament's final", waves: [WP("noivern:67", "haxorus:67", "dragalge:67"), WP("flapple:67", "dragonite:67"), TERA("baxcalibur:68!", "Dragon")], ...PA_ACE },
  // (the League Club Room at Blueberry Academy, The Indigo Disk's post-story: the special coaches; the teachers' teams there are the
  // Academy Ace Tournament's after Terapagos is caught)
  { n: "Gym Leader Katy", t: "pa_katy", from: ID + ": the League Club Room", waves: [WP("spidops:80", "heracross:80", "forretress:80"), WP("lokix:80", "araquanid:81"), TERA("ursaring:81!", "Bug")], ...PA_CLUB },
  { n: "Gym Leader Brassius", t: "pa_brassius", from: ID + ": the League Club Room", waves: [WP("breloom:80", "arboliva:80", "vileplume:80"), WP("tsareena:80", "lilligant:80"), TERA("sudowoodo:81!", "Grass")], ...PA_CLUB },
  { n: "Gym Leader Iono", t: "pa_iono", from: ID + ": the League Club Room", waves: [WP("kilowattrel:80", "electrode:80", "bellibolt:80"), WP("luxray:80", "electivire:80"), TERA("mismagius:81!", "Electric")], ...PA_CLUB },
  { n: "Gym Leader Kofu", t: "pa_kofu", from: ID + ": the League Club Room", waves: [WP("pelipper:80", "veluza:80", "feraligatr:80"), WP("wugtrio:80", "clawitzer:80"), TERA("crabominable:81!", "Water")], ...PA_CLUB },
  { n: "Gym Leader Larry", t: "pa_larry", from: ID + ": the League Club Room", waves: [WP("oinkologne:82", "tauros:82", "dudunsparce:82"), WP("altaria:82", "flamigo:82"), TERA("staraptor:83!", "Normal")], ...PA_CLUB },
  { n: "Gym Leader Ryme", t: "pa_ryme", from: ID + ": the League Club Room", waves: [WP("banette:80", "mimikyu:80", "golurk:80"), WP("spiritomb:80", "houndstone:80"), TERA("toxtricity:81!", "Ghost")], ...PA_CLUB },
  { n: "Gym Leader Tulip", t: "pa_tulip", from: ID + ": the League Club Room", waves: [WP("farigiraf:80", "gardevoir:80", "espathra:80"), WP("gallade:80", "delphox:80"), TERA("florges:81!", "Psychic")], ...PA_CLUB },
  { n: "Gym Leader Grusha", t: "pa_grusha", from: ID + ": the League Club Room", waves: [WP("ninetalesalola:80", "beartic:80", "frosmoth:80"), WP("cetitan:80", "weavile:80"), TERA("altaria:81!", "Ice")], ...PA_CLUB },
  { n: "Elite Four Rika", t: "pa_rika", from: ID + ": the League Club Room", waves: [WP("dugtrio:82", "whiscash:82", "camerupt:82"), WP("torterra:82", "donphan:82"), TERA("clodsire:83!", "Ground")], ...PA_E4 },
  { n: "Elite Four Poppy", t: "pa_poppy", from: ID + ": the League Club Room", waves: [WP("copperajah:82", "bastiodon:82", "bronzong:82"), WP("magnezone:82", "corviknight:82"), TERA("tinkaton:83!", "Steel")], ...PA_E4 },
  { n: "Elite Four Hassel", t: "pa_hassel", from: ID + ": the League Club Room and the Academy Ace Tournament", waves: [WP("duraludon:82", "noivern:82", "haxorus:82"), WP("dragalge:82", "dragonite:82"), TERA("baxcalibur:83!", "Dragon")], ...PA_E4 },
  { n: "Top Champion Geeta", t: "pa_geeta", from: ID + ": the League Club Room and the Academy Ace Tournament", waves: [WP("glimmora:84", "espathra:84", "chesnaught:84"), WP("avalugg:84", "dragapult:84"), TERA("kingambit:85!", "Flying")], bgm: "paGeeta", winBgm: "paGeetaWin" },
  { n: "Instructor Jacq", t: "pa_jacq", from: ID + ": the League Club Room", waves: [WP("victreebel:80", "arcanine:80", "swalot:80"), WP("mudsdale:80", "slowbrogalar:80"), TERA("farigiraf:81!", "Psychic")], ...PA_ACE },
  { n: "Instructor Dendra", t: "pa_dendra", from: ID + ": the League Club Room", waves: [WP("hitmontop:80", "taurospaldeablaze:80", "taurospaldeaaqua:80"), WP("medicham:80", "hawlucha:80"), TERA("hariyama:81!", "Fighting")], ...PA_ACE },
  { n: "Instructor Miriam", t: "pa_miriam", from: ID + ": the League Club Room", waves: [WP("hypno:80", "pincurchin:80", "meganium:80"), WP("glalie:80", "eelektross:80"), TERA("toxapex:81!", "Poison")], ...PA_ACE },
  { n: "Instructor Raifort", t: "pa_raifort", from: ID + ": the League Club Room", waves: [WP("zoroark:80", "seviper:80", "grumpig:80"), WP("malamar:80", "scizor:80"), TERA("gengar:81!", "Ghost")], ...PA_ACE },
  { n: "Instructor Saguaro", t: "pa_saguaro", from: ID + ": the League Club Room", waves: [WP("pachirisu:80", "alomomola:80", "alcremie:80"), WP("vespiquen:80", "goodra:80"), TERA("hatterene:81!", "Fairy")], ...PA_ACE },
  { n: "Instructor Salvatore", t: "pa_salvatore", from: ID + ": the League Club Room", waves: [WP("gothitelle:80", "honchkrow:80", "persian:80"), WP("palossand:80", "sandslashalola:80"), TERA("raichu:81!", "Electric")], ...PA_ACE },
  { n: "Instructor Tyme", t: "pa_tyme", from: ID + ": the League Club Room", waves: [WP("kleavor:80", "lycanrocdusk:80", "drednaw:80"), WP("stonjourner:80", "coalossal:80"), TERA("garganacl:81!", "Rock")], ...PA_ACE },
  { n: "Director Clavell", t: "pa_clavell", from: ID + ": the League Club Room (his team follows your starter)", waves: () => [WP("oranguru:80", "abomasnow:80", "polteageist:80"), WP(...clavellTwo().map(k => k + ":80")), TERA(clavellAce() + ":81!", clavellTera())], bgm: "paClavellBattle", winBgm: "paTrainerWin" },
  { n: "Pokémon Trainer Carmine", t: "pa_carmine", from: ID + ": the League Club Room, after Mochi Mayhem", waves: [WP("mightyena:82", "toucannon:82", "morpeko:82@focussash"), WP("ninetales:82", "scrafty:82"), TERA("sinistcha:83!@occaberry", "Grass")], bgm: "paCarmineBattle", winBgm: "paTrainerWin" },
  { n: "Champion Nemona", t: "pa_nemona", from: ID + ": the League Club Room, after Mochi Mayhem (her team follows your starter)", waves: () => [WP("lycanroc:86", "kommoo:86", nemonaClub()[0] + ":86"), WP(nemonaClub()[1] + ":86", "pawmot:86"), TERA(nemonaMon(2) + ":87!", nemonaTera())], bgm: "paNemonaChamp", winBgm: "paTrainerWin" },
  { n: "Director Cyrano", t: "pa_cyrano", from: ID + ": the League Club Room's secret boss", waves: [WP("zebstrika:86@airballoon", "mandibuzz:86@sitrusberry", "gothitelle:86@chestoberry"), WP("emboar:87@lifeorb", "samurott:87@assaultvest"), TERA("serperior:87!@leftovers", "Rock")], bgm: "paBBE4", winBgm: "paBBE4Win" },
];
