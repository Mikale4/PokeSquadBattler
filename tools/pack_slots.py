#!/usr/bin/env python3
"""The Game Corner slot machine: HeartGold/SoulSilver's Japanese slots (ripped by Smol_Sanston), from resources/extras/.

Cuts the sheet into resources/slots/slots.png (one atlas) and resources/slots/slots.json (where each piece is, [x, y, w, h];
lists are frames or cells in order):
  top            the top screen (the TV, its ROUND / GET counters and big digits), 256 x 192
  bot            the bottom screen, lamps off and lit (its Japanese captions cleared: the game writes its own)
  success, starterBg   the TV's backdrops for a win and for the Starter Bonus (224 x 128, two frames each)
  main, happyA, happyB the TV's scrolling backdrops (256 x 256, two shades each)
  big, small     the lit digits: cell 0 unlit, then 0-9 (small: cells 0-1 unlit, then 0-9)
  grid           the reel windows' shading; cards: the Starter Bonus cards (Chikorita, Totodile, Cyndaquil)
  canvas, smeargle (3 frames: painting, brush up, turned round), draw (Smeargle's paintings: 10 in colour, then 10 in
                 pencil: Replay, Pikachu, Marill, Berries, Poke Ball, 7, Chikorita, Cyndaquil, Totodile, then blank / scribble)
  emote          Smeargle's bubbles: sad, miss, happy, angry, note, scribble, excited, alert
  panel          the reel symbols: Berries, Pikachu, 7, Marill, Replay (32 x 24)
  starter        the Starter Bonus reels: for each starter (Chikorita, Totodile, Cyndaquil) its three strips (32 x 120)
  font           the HP-bar font from resources/hud (pack_hud.py), redrawn in the machine's yellow-green with its shadow
  layout         where things sit on the screens (from the sheet's own example)
build.sh embeds both; src/a9j_slots.js draws the machine.
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "extras", "DS _ DSi - Pokemon HeartGold _ SoulSilver - Miscellaneous - Casino Slots (Japanese Version).png")
OUT = os.path.join(ROOT, "resources", "slots")
im = Image.open(SHEET).convert("RGBA")
BAR, LIT, SHADE = (41, 41, 41, 255), (198, 255, 41, 255), (123, 165, 49, 255)

PAGE = im.getpixel((0, 0))
def cut(x, y, w, h):
    c = im.crop((x, y, x + w, y + h)); px = c.load()
    for j in range(h):
        for i in range(w):
            if px[i, j] == PAGE: px[i, j] = (0, 0, 0, 0)   # (the sheet's teal page, where a crop reaches past a sprite)
    return c
def bottom(x, y):
    # the bottom screen with its Japanese captions cleared (the banner; and the words beside the D-pad and A icons)
    b = cut(x, y, 256, 192); px = b.load()
    for j in list(range(0, 14)) + list(range(172, 192)):
        for i in range(256):
            keep = j >= 172 and (i < 14 or 66 <= i < 78 or 128 <= i < 143)
            if not keep and px[i, j] in (LIT, SHADE): px[i, j] = BAR
    return b
pieces = {
    "top": [cut(16, 21, 256, 192)],
    "bot": [bottom(16, 229), bottom(288, 229)],
    "success": [cut(576, 21, 224, 128), cut(576, 165, 224, 128)],
    "starterBg": [cut(576, 325, 224, 128), cut(576, 469, 224, 128)],
    "main": [cut(9, 974, 256, 256), cut(9, 1246, 256, 256)],
    "happyA": [cut(281, 974, 256, 256), cut(281, 1246, 256, 256)],
    "happyB": [cut(553, 750, 256, 256), cut(553, 1022, 256, 256)],
    "big": [cut(16 + 16 * k, 501, 14, 23) for k in range(11)],
    "small": [cut(16 + 8 * k, 549, 6, 11) for k in range(12)],
    "grid": [cut(208 + 40 * k, 501, 32, 72) for k in range(3)],
    "cards": [cut(432 + 34 * k, 517, 32, 51) for k in range(3)],
    "canvas": [cut(245, 600, 80, 77)],
    "smeargle": [cut(5 + 80 * k, 613, 76, 64) for k in range(3)],
    "draw": [cut(331 + 48 * c, 629 + 48 * r, 48, 48) for r in range(2) for c in range(10)],
    "emote": [cut(5 + 32 * k, 693, 32, 32) for k in range(8)],
    "panel": [cut(32 + 48 * k, 754, 32, 24) for k in range(5)],
    "starter": [cut(141 + 128 * s + 40 * r, 810, 32, 120) for s in range(3) for r in range(3)],
}
# the font: the HP bars' white letters in the machine's colours, a shadow down and right
hud = Image.open(os.path.join(ROOT, "resources", "hud", "hud.png")).convert("RGBA")
hm = json.load(open(os.path.join(ROOT, "resources", "hud", "hud.json"), encoding="utf-8"))
glyphs = []
for ch, (x, y, w, h) in hm["font"].items():
    g = hud.crop((x, y, x + w, y + h)); gp = g.load()
    lit = {(i, j) for j in range(h) for i in range(w) if gp[i, j][3] and min(gp[i, j][:3]) > 200}
    o = Image.new("RGBA", (w + 1, h + 1), (0, 0, 0, 0)); op = o.load()
    for i, j in lit:
        if (i + 1, j + 1) not in lit: op[i + 1, j + 1] = SHADE
    for i, j in lit: op[i, j] = LIT
    glyphs.append((ch, o))
# shelf-pack everything into one atlas, 512 wide
items = [(k, n, p) for k, lst in pieces.items() for n, p in enumerate(lst)] + [("font", ch, g) for ch, g in glyphs]
items.sort(key=lambda t: -t[2].height)
W, x, y, row, pos = 512, 0, 0, 0, []
for k, n, p in items:
    if x + p.width > W: x, y, row = 0, y + row, 0
    pos.append((k, n, p, x, y)); x += p.width; row = max(row, p.height)
atlas = Image.new("RGBA", (W, y + row), (0, 0, 0, 0))
meta = {k: [None] * len(v) for k, v in pieces.items()}; meta["font"] = {}
for k, n, p, x, y in pos:
    atlas.alpha_composite(p, (x, y))
    if k == "font": meta["font"][n] = [x, y, p.width - 1, p.height - 1]
    else: meta[k][n] = [x, y, p.width, p.height]
meta["layout"] = {
    "tv": [18, 18, 220, 123], "bg": [16, 16],                     # the TV's window; where its 224 x 128 backdrops sit
    "smeargle": [38, 84], "canvas": [90, 64], "draw": [106, 71], "emote": [64, 50], "cards": [137, 18, 34],
    "reels": [72, 48], "reelGap": 40, "panelH": 24,               # the reel windows on the bottom screen: 32 x 72, three rows
    # digit cells: ROUND (two, a slash, two) and GET on the top screen, its big pair; CREDIT and PAYOUT on the bottom one
    "round": [[73, 154], [81, 154], [97, 154], [105, 154]], "get": [[57, 170], [65, 170], [73, 170]], "bigDigits": [[185, 156], [201, 156]],
    "credit": [[81 + 8 * k, 146] for k in range(5)], "payout": [[185 + 8 * k, 146] for k in range(5)],
    "banner": [128, 3], "keys": [[16, 179, "BET"], [80, 179, "START"], [145, 179, "STOP"]],
}
os.makedirs(OUT, exist_ok=True)
atlas.save(os.path.join(OUT, "slots.png"), optimize=True)
json.dump(meta, open(os.path.join(OUT, "slots.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("slots.png", atlas.size, sum(len(v) for v in pieces.values()), "pieces,", len(glyphs), "glyphs")
