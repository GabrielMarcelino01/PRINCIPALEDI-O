import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const options = {still: false, preview: false, frame: 55, concurrency: 2};
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

function browserExecutable() {
  const candidates = [
    process.env.REMOTION_BROWSER,
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(`Uso:
  node render.mjs [--output out/reels-pro-demo.mp4] [--preview] [--concurrency 2]
  node render.mjs --still --frame 55 --output out/capa.jpg
  node render.mjs --storyboard
  node render.mjs --still --safe-zones --output out/safe-zones.jpg

Defina REMOTION_BROWSER para um Chromium/Chrome já instalado, se necessário.
--props aceita um objeto JSON que será mesclado ao projeto.`);
    return;
  }
  if (!Number.isInteger(options.frame) || options.frame < 0) throw new Error('--frame precisa ser um inteiro não negativo.');
  if (!Number.isInteger(options.concurrency) || options.concurrency < 1) throw new Error('--concurrency precisa ser um inteiro positivo.');
  const project = JSON.parse(fs.readFileSync(path.join(root, 'project.json'), 'utf8'));
  const extra = options.props ? JSON.parse(options.props) : {};
  if (!extra || Array.isArray(extra) || typeof extra !== 'object') throw new Error('--props precisa ser um objeto JSON.');
  if (options.safeZones) extra.showSafeZones = true;
  const inputProps = {project: {...project, ...extra}};
  const destination = path.resolve(root, options.output || (options.still ? 'out/capa.jpg' : 'out/reels-pro-demo.mp4'));
  const bundleDir = path.join(root, '.bundle');
  fs.rmSync(bundleDir, {recursive: true, force: true});
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  console.log(JSON.stringify({stage: 'bundle', entry: 'src/Root.jsx'}));
  const serveUrl = await bundle({
    entryPoint: path.join(root, 'src/Root.jsx'),
    outDir: bundleDir,
    publicDir: path.join(root, 'public'),
  });
  const executable = browserExecutable();
  const composition = await selectComposition({
    serveUrl, id: 'ReelsPro', inputProps, browserExecutable: executable,
  });
  if (options.storyboard) {
    const reviewFrames = [55, 250, 430, 620, 850, 1100];
    const reviewDir = path.join(root, 'out', 'review');
    fs.mkdirSync(reviewDir, {recursive: true});
    for (let index = 0; index < reviewFrames.length; index += 1) {
      const frame = reviewFrames[index];
      const output = path.join(reviewDir, `${String(index + 1).padStart(2, '0')}-${project.scenes[index].id}.jpg`);
      await renderStill({serveUrl, composition, inputProps, output, frame, browserExecutable: executable, imageFormat: 'jpeg', jpegQuality: 92});
      console.log(JSON.stringify({stage: 'storyboard', frame, output}));
    }
  } else if (options.still) {
    if (options.frame >= composition.durationInFrames) throw new Error(`Frame ${options.frame} fora da composição de ${composition.durationInFrames} frames.`);
    await renderStill({
      serveUrl, composition, inputProps, output: destination,
      frame: options.frame, browserExecutable: executable,
      imageFormat: destination.toLowerCase().endsWith('.png') ? 'png' : 'jpeg',
      jpegQuality: 94,
    });
  } else {
    let lastProgress = -10;
    await renderMedia({
      serveUrl, composition, inputProps, outputLocation: destination,
      codec: 'h264', crf: options.preview ? 23 : 17,
      pixelFormat: 'yuv420p', colorSpace: 'bt709', audioCodec: 'aac', audioBitrate: '256k',
      videoImageFormat: 'jpeg', jpegQuality: 94,
      concurrency: options.concurrency, browserExecutable: executable,
      scale: options.preview ? 0.5 : 1,
      onProgress: ({progress}) => {
        const percentage = Math.floor(progress * 100);
        if (percentage >= lastProgress + 5 || percentage === 100) {
          lastProgress = percentage;
          console.log(JSON.stringify({stage: 'render', progress: percentage}));
        }
      },
    });
  }
  console.log(JSON.stringify({stage: 'done', output: destination, composition: composition.id, frames: composition.durationInFrames}));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
