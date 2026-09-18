// Transport only: execute the library bytes unchanged and resolve browser resources.
export function installLibraryTransport(assets) {
  const origin = "https://page-builder.invalid/";
  const head = document.head, appendChild = head.appendChild.bind(head), append = head.append.bind(head);
  const originalAppendChild = head.appendChild, originalAppend = head.append;
  const nodes = new Set(), globals = new Map(), fonts = new Set();
  const listeners = [];
  // The source runtime delegates interactions to document and does not expose a disposer.
  // Own those registrations for this library lifetime; the App bridge connects before install.
  const eventTargets = [window, document].map(target => {
    const add = target.addEventListener, remove = target.removeEventListener;
    target.addEventListener = function(type, listener, options) {
      const capture = typeof options === "boolean" ? options : Boolean(options?.capture);
      if (listener && !listeners.some(item => item.target === target && item.type === type && item.listener === listener && item.capture === capture)) listeners.push({ target, type, listener, capture });
      return add.call(target, type, listener, options);
    };
    target.removeEventListener = function(type, listener, options) {
      const capture = typeof options === "boolean" ? options : Boolean(options?.capture);
      const index = listeners.findIndex(item => item.target === target && item.type === type && item.listener === listener && item.capture === capture);
      if (index >= 0) listeners.splice(index, 1);
      return remove.call(target, type, listener, options);
    };
    return { target, add, remove };
  });
  let disposed = false;
  const scripts = new Map(), cssCache = new Map();
  const resolve = (value, base = origin) => new URL(value, base);
  function key(value, base) {
    const url = resolve(value, base);
    if (url.origin !== new URL(origin).origin) throw new Error(`组件库引用了未打包的资源：${url.href}`);
    return decodeURIComponent(url.pathname.slice(1));
  }
  function read(value, base) { const name = key(value, base); if (!Object.hasOwn(assets, name)) throw new Error(`缺少组件库资源：${name}`); return assets[name]; }
  function assetURL(value, base = origin) { return /^(data:|#)/.test(value) ? value : read(value, base); }
  function cssText(text, base, ancestors = []) {
    return text.replace(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?([^;]*);/g, (_all, relative, media) => {
      const imported = stylesheet(resolve(relative, base).href, ancestors);
      return media.trim() ? `@media ${media.trim()}{${imported}}` : imported;
    }).replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/g, (all, _quote, relative) => /^(data:|#)/.test(relative) ? all : `url("${assetURL(relative, base)}")`);
  }
  function stylesheet(url, ancestors = []) {
    const name = key(url); if (ancestors.includes(name)) throw new Error(`组件库样式循环引用：${name}`);
    if (!cssCache.has(name)) cssCache.set(name, cssText(read(url), resolve(url).href, [...ancestors, name]));
    return cssCache.get(name);
  }
  function deliver(node) {
    if (disposed) throw new Error("组件库运行资源已释放");
    if (node instanceof HTMLScriptElement && node.getAttribute("src")) {
      const url = resolve(node.getAttribute("src")).href, source = read(url);
      node.removeAttribute("src"); Object.defineProperty(node, "src", { configurable: true, get: () => url }); node.textContent = source;
      let failure; const onError = event => { failure = event.error || new Error(event.message); };
      const before = Object.getOwnPropertyDescriptors(window); nodes.add(node);
      window.addEventListener("error", onError);
      try { appendChild(node); } finally {
        window.removeEventListener("error", onError);
        for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(window))) {
          const previous = before[name];
          if (!globals.has(name) && (!previous || descriptor.value !== previous.value || descriptor.get !== previous.get)) globals.set(name, previous);
        }
      }
      queueMicrotask(() => node.dispatchEvent(new Event(failure ? "error" : "load"))); return node;
    }
    if (node instanceof HTMLLinkElement && node.rel === "stylesheet") {
      const url = resolve(node.getAttribute("href")).href, style = document.createElement("style"); style.textContent = stylesheet(url);
      style.dataset.b2bComponentStyle = node.dataset.b2bComponentStyle || key(url);
      nodes.add(node); nodes.add(style);
      node.removeAttribute("href"); Object.defineProperty(node, "href", { configurable: true, get: () => url }); Object.defineProperty(node, "sheet", { configurable: true, get: () => style.sheet });
      appendChild(node); appendChild(style); queueMicrotask(() => node.dispatchEvent(new Event("load"))); return node;
    }
    if (node instanceof HTMLStyleElement) { nodes.add(node); node.textContent = cssText(node.textContent, origin); }
    return appendChild(node);
  }
  head.appendChild = deliver;
  head.append = (...nodes) => { for (const node of nodes) typeof node === "string" ? append(node) : deliver(node); };
  const OriginalFontFace = window.FontFace;
  if (OriginalFontFace) window.FontFace = new Proxy(OriginalFontFace, { construct(Target, args) { const font = new Target(args[0], typeof args[1] === "string" ? cssText(args[1], origin) : args[1], args[2]); fonts.add(font); return font; } });
  function script(value) {
    const url = resolve(value).href;
    if (!scripts.has(url)) scripts.set(url, new Promise((resolveScript, reject) => {
      const el = document.createElement("script"); el.src = url;
      el.addEventListener("load", () => resolveScript(el), { once: true }); el.addEventListener("error", () => reject(new Error(`组件库脚本执行失败：${key(url)}`)), { once: true });
      try { deliver(el); } catch (error) { reject(error); }
    })); return scripts.get(url);
  }
  function dispose() {
    if (disposed) return; disposed = true;
    for (const { target, add, remove } of eventTargets) {
      for (const item of listeners) if (item.target === target) remove.call(target, item.type, item.listener, item.capture);
      target.addEventListener = add; target.removeEventListener = remove;
    }
    listeners.length = 0;
    head.appendChild = originalAppendChild; head.append = originalAppend;
    if (OriginalFontFace) window.FontFace = OriginalFontFace;
    for (const node of nodes) node.remove();
    for (const font of fonts) document.fonts.delete(font);
    for (const [name, descriptor] of globals) {
      if (descriptor) Object.defineProperty(window, name, descriptor);
      else if (Object.getOwnPropertyDescriptor(window, name)?.configurable) delete window[name];
      else if (Object.getOwnPropertyDescriptor(window, name)?.writable) window[name] = undefined;
    }
    scripts.clear(); cssCache.clear(); nodes.clear(); fonts.clear(); globals.clear();
  }
  return { script, assetURL, dispose };
}
