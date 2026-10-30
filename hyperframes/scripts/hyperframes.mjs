#!/usr/bin/env node
/**
 * Executa o CLI pinado sem instalacao global e sem atualizar as skills.
 * FFmpeg, FFprobe e Chromium vem do package-lock local, salvo override explicito.
 */
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const cli = path.join(root, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs');

if (!existsSync(cli)) {
  console.error('HyperFrames nao instalado. Execute: npm ci --prefix hyperframes --ignore-scripts --no-audit --no-fund');
  process.exit(1);
}

const env = {...process.env};
env.HYPERFRAMES_FFMPEG_PATH ||= require('@ffmpeg-installer/ffmpeg').path;
env.HYPERFRAMES_FFPROBE_PATH ||= require('ffprobe-static').path;
env.HYPERFRAMES_SKIP_SKILLS ||= '1';
env.HYPERFRAMES_NO_UPDATE_CHECK ||= '1';
env.HYPERFRAMES_NO_TELEMETRY ||= '1';
env.HF_NO_BROWSER ||= '1';

if (!env.HYPERFRAMES_BROWSER_PATH) {
  const chromiumModule = pathToFileURL(path.join(
    root, 'node_modules', '@sparticuz', 'chromium', 'build', 'index.js',
  )).href;
  const {default: Chromium, inflate} = await import(chromiumModule);
  env.HYPERFRAMES_BROWSER_PATH = await Chromium.executablePath();

  const packagedLibraries = path.join(
    root, 'node_modules', '@sparticuz', 'chromium', 'bin', 'al2023.tar.br',
  );
  const libraryDir = path.join(os.tmpdir(), 'al2023', 'lib');
  if (existsSync(packagedLibraries) && !existsSync(path.join(libraryDir, 'libnspr4.so'))) {
    await inflate(packagedLibraries);
  }
  env.LD_LIBRARY_PATH = [libraryDir, env.LD_LIBRARY_PATH].filter(Boolean).join(':');
  env.FONTCONFIG_PATH ||= path.join(os.tmpdir(), 'fonts');
}

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

child.on('error', (error) => {
  console.error(`Falha ao iniciar o HyperFrames: ${error.message}`);
  process.exitCode = 1;
});
child.on('close', (code, signal) => {
  if (signal) {
    console.error(`HyperFrames encerrado por ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
});
