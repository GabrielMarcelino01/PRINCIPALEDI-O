#!/usr/bin/env python3
"""Validate the uploaded TAPNext++ source and load its official checkpoint.

Only standard-library modules are imported before the source archive has been
verified and extracted. PyTorch and the TAPNet package are imported afterwards.
No checkpoint, model weights, or extracted source is written to the report.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import resource
import sys
import tempfile
import time
import traceback
from zipfile import ZipFile

UPLOADED_SOURCE_SHA256 = "2976cce23d9bb7b06aa802cd0e84400b696103b8e86cac3856811fcbdc2ff04c"
REQUIRED_SOURCE_FILES = (
    "tapnet/__init__.py",
    "tapnet/tapnext/tapnext_torch.py",
    "tapnet/tapnext/tapnext_lru_modules.py",
    "tapnet/tapnext/tapnext_torch_utils.py",
    "tapnet/tapnextpp/votsp2026/model.py",
    "tapnet/tapnextpp/votsp2026/utils.py",
    "LICENSE",
)


def sha256_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_report(path: str | Path, report: dict) -> None:
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    temporary.write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    os.replace(temporary, output)


def extract_source(source_zip: str | Path, destination: str | Path) -> Path:
    source_zip = Path(source_zip)
    destination = Path(destination)
    actual_hash = sha256_file(source_zip)
    if actual_hash != UPLOADED_SOURCE_SHA256:
        raise ValueError(
            "Uploaded TAPNet source checksum changed; review the new archive "
            f"before execution: {actual_hash}"
        )
    with ZipFile(source_zip) as archive:
        corrupt = archive.testzip()
        if corrupt is not None:
            raise ValueError(f"Corrupt ZIP member: {corrupt}")
        names = archive.namelist()
        roots = {Path(name).parts[0] for name in names if Path(name).parts}
        if roots != {"tapnet-main"}:
            raise ValueError(f"Unexpected source archive roots: {sorted(roots)}")
        for info in archive.infolist():
            member = Path(info.filename)
            if member.is_absolute() or ".." in member.parts:
                raise ValueError(f"Unsafe ZIP member: {info.filename}")
            target = (destination / member).resolve()
            if destination.resolve() not in target.parents:
                raise ValueError(f"ZIP member escapes destination: {info.filename}")
        for required in REQUIRED_SOURCE_FILES:
            if f"tapnet-main/{required}" not in names:
                raise ValueError(f"Required source file is missing: {required}")
        archive.extractall(destination)
    return destination / "tapnet-main"


def max_rss_mebibytes() -> float:
    # Linux reports ru_maxrss in KiB; the workflow intentionally targets Linux.
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0


def run(args: argparse.Namespace, report: dict) -> None:
    checkpoint = Path(args.checkpoint)
    if not checkpoint.is_file():
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint}")
    checkpoint_bytes = checkpoint.stat().st_size
    if checkpoint_bytes < 1_000_000:
        raise ValueError(f"Checkpoint is unexpectedly small: {checkpoint_bytes} bytes")
    if args.expected_checkpoint_sha256:
        actual = sha256_file(checkpoint)
        if actual != args.expected_checkpoint_sha256.lower():
            raise ValueError(
                f"Checkpoint checksum mismatch: {actual} != "
                f"{args.expected_checkpoint_sha256.lower()}"
            )

    report["checkpoint"] = {
        "file": checkpoint.name,
        "bytes": checkpoint_bytes,
        "sha256": sha256_file(checkpoint),
        "official_url": args.checkpoint_url,
    }
    write_report(args.output, report)

    with tempfile.TemporaryDirectory(prefix="tapnextpp-source-") as directory:
        source_root = extract_source(args.source_zip, directory)
        report["source"] = {
            "archive": Path(args.source_zip).name,
            "sha256": UPLOADED_SOURCE_SHA256,
            "required_files_verified": list(REQUIRED_SOURCE_FILES),
        }
        sys.path.insert(0, str(source_root))

        import einops
        import numpy as np
        import torch
        import torchvision

        report["runtime"] = {
            "python": platform.python_version(),
            "platform": platform.platform(),
            "torch": torch.__version__,
            "torchvision": torchvision.__version__,
            "numpy": np.__version__,
            "einops": einops.__version__,
            "device": "cpu",
            "cuda_available": torch.cuda.is_available(),
        }
        torch.set_num_threads(args.threads)
        from tapnet.tapnextpp.votsp2026.model import TAPNextPP

        started = time.monotonic()
        model = TAPNextPP.from_checkpoint(
            checkpoint,
            device="cpu",
            half_precision=False,
            compile_model=False,
            input_resolution=args.resolution,
        )
        report["load"] = {
            "success": True,
            "seconds": time.monotonic() - started,
            "input_resolution": args.resolution,
            "strict_state_dict_load": True,
            "parameters": sum(item.numel() for item in model.parameters()),
            "max_rss_mebibytes": max_rss_mebibytes(),
        }
        report["status"] = "load_passed"
        write_report(args.output, report)
        print(
            f"Checkpoint loaded: {report['load']['parameters']:,} parameters; "
            f"{report['load']['seconds']:.1f}s; "
            f"max RSS {report['load']['max_rss_mebibytes']:.0f} MiB",
            flush=True,
        )

        if args.forward:
            # Two deterministic synthetic frames exercise preprocessing, query
            # initialization and recurrent state without downloading video data.
            started = time.monotonic()
            first = np.zeros((64, 64, 3), dtype=np.uint8)
            first[20:44, 20:44] = (40, 180, 240)
            second = first.copy()
            query = np.array([[32.0, 32.0]], dtype=np.float32)
            positions0, visible0, state = model.track_frame(
                first, query_points_xy=query, autocast=False
            )
            positions1, visible1, state = model.track_frame(
                second, state=state, autocast=False
            )
            for positions in (positions0, positions1):
                if positions.shape != (1, 2) or not np.isfinite(positions).all():
                    raise ValueError(f"Invalid predicted positions: {positions}")
            if visible0.shape != (1,) or visible1.shape != (1,):
                raise ValueError("Invalid visibility output shape")
            report["forward"] = {
                "success": True,
                "seconds": time.monotonic() - started,
                "frames": 2,
                "query_xy": query.tolist(),
                "positions_frame_0_xy": positions0.tolist(),
                "positions_frame_1_xy": positions1.tolist(),
                "visible_frame_0": visible0.tolist(),
                "visible_frame_1": visible1.tolist(),
                "recurrent_step": int(state.step),
                "max_rss_mebibytes": max_rss_mebibytes(),
                "note": "Synthetic smoke test only; not an accuracy benchmark.",
            }
            report["status"] = "load_and_forward_passed"
            write_report(args.output, report)
            print(
                f"Two-frame forward passed in {report['forward']['seconds']:.1f}s",
                flush=True,
            )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-zip", type=Path, required=True)
    parser.add_argument("--checkpoint", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--checkpoint-url",
        default="https://storage.googleapis.com/gresearch/tapnextpp/tapnextpp_512.ckpt",
    )
    parser.add_argument("--expected-checkpoint-sha256", default=None)
    parser.add_argument("--resolution", type=int, choices=(256, 512), default=512)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument(
        "--forward",
        action="store_true",
        help="After loading, run two synthetic frames through the recurrent model",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.threads <= 0:
        raise SystemExit("--threads must be positive")
    report = {
        "schema_version": 1,
        "kind": "tapnextpp-checkpoint-smoke",
        "status": "started",
        "forward_requested": args.forward,
        "github_run_id": os.environ.get("GITHUB_RUN_ID"),
        "github_run_attempt": os.environ.get("GITHUB_RUN_ATTEMPT"),
    }
    write_report(args.output, report)
    try:
        run(args, report)
    except BaseException as error:
        report["status"] = "failed"
        report["error"] = {
            "type": type(error).__name__,
            "message": str(error),
            "traceback": traceback.format_exc(),
            "max_rss_mebibytes": max_rss_mebibytes(),
        }
        write_report(args.output, report)
        raise
    finally:
        print(json.dumps(report, indent=2, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
