(function bootstrapComponentLoader(global) {
  "use strict";

  var scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : document.baseURI;
  var runtimeBase = new URL("./", scriptUrl);
  var componentBase = new URL("../", runtimeBase);
  var pending = Object.create(null);
  var sourceVersion = "templates-layout-restore-20260915-c52-welcome-bottom-v10-c01-media-20260909-v2-c48-notification-20260908-v1-c50-surface-20260908-v1-c51-progress-20260908-v1-c50-position-20260908-v2-c49-notice-20260908-v1-c47-sizes-20260908-v1-3.4.7-c18-heatmap-metric-v5-c36-sketch-v1-c38-placeholder-v3-c39-gap-v2-c43-layout-v2-c41-responsive-v2-c46-title-tabs-v4-cold-start-v1-c41-divider-v1-c18-palette-continuity-v1-c18-sankey-native-hover-v1-c29-transfer-v7-c30-range-scroll-v3-c32-avatar-v13-c34-full";

  function loadScript(url) {
    var resolved = new URL(url, runtimeBase);
    resolved.searchParams.set("b2b-runtime", sourceVersion);
    var href = resolved.href;
    if (pending[href]) return pending[href];
    var existing = Array.prototype.find.call(document.scripts, function (script) {
      return script.src && script.src.split("?")[0] === href.split("?")[0];
    });
    if (existing && existing.dataset.b2bLoaded === "true") return Promise.resolve(existing);
    pending[href] = new Promise(function (resolve, reject) {
      var script = existing || document.createElement("script");
      function done() { script.dataset.b2bLoaded = "true"; resolve(script); }
      function failed() { reject(new Error("Failed to load component runtime script: " + href)); }
      script.addEventListener("load", done, { once: true });
      script.addEventListener("error", failed, { once: true });
      if (!existing) {
        script.src = href;
        script.async = false;
        script.setAttribute("data-b2b-runtime-script", "");
        document.head.appendChild(script);
      }
      if (existing && (existing.readyState === "complete" || existing.dataset.b2bLoaded === "true")) done();
    });
    return pending[href];
  }

  function loadSequence(urls) {
    return urls.reduce(function (promise, url) {
      return promise.then(function () { return loadScript(url); });
    }, Promise.resolve());
  }

  var directRenderers = {
    "C-41": true
  };

  var directRendererDependencies = {
    "C-52": ["C-04-icon-button/renderer.js", "C-06-split-button-menu-button/renderer.js", "C-23-select/renderer.js", "C-49-alert/renderer.js", "C-52-ai-chat/source.js"],
    "C-12": ["C-12-navigation-menu/source.js"],
    "C-18": [
      "../vendor/@visactor/vchart/2.1.6/vchart.min.js",
      "C-18-data-visualization/source.js"
    ],
    "C-34": [
      "C-03-text-button/renderer.js",
      "C-04-icon-button/renderer.js",
      "C-32-avatar/renderer.js",
      "C-41-tabs/renderer.js",
      "C-47-loading/renderer.js"
    ],
    "C-40": [
      "C-02-basic-button/renderer.js",
      "C-03-text-button/renderer.js",
      "C-04-icon-button/renderer.js",
      "C-11-checkbox/renderer.js",
      "C-15-pagination/renderer.js",
      "C-21-input/renderer.js",
      "C-27-switch/renderer.js",
      "C-32-avatar/renderer.js",
      "C-33-badge/renderer.js",
      "C-42-tag/renderer.js"
    ],
    "C-46": ["C-41-tabs/renderer.js"],
    "C-45": [
      "C-02-basic-button/renderer.js",
      "C-04-icon-button/renderer.js",
      "C-11-checkbox/renderer.js",
      "C-21-input/renderer.js",
      "C-22-radio/renderer.js",
      "C-23-select/renderer.js",
      "C-27-switch/renderer.js",
      "C-32-avatar/renderer.js",
      "C-41-tabs/renderer.js"
    ]
  };

  var componentFamilies = Object.freeze({
    button: Object.freeze(["C-02", "C-03", "C-04", "C-05", "C-06", "C-07"])
  });

  var bootstrap = loadSequence([
    "core.js",
    "contracts.js",
    "api-schema.js",
    "presets.js"
  ]);

  var canonicalBootstrap = null;

  function ensureCanonicalAdapter() {
    if (!canonicalBootstrap) {
      canonicalBootstrap = loadSequence([
        "../shared/specimen-runtime.js",
        "../shared/interactions.js",
        "canonical-adapter.js"
      ]);
    }
    return canonicalBootstrap;
  }

  function resolveId(request) {
    var value = String(request);
    var components = global.B2B && global.B2B.components;
    if (components.contracts && components.contracts[value]) return value;
    var schemas = components.apiSchemas || {};
    return Object.keys(schemas).find(function (id) { return schemas[id].name === value; }) || null;
  }

  global.B2B = global.B2B || {};
  global.B2B.loadComponents = function loadComponents(requested) {
    var values = Array.isArray(requested) ? requested : [requested];
    return bootstrap.then(function () {
      var ids = values.map(resolveId);
      if (ids.some(function (id) { return !id || id === "C-01"; })) throw new Error("Unknown or non-production component: " + values.join(", "));
      var needsCanonicalAdapter = ids.some(function (id) { return !directRenderers[id]; });
      var adapterReady = needsCanonicalAdapter ? ensureCanonicalAdapter() : Promise.resolve();
      return adapterReady.then(function () {
        var scripts = [];
        ids.forEach(function (id) {
          (directRendererDependencies[id] || []).forEach(function (dependency) {
            scripts.push(new URL(dependency, componentBase).href);
          });
          var contract = global.B2B.components.contracts[id];
          var directory = contract.source.replace(/\/contract\.js$/, "");
          scripts.push(new URL(directory + "/renderer.js", componentBase).href);
        });
        return loadSequence(scripts);
      });
    }).then(function () {
      return values.map(function (value) {
        var id = resolveId(value);
        var name = global.B2B.components.apiSchemas[id].name;
        return global.B2B.components[name];
      });
    });
  };

  global.B2B.describeComponent = function describeComponent(request) {
    return global.B2B.loadComponents([request]).then(function (apis) {
      return apis[0].describe();
    });
  };

  global.B2B.describeComponentFamily = function describeComponentFamily(request) {
    var family = String(request || "");
    var ids = componentFamilies[family];
    if (!ids) return Promise.reject(new Error("[B2B components] Unknown component family: " + family));
    return global.B2B.loadComponents(ids).then(function (apis) {
      var definitions = apis.map(function (api) { return api.describe(); });
      return Object.freeze({
        protocolVersion: definitions[0].protocolVersion,
        family: family,
        safeEntry: "B2B.renderComponent",
        inspectEntry: "B2B.describeComponent",
        components: Object.freeze(definitions.map(function (definition) {
          return Object.freeze({
            id: definition.id,
            name: definition.name,
            kind: definition.api.kind,
            selection: definition.api.selection,
            capabilities: definition.api.capabilities,
            metrics: definition.api.metrics,
            props: definition.api.props,
            events: definition.api.events,
            keyboard: definition.api.keyboard
          });
        })),
        sharedLifecycle: Object.freeze(["load", "describe", "create", "mount", "ready", "validate", "update", "destroy"]),
        sharedEventDetail: Object.freeze(["protocolVersion", "family", "componentId", "action"]),
        selectionOrder: Object.freeze(["purpose", "anatomy", "interaction", "variant", "size", "state"]),
        forbidden: Object.freeze(["interchanging component-specific props", "copying specimen DOM", "overriding component-internal CSS", "inventing variants", "silent fallback"])
      });
    });
  };

  global.B2B.renderComponent = function renderComponent(config, target) {
    var request = config || {};
    var allowed = ["component", "props"];
    var unknown = Object.keys(request).filter(function (name) { return allowed.indexOf(name) < 0; });
    if (unknown.length) return Promise.reject(new Error("[B2B components] renderComponent received undeclared options: " + unknown.join(", ")));
    if (!request.component) return Promise.reject(new Error("[B2B components] renderComponent.component is required"));
    var instance = null;
    return global.B2B.loadComponents([request.component]).then(function (apis) {
      var api = apis[0];
      var definition = api.describe();
      if (!definition.conformance || !definition.conformance.valid) throw new Error("[B2B components] " + definition.id + " does not conform to Component API Protocol");
      instance = api.create(request.props || {});
      instance.mount(target);
      return instance.ready.then(function () {
        var audit = instance.validate();
        if (!audit.valid) throw new Error("[B2B components] " + definition.id + " validate() failed: " + audit.errors.join("; "));
        return Object.freeze({
          id: definition.id,
          name: definition.name,
          definition: definition,
          instance: instance,
          audit: audit
        });
      });
    }).catch(function (error) {
      if (instance && !instance.destroyed) instance.destroy();
      throw error;
    });
  };

  global.B2B.componentRuntimeReady = bootstrap;
})(window);
