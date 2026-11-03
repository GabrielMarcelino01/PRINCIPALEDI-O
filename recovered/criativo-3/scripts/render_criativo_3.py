#!/usr/bin/env python3
"""Renderiza CRIATIVO-3 com cortes, grade, gradiente central e captions ASS."""
from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
PROJECT = json.loads((ROOT / "criativo-3-project.json").read_text())
SOURCE = ROOT / "assets/original.mp4"
AUDIO = ROOT / "public/criativo-3-audio.wav"
ASS = ROOT / "criativo-3-captions.ass"
GRADIENT = ROOT / "public/center-gradient.png"
FPS = PROJECT["source"]["fps"]
CUTS = PROJECT["edit"]["cut_frames"]
SOURCE_FRAMES = PROJECT["source"]["frames"]
OUTPUT_FRAMES = PROJECT["edit"]["output_frames"]


def keep_intervals():
    keeps, cursor = [], 0
    for start, end in CUTS + [(SOURCE_FRAMES, SOURCE_FRAMES)]:
        if start > cursor:
            keeps.append((cursor, start))
        cursor = end
    return keeps


def build_filter() -> str:
    filters, labels = [], []
    for i, (start, end) in enumerate(keep_intervals()):
        label = f"v{i}"
        labels.append(f"[{label}]")
        filters.append(f"[0:v]trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS[{label}]")
    filters.append(
        "".join(labels) + f"concat=n={len(labels)}:v=1:a=0"
        f",setpts=N/({FPS})/TB,fps={FPS}:round=up,"
        "zscale=matrixin=smpte170m:transferin=iec61966-2-1:primariesin=bt709:"
        "matrix=bt709:transfer=bt709:primaries=bt709:rangein=limited:range=limited,"
        "format=gbrp,"
        "curves=master='0/0.008 0.25/0.245 0.50/0.51 0.75/0.765 1/0.992',"
        "colorbalance=gs=-0.008:gm=-0.008:gh=-0.008:bs=0.008:rh=0.012:bh=-0.008,"
        "eq=contrast=1.025:brightness=0.002:saturation=1.05:gamma=1.005,"
        "unsharp=5:5:0.18:5:5:0.0,format=yuv420p[vbase]"
    )
    filters.append("[1:v]format=rgba,setpts=PTS-STARTPTS[gradient]")
    filters.append(f"[vbase][gradient]overlay=0:0:shortest=1,ass=filename={ASS}:fontsdir={ROOT / 'public/fonts'},format=yuv420p[vout]")
    return ";".join(filters)


def probe(path: Path) -> dict:
    result = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", str(path)], check=True, text=True, capture_output=True)
    return json.loads(result.stdout)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "out/criativo-3-master.mp4")
    parser.add_argument("--preset", default="slow")
    parser.add_argument("--crf", type=int, default=17)
    parser.add_argument("--max-frames", type=int, help="Prévia limitada aos primeiros N quadros")
    args = parser.parse_args()
    frames = min(OUTPUT_FRAMES, args.max_frames) if args.max_frames else OUTPUT_FRAMES
    if frames <= 0:
        raise ValueError("A prévia precisa de ao menos um quadro")
    duration = frames / FPS
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_name(f".{output.name}.render.mp4")
    picture = output.with_name(f".{output.name}.picture.mp4")
    temp.unlink(missing_ok=True)
    picture.unlink(missing_ok=True)
    command = [
        "ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(SOURCE), "-loop", "1", "-framerate", str(FPS), "-i", str(GRADIENT),
        "-filter_complex", build_filter(), "-map", "[vout]", "-an",
        "-c:v", "libx264", "-preset", args.preset, "-crf", str(args.crf),
        "-profile:v", "high", "-level:v", "4.0", "-pix_fmt", "yuv420p",
        "-r", str(FPS), "-frames:v", str(frames),
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
        "-video_track_timescale", "24000", "-movflags", "+faststart", str(picture),
    ]
    print(json.dumps({"stage": "render", "output": str(output), "frames": frames, "duration": duration, "preview": bool(args.max_frames)}, ensure_ascii=False), flush=True)
    result = subprocess.run(command, text=True, capture_output=True)
    suffix = "preview" if args.max_frames else "master"
    (ROOT / f"reports/ffmpeg-render-{suffix}.log").write_text(result.stdout + result.stderr)
    if result.returncode:
        raise RuntimeError(f"FFmpeg falhou ({result.returncode}):\n{result.stderr[-8000:]}")
    finish = [
        "ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(picture), "-i", str(AUDIO), "-map", "0:v:0", "-map", "1:a:0", "-map_metadata", "0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
        "-t", f"{duration:.9f}", "-movflags", "+faststart", str(temp),
    ]
    finished = subprocess.run(finish, text=True, capture_output=True)
    (ROOT / f"reports/ffmpeg-finish-{suffix}.log").write_text(finished.stdout + finished.stderr)
    if finished.returncode:
        raise RuntimeError(f"Acabamento do AAC falhou ({finished.returncode}):\n{finished.stderr[-8000:]}")
    metadata = probe(temp)
    video = next(s for s in metadata["streams"] if s["codec_type"] == "video")
    audio = next(s for s in metadata["streams"] if s["codec_type"] == "audio")
    if int(video["nb_read_frames"]) != frames:
        raise RuntimeError(f'Quantidade incorreta de quadros: {video["nb_read_frames"]}; esperada {frames}')
    if abs(float(audio["duration"]) - duration) > 0.05:
        raise RuntimeError(f'Duração incorreta do AAC: {audio["duration"]}; esperada {duration}')
    os.replace(temp, output)
    picture.unlink(missing_ok=True)
    report = {
        "status": "PASS", "output": str(output), "preview": bool(args.max_frames),
        "video": {k: video.get(k) for k in ["codec_name", "width", "height", "r_frame_rate", "avg_frame_rate", "nb_read_frames", "duration", "color_space", "color_transfer", "color_primaries", "color_range"]},
        "audio": {k: audio.get(k) for k in ["codec_name", "sample_rate", "channels", "duration", "bit_rate"]},
        "container_duration": metadata["format"].get("duration"), "size_bytes": output.stat().st_size,
    }
    (ROOT / f"reports/render-{suffix}-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
