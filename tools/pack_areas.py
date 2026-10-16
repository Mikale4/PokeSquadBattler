#!/usr/bin/env python3
"""Crop the Kanto area previews out of the owner's FireRed/LeafGreen sheet for the chapter backgrounds.

Reads resources/area previews/<the sheet>.png (a 3 x 7 grid of 240 x 112 pictures under their name labels)
and writes resources/areas/<slug>.png for the 13 Kanto places (the Sevii Islands ones aren't used).
build.sh embeds resources/areas/*.png; CHAPTER_BG in src/a4_story.js picks one per chapter.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "area previews", "Game Boy Advance - Pokemon FireRed _ LeafGreen - Miscellaneous - Area Previews.png")
OUT = os.path.join(ROOT, "resources", "areas")

# the sheet's grid, row by row (None: a Sevii Islands place)
GRID = ["viridian-forest", "mt-moon", "digletts-cave",
        "rock-tunnel", "pokemon-tower", "power-plant",
        "rocket-hideout", "silph-co", "safari-zone",
        "seafoam-islands", "pokemon-mansion", "victory-road",
        "cerulean-cave", None, None,
        None, None, None,
        None, None, None]
X0, Y0, W, H, DX, DY = 8, 66, 240, 112, 241, 161   # first picture, picture size, column and row pitch

im = Image.open(SHEET).convert("RGB")
os.makedirs(OUT, exist_ok=True)
n = 0
for i, slug in enumerate(GRID):
    if not slug:
        continue
    x, y = X0 + (i % 3) * DX, Y0 + (i // 3) * DY
    im.crop((x, y, x + W, y + H)).save(os.path.join(OUT, slug + ".png"), optimize=True)
    n += 1
print(f"{n} area previews in resources/areas/")
