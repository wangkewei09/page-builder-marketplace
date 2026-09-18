(function registerCheckboxRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  if (!runtime) throw new Error("C-11 renderer requires components/runtime/core.js");

  var variants = ["group", "standalone", "with-description", "indeterminate"];
  var orientations = ["vertical", "horizontal"];
  var itemKeys = ["value", "label", "checked", "mixed", "disabled", "error", "errorMessage"];

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function assertBoolean(value, label) {
    runtime.assert(typeof value === "boolean", label + " must be boolean");
  }

  function assertError(error, message, label) {
    assertBoolean(error, label + " error");
    runtime.assert(message === null || typeof message === "string", label + " errorMessage must be string or null");
    if (error) runtime.assert(typeof message === "string" && message.trim(), label + " error requires a non-empty errorMessage");
    else runtime.assert(message === null, label + " errorMessage requires error=true");
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-11 variant");
    runtime.assertEnum(props.orientation, orientations, "C-11 orientation");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-11 label cannot be empty");
    runtime.assert(typeof props.value === "string" && props.value.trim(), "C-11 value cannot be empty");
    runtime.assert(props.description === null || typeof props.description === "string", "C-11 description must be string or null");
    runtime.assert(typeof props.selectAllLabel === "string" && props.selectAllLabel.trim(), "C-11 selectAllLabel cannot be empty");
    runtime.assert(Array.isArray(props.items), "C-11 items must be an array");
    assertBoolean(props.checked, "C-11 checked");
    assertBoolean(props.mixed, "C-11 mixed");
    assertBoolean(props.disabled, "C-11 disabled");
    assertError(props.error, props.errorMessage, "C-11");
    assertBoolean(props.compact, "C-11 compact");
    runtime.assert(!(props.checked && props.mixed), "C-11 checked and mixed cannot both be true");

    props.items.forEach(function (item, index) {
      runtime.assert(item && typeof item === "object" && !Array.isArray(item), "C-11 item " + index + " must be an object");
      var unknown = Object.keys(item).filter(function (key) { return itemKeys.indexOf(key) < 0; });
      runtime.assert(!unknown.length, "C-11 item " + index + " received unsupported fields: " + unknown.join(", "));
      runtime.assert(typeof item.value === "string" && item.value.trim(), "C-11 item " + index + " value cannot be empty");
      runtime.assert(typeof item.label === "string" && item.label.trim(), "C-11 item " + index + " label cannot be empty");
      if (hasOwn(item, "checked")) assertBoolean(item.checked, "C-11 item " + index + " checked");
      if (hasOwn(item, "mixed")) assertBoolean(item.mixed, "C-11 item " + index + " mixed");
      if (hasOwn(item, "disabled")) assertBoolean(item.disabled, "C-11 item " + index + " disabled");
      if (hasOwn(item, "error")) assertBoolean(item.error, "C-11 item " + index + " error");
      assertError(hasOwn(item, "error") ? item.error : false, hasOwn(item, "errorMessage") ? item.errorMessage : null, "C-11 item " + index);
      runtime.assert(!(item.checked && item.mixed), "C-11 item " + index + " checked and mixed cannot both be true");
    });
    var values = props.items.map(function (item) { return item.value; });
    runtime.assert(new Set(values).size === values.length, "C-11 item values must be unique");

    if (props.variant === "group") {
      runtime.assert(props.items.length > 0, "C-11 group requires at least one item");
      runtime.assert(props.description === null, "C-11 group does not accept description; use with-description");
      runtime.assert(!props.checked && !props.mixed, "C-11 group derives checked and mixed state from items");
    } else {
      runtime.assert(props.items.length === 0, "C-11 " + props.variant + " does not accept items");
      runtime.assert(props.orientation === "vertical", "C-11 orientation is supported only by group");
    }
    if (props.variant === "with-description") {
      runtime.assert(typeof props.description === "string" && props.description.trim(), "C-11 with-description requires description");
    } else {
      runtime.assert(props.description === null, "C-11 description is supported only by with-description");
    }
  }

  function sourceState(checked, indeterminate, disabled, invalid) {
    var prefix = indeterminate ? "partial" : (checked ? "checked" : "unchecked");
    if (disabled) return prefix + "-disabled";
    if (invalid) return prefix + "-error";
    return prefix;
  }

  function optionMarkup(H, label, state, props, options) {
    var opts = options || {};
    return H.checkboxOption(label, state, {
      description: opts.description || null,
      compact: props.compact,
      alignTop: Boolean(opts.description),
      dynamic: true,
      className: props.error ? "is-error" : "",
      value: props.value,
      errorMessage: props.error ? props.errorMessage : null,
      group: opts.group || null,
      dataAttrs: opts.dataAttrs || ""
    });
  }

  function renderSingle(props, H) {
    var state = sourceState(props.checked, props.mixed, props.disabled, props.error);
    return optionMarkup(H, props.label, state, props, {
      description: props.variant === "with-description" ? props.description : null
    });
  }

  function groupSnapshot(root) {
    var itemInputs = Array.from(root.querySelectorAll('input[data-checkbox-item="item"]'));
    var allInput = root.querySelector('input[data-checkbox-item="all"]');
    var items = itemInputs.map(function (input, index) {
      return {
        index: index,
        value: input.value,
        label: input.closest(".checkbox-spec").querySelector(".checkbox-copy > span").textContent,
        checked: Boolean(input.checked),
        mixed: Boolean(input.indeterminate),
        disabled: Boolean(input.disabled),
        error: input.getAttribute("aria-invalid") === "true"
      };
    });
    var selected = items.filter(function (item) { return item.checked; });
    return {
      variant: "group",
      checked: Boolean(allInput && allInput.checked),
      indeterminate: Boolean(allInput && allInput.indeterminate),
      selected: selected.map(function (item) { return item.label; }),
      selectedValues: selected.map(function (item) { return item.value; }),
      selectedCount: selected.length,
      total: itemInputs.length,
      items: items
    };
  }

  function singleSnapshot(root, props) {
    var input = root.querySelector("input[type=checkbox]");
    return {
      variant: props.variant,
      checked: Boolean(input.checked),
      indeterminate: Boolean(input.indeterminate),
      value: input.value,
      label: root.querySelector(".checkbox-copy > span").textContent,
      disabled: Boolean(input.disabled),
      error: input.getAttribute("aria-invalid") === "true"
    };
  }

  function bindChangeBridge(root, props) {
    var active = true;
    function change(event) {
      var changedInput = event.target && event.target.matches("input[type=checkbox]") ? event.target : null;
      if (changedInput) changedInput.setAttribute("aria-checked", changedInput.indeterminate ? "mixed" : String(changedInput.checked));
      Promise.resolve().then(function () {
        if (!active || !root.isConnected) return;
        var detail = props.variant === "group" ? groupSnapshot(root) : singleSnapshot(root, props);
        if (props.variant === "group" && changedInput) {
          detail.item = changedInput.dataset.checkboxItem === "all" ? {
            kind: "select-all", value: changedInput.value, checked: Boolean(changedInput.checked), mixed: Boolean(changedInput.indeterminate)
          } : detail.items[Number(changedInput.dataset.checkboxIndex)];
          if (detail.item && !detail.item.kind) detail.item.kind = "item";
        }
        runtime.emit(root, "b2b:checkbox-change", detail);
      });
    }
    root.addEventListener("change", change);
    return function cleanup() {
      active = false;
      root.removeEventListener("change", change);
    };
  }

  function validateAnatomy(root, props) {
    var errors = [];
    var optionRoots = props.variant === "group" ? Array.from(root.querySelectorAll(":scope .checkbox-spec")) : [root];
    if (props.variant === "group") {
      if (!root.matches(".checkbox-runtime-group[data-checkbox-group][role=group]")) errors.push("group root anatomy mismatch");
      if (root.dataset.checkboxOrientation !== props.orientation || !root.classList.contains("is-" + props.orientation)) errors.push("group orientation mismatch");
      if (optionRoots.length !== props.items.length + 1) errors.push("group option count mismatch");
      if (!root.querySelector('[data-checkbox-item="all"]')) errors.push("group select-all hook missing");
    } else if (!root.matches("label.checkbox-spec")) {
      errors.push("single checkbox root anatomy mismatch");
    }
    optionRoots.forEach(function (option, index) {
      if (!option.querySelector("input[type=checkbox] + .checkbox-control .checkbox-check")) errors.push("checkbox anatomy mismatch at " + index);
      if (!option.querySelector(".checkbox-control .checkbox-partial-mark")) errors.push("indeterminate mark missing at " + index);
      if (!option.querySelector(".checkbox-copy > span")) errors.push("checkbox copy missing at " + index);
      var input = option.querySelector("input[type=checkbox]");
      var expectedAria = input.indeterminate ? "mixed" : String(input.checked);
      if (input.getAttribute("aria-checked") !== expectedAria) errors.push("checkbox aria-checked mismatch at " + index);
      if (input.getAttribute("aria-invalid") === "true") {
        var describedBy = input.getAttribute("aria-describedby");
        if (!describedBy || !option.querySelector("#" + describedBy + ".checkbox-error-message")) errors.push("checkbox error description mismatch at " + index);
      }
    });
    return errors;
  }

  function rerender(next, root, instance, currentProps) {
    var candidate = Object.assign({}, currentProps, next || {});
    assertProps(candidate);
    var H = global.B2BDesignSource && global.B2BDesignSource.componentFactories;
    runtime.assert(H, "C-11 canonical factories are unavailable");
    var markup = candidate.variant === "group" ? H.checkboxGroup(candidate) : renderSingle(candidate, H);
    components.canonicalAdapter.syncCanonical(root, markup, "C-11", "checkbox");
    Object.keys(currentProps).forEach(function (key) { delete currentProps[key]; });
    Object.assign(currentProps, candidate);
    root.dispatchEvent(new CustomEvent("b2b:specimens-rendered", { bubbles: true, detail: { root: root } }));
  }

  components.canonicalAdapter.define({
    id: "C-11",
    name: "checkbox",
    styles: ["C-11-checkbox/styles.css"],
    defaults: {
      label: "Option",
      value: "checkbox",
      description: null,
      selectAllLabel: "Select all",
      items: [],
      checked: false,
      mixed: false,
      disabled: false,
      error: false,
      errorMessage: null,
      orientation: "vertical",
      compact: false
    },
    render: function render(props, H) {
      assertProps(props);
      return props.variant === "group" ? H.checkboxGroup(props) : renderSingle(props, H);
    },
    bind: function bind(root, props) {
      return bindChangeBridge(root, props);
    },
    update: rerender,
    validate: validateAnatomy
  });
})(window);
