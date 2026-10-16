
// ---------- sound (tiny WebAudio synth) ----------
const SFX = { ctx: null, noise: null };
function sfx(kind) {
  if (!soundOn()) return;
  try {
    const A = SFX.ctx || (SFX.ctx = new (window.AudioContext || window.webkitAudioContext)());
    if (A.state === "suspended") A.resume();
    const t = A.currentTime;
    const osc = (type, f0, f1, dur, vol, at = 0) => {
      const o = A.createOscillator(), g = A.createGain(); o.type = type; o.connect(g); g.connect(A.destination);
      o.frequency.setValueAtTime(f0, t + at); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + at + dur);
      g.gain.setValueAtTime(.0001, t + at); g.gain.exponentialRampToValueAtTime(vol, t + at + .015); g.gain.exponentialRampToValueAtTime(.0001, t + at + dur);
      o.start(t + at); o.stop(t + at + dur + .02);
    };
    const noise = (dur, vol, freq = 1200) => {
      if (!SFX.noise) { const b = A.createBuffer(1, A.sampleRate * .6, A.sampleRate), d = b.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = R() * 2 - 1; SFX.noise = b; }
      const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = SFX.noise; f.type = "lowpass"; f.frequency.value = freq;
      s.connect(f); f.connect(g); g.connect(A.destination);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); s.start(t); s.stop(t + dur);
    };
    if (kind === "blaster") osc("square", 1500 + R() * 300, 160, .17, .05);
    else if (kind === "saber") { noise(.16, .2, 2600); osc("sine", 1100, 320, .14, .02); }
    else if (kind === "bow") { noise(.06, .22, 3200); osc("triangle", 240, 110, .14, .06); }
    else if (kind === "shot") { noise(.11, .38, 3400); osc("square", 190, 55, .09, .06); }
    else if (kind === "arts") { osc("sine", 620, 1500, .18, .045); osc("triangle", 310, 920, .22, .03, .03); }
    else if (kind === "hit") noise(.12, .18, 900);
    else if (kind === "crit") { noise(.2, .28, 1600); osc("square", 300, 90, .2, .05); }
    else if (kind === "boom") { noise(.7, .45, 420); osc("sine", 120, 30, .6, .25); }
    else if (kind === "zap") { for (let k = 0; k < 4; k++) osc("square", 800 + R() * 900, 200 + R() * 300, .07, .03, k * .06); }
    else if (kind === "heal") { [523, 659, 784].forEach((f, k) => osc("sine", f, f * 1.01, .25, .05, k * .07)); }
    else if (kind === "special") { osc("sawtooth", 160, 640, .45, .045); osc("sine", 320, 1280, .45, .04); }
    else if (kind === "win") { [392, 523, 659, 784].forEach((f, k) => osc("triangle", f, f, .32, .07, k * .12)); }
    else if (kind === "lose") { [392, 330, 262].forEach((f, k) => osc("triangle", f, f * .98, .4, .06, k * .18)); }
    else if (kind === "flame") noise(.6, .2, 700);
    else if (kind === "tap") osc("sine", 880, 660, .05, .03);
    else if (kind === "warp") osc("sine", 200, 1400, .4, .04);
  } catch (e) { /* audio unavailable */ }
}

// ---------- music: the FireRed/LeafGreen soundtrack in resources/audio/music, which ships next to the HTML ----------
// Plain <audio> elements, so it also plays when the game is opened from the folder. A copy of the HTML without the
// folder simply stays silent. The volume is S.settings.music (0 = off), or the device's for the title screen.
const MUSIC_DIR = "resources/audio/music/";
const BGM = {
  title: "1-03. Title Screen.mp3", home: "1-05. Pallet Town.mp3", center: "1-14. Pokémon Center.mp3", mystery: "2-12. Mystery Gift.mp3", union: "2-13. Union Room.mp3",
  gameCorner: "1-45. Rocket Game Corner.mp3", plateau: "2-20. Indigo Plateau.mp3", evolution: "2-03. Evolution.mp3", gymHall: "1-29. Pokémon Gym.mp3",
  route1: "1-10. Route 1.mp3", route3: "1-26. Route 3.mp3", route24: "1-35. Route 24.mp3", route11: "1-39. Route 11.mp3", forest: "1-18. Viridian Forest.mp3", moon: "1-25. Mt. Moon.mp3",
  lavender: "1-42. Lavender Town.mp3", ptower: "1-43. Pokémon Tower.mp3", rocket: "1-50. Team Rocket Hideout.mp3", silph: "1-53. Silph Co..mp3", surf: "1-55. Surf.mp3", mansion: "2-02. Pokémon Mansion.mp3",
  wild: "1-11. Battle! (Wild Pokémon).mp3", trainer: "1-22. Battle! (Trainer).mp3", gym: "1-31. Battle! (Gym Leader).mp3", legend: "1-56. Battle! (Legendary Pokémon).mp3", mewtwo: "2-17. Battle! (Mewtwo).mp3",
  champion: "2-21. Battle! (Champion).mp3", link: "2-15. Battle! (Trainer - Hoenn Version).mp3", ranked: "2-16. Battle! (Gym Leader - Hoenn Version).mp3",
  wildWin: "1-12. Victory! (Wild Pokémon).mp3", trainerWin: "1-23. Victory! (Trainer).mp3", gymWin: "1-32. Victory! (Gym Leader).mp3", fame: "2-23. Hall of Fame.mp3",
};
// Pokémon Showdown's battle themes (play.pokemonshowdown.com/audio, in resources/audio/showdown next to the HTML). The owner's picks:
// the Battle Tower plays the Battle Subway's (its famous Trainers every fifth floor, Black 2/White 2's Kanto Gym Leaders'), Raid Battles
// an Elite Four remix or Roxie's band, Team Rocket Miror B.'s from Colosseum and XD; the rest, with the FireRed/LeafGreen Stadium
// tracks, are the Battle Stadium's cycle, one picked at random for each Ranked, Link and friendly battle
const SD_MUSIC_DIR = "resources/audio/showdown/";
const SD_THEMES = ["bw-trainer", "bw-rival", "bw-subway-trainer", "bw2-kanto-gym-leader", "bw2-rival", "bw2-homika-dogars", "dpp-trainer", "dpp-rival",
  "hgss-johto-trainer", "hgss-kanto-trainer", "xy-trainer", "xy-rival", "oras-trainer", "oras-rival", "sm-trainer", "sm-rival", "colosseum-miror-b", "xd-miror-b", "spl-elite4"];
