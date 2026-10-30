#!/usr/bin/env python3
"""Valida timeline, fidelidade textual e escopo restrito da edição CLOSET-10."""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports" / "closet-10-project-qa.json"
EXPECTED_SHA256 = "a781c0cca15bfbeaebde73f473154990e7069a04272bb9a80ffdc9f59232b978"


def normalized(text: str) -> str:
    text = re.sub(r"[-.,:;!?]", "", text).upper()
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    project = json.loads((ROOT / "closet-10-project.json").read_text(encoding="utf-8"))
    transcript = json.loads((ROOT / "closet-10-transcript.json").read_text(encoding="utf-8"))
    prepare = json.loads((ROOT / "closet-10-prepare-report.json").read_text(encoding="utf-8"))
    checks: list[dict[str, str]] = []

    def check(name: str, condition: bool, message: str) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "message": message})

    check("dimensions", (project["width"], project["height"]) == (1080, 1920), "1080x1920")
    check("frame_rate", project["fps"] == 24, "24 fps, cadência preservada sem interpolação")
    check("duration", project["durationInFrames"] == prepare["normalized_frames"] and abs(project["duration"] - project["durationInFrames"] / 24) < 0.0001, f"{project['durationInFrames']} frames / {project['duration']:.6f} s")
    check("cuts", project["cuts"] == prepare["cuts"] == sorted(project["cuts"]) and all(0 < cut < project["duration"] for cut in project["cuts"]), f"Pontos naturais de revisão: {project['cuts']}")
    check("groups", len(project["groups"]) == 14, "14 grupos de superlegendas, divididos para no máximo duas linhas reais")

    for name, relative, minimum in [
        ("normalized_video", "public/closet-10-source.mp4", 1_000_000),
        ("audio_master", "public/closet-10-audio.wav", 1_000_000),
        ("inter_font", "public/fonts/inter-latin-wght-normal.woff2", 1000),
        ("playfair_font", "public/fonts/playfair-display-latin-wght-italic.woff2", 1000),
        ("inter_license", "public/fonts/INTER-LICENSE.txt", 100),
        ("playfair_license", "public/fonts/PLAYFAIR-LICENSE.txt", 100),
    ]:
        path = ROOT / relative
        check(name, path.is_file() and path.stat().st_size > minimum, relative)

    groups_ok = True
    words_ok = True
    lines_ok = True
    positions_ok = True
    previous_end = -1.0
    spoken_by_group: dict[str, str] = {}
    word_count = 0
    for group in project["groups"]:
        if group["start"] < previous_end - 0.001 or group["start"] >= group["end"] or group["end"] > project["duration"] + 0.001:
            groups_ok = False
        previous_end = group["end"]
        if len(group["lines"]) > 2 or any(not line for line in group["lines"]):
            lines_ok = False
        if group.get("position") != "knee":
            positions_ok = False
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
        if not words or abs(group["start"] - group["lines"][0][0]["start"]) > 0.001:
            groups_ok = False
        spoken_by_group[group["id"]] = " ".join(words)
    check("group_timing", groups_ok, "Grupos ordenados, sem sobreposição e dentro da duração")
    check("word_timing", words_ok, f"{word_count} palavras com timestamps válidos")
    check("word_total", word_count == sum(len(segment["words"]) for segment in transcript["segments"]) == 53, "53 palavras, sem omissões ou duplicações")
    check("line_count", lines_ok, "No máximo duas linhas por grupo")

    transcript_ok = True
    for segment in transcript["segments"]:
        spoken = " ".join(spoken_by_group.get(group_id, "") for group_id in segment["group_ids"])
        if normalized(spoken) != normalized(segment["text"]):
            transcript_ok = False
            checks.append({"name": "transcript_mismatch", "status": "fail", "message": f"Esperado: {segment['text']} | Encontrado: {spoken}"})
    check("transcript_fidelity", transcript_ok, "As quatro falas completas estão representadas sem omissões")

    caption = project["captionStyle"]
    safe_bottom = project["height"] - project["safeZones"]["bottom"]
    check("caption_safe_area", project["captionPositions"]["knee"]["top"] + 250 <= safe_bottom, f"Bloco estimado até {project['captionPositions']['knee']['top'] + 250}px; limite {safe_bottom}px")
    check("caption_scale", (caption["fontSize"], caption["serifFontSize"], caption["smallFontSize"]) == (96, 120, 50), "96px sans / 120px serifada / 50px conectores")
    check("caption_position", positions_ok and project["captionPositions"]["knee"] == {"top": 1210, "align": "center"}, "Todos os grupos centralizados com topo em 1210px, na altura dos joelhos")
    check("caption_width", caption["maxWidth"] <= project["width"] - project["safeZones"]["left"] - project["safeZones"]["right"], "Largura dentro da área segura")

    check("no_camera_motion", project.get("cameraMotion") is False, "Sem zoom, pan ou reenquadramento")
    check("no_extra_visual_elements", project.get("extraVisualElements") == [], "Sem CTA, cabeçalho, vinheta, grão ou elementos externos")
    check("audio_preserved", project.get("audioProcessing") == "preserve" and "sem EQ" in prepare["audio_processing"], prepare["audio_processing"])

    component = (ROOT / "src" / "Closet10Reel.jsx").read_text(encoding="utf-8")
    forbidden = ["FollowButton", "Header", "CutEffects", "linear-gradient", "radial-gradient", "vignette", "grain", "followCta", "sceneAt", "motion.scale"]
    check("caption_only_layout", all(token not in component for token in forbidden), "Somente vídeo, captions, áudio original e safe zones opcionais de revisão")
    video_tags = re.findall(r"<OffthreadVideo\b[^>]*>", component)
    check("source_not_transformed", len(video_tags) == 1 and "transform" not in video_tags[0], "OffthreadVideo sem transformações de câmera")
    check("single_audio", component.count("<Audio ") == 1, "Uma única faixa de áudio preservada")

    normalized_stream = next(item for item in prepare["normalized_probe"]["streams"] if item["codec_type"] == "video")
    check("normalized_format", (normalized_stream["width"], normalized_stream["height"]) == (1080, 1920) and normalized_stream["pix_fmt"] == "yuv420p" and normalized_stream.get("color_space") == "bt709", "H.264/yuv420p/BT.709 após melhoria de imagem")
    audio_stream = next(item for item in prepare["audio_probe"]["streams"] if item["codec_type"] == "audio")
    source_audio = next(item for item in prepare["source_probe"]["streams"] if item["codec_type"] == "audio")
    audio_duration_ok = math.isclose(float(audio_stream["duration"]), float(source_audio["duration"]), abs_tol=0.03)
    check("audio_duration", audio_duration_ok and audio_stream["sample_rate"] == "48000" and audio_stream["channels"] == 2, f"Áudio {audio_stream['duration']}s; fonte {source_audio['duration']}s")
    check("source_integrity", prepare["source_sha256"] == transcript["source_sha256"] == EXPECTED_SHA256, "SHA-256 do upload original confirmado")

    failures = [item for item in checks if item["status"] == "fail"]
    report = {
        "status": "PASS" if not failures else "FAIL",
        "scope": "Timeline, assets, fidelidade textual e restrições da edição; não substitui QA do MP4 nem revisão audiovisual.",
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
