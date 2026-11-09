#!/usr/bin/env python3
"""Utilitario de preparo e masterizacao de audio para F5-TTS e pipeline de video.

Subcomandos:
  probe        Inspeciona duracao, taxa de amostragem, canais, LUFS e true peak (JSON).
  prep-ref     Prepara audio/video em WAV mono 24 kHz limpo (3-11s + silencio final) para F5-TTS.
  master-voice Limpa pausas mortas, aplica highpass + tempo opcional + loudnorm (-16 LUFS) e retorna timestamps.
  mix-master   Mixa voz + trilha BGM com sidechain ducking + EBU R128 (-14 LUFS / <= -1.5 dBTP).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[3]


def find_bin(name: str) -> str:
    """Localiza ffmpeg/ffprobe no PATH ou no venv local de video do repositorio."""
    found = shutil.which(name)
    if found:
        return found
    candidate = REPO_ROOT / "tools" / "rea-video" / ".venv" / "bin" / name
    if candidate.is_file() and os.access(candidate, os.X_OK):
        return str(candidate)
    raise FileNotFoundError(
        f"'{name}' nao encontrado no PATH nem em {candidate}. "
        "Instale ffmpeg/ffprobe ou execute tools/bin/ensure-video-env.sh."
    )


def run_cmd(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(
            f"Falha ao executar: {' '.join(cmd)}\nSTDERR:\n{proc.stderr.strip()}"
        )
    return proc


def has_filter(ffmpeg_bin: str, filter_name: str) -> bool:
    proc = subprocess.run(
        [ffmpeg_bin, "-hide_banner", "-filters"],
        capture_output=True,
        text=True,
        check=False,
    )
    return bool(re.search(rf"\b{re.escape(filter_name)}\b", proc.stdout or ""))


def probe_audio(path: Path) -> dict[str, Any]:
    ffprobe = find_bin("ffprobe")
    ffmpeg = find_bin("ffmpeg")

    proc = run_cmd([
        ffprobe, "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=codec_name,sample_rate,channels,channel_layout",
        "-select_streams", "a:0",
        "-of", "json",
        str(path),
    ])
    meta = json.loads(proc.stdout or "{}")
    fmt = meta.get("format", {})
    streams = meta.get("streams", [])
    st = streams[0] if streams else {}

    eb = subprocess.run(
        [ffmpeg, "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True,
        text=True,
        check=False,
    )
    lufs = None
    tp = None
    for line in (eb.stderr or "").splitlines():
        m_i = re.search(r"^\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", line)
        if m_i:
            lufs = float(m_i.group(1))
        m_tp = re.search(r"^\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS", line)
        if m_tp:
            tp = float(m_tp.group(1))

    return {
        "file": str(path),
        "duration_seconds": round(float(fmt.get("duration") or 0.0), 3),
        "size_bytes": int(fmt.get("size") or 0),
        "codec": st.get("codec_name"),
        "sample_rate": int(st.get("sample_rate") or 0) if st.get("sample_rate") else None,
        "channels": st.get("channels"),
        "channel_layout": st.get("channel_layout"),
        "integrated_lufs": lufs,
        "true_peak_dbtp": tp,
    }


def detect_speech_segments(ffmpeg_bin: str, path: Path, duration: float,
                           noise_db: float = -35.0, min_silence: float = 0.14) -> list[dict[str, float]]:
    proc = subprocess.run(
        [
            ffmpeg_bin, "-hide_banner", "-i", str(path),
            "-af", f"silencedetect=noise={noise_db}dB:d={min_silence}",
            "-f", "null", "-",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    silences: list[tuple[float, float]] = []
    cur_start: float | None = None
    for line in (proc.stderr or "").splitlines():
        ms = re.search(r"silence_start:\s*([0-9.]+)", line)
        if ms:
            cur_start = float(ms.group(1))
        me = re.search(r"silence_end:\s*([0-9.]+)", line)
        if me:
            s0 = 0.0 if cur_start is None else cur_start
            silences.append((s0, float(me.group(1))))
            cur_start = None
    if cur_start is not None:
        silences.append((cur_start, duration))

    speech: list[dict[str, float]] = []
    pos = 0.0
    for s0, s1 in silences:
        if s0 - pos > 0.04:
            speech.append({"start": round(pos, 3), "end": round(s0, 3), "duration": round(s0 - pos, 3)})
        pos = max(pos, s1)
    if duration - pos > 0.04:
        speech.append({"start": round(pos, 3), "end": round(duration, 3), "duration": round(duration - pos, 3)})
    return speech


def cmd_prep_ref(args: argparse.Namespace) -> int:
    ffmpeg = find_bin("ffmpeg")
    inp = Path(args.input)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    max_speech = min(max(args.max_duration, 3.0), 11.4)
    tail_pad = max(0.0, args.tail_silence)

    filters = [
        f"atrim=start={args.start}:duration={max_speech}",
        "asetpts=PTS-STARTPTS",
        "highpass=f=85",
        "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-42dB:stop_periods=-1:stop_duration=0.35:stop_threshold=-42dB",
        f"atrim=duration={max_speech}",
        "loudnorm=I=-18:TP=-2.0:LRA=9",
    ]
    if tail_pad > 0:
        filters.append(f"apad=pad_dur={tail_pad}")

    run_cmd([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(inp),
        "-vn",
        "-af", ",".join(filters),
        "-ar", str(args.sample_rate),
        "-ac", "1",
        "-c:a", "pcm_s16le",
        str(out),
    ])

    info = probe_audio(out)
    info["notes"] = (
        "Pronto para --ref_audio do F5-TTS (mono, 24 kHz, <=12s, com silencio de seguranca no final). "
        "Informe a transcricao exata em --ref_text."
    )
    print(json.dumps(info, indent=2, ensure_ascii=False))
    return 0


def cmd_master_voice(args: argparse.Namespace) -> int:
    ffmpeg = find_bin("ffmpeg")
    inp = Path(args.input)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    filters = [
        "highpass=f=80",
        "silenceremove=start_periods=1:start_duration=0.03:start_threshold=-42dB:detection=peak",
        (
            f"silenceremove=stop_periods=-1:stop_duration={args.max_pause}:"
            "stop_threshold=-38dB:stop_silence=0.16:detection=peak"
        ),
    ]

    if abs(args.tempo - 1.0) > 1e-3:
        if has_filter(ffmpeg, "rubberband"):
            filters.append(f"rubberband=tempo={args.tempo:.4f}:pitch=1.0")
        else:
            filters.append(f"atempo={args.tempo:.4f}")

    filters.extend([
        f"loudnorm=I={args.lufs}:TP={args.true_peak}:LRA=9",
        f"alimiter=limit={args.limiter:.2f}:level=disabled",
    ])

    run_cmd([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(inp),
        "-vn",
        "-af", ",".join(filters),
        "-ar", "48000",
        "-ac", "2",
        "-c:a", "pcm_s16le" if out.suffix.lower() == ".wav" else "aac",
        str(out),
    ])

    info = probe_audio(out)
    info["speech_segments"] = detect_speech_segments(ffmpeg, out, info["duration_seconds"])
    print(json.dumps(info, indent=2, ensure_ascii=False))
    return 0


def cmd_mix_master(args: argparse.Namespace) -> int:
    ffmpeg = find_bin("ffmpeg")
    voice = Path(args.voice)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    voice_info = probe_audio(voice)
    dur = voice_info["duration_seconds"] + max(0.0, args.tail_music)

    if args.bgm:
        bgm = Path(args.bgm)
        fc = (
            f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=pad_dur={max(0.0, args.tail_music)}[vox];"
            f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,"
            f"aloop=loop=-1:size=2e+09,atrim=0:{dur:.3f},"
            f"volume={args.bgm_volume:.3f},"
            f"afade=t=in:st=0:d=0.4,"
            f"afade=t=out:st={max(0.0, dur - 0.8):.3f}:d=0.8[bgm_raw];"
            "[vox]asplit=2[vox_main][vox_sc];"
            f"[bgm_raw][vox_sc]sidechaincompress=threshold=0.025:ratio={args.duck_ratio:.1f}:"
            "attack=25:release=260:makeup=1[bgm_duck];"
            "[vox_main][bgm_duck]amix=inputs=2:duration=first:normalize=0,"
            f"loudnorm=I={args.lufs}:TP={args.true_peak}:LRA=8,"
            f"alimiter=limit={args.limiter:.2f}:level=disabled[outa]"
        )
        cmd = [
            ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(voice), "-i", str(bgm),
            "-filter_complex", fc,
            "-map", "[outa]",
            "-ar", "48000", "-ac", "2",
        ]
    else:
        af = (
            f"loudnorm=I={args.lufs}:TP={args.true_peak}:LRA=8,"
            f"alimiter=limit={args.limiter:.2f}:level=disabled"
        )
        cmd = [
            ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(voice),
            "-af", af,
            "-ar", "48000", "-ac", "2",
        ]

    if out.suffix.lower() == ".wav":
        cmd.extend(["-c:a", "pcm_s16le", str(out)])
    else:
        cmd.extend(["-c:a", "aac", "-b:a", "192k", str(out)])

    run_cmd(cmd)
    info = probe_audio(out)
    print(json.dumps(info, indent=2, ensure_ascii=False))
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Pipeline de audio para F5-TTS e producao de video.")
    sub = p.add_subparsers(dest="command", required=True)

    sp_probe = sub.add_parser("probe", help="Inspeciona metadados e loudness EBU R128 de um audio.")
    sp_probe.add_argument("input", help="Arquivo de audio/video.")

    sp_ref = sub.add_parser("prep-ref", help="Prepara WAV de referencia limpo para F5-TTS (mono 24kHz <=12s).")
    sp_ref.add_argument("input", help="Arquivo fonte (WAV, MP3, MP4, etc.).")
    sp_ref.add_argument("-o", "--output", required=True, help="Caminho WAV de saida.")
    sp_ref.add_argument("--start", type=float, default=0.0, help="Inicio do recorte em segundos.")
    sp_ref.add_argument("--max-duration", type=float, default=10.5, help="Duracao maxima da fala antes do padding (<= 11.4s).")
    sp_ref.add_argument("--tail-silence", type=float, default=0.6, help="Silencio final de seguranca em segundos.")
    sp_ref.add_argument("--sample-rate", type=int, default=24000, help="Taxa de amostragem de saida (padrao 24000).")

    sp_mv = sub.add_parser("master-voice", help="Limpa silencias, ajusta ritmo e normaliza voz para -16 LUFS.")
    sp_mv.add_argument("input", help="Audio bruto da locucao.")
    sp_mv.add_argument("-o", "--output", required=True, help="Arquivo WAV/M4A tratado.")
    sp_mv.add_argument("--tempo", type=float, default=1.0, help="Fator de velocidade sem alterar timbre (ex: 1.15).")
    sp_mv.add_argument("--max-pause", type=float, default=0.22, help="Duracao minima de silencio para compactar.")
    sp_mv.add_argument("--lufs", type=float, default=-16.0, help="Loudness alvo da voz solo (padrao -16 LUFS).")
    sp_mv.add_argument("--true-peak", type=float, default=-2.0, help="True peak alvo do loudnorm em dBTP.")
    sp_mv.add_argument("--limiter", type=float, default=0.80, help="Limite do alimiter (0.80 ~= -1.9 dBTP).")

    sp_mix = sub.add_parser("mix-master", help="Mixa voz + BGM com ducking e masteriza em -14 LUFS / <= -1.5 dBTP.")
    sp_mix.add_argument("--voice", required=True, help="Faixa principal de voz tratada.")
    sp_mix.add_argument("--bgm", help="Faixa de musica opcional (sera loopada/cortada e ducked pela voz).")
    sp_mix.add_argument("-o", "--output", required=True, help="Arquivo final (.wav ou .m4a/.aac).")
    sp_mix.add_argument("--bgm-volume", type=float, default=0.26, help="Ganho base da trilha antes do ducking.")
    sp_mix.add_argument("--duck-ratio", type=float, default=6.0, help="Razao do compressor sidechain.")
    sp_mix.add_argument("--tail-music", type=float, default=0.8, help="Cauda musical apos o fim da fala (segundos).")
    sp_mix.add_argument("--lufs", type=float, default=-14.0, help="Loudness alvo final EBU R128 (padrao -14 LUFS).")
    sp_mix.add_argument("--true-peak", type=float, default=-2.5, help="True peak alvo do loudnorm em dBTP.")
    sp_mix.add_argument("--limiter", type=float, default=0.80, help="Limite do alimiter (0.80 ~= -1.9 dBTP).")

    return p


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "probe":
        print(json.dumps(probe_audio(Path(args.input)), indent=2, ensure_ascii=False))
        return 0
    if args.command == "prep-ref":
        return cmd_prep_ref(args)
    if args.command == "master-voice":
        return cmd_master_voice(args)
    if args.command == "mix-master":
        return cmd_mix_master(args)
    return 1


if __name__ == "__main__":
    sys.exit(main())
