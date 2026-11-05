import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const DIST_IMG = path.join(DIST, "assets", "img");

const GIT_REF = process.env.LUMINA_GIT_SHA || "arena/0045d78d-principaledi-o";
const GH_RAW_BASE = `https://raw.githubusercontent.com/GabrielMarcelino01/PRINCIPALEDI-O/${GIT_REF}/funil-us`;

const REQUIRED_IMGS = [
  "hero-banner-v2-en.webp",
  "age-18-29.jpg",
  "age-30-39.jpg",
  "age-40-49.jpg",
  "age-50-plus.jpg",
  "app-preview-3d-en.jpg",
  "before-after-cover-en.jpg",
  "before-after-1-en.jpg",
  "before-after-2-en.jpg",
  "before-after-3-en.jpg",
  "bonus-planner-en.jpg",
  "bonus-closet-en.jpg",
  "bonus-tryon-en.jpg",
  "mockup-vip-3d-en.jpg",
  "triptych-looks-en.jpg"
];

const APP_ICONS = ["icon-192.png", "icon-512.png"];

async function readTextAsset(relPath) {
  const localPath = path.join(ROOT, relPath);
  if (fs.existsSync(localPath)) return fs.readFileSync(localPath, "utf8");
  const url = `${GH_RAW_BASE}/${relPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch text ${url}: HTTP ${res.status}`);
  return await res.text();
}

async function ensureBinaryAsset(relPath, destPath) {
  const localPath = path.join(ROOT, relPath);
  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 100) {
    fs.copyFileSync(localPath, destPath);
    return "local";
  }
  const url = `${GH_RAW_BASE}/${relPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch binary ${url}: HTTP ${res.status}`);
  fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
  return "remote";
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST_IMG, { recursive: true });
fs.mkdirSync(path.join(DIST, "assets", "css"), { recursive: true });
fs.mkdirSync(path.join(DIST, "assets", "js"), { recursive: true });

// 1. Prepare all 14 3D & editorial US images
const imgModes = await Promise.all(
  REQUIRED_IMGS.map((name) => ensureBinaryAsset(`assets/img/${name}`, path.join(DIST_IMG, name)))
);
console.log(`Prepared ${REQUIRED_IMGS.length} US 3D & editorial images (${imgModes[0]})`);

// 2. Bundle single-RTT US Funnel dist/index.html
const [cssRaw, cfgRaw, quizRaw, indexRaw] = await Promise.all([
  readTextAsset("assets/css/style.css"),
  readTextAsset("assets/js/config.js"),
  readTextAsset("assets/js/quiz.js"),
  readTextAsset("index.html")
]);

fs.writeFileSync(path.join(DIST, "assets", "css", "style.css"), cssRaw);
fs.writeFileSync(path.join(DIST, "assets", "js", "config.js"), cfgRaw);
fs.writeFileSync(path.join(DIST, "assets", "js", "quiz.js"), quizRaw);

const minCss = cssRaw
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,])\s*/g, "$1")
  .trim();

const html = indexRaw
  .replace(/<link\s+rel="stylesheet"\s+href="assets\/css\/style\.css[^"]*"\s*>/i, () => `<style>${minCss}</style>`)
  .replace(
    /<script\s+src="assets\/js\/config\.js[^"]*"><\/script>\s*<script\s+src="assets\/js\/quiz\.js[^"]*"><\/script>/i,
    () => `<script>${cfgRaw}\n${quizRaw}</script>`
  );

fs.writeFileSync(path.join(DIST, "index.html"), html);
console.log(`Built single-RTT US Funnel dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);

// 3. Bundle single-RTT English Member Web App dist/app/index.html
const APP_DIST = path.join(DIST, "app");
fs.mkdirSync(APP_DIST, { recursive: true });

const [manifestRaw, swRaw, appCssRaw, appJsRaw, appIndexRaw] = await Promise.all([
  readTextAsset("app/manifest.webmanifest"),
  readTextAsset("app/sw.js"),
  readTextAsset("app/app.css"),
  readTextAsset("app/app.js"),
  readTextAsset("app/index.html")
]);

fs.writeFileSync(path.join(APP_DIST, "manifest.webmanifest"), manifestRaw);
fs.writeFileSync(path.join(APP_DIST, "sw.js"), swRaw);
fs.writeFileSync(path.join(APP_DIST, "app.css"), appCssRaw);
fs.writeFileSync(path.join(APP_DIST, "app.js"), appJsRaw);

await Promise.all(
  APP_ICONS.map((ic) => ensureBinaryAsset(`app/${ic}`, path.join(APP_DIST, ic)))
);

const minAppCss = appCssRaw
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,])\s*/g, "$1")
  .trim();

const appHtml = appIndexRaw
  .replace(/<link\s+rel="stylesheet"\s+href="app\.css[^"]*"\s*>/i, () => `<style>${minAppCss}</style>`)
  .replace(/<script\s+src="app\.js[^"]*"><\/script>/i, () => `<script>${appJsRaw}</script>`);

fs.writeFileSync(path.join(APP_DIST, "index.html"), appHtml);
console.log(`Built single-RTT US Member PWA dist/app/index.html (${(Buffer.byteLength(appHtml) / 1024).toFixed(1)} KB)`);
