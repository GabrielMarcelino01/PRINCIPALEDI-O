#!/usr/bin/env python3
"""Prepara vídeo, áudio e timeline editorial do EDITE-ESSE."""

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

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "source" / "edite-esse.mp4"
PUBLIC = ROOT / "public"
WORK = ROOT / "work" / "fashion"
SR = 48_000
FPS = 30
FRAMES = 614
DURATION = FRAMES / FPS
CUTS = [4.417643, 8.366667, 11.613021, 15.716667]
SOURCE_SHA256 = "db9c93382b7d05b152a3dd9dce13c72c1634b74e5ba4125f79811ba98ed9bbc8"


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


def generate_sfx(path: Path) -> None:
    rng = np.random.default_rng(7)
    count = round(DURATION * SR)
    left = np.zeros(count, dtype=np.float64)
    right = np.zeros(count, dtype=np.float64)
    for index, cut in enumerate(CUTS):
        x = np.arange(round(0.24 * SR)) / SR
        noise = rng.normal(0, 1, len(x))
        smooth = np.convolve(noise, np.ones(15) / 15, mode="same")
        whoosh = smooth * np.sin(np.pi * x / 0.24) ** 2
        add(left, right, whoosh, cut - 0.08, 0.12, -0.5 if index % 2 else 0.5)
        x = np.arange(round(0.20 * SR)) / SR
        tick = np.sin(2 * np.pi * 95 * x) * np.exp(-x * 25)
        add(left, right, tick, cut, 0.08)
    write_wav(path, np.column_stack([left, right]))


def prepare_video() -> dict:
    destination = PUBLIC / "fashion-source.mp4"
    filters = (
        "fps=30,"
        "scale=1080:1920:flags=lanczos:in_color_matrix=bt601:out_color_matrix=bt709,"
        "eq=contrast=1.045:brightness=-0.01:saturation=1.055:gamma=1.015,"
        "unsharp=5:5:0.25:5:5:0"
    )
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-map", "0:v:0", "-an", "-vf", filters, "-c:v", "libx264", "-preset", "slow", "-crf", "11",
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
    sfx = WORK / "sfx.wav"
    premaster = WORK / "premaster.wav"
    master = PUBLIC / "fashion-soundtrack.wav"
    preview = PUBLIC / "fashion-soundtrack.m4a"
    generate_music(music)
    generate_sfx(sfx)
    filters = (
        f"[0:a]aresample={SR},highpass=f=75,lowpass=f=16000,equalizer=f=3000:t=q:w=1:g=1.5,"
        "acompressor=threshold=0.09:ratio=2.2:attack=8:release=100:makeup=1.35,"
        f"apad=whole_dur={DURATION},atrim=0:{DURATION},asplit=2[voice][key];"
        "[1:a][key]sidechaincompress=threshold=0.02:ratio=8:attack=12:release=180[ducked];"
        "[ducked]volume=0.30[music];[2:a]volume=0.35[sfx];[voice]volume=1.20[v];"
        f"[v][music][sfx]amix=inputs=3:duration=longest:normalize=0,atrim=0:{DURATION},alimiter=limit=0.94[pre]"
    )
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-i", str(music), "-i", str(sfx), "-filter_complex", filters, "-map", "[pre]",
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
        "render_master": "fashion-soundtrack.wav — PCM 24 bits; uma única codificação AAC no MP4",
        "music": "Composição procedural original, 112 BPM, sem samples",
        "sfx": "Whooshes e impactos procedurais originais nos quatro cortes",
    }


def word(text: str, start: float, end: float, style: str = "normal", color: str | None = None) -> dict:
    result = {"text": text, "start": start, "end": end, "style": style}
    if color:
        result["color"] = color
    return result


def group(group_id: str, start: float, end: float, lines: list[list[dict]]) -> dict:
    return {"id": group_id, "start": start, "end": end, "lines": lines}


