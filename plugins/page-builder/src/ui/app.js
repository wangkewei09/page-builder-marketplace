const $ = (selector, root = document) => root.querySelector(selector);
const state = { page: null, catalog: [], selection: null, preview: false, instances: new Map(), dragging: null, lastCommittedAt: 0, renderEpoch: 0 };
let mutationQueue = Promise.resolve();
const labels = { column: "纵向布局", row: "横向布局", columns: "分栏布局" };

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { "content-type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await response.json();
  if (!response.ok) { const error = new Error(payload.error?.message || "请求失败"); error.code = payload.error?.code; error.details = payload.error?.details; throw error; }
  return payload;
}

function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("is-visible"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("is-visible"), 2200); }
function setSaving(kind, text) { const el = $("#save-state"); el.className = `save-state ${kind ? `is-${kind}` : ""}`; el.lastElementChild.textContent = text; }
function nodeCount(node) { return 1 + (node.kind === "layout" ? node.children.reduce((sum, child) => sum + nodeCount(child), 0) : 0); }
function findNode(node, id, parent = null) { if (node.id === id) return { node, parent }; if (node.kind === "layout") for (const child of node.children) { const found = findNode(child, id, node); if (found) return found; } return null; }
function definition(id) { return state.catalog.find((item) => item.id === id); }

async function bootstrap() {
  const [catalog, pages] = await Promise.all([api("./api/catalog"), api("./api/pages")]); state.catalog = catalog.components;
  let pageId = new URL(location.href).searchParams.get("page"); if (!pageId || !pages.pages.some((page) => page.pageId === pageId)) pageId = pages.pages[0]?.pageId;
  if (!pageId) pageId = (await api("./api/pages", { method: "POST", body: JSON.stringify({ name: "我的页面" }) })).page.pageId;
  await loadPage(pageId); renderLibrary(); bindStatic(); $("#provider-status").textContent = `真实 B2B Renderer · ${state.catalog.length} 个已适配组件`; 
}

async function loadPage(pageId) { const result = await api(`./api/pages/${pageId}`); state.page = result.page; state.selection = result.selection.nodeId; await renderAll(); }

function bindStatic() {
  $("#page-name").addEventListener("change", async (event) => commit([{ type: "rename", name: event.target.value }]));
  $("#component-search").addEventListener("input", renderLibrary);
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => { document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("is-active", item === tab)); $("#components-panel").classList.toggle("is-hidden", tab.dataset.tab !== "components"); $("#structure-panel").classList.toggle("is-hidden", tab.dataset.tab !== "structure"); }));
  document.querySelectorAll("[data-viewport]").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll("[data-viewport]").forEach((item) => item.classList.toggle("is-active", item === button)); $("#canvas-frame").classList.toggle("is-mobile", button.dataset.viewport === "mobile"); }));
  $("#preview").addEventListener("click", () => { state.preview = !state.preview; $("#preview").textContent = state.preview ? "返回编辑" : "预览"; renderAll(); });
  $("#undo").addEventListener("click", () => history("undo")); $("#redo").addEventListener("click", () => history("redo"));
  $("#export").addEventListener("click", async () => { try { setSaving("saving", "正在导出"); const result = await api(`./api/pages/${state.page.pageId}/export`, { method: "POST", body: "{}" }); setSaving("", "已保存"); toast(`已导出 revision ${result.export.revision}`); } catch (error) { fail(error); } });
}

function renderLibrary() {
  const query = $("#component-search")?.value.trim().toLowerCase() || ""; const list = $("#component-list"); if (!list) return; list.replaceChildren();
  for (const component of state.catalog.filter((item) => `${item.id}${item.label}${item.description}`.toLowerCase().includes(query))) list.append(libraryItem(component.id, component.label, component.description, "component"));
  const layouts = $("#layout-list"); layouts.replaceChildren(); for (const [id, label] of Object.entries(labels)) layouts.append(libraryItem(id, label, id === "columns" ? "2–4 列响应式容器" : "接收组件与布局", "layout"));
}

