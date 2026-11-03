#!/usr/bin/env python3
"""Prepara o CRIATIVO-2 de forma determinística: cortes, 1,2x, áudio e captions."""
from __future__ import annotations

import json
import math
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/original.mp4"
RAW_AUDIO = ROOT / "work/audio-raw.wav"
FINAL_AUDIO = ROOT / "public/criativo-2-audio.wav"
ASR_PATH = ROOT / "reports/asr-pass-1.json"
PROJECT_PATH = ROOT / "criativo-2-project.json"
TRANSCRIPT_PATH = ROOT / "criativo-2-transcript.json"
SRT_PATH = ROOT / "criativo-2-captions.srt"
ASS_PATH = ROOT / "criativo-2-captions.ass"
FPS = 24
SPEED = 1.2
SOURCE_FRAMES = 1344
# Intervalos removidos, em quadros da fonte. Todos ficam em pausas ou cauda.
CUT_FRAMES = [
    (84, 90),
    (183, 203),
    (284, 290),
    (378, 381),
    (573, 577),
    (765, 768),
    (889, 893),
    (951, 954),
    (1033, 1037),
    (1144, 1151),
    (1313, 1317),
    (1341, 1344),
]
KEPT_FRAMES = SOURCE_FRAMES - sum(end - start for start, end in CUT_FRAMES)
OUTPUT_FRAMES = round(KEPT_FRAMES / SPEED)
OUTPUT_DURATION = OUTPUT_FRAMES / FPS
# first, last, break_after (ou None), start_pad, end_pad, ênfases
CUE_SPECS = [
    (0, 6, 3, 0.00, 0.00, ["se vestir melhor"]),
    (7, 8, None, 0.00, 0.08, ["precisa entender"]),
    (9, 13, None, 0.06, 0.08, ["muitas roupas"]),
    (14, 19, 16, 0.10, 0.08, ["combinar"]),
    (20, 24, None, 0.05, 0.07, ["armário cheio"]),
    (25, 28, None, 0.05, 0.08, ["sempre igual"]),
    (29, 33, None, 0.05, 0.08, ["sem graça"]),
    (34, 38, 37, 0.10, 0.09, ["não entendia"]),
    (39, 42, None, 0.05, 0.08, ["solta"]),
    (43, 46, None, 0.05, 0.00, ["errada"]),
    (47, 50, 49, 0.00, 0.08, ["nenhum acessório"]),
    (51, 56, 54, 0.08, 0.19, ["não gostava"]),
    (57, 62, 59, 0.05, 0.08, ["mesma coisa"]),
    (63, 65, None, 0.05, 0.08, ["várias peças"]),
    (66, 75, 70, 0.05, 0.08, ["mesmo look sem graça"]),
    (76, 82, 79, 0.05, 0.08, ["evitar"]),
    (83, 86, None, 0.05, 0.08, ["descobri uma coisa"]),
    (87, 92, 89, 0.08, 0.08, ["não precisava"]),
    (93, 97, None, 0.06, 0.08, ["Truque dos Mil Looks"]),
    (98, 100, None, 0.08, 0.08, ["fotografei"]),
    (101, 103, None, 0.06, 0.00, ["closet"]),
    (104, 109, 106, 0.00, 0.08, ["combinações"]),
    (110, 119, 113, 0.08, 0.10, ["looks elegantes"]),
    (120, 129, 125, 0.08, 0.08, ["Truque dos Mil Looks", "novas combinações"]),
    (130, 131, None, 0.10, 0.26, ["Saiba mais!"]),
]
WORD_CORRECTIONS = {"têm.": "tem.", "porquê.": "por quê.", "Closet": "closet"}


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=True, text=True, capture_output=True)


def seconds(frames: float) -> float:
    return frames / FPS


def map_time(t: float) -> float:
    removed = 0.0
    for start, end in CUT_FRAMES:
        a, b = seconds(start), seconds(end)
        if t >= b:
            removed += b - a
        elif t > a:
            raise ValueError(f"Tempo dentro de corte: {t:.6f} em {a:.6f}–{b:.6f}")
    return (t - removed) / SPEED


