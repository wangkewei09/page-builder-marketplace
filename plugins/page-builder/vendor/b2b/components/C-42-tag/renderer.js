(function registerTagRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  if (!runtime) throw new Error("C-42 renderer requires components/runtime/core.js");

  var types = ["property", "option", "status", "avatar"];
  var sizes = ["extra-small", "small", "medium", "large"];
  var colors = ["neutral", "blue", "green", "red", "orange", "purple", "cyan", "yellow"];

  function assertProps(props) {
    runtime.assertEnum(props.type, types, "C-42 type");
    runtime.assertEnum(props.size, sizes, "C-42 size");
    runtime.assertEnum(props.color, colors, "C-42 color");
    runtime.assert(typeof props.text === "string" && props.text.trim(), "C-42 text cannot be empty");
    runtime.assert(props.icon === null || typeof props.icon === "string" && props.icon.trim(), "C-42 icon must be a non-empty string or null");
    runtime.assert(props.avatar === null || typeof props.avatar === "string" && props.avatar.trim(), "C-42 avatar must be a non-empty string or null");
    runtime.assert(!(props.checkable && props.closable), "C-42 checkable and closable are mutually exclusive");
    runtime.assert(props.checkable || !props.checked, "C-42 checked requires checkable=true");
    runtime.assert(props.type === "avatar" || props.avatar === null, "C-42 avatar content requires type=avatar");
    runtime.assert(props.type !== "avatar" || Boolean(props.avatar), "C-42 avatar type requires avatar content");
    runtime.assert(!(props.type === "avatar" && props.icon), "C-42 avatar and icon leading content are mutually exclusive");
  }

  function eventDetail(props, extra) {
    return Object.assign({ variant: props.variant, type: props.type, text: props.text }, extra || {});
  }

  function bindPublicEvents(root, props) {
    root.dataset.contractType = props.type;
    root.dataset.contractSize = props.size;
    root.setAttribute("aria-busy", String(Boolean(props.loading)));
    var checked = props.checkable ? root.getAttribute("aria-pressed") === "true" : false;
    var active = true;

    function onClick(event) {
      var close = event.target.closest("[data-source-tag-close]");
      if (close && root.contains(close) && !close.disabled) {
        runtime.emit(root, "b2b:tag-close", eventDetail(props, { source: "pointer" }));
        return;
      }
      if (!props.checkable || root.disabled) return;
      global.queueMicrotask(function () {
        if (!active) return;
        var next = root.getAttribute("aria-pressed") === "true";
        if (next === checked) return;
        checked = next;
        props.checked = checked;
        runtime.emit(root, "b2b:tag-change", eventDetail(props, { checked: checked, source: "native" }));
      });
    }

    root.addEventListener("click", onClick);
    return function cleanup() {
      active = false;
      root.removeEventListener("click", onClick);
    };
  }

  function validateAnatomy(root, props) {
    var errors = [];
    if (!root.matches(".source-tag[data-component-reference='C-42']")) errors.push("invalid C-42 source-tag root anatomy");
    if (root.tagName !== (props.checkable ? "BUTTON" : "SPAN")) errors.push("C-42 root semantics mismatch");
    if (!root.querySelector(":scope > .source-tag-label")) errors.push("C-42 lacks source label anatomy");
    if (root.querySelector(":scope > .source-tag-label") && root.querySelector(":scope > .source-tag-label").textContent !== props.text) errors.push("C-42 label is out of sync");
    [props.type, props.color, props.size].forEach(function (value) {
      if (!root.classList.contains("is-" + value)) errors.push("C-42 source class is missing: " + value);
    });
    if (root.classList.contains("is-solid") !== Boolean(props.solid)) errors.push("C-42 solid state is out of sync");
    if (root.classList.contains("is-bordered") !== Boolean(props.bordered)) errors.push("C-42 bordered state is out of sync");
    if (root.classList.contains("is-loading") !== Boolean(props.loading)) errors.push("C-42 loading state is out of sync");
    if (props.loading && !root.querySelector(":scope > .tag-spinner")) errors.push("C-42 source loading spinner is missing");
    if (props.icon && !props.loading && props.type !== "avatar" && !root.querySelector(":scope > .tag-leading-icon")) errors.push("C-42 source icon is missing");
    if (props.type === "avatar" && !props.loading && !root.querySelector(":scope > .source-avatar")) errors.push("C-42 source avatar is missing");
    if (props.closable && !root.querySelector(":scope > [data-source-tag-close]")) errors.push("C-42 source close control is missing");
    if (props.checkable && root.getAttribute("aria-pressed") !== String(Boolean(props.checked))) errors.push("C-42 checkable ARIA is out of sync");
    if (root.getAttribute("aria-busy") !== String(Boolean(props.loading))) errors.push("C-42 aria-busy is out of sync");
    return errors;
  }

  components.canonicalAdapter.define({
    id: "C-42",
    name: "tag",
    styles: ["C-42-tag/styles.css"],
    defaults: {
      type: "property",
      size: "medium",
      color: "neutral",
      text: "Tag",
      icon: null,
      avatar: null,
      closable: false,
      checkable: false,
      checked: false,
      loading: false,
      bordered: false,
      solid: false,
      disabled: false
    },
    render: function render(props, H) {
      assertProps(props);
      return H.tagSpec(props);
    },
    bind: function bind(root, props) {
      return bindPublicEvents(root, props);
    },
    update: function update() {
      runtime.assert(false, "C-42 tag does not support update(); destroy and recreate the instance");
    },
    validate: validateAnatomy
  });
})(window);
