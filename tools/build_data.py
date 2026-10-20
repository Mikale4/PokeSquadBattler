#!/usr/bin/env python3
"""Generate src/a3a_dex.js: the Pokémon of generations 1 to 9 (#1-1025, and the forms with their own stats) with their modern
data, and every move they can learn in any game.

Source: PokeAPI's CSV dump (https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv), downloaded on demand
into tools/.pokeapi/ (gitignored). Run from anywhere:  python3 tools/build_data.py [-v]

What it decides:
  * modern typings (Fairy and Steel included: Clefairy is Fairy, Magnemite Electric/Steel), modern base stats
  * evolutions, simplified (the owner's rule): each one is a level-up or an item. Trades use the Linking Cord, or the item they're
    traded holding (Metal Coat, King's Rock...); friendship uses a Soothe Bell (Eevee: Sun Stone for Espeon, Moon Stone for Umbreon);
    special places use today's stone (Thunder Stone for Magnezone and Probopass, Leaf and Ice Stone for Leafeon and Glaceon);
    a held item at level-up is that item; knowing a move is the level it learns it; gender is dropped (Dawn Stone for Gallade
    and Froslass); Feebas uses a Prism Scale; Nincada becomes Ninjask and leaves a Shedinja; spinning (Alcremie) is its Sweet;
    three critical hits (Sirfetch'd) a Leek; steps, damage taken and the like a level (NO_LEVEL); a region's form evolves into
    that region's form, and a regional evolution is one more choice (Quilava: Typhlosion or Hisuian Typhlosion at Lv 36)
  * forms with their own stats are their own Pokémon (Deoxys, Wormadam, Rotom, the Therians, Kyurem, the Alolan, Galarian,
    Hisuian and Paldean forms, Oricorio, Lycanroc, Necrozma, Zacian and Zamazenta's Crowned, Calyrex's riders, Ogerpon's masks...);
    battle-only forms (Castform's, Zen Mode, Pirouette, Blade Aegislash, Wishiwashi's School, Minior's Core, Complete Zygarde, Ice
    Face's Noice, Hero Palafin, Terastal Terapagos) are kept for their in-battle stats ("bf"). Megas, Primal Reversion, Ultra Burst,
    Gigantamax and Tera aren't in the game: those forms are left out, and so are forms that only change looks
  * abilities: every ability each Pokemon has had in any generation (Gengar: Levitate until Gen 6, Cursed Body since), regular
    or hidden; ABILITY_PICK is the one simulated Trainers' Pokemon use
  * level-up moves from every game, merged (a move learned at different levels takes the newest main-series game's level;
    evolution moves count as Lv 1)
  * TMs, HMs and TRs from every generation, each generation's own numbering ("TM01 (Gen 1)" is Mega Punch, "TM01 (Gen 2)"
    Dynamic Punch); a Pokemon is compatible with one if any game of that generation lets it learn that move by machine
  * modern move data (power, accuracy, type, effects). Moves whose effect the battle engine doesn't model are left out of
    every learnset and TM list (EXCLUDE, and anything in an effect category without a handler in SPECIAL)
  * a slot for every move: S1 light attacks and every 60-power attack (no cooldown), S2 mid-power attacks and every status move, S3 the big attacks
    (slot_class). A Pokémon knows one move per slot: it learns them by level and from TMs (a3b_kits.js).
  * rarity for the Safari Zone (3 to 5 stars); Legendary and Mythical Pokémon are never in its standard areas.
"""
import csv, json, os, subprocess, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
CSV_DIR = os.environ.get("POKEAPI_CSV") or os.path.join(HERE, ".pokeapi")
OUT = os.path.join(HERE, "..", "src", "a3a_dex.js")


def rows(name):
    path = os.path.join(CSV_DIR, name + ".csv")
    if not os.path.exists(path):
        os.makedirs(CSV_DIR, exist_ok=True)
        url = f"https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/{name}.csv"
        subprocess.run(["curl", "-sf", "--retry", "3", "-o", path, url], check=True)
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


TYPE = {r["id"]: r["identifier"] for r in rows("types")}
cap = lambda s: s[0].upper() + s[1:]

# ---------- species and forms: modern typings and base stats ----------
MAXID = 1025   # generations 1 to 9
# forms with their own stats, types, Abilities or moves are their own Pokémon (the owner's choice); battle-only forms are only the
# stats and types a Pokémon takes in battle (Castform in weather, Darmanitan's Zen Mode, Meloetta's Pirouette)
FORMS = """deoxys-attack deoxys-defense deoxys-speed wormadam-sandy wormadam-trash shaymin-sky giratina-origin rotom-heat rotom-wash
rotom-frost rotom-fan rotom-mow tornadus-therian thundurus-therian landorus-therian kyurem-black kyurem-white
pumpkaboo-small pumpkaboo-large pumpkaboo-super gourgeist-small gourgeist-large gourgeist-super hoopa-unbound zygarde-10
rattata-alola raticate-alola raichu-alola sandshrew-alola sandslash-alola vulpix-alola ninetales-alola diglett-alola dugtrio-alola
meowth-alola persian-alola geodude-alola graveler-alola golem-alola grimer-alola muk-alola exeggutor-alola marowak-alola
oricorio-pom-pom oricorio-pau oricorio-sensu lycanroc-midnight lycanroc-dusk necrozma-dusk necrozma-dawn
meowth-galar ponyta-galar rapidash-galar slowpoke-galar slowbro-galar farfetchd-galar weezing-galar mr-mime-galar articuno-galar
zapdos-galar moltres-galar slowking-galar corsola-galar zigzagoon-galar linoone-galar darumaka-galar darmanitan-galar-standard
yamask-galar stunfisk-galar indeedee-female zacian-crowned zamazenta-crowned urshifu-rapid-strike calyrex-ice calyrex-shadow
growlithe-hisui arcanine-hisui voltorb-hisui electrode-hisui typhlosion-hisui qwilfish-hisui sneasel-hisui samurott-hisui
lilligant-hisui zorua-hisui zoroark-hisui braviary-hisui sliggoo-hisui goodra-hisui avalugg-hisui decidueye-hisui dialga-origin
palkia-origin basculegion-female enamorus-therian tauros-paldea-combat-breed tauros-paldea-blaze-breed tauros-paldea-aqua-breed
wooper-paldea oinkologne-female ursaluna-bloodmoon ogerpon-wellspring-mask ogerpon-hearthflame-mask ogerpon-cornerstone-mask
greninja-battle-bond""".split()
BATTLE_FORMS = """castform-sunny castform-rainy castform-snowy darmanitan-zen meloetta-pirouette aegislash-blade wishiwashi-school
minior-red zygarde-complete darmanitan-galar-zen eiscue-noice palafin-hero terapagos-terastal greninja-ash""".split()
# a few form keys made shorter (Showdown's): the rest are the PokeAPI name without dashes (rattataalola, lycanrocmidnight)
KEY_FIX = {"darmanitan-galar-standard": "darmanitangalar", "darmanitan-galar-zen": "darmanitangalarzen", "tauros-paldea-combat-breed": "taurospaldeacombat",
           "tauros-paldea-blaze-breed": "taurospaldeablaze", "tauros-paldea-aqua-breed": "taurospaldeaaqua", "basculegion-female": "basculegionf",
           "indeedee-female": "indeedeef", "oinkologne-female": "oinkolognef", "ogerpon-wellspring-mask": "ogerponwellspring",
           "ogerpon-hearthflame-mask": "ogerponhearthflame", "ogerpon-cornerstone-mask": "ogerponcornerstone", "necrozma-dusk": "necrozmaduskmane",
           "necrozma-dawn": "necrozmadawnwings", "minior-red": "miniorcore", "greninja-battle-bond": "greninjabond"}
species = {int(r["id"]): r for r in rows("pokemon_species") if int(r["id"]) <= MAXID}
names, genus = {}, {}
for r in rows("pokemon_species_names"):
    sid = int(r["pokemon_species_id"])
    if sid <= MAXID and r["local_language_id"] == "9":
        names[sid] = r["name"]
        genus[sid] = r["genus"].replace(" Pokémon", "")
poke = {int(r["id"]): r for r in rows("pokemon") if int(r["id"]) <= MAXID or r["identifier"] in FORMS or r["identifier"] in BATTLE_FORMS}
PIDS = set(poke)
form_name = {}   # pokemon id -> its English name ("Wash Rotom", "Attack Deoxys")
_fid = {r["id"]: r["pokemon_id"] for r in rows("pokemon_forms")}
for r in rows("pokemon_form_names"):
    pid = int(_fid.get(r["pokemon_form_id"], 0) or 0)
    if pid in PIDS and pid > MAXID and r["local_language_id"] == "9" and r["pokemon_name"]:
        form_name[pid] = r["pokemon_name"]
form_name.update({pid: n for pid, n in ((p, {"greninja-ash": "Ash-Greninja"}.get(poke[p]["identifier"])) for p in PIDS if p in poke) if n})   # (the games' name)
types = defaultdict(list)
for r in sorted(rows("pokemon_types"), key=lambda r: int(r["slot"])):
    if int(r["pokemon_id"]) in PIDS:
        types[int(r["pokemon_id"])].append(cap(TYPE[r["type_id"]]))
STAT = {"1": "hp", "2": "atk", "3": "def", "4": "spa", "5": "sdf", "6": "spe"}
base = defaultdict(dict)
for r in rows("pokemon_stats"):
    if int(r["pokemon_id"]) in PIDS:
        base[int(r["pokemon_id"])][STAT[r["stat_id"]]] = int(r["base_stat"])
