#!/usr/bin/env python3
"""Valida a seleção local do Motion Prompt e, opcionalmente, renderiza os Canvas no Chromium."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SELECTION = ROOT / "references" / "selections" / "68-picks.md"
REPORT = ROOT / "reports" / "validation.json"
UPSTREAM_COMMIT = "bd6bf08d8d412cc82c1bbc8f1a81638617a45cfb"


def static_checks() -> tuple[dict, list[dict]]:
    text = SELECTION.read_text(encoding="utf-8")
    ids = re.findall(r"^\d+\.\s+#(\d{3})\b", text, re.MULTILINE)
    catalog = json.loads((ROOT / "api/v1/catalog.json").read_text(encoding="utf-8"))
    by_id = {element["id"]: element for element in catalog["elements"]}
    missing_ids = [item for item in ids if item not in by_id]
    missing_files = []
    items = []
    for element_id in ids:
        if element_id not in by_id:
            continue
        element = by_id[element_id]
        for language in ("en", "ja"):
            for kind in ("e", "p"):
                path = ROOT / "api/v1" / language / kind / f"{element_id}.txt"
                if not path.is_file():
                    missing_files.append(str(path.relative_to(ROOT)))
        element_path = ROOT / "api/v1/en/e" / f"{element_id}.txt"
        kit_path = ROOT / "api/v1/kit" / f"{element['pack']}.js"
        if not kit_path.is_file():
            missing_files.append(str(kit_path.relative_to(ROOT)))
            continue
        source = element_path.read_text(encoding="utf-8")
        marker = re.search(r"^// @element\s+\d+", source, re.MULTILINE)
        assignment = re.search(r"CELLS\[(\d+)]\s*=", source)
        if not marker or not assignment:
            missing_files.append(f"{element_path.relative_to(ROOT)} (código não identificado)")
            continue
        items.append({
            "id": element_id,
            "pack": element["pack"],
            "kit": kit_path.read_text(encoding="utf-8"),
            "code": source[marker.start():],
            "cell": int(assignment.group(1)),
        })
    errors = []
    if len(ids) != 68 or len(set(ids)) != 68:
        errors.append(f"Seleção deve conter 68 IDs únicos; encontrados {len(ids)} IDs e {len(set(ids))} únicos")
    if catalog.get("count") != 168 or len(by_id) != 168:
        errors.append("Catálogo deve conter 168 elementos únicos")
    if missing_ids:
        errors.append(f"IDs ausentes: {missing_ids}")
    if missing_files:
        errors.append(f"Arquivos/códigos ausentes: {missing_files}")
    packs = sorted({item["pack"] for item in items})
    report = {
        "status": "pass" if not errors else "fail",
        "selected_ids": len(ids),
        "unique_selected_ids": len(set(ids)),
        "catalog_elements": len(by_id),
        "packs": packs,
        "missing_ids": missing_ids,
        "missing_files": missing_files,
        "errors": errors,
    }
    return report, items


BROWSER_SCRIPT = r"""
const DATA = __DATA__;
const results = [];
function hashPixels(data) {
  let hash = 0;
  let visible = false;
  for (let i = 0; i < data.length; i += 64) {
    if (data[i + 3]) visible = true;
    hash = (Math.imul(hash, 31) + data[i] + 3 * data[i + 1] + 7 * data[i + 2] + 13 * data[i + 3]) | 0;
  }
  return {hash, visible};
}
for (const item of DATA) {
  try {
    const factory = new Function(`${item.kit}\n${item.code}\nreturn {cell: CELLS[${item.cell}], width: CW, height: CH, cycle: typeof HOLD === 'number' ? HOLD : CYC};`);
    const {cell, width, height, cycle} = factory();
    if (typeof cell !== 'function') throw new Error('CELLS não contém uma função');
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const draw = (time) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      cell(ctx, width, height, time);
      ctx.restore();
      return hashPixels(ctx.getImageData(0, 0, width, height).data);
    };
    const times = [0, cycle * 0.2, cycle * 0.5, cycle * 0.8, Math.max(0, cycle - 1 / 30)];
    let visibleFrames = 0;
    for (const time of times) if (draw(time).visible) visibleFrames += 1;
    const first = draw(cycle * 0.5);
    const second = draw(cycle * 0.5);
    const deterministic = first.hash === second.hash;
    results.push({id: item.id, pack: item.pack, status: visibleFrames > 0 && deterministic ? 'pass' : 'fail', visibleFrames, deterministic});
  } catch (error) {
    results.push({id: item.id, pack: item.pack, status: 'fail', error: String(error && error.stack || error).slice(0, 800)});
  }
}
const pre = document.createElement('pre');
pre.id = 'result';
pre.textContent = JSON.stringify({passed: results.filter((r) => r.status === 'pass').length, failed: results.filter((r) => r.status === 'fail').length, results});
document.body.replaceChildren(pre);
"""


def browser_checks(chromium: str, items: list[dict]) -> dict:
    payload = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
    document = "<!doctype html><html><head><meta charset='utf-8'></head><body><script>" + BROWSER_SCRIPT.replace("__DATA__", payload) + "</script></body></html>"
    with tempfile.TemporaryDirectory(prefix="motion-prompt-qa-") as directory:
        page = Path(directory) / "smoke.html"
        page.write_text(document, encoding="utf-8")
        command = ["node", str(ROOT / "scripts" / "run_canvas_smoke.cjs"), str(page), chromium]
        try:
            completed = subprocess.run(command, capture_output=True, text=True, timeout=180)
        except subprocess.TimeoutExpired:
            return {"status": "fail", "error": "Teste em Chromium excedeu 180 s"}
    if completed.returncode:
        return {"status": "fail", "error": "Runner do Chromium falhou", "stdout": completed.stdout[-1000:], "stderr": completed.stderr[-1000:]}
    try:
        result = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return {"status": "fail", "error": "Resultado JSON não encontrado", "stdout": completed.stdout[-1000:], "stderr": completed.stderr[-1000:]}
    result["status"] = "pass" if result["failed"] == 0 and result["passed"] == len(items) and not result.get("pageErrors") else "fail"
    result["executed"] = len(items)
    result["samples_per_element"] = 5
    result["determinism_repeated_frame"] = True
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chromium", help="Caminho do Chromium para o teste real dos Canvas")
    parser.add_argument("--output", type=Path, default=REPORT)
    args = parser.parse_args()
    static, items = static_checks()
    report = {"upstream_commit": UPSTREAM_COMMIT, "static": static, "browser": {"status": "not_run"}}
    if args.chromium and static["status"] == "pass":
        report["browser"] = browser_checks(args.chromium, items)
    report["status"] = "pass" if static["status"] == "pass" and report["browser"]["status"] in {"pass", "not_run"} else "fail"
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "static": static["status"], "browser": report["browser"]["status"], "selected": static["selected_ids"], "browser_passed": report["browser"].get("passed"), "browser_failed": report["browser"].get("failed")}, ensure_ascii=False))
    print(f"Relatório: {args.output}")
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
