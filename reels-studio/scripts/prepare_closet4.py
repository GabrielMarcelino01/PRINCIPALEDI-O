#!/usr/bin/env python3
"""Prepara vídeo, áudio e timeline editorial do CLOSET-4."""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "closet-4" / "CLOSET-4.mp4"
PUBLIC = ROOT / "public"
WORK = ROOT / "work" / "closet-4"
SR = 48_000
FPS = 30
FRAMES = 687
DURATION = FRAMES / FPS
CUTS = [4.174023, 8.182031, 12.385352, 17.818359]
SOURCE_SHA256 = "f2d30a24055c413f15f2424ab5891a700164df66e11be24421fbf0360178e12f"


def tool(name: str) -> str:
    configured = os.environ.get(name.upper())
    found = configured or shutil.which(name)
    if not found:
        raise RuntimeError(f"{name} não encontrado no PATH.")
    return found


FFMPEG = tool("ffmpeg")
FFPROBE = tool("ffprobe")


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace", check=False)
    if result.returncode:
        raise RuntimeError(f"Comando falhou ({result.returncode}):\n{' '.join(command)}\n{result.stderr[-2500:]}")
    return result


def probe(path: Path) -> dict:
    return json.loads(run([FFPROBE, "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)]).stdout)


def write_wav(path: Path, samples: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(samples, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(SR)
        output.writeframes(pcm.tobytes())


def add(left: np.ndarray, right: np.ndarray, signal: np.ndarray, start: float, gain: float, pan: float = 0.0) -> None:
    begin = int(start * SR)
    if begin < 0 or begin >= len(left):
        return
    end = min(len(left), begin + len(signal))
    signal = signal[:end - begin] * gain
    left[begin:end] += signal * math.sqrt((1 - pan) / 2)
    right[begin:end] += signal * math.sqrt((1 + pan) / 2)


def generate_music(path: Path) -> None:
    rng = np.random.default_rng(20261026)
    count = round(DURATION * SR)
    left = np.zeros(count, dtype=np.float64)
    right = np.zeros(count, dtype=np.float64)
    roots = [73.42, 65.41, 87.31, 65.41, 73.42, 65.41]
    beat = 60 / 112

    for block in range(math.ceil(DURATION / 4)):
        start = block * 4
        length = min(4, DURATION - start)
        x = np.arange(round(length * SR)) / SR
        envelope = np.clip(np.minimum(x / 0.35, (length - x) / 0.5), 0, 1)
        root = roots[block % len(roots)]
        for index, ratio in enumerate([2, 2.3784, 2.9966]):
            frequency = root * ratio
            pad_l = np.sin(2 * np.pi * frequency * x) * envelope * (0.013 - index * 0.002)
            pad_r = np.sin(2 * np.pi * frequency * 1.0012 * x + 0.15) * envelope * (0.013 - index * 0.002)
            begin = round(start * SR)
            left[begin:begin + len(x)] += pad_l
            right[begin:begin + len(x)] += pad_r

    for index in range(math.ceil(DURATION / beat)):
        start = index * beat
        root = roots[min(len(roots) - 1, int(start // 4))]
        x = np.arange(round(0.24 * SR)) / SR
        kick = np.sin(2 * np.pi * (50 * x + 1.3 * (1 - np.exp(-x * 25)))) * np.exp(-x * 20)
        add(left, right, kick, start, 0.18)
        if index % 2 == 0:
            x = np.arange(round(0.30 * SR)) / SR
            bass = np.sin(2 * np.pi * root * x) * np.exp(-x * 8)
            add(left, right, bass, start + 0.03, 0.055)
        x = np.arange(round(0.045 * SR)) / SR
        noise = rng.normal(0, 1, len(x))
        hat = np.concatenate([[0], np.diff(noise)]) * np.exp(-x * 85)
        add(left, right, hat, start + beat / 2, 0.014, -0.35 if index % 2 else 0.35)

    fade = np.ones(count)
    fade[:round(0.20 * SR)] = np.linspace(0, 1, round(0.20 * SR))
    fade[-round(0.65 * SR):] = np.linspace(1, 0, round(0.65 * SR))
    left *= fade
    right *= fade
    write_wav(path, np.column_stack([left, right]))


def prepare_video() -> dict:
    destination = PUBLIC / "closet-4-source.mp4"
    filters = (
        "fps=30,"
        "scale=1080:1920:flags=lanczos:in_color_matrix=bt601:out_color_matrix=bt709,"
        "eq=contrast=1.045:brightness=-0.01:saturation=1.055:gamma=1.015,"
        "unsharp=5:5:0.25:5:5:0"
    )
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-map", "0:v:0", "-an", "-vf", filters, "-frames:v", str(FRAMES), "-c:v", "libx264", "-preset", "slow", "-crf", "11",
        "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
        "-color_range", "tv", "-video_track_timescale", "30000", "-movflags", "+faststart", str(destination),
    ])
    return probe(destination)


def measure(path: Path) -> dict[str, float | None]:
    result = run([FFMPEG, "-nostdin", "-hide_banner", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"])
    integrated = re.findall(r"^\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", result.stderr, re.MULTILINE)
    peak = re.findall(r"^\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS", result.stderr, re.MULTILINE)
    return {"integrated_lufs": float(integrated[-1]) if integrated else None, "true_peak_dbtp": float(peak[-1]) if peak else None}


def prepare_audio() -> dict:
    music = WORK / "music.wav"
    premaster = WORK / "premaster.wav"
    master = PUBLIC / "closet-4-soundtrack.wav"
    preview = PUBLIC / "closet-4-soundtrack.m4a"
    generate_music(music)
    filters = (
        f"[0:a]aresample={SR},highpass=f=75,lowpass=f=16000,equalizer=f=3000:t=q:w=1:g=1.5,"
        "acompressor=threshold=0.09:ratio=2.2:attack=8:release=100:makeup=1.35,"
        f"apad=whole_dur={DURATION},atrim=0:{DURATION},asplit=2[voice][key];"
        "[1:a][key]sidechaincompress=threshold=0.02:ratio=8:attack=12:release=180[ducked];"
        "[ducked]volume=0.30[music];[voice]volume=1.20[v];"
        f"[v][music]amix=inputs=2:duration=longest,volume=2,atrim=0:{DURATION},alimiter=limit=0.94[pre]"
    )
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-i", str(music), "-filter_complex", filters, "-map", "[pre]",
        "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(premaster),
    ])
    first = run([FFMPEG, "-nostdin", "-hide_banner", "-i", str(premaster), "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json", "-f", "null", "-"])
    matches = re.findall(r'\{\s*"input_i".*?\}', first.stderr, re.DOTALL)
    if not matches:
        raise RuntimeError("Falha ao medir loudnorm.")
    measured = json.loads(matches[-1])
    loudnorm = (
        "loudnorm=I=-14:TP=-1:LRA=7:"
        f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:measured_LRA={measured['input_lra']}:"
        f"measured_thresh={measured['input_thresh']}:offset={measured['target_offset']}:linear=true,aresample={SR}"
    )
    run([FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(premaster), "-af", loudnorm, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(master)])
    run([FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(master), "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-ac", "2", "-movflags", "+faststart", str(preview)])
    return {
        "source": measure(SOURCE), "aac_preview": measure(preview), "loudnorm_first_pass": measured,
        "target_lufs": -14.0, "target_true_peak_dbtp": -1.0, "sample_rate": SR,
        "render_master": "closet-4-soundtrack.wav — PCM 24 bits; uma única codificação AAC no MP4",
        "music": "Composição procedural original, 112 BPM, sem samples",
        "sfx": "Sem efeitos de transição; somente voz e música",
    }


def prepare_grain() -> dict:
    """Gera grão monocromático determinístico e estático."""
    rng = np.random.default_rng(118)
    noise = np.clip(rng.normal(128, 43, (128, 128)), 0, 255).astype(np.uint8)
    destination = PUBLIC / "closet-4-grain.png"
    Image.fromarray(noise, mode="L").save(destination, optimize=True)
    return {"file": destination.name, "size": [128, 128], "seed": 118, "bytes": destination.stat().st_size}


def write_project() -> None:
    """Valida a timeline versionada e regenera apenas o SRT derivado."""
    project_path = ROOT / "closet-4-project.json"
    project = json.loads(project_path.read_text(encoding="utf-8"))
    if project["id"] != "closet-4" or project["durationInFrames"] != FRAMES:
        raise RuntimeError("A timeline versionada não corresponde ao CLOSET-4 de 687 frames.")
    if project["cuts"] != CUTS or len(project["groups"]) != 13:
        raise RuntimeError("Cortes ou grupos de captions divergem do material revisado.")
    if any(item.get("position") != "bottom" for item in project["groups"]):
        raise RuntimeError("Todas as captions do CLOSET-4 devem permanecer na posição inferior estabilizada.")
    if any(scene["motion"]["scaleFrom"] != scene["motion"]["scaleTo"] for scene in project["scenes"]):
        raise RuntimeError("O CLOSET-4 não admite zoom de câmera.")

    def timestamp(value: float) -> str:
        millis = round(value * 1000)
        hours, millis = divmod(millis, 3_600_000)
        minutes, millis = divmod(millis, 60_000)
        seconds, millis = divmod(millis, 1000)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"

    blocks = []
    for index, item in enumerate(project["groups"], 1):
        caption = "\n".join(" ".join(word["text"] for word in line) for line in item["lines"])
        blocks.append(f"{index}\n{timestamp(item['start'])} --> {timestamp(item['end'])}\n{caption}\n")
    (ROOT / "closet-4-captions.srt").write_text("\n".join(blocks), encoding="utf-8")


def main() -> int:
    if not SOURCE.is_file():
        raise RuntimeError(f"Vídeo principal ausente: {SOURCE}")
    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if digest != SOURCE_SHA256:
        raise RuntimeError(f"SHA-256 do vídeo principal mudou: {digest}")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    grain = prepare_grain()
    write_project()
    source = probe(SOURCE)
    video = prepare_video()
    audio = prepare_audio()
    report = {
        "source_sha256": digest, "source_duration_seconds": 22.901693,
        "source_probe": source, "normalized_video": video, "audio": audio, "grain": grain,
    }
    (ROOT / "closet-4-prepare-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"video": "public/closet-4-source.mp4", "audio": audio, "frames": FRAMES}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(2)
