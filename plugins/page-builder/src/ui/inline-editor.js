import { matchesConditions } from "../editor-contract.ts";

// The source library owns anchors. The editor reads their geometry only and mounts
// its own C-21 in a portal; production DOM, CSS and event handlers stay untouched.
export function editableRegions(node, definition) {
  if (!node || node.kind !== "component") return [];
  const shell = [...document.querySelectorAll("#canvas .component-shell")].find(el => el.dataset.nodeId === node.id);
  const root = shell?.querySelector(":scope > .component-host")?.firstElementChild;
  if (!root) return [];
  const props = { ...definition.defaults, ...node.props }, regions = [];
  for (const binding of definition.inline || []) {
    const editor = definition.builder?.fields?.[binding.property] || {};
    if (!matchesConditions(binding.when, props) || !matchesConditions(editor.visibleWhen, props) || !matchesConditions(editor.enabledWhen, props)) continue;
    const elements = binding.selector === ":scope" ? [root] : root.querySelectorAll(binding.selector);
    if (elements.length !== 1) continue; // A renamed or ambiguous anchor keeps its inspector field.
    const element = elements[0], rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || getComputedStyle(element).visibility === "hidden") continue;
    regions.push({ ...binding, element, shell, value: props[binding.property] });
  }
  return regions.filter(region => !regions.some(other => other.element === region.element && other.property !== region.property));
}

export function createInlineEditor({ canEdit, getNode, getRevision, definition, labelFor, select, mount, clear, save, onChange }) {
  let current = null, generation = 0, openRequest = 0;
  const regions = node => editableRegions(node, definition(node.componentId));
  function position() {
    if (!current) return;
    const { panel, region } = current, rect = region.element.getBoundingClientRect();
    const width = Math.min(Math.max(Math.min(rect.width, 420), 320), Math.max(0, innerWidth - 16));
    panel.style.width = `${width}px`;
    panel.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - width - 8))}px`;
    panel.style.top = `${Math.max(8, Math.min(rect.top, innerHeight - panel.offsetHeight - 8))}px`;
  }
  function cancel() {
    openRequest += 1;
    if (!current || current.saving) return;
    generation += 1; const previous = current; current = null;
    clear(); previous.panel.remove(); onChange();
  }
  function finish() {
    if (!current) return Promise.resolve(true);
    const editing = current;
    if (editing.pending) return editing.pending;
    if (!editing.ready) return Promise.resolve(false);
    if (editing.composing) return Promise.resolve(false);
    let value = editing.input.value;
    if (editing.region.control === "number" && value !== "") {
      value = Number(value);
      if (!Number.isFinite(value)) { editing.error.textContent = "请输入有效数字。"; return Promise.resolve(false); }
    }
    if (value === String(editing.region.value ?? "") || value === editing.region.value) { cancel(); return Promise.resolve(true); }
    editing.saving = true; editing.control.inert = true; editing.error.textContent = "正在保存…";
    editing.pending = (async () => {
      try {
        await save(editing.node, editing.region.property, value, editing.revision);
        editing.saving = false; cancel(); return true;
      } catch (error) {
        // Keep the draft visible. An explicit retry still uses its original revision.
        editing.error.textContent = error.code === "REVISION_CONFLICT" ? "页面已被更新，草稿已保留。按 Esc 取消后重新编辑。" : `未保存：${error.message}`;
        return false;
      } finally { editing.saving = false; editing.control.inert = false; editing.pending = null; }
    })();
    return editing.pending;
  }
  async function open(id, property) {
    if (current && !await finish()) return;
    if (!canEdit()) return;
    const request = ++openRequest;
    await select(id);
    if (request !== openRequest || current || !canEdit()) return;
    const node = getNode(id), region = node && regions(node).find(item => item.property === property);
    if (!region) return;
    const epoch = ++generation, panel = document.createElement("div"); panel.className = "inline-editor";
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", `编辑${labelFor(node.componentId, property)}`);
    panel.dataset.nodeId = id; panel.dataset.property = property;
    const control = document.createElement("div"), hint = document.createElement("p"), error = document.createElement("p");
    hint.className = "inline-edit-hint"; hint.textContent = region.control === "textarea" ? "失焦保存 · ⌘ / Ctrl + Enter 保存 · Esc 取消" : "失焦或 Enter 保存 · Esc 取消";
    error.className = "inline-edit-error"; error.setAttribute("role", "status"); error.setAttribute("aria-live", "polite");
    panel.append(control, hint, error); document.body.append(panel);
    const editing = { panel, control, hint, error, region, node: structuredClone(node), revision: getRevision(), ready: false, composing: false };
    current = editing; onChange(); position();
    panel.addEventListener("compositionstart", () => { editing.composing = true; });
    panel.addEventListener("compositionend", () => { editing.composing = false; });
    panel.addEventListener("keydown", event => {
      event.stopPropagation();
      if (event.isComposing || editing.composing || event.keyCode === 229) return;
      if (event.key === "Escape") { event.preventDefault(); cancel(); }
      else if (event.key === "Enter" && (region.control !== "textarea" || event.metaKey || event.ctrlKey)) { event.preventDefault(); void finish(); }
    });
    panel.addEventListener("focusout", () => queueMicrotask(() => { if (current === editing && editing.ready && !panel.contains(document.activeElement)) void finish(); }));
    try {
      const mounted = await mount(control, labelFor(node.componentId, property), region.value, region.control);
      if (epoch !== generation || current !== editing) return;
      if (!mounted) throw new Error("输入控件加载失败，请关闭后重试。");
      editing.input = control.querySelector("input,textarea");
      if (!editing.input) throw new Error("组件库未提供输入控件。");
      if (editing.input.maxLength > 0) hint.textContent += ` · 最多 ${editing.input.maxLength} 字`;
      editing.ready = true; position(); editing.input.focus(); editing.input.select(); panel.dataset.ready = "true";
    } catch (failure) { if (current === editing) { error.textContent = failure.message; editing.ready = false; } }
  }
  document.addEventListener("dblclick", event => {
    if (!canEdit() || current) return;
    const shell = event.target.closest?.("#canvas .component-shell"); if (!shell) return;
    const node = getNode(shell.dataset.nodeId); if (!node) return;
    const region = regions(node).find(({ element }) => { const r = element.getBoundingClientRect(); return event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom; });
    if (region) { event.preventDefault(); event.stopPropagation(); void open(node.id, region.property); }
  }, true);
  // The first outside click commits the draft; it cannot also delete/move/refresh
  // the node before that save has succeeded. Failed saves leave the editor usable.
  document.addEventListener("pointerdown", event => {
    if (!current || current.panel.contains(event.target)) return;
    event.preventDefault(); event.stopImmediatePropagation(); void finish();
  }, true);
  document.addEventListener("click", event => {
    if (!current || current.panel.contains(event.target)) return;
    event.preventDefault(); event.stopImmediatePropagation();
  }, true);
  document.addEventListener("keydown", event => {
    // Escape also works if the source input fails to mount and cannot take focus.
    if (event.key === "Escape" && current && !event.isComposing && !current.composing) {
      event.preventDefault(); event.stopImmediatePropagation(); cancel();
    }
  }, true);
  document.addEventListener("scroll", position, true); window.addEventListener("resize", position);
  return { open, finish, cancel, regions, get active() { return !!current; } };
}
