#!/usr/bin/env node
/**
 * Memória persistente leve inspirada no Claude-Mem (zero dependências externas).
 * Armazena observações em memory/observations.jsonl (com redação automática de segredos
 * e tags <private>) e sincroniza linhas do tempo nos arquivos CLAUDE.md do repositório.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const MEM_DIR = path.join(REPO_ROOT, "memory");
const OBS_FILE = path.join(MEM_DIR, "observations.jsonl");

const VALID_TYPES = new Set(["architecture", "feature", "bugfix", "decision", "discovery"]);

function redactSecrets(input) {
  if (!input) return "";
  return String(input)
    .replace(/<private>[\s\S]*?<\/private>/gi, "[REDACTED]")
    .replace(/\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{16,}|vercel_[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._-]{16,})\b/g, "[REDACTED_TOKEN]");
}

function readObservations() {
  if (!fs.existsSync(OBS_FILE)) return [];
  return fs.readFileSync(OBS_FILE, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function updateAutoBlock(filePath, items) {
  if (!fs.existsSync(filePath)) return false;
  const startTag = "<!-- AUTO-MEM:START -->";
  const endTag = "<!-- AUTO-MEM:END -->";
  const content = fs.readFileSync(filePath, "utf8");
  const sIdx = content.indexOf(startTag);
  const eIdx = content.indexOf(endTag);
  if (sIdx === -1 || eIdx === -1 || eIdx < sIdx) return false;

  const lines = items.length
    ? items.map((o) => {
        const date = String(o.ts || "").slice(0, 10);
        const filesTxt = o.files && o.files.length ? ` _(${o.files.join(", ")})_` : "";
        return `- **[${o.id}] ${date} · \`${o.type}\` (${o.scope}):** **${o.title}** — ${o.summary}${filesTxt}`;
      }).join("\n")
    : "- _Nenhuma observação registrada ainda._";

  const updated = content.slice(0, sIdx + startTag.length) + "\n" + lines + "\n" + content.slice(eIdx);
  fs.writeFileSync(filePath, updated, "utf8");
  return true;
}

function syncContextFiles() {
  const all = readObservations();
  const recentAll = all.slice(-12).reverse();
  const recentFunil = all.filter((o) => o.scope === "funil" || o.scope === "vercel").slice(-10).reverse();

  const rootUpdated = updateAutoBlock(path.join(REPO_ROOT, "CLAUDE.md"), recentAll);
  const funilUpdated = updateAutoBlock(path.join(REPO_ROOT, "funil/CLAUDE.md"), recentFunil);
  return { rootUpdated, funilUpdated, total: all.length };
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0] || "recent";

if (cmd === "add") {
  fs.mkdirSync(MEM_DIR, { recursive: true });
  const existing = readObservations();
  const nextNum = existing.length + 1;
  const id = `mem-${String(nextNum).padStart(4, "0")}`;
  const type = VALID_TYPES.has(args.type) ? args.type : "decision";
  const scope = redactSecrets(args.scope || "geral").trim();
  const title = redactSecrets(args.title || "").trim();
  const summary = redactSecrets(args.summary || "").trim();
  const files = String(args.files || "")
    .split(",")
    .map((s) => redactSecrets(s.trim()))
    .filter(Boolean);

  if (!title || !summary) {
    console.error("Uso: mem.mjs add --type <tipo> --scope <escopo> --title \"...\" --summary \"...\" [--files \"a,b\"]");
    process.exit(1);
  }

  const record = {
    id,
    ts: new Date().toISOString(),
    type,
    scope,
    title,
    summary,
    files
  };

  fs.appendFileSync(OBS_FILE, JSON.stringify(record) + "\n", "utf8");
  syncContextFiles();
  console.log(`Observação salva: ${id} (${title})`);
} else if (cmd === "search") {
  const q = String(args._.slice(1).join(" ") || args.q || "").toLowerCase().trim();
  const terms = q.split(/\s+/).filter(Boolean);
  const all = readObservations();
  const hits = all
    .map((o) => {
      const hay = `${o.id} ${o.type} ${o.scope} ${o.title} ${o.summary} ${(o.files || []).join(" ")}`.toLowerCase();
      const score = terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      return { o, score };
    })
    .filter((x) => (terms.length ? x.score > 0 : true))
    .sort((a, b) => b.score - a.score || String(b.o.ts).localeCompare(String(a.o.ts)))
    .slice(0, Number(args.limit || 10));

  if (!hits.length) {
    console.log("Nenhum registro encontrado para:", q);
  } else {
    for (const { o } of hits) {
      console.log(`[${o.id}] (${o.ts.slice(0, 10)} | ${o.type} | ${o.scope}) ${o.title}\n  ${o.summary}`);
    }
  }
} else if (cmd === "sync") {
  const res = syncContextFiles();
  console.log(`Contexto sincronizado (${res.total} observações).`);
} else {
  const limit = Number(args.limit || 10);
  const scopeFilter = args.scope ? String(args.scope).toLowerCase() : null;
  let list = readObservations();
  if (scopeFilter) list = list.filter((o) => String(o.scope).toLowerCase() === scopeFilter);
  const slice = list.slice(-limit).reverse();
  if (!slice.length) {
    console.log("Nenhuma observação registrada.");
  } else {
    for (const o of slice) {
      console.log(`[${o.id}] (${o.ts.slice(0, 10)} | ${o.type} | ${o.scope}) ${o.title}\n  ${o.summary}`);
    }
  }
}
