#!/usr/bin/env python3
"""Prepara o criativo IMG_1680 com cortes de pausas, imagem melhorada e captions remapeadas."""

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
EXPECTED_SHA256 = "762dc340e5a744213a2f9d102dd35cb831e4d7bc42fad9dc3f11012afde10b1c"
SOURCE_COMMIT = "48d4b7fd6366bbce6ef3a9193ecc03e5314886b8"
FPS = 60
# Trechos preservados. As quatro remoções somam 1,20 s e ocorrem em pausas.
EDIT_SEGMENTS = [
    {"start": 0.0, "end": 9.18},
    {"start": 9.72, "end": 14.22},
    {"start": 14.48, "end": 21.68},
    {"start": 21.80, "end": 24.22},
    {"start": 24.50, "end": 36.366667},
]
REMOVED_PAUSES = [
    {"start": 9.18, "end": 9.72, "duration": 0.54, "reason": "Pausa longa entre duas frases; saída mascarada por punch-in."},
    {"start": 14.22, "end": 14.48, "duration": 0.26, "reason": "Pausa antes da troca de cena."},
    {"start": 21.68, "end": 21.80, "duration": 0.12, "reason": "Ajuste da pausa ao corte natural para o closet."},
    {"start": 24.22, "end": 24.50, "duration": 0.28, "reason": "Pausa antes da demonstração do produto."},
]
QUALITY_FILTER = (
    "fps=60,"
    "hqdn3d=0.45:0.45:0.9:0.9,"
    "scale=1080:1920:flags=lanczos:in_color_matrix=bt709:out_color_matrix=bt709,"
    "eq=contrast=1.025:brightness=0:saturation=1.025:gamma=1.005,"
    "unsharp=5:5:0.22:5:5:0,"
    "setpts=PTS-STARTPTS"
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
        raise RuntimeError(f"Comando falhou ({result.returncode}): {' '.join(command)}\n{result.stderr[-5000:]}")
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
        raise RuntimeError("Falha ao contar os quadros da base editada.")
    return int(value)


def trim_filter(segment: dict, stream: str, index: int, last: bool) -> str:
    start = segment["start"]
    end = segment["end"]
    if stream == "v":
        options = f"start={start:.6f}" + ("" if last else f":end={end:.6f}")
        return f"trim={options},setpts=PTS-STARTPTS"
    options = f"start={start:.6f}" + ("" if last else f":end={end:.6f}")
    return f"atrim={options},asetpts=PTS-STARTPTS"


def prepare_media() -> dict:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    base = PUBLIC / "img-1680-base.mp4"
    before = PUBLIC / "img-1680-before.mp4"
    audio = PUBLIC / "img-1680-audio.wav"

    count = len(EDIT_SEGMENTS)
    split_labels = "".join(f"[v{i}]" for i in range(count))
    filters = [f"[0:v]{QUALITY_FILTER},split={count}{split_labels}"]
    for i, segment in enumerate(EDIT_SEGMENTS):
        filters.append(f"[v{i}]{trim_filter(segment, 'v', i, i == count - 1)}[t{i}]")
    concat_inputs = "".join(f"[t{i}]" for i in range(count))
    filters.append(f"{concat_inputs}concat=n={count}:v=1:a=0[outv]")
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-filter_complex", ";".join(filters), "-map", "[outv]", "-an",
        "-c:v", "libx264", "-preset", "fast", "-crf", "10", "-pix_fmt", "yuv420p",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-video_track_timescale", "60000", "-movflags", "+faststart", str(base),
    ])
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-map", "0:v:0", "-an", "-t", "3.64", "-vf", QUALITY_FILTER,
        "-c:v", "libx264", "-preset", "fast", "-crf", "10", "-pix_fmt", "yuv420p",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-video_track_timescale", "60000", "-movflags", "+faststart", str(before),
    ])

    audio_split = "".join(f"[a{i}]" for i in range(count))
    audio_filters = [f"[0:a]asplit={count}{audio_split}"]
    for i, segment in enumerate(EDIT_SEGMENTS):
        audio_filters.append(f"[a{i}]{trim_filter(segment, 'a', i, i == count - 1)}[at{i}]")
    audio_inputs = "".join(f"[at{i}]" for i in range(count))
    audio_filters.append(f"{audio_inputs}concat=n={count}:v=0:a=1[outa]")
    run([
        FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-filter_complex", ";".join(audio_filters), "-map", "[outa]", "-vn",
        "-c:a", "pcm_s24le", "-ar", "48000", "-ac", "2", str(audio),
    ])

    source_probe = probe(SOURCE)
    base_probe = probe(base)
    before_probe = probe(before)
    audio_probe = probe(audio)
    frames = video_frame_count(base)
    report = {
        "source_commit": SOURCE_COMMIT,
        "source_sha256": EXPECTED_SHA256,
        "source_probe": source_probe,
        "base_probe": base_probe,
        "before_probe": before_probe,
        "audio_probe": audio_probe,
        "base_frames": frames,
        "video_filters": QUALITY_FILTER,
        "edit_segments": EDIT_SEGMENTS,
        "removed_pauses": REMOVED_PAUSES,
        "removed_seconds": 1.20,
        "quality": "Upscale Lanczos 1080x1920, BT.709, denoise leve, contraste/saturação discretos e sharpen moderado; 60 fps para motion gráfico, sem interpolação óptica.",
        "audio_processing": "Áudio original com somente os mesmos quatro cortes de pausas; sem EQ, compressão, loudnorm, música, SFX ou alteração de velocidade.",
        "double_scene": "Antes/agora de 3,70 a 7,266667 s; o lado esquerdo reutiliza somente o take original de 0 a 3,64 s.",
    }
    (ROOT / "img-1680-prepare-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (REPORTS / "source-probe.json").write_text(json.dumps(source_probe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def display_text(value: str) -> str:
    return value.strip().upper()


def group_specs() -> list[list[dict]]:
    small, serif = "small", "serif"
    gold, rose = "#f0c792", "#f2b6c5"
    return [
        [
            {"suffix": "hook-a", "lines": [[0, 1, 2], [3, 4, 5]], "styles": {3: small}, "colors": {}},
            {"suffix": "hook-b", "lines": [[6, 7], [8, 9]], "styles": {8: small}, "colors": {6: gold, 7: gold, 9: gold}},
            {"suffix": "hook-c", "lines": [[10, 11]], "styles": {10: small, 11: serif}, "colors": {11: gold}},
        ],
        [
            {"suffix": "segredo-a", "lines": [[0, 1, 2], [3, 4]], "styles": {0: small, 3: small}, "colors": {1: gold}},
            {"suffix": "segredo-b", "lines": [[5, 6, 7], [8, 9]], "styles": {5: small, 6: small, 9: serif}, "colors": {9: gold}},
        ],
        [
            {"suffix": "faltavam", "lines": [[0, 1, 2], [3, 4, 5]], "styles": {2: small, 3: small}, "colors": {4: gold, 5: gold}},
        ],
        [
            {"suffix": "combinar-a", "lines": [[0, 1, 2], [3, 4, 5]], "styles": {3: small}, "colors": {4: gold, 5: gold}},
            {"suffix": "combinar-b", "lines": [[6, 7, 8, 9], [10, 11, 12]], "styles": {7: small, 8: small, 12: serif}, "colors": {12: gold}},
        ],
        [
            {"suffix": "estilo-a", "lines": [[0, 1, 2]], "styles": {}, "colors": {2: gold}},
            {"suffix": "estilo-b", "lines": [[3, 4], [5, 6]], "styles": {5: small, 6: serif}, "colors": {6: gold}},
            {"suffix": "estilo-c", "lines": [[7, 8, 9], [10, 11, 12]], "styles": {8: small, 12: serif}, "colors": {12: gold}},
        ],
        [
            {"suffix": "combinacao-a", "lines": [[0, 1, 2], [3, 4, 5]], "styles": {4: small}, "colors": {2: gold}},
            {"suffix": "combinacao-b", "lines": [[6, 7, 8, 9]], "styles": {8: small, 9: serif}, "colors": {9: gold}, "endPad": 0.10},
        ],
        [
            {"suffix": "produto", "lines": [[0, 1, 2, 3], [4, 5, 6, 7, 8]], "styles": {2: small, 4: small, 6: small}, "colors": {5: rose, 7: rose, 8: rose}},
        ],
        [
            {"suffix": "fotografo", "lines": [[0, 1], [2, 3]], "styles": {0: small}, "colors": {1: gold, 3: gold}},
            {"suffix": "aplicativo", "lines": [[4, 5, 6], [7, 8, 9, 10]], "styles": {4: small, 5: small, 7: small, 9: small}, "colors": {6: gold, 10: gold}},
            {"suffix": "closet", "lines": [[11, 12]], "styles": {11: small, 12: serif}, "colors": {12: gold}},
        ],
        [
            {"suffix": "ocasiao", "lines": [[0, 1, 2], [3, 4]], "styles": {1: small}, "colors": {0: gold, 2: gold, 4: gold}},
            {"suffix": "favoritos", "lines": [[5, 6, 7], [8, 9]], "styles": {5: small, 9: serif}, "colors": {8: gold, 9: gold}},
        ],
        [
            {"suffix": "aproveite", "lines": [[0, 1], [2, 3, 4, 5]], "styles": {2: small, 3: small}, "colors": {0: gold, 4: gold, 5: gold}, "startLead": 0.08},
            {"suffix": "beneficio-produto", "lines": [[6, 7], [8, 9, 10, 11]], "styles": {6: small, 7: small, 9: small}, "colors": {8: rose, 10: rose, 11: rose}, "endPad": 0.14},
        ],
        [
            {"suffix": "cta-original", "lines": [[0, 1], [2, 3]], "styles": {1: small}, "colors": {2: gold, 3: gold}},
        ],
    ]


def source_to_output(value: float) -> float:
    elapsed = 0.0
    for segment in EDIT_SEGMENTS:
        duration = segment["end"] - segment["start"]
        if value >= segment["start"] - 0.0001 and value <= segment["end"] + 0.0001:
            return elapsed + value - segment["start"]
        elapsed += duration
    raise RuntimeError(f"Tempo fora dos trechos preservados: {value}")


def build_groups(transcript: dict) -> list[dict]:
    groups: list[dict] = []
    for segment_index, (segment, specs) in enumerate(zip(transcript["segments"], group_specs(), strict=True)):
        words = segment["words"]
        covered: list[int] = []

        def start_for(spec: dict) -> float:
            first = spec["lines"][0][0]
            return float(words[first]["start"]) - float(spec.get("startLead", 0.0))

        for spec_index, spec in enumerate(specs):
            indices = [index for line in spec["lines"] for index in line]
            if len(indices) != len(set(indices)):
                raise RuntimeError(f"Índice repetido em {segment['id']} / {spec['suffix']}")
            covered.extend(indices)
            start_source = start_for(spec)
            if spec_index + 1 < len(specs):
                end_source = start_for(specs[spec_index + 1])
            else:
                end_source = float(segment["end"]) + float(spec.get("endPad", 0.0))
            layout = "app" if segment_index in {7, 8} else "top" if segment_index == 9 else "embedded" if segment_index == 10 else "bottom"
            lines = []
            for line_indices in spec["lines"]:
                line = []
                for index in line_indices:
                    source_word = words[index]
                    item = {
                        "text": display_text(source_word["word"]),
                        "start": source_to_output(float(source_word["start"])),
                        "end": source_to_output(float(source_word["end"])),
                        "style": spec["styles"].get(index, "normal"),
                    }
                    color = spec["colors"].get(index)
                    if color:
                        item["color"] = color
                    line.append(item)
                lines.append(line)
            groups.append({
                "id": f"{segment['id']}-{spec['suffix']}",
                "segmentId": segment["id"],
                "start": source_to_output(start_source),
                "end": source_to_output(end_source),
                "sourceStart": start_source,
                "sourceEnd": end_source,
                "layout": layout,
                "embeddedOnly": layout == "embedded",
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
    frames = report["base_frames"]
    duration = frames / FPS
    transcript = json.loads((ROOT / "img-1680-transcript.json").read_text(encoding="utf-8"))
    groups = build_groups(transcript)
    edit_segments = []
    elapsed = 0.0
    for segment in EDIT_SEGMENTS:
        length = segment["end"] - segment["start"]
        edit_segments.append({**segment, "outputStart": elapsed, "outputEnd": elapsed + length})
        elapsed += length
    project = {
        "id": "img-1680",
        "width": 1080,
        "height": 1920,
        "fps": FPS,
        "durationInFrames": frames,
        "duration": duration,
        "video": "img-1680-base.mp4",
        "beforeVideo": "img-1680-before.mp4",
        "audio": "img-1680-audio.wav",
        "editSegments": edit_segments,
        "removedPauses": REMOVED_PAUSES,
        "doubleScene": {"start": 3.70, "end": 7.266667, "leftLabel": "ANTES", "rightLabel": "AGORA"},
        "zoomScenes": [
            {"start": 0.0, "end": 3.70, "from": 1.00, "to": 1.08},
            {"start": 7.266667, "end": 9.18, "from": 1.02, "to": 1.05},
            {"start": 9.18, "end": 13.733333, "from": 1.10, "to": 1.06},
            {"start": 13.733333, "end": 15.80, "from": 1.00, "to": 1.05},
            {"start": 15.80, "end": 17.933333, "from": 1.03, "to": 1.08},
            {"start": 17.933333, "end": 20.88, "from": 1.00, "to": 1.06},
            {"start": 20.88, "end": 23.70, "from": 1.02, "to": 1.08},
            {"start": 23.70, "end": duration, "from": 1.00, "to": 1.00},
        ],
        "groups": groups,
        "showSafeZones": False,
        "safeZones": {"top": 90, "bottom": 180, "left": 50, "right": 50},
        "captionStyles": {
            "bottom": {"top": 1370, "maxWidth": 960, "fontSize": 88, "serifFontSize": 108, "smallFontSize": 46},
            "app": {"top": 1530, "maxWidth": 920, "fontSize": 72, "serifFontSize": 88, "smallFontSize": 40},
            "top": {"top": 120, "maxWidth": 920, "fontSize": 76, "serifFontSize": 94, "smallFontSize": 42},
        },
        "audioProcessing": "original-with-four-pause-cuts",
        "conversionNote": "Estrutura orientada a retenção e clareza do produto; nenhuma conversão é garantida.",
    }
    (ROOT / "img-1680-project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    blocks = []
    for index, item in enumerate(groups, 1):
        text = "\n".join(" ".join(word["text"] for word in line) for line in item["lines"])
        blocks.append(f"{index}\n{timestamp(item['start'])} --> {timestamp(item['end'])}\n{text}\n")
    (ROOT / "img-1680-captions.srt").write_text("\n".join(blocks), encoding="utf-8")


def main() -> int:
    if not SOURCE.is_file():
        raise RuntimeError(f"Fonte ausente: {SOURCE}")
    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise RuntimeError(f"SHA-256 da fonte mudou: {digest}")
    report = prepare_media()
    write_project(report)
    project = json.loads((ROOT / "img-1680-project.json").read_text(encoding="utf-8"))
    print(json.dumps({
        "status": "prepared",
        "frames": project["durationInFrames"],
        "fps": FPS,
        "duration": project["duration"],
        "caption_groups": len(project["groups"]),
        "rendered_caption_groups": sum(not group["embeddedOnly"] for group in project["groups"]),
        "words": sum(len(line) for group in project["groups"] for line in group["lines"]),
        "removed_seconds": 1.20,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
