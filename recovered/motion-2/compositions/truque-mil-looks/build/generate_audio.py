#!/usr/bin/env python3
"""Gera locução PT-BR, trilha original e timeline determinística do anúncio.

Requer os artefatos locais preparados em /tmp/kokoro-local e /tmp/kokoro-npm.
O texto exibido permanece em copy.json; somente a locução recebe grafia fonética
para "look(s)".
"""
from __future__ import annotations

import json
import math
import re
import subprocess
from pathlib import Path

import espeakng_loader
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.config import EspeakConfig

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
AUDIO = ROOT / "assets" / "audio"
RAW = BUILD / "voice-segments"
SR = 48000
VOICE_SR = 24000
DURATION = 87.0
VOICE_END_TARGET = 85.0
FIRST_START = 0.35
FINAL_HOLD = DURATION - VOICE_END_TARGET

AUDIO.mkdir(parents=True, exist_ok=True)
RAW.mkdir(parents=True, exist_ok=True)
# Evita misturar locuções descartadas com a versão atual ao trocar texto ou voz.
for old_segment in RAW.glob("[0-9][0-9]-*.wav"):
    old_segment.unlink()
copy = json.loads((BUILD / "copy.json").read_text())
lines = copy["lines"]

conf = EspeakConfig(
    lib_path=espeakng_loader.get_library_path(),
    data_path=espeakng_loader.get_data_path(),
)
kokoro = Kokoro(
    "/tmp/kokoro-local/model_quantized.onnx",
    "/tmp/kokoro-local/voices.npz",
    espeak_config=conf,
)


def spoken(text: str) -> str:
    # A tela sempre mantém "look/looks"; isto só evita a leitura "ló-ocs".
    text = re.sub(r"\blooks\b", "lúks", text, flags=re.IGNORECASE)
    text = re.sub(r"\blook\b", "lúk", text, flags=re.IGNORECASE)
    text = re.sub(r"\bcloset\b", "clóset", text, flags=re.IGNORECASE)
    # Pausa breve só na locução para não fundir "Mil" e "Looks" na marca.
    text = re.sub(r"(Truque dos Mil) Lúks", r"\1, Lúks", text, flags=re.IGNORECASE)
    return text


def synth(speed: float) -> list[dict]:
    result = []
    for i, line in enumerate(lines):
        voice = "af_heart" if line["speaker"] == "Ana" else "af_sarah"
        text = spoken(line["text"])
        line_speed = 1.10 if i == len(lines) - 1 else speed
        audio, sr = kokoro.create(
            text,
            voice=voice,
            lang="pt-br",
            speed=line_speed,
            trim=True,
            sentence_pause=0.12,
            clause_pause=0.06,
        )
        assert sr == VOICE_SR
        audio = np.asarray(audio, dtype=np.float32)
        peak = float(np.max(np.abs(audio))) or 1.0
        audio = audio * min(1.0, 0.86 / peak)
        path = RAW / f"{i:02d}-{line['speaker'].lower()}.wav"
        sf.write(path, audio, sr, subtype="PCM_16")
        result.append({**line, "index": i, "voice": voice, "voice_speed": line_speed, "spoken": text,
                       "samples": audio, "speech_duration": len(audio) / sr})
    return result


def gaps_for(items: list[dict], extra_scene_gap: float = 0.0) -> list[float]:
    gaps = []
    for i, line in enumerate(items[:-1]):
        scene_change = items[i + 1]["scene"] != line["scene"]
        gap = 0.38 if scene_change else 0.16
        if scene_change:
            gap += extra_scene_gap
        gaps.append(gap)
    return gaps


def place(items: list[dict], extra_scene_gap: float = 0.0) -> list[dict]:
    gaps = gaps_for(items, extra_scene_gap)
    t = FIRST_START
    placed = []
    for i, item in enumerate(items):
        start = t
        end = start + item["speech_duration"]
        row = {k: v for k, v in item.items() if k != "samples"}
        row.update({"start": round(start, 6), "end": round(end, 6),
                    "duration": round(end - start, 6)})
        weights = [max(1, len(re.sub(r"\s+", "", p))) + (8 if p.endswith((".", "?", "!")) else 2)
                   for p in item["parts"]]
        total = sum(weights)
        cursor = start
        parts = []
        for j, (text, weight) in enumerate(zip(item["parts"], weights)):
            part_end = end if j == len(weights) - 1 else cursor + item["speech_duration"] * weight / total
            parts.append({"text": text, "start": round(cursor, 6), "end": round(part_end, 6)})
            cursor = part_end
        row["parts"] = parts
        placed.append(row)
        t = end + (gaps[i] if i < len(gaps) else 0.0)
    return placed


# Ajusta a velocidade somente se a fala ultrapassar o alvo; pausas de cena são
# usadas para dar respiro às demonstrações sem acelerar artificialmente a voz.
speed = 1.25
items = synth(speed)
placed = place(items)
speech_total = sum(x["speech_duration"] for x in items)
gaps_total = sum(gaps_for(items))
available_speech = VOICE_END_TARGET - FIRST_START - gaps_total
if speech_total > available_speech:
    speed = min(1.35, 1.012 * speech_total / available_speech)
    items = synth(speed)
    placed = place(items)

