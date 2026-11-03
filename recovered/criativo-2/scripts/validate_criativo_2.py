#!/usr/bin/env python3
"""Validação estática do projeto CRIATIVO-2 antes do render."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT = json.loads((ROOT / "criativo-2-project.json").read_text())
TRANSCRIPT = json.loads((ROOT / "criativo-2-transcript.json").read_text())
checks = []


def check(name, condition, detail=""):
    checks.append({"name": name, "status": "PASS" if condition else "FAIL", "detail": detail})


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


source = PROJECT["source"]
edit = PROJECT["edit"]
captions = PROJECT["captions"]
words = [w for s in TRANSCRIPT["segments"] for w in s["words"]]
check("source_exists", (ROOT / "assets/original.mp4").exists())
check("source_sha256", sha256(ROOT / "assets/original.mp4") == source["sha256"])
check("source_dimensions", (source["width"], source["height"]) == (720, 1280))
check("source_timing", source["frames"] == 1344 and source["fps"] == 24 and source["duration"] == 56.0)
check("speed_exact", edit["speed"] == 1.2)
check("pitch_preserved", edit["pitch_preserved"] is True)
check("cut_count", len(edit["cut_frames"]) == 12)
check("cuts_valid", all(0 <= a < b <= 1344 for a, b in edit["cut_frames"]))
check("cuts_sorted", all(edit["cut_frames"][i][1] <= edit["cut_frames"][i + 1][0] for i in range(len(edit["cut_frames"]) - 1)))
check("removed_duration", abs(edit["removed_seconds"] - 67 / 24) < 1e-9)
check("output_frames", edit["output_frames"] == 1064)
check("output_duration", abs(edit["output_duration"] - 1064 / 24) < 1e-9)
check("transcript_words", len(words) == 132)
check("caption_count", len(captions) == 25)
check("word_coverage", [i for c in captions for i in range(c["first_word"], c["last_word"] + 1)] == list(range(132)))
check("caption_order", all(captions[i]["end"] <= captions[i + 1]["start"] + 0.001 for i in range(len(captions) - 1)))
check("caption_duration", all(0 <= c["start"] < c["end"] <= edit["output_duration"] for c in captions))
check("caption_lines", all(1 <= len(c["lines"]) <= 2 for c in captions))
check("caption_line_length", all(len(line) <= 42 for c in captions for line in c["lines"]))
check("caption_cps", all(c["cps"] <= 22 for c in captions), f'max={max(c["cps"] for c in captions):.4f}')
check("caption_emphasis", all(all(any(p in line for line in c["lines"]) for p in c["emphasis"]) for c in captions))
check("smaller_font", PROJECT["look"]["font_size"] == 40)
check("safe_margins", PROJECT["look"]["margin_v"] == 205)
check("font_exists", (ROOT / "public/fonts/InterCaption.ttf").exists())
check("font_license", (ROOT / "public/fonts/OFL.txt").exists())
check("srt_exists", (ROOT / "criativo-2-captions.srt").exists())
check("ass_exists", (ROOT / "criativo-2-captions.ass").exists())
check("edited_audio_exists", (ROOT / "public/criativo-2-audio.wav").exists())
check("audio_loudnorm_plan", (ROOT / "reports/audio-loudnorm.json").exists())
report = {"status": "PASS" if all(c["status"] == "PASS" for c in checks) else "FAIL", "checks": len(checks), "passed": sum(c["status"] == "PASS" for c in checks), "failed": sum(c["status"] == "FAIL" for c in checks), "results": checks}
(ROOT / "reports/project-qa.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(0 if report["status"] == "PASS" else 1)
