#!/usr/bin/env python3
"""The Medal pictures: Black 2/White 2's Medals (ripped by redblueyellow), from resources/icons/.

The sheet has 24 rows of 32 px medals (eight a row, the winged rows four), every 34 px down on a blue page between teal bars:
six colours (bronze, blue, red, pink, gold, silver) of four rows each (round, winged, round, round). Writes
resources/medals/medals.png: the 24 rows stacked (256 x 768), the page cleared to transparent (flood-filled in from each cell's
edges, so a medal's own colours stay). build.sh embeds it; MEDAL_COL / MEDAL_DESIGN in src/a9c_meta.js pick a medal.
"""
import os
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "icons", "DS _ DSi - Pokemon Black 2 _ White 2 - Miscellaneous - Medals.png")
OUT = os.path.join(ROOT, "resources", "medals")

im = Image.open(SHEET).convert("RGBA")
page = im.getpixel((2, 2))
out = Image.new("RGBA", (256, 32 * 24), (0, 0, 0, 0))
for r in range(24):
    for c in range(8):
        cell = im.crop((2 + 32 * c, 2 + 34 * r, 34 + 32 * c, 34 + 34 * r)); px = cell.load()
        seen = [[False] * 32 for _ in range(32)]
        q = deque([(x, y) for x in range(32) for y in (0, 31)] + [(x, y) for y in range(32) for x in (0, 31)])
        while q:
            x, y = q.popleft()
            if not (0 <= x < 32 and 0 <= y < 32) or seen[y][x] or px[x, y] != page: continue
            seen[y][x] = True; px[x, y] = (0, 0, 0, 0)
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
        out.alpha_composite(cell, (32 * c, 32 * r))
os.makedirs(OUT, exist_ok=True)
out.save(os.path.join(OUT, "medals.png"), optimize=True)
print("medals.png", out.size)
