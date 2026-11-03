#!/usr/bin/env python3
"""Valida timeline, texto, assets e escopo do criativo IMG_1680."""

from __future__ import annotations

import hashlib
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports" / "img-1680-project-qa.json"
EXPECTED_SHA256 = "762dc340e5a744213a2f9d102dd35cb831e4d7bc42fad9dc3f11012afde10b1c"


def normalized(text: str) -> str:
    text = re.sub(r"[-.,:;!?]", "", text).upper()
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    project = json.loads((ROOT / "img-1680-project.json").read_text(encoding="utf-8"))
    transcript = json.loads((ROOT / "img-1680-transcript.json").read_text(encoding="utf-8"))
    prepare = json.loads((ROOT / "img-1680-prepare-report.json").read_text(encoding="utf-8"))
    checks: list[dict[str, str]] = []

    def check(name: str, condition: bool, message: str) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "message": message})

    check("dimensions", (project["width"], project["height"]) == (1080, 1920), "1080x1920 vertical")
    check("frame_rate", project["fps"] == 60, "60 fps para captions e motion gráfico")
    check("duration", project["durationInFrames"] == prepare["base_frames"] and abs(project["duration"] - project["durationInFrames"] / 60) < 0.0001, f"{project['durationInFrames']} frames / {project['duration']:.6f} s")
    expected_duration = 36.366667 - 1.20
    check("trimmed_duration", abs(project["duration"] - expected_duration) <= 1 / 60 + 0.0001, f"Duração esperada aproximada {expected_duration:.6f} s")
    check("pause_cuts", len(project["removedPauses"]) == 4 and math.isclose(sum(item["duration"] for item in project["removedPauses"]), 1.20, abs_tol=0.0001), "Quatro pausas removidas, total 1,20 s")
    segments_ok = True
    previous_source_end = None
    previous_output_end = 0.0
    for segment in project["editSegments"]:
        if segment["start"] >= segment["end"] or abs(segment["outputStart"] - previous_output_end) > 0.001 or abs(segment["outputEnd"] - segment["outputStart"] - (segment["end"] - segment["start"])) > 0.001:
            segments_ok = False
        if previous_source_end is not None and segment["start"] < previous_source_end:
            segments_ok = False
        previous_source_end = segment["end"]
        previous_output_end = segment["outputEnd"]
    check("edit_segments", segments_ok, "Trechos de origem ordenados e saída contínua")

    for name, relative, minimum in [
        ("base_video", "public/img-1680-base.mp4", 1_000_000),
        ("before_video", "public/img-1680-before.mp4", 100_000),
        ("audio_master", "public/img-1680-audio.wav", 1_000_000),
        ("inter_font", "public/fonts/inter-latin-wght-normal.woff2", 1000),
        ("playfair_font", "public/fonts/playfair-display-latin-wght-italic.woff2", 1000),
        ("inter_license", "public/fonts/INTER-LICENSE.txt", 100),
        ("playfair_license", "public/fonts/PLAYFAIR-LICENSE.txt", 100),
    ]:
        path = ROOT / relative
        check(name, path.is_file() and path.stat().st_size > minimum, relative)

    check("groups", len(project["groups"]) == 22, "22 grupos: 21 renderizados e CTA original preservado")
    groups_ok = True
    words_ok = True
    lines_ok = True
    layouts_ok = True
    previous_end = -1.0
    word_count = 0
    spoken_by_segment: dict[str, list[str]] = {}
    for group in project["groups"]:
        if group["start"] < previous_end - 0.001 or group["start"] >= group["end"] or group["end"] > project["duration"] + 0.001:
            groups_ok = False
        previous_end = group["end"]
        if len(group["lines"]) > 2 or any(not line for line in group["lines"]):
            lines_ok = False
        if group["layout"] not in {"bottom", "app", "top", "embedded"}:
            layouts_ok = False
        previous_word_end = None
        words = []
        for line in group["lines"]:
            for item in line:
                words.append(item["text"])
                word_count += 1
                if item["start"] < group["start"] - 0.001 or item["end"] > group["end"] + 0.001 or item["start"] >= item["end"]:
                    words_ok = False
                if previous_word_end is not None and item["start"] < previous_word_end - 0.001:
                    words_ok = False
                previous_word_end = item["end"]
        if not words or not (0 <= group["lines"][0][0]["start"] - group["start"] <= 0.101):
            groups_ok = False
        spoken_by_segment.setdefault(group["segmentId"], []).append(" ".join(words))
    check("group_timing", groups_ok, "Grupos ordenados, sem sobreposição e com lead-in limitado")
    check("word_timing", words_ok, f"{word_count} palavras com timestamps remapeados válidos")
    check("word_total", word_count == sum(len(segment["words"]) for segment in transcript["segments"]) == 112, "112 palavras, sem omissões ou duplicações")
    check("line_count", lines_ok, "No máximo duas linhas declaradas por grupo")
    check("layouts", layouts_ok, "Layouts bottom/app/top e CTA embedded")
    check("embedded_cta", sum(group["embeddedOnly"] for group in project["groups"]) == 1 and project["groups"][-1]["id"] == "scene-11-cta-original", "Somente o CTA final usa o texto já existente na fonte")

    transcript_ok = True
    for segment in transcript["segments"]:
        spoken = " ".join(spoken_by_segment.get(segment["id"], []))
        if normalized(spoken) != normalized(segment["text"]):
            transcript_ok = False
            checks.append({"name": "transcript_mismatch", "status": "fail", "message": f"Esperado: {segment['text']} | Encontrado: {spoken}"})
    check("transcript_fidelity", transcript_ok, "As onze falas completas estão representadas")

    safe_bottom = project["height"] - project["safeZones"]["bottom"]
    bottom = project["captionStyles"]["bottom"]
    app = project["captionStyles"]["app"]
    top = project["captionStyles"]["top"]
    check("caption_safe_bottom", bottom["top"] + 250 <= safe_bottom and app["top"] + 200 <= safe_bottom, "Blocos bottom e app dentro da área segura estimada")
    check("caption_safe_top", top["top"] >= project["safeZones"]["top"], "Bloco superior abaixo da margem segura")
    check("caption_scales", (bottom["fontSize"], bottom["serifFontSize"], bottom["smallFontSize"]) == (88, 108, 46) and (app["fontSize"], app["serifFontSize"], app["smallFontSize"]) == (72, 88, 40), "Escalas independentes para pessoas, telas e bloco superior")

    double = project["doubleScene"]
    check("double_scene", 3.69 <= double["start"] <= 3.71 and 7.25 <= double["end"] <= 7.28 and double["start"] < double["end"], "Dupla cena antes/agora no contraste de looks")
    zoom_ok = all(scene["start"] < scene["end"] and 1.0 <= scene["from"] <= 1.10 and 1.0 <= scene["to"] <= 1.10 for scene in project["zoomScenes"])
    check("zoom_range", zoom_ok, "Zooms discretos de 1,00× a 1,10×")
    app_zoom = [scene for scene in project["zoomScenes"] if scene["start"] >= 23.70]
    check("app_not_cropped", all(scene["from"] == scene["to"] == 1.0 for scene in app_zoom), "Telas do aplicativo sem zoom ou crop digital")

    component = (ROOT / "src" / "Img1680Reel.jsx").read_text(encoding="utf-8")
    check("deterministic_motion", "Math.random" not in component and "Date.now" not in component, "Motion determinístico em função do frame/tempo")
    check("single_audio", component.count("<Audio ") == 1, "Uma única faixa de áudio editada")
    check("double_scene_assets", component.count("<OffthreadVideo") == 3 and "beforeVideo" in component, "Main, take anterior e metade direita da dupla cena")

    base_stream = next(item for item in prepare["base_probe"]["streams"] if item["codec_type"] == "video")
    check("base_format", (base_stream["width"], base_stream["height"]) == (1080, 1920) and base_stream["pix_fmt"] == "yuv420p" and base_stream.get("color_space") == "bt709" and base_stream["r_frame_rate"] == "60/1", "H.264/yuv420p/BT.709/60 fps")
    audio_stream = next(item for item in prepare["audio_probe"]["streams"] if item["codec_type"] == "audio")
    audio_duration_ok = math.isclose(float(audio_stream["duration"]), project["duration"], abs_tol=0.04)
    check("audio_duration", audio_duration_ok and audio_stream["sample_rate"] == "48000" and audio_stream["channels"] == 2, f"Áudio {audio_stream['duration']}s; vídeo {project['duration']:.6f}s")
    source_hash = hashlib.sha256((ROOT / "assets" / "original.mov").read_bytes()).hexdigest()
    check("source_integrity", source_hash == prepare["source_sha256"] == transcript["source_sha256"] == EXPECTED_SHA256, "SHA-256 do upload original confirmado")

    failures = [item for item in checks if item["status"] == "fail"]
    report = {
        "status": "PASS" if not failures else "FAIL",
        "scope": "Timeline, assets, fidelidade textual e motion; não substitui storyboard, QA do MP4 nem revisão audiovisual.",
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
