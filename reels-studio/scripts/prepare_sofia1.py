#!/usr/bin/env python3
"""Build the reviewed SOFIA-1 editorial timeline and caption sidecar."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
AUTO = ROOT / "sofia-1-transcript-auto.json"
SOURCE = ROOT.parent / "SOFIA-1 (1).mp4"
SOURCE_SHA256 = "99ddaeacbe8ceffe512c37a54b3633f98672696b385085243476d72a8751a858"
FPS = 60

SCENES = [
    {"id": "bordo", "sourceStart": 0.0, "sourceEnd": 5.08, "switch": 2.16,
     "baseName": "BORDÔ", "base": "#711F3B", "oldName": "CINZA", "old": "#929598",
     "newName": "PISTACHE", "new": "#B9D97B", "oldDescriptor": "DISCRETO", "newDescriptor": "FASHIONISTA"},
    {"id": "marinho", "sourceStart": 5.46, "sourceEnd": 11.14, "switch": 7.80,
     "baseName": "MARINHO", "base": "#172B49", "oldName": "BRANCO", "old": "#F1EFE7",
     "newName": "MANTEIGA", "new": "#F2D78E", "oldDescriptor": "ATEMPORAL", "newDescriptor": "CONTEMPORÂNEO"},
    {"id": "marrom", "sourceStart": 11.86, "sourceEnd": 17.64, "switch": 14.52,
     "baseName": "MARROM CAFÉ", "base": "#5B3729", "oldName": "BEGE", "old": "#D4BE9E",
     "newName": "AZUL CLARO", "new": "#A8CDDA", "oldDescriptor": "CLÁSSICO", "newDescriptor": "REFINADO"},
    {"id": "rosa", "sourceStart": 18.02, "sourceEnd": 24.02, "switch": 20.54,
     "baseName": "ROSA CLARO", "base": "#E5A9B8", "oldName": "AZUL BEBÊ", "old": "#ADD3E2",
     "newName": "VINHO", "new": "#781F3C", "textAccent": "#F0B7C7", "oldDescriptor": "ROMÂNTICO", "newDescriptor": "SOFISTICADO"},
    {"id": "cta", "sourceStart": 24.64, "sourceEnd": 27.20, "cta": True,
     "baseName": "MODA", "base": "#711F3B", "new": "#B9D97B"},
]

# Caption lines as ranges into each automatic segment's corrected word list.
GROUPS = [
    [[(0, 3), (3, 5)], [(5, 8), (8, 10)], [(10, 12)]],
    [[(0, 3), (3, 5)], [(5, 8), (8, 10)], [(10, 12), (12, 14)]],
    [[(0, 4), (4, 6)], [(6, 9), (9, 12)], [(12, 14), (14, 16)]],
    [[(0, 5), (5, 7)], [(7, 10), (10, 12)], [(12, 14), (14, 16)]],
    [[(0, 1)], [(1, 5), (5, 8)]],
]
CORRECTIONS = {
    (0, 0): "Bordô", (0, 4): "discreto,", (0, 6): "bordô",
    (1, 4): "atemporal,", (3, 8): "rosa",
}


def timestamp(seconds: float, srt: bool = False) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    separator = "," if srt else "."
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{separator}{millis:03d}"


def main() -> None:
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != SOURCE_SHA256:
        raise SystemExit("SOFIA-1 source checksum does not match the reviewed original.")
    (ROOT / "public").mkdir(exist_ok=True)
    shutil.copy2(SOURCE, ROOT / "public/sofia-1-source.mp4")
    auto = json.loads(AUTO.read_text(encoding="utf-8"))
    output_start = 0.0
    captions = []
    for scene_index, (scene, segment, group_spec) in enumerate(zip(SCENES, auto["segments"], GROUPS)):
        source_duration = scene["sourceEnd"] - scene["sourceStart"]
        scene_end = output_start + source_duration
        scene.update({
            "index": scene_index,
            "start": output_start,
            "end": scene_end,
            "duration": source_duration,
            "startFrame": round(output_start * FPS),
            "endFrame": round(scene_end * FPS),
            "switchOutput": output_start + scene["switch"] - scene["sourceStart"] if "switch" in scene else None,
        })
        scene["durationInFrames"] = scene["endFrame"] - scene["startFrame"]
        words = []
        for word_index, original in enumerate(segment["words"]):
            word = dict(original)
            word["text"] = CORRECTIONS.get((scene_index, word_index), word.pop("word").strip())
            word["startOutput"] = output_start + word["start"] - scene["sourceStart"]
            word["endOutput"] = output_start + word["end"] - scene["sourceStart"]
            words.append(word)
        scene["words"] = words
        for group_index, line_specs in enumerate(group_spec):
            lines = []
            for start, end in line_specs:
                lines.append(words[start:end])
            group_words = [word for line in lines for word in line]
            captions.append({
                "id": f"{scene['id']}-{group_index + 1}",
                "scene": scene["id"],
                "start": group_words[0]["startOutput"],
                "end": group_words[-1]["endOutput"] + (0.10 if group_index == len(group_spec) - 1 else 0.0),
                "lines": lines,
            })
        output_start += source_duration

    project = {
        "schemaVersion": 1,
        "id": "SOFIA-1",
        "title": "SOFIA / COLOR NOTES",
        "fps": FPS,
        "width": 1080,
        "height": 1920,
        "durationInFrames": round(output_start * FPS),
        "duration": output_start,
        "video": "sofia-1-source.mp4",
        "audio": "sofia-1-mix.wav",
        "source": {
            "name": "SOFIA-1 (1).mp4",
            "sha256": "99ddaeacbe8ceffe512c37a54b3633f98672696b385085243476d72a8751a858",
            "width": 720, "height": 1280, "fps": 23.960,
        },
        "captionStyle": {"top": 1375, "fontSize": 52, "maxWidth": 920},
        "scenes": SCENES,
        "captions": captions,
        "tracking": None,
        "safeZones": {"top": 80, "bottom": 250, "left": 48, "right": 110},
    }
    assert project["durationInFrames"] == 1506, project["durationInFrames"]
    assert all(group["start"] >= 0 and group["end"] <= project["duration"] for group in captions)
    (ROOT / "sofia-1-project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "sofia-1-transcript-reviewed.json").write_text(json.dumps({"language": "pt", "scenes": SCENES}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    blocks = []
    for index, group in enumerate(captions, 1):
        text = "\n".join(" ".join(word["text"] for word in line) for line in group["lines"])
        blocks.append(f"{index}\n{timestamp(group['start'], True)} --> {timestamp(group['end'], True)}\n{text}\n")
    (ROOT / "sofia-1-captions.srt").write_text("\n".join(blocks), encoding="utf-8")
    print(json.dumps({"duration": output_start, "frames": project["durationInFrames"], "captions": len(captions)}, indent=2))


if __name__ == "__main__":
    main()
