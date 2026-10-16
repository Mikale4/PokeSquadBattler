#!/usr/bin/env python3
"""Pokémon Showdown's battle animations, for tools/build_showdown_anims.js.

Downloads from smogon/pokemon-showdown-client (at one commit, written to resources/showdown/SOURCE.txt):
  src/battle-animations-moves.ts   every move's animation script (BattleMoveAnims; CC0)
  src/battle-animations.ts         the engine, the effect pictures' table (BattleEffects), the shared and status
                                   animations (BattleOtherAnims, BattleStatusAnims); the battle animation engine is MIT
  fx/<picture>                     the effect pictures those scripts use (fireball.png, wisp.png, lightning.png...), the
                                   backdrops their background effects show (bg-space.jpg) and the weather and terrain
                                   layers over the battlefield (weather-*.png/jpg)
and, from smogon/pokemon-showdown (its server, MIT; resources/showdown/text/SOURCE.txt), the battle text
  text/default.ts, moves.ts, abilities.ts, items.ts   the main games' battle messages (tools/build_showdown_text.js)
into resources/showdown/. Run it again to update to the latest client:  python3 tools/fetch_showdown_anims.py [commit]
"""
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "resources", "showdown")
REPO = "smogon/pokemon-showdown-client"
BACKDROPS = ["bg-space.jpg", "weather-sunnyday.jpg", "weather-trickroom.png", "weather-raindance.jpg", "weather-psychicterrain.png",
             "weather-hail.png", "weather-electricterrain.png", "bg-earthycave.png", "bg-icecave.png",
             # the battlefield's weather and terrain layers (battle.css: .sunnydayweather, .electricterrainweather...)
             "weather-sandstorm.png", "weather-grassyterrain.png", "weather-mistyterrain.png"]

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "pokemon-kanto-squad"}), timeout=60) as r: return r.read()

sha = sys.argv[1] if len(sys.argv) > 1 else json.loads(get(f"https://api.github.com/repos/{REPO}/commits/master"))["sha"]
raw = f"https://raw.githubusercontent.com/{REPO}/{sha}/play.pokemonshowdown.com/"
os.makedirs(os.path.join(OUT, "src"), exist_ok=True); os.makedirs(os.path.join(OUT, "fx"), exist_ok=True)
for f in ["battle-animations-moves.ts", "battle-animations.ts"]:
    open(os.path.join(OUT, "src", f), "wb").write(get(raw + "src/" + f))
eng = open(os.path.join(OUT, "src", "battle-animations.ts"), encoding="utf-8").read()
table = eng[eng.index("const BattleEffects"):eng.index("const BattleBackdropsThree")]
pics = sorted(set(re.findall(r"url: '([^']+)'", table))) + BACKDROPS
for p in pics:
    open(os.path.join(OUT, "fx", p), "wb").write(get(raw + "fx/" + p))
open(os.path.join(OUT, "SOURCE.txt"), "w").write(f"https://github.com/{REPO} at {sha}\n"
    "battle-animations-moves.ts: CC0. battle-animations.ts (the battle animation engine): MIT. The client as a whole: AGPLv3.\n")
srv = json.loads(get("https://api.github.com/repos/smogon/pokemon-showdown/commits/master"))["sha"]
os.makedirs(os.path.join(OUT, "text"), exist_ok=True)
for f in ["default", "moves", "abilities", "items"]:
    open(os.path.join(OUT, "text", f + ".ts"), "wb").write(get(f"https://raw.githubusercontent.com/smogon/pokemon-showdown/{srv}/data/text/{f}.ts"))
open(os.path.join(OUT, "text", "SOURCE.txt"), "w").write(f"https://github.com/smogon/pokemon-showdown at {srv}\n"
    "data/text: MIT.\n")
print(sha, len(pics), "pictures; text at", srv)
