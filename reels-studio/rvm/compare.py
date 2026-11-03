#!/usr/bin/env python3
"""Compare two complete matte runs; processing time is the only ignored field."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from rvm import compare_manifests


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("first", type=Path)
    parser.add_argument("second", type=Path)
    args = parser.parse_args()
    report = compare_manifests(args.first, args.second)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not report["deterministic"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
