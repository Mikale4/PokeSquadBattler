#!/usr/bin/env python3
"""Build the home screen's overworld: the map scenes, the Pokémon walk sheets and the player walk cycles.

  tools/home_maps.json     which FireRed/LeafGreen map (resources/tilemaps) each scene crops, and the Journey stage that unlocks it
  tools/home_players.json  where each player look's walk cycle is on its sheet (resources/player sprites)
Writes resources/home/:
  maps/<key>.png      the scene, snapped to the map's own 16 px tile grid
  maps/<key>_over.png its tall things (buildings, trees, rock walls) alone, drawn over anyone standing behind them
  mons/<key>.png      the Pokémon's overworld walk sheet (resources/pokemon/overworld pokemon, drawn at double size there,
                      halved here to the maps' scale: 4 x 4 frames of 32 x 32, rows facing down, left, right, up)
  players/<look>.png  4 rows (down, up, left, right) of n frames, all one size, feet on the bottom edge, standing first
  home.json           per scene: name, size in tiles, walkable tiles, unlock; per look: frame size and count
build.sh embeds resources/home (src/a9i_home.js draws it).

Walkable tiles are worked out from the picture: the map's commonest ground colours (not water, not dark), plus sand and
paths, cover most of the tile and it has almost no dark outline pixels. Where that misses (textured cave floors,
paving, ice), home_maps.json gives sample ground tiles ("ground": [[x, y], ...]) and tiles with a similar colour mix count. Only the largest connected walkable area is kept;
home_maps.json can block or open tiles by hand.
"""
import colorsys, json, os, re
from collections import Counter
from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, "resources")
OUT = os.path.join(RES, "home")
for d in ("maps", "mons", "players"):
    os.makedirs(os.path.join(OUT, d), exist_ok=True)

