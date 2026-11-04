import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";
const REMOTE_ASSET_ORIGIN = "https://descompacto.vercel.app";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon"
};

/* Cache em memória do HTML único + imagens locais para entrega instantânea (<0.5ms) */
let indexBundleCache = { sig: "", raw: null, br: null, gz: null, etag: "" };
const staticMemCache = new Map();

function getInlineIndexBundle() {
  const htmlFile = path.join(__dirname, "index.html");
  const cssFile = path.join(__dirname, "assets/css/style.css");
  const cfgFile = path.join(__dirname, "assets/js/config.js");
  const jsFile = path.join(__dirname, "assets/js/quiz.js");

  const stats = [htmlFile, cssFile, cfgFile, jsFile].map((f) => fs.statSync(f));
  const sig = stats.map((s) => `${s.size}:${Math.trunc(s.mtimeMs)}`).join("|");

  if (indexBundleCache.sig === sig && indexBundleCache.raw) {
    return indexBundleCache;
  }

  let html = fs.readFileSync(htmlFile, "utf8");
  const css = fs.readFileSync(cssFile, "utf8");
  const cfg = fs.readFileSync(cfgFile, "utf8").replace(/<\/script/gi, "<\\/script");
  const js = fs.readFileSync(jsFile, "utf8").replace(/<\/script/gi, "<\\/script");

  html = html.replace(
    /<link\s+rel="stylesheet"\s+href="assets\/css\/style\.css[^"]*">/i,
    () => `<style>${css}</style>`
  );
  html = html.replace(
    /<script\s+src="assets\/js\/config\.js[^"]*"><\/script>\s*<script\s+src="assets\/js\/quiz\.js[^"]*"><\/script>/i,
    () => `<script>${cfg}\n${js}</script>`
  );

  const raw = Buffer.from(html, "utf8");
  const br = zlib.brotliCompressSync(raw, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 6 }
  });
  const gz = zlib.gzipSync(raw, { level: 6 });
  const etag = `"inl-${Buffer.from(sig).toString("base64url").slice(0, 20)}"`;

  indexBundleCache = { sig, raw, br, gz, etag };
  return indexBundleCache;
}

function preloadLocalImages() {
  const imgDir = path.join(__dirname, "assets/img");
  if (!fs.existsSync(imgDir)) return;
  for (const name of fs.readdirSync(imgDir)) {
    const fp = path.join(imgDir, name);
    const st = fs.statSync(fp);
    if (st.isFile() && st.size < 2 * 1024 * 1024) {
      const ext = path.extname(fp).toLowerCase();
      staticMemCache.set(fp, {
        mtimeMs: st.mtimeMs,
        buf: fs.readFileSync(fp),
        etag: `"img-${st.size.toString(16)}-${Math.trunc(st.mtimeMs).toString(16)}"`,
        mime: MIME[ext] || "application/octet-stream"
      });
    }
  }
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || "/";
  const parsed = new URL(rawUrl, `http://${req.headers.host || "localhost"}`);
  let reqPath = decodeURIComponent(parsed.pathname);

  if (reqPath === "/" || reqPath === "/index.html") {
    try {
      const bundle = getInlineIndexBundle();
      if (req.headers["if-none-match"] === bundle.etag) {
        res.writeHead(304);
        res.end();
        return;
      }
      const acceptEnc = String(req.headers["accept-encoding"] || "");
      const headers = {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
        ETag: bundle.etag,
        Vary: "Accept-Encoding"
      };
      if (req.method === "HEAD") {
        res.writeHead(200, headers);
        res.end();
        return;
      }
      if (acceptEnc.includes("br")) {
        headers["Content-Encoding"] = "br";
        headers["Content-Length"] = bundle.br.length;
        res.writeHead(200, headers);
        res.end(bundle.br);
        return;
      }
      if (acceptEnc.includes("gzip")) {
        headers["Content-Encoding"] = "gzip";
        headers["Content-Length"] = bundle.gz.length;
        res.writeHead(200, headers);
        res.end(bundle.gz);
        return;
      }
      headers["Content-Length"] = bundle.raw.length;
      res.writeHead(200, headers);
      res.end(bundle.raw);
      return;
    } catch (err) {
      console.error("Bundle fallback:", err);
    }
    reqPath = "/index.html";
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  /* Resposta instantânea da RAM para imagens otimizadas locais */
  const memItem = staticMemCache.get(filePath);
  if (memItem) {
    if (req.headers["if-none-match"] === memItem.etag) {
      res.writeHead(304);
      res.end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": memItem.mime,
      "Content-Length": memItem.buf.length,
      "Cache-Control": "public, max-age=86400",
      ETag: memItem.etag
    });
    res.end(req.method === "HEAD" ? undefined : memItem.buf);
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600"
      });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    if (reqPath.startsWith("/assets/img/")) {
      const target = `${REMOTE_ASSET_ORIGIN}${reqPath}${parsed.search || ""}`;
      res.writeHead(302, {
        Location: target,
        "Cache-Control": "public, max-age=3600"
      });
      res.end();
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  });
});

try {
  getInlineIndexBundle();
  preloadLocalImages();
} catch (e) {}

server.listen(PORT, HOST, () => {
  console.log(`Funil Ultra-Fast + Carrossel em RAM rodando em http://${HOST}:${PORT}`);
});
