// Multiple views of one page must not each attach the same polled selection.
export function contextOwner(pageId, clear) {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel(`page-builder-context:${pageId}`) : null;
  let active = false;
  let closing = null;
  let clock = 0;
  let latest = { clock: 0, id: "" };
  if (channel) channel.onmessage = event => {
    const next = event.data;
    if (next?.type === "hello") { channel.postMessage({ type: "claim", ...latest }); return; }
    if (next?.type !== "claim" || next.id === id || !Number.isFinite(next.clock)) return;
    clock = Math.max(clock, next.clock);
    if (next.clock > latest.clock || next.clock === latest.clock && next.id > latest.id) {
      latest = next;
      if (active) { active = false; void clear(); }
    }
  };
  channel?.postMessage({ type: "hello" });
  return {
    get active() { return active; },
    claim() { if (closing) return; active = true; clock = Math.max(clock + 1, Date.now()); latest = { clock, id }; channel?.postMessage({ type: "claim", ...latest }); },
    close() { active = false; channel?.close(); return closing ||= Promise.resolve(clear()); }
  };
}
