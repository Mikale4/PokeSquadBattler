"""Match every move in the game (src/a3a_dex.js MOVES) to its sound in the owner's Gen 3 move sound pack,
resources/audio/move sfx (the Ruby/Sapphire/FireRed/LeafGreen attack sounds), and write tools/move_sfx.json.

Each move gets {"f": file} (the whole sound) and, for multi-strike moves, {"h": file} (one strike, played per hit).
Names are matched loosely (case, spaces and punctuation ignored; ALIAS for the pack's own spellings).
A move with no sound of its own borrows one it would plausibly make (BORROW, then a stand-in by type and kind), so every
move has a sound. The sounds aren't embedded: like the music they play from the folder next to the HTML (a8c_sfx.js).
Run after build_data.py:  python3 tools/pack_sfx.py"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(HERE, "..", "resources", "audio", "move sfx")
DEX = os.path.join(HERE, "..", "src", "a3a_dex.js")
OUT = os.path.join(HERE, "move_sfx.json")

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
# the pack's spellings where they differ from PokeAPI's
ALIAS = {"visegrip": "vicegrip"}
# moves newer than the Gen 3 pack: the Gen 3 move whose sound fits (Fire Fang bites like Fire Punch hits, Moonblast glows like Moonlight)
BORROW = {"struggle": "Tackle", "fire-fang": "Fire Punch", "ice-fang": "Ice Punch", "thunder-fang": "Thunder Punch",
          "psychic-fangs": "Crunch", "moonblast": "Moonlight", "dazzling-gleam": "Charm", "draining-kiss": "Sweet Kiss", "play-rough": "Charm",
          "disarming-voice": "Hyper Voice", "alluring-voice": "Hyper Voice", "fairy-wind": "Gust", "misty-terrain": "Mist", "misty-explosion": "Explosion",
          "air-slash": "Air Cutter", "hurricane": "Twister", "brave-bird": "Sky Attack", "acrobatics": "Aerial Ace", "dual-wingbeat": "Wing Attack",
          "flare-blitz": "Blaze Kick", "flame-charge": "Flame Wheel", "mystical-fire": "Ember", "burn-up": "Overheat", "temper-flare": "Blaze Kick",
          "scald": "Water Pulse", "aqua-tail": "Waterfall", "aqua-jet": "Waterfall", "liquidation": "Crabhammer", "flip-turn": "Dive", "wave-crash": "Waterfall",
          "brine": "Water Pulse", "chilling-water": "Water Gun", "water-pledge": "Water Pulse", "energy-ball": "Solar Beam", "seed-bomb": "Bullet Seed",
          "leaf-storm": "Petal Dance", "power-whip": "Vine Whip", "petal-blizzard": "Petal Dance", "grass-knot": "Ingrain", "solar-blade": "Leaf Blade",
          "trailblaze": "Leaf Blade", "grassy-glide": "Leaf Blade", "grassy-terrain": "Ingrain", "grass-pledge": "Magical Leaf", "volt-switch": "Spark",
          "wild-charge": "Volt Tackle", "discharge": "Thunderbolt", "electro-ball": "Shock Wave", "electroweb": "Thunder Wave", "electric-terrain": "Charge",
          "supercell-slam": "Volt Tackle", "nuzzle": "Spark", "eerie-impulse": "Thunder Wave", "magnetic-flux": "Charge", "ice-shard": "Icicle Spear",
          "avalanche": "Ice Ball", "freeze-dry": "Ice Beam", "frost-breath": "Powder Snow", "ice-spinner": "Ice Ball", "aurora-veil": "Haze", "snowscape": "Hail",
          "triple-axel": "Ice Punch", "close-combat": "Cross Chop", "drain-punch": "Mega Drain", "aura-sphere": "Focus Punch", "focus-blast": "Focus Punch",
          "low-sweep": "Low Kick", "body-press": "Body Slam", "vacuum-wave": "Focus Punch", "storm-throw": "Seismic Toss", "circle-throw": "Seismic Toss",
          "axe-kick": "High Jump Kick", "coaching": "Bulk Up", "poison-jab": "Poison Sting", "gunk-shot": "Sludge Bomb", "sludge-wave": "Sludge Bomb",
          "venoshock": "Acid", "clear-smog": "Smog", "toxic-spikes": "Spikes", "acid-spray": "Acid", "venom-drench": "Acid Armor", "cross-poison": "Poison Tail",
          "earth-power": "Earthquake", "bulldoze": "Magnitude", "drill-run": "Drill Peck", "high-horsepower": "Stomp", "stomping-tantrum": "Stomp",
          "mud-bomb": "Mud-Slap", "stealth-rock": "Rock Throw", "stone-edge": "Rock Slide", "rock-polish": "Agility", "smack-down": "Rock Throw",
          "power-gem": "Ancient Power", "x-scissor": "Fury Cutter", "bug-buzz": "Signal Beam", "u-turn": "Fury Cutter", "struggle-bug": "Silver Wind",
          "pounce": "Fury Cutter", "lunge": "Megahorn", "skitter-smack": "Fury Cutter", "pollen-puff": "Silver Wind", "first-impression": "Megahorn",
          "rage-powder": "Spore", "shadow-claw": "Shadow Punch", "shadow-sneak": "Shadow Punch", "hex": "Night Shade", "phantom-force": "Shadow Ball",
          "poltergeist": "Shadow Ball", "rage-fist": "Shadow Punch", "dragon-pulse": "Dragon Breath", "draco-meteor": "Outrage", "dragon-tail": "Dragon Claw",
          "dragon-rush": "Dragon Claw", "breaking-swipe": "Dragon Claw", "scale-shot": "Dragon Claw", "dragon-cheer": "Dragon Dance", "dark-pulse": "Faint Attack",
          "night-slash": "Slash", "sucker-punch": "Faint Attack", "foul-play": "Faint Attack", "nasty-plot": "Swords Dance", "lash-out": "Crunch",
          "darkest-lariat": "Crunch", "throat-chop": "Crunch", "assurance": "Faint Attack", "payback": "Faint Attack", "iron-head": "Iron Tail",
          "flash-cannon": "Steel Wing", "heavy-slam": "Body Slam", "gyro-ball": "Rapid Spin", "bullet-punch": "Meteor Mash", "steel-beam": "Doom Desire",
          "smart-strike": "Horn Attack", "hard-press": "Iron Tail", "zen-headbutt": "Headbutt", "psyshock": "Psychic", "psystrike": "Psychic",
          "stored-power": "Psybeam", "expanding-force": "Psychic", "psychic-terrain": "Psych Up", "trick-room": "Psych Up", "psychic-noise": "Psywave",
          "giga-impact": "Hyper Beam", "double-hit": "Double Slap", "boomburst": "Hyper Voice", "work-up": "Bulk Up", "hone-claws": "Sharpen",
          "tailwind": "Gust", "roost": "Recover", "defog": "Whirlwind", "baby-doll-eyes": "Charm", "play-nice": "Charm", "confide": "Growl",
          "laser-focus": "Focus Energy", "life-dew": "Aqua Ring", "aqua-ring": "Water Sport", "power-swap": "Psych Up", "guard-swap": "Psych Up",
          "speed-swap": "Psych Up", "heal-pulse": "Recover", "healing-wish": "Wish", "lucky-chant": "Safeguard", "magnet-rise": "Charge", "copycat": "Mimic",
          "acupressure": "Focus Energy", "punishment": "Faint Attack", "wring-out": "Bind", "wake-up-slap": "Double Slap", "retaliate": "Crush Claw",
          "round": "Sing", "echoed-voice": "Hyper Voice", "chip-away": "Slash", "incinerate": "Ember", "flame-burst": "Flamethrower", "heat-crash": "Body Slam",
          "final-gambit": "Memento", "shell-smash": "Withdraw", "quiver-dance": "Teeter Dance", "coil": "Wrap", "soak": "Water Gun", "gastro-acid": "Acid",
          "worry-seed": "Leech Seed", "rototiller": "Mud Sport", "flower-shield": "Aromatherapy", "raging-bull": "Horn Attack", "synchronoise": "Psywave",
          "brutal-swing": "Crunch", "trick": "Trick", "switcheroo": "Trick", "pluck": "Peck", "bug-bite": "Fury Cutter", "feint": "Fake Out",
          "wide-guard": "Protect", "quick-guard": "Protect", "electric-terrain-x": "Charge"}
# last resort by type and category (physical, special, status)
STAND_IN = {("Normal", "P"): "Tackle", ("Normal", "S"): "Swift", ("Normal", "X"): "Growl", ("Fire", "P"): "Fire Punch", ("Fire", "S"): "Ember",
            ("Fire", "X"): "Will-O-Wisp", ("Water", "P"): "Waterfall", ("Water", "S"): "Water Gun", ("Water", "X"): "Rain Dance",
            ("Electric", "P"): "Thunder Punch", ("Electric", "S"): "Thunder Shock", ("Electric", "X"): "Thunder Wave", ("Grass", "P"): "Vine Whip",
            ("Grass", "S"): "Absorb", ("Grass", "X"): "Growth", ("Ice", "P"): "Ice Punch", ("Ice", "S"): "Ice Beam", ("Ice", "X"): "Haze",
            ("Fighting", "P"): "Karate Chop", ("Fighting", "S"): "Focus Punch", ("Fighting", "X"): "Bulk Up", ("Poison", "P"): "Poison Sting",
            ("Poison", "S"): "Acid", ("Poison", "X"): "Toxic", ("Ground", "P"): "Dig", ("Ground", "S"): "Mud-Slap", ("Ground", "X"): "Sand Attack",
            ("Flying", "P"): "Peck", ("Flying", "S"): "Gust", ("Flying", "X"): "Feather Dance", ("Psychic", "P"): "Psycho Boost", ("Psychic", "S"): "Confusion",
            ("Psychic", "X"): "Agility", ("Bug", "P"): "Leech Life", ("Bug", "S"): "Silver Wind", ("Bug", "X"): "String Shot", ("Rock", "P"): "Rock Throw",
            ("Rock", "S"): "Ancient Power", ("Rock", "X"): "Sandstorm", ("Ghost", "P"): "Lick", ("Ghost", "S"): "Night Shade", ("Ghost", "X"): "Confuse Ray",
            ("Dragon", "P"): "Dragon Claw", ("Dragon", "S"): "Dragon Breath", ("Dragon", "X"): "Dragon Dance", ("Dark", "P"): "Bite",
            ("Dark", "S"): "Faint Attack", ("Dark", "X"): "Taunt", ("Steel", "P"): "Metal Claw", ("Steel", "S"): "Steel Wing", ("Steel", "X"): "Iron Defense",
            ("Fairy", "P"): "Sweet Kiss", ("Fairy", "S"): "Charm", ("Fairy", "X"): "Sweet Kiss", ("???", "P"): "Tackle", ("???", "S"): "Swift", ("???", "X"): "Growl"}

files = sorted(f for f in os.listdir(SFX) if f.lower().endswith(".mp3"))
whole, part, hit = {}, {}, {}
for f in files:
    stem = f[:-4]
    m = re.match(r"(.*?) (1hit|2hits)$", stem)
    if m:
        if m.group(2) == "1hit": hit[norm(m.group(1))] = f
        continue
    m = re.match(r"(.*?) part (\d+)$", stem)
    if m:
        part.setdefault(norm(m.group(1)), {})[int(m.group(2))] = f
        continue
    if re.search(r" (turn damage|damage)$", stem):
        continue
    whole[norm(stem)] = f

src = open(DEX, encoding="utf-8").read()
# BORROW is keyed by PokeAPI identifier (fire-fang); the game's keys drop the dashes (firefang)
IDENT = {k.replace("-", ""): k for k in BORROW}
moves = {k: json.loads(v) for k, v in re.findall(r'^"([a-z0-9]+)":(\{.*\}),?$', src, re.M)}


def sound(name):
    n = norm(name)
    n = ALIAS.get(n, n)
    if n in whole: return whole[n]
    if n in part: return part[n][min(part[n])]
    if n in hit: return hit[n]
    return None


out, borrowed = {"_": __doc__.split("\n")[0]}, []
for k, M in sorted(moves.items()):
    f = sound(M["n"])
    if not f:
        f = sound(BORROW.get(IDENT.get(k, k)) or "") or sound(STAND_IN.get((M["t"], M["c"])) or "") or sound(STAND_IN.get((M["t"], "P")) or "") or sound("Tackle")
        borrowed.append(f'{M["n"]} -> {f}')
    e = {"f": f}
    h = hit.get(ALIAS.get(norm(M["n"]), norm(M["n"])))
    if M.get("hit") and h:
        e["h"] = h
    out[k] = e
json.dump(out, open(OUT, "w", encoding="utf-8"), indent=0, ensure_ascii=False)
print(f"{len(moves)} moves, {len(moves) - len(borrowed)} with their own sound; borrowed: {', '.join(borrowed) or 'none'}")
