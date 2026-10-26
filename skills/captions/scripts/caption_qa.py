#!/usr/bin/env python3
"""Valida SRT/VTT: tempos, sobreposição, leitura e duração contra o vídeo."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

TIME = r"(\d+):(\d{2}):(\d{2})[,.](\d{3})"
TIMING = re.compile(rf"{TIME}\s+-->\s+{TIME}")


def seconds(groups: tuple[str, ...] | list[str]) -> float:
    hours, minutes, secs, millis = (int(value) for value in groups[:4])
    return hours * 3600 + minutes * 60 + secs + millis / 1000


def clean_text(lines: list[str]) -> str:
    value = " ".join(lines)
    return re.sub(r"<[^>]+>", "", value).strip()


def parse(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    text = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"^\uFEFF?WEBVTT[^\n]*\n", "", text)
    captions: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []
    for number, block in enumerate(re.split(r"\n\s*\n", text.strip()), start=1):
        if not block.strip() or block.strip().startswith(("NOTE", "STYLE", "REGION")):
            continue
        lines = block.strip().split("\n")
        timing_index = next((index for index, line in enumerate(lines) if "-->" in line), -1)
        if timing_index < 0:
            issues.append({"severity": "error", "block": number, "message": "Bloco sem linha de tempo."})
            continue
        match = TIMING.search(lines[timing_index])
        if not match:
            issues.append({"severity": "error", "block": number, "message": "Timestamp inválido; use HH:MM:SS,mmm --> HH:MM:SS,mmm."})
            continue
        groups = match.groups()
        start = seconds(groups[:4])
        end = seconds(groups[4:8])
        content_lines = lines[timing_index + 1:]
        content = clean_text(content_lines)
        captions.append({
            "block": number, "start": start, "end": end, "duration": end - start,
            "text": content, "lines": len(content_lines),
            "line_lengths": [len(clean_text([line])) for line in content_lines],
        })
        if not content:
            issues.append({"severity": "error", "block": number, "message": "Legenda vazia."})
    return captions, issues


def video_duration(path: Path) -> float:
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path),
    ], stdin=subprocess.DEVNULL, capture_output=True, text=True, encoding="utf-8", errors="replace", check=False)
    if result.returncode:
        raise RuntimeError(f"ffprobe falhou: {result.stderr.strip()[-1000:]}")
    return float(json.loads(result.stdout)["format"]["duration"])


def analyze(captions: list[dict[str, Any]], issues: list[dict[str, Any]], args: argparse.Namespace) -> None:
    previous = None
    for caption in captions:
        block = caption["block"]
        if caption["duration"] <= 0:
            issues.append({"severity": "error", "block": block, "message": "Fim anterior ou igual ao início."})
            continue
        if previous and caption["start"] < previous["start"]:
            issues.append({"severity": "error", "block": block, "message": "Blocos fora de ordem cronológica."})
        if previous and caption["start"] < previous["end"] - 0.001:
            issues.append({"severity": "warning", "block": block, "message": f"Sobrepõe o bloco {previous['block']}."})
        if caption["duration"] > args.max_duration:
            issues.append({"severity": "warning", "block": block, "message": f"Duração {caption['duration']:.2f}s acima de {args.max_duration}s."})
        if caption["lines"] > args.max_lines:
            issues.append({"severity": "warning", "block": block, "message": f"{caption['lines']} linhas; recomendado até {args.max_lines}."})
        for length in caption["line_lengths"]:
            if length > args.max_line_length:
                issues.append({"severity": "warning", "block": block, "message": f"Linha com {length} caracteres; limite {args.max_line_length}."})
        visible_characters = len(re.sub(r"\s+", "", caption["text"]))
        cps = visible_characters / caption["duration"]
        caption["characters_per_second"] = round(cps, 2)
        if cps > args.max_cps:
            issues.append({"severity": "warning", "block": block, "message": f"Leitura de {cps:.1f} caracteres/s; limite {args.max_cps}."})
        previous = caption


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("captions", type=Path)
    result.add_argument("--video", type=Path, help="Vídeo para comparar a duração.")
    result.add_argument("--output", help="Gravar relatório JSON.")
    result.add_argument("--max-cps", type=float, default=25.0)
    result.add_argument("--max-line-length", type=int, default=42)
    result.add_argument("--max-lines", type=int, default=2)
    result.add_argument("--max-duration", type=float, default=7.0)
    result.add_argument("--strict", action="store_true", help="Retornar 1 também quando houver avisos.")
    return result


def main() -> int:
    args = parser().parse_args()
    path = args.captions.expanduser().resolve()
    if not path.is_file():
        print(f"Arquivo não encontrado: {path}", file=sys.stderr)
        return 2
    try:
        captions, issues = parse(path)
        if not captions:
            issues.append({"severity": "error", "block": None, "message": "Nenhuma legenda válida encontrada."})
        analyze(captions, issues, args)
        if args.video:
            duration = video_duration(args.video.expanduser().resolve())
            for caption in captions:
                if caption["end"] > duration + 0.25:
                    issues.append({"severity": "error", "block": caption["block"], "message": f"Termina em {caption['end']:.3f}s, além do vídeo ({duration:.3f}s)."})
    except (OSError, UnicodeError, ValueError, KeyError, RuntimeError, json.JSONDecodeError) as error:
        print(str(error), file=sys.stderr)
        return 2
    errors = sum(issue["severity"] == "error" for issue in issues)
    warnings = sum(issue["severity"] == "warning" for issue in issues)
    status = "fail" if errors else "warning" if warnings else "pass"
    report = {"file": str(path), "status": status, "caption_count": len(captions), "summary": {"errors": errors, "warnings": warnings}, "issues": issues, "captions": captions}
    serialized = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        destination = Path(args.output)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(serialized, encoding="utf-8")
        print(f"{status.upper()}: {errors} erro(s), {warnings} aviso(s). Relatório: {destination}")
    else:
        sys.stdout.write(serialized)
    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
