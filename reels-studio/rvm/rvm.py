"""RVM ONNX inference and deterministic compositing helpers.

The recurrent network is used only while precomputing a matte sequence.  The
resulting PNG sequence can then be sampled by a frame renderer as a pure
function of output time, without carrying ONNX state between rendered frames.
"""

from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path
from typing import Iterator

import av
import numpy as np
import onnxruntime as ort
from PIL import Image

DEFAULT_MODEL = Path(__file__).resolve().parents[2] / "rvm_mobilenetv3_fp32.onnx"
KNOWN_MODEL_SHA256 = "88d4531297118f595bf2fd60f6f566aec2e559393802d1f436c380f0cbbd2828"


def sha256_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: str | Path, payload: object) -> None:
    Path(path).write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def read_json(path: str | Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def auto_downsample_ratio(width: int, height: int, longest_side: int = 512) -> float:
    """Return a conservative ratio; explicit per-shot tuning is still preferred."""
    if width <= 0 or height <= 0:
        raise ValueError("Video dimensions must be positive")
    if longest_side <= 0:
        raise ValueError("longest_side must be positive")
    return min(1.0, longest_side / max(width, height))


@dataclass(frozen=True)
class SourceFrame:
    index: int
    pts: int | None
    seconds: float
    rgb: np.ndarray


class VideoSequence:
    """Decode a contiguous source interval in presentation order."""

    def __init__(
        self,
        path: str | Path,
        *,
        start: float = 0.0,
        duration: float | None = None,
        limit: int | None = None,
    ) -> None:
        if start < 0:
            raise ValueError("start must be >= 0")
        if duration is not None and duration <= 0:
            raise ValueError("duration must be > 0")
        if limit is not None and limit <= 0:
            raise ValueError("limit must be > 0")

        self.path = Path(path)
        self.start = start
        self.duration = duration
        self.limit = limit
        self.container = av.open(str(self.path))
        self.stream = self.container.streams.video[0]
        rate = self.stream.average_rate or self.stream.guessed_rate
        if not rate:
            self.container.close()
            raise ValueError("Could not determine the source frame rate")
        self.fps = Fraction(rate.numerator, rate.denominator)
        self.width = int(self.stream.codec_context.width)
        self.height = int(self.stream.codec_context.height)
        self.time_base = self.stream.time_base
        if start:
            self.container.seek(
                int(start / float(self.time_base)),
                stream=self.stream,
                backward=True,
                any_frame=False,
            )

    def __enter__(self) -> "VideoSequence":
        return self

    def __exit__(self, *_: object) -> None:
        self.container.close()

    def frames(self) -> Iterator[SourceFrame]:
        emitted = 0
        end = None if self.duration is None else self.start + self.duration
        for frame in self.container.decode(self.stream):
            if frame.pts is not None and frame.time_base is not None:
                seconds = float(frame.pts * frame.time_base)
            elif frame.pts is not None:
                seconds = float(frame.pts * self.time_base)
            else:
                seconds = emitted / float(self.fps) + self.start

            # A small tolerance avoids dropping a frame because of time-base rounding.
            if seconds < self.start - 1e-6:
                continue
            if end is not None and seconds >= end - 1e-6:
                break

            rgb = frame.to_ndarray(format="rgb24")
            if rgb.shape[:2] != (self.height, self.width):
                raise ValueError("Source dimensions changed inside the selected interval")
            yield SourceFrame(emitted, frame.pts, seconds, rgb)
            emitted += 1
            if self.limit is not None and emitted >= self.limit:
                break


class RVMSession:
    """Stateful RVM session; create/reset one per contiguous source take."""

    INPUT_NAMES = ("src", "r1i", "r2i", "r3i", "r4i", "downsample_ratio")

    def __init__(
        self,
        model_path: str | Path,
        downsample_ratio: float,
        *,
        threads: int = 0,
    ) -> None:
        if not 0 < downsample_ratio <= 1:
            raise ValueError("downsample_ratio must be in (0, 1]")
        if threads < 0:
            raise ValueError("threads must be >= 0")
        self.model_path = Path(model_path)
        if not self.model_path.is_file():
            raise FileNotFoundError(f"RVM model not found: {self.model_path}")
        self.downsample_ratio = float(downsample_ratio)
        options = ort.SessionOptions()
        if threads:
            options.intra_op_num_threads = threads
            options.inter_op_num_threads = 1
        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=options,
            providers=["CPUExecutionProvider"],
        )
        input_names = {item.name for item in self.session.get_inputs()}
        missing = set(self.INPUT_NAMES) - input_names
        if missing:
            raise ValueError(f"Unexpected RVM graph; missing inputs: {sorted(missing)}")
        self.recurrent: list[np.ndarray] = []
        self.reset()

    def reset(self) -> None:
        self.recurrent = [np.zeros((1, 1, 1, 1), dtype=np.float32) for _ in range(4)]

    def process(self, rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        if rgb.ndim != 3 or rgb.shape[2] != 3:
            raise ValueError(f"Expected an HxWx3 RGB frame, got {rgb.shape}")
        source = np.ascontiguousarray(
            rgb.transpose(2, 0, 1)[None].astype(np.float32) / 255.0
        )
        inputs = {
            "src": source,
            "r1i": self.recurrent[0],
            "r2i": self.recurrent[1],
            "r3i": self.recurrent[2],
            "r4i": self.recurrent[3],
            "downsample_ratio": np.array([self.downsample_ratio], dtype=np.float32),
        }
        outputs = self.session.run(None, inputs)
        if len(outputs) != 6:
            raise ValueError(f"Expected 6 RVM outputs, got {len(outputs)}")
        foreground, alpha = outputs[0], outputs[1]
        self.recurrent = [np.ascontiguousarray(item) for item in outputs[2:6]]
        if foreground.shape != (1, 3, rgb.shape[0], rgb.shape[1]):
            raise ValueError(f"Unexpected foreground shape: {foreground.shape}")
        if alpha.shape != (1, 1, rgb.shape[0], rgb.shape[1]):
            raise ValueError(f"Unexpected alpha shape: {alpha.shape}")
        if not all(np.isfinite(item).all() for item in outputs[:6]):
            raise ValueError("RVM returned NaN or infinity")
        return (
            np.ascontiguousarray(foreground[0].transpose(1, 2, 0), dtype=np.float32),
            np.ascontiguousarray(alpha[0, 0], dtype=np.float32),
        )


def alpha_to_uint16(alpha: np.ndarray) -> np.ndarray:
    return np.rint(np.clip(alpha, 0.0, 1.0) * 65535.0).astype(np.uint16)


def foreground_to_uint8(foreground: np.ndarray) -> np.ndarray:
    return np.rint(np.clip(foreground, 0.0, 1.0) * 255.0).astype(np.uint8)


def read_alpha(path: str | Path) -> np.ndarray:
    with Image.open(path) as image:
        array = np.asarray(image)
    if array.ndim != 2:
        raise ValueError(f"Alpha must be grayscale: {path}")
    if array.dtype == np.uint16:
        return array.astype(np.float32) / 65535.0
    if array.dtype == np.uint8:
        return array.astype(np.float32) / 255.0
    raise ValueError(f"Unsupported alpha dtype {array.dtype}: {path}")


def read_rgb(path: str | Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.asarray(image.convert("RGB"), dtype=np.float32) / 255.0


def read_rgba(path: str | Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.asarray(image.convert("RGBA"), dtype=np.float32) / 255.0


def composite_frame(
    source_rgb: np.ndarray,
    foreground: np.ndarray,
    alpha: np.ndarray,
    overlay_rgba: np.ndarray,
) -> np.ndarray:
    """Composite overlay behind the person, with non-premultiplied RGBA inputs."""
    if source_rgb.shape != foreground.shape or source_rgb.ndim != 3:
        raise ValueError("source_rgb and foreground must have identical HxWx3 shapes")
    height, width = source_rgb.shape[:2]
    if alpha.shape != (height, width):
        raise ValueError("alpha shape does not match the source")
    if overlay_rgba.shape != (height, width, 4):
        raise ValueError("overlay_rgba must have the same HxW and four channels")

    source = np.clip(source_rgb.astype(np.float32), 0.0, 1.0)
    person = np.clip(foreground.astype(np.float32), 0.0, 1.0)
    matte = np.clip(alpha.astype(np.float32), 0.0, 1.0)[..., None]
    overlay = np.clip(overlay_rgba.astype(np.float32), 0.0, 1.0)
    overlay_alpha = overlay[..., 3:4]

    background_with_overlay = (
        source * (1.0 - overlay_alpha) + overlay[..., :3] * overlay_alpha
    )
    return person * matte + background_with_overlay * (1.0 - matte)


def composite_overlay_behind_person(
    source_rgb: np.ndarray,
    alpha: np.ndarray,
    overlay_rgba: np.ndarray,
) -> np.ndarray:
    """Insert an overlay into the original shot without rebuilding its pixels.

    The source already contains both person and background.  Alpha attenuates
    only the new overlay, so transparent-overlay regions remain bit-for-bit
    identical to the source before video encoding.
    """
    if source_rgb.ndim != 3 or source_rgb.shape[2] != 3:
        raise ValueError("source_rgb must have an HxWx3 shape")
    height, width = source_rgb.shape[:2]
    if alpha.shape != (height, width):
        raise ValueError("alpha shape does not match the source")
    if overlay_rgba.shape != (height, width, 4):
        raise ValueError("overlay_rgba must have the same HxW and four channels")

    source = np.clip(source_rgb.astype(np.float32), 0.0, 1.0)
    matte = np.clip(alpha.astype(np.float32), 0.0, 1.0)[..., None]
    overlay = np.clip(overlay_rgba.astype(np.float32), 0.0, 1.0)
    overlay_weight = overlay[..., 3:4] * (1.0 - matte)
    return source * (1.0 - overlay_weight) + overlay[..., :3] * overlay_weight


def _save_png(path: Path, array: np.ndarray) -> str:
    Image.fromarray(array).save(path, format="PNG", compress_level=6)
    return sha256_file(path)


def run_matting(
    *,
    source_path: str | Path,
    output_dir: str | Path,
    model_path: str | Path = DEFAULT_MODEL,
    downsample_ratio: float | None = None,
    start: float = 0.0,
    duration: float | None = None,
    limit: int | None = None,
    threads: int = 0,
    expected_model_sha256: str | None = None,
) -> dict:
    source_path = Path(source_path)
    output_dir = Path(output_dir)
    model_path = Path(model_path)
    if output_dir.exists() and any(output_dir.iterdir()):
        raise FileExistsError(f"Output directory is not empty: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "foreground").mkdir()
    (output_dir / "alpha").mkdir()

    model_sha256 = sha256_file(model_path)
    if expected_model_sha256 and model_sha256 != expected_model_sha256.lower():
        raise ValueError(
            f"Model checksum mismatch: expected {expected_model_sha256}, got {model_sha256}"
        )

    started = time.monotonic()
    frame_records: list[dict] = []
    with VideoSequence(
        source_path, start=start, duration=duration, limit=limit
    ) as video:
        ratio = (
            auto_downsample_ratio(video.width, video.height)
            if downsample_ratio is None
            else downsample_ratio
        )
        rvm = RVMSession(model_path, ratio, threads=threads)
        rvm.reset()
        for item in video.frames():
            foreground, alpha = rvm.process(item.rgb)
            name = f"{item.index:06d}.png"
            foreground_path = output_dir / "foreground" / name
            alpha_path = output_dir / "alpha" / name
            foreground_hash = _save_png(
                foreground_path, foreground_to_uint8(foreground)
            )
            alpha_hash = _save_png(alpha_path, alpha_to_uint16(alpha))
            frame_records.append(
                {
                    "index": item.index,
                    "source_pts": item.pts,
                    "source_seconds": item.seconds,
                    "foreground": f"foreground/{name}",
                    "alpha": f"alpha/{name}",
                    "foreground_sha256": foreground_hash,
                    "alpha_sha256": alpha_hash,
                }
            )
            if (item.index + 1) % 30 == 0:
                print(f"RVM: {item.index + 1} frames", flush=True)

        if not frame_records:
            raise ValueError("No source frames were decoded in the selected interval")
        manifest = {
            "schema_version": 1,
            "kind": "rvm-onnx-matte-sequence",
            "source": {
                "file": source_path.name,
                "sha256": sha256_file(source_path),
                "width": video.width,
                "height": video.height,
                "fps": {"numerator": video.fps.numerator, "denominator": video.fps.denominator},
                "start_seconds": start,
                "duration_seconds": duration,
                "frame_limit": limit,
            },
            "model": {
                "file": model_path.name,
                "sha256": model_sha256,
                "runtime": "onnxruntime",
                "runtime_version": ort.__version__,
                "providers": ["CPUExecutionProvider"],
            },
            "inference": {
                "downsample_ratio": ratio,
                "recurrent_state_reset": True,
                "sequential_decode": True,
                "threads": threads,
            },
            "outputs": {
                "foreground": {"format": "PNG", "channels": "RGB", "bits": 8},
                "alpha": {"format": "PNG", "channels": "gray", "bits": 16},
                "color_space": "source RGB; no color-space conversion",
            },
            "frame_count": len(frame_records),
            "frames": frame_records,
            "processing_seconds": time.monotonic() - started,
        }
    write_json(output_dir / "manifest.json", manifest)
    print(
        f"RVM: wrote {len(frame_records)} frames to {output_dir} "
        f"in {manifest['processing_seconds']:.1f}s",
        flush=True,
    )
    return manifest


def verify_matte_files(matte_dir: str | Path, manifest: dict) -> int:
    """Re-hash every artifact instead of trusting hashes stored in the manifest."""
    matte_dir = Path(matte_dir)
    verified = 0
    for record in manifest["frames"]:
        for kind in ("foreground", "alpha"):
            path = matte_dir / record[kind]
            expected = record[f"{kind}_sha256"]
            actual = sha256_file(path)
            if actual != expected:
                raise ValueError(f"Checksum mismatch for {path}: {actual} != {expected}")
            verified += 1
    if verified != manifest["frame_count"] * 2:
        raise ValueError("Manifest frame count does not match its frame records")
    return verified


def compare_manifests(first_dir: str | Path, second_dir: str | Path) -> dict:
    first = read_json(Path(first_dir) / "manifest.json")
    second = read_json(Path(second_dir) / "manifest.json")
    verified_first = verify_matte_files(first_dir, first)
    verified_second = verify_matte_files(second_dir, second)
    ignored = {"processing_seconds"}
    first_stable = {key: value for key, value in first.items() if key not in ignored}
    second_stable = {key: value for key, value in second.items() if key not in ignored}
    stable_equal = first_stable == second_stable
    return {
        "deterministic": stable_equal,
        "frames_first": first.get("frame_count"),
        "frames_second": second.get("frame_count"),
        "verified_files_first": verified_first,
        "verified_files_second": verified_second,
        "first": str(first_dir),
        "second": str(second_dir),
    }


def encode_composite(
    *,
    source_path: str | Path,
    matte_dir: str | Path,
    output_path: str | Path,
    overlay_path: str | Path | None = None,
    overlay_dir: str | Path | None = None,
    preview_png: str | Path | None = None,
    verify_source: bool = True,
) -> dict:
    if (overlay_path is None) == (overlay_dir is None):
        raise ValueError("Choose exactly one of overlay_path or overlay_dir")
    matte_dir = Path(matte_dir)
    manifest = read_json(matte_dir / "manifest.json")
    if manifest.get("kind") != "rvm-onnx-matte-sequence":
        raise ValueError("Unsupported matte manifest")
    source_info = manifest["source"]
    if verify_source and sha256_file(source_path) != source_info["sha256"]:
        raise ValueError("Source checksum differs from the matte manifest")

    fps_data = source_info["fps"]
    fps = Fraction(fps_data["numerator"], fps_data["denominator"])
    width, height = int(source_info["width"]), int(source_info["height"])
    output_path = Path(output_path)
    if output_path.exists():
        raise FileExistsError(f"Refusing to overwrite: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    static_overlay = None
    if overlay_path is not None:
        static_overlay = read_rgba(overlay_path)
        if static_overlay.shape != (height, width, 4):
            raise ValueError(
                f"Overlay must be {width}x{height}, got "
                f"{static_overlay.shape[1]}x{static_overlay.shape[0]}"
            )

    count = 0
    container = av.open(
        str(output_path), mode="w", format="mp4", options={"movflags": "+faststart"}
    )
    try:
        stream = container.add_stream("libx264", rate=fps)
        stream.width = width
        stream.height = height
        stream.pix_fmt = "yuv420p"
        stream.options = {"crf": "16", "preset": "medium"}
        with VideoSequence(
            source_path,
            start=float(source_info["start_seconds"]),
            duration=source_info["duration_seconds"],
            limit=source_info["frame_limit"],
        ) as video:
            if (video.width, video.height, video.fps) != (width, height, fps):
                raise ValueError("Source format differs from the matte manifest")
            for item, record in zip(video.frames(), manifest["frames"], strict=True):
                alpha = read_alpha(matte_dir / record["alpha"])
                overlay = static_overlay
                if overlay is None:
                    overlay = read_rgba(
                        Path(overlay_dir) / f"{item.index:06d}.png"
                    )
                if overlay.shape != (height, width, 4):
                    raise ValueError(f"Overlay shape mismatch at frame {item.index}")
                composed = composite_overlay_behind_person(
                    item.rgb.astype(np.float32) / 255.0, alpha, overlay
                )
                output_rgb = np.rint(np.clip(composed, 0.0, 1.0) * 255.0).astype(np.uint8)
                if preview_png is not None and item.index == 0:
                    preview_path = Path(preview_png)
                    preview_path.parent.mkdir(parents=True, exist_ok=True)
                    Image.fromarray(output_rgb).save(preview_path)
                frame = av.VideoFrame.from_ndarray(output_rgb, format="rgb24")
                frame.pts = item.index
                frame.time_base = Fraction(1, 1) / fps
                for packet in stream.encode(frame):
                    container.mux(packet)
                count += 1
        for packet in stream.encode():
            container.mux(packet)
    finally:
        container.close()

    if count != manifest["frame_count"]:
        raise ValueError("Encoded frame count differs from the matte manifest")
    return {
        "output": str(output_path),
        "frames": count,
        "width": width,
        "height": height,
        "fps": float(fps),
        "audio": "silent preview; mux source audio with FFmpeg for delivery",
    }