def caption_groups() -> list[dict]:
    neon, orange, red = "#b9f95a", "#ffad5c", "#ff706b"
    green, beige, blue, burgundy, gold = "#a8e6bd", "#e7cba7", "#91bcff", "#ff949c", "#f5db78"
    return [
        group("lembre", 0.30, 1.20, [[word("LEMBRE-SE", 0.30, 0.88, "serif", "#fff4e2")]]),
        group("erro-cores", 1.34, 2.86, [
            [word("VERDE", 1.34, 1.64, "normal", neon), word("NEON", 1.64, 1.92, "normal", neon)],
            [word("COM", 1.92, 2.26, "small"), word("LARANJA", 2.26, 2.86, "normal", orange)],
        ]),
        group("erro", 2.86, 4.25, [[word("FICA", 2.86, 3.14), word("HORRÍVEL", 3.14, 3.96, "serif", red)]]),
        group("look-1-cores", 4.58, 6.42, [
            [word("COMBINE", 4.58, 5.16), word("VERDE", 5.16, 5.52, "normal", green)],
            [word("COM", 5.52, 5.74, "small"), word("PRETO", 5.74, 6.28, "normal", "#f4f4f4"), word("E", 6.28, 6.42, "small")],
        ]),
        group("look-1-estilo", 6.42, 8.34, [
            [word("FIQUE", 6.42, 6.60), word("SOFISTICADO", 6.60, 7.52, "serif", green)],
            [word("E", 7.52, 7.70, "small"), word("AUTÊNTICO", 7.70, 8.34)],
        ]),
        group("look-2-cores", 8.58, 10.10, [
            [word("COMBINE", 8.58, 8.80), word("BEGE", 8.80, 9.20, "normal", beige)],
            [word("COM", 9.20, 9.40, "small"), word("BRANCO", 9.40, 9.92, "normal", "#ffffff"), word("E", 9.92, 10.10, "small")],
        ]),
        group("look-2-estilo", 10.10, 11.56, [
            [word("FIQUE", 10.10, 10.34), word("MINIMALISTA", 10.34, 11.06, "serif", beige)],
            [word("E", 11.06, 11.22, "small"), word("CHIQUE", 11.22, 11.50, "normal", gold)],
        ]),
        group("look-3-camisa", 11.92, 13.16, [
            [word("AGORA,", 11.92, 12.26, "small")],
            [word("CAMISA", 12.54, 12.86), word("AZUL", 12.86, 13.16, "normal", blue)],
        ]),
        group("look-3-calca", 13.16, 14.04, [[word("COM", 13.16, 13.32, "small"), word("CALÇA", 13.32, 13.68), word("BRANCA", 13.68, 14.04, "normal", "#ffffff")]]),
        group("look-3-estilo", 14.04, 15.60, [
            [word("FICA", 14.04, 14.28), word("RICO", 14.28, 14.68, "normal", gold)],
            [word("E", 14.68, 14.98, "small"), word("ELEGANTE", 14.98, 15.52, "serif", blue)],
        ]),
        group("look-4-sweater", 15.90, 17.04, [[word("SWEATER", 15.90, 16.42), word("VERMELHO", 16.42, 17.04, "normal", burgundy)]]),
        group("look-4-calca", 17.04, 18.10, [[word("COM", 17.04, 17.26, "small"), word("CALÇA", 17.26, 17.62), word("BRANCA", 17.62, 18.10, "normal", "#ffffff")]]),
        group("look-4-estilo", 18.30, 20.25, [
            [word("UM", 18.30, 18.42, "small"), word("VISUAL", 18.42, 18.76), word("VIVO", 18.76, 19.20, "normal", burgundy)],
            [word("E", 19.20, 19.36, "small"), word("MODERNO", 19.36, 19.92, "serif", burgundy)],
        ]),
    ]


def write_project() -> None:
    scenes = [
        {"id": "erro", "start": 0, "end": CUTS[0], "label": "O ERRO", "header": "NEON + LARANJA", "number": "", "accent": "#ff706b", "colors": ["#b9f95a", "#ffad5c"]},
        {"id": "look-1", "start": CUTS[0], "end": CUTS[1], "label": "LOOK 01", "header": "VERDE + PRETO", "number": "01 / 04", "accent": "#a8e6bd", "colors": ["#a8e6bd", "#171717"]},
        {"id": "look-2", "start": CUTS[1], "end": CUTS[2], "label": "LOOK 02", "header": "BEGE + BRANCO", "number": "02 / 04", "accent": "#e7cba7", "colors": ["#e7cba7", "#ffffff"]},
        {"id": "look-3", "start": CUTS[2], "end": CUTS[3], "label": "LOOK 03", "header": "AZUL + BRANCO", "number": "03 / 04", "accent": "#91bcff", "colors": ["#91bcff", "#ffffff"]},
        {"id": "look-4", "start": CUTS[3], "end": DURATION, "label": "LOOK 04", "header": "VERMELHO + BRANCO", "number": "04 / 04", "accent": "#ff949c", "colors": ["#a51435", "#ffffff"]},
    ]
    project = {
        "id": "edite-esse", "width": 1080, "height": 1920, "fps": FPS, "durationInFrames": FRAMES,
        "duration": DURATION, "video": "fashion-source.mp4", "audio": "fashion-soundtrack.wav",
        "cuts": CUTS, "scenes": scenes, "groups": caption_groups(), "showSafeZones": False,
        "safeZones": {"top": 200, "bottom": 420, "left": 60, "right": 100},
        "captionStyle": {"top": 1250, "maxWidth": 940, "fontSize": 62, "serifFontSize": 78, "smallFontSize": 36},
        "cta": {"start": 18.30, "text": "QUAL LOOK VOCÊ USARIA?"},
        "emphasisTimes": [3.14, 6.60, 10.34, 14.98, 19.36],
    }
    (ROOT / "fashion-project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    def timestamp(value: float) -> str:
        millis = round(value * 1000)
        hours, millis = divmod(millis, 3_600_000)
        minutes, millis = divmod(millis, 60_000)
        seconds, millis = divmod(millis, 1000)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"
    blocks = []
    for index, item in enumerate(project["groups"], 1):
        text = "\n".join(" ".join(word["text"] for word in line) for line in item["lines"])
        blocks.append(f"{index}\n{timestamp(item['start'])} --> {timestamp(item['end'])}\n{text}\n")
    (ROOT / "fashion-captions.srt").write_text("\n".join(blocks), encoding="utf-8")


def main() -> int:
    if not SOURCE.is_file():
        raise RuntimeError(f"Vídeo principal ausente: {SOURCE}")
    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if digest != SOURCE_SHA256:
        raise RuntimeError(f"SHA-256 do vídeo principal mudou: {digest}")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    write_project()
    video = prepare_video()
    audio = prepare_audio()
    report = {
        "source_sha256": digest, "source_duration_seconds": 20.467,
        "normalized_video": video, "audio": audio,
    }
    (ROOT / "fashion-prepare-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"video": "public/fashion-source.mp4", "audio": audio, "frames": FRAMES}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(2)
