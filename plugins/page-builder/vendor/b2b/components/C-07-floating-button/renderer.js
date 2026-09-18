(function registerFloatingButtonRenderer(global) {
  "use strict";

  var runtime = global.B2B.components.runtime;
  var adapter = global.B2B.components.canonicalAdapter;
  var VARIANTS = { primary: true, secondary: true, menu: true, message: true, "official-text": true };
  var APPEARANCES = { primary: true, secondary: true };
  var SIZES = { 36: true, 40: true, 48: true };

  function assertItems(items) {
    runtime.assert(Array.isArray(items), "C-07 floatingButton.items must be an array");
    items.forEach(function (rawItem, index) {
      var item = typeof rawItem === "string" ? { label: rawItem } : rawItem;
      runtime.assert(item && typeof item === "object", "C-07 floatingButton.items[" + index + "] must be a string or object");
      runtime.assert(typeof item.label === "string" && item.label.trim(), "C-07 floatingButton.items[" + index + "].label is required");
      if (item.icon !== undefined) runtime.assert(typeof item.icon === "string" && item.icon, "C-07 floatingButton.items[" + index + "].icon must be a non-empty string");
      if (item.disabled !== undefined) runtime.assert(typeof item.disabled === "boolean", "C-07 floatingButton.items[" + index + "].disabled must be boolean");
    });
  }

  function assertCombination(props) {
    runtime.assert(VARIANTS[props.variant], "C-07 floatingButton.variant is unsupported");
    runtime.assert(APPEARANCES[props.appearance], "C-07 floatingButton.appearance must be primary or secondary");
    runtime.assert(SIZES[props.size], "C-07 floatingButton.size must be 36, 40 or 48");
    runtime.assert(typeof props.icon === "string" && props.icon, "C-07 floatingButton.icon must be a non-empty string");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-07 floatingButton.label must be a non-empty string");
    assertItems(props.items);

    if (props.variant === "primary") runtime.assert(props.appearance === "primary", "C-07 primary requires appearance=primary");
    if (props.variant === "secondary") runtime.assert(props.appearance === "secondary", "C-07 secondary requires appearance=secondary");
    if (props.variant === "menu") {
      runtime.assert(props.appearance === "secondary", "C-07 menu source requires appearance=secondary");
      runtime.assert(props.size === 36, "C-07 menu source requires size=36");
      runtime.assert(props.items.length > 0, "C-07 menu requires at least one item");
    } else {
      runtime.assert(props.expanded === false, "C-07 expanded is only valid for menu");
      runtime.assert(props.items.length === 0, "C-07 items are only valid for menu");
    }
    if (props.variant === "message") {
      runtime.assert(props.size === 48, "C-07 message uses its source-fixed 34px anatomy and requires size=48 as the variant selector value");
      runtime.assert(!props.avatarText || props.appearance === "primary", "C-07 message avatar is only source-proven for primary appearance");
      runtime.assert(!props.avatarLabel || props.avatarText, "C-07 avatarLabel requires avatarText");
    } else {
      runtime.assert(props.badge === 0, "C-07 badge is only valid for message");
      runtime.assert(props.messageText === "", "C-07 messageText is only valid for message");
      runtime.assert(props.avatarText === "" && props.avatarLabel === "", "C-07 avatar props are only valid for message");
    }
    if (props.variant === "official-text") runtime.assert(props.size === 40, "C-07 official-text requires its source selector size=40");
  }

  function bindPublicEvents(root, props) {
    root.setAttribute("data-component-interaction-source", "shared");

    function onActivate() {
      runtime.emit(root, "b2b:floating-activate", runtime.actionDetail("C-07", "activate", {
        variant: props.variant,
        appearance: props.appearance,
        label: props.label,
        size: props.size
      }));
    }

    function onChange(event) {
      var expanded = Boolean(event.detail && event.detail.expanded);
      runtime.emit(root, "b2b:floating-change", runtime.actionDetail("C-07", expanded ? "open" : "close", {
        variant: props.variant,
        appearance: props.appearance,
        size: props.size,
        expanded: expanded,
        source: event.detail && event.detail.reason || null
      }));
    }

    function onSelect(event) {
      var index = Number(event.detail && event.detail.index);
      runtime.emit(root, "b2b:floating-select", runtime.actionDetail("C-07", "select", {
        variant: props.variant,
        appearance: props.appearance,
        size: props.size,
        index: index,
        item: props.items[index]
      }));
    }

    root.addEventListener("b2b:source-floating-activate", onActivate);
    root.addEventListener("b2b:source-floating-change", onChange);
    root.addEventListener("b2b:source-floating-select", onSelect);
    return function () {
      root.removeEventListener("b2b:source-floating-activate", onActivate);
      root.removeEventListener("b2b:source-floating-change", onChange);
      root.removeEventListener("b2b:source-floating-select", onSelect);
    };
  }

  adapter.define({
    id: "C-07",
    name: "floatingButton",
    styles: ["shared/base.css", "C-01-button-overview/styles.css", "C-07-floating-button/styles.css"],
    defaults: {
      variant: "secondary",
      appearance: "secondary",
      size: 48,
      icon: "help",
      label: "快捷操作",
      disabled: false,
      expanded: false,
      items: [],
      badge: 0,
      messageText: "",
      avatarText: "",
      avatarLabel: ""
    },
    rawProps: true,
    render: function render(props, H) {
      assertCombination(props);
      return H.sourceFloatingButton(props);
    },
    bind: bindPublicEvents,
    update: function update() {
      runtime.assert(false, "C-07 floatingButton does not support update(); destroy and recreate the instance");
    },
    validate: function validate(root, props) {
      var errors = [];
      if (root.dataset.floatingVariant !== props.variant || !root.hasAttribute("data-source-floating")) errors.push("C-07 canonical root marker mismatch");
      if (root.getAttribute("data-component-interaction-source") !== "shared") errors.push("C-07 must use the shared canonical binder");
      if ((props.variant === "primary" || props.variant === "secondary") && (!root.matches(".floating-tooltip-anchor") || !root.querySelector(":scope > .floating-action + .button-tooltip"))) errors.push("C-07 action Tooltip anatomy is incomplete");
      if (props.variant === "menu" && (!root.matches(".floating-menu-demo[data-floating-menu]") || !root.querySelector(":scope > .floating-children[role='menu']") || !root.querySelector(":scope > [data-floating-toggle][aria-haspopup='menu']"))) errors.push("C-07 menu anatomy is incomplete");
      if (props.variant === "message" && !root.matches("button.message-float")) errors.push("C-07 message must use the canonical message button root");
      if (props.variant === "official-text" && (!root.matches("button.official-float") || !root.querySelector(":scope > span:not(.b2b-icon)"))) errors.push("C-07 official-text anatomy is incomplete");
      if (root.matches("button") && root.disabled !== props.disabled || !root.matches("button") && Boolean(root.querySelector(":scope > button:disabled, :scope > .floating-action:disabled")) !== props.disabled) errors.push("C-07 disabled state mismatch");
      return errors;
    }
  });
})(window);