for (const t of SD_THEMES) BGM["sd:" + t] = "sd:" + t + ".mp3";
const TOWER_THEME = "sd:bw-subway-trainer", TOWER_STAR_THEME = "sd:bw2-kanto-gym-leader", RAID_THEMES = ["sd:spl-elite4", "sd:bw2-homika-dogars"], ROCKET_THEMES = ["sd:colosseum-miror-b", "sd:xd-miror-b"];
const STADIUM_THEMES = ["ranked", "link", ...SD_THEMES.map(t => "sd:" + t).filter(k => ![TOWER_THEME, TOWER_STAR_THEME, ...RAID_THEMES, ...ROCKET_THEMES].includes(k))];
const pickOf = list => list[Math.floor(Math.random() * list.length)];
// a new one each battle, never the one just played
let lastStadiumTheme = null;
function stadiumTheme() {
  const pool = STADIUM_THEMES.filter(k => k !== lastStadiumTheme);
  return (lastStadiumTheme = pool[Math.floor(Math.random() * pool.length)]);
}
// the Johto Journey's music: HeartGold/SoulSilver's (the owner's download, resources/audio/johto next to the HTML, "jo:" keys)
const JOHTO_MUSIC_DIR = "resources/audio/johto/";
Object.assign(BGM, {
  joNewBark: "jo:1-04. New Bark Town.mp3", joCherrygrove: "jo:1-13. Cherrygrove City.mp3", joViolet: "jo:1-22. Violet City.mp3", joAzalea: "jo:1-33. Azalea Town.mp3",
  joGoldenrod: "jo:1-41. Goldenrod City.mp3", joEcruteak: "jo:2-21. Ecruteak City.mp3", joCianwood: "jo:2-32. Cianwood City.mp3", joRoute29: "jo:1-09. Route 29.mp3",
  joRoute30: "jo:1-20. Route 30.mp3", joRoute34: "jo:1-36. Route 34.mp3", joRoute38: "jo:2-27. Route 38.mp3", joRoute42: "jo:2-38. Route 42.mp3",
  joRoute26: "jo:3-01. Route 26.mp3", joLab: "jo:1-07. Elm Pokémon Lab.mp3", joSprout: "jo:1-23. Sprout Tower.mp3", joUnion: "jo:1-28. Union Cave.mp3",
  joBurned: "jo:2-23. Burned Tower.mp3", joBell: "jo:2-50. Bell Tower.mp3", joAlph: "jo:1-30. Ruins of Alph.mp3", joPark: "jo:2-04. National Park.mp3",
  joLighthouse: "jo:2-30. Olivine Lighthouse.mp3", joRocketHQ: "jo:2-40. Team Rocket HQ.mp3", joRadio: "jo:2-43. Radio Tower Occupied!.mp3", joIcePath: "jo:2-44. Ice Path.mp3",
  joDen: "jo:2-46. Dragon's Den.mp3", joLeague: "jo:4-23. The Pokémon League.mp3", joWild: "jo:1-10. Battle! (Wild Pokémon - Johto Version).mp3", joTrainer: "jo:1-18. Battle! (Trainer - Johto Version).mp3",
  joGym: "jo:1-43. Battle! (Gym Leader - Johto Version).mp3", joRival: "jo:1-38. Battle! (Rival).mp3", joRocket: "jo:1-35. Battle! (Team Rocket).mp3", joRaikou: "jo:2-29. Battle! (Raikou).mp3",
  joEntei: "jo:2-49. Battle! (Entei).mp3", joSuicune: "jo:3-15. Battle! (Suicune).mp3", joHooh: "jo:2-53. Battle! (Ho-Oh).mp3", joLugia: "jo:4-20. Battle! (Lugia).mp3",
  joChampion: "jo:4-24. Battle! (Champion).mp3", joWildWin: "jo:1-11. Victory! (Wild Pokémon).mp3", joTrainerWin: "jo:1-19. Victory! (Trainer).mp3", joGymWin: "jo:1-44. Victory! (Gym Leader).mp3",
  joFame: "jo:4-25. Hall of Fame.mp3",
  // (Crystal's trip to Kanto: HeartGold/SoulSilver's Kanto tracks, the owner's second download; Fuchsia plays Cerulean's theme, Saffron
  // and Viridian Pewter's, as in the games)
  joSSAqua: "jo:3-02. S.S. Aqua.mp3", joVermilion: "jo:3-03. Vermilion City.mp3", joCerulean: "jo:3-09. Cerulean City.mp3", joRoute24: "jo:3-10. Route 24.mp3",
  joCeladon: "jo:3-16. Celadon City.mp3", joRoute11: "jo:3-18. Route 11.mp3", joPewter: "jo:3-22. Pewter City.mp3", joMtMoon: "jo:3-25. Mt. Moon.mp3",
  joCinnabar: "jo:3-29. Cinnabar Island.mp3", joPokeFlute: "jo:3-19. Pokégear Radio - Poké Flute.mp3", joGymKanto: "jo:3-04. Battle! (Gym Leader - Kanto Version).mp3",
  joTrainerKanto: "jo:3-12. Battle! (Trainer - Kanto Version).mp3", joWildKanto: "jo:3-07. Battle! (Wild Pokémon - Kanto Version).mp3",
  // (the owner's third download: Johto's Gym hall and Victory Road, its scenes' people and places, and the Battle Frontier for its Battle Tower wing)
  joGymHall: "jo:1-42. Pokémon Gym.mp3", joVictoryRoad: "jo:4-22. Victory Road.mp3", joSurf: "jo:2-31. Surf.mp3", joEusine: "jo:2-24. Eusine.mp3",
  joClair: "jo:2-47. Clair.mp3", joOak: "jo:3-28. Professor Oak.mp3", joDanceTheater: "jo:2-22. Ecruteak Dance Theater.mp3", joBugContest: "jo:2-07. The Bug-Catching Contest.mp3",
  joBattleTower: "jo:4-02. Battle Tower.mp3", joTowerDesk: "jo:4-01. Battle Tower Reception Desk.mp3", joFrontierBrain: "jo:4-10. Battle! (Frontier Brain).mp3",
  joFrontierWin: "jo:4-11. Victory! (Frontier Brain).mp3",
});
// the Hoenn Journey's: Ruby/Sapphire's (the Super Music Collection, the owner's download, resources/audio/hoenn, "ho:" keys). A
// title with " - " has two spaces each side of the dash in its file name, as khinsider saves it
Object.assign(BGM, {
  hoLittleroot: "ho:1-05. Littleroot Town.mp3", hoOldale: "ho:1-12. Oldale Town.mp3", hoPetalburg: "ho:1-23. Petalburg City.mp3", hoRustboro: "ho:1-29. Rustboro City.mp3",
  hoDewford: "ho:1-32. Dewford Town.mp3", hoSlateport: "ho:1-34. Slateport City.mp3", hoVerdanturf: "ho:1-48. Verdanturf Town.mp3", hoFallarbor: "ho:1-51. Fallarbor Town.mp3",
  hoFortree: "ho:2-03. Fortree City.mp3", hoLilycove: "ho:2-08. Lilycove City.mp3", hoSootopolis: "ho:2-27. Sootopolis City.mp3", hoEverGrande: "ho:2-34. Ever Grande City.mp3",
  hoRoute101: "ho:1-11. Route 101.mp3", hoRoute104: "ho:1-24. Route 104.mp3", hoRoute110: "ho:1-40. Route 110.mp3", hoRoute111: "ho:1-55. Route 111.mp3",
  hoRoute113: "ho:1-49. Route 113.mp3", hoRoute119: "ho:2-02. Route 119.mp3", hoRoute120: "ho:2-04. Route 120.mp3", hoRoute123: "ho:1-04. Introductions.mp3",
  hoSurf: "ho:2-01. Surf.mp3", hoDive: "ho:2-26. Dive.mp3", hoLab: "ho:1-06. Birch Pokémon Lab.mp3", hoWoods: "ho:1-25. Petalburg Woods.mp3",
  hoChimney: "ho:1-53. Mt. Chimney.mp3", hoPyre: "ho:2-16. Mt. Pyre.mp3", hoPyreTop: "ho:2-19. Mt. Pyre Exterior.mp3", hoShip: "ho:2-30. Abandoned Ship.mp3",
  hoHideout: "ho:2-20. Hideout.mp3", hoOrigin: "ho:2-28. Cave of Origin.mp3", hoVictory: "ho:2-36. Victory Road.mp3", hoCenter: "ho:1-15. Pokémon Center.mp3",
  hoMart: "ho:2-15. Poké Mart.mp3", hoGymHall: "ho:1-56. Pokémon Gym.mp3", hoBike: "ho:1-42. Bicycle.mp3", hoSealed: "ho:2-32. Sealed Chamber.mp3",
  hoSafari: "ho:2-06. Safari Zone.mp3", hoWild: "ho:1-09. Battle! (Wild Pokémon).mp3", hoTrainer: "ho:1-19. Battle! (Trainer).mp3", hoGym: "ho:1-57. Battle! (Gym Leader).mp3",
  hoE4: "ho:2-39. Battle! (Elite Four).mp3", hoChampion: "ho:2-41. Battle! (Steven).mp3", hoRival: "ho:2-12. Battle! (Brendan  -  May).mp3",
  hoTeam: "ho:1-27. Battle! (Team Aqua  -  Team Magma).mp3", hoBoss: "ho:2-22. Battle! (Team Aqua  -  Team Magma Leaders).mp3", hoAncient: "ho:2-29. Battle! (Super-Ancient Pokémon).mp3",
  hoRegi: "ho:2-33. Battle! (Regirock  -  Regice  -  Registeel).mp3", hoWildWin: "ho:1-10. Victory! (Wild Pokémon).mp3", hoTrainerWin: "ho:1-20. Victory! (Trainer).mp3",
  hoGymWin: "ho:1-58. Victory! (Gym Leader).mp3", hoLeagueWin: "ho:2-42. Victory! (Steven).mp3", hoTeamWin: "ho:1-28. Victory! (Team Aqua  -  Team Magma).mp3",
  hoFame: "ho:2-44. Hall of Fame.mp3", hoEnding: "ho:2-45. Ending.mp3", hoEvolution: "ho:2-13. Evolution.mp3",
  // Emerald's own (the album's third disc, the owner's OK of 2026-10-15): the abnormal weather of the Sootopolis clash, Rayquaza's
  // arrival, and the Battle Frontier (its grounds, the Battle Tower's lobby, the Frontier Brains)
  hoAbnormal: "ho:3-03. Abnormal Weather.mp3", hoRayquaza: "ho:3-04. Rayquaza Appears!.mp3", hoFrontier: "ho:3-05. Battle Frontier.mp3",
  hoBattleTower: "ho:3-06. Battle Tower.mp3", hoFrontierBrain: "ho:3-16. Battle! (Frontier Brain).mp3",
  // the owner's second OK (2026-10-15): Emerald's encounter themes for a Trainer stage's scene (the class's own, as
  // `PlayTrainerEncounterMusic` picks it; the rival's, Team Magma's and Aqua's, the Elite Four's and the Champion's, as their scripts play
  // them), H-Help! on Route 101, Mr. Briney's boat, the Oceanic Museum, Deoxys, and the Frontier's facilities (their lobbies)
  hoHelp: "ho:1-08. H-Help!.mp3", hoMeetMay: "ho:1-07. May.mp3", hoMeetBrendan: "ho:2-11. Brendan.mp3", hoMeetMagma: "ho:1-26. Team Magma Appears!.mp3",
  hoMeetAqua: "ho:2-21. Team Aqua Appears!.mp3", hoMeetE4: "ho:2-38. The Elite Four Appear!.mp3", hoMeetChampion: "ho:2-40. Champion Steven.mp3",
  hoEyesYoungster: "ho:1-17. Trainers' Eyes Meet (Youngster).mp3", hoEyesLass: "ho:1-18. Trainers' Eyes Meet (Lass).mp3", hoEyesTwins: "ho:1-50. Trainers' Eyes Meet (Twins).mp3",
  hoEyesHiker: "ho:1-54. Trainers' Eyes Meet (Hiker).mp3", hoEyesPsychic: "ho:2-17. Trainers' Eyes Meet (Psychic).mp3", hoEyesAce: "ho:2-37. Trainers' Eyes Meet (Ace Trainer).mp3",
  hoSailing: "ho:1-31. Crossing the Sea.mp3", hoMuseum: "ho:1-35. Oceanic Museum.mp3", hoDeoxysAppears: "ho:3-18. Deoxys Appears.mp3", hoDeoxys: "ho:3-19. Battle! (Deoxys).mp3",
  hoDome: "ho:3-10. Battle Dome.mp3", hoArena: "ho:3-08. Battle Arena.mp3", hoPike: "ho:3-11. Battle Pike.mp3", hoPalace: "ho:3-12. Battle Palace.mp3", hoPyramid: "ho:3-13. Battle Pyramid.mp3",
});
// the Sinnoh Journey's: Diamond/Pearl's and Platinum's (the Diamond & Pearl Super Music Collection, looped, whose fifth disc is
// Platinum's own music: the owner's download, resources/audio/sinnoh, "si:" keys). What plays where is Platinum's (pret/pokeplatinum):
// Pastoria plays Solaceon's theme, Celestic Eterna's, the lakes under Team Galactic the Eterna Building's
Object.assign(BGM, {
  siTwinleaf: "si:1-04. Twinleaf Town (Day).mp3", siSandgem: "si:1-16. Sandgem Town (Day).mp3", siJubilife: "si:1-29. Jubilife City (Day).mp3", siOreburgh: "si:1-40. Oreburgh City (Day).mp3",
  siFloaroma: "si:2-07. Floaroma Town (Day).mp3", siEterna: "si:2-17. Eterna City (Day).mp3", siHearthome: "si:2-31. Hearthome City (Day).mp3", siSolaceon: "si:3-04. Solaceon Town (Day).mp3",
  siVeilstone: "si:3-09. Veilstone City (Day).mp3", siCanalave: "si:3-22. Canalave City (Day).mp3", siSnowpoint: "si:3-27. Snowpoint City (Day).mp3", siSunyshore: "si:4-08. Sunyshore City (Day).mp3",
  siFightArea: "si:4-11. Fight Area (Day).mp3", siLeague: "si:4-23. The Pokémon League (Day).mp3", siRoute201: "si:1-07. Route 201 (Day).mp3", siRoute203: "si:1-35. Route 203 (Day).mp3",
  siRoute205: "si:2-10. Route 205 (Day).mp3", siRoute206: "si:2-28. Route 206 (Day).mp3", siRoute209: "si:3-01. Route 209 (Day).mp3", siRoute210: "si:3-07. Route 210 (Day).mp3",
  siRoute216: "si:3-25. Route 216 (Day).mp3", siRoute225: "si:4-14. Route 225 (Day).mp3", siValor: "si:3-16. Valor Lakefront (Day).mp3", siSurf: "si:3-20. Surf.mp3",
  siBike: "si:2-26. Bicycle.mp3", siLab: "si:1-18. The Pokémon Lab.mp3", siCenter: "si:1-20. Pokémon Center (Day).mp3", siMart: "si:1-32. Poké Mart.mp3",
  siGymHall: "si:2-01. Pokémon Gym.mp3", siGalactic: "si:2-19. Galactic Eterna Building.mp3", siLake: "si:1-09. Lake.mp3", siLakeCave: "si:4-06. Lake Caverns.mp3",
  siGate: "si:1-38. Oreburgh Gate.mp3", siCoronet: "si:4-01. Mt. Coronet.mp3", siForest: "si:2-14. Eterna Forest.mp3", siChateau: "si:2-16. Old Chateau.mp3",
  siMine: "si:1-42. Oreburgh Mine.mp3", siMarsh: "si:3-18. Great Marsh.mp3", siHQ: "si:3-29. Team Galactic HQ.mp3", siHQDeep: "si:3-31. Deep Within Team Galactic HQ.mp3",
  siSpear: "si:4-02. Spear Pillar.mp3", siDistortion: "si:5-16. Distortion World.mp3", siVictory: "si:4-21. Victory Road.mp3", siLeagueHall: "si:4-25. Decisive Battle! (Pokémon League).mp3",
  siStark: "si:4-16. Stark Mountain.mp3", siGalacticAppears: "si:2-12. Team Galactic Appears!.mp3", siDawn: "si:1-14. Dawn.mp3", siLucas: "si:1-13. Lucas.mp3",
  siBarry: "si:1-06. Rival.mp3", siCynthia: "si:4-29. Champion Cynthia.mp3", siIntro: "si:1-02. Introduction.mp3", siLooker: "si:5-03. Looker.mp3",
  siGiratinaAppears: "si:5-15. Giratina Appears!.mp3", siLegendAppears: "si:4-03. The Legendary Pokémon Appears!.mp3",
  siWild: "si:1-11. Battle! (Wild Pokémon).mp3", siTrainer: "si:1-26. Battle! (Trainer).mp3", siGym: "si:2-02. Battle! (Gym Leader).mp3", siRival: "si:1-37. Battle! (Rival).mp3",
  siTeam: "si:2-13. Battle! (Team Galactic).mp3", siCommander: "si:2-20. Battle! (Team Galactic Commander).mp3", siBoss: "si:3-30. Battle! (Team Galactic Boss).mp3",
  siLakeTrio: "si:4-07. Battle! (Azelf  -  Mesprit  -  Uxie).mp3", siDialga: "si:4-05. Battle! (Dialga  -  Palkia).mp3", siGiratina: "si:5-17. Battle! (Giratina).mp3",
  siLegend: "si:4-17. Battle! (Legendary Pokémon).mp3", siRegi: "si:5-21. Battle! (Regirock  -  Regice  -  Registeel).mp3", siE4: "si:4-27. Battle! (Elite Four).mp3",
  siChampion: "si:4-30. Battle! (Champion).mp3", siWildWin: "si:1-12. Victory! (Wild Pokémon).mp3", siTrainerWin: "si:1-27. Victory! (Trainer).mp3",
  siGymWin: "si:2-03. Victory! (Gym Leader).mp3", siTeamWin: "si:2-21. Victory! (Team Galactic).mp3", siE4Win: "si:4-28. Victory! (Elite Four).mp3",
  siChampionWin: "si:4-31. Victory! (Champion).mp3", siFame: "si:4-33. Congratulations On Entering the Hall of Fame!.mp3", siEnding: "si:4-34. Ending.mp3", siEvolution: "si:2-22. Evolution.mp3",
  siUnderground: "si:2-24. The Underground.mp3", siOrigin: "si:5-33. Hall of Origin.mp3", siArceus: "si:5-34. Battle! (Arceus).mp3",
  // (the Battle Tower's Sinnoh wing: Platinum's Tower lobby and Frontier Brain themes; story cues; BDSP's own Ramanas Park, from its gamerip,
  // whose file names have no dot after the number)
  siBattleTower: "si:4-13. Battle Tower.mp3", siFrontierBrain: "si:5-30. Battle! (Frontier Brain).mp3", siFrontierWin: "si:5-31. Victory! (Frontier Brain).mp3",
  siCatastrophe: "si:4-04. Catastrophe!.mp3", siE4Appear: "si:4-26. The Elite Four Appear!.mp3", siRamanas: "si:5-01 Ramanas Park.mp3",
});
// the Unova Journey's (the owner's download, 2026-10-15: Black/White's Super Music Collection in resources/audio/unova, "un:" keys, and
// Black 2/White 2's in resources/audio/unova2, "u2:", whose CD holds only the sequel's new music; 159 tracks, Black's and Black 2's
// side of the version pairs). Part 1 plays Black/White's, Part 2 its own game's where the sequel rearranged a theme (unovaMusic)
Object.assign(BGM, {
  unNuvema: "un:1-06. Nuvema Town.mp3", unAccumula: "un:1-17. Accumula Town.mp3", unStriaton: "un:1-30. Striaton City.mp3", unNacrene: "un:1-41. Nacrene City.mp3",
  unCastelia: "un:1-51. Castelia City.mp3", unNimbasa: "un:1-55. Nimbasa City.mp3", unDriftveil: "un:2-02. Driftveil City.mp3",
  unMistralton: "un:2-08. Mistralton City.mp3", unIcirrus: "un:2-13. Icirrus City.mp3", unOpelucid: "un:2-23. Opelucid City Gym (Pokémon Black).mp3",
  unLacunosa: "un:4-04. Lacunosa Town.mp3", unUndella: "un:3-47. Undella Town (Autumn - Winter - Spring).mp3", unAnville: "un:3-30. Anville Town.mp3",
  unBlackCity: "un:3-38. Black City.mp3", unLeague: "un:2-28. The Pokémon League.mp3", unRoute1: "un:1-13. Route 1.mp3",
  unRoute2: "un:1-23. Route 2 (Spring - Summer).mp3", unRoute4: "un:1-53. Route 4 (Spring).mp3", unRoute6: "un:2-04. Route 6 (Spring - Summer).mp3",
  unRoute10: "un:2-25. Route 10.mp3", unRoute12: "un:3-32. Route 12 (Spring - Summer).mp3", unSkyarrow: "un:1-50. Skyarrow Bridge.mp3",
  unDrawbridge: "un:2-01. Driftveil Drawbridge.mp3", unTubeline: "un:2-20. Tubeline Bridge.mp3", unVillageBridge: "un:4-05. Village Bridge.mp3",
  unMarvelous: "un:3-31. Marvelous Bridge.mp3", unGate: "un:1-49. Gate.mp3", unSurf: "un:4-01. Surf.mp3", unBike: "un:1-61. Bicycle.mp3",
  unLab: "un:1-10. Juniper Pokémon Lab.mp3", unCenter: "un:1-19. Pokémon Center.mp3", unGymHall: "un:1-43. Pokémon Gym.mp3", unDreamyard: "un:1-32. The Dreamyard.mp3",
  unChargestone: "un:2-07. Chargestone Cave.mp3", unRelic: "un:2-18. Relic Castle.mp3", unColdStorage: "un:2-03. Cold Storage.mp3",
  unDragonspiral: "un:2-14. Dragonspiral Tower.mp3", unDragonspiralTop: "un:2-16. Dragonspiral Tower Top Floor.mp3", unMall: "un:2-21. Shopping Mall Nine.mp3",
  unVictory: "un:2-26. Victory Road.mp3", unNCastle: "un:2-32. N's Castle.mp3", unNRoom: "un:2-33. The Pokémon Child, N.mp3", unAbyssal: "un:4-02. Abyssal Ruins.mp3",
  unLostlorn: "un:3-51. Lostlorn Forest.mp3", unRoyal: "un:3-04. The Royal Unova.mp3", unGearStation: "un:3-11. Gear Station.mp3",
  unSubway: "un:3-12. The Battle Subway.mp3", unMusical: "un:3-15. Musical Theater.mp3", unEntralink: "un:3-41. Entralink.mp3",
  unTransfer: "un:3-34. Poké Transfer Lab.mp3", unJuniper: "un:1-09. Professor Juniper.mp3", unN: "un:1-58. Prisoner to a Formula.mp3",
  unPlasma: "un:1-33. Team Plasma Appears!.mp3", unPlasmaEyes: "un:2-15. Trainers' Eyes Meet (Team Plasma).mp3", unGhetsisTheme: "un:2-38. Ghetsis' Ambitions.mp3",
  unPlots: "un:1-22. Team Plasma Plots.mp3", unCheren: "un:1-39. Cheren's Theme.mp3", unBianca: "un:1-56. Bianca's Theme.mp3", unAlder: "un:1-62. Champion Alder.mp3",
  unCynthia: "un:3-49. Cynthia's Theme.mp3", unWild: "un:1-14. Battle! (Wild Pokémon).mp3", unStrongWild: "un:3-52. Battle! (Strong Wild Pokémon).mp3",
  unTrainer: "un:1-26. Battle! (Trainer Battle).mp3", unGym: "un:1-44. Battle! (Gym Leader).mp3", unGymLast: "un:1-45. Victory Lies Before You!.mp3",
  unRival: "un:1-07. Battle! (Cheren - Bianca).mp3", unNBattle: "un:1-59. Battle! (N).mp3", unNFinal: "un:2-37. Decisive Battle! (N).mp3",
  unTeam: "un:1-34. Battle! (Team Plasma).mp3", unGhetsis: "un:2-39. Battle! (Ghetsis).mp3", unDragon: "un:2-36. Battle! (Reshiram - Zekrom).mp3",
  unKyurem: "un:4-10. Battle! (Kyurem).mp3", unLegend: "un:3-29. Battle! (Legendary Pokémon).mp3", unE4: "un:2-29. Battle! (Elite Four).mp3",
  unChampion: "un:4-12. Battle! (Champion).mp3", unCynthiaBattle: "un:3-50. Battle! (Cynthia).mp3", unSubwayTrainer: "un:3-13. Battle! (Battle Subway Trainer).mp3",
  unWildWin: "un:1-15. Victory! (Wild Pokémon.mp3", unTrainerWin: "un:1-27. Victory! (Trainer Battle).mp3", unTeamWin: "un:1-35. Victory! (Team Plasma).mp3",
  unGymWin: "un:1-46. Victory! (Gym Leader).mp3", unChampionWin: "un:4-13. Victory! (Champion).mp3", unTitle: "un:1-03. Title Screen.mp3",
  unEvolution: "un:1-36. Evolution.mp3", unFame: "un:4-14. Congratulations on Entering the Hall of Fame!.mp3", unEnding: "un:2-41. Ending  Onward to Our Own Futures.mp3",
  u2Frozen: "u2:2-31. The Frozen City.mp3", u2Aspertia: "u2:1-04. Aspertia City.mp3", u2Floccesy: "u2:1-08. Floccesy Town.mp3", u2Virbank: "u2:1-12. Virbank City.mp3",
  u2Lentimas: "u2:2-23. Lentimas Town.mp3", u2Humilau: "u2:2-36. Humilau City.mp3", u2Route19: "u2:1-06. Route 19 (Spring - Summer).mp3",
  u2Route22: "u2:2-38. Route 22 (Spring - Summer).mp3", u2Route23: "u2:3-09. Route 23.mp3", u2Ranch: "u2:1-09. Floccesy Ranch.mp3",
  u2Pokestar: "u2:1-15. Pokéstar Studios.mp3", u2Sewers: "u2:1-33. Castelia Sewers.mp3", u2JoinAvenue: "u2:1-40. Join Avenue.mp3", u2Unity: "u2:1-37. Unity Tower.mp3",
  u2PWT: "u2:2-02. Pokémon World Tournament (PWT).mp3", u2PWTArena: "u2:2-03. The PWT.mp3", u2VirbankGym: "u2:1-13. Virbank Gym.mp3",
  u2CasteliaGym: "u2:1-34. Castelia City Gym.mp3", u2NimbasaGym: "u2:1-44. Nimbasa City Gym - Runway.mp3", u2NimbasaStage: "u2:1-46. Nimbasa City Gym - Stage.mp3",
  u2DriftveilGym: "u2:2-01. Driftveil Gym.mp3", u2MistraltonGym: "u2:2-20. Mistralton City Gym.mp3", u2OpelucidGym: "u2:2-29. Opelucid City Gym.mp3",
  u2HumilauGym: "u2:2-37. Humilau City Gym.mp3", u2Strange: "u2:2-27. Strange House.mp3", u2Reversal: "u2:2-25. Reversal Mountain (Pokémon Black).mp3",
  u2Ruins: "u2:2-15. Underground Ruins.mp3", u2Frigate: "u2:2-17. Aboard the Plasma Frigate.mp3", u2FrigateRaid: "u2:3-01. Infiltrating the Plasma Frigate!.mp3",
  u2MarineTube: "u2:2-35. Marine Tube.mp3", u2Being: "u2:3-19. Cave of Being.mp3", u2BlackTower: "u2:3-22. Black Tower.mp3", u2NCastle: "u2:3-10. N's Castle.mp3",
  u2NRoom: "u2:3-11. N's Room.mp3", u2N: "u2:3-12. N's Theme.mp3", u2Plasma: "u2:1-14. Team Plasma Returns.mp3",
  u2PlasmaEyes: "u2:2-32. Trainers' Eyes Meet (Team Plasma).mp3", u2Zinzolin: "u2:2-18. Zinzolin's Theme.mp3", u2ColressTheme: "u2:1-38. Colress's Theme.mp3",
  u2Triad: "u2:2-34. Shadow Triad's Theme.mp3", u2Cheren: "u2:2-19. Cheren's Theme.mp3", u2Bianca: "u2:1-05. Bianca's Theme.mp3", u2Hugh: "u2:1-10. Rival's Theme.mp3",
  u2Wild: "u2:1-07. Battle! (Wild Pokemon).mp3", u2Trainer: "u2:1-39. Battle! (Trainer Battle).mp3", u2Gym: "u2:1-47. Battle! (Gym Leader).mp3",
  u2GymLast: "u2:1-48. Victory Lies Before You!.mp3", u2Rival: "u2:1-11. Battle! (Rival).mp3", u2NBattle: "u2:3-13. Battle! (N).mp3",
  u2Team: "u2:2-33. Battle! (Team Plasma).mp3", u2Ghetsis: "u2:3-08. Battle! (Ghetsis).mp3", u2Colress: "u2:3-02. Battle! (Colress).mp3",
  u2BlackKyurem: "u2:3-07. Battle! (Black Kyurem - White Kyurem).mp3", u2Regi: "u2:2-16. Battle! (Regirock - Regice - Registeel).mp3",
  u2LakeTrio: "u2:3-20. Battle! (Azelf - Mesprit - Uxie).mp3", u2LegendSinnoh: "u2:2-28. Battle! (Legendary Pokémon—Sinnoh Version).mp3",
  u2Iris: "u2:3-29. Battle! (Champion Iris).mp3", u2CynthiaPWT: "u2:2-11. Battle! (Champion—Sinnoh Version).mp3",
  u2KantoGym: "u2:2-04. Battle! (Gym Leader—Kanto Version).mp3", u2KantoChamp: "u2:2-05. Battle! (Champion—Kanto Version).mp3",
  u2JohtoGym: "u2:2-06. Battle! (Gym Leader—Johto Version).mp3", u2JohtoChamp: "u2:2-07. Battle! (Champion—Johto Version).mp3",
  u2HoennGym: "u2:2-08. Battle! (Gym Leader—Hoenn Version).mp3", u2HoennChamp: "u2:2-09. Battle! (Champion—Hoenn Version).mp3",
  u2SinnohGym: "u2:2-10. Battle! (Gym Leader—Sinnoh Version).mp3", u2PWTFinal: "u2:2-12. PWT Final Round.mp3",
  u2PokestarBattle: "u2:1-16. Filming Underway at Pokéstar Studios!.mp3", u2PWTWin: "u2:2-13. Winning in the PWT!.mp3", u2PWTVictory: "u2:2-14. PWT Victory!.mp3",
  u2Title: "u2:1-02. Title.mp3", u2Credits: "u2:3-30. Staff Credits.mp3",
});
// the Kalos Journey's: X and Y's (the Super Music Collection, the owner's download of 2026-10-15 with its extras: resources/audio/kalos,
// "ka:" keys; the three Friends Themes' double quotes are single quotes in their file names). What plays where is X and Y's (Bulbapedia's
// location tables): Ambrette plays Aquacorde's theme, Couriway Camphrier's; Routes 2-3, 4-7 and 22, 8-13, 15-17 and 18-21 share a theme
// each; Route 14, Connecting Cave, Terminus Cave and the Lost Hotel play Glittering Cave, Route 20, Reflection Cave and Frost Cavern
// Santalune Forest; the Poké Ball Factory the Power Plant's; Geosenge under the weapon Dark Skies
const KALOS_MUSIC_DIR = "resources/audio/kalos/";
Object.assign(BGM, {
  kaVaniville: "ka:1-05. Vaniville Town.mp3", kaAquacorde: "ka:1-07. Aquacorde Town.mp3", kaSantalune: "ka:1-23. Santalune City.mp3", kaLumiose: "ka:1-37. Lumiose City.mp3",
  kaCamphrier: "ka:1-43. Camphrier Town.mp3", kaCyllage: "ka:2-06. Cyllage City.mp3", kaGeosenge: "ka:2-12. Geosenge Town.mp3", kaShalour: "ka:2-16. Shalour City.mp3",
  kaCoumarine: "ka:2-23. Coumarine City.mp3", kaLaverre: "ka:2-34. Laverre City.mp3", kaDendemille: "ka:2-39. Dendemille Town.mp3", kaAnistar: "ka:3-01. Anistar City.mp3",
  kaSnowbelle: "ka:3-17. Snowbelle City.mp3", kaKiloude: "ka:4-02. Kiloude City.mp3", kaLeague: "ka:3-24. The Pokémon League.mp3",
  kaRoute1: "ka:1-06. Route 1.mp3", kaRoute2: "ka:1-13. Route 2.mp3", kaRoute4: "ka:1-33. Route 4.mp3", kaRoute8: "ka:1-53. Route 8.mp3", kaRoute15: "ka:2-37. Route 15.mp3",
  kaRoute18: "ka:3-15. Route 18.mp3", kaSurf: "ka:2-20. Surf.mp3", kaBike: "ka:2-09. Bicycle.mp3", kaLab: "ka:1-38. The Sycamore Pokémon Lab.mp3",
  kaCenter: "ka:1-24. Pokémon Center.mp3", kaBoutique: "ka:4-13. Boutique.mp3", kaGymHall: "ka:1-28. Pokémon Gym.mp3", kaForest: "ka:1-14. Santalune Forest.mp3",
  kaGlittering: "ka:2-01. Glittering Cave.mp3", kaVictory: "ka:3-22. Victory Road.mp3", kaTower: "ka:2-17. Tower of Mastery.mp3", kaPalace: "ka:1-45. Parfum Palace.mp3",
  kaPlant: "ka:2-25. The Kalos Power Plant.mp3", kaLabs: "ka:3-04. Lysandre Labs.mp3", kaFlareHQ: "ka:3-07. Team Flare Secret HQ.mp3",
  kaWeapon: "ka:3-06. The Ultimate Weapon Deployed.mp3", kaDarkSkies: "ka:1-41. Dark Skies.mp3", kaVillage: "ka:3-20. Pokémon Village.mp3", kaMaison: "ka:4-05. Battle Maison.mp3",
  kaFame: "ka:3-28. Congratulations on Entering the Hall of Fame!.mp3", kaEnding: "ka:3-31. KISEKI.mp3", kaEvolution: "ka:2-03. Evolution.mp3",
  kaFlare: "ka:2-02. Team Flare Appears!.mp3", kaFlareEyes: "ka:2-26. Trainers' Eyes Meet (Team Flare).mp3", kaAZ: "ka:3-14. AZ.mp3", kaPrison: "ka:3-05. An Eternal Prison.mp3",
  kaSycamore: "ka:1-39. Professor Sycamore's Theme.mp3", kaFriendsMeet: "ka:1-08. Friends Theme 'A New Meeting'.mp3", kaFriendsReunited: "ka:2-31. Friends Theme 'Reunited'.mp3",
  kaFriendsForever: "ka:3-16. Friends Theme 'Friends Forever'.mp3", kaBattleCue: "ka:1-10. It's a Pokémon Battle!.mp3", kaLooker: "ka:4-51. Looker's Theme.mp3",
  kaEssentia: "ka:4-55. Emma's Theme.mp3", kaLegendAwoken: "ka:3-08. The Legendary Pokémon Awoken.mp3", kaFiringX: "ka:3-12. Firing the Ultimate Weapon (Pokémon X).mp3",
  kaFiringY: "ka:3-13. Firing the Ultimate Weapon (Pokémon Y).mp3",
  kaWild: "ka:1-16. Battle! (Wild Pokémon).mp3", kaTrainer: "ka:1-21. Battle! (Trainer Battle).mp3", kaGym: "ka:1-29. Battle! (Gym Leader).mp3",
  kaKorrina: "ka:2-19. Battle! (Successor Korrina).mp3", kaFriend: "ka:1-11. Battle! (Friend).mp3", kaTeam: "ka:2-27. Battle! (Team Flare).mp3",
  kaLysandreBattle: "ka:3-10. Battle! (Lysandre).mp3", kaXYZ: "ka:3-09. Battle! (Xerneas - Yveltal - Zygarde).mp3", kaMewtwo: "ka:4-76. Battle! (Mewtwo).mp3",
  kaE4: "ka:3-25. Battle! (Elite Four).mp3", kaChampion: "ka:3-26. Battle! (Champion).mp3", kaWildWin: "ka:1-17. Victory! (Wild Pokémon).mp3",
  kaTrainerWin: "ka:1-22. Victory! (Trainer Battle).mp3", kaGymWin: "ka:1-30. Victory! (Gym Leader).mp3", kaTeamWin: "ka:3-11. Victory! (Team Flare).mp3",
  kaChampionWin: "ka:3-27. Victory! (Champion).mp3",
  // (the extras: the opening, the ending's other pieces, Looker's other cues, Lumiose's shops and rides, the Trainers' encounter themes)
  kaTitle: "ka:1-01. Title Screen.mp3", kaOpening: "ka:1-02. Opening Movie.mp3", kaKalosTheme: "ka:1-03. Kalos Region Theme.mp3", kaAdventure: "ka:1-04. An Adventure Is Beginning.mp3",
  kaHurry1: "ka:1-12. Hurry Along 1.mp3", kaHurry2: "ka:1-48. Hurry Along 2.mp3", kaWithShauna: "ka:1-46. Together with Shauna.mp3", kaSinaDexio: "ka:1-35. Sina and Dexio.mp3",
  kaMysterious: "ka:2-28. A Mysterious Figure.mp3", kaPrismTower: "ka:2-29. The Lighting of Prism Tower.mp3", kaPokeFlute: "ka:1-47. Poké Flute.mp3", kaScaryHouse: "ka:2-33. Scary House.mp3",
  kaSunShines: "ka:3-29. The Sun Shines Down.mp3", kaGoWithYou: "ka:3-30. I'll Go With You.mp3", kaFin: "ka:3-32. FIN.mp3", kaLookerTale: "ka:4-50. Another Chapter in Looker's Tale.mp3",
  kaLookerTrouble: "ka:4-54. Looker's in Trouble!.mp3", kaLookerSad: "ka:4-56. Looker's Sorrowful Theme.mp3", kaRichissime: "ka:4-53. Hotel Richissime.mp3", kaGate: "ka:1-36. Gate.mp3",
  kaShopping: "ka:4-11. Shopping.mp3", kaSushi: "ka:4-12. Sushi High Roller.mp3", kaGogoat: "ka:4-09. Gogoat Shuttle.mp3", kaSkiddo: "ka:2-22. Riding Skiddo.mp3",
  kaFriendSafari: "ka:4-07. Friend Safari.mp3", kaTMV: "ka:4-01. The TMV Departs.mp3", kaQuiz: "ka:2-30. Quiz Time in the Lumiose City Gym!.mp3",
  kaEyesYoungster: "ka:1-19. Trainers' Eyes Meet (Youngster).mp3", kaEyesLass: "ka:1-20. Trainers' Eyes Meet (Lass).mp3", kaEyesPokeFan: "ka:1-34. Trainers' Eyes Meet (Poké Fan).mp3",
  kaEyesTwins: "ka:1-42. Trainers' Eyes Meet (Twins).mp3", kaEyesTourist: "ka:1-44. Trainers' Eyes Meet (Tourist).mp3", kaEyesButler: "ka:1-51. Trainers' Eyes Meet (Butler).mp3",
  kaEyesMaid: "ka:1-52. Trainers' Eyes Meet (Maid).mp3", kaEyesSwimmerF: "ka:2-05. Trainers' Eyes Meet (Swimmer♀).mp3", kaEyesHiker: "ka:2-10. Trainers' Eyes Meet (Hiker).mp3",
  kaEyesHoneymooners: "ka:2-14. Trainers' Eyes Meet (Honeymooners).mp3", kaEyesBlackBelt: "ka:2-15. Trainers' Eyes Meet (Black Belt).mp3",
  kaEyesRoller: "ka:2-18. Trainers' Eyes Meet (Roller Skater).mp3", kaEyesSwimmer: "ka:2-21. Trainers' Eyes Meet (Swimmer♂).mp3",
  kaEyesFurisode: "ka:2-36. Trainers' Eyes Meet (Furisode Girl).mp3", kaEyesPsychic: "ka:3-02. Trainers' Eyes Meet (Psychic).mp3", kaEyesAce: "ka:3-23. Trainers' Eyes Meet (Ace Trainer).mp3",
  kaEyesPunk: "ka:4-52. Trainers' Eyes Meet (Punk Guy).mp3",
});
const JINGLE = { badge: "1-33. Obtained a Badge!.mp3", caught: "1-57. Caught a Pokémon!.mp3", evolved: "2-04. Congratulations! Your Pokémon Evolved!.mp3", joBadge: "jo:1-45. Received a Gym Badge!.mp3",
  hoBadge: "ho:1-59. Obtained a Badge!.mp3", hoItem: "ho:1-13. Obtained An Item!.mp3", hoSymbol: "ho:3-17. Battle Symbol Received!.mp3", siBadge: "si:2-04. Obtained a Badge!.mp3", siItem: "si:1-15. Obtained An Item!.mp3", siAzure: "si:5-32. Azure Flute.mp3",
  unBadge: "un:1-47. Received a League Gym Badge.mp3", unItem: "un:1-29. Obtained an Item!.mp3" };