def srt_time(t: float) -> str:
    ms = max(0, round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def ass_time(t: float) -> str:
    cs = max(0, round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def build_project() -> dict:
    asr = json.loads(ASR_PATH.read_text())
    words = []
    transcript_segments = []
    for seg in asr["segments"]:
        reviewed_words = []
        for word in seg["words"]:
            item = dict(word)
            token = item["word"].strip()
            item["word"] = WORD_CORRECTIONS.get(token, token)
            reviewed_words.append(item)
            words.append(item)
        transcript_segments.append({
            "id": seg["id"], "start": seg["start"], "end": seg["end"],
            "text": " ".join(w["word"].strip() for w in reviewed_words),
            "words": reviewed_words,
        })
    if len(words) != 132:
        raise ValueError(f"Transcrição mudou: esperadas 132 palavras, encontradas {len(words)}")
    cues = []
    covered = []
    for idx, (first, last, break_after, start_pad, end_pad, emphasis) in enumerate(CUE_SPECS, 1):
        selected = words[first:last + 1]
        covered.extend(range(first, last + 1))
        split = break_after if break_after is not None else None
        lines = []
        if split is None:
            lines.append(" ".join(w["word"].strip() for w in selected))
        else:
            lines.append(" ".join(w["word"].strip() for w in words[first:split + 1]))
            lines.append(" ".join(w["word"].strip() for w in words[split + 1:last + 1]))
        source_start = max(0.0, selected[0]["start"] - start_pad)
        source_end = selected[-1]["end"] + end_pad
        start, end = map_time(source_start), map_time(source_end)
        text = "\n".join(lines)
        cues.append({
            "id": idx, "first_word": first, "last_word": last,
            "source_start": source_start, "source_end": source_end,
            "start": start, "end": end, "duration": end - start,
            "lines": lines, "text": text, "emphasis": emphasis,
            "cps": len(text.replace("\n", "")) / (end - start),
        })
    if covered != list(range(132)):
        raise ValueError("As captions precisam cobrir cada palavra exatamente uma vez")
    project = {
        "project": "CRIATIVO-2",
        "source": {"file": "assets/original.mp4", "sha256": "94cbd37a9eb5255063f4f71aecc944521ddc0d4bf52fff7adba749c3c505ae9d", "duration": 56.0, "frames": SOURCE_FRAMES, "fps": FPS, "width": 720, "height": 1280},
        "edit": {"speed": SPEED, "pitch_preserved": True, "cut_frames": CUT_FRAMES, "removed_frames": SOURCE_FRAMES - KEPT_FRAMES, "removed_seconds": (SOURCE_FRAMES - KEPT_FRAMES) / FPS, "kept_frames": KEPT_FRAMES, "output_frames": OUTPUT_FRAMES, "output_duration": OUTPUT_DURATION},
        "look": {"description": "Contraste suave, realces quentes, sombras frias e vinheta discreta", "font": "Inter Caption", "font_size": 40, "max_lines": 2, "margin_v": 205, "color_space": "BT.709"},
        "captions": cues,
    }
    PROJECT_PATH.write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n")
    TRANSCRIPT_PATH.write_text(json.dumps({"language": "pt-BR", "segments": transcript_segments}, ensure_ascii=False, indent=2) + "\n")
    srt = []
    for cue in cues:
        srt.extend([str(cue["id"]), f'{srt_time(cue["start"])} --> {srt_time(cue["end"])}', cue["text"], ""])
    SRT_PATH.write_text("\n".join(srt))
    header = """[Script Info]
Title: CRIATIVO-2 — superlegendas editadas
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Inter Caption,40,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0.2,0,1,2.6,1.2,2,48,48,205,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    for cue in cues:
        lines = cue["lines"]
        for phrase in cue["emphasis"]:
            replaced = False
            for i, line in enumerate(lines):
                if phrase in line:
                    lines[i] = line.replace(phrase, r"{\1c&H00A7D8F2&}" + phrase + r"{\1c&H00FFFFFF&}", 1)
                    replaced = True
                    break
            if not replaced:
                raise ValueError(f'Ênfase não encontrada: {phrase!r} no bloco {cue["id"]}')
        text = r"\N".join(lines)
        events.append(f'Dialogue: 0,{ass_time(cue["start"])},{ass_time(cue["end"])},Caption,,0,0,0,,{{\\fad(50,50)}}{text}')
    ASS_PATH.write_text(header + "\n".join(events) + "\n")
    return project


def keep_intervals() -> list[tuple[int, int]]:
    keeps = []
    cursor = 0
    for start, end in CUT_FRAMES + [(SOURCE_FRAMES, SOURCE_FRAMES)]:
        if start > cursor:
            keeps.append((cursor, start))
        cursor = end
    return keeps


def build_audio() -> dict:
    keeps = keep_intervals()
    filters = []
    labels = []
    for i, (start, end) in enumerate(keeps):
        label = f"a{i}"
        labels.append(f"[{label}]")
        filters.append(f"[0:a]atrim=start={seconds(start):.9f}:end={seconds(end):.9f},asetpts=PTS-STARTPTS[{label}]")
    filters.append("".join(labels) + f"concat=n={len(keeps)}:v=0:a=1,atempo={SPEED},aresample=48000,aformat=channel_layouts=stereo[aout]")
    run(["ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE), "-filter_complex", ";".join(filters), "-map", "[aout]", "-c:a", "pcm_s24le", str(RAW_AUDIO)])
    measure = run(["ffmpeg", "-nostdin", "-hide_banner", "-nostats", "-i", str(RAW_AUDIO), "-af", "loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-"])
    match = re.search(r'\{\s*"input_i".*?\}', measure.stderr, re.S)
    if not match:
        raise RuntimeError("Não foi possível ler a medição do loudnorm")
    measured = json.loads(match.group(0))
    loudnorm = (
        "loudnorm=I=-16:TP=-1.5:LRA=7:"
        f'measured_I={measured["input_i"]}:measured_LRA={measured["input_lra"]}:'
        f'measured_TP={measured["input_tp"]}:measured_thresh={measured["input_thresh"]}:'
        f'offset={measured["target_offset"]}:linear=true:print_format=summary,aresample=48000'
    )
    run(["ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(RAW_AUDIO), "-af", loudnorm, "-t", f"{OUTPUT_DURATION:.9f}", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", str(FINAL_AUDIO)])
    report = {"target": {"integrated_lufs": -16.0, "true_peak_dbtp": -1.5, "lra_lu": 7.0}, "first_pass": measured, "second_pass": loudnorm, "duration_seconds": OUTPUT_DURATION, "tempo": SPEED, "pitch_preserved": True}
    (ROOT / "reports/audio-loudnorm.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    return report


def main() -> None:
    for path in [SOURCE, ASR_PATH]:
        if not path.exists():
            raise FileNotFoundError(path)
    RAW_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    FINAL_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    project = build_project()
    audio = build_audio()
    summary = {"status": "PASS", "captions": len(project["captions"]), "words": 132, "cut_intervals": len(CUT_FRAMES), "removed_seconds": project["edit"]["removed_seconds"], "output_frames": OUTPUT_FRAMES, "output_duration": OUTPUT_DURATION, "max_cps": max(c["cps"] for c in project["captions"]), "audio": str(FINAL_AUDIO.relative_to(ROOT)), "loudnorm": audio["target"]}
    (ROOT / "reports/prepare-report.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
