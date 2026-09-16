(function registerButtonDocsRuntime(global) {
  "use strict";

  var D = global.B2BDesignSource;
  var scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : document.baseURI;
  var loaderUrl = new URL("../runtime/loader.js?v=20260821-c09-integration-v2", scriptUrl).href;
  var loaderPromise = null;
  var mounted = Object.create(null);
  var revisions = Object.create(null);

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function mountPoint(id, name) {
    return '<span class="button-docs-mount" data-button-docs-component="' + escapeHtml(id) + '" data-button-docs-scenario="' + escapeHtml(name) + '" aria-busy="true"></span>';
  }

  function switchButton(group, value, label, active) {
    return '<button type="button" class="button-docs-switch' + (active ? ' is-active' : '') + '" data-button-docs-control="' + escapeHtml(group) + '" data-button-docs-value="' + escapeHtml(value) + '" aria-pressed="' + String(Boolean(active)) + '">' + escapeHtml(label) + '</button>';
  }

  function table(rows) {
    return '<div class="button-docs-table-wrap"><table class="button-docs-table"><thead><tr><th>参数</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>' + rows.map(function (row) {
      return '<tr><th><code>' + escapeHtml(row[0]) + '</code></th><td><code>' + escapeHtml(row[1]) + '</code></td><td><code>' + escapeHtml(row[2]) + '</code></td><td>' + escapeHtml(row[3]) + '</td></tr>';
    }).join("") + '</tbody></table></div>';
  }

  function code(source) {
    return '<pre class="button-docs-code"><code>' + escapeHtml(source) + '</code></pre>';
  }

  function markExecutedSharedScripts() {
    var source = global.B2BDesignSource;
    var executed = [
      { pattern: /\/components\/shared\/specimen-runtime\.js(?:\?|$)/, ready: Boolean(source && source.componentFactories) },
      { pattern: /\/components\/shared\/interactions\.js(?:\?|$)/, ready: Boolean(source && typeof source.bindInteractions === "function") }
    ];
    Array.from(document.scripts).forEach(function (script) {
      var match = executed.find(function (item) { return item.ready && item.pattern.test(script.src); });
      if (match) script.dataset.b2bLoaded = "true";
    });
  }

  function ensureRuntime(id) {
    if (global.B2B && typeof global.B2B.loadComponents === "function") {
      markExecutedSharedScripts();
      return global.B2B.loadComponents(id);
    }
    if (!loaderPromise) {
      loaderPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = loaderUrl;
        script.setAttribute("data-button-docs-loader", "");
        script.addEventListener("load", function () { markExecutedSharedScripts(); resolve(); }, { once: true });
        script.addEventListener("error", function () { reject(new Error("Button production runtime failed to load")); }, { once: true });
        document.head.appendChild(script);
      });
    }
    return loaderPromise.then(function () { return global.B2B.loadComponents(id); });
  }

  function destroy(id) {
    (mounted[id] || []).splice(0).forEach(function (instance) {
      if (instance && !instance.destroyed) instance.destroy();
    });
  }

  function mountComponent(config, scope) {
    var root = scope || document;
    var selector = '[data-button-docs-component="' + config.id + '"]';
    var placeholders = Array.from(root.querySelectorAll(selector));
    if (!placeholders.length) return Promise.resolve([]);
    revisions[config.id] = (revisions[config.id] || 0) + 1;
    var revision = revisions[config.id];
    destroy(config.id);
    mounted[config.id] = [];
    return ensureRuntime(config.id).then(function () {
      if (revision !== revisions[config.id]) return [];
      var api = global.B2B.components[config.apiName];
      var instances = placeholders.map(function (placeholder) {
        var name = placeholder.dataset.buttonDocsScenario;
        var props = Object.assign({}, config.scenarios[name]);
        if (!props) throw new Error(config.id + " unknown specimen scenario: " + name);
        var instance = api.create(props).mount(placeholder);
        placeholder._buttonDocsInstance = instance;
        placeholder._buttonDocsProps = props;
        mounted[config.id].push(instance);
        return instance;
      });
      if (typeof config.wire === "function") config.wire(root, instances);
      return Promise.all(instances.map(function (instance) {
        return instance.ready.then(function () {
          var host = instance.element.parentElement;
          var result = instance.validate();
          host.setAttribute("aria-busy", "false");
          host.dataset.buttonDocsValidation = result.valid ? "valid" : "invalid";
          if (!result.valid) host.dataset.buttonDocsErrors = result.errors.join(" | ");
          return result;
        });
      }));
    }).catch(function (error) {
      placeholders.forEach(function (placeholder) {
        placeholder.setAttribute("aria-busy", "false");
        placeholder.dataset.buttonDocsValidation = "error";
        placeholder.dataset.buttonDocsErrors = error.message;
      });
      return [];
    });
  }

  function activateSwitches(root, group, value) {
    root.querySelectorAll('[data-button-docs-control="' + group + '"]').forEach(function (button) {
      var active = button.dataset.buttonDocsValue === String(value);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  D.buttonDocs = Object.freeze({
    escapeHtml: escapeHtml,
    mountPoint: mountPoint,
    switchButton: switchButton,
    table: table,
    code: code,
    mountComponent: mountComponent,
    activateSwitches: activateSwitches
  });
})(window);
