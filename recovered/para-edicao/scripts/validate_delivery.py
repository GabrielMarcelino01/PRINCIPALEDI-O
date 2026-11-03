#!/usr/bin/env python3
"""QA integral do master PARA EDIÇÃO, sem declarar revisão subjetiva de playback."""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
FINAL = (ROOT / "../../entregas/PARA-EDICAO-EDITADO.mp4").resolve()
SOURCE = ROOT / "assets" / "original.mp4"
NORMALIZED = ROOT / "public" / "para-edicao-source.mp4"
ORIGINAL_AUDIO = ROOT / "public" / "para-edicao-audio.wav"
WORK = ROOT / "work"
REPORT = ROOT / "reports" / "para-edicao-delivery-qa.json"
EXPECTED_SHA256 = "8f53940d41227dc7ff0d2921980acc94c340e68805217534c4dd7a2d3edd6043"


def tool(name: str) -> str:
    configured = os.environ.get(name.upper())
    found = configured or shutil.which(name)
    if not found:
        raise RuntimeError(f"{name} não encontrado no PATH.")
    return found


FFMPEG = tool("ffmpeg")
FFPROBE = tool("ffprobe")


def run(command: list[str], binary: bool = False) -> subprocess.CompletedProcess:
    result = subprocess.run(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=not binary, encoding=None if binary else "utf-8", errors=None if binary else "replace", check=False)
    if result.returncode:
        stderr = result.stderr if binary else result.stderr[-3000:]
        raise RuntimeError(f"Comando falhou ({result.returncode}): {' '.join(command)}\n{stderr}")
    return result


def probe(path: Path, count_frames: bool = False) -> dict:
    command = [FFPROBE, "-v", "error"]
    if count_frames:
        command += ["-count_frames"]
    command += ["-show_format", "-show_streams", "-of", "json", str(path)]
    return json.loads(run(command).stdout)


def loudness(path: Path) -> dict:
    result = run([FFMPEG, "-nostdin", "-hide_banner", "-i", str(path), "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"])
    integrated = re.findall(r"^\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", result.stderr, re.MULTILINE)
    peak = re.findall(r"^\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS", result.stderr, re.MULTILINE)
    if not integrated or not peak:
        raise RuntimeError(f"Falha ao medir loudness: {path}")
    return {"integrated_lufs": float(integrated[-1]), "true_peak_dbtp": float(peak[-1])}


