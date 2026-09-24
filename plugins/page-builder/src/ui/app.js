import { createProjectManager } from "./project-manager.js";
import { selectVariantPatch } from "../select-variants.ts";
import { inspectorOptions } from "./inspector-options.js";
import { contractPatch, editorControl, editorFields, matchesConditions } from "../editor-contract.ts";
import { installLibraryTransport } from "./library-transport.js";
import { App } from "@modelcontextprotocol/ext-apps";
import { EmptyResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { contextOwner } from "./context-owner.js";
import { inputVariantPatch } from "../input-variants.ts";
import { cardVariantPatch } from "../card-variants.ts";
import { createCanvasDrag } from "./canvas-drag.js";
import { createCanvasRenderer } from "./canvas-renderer.js";
import { createSelectionToolbar } from "./selection-toolbar.js";
import { createInlineEditor } from "./inline-editor.js";

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const state = { page: null, library: null, loadedLibraryId: null, catalog: [], selection: null, selectedIds: new Set(), preview: false, uiSlots: new Map(), editTimers: new Map(), fullPropsDirty: false, dragging: null, searchQuery: "", leftTab: "components", viewport: "desktop", inspectorOpen: false, lastCommittedAt: 0, renderEpoch: 0, selectionEpoch: 0, mutating: 0, polling: false, runtime: null };
let workspaceId = new URL(location.href).searchParams.get("workspace") || null, currentProject = null, projectDialogOpen = false, switchingProject = false, workspaceEpoch = 0;
let mutationQueue = Promise.resolve();
let pendingSelections = 0, inspectorRendering = false;
let inspectorQueue = Promise.resolve();
const labels = { column: "纵向布局", row: "横向布局", columns: "分栏布局" };
const host = { app: null, status: "standalone", error: null };
const native = window.__pageBuilderNative;
const editorTemplate = $("#app").innerHTML;
let runtimeTransport = null, runtimeAssets = null, runtimeEpoch = 0;
let reloadingRuntime = false, runtimeReloadFailed = false;
let contextLease = null;
let contextQueue = Promise.resolve();
let contextNodeIds = [], contextEpoch = 0, inspectorKey = null, renderedPageName = null;
let contextStatusKind = "ready";
const uiGenerations = new Map();
const canvasDrag = createCanvasDrag({
  canStart: () => {
    if (inlineEditor.active || state.preview || !state.page || state.mutating || state.editTimers.size || reloadingRuntime || runtimeReloadFailed) return false;
    if (state.fullPropsDirty) { toast("请先应用或取消其他设置的修改。", "error"); return false; }
    if (state.selectedIds.size > 1) { toast("请先单击要移动的组件，再拖动。", "error"); return false; }
    return true;
  },
  labelFor: drag => {
    const node = drag.kind === "existing" ? findNode(state.page.root, drag.id)?.node : null;
    return node ? node.kind === "layout" ? labels[node.layout] : definition(node.componentId)?.label : drag.kind === "layout" ? labels[drag.id] : definition(drag.id)?.label;
  },
  onStart: drag => { state.dragging = drag; selectionToolbar.position(); },
  onEnd: () => { state.dragging = null; selectionToolbar.position(); },
  onDrop: (drag, parentId, index) => drag.kind === "existing"
    ? commit([{ type: "move", nodeId: drag.id, parentId, index }], "组件已移动")
    : addNode(drag.kind, drag.id, parentId, index)
});
const canvasRenderer = createCanvasRenderer({
  renderComponent: (component, target) => window.B2B.renderComponent(component, target),
  beforeCommit: () => canvasDrag.cancel(false),
  onSelect: (id, event) => {
    if (state.dragging || reloadingRuntime || runtimeReloadFailed) return;
    select(id === state.page.root.id ? null : id, event);
  },
  onDragStart: (event, id) => canvasDrag.begin(event, { kind: "existing", id }),
  labelFor: layout => labels[layout]
});
const selectionToolbar = createSelectionToolbar({
  canShow: () => !projectDialogOpen && !inlineEditor.active && !state.preview && !state.dragging && !reloadingRuntime,
  clear: () => clearUiPrefix("node-action-"),
  actions: id => state.selectedIds.size > 1 ? [
    { key: "count", badge: true, label: `已选 ${state.selectedIds.size} 项` },
    ...(host.status === "connected" ? [{ key: "context", icon: "add_comment", label: `加入 AI 上下文（${state.selectedIds.size}）`, run: () => attachContext() }] : [])
  ] : [
    { key: "up", icon: "arrow_upward", label: "上移", iconOnly: true, run: () => moveSibling(id, -1) },
    { key: "down", icon: "arrow_downward", label: "下移", iconOnly: true, run: () => moveSibling(id, 1) },
    { key: "copy", icon: "content_copy", label: "复制", run: () => commit([{ type: "duplicate", nodeId: id }], "已复制") },
    { key: "delete", icon: "delete", label: "删除", variant: "secondary-danger", run: () => commit([{ type: "remove", nodeId: id }], "已删除") },
    ...(host.status === "connected" ? [{ key: "context", icon: "add_comment", label: "加入 AI 上下文", run: () => attachContext() }] : [])
  ],
  mount: (element, action, id) => action.badge
    ? mountUi(`node-action-${id}-${action.key}`, element, "C-42", { variant: "status", type: "status", size: "small", color: "neutral", text: action.label, icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: false, bordered: false, solid: false, disabled: false })
    : mountUi(`node-action-${id}-${action.key}`, element, action.iconOnly ? "C-04" : "C-02",
      action.iconOnly ? iconProps(action.icon, action.label) : { ...buttonProps(action.label, action.variant || "secondary-gray", action.icon), size: "mini" },
      { [action.iconOnly ? "b2b:icon-activate" : "b2b:button-activate"]: () => action.run() })
});
const inlineEditor = createInlineEditor({
  canEdit: () => Boolean(state.page && !state.preview && !state.dragging && !state.mutating && !state.fullPropsDirty && !state.editTimers.size && !reloadingRuntime && !runtimeReloadFailed),
  getNode: id => findNode(state.page.root, id)?.node, getRevision: () => state.page.revision,
  definition, labelFor: componentPropLabel, select,
  onChange: () => { lockInspector(); selectionToolbar.position(); },
  status: message => { const hint = $("#selection-hint"); if (hint) { hint.textContent = message || "⌘ / Ctrl + 点击多选"; hint.setAttribute("role", "status"); hint.setAttribute("aria-live", "polite"); } },
  save: (node, property, value, expectedRevision) => {
    const run = async () => {
      state.mutating += 1; lockInspector(); setSaving("saving", "正在保存");
      try {
        const rule = definition(node.componentId).props[property];
        const next = value === "" && rule.type.includes("null") ? null : value;
        const result = await api(`./api/pages/${state.page.pageId}/operations`, { method: "POST", body: JSON.stringify({ expectedRevision, operations: [{ type: "updateProps", nodeId: node.id, props: componentPatch(node, property, next) }] }) });
        acceptSavedPage(result, state.selectionEpoch); state.lastCommittedAt = Date.now();
        await renderAll(); await syncModelContext(); setSaving("", "已保存");
      } catch (error) { setSaving("error", "未保存"); throw error; }
      finally { state.mutating -= 1; lockInspector(); }
    };
    const result = mutationQueue.then(run); mutationQueue = result.catch(() => {}); return result;
  }
});
function validIds(ids) { return [...new Set(ids)].filter(id => id && state.page && findNode(state.page.root, id)); }
function setSelection(nodeId, preserveGroup = false) {
  const ids = validIds(state.selectedIds);
  if (preserveGroup || nodeId === state.selection) {
    state.selectedIds = new Set(ids.length ? ids : validIds([nodeId]));
    state.selection = state.selectedIds.has(nodeId) ? nodeId : [...state.selectedIds].at(-1) || null;
  } else { state.selection = nodeId; state.selectedIds = new Set(validIds([nodeId])); }
}
async function attachContext(ids = [...state.selectedIds]) {
  if (host.status === "failed" && !host.app) await connectHost();
  contextNodeIds = validIds(ids); contextEpoch += 1; contextLease?.claim();
  await syncModelContext();
}
function contextReadyStatus(force = false) {
  if (host.status !== "connected") return;
  if (!force && ["connecting", "failed"].includes(contextStatusKind)) return;
  const nodes = validIds(contextNodeIds).map(id => findNode(state.page.root, id).node);
  const label = nodes.length > 1 ? `${nodes.length} 项` : nodes[0] && (nodes[0].kind === "layout" ? labels[nodes[0].layout] : definition(nodes[0].componentId)?.label);
  const same = nodes.length > 0 && nodes.length === state.selectedIds.size && nodes.every(node => state.selectedIds.has(node.id));
  const action = same ? "重新同步" : state.selectedIds.size > 1 ? `加入 AI 上下文（${state.selectedIds.size}）` : "加入 AI 上下文";
  setContextStatus(nodes.length ? "synced" : "ready", nodes.length ? `对话已引用：${label}` : "选中后点击按钮加入 AI 上下文", action);
}

function clearPublishedContext() {
  contextQueue = contextQueue.catch(() => {}).then(async () => {
    // A structuredContent object containing null still creates a Codex attachment.
    if (host.status === "connected" && host.app) await host.app.request({ method: "ui/update-model-context", params: { content: [] } }, EmptyResultSchema, { timeout: 3000 });
    return true;
  }).catch(error => { host.error = error; setContextStatus("failed", `清除上下文失败：${error.message}`, "重试同步"); return false; });
  return contextQueue;
}
function startup(message) { const el = $("#startup-status"); if (el) { el.hidden = !message; el.textContent = message || ""; } }

async function nativeApi(path, options) {
  if (path === "./api/health") return native.runtime;
  if (path === "./api/catalog") return { components: native.catalog };
  const input = { ...JSON.parse(options.body || "{}"), ...((options.workspaceId || (!options.unscoped && workspaceId)) ? { workspaceId: options.workspaceId || workspaceId } : {}) };
  let name, args = input;
  if (path === "./api/projects") name = options.method === "POST" ? "project_create" : "project_list";
  else if (path === "./api/projects/choose-directory") name = "project_choose_directory";
  else if (path === "./api/projects/directory-choice") name = "project_directory_choice";
  else if (path === "./api/projects/cancel-directory-choice") name = "project_cancel_directory_choice";
  else if (path === "./api/projects/open") name = "project_open";
  else if (path === "./api/projects/relink") name = "project_relink";
  else if (path === "./api/projects/settings") name = "project_update";
  else if (path === "./api/projects/current") name = "project_get";
  else if (path === "./api/import") name = "page_import";
  else if (path === "./api/libraries") name = "component_library_list";
  else if (path === "./api/libraries/refresh") name = "component_library_refresh";
  else if (path === "./api/pages") name = options.method === "POST" ? "page_create" : "page_list";
  else {
    const match = path.match(/^\.\/api\/pages\/([\w-]+)(?:\/(operations|selection|undo|redo|export))?$/);
    if (!match) throw new Error(`原生入口不支持请求：${path}`);
    name = ({ operations: "page_apply_operations", selection: "page_select_node", undo: "page_undo", redo: "page_redo", export: "page_export" })[match[2]] || "page_get_schema";
    args = { ...input, pageId: match[1] };
  }
  const result = await host.app.callServerTool({ name, arguments: args });
  const payload = result.structuredContent || JSON.parse(result.content?.find(item => item.type === "text")?.text || "{}");
  if (result.isError) { const error = new Error(payload.error?.message || "插件请求失败"); error.code = payload.error?.code; throw error; }
  return payload;
}

async function api(path, options = {}) {
  if (native) return nativeApi(path, options);
  const requestWorkspace = options.workspaceId || (!options.unscoped && workspaceId);
  if (requestWorkspace) path += `${path.includes("?") ? "&" : "?"}workspace=${encodeURIComponent(requestWorkspace)}`;
  const response = await fetch(path, { headers: { "content-type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await response.json();
  if (!response.ok) { const error = new Error(payload.error?.message || "请求失败"); error.code = payload.error?.code; error.details = payload.error?.details; throw error; }
  return payload;
}

function clearUiSlot(key) { uiGenerations.set(key, (uiGenerations.get(key) || 0) + 1); const slot = state.uiSlots.get(key); if (!slot) return; slot.listeners.forEach(([name, listener]) => slot.host.removeEventListener(name, listener)); if (!slot.instance.destroyed) slot.instance.destroy(); slot.host.removeAttribute("data-ui-renderer"); slot.host.removeAttribute("data-ui-renderer-valid"); state.uiSlots.delete(key); }
function clearUiPrefix(prefix) { for (const key of [...new Set([...state.uiSlots.keys(), ...uiGenerations.keys()])]) if (key.startsWith(prefix)) clearUiSlot(key); }
async function mountUi(key, hostElement, component, props, handlers = {}) {
  const epoch = runtimeEpoch;
  clearUiSlot(key); const generation = uiGenerations.get(key); const hostElementRef = typeof hostElement === "string" ? $(hostElement) : hostElement; if (!hostElementRef) return null; hostElementRef.replaceChildren();
  const listeners = Object.entries(handlers).map(([name, handler]) => {
    const listener = event => { if (epoch === runtimeEpoch && generation === uiGenerations.get(key)) handler(event); };
    hostElementRef.addEventListener(name, listener); return [name, listener];
  });
  try {
    const result = await window.B2B.renderComponent({ component, props }, hostElementRef);
    if (epoch !== runtimeEpoch || generation !== uiGenerations.get(key) || !hostElementRef.isConnected) { result.instance.destroy(); listeners.forEach(([name, listener]) => hostElementRef.removeEventListener(name, listener)); return null; }
    hostElementRef.dataset.uiRenderer = component; hostElementRef.dataset.uiRendererValid = String(result.audit.valid); state.uiSlots.set(key, { instance: result.instance, listeners, host: hostElementRef }); return result.instance;
  } catch (error) { hostElementRef.textContent = `控件加载失败：${error.message}`; hostElementRef.classList.add("ui-control-error"); console.error(error); return null; }
}
function toast(message, variant = "success") {
  const el = $("#toast"); el.classList.add("is-visible"); clearTimeout(toast.timer);
  void mountUi("toast", el, "C-49", { variant, title: "", text: message, action: null, closable: false, actionLayout: "inline", alignment: "start", icon: null });
  toast.timer = setTimeout(() => { el.classList.remove("is-visible"); clearUiSlot("toast"); }, 2400);
}
function setSaving(kind, text) {
  const color = kind === "error" ? "red" : kind === "saving" ? "orange" : "green";
  void mountUi("save-state", "#save-state", "C-42", { variant: "status", type: "status", size: "small", color, text, icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: kind === "saving", bordered: false, solid: false, disabled: false });
}
function timeout(promise, ms, message) { return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))]); }
function setContextStatus(kind, text, action = "加入 AI 上下文") {
  contextStatusKind = kind;
  const el = $("#context-status"); const button = $("#sync-context"); if (!el || !button) return;
  el.title = text;
  const disabled = kind === "connecting" || kind === "standalone" || kind === "unsupported" || !state.selection && kind !== "failed";
  const color = kind === "failed" ? "red" : kind === "synced" ? "green" : kind === "connecting" ? "orange" : "neutral";
  void mountUi("context-status", el, "C-42", { variant: "status", type: "status", size: "extra-small", color, text, icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: kind === "connecting", bordered: false, solid: false, disabled: false });
  void mountUi("sync-context", button, "C-02", { label: action, variant: "secondary-blue", size: "mini", icon: null, disabled, loading: kind === "connecting", width: "default" }, { "b2b:button-activate": () => attachContext(kind === "failed" && contextNodeIds.length ? contextNodeIds : undefined) });
}
function nodeCount(node) { return 1 + (node.kind === "layout" ? node.children.reduce((sum, child) => sum + nodeCount(child), 0) : 0); }
function findNode(node, id, parent = null) { if (node.id === id) return { node, parent }; if (node.kind === "layout") for (const child of node.children) { const found = findNode(child, id, node); if (found) return found; } return null; }
function definition(id) { return state.catalog.find((item) => item.id === id); }

