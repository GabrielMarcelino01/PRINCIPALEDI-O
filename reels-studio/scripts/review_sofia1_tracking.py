#!/usr/bin/env python3
"""Render and measure the real TAPNext++ SOFIA-1 trajectory for human review."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = os.environ.get("FFMPEG_PATH", "ffmpeg")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "out/sofia-1-tracking-review")
    args = parser.parse_args()
    report = json.loads(args.report.read_text(encoding="utf-8"))
    assert report.get("status") == "tracking_passed", report.get("status")
    tracking = report["tracking"]
    samples = tracking["samples"]
    assert len(samples) >= 24
    output = args.output
    output.mkdir(parents=True, exist_ok=True)
    source = ROOT.parent / "SOFIA-1 (1).mp4"

    positions = np.array([sample["positions_xy"] for sample in samples], dtype=np.float64)
    visible = np.array([sample["visible"] for sample in samples], dtype=bool)
    steps = np.linalg.norm(np.diff(positions, axis=0), axis=2)
    metrics = []
    for index, query in enumerate(tracking["queries"]):
        metrics.append({
            "point": query["name"],
            "visible_fraction": float(visible[:, index].mean()),
            "median_step_px": float(np.median(steps[:, index])),
            "p95_step_px": float(np.percentile(steps[:, index], 95)),
            "max_step_px": float(steps[:, index].max()),
            "min_xy": positions[:, index].min(axis=0).tolist(),
            "max_xy": positions[:, index].max(axis=0).tolist(),
        })

    # Review the interval eligible for the editorial accent, plus later diagnostics.
    review_times = [0.0, 0.25, 0.50, 0.75, 1.0, 1.25, 1.5, 1.75, 2.5, 3.5, 4.5, 5.0]
    selected = []
    for target in review_times:
        sample = min(samples, key=lambda item: abs(item["time"] - target))
        if all(abs(sample["time"] - target) > 0.09 for sample in selected):
            selected.append(sample)
    frame_dir = output / "frames"
    frame_dir.mkdir(exist_ok=True)
    for old in frame_dir.glob("*.png"):
        old.unlink()
    for index, sample in enumerate(selected):
        destination = frame_dir / f"{index:02d}.png"
        subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
                        "-ss", f"{sample['time']:.6f}", "-i", str(source),
                        "-frames:v", "1", str(destination)], check=True)

    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    font = ImageFont.truetype(font_path, 18)
    tile_width, tile_height = 380, 700
    sheet = Image.new("RGB", (tile_width * 4, tile_height * 3), "#111114")
    for index, sample in enumerate(selected):
        image = Image.open(frame_dir / f"{index:02d}.png").convert("RGB")
        draw = ImageDraw.Draw(image)
        for point_index, (name, color) in enumerate([("index", "#B9D97B"), ("nose", "#F2D78E")]):
            x, y = sample["positions_xy"][point_index]
            is_visible = sample["visible"][point_index]
            draw.ellipse((x - 16, y - 16, x + 16, y + 16), outline=color if is_visible else "#FF5577", width=3)
            draw.line((x - 22, y, x + 22, y), fill=color, width=1)
            draw.line((x, y - 22, x, y + 22), fill=color, width=1)
            draw.text((x + 19, y - 25), f"{name} {'V' if is_visible else 'OCCLUDED'}", fill=color, font=font, stroke_width=2, stroke_fill="black")
        image.thumbnail((360, 640))
        tile = Image.new("RGB", (tile_width, tile_height), "#18181B")
        tile.paste(image, (10, 45))
        draw = ImageDraw.Draw(tile)
        draw.text((12, 10), f"source {sample['time']:.3f}s / frame {sample['frame']}", fill="white", font=font)
        sheet.paste(tile, ((index % 4) * tile_width, (index // 4) * tile_height))
    sheet_path = output / "tracking-sheet.jpg"
    sheet.save(sheet_path, quality=95)
    review = {
        "status": "AWAITING_VISUAL_REVIEW",
        "scope": "Trajetória real TAPNext++; métricas e fotogramas não provam sozinhos estabilidade semântica.",
        "source_sha256": report["video"]["sha256"],
        "github_run_id": report.get("github_run_id"),
        "tracking": {key: value for key, value in tracking.items() if key != "samples"},
        "metrics": metrics,
        "review_times": review_times,
        "sheet": str(sheet_path),
    }
    (output / "metrics.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(review, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
