#!/usr/bin/env python3
"""The S3 cut-in strips: the horizontal bands of resources/battle effects/Cut-ins (ripped by redblueyellow).png.

The sheet has two columns of ten 128 x 58 strips (x 2 and 134, every 66 px down): the left column in ten colours, the right
all red. Writes resources/cutins/<colour>.png (and red.png); build.sh embeds them, and CUTIN_COL in src/a8b_battle.js picks one
by the move's type (red is Fighting), for both sides.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "battle effects", "Cut-ins (ripped by redblueyellow).png")
OUT = os.path.join(ROOT, "resources", "cutins")
COLOURS = ["mint", "steel", "purple", "lime", "gold", "brown", "sky", "grey", "blue", "orange"]

im = Image.open(SHEET).convert("RGBA")
os.makedirs(OUT, exist_ok=True)
for j, name in enumerate(COLOURS):
    im.crop((2, 5 + 66 * j, 130, 63 + 66 * j)).save(os.path.join(OUT, name + ".png"), optimize=True)
im.crop((134, 5, 262, 63)).save(os.path.join(OUT, "red.png"), optimize=True)
print(len(COLOURS) + 1, "strips")