const projectManager = createProjectManager({ api, mountUi, clearUiPrefix, inputProps, buttonProps,
  current: () => ({ project: currentProject, page: state.page }),
  setOpen: value => { projectDialogOpen = value; document.body.classList.toggle("is-project-home", value); selectionToolbar.position(); },
  changed: async project => { if (currentProject?.workspaceId === project.workspaceId) { currentProject = project; await renderChrome(); } },
  settle: async () => {
    if (switchingProject || reloadingRuntime || refreshingLibrary) return false;
    if (!await inlineEditor.finish()) return false;
    if (state.fullPropsDirty) { toast("请先应用或取消其他设置的修改，再切换项目。", "error"); return false; }
    canvasDrag.cancel(false);
    // Debounced edits still target the current page until navigation is allowed.
    const deadline = Date.now() + 5000;
    while ((state.editTimers.size || state.mutating || pendingSelections || state.polling) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 40));
    await mutationQueue; await inspectorQueue;
    if (state.editTimers.size || state.mutating || pendingSelections || state.polling) { toast("正在保存，请稍后打开项目。", "error"); return false; }
    return true;
  },
  enter: async (project, pageId) => {
    if (switchingProject) return;
    switchingProject = true; workspaceEpoch += 1; state.selectionEpoch += 1;
    const previousWorkspace = workspaceId, previousProject = currentProject, previousPageId = state.page.pageId, previousUrl = location.href;
    try {
      workspaceId = project?.workspaceId || null; currentProject = project;
      if (!pageId) pageId = (await api("./api/pages", { method: "POST", body: JSON.stringify({ name: "首页" }) })).page.pageId;
      // Resolve before releasing the current view; a failed open keeps it usable.
      const next = await api(`./api/pages/${pageId}`);
      const url = new URL(location.href);
      if (!native) { if (workspaceId) url.searchParams.set("workspace", workspaceId); else url.searchParams.delete("workspace"); url.searchParams.set("page", pageId); window.history.replaceState(null, "", url); }
      await contextLease?.close(); contextNodeIds = []; contextEpoch += 1;
      if (!native && state.loadedLibraryId !== next.library.snapshotId) { location.reload(); return; }
      state.preview = false; state.fullPropsDirty = false; inspectorKey = null; renderedPageName = null; setSelection(null, true);
      await loadPage(pageId); await renderChrome(); await renderLibrarySettings(); renderLibrary();
      contextLease = contextOwner(`${workspaceId || "legacy"}:${pageId}`, () => { contextNodeIds = []; contextEpoch += 1; return clearPublishedContext(); });
      contextReadyStatus(true); setSaving("", "已保存"); startup(null);
    } catch (error) {
      workspaceId = previousWorkspace; currentProject = previousProject;
      if (!native) window.history.replaceState(null, "", previousUrl);
      try {
        await loadPage(previousPageId); await renderChrome(); runtimeReloadFailed = false;
        for (const selector of [".topbar", ".workspace", ".right-panel", "#component-list", "#layout-list", "#tree"]) if ($(selector)) $(selector).inert = false;
        lockInspector(); startup(null);
      }
      catch { $(".workspace").inert = true; startup("项目切换失败，当前画布已停止编辑。请重新打开搭建器，已保存内容仍在本地。"); }
      throw error;
    }
    finally { switchingProject = false; }
  }
});