sid_key = {}
for sid, r in species.items():
    sid_key[sid] = r["identifier"].replace("-", "")  # Showdown ids: mrmime, nidoranf, farfetchd, hooh, porygonz
pid_key = {pid: (sid_key[pid] if pid <= MAXID else KEY_FIX.get(poke[pid]["identifier"], poke[pid]["identifier"].replace("-", ""))) for pid in PIDS}   # rotomwash, deoxysattack
pid_sid = {pid: int(poke[pid]["species_id"]) for pid in PIDS}

# ---------- abilities: every one each Pokemon has had ----------
AB = {r["id"]: r["identifier"] for r in rows("abilities")}
abil = defaultdict(list)   # sid -> [(ability, hidden)]
for r in sorted(rows("pokemon_abilities"), key=lambda r: int(r["slot"])):
    if int(r["pokemon_id"]) in PIDS:
        abil[int(r["pokemon_id"])].append((AB[r["ability_id"]], r["is_hidden"] == "1"))
for r in rows("pokemon_abilities_past"):   # what changed: Gengar's Levitate (to Gen 6), Zapdos's hidden Lightning Rod (Gen 5)
    if int(r["pokemon_id"]) in PIDS and r["ability_id"]:
        a = (AB[r["ability_id"]], r["is_hidden"] == "1")
        if not any(x[0] == a[0] for x in abil[int(r["pokemon_id"])]):
            abil[int(r["pokemon_id"])].append(a)
# abilities with a battle effect in this game (see ABILITY in a3b_kits.js); the rest show "no effect in battle here"
IMPLEMENTED = set("""overgrow blaze torrent swarm static poison-point flame-body effect-spore cute-charm poison-touch stench intimidate
levitate water-absorb volt-absorb dry-skin flash-fire lightning-rod thick-fat insomnia vital-spirit limber immunity own-tempo oblivious
magma-armor water-veil inner-focus clear-body hyper-cutter keen-eye big-pecks sturdy rock-head shed-skin natural-cure hydration guts
compound-eyes shield-dust battle-armor shell-armor swift-swim chlorophyll sand-rush sand-veil snow-cloak rain-dish ice-body solar-power
synchronize download pressure damp liquid-ooze soundproof early-bird pickup technician sheer-force hustle iron-fist reckless no-guard
skill-link serene-grace adaptability magic-guard multiscale marvel-scale filter tinted-lens sniper weak-armor anger-point defiant
competitive steadfast moxie scrappy infiltrator cursed-body friend-guard imposter arena-trap rattled unnerve run-away
aftermath analytic anticipation cloud-nine drought forewarn frisk gluttony harvest healer illuminate justified leaf-guard
mold-breaker neutralizing-gas overcoat quick-feet regenerator sand-force sticky-hold tangled-feet trace unaware unburden wonder-skin
drizzle sand-stream snow-warning air-lock solid-rock white-smoke turboblaze teravolt slush-rush heatproof storm-drain sap-sipper motor-drive
wind-rider huge-power pure-power speed-boost moody bad-dreams prankster super-luck shadow-tag plus minus klutz rough-skin iron-barbs
light-metal heavy-metal contrary simple pickpocket magic-bounce suction-cups poison-heal truant normalize flare-boost toxic-boost mummy
defeatist illusion wonder-guard stall forecast flower-gift zen-mode multitype victory-star slow-start color-change protean sharpness battle-bond telepathy
strong-jaw mega-launcher tough-claws punk-rock pixilate refrigerate galvanize liquid-voice steelworker steely-spirit dragons-maw transistor
rocky-payload water-bubble fairy-aura dark-aura aura-break power-spot battery supreme-overlord stakeout gorilla-tactics merciless
tablets-of-ruin sword-of-ruin vessel-of-ruin beads-of-ruin protosynthesis quark-drive orichalcum-pulse hadron-engine electric-surge
grassy-surge psychic-surge misty-surge seed-sower surge-surfer grass-pelt fur-coat fluffy ice-scales prism-armor shadow-shield
full-metal-body mirror-armor tera-shell comatose purifying-salt thermal-exchange shields-down sweet-veil pastel-veil aroma-veil
flower-veil good-as-gold armor-tail queenly-majesty dazzling bulletproof gooey tangling-hair wandering-spirit lingering-aroma
toxic-debris sand-spit cotton-down electromorphosis wind-power stamina water-compaction steam-engine berserk anger-shell
emergency-exit wimp-out innards-out magician toxic-chain poison-puppeteer beast-boost chilling-neigh grim-neigh as-one-glastrier
as-one-spectrier soul-heart opportunist costar intrepid-sword dauntless-shield screen-cleaner curious-medicine hospitality
supersweet-syrup tera-shift zero-to-hero schooling power-construct stance-change ice-face disguise long-reach unseen-fist
propeller-tail stalwart corrosion triage gale-wings quick-draw guard-dog minds-eye libero well-baked-body earth-eater ripen
cheek-pouch rks-system dancer gulp-missile hunger-switch mimicry mycelium-might""".split())
# abilities that only work in weather or are a weak fit, picked only when nothing better is available
WEAK = set("""swift-swim chlorophyll sand-rush sand-veil snow-cloak rain-dish ice-body solar-power hydration run-away unnerve rattled
slush-rush truant slow-start defeatist klutz normalize stall""".split())
ABILITY_PICK = {  # the classic or best fit: what simulated Trainers' Pokemon have
    "ditto": "imposter", "eevee": "adaptability", "porygon": "download", "gengar": "cursed-body", "dragonite": "multiscale",
    "snorlax": "thick-fat", "machamp": "no-guard", "machoke": "no-guard", "machop": "no-guard", "alakazam": "magic-guard",
    "kadabra": "synchronize", "abra": "synchronize", "gyarados": "intimidate", "tauros": "intimidate", "clefable": "magic-guard",
    "scyther": "technician", "meowth": "pickup", "persian": "technician", "kangaskhan": "scrappy", "pinsir": "moxie",
    "chansey": "serene-grace", "lapras": "water-absorb", "starmie": "natural-cure", "staryu": "natural-cure", "cloyster": "skill-link",
    "shellder": "skill-link", "vileplume": "effect-spore", "parasect": "effect-spore", "paras": "effect-spore", "magikarp": "rattled",
    "mrmime": "filter", "butterfree": "tinted-lens", "venomoth": "tinted-lens", "hitmonchan": "iron-fist", "hitmonlee": "reckless",
    "nidoking": "sheer-force", "nidoqueen": "sheer-force", "slowbro": "regenerator", "slowpoke": "own-tempo", "electrode": "static",
    "voltorb": "static", "marowak": "rock-head", "cubone": "rock-head", "weezing": "levitate", "koffing": "levitate", "arcanine": "intimidate",
    "growlithe": "intimidate", "rhydon": "rock-head", "rhyhorn": "rock-head", "aerodactyl": "rock-head", "magneton": "sturdy",
    "magnemite": "sturdy", "golem": "sturdy", "graveler": "sturdy", "geodude": "sturdy", "onix": "sturdy", "kabutops": "battle-armor",
    "kabuto": "battle-armor", "omastar": "shell-armor", "omanyte": "shell-armor", "pidgeot": "keen-eye", "dodrio": "early-bird",
    "doduo": "early-bird", "ponyta": "flash-fire", "rapidash": "flash-fire", "golduck": "damp", "psyduck": "damp", "seadra": "sniper",
    "horsea": "sniper", "seaking": "lightning-rod", "goldeen": "lightning-rod", "rattata": "guts", "raticate": "guts", "beedrill": "sniper",
    "farfetchd": "inner-focus", "dragonair": "marvel-scale", "dratini": "marvel-scale", "gloom": "stench", "oddish": "run-away",
    "sandshrew": "sand-veil", "sandslash": "sand-veil", "diglett": "arena-trap", "dugtrio": "arena-trap", "tangela": "regenerator",
    "exeggutor": "chlorophyll", "exeggcute": "chlorophyll", "victreebel": "chlorophyll", "weepinbell": "chlorophyll", "bellsprout": "chlorophyll",
    "ninetales": "drought", "vulpix": "flash-fire", "wigglytuff": "competitive", "jigglypuff": "competitive", "zapdos": "static",
}


def pick_ability(sid):
    key = pid_key[sid]
    if key in ABILITY_PICK and any(a == ABILITY_PICK[key] for a, _ in abil[sid]):
        return ABILITY_PICK[key]
    opts = abil[sid]
    for want_hidden in (False, True):
        for a, hidden in opts:
            if hidden == want_hidden and a in IMPLEMENTED and a not in WEAK:
                return a
    for a, hidden in opts:
        if a in IMPLEMENTED:
            return a
    return opts[0][0]


# ---------- evolutions: simplified to a level-up or an item (the owner's rule) ----------
ITEMS_CSV = {r["id"]: r["identifier"].replace("-", "") for r in rows("items")}
EVO_ITEMS = {"moonstone", "firestone", "thunderstone", "waterstone", "leafstone", "sunstone", "shinystone", "duskstone", "dawnstone",
             "icestone", "ovalstone", "kingsrock", "metalcoat", "dragonscale", "upgrade", "dubiousdisc", "protector", "electirizer",
             "magmarizer", "reapercloth", "deepseatooth", "deepseascale", "prismscale", "razorclaw", "razorfang", "soothebell", "linkcord",
             # generations 6 to 9
             "sachet", "whippeddream", "strawberrysweet", "tartapple", "sweetapple", "syrupyapple", "crackedpot", "unremarkableteacup",
             "galaricacuff", "galaricawreath", "leek", "scrollofdarkness", "scrollofwaters", "blackaugurite", "peatblock", "auspiciousarmor",
             "maliciousarmor", "leaderscrest", "metalalloy", "gimmighoulcoin"}
