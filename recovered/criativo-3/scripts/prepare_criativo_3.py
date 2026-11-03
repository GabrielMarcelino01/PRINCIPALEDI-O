#!/usr/bin/env python3
"""Prepara CRIATIVO-3: cortes de pausas, captions centrais, gradiente e áudio."""
from __future__ import annotations

import json
import math
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/original.mp4"
RAW_AUDIO = ROOT / "work/audio-raw.wav"
FINAL_AUDIO = ROOT / "public/criativo-3-audio.wav"
ASR_PATH = ROOT / "reports/asr-pass-1.json"
PROJECT_PATH = ROOT / "criativo-3-project.json"
TRANSCRIPT_PATH = ROOT / "criativo-3-transcript.json"
SRT_PATH = ROOT / "criativo-3-captions.srt"
ASS_PATH = ROOT / "criativo-3-captions.ass"
GRADIENT_PATH = ROOT / "public/center-gradient.png"
FONT_PATH = ROOT / "public/fonts/InterCaption.ttf"
FPS = 24
SOURCE_FRAMES = 1152
SOURCE_SHA256 = "5a6096947b8b7e243a300d19a3e549b9d138e194857d57f5c87b8ecd0e722f57"
# Somente pausas. Os limites preservam as palavras e as entradas das cenas de 36 s e 42 s.
CUT_FRAMES = [
    (65, 70), (139, 146), (223, 228), (283, 289),
    (324, 328), (427, 435), (477, 479), (510, 514),
    (570, 577), (605, 609), (710, 719), (738, 745),
    (862, 867), (1006, 1011), (1114, 1116),
]
REMOVED_FRAMES = sum(end - start for start, end in CUT_FRAMES)
KEPT_FRAMES = SOURCE_FRAMES - REMOVED_FRAMES
OUTPUT_FRAMES = KEPT_FRAMES
OUTPUT_DURATION = OUTPUT_FRAMES / FPS
# first, last, start_pad, end_pad, ênfases. Cada bloco é uma única linha.
CUE_SPECS = [
    (0, 3, 0.00, 0.00, ["Nunca mais"]),
    (4, 8, 0.00, 0.05, ["o que vestir"]),
    (9, 13, 0.04, 0.00, ["Truque dos Mil Looks"]),
    (14, 19, 0.00, 0.05, ["sair do básico"]),
    (20, 22, 0.04, 0.00, ["combinações elegantes"]),
    (23, 28, 0.00, 0.00, ["roupas que já tem"]),
    (29, 33, 0.00, 0.00, ["sem precisar comprar"]),
    (34, 37, 0.00, 0.05, ["peças novas"]),
    (38, 43, 0.04, 0.00, ["completar um look"]),
    (44, 47, 0.04, 0.00, ["indicações de peças"]),
    (48, 52, 0.00, 0.00, ["links"]),
    (53, 56, 0.00, 0.05, ["cabem no bolso"]),
    (57, 62, 0.03, 0.05, ["Closet Virtual"]),
    (63, 65, 0.04, 0.05, ["Fotografe"]),
    (66, 68, 0.04, 0.06, ["peças"]),
    (69, 74, 0.04, 0.05, ["combiná-las"]),
    (75, 77, 0.04, 0.05, ["ocasião"]),
    (78, 82, 0.04, 0.00, []),
    (83, 86, 0.04, 0.00, ["aplicativo"]),
    (87, 89, 0.00, 0.05, ["ideias"]),
    (90, 94, 0.04, 0.00, ["uma única camisa"]),
    (95, 98, 0.00, 0.00, ["outros estilos"]),
    (99, 103, 0.04, 0.00, ["blazer"]),
    (104, 106, 0.00, 0.04, ["acessórios certos"]),
    (107, 112, 0.04, 0.00, ["visual mais simples"]),
    (113, 117, 0.00, 0.00, ["aprende a coordenar"]),
    (118, 122, 0.00, 0.00, ["já possui"]),
    (123, 126, 0.04, 0.04, ["saber combinar"]),
    (127, 132, 0.04, 0.00, ["guarda-roupa"]),
    (133, 138, 0.00, 0.05, ["não tem nada"]),
    (139, 144, 0.04, 0.04, ["Truque dos Mil Looks"]),
    (145, 148, 0.04, 0.35, ["Saiba Mais"]),
]
WORD_CORRECTIONS = {"truque": "Truque", "biná": "combiná", "blaze": "blazer"}
INDEX_CORRECTIONS = {
    68: "peças?",       # pontuação de leitura; a fala permanece inalterada
    85: "",            # limpeza editorial de "a encontrar" para "encontra"
    86: "encontra",
    88: "para o",      # artigo exibido para fluência, sem alterar o sentido
}


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=True, text=True, capture_output=True)


