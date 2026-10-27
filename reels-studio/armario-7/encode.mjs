import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);
const FFMPEG = require("@ffmpeg-installer/ffmpeg").path;
const ROOT = fileURLToPath(new URL("./", import.meta.url));
const project = JSON.parse(readFileSync(resolve(ROOT, "project.json"), "utf8"));
const OUT = resolve(ROOT, "out");
const REPORTS = resolve(ROOT, "reports");
const DELIVERY = resolve(ROOT, "../../entregas/ARMARIO-7-EDITADO.mp4");
const SOURCE = resolve(ROOT, "../assets/armario-7/ARMARIO-7.mp4");
mkdirSync(OUT, { recursive: true });
mkdirSync(REPORTS, { recursive: true });
mkdirSync(resolve(DELIVERY, ".."), { recursive: true });

for (let frame = 0; frame < project.frames; frame += 1) {
  const path = resolve(OUT, `frames/${String(frame).padStart(5, "0")}.jpg`);
  if (!existsSync(path)) throw new Error(`Quadro ausente: ${path}`);
}

function run(args, capture = false) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(FFMPEG, ["-nostdin", "-hide_banner", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      if (!capture) process.stderr.write(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`FFmpeg saiu com ${code}\n${stderr}`));
      else resolvePromise({ stdout, stderr });
    });
  });
}

function measuredJson(text) {
  const matches = [...text.matchAll(/\{\s*"input_i"[\s\S]*?\}/g)];
  if (!matches.length) throw new Error(`Medição loudnorm não encontrada:\n${text}`);
  return JSON.parse(matches.at(-1)[0]);
}

function loudnormApply(measured, target) {
  return `loudnorm=I=${target.i}:TP=${target.tp}:LRA=${target.lra}:linear=true:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:print_format=summary`;
}

console.log(JSON.stringify({ event: "encode-video", frames: project.frames, fps: project.fps }));
await run([
  "-y", "-framerate", String(project.fps), "-start_number", "0",
  "-i", resolve(OUT, "frames/%05d.jpg"), "-frames:v", String(project.frames),
  "-vf", "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p",
  "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.2",
  "-color_range", "tv", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
  "-movflags", "+faststart", resolve(OUT, "video-silent.mp4"),
]);

const audioTarget = { i: -14, tp: -1.5, lra: 9 };
console.log(JSON.stringify({ event: "measure-original-audio" }));
const audioMeasureResult = await run([
  "-i", SOURCE, "-vn", "-af", `loudnorm=I=${audioTarget.i}:TP=${audioTarget.tp}:LRA=${audioTarget.lra}:print_format=json`, "-f", "null", "-",
], true);
const audioMeasured = measuredJson(audioMeasureResult.stderr);
await run([
  "-y", "-i", SOURCE, "-vn", "-af", `${loudnormApply(audioMeasured, audioTarget)},apad`,
  "-t", String(project.duration), "-ac", "2", "-ar", "48000", "-c:a", "pcm_s24le", resolve(OUT, "final-audio.wav"),
]);

console.log(JSON.stringify({ event: "mux", delivery: DELIVERY }));
await run([
  "-y", "-i", resolve(OUT, "video-silent.mp4"), "-i", resolve(OUT, "final-audio.wav"),
  "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
  "-ar", "48000", "-ac", "2", "-t", String(project.duration), "-movflags", "+faststart", DELIVERY,
]);

const report = {
  project: project.id,
  frames: project.frames,
  fps: project.fps,
  duration: project.duration,
  source: { original: "reels-studio/assets/armario-7/ARMARIO-7.mp4", sha256: project.sourceSha256, indexed_frames: project.frames },
  video: { codec: "H.264 High", crf: 17, preset: "slow", pixel_format: "yuv420p", color: "BT.709 limited range" },
  audio: { source: "Somente o áudio original; sem trilha, sound design ou efeitos", target: audioTarget, measured: audioMeasured, aac_bitrate: "192k" },
  delivery: "entregas/ARMARIO-7-EDITADO.mp4",
};
writeFileSync(resolve(REPORTS, "encode.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ event: "done", delivery: DELIVERY }));
