#!/usr/bin/env python3
"""Monta narração, música/SFX originais, master e timeline da demo de Reels."""

from __future__ import annotations

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
VOICE = ROOT / "assets" / "voice"
WORK = ROOT / "work"
PUBLIC = ROOT / "public"
SR = 48_000
FPS = 60
TOTAL_FRAMES = 1200
DURATION = TOTAL_FRAMES / FPS

SCENES = [
    {
        "id": "hook", "label": "01 / GANCHO", "visual": "hook",
        "title": "O GANCHO VEM PRIMEIRO", "subtitle": "pare o scroll antes de explicar",
        "duration_frames": 204, "voice": "01-hook.mp3", "accent": "#ffc24b",
        "groups": [["SEU", "VÍDEO"], ["TEM", "TRÊS"], ["SEGUNDOS."]],
    },
    {
        "id": "guide", "label": "02 / LEITURA", "visual": "guide",
        "title": "UMA COISA DE CADA VEZ", "subtitle": "a legenda conduz, não compete",
        "duration_frames": 180, "voice": "02-captions.mp3", "accent": "#67e8f9",
        "groups": [["A", "LEGENDA"], ["GUIA", "O", "OLHAR."]],
    },
    {
        "id": "cuts", "label": "03 / RITMO", "visual": "cuts",
        "title": "CORTE COM INTENÇÃO", "subtitle": "ritmo não é pressa sem critério",
        "duration_frames": 180, "voice": "03-cuts.mp3", "accent": "#fb7185",
        "groups": [["O", "CORTE"], ["MANTÉM", "O", "RITMO."]],
    },
    {
        "id": "audio", "label": "04 / ÁUDIO", "visual": "audio",
        "title": "VOZ NA FRENTE", "subtitle": "música e efeitos abrem espaço",
        "duration_frames": 192, "voice": "04-audio.mp3", "accent": "#6ee7b7",
        "groups": [["ÁUDIO", "LIMPO"], ["ELEVA", "TUDO."]],
    },
    {
        "id": "motion", "label": "05 / MOTION", "visual": "motion",
        "title": "MOVIMENTO COM PROPÓSITO", "subtitle": "a ação explica a mudança",
        "duration_frames": 252, "voice": "05-motion.mp3", "accent": "#c4b5fd",
        "groups": [["MOTION", "COM", "INTENÇÃO,"], ["SEM", "EXAGERO."]],
    },
    {
        "id": "cta", "label": "06 / CTA", "visual": "cta",
        "title": "VAMOS EDITAR?", "subtitle": "sua próxima versão começa aqui",
        "duration_frames": 192, "voice": "06-cta.mp3", "accent": "#ffc24b",
        "groups": [["QUER", "EDITAR", "ASSIM?"], ["CHAMA", "AGORA."]],
    },
]


def tool(name: str) -> str:
    configured = os.environ.get(name.upper())
    found = configured or shutil.which(name)
    if not found:
        raise RuntimeError(f"{name} não encontrado. Configure PATH ou {name.upper()}.")
    return found


FFMPEG = tool("ffmpeg")
FFPROBE = tool("ffprobe")


def run(command: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, encoding="utf-8", errors="replace", check=False,
    )
    if check and result.returncode:
        raise RuntimeError(f"Comando falhou ({result.returncode}):\n{' '.join(command)}\n{result.stderr[-2500:]}")
    return result


def duration(path: Path) -> float:
    result = run([
        FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)
    ])
    return float(json.loads(result.stdout)["format"]["duration"])


