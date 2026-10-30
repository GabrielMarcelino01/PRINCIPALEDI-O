#!/usr/bin/env python3
"""Prepara PARA EDIÇÃO-2 com a mesma melhoria de imagem e superlegendas do primeiro."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "original.mov"
PUBLIC = ROOT / "public"
WORK = ROOT / "work"
REPORTS = ROOT / "reports"
EXPECTED_SHA256 = "fccbe853e0220eaf9cd64da0e222022945cf90e9798ea383b85d881de7d714a1"
SOURCE_COMMIT = "142becb1309f29523250f3e992d292d2101b5c7d"
FPS = 24
# Pontos de revisão de cortes/movimento já existentes; nenhum corte é criado ou removido.
CUTS = [4.1416, 5.32492, 6.24157, 7.51728, 8.85059, 9.76724, 10.8506, 13.6005, 17.7313, 18.0729]
VIDEO_FILTERS = (
    "fps=24,"
    "hqdn3d=0.5:0.5:1.0:1.0,"
    "scale=1080:1920:flags=lanczos:in_color_matrix=bt709:out_color_matrix=bt709,"
    "eq=contrast=1.025:brightness=0:saturation=1.03:gamma=1.005,"
    "unsharp=5:5:0.22:5:5:0"
)


def tool(name: str) -> str:
    configured = os.environ.get(name.upper())
    found = configured or shutil.which(name)
    if not found:
        raise RuntimeError(f"{name} não encontrado no PATH.")
    return found


FFMPEG = tool("ffmpeg")
FFPROBE = tool("ffprobe")


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace", check=False)
    if result.returncode:
        raise RuntimeError(f"Comando falhou ({result.returncode}): {' '.join(command)}\n{result.stderr[-3000:]}")
    return result


def probe(path: Path, count_frames: bool = False) -> dict:
    command = [FFPROBE, "-v", "error"]
    if count_frames:
        command += ["-count_frames", "-select_streams", "v:0"]
    command += ["-show_format", "-show_streams", "-of", "json", str(path)]
    return json.loads(run(command).stdout)


def video_frame_count(path: Path) -> int:
    data = probe(path, count_frames=True)
    stream = next(item for item in data["streams"] if item["codec_type"] == "video")
    value = stream.get("nb_read_frames") or stream.get("nb_frames")
    if not value:
        raise RuntimeError("Falha ao contar os quadros normalizados.")
    return int(value)


def prepare_media() -> dict:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    normalized = PUBLIC / "para-edicao-2-source.mp4"
    audio = PUBLIC / "para-edicao-2-audio.wav"
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-map", "0:v:0", "-an", "-vf", VIDEO_FILTERS,
        "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-video_track_timescale", "24000", "-movflags", "+faststart", str(normalized),
    ])
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-map", "0:a:0", "-vn", "-c:a", "pcm_s24le", "-ar", "48000", "-ac", "2", str(audio),
    ])
    source_probe = probe(SOURCE)
    normalized_probe = probe(normalized)
    audio_probe = probe(audio)
    frames = video_frame_count(normalized)
    report = {
        "source_commit": SOURCE_COMMIT,
        "source_sha256": EXPECTED_SHA256,
        "source_probe": source_probe,
        "normalized_probe": normalized_probe,
        "audio_probe": audio_probe,
        "normalized_frames": frames,
        "video_filters": VIDEO_FILTERS,
        "quality": "Upscale Lanczos 1080x1920 com matriz BT.709 correta, denoise leve, contraste/saturação discretos e sharpen moderado; sem interpolação de movimento.",
        "audio_processing": "PCM 24 bits/48 kHz intermediário sem EQ, compressão, loudnorm, música, SFX ou alteração de velocidade; o master final copia o AAC original a 44,1 kHz.",
        "preservation": "Todos os cortes, close-ups, poses, câmeras, ritmo e enquadramentos da fonte preservados; nenhum elemento visual além das captions.",
        "cuts": CUTS,
    }
    (ROOT / "para-edicao-2-prepare-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (REPORTS / "source-probe.json").write_text(json.dumps(source_probe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def display_text(value: str) -> str:
    return value.strip().upper()


def group_specs() -> list[list[dict]]:
    normal, small, serif = "normal", "small", "serif"
    cream, white = "#fff4e2", "#ffffff"
    rose_tea, chocolate = "#e8b4bb", "#b88773"
    caramel, burnt_rose, brown = "#d7a06f", "#e4a0a8", "#b08170"
    olive, beige, wine, gray = "#b7c58a", "#ead9bd", "#c97585", "#d7d9dc"
    return [
        [
            {"suffix": "cores-a", "lines": [[0], [1]], "styles": {0: small}, "colors": {1: rose_tea}},
            {"suffix": "cores-b", "lines": [[2, 3], [4]], "styles": {2: small}, "colors": {3: chocolate, 4: chocolate}},
            {"suffix": "resultado", "lines": [[5, 6], [7, 8]], "styles": {5: small, 6: serif, 7: small}, "colors": {6: cream, 8: white}},
        ],
        [
            {"suffix": "cores", "lines": [[0, 1, 2], [3]], "styles": {0: small, 2: small}, "colors": {1: white, 3: caramel}},
            {"suffix": "resultado", "lines": [[4, 5, 6], [7, 8]], "styles": {4: small, 5: small, 6: serif, 7: small}, "colors": {6: cream, 8: caramel}},
        ],
        [
            {"suffix": "cores", "lines": [[0, 1], [2, 3]], "styles": {0: small, 2: small}, "colors": {1: burnt_rose, 3: brown}},
            {"suffix": "resultado", "lines": [[4, 5, 6], [7, 8]], "styles": {4: small, 5: small, 6: serif, 7: small}, "colors": {6: cream, 8: burnt_rose}},
        ],
        [
            {"suffix": "cores", "lines": [[0, 1], [2, 3]], "styles": {0: small, 2: small}, "colors": {1: olive, 3: beige}},
            {"suffix": "resultado", "lines": [[4, 5, 6], [7, 8]], "styles": {4: small, 5: small, 6: serif, 7: small}, "colors": {6: cream, 8: olive}},
        ],
        [
            {"suffix": "cores", "lines": [[0, 1, 2], [3, 4]], "styles": {0: small, 2: small}, "colors": {1: wine, 3: gray, 4: gray}},
            {"suffix": "resultado", "lines": [[5, 6, 7], [8, 9]], "styles": {5: small, 6: small, 7: serif, 8: small}, "colors": {7: cream, 9: wine}},
        ],
    ]


def build_groups(transcript: dict, duration: float) -> list[dict]:
    groups: list[dict] = []
    for segment, specs in zip(transcript["segments"], group_specs(), strict=True):
        words = segment["words"]
        covered: list[int] = []
        for spec_index, spec in enumerate(specs):
            indices = [index for line in spec["lines"] for index in line]
            if len(indices) != len(set(indices)):
                raise RuntimeError(f"Índice repetido em {segment['id']} / {spec['suffix']}")
            covered.extend(indices)
            start = float(words[indices[0]]["start"])
            if spec_index + 1 < len(specs):
                next_first = specs[spec_index + 1]["lines"][0][0]
                end = float(words[next_first]["start"])
            else:
                end = min(duration, float(segment["end"]))
            lines = []
            for line_indices in spec["lines"]:
                line = []
                for index in line_indices:
                    source_word = words[index]
                    item = {
                        "text": display_text(source_word["word"]),
                        "start": float(source_word["start"]),
                        "end": float(source_word["end"]),
                        "style": spec["styles"].get(index, "normal"),
                    }
                    color = spec["colors"].get(index)
                    if color:
                        item["color"] = color
                    line.append(item)
                lines.append(line)
            lines[-1][-1]["end"] = end
            groups.append({
                "id": f"{segment['id']}-{spec['suffix']}",
                "start": start,
                "end": end,
                "position": "knee",
                "lines": lines,
            })
        if sorted(covered) != list(range(len(words))):
            raise RuntimeError(f"Palavras omitidas ou duplicadas em {segment['id']}: {covered}")
    return groups


def timestamp(value: float) -> str:
    millis = round(value * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    seconds, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"


def write_project(report: dict) -> None:
    frames = report["normalized_frames"]
    duration = frames / FPS
    transcript = json.loads((ROOT / "para-edicao-2-transcript.json").read_text(encoding="utf-8"))
    groups = build_groups(transcript, duration)
    project = {
        "id": "para-edicao-2",
        "width": 1080,
        "height": 1920,
        "fps": FPS,
        "durationInFrames": frames,
        "duration": duration,
        "video": "para-edicao-2-source.mp4",
        "audio": "para-edicao-2-audio.wav",
        "cuts": CUTS,
        "groups": groups,
        "showSafeZones": False,
        "safeZones": {"top": 200, "bottom": 360, "left": 60, "right": 60},
        "captionStyle": {"top": 1210, "maxWidth": 960, "fontSize": 96, "serifFontSize": 120, "smallFontSize": 50},
        "captionPositions": {"knee": {"top": 1210, "align": "center"}},
        "cameraMotion": False,
        "extraVisualElements": [],
        "audioProcessing": "preserve",
    }
    (ROOT / "para-edicao-2-project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    blocks = []
    for index, item in enumerate(groups, 1):
        text = "\n".join(" ".join(word["text"] for word in line) for line in item["lines"])
        blocks.append(f"{index}\n{timestamp(item['start'])} --> {timestamp(item['end'])}\n{text}\n")
    (ROOT / "para-edicao-2-captions.srt").write_text("\n".join(blocks), encoding="utf-8")


def main() -> int:
    if not SOURCE.is_file():
        raise RuntimeError(f"Fonte ausente: {SOURCE}")
    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise RuntimeError(f"SHA-256 da fonte mudou: {digest}")
    report = prepare_media()
    write_project(report)
    transcript = json.loads((ROOT / "para-edicao-2-transcript.json").read_text(encoding="utf-8"))
    print(json.dumps({
        "status": "prepared",
        "frames": report["normalized_frames"],
        "duration": report["normalized_frames"] / FPS,
        "caption_groups": sum(len(segment["group_ids"]) for segment in transcript["segments"]),
        "words": sum(len(segment["words"]) for segment in transcript["segments"]),
        "caption_top": 1210,
        "audio": "original AAC copiado no master final",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
