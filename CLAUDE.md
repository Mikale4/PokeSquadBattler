# PokeSquad Battler

A phone-first squad battler with every Pokémon from Kanto to Paldea (all 1,025 species and their forms; every region, Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar and Paldea, has a Journey),
shipped as one self-contained file: `PokeSquad Battler.html`. It was called Pokémon Kanto Squad until 2026-10-19 (the owner renamed
everything: files, repo, link; this project folder keeps its old name, and the save keys stay `pokemon_kanto_squad_*` so saves carry over).
It was split out of the `C:\Games\Arknights Tactics` repo on 2026-10-05 and shares that repo's squad-battle engine. The old `pokemon/`
folder there was deleted; its history (up to commit 9e60e37, branch `claude/swgoh-mobile-game-html-ajhk0t`) is still in that repo.
This folder is its own git repo (branch `main`), on GitHub: `Mikale4/PokeSquadBattler` (`Mikale4/PokemonKantoSquad` until the rename; 2026-10-16, with every resource, the soundtracks too: a push over ~2 GB goes up in parts; public since 2026-10-17, the owner's pick). The playable game is this repo's GitHub Pages site, https://mikale4.github.io/PokeSquadBattler/ (`.github/workflows/pages.yml`: the built game as `index.html`, no music; it deploys by itself whenever a push to `main` changes the built game; the old `PokemonKantoSquad-Play` link is closed). Commit and push only when the owner asks. Game details, the terminology table and the file list are in `README.md`.

## Online battles
They're on PokeSquad Battler's own Pokémon Showdown site (the game's own `online.html` page and `server/server.js` were removed on
2026-10-20, the owner's pick). The battle rules draw randomness only from `R` (never `Math.random`): the server runs each battle on
its own seeded dice. README: *Online battles*.
On Pokémon Showdown (the owner's pick, approach A, in phases; README: *On Pokémon Showdown*): the server fork `showdown/server`
(`Mikale4/PokeSquad-Showdown`, Render) runs the game's engine, `pokesquad/engine.js` from `tools/build_engine.js` (src up to
a7_engine plus `tools/showdown_adapter.js`, the translator: `readTeam`/`validateTeam`, `moveKey`); the client fork `showdown/client`
(`Mikale4/PokeSquad-Showdown-Client`, its Pages site) shows them, its teambuilder on the game's data: `pokesquad/data.js` from
`tools/build_showdown_data.js` + `tools/showdown_data_loader.js` (the `gen9pokesquad` mod, `isPokeSquad`; three move slots).
build.sh writes both; after a rules or data change, push the forks too (only when the owner asks). The server's
PokeSquad Bot (`server/chat-plugins/pokesquad-bot.ts`, the client's Battle the Bot) plays top Trainer teams from
`showdown/server/pokesquad/bot-teams.json`: rerun `node tools/build_bot_teams.js` after a team config, optimizer or rules change.

## Never edit `PokeSquad Battler.html` directly
It's a build output. Edit the parts in `src/` and rebuild. `PokeSquad Battler Reference.html` (every move, Ability, item and TM) is generated
from the built game by `node tools/build_reference.js` (template `tools/reference.html`): rerun it after data changes, never edit the output.

## The owner's notes (`Notes/`)
The Reference has a Note button on every move, Ability, item and TM; the owner's notes export as `Notes/notes YYYY-MM-DD HHMM.md`
(a section per note: `## Move · Thunderbolt`, a hidden `<!-- note: move:thunderbolt @<version> -->`, **Now:** what the Reference
showed, then the request). When the owner asks to review notes, or a note file is waiting there: do every request in it (the rules
here still apply: canon, house rules in README, the team config, tests), add a **Done:** line (or **Not done:** and why) under each
note, move the file to `Notes/done/`, rebuild, and rerun `node tools/build_reference.js` so the Reference shows each reply.

```sh
sh src/build.sh     # embeds resources/ (sprites, icons, cries...) as base64, syntax-checks, then swaps in the new HTML
```

`src/` parts, in build order (each relies on globals from earlier ones): `dist/res.js` (generated: item icons, type labels, cries, move sound table) · `a1_head.html` CSS ·
`a2_core` (markup, type chart, weather, items, statuses, `AI_STYLES`) · `a3a_dex.js` (**generated** by `python3 tools/build_data.py`: species with current
types and stats, every generation's learnsets and TMs, current move data, each move's slot, evolutions, Abilities; edit `SLOT_FIX`/`EXCLUDE`/`ABILITY_PICK`/`META_FIX` there, never the .js) · `a3b_kits` (skills, move text,
what a Pokémon knows: `skillsOf`/`defaultMoves`/`moveValue`, Abilities, held items, `OPS`) ·
`a3c_showdown_text` (generated: Showdown's battle text) · `dist/sprites.js` · `a4_story` (Kanto's Journey, Explore, Tower, shops, `REGIONS_SOON`; any stage's `reward` is what its scenes hand you, given on its first clear: items, held items, TMs `tm: tmId(move, gen)`, Pokémon; only items that do something, a gift of balls is Safari Balls, the owner's rules) ·
`a4b_johto` (the Johto Journey: Crystal's story, each battle with its strongest version's team, Crystal's trip to Kanto before Red, `JOHTO_JOURNEY`, Silver `silverMon`, Johto's Battle Tower wing; adds itself with `indexJourney`) ·
`a4c_hoenn` (the Hoenn Journey: Emerald's story, each battle with its strongest version's team, `HOENN_JOURNEY`, the rival `birchMon`/`birchTeam`, May or Brendan by your look `hoennRivalMay`; Hoenn's Battle Tower wing `TOWER_WING.hoenn`) ·
`a4d_sinnoh` (the Sinnoh Journey: Platinum's story, each battle the strongest of its Diamond/Pearl, Platinum and BDSP teams, the other versions' catches as side stages (the Grand Underground, Ramanas Park, the Mythicals; Manaphy's Egg a side gift: a side stage with `chest: 1` opens like a chest), `SINNOH_JOURNEY`, the rival `barryMon`/`barryTwo`, Dawn or Lucas by your look `sinnohAssistDawn`; Sinnoh's Battle Tower wing `TOWER_WING.sinnoh`, generated from the canon sheets) · `a4e_unova` (the Unova Journey in two parts, the owner's rule: Part 1 Black/White's story, Part 2 Black 2/White 2's with Challenge Mode's teams at its levels, each part's post-game in it, Black's and Black 2's side of the version exclusives; `UNOVA_JOURNEY`, `PART_NAME.unova`, the rivals `cherenMon`/`biancaMon`/`hughMon` by each part's starter (`unovaStarter`, `unova2Starter`), the Striaton brother `trio()`, each stage's place music `UNOVA_PLACE_BGM`; Unova's Battle Tower wing `TOWER_WING.unova`, generated from the canon sheets) · `a4f_kalos` (the Kalos Journey: X and Y's story and post-game (the Looker Bureau, the Legendaries, Zygarde last); X and Y share every story team, so X's catches are the main stages and Y's side stages, and both Legendaries are here (the owner's pick: Xerneas in the story, Yveltal a side stage); `KALOS_JOURNEY`, your neighbor Serena or Calem by your look `kalosRivalSerena`, the rivals `kalosRivalMon`/`shaunaMon` by your starter, `kalosRivalEevee`, Sycamore's Kanto gift `kalosKantoGift`, the Sea Spirit's Den bird `kalosBird`; no Mega Stones; Kalos's Battle Tower wing `TOWER_WING.kalos`) · `a4g_alola` (the Alola Journey: Ultra Sun and Ultra Moon's story and post-game (the owner's pick), each battle the strongest of its Sun and Moon and Ultra Sun and Ultra Moon teams, Ultra Sun's side the main version (Moon's catches and the other version's Totems as side stages); no Gyms: a stamp for each of the island challenge's twelve trials and grand trials (`ALOLA_BADGES`, `REGION_BADGES.alola`), counted as their share of eight wherever Badges count (`badgeShare` in a2_core.js: `statBadges`, `curveBadges`, `saveBadges`; journeyCtx says stamps, the chat's `journey_stamp`); a Totem's aura is stat stages fixed to it (`TOT`, a spec's `aura`, `u.aura` and `fixedStage` in a7_engine.js; it ends when the Totem leaves the field), a Totem stage is a wild battle named for it with its captain's picture (`totemTR`); the rival `hauMon`/`hauEevee` by your starter (`alolaStarter`), Gladion's Memory `gladionMemory`; no Z-Moves or Ultra Burst (Megalo Tower's Necrozma is Dusk Mane Necrozma with Ultra Necrozma's aura); Alola's Battle Tower wing `TOWER_WING.alola`) · `a4h_galar` (the Galar Journey: Sword and Shield's story and post-game (Sordward and Shielbert, the Champion Cup rematch), then The Isle of Armor and The Crown Tundra, the owner's pick, Peony at the Max Lair last; Sword's side (Bea and Gordie the Gyms; Shield's Gyms, catches, Shielbert and Avery side stages beside them); `GALAR_JOURNEY`, `GALAR_BADGES` (the owner's sheet, `pic: "galar_*"`), Hop by your starter `hopMon` (the one weak to yours), Leon's `leonAce`/`leonSix`; no Dynamax: a Dynamax or Gigantamax ace battles with a Dynamax aura, Defense and Sp. Def +1 fixed to it (`DYN`/`GMX`, a spec's `aura` and `auraN`, the owner's pick), double HP and drawn 1.7× bigger (Totems 1.4×: `dmax`, `size` in buildUnit); `WGA` grows opponents within Gen 8, into Galarian forms where it can (`gaGrown`); a spec's `ab` is its own Ability, kept by `convWave` (Hop's Wooloo's Run Away); Galar's Battle Tower wing `TOWER_WING.galar`) · `a4i_paldea` (the Paldea Journey: Scarlet's story (the owner's pick: Professor Sada, Koraidon, the ancient Paradox Pokémon; Violet's catches, its Quaking Earth Titan Iron Treads and Turo's Zero Lab battle side stages), the Treasure Hunt's three stories woven together by the games' levels (the owner's pick): the eight Gyms, the five Titans (each fought alone, then with Arven at twice its HP: `TITAN`, `titanTR`, a stage's `titanWin`), the five Team Star bases (a gate, a Star Barrage stage `barrage`, the boss with their Starmobile, a stage's `starWin`), the League and Top Champion Geeta, Arven, Clavell and Penny, Champion Nemona, The Way Home, the base post-game, then The Teal Mask, The Indigo Disk and Mochi Mayhem, each battle with its after-The-Way-Home team, Pecharunt last; `PALDEA_JOURNEY` (its chapters `PALDEA_BASE_CHAPTERS`, `PALDEA_WAYHOME_CHAPTER`, `PALDEA_POST_CHAPTER`, `PALDEA_DLC_CHAPTERS`; each chapter's `bgm` its place music, `wbgm` its wild battle theme, `bb` the BB League's), `PALDEA_BADGES` (the owner's sheet, `pic: "paldea_*"`, named by type), `PALDEA_TITANS`/`PALDEA_STARS` (a Medal each, no Badge: the owner's pick; `paldeaMark`), Nemona by your starter `nemonaMon` (the one weak to yours), Clavell's `clavellAce`/`clavellTwo`; no Terastallizing: a Pokémon its Trainer Terastallizes battles with a Tera aura, Attack and Sp. Atk +1 fixed to it, named for its Tera type (`TERA`, the owner's pick); the Titanic Loyal Three `TITANIC`, Ogerpon's four mask battles `OGER`; `paldeaMusic`; Paldea's Battle Tower wing `TOWER_WING.paldea`) · `a5_sprites` · `a6_state` (saves via `SAVE_SLOT`, progression) · `a6b_ladder` (simulated Trainers, Ranked/Link rules) ·
`a6c_lines` (chat corpus, pure data; `PERSONAS`, the Trainers' 396 hand-written personalities in 32 base families (`ARCHS` in a6e_people, the newer 16 marked `wave2`), dealt out by `personaFor`; a new base family needs its `VOICE`, `ARCH_NAME`, `FRIENDLY` and `NPC_DILIGENT` entries) · `a6c2_traits` (pure data, the owner's ask: 40 temperaments × 25 motivations = 1,000 families, 80 lives, hours, typing styles, regions, and 901 groups of details `"kind|label|options|lines"`: `genPersonas` in a6e_people makes 2,000 more personalities from it, `placeFamilies` puts each family in a base family per save so every personality has a Trainer, `traitGroups`/`traitOf` give every Trainer an answer to all 1,011 groups that agrees with them (`TRAIT_FIX`, their own Kanto Journey), `traitLine` says one, `traitTalk` in a6f_talk answers questions about them) · `a6d_safari` (weekly Safari areas) · `a6e_people` (personalities, chat engine, Clubs, Raid Battles) ·
`a6f_talk` (reading a message, real answers from game data, each Trainer's voice; its `VOICE` and `TALK_FAQ` data are in `a6c_lines`; chat follows each Trainer's own Journey: `journeyCtx`, `specialFor`, the claims `CLAIM_SAFARI`/`CLAIM_OLD` in a6e_people; a line's `r` (a region id or a list) means only someone who has opened that region says it, `lineRegionOk`; `{prof}` is their first region's Professor, `{wing}`/`{wfl}`/`{wn}`/`{wtop}` their Battle Tower wing) ·
`a6g_teams` (the Stadium's top tiers: `ARCHETYPES` built from `TEAM_CONFIG`, `archetypeTeam`, `topTierAccount`, `npcLeads`, `modeDoc`) ·
`a6h_build` (the build optimizer: `abilityValue`/`abMoveMul`, `optMoves`, `bestBuild`, `optNature`, `itemValue`, `shareItems`, `settersFirst`, the meta `playerMeta`/`poolMeta`;
`movePick` multiplies in `MOVE_WORTH` (never for `ENTRY_MOVES`: the samples can't see their free use on entry), what moves are worth in real top-tier battles: `tools/move_worth.json`, made by `node tools/move_worth.js`, embedded by build.sh as `dist/moveworth.js`) ·
`a6j_live` (Recharge, Gem ledger `gemsIn`/`gemsOut`, VIP, the `live(kind, n)` hook, the event scheduler `eventsBetween`/`eventsNow`, rushes and tallies, the Trainers' economy `npcDay`/`npcSum`, server goals/firsts/rankings/groups/merges, the Event Center) ·
`a6k_offers` (packages, Bottle Caps, Exp. boosts) · `a6l_passes` (missions, passes, Poké Pass, Growth Fund, Investment Plan, Check-In) ·
`a6m_lucky` (Poké Wheel, Adventure Board, Lottery, Scratch-Off, Pick-a-Box, Treasure Hunt, Flip Cards, Lucky Bags, Choice Boxes, Auction) · `a6n_festivals` (seasonal festivals, anniversary, Team Rocket Crossover) ·
`a6i_servers` (the one server: `srvDays`, `srvLevel`/`srvRating`, `oneServer` gathering saves from the old server list, Rookie Week) ·
`a7_engine` (battle rules, Expert AI, battle cloning) · `a8a/a8c/a8b` · `a8d_showdown` (generated: Showdown's move animations) · `a8e_showdown_scene` (their stage) · `a9a/a9b/a9c` · `a9d_gameboy` (Game Boy shell: D-pad/A/B/START/SELECT, keyboard,
START menu) · `a9e_accounts` (Trainer Club, `enterGame`) · `a9f_stadium` · `a9g_demo` · `a9h_social` · `a9i_home` (the home screen's overworld) · `a9j_slots` (the Game Corner's slot machine, drawn on a canvas; its rules and odds are `slotSpin`/`slotOdds` in `a6m_lucky`) · `a10_boot`.
These systems were ported from the sister game in `C:\Games\Arknights Tactics\mobile\src` (same engine); internal names kept that game's
(ladder/rta/guild/gBoss/Doctor/banner) while every visible term is Pokémon. `build.sh` fails on duplicate top-level functions.
All parts share one script, so a later `function` with the same name silently replaces an earlier one.
The folder name has spaces: keep every path in shell scripts quoted, or relative to the project folder.

## Rules
- The whole UI sits inside `#screen` (a CSS size container) in the Game Boy shell: overlays are `position:absolute`, sizes use `cqh`/`cqw`.
  The shell's shape is the device setting `devicePrefs().layout` (Hybrid/Game Boy/Switch, `LAYOUTS`): `applyShell` puts `.land` on `#gb`
  for the Switch body; style the wide body with `:where(.gb.land)` rules, never an aspect-ratio media query.
  Gameboy and Switch (`.fit`, `SHELL_REF`) lay out at 390×844 / 844×390 and are scaled with a transform: size a canvas from its
  `clientWidth`/`clientHeight`, draw it at `pxRatio()`, and turn pointer positions into its own pixels (`* el.clientWidth / rect.width`).
- Visible text must be Pokémon terminology (Safari Zone, PP, Gems, Poké Dollars, IVs, Mastery, held items, Mail, Medals, Gym Badges; glossary in `README.md`).
- Types, the type chart, base stats and move power/type/accuracy are the current ones (18 types; Struggle is Typeless "???"; no Stellar or Tera).
  Moves come from every generation's level-up learnsets (the newest game's level wins), TMs, and (the owner's pick, 2026-10-20) every main
  game's egg and move-tutor moves, taught by the Move Tutor for a Heart Scale (`OPS[k].egg`/`.tutor`, `tutorable`, `tutorMove`;
  PokeAPI's data filled in from Showdown's learnsets: `tools/showdown_learnsets.json`; `learnPool` covers all of it). TMs are labelled by generation: `TMS` ids are
  `gen*1000 + number`, `tmName(id)` gives "TM01 (Gen 1)" (Gen 8 TRs, Gen 9 TM001–229). `EXCLUDE` is empty: every learnable move has a rule (the PP- and position-based ones adapted: README, House rules).
  A Pokémon knows one move per slot (`prog.mv` = [S1, S2, S3]); `MOVES[k].s` is the slot.
  Losing a Journey battle brings that region's Professor's Mail with a free starter: your pick of the two you didn't choose, then the last one after another loss, two at most a region (the owner's rule: `journeyLoss`/`rescueModal`
  in a9c_meta.js; the Demo tries every Journey battle once before planning around it, `demoRescue` picks; Trainers by their own chance, `trainerLoss`).
  New level-up moves go through `offerMove` (an empty slot takes it, otherwise `S.learnQ` asks); `pmv(key)` fills in a missing `mv` from the level.
  Players get the question from `learnCheck` (after a window closes or a screen loads); the Demo never does: it raises and answers each one
  itself in `demoLearn` when nothing else is going on, so a question can't sit open while it plays on.
- Battles: teams of up to six (`ROSTER`), three on the field (`ACTIVE`, `B.units`), the rest in `B.bench`. Every stage fields its waves as one team, three at a
  time (the owner's rule, 2026-10-16: no handicap stages in any chapter, the Professor's gifts cover the early game; the engine's
  `cfg.waveByWave`/`nextWave` can still bring waves in one at a time as new battles, and nothing uses it). You always pick after a faint
  (`B.step()` returns "replace" when `cfg.pick`, even on Auto); the opponent, the Demo and headless sims pick by matchup (`aiReplacement`).
  The battle camera is one view on every screen (the owner's pick): from behind your team (`fitHome`); never a side-on view for wide screens.
  Trick Room, Follow Me/Rage Powder/Spotlight and the field moves (`ENTRY_MOVES` in a3b_kits.js: weather, terrain, hazards, screens,
  Safeguard, Mist, Lucky Chant, Gravity, the rooms) go up by themselves on entry if ready (`autoTrickRoom`/`autoRedirect`/`autoField`), not
  using the turn; at the battle start both sides' leads go in Speed order. Follow Me/Rage Powder last while their user stays out, Spotlight
  while its partner does (newest redirect wins). Tailwind stays manual on purpose (the owner's balance rule).
- Move animations are Pokémon Showdown's (the owner's choice), never drawn ones: `src/a8d_showdown.js` is generated by
  `tools/build_showdown_anims.js` from `resources/showdown/src` (never edit it); `src/a8e_showdown_scene.js` is the stage it runs on
  (`psMove`, `psOther`, `psStatus`, `psResidual`; Showdown's z 0 is your side, 200 theirs). A move missing from Showdown gets an entry in
  `PS_ALIAS`. `tests/figures.js` fails a move without an animation or a missing picture.
  Battle text uses Showdown's lines where it has one: `psT(id, key, vars)` (a7_engine.js) over `src/a3c_showdown_text.js`
  (generated by `tools/build_showdown_text.js`, never edit it); a house rule keeps its own line. The battlefield (weather, terrain,
  screens, hazards, status tints) is drawn the way Showdown does in `a8e_showdown_scene.js`.
  `PokeSquad Battler Move Lab.html` (one to three Pokémon a side, to play any move's animation and set the field: weather, terrain, screens, hazards, status tints) is built by build.sh from the game plus `tools/fxlab.js`: never edit it.
- Move sounds (`resources/audio/move sfx`) aren't embedded either: `tools/pack_sfx.py` maps moves to files (`tools/move_sfx.json`), `moveSound()` plays them.
- Pokémon sprites are the owner's PNG stills (the owner's choice, for consistency: no animated sprites): `resources/sprites/pokemon sprites/front|back`,
  packed by `tools/pack_pngs.py` (back to their 96 px pixels, cropped) into `resources/pokemon/front|back` and `sprites.json`; a form named other
  than "SPECIES FORMWORD" is in its `SPECIAL`, one without a picture borrows its species'. Overworld walk sheets: `resources/pokemon/overworld pokemon`
  (the owner's, Essentials-style form numbers: `MEOWTH_1` Alolan, `MEOWTH_2` Galarian), packed by `pack_home.py`. Cries: `pack_cries.py` (forms cry
  like their species). Trainers are the FireRed/LeafGreen set (`resources/sprites/trainer sprites/more trainers`).
- Generations 1 to 9 (`MAXID = 1025` in `tools/build_data.py`). Forms with their own stats, types or Abilities are their own Pokémon (`FORMS`: the
  Alolan, Galarian, Hisuian and Paldean forms, Rotom's, the Therians, Oricorio, Lycanroc, Necrozma, Crowned Zacian and Zamazenta, Calyrex's riders,
  Ogerpon's masks...); battle-only forms (`BATTLE_FORMS`, `bf`) change mid-battle (`formCheck`/`becomeForm` in a7_engine.js: Zen Mode, Schooling,
  Shields Down, Power Construct, Stance Change, Ice Face, Zero to Hero, Tera Shift). No Megas, Primal Reversion, Ultra Burst, Z-Moves, Dynamax
  or Tera. Evolutions are simplified (the owner's rule) to a level or an item: trades the Linking Cord or their held item, friendship the
  Soothe Bell, odd methods `NO_LEVEL`/`NO_LEVEL_ITEM`; a regional form evolves into its region's form, and a regional evolution is one more
  choice (Quilava: Typhlosion or Hisuian Typhlosion). Every evolution item is in `STONES`/`EVO_HELD` (a2_core.js) and sold at the Mart.
  Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar and Paldea have Journeys (Johto's: `a4b_johto.js`, Hoenn's: `a4c_hoenn.js`, Sinnoh's: `a4d_sinnoh.js`, Unova's:
  `a4e_unova.js`, Kalos's: `a4f_kalos.js`, Alola's: `a4g_alola.js`, all built 2026-10-15, Galar's: `a4h_galar.js` and Paldea's: `a4i_paldea.js`, 2026-10-16, phase 3 of the revamp; the owner checks each before the next);
  a Journey can come in parts (Unova's two, the owner's rule: both must be beaten): each chapter's `part`, `PART_NAME[id]`, `ndPart`,
  `regionPart(id)` (the part you're on), each part's own caps from Lv 5 (`partCapSteps`, `partCap`, `stageCap(nd)` for a stage's battles,
  `journeyProg`/the Demo's `withCap` use it), its own eight Badges (`PART_BADGES`, `partBadges`/`setPartBadges`, `S.regions[id].pb`; the Badge
  case shows a row per part) and its own starter (a later part's first stage has `starter: 1` and a `giver`: `partStarterModal`,
  `S.regions[id].starter2`); the region's Champion title and completion come in its last part; a Trainer battle with `noCap` doesn't set the level cap (`isCapBattle`: Unova's opening, where the Striaton Gym sets it from the start, the owner's rule);
  `REGIONS_SOON` (a4_story.js) holds the other regions' cards (Professor, Gyms or trials, Elite Four, places; a region without a Journey would show Coming soon, none does now). A region's Journey grows its
  opponents within its generation (`grownAt(k, lv, g)`, `WG(g)`, `convWave(w, lv, journeyG(nd))`: no Honchkrow in Johto), keeps its own
  Badges (`REGION_BADGES`, `badgeCase`; every region's are the owner's sheet's pictures, `pack_badges.py`, `badgePic`; the drawn shapes are the fallback), its own people's pictures (`jo_*`,
  `si_*` (the DS ones), `ho_*`, `un_*`, `ka_*`, `al_*`, `ga_*` and `pa_*` in `tools/trainer_sprites.json`: HeartGold/SoulSilver's; the Game Boy Advance ones, Emerald's and Ruby/Sapphire's;
  Black/White's, with Black 2/White 2's where a character changed; X and Y's; Sun and Moon's and Ultra Sun and Ultra Moon's; Sword and Shield's; Scarlet and Violet's) and its own music
  (`resources/audio/johto`, HeartGold/SoulSilver's, the "jo:" `BGM` keys and `johtoMusic`; `resources/audio/hoenn`, Ruby/Sapphire's and Emerald's own, the
  "ho:" keys and `hoennMusic` in a10_boot.js; `resources/audio/sinnoh`, Diamond/Pearl's and Platinum's, the "si:" keys and `sinnohMusic`;
  `resources/audio/unova` and `unova2`, Black/White's and Black 2/White 2's Super Music Collections, the "un:"/"u2:" keys and `unovaMusic`;
  `resources/audio/kalos`, X and Y's Super Music Collection, the "ka:" keys and `kalosMusic`; `resources/audio/alola`, Sun and Moon's album with Ultra Sun and Ultra Moon's new music (a gamerip), the "al:" keys and `alolaMusic`;
  `resources/audio/galar`, the Sword and Shield + Expansion Pass Super Music Collection, the "ga:" keys and `galarMusic`;
  `resources/audio/paldea`, the Scarlet and Violet + The Hidden Treasure of Area Zero Super Music Collection, the "pa:" keys and `paldeaMusic`;
  not embedded, like `resources/audio/music`). A stage's `music` plays its own place's track during its scene (Hoenn's, Sinnoh's, Unova's, Kalos's, Alola's, Galar's and Paldea's).
  A Battle Tower wing can have its own music (`TOWER_WING_BGM`, `TOWER_LOBBY_BGM` in a8c_sfx.js, a floor's `bgm`/`winBgm`/`lobby`/`winJingle`: Hoenn's is Emerald's Battle Frontier, its Brains' facilities and Symbol fanfare).
  A scene line can change the music (`m`) or play a jingle over it (`j`): `playScene` in a9a_screens.js, Sinnoh's `LM`/`LJ`.
  Each region's Journey retells its strongest version (the owner's rule, 2026-10-15: Kanto FireRed/LeafGreen, Johto Crystal, Hoenn
  Emerald, Sinnoh Platinum's story with each battle's strongest version's team: the owner picked it for Sinnoh, measured by head-to-heads where the
  versions' Pokémon differ; Unova both Black/White's and Black 2/White 2's stories in two parts, Black 2/White 2's with Challenge Mode's teams; Kalos X and Y's, one team per battle in both; Alola Ultra Sun and Ultra Moon's story, the owner's pick, with Sun and Moon's teams where they're stronger; Galar Sword and Shield's story, Sword's side (the owner's pick: Shield's Gyms, catches and other battles are side stages beside Sword's), with its post-game and both expansions; Paldea Scarlet's story, the owner's pick (Violet's catches, Titan and Professor's battle side stages), with its post-game and the DLC); everything else from its games goes to its wing of the Battle Tower (`TOWER_WING[id]` = [{ n, t, from,
  waves }], `towerFloors`/`towerFloor(id, f)`, `regionForm` keeps the region lock, `towerOpen` with its Journey, per-wing progress `S.towerW`).
  Regions (the owner's rules, the Journey revamp's phase 2: `docs/journey-revamp-plan.md`): each region's Journey is a `STORY` entry with
  its region id; Kanto's stage ids are bare ("1-1"), the others' start with `REGION_CODE` ("jo1-1", chapters "joc1"); a chapter starts with a main stage (the map, `SCREENS.chapter`, draws a side stage's path from the stage before it); `journeyOf`,
  `journeyMain`, `journeyEnd`, `chapterById`. A new game picks its region (`regionPickModal`, one with a Journey) and that region's
  starter; `S.regions` holds the ones you've opened ({at, starter, done, badges, champ}), `S.region` the one you're on, `S.first` your
  first. Once every open region is done you choose the next (`nextRegions`, `regionStartModal`, `openRegion`: its starter at Lv 5), one at
  a time, each finished before the next (the owner's rule, you, the Demo and the Trainers alike); a region without a Journey would stay locked (`nextRegions`, `trainerRoute`; every region has one now). `playerGens(t)` is your open regions; check `regionOk(k, t)` wherever
  Pokémon are picked for the Safari (t: when an area opened, so it never changes while open; `SAFARI_POOL`). Until all nine are open
  and done (`specialSafari`) the Safari Zone is the Whole Park alone (`safariAreas`, `eventAreas`, `evOpen`). A Journey stage takes its
  own region's Pokémon only (`journeyOk`, the team screen, `launchNode`, the Demo's `nodeSquad`), at most at the region's level cap
  right now (`journeyProg`; the Demo plans with `withCap`/`dprog`); a Battle Tower wing takes its own region's Pokémon only, at most
  2 levels below each floor's strongest (`towerOk`, `towerCap`, `towerProg`; the Demo's `towerSquad`/`towerSim`, the Trainers'
  `towerReach`/`trainerWingLv`: the owner's rules, 2026-10-17); Explore and the Stadium take any. A Pokémon from a region you haven't opened waits for it (`grantOp` keeps it in `S.waitOps`; `evoOptions` holds the
  evolution). Caps and Badges are per region (`levelCap(key)` by the Pokémon's region, `regionCap`, `badgesIn`/`setBadges`, the stat
  bonus `statBadges`: the most in one region). Outside the Journey the game follows your first region (`firstRegion`): its Professor
  writes your letters and owns your Pokédex, Investment Plan and Scratch-Off (`profName`/`profFull`/`profPic`), its store has the TM corner
  and Boutique (`deptStore`, `{prof}`/`{store}` in `FEATURES` texts: `featText`), and the Trainer Card shows every region's Badges and
  Champion titles (`champRegions`, `hofDebut`; Rookie Week's goals count any region: `saveBadges`/`saveChamp`). Features open along your first Journey, whichever region (`firstStage` maps the Kanto
  stages in `FEATURES`). Explore is one set of areas for everyone, all open from the first Pokémon on (`huntOn`; the owner's rule).
  Trainers go by their own progress, never yours (the owner's rule): each Trainer's Journeys open their regions (`trainerProg(i).gens`,
  `trainerGens`, a set of generations; a region's Pokémon are its generation's, regional forms their region's: `genOf`/`regionOf`/`genOk`
  in a6i_servers.js; a Pokémon can have more than one region, `gensOf`: Bloodmoon Ursaluna, and whatever a region's Journey gives you, `journeyGifts`), and only those regions' Pokémon are theirs; their favourites, meta talk, traits and Pokédex follow the same
  (`fieldable`, `metaPool`, `legendsNow` take a set of open generations, `true`/`false` from older calls meaning every region / Kanto's).
  `grownAt` keeps Kanto Pokémon on Kanto evolutions (the Journey stays canon); `grownIn` grows a Trainer's within their open regions.
  PvP limits (the owner's rule, every Stadium mode, you and every Trainer): one Legendary, one Mythical, one Ultra Beast, one Paradox
  (`TEAM_CONFIG.rules.limits`; `pvpGroups` in a3b_kits.js, `pvpClash`/`pvpFits`/`pvpTrim` in a6g_teams.js); every Trainer team may field
  any of them within those limits (the owner's rule: Groudon and Kyogre are weather setters too); `rules.restricted` is empty (a name put
  there would go only to the very strongest Trainers). Every stat change from an item, Ability, the field or a status is a stat
  stage (`fixedStage` in a7_engine.js, shown on the badge, fixed to its source; README House rules). `LEGENDS` (a3b_kits.js) is every
  Legendary and Mythical; the Legendary Safari and the Mythical Distributions rotate through them (`LEGEND_ROTA`, `MYTH_ROTA`).
- All assets live in `resources/`, laid out by the owner (who reorganises it: if the build can't find a file, look before assuming).
  Their packs (`audio/music|cries`, `sprites/items|types|categories|trainer sprites|pokemon sprites|badges`, `area previews`, `trainer card kit`,
  `battle backgrounds`) are theirs: never rename, move or delete them. The build reads what it needs (`tools/item_icons.json` picks the
  item icons, `tools/trainer_sprites.json` the trainer pictures). Generated from them: `resources/cries` (`pack_cries.py`),
  `resources/areas` (`pack_areas.py`, chapter backgrounds), `resources/badges` (`pack_badges.py`: every region's Gym Badges, from the owner's sheet in `sprites/badges`; `badgePic`, `badgeSVG`), `resources/card` (`pack_card.py`, the Trainer Card and Gym Badges),
  `resources/types` + `resources/typeicons` (`pack_types.py`), `resources/battle` (`pack_battlebg.py`), `resources/scenes` (`pack_scenes.py`: the cutscene backgrounds, from `battle backgrounds/BATTLE BACK`), `resources/cutins` (`pack_cutins.py`: the S3 cut-in strips, from `battle effects`), `resources/medals` (`pack_medals.py`: Black 2/White 2's Medals, from `icons`), `resources/emotes` (`pack_emotes.py`: chat emotes, from `extras`), `resources/slots` (`pack_slots.py`: the slot machine, from `extras`), `resources/hud` (`pack_hud.py`: Black 2/White 2's HP bars, status icons and fonts for the battle's overhead bars, from `UI`), `resources/balls` (`pack_balls.py`), `resources/home` (`pack_home.py`: the home
  overworld's map scenes and walkable tiles from `tools/home_maps.json`, the Pokémon overworld sheets, the player walk cycles from
  `tools/home_players.json`). When a scene's walkable tiles are wrong, add sample "ground" tiles in `home_maps.json`, not code. Custom art asks for credit: keep the Credits screen (`titleCredits`) up to date.
  See the table in `README.md`. Use these packs before drawing anything: no generated art where the owner has a sprite.
  On Windows folder names ignore case, so never create twins of their folders that differ only in case.
- `S` is null on the title screen: anything that can run there (sound, the Game Boy shell, timers) must not assume a save.
  `enterGame(slot)` loads one; Guest = `SAVE_KEY`, accounts `SAVE_KEY + ":acct:<id>"`, the Demo `DEMO_KEY`.
- Names B already had beat the ported ones: the Demo's status line is `dsay` (`say` is battle text), Stadium logs use `agoShort`/`ago2` (`ago` is days).
  `DEMO_ON()` is the TDZ-safe way to ask whether the Demo is playing. Its keys are ` (speed) and Q (Stop/Start: Stop hands the player its save, `pauseDemo`/`resumeDemo`; Exit leaves it, `stopDemo`); Escape is the B button.
- Music (`resources/audio/music`, the owner's FireRed/LeafGreen tracks, and `resources/audio/showdown`, Showdown's 19 battle themes for the
  Stadium's random cycle, `stadiumTheme`) is **not** embedded: it plays from next to the HTML with `<audio>`.
  `music(key)` crossfades and ignores repeats, `jingle(key)` pauses and resumes it, `route()` calls `music(screenMusic())`; battles pass
  `cfg.bgm`/`cfg.winBgm` (`nodeMusic(nd)` for Journey stages). The headless Demo (`DEMO.fast`) keeps quiet.
- The battle AI (`aiPlan` in `a7_engine.js`, weights in `AIW`) plans the whole team's turn: focus fire, KOs first, no attacking into immunities
  or resists when a better target exists, no wasted turns. A switch (and the Expert's pick after a faint) is played out first on copies
  of the battle with the same dice (`aiSwitch`, `lookPick`, `lookRoll`, weights in `AISW`): a switched-in Pokémon is unprotected, a
  replacement after a faint is protected, so a worn-down Pokémon usually stays (the owner's ask, 2026-10-19). The Demo's team picks (`squadFor` in `a9g_demo.js`) weigh the real damage math and the
  plain type matchup. Tune either with head-to-head battles on fixed seeds, not single games. Its combo know-how is `combos(u, key)`
  (`cfg.noCombo`/`cfg.comboKeys` switch pieces off for one side in head-to-heads); the optimizer's is `comboBonus` in a6h_build.js.
- **Trainer teams come from `config/team_config.json`** (the owner's rule): roles (the Pokémon that fit, with fit scores; the moves,
  Abilities and items each is there for and which it always keeps; lead/priority/setup flags; its `kind` for the chat lines), archetypes
  and sub-archetypes (role slots in order, the pool for the rest, favored and banned picks, plan texts, `weight`), the rules for every
  Trainer team (Item Clause, the PvP limits, bans), the tiers' rates and Pokémon levels (`tiers[].levels`: every Trainer's
  Pokémon in a tier stay within them, Ranked and Link alike: `tierLevels`/`tierLevelOf`/`monLevelIn` in a6g_teams.js) and the modes' own bans. The owner edits it on
  `PokeSquad Battler Team Config.html` (built by build.sh from the game plus `tools/teamcfg.js`; never edit the output), whose Export
  writes the file; build.sh embeds it as `TEAM_CONFIG` (and stops on a slot naming a missing role). Read the file to know the owner's
  current rules; never write archetypes, roles or tier rates in code again (`config/team_config.default.json` is the original, as
  first made from the old code). Doc roles hold role ids (`rain_setter`); `roleKind(id)` gives the kind the chat texts use. A role can wait on the bench (`bench`, led last by `npcLeads`: every weather, terrain and Trick Room team's backup setter, kind `backup` with `backupOf`, the more offensive of its two setters; it only replaces a fainted Pokémon once the team's field is down, never by a switch: `fieldUp`/`aiReplacement`/`aiSwitch`, the spec's `backup`) or be needed by its plan (`need`: a Trainer who can't fill it runs another, `planTeam`); a role's `list` is the owner's own picks for it, taken before anyone else it fits (the sweeper lists), and `keepFor` what one of them always runs there (Bolt Beak, a Light Ball); every team has 1-2 support Pokémon (screens or redirection: the `support` role, `SUPPORT_KINDS`; on a two-setter team a lead setter that learns the job counts, `doc.cover`), 3-4 sweepers on a two-setter team (`rules.sweepers`), and a role's `oneHolds` is an item one of its Pokémon always holds (Electric Terrain's Ring Target); a Trainer's Follow Me/Rage Powder/Spotlight user never switches out by choice (`u.npc` in `aiSwitch`; no pivot moves, Eject items or Emergency Exit in its build); archetypes can join another as a second plan (`overlaps`, `overlapChance`, a slot's third number: what comes along; `doc.arch.over`, `archName`/`archSub`). Fit lists are scored from game data, not by hand; try changes without a build with `node tools/viability.js 16 <ids> --patch=<file>`.
  Every Stadium mode fields a Trainer through `modeDoc(doc, mode)` ("ranked", "link", "friendly"; a new mode passes its own id and
  gets the Default's rules plus its own). Competitive archetypes must stay real (what a role keeps is in its `keep`).
  After changing the config's archetypes, the optimizer or battle rules, rerun `node tools/viability.js 16` and set each archetype's
  `weight` in the config from it.
- Keep Pokémon facts canon (the Dojo's prizes are Hitmonlee and Hitmonchan; real learnsets and Abilities): the owner checks them.
  House rules the owner chose over canon are listed under "House rules" in README.md (Item Clause, S3 without a starting cooldown,
  multi-strike power, Dream Eater, several items and Abilities): keep them, and add new ones there.
- The player, the Demo and the 3,000 Trainers only ever use pictures from `resources/player sprites` (the owner's folder of
  "Pokemon Trainer <name>.png" sheets; the owner's rule). You and the Demo start as Gen 1's heroes, Red or Leaf; the other looks
  (`AVATARS`) are bought in the Boutique (`S.looks`, `ownsLook`, a feature that opens at 4-3); the Trainers can be any of the
  folder's 20 characters (`DOC_SPR`). `tools/pack_backs.py` cuts every character's front picture
  (`resources/players`, which build.sh puts ahead of every other trainer picture) and Red and Leaf's battle backs
  (`resources/backs`); `pack_home.py` their walk cycles. Round avatars
  use the head close-up (`mugURL`/`mugImg` in a5_sprites.js). Story, Tower and shop characters keep their own trainer pictures.
- Natures (`p.nat`, `NATURES`) and Abilities (`p.ab`, any Ability the species has had; `OPS[k].abs`, Hidden ones only by Ability Patch).
  Story Trainers keep a neutral nature and the species' `OPS[k].ab`; ladder Trainers use `npcOptimize` (what they've got: `npcAccess`) and the Demo `demoPlan`.
  Mints are sold at the Poké Mart, the Ability Capsule and Patch at the BP Exchange; all are used from the Summary.
- Held items (`HELD`, `src`: "mart" Berries, "bp" battle items, "explore" drops) all work in battle (`heldX`/`useUp`/`hpItems`/`statusItems`/
  `hitItems` in `a7_engine.js`). Every one uses an icon from the owner's pack (`tools/item_icons.json`); the Berserk Gene's is Pokémon Showdown's (the games never drew one), credited.
  Mega Stones, Z-Crystals and Tera/Dynamax items are left out: the game has none of those mechanics.
- Live service (`docs/live-service-plan.md` maps the owner's spec): there is no real money; a Recharge (hourly, free) stands in for buying Gems.
  Every action the events count calls `live(kind, n)` once (never count an action twice elsewhere); Gems go in and out through `gemsIn`/`gemsOut`
  (spending must use `gemsOut` so Gem events see it). Everything scheduled lives in `eventsBetween` (one place). Show odds for anything random
  and exact end times; say when a missed day is lost. The 3,000 Trainers take part through `npcDay` (worked out from the clock, so it runs while
  the game is closed). Pop-ups only on the home screen. The Demo plays every system (`demoLive`, `demoOffers`, `demoLucky`).
  The slot machine's odds are counted from its reels (`slotOdds`): change `SLOT_REELS`/`SLOT_PAY` and the shown odds follow; keep it under 100% payback.
- Optimizer changes that touch move values: resample `MOVE_WORTH` (`node tools/move_worth.js 25 4 160 --mode=marginal --damp=0.5`, about 30 min; it
  samples what each move adds beyond the Pokémon's other two in battles between the top Trainers, `B.worthOf`/`B.bestWithout` in a7_engine.js)
  and prove it with `node tools/move_worth_check.js tools/move_worth.json` (the top teams optimized with vs without it, Expert head-to-heads).
- The Demo must never freeze the page it plays on: its planning is async (`squadFor`, `simRun`, `pvpRoster`, `pushState` await `demoBreath`,
  which lets the page draw every ~12 ms), and `matchups` sizes up one Pokémon per probe battle (with dozens on one field every Ability
  check loops over all of them). Anything new the Demo computes for more than a few frames goes the same way.
- The Demo never uses fixed per-species picks: `demoPlan` (a9g_demo.js) builds its core with `a6h_build.js` (moves, Ability, nature, held
  items for the team, against `playerMeta()` once Ranked is open; before that, and while a Journey battle holds it up (`DEMO.focus`), against
  that battle: `demoFoes`, `stageMeta`, `c.cover` for its foes' types, `b.lvl`/`c.journey` for Berry Juice), and real battle results (`DEMO.record`, `demoBattleOver`) count in `simRun`. The chat's
  builds (`buildOf` in a6f_talk.js) use the same optimizer. Check optimizer changes with head-to-head battles (optimized vs old builds).
- Trainers answer the game's rules from `TALK_FAQ` (`a6c_lines.js`): when a rule changes (a house rule, prices, the level cap),
  change its answer there too, `TIER_TALK` when the tiers' rules change (`topTierAccount`), `ARCH_PLAN`/`ROLE_JOB` when an archetype or a move rule changes, and any `PERSONAS` line that states it (the Item Clause Lawyer, the Turn Meter Scientist, the Held Item Expert...). Their builds come from the Demo's optimizer (`buildFacts` → `buildOf`).
- Friendly battles (`launchFriendly`, `cfg.friendly`) change nothing: no points, record, rewards, PP, Exp., Medal or Daily Research progress
  (Sketch is the one exception, the owner's rule: S1/S2/S3 Sketch, `sketch1`/`sketch`/`sketch3`, copy an opposing Pokémon's move in their
  slot for good in every real battle, `B.real` and `u.own` in a7_engine.js, and use it at once, `sketchUse`; Trainers' Smeargle come
  already sketched, `sketcher`/`sketchable` in a3b_kits.js).
- Raid bosses get a fixed HP pool (`maxHp`); percentage effects use `u.chipHp` via `hpBase()` so poison, Recover or Super Fang can't wreck the pool.
  Battles end in a draw after `STALEMATE_TURNS` (no PP in battle; Struggle only when a Pokémon has no S1 move ready).
- A new game is a new world (the owner's rule, 2026-10-15; `docs/journey-revamp-plan.md` maps the revamp): the save's own clock
  (`S.world.start`, `worldStart()`; saves are version 2, so a version 1 save starts over) starts you and all 3,000 Trainers together.
  Each Trainer plays from the world's start (a 6-10 hour launch session, `launchHours`), then in their own hours (`trainerHours`, the
  calendar `isOnline` keeps), at their own pace (`regionHours`, the owner's numbers: 70%+ beat their first region in 2-3 hours, the
  fast in 1-2, the slow by 4-5, whichever region is first: `trainerPace` fits each Trainer's pace to their own first region's length), through the regions in their own order (`trainerRoute`: their favourite Pokémon's, type's or region, then
  what builds their playstyle, `trainerPlan`); `trainerProg(i)` is where that has got them (region, stage, level, best level, open
  regions, Badges, Champion titles), worked out from the clock, so it goes on while the game is closed. Their points settle where that
  puts them (`trainerTarget`, `ladderDrift`); their teams are built from it (`npcAccount`'s `P`: their starter, their open regions;
  archetypes grow, `ok.grow` in `buildArch`: pre-evolutions stand in, a setter's move stands in for its Ability). `person(i)` is who
  they are now, `personBase(i)` without progress (what `trainerProg` reads). `srvRating`/`srvRatingQ`/`srvLevel` still answer for a
  strength q (the Trainer at that strength now). Save keys are `acctSlot(who)`; `oneServer` gathers saves from the old server list once.
- Features open with the Journey (the owner's rule: never everything at once): `FEATURES`/`featOn` in `a6_state.js` (Explore: every
  area from the first Pokémon on), Shops tabs by `shopOn`, events by `evOpen`. Anything new gets an entry; hide its button, don't count or pay it, and give
  the Demo the same check before it taps (tests set up the Journey progress they need).
- Saves live in `localStorage` under `pokemon_kanto_squad_v1`; `migrate()` in `a10_boot.js` must stay backward compatible.

## Testing
```sh
npm install && npx playwright install chromium
node tests/phone.js      # phone-size playthrough, screenshots in tests/shots/
node tests/figures.js    # every sprite, move, Ability and evolution resolves
node tests/sim.js 24     # auto-vs-auto win rates per Journey stage
node tests/accounts.js   # Trainer Club log-in, sign-up, separate saves
node tests/stadium.js    # Ranked Battles and a Link Battle draft
node tests/social.js     # Union Room, Clubs, a Raid Battle
node tests/music.js      # music per screen and battle, jingles, volume
node tests/slots.js      # the slot machine's odds against play, Fever, the Starter Bonus, the Lottery draw
node tests/demo.js 30    # the Demo, headless, 30 minutes
node tools/viability.js 16  # each archetype's Legend teams against random strong teams: the config's archetype weights
node tools/move_worth_check.js tools/move_worth.json   # the top teams optimized with vs without the move-worth table
```
Check screenshots at 390×844 portrait and 844×390 landscape after visual changes.