function libraryItem(id, label, description, kind) {
  const item = document.createElement("div"); item.className = "library-item"; item.draggable = true; item.tabIndex = 0; item.innerHTML = `<span class="library-icon">${kind === "layout" ? "▦" : id.slice(2)}</span><span class="library-copy"><strong>${label}</strong><small>${description}</small></span><button class="add-button" aria-label="添加${label}">+</button>`;
  item.addEventListener("dragstart", (event) => { state.dragging = { kind, id }; event.dataTransfer.effectAllowed = "copy"; event.dataTransfer.setData("text/plain", `${kind}:${id}`); });
  $(".add-button", item).addEventListener("click", () => addNode(kind, id, state.selection));
  item.addEventListener("keydown", (event) => { if (event.key === "Enter") addNode(kind, id, state.selection); }); return item;
}

async function addNode(kind, id, selectedId) {
  let parentId = state.page.root.id; const selected = selectedId ? findNode(state.page.root, selectedId)?.node : null; if (selected?.kind === "layout") parentId = selected.id;
  const node = kind === "layout" ? { kind: "layout", layout: id, gap: "medium", ...(id === "columns" ? { columns: 2 } : {}) } : { kind: "component", componentId: id, props: {} };
  await commit([{ type: "add", parentId, node }], `${kind === "layout" ? labels[id] : definition(id).label}已添加`);
}

function commit(operations, success) {
  mutationQueue = mutationQueue.then(() => commitNow(operations, success));
  return mutationQueue;
}
async function commitNow(operations, success) {
  try { setSaving("saving", "正在保存"); const result = await api(`./api/pages/${state.page.pageId}/operations`, { method: "POST", body: JSON.stringify({ expectedRevision: state.page.revision, operations }) }); state.page = result.page; state.lastCommittedAt = Date.now(); await renderAll(); setSaving("", "已保存"); if (success) toast(success); }
  catch (error) { if (error.code === "REVISION_CONFLICT") await loadPage(state.page.pageId); fail(error); }
}
async function history(direction) { try { const result = await api(`./api/pages/${state.page.pageId}/${direction}`, { method: "POST", body: JSON.stringify({ expectedRevision: state.page.revision }) }); state.page = result.page; await renderAll(); toast(direction === "undo" ? "已撤销" : "已重做"); } catch (error) { fail(error); } }
function fail(error) { setSaving("error", "保存失败"); toast(error.message); console.error(error); }

async function select(nodeId) { state.selection = nodeId; await api(`./api/pages/${state.page.pageId}/selection`, { method: "POST", body: JSON.stringify({ nodeId }) }); renderSelection(); }

async function renderAll() {
  const epoch = ++state.renderEpoch; const nextInstances = new Map(); const fragment = document.createDocumentFragment();
  for (const instance of state.instances.values()) if (!instance.destroyed) instance.destroy(); state.instances.clear();
  $("#page-name").value = state.page.name; $("#revision-badge").textContent = `Revision ${state.page.revision}`; $("#node-count").textContent = `${nodeCount(state.page.root) - 1} 个节点`;
  $("#canvas").classList.toggle("is-preview", state.preview); await renderNode(state.page.root, fragment, true, { epoch, instances: nextInstances });
  if (epoch !== state.renderEpoch) { for (const instance of nextInstances.values()) if (!instance.destroyed) instance.destroy(); return; }
  state.instances = nextInstances; $("#canvas").replaceChildren(fragment); renderTree(); renderSelection();
}