# one item stands for several: any Sweet (Alcremie's flavours only change its looks), the Cracked or Chipped Pot, either Teacup
ITEM_SAME = {"lovesweet": "strawberrysweet", "berrysweet": "strawberrysweet", "cloversweet": "strawberrysweet", "flowersweet": "strawberrysweet",
             "starsweet": "strawberrysweet", "ribbonsweet": "strawberrysweet", "chippedpot": "crackedpot", "masterpieceteacup": "unremarkableteacup"}
PLACE_STONE = {"magnezone": "thunderstone", "probopass": "thunderstone", "leafeon": "leafstone", "glaceon": "icestone"}
TIME_STONE = {"espeon": "sunstone", "umbreon": "moonstone"}
# an evolution with no level of its own: Mantyke (with a Remoraid in the party, in the games), Yamask's Galarian form (49 damage
# taken, then under a stone arch), Basculin (294 recoil damage), Stantler (Psyshield Bash in the agile style), the walkers (1,000
# steps with Let's Go: Pawmo, Bramblin, Rellor), Gimmighoul (999 coins: here, a Gimmighoul Coin)
NO_LEVEL = {"mantine": 20, "runerigus": 34, "basculegion": 36, "basculegionf": 36, "wyrdeer": 31, "pawmot": 32, "brambleghast": 30, "rabsca": 30,
            "melmetal": 40}   # (Melmetal: 400 Meltan Candy in Pokémon GO)
NO_LEVEL_ITEM = {"gholdengo": "gimmighoulcoin"}
# where the newest game's level for that move is 1 (a Move Reminder move): the level it took in its own game (Poipole's Dragon Pulse in USUM)
LEVEL_FIX = {"naganadel": 40}
# the level a Pokémon learns a move at by level-up (its newest game), for "knows the move" evolutions
_lv_of = {}
for r in rows("pokemon_moves"):
    if r["pokemon_move_method_id"] == "1" and int(r["pokemon_id"]) <= MAXID:
        k = (int(r["pokemon_id"]), int(r["move_id"])); lv = max(1, int(r["level"] or 1))
        if k not in _lv_of or int(r["version_group_id"]) > _lv_of[k][1]:
            _lv_of[k] = (lv, int(r["version_group_id"]))
evos = defaultdict(list)   # Pokémon id (forms too) -> [{to, lv | item}]
prev = {}                  # Pokémon id -> the key of what it evolves from
form_pid = {r["id"]: int(r["pokemon_id"]) for r in rows("pokemon_forms")}
pid_of_ident = {r["identifier"]: int(r["id"]) for r in rows("pokemon")}
REGION = {"7": "alola", "8": "galar", "9": "hisui", "10": "paldea"}
def evo_from(r, frm):   # the form that evolves (Alolan Vulpix), else the species
    p = form_pid.get(r["required_pokemon_form_id"] or "")
    return p if p in PIDS else frm
def evo_to(r, to):      # the form it becomes (Alolan Ninetales; a regional evolution: Hisuian Typhlosion), else the species
    p = form_pid.get(r["evolved_pokemon_form_id"] or "")
    if p in PIDS:
        return p
    p = pid_of_ident.get(species[to]["identifier"] + "-" + REGION.get(r["region_id"] or "", "-"))
    return p if p in PIDS else to
for r in rows("pokemon_evolution"):
    to = int(r["evolved_species_id"])
    if to > MAXID:
        continue
    frm = int(species[to]["evolves_from_species_id"] or 0)
    if not frm or frm > MAXID:
        continue
    fp, tp = evo_from(r, frm), evo_to(r, to)
    trig, tk = r["evolution_trigger_id"], pid_key[tp]
    item = lambda i: ITEM_SAME.get(ITEMS_CSV.get(i or "", ""), ITEMS_CSV.get(i or "", ""))
    e = {"to": tk}
    if tk in PLACE_STONE: e["item"] = PLACE_STONE[tk]
    elif tk in TIME_STONE: e["item"] = TIME_STONE[tk]
    elif tk in NO_LEVEL_ITEM: e["item"] = NO_LEVEL_ITEM[tk]
    elif trig == "3": e["item"] = item(r["trigger_item_id"])                              # an evolution stone (any gender)
    elif trig == "2": e["item"] = item(r["held_item_id"]) or "linkcord"                     # a trade: its held item, or the Linking Cord
    elif trig in ("4", "6", "7"): continue                                                  # (Shedinja: left by Nincada, below; Kubfu's towers have rows of their own)
    elif r["used_move_id"]: e["lv"] = _lv_of.get((frm, int(r["used_move_id"])), (30,))[0]  # a move used 20 times (Annihilape, Overqwil): the level it learns it
    elif trig == "5": e["item"] = item(r["held_item_id"])                                   # Milcery: spun around holding a Sweet
    elif trig == "8": e["item"] = "leek"                                                    # Galarian Farfetch'd: three critical hits
    elif trig == "15": e["item"] = "leaderscrest"                                           # Bisharp: beat three Bisharp holding Leader's Crests
    elif r["held_item_id"]: e["item"] = item(r["held_item_id"])                             # Happiny, Gligar, Sneasel
    elif r["minimum_beauty"]: e["item"] = "prismscale"                                      # Feebas
    elif r["minimum_happiness"] or r["minimum_affection"]: e["item"] = "soothebell"         # friendship (Sylveon: affection)
    elif r["known_move_id"]: e["lv"] = LEVEL_FIX.get(tk) or _lv_of.get((frm, int(r["known_move_id"])), (30,))[0]   # the level it learns that move
    elif r["minimum_level"]: e["lv"] = int(r["minimum_level"])                              # (gender, time, weather and stats dropped)
    elif tk in NO_LEVEL: e["lv"] = NO_LEVEL[tk]
    else:
        print("evolution not handled:", pid_key[fp], "->", tk, "trigger", trig); continue
    if e.get("item") is not None and e["item"] not in EVO_ITEMS:
        print("evolution item not handled:", pid_key[fp], "->", tk, e["item"]); continue
    if not any(x["to"] == e["to"] for x in evos[fp]):
        evos[fp].append(e)
        prev.setdefault(tp, pid_key[fp])
# Burmy's female evolution is Wormadam in one of three cloaks: each its own Pokémon, the same level (you pick)
if 412 in evos:
    for x in list(evos[412]):
        if x["to"] == "wormadam":
            for f in ("wormadamsandy", "wormadamtrash"):
                if not any(y["to"] == f for y in evos[412]): evos[412].append({"to": f, "lv": x["lv"]})
                prev[next(p for p in PIDS if pid_key[p] == f)] = "burmy"
# the same for Pumpkaboo's sizes: each becomes the Gourgeist of its size (by Linking Cord, like a trade)
for size in ("small", "large", "super"):
    a, b = pid_of_ident["pumpkaboo-" + size], pid_of_ident["gourgeist-" + size]
    if a in PIDS and b in PIDS and not evos.get(a):
        evos[a].append({"to": pid_key[b], "item": "linkcord"}); prev[b] = pid_key[a]
# Nincada becomes Ninjask and leaves a Shedinja behind
for x in evos.get(290, []):
    if x["to"] == "ninjask":
        x["bonus"] = "shedinja"
prev[292] = "nincada"

# ---------- moves ----------
MV = {int(r["id"]): r for r in rows("moves")}
mname = {int(r["move_id"]): r["name"] for r in rows("move_names") if r["local_language_id"] == "9"}
meta = {int(r["move_id"]): r for r in rows("move_meta")}
MCAT = {r["id"]: r["identifier"] for r in rows("move_meta_categories")}
stch = defaultdict(list)
for r in rows("move_meta_stat_changes"):
    stch[int(r["move_id"])].append((int(r["stat_id"]), int(r["change"])))
flags = defaultdict(set)
FLAG = {"1": "contact", "8": "punch", "9": "sound", "13": "heal", "15": "powder", "16": "bite"}
for r in rows("move_flag_map"):
    if r["move_flag_id"] in FLAG:
        flags[int(r["move_id"])].add(FLAG[r["move_flag_id"]])
