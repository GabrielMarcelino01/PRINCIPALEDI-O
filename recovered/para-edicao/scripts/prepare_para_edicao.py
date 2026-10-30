#!/usr/bin/env python3
"""Prepara PARA EDIÇÃO: imagem melhor, áudio preservado e superlegendas no joelho."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "original.mp4"
PUBLIC = ROOT / "public"
WORK = ROOT / "work"
REPORTS = ROOT / "reports"
EXPECTED_SHA256 = "8f53940d41227dc7ff0d2921980acc94c340e68805217534c4dd7a2d3edd6043"
SOURCE_COMMIT = "4b7b033914b8a7eac356d964bcef19ffa68a0b95"
FPS = 24
CUTS = [5.64297, 10.5923, 15.5507, 20.423]
VIDEO_FILTERS = (
    "fps=24,"
    "hqdn3d=0.5:0.5:1.0:1.0,"
    "scale=1080:1920:flags=lanczos:in_color_matrix=bt601:out_color_matrix=bt709,"
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
        raise RuntimeError(f"Comando falhou ({result.returncode}):\n{' '.join(command)}\n{result.stderr[-3000:]}")
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
        raise RuntimeError("Não foi possível contar os quadros do vídeo normalizado.")
    return int(value)


def prepare_media() -> dict:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    normalized = PUBLIC / "para-edicao-source.mp4"
    audio = PUBLIC / "para-edicao-audio.wav"
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
        "quality": "Upscale Lanczos 1080x1920, denoise temporal/espacial leve, contraste/saturação discretos e sharpen moderado; sem interpolação de movimento.",
        "audio_processing": "PCM 24 bits/48 kHz extraído sem EQ, compressão, loudnorm, música, SFX ou alteração de velocidade.",
        "preservation": "Cortes, poses, câmera, ritmo, enquadramento e conteúdo da fonte preservados; nenhum elemento visual além das captions.",
        "cuts": CUTS,
    }
    (ROOT / "para-edicao-prepare-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (REPORTS / "source-probe.json").write_text(json.dumps(source_probe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def display_text(value: str) -> str:
    text = value.strip().upper()
    if text == "VERDIMENTA":
        return "VERDE-MENTA"
    if text == "RELEMBRE.":
        return "RELEMBRE,"
    return text


def group_specs() -> list[list[dict]]:
    normal, small, serif = "normal", "small", "serif"
    white, navy, cream, brown = "#ffffff", "#91bcff", "#fff4e2", "#d2a087"
    green, pink, ice, wine = "#b7d69b", "#ffb3c1", "#d9f3ff", "#c97585"
    return [
        [
            {"suffix": "cores", "lines": [[0, 1, 2], [3, 4]], "styles": {0: small, 2: small}, "colors": {1: white, 3: navy, 4: navy}},
            {"suffix": "estilo", "lines": [[5, 6], [7]], "styles": {5: small, 6: serif}, "colors": {6: cream, 7: white}},
            {"suffix": "resultado", "lines": [[8, 9, 10], [11, 12]], "styles": {8: small, 10: serif, 11: small}, "colors": {10: navy}},
        ],
        [
            {"suffix": "cores", "lines": [[0], [1, 2]], "styles": {1: small}, "colors": {0: green, 2: brown}},
            {"suffix": "estilo", "lines": [[3, 4], [5]], "styles": {3: small, 4: serif}, "colors": {4: cream, 5: green}},
            {"suffix": "resultado", "lines": [[6, 7, 8, 9], [10, 11, 12, 13]], "styles": {6: small, 8: small, 10: small, 12: small, 13: serif}, "colors": {13: brown}},
        ],
        [
            {"suffix": "cores", "lines": [[0], [1, 2]], "styles": {1: small}, "colors": {0: pink, 2: brown}},
            {"suffix": "estilo", "lines": [[3, 4], [5]], "styles": {3: small, 4: serif}, "colors": {4: pink, 5: brown}},
            {"suffix": "resultado-a", "lines": [[6, 7], [8, 9]], "styles": {6: small, 8: small}, "colors": {9: pink}},
            {"suffix": "resultado-b", "lines": [[10, 11], [12]], "styles": {11: small, 12: serif}, "colors": {12: pink}},
        ],
        [
            {"suffix": "cores", "lines": [[0, 1], [2]], "styles": {}, "colors": {0: navy, 1: navy, 2: ice}},
            {"suffix": "estilo", "lines": [[3, 4], [5]], "styles": {3: small, 4: serif}, "colors": {4: cream, 5: ice}},
            {"suffix": "resultado-a", "lines": [[6, 7], [8]], "styles": {6: small}, "colors": {}},
            {"suffix": "resultado-b", "lines": [[9, 10], [11, 12]], "styles": {9: small, 11: small, 12: serif}, "colors": {12: navy}},
        ],
        [
            {"suffix": "cores", "lines": [[0], [1, 2]], "styles": {1: small}, "colors": {0: "#f4f4f4", 2: wine}},
            {"suffix": "estilo", "lines": [[3, 4], [5]], "styles": {3: small, 4: serif}, "colors": {4: wine, 5: pink}},
            {"suffix": "resultado", "lines": [[6, 7, 8], [9, 10]], "styles": {6: small, 8: small, 9: small, 10: serif}, "colors": {10: wine}},
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
    transcript = json.loads((ROOT / "para-edicao-transcript.json").read_text(encoding="utf-8"))
    groups = build_groups(transcript, duration)
    project = {
        "id": "para-edicao",
        "width": 1080,
        "height": 1920,
        "fps": FPS,
        "durationInFrames": frames,
        "duration": duration,
        "video": "para-edicao-source.mp4",
        "audio": "para-edicao-audio.wav",
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
    (ROOT / "para-edicao-project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    blocks = []
    for index, item in enumerate(groups, 1):
        text = "\n".join(" ".join(word["text"] for word in line) for line in item["lines"])
        blocks.append(f"{index}\n{timestamp(item['start'])} --> {timestamp(item['end'])}\n{text}\n")
    (ROOT / "para-edicao-captions.srt").write_text("\n".join(blocks), encoding="utf-8")


def main() -> int:
    if not SOURCE.is_file():
        raise RuntimeError(f"Vídeo original ausente: {SOURCE}")
    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise RuntimeError(f"SHA-256 da fonte mudou: {digest}")
    report = prepare_media()
    write_project(report)
    print(json.dumps({
        "status": "prepared",
        "frames": report["normalized_frames"],
        "duration": report["normalized_frames"] / FPS,
        "caption_groups": 17,
        "caption_top": 1210,
        "audio": "preserved",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