def write_wav(path: Path, samples: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(samples, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(SR)
        output.writeframes(pcm.tobytes())


def add_signal(left: np.ndarray, right: np.ndarray, signal: np.ndarray, start: float, gain: float, pan: float = 0.0) -> None:
    begin = int(start * SR)
    if begin >= len(left):
        return
    end = min(len(left), begin + len(signal))
    signal = signal[:end - begin] * gain
    left[begin:end] += signal * math.sqrt((1 - pan) / 2)
    right[begin:end] += signal * math.sqrt((1 + pan) / 2)


def generate_music(path: Path) -> None:
    rng = np.random.default_rng(20261026)
    count = int(DURATION * SR)
    left = np.zeros(count, dtype=np.float64)
    right = np.zeros(count, dtype=np.float64)
    roots = [65.41, 51.91, 77.78, 58.27, 65.41]
    chords = [[1, 1.1892, 1.4983], [1, 1.2599, 1.4983], [1, 1.2599, 1.4983], [1, 1.1892, 1.4983], [1, 1.1892, 1.4983]]

    # Pad harmônico original, com envelopes suaves e pequena separação estéreo.
    for block in range(5):
        start = block * 4.0
        length = min(4.0, DURATION - start)
        x = np.arange(int(length * SR)) / SR
        envelope = np.clip(np.minimum(x / 0.45, (length - x) / 0.55), 0, 1)
        for index, ratio in enumerate(chords[block]):
            frequency = roots[block] * 2 * ratio
            pad_l = np.sin(2 * np.pi * frequency * x) + 0.22 * np.sin(2 * np.pi * frequency * 2 * x)
            pad_r = np.sin(2 * np.pi * (frequency * 1.0015) * x + 0.18) + 0.22 * np.sin(2 * np.pi * frequency * 2 * x)
            begin = int(start * SR)
            end = begin + len(x)
            left[begin:end] += pad_l * envelope * (0.023 - index * 0.003)
            right[begin:end] += pad_r * envelope * (0.023 - index * 0.003)

    for beat in range(40):
        start = beat * 0.5
        root = roots[min(4, int(start // 4))]
        x = np.arange(int(0.28 * SR)) / SR
        kick = np.sin(2 * np.pi * (52 * x + 1.8 * (1 - np.exp(-x * 24)))) * np.exp(-x * 17)
        add_signal(left, right, kick, start, 0.28)

        x = np.arange(int(0.36 * SR)) / SR
        bass = (np.sin(2 * np.pi * root * x) + 0.18 * np.sin(2 * np.pi * root * 2 * x)) * np.exp(-x * 7)
        add_signal(left, right, bass, start + 0.025, 0.085)

        if beat % 2 == 1:
            x = np.arange(int(0.22 * SR)) / SR
            noise = rng.normal(0, 1, len(x))
            snare = (noise * 0.42 + np.sin(2 * np.pi * 185 * x) * 0.35) * np.exp(-x * 22)
            add_signal(left, right, snare, start, 0.105, 0.08)

    for step in range(80):
        start = step * 0.25
        x = np.arange(int(0.055 * SR)) / SR
        noise = rng.normal(0, 1, len(x))
        high = np.concatenate([[0], np.diff(noise)])
        hat = high * np.exp(-x * 72)
        add_signal(left, right, hat, start, 0.022 if step % 2 else 0.032, -0.45 if step % 2 else 0.45)

        root = roots[min(4, int(start // 4))]
        ratios = [2, 2.3784, 2.9966, 3.5636]
        x = np.arange(int(0.20 * SR)) / SR
        pluck = np.sin(2 * np.pi * root * ratios[step % 4] * x) * np.exp(-x * 20)
        add_signal(left, right, pluck, start + 0.04, 0.018, 0.28 if step % 2 else -0.28)

    fade = np.ones(count)
    fade[:int(0.25 * SR)] = np.linspace(0, 1, int(0.25 * SR))
    fade[-int(0.9 * SR):] = np.linspace(1, 0, int(0.9 * SR))
    left *= fade
    right *= fade
    peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-6)
    if peak > 0.86:
        left *= 0.86 / peak
        right *= 0.86 / peak
    write_wav(path, np.column_stack([left, right]))


def generate_sfx(path: Path, scene_starts: list[float]) -> None:
    rng = np.random.default_rng(42)
    count = int(DURATION * SR)
    left = np.zeros(count, dtype=np.float64)
    right = np.zeros(count, dtype=np.float64)
    for index, start in enumerate(scene_starts[1:], start=1):
        x = np.arange(int(0.38 * SR)) / SR
        noise = rng.normal(0, 1, len(x))
        smooth = np.convolve(noise, np.ones(19) / 19, mode="same")
        envelope = np.sin(np.pi * x / 0.38) ** 2
        whoosh = smooth * envelope
        add_signal(left, right, whoosh, start - 0.12, 0.16, -0.65 if index % 2 else 0.65)

        x = np.arange(int(0.32 * SR)) / SR
        impact = np.sin(2 * np.pi * (62 * x + 0.6 * (1 - np.exp(-x * 18)))) * np.exp(-x * 15)
        add_signal(left, right, impact, start, 0.17)

    for start, frequency in [(17.05, 880), (19.1, 660)]:
        x = np.arange(int(0.34 * SR)) / SR
        chime = (np.sin(2 * np.pi * frequency * x) + 0.35 * np.sin(2 * np.pi * frequency * 1.5 * x)) * np.exp(-x * 13)
        add_signal(left, right, chime, start, 0.07, 0.18)
    write_wav(path, np.column_stack([left, right]))


def clean_voices() -> tuple[list[Path], list[float]]:
    paths: list[Path] = []
    durations: list[float] = []
    clean_dir = WORK / "clean-voice"
    clean_dir.mkdir(parents=True, exist_ok=True)
    for scene in SCENES:
        source = VOICE / scene["voice"]
        if not source.is_file():
            raise RuntimeError(f"Narração ausente: {source}")
        destination = clean_dir / f"{source.stem}.wav"
        run([
            FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(source),
            "-af", "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,areverse,aresample=48000",
            "-ac", "1", "-c:a", "pcm_s16le", str(destination),
        ])
        paths.append(destination)
        durations.append(duration(destination))
    return paths, durations


def build_narration(paths: list[Path], starts: list[float]) -> Path:
    destination = WORK / "narration.wav"
    inputs = [item for path in paths for item in ["-i", str(path)]]
    filters = []
    labels = []
    for index, start in enumerate(starts):
        delay = round(start * 1000)
        filters.append(f"[{index}:a]aformat=sample_fmts=fltp:channel_layouts=mono,adelay={delay}[v{index}]")
        labels.append(f"[v{index}]")
    filters.append(
        "".join(labels) + f"amix=inputs={len(paths)}:duration=longest:normalize=0,"
        "highpass=f=70,lowpass=f=16000,equalizer=f=2800:t=q:w=1:g=1.5,"
        "acompressor=threshold=0.1:ratio=2:attack=8:release=90:makeup=1.3,"
        f"apad=whole_dur={DURATION},atrim=0:{DURATION},pan=stereo|c0=c0|c1=c0[voice]"
    )
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", *inputs,
        "-filter_complex", ";".join(filters), "-map", "[voice]", "-ar", str(SR), "-ac", "2",
        "-c:a", "pcm_s24le", str(destination),
    ])
    return destination


def mix_audio(narration: Path, music: Path, sfx: Path) -> Path:
    destination = WORK / "mix-pre-master.wav"
    filters = (
        "[0:a]asplit=2[voice][key];"
        "[1:a][key]sidechaincompress=threshold=0.025:ratio=8:attack=12:release=220[ducked];"
        "[ducked]volume=0.38[music];"
        "[2:a]volume=0.45[sfx];"
        "[voice]volume=1.10[v];"
        f"[v][music][sfx]amix=inputs=3:duration=longest:normalize=0,atrim=0:{DURATION},alimiter=limit=0.94[pre]"
    )
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(narration), "-i", str(music), "-i", str(sfx),
        "-filter_complex", filters, "-map", "[pre]", "-ar", str(SR), "-ac", "2",
        "-c:a", "pcm_s24le", str(destination),
    ])
    return destination


def master_audio(source: Path) -> dict[str, float]:
    first = run([
        FFMPEG, "-nostdin", "-hide_banner", "-i", str(source),
        "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json", "-f", "null", "-",
    ])
    matches = re.findall(r'\{\s*"input_i".*?\}', first.stderr, flags=re.DOTALL)
    if not matches:
        raise RuntimeError(f"Não foi possível ler a medição do loudnorm: {first.stderr[-2000:]}")
    measured = json.loads(matches[-1])
    PUBLIC.mkdir(parents=True, exist_ok=True)
    master = PUBLIC / "soundtrack.wav"
    filter_chain = (
        "loudnorm=I=-14:TP=-1:LRA=7:"
        f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:"
        f"measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}:"
        f"offset={measured['target_offset']}:linear=true:print_format=summary,aresample={SR}"
    )
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(source),
        "-af", filter_chain, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(master),
    ])
    soundtrack = PUBLIC / "soundtrack.m4a"
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(master),
        "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-ac", "2", "-movflags", "+faststart", str(soundtrack),
    ])
    analysis = run([
        FFMPEG, "-nostdin", "-hide_banner", "-i", str(soundtrack),
        "-af", "ebur128=peak=true", "-f", "null", "-",
    ])
    integrated = re.findall(r"^\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", analysis.stderr, re.MULTILINE)
    peak = re.findall(r"^\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS", analysis.stderr, re.MULTILINE)
    return {
        "target_lufs": -14.0,
        "target_true_peak_dbtp": -1.0,
        "integrated_lufs": float(integrated[-1]) if integrated else float("nan"),
        "true_peak_dbtp": float(peak[-1]) if peak else float("nan"),
        "loudnorm_first_pass": measured,
    }