Object.assign(JINGLE, { kaBadge: "ka:1-31. Obtained a Gym Badge!.mp3", kaItem: "ka:1-15. Obtained an Item!.mp3", kaEvolved: "ka:2-04. Congratulations! Your Pokémon Evolved!.mp3",
  kaKeyItem: "ka:1-09. Obtained a Key Item!.mp3", kaTM: "ka:1-32. Obtained a TM!.mp3", kaBerry: "ka:2-11. Obtained a Berry!.mp3", kaEgg: "ka:1-49. Received a Pokémon Egg!.mp3",
  kaHealed: "ka:1-25. Pokémon Healed.mp3", kaLevelUp: "ka:1-18. Level Up!.mp3", kaBP: "ka:4-06. Received Battle Points!.mp3" });   // (Kalos's: X and Y's)
// the Alola Journey's: Sun and Moon's (the Super Music Complete, OVCP-0007) and Ultra Sun and Ultra Moon's new music (the Exclusive
// Tracks Selection, a gamerip: Ultra Sun and Ultra Moon have no album of their own; its title screen from the Sound Selection), the
// owner's download of 2026-10-15 with its extras: resources/audio/alola, "al:" keys. Bulbapedia's Alola pages have no music tables,
// so most places play the track their title names, as the Sun and Moon album groups them: Route 3 Route 2's theme, Routes 5-9 Route
// 4's, Routes 11-17, Tapu Village and Mount Hokulani Route 10's, Poni's routes and Exeggutor Island Ancient Poni Path's, the trial
// sites Verdant Cavern's (Hokulani Observatory Burnet's Lab, Acerola's Megamart and Kiawe's and Mallow's trials their own), the caves
// Seaward Cave's, Malie Garden Malie City's, Megalo Tower Ultra Megalopolis's
const ALOLA_MUSIC_DIR = "resources/audio/alola/";
Object.assign(BGM, {
  alIki: "al:1-09. Iki Town (Day).mp3", alHauoli: "al:1-45. Hau'oli City (Day).mp3", alHeahea: "al:2-20. Heahea City (Day).mp3", alPaniola: "al:2-23. Paniola Town (Day).mp3",
  alKonikoni: "al:3-01. Konikoni City (Day).mp3", alMalie: "al:3-10. Malie City (Day).mp3", alPoTown: "al:3-18. Po Town.mp3", alSeafolk: "al:3-33. Seafolk Village (Day).mp3",
  alLeague: "al:4-16. The Pokémon League.mp3", alRoute1: "al:1-08. Route 1 on Melemele Island.mp3", alRoute2: "al:2-01. Route 2 on Melemele Island.mp3",
  alRoute4: "al:2-22. Route 4 on Akala Island.mp3", alRoute10: "al:3-12. Route 10 on Ula'ula Island.mp3", alPoni: "al:3-35. Ancient Poni Path.mp3",
  alRideLand: "al:2-17. Ride Pokémon (Land).mp3", alRideSea: "al:2-28. Ride Pokémon (Aquatic).mp3", alSurf: "al:11. Mantine Surf.mp3", alWarpRide: "al:24. Ultra Wormhole.mp3",
  alHome: "al:1-06. My Home.mp3", alLab: "al:1-28. The Pokémon Research Lab.mp3", alCenter: "al:1-29. The Pokémon Center.mp3", alSchool: "al:1-43. Trainers' School.mp3",
  alMahalo: "al:1-11. Mahalo Trail.mp3", alRuins: "al:3-36. The Protector of the Island.mp3", alTrialSite: "al:2-06. Verdant Cavern ~A Trial Site~.mp3",
  alBurnet: "al:2-39. Burnet's Lab.mp3", alAcerolaTrial: "al:3-16. Acerola's Trial.mp3", alKiaweTrial: "al:2-34. Kiawe's Trial.mp3", alMallowTrial: "al:2-35. Mallow's Trial.mp3",
  alRoyalAve: "al:2-29. Royal Avenue.mp3", alRoyalDome: "al:2-31. Battle Royal Dome.mp3", alRanch: "al:2-25. Paniola Ranch.mp3", alBeach: "al:09. Beach Spot.mp3",
  alCave: "al:2-12. Seaward Cave.mp3", alTenCarat: "al:2-18. Ten Carat Hill.mp3", alAether: "al:3-04. Aether Paradise.mp3",
  alAetherSecret: "al:3-22. The Secret Side of Aether Paradise.mp3", alAetherLabs: "al:3-25. Aether Paradise Labs.mp3", alAetherHouse: "al:3-15. Aether House.mp3",
  alHaina: "al:3-17. Haina Desert.mp3", alLanakila: "al:4-14. The Path to the League.mp3", alSummit: "al:4-15. The Summit of Mount Lanakila.mp3", alCanyon: "al:3-37. Vast Poni Canyon.mp3",
  alAltar: "al:3-38. To the Altar....mp3", alMegalopolis: "al:26. Ultra Megalopolis.mp3", alWilds: "al:31. Ultra Space Wilds.mp3", alUltraSpace: "al:4-01. Ultra Space.mp3",
  alUJungle: "al:37. Ultra Jungle Theme (Buzzwole).mp3", alUDesert: "al:35. Ultra Desert Theme (Pheromosa).mp3", alUForest: "al:36. Ultra Forest Theme (Kartana).mp3",
  alUCrater: "al:34. Ultra Crater Theme (Celesteela).mp3", alUPlant: "al:33. Ultra Plant Theme (Xurkitree).mp3", alURuin: "al:38. Ultra Ruin Theme (Guzzlord).mp3",
  alBattleTree: "al:4-11. The Battle Tree.mp3", alRRCastle: "al:43. Rainbow Rocket Hideout.mp3", alFame: "al:4-20. Hall of Fame.mp3", alEnding: "al:52. Ending.mp3",
  alEscape: "al:04. Escape!.mp3", alKukui: "al:1-07. Professor Kukui's Theme.mp3", alBridge: "al:1-12. On the Bridge....mp3", alTapuAppears: "al:1-13. A Tapu Appears!.mp3",
  alLillie: "al:1-14. Lillie's Theme.mp3", alLillieResolve: "al:3-30. Lillie's Resolve.mp3", alLivelyLillie: "al:3-31. Lively Lillie!.mp3", alHau: "al:1-17. Hau's Theme.mp3",
  alFestival: "al:07. The Festival in Iki Town.mp3", alSquad: "al:08. Ultra Recon Squad's Theme.mp3", alSkullAppears: "al:2-02. Team Skull Appears!.mp3",
  alGuzma: "al:3-13. Guzma's Theme.mp3", alGladion: "al:2-26. Gladion's Theme.mp3", alNanu: "al:3-20. Nanu's Theme.mp3", alLusamine: "al:3-06. Lusamine's Theme.mp3",
  alWormhole: "al:3-07. The Entrance to Another World.mp3", alUBs: "al:3-08. Ultra Beasts....mp3", alAetherEyes: "al:3-23. Trainers' Eyes Meet (Aether Foundation).mp3",
  alInfiltration: "al:3-21. Infiltration.mp3", alLusamineWormhole: "al:16. Lusamine Opens Ultra Wormhole.mp3", alShip: "al:2-19. On the Ship.mp3",
  alLegendAppears: "al:3-39. Solgaleo - Lunala Appears!.mp3", alNecrozmaAppears: "al:17. Necrozma Appears!.mp3", alNecrozmaVs: "al:18. Necrozma vs Solgaleo  Lunala.mp3",
  alUltraNecrozmaAppears: "al:27. Ultra Necrozma Appears!.mp3", alUltraNecrozmaDown: "al:30. Ultra Necrozma Defeated (Ultra Sun).mp3",
  alUltraNecrozmaDownUM: "al:29. Ultra Necrozma Defeated (Ultra Moon).mp3", alBlue: "al:4-12. Blue's Theme.mp3", alTrialBegins: "al:2-07. A Captain's Trial Begins!.mp3",
  alTotemAppears: "al:2-08. A Totem Pokémon Appears!.mp3", alTotem: "al:2-09. Battle! (Totem Pokémon).mp3", alTotemWin: "al:2-10. Victory! (Totem Pokémon).mp3",
  alKahunaTheme: "al:2-13. Island Kahuna's Theme.mp3", alKahuna: "al:2-14. Battle! (Island Kahuna).mp3", alKahunaWin: "al:2-15. Victory! (Island Kahuna).mp3",
  alCaptain: "al:1-25. Battle! (Trainer).mp3", alTrainerEyes: "al:1-24. Trainers' Eyes Meet (Trainer).mp3", alSkullEyes: "al:2-03. Trainers' Eyes Meet (Team Skull).mp3",
  alWild: "al:05. Battle! (Wild Pokemon).mp3", alTrainer: "al:06. Battle! (Trainer).mp3", alHauBattle: "al:1-18. Battle! (Hau).mp3", alGladionBattle: "al:2-27. Battle! (Gladion).mp3",
  alSkull: "al:2-04. Battle! (Team Skull).mp3", alAdmin: "al:3-03. Battle! (Team Skull Admin).mp3", alSkullBoss: "al:3-14. Battle! (Team Skull Boss).mp3",
  alAetherBattle: "al:3-24. Battle! (Aether Foundation).mp3", alLusamineBattle: "al:3-29. Battle! (Lusamine).mp3", alSquadBattle: "al:13. Battle! (Ultra Recon Squad).mp3",
  alRoyal: "al:2-32. Battle! (Battle Royal).mp3", alUB: "al:3-09. Battle! (Ultra Beast).mp3", alTapu: "al:4-21. Battle! (Tapu).mp3", alSolgaleo: "al:4-09. Battle! (Solgaleo - Lunala).mp3",
  alNecrozma: "al:19. Battle! (Dusk Mane - Dawn Wings Necrozma).mp3", alUltraNecrozma: "al:28. Battle! (Ultra Necrozma).mp3", alE4: "al:4-17. Battle! (Elite Four).mp3",
  alChampion: "al:40. Battle! (Champion).mp3", alSummitBattle: "al:4-18. The Battle at the Summit!.mp3", alTreeBoss: "al:4-13. Battle! (Battle Tree Boss).mp3",
  alRREyes: "al:44. Encounter! (Team Rainbow Rocket).mp3", alRR: "al:45. Battle! (Team Rainbow Rocket).mp3", alMagmaAqua: "al:46. Battle! (Team Magma - Aqua Boss Maxie & Archie).mp3",
  alCyrus: "al:47. Battle! (Team Galactic Boss Cyrus).mp3", alGhetsis: "al:48. Battle! (Team Plasma Boss Ghetsis).mp3", alLysandre: "al:49. Battle! (Team Flare Boss Lysandre).mp3",
  alGiovanniTheme: "al:50. Giovanni's Theme.mp3", alGiovanni: "al:51. Battle! (Team Rocket Boss Giovanni).mp3", alWildWin: "al:1-22. Victory! (Wild Pokémon).mp3",
  alTrainerWin: "al:1-26. Victory! (Trainer).mp3", alSkullWin: "al:2-05. Victory! (Team Skull).mp3", alAetherWin: "al:4-06. Victory! (Aether Foundation).mp3",
  alChampWin: "al:41. Victory! (Champion).mp3", alChampionBorn: "al:4-19. A Champion Is Born!.mp3", alItem: "al:1-16. Obtained an Item!.mp3",
  alZCrystal: "al:2-11. Obtained a Z-Crystal!.mp3", alLevelUp: "al:1-27. Level Up!.mp3", alHealed: "al:1-30. Recovery.mp3", alEvolve: "al:1-52. Evolution.mp3",
  alEvolveAlola: "al:1-53. Evolution (Alola).mp3", alCaught: "al:1-15. Caught a Pokémon!.mp3", alKeyItem: "al:1-19. Obtained a Key Item!.mp3", alTM: "al:1-44. Obtained a TM!.mp3",
  alFoundZ: "al:3-19. Found a Z-Crystal!.mp3", alRideReg: "al:2-16. Registered a Ride Pokémon!.mp3", alGoodNight: "al:1-20. Good Night.mp3", alZygardeCube: "al:4-23. The Zygarde Cube.mp3",
  alTitle: "al:36 - Title Screen (Bonus Track).mp3", alSMTitle: "al:1-01. Title Screen.mp3", alRegion: "al:03. Alola Region Theme.mp3",
  alAdventure: "al:1-02. An Adventure Is Beginning.mp3", alWaking: "al:1-05. Waking Up.mp3", alIkiNight: "al:1-10. Iki Town (Night).mp3", alHauoliNight: "al:1-46. Hau'oli City (Night).mp3",
  alHeaheaNight: "al:2-21. Heahea City (Night).mp3", alPaniolaNight: "al:2-24. Paniola Town (Night).mp3", alKonikoniNight: "al:3-02. Konikoni City (Night).mp3",
  alMalieNight: "al:3-11. Malie City (Night).mp3", alSeafolkNight: "al:3-34. Seafolk Village (Night).mp3", alHurry: "al:1-47. Hurry Along.mp3", alEncounter: "al:3-05. An Encounter.mp3",
  alUnsettling: "al:3-26. Unsettling Atmosphere.mp3", alTrouble: "al:3-27. There's Trouble!.mp3", alCrisis: "al:3-28. A Crisis in Alola.mp3", alMadness: "al:4-02. Lusamine's Madness.mp3",
  alToUltraSpace: "al:3-40. Let's Go to Ultra Space!.mp3", alLonely: "al:4-10. Lonely Lillie.mp3", alStakataka: "al:20. Stakataka Appears!.mp3",
  alUBsAppear: "al:21. Ultra Beasts Appears!.mp3", alSolgaleoScene: "al:23. Solgaleo Cutscene.mp3", alLunalaScene: "al:22. Lunala Cutscene.mp3",
  alAmbience: "al:25. Unsettling Ambience.mp3", alSurfScene: "al:10. Mantine Surf (Cutscene).mp3", alSomeday: "al:4-24. Someday....mp3", alWelcomeBack: "al:4-25. Welcome Back.mp3",
  alCredits: "al:4-26. Staff Credits.mp3", alTheEnd: "al:4-27. The End.mp3", alKantonianGym: "al:42. Kantonian Gym.mp3", alPikachuValley: "al:15. Pikachu Valley.mp3",
  alPhotoClub: "al:12. Alola Photo Club.mp3", alBattleAgency: "al:14. Battle Agency.mp3", alMegamart: "al:2-30. Thrifty Megamart.mp3", alFerry: "al:1-54. Ferry Terminal.mp3",
  alFestivalPlaza: "al:1-33. Festival Plaza (Day).mp3", alCafe: "al:1-31. Have a Break at the Café.mp3", alApparel: "al:1-50. Apparel Shop.mp3", alSalon: "al:1-49. Salon.mp3",
  alMalasada: "al:1-51. Malasada Shop.mp3", alRoyalResults: "al:2-33. Battle Royal Results.mp3" });   // (Alola's: Sun and Moon's and Ultra Sun and Ultra Moon's)
