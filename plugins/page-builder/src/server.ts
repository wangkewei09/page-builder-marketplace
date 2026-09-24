import { ProjectManager } from "./projects.js";
import { refreshLibrary } from "./library-update.js";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { capturePage } from "./capture.js";
import { DomainError, type Operation, validatePage } from "./domain.js";
import { exportPage } from "./exporter.js";
import { createEditorServer } from "./http.js";
import { FilePersistence, PageStore } from "./store.js";
import { ComponentLibraryManager } from "./library.js";
import { nativeAssets, nativeHtml } from "./native-resource.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const uiDirectory = path.join(root, "ui");
const build = JSON.parse(await readFile(path.join(root, "build.json"), "utf8")) as { pluginVersion: string; builtAt: string };
const runtime = { pluginVersion: build.pluginVersion, provider: "b2b-production", serverName: "page-builder-development" };
const dataDirectory = process.env.PAGE_BUILDER_DATA_DIR || path.join(homedir(), ".codex", "page-builder", "v1", "pages");
const exportDirectory = process.env.PAGE_BUILDER_EXPORT_DIR || path.join(homedir(), "Documents", "Page Builder Exports");
const libraryCacheDirectory = process.env.PAGE_BUILDER_LIBRARY_DIR || path.join(homedir(), ".codex", "page-builder", "v1", "component-libraries");
const libraries = new ComponentLibraryManager(libraryCacheDirectory, path.join(uiDirectory, "vendor/b2b")); await libraries.initialize();
const store = new PageStore(new FilePersistence(dataDirectory), () => libraries.binding(), libraries); await store.load();
const projects = new ProjectManager(process.env.PAGE_BUILDER_PROJECTS_DIR || (process.env.PAGE_BUILDER_DATA_DIR ? path.join(dataDirectory, ".projects") : path.join(homedir(), ".codex/page-builder/v1/projects")), store, libraries);
const editor = createEditorServer(store, uiDirectory, exportDirectory, runtime, libraries, projects); const editorUrl = await editor.start();
const UI_RESOURCE_URI = "ui://page-builder-development/editor-v5.html";
const UI_MIME_TYPE = "text/html;profile=mcp-app";
const server = new McpServer({ name: runtime.serverName, version: build.pluginVersion }, { capabilities: { tools: {}, resources: {} } });

function output(value: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }], structuredContent: value as Record<string, unknown> }; }
async function handle<T>(fn: () => Promise<T> | T) { try { return output(await fn()); } catch (error) { const err = error instanceof DomainError ? error : new DomainError("INTERNAL_ERROR", error instanceof Error ? error.message : String(error)); return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: { code: err.code, message: err.message, details: err.details } }) }] }; } }

function registerPageTool<S extends z.ZodRawShape>(name: string, config: { title: string; description: string; inputSchema: S }, handler: (input: z.output<z.ZodObject<S>> & { workspaceId?: string }, store: PageStore) => Promise<CallToolResult>) {
  const inputSchema: z.ZodRawShape = { ...config.inputSchema, workspaceId: z.string().optional().describe("Local workspace ID from project_open/project_create; omit only for legacy pages.") };
  server.registerTool(name, { ...config, inputSchema }, async input => {
    try {
      const result = await handler(input as z.output<z.ZodObject<S>> & { workspaceId?: string }, await projects.store(input.workspaceId as string | undefined));
      return input.workspaceId && result.structuredContent ? { ...result, structuredContent: { ...result.structuredContent, workspaceId: input.workspaceId } } : result;
    }
    catch (error) { return handle(() => { throw error; }); }
  });
}
server.registerTool("project_list", { title: "最近项目", description: "List locally opened Page Builder projects and the default parent directory.", inputSchema: {} }, () => handle(() => projects.list()));
server.registerTool("project_create", { title: "新建本地项目", description: "Create a new local project folder with an initial page and portable component resources; never overwrite an existing directory.", inputSchema: { name: z.string().min(1).max(80), parentDirectory: z.string().optional() } }, input => handle(() => projects.create(input.name, input.parentDirectory)));
server.registerTool("project_open", { title: "打开本地项目", description: "Open and validate a local Page Builder project folder, including a repository already cloned using Git. Returns workspaceId required by page tools.", inputSchema: { directory: z.string(), expectedProjectId: z.string().optional() } }, input => handle(() => projects.open(input.directory, input.expectedProjectId)));
server.registerTool("project_relink", { title: "重新关联项目路径", description: "Validate a moved project against its registered identity and register its new local path. Never move, replace or delete project files.", inputSchema: { workspaceId: z.string(), directory: z.string() } }, input => handle(() => projects.relink(input.workspaceId, input.directory)));
server.registerTool("project_update", { title: "保存项目设置", description: "Update project name, description, starred state and portable cover with optimistic revision checking. Does not rename or move files.", inputSchema: { workspaceId: z.string(), expectedRevision: z.number().int().nonnegative(), name: z.string().min(1).max(80), description: z.string().max(240), starred: z.boolean(), coverImage: z.string().nullable() } }, input => handle(() => projects.update(input.workspaceId, input.expectedRevision, input)));
server.registerTool("project_get", { title: "读取当前项目", description: "Resolve a registered local workspace without changing other editor panels.", inputSchema: { workspaceId: z.string() } }, input => handle(async () => ({ project: await projects.resolve(input.workspaceId), pages: await (await projects.store(input.workspaceId)).list() })));

