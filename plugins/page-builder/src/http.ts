import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { COMPONENTS, catalogList } from "./catalog.js";
import { DomainError, type Operation } from "./domain.js";
import { exportPage } from "./exporter.js";
import type { PageStore } from "./store.js";

const MIME: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

function send(response: ServerResponse, status: number, body: unknown, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  response.writeHead(status, { "content-type": type, "cache-control": "no-store", "access-control-allow-origin": "*" }); response.end(payload);
}

async function json(request: IncomingMessage) {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > 2_000_000) throw new DomainError("BODY_TOO_LARGE", "请求超过 2 MB。 "); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { throw new DomainError("INVALID_JSON", "请求不是合法 JSON。"); }
}

export function createEditorServer(store: PageStore, uiDirectory: string, exportDirectory: string) {
  const server = createServer(async (request, response) => {
    try {
      if (!request.url) return send(response, 404, { error: "NOT_FOUND" });
      const url = new URL(request.url, "http://127.0.0.1"); const pathname = decodeURIComponent(url.pathname);
      if (request.method === "OPTIONS") { response.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type" }); return response.end(); }
      if (pathname === "/api/health") return send(response, 200, { ok: true, provider: "b2b-production", components: Object.keys(COMPONENTS), schemaVersion: 1 });
      if (pathname === "/api/catalog" && request.method === "GET") return send(response, 200, { components: catalogList() });
      if (pathname === "/api/pages" && request.method === "GET") return send(response, 200, { pages: store.list() });
      if (pathname === "/api/pages" && request.method === "POST") { const input = await json(request); return send(response, 201, { page: await store.create(input.name) }); }
      if (pathname === "/api/import" && request.method === "POST") { const input = await json(request); return send(response, 201, { page: await store.import(input.page ?? input) }); }
      const match = pathname.match(/^\/api\/pages\/([A-Za-z0-9_-]+)(?:\/(operations|undo|redo|selection|export))?$/);
      if (match) {
        const [, pageId, action] = match;
        if (!action && request.method === "GET") return send(response, 200, { page: store.get(pageId), selection: store.selection(pageId) });
        if (action === "operations" && request.method === "POST") { const input = await json(request); return send(response, 200, { page: await store.apply(pageId, input.expectedRevision, input.operations as Operation[]) }); }
        if (action === "undo" && request.method === "POST") { const input = await json(request); return send(response, 200, { page: await store.undo(pageId, input.expectedRevision) }); }
        if (action === "redo" && request.method === "POST") { const input = await json(request); return send(response, 200, { page: await store.redo(pageId, input.expectedRevision) }); }
        if (action === "selection" && request.method === "POST") { const input = await json(request); return send(response, 200, { selection: store.select(pageId, input.nodeId ?? null) }); }
        if (action === "export" && request.method === "POST") return send(response, 200, { export: await exportPage(store.get(pageId), uiDirectory, exportDirectory) });
      }
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const resolved = path.resolve(uiDirectory, relative); if (!resolved.startsWith(`${path.resolve(uiDirectory)}${path.sep}`) && resolved !== path.join(path.resolve(uiDirectory), "index.html")) throw new DomainError("INVALID_PATH", "资源路径无效。");
      const info = await stat(resolved); if (!info.isFile()) return send(response, 404, { error: "NOT_FOUND" });
      return send(response, 200, await readFile(resolved), MIME[path.extname(resolved)] ?? "application/octet-stream");
    } catch (error) {
      if (error instanceof DomainError) return send(response, error.code === "PAGE_NOT_FOUND" || error.code === "NODE_NOT_FOUND" ? 404 : error.code === "REVISION_CONFLICT" ? 409 : 400, { error: { code: error.code, message: error.message, details: error.details } });
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return send(response, 404, { error: { code: "NOT_FOUND", message: "未找到资源。" } });
      console.error(error); return send(response, 500, { error: { code: "INTERNAL_ERROR", message: "服务器内部错误。" } });
    }
  });
  return {
    async start() { await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve)); const { port } = server.address() as AddressInfo; return `http://127.0.0.1:${port}`; },
    close() { return new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
  };
}