// the Galar Journey's: the official "Nintendo Switch Pokémon Sword・Shield + Expansion Pass Super Music Collection" (2024; its expanded
// upload on khinsider, 163 tracks, the owner's pick of 2026-10-16 with the story cues the plain upload lacks: Energy Plant, Eternatus
// Appears, the switching themes, the Sealed Chamber): resources/audio/galar, "ga:" keys. Three discs of Sword and Shield and one of the
// expansions. Its titles are the album's ("Chirchester" for Circhester's, "TIme for a Breather" as written)
const GALAR_MUSIC_DIR = "resources/audio/galar/";
Object.assign(BGM, {
  gaTitle: "ga:1-01. Title Screen.mp3", gaExhibition: "ga:1-02. Exhibition Match.mp3", gaPostwick: "ga:1-03. Postwick.mp3", gaHop: "ga:1-04. Hop.mp3",
  gaRoute1: "ga:1-05. Route 1.mp3", gaWedgehurst: "ga:1-06. Wedgehurst.mp3", gaLeon: "ga:1-07. Let's Have a Champion Time!.mp3", gaHopBattle: "ga:1-10. Battle! (Hop).mp3",
  gaWeald: "ga:1-11. Slumbering Weald.mp3", gaFog: "ga:1-12. In the Fog.mp3", gaLab: "ga:1-14. Pokémon Research Lab.mp3", gaSonia: "ga:1-15. Sonia.mp3",
  gaCenter: "ga:1-17. Pokémon Center.mp3", gaWild: "ga:1-19. Battle! (Wild Pokémon).mp3", gaWildWin: "ga:1-20. Victory! (Wild Pokémon).mp3", gaHurry: "ga:1-22. Hurry Along.mp3",
  gaStation: "ga:1-23. At the Train Station.mp3", gaWildSouth: "ga:1-24. Wild Area (South).mp3", gaMaxRaid: "ga:1-25. Battle! (Max Raid).mp3", gaMaxRaidWin: "ga:1-26. Victory! (Dynamax Pokémon).mp3",
  gaCurry: "ga:1-28. Let's Make Curry!.mp3", gaMotostoke: "ga:1-36. Motostoke.mp3", gaBoutique: "ga:1-37. Boutique.mp3", gaStadium: "ga:1-38. At the Stadium.mp3",
  gaBudew: "ga:1-40. Budew Drop Inn.mp3", gaOldLegend: "ga:1-41. An Old Legend.mp3", gaYellAppears: "ga:1-42. Team Yell Appears!.mp3", gaMarnie: "ga:1-43. Marnie.mp3",
  gaCeremony: "ga:1-44. Gym Challenge Opening Ceremony.mp3", gaRose: "ga:1-45. Chairman Rose.mp3", gaRoute3: "ga:2-01. Route 3.mp3",
  gaEyesYoungster: "ga:2-02. Trainers' Eyes Meet (Youngster).mp3", gaEyesLass: "ga:2-03. Trainers' Eyes Meet (Lass).mp3", gaTrainer: "ga:2-04. Battle! (Trainer).mp3",
  gaTrainerWin: "ga:2-05. Victory! (Trainer).mp3", gaEvolution: "ga:2-06. Evolution.mp3", gaEvolutionGalar: "ga:2-07. Evolution (Galar).mp3", gaMine: "ga:2-10. Galar Mine.mp3",
  gaEyesWorker: "ga:2-11. Trainers' Eyes Meet (Worker).mp3", gaBede: "ga:2-12. Bede.mp3", gaBedeBattle: "ga:2-13. Battle! (Bede).mp3",
  gaEyesBreeder: "ga:2-14. Trainers' Eyes Meet (Pokémon Breeder).mp3", gaTurffield: "ga:2-15. Turffield.mp3", gaGymMission: "ga:2-16. Gym Mission!.mp3",
  gaEyesGym: "ga:2-17. Trainers' Eyes Meet (Gym Trainer).mp3", gaGymTrainerWin: "ga:2-18. Victory! (Gym Trainer).mp3", gaLeaderTheme: "ga:2-20. Gym Leader's Theme.mp3",
  gaGym: "ga:2-21. Battle! (Gym Leader).mp3", gaGymMax: "ga:2-22. Battle! (Gym Leader - Switching Pokémon).mp3", gaGymWin: "ga:2-23. Victory! (Gym Leader).mp3",
  gaHulbury: "ga:2-27. Hulbury.mp3", gaPokeJobs: "ga:2-28. Poké Jobs.mp3", gaMarnieBattle: "ga:2-29. Battle! (Marnie).mp3", gaWildNorth: "ga:2-30. Wild Area (North).mp3",
  gaRotomRally: "ga:2-32. Rotom Rally.mp3", gaHammerlocke: "ga:2-34. Hammerlocke.mp3", gaSalon: "ga:2-35. Hair Salon.mp3", gaRoute6: "ga:2-37. Route 6.mp3",
  gaEyesArtist: "ga:2-38. Trainers' Eyes Meet (Artist).mp3", gaStow: "ga:2-39. Stow-on-Side.mp3", gaMuralCrumbles: "ga:2-40. The Ancient Mural Crumbles.mp3",
  gaMuralTruth: "ga:2-41. The Truth Behind the Mural.mp3", gaGlimwood: "ga:2-42. Glimwood Tangle.mp3", gaBallonlea: "ga:2-43. Ballonlea.mp3", gaCirchester: "ga:2-44. Chirchester.mp3",
  gaSpikemuth: "ga:3-01. Spikemuth.mp3", gaYell: "ga:3-02. Battle! (Team Yell).mp3", gaPiers: "ga:3-03. Battle! (Gym Leader Piers).mp3", gaRoute10: "ga:3-04. Route 10.mp3",
  gaWyndon: "ga:3-05. Wyndon.mp3", gaWyndonStadium: "ga:3-06. Wyndon Stadium.mp3", gaMarnieFinal: "ga:3-07. Decisive Battle! (Marnie).mp3", gaHopFinal: "ga:3-08. Decisive Battle! (Hop).mp3",
  gaRoseTower: "ga:3-09. Rose Tower.mp3", gaTowerTop: "ga:3-10. Reaching the Top.mp3", gaOleana: "ga:3-11. Battle! (Oleana).mp3", gaFinalsBegin: "ga:3-12. The Finals Begin.mp3",
  gaFinals: "ga:3-13. Battle! (Finals).mp3", gaFinalsMax: "ga:3-14. Battle! (Finals - Switching Pokémon).mp3", gaCupWin: "ga:3-15. Victory! (Champion Cup).mp3",
  gaDarkestDay: "ga:3-16. The Darkest Day.mp3", gaDeepForest: "ga:3-17. Deep In the Forest.mp3", gaBizarre: "ga:3-18. A Bizarre Situation.mp3", gaEternatusAppears: "ga:3-19. Eternatus Appears.mp3",
  gaEnergyPlant: "ga:3-20. Energy Plant.mp3", gaRoseBattle: "ga:3-21. Battle! (Rose).mp3", gaLeonEternatus: "ga:3-22. Leon and Eternatus.mp3", gaEternatus: "ga:3-23. Battle! (Eternatus).mp3",
  gaEternalPower: "ga:3-24. Eternal Power.mp3", gaEternamax: "ga:3-25. Decisive Battle! (Eternatus).mp3", gaChampion: "ga:3-27. Decisive Battle! (Champion Leon).mp3",
  gaChampionWin: "ga:3-28. Victory! (Champion Leon).mp3", gaBrightFuture: "ga:3-29. For a Bright Future.mp3", gaMysteryGift: "ga:3-30. Mystery Gift.mp3", gaBattleTower: "ga:3-31. Battle Tower.mp3",
  gaTowerBattle: "ga:3-32. Battle! (Battle Tower).mp3", gaZacian: "ga:3-35. Battle! (Zacian Zamazenta).mp3", gaCredits: "ga:3-37. Staff Credits.mp3",
  // (the expansions' disc: The Isle of Armor, then The Crown Tundra)
  gaIsle: "ga:4-01. Isle of Armor.mp3", gaKlara: "ga:4-02. Krazy for Klara.mp3", gaKlaraBattle: "ga:4-03. Battle! (Klara).mp3", gaAvery: "ga:4-04. The Amazing Avery.mp3",
  gaAveryBattle: "ga:4-05. Battle! (Avery).mp3", gaDojo: "ga:4-06. Master Dojo.mp3", gaMustard: "ga:4-07. Mustard.mp3", gaMustardBattle: "ga:4-08. Battle! (Mustard).mp3",
  gaSecretArmor: "ga:4-10. Secret Armor.mp3", gaTowerWaters: "ga:4-11. Tower of Waters.mp3", gaTowerDarkness: "ga:4-12. Tower of Darkness.mp3",
  gaMustardFinal: "ga:4-13. Battle! (Serious Mustard).mp3", gaMustardWin: "ga:4-14. Victory! (Mustard).mp3", gaTundra: "ga:4-17. Crown Tundra.mp3", gaPeony: "ga:4-18. Peony.mp3",
  gaPeonyBattle: "ga:4-19. Battle! (Peony).mp3", gaMaxLair: "ga:4-20. Max Lair.mp3", gaAdventure: "ga:4-21. Dynamax Adventure.mp3", gaAdventureBattle: "ga:4-22. Battle! (Dynamax Adventure).mp3",
  gaFreezington: "ga:4-23. Freezington.mp3", gaCalyrex: "ga:4-25. The King of Bountiful Harvests.mp3", gaCalyrexBattle: "ga:4-26. Battle! (Calyrex).mp3",
  gaSteeds: "ga:4-28. Battle! (Glastrier Spectrier).mp3", gaCrownShrine: "ga:4-29. Crown Shrine.mp3", gaAsOne: "ga:4-30. As One.mp3",
  gaRiderBattle: "ga:4-31. Battle! (The King of Bountiful Harvests).mp3", gaSealedChamber: "ga:4-33. Sealed Chamber.mp3", gaGiants: "ga:4-34. Battle! (The Giant of Legend).mp3",
  gaGreatTree: "ga:4-35. Gathering At the Tree.mp3", gaBirds: "ga:4-36. Battle! (The Bird Pokémon of Legend).mp3", gaCredits2: "ga:4-37. Staff Credits (Alternate).mp3" });
