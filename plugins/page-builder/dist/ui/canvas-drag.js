// Drag previews are transient DOM only. A drop commits one indexed page operation.
export function createCanvasDrag({ canStart, onStart, onEnd, onDrop, labelFor }) {
  let session = null;
  let frame = 0;
  const animations = new Map();
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = () => document.querySelector('#canvas');
  const children = parent => [...parent.children].filter(el => el.matches('.node-shell') && el !== session?.source);
  const contains = (r, x, y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

  // Hit testing uses final layout positions, not the animated pixels sliding into place.
  function rect(element) {
    const result = element.getBoundingClientRect(); let x = 0, y = 0;
    for (let el = element; el && el !== canvas(); el = el.parentElement) {
      if (!animations.has(el)) continue;
      const transform = getComputedStyle(el).transform;
      if (transform !== 'none') { const matrix = new DOMMatrixReadOnly(transform); x += matrix.m41; y += matrix.m42; }
    }
    return { left: result.left - x, right: result.right - x, top: result.top - y, bottom: result.bottom - y, width: result.width, height: result.height };
  }

  function reflow(change, animate = true) {
    const shells = [...(canvas()?.querySelectorAll('.node-shell') || [])];
    const before = new Map(shells.filter(el => el.getClientRects().length).map(el => [el, el.getBoundingClientRect()]));
    for (const animation of animations.values()) animation.cancel(); animations.clear();
    change();
    if (!animate || reducedMotion()) return;
    for (const el of shells) {
      const old = before.get(el); if (!old || !el.isConnected || !el.getClientRects().length) continue;
      // Animating an ancestor already moves its descendants; never translate them twice.
      let ancestor = el.parentElement;
      while (ancestor && !animations.has(ancestor)) ancestor = ancestor.parentElement;
      if (ancestor) continue;
      const next = el.getBoundingClientRect(), dx = old.left - next.left, dy = old.top - next.top;
      if (Math.abs(dx) + Math.abs(dy) < 1) continue;
      const animation = el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,0)' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
      animations.set(el, animation);
      animation.finished.then(() => { if (animations.get(el) === animation) animations.delete(el); }, () => {});
    }
  }

  function place(parent, index) {
    if (!session || session.target?.parent === parent && session.target.index === index) return;
    const { placeholder, source, label, height, width } = session;
    reflow(() => {
      session.target?.parent.classList.remove('is-drop-target');
      source?.classList.add('is-drag-source');
      parent.classList.add('is-drop-target');
      placeholder.style.setProperty('--drop-height', `${height}px`);
      placeholder.style.setProperty('--drop-width', `${Math.min(width, parent.clientWidth)}px`);
      const targetLabel = parent.classList.contains('is-root') ? '页面' : parent.dataset.layoutLabel;
      placeholder.querySelector('strong').textContent = `${label} · 松手放到这里`;
      placeholder.querySelector('small').textContent = `${targetLabel} · 第 ${index + 1} 项`;
      placeholder.dataset.parentId = parent.dataset.nodeId;
      placeholder.dataset.index = String(index);
      parent.insertBefore(placeholder, children(parent)[index] || null);
      session.target = { parent, index };
    });
  }

  function clearPreview(animate = true) {
    if (!session?.target) return;
    reflow(() => {
      session.placeholder.remove(); session.target?.parent.classList.remove('is-drop-target');
      session.source?.classList.remove('is-drag-source'); session.target = null; session.anchor = null;
    }, animate);
  }

  function cancel(animate = true) {
    if (!session) return;
    cancelAnimationFrame(frame); frame = 0;
    clearPreview(animate); session.source?.classList.remove('is-drag-origin'); session.ghost.remove();
    session = null; document.body.classList.remove('is-canvas-dragging'); onEnd();
  }

  function targetAt(x, y) {
    const root = canvas()?.querySelector('.is-root'); if (!root) return null;
    const descend = parent => {
      for (const child of children(parent)) {
        if (!child.classList.contains('layout-shell')) continue;
        const r = rect(child); if (!contains(r, x, y)) continue;
        // An edge belongs to the outer layout; the interior belongs to this container.
        const vertical = parent.classList.contains('layout-column');
        const inset = Math.min(12, (vertical ? r.height : r.width) / 4);
        if (vertical ? y > r.top + inset && y < r.bottom - inset : x > r.left + inset && x < r.right - inset) return descend(child);
      }
      return parent;
    };
    const parent = descend(root);
    if (session.source === parent || session.source?.contains(parent)) return null;
    const items = children(parent).map((el, index) => ({ index, r: rect(el) }));
    if (parent.classList.contains('layout-column')) return { parent, index: items.find(item => y < item.r.top + item.r.height / 2)?.index ?? items.length };
    // Both wrapping rows and column grids are read left-to-right, then top-to-bottom.
    const rows = [];
    for (const item of items) {
      let row = rows.at(-1);
      if (!row || item.r.top >= row.bottom - 1) { row = { top: item.r.top, bottom: item.r.bottom, items: [] }; rows.push(row); }
      row.items.push(item); row.bottom = Math.max(row.bottom, item.r.bottom);
    }
    if (!rows.length) return { parent, index: 0 };
    if (y > rows.at(-1).bottom + 8) return { parent, index: items.length };
    const row = rows.find((row, index) => !rows[index + 1] || y < (row.bottom + rows[index + 1].top) / 2);
    return { parent, index: row.items.find(item => x < item.r.left + item.r.width / 2)?.index ?? row.items.at(-1).index + 1 };
  }

  function update(x, y, scrolled = false) {
    if (!session || session.committing) return false;
    const area = canvas(), scroll = document.querySelector('.canvas-scroll');
    if (!area || !contains(area.getBoundingClientRect(), x, y) || !contains(scroll.getBoundingClientRect(), x, y)) { clearPreview(); return false; }
    // Removing a source above its destination shifts the whole destination upward.
    // Reflow alone must not move the drop target while the pointer stays still.
    if (!scrolled && session.target && session.anchor && Math.hypot(x - session.anchor.x, y - session.anchor.y) < 8) return true;
    // Starting a move replaces the source with an equal-sized placeholder in one frame.
    if (session.source && !session.target) place(session.source.parentElement, session.originIndex);
    if (session.target && contains(rect(session.placeholder), x, y)) return true;
    const target = targetAt(x, y);
    if (!target) { clearPreview(); return false; }
    place(target.parent, target.index); session.anchor = { x, y }; return true;
  }

  function tick() {
    frame = 0; if (!session || session.committing || !session.pointer) return;
    const { x, y } = session.pointer, scroll = document.querySelector('.canvas-scroll'), bounds = scroll?.getBoundingClientRect();
    if (bounds && contains(bounds, x, y)) {
      const edge = Math.min(48, bounds.height / 4);
      const delta = y < bounds.top + edge ? -12 * (1 - (y - bounds.top) / edge) : y > bounds.bottom - edge ? 12 * (1 - (bounds.bottom - y) / edge) : 0;
      if (delta) { const before = scroll.scrollTop; scroll.scrollTop += delta; if (scroll.scrollTop !== before) update(x, y, true); }
    }
    frame = requestAnimationFrame(tick);
  }

  function begin(event, drag) {
    if (!canStart() || !event.dataTransfer || event.target.closest('.node-actions, .library-add, input, textarea, select')) { event.preventDefault(); return; }
    cancel(false);
    const source = drag.kind === 'existing' ? event.currentTarget : null;
    if (source?.classList.contains('is-root')) { event.preventDefault(); return; }
    const size = source?.getBoundingClientRect();
    const content = source?.querySelector(':scope > .component-host > *')?.getBoundingClientRect();
    // A component stretches in a column but uses its intrinsic width in a wrapping row.
    const width = content ? Math.min(size.width, content.width + 18) : size?.width;
    const placeholder = document.createElement('div'); placeholder.className = 'drop-placeholder'; placeholder.setAttribute('role', 'status');
    placeholder.append(document.createElement('strong'), document.createElement('small'));
    const label = labelFor(drag), ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.textContent = `${drag.kind === 'existing' ? '移动' : '添加'} · ${label}`;
    document.body.append(ghost);
    session = { drag, source, placeholder, ghost, label, height: Math.max(56, size?.height || 64), width: width || 180, originIndex: source ? [...source.parentElement.children].filter(el => el.matches('.node-shell')).indexOf(source) : -1, target: null, pointer: null, committing: false };
    event.dataTransfer.effectAllowed = source ? 'move' : 'copy';
    event.dataTransfer.setData('text/plain', `${drag.kind}:${drag.id}`); event.dataTransfer.setDragImage(ghost, 18, 18);
    onStart(drag);
    const started = session;
    requestAnimationFrame(() => { if (session !== started) return; ghost.style.visibility = 'hidden'; source?.classList.add('is-drag-origin'); document.body.classList.add('is-canvas-dragging'); });
  }

  // Register once before the library transport starts tracking library-owned listeners.
  document.addEventListener('dragenter', event => {
    if (!session || session.committing) return;
    // A placeholder can replace the element under the pointer between dragover events.
    // Keep its new containing element droppable even when the user releases immediately.
    const valid = canvas()?.contains(event.target);
    event.preventDefault(); event.dataTransfer.dropEffect = valid ? session.source ? 'move' : 'copy' : 'none';
  });
  document.addEventListener('dragover', event => {
    if (!session || session.committing) return;
    session.pointer = { x: event.clientX, y: event.clientY };
    const valid = update(event.clientX, event.clientY);
    event.preventDefault(); event.dataTransfer.dropEffect = valid ? session.source ? 'move' : 'copy' : 'none';
    if (!frame) frame = requestAnimationFrame(tick);
  });
  document.addEventListener('drop', async event => {
    if (!session || session.committing) return;
    event.preventDefault();
    if (!update(event.clientX, event.clientY) || !session.target) { cancel(); return; }
    const current = session, { parent, index } = current.target;
    if (current.source?.parentElement === parent && current.originIndex === index) { cancel(); return; }
    current.committing = true; cancelAnimationFrame(frame); frame = 0;
    current.placeholder.querySelector('strong').textContent = `正在放置${current.label}…`;
    try { await onDrop(current.drag, parent.dataset.nodeId, index); }
    finally { if (session === current) cancel(); }
  });
  document.addEventListener('dragend', () => { if (!session?.committing) cancel(); });
  document.addEventListener('dragleave', event => { if (session && !session.committing && !event.relatedTarget && !event.clientX && !event.clientY) { session.pointer = null; clearPreview(); } });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && session && !session.committing) { event.preventDefault(); cancel(); } }, true);
  window.addEventListener('blur', () => { if (!session?.committing) cancel(); });
  window.addEventListener('pagehide', () => cancel(false));
  return { begin, cancel };
}
