#!/usr/bin/env node
/**
 * Alimenta o cache de descoberta do CLI com manifests oficiais locais.
 * Nao baixa nem instala componentes e nao altera projetos.
 */
import {readFile, mkdir, writeFile, rename} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metadataRoot = path.join(root, 'registry-metadata');
const config = JSON.parse(await readFile(path.join(root, 'smoke', 'hyperframes.json'), 'utf8'));
const registry = config.registry;
const expectedRegistry = 'https://raw.githubusercontent.com/heygen-com/hyperframes/85fdc9aa888b4d26c8150fd09acae7b23fb392f5/registry';
if (registry !== expectedRegistry) {
  throw new Error(`Registry do smoke difere da revisao pinada: ${registry}`);
}

const slug = registry.replace(/[^a-zA-Z0-9]/g, '_');
const cacheDir = path.join(os.homedir(), '.hyperframes', 'cache');
const fetchedAt = Date.now();
const directories = {
  'hyperframes:block': 'blocks',
  'hyperframes:component': 'components',
  'hyperframes:example': 'examples',
};

async function writeCache(key, data) {
  await mkdir(cacheDir, {recursive: true});
  const destination = path.join(cacheDir, `${slug}__${key}.json`);
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify({fetchedAt, data}), 'utf8');
  await rename(temporary, destination);
}

const manifest = JSON.parse(await readFile(path.join(metadataRoot, 'registry.json'), 'utf8'));
await writeCache('registry', manifest);
let items = 0;
for (const entry of manifest.items) {
  const directory = directories[entry.type];
  if (!directory) throw new Error(`Tipo desconhecido: ${entry.type}`);
  const itemPath = path.join(metadataRoot, directory, entry.name, 'registry-item.json');
  const item = JSON.parse(await readFile(itemPath, 'utf8'));
  if (item.name !== entry.name || item.type !== entry.type) {
    throw new Error(`Manifest divergente: ${entry.name}`);
  }
  await writeCache(`${directory}__${entry.name}`, item);
  items += 1;
}

console.log(JSON.stringify({
  status: 'pass',
  source: 'registry-metadata local, tag v0.8.206',
  registry,
  cacheDir,
  registryManifest: 1,
  itemManifests: items,
  scope: 'Descoberta offline; hyperframes add ainda baixa os arquivos do componente.',
}, null, 2));
