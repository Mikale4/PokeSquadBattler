#!/usr/bin/env python3
"""The Journey's cutscene backgrounds: the owner's painted backgrounds in resources/battle backgrounds/BATTLE BACK.

Writes resources/scenes/<scene>_<time>.png, one per time of day each comes in (day, dawn, sunset, night): the single pictures
as they are, the sheets (several times of day side by side) cut into their cells.
build.sh embeds them; SCENE_STAGE / SCENE_ENV in src/a9a_screens.js pick one per stage, by your clock.
Only the scenes the Journey uses are written (DESERT, UNDERWATER, BEACH 3 and POKEMART have no place in it yet).
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "resources", "battle backgrounds", "BATTLE BACK")
OUT = os.path.join(ROOT, "resources", "scenes")
# scene: {time: (file, cell (x, y, w, h) on a sheet, or None)}
SCENES = {
    "path": {"day": ("PATH", None), "night": ("PATH NIGHT", None)},
    "path2": {"day": ("PATH 2", None), "night": ("PATH NIGHT", None)},
    "tallgrass": {"day": ("TALL GRASS", None), "night": ("TALL GRASS NIGHT", None)},
    "woodland": {"day": ("WOODLAND WALL", (0, 0, 256, 192)), "sunset": ("WOODLAND WALL", (256, 0, 256, 192)), "night": ("WOODLAND WALL", (512, 0, 256, 192))},
    "plains": {"day": ("ENDLESS PLAINS", (0, 0, 256, 192)), "sunset": ("ENDLESS PLAINS", (256, 0, 256, 192)), "night": ("ENDLESS PLAINS", (512, 0, 256, 192))},
    "beach": {"day": ("BEACH", None), "sunset": ("BEACH 2", None), "night": ("BEACH NIGHT", None)},
    "lake": {"day": ("LAKE", None), "night": ("LAKE NIGHT", None)},
    "ocean": {"day": ("OCEAN", None), "night": ("OCEAN NIGHT", None)},
    "mountain": {"day": ("MOUNTAIN 2", None), "night": ("MOUNTAIN NIGHT", None)},
    "mountainb": {"day": ("MOUNTAIN", None)},
    "cliff": {"day": ("STEEP CLIFF", (0, 0, 640, 480)), "sunset": ("STEEP CLIFF", (640, 0, 640, 480)), "night": ("STEEP CLIFF", (0, 480, 640, 480)), "dawn": ("STEEP CLIFF", (640, 480, 640, 480))},
    "pier": {"day": ("PIER", (0, 0, 256, 192)), "sunset": ("PIER", (256, 192, 256, 192)), "night": ("PIER", (512, 192, 256, 192))},
    "cave": {"day": ("CAVE", None)},
    "cave2": {"day": ("CAVE 2", None)},
    "cavenight": {"day": ("CAVE NIGHT", None)},
    "snow": {"day": ("SNOW", None), "night": ("SNOW NIGHT", None)},
}
os.makedirs(OUT, exist_ok=True)
for key, times in SCENES.items():
    for t, (f, cell) in times.items():
        im = Image.open(os.path.join(SRC, f + ".png")).convert("RGBA")
        if cell: im = im.crop((cell[0], cell[1], cell[0] + cell[2], cell[1] + cell[3]))
        im.save(os.path.join(OUT, f"{key}_{t}.png"), optimize=True)
    print(f"{key}: {', '.join(times)}")
