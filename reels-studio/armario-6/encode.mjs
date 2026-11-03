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
const DELIVERY = resolve(ROOT, "../../entregas/ARMARIO-6-EDITADO.mp4");
const SOURCE = resolve(ROOT, "../assets/armario-6/ARMARIO-6.mp4");
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

const voicePre = "highpass=f=65,acompressor=threshold=0.1:ratio=2:attack=8:release=90:makeup=1";
const voiceTarget = { i: -16, tp: -2, lra: 7 };
console.log(JSON.stringify({ event: "measure-voice" }));
const voiceMeasureResult = await run([
  "-i", SOURCE, "-vn", "-af", `${voicePre},loudnorm=I=${voiceTarget.i}:TP=${voiceTarget.tp}:LRA=${voiceTarget.lra}:print_format=json`, "-f", "null", "-",
], true);
const voiceMeasured = measuredJson(voiceMeasureResult.stderr);
await run([
  "-y", "-i", SOURCE, "-vn", "-af", `${voicePre},${loudnormApply(voiceMeasured, voiceTarget)},apad`,
  "-t", String(project.duration), "-ac", "2", "-ar", "48000", "-c:a", "pcm_s24le", resolve(OUT, "voice.wav"),
]);

console.log(JSON.stringify({ event: "mix" }));
await run([
  "-y", "-i", resolve(OUT, "voice.wav"), "-i", resolve(OUT, "design-bed.wav"),
  "-filter_complex", "[1:a]volume=0.32[bed];[0:a][bed]amix=inputs=2:duration=first:dropout_transition=0,volume=2.0,alimiter=limit=0.9:level=false[mix]",
  "-map", "[mix]", "-t", String(project.duration), "-ac", "2", "-ar", "48000", "-c:a", "pcm_s24le", resolve(OUT, "mix.wav"),
]);

const mixTarget = { i: -14, tp: -1, lra: 9 };
console.log(JSON.stringify({ event: "measure-mix" }));
const mixMeasureResult = await run([
  "-i", resolve(OUT, "mix.wav"), "-af", `loudnorm=I=${mixTarget.i}:TP=${mixTarget.tp}:LRA=${mixTarget.lra}:print_format=json`, "-f", "null", "-",
], true);
const mixMeasured = measuredJson(mixMeasureResult.stderr);
await run([
  "-y", "-i", resolve(OUT, "mix.wav"), "-af", loudnormApply(mixMeasured, mixTarget),
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
  source: { original: "reels-studio/assets/armario-6/ARMARIO-6.mp4", sha256: project.sourceSha256, indexed_frames: project.frames },
  video: { codec: "H.264 High", crf: 17, preset: "slow", pixel_format: "yuv420p", color: "BT.709 limited range" },
  audio: { voice_target: voiceTarget, voice_measured: voiceMeasured, mix_target: mixTarget, mix_measured: mixMeasured, bed_gain: 0.32, aac_bitrate: "192k" },
  delivery: "entregas/ARMARIO-6-EDITADO.mp4",
};
writeFileSync(resolve(REPORTS, "encode.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ event: "done", delivery: DELIVERY }));