Object.assign(JINGLE, { gaBadge: "ga:2-24. Obtained a Badge!.mp3", gaItem: "ga:1-13. Obtained An Item!.mp3", gaKeyItem: "ga:1-16. Obtained a Key Item!.mp3", gaTM: "ga:2-25. Obtained a TM!.mp3",
  gaBerry: "ga:2-09. Obtained a Berry!.mp3", gaEgg: "ga:2-26. Received a Pokémon Egg!.mp3", gaHealed: "ga:1-18. Pokémon Healed.mp3", gaLevelUp: "ga:1-21. Level Up!.mp3",
  gaCaught: "ga:1-08. Caught a Pokémon!.mp3", gaEvolved: "ga:2-08. Congratulations! Your Pokémon Evolved!.mp3", gaBreather: "ga:1-09. TIme for a Breather.mp3",
  gaMissionCleared: "ga:2-19. Gym Mission Cleared!.mp3", gaCaughtEternatus: "ga:3-26. Caught Eternatus!.mp3", gaBP: "ga:3-33. Received Battle Points!.mp3",
  gaKubfuWin: "ga:4-15. Victory With Kubfu.mp3", gaChimes: "ga:4-16. Crown Tundra Chimes.mp3", gaLegendTale: "ga:4-24. Legends of Legendary Pokémon.mp3",
  gaDance: "ga:4-27. The Dance of Bountiful Harvests.mp3", gaClue: "ga:4-32. You Found a Clue!.mp3", gaArmorItem: "ga:4-09. Obtained An Item..._.mp3",
  // (the album's other jingles: the Pokédex evaluations, curry's, the Hair Salon's and Rotom Rally's, kept with the rest)
  gaDexStart: "ga:1-27. Pokédex Evaluation... Getting Started!.mp3", gaDexOnWay: "ga:2-31. Pokédex Evaluation... You're On Your Way!.mp3", gaDexDone: "ga:3-36. Pokédex Evaluation... Complete!.mp3",
  gaCurryKoffing: "ga:1-29. Curry (Koffing Class).mp3", gaCurryWobbuffet: "ga:1-30. Curry (Wobbuffet Class).mp3", gaCurryMilcery: "ga:1-31. Curry (Milcery Class).mp3",
  gaCurryCopperajah: "ga:1-32. Curry (Copperajah Class).mp3", gaCurryCharizard: "ga:1-33. Curry (Charizard Class).mp3", gaCurryDexGo: "ga:1-34. Curry Dex - Keep Going!.mp3",
  gaCurryDexDone: "ga:1-35. Curry Dex - Complete!.mp3", gaCostume: "ga:1-39. Contest Costume Time!.mp3", gaRallyGoal: "ga:2-33. Reach Goal In Rotom Rally!.mp3",
  gaMoveDeleted: "ga:2-36. Move Deleted.mp3", gaZCrystal: "ga:3-34. Found a Z-Crystal!.mp3" });   // (Galar's: Sword and Shield's and the expansions')
