#!/usr/bin/env python3
"""Cut the Poké Balls out of the owner's sheets in resources/pokeballs + animations.

  FireRed/LeafGreen battle balls (12 balls x 3 frames: closed, opening, open) -> resources/balls/<kind>0.png, 1.png, 2.png
    for the six the game throws (drawBall in src/a5_sprites.js: send-outs and the Safari Zone catch)
  OneWingedNatu's overworld item ball (the red one, with its ground shadow) -> resources/balls/item.png, on a 16 x 16 square
    (the Journey's item stops)
build.sh embeds resources/balls/*.png.
"""
import os
from collections import Counter
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "resources", "pokeballs + animations")
OUT = os.path.join(ROOT, "resources", "balls")
os.makedirs(OUT, exist_ok=True)

def keyed(im):
    """Make the sheet's background colour (its most common one) transparent."""
    im = im.convert("RGBA"); px = im.load()
    key = Counter(px[x, y] for x in range(im.width) for y in range(im.height)).most_common(1)[0][0]
    for y in range(im.height):
        for x in range(im.width):
            if px[x, y] == key:
                px[x, y] = (0, 0, 0, 0)
    return im

frlg = keyed(Image.open(os.path.join(DIR, "Game Boy Advance - Pokemon FireRed _ LeafGreen - Battle Effects - Poke Balls.png")))
COLS = {"safari": 1, "poke": 2, "great": 3, "ultra": 5, "master": 6, "premier": 11}     # the sheet's 12 columns, 16 px apart
ROWS = [(21, 12), (38, 13), (55, 16)]                                                    # closed, opening, open: top row and height
for kind, c in COLS.items():
    for f, (y, h) in enumerate(ROWS):
        frlg.crop((2 + 16 * c, y, 14 + 16 * c, y + h)).save(os.path.join(OUT, f"{kind}{f}.png"), optimize=True)
    sw = frlg.getpixel((2 + 16 * c + 6, 14))
    print(f"{kind}: burst colour #{sw[0]:02x}{sw[1]:02x}{sw[2]:02x}")

ow = keyed(Image.open(os.path.join(DIR, "Custom _ Edited - Pokemon Customs - Miscellaneous - Overworld Pokeballs.png")))
# the right-hand set has ground shadows; its first ball is the classic red one
px = ow.load()
seen, stack = set(), [(265, 9)]                     # inside that ball: take everything joined to it (ball and shadow)
while stack:
    x, y = stack.pop()
    if (x, y) in seen or not (0 <= x < ow.width and 0 <= y < ow.height) or not px[x, y][3]:
        continue
    seen.add((x, y)); stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
x0, y0, x1, y1 = min(p[0] for p in seen), min(p[1] for p in seen), max(p[0] for p in seen), max(p[1] for p in seen)
ball = ow.crop((x0, y0, x1 + 1, y1 + 1))
sq = Image.new("RGBA", (16, 16), (0, 0, 0, 0)); sq.alpha_composite(ball, ((16 - ball.width) // 2, 16 - ball.height))
sq.save(os.path.join(OUT, "item.png"), optimize=True)
print(f"item ball {ball.width} x {ball.height}")