voice_end = placed[-1]["end"]
extra_scene_gap = 0.0
if voice_end < VOICE_END_TARGET:
    scene_changes = sum(1 for a, b in zip(lines, lines[1:]) if a["scene"] != b["scene"])
    extra_scene_gap = (VOICE_END_TARGET - voice_end) / scene_changes
    placed = place(items, extra_scene_gap)

assert placed[-1]["end"] <= VOICE_END_TARGET + 0.02, placed[-1]["end"]

n = int(DURATION * SR)
voice = np.zeros(n, dtype=np.float32)
for item, row in zip(items, placed):
    raw = item["samples"]
    # Kokoro entrega 24 kHz; o master trabalha a 48 kHz.
    x_old = np.arange(len(raw), dtype=np.float32)
    x_new = np.arange(len(raw) * 2, dtype=np.float32) / 2.0
    up = np.interp(x_new, x_old, raw).astype(np.float32)
    start = int(round(row["start"] * SR))
    count = min(len(up), n - start)
    voice[start:start + count] += up[:count]

# Trilha original: harmonywarm, pulso discreto e arranjo que cresce na revelação.
rng = np.random.default_rng(20261028)
music = np.zeros((n, 2), dtype=np.float32)
beat = 60.0 / 100.0
bar = beat * 4


def pan_gains(pan: float) -> tuple[float, float]:
    angle = (pan + 1.0) * math.pi / 4.0
    return math.cos(angle), math.sin(angle)


def add_signal(start: float, signal: np.ndarray, amp: float, pan: float = 0.0):
    i = int(round(start * SR))
    if i >= n or i + len(signal) <= 0:
        return
    src_start = max(0, -i)
    i = max(0, i)
    count = min(len(signal) - src_start, n - i)
    if count <= 0:
        return
    left, right = pan_gains(pan)
    sig = signal[src_start:src_start + count] * amp
    music[i:i + count, 0] += sig * left
    music[i:i + count, 1] += sig * right


def midi(note: float) -> float:
    return 440.0 * 2 ** ((note - 69.0) / 12.0)


def epiano(freq: float, seconds: float) -> np.ndarray:
    t = np.arange(int(seconds * SR), dtype=np.float32) / SR
    env = (1 - np.exp(-t * 90)) * np.exp(-t * 2.7)
    sig = (np.sin(2 * np.pi * freq * t)
           + 0.32 * np.sin(2 * np.pi * freq * 2 * t)
           + 0.11 * np.sin(2 * np.pi * freq * 3 * t))
    trem = 0.92 + 0.08 * np.sin(2 * np.pi * 4.2 * t)
    return (sig * env * trem).astype(np.float32)


def pluck(freq: float, seconds: float = 0.42) -> np.ndarray:
    t = np.arange(int(seconds * SR), dtype=np.float32) / SR
    env = (1 - np.exp(-t * 160)) * np.exp(-t * 10)
    return ((np.sin(2 * np.pi * freq * t) + 0.24 * np.sin(2 * np.pi * freq * 2 * t)) * env).astype(np.float32)


def kick() -> np.ndarray:
    t = np.arange(int(0.34 * SR), dtype=np.float32) / SR
    phase = 2 * np.pi * (47 * t + 42 * (1 - np.exp(-t * 28)) / 28)
    return (np.sin(phase) * np.exp(-t * 14) * (1 - np.exp(-t * 250))).astype(np.float32)


def hat(seconds: float = 0.09) -> np.ndarray:
    t = np.arange(int(seconds * SR), dtype=np.float32) / SR
    noise = rng.standard_normal(len(t)).astype(np.float32)
    # Diferenciação simples reduz grave sem depender de filtros externos.
    noise = np.concatenate(([0.0], np.diff(noise))).astype(np.float32)
    return (noise * np.exp(-t * 48) * 0.22).astype(np.float32)


def soft_snap() -> np.ndarray:
    t = np.arange(int(0.18 * SR), dtype=np.float32) / SR
    noise = rng.standard_normal(len(t)).astype(np.float32)
    smooth = np.convolve(noise, np.ones(9, dtype=np.float32) / 9, mode="same")
    return (smooth * np.exp(-t * 24) * 0.45).astype(np.float32)


# Dm9 – Bbmaj7 – Fadd9 – Cadd9; cada acorde dura um compasso.
chords = [
    ([50, 57, 60, 64, 65], 38),
    ([46, 53, 57, 60, 62], 34),
    ([41, 48, 53, 57, 60], 41),
    ([48, 55, 60, 62, 64], 36),
]
scene_by_time = []
for row in placed:
    scene_by_time.append((row["start"], row["scene"]))
reveal_time = next(r["start"] for r in placed if r["scene"] == "reveal")
product_time = next(r["start"] for r in placed if r["scene"] == "closet")
endcard_time = next(r["start"] for r in placed if r["scene"] == "endcard")

