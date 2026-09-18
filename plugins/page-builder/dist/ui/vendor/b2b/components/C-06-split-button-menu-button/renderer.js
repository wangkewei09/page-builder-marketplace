(function registerMenuButtonRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  var adapter = components && components.canonicalAdapter;
  runtime.assert(adapter, "C-06 requires components/runtime/canonical-adapter.js");
  var variants = ["Split button", "Menu button", "Overflow Menu"];
  var appearances = ["primary", "secondary-blue", "secondary-gray"];
  var sizes = [24, 28, 32, 36, 40];
  var itemKeys = ["label", "icon", "danger", "disabled"];

  function assertNullableIcon(value, name) {
    runtime.assert(value === null || typeof value === "string" && value.trim(), "C-06 " + name + " must be null or a non-empty string");
    runtime.assert(value === null || /^[a-z0-9_]+$/.test(value), "C-06 " + name + " must be a canonical icon name");
  }

  function validateItem(item, index) {
    var path = "C-06.items[" + index + "]";
    runtime.assert(item && Object.prototype.toString.call(item) === "[object Object]", path + " must be an object");
    var unknown = Object.keys(item).filter(function (key) { return itemKeys.indexOf(key) < 0; });
    runtime.assert(!unknown.length, path + " received unsupported fields: " + unknown.join(", "));
    runtime.assert(typeof item.label === "string" && item.label.trim(), path + ".label must be a non-empty string");
    runtime.assert(item.icon === undefined || typeof item.icon === "string" && /^[a-z0-9_]+$/.test(item.icon), path + ".icon must be a canonical icon name when provided");
    ["danger", "disabled"].forEach(function (key) {
      runtime.assert(item[key] === undefined || typeof item[key] === "boolean", path + "." + key + " must be boolean");
    });
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-06 variant");
    runtime.assertEnum(props.appearance, appearances, "C-06 appearance");
    runtime.assertEnum(props.size, sizes, "C-06 size");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-06 label must be a non-empty string");
    runtime.assert(typeof props.open === "boolean" && typeof props.disabled === "boolean", "C-06 state props must be boolean");
    assertNullableIcon(props.mainIcon, "mainIcon");
    assertNullableIcon(props.icon, "icon");
    runtime.assert(props.variant === "Split button" || props.mainIcon === null, "C-06 mainIcon is only valid for Split button");
    runtime.assert(props.variant === "Overflow Menu" ? Boolean(props.icon) : props.icon === null, "C-06 icon is required by Overflow Menu and forbidden for other variants");
    runtime.assert(!(props.disabled && props.open), "C-06 disabled controls cannot start open");
    runtime.assert(Array.isArray(props.items) && props.items.length > 0, "C-06 items must contain at least one action");
    props.items.forEach(validateItem);
    if (props.variant === "Split button") runtime.assert(!props.items.some(function (item) { return item.label.trim() === props.label.trim(); }), "C-06 Split button menu must not repeat the primary action");
  }

  function popupOpen(root) {
    var popup = root.querySelector("[data-popup-root]");
    return Boolean(popup && popup.classList.contains("is-open"));
  }

  function bindEventBridge(root, props) {
    root.setAttribute("data-component-interaction-source", "shared");
    var previousOpen = popupOpen(root);
    var queued = false;

    function stateDetail(source) {
      return { variant: props.variant, source: source, size: props.size, appearance: props.appearance };
    }
    function flushOpen() {
      queued = false;
      var nextOpen = popupOpen(root);
      if (nextOpen === previousOpen) return;
      previousOpen = nextOpen;
      props.open = nextOpen;
      runtime.emit(root, nextOpen ? "b2b:menu-button-open" : "b2b:menu-button-close", runtime.actionDetail("C-06", nextOpen ? "open" : "close", stateDetail("canonical-interaction")));
    }
    var observer = new MutationObserver(function (records) {
      if (records.some(function (record) { return record.type === "childList"; })) {
        previousOpen = Boolean(props.open);
        return;
      }
      if (!queued) { queued = true; global.queueMicrotask(flushOpen); }
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });

    function sourceState(event) {
      if (event.target !== root || !event.detail || typeof event.detail.open !== "boolean") return;
      flushOpen();
    }

    function click(event) {
      var primary = event.target.closest("[data-split-primary]:not(:disabled)");
      if (primary && root.contains(primary)) {
        runtime.emit(root, "b2b:menu-button-primary", runtime.actionDetail("C-06", "primary", {
          label: props.label, variant: props.variant, size: props.size, appearance: props.appearance
        }));
        return;
      }
      var menuItem = event.target.closest(".demo-menu-item:not(:disabled):not([aria-disabled='true'])");
      if (!menuItem || !root.contains(menuItem)) return;
      var actions = Array.from(menuItem.parentElement.children).filter(function (item) { return item.matches(".demo-menu-item"); });
      var index = actions.indexOf(menuItem);
      runtime.emit(root, "b2b:menu-button-select", runtime.actionDetail("C-06", "select", {
        index: index, item: props.items[index], variant: props.variant, size: props.size, appearance: props.appearance
      }));
    }
    root.addEventListener("click", click);
    root.addEventListener("b2b:source-menu-button-state", sourceState);
    if (props.open) {
      global.requestAnimationFrame(function () {
        var popup = root.querySelector("[data-popup-root]");
        var source = global.B2BDesignSource;
        if (!popup || !popup.classList.contains("is-open") || !source || typeof source.syncSourceButtonPopup !== "function") return;
        source.syncSourceButtonPopup(popup);
      });
    }
    return function cleanup() {
      observer.disconnect();
      root.removeEventListener("click", click);
      root.removeEventListener("b2b:source-menu-button-state", sourceState);
    };
  }

  adapter.define({
    id: "C-06",
    name: "menuButton",
    rawProps: true,
    styles: ["shared/base.css", "shared/popup-layout.css", "C-02-basic-button/styles.css", "C-06-split-button-menu-button/styles.css", "C-08-dropdown-menu/styles.css"],
    defaults: {
      variant: "Split button", label: "创建", items: [{ label: "创建活动" }, { label: "创建日程" }],
      open: false, appearance: "primary", size: 32, mainIcon: null, icon: null, disabled: false
    },
    render: function render(props, H) {
      assertProps(props);
      return H.sourceMenuButton(props);
    },
    bind: bindEventBridge,
    update: "rerender",
    validate: function validate(root, props) {
      var errors = [];
      var dropdown = root.querySelector(":scope > .interactive-dropdown[data-popup-root]");
      var trigger = root.querySelector("[data-popup-trigger][aria-expanded]");
      var panel = root.querySelector("[data-popup-panel][role='menu']");
      if (!root.matches(".b2b-menu-button-source") || !dropdown || !trigger || !panel) errors.push("C-06 canonical menu-button anatomy is incomplete");
      if (root.getAttribute("data-component-interaction-source") !== "shared") errors.push("C-06 must use shared interaction");
      if (props.variant === "Split button" && root.querySelectorAll(".split-button > .b2b-button").length !== 2) errors.push("C-06 Split button requires two source hit areas");
      if (props.variant === "Split button" && props.mainIcon && !root.querySelector("[data-split-primary] > .b2b-icon:first-child")) errors.push("C-06 Split mainIcon anatomy is missing");
      var overflowIcon = trigger && trigger.querySelector("[data-popup-leading-icon]");
      if (props.variant === "Overflow Menu" && (!overflowIcon || overflowIcon.textContent.trim() !== props.icon)) errors.push("C-06 Overflow icon is out of sync");
      if (trigger && trigger.getAttribute("aria-expanded") !== String(popupOpen(root))) errors.push("C-06 expanded ARIA is out of sync");
      if (panel && panel.getAttribute("aria-hidden") !== String(!popupOpen(root))) errors.push("C-06 panel aria-hidden is out of sync");
      if (root.dataset.menuSize !== String(props.size) || root.dataset.menuAppearance !== props.appearance) errors.push("C-06 source geometry metadata is out of sync");
      var renderedItems = panel ? Array.from(panel.querySelectorAll(":scope > .demo-menu-item")) : [];
      if (renderedItems.length !== props.items.length) errors.push("C-06 caller-owned menu items are incomplete");
      props.items.forEach(function (item, index) {
        var rendered = renderedItems[index];
        var labelNode = rendered && (rendered.querySelector(".menu-item-main > span:last-child") || rendered.firstElementChild);
        if (!labelNode || labelNode.textContent.trim() !== item.label.trim()) errors.push("C-06 menu item " + index + " label is out of sync");
        if (rendered && Boolean(rendered.disabled || rendered.getAttribute("aria-disabled") === "true") !== Boolean(item.disabled)) errors.push("C-06 menu item " + index + " disabled state is out of sync");
      });
      if (root.isConnected && panel) {
        var panelStyle = getComputedStyle(panel);
        if (panelStyle.backgroundColor === "rgba(0, 0, 0, 0)" || panelStyle.backgroundColor === "transparent") errors.push("C-06 menu surface background is missing");
        if (parseFloat(panelStyle.borderTopWidth) < 1) errors.push("C-06 menu surface border is missing");
        if (panelStyle.boxShadow === "none") errors.push("C-06 menu surface shadow is missing");
        if (panelStyle.clipPath !== "none") errors.push("C-06 menu animation must not clip the shadow");
      }
      if (root.isConnected && props.variant === "Split button" && trigger && Math.abs(trigger.getBoundingClientRect().width - props.size) > 0.5) errors.push("C-06 split trigger width must equal size");
      return errors;
    }
  });
})(window);
