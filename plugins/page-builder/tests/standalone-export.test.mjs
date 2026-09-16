import { strict as assert } from "node:assert";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { unzipSync } from "fflate";

const work = await mkdtemp(path.join(tmpdir(), "page-builder-standalone-")); const data = path.join(work, "data"); const exportsDir = path.join(work, "exports");
const child = spawn(process.execPath, ["dist/standalone.js"], { cwd: new URL("..", import.meta.url), env: { ...process.env, PAGE_BUILDER_DATA_DIR: data, PAGE_BUILDER_EXPORT_DIR: exportsDir }, stdio: ["ignore", "pipe", "inherit"] });
const editorUrl = await new Promise((resolve, reject) => { let text = ""; child.stdout.on("data", (chunk) => { text += chunk; const match = text.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) resolve(match[0]); }); child.once("exit", (code) => reject(new Error(`server exited ${code}`))); });
const request = async (route, options = {}) => { const response = await fetch(`${editorUrl}${route}`, { headers: { "content-type": "application/json" }, ...options }); const payload = await response.json(); assert.equal(response.ok, true, JSON.stringify(payload)); return payload; };

const page = (await request("/api/pages", { method: "POST", body: JSON.stringify({ name: "独立导出" }) })).page;
const componentIds = ["C-02", "C-21", "C-23", "C-42", "C-34"];
const changed = (await request(`/api/pages/${page.pageId}/operations`, { method: "POST", body: JSON.stringify({ expectedRevision: 0, operations: componentIds.map((componentId) => ({ type: "add", parentId: page.root.id, node: { kind: "component", componentId, props: {} } })) }) })).page;
const exported = (await request(`/api/pages/${page.pageId}/export`, { method: "POST", body: "{}" })).export; assert.equal(exported.revision, changed.revision);
const imported = (await request("/api/import", { method: "POST", body: JSON.stringify({ page: changed }) })).page; assert.notEqual(imported.pageId, changed.pageId); assert.equal(imported.root.children.length, 5);

const site = path.join(work, "site"); const files = unzipSync(new Uint8Array(await readFile(exported.zipPath)));
for (const [name, bytes] of Object.entries(files)) { const target = path.join(site, name); assert.ok(target.startsWith(site)); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, bytes); }
const staticServer = createServer(async (request, response) => { try { const url = new URL(request.url, "http://127.0.0.1"); const target = path.join(site, url.pathname === "/" ? "index.html" : url.pathname); const bytes = await readFile(target); const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2" }[path.extname(target)] || "application/octet-stream"; response.writeHead(200, { "content-type": mime }); response.end(bytes); } catch { response.writeHead(404); response.end(); } });
await new Promise((resolve) => staticServer.listen(0, "127.0.0.1", resolve)); const siteUrl = `http://127.0.0.1:${staticServer.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true }); const browserPage = await browser.newPage({ viewport: { width: 1280, height: 800 } }); const errors = [];
browserPage.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); }); browserPage.on("pageerror", (error) => errors.push(error.message));
try { await browserPage.goto(siteUrl, { waitUntil: "networkidle" }); await browserPage.waitForFunction(() => window.pageBuilderExport?.instances?.length === 5); assert.equal(await browserPage.locator('[data-component-reference="C-02"]').count() >= 1, true); assert.deepEqual(errors, []); console.log(JSON.stringify({ exportedRevision: exported.revision, fileCount: exported.fileCount, importRoundTripNodes: imported.root.children.length, productionInstances: 5, consoleErrors: 0 })); }
finally { await browser.close(); await new Promise((resolve) => staticServer.close(resolve)); child.kill("SIGTERM"); }
