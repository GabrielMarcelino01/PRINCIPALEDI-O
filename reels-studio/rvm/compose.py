#!/usr/bin/env python3
"""Place a static or per-frame RGBA overlay behind the RVM person layer."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from rvm import encode_composite


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Same original used by matte.py")
    parser.add_argument("--matte-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path, help="New silent H.264 preview MP4")
    overlays = parser.add_mutually_exclusive_group(required=True)
    overlays.add_argument("--overlay", type=Path, help="Static RGBA PNG at source resolution")
    overlays.add_argument("--overlay-dir", type=Path, help="RGBA PNGs named 000000.png, 000001.png, ...")
    parser.add_argument("--preview-png", type=Path, help="Optionally save the first composited frame")
    parser.add_argument(
        "--skip-source-check",
        action="store_true",
        help="Skip source SHA-256 verification (not recommended)",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    report = encode_composite(
        source_path=args.input,
        matte_dir=args.matte_dir,
        output_path=args.output,
        overlay_path=args.overlay,
        overlay_dir=args.overlay_dir,
        preview_png=args.preview_png,
        verify_source=not args.skip_source_check,
    )
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