ST = {1: "hp", 2: "atk", 3: "def", 4: "spa", 5: "sdf", 6: "spe", 7: "acc", 8: "eva"}
AIL = {"1": "PAR", "2": "SLP", "3": "FRZ", "4": "BRN", "5": "PSN", "6": "CNF", "7": "INFAT", "8": "TRAP", "13": "DISABLE", "18": "SEED"}
# Moves handled by name in the engine (a7_engine.js useMove / attackOnce / damageOf): identifier -> handler. Moves in an
# effect category the engine can't read generically (unique, field and whole-field effects, force-switch) need an entry here.
SPECIAL = {k: k.replace("-", "") for k in """transform metronome splash haze rest reflect light-screen substitute mist focus-energy dream-eater
pay-day super-fang dragon-rage sonic-boom night-shade seismic-toss psywave fissure horn-drill guillotine sheer-cold self-destruct explosion
hyper-beam roar whirlwind toxic disable recover soft-boiled leech-seed protect detect endure safeguard rain-dance sunny-day sandstorm hail
belly-drum psych-up refresh aromatherapy facade focus-punch revenge brick-break knock-off rapid-spin false-swipe endeavor
gyro-ball electro-ball wring-out hard-press hex venoshock brine acrobatics wake-up-slap assurance payback retaliate lash-out stored-power
punishment weather-ball rage-fist foul-play body-press feint incinerate final-gambit counter mirror-coat synchronoise freeze-dry steel-beam
burn-up expanding-force grassy-glide burning-jealousy poltergeist clear-smog teleport baton-pass spikes toxic-spikes stealth-rock defog
roost wish aqua-ring ingrain life-dew heal-pulse pain-split healing-wish memento tailwind aurora-veil lucky-chant trick-room snowscape yawn
curse taunt gastro-acid worry-seed soak reflect-type conversion camouflage magnet-rise destiny-bond laser-focus acupressure power-swap
guard-swap speed-swap role-play skill-swap helping-hand mirror-move copycat sleep-talk nature-power venom-drench rototiller magnetic-flux
flower-shield dragon-cheer misty-explosion triple-axel""".split()}
SPECIAL.update({"giga-impact": "hyperbeam", "blast-burn": "hyperbeam", "hydro-cannon": "hyperbeam", "frenzy-plant": "hyperbeam", "rock-wrecker": "hyperbeam",
    "heal-bell": "aromatherapy", "avalanche": "revenge", "psychic-fangs": "brickbreak", "raging-bull": "brickbreak", "low-kick": "weight",
    "grass-knot": "weight", "heavy-slam": "heavy", "heat-crash": "heavy", "flail": "flail", "reversal": "flail", "stomping-tantrum": "tantrum",
    "temper-flare": "tantrum", "power-trip": "storedpower", "psyshock": "psyshock", "psystrike": "psyshock", "chip-away": "chipaway",
    "darkest-lariat": "chipaway", "storm-throw": "alwayscrit", "frost-breath": "alwayscrit", "surging-strikes": "alwayscrit", "wicked-blow": "alwayscrit", "thief": "thief", "covet": "thief",
    "pluck": "pluck", "bug-bite": "pluck", "u-turn": "uturn", "volt-switch": "uturn", "flip-turn": "uturn", "dragon-tail": "dragontail",
    "circle-throw": "dragontail", "fake-out": "fakeout", "first-impression": "fakeout", "synthesis": "synthesis", "moonlight": "synthesis",
    "morning-sun": "synthesis", "electric-terrain": "terrain", "grassy-terrain": "terrain", "misty-terrain": "terrain", "psychic-terrain": "terrain",
    "mean-look": "meanlook", "block": "meanlook", "lock-on": "lockon", "mind-reader": "lockon", "trick": "trick", "switcheroo": "trick",
    "follow-me": "followme", "rage-powder": "followme",
    # the owner's rules for these (README, House rules): Solar Beam and Solar Blade hit at once (x1.5 in harsh sunlight, x0.5 in rain,
    # sandstorm, hail and snow); Fly, Bounce, Dig, Dive and Phantom Force take the user out of reach until its next turn, when they land;
    # Rollout, Fury Cutter, Echoed Voice and Round double in power with every use; Uproar keeps everyone awake for 3 rounds
    "solar-beam": "solar", "solar-blade": "solar", "fly": "semi", "bounce": "semi", "dig": "semi", "dive": "semi", "phantom-force": "semi",
    "rollout": "ramp", "fury-cutter": "ramp", "echoed-voice": "ramp", "round": "ramp", "uproar": "uproar", "pursuit": "pursuit",
    "magnitude": "magnitude", "tri-attack": "triattack", "throat-chop": "throatchop", "psychic-noise": "psychicnoise", "secret-power": "secretpower",
    "fell-stinger": "fellstinger", "ice-spinner": "icespinner", "flame-burst": "flameburst", "smack-down": "smackdown", "snore": "snore",
    "charge": "charge", "defense-curl": "defensecurl", "minimize": "minimize", "growth": "growth", "pollen-puff": "pollenpuff",
    # generations 2 to 5: Crush Grip like Wring Out, Eruption and Water Spout by the user's HP, Metal Burst like Counter (x1.5),
    # Present (random power, or a heal), Triple Kick (10, 20, 30), Ice Ball doubling like Rollout, the Fusions (double after each
    # other), Shadow Force like Phantom Force, Roar of Time like Hyper Beam, Sacred Sword ignoring stat changes like Chip Away, Secret
    # Sword hitting Defense like Psyshock, Smelling Salts (double on paralysis, and cures it), Heal Block, Strength Sap, Parting Shot,
    # Hidden Power (the owner's rule: the user's first type) and Sketch (S1, S2 and S3 Sketch, below: SKETCH_SLOTS)
    "crush-grip": "wringout", "eruption": "eruption", "water-spout": "eruption", "metal-burst": "metalburst", "present": "present",
    "triple-kick": "tripleaxel", "ice-ball": "ramp", "fusion-flare": "fusion", "fusion-bolt": "fusion", "shadow-force": "semi",
    "roar-of-time": "hyperbeam", "sacred-sword": "chipaway", "secret-sword": "psyshock", "smelling-salts": "smellingsalts",
    "heal-block": "healblock", "strength-sap": "strengthsap", "parting-shot": "partingshot", "hidden-power": "hiddenpower", "sketch": "sketch",
    # generations 6 to 9: the protecting moves (Spiky Shield, King's Shield, Baneful Bunker, Obstruct, Silk Trap, Burning Bulwark) as
    # Protect; Chloroblast like Steel Beam; Double Shock like Burn Up (the user loses its Electric type); Ruination like Super Fang;
    # Comeuppance like Metal Burst; Hyper Drill and Mighty Cleave through Protect like Feint; Flower Trick always a critical hit;
    # Infernal Parade and Barb Barrage double like Hex and Venoshock; Mortal Spin frees the user like Rapid Spin; Jungle Healing and
    # Lunar Blessing like Life Dew. Their own rules: Ceaseless Edge and Stone Axe leave Spikes and Stealth Rock; Collision Course and
    # Electro Drift a third stronger when super effective; Dire Claw (poison, paralysis or sleep); Glaive Rush (the user takes double
    # damage until its next turn); Hydro Steam (stronger in harsh sunlight, not weaker); Ivy Cudgel (Ogerpon's mask's type); Last
    # Respects (+50 for each fainted teammate); Psyblade (50% stronger in Electric Terrain); Salt Cure (1/8 HP a turn, 1/4 for
    # Water and Steel types); Fickle Beam (30%: double power); Fillet Away; Shed Tail
    "spiky-shield": "protect", "kings-shield": "protect", "baneful-bunker": "protect", "obstruct": "protect", "silk-trap": "protect",
    "burning-bulwark": "protect", "chloroblast": "steelbeam", "double-shock": "burnup", "ruination": "superfang", "comeuppance": "metalburst",
    "hyper-drill": "feint", "mighty-cleave": "feint", "flower-trick": "alwayscrit", "infernal-parade": "hex", "barb-barrage": "venoshock",
    "mortal-spin": "rapidspin", "jungle-healing": "lifedew", "lunar-blessing": "lifedew", "ceaseless-edge": "hazardhit", "stone-axe": "hazardhit",
    "collision-course": "collision", "electro-drift": "collision", "dire-claw": "direclaw", "glaive-rush": "glaiverush", "hydro-steam": "hydrosteam",
    "ivy-cudgel": "ivycudgel", "last-respects": "lastrespects", "psyblade": "psyblade", "salt-cure": "saltcure", "fickle-beam": "fickle",
    "fillet-away": "filletaway", "shed-tail": "shedtail", "sticky-web": "stickyweb",
    # every move that was left out, each with a rule of its own (README: House rules), and a few that share one
    "odor-sleuth": "foresight", "forests-curse": "addtype", "trick-or-treat": "addtype", "magic-powder": "soak", "spider-web": "meanlook",
    "lunar-dance": "healingwish", "future-sight": "future", "doom-desire": "future"})
