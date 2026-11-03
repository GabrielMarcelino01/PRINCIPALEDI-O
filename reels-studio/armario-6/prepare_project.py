#!/usr/bin/env python3
"""Gera os dados determinísticos, o SRT e o grão fixo do ARMÁRIO-6."""
from __future__ import annotations

import json
import math
from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parent
FPS = 60
FRAMES = 1246
SOURCE_DURATION = 20.75931

SCENES = [
    {
        "id": "creme-marrom", "start": 0.0, "end": 4.15098,
        "labels": ["CREME", "MARROM CAFÉ"], "colors": ["#eee4d2", "#59392d"],
        "accent": "#f0c89f", "camera": [1.035, 1.064, -10, 8, -4, 5],
    },
    {
        "id": "oliva-caramelo", "start": 4.15098, "end": 8.33867,
        "labels": ["VERDE OLIVA", "CARAMELO"], "colors": ["#5e633b", "#c98e54"],
        "accent": "#e1b876", "camera": [1.072, 1.038, 11, -8, 4, -5],
    },
    {
        "id": "vinho-grafite", "start": 8.33867, "end": 12.2827,
        "labels": ["VINHO", "CINZA GRAFITE"], "colors": ["#762c41", "#55575c"],
        "accent": "#edb0bd", "camera": [1.038, 1.068, -8, 10, -3, 6],
    },
    {
        "id": "azul-bege", "start": 12.2827, "end": 16.176,
        "labels": ["AZUL CLARO", "BEGE"], "colors": ["#a9cde5", "#d8c3a1"],
        "accent": "#c0e0f4", "camera": [1.070, 1.040, 10, -10, 5, -4],
    },
    {
        "id": "marinho-marfim", "start": 16.176, "end": SOURCE_DURATION,
        "labels": ["AZUL MARINHO", "MARFIM"], "colors": ["#1b2945", "#f0e6d1"],
        "accent": "#f2e4c7", "camera": [1.040, 1.072, -9, 8, -4, 4],
    },
]

# Índices depois de unir "Lembre" + "-se" em uma única palavra.
GROUP_SPECS = [
    ([[0], [1, 2, 3, 4]], 2.24),
    ([[5, 6], [7, 8]], 4.00),
    ([[9, 10], [11, 12]], 6.52),
    ([[13, 14], [15, 16, 17]], 8.28),
    ([[18, 19], [20, 21]], 10.28),
    ([[22, 23], [24, 25]], 12.24),
    ([[26, 27], [28, 29]], 13.78),
    ([[30, 31], [32, 33, 34]], 16.14),
    ([[35, 36], [37, 38]], 17.68),
    ([[39, 40, 41], [42]], 20.12),
]

SERIF_WORDS = {"elegância", "atemporal", "riqueza", "sofisticado"}
ACCENT_WORDS = {
    "creme", "marrom", "café", "verde", "oliva", "caramelo", "vinho",
    "cinza", "grafite", "azul", "claro", "bege", "marinho", "marfim",
    *SERIF_WORDS,
}


def clean(text: str) -> str:
    return text.strip().lower().strip(".,!?:;\"“”")


def srt_time(seconds: float) -> str:
    millis = int(round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def write_grain(path: Path, size: int = 256) -> None:
    """PNG monocromático fixo; não há sorteio durante o render."""
    state = 0xA6C0FFEE
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            state = (1664525 * state + 1013904223 + x * 17 + y * 31) & 0xFFFFFFFF
            value = 96 + ((state >> 24) % 64)
            row.extend((value, value, value))
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def main() -> None:
    transcript = json.loads((ROOT / "transcript.json").read_text(encoding="utf-8"))
    words = []
    for segment_index, segment in enumerate(transcript["segments"]):
        source_words = segment["words"]
        index = 0
        while index < len(source_words):
            item = dict(source_words[index])
            if segment_index == 0 and index == 0:
                second = source_words[index + 1]
                item["text"] = "Lembre-se,"
                item["end"] = second["end"]
                item["probability"] = min(item["probability"], second["probability"])
                index += 2
            else:
                item["text"] = item.pop("word").strip()
                index += 1
            item.pop("word", None)
            item["segment"] = segment_index
            key = clean(item["text"])
            item["accent"] = key in ACCENT_WORDS
            item["serif"] = key in SERIF_WORDS
            words.append(item)

    if len(words) != 43:
        raise RuntimeError(f"Esperadas 43 palavras revisadas, encontradas {len(words)}")

    groups = []
    for group_index, (lines, hold_end) in enumerate(GROUP_SPECS):
        indices = [index for line in lines for index in line]
        scene = next(i for i, scene in enumerate(SCENES) if scene["start"] <= words[indices[0]]["start"] < scene["end"])
        groups.append({
            "id": f"caption-{group_index + 1:02d}",
            "scene": scene,
            "start": words[indices[0]]["start"],
            "end": words[indices[-1]]["end"],
            "holdEnd": hold_end,
            "lines": lines,
        })

    project = {
        "id": "armario-6",
        "title": "ARMÁRIO-6 — O código das cores",
        "width": 1080,
        "height": 1920,
        "fps": FPS,
        "frames": FRAMES,
        "duration": FRAMES / FPS,
        "sourceDuration": SOURCE_DURATION,
        "source": "../assets/armario-6/ARMARIO-6.mp4",
        "sourceSha256": "55010ad5a20333c661a2dec1348235bcf22a466f60fa5e67da6f54e2aedd6f1d",
        "sourceCommit": "6c16b4828cdaf314bfd7dcd585cf3de57769db34",
        "scenes": SCENES,
        "words": words,
        "groups": groups,
        "ctaStart": 19.15,
        "commentStart": 20.02,
    }
    (ROOT / "project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "project.js").write_text("window.PROJECT = " + json.dumps(project, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")

    srt = []
    for index, segment in enumerate(transcript["segments"], 1):
        text = segment["text"].replace("beje", "bege")
        if index == 1:
            text = "Lembre-se, creme com marrom café\né elegância de verdade."
        elif index == 2:
            text = "Verde oliva e caramelo,\ncombinação de muito bom gosto."
        elif index == 3:
            text = "Vinho com cinza grafite\nfica caro e atemporal."
        elif index == 4:
            text = "Azul claro com bege é riqueza,\nriqueza sem exagero."
        else:
            text = "Azul marinho com marfim\ndeixa qualquer casal sofisticado."
        srt.extend([str(index), f"{srt_time(segment['start'])} --> {srt_time(segment['end'])}", text, ""])
    (ROOT / "armario-6-captions.srt").write_text("\n".join(srt), encoding="utf-8")
    write_grain(ROOT / "grain.png")
    print(json.dumps({"words": len(words), "groups": len(groups), "scenes": len(SCENES), "frames": FRAMES, "fps": FPS}, ensure_ascii=False))


if __name__ == "__main__":
    main()
