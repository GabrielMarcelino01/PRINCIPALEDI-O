#!/usr/bin/env python3
"""Validação estática do projeto CRIATIVO-3 antes do render."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROJECT = json.loads((ROOT / "criativo-3-project.json").read_text())
TRANSCRIPT = json.loads((ROOT / "criativo-3-transcript.json").read_text())
checks = []


def check(name, condition, detail=""):
    checks.append({"name": name, "status": "PASS" if condition else "FAIL", "detail": detail})


def digest(path, algorithm="sha256"):
    h = hashlib.new(algorithm)
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


source = PROJECT["source"]
edit = PROJECT["edit"]
look = PROJECT["look"]
captions = PROJECT["captions"]
words = [w for s in TRANSCRIPT["segments"] for w in s["words"]]
source_path = ROOT / "assets/original.mp4"
check("source_exists", source_path.exists())
check("source_sha256", digest(source_path) == source["sha256"])
check("source_drive_md5", digest(source_path, "md5") == source["drive_md5"])
check("source_dimensions", (source["width"], source["height"]) == (720, 1280))
check("source_timing", source["frames"] == 1152 and source["fps"] == 24 and source["duration"] == 48.0)
check("natural_speed", edit["speed"] == 1.0 and edit["pitch_preserved"] is True)
check("cut_count", len(edit["cut_frames"]) == 15)
check("cuts_valid", all(0 <= a < b <= 1152 for a, b in edit["cut_frames"]))
check("cuts_sorted", all(edit["cut_frames"][i][1] <= edit["cut_frames"][i + 1][0] for i in range(len(edit["cut_frames"]) - 1)))
check("cuts_do_not_intersect_words", all(not (w["start"] < b / 24 and w["end"] > a / 24) for w in words for a, b in edit["cut_frames"]))
check("removed_duration", edit["removed_frames"] == 80 and abs(edit["removed_seconds"] - 80 / 24) < 1e-9)
check("output_frames", edit["output_frames"] == 1072)
check("output_duration", abs(edit["output_duration"] - 1072 / 24) < 1e-9)
check("transcript_words", len(words) == 149)
check("caption_count", len(captions) == 32)
check("word_coverage", [i for c in captions for i in range(c["first_word"], c["last_word"] + 1)] == list(range(149)))
check("caption_order", all(captions[i]["end"] <= captions[i + 1]["start"] + 0.001 for i in range(len(captions) - 1)))
check("caption_duration", all(0 <= c["start"] < c["end"] <= edit["output_duration"] for c in captions))
check("caption_one_line", all(len(c["lines"]) == 1 and "\n" not in c["text"] for c in captions))
check("caption_line_length", all(len(c["text"]) <= 42 for c in captions))
check("caption_width", all(c["text_width_px"] <= 640 for c in captions), f'max={max(c["text_width_px"] for c in captions):.3f}')
check("caption_font_sizes", all(36 <= c["font_size"] <= 40 for c in captions))
check("caption_cps", all(c["cps"] <= 25 for c in captions), f'max={max(c["cps"] for c in captions):.4f}')
check("caption_emphasis", all(all(p in c["text"] for p in c["emphasis"]) for c in captions))
check("caption_terms", all(any(term in c["text"] for c in captions) for term in ["blazer", "combiná-las", "O aplicativo encontra", "para o momento"]))
check("no_unreviewed_terms", not any(re.search(r"\bblaze\b", c["text"]) or " biná" in c["text"] for c in captions))
check("center_alignment", look["alignment"] == 5 and look["caption_center_y"] == 640)
check("font_exists", (ROOT / "public/fonts/InterCaption.ttf").exists())
check("font_license", (ROOT / "public/fonts/OFL.txt").exists())
gradient_path = ROOT / "public/center-gradient.png"
check("gradient_exists", gradient_path.exists())
if gradient_path.exists():
    gradient = Image.open(gradient_path).convert("RGBA")
    check("gradient_dimensions", gradient.size == (720, 1280))
    check("gradient_center", gradient.getpixel((360, 640))[3] == 105)
    check("gradient_fades", all(gradient.getpixel((360, y))[3] == 0 for y in [0, 490, 495, 790, 1279]))
check("srt_exists", (ROOT / "criativo-3-captions.srt").exists())
ass_path = ROOT / "criativo-3-captions.ass"
check("ass_exists", ass_path.exists())
if ass_path.exists():
    ass = ass_path.read_text()
    check("ass_no_wrap", "WrapStyle: 2" in ass and ",5,40,40,0,1" in ass)
check("edited_audio_exists", (ROOT / "public/criativo-3-audio.wav").exists())
check("audio_loudnorm_plan", (ROOT / "reports/audio-loudnorm.json").exists())
report = {
    "status": "PASS" if all(c["status"] == "PASS" for c in checks) else "FAIL",
    "checks": len(checks), "passed": sum(c["status"] == "PASS" for c in checks),
    "failed": sum(c["status"] == "FAIL" for c in checks), "results": checks,
}
(ROOT / "reports/project-qa.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(0 if report["status"] == "PASS" else 1)