async function renderNode(node, target, isRoot = false, context) {
  const shell = document.createElement("div"); shell.className = `node-shell ${node.kind === "layout" ? "layout-shell" : "component-shell"}${isRoot ? " is-root" : ""}`; shell.dataset.nodeId = node.id; shell.draggable = !isRoot && !state.preview;
  if (!state.preview) {
    shell.addEventListener("click", (event) => { event.stopPropagation(); select(node.id); });
    shell.addEventListener("dragstart", (event) => { event.stopPropagation(); state.dragging = { kind: "existing", id: node.id }; event.dataTransfer.setData("text/plain", `existing:${node.id}`); });
    shell.append(nodeActions(node, isRoot));
  }
  if (node.kind === "layout") {
    shell.classList.add(`layout-node`, `layout-${node.layout}`, `gap-${node.gap}`); if (node.columns) shell.style.setProperty("--columns", node.columns);
    shell.addEventListener("dragover", (event) => { event.preventDefault(); event.stopPropagation(); shell.querySelector(":scope > .drop-hint")?.classList.add("is-dragover"); });
    shell.addEventListener("dragleave", () => shell.querySelector(":scope > .drop-hint")?.classList.remove("is-dragover"));
    shell.addEventListener("drop", async (event) => { event.preventDefault(); event.stopPropagation(); if (!state.dragging) return; const drag = state.dragging; state.dragging = null; if (drag.kind === "existing") { if (drag.id !== node.id) await commit([{ type: "move", nodeId: drag.id, parentId: node.id }], "组件已移动"); } else await addNode(drag.kind, drag.id, node.id); });
    for (const child of node.children) await renderNode(child, shell, false, context);
    if (!node.children.length && !state.preview) { const hint = document.createElement("div"); hint.className = "drop-hint"; hint.textContent = isRoot ? "从左侧拖入组件，或点击 + 添加" : "拖入组件"; shell.append(hint); }
  } else {
    const host = document.createElement("div"); host.className = "component-host"; shell.append(host);
    try { const result = await window.B2B.renderComponent({ component: node.componentId, props: node.props }, host); if (context.epoch !== state.renderEpoch) { result.instance.destroy(); return shell; } context.instances.set(node.id, result.instance); shell.dataset.rendererValid = String(result.audit.valid); }
    catch (error) { host.className = "render-error"; host.textContent = `渲染失败：${error.message}`; console.error(error); }
  }
  target.append(shell); return shell;
}

function nodeActions(node, isRoot) {
  const actions = document.createElement("div"); actions.className = "node-actions";
  if (!isRoot) {
    for (const [label, title, handler] of [["↑", "上移", () => moveSibling(node.id, -1)], ["↓", "下移", () => moveSibling(node.id, 1)], ["⧉", "复制", () => commit([{ type: "duplicate", nodeId: node.id }], "已复制")], ["×", "删除", () => commit([{ type: "remove", nodeId: node.id }], "已删除")]]) { const button = document.createElement("button"); button.textContent = label; button.title = title; button.setAttribute("aria-label", title); button.addEventListener("click", (event) => { event.stopPropagation(); handler(); }); actions.append(button); }
  }
  return actions;
}

function moveSibling(id, delta) { const found = findNode(state.page.root, id); if (!found?.parent) return; const index = found.parent.children.findIndex((child) => child.id === id); const next = Math.max(0, Math.min(found.parent.children.length - 1, index + delta)); if (next !== index) commit([{ type: "move", nodeId: id, parentId: found.parent.id, index: next }], "顺序已调整"); }

function renderSelection() {
  document.querySelectorAll(".node-shell").forEach((el) => el.classList.toggle("is-selected", el.dataset.nodeId === state.selection));
  const found = state.selection ? findNode(state.page.root, state.selection) : null; const inspector = $("#inspector"); inspector.replaceChildren();
  if (!found) { $("#selection-type").textContent = "未选择"; inspector.innerHTML = `<div class="empty-inspector"><span class="empty-icon">◇</span><p>选择画布中的组件</p><small>在这里修改内容、变体和状态</small></div>`; return; }
  const node = found.node; $("#selection-type").textContent = node.kind === "layout" ? labels[node.layout] : `${node.componentId} · ${definition(node.componentId)?.label || "组件"}`;
  if (node.kind === "layout") renderLayoutInspector(node, inspector); else renderComponentInspector(node, inspector);
}

