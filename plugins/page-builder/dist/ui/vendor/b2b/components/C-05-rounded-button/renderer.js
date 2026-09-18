(function registerRoundedButtonRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  var adapter = components && components.canonicalAdapter;
  runtime.assert(adapter, "C-05 requires components/runtime/canonical-adapter.js");
  var variants = ["Primary", "Secondary-Primary", "Outlined"];
  var sizes = ["mini", "small", "medium", "large", "xlarge"];
  var widths = ["default", "long"];
  var iconPlacements = ["none", "leading", "trailing"];
  var directionalIcon = /(?:^|_)(?:arrow|chevron)(?:_|$)|^(?:navigate_next|navigate_before|first_page|last_page|east|west|north|south|north_east|north_west|south_east|south_west)$/;

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-05 variant");
    runtime.assertEnum(props.size, sizes, "C-05 size");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-05 label must be a non-empty string");
    runtime.assertEnum(props.width, widths, "C-05 width");
    runtime.assertEnum(props.iconPlacement, iconPlacements, "C-05 iconPlacement");
    runtime.assert(props.icon === null || typeof props.icon === "string" && props.icon.trim(), "C-05 icon must be null or a non-empty string");
    runtime.assert(typeof props.disabled === "boolean" && typeof props.loading === "boolean", "C-05 state props must be boolean");
    runtime.assert(props.iconPlacement === "none" ? props.icon === null : props.icon !== null, "C-05 icon must be null only for iconPlacement none and required for leading/trailing");
    runtime.assert(props.iconPlacement !== "leading" || !directionalIcon.test(props.icon), "C-05 leading icon must be a non-directional functional icon");
    runtime.assert(props.iconPlacement !== "trailing" || props.icon === "chevron_right", "C-05 trailing icon is fixed to chevron_right");
  }

  adapter.define({
    id: "C-05",
    name: "roundedButton",
    rawProps: true,
    interactive: false,
    styles: ["shared/base.css", "C-05-rounded-button/styles.css"],
    defaults: { label: "Rounded Button", variant: "Primary", size: "medium", width: "default", icon: null, iconPlacement: "none", disabled: false, loading: false },
    render: function render(props, H) {
      assertProps(props);
      return H.sourceRoundedButton(props);
    },
    bind: function bind(root, props) {
      function activate() {
        if (root.disabled || props.loading) return;
        runtime.emit(root, "b2b:rounded-activate", runtime.actionDetail("C-05", "activate", {
          label: props.label, variant: props.variant, size: props.size, width: props.width,
          icon: props.icon, iconPlacement: props.iconPlacement
        }));
      }
      root.addEventListener("click", activate);
      return function cleanup() { root.removeEventListener("click", activate); };
    },
    update: "rerender",
    validate: function validate(root, props) {
      var errors = [];
      if (!root.matches("button.b2b-button.is-pill[data-source-rounded-button][type='button']")) errors.push("C-05 canonical rounded-button anatomy is incomplete");
      if (root.getAttribute("data-rounded-variant") !== props.variant) errors.push("C-05 variant marker is out of sync");
      if (root.getAttribute("data-button-size") !== String(props.size)) errors.push("C-05 size marker is out of sync");
      if (root.getAttribute("data-button-width") !== props.width) errors.push("C-05 width marker is out of sync");
      if (root.getAttribute("data-rounded-icon-placement") !== props.iconPlacement) errors.push("C-05 icon placement marker is out of sync");
      if (root.disabled !== Boolean(props.disabled || props.loading)) errors.push("C-05 disabled state is out of sync");
      if (root.getAttribute("aria-busy") !== String(Boolean(props.loading))) errors.push("C-05 aria-busy is out of sync");
      if (props.loading && !root.querySelector(":scope > .button-spinner")) errors.push("C-05 loading anatomy is missing");
      if (!props.loading && props.iconPlacement === "leading" && !root.querySelector(":scope > .b2b-icon.is-leading-icon:first-child")) errors.push("C-05 leading icon anatomy is missing or misplaced");
      if (!props.loading && props.iconPlacement === "trailing" && !root.querySelector(":scope > .b2b-icon.is-trailing-icon:last-child")) errors.push("C-05 trailing icon anatomy is missing or misplaced");
      if (!props.loading && props.iconPlacement === "none" && root.querySelector(":scope > .b2b-icon")) errors.push("C-05 icon-free anatomy contains an icon");
      if (root.classList.contains("is-long") !== (props.width === "long")) errors.push("C-05 long width state is out of sync");
      return errors;
    }
  });
})(window);
