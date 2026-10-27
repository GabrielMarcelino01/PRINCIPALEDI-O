#!/usr/bin/env python3
"""Trilha e sound design originais, determinísticos, para o ARMÁRIO-7."""
from __future__ import annotations

import json
from pathlib import Path
import wave

import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
OUT.mkdir(parents=True, exist_ok=True)
PROJECT = json.loads((ROOT / "project.json").read_text(encoding="utf-8"))
SR = 48_000
DURATION = float(PROJECT["duration"])
N = round(DURATION * SR)
MIX = np.zeros((N, 2), dtype=np.float64)

CHORDS = [
    [146.83, 185.00, 220.00, 329.63],  # Dmaj9
    [123.47, 146.83, 185.00, 220.00],  # Bm7
    [98.00, 123.47, 146.83, 185.00],   # Gmaj7
    [110.00, 146.83, 164.81, 196.00],  # A7sus
    [146.83, 185.00, 220.00, 329.63],  # Dmaj9
]


def add_mono(signal: np.ndarray, start: float, pan: float = 0.0, gain: float = 1.0) -> None:
    first = max(0, round(start * SR))
    if first >= N:
        return
    signal = signal[: N - first] * gain
    angle = (pan + 1.0) * np.pi / 4.0
    MIX[first:first + len(signal), 0] += signal * np.cos(angle)
    MIX[first:first + len(signal), 1] += signal * np.sin(angle)


def scene_at(time: float) -> int:
    for index in range(len(PROJECT["scenes"]) - 1, -1, -1):
        if time >= PROJECT["scenes"][index]["start"]:
            return index
    return 0


# Pad harmônico: acorde por look, envelope suave e fase fixa.
for scene_index, scene in enumerate(PROJECT["scenes"]):
    start = float(scene["start"])
    end = min(DURATION, float(scene["end"]))
    count = max(1, round((end - start) * SR))
    t = np.arange(count, dtype=np.float64) / SR
    u = t / max(end - start, 1 / SR)
    envelope = np.sin(np.pi * np.clip(u, 0, 1)) ** 0.72
    for note_index, frequency in enumerate(CHORDS[scene_index]):
        phase = 0.37 * note_index + 0.19 * scene_index
        vibrato = 0.12 * np.sin(2 * np.pi * 0.18 * t + phase)
        signal = (
            0.014 * np.sin(2 * np.pi * frequency * t + vibrato + phase)
            + 0.0045 * np.sin(2 * np.pi * frequency * 2 * t + phase * 0.5)
        ) * envelope
        add_mono(signal, start, pan=-0.42 + note_index * 0.28)


# Pulso elegante a 120 BPM: notas curtas alternadas, grave contido e ticks metálicos.
beat = 60.0 / 120.0
for index in range(int(DURATION / beat) + 1):
    start = index * beat + 0.025
    scene_index = scene_at(start)
    chord = CHORDS[scene_index]
    length = min(0.46, DURATION - start)
    if length <= 0:
        continue
    t = np.arange(round(length * SR), dtype=np.float64) / SR
    attack = 1 - np.exp(-120 * t)
    frequency = chord[index % len(chord)] * 2
    pluck = attack * (
        0.023 * np.exp(-6.2 * t) * np.sin(2 * np.pi * frequency * t)
        + 0.006 * np.exp(-9.5 * t) * np.sin(2 * np.pi * frequency * 2 * t)
    )
    add_mono(pluck, start, pan=-0.32 if index % 2 else 0.32)
    if index % 2 == 0:
        kick_t = np.arange(round(min(0.26, length) * SR), dtype=np.float64) / SR
        phase = 2 * np.pi * (48 * kick_t + 2.1 * (1 - np.exp(-18 * kick_t)))
        kick = 0.058 * np.exp(-18 * kick_t) * np.sin(phase)
        add_mono(kick, start, pan=0.0)
    else:
        hat_t = np.arange(round(min(0.09, length) * SR), dtype=np.float64) / SR
        hat = 0.006 * np.exp(-58 * hat_t) * (
            np.sin(2 * np.pi * 6200 * hat_t) + 0.45 * np.sin(2 * np.pi * 8300 * hat_t)
        )
        add_mono(hat, start, pan=0.24)


# Quatro whooshes e impactos, exatamente nos cortes detectados.
for cut_index, scene in enumerate(PROJECT["scenes"][1:], 1):
    cut = float(scene["start"])
    whoosh_start = cut - 0.29
    length = 0.34
    t = np.arange(round(length * SR), dtype=np.float64) / SR
    u = t / length
    rng = np.random.default_rng(7000 + cut_index)  # seed fixa; nada muda entre renders
    noise = rng.normal(0, 1, len(t))
    filtered = np.convolve(noise, np.ones(18) / 18, mode="same")
    envelope = np.clip(u, 0, 1) ** 1.45 * (1 - np.clip(u, 0, 1)) ** 0.42
    whoosh = 0.115 * filtered * envelope
    first = round(whoosh_start * SR)
    count = min(len(whoosh), N - first)
    pan_curve = -0.65 + 1.3 * u[:count]
    MIX[first:first + count, 0] += whoosh[:count] * np.cos((pan_curve + 1) * np.pi / 4)
    MIX[first:first + count, 1] += whoosh[:count] * np.sin((pan_curve + 1) * np.pi / 4)

    impact_t = np.arange(round(0.36 * SR), dtype=np.float64) / SR
    impact = (
        0.12 * np.exp(-13 * impact_t) * np.sin(2 * np.pi * 58 * impact_t)
        + 0.014 * np.exp(-28 * impact_t) * np.sin(2 * np.pi * 1240 * impact_t)
    )
    add_mono(impact, cut, pan=0.0)
    sparkle = 0.006 * np.exp(-38 * impact_t) * np.sin(2 * np.pi * 1980 * impact_t)
    add_mono(sparkle, cut + 0.025, pan=0.38 if cut_index % 2 else -0.38)


# Saturação suave e proteção de pico do bed, sem alterar a voz original.
MIX[:] = np.tanh(MIX * 1.15) / 1.15
peak = float(np.max(np.abs(MIX)))
if peak > 0.72:
    MIX *= 0.72 / peak
pcm = np.round(np.clip(MIX, -1, 1) * 32767).astype("<i2")
with wave.open(str(OUT / "design-bed.wav"), "wb") as output:
    output.setnchannels(2)
    output.setsampwidth(2)
    output.setframerate(SR)
    output.writeframes(pcm.tobytes())

meta = {
    "sample_rate": SR,
    "channels": 2,
    "duration": DURATION,
    "samples_per_channel": N,
    "peak_pcm": float(np.max(np.abs(pcm.astype(np.float64) / 32767))),
    "bpm": 120,
    "cut_impacts": [scene["start"] for scene in PROJECT["scenes"][1:]],
    "deterministic_seeds": [7001, 7002, 7003, 7004],
    "source": "Síntese original; nenhuma música ou sample externo.",
}
(OUT / "design-meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(meta, ensure_ascii=False))
