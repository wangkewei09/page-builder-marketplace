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
    const tools = await client.listTools(); assert.ok(tools.tools.some((tool) => tool.name === "page_apply_operations")); assert.ok(tools.tools.some((tool) => tool.name === "page_export")); assert.ok(tools.tools.some((tool) => tool.name === "page_capture"));
    const created = await client.callTool({ name: "page_create", arguments: { name: "AI 工具页" } }); const page = created.structuredContent.page;
    const changed = await client.callTool({ name: "page_apply_operations", arguments: { pageId: page.pageId, expectedRevision: page.revision, operations: [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-02", props: { label: "AI 添加" } } }] } });
    assert.equal(changed.structuredContent.page.revision, 1); assert.equal(changed.structuredContent.page.root.children[0].props.label, "AI 添加");
    const nodeId = changed.structuredContent.page.root.children[0].id; const selected = await client.callTool({ name: "page_select_node", arguments: { pageId: page.pageId, nodeId } }); assert.equal(selected.structuredContent.selection.nodeId, nodeId);
    const stale = await client.callTool({ name: "page_apply_operations", arguments: { pageId: page.pageId, expectedRevision: 0, operations: [{ type: "rename", name: "过期写入" }] } }); assert.equal(stale.isError, true); assert.match(stale.content[0].text, /REVISION_CONFLICT/);
    const atomicFailure = await client.callTool({ name: "page_apply_operations", arguments: { pageId: page.pageId, expectedRevision: 1, operations: [{ type: "rename", name: "不应提交" }, { type: "remove", nodeId: "missing" }] } }); assert.equal(atomicFailure.isError, true);
    const unchanged = await client.callTool({ name: "page_get_schema", arguments: { pageId: page.pageId } }); assert.equal(unchanged.structuredContent.page.name, "AI 工具页"); assert.equal(unchanged.structuredContent.page.revision, 1);
    const undone = await client.callTool({ name: "page_undo", arguments: { pageId: page.pageId, expectedRevision: 1 } }); assert.equal(undone.structuredContent.page.root.children.length, 0); assert.equal(undone.structuredContent.page.revision, 2);
    const capture = await client.callTool({ name: "page_capture", arguments: { pageId: page.pageId, viewport: "narrow" } }); assert.equal(capture.isError, undefined); assert.equal(capture.structuredContent.revision, 2); assert.equal(capture.structuredContent.viewport, "narrow"); assert.ok(capture.content.some((item) => item.type === "image" && item.data.length > 1000));
  } finally { await client.close(); }
});
