#!/usr/bin/env python3
"""Create deterministic SOFIA-1 voice edit, palette accents and final mix."""

from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = os.environ.get("FFMPEG_PATH", "ffmpeg")
RATE = 48000


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def main() -> None:
    project = json.loads((ROOT / "sofia-1-project.json").read_text())
    work = ROOT / "work/sofia-1/audio"
    work.mkdir(parents=True, exist_ok=True)
    source = ROOT.parent / "SOFIA-1 (1).mp4"
    voice = work / "voice-edit.wav"
    filters = []
    labels = []
    for index, scene in enumerate(project["scenes"]):
        label = f"v{index}"
        filters.append(
            f"[0:a]atrim=start={scene['sourceStart']:.3f}:end={scene['sourceEnd']:.3f},"
            f"asetpts=PTS-STARTPTS,highpass=f=65,lowpass=f=15500[{label}]"
        )
        labels.append(f"[{label}]")
    filters.append(f"{''.join(labels)}concat=n={len(labels)}:v=0:a=1[out]")
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
         "-filter_complex", ";".join(filters), "-map", "[out]", "-ar", str(RATE),
         "-ac", "2", "-c:a", "pcm_s24le", str(voice)])

    duration = project["duration"]
    count = round(duration * RATE)
    mix = np.zeros((count, 2), dtype=np.float64)
    # Short, restrained two-note accents on each editorial turn and the CTA.
    for scene_index, scene in enumerate(project["scenes"]):
        times = [scene["switchOutput"]] if scene.get("switchOutput") is not None else []
        if scene.get("cta"):
            times = [scene["start"] + 0.10]
        for event in times:
            start = round(event * RATE)
            length = round(0.42 * RATE)
            t = np.arange(length, dtype=np.float64) / RATE
            root = [392.0, 440.0, 349.23, 329.63, 523.25][scene_index]
            tone = np.zeros(length, dtype=np.float64)
            for offset, ratio, gain in [(0.0, 1.0, 0.020), (0.09, 1.5, 0.014)]:
                local = np.maximum(0.0, t - offset)
                envelope = (1.0 - np.exp(-local * 90.0)) * np.exp(-local * 13.0)
                envelope[t < offset] = 0.0
                tone += gain * envelope * (
                    np.sin(2 * np.pi * root * ratio * local)
                    + 0.25 * np.sin(2 * np.pi * root * ratio * 2.0 * local)
                )
            end = min(count, start + length)
            usable = end - start
            if usable > 0:
                pan = 0.10 if scene_index % 2 == 0 else -0.10
                mix[start:end, 0] += tone[:usable] * (1.0 - pan)
                mix[start:end, 1] += tone[:usable] * (1.0 + pan)
    # Fixed short fades avoid clicks; no random noise or accumulated state.
    fade = round(0.008 * RATE)
    mix[:fade] *= np.linspace(0.0, 1.0, fade)[:, None]
    mix[-fade:] *= np.linspace(1.0, 0.0, fade)[:, None]
    sfx = work / "palette-accents.wav"
    import wave
    with wave.open(str(sfx), "wb") as handle:
        handle.setnchannels(2)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())

    output = ROOT / "public/sofia-1-mix.wav"
    first_pass = work / "mix-first-pass.wav"
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(voice),
         "-i", str(sfx), "-filter_complex",
         "[0:a][1:a]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[out]",
         "-map", "[out]", "-ar", str(RATE), "-ac", "2", "-c:a", "pcm_s24le", str(first_pass)])
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(first_pass),
         "-af", "loudnorm=I=-14:TP=-1.2:LRA=11", "-ar", str(RATE), "-ac", "2",
         "-c:a", "pcm_s24le", str(output)])
    print(output)


if __name__ == "__main__":
    main()
