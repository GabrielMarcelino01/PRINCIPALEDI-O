#!/usr/bin/env node
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const ffprobe = require('ffprobe-static').path;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const result = {storyboard: false, cleanFrames: false};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === '--storyboard') result.storyboard = true;
    else if (item === '--clean-frames') result.cleanFrames = true;
    else if (item.startsWith('--')) {
      const key = item.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      result[key] = argv[index + 1];
      index += 1;
    }
  }
  return result;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {stdio: ['ignore', 'pipe', 'pipe']});
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({stdout, stderr});
      else reject(new Error(`${path.basename(command)} saiu com código ${code}:\n${stderr}`));
    });
  });
}

function staticServer(root) {
  const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'};
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://local');
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      const file = path.resolve(root, relative || 'index.html');
      if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const body = await fs.readFile(file);
      response.writeHead(200, {'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store'});
      response.end(body);
    } catch (error) {
      response.writeHead(404).end('Not found');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({server, origin: `http://127.0.0.1:${address.port}`});
    });
  });
}

async function browserConfiguration() {
  const explicit = process.env.CHROMIUM_PATH || process.env.REMOTION_BROWSER;
  if (explicit) {
    return {
      executablePath: explicit,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-color-profile=srgb'],
      env: process.env,
      provider: 'CHROMIUM_PATH',
    };
  }
  const moduleUrl = new URL('../node_modules/@sparticuz/chromium/build/index.js', import.meta.url);
  const {default: Chromium, inflate} = await import(moduleUrl.href);
  Chromium.setGraphicsMode = false;
  const executablePath = await Chromium.executablePath();
  const packaged = path.resolve(scriptDir, '../node_modules/@sparticuz/chromium/bin/al2023.tar.br');
  const libraryDir = path.join(os.tmpdir(), 'al2023', 'lib');
  if (existsSync(packaged) && !existsSync(path.join(libraryDir, 'libnspr4.so'))) await inflate(packaged);
  return {
    executablePath,
    args: [...Chromium.args, '--disable-dev-shm-usage', '--hide-scrollbars', '--force-color-profile=srgb'],
    env: {
      ...process.env,
      LD_LIBRARY_PATH: [libraryDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':'),
      FONTCONFIG_PATH: path.join(os.tmpdir(), 'fonts'),
    },
    provider: '@sparticuz/chromium',
  };
}