async function bootstrap() {
  if (native) { startup("正在连接插件服务…"); await connectHost(); if (!host.app) throw host.error || new Error("插件服务未连接"); }
  startup("正在读取已保存页面…");
  if (workspaceId) currentProject = (await api("./api/projects/current")).project;
  const [health, catalog, pages] = await Promise.all([api("./api/health"), api("./api/catalog"), api("./api/pages")]); state.runtime = health; state.catalog = catalog.components;
  let pageId = new URL(location.href).searchParams.get("page"); if (!pageId || !pages.pages.some((page) => page.pageId === pageId)) pageId = pages.pages[0]?.pageId;
  if (!pageId) pageId = (await api("./api/pages", { method: "POST", body: JSON.stringify({ name: "我的页面" }) })).page.pageId;
  await loadPage(pageId); await renderChrome(); await renderLibrarySettings(); setSaving("", "已保存"); renderLibrary(); $("#provider-status").textContent = `真实 B2B Renderer · ${state.catalog.length} 个已适配组件 · ${health.pluginVersion}`;
  if (!native) await connectHost();
  contextLease = contextOwner(`${workspaceId || "legacy"}:${state.page.pageId}`, () => {
    contextNodeIds = []; contextEpoch += 1; setContextStatus("ready", "上下文已由另一个面板接管"); return clearPublishedContext();
  });
  const cleared = await clearPublishedContext();
  if (cleared) contextReadyStatus(true);
  selectionToolbar.reset(); await renderSelection();
  startup(null); window.setInterval(refreshFromDisk, 700);
}

async function readRuntimeAssets(snapshotId) {
  const resource = await host.app.readServerResource({ uri: `page-builder://runtime/${snapshotId}` });
  let payload = JSON.parse(resource.contents.find(item => typeof item.text === "string").text);
  if (payload.chunkUris) {
    const parts = [];
    for (let index = 0; index < payload.chunkUris.length; index += 4) {
      parts.push(...await Promise.all(payload.chunkUris.slice(index, index + 4).map(async uri => {
        const part = await host.app.readServerResource({ uri }); return part.contents.find(item => typeof item.text === "string").text;
      })));
    }
    payload = JSON.parse(parts.join(""));
  }
  return payload.assets;
}

async function loadRuntime(library, assets) {
  const snapshotId = library?.snapshotId || "bundled-legacy"; if (state.loadedLibraryId === snapshotId && window.B2B) return;
  if (!native && state.loadedLibraryId && state.loadedLibraryId !== snapshotId) { location.reload(); return new Promise(() => {}); }
  if (native) {
    startup("正在加载页面组件库…");
    runtimeAssets = assets || await readRuntimeAssets(snapshotId);
    runtimeTransport = installLibraryTransport(runtimeAssets);
    await runtimeTransport.script("components/runtime/loader.js");
    await window.B2B.componentRuntimeReady; state.loadedLibraryId = snapshotId; return;
  }
  const source = library?.snapshotId ? `./api/libraries/${library.snapshotId}/assets/components/runtime/loader.js` : "./vendor/b2b/components/runtime/loader.js";
  await new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = source; script.addEventListener("load", resolve, { once: true }); script.addEventListener("error", () => reject(new Error(`组件库加载失败：${source}`)), { once: true }); document.head.append(script); });
  state.loadedLibraryId = snapshotId;
}

async function loadPage(pageId) { state.selectionEpoch += 1; const result = await api(`./api/pages/${pageId}`); if (native && state.loadedLibraryId && result.library?.snapshotId !== state.loadedLibraryId) return reloadNativePage(result); state.page = result.page; if (result.components) state.catalog = result.components; state.library = result.library || state.runtime?.componentLibrary || null; setSelection(result.selection.nodeId); await loadRuntime(state.library); await renderAll(); }

async function rebuildNativePage(result, assets) {
  runtimeEpoch += 1; state.renderEpoch += 1;
  inlineEditor.cancel(); canvasRenderer.reset(); selectionToolbar.reset(); inspectorKey = null; renderedPageName = null; clearUiPrefix(""); clearTimeout(toast.timer);
  runtimeTransport?.dispose(); runtimeTransport = null; state.loadedLibraryId = null;
  $("#app").innerHTML = editorTemplate;
  state.page = result.page; state.library = result.library; state.catalog = result.components;
  setSelection(result.selection?.nodeId ?? null, true); state.selectionEpoch += 1;
  await loadRuntime(state.library, assets);
  await renderAll(); await renderChrome(); await renderLibrarySettings(); renderLibrary();
  $("#canvas-frame").classList.toggle("is-mobile", state.viewport === "mobile");
  $("#provider-status").textContent = `真实 B2B Renderer · ${state.catalog.length} 个已适配组件 · ${state.runtime.pluginVersion}`;
  setSaving("", "已保存");
}

async function reloadNativePage(result) {
  canvasDrag.cancel(false);
  const previous = { page: state.page, library: state.library, components: state.catalog, selection: { nodeId: state.selection } };
  const previousAssets = runtimeAssets, settingsOpen = $(".library-settings")?.open;
  reloadingRuntime = true; $("#app").inert = true;
  let rebuilding = false;
  try {
    startup("正在重载组件库，页面内容已保留…");
    // Fetch completely before releasing the currently usable runtime.
    const assets = await readRuntimeAssets(result.library.snapshotId);
    await clearPublishedContext();
    rebuilding = true;
    await rebuildNativePage({ ...result, selection: result.selection || previous.selection }, assets);
    runtimeReloadFailed = false;
    await syncModelContext();
  } catch (error) {
    runtimeReloadFailed = true;
    if (rebuilding && previousAssets) {
      try { await rebuildNativePage(previous, previousAssets); }
      catch {
        // Recovery must remain usable even when no design-system control can mount.
        const retry = document.createElement("button"); retry.textContent = "重试加载组件";
        retry.addEventListener("click", () => refreshLibrarySource()); $("#library-refresh").replaceChildren(retry);
      }
    }
    // The server may already have committed the new binding. Keep its revision for retry.
    state.page = result.page;
    throw error;
  } finally {
    reloadingRuntime = false; $("#app").inert = false; startup(null);
    if ($(".library-settings")) $(".library-settings").open = settingsOpen;
    for (const selector of [".topbar", ".workspace", ".right-panel", "#component-list", "#layout-list", "#tree"]) if ($(selector)) $(selector).inert = runtimeReloadFailed;
    lockInspector(); selectionToolbar.position();
  }
}

async function connectHost() {
  if (window.parent === window) { host.status = "standalone"; setContextStatus("standalone", "独立浏览器模式 · 未连接 Codex 对话"); return; }
  if (window.B2B) setContextStatus("connecting", "正在连接 Codex 对话上下文…");
  const app = new App({ name: "page-builder-development-ui", version: state.runtime?.pluginVersion || "development" });
  app.onteardown = async () => {
    inlineEditor.cancel(); canvasDrag.cancel(false);
    state.selectionEpoch += 1; contextEpoch += 1; contextNodeIds = [];
    selectionToolbar.reset(); canvasRenderer.reset();
    if (contextLease) await contextLease.close(); else await clearPublishedContext();
    return {};
  };
  try {
    await timeout(app.connect(), 2500, "宿主初始化超时");
    host.app = app;
    if (!app.getHostCapabilities()?.updateModelContext) { host.status = "unsupported"; if (window.B2B) setContextStatus("unsupported", "宿主未开放对话上下文能力"); return; }
    host.status = "connected"; if (window.B2B) setContextStatus("ready", state.selection ? "已连接 · 可同步当前组件" : "已连接 · 请选择组件");
  } catch (error) {
    await app.close().catch(() => undefined); host.status = "failed"; host.error = error; if (window.B2B) setContextStatus("failed", `对话连接失败：${error.message}`, "重试连接");
  }
}

function modelContext() {
  const nodes = validIds(contextNodeIds).map(id => {
    const { node, parent } = findNode(state.page.root, id);
    return { nodeId: node.id, parentId: parent?.id ?? null, kind: node.kind, ...(node.kind === "component" ? { componentId: node.componentId, props: node.props } : { layout: node.layout, gap: node.gap, columns: node.columns ?? null }) };
  });
  if (!nodes.length) return { content: [] };
  const summary = { ...(currentProject ? { workspaceId, projectId: currentProject.projectId, projectName: currentProject.name } : {}), pageId: state.page.pageId, revision: state.page.revision, nodeIds: nodes.map(node => node.nodeId), nodes, ...(nodes.length === 1 ? nodes[0] : {}) };
  const label = nodes.length > 1 ? `${nodes.length} 项选中内容` : nodes[0].kind === "component" ? `${nodes[0].componentId} ${definition(nodes[0].componentId)?.label || "组件"}` : labels[nodes[0].layout];
  const identity = nodes.length === 1 ? `nodeId=${nodes[0].nodeId}` : `nodeIds=${summary.nodeIds.join(",")}`;
  return { content: [{ type: "text", text: `页面搭建器引用组件：${label}；${workspaceId ? `workspaceId=${workspaceId}；` : ""}pageId=${summary.pageId}；${identity}；revision=${summary.revision}。` }], structuredContent: { pageBuilderSelection: summary }, presentation: { composerLabel: `页面搭建器 · ${label}` } };
}

function syncModelContext() {
  const epoch = contextEpoch;
  contextQueue = contextQueue.catch(() => {}).then(() => publishModelContext(epoch)); return contextQueue;
}
async function publishModelContext(epoch) {
  if (host.status !== "connected" || !host.app || !contextLease?.active || epoch !== contextEpoch) return;
  contextNodeIds = validIds(contextNodeIds);
  setContextStatus("connecting", contextNodeIds.length ? "正在同步引用组件…" : "正在清除对话引用…");
  try {
    await host.app.request({ method: "ui/update-model-context", params: modelContext() }, EmptyResultSchema, { timeout: 3000 });
    if (epoch !== contextEpoch || !contextLease?.active) return;
    contextReadyStatus(true);
  } catch (error) {
    if (epoch !== contextEpoch || !contextLease?.active) return;
    host.error = error; setContextStatus("failed", `同步失败：${error.message}`, "重试同步");
  }
}

