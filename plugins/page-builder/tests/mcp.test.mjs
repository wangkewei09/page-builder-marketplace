import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("MCP tools read and mutate the same revisioned page", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "page-builder-mcp-")); const client = new Client({ name: "page-builder-test", version: "1.0.0" });
  const transport = new StdioClientTransport({ command: process.execPath, args: ["dist/server.js"], cwd: process.cwd(), env: { ...process.env, PAGE_BUILDER_DATA_DIR: directory, PAGE_BUILDER_EXPORT_DIR: directory } });
  await client.connect(transport);
  try {
    const tools = await client.listTools(); assert.ok(tools.tools.some((tool) => tool.name === "page_apply_operations")); assert.ok(tools.tools.some((tool) => tool.name === "page_export"));
    const created = await client.callTool({ name: "page_create", arguments: { name: "AI 工具页" } }); const page = created.structuredContent.page;
    const changed = await client.callTool({ name: "page_apply_operations", arguments: { pageId: page.pageId, expectedRevision: page.revision, operations: [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-02", props: { label: "AI 添加" } } }] } });
    assert.equal(changed.structuredContent.page.revision, 1); assert.equal(changed.structuredContent.page.root.children[0].props.label, "AI 添加");
    const stale = await client.callTool({ name: "page_apply_operations", arguments: { pageId: page.pageId, expectedRevision: 0, operations: [{ type: "rename", name: "过期写入" }] } }); assert.equal(stale.isError, true); assert.match(stale.content[0].text, /REVISION_CONFLICT/);
  } finally { await client.close(); }
});
