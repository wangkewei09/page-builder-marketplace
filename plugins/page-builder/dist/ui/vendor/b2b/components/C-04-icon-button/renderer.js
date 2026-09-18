(function registerIconButtonRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  var adapter = components && components.canonicalAdapter;
  runtime.assert(adapter, "C-04 requires components/runtime/canonical-adapter.js");
  var variants = ["Button_Icon", "Outlined icon button", "icon group", "menu trigger"];
  var sizes = [24, 28, 32, 36, 40];
  var iconSizes = { 24: 14, 28: 16, 32: 18, 36: 20, 40: 22 };
  var groupKeys = ["icon", "label", "selected", "disabled"];
  var menuKeys = ["label", "icon", "danger", "disabled"];

  function validateItem(item, index, keys, menu) {
    var path = "C-04.items[" + index + "]";
    runtime.assert(item && Object.prototype.toString.call(item) === "[object Object]", path + " must be an object");
    var unknown = Object.keys(item).filter(function (key) { return keys.indexOf(key) < 0; });
    runtime.assert(!unknown.length, path + " received unsupported fields: " + unknown.join(", "));
    runtime.assert(typeof item.label === "string" && item.label.trim(), path + ".label must be a non-empty string");
    runtime.assert(item.icon === undefined || typeof item.icon === "string" && item.icon.trim(), path + ".icon must be a non-empty string when provided");
    runtime.assert(menu || typeof item.icon === "string" && item.icon.trim(), path + ".icon is required by icon group anatomy");
    ["selected", "disabled", "danger"].forEach(function (key) {
      runtime.assert(item[key] === undefined || typeof item[key] === "boolean", path + "." + key + " must be boolean");
    });
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-04 variant");
    runtime.assertEnum(props.size, sizes, "C-04 size");
    runtime.assert(typeof props.icon === "string" && props.icon.trim(), "C-04 icon must be a non-empty string");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-04 label must be a non-empty string");
    runtime.assert(typeof props.disabled === "boolean", "C-04 disabled must be boolean");
    runtime.assert(typeof props.tooltip === "boolean", "C-04 tooltip must be boolean");
    runtime.assert(Array.isArray(props.items), "C-04 items must be an array");
    if (props.variant === "icon group") {
      runtime.assert(props.items.length > 0, "C-04 icon group requires at least one item");
      props.items.forEach(function (item, index) { validateItem(item, index, groupKeys, false); });
    } else if (props.variant === "menu trigger") {
      runtime.assert(props.items.length > 0, "C-04 menu trigger requires at least one item");
      props.items.forEach(function (item, index) { validateItem(item, index, menuKeys, true); });
    } else runtime.assert(props.items.length === 0, "C-04 items are only valid for icon group or menu trigger");
  }

  function popupOpen(root) {
    var popup = root.querySelector("[data-popup-root]");
    return Boolean(popup && popup.classList.contains("is-open"));
  }

  function bindEventBridge(root, props) {
    root.setAttribute("data-component-interaction-source", "shared");
    var previousOpen = popupOpen(root);
    var queued = false;

    function flushOpen() {
      queued = false;
      var nextOpen = popupOpen(root);
      if (nextOpen === previousOpen) return;
      previousOpen = nextOpen;
      runtime.emit(root, "b2b:icon-menu-toggle", runtime.actionDetail("C-04", nextOpen ? "open" : "close", {
        expanded: nextOpen, source: "canonical-interaction", variant: props.variant, size: props.size
      }));
    }

    var observer = new MutationObserver(function (records) {
      if (records.some(function (record) { return record.type === "childList"; })) {
        previousOpen = popupOpen(root);
        return;
      }
      if (!queued) { queued = true; global.queueMicrotask(flushOpen); }
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });

    function click(event) {
      var menuItem = event.target.closest(".demo-menu-item:not(:disabled):not([aria-disabled='true'])");
      if (menuItem && root.contains(menuItem)) {
        var panel = menuItem.parentElement;
        var actions = Array.from(panel.children).filter(function (item) { return item.matches(".demo-menu-item:not([aria-disabled='true'])"); });
        var menuIndex = actions.indexOf(menuItem);
        runtime.emit(root, "b2b:icon-menu-select", runtime.actionDetail("C-04", "select", {
          index: menuIndex, item: props.items[menuIndex], variant: props.variant, size: props.size
        }));
        return;
      }
      var button = event.target.closest("button[data-icon-index]:not(:disabled)");
      if (!button || !root.contains(button) || button.hasAttribute("data-popup-trigger")) return;
      runtime.emit(root, "b2b:icon-activate", runtime.actionDetail("C-04", "activate", {
        index: Number(button.getAttribute("data-icon-index")), variant: props.variant,
        label: button.getAttribute("aria-label"), size: props.size
      }));
    }
    root.addEventListener("click", click);
    return function cleanup() {
      observer.disconnect();
      root.removeEventListener("click", click);
    };
  }

  adapter.define({
    id: "C-04",
    name: "iconButton",
    rawProps: true,
    styles: ["shared/base.css", "shared/popup-layout.css", "C-01-button-overview/styles.css", "C-04-icon-button/styles.css", "C-08-dropdown-menu/styles.css"],
    defaults: { icon: "more_horiz", label: "更多操作", size: 32, variant: "Button_Icon", disabled: false, tooltip: true, items: [] },
    render: function render(props, H) {
      assertProps(props);
      return H.sourceIconButton(props);
    },
    bind: bindEventBridge,
    update: "rerender",
    validate: function validate(root, props) {
      var errors = [];
      var buttons = root.querySelectorAll("button[aria-label]");
      if (!root.matches(".b2b-icon-control-source") || !buttons.length) errors.push("C-04 canonical icon-button anatomy is incomplete");
      if (root.querySelectorAll(".button-tooltip-anchor > .b2b-button + .button-tooltip").length !== (props.tooltip ? buttons.length : 0)) errors.push("C-04 Tooltip anatomy does not match tooltip prop");
      if (!props.tooltip && root.querySelector("[role='tooltip']")) errors.push("C-04 tooltip=false must not render Tooltip anatomy");
      if (props.variant === "icon group" && root.getAttribute("role") !== "group") errors.push("C-04 icon group role is missing");
      if (props.variant === "menu trigger") {
        var trigger = root.querySelector("[data-popup-trigger]");
        var panel = root.querySelector("[data-popup-panel][role='menu']");
        if (!trigger || !panel) errors.push("C-04 canonical menu anatomy is incomplete");
        if (trigger && trigger.getAttribute("aria-expanded") !== String(popupOpen(root))) errors.push("C-04 expanded ARIA is out of sync");
        if (root.getAttribute("data-component-interaction-source") !== "shared") errors.push("C-04 menu must use shared interaction");
      }
      if (root.isConnected) root.querySelectorAll(".b2b-button.is-icon > .b2b-icon").forEach(function (icon) {
        if (Math.round(parseFloat(getComputedStyle(icon).fontSize)) !== iconSizes[props.size]) errors.push("C-04 icon visual size must derive from control size");
      });
      return errors;
    }
  });
})(window);