async function refreshFromDisk() {
  if (projectDialogOpen || switchingProject || !state.page || state.fullPropsDirty || inlineEditor.active || state.dragging || state.mutating || pendingSelections || state.polling || reloadingRuntime || runtimeReloadFailed) return;
  state.polling = true; const scopeEpoch = workspaceEpoch;
  try {
    const result = await api(`./api/pages/${state.page.pageId}`); if (scopeEpoch !== workspaceEpoch || projectDialogOpen || switchingProject || state.fullPropsDirty || inlineEditor.active || state.dragging || state.mutating || pendingSelections || reloadingRuntime) return; const nextLibrary = result.library || state.runtime?.componentLibrary || null;
    if (nextLibrary?.snapshotId && state.library?.snapshotId && nextLibrary.snapshotId !== state.library.snapshotId) {
      if (state.fullPropsDirty || state.editTimers.size) return;
      if (native) await reloadNativePage(result); else location.reload(); return;
    }
    const pageChanged = result.page.revision !== state.page.revision; const selectionChanged = result.selection.nodeId !== state.selection;
    if (pageChanged || selectionChanged) { state.page = result.page; if (result.components) state.catalog = result.components; state.library = nextLibrary; setSelection(result.selection.nodeId); state.selectionEpoch += 1; if (pageChanged) { await renderAll(); await syncModelContext(); } else renderSelection(); }
  } catch (error) { if (runtimeReloadFailed) $("#library-update-status").textContent = `组件库重载失败，保留原显示，请重试：${error.message}`; else console.warn("页面刷新失败", error); }
  finally { state.polling = false; }
}

function scheduleEdit(key, callback, delay = 420) {
  clearTimeout(state.editTimers.get(key));
  state.editTimers.set(key, setTimeout(() => { state.editTimers.delete(key); void callback(); }, delay));
}

function buttonProps(label, variant = "secondary-gray", icon = null, width = "default") { return { label, variant, size: "medium", icon, disabled: false, loading: false, width }; }
function iconProps(icon, label) { return { icon, label, size: 24, variant: "Button_Icon", disabled: false, tooltip: true, items: [] }; }
function inputProps(label, value, variant = "基础输入框") { return { variant, size: "medium", state: "default", label, value: value ?? "", placeholder: `请输入${label}`, clearable: false, counter: false, maxLength: variant === "长文本输入框" ? 240 : 2000, borderless: false, password: false, prefixIcon: null, suffixIcon: null, infoTooltip: null, min: 0, max: 999, step: 1, prefixAddon: null, suffixAddon: null, tag: null, composite: null, auto: false }; }
function selectProps(items, value, placeholder) { return { variant: "基础单选", items, selected: value == null ? [] : [String(value)], multiple: false, open: false, placeholder, clearable: false, searchable: false, creatable: false, query: "", size: "medium", state: "default", position: "bottom-left" }; }

async function renderChrome() {
  await mountUi("project-menu", "#project-menu", "C-02", buttonProps(currentProject?.name || "项目", "secondary-gray", "folder_open"), { "b2b:button-activate": () => projectManager.show() });
  $("#project-menu").title = currentProject?.directory || "创建或打开本地项目";
  $("#breadcrumb").textContent = currentProject ? `${currentProject.name} / 项目画布 / 页面` : "历史页面";
  const family = await window.B2B.describeComponentFamily("button");
  document.body.dataset.buttonFamily = family?.family || "button";
  const pageNameChange = (event) => { const value = String(event.detail?.value ?? "").trim(); if (value && value !== state.page.name) scheduleEdit("page-name", () => commit([{ type: "rename", name: value }])); };
  await mountUi("page-name", "#page-name", "C-21", inputProps("页面名称", state.page.name), { "b2b:input-change": pageNameChange }); renderedPageName = state.page.name;
  $(".brand-mark").replaceChildren(libraryIcon("dashboard_customize"));
  await mountUi("undo", "#undo", "C-04", iconProps("undo", "撤销"), { "b2b:icon-activate": () => history("undo") });
  await mountUi("redo", "#redo", "C-04", iconProps("redo", "重做"), { "b2b:icon-activate": () => history("redo") });
  const desktopPanel = document.createElement("span"); const mobilePanel = document.createElement("span");
  await mountUi("viewport", "#viewport-tabs", "C-41", { variant: "capsule", size: "small", items: [{ id: "desktop", label: "桌面", content: desktopPanel, disabled: false, badge: null, closable: false }, { id: "mobile", label: "移动", content: mobilePanel, disabled: false, badge: null, closable: false }], panelContainer: $("#viewport-panels"), activeId: state.viewport, ariaLabel: "画布视口", activation: "automatic", addable: false, scrollable: false, overflowItems: [] }, { "b2b:tabs-change": (event) => { state.viewport = event.detail.activeId; $("#canvas-frame").classList.toggle("is-mobile", state.viewport === "mobile"); } });
  await mountUi("toggle-inspector", "#toggle-inspector", "C-04", iconProps("tune", "显示或隐藏属性面板"), { "b2b:icon-activate": () => { state.inspectorOpen = !state.inspectorOpen; $("#app").classList.toggle("is-inspector-open", state.inspectorOpen); selectionToolbar.position(); } });
  await renderPreviewButton();
  await mountUi("export", "#export", "C-02", buttonProps("导出", "primary", "download"), { "b2b:button-activate": async () => { try { setSaving("saving", "正在导出"); const result = await api(`./api/pages/${state.page.pageId}/export`, { method: "POST", body: "{}" }); setSaving("", "已保存"); toast(`已导出 revision ${result.export.revision}`); } catch (error) { fail(error); } } });
  const componentsPanel = $("#components-panel"); const structurePanel = $("#structure-panel");
  $("#left-panels").replaceChildren();
  await mountUi("left-tabs", "#left-tabs", "C-41", { variant: "line", size: "medium", items: [{ id: "components", label: "组件", content: componentsPanel, disabled: false, badge: null, closable: false }, { id: "structure", label: "结构", content: structurePanel, disabled: false, badge: null, closable: false }], panelContainer: $("#left-panels"), activeId: state.leftTab, ariaLabel: "编辑器侧栏", activation: "automatic", addable: false, scrollable: false, overflowItems: [] }, { "b2b:tabs-change": (event) => { state.leftTab = event.detail.activeId; } });
  await mountUi("component-search", "#component-search", "C-21", { ...inputProps("搜索组件", state.searchQuery, "带图标输入框"), prefixIcon: "search" }, { "b2b:input-change": (event) => { state.searchQuery = String(event.detail?.value ?? ""); renderLibrary(); } });
}

async function renderPreviewButton() {
  await mountUi("preview", "#preview", "C-02", buttonProps(state.preview ? "返回编辑" : "预览", "secondary-gray", state.preview ? "edit" : "visibility"), { "b2b:button-activate": async () => { if (inlineEditor.active) return; state.preview = !state.preview; await renderPreviewButton(); await renderAll(); } });
}

let librarySource = "", refreshingLibrary = false;
async function renderLibrarySettings() {
  $("#library-update-status").textContent = "修改组件库后点击刷新，当前页面的文字和排列会保留。";
  const status = await api("./api/libraries"); librarySource = status.sourcePath || "";
  $("#library-version").textContent = `当前版本：${state.library.snapshotId} · ${state.catalog.length} 个已适配组件`;
  await mountUi("source-settings-path", "#library-source", "C-21", inputProps("组件库源目录", librarySource), { "b2b:input-change": event => { librarySource = event.detail.value; } });
  await mountUi("source-settings-refresh", "#library-refresh", "C-02", buttonProps("刷新并重载组件", "secondary-blue"), { "b2b:button-activate": () => refreshLibrarySource() });
}
async function refreshLibrarySource() {
  const status = $("#library-update-status");
  if (inlineEditor.active || refreshingLibrary || state.mutating || state.editTimers.size || state.fullPropsDirty) { status.textContent = state.fullPropsDirty ? "请先应用其他设置，再刷新组件库。" : "正在保存当前编辑，请稍后刷新。"; return; }
  if (!librarySource.trim()) { status.textContent = "请填写独立组件库的 design-source 目录。"; return; }
  refreshingLibrary = true; state.mutating += 1;
  let applied = false;
  try {
    status.textContent = "正在检查源库与当前页面的兼容性…";
    const result = await api("./api/libraries/refresh", { method: "POST", body: JSON.stringify({ pageId: state.page.pageId, expectedRevision: state.page.revision, sourcePath: librarySource.trim() }) });
    applied = true;
    if (native) {
      await reloadNativePage(result);
      $("#library-update-status").textContent = "组件已刷新并重载，页面内容已保留。";
    } else { await contextLease?.close(); location.reload(); }
  } catch (error) { $("#library-update-status").textContent = applied ? `组件库已保存，重载失败，请重试：${error.message}` : `更新未应用：${error.message}`; }
  finally { refreshingLibrary = false; state.mutating -= 1; lockInspector(); }
}

function renderLibrary() {
  clearUiPrefix("library-"); const query = state.searchQuery.trim().toLowerCase(); const list = $("#component-list"); if (!list) return; list.replaceChildren();
  for (const component of state.catalog.filter((item) => `${item.id}${item.label}${item.description}`.toLowerCase().includes(query))) list.append(libraryItem(component.id, component.label, component.description, "component"));
  const layouts = $("#layout-list"); layouts.replaceChildren(); for (const [id, label] of Object.entries(labels)) layouts.append(libraryItem(id, label, id === "columns" ? "2–4 列响应式容器" : "接收组件与布局", "layout"));
}

function libraryIcon(name) { return window.B2B.components.runtime.icon(name); }
const componentIcons = { "C-02": "smart_button", "C-21": "input", "C-23": "list_alt", "C-34": "web_asset", "C-42": "sell" };
const layoutIcons = { column: "view_agenda", row: "view_week", columns: "view_column" };
function libraryItem(id, label, description, kind) {
  const item = document.createElement("div"); item.className = "library-item"; item.draggable = true; item.tabIndex = 0; item.setAttribute("role", "button"); item.setAttribute("aria-label", `${label}，${description}`); item.innerHTML = `<span class="library-icon"></span><span class="library-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(description)}</small></span><span class="library-add ui-control"></span>`;
  $(".library-icon", item).append(libraryIcon(kind === "layout" ? layoutIcons[id] : componentIcons[id] || "widgets"));
  item.addEventListener("dragstart", (event) => canvasDrag.begin(event, { kind, id }));
  const addHost = $(".library-add", item); addHost.addEventListener("click", (event) => event.stopPropagation()); void mountUi(`library-${kind}-${id}`, addHost, "C-04", iconProps("add", `添加${label}`), { "b2b:icon-activate": (event) => { event.stopPropagation(); addNode(kind, id, state.selection); } });
  item.addEventListener("keydown", (event) => { if (event.key === "Enter") addNode(kind, id, state.selection); }); return item;
}

