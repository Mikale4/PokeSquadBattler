"""Cut every region's Gym Badges out of the owner's sheet (resources/sprites/badges/all region badges.png) into
resources/badges/<badge>.png, one picture per Badge named after it ("zephyr.png" is the Zephyr Badge), on a transparent
background. build.sh embeds them as RES_DATA.badge; badgeSVG (a2_core.js) shows a region's Badges from them.
The sheet is VictorV111's (https://www.deviantart.com/victorv111), credited on the Credits screen (titleCredits).

The sheet's bottom rows hold each region's eight bare Badges in boxes of four by two, 31 px a cell. Sinnoh's appear twice (Platinum's
Gym order, then Diamond and Pearl's), the same pictures: the Diamond/Pearl box is used. Kanto's are here too, in color (the
Trainer Card kit's, tools/pack_card.py, are its grey outlines, kept only as a fallback).
Run: python3 tools/pack_badges.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "sprites", "badges", "all region badges.png")
OUT = os.path.join(ROOT, "resources", "badges")
CELL = 31
# (left edge of the box, top edge of its first row, the eight Badges in the box's order: top row, then bottom row)
BOXES = [
    (60, 1071, ["boulder", "cascade", "thunder", "rainbow", "soul", "marsh", "volcano", "earth"]),         # Kanto
    (187, 1071, ["stone", "knuckle", "dynamo", "heat", "balance", "feather", "mind", "rain"]),               # Hoenn (Ruby/Sapphire/Emerald)
    (822, 1071, ["bug", "cliff", "rumble", "plant", "voltage", "fairy", "psychic", "iceberg"]),             # Kalos
    (949, 1071, ["galar_grass", "galar_water", "galar_fire", "galar_fighting", "galar_fairy", "galar_rock", "galar_dark", "galar_dragon"]),   # Galar (Sword)
    (1076, 1071, [None, None, None, "galar_ghost", None, "galar_ice", None, None]),                        # Galar (Shield's own two)
    (60, 1136, ["zephyr", "hive", "plain", "fog", "storm", "mineral", "glacier", "rising"]),                # Johto
    (441, 1136, ["coal", "forest", "cobble", "fen", "relic", "mine", "icicle", "beacon"]),                  # Sinnoh (Diamond/Pearl's order)
    (568, 1136, ["trio", "basic", "insect", "bolt", "quake", "jet", "freeze", "legend"]),                   # Unova (Black/White)
    (695, 1136, [None, "toxic", None, None, None, None, None, "wave"]),                                    # Unova (Black 2/White 2's own two)
    (822, 1136, ["paldea_bug", "paldea_grass", "paldea_electric", "paldea_water", "paldea_normal", "paldea_ghost", "paldea_psychic", "paldea_ice"]),   # Paldea
]

def cut(im, x, y):
    """One cell's Badge on a transparent background: the white around it (reached from the cell's edge) goes clear, white inside stays."""
    c = im.crop((x + 1, y + 1, x + CELL, y + CELL)).convert("RGBA")
    w, h = c.size; px = c.load()
    white = lambda p: p[0] > 235 and p[1] > 235 and p[2] > 235
    seen, stack = set(), [(i, j) for i in range(w) for j in (0, h - 1)] + [(i, j) for j in range(h) for i in (0, w - 1)]
    while stack:
        i, j = stack.pop()
        if (i, j) in seen or not (0 <= i < w and 0 <= j < h) or not white(px[i, j]): continue
        seen.add((i, j)); px[i, j] = (0, 0, 0, 0)
        stack += [(i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)]
    box = c.getbbox()
    c = c.crop(box) if box else c
    s = max(c.size); sq = Image.new("RGBA", (s, s), (0, 0, 0, 0)); sq.paste(c, ((s - c.width) // 2, (s - c.height) // 2))
    return sq

def main():
    im = Image.open(SHEET).convert("RGB")
    os.makedirs(OUT, exist_ok=True)
    n = 0
    for x0, y0, names in BOXES:
        for k, name in enumerate(names):
            if not name: continue
            cut(im, x0 + (k % 4) * CELL, y0 + (k // 4) * CELL).save(os.path.join(OUT, name + ".png"), optimize=True)
            n += 1
    print(f"{n} Gym Badges in resources/badges/")

if __name__ == "__main__":
    main()
