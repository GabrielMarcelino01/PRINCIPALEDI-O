import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const options = {still: false, storyboard: false, preview: false, frame: 0, concurrency: 1};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--still') options.still = true;
    else if (argument === '--storyboard') options.storyboard = true;
    else if (argument === '--preview') options.preview = true;
    else if (argument === '--safe-zones') options.safeZones = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (['--output', '--frame', '--props', '--concurrency'].includes(argument)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} precisa de um valor.`);
      const key = argument.slice(2);
      options[key] = key === 'frame' || key === 'concurrency' ? Number(value) : value;
      index += 1;
    } else throw new Error(`Opção desconhecida: ${argument}`);
  }
  return options;
}

function browser() {
  return [
    process.env.REMOTION_BROWSER, '/tmp/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].find((candidate) => candidate && fs.existsSync(candidate));
}

function finishDelivery(output) {
  const temporary = path.join(path.dirname(output), `.finish-${process.pid}.mp4`);
  const original = path.join(root, 'assets', 'original.mp4');
  try {
    execFileSync(process.env.FFMPEG_PATH || 'ffmpeg', [
      '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
      '-i', output, '-i', original,
      '-map', '0:v:0', '-map', '1:a:0', '-map_metadata', '0', '-c:v', 'copy', '-c:a', 'copy',
      '-bsf:v', 'h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
      '-movflags', '+faststart', temporary,
    ], {stdio: 'inherit'});
    fs.renameSync(temporary, output);
  } catch (error) {
    fs.rmSync(temporary, {force: true});
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log('node closet-10-render.mjs [--preview] [--output ../../entregas/CLOSET-10-EDITADO.mp4]\nnode closet-10-render.mjs --storyboard\nnode closet-10-render.mjs --still --frame 60 --output out/quadro.jpg');
    return;
  }
  const project = JSON.parse(fs.readFileSync(path.join(root, 'closet-10-project.json'), 'utf8'));
  const extra = options.props ? JSON.parse(options.props) : {};
  if (!extra || Array.isArray(extra) || typeof extra !== 'object') throw new Error('--props precisa ser um objeto JSON.');
  if (options.safeZones) extra.showSafeZones = true;
  const inputProps = {project: {...project, ...extra}};
  const defaultOutput = options.still
    ? 'out/closet-10-capa.jpg'
    : options.preview ? 'out/closet-10-preview.mp4' : '../../entregas/CLOSET-10-EDITADO.mp4';
  const output = path.resolve(root, options.output || defaultOutput);
  const bundleDir = path.join(root, '.bundle');
  fs.rmSync(bundleDir, {recursive: true, force: true});
  fs.mkdirSync(path.dirname(output), {recursive: true});
  console.log(JSON.stringify({stage: 'bundle', composition: 'Closet10Reel'}));
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/Closet10Root.jsx'), outDir: bundleDir, publicDir: path.join(root, 'public')});
  const browserExecutable = browser();
  const composition = await selectComposition({serveUrl, id: 'Closet10Reel', inputProps, browserExecutable});
  if (options.storyboard) {
    const candidates = [
      0,
      ...project.groups.map((group) => Math.max(0, Math.ceil((group.end - 0.14) * project.fps))),
      ...project.cuts.map((cut) => Math.floor(cut * project.fps)),
      project.durationInFrames - 1,
    ];
    const frames = [...new Set(candidates)].filter((frame) => frame >= 0 && frame < project.durationInFrames).sort((a, b) => a - b);
    const directory = path.join(root, 'out', 'review');
    fs.rmSync(directory, {recursive: true, force: true});
    fs.mkdirSync(directory, {recursive: true});
    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index];
      const destination = path.join(directory, `${String(index + 1).padStart(2, '0')}-frame-${frame}.jpg`);
      await renderStill({serveUrl, composition, inputProps, output: destination, frame, browserExecutable, imageFormat: 'jpeg', jpegQuality: 95});
      console.log(JSON.stringify({stage: 'storyboard', frame, output: destination}));
    }
    fs.writeFileSync(path.join(directory, 'frames.json'), JSON.stringify(frames, null, 2) + '\n');
  } else if (options.still) {
    if (!Number.isInteger(options.frame) || options.frame < 0 || options.frame >= composition.durationInFrames) throw new Error('Frame fora da composição.');
    await renderStill({serveUrl, composition, inputProps, output, frame: options.frame, browserExecutable, imageFormat: output.endsWith('.png') ? 'png' : 'jpeg', jpegQuality: 95});
  } else {
    let previous = -10;
    await renderMedia({
      serveUrl, composition, inputProps, outputLocation: output,
      codec: 'h264', crf: options.preview ? 23 : 16, x264Preset: 'slow',
      pixelFormat: 'yuv420p', colorSpace: 'bt709', audioCodec: 'aac', audioBitrate: '256k',
      videoImageFormat: 'jpeg', jpegQuality: 95, concurrency: options.concurrency,
      browserExecutable, scale: options.preview ? 0.5 : 1,
      onProgress: ({progress}) => {
        const value = Math.floor(progress * 100);
        if (value >= previous + 10 || value === 100) {
          previous = value;
          console.log(JSON.stringify({stage: 'render', progress: value}));
        }
      },
    });
    finishDelivery(output);
    console.log(JSON.stringify({stage: 'finish', space: 'bt709', range: 'tv', videoReencoded: false, audio: 'original-aac-copy'}));
  }
  console.log(JSON.stringify({stage: 'done', output: options.storyboard ? path.join(root, 'out', 'review') : output, frames: composition.durationInFrames}));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
