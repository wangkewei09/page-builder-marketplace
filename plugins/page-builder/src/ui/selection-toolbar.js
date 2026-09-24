// A body-level toolbar stays outside moving layout shells and canvas clipping.
export function createSelectionToolbar({ mount, clear, actions, canShow }) {
  let element = null, selected = null, signature = null, observer = null;
  function position() {
    if (!element || !selected) return;
    const shell = document.querySelector(`[data-node-id="${CSS.escape(selected)}"]`);
    const clip = document.querySelector(".canvas-scroll")?.getBoundingClientRect();
    const rect = shell?.getBoundingClientRect();
    element.hidden = element.dataset.ready !== "true" || !canShow() || !rect || !clip || rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right;
    if (element.hidden) return;
    const inspector = document.querySelector(".right-panel");
    const overlay = inspector && getComputedStyle(inspector).position === "fixed" && getComputedStyle(inspector).display !== "none" ? inspector.getBoundingClientRect() : null;
    const right = Math.min(clip.right, overlay?.left ?? innerWidth) - 4;
    const edge = Math.max(8, clip.left + 4);
    element.style.maxWidth = `${Math.max(120, right - edge)}px`;
    const bounds = element.getBoundingClientRect();
    const left = Math.max(edge, Math.min(rect.right - bounds.width, right - bounds.width));
    const top = rect.top - bounds.height - 4 >= clip.top ? rect.top - bounds.height - 4 : Math.max(rect.top + 4, clip.top + 4);
    element.style.left = `${left}px`; element.style.top = `${Math.min(top, innerHeight - bounds.height - 8)}px`;
  }
  function reset() {
    observer?.disconnect(); observer = null; clear(); element?.remove(); element = null; selected = null; signature = null;
  }
  async function select(id, key = id) {
    if (id === selected && key === signature) { position(); return; }
    reset(); if (!id) return;
    selected = id; signature = key; const toolbar = document.createElement("div"); element = toolbar;
    toolbar.hidden = true; toolbar.inert = true;
    toolbar.className = "node-actions"; toolbar.setAttribute("role", "toolbar"); toolbar.setAttribute("aria-label", "选中组件操作");
    for (const event of ["click", "pointerdown", "dragstart"]) toolbar.addEventListener(event, e => e.stopPropagation());
    document.body.append(toolbar);
    observer = new ResizeObserver(position); observer.observe(toolbar);
    const shell = document.querySelector(`[data-node-id="${CSS.escape(id)}"]`); if (shell) observer.observe(shell);
    const canvas = document.querySelector(".canvas-scroll"); if (canvas) observer.observe(canvas);
    for (const action of actions(id)) {
      if (element !== toolbar) return;
      const control = document.createElement("span"); control.className = "ui-control"; toolbar.append(control);
      await mount(control, action, id);
    }
    if (element !== toolbar) return;
    toolbar.dataset.ready = "true"; toolbar.inert = false; position();
  }
  // Register before library transport starts tracking component-owned listeners.
  document.addEventListener("scroll", position, true);
  window.addEventListener("resize", position);
  return { select, position, reset, invalidate(id, key = id) { if (id !== selected || key !== signature) reset(); } };
}
