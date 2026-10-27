#!/usr/bin/env python3
"""QA técnico reproduzível do ARMÁRIO-7; não substitui playback/escuta integral."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
OUT = ROOT / "out"
REPORTS = ROOT / "reports"
REPORTS.mkdir(parents=True, exist_ok=True)
DELIVERY = REPO / "entregas" / "ARMARIO-7-EDITADO.mp4"
PROJECT = json.loads((ROOT / "project.json").read_text(encoding="utf-8"))
CHECKS: list[dict] = []


def check(name: str, passed: bool, details) -> None:
    CHECKS.append({"name": name, "passed": bool(passed), "details": details})


def binary(kind: str) -> str:
    env = os.environ.get(kind.upper())
    if env:
        return env
    if shutil.which(kind):
        return shutil.which(kind) or kind
    expression = (
        "process.stdout.write(require('@ffmpeg-installer/ffmpeg').path)"
        if kind == "ffmpeg"
        else "process.stdout.write(require('ffprobe-static').path)"
    )
    return subprocess.check_output(["node", "-e", expression], cwd=ROOT, text=True).strip()


FFMPEG = binary("ffmpeg")
FFPROBE = binary("ffprobe")


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(args, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


source = ROOT.parent / "assets" / "armario-7" / "ARMARIO-7.mp4"
source_hash = sha256(source) if source.is_file() else None
check("fonte_original_integra", source_hash == PROJECT["sourceSha256"], {"sha256": source_hash, "bytes": source.stat().st_size if source.exists() else 0})

frames = sorted((OUT / "frames").glob("[0-9][0-9][0-9][0-9][0-9].jpg"))
expected_names = [f"{index:05d}.jpg" for index in range(PROJECT["frames"])]
check("sequencia_1293_quadros", [path.name for path in frames] == expected_names, {"count": len(frames), "expected": PROJECT["frames"]})
source_frames = sorted((OUT / "source-frames").glob("[0-9][0-9][0-9][0-9][0-9].jpg"))
check("fonte_indexada_1293_quadros", [path.name for path in source_frames] == expected_names, {"count": len(source_frames), "expected": PROJECT["frames"]})
normalization_path = REPORTS / "source-normalization.json"
normalization = json.loads(normalization_path.read_text()) if normalization_path.exists() else {}
check("fonte_indexada_do_original", normalization.get("source_sha256") == PROJECT["sourceSha256"] and normalization.get("source_frames") == PROJECT["frames"] and "sem seek" in normalization.get("method", ""), normalization)
check("sem_capturas_temporarias", not list((OUT / "frames").glob("*.tmp.jpg")), True)
check("entrega_existe", DELIVERY.is_file() and DELIVERY.stat().st_size > 1_000_000, {"bytes": DELIVERY.stat().st_size if DELIVERY.exists() else 0})

probe = run([FFPROBE, "-v", "error", "-show_streams", "-show_format", "-of", "json", str(DELIVERY)])
probe_data = json.loads(probe.stdout) if probe.returncode == 0 else {}
video = next((stream for stream in probe_data.get("streams", []) if stream.get("codec_type") == "video"), {})
audio = next((stream for stream in probe_data.get("streams", []) if stream.get("codec_type") == "audio"), {})
video_details = {key: video.get(key) for key in ["codec_name", "profile", "width", "height", "pix_fmt", "r_frame_rate", "avg_frame_rate", "nb_frames", "color_range", "color_space", "color_transfer", "color_primaries"]}
check("h264_vertical_1080x1920", video.get("codec_name") == "h264" and video.get("width") == 1080 and video.get("height") == 1920, video_details)
check("60_fps_1293_quadros", video.get("avg_frame_rate") == "60/1" and int(video.get("nb_frames", "0")) == PROJECT["frames"], video_details)
check("yuv420p_bt709", video.get("pix_fmt") == "yuv420p" and video.get("color_space") == "bt709" and video.get("color_transfer") == "bt709" and video.get("color_primaries") == "bt709", video_details)
check("aac_estereo_48khz", audio.get("codec_name") == "aac" and audio.get("channels") == 2 and audio.get("sample_rate") == "48000", {key: audio.get(key) for key in ["codec_name", "channels", "sample_rate", "bit_rate"]})
duration = float(probe_data.get("format", {}).get("duration", 0))
check("duracao_preservada", abs(duration - PROJECT["duration"]) <= 0.08, {"duration": duration, "expected": PROJECT["duration"]})

visual_decode = run([FFMPEG, "-v", "info", "-i", str(DELIVERY), "-vf", "blackdetect=d=0.15:pix_th=0.03,freezedetect=n=0.0008:d=1.5", "-an", "-f", "null", "-"])
black_events = re.findall(r"black_start:[^\n]+", visual_decode.stderr)
freeze_events = re.findall(r"freeze_start:[^\n]+", visual_decode.stderr)
check("decodificacao_video_sem_erros", visual_decode.returncode == 0 and "Error" not in visual_decode.stderr, {"returncode": visual_decode.returncode})
check("sem_preto_ou_congelamento", not black_events and not freeze_events, {"black": black_events, "freeze": freeze_events})

loudness = run([FFMPEG, "-nostdin", "-hide_banner", "-i", str(DELIVERY), "-vn", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"])
json_matches = re.findall(r'\{\s*"input_i"[\s\S]*?\}', loudness.stderr)
loudness_data = json.loads(json_matches[-1]) if json_matches else {}
integrated = float(loudness_data.get("input_i", "nan"))
true_peak = float(loudness_data.get("input_tp", "nan"))
check("loudness_menos_14_lufs", loudness.returncode == 0 and abs(integrated + 14) <= 0.35, loudness_data)
check("true_peak_seguro", loudness.returncode == 0 and true_peak <= -0.65, loudness_data)

silence = run([FFMPEG, "-nostdin", "-hide_banner", "-i", str(DELIVERY), "-vn", "-af", "silencedetect=noise=-45dB:d=1.0", "-f", "null", "-"])
silence_events = re.findall(r"silence_start:[^\n]+", silence.stderr)
check("sem_silencio_longo", silence.returncode == 0 and not silence_events, silence_events)

srt = (ROOT / "armario-7-captions.srt").read_text(encoding="utf-8")
check("srt_cinco_blocos", len(re.findall(r"(?m)^\d+$", srt)) == 5 and "vermelho cereja" in srt.lower() and "verde musgo" in srt.lower(), {"blocks": len(re.findall(r"(?m)^\d+$", srt))})
caption_script = REPO / "skills" / "captions" / "scripts" / "caption_qa.py"
caption_env = {**os.environ, "PATH": f"{Path(FFPROBE).parent}:{os.environ.get('PATH', '')}"}
caption_result = subprocess.run(
    [sys.executable, str(caption_script), str(ROOT / "armario-7-captions.srt"), "--video", str(DELIVERY), "--output", str(REPORTS / "captions-qa.json"), "--strict"],
    cwd=ROOT, env=caption_env, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
)
caption_qa = json.loads((REPORTS / "captions-qa.json").read_text()) if (REPORTS / "captions-qa.json").exists() else {}
check("skill_captions_sem_alertas", caption_result.returncode == 0 and caption_qa.get("status") == "pass", {"returncode": caption_result.returncode, "summary": caption_qa.get("summary"), "stderr": caption_result.stderr[-300:]})
transcript = json.loads((ROOT / "transcript.json").read_text(encoding="utf-8"))
check("transcricao_revisada", len(transcript["segments"]) == 5 and "Duas decodificações" in transcript["asr"]["verification"], transcript["asr"])
composition = (ROOT / "composition.js").read_text(encoding="utf-8")
forbidden = [token for token in ["Math.random", "Date.now", "setInterval", "setTimeout"] if token in composition]
check("animacao_pura_do_tempo", not forbidden and "function renderAt(t)" in composition, {"forbidden": forbidden})
transform_lines = [line.strip() for line in composition.splitlines() if "style.transform" in line]
check("tipografia_sem_transforms", not transform_lines, transform_lines)
check("video_original_sem_crop_ou_filtros", "canvas.style.transform" not in composition and "canvas.style.filter" not in composition and "backdrop-canvas" not in composition and "context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)" in composition, {"full_frame": True, "filters": False, "extra_layers": False})

# Folha e pôster são extraídos do MP4 final, não dos JPEGs de origem.
selected = [30, 140, 280, 390, 510, 612, 730, 830, 950, 1080, 1195, 1278]
select = "+".join(f"eq(n,{frame})" for frame in selected)
contact = run([FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(DELIVERY), "-vf", f"select='{select}',scale=216:384:flags=lanczos,tile=4x3", "-frames:v", "1", str(REPORTS / "contact-sheet.jpg")])
check("folha_do_mp4_gerada", contact.returncode == 0 and (REPORTS / "contact-sheet.jpg").is_file(), {"frames": selected, "returncode": contact.returncode, "stderr": contact.stderr[-500:]})
poster = run([FFMPEG, "-y", "-nostdin", "-hide_banner", "-loglevel", "error", "-ss", "4.6", "-i", str(DELIVERY), "-frames:v", "1", "-q:v", "2", str(REPORTS / "poster.jpg")])
check("poster_do_mp4_gerado", poster.returncode == 0 and (REPORTS / "poster.jpg").is_file(), poster.returncode)

pre_render_path = REPORTS / "pre-render-determinism.json"
pre_render = json.loads(pre_render_path.read_text()) if pre_render_path.exists() else {}
check("teste_previo_dez_de_dez", pre_render.get("all_byte_identical") is True and len(pre_render.get("results", [])) == 10, {"all_byte_identical": pre_render.get("all_byte_identical")})
determinism_path = REPORTS / "determinism.json"
determinism = json.loads(determinism_path.read_text()) if determinism_path.exists() else {}
check("recapturas_deterministicas", determinism.get("all_identical") is True, determinism)

report = {
    "project": PROJECT["id"],
    "delivery": str(DELIVERY.relative_to(REPO)),
    "sha256": sha256(DELIVERY) if DELIVERY.exists() else None,
    "checks": CHECKS,
    "passed": sum(item["passed"] for item in CHECKS),
    "failed": sum(not item["passed"] for item in CHECKS),
    "review_scope": "Verificações técnicas e revisão por quadros do MP4. Não representa playback/escuta integral.",
}
(REPORTS / "validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"passed": report["passed"], "failed": report["failed"], "duration": duration, "loudness": integrated, "true_peak": true_peak, "sha256": report["sha256"]}, ensure_ascii=False, indent=2))
if report["failed"]:
    for item in CHECKS:
        if not item["passed"]:
            print("FALHOU:", item["name"], json.dumps(item["details"], ensure_ascii=False), file=sys.stderr)
    raise SystemExit(1)