async function addNode(kind, id, selectedId, index) {
  let parentId = state.page.root.id; const selected = selectedId ? findNode(state.page.root, selectedId)?.node : null; if (selected?.kind === "layout") parentId = selected.id;
  const node = kind === "layout" ? { kind: "layout", layout: id, gap: "medium", ...(id === "columns" ? { columns: 2 } : {}) } : { kind: "component", componentId: id, props: ({ "C-02": { label: "按钮" }, "C-21": { label: "输入内容", placeholder: "请输入" }, "C-23": { placeholder: "请选择", items: ["选项一", "选项二", "选项三"] }, "C-34": { title: "卡片标题", body: "双击这里编辑卡片内容。" }, "C-42": { text: "标签" } })[id] || {} };
  await commit([{ type: "add", parentId, ...(index === undefined ? {} : { index }), node }], `${kind === "layout" ? labels[id] : definition(id).label}已添加`);
}

function commit(operations, success, applyDraft = false) {
  if (inlineEditor.active) return inlineEditor.finish().then(saved => saved ? commit(operations, success, applyDraft) : undefined);
  if (state.fullPropsDirty && !applyDraft) { toast("请先应用或取消其他设置的修改。", "error"); return Promise.resolve(); }
  mutationQueue = mutationQueue.then(() => commitNow(operations, success, applyDraft));
  return mutationQueue;
}
function lockInspector() { const inspector = $("#inspector"); if (inspector) inspector.inert = Boolean(inlineEditor.active || state.mutating || inspectorRendering || runtimeReloadFailed); }
function acceptSavedPage(result, epoch, keepSelection = true) {
  state.page = result.page;
  // A late save must not undo a newer click while the request was in flight.
  if (epoch === state.selectionEpoch || state.selection && !findNode(result.page.root, state.selection)) {
    setSelection(result.selection?.nodeId ?? (keepSelection && state.selection && findNode(result.page.root, state.selection) ? state.selection : null), keepSelection);
    state.selectionEpoch += 1;
  }
}
async function commitNow(operations, success, applyDraft) {
  const epoch = state.selectionEpoch; state.mutating += 1; lockInspector();
  try {
    setSaving("saving", "正在保存");
    const result = await api(`./api/pages/${state.page.pageId}/operations`, { method: "POST", body: JSON.stringify({ expectedRevision: state.page.revision, operations }) });
    acceptSavedPage(result, epoch); state.lastCommittedAt = Date.now();
    if (applyDraft) { state.fullPropsDirty = false; inspectorKey = null; }
    await renderAll(); await syncModelContext(); setSaving("", "已保存"); if (success) toast(success);
  } catch (error) {
    if (error.code === "REVISION_CONFLICT") await loadPage(state.page.pageId);
    else if (!state.fullPropsDirty) await renderSelection(true);
    fail(error);
  } finally { state.mutating -= 1; lockInspector(); }
}
function history(direction) {
  if (inlineEditor.active) return inlineEditor.finish().then(saved => saved ? history(direction) : undefined);
  if (state.fullPropsDirty) { toast("请先应用或取消其他设置的修改。", "error"); return Promise.resolve(); }
  mutationQueue = mutationQueue.then(async () => {
    const epoch = state.selectionEpoch; state.mutating += 1; lockInspector();
    try {
      setSaving("saving", "正在保存");
      const result = await api(`./api/pages/${state.page.pageId}/${direction}`, { method: "POST", body: JSON.stringify({ expectedRevision: state.page.revision }) });
      acceptSavedPage(result, epoch, false); await renderAll(); await syncModelContext(); setSaving("", "已保存"); toast(direction === "undo" ? "已撤销" : "已重做");
    } catch (error) { fail(error); }
    finally { state.mutating -= 1; lockInspector(); }
  });
  return mutationQueue;
}

function fail(error) { setSaving("error", "保存失败"); toast(error.message, "error"); console.error(error); }

function select(nodeId, event = {}) {
  if (inlineEditor.active) return Promise.resolve();
  if (state.fullPropsDirty) { toast("请先应用或取消其他设置，再选择组件。", "error"); return Promise.resolve(); }
  const ids = new Set(validIds(state.selectedIds));
  const toggle = nodeId && (event.metaKey || event.ctrlKey) && nodeId !== state.page.root.id;
  if (!toggle) { ids.clear(); if (nodeId) ids.add(nodeId); }
  else { ids.delete(state.page.root.id); if (ids.has(nodeId)) ids.delete(nodeId); else ids.add(nodeId); }
  state.selectedIds = ids;
  nodeId = ids.has(nodeId) ? nodeId : [...ids].at(-1) || null;
  const epoch = ++state.selectionEpoch; state.selection = nodeId; renderSelection();
  pendingSelections += 1;
  mutationQueue = mutationQueue.then(async () => {
    const result = await api(`./api/pages/${state.page.pageId}/selection`, { method: "POST", body: JSON.stringify({ nodeId, expectedRevision: state.page.revision }) });
    if (epoch !== state.selectionEpoch) return; setSelection(result.selection.nodeId);
  }).catch(async (error) => { if (epoch !== state.selectionEpoch) return; if (error.code === "REVISION_CONFLICT") await loadPage(state.page.pageId); fail(error); }).finally(() => { pendingSelections -= 1; });
  return mutationQueue;
}

async function renderAll() {
  const epoch = ++state.renderEpoch;
  if (renderedPageName !== state.page.name && !state.editTimers.has("page-name")) {
    renderedPageName = state.page.name;
    await mountUi("page-name", "#page-name", "C-21", inputProps("页面名称", state.page.name), { "b2b:input-change": event => {
      const value = String(event.detail?.value ?? "").trim();
      if (value && value !== state.page.name) scheduleEdit("page-name", () => commit([{ type: "rename", name: value }]));
    } });
  }
  const canvas = $("#canvas"); canvas.classList.toggle("is-preview", state.preview);
  const rendered = await canvasRenderer.render(state.page.root, canvas, { preview: state.preview, identity: `${workspaceId || "legacy"}:${state.page.pageId}:${state.loadedLibraryId}` });
  if (!rendered || epoch !== state.renderEpoch) return;
  await mountUi("revision", "#revision-badge", "C-42", { variant: "status", type: "status", size: "extra-small", color: "neutral", text: `Revision ${state.page.revision}`, icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: false, bordered: true, solid: false, disabled: false });
  $("#node-count").textContent = `${nodeCount(state.page.root) - 1} 个节点`;
  renderTree(); await renderSelection();
}

function moveSibling(id, delta) { const found = findNode(state.page.root, id); if (!found?.parent) return; const index = found.parent.children.findIndex((child) => child.id === id); const next = Math.max(0, Math.min(found.parent.children.length - 1, index + delta)); if (next !== index) commit([{ type: "move", nodeId: id, parentId: found.parent.id, index: next }], "顺序已调整"); }

function renderSelection(force = false) {
  selectionToolbar.invalidate(state.selection && state.selection !== state.page.root.id && !state.preview ? state.selection : null, JSON.stringify([...state.selectedIds]));
  inspectorQueue = inspectorQueue.then(async () => {
    inspectorRendering = true; lockInspector();
    try { await renderSelectionNow(force); }
    finally { inspectorRendering = false; lockInspector(); }
  }).catch((error) => console.error("属性面板渲染失败", error));
  return inspectorQueue;
}

async function renderSelectionNow(force = false) {
  const selectionId = state.selection, selectionKey = JSON.stringify([...state.selectedIds]);
  document.querySelectorAll(".node-shell").forEach((el) => el.classList.toggle("is-selected", state.selectedIds.has(el.dataset.nodeId)));
  document.querySelectorAll(".tree-item").forEach(el => { const selected = state.selectedIds.has(el.dataset.treeNodeId); el.classList.toggle("is-selected", selected); el.setAttribute("aria-pressed", String(selected)); });
  await selectionToolbar.select(state.selection && state.selection !== state.page.root.id && !state.preview ? state.selection : null, JSON.stringify([...state.selectedIds]));
  if (selectionId !== state.selection || selectionKey !== JSON.stringify([...state.selectedIds])) return;
  const found = state.selection ? findNode(state.page.root, state.selection) : null;
  const nodeKey = found && { ...found.node, children: undefined };
  const overview = !found && pageOverview();
  const key = JSON.stringify([state.loadedLibraryId, nodeKey, selectionKey, overview]);
  if (!force && (key === inspectorKey || state.fullPropsDirty)) return;
  state.fullPropsDirty = false; inspectorKey = key;
  clearUiPrefix("field-"); clearUiPrefix("delete-");
  const inspector = $("#inspector"); inspector.replaceChildren(); contextReadyStatus();
  $("#inspector-title").textContent = found ? "属性" : "页面";
  if (!found) { await renderPageOverview(inspector, overview); return; }
  if (state.selectedIds.size > 1) {
    $("#selection-type").textContent = `已选 ${state.selectedIds.size} 项`;
    const hint = document.createElement("p"); hint.textContent = "可一起加入 AI 上下文。单击组件可恢复单选，编辑属性或移动。";
    const list = document.createElement("ul"); list.className = "selection-list";
    for (const id of state.selectedIds) {
      const item = findNode(state.page.root, id)?.node; if (!item) continue;
      const row = document.createElement("li");
      const label = item.kind === "layout" ? labels[item.layout] : definition(item.componentId)?.label || "组件";
      const text = item.props?.label || item.props?.title || item.props?.text;
      row.textContent = `${label}${text ? ` · ${text}` : ""}`; list.append(row);
    }
    inspector.append(hint, list); return;
  }
  const node = found.node; $("#selection-type").textContent = node.kind === "layout" ? labels[node.layout] : `${node.componentId} · ${definition(node.componentId)?.label || "组件"}`;
  if (node.kind === "layout") await renderLayoutInspector(node, inspector); else await renderComponentInspector(node, inspector);
}