server.registerResource("page-builder-development-editor", UI_RESOURCE_URI, { title: "页面搭建器（开发版）", description: "Visual editor backed by the authoritative Page Schema", mimeType: UI_MIME_TYPE }, async () => {
  const html = await nativeHtml(uiDirectory, { runtime: { ...runtime, componentLibrary: await libraries.current() }, catalog: Object.values(await libraries.catalog()) });
  return { contents: [{ uri: UI_RESOURCE_URI, mimeType: UI_MIME_TYPE, text: html, _meta: { ui: { prefersBorder: false, csp: { connectDomains: [], resourceDomains: ["data:"], baseUriDomains: [] } }, "openai/widgetPrefersBorder": false } }] };
});

const runtimePayloads = new Map<string, string>();
async function runtimePayload(snapshotId: string) {
  if (!runtimePayloads.has(snapshotId)) {
    const value = JSON.stringify(await nativeAssets(libraries, snapshotId));
    if (runtimePayloads.size >= 2) runtimePayloads.delete(runtimePayloads.keys().next().value!);
    runtimePayloads.set(snapshotId, value);
  }
  return runtimePayloads.get(snapshotId)!;
}
const RESOURCE_CHUNK_SIZE = 1_000_000;
server.registerResource("page-builder-runtime", new ResourceTemplate("page-builder://runtime/{snapshotId}", { list: undefined }), { mimeType: "application/json" }, async (uri, variables) => {
  const snapshotId = String(variables.snapshotId), payload = await runtimePayload(snapshotId);
  const text = payload.length <= RESOURCE_CHUNK_SIZE ? payload : JSON.stringify({ snapshotId, chunkUris: Array.from({ length: Math.ceil(payload.length / RESOURCE_CHUNK_SIZE) }, (_, index) => `page-builder://runtime-chunk/${snapshotId}/${index}`) });
  return { contents: [{ uri: uri.href, mimeType: "application/json", text }] };
});
server.registerResource("page-builder-runtime-chunk", new ResourceTemplate("page-builder://runtime-chunk/{snapshotId}/{index}", { list: undefined }), { mimeType: "text/plain" }, async (uri, variables) => {
  const payload = await runtimePayload(String(variables.snapshotId)), index = Number(variables.index);
  if (!Number.isInteger(index) || index < 0 || index * RESOURCE_CHUNK_SIZE >= payload.length) throw new DomainError("INVALID_RESOURCE_CHUNK", "组件库分段不存在。");
  return { contents: [{ uri: uri.href, mimeType: "text/plain", text: payload.slice(index * RESOURCE_CHUNK_SIZE, (index + 1) * RESOURCE_CHUNK_SIZE) }] };
});

