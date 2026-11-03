import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { createReadStream, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);
const FFMPEG = require("@ffmpeg-installer/ffmpeg").path;
const ROOT = fileURLToPath(new URL("./", import.meta.url));
const project = JSON.parse(readFileSync(resolve(ROOT, "project.json"), "utf8"));
const source = resolve(ROOT, "../assets/armario-8/CLOSET-8.mp4");
const output = resolve(ROOT, "out/source-frames");
mkdirSync(output, { recursive: true });
mkdirSync(resolve(ROOT, "reports"), { recursive: true });

function digest(path) {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash("sha256");
    createReadStream(path).on("data", (chunk) => hash.update(chunk)).on("end", () => resolvePromise(hash.digest("hex"))).on("error", reject);
  });
}
const sourceHash = await digest(source);
if (sourceHash !== project.sourceSha256) throw new Error(`Fonte divergente: ${sourceHash}`);

await new Promise((resolvePromise, reject) => {
  const child = spawn(FFMPEG, [
    "-y", "-nostdin", "-hide_banner", "-i", source, "-an",
    "-vf", `tpad=stop_mode=clone:stop_duration=0.1,fps=${project.fps}`,
    "-frames:v", String(project.frames), "-start_number", "0", "-q:v", "1",
    resolve(output, "%05d.jpg"),
  ], { stdio: ["ignore", "inherit", "inherit"] });
  child.on("error", reject);
  child.on("close", (code) => code === 0 ? resolvePromise() : reject(new Error(`FFmpeg saiu com ${code}`)));
});

const names = readdirSync(output).filter((name) => /^\d{5}\.jpg$/.test(name)).sort();
const expected = Array.from({ length: project.frames }, (_, index) => `${String(index).padStart(5, "0")}.jpg`);
if (JSON.stringify(names) !== JSON.stringify(expected)) throw new Error(`Sequência-fonte divergente: ${names.length} quadros`);
const manifest = createHash("sha256");
for (const name of names) manifest.update(name).update(await digest(resolve(output, name)));
const report = {
  source_sha256: sourceHash,
  source_frames: project.frames,
  source_frames_directory: "out/source-frames",
  sequence_manifest_sha256: manifest.digest("hex"),
  method: "Upload original -> tpad + fps=60 -> JPEG q1 indexado; o Chromium lê o arquivo do quadro, sem seek de vídeo",
};
writeFileSync(resolve(ROOT, "reports/source-normalization.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ event: "done", output, frames: names.length, sequence_manifest_sha256: report.sequence_manifest_sha256 }));
