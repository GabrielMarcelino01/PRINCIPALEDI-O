#!/usr/bin/env python3
"""Prepara a timeline editorial do ARMÁRIO-7 a partir da transcrição revisada."""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "assets" / "armario-7" / "ARMARIO-7.mp4"
TRANSCRIPT = json.loads((ROOT / "transcript.json").read_text(encoding="utf-8"))
FPS = 60
SOURCE_DURATION = 21.536979
FRAMES = math.ceil(SOURCE_DURATION * FPS)
DURATION = FRAMES / FPS
CUTS = [4.99499, 8.76966, 12.5684, 16.4527]

scene_data = [
    {
        "id": "cherry-ice", "short": "CHERRY × ICE", "labels": ["VERMELHO CEREJA", "CINZA GELO"],
        "colors": ["#a92f45", "#c9d5d8"], "accent": "#ff8595", "secondary": "#d9edf2",
    },
    {
        "id": "white-denim", "short": "WHITE × DENIM", "labels": ["BRANCO", "AZUL CLARO"],
        "colors": ["#f2efe7", "#8eb9d2"], "accent": "#a8ddff", "secondary": "#fff7e8",
    },
    {
        "id": "grape-sand", "short": "GRAPE × SAND", "labels": ["ROXO UVA", "AREIA"],
        "colors": ["#573568", "#d5c2a3"], "accent": "#d2afff", "secondary": "#ecd4ac",
    },
    {
        "id": "black-denim", "short": "BLACK × DENIM", "labels": ["PRETO", "AZUL JEANS"],
        "colors": ["#24262a", "#668dab"], "accent": "#91c8ff", "secondary": "#d3d7df",
    },
    {
        "id": "moss-black", "short": "MOSS × BLACK", "labels": ["VERDE MUSGO", "PRETO"],
        "colors": ["#626c4d", "#24262a"], "accent": "#c4d98f", "secondary": "#d3d7df",
    },
]

starts = [0.0] + CUTS
ends = CUTS + [DURATION]
scenes = []
for index, data in enumerate(scene_data):
    scenes.append({"start": starts[index], "end": ends[index], **data})

word_lengths = [len(segment["words"]) for segment in TRANSCRIPT["segments"]]
assert word_lengths == [10, 8, 8, 8, 8], word_lengths
offsets = [0, 10, 18, 26, 34]
words = []
for segment in TRANSCRIPT["segments"]:
    for word in segment["words"]:
        words.append({**word, "serif": False, "accent": False, "secondary": False})

# Cor principal, cor secundária e adjetivo final com serifada: apenas ênfase da fala real.
primary_local = [[1, 2], [2, 3], [0, 1], [2, 3], [0, 1]]
secondary_local = [[4, 5], [0], [3], [0], [3]]
for scene_index, offset in enumerate(offsets):
    for local in primary_local[scene_index]:
        words[offset + local]["accent"] = True
    for local in secondary_local[scene_index]:
        words[offset + local]["secondary"] = True
    words[offset + word_lengths[scene_index] - 1]["serif"] = True
    words[offset + word_lengths[scene_index] - 1]["accent"] = True
    words[offset + word_lengths[scene_index] - 1]["secondary"] = False

# Cada cena tem dois blocos de leitura; os índices são globais.
line_sets = [
    [[[0], [1, 2]], [[3, 4, 5], [6, 7, 8, 9]]],
    [[[10, 11, 12, 13]], [[14, 15], [16, 17]]],
    [[[18, 19, 20, 21]], [[22, 23], [24, 25]]],
    [[[26, 27, 28, 29]], [[30, 31], [32, 33]]],
    [[[34, 35, 36, 37]], [[38, 39], [40, 41]]],
]
groups = []
for scene_index, scene_groups in enumerate(line_sets):
    segment = TRANSCRIPT["segments"][scene_index]
    for group_index, lines in enumerate(scene_groups):
        flat = [word_index for line in lines for word_index in line]
        start = words[flat[0]]["start"]
        if group_index == 0:
            hold_end = words[line_sets[scene_index][1][0][0]]["start"]
        else:
            hold_end = segment["end"]
        groups.append({
            "scene": scene_index,
            "start": start,
            "holdEnd": hold_end,
            "lines": lines,
        })

assert len(words) == 42
assert len(groups) == 10
for group in groups:
    assert group["holdEnd"] > group["start"]
    assert [i for line in group["lines"] for i in line] == sorted(i for line in group["lines"] for i in line)

project = {
    "id": "armario-7",
    "title": "ARMÁRIO-7 — Vídeo original com superlegendas",
    "width": 1080,
    "height": 1920,
    "fps": FPS,
    "frames": FRAMES,
    "duration": DURATION,
    "sourceDuration": SOURCE_DURATION,
    "source": "../assets/armario-7/ARMARIO-7.mp4",
    "sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    "sourceCommit": "a9f47235ffd08ea0263d09bac198783e37c6d776",
    "scenes": scenes,
    "words": words,
"groups": groups,
}
assert project["sourceSha256"] == "cae26c943b49b427e36b63d83f1430cf4d47fc38b74dd1294c2a8b11d9f0cc21"
(ROOT / "project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(ROOT / "project.js").write_text("window.PROJECT = " + json.dumps(project, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")


def timestamp(seconds: float) -> str:
    milliseconds = max(0, round(seconds * 1000))
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    secs, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"


srt_lines = [
    ["Lembre-se, vermelho cereja com cinza gelo", "fica usado e magnético."],
    ["Branco com azul claro", "fica criativo e descontraído."],
    ["Roxo uva com areia", "fica autêntico e inesquecível."],
    ["Preto com azul jeans", "fica espetacular e carismático."],
    ["Verde musgo com preto", "fica imponente e irreverente."],
]
srt = []
for index, (segment, lines) in enumerate(zip(TRANSCRIPT["segments"], srt_lines, strict=True), start=1):
    assert " ".join(lines) == segment["text"]
    srt.extend([str(index), f"{timestamp(segment['start'])} --> {timestamp(segment['end'])}", *lines, ""])
(ROOT / "armario-7-captions.srt").write_text("\n".join(srt), encoding="utf-8")

report = {
    "project": project["id"], "source_sha256": project["sourceSha256"], "frames": FRAMES,
    "duration": DURATION, "cuts": CUTS, "segments": len(TRANSCRIPT["segments"]),
    "words": len(words), "caption_groups": len(groups), "scenes": len(scenes),
}
(ROOT / "reports" / "preparation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
