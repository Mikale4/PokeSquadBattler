#!/usr/bin/env python3
"""Pack the Pokémon's cries for the build.

Reads resources/audio/cries/<id>.ogg (the full cry collection, one Ogg Vorbis file per species, named by Showdown id)
for every species in src/a3a_dex.js and writes resources/cries/<id>.mp3: mono, 24 kHz, 40 kbps (a short cry loses nothing; 1,025 of them stay small). A form (Wash Rotom, Origin
Giratina) cries like its species: cry() in a8c_sfx.js falls back to it.
MP3 rather than Ogg because Safari on older iPhones can't decode Ogg Vorbis. build.sh embeds resources/cries/*.mp3.
Needs ffmpeg on PATH. Run from anywhere:  python3 tools/pack_cries.py
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "resources", "audio", "cries")
OUT = os.path.join(ROOT, "resources", "cries")

dex = open(os.path.join(ROOT, "src", "a3a_dex.js"), encoding="utf-8").read()
ids = [k for k, rest in re.findall(r'"k":"([a-z0-9]+)"(.*)', dex) if '"form":' not in rest]
missing = [i for i in ids if not os.path.exists(os.path.join(SRC, i + ".ogg"))]
if missing:
    sys.exit("no cry in resources/audio/cries for: " + ", ".join(missing))
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".mp3") and f[:-4] not in ids:
        os.remove(os.path.join(OUT, f))
total = 0
for i in ids:
    dst = os.path.join(OUT, i + ".mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(SRC, i + ".ogg"), "-ac", "1", "-ar", "24000", "-b:a", "40k", dst], check=True)
    total += os.path.getsize(dst)
print(f"{len(ids)} cries, {total / 1e6:.1f} MB in resources/cries/")