// the Paldea Journey's: the official "Nintendo Switch Pokémon Scarlet・Violet + The Hidden Treasure of Area Zero Super Music Collection"
// (OVCP-0013, 2024; khinsider, all 208 tracks, 802 MB, the owner's go-ahead of 2026-10-16): resources/audio/paldea, "pa:" keys. Discs 1-4
// Scarlet and Violet, disc 5 The Teal Mask and the start of The Indigo Disk, disc 6 the rest and the Epilogue. Its titles are the album's
// (the Gym Leader's battle and victory are one track; "Photograpghy" and the double spaces as written; khinsider's 1-36 and 1-37 have
// each other's titles, so the Treasure Hunt's jingle is "Take a Break", and its "With Perrin" is Kieran's theme: Bulbapedia's tracklist)
const PALDEA_MUSIC_DIR = "resources/audio/paldea/";
Object.assign(BGM, {
  paTitle: "pa:4-29. Title Screen.mp3", paTitle2: "pa:6-33. Title Screen 2.mp3", paWelcome: "pa:1-01. Welcome to the Paldea region!.mp3", paSoar: "pa:1-02. Soar Through the Paldea Skies.mp3",
  paHome: "pa:1-03. Home.mp3", paCaboPoco: "pa:1-04. Cabo Poco.mp3", paMeetings: "pa:1-05. Meetings.mp3", paStronger: "pa:1-06. Let's Try to Get Stronger!.mp3",
  paNemonaBattle: "pa:1-07. Battle! (Nemona).mp3", paPocoPath: "pa:1-09. Poco Path.mp3", paWild: "pa:1-10. Battle! (Wild Pokémon).mp3", paWildWin: "pa:1-11. Victory! (Wild Pokémon).mp3",
  paBeach: "pa:1-14. On the Beach.mp3", paCove: "pa:1-15. Go Through the Cave in the Cove.mp3", paCaveBattle: "pa:1-16. Battle in the Cave.mp3", paCaveEscape: "pa:1-17. Escape from the Cave!.mp3",
  paStrength: "pa:1-18. It's a Test of Strength!.mp3", paArvenBattle: "pa:1-19. Battle! (Arven).mp3", paSouth: "pa:1-20. South Province.mp3", paWildSouth: "pa:1-21. Battle! (Wild Pokémon in the South).mp3",
  paCenter: "pa:1-23. Pokémon Center.mp3", paLosPlatos: "pa:1-26. Los Platos.mp3", paSouthWalk: "pa:1-27. Walk Through the South Province.mp3", paMesagoza: "pa:1-28. Mesagoza.mp3",
  paMesagozaSong: "pa:1-29. One Song in Mesagoza, If You Please.mp3", paTeamStar: "pa:1-30. Team Star!.mp3", paStarBattle: "pa:1-31. Battle! (Team Star).mp3", paAcademy: "pa:1-32. The Academy.mp3",
  paCassCall: "pa:1-33. Phone Call from Cassiopeia.mp3", paProfessor: "pa:1-34. Professor Sada  -  Professor Turo.mp3", paRoom: "pa:1-35. The Academy - Your Room.mp3", paEyes: "pa:1-38. Trainers' Eyes Meet (Trainer).mp3",
  paTrainer: "pa:1-39. Battle! (Trainer Battle).mp3", paTrainerWin: "pa:1-40. Victory! (Trainer Battle).mp3", paSandwich: "pa:1-42. Let's Make a Sandwich!.mp3", paEvolution: "pa:1-49. Evolution.mp3",
  paGymLobby: "pa:2-01. Gym Lobby.mp3", paGymTest: "pa:2-02. Gym Test.mp3", paGym: "pa:2-04. Battle! (Gym Leader)  -  Victory! (Gym Leader).mp3", paWest: "pa:2-07. West Province.mp3",
  paWildWest: "pa:2-08. Battle! (Wild Pokémon in the West).mp3", paAsado: "pa:2-09. Asado Desert.mp3", paTeraRaid: "pa:2-10. Tera Raid Battle!.mp3", paTeraRaidWin: "pa:2-11. Victory! (Tera Raid Battle).mp3",
  paAsadoWalk: "pa:2-12. Walk Through the Asado Desert.mp3", paCascarrafa: "pa:2-13. Cascarrafa.mp3", paTestNotOver: "pa:2-14. The Gym Test's Not Over!.mp3", paTitan: "pa:2-15. Battle! (Leader Pokémon).mp3",
  paTitanAgain: "pa:2-16. Confront the Leader Pokémon Again.mp3", paTitanWin: "pa:2-17. Victory! (Leader Pokémon).mp3", paJustAMoment: "pa:2-18. Just a Moment.mp3", paWestWalk: "pa:2-20. Walk Through the West Province.mp3",
  paMedali: "pa:2-21. Medali.mp3", paHeartwarming: "pa:2-22. Heartwarming Time.mp3", paEast: "pa:2-23. East Province.mp3", paWildEast: "pa:2-24. Battle! (Wild Pokémon in the East).mp3",
  paArtazon: "pa:2-25. Artazon.mp3", paLevincia: "pa:2-26. Levincia.mp3", paIonoHello: "pa:2-28. 'Ello, 'ello, hola! Ciao and bonjour!.mp3", paEast3: "pa:2-29. East Province (Area Three).mp3",
  paEastWalk: "pa:2-30. Walk Through the East Province.mp3", paTagtree: "pa:2-31. Tagtree Thicket.mp3", paClive: "pa:2-32. Right Now I'm Clive.mp3", paRaid: "pa:2-33. C'mon, Let's Raid the Place!.mp3",
  paStarBarrage: "pa:2-34. Star Barrage.mp3", paStarBossAppears: "pa:2-36. Team Star Boss Appears!.mp3", paStarBoss: "pa:2-37. Battle! (Team Star Boss).mp3", paStarBossWin: "pa:2-38. Victory! (Team Star Boss).mp3",
  paStarTreasure: "pa:2-39. Treasure of the Stars.mp3", paNorth: "pa:3-01. North Province.mp3", paWildNorth: "pa:3-02. Battle! (Wild Pokémon in the North).mp3", paMontenevera: "pa:3-03. Montenevera.mp3",
  paOpeningAct: "pa:3-04. Opening Act!.mp3", paSoulfulBeat: "pa:3-05. Soulful Beat!.mp3", paNorthWalk: "pa:3-06. Walk Through the North Province.mp3", paCasseroya: "pa:3-07. Casseroya Lake.mp3",
  paSnowSlope: "pa:3-08. Snow Slope Run.mp3", paNorth2: "pa:3-09. North Province (Area Two).mp3", paAlfornada: "pa:3-10. Alfornada.mp3", paSpectrum: "pa:3-11. Emotional Spectrum Practice.mp3",
  paInterview: "pa:3-12. Pokémon League - Interview Phase.mp3", paLeague: "pa:3-14. Pokémon League.mp3", paE4: "pa:3-15. Battle! (Elite Four).mp3", paGeeta: "pa:3-16. Battle! (Top Champion).mp3",
  paGeetaWin: "pa:3-17. Victory! (Top Champion).mp3", paWithNemona: "pa:3-18. With Nemona.mp3", paNemonaChamp: "pa:3-19. Battle! (Champion Nemona).mp3", paOnlyRival: "pa:3-20. The Only Rival.mp3",
  paClavellBattle: "pa:4-01. Battle! (Principal Clavell).mp3", paCliveTrue: "pa:4-02. Clive's True Identity.mp3", paCassiopeia: "pa:4-03. Battle! (Cassiopeia).mp3", paHastaLaVistar: "pa:4-04. Hasta la vistar.mp3",
  paHeart: "pa:4-05. Heart.mp3", paArvenTreasure: "pa:4-06. Arven's Treasure.mp3", paCrater: "pa:4-08. To the Great Crater of Paldea.mp3", paAreaZero: "pa:4-09. Area Zero.mp3",
  paZeroWild: "pa:4-10. Battle! (Pokémon in Area Zero).mp3", paGateOpen: "pa:4-11. The Gate is Open.mp3", paZeroWild2: "pa:4-12. Battle! (Pokémon in Area Zero) 2.mp3", paBattleProgram: "pa:4-13. Battle Program Activated.mp3",
  paZeroLab: "pa:4-14. Battle! (Zero Lab).mp3", paZeroLabWin: "pa:4-15. Victory! (Zero Lab).mp3", paReunion: "pa:4-16. Reunion.mp3", paParadise: "pa:4-17. Paradise Protection Protocol.mp3",
  paBattleForm: "pa:4-18. Battle Form.mp3", paKoraidon: "pa:4-19. Battle! (■■■■).mp3", paEarnest: "pa:4-20. Earnest Feelings.mp3", paBonVoyage: "pa:4-21. Bon Voyage!.mp3",
  paWayHome: "pa:4-22. The Way Home.mp3", paScenicRoute: "pa:4-23. Let's Take the Scenic Route Home.mp3", paAceTournament: "pa:4-24. Academy Ace Tournament.mp3", paBattleStadium: "pa:4-26. Battle Stadium.mp3",
  paRuinous: "pa:4-27. Battle! (Calamity Pokémon).mp3", paTealMask: "pa:5-01. The Hidden Treasure of Area Zero - The Teal Mask.mp3", paExchange: "pa:5-02. Ex-c-c-change.mp3", paCarmineBattle: "pa:5-03. Battle! (Carmine).mp3",
  paMossui: "pa:5-04. Mossui Town.mp3", paKieranBattle: "pa:5-05. Battle! (Kieran).mp3", paKitakami: "pa:5-06. Kitakami.mp3", paWildKitakami: "pa:5-07. Battle! (Pokémon in Kitakami).mp3",
  paPerrin: "pa:5-11. Perrin's Theme.mp3", paSignboard: "pa:5-12. History of the Signboard.mp3", paWithKieran: "pa:5-13. With Perrin.mp3", paFestivalMasks: "pa:5-14. Festival of Masks.mp3",
  paOgreFestival: "pa:5-15. The Ogre Extermination Festival!.mp3", paMaskChild: "pa:5-17. The Mysterious Child Who Dropped a Mask.mp3", paRealHistory: "pa:5-18. The Real History.mp3", paCrystalPool: "pa:5-19. Crystal Pool.mp3",
  paDistortion: "pa:5-20. Distortion.mp3", paLoyalBack: "pa:5-21. The Loyal Three Come Back to Life.mp3", paLoyalHavoc: "pa:5-22. The Loyal Three Wreak Havoc.mp3", paLoyalBattle: "pa:5-23. Battle! (The Loyal Three).mp3",
  paKieranDecisive: "pa:5-24. Decisive Battle! (Kieran).mp3", paOgerpon: "pa:5-25. Battle! (Ogerpon).mp3", paRelaxed: "pa:5-27. They're Relaxed Now.mp3", paBecomeStronger: "pa:5-28. I Have to Become Stronger.mp3",
  paIndigoDisk: "pa:5-29. The Hidden Treasure of Area Zero - The Indigo Disk.mp3", paBlueberry: "pa:5-30. Blueberry Academy.mp3", paToDome: "pa:5-31. To the Dome.mp3", paDome: "pa:5-32. This is the Terrarium Dome!.mp3",
  paSavanna: "pa:5-33. Terarium (Savanna Biome).mp3", paWildTerarium: "pa:5-34. Battle! (Pokémon in the Terarium).mp3", paCoastal: "pa:5-35. Terarium (Coastal Biome).mp3", paBBEyes: "pa:5-36. Trainers' Eyes Meet (Academy Trainer).mp3",
  paBBTrainer: "pa:5-37. Battle! (Academy Trainer).mp3", paPlaza: "pa:6-01. Terarium (Central Plaza).mp3", paUnsettling: "pa:6-02. Unsettling Atmosphere.mp3", paDailyLife: "pa:6-03. Daily Life at the Academy.mp3",
  paBBRoom: "pa:6-04. Blueberry Academy - Your Room.mp3", paCanyon: "pa:6-06. Terarium (Canyon Biome).mp3", paTeraTerarium: "pa:6-07. Battle! (Tera Pokémon in the Terarium).mp3", paPolar: "pa:6-10. Terarium (Polar Biome).mp3",
  paBBE4: "pa:6-11. Battle! (BB League Elite Four).mp3", paBBE4Win: "pa:6-12. Victory! (BB League Elite Four).mp3", paTrueIntentions: "pa:6-13. True Intentions.mp3", paBattleBegins: "pa:6-14. The Battle Begins.mp3",
  paKieranChamp: "pa:6-15. Battle! (Champion Kieran).mp3", paKieranDefeated: "pa:6-16. The Defeated Kieran.mp3", paBriar: "pa:6-17. Briar's Theme.mp3", paUnderdepths: "pa:6-18. Area Zero Underdepths.mp3",
  paTerapagosWakes: "pa:6-19. Terapagos Comes Back to Life.mp3", paTerapagos: "pa:6-20. Battle! (Terapagos).mp3", paConditions: "pa:6-21. Conditions of the Hidden Treasure.mp3", paTerapagosRampage: "pa:6-22. Terapagos Goes Rampage.mp3",
  paTerapagosFinal: "pa:6-23. Battle! (Terapagos - The Hidden Treasure of Area Zero).mp3", paFromZero: "pa:6-25. Once Again, Starting from Zero.mp3", paStarTraining: "pa:6-26. Star Training Centers! Team Star.mp3", paRelicSong: "pa:6-27. Relic Song.mp3",
  paEpilogue: "pa:6-28. The Hidden Treasure of Area Zero - Epilogue.mp3", paVillageCurse: "pa:6-29. A Village Curse....mp3", paMochiMayhem: "pa:6-30. Mochi Mayhem.mp3", paBindingMochi: "pa:6-31. A Drone A Pokémon It's a Binding Mochi!.mp3",
  paPecharunt: "pa:6-32. Battle! (Pecharunt).mp3",
  paCaughtOgerpon: "pa:5-26. Caught a Ogerpon.mp3", paCaughtTerapagos: "pa:6-24. Caught the Terapagos!.mp3" });
