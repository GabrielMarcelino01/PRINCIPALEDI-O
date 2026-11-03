#!/usr/bin/env python3
"""Prepara a timeline do ARMÁRIO-8 a partir da transcrição revisada."""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "assets" / "armario-8" / "CLOSET-8.mp4"
TRANSCRIPT = json.loads((ROOT / "transcript.json").read_text(encoding="utf-8"))
FPS = 60
SOURCE_DURATION = 24.734
FRAMES = math.ceil(SOURCE_DURATION * FPS)
DURATION = FRAMES / FPS
CUTS = [4.96934, 9.55234, 14.1967, 18.733]

scene_data = [
    {"id": "green-black", "labels": ["VERDE", "PRETO"], "accent": "#8ee6b0", "secondary": "#d3d7df"},
    {"id": "lilac-graphite", "labels": ["LILÁS", "GRAFITE"], "accent": "#d7b8ff", "secondary": "#d3d7df"},
    {"id": "cobalt-chocolate", "labels": ["AZUL COBALTO", "CHOCOLATE"], "accent": "#82b5ff", "secondary": "#d6a57e"},
    {"id": "wine-silver", "labels": ["VINHO", "PRATA"], "accent": "#ff8ea5", "secondary": "#e1e5ea"},
    {"id": "rust-cream-close", "labels": ["ME SIGA", "LINK DA BIO"], "accent": "#ffd0a8", "secondary": "#f6ede1"},
]
starts = [0.0] + CUTS
ends = CUTS + [DURATION]
scenes = [{"start": starts[index], "end": ends[index], **data} for index, data in enumerate(scene_data)]

word_lengths = [len(segment["words"]) for segment in TRANSCRIPT["segments"]]
assert word_lengths == [8, 9, 8, 7, 20], word_lengths
offsets = [0, 8, 17, 25, 32]
words = []
for segment in TRANSCRIPT["segments"]:
    for word in segment["words"]:
        words.append({**word, "serif": False, "accent": False, "secondary": False})

# Cores da roupa e adjetivos são ênfases da própria fala, nunca texto adicional.
accent_local = [[1], [0], [0, 1], [0], [2, 11, 13]]
secondary_local = [[3], [2], [3], [2], []]
for scene_index, offset in enumerate(offsets):
    for local in accent_local[scene_index]:
        words[offset + local]["accent"] = True
    for local in secondary_local[scene_index]:
        words[offset + local]["secondary"] = True
for offset, length in zip(offsets, word_lengths, strict=True):
    final_word = words[offset + length - 1]
    final_word["serif"] = True
    final_word["accent"] = True
    final_word["secondary"] = False

# Cada item contém somente índices de palavras faladas. O último bloco não inclui o CTA gráfico.
group_specs = [
    (0, [[0], [1, 2, 3]], words[4]["start"]),
    (0, [[4, 5, 6], [7]], TRANSCRIPT["segments"][0]["end"]),
    (1, [[8, 9, 10]], words[11]["start"]),
    (1, [[11, 12]], words[13]["start"]),
    (1, [[13, 14], [15, 16]], TRANSCRIPT["segments"][1]["end"]),
    (2, [[17, 18], [19, 20]], words[21]["start"]),
    (2, [[21, 22], [23, 24]], TRANSCRIPT["segments"][2]["end"]),
    (3, [[25, 26, 27]], words[28]["start"]),
    (3, [[28, 29], [30, 31]], TRANSCRIPT["segments"][3]["end"]),
    (4, [[32]], words[33]["start"]),
    (4, [[33, 34, 35, 36], [37, 38, 39]], words[40]["start"]),
    (4, [[40, 41, 42, 43, 44, 45]], words[46]["start"]),
    (4, [[46, 47, 48, 49], [50, 51]], TRANSCRIPT["segments"][4]["end"]),
]
groups = []
for scene_index, lines, hold_end in group_specs:
    flat = [word_index for line in lines for word_index in line]
    assert flat == sorted(flat)
    assert hold_end > words[flat[0]]["start"]
    groups.append({"scene": scene_index, "start": words[flat[0]]["start"], "holdEnd": hold_end, "lines": lines})

assert len(words) == 52
assert len(groups) == 13
assert sorted(i for group in groups for line in group["lines"] for i in line) == list(range(52))

project = {
    "id": "armario-8",
    "title": "ARMÁRIO-8 — Superlegendas e + SEGUIR",
    "width": 1080,
    "height": 1920,
    "fps": FPS,
    "frames": FRAMES,
    "duration": DURATION,
    "sourceDuration": SOURCE_DURATION,
    "source": "../assets/armario-8/CLOSET-8.mp4",
    "sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    "sourceCommit": "4edf4a8cf9a68fbe94aee30da695ab46f80fc854",
    "sourceBlob": "7ec0f78a7295861068a2e01c23df1d9d06b3522a",
    "scenes": scenes,
    "words": words,
    "groups": groups,
    "followCta": {
        "start": DURATION - 2.0,
        "top": 1430,
        "text": "+ SEGUIR",
        "library": "instagram-follow",
        "libraryCommit": "85fdc9aa888b4d26c8150fd09acae7b23fb392f5",
    },
}
assert project["sourceSha256"] == "a42302bb65aa3cb5c8e21e65f239f525748d10dbefc7de2e8077ab0283bb26ed"
(ROOT / "project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(ROOT / "project.js").write_text("window.PROJECT = " + json.dumps(project, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")


def timestamp(seconds: float) -> str:
    milliseconds = max(0, round(seconds * 1000))
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    secs, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"


srt_entries = [
    (0.0, 4.74, ["Lembre-se, verde com preto", "fica usado e sofisticado."]),
    (5.12, 9.50, ["Lilás com grafite fica fit,", "fica original e marcante."]),
    (9.84, 14.08, ["Azul cobalto com chocolate", "fica artístico e surpreendente."]),
    (14.42, 17.08, ["Vinho com prata fica moderno", "e irresistível."]),
    (18.50, 21.46, ["Gostou? Me siga para mais", "conteúdos como esse"]),
    (21.46, 24.34, ["e clique no link da bio", "para aprender a se vestir melhor."]),
]
expected_texts = [
    "Lembre-se, verde com preto fica usado e sofisticado.",
    "Lilás com grafite fica fit, fica original e marcante.",
    "Azul cobalto com chocolate fica artístico e surpreendente.",
    "Vinho com prata fica moderno e irresistível.",
    "Gostou? Me siga para mais conteúdos como esse e clique no link da bio para aprender a se vestir melhor.",
]
assert [segment["text"] for segment in TRANSCRIPT["segments"]] == expected_texts
assert [" ".join(lines) for _, _, lines in srt_entries[:4]] == expected_texts[:4]
assert " ".join(" ".join(lines) for _, _, lines in srt_entries[4:]) == expected_texts[4]
srt = []
for index, (start, end, lines) in enumerate(srt_entries, start=1):
    srt.extend([str(index), f"{timestamp(start)} --> {timestamp(end)}", *lines, ""])
(ROOT / "armario-8-captions.srt").write_text("\n".join(srt), encoding="utf-8")

(ROOT / "reports").mkdir(parents=True, exist_ok=True)
report = {
    "project": project["id"], "source_sha256": project["sourceSha256"], "frames": FRAMES,
    "duration": DURATION, "cuts": CUTS, "segments": len(TRANSCRIPT["segments"]),
    "words": len(words), "caption_groups": len(groups), "srt_blocks": len(srt_entries),
    "scenes": len(scenes), "follow_start": project["followCta"]["start"],
}
(ROOT / "reports" / "preparation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
