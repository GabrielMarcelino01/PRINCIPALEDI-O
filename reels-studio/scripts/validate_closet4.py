#!/usr/bin/env python3
"""Valida timeline, assets e correspondência das captions do CLOSET-4 com a transcrição."""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports" / "closet-4-project-qa.json"


def normalized(text: str) -> str:
    text = re.sub(r"[.,:;!?]", "", text).upper()
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    project = json.loads((ROOT / "closet-4-project.json").read_text(encoding="utf-8"))
    transcript = json.loads((ROOT / "closet-4-transcript.json").read_text(encoding="utf-8"))
    checks: list[dict[str, str]] = []

    def check(name: str, condition: bool, message: str) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "message": message})

    check("dimensions", (project["width"], project["height"]) == (1080, 1920), "1080x1920")
    check("frame_rate", project["fps"] == 30, "30 fps")
    check("duration", project["durationInFrames"] == 687 and abs(project["duration"] - 687 / 30) < 0.0001, "687 frames / 22,9 s")
    check("cuts", len(project["cuts"]) == 4 and project["cuts"] == sorted(project["cuts"]), f"Cortes: {project['cuts']}")
    check("groups", len(project["groups"]) == 13, "13 grupos de captions")

    for name, relative, minimum in [
        ("normalized_video", "public/closet-4-source.mp4", 1_000_000),
        ("audio_master", "public/closet-4-soundtrack.wav", 1_000_000),
        ("film_grain", "public/closet-4-grain.png", 500),
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
    check("transcript_fidelity", transcript_ok, "Todos os cinco segmentos correspondem à transcrição revisada")

    caption = project["captionStyle"]
    safe_top = project["safeZones"]["top"]
    safe_bottom = project["height"] - project["safeZones"]["bottom"]
    bottom_ok = caption.get("anchor") == "bottom" and caption.get("top") == 1320
    bottom_ok = bottom_ok and caption["top"] - 360 >= safe_top and caption["top"] <= safe_bottom
    check("caption_safe_area", bottom_ok, "Baseline inferior em 1320px; bloco estimado de até 360px dentro da safe zone")
    check("caption_scale", (caption["fontSize"], caption["serifFontSize"], caption["smallFontSize"]) == (82, 102, 37), "82px sans / 102px serifada / 37px conectores")
    positions = project.get("captionPositions", {})
    positions_ok = set(positions) == {"bottom"} and positions.get("bottom", {}).get("anchor") == "bottom"
    positions_ok = positions_ok and positions.get("bottom", {}).get("top") == 1320
    positions_ok = positions_ok and positions.get("bottom", {}).get("align") == "center"
    positions_ok = positions_ok and all(group.get("position") == "bottom" for group in project["groups"])
    check("caption_positions", positions_ok, "13 grupos na mesma baseline inferior estável")
    follow = project.get("followCta", {})
    check("follow_cta", follow.get("text") == "SEGUIR" and project["duration"] - 2 <= follow.get("start", 0) < project["duration"] and follow.get("top", safe_bottom) + 92 <= safe_bottom and follow.get("top", 0) - caption["top"] >= 80, "Botão + SEGUIR no final, dentro da safe zone e pelo menos 80px abaixo da baseline das captions")
    camera_ok = all(
        scene.get("motion") and scene["motion"]["scaleFrom"] == scene["motion"]["scaleTo"] == 1.02
        and all(scene["motion"][key] == 0 for key in ["xFrom", "xTo", "yFrom", "yTo"])
        for scene in project["scenes"]
    )
    check("camera_static", camera_ok, "Cinco cenas com escala fixa 1,02 e deslocamento zero")
    component = (ROOT / "src" / "Closet4Reel.jsx").read_text(encoding="utf-8")
    forbidden = [
        "function CutEffects", "<CutEffects", "project.cta", "project.emphasisTimes",
        "WhipPan", "CrossDissolve", "requestAnimationFrame", "grainX", "shine",
    ]
    fixed_bottom = "top: project.captionStyle.top" in component and "translateY(-100%)" in component
    motion_present = all(token in component for token in ["spring(", "function WaveText", "scaleX(${underline})", "translateY(${translateY}px)"])
    check("stabilized_motion_layout", all(token not in component for token in forbidden) and fixed_bottom and motion_present and "cta" not in project and "emphasisTimes" not in project, "Movimento interno por springs/onda curta; container, câmera e grão permanecem estáveis")
    expected_motions = {"001", "122", "125", "130"}
    actual_motions = {item.get("id") for item in project.get("design", {}).get("motionRefs", [])}
    stability = project.get("design", {}).get("stability", {})
    stable_flags = all(stability.get(key) for key in ["captions", "camera", "grain", "header", "cta"])
    caption_motion = project.get("captionMotion", {})
    motion_keys = {"container", "wordEntrance", "activeEmphasis", "serifWave", "underline", "ctaEntrance"}
    check("stabilized_motion_design", actual_motions == expected_motions and stable_flags and motion_keys <= set(caption_motion), "Quatro motions documentados, com baseline inferior e limites de movimento registrados")

    prepare = json.loads((ROOT / "closet-4-prepare-report.json").read_text(encoding="utf-8"))
    audio = prepare["audio"]["aac_preview"]
    check("preview_loudness", math.isfinite(audio["integrated_lufs"]) and abs(audio["integrated_lufs"] + 14) <= 0.5, f"{audio['integrated_lufs']} LUFS")
    check("preview_true_peak", math.isfinite(audio["true_peak_dbtp"]) and audio["true_peak_dbtp"] <= -0.999, f"{audio['true_peak_dbtp']} dBTP")
    check("source_integrity", prepare["source_sha256"] == transcript["source_sha256"], "SHA-256 do original CLOSET-4 confirmado")
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
