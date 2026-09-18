import test from "node:test";
import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("installed dist starts with no developer dependencies and validates a component", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "page-builder-package-"));
  const plugin = path.join(root, "plugin");
  await mkdir(plugin);
  await cp("dist", path.join(plugin, "dist"), { recursive: true });
  const client = new Client({ name: "package-test", version: "1" });
  const transport = new StdioClientTransport({
    command: process.execPath, args: [path.join(plugin, "dist/server.js")], cwd: plugin,
    env: { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(root, "pages"), PAGE_BUILDER_LIBRARY_DIR: path.join(root, "libraries"), PAGE_BUILDER_EXPORT_DIR: path.join(root, "exports") }
  });
  await client.connect(transport);
  try {
    const created = await client.callTool({ name: "page_create", arguments: { name: "独立安装验证" } });
    assert.ok(!created.isError, JSON.stringify(created));
    const page = created.structuredContent.page;
    const updated = await client.callTool({ name: "page_apply_operations", arguments: { pageId: page.pageId, expectedRevision: page.revision, operations: [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-02", props: { label: "独立安装可用" } } }] } });
    assert.ok(!updated.isError, JSON.stringify(updated));
    assert.equal(updated.structuredContent.page.root.children[0].props.label, "独立安装可用");
  } finally { await client.close(); }
});
