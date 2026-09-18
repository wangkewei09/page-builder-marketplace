(function registerBasicButtonRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  var adapter = components && components.canonicalAdapter;
  runtime.assert(adapter, "C-02 requires components/runtime/canonical-adapter.js");
  var variants = ["primary", "danger", "secondary-blue", "secondary-danger", "secondary-gray"];
  var sizes = ["mini", "small", "medium", "large", "xlarge"];
  var widths = ["default", "long"];

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-02 variant");
    runtime.assertEnum(props.size, sizes, "C-02 size");
    runtime.assertEnum(props.width, widths, "C-02 width");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-02 label must be a non-empty string");
    runtime.assert(props.icon === null || typeof props.icon === "string" && props.icon.trim(), "C-02 icon must be null or a non-empty string");
    runtime.assert(typeof props.disabled === "boolean" && typeof props.loading === "boolean", "C-02 state props must be boolean");
  }

  adapter.define({
    id: "C-02",
    name: "basicButton",
    rawProps: true,
    interactive: false,
    styles: ["shared/base.css", "C-02-basic-button/styles.css"],
    defaults: { label: "Button", variant: "secondary-gray", size: "medium", width: "default", icon: null, disabled: false, loading: false },
    render: function render(props, H) {
      assertProps(props);
      return H.sourceBasicButton(props);
    },
    bind: function bind(root, props) {
      function activate() {
        if (root.disabled || props.loading) return;
        runtime.emit(root, "b2b:button-activate", runtime.actionDetail("C-02", "activate", {
          label: props.label, variant: props.variant, size: props.size, width: props.width
        }));
      }
      root.addEventListener("click", activate);
      return function cleanup() { root.removeEventListener("click", activate); };
    },
    update: "rerender",
    validate: function validate(root, props) {
      var errors = [];
      if (!root.matches("button.b2b-button[data-source-basic-button][type='button']")) errors.push("C-02 canonical button anatomy is incomplete");
      if (root.getAttribute("data-button-variant") !== props.variant) errors.push("C-02 variant marker is out of sync");
      if (root.getAttribute("data-button-size") !== String(props.size)) errors.push("C-02 size marker is out of sync");
      if (root.getAttribute("data-button-height") !== String({ mini: 24, small: 28, medium: 32, large: 36, xlarge: 40 }[props.size])) errors.push("C-02 height marker is out of sync");
      if (root.getAttribute("data-button-width") !== props.width) errors.push("C-02 width marker is out of sync");
      if (root.disabled !== Boolean(props.disabled || props.loading)) errors.push("C-02 disabled state is out of sync");
      if (root.getAttribute("aria-busy") !== String(Boolean(props.loading))) errors.push("C-02 aria-busy is out of sync");
      if (props.loading && !root.querySelector(":scope > .button-spinner")) errors.push("C-02 loading anatomy is missing");
      if (!props.loading && props.icon && !root.querySelector(":scope > .b2b-icon")) errors.push("C-02 leading icon anatomy is missing");
      if (root.classList.contains("is-long") !== (props.width === "long")) errors.push("C-02 long width is out of sync");
      return errors;
    }
  });
})(window);
