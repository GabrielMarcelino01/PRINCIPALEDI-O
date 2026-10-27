from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

from rvm import (
    alpha_to_uint16,
    auto_downsample_ratio,
    composite_frame,
    composite_overlay_behind_person,
    foreground_to_uint8,
    read_alpha,
)


class RVMHelpersTest(unittest.TestCase):
    def test_auto_downsample_ratio(self) -> None:
        self.assertAlmostEqual(auto_downsample_ratio(720, 1280), 0.4)
        self.assertAlmostEqual(auto_downsample_ratio(1920, 1080), 512 / 1920)
        self.assertEqual(auto_downsample_ratio(320, 240), 1.0)
        with self.assertRaises(ValueError):
            auto_downsample_ratio(0, 1080)

    def test_overlay_is_behind_person(self) -> None:
        source = np.zeros((2, 2, 3), dtype=np.float32)
        foreground = np.zeros_like(source)
        foreground[..., 1] = 1.0  # green person
        overlay = np.zeros((2, 2, 4), dtype=np.float32)
        overlay[..., 0] = 1.0  # red overlay
        overlay[..., 3] = 1.0
        alpha = np.zeros((2, 2), dtype=np.float32)
        alpha[0, 0] = 1.0
        alpha[0, 1] = 0.5

        result = composite_frame(source, foreground, alpha, overlay)
        np.testing.assert_allclose(result[0, 0], [0, 1, 0], atol=1e-6)
        np.testing.assert_allclose(result[0, 1], [0.5, 0.5, 0], atol=1e-6)
        np.testing.assert_allclose(result[1, 0], [1, 0, 0], atol=1e-6)

    def test_same_source_composite_preserves_person_and_background(self) -> None:
        source = np.zeros((1, 3, 3), dtype=np.float32)
        source[0, 0] = [0.0, 1.0, 0.0]  # original person pixel
        source[0, 1] = [0.0, 0.0, 1.0]  # original background pixel
        source[0, 2] = [0.2, 0.4, 0.6]
        alpha = np.array([[1.0, 0.0, 0.5]], dtype=np.float32)
        overlay = np.zeros((1, 3, 4), dtype=np.float32)
        overlay[..., 0] = 1.0
        overlay[..., 3] = 1.0

        result = composite_overlay_behind_person(source, alpha, overlay)
        np.testing.assert_allclose(result[0, 0], source[0, 0], atol=1e-6)
        np.testing.assert_allclose(result[0, 1], [1, 0, 0], atol=1e-6)
        np.testing.assert_allclose(
            result[0, 2], (source[0, 2] + np.array([1, 0, 0])) / 2, atol=1e-6
        )

        overlay[..., 3] = 0.0
        unchanged = composite_overlay_behind_person(source, alpha, overlay)
        np.testing.assert_array_equal(unchanged, source)

    def test_alpha_16_bit_png_round_trip(self) -> None:
        alpha = np.array([[0.0, 0.25, 0.5, 0.75, 1.0]], dtype=np.float32)
        expected = alpha_to_uint16(alpha)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "alpha.png"
            Image.fromarray(expected).save(path)
            restored = read_alpha(path)
        np.testing.assert_allclose(
            restored, expected.astype(np.float32) / 65535.0, atol=0, rtol=0
        )

    def test_output_quantization_is_clamped(self) -> None:
        foreground = np.array([[[-1.0, 0.5, 2.0]]], dtype=np.float32)
        np.testing.assert_array_equal(
            foreground_to_uint8(foreground), np.array([[[0, 128, 255]]], dtype=np.uint8)
        )

    def test_shape_mismatch_is_rejected(self) -> None:
        source = np.zeros((2, 2, 3), dtype=np.float32)
        with self.assertRaises(ValueError):
            composite_frame(source, source, np.zeros((1, 1)), np.zeros((2, 2, 4)))


if __name__ == "__main__":
    unittest.main()