SPECIAL.update({k: k.replace("-", "") for k in """after-you ally-switch assist bestow conversion-2 court-change crafty-shield doodle electrify embargo encore entrainment fairy-lock foresight miracle-eye gravity grudge guard-split power-split heart-swap imprison instruct ion-deluge magic-coat magic-room wonder-room mimic mud-sport water-sport nightmare octolock perish-song powder power-trick psycho-shift purify quash recycle revival-blessing simple-beam snatch spite spotlight stockpile swallow spit-up telekinesis topsy-turvy torment teatime mat-block quick-guard wide-guard me-first belch natural-gift fling last-resort trump-card bide sky-drop tera-blast upper-hand""".split()})
# moves left out: effects the engine doesn't model (and Tera Blast, which needs Terastallization)
EXCLUDE = set()   # (every move has a rule now; Tera Blast is a Normal-type move here, physical when the user's Attack is higher)
# variable power, fixed here: Magnitude's average, Return and Frustration at their best
FIXED_POWER = {"magnitude": 70, "return": 102, "frustration": 102}
# house rule (the owner's): Rage works like Rage Fist: +50 for every hit the user has taken (up to 350); from 50 power, as do Punishment
# and Stored Power, which work exactly like Rage Fist too (the owner's rule, 2026-10-16: META_FIX), all S2 moves
SPECIAL["rage"] = "ragefist"
SPECIAL["punishment"] = "ragefist"
SPECIAL["stored-power"] = "ragefist"
# house rule (the owner's): Whirlwind is a 60-power attack (special: it's a wind; Normal type, never misses, moves last, an S1 move)
# that still blows the target away
# Gen 8 and 9 moves PokeAPI has no effect data for
# the one-hit KO moves (the owner's rule, 2026-10-16): Fissure, Horn Drill, Guillotine and Sheer Cold do what Super Fang and Ruination
# do, half the target's current HP, at 90% accuracy (META_FIX); Nature's Madness, which had no rule, the same, as in the games
SPECIAL.update({"fissure": "superfang", "horn-drill": "superfang", "guillotine": "superfang", "sheer-cold": "superfang", "natures-madness": "superfang"})
META_FIX = {
    "fissure": {"a": 90}, "horn-drill": {"a": 90}, "guillotine": {"a": 90}, "sheer-cold": {"a": 90},
    # Beat Up (the owner's rule, 2026-10-16): an ordinary 2-5-strike move, 25 power a strike and S2 like the others
    "beat-up": {"hit": [2, 5], "p": 25},
    # the owner's rules, 2026-10-16: Triple Kick from 20 (20, 40 and 60, as Triple Axel: above), Rage, Punishment and Stored Power 50
    "rage": {"p": 50}, "punishment": {"p": 50}, "stored-power": {"p": 50},
    "wave-crash": {"dr": -33}, "axe-kick": {"ail": "CNF", "ac": 30, "crash": 1}, "supercell-slam": {"crash": 1},
    "pounce": {"st": [["spe", -1]], "sc": 100, "sw": "target"}, "trailblaze": {"st": [["spe", 1]], "sc": 100, "sw": "self"},
    "chilling-water": {"st": [["atk", -1]], "sc": 100, "sw": "target"}, "alluring-voice": {"ail": "CNF", "ac": 100}, "psychic-noise": {}, "ice-spinner": {},
    "rage-fist": {}, "hard-press": {}, "temper-flare": {}, "raging-bull": {}, "snowscape": {}, "dragon-cheer": {"tg": "team"},
    "triple-axel": {"p": 20, "hit": [3, 3]}, "triple-kick": {"p": 20, "hit": [3, 3]}, "hidden-power": {"p": 60}, "present": {"p": 65},
    "metal-burst": {"p": 1}, "scale-shot": {"st": [["spe", 1], ["def", -1]], "sc": 100, "sw": "self"},
    # the owner's rules (2026-10-10): a cooldown already stops spamming, so some drawbacks go or soften
    "focus-punch": {"a": 70}, "head-smash": {"dr": -33}, "last-resort": {"p": 70}, "beak-blast": {"ail": "BRN", "ac": 100},
    "heal-pulse": {"tg": "partners"}, "helping-hand": {"tg": "ally"}, "acupressure": {"tg": "self"}, "floral-healing": {"tg": "ally"},
    "whirlwind": {"p": 60, "c": "S", "a": 0},
    # the owner's rules: Poison Fang badly poisons; Skull Bash and Meteor Beam hit at once, raising the user's stat before the damage
    "poison-fang": {"ail": "TOX", "ac": 50},
    "skull-bash": {"st": [["def", 1]], "sc": 100, "sw": "self", "pre": 1}, "meteor-beam": {"st": [["spa", 1]], "sc": 100, "sw": "self", "pre": 1},
    # generations 6 to 9, by what they do (PokeAPI files many of them as "unique")
    "aqua-cutter": {"cr": 1}, "aqua-step": {"st": [["spe", 1]], "sc": 100, "sw": "self"}, "armor-cannon": {"st": [["def", -1], ["sdf", -1]], "sc": 100, "sw": "self"},
    "bitter-blade": {"dr": 50}, "bitter-malice": {"st": [["atk", -1]], "sc": 100, "sw": "target"},
    "bleakwind-storm": {"st": [["spe", -1]], "sc": 30, "sw": "target"}, "wildbolt-storm": {"ail": "PAR", "ac": 20}, "sandsear-storm": {"ail": "BRN", "ac": 20},
    "springtide-storm": {"st": [["atk", -1]], "sc": 30, "sw": "target"}, "blood-moon": {}, "ceaseless-edge": {"cr": 1}, "stone-axe": {"cr": 1},
    "dire-claw": {"cr": 1}, "electro-shot": {"st": [["spa", 1]], "sc": 100, "sw": "self", "pre": 1},
    "esper-wing": {"cr": 1, "st": [["spe", 1]], "sc": 100, "sw": "self"}, "gigaton-hammer": {}, "headlong-rush": {"st": [["def", -1], ["sdf", -1]], "sc": 100, "sw": "self"},
    "infernal-parade": {"ail": "BRN", "ac": 30}, "ivy-cudgel": {"cr": 1}, "jet-punch": {}, "kowtow-cleave": {}, "lumina-crash": {"st": [["sdf", -2]], "sc": 100, "sw": "target"},
    "make-it-rain": {"st": [["spa", -1]], "sc": 100, "sw": "self"}, "malignant-chain": {"ail": "TOX", "ac": 100}, "matcha-gotcha": {"dr": 50, "ail": "BRN", "ac": 20},
    "mortal-spin": {"ail": "PSN", "ac": 100}, "barb-barrage": {"ail": "PSN", "ac": 50}, "mountain-gale": {"fl": 30}, "mystical-power": {"st": [["spa", 1]], "sc": 100, "sw": "self"},
    "order-up": {}, "population-bomb": {"hit": [2, 5]}, "psyshield-bash": {"st": [["def", 1]], "sc": 100, "sw": "self"}, "raging-fury": {},
    "shelter": {"st": [["def", 2]], "sc": 100, "sw": "self"}, "spicy-extract": {"st": [["atk", 2], ["def", -2]], "sc": 100, "sw": "target"},
    "spin-out": {"st": [["spe", -2]], "sc": 100, "sw": "self"}, "tachyon-cutter": {"hit": [2, 2]}, "take-heart": {"st": [["spa", 1], ["sdf", 1]], "sc": 100, "sw": "self"},
    "tera-starstorm": {}, "thunderclap": {}, "tidy-up": {"st": [["atk", 1], ["spe", 1]], "sc": 100, "sw": "self"}, "torch-song": {"st": [["spa", 1]], "sc": 100, "sw": "self"},
    "triple-arrows": {"cr": 1, "fl": 30, "st": [["def", -1]], "sc": 50, "sw": "target"}, "triple-dive": {"hit": [3, 3]}, "twin-beam": {"hit": [2, 2]},
    "victory-dance": {"st": [["atk", 1], ["def", 1], ["spe", 1]], "sc": 100, "sw": "self"}, "fickle-beam": {}, "last-respects": {}, "salt-cure": {},
    "psyblade": {}, "hydro-steam": {}, "glaive-rush": {}, "collision-course": {}, "electro-drift": {}, "fillet-away": {}, "shed-tail": {},
    "after-you": {"tg": "ally"}, "instruct": {"tg": "ally"}, "purify": {"tg": "ally"}, "ally-switch": {"tg": "self"}, "bide": {"c": "P", "p": 0},
    # the owner's rules: Future Sight and Doom Desire strike the whole other side on the field; Perish Song the user and its target;
    # Upper Hand (100% flinch) strikes by itself before an opposing priority move, like Pursuit
    "future-sight": {"tg": "foes"}, "doom-desire": {"tg": "foes"}, "perish-song": {"tg": "one"}, "upper-hand": {"fl": 100},
    "wicked-blow": {"p": 80},   # (the owner's rule: Generation 8's power)
}
# the owner's rules (2026-10-15), merged over the fixes above (None takes a key away):
# self-lowering moves lose their drop (Scale Shot keeps its Speed +1); every recoil move takes 25% of the damage dealt; Self-Destruct
# and Misty Explosion have 250 power; Mind Blown costs HP like Steel Beam and Chloroblast (a quarter of the user's max HP);
# Eerie Spell disables the target; and the moves with an effect of their own in a7_engine.js get its tag
_NO_DROP = {"st": None, "sc": None, "sw": None}
for _k, _v in {
    **{k: _NO_DROP for k in ("v-create", "psycho-boost", "draco-meteor", "overheat", "leaf-storm", "fleur-cannon", "armor-cannon", "close-combat",
                             "dragon-ascent", "headlong-rush", "hammer-arm", "ice-hammer", "hyperspace-fury", "make-it-rain", "spin-out",
                             "superpower", "clanging-scales")},
    "scale-shot": {"st": [["spe", 1]]},
    **{k: {"dr": -25} for k in ("double-edge", "brave-bird", "flare-blitz", "wood-hammer", "wave-crash", "head-smash", "light-of-ruin")},
    "self-destruct": {"p": 250}, "misty-explosion": {"p": 250}, "mind-blown": {"sp": "steelbeam"}, "eerie-spell": {"ail": "DISABLE", "ac": 100},
    "shell-trap": {"sp": "shelltrap"}, "spectral-thief": {"sp": "spectralthief"}, "thousand-arrows": {"sp": "thousandarrows"},
    "thousand-waves": {"sp": "anchor"}, "anchor-shot": {"sp": "anchor"}, "spirit-shackle": {"sp": "anchor"},
    "bolt-beak": {"sp": "boltbeak"}, "fishious-rend": {"sp": "boltbeak"}, "core-enforcer": {"sp": "coreenforcer"}, "flying-press": {"sp": "flyingpress"},
}.items():
    META_FIX[_k] = {**META_FIX.get(_k, {}), **_v}
TARGET = {"7": "self", "10": "one", "11": "foes", "9": "foes", "8": "one", "13": "team", "4": "team", "3": "ally", "5": "self",
          "6": "foes", "12": "field", "14": "field", "2": "one", "1": "one", "15": "team", "16": "one"}
GENERIC_CATS = {"damage", "damage-ailment", "damage-lower", "damage-raise", "damage-heal", "ohko", "ailment", "net-good-stats", "heal", "swagger"}