server.registerTool("page_builder_open", {
  title: "打开页面搭建器（开发版）", description: "Open the production-component visual page builder development build.", inputSchema: {},
  _meta: { ui: { resourceUri: UI_RESOURCE_URI }, "openai/outputTemplate": UI_RESOURCE_URI, "openai/ui": { entrypoints: [{ type: "global" }, { type: "thread" }], preferredModelDisplayMode: "fullscreen" }, "openai/widgetAccessible": true, "openai/toolInvocation/invoking": "正在打开页面搭建器（开发版）…", "openai/toolInvocation/invoked": "页面搭建器（开发版）已就绪。" }
}, async () => output({ editorUrl, build, presentation: { entryVersion: 5, provider: runtime.provider, serverName: runtime.serverName, outputTemplate: UI_RESOURCE_URI }, pages: await store.list() }));

registerPageTool("component_list", { title: "列出组件", description: "Read components from the page-pinned library, or the current library for new pages.", inputSchema: { pageId: z.string().optional() } }, async ({ pageId, workspaceId }, store) => handle(async () => { const library = pageId ? await libraries.resolvePage(await store.get(pageId)) : workspaceId ? await libraries.manifest((await projects.resolve(workspaceId)).componentLibrary.snapshotId) : await libraries.current(); return { provider: "b2b-production", library, components: Object.values(await libraries.catalog(library.snapshotId)) }; }));
registerPageTool("component_get", { title: "读取组件能力", description: "Read the source protocol of a component, using pageId to match an existing page.", inputSchema: { componentId: z.string(), pageId: z.string().optional() } }, async ({ componentId, pageId, workspaceId }, store) => handle(async () => { const library = pageId ? await libraries.resolvePage(await store.get(pageId)) : workspaceId ? await libraries.manifest((await projects.resolve(workspaceId)).componentLibrary.snapshotId) : await libraries.current(); const component = (await libraries.catalog(library.snapshotId))[componentId]; if (!component) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${componentId} 尚未适配。`); return { library, component }; }));
server.registerTool("component_library_list", { title: "查看组件库版本", description: "List verified immutable B2B component-library snapshots and the active version for new pages.", inputSchema: {} }, async () => output(await libraries.list()));
registerPageTool("component_library_refresh", { title: "刷新当前页面组件库", description: "Check the independent source, validate the existing page against it, then refresh this page and the default library without reinstalling the plugin. Content and undo history are preserved.", inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative(), sourcePath: z.string().optional() } }, async (input, store) => handle(() => refreshLibrary(libraries, store, input)));
server.registerTool("component_library_check", { title: "检查组件库更新", description: "Validate a local design-source directory as an immutable candidate without switching existing pages.", inputSchema: { sourcePath: z.string().optional() } }, async ({ sourcePath }) => handle(() => libraries.check(sourcePath)));
server.registerTool("component_library_apply", { title: "应用组件库更新", description: "Atomically select a previously validated snapshot for newly created pages. Existing pages remain pinned.", inputSchema: { snapshotId: z.string(), sourcePath: z.string().optional() } }, async ({ snapshotId, sourcePath }) => handle(() => libraries.apply(snapshotId, sourcePath)));
registerPageTool("page_upgrade_component_library", { title: "升级页面组件库", description: "Explicitly bind one page to a verified component-library snapshot with revision protection and undo history.", inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative(), snapshotId: z.string() } }, async ({ pageId, expectedRevision, snapshotId }, store) => handle(async () => ({ page: await store.setLibrary(pageId, expectedRevision, await libraries.binding(snapshotId)), library: await libraries.manifest(snapshotId) })));
registerPageTool("page_list", { title: "列出页面", description: "List saved pages and revisions.", inputSchema: {} }, async (_input, store) => output({ pages: await store.list() }));
registerPageTool("page_create", { title: "新建页面", description: "Create an isolated empty page.", inputSchema: { name: z.string().min(1).max(80) } }, async ({ name }, store) => handle(async () => ({ page: await store.create(name) })));
registerPageTool("page_get_schema", { title: "读取页面", description: "Read the authoritative Page Schema and revision.", inputSchema: { pageId: z.string() } }, async ({ pageId }, store) => handle(async () => { const snapshot = await store.snapshot(pageId); return { ...snapshot, library: await libraries.resolvePage(snapshot.page), components: Object.values(await libraries.catalogForPage(snapshot.page)) }; }));
registerPageTool("page_get_selection", { title: "读取选区", description: "Read the selected node for a page.", inputSchema: { pageId: z.string() } }, async ({ pageId }, store) => handle(async () => ({ selection: await store.selection(pageId) })));
registerPageTool("page_select_node", { title: "选择节点", description: "Set the shared UI/AI selection.", inputSchema: { pageId: z.string(), nodeId: z.string().nullable(), expectedRevision: z.number().int().nonnegative().optional() } }, async ({ pageId, nodeId, expectedRevision }, store) => handle(async () => ({ selection: await store.select(pageId, nodeId, expectedRevision) })));
registerPageTool("page_apply_operations", {
  title: "原子修改页面", description: "Apply add, move, update, duplicate, remove, layout, or rename operations atomically with revision protection.",
  inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative(), operations: z.array(z.record(z.unknown())).min(1).max(100) }
}, async ({ pageId, expectedRevision, operations }, store) => handle(async () => { const page = await store.apply(pageId, expectedRevision, operations as Operation[]); return { page, selection: await store.selection(pageId) }; }));
registerPageTool("page_undo", { title: "撤销页面修改", description: "Undo one committed batch and advance the revision.", inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative() } }, async ({ pageId, expectedRevision }, store) => handle(async () => { const page = await store.undo(pageId, expectedRevision); return { page, selection: await store.selection(pageId) }; }));
registerPageTool("page_redo", { title: "重做页面修改", description: "Redo one committed batch and advance the revision.", inputSchema: { pageId: z.string(), expectedRevision: z.number().int().nonnegative() } }, async ({ pageId, expectedRevision }, store) => handle(async () => { const page = await store.redo(pageId, expectedRevision); return { page, selection: await store.selection(pageId) }; }));
registerPageTool("page_export", { title: "导出页面工程", description: "Export the committed revision as a self-contained ZIP with the page-pinned B2B runtime assets.", inputSchema: { pageId: z.string() } }, async ({ pageId }, store) => handle(async () => { const page = await store.get(pageId); return { export: await exportPage(page, await libraries.directoryForPage(page), exportDirectory) }; }));
registerPageTool("page_import", { title: "导入页面描述", description: "Validate and import a Page Builder page.json without overwriting an existing page; its pinned component library must be available.", inputSchema: { page: z.record(z.unknown()), name: z.string().min(1).max(80).optional() } }, async ({ page, name }, store) => handle(async () => { const candidate = validatePage(structuredClone(page) as never, null); await libraries.resolvePage(candidate); return { page: await store.import(candidate, name) }; }));
registerPageTool("page_capture", { title: "获取页面实际画面", description: "Render the requested saved page in Chrome and return a screenshot bound to pageId, revision, and viewport.", inputSchema: { pageId: z.string(), viewport: z.enum(["desktop", "narrow"]).default("desktop") } }, async ({ pageId, viewport, workspaceId }, store) => {
  try {
    const before = await store.get(pageId); const capture = await capturePage(before, workspaceId ? `${editorUrl}?workspace=${encodeURIComponent(workspaceId)}` : editorUrl, viewport); const after = await store.get(pageId);
    if (after.revision !== before.revision) throw new DomainError("CAPTURE_STALE", `截图期间页面从 revision ${before.revision} 更新到 ${after.revision}，旧图未返回。`, { currentRevision: after.revision });
    const metadata = { ...(workspaceId ? { workspaceId } : {}), pageId, revision: before.revision, viewport, width: capture.dimensions.width, height: capture.dimensions.height };
    return { content: [{ type: "text" as const, text: JSON.stringify(metadata) }, { type: "image" as const, data: capture.png.toString("base64"), mimeType: "image/png" }], structuredContent: metadata };
  } catch (error) { const err = error instanceof DomainError ? error : new DomainError("CAPTURE_FAILED", error instanceof Error ? error.message : String(error)); return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: { code: err.code, message: err.message, details: err.details } }) }] }; }
});

process.once("SIGTERM", () => Promise.all([editor.close(), libraries.close()]).finally(() => process.exit(0)));
process.once("SIGINT", () => Promise.all([editor.close(), libraries.close()]).finally(() => process.exit(0)));
await server.connect(new StdioServerTransport());
