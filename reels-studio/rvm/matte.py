#!/usr/bin/env python3
"""Precompute a sequential RVM matte from an original video."""

from __future__ import annotations

import argparse
from pathlib import Path

from rvm import DEFAULT_MODEL, run_matting


def positive_float(value: str) -> float:
    number = float(value)
    if number <= 0:
        raise argparse.ArgumentTypeError("must be greater than zero")
    return number


def nonnegative_float(value: str) -> float:
    number = float(value)
    if number < 0:
        raise argparse.ArgumentTypeError("must be zero or greater")
    return number


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Original source video")
    parser.add_argument("--output-dir", required=True, type=Path, help="New/empty work directory")
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    parser.add_argument(
        "--downsample-ratio",
        type=positive_float,
        default=None,
        help="RVM internal scale in (0,1]; default: longest side approximately 512 px",
    )
    parser.add_argument("--start", type=nonnegative_float, default=0.0, help="Start in seconds")
    parser.add_argument("--duration", type=positive_float, default=None, help="Interval in seconds")
    parser.add_argument("--limit-frames", type=int, default=None, help="Optional smoke-test limit")
    parser.add_argument("--threads", type=int, default=0, help="ONNX CPU threads; 0 = runtime default")
    parser.add_argument(
        "--expected-model-sha256",
        default=None,
        help="Optional supply-chain check; see README for the bundled model checksum",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.limit_frames is not None and args.limit_frames <= 0:
        raise SystemExit("--limit-frames must be greater than zero")
    if args.threads < 0:
        raise SystemExit("--threads must be zero or greater")
    if args.downsample_ratio is not None and args.downsample_ratio > 1:
        raise SystemExit("--downsample-ratio must be in (0, 1]")
    run_matting(
        source_path=args.input,
        output_dir=args.output_dir,
        model_path=args.model,
        downsample_ratio=args.downsample_ratio,
        start=args.start,
        duration=args.duration,
        limit=args.limit_frames,
        threads=args.threads,
        expected_model_sha256=args.expected_model_sha256,
    )


if __name__ == "__main__":
    main()
