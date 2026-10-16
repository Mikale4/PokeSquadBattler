#!/usr/bin/env python3
"""The chat emotes: HeartGold/SoulSilver's Emotions (ripped by Lemon), from resources/extras/.

The sheet has three rows of speech-bubble emotes, two animation frames each (15 x 16, at x 4/20, 38/54, 72/88, 106/122 and
y 4, 21, 38; the last, a still "!", is one frame). Writes resources/emotes/emotes.png: one 16 x 16 row per emote, its two frames
side by side (32 x 192), the orange page cleared. build.sh embeds it; EMOTES in src/a9h_social.js names them in this order.
"""
import os
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "resources", "extras", "DS _ DSi - Pokemon HeartGold _ SoulSilver - Miscellaneous - Emotions.png")
OUT = os.path.join(ROOT, "resources", "emotes")
NAMES = ["dots", "note", "happy", "grumpy", "exclaim", "heart", "laugh", "angry", "question", "sick", "sad", "alert"]

im = Image.open(SHEET).convert("RGBA")
page = im.getpixel((0, 0))
def cut(x, y, w, h):
    c = Image.new("RGBA", (16, 16), page); c.alpha_composite(im.crop((x, y, x + w, y + h)), ((16 - w) // 2, 16 - h))
    px = c.load(); seen = set(); q = deque([(i, j) for i in range(16) for j in (0, 15)] + [(i, j) for j in range(16) for i in (0, 15)])
    while q:
        i, j = q.popleft()
        if not (0 <= i < 16 and 0 <= j < 16) or (i, j) in seen or px[i, j] != page: continue
        seen.add((i, j)); px[i, j] = (0, 0, 0, 0); q.extend(((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)))
    return c
out = Image.new("RGBA", (32, 16 * len(NAMES)), (0, 0, 0, 0))
for n, name in enumerate(NAMES):
    r, c = divmod(n, 4)
    if name == "alert": a = b = cut(106, 39, 14, 14)
    else: a, b = cut([4, 38, 72, 106][c], 4 + 17 * r, 15, 16), cut([20, 54, 88, 122][c], 4 + 17 * r, 15, 16)
    out.alpha_composite(a, (0, 16 * n)); out.alpha_composite(b, (16, 16 * n))
os.makedirs(OUT, exist_ok=True)
out.save(os.path.join(OUT, "emotes.png"), optimize=True)
print("emotes.png", out.size)
