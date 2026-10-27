#!/usr/bin/env python3
"""Valida timeline e proíbe fontes de não determinismo no render temporal."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

BANNED = {
    "math_random": re.compile(r"\bMath\s*\.\s*random\s*\("),
    "date_now": re.compile(r"\bDate\s*\.\s*now\s*\("),
    "new_date": re.compile(r"\bnew\s+Date\b"),
    "performance_now": re.compile(r"\bperformance\s*\.\s*now\s*\("),
    "set_timeout": re.compile(r"\bsetTimeout\s*\("),
    "set_interval": re.compile(r"\bsetInterval\s*\("),
    "animation_frame_clock": re.compile(r"\brequestAnimationFrame\s*\("),
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--page", required=True, type=Path, help="JavaScript com window.seek(t)")
    parser.add_argument("--html", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    config = json.loads(args.config.read_text(encoding="utf-8"))
    source = args.page.read_text(encoding="utf-8")
    checks: list[dict[str, object]] = []

    def check(name: str, passed: bool, detail: object) -> None:
        checks.append({"name": name, "status": "pass" if passed else "fail", "detail": detail})

    fps = config.get("fps")
    frames = config.get("durationInFrames")
    duration = config.get("durationSeconds")
    check("vertical_1080x1920", (config.get("width"), config.get("height")) == (1080, 1920), [config.get("width"), config.get("height")])
    check("fps_60", fps == 60, fps)
    check("integer_frames", isinstance(frames, int) and frames > 0, frames)
    check("duration_matches_frames", isinstance(duration, (int, float)) and abs(frames / fps - duration) < 1e-9, {"frames": frames, "fps": fps, "duration": duration})
    check("pure_clock_contract", "window.seek = seek" in source and "frame / fps" in json.dumps(config), "window.seek(t) + t = frame / fps")
    check("configuration_bridge", "window.__setTimeline" in source, "window.__setTimeline(config)")
    check("no_audio_placeholder", config.get("audio") is None, "Demo visual sem faixa de áudio; não há silêncio apresentado como mix.")

    scenes = config.get("scenes", [])
    check("three_scenes", len(scenes) == 3, len(scenes))
    ordered = all(scenes[index]["start"] <= scenes[index + 1]["start"] for index in range(len(scenes) - 1))
    check("scene_order", ordered, [scene["id"] for scene in scenes])
    bounded = all(0 <= scene["start"] < scene["end"] <= duration for scene in scenes)
    check("scene_bounds", bounded, [[scene["start"], scene["end"]] for scene in scenes])
    check("smooth_transitions", all("time-driven" in scene["transition"] or "continuous" in scene["transition"] for scene in scenes), [scene["transition"] for scene in scenes])

    review = config.get("reviewFrames", [])
    check("review_in_range", bool(review) and all(isinstance(frame, int) and 0 <= frame < frames for frame in review), review)
    check("first_and_last_reviewed", 0 in review and frames - 1 in review, {"first": 0 in review, "last": frames - 1 in review})
    verification = config.get("verificationFrames", [])
    check("verification_in_range", bool(verification) and all(0 <= frame < frames for frame in verification), verification)

    rules = config.get("rules", {})
    for key in ["randomness", "cssAnimations", "timers", "stateCarriedBetweenFrames"]:
        check(f"rule_{key}", rules.get(key) is False, rules.get(key))
    for name, pattern in BANNED.items():
        match = pattern.search(source)
        check(f"ban_{name}", match is None, match.group(0) if match else "not found")

    if args.html:
        html = args.html.read_text(encoding="utf-8")
        css_animation = re.search(r"(?:^|[;{])\s*(?:animation|transition)\s*:", html)
        check("no_css_time_driven_animation", css_animation is None, css_animation.group(0) if css_animation else "not found")
        check("local_timeline_script", './timeline.js' in html, "timeline.js")
        check("no_remote_assets", not re.search(r"(?:src|href)=[\"']https?://", html), "all assets local")

    report = {
        "project": config.get("id"),
        "status": "pass" if all(item["status"] == "pass" for item in checks) else "fail",
        "summary": {"checks": len(checks), "passed": sum(item["status"] == "pass" for item in checks), "failed": sum(item["status"] == "fail" for item in checks)},
        "checks": checks,
        "scope": "Validação estática da timeline e do código. O render valida adicionalmente pixels repetidos fora de ordem e o MP4 codificado.",
    }
    text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    print(text, end="")
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
