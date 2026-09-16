(function registerInputRenderer(global) {
  "use strict";

  var runtime = global.B2B && global.B2B.components && global.B2B.components.runtime;
  if (!runtime) throw new Error("C-21 renderer requires components/runtime/core.js");

  var variants = ["基础输入框", "数字输入框", "带图标输入框", "带属性输入框", "组合输入框", "长文本输入框"];
  var sizes = ["mini", "small", "medium", "large", "xlarge"];
  var states = ["default", "disabled", "readonly", "error"];
  var tooltipPositions = ["top-left", "top", "top-right", "right-top", "right", "right-bottom", "bottom-right", "bottom", "bottom-left", "left-bottom", "left", "left-top"];
  var selectorByVariant = {
    "基础输入框": "[data-source-input]",
    "数字输入框": "[data-number-input]",
    "带图标输入框": "[data-source-input]",
    "带属性输入框": "[data-affix-input]",
    "组合输入框": "[data-combination-input]",
    "长文本输入框": ".source-textarea"
  };

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function exactKeys(object, keys, label) {
    runtime.assert(object && Object.prototype.toString.call(object) === "[object Object]", "C-21 " + label + " must be an object");
    var unknown = Object.keys(object).filter(function (key) { return keys.indexOf(key) < 0; });
    runtime.assert(!unknown.length, "C-21 " + label + " received undeclared fields: " + unknown.join(", "));
  }

  function nonEmptyString(value, label) {
    runtime.assert(typeof value === "string" && value.trim(), "C-21 " + label + " must be a non-empty string");
  }

  function assertTooltip(tooltip) {
    if (tooltip === null) return;
    exactKeys(tooltip, ["text", "position"], "infoTooltip");
    nonEmptyString(tooltip.text, "infoTooltip.text");
    runtime.assertEnum(tooltip.position, tooltipPositions, "C-21 infoTooltip.position");
  }

  function assertAddon(addon, position) {
    if (addon === null) return;
    exactKeys(addon, addon.type === "select" ? ["id", "type", "value", "options", "ariaLabel"] : ["id", "type", "text"], position + "Addon");
    nonEmptyString(addon.id, position + "Addon.id");
    runtime.assertEnum(addon.type, ["text", "select"], "C-21 " + position + "Addon.type");
    if (addon.type === "text") {
      nonEmptyString(addon.text, position + "Addon.text");
      return;
    }
    nonEmptyString(addon.value, position + "Addon.value");
    nonEmptyString(addon.ariaLabel, position + "Addon.ariaLabel");
    runtime.assert(Array.isArray(addon.options) && addon.options.length > 0, "C-21 " + position + "Addon.options must be a non-empty array");
    addon.options.forEach(function (option, index) {
      exactKeys(option, ["value", "label"], position + "Addon.options[" + index + "]");
      nonEmptyString(option.value, position + "Addon.options[" + index + "].value");
      nonEmptyString(option.label, position + "Addon.options[" + index + "].label");
    });
    var values = addon.options.map(function (option) { return option.value; });
    runtime.assert(new Set(values).size === values.length, "C-21 " + position + "Addon option values must be unique");
    runtime.assert(values.indexOf(addon.value) >= 0, "C-21 " + position + "Addon.value must match an option");
  }

  function assertCompositeSelect(select) {
    if (select === null || select === undefined) return;
    exactKeys(select, ["id", "value", "options", "ariaLabel"], "composite.select");
    nonEmptyString(select.id, "composite.select.id");
    nonEmptyString(select.value, "composite.select.value");
    nonEmptyString(select.ariaLabel, "composite.select.ariaLabel");
    runtime.assert(Array.isArray(select.options) && select.options.length > 0, "C-21 composite.select.options must be a non-empty array");
    select.options.forEach(function (option, index) {
      exactKeys(option, ["value", "label"], "composite.select.options[" + index + "]");
      nonEmptyString(option.value, "composite.select.options[" + index + "].value");
      nonEmptyString(option.label, "composite.select.options[" + index + "].label");
    });
    var values = select.options.map(function (option) { return option.value; });
    runtime.assert(new Set(values).size === values.length, "C-21 composite.select option values must be unique");
    runtime.assert(values.indexOf(select.value) >= 0, "C-21 composite.select.value must match an option");
  }

  function assertComposite(composite) {
    if (composite === null) return;
    exactKeys(composite, ["appearance", "segments", "select"], "composite");
    runtime.assertEnum(composite.appearance, ["filled", "borderless"], "C-21 composite.appearance");
    assertCompositeSelect(composite.select);
    var expectedSegments = composite.select ? 1 : 2;
    runtime.assert(Array.isArray(composite.segments) && composite.segments.length === expectedSegments, "C-21 composite.segments must contain exactly " + expectedSegments + " segment" + (expectedSegments === 1 ? "" : "s"));
    runtime.assert(!composite.select || composite.appearance === "filled", "C-21 composite select-input supports filled appearance only");
    composite.segments.forEach(function (segment, index) {
      exactKeys(segment, ["id", "label", "value", "placeholder"], "composite.segments[" + index + "]");
      nonEmptyString(segment.id, "composite.segments[" + index + "].id");
      nonEmptyString(segment.label, "composite.segments[" + index + "].label");
      runtime.assert(typeof segment.value === "string", "C-21 composite segment value must be a string");
      runtime.assert(typeof segment.placeholder === "string", "C-21 composite segment placeholder must be a string");
    });
    runtime.assert(new Set(composite.segments.map(function (segment) { return segment.id; })).size === composite.segments.length, "C-21 composite segment ids must be unique");
  }

  function isLocked(props) {
    return props.state === "disabled" || props.state === "readonly";
  }

  function sourceRoot(root, props) {
    var selector = props.variant === "带属性输入框" && props.tag !== null ? "[data-source-input]" : selectorByVariant[props.variant];
    return root.matches(selector) ? root : root.querySelector(selector);
  }

  function nativeFields(root) {
    return Array.from(root.querySelectorAll("input,textarea"));
  }

  function neutralConfiguration(props, label, allowCounter) {
    runtime.assert(!props.clearable && (allowCounter || !props.counter) && !props.borderless && !props.password, "C-21 " + label + " does not support basic-input behavior props");
    runtime.assert(props.prefixIcon === null && props.suffixIcon === null && props.infoTooltip === null, "C-21 " + label + " does not support icon props");
    runtime.assert(props.prefixAddon === null && props.suffixAddon === null, "C-21 " + label + " does not support addon props");
    runtime.assert(props.composite === null, "C-21 " + label + " does not support composite props");
    runtime.assert(props.tag === null, "C-21 " + label + " does not support tag");
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-21 variant");
    runtime.assertEnum(props.size, sizes, "C-21 size");
    runtime.assertEnum(props.state, states, "C-21 state");
    nonEmptyString(props.label, "label");
    runtime.assert(typeof props.placeholder === "string", "C-21 placeholder must be a string");
    runtime.assert(typeof props.value === "string" || typeof props.value === "number" && Number.isFinite(props.value), "C-21 value must be a string or finite number");
    runtime.assert(Number.isInteger(props.maxLength) && props.maxLength > 0, "C-21 maxLength must be a positive integer");
    runtime.assert(Number.isFinite(props.min) && Number.isFinite(props.max) && props.min < props.max, "C-21 min must be lower than max");
    runtime.assert(Number.isFinite(props.step) && props.step > 0, "C-21 step must be greater than zero");
    assertTooltip(props.infoTooltip);
    assertAddon(props.prefixAddon, "prefix");
    assertAddon(props.suffixAddon, "suffix");
    assertComposite(props.composite);
    if (props.tag !== null) nonEmptyString(props.tag, "tag");
    if (props.prefixAddon && props.suffixAddon) runtime.assert(props.prefixAddon.id !== props.suffixAddon.id, "C-21 addon ids must be unique");

    if (props.variant === "基础输入框") {
      runtime.assert(typeof props.value === "string", "C-21 基础输入框 value must be a string");
      runtime.assert(props.prefixIcon === null && props.suffixIcon === null && props.infoTooltip === null, "C-21 基础输入框 does not accept icon props; use 带图标输入框");
      runtime.assert(props.prefixAddon === null && props.suffixAddon === null && props.composite === null, "C-21 基础输入框 received another variant's configuration");
      runtime.assert(props.tag === null, "C-21 基础输入框 does not accept tag; use 带属性输入框");
      runtime.assert(!props.password || !props.borderless && !props.counter && !props.clearable, "C-21 password cannot be combined with borderless, counter, or clearable");
      runtime.assert(!props.password || !isLocked(props), "C-21 password toggle is unavailable in disabled/readonly states");
      return;
    }

    if (props.variant === "带图标输入框") {
      runtime.assert(typeof props.value === "string", "C-21 带图标输入框 value must be a string");
      runtime.assert(Boolean(props.prefixIcon || props.suffixIcon || props.infoTooltip), "C-21 带图标输入框 requires an icon or infoTooltip");
      runtime.assert(!props.counter && !props.borderless && !props.password, "C-21 带图标输入框 supports icons, infoTooltip, and clearable only");
      runtime.assert(props.prefixAddon === null && props.suffixAddon === null && props.composite === null, "C-21 带图标输入框 received another variant's configuration");
      runtime.assert(props.tag === null, "C-21 带图标输入框 does not accept tag; use 带属性输入框");
      runtime.assert(!props.infoTooltip || !isLocked(props), "C-21 infoTooltip requires an editable state");
      return;
    }

    if (props.variant === "数字输入框") {
      neutralConfiguration(props, props.variant);
      runtime.assert(props.value === "" || typeof props.value === "number" && props.value >= props.min && props.value <= props.max, "C-21 数字输入框 value must be empty or within min/max");
      return;
    }
    if (props.variant === "带属性输入框") {
      runtime.assert(typeof props.value === "string", "C-21 带属性输入框 value must be a string");
      runtime.assert(!props.clearable && !props.counter && !props.borderless && !props.password && props.prefixIcon === null && props.suffixIcon === null && props.infoTooltip === null && props.composite === null, "C-21 带属性输入框 accepts addon or tag configuration only");
      runtime.assert(Boolean(props.prefixAddon || props.suffixAddon) !== Boolean(props.tag), "C-21 带属性输入框 requires either addon configuration or tag, but not both");
      return;
    }
    if (props.variant === "组合输入框") {
      runtime.assert(props.value === "", "C-21 组合输入框 uses composite.segments instead of value");
      runtime.assert(!props.clearable && !props.counter && !props.borderless && !props.password && props.prefixIcon === null && props.suffixIcon === null && props.infoTooltip === null && props.prefixAddon === null && props.suffixAddon === null && props.tag === null, "C-21 组合输入框 accepts composite configuration only");
      runtime.assert(props.composite !== null, "C-21 组合输入框 requires composite");
      return;
    }
    neutralConfiguration(props, props.variant, true);
    runtime.assert(typeof props.value === "string", "C-21 长文本输入框 value must be a string");
    runtime.assert(props.size === "medium", "C-21 长文本输入框 uses the canonical 92px textarea and supports medium size only");
    runtime.assert(props.maxLength === 240, "C-21 长文本输入框 canonical maxLength is fixed at 240");
  }

  function renderCanonical(props, H) {
    if (props.variant === "数字输入框") return H.numberInputSpec(props);
    if (props.variant === "带属性输入框") {
      if (props.tag !== null) return H.inputSpec({ size: props.size, state: props.state, value: props.value, placeholder: props.placeholder, tag: props.tag });
      return H.affixInputSpec(props);
    }
    if (props.variant === "组合输入框") {
      if (props.composite.select) return H.combinationSelectSpec({ size: props.size, state: props.state, selected: props.composite.select.value, items: props.composite.select.options, selectAriaLabel: props.composite.select.ariaLabel, segment: props.composite.segments[0] });
      return H.combinationInputSpec({ size: props.size, state: props.state, appearance: props.composite.appearance, segments: props.composite.segments });
    }
    if (props.variant === "长文本输入框") return H.textareaSpec({ state: props.state, value: props.value, placeholder: props.placeholder, auto: props.auto, counter: props.counter });
    return H.inputSpec({
      state: props.state,
      size: props.size,
      value: props.value,
      placeholder: props.placeholder,
      prefix: props.variant === "带图标输入框" ? props.prefixIcon : null,
      suffix: props.variant === "带图标输入框" ? props.suffixIcon : null,
      infoTooltip: props.variant === "带图标输入框" ? props.infoTooltip : null,
      clear: props.clearable,
      counter: props.counter,
      maxLength: props.maxLength,
      borderless: props.borderless,
      password: props.password
    });
  }

  function applyProductionSemantics(root, props) {
    var canonical = sourceRoot(root, props);
    var fields = nativeFields(canonical);
    canonical.dataset.variant = props.variant;
    canonical.dataset.size = props.size;
    canonical.dataset.state = props.state;
    if (props.variant === "组合输入框") {
      canonical.setAttribute("role", "group");
      canonical.setAttribute("aria-label", props.label);
    }
    fields.forEach(function (field, index) {
      if (props.variant === "组合输入框") {
        var segment = props.composite.segments[index];
        field.setAttribute("aria-label", segment.label);
      } else field.setAttribute("aria-label", props.label);
    });
    var error = root.querySelector(".input-error");
    if (error) {
      error.id = runtime.uid("c21-input-error");
      fields.forEach(function (field) {
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", error.id);
      });
    }
    return canonical;
  }

  function numericValue(value) {
    if (value === "") return "";
    var number = Number(value);
    return Number.isFinite(number) ? number : value;
  }

  function inputEventDetail(canonical, props, target) {
    if (props.variant === "组合输入框") {
      var fields = nativeFields(canonical);
      var index = fields.indexOf(target);
      var segments = fields.map(function (field, segmentIndex) {
        return { id: props.composite.segments[segmentIndex].id, value: field.value };
      });
      return { variant: props.variant, state: props.state, value: target.value, segment: { id: segments[index].id, index: index }, values: segments };
    }
    var field = nativeFields(canonical)[0];
    return { variant: props.variant, state: props.state, value: props.variant === "数字输入框" ? numericValue(field ? field.value : "") : (field ? field.value : "") };
  }

  function addonState(segment, props) {
    var selected = segment.querySelector("[data-select-option][aria-selected='true']");
    var compositeSelect = props.variant === "组合输入框" && props.composite && props.composite.select;
    return {
      id: segment.dataset.addonId || compositeSelect && compositeSelect.id,
      position: segment.dataset.addonPosition || (compositeSelect ? "composite-prefix" : ""),
      value: selected ? selected.dataset.value : "",
      label: selected ? selected.dataset.label : "",
      open: segment.classList.contains("is-open")
    };
  }

  function bindProductionBridge(root, props) {
    var canonical = applyProductionSemantics(root, props);
    var scheduledInputs = new WeakSet();
    function onInput(event) {
      if (!event.target.matches("input,textarea") || !canonical.contains(event.target)) return;
      var target = event.target;
      if (scheduledInputs.has(target)) return;
      scheduledInputs.add(target);
      global.queueMicrotask(function () {
        scheduledInputs.delete(target);
        runtime.emit(root, "b2b:input-change", inputEventDetail(canonical, props, target));
      });
    }
    function onClick(event) {
      var clear = event.target.closest("[data-input-clear]");
      if (clear && canonical.contains(clear)) global.queueMicrotask(function () {
        runtime.emit(root, "b2b:input-clear", inputEventDetail(canonical, props, canonical.querySelector("input")));
      });
      var password = event.target.closest("[data-password-toggle]");
      if (password && canonical.contains(password)) global.queueMicrotask(function () {
        runtime.emit(root, "b2b:input-password-toggle", Object.assign(inputEventDetail(canonical, props, canonical.querySelector("input")), { visible: canonical.querySelector("input").type === "text" }));
      });
    }
    root.addEventListener("input", onInput);
    root.addEventListener("click", onClick);

    var observers = [];
    var addonSegments = Array.from(canonical.querySelectorAll("[data-input-addon][data-select-demo], .combination-select-segment[data-select-demo]"));
    if (addonSegments.length) {
      var previousAddons = new Map(addonSegments.map(function (segment) { return [segment, addonState(segment, props)]; }));
      var addonScheduled = false;
      function flushAddons() {
        addonScheduled = false;
        addonSegments.forEach(function (segment) {
          var previous = previousAddons.get(segment);
          var next = addonState(segment, props);
          var base = { variant: props.variant, state: props.state, value: canonical.querySelector("input").value, addon: next };
          if (next.value !== previous.value) runtime.emit(root, "b2b:input-addon-change", base);
          if (next.open !== previous.open) runtime.emit(root, next.open ? "b2b:input-addon-open" : "b2b:input-addon-close", base);
          previousAddons.set(segment, next);
        });
      }
      var addonObserver = new MutationObserver(function () {
        if (addonScheduled) return;
        addonScheduled = true;
        global.queueMicrotask(flushAddons);
      });
      addonSegments.forEach(function (segment) { addonObserver.observe(segment, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-expanded", "aria-hidden"] }); });
      observers.push(addonObserver);
    }

    var tooltipRoot = canonical.querySelector("[data-source-tooltip]");
    var tooltipSurface = tooltipRoot && (tooltipRoot.querySelector(":scope > [data-source-tooltip-surface]") || document.getElementById(tooltipRoot.dataset.tooltipSurfaceId || ""));
    if (tooltipRoot) {
      var tooltipOpen = tooltipRoot.classList.contains("is-open");
      var tooltipScheduled = false;
      var tooltipObserver = new MutationObserver(function () {
        if (tooltipScheduled) return;
        tooltipScheduled = true;
        global.queueMicrotask(function () {
          tooltipScheduled = false;
          var nextOpen = tooltipRoot.classList.contains("is-open");
          if (nextOpen !== tooltipOpen) runtime.emit(root, nextOpen ? "b2b:input-tooltip-open" : "b2b:input-tooltip-close", { variant: props.variant, state: props.state, value: canonical.querySelector("input").value, tooltip: { text: props.infoTooltip.text, position: props.infoTooltip.position, placement: tooltipRoot.dataset.tooltipPlacement, open: nextOpen } });
          tooltipOpen = nextOpen;
        });
      });
      tooltipObserver.observe(tooltipRoot, { attributes: true, attributeFilter: ["class", "data-tooltip-placement"] });
      observers.push(tooltipObserver);
    }

    return function cleanup() {
      root.removeEventListener("input", onInput);
      root.removeEventListener("click", onClick);
      observers.forEach(function (observer) { observer.disconnect(); });
      if (tooltipRoot) {
        global.clearTimeout(tooltipRoot._b2bTooltipOpenTimer);
        global.clearTimeout(tooltipRoot._b2bTooltipCloseTimer);
      }
      if (tooltipSurface && tooltipSurface.parentElement === document.body) tooltipSurface.remove();
    };
  }

  global.B2B.components.canonicalAdapter.define({
    id: "C-21",
    name: "input",
    styles: ["C-21-input/styles.css", "C-23-select/styles.css", "C-44-tooltip/styles.css"],
    rawProps: true,
    defaults: {
      variant: "基础输入框",
      size: "medium",
      state: "default",
      label: "输入内容",
      value: "",
      placeholder: "Please enter text",
      clearable: false,
      counter: false,
      maxLength: 20,
      borderless: false,
      password: false,
      prefixIcon: null,
      suffixIcon: null,
      infoTooltip: null,
      min: 0,
      max: 10,
      step: 1,
      prefixAddon: null,
      suffixAddon: null,
      tag: null,
      composite: null,
      auto: false
    },
    render: function render(props, H) {
      assertProps(props);
      return renderCanonical(props, H);
    },
    bind: bindProductionBridge,
    update: function update() {
      runtime.assert(false, "C-21 input does not support update(); destroy and recreate the instance");
    },
    validate: function validate(root, props) {
      var errors = [];
      var canonical = sourceRoot(root, props);
      if (!canonical) return ["C-21 canonical root anatomy is missing"];
      var fields = nativeFields(canonical);
      var expectedCount = props.variant === "组合输入框" ? props.composite.segments.length : 1;
      var expectedSelector = props.variant === "带属性输入框" && props.tag !== null ? "[data-source-input]" : selectorByVariant[props.variant];
      if (!canonical.matches(expectedSelector)) errors.push("C-21 canonical root does not match variant");
      if (fields.length !== expectedCount) errors.push("C-21 native field count mismatch");
      if (fields.some(function (field) { return !field.getAttribute("aria-label"); })) errors.push("C-21 native field lacks accessible name");
      if (props.state === "disabled" && fields.some(function (field) { return !field.disabled; })) errors.push("C-21 disabled semantics mismatch");
      if (props.state === "readonly" && fields.some(function (field) { return !field.readOnly; })) errors.push("C-21 readonly semantics mismatch");
      if (props.state === "error" && fields.some(function (field) { return field.getAttribute("aria-invalid") !== "true" || !field.getAttribute("aria-describedby"); })) errors.push("C-21 error semantics mismatch");
      if (props.variant !== "长文本输入框" && !canonical.classList.contains("is-size-" + props.size)) errors.push("C-21 size class mismatch");
      if (props.clearable && !isLocked(props) && !canonical.querySelector("[data-input-clear]")) errors.push("C-21 clearable anatomy is missing");
      if (props.password && !canonical.querySelector("[data-password-toggle]")) errors.push("C-21 password action is missing");
      if (props.counter && props.variant === "基础输入框" && (!canonical.matches(".has-counter") || !canonical.querySelector("[data-input-count]") || !canonical.querySelector("[data-input-text-count]"))) errors.push("C-21 basic counter anatomy is incomplete");
      if (props.counter && props.variant === "长文本输入框" && (!canonical.matches(".has-counter") || !canonical.querySelector("[data-text-count]"))) errors.push("C-21 textarea counter anatomy is incomplete");
      if (props.variant === "带属性输入框") {
        if (props.tag !== null && (!canonical.matches("[data-source-input]") || !canonical.querySelector(".input-inline-tag") || canonical.querySelector(".input-inline-tag").textContent !== props.tag)) errors.push("C-21 inline tag anatomy mismatch");
        var addons = Array.from(canonical.querySelectorAll("[data-input-addon]"));
        var expectedAddons = [props.prefixAddon, props.suffixAddon].filter(Boolean);
        if (addons.length !== expectedAddons.length) errors.push("C-21 addon anatomy count mismatch");
        expectedAddons.forEach(function (addon) {
          var node = addons.find(function (candidate) { return candidate.dataset.addonId === addon.id; });
          if (!node) errors.push("C-21 addon identity is missing: " + addon.id);
          if (addon.type === "select" && node && !node.matches("[data-select-demo]")) errors.push("C-21 selectable addon must preserve canonical select anatomy");
        });
      }
      if (props.variant === "组合输入框") {
        var parts = Array.from(canonical.querySelectorAll("[data-combination-part]"));
        if (parts.some(function (part, index) { return part.dataset.segmentId !== props.composite.segments[index].id; })) errors.push("C-21 composite segment identity mismatch");
        if (!canonical.classList.contains("is-appearance-" + props.composite.appearance)) errors.push("C-21 composite appearance mismatch");
        if (props.composite.select) {
          var selectRoot = canonical.querySelector(".combination-select-segment[data-select-demo]");
          var selectedOption = selectRoot && selectRoot.querySelector("[data-select-option][aria-selected='true']");
          if (!canonical.classList.contains("source-combination-select") || !selectRoot || !selectedOption || selectedOption.dataset.value !== props.composite.select.value) errors.push("C-21 composite select-input anatomy mismatch");
        }
      }
      if (props.infoTooltip) {
        var tooltip = canonical.querySelector("[data-source-tooltip]");
        var surface = tooltip && document.getElementById(tooltip.dataset.tooltipSurfaceId || "");
        var trigger = tooltip && tooltip.querySelector(".input-info-trigger");
        if (!tooltip || !surface || surface.parentElement !== document.body || !trigger) errors.push("C-21 information tooltip canonical composition is incomplete");
        if (surface && trigger && trigger.getAttribute("aria-describedby") !== surface.id) errors.push("C-21 information tooltip ARIA ownership mismatch");
      }
      if (props.variant === "长文本输入框" && props.auto !== canonical.classList.contains("is-auto")) errors.push("C-21 textarea auto-height class mismatch");
      return errors;
    }
  });
})(window);