const sha256 = async (file) => createHash('sha256').update(await fs.readFile(file)).digest('hex');
const frameName = (frame) => `frame-${String(frame).padStart(6, '0')}.png`;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.page || !options.config) throw new Error('Use --page <html> e --config <timeline.json>.');
  const root = path.resolve(options.root || '.');
  const pageFile = path.resolve(root, options.page);
  const configFile = path.resolve(root, options.config);
  const relativePage = path.relative(root, pageFile);
  if (relativePage.startsWith('..') || path.isAbsolute(relativePage)) throw new Error('A página precisa estar dentro de --root.');
  const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
  const {width, height, fps, durationInFrames} = config;
  if (!width || !height || !fps || !durationInFrames) throw new Error('Timeline precisa de width, height, fps e durationInFrames.');
  const output = path.resolve(options.output || 'out/temporal.mp4');
  const work = path.resolve(options.work || 'out/temporal-render');
  const captureDir = path.join(work, options.storyboard ? 'storyboard' : 'frames');
  const verifyDir = path.join(work, 'verify');
  const reportFile = path.resolve(options.report || (options.storyboard ? 'out/temporal-storyboard.json' : 'out/temporal-render.json'));
  await fs.rm(captureDir, {recursive: true, force: true});
  await fs.mkdir(captureDir, {recursive: true});
  await fs.mkdir(verifyDir, {recursive: true});
  await fs.mkdir(path.dirname(output), {recursive: true});
  await fs.mkdir(path.dirname(reportFile), {recursive: true});

  const {server, origin} = await staticServer(root);
  let browser;
  const pageErrors = [];
  const consoleErrors = [];
  try {
    const browserConfig = await browserConfiguration();
    console.log(JSON.stringify({stage: 'browser', provider: browserConfig.provider, headless: true}));
    browser = await chromium.launch({
      executablePath: browserConfig.executablePath,
      headless: true,
      args: browserConfig.args,
      env: browserConfig.env,
    });
    const context = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1});
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(`${origin}/${relativePage.split(path.sep).join('/')}`, {waitUntil: 'networkidle'});
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return Array.from(document.fonts).map((font) => ({family: font.family, status: font.status}));
    });
    await page.evaluate((timeline) => window.__setTimeline(timeline), config);
    await page.waitForFunction(() => window.__temporalReady === true && typeof window.seek === 'function');

    const capture = async (frame, directory) => {
      const time = frame / fps;
      const state = await page.evaluate((timeSeconds) => window.seek(timeSeconds), time);
      if (state.fps !== fps || state.frame !== frame) throw new Error(`Relógio divergente no quadro ${frame}.`);
      const file = path.join(directory, frameName(frame));
      await page.screenshot({path: file, type: 'png', fullPage: false});
      return file;
    };

    const frames = options.storyboard ? config.reviewFrames : Array.from({length: durationInFrames}, (_, index) => index);
    if (!Array.isArray(frames) || !frames.length) throw new Error('Nenhum quadro para capturar.');
    console.log(JSON.stringify({stage: 'capture', frames: frames.length, fps, width, height, clock: 't = frame / fps'}));
    let completed = 0;
    for (const frame of frames) {
      await capture(frame, captureDir);
      completed += 1;
      if (completed === frames.length || completed % 30 === 0) console.log(JSON.stringify({stage: 'capture', completed, total: frames.length}));
    }
    if (pageErrors.length || consoleErrors.length) throw new Error(`Erros no Chromium: ${JSON.stringify({pageErrors, consoleErrors})}`);

    const verificationFrames = options.storyboard ? frames.slice(0, Math.min(3, frames.length)) : (config.verificationFrames || [0, durationInFrames - 1]);
    const verification = [];
    for (const frame of [...verificationFrames].reverse()) {
      const repeated = await capture(frame, verifyDir);
      const originalHash = await sha256(path.join(captureDir, frameName(frame)));
      const repeatedHash = await sha256(repeated);
      verification.push({frame, originalHash, repeatedHash, identical: originalHash === repeatedHash});
    }
    const deterministic = verification.every((item) => item.identical);
    if (!deterministic) throw new Error(`Falha de determinismo: ${JSON.stringify(verification)}`);
    console.log(JSON.stringify({stage: 'determinism', passed: verification.length, order: 'reverse', identical: true}));

    const report = {
      project: config.id,
      status: 'pass',
      mode: options.storyboard ? 'storyboard' : 'mp4',
      clock: 't = frame / fps; every visual property is calculated inside window.seek(t)',
      browser: {headless: true, provider: browserConfig.provider, viewport: {width, height}, deviceScaleFactor: 1},
      capture: {directory: path.relative(process.cwd(), captureDir), format: 'PNG', frames: frames.length, fps},
      fonts,
      pageErrors,
      consoleErrors,
      determinism: {status: 'pass', order: 'reverse chronological verification', checks: verification},
    };

    if (!options.storyboard) {
      console.log(JSON.stringify({stage: 'ffmpeg', frames: durationInFrames, fps}));
      await run(ffmpeg, [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-framerate', String(fps), '-start_number', '0', '-i', path.join(captureDir, 'frame-%06d.png'),
        '-frames:v', String(durationInFrames), '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
        '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level:v', '4.2',
        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
        '-movflags', '+faststart', output,
      ]);
      const probeRaw = await run(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', output]);
      const probe = JSON.parse(probeRaw.stdout);
      const video = probe.streams.find((stream) => stream.codec_type === 'video');
      const checks = {
        h264: video.codec_name === 'h264',
        width: video.width === width,
        height: video.height === height,
        fps: video.avg_frame_rate === `${fps}/1`,
        frames: Number(video.nb_frames) === durationInFrames,
        pixelFormat: video.pix_fmt === 'yuv420p',
      };
      report.ffmpeg = {path: ffmpeg, input: 'frame-%06d.png', joinedFrames: durationInFrames, codec: 'H.264 High / CRF 16 / yuv420p / BT.709'};
      report.output = {path: path.relative(process.cwd(), output), bytes: (await fs.stat(output)).size, sha256: await sha256(output)};
      report.probe = probe;
      report.mp4Checks = checks;
      report.status = Object.values(checks).every(Boolean) ? 'pass' : 'fail';
      await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);
      if (report.status !== 'pass') throw new Error(`MP4 fora da especificação: ${JSON.stringify(checks)}`);
      if (options.cleanFrames) await fs.rm(captureDir, {recursive: true, force: true});
      console.log(JSON.stringify({stage: 'done', output: report.output.path, frames: durationInFrames, fps, status: report.status}));
    } else {
      await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);
      console.log(JSON.stringify({stage: 'done', storyboard: path.relative(process.cwd(), captureDir), frames: frames.length, status: 'pass'}));
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
