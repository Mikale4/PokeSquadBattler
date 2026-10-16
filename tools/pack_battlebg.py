#!/usr/bin/env python3
"""Cut Pokémon Platinum's battle backgrounds and platforms (ripped by Sunday-Domeko) for the 3D battle scene.

Reads resources/battle backgrounds/<the Platinum sheet>.png and writes resources/battle/:
  <bg>.png / <bg>_<time>.png        a background, 256 x 152 (time: day, afternoon or night, for the outdoor ones)
  <pf>_pf.png / <pf>_<time>_pf.png  a platform: the far one of its pair (a whole flattened ellipse), cut out with a transparent
                                    surround; the renderer puts one under every Pokémon
  battle.json                       each background's horizon row (where the ground meets the sky or the wall): the renderer
                                    sets that row on the 3D horizon
build.sh embeds them; ENVS / BB_SCENE / BB_E4 in src/a8a_render.js pick a background and platform per environment.
"""
import json, os
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "battle backgrounds", "DS _ DSi - Pokemon Platinum - Backgrounds - Battle Backgrounds.png")
OUT = os.path.join(ROOT, "resources", "battle")
T3 = lambda k: [k + "_day", k + "_afternoon", k + "_night"]
# backgrounds: three to a row, 256 x 152 under a label, rows 168 px apart (left half of the sheet)
BG = [T3("field"), T3("surf"), T3("city"), T3("forest"), T3("rocky"), T3("snow"), ["indoor1", "indoor2", "indoor3"], ["cave1", "cave2", "cave3"],
      ["aaron", "bertha", "flint"], ["lucian", "cynthia", "distortion"], ["tower", "factory", "arcade"], ["castle", "hall", None]]
# their horizon rows (read off the pictures)
HZ = {"field": 50, "surf": 58, "city": 55, "forest": 55, "rocky": 50, "snow": 44, "indoor": 60, "cave": 48, "aaron": 56, "bertha": 56, "flint": 58,
      "lucian": 56, "cynthia": 48, "distortion": 56, "tower": 64, "factory": 64, "arcade": 64, "castle": 64, "hall": 64}
# platforms: three to a row, 256 x 96 cells (right half): a label, the far platform, then the near one
PF = [T3("grass"), T3("water"), T3("path"), T3("ice"), T3("rocky"), T3("snow"), T3("sand"), T3("mud"), T3("wetpath"),
      ["cave", "indoor", "aaron"], ["bertha", "flint", "lucian"], ["cynthia", "distortion", "tower"], ["factory", "arcade", "castle"], ["hall", None, None]]

im = Image.open(SHEET).convert("RGBA"); px = im.load()
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):   # (this folder is ours: start clean)
    os.remove(os.path.join(OUT, f))
hz = {}
for r, row in enumerate(BG):
    for c, name in enumerate(row):
        if not name: continue
        im.crop((256 * c, 16 + 168 * r, 256 * c + 256, 16 + 168 * r + 152)).save(os.path.join(OUT, name + ".png"), optimize=True)
        hz[name.split("_")[0]] = HZ[name.split("_")[0].rstrip("123")]
white = lambda c: c[3] < 20 or min(c[:3]) >= 248
for r, row in enumerate(PF):
    for c, name in enumerate(row):
        if not name: continue
        x0, y0 = 768 + 256 * c, 8 + 96 * r
        # the far platform: everything that isn't the white page between its label and the near platform
        pts = [(x, y) for y in range(y0 + 10, y0 + 54) for x in range(x0, x0 + 256) if not white(px[x, y])]
        bx0, by0, bx1, by1 = min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)
        pf = im.crop((bx0, by0, bx1 + 1, by1 + 1)); pp = pf.load(); w, h = pf.size
        # the page round it goes: flood in from the edges over white (the platform's outline stops it)
        seen = [[False] * w for _ in range(h)]
        q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
        while q:
            x, y = q.popleft()
            if not (0 <= x < w and 0 <= y < h) or seen[y][x] or not white(pp[x, y]): continue
            seen[y][x] = True; pp[x, y] = (0, 0, 0, 0)
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
        pf.save(os.path.join(OUT, name + "_pf.png"), optimize=True)
        print(f"{name}: platform {w} x {h}")
json.dump(hz, open(os.path.join(OUT, "battle.json"), "w"), indent=1)
print(len(hz), "backgrounds")