def move_entry(mid):
    r, m = MV[mid], meta.get(mid, {})
    ident = r["identifier"]
    key = ident.replace("-", "")
    t = cap(TYPE[r["type_id"]]) if r["type_id"] in TYPE and int(r["type_id"]) <= 18 else "???"
    p = FIXED_POWER.get(ident) or int(r["power"] or 0)
    e = {"n": mname[mid], "t": t, "c": {"1": "X", "2": "P", "3": "S"}[r["damage_class_id"]], "p": p,
         "a": int(r["accuracy"] or 0), "pp": int(r["pp"] or 0)}
    if int(r["priority"] or 0):
        e["pri"] = int(r["priority"])
    tg = TARGET.get(r["target_id"], "one")
    if tg != "one":
        e["tg"] = tg
    if m:
        cat = MCAT.get(m["meta_category_id"], "")
        if m.get("min_hits"):
            e["hit"] = [int(m["min_hits"]), int(m["max_hits"])]
        ail = AIL.get(m["meta_ailment_id"])
        if ail:
            e["ail"] = ail
            e["ac"] = int(m["ailment_chance"] or 0) or 100
        if ident == "toxic":
            e["ail"] = "TOX"
        if int(m["flinch_chance"] or 0):
            e["fl"] = int(m["flinch_chance"])
        if int(m["crit_rate"] or 0):
            e["cr"] = int(m["crit_rate"])
        if int(m["drain"] or 0):
            e["dr"] = int(m["drain"])
        if int(m["healing"] or 0):
            e["hl"] = int(m["healing"])
        if stch.get(mid):
            e["st"] = [[ST[s], c] for s, c in stch[mid]]
            e["sc"] = int(m["stat_chance"] or 0) or 100
            # who the stat change applies to: status moves follow their target; damaging moves lower the target, or change the
            # user's own stats (category "damage-raise": Steel Wing up, and Overheat or Superpower down)
            if e["c"] == "X":
                e["sw"] = "self" if tg in ("self", "team") else "foes" if tg == "foes" else "target"
            else:
                e["sw"] = "self" if cat == "damage-raise" or all(c > 0 for _, c in stch[mid]) else "target"
    fix = META_FIX.get(ident)
    if fix:
        e.update(fix)
        for k in [k for k, v in e.items() if v is None]:
            del e[k]
    fl = flags.get(mid, set())
    for f, k in (("contact", "ct"), ("punch", "pu"), ("sound", "so"), ("powder", "pw"), ("heal", "hf"), ("bite", "bi")):
        if f in fl:
            e[k] = 1
    if ident in ("jump-kick", "high-jump-kick"):
        e["crash"] = 1
    if ident in SPECIAL:
        e["sp"] = SPECIAL[ident]
    # house rule (the owner's): every multi-strike move (2 to 5 strikes) has 25 power a strike, every double strike 50
    if e.get("hit") and e["p"] and e["c"] != "X":
        if e["hit"][0] != e["hit"][1]:
            e["p"] = 25
        elif e["hit"] == [2, 2]:
            e["p"] = 50
    e["s"] = slot_class(e.get("sp") or key, e)
    return key, e


def supported(mid):
    """Can the engine run this move? Generic effects always; the rest only with a handler."""
    r, ident = MV[mid], MV[mid]["identifier"]
    if ident in EXCLUDE or mid not in mname:
        return False
    if ident in SPECIAL or ident in META_FIX:
        return True
    cat = MCAT.get(meta.get(mid, {}).get("meta_category_id"), "")
    if cat == "unique" and stch.get(mid):   # stat moves PokeAPI files as "unique" (Shell Smash, Coaching)
        return True
    return cat in GENERIC_CATS


# ---------- which slot a move goes in (S1, S2 or S3) ----------
# S1 has no cooldown, so it holds the light attacks; S3 has the longest cooldown and holds the big ones; S2 is everything between and
# every status move. By the move's power (expected power for multi-strike moves and inaccurate ones):
#   S1: up to 55 expected and 60 raw power, and every single-strike 60-power attack (the owner's rule, 2026-10-16: Wing Attack, Bite,
#       Aerial Ace...; Round stays S2 with the doubling moves), plus Sonic Boom; and Splash and Transform (all Magikarp and Ditto can do)
#   S3: 90 raw power or more, one-hit KOs, Self-Destruct and Explosion, Hyper Beam, Focus Punch, Super Fang, Endeavor, Final Gambit
#   S2: the rest, the fixed- and variable-damage moves (Dragon Rage, Night Shade, Low Kick, Gyro Ball, Flail...) and every status move
SLOT_FIX = {"splash": 1, "transform": 3, "sonicboom": 1, "dragonrage": 2, "nightshade": 2, "seismictoss": 2, "psywave": 2,
            "superfang": 3, "endeavor": 3, "focuspunch": 3, "hyperbeam": 3, "selfdestruct": 3, "explosion": 3, "mistyexplosion": 3,
            "fissure": 3, "horndrill": 3, "guillotine": 3, "sheercold": 3, "finalgambit": 3, "struggle": 1, "weight": 2, "heavy": 2,
            "gyroball": 2, "electroball": 2, "flail": 2, "wringout": 2, "hardpress": 2, "counter": 2, "mirrorcoat": 2,
            "ragefist": 2, "revenge": 2, "assurance": 2, "venoshock": 2, "hex": 2, "fakeout": 2, "tripleaxel": 2, "whirlwind": 1, "pursuit": 2, "metalburst": 2, "present": 2,
            "eruption": 3, "hiddenpower": 1, "sketch": 2, "lastrespects": 2, "filletaway": 2, "shedtail": 2,
            "bide": 2, "spitup": 3, "naturalgift": 2, "fling": 2, "trumpcard": 2, "beatup": 2, "future": 3, "conversion": 2, "conversion2": 3,
            "ramp": 2}   # (the doubling moves: Rollout, Fury Cutter, Echoed Voice, Round; slots are looked up by a move's special rule first)
# (Fake Out is a house rule: it works on any turn, not just the first, so it's an S2 move with a cooldown; so is Pursuit, which strikes
# by itself whenever the other side switches a Pokémon out. The owner's rules: the moves like Rage Fist (Rage, Punishment, Stored
# Power) are S2, and the doubling moves Rollout, Fury Cutter, Echoed Voice and Round, which double every time they're used, are S2;
# and the 60-power moves that double in their moment (Revenge, Avalanche, Assurance, Barb Barrage, Infernal Parade) stay S2, with
# Venoshock and Hex, which double the same way: the owner's picks, 2026-10-16)


def slot_class(key, e):
    s = slot_class0(key, e)
    # (the owner's rule, 2026-10-19: a flinch makes the target lose its next turn, so no S1 move flinches: Astonish, Bite, Heart
    # Stamp, Needle Arm, Rolling Kick, Snore and Twister are S2)
    return 2 if s == 1 and e.get("fl") else s


def slot_class0(key, e):
    if key in SLOT_FIX:
        return SLOT_FIX[key]
    if e["c"] == "X":
        return 2
    hits = 3 if e.get("hit") and e["hit"][0] != e["hit"][1] else (e["hit"][0] if e.get("hit") else 1)
    expected = e["p"] * hits * (e["a"] or 100) / 100
    if e["p"] >= 90:
        return 3
    if expected <= 55 and e["p"] * hits <= 60 or e["p"] == 60 and hits == 1:
        return 1
    return 2


# ---------- learnsets: every game ----------
VGEN = {r["id"]: int(r["generation_id"]) for r in rows("version_groups")}
VGNAME = {r["id"]: r["identifier"] for r in rows("version_groups")}
# which game's level counts when the games disagree: the newest main-series game first, side games and spin-offs last
SIDE = {"colosseum", "xd", "red-green-japan", "blue-japan", "legends-arceus", "legends-za", "mega-dimension", "champions",
        "lets-go-pikachu-lets-go-eevee", "brilliant-diamond-shining-pearl"}
vg_rank = lambda vg: (0 if VGNAME[vg] in SIDE else 1, VGEN[vg], int(vg))
# each generation's TM list: its main games' numbering; a Pokemon is compatible if any game of that generation teaches it by machine
TM_MAIN = {1: "red-blue", 2: "gold-silver", 3: "ruby-sapphire", 4: "diamond-pearl", 5: "black-white", 6: "x-y", 7: "sun-moon",
           8: "sword-shield", 9: "scarlet-violet"}
TM_COMPAT = {1: {"red-blue", "yellow"}, 2: {"gold-silver", "crystal"}, 3: {"ruby-sapphire", "emerald", "firered-leafgreen"},
             4: {"diamond-pearl", "platinum", "heartgold-soulsilver"}, 5: {"black-white", "black-2-white-2"},
             6: {"x-y", "omega-ruby-alpha-sapphire"}, 7: {"sun-moon", "ultra-sun-ultra-moon"},
             8: {"sword-shield", "the-isle-of-armor", "the-crown-tundra"}, 9: {"scarlet-violet", "the-teal-mask", "the-indigo-disk"}}
GEN_OF = {name: g for g, s in TM_COMPAT.items() for name in s}


def tm_label(g, n):
    if g == 8:
        return f"TM{n:02d}" if n < 100 else f"TR{n - 100:02d}"
    if g == 9:
        return f"TM{n:03d}"
    return f"TM{n:02d}" if n <= 100 else f"HM{n - 100:02d}"


MOVES, key_of = {}, {}
for mid in MV:
    if mid in mname and int(MV[mid]["id"]) < 10000 and supported(mid):
        k, e = move_entry(mid)
        MOVES[k] = e
        key_of[mid] = k
MOVES["struggle"] = {"n": "Struggle", "t": "???", "c": "P", "p": 50, "a": 0, "pp": 0, "dr": -25, "ct": 1, "sp": "struggle", "s": 1}

