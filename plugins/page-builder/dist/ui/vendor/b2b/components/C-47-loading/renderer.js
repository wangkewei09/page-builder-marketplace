(function registerLoadingRenderer(global) {
  "use strict";
  var runtime = global.B2B.components.runtime;
  var variants = ["spinner", "spinner-only", "skeleton", "overlay"];
  var sizes = ["small", "medium", "large"];
  var layouts = ["horizontal", "vertical", "profile", "card"];
  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-47 variant");
    runtime.assertEnum(props.size, sizes, "C-47 size");
    runtime.assertEnum(props.layout, layouts, "C-47 layout");
    runtime.assert(props.text === false || typeof props.text === "string" && props.text.trim(), "C-47 text must be false or a non-empty string");
    runtime.assert(typeof props.avatar === "boolean" && typeof props.image === "boolean" && typeof props.inverse === "boolean" && typeof props.neutral === "boolean", "C-47 state props must be boolean");
    runtime.assert(props.variant === "skeleton" || ["horizontal", "vertical"].indexOf(props.layout) >= 0, "C-47 spinner/overlay layout must be horizontal or vertical");
    runtime.assert(props.variant !== "skeleton" || ["profile", "card"].indexOf(props.layout) >= 0, "C-47 skeleton layout must be profile or card");
    runtime.assert(["spinner", "spinner-only"].indexOf(props.variant) >= 0 || !props.inverse && !props.neutral, "C-47 inverse/neutral are available only on spinner/spinner-only");
  }
  global.B2B.components.canonicalAdapter.define({
    id: "C-47", name: "loading", styles: ["C-47-loading/styles.css"], interactive: false,
    defaults: { variant: "overlay", size: "medium", text: "正在更新页面内容…", layout: "vertical", avatar: true, image: false, inverse: false, neutral: false },
    render: function (props, H) { assertProps(props); return H.sourceLoading(props); },
    update: "rerender",
    validate: function (root, props) {
      var errors = []; assertProps(props);
      if (["spinner", "spinner-only"].indexOf(props.variant) >= 0 && !root.matches(".source-loading-spin[role=status]")) errors.push("C-47 spinner anatomy mismatch");
      if (props.variant === "skeleton" && !root.matches(".source-loading-skeleton[role=status]")) errors.push("C-47 skeleton anatomy mismatch");
      if (props.variant === "overlay" && !root.matches(".source-loading-overlay[role=status]")) errors.push("C-47 overlay anatomy mismatch");
      if (root.querySelectorAll("[role=status]").length) errors.push("C-47 must expose exactly one status");
      if (!(root.getAttribute("aria-label") || root.textContent.trim())) errors.push("C-47 status requires an accessible name or text");
      if (props.variant === "spinner-only" && root.textContent.trim()) errors.push("C-47 spinner-only must not render visible text");
      return errors;
    }
  });
})(window);
