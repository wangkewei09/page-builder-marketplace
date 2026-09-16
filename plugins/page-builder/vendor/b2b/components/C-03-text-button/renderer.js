(function registerTextButtonRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  var adapter = components && components.canonicalAdapter;
  runtime.assert(adapter, "C-03 requires components/runtime/canonical-adapter.js");
  var variants = ["Button_Text", "Button_Link", "Link"];
  var tones = ["primary", "neutral", "danger"];
  var directionalIcon = /(?:^|_)(?:arrow|chevron)(?:_|$)|^(?:navigate_next|navigate_before|first_page|last_page|east|west|north|south|north_east|north_west|south_east|south_west)$/;

  function assertNullableIcon(value, name) {
    runtime.assert(value === null || typeof value === "string" && value.trim(), "C-03 " + name + " must be null or a non-empty string");
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-03 variant");
    runtime.assertEnum(props.tone, tones, "C-03 tone");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-03 label must be a non-empty string");
    assertNullableIcon(props.leadingIcon, "leadingIcon");
    assertNullableIcon(props.trailingArrow, "trailingArrow");
    runtime.assert(props.href === null || typeof props.href === "string" && props.href.trim(), "C-03 href must be null or a non-empty string");
    runtime.assert(typeof props.disabled === "boolean", "C-03 disabled must be boolean");
    runtime.assert(!(props.leadingIcon && props.trailingArrow), "C-03 leadingIcon and trailingArrow are mutually exclusive");
    runtime.assert(!props.leadingIcon || !directionalIcon.test(props.leadingIcon), "C-03 directional icons must use trailingArrow");
    runtime.assert(!props.trailingArrow || directionalIcon.test(props.trailingArrow) || props.trailingArrow === "open_in_new", "C-03 trailingArrow only accepts a directional icon or open_in_new");
    runtime.assert(props.trailingArrow !== "open_in_new" || props.variant === "Button_Link", "C-03 open_in_new is source-defined only for Button_Link");
    runtime.assert(props.variant !== "Link" || !props.leadingIcon && !props.trailingArrow, "C-03 Link cannot include an icon");
    runtime.assert(props.variant !== "Link" || props.tone === "primary", "C-03 Link only supports primary tone");
    runtime.assert(props.variant !== "Button_Link" || props.tone === "primary", "C-03 Button_Link only supports primary tone");
    runtime.assert(props.variant === "Link" ? Boolean(props.href) : props.href === null, "C-03 href is required by Link and forbidden for button variants");
  }

  adapter.define({
    id: "C-03",
    name: "textButton",
    rawProps: true,
    interactive: false,
    styles: ["shared/base.css", "C-03-text-button/styles.css"],
    defaults: { label: "Text Button", variant: "Button_Text", tone: "primary", leadingIcon: null, trailingArrow: null, href: null, disabled: false },
    render: function render(props, H) {
      assertProps(props);
      return H.sourceTextButton(props);
    },
    bind: function bind(root, props) {
      function activate(event) {
        var control = event.target.closest("[data-text-control]");
        if (!control || !root.contains(control)) return;
        if (props.disabled) { event.preventDefault(); return; }
        runtime.emit(root, "b2b:text-activate", runtime.actionDetail("C-03", "activate", {
          label: props.label, variant: props.variant, tone: props.tone, href: props.href
        }));
      }
      function keydown(event) {
        var control = event.target.closest("a[data-text-control]");
        if (!control || event.key !== " " || props.disabled) return;
        event.preventDefault();
        control.click();
      }
      root.addEventListener("click", activate);
      root.addEventListener("keydown", keydown);
      return function cleanup() {
        root.removeEventListener("click", activate);
        root.removeEventListener("keydown", keydown);
      };
    },
    update: "rerender",
    validate: function validate(root, props) {
      var errors = [];
      var control = root.querySelector(":scope > [data-text-control]");
      if (!root.matches(".b2b-text-control-source") || !control) errors.push("C-03 canonical control anatomy is incomplete");
      if (root.getAttribute("data-text-variant") !== props.variant) errors.push("C-03 variant marker is out of sync");
      if (control && control.getAttribute("aria-disabled") !== String(props.disabled)) errors.push("C-03 disabled ARIA is out of sync");
      if (props.variant === "Link" && control && (control.tagName !== "A" || control.getAttribute("href") !== (props.disabled ? null : props.href))) errors.push("C-03 Link href anatomy is out of sync");
      if (props.leadingIcon && !control.querySelector(":scope > .b2b-icon.is-leading-icon:first-child")) errors.push("C-03 leading icon placement is incorrect");
      if (props.trailingArrow && !control.querySelector(":scope > .b2b-icon.is-trailing-arrow:last-child")) errors.push("C-03 trailing icon placement is incorrect");
      if (control && control.querySelectorAll(":scope > .b2b-icon").length > 1) errors.push("C-03 only supports one optional icon");
      return errors;
    }
  });
})(window);
