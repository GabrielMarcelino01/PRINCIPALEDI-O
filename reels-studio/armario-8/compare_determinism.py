#!/usr/bin/env python3
"""Compara recapturas fora de ordem com os quadros do render principal."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent
FRAMES = [1470, 180, 1140, 30, 1380, 900, 630, 360, 1080, 1320]
FFMPEG = subprocess.check_output(["node", "-e", "process.stdout.write(require('@ffmpeg-installer/ffmpeg').path)"], cwd=ROOT, text=True).strip()


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pixel_hash(path: Path) -> str:
    result = subprocess.run([FFMPEG, "-v", "error", "-i", str(path), "-f", "framemd5", "-"], check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    rows = [line for line in result.stdout.splitlines() if line and not line.startswith("#")]
    return hashlib.sha256("\n".join(rows).encode()).hexdigest()


results = []
for frame in FRAMES:
    name = f"{frame:05d}.jpg"
    original = ROOT / "out" / "frames" / name
    repeated = ROOT / "out" / "determinism" / name
    byte_original = file_hash(original)
    byte_repeated = file_hash(repeated)
    pixel_original = pixel_hash(original)
    pixel_repeated = pixel_hash(repeated)
    results.append({
        "frame": frame,
        "t": frame / 60,
        "byte_identical": byte_original == byte_repeated,
        "pixel_identical": pixel_original == pixel_repeated,
        "original_sha256": byte_original,
        "repeated_sha256": byte_repeated,
    })

report = {
    "method": "Recaptura em Chromium fora de ordem; comparação de bytes e RGB decodificado.",
    "frames": FRAMES,
    "results": results,
    "all_identical": all(item["pixel_identical"] for item in results),
    "all_byte_identical": all(item["byte_identical"] for item in results),
}
path = ROOT / "reports" / "determinism.json"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
if not report["all_identical"]:
    raise SystemExit(1)
