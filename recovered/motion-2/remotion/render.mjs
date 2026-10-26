import {bundle} from '@remotion/bundler';
import {makeCancelSignal, renderMedia, selectComposition} from '@remotion/renderer';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`MotionClone / composições da Arena

Uso original:
  node render.mjs [projeto.json] [saida.mp4] [--preview]

Composições autônomas:
  node render.mjs --selfcontained --composition MotionDesign --output out/design.mp4
  node render.mjs --selfcontained --composition ReelsViral --output out/reels.mp4
  node render.mjs --selfcontained --composition ReelsViral --props '{"videoUrl":"video.mp4"}'

Opções:
  --selfcontained       Não exige project.json; usa src/design.jsx por padrão
  --entry <arquivo>     Entry Point do Remotion
  --composition <id>    Motion, MotionDesign ou ReelsViral
  --props <json|@file>  Input props em JSON ou em um arquivo JSON
  --project <arquivo>   Projeto do fluxo original
  --output <arquivo>    Destino do MP4
  --preview             CRF e escala de prévia
  --help                Mostra esta ajuda

videoUrl aceita caminho local, URL HTTP(S) ou static://arquivo-no-bundle.`);
}

function parseArgs(argv) {
  const options = {positionals: [], preview: false, selfContained: false};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--preview') options.preview = true;
    else if (argument === '--selfcontained') options.selfContained = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (['--entry', '--composition', '--props', '--project', '--output'].includes(argument)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} precisa de um valor.`);
      options[{ '--entry': 'entry', '--composition': 'composition', '--props': 'props', '--project': 'project', '--output': 'output' }[argument]] = value;
      index += 1;
    } else if (argument.startsWith('--')) throw new Error(`Opção desconhecida: ${argument}`);
    else options.positionals.push(argument);
  }
  return options;
}

function readProps(value) {
  if (!value) return {};
  const source = value.startsWith('@') ? fs.readFileSync(path.resolve(value.slice(1)), 'utf8') : value;
  const parsed = JSON.parse(source);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('--props precisa conter um objeto JSON.');
  }
  return parsed;
}

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(absolute) : [absolute];
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const defaultProject = path.join(root, 'public/project.json');
  const projectFile = path.resolve(options.project || (!options.selfContained ? options.positionals[0] : undefined) || defaultProject);
  const publicDir = path.dirname(projectFile);
  const project = options.selfContained ? {} : JSON.parse(fs.readFileSync(projectFile, 'utf8'));
  const extraProps = readProps(options.props);
  const inputProps = {...project, ...extraProps};
  const entryPoint = path.resolve(root, options.entry || (options.selfContained ? 'src/design.jsx' : 'src/index.jsx'));
  const compositionId = options.composition || (options.selfContained ? 'MotionDesign' : 'Motion');
  const defaultName = compositionId === 'ReelsViral' ? 'reels-viral.mp4' : compositionId === 'MotionDesign' ? 'motion-design.mp4' : 'video.mp4';
  const positionalOutput = options.selfContained ? options.positionals[0] : options.positionals[1];
  const destination = path.resolve(options.output || positionalOutput || path.join(root, 'out', defaultName));
  const bundleDir = path.join(root, '.bundle');

  const signatureFiles = [
    path.join(root, 'package-lock.json'),
    path.join(root, 'package.json'),
    ...sourceFiles(path.join(root, 'src')),
  ].filter((file) => fs.existsSync(file)).sort();
  const signature = signatureFiles.map((file) => `${file}\n${fs.readFileSync(file, 'utf8')}`).join('\n');
  const stamp = createHash('sha256').update(signature).update(entryPoint).digest('hex');
  const stampFile = path.join(bundleDir, '.signature');
  if (!fs.existsSync(stampFile) || fs.readFileSync(stampFile, 'utf8') !== stamp) {
    await bundle({entryPoint, outDir: bundleDir, publicDir});
    fs.writeFileSync(stampFile, stamp);
  }

  // O aplicativo executa um render por vez. Somente nomes de assets controlados são copiados.
  const staticDir = path.join(bundleDir, 'public');
  fs.mkdirSync(staticDir, {recursive: true});
  for (const name of ['project.json', 'audio.m4a', 'logo.png']) {
    const source = path.join(publicDir, name);
    const target = path.join(staticDir, name);
    if (fs.existsSync(source)) fs.copyFileSync(source, target);
    else if (fs.existsSync(target)) fs.unlinkSync(target);
  }

  if (inputProps.videoUrl && !/^(https?:|data:|static:\/\/)/i.test(inputProps.videoUrl)) {
    const candidates = [path.resolve(inputProps.videoUrl), path.resolve(publicDir, inputProps.videoUrl)];
    const source = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (source) {
      const name = `input-video${path.extname(source).toLowerCase() || '.mp4'}`;
      fs.copyFileSync(source, path.join(staticDir, name));
      inputProps.videoUrl = `static://${name}`;
    }
  }

  const browsers = [
    process.env.REMOTION_BROWSER,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  const browserExecutable = browsers.find((candidate) => candidate && fs.existsSync(candidate));
  const composition = await selectComposition({serveUrl: bundleDir, id: compositionId, inputProps, browserExecutable});
  const {cancelSignal, cancel} = makeCancelSignal();
  const cancelFile = process.env.FRAMEFORGE_CANCEL_FILE;
  const timer = cancelFile ? setInterval(() => {
    if (fs.existsSync(cancelFile)) cancel();
  }, 200) : null;
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  try {
    await renderMedia({
      serveUrl: bundleDir,
      composition,
      inputProps,
      outputLocation: destination,
      codec: 'h264',
      crf: options.preview ? 24 : 18,
      concurrency: 2,
      browserExecutable,
      cancelSignal,
      muted: options.selfContained ? !inputProps.videoUrl : !project.audio,
      scale: options.preview ? Math.min(1, 960 / composition.width) : 1,
      onProgress: ({progress}) => process.stdout.write(`${JSON.stringify({progress: Math.round(progress * 100)})}\n`),
    });
    process.stdout.write(`${JSON.stringify({output: destination, composition: compositionId})}\n`);
  } finally {
    if (timer) clearInterval(timer);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
