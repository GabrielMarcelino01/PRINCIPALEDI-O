import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Chromium, { inflate } from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const ROOT = fileURLToPath(new URL("./", import.meta.url));
const project = JSON.parse(readFileSync(resolve(ROOT, "project.json"), "utf8"));
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const output = resolve(ROOT, option("--output", "out/frames"));
const quality = Number(option("--quality", "94"));
const spec = option("--frames", "all");
const skipExisting = args.includes("--skip-existing");
const frames = spec === "all"
  ? Array.from({ length: project.frames }, (_, index) => index)
  : spec.split(",").filter(Boolean).map((value) => {
      const frame = Number(value);
      if (!Number.isInteger(frame) || frame < 0 || frame >= project.frames) throw new Error(`Quadro inválido: ${value}`);
      return frame;
    });

mkdirSync(output, { recursive: true });
Chromium.setGraphicsMode = false;
const executablePath = await Chromium.executablePath();
const libs = await inflate(resolve(ROOT, "node_modules/@sparticuz/chromium/bin/al2023.tar.br"));
process.env.LD_LIBRARY_PATH = `${libs}/lib${process.env.LD_LIBRARY_PATH ? `:${process.env.LD_LIBRARY_PATH}` : ""}`;
process.env.FONTCONFIG_PATH ??= "/tmp/fonts";

let browser;
const started = performance.now();
let captured = 0;
try {
  browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--allow-file-access-from-files",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-webgl",
      "--force-color-profile=srgb",
      "--hide-scrollbars",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: project.width, height: project.height, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => console.error("[page]", error));
  await page.goto(pathToFileURL(resolve(ROOT, "index.html")).href, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.__compositionReady === true || Boolean(window.__compositionError), { timeout: 60000 });
  const initError = await page.evaluate(() => window.__compositionError || null);
  if (initError) throw new Error(initError);
  console.log(JSON.stringify({ event: "ready", browser: await browser.version(), frames: frames.length, output, quality }));

  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    const file = resolve(output, `${String(frame).padStart(5, "0")}.jpg`);
    if (skipExisting && existsSync(file) && statSync(file).size > 1000) continue;
    const t = frame / project.fps;
    const state = await page.evaluate((time) => window.seekAndRender(time), t);
    if (state.frame !== frame) throw new Error(`Estado divergente no quadro ${frame}: ${JSON.stringify(state)}`);
    const temporary = `${file}.tmp.jpg`;
    await page.screenshot({ path: temporary, type: "jpeg", quality, fromSurface: true, captureBeyondViewport: false });
    renameSync(temporary, file);
    captured += 1;
    if (index === 0 || (index + 1) % 30 === 0 || index === frames.length - 1) {
      const elapsed = (performance.now() - started) / 1000;
      const completed = index + 1;
      const rate = completed / elapsed;
      const eta = Math.max(0, (frames.length - completed) / rate);
      console.log(JSON.stringify({ event: "frame", completed, total: frames.length, frame, scene: state.scene, seconds: Number(elapsed.toFixed(1)), fps: Number(rate.toFixed(2)), eta: Number(eta.toFixed(1)) }));
    }
  }
  writeFileSync(resolve(output, "manifest.json"), JSON.stringify({ project: project.id, width: project.width, height: project.height, fps: project.fps, quality, frames, captured }, null, 2) + "\n");
  console.log(JSON.stringify({ event: "done", captured, skipped: frames.length - captured, seconds: Number(((performance.now() - started) / 1000).toFixed(1)) }));
} finally {
  if (browser) await browser.close();
}
