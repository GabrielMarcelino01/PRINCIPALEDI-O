import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

function args(argv) {
  const options = {still: false, storyboard: false, preview: false, frame: 300, concurrency: 2};
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
    process.env.REMOTION_BROWSER, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ].find((candidate) => candidate && fs.existsSync(candidate));
}

function tagBt709(output) {
  const temporary = path.join(path.dirname(output), `.bt709-${process.pid}.mp4`);
  try {
    execFileSync(process.env.FFMPEG_PATH || 'ffmpeg', [
      '-y', '-nostdin', '-hide_banner', '-loglevel', 'error', '-i', output,
      '-map', '0', '-map_metadata', '0', '-c', 'copy',
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
  const options = args(process.argv.slice(2));
  if (options.help) {
    console.log('node closet4-render.mjs [--preview] [--output out/closet-4-final.mp4]\nnode closet4-render.mjs --still --frame 300 --output out/closet-4-capa.jpg\nnode closet4-render.mjs --storyboard\nnode closet4-render.mjs --still --safe-zones --output out/closet-4-safe-zones.jpg');
    return;
  }
  const project = JSON.parse(fs.readFileSync(path.join(root, 'closet-4-project.json'), 'utf8'));
  const extra = options.props ? JSON.parse(options.props) : {};
  if (!extra || Array.isArray(extra) || typeof extra !== 'object') throw new Error('--props precisa ser um objeto JSON.');
  if (options.safeZones) extra.showSafeZones = true;
  const inputProps = {project: {...project, ...extra}};
  const output = path.resolve(root, options.output || (options.still ? 'out/closet-4-capa.jpg' : 'out/closet-4-final.mp4'));
  const bundleDir = path.join(root, '.closet4-bundle');
  fs.rmSync(bundleDir, {recursive: true, force: true});
  fs.mkdirSync(path.dirname(output), {recursive: true});
  console.log(JSON.stringify({stage: 'bundle', composition: 'Closet4Reel'}));
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/Closet4Root.jsx'), outDir: bundleDir, publicDir: path.join(root, 'public')});
  const browserExecutable = browser();
  const composition = await selectComposition({serveUrl, id: 'Closet4Reel', inputProps, browserExecutable});
  if (options.storyboard) {
    const frames = [20, 43, 75, 111, 126, 163, 193, 235, 246, 294, 358, 387, 445, 508, 535, 592, 624, 633, 663, 686];
    const directory = path.join(root, 'out', 'closet-4-review');
    fs.rmSync(directory, {recursive: true, force: true});
    fs.mkdirSync(directory, {recursive: true});
    for (let index = 0; index < frames.length; index += 1) {
      const destination = path.join(directory, `${String(index + 1).padStart(2, '0')}-frame-${frames[index]}.jpg`);
      await renderStill({serveUrl, composition, inputProps, output: destination, frame: frames[index], browserExecutable, imageFormat: 'jpeg', jpegQuality: 94});
      console.log(JSON.stringify({stage: 'storyboard', frame: frames[index], output: destination}));
    }
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
    tagBt709(output);
    console.log(JSON.stringify({stage: 'color-metadata', space: 'bt709', range: 'tv', reencoded: false}));
  }
  console.log(JSON.stringify({stage: 'done', output: options.storyboard ? path.join(root, 'out', 'closet-4-review') : output, frames: composition.durationInFrames}));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
