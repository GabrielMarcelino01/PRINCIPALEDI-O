#!/usr/bin/env python3
"""Validação estática reproduzível do criativo, sem depender de pacotes externos."""
from __future__ import annotations

import json
import re
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
T = json.loads((BUILD / "timeline.json").read_text())
checks: list[dict[str, object]] = []


def check(name: str, condition: bool, detail: object = "") -> None:
    checks.append({"name": name, "ok": bool(condition), "detail": detail})
    if not condition:
        raise AssertionError(f"{name}: {detail}")


check("duration_87s", T["duration"] == 87.0, T["duration"])
check("fps_60", T["fps"] == 60, T["fps"])
check("frames_5220", round(T["duration"] * T["fps"]) == 5220)
check("nineteen_lines", len(T["lines"]) == 19, len(T["lines"]))
check("eight_scenes", len(T["scenes"]) == 8, len(T["scenes"]))
check("voice_end_85s", abs(T["lines"][-1]["end"] - 85.0) < 1e-6, T["lines"][-1]["end"])
check("final_hold_2s", abs(T["duration"] - T["lines"][-1]["end"] - 2.0) < 1e-6)
check("brand", T["brand"] == "Truque dos Mil Looks", T["brand"])
check("final_cta", T["lines"][-1]["text"] == "Clique no link. Conheça o Truque dos Mil Looks.")

scene_by_id = {s["id"]: s for s in T["scenes"]}
for i, scene in enumerate(T["scenes"]):
    expected_end = T["scenes"][i + 1]["start"] if i + 1 < len(T["scenes"]) else T["duration"]
    check(f"scene_contiguous_{scene['id']}", abs(scene["end"] - expected_end) < 1e-6)
    check(f"scene_duration_{scene['id']}", abs(scene["duration"] - (scene["end"] - scene["start"])) < 1e-6)

caption_count = 0
for i, line in enumerate(T["lines"]):
    scene = scene_by_id[line["scene"]]
    check(f"line_{i:02d}_inside_scene", scene["start"] <= line["start"] <= line["end"] <= scene["end"] + 1e-6)
    check(f"line_{i:02d}_positive", line["end"] > line["start"])
    cursor = line["start"]
    for j, part in enumerate(line["parts"]):
        caption_count += 1
        check(f"caption_{i:02d}_{j}_start", abs(part["start"] - cursor) < 1e-6)
        check(f"caption_{i:02d}_{j}_positive", part["end"] > part["start"])
        check(f"caption_{i:02d}_{j}_text", bool(part["text"].strip()))
        cursor = part["end"]
    check(f"caption_{i:02d}_end", abs(cursor - line["end"]) < 1e-6)
check("caption_count_51", caption_count == 51, caption_count)

html_files = [ROOT / "index.html", *sorted((ROOT / "compositions").glob("*.html"))]
banned = re.compile(r"Math\.random|Date\.now|setTimeout|setInterval|requestAnimationFrame|@keyframes|https?://")
for path in html_files:
    text = path.read_text()
    check(f"deterministic_{path.name}", not banned.search(text))
    for ref in re.findall(r"(?:src=\"|url\(['\"]?)(assets/[^\"\')]+)", text):
        check(f"asset_{path.name}_{ref}", (ROOT / ref).is_file(), ref)

for scene in T["scenes"]:
    path = ROOT / "compositions" / f"{scene['id']}.html"
    text = path.read_text()
    check(f"timeline_paused_{scene['id']}", "gsap.timeline({paused:true})" in text)
    check(f"timeline_registered_{scene['id']}", f"window.__timelines['{scene['id']}']=tl" in text)
    check(f"timeline_seek_zero_{scene['id']}", "tl.seek(0)" in text)

for name, channels in [("voiceover.wav", 1), ("soundtrack.wav", 2)]:
    with wave.open(str(ROOT / "assets" / "audio" / name), "rb") as wav:
        duration = wav.getnframes() / wav.getframerate()
        check(f"{name}_sample_rate", wav.getframerate() == 48000, wav.getframerate())
        check(f"{name}_channels", wav.getnchannels() == channels, wav.getnchannels())
        check(f"{name}_duration", abs(duration - 87.0) < 1e-6, duration)

report = {
    "ok": True,
    "checks": len(checks),
    "caption_blocks": caption_count,
    "html_files": len(html_files),
    "results": checks,
}
(BUILD / "validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps({k: v for k, v in report.items() if k != "results"}, ensure_ascii=False, indent=2))
