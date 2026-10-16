#!/usr/bin/env python3
"""The battle HUD: Black 2/White 2's HP bars (ripped by GameMaster12), from resources/UI/.

Writes resources/hud/hud.png (the sheet with its olive page and the level digits' green boxes cleared) and resources/hud/hud.json,
where each piece is on it ([x, y, w, h]):
  frame.foe / frame.ally   the Black 2 (dark) and White 2 (light) HP bar frames without EXP, 104 x 12 with their shadow;
                           slot: the HP gauge inside a frame (x, y from the frame's corner, w, h)
  lv                       the "Lv" mark (Black 2's and White 2's)
  core.*                   the gauges' coloured middle rows: green, yellow, red, empty (HP) and exp, expEmpty
  status.*                 SLP, PSN, TOX (the dark PSN), BRN, FRZ, PAR
  lvDigits                 the level numbers 0-9; font: the name font, character by character
build.sh embeds both; drawOverhead in src/a8a_render.js draws them.
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "UI", "DS _ DSi - Pokemon Black 2 _ White 2 - Miscellaneous - HP Bars.png")
OUT = os.path.join(ROOT, "resources", "hud")

im = Image.open(SHEET).convert("RGBA"); px = im.load()
page = px[0, 0]
for y in range(im.height):
    for x in range(im.width):
        c = px[x, y]
        if c == page or (y >= 164 and y < 177 and x >= 170 and c[:3] == (0, 255, 33)): px[x, y] = (0, 0, 0, 0)
os.makedirs(OUT, exist_ok=True)
im.save(os.path.join(OUT, "hud.png"), optimize=True)

def runs(spec, y, h):
    return [[a, y, b - a, h] for a, b in spec]
font = {}
for chars, y, spec in [
    ("0123456789:;<=?@", 169, [(12, 17), (18, 22), (23, 28), (29, 34), (35, 40), (41, 46), (47, 52), (53, 58), (59, 64), (65, 70), (71, 75), (76, 80), (81, 86), (87, 92), (93, 98), (99, 104)]),
    ("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 179, [(12, 17), (18, 23), (24, 29), (30, 35), (36, 41), (42, 47), (48, 53), (54, 59), (61, 64), (66, 71), (72, 77), (78, 83), (84, 89), (90, 95), (96, 101), (102, 107), (108, 113), (114, 119), (120, 125), (126, 131), (132, 137), (138, 143), (144, 149), (150, 155), (156, 161), (162, 167)]),
    ("abcdefghijklmnopqrstuvwxyz", 189, [(12, 17), (18, 23), (24, 29), (30, 35), (36, 41), (42, 47), (48, 53), (54, 59), (61, 64), (66, 71), (72, 77), (78, 82), (84, 89), (90, 95), (96, 101), (102, 107), (108, 113), (114, 119), (120, 125), (126, 131), (132, 137), (138, 143), (144, 149), (150, 155), (156, 161), (162, 167)]),
    ("'()*+,", 199, [(74, 78), (79, 83), (84, 88), (89, 94), (95, 100), (101, 105)]),
    ("-./", 210, [(12, 16), (17, 21), (22, 27)]),
    ("♂♀", 210, [(69, 76), (77, 84)]),
]:
    for ch, b in zip(chars, runs(spec, y, 9 if y < 199 else 9)):
        font[ch] = b
meta = {
    "frame": {"foe": [144, 47, 104, 12], "ally": [144, 87, 104, 12], "slot": [38, 2, 48, 3]},
    "lv": {"foe": [222, 40, 8, 7], "ally": [222, 80, 8, 7]},
    "core": {"empty": [16, 112, 42, 3], "red": [67, 112, 42, 3], "yellow": [16, 118, 42, 3], "green": [67, 118, 42, 3], "exp": [16, 124, 74, 2], "expEmpty": [16, 129, 74, 2]},
    "status": {k: [122 + 20 * j, 123, 19, 6] for j, k in enumerate(["SLP", "PSN", "TOX", "BRN", "FRZ", "PAR"])},
    "lvDigits": [[a, 166, b - a, 9] for a, b in [(172, 179), (180, 184), (185, 192), (193, 200), (201, 209), (210, 217), (218, 225), (226, 233), (234, 241), (242, 249)]],
    "font": font,
}
json.dump(meta, open(os.path.join(OUT, "hud.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("hud.png", im.size, len(font), "glyphs")
