import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { catalogList, COMPONENTS } from "./catalog.js";
import { capturePage } from "./capture.js";
import { DomainError, type Operation } from "./domain.js";
import { exportPage } from "./exporter.js";
import { createEditorServer } from "./http.js";
import { FilePersistence, PageStore } from "./store.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const uiDirectory = path.join(root, "ui");
const dataDirectory = process.env.PAGE_BUILDER_DATA_DIR || path.join(homedir(), ".codex", "page-builder", "v1", "pages");
const exportDirectory = process.env.PAGE_BUILDER_EXPORT_DIR || path.join(homedir(), "Documents", "Page Builder Exports");
const store = new PageStore(new FilePersistence(dataDirectory)); await store.load();
const editor = createEditorServer(store, uiDirectory, exportDirectory); const editorUrl = await editor.start();
const UI_RESOURCE_URI = "ui://page-builder/editor-v4.html";
const server = new McpServer({ name: "page-builder", version: "0.2.0" }, { capabilities: { tools: {}, resources: {} } });

function output(value: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }], structuredContent: value as Record<string, unknown> }; }
async function handle<T>(fn: () => Promise<T> | T) { try { return output(await fn()); } catch (error) { const err = error instanceof DomainError ? error : new DomainError("INTERNAL_ERROR", error instanceof Error ? error.message : String(error)); return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: { code: err.code, message: err.message, details: err.details } }) }] }; } }

server.registerResource("page-builder-editor", UI_RESOURCE_URI, { title: "页面搭建器", description: "Visual editor backed by the authoritative Page Schema", mimeType: "text/html" }, async () => {
  const html = (await readFile(path.join(uiDirectory, "index.html"), "utf8")).replace("<head>", `<head><base href="${editorUrl}/">`);
  return { contents: [{ uri: UI_RESOURCE_URI, mimeType: "text/html", text: html, _meta: { "openai/widgetDomain": editorUrl, "openai/widgetPrefersBorder": false } }] };
});

server.registerTool("page_builder_open", {
  title: "打开页面搭建器", description: "Open the production-component visual page builder.", inputSchema: {},
  _meta: { "openai/outputTemplate": UI_RESOURCE_URI, "openai/ui": { entrypoints: ["global", "thread"], preferredModelDisplayMode: "fullscreen" }, "openai/widgetAccessible": true, "openai/toolInvocation/invoking": "正在打开页面搭建器…", "openai/toolInvocation/invoked": "页面搭建器已就绪。" }
}, async () => output({ editorUrl, presentation: { entryVersion: 4, provider: "b2b-production", outputTemplate: UI_RESOURCE_URI }, pages: store.list() }));

server.registerTool("component_list", { title: "列出已适配组件", description: "List production B2B components currently verified for the editor.", inputSchema: {} }, async () => output({ provider: "b2b-production", components: catalogList() }));
server.registerTool("component_get", { title: "读取组件能力", description: "Read the exact public props exposed to the page builder for one component.", inputSchema: { componentId: z.string() } }, async ({ componentId }) => handle(() => { const component = COMPONENTS[componentId]; if (!component) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${componentId} 尚未适配。`); return { component }; }));
server.registerTool("page_list", { title: "列出页面", description: "List saved pages and revisions.", inputSchema: {} }, async () => output({ pages: store.list() }));
server.registerTool("page_create", { title: "新建页面", description: "Create an isolated empty page.", inputSchema: { name: z.string().min(1).max(80) } }, async ({ name }) => handle(async () => ({ page: await store.create(name) })));
server.registerTool("page_get_schema", { title: "读取页面", description: "Read the authoritative Page Schema and revision.", inputSchema: { pageId: z.string() } }, async ({ pageId }) => handle(() => ({ page: store.get(pageId), selection: store.selection(pageId) })));
server.registerTool("page_get_selection", { title: "读取选区", description: "Read the selected node for a page.", inputSchema: { pageId: z.string() } }, async ({ pageId }) => handle(() => ({ selection: store.selection(pageId) })));
server.registerTool("page_select_node", { title: "选择节点", description: "Set the shared UI/AI selection.", inputSchema: { pageId: z.string(), nodeId: z.string().nullable() } }, async ({ pageId, nodeId }) => handle(() => ({ selection: store.select(pageId, nodeId) })));
server.registerTool("page_apply_operations", {
  title: "原子修改页面", description: "Apply add, move, update, duplicate, remove, layout, or rename operations atomically with revision protection.",
  inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative(), operations: z.array(z.record(z.unknown())).min(1).max(100) }
}, async ({ pageId, expectedRevision, operations }) => handle(async () => ({ page: await store.apply(pageId, expectedRevision, operations as Operation[]) })));
server.registerTool("page_undo", { title: "撤销页面修改", description: "Undo one committed batch and advance the revision.", inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative() } }, async ({ pageId, expectedRevision }) => handle(async () => ({ page: await store.undo(pageId, expectedRevision) })));
server.registerTool("page_redo", { title: "重做页面修改", description: "Redo one committed batch and advance the revision.", inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative() } }, async ({ pageId, expectedRevision }) => handle(async () => ({ page: await store.redo(pageId, expectedRevision) })));
server.registerTool("page_export", { title: "导出页面工程", description: "Export the committed revision as a self-contained ZIP with B2B runtime assets.", inputSchema: { pageId: z.string() } }, async ({ pageId }) => handle(async () => ({ export: await exportPage(store.get(pageId), uiDirectory, exportDirectory) })));
server.registerTool("page_import", { title: "导入页面描述", description: "Validate and import a Page Builder page.json without overwriting an existing page.", inputSchema: { page: z.record(z.unknown()) } }, async ({ page }) => handle(async () => ({ page: await store.import(page) })));
server.registerTool("page_capture", { title: "获取页面实际画面", description: "Render the requested saved page in Chrome and return a screenshot bound to pageId, revision, and viewport.", inputSchema: { pageId: z.string(), viewport: z.enum(["desktop", "narrow"]).default("desktop") } }, async ({ pageId, viewport }) => {
  try {
    const before = store.get(pageId); const capture = await capturePage(before, editorUrl, viewport); const after = store.get(pageId);
    if (after.revision !== before.revision) throw new DomainError("CAPTURE_STALE", `截图期间页面从 revision ${before.revision} 更新到 ${after.revision}，旧图未返回。`, { currentRevision: after.revision });
    const metadata = { pageId, revision: before.revision, viewport, width: capture.dimensions.width, height: capture.dimensions.height };
    return { content: [{ type: "text" as const, text: JSON.stringify(metadata) }, { type: "image" as const, data: capture.png.toString("base64"), mimeType: "image/png" }], structuredContent: metadata };
  } catch (error) { const err = error instanceof DomainError ? error : new DomainError("CAPTURE_FAILED", error instanceof Error ? error.message : String(error)); return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: { code: err.code, message: err.message, details: err.details } }) }] }; }
});

process.once("SIGTERM", () => editor.close().finally(() => process.exit(0)));
process.once("SIGINT", () => editor.close().finally(() => process.exit(0)));
await server.connect(new StdioServerTransport());