# machines: (generation, number) -> move, numbered by each generation's main games (Scarlet/Violet's DLC lists share its numbers)
machine_of = {}   # (gen, move id) -> number
MACH = {}         # id (gen * 1000 + number) -> [gen, label, move]
for r in rows("machines"):
    name = VGNAME[r["version_group_id"]]
    g = GEN_OF.get(name)
    if g is None or (name != TM_MAIN[g] and not (g == 9 and name in TM_COMPAT[9])):
        continue
    mid, n = int(r["move_id"]), int(r["machine_number"])
    if mid not in key_of:
        continue
    machine_of[(g, mid)] = n
    MACH[g * 1000 + n] = [g, f"{tm_label(g, n)} (Gen {g})", key_of[mid]]

learn_lv = defaultdict(dict)   # pid -> move -> (rank, level, order)
learn_tm = defaultdict(set)
for r in rows("pokemon_moves"):
    pid = int(r["pokemon_id"])
    if pid not in PIDS:
        continue
    mid, vg, meth = int(r["move_id"]), r["version_group_id"], r["pokemon_move_method_id"]
    if mid not in key_of:
        continue
    if meth == "1":
        k, rank = key_of[mid], vg_rank(vg)
        cur = learn_lv[pid].get(k)
        if not cur or rank > cur[0]:
            learn_lv[pid][k] = (rank, max(1, int(r["level"] or 1)), int(r["order"] or 0))
    elif meth == "4":
        g = GEN_OF.get(VGNAME[vg])
        if g and (g, mid) in machine_of:
            learn_tm[pid].add(g * 1000 + machine_of[(g, mid)])
LS = {pid: [[lv, k] for k, (_, lv, o) in sorted(d.items(), key=lambda kv: (kv[1][1], kv[1][2], kv[0]))] for pid, d in learn_lv.items()}
# a form with no moves of its own learns what its species does
for pid in PIDS:
    if pid > MAXID and not LS.get(pid):
        LS[pid] = [list(x) for x in LS.get(pid_sid[pid], [])]
    if pid > MAXID and not learn_tm.get(pid):
        learn_tm[pid] = set(learn_tm.get(pid_sid[pid], set()))
# ---------- Showdown's learnsets and every game's egg and tutor moves (the owner's picks, 2026-10-20) ----------
# PokeAPI misses some level-up and TM moves (Ceruledge's Lv 1 Shadow Sneak, Quaquaval's Counter...): Pokémon Showdown's learnsets
# (tools/showdown_learnsets.json, made by tools/build_showdown_learnsets.js from the Showdown fork) fill them in, at Showdown's
# newest level. Every main game's egg moves and move-tutor moves (PokeAPI's and Showdown's) join as their own lists, eg and tu,
# taught by the Move Tutor for a Heart Scale. A TM move with no TM in our numbering (an Omega Ruby/Alpha Sapphire-only TM like
# Secret Power) is a tutor move. Event and transfer moves stay out.
SD_ALIAS = {"visegrip": "vicegrip"}
SDL = json.load(open(os.path.join(HERE, "showdown_learnsets.json"), encoding="utf-8"))
def sd_learnset(k):
    for _ in range(3):
        if k in SDL:
            return SDL[k]
        k = SDL["_base"].get(k)
        if not k:
            return None
    return None
tm_by_gen_move = {(g, k): i for i, (g, lab, k) in MACH.items()}
EGG, TUT = defaultdict(set), defaultdict(set)
FILLED = {"level-up": 0, "TM": 0}
for r in rows("pokemon_moves"):   # (PokeAPI's own egg and tutor moves, main games only)
    pid = int(r["pokemon_id"])
    if pid not in PIDS or r["pokemon_move_method_id"] not in ("2", "3") or VGNAME[r["version_group_id"]] in SIDE:
        continue
    k = key_of.get(int(r["move_id"]))
    if k and k in MOVES:
        (EGG if r["pokemon_move_method_id"] == "2" else TUT)[pid].add(k)
for pid in PIDS:
    ls = sd_learnset(pid_key[pid])
    if not ls:
        continue
    norm = lambda m: SD_ALIAS.get(m, m)
    have_lv = {k for _, k in LS.get(pid, [])}
    have_tm = {MACH[i][2] for i in learn_tm[pid]}
    for m, lvl in ls["L"].items():
        m = norm(m)
        if m in MOVES and m not in have_lv:
            LS.setdefault(pid, []).append([max(1, lvl), m]); have_lv.add(m); FILLED["level-up"] += 1
    for m, gens in ls["M"].items():
        m = norm(m)
        if m not in MOVES or m in have_tm or m in have_lv:
            continue
        ids = [tm_by_gen_move[(g, m)] for g in gens if (g, m) in tm_by_gen_move]
        if ids:
            learn_tm[pid].update(ids); have_tm.add(m); FILLED["TM"] += 1
        else:
            TUT[pid].add(m)
    for m in ls["E"]:
        if norm(m) in MOVES:
            EGG[pid].add(norm(m))
    for m in ls["T"]:
        if norm(m) in MOVES:
            TUT[pid].add(norm(m))
# (a form with none of its own learns its species' egg and tutor moves)
for pid in PIDS:
    if pid > MAXID and not EGG.get(pid) and not TUT.get(pid):
        EGG[pid] = set(EGG.get(pid_sid[pid], set())); TUT[pid] = set(TUT.get(pid_sid[pid], set()))
    if LS.get(pid):
        LS[pid].sort(key=lambda x: x[0])
# (an egg move carries through evolution, as in the games: each Pokémon can also have its earlier stages' egg and tutor moves)
key_pid = {pid_key[p]: p for p in PIDS}
for pid in PIDS:
    seen, k = set(), prev.get(pid)
    while k and k in key_pid and k not in seen:
        seen.add(k); a = key_pid[k]
        EGG[pid] |= EGG.get(a, set()); TUT[pid] |= TUT.get(a, set())
        k = prev.get(a)
print(f"Showdown's learnsets filled in {FILLED['level-up']} level-up and {FILLED['TM']} TM moves")
# the owner's rule: Hail and Snow are one weather, so a Pokémon that learns Hail or Snowscape (by level or by machine) learns the other
# too, and one with Ice Body or Snow Cloak has the other as well (regular or Hidden, like the one it has)
tm_of_move = defaultdict(set)
for i, (g, lab, k) in MACH.items():
    tm_of_move[k].add(i)
for pid in sorted(PIDS):
    lv, by_tm = {k: l for l, k in LS.get(pid, [])}, {MACH[i][2] for i in learn_tm[pid]}   # (what it learned before this rule)
    for a, b in (("hail", "snowscape"), ("snowscape", "hail")):
        if a in lv and b not in lv and b in MOVES:
            LS[pid].append([lv[a], b])
        if a in by_tm and b not in by_tm:
            learn_tm[pid] |= tm_of_move[b]
    if LS.get(pid):
        LS[pid].sort(key=lambda x: x[0])
    have = dict(abil[pid])
    for a, b in (("ice-body", "snow-cloak"), ("snow-cloak", "ice-body")):
        if a in have and b not in have:
            abil[pid].append((b, have[a]))
problems = [f"{pid_key[pid]}: no level-up moves" for pid in sorted(PIDS) if not LS.get(pid)]
if problems:
    print("\n".join(problems))

# ---------- rarity ----------
FIVE = set("""bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle wartortle blastoise eevee vaporeon jolteon flareon
dratini dragonair dragonite lapras snorlax aerodactyl omastar kabutops porygon chansey kangaskhan tauros scyther pinsir hitmonlee
hitmonchan gyarados alakazam gengar machamp golem mrmime""".split())
FOUR = set("""pikachu raichu clefairy clefable vulpix ninetales growlithe arcanine abra kadabra machoke haunter graveler poliwrath nidoking
nidoqueen wigglytuff vileplume victreebel tentacruel rapidash slowbro magneton dodrio dewgong muk cloyster onix hypno kingler electrode
exeggutor marowak lickitung weezing rhydon tangela seaking starmie jynx electabuzz magmar ditto farfetchd omanyte kabuto pidgeot golduck
primeape persian dugtrio sandslash arbok fearow venomoth butterfree beedrill raticate""".split())
LEGEND = {sid_key[sid] for sid, r in species.items() if r["is_legendary"] == "1" or r["is_mythical"] == "1"}
MYTHICAL = {sid_key[sid] for sid, r in species.items() if r["is_mythical"] == "1"}
# generations 2 to 5 (#152-649): starters, pseudo-legendaries, fossils, the new Eeveelutions and the new members of Kanto's rarest lines
# are 5 stars; then by base stats: a final form at 500 or more 5, a final form at 420 or more (or the middle of a line that ends at
# 500 or more) 4; a new member of a Kanto line takes that line's rarity when it's higher
NEW_FIVE = set("""chikorita bayleef meganium cyndaquil quilava typhlosion totodile croconaw feraligatr treecko grovyle sceptile torchic
combusken blaziken mudkip marshtomp swampert turtwig grotle torterra chimchar monferno infernape piplup prinplup empoleon snivy servine
serperior tepig pignite emboar oshawott dewott samurott larvitar pupitar tyranitar bagon shelgon salamence beldum metang metagross gible
gabite garchomp deino zweilous hydreigon lileep cradily anorith armaldo cranidos rampardos shieldon bastiodon tirtouga carracosta archen
archeops espeon umbreon leafeon glaceon scizor blissey happiny porygon2 porygonz munchlax mimejr tyrogue hitmontop
chespin quilladin chesnaught fennekin braixen delphox froakie frogadier greninja goomy sliggoo goodra tyrunt tyrantrum amaura aurorus
sylveon rowlet dartrix decidueye litten torracat incineroar popplio brionne primarina jangmoo hakamoo kommoo typenull silvally
grookey thwackey rillaboom scorbunny raboot cinderace sobble drizzile inteleon dreepy drakloak dragapult dracozolt arctozolt dracovish
arctovish sprigatito floragato meowscarada fuecoco crocalor skeledirge quaxly quaxwell quaquaval frigibax arctibax baxcalibur""".split())
bst = lambda pid: sum(base[pid].values())
def line_final_bst(sid):
    best, todo = 0, [sid]
    while todo:
        x = todo.pop()
        nxt = [int(r["id"]) for r in species.values() if r["evolves_from_species_id"] and int(r["evolves_from_species_id"]) == x]
        if not nxt: best = max(best, bst(x))
        todo += nxt
    return best
