(function registerAvatarRenderer(global) {
  "use strict";
  var runtime = global.B2B.components.runtime;
  var variants = ["image", "text", "icon", "group", "with-status", "with-text", "with-secondary-text", "with-top-badge"];
  var sizes = [24, 32, 40, 48, 64];
  var shapes = ["round", "squircle"];
  var statuses = ["online", "offline"];
  var itemKeys = ["text", "image", "fallback", "icon", "label"];
  var topBadgeKeys = ["variant", "text", "color", "appearance", "label"];
  function assertTopBadge(topBadge) {
    runtime.assert(topBadge && typeof topBadge === "object" && !Array.isArray(topBadge), "C-32 topBadge must be an object");
    var unknown = Object.keys(topBadge).filter(function (key) { return topBadgeKeys.indexOf(key) < 0; });
    runtime.assert(!unknown.length, "C-32 topBadge received unsupported fields: " + unknown.join(", "));
    runtime.assert(topBadgeKeys.every(function (key) { return Object.prototype.hasOwnProperty.call(topBadge, key); }), "C-32 topBadge must contain variant, text, color, appearance and label");
    runtime.assert(["character", "dot"].indexOf(topBadge.variant) >= 0, "C-32 topBadge.variant must be character or dot");
    runtime.assert(typeof topBadge.text === "string", "C-32 topBadge.text must be a string");
    runtime.assert(["red", "gray"].indexOf(topBadge.color) >= 0, "C-32 topBadge.color must be red or gray");
    runtime.assert(["fill", "fill-stroke"].indexOf(topBadge.appearance) >= 0, "C-32 topBadge.appearance must be fill or fill-stroke");
    runtime.assert(typeof topBadge.label === "string" && topBadge.label.trim(), "C-32 topBadge.label cannot be empty");
    if (topBadge.variant === "character") runtime.assert(topBadge.text.trim() && (topBadge.text === "…" || Array.from(topBadge.text).length <= 3), "C-32 character topBadge text must contain at most three characters or …");
    else runtime.assert(topBadge.text === "", "C-32 dot topBadge cannot contain text");
  }
  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-32 variant");
    runtime.assertEnum(props.size, sizes, "C-32 size");
    runtime.assertEnum(props.shape, shapes, "C-32 shape");
    runtime.assertEnum(props.status, statuses, "C-32 status");
    runtime.assert(typeof props.label === "string" && props.label.trim(), "C-32 label cannot be empty");
    runtime.assert(typeof props.text === "string" && typeof props.fallback === "string" && props.fallback.trim(), "C-32 text/fallback must be strings and fallback cannot be empty");
    runtime.assert(typeof props.primaryText === "string" && typeof props.secondaryText === "string", "C-32 primaryText and secondaryText must be strings");
    runtime.assert(props.image === null || typeof props.image === "string" && props.image.trim(), "C-32 image must be null or a non-empty URL string");
    runtime.assert(props.icon === null || typeof props.icon === "string" && props.icon.trim(), "C-32 icon must be null or a non-empty string");
    runtime.assert(props.topBadge === null || typeof props.topBadge === "object" && !Array.isArray(props.topBadge), "C-32 topBadge must be null or an object");
    runtime.assert(typeof props.loading === "boolean" && typeof props.expanded === "boolean", "C-32 state props must be boolean");
    runtime.assert(Array.isArray(props.items), "C-32 items must be an array");
    runtime.assert(Number.isInteger(props.maxVisible) && props.maxVisible >= 1 && props.maxVisible <= 5, "C-32 maxVisible must be 1–5");
    props.items.forEach(function (item, index) {
      runtime.assert(item && typeof item === "object" && !Array.isArray(item), "C-32 items[" + index + "] must be an object");
      var unknown = Object.keys(item).filter(function (key) { return itemKeys.indexOf(key) < 0; });
      runtime.assert(!unknown.length, "C-32 items[" + index + "] received unsupported fields: " + unknown.join(", "));
      runtime.assert(typeof item.label === "string" && item.label.trim(), "C-32 items[" + index + "].label is required");
    });
    runtime.assert(props.variant === "image" ? Boolean(props.image) : ["image", "with-top-badge"].indexOf(props.variant) >= 0 || props.image === null, "C-32 image URL is supported only by variant=image/with-top-badge and is required by image");
    runtime.assert(props.variant === "icon" ? Boolean(props.icon) : ["icon", "with-top-badge"].indexOf(props.variant) >= 0 || props.icon === null, "C-32 icon is supported only by variant=icon/with-top-badge and is required by icon");
    runtime.assert(props.variant !== "with-top-badge" || !(props.image && props.icon), "C-32 top-badge avatar cannot combine image and icon");
    runtime.assert(props.variant === "group" ? props.items.length > 0 : props.items.length === 0, "C-32 items are required only by variant=group");
    runtime.assert(props.variant !== "group" || props.shape === "round", "C-32 group supports round shape only");
    runtime.assert(props.variant !== "group" || !props.loading, "C-32 loading is not supported by variant=group");
    runtime.assert(props.variant === "with-status" || props.status === "online", "C-32 offline status requires variant=with-status");
    runtime.assert(props.variant === "group" || !props.expanded, "C-32 expanded requires variant=group");
    runtime.assert(props.variant === "with-top-badge" ? props.topBadge !== null : props.topBadge === null, "C-32 topBadge is required only by variant=with-top-badge");
    runtime.assert(props.variant !== "with-top-badge" || !props.loading, "C-32 loading is not supported by variant=with-top-badge");
    if (props.variant === "with-top-badge") assertTopBadge(props.topBadge);
    runtime.assert(["with-text", "with-secondary-text"].indexOf(props.variant) >= 0 ? Boolean(props.primaryText.trim()) : props.primaryText === "", "C-32 primaryText is required only by information-avatar variants");
    runtime.assert(props.variant === "with-secondary-text" ? Boolean(props.secondaryText.trim()) : props.secondaryText === "", "C-32 secondaryText is required only by variant=with-secondary-text");
  }
  global.B2B.components.canonicalAdapter.define({
    id: "C-32", name: "avatar", styles: ["C-32-avatar/styles.css", "C-33-badge/styles.css", "C-44-tooltip/styles.css"], rawProps: true,
    defaults: { variant: "text", text: "林", image: null, fallback: "林", icon: null, topBadge: null, primaryText: "", secondaryText: "", size: 32, label: "林七七", shape: "round", loading: false, status: "online", items: [], maxVisible: 5, expanded: false },
    render: function (props, H) { assertProps(props); return H.sourceAvatar(props); },
    bind: function (root, props) {
      function setExpanded(expanded, source) {
        var trigger = root.querySelector("[data-avatar-overflow]");
        var panel = root.querySelector(".avatar-overflow-panel");
        if (!trigger || !panel) return false;
        trigger.setAttribute("aria-expanded", String(expanded)); panel.hidden = !expanded; props.expanded = expanded;
        runtime.emit(root, "b2b:avatar-overflow-change", { expanded: expanded, hiddenCount: Math.max(0, props.items.length - props.maxVisible), source: source });
        return true;
      }
      function click(event) { var trigger = event.target.closest("[data-avatar-overflow]"); if (trigger && root.contains(trigger)) setExpanded(trigger.getAttribute("aria-expanded") !== "true", "pointer"); }
      function outsideClick(event) { if (props.expanded && !root.contains(event.target)) setExpanded(false, "outside"); }
      function keydown(event) { if (event.key === "Escape" && props.expanded) { event.preventDefault(); setExpanded(false, "keyboard"); var trigger = root.querySelector("[data-avatar-overflow]"); if (trigger) trigger.focus(); } }
      function imageError(event) {
        if (!event.target.matches("[data-avatar-image]")) return;
        var avatar = event.target.closest(".source-avatar");
        if (!avatar || avatar.classList.contains("is-fallback")) return;
        var fallback = avatar.querySelector("[data-avatar-fallback]");
        avatar.classList.add("is-fallback");
        event.target.setAttribute("aria-hidden", "true");
        if (fallback) fallback.hidden = false;
        runtime.emit(root, "b2b:avatar-fallback", { label: avatar.getAttribute("aria-label") });
      }
      root.addEventListener("click", click); root.addEventListener("keydown", keydown); root.addEventListener("error", imageError, true); document.addEventListener("click", outsideClick);
      if (props.expanded) setExpanded(true, "api");
      return function () {
        root.removeEventListener("click", click); root.removeEventListener("keydown", keydown); root.removeEventListener("error", imageError, true); document.removeEventListener("click", outsideClick);
        root.querySelectorAll("[data-source-tooltip]").forEach(function (tooltipRoot) {
          global.clearTimeout(tooltipRoot._b2bTooltipOpenTimer);
          global.clearTimeout(tooltipRoot._b2bTooltipCloseTimer);
          var surface = tooltipRoot.querySelector(":scope > .source-tooltip") || document.getElementById(tooltipRoot.dataset.tooltipSurfaceId || "");
          if (surface && surface.parentElement === document.body) surface.remove();
          delete tooltipRoot._b2bTooltipSurface;
        });
      };
    },
    update: "rerender",
    validate: function (root, props) {
      var errors = []; assertProps(props);
      if (props.variant === "group" && !root.matches(".avatar-runtime-group.source-avatar-group[role=group]")) errors.push("C-32 group anatomy mismatch");
      if (props.variant === "with-status" && !root.querySelector(":scope > .avatar-runtime-presence.is-" + props.status)) errors.push("C-32 presence anatomy mismatch");
      if (["image", "text", "icon"].indexOf(props.variant) >= 0 && !root.matches(".source-avatar")) errors.push("C-32 avatar anatomy mismatch");
      if (props.variant === "image" && !root.querySelector("[data-avatar-image]")) errors.push("C-32 image anatomy missing");
      if (props.variant === "with-top-badge") {
        var topBadge = root.querySelector(":scope > .source-badge");
        var topAvatar = root.querySelector(":scope > .source-avatar");
        if (!root.matches(".badge-avatar-host.avatar-runtime-top-badge.is-top") || !topAvatar || !topBadge) errors.push("C-32 top-badge avatar anatomy mismatch");
        if (topBadge && (topBadge.getAttribute("role") !== "img" || topBadge.getAttribute("aria-label") !== props.topBadge.label)) errors.push("C-32 top-badge accessible label mismatch");
        if (!root.style.getPropertyValue("--badge-host-size") || !root.style.getPropertyValue("--badge-anchor-inset")) errors.push("C-32 top-badge 45-degree anchor variables missing");
        if (props.image && !root.querySelector("[data-avatar-image]")) errors.push("C-32 top-badge image anatomy missing");
      }
      if (props.variant === "group") {
        var tooltipRoots = root.querySelectorAll(":scope > .source-tooltip-spec[data-source-tooltip]");
        var expectedTooltips = Math.min(props.items.length, props.maxVisible) + (props.items.length > props.maxVisible ? 1 : 0);
        if (tooltipRoots.length !== expectedTooltips) errors.push("C-32 group tooltip count mismatch");
        if (root.querySelectorAll(":scope > .source-tooltip-spec .source-avatar:not(.is-overflow)").length !== Math.min(props.items.length, props.maxVisible)) errors.push("C-32 visible group count mismatch");
        Array.from(tooltipRoots).forEach(function (tooltipRoot) {
          var trigger = tooltipRoot.querySelector(":scope > .tooltip-trigger-demo > .source-avatar");
          var surface = tooltipRoot.querySelector(":scope > .source-tooltip") || document.getElementById(tooltipRoot.dataset.tooltipSurfaceId || "");
          if (!trigger || !surface || trigger.getAttribute("aria-describedby") !== surface.id) errors.push("C-32 group tooltip anatomy mismatch");
        });
      }
      if (props.variant === "with-text") {
        var singleInfo = root.querySelector(":scope > span");
        if (!root.matches(".avatar-identity") || !root.querySelector(":scope > .source-avatar") || !singleInfo || singleInfo.textContent !== props.primaryText || singleInfo.querySelector("strong,small")) errors.push("C-32 single-line information-avatar anatomy mismatch");
      }
      if (props.variant === "with-secondary-text") {
        var doubleInfo = root.querySelector(":scope > span");
        if (!root.matches(".avatar-identity") || !root.querySelector(":scope > .source-avatar") || !doubleInfo || !doubleInfo.querySelector("strong") || !doubleInfo.querySelector("small") || doubleInfo.querySelector("strong").textContent !== props.primaryText || doubleInfo.querySelector("small").textContent !== props.secondaryText) errors.push("C-32 two-line information-avatar anatomy mismatch");
      }
      return errors;
    }
  });
})(window);
