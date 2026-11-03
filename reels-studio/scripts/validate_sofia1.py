#!/usr/bin/env python3
"""Validate SOFIA-1 timeline, reviewed text, assets and deterministic layout."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports/sofia-1-project-qa.json"
EXPECTED_SHA = "99ddaeacbe8ceffe512c37a54b3633f98672696b385085243476d72a8751a858"


def main() -> int:
    project = json.loads((ROOT / "sofia-1-project.json").read_text(encoding="utf-8"))
    checks = []

    def check(name: str, condition: bool, detail: str) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "detail": detail})

    check("dimensions", (project["width"], project["height"]) == (1080, 1920), "1080x1920")
    check("fps", project["fps"] == 60, "60 fps")
    check("duration", project["durationInFrames"] == 1506 and abs(project["duration"] - 25.1) < 1e-9, "1506 frames / 25,1 s")
    source = ROOT.parent / "SOFIA-1 (1).mp4"
    check("source_integrity", source.is_file() and hashlib.sha256(source.read_bytes()).hexdigest() == EXPECTED_SHA, EXPECTED_SHA)
    for name in ["public/sofia-1-source.mp4", "public/sofia-1-mix.wav", "public/fonts/inter-latin-wght-normal.woff2", "public/fonts/playfair-display-latin-wght-italic.woff2"]:
        path = ROOT / name
        check(f"asset:{name}", path.is_file() and path.stat().st_size > 1000, f"{path.stat().st_size if path.exists() else 0} bytes")

    scenes = project["scenes"]
    check("scene_count", len(scenes) == 5 and scenes[-1].get("cta") is True, "quatro exemplos e CTA")
    contiguous = scenes[0]["startFrame"] == 0 and scenes[-1]["endFrame"] == 1506
    for index, scene in enumerate(scenes):
        contiguous = contiguous and scene["endFrame"] - scene["startFrame"] == scene["durationInFrames"]
        contiguous = contiguous and scene["sourceEnd"] > scene["sourceStart"]
        if index:
            contiguous = contiguous and scene["startFrame"] == scenes[index - 1]["endFrame"]
    check("scene_frame_boundaries", contiguous, "cenas contíguas, sem gaps ou sobreposição de frames")

    captions = project["captions"]
    check("caption_count", len(captions) == 14, "14 grupos")
    ordered = True
    lines_ok = True
    words_ok = True
    word_count = 0
    previous_end = 0.0
    for group in captions:
        ordered = ordered and group["start"] >= previous_end and group["start"] < group["end"] <= project["duration"]
        previous_end = group["end"]
        lines_ok = lines_ok and 1 <= len(group["lines"]) <= 2 and all(line for line in group["lines"])
        for line in group["lines"]:
            for word in line:
                word_count += 1
                words_ok = words_ok and word["startOutput"] < word["endOutput"]
                words_ok = words_ok and word["startOutput"] >= group["start"] - 0.001 and word["endOutput"] <= group["end"] + 0.001
    check("caption_order", ordered, "blocos ordenados e sem sobreposição")
    check("caption_lines", lines_ok, "máximo de duas linhas")
    check("word_timestamps", words_ok and word_count == 66, f"{word_count} palavras revisadas")
    all_text = " ".join(word["text"] for group in captions for line in group["lines"] for word in line)
    check("reviewed_words", all(token in all_text for token in ["Bordô", "discreto", "atemporal", "mas rosa", "SOFISTICADO".lower()]), "grafia revisada presente")
    check("caption_position", project["captionStyle"]["top"] == 1375 and project["captionStyle"]["fontSize"] == 52, "região central, 52 px")
    check("safe_zones", project["safeZones"] == {"top": 80, "bottom": 250, "left": 48, "right": 110}, "margens registradas")
    check("wine_contrast", scenes[3].get("textAccent") == "#F0B7C7", "vinho preservado na amostra; texto claro")

    srt = (ROOT / "sofia-1-captions.srt").read_text(encoding="utf-8")
    check("srt_blocks", len(re.findall(r"(?m)^\d+$", srt)) == 14 and "mas rosa claro" in srt, "SRT sincronizado com a timeline")
    component = (ROOT / "src/Sofia1Reel.jsx").read_text(encoding="utf-8")
    forbidden = ["Math.random", "requestAnimationFrame", "Date.now", "setInterval", "setTimeout"]
    check("pure_time_motion", not any(token in component for token in forbidden) and "useCurrentFrame" in component, "animações derivadas de frame/t; sem sorteio ou timers")
    check("integer_scene_selection", "frame >= scene.startFrame && frame < scene.endFrame" in component, "seleção de cena por índice inteiro de quadro")
    renderer = (ROOT / "sofia1-render.mjs").read_text(encoding="utf-8")
    check("ffmpeg_audio_finish", "finalizeMaster" in renderer and "'-c:a', 'aac'" in renderer and "'-c:v', 'copy'" in renderer, "vídeo copiado; AAC final pelo FFmpeg")

    failures = [item for item in checks if item["status"] == "fail"]
    report = {
        "status": "PASS" if not failures else "FAIL",
        "scope": "Projeto, assets e texto. Não substitui QA do MP4 nem revisão audiovisual.",
        "summary": {"checks": len(checks), "passed": len(checks) - len(failures), "failed": len(failures), "captions": len(captions), "words": word_count},
        "checks": checks,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"{report['status']}: {REPORT.relative_to(ROOT)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