def line_root(sid):
    while species[sid]["evolves_from_species_id"]: sid = int(species[sid]["evolves_from_species_id"])
    return sid
def kanto_line_rarity(sid):
    """the rarity a Kanto Pokémon in this one's evolution line has (5 or 4), if any"""
    root, todo, r = line_root(sid), [line_root(sid)], 0
    while todo:
        x = todo.pop(); k = sid_key[x]
        if x <= 151: r = max(r, 5 if k in FIVE else 4 if k in FOUR else 3)
        todo += [int(y["id"]) for y in species.values() if y["evolves_from_species_id"] and int(y["evolves_from_species_id"]) == x]
    return r
def rarity(pid):
    sid, key = pid_sid[pid], sid_key[pid_sid[pid]]
    if sid <= 151: return 5 if key in FIVE or key in LEGEND else 4 if key in FOUR else 3
    if key in LEGEND or key in NEW_FIVE: return 5
    final = not evos.get(pid)
    r = 5 if final and bst(pid) >= 500 else 4 if (final and bst(pid) >= 420) or (species[sid]["evolves_from_species_id"] and line_final_bst(sid) >= 500) else 3
    return max(r, min(5, kanto_line_rarity(sid)) if kanto_line_rarity(sid) >= 4 else r)

# ---------- output ----------
dex = []
for pid in sorted(PIDS, key=lambda p: (pid_sid[p], p)):   # by Pokédex number, each species' forms right after it
    sid = pid_sid[pid]
    key, s = pid_key[pid], species[sid]
    p = poke[pid]
    b = base[pid]
    abl = sorted(abil[pid], key=lambda a: a[1])   # regular abilities first, then hidden
    d = {"id": sid, "k": key, "n": form_name.get(pid, names[sid]) if pid > MAXID else names[sid], "g": genus[sid], "t": types[pid],
         "b": [b["hp"], b["atk"], b["def"], b["spa"], b["sdf"], b["spe"]], "ab": pick_ability(pid),
         "abs": [[a, 1 if h else 0] for a, h in abl],
         "h": int(p["height"]), "w": int(p["weight"]), "cr": int(s["capture_rate"]), "gr": int(s["growth_rate_id"]),
         "r": rarity(pid), "ls": LS.get(pid, []), "tm": sorted(learn_tm[pid]), "gen": int(s["generation_id"])}
    known = {k for _, k in d["ls"]} | {MACH[i][2] for i in d["tm"]}
    eg, tu = sorted(EGG.get(pid, set()) - known), sorted(TUT.get(pid, set()) - known - EGG.get(pid, set()))
    if eg:
        d["eg"] = eg
    if tu:
        d["tu"] = tu
    if sid_key[sid] in LEGEND:
        d["leg"] = 1
    if sid_key[sid] in MYTHICAL:
        d["myth"] = 1
    if pid > MAXID:
        d["form"] = sid_key[sid]                      # its species (Rotom for Wash Rotom)
        if poke[pid]["identifier"] in BATTLE_FORMS:
            d["bf"] = 1                               # only in battle (Castform in weather, Zen Mode, Pirouette)
    if evos.get(pid) and not d.get("bf"):
        d["evo"] = evos[pid]
    if pid in prev:
        d["from"] = prev[pid]
    dex.append(d)

# Sketch (the owner's rule, 2026-10-15): three of them, S1, S2 and S3 Sketch (sketch1, sketch, sketch3), each copying the move an
# opposing Pokémon has in its own slot, for good. Smeargle knows all three from Lv 1 (the Move Reminder teaches them again)
SKETCH_SLOTS = {"sketch1": 1, "sketch": 2, "sketch3": 3}
for key, sl in SKETCH_SLOTS.items():
    MOVES[key] = {**MOVES["sketch"], "s": sl}
for d in dex:
    if any(m in SKETCH_SLOTS for _, m in d["ls"]):
        d["ls"] = [x for x in d["ls"] if x[1] not in SKETCH_SLOTS] + [[1, k] for k in SKETCH_SLOTS]
# Copycat and Mirror Move (the owner's rules, 2026-10-16): three of each like Sketch, S1, S2 and S3 (copycat1, copycat, copycat3;
# mirrormove1, mirrormove, mirrormove3), each using the move an opposing Pokemon has in its own slot, this once (the move stays).
# Whoever learns one learns all three, at its level (no TM teaches either)
COPY_SLOTS = {"copycat": {"copycat1": 1, "copycat": 2, "copycat3": 3}, "mirrormove": {"mirrormove1": 1, "mirrormove": 2, "mirrormove3": 3}}
for base, slots in COPY_SLOTS.items():
    MOVES[base].pop("tg", None)   # (aimed at an opposing Pokemon)
    for key, sl in slots.items():
        MOVES[key] = {**MOVES[base], "s": sl}
    for d in dex:
        cl = [l for l, m in d["ls"] if m == base]
        if cl:
            d["ls"] = [x for x in d["ls"] if x[1] not in slots] + [[min(cl), k] for k in slots]
SLOTTED = {"sketch": list(SKETCH_SLOTS), **{base: list(slots) for base, slots in COPY_SLOTS.items()}}
for d in dex:
    for f in ("eg", "tu"):
        if d.get(f):
            d[f] = sorted({x for m in d[f] for x in SLOTTED.get(m, [m])})
used_tm = sorted(set(i for d in dex for i in d["tm"]))
used = set(k for d in dex for _, k in d["ls"]) | set(MACH[i][2] for i in used_tm) | {k for d in dex for f in ("eg", "tu") for k in d.get(f, [])} | {"struggle"}
# Metronome can call any damaging move in the game (but not Self-Destruct, Explosion, the one-hit KOs or Struggle)
NO_METRO = {"selfdestruct", "explosion", "mistyexplosion", "fissure", "horndrill", "guillotine", "sheercold", "struggle", "finalgambit"}
metronome = sorted(k for k in used if MOVES[k]["p"] and MOVES[k].get("sp") not in NO_METRO)
moves_out = {k: MOVES[k] for k in sorted(used)}
TMS = [[i, *MACH[i]] for i in used_tm]
with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n// =====================================================================\n")
    f.write("//  POKÉDEX DATA — generated by tools/build_data.py from PokeAPI. Do not edit by hand.\n")
    f.write("//  DEX: [{id, k (Showdown id), n, g (genus), t (types), b [HP Atk Def SpA SpD Spe], ab (Trainers' Ability), abs [[Ability, hidden]],\n")
    f.write("//         h (dm), w (hg), cr (catch rate), gr (growth rate), r (rarity), ls [[level, move]] (level-up moves, every game),\n")
    f.write("//         tm [machine ids: generation * 1000 + number], evo, from, leg}]\n")
    f.write("//  MOVES: {key: {n, t (type), c (P physical / S special / X status), p (power), a (accuracy, 0 = never misses), pp, pri,\n")
    f.write("//          tg (target: one/foes/self/team/ally/field), hit [min,max], ail + ac (status + chance %), fl (flinch %),\n")
    f.write("//          cr (high crit), dr (drain %, negative = recoil), hl (heal %), st [[stat, stages]] + sc (chance %) + sw (who),\n")
    f.write("//          ct contact, pu punch, so sound, pw powder, crash (misses hurt), sp (special handler), s (slot: 1, 2 or 3)}}\n")
    f.write("//  TMS: [[id, generation, \"TM01 (Gen 1)\", move]]   METRONOME: the moves Metronome can call\n")
    f.write("// =====================================================================\n")
    f.write("const DEX = [\n" + ",\n".join(json.dumps(d, ensure_ascii=False, separators=(",", ":")) for d in dex) + "\n];\n")
    f.write("const MOVES = {\n" + ",\n".join(f"{json.dumps(k)}:{json.dumps(v, ensure_ascii=False, separators=(',', ':'))}" for k, v in moves_out.items()) + "\n};\n")
    f.write("const TMS = [\n" + ",\n".join(json.dumps(t, separators=(",", ":")) for t in TMS) + "\n];\n")
    f.write(f"const METRONOME = {json.dumps(metronome)};\n")
print(f"wrote {OUT}: {len(dex)} Pokemon, {len(moves_out)} moves, {len(TMS)} TMs/HMs/TRs, "
      f"{sum(len(d['ls']) for d in dex)} level-up entries, {sum(len(d['tm']) for d in dex)} TM compatibilities, "
      f"{sum(len(d.get('eg', [])) for d in dex)} egg moves, {sum(len(d.get('tu', [])) for d in dex)} tutor moves")
# what they could learn but the engine can't run (left out)
learnable = set()
for r in rows("pokemon_moves"):
    if int(r["pokemon_id"]) in PIDS and r["pokemon_move_method_id"] in ("1", "4"):
        learnable.add(int(r["move_id"]))
skipped = sorted(mname[m] for m in learnable if m in MV and m in mname and not supported(m))
print(f"left out ({len(skipped)}): {', '.join(skipped)}")
if "-v" in sys.argv:
    for c in (1, 2, 3):
        print(f"S{c}:", ", ".join(sorted(MOVES[k]["n"] for k in moves_out if MOVES[k]["s"] == c)))
