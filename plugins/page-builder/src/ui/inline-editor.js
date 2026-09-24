import { matchesConditions } from "../editor-contract.ts";

// Source-owned anchors identify public content. Editing temporarily enables only
// that text region; saved props and the real Renderer remain authoritative.
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
    if (!textTarget(element)) continue;
    regions.push({ ...binding, element, shell, value: props[binding.property] });
  }
  return regions.filter(region => !regions.some(other => other.element === region.element && other.property !== region.property));
}

// A mixed anchor (e.g. a button with an icon) may expose one direct text node.
// Never make an entire component editable or let editing consume child components.
function textTarget(element) {
  if (element.matches('input,textarea')) return { native: true };
  if (!element.childElementCount && !element.matches('button')) return { leaf: true };
  const text = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  return text.length === 1 ? { text: text[0] } : null;
}

export function createInlineEditor({ canEdit, getNode, getRevision, definition, labelFor, select, save, onChange, status }) {
  let current = null, openRequest = 0;
  const regions = node => editableRegions(node, definition(node.componentId));
  const read = editing => editing.native ? editing.control.value : editing.control.innerText.replace(/\r\n?/g, '\n');
  function close() {
    openRequest += 1;
    if (!current || current.saving) return;
    const editing = current; current = null;
    // Restore exact nodes and attributes, not an HTML serialization. Icons, source
    // listeners, and live component identity survive cancellation and failed saves.
    editing.control.blur();
    window.getSelection()?.removeAllRanges();
    editing.restore(); status(null); onChange();
  }
  function message(editing, value, invalid = false) {
    if (current !== editing) return;
    status(value);
    if (invalid) editing.control.setAttribute('aria-invalid', 'true');
    else editing.control.removeAttribute('aria-invalid');
  }
  function finish() {
    if (!current) return Promise.resolve(true);
    const editing = current;
    if (editing.pending) return editing.pending;
    if (editing.composing) return Promise.resolve(false);
    let value = read(editing);
    if (editing.region.control !== 'textarea') value = value.replace(/[\r\n]+/g, ' ');
    if (editing.region.control === 'number' && value !== '') {
      value = Number(value);
      if (!Number.isFinite(value)) { message(editing, '请输入有效数字。', true); return Promise.resolve(false); }
    }
    if (value === String(editing.region.value ?? '') || value === editing.region.value) { close(); return Promise.resolve(true); }
    editing.saving = true;
    message(editing, '正在保存…');
    editing.pending = (async () => {
      try {
        await save(editing.node, editing.region.property, value, editing.revision);
        editing.saving = false; close(); return true;
      } catch (error) {
        message(editing, error.code === 'REVISION_CONFLICT' ? '页面已被更新，草稿已保留。按 Esc 取消后重新编辑。' : `未保存：${error.message}`, true);
        return false;
      } finally { editing.saving = false; editing.pending = null; }
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
    const target = textTarget(region.element); if (!target) return;
    const native = target.native, element = region.element;
    // Only anonymous text beside an icon needs a temporary span. Leaf text uses
    // its actual existing strong/p/span/div; native inputs use the existing input.
    const control = target.text ? document.createElement('span') : element;
    const originalNodes = !native && !target.text ? [...element.childNodes] : null;
    const originalAttributes = new Map([...control.attributes].map(attr => [attr.name, attr.value]));
    const originalValue = native ? control.value : null, draggable = region.shell.draggable;
    // Entering text editing must not switch a button to hover/pressed colors or
    // make a disabled input look enabled. Freeze only its current source paint.
    const paint = getComputedStyle(element);
    const paintSnapshot = Object.fromEntries(['color', 'backgroundColor', 'borderColor', 'boxShadow', 'opacity'].map(key => [key, paint[key]]));
    let paintAnimation = null;
    if (target.text) target.text.replaceWith(control);
    const editing = { node: structuredClone(node), region, native, control, revision: getRevision(), composing: false, restore() {
      paintAnimation?.cancel();
      if (target.text) control.replaceWith(target.text);
      else {
        if (native) control.value = originalValue;
        else control.replaceChildren(...originalNodes);
        for (const attr of [...control.attributes]) if (!originalAttributes.has(attr.name)) control.removeAttribute(attr.name);
        for (const [name, value] of originalAttributes) control.setAttribute(name, value);
      }
      region.shell.draggable = draggable;
    } };
    current = editing; region.shell.draggable = false;
    if (element.matches('button,input,textarea')) {
      // A held paint effect leaves inline attributes and source styles untouched.
      paintAnimation = element.animate([paintSnapshot, paintSnapshot], { duration: 1, fill: 'both' });
    }
    control.setAttribute('data-pb-inline-edit', region.control);
    control.setAttribute('aria-label', labelFor(node.componentId, property));
    if (native) {
      control.disabled = false; control.readOnly = false; control.value = String(region.value ?? '');
    } else {
      control.contentEditable = 'plaintext-only'; control.setAttribute('role', 'textbox');
      control.setAttribute('aria-multiline', String(region.control === 'textarea'));
      control.textContent = String(region.value ?? '');
    }
    onChange();
    status(region.control === 'textarea' ? '正在原位编辑 · Enter 换行 · ⌘ / Ctrl + Enter 保存 · Esc 取消' : '正在原位编辑 · Enter 或失焦保存 · Esc 取消');
    control.focus({ preventScroll: true });
    if (native) control.select();
    else { const range = document.createRange(); range.selectNodeContents(control); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
    if (document.activeElement !== control) { close(); status('此内容暂时无法获得编辑焦点。'); }
  }
  const inside = event => current && (event.target === current.control || current.control.contains(event.target));
  // These editor commands can continue after a successful save. Canvas/source
  // buttons remain suppressed: editing their text must never activate them.
  const editorButton = event => event.target.closest?.('#project-menu button,.library-add button,#undo button,#redo button');
  document.addEventListener('dblclick', event => {
    if (!canEdit() || current) return;
    const shell = event.target.closest?.('#canvas .component-shell'); if (!shell) return;
    const node = getNode(shell.dataset.nodeId); if (!node) return;
    const region = regions(node).find(({ element }) => { const r = element.getBoundingClientRect(); return event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom; });
    if (region) { event.preventDefault(); event.stopPropagation(); void open(node.id, region.property); }
  }, true);
  document.addEventListener('pointerdown', event => {
    if (!current) return;
    if (inside(event) && !current.saving) return;
    event.preventDefault(); event.stopImmediatePropagation();
    // Defer to click so an immediately completed save cannot run the command twice.
    if (!editorButton(event)) void finish();
  }, true);
  document.addEventListener('click', event => {
    if (!current) return;
    // Caret placement uses pointerdown; clicking text must not activate a source
    // button, link, checkbox or its containing selection/drag handler.
    event.preventDefault(); event.stopImmediatePropagation();
    const button = editorButton(event);
    if (button) void finish().then(saved => { if (saved && button.isConnected && !button.disabled) button.click(); });
  }, true);
  document.addEventListener('keydown', event => {
    if (!current) return;
    if (current.saving) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (event.isComposing || current.composing || event.keyCode === 229) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); }
    else if (inside(event)) {
      event.stopPropagation();
      if (event.key === 'Enter' && (current.region.control !== 'textarea' || event.metaKey || event.ctrlKey)) { event.preventDefault(); void finish(); }
    }
  }, true);
  document.addEventListener('beforeinput', event => {
    if (!inside(event)) return;
    if (current.saving || event.inputType.startsWith('format')) event.preventDefault();
    else if (['insertParagraph', 'insertLineBreak'].includes(event.inputType) && !current.native) {
      event.preventDefault();
      if (!current.composing) document.execCommand('insertText', false, current.region.control === 'textarea' ? '\n' : ' ');
    }
  }, true);
  document.addEventListener('input', event => { if (inside(event)) event.stopImmediatePropagation(); }, true);
  document.addEventListener('paste', event => {
    if (!inside(event)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (current.saving) return;
    let text = event.clipboardData?.getData('text/plain') || '';
    if (current.region.control !== 'textarea') text = text.replace(/[\r\n]+/g, ' ');
    // insertText preserves the browser's editing undo stack and cannot insert HTML.
    document.execCommand('insertText', false, text);
  }, true);
  for (const type of ['dragstart', 'drop']) document.addEventListener(type, event => { if (current) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  document.addEventListener('compositionstart', event => { if (inside(event)) current.composing = true; }, true);
  document.addEventListener('compositionend', event => { if (inside(event)) current.composing = false; }, true);
  document.addEventListener('focusout', event => {
    if (!inside(event)) return;
    const editing = current;
    queueMicrotask(() => { if (current === editing && document.activeElement !== editing.control && !editing.control.contains(document.activeElement)) void finish(); });
  }, true);
  return { open, finish, cancel: close, regions, get active() { return !!current; } };
}
