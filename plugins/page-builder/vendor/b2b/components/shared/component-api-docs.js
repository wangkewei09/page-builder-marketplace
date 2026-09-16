(function registerComponentApiDocs(global) {
  "use strict";

  var D = global.B2BDesignSource;
  var scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : document.baseURI;
  var loaderUrl = new URL("../runtime/loader.js?v=c52-welcome-bottom-v10-c01-media-20260909-v2-c48-notification-20260908-v1-c50-surface-20260908-v1-c51-progress-20260908-v1-c50-position-20260908-v2-c49-notice-20260908-v1-c47-sizes-20260908-v1-20260904-c18-palette-continuity-v1-c18-sankey-native-hover-v1-c32-avatar-ellipsis-center-v8-c34-full-c18-heatmap-metric-v5-c36-sketch-v1-c38-placeholder-v3-c39-gap-v2-c43-layout-v2-c41-responsive-v2-c46-title-tabs-v4-cold-start-v1-c41-divider-v1", scriptUrl).href;
  var loaderPromise = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
        script.setAttribute("data-component-api-docs-loader", "");
        script.addEventListener("load", function () { markExecutedSharedScripts(); resolve(); }, { once: true });
        script.addEventListener("error", function () { reject(new Error("Component API docs runtime failed to load")); }, { once: true });
        document.head.appendChild(script);
      });
    }
    return loaderPromise.then(function () { return global.B2B.loadComponents(id); });
  }

  function variantButton(item, active) {
    return '<button type="button" class="component-api-docs-switch' + (active ? ' is-active' : '') + '" data-component-docs-variant="' + escapeHtml(item.key) + '" aria-pressed="' + String(Boolean(active)) + '">' + escapeHtml(item.label) + '</button>';
  }

  function initialSelection(config) {
    return (config.controlGroups || []).reduce(function (selection, group) {
      var preferred = config.initialSelection && config.initialSelection[group.key];
      var option = group.options.find(function (item) { return item.value === preferred; }) || group.options[0];
      selection[group.key] = option.value;
      return selection;
    }, {});
  }

  function resolveControlScenario(config, selection) {
    var scenario = config.resolveSelection(Object.assign({}, selection));
    if (!scenario || !scenario.props || !Array.isArray(scenario.parameterKeys)) {
      throw new Error(config.id + " control resolver must return props and parameterKeys");
    }
    return scenario;
  }

  function normalizeControlSelection(config, selection, changedKey) {
    if (typeof config.normalizeSelection !== "function") return selection;
    return config.normalizeSelection(Object.assign({}, selection), changedKey) || selection;
  }

  function valueLabel(value) {
    if (value === undefined) return "—";
    var serialized = JSON.stringify(value);
    return serialized === undefined ? String(value) : serialized;
  }

  function controlOptionMarkup(option) {
    var api = Array.isArray(option.api) ? option.api : [];
    if (!api.length && !option.description) return escapeHtml(option.label);
    var apiText = api.map(function (item) { return item.name + "=" + valueLabel(item.value); }).join(" + ");
    return '<span class="component-api-docs-option-label">' + escapeHtml(option.label) + '</span>' +
      (apiText ? '<code class="component-api-docs-option-api">' + escapeHtml(apiText) + '</code>' : '') +
      (option.description ? '<small class="component-api-docs-option-description">' + escapeHtml(option.description) + '</small>' : '');
  }

  function controlGroupVisible(group, selection) {
    return typeof group.visibleWhen !== "function" || group.visibleWhen(selection) !== false;
  }

  function controlGroupsMarkup(config, selection) {
    return '<div class="component-api-docs-control-grid">' + config.controlGroups.map(function (group) {
      var options = group.options.map(function (option) {
        var active = selection[group.key] === option.value;
        var detailed = Array.isArray(option.api) && option.api.length || option.description;
        return '<button type="button" class="component-api-docs-switch' + (detailed ? ' has-api-detail' : '') + (active ? ' is-active' : '') + '" data-component-docs-control="' + escapeHtml(group.key) + '" data-component-docs-value="' + escapeHtml(option.value) + '" aria-pressed="' + String(active) + '"' + (group.statusOnly ? ' disabled aria-disabled="true"' : '') + '>' + controlOptionMarkup(option) + '</button>';
      }).join("");
      return '<div class="component-api-docs-control-row" data-component-docs-control-row="' + escapeHtml(group.key) + '"' + (controlGroupVisible(group, selection) ? '' : ' hidden') + '><strong>' + escapeHtml(group.label) + (group.apiLabel ? '<code>' + escapeHtml(group.apiLabel) + '</code>' : '') + '</strong><div role="group" aria-label="' + escapeHtml(group.label) + '">' + options + (group.note ? '<span class="component-api-docs-control-note">' + escapeHtml(group.note) + '</span>' : '') + '</div></div>';
    }).join("") + '</div>';
  }

  function markup(config) {
    var usesControlGroups = Array.isArray(config.controlGroups) && config.controlGroups.length > 0;
    var selection = usesControlGroups ? initialSelection(config) : null;
    var first = usesControlGroups ? resolveControlScenario(config, selection) : config.variants[0];
    var panelPrefix = "component-api-docs-" + String(config.id).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    var codePanelId = panelPrefix + "-code";
    var paramsPanelId = panelPrefix + "-params";
    var categories = config.categories.map(function (category) {
      var labels = config.variants.filter(function (item) { return item.category === category.name; }).map(function (item) { return item.label; }).join("、");
      return '<article><strong>' + escapeHtml(category.name) + '</strong><p>' + escapeHtml(category.description) + '</p><span>' + escapeHtml(labels) + '</span></article>';
    }).join("");
    var controls = usesControlGroups
      ? controlGroupsMarkup(config, selection)
      : '<div class="component-api-docs-variants" role="group" aria-label="' + escapeHtml(config.title) + ' 变体">' + config.variants.map(function (item, index) { return variantButton(item, index === 0); }).join("") + '</div>';
    return '<div class="component-production-docs component-api-docs" data-component-api-docs data-component-api-docs-id="' + escapeHtml(config.id) + '">' +
      '<section class="component-api-docs-intro"><div class="component-api-docs-heading"><span>组件简介</span><h3>' + escapeHtml(config.title) + '</h3><p>' + escapeHtml(config.introduction) + '</p></div><div class="component-api-docs-categories">' + categories + '</div></section>' +
      '<section class="component-api-docs-workbench"><div class="component-api-docs-section-head"><div><span>' + escapeHtml(config.controlsEyebrow || "全部变体与交互") + '</span><h3>' + escapeHtml(config.controlsHeading || "选择变体，操作真实组件") + '</h3></div><p>每次切换均由 B2B.renderComponent() 重新创建并校验。</p></div>' + controls + '<div class="component-api-docs-current"><span data-component-docs-category>' + escapeHtml(first.category) + '</span><strong data-component-docs-title>' + escapeHtml(first.label) + '</strong><p data-component-docs-description>' + escapeHtml(first.description) + '</p></div><div class="component-api-docs-preview"><div data-component-docs-mount aria-busy="true"></div></div><div class="component-api-docs-interaction"><div class="component-api-docs-interaction-info"><p data-component-docs-interaction>' + escapeHtml(first.interaction) + '</p><output data-component-docs-event role="log" aria-live="polite">等待真实 b2b:* 事件</output></div><div class="component-api-docs-actions" aria-label="当前变体文档操作"><button type="button" class="component-api-docs-action" data-component-docs-code-toggle aria-expanded="false" aria-controls="' + codePanelId + '">展开代码</button><button type="button" class="component-api-docs-action" data-component-docs-copy>复制代码</button><button type="button" class="component-api-docs-action" data-component-docs-params-toggle aria-expanded="true" aria-controls="' + paramsPanelId + '">收起参数</button></div></div></section>' +
      '<section class="component-api-docs-ai" id="' + codePanelId + '" hidden><div class="component-api-docs-section-head"><div><span>当前变体 · AI 调用代码</span><h3>复制后可直接交给 AI 或页面代码使用</h3></div></div><pre><code data-component-docs-code></code></pre><p>代码只包含 <code>describe().api.props</code> 声明字段，并调用当前组件库的生产 Renderer。</p></section>' +
      '<section class="component-api-docs-params" id="' + paramsPanelId + '"><div class="component-api-docs-section-head"><div><span>当前变体 · API 参数</span><h3 data-component-docs-params-title>' + escapeHtml(first.label) + ' 参数</h3></div><p>当前值与合法范围均来自本次真实调用和 describe()。</p></div><div data-component-docs-params></div></section>' +
      '</div>';
  }

  function buildCode(config, props) {
    var annotation = typeof config.codeAnnotation === "function" ? config.codeAnnotation(props) : "";
    return 'const definition = await B2B.describeComponent("' + config.id + '");\n' +
      'if (!definition.conformance.valid) {\n' +
      '  throw new Error(definition.conformance.errors.join("; "));\n' +
      '}\n\n' + (annotation ? annotation + "\n" : "") +
      'const result = await B2B.renderComponent({\n' +
      '  component: "' + config.id + '",\n' +
      '  props: ' + JSON.stringify(props, null, 2) + '\n' +
      '}, document.querySelector("' + config.slotSelector + '"));\n\n' +
      'if (!result.audit.valid) {\n' +
      '  throw new Error(result.audit.errors.join("; "));\n' +
      '}';
  }

  function allowedLabel(schema) {
    if (schema.values) return schema.values.join(" / ");
    if (schema.item && schema.item.fields) return (Array.isArray(schema.item.fields) ? schema.item.fields : Object.keys(schema.item.fields)).join(" / ");
    return "—";
  }

  function paramsMarkup(definition, variant, config) {
    var schemaProps = definition.api.props;
    var rows = variant.parameterKeys.map(function (name) {
      var schema = schemaProps[name];
      var current = Object.prototype.hasOwnProperty.call(variant.props, name) ? variant.props[name] : schema.default;
      var descriptionText = typeof config.parameterAnnotation === "function" ? config.parameterAnnotation(name, current, variant.props, schema) : config.parameterDescriptions && config.parameterDescriptions[name] || schema.description || "";
      var description = config.showParameterDescriptions === true && descriptionText ? '<small class="component-api-docs-param-description">' + escapeHtml(descriptionText) + '</small>' : '';
      return '<tr><th><code>' + escapeHtml(name) + '</code></th><td><code>' + escapeHtml(valueLabel(current)) + '</code></td><td>' + escapeHtml(schema.type) + '</td><td>' + escapeHtml(allowedLabel(schema)) + description + '</td></tr>';
    }).join("");
    return '<div class="component-api-docs-table-wrap"><table><thead><tr><th>参数</th><th>当前值</th><th>类型</th><th>合法值 / 字段' + (config.showParameterDescriptions === true ? ' · 中文说明' : '') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") return navigator.clipboard.writeText(text);
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = document.execCommand("copy");
    field.remove();
    return copied ? Promise.resolve() : Promise.reject(new Error("copy command was rejected"));
  }

  function assertScenario(config, schemaProps, scenario) {
    Object.keys(scenario.props).forEach(function (name) {
      if (!schemaProps[name]) throw new Error(config.id + " docs uses undeclared prop: " + name);
    });
    scenario.parameterKeys.forEach(function (name) {
      if (!schemaProps[name]) throw new Error(config.id + " docs lists undeclared parameter: " + name);
    });
  }

  function assertConfig(config, definition) {
    var schemaProps = definition.api.props;
    var declared = schemaProps.variant && schemaProps.variant.values ? schemaProps.variant.values.slice() : [];
    var usesControlGroups = Array.isArray(config.controlGroups) && config.controlGroups.length > 0;
    if (usesControlGroups) {
      if (typeof config.resolveSelection !== "function") throw new Error(config.id + " controlGroups requires resolveSelection()");
      var groupKeys = config.controlGroups.map(function (group) { return group.key; });
      if (new Set(groupKeys).size !== groupKeys.length) throw new Error(config.id + " docs control group keys must be unique");
      config.controlGroups.forEach(function (group) {
        if (!group.options || !group.options.length) throw new Error(config.id + " docs control group is empty: " + group.key);
        var values = group.options.map(function (option) { return option.value; });
        if (new Set(values).size !== values.length) throw new Error(config.id + " docs control values must be unique: " + group.key);
        group.options.forEach(function (option) {
          (option.api || []).forEach(function (item) {
            if (!schemaProps[item.name]) throw new Error(config.id + " docs option uses undeclared prop: " + item.name);
            var schema = schemaProps[item.name];
            if (schema.values && schema.values.indexOf(item.value) < 0) throw new Error(config.id + " docs option uses illegal " + item.name + ": " + item.value);
          });
        });
      });
      var coverage = (config.variantCoverage || []).slice();
      if (declared.length !== coverage.length || declared.some(function (name) { return coverage.indexOf(name) < 0; })) {
        throw new Error(config.id + " docs variantCoverage does not match describe().api.props.variant.values");
      }
      assertScenario(config, schemaProps, resolveControlScenario(config, initialSelection(config)));
      return;
    }
    var configured = config.variants.map(function (item) { return item.props.variant; });
    if (declared.length !== configured.length || declared.some(function (name) { return configured.indexOf(name) < 0; })) {
      throw new Error(config.id + " docs variants do not match describe().api.props.variant.values");
    }
    config.variants.forEach(function (item) { assertScenario(config, schemaProps, item); });
  }

  function destroy(root) {
    var state = root && root._componentApiDocsState;
    if (!state) return;
    state.revision += 1;
    if (state.onDocumentPointerDown) document.removeEventListener("pointerdown", state.onDocumentPointerDown, true);
    if (state.instance && !state.instance.destroyed) state.instance.destroy();
    state.instance = null;
  }

  function mount(config, root) {
    if (!root) return Promise.reject(new Error(config.id + " docs root is required"));
    destroy(root);
    var usesControlGroups = Array.isArray(config.controlGroups) && config.controlGroups.length > 0;
    var state = { revision: 0, instance: null, definition: null, active: null, counts: Object.create(null), selection: usesControlGroups ? initialSelection(config) : null, preserveControlledOpen: false, onDocumentPointerDown: null };
    root._componentApiDocsState = state;
    var host = root.querySelector("[data-component-docs-mount]");
    var eventOutput = root.querySelector("[data-component-docs-event]");
    state.onDocumentPointerDown = function (event) {
      var action = event.target.closest && event.target.closest("button[data-component-docs-code-toggle], button[data-component-docs-copy], button[data-component-docs-params-toggle]");
      state.preserveControlledOpen = Boolean(action && root.contains(action));
    };
    document.addEventListener("pointerdown", state.onDocumentPointerDown, true);

    function setError(error) {
      host.setAttribute("aria-busy", "false");
      host.dataset.componentDocsValidation = "error";
      host.dataset.componentDocsErrors = error.message;
      eventOutput.textContent = "渲染失败：" + error.message;
      root.dataset.componentDocsReady = "false";
    }

    function syncControlGroups() {
      if (!usesControlGroups) return;
      config.controlGroups.forEach(function (group) {
        var row = root.querySelector('[data-component-docs-control-row="' + group.key + '"]');
        if (row) row.hidden = !controlGroupVisible(group, state.selection);
      });
      root.querySelectorAll("button[data-component-docs-control]").forEach(function (button) {
        var groupKey = button.dataset.componentDocsControl;
        var value = button.dataset.componentDocsValue;
        var active = state.selection[groupKey] === value;
        var nextSelection = Object.assign({}, state.selection);
        nextSelection[groupKey] = value;
        nextSelection = normalizeControlSelection(config, nextSelection, groupKey);
        var group = config.controlGroups.find(function (item) { return item.key === groupKey; });
        var allowed = !(group && group.statusOnly) && (typeof config.isSelectionAllowed !== "function" || config.isSelectionAllowed(nextSelection));
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
        button.disabled = !allowed;
        if (!allowed && typeof config.invalidSelectionReason === "function") button.title = config.invalidSelectionReason(nextSelection) || "该组合不可用";
        else button.removeAttribute("title");
      });
    }

    function updatePresentation(variant) {
      state.active = variant;
      if (usesControlGroups) syncControlGroups();
      root.querySelector("[data-component-docs-category]").textContent = variant.category;
      root.querySelector("[data-component-docs-title]").textContent = variant.label;
      root.querySelector("[data-component-docs-description]").textContent = variant.description;
      root.querySelector("[data-component-docs-interaction]").textContent = variant.interaction;
      root.querySelector("[data-component-docs-code]").textContent = buildCode(config, variant.props);
      root.querySelector("[data-component-docs-params-title]").textContent = variant.label + " 参数";
      root.querySelector("[data-component-docs-params]").innerHTML = paramsMarkup(state.definition, variant, config);
    }

    function renderScenario(variant, key) {
      try { assertScenario(config, state.definition.api.props, variant); }
      catch (error) { return Promise.reject(error); }
      state.revision += 1;
      var revision = state.revision;
      if (state.instance && !state.instance.destroyed) state.instance.destroy();
      state.instance = null;
      state.counts = Object.create(null);
      host.replaceChildren();
      host.setAttribute("aria-busy", "true");
      host.dataset.componentDocsVariant = variant.props.variant || "";
      delete host.dataset.componentDocsErrors;
      if (!usesControlGroups) root.querySelectorAll(".component-api-docs-variants button[data-component-docs-variant]").forEach(function (button) {
          var active = button.dataset.componentDocsVariant === key;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
      updatePresentation(variant);
      eventOutput.textContent = "等待真实 b2b:* 事件";
      eventOutput.dataset.counts = "{}";
      return global.B2B.renderComponent({ component: config.id, props: Object.assign({}, variant.props) }, host).then(function (result) {
        if (revision !== state.revision) {
          if (!result.instance.destroyed) result.instance.destroy();
          return result;
        }
        state.instance = result.instance;
        host.setAttribute("aria-busy", "false");
        host.dataset.componentDocsValidation = result.audit.valid ? "valid" : "invalid";
        host.dataset.componentDocsRenderer = result.name;
        root.dataset.componentDocsReady = String(result.audit.valid);
        return result;
      }).catch(function (error) {
        if (revision === state.revision) setError(error);
        throw error;
      });
    }

    function renderVariant(key) {
      var variant = config.variants.find(function (item) { return item.key === key; });
      if (!variant) return Promise.reject(new Error(config.id + " unknown docs variant: " + key));
      return renderScenario(variant, key);
    }

    function restoreControlledPreview() {
      if (!state.active || !state.active.props || state.active.props.open !== true && state.active.props.expanded !== true) return;
      if (usesControlGroups) renderScenario(resolveControlScenario(config, state.selection)).catch(function () {});
      else renderVariant(state.active.key).catch(function () {});
    }

    config.events.forEach(function (name) {
      host.addEventListener(name, function (event) {
        if (usesControlGroups && typeof config.syncSelectionFromEvent === "function") {
          var synchronized = config.syncSelectionFromEvent(name, event, Object.assign({}, state.selection), { preserveControlledOpen: state.preserveControlledOpen });
          if (synchronized) {
            state.selection = synchronized;
            updatePresentation(resolveControlScenario(config, state.selection));
          }
        }
        state.counts[name] = (state.counts[name] || 0) + 1;
        eventOutput.dataset.counts = JSON.stringify(state.counts);
        eventOutput.textContent = name + " × " + state.counts[name] + " · " + JSON.stringify(event.detail || {});
      });
    });
    root.addEventListener("click", function (event) {
      var variantButton = event.target.closest(".component-api-docs-variants button[data-component-docs-variant]");
      if (variantButton && root.contains(variantButton)) {
        event.stopPropagation();
        renderVariant(variantButton.dataset.componentDocsVariant).catch(function () {});
        return;
      }
      var controlButton = event.target.closest("button[data-component-docs-control]");
      if (controlButton && root.contains(controlButton)) {
        event.stopPropagation();
        if (controlButton.disabled) return;
        var nextSelection = Object.assign({}, state.selection);
        nextSelection[controlButton.dataset.componentDocsControl] = controlButton.dataset.componentDocsValue;
        nextSelection = normalizeControlSelection(config, nextSelection, controlButton.dataset.componentDocsControl);
        if (typeof config.isSelectionAllowed === "function" && !config.isSelectionAllowed(nextSelection)) return;
        state.selection = nextSelection;
        renderScenario(resolveControlScenario(config, state.selection)).catch(function () {});
        return;
      }
      var codeToggle = event.target.closest("button[data-component-docs-code-toggle]");
      if (codeToggle && root.contains(codeToggle)) {
        event.stopPropagation();
        var codePanel = root.querySelector(".component-api-docs-ai");
        codePanel.hidden = !codePanel.hidden;
        codeToggle.setAttribute("aria-expanded", String(!codePanel.hidden));
        codeToggle.textContent = codePanel.hidden ? "展开代码" : "收起代码";
        restoreControlledPreview();
        state.preserveControlledOpen = false;
        return;
      }
      var paramsToggle = event.target.closest("button[data-component-docs-params-toggle]");
      if (paramsToggle && root.contains(paramsToggle)) {
        event.stopPropagation();
        var paramsPanel = root.querySelector(".component-api-docs-params");
        paramsPanel.hidden = !paramsPanel.hidden;
        paramsToggle.setAttribute("aria-expanded", String(!paramsPanel.hidden));
        paramsToggle.textContent = paramsPanel.hidden ? "展开参数" : "收起参数";
        restoreControlledPreview();
        state.preserveControlledOpen = false;
        return;
      }
      var copyButton = event.target.closest("button[data-component-docs-copy]");
      if (!copyButton || !root.contains(copyButton)) return;
      event.stopPropagation();
      var source = root.querySelector("[data-component-docs-code]").textContent;
      restoreControlledPreview();
      state.preserveControlledOpen = false;
      copyText(source).then(function () {
        copyButton.textContent = "已复制";
        copyButton.dataset.copyState = "success";
        global.setTimeout(function () { copyButton.textContent = "复制代码"; delete copyButton.dataset.copyState; }, 1600);
      }).catch(function () {
        copyButton.textContent = "复制失败";
        copyButton.dataset.copyState = "error";
      });
    });

    return ensureRuntime(config.id).then(function () {
      return global.B2B.describeComponent(config.id);
    }).then(function (definition) {
      state.definition = definition;
      assertConfig(config, definition);
      if (usesControlGroups) {
        root.dataset.componentDocsControls = config.controlGroups.length + " groups";
        root.dataset.componentDocsVariants = config.variantCoverage.length + "/" + definition.api.props.variant.values.length;
        syncControlGroups();
        return renderScenario(resolveControlScenario(config, state.selection));
      }
      root.dataset.componentDocsVariants = config.variants.length + "/" + definition.api.props.variant.values.length;
      return renderVariant(config.variants[0].key);
    }).catch(function (error) {
      setError(error);
      return [];
    });
  }

  D.componentApiDocs = Object.freeze({
    escapeHtml: escapeHtml,
    markup: markup,
    buildCode: buildCode,
    mount: mount,
    destroy: destroy
  });
})(window);
