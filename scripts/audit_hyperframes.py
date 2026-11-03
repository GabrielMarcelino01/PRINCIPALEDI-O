#!/usr/bin/env python3
"""Audita a integração HyperFrames sem executar instaladores ou alterar projetos."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "hyperframes-audit.json"
PROVENANCE = ROOT / "hyperframes" / "provenance.json"


def load(relative: str) -> Any:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def tree_hash(path: Path) -> dict[str, Any]:
    files = sorted(item for item in path.rglob("*") if item.is_file())
    digest = hashlib.sha256()
    for item in files:
        digest.update(item.relative_to(path).as_posix().encode("utf-8"))
        digest.update(b"\0")
        digest.update(item.read_bytes())
        digest.update(b"\0")
    return {"files": len(files), "tree_sha256": digest.hexdigest()}


def main() -> int:
    provenance = load("hyperframes/provenance.json")
    checks: list[dict[str, Any]] = []

    def check(name: str, passed: bool, detail: Any) -> None:
        checks.append({"name": name, "status": "pass" if passed else "fail", "detail": detail})

    package = load("hyperframes/package.json")
    lock = load("hyperframes/package-lock.json")
    expected_version = provenance["runtime"]["version"]
    check("runtime_manifest_pin", package["dependencies"]["hyperframes"] == expected_version, package["dependencies"]["hyperframes"])
    locked = lock["packages"].get("node_modules/hyperframes", {})
    check(
        "runtime_lock_pin_and_integrity",
        locked.get("version") == expected_version and locked.get("integrity") == provenance["runtime"]["npm_integrity"],
        {"version": locked.get("version"), "integrity": locked.get("integrity")},
    )
    local_dependencies = provenance["local_dependencies"]
    dependency_mismatches = {
        name: {"manifest": package["dependencies"].get(name), "expected": version}
        for name, version in local_dependencies.items()
        if package["dependencies"].get(name) != version
    }
    check("local_binary_dependency_pins", not dependency_mismatches, dependency_mismatches or local_dependencies)

    source = provenance["source_document"]
    source_hash = sha(ROOT / source["path"])
    check("user_source_document_preserved", source_hash == source["sha256"], source_hash)
    license_hash = sha(ROOT / provenance["runtime"]["license_file"])
    check("apache_license_preserved", license_hash == provenance["runtime"]["license_sha256"], license_hash)
    manifest_hash = sha(ROOT / provenance["skills"]["upstream_manifest"])
    check("upstream_skill_manifest_preserved", manifest_hash == provenance["skills"]["upstream_manifest_sha256"], manifest_hash)

    for entry in provenance["skills"]["entries"]:
        actual = tree_hash(ROOT / entry["path"])
        passed = (
            actual["files"] == entry["files"]
            and actual["tree_sha256"] == entry["tree_sha256"]
            and actual["tree_sha256"].startswith(entry["upstream_hash"])
        )
        check(f"official_skill_{entry['name']}", passed, {"expected": entry, "actual": actual})

    names = [entry["name"] for entry in provenance["skills"]["entries"]]
    for channel in [".agents/skills", ".claude/skills", ".codex/skills"]:
        invalid = []
        for name in names:
            link = ROOT / channel / name
            if not link.is_symlink() or str(link.readlink()) != f"../../skills/{name}" or not (link / "SKILL.md").is_file():
                invalid.append(f"{channel}/{name}")
        check(f"exposure_{channel.split('/')[0]}", not invalid, {"expected": len(names), "invalid": invalid})

    registry = provenance["registry_metadata"]
    registry_actual = tree_hash(ROOT / registry["path"])
    registry_manifest = load("hyperframes/registry-metadata/registry.json")
    usable = [item for item in registry_manifest["items"] if item["type"] != "hyperframes:example"]
    examples = [item for item in registry_manifest["items"] if item["type"] == "hyperframes:example"]
    check(
        "registry_metadata_integrity",
        registry_actual["files"] == registry["files"] and registry_actual["tree_sha256"] == registry["tree_sha256"],
        {"expected": registry, "actual": registry_actual},
    )
    check(
        "registry_manifest_counts",
        len(registry_manifest["items"]) == 456 and len(usable) == 448 and len(examples) == 8,
        {"total": len(registry_manifest["items"]), "usable": len(usable), "examples": len(examples)},
    )
    search = load("hyperframes/reports/registry-search.json")
    check(
        "registry_offline_search_validated",
        search.get("total") == 448 and search.get("tier") == "words" and search.get("dropped") == 0
        and search.get("results", [{}])[0].get("name") == "bottom-up-letters",
        {"total": search.get("total"), "tier": search.get("tier"), "first": search.get("results", [{}])[0].get("name")},
    )

    gsap = provenance["gsap"]
    gsap_hash = sha(ROOT / gsap["path"])
    check("local_gsap_preserved", gsap_hash == gsap["sha256"], gsap_hash)
    legacy = load("recovered/motion-2/hyperframes/package.json")
    check(
        "legacy_integration_not_upgraded",
        legacy["dependencies"]["hyperframes"] == provenance["legacy_integration"]["hyperframes_version"],
        legacy["dependencies"]["hyperframes"],
    )

    index = (ROOT / "hyperframes/smoke/index.html").read_text(encoding="utf-8")
    scene = (ROOT / "hyperframes/smoke/compositions/diagnostic.html").read_text(encoding="utf-8")
    required_markup = ['data-width="1080"', 'data-height="1920"', 'data-duration="3"', 'data-fps="60"', 'src="assets/gsap.min.js"']
    check("smoke_vertical_60fps_contract", all(token in index for token in required_markup), required_markup)
    forbidden = [r"\bDate\.now\s*\(", r"\bMath\.random\s*\(", r"\brequestAnimationFrame\s*\(", r"\bsetInterval\s*\(", r"\bsetTimeout\s*\(", r"\bfetch\s*\(", r"repeat\s*:\s*-1", r"https?://"]
    found_forbidden = [pattern for pattern in forbidden if re.search(pattern, index + scene)]
    check("smoke_no_nondeterministic_or_network_clock", not found_forbidden, found_forbidden)
    check(
        "smoke_paused_timelines_registered",
        'gsap.timeline({ paused: true })' in index + scene
        and 'window.__timelines.main = mainTimeline' in index
        and 'window.__timelines.diagnostic = diagnosticTimeline' in scene,
        True,
    )

    smoke_check = load("hyperframes/reports/smoke-check.json")
    sections = ["lint", "runtime", "layout", "contrast", "craft"]
    check(
        "smoke_strict_browser_check",
        smoke_check.get("ok") is True and smoke_check.get("strict") is True
        and all(smoke_check[s].get("errorCount") == 0 and smoke_check[s].get("warningCount") == 0 for s in sections),
        {"ok": smoke_check.get("ok"), "contrast_passed": smoke_check["contrast"].get("passed"), "craft_samples": smoke_check["craft"].get("samples")},
    )
    doctor = load("hyperframes/reports/smoke-doctor.json")
    required = {"Node.js", "FFmpeg", "FFprobe", "Chrome"}
    optional_failures = {"whisper-cpp", "TTS (Kokoro)", "BGM (MusicGen)", "Docker", "Docker running"}
    required_results = {item["name"]: item["ok"] for item in doctor["checks"] if item["name"] in required}
    unexpected_failures = [item["name"] for item in doctor["checks"] if not item["ok"] and item["name"] not in optional_failures]
    check("required_runtime_doctor", len(required_results) == 4 and all(required_results.values()) and not unexpected_failures, {"required": required_results, "unexpected_failures": unexpected_failures, "global_ok_includes_optional": doctor["ok"]})

    probe = load("hyperframes/reports/smoke-probe.json")
    video = next(item for item in probe["streams"] if item["codec_type"] == "video")
    check(
        "smoke_encoded_format",
        video["codec_name"] == "h264" and video["width"] == 1080 and video["height"] == 1920
        and video["avg_frame_rate"] == "60/1" and video["nb_read_frames"] == "180"
        and probe["format"]["duration"] == "3.000000",
        {"codec": video["codec_name"], "width": video["width"], "height": video["height"], "fps": video["avg_frame_rate"], "frames": video["nb_read_frames"], "duration": probe["format"]["duration"]},
    )
    video_qa = load("hyperframes/reports/smoke-video-qa.json")
    warnings = [item["name"] for item in video_qa["checks"] if item["status"] == "warning"]
    check("smoke_video_qa", video_qa["summary"]["failures"] == 0 and warnings == ["audio_stream"], {"summary": video_qa["summary"], "warnings": warnings})
    determinism = load("hyperframes/reports/smoke-determinism.json")
    check(
        "smoke_two_render_determinism",
        determinism["status"] == "pass" and determinism["frames_compared"] == 180
        and determinism["decoded_frames_identical"] is True and determinism["mp4_bytes_identical"] is True,
        determinism,
    )
    review = load("hyperframes/reports/smoke-review.json")
    check(
        "smoke_frame_review_recorded",
        review["status"] == "pass" and all(review["checks"].values()) and (ROOT / review["encoded_contact_sheet"]).is_file(),
        {"scope": review["scope"], "checks": review["checks"]},
    )

    launcher = (ROOT / "hyperframes/scripts/hyperframes.mjs").read_text(encoding="utf-8")
    check(
        "launcher_pinned_privacy_and_skills",
        all(token in launcher for token in ["HYPERFRAMES_NO_TELEMETRY", "HYPERFRAMES_SKIP_SKILLS", "HYPERFRAMES_FFMPEG_PATH", "HYPERFRAMES_BROWSER_PATH"]),
        True,
    )
    ignored = []
    for relative in ["hyperframes/node_modules", "hyperframes/out", "hyperframes/smoke/.hyperframes"]:
        result = subprocess.run(["git", "check-ignore", "-q", relative], cwd=ROOT, check=False)
        if result.returncode != 0:
            ignored.append(relative)
    check("generated_files_ignored", not ignored, {"not_ignored": ignored})

    report = {
        "schema_version": 1,
        "date": "2026-10-27",
        "status": "pass" if all(item["status"] == "pass" for item in checks) else "fail",
        "method": "SHA-256 de arquivos e árvores, validação estrutural e leitura dos relatórios de comandos realmente executados. Não reinstala nem rerenderiza.",
        "summary": {
            "checks": len(checks),
            "passed": sum(item["status"] == "pass" for item in checks),
            "failed": sum(item["status"] == "fail" for item in checks),
            "official_skills": len(names),
            "exposed_symlinks": len(names) * 3,
            "registry_usable_items": len(usable),
            "registry_examples": len(examples),
            "smoke_frames_compared": determinism["frames_compared"],
        },
        "checks": checks,
        "scope": "Integridade, setup e QA técnico do smoke test. Não é revisão de um Reel de cliente, playback ou escuta integral. hyperframes add requer rede para os arquivos do componente.",
    }
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"Relatório: {OUTPUT.relative_to(ROOT)}")
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
