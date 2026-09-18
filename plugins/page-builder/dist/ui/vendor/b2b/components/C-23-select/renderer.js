(function registerSelectRenderer(global) {
  "use strict";

  var runtime = global.B2B && global.B2B.components && global.B2B.components.runtime;
  if (!runtime) throw new Error("C-23 renderer requires components/runtime/core.js");

  var variants = ["基础单选", "基础多选", "自定义选项", "分组选项", "无边框", "下划线", "可搜索", "可创建", "复杂内容"];
  var sizes = ["small", "medium", "large"];
  var states = ["default", "disabled", "readonly", "error", "loading", "no-result"];
  var positions = ["bottom-left", "top", "right", "left"];
  var itemKeys = ["label", "icon", "tag", "avatar", "description", "disabled", "group"];
  var variationByVariant = { "无边框": "borderless", "下划线": "underline" };

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function itemData(item) {
    return typeof item === "string" ? { label: item } : item;
  }

  function isGroup(item) {
    return item && typeof item === "object" && hasOwn(item, "group");
  }

  function isRich(item) {
    return item && typeof item === "object" && ["icon", "tag", "avatar", "description"].some(function (key) {
      return Boolean(item[key]);
    });
  }

  function optionItems(items) {
    return items.filter(function (item) { return !isGroup(item); });
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-23 variant");
    runtime.assertEnum(props.size, sizes, "C-23 size");
    runtime.assertEnum(props.state, states, "C-23 state");
    runtime.assertEnum(props.position, positions, "C-23 position");
    runtime.assert(Array.isArray(props.items), "C-23 items must be an array");
    runtime.assert(Array.isArray(props.selected), "C-23 selected must be an array");
    runtime.assert(typeof props.placeholder === "string" && props.placeholder.trim(), "C-23 placeholder cannot be empty");
    runtime.assert(typeof props.query === "string", "C-23 query must be a string");
    runtime.assert(props.items.length > 0 || props.state === "loading" || props.state === "no-result", "C-23 requires at least one option outside loading/no-result states");

    var labels = [];
    var disabledLabels = [];
    props.items.forEach(function (item, index) {
      runtime.assert(typeof item === "string" || item && typeof item === "object" && !Array.isArray(item), "C-23 item " + index + " must be a string or object");
      if (typeof item === "object") {
        var unknown = Object.keys(item).filter(function (key) { return itemKeys.indexOf(key) < 0; });
        runtime.assert(!unknown.length, "C-23 item " + index + " received unsupported fields: " + unknown.join(", "));
      }
      if (isGroup(item)) {
        runtime.assert(typeof item.group === "string" && item.group.trim(), "C-23 group heading cannot be empty");
        runtime.assert(!hasOwn(item, "label"), "C-23 group headings must use { group } without label");
        return;
      }
      var data = itemData(item);
      runtime.assert(typeof data.label === "string" && data.label.trim(), "C-23 option label cannot be empty at index " + index);
      runtime.assert(labels.indexOf(data.label) < 0, "C-23 option labels must be unique: " + data.label);
      labels.push(data.label);
      if (data.disabled) disabledLabels.push(data.label);
    });

    runtime.assert(props.multiple || props.selected.length <= 1, "C-23 single select accepts at most one selected label");
    props.selected.forEach(function (value) {
      runtime.assert(typeof value === "string" && labels.indexOf(value) >= 0, "C-23 selected label must match an option label: " + String(value));
      runtime.assert(disabledLabels.indexOf(value) < 0, "C-23 disabled options cannot be selected: " + value);
    });
    runtime.assert(props.selected.filter(function (value, index, list) { return list.indexOf(value) === index; }).length === props.selected.length, "C-23 selected labels must be unique");

    runtime.assert(!(props.state === "disabled" || props.state === "readonly") || !props.open, "C-23 disabled/readonly states cannot be open");
    runtime.assert(!props.query || props.searchable, "C-23 query requires searchable=true");
    runtime.assert(["loading", "no-result"].indexOf(props.state) < 0 || props.searchable, "C-23 loading/no-result states require searchable=true");
    runtime.assert(props.state !== "no-result" || props.open, "C-23 no-result state requires open=true");

    if (props.variant === "基础单选") runtime.assert(!props.multiple, "C-23 基础单选 requires multiple=false");
    if (props.variant === "基础多选") runtime.assert(props.multiple, "C-23 基础多选 requires multiple=true");
    if (props.variant === "自定义选项") runtime.assert(props.items.some(isRich), "C-23 自定义选项 requires icon, tag, avatar or description evidence");
    if (props.variant === "分组选项") runtime.assert(props.items.some(isGroup), "C-23 分组选项 requires at least one { group } heading");
    if (props.variant === "可搜索") runtime.assert(props.searchable, "C-23 可搜索 requires searchable=true");
    if (props.variant === "可创建") runtime.assert(props.creatable, "C-23 可创建 requires creatable=true");
    if (props.variant === "复杂内容") runtime.assert(props.items.some(isRich), "C-23 复杂内容 requires rich option content");
    runtime.assert(!props.searchable || ["可搜索", "可创建", "复杂内容"].indexOf(props.variant) >= 0, "C-23 searchable is supported by 可搜索, 可创建 or 复杂内容 variants");
    runtime.assert(!props.creatable || props.variant === "可创建", "C-23 creatable is supported only by 可创建 variant");
    runtime.assert(!props.items.some(isGroup) || ["分组选项", "复杂内容"].indexOf(props.variant) >= 0, "C-23 group headings are supported by 分组选项 or 复杂内容 variants");
    runtime.assert(!props.items.some(isRich) || ["自定义选项", "复杂内容"].indexOf(props.variant) >= 0, "C-23 rich option fields are supported by 自定义选项 or 复杂内容 variants");
  }

  function sourceState(props) {
    if (props.state !== "default") return props.state;
    if (!props.open) return "default";
    return props.selected.length ? "selected-active" : "active";
  }

  function selectedValues(root) {
    return Array.from(root.querySelectorAll("[data-select-option][aria-selected='true']")).map(function (option) {
      return option.dataset.value;
    });
  }

  function snapshot(root) {
    return {
      open: root.classList.contains("is-open"),
      selected: selectedValues(root)
    };
  }

  function sameValues(left, right) {
    return left.length === right.length && left.every(function (value, index) { return value === right[index]; });
  }

  function eventDetail(root, props, state) {
    return {
      variant: props.variant,
      multiple: Boolean(props.multiple),
      selected: state.selected.slice(),
      open: state.open
    };
  }

  function bindProductionBridge(root, props) {
    var panel = root.querySelector("[data-select-panel]");
    var options = root.querySelector("[data-select-options]");
    var trigger = root.querySelector("[data-select-trigger]");
    var search = root.querySelector("[data-select-search]");
    var error = root.querySelector(".source-select-error");
    var optionsId = runtime.uid("c23-select-listbox");
    options.id = optionsId;
    options.setAttribute("role", "listbox");
    options.setAttribute("aria-multiselectable", String(Boolean(props.multiple)));
    panel.removeAttribute("role");
    panel.removeAttribute("aria-multiselectable");
    trigger.setAttribute("aria-controls", optionsId);
    if (search) search.setAttribute("aria-controls", optionsId);
    if (props.state === "readonly") options.setAttribute("aria-readonly", "true");
    if (props.state === "error") {
      error.id = runtime.uid("c23-select-error");
      trigger.setAttribute("aria-invalid", "true");
      trigger.setAttribute("aria-describedby", error.id);
    }
    root.dataset.variant = props.variant;
    root.dataset.size = props.size;
    root.dataset.state = props.state;

    var previous = snapshot(root);
    var scheduled = false;
    function flush() {
      scheduled = false;
      var next = snapshot(root);
      if (!sameValues(next.selected, previous.selected)) {
        runtime.emit(root, "b2b:select-change", eventDetail(root, props, next));
      }
      if (next.open !== previous.open) {
        runtime.emit(root, next.open ? "b2b:select-open" : "b2b:select-close", eventDetail(root, props, next));
      }
      previous = next;
    }
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      global.queueMicrotask(flush);
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-expanded", "aria-hidden", "hidden"] });

    function onInput(event) {
      if (!event.target.matches("[data-select-search]")) return;
      global.queueMicrotask(function () {
        runtime.emit(root, "b2b:select-search", {
          variant: props.variant,
          query: event.target.value,
          visibleCount: root.querySelectorAll("[data-select-option]:not([hidden])").length
        });
      });
    }
    function onClick(event) {
      var create = event.target.closest("[data-select-create]");
      if (!create) return;
      var requested = (search && search.value.trim()) || "New option";
      global.queueMicrotask(function () {
        var created = Array.from(root.querySelectorAll("[data-select-option]")).some(function (option) {
          return option.dataset.value === requested;
        });
        if (created) runtime.emit(root, "b2b:select-create", {
          variant: props.variant,
          value: requested,
          selected: selectedValues(root),
          multiple: Boolean(props.multiple)
        });
      });
    }
    root.addEventListener("input", onInput);
    root.addEventListener("click", onClick);
    return function cleanup() {
      observer.disconnect();
      root.removeEventListener("input", onInput);
      root.removeEventListener("click", onClick);
    };
  }

  global.B2B.components.canonicalAdapter.define({
    id: "C-23",
    name: "select",
    styles: ["C-23-select/styles.css"],
    defaults: {
      variant: "基础单选",
      items: ["Option 1", "Option 2", "Option 3"],
      selected: [],
      multiple: false,
      open: false,
      placeholder: "Please select",
      clearable: true,
      searchable: false,
      creatable: false,
      query: "",
      size: "medium",
      state: "default",
      position: "bottom-left"
    },
    render: function render(props, H) {
      assertProps(props);
      return H.sourceSelect(Object.assign({}, props, {
        state: sourceState(props),
        variation: variationByVariant[props.variant] || null
      }));
    },
    bind: bindProductionBridge,
    update: function update() {
      runtime.assert(false, "C-23 select does not support update(); destroy and recreate the instance");
    },
    validate: function validate(root, props) {
      var errors = [];
      var trigger = root.querySelector("[data-select-trigger]");
      var panel = root.querySelector("[data-select-panel]");
      var options = root.querySelector("[data-select-options]");
      var selected = selectedValues(root);
      var currentOpen = root.classList.contains("is-open");
      if (!root.matches(".source-select[data-select-demo]")) errors.push("C-23 root must preserve source-select anatomy");
      if (!trigger || !panel || !options || !root.querySelector("[data-select-selection]")) errors.push("C-23 trigger, selection, panel or options anatomy is incomplete");
      if (trigger && trigger.getAttribute("aria-expanded") !== String(currentOpen)) errors.push("C-23 trigger aria-expanded mismatch");
      if (panel && panel.getAttribute("aria-hidden") !== String(!currentOpen)) errors.push("C-23 panel aria-hidden mismatch");
      if (options && options.getAttribute("role") !== "listbox") errors.push("C-23 options must own listbox role");
      if (options && options.getAttribute("aria-multiselectable") !== String(Boolean(props.multiple))) errors.push("C-23 listbox aria-multiselectable mismatch");
      if (trigger && trigger.getAttribute("aria-controls") !== (options && options.id)) errors.push("C-23 trigger aria-controls mismatch");
      if (!props.multiple && selected.length > 1) errors.push("C-23 single select contains multiple selected options");
      if (["loading", "no-result"].indexOf(props.state) < 0) {
        var renderedOptionCount = root.querySelectorAll("[data-select-option]").length;
        var sourceOptionCount = optionItems(props.items).length;
        if (props.creatable ? renderedOptionCount < sourceOptionCount : renderedOptionCount !== sourceOptionCount) errors.push("C-23 option anatomy count mismatch");
      }
      if (root.querySelectorAll(".select-group-title").length !== props.items.filter(isGroup).length) errors.push("C-23 group anatomy count mismatch");
      if (props.multiple && root.querySelectorAll("[data-select-tag]").length !== selected.length) errors.push("C-23 multiple selection tag count mismatch");
      if (props.state === "disabled" && (!trigger || !trigger.disabled || root.getAttribute("aria-disabled") !== "true")) errors.push("C-23 disabled semantics mismatch");
      if (props.state === "readonly" && (!trigger || trigger.getAttribute("aria-readonly") !== "true" || options.getAttribute("aria-readonly") !== "true")) errors.push("C-23 readonly semantics mismatch");
      if (props.state === "error" && (!trigger || trigger.getAttribute("aria-invalid") !== "true" || !root.querySelector(".source-select-error"))) errors.push("C-23 error semantics mismatch");
      if (props.searchable && !root.querySelector("[data-select-search]")) errors.push("C-23 searchable variant lacks source search anatomy");
      if (props.creatable && !root.querySelector("[data-select-create]")) errors.push("C-23 creatable variant lacks source create control");
      if (variationByVariant[props.variant] && !root.classList.contains("is-" + variationByVariant[props.variant])) errors.push("C-23 variation class mismatch");
      if (!root.classList.contains("is-size-" + props.size)) errors.push("C-23 size class mismatch");
      return errors;
    }
  });
})(window);
