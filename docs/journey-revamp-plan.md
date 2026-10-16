# Journey revamp (the owner's spec, 2026-10-15)

One new world per new game, every region's Journey open, Trainers who progress like the Demo, and a Pokédex lock per region.
This file maps the owner's spec and answers to the work, phase by phase. Tick a phase off when it's built and tested.

## The owner's spec

- **A new game is a new world.** When the player or the Demo starts a new game, everyone starts again: the player and all 3,000 Trainers.
- **Trainers progress like the Demo.** At the Demo's normal-speed pace (it finishes Kanto in a few hours), with some Trainers slower and some faster. They keep everything about themselves (personality, playstyle, favourites), but they build their teams as they go, as the player does. They progress while the game is closed too.
- **Every region's Journey is open.** A new game asks which region to start in, and the player picks that region's starter. Every Trainer picks the region that suits them best, and a starter, too.
- **Each Journey is locked to its own Pokémon.** The player can only catch and use that region's Pokémon in that Journey. After finishing a region, they can start another they haven't done. Trainers do the regions in whatever order builds their playstyle fastest.
- **The Safari Zone follows progress.** Only the general wild Safari, with the Pokémon of the regions unlocked so far, until every Journey is complete. Its pool grows as regions unlock.
- **Stages keep their own teams.** Journey opponents aren't Trainers; the lock doesn't apply to them.
- **Trainers build their playstyle with what they have:** unevolved Pokémon, moves in place of Abilities (Sunny Day for Drought), Chansey for Blissey while only Kanto is unlocked.
- **Trainers' chat follows their progress.**

## The owner's answers

