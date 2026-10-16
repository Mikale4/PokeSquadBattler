#!/usr/bin/env python3
"""Cut the type icons out of the owner's two custom type sheets (both credited in the game's Credits).

  DS-style labels by icedt: a 3 x 7 grid of 48 x 16 framed labels on a magenta key colour -> resources/types/<Type>.png
    (typeChip in src/a2_core.js: wherever a type is named)
  Minecraft-style icons by Squid Eevee: its GO/Let's Go/SwSh/HOME set, 20 x 20 squares -> resources/typeicons/<Type>.png
    (typeIcon: the type filters and the type matchups)
build.sh embeds both folders.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "sprites", "types", "Custom _ Edited - Pokemon Customs - Miscellaneous - Type Icons (DS-Style).png")
OUT = os.path.join(ROOT, "resources", "types")
GRID = ["Poison", "Steel", "Dark",
        "Normal", "Ghost", "Fighting",
        "Fire", "Grass", "Water",
        "Fairy", "Bug", "Flying",
        "Psychic", "Ice", "Rock",
        "Electric", "Ground", "Dragon"]          # the seventh row's "???" is saved as Typeless.png below
W, H = 48, 16
KEY = (224, 72, 192)

im = Image.open(SHEET).convert("RGBA")
os.makedirs(OUT, exist_ok=True)
for i, t in enumerate(GRID):
    x, y = (i % 3) * W, (i // 3) * H
    icon = im.crop((x, y, x + W, y + H))
    px = icon.load()
    for yy in range(H):
        for xx in range(W):
            if px[xx, yy][:3] == KEY:
                px[xx, yy] = (0, 0, 0, 0)
    icon.save(os.path.join(OUT, t + ".png"), optimize=True)
# the seventh row's "???" (typeless: Struggle, and a Fire type that has used Burn Up); "?" can't be in a Windows file name
icon = im.crop((0, 6 * H, W, 7 * H)); px = icon.load()
for yy in range(H):
    for xx in range(W):
        if px[xx, yy][:3] == KEY:
            px[xx, yy] = (0, 0, 0, 0)
icon.save(os.path.join(OUT, "Typeless.png"), optimize=True)
print(f"{len(GRID) + 1} type labels in resources/types/")

MC = os.path.join(ROOT, "resources", "sprites", "types", "Custom _ Edited - Pokemon Customs - Miscellaneous - Type Icons (Minecraft-Style).png")
MC_ORDER = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock",
            "Bug", "Ghost", "Steel", "Fire", "Water", "Grass",
            "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy"]     # the GO/HOME block, top left of the sheet
OUT2 = os.path.join(ROOT, "resources", "typeicons")
mc = Image.open(MC).convert("RGBA")
os.makedirs(OUT2, exist_ok=True)
for i, t in enumerate(MC_ORDER):
    x, y = 1 + (i % 6) * 21, 11 + (i // 6) * 21
    mc.crop((x, y, x + 20, y + 20)).save(os.path.join(OUT2, t + ".png"), optimize=True)
print(f"{len(MC_ORDER)} square type icons in resources/typeicons/")