function field(label, key, value, rule, onChange) {
  const wrapper = document.createElement("label");
  if (rule?.type === "boolean") { wrapper.className = "check-field"; wrapper.innerHTML = `<span>${label}</span><input type="checkbox" ${value ? "checked" : ""}>`; $("input", wrapper).addEventListener("change", (event) => onChange(event.target.checked)); return wrapper; }
  wrapper.className = "field"; const title = document.createElement("span"); title.textContent = label; wrapper.append(title); let control;
  if (rule?.values) { control = document.createElement("select"); for (const option of rule.values) { const el = document.createElement("option"); el.value = option; el.textContent = option; el.selected = option === value; control.append(el); } }
  else if (["body"].includes(key)) { control = document.createElement("textarea"); control.value = value ?? ""; }
  else { control = document.createElement("input"); control.value = Array.isArray(value) ? value.join("\n") : value ?? ""; control.type = rule?.type === "number" ? "number" : "text"; }
  control.addEventListener("change", (event) => { let next = event.target.value; if (rule?.type === "number") next = Number(next); if (rule?.type === "array") next = next.split("\n").map((item) => item.trim()).filter(Boolean); onChange(next); }); wrapper.append(control); return wrapper;
}

function renderComponentInspector(node, inspector) {
  const def = definition(node.componentId); for (const key of def.editable) { const rule = def.props[key]; if (!rule) continue; inspector.append(field(propLabel(key), key, node.props[key], rule, (value) => commit([{ type: "updateProps", nodeId: node.id, props: { [key]: value } }], "属性已更新"))); }
  inspector.append(divider(), deleteButton(node.id));
}
function renderLayoutInspector(node, inspector) {
  inspector.append(field("布局方向", "layout", node.layout, { values: ["column", "row", "columns"] }, (value) => commit([{ type: "updateLayout", nodeId: node.id, layout: value }])), field("间距", "gap", node.gap, { values: ["small", "medium", "large"] }, (value) => commit([{ type: "updateLayout", nodeId: node.id, gap: value }])));
  if (node.layout === "columns") inspector.append(field("列数", "columns", node.columns || 2, { type: "number" }, (value) => commit([{ type: "updateLayout", nodeId: node.id, columns: value }]))); if (node.id !== state.page.root.id) inspector.append(divider(), deleteButton(node.id));
}
function propLabel(key) { return ({ label: "文案", value: "当前值", placeholder: "占位提示", title: "标题", body: "正文", meta: "辅助信息", text: "文字", variant: "变体", appearance: "外观", size: "尺寸", state: "状态", color: "颜色", type: "类型", items: "选项（每行一个）", selected: "已选值（每行一个）", disabled: "禁用", loading: "加载中", clearable: "允许清除", closable: "允许关闭", checkable: "可选中", checked: "已选中", hoverable: "悬停反馈", width: "宽度" })[key] || key; }
function divider() { const el = document.createElement("div"); el.className = "inspector-divider"; return el; }
function deleteButton(nodeId) { const button = document.createElement("button"); button.className = "danger-button"; button.textContent = "删除节点"; button.addEventListener("click", () => commit([{ type: "remove", nodeId }], "已删除")); return button; }

function renderTree() { const tree = $("#tree"); tree.replaceChildren(); const visit = (node, depth) => { const item = document.createElement("button"); item.className = `tree-item${node.id === state.selection ? " is-selected" : ""}`; item.style.setProperty("--depth", depth); item.innerHTML = `<span class="tree-indent"></span><span>${node.kind === "layout" ? "▦" : "◇"}</span><span>${node.kind === "layout" ? labels[node.layout] : definition(node.componentId)?.label}</span>`; item.addEventListener("click", () => select(node.id)); tree.append(item); if (node.kind === "layout") node.children.forEach((child) => visit(child, depth + 1)); }; visit(state.page.root, 0); }

bootstrap().catch((error) => { fail(error); $("#canvas").innerHTML = `<div class="render-error">启动失败：${error.message}</div>`; });
