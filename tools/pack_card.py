#!/usr/bin/env python3
"""Build the Trainer Card pictures from the owner's FireRed/LeafGreen Trainer Card kit.

Reads resources/trainer card kit/<the sheet>.png and writes resources/card/:
  front0..4.png, back0..4.png   empty cards (228 x 148) for 0-4 stars: blue, green, bronze, silver, gold
  badge1..8.png                 the eight Gym Badges (16 x 16, transparent)
The kit's cards come filled in for Red, so the blue ones are cleaned (text, ID number and Red himself taken off,
the arc behind him restored from the kit's blank backgrounds) and the other four colours are made by swapping the
blue card's palette for theirs (the GBA cards are palette swaps), with their stars copied over.
The game writes the Trainer's own details on top (SCREENS.settings in src/a9c_meta.js). build.sh embeds resources/card/*.png.
"""
import os
from collections import Counter, defaultdict
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "trainer card kit", "Game Boy Advance - Pokemon FireRed _ LeafGreen - Menu Elements - Trainer Card Kit.png")
OUT = os.path.join(ROOT, "resources", "card")
CW, CH = 228, 148                                   # a card, border included

im = Image.open(SHEET).convert("RGBA")
def card(col, row):                                 # col 0 = Red's front, 1 = his back; rows = 0-4 stars
    x, y = 14 + 242 * col, 48 + 162 * row
    return im.crop((x, y, x + CW, y + CH))

def fill_from_column(c, x0, x1, y0, y1, src_x):
    """Paint over x0..x1 on rows y0..y1 with each row's colour at src_x (the card's stripes run sideways)."""
    px = c.load()
    for y in range(y0, y1 + 1):
        col = px[src_x, y]
        for x in range(x0, x1 + 1):
            px[x, y] = col

def round_corners(c):
    """The kit draws the cards on a teal mat: make the mat outside the rounded corners transparent."""
    px = c.load()
    for y in range(CH):
        for x in range(CW):
            if (x < 6 or x > CW - 7) and (y < 6 or y > CH - 7):
                r, g, b, a = px[x, y]
                if (r, g, b) in MAT:
                    px[x, y] = (0, 0, 0, 0)


MAT = {p[:3] for p in (im.getpixel((9, 44)), im.getpixel((10, 45)), im.getpixel((8, 42)), im.getpixel((9, 43)))}

# ---- the blue front, cleaned
front = card(0, 0)
for y0, y1 in ((33, 45), (58, 71), (76, 88), (91, 104)):          # NAME, MONEY, (Pokédex), TIME: labels and values
    fill_from_column(front, 19, 142, y0, y1, 19)
fill_from_column(front, 133, 214, 13, 23, 133)                    # inside the ID No. box
front.paste(im.crop((565, 872, 645, 952)), (146, 34))             # the blank arc where Red stood
# ---- the blue back, cleaned (the name after "TRAINER:")
back = card(1, 0)
fill_from_column(back, 136, 216, 15, 24, 136)
round_corners(front); round_corners(back)

def palette_map(src, dst):
    """Colour in the blue card -> colour in the other card, by majority over every pixel (text and sprites are outvoted)."""
    votes = defaultdict(Counter)
    s, d = src.load(), dst.load()
    for y in range(CH):
        for x in range(CW):
            votes[s[x, y]][d[x, y]] += 1
    return {k: v.most_common(1)[0][0] for k, v in votes.items()}

def recolour(c, m):
    out = c.copy(); px = out.load()
    for y in range(CH):
        for x in range(CW):
            px[x, y] = m.get(px[x, y], px[x, y])
    return out

os.makedirs(OUT, exist_ok=True)
raw_front, raw_back = card(0, 0), card(1, 0)
for k in range(5):
    if k == 0:
        f, b = front.copy(), back.copy()
    else:
        f = recolour(front, palette_map(raw_front, card(0, k)))
        b = recolour(back, palette_map(raw_back, card(1, k)))
        f.paste(card(0, k).crop((96, 48, 146, 58)), (96, 48))      # its stars, above MONEY
    f.save(os.path.join(OUT, f"front{k}.png"), optimize=True)
    b.save(os.path.join(OUT, f"back{k}.png"), optimize=True)

# ---- the Gym Badges: 16 x 16 each, 18 px apart, on the kit's orange key colour
KEY = (255, 127, 39, 255)
for i in range(8):
    b = im.crop((8 + 18 * i, 858, 24 + 18 * i, 874))
    px = b.load()
    for y in range(16):
        for x in range(16):
            if px[x, y] == KEY:
                px[x, y] = (0, 0, 0, 0)
    b.save(os.path.join(OUT, f"badge{i + 1}.png"), optimize=True)
print("Trainer Card: 5 fronts, 5 backs and 8 Gym Badges in resources/card/")
