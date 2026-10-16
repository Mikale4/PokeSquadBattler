"""Trainers in pictures, cut from the owner's player sheets in resources/player sprites (the only pictures the player, the
Demo and the server's Trainers may use, the owner's rule):
- every character's front picture (FRONTS: the games' battle front, or the standing picture on sheets without one):
  resources/players/<look>.png. build.sh puts these in front of every other trainer picture of that name, so the Trainer
  Card, the avatars and the Trainers you battle all show them. You and the Demo are Red or Leaf for now; the server's
  Trainers can be any of them (DOC_SPR in a6b_ladder.js).
- the back in battle: the games' own battle back picture, standing, then the Poké Ball throw, played by the battle when your
  trainer throws.
  Red and Leaf (the only player looks for now, the owner's rule): FireRed/LeafGreen, 5 frames in 64 x 64 cells
  Kept for later, switched off (LATER): Lucas and Dawn (Diamond/Pearl, 5 frames), May (Ruby/Sapphire, 4 frames in 64 x 64 cells),
  Brendan (Ruby/Sapphire, 3 frames: standing, hand up, arm back). Move them into LOOKS to bring them back.
Writes resources/backs/<look>.png (frames side by side, bottoms aligned) and resources/backs/backs.json ({look: {n, w, h}}).
Looks without one here use their overworld walking sprite facing away (resources/home/players, tools/pack_home.py).
The background is the backdrop colour: flood-filled from each frame's edge, and for the front pictures every pocket of
the exact backdrop colour too (between an arm and the body); the sprites' own whites are other colours (Dawn's hat stays). Frames in the games' fixed cells keep their place; loose frames are lined up by the middle of the body at
their lower edge, so only the arm moves when the ball is thrown."""
import json, os
from collections import Counter, deque
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "resources", "player sprites")
OUT = os.path.join(HERE, "..", "resources", "backs")
FRLG = "Pokemon Trainers Red and Leaf.png"   # (the FireRed/LeafGreen Player Sprites sheet)
# look: (sheet, frames as (x0, y0, x1, y1), "cells" (fixed boxes, kept as they are) or "loose" (lined up by the body))
LOOKS = {
    "red": (FRLG, [(8 + 65 * i, 225, 72 + 65 * i, 289) for i in range(5)], "cells"),
    "leaf": (FRLG, [(8 + 65 * i, 492, 72 + 65 * i, 556) for i in range(5)], "cells"),
}
# (LATER's sheets had the old names; the owner's folder now names them "Pokemon Trainer <name>.png": check each when bringing it back)
DP = "Pokemon Trainer {} (Diamond and Pearl).png"
RS = "Game Boy Advance - Pokemon Ruby _ Sapphire - Playable Characters - {}.png"
LATER = {
    "dawn": (DP.format("Dawn"), [(303, 392, 365, 459), (369, 392, 431, 459), (435, 392, 509, 459), (513, 392, 598, 459), (602, 392, 684, 459)], "loose"),
    "lucas": (DP.format("Lucas"), [(303, 392, 356, 459), (360, 392, 427, 459), (431, 392, 504, 459), (508, 392, 585, 459), (589, 392, 664, 459)], "loose"),
    "brendan": (RS.format("Brendan"), [(17, 405, 69, 467), (70, 405, 137, 467), (138, 405, 181, 467)], "loose"),   # (the arm-and-ball piece beside the 3rd isn't a frame)
    "may": (RS.format("May"), [(90 + 65 * i, 53, 154 + 65 * i, 117) for i in range(4)], "cells"),
}