def stream_hash(path: Path, stream: str) -> str:
    result = run([FFMPEG, "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(path), "-map", stream, "-c", "copy", "-f", "hash", "-hash", "sha256", "-"])
    return result.stdout.strip().split("=", 1)[-1]


def audio_metrics() -> dict:
    WORK.mkdir(parents=True, exist_ok=True)
    decoded = WORK / "delivery-audio.wav"
    run([FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(FINAL), "-map", "0:a:0", "-vn", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(decoded)])
    original, sr1 = sf.read(ORIGINAL_AUDIO, dtype="float32", always_2d=True)
    delivery, sr2 = sf.read(decoded, dtype="float32", always_2d=True)
    if sr1 != sr2 or sr1 != 48000:
        raise RuntimeError("Sample rates divergentes na comparação de áudio.")
    a = original.mean(axis=1)
    b = delivery.mean(axis=1)
    count = min(len(a), len(b))
    a, b = a[:count], b[:count]

    def correlation(x: np.ndarray, y: np.ndarray) -> float:
        x = x - float(np.mean(x))
        y = y - float(np.mean(y))
        denominator = float(np.linalg.norm(x) * np.linalg.norm(y))
        return float(np.dot(x, y) / denominator) if denominator else 0.0

    direct = correlation(a, b)
    best_lag = 0
    best = direct
    if direct < 0.995:
        step = 8
        a_small, b_small = a[::step], b[::step]
        for lag in range(-4800, 4801, step):
            if lag < 0:
                value = correlation(a_small[-lag // step:], b_small[:lag // step])
            elif lag > 0:
                value = correlation(a_small[:-lag // step], b_small[lag // step:])
            else:
                value = correlation(a_small, b_small)
            if value > best:
                best, best_lag = value, lag
        if best_lag < 0:
            a, b = a[-best_lag:], b[:best_lag]
        elif best_lag > 0:
            a, b = a[:-best_lag], b[best_lag:]
    final_correlation = correlation(a, b)
    rms_a = float(np.sqrt(np.mean(a * a)))
    rms_b = float(np.sqrt(np.mean(b * b)))
    return {
        "correlation": final_correlation,
        "rms_ratio": rms_b / rms_a if rms_a else None,
        "best_lag_samples": best_lag,
        "original_seconds": len(original) / 48000,
        "delivery_seconds": len(delivery) / 48000,
    }


def rgb_frame(path: Path, time: float) -> np.ndarray:
    result = run([
        FFMPEG, "-nostdin", "-hide_banner", "-loglevel", "error", "-ss", f"{time:.6f}", "-i", str(path),
        "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ], binary=True)
    expected = 1080 * 1920 * 3
    if len(result.stdout) != expected:
        raise RuntimeError(f"Quadro inesperado em {path} @ {time}: {len(result.stdout)} bytes")
    return np.frombuffer(result.stdout, dtype=np.uint8).reshape(1920, 1080, 3)


def visual_metrics() -> list[dict]:
    rows = []
    for time in [1.0, 6.5, 11.5, 16.5, 21.5]:
        before = rgb_frame(NORMALIZED, time).astype(np.float32)
        after = rgb_frame(FINAL, time).astype(np.float32)
        mask = np.zeros((1920, 1080), dtype=bool)
        mask[:1050, :] = True
        mask[1550:, :] = True
        difference = np.abs(before - after)[mask]
        mae = float(np.mean(difference))
        mse = float(np.mean((before[mask] - after[mask]) ** 2))
        psnr = 99.0 if mse == 0 else 10 * math.log10((255.0 ** 2) / mse)
        rows.append({"time": time, "outside_caption_mae_8bit": mae, "outside_caption_psnr_db": psnr})
    return rows


def main() -> int:
    project = json.loads((ROOT / "para-edicao-project.json").read_text(encoding="utf-8"))
    checks: list[dict[str, str]] = []

    def check(name: str, condition: bool, message: str) -> None:
        checks.append({"name": name, "status": "pass" if condition else "fail", "message": message})

    check("delivery_exists", FINAL.is_file() and FINAL.stat().st_size > 1_000_000, str(FINAL))
    check("source_integrity", hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED_SHA256, "Fonte original inalterada")
    final_probe = probe(FINAL, count_frames=True)
    source_probe = probe(SOURCE)
    streams = final_probe["streams"]
    video = next(item for item in streams if item["codec_type"] == "video")
    audio = next(item for item in streams if item["codec_type"] == "audio")
    check("two_streams", len(streams) == 2, "Somente vídeo e áudio original")
    check("video_codec", video["codec_name"] == "h264" and video["pix_fmt"] == "yuv420p", "H.264/yuv420p")
    check("dimensions", (video["width"], video["height"]) == (1080, 1920), "1080x1920")
    check("frame_rate", video["r_frame_rate"] == "24/1", "24 fps")
    check("color_metadata", video.get("color_space") == "bt709" and video.get("color_primaries") == "bt709" and video.get("color_transfer") == "bt709", "BT.709 completo")
    frames = int(video.get("nb_read_frames") or video.get("nb_frames"))
    check("frame_count", frames == project["durationInFrames"], f"{frames} quadros")
    final_duration = float(final_probe["format"]["duration"])
    video_duration = float(video["duration"])
    source_duration = float(source_probe["format"]["duration"])
    source_audio = next(item for item in source_probe["streams"] if item["codec_type"] == "audio")
    check("duration", abs(video_duration - project["duration"]) <= 0.05 and abs(video_duration - source_duration) <= 0.05 and 0 <= final_duration - video_duration < 0.1, f"Contêiner {final_duration:.6f}s; vídeo {video_duration:.6f}s; fonte {source_duration:.6f}s")
    check("audio_codec", audio["codec_name"] == "aac" and audio["sample_rate"] == "48000" and audio["channels"] == 2, "AAC-LC estéreo 48 kHz")
    source_audio_bitrate = int(source_audio.get("bit_rate", 0))
    delivery_audio_bitrate = int(audio.get("bit_rate", 0))
    check("audio_bitrate", source_audio_bitrate > 0 and abs(delivery_audio_bitrate - source_audio_bitrate) / source_audio_bitrate <= 0.01, f"Original {source_audio_bitrate} bit/s; master {delivery_audio_bitrate} bit/s")
    source_audio_hash = stream_hash(SOURCE, "0:a:0")
    delivery_audio_hash = stream_hash(FINAL, "0:a:0")
    check("audio_bitstream_identical", source_audio_hash == delivery_audio_hash, "Fluxo AAC do master é idêntico ao original")

    decoded = run([FFMPEG, "-nostdin", "-v", "error", "-i", str(FINAL), "-f", "null", "-"])
    check("full_decode", not decoded.stderr.strip(), "Decodificação integral sem erros")

    source_loudness = loudness(SOURCE)
    delivery_loudness = loudness(FINAL)
    loudness_delta = abs(source_loudness["integrated_lufs"] - delivery_loudness["integrated_lufs"])
    check("loudness_preserved", loudness_delta <= 0.35, f"Delta {loudness_delta:.3f} LU; final {delivery_loudness['integrated_lufs']} LUFS")
    audio_result = audio_metrics()
    check("audio_waveform", audio_result["correlation"] >= 0.995 and 0.95 <= audio_result["rms_ratio"] <= 1.05, f"Correlação {audio_result['correlation']:.6f}; RMS {audio_result['rms_ratio']:.4f}")
    check("audio_sync", audio_result["best_lag_samples"] == 0, f"Deslocamento {audio_result['best_lag_samples']} amostras a 48 kHz")
    visual = visual_metrics()
    worst_mae = max(row["outside_caption_mae_8bit"] for row in visual)
    worst_psnr = min(row["outside_caption_psnr_db"] for row in visual)
    check("outside_caption_consistency", worst_mae <= 8.0 and worst_psnr >= 25.0, f"MAE máx. {worst_mae:.3f}/255; PSNR mín. {worst_psnr:.2f} dB fora das captions")

    failures = [item for item in checks if item["status"] == "fail"]
    report = {
        "status": "PASS" if not failures else "FAIL",
        "scope": "QA técnico do MP4, decodificação integral, preservação de áudio e consistência fora das captions. Não declara escuta humana integral nem aprovação estética em playback.",
        "file": str(FINAL),
        "size_bytes": FINAL.stat().st_size,
        "sha256": hashlib.sha256(FINAL.read_bytes()).hexdigest(),
        "duration_seconds": final_duration,
        "video_duration_seconds": video_duration,
        "frames": frames,
        "audio_delivery": "AAC original copiado sem recodificação",
        "audio_stream_sha256": {"source": source_audio_hash, "delivery": delivery_audio_hash},
        "summary": {"checks": len(checks), "passed": len(checks) - len(failures), "failed": len(failures)},
        "checks": checks,
        "probe": final_probe,
        "loudness": {"source": source_loudness, "delivery": delivery_loudness, "delta_lu": loudness_delta},
        "audio_comparison": audio_result,
        "visual_comparison": visual,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "reports" / "para-edicao-final-probe.json").write_text(json.dumps(final_probe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], **report["summary"], "size_bytes": report["size_bytes"], "sha256": report["sha256"]}, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
