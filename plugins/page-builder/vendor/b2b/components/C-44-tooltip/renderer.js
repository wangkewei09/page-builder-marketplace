(function registerTooltipRenderer(global) {
  "use strict";

  var runtime = global.B2B && global.B2B.components && global.B2B.components.runtime;
  if (!runtime) throw new Error("C-44 renderer requires components/runtime/core.js");

  var variants = ["top", "right", "bottom", "left", "multiline"];
  var positions = [
    "top-left", "top", "top-right",
    "right-top", "right", "right-bottom",
    "bottom-right", "bottom", "bottom-left",
    "left-bottom", "left", "left-top"
  ];

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-44 variant");
    runtime.assertEnum(props.position, positions, "C-44 position");
    runtime.assert(typeof props.text === "string" && props.text.trim(), "C-44 text cannot be empty");
    runtime.assert(typeof props.triggerText === "string" && props.triggerText.trim(), "C-44 triggerText cannot be empty");
    runtime.assert(typeof props.multiline === "boolean", "C-44 multiline must be boolean");
    runtime.assert(typeof props.max === "boolean", "C-44 max must be boolean");
    runtime.assert(props.variant !== "multiline" || props.multiline, "C-44 multiline variant requires multiline=true");
  }

  function state(root) {
    var tooltip = tooltipSurface(root);
    return {
      open: root.classList.contains("is-open"),
      placement: root.dataset.tooltipPlacement || root.dataset.tooltipPreferredPlacement,
      tooltip: tooltip
    };
  }

  function tooltipSurface(root) {
    return root.querySelector(":scope > .source-tooltip") || document.getElementById(root.dataset.tooltipSurfaceId || "");
  }

  function eventDetail(root, props, current) {
    return {
      variant: props.variant,
      position: props.position,
      placement: current.placement,
      text: props.text,
      open: current.open
    };
  }

  function bindProductionBridge(root, props) {
    root.dataset.variant = props.variant;
    var previous = state(root);
    var scheduled = false;
    var tooltip = previous.tooltip;

    function flush() {
      scheduled = false;
      var next = state(root);
      if (next.open !== previous.open) {
        runtime.emit(root, next.open ? "b2b:tooltip-open" : "b2b:tooltip-close", eventDetail(root, props, next));
      }
      previous = next;
    }

    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      global.queueMicrotask(flush);
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-tooltip-placement"] });
    if (tooltip) observer.observe(tooltip, { attributes: true, attributeFilter: ["class", "aria-hidden", "data-tooltip-placement"] });

    return function cleanup() {
      observer.disconnect();
      global.clearTimeout(root._b2bTooltipOpenTimer);
      global.clearTimeout(root._b2bTooltipCloseTimer);
      if (tooltip && tooltip.parentElement === document.body) tooltip.remove();
      delete root._b2bTooltipSurface;
    };
  }

  global.B2B.components.canonicalAdapter.define({
    id: "C-44",
    name: "tooltip",
    styles: ["C-44-tooltip/styles.css", "C-02-basic-button/styles.css"],
    defaults: {
      variant: "top",
      position: "top",
      text: "Tooltip",
      triggerText: "Hover me",
      multiline: false,
      max: false
    },
    render: function render(props, H) {
      assertProps(props);
      return H.tooltipSpec({
        position: props.position,
        text: props.text,
        trigger: H.button(props.triggerText, "", 'type="button"'),
        multiline: props.multiline,
        max: props.max
      });
    },
    bind: bindProductionBridge,
    update: function update() {
      runtime.assert(false, "C-44 tooltip does not support update(); destroy and recreate the instance");
    },
    validate: function validate(root, props) {
      var errors = [];
      var triggerRegion = root.querySelector(":scope > .tooltip-trigger-demo");
      var trigger = triggerRegion && triggerRegion.querySelector(":scope > button.b2b-button");
      var tooltip = tooltipSurface(root);
      var arrow = tooltip && tooltip.querySelector(":scope > i[aria-hidden='true']");
      var currentOpen = root.classList.contains("is-open");

      if (!root.matches(".source-tooltip-spec[data-source-tooltip]")) errors.push("C-44 root must preserve source-tooltip-spec anatomy");
      if (root.children.length !== 1 || !triggerRegion || !trigger || !tooltip || !arrow) errors.push("C-44 trigger, portal tooltip text or arrow anatomy is incomplete");
      if (tooltip && (tooltip.parentElement !== document.body || !tooltip.matches(".source-tooltip-portal[data-source-tooltip-surface]"))) errors.push("C-44 tooltip surface must use the canonical body portal");
      if (tooltip && root.dataset.tooltipSurfaceId !== tooltip.id) errors.push("C-44 portal ownership link is incomplete");
      if (trigger && trigger.innerHTML !== props.triggerText) errors.push("C-44 trigger text mismatch");
      if (tooltip && tooltip.innerHTML.indexOf(props.text) !== 0) errors.push("C-44 tooltip text mismatch");
      if (tooltip && trigger && trigger.getAttribute("aria-describedby") !== tooltip.id) errors.push("C-44 trigger aria-describedby must reference the tooltip");
      if (tooltip && tooltip.getAttribute("aria-hidden") !== String(!currentOpen)) errors.push("C-44 tooltip aria-hidden mismatch");
      if (root.dataset.tooltipPreferredPlacement !== props.position) errors.push("C-44 preferred placement mismatch");
      if (!root.classList.contains("is-" + props.position)) errors.push("C-44 source placement class mismatch");
      if (root.classList.contains("is-multiline") !== props.multiline) errors.push("C-44 multiline source class mismatch");
      if (root.classList.contains("is-max") !== props.max) errors.push("C-44 max source class mismatch");
      if (root.dataset.variant !== props.variant) errors.push("C-44 protocol variant metadata mismatch");
      return errors;
    }
  });
})(window);
