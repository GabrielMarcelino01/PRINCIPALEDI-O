import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("./", import.meta.url));
const port = Number(process.env.PORT || 3004);
const routes = {
  "/": { path: resolve(ROOT, "preview.html"), type: "text/html; charset=utf-8" },
  "/index.html": { path: resolve(ROOT, "preview.html"), type: "text/html; charset=utf-8" },
  "/video.mp4": { path: resolve(ROOT, "../../entregas/ARMARIO-7-EDITADO.mp4"), type: "video/mp4" },
  "/poster.jpg": { path: resolve(ROOT, "reports/poster.jpg"), type: "image/jpeg" },
  "/captions.srt": { path: resolve(ROOT, "armario-7-captions.srt"), type: "text/plain; charset=utf-8" },
};

createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://preview").pathname;
  if (pathname === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: existsSync(routes["/video.mp4"].path), project: "armario-7" }));
    return;
  }
  const route = routes[pathname];
  if (!route || !existsSync(route.path)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Não encontrado");
    return;
  }
  const size = statSync(route.path).size;
  const headers = {
    "content-type": route.type,
    "x-content-type-options": "nosniff",
    "cache-control": "no-cache",
    "accept-ranges": "bytes",
  };
  let start = 0;
  let end = size - 1;
  let status = 200;
  const range = request.headers.range;
  if (range && route.type === "video/mp4") {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      if (match[1]) start = Number(match[1]);
      if (match[1] && match[2]) end = Number(match[2]);
      if (!match[1] && match[2]) start = Math.max(0, size - Number(match[2]));
      end = Math.min(end, size - 1);
      if (start > end || start >= size) {
        response.writeHead(416, { "content-range": `bytes */${size}` });
        response.end();
        return;
      }
      status = 206;
      headers["content-range"] = `bytes ${start}-${end}/${size}`;
    }
  }
  headers["content-length"] = String(end - start + 1);
  response.writeHead(status, headers);
  if (request.method === "HEAD") response.end();
  else createReadStream(route.path, { start, end }).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(JSON.stringify({ project: "armario-7", url: `http://0.0.0.0:${port}`, video: "/video.mp4" }));
});