def waveform(narration: Path, bins: int = 160) -> list[float]:
    result = subprocess.run([
        FFMPEG, "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(narration),
        "-ac", "1", "-f", "f32le", "-",
    ], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    samples = np.frombuffer(result.stdout, dtype="<f4")
    chunks = np.array_split(samples, bins)
    values = [float(np.sqrt(np.mean(chunk ** 2))) if len(chunk) else 0.0 for chunk in chunks]
    peak = max(values) or 1.0
    return [round(min(1, value / peak), 4) for value in values]


def srt_time(value: float) -> str:
    millis = max(0, round(value * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    seconds, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"


def build_project(scene_starts: list[float], voice_starts: list[float], clean_durations: list[float], waves: list[float]) -> None:
    output_scenes = []
    srt_blocks = []
    for index, scene in enumerate(SCENES):
        start_frame = round(scene_starts[index] * FPS)
        voice_start = voice_starts[index]
        voice_duration = clean_durations[index]
        flat_words = [word for group in scene["groups"] for word in group]
        weights = [max(2, len(re.sub(r"[^\wÀ-ÿ]", "", word))) + 1 for word in flat_words]
        total_weight = sum(weights)
        cursor = voice_start
        word_index = 0
        output_groups = []
        for group_index, group in enumerate(scene["groups"]):
            words = []
            for text in group:
                word_duration = voice_duration * weights[word_index] / total_weight
                words.append({"text": text, "start": round(cursor, 5), "end": round(cursor + word_duration, 5)})
                cursor += word_duration
                word_index += 1
            hold = 0.20 if group_index == len(scene["groups"]) - 1 else 0.0
            group_end = min(scene_starts[index] + scene["duration_frames"] / FPS - 0.08, words[-1]["end"] + hold)
            output_groups.append({"start": words[0]["start"], "end": round(group_end, 5), "words": words})
            srt_blocks.append((words[0]["start"], group_end, " ".join(item["text"] for item in words)))
        output_scenes.append({
            "id": scene["id"], "label": scene["label"], "visual": scene["visual"],
            "title": scene["title"], "subtitle": scene["subtitle"], "accent": scene["accent"],
            "startFrame": start_frame, "durationInFrames": scene["duration_frames"],
            "start": round(scene_starts[index], 5), "voiceStart": round(voice_start, 5),
            "voiceDuration": round(voice_duration, 5), "groups": output_groups,
        })
    project = {
        "width": 1080, "height": 1920, "fps": FPS, "durationInFrames": TOTAL_FRAMES,
        "audio": "soundtrack.wav", "font": "Inter", "showSafeZones": False,
        "safeZones": {"top": 220, "bottom": 440, "right": 120, "left": 60},
        "captionStyle": {"top": 1190, "maxWidth": 900, "fontSize": 78},
        "scenes": output_scenes, "waveform": waves,
    }
    (ROOT / "project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    blocks = []
    for index, (start, end, text) in enumerate(srt_blocks, start=1):
        blocks.append(f"{index}\n{srt_time(start)} --> {srt_time(end)}\n{text}\n")
    (ROOT / "captions.srt").write_text("\n".join(blocks), encoding="utf-8")


def main() -> int:
    WORK.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    scene_starts = []
    cursor = 0
    for scene in SCENES:
        scene_starts.append(cursor / FPS)
        cursor += scene["duration_frames"]
    assert cursor == TOTAL_FRAMES
    voice_starts = [start + 0.25 for start in scene_starts]
    clean_paths, clean_durations = clean_voices()
    for scene, voice_start, voice_duration in zip(SCENES, voice_starts, clean_durations):
        scene_end = scene_starts[SCENES.index(scene)] + scene["duration_frames"] / FPS
        if voice_start + voice_duration > scene_end - 0.08:
            raise RuntimeError(f"Narração não cabe na cena {scene['id']}: {voice_duration:.3f}s")
    narration = build_narration(clean_paths, voice_starts)
    music = WORK / "music-original.wav"
    sfx = WORK / "sfx-original.wav"
    generate_music(music)
    generate_sfx(sfx, scene_starts)
    premaster = mix_audio(narration, music, sfx)
    audio_report = master_audio(premaster)
    waves = waveform(narration)
    build_project(scene_starts, voice_starts, clean_durations, waves)
    audio_report.update({
        "sample_rate": SR, "channels": 2, "duration_seconds": DURATION,
        "render_master": "soundtrack.wav — PCM 24 bits; uma única codificação AAC no MP4",
        "aac_preview": "soundtrack.m4a — prévia e medição independente",
        "voice_files": {scene["voice"]: round(value, 5) for scene, value in zip(SCENES, clean_durations)},
        "music": "Composição procedural original, sem samples",
        "sfx": "Síntese procedural original, sem samples",
    })
    (ROOT / "audio-report.json").write_text(json.dumps(audio_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(audio_report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(2)
