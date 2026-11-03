#!/usr/bin/env python3
"""Inventaria SKILL.md, confere links locais e registra duplicidades sem executar skills."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "skills-audit.json"
LINK = re.compile(r"(?<!!)\[[^]]*\]\(([^)]+)\)")
EXTERNAL = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|#)", re.IGNORECASE)


def skill_paths() -> list[Path]:
    paths = list((ROOT / "skills").glob("*/SKILL.md")) + list((ROOT / "recovered").glob("**/SKILL.md"))
    return sorted((path for path in paths if "node_modules" not in path.parts and ".git" not in path.parts), key=lambda path: str(path.relative_to(ROOT)))


def plugin_root(path: Path) -> Path | None:
    for parent in path.parents:
        if (parent / ".claude-plugin" / "plugin.json").is_file():
            return parent
    return None


def inspect_links(path: Path, text: str) -> tuple[list[dict[str, str]], dict[str, int]]:
    findings: list[dict[str, str]] = []
    counts = {"total": 0, "local": 0, "runtime_resolved": 0, "missing": 0, "unresolved": 0}
    for raw in LINK.findall(text):
        counts["total"] += 1
        target = raw.strip().split("#", 1)[0]
        if not target or EXTERNAL.match(target):
            continue
        counts["local"] += 1
        resolved = target
        runtime = "${CLAUDE_" in resolved
        resolved = resolved.replace("${CLAUDE_SKILL_DIR}", str(path.parent))
        root = plugin_root(path)
        if "${CLAUDE_PLUGIN_ROOT}" in resolved and root:
            resolved = resolved.replace("${CLAUDE_PLUGIN_ROOT}", str(root))
        if "${" in resolved:
            counts["unresolved"] += 1
            findings.append({"target": raw, "status": "unresolved_runtime_path"})
            continue
        candidate = Path(resolved) if Path(resolved).is_absolute() else path.parent / resolved
        try:
            candidate.relative_to(ROOT)
        except ValueError:
            counts["unresolved"] += 1
            findings.append({"target": raw, "status": "outside_repository"})
            continue
        if not candidate.exists():
            counts["missing"] += 1
            findings.append({"target": raw, "status": "missing"})
        elif runtime:
            counts["runtime_resolved"] += 1
    return findings, counts


def exposed_skills() -> dict[str, dict[str, str | bool]]:
    result: dict[str, dict[str, str | bool]] = {}
    for directory in [".claude/skills", ".codex/skills", ".agents/skills"]:
        base = ROOT / directory
        for entry in sorted(base.iterdir()) if base.is_dir() else []:
            if entry.is_symlink():
                result[str(entry.relative_to(ROOT))] = {
                    "target": str(entry.readlink()), "valid": entry.exists() and (entry / "SKILL.md").is_file(),
                }
    return result


def build() -> dict[str, object]:
    entries = []
    hashes: dict[str, list[str]] = defaultdict(list)
    totals = {"total": 0, "local": 0, "runtime_resolved": 0, "missing": 0, "unresolved": 0}
    for path in skill_paths():
        raw = path.read_bytes()
        text = raw.decode("utf-8")
        relative = str(path.relative_to(ROOT))
        name_match = re.search(r"^name:\s*[\"']?([^\n\"']+)", text, re.MULTILINE)
        title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
        findings, counts = inspect_links(path, text)
        for key in totals:
            totals[key] += counts[key]
        digest = hashlib.sha256(raw).hexdigest()
        hashes[digest].append(relative)
        entries.append({
            "path": relative,
            "name": name_match.group(1).strip() if name_match else None,
            "title": title_match.group(1).strip() if title_match else None,
            "scope": "operational_reels" if relative.startswith("skills/") else "recovered_reference",
            "sha256": digest,
            "bytes": len(raw),
            "lines": len(text.splitlines()),
            "links": counts,
            "link_findings": findings,
        })
    duplicates = []
    for digest, paths in hashes.items():
        if len(paths) > 1:
            ordered = sorted(paths, key=lambda item: (not item.startswith("skills/"), item))
            duplicates.append({"sha256": digest, "canonical": ordered[0], "duplicates": ordered[1:]})
    exposures = exposed_skills()
    return {
        "schema_version": 1,
        "method": "Leitura individual de SKILL.md; hashes SHA-256; verificação de links Markdown locais. Não executa as skills.",
        "summary": {
            "skills": len(entries),
            "operational_reels": sum(item["scope"] == "operational_reels" for item in entries),
            "recovered_reference": sum(item["scope"] == "recovered_reference" for item in entries),
            "unique_names": len({item["name"] for item in entries}),
            "duplicate_content_groups": len(duplicates),
            "links": totals,
            "exposed_symlinks": len(exposures),
            "invalid_symlinks": sum(not item["valid"] for item in exposures.values()),
        },
        "duplicates": duplicates,
        "exposures": exposures,
        "skills": entries,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strict", action="store_true", help="Falha se houver links ausentes/não resolvidos ou symlink inválido.")
    args = parser.parse_args()
    report = build()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"Relatório: {OUTPUT.relative_to(ROOT)}")
    summary = report["summary"]
    if args.strict and (summary["links"]["missing"] or summary["links"]["unresolved"] or summary["invalid_symlinks"]):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
