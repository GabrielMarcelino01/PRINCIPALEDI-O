#!/usr/bin/env python3
"""Valida o MP4 final em entregas/ e grava build/delivery-qa.json."""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[3]
VIDEO = REPO / "entregas" / "truque-dos-mil-looks-87s-9x16.mp4"
FFMPEG = os.environ.get("FFMPEG", "/tmp/hyperframes-test-bin/ffmpeg")
FFPROBE = os.environ.get("FFPROBE", "/tmp/hyperframes-test-bin/ffprobe")

probe = subprocess.run([
    FFPROBE, "-v", "error", "-count_frames", "-show_entries",
    "stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,nb_read_frames,sample_rate,channels,duration:format=duration,size",
    "-of", "json", str(VIDEO),
], text=True, capture_output=True, check=True)
metadata = json.loads(probe.stdout)
video = next(s for s in metadata["streams"] if s["codec_type"] == "video")
audio = next(s for s in metadata["streams"] if s["codec_type"] == "audio")
checks = {}


def check(name: str, condition: bool, actual: object) -> None:
    checks[name] = {"ok": bool(condition), "actual": actual}
    if not condition:
        raise AssertionError(f"{name}: {actual}")


check("codec_h264", video["codec_name"] == "h264", video["codec_name"])
check("dimensions_1080x1920", (video["width"], video["height"]) == (1080, 1920), [video["width"], video["height"]])
check("fps_60", video["avg_frame_rate"] == "60/1", video["avg_frame_rate"])
check("frames_5220", int(video["nb_read_frames"]) == 5220, video["nb_read_frames"])
check("codec_aac", audio["codec_name"] == "aac", audio["codec_name"])
check("audio_48khz", int(audio["sample_rate"]) == 48000, audio["sample_rate"])
check("audio_stereo", int(audio["channels"]) == 2, audio["channels"])
check("duration_87s", abs(float(metadata["format"]["duration"]) - 87.0) <= 0.02, metadata["format"]["duration"])

subprocess.run([FFMPEG, "-v", "error", "-i", str(VIDEO), "-f", "null", "-"], check=True)
loudness = subprocess.run([
    FFMPEG, "-hide_banner", "-nostats", "-i", str(VIDEO),
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-",
], text=True, capture_output=True, check=True)
match = re.search(r"\{\s*\"input_i\".*?\}", loudness.stderr, flags=re.S)
if not match:
    raise RuntimeError("FFmpeg não retornou loudness")
loudness_data = json.loads(match.group(0))
check("loudness_near_minus_14", -14.6 <= float(loudness_data["input_i"]) <= -13.5, loudness_data["input_i"])
check("true_peak_below_minus_1", float(loudness_data["input_tp"]) <= -1.0, loudness_data["input_tp"])

sha256 = hashlib.sha256()
with VIDEO.open("rb") as handle:
    for block in iter(lambda: handle.read(1024 * 1024), b""):
        sha256.update(block)
report = {
    "ok": True,
    "file": str(VIDEO),
    "bytes": VIDEO.stat().st_size,
    "sha256": sha256.hexdigest(),
    "metadata": metadata,
    "loudness": loudness_data,
    "full_decode": "ok",
    "checks": checks,
}
(ROOT / "build" / "delivery-qa.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps({k: v for k, v in report.items() if k not in {"metadata", "checks"}}, ensure_ascii=False, indent=2))
