(function registerCanonicalAdapter(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  if (!runtime) throw new Error("canonical-adapter requires components/runtime/core.js");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeValue(value) {
    if (typeof value === "string") return escapeHtml(value);
    if (Array.isArray(value)) return value.map(safeValue);
    if (value && Object.prototype.toString.call(value) === "[object Object]") {
      var result = {};
      Object.keys(value).forEach(function (key) { result[key] = safeValue(value[key]); });
      return result;
    }
    return value;
  }

  function helpers() {
    var designSource = global.B2BDesignSource;
    var source = designSource && (designSource.componentFactories || designSource.componentSpecimenHelpers);
    runtime.assert(source, "component DOM factories are unavailable; load components/shared/specimen-runtime.js before renderers");
    return source;
  }

  function bindInteractionBridge(source, root) {
    var binding = source.bindInteractions(document);
    root.dispatchEvent(new CustomEvent("b2b:specimens-rendered", {
      bubbles: true,
      detail: { root: root, interactionBinding: binding }
    }));
    return binding;
  }

  function parseCanonical(markup, id, name) {
    runtime.assert(typeof markup === "string" && markup.trim(), id + " canonical factory returned empty markup");
    var template = document.createElement("template");
    template.innerHTML = markup.trim();
    runtime.assert(template.content.childElementCount > 0, id + " canonical factory must return element anatomy");
    var root;
    if (template.content.childElementCount === 1) {
      root = template.content.firstElementChild;
    } else {
      root = document.createElement("div");
      root.className = "b2b-component-instance";
      root.appendChild(template.content);
    }
    root.setAttribute("data-component-reference", id);
    root.setAttribute("data-component-renderer", name);
    return root;
  }

  function syncCanonical(root, markup, id, name) {
    var nextRoot = parseCanonical(markup, id, name);
    runtime.assert(nextRoot.tagName === root.tagName, id + " canonical update cannot change the renderer root tag");
    var interactionSource = root.getAttribute("data-component-interaction-source");
    Array.from(root.attributes).forEach(function (attribute) { root.removeAttribute(attribute.name); });
    Array.from(nextRoot.attributes).forEach(function (attribute) { root.setAttribute(attribute.name, attribute.value); });
    root.setAttribute("data-component-reference", id);
    root.setAttribute("data-component-renderer", name);
    if (interactionSource) root.setAttribute("data-component-interaction-source", interactionSource);
    root.replaceChildren.apply(root, Array.from(nextRoot.childNodes));
    return root;
  }

  function define(config) {
    runtime.assert(config && config.id && config.name && typeof config.render === "function", "canonical adapter definition is incomplete");
    runtime.define({
      id: config.id,
      name: config.name,
      styles: config.styles || [],
      contract: components.contracts && components.contracts[config.id],
      api: components.apiSchemas && components.apiSchemas[config.id],
      create: function createCanonical(props) {
        var rawProps = runtime.resolveProps(config.id, props || {}, config.defaults || {});
        var safeProps = safeValue(rawProps);
        var bridgeProps = config.rawProps ? rawProps : safeProps;
        var root = parseCanonical(config.render(safeProps, helpers()), config.id, config.name);
        var bound = false;
        return runtime.createInstance(root, {
          onMount: function onMount() {
            var source = global.B2BDesignSource;
            if (config.interactive !== false) runtime.assert(source && typeof source.bindInteractions === "function", config.id + " requires components/shared/interactions.js");
            if (config.interactive !== false && !bound) {
              bound = true;
              bindInteractionBridge(source, root);
            }
            if (typeof config.bind === "function") return config.bind(root, bridgeProps, runtime);
          },
          update: config.update === "rerender" ? function updateCanonical(next) {
            var candidateRaw = Object.assign({}, rawProps, next || {});
            var candidateSafe = safeValue(candidateRaw);
            var candidateMarkup = config.render(candidateSafe, helpers());
            Object.keys(rawProps).forEach(function (key) { delete rawProps[key]; });
            Object.assign(rawProps, candidateRaw);
            Object.keys(safeProps).forEach(function (key) { delete safeProps[key]; });
            Object.assign(safeProps, candidateSafe);
            syncCanonical(root, candidateMarkup, config.id, config.name);
          } : (typeof config.update === "function" ? function update(next, element, instance) {
            return config.update(safeValue(next || {}), element, instance, safeProps, runtime);
          } : undefined),
          validate: function validate() {
            var errors = [];
            if (root.getAttribute("data-component-reference") !== config.id) errors.push("component reference mismatch");
            if (root.closest(".component-spec-board, .specimen-cell, .specimen-stage")) errors.push("renderer leaked specimen presentation anatomy");
            if (config.interactive !== false && !(global.B2BDesignSource && typeof global.B2BDesignSource.bindInteractions === "function")) errors.push("component interaction binder is unavailable");
            if (typeof config.validate === "function") errors = errors.concat(config.validate(root, bridgeProps) || []);
            return errors;
          }
        });
      }
    });
  }

  components.canonicalAdapter = Object.freeze({
    define: define,
    escapeHtml: escapeHtml,
    syncCanonical: syncCanonical
  });
})(window);
