#!/usr/bin/env python3
"""Gate consolidado do master CRIATIVO-3. Requer numpy/scipy e FFmpeg no PATH."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import correlate, correlation_lags

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
FINAL = REPO / "entregas/CRIATIVO-3-EDITADO.mp4"
SOURCE = ROOT / "assets/original.mp4"
REFERENCE_AUDIO = ROOT / "public/criativo-3-audio.wav"
PROJECT = json.loads((ROOT / "criativo-3-project.json").read_text())
checks = []


def check(name, condition, detail=None):
    checks.append({"name": name, "status": "PASS" if bool(condition) else "FAIL", "detail": detail})


def digest(path, algorithm="sha256"):
    h = hashlib.new(algorithm)
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def run(cmd):
    return subprocess.run(cmd, text=True, capture_output=True)


def audio_metrics():
    def decode(path):
        data = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a:0", "-ac", "1", "-ar", "48000", "-f", "f32le", "-"])
        return np.frombuffer(data, dtype="<f4").copy()
    ref = decode(REFERENCE_AUDIO)
    dec = decode(FINAL)
    n = min(len(ref), len(dec), 48000 * 12)
    corr = correlate(dec[:n], ref[:n], mode="full", method="fft")
    lags = correlation_lags(n, n, mode="full")
    valid = np.abs(lags) <= 4800
    lag = int(lags[valid][np.argmax(corr[valid])])
    if lag >= 0:
        x, y = dec[lag:], ref[:len(dec) - lag]
    else:
        x, y = dec[:lag], ref[-lag:len(dec) - lag]
    n = min(len(x), len(y))
    x, y = x[:n], y[:n]
    correlation = float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y)))
    rms_ratio = float(np.sqrt(np.mean(x * x)) / np.sqrt(np.mean(y * y)))
    return {
        "lag_samples": lag, "correlation": correlation, "rms_ratio": rms_ratio,
        "reference_seconds": len(ref) / 48000, "decoded_seconds": len(dec) / 48000,
    }


def main():
    expected_frames = PROJECT["edit"]["output_frames"]
    expected_duration = PROJECT["edit"]["output_duration"]
    check("source_sha256", digest(SOURCE) == PROJECT["source"]["sha256"])
    check("source_drive_md5", digest(SOURCE, "md5") == PROJECT["source"]["drive_md5"])
    check("final_exists", FINAL.exists())
    check("final_size", FINAL.stat().st_size > 1_000_000, FINAL.stat().st_size)
    check("source_and_delivery_distinct", digest(SOURCE) != digest(FINAL))
    probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", str(FINAL)]))
    video = next(s for s in probe["streams"] if s["codec_type"] == "video")
    audio = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    check("video_codec", video["codec_name"] == "h264")
    check("dimensions", (video["width"], video["height"]) == (720, 1280))
    check("fps", video["avg_frame_rate"] == "24/1")
    check("frame_count", int(video["nb_read_frames"]) == expected_frames, video["nb_read_frames"])
    check("video_duration", abs(float(video["duration"]) - expected_duration) <= 1 / 24000, video["duration"])
    check("container_duration", abs(float(probe["format"]["duration"]) - expected_duration) <= 0.05, probe["format"]["duration"])
    check("audio_codec", audio["codec_name"] == "aac")
    check("audio_format", audio["sample_rate"] == "48000" and audio["channels"] == 2)
    check("audio_duration", abs(float(audio["duration"]) - expected_duration) <= 0.05, audio["duration"])
    check("bt709", all(video.get(k) == "bt709" for k in ["color_space", "color_transfer", "color_primaries"]))
    check("limited_range", video.get("color_range") == "tv")
    decoded = run(["ffmpeg", "-v", "error", "-i", str(FINAL), "-f", "null", "-"])
    check("full_decode", decoded.returncode == 0 and not decoded.stderr.strip(), decoded.stderr[-500:])
    loud = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(FINAL), "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-"])
    integrated = [float(x) for x in re.findall(r"I:\s*(-?\d+(?:\.\d+)?)\s+LUFS", loud.stderr)]
    peaks = [float(x) for x in re.findall(r"Peak:\s*(-?\d+(?:\.\d+)?)\s+dB", loud.stderr)]
    loudness = {"integrated_lufs": integrated[-1] if integrated else None, "true_peak_dbtp": peaks[-1] if peaks else None}
    check("loudness_measurement", integrated and peaks)
    check("integrated_loudness", integrated and abs(integrated[-1] + 16.0) <= 0.3, loudness)
    check("true_peak", peaks and peaks[-1] <= -1.0, loudness)
    sync = audio_metrics()
    check("audio_sync_zero_lag", sync["lag_samples"] == 0, sync)
    check("audio_correlation", sync["correlation"] >= 0.995, sync["correlation"])
    check("audio_rms", 0.98 <= sync["rms_ratio"] <= 1.02, sync["rms_ratio"])
    captions = PROJECT["captions"]
    check("caption_count", len(captions) == 32)
    check("caption_cps", max(c["cps"] for c in captions) <= 25, max(c["cps"] for c in captions))
    check("caption_one_line", all(len(c["lines"]) == 1 for c in captions))
    check("caption_width", max(c["text_width_px"] for c in captions) <= 640)
    check("caption_timing", all(0 <= c["start"] < c["end"] <= expected_duration for c in captions))
    caption_qa = json.loads((ROOT / "reports/caption-qa.json").read_text())
    check("caption_qa", caption_qa["status"] == "pass" and caption_qa["summary"] == {"errors": 0, "warnings": 0}, caption_qa["summary"])
    video_qa = json.loads((ROOT / "reports/video-qa.json").read_text())
    check("video_qa", video_qa["status"] == "pass" and video_qa["summary"] == {"failures": 0, "warnings": 0}, video_qa["summary"])
    project_qa = json.loads((ROOT / "reports/project-qa.json").read_text())
    check("project_qa", project_qa["status"] == "PASS" and project_qa["failed"] == 0, f'{project_qa["passed"]}/{project_qa["checks"]}')
    check("natural_speed", PROJECT["edit"]["speed"] == 1.0 and expected_frames == PROJECT["edit"]["kept_frames"])
    check("no_placeholder_text", not any(re.search(r"placeholder|lorem ipsum|texto aqui", c["text"], re.I) for c in captions))
    review = json.loads((ROOT / "reports/delivery-review.json").read_text())
    check("visual_review", review["status"] == "PASS" and review["caption_cues_reviewed"] == 32 and review["cut_boundaries_reviewed"] == 15 and review["first_last_reviewed"] is True, {"frames": review["frames_reviewed"]})
    report = {
        "status": "PASS" if all(c["status"] == "PASS" for c in checks) else "FAIL",
        "checks": len(checks), "passed": sum(c["status"] == "PASS" for c in checks),
        "failed": sum(c["status"] == "FAIL" for c in checks), "file": str(FINAL),
        "size_bytes": FINAL.stat().st_size, "sha256": digest(FINAL),
        "duration_seconds": float(video["duration"]), "frames": int(video["nb_read_frames"]),
        "loudness": loudness, "audio_comparison": sync, "results": checks,
    }
    (ROOT / "reports/delivery-qa.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: report[k] for k in ["status", "checks", "passed", "failed", "size_bytes", "sha256", "duration_seconds", "frames", "loudness", "audio_comparison"]}, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