Object.assign(JINGLE, {
  paKeyItem: "pa:1-08. Obtained a Key Item! .mp3", paBerry: "pa:1-12. Obtained a Berry!.mp3", paItem: "pa:1-13. Obtained an Item!.mp3", paCaught: "pa:1-22. You Caught a Pokémon!.mp3",
  paRecovery: "pa:1-24. Recovery.mp3", paBirthday: "pa:1-25. Happy Birthday!.mp3", paHuntStart: "pa:1-37. Take a Break.mp3", paBreak: "pa:1-36. Start the Treasure Hunt!.mp3",
  paLevelUp: "pa:1-41. Level Up!.mp3", paEat: "pa:1-43. Let's Eat!.mp3", paMealGreat: "pa:1-44. Meal - It's Really Tasty!.mp3", paMealGood: "pa:1-45. Meal - It's Pretty Tasty!.mp3",
  paMealOk: "pa:1-46. Meal - Not Bad!.mp3", paMealMeh: "pa:1-47. Meal - It's Maybe...Not So Great.mp3", paEgg: "pa:1-48. Obtained an Egg!.mp3", paEvolved: "pa:1-50. Congratulations! Your Pokémon Evolved!.mp3",
  paTestPassed: "pa:2-03. You've Passed the Gym Test!.mp3", paBadge: "pa:2-05. Obtained a Gym Badge!.mp3", paTM: "pa:2-06. Obtained a TM!.mp3", paRideUp: "pa:2-19. Your Ride Ability Went Up!.mp3",
  paIonoZone: "pa:2-27. Iono Zone!.mp3", paBarrageDone: "pa:2-35. Star Barrage Completed!.mp3", paInterviewPassed: "pa:3-13. You Passed the Interview Phase!.mp3", paHuntDone: "pa:4-07. You Completed the Treasure Hunt!.mp3",
  paMysteryGift: "pa:4-25. Mystery Gift.mp3", paDexPerfect: "pa:4-28. Pokédex Evaluation - It's Perfect!.mp3", paPhotoMarch: "pa:5-08. Photography - March.mp3", paPhotoWin: "pa:5-09. Photograpghy - Victory.mp3",
  paPhotoLullaby: "pa:5-10. Photography - Lullaby.mp3", paFestivalDone: "pa:5-16. You Completed the Ogre Extermination Festival!.mp3", paItemPrinter: "pa:6-05. Item Printer.mp3",
  paTimeTrial: "pa:6-08. Flying Time Trial!.mp3", paEliteTrialDone: "pa:6-09. You Completed the Elite Trial!.mp3" });   // (Paldea's: Scarlet and Violet's and the DLC's)
const MUS = { el: null, key: null, want: null, unlocked: false, jingle: null };
const musicVol = () => { const v = S ? S.settings.music : devicePrefs().music; return v == null ? .55 : v; };
// (a region's own music: "jo:" Johto's, "ho:" Hoenn's, "si:" Sinnoh's, each in its folder next to the HTML)
const HOENN_MUSIC_DIR = "resources/audio/hoenn/", SINNOH_MUSIC_DIR = "resources/audio/sinnoh/", UNOVA_MUSIC_DIR = "resources/audio/unova/", UNOVA2_MUSIC_DIR = "resources/audio/unova2/";
const musicURL = f => f.startsWith("sd:") ? SD_MUSIC_DIR + encodeURIComponent(f.slice(3)) : f.startsWith("jo:") ? JOHTO_MUSIC_DIR + encodeURIComponent(f.slice(3))
  : f.startsWith("ho:") ? HOENN_MUSIC_DIR + encodeURIComponent(f.slice(3)) : f.startsWith("si:") ? SINNOH_MUSIC_DIR + encodeURIComponent(f.slice(3))
  : f.startsWith("un:") ? UNOVA_MUSIC_DIR + encodeURIComponent(f.slice(3)) : f.startsWith("u2:") ? UNOVA2_MUSIC_DIR + encodeURIComponent(f.slice(3)) : f.startsWith("ka:") ? KALOS_MUSIC_DIR + encodeURIComponent(f.slice(3)) : f.startsWith("al:") ? ALOLA_MUSIC_DIR + encodeURIComponent(f.slice(3)) : f.startsWith("ga:") ? GALAR_MUSIC_DIR + encodeURIComponent(f.slice(3)) : f.startsWith("pa:") ? PALDEA_MUSIC_DIR + encodeURIComponent(f.slice(3)) : MUSIC_DIR + encodeURIComponent(f);
