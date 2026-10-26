#!/usr/bin/env python3
"""Valida timeline, assets e correspondência das captions do CLOSET-3 com a transcrição."""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports" / "closet-3-project-qa.json"


def normalized(text: str) -> str:
    text = re.sub(r"[.,:;!?]", "", text).upper()
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    project = json.loads((ROOT / "closet-3-project.json").read_text(encoding="utf-8"))
    transcript = json.loads((ROOT / "closet-3-transcript.json").read_text(encoding="utf-8"))
    checks: list[dict[str, str]] = []

    def check(name: str, condition: bool, message: str) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "message": message})

    check("dimensions", (project["width"], project["height"]) == (1080, 1920), "1080x1920")
    check("frame_rate", project["fps"] == 30, "30 fps")
    check("duration", project["durationInFrames"] == 614 and abs(project["duration"] - 614 / 30) < 0.0001, "614 frames / 20,4667 s")
    check("cuts", len(project["cuts"]) == 4 and project["cuts"] == sorted(project["cuts"]), f"Cortes: {project['cuts']}")
    check("groups", len(project["groups"]) == 13, "13 grupos de captions")

    for name, relative, minimum in [
        ("normalized_video", "public/closet-3-source.mp4", 1_000_000),
        ("audio_master", "public/closet-3-soundtrack.wav", 1_000_000),
        ("film_grain", "public/closet-3-grain.png", 500),
        ("inter_font", "public/fonts/inter-latin-wght-normal.woff2", 1000),
        ("playfair_font", "public/fonts/playfair-display-latin-wght-italic.woff2", 1000),
        ("playfair_license", "public/fonts/PLAYFAIR-LICENSE.txt", 100),
    ]:
        path = ROOT / relative
        check(name, path.is_file() and path.stat().st_size > minimum, relative)

    scenes_ok = True
    for index, scene in enumerate(project["scenes"]):
        expected_start = 0 if index == 0 else project["cuts"][index - 1]
        expected_end = project["duration"] if index == len(project["scenes"]) - 1 else project["cuts"][index]
        if abs(scene["start"] - expected_start) > 0.0001 or abs(scene["end"] - expected_end) > 0.0001:
            scenes_ok = False
    check("scene_boundaries", scenes_ok, "Cinco blocos visuais alinhados aos quatro cortes")

    groups_ok = True
    words_ok = True
    lines_ok = True
    previous_end = -1.0
    spoken_by_group: dict[str, str] = {}
    word_count = 0
    for group in project["groups"]:
        if group["start"] < previous_end - 0.001 or group["start"] >= group["end"] or group["end"] > project["duration"] + 0.001:
            groups_ok = False
        previous_end = group["end"]
        if len(group["lines"]) > 2:
            lines_ok = False
        previous_word_end = None
        words = []
        for line in group["lines"]:
            if not line:
                lines_ok = False
            for item in line:
                words.append(item["text"])
                word_count += 1
                if item["start"] < group["start"] - 0.001 or item["end"] > group["end"] + 0.001 or item["start"] >= item["end"]:
                    words_ok = False
                if previous_word_end is not None and item["start"] < previous_word_end - 0.001:
                    words_ok = False
                previous_word_end = item["end"]
        if not words or abs(group["start"] - (group["lines"][0][0]["start"])) > 0.001:
            groups_ok = False
        spoken_by_group[group["id"]] = " ".join(words)
    check("group_timing", groups_ok, "Grupos ordenados, sem sobreposição e dentro da duração")
    check("word_timing", words_ok, f"{word_count} palavras com timestamps válidos")
    check("line_count", lines_ok, "No máximo duas linhas por grupo")

    transcript_ok = True
    for segment in transcript["segments"]:
        spoken = " ".join(spoken_by_group.get(group_id, "") for group_id in segment["group_ids"])
        if normalized(spoken) != normalized(segment["text"]):
            transcript_ok = False
            checks.append({"name": "transcript_mismatch", "status": "fail", "message": f"Esperado: {segment['text']} | Encontrado: {spoken}"})
    check("transcript_fidelity", transcript_ok, "Todos os seis segmentos correspondem à transcrição revisada")

    caption = project["captionStyle"]
    safe_top = project["safeZones"]["top"]
    safe_bottom = project["height"] - project["safeZones"]["bottom"]
    center_ok = caption.get("anchor") == "middle" and caption.get("top") == 960
    center_ok = center_ok and caption["top"] - 180 >= safe_top and caption["top"] + 180 <= safe_bottom
    check("caption_safe_area", center_ok, "Bloco ancorado no centro geométrico, com margem estimada de 180px")
    check("caption_scale", (caption["fontSize"], caption["serifFontSize"], caption["smallFontSize"]) == (106, 132, 48), "106px sans / 132px serifada / 48px conectores")
    positions = project.get("captionPositions", {})
    positions_ok = set(positions) == {"center"} and positions.get("center", {}).get("anchor") == "middle"
    positions_ok = positions_ok and positions.get("center", {}).get("align") == "center"
    positions_ok = positions_ok and all(group.get("position") == "center" for group in project["groups"])
    check("caption_positions", positions_ok, "13 grupos em uma única posição central estável")
    follow = project.get("followCta", {})
    check("follow_cta", follow.get("text") == "SEGUIR" and project["duration"] - 2 <= follow.get("start", 0) < project["duration"] and follow.get("top", safe_bottom) + 92 <= safe_bottom, "Botão + SEGUIR somente no final e dentro da safe zone")
    camera_ok = all(
        scene.get("motion") and scene["motion"]["scaleFrom"] == scene["motion"]["scaleTo"] == 1.02
        and all(scene["motion"][key] == 0 for key in ["xFrom", "xTo", "yFrom", "yTo"])
        for scene in project["scenes"]
    )
    check("camera_static", camera_ok, "Cinco cenas com escala fixa 1,02 e deslocamento zero")
    component = (ROOT / "src" / "Closet3Reel.jsx").read_text(encoding="utf-8")
    forbidden = [
        "function CutEffects", "<CutEffects", "project.cta", "project.emphasisTimes",
        "WhipPan", "CrossDissolve", "spring(", "interpolate(", "WaveText",
        "requestAnimationFrame", "grainX", "shine",
    ]
    fixed_center = "top: '50%'" in component and "translateY(-50%)" in component
    check("static_layout", all(token not in component for token in forbidden) and fixed_center and "cta" not in project and "emphasisTimes" not in project, "Sem zoom, onda, pulso, transição ou movimento de grão; captions ancoradas no centro")
    actual_motions = {item.get("id") for item in project.get("design", {}).get("motionRefs", [])}
    stability = project.get("design", {}).get("stability", {})
    stable_flags = all(stability.get(key) for key in ["captions", "camera", "grain", "header", "cta"])
    check("static_design", actual_motions == set() and stable_flags, "Nenhum motion adicionado; estabilidade documentada no projeto")

    prepare = json.loads((ROOT / "closet-3-prepare-report.json").read_text(encoding="utf-8"))
    audio = prepare["audio"]["aac_preview"]
    check("preview_loudness", math.isfinite(audio["integrated_lufs"]) and abs(audio["integrated_lufs"] + 14) <= 0.5, f"{audio['integrated_lufs']} LUFS")
    check("preview_true_peak", math.isfinite(audio["true_peak_dbtp"]) and audio["true_peak_dbtp"] <= -0.999, f"{audio['true_peak_dbtp']} dBTP")
    check("source_integrity", prepare["source_sha256"] == transcript["source_sha256"], "SHA-256 do original CLOSET-3 confirmado")
    check("no_transition_sfx", prepare["audio"]["sfx"].startswith("Sem efeitos de transição"), prepare["audio"]["sfx"])

    failures = [item for item in checks if item["status"] == "fail"]
    report = {
        "status": "PASS" if not failures else "FAIL",
        "scope": "Timeline, assets e correspondência textual; não substitui QA do MP4 nem revisão audiovisual.",
        "summary": {"checks": len(checks), "passed": len(checks) - len(failures), "failed": len(failures), "caption_groups": len(project["groups"]), "words": word_count},
        "checks": checks,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"{report['status']}: {REPORT.relative_to(ROOT)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
