#!/usr/bin/env python3
"""Pack the owner's Pokémon PNGs for the build: every Pokémon and form in the game, front and back.

  in   resources/sprites/pokemon sprites/front|back/<NAME>.png   (the owner's pack: never renamed, moved or deleted)
       names are capitals without punctuation (MRMIME, HOOH, PORYGONZ, NIDORAN FEMALE), a form after a space (ROTOM WASH)
  out  resources/pokemon/front|back/<key>.png   (generated: 96 px pixel art, cropped to the Pokémon, feet at the bottom)
       resources/pokemon/sprites.json           {front: {key: [w, h]}, back: {...}, borrowed: {key: why}}
The fronts are 2x enlargements of 96 px sprites and the backs 3x: shrunk back exactly (nearest neighbour). A form with no picture
of its own (Sandy and Trash Wormadam, Hisuian Braviary, Pumpkaboo's and Gourgeist's sizes) borrows its species'. Run after tools/build_data.py adds Pokémon:  python3 tools/pack_pngs.py
"""
import json, os, re, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
SRC = os.path.join(ROOT, "resources", "sprites", "pokemon sprites")
OUT = os.path.join(ROOT, "resources", "pokemon")
SPECIAL = {"nidoranf": "NIDORAN FEMALE", "nidoranm": "NIDORAN MALE",
           # forms whose file name isn't the species plus the form's last word
           "ogerpon": "OGERPON TEAL MASKED", "ogerponwellspring": "OGERPON WELLSPRING MASKED", "ogerponhearthflame": "OGERPON HEARTHFLAME MASKED",
           "ogerponcornerstone": "OGERPON CORNERSTONE MASKED", "zygarde10": "ZYGARDE 10%", "necrozmaduskmane": "NECROZMA DUSK MANE",
           "necrozmadawnwings": "NECROZMA DAWN WINGS", "indeedeef": "INDEEDEE FEMALE", "urshifurapidstrike": "URSHIFU RAPID STRIKE",
           "basculegionf": "BASCULEGION FEMALE", "oinkolognef": "OINKOLOGNE FEMALE", "taurospaldeacombat": "TAUROS PALDEA COMBAT",
           "taurospaldeablaze": "TAUROS PALDEA BLAZE", "taurospaldeaaqua": "TAUROS PALDEA AQUA", "darmanitangalarzen": "DARMANITAN GALAR ZEN"}

dex_js = open(os.path.join(ROOT, "src", "a3a_dex.js"), encoding="utf-8").read()
dex = [json.loads(l.rstrip(",")) for l in dex_js.split("const DEX = [\n")[1].split("\n];")[0].split("\n")]


def file_name(d):
    k = d["k"]
    if k in SPECIAL:
        return SPECIAL[k]
    if d.get("form"):
        base = SPECIAL.get(d["form"], d["form"].upper())
        return base + " " + k[len(d["form"]):].upper()
    return k.upper()


def load(side, name):
    for ext in (".png", ".PNG"):
        p = os.path.join(SRC, side, name + ext)
        if os.path.exists(p):
            return Image.open(p).convert("RGBA")
    return None


meta = {"front": {}, "back": {}, "borrowed": {}}
missing = []
for side in ("front", "back"):
    os.makedirs(os.path.join(OUT, side), exist_ok=True)
for d in dex:
    for side in ("front", "back"):
        im = load(side, file_name(d))
        if im is None and d.get("form"):
            im = load(side, SPECIAL.get(d["form"], d["form"].upper()))
            if im is not None:
                meta["borrowed"][d["k"]] = f"no {side} picture of its own: its species'"
        if im is None:
            missing.append(f"{d['k']} ({side}: {file_name(d)})")
            continue
        # back to its 96 px pixels (fronts are drawn 2x, backs 3x), then cropped to the Pokémon
        f = im.width // 96 if im.width % 96 == 0 and im.width == im.height else 1
        if f > 1:
            im = im.resize((im.width // f, im.height // f), Image.NEAREST)
        box = im.getbbox() or (0, 0, im.width, im.height)
        im = im.crop(box)
        im.save(os.path.join(OUT, side, d["k"] + ".png"), optimize=True)
        meta[side][d["k"]] = [im.width, im.height]
# (pictures for keys no longer in the game go)
for side in ("front", "back"):
    for f in os.listdir(os.path.join(OUT, side)):
        if f.endswith(".png") and f[:-4] not in meta[side]:
            os.remove(os.path.join(OUT, side, f))
json.dump(meta, open(os.path.join(OUT, "sprites.json"), "w", encoding="utf-8"), separators=(",", ":"))
size = sum(os.path.getsize(os.path.join(OUT, s, f)) for s in ("front", "back") for f in os.listdir(os.path.join(OUT, s)))
print(f"packed {len(meta['front'])} fronts and {len(meta['back'])} backs ({size // 1024} KB) into resources/pokemon; borrowed: {list(meta['borrowed'])}")
if missing:
    print("MISSING:", ", ".join(missing))
    sys.exit(1)