num_bars = int(math.ceil(DURATION / bar))
for b in range(num_bars):
    start = b * bar
    notes, bass = chords[b % len(chords)]
    intensity = 0.50 if start < reveal_time else (0.72 if start < product_time else 0.88)
    if start >= endcard_time:
        intensity = 0.58
    for j, note in enumerate(notes[1:]):
        add_signal(start + j * 0.025, epiano(midi(note), 2.25), 0.055 * intensity, -0.38 + j * 0.24)
    add_signal(start, epiano(midi(bass), 1.5), 0.065 * intensity, -0.05)
    # Arpejo em colcheias, com espaço para a locução.
    for k in range(8):
        note = notes[1 + (k % (len(notes) - 1))] + 12
        add_signal(start + k * beat / 2, pluck(midi(note)), 0.032 * intensity, -0.55 + (k % 4) * 0.34)
    if start >= reveal_time - 1.0:
        for k in range(4):
            add_signal(start + k * beat, kick(), 0.12 * intensity, 0.0)
            add_signal(start + k * beat + beat / 2, hat(), 0.06 * intensity, 0.42 if k % 2 else -0.42)
            if k in (1, 3):
                add_signal(start + k * beat, soft_snap(), 0.055 * intensity, 0.18)

# Whooshes discretos apenas nas mudanças de mundo visual.
scene_starts = []
last = None
for row in placed:
    if row["scene"] != last:
        scene_starts.append(row["start"])
        last = row["scene"]
for start in scene_starts[1:]:
    seconds = 0.42
    t = np.arange(int(seconds * SR), dtype=np.float32) / SR
    noise = rng.standard_normal(len(t)).astype(np.float32)
    smooth = np.convolve(noise, np.ones(25, dtype=np.float32) / 25, mode="same")
    env = np.sin(np.pi * t / seconds) ** 2
    add_signal(start - 0.21, smooth * env, 0.045, -0.25)

# Ducking calculado por RMS da voz em janelas de 20 ms.
block = int(0.02 * SR)
env_points = []
for i in range(0, n, block):
    chunk = voice[i:i + block]
    env_points.append(math.sqrt(float(np.mean(chunk * chunk)) + 1e-9))
env_x = np.arange(len(env_points)) * block
voice_env = np.interp(np.arange(n), env_x, env_points).astype(np.float32)
duck = 1.0 - 0.64 * np.clip(voice_env * 9.0, 0.0, 1.0)
music *= duck[:, None]

master = np.zeros((n, 2), dtype=np.float32)
master[:, 0] = voice * 0.94
master[:, 1] = voice * 0.94
master += music * 0.72
# Fade apenas no início e no fim do master, sem cortar a CTA.
fade_in = int(0.12 * SR)
master[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
fade_out = int(0.65 * SR)
master[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
peak = float(np.max(np.abs(master)))
if peak > 0.94:
    master *= 0.94 / peak

raw_path = AUDIO / "soundtrack-raw.wav"
final_path = AUDIO / "soundtrack.wav"
voice_path = AUDIO / "voiceover.wav"
sf.write(raw_path, master, SR, subtype="PCM_16")
sf.write(voice_path, voice, SR, subtype="PCM_16")

ffmpeg = "/tmp/hyperframes-test-bin/ffmpeg"
measure = subprocess.run(
    [ffmpeg, "-hide_banner", "-i", str(raw_path), "-af",
     "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"],
    text=True, capture_output=True, check=True,
)
match = re.search(r"\{\s*\"input_i\".*?\}", measure.stderr, flags=re.S)
if not match:
    raise RuntimeError("Não foi possível medir loudness")
stats = json.loads(match.group(0))
subprocess.run([
    ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw_path),
    "-af", (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={stats['input_i']}:"
            f"measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:"
            f"measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true"),
    "-ar", str(SR), "-c:a", "pcm_s16le", str(final_path),
], check=True)
raw_path.unlink()

# Cenas são derivadas da locução, não de tempos estimados manualmente.
scenes = []
for row in placed:
    if not scenes or scenes[-1]["id"] != row["scene"]:
        scenes.append({"id": row["scene"], "start": max(0.0, row["start"] - 0.24),
                       "first_line": row["index"]})
scenes[0]["start"] = 0.0
for i, scene in enumerate(scenes):
    scene["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else DURATION
    scene["duration"] = round(scene["end"] - scene["start"], 6)

timeline = {
    "brand": copy["brand"],
    "duration": DURATION,
    "fps": 60,
    "sample_rate": SR,
    "speed": speed,
    "extra_scene_gap": extra_scene_gap,
    "voice_end": placed[-1]["end"],
    "loudnorm_input": stats,
    "scenes": scenes,
    "lines": placed,
}
(BUILD / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=2) + "\n")
print(f"speed={speed:.4f} extra_scene_gap={extra_scene_gap:.3f}s")
for row in placed:
    print(f"{row['index']:02d} {row['scene']:8s} {row['speaker']:5s} {row['start']:6.2f}–{row['end']:6.2f}  {row['text']}")
print(f"VOICE_END={placed[-1]['end']:.3f}s FINAL_HOLD={DURATION - placed[-1]['end']:.3f}s")
print(f"WROTE {final_path}")
