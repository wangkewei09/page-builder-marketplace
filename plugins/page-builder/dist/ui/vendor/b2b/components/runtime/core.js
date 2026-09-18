(function bootstrapB2BComponentRuntime(global) {
  "use strict";

  var B2B = global.B2B = global.B2B || {};
  var components = B2B.components = B2B.components || {};
  var definitions = Object.create(null);
  var scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : document.baseURI;
  var componentsBaseUrl = new URL("../", scriptUrl);
  var sourceVersion = "c52-welcome-bottom-v10-c01-media-20260909-v2-c48-notification-20260908-v1-c50-surface-20260908-v1-c51-progress-20260908-v1-c50-position-20260908-v2-c49-notice-20260908-v1-c47-sizes-20260908-v1-3.3.96-c18-vchart-all-c29-transfer-v7-c30-range-scroll-v2-c32-avatar-v13-c34-full";
  var apiProtocolVersion = "1.0.0";
  var stylePromises = Object.create(null);
  var sequence = 0;

  global.B2BDesignSource = global.B2BDesignSource || {};
  global.B2BDesignSource.runtimeManagedInteractions = true;

  function fail(message) {
    throw new Error("[B2B components] " + message);
  }

  function assertEnum(value, allowed, label) {
    if (allowed.indexOf(value) < 0) {
      fail(label + " must be one of " + allowed.join(", ") + "; received " + String(value));
    }
    return value;
  }

  function assert(condition, message) {
    if (!condition) fail(message);
  }

  function matchesType(value, type) {
    if (type === "null") return value === null;
    if (type === "array") return Array.isArray(value);
    if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
    if (type === "number") return typeof value === "number" && Number.isFinite(value);
    if (type === "enum") return true;
    return typeof value === type;
  }

  function validateProps(api, props, label, partial) {
    if (!api) return props;
    var supplied = props || {};
    var definitionsForProps = api.props || {};
    var componentLabel = label || api.id || api.name || "component";
    var unknown = Object.keys(supplied).filter(function (name) {
      return !Object.prototype.hasOwnProperty.call(definitionsForProps, name);
    });
    if (api.additionalProperties === false && unknown.length) {
      fail(componentLabel + " received undeclared props: " + unknown.join(", ") + ". Read .describe().api.props before creating the component.");
    }
    Object.keys(definitionsForProps).forEach(function (name) {
      var rule = definitionsForProps[name] || {};
      var value = supplied[name];
      var missing = value === undefined;
      if (missing) {
        if (!partial && rule.required && !Object.prototype.hasOwnProperty.call(rule, "default")) fail(componentLabel + "." + name + " is required");
        return;
      }
      var types = String(rule.type || "string|number|boolean|array|object|null").split("|");
      if (!types.some(function (type) { return matchesType(value, type); })) {
        fail(componentLabel + "." + name + " must be " + types.join(" or ") + "; received " + Object.prototype.toString.call(value));
      }
      if (rule.values && rule.values.indexOf(value) < 0) {
        fail(componentLabel + "." + name + " must be one of " + rule.values.join(", ") + "; received " + String(value));
      }
    });
    return supplied;
  }

  function sameValues(left, right) {
    var a = (left || []).map(String).sort();
    var b = (right || []).map(String).sort();
    return a.length === b.length && a.every(function (value, index) { return value === b[index]; });
  }

  function propRole(name) {
    if (["variant"].indexOf(name) >= 0) return "variant";
    if (["appearance", "tone", "size", "shape", "placement", "orientation", "mode"].indexOf(name) >= 0) return "appearance";
    if (["disabled", "loading", "open", "expanded", "selected", "checked", "active", "state", "readonly", "invalid"].indexOf(name) >= 0) return "state";
    if (["items", "columns", "options", "nodes", "data", "value", "values", "label", "title", "text", "content", "description", "icon", "mainIcon", "leadingIcon", "trailingArrow", "badge", "href", "placeholder"].indexOf(name) >= 0) return "content";
    if (/^(on|allow|show|hide|clearable|searchable|closable|addable|scrollable|multiple|range|block)/.test(name)) return "behavior";
    return "configuration";
  }

  function groupProps(api) {
    var groups = { variant: [], appearance: [], state: [], content: [], behavior: [], configuration: [] };
    Object.keys(api && api.props || {}).forEach(function (name) {
      groups[propRole(name)].push(name);
    });
    Object.keys(groups).forEach(function (name) { Object.freeze(groups[name]); });
    return Object.freeze(groups);
  }

  function auditDefinition(definition, contract, api) {
    var errors = [];
    var presets = components.rendererPresets && components.rendererPresets[definition.id];
    if (!contract) errors.push("missing contract");
    if (!api) errors.push("missing api schema");
    if (api) {
      if (api.id !== definition.id) errors.push("api.id must match definition.id");
      if (api.name !== definition.name) errors.push("api.name must match definition.name");
      if (api.additionalProperties !== false) errors.push("api.additionalProperties must be false");
      if (!api.props || !Object.keys(api.props).length) errors.push("api.props must declare the public parameter whitelist");
      Object.keys(api.props || {}).forEach(function (name) {
        var rule = api.props[name] || {};
        if (!rule.type) errors.push("api.props." + name + " is missing type");
        if (Object.prototype.hasOwnProperty.call(rule, "default")) {
          var types = String(rule.type || "").split("|");
          if (!types.some(function (type) { return matchesType(rule.default, type); })) errors.push("api.props." + name + ".default does not match type");
          if (rule.values && rule.values.indexOf(rule.default) < 0) errors.push("api.props." + name + ".default is outside values");
        }
      });
      (api.events || []).forEach(function (name) {
        if (String(name).indexOf("b2b:") !== 0) errors.push("event must use b2b:* namespace: " + name);
      });
      if (!Array.isArray(api.keyboard)) errors.push("api.keyboard must be an array");
      if (!api.domSource) errors.push("api.domSource is required");
      if (!Array.isArray(api.styleSource) || !api.styleSource.length) errors.push("api.styleSource is required");
      if (!api.interactionSource) errors.push("api.interactionSource is required");
      if (api.family === "button") {
        if (!api.kind) errors.push("button-family api.kind is required");
        if (!api.selection) errors.push("button-family api.selection is required");
        if (!api.capabilities || typeof api.capabilities !== "object") errors.push("button-family api.capabilities is required");
        if (!api.metrics || typeof api.metrics !== "object") errors.push("button-family api.metrics is required");
        if (!sameValues(api.styleSource, definition.styles)) errors.push("button-family api.styleSource must exactly match renderer styles");
      }
      if (api.props && api.props.variant && contract && Array.isArray(contract.variants)) {
        if (!sameValues(api.props.variant.values, contract.variants)) errors.push("api.props.variant.values must exactly match contract.variants");
        if (!presets || !sameValues(api.props.variant.values, Object.keys(presets.variants || {}))) errors.push("api.props.variant.values must exactly match preset keys");
        if (!presets || api.props.variant.default !== presets.defaultVariant) errors.push("api.props.variant.default must match preset defaultVariant");
      }
    }
    return Object.freeze({
      protocolVersion: apiProtocolVersion,
      valid: errors.length === 0,
      errors: Object.freeze(errors)
    });
  }

  function buildAiManifest(definition, api) {
    return Object.freeze({
      protocolVersion: apiProtocolVersion,
      safeEntry: "B2B.renderComponent",
      inspectEntry: "B2B.describeComponent",
      familyInspectEntry: "B2B.describeComponentFamily",
      family: api.family || null,
      kind: api.kind || null,
      selection: api.selection || null,
      capabilities: api.capabilities || null,
      metrics: api.metrics || null,
      parameterAuthority: "describe().api.props",
      propGroups: groupProps(api),
      requiredFlow: Object.freeze(["load", "describe", "create", "mount", "ready", "validate"]),
      rendererOwns: Object.freeze(["DOM anatomy", "component styles", "states and motion", "mouse and keyboard interaction", "focus and ARIA", "component dependencies"]),
      callerOwns: Object.freeze(["component selection", "declared props", "business content", "external layout", "b2b:* event handling"]),
      forbidden: Object.freeze(["specimen DOM reuse", "component-internal CSS override", "undeclared props", "duplicate internal interaction", "silent fallback"]),
      failureMode: "throw-before-delivery"
    });
  }

  function resolveProps(id, inputProps, rendererDefaults) {
    var input = inputProps || {};
    var registry = components.rendererPresets || {};
    var entry = registry[id];
    if (!entry) return Object.assign({}, rendererDefaults || {}, input);
    var requestedVariant = input.variant || entry.defaultVariant;
    var preset = entry.variants[requestedVariant];
    assert(preset, id + " variant must be one of " + Object.keys(entry.variants).join(", ") + "; received " + String(requestedVariant));
    return Object.assign({}, rendererDefaults || {}, preset, input, { variant: requestedVariant });
  }

  function uid(prefix) {
    sequence += 1;
    return String(prefix || "b2b-component") + "-" + sequence;
  }

  function element(tagName, attributes, children) {
    var node = document.createElement(tagName);
    var attrs = attributes || {};
    Object.keys(attrs).forEach(function (name) {
      var value = attrs[name];
      if (value === undefined || value === null || value === false) return;
      if (name === "className") node.className = value;
      else if (name === "text") node.textContent = value;
      else if (name === "hidden") node.hidden = Boolean(value);
      else if (name === "disabled") node.disabled = Boolean(value);
      else if (name === "tabIndex") node.tabIndex = value;
      else if (name.indexOf("data-") === 0 || name.indexOf("aria-") === 0 || name === "role" || name === "type" || name === "id" || name === "name" || name === "value" || name === "placeholder" || name === "maxlength" || name === "title") node.setAttribute(name, value === true ? "" : String(value));
      else node[name] = value;
    });
    append(node, children);
    return node;
  }

  function append(parent, children) {
    if (children === undefined || children === null || children === false) return parent;
    var list = Array.isArray(children) ? children : [children];
    list.forEach(function (child) {
      if (child === undefined || child === null || child === false) return;
      if (Array.isArray(child)) append(parent, child);
      else if (child instanceof global.Node) parent.appendChild(child);
      else parent.appendChild(document.createTextNode(String(child)));
    });
    return parent;
  }

  function icon(name, className) {
    return element("span", {
      className: "b2b-icon" + (className ? " " + className : ""),
      "aria-hidden": "true",
      text: name
    });
  }

  function setContent(parent, content) {
    parent.replaceChildren();
    var resolved = typeof content === "function" ? content() : content;
    append(parent, resolved);
    return parent;
  }

  function emit(elementNode, name, detail) {
    elementNode.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: detail || {}
    }));
  }

  function actionDetail(componentId, action, detail) {
    return Object.assign({
      protocolVersion: apiProtocolVersion,
      family: "button",
      componentId: componentId,
      action: action
    }, detail || {});
  }

  function ensureIconFont() {
    if (document.querySelector("style[data-b2b-runtime-icons]")) return;
    var fontUrl = new URL("../icons/material-symbols/variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2", componentsBaseUrl).href;
    var style = document.createElement("style");
    style.setAttribute("data-b2b-runtime-icons", "");
    style.textContent = '@font-face{font-family:"Material Symbols Outlined";src:url("' + fontUrl.replace(/"/g, "%22") + '") format("woff2");font-style:normal;font-weight:100 700;}';
    document.head.appendChild(style);
    if (document.fonts && document.fonts.load) {
      document.fonts.load('20px "Material Symbols Outlined"').then(function () {
        document.documentElement.classList.add("icons-ready");
        if (document.body) document.body.classList.add("icons-ready");
      }).catch(function () {});
    } else {
      document.documentElement.classList.add("icons-ready");
      if (document.body) document.body.classList.add("icons-ready");
    }
  }

  function ensureStyle(path) {
    var resolvedStyleUrl = new URL(path, componentsBaseUrl);
    resolvedStyleUrl.searchParams.set("b2b-runtime", sourceVersion);
    var href = resolvedStyleUrl.href;
    if (stylePromises[href]) return stylePromises[href];
    var existing = Array.prototype.find.call(document.querySelectorAll('link[rel="stylesheet"]'), function (link) {
      return new URL(link.href, document.baseURI).href === href;
    });
    if (existing) {
      stylePromises[href] = existing.sheet
        ? Promise.resolve(existing)
        : new Promise(function (resolve, reject) {
            existing.addEventListener("load", function () { resolve(existing); }, { once: true });
            existing.addEventListener("error", function () { reject(new Error("failed to load component style: " + href)); }, { once: true });
          });
      return stylePromises[href];
    }
    stylePromises[href] = new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-b2b-component-style", path);
      link.addEventListener("load", function () { resolve(link); }, { once: true });
      link.addEventListener("error", function () { reject(new Error("failed to load component style: " + href)); }, { once: true });
      document.head.appendChild(link);
    });
    return stylePromises[href];
  }

  function ensureStyles(paths) {
    ensureIconFont();
    /*
     * A production renderer must declare every component dependency itself.
     * Loading the full components.css bundle here makes isolation meaningless:
     * one renderer can silently borrow selectors from any other component.
     */
    var required = ["../styles/tokens.css", "../styles/base.css", "shared/base.css"].concat(paths || []);
    return Promise.all(required.map(ensureStyle));
  }

  function attachReady(instance, styles) {
    assert(instance && instance.element instanceof global.HTMLElement, "component create() must return an instance with an HTMLElement");
    Object.defineProperty(instance, "ready", {
      configurable: false,
      enumerable: true,
      value: ensureStyles(styles).then(function () {
        return new Promise(function (resolve) {
          global.requestAnimationFrame(function () { resolve(instance); });
        });
      })
    });
    return instance;
  }

  function createInstance(root, hooks) {
    assert(root instanceof global.HTMLElement, "renderer must create an HTMLElement root");
    var options = hooks || {};
    var cleanups = [];
    var mounted = false;
    var destroyed = false;

    function addCleanup(cleanup) {
      if (typeof cleanup === "function") cleanups.push(cleanup);
      return cleanup;
    }

    function mount(target) {
      assert(!destroyed, "cannot mount a destroyed component instance");
      var container = typeof target === "string" ? document.querySelector(target) : target;
      assert(container instanceof global.Element, "mount target must be an Element or a matching selector");
      if (root.parentElement !== container) container.appendChild(root);
      if (!mounted) {
        mounted = true;
        if (typeof options.onMount === "function") addCleanup(options.onMount(root, instance));
      }
      return instance;
    }

    function validate() {
      var errors = [];
      if (!root.getAttribute("data-component-reference")) errors.push("missing data-component-reference");
      if (typeof options.validate === "function") {
        var componentErrors = options.validate(root, instance) || [];
        errors = errors.concat(componentErrors);
      }
      return { valid: errors.length === 0, errors: errors };
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanups.splice(0).reverse().forEach(function (cleanup) { cleanup(); });
      if (typeof options.onDestroy === "function") options.onDestroy(root, instance);
      root.remove();
    }

    var instance = {
      element: root,
      mount: mount,
      update: function update(next) {
        assert(!destroyed, "cannot update a destroyed component instance");
        if (typeof options.update === "function") options.update(next || {}, root, instance);
        return instance;
      },
      validate: validate,
      destroy: destroy,
      addCleanup: addCleanup,
      get mounted() { return mounted; },
      get destroyed() { return destroyed; }
    };

    return instance;
  }

  function define(definition) {
    assert(definition && definition.id && definition.name && typeof definition.create === "function", "component definition requires id, name and create");
    assert(!definitions[definition.name], "duplicate component renderer: " + definition.name);
    var contracts = components.contracts || {};
    var apiSchemas = components.apiSchemas || {};
    var contract = definition.contract || contracts[definition.id] || null;
    var api = definition.api || apiSchemas[definition.id] || null;
    var conformance = auditDefinition(definition, contract, api);
    assert(conformance.valid, definition.id + " " + definition.name + " violates Component API Protocol " + apiProtocolVersion + ": " + conformance.errors.join("; "));
    var manifest = Object.freeze({
      protocolVersion: apiProtocolVersion,
      id: definition.id,
      name: definition.name,
      contract: contract,
      api: api,
      ai: buildAiManifest(definition, api),
      conformance: conformance,
      lifecycle: Object.freeze(["create", "mount", "ready", "validate", "update", "destroy"]),
      styles: Object.freeze((definition.styles || []).slice()),
      interactionSource: api && api.interactionSource ? api.interactionSource : "components/shared/interactions.js",
      parameterAuthority: "api.props",
      sourceAuthority: Object.freeze({
        dom: api && api.domSource ? api.domSource : null,
        styles: api && api.styleSource ? api.styleSource.slice() : (definition.styles || []).slice(),
        interaction: api && api.interactionSource ? api.interactionSource : "components/shared/interactions.js"
      })
    });
    definitions[definition.name] = Object.freeze({
      id: definition.id,
      name: definition.name,
      styles: Object.freeze((definition.styles || []).slice()),
      manifest: manifest,
      create: definition.create
    });
    components[definition.name] = Object.freeze({
      id: definition.id,
      styles: definitions[definition.name].styles,
      create: function create(props) {
        return instantiate(definitions[definition.name], props || {});
      },
      describe: function describe() { return definitions[definition.name].manifest; }
    });
  }

  function instantiate(record, props) {
    validateProps(record.manifest.api, props || {}, record.id + " " + record.name);
    var instance = record.create(props || {});
    assert(instance && instance.element instanceof global.HTMLElement, record.id + " renderer must return a component instance with an HTMLElement root");
    assert(instance.element.getAttribute("data-component-reference") === record.id, record.id + " renderer root must own the exact data-component-reference");
    assert(instance.element.getAttribute("data-component-renderer") === record.name, record.id + " renderer root must own the exact data-component-renderer");
    var rendererUpdate = instance.update;
    assert(typeof rendererUpdate === "function", record.id + " renderer instance must expose update(nextProps)");
    instance.update = function updateDeclaredProps(nextProps) {
      validateProps(record.manifest.api, nextProps || {}, record.id + " " + record.name + ".update", true);
      return rendererUpdate.call(instance, nextProps || {});
    };
    Object.defineProperty(instance, "definition", {
      configurable: false,
      enumerable: true,
      value: record.manifest
    });
    return attachReady(instance, record.styles);
  }

  components.create = function create(name, props) {
    assert(definitions[name], "unknown component renderer: " + name);
    return instantiate(definitions[name], props || {});
  };

  components.getDefinition = function getDefinition(name) {
    return definitions[name] || null;
  };

  components.describe = function describe(name) {
    assert(definitions[name], "unknown component renderer: " + name);
    return definitions[name].manifest;
  };

  components.auditDefinition = function auditRegisteredDefinition(name) {
    assert(definitions[name], "unknown component renderer: " + name);
    return definitions[name].manifest.conformance;
  };

  components.list = function list() {
    return Object.keys(definitions).map(function (name) {
      return { id: definitions[name].id, name: name, styles: definitions[name].styles.slice(), manifest: definitions[name].manifest };
    });
  };

  components.runtime = Object.freeze({
    version: sourceVersion,
    apiProtocolVersion: apiProtocolVersion,
    assert: assert,
    assertEnum: assertEnum,
    validateProps: validateProps,
    auditDefinition: auditDefinition,
    resolveProps: resolveProps,
    uid: uid,
    element: element,
    append: append,
    icon: icon,
    setContent: setContent,
    emit: emit,
    actionDetail: actionDetail,
    ensureStyles: ensureStyles,
    componentsBaseUrl: componentsBaseUrl.href,
    createInstance: createInstance,
    define: define
  });
})(window);
