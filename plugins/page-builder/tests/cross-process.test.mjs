import { strict as assert } from "node:assert";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = await mkdtemp(path.join(tmpdir(), "page-builder-processes-")); const env = { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(root, "data"), PAGE_BUILDER_EXPORT_DIR: path.join(root, "exports"), PAGE_BUILDER_LIBRARY_DIR: path.join(root, "libraries") };
const standalone = spawn(process.execPath, ["dist/standalone.js"], { cwd: new URL("..", import.meta.url), env, stdio: ["ignore", "pipe", "inherit"] });
const url = await new Promise((resolve, reject) => { let output = ""; standalone.stdout.on("data", (chunk) => { output += chunk; const match = output.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) resolve(match[0]); }); standalone.once("exit", (code) => reject(new Error(`standalone exited ${code}`))); setTimeout(() => reject(new Error("standalone URL timeout")), 10000); });
const client = new Client({ name: "cross-process-test", version: "1.0.0" }); const transport = new StdioClientTransport({ command: process.execPath, args: ["dist/server.js"], cwd: new URL("..", import.meta.url).pathname, env });
await client.connect(transport);
try {
  const created = await (await fetch(`${url}/api/pages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "跨进程页面" }) })).json();
  const pageId = created.page.pageId; const readByMcp = await client.callTool({ name: "page_get_schema", arguments: { pageId } }); assert.equal(readByMcp.structuredContent.page.name, "跨进程页面");
  const changed = await client.callTool({ name: "page_apply_operations", arguments: { pageId, expectedRevision: 0, operations: [{ type: "add", parentId: created.page.root.id, node: { kind: "component", componentId: "C-02", props: { label: "来自 MCP" } } }] } });
  const nodeId = changed.structuredContent.page.root.children[0].id; const readByHttp = await (await fetch(`${url}/api/pages/${pageId}`)).json(); assert.equal(readByHttp.page.revision, 1); assert.equal(readByHttp.page.root.children[0].props.label, "来自 MCP");
  await client.callTool({ name: "page_select_node", arguments: { pageId, nodeId, expectedRevision: 1 } }); const selectedByHttp = await (await fetch(`${url}/api/pages/${pageId}`)).json(); assert.equal(selectedByHttp.selection.nodeId, nodeId);
  const stale = await fetch(`${url}/api/pages/${pageId}/operations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedRevision: 0, operations: [{ type: "rename", name: "过期覆盖" }] }) }); assert.equal(stale.status, 409);
  const finalPage = await (await fetch(`${url}/api/pages/${pageId}`)).json(); assert.equal(finalPage.page.name, "跨进程页面"); assert.equal(finalPage.page.revision, 1);
  console.log(JSON.stringify({ crossProcess: "pass", revision: 1, sharedSelection: nodeId, staleWriteRejected: true }));
} finally { await client.close(); standalone.kill("SIGTERM"); }