# ---------- scenes ----------
def tiles(im, ox, oy, w, h):
    px = im.load()
    for ty in range(h // 16):
        for tx in range(w // 16):
            yield tx, ty, tuple(px[ox + tx * 16 + i, oy + ty * 16 + j] for j in range(16) for i in range(16))

def snap(im, x, y, w, h):
    """Shift the crop (0-14 px each way) to where its tiles repeat the most: that's the map's own tile grid."""
    best = None
    for dy in range(0, 16, 2):
        for dx in range(0, 16, 2):
            if x + dx + w > im.width or y + dy + h > im.height:
                continue
            c = Counter(hash(t) for _, _, t in tiles(im, x + dx, y + dy, w - 16, h - 16))
            score = sum(n for n in c.values() if n > 1)
            if not best or score > best[0]:
                best = (score, dx, dy)
    return x + best[1], y + best[2]

def walk_grid(im, ox, oy, w, h, refs=None):
    W, H = w // 16, h // 16
    tl = {(tx, ty): t for tx, ty, t in tiles(im, ox, oy, w, h)}
    dark = lambda t: sum(sum(p) < 200 for p in t) / 256
    if refs:
        # sample ground tiles given by hand: a tile is walkable when its colours mostly match one of them
        R = [Counter(tl[tuple(r)]) for r in refs]
        def like(t):
            c = Counter(t)
            return max(sum(min(n, r[k]) for k, n in c.items()) for r in R) / 256
        RC = set().union(*R)
        return [[dark(tl[(tx, ty)]) <= .06 and like(tl[(tx, ty)]) >= .72 for tx in range(W)] for ty in range(H)], lambda c: c in RC
    allpx = Counter(p for t in tl.values() for p in t); total = sum(allpx.values())
    def ok(c):   # ground can't be water, dark, or a roof's strong red, orange or purple (a big roof is a lot of pixels)
        if (c[2] > c[0] + 25 and c[2] > c[1] + 10) or sum(c) < 150: return False
        h, sat, v = colorsys.rgb_to_hsv(*(x / 255 for x in c[:3]))
        return not (sat > .5 and (h * 360 < 40 or h * 360 > 250))
    ground, cum = [], 0
    for c, n in allpx.most_common(60):
        if not ok(c): continue
        if n / total < .025: break
        ground.append(c); cum += n
        if cum / total > .72 or len(ground) >= 10: break
    G = set(ground)
    # sand and paths are yellowish (green nearly as strong as red); roofs' reds and oranges are not
    sand = lambda c: c[0] >= c[1] >= c[2] - 8 and c[1] >= .75 * c[0] and c[0] > 175 and c[2] < 175 and c[0] - c[2] > 30
    def walk(t):
        if sum(sum(p) < 200 for p in t) / 256 > .06: return False
        return sum(p in G for p in t) / 256 >= .82 or sum(sand(p) for p in t) / 256 >= .8
    return [[walk(tl[(tx, ty)]) for tx in range(W)] for ty in range(H)], lambda c: c in G or sand(c)

def occlusion(crop, grid, isground):
    """Tall things (buildings, trees, rock walls) cover whoever stands behind them. In each column, a run of two or more
    unwalkable tiles meets the ground at its bottom row: its base. The run's own pixels (not ground colours) go in an
    overlay that the home screen draws in depth order with the walkers. Water and one-row things (flowers, fences, signs)
    never cover anyone."""
    H, W = len(grid), len(grid[0]); cp = crop.load()
    over = Image.new("RGBA", crop.size, (0, 0, 0, 0)); op = over.load(); base = [[-1] * W for _ in range(H)]
    water = lambda c: c[2] > c[0] + 25 and c[2] > c[1] + 10
    for x in range(W):
        y = 0
        while y < H:
            if grid[y][x]: y += 1; continue
            y0 = y
            while y < H and not grid[y][x]: y += 1
            if y - y0 < 2: continue
            for ty in range(y0, y):
                px = [cp[x * 16 + i, ty * 16 + j] for j in range(16) for i in range(16)]
                if sum(water(p) for p in px) / 256 > .4: continue
                base[ty][x] = y - 1
                for j in range(16):
                    for i in range(16):
                        p = cp[x * 16 + i, ty * 16 + j]
                        if not isground(p[:3]): op[x * 16 + i, ty * 16 + j] = p
    return over, base

def largest_area(grid):
    H, W = len(grid), len(grid[0]); seen = set(); best = set()
    for y in range(H):
        for x in range(W):
            if not grid[y][x] or (x, y) in seen: continue
            comp, st = set(), [(x, y)]; seen.add((x, y))
            while st:
                cx, cy = st.pop(); comp.add((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < W and 0 <= ny < H and grid[ny][nx] and (nx, ny) not in seen:
                        seen.add((nx, ny)); st.append((nx, ny))
            if len(comp) > len(best): best = comp
    return [[(x, y) in best for x in range(W)] for y in range(H)]

cfg = json.load(open(os.path.join(ROOT, "tools", "home_maps.json"), encoding="utf-8"))
meta = {"maps": [], "players": {}, "alias": {}, "foot": {}, "wide": {}}
for m in cfg["maps"]:
    sheet = os.path.join(RES, "tilemaps", "Game Boy Advance - Pokemon FireRed _ LeafGreen - Maps (" + m["sheet"] + ".png")
    im = Image.open(sheet).convert("RGB")
    x, y, w, h = m["crop"]
    ox, oy = snap(im, x, y, w, h)
    grid, isground = walk_grid(im, ox, oy, w, h, m.get("ground"))
    for bx, by, bw, bh in m.get("open", []):
        for yy in range(by, by + bh):
            for xx in range(bx, bx + bw): grid[yy][xx] = True
    for bx, by, bw, bh in m.get("block", []):
        for yy in range(by, by + bh):
            for xx in range(bx, bx + bw): grid[yy][xx] = False
    grid = largest_area(grid)
    crop = im.crop((ox, oy, ox + w, oy + h)); crop.save(os.path.join(OUT, "maps", m["key"] + ".png"), optimize=True)
    over, base = occlusion(crop.convert("RGBA"), grid, isground)
    over.save(os.path.join(OUT, "maps", m["key"] + "_over.png"), optimize=True)
    meta["maps"].append({"key": m["key"], "n": m["n"], "w": w // 16, "h": h // 16, "unlock": m["unlock"],
                         "walk": ["".join("1" if c else "0" for c in row) for row in grid], "base": base})
    print(f"{m['key']:9s} {m['n']:16s} {w // 16}x{h // 16} tiles, {sum(map(sum, grid))} walkable")

# ---------- Pokémon ----------
_dex = open(os.path.join(ROOT, "src", "a3a_dex.js"), encoding="utf-8").read()
keys = re.findall(r'"k":"([a-z0-9]+)"', _dex)
FORM_OF = dict(re.findall(r'"k":"([a-z0-9]+)".*?"form":"([a-z0-9]+)"', _dex))
SPECIAL = {"nidoranf": "NIDORANfE", "nidoranm": "NIDORANmA",
           # forms: the pack numbers them after the species (Pokémon Essentials' form numbers); a form with no sheet of its own
           # (the battle-only Castform and Zen Darmanitan) borrows its species'
           "deoxysattack": "DEOXYS_1", "deoxysdefense": "DEOXYS_2", "deoxysspeed": "DEOXYS_3", "wormadamsandy": "WORMADAM_1",
           "wormadamtrash": "WORMADAM_2", "rotomheat": "ROTOM_1", "rotomwash": "ROTOM_2", "rotomfrost": "ROTOM_3", "rotomfan": "ROTOM_4",
           "rotommow": "ROTOM_5", "giratinaorigin": "GIRATINA_1", "shayminsky": "SHAYMIN_1", "tornadustherian": "TORNADUS_1",
           "thundurustherian": "THUNDURUS_1", "landorustherian": "LANDORUS_1", "kyuremblack": "KYUREM_1", "kyuremwhite": "KYUREM_2",
           "meloettapirouette": "MELOETTA_1", "castformsunny": "CASTFORM", "castformrainy": "CASTFORM", "castformsnowy": "CASTFORM",
           "darmanitanzen": "DARMANITAN"}
# generations 6 to 9: the regional forms are the species' form 1 (Meowth: 1 Alolan, 2 Galarian; Darmanitan: 2 Galarian), then the rest
for k in """rattata raticate raichu sandshrew sandslash vulpix ninetales diglett dugtrio meowth persian geodude graveler golem grimer muk exeggutor
marowak""".split():
    SPECIAL[k + "alola"] = k.upper() + "_1"
for k in """ponyta rapidash slowpoke slowbro farfetchd weezing mrmime articuno zapdos moltres slowking corsola zigzagoon linoone darumaka yamask
stunfisk""".split():
    SPECIAL[k + "galar"] = k.upper() + "_1"
for k in """growlithe arcanine voltorb electrode typhlosion qwilfish sneasel samurott lilligant zorua zoroark braviary sliggoo goodra avalugg
decidueye""".split():
    SPECIAL[k + "hisui"] = k.upper() + "_1"
SPECIAL.update({"meowthgalar": "MEOWTH_2", "darmanitangalar": "DARMANITAN_2", "darmanitangalarzen": "DARMANITAN_3", "taurospaldeacombat": "TAUROS_1",
    "taurospaldeablaze": "TAUROS_2", "taurospaldeaaqua": "TAUROS_3", "wooperpaldea": "WOOPER_1", "dialgaorigin": "DIALGA_1", "palkiaorigin": "PALKIA_1",
    "basculegionf": "BASCULEGION_1", "enamorustherian": "ENAMORUS_1", "oinkolognef": "OINKOLOGNE_1", "ursalunabloodmoon": "URSALUNA_1",
    "ogerponwellspring": "OGERPON_1", "ogerponhearthflame": "OGERPON_2", "ogerponcornerstone": "OGERPON_3", "hoopaunbound": "HOOPA_1",
    "zygarde10": "ZYGARDE_1", "oricoriopompom": "ORICORIO_1", "oricoriopau": "ORICORIO_2", "oricoriosensu": "ORICORIO_3", "lycanrocmidnight": "LYCANROC_1",
    "lycanrocdusk": "LYCANROC_2", "necrozmaduskmane": "NECROZMA_1", "necrozmadawnwings": "NECROZMA_2", "indeedeef": "INDEEDEE_1",
    "zaciancrowned": "ZACIAN_1", "zamazentacrowned": "ZAMAZENTA_1", "urshifurapidstrike": "URSHIFU_1", "calyrexice": "CALYREX_1",
    "calyrexshadow": "CALYREX_2", "miniorcore": "MINIOR_7", "palafinhero": "PALAFIN_1", "terapagosterastal": "TERAPAGOS_1"})
# the owner's folder of every Pokémon's sheet (resources/pokemon/overworld pokemon; it was resources/overworld sprites/pokemon)
OW = next(d for d in (os.path.join(RES, "pokemon", "overworld pokemon"), os.path.join(RES, "overworld sprites", "pokemon")) if os.path.isdir(d))
missing = []
for k in keys:
    f = os.path.join(OW, SPECIAL.get(k, k.upper()) + ".png")
    if not os.path.exists(f) and k in FORM_OF:   # (a form without a sheet of its own, like Blade Aegislash: its species')
        f = os.path.join(OW, SPECIAL.get(FORM_OF[k], FORM_OF[k].upper()) + ".png")
    if not os.path.exists(f):
        missing.append(k); continue
    # the sheets are drawn at double size (every pixel is a 2 x 2 block, for 32 px tiles): halve them to the maps' scale
    sh = Image.open(f).convert("RGBA"); sh = sh.resize((sh.width // 2, sh.height // 2), Image.NEAREST)
    sh.save(os.path.join(OUT, "mons", k + ".png"), optimize=True)
    # its frame size: a quarter of the sheet (32 x 32 for most; the big ones' sheets are drawn bigger: Eternatus, Groudon, Wailord
    # 64, Reshiram and Zekrom 40, Calyrex's riders 35; the game cuts them the same way)
    z = sh.width // 4
    # where its feet are in a frame (the lowest opaque row facing down), so it stands on its tile
    meta["foot"][k] = max(((sh.crop((i * z, 0, i * z + z, z)).getbbox() or (0, 0, 0, z - 4))[3]) for i in range(4))
    # and how wide it is (big ones keep more room around them)
    meta["wide"][k] = max(((lambda b: b[2] - b[0])(sh.crop((i * z, r * z, i * z + z, r * z + z)).getbbox() or (0, 0, 16, 0))) for i in range(4) for r in range(4))
print(len(keys) - len(missing), "Pokémon walk sheets", ("(missing: " + ", ".join(missing) + ")") if missing else "")

# ---------- players ----------
pc = json.load(open(os.path.join(ROOT, "tools", "home_players.json"), encoding="utf-8"))

def boxes_in(im, region):
    sub = im.crop(region).convert("RGBA"); px = sub.load(); W, H = sub.size
    cnt = Counter(px[x, y] for x in range(W) for y in range(H))
    keys_ = {c for c, n in cnt.most_common(2) if n > W * H * .12}
    seen = bytearray(W * H); boxes = []
    for yy in range(H):
        for xx in range(W):
            if seen[yy * W + xx] or px[xx, yy] in keys_: continue
            st = [(xx, yy)]; seen[yy * W + xx] = 1; bx0 = bx1 = xx; by0 = by1 = yy
            while st:
                cx, cy = st.pop(); bx0, bx1, by0, by1 = min(bx0, cx), max(bx1, cx), min(by0, cy), max(by1, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1), (cx + 1, cy + 1), (cx - 1, cy - 1), (cx + 1, cy - 1), (cx - 1, cy + 1)):
                    if 0 <= nx < W and 0 <= ny < H and not seen[ny * W + nx] and px[nx, ny] not in keys_:
                        seen[ny * W + nx] = 1; st.append((nx, ny))
            if bx1 - bx0 >= 8 and by1 - by0 >= 12: boxes.append((bx0, by0, bx1 + 1, by1 + 1))
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2); rows = []
    for b in boxes:
        cy = (b[1] + b[3]) / 2
        if rows and abs(cy - rows[-1][0]) < 10: rows[-1][1].append(b)
        else: rows.append([cy, [b]])
    for yy in range(H):
        for xx in range(W):
            if px[xx, yy] in keys_: px[xx, yy] = (0, 0, 0, 0)
    return sub, [sorted(r[1]) for r in rows]

def grid_cells(im, g, nrows, n):
    x0, y0, pxp, pyp, w, h = g; im = im.convert("RGBA"); clean = Image.new("RGBA", im.size, (0, 0, 0, 0)); rows = []
    for r in range(nrows):
        row = []
        for i in range(n):
            x, y = x0 + i * pxp, y0 + r * pyp
            cell = im.crop((x, y, x + w, y + h)); cp = cell.load()
            key = Counter(cp[a, b] for a in range(w) for b in range(h)).most_common(1)[0][0]
            for b in range(h):
                for a in range(w):
                    if cp[a, b] == key: cp[a, b] = (0, 0, 0, 0)
            bb = cell.getbbox() or (0, 0, w, h)
            clean.alpha_composite(cell, (x, y)); row.append((x + bb[0], y + bb[1], x + bb[2], y + bb[3]))
        rows.append(row)
    return clean, rows

for who, c in pc["walkers"].items():
    im = Image.open(os.path.join(RES, "player sprites", c["sheet"]))
    if "grid" in c: clean, rows = grid_cells(im, c["grid"], len(c["order"]), c["n"])
    else: clean, rows = boxes_in(im, c["region"])
    if c.get("cols"): rows = [[row[i] for row in rows if len(row) > i] for i in range(len(c["order"]))]
    n = c["n"]; frames = {d: [clean.crop(b) for b in row[:n]] for d, row in zip(c["order"], rows)}
    if "r" not in frames: frames["r"] = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in frames["l"]]
    # the standing frame goes first. Sheets differ (FireRed/LeafGreen puts it between the two steps, others first): the two
    # stepping frames facing down and up are near mirror images of each other, so the frame left over stands. On 4-frame
    # sheets the standing frame comes twice.
    def mirror_gap(a, b):
        a = a.resize((max(a.width, b.width), max(a.height, b.height))); b = b.transpose(Image.FLIP_LEFT_RIGHT).resize(a.size)
        pa, pb = a.load(), b.load()
        return sum(1 for y in range(a.height) for x in range(a.width) if sum(abs(u - v) for u, v in zip(pa[x, y], pb[x, y])) > 48)
    if n >= 4:
        same = [i for i in range(n) if any(j != i and ImageChops.difference(frames["d"][i], frames["d"][j]).getbbox() is None for j in range(n))]
        idle = same[0] if same else 0
    else:
        pairs = [(i, j) for i in range(n) for j in range(i + 1, n)]
        walk = min(pairs, key=lambda pr: sum(mirror_gap(frames[d][pr[0]], frames[d][pr[1]]) for d in "du"))
        idle = [i for i in range(n) if i not in walk][0]
    if idle:
        frames = {d: [fs[idle]] + [f for i, f in enumerate(fs) if i != idle] for d, fs in frames.items()}
    fw = max(f.width for fs in frames.values() for f in fs); fh = max(f.height for fs in frames.values() for f in fs)
    strip = Image.new("RGBA", (fw * n, fh * 4), (0, 0, 0, 0))
    for r, d in enumerate("dulr"):
        for i, f in enumerate(frames[d]):
            strip.alpha_composite(f, (i * fw + (fw - f.width) // 2, r * fh + fh - f.height))
    strip.save(os.path.join(OUT, "players", who + ".png"), optimize=True)
    meta["players"][who] = {"fw": fw, "fh": fh, "n": n}
meta["alias"] = pc["alias"]
print(len(pc["walkers"]), "player looks")
json.dump(meta, open(os.path.join(OUT, "home.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
