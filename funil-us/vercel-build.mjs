import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const SRC_IMG = path.join(ROOT, "assets", "img");
const DIST_IMG = path.join(DIST, "assets", "img");

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST_IMG, { recursive: true });
fs.mkdirSync(path.join(DIST, "assets", "css"), { recursive: true });
fs.mkdirSync(path.join(DIST, "assets", "js"), { recursive: true });

// 1. Copy all local US editorial images into dist/assets/img
const imgs = fs.readdirSync(SRC_IMG).filter((f) => /\.(jpe?g|png|webp|svg)$/i.test(f));
for (const name of imgs) {
  fs.copyFileSync(path.join(SRC_IMG, name), path.join(DIST_IMG, name));
}
console.log(`✓ Copied ${imgs.length} US editorial images to dist/assets/img/`);

// 2. Copy static CSS & JS fallbacks + inline critical CSS/JS into dist/index.html for 0-RTT instant paint
const cssRaw = fs.readFileSync(path.join(ROOT, "assets", "css", "style.css"), "utf8");
const cfgRaw = fs.readFileSync(path.join(ROOT, "assets", "js", "config.js"), "utf8");
const quizRaw = fs.readFileSync(path.join(ROOT, "assets", "js", "quiz.js"), "utf8");

fs.writeFileSync(path.join(DIST, "assets", "css", "style.css"), cssRaw);
fs.writeFileSync(path.join(DIST, "assets", "js", "config.js"), cfgRaw);
fs.writeFileSync(path.join(DIST, "assets", "js", "quiz.js"), quizRaw);

const minCss = cssRaw
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,])\s*/g, "$1")
  .trim();

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
html = html.replace(
  /<link\s+rel="stylesheet"\s+href="assets\/css\/style\.css[^"]*"\s*>/i,
  () => `<style>${minCss}</style>`
);
html = html.replace(
  /<script\s+src="assets\/js\/config\.js[^"]*"><\/script>\s*<script\s+src="assets\/js\/quiz\.js[^"]*"><\/script>/i,
  () => `<script>${cfgRaw}\n${quizRaw}</script>`
);
fs.writeFileSync(path.join(DIST, "index.html"), html);
console.log(`✓ Built single-RTT US Funnel dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);

// 3. Bundle English Member Web App (/app) into dist/app
const APP_SRC = path.join(ROOT, "app");
const APP_DIST = path.join(DIST, "app");
fs.mkdirSync(APP_DIST, { recursive: true });

for (const asset of ["manifest.webmanifest", "sw.js", "icon-192.png", "icon-512.png", "app.css", "app.js"]) {
  const s = path.join(APP_SRC, asset);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(APP_DIST, asset));
}

const appCss = fs.readFileSync(path.join(APP_SRC, "app.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,])\s*/g, "$1")
  .trim();
const appJs = fs.readFileSync(path.join(APP_SRC, "app.js"), "utf8");
let appHtml = fs.readFileSync(path.join(APP_SRC, "index.html"), "utf8");

appHtml = appHtml.replace(
  /<link\s+rel="stylesheet"\s+href="app\.css[^"]*"\s*>/i,
  () => `<style>${appCss}</style>`
);
appHtml = appHtml.replace(
  /<script\s+src="app\.js[^"]*"><\/script>/i,
  () => `<script>${appJs}</script>`
);
fs.writeFileSync(path.join(APP_DIST, "index.html"), appHtml);
console.log(`✓ Built single-RTT US Member PWA dist/app/index.html (${(Buffer.byteLength(appHtml) / 1024).toFixed(1)} KB)`);
