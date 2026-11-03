#!/usr/bin/env python3
"""Extrai evidências do master: captions, cortes, extremos e amostragem uniforme."""
from __future__ import annotations

import json
import subprocess
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
FINAL = REPO / "entregas/CRIATIVO-3-EDITADO.mp4"
PROJECT = json.loads((ROOT / "criativo-3-project.json").read_text())
OUT = ROOT / "work/final-review"
FPS = PROJECT["source"]["fps"]
FRAMES = PROJECT["edit"]["output_frames"]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for path in OUT.glob("frame-*.png"):
        path.unlink()
    for path in OUT.glob("sheet-*.jpg"):
        path.unlink()
    reasons: dict[int, set[str]] = defaultdict(set)
    for frame in list(range(0, FRAMES, 48)) + [FRAMES - 1]:
        reasons[frame].add("UNIFORM")
    reasons[0].add("FIRST")
    reasons[FRAMES - 1].add("LAST")
    for cue in PROJECT["captions"]:
        frame = min(FRAMES - 1, max(0, round((cue["start"] + cue["end"]) / 2 * FPS)))
        reasons[frame].add(f'CUE{cue["id"]:02d}')
    removed = 0
    for index, (start, end) in enumerate(PROJECT["edit"]["cut_frames"], 1):
        boundary = start - removed
        reasons[max(0, boundary - 1)].add(f"CUT{index:02d}_BEFORE")
        reasons[min(FRAMES - 1, boundary)].add(f"CUT{index:02d}_AFTER")
        removed += end - start
    selected = sorted(reasons)
    expression = "+".join(f"eq(n\\,{frame})" for frame in selected)
    command = [
        "ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(FINAL), "-vf", f"select={expression}", "-fps_mode", "passthrough",
        str(OUT / "frame-%04d.png"),
    ]
    subprocess.run(command, check=True)
    generated = sorted(OUT.glob("frame-*.png"))
    if len(generated) != len(selected):
        raise RuntimeError(f"Esperados {len(selected)} quadros, encontrados {len(generated)}")
    manifest = []
    for sequence, (path, frame) in enumerate(zip(generated, selected), 1):
        manifest.append({
            "sequence": sequence, "path": str(path.relative_to(ROOT)), "frame": frame,
            "time_seconds": frame / FPS, "reasons": sorted(reasons[frame]),
        })
    font = ImageFont.truetype(str(ROOT / "public/fonts/InterCaption.ttf"), 20)
    columns, rows, cell_width, cell_height = 4, 3, 360, 680
    sheets = []
    for offset in range(0, len(manifest), columns * rows):
        batch = manifest[offset:offset + columns * rows]
        sheet = Image.new("RGB", (columns * cell_width, rows * cell_height), (16, 16, 16))
        draw = ImageDraw.Draw(sheet)
        for position, item in enumerate(batch):
            image = Image.open(ROOT / item["path"]).convert("RGB").resize((360, 640), Image.Resampling.LANCZOS)
            x = (position % columns) * cell_width
            y = (position // columns) * cell_height
            sheet.paste(image, (x, y + 40))
            reason = "/".join(r.replace("_BEFORE", "B").replace("_AFTER", "A") for r in item["reasons"])
            draw.text((x + 8, y + 8), f'F{item["frame"]:04d} {item["time_seconds"]:06.3f}s {reason}', font=font, fill="white")
        number = offset // (columns * rows) + 1
        destination = OUT / f"sheet-{number:02d}.jpg"
        sheet.save(destination, quality=94)
        sheets.append(str(destination.relative_to(ROOT)))
    report = {
        "source": str(FINAL), "unique_frames": len(manifest),
        "caption_cues": len(PROJECT["captions"]), "cut_boundaries": len(PROJECT["edit"]["cut_frames"]),
        "uniform_interval_frames": 48, "first_last": True, "frames": manifest, "sheets": sheets,
    }
    (ROOT / "reports/review-manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: report[k] for k in ["unique_frames", "caption_cues", "cut_boundaries", "sheets"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
