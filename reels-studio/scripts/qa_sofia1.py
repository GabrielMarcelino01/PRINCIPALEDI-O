#!/usr/bin/env python3
"""QA the encoded SOFIA-1 MP4, including per-scene speech alignment."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = os.environ.get("FFMPEG_PATH", "ffmpeg")
FFPROBE = os.environ.get("FFPROBE_PATH", "ffprobe")


def command(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(args, check=True, capture_output=True)


def decode_audio(path: Path) -> np.ndarray:
    result = command([FFMPEG, "-v", "error", "-i", str(path), "-map", "0:a:0", "-ac", "1", "-ar", "8000", "-f", "f32le", "-"])
    return np.frombuffer(result.stdout, dtype="<f4")


def sync_check(video: Path, project: dict) -> list[dict]:
    source = decode_audio(ROOT.parent / "SOFIA-1 (1).mp4")
    encoded = decode_audio(video)
    rate = 8000
    results = []
    for scene in project["scenes"]:
        source_pos = scene["words"][0]["start"] + 0.12
        expected = scene["start"] + source_pos - scene["sourceStart"]
        duration = min(0.8, scene["sourceEnd"] - source_pos - 0.05)
        count = int(duration * rate)
        lag = int(0.08 * rate)
        reference = source[int(source_pos * rate):int(source_pos * rate) + count].astype(np.float64)
        center = int(expected * rate)
        lower = max(0, center - lag)
        search = encoded[lower:center + count + lag].astype(np.float64)
        if len(reference) != count or len(search) < count:
            raise ValueError(f"Audio window outside file: {scene['id']}")
        reference -= reference.mean()
        search -= search.mean()
        dots = np.correlate(search, reference, mode="valid")
        squares = np.concatenate([[0.0], np.cumsum(search * search)])
        energy = squares[count:] - squares[:-count]
        correlations = dots / (np.sqrt(np.maximum(energy, 1e-12)) * np.linalg.norm(reference) + 1e-12)
        best = int(np.argmax(correlations))
        offset_ms = ((lower + best) / rate - expected) * 1000
        results.append({"scene": scene["id"], "offset_ms": round(float(offset_ms), 3), "correlation": round(float(correlations[best]), 4)})
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    video = args.video.resolve()
    project = json.loads((ROOT / "sofia-1-project.json").read_text(encoding="utf-8"))
    probe = json.loads(command([FFPROBE, "-v", "error", "-count_frames", "-show_entries",
        "stream=index,codec_name,profile,codec_type,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_read_frames,sample_rate,channels,duration,color_space,color_transfer,color_primaries,color_range:format=duration,size,bit_rate",
        "-of", "json", str(video)]).stdout)
    visual = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
    audio = next(stream for stream in probe["streams"] if stream["codec_type"] == "audio")
    expected_width, expected_height = (540, 960) if args.preview else (1080, 1920)

    loud = command([FFMPEG, "-hide_banner", "-nostats", "-i", str(video), "-map", "0:a:0",
        "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"])
    match = re.search(rb"\{\s*\"input_i\".*?\}", loud.stderr, re.DOTALL)
    if not match:
        raise ValueError("Could not parse loudnorm measurement")
    loudness = json.loads(match.group(0))
    integrated = float(loudness["input_i"])
    true_peak = float(loudness["input_tp"])

    detect = command([FFMPEG, "-hide_banner", "-nostats", "-i", str(video), "-vf",
        "blackdetect=d=0.08:pix_th=0.04,freezedetect=n=0.003:d=0.8", "-an", "-f", "null", "-"])
    events = re.findall(rb"(?:black_start|freeze_start|freeze_end):[^\n]+", detect.stderr)
    command([FFMPEG, "-v", "error", "-xerror", "-i", str(video), "-f", "null", "-"])
    sync = sync_check(video, project)

    checks = []
    def check(name: str, condition: bool, detail) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "detail": detail})

    check("codec", visual["codec_name"] == "h264", visual["codec_name"])
    check("dimensions", (visual["width"], visual["height"]) == (expected_width, expected_height), f"{visual['width']}x{visual['height']}")
    check("fps", visual["avg_frame_rate"] == "60/1" and visual["r_frame_rate"] == "60/1", visual["avg_frame_rate"])
    check("frames", int(visual["nb_read_frames"]) == 1506, visual["nb_read_frames"])
    check("pixel_format", visual["pix_fmt"] == "yuv420p", visual["pix_fmt"])
    check("color", all(visual.get(key) == "bt709" for key in ["color_space", "color_transfer", "color_primaries"]) and visual.get("color_range") == "tv", {key: visual.get(key) for key in ["color_space", "color_transfer", "color_primaries", "color_range"]})
    check("video_duration", abs(float(visual["duration"]) - 25.1) <= 0.002, visual["duration"])
    check("audio_codec", audio["codec_name"] == "aac" and audio["sample_rate"] == "48000" and audio["channels"] == 2, f"{audio['codec_name']} / {audio['sample_rate']} Hz / {audio['channels']} channels")
    check("audio_duration", abs(float(audio["duration"]) - 25.1) <= 0.025, audio["duration"])
    check("loudness", math.isfinite(integrated) and abs(integrated + 14) <= 0.5, integrated)
    check("true_peak", math.isfinite(true_peak) and true_peak <= -0.95, true_peak)
    check("black_freeze", len(events) == 0, [item.decode() for item in events])
    check("decode", True, "Fluxo completo decodificado com -xerror")
    check("sync", all(abs(item["offset_ms"]) <= 20 and item["correlation"] > 0.5 for item in sync), sync)
    failures = [item for item in checks if item["status"] == "fail"]
    report = {
        "status": "PASS" if not failures else "FAIL",
        "scope": "Verificações técnicas do arquivo codificado; não é playback nem escuta subjetiva integral.",
        "file": str(video), "bytes": video.stat().st_size,
        "sha256": hashlib.sha256(video.read_bytes()).hexdigest(),
        "summary": {"checks": len(checks), "passed": len(checks) - len(failures), "failed": len(failures)},
        "probe": probe, "loudness": loudness, "sync": sync, "checks": checks,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], **report["summary"], "loudness": integrated, "true_peak": true_peak, "sync": sync}, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
