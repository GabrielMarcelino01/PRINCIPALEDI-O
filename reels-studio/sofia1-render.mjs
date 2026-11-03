import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const options = {still: false, storyboard: false, preview: false, frame: 60, concurrency: 2, output: null, props: null, safeZones: false};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--still') options.still = true;
    else if (argument === '--storyboard') options.storyboard = true;
    else if (argument === '--preview') options.preview = true;
    else if (argument === '--safe-zones') options.safeZones = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (['--output', '--frame', '--concurrency', '--props'].includes(argument)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} precisa de um valor.`);
      const key = argument.slice(2);
      options[key] = ['frame', 'concurrency'].includes(key) ? Number(value) : value;
      index += 1;
    } else throw new Error(`Opção desconhecida: ${argument}`);
  }
  return options;
}

function browser() {
  return [process.env.REMOTION_BROWSER, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((candidate) => candidate && fs.existsSync(candidate));
}

function finalizeMaster(output, audio, duration) {
  const temporary = path.join(path.dirname(output), `.sofia-final-${process.pid}.mp4`);
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  try {
    execFileSync(ffmpeg, ['-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
      '-i', output, '-i', audio,
      '-map', '0:v:0', '-map', '1:a:0', '-map_metadata', '0',
      '-c:v', 'copy',
      '-bsf:v', 'h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
      '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
      '-t', duration.toFixed(6), '-movflags', '+faststart', temporary], {stdio: 'inherit'});
    fs.renameSync(temporary, output);
  } catch (error) {
    fs.rmSync(temporary, {force: true});
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log('node sofia1-render.mjs [--preview] [--output out/sofia-1-final.mp4]\nnode sofia1-render.mjs --still --frame 60 --output out/sofia-1-capa.jpg\nnode sofia1-render.mjs --storyboard');
    return;
  }
  const project = JSON.parse(fs.readFileSync(path.join(root, 'sofia-1-project.json'), 'utf8'));
  const extra = options.props ? JSON.parse(options.props) : {};
  if (!extra || Array.isArray(extra) || typeof extra !== 'object') throw new Error('--props precisa ser um objeto JSON.');
  if (options.safeZones) extra.showSafeZones = true;
  const inputProps = {project: {...project, ...extra}};
  const output = path.resolve(root, options.output || (options.still ? 'out/sofia-1-capa.jpg' : 'out/sofia-1-final.mp4'));
  const bundleDir = path.join(root, '.sofia1-bundle');
  fs.rmSync(bundleDir, {recursive: true, force: true});
  fs.mkdirSync(path.dirname(output), {recursive: true});
  console.log(JSON.stringify({stage: 'bundle', composition: 'Sofia1Reel'}));
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/Sofia1Root.jsx'), outDir: bundleDir, publicDir: path.join(root, 'public')});
  const browserExecutable = browser();
  const composition = await selectComposition({serveUrl, id: 'Sofia1Reel', inputProps, browserExecutable});
  if (options.storyboard) {
    const frames = [12, 102, 156, 258, 318, 432, 510, 612, 690, 798, 858, 972, 1044, 1140, 1212, 1320, 1390, 1450, 1490];
    const directory = path.join(root, 'out', 'sofia-1-review');
    fs.rmSync(directory, {recursive: true, force: true});
    fs.mkdirSync(directory, {recursive: true});
    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index];
      const destination = path.join(directory, `${String(index + 1).padStart(2, '0')}-frame-${frame}.jpg`);
      await renderStill({serveUrl, composition, inputProps, output: destination, frame, browserExecutable, imageFormat: 'jpeg', jpegQuality: 94});
      console.log(JSON.stringify({stage: 'storyboard', frame, output: destination}));
    }
  } else if (options.still) {
    if (!Number.isInteger(options.frame) || options.frame < 0 || options.frame >= composition.durationInFrames) throw new Error('Frame fora da composição.');
    await renderStill({serveUrl, composition, inputProps, output, frame: options.frame, browserExecutable, imageFormat: output.endsWith('.png') ? 'png' : 'jpeg', jpegQuality: 95});
  } else {
    let previous = -10;
    await renderMedia({
      serveUrl, composition, inputProps, outputLocation: output,
      codec: 'h264', crf: options.preview ? 23 : 16, x264Preset: options.preview ? 'medium' : 'slow',
      pixelFormat: 'yuv420p', colorSpace: 'bt709', audioCodec: 'aac', audioBitrate: '256k',
      videoImageFormat: 'jpeg', jpegQuality: 95, concurrency: options.concurrency,
      browserExecutable, scale: options.preview ? 0.5 : 1, muted: true,
      onProgress: ({progress}) => {
        const value = Math.floor(progress * 100);
        if (value >= previous + 10 || value === 100) {
          previous = value;
          console.log(JSON.stringify({stage: 'render', progress: value}));
        }
      },
    });
    finalizeMaster(output, path.join(root, 'public', project.audio), composition.durationInFrames / composition.fps);
    console.log(JSON.stringify({stage: 'final-audio-color', audio: 'FFmpeg AAC 256k', space: 'bt709', range: 'tv'}));
  }
  console.log(JSON.stringify({stage: 'done', output: options.storyboard ? path.join(root, 'out', 'sofia-1-review') : output, frames: composition.durationInFrames}));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
