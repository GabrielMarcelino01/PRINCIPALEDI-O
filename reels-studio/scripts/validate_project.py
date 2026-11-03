#!/usr/bin/env python3
"""Valida a timeline e os assets da demo sem substituir o QA de mídia ou a revisão visual."""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports" / "project-qa.json"


def main() -> int:
    project = json.loads((ROOT / "project.json").read_text(encoding="utf-8"))
    checks: list[dict[str, str]] = []

    def check(name: str, condition: bool, detail: str) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "message": detail})

    check("dimensions", (project["width"], project["height"]) == (1080, 1920), f"{project['width']}x{project['height']}")
    check("frame_rate", project["fps"] == 60, f"{project['fps']} fps")
    check("duration", project["durationInFrames"] == 1200, f"{project['durationInFrames']} frames")
    check("scene_count", len(project["scenes"]) == 6, f"{len(project['scenes'])} cenas")
    check("unique_scene_ids", len({scene["id"] for scene in project["scenes"]}) == len(project["scenes"]), "IDs únicos")
    check("waveform", len(project["waveform"]) == 160 and all(0 <= value <= 1 for value in project["waveform"]), f"{len(project['waveform'])} bins normalizados")

    audio = ROOT / "public" / project["audio"]
    font = ROOT / "public" / "fonts" / "inter-latin-wght-normal.woff2"
    license_file = ROOT / "public" / "fonts" / "INTER-LICENSE.txt"
    check("audio_asset", audio.is_file() and audio.stat().st_size > 1000, str(audio.relative_to(ROOT)))
    check("font_asset", font.is_file() and font.stat().st_size > 1000, str(font.relative_to(ROOT)))
    check("font_license", license_file.is_file() and license_file.stat().st_size > 100, str(license_file.relative_to(ROOT)))

    safe = project["safeZones"]
    caption = project["captionStyle"]
    check("safe_zone_horizontal", caption["maxWidth"] <= project["width"] - safe["left"] - safe["right"], f"caption <= {project['width'] - safe['left'] - safe['right']} px")
    check("safe_zone_vertical", safe["top"] <= caption["top"] < project["height"] - safe["bottom"], f"caption top {caption['top']} px; limite inferior {project['height'] - safe['bottom']} px")

    expected_start = 0
    previous_group_end = -1.0
    words_total = 0
    groups_total = 0
    timing_ok = True
    groups_ok = True
    words_ok = True
    voice_ok = True
    for scene in project["scenes"]:
        if scene["startFrame"] != expected_start:
            timing_ok = False
        expected_start += scene["durationInFrames"]
        scene_start = scene["startFrame"] / project["fps"]
        scene_end = scene_start + scene["durationInFrames"] / project["fps"]
        if not (scene_start <= scene["voiceStart"] and scene["voiceStart"] + scene["voiceDuration"] <= scene_end - 0.05):
            voice_ok = False
        for group in scene["groups"]:
            groups_total += 1
            if not (scene_start <= group["start"] < group["end"] <= scene_end and group["start"] >= previous_group_end - 0.001):
                groups_ok = False
            previous_group_end = group["end"]
            previous_word_end = None
            for word in group["words"]:
                words_total += 1
                if not word["text"].strip() or not (group["start"] <= word["start"] < word["end"] <= group["end"] + 0.001):
                    words_ok = False
                if previous_word_end is not None and abs(word["start"] - previous_word_end) > 0.001:
                    words_ok = False
                previous_word_end = word["end"]
    if expected_start != project["durationInFrames"]:
        timing_ok = False
    check("scene_timeline", timing_ok, "Cenas contíguas, sem lacunas, total de 1.200 frames")
    check("voice_fit", voice_ok, "Todas as locuções limpas cabem nas cenas com respiro")
    check("caption_groups", groups_ok, f"{groups_total} grupos ordenados, dentro das cenas e sem sobreposição")
    check("word_timing", words_ok, f"{words_total} palavras com intervalos positivos e contíguos")

    audio_report = json.loads((ROOT / "audio-report.json").read_text(encoding="utf-8"))
    integrated = audio_report["integrated_lufs"]
    peak = audio_report["true_peak_dbtp"]
    check("soundtrack_loudness", math.isfinite(integrated) and abs(integrated + 14) <= 0.5, f"{integrated} LUFS; alvo −14 ± 0,5")
    check("soundtrack_true_peak", math.isfinite(peak) and peak <= -0.999, f"{peak} dBTP; máximo −1")
    check("srt_sidecar", (ROOT / "captions.srt").is_file(), "captions.srt presente; sintaxe validada separadamente")

    failures = [item for item in checks if item["status"] == "fail"]
    report = {
        "status": "PASS" if not failures else "FAIL",
        "scope": "Estrutura da timeline e presença de assets; não é inspeção do MP4 nem revisão audiovisual.",
        "summary": {"checks": len(checks), "passed": len(checks) - len(failures), "failed": len(failures), "scenes": len(project["scenes"]), "caption_groups": groups_total, "words": words_total},
        "checks": checks,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"{report['status']}: {REPORT.relative_to(ROOT)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
