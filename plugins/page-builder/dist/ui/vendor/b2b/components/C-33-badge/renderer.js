(function registerBadgeRenderer(global) {
  "use strict";
  var runtime = global.B2B.components.runtime;
  var adapter = global.B2B.components.canonicalAdapter;
  var VARIANTS = ["dot", "character", "icon", "corner"];
  var COLORS = ["red", "gray", "green", "blue", "yellow", "carmine"];
  var ICONS = ["check", "priority_high", "chat_bubble", "tag"];
  var CORNER_COLORS = { triangle: "red", rectangle: "yellow", flag: "carmine" };

  function sourceOptions(props) {
    runtime.assert(VARIANTS.indexOf(props.variant) >= 0, "C-33 badge.variant is unsupported");
    runtime.assert(COLORS.indexOf(props.color) >= 0, "C-33 badge.color is unsupported");
    runtime.assert(typeof props.text === "string", "C-33 badge.text must be a string");
    runtime.assert(typeof props.icon === "string", "C-33 badge.icon must be a string");
    runtime.assert(["triangle", "rectangle", "flag"].indexOf(props.cornerShape) >= 0, "C-33 badge.cornerShape is unsupported");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-33 badge.label must be a non-empty string");

    if (props.variant === "dot") {
      runtime.assert([6, 8, 10].indexOf(props.size) >= 0, "C-33 dot size must be 6, 8 or 10");
      runtime.assert(["fill", "inner-stroke", "fill-stroke"].indexOf(props.appearance) >= 0, "C-33 dot appearance is unsupported");
      runtime.assert(props.text === "" && props.icon === "", "C-33 dot cannot contain text or icon");
      runtime.assert(["red", "gray", "green", "blue"].indexOf(props.color) >= 0, "C-33 dot color is unsupported");
      if (props.appearance === "inner-stroke") runtime.assert(props.color === "gray", "C-33 inner-stroke is only valid for the gray dot");
    } else if (props.variant === "character") {
      runtime.assert(props.size === 14, "C-33 character requires size=14");
      runtime.assert(props.text.trim() && (props.text === "…" || Array.from(props.text).length <= 3), "C-33 character text must contain at most three characters or …");
      runtime.assert(props.icon === "", "C-33 character cannot contain an icon");
      runtime.assert(["fill", "fill-stroke", "light", "dark"].indexOf(props.appearance) >= 0, "C-33 character appearance is unsupported");
      runtime.assert(["red", "gray"].indexOf(props.color) >= 0, "C-33 character color must be red or gray");
      if (props.appearance === "light" || props.appearance === "dark") runtime.assert(props.color === "gray", "C-33 plain character requires color=gray");
    } else if (props.variant === "icon") {
      runtime.assert(props.size === 14, "C-33 icon requires size=14");
      runtime.assert(props.text === "", "C-33 icon cannot contain text");
      runtime.assert(ICONS.indexOf(props.icon) >= 0, "C-33 icon must use a canonical badge glyph");
      runtime.assert(["fill", "fill-stroke"].indexOf(props.appearance) >= 0, "C-33 icon appearance is unsupported");
      runtime.assert(["red", "gray", "green"].indexOf(props.color) >= 0, "C-33 icon color must be red, gray or green");
    } else {
      runtime.assert(props.size === 14, "C-33 corner uses its canonical native geometry and requires size=14");
      runtime.assert(props.text === "" && props.icon === "", "C-33 corner cannot contain text or icon");
      runtime.assert(props.appearance === "fill", "C-33 corner only supports fill");
      runtime.assert(props.color === CORNER_COLORS[props.cornerShape], "C-33 corner color must match its canonical shape");
    }
    return props;
  }

  adapter.define({
    id: "C-33",
    name: "badge",
    styles: ["C-33-badge/styles.css"],
    interactive: false,
    rawProps: true,
    defaults: { variant: "dot", color: "red", size: 8, text: "", icon: "", appearance: "fill", cornerShape: "triangle", label: "Unread" },
    render: function render(props, H) { return H.sourceBadge(sourceOptions(props)); },
    bind: function bind(root, props) { root.setAttribute("role", "img"); root.setAttribute("aria-label", props.label); },
    update: "rerender",
    validate: function validate(root, props) {
      var errors = [];
      sourceOptions(props);
      if (props.variant === "character" && (props.appearance === "light" || props.appearance === "dark")) {
        if (!root.matches(".badge-plain-number")) errors.push("C-33 plain character anatomy missing");
      } else if (props.variant === "corner" && !root.matches(".source-corner-badge.is-" + props.cornerShape)) errors.push("C-33 corner anatomy missing");
      else if (["dot", "character", "icon"].indexOf(props.variant) >= 0 && !root.matches(".source-badge")) errors.push("C-33 badge anatomy missing");
      if (root.getAttribute("role") !== "img" || root.getAttribute("aria-label") !== props.label) errors.push("C-33 accessible label mismatch");
      return errors;
    }
  });
})(window);