function pageOverview() {
  let components = 0, layouts = 0;
  const visit = node => {
    if (node.kind === "component") components += 1;
    else { if (node.id !== state.page.root.id) layouts += 1; node.children.forEach(visit); }
  };
  visit(state.page.root);
  return { name: state.page.name, components, layouts };
}
async function renderPageOverview(inspector, overview) {
  $("#selection-type").textContent = "未选择";
  const section = document.createElement("section"); section.className = "page-overview";
  const info = document.createElement("dl"); info.className = "page-overview-info";
  for (const [label, value] of [["页面名称", overview.name], ["组件数量", `${overview.components} 个组件`], ["布局数量", `${overview.layouts} 个布局`]]) {
    const term = document.createElement("dt"), detail = document.createElement("dd");
    term.textContent = label; detail.textContent = value; info.append(term, detail);
  }
  const action = document.createElement("div"), hint = document.createElement("div"); hint.className = "page-overview-hint";
  const title = document.createElement("strong"); title.append(libraryIcon("touch_app"), document.createTextNode("编辑提示")); hint.append(title);
  for (const text of ["单击选中组件；双击文字可直接编辑，失焦保存，Esc 取消。", "按住 ⌘ / Ctrl 点击，可选择多个组件。", "点击画布空白处取消选中，已加入 AI 上下文的引用会保留。", "页面名称可在顶部修改。"] ) {
    const line = document.createElement("p"); line.textContent = text; hint.append(line);
  }
  section.append(info, action, divider(), hint); inspector.append(section);
  await mountUi("field-page-overview-layout", action, "C-02", buttonProps("页面布局", "secondary-gray", "tune"), { "b2b:button-activate": () => select(state.page.root.id) });
}

async function field(parent, scope, label, key, value, rule, onChange) {
  const wrapper = document.createElement("div"); wrapper.className = rule?.type === "boolean" ? "pb-check-field" : "pb-field"; const control = document.createElement("div"); control.className = "pb-field-control"; wrapper.append(control); parent.append(wrapper);
  wrapper.dataset.property = rule.propertyKey || key;
  if (rule.description) { const hint = document.createElement("small"); hint.textContent = rule.description; wrapper.append(hint); }
  const change = onChange; onChange = next => { if (!rule.disabled) return change(next); };
  const slot = `field-${scope}-${key}`;
  if (rule?.type === "boolean") {
    await mountUi(slot, control, "C-11", { variant: "standalone", label, value: key, description: null, selectAllLabel: "全选", items: [], checked: Boolean(value), mixed: false, disabled: Boolean(rule.disabled), error: false, errorMessage: null, orientation: "vertical", compact: true }, { "b2b:checkbox-change": (event) => onChange(Boolean(event.detail?.checked)) });
    return wrapper;
  }
  const title = document.createElement("span"); title.className = "pb-field-label"; title.id = `${slot}-label`; title.textContent = label; wrapper.prepend(title);
  control.setAttribute("role", "group"); control.setAttribute("aria-labelledby", title.id);
  if (rule?.editorValues || rule?.values) {
    const values = rule.values || rule.editorValues;
    const options = inspectorOptions(rule.componentId, rule.propertyKey || key, values, rule.options);
    const items = options.map(option => ({ label: option.label, disabled: Boolean(rule.editorValues && !rule.editorValues.includes(option.value) && option.value !== value) }));
    const selected = options.find(option => option.value === value)?.label;
    // C-23 selects by label, so translate back through this exact list, never by
    // sending translated text (or coercing numeric enum values) to the component.
    await mountUi(slot, control, "C-23", { ...selectProps(items, selected, label), state: rule.disabled ? "disabled" : "default" }, { "b2b:select-change": (event) => { const next = options.find(option => option.label === event.detail?.selected?.[0]); if (next && next.value !== value) onChange(next.value); } });
    if (rule.editorValues && rule.editorValues.length < values.length) { const hint = document.createElement("small"); hint.textContent = "按当前组件库列出；灰显项的配套属性尚未适配。"; wrapper.append(hint); }
    return wrapper;
  }
  const variant = rule?.type === "number" ? "数字输入框" : (key === "body" && (!rule.control || rule.control === "auto") || rule?.multiline || rule?.type === "array" ? "长文本输入框" : "基础输入框");
  const serialized = Array.isArray(value) ? value.join("\n") : variant === "数字输入框" ? value ?? "" : String(value ?? "");
  await mountUi(slot, control, "C-21", { ...inputProps(label, serialized, variant), ...(rule?.type === "number" ? { min: -Number.MAX_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER } : {}), state: rule.disabled ? "disabled" : "default" }, { "b2b:input-change": (event) => { let next = event.detail?.value ?? ""; if (rule?.type === "number" && (next !== "" || !rule.sourceType?.includes("string"))) next = Number(next); if (rule?.type === "array") next = String(next).split("\n").map((item) => item.trim()).filter(Boolean); if (rule?.immediate) onChange(next); else scheduleEdit(slot, () => onChange(next), 420); } });
  if (rule.control === "image") {
    const upload = document.createElement("div"), file = document.createElement("input"); file.type = "file"; file.accept = "image/png,image/jpeg,image/webp"; file.hidden = true; wrapper.append(upload, file);
    file.addEventListener("change", async () => {
      const image = file.files?.[0]; if (!image) return;
      try {
        if (!["image/png", "image/jpeg", "image/webp"].includes(image.type) || image.size > 1024 * 1024) throw new Error("请选择 1 MB 以内的 PNG、JPEG 或 WebP 图片。");
        const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("图片读取失败")); reader.readAsDataURL(image); });
        await onChange(data);
      } catch (error) { fail(error); }
    });
    await mountUi(`${slot}-upload`, upload, "C-02", { ...buttonProps(`上传${label}`), disabled: Boolean(rule.disabled) }, { "b2b:button-activate": () => file.click() });
  }
  return wrapper;
}

function editorRule(rule, editor, props, value) {
  const control = editorControl(editor, props);
  const type = control === "number" || control === "auto" && typeof value === "number" && rule.type?.includes("number") ? "number" : control === "switch" ? "boolean" : rule.type;
  return { ...rule, ...editor, sourceType: rule.type, control, type, multiline: control === "textarea", disabled: !matchesConditions(editor.enabledWhen, props) };
}
async function renderContractInspector(node, inspector, def) {
  const builder = def.builder;
  const inline = await renderInlineLinks(node, inspector);
  const groups = [...(builder.groups || []), { id: undefined, label: "其他属性" }];
  const entries = editorFields(def.props, builder.fields, { ...def.defaults, ...node.props }).filter(({ key, rule }) => !inline.has(key) && !rule.type.includes("object") && !rule.type.includes("array"));
  for (const group of groups) {
    const fields = entries.filter(item => item.editor.group === group.id); if (!fields.length) continue;
    const section = document.createElement("section"), title = document.createElement("h3");
    section.className = "inspector-group"; title.textContent = group.label; section.append(title); inspector.append(section);
    for (const { key, rule, editor } of fields) {
      const label = editor.label || componentPropLabel(node.componentId, key);
      const value = Object.hasOwn(node.props, key) ? node.props[key] : rule.default;
      await field(section, node.id, label, key, value, { ...editorRule(rule, editor, { ...def.defaults, ...node.props }, value), componentId: node.componentId, propertyKey: key }, next => {
        try {
          if (state.fullPropsDirty) throw new Error("请先应用其他设置，再修改单个属性。");
          if (editor.control === "image" && native && next && !String(next).startsWith("data:image/")) throw new Error("原生面板不能加载外部图片地址，请使用上传图片。");
          return commit([{ type: "updateProps", nodeId: node.id, props: componentPatch(node, key, next === "" && rule.type.includes("null") ? null : next) }], "属性已更新");
        } catch (error) { fail(error); }
      });
    }
  }
  await renderFullProperties(node, inspector, def.props, { exclude: new Set([...inline, ...entries.map(item => item.key)]) });
  inspector.append(divider(), deleteButton(node.id));
}

