#!/usr/bin/env python3
"""Track reviewed SOFIA-1 opening points with the official TAPNext++ wrapper.

Only a small JSON trajectory report is retained. Frames, video and checkpoint
are never written to the report or uploaded by the calling workflow.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import resource
import sys
import tempfile
import time
import traceback

from smoke_checkpoint import extract_source, sha256_file, write_report

EXPECTED_VIDEO_SHA256 = "99ddaeacbe8ceffe512c37a54b3633f98672696b385085243476d72a8751a858"
QUERIES = (
    ("index_fingertip", 228.0, 535.0),
    ("nose_reference", 369.0, 527.0),
)


def max_rss_mebibytes() -> float:
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0


def run(args: argparse.Namespace, report: dict) -> None:
    import av
    import numpy as np
    import torch

    video = Path(args.video)
    actual_video_hash = sha256_file(video)
    if actual_video_hash != EXPECTED_VIDEO_SHA256:
        raise ValueError(f"SOFIA-1 checksum changed: {actual_video_hash}")
    checkpoint = Path(args.checkpoint)
    if not checkpoint.is_file() or checkpoint.stat().st_size < 1_000_000:
        raise FileNotFoundError(f"Checkpoint missing or unexpectedly small: {checkpoint}")

    torch.set_num_threads(args.threads)
    with tempfile.TemporaryDirectory(prefix="sofia-tapnextpp-source-") as directory:
        source_root = extract_source(args.source_zip, directory)
        sys.path.insert(0, str(source_root))
        from tapnet.tapnextpp.votsp2026.model import TAPNextPP

        started = time.monotonic()
        model = TAPNextPP.from_checkpoint(
            checkpoint,
            device="cpu",
            half_precision=False,
            compile_model=False,
            input_resolution=512,
        )
        report["load"] = {
            "success": True,
            "seconds": time.monotonic() - started,
            "parameters": sum(item.numel() for item in model.parameters()),
        }
        write_report(args.output, report)

        query = np.array([[x, y] for _, x, y in QUERIES], dtype=np.float32)
        state = None
        frames = []
        started = time.monotonic()
        with av.open(str(video)) as container:
            stream = container.streams.video[0]
            stream.thread_type = "AUTO"
            report["video"] = {
                "sha256": actual_video_hash,
                "width": stream.width,
                "height": stream.height,
                "average_rate": str(stream.average_rate),
            }
            for decoded in container.decode(stream):
                timestamp = float(decoded.pts * stream.time_base)
                if timestamp > args.max_seconds:
                    break
                bgr = decoded.to_ndarray(format="bgr24")
                if state is None:
                    positions, visible, state = model.track_frame(
                        bgr, query_points_xy=query, autocast=False
                    )
                else:
                    positions, visible, state = model.track_frame(
                        bgr, state=state, autocast=False
                    )
                if positions.shape != (len(QUERIES), 2) or not np.isfinite(positions).all():
                    raise ValueError(f"Invalid positions at frame {len(frames)}")
                frames.append({
                    "frame": len(frames),
                    "pts": int(decoded.pts),
                    "time": timestamp,
                    "positions_xy": positions.tolist(),
                    "visible": visible.tolist(),
                })
                if len(frames) % 12 == 0:
                    report["status"] = "tracking"
                    report["progress"] = {"frames": len(frames), "last_time": timestamp}
                    write_report(args.output, report)
                    print(f"Tracked {len(frames)} frames through {timestamp:.3f}s", flush=True)

        if len(frames) < 24:
            raise ValueError(f"Too few frames tracked: {len(frames)}")
        report["tracking"] = {
            "success": True,
            "seconds": time.monotonic() - started,
            "frames": len(frames),
            "duration": frames[-1]["time"],
            "queries": [{"name": name, "x": x, "y": y} for name, x, y in QUERIES],
            "samples": frames,
            "recurrent_step": int(state.step),
            "max_rss_mebibytes": max_rss_mebibytes(),
            "note": "Opening-gesture diagnostic; visual review is still required.",
        }
        report["status"] = "tracking_passed"
        write_report(args.output, report)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-zip", type=Path, required=True)
    parser.add_argument("--checkpoint", type=Path, required=True)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--max-seconds", type=float, default=5.2)
    parser.add_argument("--threads", type=int, default=4)
    args = parser.parse_args()
    if not 1.0 <= args.max_seconds <= 8.0 or args.threads <= 0:
        raise SystemExit("Invalid duration or thread count")
    report = {
        "schema_version": 1,
        "kind": "sofia-1-opening-tapnextpp-tracking",
        "status": "started",
        "github_run_id": os.environ.get("GITHUB_RUN_ID"),
        "resolution": 512,
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
        }
        write_report(args.output, report)
        raise


if __name__ == "__main__":
    main()
