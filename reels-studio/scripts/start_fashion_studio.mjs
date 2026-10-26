import {spawn} from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import httpProxy from 'http-proxy';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicPort = Number(process.env.FASHION_STUDIO_PUBLIC_PORT || 3000);
const internalPort = Number(process.env.FASHION_STUDIO_INTERNAL_PORT || 3001);
const target = `http://127.0.0.1:${internalPort}`;

if (!Number.isInteger(publicPort) || !Number.isInteger(internalPort) || publicPort === internalPort) {
  throw new Error('As portas pública e interna do Studio precisam ser inteiros diferentes.');
}

const loopbackHook = path.join(root, 'scripts/bind-studio-loopback.cjs');
const nodeOptions = [process.env.NODE_OPTIONS, `--require=${loopbackHook}`].filter(Boolean).join(' ');

const studio = spawn(process.execPath, [
  path.join(root, 'node_modules/@remotion/cli/remotion-cli.js'),
  'studio', 'src/FashionRoot.jsx',
  '--port', String(internalPort), '--no-open', '--ipv4',
], {
  cwd: root,
  env: {...process.env, NODE_OPTIONS: nodeOptions, FASHION_STUDIO_INTERNAL_PORT: String(internalPort)},
  stdio: ['ignore', 'inherit', 'inherit'],
});

const proxy = httpProxy.createProxyServer({
  target,
  changeOrigin: true,
  ws: true,
  xfwd: true,
});

// O Remotion 4.0.522 compara Origin com http://Host mesmo atrás de um proxy
// HTTPS. Normalizamos os headers apenas no salto local para o Studio interno.
proxy.on('proxyReq', (proxyReq, req) => {
  if (req.headers.origin) proxyReq.setHeader('Origin', target);
});
proxy.on('proxyReqWs', (proxyReq, req) => {
  if (req.headers.origin) proxyReq.setHeader('Origin', target);
});
proxy.on('error', (error, _req, responseOrSocket) => {
  console.error(`[preview-proxy] ${error.message}`);
  if (responseOrSocket instanceof http.ServerResponse) {
    if (!responseOrSocket.headersSent) responseOrSocket.writeHead(502, {'content-type': 'application/json'});
    if (!responseOrSocket.writableEnded) responseOrSocket.end(JSON.stringify({error: 'Studio indisponível temporariamente.'}));
  } else {
    responseOrSocket?.destroy();
  }
});

const server = http.createServer((req, res) => proxy.web(req, res));
server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));

let listening = false;
let shuttingDown = false;
const startProxy = () => {
  if (listening || shuttingDown) return;
  listening = true;
  clearInterval(readiness);
  clearTimeout(startupTimeout);
  server.listen(publicPort, '0.0.0.0', () => {
    console.log(`[preview-proxy] http://0.0.0.0:${publicPort} -> ${target}`);
  });
};

const readiness = setInterval(() => {
  const socket = net.connect({host: '127.0.0.1', port: internalPort});
  socket.once('connect', () => {
    socket.destroy();
    startProxy();
  });
  socket.once('error', () => socket.destroy());
}, 100);
readiness.unref();

const startupTimeout = setTimeout(() => {
  if (!listening) {
    console.error('[preview-proxy] O Studio interno não abriu a porta em 60 segundos.');
    shutdown('SIGTERM', 1);
  }
}, 60_000);
startupTimeout.unref();

function shutdown(signal = 'SIGTERM', exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(readiness);
  clearTimeout(startupTimeout);
  if (studio.exitCode === null && studio.signalCode === null) studio.kill(signal);
  if (listening) server.close();
  setTimeout(() => process.exit(exitCode), 2000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
studio.on('exit', (code, signal) => {
  if (!shuttingDown) {
    console.error(`[preview-proxy] O Studio encerrou (${signal || code}).`);
    process.exit(code ?? 1);
  }
});
