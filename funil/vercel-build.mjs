#!/usr/bin/env node
/**
 * Build atômico para Vercel (truquedosmillooks / descompacto.vercel.app).
 * 1. Garante que todas as 26 imagens (3 novas do carrossel + 23 originais) estejam em dist/assets/img/
 *    com verificação estrita de integridade (aborta o build antes de promover se faltar 1 arquivo).
 * 2. Gera dist/index.html em pacote único (CSS + Config + JS inline) para abertura instantânea no 4G mobile,
 *    mantendo também dist/assets/{css,js}/* como fallback.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const DIST_IMG = path.join(DIST, "assets", "img");
const DIST_CSS = path.join(DIST, "assets", "css");
const DIST_JS = path.join(DIST, "assets", "js");

const GH_RAW_BASE =
  process.env.GH_RAW_FUNIL_BASE ||
  "https://raw.githubusercontent.com/GabrielMarcelino01/PRINCIPALEDI-O/arena/0045d78d-principaledi-o/funil";
const LIVE_CDN_BASE = "https://descompacto.vercel.app";

const CAROUSEL_NEW_IMAGES = [
  "antes-depois-capa.jpg",
  "antes-depois-1.jpg",
  "antes-depois-2.jpg",
  "antes-depois-3.jpg",
  "bonus-montador-looks.jpg",
  "bonus-closet-inteligente.jpg",
  "bonus-provador-virtual.jpg"
];

const ORIGINAL_IMAGES = [
  "antes-depois.jpg",
  "app-preview.jpg",
  "colagem-looks.png",
  "conjunto-5-looks.png",
  "corpo-ampulheta.png",
  "corpo-oval.png",
  "corpo-retangulo.png",
  "corpo-triangulo-invertido.png",
  "corpo-triangulo.png",
  "estilo-novo.jpg",
  "guarda-roupa-caos.jpg",
  "guarda-roupa-cheio.jpg",
  "idade-18-24.jpg",
  "idade-25-34.jpg",
  "idade-35-44.jpg",
  "idade-45.jpg",
  "mockup-premium.jpg",
  "perfil-classica.jpg",
  "perfil-criativa.jpg",
  "perfil-fitness.jpg",
  "perfil-moderna.jpg",
  "perfil-romantica.jpg",
  "triptico-looks.jpg"
];

async function fetchBufferWithRetry(url, tries = 3) {
  let lastErr = null;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "truquedosmillooks-vercel-builder/1.0" }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} em ${url}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 800) {
        throw new Error(`Arquivo muito pequeno (${buf.byteLength}B) em ${url}`);
      }
      return buf;
    } catch (err) {
      lastErr = err;
      if (attempt < tries) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
  }
  throw lastErr;
}

async function ensureImage(fileName, remoteUrl) {
  const localSrc = path.join(__dirname, "assets", "img", fileName);
  const dest = path.join(DIST_IMG, fileName);

  if (fs.existsSync(localSrc) && fs.statSync(localSrc).size >= 800) {
    fs.copyFileSync(localSrc, dest);
    return { fileName, source: "local", bytes: fs.statSync(dest).size };
  }

  const buf = await fetchBufferWithRetry(remoteUrl);
  fs.writeFileSync(dest, buf);
  return { fileName, source: remoteUrl, bytes: buf.byteLength };
}

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST_IMG, { recursive: true });
  fs.mkdirSync(DIST_CSS, { recursive: true });
  fs.mkdirSync(DIST_JS, { recursive: true });

  const tasks = [
    ...CAROUSEL_NEW_IMAGES.map((name) =>
      ensureImage(name, `${GH_RAW_BASE}/assets/img/${name}`)
    ),
    ...ORIGINAL_IMAGES.map((name) =>
      ensureImage(name, `${LIVE_CDN_BASE}/assets/img/${name}`)
    )
  ];

  const results = await Promise.all(tasks);
  let totalBytes = 0;
  for (const r of results) {
    totalBytes += r.bytes;
    console.log(`[img ok] ${r.fileName} (${(r.bytes / 1024).toFixed(1)} KB)`);
  }
  console.log(`Total de imagens verificadas: ${results.length}/30 (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);

  if (results.length !== 30) {
    throw new Error(`Esperadas 30 imagens, obtidas ${results.length}`);
  }

  const cssRaw = fs.readFileSync(path.join(__dirname, "assets/css/style.css"), "utf8");
  const cfgRaw = fs.readFileSync(path.join(__dirname, "assets/js/config.js"), "utf8");
  const quizRaw = fs.readFileSync(path.join(__dirname, "assets/js/quiz.js"), "utf8");
  const htmlRaw = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

  fs.writeFileSync(path.join(DIST_CSS, "style.css"), cssRaw, "utf8");
  fs.writeFileSync(path.join(DIST_JS, "config.js"), cfgRaw, "utf8");
  fs.writeFileSync(path.join(DIST_JS, "quiz.js"), quizRaw, "utf8");

  /* Gera HTML single-packet (CSS + JS inline + caminhos same-origin para HTTP/2 instantâneo no mobile) */
  let bundledHtml = htmlRaw
    .replace(/<link\s+rel="preconnect"\s+href="https:\/\/descompacto\.vercel\.app"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="dns-prefetch"\s+href="https:\/\/descompacto\.vercel\.app"[^>]*>\s*/gi, "")
    .replace(/https:\/\/descompacto\.vercel\.app\/assets\/img\//g, "assets/img/")
    .replace(
      /<link\s+rel="stylesheet"\s+href="assets\/css\/style\.css[^"]*">/i,
      () => `<style>${cssRaw}</style>`
    )
    .replace(
      /<script\s+src="assets\/js\/config\.js[^"]*"><\/script>/i,
      () => `<script>${cfgRaw.replace(/<\/script/gi, "<\\/script")}</script>`
    )
    .replace(
      /<script\s+src="assets\/js\/quiz\.js[^"]*"><\/script>/i,
      () => `<script>${quizRaw.replace(/<\/script/gi, "<\\/script")}</script>`
    );

  fs.writeFileSync(path.join(DIST, "index.html"), bundledHtml, "utf8");
  console.log(`[html ok] dist/index.html gerado (${(Buffer.byteLength(bundledHtml) / 1024).toFixed(1)} KB inline)`);
}

main().catch((err) => {
  console.error("[ERRO FATAL NO BUILD VERCEL]:", err);
  process.exit(1);
});
