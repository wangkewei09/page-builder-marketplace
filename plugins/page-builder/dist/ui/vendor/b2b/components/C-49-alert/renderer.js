(function registerAlertRenderer(global) {
  "use strict";

  var runtime = global.B2B && global.B2B.components && global.B2B.components.runtime;
  if (!runtime) throw new Error("C-49 renderer requires components/runtime/core.js");

  var variants = ["information", "success", "warning", "error"];
  var actionLayouts = ["inline", "separate", "follow"];
  var alignments = ["start", "center"];
  var kindByVariant = { information: "info", success: "success", warning: "warning", error: "error" };
  var glyphByVariant = { information: "info", success: "check_circle", warning: "error", error: "cancel" };

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-49 variant");
    runtime.assertEnum(props.actionLayout, actionLayouts, "C-49 actionLayout");
    runtime.assertEnum(props.alignment, alignments, "C-49 alignment");
    runtime.assert(typeof props.title === "string", "C-49 title must be a string");
    runtime.assert(typeof props.text === "string" && props.text.trim(), "C-49 text cannot be empty");
    runtime.assert(props.action === null || typeof props.action === "string" && props.action.trim(), "C-49 action must be null or a non-empty string");
    runtime.assert(props.icon === null || typeof props.icon === "string" && props.icon.trim(), "C-49 icon must be null or a non-empty string");
    runtime.assert(typeof props.closable === "boolean", "C-49 closable must be boolean");
    runtime.assert(props.action || props.actionLayout === "inline", "C-49 separate/follow actionLayout requires action text");
    runtime.assert(props.alignment !== "center" || !props.title.trim(), "C-49 center alignment does not support a title");
    runtime.assert(props.alignment !== "center" || props.actionLayout !== "separate", "C-49 center alignment does not support a separate action row");
  }

  function sourceProps(props) {
    return {
      kind: kindByVariant[props.variant],
      title: props.title,
      text: props.text,
      action: props.action,
      closable: props.closable,
      separate: props.actionLayout === "separate",
      follow: props.actionLayout === "follow",
      center: props.alignment === "center",
      customIcon: props.icon
    };
  }

  function bindPublicEvents(root, props) {
    var closeEventEmitted = false;
    function onClick(event) {
      var close = event.target.closest('button[aria-label="关闭"]');
      if (close && root.contains(close)) {
        global.setTimeout(function () {
          if (closeEventEmitted || !root.classList.contains("is-dismissing")) return;
          closeEventEmitted = true;
          runtime.emit(root, "b2b:alert-close", { variant: props.variant });
        }, 0);
        return;
      }
      var action = event.target.closest(".b2b-button");
      if (action && root.contains(action)) {
        runtime.emit(root, "b2b:alert-action", {
          variant: props.variant,
          action: props.action,
          actionLayout: props.actionLayout
        });
      }
    }
    root.addEventListener("click", onClick);
    return function cleanup() { root.removeEventListener("click", onClick); };
  }

  global.B2B.components.canonicalAdapter.define({
    id: "C-49",
    name: "alert",
    rawProps: true,
    styles: ["C-49-alert/styles.css", "C-02-basic-button/styles.css"],
    defaults: {
      variant: "warning",
      title: "",
      text: "This is the text prompt information.",
      action: null,
      closable: true,
      actionLayout: "inline",
      alignment: "start",
      icon: null
    },
    render: function render(props, H) {
      assertProps(props);
      return H.alertSpec(sourceProps(props));
    },
    bind: bindPublicEvents,
    update: function update() {
      runtime.assert(false, "C-49 alert does not support update(); destroy and recreate the instance");
    },
    validate: function validate(root, props) {
      var errors = [];
      var content = root.querySelector(":scope > div");
      var title = content && content.querySelector(":scope > strong");
      var text = content && content.querySelector(":scope > p");
      var icon = root.querySelector(":scope > .alert-status-icon");
      var close = root.querySelector(':scope > button[aria-label="关闭"]');
      var inlineAction = root.querySelector(":scope > div > .b2b-button");
      var footerAction = root.querySelector(":scope > div > footer .b2b-button");
      var action = inlineAction || footerAction;
      if (!root.matches(".alert-spec.source-alert")) errors.push("C-49 root must preserve alertSpec anatomy");
      if (root.getAttribute("role") !== "status") errors.push("C-49 root must preserve status role");
      if (!root.classList.contains("is-" + kindByVariant[props.variant])) errors.push("C-49 semantic class mismatch");
      if (!icon || icon.textContent.trim() !== (props.icon || glyphByVariant[props.variant])) errors.push("C-49 status icon mismatch");
      if (!content || !text || text.textContent.trim() !== props.text.trim()) errors.push("C-49 content anatomy mismatch");
      if (Boolean(title) !== Boolean(props.title.trim()) || title && title.textContent.trim() !== props.title.trim()) errors.push("C-49 title anatomy mismatch");
      if (Boolean(action) !== Boolean(props.action) || action && action.textContent.trim() !== props.action.trim()) errors.push("C-49 action anatomy mismatch");
      if (props.actionLayout === "separate" && !footerAction) errors.push("C-49 separate action must use source footer anatomy");
      if (props.actionLayout !== "separate" && footerAction) errors.push("C-49 non-separate action cannot use source footer anatomy");
      if (props.actionLayout === "follow" && !root.classList.contains("is-follow")) errors.push("C-49 follow layout class mismatch");
      if (props.actionLayout !== "follow" && root.classList.contains("is-follow")) errors.push("C-49 unexpected follow layout class");
      if (props.alignment === "center" && !root.classList.contains("is-center")) errors.push("C-49 center alignment class mismatch");
      if (props.alignment !== "center" && root.classList.contains("is-center")) errors.push("C-49 unexpected center alignment class");
      if (Boolean(close) !== props.closable) errors.push("C-49 closable anatomy mismatch");
      if (root.querySelector("a")) errors.push("C-49 production API cannot expose the source-only fixed Text link");
      return errors;
    }
  });
})(window);
