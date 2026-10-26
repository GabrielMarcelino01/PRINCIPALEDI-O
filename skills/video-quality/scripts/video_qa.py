#!/usr/bin/env python3
"""QA técnico de vídeo com ffprobe/FFmpeg, sem dependências Python externas."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from fractions import Fraction
from pathlib import Path
from typing import Any


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )


def require_tools(quick: bool, contact_sheet: str | None) -> None:
    missing = ["ffprobe"] if not shutil.which("ffprobe") else []
    if (not quick or contact_sheet) and not shutil.which("ffmpeg"):
        missing.append("ffmpeg")
    if missing:
        raise RuntimeError(f"Ferramentas ausentes no PATH: {', '.join(missing)}")


def probe(path: Path) -> dict[str, Any]:
    result = run([
        "ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)
    ])
    if result.returncode:
        raise RuntimeError(f"ffprobe falhou: {result.stderr.strip()[-1500:]}")
    return json.loads(result.stdout)


def number(value: Any, default: float | None = None) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def frame_rate(stream: dict[str, Any]) -> float | None:
    value = stream.get("avg_frame_rate") or stream.get("r_frame_rate")
    try:
        rate = float(Fraction(value))
        return rate if rate > 0 else None
    except (TypeError, ValueError, ZeroDivisionError):
        return None


def last_match(pattern: str, text: str) -> float | None:
    matches = re.findall(pattern, text, flags=re.MULTILINE)
    return float(matches[-1]) if matches else None


def loudness(path: Path) -> dict[str, float | None]:
    result = run([
        "ffmpeg", "-nostdin", "-hide_banner", "-i", str(path),
        "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-",
    ])
    if result.returncode:
        raise RuntimeError(f"Análise EBU R128 falhou: {result.stderr.strip()[-1500:]}")
    return {
        "integrated_lufs": last_match(r"^\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", result.stderr),
        "true_peak_dbtp": last_match(r"^\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS", result.stderr),
    }


def visual_events(path: Path) -> dict[str, list[str]]:
    result = run([
        "ffmpeg", "-nostdin", "-hide_banner", "-i", str(path), "-map", "0:v:0",
        "-vf", "blackdetect=d=0.50:pix_th=0.02,freezedetect=n=0.003:d=1.0",
        "-an", "-f", "null", "-",
    ])
    if result.returncode:
        raise RuntimeError(f"Detecção visual falhou: {result.stderr.strip()[-1500:]}")
    lines = [line.strip() for line in result.stderr.splitlines()]
    return {
        "black": [line for line in lines if "black_start:" in line],
        "freeze": [line for line in lines if "freeze_start:" in line],
    }


def make_contact_sheet(path: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    result = run([
        "ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(path), "-vf", "fps=1/5,scale=320:-2,tile=5x4:padding=4:margin=4",
        "-frames:v", "1", str(destination),
    ])
    if result.returncode:
        raise RuntimeError(f"Folha de contato falhou: {result.stderr.strip()[-1500:]}")


def add_check(report: dict[str, Any], name: str, status: str, message: str) -> None:
    report["checks"].append({"name": name, "status": status, "message": message})


def build_report(path: Path, args: argparse.Namespace) -> dict[str, Any]:
    data = probe(path)
    streams = data.get("streams", [])
    video = next((item for item in streams if item.get("codec_type") == "video"), None)
    audio = next((item for item in streams if item.get("codec_type") == "audio"), None)
    duration = number(data.get("format", {}).get("duration"))
    fps = frame_rate(video) if video else None
    report: dict[str, Any] = {
        "file": str(path),
        "media": {
            "duration_seconds": duration,
            "size_bytes": number(data.get("format", {}).get("size")),
            "format_name": data.get("format", {}).get("format_name"),
            "video": None if not video else {
                "codec": video.get("codec_name"), "width": video.get("width"),
                "height": video.get("height"), "fps": fps, "pixel_format": video.get("pix_fmt"),
            },
            "audio": None if not audio else {
                "codec": audio.get("codec_name"), "sample_rate": audio.get("sample_rate"),
                "channels": audio.get("channels"), "channel_layout": audio.get("channel_layout"),
            },
        },
        "analysis": {},
        "checks": [],
    }

    if not video:
        add_check(report, "video_stream", "fail", "Nenhum stream de vídeo encontrado.")
        return report
    add_check(report, "video_stream", "pass", f"{video.get('codec_name')} {video.get('width')}x{video.get('height')} @ {fps:.3f} fps" if fps else "Stream de vídeo encontrado.")
    if not duration or duration <= 0:
        add_check(report, "duration", "fail", "Duração ausente ou não positiva.")
    else:
        add_check(report, "duration", "pass", f"{duration:.3f} s")
    for label, actual, expected in (
        ("width", video.get("width"), args.expected_width),
        ("height", video.get("height"), args.expected_height),
    ):
        if expected is not None:
            add_check(report, label, "pass" if actual == expected else "fail", f"Esperado {expected}; encontrado {actual}.")
    if args.min_fps is not None:
        valid = fps is not None and fps + 0.001 >= args.min_fps
        add_check(report, "fps", "pass" if valid else "fail", f"Mínimo {args.min_fps}; encontrado {fps}.")

    if not audio:
        add_check(report, "audio_stream", "warning", "Nenhum stream de áudio; confirme que o vídeo deve ser mudo.")
    if not args.quick and audio:
        levels = loudness(path)
        report["analysis"]["loudness"] = levels
        integrated = levels["integrated_lufs"]
        peak = levels["true_peak_dbtp"]
        if args.target_loudness is not None:
            valid = integrated is not None and abs(integrated - args.target_loudness) <= args.loudness_tolerance
            add_check(report, "integrated_loudness", "pass" if valid else "fail", f"Alvo {args.target_loudness} ± {args.loudness_tolerance} LUFS; encontrado {integrated}.")
        elif integrated is not None:
            add_check(report, "integrated_loudness", "pass", f"{integrated:.2f} LUFS integrado (sem alvo configurado).")
        if args.max_true_peak is not None:
            valid = peak is not None and peak <= args.max_true_peak + 0.001
            add_check(report, "true_peak", "pass" if valid else "fail", f"Máximo {args.max_true_peak} dBTP; encontrado {peak}.")

    if not args.quick:
        events = visual_events(path)
        report["analysis"]["visual_events"] = events
        for name, values in events.items():
            status = "warning" if values else "pass"
            add_check(report, name, status, f"{len(values)} evento(s); inspecione qualquer ocorrência." if values else "Nenhum evento detectado.")
    if args.contact_sheet:
        make_contact_sheet(path, Path(args.contact_sheet))
        report["contact_sheet"] = str(Path(args.contact_sheet))
    return report


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("video", type=Path)
    result.add_argument("--output", help="Gravar relatório JSON neste caminho.")
    result.add_argument("--contact-sheet", help="Gravar uma folha de contato JPG/PNG.")
    result.add_argument("--expected-width", type=int)
    result.add_argument("--expected-height", type=int)
    result.add_argument("--min-fps", type=float)
    result.add_argument("--target-loudness", type=float, help="Alvo integrado em LUFS, ex.: -14.")
    result.add_argument("--loudness-tolerance", type=float, default=1.0)
    result.add_argument("--max-true-peak", type=float, default=-1.0)
    result.add_argument("--quick", action="store_true", help="Somente ffprobe e checks de formato.")
    result.add_argument("--strict", action="store_true", help="Retornar 1 quando houver falha objetiva.")
    return result


def main() -> int:
    args = parser().parse_args()
    path = args.video.expanduser().resolve()
    if not path.is_file():
        print(f"Arquivo não encontrado: {path}", file=sys.stderr)
        return 2
    try:
        require_tools(args.quick, args.contact_sheet)
        report = build_report(path, args)
    except (RuntimeError, ValueError, json.JSONDecodeError) as error:
        print(str(error), file=sys.stderr)
        return 2
    failures = [item for item in report["checks"] if item["status"] == "fail"]
    warnings = [item for item in report["checks"] if item["status"] == "warning"]
    report["status"] = "fail" if failures else "warning" if warnings else "pass"
    report["summary"] = {"failures": len(failures), "warnings": len(warnings)}
    serialized = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        destination = Path(args.output)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(serialized, encoding="utf-8")
        print(f"{report['status'].upper()}: {len(failures)} falha(s), {len(warnings)} aviso(s). Relatório: {destination}")
    else:
        sys.stdout.write(serialized)
    return 1 if args.strict and failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