| Question | Answer |
|---|---|
| Trainer pace | The Demo at normal speed finishes Kanto in a few hours: that's the average Trainer, some slower, some faster |
| Pace clock | Trainers progress during their own play hours (their online schedule), at the Demo's pace; the average Trainer is online a lot, but not all the time (about 7 hours a day, most days) |
| First region | At least 70% beat their first region within 2 to 3 hours of a new game, the slow ones within 4 to 5, the fast ones within 1 to 2. Everyone plays from the moment the world begins (a 6 to 10 hour launch session, then their own hours). Measured: 12% by 2 h, 74% between 2 and 3 h, 94% by 4 h, all by 4.8 h. Re-measured 2026-10-15 after the Journeys grew (Johto 85 main stages, Sinnoh 96, Kanto 66): each Trainer's pace now fits their own first region, so every first region holds it, 68-79% in 2-3 h each and none past 4.7 h (`trainerPace`) |
| Existing saves | Start every save over (Guest, accounts, the Demo) |
| A region's Pokémon | By generation: Kanto Gen 1, Johto Gen 2, ... Paldea Gen 9. Regional forms are their region's |
| Hisuian forms | Galar (Gen 8, by generation) |
| Journey size | Full Journeys like Kanto's (every Gym, rival, villain team, Elite Four, Champion, Legendaries), one region at a time, Johto first; the owner checks each |
| The next region | Starts at Lv 5 with that region's starter and its own level caps; its Pokémon come from the Safari Zone |
| Outside the Journey | Players, the Demo and Trainers use any Pokémon they own in the PvP modes and the special Explore areas |
| Other Pokémon sources | Prizes, gifts, passes and evolutions into a region not unlocked yet wait until it is (no Blissey from Chansey while only Kanto is open) |
| Music | The owner will point to sites for more regional music (ask before each download) |
| Versions (2026-10-15, final) | Each region's Journey tells its **base version's story** (Kanto FireRed/LeafGreen, Johto Crystal, Hoenn Emerald, Sinnoh Platinum), and **each story battle takes its strongest version's team** (the owner's pick, for Sinnoh first, then "All regions should follow what Sinnoh region is doing"): of all the versions' teams for that battle, the toughest one, by the total power of its Pokémon after the region lock and the Lv 36 rule; a tie goes to the base version. The Gym order follows the levels (D/P's Lv 32-36 Fantina is Sinnoh's 5th Gym). The base version's **own post-game stays in the Journey** (Platinum's Stark Mountain and Spear Pillar; Crystal's trip to Kanto, its Gym Leaders with Crystal's teams and Blue at Viridian, before Red; no Kanto Badges from it). Legends: Arceus (Hisui) is left out of Sinnoh |
| Everything else | The other versions' weaker teams for the same battles (where the Pokémon differ: level-only copies are left out), rematches, other versions' post-game and extras (Battle Frontier Brains, Master Trainers, Ramanas Park...) go to the region's **wing of the Battle Tower**: `TOWER_WING[id] = [{ n, t, from, waves, lv?, who?, intro?, lose? }]` in the region's own file (waves with its WG(g) helper; "!" the ace, "@item" a held item), floors sorted by level, opened with the region's Journey. Built 2026-10-15 (a4_story.js; Kanto's wing is the example); tests/figures.js checks every wing |
| Later generations in remakes | The region lock wins: a later generation's Pokémon in a team battles as the region's own form (ORAS Phoebe's Dusknoir is a Dusclops in Hoenn); one with no form from the region is left out. The Lv 36 house rule then applies as usual (region lock first, then Lv 36; never dodged) |
| Unova (2026-10-15) | Unova's games tell two stories, so its Journey has **two parts, both to be beaten**: Part 1 is Black/White's story, Part 2 Black 2/White 2's, two years later. Each part keeps its own level caps (Part 2's start again from Lv 5), its own eight Gym Badges and its own starter (Part 2's from Bianca, as in Black 2/White 2); Part 2 opens right after Part 1, and beating Part 1 doesn't open another region. One Unova Champion title and Hall of Fame entry, at Part 2's Champion Iris; the region is done at Part 2's last stage. Version exclusives are Black's and Black 2's (the owner's pick: in Black your dragon is Reshiram and N's Zekrom). Black 2/White 2's battles take **Challenge Mode's teams at the levels it shows** (the owner's pick after the comparison: one more Pokémon for each Gym Leader and Elite Four member, battle items, +1 to +5 levels); Normal Mode's go to the Tower where the Pokémon differ |
| Alola (2026-10-15) | The Journey tells **Ultra Sun and Ultra Moon's story** (offered: Sun and Moon's, or both in two parts), each battle with the strongest of its Sun and Moon and Ultra Sun and Ultra Moon teams. Alola has no Gyms, so **every trial and grand trial gives a stamp**: twelve, counted as their share of eight for the Badge bonus (6 of 12 = 4 Badges). **Totem Pokémon keep their aura**, shown as stat stages fixed to it from the first turn (the no-hidden-bonus rule holds: it's on the badge). **Sun's side is the main version**: Ultra Sun's Legendary and exclusive catches are main stages, Ultra Moon's side stages beside them. Z-Moves and Z-Crystals aren't in the game: a Trainer who uses one battles without it. Music: Sun and Moon's album with Ultra Sun and Ultra Moon's new music, the core set and its extras (184 tracks, 660 MB) |
| Galar (2026-10-16) | The Journey tells **Sword and Shield's story** with its own post-game, **Sword's side the main version** (the owner's pick: Bea and Gordie are the Gyms that give the Badges; Shield's Allister and Melony are side-stage battles right beside them, with no Badge; Shield's catches and Zamazenta are side stages too), and **both expansions in the Journey** after the post-game (the owner's pick): The Isle of Armor, then The Crown Tundra, whose Dynamax Adventure Legendaries are side stages and which ends the Journey; the Galarian Star Tournament goes to the Tower. **No Dynamax: a Dynamax or Gigantamax ace gets an aura** (the owner's pick), Defense and Sp. Def +1 as stat stages fixed to it, like Alola's Totems; the same for Max Raid Pokémon. Music: the official Sword and Shield + Expansion Pass Super Music Collection, its expanded upload (163 tracks, 653 MB) |
| Paldea (2026-10-16) | The Journey tells **Scarlet's story** with its own post-game, **Scarlet the main version** (the owner's pick: Professor Sada, Koraidon and the ancient Paradox Pokémon on the main path; Violet's catches (Miraidon, the future Paradox Pokémon, the Aqua Breed Tauros), its Quaking Earth Titan Iron Treads and Professor Turo's Zero Lab battle are side stages beside Scarlet's). **One Journey** (offered: two parts, base game then DLC; or the DLC aside): the Treasure Hunt's three stories **woven together by the games' levels** (Katy, Klawf, Brassius, Bombirdier, Giacomo, Iono, Mela, Orthworm, Kofu, Atticus, Larry, Ryme, Tulip, Great Tusk, Grusha, Ortega, Eri, Dondozo and Tatsugiri; then the League, Arven, Penny and Champion Nemona), The Way Home, the base post-game, then **the DLC as its last chapters**: The Teal Mask, The Indigo Disk and Mochi Mayhem, each battle with its after-The-Way-Home team (the stronger of its two). **The Titans and Team Star bases give Medals, not Badges** (the owner's pick: the Badge case holds the eight Gym Badges, the only ones the League counts in the games too). **No Terastallizing: a Tera aura** (the owner's pick), Attack and Sp. Atk +1 as stat stages fixed to every Pokémon its Trainer Terastallizes; Tera Raid catches are ordinary wild stages. Music: the whole Scarlet・Violet + The Hidden Treasure of Area Zero Super Music Collection (208 tracks, 802 MB) |

## Phases

**Phase 1 is built (2026-10-15).** What's in:
- **The world clock:** `S.world.start` and `worldStart()` replace `SERVER_EPOCH` (a6i_servers.js); saves are version 2, so a version 1 save starts over.
- **Regions:** `REGION_IDS`, `genOf`/`regionOf`/`genOk` (forms by name: Alolan 7, Galarian and Hisuian 8, Paldean 9); `fieldable`/`metaPool`/`legendsNow` take a set of open generations.
- **Trainer progress:**
  - `trainerHours` is their own play calendar, the same as `isOnline`, after a launch session (`launchHours`: everyone online for the world's first 6 to 10 hours). `regionHours` is the hours of play a region takes them (the owner's spread), `trainerPace` the pace that gives it.
  - `trainerRoute` orders the regions by their favourite region and how well each region fits their playstyle (each region's fit weighed against its own average).
  - `trainerProg` gives their region, stage, level (Kanto's level curve stands in for a region not built yet), best level (toward Lv 100 after their first Champion), open regions, Badges and Champion titles.
  - `trainerTarget` is the points their level and training settle at; `ladderDrift` pulls toward it.
- **Trainer teams:**
  - `npcAccount` takes their progress: their starter (`trainerStarter`, grown by `grownIn` within their open regions), their open regions' Pokémon, and their Badges.
  - Archetype teams grow (`ok.grow` in `buildArch`): pre-evolutions stand in, with no two of one line, and setters bring their field with the move when nobody has the Ability (`FIELD_MOVES`, the field's own type first; `roleLocks` keeps the move).
  - A Trainer works toward their personality's playstyle, else the one their regions were chosen for (`trainerPlan`).
- **Everything that read the launch date now reads each Trainer's progress:** Rankings, firsts (`trainerWhen`), Pokédex and Journey values, the Link Battle board, favourites (`favsIn`), traits (`traitGens`) and claims (`trainerDone`).

Still open from phase 1: chat lines that assume a long-running server, which goes to phase 4.

**Phase 2 is built (2026-10-15).** The owner's answer for the regions whose Journeys aren't built yet: **one at a time**. After your
Journey you choose the next region; its Pokémon open in the Safari Zone and its Journey shows Coming soon until it's built (changed 2026-10-15, the owner's rule:
only one region at a time, each finished before the next, and a region still coming soon stays locked until it's built, for Trainers too); the other Safaris wait until all nine are open. What's in:
- **Stage ids per region:** each region's Journey is a `STORY` entry with its region id; Kanto's stage ids stay bare ("1-1"), every
  other region's start with its code (`REGION_CODE`: "jo1-1", chapters "joc1"). `journeyOf`, `journeyMain`, `journeyEnd`, `chapterById`.
- **A new game's region and starter:** the intro asks for a region (`regionPickModal`: Kanto, the others Coming soon), then its
  Professor's lab and starters (`starterModal` follows the region). `S.regions` ({at, starter, done, badges, champ} per region),
  `S.region`, `S.first`. The Demo picks the region by `demoRegion` and its starter by `demoStarter` (for a Journey, the one strong against
  its first Gyms: Bulbasaur in Kanto; for a region coming soon, the one whose final form does most in the Stadium).
- **The next region:** once every region you've opened is done (`nextRegions`), the Journey tab offers the rest; its Professor gives one
  of its three starters at Lv 5 (`regionStartModal`, `openRegion`, `regionOpenModal`). The Demo opens the one whose Pokémon add most to a
  Stadium team (`demoNextRegion`).
- **Each Journey's Pokédex lock:** a Journey stage takes its own region's Pokémon only (`journeyOk`: the team screen, `launchNode`,
  Quick Battles, the Demo's `nodeSquad`). Explore, the Battle Tower and the Stadium take any you own.
- **The Safari Zone:** the Whole Park has your open regions' Pokémon (`playerGens`, `regionOk`, `SAFARI_POOL`); the weekly areas and the
  event areas wait until all nine are open and done (`specialSafari`: `safariAreas`, `eventAreas`, `evOpen`, `areaMail`).
- **Waiting for a region:** a Pokémon from a region you haven't opened (a prize, gift or pass) is kept in `S.waitOps` and comes when you
  open it (`grantOp`, `openRegion`); an evolution into one waits (`evoOptions`: "Once you open Johto").
- **Per-region caps and Badges:** a Pokémon's level cap is its own region's Journey's (`levelCap(key)`, `regionCap`; Lv 100 while the
  Journey is coming soon); each region's Badges and Champion title are its own (`badgesIn`, `setBadges`, `regionChamp`); the stat bonus is
  the most Badges in one region (`statBadges`, as the Trainers' `trainerBadges`).
- **Features along the first Journey:** `firstStage` maps the Kanto stages named in `FEATURES` and `HUNT_OPEN` to the same point of
  another region's first Journey (for Phase 3).
- **Saves from phase 1** keep Kanto's Journey (and every region, if they had completed it: that's what they had).

Still open from phase 2 (for phase 4): Trainers' chat still mentions the weekly areas and the Legendary Safari whatever their own progress. (Done in phase 4's first part, below.)

**Phase 3: Johto is built (2026-10-15), waiting for the owner's check.** `src/a4b_johto.js`: ten chapters from New Bark Town to Mt. Silver
(Professor Elm's errand, Silver, Sprout Tower, Slowpoke Well, the eight Gyms, the Burned Tower and the beasts, the Lighthouse, the Lake of
Rage, the Mahogany hideout, the Radio Tower, the Ice Path and Dragon's Den, Victory Road, the Elite Four, Champion Lance, then Mt. Silver and
Red), with the house rule on evolved opponents, Gen 2 catches and gifts (Togepi, Sudowoodo, Shuckle, Tyrogue, Skarmory, Lugia, Ho-Oh,
the beasts, Celebi), Johto's Badges and caps, Silver following your starter. **Since the Versions rule: Crystal** (2026-10-15): each battle with
the strongest of its Gold/Silver, Crystal and HeartGold/SoulSilver teams (by the game's own power estimate after the region lock and the
Lv 36 rule, a tie to Crystal: HeartGold/SoulSilver's for Falkner, Bugsy, Chuck, Pryce, Clair, Lance, Red, Proton, Ariana with a Grunt,
Archer, Eusine and Silver except at the Burned Tower; so Pryce's Lv 34 Gym comes before Jasmine's 35, and Johto's Badges are listed in
that order; the Executives with HeartGold/SoulSilver's names: Proton, Petrel, Ariana, Archer), Crystal's trip to Kanto as chapter 10
(the S.S. Aqua, Kanto's eight Gym Leaders with their strongest Johto-games teams, the Machine Part, the Snorlax, Silver at Mt. Moon,
Blue last; no Kanto Badges), Mt. Silver chapter 11 (old saves' stars moved: `s.joS` in migrate), and Crystal's story: Eusine and Morty in the Burned Tower, Suicune looking back, Eusine's battle
on Cianwood's beach, Suicune on Route 42, the Clear Bell from the Radio Tower's Director, the Wise Trio and Suicune (Lv 40) at the Tin
Tower, the Dragon's Den Trainers and the Master's quiz at the Dragon Shrine (the Rising Badge there, and a Dratini, Lv 15), Raikou and
Entei roaming (one side stage each, Lv 40), Ho-Oh and Lugia at Lv 60 after the League, Celebi from the GS Ball. The weaker versions'
teams where the Pokémon differ, the rematches, HeartGold/SoulSilver's extras and Frontier Brains are Johto's Battle Tower wing
(`TOWER_WING.johto`, 34 floors, Lv 12-81; every team by version is in the session notes' `johto_versions_data.md`). The
framework it needed: per-region growth (`grownAt(k, lv, g)`), Badges (`REGION_BADGES`; Johto's drawn as shapes until the owner has a
pack), rivals (`regionStarter`), Trainers' level curves per region (`curveLv(s, n, id)`), Johto Medals, a gift's own level (`giftLv`).
Music: HeartGold/SoulSilver's (44 tracks, 160 MB, downloaded with the owner's go-ahead into `resources/audio/johto`, not embedded; then 13 Kanto tracks, 43 MB, for Crystal's trip to Kanto, and 12 more, 37 MB: the Gym hall, Victory Road, scene themes and the Battle Frontier for Johto's Tower wing, each with the owner's OK): the
"jo:" `BGM` keys, Johto's places per chapter, `johtoMusic` for its battles. Next: Hoenn, once the owner has checked Johto.

**Phase 3: Hoenn is built on Emerald (2026-10-15), waiting for the owner's check.** First built on Ruby/Sapphire (below, kept for the
record), then rebuilt on Emerald's story with each battle's strongest version's team (the Versions (final) rows; rated with the game's
power estimate after the region lock and the Lv 36 rule, Emerald on a tie: Norman and Drake are Ruby/Sapphire's; Winona, Sidney, Phoebe
(her Dusknoir a Dusclops), Wally (his Gallade a Kirlia, grown to Gardevoir), the Winstrates, the rival's line, Maxie at Mt. Chimney,
Archie and most Grunts Omega Ruby/Alpha Sapphire's; the rest Emerald's; Emerald's Rustboro rival battle, off the rival's line, went to the
Tower, and `migrate()` moves chapter 2's stars, `s.hoE`): eleven chapters from Littleroot Town to Steven in Meteor Falls, the Journey's
end (Emerald's post-game), Emerald's story (both Team Magma and Team Aqua: Tabitha and Maxie at Mt. Chimney, the Magma Hideout in Jagged Pass where
Groudon wakes, the Space Center battle beside Steven; Shelly at the Weather Institute and the Seafloor Cavern, Matt, Archie and Kyogre;
the clash in Sootopolis, Sky Pillar and Rayquaza (Lv 70, a side stage before the League); Juan as the eighth Leader, Emerald's Elite Four
and Champion Wallace; the Rustboro rival battle; then the Lati@s, the Regis in Emerald's order, Deoxys on Birth Island, Steven's Beldum,
Groudon and Kyogre, Lv 70, in the Terra and Marine Caves, then Steven). Grunt stages have one or two Grunts each. The Battle Tower's Hoenn
wing (`TOWER_WING.hoenn`, 92 battles) holds the rest: the weaker versions' teams (Ruby/Sapphire's and Emerald's where the Pokémon differ:
Courtney, Matt and Archie at Mt. Chimney, Steven as Champion, Wallace's Gym, Emerald's Norman, Winona, Sidney and Drake...), Emerald's
Gym Leader rematches and Rustboro rival battle, the six Frontier Brains (Silver and Gold), Omega Ruby/Alpha Sapphire's own battles and
rematches, Aarune and the Delta Episode (Zinnia, Courtney, Matt). Music: Ruby/Sapphire's 57 tracks and Emerald's own five (the album's
third disc, downloaded with the owner's OK, 2026-10-15): Abnormal Weather for the clash in Sootopolis, Rayquaza Appears! as it arrives,
and in the Tower's Hoenn wing the Battle Frontier, the Battle Tower's lobby while you pick a team, and the Frontier Brains' battle theme.
Then 23 more (the owner's second OK): Emerald's encounter themes for every Trainer stage's scene (from pret/pokeemerald's trainer data and
scripts), H-Help!, Crossing the Sea, the Oceanic Museum, Deoxys's two, and each Frontier Brain's facility lobby with the Symbol fanfare.
Emerald's map data also corrected the Terra and Marine Caves: they play its cave theme (Petalburg Woods').
The Ruby/Sapphire build: eleven chapters from Littleroot Town to Sky Pillar (Professor Birch's Bag on Route 101, the rival, Wally's Ralts, Petalburg Woods, the Devon
Goods, Mr. Briney, Steven in Granite Cave, the Oceanic Museum, the eight Gyms with Wallace as the eighth, the Winstrates, Meteor Falls, Mt.
Chimney, the desert and the Root Fossil, the Weather Institute and Castform, the Devon Scope's Kecleon, Mt. Pyre and the Orbs, the hideout,
Mossdeep, the Seafloor Cavern, Kyogre in the Cave of Origin, Victory Road and Wally, the Elite Four, Champion Steven; then the Lati@s, the
Sealed Chamber and the Regis, Steven's Beldum, Groudon for the Red Orb, and Rayquaza at the top of Sky Pillar, the Journey's end, as Mewtwo
is Kanto's). Ruby/Sapphire's teams (as Kanto uses Red/Blue's) with the house rule on evolved opponents, Gen 3 catches and gifts (Wynaut,
Lileep, Castform, Beldum, the legendaries), Hoenn's Badges (`HOENN_BADGES`, drawn shapes), caps and Medals, the rival following your
starter (`birchMon`; May while you look like a boy, Brendan while you look like a girl, as in the games). Canon choices: Ruby and Sapphire
mirror each other, so each villain event is one version's with that version's party: Team Aqua in Petalburg Woods, Rusturf Tunnel and the
Museum (both versions' Grunts there have the same Pokémon but the Museum's Carvanha), Team Magma at Meteor Falls, Mt. Chimney (Tabitha, Maxie)
and the Weather Institute (Courtney), Team Aqua from Mt. Pyre on (Matt, Shelly, Archie, Kyogre); Groudon (Ruby's Cave of Origin, Lv 45) is a
side stage after the League, once Archie and Maxie return the Orbs (Ruby and Sapphire's post-game); Latias roams (Sapphire, Lv 40) and Latios
waits on Southern Island (Sapphire's Eon Ticket, Lv 50); Kanto's Helix choice becomes Hoenn's Root Fossil (Lileep). Pictures: Ruby/Sapphire's
Game Boy Advance trainer sprites (`ho_*`). Music: Ruby/Sapphire's (57 tracks, 186 MB, from the Super Music Collection, downloaded with the
owner's go-ahead into `resources/audio/hoenn`: the Emerald gamerip has only Emerald's new tracks): the "ho:" keys, a place per chapter and
per stage scene (a stage's `music`), `hoennMusic` for its battles. Next: Sinnoh, once the owner has checked Hoenn.

**Phase 3: Sinnoh is built (2026-10-15), waiting for the owner's check.** `src/a4d_sinnoh.js`: Platinum's story in 13 chapters, 96 main
stages and 51 side stages, from Professor Rowan's briefcase on Route 201 to Champion Cynthia, then the Battle Zone (Flint & Volkner,
Stark Mountain's Mars, Jupiter and Charon) and Spear Pillar's Dialga and Palkia (Lv 70; Palkia ends the Journey). Each story battle takes
the strongest of its Diamond/Pearl, Platinum and Brilliant Diamond/Shining Pearl teams (the owner's pick, asked twice). Where the
versions' Pokémon differ, head-to-head battles decided (both teams against the same random Gen 4 teams at one level, 80-240 each): the
player beat Platinum's Volkner 68% vs BDSP's 83%, Aaron 57% vs 68%, Bertha 15% vs 64%, Flint 48% vs 52% (240 teams), and BDSP's Lucian
51% vs Platinum's 71%, Cynthia 9% vs 19%, League Barry 24% vs 54%. The Versions row's power total (which ignores held items) agrees on
five; it would take BDSP's Flint (by 0.1%) and Platinum's Lucian instead (the owner can choose either measure). Where only levels differ the higher ones
count: Fantina's BDSP team (Lv 32-36) makes her the fifth Gym, as in Diamond and Pearl, so the Badges run Coal, Forest, Cobble, Fen,
Relic, Mine, Icicle, Beacon; Heatran and Regigigas are Lv 70 (Diamond/Pearl, BDSP), Drifloon Lv 22. Everything else is Platinum's,
the higher-levelled or the only version (Cyrus at Celestic and in the Distortion World, Giratina's Origin Forme Lv 47, Charon). Rowan's
assistant is Dawn or Lucas, the one you aren't (`sinnohAssistDawn`, by your look). Barry takes the starter strong against yours, with
two of Buizel, Roselia and Ponyta and his first battle at Lv 3 (`barryMon`/`barryTwo`). Gifts outside Gen 4 (Cynthia's Togepi, Bebe's
Eevee, the Veilstone Porygon) wait for their region. Sinnoh's Badges (`SINNOH_BADGES`, drawn shapes), Medals (`sbadge0-7`, `schamp`),
pictures (`si_*`, the DS ones), and music (79 tracks, 324 MB, the Diamond & Pearl Super Music Collection (Looped) with Platinum's disc,
downloaded with the owner's go-ahead into `resources/audio/sinnoh`: the "si:" keys and `sinnohMusic`). The Battle Tower's Sinnoh wing
(`TOWER_WING.sinnoh`, 59 floors, Lv 21-88) holds what the Journey leaves out: the weaker versions' teams, BDSP's and Platinum's
rematches, Platinum's Battleground and Survival Area, Palmer, BDSP's Dawn and Lucas. Not in it: the Battle Frontier Brains (no canon
teams collected yet) and BDSP's Morimoto (no picture in the pack). The other versions' catches are side stages (the owner's pick, after
the Tower rule: catches don't fit the Tower): BDSP's Grand Underground (nine Hideaways at their Badge-scaled levels: Cherubi, Misdreavus,
Murkrow, Bronzor, Stunky, Munchlax, Purugly, Tangrowth; the Skull and Armor Fossils as gifts), Ramanas Park (all 17 Legendaries at Lv 70,
both versions' rooms; its Regis and birds replace Platinum's Lv 30 ruins and Lv 60 roamers, the stronger encounters; the Distortion Room's
Lv 100 Giratina is only beaten) and the Mythicals Darkrai (Lv 50), Shaymin (Lv 30) and Arceus (Lv 80, after Palkia). Three more tracks
(Hall of Origin, Battle! (Arceus), The Underground: 82 in all, 335 MB) with the owner's go-ahead. Manaphy is a side gift (the owner's
ask: its Egg from the Poké Mart's deliveryman, as a Pokémon Ranger mission sent it; a side stage with `chest: 1` opens like a chest);
Phione, which only comes from breeding it, is left out. Seven more tracks with the owner's go-ahead (89 in all, 364 MB): the Battle Tower
set (the lobby, the Frontier Brain's battle and victory: Sinnoh's wing plays the Fight Area over its floors, Palmer the Frontier Brain),
story cues (Catastrophe! and Giratina Appears! as Spear Pillar's scene goes on, the Azure Flute jingle, The Elite Four Appear!; a scene
line's `m`/`j`), and BDSP's own Ramanas Park (from its gamerip) for the park's stages.

**Phase 3: Unova is built (2026-10-15), waiting for the owner's check.** `src/a4e_unova.js`: one Journey in two parts (the Unova row
above), 27 chapters, 193 main stages and 78 side stages. **Part 1, Black/White's story** (13 chapters): Juniper's gift box in your room
and the first battles with Bianca and Cheren (both Lv 4, the house rule: at the games' Lv 5 even Bianca's starter, weak to yours, usually wins here; then, the owner's rule, Route 1 and 2 sized to the Pokémon you can have there, and the Striaton Gym setting the cap from the start: N, Bianca and Cheren before it don't),
Ghetsis's speech and N in Accumula, the Striaton brother whose type beats yours and the Dreamyard's monkey that beats him, the eight
Gyms (Trio to Legend, Drayden for Black), Team Plasma at every event, N's five battles, Reshiram (Lv 50) in N's Castle, N's Zekrom and
Ghetsis; then its post-game (Looker and the Sages, Bronius's and Ryoku's Grunts, Volcarona, Musharna, Victini, Kyurem, Landorus,
Cynthia) to Champion Alder (Lv 77, Part 1's last stage, no Champion title). **Part 2, Black 2/White 2's story** (14 chapters, Challenge
Mode's teams): Bianca's starter in Aspertia, Hugh (Lv 4 first, his starter strong against Part 2's), Cheren's and Roxie's Gyms, the
Castelia Sewers, Colress, the Subway Bosses, Rood's Zorua, the World Tournament, both Plasma Frigates, Zinzolin four times, the Shadow
Triad, Colress on the Frigate, Black Kyurem (can't be caught) and Ghetsis, the Elite Four with their fifth Pokémon, **Champion Iris**
(the Unova Champion and Hall of Fame); then its post-game (Alder, Hugh, Cynthia, the lake trio, the Regis and Regigigas, Heatran,
Cresselia, Latios, the Nature Preserve's Haxorus, N and Zekrom at Lv 70) to **Kyurem (Lv 70), the Journey's end**. The framework it
needed: Journeys in parts (`part` per chapter, `PART_NAME`, `regionPart`, `partCap`/`stageCap`, `PART_BADGES`/`partBadges`, the Part 2
starter `partStarterModal`, `S.regions.unova.starter2` and `.pb`), Unova's Badges and Medals (sixteen Badges, Part 1 complete, the
Champion), pictures (`un_*`), music (159 tracks, 597 MB, Black/White's and Black 2/White 2's Super Music Collections, downloaded with the
owner's go-ahead into `resources/audio/unova` and `unova2`: the "un:"/"u2:" keys and `unovaMusic`), and the Battle Tower's Unova wing
(`TOWER_WING.unova`, 154 floors, Lv 13-85: Black/White's League rematch, Black City and the Battle Subway; Black 2/White 2's Normal Mode
teams, rematches, post-game Trainers, the Black Tower and the Pokémon World Tournament). Every team is in the session notes' canon sheets
(`unova_bw_canon.md`, `unova_b2w2_canon.md`, `unova_extras_canon.md`). Next: Kalos, once the owner has checked Unova.

**Phase 3: Kalos is built (2026-10-15, at the owner's ask, alongside Unova), waiting for the owner's check.** `src/a4f_kalos.js`: X and Y's
story in 13 chapters, 119 main stages and 18 side stages, from Vaniville Town (your family's Fletchling, Shauna and your neighbor at the door)
and Aquacorde Town (Tierno's box of Professor Sycamore's starters, Shauna's first battle at X and Y's Lv 5: her starter is the one weak to
yours, and every starter beat it 300 times out of 300) through the eight Gyms (Viola, Grant, Korrina, Ramos, Clemont, Valerie, Olympia,
Wulfric: `KALOS_BADGES`, the owner's sheet's pictures), Team Flare (Glittering Cave, Route 10, the Power Plant with Aliana, the Poké Ball Factory
with Celosia and Bryony and the President's Master Ball, Frost Cavern's Mable, Lysandre Labs with its four scientists, AZ and Xerosic, the Secret
HQ's walkway and basement), Lysandre's three battles (the third, after Xerneas wakes, is his last stand; the weapon fires once more), Couriway's
Sycamore and Route 19's three friends, Victory Road, the Elite Four, Champion Diantha and AZ at the parade (Floette comes home), then X and Y's
post-game: the Looker Bureau (the Secret Base, the Lumiose Gang, the Poké Ball thief in her three disguises, Butler Chalmers, Malva at Hotel
Richissime, Xerosic's hidden floor and Essentia's four battles), the Sea Spirit's Den's bird by your starter (Articuno, Zapdos or Moltres),
Mewtwo in the Unknown Dungeon, and Zygarde at the bottom of Terminus Cave, the Journey's end. **Versions:** X and Y have one team for every
story battle (the canon sheet found no Trainer party tagged X- or Y-only), so the strongest-version rule changes nothing; X's wild Pokémon
are the main catches and Y's the side stages beside them (Swirlix and Spritzee, Clauncher and Skrelp), and **both Legendaries** are in (the
owner's pick, 2026-10-15): Xerneas in the story and Yveltal a side stage after it, Lv 50. The Glittering Cave fossil is a choice in both
versions: the Jaw Fossil's Tyrunt is the main gift and the Sail Fossil's Amaura a side gift. **Rivals**, one line each: your neighbor (Serena
while you look like a boy, Calem while you look like a girl, `kalosRivalSerena`, as Hoenn's May or Brendan) takes the starter strong against
yours and adds Meowstic, Absol, the Eevee evolution that matches your starter's type (`kalosRivalEevee`) and Altaria; Shauna the one weak to
yours with Delcatty and Goodra; Tierno's Corphish line, Talonflame and Roserade; Trevor's Pikachu and Flabébé lines and Aerodactyl. **No Mega
Evolution:** a Mega Stone holder (Lysandre's Gyarados, Korrina's Lucario, Diantha's Gardevoir, the neighbor's Kiloude Absol) keeps its
Pokémon without the stone. **The house rule** (Gen 6 lock first, then Lv 36): Team Flare's Golbat from Lv 36 are Crobat, Lysandre's Lv 45
Murkrow a Honchkrow, Swimmer Kieran's Lv 27 Remoraid an Octillery, Scientist Sonia's Lv 60 Elgyem a Beheeyem, and the Battle Chateau's Lv 40
Magneton a Magnezone; Frost Cavern's Bergmite (Lv 39-40 there) is caught at Lv 36. Gifts from other generations wait for their region:
Sycamore's Kanto partner (the one that covers your starter's weakness), the Snorlax, Korrina's Lucario, the Lapras. The Battle Tower's Kalos
wing (`TOWER_WING.kalos`, 27 floors, Lv 40-75): the Gym Leaders at the Battle Chateau and their rematch teams where the Pokémon differ, the Elite
Four and Diantha there, the neighbor's daily Kiloude battle, Essentia's rematch and the Battle Maison's four Chatelaines (each format's 20th and
Super 50th battle). Pictures: X and Y's (`ka_*`; Celosia, Aliana, Mable and the Admins have none in the pack, so they battle in the Grunts'
pictures; Looker, Gurkinn and Alexa speak without one). Music: X and Y's Super Music Collection, 126 tracks (318 MB, the core set and its
extras, downloaded with the owner's go-ahead into `resources/audio/kalos`: the "ka:" keys and `kalosMusic`). Canon sheets in the session notes
(`kalos_canon.md`, `kalos_extras_canon.md`, `kalos_music.md`).

**Phase 3: Alola is built (2026-10-15, at the owner's ask, alongside Kalos), waiting for the owner's check.** `src/a4g_alola.js`: Ultra Sun and
Ultra Moon's story (the Alola row above) in 17 chapters, 128 main stages and 98 side stages, from Route 1 (Kukui's three Pokémon chase off a
Yungoos; Hau's first battle at Lv 4, the house rule, his starter the one weak to yours) through Mahalo Trail (Nebby, Tapu Koko), the Iki Town
festival, the four islands' trials and grand trials (Ilima, Hala, Lana, Kiawe, Mallow, Olivia, Sophocles, Acerola, Nanu, the captainless trial at
Vast Poni Canyon, Mina, Hapu: `ALOLA_BADGES`), Team Skull (Plumeria, Guzma's three battles, Po Town and the Shady House), the Aether Foundation
(Faba, Lusamine, the rescue at Aether Paradise), the Ultra Recon Squad (Dulse's four battles), Gladion, Necrozma at the Altar of the Sunne and the
Ultra Warp Ride to Megalo Tower, Mount Lanakila (Gladion, the weakened Necrozma, caught), the Elite Four (Molayne, Olivia, Acerola, Kahili) and the
first Champion battle with Hau; then Ultra Sun and Ultra Moon's post-game: Poni Grove's Blacephalon (Stakataka a side stage), Nebby (Solgaleo;
Lunala a side stage), the Tapus, Magearna and Cosmog as side gifts, the Ultra Warp Ride's four Ultra Space Wilds (all 37 Legendaries of both
versions, Lv 60, side stages) and the seven Ultra Beast worlds (each at its highest version's level: Sun and Moon's Buzzwole, Xurkitree and
Celesteela Lv 65 and Guzzlord Lv 70), and Episode RR: Faba, Archie, Maxie, Cyrus, Lysandre and Ghetsis with their Legendaries, and **Team Rainbow
Rocket's Giovanni, the Journey's end**. **Versions:** where a battle exists in both games, the game's power estimate picked (after the region
lock and the Lv 36 rule, a Totem's aura counted as its stages, a tie to Ultra Sun and Ultra Moon): Sun and Moon's Dexio (Slowpoke and Espeon),
**Totem Wishiwashi** (Lana's trial, in its School Form: 1,163 against Totem Araquanid's 981) and **Totem Vikavolt** (Sophocles's trial: 3,325
against Totem Togedemaru's 2,912); Ultra Sun and Ultra Moon's everywhere else. Sun's side is the main version: Ultra Sun's Dulse, Totem Gumshoos,
Mallow and Sophocles in Mina's trial; the other version's Totems are side stages beside their trial (Ultra Moon's Raticate, Ultra Sun and Ultra
Moon's Araquanid and Togedemaru, Sun and Moon's Salazzle, Lurantis, Mimikyu and Kommo-o with their own allies). **No Gyms:** a stamp per trial
and grand trial, counted as their share of eight wherever Badges count (`badgeShare` in a2_core.js: the Badge bonus, the Trainers' Badges, Rookie
Week's goals), shown twelve to a Badge case in two rows; Medals `abadge0-11` and `achamp`; the Trainers' chat says stamps (`journey_stamp`).
**Totems:** a Totem stage is a wild battle named for it with its captain's picture (the Trial Guide's at Vast Poni Canyon), its aura stat stages
fixed to it while it's on the field (`TOT`, `u.aura`, `fixedStage`: "Totem Gumshoos's aura flared to life! Its Defense rose!"), its allies in its
wave. **No Z-Moves or Ultra Burst:** Z-Crystals and Mega Stones are left out, and the Necrozma of Megalo Tower is Dusk Mane Necrozma with Ultra
Necrozma's aura (+1 to every stat). **The house rule** (Gen 7 lock first, then Lv 36): Team Skull's Golbat are Crobat from Lv 36 (Plumeria's
second battle on), Gladion's Lv 42 Golbat a Crobat and his Lv 43 Type: Null a Silvally, Nanu's Lv 43 Krokorok a Krookodile, the Squad's Lv 47 and
49 Poipole Naganadel, the Aether Foundation's Lv 41-42 Magneton, Porygon2, Anorith, Lileep, Magmar and Electabuzz evolved, the Grunts' Pokémon
from Route 15 on (a male Salandit too), Acerola's Lv 30 trial Gastly a Haunter, Vast Poni Canyon's Lv 42 Jangmo-o a Hakamo-o (Hakamo-o is caught at
Lv 44). Gifts from other generations wait for their region (the Eevee Egg, the Aerodactyl, the Porygon, Zygarde, the Ultra Space Legendaries).
Pictures: `al_*` (Sun and Moon's and Ultra Sun and Ultra Moon's; the Rotom Pokédex speaks without one). Music: 184 tracks (660 MB), Sun and Moon's
Super Music Complete and Ultra Sun and Ultra Moon's new music (a gamerip), downloaded with the owner's go-ahead into `resources/audio/alola`: the
"al:" keys and `alolaMusic`. The Battle Tower's Alola wing (`TOWER_WING.alola`, 66 floors, Lv 15-74): Sun and Moon's teams where their Pokémon
differ and their own battles (Kukui on the Champion's throne, Hau on Mount Lanakila, Lusamine in Ultra Space), Ultra Sun's Dexio and both Sinas,
Ultra Moon's side of Mina's trial, both games' post-game, rematches and title defenses, and the Battle Tree's Red and Blue. Canon sheets in the
session notes (`alola_usum_canon.md`, `alola_sm_canon.md`, `alola_music.md`).

**Phase 3: Galar is built (2026-10-16, at the owner's ask), waiting for the owner's check.** `src/a4h_galar.js`: Sword and Shield's story (the Galar row
above) in 17 chapters, 169 main stages and 121 side stages, from Postwick (Leon's exhibition match, his present of Grookey, Scorbunny and Sobble; Hop takes
the one weak to yours and his first battle is at Lv 4, his Wooloo and starter one at a time with their canon moves and his Wooloo's own Ability, Run Away)
through the Slumbering Weald's fog, Wedgehurst and Professor Magnolia, the Wild Area, Motostoke and Team Yell, the eight Gyms (Milo, Nessa, Kabu, Bea,
Opal, Gordie, Piers, Raihan: `GALAR_BADGES`, the owner's sheet's pictures; Allister and Melony side stages), Bede's four battles, Marnie's, Hop's ten, the
Champion Cup's semifinals, Rose Tower and Oleana, the Finals (Bede, Nessa, Bea, Raihan), the Darkest Day (the rusted sword and shield, Rose, Eternatus and
Eternamax Eternatus, caught) and Champion Leon (his ace the starter strong against yours, with Seismitoad, Mr. Rime or Rhyperior); then Sword and Shield's
post-game: Sordward and Shielbert, the stadiums' rampaging Dynamax Pokémon, Zacian (caught as Crowned Zacian, Lv 70; Zamazenta a side stage), Hop with
Zamazenta, Marnie at Spikemuth and the Champion Cup rematch; The Isle of Armor (Klara, Mustard, Kubfu and the Tower of Darkness; Avery and the Tower of
Waters side stages; the Galarica Cuff, Honeycalm Island's Vespiquen, Mustard's last battle) and The Crown Tundra (Peony, Calyrex and Glastrier, the Ice Rider;
Spectrier and the Shadow Rider side stages; the giants with Regieleki (Regidrago a side stage, Regigigas Lv 100 a side Max Raid), the Galarian birds, the
Swords of Justice and the Max Lair's 47 Legendaries as side stages) and **Peony at the Max Lair, the Journey's end**. **Dynamax:** every Gym Leader's ace
but Piers's (Spikemuth has no Power Spot), the rivals' and villains' Dynamax and Gigantamax Pokémon, the Wild Area's and the stadiums' Max Raids and the Max
Lair's Legendaries have a Dynamax aura, Defense and Sp. Def +1 (`DYN`/`GMX`, a spec's `auraN` naming it; the engine's Totem aura). Gifts from other
generations wait for their region (Leon's Charmander, Honey's Bulbasaur and Squirtle, Hyde's Porygon, the Type: Null, the Cosmog, the Legendaries).
**The house rule** (Gen 8's lock, then Lv 36; a Pokémon that can evolve into a Galarian form does): Allister's Lv 34 Galarian Yamask a Runerigus, Doublade
from Lv 44 Aegislash (Caden, Sordward), Team Yell's Galarian Linoone from Lv 35 Obstagoon, Raihan's Gym Trainer's Lv 45 Hakamo-o a Kommo-o, the Isle of
Armor's after-the-Darkest-Day teams evolved (Klara's and Avery's Galarian Slowpoke Galarian Slowbro, Mustard's Kubfu an Urshifu); Galarian Darumaka and Snom are
caught at Lv 35, Clobbopus at 34, Galarian Mr. Mime at 41. The Battle Tower's Galar wing (`TOWER_WING.galar`, 31 floors, Lv 50-80): Leon at each tier of the
Battle Tower, Breeder Chloe, Klara's and Avery's rematches and the Galarian Star Tournament's twenty competitors. Pictures: `ga_*` (Sword and Shield's; the
Gym Trainers in the League Staff's, Macro Cosmos's staff in the Office Worker's; Honey, the Champion Cup's Gym Challengers and GAME FREAK's Morimoto have
none, so they're left out). Music: 163 tracks (653 MB, `resources/audio/galar`, the "ga:" keys and `galarMusic`). Canon sheets in the session notes
(`galar_canon.md`, `galar_extras_canon.md`).

**Phase 3: Paldea is built (2026-10-16, at the owner's ask, alongside Galar), waiting for the owner's check.** `src/a4i_paldea.js`: Scarlet's story (the Paldea row above) in 30 chapters, 206 main stages and 105 side stages, from Cabo Poco (Director Clavell's three; Nemona's first battle at Lv 4, the house rule, her starter the one weak to yours, with its canon moves; Koraidon in the Inlet Grotto; Arven at the lighthouse) through the Treasure Hunt's three stories woven together by level: the eight Gyms with their Gym Tests (`PALDEA_BADGES`, the owner's sheet, named by type: the Bug Badge...), the five Titans (each fought alone, then with Arven at twice its HP; a Medal each, named for Arven's Titan Badges; the Former Titans caught after) and the five Team Star bases (a gate battle, a Star Barrage, the boss and their Starmobile; a Medal each, named for the squads' Star Badges); then the Pokémon League (the interview, the Elite Test, Top Champion Geeta, the Champion title), Arven at the lighthouse, Director Clavell and Penny as Cassiopeia, Champion Nemona, The Way Home (the Research Stations, AI Sada, the Paradise Protection Protocol's Koraidon; your Koraidon joins at Lv 68), the Academy Ace Tournament (Arven, Jacq, Dendra, Geeta), the Treasures of Ruin and Area Zero's Paradox Pokémon (Scarlet's main, Violet's side), the other Koraidon (Lv 72), Walking Wake and Iron Leaves (the Tera Raid events, side stages); then the DLC: The Teal Mask (Carmine and Kieran, the Crystal Pool, the Titanic Loyal Three at four times their HP, Ogerpon's four mask battles, Perrin's Bloodmoon Beast, the Kitakami Ogre Clan as side stages), The Indigo Disk (Blueberry Academy, the Elite Trials and the BB League's Elite Four, Champion Kieran, the Underdepths' Stellar Pokémon, Kieran's Terapagos and Stellar Terapagos; Snacksworth's 25 Legendaries and Perrin's Paradox Pokémon after) and Mochi Mayhem (Pecharunt, the Journey's end). Every team is from the session notes' canon sheets (`paldea_canon.md`, `paldea_dlc_canon.md`, `paldea_extras_canon.md`; every wild stage's Pokémon checked against their location tables). **The house rule** (the Gen 9 lock allows every evolution, then Lv 36): Nemona's Lv 21 Pawmi a Pawmo and her Lv 36 Pawmo a Pawmot; Team Star's gate and Barrage Pokémon evolved (Gulpin, Shroodle, Houndour, Morgrem, Hattrem, Croagunk, Primeape); the Montenevera and Alfornada Gym Trainers' (Greavard, Shuppet, Haunter, Misdreavus, Gothorita, Kirlia); Medali's Lv 34 Dunsparce a Dudunsparce; The Teal Mask's after-The-Way-Home Carmine and Kieran (Poochyena, Vulpix, Poltchageist, Swadloon; Sentret, Yanma, Poliwhirl, Dipplin, Gligar); in the Tower Katy's Ursaring an Ursaluna, Eri's Primeape an Annihilape, Hassel's Duraludon an Archaludon; Greavard is caught at Lv 29 and Poltchageist at Lv 35. Gifts and catches from other generations wait for their region (the Bloodmoon Ursaluna and Perrin's Hisuian Growlithe for Galar, Meloetta, Snacksworth's Legendaries). The Battle Tower's Paldea wing (`TOWER_WING.paldea`, 48 floors, Lv 16-87): The Teal Mask's before-The-Way-Home teams where their Pokémon differ, the Gym Leaders' and Team Star bosses' rematches, the Academy Ace Tournament's teachers and Hassel, the League Club Room's guests and Director Cyrano. Pictures: `pa_*` (Scarlet's where the pack has both; the Academy's Students are the pack's Gen 8 schoolkids). Music: the whole Super Music Collection, 208 tracks (802 MB, downloaded with the owner's go-ahead into `resources/audio/paldea`: the "pa:" keys, `paldeaMusic`). Canon sheets in the session notes, with `paldea_music.md`.

1. **A new world per save; Trainers who progress.** (built)
   - Each save's world begins at its new game (`S.world`), replacing the fixed launch date (`SERVER_EPOCH`). The version bump starts every old save over.
   - Every Trainer gets a pace and plays during their own hours. Their progress is worked out from the clock, so it advances while the game is closed: the region they're in, the stage, their level, Badges, roster and team. Everything that reads a Trainer's strength follows it: points and tiers, Clubs, Rankings, the economy, chat.
   - Trainers build toward their archetype with what they have: unevolved Pokémon, and moves in place of setter Abilities.
2. **The region framework.** (built)
   - Stage ids per region; a new game's region and starter choice (the player, the Demo by its optimizer, Trainers by playstyle and favourite region).
   - Each region's Pokédex lock in its Journey; the Safari pool from unlocked regions; no other Safaris until every Journey is done. Prizes, gifts and evolutions wait for their region.
   - Per-region level caps and Badges; features opening along the first Journey, whichever region it is.
3. **The eight new Journeys** (Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar and Paldea built, every region; Johto moving to Crystal and Hoenn to Emerald, the Versions rows above; other content to the Battle Tower), one at a time, full size, the owner checking each: Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea. Canon teams, the owner's trainer sprites (all present), generic scenes until regional art and music arrive.
4. **Chat that follows progress**, plus regional music and art as the owner provides it.
   First part built (2026-10-15), in a6e_people.js and a6c_lines.js:
   - **Each Trainer's own Journey:** `journeyCtx(p)` gives their region, stage or place, chapter, next big battle, latest Badge and starter. Chat's {leader}, {stage} and {ep} come from it.
   - **New Journey topics:** journey_new, journey_badge, journey_champ and journey_all ("Got the Fog Badge! Chuck next", "Johto Champion! 7 regions to go").
   - **The featured Safari areas:** they come up in chat only from Trainers who have finished all nine Journeys (`specialFor`, `CLAIM_SAFARI`). The others' 5★ catches come from the Whole Park of their own regions (`parkFives`).
   - **"Since launch" and "the old days":** lines like these need a world at least 30 days old (`CLAIM_OLD`), and "Day one on…" only its first day.
   - **The server FAQ** describes the new world.
   Still to do in phase 4: regional music and art as the owner provides them, more lines per region.