function musicFade(el, to, ms, done) {
  const from = el.volume, t0 = performance.now();
  const st = now => { const k = Math.min(1, (now - t0) / ms); el.volume = clamp(from + (to - from) * k, 0, 1); if (k < 1) requestAnimationFrame(st); else if (done) done(); };
  requestAnimationFrame(st);
}
function music(key) {
  if (!key || !BGM[key]) return;
  if (typeof DEMO === "object" && DEMO.on && DEMO.fast) { stopMusic(0); return; }   // the headless Demo stays quiet
  if (MUS.key === key && MUS.el && (!MUS.el.paused || MUS.jingle)) return;
  MUS.key = key;
  const old = MUS.el;
  if (old) musicFade(old, 0, 500, () => { old.pause(); old.removeAttribute("src"); });
  MUS.el = null;
  if (musicVol() <= 0) return;   // remembered in MUS.key, so turning music on starts it
  const a = new Audio(musicURL(BGM[key]));
  a.loop = true; a.volume = 0; a.preload = "auto";
  MUS.el = a;
  if (MUS.jingle) return;   // a jingle is playing: the new track starts when it ends
  a.play().then(() => musicFade(a, musicVol(), 800)).catch(() => { MUS.want = a; });
}
function stopMusic(ms = 600) {
  const old = MUS.el; MUS.el = null; MUS.key = null;
  if (old) { if (ms) musicFade(old, 0, ms, () => { old.pause(); old.removeAttribute("src"); }); else { old.pause(); old.removeAttribute("src"); } }
}
// a short fanfare over the music: the track pauses, the jingle plays once, and the track carries on
function jingle(key) {
  if (!JINGLE[key] || musicVol() <= 0 || (typeof DEMO === "object" && DEMO.on && DEMO.fast)) return;
  const j = new Audio(musicURL(JINGLE[key])); j.volume = Math.min(1, musicVol() * 1.1);
  if (MUS.jingle) MUS.jingle.pause();
  MUS.jingle = j;
  if (MUS.el) MUS.el.pause();
  const resume = () => { if (MUS.jingle !== j) return; MUS.jingle = null; if (MUS.el) { MUS.el.volume = 0; MUS.el.play().then(() => musicFade(MUS.el, musicVol(), 700)).catch(() => {}); } };
  j.onended = resume; j.onerror = resume;
  j.play().catch(resume);
}
function setMusicVol(v) {
  if (S) S.settings.music = v; setDevicePref("music", v);
  if (MUS.el) MUS.el.volume = v;
  if (v <= 0 && MUS.el) { const k = MUS.key; stopMusic(300); MUS.key = k; }
  else if (v > 0 && !MUS.el && MUS.key) { const k = MUS.key; MUS.key = null; music(k); }
}
// the track for whatever screen is showing (the team screen keeps what was playing)
const CHAPTER_BGM = { c1: "route1", c2: "route3", c3: "route11", c4: "route24", c5: "lavender", c6: "silph", c7: "surf", c8: "route1", c9: "plateau", c10: "surf", c11: "moon",
  // (Johto's: the places each chapter is about; Kanto's Route 11, by Vermilion City where the S.S. Aqua docks; Mt. Silver's cave the
  // Lighthouse's theme, as in HeartGold/SoulSilver)
  joc1: "joRoute29", joc2: "joUnion", joc3: "joGoldenrod", joc4: "joEcruteak", joc5: "joCianwood", joc6: "joRoute42", joc7: "joRadio", joc8: "joIcePath", joc9: "joLeague", joc10: "joRoute11", joc11: "joLighthouse",
  // (Hoenn's: Ruby/Sapphire's for each chapter's place, as Emerald plays them; Sky Pillar plays Mt. Chimney's theme, the Terra and Marine Caves the Cave of Origin's)
  hoc1: "hoRoute101", hoc2: "hoSlateport", hoc3: "hoRoute110", hoc4: "hoRoute113", hoc5: "hoPetalburg", hoc6: "hoRoute119", hoc7: "hoPyre", hoc8: "hoSurf",
  hoc9: "hoSootopolis", hoc10: "hoVictory", hoc11: "hoOrigin",
  // (Sinnoh's: Platinum's for each chapter's place)
  sic1: "siRoute201", sic2: "siRoute205", sic3: "siHearthome", sic4: "siVeilstone", sic5: "siValor", sic6: "siRoute210", sic7: "siCanalave", sic8: "siLake",
  sic9: "siHQ", sic10: "siSpear", sic11: "siSunyshore", sic12: "siVictory", sic13: "siFightArea",
  // (Unova's: Part 1 Black/White's places, Part 2 Black 2/White 2's, each in its own game's version)
  unc1: "unRoute1", unc2: "unDreamyard", unc3: "unNacrene", unc4: "unCastelia", unc5: "unRoute4", unc6: "unDriftveil", unc7: "unChargestone", unc8: "unIcirrus",
  unc9: "unDragonspiral", unc10: "unOpelucid", unc11: "unVictory", unc12: "unLeague", unc13: "unUndella",
  unc14: "u2Route19", unc15: "u2Virbank", unc16: "unCastelia", unc17: "unNimbasa", unc18: "unDriftveil", unc19: "unChargestone", unc20: "u2Lentimas",
  unc21: "unUndella", unc22: "u2Frozen", unc23: "u2Humilau", unc24: "u2Frigate", unc25: "u2FrigateRaid", unc26: "unLeague", unc27: "unRoute12" };
// a Battle Tower wing's own music, where its region's games have some (Emerald's Battle Frontier: its grounds while you look over the
// wing's floors, the Battle Tower's lobby while you pick your team for one; a floor's own `lobby` first: each Frontier Brain's facility)
const TOWER_WING_BGM = { hoenn: "hoFrontier", unova: "u2PWT" }, TOWER_LOBBY_BGM = { hoenn: "hoBattleTower", unova: "unGearStation" };
// (Kalos's chapters: X and Y's places; its wing: Kiloude City over the floors, the Battle Maison while you pick a team)
Object.assign(CHAPTER_BGM, { kac1: "kaRoute1", kac2: "kaLumiose", kac3: "kaRoute4", kac4: "kaShalour", kac5: "kaCoumarine", kac6: "kaPlant", kac7: "kaLaverre",
  kac8: "kaRoute15", kac9: "kaLabs", kac10: "kaRoute18", kac11: "kaVictory", kac12: "kaKiloude", kac13: "kaVillage" });
Object.assign(TOWER_WING_BGM, { kalos: "kaKiloude" }); Object.assign(TOWER_LOBBY_BGM, { kalos: "kaMaison" });
// (Sinnoh's wing: the Fight Area, the Battle Frontier's grounds, over the floors; Platinum's Battle Tower lobby while you pick a team)
Object.assign(TOWER_WING_BGM, { sinnoh: "siFightArea" }); Object.assign(TOWER_LOBBY_BGM, { sinnoh: "siBattleTower" });
// (Johto's wing: HeartGold/SoulSilver's Battle Tower over the floors, its reception desk while you pick a team)
Object.assign(TOWER_WING_BGM, { johto: "joBattleTower" }); Object.assign(TOWER_LOBBY_BGM, { johto: "joTowerDesk" });
// (Alola's chapters: Sun and Moon's and Ultra Sun and Ultra Moon's places; its wing: the Battle Tree over the floors, the Battle Agency while you pick a team)
Object.assign(CHAPTER_BGM, { alc1: "alRoute1", alc2: "alHauoli", alc3: "alRoute2", alc4: "alRoute4", alc5: "alRoyalAve", alc6: "alKonikoni", alc7: "alAether",
  alc8: "alMalie", alc9: "alRoute10", alc10: "alPoTown", alc11: "alAetherSecret", alc12: "alCanyon", alc13: "alSeafolk", alc14: "alLanakila", alc15: "alIki", alc16: "alWilds", alc17: "alRRCastle" });
Object.assign(TOWER_WING_BGM, { alola: "alBattleTree" }); Object.assign(TOWER_LOBBY_BGM, { alola: "alBattleAgency" });
// (Galar's chapters: Sword and Shield's places and the expansions'; its wing: the Battle Tower over the floors, the stadium's lobby while you pick a team)
Object.assign(CHAPTER_BGM, { gac1: "gaPostwick", gac2: "gaWildSouth", gac3: "gaRoute3", gac4: "gaHulbury", gac5: "gaMotostoke", gac6: "gaWildNorth", gac7: "gaRoute6",
  gac8: "gaGlimwood", gac9: "gaCirchester", gac10: "gaSpikemuth", gac11: "gaHammerlocke", gac12: "gaWyndon", gac13: "gaWyndonStadium", gac14: "gaWedgehurst", gac15: "gaBattleTower",
  gac16: "gaIsle", gac17: "gaTundra" });
Object.assign(TOWER_WING_BGM, { galar: "gaBattleTower" }); Object.assign(TOWER_LOBBY_BGM, { galar: "gaStadium" });
// (Paldea's chapters: Scarlet and Violet's places and the DLC's, each chapter's `bgm` in a4i_paldea.js; its wing: Blueberry Academy, home of
// the BB League, over the floors, the Battle Stadium while you pick a team)
if (typeof PALDEA_JOURNEY === "object") for (const ch of PALDEA_JOURNEY.chapters) if (ch.bgm) CHAPTER_BGM[ch.id] = ch.bgm;
Object.assign(TOWER_WING_BGM, { paldea: "paBlueberry" }); Object.assign(TOWER_LOBBY_BGM, { paldea: "paBattleStadium" });
const HUNT_BGM = { forest: "forest", moon: "moon", plant: "silph", seafoam: "surf", mansion: "mansion", victory: "plateau", cave: "moon", hideout: "rocket" };
function screenMusic() {
  const v = UI.view, a = UI.arg;
  if (v === "home") return "home";
  if (v === "story") return UI.jr === "unova" ? (regionPart("unova") > 1 ? "u2Aspertia" : "unNuvema") : { johto: "joNewBark", hoenn: "hoLittleroot", sinnoh: "siTwinleaf", kalos: "kaVaniville", alola: "alIki", galar: "gaPostwick", paldea: "paCaboPoco" }[UI.jr] || "route1";
  if (v === "chapter") return CHAPTER_BGM[a] || "route1";
  if (v === "battle") return "route24";
  if (v === "hunt") return HUNT_BGM[a] || "route24";
  if (v === "tower") return TOWER_WING_BGM[UI.tw] || "gymHall";
  if (v === "arena") return "plateau";
  if (v === "chat" || v === "guild") return "union";
  if (v === "hh") return "gameCorner";
  if (v === "inbox") return "mystery";
  if (v === "team") return (a && a.launch && a.launch.kind === "tower" && ((towerFloor(a.launch.w, a.launch.f) || {}).lobby || TOWER_LOBBY_BGM[a.launch.w])) || null;
  return "center";
}
// browsers only allow sound after the first tap or key press
function audioUnlock() {
  if (MUS.unlocked) return;
  MUS.unlocked = true;
  if (MUS.want) { const a = MUS.want; MUS.want = null; if (a === MUS.el) a.play().then(() => musicFade(a, musicVol(), 800)).catch(() => {}); }
}
document.addEventListener("pointerdown", audioUnlock, true);
document.addEventListener("keydown", audioUnlock, true);

// ---------- move and battle sounds: the owner's Gen 3 attack sound pack in resources/audio/move sfx ----------
// Like the music they play from the folder next to the HTML (tools/pack_sfx.py matched each move to its file:
// RES_DATA.msfx = {move: {f: whole sound, h: one strike of a multi-strike move}}). Without the folder the battle falls back on
// the synthesized sounds above. The headless Demo keeps quiet.
const MSFX_DIR = "resources/audio/move sfx/";
const BATTLE_SFX = { faint: "In-Battle Faint No Health.mp3", heal: "In-Battle Heal HP Restore.mp3", recall: "In-Battle Recall Switch Pokeball.mp3",
  run: "In-Battle Recall Switch Flee Run.mp3", item: "In-Battle Held Item Activate.mp3", up: "Stat Rise Up.mp3", down: "Stat Fall Down.mp3", low: "In-Battle Health Low.mp3",
  BRN: "Status Burned.mp3", CNF: "Status Confused.mp3", FRZ: "Status Frozen.mp3", PAR: "Status Paralyzed.mp3", PSN: "Status Poisoned.mp3", TOX: "Status Poisoned.mp3", SLP: "Status Sleep.mp3" };
const MSFX = { ok: true };
function playSfxFile(f, vol = .5) {
  if (!f || !MSFX.ok || !soundOn() || (typeof DEMO === "object" && DEMO.on && DEMO.fast)) return false;
  try {
    const a = new Audio(MSFX_DIR + encodeURIComponent(f));
    a.volume = vol; a.preservesPitch = false;
    a.playbackRate = typeof BT === "object" && BT.on && BT.speed > 1 ? Math.min(1.6, 1 + (BT.speed - 1) * .2) : 1;
    a.onerror = () => { MSFX.ok = false; };   // no sound folder next to the HTML
    a.play().catch(() => {});
    return true;
  } catch (e) { return false; }
}
// a move's sound (hit: one strike of a multi-strike move); false when it has none, so the caller can use a synthesized one
function moveSound(key, hit) {
  const e = RES_DATA.msfx && (RES_DATA.msfx[key] || (isSketch(key) && RES_DATA.msfx.sketch)); if (!e) return false;   // (the three Sketches sound alike)
  return playSfxFile(hit && e.h ? e.h : e.f, .5);
}
const hasHitSound = key => !!(RES_DATA.msfx && RES_DATA.msfx[key] && RES_DATA.msfx[key].h);
const battleSound = k => playSfxFile(BATTLE_SFX[k], .42);

// ---------- cries (the owner's cry pack: resources/audio/cries, packed into RES_DATA.cry by tools/pack_cries.py) ----------
// Decoded once per species and kept. rate < 1 lowers the pitch (fainting), at delays it in seconds.
const CRY = { buf: {} };
function cry(key, { rate = 1, vol = .45, at = 0 } = {}) {
  if (!RES_DATA.cry[key] && OPS[key] && OPS[key].form) key = OPS[key].form;   // (a form cries like its species: Wash Rotom, Origin Giratina)
  if (!soundOn() || !RES_DATA.cry[key]) return;
  try {
    const A = SFX.ctx || (SFX.ctx = new (window.AudioContext || window.webkitAudioContext)());
    if (A.state === "suspended") A.resume();
    const play = buf => {
      const s = A.createBufferSource(), g = A.createGain(); s.buffer = buf; s.playbackRate.value = rate; g.gain.value = vol;
      s.connect(g); g.connect(A.destination); s.start(A.currentTime + at);
    };
    if (CRY.buf[key]) return play(CRY.buf[key]);
    const bin = atob(RES_DATA.cry[key]), arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    A.decodeAudioData(arr.buffer, b => { CRY.buf[key] = b; play(b); }, () => {});
  } catch (e) { /* audio unavailable */ }
}

// ---------- camera shots ----------