def cut(im, box):
    """the frame with its backdrop made transparent: flood-filled from the frame's edges in the backdrop colour"""
    fr = im.crop(box); px = fr.load(); W, H = fr.size
    ref = px[0, 0]; near = lambda c: sum(abs(c[i] - ref[i]) for i in range(3)) < 30
    seen = [[False] * W for _ in range(H)]
    q = deque([(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)])
    while q:
        x, y = q.popleft()
        if not (0 <= x < W and 0 <= y < H) or seen[y][x] or not near(px[x, y]): continue
        seen[y][x] = True; px[x, y] = (0, 0, 0, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    # backdrop enclosed by the sprite (between an arm and the body): the backdrop colour exactly. (Dawn's white hat is
    # (232, 232, 248) on a pure white sheet, so a tight match leaves it alone.)
    for y in range(H):
        for x in range(W):
            c = px[x, y]
            if c[3] and sum(abs(c[i] - ref[i]) for i in range(3)) < 10: px[x, y] = (0, 0, 0, 0)
    return fr

def anchor(fr):
    """the middle of the body: the mean x of the bottom rows (the torso, where the picture is cut off)"""
    px = fr.load(); bb = fr.getbbox(); xs = []
    for y in range(max(bb[1], bb[3] - 6), bb[3]):
        xs += [x for x in range(fr.width) if px[x, y][3]]
    return sum(xs) / len(xs) if xs else fr.width / 2

# each character's front picture: Red and Leaf's cell on their sheet (FireRed/LeafGreen), the others the picture's own box
# (the backdrop is the colour round it). Brendan's Emerald sheet has a white text box, so only its magenta is the backdrop.
T = "Pokemon Trainer {}.png"
FRONTS = {
    "red": (FRLG, (601, 183, 665, 279), "cell"), "leaf": (FRLG, (601, 448, 665, 544), "cell"),
    "ashkanto": (T.format("Ash (Kanto)"), (120, 1, 191, 120)), "ashhoenn": (T.format("Ash (Hoenn)"), (111, 0, 181, 114)),
    "ashsinnoh": (T.format("Ash (Sinnoh)"), (124, 0, 204, 128)), "ashunova": (T.format("Ash (Unova)"), (116, 0, 212, 140)),
    "brendan": (T.format("Brendan"), (7, 146, 43, 201), [(255, 0, 228, 255)]), "brendanoras": (T.format("Brendan (ORAS)"), (274, 242, 346, 380)),
    "may": (T.format("May"), (20, 61, 57, 116)), "mayoras": (T.format("May (ORAS)"), (270, 246, 342, 380)),
    "ethan": (T.format("Ethan"), (462, 43, 501, 122)), "kris": (T.format("Kris"), (461, 45, 495, 122)), "lyra": (T.format("Lyra"), (130, 0, 200, 128)),
    "lucas": (T.format("Lucas (Diamond and Pearl)"), (95, 401, 139, 509)), "dawn": (T.format("Dawn (Diamond and Pearl)"), (227, 398, 275, 510)),
    "nate": (T.format("Nate"), (22, 172, 106, 286)), "n": (T.format("N"), (396, 64, 502, 192)),
    "calem": (T.format("Calem"), (120, 0, 210, 128)), "serena": (T.format("Serena"), (128, 0, 202, 128)), "elio": (T.format("Elio"), (132, 0, 198, 128)),
}
def cut_front(im, box, bg=None):
    """the picture in its tight box, the backdrop (the colours round the box, or the ones given) flood-filled in from the edges"""
    x0, y0, x1, y1 = box; px = im.load(); W, H = im.size
    if bg is None:
        ring = [px[x, y] for x in range(x0 - 1, x1 + 1) for y in (y0 - 1, y1) if 0 <= x < W and 0 <= y < H]
        ring += [px[x, y] for y in range(y0, y1) for x in (x0 - 1, x1) if 0 <= x < W and 0 <= y < H]
        bg = [c for c, n in Counter(ring).items() if n > len(ring) * .1]
    fr = im.crop(box); p = fr.load(); w, h = fr.size
    isbg = lambda c: c[3] < 20 or tuple(c) in set(map(tuple, bg))
    seen = [[False] * w for _ in range(h)]
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y][x] or not isbg(p[x, y]): continue
        seen[y][x] = True; p[x, y] = (0, 0, 0, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    # the backdrop colour the edges can't reach (between an arm and the body, between the legs) goes too: the sheets' own whites
    # are other colours (Dawn's hat is a lavender white, her backdrop pure white), so only the exact backdrop colour is cleared
    for y in range(h):
        for x in range(w):
            if p[x, y][3] and isbg(p[x, y]): p[x, y] = (0, 0, 0, 0)
    return fr
FRONT_OUT = os.path.join(HERE, "..", "resources", "players")
os.makedirs(FRONT_OUT, exist_ok=True)
for look, (sheet, box, *how) in FRONTS.items():
    im = Image.open(os.path.join(SRC, sheet)).convert("RGBA")
    fr = cut(im, box) if how and how[0] == "cell" else cut_front(im, box, how[0] if how else None)
    fr = fr.crop(fr.getbbox())
    fr.save(os.path.join(FRONT_OUT, look + ".png"), optimize=True)
    print(look, "front", fr.size)

os.makedirs(OUT, exist_ok=True)
meta = {}
for look, (sheet, frames, kind) in LOOKS.items():
    im = Image.open(os.path.join(SRC, sheet)).convert("RGBA")
    cuts = [cut(im, f) for f in frames]
    if kind == "loose":
        cuts = [c.crop(c.getbbox()) for c in cuts]
        a = [anchor(c) for c in cuts]
        # the body in the middle of the frame (the battle centres frames on the trainer's spot), the arm free to reach out
        half = max(max(a), max(c.width - x for c, x in zip(cuts, a)))
        w, h = int(2 * half + .5) + 2, max(c.height for c in cuts)
        place = [(int(half - x + .5) + 1, h - c.height) for c, x in zip(cuts, a)]
    else:
        w, h = max(c.width for c in cuts), max(c.height for c in cuts)
        place = [((w - c.width) // 2, h - c.height) for c in cuts]
    strip = Image.new("RGBA", (w * len(cuts), h), (0, 0, 0, 0))
    for i, (c, (dx, dy)) in enumerate(zip(cuts, place)): strip.alpha_composite(c, (i * w + dx, dy))
    # trim empty rows at the bottom, so the picture's lower edge stands on the ground
    bb = strip.getbbox(); strip = strip.crop((0, 0, strip.width, bb[3]))
    strip.save(os.path.join(OUT, look + ".png"), optimize=True)
    meta[look] = {"n": len(cuts), "w": w, "h": strip.height}
    print(look, meta[look])
json.dump(meta, open(os.path.join(OUT, "backs.json"), "w"), indent=1)