async function renderComponentInspector(node, inspector) {
  const def = definition(node.componentId);
  if (def.builder) return renderContractInspector(node, inspector, def);
  const inline = await renderInlineLinks(node, inspector);
  const actual = await window.B2B.describeComponent(node.componentId);
  for (const key of def.editable) { const rule = def.props[key]; if (!rule || inline.has(key)) continue;
    const sourceRule = actual.api.props[key];
    if (node.componentId === "C-23" && key === "items" && node.props.items.some(item => typeof item === "object")) continue;
    let effective = { ...rule, ...sourceRule, componentId: node.componentId, propertyKey: key };
    if (node.componentId === "C-21") {
      if (key === "value" && node.props.variant === "组合输入框") continue;
      if (key === "value" && node.props.variant === "数字输入框") effective = { ...effective, type: "number" };
      if (key === "size" && node.props.variant === "长文本输入框") effective = { ...effective, editorValues: ["medium"] };
      if (key === "clearable" && !["基础输入框", "带图标输入框"].includes(node.props.variant)) continue;
    }
    if (node.componentId === "C-34") {
      if (key === "selected" && node.props.variant !== "interactive") continue;
      if (node.props.variant === "interactive" && ["appearance", "hoverable"].includes(key)) continue;
      if (key === "body" && ["compact", "external-grid", "content-grid", "nested", "tabs"].includes(node.props.variant)) continue;
      if (key === "meta" && !["basic", "cover", "meta", "actions"].includes(node.props.variant)) continue;
    }
    const wrapper = await field(inspector, node.id, componentPropLabel(node.componentId, key), key, node.props[key] ?? sourceRule?.default, effective, (value) => {
      try { return commit([{ type: "updateProps", nodeId: node.id, props: componentPatch(node, key, value) }], "属性已更新"); } catch (error) { fail(error); }
    });
    if (key === "variant" && node.componentId === "C-34") { const hint = document.createElement("small"); hint.textContent = "切换会重置不兼容的头像、子项或页签配置；可通过撤销恢复。"; wrapper.append(hint); }
    if (key === "variant" && node.componentId === "C-42") { const hint = document.createElement("small"); hint.textContent = "业务变体会设置类型和交互。“头像标签”在下方类型中选择。"; wrapper.append(hint); }
  }
  if (node.componentId === "C-21") {
    const save = props => commit([{ type: "updateProps", nodeId: node.id, props }], "属性已更新");
    if (node.props.variant === "长文本输入框") await field(inspector, node.id, "随内容自动增高", "auto", node.props.auto, { type: "boolean" }, value => save({ auto: value }));
    if (node.props.variant === "带图标输入框") await field(inspector, node.id, "前置图标", "prefixIcon", node.props.prefixIcon, { type: "string" }, value => save({ prefixIcon: value }));
    if (node.props.variant === "带属性输入框" && node.props.prefixAddon?.type === "text") await field(inspector, node.id, "前缀文字", "prefixAddon", node.props.prefixAddon.text, { type: "string", propertyKey: "prefixAddon.text" }, value => save({ prefixAddon: { ...node.props.prefixAddon, text: value } }));
    if (node.props.variant === "组合输入框") for (const [index, segment] of (node.props.composite?.segments || []).entries()) await field(inspector, node.id, segment.label, `segment-${index}`, segment.value, { type: "string", propertyKey: `composite.segments.${index}.value` }, value => save({ composite: { ...node.props.composite, segments: node.props.composite.segments.map((item, i) => i === index ? { ...item, value } : item) } }));
  }
  if (node.componentId === "C-34") await renderCardFields(node, inspector);
  const shown = new Set([...inline, ...[...inspector.querySelectorAll("[data-property]")].map(el => el.dataset.property)]);
  await renderFullProperties(node, inspector, actual.api.props, { exclude: shown });
  inspector.append(divider(), deleteButton(node.id));
}
async function renderInlineLinks(node, inspector) {
  const regions = inlineEditor.regions(node), keys = new Set(regions.map(item => item.property));
  if (!keys.size) return keys;
  const section = document.createElement("section"), hint = document.createElement("p"), actions = document.createElement("div");
  section.className = "canvas-content-links"; hint.textContent = "内容可在画布中双击编辑，也可从这里定位。";
  actions.className = "canvas-content-actions"; section.append(hint, actions); inspector.append(section);
  for (const key of keys) {
    const target = document.createElement("div"); actions.append(target);
    await mountUi(`field-${node.id}-inline-${key}`, target, "C-02", { ...buttonProps(`编辑${componentPropLabel(node.componentId, key)}`, "secondary-gray", "edit"), size: "mini" }, { "b2b:button-activate": () => { regions.find(item => item.property === key)?.element.scrollIntoView({ block: "nearest" }); return inlineEditor.open(node.id, key); } });
  }
  return keys;
}
async function renderFullProperties(node, inspector, rules, settings = {}) {
  const excluded = settings.exclude || new Set();
  const def = definition(node.componentId), builder = def.builder;
  const original = structuredClone({ ...def.defaults, ...node.props });
  if (!editorFields(rules, builder?.fields, original).some(({ key }) => !excluded.has(key))) return;
  const details = document.createElement("details"), summary = document.createElement("summary");
  const prefix = settings.slotPrefix || "full";
  summary.textContent = settings.title || "其他设置"; details.append(summary); inspector.append(details);
  let draft = structuredClone(original);
  const conditionKeys = new Set();
  function collectConditions(fields) { for (const editor of Object.values(fields || {})) { for (const condition of [...(editor.visibleWhen || []), ...(editor.enabledWhen || []), ...(editor.controlWhen || []).flatMap(item => item.when)]) conditionKeys.add(condition.property); collectConditions(editor.fields); if (editor.item) collectConditions({ item: editor.item }); } }
  collectConditions(builder?.fields);
  const body = document.createElement("div"); details.append(body); let built = false;
  const seed = rule => "default" in rule ? structuredClone(rule.default) : rule.values?.[0] ?? (rule.type?.includes("array") ? [] : rule.fields || rule.type?.includes("object") ? {} : rule.type === "boolean" ? false : rule.type === "number" ? 0 : "");
  async function build(container, name, value, rule, write, depth = 0, propertyKey = "", editor = {}) {
    if (excluded.has(propertyKey)) return;
    if (depth > 8) return;
    if (!matchesConditions(editor.visibleWhen, draft)) return;
    const disabled = !matchesConditions(editor.enabledWhen, draft);
    const type = rule.type || (Array.isArray(value) ? "array" : value && typeof value === "object" ? "object" : typeof value);
    if (type.includes("object") || type.includes("array")) {
      const box = document.createElement("fieldset"), title = document.createElement("legend"); title.textContent = name; box.disabled = disabled; box.append(title); container.append(box);
      if (editor.description || rule.description) { const hint = document.createElement("small"); hint.textContent = editor.description || rule.description; box.append(hint); }
      if (value === null || value === undefined) {
        const target = document.createElement("div"); box.append(target);
        await mountUi(`field-${node.id}-${prefix}-${propertyKey}-enable`, target, "C-02", { ...buttonProps(`配置${name}`), disabled }, { "b2b:button-activate": async () => { if (disabled) return; const next = type.includes("array") ? [] : {}; write(next); await rebuild(); } }); return;
      }
      if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
          await build(box, `${name} ${index + 1}`, item, rule.item || { type: typeof item === "object" ? "object" : typeof item }, next => { if (!disabled) { value[index] = next; write(value); } }, depth + 1, `${propertyKey}.${index}`, editor.item || {});
          const remove = document.createElement("div"); box.append(remove);
          await mountUi(`field-${node.id}-${prefix}-${propertyKey}-${index}-remove`, remove, "C-02", { ...buttonProps(`删除 ${name} ${index + 1}`), disabled }, { "b2b:button-activate": async () => { if (disabled) return; value.splice(index, 1); write(value); await rebuild(); } });
        }
        const add = document.createElement("div"); box.append(add);
        await mountUi(`field-${node.id}-${prefix}-${propertyKey}-add`, add, "C-02", { ...buttonProps(`添加${name}`), disabled }, { "b2b:button-activate": async () => { if (disabled) return; value.push(seed(rule.item || { type: "string" })); write(value); await rebuild(); } });
      } else {
        const declared = rule.item?.fields || rule.fields || {};
        const names = [...new Set([...Object.keys(value), ...(Array.isArray(declared) ? declared : Object.keys(declared))])];
        names.sort((a, b) => (editor.fields?.[a]?.order ?? 0) - (editor.fields?.[b]?.order ?? 0));
        for (const key of names) {
          const child = !Array.isArray(declared) && declared[key] || { type: typeof value[key] === "boolean" ? "boolean" : typeof value[key] === "number" ? "number" : typeof value[key] === "object" && value[key] ? "object" : "string" };
          await build(box, `${name} · ${editor.fields?.[key]?.label || propLabel(key)}`, value[key], child, next => { if (!disabled) { value[key] = next; write(value); } }, depth + 1, `${propertyKey}.${key}`, editor.fields?.[key] || {});
        }
      }
      if (type.includes("null")) { const target = document.createElement("div"); box.append(target); await mountUi(`field-${node.id}-${prefix}-${propertyKey}-clear`, target, "C-02", { ...buttonProps(`清空${name}`), disabled }, { "b2b:button-activate": async () => { if (disabled) return; write(null); await rebuild(); } }); }
      return;
    }
    const scalarRule = { ...rule, type: typeof value === "number" && type.includes("number") ? "number" : type };
    await field(container, node.id, name, `${prefix}-${propertyKey || name}`, value, { ...editorRule(scalarRule, editor, draft), componentId: node.componentId, propertyKey, immediate: true }, next => write(next === "" && type.includes("null") ? null : next));
  }
  async function rebuild() {
    clearUiPrefix(`field-${node.id}-${prefix}-`); body.replaceChildren();
    const hint = document.createElement("p"); hint.textContent = "其余设置与列表内容。修改后点击应用；无效组合不会保存。"; body.append(hint);
    for (const { key, rule, editor } of editorFields(rules, builder?.fields, draft)) await build(body, editor.label || componentPropLabel(node.componentId, key), draft[key], rule, value => {
      try {
        const patch = contractPatch(definition(node.componentId), draft, key, value);
        Object.assign(draft, patch || { [key]: value }); state.fullPropsDirty = true;
        if (patch || conditionKeys.has(key)) void rebuild();
      } catch (error) { fail(error); }
    }, 0, key, editor);
    const target = document.createElement("div"); body.append(target);
    await mountUi(`field-${node.id}-${prefix}-apply`, target, "C-02", buttonProps("应用其他设置", "primary"), { "b2b:button-activate": () => {
      const props = Object.fromEntries(Object.keys(draft).filter(key => JSON.stringify(draft[key]) !== JSON.stringify(original[key])).map(key => [key, draft[key]]));
      if (!Object.keys(props).length) { state.fullPropsDirty = false; return renderSelection(true); }
      for (const timer of state.editTimers.values()) clearTimeout(timer); state.editTimers.clear();
      return commit([{ type: "updateProps", nodeId: node.id, props }], "属性已更新", true);
    } });
    const cancel = document.createElement("div"); body.append(cancel);
    await mountUi(`field-${node.id}-${prefix}-cancel`, cancel, "C-02", buttonProps("取消修改"), { "b2b:button-activate": () => { state.fullPropsDirty = false; return renderSelection(true); } });
  }
  details.addEventListener("toggle", () => { if (details.open && !built) { built = true; void rebuild(); } });
}
async function renderCardFields(node, inspector) {
  const p = node.props;
  const save = props => commit([{ type: "updateProps", nodeId: node.id, props }], "属性已更新");
  await field(inspector, node.id, "媒体图片地址（图文／底部操作卡片必填）", "coverImage", p.coverImage, { type: "string" }, value => {
    const image = value.trim();
    if (native && image && !image.startsWith("data:image/")) { fail(new Error("原生面板不能加载外部图片地址，请使用“上传媒体图片”。")); return; }
    return save({ coverImage: image || null });
  });
  const upload = document.createElement("div"), file = document.createElement("input"); file.type = "file"; file.accept = "image/png,image/jpeg,image/webp"; file.hidden = true; inspector.append(upload, file);
  file.addEventListener("change", async () => {
    const image = file.files?.[0]; if (!image) return;
    try {
      if (!["image/png", "image/jpeg", "image/webp"].includes(image.type) || image.size > 1024 * 1024) throw new Error("请选择 1 MB 以内的 PNG、JPEG 或 WebP 图片。");
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("图片读取失败")); reader.readAsDataURL(image); });
      await save({ coverImage: data, coverAlt: p.coverAlt || image.name });
    } catch (error) { fail(error); }
  });
  await mountUi(`field-${node.id}-upload`, upload, "C-02", buttonProps("上传媒体图片"), { "b2b:button-activate": () => file.click() });
  if (p.coverImage) await field(inspector, node.id, "图片说明", "coverAlt", p.coverAlt, { type: "string" }, value => save({ coverAlt: value }));
  if (p.avatar) await field(inspector, node.id, "头像文字", "avatar-text", p.avatar.text, { type: "string", propertyKey: "avatar.text" }, value => save({ avatar: { ...p.avatar, text: value } }));
  if (["external-grid", "content-grid"].includes(p.variant)) await field(inspector, node.id, "卡片列数", "columns", p.columns, { type: "number", values: [2, 3, 4] }, value => save({ columns: value }));
  const listKey = ["external-grid", "content-grid", "nested"].includes(p.variant) ? "items" : p.variant === "tabs" ? "tabs" : p.variant === "actions" ? "actions" : null;
  if (!listKey) return;
  const entries = p[listKey];
  const fields = listKey === "items" ? { title: "子卡片标题", body: "子卡片正文", meta: "子卡片辅助信息" } : listKey === "tabs" ? { label: "页签标题", content: "页签内容" } : { label: "操作名称", icon: "操作图标" };
  for (const [index, entry] of entries.entries()) {
    inspector.append(divider());
    for (const [key, label] of Object.entries(fields)) await field(inspector, node.id, `${label} ${index + 1}`, `${listKey}-${entry.id}-${key}`, entry[key], { type: "string", propertyKey: `${listKey}.${index}.${key}`, multiline: ["body", "content"].includes(key) }, value => save({ [listKey]: entries.map(item => item.id === entry.id ? { ...item, [key]: value } : item) }));
    if (entries.length > 1) {
      const target = document.createElement("div"); inspector.append(target);
      await mountUi(`field-${node.id}-remove-${entry.id}`, target, "C-02", buttonProps(`移除第 ${index + 1} 项`, "secondary-danger"), { "b2b:button-activate": () => { const next = entries.filter(item => item.id !== entry.id); return save({ [listKey]: next, ...(listKey === "tabs" && p.activeTabId === entry.id ? { activeTabId: next[0].id } : {}) }); } });
    }
  }
  const target = document.createElement("div"); inspector.append(target);
  await mountUi(`field-${node.id}-add-${listKey}`, target, "C-02", buttonProps("添加一项", "secondary-gray"), { "b2b:button-activate": () => {
    const id = `entry-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    const entry = listKey === "items" ? { id, title: "卡片标题", body: "", meta: "" } : listKey === "tabs" ? { id, label: "新页签", content: "" } : { id, label: "编辑", icon: "edit" };
    return save({ [listKey]: [...entries, entry] });
  } });
  if (listKey === "tabs") await field(inspector, node.id, "默认页签（标识）", "activeTabId", p.activeTabId, { values: entries.map(item => item.id) }, value => save({ activeTabId: value }));
}
function componentPropLabel(componentId, key) {
  const declared = definition(componentId)?.builder?.fields?.[key]?.label;
  if (declared) return declared;
  const labels = { "C-34": { title: "卡片标题", body: "卡片正文", meta: "辅助信息", selected: "选中状态" }, "C-21": { label: "输入框名称", value: "输入内容", placeholder: "占位提示" } };
  return labels[componentId]?.[key] || propLabel(key);
}
function componentPatch(node, key, value) {
  const patch = contractPatch(definition(node.componentId), { ...definition(node.componentId).defaults, ...node.props }, key, value);
  if (patch) return patch;
  if (key === "variant") {
    const def = definition(node.componentId), variants = def.variantDefaults || {};
    const keys = [...new Set(Object.values(variants).flatMap(Object.keys))];
    const companion = { ...Object.fromEntries(keys.map(name => [name, def.defaults[name]])), ...variants[value] };
    if (node.componentId === "C-23") return selectVariantPatch(node.props, value, companion);
    if (node.componentId === "C-42") return { ...companion, variant: value, avatar: null, icon: node.props.icon, ...(companion.checkable ? {} : { checked: false }) };
    if (!["C-21", "C-34"].includes(node.componentId)) return { ...companion, variant: value };
  }
  if (node.componentId === "C-21" && key === "variant") return inputVariantPatch({ ...definition(node.componentId).defaults, ...node.props }, value);
  if (node.componentId === "C-34" && key === "variant") return cardVariantPatch({ ...definition(node.componentId).defaults, ...node.props }, value);
  if (node.componentId === "C-23" && key === "state") {
    if (["loading", "no-result"].includes(value) && !node.props.searchable) throw new Error("请先选择可搜索、可创建或复杂内容变体，再设置此状态。");
    return { state: value, ...(["disabled", "readonly"].includes(value) ? { open: false } : value === "no-result" ? { open: true } : {}) };
  }
  if (node.componentId !== "C-42") return { [key]: value };
  if (key === "type") return value === "avatar" ? { type: value, avatar: node.props.avatar || String(node.props.text || "用").trim().slice(0, 1) || "用", icon: null } : { type: value, avatar: null };
  if (key === "closable" && value) return { closable: true, checkable: false, checked: false };
  if (key === "checkable") return value ? { checkable: true, closable: false } : { checkable: false, checked: false };
  if (key === "checked" && value) return { checked: true, checkable: true, closable: false };
  return { [key]: value };
}
async function renderLayoutInspector(node, inspector) {
  await field(inspector, node.id, "布局方向", "layout", node.layout, { values: ["column", "row", "columns"] }, (value) => commit([{ type: "updateLayout", nodeId: node.id, layout: value }])); await field(inspector, node.id, "间距", "gap", node.gap, { values: ["small", "medium", "large"] }, (value) => commit([{ type: "updateLayout", nodeId: node.id, gap: value }]));
  if (node.layout === "columns") await field(inspector, node.id, "列数", "columns", node.columns || 2, { type: "number" }, (value) => commit([{ type: "updateLayout", nodeId: node.id, columns: value }])); if (node.id !== state.page.root.id) inspector.append(divider(), deleteButton(node.id));
}
function propLabel(key) { return ({ label: "文案", value: "当前值", placeholder: "占位提示", title: "标题", body: "正文", meta: "辅助信息", text: "文字", avatar: "头像文字", variant: "变体", appearance: "外观", size: "尺寸", state: "状态", color: "颜色", type: "类型", items: "选项（每行一个）", selected: "已选值（每行一个）", disabled: "禁用", loading: "加载中", clearable: "允许清除", closable: "允许关闭", checkable: "可选中", checked: "已选中", hoverable: "悬停反馈", width: "宽度", icon: "图标", bordered: "显示边框", solid: "实心填充", multiple: "多选", searchable: "可搜索", creatable: "允许创建", open: "展开", query: "搜索内容", position: "展开位置", prefixIcon: "前置图标", suffixIcon: "后置图标", prefixAddon: "前置附加内容", suffixAddon: "后置附加内容", infoTooltip: "提示内容", borderless: "无边框", counter: "字数统计", password: "密码模式", maxLength: "最大字数", min: "最小值", max: "最大值", step: "步长", auto: "自动增高", tag: "附带标签", composite: "组合内容", coverImage: "封面图片", coverAlt: "图片说明", extraActionLabel: "右上操作文字", footerActionLabel: "底部操作文字", columns: "列数", tabs: "页签", actions: "操作项", activeTabId: "当前页签", description: "说明", id: "标识", url: "链接", content: "内容" })[key] || key; }
function divider() { const el = document.createElement("div"); el.className = "inspector-divider"; return el; }
function deleteButton(nodeId) { const hostElement = document.createElement("div"); hostElement.className = "delete-control"; void mountUi(`delete-${nodeId}`, hostElement, "C-02", buttonProps("删除节点", "secondary-danger", "delete", "long"), { "b2b:button-activate": () => commit([{ type: "remove", nodeId }], "已删除") }); return hostElement; }

function renderTree() { const tree = $("#tree"); tree.replaceChildren(); const visit = (node, depth) => { const item = document.createElement("div"); item.dataset.treeNodeId = node.id; item.setAttribute("aria-pressed", String(state.selectedIds.has(node.id))); item.className = `tree-item${state.selectedIds.has(node.id) ? " is-selected" : ""}`; item.tabIndex = 0; item.setAttribute("role", "button"); item.style.setProperty("--depth", depth); item.innerHTML = `<span class="tree-indent"></span><span class="tree-icon"></span><span>${escapeHtml(node.kind === "layout" ? labels[node.layout] : definition(node.componentId)?.label)}</span>`; item.addEventListener("click", event => select(node.id, event)); item.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(node.id, event); } }); $(".tree-icon", item).append(libraryIcon(node.kind === "layout" ? layoutIcons[node.layout] : componentIcons[node.componentId] || "widgets")); tree.append(item); if (node.kind === "layout") node.children.forEach((child) => visit(child, depth + 1)); }; visit(state.page.root, 0); }

window.addEventListener("error", event => { if (!state.page) startup(`启动失败：${event.message}`); });
// Register the editor lifecycle before the source-library transport takes ownership of its listeners.
window.addEventListener("pagehide", () => contextLease?.close(), { once: true });
// Delegate outside the runtime-owned DOM so manual library reloads keep this listener.
document.addEventListener("click", event => {
  const target = event.target;
  if (!(target instanceof Element) || !target.closest(".canvas-scroll") || target.closest(".node-shell,[inert]")) return;
  if (!state.page || state.preview || state.dragging || reloadingRuntime || runtimeReloadFailed) return;
  if (state.selection || state.selectedIds.size) select(null);
});
bootstrap().catch((error) => { startup(`启动失败：${error.message}`); console.error(error); });
