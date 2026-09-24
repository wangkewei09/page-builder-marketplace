// The saved schema owns content; these records only retain mounted production instances.
// Prepare changed components before touching the live canvas, then reconcile by node id.
export function createCanvasRenderer({ renderComponent, beforeCommit, onSelect, onDragStart, labelFor }) {
  let records = new Map(), generation = 0;
  const dispose = record => { if (record?.instance && !record.instance.destroyed) record.instance.destroy(); };
  function reset() {
    generation += 1;
    for (const record of records.values()) { dispose(record); record.shell.remove(); }
    records.clear();
  }
  async function render(root, target, { preview = false, identity = "" } = {}) {
    const epoch = ++generation, next = new Map(), prepared = [];
    const stale = () => epoch !== generation;
    const prepare = async node => {
      if (stale()) return;
      const key = JSON.stringify([identity, node.kind, node.componentId, node.props]);
      const previous = records.get(node.id);
      let record = previous;
      if (!previous || previous.kind !== node.kind) {
        const shell = document.createElement("div");
        shell.dataset.nodeId = node.id;
        shell.addEventListener("click", event => { if (!shell.closest(".is-preview")) { event.stopPropagation(); onSelect(node.id, event); } });
        shell.addEventListener("dragstart", event => { if (shell.draggable) { event.stopPropagation(); onDragStart(event, node.id); } });
        record = { shell, kind: node.kind, key: null };
      }
      if (node.kind === "component" && record.key !== key) {
        const host = document.createElement("div"); host.className = "component-host";
        record = { ...record, host, key, instance: null };
        prepared.push(record);
        const result = await renderComponent({ component: node.componentId, props: node.props }, host);
        record.instance = result.instance; record.valid = result.audit.valid;
      }
      next.set(node.id, record);
      if (node.kind === "layout") for (const child of node.children) await prepare(child);
    };
    try { await prepare(root); }
    catch (error) { prepared.forEach(dispose); if (!stale()) throw error; return false; }
    if (stale()) { prepared.forEach(dispose); return false; }

    beforeCommit();
    const apply = (node, parent, before = null) => {
      const record = next.get(node.id), shell = record.shell, isRoot = node.id === root.id;
      // Avoid detaching unaffected nodes: it resets focus, iframe/media state and animations.
      if (shell.parentNode !== parent || shell !== before) {
        if (shell.parentNode === parent && typeof parent.moveBefore === "function") parent.moveBefore(shell, before);
        else parent.insertBefore(shell, before);
      }
      shell.draggable = !isRoot && !preview;
      const selected = shell.classList.contains("is-selected");
      shell.className = `node-shell ${node.kind === "layout" ? "layout-shell layout-node" : "component-shell"}${isRoot ? " is-root" : ""}${selected ? " is-selected" : ""}`;
      if (node.kind === "component") {
        if (record.host.parentNode !== shell) shell.replaceChildren(record.host);
        shell.dataset.rendererValid = String(record.valid);
      } else {
        shell.classList.add(`layout-${node.layout}`, `gap-${node.gap}`);
        shell.dataset.layoutLabel = labelFor(node.layout);
        if (node.columns) shell.style.setProperty("--columns", node.columns); else shell.style.removeProperty("--columns");
        let cursor = shell.firstElementChild;
        for (const child of node.children) {
          const childShell = next.get(child.id).shell;
          apply(child, shell, cursor);
          cursor = childShell.nextElementSibling;
        }
        for (const hint of shell.querySelectorAll(":scope > .drop-hint")) hint.remove();
        if (!node.children.length && !preview) {
          const hint = document.createElement("div"); hint.className = "drop-hint";
          hint.textContent = isRoot ? "从左侧拖入组件，或点击添加按钮" : "拖入组件"; shell.append(hint);
        }
      }
    };
    apply(root, target, target.firstElementChild);
    // Move surviving children out before removing a former parent.
    for (const [id, previous] of records) {
      const current = next.get(id);
      if (previous.instance !== current?.instance) dispose(previous);
      if (previous.shell !== current?.shell) previous.shell.remove();
    }
    records = next;
    return true;
  }
  return { render, reset };
}
