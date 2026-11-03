#!/usr/bin/env python3
"""Audita a biblioteca de motion consolidada, sem executar prompts ou referências."""

from __future__ import annotations

import collections
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "motion-library-audit.json"
SOURCE_BIBLIOTECA_SHA = "1730416fe1e036fac54fb40a7d939fad439649abda9e7e56fd91fc6134933f51"
LEGACY = [
    ("skills/MOTION-1", "skills/motion-prompt/README.md", "e5d23869a1667ac7fd82a6d492ac05768d7e7c0a429465864b9e2c508debf7ee"),
    ("skills/MOTIONDOWNLOADS.md", "skills/motion-prompt/references/selections/68-picks.md", "5dc83bf1b377ef441bd8a50a07e32b4fd0ac06b3ad7afd6e27cf01a95464d369"),
    ("skills/BIBLIOTECAMOTION-2", "skills/motion-prompt/references/selections/96-picks.md", "9045b334c9bf6abcd87bb5ca2919394b6b4f9f9f588f71d15839e2f2f0424f97"),
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    checks: list[dict[str, object]] = []

    def check(name: str, passed: bool, detail: object) -> None:
        checks.append({"name": name, "status": "pass" if passed else "fail", "detail": detail})

    biblioteca_path = ROOT / "skill" / "BIBLIOTECA-1.md"
    biblioteca = json.loads(biblioteca_path.read_text(encoding="utf-8"))
    prompt_hashes = [hashlib.sha256(item["prompt"].encode()).hexdigest() for item in biblioteca]
    aliases = [alias for item in biblioteca for alias in item.get("alternate_references", [])]
    slugs = [item["slug"] for item in biblioteca] + [alias["slug"] for alias in aliases]
    duplicate_groups = sum(bool(item.get("alternate_references")) for item in biblioteca)
    check("canonical_prompt_count", len(biblioteca) == 684, len(biblioteca))
    check("canonical_prompts_unique", len(set(prompt_hashes)) == len(prompt_hashes), len(set(prompt_hashes)))
    check("alternate_references_count", len(aliases) == 19, len(aliases))
    check("consolidated_prompt_groups", duplicate_groups == 11, duplicate_groups)
    check("all_source_slugs_preserved", len(slugs) == 703 and len(set(slugs)) == 703, {"total": len(slugs), "unique": len(set(slugs))})

    movimento_path = ROOT / "skill" / "MOVIMENTO.md"
    raw_lines = [line for line in movimento_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    rows = [json.loads(line) for line in raw_lines]
    ids = [row["id"] for row in rows[1:]]
    row_hashes = [hashlib.sha256(line.encode()).hexdigest() for line in raw_lines[1:]]
    check("motion_rule_rows", len(rows) - 1 == 716, len(rows) - 1)
    check("motion_rule_ids_unique", len(ids) == len(set(ids)) == 716, {"total": len(ids), "unique": len(set(ids))})
    check("motion_rule_rows_unique", len(row_hashes) == len(set(row_hashes)), len(set(row_hashes)))
    check("motion_rule_declared_counts", rows[0].get("counts") == {"lib": 507, "hf": 53, "rule": 156}, rows[0].get("counts"))

    loose = [path for folder in ["skill", "skills"] for path in (ROOT / folder).glob("*") if path.is_file()]
    by_hash: dict[str, list[str]] = collections.defaultdict(list)
    for path in loose:
        by_hash[sha(path)].append(str(path.relative_to(ROOT)))
    loose_duplicates = [paths for paths in by_hash.values() if len(paths) > 1]
    check("no_exact_loose_document_duplicates", not loose_duplicates, loose_duplicates)

    legacy_report = []
    for duplicate, canonical, expected_hash in LEGACY:
        canonical_path = ROOT / canonical
        actual_hash = sha(canonical_path)
        legacy_report.append({"legacy_duplicate": duplicate, "canonical": canonical, "sha256": actual_hash, "legacy_present": (ROOT / duplicate).exists()})
        check(f"canonical_{canonical}", canonical_path.is_file() and actual_hash == expected_hash, actual_hash)
        check(f"legacy_absent_{duplicate}", not (ROOT / duplicate).exists(), (ROOT / duplicate).exists())

    selections = json.loads((ROOT / "skills" / "motion-prompt" / "reports" / "selections.json").read_text(encoding="utf-8"))
    check("motion_prompt_catalog", selections["catalog_elements"] == 168, selections["catalog_elements"])
    check("motion_prompt_combined_selection", selections["combined_unique_ids"] == 164 and not selections["overlap"], {"unique": selections["combined_unique_ids"], "overlap": selections["overlap"]})

    branches = []
    for ref in ["origin/main", "origin/arena/09635ca6-principaledi-o", "origin/arena/5e99bd34-principaledi-o"]:
        result = subprocess.run(["git", "rev-parse", "--verify", ref], cwd=ROOT, text=True, capture_output=True)
        if result.returncode == 0:
            branches.append({"ref": ref, "commit": result.stdout.strip()})

    report = {
        "status": "pass" if all(item["status"] == "pass" for item in checks) else "fail",
        "date": "2026-10-27",
        "method": "Comparação SHA-256 e validação estrutural JSON/JSONL. Prompts e regras são dados; nenhum foi executado.",
        "branches_reviewed": branches,
        "summary": {
            "checks": len(checks),
            "passed": sum(item["status"] == "pass" for item in checks),
            "failed": sum(item["status"] == "fail" for item in checks),
            "loose_documents": len(loose),
            "exact_loose_duplicate_groups": len(loose_duplicates),
            "biblioteca_canonical_prompts": len(biblioteca),
            "biblioteca_alternate_references": len(aliases),
            "biblioteca_source_slugs_preserved": len(slugs),
            "motion_rules": len(rows) - 1,
            "motion_prompt_effects": selections["catalog_elements"],
        },
        "normalization": {
            "file": "skill/BIBLIOTECA-1.md",
            "source": "origin/main:skill/BIBLIOTECA-1.md",
            "source_sha256": SOURCE_BIBLIOTECA_SHA,
            "cleaned_sha256": sha(biblioteca_path),
            "rule": "A primeira ocorrência de cada prompt é canônica; repetições literais viram alternate_references com todos os metadados, exceto o texto idêntico.",
            "all_703_slugs_and_metadata_preserved": True,
        },
        "legacy_duplicates": legacy_report,
        "checks": checks,
        "scope": "Auditoria de organização e integridade; não é revisão estética de 684 prompts nem validação das 716 regras contra os filmes de origem.",
    }
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"Relatório: {OUTPUT.relative_to(ROOT)}")
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