def seconds(frames: float) -> float:
    return frames / FPS


def map_time(t: float) -> float:
    removed = 0.0
    for start, end in CUT_FRAMES:
        a, b = seconds(start), seconds(end)
        if t >= b:
            removed += b - a
        elif t > a:
            raise ValueError(f"Tempo dentro de corte: {t:.6f} em {a:.6f}–{b:.6f}")
    return t - removed


def srt_time(t: float) -> str:
    ms = max(0, round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def ass_time(t: float) -> str:
    cs = max(0, round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def join_tokens(tokens: list[str]) -> str:
    text = ""
    for token in tokens:
        token = token.strip()
        if not token:
            continue
        if token.startswith("-"):
            text += token
        else:
            text += (" " if text else "") + token
    return text


def reviewed_words() -> tuple[list[dict], list[dict]]:
    asr = json.loads(ASR_PATH.read_text())
    words: list[dict] = []
    segments: list[dict] = []
    for seg in asr["segments"]:
        current = []
        for raw in seg["words"]:
            index = len(words)
            source_token = raw["word"].strip()
            token = INDEX_CORRECTIONS.get(index, WORD_CORRECTIONS.get(source_token, source_token))
            item = dict(raw)
            item["word"] = token
            if token != source_token:
                item["source_word"] = source_token
                item["review"] = "correção de domínio ou fluência de exibição"
            words.append(item)
            current.append(item)
        segments.append({
            "id": seg["id"], "start": seg["start"], "end": seg["end"],
            "text": join_tokens([w["word"] for w in current]), "words": current,
        })
    if len(words) != 149:
        raise ValueError(f"Transcrição mudou: esperadas 149 unidades, encontradas {len(words)}")
    return words, segments


GOLD = "#F2D8A7"
MINT = "#A7E3D0"
ROSE = "#F2A7B8"
DARK = "#17140F"
BURGUNDY = "#7D2140"
UNDERLINE_CUES = {3, 13, 28, 31}
CTA_CUE = 32
# Escala calibrada com quadros do libass para esta combinação de fonte/ASS.
# A geometria dos desenhos usa a mesma escala para ficar registrada na palavra.
ASS_LAYOUT_SCALE = 2 ** -0.5


def caption_format(cue_id: int) -> str:
    if cue_id == CTA_CUE:
        return "cta_pill"
    if cue_id in UNDERLINE_CUES:
        return "active_underline"
    return "active_pill"


def caption_accent(cue_id: int) -> str:
    if 5 <= cue_id <= 20:
        return MINT
    if 21 <= cue_id <= 28:
        return ROSE
    return GOLD


def build_units(selected: list[dict], first_word: int, cue_start: float, cue_end: float,
                font: ImageFont.FreeTypeFont, full_width: float) -> list[dict]:
    units: list[dict] = []
    for offset, raw in enumerate(selected):
        token = raw["word"].strip()
        if not token:
            continue
        if token.startswith("-") and units:
            units[-1]["text"] += token
            units[-1]["source_end"] = raw["end"]
            units[-1]["raw_words"].append(first_word + offset)
        else:
            units.append({
                "text": token, "source_start": raw["start"], "source_end": raw["end"],
                "raw_words": [first_word + offset],
            })
    x = (720 - full_width) / 2
    space_width = font.getlength(" ")
    for index, unit in enumerate(units):
        unit["x_px"] = round(x, 3)
        unit["width_px"] = round(font.getlength(unit["text"]), 3)
        x += font.getlength(unit["text"])
        if index < len(units) - 1:
            x += space_width
    start = cue_start
    for index, unit in enumerate(units):
        end = map_time(units[index + 1]["source_start"]) if index + 1 < len(units) else cue_end
        if end <= start:
            raise ValueError(f"Unidade sem duração: {unit['text']!r}")
        unit["start"], unit["end"] = start, end
        start = end
    return units


def ass_color(hex_color: str) -> str:
    value = hex_color.lstrip("#")
    red, green, blue = value[0:2], value[2:4], value[4:6]
    return f"&H00{blue}{green}{red}&"


def rounded_rect(x0: float, y0: float, x1: float, y1: float, radius: float) -> str:
    x0, y0, x1, y1, r = [round(v) for v in [x0, y0, x1, y1, radius]]
    k = round(r * 0.5522847498)
    return (
        f"m {x0+r} {y0} l {x1-r} {y0} "
        f"b {x1-r+k} {y0} {x1} {y0+r-k} {x1} {y0+r} "
        f"l {x1} {y1-r} b {x1} {y1-r+k} {x1-r+k} {y1} {x1-r} {y1} "
        f"l {x0+r} {y1} b {x0+r-k} {y1} {x0} {y1-r+k} {x0} {y1-r} "
        f"l {x0} {y0+r} b {x0} {y0+r-k} {x0+r-k} {y0} {x0+r} {y0}"
    )


def ass_unit_geometry(unit: dict) -> tuple[float, float]:
    return (
        360 + (unit["x_px"] - 360) * ASS_LAYOUT_SCALE,
        unit["width_px"] * ASS_LAYOUT_SCALE,
    )


def fade_prefix(first: bool, last: bool) -> str:
    if first:
        return r"\fad(50,0)"
    if last:
        return r"\fad(0,50)"
    return ""


def shape_event(cue: dict, unit: dict, first: bool, last: bool) -> str:
    accent = ass_color(cue["accent_color"])
    unit_x, unit_width = ass_unit_geometry(unit)
    if cue["format"] == "active_pill":
        x0 = unit_x - 9
        x1 = unit_x + unit_width + 9
        y0, y1, radius = 613, 667, 15
    else:
        x0 = unit_x + 1
        x1 = unit_x + unit_width - 1
        y0, y1, radius = 666, 672, 3
    drawing = rounded_rect(x0, y0, x1, y1, radius)
    tags = rf"{{\an7\pos(0,0)\p1\bord0\shad0\1c{accent}{fade_prefix(first, last)}}}"
    return f'Dialogue: 0,{ass_time(unit["start"])},{ass_time(unit["end"])},Caption,,0,0,0,,{tags}{drawing}'


def cta_shape_event(cue: dict) -> str:
    rendered_width = cue["text_width_px"] * ASS_LAYOUT_SCALE
    x0 = (720 - rendered_width) / 2 - 22
    x1 = (720 + rendered_width) / 2 + 22
    drawing = rounded_rect(x0, 607, x1, 673, 22)
    tags = rf"{{\an7\pos(0,0)\p1\bord0\shad0\1c{ass_color(GOLD)}\fad(50,50)}}"
    return f'Dialogue: 0,{ass_time(cue["start"])},{ass_time(cue["end"])},Caption,,0,0,0,,{tags}{drawing}'


def caption_text(cue: dict, active_index: int) -> str:
    parts = []
    for index, unit in enumerate(cue["units"]):
        if index:
            parts.append(" ")
        if index != active_index:
            parts.append(unit["text"])
            continue
        if cue["format"] == "active_underline":
            active = ass_color(cue["accent_color"])
            inactive = ass_color("#FFFFFF")
            parts.append(rf"{{\1c{active}}}{unit['text']}{{\1c{inactive}}}")
        elif cue["format"] == "active_pill":
            active, inactive = ass_color(DARK), ass_color("#FFFFFF")
            parts.append(rf"{{\1c{active}\bord0\shad0}}{unit['text']}{{\1c{inactive}\bord2.4\shad1}}")
        else:
            active, inactive = ass_color(BURGUNDY), ass_color(DARK)
            parts.append(rf"{{\1c{active}}}{unit['text']}{{\1c{inactive}}}")
    return "".join(parts)


def build_ass(cues: list[dict]) -> str:
    header = """[Script Info]
Title: CRIATIVO-3 — superlegendas ativas de uma linha
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Inter Caption,40,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0.1,0,1,2.4,1.0,5,40,40,0,1
Style: CtaCaption,Inter Caption,40,&H000F1417,&H000F1417,&H00000000,&H00000000,-1,0,0,0,100,100,0.1,0,1,0,0,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    for cue in cues:
        if cue["format"] == "cta_pill":
            events.append(cta_shape_event(cue))
        for index, unit in enumerate(cue["units"]):
            first, last = index == 0, index == len(cue["units"]) - 1
            if cue["format"] != "cta_pill":
                events.append(shape_event(cue, unit, first, last))
            style = "CtaCaption" if cue["format"] == "cta_pill" else "Caption"
            prefix = rf"{{\fs{cue['font_size']}{fade_prefix(first, last)}}}"
            events.append(
                f'Dialogue: 1,{ass_time(unit["start"])},{ass_time(unit["end"])},{style},,0,0,0,,'
                f'{prefix}{caption_text(cue, index)}'
            )
    return header + "\n".join(events) + "\n"


def build_gradient() -> None:
    GRADIENT_PATH.parent.mkdir(parents=True, exist_ok=True)
    center, half_height, max_alpha = 640, 140, 150
    strip = Image.new("RGBA", (1, 1280), (0, 0, 0, 0))
    pixels = []
    for y in range(1280):
        distance = abs(y - center)
        if distance >= half_height:
            alpha = 0
        else:
            alpha = round(max_alpha * (0.5 + 0.5 * math.cos(math.pi * distance / half_height)))
        pixels.append((0, 0, 0, alpha))
    strip.putdata(pixels)
    strip.resize((720, 1280), Image.Resampling.NEAREST).save(GRADIENT_PATH, optimize=True)


def build_project() -> dict:
    words, transcript_segments = reviewed_words()
    cues = []
    covered = []
    for idx, (first, last, start_pad, end_pad, emphasis) in enumerate(CUE_SPECS, 1):
        selected = words[first:last + 1]
        covered.extend(range(first, last + 1))
        text = join_tokens([w["word"] for w in selected])
        source_start = max(0.0, selected[0]["start"] - start_pad)
        source_end = selected[-1]["end"] + end_pad
        start, end = map_time(source_start), map_time(source_end)
        font_size = 40
        width = ImageFont.truetype(str(FONT_PATH), font_size).getlength(text)
        while width > 640 and font_size > 36:
            font_size -= 1
            width = ImageFont.truetype(str(FONT_PATH), font_size).getlength(text)
        if width > 640:
            raise ValueError(f"Legenda excede 640 px no bloco {idx}: {width:.1f} px")
        visible_characters = len(re.sub(r"\s+", "", text))
        units = build_units(selected, first, start, end, ImageFont.truetype(str(FONT_PATH), font_size), width)
        cues.append({
            "id": idx, "first_word": first, "last_word": last,
            "source_start": source_start, "source_end": source_end,
            "start": start, "end": end, "duration": end - start,
            "lines": [text], "text": text, "emphasis": emphasis,
            "font_size": font_size, "text_width_px": round(width, 3),
            "format": caption_format(idx), "accent_color": caption_accent(idx),
            "units": units, "cps": visible_characters / (end - start),
        })
    if covered != list(range(149)):
        raise ValueError("As captions precisam cobrir cada unidade transcrita exatamente uma vez")
    project = {
        "project": "CRIATIVO-3",
        "source": {
            "file": "assets/original.mp4", "sha256": SOURCE_SHA256,
            "drive_md5": "fff3e8fbe6d0cff8fcda57364580391f",
            "drive_file_id": "1bjpLFCsFRe7USotUMYAwUk9CTljvckSU",
            "duration": 48.0, "frames": SOURCE_FRAMES, "fps": FPS,
            "width": 720, "height": 1280,
        },
        "edit": {
            "speed": 1.0, "pitch_preserved": True, "cut_frames": CUT_FRAMES,
            "cut_count": len(CUT_FRAMES), "removed_frames": REMOVED_FRAMES,
            "removed_seconds": REMOVED_FRAMES / FPS, "kept_frames": KEPT_FRAMES,
            "output_frames": OUTPUT_FRAMES, "output_duration": OUTPUT_DURATION,
        },
        "look": {
            "description": "Gradiente preto central e superlegendas ativas com pílulas, sublinhados e CTA",
            "font": "Inter Caption", "font_size": 40, "min_font_size": 36,
            "max_lines": 1, "max_text_width_px": 640, "alignment": 5,
            "caption_center_y": 640, "gradient_center_y": 640,
            "gradient_half_height": 140, "gradient_max_alpha": 150, "gradient_rgb": [0, 0, 0],
            "caption_formats": ["active_pill", "active_underline", "cta_pill"],
            "palette": {"gold": GOLD, "mint": MINT, "rose": ROSE, "dark": DARK, "burgundy": BURGUNDY},
            "color_space": "BT.709", "vignette": False,
        },
        "captions": cues,
    }
    PROJECT_PATH.write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n")
    TRANSCRIPT_PATH.write_text(json.dumps({"language": "pt-BR", "segments": transcript_segments}, ensure_ascii=False, indent=2) + "\n")
    srt = []
    for cue in cues:
        srt.extend([str(cue["id"]), f'{srt_time(cue["start"])} --> {srt_time(cue["end"])}', cue["text"], ""])
    SRT_PATH.write_text("\n".join(srt))
    ASS_PATH.write_text(build_ass(cues))
    return project


def keep_intervals() -> list[tuple[int, int]]:
    keeps, cursor = [], 0
    for start, end in CUT_FRAMES + [(SOURCE_FRAMES, SOURCE_FRAMES)]:
        if start > cursor:
            keeps.append((cursor, start))
        cursor = end
    return keeps


def build_audio() -> dict:
    keeps = keep_intervals()
    filters, labels = [], []
    for i, (start, end) in enumerate(keeps):
        label = f"a{i}"
        labels.append(f"[{label}]")
        filters.append(f"[0:a]atrim=start={seconds(start):.9f}:end={seconds(end):.9f},asetpts=PTS-STARTPTS[{label}]")
    filters.append("".join(labels) + f"concat=n={len(keeps)}:v=0:a=1,aresample=48000,aformat=channel_layouts=stereo[aout]")
    run(["ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(SOURCE), "-filter_complex", ";".join(filters), "-map", "[aout]", "-c:a", "pcm_s24le", str(RAW_AUDIO)])
    measure = run(["ffmpeg", "-nostdin", "-hide_banner", "-nostats", "-i", str(RAW_AUDIO), "-af", "loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-"])
    match = re.search(r'\{\s*"input_i".*?\}', measure.stderr, re.S)
    if not match:
        raise RuntimeError("Não foi possível ler a medição do loudnorm")
    measured = json.loads(match.group(0))
    loudnorm = (
        "loudnorm=I=-16:TP=-1.5:LRA=7:"
        f'measured_I={measured["input_i"]}:measured_LRA={measured["input_lra"]}:'
        f'measured_TP={measured["input_tp"]}:measured_thresh={measured["input_thresh"]}:'
        f'offset={measured["target_offset"]}:linear=true:print_format=summary,aresample=48000'
    )
    run(["ffmpeg", "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(RAW_AUDIO), "-af", loudnorm, "-t", f"{OUTPUT_DURATION:.9f}", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", str(FINAL_AUDIO)])
    report = {
        "target": {"integrated_lufs": -16.0, "true_peak_dbtp": -1.5, "lra_lu": 7.0},
        "first_pass": measured, "second_pass": loudnorm,
        "duration_seconds": OUTPUT_DURATION, "tempo": 1.0, "pitch_preserved": True,
    }
    (ROOT / "reports/audio-loudnorm.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    return report


def main() -> None:
    for path in [SOURCE, ASR_PATH, FONT_PATH]:
        if not path.exists():
            raise FileNotFoundError(path)
    RAW_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    FINAL_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    build_gradient()
    project = build_project()
    audio = build_audio()
    summary = {
        "status": "PASS", "captions": len(project["captions"]), "words": 149,
        "caption_units": sum(len(c["units"]) for c in project["captions"]),
        "caption_formats": {f: sum(c["format"] == f for c in project["captions"]) for f in ["active_pill", "active_underline", "cta_pill"]},
        "cut_intervals": len(CUT_FRAMES), "removed_seconds": project["edit"]["removed_seconds"],
        "output_frames": OUTPUT_FRAMES, "output_duration": OUTPUT_DURATION,
        "max_cps": max(c["cps"] for c in project["captions"]),
        "max_text_width_px": max(c["text_width_px"] for c in project["captions"]),
        "audio": str(FINAL_AUDIO.relative_to(ROOT)), "loudnorm": audio["target"],
    }
    (ROOT / "reports/prepare-report.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
