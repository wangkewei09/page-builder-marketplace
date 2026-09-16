(function registerInteractions() {
  "use strict";
  var D = window.B2BDesignSource;
  var boundInteractionRoots = new WeakSet();
  var scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : new URL("scripts/interactions.js", document.baseURI).href;

  D.iconStatus = "checking";
  D.loadMaterialSymbols = function loadMaterialSymbols() {
    var url = new URL("../../icons/material-symbols/variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2", scriptUrl).href;
    if (!("FontFace" in window)) {
      D.iconStatus = "unsupported";
      window.dispatchEvent(new CustomEvent("b2b:icon-status"));
      return;
    }
    var face = new FontFace("Material Symbols Outlined", "url(" + JSON.stringify(url) + ") format('woff2')", {
      style: "normal",
      weight: "100 700"
    });
    face.load().then(function (loadedFace) {
      document.fonts.add(loadedFace);
      D.iconStatus = "available";
      D.iconRuntime = { source: "local-variablefont", url: url, loaded: true };
      document.body.classList.add("icons-ready");
      window.dispatchEvent(new CustomEvent("b2b:icon-status"));
    }).catch(function () {
      D.iconStatus = "missing";
      D.iconRuntime = { source: "local-variablefont", url: url, loaded: false };
      window.dispatchEvent(new CustomEvent("b2b:icon-status"));
    });
  };

  var sourceToastSequence = 0;
  D.bindSourceToast = function bindSourceToast(root, options) {
    var opts = options || {};
    var owner = root;
    var viewport = null;
    if (owner.matches(".source-toast-owner")) {
      root = owner.querySelector("[data-source-toast]");
      var placement = owner.dataset.toastPlacement;
      viewport = document.body.querySelector('[data-toast-viewport="' + placement + '"]');
      if (!viewport) {
        viewport = document.createElement("div");
        viewport.className = "source-toast-viewport";
        viewport.dataset.toastViewport = placement;
        document.body.appendChild(viewport);
      }
      root.id = "c50-toast-surface-" + (++sourceToastSequence);
      owner.setAttribute("aria-owns", root.id);
      if (owner.hasAttribute("data-component-renderer")) root.setAttribute("data-component-renderer-owned", "toast");
      viewport.appendChild(root);
    }
    var hideTimer = 0;
    var pointerInside = false;
    var focusInside = false;
    var duration = Number(opts.duration || 0);
    var remaining = duration;
    var timer = 0;
    var startedAt = 0;
    var dismissed = false;

    function emit(name, detail) {
      owner.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
    }

    function clearTimer() {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    }

    function finish(reason) {
      if (dismissed) return;
      dismissed = true;
      clearTimer();
      root.classList.add("is-leaving");
      root.setAttribute("aria-hidden", "true");
      emit(reason === "close" ? "b2b:toast-close" : "b2b:toast-dismiss", { reason: reason });
      hideTimer = window.setTimeout(function () {
        if (root.isConnected) root.hidden = true;
        owner.hidden = true;
      }, 180);
    }

    function schedule() {
      clearTimer();
      if (dismissed || pointerInside || focusInside || remaining <= 0) return;
      startedAt = Date.now();
      timer = window.setTimeout(function () { finish("timeout"); }, remaining);
    }

    function pause() {
      if (!timer) return;
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
      clearTimer();
      root.dataset.toastPaused = "true";
    }

    function resume() {
      if (dismissed || duration <= 0) return;
      root.dataset.toastPaused = "false";
      schedule();
    }

    function click(event) {
      var close = event.target.closest("[data-source-toast-close]");
      if (close && root.contains(close)) {
        finish("close");
        return;
      }
      var action = event.target.closest("[data-source-toast-action]");
      if (!action || !root.contains(action)) return;
      emit("b2b:toast-action", {
        action: action.dataset.sourceToastAction,
        label: action.textContent.trim()
      });
    }

    function pointerEnter() { pointerInside = true; pause(); }
    function pointerLeave() { pointerInside = false; resume(); }
    function focusIn() { focusInside = true; pause(); }
    function focusOut(event) { if (root.contains(event.relatedTarget)) return; focusInside = false; resume(); }
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", focusOut);
    root.addEventListener("click", click);
    root.addEventListener("pointerenter", pointerEnter);
    root.addEventListener("pointerleave", pointerLeave);
    if (duration > 0) schedule();
    return function cleanupSourceToast() {
      dismissed = true;
      clearTimer();
      window.clearTimeout(hideTimer);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", focusOut);
      if (viewport) {
        root.remove();
        owner.removeAttribute("aria-owns");
        if (!viewport.children.length) viewport.remove();
      }
      root.removeEventListener("click", click);
      root.removeEventListener("pointerenter", pointerEnter);
      root.removeEventListener("pointerleave", pointerLeave);
    };
  };

  // C-48 canonical lifecycle. Isolated from C-50 and legacy specimen launch timers.
  var sourceNotificationSequence = 0;
  D.bindSourceNotification = function bindSourceNotification(owner, options) {
    var opts = options || {};
    var root = owner.matches(".source-notification-owner") ? owner.firstElementChild : owner;
    var viewport = null;
    if (root !== owner) {
      var placement = owner.dataset.notificationPlacement;
      viewport = document.body.querySelector('[data-notification-viewport="' + placement + '"]');
      if (!viewport) {
        viewport = document.createElement("div");
        viewport.className = "source-notification-viewport";
        viewport.dataset.notificationViewport = placement;
        document.body.appendChild(viewport);
      }
      root.id = "c48-notification-surface-" + (++sourceNotificationSequence);
      owner.setAttribute("aria-owns", root.id);
      viewport.appendChild(root);
    }
    root.dataset.notificationBound = "true";
    if (owner.hasAttribute("data-component-renderer")) root.setAttribute("data-component-renderer-owned", "notification");
    var previousFocus = document.activeElement;
    var dismissed = false, pointerInside = false, focusInside = false;
    var timer = 0, exitTimer = 0, entryTimer = 0, startedAt = 0;
    var duration = Number(opts.duration || 0);
    var remaining = duration;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("is-entering");
    entryTimer = window.setTimeout(function () { root.classList.remove("is-entering"); }, reducedMotion ? 0 : 400);
    function emit(name, detail) {
      owner.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: Object.assign({ variant: opts.variant }, detail) }));
    }
    function clearTimer() { window.clearTimeout(timer); timer = 0; }
    function finish(reason) {
      if (dismissed) return;
      dismissed = true;
      clearTimer();
      window.clearTimeout(entryTimer);
      root.classList.remove("is-entering");
      root.style.setProperty("--notification-height", root.getBoundingClientRect().height + "px");
      root.classList.add("is-closing");
      if (root.contains(document.activeElement) && previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
      root.setAttribute("aria-hidden", "true");
      root.inert = true;
      emit(reason === "dismiss" ? "b2b:notification-close" : "b2b:notification-dismiss", { reason: reason });
      exitTimer = window.setTimeout(function () { root.hidden = true; owner.hidden = true; }, reducedMotion ? 0 : 300);
    }
    function schedule() {
      clearTimer();
      if (dismissed || pointerInside || focusInside || duration <= 0) return;
      if (remaining <= 0) { finish("timeout"); return; }
      startedAt = Date.now();
      timer = window.setTimeout(function () { finish("timeout"); }, remaining);
    }
    function pause() {
      if (timer) remaining = Math.max(0, remaining - (Date.now() - startedAt));
      clearTimer();
    }
    function pointerEnter() { pointerInside = true; pause(); }
    function pointerLeave() { pointerInside = false; schedule(); }
    function focusIn() { focusInside = true; pause(); }
    function focusOut(event) { if (!root.contains(event.relatedTarget)) { focusInside = false; schedule(); } }
    function click(event) {
      if (dismissed) return;
      var button = event.target.closest("button");
      if (!button || !root.contains(button)) return;
      if (button.matches(".notification-close")) finish("dismiss");
      else if (button.closest("footer")) emit("b2b:notification-action", {
        action: button.classList.contains("is-primary") ? "primary" : "secondary", label: button.textContent.trim()
      });
    }
    root.addEventListener("click", click);
    root.addEventListener("pointerenter", pointerEnter);
    root.addEventListener("pointerleave", pointerLeave);
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", focusOut);
    schedule();
    return function cleanupSourceNotification() {
      dismissed = true;
      clearTimer(); window.clearTimeout(exitTimer); window.clearTimeout(entryTimer);
      root.removeEventListener("click", click);
      root.removeEventListener("pointerenter", pointerEnter);
      root.removeEventListener("pointerleave", pointerLeave);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", focusOut);
      if (viewport) {
        root.remove(); owner.removeAttribute("aria-owns");
        if (!viewport.children.length) viewport.remove();
      }
    };
  };

  D.bindInteractions = function bindInteractions(root) {
    var interactionRoot = root || document;
    if (boundInteractionRoots.has(interactionRoot)) return { bound: false, alreadyBound: true, root: interactionRoot };

    function isDirectRendererNode(node) {
      if (!node || !node.closest) return false;
      var owner = node.closest("[data-component-renderer], [data-component-renderer-owned]");
      return Boolean(owner && owner.getAttribute("data-component-interaction-source") !== "shared");
    }

    function usesSharedPopupInteraction(node) {
      if (!isDirectRendererNode(node)) return true;
      return Boolean(node && node.closest && node.closest("[data-component-renderer='dataTable']"));
    }

    function setSourceFloatingOpen(floatingRoot, open, restoreFocus, reason) {
      if (!floatingRoot) return;
      var trigger = floatingRoot.querySelector("[data-floating-toggle]");
      var children = floatingRoot.querySelector(".floating-children");
      if (!trigger || !children) return;
      floatingRoot.classList.toggle("is-expanded", open);
      trigger.setAttribute("aria-expanded", String(open));
      children.setAttribute("aria-hidden", String(!open));
      floatingRoot.dispatchEvent(new CustomEvent("b2b:source-floating-change", {
        bubbles: true,
        detail: { expanded: open, reason: reason || (open ? "open" : "close") }
      }));
      if (!open && restoreFocus) trigger.focus();
    }

    function dialogActionMessage(action) {
      if (action === "confirm") return "已确认";
      if (action === "cancel") return "已取消";
      if (action === "escape") return "已通过 ESC 关闭";
      if (action === "backdrop") return "已点击遮罩关闭";
      return "已关闭";
    }

    function syncDemoDialogClosed(dialog) {
      if (!dialog) return;
      var demo = dialog.closest(".dialog-interaction-demo");
      var trigger = demo && demo.querySelector("[data-demo-dialog-open]");
      var status = demo && demo.querySelector("[data-demo-dialog-status]");
      var action = dialog.dataset.dialogAction || "close";
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        window.setTimeout(function () { trigger.focus(); }, 0);
      }
      if (status) status.textContent = dialogActionMessage(action);
      document.body.classList.toggle("is-dialog-open", Boolean(document.querySelector("dialog[data-demo-dialog][open]")));
    }

    function closeDemoDialog(dialog, action) {
      if (!dialog || !dialog.open) return;
      dialog.dataset.dialogAction = action || "close";
      dialog.close(dialog.dataset.dialogAction);
    }

    function tooltipOppositePlacement(placement) {
      var parts = String(placement || "top").split("-");
      var opposite = { top: "bottom", bottom: "top", left: "right", right: "left" };
      parts[0] = opposite[parts[0]] || parts[0];
      return parts.join("-");
    }

    function sourceTooltipSurface(tooltipRoot) {
      if (!tooltipRoot) return null;
      if (tooltipRoot._b2bTooltipSurface && tooltipRoot._b2bTooltipSurface.isConnected) return tooltipRoot._b2bTooltipSurface;
      var surface = tooltipRoot.querySelector(":scope > .source-tooltip");
      if (!surface && tooltipRoot.dataset.tooltipSurfaceId) surface = document.getElementById(tooltipRoot.dataset.tooltipSurfaceId);
      if (surface) tooltipRoot._b2bTooltipSurface = surface;
      return surface;
    }

    function portalSourceTooltip(tooltipRoot) {
      var tooltip = sourceTooltipSurface(tooltipRoot);
      if (!tooltip) return null;
      tooltipRoot.dataset.tooltipSurfaceId = tooltip.id;
      tooltip.dataset.tooltipOwnerId = tooltip.id;
      tooltip.dataset.tooltipPlacement = tooltipRoot.dataset.tooltipPlacement || tooltipRoot.dataset.tooltipPreferredPlacement || "top";
      tooltip.classList.add("source-tooltip-portal");
      tooltip.classList.toggle("is-multiline", tooltipRoot.classList.contains("is-multiline"));
      tooltip.classList.toggle("is-max", tooltipRoot.classList.contains("is-max"));
      if (tooltip.parentElement !== document.body) document.body.appendChild(tooltip);
      return tooltip;
    }

    function sourceTooltipRootForTarget(target) {
      if (!target || !target.closest) return null;
      var root = target.closest("[data-source-tooltip]");
      if (root) return root;
      var surface = target.closest("[data-source-tooltip-surface][data-tooltip-owner-id]");
      return surface && document.querySelector('[data-source-tooltip][data-tooltip-surface-id="' + surface.dataset.tooltipOwnerId + '"]');
    }

    function sourceTooltipContains(tooltipRoot, target) {
      var surface = sourceTooltipSurface(tooltipRoot);
      return Boolean(target && (tooltipRoot.contains(target) || surface && surface.contains(target)));
    }

    function sourceTooltipCoordinates(placement, triggerRect, width, height) {
      var offset = 10;
      var primary = placement.split("-")[0];
      var left = triggerRect.left + (triggerRect.width - width) / 2;
      var top = triggerRect.top + (triggerRect.height - height) / 2;
      if (primary === "top") top = triggerRect.top - offset - height;
      if (primary === "bottom") top = triggerRect.bottom + offset;
      if (primary === "left") left = triggerRect.left - offset - width;
      if (primary === "right") left = triggerRect.right + offset;
      if (placement.indexOf("-left") > -1) left = triggerRect.left;
      if (placement.indexOf("-right") > -1) left = triggerRect.right - width;
      if (placement.indexOf("-top") > -1) top = triggerRect.top;
      if (placement.indexOf("-bottom") > -1) top = triggerRect.bottom - height;
      return { left: left, top: top };
    }

    function fitInlineSourceTooltip(tooltipRoot) {
      var tooltip = sourceTooltipSurface(tooltipRoot);
      if (!tooltip) return;
      var preferred = tooltipRoot.dataset.tooltipPreferredPlacement || "top";
      var placement = preferred;
      tooltipRoot.dataset.tooltipPlacement = placement;
      var rect = tooltip.getBoundingClientRect();
      var viewportPadding = 8;
      var primary = placement.split("-")[0];
      var lacksPrimarySpace =
        primary === "top" && rect.top < viewportPadding ||
        primary === "bottom" && rect.bottom > window.innerHeight - viewportPadding ||
        primary === "left" && rect.left < viewportPadding ||
        primary === "right" && rect.right > window.innerWidth - viewportPadding;
      if (lacksPrimarySpace) {
        placement = tooltipOppositePlacement(placement);
        tooltipRoot.dataset.tooltipPlacement = placement;
        rect = tooltip.getBoundingClientRect();
      }
      primary = placement.split("-")[0];
      if ((primary === "top" || primary === "bottom") && placement.indexOf("-") < 0) {
        if (rect.left < viewportPadding) placement += "-left";
        else if (rect.right > window.innerWidth - viewportPadding) placement += "-right";
      } else if ((primary === "left" || primary === "right") && placement.indexOf("-") < 0) {
        if (rect.top < viewportPadding) placement += "-top";
        else if (rect.bottom > window.innerHeight - viewportPadding) placement += "-bottom";
      }
      tooltipRoot.dataset.tooltipPlacement = placement;
      var trigger = tooltipRoot.querySelector(":scope > .tooltip-trigger-demo");
      var triggerRect = trigger && trigger.getBoundingClientRect();
      var rootRect = tooltipRoot.getBoundingClientRect();
      primary = placement.split("-")[0];
      if (triggerRect && (primary === "top" || primary === "bottom")) {
        var tooltipLeft = placement.indexOf("-left") > -1
          ? rootRect.left
          : placement.indexOf("-right") > -1
            ? rootRect.right - tooltip.offsetWidth
            : rootRect.left + (rootRect.width - tooltip.offsetWidth) / 2;
        tooltipRoot.style.setProperty("--tooltip-arrow-x", triggerRect.left + triggerRect.width / 2 - tooltipLeft - 6 + "px");
        tooltipRoot.style.removeProperty("--tooltip-arrow-y");
      } else if (triggerRect) {
        var tooltipTop = placement.indexOf("-top") > -1
          ? rootRect.top
          : placement.indexOf("-bottom") > -1
            ? rootRect.bottom - tooltip.offsetHeight
            : rootRect.top + (rootRect.height - tooltip.offsetHeight) / 2;
        tooltipRoot.style.setProperty("--tooltip-arrow-y", triggerRect.top + triggerRect.height / 2 - tooltipTop - 6 + "px");
        tooltipRoot.style.removeProperty("--tooltip-arrow-x");
      }
    }

    function fitSourceTooltip(tooltipRoot) {
      if (!tooltipRoot) return;
      if (!isDirectRendererNode(tooltipRoot)) {
        fitInlineSourceTooltip(tooltipRoot);
        return;
      }
      var tooltip = portalSourceTooltip(tooltipRoot);
      if (!tooltip) return;
      var trigger = tooltipRoot.querySelector(":scope > .tooltip-trigger-demo");
      var triggerRect = trigger && trigger.getBoundingClientRect();
      if (!triggerRect) return;
      var preferred = tooltipRoot.dataset.tooltipPreferredPlacement || "top";
      var placement = preferred;
      tooltipRoot.dataset.tooltipPlacement = placement;
      tooltip.dataset.tooltipPlacement = placement;
      var width = tooltip.offsetWidth;
      var height = tooltip.offsetHeight;
      var coordinates = sourceTooltipCoordinates(placement, triggerRect, width, height);
      var viewportPadding = 8;
      var primary = placement.split("-")[0];
      var lacksPrimarySpace =
        primary === "top" && coordinates.top < viewportPadding ||
        primary === "bottom" && coordinates.top + height > window.innerHeight - viewportPadding ||
        primary === "left" && coordinates.left < viewportPadding ||
        primary === "right" && coordinates.left + width > window.innerWidth - viewportPadding;
      if (lacksPrimarySpace) {
        placement = tooltipOppositePlacement(placement);
        tooltipRoot.dataset.tooltipPlacement = placement;
        tooltip.dataset.tooltipPlacement = placement;
        coordinates = sourceTooltipCoordinates(placement, triggerRect, width, height);
      }
      primary = placement.split("-")[0];
      if ((primary === "top" || primary === "bottom") && placement.indexOf("-") < 0) {
        if (coordinates.left < viewportPadding) placement += "-left";
        else if (coordinates.left + width > window.innerWidth - viewportPadding) placement += "-right";
      } else if ((primary === "left" || primary === "right") && placement.indexOf("-") < 0) {
        if (coordinates.top < viewportPadding) placement += "-top";
        else if (coordinates.top + height > window.innerHeight - viewportPadding) placement += "-bottom";
      }
      tooltipRoot.dataset.tooltipPlacement = placement;
      tooltip.dataset.tooltipPlacement = placement;
      coordinates = sourceTooltipCoordinates(placement, triggerRect, width, height);
      coordinates.left = Math.max(viewportPadding, Math.min(coordinates.left, window.innerWidth - viewportPadding - width));
      coordinates.top = Math.max(viewportPadding, Math.min(coordinates.top, window.innerHeight - viewportPadding - height));
      tooltip.style.left = Math.round(coordinates.left) + "px";
      tooltip.style.top = Math.round(coordinates.top) + "px";
      primary = placement.split("-")[0];
      if (primary === "top" || primary === "bottom") {
        tooltip.style.setProperty("--tooltip-arrow-x", Math.max(4, Math.min(width - 16, triggerRect.left + triggerRect.width / 2 - coordinates.left - 6)) + "px");
        tooltip.style.removeProperty("--tooltip-arrow-y");
      } else {
        tooltip.style.setProperty("--tooltip-arrow-y", Math.max(4, Math.min(height - 16, triggerRect.top + triggerRect.height / 2 - coordinates.top - 6)) + "px");
        tooltip.style.removeProperty("--tooltip-arrow-x");
      }
    }

    function setSourceTooltipOpen(tooltipRoot, open) {
      if (!tooltipRoot) return;
      window.clearTimeout(tooltipRoot._b2bTooltipOpenTimer);
      window.clearTimeout(tooltipRoot._b2bTooltipCloseTimer);
      var tooltip = sourceTooltipSurface(tooltipRoot);
      if (open) fitSourceTooltip(tooltipRoot);
      else {
        tooltipRoot.dataset.tooltipPlacement = tooltipRoot.dataset.tooltipPreferredPlacement || "top";
        if (tooltip) tooltip.dataset.tooltipPlacement = tooltipRoot.dataset.tooltipPlacement;
      }
      tooltipRoot.classList.toggle("is-open", open);
      if (tooltip) {
        tooltip.classList.toggle("is-open", open);
        tooltip.setAttribute("aria-hidden", String(!open));
      }
    }

    function scheduleSourceTooltip(tooltipRoot, open) {
      if (!tooltipRoot) return;
      window.clearTimeout(tooltipRoot._b2bTooltipOpenTimer);
      window.clearTimeout(tooltipRoot._b2bTooltipCloseTimer);
      var timerName = open ? "_b2bTooltipOpenTimer" : "_b2bTooltipCloseTimer";
      tooltipRoot[timerName] = window.setTimeout(function () {
        setSourceTooltipOpen(tooltipRoot, open);
      }, 100);
    }

    function initializeSourceTooltips(scope) {
      var currentScope = scope || interactionRoot;
      document.body.querySelectorAll(":scope > [data-source-tooltip-surface][data-tooltip-owner-id]").forEach(function (tooltip) {
        if (!document.querySelector('[data-source-tooltip][data-tooltip-surface-id="' + tooltip.dataset.tooltipOwnerId + '"]')) tooltip.remove();
      });
      var tooltipRoots = currentScope.matches && currentScope.matches("[data-source-tooltip]")
        ? [currentScope].concat(Array.from(currentScope.querySelectorAll("[data-source-tooltip]")))
        : Array.from(currentScope.querySelectorAll("[data-source-tooltip]"));
      tooltipRoots.forEach(function (tooltipRoot) {
        var tooltip = isDirectRendererNode(tooltipRoot) ? portalSourceTooltip(tooltipRoot) : sourceTooltipSurface(tooltipRoot);
        if (!tooltip) return;
        tooltipRoot.dataset.tooltipPreferredPlacement = tooltipRoot.dataset.tooltipPreferredPlacement || tooltipRoot.dataset.tooltipPlacement || "top";
        tooltip.setAttribute("aria-hidden", String(!tooltipRoot.classList.contains("is-open")));
      });
    }

    function syncOpenSourceTooltips() {
      interactionRoot.querySelectorAll("[data-source-tooltip].is-open").forEach(function (tooltipRoot) {
        if (isDirectRendererNode(tooltipRoot)) fitSourceTooltip(tooltipRoot);
      });
    }

    function updateTagDemo(tagDemo, message) {
      if (!tagDemo) return;
      var tags = tagDemo.querySelectorAll("[data-tag-list] > .source-tag");
      var feedback = tagDemo.querySelector("[data-tag-feedback]");
      var addButton = tagDemo.querySelector("[data-source-tag-add]");
      if (feedback) feedback.textContent = message || "已选择 " + tags.length + " 个标签";
      if (addButton) addButton.disabled = tags.length >= 6;
    }

    function createManagedTag(text, color) {
      var tag = document.createElement("span");
      tag.className = "source-tag is-option is-" + color + " is-medium is-entering";
      tag.setAttribute("data-component-reference", "C-42");
      var label = document.createElement("span");
      label.className = "source-tag-label";
      label.textContent = text;
      var close = document.createElement("button");
      close.type = "button";
      close.setAttribute("data-source-tag-close", "");
      close.setAttribute("aria-label", "移除 " + text);
      close.innerHTML = '<span class="b2b-icon" aria-hidden="true">close</span>';
      tag.appendChild(label);
      tag.appendChild(close);
      return tag;
    }

    function visualizationTooltip(mark) {
      var visualization = mark && mark.closest("[data-viz-spec]");
      return visualization && visualization.querySelector(".viz-tooltip");
    }

    function showVisualizationTooltip(mark, pinned) {
      var visualization = mark && mark.closest("[data-viz-spec]");
      var tooltip = visualizationTooltip(mark);
      if (!visualization || !tooltip) return;
      var markRect = mark.getBoundingClientRect();
      var visualizationRect = visualization.getBoundingClientRect();
      var label = tooltip.querySelector("[data-viz-tooltip-label]");
      if (label) label.textContent = mark.getAttribute("aria-label") || "数据标记";
      tooltip.style.left = markRect.left + markRect.width / 2 - visualizationRect.left + "px";
      tooltip.style.top = markRect.top + markRect.height / 2 - visualizationRect.top + "px";
      tooltip.hidden = false;
      tooltip.dataset.pinned = pinned ? "true" : "false";
      mark.classList.add("is-hovered");
    }

    function hideVisualizationTooltip(mark, force) {
      var tooltip = visualizationTooltip(mark);
      if (!tooltip || !force && tooltip.dataset.pinned === "true") return;
      tooltip.hidden = true;
      tooltip.dataset.pinned = "false";
      if (mark) mark.classList.remove("is-hovered");
    }

    function selectVisualizationMark(mark) {
      var visualization = mark && mark.closest("[data-viz-spec]");
      if (!visualization) return;
      var wasSelected = mark.classList.contains("is-selected");
      visualization.querySelectorAll("[data-chart-mark]").forEach(function (item) {
        var selected = !wasSelected && item === mark;
        item.classList.toggle("is-selected", selected);
        item.classList.toggle("is-dimmed", !wasSelected && item !== mark && !item.classList.contains("is-series-hidden"));
        item.setAttribute("aria-pressed", String(selected));
      });
      if (wasSelected) hideVisualizationTooltip(mark, true);
      else showVisualizationTooltip(mark, true);
      visualization.dispatchEvent(new CustomEvent("b2b:visualization-mark-select", { bubbles: true, detail: { label: mark.getAttribute("aria-label") || "", selected: !wasSelected } }));
    }

    function toggleVisualizationLegend(legendItem) {
      var visualization = legendItem && legendItem.closest("[data-viz-spec]");
      if (!visualization) return;
      var series = legendItem.dataset.chartLegend;
      var hidden = !legendItem.classList.contains("is-hidden");
      var hidSelectedMark = false;
      legendItem.classList.toggle("is-hidden", hidden);
      legendItem.setAttribute("aria-pressed", String(!hidden));
      visualization.querySelectorAll('[data-series="' + series + '"]').forEach(function (mark) {
        if (hidden && mark.classList.contains("is-selected")) {
          hidSelectedMark = true;
          hideVisualizationTooltip(mark, true);
        }
        mark.classList.toggle("is-series-hidden", hidden);
        mark.setAttribute("aria-hidden", String(hidden));
        if (hidden) {
          mark.classList.remove("is-selected", "is-hovered", "is-dimmed");
          mark.setAttribute("aria-pressed", "false");
        }
      });
      if (hidSelectedMark) visualization.querySelectorAll("[data-chart-mark]").forEach(function (mark) { mark.classList.remove("is-dimmed"); });
      visualization.dispatchEvent(new CustomEvent("b2b:visualization-legend-toggle", { bubbles: true, detail: { series: series, visible: !hidden } }));
    }

    function updateCheckboxControl(input) {
      if (!input) return;
      input.setAttribute("aria-checked", input.indeterminate ? "mixed" : String(input.checked));
    }

    function tableDataRows(tableRoot) {
      return tableRoot ? Array.from(tableRoot.querySelectorAll("tbody > tr[data-table-data-row]")) : [];
    }

    function syncTableSelection(tableRoot) {
      if (!tableRoot) return;
      var rows = tableDataRows(tableRoot);
      var visibleRows = rows.filter(function (row) { return !row.hidden; });
      var rowInputs = rows.map(function (row) { return row.querySelector("[data-demo-row-select]"); }).filter(Boolean);
      var visibleInputs = visibleRows.map(function (row) { return row.querySelector("[data-demo-row-select]"); }).filter(Boolean);
      var selectedInputs = rowInputs.filter(function (input) { return input.checked; });
      rows.forEach(function (row) {
        var input = row.querySelector("[data-demo-row-select]");
        if (!input) return;
        row.classList.toggle("is-selected", input.checked);
        if (row.hasAttribute("aria-selected")) row.setAttribute("aria-selected", String(input.checked));
        updateCheckboxControl(input);
      });
      var selectAll = tableRoot.querySelector("thead [data-demo-select-all]");
      if (selectAll) {
        var visibleSelected = visibleInputs.filter(function (input) { return input.checked; }).length;
        selectAll.checked = visibleInputs.length > 0 && visibleSelected === visibleInputs.length;
        selectAll.indeterminate = visibleSelected > 0 && visibleSelected < visibleInputs.length;
        if (selectAll.indeterminate) selectAll.setAttribute("data-indeterminate", "true");
        else selectAll.removeAttribute("data-indeterminate");
        updateCheckboxControl(selectAll);
      }
      var batch = tableRoot.querySelector("[data-demo-batch]");
      if (batch) {
        var batchVisible = selectedInputs.length > 0;
        batch.classList.toggle("is-visible", batchVisible);
        batch.setAttribute("aria-hidden", String(!batchVisible));
        var count = batch.querySelector("[data-demo-batch-count]");
        if (count) count.textContent = String(selectedInputs.length);
      }
      var toolbar = tableRoot.querySelector("[data-table-toolbar]");
      if (toolbar) {
        var selectionMode = selectedInputs.length > 0;
        toolbar.classList.toggle("is-selection-mode", selectionMode);
        var search = toolbar.querySelector("[data-table-toolbar-search]");
        if (search) search.hidden = false;
      }
    }

    function tableEditValues(row) {
      return Array.from(row.querySelectorAll("[data-table-edit-input]")).reduce(function (result, input) {
        result[input.dataset.tableColumnKey] = input.value;
        return result;
      }, {});
    }

    function beginTableEdit(trigger, source) {
      var row = trigger && trigger.closest("[data-table-editable-row]");
      var tableRoot = row && row.closest("[data-table-demo]");
      if (!row || !tableRoot || row.dataset.tableEditing === "true") return;
      var active = tableRoot.querySelector("[data-table-editable-row][data-table-editing='true']");
      if (active && active !== row) finishTableEdit(active, true, "switch", false);
      row.dataset.tableEditing = "true";
      row._b2bTableEditRestoreTarget = trigger;
      row.classList.add("is-editing");
      row.querySelectorAll("[data-table-edit-input]").forEach(function (input) {
        input.dataset.tableEditOriginal = input.value;
        var slot = input.closest("[data-table-edit-input-slot]");
        if (slot) slot.hidden = false;
        input.hidden = false;
        input.removeAttribute("aria-hidden");
      });
      row.querySelectorAll("[data-table-edit-value]").forEach(function (value) { value.hidden = true; });
      var idle = row.querySelector("[data-table-edit-idle]");
      var activeActions = row.querySelector("[data-table-edit-active]");
      if (idle) idle.hidden = true;
      if (activeActions) activeActions.hidden = false;
      var first = row.querySelector("[data-table-edit-input]");
      if (first) { first.focus(); first.select(); }
      tableRoot.dispatchEvent(new CustomEvent("b2b:table-edit-start", { bubbles: true, detail: { rowId: row.dataset.tableRowId, values: tableEditValues(row), source: source || "pointer" } }));
    }

    D.beginTableEdit = beginTableEdit;

    function finishTableEdit(row, commit, source, restoreFocus) {
      var tableRoot = row && row.closest("[data-table-demo]");
      if (!row || !tableRoot || row.dataset.tableEditing !== "true") return;
      var changes = {};
      row.querySelectorAll("[data-table-edit-input]").forEach(function (input) {
        var value = commit ? input.value : input.dataset.tableEditOriginal;
        if (!commit) input.value = value;
        var cell = input.closest("td");
        var display = cell && cell.querySelector("[data-table-edit-value]");
        if (commit && display) display.textContent = value;
        if (commit) row.setAttribute("data-sort-" + input.dataset.tableColumnKey, value);
        if (display) display.hidden = false;
        input.hidden = true;
        input.setAttribute("aria-hidden", "true");
        var slot = input.closest("[data-table-edit-input-slot]");
        if (slot) slot.hidden = true;
        changes[input.dataset.tableColumnKey] = value;
      });
      var idle = row.querySelector("[data-table-edit-idle]");
      var activeActions = row.querySelector("[data-table-edit-active]");
      if (idle) idle.hidden = false;
      if (activeActions) activeActions.hidden = true;
      row.classList.remove("is-editing");
      delete row.dataset.tableEditing;
      var eventName = commit ? "b2b:table-edit-commit" : "b2b:table-edit-cancel";
      tableRoot.dispatchEvent(new CustomEvent(eventName, { bubbles: true, detail: { rowId: row.dataset.tableRowId, values: changes, source: source } }));
      var restoreTarget = row._b2bTableEditRestoreTarget;
      delete row._b2bTableEditRestoreTarget;
      if (restoreFocus !== false) {
        if (!restoreTarget || !restoreTarget.isConnected) restoreTarget = row.querySelector("[data-table-edit-start]");
        if (restoreTarget && typeof restoreTarget.focus === "function") restoreTarget.focus();
      }
    }

    function sortTableByButton(sortButton) {
      var tableRoot = sortButton && sortButton.closest("[data-table-demo]");
      var table = sortButton && sortButton.closest("table");
      var tbody = table && table.querySelector("tbody");
      var activeHeader = sortButton && sortButton.closest("th");
      if (!tableRoot || !tbody || !activeHeader) return;
      var current = activeHeader.getAttribute("aria-sort") || "none";
      var next = current === "none" ? "ascending" : current === "ascending" ? "descending" : "none";
      table.querySelectorAll("th[aria-sort]").forEach(function (header) {
        var headerDirection = header === activeHeader ? next : "none";
        header.setAttribute("aria-sort", headerDirection);
        var headerButton = header.querySelector("[data-table-sort]");
        if (headerButton) {
          var headerLabel = headerButton.dataset.sortLabel || "";
          var headerHint = headerDirection === "none" ? "点击升序" : headerDirection === "ascending" ? "点击降序" : "恢复默认排序";
          headerButton.title = headerHint;
          headerButton.setAttribute("aria-label", headerLabel + "，" + headerHint);
        }
      });
      var key = sortButton.dataset.tableSort;
      var groups = tableDataRows(tableRoot).map(function (row) {
        var expanded = row.nextElementSibling && row.nextElementSibling.classList.contains("table-expanded-row") ? row.nextElementSibling : null;
        return { row: row, expanded: expanded };
      });
      var fixedRows = Array.from(tbody.querySelectorAll(":scope > tr:not([data-table-data-row]):not(.table-expanded-row)"));
      function compareGroups(groupA, groupB) {
        if (next === "none") return Number(groupA.row.dataset.tableOriginalIndex) - Number(groupB.row.dataset.tableOriginalIndex);
        var valueA = groupA.row.getAttribute("data-sort-" + key) || "";
        var valueB = groupB.row.getAttribute("data-sort-" + key) || "";
        var numberA = Number(valueA);
        var numberB = Number(valueB);
        var comparison = Number.isFinite(numberA) && Number.isFinite(numberB)
          ? numberA - numberB
          : valueA.localeCompare(valueB, "zh-CN", { numeric: true, sensitivity: "base" });
        return next === "descending" ? -comparison : comparison;
      }
      function appendGroup(group) {
        tbody.appendChild(group.row);
        if (group.expanded) tbody.appendChild(group.expanded);
      }
      if (tableRoot.classList.contains("is-tree-table")) {
        var treeGroups = groups.reduce(function (result, group) {
          var parent = group.row.dataset.treeParent || "__root__";
          result[parent] = result[parent] || [];
          result[parent].push(group);
          return result;
        }, {});
        function appendTree(parentKey) {
          (treeGroups[parentKey] || []).sort(compareGroups).forEach(function (group) {
            appendGroup(group);
            appendTree(group.row.dataset.treeKey);
          });
        }
        appendTree("__root__");
      } else if (fixedRows.some(function (row) { return row.hasAttribute("data-table-group-row"); })) {
        fixedRows.forEach(function (header) {
          tbody.appendChild(header);
          groups.filter(function (group) { return group.row.dataset.tableGroup === header.dataset.tableGroup; }).sort(compareGroups).forEach(appendGroup);
        });
      } else {
        groups.sort(compareGroups).forEach(appendGroup);
        fixedRows.forEach(function (row) { tbody.appendChild(row); });
      }
      var live = tableRoot.querySelector("[data-table-live]");
      var sortLabel = (sortButton.getAttribute("aria-label") || "").replace(/^按/, "").replace(/排序$/, "") || key;
      if (live) live.textContent = next === "none" ? "已恢复默认排序" : "已按" + sortLabel + (next === "ascending" ? "升序" : "降序") + "排列";
      tableRoot.dispatchEvent(new CustomEvent("b2b:table-sort-change", { bubbles: true, detail: { key: key, direction: next } }));
    }

    function filterTableRows(source) {
      var tableRoot = source && (source.matches && source.matches("[data-table-demo]") ? source : source.closest("[data-table-demo]"));
      if (!tableRoot) return;
      var searchInput = tableRoot.querySelector("[data-table-search]");
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var activeFilters = Array.from(tableRoot.querySelectorAll("[data-table-filter-option][data-filter-committed='true']")).map(function (option) {
        return { key: option.dataset.filterKey, value: option.dataset.filterValue };
      }).filter(function (filter) { return Boolean(filter.value); });
      var filtersByKey = activeFilters.reduce(function (result, filter) {
        result[filter.key] = result[filter.key] || [];
        result[filter.key].push(filter.value);
        return result;
      }, {});
      var visibleCount = 0;
      tableDataRows(tableRoot).forEach(function (row) {
        var matchesSearch = !query || row.textContent.toLowerCase().indexOf(query) >= 0;
        var matchesColumns = Object.keys(filtersByKey).every(function (key) {
          return filtersByKey[key].indexOf(row.getAttribute("data-sort-" + key) || "") >= 0;
        });
        var groupHeader = row.dataset.tableGroup && Array.from(tableRoot.querySelectorAll("[data-table-group-row]")).find(function (header) { return header.dataset.tableGroup === row.dataset.tableGroup; });
        var groupToggle = groupHeader && groupHeader.querySelector("[data-table-group-toggle]");
        var groupExpanded = !groupToggle || groupToggle.getAttribute("aria-expanded") === "true";
        var matches = matchesSearch && matchesColumns && groupExpanded;
        row.hidden = !matches;
        if (matches) visibleCount += 1;
        var expanded = row.nextElementSibling;
        var expandButton = row.querySelector("[data-table-expand]");
        if (expanded && expanded.classList.contains("table-expanded-row")) expanded.hidden = !matches || !expandButton || expandButton.getAttribute("aria-expanded") !== "true";
      });
      var noResults = tableRoot.querySelector(".table-no-results");
      if (noResults) noResults.hidden = visibleCount > 0;
      syncTableSelection(tableRoot);
      var live = tableRoot.querySelector("[data-table-live]");
      if (live) live.textContent = query || activeFilters.length ? "找到 " + visibleCount + " 条匹配记录" : "已显示全部记录";
      tableRoot.dispatchEvent(new CustomEvent("b2b:table-filter-change", { bubbles: true, detail: { query: query, filters: activeFilters, count: visibleCount } }));
    }

    function resetTableFilter(popupRoot) {
      var tableRoot = popupRoot && popupRoot.closest("[data-table-demo]");
      if (!popupRoot || !tableRoot) return;
      popupRoot.querySelectorAll("[data-table-filter-option]").forEach(function (option) {
        option.checked = false;
        option.removeAttribute("data-filter-committed");
        updateCheckboxControl(option);
      });
      popupRoot.classList.remove("is-filtered");
      filterTableRows(tableRoot);
    }

    function confirmTableFilter(popupRoot) {
      var tableRoot = popupRoot && popupRoot.closest("[data-table-demo]");
      if (!popupRoot || !tableRoot) return;
      var hasSelection = false;
      popupRoot.querySelectorAll("[data-table-filter-option]").forEach(function (option) {
        if (option.checked) {
          option.setAttribute("data-filter-committed", "true");
          hasSelection = true;
        } else {
          option.removeAttribute("data-filter-committed");
        }
        updateCheckboxControl(option);
      });
      popupRoot.classList.toggle("is-filtered", hasSelection);
      filterTableRows(tableRoot);
    }

    function syncTableTreeRows(tableRoot) {
      if (!tableRoot) return;
      var rows = Array.from(tableRoot.querySelectorAll("[data-table-tree-row]"));
      var rowByKey = rows.reduce(function (result, row) {
        result[row.dataset.treeKey] = row;
        return result;
      }, {});
      rows.forEach(function (row) {
        var parentKey = row.dataset.treeParent;
        var visible = true;
        while (parentKey) {
          var parentRow = rowByKey[parentKey];
          var parentToggle = parentRow && parentRow.querySelector("[data-tree-expand]");
          if (!parentRow || !parentToggle || parentToggle.getAttribute("aria-expanded") !== "true") {
            visible = false;
            break;
          }
          parentKey = parentRow.dataset.treeParent;
        }
        row.hidden = !visible;
      });
    }

    function toggleTableTreeRow(expandButton) {
      var tableRoot = expandButton && expandButton.closest("[data-table-demo]");
      var row = expandButton && expandButton.closest("[data-table-tree-row]");
      if (!tableRoot || !row) return;
      var expanded = expandButton.getAttribute("aria-expanded") !== "true";
      expandButton.setAttribute("aria-expanded", String(expanded));
      var expandIcon = expandButton.querySelector(".b2b-icon");
      if (expandIcon) expandIcon.textContent = expanded ? "arrow_drop_down" : "arrow_right";
      var rowLabel = row.dataset.tableRowLabel || "子项";
      expandButton.setAttribute("aria-label", (expanded ? "收起 " : "展开 ") + rowLabel);
      syncTableTreeRows(tableRoot);
      var live = tableRoot.querySelector("[data-table-live]");
      if (live) live.textContent = rowLabel + (expanded ? " 已展开" : " 已收起");
    }

    function toggleTableGroup(groupButton) {
      var tableRoot = groupButton && groupButton.closest("[data-table-demo]");
      var group = groupButton && groupButton.dataset.tableGroup;
      if (!tableRoot || !group) return;
      var expanded = groupButton.getAttribute("aria-expanded") !== "true";
      groupButton.setAttribute("aria-expanded", String(expanded));
      groupButton.setAttribute("aria-label", (expanded ? "收起分组 " : "展开分组 ") + group);
      var icon = groupButton.querySelector(".b2b-icon");
      if (icon) icon.textContent = expanded ? "arrow_drop_down" : "arrow_right";
      tableDataRows(tableRoot).forEach(function (row) {
        if (row.dataset.tableGroup === group) row.hidden = !expanded;
      });
      syncTableSelection(tableRoot);
      var live = tableRoot.querySelector("[data-table-live]");
      if (live) live.textContent = group + (expanded ? " 已展开" : " 已收起");
    }

    function syncFixedTableScrollState(scrollRoot) {
      if (!scrollRoot || !scrollRoot.matches("[data-table-fixed-scroll]")) return;
      var maxScrollLeft = Math.max(0, scrollRoot.scrollWidth - scrollRoot.clientWidth);
      var scrolledFromLeft = scrollRoot.scrollLeft > 1;
      var hasMoreToRight = scrollRoot.scrollLeft < maxScrollLeft - 1;
      var viewport = scrollRoot.closest("[data-table-fixed-viewport]");
      scrollRoot.classList.toggle("is-scrolled-from-left", scrolledFromLeft);
      scrollRoot.classList.toggle("has-more-to-right", hasMoreToRight);
      if (viewport) {
        viewport.classList.toggle("is-scrolled-from-left", scrolledFromLeft);
        viewport.classList.toggle("has-more-to-right", hasMoreToRight);
        viewport.style.setProperty("--table-vertical-scrollbar-width", Math.max(0, scrollRoot.offsetWidth - scrollRoot.clientWidth) + "px");
        viewport.style.setProperty("--table-horizontal-scrollbar-height", Math.max(0, scrollRoot.offsetHeight - scrollRoot.clientHeight) + "px");
      }
    }

    function setBreadcrumbMoreOpen(more, open, focusFirst, reason) {
      if (!more) return;
      var trigger = more.querySelector(":scope > button");
      var history = more.querySelector(".breadcrumb-history");
      window.clearTimeout(more._b2bBreadcrumbCloseTimer);
      more.classList.toggle("is-open", open);
      if (open && reason) more._b2bBreadcrumbOpenReason = reason;
      if (!open) delete more._b2bBreadcrumbOpenReason;
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
      if (history) history.hidden = !open;
      if (open) {
        interactionRoot.querySelectorAll("[data-breadcrumb-more].is-open").forEach(function (other) {
          if (other !== more) setBreadcrumbMoreOpen(other, false, false);
        });
      }
      if (open && focusFirst && history) {
        var firstItem = history.querySelector("[role='menuitem']");
        if (firstItem) firstItem.focus();
      }
    }

    function navigateBreadcrumb(target, explicitLabel) {
      if (!target) return;
      var breadcrumb = target.closest("[data-breadcrumb]");
      if (!breadcrumb) return;
      var label = explicitLabel || target.dataset.breadcrumbLabel || target.textContent.trim();
      var isHistoryItem = target.matches(".breadcrumb-history [role='menuitem']");
      if (isHistoryItem) {
        var rootLink = breadcrumb.querySelector(":scope > .breadcrumb-link");
        Array.from(breadcrumb.children).forEach(function (child) {
          if (!child.classList.contains("breadcrumb-live")) child.remove();
        });
        if (rootLink && rootLink.textContent.trim() !== label) {
          breadcrumb.insertBefore(rootLink, breadcrumb.firstChild);
          var separator = document.createElement("span");
          separator.className = "b2b-icon breadcrumb-separator";
          separator.setAttribute("aria-hidden", "true");
          separator.textContent = "chevron_right";
          breadcrumb.insertBefore(separator, breadcrumb.querySelector(".breadcrumb-live"));
        }
        var historyCurrent = document.createElement("span");
        historyCurrent.className = "breadcrumb-current";
        historyCurrent.setAttribute("aria-current", "page");
        historyCurrent.title = label;
        historyCurrent.textContent = label;
        breadcrumb.insertBefore(historyCurrent, breadcrumb.querySelector(".breadcrumb-live"));
      } else {
        var breadcrumbNode = target.closest(".breadcrumb-tooltip-anchor") || target;
        var reachedTarget = false;
        Array.from(breadcrumb.children).forEach(function (child) {
          if (child === breadcrumbNode) {
            reachedTarget = true;
            return;
          }
          if (reachedTarget && !child.classList.contains("breadcrumb-live")) child.remove();
        });
        var current = document.createElement("span");
        current.className = "breadcrumb-current";
        current.setAttribute("aria-current", "page");
        current.title = label;
        current.textContent = label;
        breadcrumbNode.replaceWith(current);
      }
      breadcrumb.dataset.currentLabel = label;
      var live = breadcrumb.querySelector(".breadcrumb-live");
      if (live) live.textContent = "已导航到 " + label;
      breadcrumb.dispatchEvent(new CustomEvent("b2b:breadcrumb-navigate", { bubbles: true, detail: { label: label } }));
    }

    function renderCheckboxPicker(picker) {
      if (!picker) return;
      var inputs = Array.from(picker.querySelectorAll("[data-checkbox-picker-value]"));
      var selected = inputs.filter(function (input) { return input.checked; });
      var results = picker.querySelector("[data-checkbox-picker-results]");
      var count = picker.querySelector("[data-checkbox-picker-count]");
      if (count) count.textContent = "Selected (" + selected.length + ")";
      if (!results) return;
      results.innerHTML = selected.map(function (input, index) {
        var value = input.dataset.checkboxPickerValue;
        var label = input.closest(".checkbox-spec").querySelector(".checkbox-copy > span").textContent;
        return '<p data-picker-result="' + value + '">' + label + '<button type="button" data-checkbox-picker-remove="' + value + '" aria-label="移除第 ' + (index + 1) + ' 个 ' + label + '">×</button></p>';
      }).join("") || '<p class="checkbox-picker-empty">No selected members</p>';
    }

    function syncCheckboxGroup(group, changedInput) {
      if (!group) return;
      var allInput = group.querySelector('[data-checkbox-item="all"]');
      var itemInputs = Array.from(group.querySelectorAll('[data-checkbox-item="item"]'));
      if (changedInput === allInput) {
        itemInputs.forEach(function (item) {
          if (item.disabled) return;
          item.checked = allInput.checked;
          item.indeterminate = false;
          item.removeAttribute("data-indeterminate");
          updateCheckboxControl(item);
        });
      } else if (changedInput) {
        if (!changedInput.indeterminate) changedInput.removeAttribute("data-indeterminate");
        updateCheckboxControl(changedInput);
      }
      var selectedCount = itemInputs.filter(function (item) { return item.checked; }).length;
      var hasMixed = itemInputs.some(function (item) { return item.indeterminate; });
      if (allInput) {
        allInput.checked = !hasMixed && itemInputs.length > 0 && selectedCount === itemInputs.length;
        allInput.indeterminate = hasMixed || selectedCount > 0 && selectedCount < itemInputs.length;
        if (allInput.indeterminate) allInput.setAttribute("data-indeterminate", "true");
        else allInput.removeAttribute("data-indeterminate");
        updateCheckboxControl(allInput);
      }
      var counter = group.querySelector("[data-checkbox-count]");
      if (counter) counter.textContent = "已选 " + selectedCount + " / " + itemInputs.length;
    }

    function activateStep(stepItem) {
      if (!stepItem) return;
      var stepList = stepItem.closest(".steps");
      if (!stepList || stepList.classList.contains("is-static")) return;
      var stepItems = Array.from(stepList.children);
      var stepIndex = stepItems.indexOf(stepItem);
      if (stepList.classList.contains("is-tab-steps")) {
        stepItems.forEach(function (item) {
          var selected = item === stepItem;
          item.classList.toggle("is-tab-selected", selected);
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
        });
        stepList.dispatchEvent(new CustomEvent("b2b:steps-tab-change", { bubbles: true, detail: { index: stepIndex } }));
        return;
      }
      stepItems.forEach(function (item, index) {
        item.classList.toggle("is-finished", index < stepIndex);
        item.classList.toggle("is-current", index === stepIndex);
        item.classList.toggle("is-waiting", index > stepIndex);
        item.classList.remove("is-error");
        item.setAttribute("aria-current", index === stepIndex ? "step" : "false");
        var node = item.querySelector(".step-node");
        if (node) node.innerHTML = index < stepIndex ? '<span class="b2b-icon" aria-hidden="true">check</span>' : String(index + 1);
      });
      stepList.dataset.currentIndex = String(stepIndex);
      stepList.dispatchEvent(new CustomEvent("b2b:steps-change", { bubbles: true, detail: { index: stepIndex } }));
    }

    function setPaginationPage(paginationRoot, requestedPage) {
      if (!paginationRoot) return;
      var totalPages = Number(paginationRoot.dataset.totalPages || 1);
      var nextPage = Math.max(1, Math.min(totalPages, Number(requestedPage) || 1));
      var numberedButtons = Array.from(paginationRoot.querySelectorAll(".page-button[data-page]"));
      var visiblePages = numberedButtons.map(function (button) { return Number(button.dataset.page); });
      if (numberedButtons.length && visiblePages.indexOf(nextPage) < 0) {
        var startPage = Math.max(1, Math.min(totalPages - numberedButtons.length + 1, nextPage - Math.floor(numberedButtons.length / 2)));
        numberedButtons.forEach(function (button, index) {
          var pageNumber = startPage + index;
          button.dataset.page = String(pageNumber);
          button.textContent = String(pageNumber);
        });
      }
      numberedButtons.forEach(function (button) {
        var selected = Number(button.dataset.page) === nextPage;
        button.classList.toggle("is-active", selected);
        if (selected) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
      var firstVisiblePage = numberedButtons.length ? Number(numberedButtons[0].dataset.page) : 1;
      var lastVisiblePage = numberedButtons.length ? Number(numberedButtons[numberedButtons.length - 1].dataset.page) : totalPages;
      var backwardJump = paginationRoot.querySelector('[data-page-jump="-5"]');
      var forwardJump = paginationRoot.querySelector('[data-page-jump="5"]');
      if (backwardJump) backwardJump.hidden = firstVisiblePage <= 1;
      if (forwardJump) forwardJump.hidden = lastVisiblePage >= totalPages;
      paginationRoot.dataset.currentPage = String(nextPage);
      var previous = paginationRoot.querySelector('[data-page-nav="prev"]');
      var next = paginationRoot.querySelector('[data-page-nav="next"]');
      if (previous) previous.disabled = nextPage <= 1;
      if (next) next.disabled = nextPage >= totalPages;
      var jumpInput = paginationRoot.querySelector("[data-page-jump-input]");
      if (jumpInput) {
        jumpInput.value = String(nextPage);
        jumpInput.setAttribute("aria-valuenow", String(nextPage));
        jumpInput.setAttribute("aria-valuemax", String(totalPages));
        jumpInput.setAttribute("aria-invalid", "false");
      }
      var live = paginationRoot.querySelector(".pagination-live");
      if (live) live.textContent = "第 " + nextPage + " / " + totalPages + " 页";
    }

    function commitPaginationInput(input, selectValue) {
      if (!input) return false;
      var paginationRoot = input.closest("[data-pagination]");
      if (!paginationRoot) return false;
      var current = Number(paginationRoot.dataset.currentPage || 1);
      var raw = input.value.trim();
      if (!/^\d+$/.test(raw)) {
        input.value = String(current);
        input.setAttribute("aria-valuenow", String(current));
        input.setAttribute("aria-invalid", "false");
        var invalidLive = paginationRoot.querySelector(".pagination-live");
        if (invalidLive) invalidLive.textContent = "页码无效，已恢复为第 " + current + " 页";
        if (selectValue) input.select();
        return false;
      }
      setPaginationPage(paginationRoot, raw);
      if (selectValue) input.select();
      return true;
    }

    function initializeScrollbars(targetRoot) {
      (targetRoot || interactionRoot).querySelectorAll("[data-scrollbar-spec]").forEach(function (scrollbar) {
        var viewport = scrollbar.querySelector("[data-scrollbar-viewport]");
        if (!viewport) return;
        function updateScrollThumbs() {
          scrollbar.querySelectorAll("[data-scrollbar-track]").forEach(function (track) {
            var thumb = track.querySelector("[data-scrollbar-thumb]");
            if (!thumb) return;
            var horizontal = track.dataset.axis === "horizontal";
            var trackLength = horizontal ? track.clientWidth : track.clientHeight;
            var viewportLength = horizontal ? viewport.clientWidth : viewport.clientHeight;
            var contentLength = horizontal ? viewport.scrollWidth : viewport.scrollHeight;
            var scrollRange = Math.max(0, contentLength - viewportLength);
            var minimum = horizontal ? 22 : 24;
            var thumbLength = Math.max(minimum, Math.min(trackLength, Math.round(trackLength * viewportLength / Math.max(contentLength, 1))));
            var thumbRange = Math.max(0, trackLength - thumbLength);
            var scrollValue = horizontal ? viewport.scrollLeft : viewport.scrollTop;
            var thumbOffset = scrollRange ? Math.round(thumbRange * scrollValue / scrollRange) : 0;
            thumb.style[horizontal ? "width" : "height"] = thumbLength + "px";
            thumb.style.transform = horizontal ? "translateX(" + thumbOffset + "px)" : "translateY(" + thumbOffset + "px)";
            thumb.disabled = scrollRange === 0;
            thumb.setAttribute("role", "scrollbar");
            thumb.setAttribute("aria-orientation", horizontal ? "horizontal" : "vertical");
            thumb.setAttribute("aria-valuemin", "0");
            thumb.setAttribute("aria-valuemax", String(Math.round(scrollRange)));
            thumb.setAttribute("aria-valuenow", String(Math.round(scrollValue)));
            thumb.setAttribute("aria-valuetext", Math.round(scrollValue) + " / " + Math.round(scrollRange));
          });
        }
        scrollbar._b2bUpdateThumbs = updateScrollThumbs;
        if (!viewport.dataset.scrollbarBound) {
          viewport.dataset.scrollbarBound = "true";
          viewport.addEventListener("scroll", updateScrollThumbs, { passive: true });
        }
        if (typeof ResizeObserver === "function" && !scrollbar._b2bScrollbarResizeObserver) {
          scrollbar._b2bScrollbarResizeObserver = new ResizeObserver(updateScrollThumbs);
          scrollbar._b2bScrollbarResizeObserver.observe(scrollbar);
          scrollbar._b2bScrollbarResizeObserver.observe(viewport);
        }
        window.requestAnimationFrame(updateScrollThumbs);
      });
    }

    function syncAnchorMarker(anchorNavigation, anchorItem, immediate) {
      if (!anchorNavigation) return;
      if (!anchorItem) {
        if (!anchorNavigation.classList.contains("has-moving-marker") && !anchorNavigation.style.getPropertyValue("--anchor-marker-offset") && !anchorNavigation.style.getPropertyValue("--anchor-marker-size")) return;
        anchorNavigation.classList.remove("has-moving-marker");
        anchorNavigation.style.removeProperty("--anchor-marker-offset");
        anchorNavigation.style.removeProperty("--anchor-marker-size");
        anchorNavigation.style.removeProperty("--anchor-marker-transition");
        return;
      }
      var horizontal = anchorNavigation.classList.contains("is-horizontal");
      var initializing = !anchorNavigation.classList.contains("has-moving-marker");
      var markerOffset = (horizontal ? anchorItem.offsetLeft : anchorItem.offsetTop) + "px";
      var markerSize = (horizontal ? anchorItem.offsetWidth : anchorItem.offsetHeight) + "px";
      var offsetChanged = anchorNavigation.style.getPropertyValue("--anchor-marker-offset") !== markerOffset;
      var sizeChanged = anchorNavigation.style.getPropertyValue("--anchor-marker-size") !== markerSize;
      if (!initializing && !offsetChanged && !sizeChanged) return;
      var suppressTransition = Boolean(immediate || initializing);
      if (suppressTransition) anchorNavigation.style.setProperty("--anchor-marker-transition", "none");
      if (offsetChanged) anchorNavigation.style.setProperty("--anchor-marker-offset", markerOffset);
      if (sizeChanged) anchorNavigation.style.setProperty("--anchor-marker-size", markerSize);
      if (initializing) anchorNavigation.classList.add("has-moving-marker");
      if (suppressTransition) {
        getComputedStyle(anchorNavigation, "::after").transform;
        anchorNavigation.style.removeProperty("--anchor-marker-transition");
      }
    }

    function disconnectAnchorMarker(navigation) {
      if (!navigation) return;
      if (navigation._b2bAnchorMarkerFrame !== null && navigation._b2bAnchorMarkerFrame !== undefined) {
        window.cancelAnimationFrame(navigation._b2bAnchorMarkerFrame);
      }
      navigation._b2bAnchorMarkerFrame = null;
      if (navigation._b2bAnchorMarkerResizeObserver) {
        navigation._b2bAnchorMarkerResizeObserver.disconnect();
        navigation._b2bAnchorMarkerResizeObserver = null;
      }
    }

    function scheduleAnchorMarkerSync(navigation) {
      if (!navigation || navigation._b2bAnchorMarkerFrame !== null && navigation._b2bAnchorMarkerFrame !== undefined) return;
      navigation._b2bAnchorMarkerFrame = window.requestAnimationFrame(function () {
        navigation._b2bAnchorMarkerFrame = null;
        if (!navigation.isConnected) {
          disconnectAnchorMarker(navigation);
          return;
        }
        syncAnchorMarker(navigation, navigation.querySelector(".anchor-item.is-selected[data-anchor-target]"), true);
      });
    }

    function setAnchorSelection(anchorItem, shouldScroll) {
      if (!anchorItem) return;
      var anchorNavigation = anchorItem.closest("[data-anchor-spec]");
      if (!anchorNavigation) return;
      anchorNavigation.querySelectorAll("[data-anchor-target]").forEach(function (item) {
        var selected = item === anchorItem;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-current", selected ? "location" : "false");
      });
      syncAnchorMarker(anchorNavigation, anchorItem);
      var anchorDemo = anchorNavigation.closest("[data-anchor-scroll-demo]");
      if (shouldScroll && anchorDemo) {
        var anchorContent = anchorDemo.querySelector("[data-anchor-scroll-content]");
        var anchorSection = anchorDemo.querySelector('[data-anchor-section="' + anchorItem.dataset.anchorTarget + '"]');
        if (anchorContent && anchorSection) {
          anchorContent._b2bAnchorProgrammaticTarget = anchorItem.dataset.anchorTarget;
          window.clearTimeout(anchorContent._b2bAnchorProgrammaticTimer);
          anchorContent._b2bAnchorProgrammaticTimer = window.setTimeout(function () {
            anchorContent._b2bAnchorProgrammaticTarget = null;
            anchorContent.dispatchEvent(new Event("scroll"));
          }, 1200);
          anchorContent.scrollTo({ top: anchorSection.offsetTop - anchorContent.offsetTop, behavior: "smooth" });
        }
      }
    }

    function initializeAnchorScroll(targetRoot) {
      var anchorScope = targetRoot || interactionRoot;
      var anchorNavigations = Array.from(anchorScope.querySelectorAll("[data-anchor-spec]"));
      if (anchorScope.matches && anchorScope.matches("[data-anchor-spec]")) anchorNavigations.unshift(anchorScope);
      anchorNavigations.forEach(function (navigation) {
        syncAnchorMarker(navigation, navigation.querySelector(".anchor-item.is-selected[data-anchor-target]"), true);
        if (!navigation._b2bDisconnectAnchorMarker) {
          navigation._b2bDisconnectAnchorMarker = function () { disconnectAnchorMarker(navigation); };
        }
        if (typeof ResizeObserver === "function" && !navigation._b2bAnchorMarkerResizeObserver) {
          navigation._b2bAnchorMarkerResizeObserver = new ResizeObserver(function () {
            scheduleAnchorMarkerSync(navigation);
          });
          navigation._b2bAnchorMarkerResizeObserver.observe(navigation);
        }
      });
      var anchorDemos = Array.from(anchorScope.querySelectorAll("[data-anchor-scroll-demo]"));
      if (anchorScope.matches && anchorScope.matches("[data-anchor-scroll-demo]")) anchorDemos.unshift(anchorScope);
      anchorDemos.forEach(function (demo) {
        var content = demo.querySelector("[data-anchor-scroll-content]");
        if (!content || content.dataset.anchorBound) return;
        content.dataset.anchorBound = "true";
        function syncAnchorFromScroll() {
          var sections = Array.from(demo.querySelectorAll("[data-anchor-section]"));
          if (!sections.length) return;
          var programmaticTarget = content._b2bAnchorProgrammaticTarget;
          if (programmaticTarget) {
            var targetSection = demo.querySelector('[data-anchor-section="' + programmaticTarget + '"]');
            var targetTop = targetSection ? targetSection.offsetTop - content.offsetTop : null;
            var atTarget = targetTop !== null && Math.abs(content.scrollTop - targetTop) <= 2;
            var atLastTarget = targetSection === sections[sections.length - 1] && content.scrollTop + content.clientHeight >= content.scrollHeight - 2;
            if (!atTarget && !atLastTarget) return;
            window.clearTimeout(content._b2bAnchorProgrammaticTimer);
            content._b2bAnchorProgrammaticTarget = null;
          }
          var currentSection = sections[0];
          sections.forEach(function (section) {
            if (section.offsetTop - content.offsetTop <= content.scrollTop + 12) currentSection = section;
          });
          if (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) currentSection = sections[sections.length - 1];
          var currentAnchor = demo.querySelector('[data-anchor-target="' + currentSection.dataset.anchorSection + '"]');
          setAnchorSelection(currentAnchor, false);
        }
        function cancelAnchorProgrammaticScroll() {
          if (!content._b2bAnchorProgrammaticTarget) return;
          window.clearTimeout(content._b2bAnchorProgrammaticTimer);
          content._b2bAnchorProgrammaticTarget = null;
        }
        content.addEventListener("scroll", syncAnchorFromScroll, { passive: true });
        content.addEventListener("scrollend", syncAnchorFromScroll, { passive: true });
        content.addEventListener("wheel", cancelAnchorProgrammaticScroll, { passive: true });
        content.addEventListener("touchstart", cancelAnchorProgrammaticScroll, { passive: true });
        content.addEventListener("pointerdown", cancelAnchorProgrammaticScroll, { passive: true });
        content.addEventListener("keydown", cancelAnchorProgrammaticScroll);
      });
    }

    function clampColorNumber(value, minimum, maximum) {
      return Math.max(minimum, Math.min(maximum, Number(value) || 0));
    }

    function colorRgbToHex(red, green, blue) {
      return "#" + [red, green, blue].map(function (channel) {
        return Math.round(clampColorNumber(channel, 0, 255)).toString(16).padStart(2, "0");
      }).join("").toUpperCase();
    }

    function colorHexToRgba(value) {
      var normalized = String(value || "").trim().replace(/^#/, "");
      if (/^[0-9a-f]{3}$/i.test(normalized)) normalized = normalized.split("").map(function (character) { return character + character; }).join("");
      if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(normalized)) return null;
      return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
        a: normalized.length === 8 ? Math.round(parseInt(normalized.slice(6, 8), 16) / 255 * 100) : 100
      };
    }

    function colorRgbToHsv(red, green, blue) {
      var r = red / 255;
      var g = green / 255;
      var b = blue / 255;
      var maximum = Math.max(r, g, b);
      var minimum = Math.min(r, g, b);
      var difference = maximum - minimum;
      var hue = 0;
      if (difference) {
        if (maximum === r) hue = 60 * (((g - b) / difference) % 6);
        else if (maximum === g) hue = 60 * ((b - r) / difference + 2);
        else hue = 60 * ((r - g) / difference + 4);
      }
      if (hue < 0) hue += 360;
      return { h: hue, s: maximum ? difference / maximum * 100 : 0, v: maximum * 100 };
    }

    function colorHsvToRgb(hue, saturation, value) {
      var h = ((Number(hue) % 360) + 360) % 360;
      var s = clampColorNumber(saturation, 0, 100) / 100;
      var v = clampColorNumber(value, 0, 100) / 100;
      var chroma = v * s;
      var x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
      var match = v - chroma;
      var channels = h < 60 ? [chroma, x, 0] : (h < 120 ? [x, chroma, 0] : (h < 180 ? [0, chroma, x] : (h < 240 ? [0, x, chroma] : (h < 300 ? [x, 0, chroma] : [chroma, 0, x]))));
      return { r: Math.round((channels[0] + match) * 255), g: Math.round((channels[1] + match) * 255), b: Math.round((channels[2] + match) * 255) };
    }

    function currentColorState(colorRoot) {
      return {
        h: Number(colorRoot.dataset.colorH || 220),
        s: Number(colorRoot.dataset.colorS || 100),
        v: Number(colorRoot.dataset.colorV || 100),
        a: Number(colorRoot.dataset.colorAlphaValue || 100)
      };
    }

    function clearColorSwatchSelection(colorRoot) {
      colorRoot.querySelectorAll(".color-grid .swatch").forEach(function (swatch) {
        swatch.classList.remove("is-selected");
        swatch.setAttribute("aria-pressed", "false");
        swatch.setAttribute("aria-selected", "false");
        swatch.tabIndex = -1;
        var selectionIcon = swatch.querySelector(".b2b-icon");
        if (selectionIcon) selectionIcon.remove();
      });
    }

    function applyColorState(colorRoot, nextState, preserveSwatch) {
      if (!colorRoot) return;
      var state = Object.assign(currentColorState(colorRoot), nextState || {});
      state.h = ((Number(state.h) % 360) + 360) % 360;
      state.s = clampColorNumber(state.s, 0, 100);
      state.v = clampColorNumber(state.v, 0, 100);
      state.a = clampColorNumber(state.a, 0, 100);
      var rgb = colorHsvToRgb(state.h, state.s, state.v);
      var hex = colorRgbToHex(rgb.r, rgb.g, rgb.b);
      var alpha = state.a / 100;
      var rgba = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + Number(alpha.toFixed(2)) + ")";
      var alphaHex = Math.round(alpha * 255).toString(16).padStart(2, "0").toUpperCase();
      colorRoot.dataset.colorH = String(Math.round(state.h));
      colorRoot.dataset.colorS = String(Number(state.s.toFixed(1)));
      colorRoot.dataset.colorV = String(Number(state.v.toFixed(1)));
      colorRoot.dataset.colorAlphaValue = String(Math.round(state.a));
      colorRoot.dataset.colorHex = hex;
      colorRoot.style.setProperty("--color-hue", String(Math.round(state.h)));
      colorRoot.style.setProperty("--color-saturation-position", state.s + "%");
      colorRoot.style.setProperty("--color-value-position", (100 - state.v) + "%");
      colorRoot.style.setProperty("--selected-solid-color", hex);
      colorRoot.style.setProperty("--selected-color", rgba);
      colorRoot.querySelectorAll("[data-color-preview]").forEach(function (preview) {
        preview.style.backgroundColor = rgba;
        preview.classList.toggle("is-transparent", state.a === 0);
      });
      colorRoot.querySelectorAll("[data-color-output]").forEach(function (output) { output.textContent = state.a < 100 ? hex + alphaHex : hex; });
      colorRoot.querySelectorAll("[data-color-input]").forEach(function (input) {
        input.value = hex;
        input.setAttribute("aria-invalid", "false");
      });
      colorRoot.querySelectorAll("[data-color-channel]").forEach(function (input) {
        input.value = String(rgb[input.dataset.colorChannel]);
        input.setAttribute("aria-invalid", "false");
      });
      colorRoot.querySelectorAll("[data-color-hue]").forEach(function (input) { input.value = String(Math.round(state.h)); });
      colorRoot.querySelectorAll("[data-color-alpha]").forEach(function (input) { input.value = String(Math.round(state.a)); });
      colorRoot.querySelectorAll("[data-color-alpha-output]").forEach(function (output) { output.textContent = Math.round(state.a) + "%"; });
      colorRoot.querySelectorAll("[data-color-saturation]").forEach(function (surface) {
        surface.setAttribute("aria-valuenow", String(Math.round(state.s)));
        surface.setAttribute("aria-valuetext", "饱和度 " + Math.round(state.s) + "% ，明度 " + Math.round(state.v) + "%");
      });
      var live = colorRoot.querySelector("[data-color-live]");
      if (live) live.textContent = "当前颜色 " + hex + "，透明度 " + Math.round(state.a) + "%";
      colorRoot.classList.remove("is-error");
      if (!preserveSwatch) clearColorSwatchSelection(colorRoot);
    }

    function setColorFromHex(colorRoot, value, preserveSwatch) {
      var rgba = colorHexToRgba(value);
      if (!rgba) return false;
      var hsv = colorRgbToHsv(rgba.r, rgba.g, rgba.b);
      var hasAlpha = String(value || "").trim().replace(/^#/, "").length === 8;
      var targetAlpha = hasAlpha ? rgba.a : currentColorState(colorRoot).a;
      var exactHex = colorRgbToHex(rgba.r, rgba.g, rgba.b);
      var alpha = targetAlpha / 100;
      var alphaHex = Math.round(alpha * 255).toString(16).padStart(2, "0").toUpperCase();
      var exactRgba = "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + Number(alpha.toFixed(2)) + ")";
      applyColorState(colorRoot, { h: hsv.h, s: hsv.s, v: hsv.v, a: targetAlpha }, preserveSwatch);
      colorRoot.dataset.colorHex = exactHex;
      colorRoot.style.setProperty("--selected-solid-color", exactHex);
      colorRoot.style.setProperty("--selected-color", exactRgba);
      colorRoot.querySelectorAll("[data-color-preview]").forEach(function (preview) {
        preview.style.backgroundColor = exactRgba;
        preview.classList.toggle("is-transparent", targetAlpha === 0);
      });
      colorRoot.querySelectorAll("[data-color-output]").forEach(function (output) { output.textContent = targetAlpha < 100 ? exactHex + alphaHex : exactHex; });
      colorRoot.querySelectorAll("[data-color-input]").forEach(function (input) { input.value = exactHex; });
      colorRoot.querySelectorAll('[data-color-channel="r"]').forEach(function (input) { input.value = String(rgba.r); });
      colorRoot.querySelectorAll('[data-color-channel="g"]').forEach(function (input) { input.value = String(rgba.g); });
      colorRoot.querySelectorAll('[data-color-channel="b"]').forEach(function (input) { input.value = String(rgba.b); });
      var live = colorRoot.querySelector("[data-color-live]");
      if (live) live.textContent = "当前颜色 " + exactHex + "，透明度 " + Math.round(targetAlpha) + "%";
      return true;
    }

    function initializeColorPickers(targetRoot) {
      var colorScope = targetRoot || interactionRoot;
      var colorRoots = Array.from(colorScope.querySelectorAll("[data-color-picker]"));
      if (colorScope.matches && colorScope.matches("[data-color-picker]")) colorRoots.unshift(colorScope);
      colorRoots.forEach(function (colorRoot) {
        var selectedSwatch = colorRoot.querySelector(".color-grid .swatch.is-selected");
        var initialHex = selectedSwatch ? selectedSwatch.dataset.colorValue : (colorRoot.dataset.colorHex || (colorRoot.querySelector("[data-color-input]") && colorRoot.querySelector("[data-color-input]").value) || "#004CFF");
        var initialAlpha = selectedSwatch ? Number(selectedSwatch.dataset.colorSwatchAlpha || 100) : Number(colorRoot.dataset.colorAlphaValue || 100);
        var initialColorValue = initialHex + (initialAlpha < 100 ? Math.round(initialAlpha / 100 * 255).toString(16).padStart(2, "0") : "");
        setColorFromHex(colorRoot, initialColorValue, Boolean(selectedSwatch));
        if (colorRoot.matches("[data-color-picker-control].is-open")) window.requestAnimationFrame(function () { fitColorPickerPanel(colorRoot); });
      });
    }

    function fitColorPickerPanel(colorRoot) {
      if (!colorRoot || !colorRoot.classList.contains("is-open")) return;
      var panel = colorRoot.querySelector(":scope > [data-color-panel]");
      var trigger = colorRoot.querySelector(":scope > [data-color-trigger]");
      if (!panel || !trigger) return;
      colorRoot.classList.remove("is-placement-top", "is-placement-end");
      var viewportPadding = 8;
      var panelGap = 4;
      panel.style.removeProperty("left");
      panel.style.removeProperty("right");
      panel.style.removeProperty("top");
      panel.style.removeProperty("bottom");
      panel.style.removeProperty("max-height");
      var rootRect = colorRoot.getBoundingClientRect();
      var triggerRect = trigger.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();
      var availableBelow = Math.max(0, window.innerHeight - triggerRect.bottom - panelGap - viewportPadding);
      var availableAbove = Math.max(0, triggerRect.top - panelGap - viewportPadding);
      var placeTop = panelRect.height > availableBelow && (panelRect.height <= availableAbove || availableAbove > availableBelow);
      var availableHeight = placeTop ? availableAbove : availableBelow;
      panel.style.maxHeight = Math.max(120, Math.min(window.innerHeight - viewportPadding * 2, availableHeight)) + "px";
      panelRect = panel.getBoundingClientRect();
      var panelLeft = Math.min(Math.max(triggerRect.left, viewportPadding), Math.max(viewportPadding, window.innerWidth - panelRect.width - viewportPadding));
      var panelTop = placeTop ? triggerRect.top - panelGap - panelRect.height : triggerRect.bottom + panelGap;
      panelTop = Math.min(Math.max(panelTop, viewportPadding), Math.max(viewportPadding, window.innerHeight - panelRect.height - viewportPadding));
      panel.style.left = panelLeft - rootRect.left + "px";
      panel.style.right = "auto";
      panel.style.top = panelTop - rootRect.top + "px";
      panel.style.bottom = "auto";
      colorRoot.classList.toggle("is-placement-top", placeTop);
      colorRoot.classList.toggle("is-placement-end", panelLeft < triggerRect.left);
    }

    function setColorPickerOpen(colorRoot, open, restoreFocus) {
      if (!colorRoot || !colorRoot.matches("[data-color-picker-control]")) return;
      var trigger = colorRoot.querySelector(":scope > [data-color-trigger]");
      var panel = colorRoot.querySelector(":scope > [data-color-panel]");
      if (!trigger || !panel || trigger.disabled) return;
      trigger.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      colorRoot.classList.toggle("is-open", open);
      if (open) {
        panel.hidden = false;
        panel.removeAttribute("inert");
        void panel.offsetWidth;
        fitColorPickerPanel(colorRoot);
      } else {
        panel.hidden = true;
        panel.setAttribute("inert", "");
        colorRoot.classList.remove("is-placement-top", "is-placement-end", "is-custom-open");
        var more = colorRoot.querySelector("[data-color-more]");
        var custom = colorRoot.querySelector("[data-color-custom]");
        if (more) more.setAttribute("aria-expanded", "false");
        if (custom && colorRoot.dataset.colorModel === "full") {
          custom.hidden = true;
          custom.setAttribute("inert", "");
          custom.setAttribute("aria-hidden", "true");
        }
      }
      if (!open && restoreFocus) trigger.focus();
    }

    function setColorCustomOpen(colorRoot, open, restoreFocus) {
      if (!colorRoot || colorRoot.classList.contains("is-custom-only")) return;
      var trigger = colorRoot.querySelector("[data-color-more]");
      var palette = colorRoot.querySelector("[data-color-palette-view]");
      var panel = colorRoot.querySelector("[data-color-custom]");
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
      if (palette) {
        palette.setAttribute("aria-hidden", "false");
        palette.hidden = false;
        palette.removeAttribute("inert");
      }
      if (panel) {
        panel.setAttribute("aria-hidden", String(!open));
        if (open) {
          panel.hidden = false;
          panel.removeAttribute("inert");
          void panel.offsetWidth;
          colorRoot.classList.add("is-custom-open");
        } else {
          panel.setAttribute("inert", "");
          panel.hidden = true;
          colorRoot.classList.remove("is-custom-open");
        }
      } else {
        colorRoot.classList.toggle("is-custom-open", open);
      }
      if (colorRoot.matches("[data-color-picker-control].is-open")) window.requestAnimationFrame(function () { fitColorPickerPanel(colorRoot); });
      if (!open && restoreFocus && trigger) trigger.focus();
    }

    function setSimpleColorOpen(simpleRoot, open, restoreFocus) {
      if (!simpleRoot) return;
      var trigger = simpleRoot.querySelector("[data-color-trigger]");
      var panel = simpleRoot.querySelector("[data-simple-color-panel]");
      if (!trigger || !panel) return;
      trigger.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      if (open) {
        panel.hidden = false;
        void panel.offsetWidth;
        simpleRoot.classList.add("is-open");
      } else {
        panel.hidden = true;
        simpleRoot.classList.remove("is-open");
      }
      if (!open && restoreFocus) trigger.focus();
    }

    function updateColorSaturation(colorSurface, clientX, clientY) {
      var colorRoot = colorSurface.closest("[data-color-picker]");
      var rect = colorSurface.getBoundingClientRect();
      var saturation = clampColorNumber((clientX - rect.left) / rect.width * 100, 0, 100);
      var value = 100 - clampColorNumber((clientY - rect.top) / rect.height * 100, 0, 100);
      applyColorState(colorRoot, { s: saturation, v: value }, false);
    }

    function updateColorRange(colorRange, clientX) {
      var colorRoot = colorRange.closest("[data-color-picker]");
      var rect = colorRange.getBoundingClientRect();
      var progress = clampColorNumber((clientX - rect.left) / rect.width, 0, 1);
      if (colorRange.matches("[data-color-hue]")) applyColorState(colorRoot, { h: progress * 360 }, false);
      else applyColorState(colorRoot, { a: progress * 100 }, false);
    }

    function dateValueParts(value) {
      return String(value || "").match(/\d{4}-\d{2}-\d{2}/g) || [];
    }

    function datePickerTimeValue(datePicker) {
      var values = ["hour", "minute", "second"].filter(function (unit) {
        return Boolean(datePicker.querySelector('[data-date-time-unit="' + unit + '"]'));
      }).map(function (unit) {
        var selected = datePicker.querySelector('[data-date-time-unit="' + unit + '"] [data-date-time-option].is-selected');
        return selected ? selected.dataset.dateTimeOption : "00";
      });
      return values.join(":");
    }

    function setDatePickerTimeValue(datePicker, value) {
      var parts = String(value || "00:00:00").split(":");
      ["hour", "minute", "second"].forEach(function (unit, index) {
        datePicker.querySelectorAll('[data-date-time-unit="' + unit + '"] [data-date-time-option]').forEach(function (option) {
          setDateTimeOptionVisual(option, option.dataset.dateTimeOption === (parts[index] || "00"), datePicker.dataset.dateTimeChecks === "true");
        });
      });
      alignDatePickerTimeSelections(datePicker);
    }

    function setDateRangePhase(datePicker, phase) {
      if (!datePicker || datePicker.dataset.dateRange !== "true" || datePicker.dataset.dateWithTime !== "true") return;
      var previous = datePicker.dataset.dateRangePhase || "start";
      datePicker.dataset[previous === "end" ? "dateEndTime" : "dateStartTime"] = datePickerTimeValue(datePicker);
      datePicker.dataset.dateRangePhase = phase;
      datePicker.querySelectorAll("[data-date-range-phase]").forEach(function (button) {
        var selected = button.dataset.dateRangePhase === phase;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      setDatePickerTimeValue(datePicker, datePicker.dataset[phase === "end" ? "dateEndTime" : "dateStartTime"]);
    }

    function setDateTimeOptionVisual(option, selected, showCheck) {
      if (!option) return;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-selected", String(selected));
      option.tabIndex = selected ? 0 : -1;
      var check = option.querySelector(".time-option-check");
      if (check && (!selected || !showCheck)) check.remove();
      if (selected && showCheck && !option.querySelector(".time-option-check")) {
        check = document.createElement("span");
        check.className = "b2b-icon time-option-check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = "check";
        option.appendChild(check);
      }
    }

    function datePickerDisplayValue(datePicker, value) {
      var rawValue = String(value || "");
      if (datePicker && datePicker.dataset.dateDisplayTimeOnly === "true") {
        var timeMatch = rawValue.match(/\d{2}:\d{2}(?::\d{2})?/);
        return timeMatch ? timeMatch[0] : (datePicker.dataset.datePlaceholder || "Select time");
      }
      return rawValue || (datePicker && datePicker.dataset.datePlaceholder) || "请选择日期";
    }

    function writeDatePickerDisplayValue(datePicker, value) {
      if (!datePicker) return;
      var valueNode = datePicker.querySelector("[data-date-value]");
      if (!valueNode) return;
      var displayValue = datePickerDisplayValue(datePicker, value);
      var rangeParts = datePicker.dataset.dateRange === "true" && value ? String(displayValue).split(/\s+—\s+/) : [];
      valueNode.replaceChildren();
      valueNode.classList.toggle("is-range-value", rangeParts.length === 2);
      if (rangeParts.length !== 2) {
        valueNode.textContent = displayValue;
        return;
      }
      ["start", "end"].forEach(function (endpoint, index) {
        if (index === 1) {
          var separator = document.createElement("span");
          separator.className = "date-range-separator";
          separator.setAttribute("aria-hidden", "true");
          separator.textContent = "—";
          valueNode.appendChild(separator);
        }
        var part = document.createElement("span");
        part.className = "date-range-value-part";
        part.dataset[endpoint === "start" ? "dateRangeStart" : "dateRangeEnd"] = "";
        part.textContent = rangeParts[index];
        valueNode.appendChild(part);
      });
    }

    function scrollDateTimeOptionToTop(option) {
      var scrollArea = option && option.closest('[role="listbox"]');
      if (!scrollArea || !option) return;
      var scrollRange = Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
      var targetTop = scrollArea.scrollTop + option.getBoundingClientRect().top - scrollArea.getBoundingClientRect().top;
      scrollArea.scrollTop = Math.max(0, Math.min(scrollRange, targetTop));
    }

    function alignDatePickerTimeSelections(datePicker) {
      if (!datePicker) return;
      datePicker.querySelectorAll('[data-date-time-unit] [data-date-time-option].is-selected').forEach(scrollDateTimeOptionToTop);
    }

    function bindDatePickerKeyboard(datePicker) {
      if (!datePicker || datePicker.dataset.dateKeyboardBound === "true") return;
      datePicker.dataset.dateKeyboardBound = "true";
      datePicker.addEventListener("keydown", function (event) {
        var phase = event.target.closest && event.target.closest('[role="tab"][data-date-range-phase]');
        if (phase && ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) >= 0) {
          var phases = Array.from(phase.closest('[role="tablist"]').querySelectorAll("[data-date-range-phase]"));
          var phaseIndex = phases.indexOf(phase);
          var phaseNext = event.key === "Home" ? 0 : (event.key === "End" ? phases.length - 1 : (event.key === "ArrowRight" ? (phaseIndex + 1) % phases.length : (phaseIndex - 1 + phases.length) % phases.length));
          phases[phaseNext].click();
          phases[phaseNext].focus();
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        var timeOption = event.target.closest && event.target.closest("[data-date-time-option]");
        if (timeOption && ["ArrowUp", "ArrowDown", "Home", "End", "Enter", " "].indexOf(event.key) >= 0) {
          if (event.key === "Enter" || event.key === " ") timeOption.click();
          else {
            var timeOptions = Array.from(timeOption.closest('[role="listbox"]').querySelectorAll("[data-date-time-option]"));
            var timeIndex = timeOptions.indexOf(timeOption);
            var timeNext = event.key === "Home" ? 0 : (event.key === "End" ? timeOptions.length - 1 : (event.key === "ArrowDown" ? Math.min(timeOptions.length - 1, timeIndex + 1) : Math.max(0, timeIndex - 1)));
            timeOptions.forEach(function (option, index) { option.tabIndex = index === timeNext ? 0 : -1; });
            timeOptions[timeNext].focus();
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        var day = event.target.closest && event.target.closest("[data-date-day]");
        if (!day || day.disabled || ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Enter", " "].indexOf(event.key) < 0) return;
        if (event.key === "Enter" || event.key === " ") day.click();
        else {
          var days = Array.from(day.closest(".date-grid").querySelectorAll("[data-date-day]:not(:disabled)"));
          var dayIndex = days.indexOf(day);
          var dayNext = event.key === "Home" ? 0 : (event.key === "End" ? days.length - 1 : Math.max(0, Math.min(days.length - 1, dayIndex + (event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -7 : 7))));
          days[dayNext].setAttribute("tabindex", "0");
          day.setAttribute("tabindex", "-1");
          days[dayNext].focus();
        }
        event.preventDefault();
        event.stopPropagation();
      });
    }

    function initializeDatePickers(scope) {
      var datePickers = [];
      if (scope && scope.matches && scope.matches("[data-date-picker]")) datePickers.push(scope);
      if (scope && scope.querySelectorAll) datePickers = datePickers.concat(Array.from(scope.querySelectorAll("[data-date-picker]")));
      datePickers.forEach(function (datePicker) {
        bindDatePickerKeyboard(datePicker);
        if (datePicker.classList.contains("is-open")) window.requestAnimationFrame(function () { alignDatePickerTimeSelections(datePicker); });
      });
    }

    function setDatePickerCurrentTime(datePicker) {
      if (!datePicker) return;
      captureDatePickerState(datePicker);
      var now = new Date();
      var currentValues = {
        hour: String(now.getHours()).padStart(2, "0"),
        minute: String(now.getMinutes()).padStart(2, "0"),
        second: String(now.getSeconds()).padStart(2, "0")
      };
      ["hour", "minute", "second"].forEach(function (unit) {
        var column = datePicker.querySelector('[data-date-time-unit="' + unit + '"]');
        if (!column) return;
        var selectedOption = null;
        column.querySelectorAll("[data-date-time-option]").forEach(function (option) {
          var selected = option.dataset.dateTimeOption === currentValues[unit];
          setDateTimeOptionVisual(option, selected, datePicker.dataset.dateTimeChecks === "true");
          if (selected) selectedOption = option;
        });
        if (selectedOption) scrollDateTimeOptionToTop(selectedOption);
      });
      if (!datePicker.dataset.dateValue && !datePicker.dataset.pendingValue) {
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, "0");
        var day = String(now.getDate()).padStart(2, "0");
        datePicker.dataset.pendingValue = year + "-" + month + "-" + day;
        syncDateGridVisual(datePicker, datePicker.dataset.pendingValue);
      }
      var confirm = datePicker.querySelector("[data-date-confirm]");
      if (confirm) confirm.disabled = false;
    }

    function syncDateRangeRowEdges(datePicker) {
      datePicker.querySelectorAll(".date-grid").forEach(function (grid) {
        var days = Array.from(grid.querySelectorAll("[data-date-day]"));
        days.forEach(function (day, index) {
          var active = !day.disabled && day.matches(".is-range-start, .is-range-end, .is-in-range");
          var previous = days[index - 1];
          var next = days[index + 1];
          var previousActive = previous && !previous.disabled && previous.matches(".is-range-start, .is-range-end, .is-in-range");
          var nextActive = next && !next.disabled && next.matches(".is-range-start, .is-range-end, .is-in-range");
          day.classList.toggle("is-range-row-start", active && (index % 7 === 0 || !previousActive));
          day.classList.toggle("is-range-row-end", active && (index % 7 === 6 || !nextActive));
        });
      });
    }

    function syncDateGridVisual(datePicker, value) {
      var parts = dateValueParts(value);
      var range = datePicker.dataset.dateRange === "true";
      var dualRange = range && datePicker.dataset.dateWithTime !== "true" && datePicker.querySelectorAll(".date-calendar").length > 1;
      var start = parts[0] || "";
      var end = range ? (parts[1] || start) : "";
      datePicker.querySelectorAll("[data-date-day]").forEach(function (day) {
        var iso = day.dataset.dateIso || "";
        var eligible = !(dualRange && day.classList.contains("is-outside"));
        var selected = eligible && !range && iso === start;
        var rangeStart = eligible && range && Boolean(start) && iso === start;
        var rangeEnd = eligible && range && Boolean(end) && iso === end;
        var inRange = eligible && range && Boolean(start && end) && iso > start && iso < end;
        day.classList.toggle("is-selected", selected);
        day.classList.toggle("is-range-start", rangeStart);
        day.classList.toggle("is-range-end", rangeEnd);
        day.classList.toggle("is-in-range", inRange);
        day.setAttribute("tabindex", selected || rangeStart ? "0" : "-1");
      });
      syncDateRangeRowEdges(datePicker);
    }

    function updateDateMonthMenu(calendar, year, selectedMonth) {
      var menu = calendar && calendar.querySelector("[data-date-month-menu]");
      if (!menu) return;
      menu.dataset.dateMenuYear = String(year);
      var label = menu.querySelector("[data-date-menu-year-label]");
      if (label) label.textContent = year + " 年";
      menu.querySelectorAll("[data-date-month-option]").forEach(function (option) {
        var selected = Number(option.dataset.dateMonthOption) === selectedMonth && Number(year) === Number(calendar.dataset.dateYear);
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
    }

    function setDateMonthMenuOpen(calendar, open) {
      if (!calendar) return;
      var trigger = calendar.querySelector("[data-date-heading-trigger]");
      var menu = calendar.querySelector("[data-date-month-menu]");
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
      if (menu) menu.hidden = !open;
      if (open) updateDateMonthMenu(calendar, Number(calendar.dataset.dateYear), Number(calendar.dataset.dateMonth));
    }

    function closeDateMonthMenus(exceptCalendar) {
      interactionRoot.querySelectorAll(".date-calendar").forEach(function (calendar) {
        if (calendar !== exceptCalendar) setDateMonthMenuOpen(calendar, false);
      });
    }

    function renderDateCalendar(calendar, year, month, datePicker) {
      if (!calendar) return;
      var first = new Date(year, month - 1, 1);
      var gridStart = new Date(year, month - 1, 1 - first.getDay());
      calendar.dataset.dateYear = String(year);
      calendar.dataset.dateMonth = String(month);
      var heading = calendar.querySelector("[data-date-heading]");
      if (heading) heading.textContent = year + " 年 " + month + " 月";
      var grid = calendar.querySelector(".date-grid");
      if (!grid) return;
      var dualRange = datePicker.dataset.dateRange === "true" && datePicker.dataset.dateWithTime !== "true" && datePicker.querySelectorAll(".date-calendar").length > 1;
      grid.innerHTML = Array.from({ length: 42 }, function (_, index) {
        var date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
        var iso = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
        var serial = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
        var outside = date.getMonth() !== month - 1;
        var disabled = dualRange && outside;
        var today = iso === "2026-07-13";
        var className = [outside ? "is-outside" : "", today ? "is-today" : ""].filter(Boolean).join(" ");
        return '<button type="button" role="gridcell" data-date-day="' + date.getDate() + '" data-date-iso="' + iso + '" data-date-serial="' + serial + '" tabindex="-1" class="' + className + '"' + (disabled ? " disabled" : "") + ' aria-label="' + date.getFullYear() + " 年 " + (date.getMonth() + 1) + " 月 " + date.getDate() + ' 日">' + date.getDate() + "</button>";
      }).join("");
      syncDateGridVisual(datePicker, datePicker.dataset.pendingValue || datePicker.dataset.dateValue);
      updateDateMonthMenu(calendar, year, month);
    }

    function captureDatePickerState(datePicker) {
      if (!datePicker || datePicker._dateConfirmedState) return;
      var selectedShortcut = datePicker.querySelector("[data-date-shortcut].is-selected");
      datePicker._dateConfirmedState = {
        value: datePicker.dataset.dateValue || "",
        pendingValue: datePicker.dataset.pendingValue || "",
        months: Array.from(datePicker.querySelectorAll(".date-calendar")).map(function (calendar) {
          return { year: Number(calendar.dataset.dateYear), month: Number(calendar.dataset.dateMonth) };
        }),
        time: datePickerTimeValue(datePicker),
        shortcut: selectedShortcut ? selectedShortcut.dataset.dateShortcut : ""
      };
    }

    function restoreDatePickerState(datePicker) {
      var state = datePicker && datePicker._dateConfirmedState;
      if (!state) return;
      datePicker.dataset.dateValue = state.value;
      if (state.pendingValue) datePicker.dataset.pendingValue = state.pendingValue;
      else delete datePicker.dataset.pendingValue;
      delete datePicker.dataset.rangeStart;
      delete datePicker.dataset.rangeStartLabel;
      writeDatePickerDisplayValue(datePicker, state.value);
      datePicker.classList.toggle("is-empty", !state.value);
      Array.from(datePicker.querySelectorAll(".date-calendar")).forEach(function (calendar, index) {
        var monthState = state.months[index];
        if (monthState) renderDateCalendar(calendar, monthState.year, monthState.month, datePicker);
      });
      datePicker.querySelectorAll("[data-date-shortcut]").forEach(function (shortcut) {
        var selected = shortcut.dataset.dateShortcut === state.shortcut;
        shortcut.classList.toggle("is-selected", selected);
        shortcut.setAttribute("aria-pressed", String(selected));
      });
      var timeParts = state.time.split(":");
      ["hour", "minute", "second"].forEach(function (unit, index) {
        datePicker.querySelectorAll('[data-date-time-unit="' + unit + '"] [data-date-time-option]').forEach(function (option) {
          var selected = option.dataset.dateTimeOption === timeParts[index];
          setDateTimeOptionVisual(option, selected, datePicker.dataset.dateTimeChecks === "true");
        });
      });
      alignDatePickerTimeSelections(datePicker);
      var confirm = datePicker.querySelector("[data-date-confirm]");
      if (confirm) confirm.disabled = false;
      delete datePicker._dateConfirmedState;
    }

    function commitDatePickerState(datePicker) {
      if (datePicker) delete datePicker._dateConfirmedState;
    }

    function clearDatePicker(datePicker) {
      if (!datePicker) return;
      datePicker.dataset.dateValue = "";
      delete datePicker.dataset.pendingValue;
      delete datePicker.dataset.rangeStart;
      delete datePicker.dataset.rangeStartLabel;
      writeDatePickerDisplayValue(datePicker, "");
      datePicker.classList.add("is-empty");
      syncDateGridVisual(datePicker, "");
      datePicker.querySelectorAll("[data-date-shortcut]").forEach(function (shortcut) {
        shortcut.classList.remove("is-selected");
        shortcut.setAttribute("aria-pressed", "false");
      });
      var confirm = datePicker.querySelector("[data-date-confirm]");
      if (confirm) confirm.disabled = false;
      commitDatePickerState(datePicker);
      setDatePickerOpen(datePicker, false, true);
    }

    function setDatePickerOpen(datePicker, open, restoreFocus) {
      if (!datePicker) return;
      var trigger = datePicker.querySelector("[data-date-trigger]");
      var panel = datePicker.querySelector(".date-picker-panel");
      if (open && !datePicker.classList.contains("is-open")) captureDatePickerState(datePicker);
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
      if (panel) panel.hidden = !open;
      datePicker.classList.toggle("is-open", open);
      if (open) window.requestAnimationFrame(function () { alignDatePickerTimeSelections(datePicker); });
      if (!open) datePicker.querySelectorAll(".date-calendar").forEach(function (calendar) { setDateMonthMenuOpen(calendar, false); });
      if (!open && restoreFocus && trigger) trigger.focus();
    }

    function closeOtherDatePickers(except) {
      interactionRoot.querySelectorAll("[data-date-picker].is-open").forEach(function (datePicker) {
        if (datePicker !== except) {
          restoreDatePickerState(datePicker);
          setDatePickerOpen(datePicker, false, false);
        }
      });
    }

    function setFormStep(form, nextStep) {
      if (!form) return;
      var steps = Array.from(form.querySelectorAll("[data-step-target]"));
      var panels = Array.from(form.querySelectorAll("[data-step-panel]"));
      var step = Math.max(1, Math.min(steps.length, Number(nextStep) || 1));
      form.dataset.step = String(step);
      steps.forEach(function (item, index) {
        item.classList.toggle("is-current", index === step - 1);
        item.classList.toggle("is-complete", index < step - 1);
        item.classList.toggle("is-waiting", index > step - 1);
        item.setAttribute("aria-current", index === step - 1 ? "step" : "false");
        item.setAttribute("aria-expanded", String(index === step - 1));
        item.tabIndex = index === step - 1 ? 0 : -1;
      });
      panels.forEach(function (panel) {
        var visible = Number(panel.dataset.stepPanel) === step;
        panel.hidden = !visible;
        panel.setAttribute("aria-hidden", String(!visible));
      });
      var previous = form.querySelector("[data-form-prev]");
      var next = form.querySelector("[data-form-next]");
      if (previous) previous.disabled = step === 1;
      if (next) next.textContent = step === steps.length ? "提交" : "下一步";
    }

    function setFormControlError(control, message) {
      if (!control) return;
      var field = control.closest(".form-field");
      var validationForm = control.closest("[data-source-form]");
      var explicitMessage = validationForm && validationForm.querySelector("[data-validation-message]");
      control.setAttribute("aria-invalid", message ? "true" : "false");
      if (field) field.classList.toggle("is-error", Boolean(message));
      if (explicitMessage) {
        explicitMessage.hidden = !message;
        if (message) explicitMessage.textContent = message;
      }
    }

    function sourceTabButtons(tabsRoot) {
      return Array.from(tabsRoot.querySelectorAll(".source-tabs-scroll > [role='tab']"));
    }

    function updateSourceTabsScrollControls(tabsRoot) {
      var scrollRoot = tabsRoot && tabsRoot.querySelector(".source-tabs-scroll");
      if (!scrollRoot) return;
      var previous = tabsRoot.querySelector('[data-tabs-scroll="-1"]');
      var next = tabsRoot.querySelector('[data-tabs-scroll="1"]');
      var maxScroll = Math.max(0, scrollRoot.scrollWidth - scrollRoot.clientWidth);
      if (previous) previous.disabled = scrollRoot.scrollLeft <= 1;
      if (next) next.disabled = scrollRoot.scrollLeft >= maxScroll - 1;
    }

    function syncSourceTabs(tabsRoot, immediate) {
      if (!tabsRoot) return;
      var scrollRoot = tabsRoot.querySelector(".source-tabs-scroll");
      var active = scrollRoot && scrollRoot.querySelector(":scope > [role='tab'].is-active");
      if (!scrollRoot || !active) {
        tabsRoot.style.setProperty("--source-tabs-indicator-width", "0px");
        return;
      }
      sourceTabButtons(tabsRoot).forEach(function (tab) {
        var selected = tab === active;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      var indicatorTarget = tabsRoot.classList.contains("is-line")
        ? active.querySelector(".source-tab-label") || active
        : active;
      var scrollRect = scrollRoot.getBoundingClientRect();
      var indicatorRect = indicatorTarget.getBoundingClientRect();
      tabsRoot.style.setProperty("--source-tabs-indicator-x", Math.round(indicatorRect.left - scrollRect.left + scrollRoot.scrollLeft) + "px");
      tabsRoot.style.setProperty("--source-tabs-indicator-width", Math.round(indicatorRect.width) + "px");
      if (immediate) {
        tabsRoot.classList.remove("is-indicator-ready");
        window.requestAnimationFrame(function () { tabsRoot.classList.add("is-indicator-ready"); });
      } else {
        tabsRoot.classList.add("is-indicator-ready");
      }
      updateSourceTabsScrollControls(tabsRoot);
    }

    function ensureSourceTabVisible(tabsRoot, tab) {
      var scrollRoot = tabsRoot && tabsRoot.querySelector(".source-tabs-scroll");
      if (!scrollRoot || !tab) return;
      var tabStart = tab.offsetLeft;
      var tabEnd = tabStart + tab.offsetWidth;
      var viewStart = scrollRoot.scrollLeft;
      var viewEnd = viewStart + scrollRoot.clientWidth;
      var nextLeft = viewStart;
      if (tabStart < viewStart) nextLeft = tabStart;
      else if (tabEnd > viewEnd) nextLeft = tabEnd - scrollRoot.clientWidth;
      if (nextLeft !== viewStart) scrollRoot.scrollTo({ left: nextLeft, behavior: "smooth" });
    }

    function activateSourceTab(tab, options) {
      if (!tab || tab.disabled) return;
      var opts = options || {};
      var tabsRoot = tab.closest("[data-source-tabs]");
      if (!tabsRoot) return;
      var previous = tabsRoot.querySelector(".source-tabs-scroll > [role='tab'].is-active");
      sourceTabButtons(tabsRoot).forEach(function (item) {
        var selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      var panel = tabsRoot.querySelector(".source-tab-panel");
      var label = tab.querySelector(".source-tab-label");
      var labelText = label ? label.textContent.trim() : tab.textContent.trim();
      if (panel) {
        window.clearTimeout(panel._b2bTabsTimer);
        panel.setAttribute("aria-labelledby", tab.id);
        if (previous !== tab && !opts.immediate) {
          panel.classList.remove("is-entering");
          panel.classList.add("is-leaving");
          var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          panel._b2bTabsTimer = window.setTimeout(function () {
            var panelContent = panel.querySelector(":scope > span");
            if (panelContent) panelContent.textContent = "Content of " + labelText;
            else panel.textContent = "Content of " + labelText;
            panel.classList.remove("is-leaving");
            panel.classList.add("is-entering");
            window.setTimeout(function () { panel.classList.remove("is-entering"); }, 190);
          }, reducedMotion ? 0 : 80);
        } else {
          var immediateContent = panel.querySelector(":scope > span");
          if (immediateContent) immediateContent.textContent = "Content of " + labelText;
          else panel.textContent = "Content of " + labelText;
        }
      }
      ensureSourceTabVisible(tabsRoot, tab);
      syncSourceTabs(tabsRoot, Boolean(opts.immediate));
      if (opts.focus) tab.focus();
      tabsRoot.dispatchEvent(new CustomEvent("b2b:tabs-change", {
        bubbles: true,
        detail: { id: tab.id, label: labelText }
      }));
    }

    function setTabsMoreOpen(more, open, focusFirst) {
      if (!more) return;
      var trigger = more.querySelector("[data-tabs-more-trigger]");
      var menu = more.querySelector("[role='menu']");
      more.classList.toggle("is-open", open);
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
      if (open && focusFirst && menu) {
        var firstItem = menu.querySelector("[role='menuitem']");
        if (firstItem) firstItem.focus();
      }
    }

    function initializeSourceTabs(scope) {
      (scope || interactionRoot).querySelectorAll("[data-source-tabs]").forEach(function (tabsRoot) {
        if (isDirectRendererNode(tabsRoot)) return;
        if (tabsRoot.dataset.tabsReady !== "true") {
          tabsRoot.dataset.tabsReady = "true";
          var scrollRoot = tabsRoot.querySelector(".source-tabs-scroll");
          if (scrollRoot) scrollRoot.addEventListener("scroll", function () { updateSourceTabsScrollControls(tabsRoot); }, { passive: true });
        }
        var active = tabsRoot.querySelector(".source-tabs-scroll > [role='tab'].is-active:not(:disabled)");
        if (!active) active = tabsRoot.querySelector(".source-tabs-scroll > [role='tab']:not(:disabled)");
        if (active) activateSourceTab(active, { immediate: true });
        else syncSourceTabs(tabsRoot, true);
      });
    }

    interactionRoot.querySelectorAll("input[data-indeterminate]").forEach(function (input) {
      input.indeterminate = true;
      updateCheckboxControl(input);
    });
    interactionRoot.querySelectorAll("[data-checkbox-group]").forEach(function (group) { syncCheckboxGroup(group); });
    interactionRoot.querySelectorAll("[data-checkbox-picker]").forEach(function (picker) { renderCheckboxPicker(picker); });
    initializeScrollbars(interactionRoot);
    initializeAnchorScroll(interactionRoot);
    initializeColorPickers(interactionRoot);
    initializeTreeSelect(interactionRoot);
    initializePeopleTrees(interactionRoot);
    interactionRoot.querySelectorAll("[data-cascade-search]").forEach(filterCascaderSearch);
    initializeSourceTabs(interactionRoot);
    initializeTopNavigations(interactionRoot);
    initializeSideNavigations(interactionRoot);
    initializeSourceTooltips(interactionRoot);
    initializeDatePickers(interactionRoot);
    interactionRoot.querySelectorAll(".source-table-spec.is-tree-table").forEach(syncTableTreeRows);
    interactionRoot.querySelectorAll("[data-table-fixed-scroll]").forEach(syncFixedTableScrollState);

    interactionRoot.addEventListener("b2b:specimens-rendered", function (event) {
      var renderedRoot = event.detail && event.detail.root ? event.detail.root : interactionRoot;
      renderedRoot.querySelectorAll("input[data-indeterminate]").forEach(function (input) {
        input.indeterminate = true;
        updateCheckboxControl(input);
      });
      renderedRoot.querySelectorAll("[data-checkbox-group]").forEach(function (group) { syncCheckboxGroup(group); });
      renderedRoot.querySelectorAll("[data-checkbox-picker]").forEach(function (picker) { renderCheckboxPicker(picker); });
      initializeScrollbars(renderedRoot);
      initializeAnchorScroll(renderedRoot);
      initializeColorPickers(renderedRoot);
      initializeTreeSelect(renderedRoot);
      initializePeopleTrees(renderedRoot);
      renderedRoot.querySelectorAll("[data-cascade-search]").forEach(filterCascaderSearch);
      initializeSourceTabs(renderedRoot);
      initializeTopNavigations(renderedRoot);
      initializeSideNavigations(renderedRoot);
      initializeSourceTooltips(renderedRoot);
      initializeDatePickers(renderedRoot);
      renderedRoot.querySelectorAll(".source-table-spec.is-tree-table").forEach(syncTableTreeRows);
      renderedRoot.querySelectorAll("[data-table-fixed-scroll]").forEach(syncFixedTableScrollState);
    });

    interactionRoot.addEventListener("pointerover", function (event) {
      var tooltipRoot = sourceTooltipRootForTarget(event.target);
      if (!tooltipRoot || sourceTooltipContains(tooltipRoot, event.relatedTarget)) return;
      tooltipRoot._b2bTooltipPointerInside = true;
      scheduleSourceTooltip(tooltipRoot, true);
    });

    interactionRoot.addEventListener("pointerout", function (event) {
      var tooltipRoot = sourceTooltipRootForTarget(event.target);
      if (!tooltipRoot || sourceTooltipContains(tooltipRoot, event.relatedTarget)) return;
      tooltipRoot._b2bTooltipPointerInside = false;
      if (!tooltipRoot._b2bTooltipFocusInside) scheduleSourceTooltip(tooltipRoot, false);
    });

    interactionRoot.addEventListener("focusin", function (event) {
      var tooltipRoot = sourceTooltipRootForTarget(event.target);
      if (!tooltipRoot) return;
      tooltipRoot._b2bTooltipFocusInside = true;
      scheduleSourceTooltip(tooltipRoot, true);
    });

    interactionRoot.addEventListener("focusout", function (event) {
      var tooltipRoot = sourceTooltipRootForTarget(event.target);
      if (!tooltipRoot || sourceTooltipContains(tooltipRoot, event.relatedTarget)) return;
      tooltipRoot._b2bTooltipFocusInside = false;
      if (!tooltipRoot._b2bTooltipPointerInside) scheduleSourceTooltip(tooltipRoot, false);
    });

    interactionRoot.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var tooltipRoot = sourceTooltipRootForTarget(event.target);
      if (!tooltipRoot || !tooltipRoot.classList.contains("is-open")) return;
      setSourceTooltipOpen(tooltipRoot, false);
      event.preventDefault();
    });

    var topNavLayoutFrame = 0;
    function scheduleTopNavLayout() {
      if (topNavLayoutFrame) return;
      topNavLayoutFrame = window.requestAnimationFrame(function () {
        topNavLayoutFrame = 0;
        interactionRoot.querySelectorAll("[data-source-tabs]").forEach(function (tabsRoot) {
          if (!isDirectRendererNode(tabsRoot)) syncSourceTabs(tabsRoot, false);
        });
        interactionRoot.querySelectorAll(".top-navigation-tabs").forEach(function (tabList) { syncTopNavIndicator(tabList, false); });
        interactionRoot.querySelectorAll("[data-top-nav-more]").forEach(function (more) {
          var menu = more.querySelector(".top-nav-menu");
          if (menu && menu.classList.contains("is-open")) positionTopNavMenu(more);
        });
        interactionRoot.querySelectorAll("[data-side-web-nav].is-flyout-open").forEach(function (nav) {
          var flyout = nav.querySelector("[data-side-nav-flyout]");
          var sourceItem = flyout && sideNavRailItemForKey(nav, flyout.dataset.sourceKey);
          if (sourceItem) positionSideNavFlyout(nav, sourceItem);
        });
      });
    }
    window.addEventListener("resize", scheduleTopNavLayout);
    window.addEventListener("scroll", function (event) {
      var scrollTarget = event.target;
      var scrollingInsideFloatingNavigation = scrollTarget && scrollTarget.closest && scrollTarget.closest(".top-nav-menu, .side-nav-flyout");
      if (!scrollingInsideFloatingNavigation) {
        interactionRoot.querySelectorAll("[data-top-nav-more]").forEach(function (more) {
          var owningTopNavigation = more.closest("[data-component-renderer='navigationMenu']");
          if (owningTopNavigation && isDirectRendererNode(owningTopNavigation)) return;
          var menu = more.querySelector(".top-nav-menu");
          if (menu && menu.classList.contains("is-open")) setTopNavMenuOpen(more, false, false);
        });
        interactionRoot.querySelectorAll("[data-side-web-nav].is-flyout-open").forEach(function (nav) {
          if (isDirectRendererNode(nav)) return;
          hideSideNavFlyout(nav, true);
        });
      }
      scheduleTopNavLayout();
    }, true);
    window.addEventListener("b2b:icon-status", scheduleTopNavLayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleTopNavLayout);

    interactionRoot.addEventListener("pointerover", function (event) {
      var item = event.target.closest && event.target.closest(".side-web-navigation.is-collapsed > .side-web-list > .side-nav-node > .side-nav-item");
      var node = sideNavRailNode(item);
      var nav = node && node.closest("[data-side-web-nav]");
      if (!nav) return;
      if (isDirectRendererNode(nav)) return;
      if (node.querySelector(":scope > .side-nav-children")) showSideNavFlyout(nav, node, false, false);
      else hideSideNavFlyout(nav, false);
    });

    interactionRoot.addEventListener("pointerout", function (event) {
      var nav = event.target.closest && event.target.closest("[data-side-web-nav].is-collapsed");
      if (!nav || event.relatedTarget && nav.contains(event.relatedTarget)) return;
      if (isDirectRendererNode(nav)) return;
      scheduleSideNavFlyoutClose(nav);
    });

    interactionRoot.addEventListener("focusin", function (event) {
      var item = event.target.closest && event.target.closest(".side-web-navigation.is-collapsed > .side-web-list > .side-nav-node > .side-nav-item");
      var node = sideNavRailNode(item);
      var nav = node && node.closest("[data-side-web-nav]");
      if (nav && isDirectRendererNode(nav)) return;
      if (nav && node.querySelector(":scope > .side-nav-children")) showSideNavFlyout(nav, node, false, false);
    });

    interactionRoot.addEventListener("focusout", function (event) {
      var nav = event.target.closest && event.target.closest("[data-side-web-nav].is-collapsed");
      if (!nav || event.relatedTarget && nav.contains(event.relatedTarget)) return;
      if (isDirectRendererNode(nav)) return;
      scheduleSideNavFlyoutClose(nav);
    });

    function positionTableFloatingPopup(popupRoot) {
      if (!popupRoot || !popupRoot.matches(".table-filter-dropdown, .table-action-dropdown")) return;
      var trigger = popupRoot.querySelector("[data-popup-trigger]");
      var panel = popupRoot.querySelector("[data-popup-panel]");
      if (!trigger || !panel) return;
      var triggerRect = trigger.getBoundingClientRect();
      var isFilter = popupRoot.classList.contains("table-filter-dropdown");
      var panelWidth = Math.max(panel.offsetWidth || (isFilter ? 200 : 160), isFilter ? 200 : 160);
      var panelHeight = Math.max(panel.offsetHeight || (isFilter ? 160 : 32), isFilter ? 160 : 32);
      var viewportWidth = document.documentElement.clientWidth;
      var viewportHeight = document.documentElement.clientHeight;
      var left = Math.min(Math.max(8, triggerRect.right - panelWidth), Math.max(8, viewportWidth - panelWidth - 8));
      var opensUp = triggerRect.bottom + 6 + panelHeight > viewportHeight && triggerRect.top - panelHeight - 6 >= 8;
      var top = opensUp ? triggerRect.top - panelHeight - 6 : triggerRect.bottom + 6;
      top = Math.min(Math.max(8, top), Math.max(8, viewportHeight - panelHeight - 8));
      panel.style.left = Math.round(left) + "px";
      panel.style.right = "auto";
      panel.style.top = Math.round(top) + "px";
      panel.style.bottom = "auto";
      panel.dataset.popupViewportPlacement = opensUp ? "top-fitted" : "bottom-fitted";
      popupRoot.classList.toggle("is-open-up", opensUp);
    }

    function isSourceButtonPopup(popupRoot) {
      if (!popupRoot || popupRoot.matches(".table-filter-dropdown, .table-action-dropdown")) return false;
      return Boolean(popupRoot.classList.contains("icon-more-dropdown") || popupRoot.closest(".b2b-menu-button-source"));
    }

    function resetSourceButtonPopup(popupRoot) {
      if (!isSourceButtonPopup(popupRoot)) return;
      var panel = popupRoot.querySelector("[data-popup-panel]");
      if (!panel) return;
      panel.style.left = "";
      panel.style.right = "";
      panel.style.top = "";
      panel.style.bottom = "";
      panel.style.maxWidth = "";
      panel.style.minWidth = "";
      panel.style.maxHeight = "";
      delete panel.dataset.popupViewportPlacement;
      popupRoot.classList.remove("is-open-up");
    }

    function positionSourceButtonPopup(popupRoot) {
      if (!isSourceButtonPopup(popupRoot) || !popupRoot.classList.contains("is-open")) return;
      var trigger = popupRoot.querySelector("[data-popup-trigger]");
      var panel = popupRoot.querySelector("[data-popup-panel]");
      if (!trigger || !panel) return;
      resetSourceButtonPopup(popupRoot);
      var padding = 8;
      var bounds = { left: padding, top: padding, right: document.documentElement.clientWidth - padding, bottom: document.documentElement.clientHeight - padding };
      // Absolute menus stay in their canonical owner. Respect every scroll/clip ancestor.
      for (var ancestor = popupRoot.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
        var style = getComputedStyle(ancestor), rect = ancestor.getBoundingClientRect();
        if (/auto|scroll|hidden|clip/.test(style.overflowX)) {
          bounds.left = Math.max(bounds.left, rect.left + ancestor.clientLeft + padding);
          bounds.right = Math.min(bounds.right, rect.left + ancestor.clientLeft + ancestor.clientWidth - padding);
        }
        if (/auto|scroll|hidden|clip/.test(style.overflowY)) {
          bounds.top = Math.max(bounds.top, rect.top + ancestor.clientTop + padding);
          bounds.bottom = Math.min(bounds.bottom, rect.top + ancestor.clientTop + ancestor.clientHeight - padding);
        }
      }
      panel.style.maxWidth = Math.max(0, bounds.right - bounds.left) + "px";
      panel.style.minWidth = Math.min(parseFloat(getComputedStyle(panel).minWidth) || 0, Math.max(0, bounds.right - bounds.left)) + "px";
      var rootRect = popupRoot.getBoundingClientRect();
      var panelLeft = rootRect.left + panel.offsetLeft;
      var left = Math.max(bounds.left, Math.min(panelLeft, bounds.right - panel.offsetWidth));
      var horizontalDelta = left - panelLeft;
      if (horizontalDelta) { panel.style.left = Math.round(left - rootRect.left) + "px"; panel.style.right = "auto"; }
      var triggerRect = trigger.getBoundingClientRect(), gap = 4;
      var belowSpace = bounds.bottom - triggerRect.bottom - gap;
      var aboveSpace = triggerRect.top - bounds.top - gap;
      var opensUp = panel.offsetHeight > belowSpace && aboveSpace > belowSpace;
      var availableHeight = Math.max(0, opensUp ? aboveSpace : belowSpace);
      if (panel.offsetHeight > availableHeight) panel.style.maxHeight = Math.floor(availableHeight) + "px";
      if (opensUp) { panel.style.top = "auto"; panel.style.bottom = "calc(100% + var(--b2b-space-1))"; popupRoot.classList.add("is-open-up"); }
      panel.dataset.popupViewportPlacement = opensUp ? "top-fitted" : (horizontalDelta ? "bottom-fitted" : "bottom");
    }

    D.syncSourceButtonPopup = positionSourceButtonPopup;

    function syncOpenTableFloatingPopups() {
      interactionRoot.querySelectorAll(".table-filter-dropdown.is-open, .table-action-dropdown.is-open").forEach(positionTableFloatingPopup);
    }

    function syncOpenSourceButtonPopups() {
      interactionRoot.querySelectorAll(".icon-more-dropdown.is-open, .b2b-menu-button-source [data-popup-root].is-open").forEach(positionSourceButtonPopup);
    }

    function c08CascadeRoot(node) {
      if (!node || !node.closest) return null;
      var reference = node.closest('[data-component-reference="C-08"]');
      var root = reference && (reference.matches("[data-popup-root], [data-context-menu-stage]") ? reference : reference.closest("[data-popup-root], [data-context-menu-stage]"));
      return root && usesSharedPopupInteraction(root) ? root : null;
    }

    function directMenuItems(panel) {
      if (!panel) return [];
      return Array.from(panel.children).filter(function (item) {
        return item.matches && item.matches(".demo-menu-item:not(:disabled):not([aria-disabled='true'])");
      });
    }

    function submenuPanel(owner) {
      return owner && owner.querySelector(":scope > [data-submenu-panel]");
    }

    function submenuLabel(owner) {
      var label = owner && owner.querySelector(":scope > .menu-item-main, :scope > span:not(.submenu-panel)");
      return label ? label.textContent.trim() : "";
    }

    function submenuDepth(owner) {
      var depth = 2;
      var panel = owner && owner.closest("[data-submenu-panel]");
      while (panel) {
        depth += 1;
        panel = panel.parentElement && panel.parentElement.closest("[data-submenu-panel]");
      }
      return depth;
    }

    function measureC08Submenu(owner) {
      var panel = submenuPanel(owner);
      if (!panel || !owner.isConnected) return null;
      var ownerRect = owner.getBoundingClientRect();
      var panelWidth = panel.offsetWidth;
      var panelHeight = panel.offsetHeight;
      var viewportWidth = document.documentElement.clientWidth;
      var viewportHeight = document.documentElement.clientHeight;
      var viewportPadding = 8;
      var panelPaddingBlock = 8;
      var rightCandidate = ownerRect.right;
      var leftCandidate = ownerRect.left - panelWidth;
      var maxLeft = Math.max(viewportPadding, viewportWidth - panelWidth - viewportPadding);
      var desiredLeft;
      var placement;
      if (rightCandidate + panelWidth <= viewportWidth - viewportPadding) {
        desiredLeft = rightCandidate;
        placement = "right";
      } else if (leftCandidate >= viewportPadding) {
        desiredLeft = leftCandidate;
        placement = "left";
      } else {
        desiredLeft = Math.min(Math.max(viewportPadding, rightCandidate), maxLeft);
        placement = "constrained";
      }
      var contentAlignedTop = ownerRect.top - panelPaddingBlock;
      var desiredTop = Math.min(Math.max(viewportPadding, contentAlignedTop), Math.max(viewportPadding, viewportHeight - panelHeight - viewportPadding));
      return {
        owner: owner,
        panel: panel,
        left: desiredLeft - ownerRect.left,
        top: desiredTop - ownerRect.top,
        placement: placement
      };
    }

    function applyC08SubmenuPlacements(placements) {
      placements.filter(Boolean).forEach(function (placement) {
        placement.panel.style.left = Math.round(placement.left) + "px";
        placement.panel.style.right = "auto";
        placement.panel.style.top = Math.round(placement.top) + "px";
        placement.panel.dataset.submenuPlacement = placement.placement;
      });
    }

    function positionC08Submenus(owners) {
      var placements = owners.filter(function (owner) {
        return owner.getAttribute("aria-expanded") === "true";
      }).map(measureC08Submenu);
      applyC08SubmenuPlacements(placements);
    }

    function positionC08Submenu(owner) {
      positionC08Submenus([owner]);
    }

    function cancelC08PendingWork(root) {
      if (!root) return;
      window.cancelAnimationFrame(root._c08PositionFrame || 0);
      root._c08PositionFrame = 0;
      root.querySelectorAll("[data-submenu-owner]").forEach(function (owner) {
        window.clearTimeout(owner._c08SubmenuCloseTimer);
        owner._c08SubmenuCloseTimer = 0;
      });
    }

    function scheduleC08SubmenuPosition(root) {
      if (!root || root._c08PositionFrame) return;
      root._c08PositionFrame = window.requestAnimationFrame(function () {
        root._c08PositionFrame = 0;
        if (!root.isConnected || !root.classList.contains("is-open")) return;
        positionC08Submenus(Array.from(root.querySelectorAll('[data-submenu-owner][aria-expanded="true"]')));
      });
    }

    function emitC08SubmenuState(owner, open, source) {
      var root = c08CascadeRoot(owner);
      var panel = submenuPanel(owner);
      if (!root || !panel) return;
      root.dispatchEvent(new CustomEvent("b2b:c08-submenu-state", {
        bubbles: true,
        detail: {
          label: submenuLabel(owner),
          depth: submenuDepth(owner),
          open: open,
          placement: panel.dataset.submenuPlacement || null,
          source: source || "canonical-interaction"
        }
      }));
    }

    function syncC08SubmenuState(owner, open, source, emit) {
      var panel = submenuPanel(owner);
      var root = c08CascadeRoot(owner);
      if (!panel || !root) return false;
      window.clearTimeout(owner._c08SubmenuCloseTimer);
      owner._c08SubmenuCloseTimer = 0;
      var previous = owner.getAttribute("aria-expanded") === "true";
      if (previous === open) {
        if (open) scheduleC08SubmenuPosition(root);
        return false;
      }
      if (open) {
        var menu = owner.parentElement;
        directMenuItems(menu).forEach(function (sibling) {
          if (sibling !== owner && sibling.hasAttribute("data-submenu-owner")) syncC08SubmenuState(sibling, false, source, emit);
        });
      } else {
        closeC08Submenus(panel, source, emit);
      }
      owner.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      panel.classList.toggle("is-force-open", open);
      if (open) positionC08Submenu(owner);
      else {
        if (emit !== false) emitC08SubmenuState(owner, false, source);
        panel.style.left = "";
        panel.style.right = "";
        panel.style.top = "";
        delete panel.dataset.submenuPlacement;
      }
      if (open && emit !== false) emitC08SubmenuState(owner, true, source);
      return true;
    }

    function closeC08Submenus(root, source, emit) {
      if (!root) return;
      var cascadeRoot = c08CascadeRoot(root) || (root.matches && root.matches('[data-component-reference="C-08"]') ? root : null);
      if (cascadeRoot) cancelC08PendingWork(cascadeRoot);
      Array.from(root.querySelectorAll('[data-submenu-owner][aria-expanded="true"]')).reverse().forEach(function (owner) {
        var panel = submenuPanel(owner);
        window.clearTimeout(owner._c08SubmenuCloseTimer);
        owner._c08SubmenuCloseTimer = 0;
        owner.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
        panel.classList.remove("is-force-open");
        if (emit !== false) emitC08SubmenuState(owner, false, source || "popup-close");
        panel.style.left = "";
        panel.style.right = "";
        panel.style.top = "";
        delete panel.dataset.submenuPlacement;
      });
    }

    function syncOpenC08Submenus() {
      var roots = new Set();
      interactionRoot.querySelectorAll('[data-component-reference="C-08"] [data-submenu-owner][aria-expanded="true"]').forEach(function (owner) {
        var root = c08CascadeRoot(owner);
        if (root) roots.add(root);
      });
      roots.forEach(scheduleC08SubmenuPosition);
    }

    function setC08ContextMenuState(contextStage, open, restoreFocus) {
      if (!contextStage || !usesSharedPopupInteraction(contextStage)) return;
      var contextPanel = contextStage.querySelector("[data-context-menu-panel], .context-menu-panel");
      if (!contextPanel) return;
      contextStage.classList.toggle("is-open", open);
      contextStage.setAttribute("aria-expanded", String(open));
      contextPanel.setAttribute("aria-hidden", String(!open));
      if (!open) {
        cancelC08PendingWork(contextStage);
        closeC08Submenus(contextStage, "popup-close", true);
      }
      if (open) {
        var contextFirstItem = contextPanel.querySelector(".demo-menu-item:not(:disabled):not([aria-disabled='true'])");
        if (contextFirstItem) contextFirstItem.focus();
      } else if (restoreFocus) {
        var restoreTarget = contextStage._b2bContextRestoreTarget;
        if (!restoreTarget || !restoreTarget.isConnected || typeof restoreTarget.focus !== "function") restoreTarget = contextStage;
        restoreTarget.focus();
      }
    }

    function setPopupState(popupRoot, open, focusFirst) {
      if (!popupRoot) return;
      var trigger = popupRoot.querySelector("[data-popup-trigger]");
      var panel = popupRoot.querySelector("[data-popup-panel]");
      var sourceMenuButton = popupRoot.closest(".b2b-menu-button-source");
      if (open && popupRoot.classList.contains("table-filter-dropdown")) {
        popupRoot.querySelectorAll("[data-table-filter-option]").forEach(function (option) {
          option.checked = option.getAttribute("data-filter-committed") === "true";
          updateCheckboxControl(option);
        });
      }
      popupRoot.classList.toggle("is-open", open);
      if (trigger) {
        trigger.setAttribute("aria-expanded", String(open));
        trigger.classList.toggle("is-expanded", open);
      }
      if (panel) panel.setAttribute("aria-hidden", String(!open));
      if (open) positionTableFloatingPopup(popupRoot);
      if (open) positionSourceButtonPopup(popupRoot);
      else resetSourceButtonPopup(popupRoot);
      if (!open) closeC08Submenus(popupRoot, "popup-close", true);
      if (open && focusFirst && panel) {
        var first = directMenuItems(panel)[0] || panel.querySelector("[data-table-filter-option]:not(:disabled), .table-filter-actions button:not(:disabled), input:not(:disabled), button:not(:disabled)");
        if (first) first.focus();
      }
      if (sourceMenuButton) {
        sourceMenuButton.dispatchEvent(new CustomEvent("b2b:source-menu-button-state", {
          bubbles: true,
          detail: { open: open }
        }));
      }
    }

    function closeOtherPopups(except) {
      interactionRoot.querySelectorAll("[data-popup-root].is-open").forEach(function (popupRoot) {
        if (popupRoot !== except && usesSharedPopupInteraction(popupRoot)) setPopupState(popupRoot, false, false);
      });
    }

    interactionRoot.addEventListener("b2b:c08-dispose", function (event) {
      var root = c08CascadeRoot(event.target) || event.target.closest && event.target.closest('[data-source-dropdown-menu][data-component-reference="C-08"]');
      if (!root) return;
      cancelC08PendingWork(root);
      closeC08Submenus(root, "destroy", false);
    });

    window.addEventListener("resize", function () {
      syncOpenTableFloatingPopups();
      syncOpenSourceButtonPopups();
      syncOpenC08Submenus();
      syncOpenSourceTooltips();
      interactionRoot.querySelectorAll("[data-table-fixed-scroll]").forEach(syncFixedTableScrollState);
    }, { passive: true });
    window.addEventListener("scroll", function () {
      syncOpenTableFloatingPopups();
      syncOpenSourceButtonPopups();
      syncOpenC08Submenus();
      syncOpenSourceTooltips();
    }, { passive: true, capture: true });
    interactionRoot.addEventListener("scroll", function (event) {
      var fixedTableScroll = event.target.closest && event.target.closest("[data-table-fixed-scroll]");
      if (fixedTableScroll && event.target === fixedTableScroll) syncFixedTableScrollState(fixedTableScroll);
    }, true);

    function syncTopNavIndicator(tabList, immediate) {
      if (!tabList) return;
      var active = tabList.querySelector(":scope > .top-nav-tab.is-active, :scope > .top-nav-more > .top-nav-tab.is-active");
      if (!active) {
        tabList.style.setProperty("--top-nav-indicator-opacity", "0");
        return;
      }
      var listRect = tabList.getBoundingClientRect();
      var activeRect = active.getBoundingClientRect();
      tabList.style.setProperty("--top-nav-indicator-x", Math.round(activeRect.left - listRect.left + tabList.scrollLeft) + "px");
      tabList.style.setProperty("--top-nav-indicator-width", Math.round(activeRect.width) + "px");
      tabList.style.setProperty("--top-nav-indicator-opacity", "1");
      if (immediate) {
        tabList.classList.remove("is-indicator-ready");
        window.requestAnimationFrame(function () { tabList.classList.add("is-indicator-ready"); });
      } else {
        tabList.classList.add("is-indicator-ready");
      }
    }

    function isTopNavPopoverOpen(menu) {
      if (!menu || !menu.matches) return false;
      try { return menu.matches(":popover-open"); }
      catch (error) { return false; }
    }

    function positionTopNavMenu(more) {
      if (!more) return;
      var trigger = more.querySelector(":scope > .top-nav-tab");
      var menu = more.querySelector(".top-nav-menu");
      if (!trigger || !menu) return;
      var triggerRect = trigger.getBoundingClientRect();
      var viewportGap = 16;
      var menuGap = 4;
      menu.style.setProperty("--top-nav-menu-left", Math.round(triggerRect.left) + "px");
      menu.style.setProperty("--top-nav-menu-top", Math.round(triggerRect.bottom + menuGap) + "px");
      var menuRect = menu.getBoundingClientRect();
      var left = Math.min(Math.max(viewportGap, triggerRect.left), window.innerWidth - menuRect.width - viewportGap);
      var top = triggerRect.bottom + menuGap;
      if (top + menuRect.height > window.innerHeight - viewportGap && triggerRect.top - menuRect.height - menuGap >= viewportGap) {
        top = triggerRect.top - menuRect.height - menuGap;
        menu.style.setProperty("transform-origin", "bottom left");
      } else {
        menu.style.setProperty("transform-origin", "top left");
      }
      menu.style.setProperty("--top-nav-menu-left", Math.round(left) + "px");
      menu.style.setProperty("--top-nav-menu-top", Math.round(Math.max(viewportGap, top)) + "px");
    }

    function setTopNavMenuOpen(more, open, focusFirst) {
      if (!more) return;
      var trigger = more.querySelector(":scope > .top-nav-tab");
      var menu = more.querySelector(".top-nav-menu");
      if (!trigger || !menu) return;
      trigger.setAttribute("aria-expanded", String(open));
      var arrow = trigger.querySelector(".b2b-icon");
      if (arrow) arrow.textContent = open ? "expand_less" : "expand_more";
      if (open) {
        menu.hidden = false;
        menu.classList.add("is-open");
        positionTopNavMenu(more);
        if (typeof menu.showPopover === "function" && !isTopNavPopoverOpen(menu)) {
          try { menu.showPopover(); }
          catch (error) { /* Fixed-position fallback remains active. */ }
        }
        positionTopNavMenu(more);
        if (focusFirst) {
          var first = menu.querySelector("[role='menuitem']:not(:disabled)");
          if (first) first.focus();
        }
      } else {
        if (typeof menu.hidePopover === "function" && isTopNavPopoverOpen(menu)) {
          try { menu.hidePopover(); }
          catch (error) { /* Hidden attribute below is the fallback. */ }
        }
        menu.classList.remove("is-open");
        menu.hidden = true;
      }
    }

    function initializeTopNavigations(root) {
      (root || interactionRoot).querySelectorAll(".top-navigation-tabs").forEach(function (tabList) {
        syncTopNavIndicator(tabList, true);
      });
      (root || interactionRoot).querySelectorAll("[data-top-nav-more]").forEach(function (more) {
        var menu = more.querySelector(".top-nav-menu");
        var trigger = more.querySelector(":scope > .top-nav-tab");
        var shouldOpen = Boolean(menu && menu.dataset.initialOpen === "true") || Boolean(trigger && trigger.getAttribute("aria-expanded") === "true");
        if (menu) menu.removeAttribute("data-initial-open");
        setTopNavMenuOpen(more, shouldOpen, false);
      });
    }

    function setSideWebNavigationExpanded(nav, expanded) {
      if (!nav) return;
      var collapse = nav.querySelector("[data-side-nav-collapse]");
      if (expanded) hideSideNavFlyout(nav, true);
      nav.classList.toggle("is-collapsed", !expanded);
      nav.style.setProperty("--side-web-width", expanded ? "240px" : "64px");
      nav.querySelectorAll(":scope > .side-web-list > .side-nav-node > [data-side-nav-expand]").forEach(function (item) {
        var node = item.closest(".side-nav-node");
        var children = node && node.querySelector(":scope > .side-nav-children");
        if (expanded) {
          var hasStoredInlineState = item.dataset.inlineExpanded === "true" || item.dataset.inlineExpanded === "false";
          var restored = hasStoredInlineState ? item.dataset.inlineExpanded === "true" : item.getAttribute("aria-expanded") === "true";
          item.setAttribute("aria-expanded", String(restored));
          if (node) node.classList.toggle("is-expanded", restored);
          if (children) children.hidden = !restored;
          if (hasStoredInlineState) delete item.dataset.inlineExpanded;
        } else {
          if (!item.dataset.inlineExpanded) item.dataset.inlineExpanded = item.getAttribute("aria-expanded") === "true" ? "true" : "false";
          item.setAttribute("aria-expanded", "false");
        }
      });
      if (collapse) {
        collapse.setAttribute("aria-expanded", String(expanded));
        collapse.setAttribute("aria-label", expanded ? "收起导航" : "展开导航");
        var icon = collapse.querySelector(".b2b-icon");
        if (icon) icon.textContent = "menu_open";
      }
      if (nav._b2bUpdateThumbs) window.requestAnimationFrame(nav._b2bUpdateThumbs);
      nav.dispatchEvent(new CustomEvent("b2b:side-nav-resize", {
        bubbles: true,
        detail: { expanded: expanded, width: expanded ? 240 : 64 }
      }));
    }

    function sideNavRailNode(item) {
      if (!item || item.closest(".side-nav-flyout")) return null;
      var node = item.closest(".side-nav-node");
      return node && node.parentElement && node.parentElement.classList.contains("side-web-list") ? node : null;
    }

    function sideNavRailItemForKey(nav, key) {
      if (!nav || !key) return null;
      return Array.from(nav.querySelectorAll(":scope > .side-web-list > .side-nav-node > .side-nav-item")).find(function (item) {
        return item.dataset.navKey === key;
      }) || null;
    }

    function populateSideNavFlyout(nav, node) {
      var flyout = nav && nav.querySelector("[data-side-nav-flyout]");
      var sourceItem = node && node.querySelector(":scope > .side-nav-item");
      var children = node && node.querySelector(":scope > .side-nav-children");
      if (!flyout || !sourceItem || !children) return false;
      var title = flyout.querySelector(":scope > strong");
      var list = flyout.querySelector("[data-side-nav-flyout-list]");
      var label = sourceItem.querySelector(".side-nav-label");
      if (title) title.textContent = label ? label.textContent : "Navigation";
      if (list) {
        list.replaceChildren();
        Array.from(children.children).forEach(function (child) { list.appendChild(child.cloneNode(true)); });
      }
      flyout.dataset.sourceKey = sourceItem.dataset.navKey || "";
      return true;
    }

    function positionSideNavFlyout(nav, sourceItem) {
      var flyout = nav && nav.querySelector("[data-side-nav-flyout]");
      if (!flyout || !sourceItem) return;
      var navRect = nav.getBoundingClientRect();
      var itemRect = sourceItem.getBoundingClientRect();
      var viewportGap = 16;
      var flyoutGap = 4;
      flyout.style.setProperty("--side-nav-flyout-left", Math.round(navRect.right + flyoutGap) + "px");
      flyout.style.setProperty("--side-nav-flyout-top", Math.round(itemRect.top) + "px");
      var flyoutRect = flyout.getBoundingClientRect();
      var firstItem = flyout.querySelector(".side-nav-flyout-list .side-nav-item");
      var firstItemOffset = firstItem ? firstItem.getBoundingClientRect().top - flyoutRect.top : 32;
      var left = navRect.right + flyoutGap;
      if (left + flyoutRect.width > window.innerWidth - viewportGap && navRect.left - flyoutRect.width - flyoutGap >= viewportGap) {
        left = navRect.left - flyoutRect.width - flyoutGap;
        flyout.style.setProperty("transform-origin", "right top");
      } else {
        left = Math.min(left, window.innerWidth - flyoutRect.width - viewportGap);
        flyout.style.setProperty("transform-origin", "left top");
      }
      var top = Math.max(viewportGap, Math.min(itemRect.top - firstItemOffset, window.innerHeight - flyoutRect.height - viewportGap));
      flyout.style.setProperty("--side-nav-flyout-left", Math.round(Math.max(viewportGap, left)) + "px");
      flyout.style.setProperty("--side-nav-flyout-top", Math.round(top) + "px");
    }

    function showSideNavFlyout(nav, node, pinned, focusFirst) {
      if (!nav || !node || !nav.classList.contains("is-collapsed")) return false;
      var sourceItem = node.querySelector(":scope > .side-nav-item");
      var sourceKey = sourceItem && sourceItem.dataset.navKey || "";
      var flyout = nav.querySelector("[data-side-nav-flyout]");
      if (!sourceItem || !flyout || !node.querySelector(":scope > .side-nav-children")) return false;
      window.clearTimeout(nav._sideNavFlyoutTimer);
      nav._sideNavFlyoutTimer = null;
      var sourceChanged = flyout.dataset.sourceKey !== sourceKey;
      var wasOpen = flyout.classList.contains("is-open");
      if (sourceChanged) {
        var previousSource = sideNavRailItemForKey(nav, flyout.dataset.sourceKey);
        if (previousSource) previousSource.setAttribute("aria-expanded", "false");
      }
      if (sourceChanged || !flyout.classList.contains("is-open")) populateSideNavFlyout(nav, node);
      if (pinned || sourceChanged || !nav.dataset.flyoutPinned) nav.dataset.flyoutPinned = String(Boolean(pinned));
      sourceItem.setAttribute("aria-expanded", "true");
      nav.classList.add("is-flyout-open");
      if (!wasOpen) flyout.classList.add("is-opening");
      flyout.hidden = false;
      positionSideNavFlyout(nav, sourceItem);
      if (typeof flyout.showPopover === "function" && !isTopNavPopoverOpen(flyout)) {
        try { flyout.showPopover(); }
        catch (error) { /* Fixed-position fallback remains active. */ }
      }
      flyout.classList.add("is-open");
      positionSideNavFlyout(nav, sourceItem);
      if (!wasOpen) {
        window.requestAnimationFrame(function () { flyout.classList.remove("is-opening"); });
      }
      if (focusFirst) {
        var first = flyout.querySelector(".side-nav-flyout-list .side-nav-item:not(:disabled)");
        if (first) first.focus();
      }
      return true;
    }

    function hideSideNavFlyout(nav, force) {
      if (!nav || !force && nav.dataset.flyoutPinned === "true") return;
      window.clearTimeout(nav._sideNavFlyoutTimer);
      nav._sideNavFlyoutTimer = null;
      var flyout = nav.querySelector("[data-side-nav-flyout]");
      if (flyout) {
        var sourceItem = sideNavRailItemForKey(nav, flyout.dataset.sourceKey);
        if (sourceItem && nav.classList.contains("is-collapsed")) sourceItem.setAttribute("aria-expanded", "false");
        if (typeof flyout.hidePopover === "function" && isTopNavPopoverOpen(flyout)) {
          try { flyout.hidePopover(); }
          catch (error) { /* Hidden attribute below is the fallback. */ }
        }
        flyout.classList.remove("is-open");
        flyout.classList.remove("is-opening");
        flyout.hidden = true;
      }
      nav.classList.remove("is-flyout-open");
      delete nav.dataset.flyoutPinned;
    }

    function scheduleSideNavFlyoutClose(nav) {
      if (!nav || nav.dataset.flyoutPinned === "true") return;
      window.clearTimeout(nav._sideNavFlyoutTimer);
      nav._sideNavFlyoutTimer = window.setTimeout(function () { hideSideNavFlyout(nav, false); }, 180);
    }

    function activateSideNavAncestors(nav, item) {
      var node = item && item.closest(".side-nav-node");
      while (node && nav.contains(node)) {
        var children = node.parentElement;
        if (!children || !children.classList.contains("side-nav-children")) break;
        var parentNode = children.closest(".side-nav-node");
        var parentItem = parentNode && parentNode.querySelector(":scope > .side-nav-item");
        if (!parentItem) break;
        parentItem.classList.add("is-active-path");
        node = parentNode;
      }
    }

    function setSideNavigationSelection(nav, item) {
      if (!nav || !item || item.hasAttribute("data-side-nav-expand")) return;
      var key = item.dataset.navKey || "";
      var allItems = Array.from(nav.querySelectorAll(".side-nav-item"));
      allItems.forEach(function (candidate) {
        candidate.classList.remove("is-active", "is-active-path");
        candidate.removeAttribute("aria-current");
      });
      var matches = key ? allItems.filter(function (candidate) { return candidate.dataset.navKey === key; }) : [item];
      matches.forEach(function (candidate) {
        candidate.classList.add("is-active");
        candidate.setAttribute("aria-current", "page");
        activateSideNavAncestors(nav, candidate);
      });
    }

    function initializeSideNavigations(root) {
      (root || interactionRoot).querySelectorAll("[data-side-web-nav]").forEach(function (nav) {
        setSideWebNavigationExpanded(nav, !nav.classList.contains("is-collapsed"));
        if (typeof ResizeObserver === "function" && !nav._sideNavResizeObserver) {
          nav._sideNavResizeObserver = new ResizeObserver(scheduleTopNavLayout);
          nav._sideNavResizeObserver.observe(nav);
        }
        if (nav.closest(".nav-flyout-demo") && nav.classList.contains("is-collapsed")) {
          var source = Array.from(nav.querySelectorAll(":scope > .side-web-list > .side-nav-node")).find(function (node) {
            return Boolean(node.querySelector(":scope > .side-nav-item.is-active")) && Boolean(node.querySelector(":scope > .side-nav-children"));
          }) || Array.from(nav.querySelectorAll(":scope > .side-web-list > .side-nav-node")).find(function (node) { return Boolean(node.querySelector(":scope > .side-nav-children")); });
          if (source) showSideNavFlyout(nav, source, true, false);
        }
      });
      (root || interactionRoot).querySelectorAll("[data-nav-resizer]").forEach(function (resizer) {
        var nav = resizer.closest("[data-side-desktop-nav]");
        if (nav) resizer.setAttribute("aria-valuenow", nav.dataset.width || "220");
      });
    }

    function demoMenuSelectionIndicator(item) {
      if (!item) return null;
      return Array.from(item.children).find(function (child) {
        return child.classList && child.classList.contains("b2b-icon") && child.textContent.trim() === "check";
      }) || null;
    }

    function selectDemoMenuItem(menuItem) {
      if (!menuItem || !menuItem.parentElement) return;
      var menu = menuItem.parentElement;
      var items = Array.from(menu.children).filter(function (item) {
        return item.classList && item.classList.contains("demo-menu-item");
      });
      var isSelectionMenu = menu.getAttribute("role") === "listbox" || items.some(function (item) {
        return item.hasAttribute("aria-selected") || Boolean(demoMenuSelectionIndicator(item));
      });
      if (!isSelectionMenu) return;

      items.forEach(function (item) {
        var selected = item === menuItem;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-selected", String(selected));
        var indicator = demoMenuSelectionIndicator(item);
        if (!selected && indicator) indicator.remove();
        if (selected && !indicator) {
          indicator = document.createElement("span");
          indicator.className = "b2b-icon";
          indicator.setAttribute("aria-hidden", "true");
          indicator.setAttribute("data-menu-selection-indicator", "");
          indicator.textContent = "check";
          item.appendChild(indicator);
        }
      });
    }

    function setCascaderOpen(cascaderDemo, open) {
      if (!cascaderDemo) return;
      var wasOpen = cascaderDemo.classList.contains("is-open");
      var trigger = cascaderDemo.querySelector("[data-cascader-trigger]");
      var panel = cascaderDemo.querySelector("[data-cascader-panel]");
      cascaderDemo.classList.toggle("is-open", open);
      if (trigger) {
        trigger.setAttribute("aria-expanded", String(open));
        trigger.classList.toggle("is-expanded", open);
      }
      if (panel) panel.setAttribute("aria-hidden", String(!open));
      if (wasOpen !== open) {
        cascaderDemo.dispatchEvent(new CustomEvent(open ? "b2b:cascader-open" : "b2b:cascader-close", {
          bubbles: true,
          detail: { open: open }
        }));
      }
    }

    function cascaderChildrenForOption(option) {
      if (!option) return [];
      try {
        var children = JSON.parse(decodeURIComponent(option.dataset.cascadeChildren || "%5B%5D"));
        return Array.isArray(children) ? children : [];
      } catch (error) {
        return [];
      }
    }

    function setCascadeCheckVisual(option, state) {
      if (!option || !option.hasAttribute("aria-checked")) return;
      option.setAttribute("aria-checked", state);
      option.classList.toggle("is-selected", state === "true");
      option.classList.toggle("is-partial", state === "mixed");
      var check = option.querySelector(".cascade-check");
      if (check) check.innerHTML = state === "true" ? '<span class="b2b-icon" aria-hidden="true">check</span>' : (state === "mixed" ? '<span class="b2b-icon" aria-hidden="true">remove</span>' : "");
    }

    function createCascadeRuntimeColumn(items, checkable, level) {
      var template = document.createElement("template");
      template.innerHTML = D.componentFactories.cascadeColumn(items, -1, { checkable: checkable }).trim();
      var column = template.content.firstElementChild;
      column.classList.add("is-entering");
      column.dataset.cascadeLevel = String(level);
      return column;
    }

    function setCascadeLeafSelected(option, selected) {
      if (!option || option.dataset.cascadeChild !== "false" || option.hasAttribute("aria-checked")) return;
      option.classList.toggle("is-selected", selected);
      var indicator = option.querySelector(":scope > .cascade-selection-check");
      if (selected && !indicator) {
        indicator = document.createElement("span");
        indicator.className = "b2b-icon cascade-selection-check";
        indicator.setAttribute("aria-hidden", "true");
        indicator.textContent = "check";
        option.appendChild(indicator);
      } else if (!selected && indicator) indicator.remove();
    }

    function activateCascadeBranch(option) {
      if (!option || option.dataset.cascadeChild !== "true") return;
      var column = option.closest(".cascade-column");
      var demo = option.closest("[data-cascader-demo]");
      var panel = demo && demo.querySelector(".cascader-panel");
      if (!column || !panel) return;
      var columns = Array.from(panel.querySelectorAll(":scope > .cascade-column"));
      var level = columns.indexOf(column);
      column.querySelectorAll(":scope > [data-cascade-option]").forEach(function (item) {
        item.classList.toggle("is-active-path", item === option);
        if (!item.hasAttribute("aria-checked")) item.setAttribute("aria-selected", String(item === option));
      });
      columns.slice(level + 1).forEach(function (laterColumn) { laterColumn.remove(); });
      var children = cascaderChildrenForOption(option);
      if (!children || !children.length) return;
      var checkable = option.hasAttribute("aria-checked");
      var inheritChecked = checkable && option.getAttribute("aria-checked") === "true";
      var nextColumn = createCascadeRuntimeColumn(children, checkable, level + 1);
      if (inheritChecked) nextColumn.querySelectorAll(":scope > [data-cascade-option][aria-checked]").forEach(function (childOption) {
        setCascadeCheckVisual(childOption, "true");
      });
      panel.appendChild(nextColumn);
      window.requestAnimationFrame(function () { nextColumn.classList.remove("is-entering"); });
    }

    function updateCascadeAncestors(option) {
      var panel = option && option.closest(".cascader-panel");
      var column = option && option.closest(".cascade-column");
      if (!panel || !column) return;
      var columns = Array.from(panel.querySelectorAll(":scope > .cascade-column"));
      var level = columns.indexOf(column);
      for (var index = level - 1; index >= 0; index -= 1) {
        var childOptions = Array.from(columns[index + 1].querySelectorAll(":scope > [data-cascade-option][aria-checked]"));
        var checkedCount = childOptions.filter(function (item) { return item.getAttribute("aria-checked") === "true"; }).length;
        var mixedCount = childOptions.filter(function (item) { return item.getAttribute("aria-checked") === "mixed"; }).length;
        var parent = columns[index].querySelector(":scope > [data-cascade-option].is-active-path[aria-checked]");
        if (!parent || !childOptions.length) continue;
        var parentState = checkedCount === childOptions.length && mixedCount === 0 ? "true" : ((checkedCount || mixedCount) ? "mixed" : "false");
        setCascadeCheckVisual(parent, parentState);
      }
    }

    function renderCascaderTags(label, values) {
      label.innerHTML = "";
      var demo = label.closest("[data-cascader-demo]");
      if (demo) demo.dataset.cascadeValues = encodeURIComponent(JSON.stringify(values));
      if (!values.length) {
        if (label.closest(".is-searchable")) label.innerHTML = "";
        else {
          var emptyDemo = demo;
          label.textContent = emptyDemo ? emptyDemo.dataset.cascadePlaceholder : "Please select";
        }
        return;
      }
      var collapsed = demo && demo.dataset.cascadeTagDisplay === "collapsed";
      var visibleValues = collapsed ? values.slice(0, 2) : values;
      visibleValues.forEach(function (value) {
        var tag = document.createElement("span");
        tag.className = "cascade-trigger-tag";
        tag.setAttribute("data-cascade-tag", "");
        tag.dataset.cascadeTagValue = value;
        tag.title = value;
        var tagLabel = document.createElement("span");
        tagLabel.className = "cascade-trigger-tag-label";
        tagLabel.textContent = value;
        tag.appendChild(tagLabel);
        var close = document.createElement("span");
        close.className = "b2b-icon cascade-tag-remove";
        close.setAttribute("data-cascade-remove", "");
        close.setAttribute("role", "button");
        close.tabIndex = 0;
        close.setAttribute("aria-label", "移除已选项：" + value);
        close.textContent = "close";
        tag.appendChild(close);
        label.appendChild(tag);
      });
      if (collapsed && values.length > visibleValues.length) {
        var count = document.createElement("span");
        count.className = "cascade-trigger-tag is-count";
        var collapsedCount = values.length - visibleValues.length;
        count.dataset.cascadeCollapsedCount = String(collapsedCount);
        count.setAttribute("role", "note");
        count.tabIndex = 0;
        count.setAttribute("aria-label", "还有 " + collapsedCount + " 个选中项已收起");
        count.title = "还有 " + collapsedCount + " 个选中项已收起";
        count.textContent = "+" + collapsedCount;
        label.appendChild(count);
      }
    }

    function cascadePathForOption(option) {
      if (!option) return "";
      var ownValue = option.dataset.cascadeValue || "";
      if (ownValue.indexOf(" / ") >= 0) return ownValue;
      var panel = option.closest(".cascader-panel");
      var ownColumn = option.closest(".cascade-column");
      if (!panel || !ownColumn) return ownValue;
      var columns = Array.from(panel.querySelectorAll(":scope > .cascade-column"));
      var level = columns.indexOf(ownColumn);
      var path = columns.slice(0, level).map(function (column) {
        var parent = column.querySelector(":scope > [data-cascade-option].is-active-path, :scope > [data-cascade-option].is-selected");
        return parent && parent.dataset.cascadeValue;
      }).filter(Boolean);
      path.push(ownValue);
      return path.join(" / ");
    }

    function resetCascaderSearchResults(cascaderDemo) {
      if (!cascaderDemo) return;
      cascaderDemo.querySelectorAll("[data-cascade-option]").forEach(function (option) {
        option.hidden = false;
        var optionLabel = option.querySelector("[data-cascade-option-label]");
        if (optionLabel) optionLabel.textContent = option.dataset.cascadeValue || "";
      });
      var searchFeedback = cascaderDemo.querySelector(".cascade-search-feedback");
      if (searchFeedback) searchFeedback.remove();
      var searchPanel = cascaderDemo.querySelector(".cascader-panel");
      if (searchPanel) searchPanel.hidden = false;
    }

    function syncCascaderTrigger(cascaderDemo) {
      if (!cascaderDemo) return;
      var trigger = cascaderDemo.querySelector("[data-cascader-trigger]");
      var label = cascaderDemo.querySelector("[data-cascade-label]");
      var searchInput = cascaderDemo.querySelector("[data-cascade-search]");
      var multiple = cascaderDemo.classList.contains("is-multiple");
      var hasValue = false;
      if (label && multiple) {
        var checkedOptions = Array.from(cascaderDemo.querySelectorAll('[data-cascade-option][aria-checked="true"]'));
        var leafValues = checkedOptions.filter(function (item) { return item.dataset.cascadeChild === "false"; }).map(cascadePathForOption);
        var allColumns = Array.from(cascaderDemo.querySelectorAll(".cascade-column"));
        var deepestCheckedLevel = checkedOptions.reduce(function (level, item) { return Math.max(level, allColumns.indexOf(item.closest(".cascade-column"))); }, -1);
        var fallbackValues = checkedOptions.filter(function (item) { return allColumns.indexOf(item.closest(".cascade-column")) === deepestCheckedLevel; }).map(cascadePathForOption);
        var checkedValues = leafValues.length ? leafValues : fallbackValues;
        renderCascaderTags(label, checkedValues);
        hasValue = checkedValues.length > 0;
        if (searchInput) {
          searchInput.value = "";
          filterCascaderSearch(searchInput);
        }
      } else if (label) {
        var selectedLeaf = cascaderDemo.querySelector('[data-cascade-option].is-leaf.is-selected');
        var selectedAny = selectedLeaf || cascaderDemo.querySelector('[data-cascade-option].is-selected');
        if (selectedAny) {
          var selectedPath = cascadePathForOption(selectedAny);
          label.textContent = selectedPath;
          label.title = selectedPath;
          hasValue = true;
        }
      } else if (searchInput && !multiple) {
        var searchableSelectedLeaf = cascaderDemo.querySelector('[data-cascade-option].is-leaf.is-selected');
        var searchableSelectedAny = searchableSelectedLeaf || cascaderDemo.querySelector('[data-cascade-option].is-selected');
        if (searchableSelectedAny) {
          var searchableSelectedPath = cascadePathForOption(searchableSelectedAny);
          searchInput.value = searchableSelectedPath;
          searchInput.title = searchableSelectedPath;
          resetCascaderSearchResults(cascaderDemo);
          hasValue = true;
        }
      }
      cascaderDemo.classList.toggle("has-value", hasValue);
      cascaderDemo.classList.toggle("has-selection", hasValue);
      if (trigger) {
        trigger.classList.toggle("has-value", hasValue);
        trigger.classList.toggle("has-selection", hasValue);
      }
    }

    function cascaderCommittedValues(cascaderDemo) {
      if (!cascaderDemo) return [];
      if (cascaderDemo.classList.contains("is-multiple")) {
        try {
          var storedValues = JSON.parse(decodeURIComponent(cascaderDemo.dataset.cascadeValues || "%5B%5D"));
          return Array.isArray(storedValues) ? storedValues.filter(Boolean) : [];
        } catch (error) {
          return [];
        }
      }
      var search = cascaderDemo.querySelector("[data-cascade-search]");
      var label = cascaderDemo.querySelector("[data-cascade-label]");
      var value = search ? search.value.trim() : (label ? label.textContent.trim() : "");
      return cascaderDemo.classList.contains("has-selection") && value ? [value] : [];
    }

    function emitCascaderChange(cascaderDemo, reason) {
      if (!cascaderDemo) return;
      var values = cascaderCommittedValues(cascaderDemo);
      cascaderDemo.dispatchEvent(new CustomEvent("b2b:cascader-change", {
        bubbles: true,
        detail: {
          value: cascaderDemo.classList.contains("is-multiple") ? values : (values[0] || ""),
          values: values,
          reason: reason
        }
      }));
    }

    function clearCascader(cascaderDemo) {
      if (!cascaderDemo) return;
      cascaderDemo.querySelectorAll("[data-cascade-option]").forEach(function (item) {
        item.classList.remove("is-selected", "is-active-path", "is-partial");
        var selectionIndicator = item.querySelector(":scope > .cascade-selection-check");
        if (selectionIndicator) selectionIndicator.remove();
        item.setAttribute("aria-selected", "false");
        if (item.hasAttribute("aria-checked")) item.setAttribute("aria-checked", "false");
        var checkbox = item.querySelector(".cascade-check");
        if (checkbox) checkbox.innerHTML = "";
      });
      var label = cascaderDemo.querySelector("[data-cascade-label]");
      var search = cascaderDemo.querySelector("[data-cascade-search]");
      if (label) {
        if (cascaderDemo.classList.contains("is-multiple")) renderCascaderTags(label, []);
        else {
          label.textContent = cascaderDemo.dataset.cascadePlaceholder || "Please select";
          label.removeAttribute("title");
        }
      }
      if (search) {
        search.value = "";
        search.removeAttribute("title");
        filterCascaderSearch(search);
      }
      var panel = cascaderDemo.querySelector(".cascader-panel");
      if (panel) Array.from(panel.querySelectorAll(":scope > .cascade-column")).slice(1).forEach(function (column) { column.remove(); });
      cascaderDemo.classList.remove("has-value", "has-selection");
      var trigger = cascaderDemo.querySelector("[data-cascader-trigger]");
      if (trigger) trigger.classList.remove("has-value", "has-selection");
    }

    function filterCascaderSearch(cascadeSearch) {
      if (!cascadeSearch) return;
      var searchDemo = cascadeSearch.closest("[data-cascader-demo]");
      if (!searchDemo) return;
      var searchValue = cascadeSearch.value.trim().toLowerCase();
      var searchTrigger = searchDemo.querySelector("[data-cascader-trigger]");
      var hasSelectedValue = Boolean(searchDemo.querySelector('.cascade-trigger-tag, [data-cascade-option].is-selected, [data-cascade-option][aria-checked="true"]'));
      var hasSearchValue = Boolean(searchValue) || hasSelectedValue;
      searchDemo.classList.toggle("has-value", hasSearchValue);
      searchDemo.classList.toggle("has-selection", hasSelectedValue);
      if (searchTrigger) {
        searchTrigger.classList.toggle("has-value", hasSearchValue);
        searchTrigger.classList.toggle("has-selection", hasSelectedValue);
      }
      if (searchDemo.querySelector(".cascade-popup-feedback")) {
        return;
      }
      var searchVisibleCount = 0;
      searchDemo.querySelectorAll("[data-cascade-option]").forEach(function (option) {
        var rawLabel = option.dataset.cascadeValue;
        var matchIndex = rawLabel.toLowerCase().indexOf(searchValue);
        option.hidden = Boolean(searchValue) && matchIndex < 0;
        if (!option.hidden) searchVisibleCount += 1;
        var optionLabel = option.querySelector("[data-cascade-option-label]");
        if (optionLabel) {
          optionLabel.textContent = "";
          if (searchValue && matchIndex >= 0) {
            optionLabel.appendChild(document.createTextNode(rawLabel.slice(0, matchIndex)));
            var mark = document.createElement("mark");
            mark.textContent = rawLabel.slice(matchIndex, matchIndex + searchValue.length);
            optionLabel.appendChild(mark);
            optionLabel.appendChild(document.createTextNode(rawLabel.slice(matchIndex + searchValue.length)));
          } else optionLabel.textContent = rawLabel;
        }
      });
      var searchPanel = searchDemo.querySelector(".cascader-panel");
      var searchFeedback = searchDemo.querySelector(".cascade-search-feedback");
      if (!searchVisibleCount && !searchFeedback) {
        searchFeedback = document.createElement("div");
        searchFeedback.className = "cascade-search-feedback";
        searchFeedback.textContent = "No result";
        searchDemo.querySelector("[data-cascader-panel]").appendChild(searchFeedback);
      } else if (searchVisibleCount && searchFeedback) searchFeedback.remove();
      if (searchPanel) searchPanel.hidden = !searchVisibleCount;
    }

    function markSourceSelectAsCurrent(selectRoot) {
      if (!selectRoot || !selectRoot.classList.contains("is-open")) return;
      interactionRoot.querySelectorAll("[data-select-demo].is-open.is-user-open").forEach(function (other) {
        if (other !== selectRoot) setSourceSelectOpen(other, false, false);
      });
      selectRoot.classList.add("is-user-open");
    }

    function sourceSelectIsLocked(selectRoot) {
      return !selectRoot || selectRoot.classList.contains("is-disabled") || selectRoot.classList.contains("is-readonly");
    }

    function setSourceSelectOpen(selectRoot, open, focusFirst) {
      if (sourceSelectIsLocked(selectRoot)) return;
      selectRoot.classList.toggle("is-open", open);
      if (open) markSourceSelectAsCurrent(selectRoot);
      else selectRoot.classList.remove("is-user-open");
      var compositeInput = selectRoot.closest("[data-affix-input], [data-combination-input]");
      if (compositeInput) compositeInput.classList.toggle("is-open", open);
      var trigger = selectRoot.querySelector("[data-select-trigger]");
      var panel = selectRoot.querySelector("[data-select-panel]");
      var arrow = selectRoot.querySelector(".source-select-arrow");
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
      if (panel) panel.setAttribute("aria-hidden", String(!open));
      if (arrow) arrow.textContent = "expand_more";
      if (open) {
        var options = Array.from(selectRoot.querySelectorAll("[data-select-option]:not(:disabled):not([hidden])"));
        var selectedOption = options.find(function (option) { return option.getAttribute("aria-selected") === "true"; });
        var activeOption = selectedOption || options[0];
        options.forEach(function (option) { option.classList.toggle("is-active", option === activeOption); });
        if (focusFirst && activeOption) activeOption.focus();
      }
    }

    function setSourceSelectContentState(selectRoot, hasSelection) {
      selectRoot.classList.remove("is-default", "is-hover", "is-active", "is-selected-active");
      selectRoot.classList.add(hasSelection ? "is-selected-active" : "is-default");
    }

    function updateNumberInputButtons(numberRoot) {
      if (!numberRoot) return;
      var input = numberRoot.querySelector("input");
      var increase = numberRoot.querySelector('[data-number-step="1"]');
      var decrease = numberRoot.querySelector('[data-number-step="-1"]');
      var min = Number(numberRoot.dataset.min);
      var max = Number(numberRoot.dataset.max);
      var value = input && input.value !== "" ? Number(input.value) : min;
      var locked = numberRoot.classList.contains("is-disabled") || numberRoot.classList.contains("is-readonly");
      if (increase) increase.disabled = locked || value >= max;
      if (decrease) decrease.disabled = locked || value <= min;
    }

    function sourceSelectSelectedValues(selectRoot) {
      return Array.from(selectRoot.querySelectorAll("[data-select-option][aria-selected='true']")).map(function (option) { return option.dataset.value; });
    }

    function renderSourceSelectValue(selectRoot) {
      var selection = selectRoot.querySelector("[data-select-selection]");
      var selected = sourceSelectSelectedValues(selectRoot);
      var multiple = selectRoot.dataset.multiple === "true";
      var locked = sourceSelectIsLocked(selectRoot);
      if (!selection) return;
      if (!selected.length) selection.innerHTML = '<span class="source-select-placeholder">Please select</span>';
      else if (!multiple) {
        var selectedOption = selectRoot.querySelector("[data-select-option][aria-selected='true']");
        selection.innerHTML = '<span class="source-select-value"></span>';
        selection.firstElementChild.textContent = selectedOption && selectedOption.dataset.label || selected[0];
      }
      else selection.innerHTML = selected.map(function (value) {
        var remove = locked ? "" : '<i role="button" tabindex="0" aria-label="移除 ' + value + '" data-select-remove><span class="b2b-icon" aria-hidden="true">close</span></i>';
        return '<span class="source-select-tag" data-select-tag data-value="' + value + '"><span>' + value + "</span>" + remove + "</span>";
      }).join("");
      var control = selectRoot.querySelector("[data-select-control]");
      var clear = selectRoot.querySelector("[data-select-clear]");
      if (selected.length && !clear && control && selectRoot.dataset.clearable !== "false" && !locked) {
        clear = document.createElement("button");
        clear.type = "button";
        clear.className = "source-select-clear";
        clear.setAttribute("aria-label", "清除选择");
        clear.setAttribute("data-select-clear", "");
        clear.innerHTML = '<span class="b2b-icon" aria-hidden="true">cancel</span>';
        control.appendChild(clear);
      }
      if ((!selected.length || locked) && clear) clear.remove();
      setSourceSelectContentState(selectRoot, selected.length > 0);
    }

    function chooseSourceSelectOption(option) {
      if (!option) return;
      var selectRoot = option.closest("[data-select-demo]");
      if (sourceSelectIsLocked(selectRoot)) return;
      markSourceSelectAsCurrent(selectRoot);
      var multiple = selectRoot.dataset.multiple === "true";
      var nextSelected = option.getAttribute("aria-selected") !== "true";
      if (!multiple) {
        selectRoot.querySelectorAll("[data-select-option]").forEach(function (item) {
          item.setAttribute("aria-selected", String(item === option));
          item.classList.toggle("is-selected", item === option);
          var oldCheck = item.querySelector(":scope > .b2b-icon");
          if (oldCheck) oldCheck.remove();
          if (item === option) item.insertAdjacentHTML("beforeend", '<span class="b2b-icon" aria-hidden="true">check</span>');
        });
      } else {
        option.setAttribute("aria-selected", String(nextSelected));
        option.classList.toggle("is-selected", nextSelected);
        var check = option.querySelector(":scope > .b2b-icon");
        if (check && !nextSelected) check.remove();
        if (!check && nextSelected) option.insertAdjacentHTML("beforeend", '<span class="b2b-icon" aria-hidden="true">check</span>');
      }
      renderSourceSelectValue(selectRoot);
      selectRoot.querySelectorAll("[data-select-option]").forEach(function (item) {
        item.classList.toggle("is-active", item === option);
      });
      if (selectRoot.hasAttribute("data-page-size")) {
        var pageSizeValue = sourceSelectSelectedValues(selectRoot)[0] || "";
        selectRoot.dataset.pageSizeValue = pageSizeValue;
        var pageSizePagination = selectRoot.closest("[data-pagination]");
        var pageSizeLive = pageSizePagination && pageSizePagination.querySelector(".pagination-live");
        if (pageSizeLive) pageSizeLive.textContent = "已切换为" + pageSizeValue;
      }
      if (!multiple) {
        setSourceSelectOpen(selectRoot, false, false);
        selectRoot.querySelector("[data-select-trigger]").focus();
      }
    }

    function renderRatingValue(ratingRoot, requestedValue) {
      var value = Math.max(0, Math.min(5, Number(requestedValue) || 0));
      ratingRoot.querySelectorAll("[data-rating-value]").forEach(function (star) {
        var score = Number(star.dataset.ratingValue);
        var selected = value >= score;
        var half = !selected && value > score - 1;
        star.classList.toggle("is-selected", selected);
        star.classList.toggle("is-half", half);
        star.setAttribute("aria-checked", String(selected));
      });
      return value;
    }

    function updateRating(ratingRoot, requestedValue) {
      if (!ratingRoot) return;
      var value = renderRatingValue(ratingRoot, requestedValue);
      ratingRoot.dataset.value = String(value);
      var labels = ["Please click to rate", "Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"];
      var prompt = ratingRoot.querySelector("[data-rating-prompt]");
      if (prompt) prompt.textContent = labels[Math.round(value)];
    }

    function ratingPointerValue(ratingStar, event) {
      var score = Number(ratingStar.dataset.ratingValue);
      var ratingRoot = ratingStar.closest("[data-rating]");
      if (!ratingRoot || Number(ratingRoot.dataset.step) !== 0.5 || !event || (event.type === "click" && event.detail === 0)) return score;
      var rect = ratingStar.getBoundingClientRect();
      return event.clientX < rect.left + rect.width / 2 ? score - 0.5 : score;
    }

    function updateSourceStepper(stepperRoot, requestedValue, clamp) {
      if (!stepperRoot) return;
      var input = stepperRoot.querySelector("[data-stepper-input]");
      var min = Number(stepperRoot.dataset.min);
      var max = Number(stepperRoot.dataset.max);
      var parsed = Number.parseInt(String(requestedValue).replace(/[^0-9-]/g, ""), 10);
      if (!Number.isFinite(parsed)) parsed = min;
      var value = clamp === false ? parsed : Math.max(min, Math.min(max, parsed));
      input.value = String(value);
      var decrement = stepperRoot.querySelector('[data-stepper-step="-1"]');
      var increment = stepperRoot.querySelector('[data-stepper-step="1"]');
      if (!stepperRoot.classList.contains("is-disabled")) {
        if (decrement) decrement.disabled = value <= min;
        if (increment) increment.disabled = value >= max;
      }
      stepperRoot.classList.toggle("is-min", value <= min);
      stepperRoot.classList.toggle("is-max", value >= max);
      return value;
    }

    function updateSourceSlider(sliderRoot, changedInput) {
      if (!sliderRoot) return;
      var ranges = Array.from(sliderRoot.querySelectorAll("[data-slider-range]"));
      if (!ranges.length) return;
      var min = Number(sliderRoot.dataset.min || 0);
      var max = Number(sliderRoot.dataset.max || 100);
      var marks = String(sliderRoot.dataset.sliderMarks || "").split(",").filter(function (mark) {
        return mark !== "";
      }).map(Number).filter(Number.isFinite);
      function snapToMark(value) {
        if (!marks.length) return value;
        return marks.reduce(function (nearest, mark) {
          return Math.abs(mark - value) < Math.abs(nearest - value) ? mark : nearest;
        }, marks[0]);
      }
      var lowInput = ranges.find(function (input) { return input.dataset.sliderRange === "low"; }) || ranges[0];
      var highInput = ranges.find(function (input) { return input.dataset.sliderRange === "high"; });
      var low = snapToMark(Math.max(min, Math.min(max, Number(lowInput.value))));
      var high = highInput ? snapToMark(Math.max(min, Math.min(max, Number(highInput.value)))) : low;
      lowInput.value = String(low);
      if (highInput) highInput.value = String(high);
      if (highInput && low > high) {
        if (changedInput === lowInput) high = low;
        else low = high;
        lowInput.value = String(low);
        highInput.value = String(high);
      }
      sliderRoot.style.setProperty("--slider-low", (highInput ? (low - min) / (max - min) * 100 : 0) + "%");
      sliderRoot.style.setProperty("--slider-high", (high - min) / (max - min) * 100 + "%");
      var lowOutput = sliderRoot.querySelector('[data-slider-output="low"]');
      var highOutput = sliderRoot.querySelector('[data-slider-output="high"]');
      var singleOutput = sliderRoot.querySelector('[data-slider-output="single"]');
      if (lowOutput) lowOutput.textContent = String(low);
      if (highOutput) highOutput.textContent = String(high);
      if (singleOutput) singleOutput.textContent = String(low);
      var linked = sliderRoot.querySelector("[data-slider-linked]");
      if (linked && linked !== changedInput) linked.value = String(low);
    }

    function updateSourceSliderHover(sliderRoot, event) {
      if (!sliderRoot || sliderRoot.classList.contains("is-disabled")) return;
      var control = sliderRoot.querySelector(".source-slider-control");
      var track = sliderRoot.querySelector(".source-slider-track");
      var lowInput = sliderRoot.querySelector('[data-slider-range="low"]');
      var highInput = sliderRoot.querySelector('[data-slider-range="high"]');
      if (!control || !track || !lowInput) return;
      var min = Number(sliderRoot.dataset.min || 0);
      var max = Number(sliderRoot.dataset.max || 100);
      var rect = track.getBoundingClientRect();
      var vertical = sliderRoot.classList.contains("is-vertical");
      var axisPosition = vertical ? rect.bottom - event.clientY : event.clientX - rect.left;
      var axisLength = vertical ? rect.height : rect.width;
      var crossDistance = vertical
        ? Math.abs(event.clientX - (rect.left + rect.width / 2))
        : Math.abs(event.clientY - (rect.top + rect.height / 2));
      var lowValue = Number(lowInput.value);
      var highValue = highInput ? Number(highInput.value) : lowValue;
      var lowPosition = (highInput ? lowValue : highValue) - min;
      lowPosition = lowPosition / (max - min) * axisLength;
      var highPosition = (highValue - min) / (max - min) * axisLength;
      var lowDistance = Math.abs(axisPosition - lowPosition);
      var highDistance = Math.abs(axisPosition - highPosition);
      var withinHandle = crossDistance <= 18 && Math.min(lowDistance, highDistance) <= 18;
      var hoveredInput = event.target.closest && event.target.closest("[data-slider-range]");
      var hoverHigh = Boolean(highInput && withinHandle && (highDistance < lowDistance || highDistance === lowDistance && hoveredInput === highInput));
      var hoverLow = Boolean(withinHandle && !hoverHigh);
      sliderRoot.classList.toggle("is-hover-low", hoverLow);
      sliderRoot.classList.toggle("is-hover-high", hoverHigh);
    }

    function visibleTreeControls(treeRoot) {
      return Array.from(treeRoot.querySelectorAll("[data-tree-choice], [data-tree-check]")).filter(function (control) {
        return !control.closest("[data-tree-node]").hidden && control.offsetParent !== null;
      });
    }

    function setTreeBranchExpanded(branch, expanded) {
      if (!branch) return;
      var expand = branch.querySelector(":scope > .source-tree-row [data-tree-expand]");
      branch.classList.toggle("is-expanded", expanded);
      if (expand) {
        expand.setAttribute("aria-expanded", String(expanded));
        expand.setAttribute("aria-label", (expanded ? "折叠 " : "展开 ") + branch.dataset.treeLabel);
      }
    }

    function resetTreeSearch(treeRoot) {
      treeRoot.querySelectorAll("[data-tree-node]").forEach(function (node) { node.hidden = false; });
      treeRoot.querySelectorAll("[data-tree-title]").forEach(function (title) {
        title.textContent = title.dataset.treeTitleValue || title.textContent;
      });
      var empty = treeRoot.querySelector("[data-tree-empty]");
      var tree = treeRoot.querySelector(".source-tree");
      if (empty) empty.hidden = true;
      if (tree) tree.hidden = false;
    }

    function filterTreeSelect(treeRoot) {
      var search = treeRoot.querySelector("[data-tree-search]");
      var query = search ? search.value.trim().toLowerCase() : "";
      var tree = treeRoot.querySelector(".source-tree");
      if (!tree) return;
      resetTreeSearch(treeRoot);
      if (!query) return;

      function filterNode(node) {
        var childGroup = node.querySelector(":scope > .source-tree-children");
        var children = childGroup ? Array.from(childGroup.children).filter(function (child) { return child.matches("[data-tree-node]"); }) : [];
        var childMatches = children.map(filterNode).some(Boolean);
        var ownMatch = node.dataset.treeLabel.indexOf(query) >= 0;
        var matches = ownMatch || childMatches;
        node.hidden = !matches;
        if (childMatches && node.classList.contains("source-tree-branch")) setTreeBranchExpanded(node, true);
        var title = node.querySelector(":scope > .source-tree-row [data-tree-title], :scope > [data-tree-title]");
        if (title && ownMatch) {
          var value = title.dataset.treeTitleValue || title.textContent;
          var index = value.toLowerCase().indexOf(query);
          title.textContent = "";
          title.append(document.createTextNode(value.slice(0, index)));
          var mark = document.createElement("mark");
          mark.className = "tree-search-mark";
          mark.textContent = value.slice(index, index + query.length);
          title.append(mark, document.createTextNode(value.slice(index + query.length)));
        }
        return matches;
      }

      var hasResults = Array.from(tree.children).filter(function (node) { return node.matches("[data-tree-node]"); }).map(filterNode).some(Boolean);
      var empty = treeRoot.querySelector("[data-tree-empty]");
      tree.hidden = !hasResults;
      if (empty) empty.hidden = hasResults;
    }

    function syncTreeCheckAncestors(treeCheck) {
      var treeCheckNode = treeCheck && treeCheck.closest("[data-tree-node]");
      var parentNode = treeCheckNode && treeCheckNode.parentElement && treeCheckNode.parentElement.closest("[data-tree-node]");
      while (parentNode) {
        var parentCheck = parentNode.querySelector(":scope > .source-tree-row [data-tree-check]");
        var descendants = Array.from(parentNode.querySelectorAll(".source-tree-children [data-tree-check]"));
        var checkedCount = descendants.filter(function (child) { return child.checked; }).length;
        if (parentCheck) {
          parentCheck.checked = checkedCount === descendants.length && descendants.length > 0;
          parentCheck.indeterminate = checkedCount > 0 && checkedCount < descendants.length;
          updateCheckboxControl(parentCheck);
        }
        parentNode = parentNode.parentElement && parentNode.parentElement.closest("[data-tree-node]");
      }
    }

    function positionTreeSelectPanel(treeRoot) {
      if (!treeRoot || !treeRoot.classList.contains("is-open")) return;
      var trigger = treeRoot.querySelector("[data-tree-trigger]");
      var panel = treeRoot.querySelector("[data-tree-panel]");
      if (!trigger || !panel || panel.hidden) return;
      treeRoot.classList.remove("is-open-up");
      var triggerRect = trigger.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();
      var view = treeRoot.ownerDocument.defaultView || window;
      var availableBelow = view.innerHeight - triggerRect.bottom - 8;
      var availableAbove = triggerRect.top - 8;
      treeRoot.classList.toggle("is-open-up", panelRect.height > availableBelow && availableAbove > availableBelow);
    }

    function initializeTreeSelect(scope) {
      var treeScope = scope || interactionRoot;
      var treeRoots = treeScope.matches && treeScope.matches("[data-tree-select]") ? [treeScope] : [];
      treeRoots = treeRoots.concat(Array.from(treeScope.querySelectorAll("[data-tree-select]")));
      treeRoots.forEach(function (treeRoot) {
        treeRoot.querySelectorAll("[data-tree-check]").forEach(function (check) {
          if (check.hasAttribute("data-indeterminate")) check.indeterminate = true;
          updateCheckboxControl(check);
        });
        var search = treeRoot.querySelector("[data-tree-search]");
        if (search && search.value) filterTreeSelect(treeRoot);
        positionTreeSelectPanel(treeRoot);
        if (treeRoot.classList.contains("is-open")) window.requestAnimationFrame(function () {
          if (treeRoot.isConnected) positionTreeSelectPanel(treeRoot);
        });
      });
    }

    function syncPeopleTreeAncestors(check) {
      var node = check && check.closest("[data-tree-people-node]");
      var parent = node && node.parentElement && node.parentElement.closest("[data-tree-people-node]");
      while (parent) {
        var parentCheck = parent.querySelector(":scope > .tree-people-row [data-tree-people-check]");
        var people = Array.from(parent.querySelectorAll(".tree-people-children [data-tree-people-check][data-tree-person]"));
        var selected = people.filter(function (item) { return item.checked; }).length;
        if (parentCheck) {
          parentCheck.checked = people.length > 0 && selected === people.length;
          parentCheck.indeterminate = selected > 0 && selected < people.length;
          updateCheckboxControl(parentCheck);
        }
        parent = parent.parentElement && parent.parentElement.closest("[data-tree-people-node]");
      }
    }

    function createPeopleAvatar(kind, label) {
      var avatar = document.createElement("span");
      avatar.className = "source-avatar is-round tree-person-avatar is-" + (kind || "maya");
      avatar.style.setProperty("--avatar-size", "28px");
      avatar.setAttribute("role", "img");
      avatar.setAttribute("aria-label", label);
      var icon = document.createElement("span");
      icon.className = "b2b-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "person";
      avatar.appendChild(icon);
      return avatar;
    }

    function renderPeopleSelection(root) {
      if (!root) return;
      var selected = Array.from(root.querySelectorAll('[data-tree-people-check][data-tree-person]:checked'));
      var list = root.querySelector("[data-tree-people-selected-list]");
      var count = root.querySelector("[data-tree-people-count]");
      if (count) count.textContent = String(selected.length);
      if (!list) return;
      list.innerHTML = "";
      selected.forEach(function (check) {
        var value = check.value;
        var item = document.createElement("div");
        item.className = "tree-people-selected-item";
        item.setAttribute("data-tree-people-selected", "");
        item.dataset.value = value;
        item.appendChild(createPeopleAvatar(check.dataset.avatar, value));
        var name = document.createElement("span");
        name.textContent = check.dataset.display || value;
        item.appendChild(name);
        var remove = document.createElement("button");
        remove.type = "button";
        remove.setAttribute("data-tree-people-remove", "");
        remove.setAttribute("aria-label", "移除 " + value);
        var close = document.createElement("span");
        close.className = "b2b-icon";
        close.setAttribute("aria-hidden", "true");
        close.textContent = "close";
        remove.appendChild(close);
        item.appendChild(remove);
        list.appendChild(item);
      });
    }

    function filterPeopleTree(root) {
      if (!root) return;
      var search = root.querySelector("[data-tree-people-search]");
      var query = search ? search.value.trim().toLowerCase() : "";
      var tree = root.querySelector(".tree-people-tree");
      if (!tree) return;

      function filterNode(node) {
        var childGroup = node.querySelector(":scope > .tree-people-children");
        var children = childGroup ? Array.from(childGroup.children).filter(function (child) {
          return child.matches("[data-tree-people-node]");
        }) : [];
        var childMatch = children.map(filterNode).some(Boolean);
        var ownMatch = !query || (node.dataset.label || "").indexOf(query) >= 0;
        var matches = ownMatch || childMatch;
        node.hidden = !matches;
        if (query && childMatch) node.classList.add("is-expanded");
        return matches;
      }

      var matches = Array.from(tree.children).filter(function (node) {
        return node.matches("[data-tree-people-node]");
      }).map(filterNode).some(Boolean);
      var empty = root.querySelector("[data-tree-people-empty]");
      if (empty) empty.hidden = matches;
    }

    function initializePeopleTrees(scope) {
      (scope || interactionRoot).querySelectorAll("[data-tree-people]").forEach(function (root) {
        root.querySelectorAll("[data-tree-people-check]").forEach(function (check) {
          if (check.hasAttribute("data-indeterminate")) check.indeterminate = true;
          updateCheckboxControl(check);
        });
        renderPeopleSelection(root);
        filterPeopleTree(root);
      });
    }

    function setTreeSelectOpen(treeRoot, open, focusTarget, userInitiated) {
      if (!treeRoot || treeRoot.classList.contains("is-readonly")) return;
      var wasOpen = treeRoot.classList.contains("is-open");
      if (open && userInitiated) {
        interactionRoot.querySelectorAll("[data-tree-select].is-open.is-user-open").forEach(function (other) {
          if (other !== treeRoot) setTreeSelectOpen(other, false, false, false);
        });
      }
      treeRoot.classList.toggle("is-open", open);
      if (userInitiated && open) treeRoot.classList.add("is-user-open");
      if (!open) treeRoot.classList.remove("is-user-open");
      var trigger = treeRoot.querySelector("[data-tree-trigger]");
      var panel = treeRoot.querySelector("[data-tree-panel]");
      if (trigger) {
        trigger.setAttribute("aria-expanded", String(open));
      }
      if (panel) {
        panel.hidden = !open;
        panel.setAttribute("aria-hidden", String(!open));
      }
      if (open) positionTreeSelectPanel(treeRoot);
      else treeRoot.classList.remove("is-open-up");
      if (open && focusTarget) {
        var search = treeRoot.querySelector("[data-tree-search]");
        var selected = treeRoot.querySelector('[data-tree-choice][aria-selected="true"], [data-tree-check]:checked');
        var controls = visibleTreeControls(treeRoot);
        (search || selected || controls[0] || trigger).focus();
      } else if (!open && focusTarget && trigger) {
        trigger.focus();
      }
      if (wasOpen !== open) treeRoot.dispatchEvent(new CustomEvent("tree-source-state"));
    }

    function renderTreeSelection(treeRoot) {
      var selectedControls = Array.from(treeRoot.querySelectorAll('[data-tree-choice][aria-selected="true"], [data-tree-check]:checked'));
      if (treeRoot.dataset.checkedStrategy === "child") {
        selectedControls = selectedControls.filter(function (control) {
          return !control.closest("[data-tree-node]").querySelector(":scope > .source-tree-children");
        });
      }
      var selected = selectedControls.map(function (control) { return control.dataset.value || control.value; });
      selected = selected.filter(function (value, index) { return selected.indexOf(value) === index; });
      var selection = treeRoot.querySelector("[data-tree-selection]");
      var multiple = treeRoot.dataset.multiple === "true";
      var locked = treeRoot.classList.contains("is-readonly") || treeRoot.classList.contains("is-disabled");
      if (!selection) return;
      if (!selected.length) selection.innerHTML = '<span class="source-tree-placeholder">Please select</span>';
      else if (!multiple) selection.innerHTML = '<span class="source-tree-value">' + selected[0] + "</span>";
      else {
        selection.innerHTML = selected.slice(0, 2).map(function (value) {
          var remove = locked ? "" : '<i role="button" tabindex="0" data-tree-remove data-value="' + value + '" aria-label="移除 ' + value + '"><span class="b2b-icon" aria-hidden="true">close</span></i>';
          return '<span class="source-tree-tag" data-tree-tag data-value="' + value + '"><span>' + value + "</span>" + remove + "</span>";
        }).join("") + (selected.length > 2 ? '<span class="source-tree-tag is-summary" aria-label="另有 ' + (selected.length - 2) + ' 项">+' + (selected.length - 2) + "</span>" : "");
      }
      var trigger = treeRoot.querySelector("[data-tree-trigger]");
      if (trigger) trigger.setAttribute("aria-label", selected.length ? "已选择 " + selected.join("、") : "请选择");
      var clear = treeRoot.querySelector("[data-tree-clear]");
      if (clear) clear.hidden = !selected.length;
    }

    function removeTreeSelection(treeRoot, value) {
      var choice = Array.from(treeRoot.querySelectorAll("[data-tree-choice]")).find(function (item) { return item.dataset.value === value; });
      if (choice) {
        choice.setAttribute("aria-selected", "false");
        var choiceIcon = choice.querySelector(":scope > .b2b-icon");
        if (choiceIcon) choiceIcon.remove();
      }
      var check = Array.from(treeRoot.querySelectorAll("[data-tree-check]")).find(function (item) { return item.value === value; });
      if (check) {
        var node = check.closest("[data-tree-node]");
        node.querySelectorAll("[data-tree-check]").forEach(function (child) {
          child.checked = false;
          child.indeterminate = false;
          updateCheckboxControl(child);
        });
        syncTreeCheckAncestors(check);
      }
      renderTreeSelection(treeRoot);
    }

    function clearTreeSelection(treeRoot) {
      treeRoot.querySelectorAll("[data-tree-choice]").forEach(function (choice) {
        choice.setAttribute("aria-selected", "false");
        var choiceIcon = choice.querySelector(":scope > .b2b-icon");
        if (choiceIcon) choiceIcon.remove();
      });
      treeRoot.querySelectorAll("[data-tree-check]").forEach(function (check) {
        check.checked = false;
        check.indeterminate = false;
        updateCheckboxControl(check);
      });
      renderTreeSelection(treeRoot);
    }

    function syncTransferSourceSummary(transferRoot) {
      var choices = Array.from(transferRoot.querySelectorAll("[data-transfer-choice]"));
      var visibleChoices = choices.filter(function (choice) { return !choice.closest(".transfer-choice").hidden; });
      var selectedVisible = visibleChoices.filter(function (choice) { return choice.checked; });
      var selectedCount = transferRoot.querySelector("[data-transfer-selected-count]");
      var totalCount = transferRoot.querySelector("[data-transfer-total-count]");
      if (selectedCount) selectedCount.textContent = String(selectedVisible.length);
      if (totalCount) totalCount.textContent = String(visibleChoices.length);
      var all = transferRoot.querySelector("[data-transfer-all]");
      if (all) {
        all.checked = visibleChoices.length > 0 && selectedVisible.length === visibleChoices.length;
        all.indeterminate = selectedVisible.length > 0 && selectedVisible.length < visibleChoices.length;
        all.setAttribute("aria-checked", all.indeterminate ? "mixed" : String(all.checked));
      }
    }

    function renderTransfer(transferRoot) {
      if (!transferRoot) return;
      var choices = Array.from(transferRoot.querySelectorAll("[data-transfer-choice]"));
      var selected = choices.filter(function (choice) { return choice.checked; }).map(function (choice) { return choice.value; });
      var target = transferRoot.querySelector("[data-transfer-target-list]");
      var currentOrder = target ? Array.from(target.querySelectorAll("[data-transfer-selected]")).map(function (item) { return item.dataset.value; }) : [];
      var order = currentOrder.filter(function (value) { return selected.indexOf(value) >= 0; }).concat(selected.filter(function (value) { return currentOrder.indexOf(value) < 0; }));
      var draggable = transferRoot.dataset.transferDraggable === "true";
      var rich = transferRoot.dataset.transferRich === "true";
      if (target) target.innerHTML = order.map(function (value) {
        var choice = choices.find(function (candidate) { return candidate.value === value; });
        var richSource = rich && choice ? choice.closest(".transfer-choice").querySelector(".transfer-choice-copy.is-rich") : null;
        var avatar = richSource && richSource.querySelector(".source-avatar");
        var richCopy = richSource && richSource.querySelector(".transfer-rich-copy");
        var isRichSelected = Boolean(avatar && richCopy);
        var selectedContent = isRichSelected
          ? '<span class="transfer-selected-copy is-rich">' + avatar.outerHTML + richCopy.outerHTML + "</span>"
          : "<span>" + value + "</span>";
        return '<div class="transfer-selected' + (draggable ? " is-draggable" : "") + (isRichSelected ? " is-rich" : "") + '"' + (draggable ? ' draggable="true"' : "") + ' data-transfer-selected data-value="' + value + '">' +
          (draggable ? '<button class="b2b-button is-icon is-text is-neutral transfer-drag" type="button" aria-label="拖拽 ' + value + '" data-component-reference="C-04"><span class="b2b-icon" aria-hidden="true">drag_indicator</span></button>' : "") +
          selectedContent +
          '<button class="b2b-button is-icon is-text is-neutral" type="button" data-transfer-remove aria-label="移除 ' + value + '" data-component-reference="C-04"><span class="b2b-icon" aria-hidden="true">close</span></button>' +
        "</div>";
      }).join("");
      var targetCount = transferRoot.querySelector("[data-transfer-target-count]");
      if (targetCount) targetCount.textContent = String(selected.length);
      syncTransferSourceSummary(transferRoot);
    }

    function timePickerInput(timeRoot) {
      return timeRoot && timeRoot.querySelector(".time-trigger input");
    }

    function timePickerScrollArea(column) {
      return column && (column.querySelector("[data-time-scroll]") || column);
    }

    function updateTimePickerScrollThumb(column) {
      if (!column) return;
      var viewport = timePickerScrollArea(column);
      var track = column.querySelector(".time-overlay-scrollbar");
      var thumb = track && track.querySelector(".time-overlay-scrollbar-thumb");
      if (!viewport || !track || !thumb) return;
      var scrollRange = viewport.scrollHeight - viewport.clientHeight;
      var trackHeight = Math.max(0, column.clientHeight - 8);
      var hasOverflow = scrollRange > 1 && trackHeight > 0;
      track.hidden = !hasOverflow;
      if (!hasOverflow) return;
      var thumbHeight = Math.max(24, Math.round(trackHeight * viewport.clientHeight / viewport.scrollHeight));
      thumbHeight = Math.min(trackHeight, thumbHeight);
      var thumbRange = Math.max(0, trackHeight - thumbHeight);
      var thumbTop = scrollRange ? Math.round(viewport.scrollTop / scrollRange * thumbRange) : 0;
      thumb.style.height = thumbHeight + "px";
      thumb.style.transform = "translateY(" + thumbTop + "px)";
    }

    function scrollTimePickerOptionToTop(column, option) {
      var viewport = timePickerScrollArea(column);
      if (!viewport || !option) return;
      var scrollRange = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      var topInset = parseFloat(window.getComputedStyle(viewport).paddingTop) || 0;
      var targetTop = option.offsetTop - viewport.offsetTop - topInset;
      viewport.scrollTop = Math.max(0, Math.min(scrollRange, targetTop));
      updateTimePickerScrollThumb(column);
    }

    function dragTimePickerScrollThumb(column, track, thumb, event) {
      var viewport = timePickerScrollArea(column);
      if (!viewport || !track || !thumb || event.button !== 0) return;
      var thumbRect = thumb.getBoundingClientRect();
      var grabOffset = Math.max(0, Math.min(thumbRect.height, event.clientY - thumbRect.top));
      function update(clientY) {
        var trackRect = track.getBoundingClientRect();
        var thumbHeight = thumb.getBoundingClientRect().height;
        var travel = Math.max(0, trackRect.height - thumbHeight);
        var scrollRange = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        var next = Math.max(0, Math.min(travel, clientY - trackRect.top - grabOffset));
        viewport.scrollTop = travel ? next / travel * scrollRange : 0;
        updateTimePickerScrollThumb(column);
      }
      function finish(pointerEvent) {
        track.classList.remove("is-dragging");
        track.removeEventListener("pointermove", move);
        track.removeEventListener("pointerup", finish);
        track.removeEventListener("pointercancel", finish);
        try {
          if (track.hasPointerCapture && track.hasPointerCapture(pointerEvent.pointerId)) track.releasePointerCapture(pointerEvent.pointerId);
        } catch (error) {}
      }
      function move(pointerEvent) {
        if (pointerEvent.pointerId !== event.pointerId) return;
        update(pointerEvent.clientY);
        pointerEvent.preventDefault();
      }
      track.classList.add("is-dragging");
      try {
        if (track.setPointerCapture) track.setPointerCapture(event.pointerId);
      } catch (error) {}
      track.addEventListener("pointermove", move);
      track.addEventListener("pointerup", finish);
      track.addEventListener("pointercancel", finish);
      update(event.clientY);
      event.preventDefault();
      event.stopPropagation();
    }

    function bindTimePickerScrollColumn(column) {
      var viewport = timePickerScrollArea(column);
      if (!viewport || viewport.dataset.timeScrollBound === "true") return;
      viewport.dataset.timeScrollBound = "true";
      viewport.addEventListener("scroll", function () {
        updateTimePickerScrollThumb(column);
      }, { passive: true });
      var track = column.querySelector(".time-overlay-scrollbar");
      var thumb = track && track.querySelector(".time-overlay-scrollbar-thumb");
      if (track && thumb) track.addEventListener("pointerdown", function (event) {
        dragTimePickerScrollThumb(column, track, thumb, event);
      });
      updateTimePickerScrollThumb(column);
    }

    function timePickerSelectedValues(timeRoot) {
      return Array.from(timeRoot.querySelectorAll(".time-column")).map(function (column) {
        var selected = column.querySelector("[data-time-value].is-selected");
        return selected ? selected.dataset.timeValue : "";
      });
    }

    function timePickerDisplayValue(timeRoot) {
      var selected = timePickerSelectedValues(timeRoot);
      if (!selected.length || selected.some(function (item) { return !item; })) return "";
      if (timeRoot.dataset.mode === "combined") return selected[0].replace(/\s(AM|PM)$/, function (_, period) { return " " + period.toLowerCase(); });
      if (timeRoot.dataset.twelve === "true") {
        var period = selected.shift();
        return selected.join(":") + " " + period.toLowerCase();
      }
      return selected.join(":");
    }

    function updateTimePickerDoneState(timeRoot) {
      var done = timeRoot.querySelector("[data-time-done]");
      if (done) done.disabled = !timePickerInput(timeRoot).value;
    }

    function renderTimePicker(timeRoot) {
      var input = timePickerInput(timeRoot);
      if (!input) return;
      input.value = timePickerDisplayValue(timeRoot);
      input.setAttribute("aria-invalid", "false");
      timeRoot.classList.toggle("is-selected", Boolean(input.value));
      updateTimePickerDoneState(timeRoot);
    }

    function setTimePickerColumnValue(column, value) {
      if (!column) return false;
      var options = Array.from(column.querySelectorAll("[data-time-value]"));
      var match = options.find(function (option) { return option.dataset.timeValue === value && !option.disabled; });
      if (!match) return false;
      options.forEach(function (option) {
        var selected = option === match;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-selected", String(selected));
        option.setAttribute("tabindex", selected ? "0" : "-1");
        var oldCheck = option.querySelector(".time-option-check");
        if (oldCheck && !selected) oldCheck.remove();
      });
      if (timePickerDisplayValue(column.closest("[data-time-picker]")) && column.closest("[data-time-picker]").dataset.mode === "combined" && !match.querySelector(".time-option-check")) {
        var check = document.createElement("span");
        check.className = "b2b-icon time-option-check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = "check";
        match.appendChild(check);
      }
      return true;
    }

    function syncTimePickerSelectionFromInput(timeRoot, rawValue) {
      var value = String(rawValue || "").trim();
      if (!value) {
        timeRoot.querySelectorAll("[data-time-value]").forEach(function (option) {
          option.classList.remove("is-selected");
          option.setAttribute("aria-selected", "false");
          option.setAttribute("tabindex", "-1");
          var check = option.querySelector(".time-option-check");
          if (check) check.remove();
        });
        return true;
      }
      var columns = Array.from(timeRoot.querySelectorAll(".time-column"));
      if (timeRoot.dataset.mode === "combined") {
        var combined = value.replace(/\s+(am|pm)$/i, function (_, period) { return " " + period.toUpperCase(); });
        return setTimePickerColumnValue(columns[0], combined);
      }
      var match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(am|pm))?$/i);
      if (!match) return false;
      var hour = String(Number(match[1])).padStart(2, "0");
      var minute = match[2];
      var second = match[3] || "";
      var period = match[4] ? match[4].toUpperCase() : "";
      if (timeRoot.dataset.twelve === "true") {
        if (!period || Number(hour) < 1 || Number(hour) > 12) return false;
        if (!setTimePickerColumnValue(columns[0], period)) return false;
        columns = columns.slice(1);
      } else if (period || Number(hour) > 23) return false;
      if (!setTimePickerColumnValue(columns[0], hour) || !setTimePickerColumnValue(columns[1], minute)) return false;
      if (timeRoot.dataset.seconds === "true") {
        if (!second || !setTimePickerColumnValue(columns[2], second)) return false;
      } else if (second) return false;
      return true;
    }

    function captureTimePickerState(timeRoot) {
      if (!timeRoot || timeRoot._timeConfirmedState) return;
      timeRoot._timeConfirmedState = {
        value: timePickerInput(timeRoot).value,
        selected: timePickerSelectedValues(timeRoot)
      };
    }

    function restoreTimePickerState(timeRoot) {
      var state = timeRoot && timeRoot._timeConfirmedState;
      if (!state) return;
      Array.from(timeRoot.querySelectorAll(".time-column")).forEach(function (column, index) {
        if (state.selected[index]) setTimePickerColumnValue(column, state.selected[index]);
        else column.querySelectorAll("[data-time-value]").forEach(function (option) {
          option.classList.remove("is-selected");
          option.setAttribute("aria-selected", "false");
          option.setAttribute("tabindex", "-1");
          var check = option.querySelector(".time-option-check");
          if (check) check.remove();
        });
      });
      var input = timePickerInput(timeRoot);
      input.value = state.value;
      input.setAttribute("aria-invalid", "false");
      timeRoot.classList.toggle("is-selected", Boolean(state.value));
      updateTimePickerDoneState(timeRoot);
      delete timeRoot._timeConfirmedState;
    }

    function commitTimePickerState(timeRoot) {
      var input = timePickerInput(timeRoot);
      if (!input) return;
      timeRoot.dataset.confirmedValue = input.value;
      timeRoot.classList.toggle("is-selected", Boolean(input.value));
      input.setAttribute("aria-invalid", "false");
      delete timeRoot._timeConfirmedState;
    }

    function scrollTimePickerSelections(timeRoot) {
      window.requestAnimationFrame(function () {
        timeRoot.querySelectorAll(".time-column").forEach(function (column) {
          var selected = column.querySelector("[data-time-value].is-selected");
          if (!selected) {
            var viewport = timePickerScrollArea(column);
            viewport.scrollTop = 0;
            updateTimePickerScrollThumb(column);
            return;
          }
          scrollTimePickerOptionToTop(column, selected);
        });
      });
    }

    function setTimePickerOpen(timeRoot, open, restoreFocus, userInitiated) {
      if (!timeRoot || timeRoot.classList.contains("is-disabled")) return;
      var trigger = timeRoot.querySelector("[data-time-trigger]");
      var panel = timeRoot.querySelector(".source-time-panel");
      if (open && (!timeRoot.classList.contains("is-open") || userInitiated)) captureTimePickerState(timeRoot);
      timeRoot.classList.toggle("is-open", open);
      if (open && userInitiated) timeRoot.classList.add("is-user-open");
      if (!open) timeRoot.classList.remove("is-user-open");
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
      if (panel) {
        panel.hidden = !open;
        panel.setAttribute("aria-hidden", String(!open));
      }
      if (open) {
        interactionRoot.querySelectorAll("[data-time-picker].is-open").forEach(function (other) {
          if (other === timeRoot) return;
          if (other.dataset.footer === "true") restoreTimePickerState(other);
          else commitTimePickerState(other);
          setTimePickerOpen(other, false, false, false);
        });
        scrollTimePickerSelections(timeRoot);
      }
      if (!open && restoreFocus) {
        var input = timePickerInput(timeRoot);
        if (input) input.focus();
      }
    }

    function closeOtherTimePickers(except) {
      interactionRoot.querySelectorAll("[data-time-picker].is-open").forEach(function (timeRoot) {
        if (timeRoot === except) return;
        if (timeRoot.dataset.footer === "true") restoreTimePickerState(timeRoot);
        else commitTimePickerState(timeRoot);
        setTimePickerOpen(timeRoot, false, false, false);
      });
    }

    function setTimePickerToNow(timeRoot) {
      var now = new Date();
      var hour = now.getHours();
      var minute = now.getMinutes();
      var second = now.getSeconds();
      var display;
      if (timeRoot.dataset.mode === "combined") {
        minute = Math.floor(minute / 15) * 15;
        display = String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
        if (timeRoot.dataset.twelve === "true") display = String(hour % 12 || 12).padStart(2, "0") + ":" + String(minute).padStart(2, "0") + (hour < 12 ? " am" : " pm");
      } else {
        display = String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0") + (timeRoot.dataset.seconds === "true" ? ":" + String(second).padStart(2, "0") : "");
        if (timeRoot.dataset.twelve === "true") display = String(hour % 12 || 12).padStart(2, "0") + ":" + String(minute).padStart(2, "0") + (timeRoot.dataset.seconds === "true" ? ":" + String(second).padStart(2, "0") : "") + (hour < 12 ? " am" : " pm");
      }
      if (syncTimePickerSelectionFromInput(timeRoot, display)) renderTimePicker(timeRoot);
      scrollTimePickerSelections(timeRoot);
    }

    function validateTimePickerTextInput(input) {
      var timeRoot = input && input.closest("[data-time-picker]");
      if (!timeRoot) return false;
      var valid = syncTimePickerSelectionFromInput(timeRoot, input.value);
      if (valid) {
        renderTimePicker(timeRoot);
        if (timeRoot.dataset.footer !== "true") commitTimePickerState(timeRoot);
        timeRoot.classList.remove("is-error");
        scrollTimePickerSelections(timeRoot);
        return true;
      }
      syncTimePickerSelectionFromInput(timeRoot, timeRoot.dataset.confirmedValue || "");
      renderTimePicker(timeRoot);
      input.setAttribute("aria-invalid", "true");
      timeRoot.classList.add("is-error");
      return false;
    }

    function initializeTimePickers(scope) {
      var timePickers = [];
      var timeScope = scope || interactionRoot;
      if (timeScope.matches && timeScope.matches("[data-time-picker]")) timePickers.push(timeScope);
      if (timeScope.querySelectorAll) timePickers = timePickers.concat(Array.from(timeScope.querySelectorAll("[data-time-picker]")));
      timePickers.forEach(function (timeRoot) {
        var input = timePickerInput(timeRoot);
        var panel = timeRoot.querySelector(".source-time-panel");
        if (input && !timeRoot.dataset.confirmedValue) timeRoot.dataset.confirmedValue = input.value;
        if (panel) {
          panel.hidden = !timeRoot.classList.contains("is-open");
          panel.setAttribute("aria-hidden", String(!timeRoot.classList.contains("is-open")));
        }
        timeRoot.querySelectorAll(".time-column").forEach(bindTimePickerScrollColumn);
        updateTimePickerDoneState(timeRoot);
        if (timeRoot.classList.contains("is-open")) scrollTimePickerSelections(timeRoot);
      });
    }

    function uploadIcon(name) {
      return '<span class="b2b-icon" aria-hidden="true">' + name + "</span>";
    }

    function uploadActions(state) {
      if (state === "uploading") return '<button type="button" data-upload-cancel aria-label="取消上传">' + uploadIcon("close") + "</button>";
      if (state === "error") return '<span class="upload-file-danger-indicator" aria-hidden="true">' + uploadIcon("error") + '</span><button type="button" data-upload-retry aria-label="重试上传">' + uploadIcon("refresh") + '</button><button type="button" data-upload-delete aria-label="删除文件">' + uploadIcon("delete") + "</button>";
      if (state === "local") return '<button type="button" data-upload-delete aria-label="移除文件">' + uploadIcon("delete") + "</button>";
      return '<button type="button" data-upload-preview aria-label="预览文件">' + uploadIcon("visibility") + '</button><button type="button" data-upload-download aria-label="下载文件">' + uploadIcon("download") + '</button><button type="button" data-upload-delete aria-label="删除文件">' + uploadIcon("delete") + "</button>";
    }

    function escapeUploadText(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function formatUploadSize(bytes) {
      var value = Number(bytes) || 0;
      if (value < 1024) return value + " B";
      if (value < 1024 * 1024) return (value / 1024).toFixed(1) + " KB";
      if (value < 1024 * 1024 * 1024) return (value / (1024 * 1024)).toFixed(1) + " MB";
      return (value / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }

    function isProductionUploadDemo(demo) {
      return Boolean(demo && demo.closest && demo.closest("[data-component-renderer='upload']"));
    }

    function localImagePreviewUrl(file) {
      if (!file) return "";
      var name = String(file.name || "");
      var type = String(file.type || "");
      var isImage = /^image\//i.test(type) || /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
      if (!isImage || !window.URL || typeof window.URL.createObjectURL !== "function") return "";
      try { return window.URL.createObjectURL(file); } catch (error) { return ""; }
    }

    function releaseLocalImagePreview(tile) {
      if (!tile) return;
      var previewUrl = tile.getAttribute("data-upload-preview-url");
      if (previewUrl && window.URL && typeof window.URL.revokeObjectURL === "function") window.URL.revokeObjectURL(previewUrl);
      tile.removeAttribute("data-upload-preview-url");
    }

    function createLocalUploadRow(file) {
      var name = file && file.name ? file.name : "未命名文件";
      var bytes = Number(file && file.size) || 0;
      var size = formatUploadSize(bytes);
      var previewUrl = localImagePreviewUrl(file);
      var row = document.createElement("article");
      row.className = "source-upload-file is-uploading is-local";
      row.setAttribute("data-upload-file", "");
      row.setAttribute("data-upload-dynamic", "");
      row.setAttribute("data-upload-local", "");
      row.setAttribute("data-upload-file-name", name);
      row.setAttribute("data-upload-size", String(bytes));
      if (previewUrl) row.setAttribute("data-upload-preview-url", previewUrl);
      row.tabIndex = 0;
      row.setAttribute("aria-busy", "true");
      row.setAttribute("aria-label", name + "，正在处理本地文件，" + size);
      row.innerHTML = D.componentSpecimenHelpers.fileTypeIcon(name) +
        '<span class="upload-file-copy"><strong>' + escapeUploadText(name) + '</strong><small>0 B / ' + escapeUploadText(size) + '</small><i class="upload-file-progress" role="progressbar" aria-label="本地文件处理进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><b style="width:0%"></b></i></span>' +
        '<span class="upload-file-actions">' + uploadActions("uploading") + "</span>";
      return row;
    }

    function createLocalPictureTile(file) {
      var name = file && file.name ? file.name : "未命名图片";
      var size = formatUploadSize(file && file.size);
      var previewUrl = localImagePreviewUrl(file);
      var tile = document.createElement("article");
      tile.className = "upload-picture-tile is-uploading is-local";
      tile.setAttribute("data-upload-dynamic", "");
      tile.setAttribute("data-upload-local", "");
      tile.setAttribute("data-upload-file-name", name);
      tile.setAttribute("data-upload-size", String(Number(file && file.size) || 0));
      if (previewUrl) tile.setAttribute("data-upload-preview-url", previewUrl);
      tile.setAttribute("aria-busy", "true");
      tile.tabIndex = 0;
      tile.title = name + " · 正在处理 · " + size;
      tile.setAttribute("aria-label", name + "，正在处理本地图片，" + size);
      tile.innerHTML = (previewUrl ? '<img class="upload-picture-image" src="' + escapeUploadText(previewUrl) + '" alt="" aria-hidden="true" decoding="async">' : '<span class="upload-picture-image" aria-hidden="true"></span>') + '<span class="upload-picture-progress"><i style="width:0%"></i></span><button class="upload-picture-remove" type="button" data-upload-picture-remove aria-label="移除 ' + escapeUploadText(name) + '">' + uploadIcon("close") + "</button>";
      return tile;
    }

    function uploadEntryIsDisabled(target) {
      var entry = target && target.closest && target.closest("[data-upload-drop], .upload-picture, .upload-choice button");
      return Boolean(entry && (entry.disabled || entry.getAttribute("aria-disabled") === "true" || entry.classList.contains("is-disabled")));
    }

    function uploadDemoIsDisabled(demo) {
      return Boolean(demo && demo.querySelector(".upload-choice button:disabled, [data-upload-drop][aria-disabled='true'], .upload-picture:disabled"));
    }

    function addLocalUploadFiles(demo, files) {
      if (!demo || uploadDemoIsDisabled(demo) || !files || !files.length) return 0;
      var list = demo.querySelector("[data-upload-list]");
      if (!list) return 0;
      var picture = Boolean(demo.querySelector(".upload-picture"));
      var count = 0;
      var pending = [];
      Array.prototype.forEach.call(files, function (file) {
        if (!file || typeof file.name !== "string") return;
        var item = picture ? createLocalPictureTile(file) : createLocalUploadRow(file);
        list.appendChild(item);
        pending.push(item);
        count += 1;
      });
      if (count) {
        var live = demo.querySelector("[data-upload-status]");
        if (live) live.textContent = "正在处理 " + count + " 个本地文件";
        pending.forEach(function (item) {
          if (picture) runPictureTile(item);
          else runUploadRow(item, { local: true, totalBytes: Number(item.getAttribute("data-upload-size")) || 0 });
        });
      }
      return count;
    }

    function syncLocalUploadStatus(demo) {
      if (!demo) return;
      var live = demo.querySelector("[data-upload-status]");
      if (!live) return;
      var count = demo.querySelectorAll("[data-upload-local]").length;
      live.textContent = count ? "已选择 " + count + " 个本地文件" : "";
    }

    function rememberUploadDemoState(element) {
      if (!element || element.hasAttribute("data-upload-dynamic") || element._b2bUploadInitialState) return;
      element._b2bUploadInitialState = {
        className: element.className,
        innerHTML: element.innerHTML,
        hidden: element.hidden
      };
    }

    function scheduleUploadDemoReset(element, delay) {
      if (!element || !element._b2bUploadInitialState) return;
      window.clearTimeout(element._b2bUploadResetTimer);
      element._b2bUploadResetTimer = window.setTimeout(function () {
        window.clearInterval(element._b2bUploadTimer);
        window.clearTimeout(element._b2bCardTimer);
        window.clearTimeout(element._b2bPictureTimer);
        element.className = element._b2bUploadInitialState.className;
        element.innerHTML = element._b2bUploadInitialState.innerHTML;
        element.hidden = element._b2bUploadInitialState.hidden;
      }, delay == null ? 1400 : delay);
    }

    function finishUploadRow(row) {
      if (!row) return;
      window.clearInterval(row._b2bUploadTimer);
      row._b2bUploadTimer = null;
      row.classList.remove("is-uploading", "is-error");
      row.classList.add("is-complete");
      row.setAttribute("aria-busy", "false");
      var copy = row.querySelector(".upload-file-copy");
      var status = copy && copy.querySelector("small");
      var progress = copy && copy.querySelector(".upload-file-progress");
      var actions = row.querySelector(".upload-file-actions");
      var local = row.hasAttribute("data-upload-local");
      var localSize = formatUploadSize(Number(row.getAttribute("data-upload-size")) || 0);
      if (status) status.textContent = local ? localSize : "9.5 MB";
      if (progress) progress.remove();
      if (actions) actions.innerHTML = uploadActions("complete");
      if (local) row.setAttribute("aria-label", (row.getAttribute("data-upload-file-name") || "本地文件") + "，已选择，本地文件，" + localSize);
      var demo = row.closest("[data-upload-demo]");
      if (demo) {
        demo.querySelectorAll("[data-upload-start]").forEach(function (trigger) { trigger.disabled = false; });
        var live = demo.querySelector("[data-upload-status]");
        if (live) {
          var localUploading = demo.querySelectorAll("[data-upload-local].is-uploading").length;
          var localCount = demo.querySelectorAll("[data-upload-local]").length;
          live.textContent = local ? (localUploading ? "正在处理本地文件" : "已选择 " + localCount + " 个本地文件") : "Upload complete";
        }
      }
      if (!row.hasAttribute("data-upload-dynamic")) scheduleUploadDemoReset(row, 1200);
    }

    function runUploadRow(row, options) {
      if (!row) return;
      var opts = options || {};
      var local = opts.local || row.hasAttribute("data-upload-local");
      var totalBytes = Number(opts.totalBytes);
      if (!Number.isFinite(totalBytes) || totalBytes < 0) {
        var sizeAttribute = row.getAttribute("data-upload-size");
        totalBytes = sizeAttribute == null ? NaN : Number(sizeAttribute);
      }
      if (!Number.isFinite(totalBytes) || totalBytes < 0) totalBytes = 9.5 * 1024 * 1024;
      var totalLabel = formatUploadSize(totalBytes);
      rememberUploadDemoState(row);
      window.clearTimeout(row._b2bUploadResetTimer);
      window.clearInterval(row._b2bUploadTimer);
      row.classList.remove("is-error", "is-complete");
      row.classList.add("is-uploading");
      row.setAttribute("aria-busy", "true");
      var copy = row.querySelector(".upload-file-copy");
      var status = copy && copy.querySelector("small");
      var progress = copy && copy.querySelector(".upload-file-progress");
      var actions = row.querySelector(".upload-file-actions");
      if (!progress && copy) {
        progress = document.createElement("i");
        progress.className = "upload-file-progress";
        progress.setAttribute("role", "progressbar");
        progress.setAttribute("aria-label", "上传进度");
        progress.setAttribute("aria-valuemin", "0");
        progress.setAttribute("aria-valuemax", "100");
        progress.innerHTML = "<b></b>";
        copy.appendChild(progress);
      }
      if (actions) actions.innerHTML = uploadActions("uploading");
      var value = 0;
      function renderProgress() {
        var bounded = Math.min(100, value);
        var bar = progress && progress.querySelector("b");
        if (bar) bar.style.width = bounded + "%";
        if (progress) progress.setAttribute("aria-valuenow", String(bounded));
        if (status) status.textContent = local
          ? (bounded >= 100 ? totalLabel : formatUploadSize(Math.round(totalBytes * bounded / 100)) + " / " + totalLabel)
          : (9.5 * bounded / 100).toFixed(1) + " MB / 9.5 MB";
      }
      renderProgress();
      row._b2bUploadTimer = window.setInterval(function () {
        value = Math.min(100, value + (value < 40 ? 13 : value < 80 ? 9 : 5));
        renderProgress();
        if (value >= 100) finishUploadRow(row);
      }, 120);
    }

    function startUploadSimulation(trigger, files) {
      if (!trigger || uploadEntryIsDisabled(trigger)) return;
      var demo = trigger && trigger.closest("[data-upload-demo]");
      if (!demo || uploadDemoIsDisabled(demo) || demo.querySelector(".source-upload-file.is-uploading, .upload-picture-tile.is-uploading")) return;
      var list = demo.querySelector("[data-upload-list]");
      if (!list) return;
      if (files && files.length) {
        addLocalUploadFiles(demo, files);
        return;
      }
      var input = demo.querySelector("[data-upload-input]");
      if (isProductionUploadDemo(demo) && input) {
        input.click();
        return;
      }
      demo.querySelectorAll("[data-upload-start]").forEach(function (item) { item.disabled = true; });
      var live = demo.querySelector("[data-upload-status]");
      if (live) live.textContent = "Uploading";
      var picture = trigger.classList.contains("upload-picture");
      var row = document.createElement("article");
      if (picture) {
        row.className = "upload-picture-tile is-uploading";
        row.dataset.uploadDynamic = "";
        row.tabIndex = 0;
        row.setAttribute("aria-label", "Attachment image");
        row.innerHTML = '<span class="upload-picture-image" aria-hidden="true"></span><span class="upload-picture-progress"><i></i></span><button class="upload-picture-remove" type="button" data-upload-picture-remove aria-label="删除图片">' + uploadIcon("close") + "</button>";
        list.replaceChildren(row);
        runPictureTile(row);
        return;
      }
      row.className = "source-upload-file is-uploading" + (picture ? " has-preview" : "");
      row.dataset.uploadFile = "";
      row.dataset.uploadDynamic = "";
      row.tabIndex = 0;
      row.setAttribute("aria-label", "Attachment name");
      var fileIconMarkup = D.componentSpecimenHelpers.fileTypeIcon(picture ? "img" : "pdf");
      row.innerHTML = fileIconMarkup + '<span class="upload-file-copy"><strong>Attachment name</strong><small>0.0 MB / 9.5 MB</small><i class="upload-file-progress" role="progressbar" aria-label="上传进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><b style="width:0%"></b></i></span><span class="upload-file-actions">' + uploadActions("uploading") + "</span>";
      list.replaceChildren(row);
      runUploadRow(row);
    }

    function cancelUploadRow(row) {
      if (!row) return;
      rememberUploadDemoState(row);
      window.clearInterval(row._b2bUploadTimer);
      row._b2bUploadTimer = null;
      var demo = row.closest("[data-upload-demo]");
      if (row.hasAttribute("data-upload-reading")) {
        row.classList.add("is-dismissing");
        window.setTimeout(function () { row.hidden = true; }, 180);
      } else if (demo && row.hasAttribute("data-upload-dynamic")) {
        row.classList.add("is-dismissing");
        window.setTimeout(function () { releaseLocalImagePreview(row); row.remove(); }, 180);
      } else {
        row.classList.remove("is-uploading");
        row.classList.add("is-error");
        row.setAttribute("aria-busy", "false");
        var status = row.querySelector(".upload-file-copy small");
        var progress = row.querySelector(".upload-file-progress");
        var actions = row.querySelector(".upload-file-actions");
        if (status) status.textContent = "Upload cancelled";
        if (progress) progress.remove();
        if (actions) actions.innerHTML = uploadActions("error");
      }
      if (demo) {
        demo.querySelectorAll("[data-upload-start]").forEach(function (trigger) { trigger.disabled = false; });
        var live = demo.querySelector("[data-upload-status]");
        if (live) live.textContent = "Upload cancelled";
      }
      if (!row.hasAttribute("data-upload-dynamic")) scheduleUploadDemoReset(row, 1200);
    }

    function showUploadFeedback(message) {
      var host = document.body;
      var feedback = host.querySelector("[data-upload-action-feedback]");
      if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "upload-action-feedback";
        feedback.dataset.uploadActionFeedback = "";
        feedback.setAttribute("role", "status");
        feedback.setAttribute("aria-live", "polite");
        host.appendChild(feedback);
      }
      window.clearTimeout(feedback._b2bUploadFeedbackTimer);
      feedback.textContent = message;
      feedback.classList.add("is-visible");
      feedback._b2bUploadFeedbackTimer = window.setTimeout(function () {
        feedback.classList.remove("is-visible");
      }, 1600);
    }

    function openUploadPreview(source) {
      var existing = document.querySelector("[data-upload-preview-dialog]");
      if (existing) existing.remove();
      var localSource = source && source.closest ? source.closest("[data-upload-local]") : null;
      var previewUrl = localSource && localSource.getAttribute("data-upload-preview-url");
      var localName = localSource && (localSource.getAttribute("data-upload-file-name") || (localSource.querySelector("strong") && localSource.querySelector("strong").textContent.trim()));
      var previewName = localName || uploadPreviewSourceName(source);
      var media = previewUrl
        ? '<img class="upload-preview-dialog-image" src="' + escapeUploadText(previewUrl) + '" alt="' + escapeUploadText(previewName || "本地图片") + '" decoding="async">'
        : uploadPreviewIsImage(source, previewName, previewUrl)
          ? '<span class="upload-preview-dialog-image" role="img" aria-label="' + escapeUploadText(previewName || "图片附件") + '"></span>'
          : '<span class="upload-preview-dialog-file" aria-label="' + escapeUploadText(previewName || "文件附件") + '">' + D.componentSpecimenHelpers.fileTypeIcon(uploadPreviewFileType(source, previewName)) + '</span>';
      var dialog = document.createElement("div");
      dialog.className = "upload-preview-dialog";
      dialog.dataset.uploadPreviewDialog = "";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", "附件预览");
      dialog.innerHTML = '<button type="button" data-upload-preview-close aria-label="关闭预览">' + uploadIcon("close") + '</button><figure>' + media + '<figcaption>' + escapeUploadText(previewName || "Attachment name") + '</figcaption></figure>';
      document.body.appendChild(dialog);
      window.setTimeout(function () {
        dialog.classList.add("is-open");
        var close = dialog.querySelector("[data-upload-preview-close]");
        if (close) close.focus();
      }, 0);
    }

    function closeUploadPreview(dialog) {
      if (!dialog) return;
      dialog.classList.remove("is-open");
      window.setTimeout(function () { dialog.remove(); }, 160);
    }

    function uploadPreviewSourceName(source) {
      if (!source) return "Attachment name";
      var fileSource = source.closest && source.closest("[data-upload-local], [data-upload-file]");
      var previewCard = source.closest && source.closest("[data-upload-preview-card]");
      var figure = source.closest && source.closest("figure");
      var explicit = fileSource && fileSource.getAttribute("data-upload-file-name");
      if (explicit) return explicit;
      var strong = fileSource && fileSource.querySelector(".upload-file-copy strong, strong");
      if (strong && strong.textContent.trim()) return strong.textContent.trim();
      var cardStrong = previewCard && previewCard.querySelector("footer strong");
      if (cardStrong && cardStrong.textContent.trim()) return cardStrong.textContent.trim();
      var caption = figure && figure.querySelector("figcaption");
      if (caption) {
        var text = caption.textContent.replace(/(visibility|download|delete|attach_file)/g, "").trim();
        if (text) return text;
      }
      var sourceText = source.textContent && source.textContent.replace(/(visibility|download|delete|attach_file)/g, "").trim();
      if (sourceText && !/^(预览文件|预览附件|附件预览)$/i.test(sourceText)) return sourceText;
      var labelled = source.getAttribute && source.getAttribute("aria-label");
      if (labelled && labelled.trim() && !/^(预览文件|预览附件|附件预览)$/i.test(labelled.trim())) return labelled.trim();
      return "Attachment name";
    }

    function uploadPreviewIsImage(source, name, previewUrl) {
      if (previewUrl) return true;
      var tile = source && source.closest && source.closest(".upload-picture-tile");
      if (tile) return true;
      var card = source && source.closest && source.closest("[data-upload-preview-card]");
      if (card) return card.classList.contains("has-image") || Boolean(card.querySelector(".upload-preview-image"));
      return /\.(apng|avif|gif|jpe?g|png|svg|webp)$/i.test(String(name || ""));
    }

    function uploadPreviewFileType(source, name) {
      var owner = source && source.closest && source.closest("[data-upload-local], [data-upload-file], [data-upload-preview-card], figure");
      var icon = owner && owner.querySelector("[data-file-type]");
      var explicit = icon && icon.getAttribute("data-file-type");
      if (explicit) return explicit;
      var markup = D.componentSpecimenHelpers.fileTypeIcon(name || "attachment.dat");
      var match = markup.match(/data-file-type=\"([^\"]+)\"/);
      return match ? match[1] : "default";
    }

    function runPictureTile(tile) {
      if (!tile) return;
      rememberUploadDemoState(tile);
      window.clearTimeout(tile._b2bUploadResetTimer);
      window.clearTimeout(tile._b2bPictureTimer);
      tile.classList.remove("is-error", "is-complete");
      tile.classList.add("is-uploading");
      tile.setAttribute("aria-busy", "true");
      var retry = tile.querySelector("[data-upload-picture-retry]");
      if (retry) retry.remove();
      var progress = tile.querySelector(".upload-picture-progress");
      if (!progress) {
        progress = document.createElement("span");
        progress.className = "upload-picture-progress";
        progress.innerHTML = "<i></i>";
        tile.insertBefore(progress, tile.querySelector(".upload-picture-remove"));
      }
      tile._b2bPictureTimer = window.setTimeout(function () {
        tile.classList.remove("is-uploading");
        tile.classList.add("is-complete");
        tile.setAttribute("aria-busy", "false");
        if (tile.hasAttribute("data-upload-local")) {
          var tileName = tile.getAttribute("data-upload-file-name") || "本地图片";
          var tileSize = formatUploadSize(Number(tile.getAttribute("data-upload-size")) || 0);
          tile.title = tileName + " · " + tileSize;
          tile.setAttribute("aria-label", tileName + "，已选择，本地图片，" + tileSize);
        }
        if (progress) progress.remove();
        var demo = tile.closest("[data-upload-demo]");
        if (demo) {
          demo.querySelectorAll("[data-upload-start]").forEach(function (trigger) { trigger.disabled = false; });
          var live = demo.querySelector("[data-upload-status]");
          if (live) {
            var local = tile.hasAttribute("data-upload-local");
            var localUploading = demo.querySelectorAll("[data-upload-local].is-uploading").length;
            var localCount = demo.querySelectorAll("[data-upload-local]").length;
            live.textContent = local ? (localUploading ? "正在处理本地文件" : "已选择 " + localCount + " 个本地文件") : "Upload complete";
          }
        }
        showUploadFeedback(tile.hasAttribute("data-upload-local") ? "本地图片已就绪" : "图片上传完成");
        if (!tile.hasAttribute("data-upload-dynamic")) scheduleUploadDemoReset(tile, 1200);
      }, 900);
    }

    function runPreviewCard(card) {
      if (!card) return;
      rememberUploadDemoState(card);
      window.clearTimeout(card._b2bUploadResetTimer);
      window.clearTimeout(card._b2bCardTimer);
      card.classList.remove("is-error", "is-complete");
      card.classList.add("is-uploading");
      var placeholder = card.querySelector(".upload-preview-placeholder");
      if (placeholder) placeholder.remove();
      var progress = card.querySelector(".upload-preview-progress");
      if (!progress) {
        progress = document.createElement("span");
        progress.className = "upload-preview-progress";
        progress.innerHTML = '<i style="width:48%"></i>';
        card.querySelector(".upload-preview-media").appendChild(progress);
      }
      card._b2bCardTimer = window.setTimeout(function () {
        card.classList.remove("is-uploading");
        card.classList.add("is-complete");
        if (progress) progress.remove();
        var actions = card.querySelector(".upload-preview-actions");
        if (actions) actions.innerHTML = '<button type="button" data-upload-card-preview aria-label="预览附件">' + uploadIcon("visibility") + '</button><button type="button" data-upload-card-delete aria-label="删除附件">' + uploadIcon("delete") + "</button>";
        showUploadFeedback("附件上传完成");
        scheduleUploadDemoReset(card, 1200);
      }, 900);
    }

    function togglePictureMore(button) {
      var wall = button && button.closest(".upload-wall");
      if (!wall) return;
      var existing = wall.querySelector("[data-upload-picture-popover]");
      var expanded = button.getAttribute("aria-expanded") === "true";
      if (existing) existing.remove();
      button.setAttribute("aria-expanded", String(!expanded));
      if (expanded) return;
      var popover = document.createElement("div");
      popover.className = "upload-picture-popover";
      popover.dataset.uploadPicturePopover = "";
      popover.innerHTML = '<span></span><span></span><span></span>';
      wall.appendChild(popover);
    }

    function setSourcePopoverStatus(popoverRoot, message) {
      var status = popoverRoot && popoverRoot.querySelector("[data-popover-status]");
      if (status) status.textContent = message || "";
    }

    function placeSourcePopover(popoverRoot, panel) {
      if (!popoverRoot || !panel) return;
      var trigger = popoverRoot.querySelector("[data-popover-trigger]");
      if (!trigger) return;
      var triggerRect = trigger.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();
      var preferred = panel.dataset.preferredPosition || "bottom";
      var placement = preferred;
      var safe = 16;
      var gap = parseFloat(window.getComputedStyle(panel).getPropertyValue("--popover-trigger-gap")) || 12;
      var clearance = gap + safe;
      if (preferred === "bottom" && window.innerHeight - triggerRect.bottom < panelRect.height + clearance && triggerRect.top > panelRect.height + clearance) placement = "top";
      if (preferred === "top" && triggerRect.top < panelRect.height + clearance && window.innerHeight - triggerRect.bottom > panelRect.height + clearance) placement = "bottom";
      if (preferred === "right" && window.innerWidth - triggerRect.right < panelRect.width + clearance && triggerRect.left > panelRect.width + clearance) placement = "left";
      if (preferred === "left" && triggerRect.left < panelRect.width + clearance && window.innerWidth - triggerRect.right > panelRect.width + clearance) placement = "right";
      if ((preferred === "left" || preferred === "right") && triggerRect.left < panelRect.width + clearance && window.innerWidth - triggerRect.right < panelRect.width + clearance) {
        placement = window.innerHeight - triggerRect.bottom >= panelRect.height + clearance ? "bottom" : "top";
      }
      popoverRoot.dataset.placement = placement;
      ["top", "bottom", "left", "right"].forEach(function (direction) {
        panel.classList.toggle("is-" + direction, placement === direction);
      });
      panel.style.marginLeft = "";
      panel.style.marginTop = "";
      var placedRect = panel.getBoundingClientRect();
      if (placement === "top" || placement === "bottom") {
        var shiftX = placedRect.left < safe ? safe - placedRect.left : (placedRect.right > window.innerWidth - safe ? window.innerWidth - safe - placedRect.right : 0);
        if (shiftX) panel.style.marginLeft = shiftX + "px";
      } else {
        var shiftY = placedRect.top < safe ? safe - placedRect.top : (placedRect.bottom > window.innerHeight - safe ? window.innerHeight - safe - placedRect.bottom : 0);
        if (shiftY) panel.style.marginTop = shiftY + "px";
      }
    }

    function setSourcePopoverOpen(popoverRoot, open, restoreFocus) {
      if (!popoverRoot) return;
      var panel = popoverRoot.querySelector("[data-popover-panel]");
      var trigger = popoverRoot.querySelector("[data-popover-trigger]");
      if (!panel || !trigger) return;
      window.clearTimeout(panel._b2bPopoverCloseTimer);
      panel.classList.remove("is-opening", "is-closing");
      popoverRoot.classList.toggle("is-open", open);
      panel.classList.toggle("is-open", open);
      panel.setAttribute("aria-hidden", String(!open));
      trigger.setAttribute("aria-expanded", String(open));
      if (open) {
        panel.hidden = false;
        placeSourcePopover(popoverRoot, panel);
        panel.classList.add("is-opening");
        window.setTimeout(function () { panel.classList.remove("is-opening"); }, 140);
      } else if (!panel.hidden) {
        panel.classList.add("is-closing");
        panel._b2bPopoverCloseTimer = window.setTimeout(function () {
          panel.hidden = true;
          panel.classList.remove("is-closing");
        }, 120);
      }
      if (!open && restoreFocus) trigger.focus();
      popoverRoot.dispatchEvent(new CustomEvent("b2b:popover-visible-change", { bubbles: true, detail: { visible: open } }));
    }

    (root || document).addEventListener("click", function (event) {
      (root || document).querySelectorAll("[data-source-floating][data-floating-menu].is-expanded").forEach(function (floatingRoot) {
        if (!floatingRoot.contains(event.target)) setSourceFloatingOpen(floatingRoot, false, false, "outside");
      });
      (root || document).querySelectorAll("[data-popover-demo].is-open").forEach(function (popoverRoot) {
        if (!popoverRoot.contains(event.target)) setSourcePopoverOpen(popoverRoot, false, false);
      });

      var sourcePopoverTrigger = event.target.closest("[data-popover-trigger]");
      if (sourcePopoverTrigger) {
        var sourcePopoverRoot = sourcePopoverTrigger.closest("[data-popover-demo]");
        var sourcePopoverOpen = sourcePopoverTrigger.getAttribute("aria-expanded") !== "true";
        (root || document).querySelectorAll("[data-popover-demo].is-open").forEach(function (otherRoot) {
          if (otherRoot !== sourcePopoverRoot) setSourcePopoverOpen(otherRoot, false, false);
        });
        setSourcePopoverStatus(sourcePopoverRoot, "");
        setSourcePopoverOpen(sourcePopoverRoot, sourcePopoverOpen, false);
        return;
      }

      var sourcePopoverCancel = event.target.closest("[data-popover-cancel]");
      if (sourcePopoverCancel) {
        var sourcePopoverCancelRoot = sourcePopoverCancel.closest("[data-popover-demo]");
        setSourcePopoverStatus(sourcePopoverCancelRoot, "已取消");
        setSourcePopoverOpen(sourcePopoverCancelRoot, false, true);
        sourcePopoverCancelRoot.dispatchEvent(new CustomEvent("b2b:popover-cancel", { bubbles: true }));
        return;
      }

      var sourcePopoverConfirm = event.target.closest("[data-popover-confirm]");
      if (sourcePopoverConfirm && !sourcePopoverConfirm.classList.contains("is-loading")) {
        var sourcePopoverConfirmRoot = sourcePopoverConfirm.closest("[data-popover-demo]");
        var sourcePopoverConfirmLabel = sourcePopoverConfirm.querySelector("span");
        sourcePopoverConfirm.disabled = true;
        sourcePopoverConfirm.classList.add("is-loading");
        if (sourcePopoverConfirmLabel) sourcePopoverConfirmLabel.textContent = "Confirming";
        sourcePopoverConfirm.insertAdjacentHTML("afterbegin", '<span class="b2b-icon" aria-hidden="true">progress_activity</span>');
        window.setTimeout(function () {
          sourcePopoverConfirm.disabled = false;
          sourcePopoverConfirm.classList.remove("is-loading");
          var sourcePopoverConfirmIcon = sourcePopoverConfirm.querySelector(".b2b-icon");
          if (sourcePopoverConfirmIcon) sourcePopoverConfirmIcon.remove();
          if (sourcePopoverConfirmLabel) sourcePopoverConfirmLabel.textContent = "Confirm";
          setSourcePopoverStatus(sourcePopoverConfirmRoot, "已确认");
          setSourcePopoverOpen(sourcePopoverConfirmRoot, false, true);
          sourcePopoverConfirmRoot.dispatchEvent(new CustomEvent("b2b:popover-confirm", { bubbles: true }));
        }, 480);
        return;
      }

      (root || document).querySelectorAll("[data-color-saturation].is-dragging, [data-color-hue].is-dragging, [data-color-alpha].is-dragging").forEach(function (control) { control.classList.remove("is-dragging"); });
      (root || document).querySelectorAll("[data-simple-color-picker].is-open").forEach(function (simpleRoot) {
        if (!simpleRoot.contains(event.target)) setSimpleColorOpen(simpleRoot, false, false);
      });
      (root || document).querySelectorAll("[data-color-picker-control].is-open").forEach(function (colorRoot) {
        if (!colorRoot.contains(event.target)) setColorPickerOpen(colorRoot, false, true);
      });
      var currentTreeInteraction = event.target.closest("[data-tree-select].is-open");
      if (currentTreeInteraction) setTreeSelectOpen(currentTreeInteraction, true, false, true);
      var ratingStar = event.target.closest("[data-rating-value]:not(:disabled)");
      if (ratingStar) {
        var ratingRoot = ratingStar.closest("[data-rating]");
        var ratingValue = ratingPointerValue(ratingStar, event);
        if (Number(ratingRoot.dataset.value) === ratingValue && ratingRoot.dataset.clearable === "true") ratingValue = 0;
        updateRating(ratingRoot, ratingValue);
      }

      var sourceStepperButton = event.target.closest("[data-source-stepper] [data-stepper-step]:not(:disabled)");
      if (sourceStepperButton) {
        var sourceStepperRoot = sourceStepperButton.closest("[data-source-stepper]");
        var sourceStepperInput = sourceStepperRoot.querySelector("[data-stepper-input]");
        updateSourceStepper(sourceStepperRoot, Number(sourceStepperInput.value) + Number(sourceStepperButton.dataset.stepperStep) * Number(sourceStepperRoot.dataset.step || 1), true);
      }

      var sliderRangeTrack = event.target.closest(".source-slider-control");
      if (sliderRangeTrack && !event.target.closest("[data-slider-range]")) {
        var sliderRangeRoot = sliderRangeTrack.closest("[data-source-slider].is-range");
        if (sliderRangeRoot && !sliderRangeRoot.classList.contains("is-disabled")) {
          var sliderRangeRect = sliderRangeRoot.querySelector(".source-slider-track").getBoundingClientRect();
          var sliderRangeVertical = sliderRangeRoot.classList.contains("is-vertical");
          var sliderRangeMin = Number(sliderRangeRoot.dataset.min || 0);
          var sliderRangeMax = Number(sliderRangeRoot.dataset.max || 100);
          var sliderRangeRatio = sliderRangeVertical
            ? (sliderRangeRect.bottom - event.clientY) / sliderRangeRect.height
            : (event.clientX - sliderRangeRect.left) / sliderRangeRect.width;
          var sliderRangeValue = sliderRangeMin + Math.max(0, Math.min(1, sliderRangeRatio)) * (sliderRangeMax - sliderRangeMin);
          var sliderRangeInputs = Array.from(sliderRangeRoot.querySelectorAll("[data-slider-range]"));
          var sliderRangeTarget = sliderRangeInputs.reduce(function (nearest, input) {
            return Math.abs(Number(input.value) - sliderRangeValue) < Math.abs(Number(nearest.value) - sliderRangeValue) ? input : nearest;
          }, sliderRangeInputs[0]);
          sliderRangeTarget.value = String(sliderRangeValue);
          updateSourceSlider(sliderRangeRoot, sliderRangeTarget);
          sliderRangeTarget.focus();
        }
      }

      var treeClear = event.target.closest("[data-tree-clear]");
      if (treeClear) {
        event.preventDefault();
        event.stopPropagation();
        var treeClearRoot = treeClear.closest("[data-tree-select]");
        clearTreeSelection(treeClearRoot);
        var treeClearTrigger = treeClearRoot.querySelector("[data-tree-trigger]");
        if (treeClearTrigger) treeClearTrigger.focus();
        return;
      }

      var treeRemove = event.target.closest("[data-tree-remove]");
      if (treeRemove) {
        event.preventDefault();
        event.stopPropagation();
        removeTreeSelection(treeRemove.closest("[data-tree-select]"), treeRemove.dataset.value);
        return;
      }

      var treeNavToggle = event.target.closest("[data-tree-nav-toggle]");
      if (treeNavToggle) {
        var treeNavNode = treeNavToggle.closest("[data-tree-nav-node]");
        var treeNavExpanded = !treeNavNode.classList.contains("is-expanded");
        treeNavNode.classList.toggle("is-expanded", treeNavExpanded);
        treeNavToggle.setAttribute("aria-expanded", String(treeNavExpanded));
        treeNavToggle.setAttribute("aria-label", (treeNavExpanded ? "折叠 " : "展开 ") + treeNavNode.querySelector("[data-tree-nav-label]").textContent.trim());
        return;
      }

      var treeNavLabel = event.target.closest("[data-tree-nav-label]");
      if (treeNavLabel) {
        var treeNavigation = treeNavLabel.closest("[data-tree-navigation]");
        treeNavigation.querySelectorAll("[data-tree-nav-node].is-selected").forEach(function (node) {
          node.classList.remove("is-selected");
          var oldLabel = node.querySelector(":scope > .tree-nav-row [data-tree-nav-label]");
          if (oldLabel) oldLabel.removeAttribute("aria-current");
        });
        treeNavLabel.closest("[data-tree-nav-node]").classList.add("is-selected");
        treeNavLabel.setAttribute("aria-current", "page");
        return;
      }

      var treePeopleToggle = event.target.closest("[data-tree-people-toggle]");
      if (treePeopleToggle) {
        var treePeopleNode = treePeopleToggle.closest("[data-tree-people-node]");
        var treePeopleExpanded = !treePeopleNode.classList.contains("is-expanded");
        treePeopleNode.classList.toggle("is-expanded", treePeopleExpanded);
        treePeopleToggle.setAttribute("aria-expanded", String(treePeopleExpanded));
        return;
      }

      var treePeopleSearchClear = event.target.closest("[data-tree-people-search-clear]");
      if (treePeopleSearchClear) {
        var treePeopleSearchRoot = treePeopleSearchClear.closest("[data-tree-people]");
        var treePeopleSearchInput = treePeopleSearchRoot.querySelector("[data-tree-people-search]");
        if (treePeopleSearchInput) {
          treePeopleSearchInput.value = "";
          filterPeopleTree(treePeopleSearchRoot);
          treePeopleSearchInput.focus();
        }
        return;
      }

      var treePeopleClear = event.target.closest("[data-tree-people-clear]");
      if (treePeopleClear) {
        var treePeopleClearRoot = treePeopleClear.closest("[data-tree-people]");
        treePeopleClearRoot.querySelectorAll("[data-tree-people-check]").forEach(function (check) {
          check.checked = false;
          check.indeterminate = false;
          updateCheckboxControl(check);
        });
        renderPeopleSelection(treePeopleClearRoot);
        return;
      }

      var treePeopleRemove = event.target.closest("[data-tree-people-remove]");
      if (treePeopleRemove) {
        var treePeopleRemoveRoot = treePeopleRemove.closest("[data-tree-people]");
        var treePeopleValue = treePeopleRemove.closest("[data-tree-people-selected]").dataset.value;
        var treePeopleCheck = Array.from(treePeopleRemoveRoot.querySelectorAll("[data-tree-people-check][data-tree-person]")).find(function (check) {
          return check.value === treePeopleValue;
        });
        if (treePeopleCheck) {
          treePeopleCheck.checked = false;
          treePeopleCheck.indeterminate = false;
          updateCheckboxControl(treePeopleCheck);
          syncPeopleTreeAncestors(treePeopleCheck);
        }
        renderPeopleSelection(treePeopleRemoveRoot);
        return;
      }

      var treeSearchClear = event.target.closest("[data-tree-search-clear]");
      if (treeSearchClear) {
        var treeSearchClearRoot = treeSearchClear.closest("[data-tree-select]");
        var treeSearchClearInput = treeSearchClearRoot.querySelector("[data-tree-search]");
        if (treeSearchClearInput) {
          treeSearchClearInput.value = "";
          filterTreeSelect(treeSearchClearRoot);
          treeSearchClearInput.focus();
        }
        return;
      }

      var treeTrigger = event.target.closest("[data-tree-trigger]:not(:disabled)");
      if (treeTrigger) {
        var treeTriggerRoot = treeTrigger.closest("[data-tree-select]");
        setTreeSelectOpen(treeTriggerRoot, !treeTriggerRoot.classList.contains("is-open"), false, true);
      }

      var transferRemove = event.target.closest("[data-transfer-remove]");
      if (transferRemove) {
        var transferRemoveRoot = transferRemove.closest("[data-transfer]");
        var transferRemoveValue = transferRemove.closest("[data-transfer-selected]").dataset.value;
        var transferRemoveChoice = Array.from(transferRemoveRoot.querySelectorAll("[data-transfer-choice]")).find(function (choice) { return choice.value === transferRemoveValue; });
        if (transferRemoveChoice) transferRemoveChoice.checked = false;
        renderTransfer(transferRemoveRoot);
      }

      var transferClear = event.target.closest("[data-transfer-clear]");
      if (transferClear) {
        var transferClearRoot = transferClear.closest("[data-transfer]");
        transferClearRoot.querySelectorAll("[data-transfer-choice]").forEach(function (choice) { choice.checked = false; });
        renderTransfer(transferClearRoot);
      }

      var timeClear = event.target.closest("[data-time-clear]");
      if (timeClear) {
        event.preventDefault();
        event.stopPropagation();
        var timeClearRoot = timeClear.closest("[data-time-picker]");
        syncTimePickerSelectionFromInput(timeClearRoot, "");
        timePickerInput(timeClearRoot).value = "";
        timeClearRoot.classList.remove("is-selected");
        updateTimePickerDoneState(timeClearRoot);
        commitTimePickerState(timeClearRoot);
        timePickerInput(timeClearRoot).focus();
        return;
      }

      var timeTrigger = event.target.closest("[data-time-trigger]");
      if (timeTrigger) {
        var timeTriggerRoot = timeTrigger.closest("[data-time-picker]");
        if (!timeTriggerRoot.classList.contains("is-open") || !timeTriggerRoot.classList.contains("is-user-open")) {
          closeOtherTimePickers(timeTriggerRoot);
          setTimePickerOpen(timeTriggerRoot, true, false, true);
        }
      }

      var timeValue = event.target.closest("[data-time-value]:not(:disabled)");
      if (timeValue) {
        var timeColumn = timeValue.closest(".time-column");
        setTimePickerColumnValue(timeColumn, timeValue.dataset.timeValue);
        var timeValueRoot = timeValue.closest("[data-time-picker]");
        renderTimePicker(timeValueRoot);
        scrollTimePickerSelections(timeValueRoot);
        if (timeValueRoot.dataset.footer !== "true") commitTimePickerState(timeValueRoot);
        timeValue.focus();
        return;
      }

      var timeNow = event.target.closest("[data-time-now]");
      if (timeNow) {
        var timeNowRoot = timeNow.closest("[data-time-picker]");
        setTimePickerToNow(timeNowRoot);
        return;
      }

      var timeDone = event.target.closest("[data-time-done]:not(:disabled)");
      if (timeDone) {
        var timeDoneRoot = timeDone.closest("[data-time-picker]");
        commitTimePickerState(timeDoneRoot);
        setTimePickerOpen(timeDoneRoot, false, true, false);
        return;
      }

      var timeCancel = event.target.closest("[data-time-cancel]");
      if (timeCancel) {
        var timeCancelRoot = timeCancel.closest("[data-time-picker]");
        restoreTimePickerState(timeCancelRoot);
        setTimePickerOpen(timeCancelRoot, false, true, false);
        return;
      }

      var uploadCollapse = event.target.closest("[data-upload-collapse]");
      if (uploadCollapse) {
        var uploadPanel = uploadCollapse.closest("[data-upload-async]");
        uploadPanel.classList.toggle("is-collapsed");
        var uploadArrow = uploadCollapse.querySelector(".b2b-icon");
        if (uploadArrow) uploadArrow.textContent = uploadPanel.classList.contains("is-collapsed") ? "expand_less" : "expand_more";
      }

      var uploadStart = event.target.closest("[data-upload-start]");
      if (uploadStart) startUploadSimulation(uploadStart);

      var uploadCancel = event.target.closest("[data-upload-cancel]");
      if (uploadCancel) cancelUploadRow(uploadCancel.closest("[data-upload-file]"));

      var uploadRetry = event.target.closest("[data-upload-retry]");
      if (uploadRetry) runUploadRow(uploadRetry.closest("[data-upload-file]"));

      var uploadDelete = event.target.closest("[data-upload-delete]");
      if (uploadDelete) {
        var uploadDeleteFile = uploadDelete.closest("[data-upload-file]");
        if (uploadDeleteFile) {
          window.clearInterval(uploadDeleteFile._b2bUploadTimer);
          rememberUploadDemoState(uploadDeleteFile);
          uploadDeleteFile.classList.add("is-dismissing");
          var uploadDeleteDemo = uploadDeleteFile.closest("[data-upload-demo]");
          var persistentProductionRemoval = isProductionUploadDemo(uploadDeleteDemo);
          if (uploadDeleteFile.hasAttribute("data-upload-dynamic") || persistentProductionRemoval) {
            window.setTimeout(function () {
              releaseLocalImagePreview(uploadDeleteFile);
              uploadDeleteFile.remove();
              syncLocalUploadStatus(uploadDeleteDemo);
            }, 180);
            showUploadFeedback("文件已删除");
          } else {
            scheduleUploadDemoReset(uploadDeleteFile, 520);
            showUploadFeedback("文件已删除，状态示例已重置");
          }
        }
      }

      var uploadPreviewClose = event.target.closest("[data-upload-preview-close]");
      if (uploadPreviewClose) {
        closeUploadPreview(uploadPreviewClose.closest("[data-upload-preview-dialog]"));
        return;
      }
      if (event.target.matches && event.target.matches("[data-upload-preview-dialog]")) {
        closeUploadPreview(event.target);
        return;
      }

      var uploadPreview = event.target.closest("[data-upload-preview]");
      if (uploadPreview) {
        event.preventDefault();
        openUploadPreview(uploadPreview);
        return;
      }

      var uploadDownload = event.target.closest("[data-upload-download]");
      if (uploadDownload) {
        showUploadFeedback("已开始下载文件");
        return;
      }

      var uploadPictureRemove = event.target.closest("[data-upload-picture-remove]");
      if (uploadPictureRemove) {
        var uploadPictureTile = uploadPictureRemove.closest(".upload-picture-tile");
        if (uploadPictureTile) {
          uploadPictureTile.classList.add("is-dismissing");
          var uploadPictureDemo = uploadPictureTile.closest("[data-upload-demo]");
          var persistentProductionPictureRemoval = isProductionUploadDemo(uploadPictureDemo);
          if (uploadPictureTile.hasAttribute("data-upload-dynamic") || persistentProductionPictureRemoval) {
            window.clearTimeout(uploadPictureTile._b2bPictureTimer);
            window.setTimeout(function () {
              releaseLocalImagePreview(uploadPictureTile);
              uploadPictureTile.remove();
              syncLocalUploadStatus(uploadPictureDemo);
            }, 180);
            showUploadFeedback("图片已删除");
          } else {
            rememberUploadDemoState(uploadPictureTile);
            scheduleUploadDemoReset(uploadPictureTile, 520);
            showUploadFeedback("图片已删除，状态示例已重置");
          }
        }
        return;
      }

      var uploadPictureRetry = event.target.closest("[data-upload-picture-retry]");
      if (uploadPictureRetry) {
        runPictureTile(uploadPictureRetry.closest(".upload-picture-tile"));
        return;
      }

      var uploadPictureMore = event.target.closest("[data-upload-picture-more]");
      if (uploadPictureMore) {
        togglePictureMore(uploadPictureMore);
        return;
      }

      var uploadCardRetry = event.target.closest("[data-upload-card-retry]");
      if (uploadCardRetry) {
        runPreviewCard(uploadCardRetry.closest("[data-upload-preview-card]"));
        return;
      }

      var uploadCardCancel = event.target.closest("[data-upload-card-cancel]");
      if (uploadCardCancel) {
        var uploadCancelledCard = uploadCardCancel.closest("[data-upload-preview-card]");
        rememberUploadDemoState(uploadCancelledCard);
        window.clearTimeout(uploadCancelledCard._b2bCardTimer);
        uploadCancelledCard.classList.remove("is-uploading");
        uploadCancelledCard.classList.add("is-error");
        var uploadCancelledProgress = uploadCancelledCard.querySelector(".upload-preview-progress");
        if (uploadCancelledProgress) uploadCancelledProgress.remove();
        if (uploadCancelledCard.classList.contains("has-image") && !uploadCancelledCard.querySelector(".upload-preview-placeholder")) {
          var uploadCancelledPlaceholder = document.createElement("span");
          uploadCancelledPlaceholder.className = "upload-preview-placeholder";
          uploadCancelledPlaceholder.innerHTML = uploadIcon("broken_image");
          uploadCancelledCard.querySelector(".upload-preview-media").appendChild(uploadCancelledPlaceholder);
        }
        var uploadCancelledActions = uploadCancelledCard.querySelector(".upload-preview-actions");
        if (uploadCancelledActions) uploadCancelledActions.innerHTML = '<button type="button" data-upload-card-retry aria-label="重试上传">' + uploadIcon("refresh") + '</button><button type="button" data-upload-card-delete aria-label="删除附件">' + uploadIcon("delete") + "</button>";
        showUploadFeedback("附件上传已取消");
        scheduleUploadDemoReset(uploadCancelledCard, 1400);
        return;
      }

      var uploadCardPreview = event.target.closest("[data-upload-card-preview]");
      if (uploadCardPreview) {
        openUploadPreview(uploadCardPreview);
        return;
      }

      var uploadCardDelete = event.target.closest("[data-upload-card-delete]");
      if (uploadCardDelete) {
        var uploadDeletedCard = uploadCardDelete.closest("[data-upload-preview-card]");
        rememberUploadDemoState(uploadDeletedCard);
        uploadDeletedCard.classList.add("is-dismissing");
        scheduleUploadDemoReset(uploadDeletedCard, 520);
        showUploadFeedback("附件已删除，状态示例已重置");
        return;
      }

      var uploadChange = event.target.closest("[data-upload-change]");
      if (uploadChange) {
        var uploadChangeCell = uploadChange.closest(".specimen-stage") || uploadChange.parentElement;
        var uploadChangeRow = uploadChangeCell && uploadChangeCell.querySelector("[data-upload-file]");
        if (uploadChangeRow) runUploadRow(uploadChangeRow);
        showUploadFeedback("已选择新文件");
        return;
      }

      var uploadTemplate = event.target.closest("[data-upload-template]");
      if (uploadTemplate) {
        var uploadTemplateText = uploadTemplate.textContent;
        uploadTemplate.textContent = "模板已下载";
        window.setTimeout(function () { uploadTemplate.textContent = uploadTemplateText; }, 1400);
        showUploadFeedback("导入模板已下载");
        return;
      }

      var uploadErrorDownload = event.target.closest("[data-upload-download-error]");
      if (uploadErrorDownload) {
        showUploadFeedback("错误文件已下载");
        return;
      }

      var uploadLargeDelete = event.target.closest("[data-upload-large-delete]");
      if (uploadLargeDelete) {
        var uploadLargeFigure = uploadLargeDelete.closest("figure");
        rememberUploadDemoState(uploadLargeFigure);
        uploadLargeFigure.classList.add("is-dismissing");
        scheduleUploadDemoReset(uploadLargeFigure, 520);
        showUploadFeedback("预览附件已删除，状态示例已重置");
        return;
      }

      var uploadClose = event.target.closest("[data-upload-close]");
      if (uploadClose) {
        var uploadClosePanel = uploadClose.closest("[data-upload-async]");
        rememberUploadDemoState(uploadClosePanel);
        uploadClosePanel.classList.add("is-dismissing");
        scheduleUploadDemoReset(uploadClosePanel, 700);
        showUploadFeedback("上传面板已关闭，状态示例已重置");
        return;
      }

      var uploadPreviewSurface = event.target.closest(".upload-picture-tile.is-complete, .upload-picture-tile.is-hover, [data-upload-preview-card].is-complete, [data-upload-preview-card].is-hover");
      if (uploadPreviewSurface && !event.target.closest("button")) {
        openUploadPreview(uploadPreviewSurface);
        return;
      }

      var passiveUploadTrigger = event.target.closest(".component-spec-board[data-component-id=\"C-31\"] .source-upload-drop, .component-spec-board[data-component-id=\"C-31\"] .upload-picture");
      if (passiveUploadTrigger && !uploadEntryIsDisabled(passiveUploadTrigger) && !passiveUploadTrigger.hasAttribute("data-upload-start")) {
        passiveUploadTrigger.classList.add("is-pressed");
        window.setTimeout(function () { passiveUploadTrigger.classList.remove("is-pressed"); }, 180);
        showUploadFeedback("已打开文件选择器");
        return;
      }

      var uploadCompletedRow = event.target.closest("[data-upload-file].is-complete");
      if (uploadCompletedRow && !uploadCompletedRow.hasAttribute("data-upload-local") && !event.target.closest("button")) {
        openUploadPreview(uploadCompletedRow);
        return;
      }

      var tableExpand = event.target.closest("[data-table-expand]");
      if (tableExpand) {
        if (tableExpand.matches("[data-table-group-toggle]")) {
          toggleTableGroup(tableExpand);
          return;
        }
        if (tableExpand.matches("[data-tree-expand]")) {
          toggleTableTreeRow(tableExpand);
          return;
        }
        var tableExpanded = tableExpand.getAttribute("aria-expanded") !== "true";
        tableExpand.setAttribute("aria-expanded", String(tableExpanded));
        var tableExpandIcon = tableExpand.querySelector(".b2b-icon");
        if (tableExpandIcon) tableExpandIcon.textContent = tableExpanded ? "arrow_drop_down" : "arrow_right";
        var tableRowLabel = tableExpand.closest("tr").dataset.tableRowLabel || "详情";
        tableExpand.setAttribute("aria-label", (tableExpanded ? "收起 " : "展开 ") + tableRowLabel);
        var tableExpandedRow = tableExpand.closest("tr").nextElementSibling;
        if (tableExpandedRow && tableExpandedRow.classList.contains("table-expanded-row")) tableExpandedRow.hidden = !tableExpanded;
      }

      var tableEditStart = event.target.closest("[data-table-edit-start]");
      if (tableEditStart) {
        beginTableEdit(tableEditStart, event.detail === 0 ? "keyboard" : "pointer");
        return;
      }

      var tableEditCommit = event.target.closest("[data-table-edit-commit]");
      if (tableEditCommit) {
        finishTableEdit(tableEditCommit.closest("[data-table-editable-row]"), true, event.detail === 0 ? "keyboard" : "pointer", true);
        return;
      }

      var tableEditCancel = event.target.closest("[data-table-edit-cancel]");
      if (tableEditCancel) {
        finishTableEdit(tableEditCancel.closest("[data-table-editable-row]"), false, event.detail === 0 ? "keyboard" : "pointer", true);
        return;
      }

      var tableSort = event.target.closest("[data-table-sort]");
      if (tableSort) {
        sortTableByButton(tableSort);
        return;
      }

      var tableFilterReset = event.target.closest("[data-table-filter-reset]");
      if (tableFilterReset) {
        resetTableFilter(tableFilterReset.closest("[data-popup-root]"));
        return;
      }

      var tableFilterConfirm = event.target.closest("[data-table-filter-confirm]");
      if (tableFilterConfirm) {
        var tableFilterPopup = tableFilterConfirm.closest("[data-popup-root]");
        confirmTableFilter(tableFilterPopup);
        setPopupState(tableFilterPopup, false, false);
        var tableFilterTrigger = tableFilterPopup.querySelector("[data-popup-trigger]");
        if (tableFilterTrigger) tableFilterTrigger.focus();
        return;
      }

      var tableClearSelection = event.target.closest("[data-table-clear-selection]");
      if (tableClearSelection) {
        var clearTableRoot = tableClearSelection.closest("[data-table-demo]");
        clearTableRoot.querySelectorAll("[data-demo-row-select]").forEach(function (input) {
          input.checked = false;
          input.indeterminate = false;
        });
        syncTableSelection(clearTableRoot);
        tableClearSelection.focus();
        return;
      }

      var sourceTabClose = event.target.closest("[data-tab-close]");
      if (sourceTabClose && !isDirectRendererNode(sourceTabClose)) {
        event.stopPropagation();
        var sourceTabButton = sourceTabClose.closest('[role="tab"]');
        var sourceTabsRoot = sourceTabButton.closest("[data-source-tabs]");
        var wasActiveTab = sourceTabButton.classList.contains("is-active");
        var fallbackTab = sourceTabButton.previousElementSibling || sourceTabButton.nextElementSibling;
        sourceTabButton.remove();
        if (wasActiveTab && fallbackTab && fallbackTab.matches("[role='tab']")) activateSourceTab(fallbackTab, { focus: true });
        else {
          var remainingTab = sourceTabsRoot.querySelector(".source-tabs-scroll > [role='tab']");
          if (wasActiveTab && remainingTab) activateSourceTab(remainingTab, { focus: true });
          else syncSourceTabs(sourceTabsRoot, false);
        }
        updateSourceTabsScrollControls(sourceTabsRoot);
        return;
      }

      var sourceTab = event.target.closest('[data-source-tabs] [role="tab"]:not(:disabled)');
      if (sourceTab && !isDirectRendererNode(sourceTab)) {
        activateSourceTab(sourceTab);
        return;
      }

      var sourceTabAdd = event.target.closest("[data-tab-add]");
      if (sourceTabAdd && !isDirectRendererNode(sourceTabAdd)) {
        var sourceTabAddRoot = sourceTabAdd.closest("[data-source-tabs]");
        var sourceTabScroll = sourceTabAddRoot.querySelector(".source-tabs-scroll");
        var nextTabNumber = sourceTabButtons(sourceTabAddRoot).length + 1;
        var sourceTabPanel = sourceTabAddRoot.querySelector(".source-tab-panel");
        var indicator = sourceTabScroll.querySelector(".source-tabs-indicator");
        var nextTab = document.createElement("button");
        nextTab.id = sourceTabAddRoot.id + "-tab-" + nextTabNumber;
        nextTab.type = "button";
        nextTab.setAttribute("role", "tab");
        nextTab.setAttribute("aria-selected", "false");
        nextTab.setAttribute("aria-controls", sourceTabPanel ? sourceTabPanel.id : "");
        nextTab.tabIndex = -1;
        nextTab.innerHTML = '<span class="source-tab-label">Tab ' + nextTabNumber + '</span><i data-tab-close aria-label="关闭 Tab ' + nextTabNumber + '"><span class="b2b-icon" aria-hidden="true">close</span></i>';
        sourceTabScroll.insertBefore(nextTab, indicator);
        activateSourceTab(nextTab, { focus: true });
        return;
      }

      var sourceTabsScrollButton = event.target.closest("[data-tabs-scroll]");
      if (sourceTabsScrollButton && !isDirectRendererNode(sourceTabsScrollButton)) {
        sourceTabsScrollButton.closest("[data-source-tabs]").querySelector(".source-tabs-scroll").scrollBy({ left: Number(sourceTabsScrollButton.dataset.tabsScroll) * 160, behavior: "smooth" });
        return;
      }

      var sourceTabsMoreTrigger = event.target.closest("[data-tabs-more-trigger]");
      if (sourceTabsMoreTrigger && !isDirectRendererNode(sourceTabsMoreTrigger)) {
        var sourceTabsMore = sourceTabsMoreTrigger.closest("[data-tabs-more]");
        var sourceTabsMoreOpen = !sourceTabsMore.classList.contains("is-open");
        interactionRoot.querySelectorAll("[data-tabs-more].is-open").forEach(function (more) {
          if (more !== sourceTabsMore) setTabsMoreOpen(more, false, false);
        });
        setTabsMoreOpen(sourceTabsMore, sourceTabsMoreOpen, false);
        return;
      }

      var sourceOverflowTab = event.target.closest("[data-tabs-overflow-tab]");
      if (sourceOverflowTab && !isDirectRendererNode(sourceOverflowTab)) {
        var sourceOverflowRoot = sourceOverflowTab.closest("[data-source-tabs]");
        var sourceOverflowTabs = sourceTabButtons(sourceOverflowRoot);
        var replacement = sourceOverflowTabs[sourceOverflowTabs.length - 1];
        if (replacement) {
          replacement.querySelector(".source-tab-label").textContent = sourceOverflowTab.textContent.trim();
          activateSourceTab(replacement, { focus: true });
        }
        setTabsMoreOpen(sourceOverflowTab.closest("[data-tabs-more]"), false, false);
        return;
      }

      interactionRoot.querySelectorAll("[data-tabs-more].is-open").forEach(function (more) {
        if (!more.contains(event.target)) setTabsMoreOpen(more, false, false);
      });

      var sourceTagClose = event.target.closest("[data-source-tag-close]");
      if (sourceTagClose) {
        event.preventDefault();
        event.stopPropagation();
        var sourceTag = sourceTagClose.closest(".source-tag");
        var sourceTagDemo = sourceTag.closest("[data-tag-demo]");
        var tagFocusTarget = sourceTagDemo && sourceTagDemo.querySelector("[data-source-tag-add]");
        sourceTag.style.setProperty("--tag-dismiss-width", sourceTag.offsetWidth + "px");
        window.requestAnimationFrame(function () { sourceTag.classList.add("is-dismissing"); });
        window.setTimeout(function () {
          var removedLabel = sourceTag.querySelector(".source-tag-label");
          var removedText = removedLabel ? removedLabel.textContent : "标签";
          sourceTag.remove();
          updateTagDemo(sourceTagDemo, "已移除“" + removedText + "”");
          if (tagFocusTarget) tagFocusTarget.focus();
        }, 220);
        return;
      }

      var sourceTagCheck = event.target.closest("[data-source-tag-check]:not(:disabled)");
      if (sourceTagCheck) {
        var tagChecked = sourceTagCheck.getAttribute("aria-pressed") !== "true";
        sourceTagCheck.setAttribute("aria-pressed", String(tagChecked));
        sourceTagCheck.classList.toggle("is-checked", tagChecked);
        var tagCheckGroup = sourceTagCheck.closest("[data-tag-check-group]");
        var tagCheckOutput = tagCheckGroup && tagCheckGroup.querySelector("output");
        if (tagCheckOutput) {
          var checkedCount = tagCheckGroup.querySelectorAll('[data-source-tag-check][aria-pressed="true"]').length;
          tagCheckOutput.textContent = checkedCount ? "已选择 " + checkedCount + " 项" : "当前未选择";
        }
        return;
      }

      var sourceTagAdd = event.target.closest("[data-source-tag-add]");
      if (sourceTagAdd) {
        var addTagDemo = sourceTagAdd.closest("[data-tag-demo]");
        var addTagList = addTagDemo && addTagDemo.querySelector("[data-tag-list]");
        var tagPresets = [
          ["Design", "green"],
          ["Research", "cyan"],
          ["Blocked", "red"]
        ];
        var nextTagIndex = Number(addTagDemo && addTagDemo.dataset.tagNext || 0);
        var preset = tagPresets[nextTagIndex % tagPresets.length];
        var nextTag = createManagedTag(preset[0], preset[1]);
        addTagList.insertBefore(nextTag, sourceTagAdd);
        if (addTagDemo) addTagDemo.dataset.tagNext = String(nextTagIndex + 1);
        window.setTimeout(function () { nextTag.classList.remove("is-entering"); }, 240);
        updateTagDemo(addTagDemo, "已新增“" + preset[0] + "”");
        return;
      }

      var sourceTagRestore = event.target.closest("[data-source-tag-restore]");
      if (sourceTagRestore) {
        var restoreTagDemo = sourceTagRestore.closest("[data-tag-demo]");
        var restoreTagList = restoreTagDemo && restoreTagDemo.querySelector("[data-tag-list]");
        var restoreTemplate = restoreTagDemo && restoreTagDemo.querySelector("[data-tag-template]");
        if (restoreTagList && restoreTemplate) {
          restoreTagList.innerHTML = restoreTemplate.innerHTML;
          restoreTagList.querySelectorAll(".source-tag").forEach(function (tag) {
            tag.classList.add("is-entering");
            window.setTimeout(function () { tag.classList.remove("is-entering"); }, 240);
          });
          restoreTagDemo.dataset.tagNext = "0";
          updateTagDemo(restoreTagDemo, "已恢复 3 个初始标签");
        }
        return;
      }

      var timelineCollapse = event.target.closest("[data-timeline-collapse-trigger]");
      if (timelineCollapse) {
        var timelineRoot = timelineCollapse.closest("[data-timeline-collapse]");
        var timelineExpanded = timelineCollapse.getAttribute("aria-expanded") === "true";
        timelineCollapse.setAttribute("aria-expanded", String(!timelineExpanded));
        timelineRoot.classList.toggle("is-expanded", !timelineExpanded);
        timelineRoot.querySelectorAll("[data-timeline-hidden]").forEach(function (item) {
          item.setAttribute("aria-hidden", String(timelineExpanded));
        });
        var timelineCollapseLabel = timelineCollapse.querySelector("[data-timeline-collapse-label]");
        if (timelineCollapseLabel) timelineCollapseLabel.textContent = timelineExpanded ? "展开更多 " + timelineRoot.dataset.collapsedCount + " 项" : "收起";
        var timelineCollapseLive = timelineRoot.querySelector(".timeline-live");
        if (timelineCollapseLive) timelineCollapseLive.textContent = timelineExpanded ? "已折叠时间轴" : "已展开全部时间轴节点";
      }

      var treeExpand = event.target.closest("[data-tree-expand]");
      if (treeExpand) {
        var treeBranch = treeExpand.closest(".source-tree-branch");
        var treeExpanded = !treeBranch.classList.contains("is-expanded");
        setTreeBranchExpanded(treeBranch, treeExpanded);
      }

      var treeChoice = event.target.closest("[data-tree-choice]");
      if (treeChoice) {
        var treeChoiceRoot = treeChoice.closest("[data-tree-select]");
        var treeChoiceMultiple = treeChoiceRoot.dataset.multiple === "true";
        var treeChoiceSelected = treeChoice.getAttribute("aria-selected") !== "true";
        if (!treeChoiceMultiple) treeChoiceRoot.querySelectorAll("[data-tree-choice]").forEach(function (choice) { choice.setAttribute("aria-selected", String(choice === treeChoice)); var oldCheck = choice.querySelector(":scope > .b2b-icon"); if (oldCheck) oldCheck.remove(); });
        else treeChoice.setAttribute("aria-selected", String(treeChoiceSelected));
        if ((treeChoiceMultiple ? treeChoiceSelected : true) && !treeChoice.querySelector(":scope > .b2b-icon")) treeChoice.insertAdjacentHTML("beforeend", '<span class="b2b-icon" aria-hidden="true">check</span>');
        if (!treeChoiceSelected && treeChoiceMultiple) { var treeChoiceCheck = treeChoice.querySelector(":scope > .b2b-icon"); if (treeChoiceCheck) treeChoiceCheck.remove(); }
        if (treeChoiceSelected) setTreeBranchExpanded(treeChoice.closest(".source-tree-branch"), true);
        renderTreeSelection(treeChoiceRoot);
        if (!treeChoiceMultiple) setTreeSelectOpen(treeChoiceRoot, false, true, true);
      }

      var sentimentButton = event.target.closest("[data-sentiment-value]");
      if (sentimentButton) {
        var sentimentRoot = sentimentButton.closest("[data-sentiment]");
        var sentimentWasSelected = sentimentButton.getAttribute("aria-pressed") === "true";
        sentimentRoot.querySelectorAll("[data-sentiment-value]").forEach(function (button) {
          var selected = button === sentimentButton && !sentimentWasSelected;
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
      }

      var sourceSelectTrigger = event.target.closest("[data-select-trigger]:not(:disabled)");
      if (sourceSelectTrigger && !event.target.closest("[data-select-remove]")) {
        var sourceSelectRoot = sourceSelectTrigger.closest("[data-select-demo]");
        setSourceSelectOpen(sourceSelectRoot, !sourceSelectRoot.classList.contains("is-open"), false);
      }

      var sourceSelectOption = event.target.closest("[data-select-option]:not(:disabled)");
      if (sourceSelectOption) chooseSourceSelectOption(sourceSelectOption);

      var sourceSelectSearchClear = event.target.closest("[data-select-search-clear]");
      if (sourceSelectSearchClear) {
        event.preventDefault();
        event.stopPropagation();
        var sourceSelectSearchClearRoot = sourceSelectSearchClear.closest("[data-select-demo]");
        if (sourceSelectIsLocked(sourceSelectSearchClearRoot)) return;
        var sourceSelectSearchClearInput = sourceSelectSearchClearRoot.querySelector("[data-select-search]");
        if (sourceSelectSearchClearInput) {
          sourceSelectSearchClearInput.value = "";
          sourceSelectSearchClearInput.dispatchEvent(new Event("input", { bubbles: true }));
          sourceSelectSearchClearInput.focus();
        }
        return;
      }

      var sourceSelectClear = event.target.closest("[data-select-clear]");
      if (sourceSelectClear) {
        var sourceSelectClearRoot = sourceSelectClear.closest("[data-select-demo]");
        if (sourceSelectIsLocked(sourceSelectClearRoot)) return;
        sourceSelectClearRoot.querySelectorAll("[data-select-option]").forEach(function (option) {
          option.classList.remove("is-selected", "is-active");
          option.setAttribute("aria-selected", "false");
          option.hidden = false;
          var check = option.querySelector(":scope > .b2b-icon");
          if (check) check.remove();
        });
        var sourceSelectClearSearch = sourceSelectClearRoot.querySelector("[data-select-search]");
        if (sourceSelectClearSearch) sourceSelectClearSearch.value = "";
        sourceSelectClearRoot.querySelectorAll(".source-select-feedback.is-runtime").forEach(function (feedback) { feedback.remove(); });
        renderSourceSelectValue(sourceSelectClearRoot);
        setSourceSelectOpen(sourceSelectClearRoot, false, false);
        sourceSelectClearRoot.querySelector("[data-select-trigger]").focus();
      }

      var sourceSelectRemove = event.target.closest("[data-select-remove]");
      if (sourceSelectRemove) {
        event.preventDefault();
        event.stopPropagation();
        var sourceSelectRemoveRoot = sourceSelectRemove.closest("[data-select-demo]");
        if (sourceSelectIsLocked(sourceSelectRemoveRoot)) return;
        markSourceSelectAsCurrent(sourceSelectRemoveRoot);
        var sourceSelectRemoveTag = sourceSelectRemove.closest("[data-select-tag]");
        var sourceSelectRemoveValue = sourceSelectRemoveTag && sourceSelectRemoveTag.dataset.value;
        var sourceSelectRemoveOption = Array.from(sourceSelectRemoveRoot.querySelectorAll("[data-select-option]")).find(function (option) { return option.dataset.value === sourceSelectRemoveValue; });
        if (sourceSelectRemoveOption) {
          sourceSelectRemoveOption.setAttribute("aria-selected", "false");
          sourceSelectRemoveOption.classList.remove("is-selected");
          var sourceSelectRemoveCheck = sourceSelectRemoveOption.querySelector(":scope > .b2b-icon");
          if (sourceSelectRemoveCheck) sourceSelectRemoveCheck.remove();
        }
        renderSourceSelectValue(sourceSelectRemoveRoot);
      }

      var sourceSelectCreate = event.target.closest("[data-select-create]");
      if (sourceSelectCreate) {
        var sourceSelectCreateRoot = sourceSelectCreate.closest("[data-select-demo]");
        if (sourceSelectIsLocked(sourceSelectCreateRoot)) return;
        var sourceSelectCreateInput = sourceSelectCreateRoot.querySelector("[data-select-search]");
        var sourceSelectCreateValue = (sourceSelectCreateInput && sourceSelectCreateInput.value.trim()) || "New option";
        var sourceSelectCreateOptions = sourceSelectCreateRoot.querySelector("[data-select-options]");
        var sourceSelectNewOption = document.createElement("button");
        sourceSelectNewOption.type = "button";
        sourceSelectNewOption.className = "source-select-option";
        sourceSelectNewOption.setAttribute("role", "option");
        sourceSelectNewOption.setAttribute("aria-selected", "false");
        sourceSelectNewOption.setAttribute("data-select-option", "");
        sourceSelectNewOption.dataset.value = sourceSelectCreateValue;
        sourceSelectNewOption.innerHTML = '<span class="select-option-content"><span class="select-option-copy"><span>' + sourceSelectCreateValue + "</span></span></span>";
        sourceSelectCreateOptions.appendChild(sourceSelectNewOption);
        chooseSourceSelectOption(sourceSelectNewOption);
      }

      var switchControl = event.target.closest(".b2b-switch");
      if (switchControl) {
        var switchChecked = switchControl.getAttribute("aria-checked") !== "true";
        switchControl.setAttribute("aria-checked", String(switchChecked));
        var switchDependent = switchControl.closest("[data-switch-dependent]");
        var switchDependentPanel = switchDependent && switchDependent.querySelector("[data-switch-dependent-panel]");
        if (switchDependentPanel) switchDependentPanel.hidden = !switchChecked;
      }

      var checkboxInput = event.target.closest('input[data-checkbox-item]');
      if (checkboxInput) syncCheckboxGroup(checkboxInput.closest("[data-checkbox-group]"), checkboxInput);

      var checkboxPickerRemove = event.target.closest("[data-checkbox-picker-remove]");
      if (checkboxPickerRemove) {
        var checkboxPickerRemoveRoot = checkboxPickerRemove.closest("[data-checkbox-picker]");
        var checkboxPickerRemoveInput = checkboxPickerRemoveRoot.querySelector('[data-checkbox-picker-value="' + checkboxPickerRemove.dataset.checkboxPickerRemove + '"]');
        if (checkboxPickerRemoveInput) checkboxPickerRemoveInput.checked = false;
        renderCheckboxPicker(checkboxPickerRemoveRoot);
      }

      var checkboxPickerClear = event.target.closest("[data-checkbox-picker-clear]");
      if (checkboxPickerClear) {
        var checkboxPickerClearRoot = checkboxPickerClear.closest("[data-checkbox-picker]");
        checkboxPickerClearRoot.querySelectorAll("[data-checkbox-picker-value]").forEach(function (input) { input.checked = false; });
        renderCheckboxPicker(checkboxPickerClearRoot);
      }

      var accordion = event.target.closest("[data-accordion-trigger]");
      if (accordion) {
        var panel = accordion.parentElement.querySelector(".b2b-accordion-panel, .source-accordion-panel");
        var expanded = accordion.getAttribute("aria-expanded") === "true";
        var singleStack = accordion.closest("[data-accordion-single]");
        if (singleStack && !expanded) singleStack.querySelectorAll("[data-accordion-trigger]").forEach(function (trigger) {
          trigger.setAttribute("aria-expanded", "false");
          var otherPanel = trigger.parentElement.querySelector(".b2b-accordion-panel, .source-accordion-panel");
          if (otherPanel) otherPanel.hidden = true;
        });
        accordion.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
        var accordionIcon = accordion.querySelector(".b2b-icon:not(.button-spinner)");
        if (accordionIcon) accordionIcon.textContent = accordionIcon.textContent.trim().indexOf("arrow_") === 0 ? (expanded ? "arrow_right" : "arrow_drop_down") : (expanded ? "expand_more" : "expand_less");
      }

      var textCollapse = event.target.closest("[data-text-collapse-trigger]");
      if (textCollapse) {
        var textCollapseRoot = textCollapse.closest("[data-text-collapse]");
        var textExpanded = textCollapseRoot.classList.toggle("is-expanded");
        textCollapse.innerHTML = (textExpanded ? "收起 " : "展开 ") + '<span class="b2b-icon" aria-hidden="true">' + (textExpanded ? "expand_less" : "expand_more") + "</span>";
      }

      var menuButton = event.target.closest("[data-mobile-menu]");
      if (menuButton) document.querySelector(".app-shell").classList.toggle("is-menu-open");

      var sourceFloatingItem = event.target.closest("[data-source-floating] [data-floating-index]:not(:disabled)");
      if (sourceFloatingItem) {
        var sourceFloatingMenu = sourceFloatingItem.closest("[data-source-floating]");
        sourceFloatingMenu.dispatchEvent(new CustomEvent("b2b:source-floating-select", {
          bubbles: true,
          detail: { index: Number(sourceFloatingItem.dataset.floatingIndex) }
        }));
        setSourceFloatingOpen(sourceFloatingMenu, false, true, "select");
        return;
      }

      var floatingToggle = event.target.closest("[data-floating-toggle]");
      if (floatingToggle && floatingToggle.closest("[data-source-floating]")) {
        var sourceFloatingRoot = floatingToggle.closest("[data-source-floating]");
        setSourceFloatingOpen(sourceFloatingRoot, floatingToggle.getAttribute("aria-expanded") !== "true", false, "trigger");
        return;
      }
      if (floatingToggle && !isDirectRendererNode(floatingToggle)) {
        var floatingMenu = floatingToggle.closest("[data-floating-menu]");
        var floatingOpen = floatingToggle.getAttribute("aria-expanded") !== "true";
        floatingToggle.setAttribute("aria-expanded", String(floatingOpen));
        if (floatingMenu) floatingMenu.classList.toggle("is-expanded", floatingOpen);
      }

      var sourceFloatingAction = event.target.closest("button[data-source-floating]:not(:disabled), [data-source-floating] > button:not(:disabled), [data-source-floating] > .floating-tooltip-anchor > button:not(:disabled)");
      if (sourceFloatingAction && !sourceFloatingAction.hasAttribute("data-floating-toggle")) {
        sourceFloatingAction.closest("[data-source-floating]").dispatchEvent(new CustomEvent("b2b:source-floating-activate", { bubbles: true }));
      }

      var popupTrigger = event.target.closest("[data-popup-trigger]");
      var popupRoot = popupTrigger && popupTrigger.closest("[data-popup-root]");
      if (popupRoot && usesSharedPopupInteraction(popupRoot)) {
        event.preventDefault();
        var nextOpen = !popupRoot.classList.contains("is-open");
        closeOtherPopups(popupRoot);
        setPopupState(popupRoot, nextOpen, false);
      }

      var cascaderClear = event.target.closest("[data-cascade-clear]");
      if (cascaderClear) {
        event.preventDefault();
        event.stopPropagation();
        var cascaderClearDemo = cascaderClear.closest("[data-cascader-demo]");
        clearCascader(cascaderClearDemo);
        emitCascaderChange(cascaderClearDemo, "clear");
        return;
      }

      var cascaderRemove = event.target.closest("[data-cascade-remove]");
      if (cascaderRemove) {
        event.preventDefault();
        event.stopPropagation();
        var cascaderRemoveDemo = cascaderRemove.closest("[data-cascader-demo]");
        var cascaderRemoveTag = cascaderRemove.closest("[data-cascade-tag]");
        var cascaderRemoveValue = cascaderRemoveTag && cascaderRemoveTag.dataset.cascadeTagValue;
        var cascaderRemoveOption = cascaderRemoveDemo && Array.from(cascaderRemoveDemo.querySelectorAll("[data-cascade-option][aria-checked]")).find(function (option) { return cascadePathForOption(option) === cascaderRemoveValue; });
        if (cascaderRemoveOption) setCascadeCheckVisual(cascaderRemoveOption, "false");
        if (cascaderRemoveOption) updateCascadeAncestors(cascaderRemoveOption);
        var cascaderRemoveLabel = cascaderRemoveDemo && cascaderRemoveDemo.querySelector("[data-cascade-label]");
        var cascaderRemainingValues = cascaderCommittedValues(cascaderRemoveDemo).filter(function (value) { return value !== cascaderRemoveValue; });
        if (cascaderRemoveLabel) renderCascaderTags(cascaderRemoveLabel, cascaderRemainingValues);
        if (cascaderRemoveDemo) {
          cascaderRemoveDemo.classList.toggle("has-value", cascaderRemainingValues.length > 0);
          cascaderRemoveDemo.classList.toggle("has-selection", cascaderRemainingValues.length > 0);
          var cascaderRemoveTrigger = cascaderRemoveDemo.querySelector("[data-cascader-trigger]");
          if (cascaderRemoveTrigger) {
            cascaderRemoveTrigger.classList.toggle("has-value", cascaderRemainingValues.length > 0);
            cascaderRemoveTrigger.classList.toggle("has-selection", cascaderRemainingValues.length > 0);
          }
        }
        emitCascaderChange(cascaderRemoveDemo, "remove");
        return;
      }

      var cascaderTrigger = event.target.closest("[data-cascader-trigger]");
      if (cascaderTrigger) {
        var cascaderDemo = cascaderTrigger.closest("[data-cascader-demo]");
        var cascaderOpen = event.target.matches("[data-cascade-search], [data-cascade-search-icon]") ? true : !cascaderDemo.classList.contains("is-open");
        setCascaderOpen(cascaderDemo, cascaderOpen);
      }

      var cascadeOption = event.target.closest("[data-cascade-option]:not(:disabled)");
      if (cascadeOption) {
        var cascadeColumn = cascadeOption.closest(".cascade-column");
        var cascadeDemoRoot = cascadeOption.closest("[data-cascader-demo]");
        var checkableCascade = cascadeOption.hasAttribute("aria-checked");
        if (checkableCascade) {
          var cascadeChecked = cascadeOption.getAttribute("aria-checked") !== "true";
          cascadeOption.setAttribute("aria-selected", String(cascadeChecked));
          setCascadeCheckVisual(cascadeOption, String(cascadeChecked));
          if (cascadeOption.dataset.cascadeChild === "true") activateCascadeBranch(cascadeOption);
          updateCascadeAncestors(cascadeOption);
        } else if (cascadeColumn) {
          var cascadeHasChildren = cascadeOption.dataset.cascadeChild === "true";
          var cascadeSelectAny = cascadeDemoRoot && cascadeDemoRoot.dataset.cascadeSelectAny === "true";
          cascadeColumn.querySelectorAll(":scope > [data-cascade-option]").forEach(function (item) {
            var cascadeSelected = item === cascadeOption;
            item.classList.toggle("is-active-path", cascadeSelected && cascadeHasChildren);
            setCascadeLeafSelected(item, cascadeSelected && (!cascadeHasChildren || cascadeSelectAny));
            if (cascadeSelectAny && cascadeSelected && cascadeHasChildren) item.classList.add("is-selected");
            else if (cascadeHasChildren) item.classList.remove("is-selected");
            item.setAttribute("aria-selected", String(cascadeSelected));
          });
          if (cascadeHasChildren && cascadeDemoRoot) {
            activateCascadeBranch(cascadeOption);
          }
        }
        if (cascadeDemoRoot) {
          var cascaderCommitted = checkableCascade || !cascadeHasChildren || cascadeDemoRoot.dataset.cascadeSelectAny === "true";
          if (cascaderCommitted) {
            syncCascaderTrigger(cascadeDemoRoot);
            emitCascaderChange(cascadeDemoRoot, "select");
          }
          if (!checkableCascade && cascadeOption.dataset.cascadeChild === "false") setCascaderOpen(cascadeDemoRoot, false);
        }
      }

      var tabButton = event.target.closest(".b2b-tab");
      if (tabButton) {
        tabButton.parentElement.querySelectorAll(".b2b-tab").forEach(function (item) {
          var active = item === tabButton;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
          item.setAttribute("tabindex", active ? "0" : "-1");
        });
      }

      var menuItem = event.target.closest(".demo-menu-item");
      if (menuItem && !menuItem.disabled && menuItem.getAttribute("aria-disabled") !== "true" && usesSharedPopupInteraction(menuItem)) {
        if (menuItem.hasAttribute("data-submenu-owner") && c08CascadeRoot(menuItem)) {
          syncC08SubmenuState(menuItem, true, "pointer", true);
          return;
        }
        selectDemoMenuItem(menuItem);
        var owningPopup = menuItem.closest("[data-popup-root]");
        if (owningPopup) {
          setPopupState(owningPopup, false, false);
          var owningTrigger = owningPopup.querySelector("[data-popup-trigger]");
          if (owningTrigger) owningTrigger.focus();
        }
        var owningContextMenu = menuItem.closest("[data-context-menu-stage]");
        if (owningContextMenu) setC08ContextMenuState(owningContextMenu, false, true);
      }

      var pageButton = event.target.closest(".page-button[data-page]");
      if (pageButton) {
        pageButton.parentElement.querySelectorAll(".page-button[data-page]").forEach(function (item) {
          item.classList.toggle("is-active", item === pageButton);
          if (item === pageButton) item.setAttribute("aria-current", "page");
          else item.removeAttribute("aria-current");
        });
        setPaginationPage(pageButton.closest("[data-pagination]"), pageButton.dataset.page);
      }

      var pageNavigation = event.target.closest("[data-page-nav]:not(:disabled)");
      if (pageNavigation) {
        var pageNavigationRoot = pageNavigation.closest("[data-pagination]");
        var pageNavigationCurrent = Number(pageNavigationRoot.dataset.currentPage || 1);
        setPaginationPage(pageNavigationRoot, pageNavigationCurrent + (pageNavigation.dataset.pageNav === "next" ? 1 : -1));
      }

      var pageJump = event.target.closest("[data-page-jump]");
      if (pageJump) {
        var pageJumpRoot = pageJump.closest("[data-pagination]");
        setPaginationPage(pageJumpRoot, Number(pageJumpRoot.dataset.currentPage || 1) + Number(pageJump.dataset.pageJump || 0));
      }

      var scrollbarTrack = event.target.closest("[data-scrollbar-track]");
      if (scrollbarTrack && !event.target.closest("[data-scrollbar-thumb]")) {
        var scrollbarTrackRoot = scrollbarTrack.closest("[data-scrollbar-spec]");
        var scrollbarViewport = scrollbarTrackRoot.querySelector("[data-scrollbar-viewport]");
        var scrollbarHorizontal = scrollbarTrack.dataset.axis === "horizontal";
        var scrollbarTrackRect = scrollbarTrack.getBoundingClientRect();
        var scrollbarRatio = scrollbarHorizontal ? (event.clientX - scrollbarTrackRect.left) / scrollbarTrackRect.width : (event.clientY - scrollbarTrackRect.top) / scrollbarTrackRect.height;
        if (scrollbarHorizontal) scrollbarViewport.scrollLeft = (scrollbarViewport.scrollWidth - scrollbarViewport.clientWidth) * scrollbarRatio;
        else scrollbarViewport.scrollTop = (scrollbarViewport.scrollHeight - scrollbarViewport.clientHeight) * scrollbarRatio;
      }

      var dialogOpen = event.target.closest("[data-demo-dialog-open]");
      if (dialogOpen) {
        var demoDialog = dialogOpen.parentElement.querySelector(".demo-native-dialog");
        if (demoDialog) {
          demoDialog.dataset.dialogAction = "";
          demoDialog.showModal();
          dialogOpen.setAttribute("aria-expanded", "true");
          document.body.classList.add("is-dialog-open");
          var openStatus = dialogOpen.parentElement.querySelector("[data-demo-dialog-status]");
          if (openStatus) openStatus.textContent = "对话框已打开";
        }
      }
      var dialogClose = event.target.closest("[data-demo-dialog-close]");
      if (dialogClose) closeDemoDialog(dialogClose.closest("dialog"), dialogClose.dataset.dialogAction || "close");
      var dialogBackdrop = event.target.matches && event.target.matches("dialog[data-demo-dialog]");
      if (dialogBackdrop) closeDemoDialog(event.target, "backdrop");

      var sourceDialogAction = event.target.closest("[data-source-dialog-action]");
      if (sourceDialogAction && !sourceDialogAction.closest("dialog[data-demo-dialog]")) {
        var sourceDialog = sourceDialogAction.closest(".source-dialog");
        var sourceDialogStatus = sourceDialog && sourceDialog.querySelector("[data-source-dialog-status]");
        if (sourceDialogStatus) sourceDialogStatus.textContent = dialogActionMessage(sourceDialogAction.dataset.sourceDialogAction);
      }

      var drawerTrigger = event.target.closest("[data-demo-drawer-toggle]");
      if (drawerTrigger) {
        var drawerStage = drawerTrigger.parentElement;
        var drawer = drawerStage.querySelector(".demo-drawer");
        var open = !drawer.classList.contains("is-open");
        drawer.classList.toggle("is-open", open);
        drawer.setAttribute("aria-hidden", String(!open));
        drawerTrigger.setAttribute("aria-expanded", String(open));
      }

      var loadingDelayTrigger = event.target.closest("[data-loading-delay]");
      if (loadingDelayTrigger) {
        var loadingDelayResult = loadingDelayTrigger.parentElement.querySelector("[data-loading-delay-result]");
        loadingDelayTrigger.disabled = true;
        loadingDelayTrigger.textContent = "等待 1000ms…";
        window.setTimeout(function () {
          if (loadingDelayResult) loadingDelayResult.hidden = false;
          loadingDelayTrigger.textContent = "加载状态已显示";
        }, 1000);
      }

      var feedbackTrigger = event.target.closest("[data-demo-feedback]");
      if (feedbackTrigger) {
        var feedback = feedbackTrigger.parentElement.querySelector("[data-feedback-message]");
        if (feedback) {
          feedback.hidden = false;
          feedback.setAttribute("role", "status");
        }
      }

      var notificationLaunch = event.target.closest("[data-notification-launch]");
      if (notificationLaunch) {
        var notificationHost = notificationLaunch.parentElement.querySelector("[data-notification-host]");
        if (notificationHost) {
          notificationHost.innerHTML = '<article class="notification-spec source-notification is-info" role="status"><span class="b2b-icon" aria-hidden="true">info</span><div><strong>Message</strong><p>This notification will close automatically after 4 seconds.</p></div><button class="notification-close" type="button" aria-label="关闭通知"><span class="b2b-icon" aria-hidden="true">close</span></button></article>';
          window.setTimeout(function () {
            var currentNotification = notificationHost.querySelector(".source-notification");
            if (currentNotification) currentNotification.classList.add("is-auto-leaving");
            window.setTimeout(function () { notificationHost.innerHTML = ""; }, 200);
          }, 4000);
        }
      }

      var notificationClose = event.target.closest(".source-notification .notification-close");
      if (notificationClose && !notificationClose.closest("[data-notification-bound]")) {
        var notification = notificationClose.closest(".source-notification");
        if (notification) {
          notification.classList.add("is-closing");
          window.setTimeout(function () { if (notification.isConnected) notification.remove(); }, 200);
        }
      }

      var toastLaunch = event.target.closest("[data-toast-launch]");
      if (toastLaunch) {
        var toastHost = toastLaunch.parentElement.querySelector("[data-toast-host]");
        if (toastHost) {
          toastHost.innerHTML = '<div class="toast-spec source-toast is-success" role="status"><span class="b2b-icon" aria-hidden="true">check_circle</span><span>Hover pauses the 4-second timer</span><button class="b2b-button is-text" type="button">Undo</button><button type="button" aria-label="关闭"><span class="b2b-icon" aria-hidden="true">close</span></button></div>';
          var autoToast = toastHost.querySelector(".source-toast");
          var dismissAutoToast = function () {
            autoToast.classList.add("is-leaving");
            window.setTimeout(function () { if (autoToast.isConnected) autoToast.remove(); }, 200);
          };
          autoToast._dismissTimer = window.setTimeout(dismissAutoToast, 4000);
          autoToast.addEventListener("mouseenter", function () { window.clearTimeout(autoToast._dismissTimer); });
          autoToast.addEventListener("mouseleave", function () { autoToast._dismissTimer = window.setTimeout(dismissAutoToast, 4000); });
        }
      }

      var progressStart = event.target.closest("[data-progress-start]");
      if (progressStart) {
        var progressDemo = progressStart.parentElement;
        var progressLive = progressDemo.querySelector("[data-progress-live]");
        var progressValue = 0;
        window.clearInterval(progressDemo._progressTimer);
        progressStart.disabled = true;
        progressStart.textContent = "上传中…";
        progressDemo._progressTimer = window.setInterval(function () {
          progressValue = Math.min(100, progressValue + 5);
          var progressBar = progressLive.querySelector(".source-progress-line");
          var progressIndicator = progressBar.querySelector("i");
          var progressLabel = progressBar.querySelector("span");
          progressIndicator.style.setProperty("--progress-value", progressValue + "%");
          progressBar.setAttribute("aria-valuenow", String(progressValue));
          if (progressLabel) progressLabel.textContent = progressValue + "%";
          if (progressValue >= 100) {
            window.clearInterval(progressDemo._progressTimer);
            progressBar.classList.add("is-success");
            progressStart.disabled = false;
            progressStart.textContent = "重新开始";
          }
        }, 120);
      }

      var iconSample = event.target.closest("[data-icon-sample]");
      if (iconSample) {
        var glyph = iconSample.querySelector(".b2b-icon");
        var filled = !glyph.classList.contains("is-filled");
        glyph.classList.toggle("is-filled", filled);
        iconSample.setAttribute("aria-pressed", String(filled));
      }

      var ratingButton = event.target.closest(".rating button");
      if (ratingButton) {
        var buttons = Array.from(ratingButton.parentElement.querySelectorAll("button"));
        var ratingIndex = buttons.indexOf(ratingButton);
        buttons.forEach(function (item, index) {
          var selected = index <= ratingIndex;
          item.classList.toggle("is-selected", selected);
          var ratingIcon = item.querySelector(".b2b-icon");
          if (ratingIcon) ratingIcon.classList.toggle("is-filled", selected);
        });
        ratingButton.parentElement.setAttribute("aria-valuenow", String(ratingIndex + 1));
      }

      var toggleButton = event.target.closest("[data-toggle-button]:not(:disabled)");
      if (toggleButton) {
        var selectedToggle = toggleButton.getAttribute("aria-pressed") !== "true";
        toggleButton.setAttribute("aria-pressed", String(selectedToggle));
        toggleButton.classList.toggle("is-selected", selectedToggle);
        toggleButton.classList.toggle("is-state-selected", selectedToggle);
        if (!selectedToggle) toggleButton.classList.remove("is-state-selected-hover", "is-state-selected-active");
      }

      var specialToggle = event.target.closest("[data-special-toggle]:not(:disabled)");
      if (specialToggle) {
        var specialSelected = specialToggle.getAttribute("aria-pressed") !== "true";
        specialToggle.setAttribute("aria-pressed", String(specialSelected));
        specialToggle.classList.toggle("is-selected", specialSelected);
        var specialLabel = specialToggle.querySelector("[data-special-label]");
        var nextLabel = specialSelected ? specialToggle.dataset.selectedLabel : specialToggle.dataset.unselectedLabel;
        var specialIcon = specialToggle.querySelector(".special-state-icon");
        var nextIcon = specialSelected ? specialToggle.dataset.selectedIcon : specialToggle.dataset.unselectedIcon;
        if (specialLabel) specialLabel.textContent = nextLabel;
        if (specialIcon && nextIcon) specialIcon.textContent = nextIcon;
        if (!specialLabel && nextLabel) specialToggle.setAttribute("aria-label", nextLabel);
      }

      var keyboardDemo = event.target.closest("[data-keyboard-demo]");
      if (keyboardDemo) {
        var keyboardStatus = keyboardDemo.parentElement.querySelector("[data-keyboard-status]");
        if (keyboardStatus) keyboardStatus.textContent = event.detail === 0 ? "已通过键盘激活" : "已通过点击激活";
      }

      var resetButton = event.target.closest("[data-reset-component]");
      if (resetButton && D.componentSpecimens) {
        var resetCard = resetButton.closest("[data-component-card]");
        var resetComponent = D.components.find(function (item) { return item.id === resetButton.dataset.resetComponent; });
        var resetPreview = resetCard && resetCard.querySelector(".component-preview");
        if (resetPreview && resetComponent) {
          resetPreview.innerHTML = D.componentSpecimens.render(resetComponent, false);
          interactionRoot.dispatchEvent(new CustomEvent("b2b:specimens-rendered", { detail: { root: resetPreview } }));
          resetPreview.classList.add("is-resetting");
          window.setTimeout(function () { resetPreview.classList.remove("is-resetting"); }, 260);
        }
      }

      var pressedButton = event.target.closest(".specimen-stage button:not(:disabled)");
      if (pressedButton) {
        pressedButton.classList.remove("is-clicked");
        void pressedButton.offsetWidth;
        pressedButton.classList.add("is-clicked");
        window.setTimeout(function () { pressedButton.classList.remove("is-clicked"); }, 260);
      }

      var navItem = event.target.closest(".source-nav button");
      if (navItem) {
        navItem.closest(".source-nav").querySelectorAll("button").forEach(function (item) {
          item.classList.toggle("is-active", item === navItem);
        });
      }

      var topNavTab = event.target.closest(".top-navigation-tabs > .top-nav-tab");
      if (topNavTab) {
        var owningTopTabList = topNavTab.closest(".top-navigation-tabs");
        owningTopTabList.querySelectorAll(":scope > .top-nav-tab, :scope > .top-nav-more > .top-nav-tab").forEach(function (item) {
          var selected = item === topNavTab;
          item.classList.toggle("is-active", selected);
          if (item.getAttribute("role") === "tab") {
            item.setAttribute("aria-selected", String(selected));
            item.setAttribute("tabindex", selected ? "0" : "-1");
          }
        });
        syncTopNavIndicator(owningTopTabList, false);
      }

      var topNavMoreButton = event.target.closest("[data-top-nav-more] > .top-nav-tab");
      if (topNavMoreButton) {
        var topNavMore = topNavMoreButton.closest("[data-top-nav-more]");
        var topNavOpen = topNavMoreButton.getAttribute("aria-expanded") !== "true";
        if (topNavOpen) {
          interactionRoot.querySelectorAll("[data-top-nav-more]").forEach(function (more) {
            if (more !== topNavMore) setTopNavMenuOpen(more, false, false);
          });
        }
        setTopNavMenuOpen(topNavMore, topNavOpen, false);
      }

      var topNavMenuItem = event.target.closest(".top-nav-menu [role='menuitem']");
      if (topNavMenuItem) {
        var owningTopMore = topNavMenuItem.closest("[data-top-nav-more]");
        owningTopMore.querySelectorAll("[role='menuitem']").forEach(function (item) { item.classList.toggle("is-selected", item === topNavMenuItem); });
        var owningTopButton = owningTopMore.querySelector(":scope > .top-nav-tab");
        var owningTopTabList = owningTopMore.closest(".top-navigation-tabs");
        owningTopTabList.querySelectorAll(":scope > .top-nav-tab").forEach(function (item) {
          item.classList.remove("is-active");
          item.setAttribute("aria-selected", "false");
          item.setAttribute("tabindex", "-1");
        });
        owningTopButton.classList.add("is-active");
        setTopNavMenuOpen(owningTopMore, false, false);
        syncTopNavIndicator(owningTopTabList, false);
        owningTopButton.focus();
      }

      var sideNavFlyoutHandled = false;
      var sideNavExpand = event.target.closest("[data-side-nav-expand]");
      if (sideNavExpand) {
        var sideNavNode = sideNavExpand.closest(".side-nav-node");
        var collapsedRailNav = sideNavNode && sideNavRailNode(sideNavExpand) && sideNavNode.closest("[data-side-web-nav].is-collapsed");
        if (collapsedRailNav) {
          var collapsedFlyout = collapsedRailNav.querySelector("[data-side-nav-flyout]");
          var samePinnedSource = collapsedRailNav.dataset.flyoutPinned === "true" && collapsedFlyout && collapsedFlyout.dataset.sourceKey === sideNavExpand.dataset.navKey;
          if (samePinnedSource) hideSideNavFlyout(collapsedRailNav, true);
          else showSideNavFlyout(collapsedRailNav, sideNavNode, true, false);
          sideNavFlyoutHandled = true;
        } else {
          var sideNavChildren = sideNavNode && sideNavNode.querySelector(":scope > .side-nav-children");
          var sideNavExpanded = sideNavExpand.getAttribute("aria-expanded") !== "true";
          sideNavExpand.setAttribute("aria-expanded", String(sideNavExpanded));
          if (sideNavNode) sideNavNode.classList.toggle("is-expanded", sideNavExpanded);
          if (sideNavChildren) sideNavChildren.hidden = !sideNavExpanded;
          var sideNavArrowIcon = sideNavExpand.querySelector(".side-nav-arrow");
          if (sideNavArrowIcon) sideNavArrowIcon.textContent = sideNavExpanded ? "expand_less" : "expand_more";
          var treeArrow = sideNavExpand.querySelector(":scope > .side-nav-tree-toggle:not(.is-placeholder)");
          if (treeArrow && ["arrow_right", "arrow_drop_down"].indexOf(treeArrow.textContent.trim()) >= 0) treeArrow.textContent = sideNavExpanded ? "arrow_drop_down" : "arrow_right";
          var sideNavScrollbar = sideNavExpand.closest("[data-scrollbar-spec]");
          if (sideNavScrollbar && sideNavScrollbar._b2bUpdateThumbs) window.requestAnimationFrame(sideNavScrollbar._b2bUpdateThumbs);
        }
      }

      var sideCollapse = event.target.closest("[data-side-nav-collapse]");
      if (sideCollapse) {
        var sideWebNav = sideCollapse.closest("[data-side-web-nav]");
        var sideWebExpanded = sideCollapse.getAttribute("aria-expanded") !== "true";
        setSideWebNavigationExpanded(sideWebNav, sideWebExpanded);
      }

      var sideNavItem = event.target.closest(".side-nav-item:not(:disabled)");
      if (sideNavItem) {
        var owningNavigation = sideNavItem.closest(".side-web-navigation, .side-desktop-navigation");
        if (owningNavigation) {
          setSideNavigationSelection(owningNavigation, sideNavItem);
          if (owningNavigation.classList.contains("is-collapsed")) {
            if (sideNavItem.closest(".side-nav-flyout")) {
              if (!sideNavItem.hasAttribute("data-side-nav-expand")) hideSideNavFlyout(owningNavigation, true);
            } else {
              var railNode = sideNavRailNode(sideNavItem);
              if (railNode && railNode.querySelector(":scope > .side-nav-children")) {
                if (!sideNavFlyoutHandled) showSideNavFlyout(owningNavigation, railNode, true, false);
              } else {
                hideSideNavFlyout(owningNavigation, true);
              }
            }
          }
        }
      }

      var breadcrumbMoreButton = event.target.closest("[data-breadcrumb-more] > button");
      if (breadcrumbMoreButton) {
        var breadcrumbMore = breadcrumbMoreButton.closest("[data-breadcrumb-more]");
        var breadcrumbOpen = breadcrumbMoreButton.getAttribute("aria-expanded") !== "true";
        if (!breadcrumbOpen && breadcrumbMore._b2bBreadcrumbOpenReason === "hover") {
          setBreadcrumbMoreOpen(breadcrumbMore, true, false, "pointer");
        } else {
          setBreadcrumbMoreOpen(breadcrumbMore, breadcrumbOpen, false, "pointer");
        }
      }

      var breadcrumbHistoryItem = event.target.closest(".breadcrumb-history [role='menuitem']");
      if (breadcrumbHistoryItem) {
        var breadcrumbHistoryRoot = breadcrumbHistoryItem.closest("[data-breadcrumb-more]");
        var breadcrumbHistoryLabel = breadcrumbHistoryItem.dataset.breadcrumbHistoryLabel || breadcrumbHistoryItem.textContent.trim();
        setBreadcrumbMoreOpen(breadcrumbHistoryRoot, false, false);
        navigateBreadcrumb(breadcrumbHistoryItem, breadcrumbHistoryLabel);
      }

      var breadcrumbLink = event.target.closest("[data-breadcrumb] .breadcrumb-link[data-breadcrumb-label]");
      if (breadcrumbLink && !breadcrumbHistoryItem) {
        navigateBreadcrumb(breadcrumbLink);
      }

      var stepItem = event.target.closest("[data-steps-spec] [data-step-index]");
      if (stepItem) activateStep(stepItem);

      var anchorItem = event.target.closest(".anchor-list a");
      if (anchorItem) {
        anchorItem.parentElement.querySelectorAll("a").forEach(function (item) {
          item.classList.toggle("is-active", item === anchorItem);
        });
      }

      var anchorSpecItem = event.target.closest(".anchor-spec [data-anchor-target]:not(:disabled)");
      if (anchorSpecItem) setAnchorSelection(anchorSpecItem, true);

      var dateClear = event.target.closest("[data-date-clear]");
      if (dateClear) {
        event.stopPropagation();
        clearDatePicker(dateClear.closest("[data-date-picker]"));
      }

      var dateTrigger = !dateClear && event.target.closest("[data-date-trigger]:not(:disabled)");
      if (dateTrigger) {
        var dateTriggerRoot = dateTrigger.closest("[data-date-picker]");
        var dateNextOpen = dateTrigger.getAttribute("aria-expanded") !== "true";
        if (!dateNextOpen) restoreDatePickerState(dateTriggerRoot);
        closeOtherDatePickers(dateTriggerRoot);
        setDatePickerOpen(dateTriggerRoot, dateNextOpen, false);
      }

      var dateHeadingTrigger = event.target.closest("[data-date-heading-trigger]");
      if (dateHeadingTrigger) {
        var dateHeadingCalendar = dateHeadingTrigger.closest(".date-calendar");
        var dateHeadingOpen = dateHeadingTrigger.getAttribute("aria-expanded") !== "true";
        closeDateMonthMenus(dateHeadingCalendar);
        setDateMonthMenuOpen(dateHeadingCalendar, dateHeadingOpen);
      }

      var dateYearNavigation = event.target.closest("[data-date-year-prev], [data-date-year-next]");
      if (dateYearNavigation) {
        var dateYearCalendar = dateYearNavigation.closest(".date-calendar");
        var dateYearMenu = dateYearNavigation.closest("[data-date-month-menu]");
        var dateYearDelta = dateYearNavigation.matches("[data-date-year-prev]") ? -1 : 1;
        var dateMenuYear = Number(dateYearMenu.dataset.dateMenuYear) + dateYearDelta;
        updateDateMonthMenu(dateYearCalendar, dateMenuYear, Number(dateYearCalendar.dataset.dateMonth));
      }

      var dateMonthOption = event.target.closest("[data-date-month-option]");
      if (dateMonthOption) {
        var dateMonthRoot = dateMonthOption.closest("[data-date-picker]");
        var dateMonthPanel = dateMonthOption.closest(".date-picker-panel");
        var dateMonthCalendar = dateMonthOption.closest(".date-calendar");
        var dateMonthMenu = dateMonthOption.closest("[data-date-month-menu]");
        var dateMonthCalendars = Array.from(dateMonthPanel.querySelectorAll(".date-calendar"));
        var dateMonthCalendarIndex = dateMonthCalendars.indexOf(dateMonthCalendar);
        var selectedMonthDate = new Date(Number(dateMonthMenu.dataset.dateMenuYear), Number(dateMonthOption.dataset.dateMonthOption) - 1 - Math.max(0, dateMonthCalendarIndex), 1);
        captureDatePickerState(dateMonthRoot);
        dateMonthCalendars.forEach(function (calendar, index) {
          var calendarDate = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + index, 1);
          renderDateCalendar(calendar, calendarDate.getFullYear(), calendarDate.getMonth() + 1, dateMonthRoot);
        });
        setDateMonthMenuOpen(dateMonthCalendar, false);
        var selectedMonthTrigger = dateMonthCalendar.querySelector("[data-date-heading-trigger]");
        if (selectedMonthTrigger) selectedMonthTrigger.focus();
      }

      var dateNavigation = event.target.closest("[data-date-prev], [data-date-next]");
      if (dateNavigation) {
        var dateNavigationRoot = dateNavigation.closest("[data-date-picker]");
        var dateNavigationPanel = dateNavigation.closest(".date-picker-panel");
        var dateNavigationCalendar = dateNavigation.closest(".date-calendar");
        if (dateNavigationRoot && dateNavigationCalendar && !dateNavigationPanel.classList.contains("is-unit")) {
          captureDatePickerState(dateNavigationRoot);
          var dateNavigationDelta = dateNavigation.matches("[data-date-prev]") ? -1 : 1;
          var dateNavigationCalendars = Array.from(dateNavigationPanel.querySelectorAll(".date-calendar"));
          var dateNavigationBase = dateNavigationCalendars[0];
          var dateNavigationDate = new Date(Number(dateNavigationBase.dataset.dateYear), Number(dateNavigationBase.dataset.dateMonth) - 1 + dateNavigationDelta, 1);
          dateNavigationCalendars.forEach(function (calendar, index) {
            var calendarDate = new Date(dateNavigationDate.getFullYear(), dateNavigationDate.getMonth() + index, 1);
            renderDateCalendar(calendar, calendarDate.getFullYear(), calendarDate.getMonth() + 1, dateNavigationRoot);
          });
        }
      }

      var dateDay = event.target.closest("[data-date-day]:not(:disabled)");
      if (dateDay) {
        var dateDayRoot = dateDay.closest("[data-date-picker]");
        captureDatePickerState(dateDayRoot);
        var dateRange = dateDayRoot.dataset.dateRange === "true";
        var dayValue = Number(dateDay.dataset.dateDay);
        var daySerial = Number(dateDay.dataset.dateSerial || dayValue);
        var fullDayValue = dateDay.dataset.dateIso || String(dayValue);
        dateDayRoot.querySelectorAll("[data-date-shortcut]").forEach(function (shortcut) {
          shortcut.classList.remove("is-selected");
          shortcut.setAttribute("aria-pressed", "false");
        });
        if (!dateRange) {
          dateDayRoot.querySelectorAll("[data-date-day]").forEach(function (day) { day.classList.remove("is-selected"); day.setAttribute("tabindex", "-1"); });
          dateDay.classList.add("is-selected");
          dateDay.setAttribute("tabindex", "0");
          dateDayRoot.dataset.pendingValue = fullDayValue;
        } else if (!dateDayRoot.dataset.rangeStart) {
          dateDayRoot.querySelectorAll("[data-date-day]").forEach(function (day) { day.classList.remove("is-range-start", "is-range-end", "is-in-range", "is-range-row-start", "is-range-row-end"); });
          delete dateDayRoot.dataset.pendingValue;
          dateDayRoot.dataset.rangeStart = String(daySerial);
          dateDayRoot.dataset.rangeStartLabel = fullDayValue;
          dateDay.classList.add("is-range-start");
          syncDateRangeRowEdges(dateDayRoot);
          var incompleteRangeConfirm = dateDayRoot.querySelector("[data-date-confirm]");
          if (incompleteRangeConfirm) incompleteRangeConfirm.disabled = true;
        } else {
          var rangeStart = Number(dateDayRoot.dataset.rangeStart);
          var rangeLow = Math.min(rangeStart, daySerial);
          var rangeHigh = Math.max(rangeStart, daySerial);
          dateDayRoot.querySelectorAll("[data-date-day]").forEach(function (day) {
            var value = Number(day.dataset.dateSerial || day.dataset.dateDay);
            var eligible = !day.disabled;
            day.classList.toggle("is-range-start", eligible && value === rangeLow);
            day.classList.toggle("is-range-end", eligible && value === rangeHigh);
            day.classList.toggle("is-in-range", eligible && value > rangeLow && value < rangeHigh);
          });
          syncDateRangeRowEdges(dateDayRoot);
          var rangeStartLabel = dateDayRoot.dataset.rangeStartLabel;
          dateDayRoot.dataset.pendingValue = rangeStart <= daySerial ? rangeStartLabel + " — " + fullDayValue : fullDayValue + " — " + rangeStartLabel;
          delete dateDayRoot.dataset.rangeStart;
          delete dateDayRoot.dataset.rangeStartLabel;
          var completedRangeConfirm = dateDayRoot.querySelector("[data-date-confirm]");
          if (completedRangeConfirm) completedRangeConfirm.disabled = false;
        }
      }

      var dateConfirm = event.target.closest("[data-date-confirm]");
      if (dateConfirm) {
        var dateConfirmRoot = dateConfirm.closest("[data-date-picker]");
        var confirmedDateValue = dateConfirmRoot.dataset.pendingValue || dateConfirmRoot.dataset.dateValue;
        if (dateConfirmRoot.dataset.dateWithTime === "true" && confirmedDateValue) {
          var confirmedTimeValue = datePickerTimeValue(dateConfirmRoot);
          if (dateConfirmRoot.dataset.dateRange === "true") {
            var phase = dateConfirmRoot.dataset.dateRangePhase || "start";
            dateConfirmRoot.dataset[phase === "end" ? "dateEndTime" : "dateStartTime"] = confirmedTimeValue;
            confirmedDateValue = confirmedDateValue.split(" — ").map(function (datePart, index) {
              var time = index === 0 ? dateConfirmRoot.dataset.dateStartTime : dateConfirmRoot.dataset.dateEndTime;
              return datePart.replace(/\s+\d{2}:\d{2}(?::\d{2})?$/, "") + " " + time;
            }).join(" — ");
          } else {
            confirmedDateValue = confirmedDateValue.replace(/\s+\d{2}:\d{2}(?::\d{2})?$/, "") + " " + confirmedTimeValue;
          }
        }
        dateConfirmRoot.dataset.dateValue = confirmedDateValue;
        writeDatePickerDisplayValue(dateConfirmRoot, confirmedDateValue);
        dateConfirmRoot.classList.toggle("is-empty", !confirmedDateValue);
        delete dateConfirmRoot.dataset.pendingValue;
        commitDatePickerState(dateConfirmRoot);
        setDatePickerOpen(dateConfirmRoot, false, true);
      }

      var dateCancel = event.target.closest("[data-date-cancel]");
      if (dateCancel) {
        var dateCancelRoot = dateCancel.closest("[data-date-picker]");
        restoreDatePickerState(dateCancelRoot);
        setDatePickerOpen(dateCancelRoot, false, true);
      }

      var dateCurrentTime = event.target.closest("[data-date-current-time]");
      if (dateCurrentTime) {
        setDatePickerCurrentTime(dateCurrentTime.closest("[data-date-picker]"));
      }

      var dateUnit = event.target.closest("[data-date-unit]");
      if (dateUnit) {
        var dateUnitRoot = dateUnit.closest("[data-date-picker]");
        dateUnit.parentElement.querySelectorAll("[data-date-unit]").forEach(function (unit) { unit.classList.toggle("is-selected", unit === dateUnit); });
        dateUnitRoot.dataset.dateValue = dateUnit.textContent.trim();
        writeDatePickerDisplayValue(dateUnitRoot, dateUnit.textContent.trim());
      }

      var dateShortcut = event.target.closest("[data-date-shortcut]");
      if (dateShortcut) {
        var dateShortcutRoot = dateShortcut.closest("[data-date-picker]");
        captureDatePickerState(dateShortcutRoot);
        dateShortcutRoot.querySelectorAll("[data-date-shortcut]").forEach(function (shortcut) {
          var selected = shortcut === dateShortcut;
          shortcut.classList.toggle("is-selected", selected);
          shortcut.setAttribute("aria-pressed", String(selected));
        });
        var shortcutType = dateShortcut.dataset.dateShortcut;
        var shortcutRange = shortcutType === "today" ? ["2026-07-13", "2026-07-13"] : (shortcutType === "week" ? ["2026-07-13", "2026-07-19"] : (shortcutType === "two-months" ? ["2026-07-01", "2026-08-31"] : ["2026-07-01", "2026-07-31"]));
        dateShortcutRoot.dataset.pendingValue = dateShortcutRoot.dataset.dateRange === "true" ? shortcutRange.join(" — ") : shortcutRange[0];
        delete dateShortcutRoot.dataset.rangeStart;
        delete dateShortcutRoot.dataset.rangeStartLabel;
        syncDateGridVisual(dateShortcutRoot, dateShortcutRoot.dataset.pendingValue);
        var shortcutConfirm = dateShortcutRoot.querySelector("[data-date-confirm]");
        if (shortcutConfirm) shortcutConfirm.disabled = false;
      }

      var dateTimeOption = event.target.closest("[data-date-time-option]");
      if (dateTimeOption) {
        var dateTimeOptionRoot = dateTimeOption.closest("[data-date-picker]");
        captureDatePickerState(dateTimeOptionRoot);
        dateTimeOption.closest("[data-date-time-unit]").querySelectorAll("[data-date-time-option]").forEach(function (option) {
          var selected = option === dateTimeOption;
          setDateTimeOptionVisual(option, selected, dateTimeOptionRoot.dataset.dateTimeChecks === "true");
        });
        scrollDateTimeOptionToTop(dateTimeOption);
        if (dateTimeOptionRoot.dataset.dateRange === "true") {
          var activePhase = dateTimeOptionRoot.dataset.dateRangePhase || "start";
          dateTimeOptionRoot.dataset[activePhase === "end" ? "dateEndTime" : "dateStartTime"] = datePickerTimeValue(dateTimeOptionRoot);
        }
      }

      var dateRangePhase = event.target.closest('[role="tab"][data-date-range-phase]');
      if (dateRangePhase) setDateRangePhase(dateRangePhase.closest("[data-date-picker]"), dateRangePhase.dataset.dateRangePhase);

      var calendarDay = event.target.closest(".calendar-days button:not(:empty)");
      if (calendarDay) {
        calendarDay.parentElement.querySelectorAll("button").forEach(function (item) { item.classList.remove("is-selected"); });
        calendarDay.classList.add("is-selected");
      }

      var groupedButton = event.target.closest(".segmented button, .card-tabs button, .editable-tabs button");
      if (groupedButton) {
        groupedButton.parentElement.querySelectorAll("button").forEach(function (item) {
          item.classList.toggle("is-active", item === groupedButton);
        });
      }

      var radioCalendarStep = event.target.closest("[data-radio-calendar-step]");
      if (radioCalendarStep) {
        var radioCalendarStepRoot = radioCalendarStep.closest("[data-radio-calendar]");
        var radioCalendarMonth = radioCalendarStepRoot.querySelector("[data-radio-calendar-month]");
        var radioCalendarDate = new Date(Number(radioCalendarMonth.dataset.year), Number(radioCalendarMonth.dataset.month) + Number(radioCalendarStep.dataset.radioCalendarStep), 1);
        radioCalendarMonth.dataset.year = String(radioCalendarDate.getFullYear());
        radioCalendarMonth.dataset.month = String(radioCalendarDate.getMonth());
        radioCalendarMonth.textContent = radioCalendarDate.toLocaleString("en-US", { month: "long", year: "numeric" });
      }

      var radioCalendarToday = event.target.closest("[data-radio-calendar-today]");
      if (radioCalendarToday) {
        var radioCalendarTodayRoot = radioCalendarToday.closest("[data-radio-calendar]");
        var radioCalendarTodayMonth = radioCalendarTodayRoot.querySelector("[data-radio-calendar-month]");
        radioCalendarTodayMonth.dataset.year = "2021";
        radioCalendarTodayMonth.dataset.month = "5";
        radioCalendarTodayMonth.textContent = "June 2021";
      }

      var colorPickerTrigger = event.target.closest("[data-color-picker-control] > [data-color-trigger]");
      if (colorPickerTrigger) {
        var colorPickerControl = colorPickerTrigger.closest("[data-color-picker-control]");
        setColorPickerOpen(colorPickerControl, !colorPickerControl.classList.contains("is-open"), false);
      }

      var simpleColorTrigger = event.target.closest("[data-simple-color-picker] [data-color-trigger]");
      if (simpleColorTrigger) {
        var simpleColorRoot = simpleColorTrigger.closest("[data-simple-color-picker]");
        setSimpleColorOpen(simpleColorRoot, !simpleColorRoot.classList.contains("is-open"), false);
      }

      var colorSwatch = event.target.closest(".color-grid .swatch");
      if (colorSwatch) {
        var colorRoot = colorSwatch.closest(".color-simple-interaction") || colorSwatch.closest("[data-color-picker], .color-palette");
        colorSwatch.parentElement.querySelectorAll(".swatch").forEach(function (item) {
          item.classList.remove("is-selected");
          item.setAttribute("aria-pressed", "false");
          var oldIcon = item.querySelector(".b2b-icon");
          if (oldIcon) oldIcon.remove();
        });
        colorSwatch.classList.add("is-selected");
        colorSwatch.setAttribute("aria-pressed", "true");
        colorSwatch.setAttribute("aria-selected", "true");
        colorSwatch.tabIndex = 0;
        var colorGrid = colorSwatch.closest("[data-color-grid]");
        if (colorGrid && colorSwatch.id) colorGrid.setAttribute("aria-activedescendant", colorSwatch.id);
        if (!colorSwatch.querySelector(".b2b-icon")) colorSwatch.innerHTML = '<span class="b2b-icon" aria-hidden="true">check</span>';
        var selectedColorValue = colorSwatch.dataset.colorValue;
        var selectedColorAlpha = Number(colorSwatch.dataset.colorSwatchAlpha || 100);
        var selectedColorWithAlpha = selectedColorValue + (selectedColorAlpha < 100 ? Math.round(selectedColorAlpha / 100 * 255).toString(16).padStart(2, "0") : "");
        if (colorRoot) setColorFromHex(colorRoot, selectedColorWithAlpha, true);
        var simpleColorDropdown = colorSwatch.closest("[data-simple-color-picker]");
        if (simpleColorDropdown) setSimpleColorOpen(simpleColorDropdown, false, true);
        var colorPickerDropdown = colorSwatch.closest("[data-color-picker-control]");
        if (colorPickerDropdown) setColorPickerOpen(colorPickerDropdown, false, true);
      }

      var moreColorTrigger = event.target.closest("[data-color-more]");
      if (moreColorTrigger) {
        var moreColorRoot = moreColorTrigger.closest("[data-color-picker]");
        setColorCustomOpen(moreColorRoot, !moreColorRoot.classList.contains("is-custom-open"), false);
      }

      var interactiveCard = event.target.closest(".source-card.is-interactive");
      if (interactiveCard) {
        interactiveCard.classList.toggle("is-selected");
        interactiveCard.setAttribute("aria-pressed", String(interactiveCard.classList.contains("is-selected")));
      }

      var choiceCard = event.target.closest(".choice-cards label");
      if (choiceCard) {
        choiceCard.parentElement.querySelectorAll("label").forEach(function (item) { item.classList.toggle("is-selected", item === choiceCard); });
        var choiceRadio = choiceCard.querySelector("input");
        if (choiceRadio) choiceRadio.checked = true;
      }

      var treeItem = event.target.closest(".tree-panel > button");
      if (treeItem) {
        treeItem.parentElement.querySelectorAll(":scope > button").forEach(function (item) {
          item.classList.toggle("is-selected", item === treeItem);
        });
      }

      var timeItem = event.target.closest(".time-panel button");
      if (timeItem) {
        timeItem.parentElement.querySelectorAll("button").forEach(function (item) { item.classList.toggle("is-selected", item === timeItem); });
      }

      var stepperButton = event.target.closest(".stepper button:not(:disabled)");
      if (stepperButton) {
        var stepper = stepperButton.closest(".stepper");
        var stepperInput = stepper.querySelector("input");
        var stepperValue = Number(stepperInput.value) || 0;
        var stepperIcon = stepperButton.querySelector(".b2b-icon");
        stepperInput.value = String(stepperValue + (stepperIcon && stepperIcon.textContent.trim() === "remove" ? -1 : 1));
        stepperInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      var transferButton = event.target.closest(".transfer-actions button");
      if (transferButton) {
        var transfer = transferButton.closest(".transfer");
        var transferSections = transfer.querySelectorAll(":scope > section");
        var transferIcon = transferButton.querySelector(".b2b-icon").textContent.trim();
        var transferSource = transferIcon === "chevron_right" ? transferSections[0] : transferSections[1];
        var transferTarget = transferIcon === "chevron_right" ? transferSections[1] : transferSections[0];
        transferSource.querySelectorAll(".transfer-list .choice").forEach(function (item) {
          var checkbox = item.querySelector("input");
          if (!checkbox.checked) return;
          checkbox.checked = false;
          transferTarget.querySelector(".transfer-list").appendChild(item);
          item.classList.add("is-moving");
          window.setTimeout(function () { item.classList.remove("is-moving"); }, 260);
        });
      }

      var uploadTrigger = event.target.closest(".upload-drag, .upload-picture, .upload-button .b2b-button");
      if (uploadTrigger && !uploadTrigger.closest('.component-spec-board[data-component-id="C-31"]') && !uploadTrigger.closest('[data-component-renderer="upload"]')) {
        uploadTrigger.classList.add("is-uploading");
        window.setTimeout(function () {
          uploadTrigger.classList.remove("is-uploading");
          uploadTrigger.classList.add("is-complete");
        }, 700);
      }

      var retryFile = event.target.closest(".file-row.is-error button");
      if (retryFile) {
        var retryRow = retryFile.closest(".file-row");
        retryRow.classList.remove("is-error");
        retryRow.classList.add("is-success");
        retryRow.querySelector("small").textContent = "上传完成";
        retryFile.replaceWith(Object.assign(document.createElement("span"), { className: "b2b-icon", textContent: "check_circle" }));
      }

      var imageTool = event.target.closest(".image-toolbar button");
      if (imageTool) {
        var previewStage = imageTool.closest(".image-preview-stage");
        var imagePlaceholder = previewStage.querySelector(".image-placeholder");
        var imageAction = imageTool.querySelector(".b2b-icon").textContent.trim();
        var scale = Number(previewStage.dataset.scale || 1);
        var rotation = Number(previewStage.dataset.rotation || 0);
        if (imageAction === "zoom_in") scale = Math.min(1.6, scale + 0.2);
        if (imageAction === "zoom_out") scale = Math.max(0.6, scale - 0.2);
        if (imageAction === "rotate_right") rotation += 90;
        if (imageAction === "rotate_left") rotation -= 90;
        if (imageAction === "fit_screen") scale = Math.abs(scale - 1) < 0.01 ? 0.82 : 1;
        previewStage.dataset.scale = String(scale);
        previewStage.dataset.rotation = String(rotation);
        imagePlaceholder.style.transform = "scale(" + scale + ") rotate(" + rotation + "deg)";
        var zoomLabel = previewStage.querySelector(".image-toolbar > span");
        if (zoomLabel) zoomLabel.textContent = Math.round(scale * 100) + "%";
      }

      var imagePager = event.target.closest(".image-prev, .image-next");
      if (imagePager) {
        var pagerStage = imagePager.closest(".image-preview-stage");
        var pageLabel = pagerStage.querySelector(":scope > small");
        if (!pageLabel) return;
        var current = Number((pageLabel.textContent.match(/\d+/) || [1])[0]);
        current = imagePager.classList.contains("image-next") ? Math.min(6, current + 1) : Math.max(1, current - 1);
        pageLabel.textContent = current + " / 6";
        pagerStage.querySelector(".image-placeholder span").textContent = "图片 " + current;
      }

      var imageOpen = event.target.closest("[data-image-open]");
      if (imageOpen) {
        var imageOpenDemo = imageOpen.closest("[data-image-demo]");
        var imageOpenOverlay = imageOpenDemo && imageOpenDemo.querySelector("[data-image-overlay]");
        if (imageOpenOverlay) imageOpenOverlay.hidden = false;
      }

      var imageClose = event.target.closest(".image-preview-close");
      if (imageClose) {
        var imageCloseOverlay = imageClose.closest("[data-image-overlay]");
        if (imageCloseOverlay) imageCloseOverlay.hidden = true;
      }

      var dismissButton = event.target.closest(".notification-spec > button, .alert-spec > button, .dialog-spec header > button, .drawer-spec header > button");
      if (dismissButton && !dismissButton.closest("[data-notification-bound]")) {
        var dismissIcon = dismissButton.querySelector(".b2b-icon");
        if (dismissIcon && dismissIcon.textContent.trim() === "close") {
          var dismissTarget = dismissButton.closest(".notification-spec, .alert-spec, .dialog-spec, .drawer-spec");
          dismissTarget.classList.add("is-dismissing");
          window.setTimeout(function () { dismissTarget.hidden = true; }, 180);
        }
      }

      var tagClose = event.target.closest(".b2b-tag.is-filter button");
      if (tagClose) {
        var tag = tagClose.closest(".b2b-tag");
        tag.classList.add("is-dismissing");
        window.setTimeout(function () { tag.remove(); }, 180);
      }

      var chartMark = event.target.closest(".source-chart i");
      if (chartMark) {
        chartMark.parentElement.querySelectorAll("i").forEach(function (item) { item.classList.toggle("is-selected", item === chartMark); });
      }

      var visualizationLegend = event.target.closest("[data-chart-legend]");
      if (visualizationLegend && !isDirectRendererNode(visualizationLegend)) toggleVisualizationLegend(visualizationLegend);

      var visualizationMark = event.target.closest("[data-chart-mark]");
      if (visualizationMark && !visualizationLegend && !isDirectRendererNode(visualizationMark)) selectVisualizationMark(visualizationMark);

      var toast = event.target.closest(".toast-spec");
      if (toast && !event.target.closest("button") && !isDirectRendererNode(toast)) {
        toast.classList.toggle("is-confirmed");
        toast.setAttribute("aria-pressed", String(toast.classList.contains("is-confirmed")));
      }

      var progressControl = event.target.closest(".progress-spec, .progress-circle, .progress-steps");
      if (progressControl) progressControl.classList.toggle("is-paused");

      var sliderClick = event.target.closest(".slider:not(.is-range)");
      if (sliderClick) updateSlider(sliderClick, event.clientX);

      var formStepTarget = event.target.closest("[data-step-target]");
      if (formStepTarget) setFormStep(formStepTarget.closest("[data-form-steps]"), formStepTarget.dataset.stepTarget);

      var formStepNext = event.target.closest("[data-form-next]");
      if (formStepNext) {
        var nextForm = formStepNext.closest("[data-form-steps]");
        var nextStep = Number(nextForm.dataset.step || 1) + 1;
        if (nextStep > nextForm.querySelectorAll("[data-step-target]").length) {
          formStepNext.textContent = "已提交";
          formStepNext.disabled = true;
        } else setFormStep(nextForm, nextStep);
      }

      var formStepPrevious = event.target.closest("[data-form-prev]");
      if (formStepPrevious) {
        var previousForm = formStepPrevious.closest("[data-form-steps]");
        setFormStep(previousForm, Number(previousForm.dataset.step || 1) - 1);
      }

      var formAdd = event.target.closest("[data-form-add]");
      if (formAdd) {
        var repeatRoot = formAdd.closest("[data-form-repeat]");
        var repeatList = repeatRoot && repeatRoot.querySelector("[data-repeat-list]");
        var repeatTemplate = repeatList && repeatList.querySelector(".form-repeat-item:last-child");
        if (repeatList && repeatTemplate) {
          var newRepeat = repeatTemplate.cloneNode(true);
          newRepeat.querySelectorAll("input").forEach(function (repeatInput) { repeatInput.value = ""; });
          repeatList.appendChild(newRepeat);
          var newRepeatInput = newRepeat.querySelector("input");
          if (newRepeatInput) newRepeatInput.focus();
        }
      }

      var formRemove = event.target.closest("[data-form-remove]");
      if (formRemove) {
        var removeList = formRemove.closest("[data-repeat-list]");
        var removeItems = removeList && removeList.querySelectorAll(".form-repeat-item");
        if (removeItems && removeItems.length > 1) formRemove.closest(".form-repeat-item").remove();
        else if (removeItems && removeItems[0]) {
          var onlyInput = removeItems[0].querySelector("input");
          if (onlyInput) onlyInput.value = "";
        }
      }

      var formGroupAdd = event.target.closest("[data-form-group-add]");
      if (formGroupAdd) {
        var compoundField = formGroupAdd.closest(".form-compound-field");
        var compoundList = compoundField && compoundField.querySelector("[data-form-compound-list]");
        var compoundTemplate = compoundList && compoundList.querySelector("[data-form-compound-card]:last-child");
        if (compoundList && compoundTemplate) {
          var newCompound = compoundTemplate.cloneNode(true);
          newCompound.querySelectorAll("input").forEach(function (compoundInput) { compoundInput.value = ""; });
          compoundList.appendChild(newCompound);
          var newCompoundInput = newCompound.querySelector("input");
          if (newCompoundInput) newCompoundInput.focus();
        }
      }

      var formGroupRemove = event.target.closest("[data-form-group-remove]");
      if (formGroupRemove) {
        var compoundRemoveList = formGroupRemove.closest("[data-form-compound-list]");
        var compoundCards = compoundRemoveList && compoundRemoveList.querySelectorAll("[data-form-compound-card]");
        var compoundCard = formGroupRemove.closest("[data-form-compound-card]");
        if (compoundCards && compoundCards.length > 1 && compoundCard) compoundCard.remove();
        else if (compoundCard) compoundCard.querySelectorAll("input").forEach(function (compoundInput) { compoundInput.value = ""; });
      }

      var linkedScope = event.target.closest('[data-linked-form] input[name="scope"]');
      if (linkedScope) {
        var linkedDepartment = linkedScope.closest("[data-linked-form]").querySelector("[data-linked-department]");
        if (linkedDepartment) linkedDepartment.hidden = linkedScope.value !== "department";
      }

      var inputClear = event.target.closest("[data-input-clear]");
      if (inputClear) {
        event.preventDefault();
        event.stopPropagation();
        var clearInput = inputClear.closest("[data-source-input]").querySelector("input");
        clearInput.value = "";
        clearInput.dispatchEvent(new Event("input", { bubbles: true }));
        clearInput.focus();
        return;
      }

      var passwordToggle = event.target.closest("[data-password-toggle]");
      if (passwordToggle) {
        var passwordInput = passwordToggle.closest("[data-source-input]").querySelector("input");
        var revealPassword = passwordInput.type === "password";
        passwordInput.type = revealPassword ? "text" : "password";
        passwordToggle.setAttribute("aria-label", revealPassword ? "隐藏密码" : "显示密码");
        var passwordIcon = passwordToggle.querySelector(".b2b-icon");
        if (passwordIcon) passwordIcon.textContent = revealPassword ? "visibility" : "visibility_off";
        passwordInput.focus();
      }

      var numberStep = event.target.closest("[data-number-step]:not(:disabled)");
      if (numberStep) {
        var numberRoot = numberStep.closest("[data-number-input]");
        var numberInput = numberRoot.querySelector("input");
        var numberStepSize = Number(numberRoot.dataset.step || 1);
        var numberPrecision = Math.max((String(numberInput.value).split(".")[1] || "").length, (String(numberStepSize).split(".")[1] || "").length);
        var numberValue = Number((Number(numberInput.value || 0) + Number(numberStep.dataset.numberStep || 0) * numberStepSize).toFixed(numberPrecision));
        numberValue = Math.max(Number(numberRoot.dataset.min), Math.min(Number(numberRoot.dataset.max), numberValue));
        numberInput.value = String(numberValue);
        numberInput.dispatchEvent(new Event("input", { bubbles: true }));
        updateNumberInputButtons(numberRoot);
        numberInput.focus();
      }

      var formSave = event.target.closest(".form-spec .form-actions .is-primary");
      if (formSave) {
        event.preventDefault();
        var form = formSave.closest(".form-spec");
        var oldFeedback = form.querySelector(".demo-inline-feedback");
        if (oldFeedback) oldFeedback.remove();
        var feedback = document.createElement("span");
        feedback.className = "demo-inline-feedback";
        feedback.setAttribute("role", "status");
        feedback.textContent = "已保存";
        form.appendChild(feedback);
      }

      if (!event.target.closest("[data-popup-root]")) closeOtherPopups(null);
      if (!event.target.closest("[data-cascader-demo]")) {
        var localCascaderScope = event.target.closest(".cascade-reference-state, .cascade-placement-case, .cascade-sizing-board");
        if (localCascaderScope) {
          localCascaderScope.querySelectorAll("[data-cascader-demo].is-open").forEach(function (demo) {
            setCascaderOpen(demo, false);
          });
        } else {
          var localCascaderCell = event.target.closest(".specimen-cell");
          var localOpenCascaders = localCascaderCell
            ? localCascaderCell.querySelectorAll("[data-cascader-demo].is-open")
            : interactionRoot.querySelectorAll("[data-cascader-demo].is-open");
          localOpenCascaders.forEach(function (demo) { setCascaderOpen(demo, false); });
        }
      }
      if (!event.target.closest("[data-context-menu-stage]")) {
        interactionRoot.querySelectorAll("[data-context-menu-stage].is-open").forEach(function (stage) {
          setC08ContextMenuState(stage, false, false);
        });
      }
      if (!event.target.closest("[data-top-nav-more]")) {
        interactionRoot.querySelectorAll("[data-top-nav-more]").forEach(function (more) {
          setTopNavMenuOpen(more, false, false);
        });
      }
      if (!event.target.closest("[data-side-web-nav]")) {
        interactionRoot.querySelectorAll("[data-side-web-nav].is-flyout-open").forEach(function (nav) {
          hideSideNavFlyout(nav, true);
        });
      }
      if (!event.target.closest("[data-breadcrumb-more]")) {
        interactionRoot.querySelectorAll("[data-breadcrumb-more].is-open").forEach(function (more) {
          setBreadcrumbMoreOpen(more, false, false);
        });
      }
      if (!event.target.closest("[data-date-heading-trigger], [data-date-month-menu]")) closeDateMonthMenus(null);
      if (!event.target.closest("[data-date-picker]")) closeOtherDatePickers(null);
      if (!event.target.closest("[data-select-demo]")) interactionRoot.querySelectorAll("[data-select-demo].is-open.is-user-open").forEach(function (selectRoot) { setSourceSelectOpen(selectRoot, false, false); });
      if (!event.target.closest("[data-tree-select]")) interactionRoot.querySelectorAll("[data-tree-select].is-open.is-user-open").forEach(function (treeRoot) { setTreeSelectOpen(treeRoot, false, false, false); });
      if (!event.target.closest("[data-time-picker]")) closeOtherTimePickers(null);
    });

    interactionRoot.addEventListener("mouseover", function (event) {
      var hoveredBreadcrumbMore = event.target.closest && event.target.closest("[data-breadcrumb-more]");
      if (hoveredBreadcrumbMore && !(event.relatedTarget && hoveredBreadcrumbMore.contains(event.relatedTarget))) {
        var hoveredBreadcrumbTrigger = hoveredBreadcrumbMore.querySelector(":scope > button");
        if (!hoveredBreadcrumbTrigger || hoveredBreadcrumbTrigger.getAttribute("aria-expanded") !== "true") {
          setBreadcrumbMoreOpen(hoveredBreadcrumbMore, true, false, "hover");
        }
      }
      var hoveredSelectOption = event.target.closest && event.target.closest("[data-select-option]:not(:disabled)");
      if (hoveredSelectOption && !(event.relatedTarget && hoveredSelectOption.contains(event.relatedTarget))) {
        var hoveredSelectRoot = hoveredSelectOption.closest("[data-select-demo]");
        hoveredSelectRoot.querySelectorAll("[data-select-option]").forEach(function (option) {
          option.classList.toggle("is-active", option === hoveredSelectOption);
        });
      }
      var hoveredRatingStar = event.target.closest && event.target.closest("[data-rating-value]:not(:disabled)");
      if (!hoveredRatingStar) return;
      var hoveredRatingRoot = hoveredRatingStar.closest("[data-rating]");
      var hoveredRatingValue = ratingPointerValue(hoveredRatingStar, event);
      var hoveredRatingLabels = ["Please click to rate", "Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"];
      var hoveredRatingPrompt = hoveredRatingRoot.querySelector("[data-rating-prompt]");
      renderRatingValue(hoveredRatingRoot, hoveredRatingValue);
      if (hoveredRatingPrompt) hoveredRatingPrompt.textContent = hoveredRatingLabels[Math.round(hoveredRatingValue)];
    });

    interactionRoot.addEventListener("mousemove", function (event) {
      var movedSliderRoot = event.target.closest && event.target.closest("[data-source-slider]");
      interactionRoot.querySelectorAll("[data-source-slider].is-hover-low, [data-source-slider].is-hover-high").forEach(function (sliderRoot) {
        if (sliderRoot !== movedSliderRoot) {
          sliderRoot.classList.remove("is-hover-low");
          sliderRoot.classList.remove("is-hover-high");
        }
      });
      if (movedSliderRoot) updateSourceSliderHover(movedSliderRoot, event);

      var movedRatingStar = event.target.closest && event.target.closest("[data-rating-value]:not(:disabled)");
      if (!movedRatingStar) return;
      var movedRatingRoot = movedRatingStar.closest("[data-rating]");
      if (Number(movedRatingRoot.dataset.step) !== 0.5) return;
      var movedRatingValue = ratingPointerValue(movedRatingStar, event);
      var movedRatingLabels = ["Please click to rate", "Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"];
      var movedRatingPrompt = movedRatingRoot.querySelector("[data-rating-prompt]");
      renderRatingValue(movedRatingRoot, movedRatingValue);
      if (movedRatingPrompt) movedRatingPrompt.textContent = movedRatingLabels[Math.round(movedRatingValue)];
    });

    interactionRoot.addEventListener("mouseout", function (event) {
      var leftSliderRoot = event.target.closest && event.target.closest("[data-source-slider]");
      if (leftSliderRoot && !(event.relatedTarget && leftSliderRoot.contains(event.relatedTarget))) {
        leftSliderRoot.classList.remove("is-hover-low");
        leftSliderRoot.classList.remove("is-hover-high");
      }

      var leftBreadcrumbMore = event.target.closest && event.target.closest("[data-breadcrumb-more]");
      if (leftBreadcrumbMore && leftBreadcrumbMore._b2bBreadcrumbOpenReason === "hover" && !(event.relatedTarget && leftBreadcrumbMore.contains(event.relatedTarget))) {
        window.clearTimeout(leftBreadcrumbMore._b2bBreadcrumbCloseTimer);
        leftBreadcrumbMore._b2bBreadcrumbCloseTimer = window.setTimeout(function () {
          if (!leftBreadcrumbMore.matches(":hover") && !leftBreadcrumbMore.contains(document.activeElement)) setBreadcrumbMoreOpen(leftBreadcrumbMore, false, false);
        }, 120);
      }
      var leftRatingStar = event.target.closest && event.target.closest("[data-rating-value]:not(:disabled)");
      if (!leftRatingStar || leftRatingStar.contains(event.relatedTarget)) return;
      var leftRatingRoot = leftRatingStar.closest("[data-rating]");
      var leftRatingLabels = ["Please click to rate", "Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"];
      var leftRatingPrompt = leftRatingRoot.querySelector("[data-rating-prompt]");
      renderRatingValue(leftRatingRoot, Number(leftRatingRoot.dataset.value || 0));
      if (leftRatingPrompt) leftRatingPrompt.textContent = leftRatingLabels[Math.round(Number(leftRatingRoot.dataset.value || 0))];
    });

    interactionRoot.addEventListener("contextmenu", function (event) {
      var contextStage = event.target.closest && event.target.closest("[data-context-menu-stage]");
      if (!contextStage || isDirectRendererNode(contextStage)) return;
      event.preventDefault();
      var contextPanel = contextStage.querySelector("[data-context-menu-panel], .context-menu-panel");
      if (!contextPanel) return;
      interactionRoot.querySelectorAll("[data-context-menu-stage].is-open").forEach(function (stage) {
        if (stage !== contextStage) setC08ContextMenuState(stage, false, false);
      });
      var activeContextTarget = document.activeElement;
      contextStage._b2bContextRestoreTarget = activeContextTarget && activeContextTarget !== document.body ? activeContextTarget : contextStage;
      var contextRect = contextStage.getBoundingClientRect();
      var nextLeft = Math.max(16, Math.min(event.clientX - contextRect.left, contextRect.width - contextPanel.offsetWidth - 16));
      var nextTop = Math.max(16, Math.min(event.clientY - contextRect.top, contextRect.height - contextPanel.offsetHeight - 16));
      contextPanel.style.left = nextLeft + "px";
      contextPanel.style.top = nextTop + "px";
      setC08ContextMenuState(contextStage, true, false);
    });

    interactionRoot.addEventListener("dragstart", function (event) {
      var tableDragRow = event.target.closest && event.target.closest("[data-table-drag-row]");
      if (tableDragRow) { tableDragRow.classList.add("is-dragging"); if (event.dataTransfer) event.dataTransfer.effectAllowed = "move"; return; }
      var sourceCardDrag = event.target.closest && event.target.closest("[data-source-card-drag]");
      if (sourceCardDrag) {
        sourceCardDrag.classList.add("is-dragging");
        if (event.dataTransfer) { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", "card"); }
        return;
      }
      var transferDragItem = event.target.closest && event.target.closest("[data-transfer-selected]");
      if (!transferDragItem) return;
      transferDragItem.classList.add("is-dragging");
      if (event.dataTransfer) { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", transferDragItem.dataset.value); }
    });

    interactionRoot.addEventListener("dragover", function (event) {
      var uploadDropZone = event.target.closest && event.target.closest("[data-upload-demo] [data-upload-drop]");
      if (uploadDropZone) {
        event.preventDefault();
        if (uploadEntryIsDisabled(uploadDropZone)) {
          uploadDropZone.classList.remove("is-dragover");
          return;
        }
        uploadDropZone.classList.add("is-dragover");
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
        return;
      }
      var tableDropRow = event.target.closest && event.target.closest("[data-table-drag-row]");
      if (tableDropRow) { event.preventDefault(); return; }
      var transferDropItem = event.target.closest && event.target.closest("[data-transfer-selected]");
      if (!transferDropItem) return;
      event.preventDefault();
      transferDropItem.closest("[data-transfer-target-list]").querySelectorAll(".is-drag-over").forEach(function (item) { item.classList.remove("is-drag-over"); });
      transferDropItem.classList.add("is-drag-over");
    });

    interactionRoot.addEventListener("drop", function (event) {
      var uploadDropTarget = event.target.closest && event.target.closest("[data-upload-demo] [data-upload-drop]");
      if (uploadDropTarget) {
        event.preventDefault();
        uploadDropTarget.classList.remove("is-dragover");
        if (uploadEntryIsDisabled(uploadDropTarget)) return;
        startUploadSimulation(uploadDropTarget.matches("[data-upload-start]") ? uploadDropTarget : uploadDropTarget.querySelector("[data-upload-start]"), event.dataTransfer && event.dataTransfer.files);
        return;
      }
      var tableDropTarget = event.target.closest && event.target.closest("[data-table-drag-row]");
      if (tableDropTarget) {
        event.preventDefault();
        var tableDragList = tableDropTarget.closest("[data-table-drag-list]");
        var tableDragging = tableDragList.querySelector(".is-dragging");
        if (tableDragging && tableDragging !== tableDropTarget) tableDragList.insertBefore(tableDragging, tableDropTarget);
        return;
      }
      var transferDropTarget = event.target.closest && event.target.closest("[data-transfer-selected]");
      if (!transferDropTarget) return;
      event.preventDefault();
      var transferDropList = transferDropTarget.closest("[data-transfer-target-list]");
      var transferDragging = transferDropList.querySelector(".is-dragging");
      if (transferDragging && transferDragging !== transferDropTarget) transferDropList.insertBefore(transferDragging, transferDropTarget.nextSibling);
      transferDropTarget.classList.remove("is-drag-over");
    });

    interactionRoot.addEventListener("dragleave", function (event) {
      var uploadDropLeave = event.target.closest && event.target.closest("[data-upload-demo] [data-upload-drop]");
      if (uploadDropLeave && !uploadDropLeave.contains(event.relatedTarget)) uploadDropLeave.classList.remove("is-dragover");
    });

    interactionRoot.addEventListener("dragend", function (event) {
      var tableDragEnd = event.target.closest && event.target.closest("[data-table-drag-row]");
      if (tableDragEnd) { tableDragEnd.classList.remove("is-dragging"); return; }
      var sourceCardDragEnd = event.target.closest && event.target.closest("[data-source-card-drag]");
      if (sourceCardDragEnd) { sourceCardDragEnd.classList.remove("is-dragging"); return; }
      var transferDragEnd = event.target.closest && event.target.closest("[data-transfer-selected]");
      if (!transferDragEnd) return;
      transferDragEnd.classList.remove("is-dragging");
      transferDragEnd.closest("[data-transfer-target-list]").querySelectorAll(".is-drag-over").forEach(function (item) { item.classList.remove("is-drag-over"); });
    });

    interactionRoot.addEventListener("input", function (event) {
      var timeTextInput = event.target.closest && event.target.closest("[data-time-trigger] input");
      if (timeTextInput) {
        timeTextInput.setAttribute("aria-invalid", "false");
        timeTextInput.closest("[data-time-picker]").classList.remove("is-error");
      }

      var dialogListSearch = event.target.closest && event.target.closest("[data-dialog-list-search]");
      if (dialogListSearch) {
        var dialogListSearchRoot = dialogListSearch.closest(".source-dialog");
        var dialogListQuery = dialogListSearch.value.trim().toLowerCase();
        dialogListSearchRoot.querySelectorAll("[data-dialog-search-item]").forEach(function (item) {
          item.hidden = Boolean(dialogListQuery) && item.textContent.toLowerCase().indexOf(dialogListQuery) < 0;
        });
      }

      var checkboxPickerSearch = event.target.closest && event.target.closest("[data-checkbox-picker-search]");
      if (checkboxPickerSearch) {
        var checkboxPickerSearchRoot = checkboxPickerSearch.closest("[data-checkbox-picker]");
        var checkboxPickerQuery = checkboxPickerSearch.value.trim().toLowerCase();
        checkboxPickerSearchRoot.querySelectorAll(".checkbox-spec").forEach(function (row) {
          row.hidden = Boolean(checkboxPickerQuery) && row.textContent.toLowerCase().indexOf(checkboxPickerQuery) < 0;
        });
      }

      var transferSearch = event.target.closest && event.target.closest("[data-transfer-search]");
      if (transferSearch) {
        var transferSearchRoot = transferSearch.closest("[data-transfer]");
        var transferQuery = transferSearch.value.trim().toLowerCase();
        transferSearchRoot.querySelectorAll(".transfer-choice").forEach(function (row) { row.hidden = Boolean(transferQuery) && row.textContent.toLowerCase().indexOf(transferQuery) < 0; });
        syncTransferSourceSummary(transferSearchRoot);
      }

      var treePeopleSearch = event.target.closest && event.target.closest("[data-tree-people-search]");
      if (treePeopleSearch) filterPeopleTree(treePeopleSearch.closest("[data-tree-people]"));

      var treeSearch = event.target.closest && event.target.closest("[data-tree-search]");
      if (treeSearch) {
        filterTreeSelect(treeSearch.closest("[data-tree-select]"));
      }

      var sourceSliderRange = event.target.closest && event.target.closest("[data-slider-range]");
      if (sourceSliderRange) updateSourceSlider(sourceSliderRange.closest("[data-source-slider]"), sourceSliderRange);

      var sourceSliderLinked = event.target.closest && event.target.closest("[data-slider-linked]");
      if (sourceSliderLinked) {
        var sourceSliderLinkedRoot = sourceSliderLinked.closest("[data-source-slider]");
        var sourceSliderLinkedRange = sourceSliderLinkedRoot.querySelector('[data-slider-range="low"]');
        sourceSliderLinkedRange.value = sourceSliderLinked.value;
        updateSourceSlider(sourceSliderLinkedRoot, sourceSliderLinkedRange);
      }

      var sourceStepperInput = event.target.closest && event.target.closest("[data-stepper-input]");
      if (sourceStepperInput) {
        sourceStepperInput.value = sourceStepperInput.value.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, "");
        var sourceStepperInputRoot = sourceStepperInput.closest("[data-source-stepper]");
        if (sourceStepperInput.value && sourceStepperInput.value !== "-") updateSourceStepper(sourceStepperInputRoot, sourceStepperInput.value, false);
      }

      var sourceSelectSearch = event.target.closest && event.target.closest("[data-select-search]");
      if (sourceSelectSearch) {
        var sourceSelectSearchRoot = sourceSelectSearch.closest("[data-select-demo]");
        if (sourceSelectIsLocked(sourceSelectSearchRoot)) return;
        markSourceSelectAsCurrent(sourceSelectSearchRoot);
        var sourceSelectQuery = sourceSelectSearch.value.trim().toLowerCase();
        var sourceSelectVisibleCount = 0;
        var sourceSelectVisibleOptions = [];
        sourceSelectSearchRoot.querySelectorAll("[data-select-option]").forEach(function (option) {
          var matches = !sourceSelectQuery || option.dataset.value.toLowerCase().indexOf(sourceSelectQuery) >= 0;
          option.hidden = !matches;
          if (matches) {
            sourceSelectVisibleCount += 1;
            sourceSelectVisibleOptions.push(option);
          }
        });
        var sourceSelectVisibleSelected = sourceSelectVisibleOptions.find(function (option) { return option.getAttribute("aria-selected") === "true"; });
        var sourceSelectVisibleActive = sourceSelectVisibleSelected || sourceSelectVisibleOptions[0];
        sourceSelectSearchRoot.querySelectorAll("[data-select-option]").forEach(function (option) {
          option.classList.toggle("is-active", option === sourceSelectVisibleActive);
        });
        var sourceSelectFeedback = sourceSelectSearchRoot.querySelector(".source-select-feedback");
        if (!sourceSelectVisibleCount && !sourceSelectFeedback) {
          sourceSelectFeedback = document.createElement("div");
          sourceSelectFeedback.className = "source-select-feedback is-runtime";
          sourceSelectFeedback.textContent = "No search result";
          sourceSelectSearchRoot.querySelector("[data-select-options]").appendChild(sourceSelectFeedback);
        } else if (sourceSelectVisibleCount && sourceSelectFeedback && sourceSelectFeedback.classList.contains("is-runtime")) sourceSelectFeedback.remove();
      }

      var cascadeSearch = event.target.closest && event.target.closest("[data-cascade-search]");
      if (cascadeSearch) {
        filterCascaderSearch(cascadeSearch);
        setCascaderOpen(cascadeSearch.closest("[data-cascader-demo]"), true);
      }

      var colorHue = event.target.closest && event.target.closest("[data-color-hue]");
      if (colorHue) applyColorState(colorHue.closest("[data-color-picker]"), { h: Number(colorHue.value) }, false);

      var colorAlpha = event.target.closest && event.target.closest("[data-color-alpha]");
      if (colorAlpha) applyColorState(colorAlpha.closest("[data-color-picker]"), { a: Number(colorAlpha.value) }, false);

      var colorInput = event.target.closest && event.target.closest("[data-color-input]");
      if (colorInput) {
        var inputColorRoot = colorInput.closest("[data-color-picker]");
        var inputColorValue = colorInput.value.trim();
        var validColorValue = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(inputColorValue);
        colorInput.setAttribute("aria-invalid", String(!validColorValue));
        if (inputColorRoot) inputColorRoot.classList.toggle("is-error", !validColorValue);
        if (validColorValue && inputColorRoot) setColorFromHex(inputColorRoot, inputColorValue, false);
      }

      var colorChannel = event.target.closest && event.target.closest("[data-color-channel]");
      if (colorChannel) {
        var channelColorRoot = colorChannel.closest("[data-color-picker]");
        var redInput = channelColorRoot.querySelector('[data-color-channel="r"]');
        var greenInput = channelColorRoot.querySelector('[data-color-channel="g"]');
        var blueInput = channelColorRoot.querySelector('[data-color-channel="b"]');
        var channelInputs = [redInput, greenInput, blueInput];
        var channelValidity = channelInputs.map(function (input) {
          var value = String(input.value).trim();
          var valid = /^\d{1,3}$/.test(value) && Number(value) >= 0 && Number(value) <= 255;
          input.setAttribute("aria-invalid", String(!valid));
          return valid;
        });
        var validChannels = channelValidity.every(Boolean);
        channelColorRoot.classList.toggle("is-error", !validChannels);
        if (validChannels) {
          var channelHex = colorRgbToHex(redInput.value, greenInput.value, blueInput.value);
          setColorFromHex(channelColorRoot, channelHex, false);
        }
      }

      var paginationJumpInput = event.target.closest && event.target.closest("[data-page-jump-input]");
      if (paginationJumpInput) {
        paginationJumpInput.value = paginationJumpInput.value.replace(/\D/g, "");
        paginationJumpInput.setAttribute("aria-invalid", String(!paginationJumpInput.value));
      }

      var tableSearchInput = event.target.closest && event.target.closest("[data-table-search]");
      if (tableSearchInput) filterTableRows(tableSearchInput);

      var immediateName = event.target.closest && event.target.closest('[data-form-validation="immediate"] [data-validate-name]');
      if (immediateName) {
        window.clearTimeout(immediateName._b2bValidationTimer);
        immediateName._b2bValidationTimer = window.setTimeout(function () {
          setFormControlError(immediateName, immediateName.value.trim().toLowerCase() === "hanna" ? "This user name has been used" : "");
        }, 500);
      }

      var numericInput = event.target.closest && event.target.closest("[data-number-input] > input");
      if (numericInput) {
        numericInput.value = numericInput.value.replace(/[^0-9.-]/g, "");
        updateNumberInputButtons(numericInput.closest("[data-number-input]"));
      }

      var otpInput = event.target.closest && event.target.closest("[data-otp-input] input");
      if (otpInput) {
        otpInput.value = otpInput.value.replace(/\D/g, "").slice(-1);
        if (otpInput.value) {
          var otpInputs = Array.from(otpInput.closest("[data-otp-input]").querySelectorAll("input"));
          var otpIndex = otpInputs.indexOf(otpInput);
          if (otpInputs[otpIndex + 1]) otpInputs[otpIndex + 1].focus();
        }
      }

      var countedTextarea = event.target.closest && event.target.closest("[data-textarea-count]");
      if (countedTextarea) {
        var countedRoot = countedTextarea.closest(".source-textarea");
        var countOutput = countedRoot.querySelector("[data-text-count]");
        if (countOutput) countOutput.textContent = String(countedTextarea.value.length);
        if (countedRoot.classList.contains("is-auto")) {
          countedTextarea.style.height = "auto";
          countedTextarea.style.height = Math.min(160, Math.max(32, countedTextarea.scrollHeight)) + "px";
        }
      }

      var countedInput = event.target.closest && event.target.closest("[data-input-count]");
      if (countedInput) {
        var countedInputRoot = countedInput.closest("[data-source-input]");
        var inputCountOutput = countedInputRoot && countedInputRoot.querySelector("[data-input-text-count]");
        if (inputCountOutput) inputCountOutput.textContent = String(countedInput.value.length);
      }
    });

    interactionRoot.addEventListener("focusout", function (event) {
      var blurredBreadcrumbMore = event.target.closest && event.target.closest("[data-breadcrumb-more]");
      if (blurredBreadcrumbMore && !(event.relatedTarget && blurredBreadcrumbMore.contains(event.relatedTarget))) setBreadcrumbMoreOpen(blurredBreadcrumbMore, false, false);
      var blurTimeInput = event.target.closest && event.target.closest("[data-time-trigger] input");
      if (blurTimeInput) validateTimePickerTextInput(blurTimeInput);
      var blurStepperInput = event.target.closest && event.target.closest("[data-stepper-input]");
      if (blurStepperInput) updateSourceStepper(blurStepperInput.closest("[data-source-stepper]"), blurStepperInput.value, true);
      var blurPaginationInput = event.target.closest && event.target.closest("[data-page-jump-input][data-pagination-commit-on-blur]");
      if (blurPaginationInput) commitPaginationInput(blurPaginationInput, false);
      var blurEmail = event.target.closest && event.target.closest('[data-form-validation="blur"] [data-validate-email]');
      if (blurEmail) setFormControlError(blurEmail, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(blurEmail.value.trim()) ? "" : "The email format is incorrect");
      var editRow = event.target.closest && event.target.closest("[data-table-editable-row][data-table-editing='true']");
      if (editRow) {
        window.setTimeout(function () {
          if (editRow.dataset.tableEditing === "true" && !editRow.contains(document.activeElement)) finishTableEdit(editRow, true, "blur", false);
        }, 0);
      }
    });

    interactionRoot.addEventListener("change", function (event) {
      var uploadInputChange = event.target.closest && event.target.closest("[data-upload-input]");
      if (uploadInputChange) {
        var uploadInputDemo = uploadInputChange.closest("[data-upload-demo]");
        if (!uploadDemoIsDisabled(uploadInputDemo)) addLocalUploadFiles(uploadInputDemo, uploadInputChange.files);
        uploadInputChange.value = "";
        return;
      }

      var timeTextChange = event.target.closest && event.target.closest("[data-time-trigger] input");
      if (timeTextChange) {
        validateTimePickerTextInput(timeTextChange);
        return;
      }

      var tableFilterOption = event.target.closest && event.target.closest("[data-table-filter-option]");
      if (tableFilterOption) {
        updateCheckboxControl(tableFilterOption);
        return;
      }

      var tableSelectAll = event.target.closest && event.target.closest("[data-demo-select-all]");
      if (tableSelectAll) {
        var selectAllTableRoot = tableSelectAll.closest("[data-table-demo]");
        tableDataRows(selectAllTableRoot).forEach(function (row) {
          var input = row.querySelector("[data-demo-row-select]");
          if (input && !input.disabled && !row.hidden) input.checked = tableSelectAll.checked;
        });
        syncTableSelection(selectAllTableRoot);
        selectAllTableRoot.dispatchEvent(new CustomEvent("b2b:table-select-all", { bubbles: true, detail: { checked: tableSelectAll.checked } }));
        return;
      }

      var tableRowSelect = event.target.closest && event.target.closest("[data-demo-row-select]");
      if (tableRowSelect) {
        var rowSelectTableRoot = tableRowSelect.closest("[data-table-demo]");
        syncTableSelection(rowSelectTableRoot);
        rowSelectTableRoot.dispatchEvent(new CustomEvent("b2b:table-selection-change", { bubbles: true, detail: { selected: rowSelectTableRoot.querySelectorAll("[data-demo-row-select]:checked").length } }));
        return;
      }

      var checkboxPickerInput = event.target.closest && event.target.closest("[data-checkbox-picker-value]");
      if (checkboxPickerInput) { renderCheckboxPicker(checkboxPickerInput.closest("[data-checkbox-picker]")); return; }

      var transferAll = event.target.closest && event.target.closest("[data-transfer-all]");
      if (transferAll) {
        var transferAllRoot = transferAll.closest("[data-transfer]");
        transferAllRoot.querySelectorAll("[data-transfer-choice]").forEach(function (choice) { if (!choice.disabled && !choice.closest(".transfer-choice").hidden) choice.checked = transferAll.checked; });
        renderTransfer(transferAllRoot);
        return;
      }
      var transferChoice = event.target.closest && event.target.closest("[data-transfer-choice]");
      if (transferChoice) { renderTransfer(transferChoice.closest("[data-transfer]")); return; }

      var treePeopleCheck = event.target.closest && event.target.closest("[data-tree-people-check]");
      if (treePeopleCheck) {
        var treePeopleCheckNode = treePeopleCheck.closest("[data-tree-people-node]");
        treePeopleCheckNode.querySelectorAll("[data-tree-people-check]").forEach(function (child) {
          child.checked = treePeopleCheck.checked;
          child.indeterminate = false;
          updateCheckboxControl(child);
        });
        if (treePeopleCheck.checked && treePeopleCheckNode.classList.contains("is-branch")) treePeopleCheckNode.classList.add("is-expanded");
        syncPeopleTreeAncestors(treePeopleCheck);
        renderPeopleSelection(treePeopleCheck.closest("[data-tree-people]"));
        return;
      }

      var treeCheck = event.target.closest && event.target.closest("[data-tree-check]");
      if (treeCheck) {
        var treeCheckNode = treeCheck.closest("[data-tree-node]");
        treeCheckNode.querySelectorAll("[data-tree-check]").forEach(function (child) {
          child.checked = treeCheck.checked;
          child.indeterminate = false;
          updateCheckboxControl(child);
        });
        if (treeCheck.checked) setTreeBranchExpanded(treeCheckNode.closest(".source-tree-branch"), true);
        syncTreeCheckAncestors(treeCheck);
        renderTreeSelection(treeCheck.closest("[data-tree-select]"));
        return;
      }
      var dialogFileChoice = event.target.closest && event.target.closest("[data-dialog-file-choice]");
      if (dialogFileChoice) {
        var dialogFileRoot = dialogFileChoice.closest(".source-dialog");
        var dialogSelectionCount = dialogFileRoot && dialogFileRoot.querySelector(".dialog-selection-count");
        if (dialogSelectionCount) {
          var selectedFiles = dialogFileRoot.querySelectorAll("[data-dialog-file-choice]:checked").length;
          dialogSelectionCount.innerHTML = "<b>" + selectedFiles + "</b> " + (selectedFiles === 1 ? "item selected" : "items selected");
        }
      }
      var radioInput = event.target.closest && event.target.closest('.radio-spec input[type="radio"], .radio-button input[type="radio"]');
      if (!radioInput) return;
      var radioScope = radioInput.closest('[role="radiogroup"]') || radioInput.parentElement.parentElement;
      radioScope.querySelectorAll(".radio-spec").forEach(function (label) {
        var selected = label.querySelector("input").checked;
        label.classList.toggle("is-selected", selected);
        label.classList.toggle("is-not-selected", !selected);
      });
      radioScope.querySelectorAll(".radio-button").forEach(function (label) {
        label.classList.toggle("is-selected", label.querySelector("input").checked);
      });
      var radioCalendarView = radioInput.closest("[data-radio-calendar-view]");
      var radioCalendarRoot = radioInput.closest("[data-radio-calendar]");
      if (radioCalendarView && radioCalendarRoot) radioCalendarRoot.dataset.view = radioInput.value;
    });

    interactionRoot.addEventListener("submit", function (event) {
      var form = event.target.closest && event.target.closest("[data-source-form]");
      if (!form) return;
      event.preventDefault();
      var mode = form.dataset.formValidation;
      var invalid = false;
      if (mode === "submit") {
        form.querySelectorAll(".form-field").forEach(function (field) {
          var control = field.querySelector("input, textarea, select, .select-shell, .source-select-trigger");
          var empty = control && (("value" in control && !control.value.trim()) || (control.classList && (control.classList.contains("select-shell") || control.classList.contains("source-select-trigger")) && /请选择/.test(control.textContent)));
          if (empty) {
            invalid = true;
            field.classList.add("is-error");
            if (control.setAttribute) control.setAttribute("aria-invalid", "true");
            var error = field.querySelector(".form-error");
            if (!error) {
              error = document.createElement("small");
              error.className = "form-error";
              error.setAttribute("role", "alert");
              error.textContent = "请完成此项";
              field.querySelector(".form-field-control").appendChild(error);
            }
          }
        });
      } else if (mode === "group") {
        var title = form.querySelector("[data-group-title]");
        var level = form.querySelector("[data-group-level]");
        var selectedLevel = level && level.querySelector("[data-select-option][aria-selected='true']");
        var levelValue = selectedLevel ? selectedLevel.dataset.value : (level && level.value || "");
        invalid = Boolean(title && level && /senior/i.test(title.value) && levelValue === "1-1");
      }
      var summary = form.querySelector(".form-error-summary");
      if (summary) summary.hidden = !invalid;
      if (!invalid) {
        var submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
          submitButton.textContent = "已提交";
          submitButton.disabled = true;
        }
      } else {
        var firstInvalid = form.querySelector('[aria-invalid="true"], .is-error input, .is-error button');
        if (firstInvalid) firstInvalid.focus();
      }
    });

    interactionRoot.addEventListener("pointerover", function (event) {
      var submenuOwner = event.target.closest && event.target.closest("[data-submenu-owner]");
      if (submenuOwner && submenuOwner.getAttribute("aria-disabled") !== "true" && c08CascadeRoot(submenuOwner)) {
        var submenuOwnerCursor = submenuOwner;
        while (submenuOwnerCursor) {
          window.clearTimeout(submenuOwnerCursor._c08SubmenuCloseTimer);
          submenuOwnerCursor._c08SubmenuCloseTimer = 0;
          var ancestorPanel = submenuOwnerCursor.parentElement && submenuOwnerCursor.parentElement.closest("[data-submenu-panel]");
          submenuOwnerCursor = ancestorPanel && ancestorPanel.parentElement;
        }
        if (!submenuOwner.contains(event.relatedTarget)) syncC08SubmenuState(submenuOwner, true, "pointer", true);
      }
      var hoverCascadeOption = event.target.closest && event.target.closest('[data-cascader-demo][data-cascade-expand="hover"] [data-cascade-option][data-cascade-child="true"]');
      if (hoverCascadeOption && !hoverCascadeOption.contains(event.relatedTarget)) {
        var hoverCascadeDemo = hoverCascadeOption.closest("[data-cascader-demo]");
        window.clearTimeout(hoverCascadeDemo._cascadeHoverTimer);
        hoverCascadeDemo._cascadeHoverTimer = window.setTimeout(function () { activateCascadeBranch(hoverCascadeOption); }, 180);
      }
      var hoverTrigger = event.target.closest && event.target.closest("[data-popup-hover]");
      var hoverRoot = hoverTrigger && hoverTrigger.closest("[data-popup-root]");
      if (!hoverRoot || isDirectRendererNode(hoverRoot) || hoverRoot.contains(event.relatedTarget)) return;
      closeOtherPopups(hoverRoot);
      setPopupState(hoverRoot, true, false);
    });

    interactionRoot.addEventListener("pointerenter", function (event) {
      var hoverTrigger = event.target.closest && event.target.closest("[data-popup-hover]");
      var hoverRoot = hoverTrigger && hoverTrigger.closest('[data-source-dropdown-menu][data-popup-root]');
      if (!hoverRoot || isDirectRendererNode(hoverRoot) || hoverRoot.contains(event.relatedTarget)) return;
      closeOtherPopups(hoverRoot);
      setPopupState(hoverRoot, true, false);
    }, true);

    interactionRoot.addEventListener("pointerout", function (event) {
      var submenuOwner = event.target.closest && event.target.closest("[data-submenu-owner]");
      var submenuCascadeRoot = submenuOwner && c08CascadeRoot(submenuOwner);
      if (submenuOwner && submenuOwner.getAttribute("aria-disabled") !== "true" && submenuCascadeRoot && !submenuOwner.contains(event.relatedTarget)) {
        window.clearTimeout(submenuOwner._c08SubmenuCloseTimer);
        submenuOwner._c08SubmenuCloseTimer = 0;
        if (!event.relatedTarget || !submenuCascadeRoot.contains(event.relatedTarget)) closeC08Submenus(submenuCascadeRoot, "pointer", true);
        else syncC08SubmenuState(submenuOwner, false, "pointer", true);
      }
      var leftCascadeOption = event.target.closest && event.target.closest('[data-cascader-demo][data-cascade-expand="hover"] [data-cascade-option][data-cascade-child="true"]');
      if (leftCascadeOption && !leftCascadeOption.contains(event.relatedTarget)) {
        var leftCascadeDemo = leftCascadeOption.closest("[data-cascader-demo]");
        window.clearTimeout(leftCascadeDemo._cascadeHoverTimer);
      }
      var hoverRoot = event.target.closest && event.target.closest("[data-popup-root].is-hover-trigger");
      if (!hoverRoot || isDirectRendererNode(hoverRoot) || hoverRoot.contains(event.relatedTarget)) return;
      setPopupState(hoverRoot, false, false);
    });

    function updateSlider(slider, clientX) {
      var rect = slider.getBoundingClientRect();
      var value = Math.max(0, Math.min(100, Math.round((clientX - rect.left) / rect.width * 100)));
      slider.style.setProperty("--slider-progress", value + "%");
      slider.setAttribute("aria-valuenow", String(value));
      var valueLabel = slider.closest(".slider-spec") && slider.closest(".slider-spec").querySelector(":scope > span");
      if (valueLabel) valueLabel.textContent = String(value);
    }

    (root || document).addEventListener("pointerdown", function (event) {
      var pointerRadioButton = event.target.closest && event.target.closest(".radio-button");
      if (pointerRadioButton) {
        pointerRadioButton.closest('[role="radiogroup"]').querySelectorAll(".radio-button").forEach(function (label) {
          label.classList.remove("is-keyboard-focus");
        });
      }

      var heldStepperButton = event.target.closest("[data-source-stepper] [data-stepper-step]:not(:disabled)");
      if (heldStepperButton) {
        window.clearInterval(heldStepperButton._b2bHoldTimer);
        heldStepperButton._b2bHoldTimer = window.setInterval(function () {
          if (!heldStepperButton.isConnected || heldStepperButton.disabled) return window.clearInterval(heldStepperButton._b2bHoldTimer);
          var heldStepperRoot = heldStepperButton.closest("[data-source-stepper]");
          var heldStepperInput = heldStepperRoot.querySelector("[data-stepper-input]");
          updateSourceStepper(heldStepperRoot, Number(heldStepperInput.value) + Number(heldStepperButton.dataset.stepperStep) * Number(heldStepperRoot.dataset.step || 1), true);
        }, 800);
      }

      var colorSurface = event.target.closest("[data-color-saturation]");
      if (colorSurface) {
        colorSurface.setPointerCapture(event.pointerId);
        colorSurface.classList.add("is-dragging");
        updateColorSaturation(colorSurface, event.clientX, event.clientY);
        event.preventDefault();
        return;
      }
      var colorRange = event.target.closest("[data-color-hue], [data-color-alpha]");
      if (colorRange) {
        colorRange.setPointerCapture(event.pointerId);
        colorRange.classList.add("is-dragging");
        updateColorRange(colorRange, event.clientX);
        event.preventDefault();
        return;
      }

      var scrollbarThumb = event.target.closest("[data-scrollbar-thumb]");
      if (scrollbarThumb) {
        var scrollbarThumbTrack = scrollbarThumb.closest("[data-scrollbar-track]");
        var scrollbarThumbRoot = scrollbarThumb.closest("[data-scrollbar-spec]");
        var scrollbarThumbViewport = scrollbarThumbRoot.querySelector("[data-scrollbar-viewport]");
        var scrollbarThumbHorizontal = scrollbarThumbTrack.dataset.axis === "horizontal";
        scrollbarThumb.setPointerCapture(event.pointerId);
        scrollbarThumb.classList.add("is-dragging");
        scrollbarThumb._b2bScrollDrag = {
          horizontal: scrollbarThumbHorizontal,
          startCoordinate: scrollbarThumbHorizontal ? event.clientX : event.clientY,
          startScroll: scrollbarThumbHorizontal ? scrollbarThumbViewport.scrollLeft : scrollbarThumbViewport.scrollTop,
          scrollRange: scrollbarThumbHorizontal ? scrollbarThumbViewport.scrollWidth - scrollbarThumbViewport.clientWidth : scrollbarThumbViewport.scrollHeight - scrollbarThumbViewport.clientHeight,
          thumbRange: (scrollbarThumbHorizontal ? scrollbarThumbTrack.clientWidth - scrollbarThumb.offsetWidth : scrollbarThumbTrack.clientHeight - scrollbarThumb.offsetHeight),
          viewport: scrollbarThumbViewport
        };
        event.preventDefault();
        return;
      }
      var navResizer = event.target.closest("[data-nav-resizer]");
      if (navResizer) {
        navResizer.setPointerCapture(event.pointerId);
        navResizer.classList.add("is-dragging");
        event.preventDefault();
        return;
      }
      var slider = event.target.closest(".slider:not(.is-range)");
      if (!slider) return;
      slider.setPointerCapture(event.pointerId);
      slider.classList.add("is-dragging");
      updateSlider(slider, event.clientX);
    });

    (root || document).addEventListener("pointermove", function (event) {
      var colorDraggingSurface = event.target.closest("[data-color-saturation].is-dragging");
      if (colorDraggingSurface) {
        updateColorSaturation(colorDraggingSurface, event.clientX, event.clientY);
        return;
      }
      var colorDraggingRange = event.target.closest("[data-color-hue].is-dragging, [data-color-alpha].is-dragging");
      if (colorDraggingRange) {
        updateColorRange(colorDraggingRange, event.clientX);
        return;
      }
      var scrollbarDraggingThumb = event.target.closest("[data-scrollbar-thumb].is-dragging");
      if (scrollbarDraggingThumb && scrollbarDraggingThumb._b2bScrollDrag) {
        var scrollbarDrag = scrollbarDraggingThumb._b2bScrollDrag;
        var scrollbarCoordinate = scrollbarDrag.horizontal ? event.clientX : event.clientY;
        var scrollbarNext = scrollbarDrag.startScroll + (scrollbarCoordinate - scrollbarDrag.startCoordinate) * scrollbarDrag.scrollRange / Math.max(scrollbarDrag.thumbRange, 1);
        if (scrollbarDrag.horizontal) scrollbarDrag.viewport.scrollLeft = scrollbarNext;
        else scrollbarDrag.viewport.scrollTop = scrollbarNext;
        return;
      }
      var navResizer = event.target.closest("[data-nav-resizer].is-dragging");
      if (navResizer) {
        var navToResize = navResizer.closest("[data-side-desktop-nav]");
        var navRect = navToResize.getBoundingClientRect();
        var navWidth = Math.max(220, Math.min(440, Math.round(event.clientX - navRect.left)));
        navToResize.style.setProperty("--side-desktop-width", navWidth + "px");
        navToResize.dataset.width = String(navWidth);
        navResizer.setAttribute("aria-valuenow", String(navWidth));
        return;
      }
      var slider = event.target.closest(".slider.is-dragging");
      if (slider) updateSlider(slider, event.clientX);
    });

    (root || document).addEventListener("pointerup", function (event) {
      var heldStepperButton = event.target.closest("[data-source-stepper] [data-stepper-step]");
      if (heldStepperButton) {
        window.clearInterval(heldStepperButton._b2bHoldTimer);
        heldStepperButton._b2bHoldTimer = null;
      }
      (root || document).querySelectorAll("[data-color-saturation].is-dragging, [data-color-hue].is-dragging, [data-color-alpha].is-dragging").forEach(function (control) {
        control.classList.remove("is-dragging");
        if (control.hasPointerCapture && control.hasPointerCapture(event.pointerId)) control.releasePointerCapture(event.pointerId);
      });
      var scrollbarDraggingThumb = event.target.closest("[data-scrollbar-thumb].is-dragging");
      if (scrollbarDraggingThumb) {
        scrollbarDraggingThumb.classList.remove("is-dragging");
        scrollbarDraggingThumb._b2bScrollDrag = null;
      }
      var navResizer = event.target.closest("[data-nav-resizer].is-dragging");
      if (navResizer) {
        navResizer.classList.remove("is-dragging");
        if (navResizer.hasPointerCapture && navResizer.hasPointerCapture(event.pointerId)) navResizer.releasePointerCapture(event.pointerId);
      }
      var slider = event.target.closest(".slider.is-dragging");
      if (slider) slider.classList.remove("is-dragging");
    });

    interactionRoot.addEventListener("pointerover", function (event) {
      var visualizationMark = event.target.closest && event.target.closest("[data-chart-mark]");
      if (visualizationMark && !visualizationMark.closest(".viz-c18") && !visualizationMark.classList.contains("is-series-hidden")) showVisualizationTooltip(visualizationMark, false);
    });

    interactionRoot.addEventListener("pointerout", function (event) {
      var visualizationMark = event.target.closest && event.target.closest("[data-chart-mark]");
      if (!visualizationMark || visualizationMark.closest(".viz-c18") || event.relatedTarget && visualizationMark.contains(event.relatedTarget)) return;
      visualizationMark.classList.remove("is-hovered");
      hideVisualizationTooltip(visualizationMark, false);
    });

    interactionRoot.addEventListener("focusin", function (event) {
      var visualizationControl = event.target.closest && event.target.closest("[data-chart-mark]");
      if (visualizationControl && !visualizationControl.closest(".viz-c18") && !visualizationControl.classList.contains("is-series-hidden")) showVisualizationTooltip(visualizationControl, false);
    });

    interactionRoot.addEventListener("focusout", function (event) {
      var visualizationControl = event.target.closest && event.target.closest("[data-chart-mark]");
      if (!visualizationControl || visualizationControl.closest(".viz-c18")) return;
      visualizationControl.classList.remove("is-hovered");
      hideVisualizationTooltip(visualizationControl, false);
    });

    (root || document).addEventListener("keydown", function (event) {
      /* C-34 uses a native button and therefore relies on the browser's own
       * Enter/Space activation. Only legacy non-native-trigger branches need
       * the synthetic click bridge here. */
      var batch6NativeButton = event.target.closest && event.target.closest("[data-accordion-trigger]:not(:disabled), [data-popover-trigger]:not(:disabled)");
      if (batch6NativeButton && (event.key === "Enter" || event.key === " ")) {
        batch6NativeButton.click();
        event.preventDefault();
        return;
      }

      var sourceFloatingKeyRoot = event.target.closest && event.target.closest("[data-source-floating][data-floating-menu].is-expanded");
      if (sourceFloatingKeyRoot && event.key === "Escape") {
        setSourceFloatingOpen(sourceFloatingKeyRoot, false, true, "escape");
        event.preventDefault();
        return;
      }

      var scrollbarKeyThumb = event.target.closest && event.target.closest("[data-scrollbar-thumb]:not(:disabled)");
      if (scrollbarKeyThumb && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].indexOf(event.key) >= 0) {
        var scrollbarKeyTrack = scrollbarKeyThumb.closest("[data-scrollbar-track]");
        var scrollbarKeyRoot = scrollbarKeyThumb.closest("[data-scrollbar-spec]");
        var scrollbarKeyViewport = scrollbarKeyRoot && scrollbarKeyRoot.querySelector("[data-scrollbar-viewport]");
        var scrollbarKeyHorizontal = scrollbarKeyTrack && scrollbarKeyTrack.dataset.axis === "horizontal";
        var scrollbarKeyCurrent = scrollbarKeyHorizontal ? scrollbarKeyViewport.scrollLeft : scrollbarKeyViewport.scrollTop;
        var scrollbarKeyMaximum = scrollbarKeyHorizontal
          ? scrollbarKeyViewport.scrollWidth - scrollbarKeyViewport.clientWidth
          : scrollbarKeyViewport.scrollHeight - scrollbarKeyViewport.clientHeight;
        var scrollbarKeyPage = scrollbarKeyHorizontal ? scrollbarKeyViewport.clientWidth : scrollbarKeyViewport.clientHeight;
        var scrollbarKeyForward = event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown";
        var scrollbarKeyStep = event.key === "PageUp" || event.key === "PageDown" ? scrollbarKeyPage : 40;
        var scrollbarKeyNext = event.key === "Home"
          ? 0
          : (event.key === "End" ? scrollbarKeyMaximum : scrollbarKeyCurrent + (scrollbarKeyForward ? scrollbarKeyStep : -scrollbarKeyStep));
        if (scrollbarKeyHorizontal) scrollbarKeyViewport.scrollLeft = scrollbarKeyNext;
        else scrollbarKeyViewport.scrollTop = scrollbarKeyNext;
        event.preventDefault();
        return;
      }

      var radioButtonKeyInput = event.target.closest && event.target.closest('.radio-button input[type="radio"]:not(:disabled)');
      if (radioButtonKeyInput && ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Home", "End"].indexOf(event.key) >= 0) {
        var radioButtonKeyGroup = radioButtonKeyInput.closest('[role="radiogroup"]');
        var radioButtonKeyOptions = Array.from(radioButtonKeyGroup.querySelectorAll('.radio-button input[type="radio"]:not(:disabled)'));
        var radioButtonKeyIndex = radioButtonKeyOptions.indexOf(radioButtonKeyInput);
        var radioButtonKeyNext = event.key === "Home"
          ? 0
          : (event.key === "End"
            ? radioButtonKeyOptions.length - 1
            : (radioButtonKeyIndex + (["ArrowRight", "ArrowDown"].indexOf(event.key) >= 0 ? 1 : -1) + radioButtonKeyOptions.length) % radioButtonKeyOptions.length);
        radioButtonKeyGroup.querySelectorAll(".radio-button").forEach(function (label) {
          label.classList.remove("is-keyboard-focus");
        });
        radioButtonKeyOptions[radioButtonKeyNext].closest(".radio-button").classList.add("is-keyboard-focus");
        radioButtonKeyOptions[radioButtonKeyNext].click();
        radioButtonKeyOptions[radioButtonKeyNext].focus();
        event.preventDefault();
        return;
      }

      var sourceTagKeyTarget = event.target.closest && event.target.closest("[data-source-tag-check]:not(:disabled)");
      if (sourceTagKeyTarget && (event.key === "Enter" || event.key === " ")) {
        sourceTagKeyTarget.click();
        event.preventDefault();
        return;
      }

      var uploadPreviewDialog = document.querySelector("[data-upload-preview-dialog]");
      if (uploadPreviewDialog && event.key === "Escape") {
        closeUploadPreview(uploadPreviewDialog);
        event.preventDefault();
        return;
      }
      if (event.key === "Escape") {
        var openDemoDialog = document.querySelector("dialog[data-demo-dialog][open]");
        if (openDemoDialog) {
          closeDemoDialog(openDemoDialog, "escape");
          event.preventDefault();
          return;
        }
        var openSourcePopover = event.target.closest && event.target.closest("[data-popover-demo].is-open");
        if (!openSourcePopover) openSourcePopover = interactionRoot.querySelector("[data-popover-demo].is-open");
        if (openSourcePopover) {
          setSourcePopoverStatus(openSourcePopover, "");
          setSourcePopoverOpen(openSourcePopover, false, true);
          event.preventDefault();
          return;
        }
      }
      var uploadFileKeyTarget = event.target.closest && event.target.closest("[data-upload-file].is-complete");
      if (uploadFileKeyTarget && (event.key === "Enter" || event.key === " ")) {
        openUploadPreview(uploadFileKeyTarget);
        event.preventDefault();
        return;
      }
      var uploadDropKeyTarget = event.target.closest && event.target.closest("[data-upload-demo] [data-upload-drop]");
      if (uploadDropKeyTarget && (event.key === "Enter" || event.key === " ")) {
        if (!uploadEntryIsDisabled(uploadDropKeyTarget)) startUploadSimulation(uploadDropKeyTarget.matches("[data-upload-start]") ? uploadDropKeyTarget : uploadDropKeyTarget.querySelector("[data-upload-start]"));
        event.preventDefault();
        return;
      }
      var visualizationKeyControl = event.target.closest && event.target.closest("[data-chart-mark], [data-chart-legend]");
      if (visualizationKeyControl && !isDirectRendererNode(visualizationKeyControl) && (event.key === "Enter" || event.key === " ")) {
        /* SVG graphics elements do not consistently expose HTMLElement.click().
         * Dispatch the same composed pointer event for both SVG marks and HTML
         * controls so the canonical document-delegated interaction stays valid. */
        if (typeof visualizationKeyControl.click === "function") visualizationKeyControl.click();
        else visualizationKeyControl.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true, view: window }));
        event.preventDefault();
        return;
      }
      if (visualizationKeyControl && !isDirectRendererNode(visualizationKeyControl) && visualizationKeyControl.matches("[data-chart-legend]") && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        var visualizationLegendItems = Array.from(visualizationKeyControl.closest(".viz-svg-legend").querySelectorAll("[data-chart-legend]"));
        var visualizationLegendIndex = visualizationLegendItems.indexOf(visualizationKeyControl);
        var visualizationLegendNext = (visualizationLegendIndex + (event.key === "ArrowRight" ? 1 : -1) + visualizationLegendItems.length) % visualizationLegendItems.length;
        visualizationLegendItems[visualizationLegendNext].focus();
        event.preventDefault();
        return;
      }
      var colorSaturationKeyTarget = event.target.closest && event.target.closest("[data-color-saturation][role='slider']");
      if (colorSaturationKeyTarget && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].indexOf(event.key) >= 0) {
        var colorSaturationKeyRoot = colorSaturationKeyTarget.closest("[data-color-picker]");
        var colorSaturationKeyState = currentColorState(colorSaturationKeyRoot);
        var colorSaturationKeyStep = event.shiftKey ? 10 : 1;
        if (event.key === "ArrowLeft") colorSaturationKeyState.s -= colorSaturationKeyStep;
        if (event.key === "ArrowRight") colorSaturationKeyState.s += colorSaturationKeyStep;
        if (event.key === "ArrowUp") colorSaturationKeyState.v += colorSaturationKeyStep;
        if (event.key === "ArrowDown") colorSaturationKeyState.v -= colorSaturationKeyStep;
        if (event.key === "Home") colorSaturationKeyState.s = 0;
        if (event.key === "End") colorSaturationKeyState.s = 100;
        applyColorState(colorSaturationKeyRoot, { s: colorSaturationKeyState.s, v: colorSaturationKeyState.v }, false);
        event.preventDefault();
        return;
      }
      var colorGridKeyTarget = event.target.closest && event.target.closest("[data-color-grid] .swatch:not(:disabled)");
      if (colorGridKeyTarget && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].indexOf(event.key) >= 0) {
        var colorGridKeyRoot = colorGridKeyTarget.closest("[data-color-grid]");
        var colorGridKeyItems = Array.from(colorGridKeyRoot.querySelectorAll(".swatch:not(:disabled)"));
        var colorGridKeyIndex = colorGridKeyItems.indexOf(colorGridKeyTarget);
        var colorGridKeyColumns = 6;
        if (event.key === "ArrowLeft") colorGridKeyIndex -= 1;
        if (event.key === "ArrowRight") colorGridKeyIndex += 1;
        if (event.key === "ArrowUp") colorGridKeyIndex -= colorGridKeyColumns;
        if (event.key === "ArrowDown") colorGridKeyIndex += colorGridKeyColumns;
        if (event.key === "Home") colorGridKeyIndex = 0;
        if (event.key === "End") colorGridKeyIndex = colorGridKeyItems.length - 1;
        colorGridKeyIndex = (colorGridKeyIndex + colorGridKeyItems.length) % colorGridKeyItems.length;
        colorGridKeyItems.forEach(function (item, index) { item.tabIndex = index === colorGridKeyIndex ? 0 : -1; });
        colorGridKeyItems[colorGridKeyIndex].focus();
        colorGridKeyRoot.setAttribute("aria-activedescendant", colorGridKeyItems[colorGridKeyIndex].id);
        event.preventDefault();
        return;
      }
      var colorButtonKeyTarget = event.target.closest && event.target.closest("[data-color-picker-control] > [data-color-trigger]:not(:disabled), [data-simple-color-picker] [data-color-trigger]:not(:disabled), [data-color-picker] [data-color-more]:not(:disabled), [data-color-picker] .color-grid .swatch:not(:disabled)");
      if (colorButtonKeyTarget && (event.key === "Enter" || event.key === " ")) {
        colorButtonKeyTarget.click();
        event.preventDefault();
        return;
      }
      var openSimpleColor = event.target.closest && event.target.closest("[data-simple-color-picker].is-open");
      if (openSimpleColor && event.key === "Escape") {
        setSimpleColorOpen(openSimpleColor, false, true);
        event.preventDefault();
        return;
      }

      var openColorPicker = event.target.closest && event.target.closest("[data-color-picker-control].is-open");
      if (openColorPicker && event.key === "Escape") {
        setColorPickerOpen(openColorPicker, false, true);
        event.preventDefault();
        return;
      }

      var openColorCustom = event.target.closest && event.target.closest("[data-color-picker].is-custom-open");
      if (openColorCustom && event.key === "Escape") {
        setColorCustomOpen(openColorCustom, false, true);
        event.preventDefault();
        return;
      }

      var timeTriggerKey = event.target.closest && event.target.closest("[data-time-trigger] input");
      if (timeTriggerKey && ["ArrowDown", "ArrowUp", "Enter", "Escape"].indexOf(event.key) >= 0) {
        var timeTriggerKeyRoot = timeTriggerKey.closest("[data-time-picker]");
        if (event.key === "Escape") {
          if (timeTriggerKeyRoot.dataset.footer === "true") restoreTimePickerState(timeTriggerKeyRoot);
          else commitTimePickerState(timeTriggerKeyRoot);
          setTimePickerOpen(timeTriggerKeyRoot, false, true, false);
        } else if (event.key === "Enter" && timeTriggerKeyRoot.classList.contains("is-open") && timeTriggerKeyRoot.dataset.footer === "true" && timeTriggerKey.value) {
          if (validateTimePickerTextInput(timeTriggerKey)) {
            commitTimePickerState(timeTriggerKeyRoot);
            setTimePickerOpen(timeTriggerKeyRoot, false, true, false);
          }
        } else {
          closeOtherTimePickers(timeTriggerKeyRoot);
          setTimePickerOpen(timeTriggerKeyRoot, true, false, true);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            var timeTriggerColumn = timeTriggerKeyRoot.querySelector(".time-column");
            var timeTriggerOptions = timeTriggerColumn ? Array.from(timeTriggerColumn.querySelectorAll("[data-time-value]:not(:disabled)")) : [];
            var timeTriggerSelected = timeTriggerColumn && timeTriggerColumn.querySelector("[data-time-value].is-selected:not(:disabled)");
            var timeTriggerTarget = timeTriggerSelected || (event.key === "ArrowUp" ? timeTriggerOptions[timeTriggerOptions.length - 1] : timeTriggerOptions[0]);
            if (timeTriggerTarget) timeTriggerTarget.focus();
          }
        }
        event.preventDefault();
        return;
      }

      var timeOptionKey = event.target.closest && event.target.closest("[data-time-value]:not(:disabled)");
      if (timeOptionKey && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", " ", "Escape"].indexOf(event.key) >= 0) {
        var timeOptionKeyRoot = timeOptionKey.closest("[data-time-picker]");
        var timeOptionColumn = timeOptionKey.closest(".time-column");
        var timeOptionColumns = Array.from(timeOptionColumn.parentElement.querySelectorAll(":scope > .time-column"));
        var timeOptionColumnIndex = timeOptionColumns.indexOf(timeOptionColumn);
        var timeOptionItems = Array.from(timeOptionColumn.querySelectorAll("[data-time-value]:not(:disabled)"));
        var timeOptionIndex = timeOptionItems.indexOf(timeOptionKey);
        if (event.key === "Enter" || event.key === " ") timeOptionKey.click();
        else if (event.key === "Escape") {
          if (timeOptionKeyRoot.dataset.footer === "true") restoreTimePickerState(timeOptionKeyRoot);
          else commitTimePickerState(timeOptionKeyRoot);
          setTimePickerOpen(timeOptionKeyRoot, false, true, false);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          var adjacentIndex = timeOptionColumnIndex + (event.key === "ArrowRight" ? 1 : -1);
          var adjacentColumn = timeOptionColumns[adjacentIndex];
          if (adjacentColumn) {
            var adjacentTarget = adjacentColumn.querySelector("[data-time-value].is-selected:not(:disabled), [data-time-value]:not(:disabled)");
            if (adjacentTarget) adjacentTarget.focus();
          }
        } else {
          var timeOptionNext = event.key === "Home" ? 0 : (event.key === "End" ? timeOptionItems.length - 1 : (event.key === "ArrowDown" ? (timeOptionIndex + 1) % timeOptionItems.length : (timeOptionIndex - 1 + timeOptionItems.length) % timeOptionItems.length));
          var timeOptionTarget = timeOptionItems[timeOptionNext];
          if (timeOptionTarget) {
            setTimePickerColumnValue(timeOptionColumn, timeOptionTarget.dataset.timeValue);
            renderTimePicker(timeOptionKeyRoot);
            scrollTimePickerSelections(timeOptionKeyRoot);
            if (timeOptionKeyRoot.dataset.footer !== "true") commitTimePickerState(timeOptionKeyRoot);
            timeOptionTarget.focus();
          }
        }
        event.preventDefault();
        return;
      }

      var treeRemoveKey = event.target.closest && event.target.closest("[data-tree-remove]");
      if (treeRemoveKey && (event.key === "Enter" || event.key === " ")) {
        treeRemoveKey.click();
        event.preventDefault();
        return;
      }

      var treeClearKey = event.target.closest && event.target.closest("[data-tree-clear]");
      if (treeClearKey && (event.key === "Enter" || event.key === " ")) {
        treeClearKey.click();
        event.preventDefault();
        return;
      }

      var treeTriggerKey = event.target.closest && event.target.closest("[data-tree-trigger]");
      if (treeTriggerKey && ["ArrowDown", "ArrowUp", "Enter", " ", "Escape"].indexOf(event.key) >= 0) {
        var treeTriggerKeyRoot = treeTriggerKey.closest("[data-tree-select]");
        if (event.key === "Escape") setTreeSelectOpen(treeTriggerKeyRoot, false, true, true);
        else if (event.key === "ArrowDown" || event.key === "ArrowUp") setTreeSelectOpen(treeTriggerKeyRoot, true, true, true);
        else setTreeSelectOpen(treeTriggerKeyRoot, !treeTriggerKeyRoot.classList.contains("is-open"), false, true);
        event.preventDefault();
        return;
      }

      var treeSearchKey = event.target.closest && event.target.closest("[data-tree-search]");
      if (treeSearchKey && event.key === "Escape") {
        setTreeSelectOpen(treeSearchKey.closest("[data-tree-select]"), false, true, true);
        event.preventDefault();
        return;
      }
      if (treeSearchKey && event.key === "ArrowDown") {
        var treeSearchKeyControls = visibleTreeControls(treeSearchKey.closest("[data-tree-select]"));
        if (treeSearchKeyControls.length) treeSearchKeyControls[0].focus();
        event.preventDefault();
        return;
      }

      var treeChoiceKey = event.target.closest && event.target.closest("[data-tree-choice], [data-tree-check]");
      if (treeChoiceKey && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End", "Enter", " ", "Escape"].indexOf(event.key) >= 0) {
        var treeKeyRoot = treeChoiceKey.closest("[data-tree-select]");
        var treeKeyChoices = visibleTreeControls(treeKeyRoot);
        var treeKeyIndex = treeKeyChoices.indexOf(treeChoiceKey);
        if (event.key === "Escape") setTreeSelectOpen(treeKeyRoot, false, true, true);
        else if (event.key === "ArrowDown" || event.key === "ArrowUp") treeKeyChoices[(treeKeyIndex + (event.key === "ArrowDown" ? 1 : -1) + treeKeyChoices.length) % treeKeyChoices.length].focus();
        else if (event.key === "Home" || event.key === "End") treeKeyChoices[event.key === "Home" ? 0 : treeKeyChoices.length - 1].focus();
        else if (event.key === "Enter" || event.key === " ") treeChoiceKey.click();
        else {
          var treeKeyNode = treeChoiceKey.closest("[data-tree-node]");
          var treeKeyExpand = treeKeyNode.querySelector(":scope > .source-tree-row [data-tree-expand]");
          if (treeKeyExpand && ((event.key === "ArrowRight" && !treeKeyNode.classList.contains("is-expanded")) || (event.key === "ArrowLeft" && treeKeyNode.classList.contains("is-expanded")))) treeKeyExpand.click();
        }
        event.preventDefault();
        return;
      }

      var stepperInputKey = event.target.closest && event.target.closest("[data-stepper-input]");
      if (stepperInputKey && ["ArrowUp", "ArrowDown", "Home", "End"].indexOf(event.key) >= 0) {
        var stepperKeyRoot = stepperInputKey.closest("[data-source-stepper]");
        var stepperKeyValue = Number(stepperInputKey.value || stepperKeyRoot.dataset.min);
        if (event.key === "Home") stepperKeyValue = Number(stepperKeyRoot.dataset.min);
        else if (event.key === "End") stepperKeyValue = Number(stepperKeyRoot.dataset.max);
        else stepperKeyValue += (event.key === "ArrowUp" ? 1 : -1) * Number(stepperKeyRoot.dataset.step || 1);
        updateSourceStepper(stepperKeyRoot, stepperKeyValue, true);
        event.preventDefault();
        return;
      }

      var ratingKeyStar = event.target.closest && event.target.closest("[data-rating-value]:not(:disabled)");
      if (ratingKeyStar && (["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End", "Enter", " "].indexOf(event.key) >= 0 || /^[1-5]$/.test(event.key))) {
        var ratingKeyRoot = ratingKeyStar.closest("[data-rating]");
        var ratingKeyStars = Array.from(ratingKeyRoot.querySelectorAll("[data-rating-value]:not(:disabled)"));
        var ratingKeyStep = Number(ratingKeyRoot.dataset.step) === 0.5 ? 0.5 : 1;
        if (event.key === "Enter" || event.key === " ") ratingKeyStar.click();
        else if (/^[1-5]$/.test(event.key)) {
          var ratingNumberStar = ratingKeyStars[Number(event.key) - 1];
          updateRating(ratingKeyRoot, Number(event.key));
          if (ratingNumberStar) ratingNumberStar.focus();
        } else {
          var ratingKeyCurrent = Number(ratingKeyRoot.dataset.value || 0);
          var ratingKeyValue = event.key === "Home"
            ? ratingKeyStep
            : (event.key === "End"
              ? 5
              : Math.max(ratingKeyStep, Math.min(5, ratingKeyCurrent + (["ArrowRight", "ArrowUp"].indexOf(event.key) >= 0 ? ratingKeyStep : -ratingKeyStep))));
          var ratingKeyFocusIndex = Math.max(0, Math.min(ratingKeyStars.length - 1, Math.ceil(ratingKeyValue) - 1));
          ratingKeyStars[ratingKeyFocusIndex].focus();
          updateRating(ratingKeyRoot, ratingKeyValue);
        }
        event.preventDefault();
        return;
      }

      var sourceSelectRemoveKey = event.target.closest && event.target.closest("[data-select-remove]");
      if (sourceSelectRemoveKey && (event.key === "Enter" || event.key === " ")) {
        sourceSelectRemoveKey.click();
        event.preventDefault();
        return;
      }

      var sourceSelectTriggerKey = event.target.closest && event.target.closest("[data-select-trigger]:not(:disabled)");
      if (sourceSelectTriggerKey && ["ArrowDown", "ArrowUp", "Enter", " ", "Escape"].indexOf(event.key) >= 0) {
        var sourceSelectTriggerRoot = sourceSelectTriggerKey.closest("[data-select-demo]");
        if (event.key === "Escape") setSourceSelectOpen(sourceSelectTriggerRoot, false, false);
        else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          setSourceSelectOpen(sourceSelectTriggerRoot, true, false);
          var sourceSelectTriggerOptions = Array.from(sourceSelectTriggerRoot.querySelectorAll("[data-select-option]:not(:disabled):not([hidden])"));
          var sourceSelectTriggerTarget = event.key === "ArrowUp" ? sourceSelectTriggerOptions[sourceSelectTriggerOptions.length - 1] : sourceSelectTriggerOptions[0];
          if (sourceSelectTriggerTarget) sourceSelectTriggerTarget.focus();
        } else setSourceSelectOpen(sourceSelectTriggerRoot, !sourceSelectTriggerRoot.classList.contains("is-open"), false);
        event.preventDefault();
        return;
      }

      var sourceSelectOptionKey = event.target.closest && event.target.closest("[data-select-option]:not(:disabled)");
      if (sourceSelectOptionKey && ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].indexOf(event.key) >= 0) {
        var sourceSelectOptionRoot = sourceSelectOptionKey.closest("[data-select-demo]");
        markSourceSelectAsCurrent(sourceSelectOptionRoot);
        var sourceSelectOptionItems = Array.from(sourceSelectOptionRoot.querySelectorAll("[data-select-option]:not(:disabled):not([hidden])"));
        var sourceSelectOptionIndex = sourceSelectOptionItems.indexOf(sourceSelectOptionKey);
        if (event.key === "Enter" || event.key === " ") chooseSourceSelectOption(sourceSelectOptionKey);
        else if (event.key === "Escape") {
          setSourceSelectOpen(sourceSelectOptionRoot, false, false);
          sourceSelectOptionRoot.querySelector("[data-select-trigger]").focus();
        } else {
          var sourceSelectOptionNext = event.key === "Home" ? 0 : (event.key === "End" ? sourceSelectOptionItems.length - 1 : (event.key === "ArrowDown" ? (sourceSelectOptionIndex + 1) % sourceSelectOptionItems.length : (sourceSelectOptionIndex - 1 + sourceSelectOptionItems.length) % sourceSelectOptionItems.length));
          sourceSelectOptionItems.forEach(function (option, index) { option.classList.toggle("is-active", index === sourceSelectOptionNext); });
          sourceSelectOptionItems[sourceSelectOptionNext].focus();
        }
        event.preventDefault();
        return;
      }

      var keyboardOtp = event.target.closest && event.target.closest("[data-otp-input] input");
      if (keyboardOtp && event.key === "Backspace" && !keyboardOtp.value) {
        var keyboardOtpInputs = Array.from(keyboardOtp.closest("[data-otp-input]").querySelectorAll("input"));
        var keyboardOtpIndex = keyboardOtpInputs.indexOf(keyboardOtp);
        if (keyboardOtpInputs[keyboardOtpIndex - 1]) {
          keyboardOtpInputs[keyboardOtpIndex - 1].value = "";
          keyboardOtpInputs[keyboardOtpIndex - 1].focus();
          event.preventDefault();
        }
        return;
      }

      var keyboardAnchor = event.target.closest && event.target.closest(".anchor-spec [data-anchor-target]:not(:disabled)");
      if (keyboardAnchor && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].indexOf(event.key) >= 0) {
        var keyboardAnchorItems = Array.from(keyboardAnchor.closest(".anchor-spec").querySelectorAll("[data-anchor-target]:not(:disabled)"));
        var keyboardAnchorIndex = keyboardAnchorItems.indexOf(keyboardAnchor);
        var keyboardAnchorNext = event.key === "Home" ? 0 : (event.key === "End" ? keyboardAnchorItems.length - 1 : ((event.key === "ArrowRight" || event.key === "ArrowDown") ? (keyboardAnchorIndex + 1) % keyboardAnchorItems.length : (keyboardAnchorIndex - 1 + keyboardAnchorItems.length) % keyboardAnchorItems.length));
        keyboardAnchorItems[keyboardAnchorNext].focus();
        event.preventDefault();
        return;
      }

      var pageJumpInput = event.target.closest && event.target.closest("[data-page-jump-input]");
      if (pageJumpInput && event.key === "Enter") {
        commitPaginationInput(pageJumpInput, true);
        event.preventDefault();
        return;
      }

      var keyboardStep = event.target.closest && event.target.closest(".steps:not(.is-static) li");
      if (keyboardStep && ["Enter", " ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].indexOf(event.key) >= 0) {
        var keyboardSteps = Array.from(keyboardStep.parentElement.children);
        var keyboardStepIndex = keyboardSteps.indexOf(keyboardStep);
        var keyboardForm = keyboardStep.closest("[data-form-steps]");
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].indexOf(event.key) >= 0) {
          var stepForward = event.key === "ArrowRight" || event.key === "ArrowDown";
          var nextStepIndex = event.key === "Home" ? 0 : (event.key === "End" ? keyboardSteps.length - 1 : (stepForward ? (keyboardStepIndex + 1) % keyboardSteps.length : (keyboardStepIndex - 1 + keyboardSteps.length) % keyboardSteps.length));
          if (keyboardForm) keyboardSteps.forEach(function (item, index) { item.tabIndex = index === nextStepIndex ? 0 : -1; });
          keyboardSteps[nextStepIndex].focus();
        } else {
          activateStep(keyboardStep);
          if (keyboardForm && keyboardStep.hasAttribute("data-step-target")) setFormStep(keyboardForm, keyboardStep.dataset.stepTarget);
        }
        event.preventDefault();
        return;
      }

      var breadcrumbKeyboardTrigger = event.target.closest && event.target.closest("[data-breadcrumb-more] > button");
      if (breadcrumbKeyboardTrigger && ["ArrowDown", "Enter", " ", "Escape"].indexOf(event.key) >= 0) {
        var breadcrumbKeyboardRoot = breadcrumbKeyboardTrigger.closest("[data-breadcrumb-more]");
        if (event.key === "Escape") setBreadcrumbMoreOpen(breadcrumbKeyboardRoot, false, false);
        else setBreadcrumbMoreOpen(breadcrumbKeyboardRoot, true, true, "keyboard");
        event.preventDefault();
        return;
      }

      var breadcrumbKeyboardItem = event.target.closest && event.target.closest(".breadcrumb-history [role='menuitem']");
      if (breadcrumbKeyboardItem && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Escape", "Home", "End"].indexOf(event.key) >= 0) {
        var breadcrumbKeyboardMore = breadcrumbKeyboardItem.closest("[data-breadcrumb-more]");
        var breadcrumbKeyboardItems = Array.from(breadcrumbKeyboardMore.querySelectorAll(".breadcrumb-history [role='menuitem']"));
        var breadcrumbKeyboardIndex = breadcrumbKeyboardItems.indexOf(breadcrumbKeyboardItem);
        if (event.key === "Escape") {
          var breadcrumbKeyboardMoreTrigger = breadcrumbKeyboardMore.querySelector(":scope > button");
          setBreadcrumbMoreOpen(breadcrumbKeyboardMore, false, false);
          breadcrumbKeyboardMoreTrigger.focus();
        } else {
          var breadcrumbForward = event.key === "ArrowDown" || event.key === "ArrowRight";
          var breadcrumbKeyboardNext = event.key === "Home" ? 0 : (event.key === "End" ? breadcrumbKeyboardItems.length - 1 : (breadcrumbForward ? (breadcrumbKeyboardIndex + 1) % breadcrumbKeyboardItems.length : (breadcrumbKeyboardIndex - 1 + breadcrumbKeyboardItems.length) % breadcrumbKeyboardItems.length));
          breadcrumbKeyboardItems[breadcrumbKeyboardNext].focus();
        }
        event.preventDefault();
        return;
      }

      var topMoreKeyboardButton = event.target.closest && event.target.closest("[data-top-nav-more] > .top-nav-tab");
      if (topMoreKeyboardButton && event.key === "Escape" && topMoreKeyboardButton.getAttribute("aria-expanded") === "true") {
        setTopNavMenuOpen(topMoreKeyboardButton.closest("[data-top-nav-more]"), false, false);
        event.preventDefault();
        return;
      }
      if (topMoreKeyboardButton && event.key === "ArrowDown") {
        var topMoreKeyboardRoot = topMoreKeyboardButton.closest("[data-top-nav-more]");
        interactionRoot.querySelectorAll("[data-top-nav-more]").forEach(function (more) {
          if (more !== topMoreKeyboardRoot) setTopNavMenuOpen(more, false, false);
        });
        setTopNavMenuOpen(topMoreKeyboardRoot, true, true);
        event.preventDefault();
        return;
      }

      var topMenuKeyboardItem = event.target.closest && event.target.closest(".top-nav-menu [role='menuitem']");
      if (topMenuKeyboardItem && ["ArrowDown", "ArrowUp", "Escape"].indexOf(event.key) >= 0) {
        var topMenuKeyboardRoot = topMenuKeyboardItem.closest("[data-top-nav-more]");
        var topMenuKeyboardItems = Array.from(topMenuKeyboardRoot.querySelectorAll("[role='menuitem']"));
        if (event.key === "Escape") {
          var topMenuKeyboardTrigger = topMenuKeyboardRoot.querySelector(":scope > .top-nav-tab");
          setTopNavMenuOpen(topMenuKeyboardRoot, false, false);
          topMenuKeyboardTrigger.focus();
        } else {
          var topMenuKeyboardIndex = topMenuKeyboardItems.indexOf(topMenuKeyboardItem);
          var topMenuKeyboardNext = event.key === "ArrowDown" ? (topMenuKeyboardIndex + 1) % topMenuKeyboardItems.length : (topMenuKeyboardIndex - 1 + topMenuKeyboardItems.length) % topMenuKeyboardItems.length;
          topMenuKeyboardItems[topMenuKeyboardNext].focus();
        }
        event.preventDefault();
        return;
      }

      var topKeyboardTab = event.target.closest && event.target.closest(".top-navigation-tabs .top-nav-tab");
      if (topKeyboardTab && ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) >= 0) {
        var topKeyboardTabs = Array.from(topKeyboardTab.closest(".top-navigation-tabs").querySelectorAll(":scope > .top-nav-tab, :scope > .top-nav-more > .top-nav-tab"));
        var topKeyboardIndex = topKeyboardTabs.indexOf(topKeyboardTab);
        var topKeyboardNext = event.key === "Home" ? 0 : (event.key === "End" ? topKeyboardTabs.length - 1 : (event.key === "ArrowRight" ? (topKeyboardIndex + 1) % topKeyboardTabs.length : (topKeyboardIndex - 1 + topKeyboardTabs.length) % topKeyboardTabs.length));
        topKeyboardTabs[topKeyboardNext].focus();
        event.preventDefault();
        return;
      }

      var keyboardNavResizer = event.target.closest && event.target.closest("[data-nav-resizer]");
      if (keyboardNavResizer && ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) >= 0) {
        var keyboardResizeNav = keyboardNavResizer.closest("[data-side-desktop-nav]");
        var currentNavWidth = Number(keyboardResizeNav.dataset.width || keyboardNavResizer.getAttribute("aria-valuenow") || 220);
        var nextNavWidth = event.key === "Home" ? 220 : (event.key === "End" ? 440 : currentNavWidth + (event.key === "ArrowRight" ? 20 : -20));
        nextNavWidth = Math.max(220, Math.min(440, nextNavWidth));
        keyboardResizeNav.dataset.width = String(nextNavWidth);
        keyboardResizeNav.style.setProperty("--side-desktop-width", nextNavWidth + "px");
        keyboardNavResizer.setAttribute("aria-valuenow", String(nextNavWidth));
        event.preventDefault();
        return;
      }

      var sideKeyboardItem = event.target.closest && event.target.closest(".side-nav-item");
      if (sideKeyboardItem && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Enter", " ", "Escape"].indexOf(event.key) >= 0) {
        var sideKeyboardNav = sideKeyboardItem.closest(".side-web-navigation, .side-desktop-navigation, .side-nav-flyout");
        var sideKeyboardItems = Array.from(sideKeyboardNav.querySelectorAll(".side-nav-item:not(:disabled)")).filter(function (item) { return item.offsetParent !== null; });
        var sideKeyboardIndex = sideKeyboardItems.indexOf(sideKeyboardItem);
        var owningSideWebNav = sideKeyboardItem.closest("[data-side-web-nav]");
        var owningSideFlyout = sideKeyboardItem.closest("[data-side-nav-flyout]");
        var collapsedKeyboardNode = sideNavRailNode(sideKeyboardItem);
        if (owningSideFlyout && (event.key === "ArrowLeft" || event.key === "Escape")) {
          var flyoutSource = sideNavRailItemForKey(owningSideWebNav, owningSideFlyout.dataset.sourceKey);
          hideSideNavFlyout(owningSideWebNav, true);
          if (flyoutSource) flyoutSource.focus();
        } else if (event.key === "Escape") {
          if (owningSideWebNav) hideSideNavFlyout(owningSideWebNav, true);
        } else if (owningSideWebNav && owningSideWebNav.classList.contains("is-collapsed") && collapsedKeyboardNode && event.key === "ArrowRight" && sideKeyboardItem.hasAttribute("data-side-nav-expand")) {
          showSideNavFlyout(owningSideWebNav, collapsedKeyboardNode, true, true);
        } else if (owningSideWebNav && owningSideWebNav.classList.contains("is-collapsed") && collapsedKeyboardNode && event.key === "ArrowLeft") {
          hideSideNavFlyout(owningSideWebNav, true);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          var sideKeyboardNext = event.key === "ArrowDown" ? (sideKeyboardIndex + 1) % sideKeyboardItems.length : (sideKeyboardIndex - 1 + sideKeyboardItems.length) % sideKeyboardItems.length;
          sideKeyboardItems[sideKeyboardNext].focus();
        } else if ((event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") && sideKeyboardItem.hasAttribute("data-side-nav-expand")) {
          if (sideKeyboardItem.getAttribute("aria-expanded") !== "true") sideKeyboardItem.click();
        } else if (event.key === "ArrowLeft" && sideKeyboardItem.hasAttribute("data-side-nav-expand")) {
          if (sideKeyboardItem.getAttribute("aria-expanded") === "true") sideKeyboardItem.click();
        } else {
          sideKeyboardItem.click();
        }
        event.preventDefault();
        return;
      }
      var popupTrigger = event.target.closest && event.target.closest("[data-popup-trigger]");
      var popupRoot = popupTrigger && popupTrigger.closest("[data-popup-root]");
      if (popupRoot && usesSharedPopupInteraction(popupRoot) && ["ArrowDown", "Enter", " "].indexOf(event.key) >= 0) {
        closeOtherPopups(popupRoot);
        setPopupState(popupRoot, true, event.key === "ArrowDown");
        event.preventDefault();
        return;
      }
      var tableEditInput = event.target.closest && event.target.closest("[data-table-edit-input]");
      if (tableEditInput && (event.key === "Enter" || event.key === "Escape")) {
        finishTableEdit(tableEditInput.closest("[data-table-editable-row]"), event.key === "Enter", event.key === "Enter" ? "keyboard" : "escape", true);
        event.preventDefault();
        return;
      }

      var c08MenuItem = event.target.closest && event.target.closest(".demo-menu-item:not(:disabled):not([aria-disabled='true'])");
      var c08Root = c08MenuItem && c08CascadeRoot(c08MenuItem);
      if (c08Root && event.key === "Tab") {
        if (c08Root.matches("[data-context-menu-stage]")) setC08ContextMenuState(c08Root, false, false);
        else setPopupState(c08Root, false, false);
        return;
      }
      if (c08Root && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "].indexOf(event.key) >= 0) {
        var c08Menu = c08MenuItem.parentElement;
        var c08Items = directMenuItems(c08Menu);
        var c08Index = c08Items.indexOf(c08MenuItem);
        var c08Owner = c08MenuItem.hasAttribute("data-submenu-owner") ? c08MenuItem : null;
        if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
          var c08NextIndex = event.key === "Home" ? 0 : (event.key === "End" ? c08Items.length - 1 : (event.key === "ArrowDown" ? (c08Index + 1) % c08Items.length : (c08Index - 1 + c08Items.length) % c08Items.length));
          if (c08Items[c08NextIndex]) c08Items[c08NextIndex].focus();
        } else if ((event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") && c08Owner) {
          syncC08SubmenuState(c08Owner, true, "keyboard", true);
          var firstSubmenuItem = directMenuItems(submenuPanel(c08Owner))[0];
          if (firstSubmenuItem) firstSubmenuItem.focus();
        } else if (event.key === "ArrowLeft") {
          if (c08Owner && c08Owner.getAttribute("aria-expanded") === "true") {
            syncC08SubmenuState(c08Owner, false, "keyboard", true);
            c08Owner.focus();
          } else if (c08Menu.matches("[data-submenu-panel]")) {
            var parentSubmenuOwner = c08Menu.parentElement;
            syncC08SubmenuState(parentSubmenuOwner, false, "keyboard", true);
            parentSubmenuOwner.focus();
          } else {
            return;
          }
        } else if (event.key === "Enter" || event.key === " ") {
          c08MenuItem.click();
        } else {
          return;
        }
        event.preventDefault();
        return;
      }

      var popupPanel = event.target.closest && event.target.closest("[data-popup-panel]");
      if (popupPanel && usesSharedPopupInteraction(popupPanel) && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].indexOf(event.key) >= 0) {
        var popupItems = directMenuItems(popupPanel);
        if (!popupItems.length) popupItems = Array.from(popupPanel.querySelectorAll("[data-table-filter-option]:not(:disabled), .table-filter-actions button:not(:disabled)"));
        var popupIndex = popupItems.indexOf(event.target.closest(".demo-menu-item"));
        if (popupIndex < 0) popupIndex = popupItems.indexOf(event.target.closest("[data-table-filter-option], button"));
        var nextPopupIndex = event.key === "Home"
          ? 0
          : (event.key === "End" ? popupItems.length - 1 : (["ArrowDown", "ArrowRight"].indexOf(event.key) >= 0 ? (popupIndex + 1) % popupItems.length : (popupIndex - 1 + popupItems.length) % popupItems.length));
        if (popupItems[nextPopupIndex]) popupItems[nextPopupIndex].focus();
        event.preventDefault();
        return;
      }
      if (popupPanel && usesSharedPopupInteraction(popupPanel) && ["Enter", " "].indexOf(event.key) >= 0) {
        var popupSelection = event.target.closest(".demo-menu-item:not(:disabled):not([aria-disabled='true'])");
        if (popupSelection) popupSelection.click();
        event.preventDefault();
        return;
      }

      var keyboardCascadeRemove = event.target.closest && event.target.closest("[data-cascade-remove][role='button']");
      if (keyboardCascadeRemove && ["Enter", " "].indexOf(event.key) >= 0) {
        keyboardCascadeRemove.click();
        event.preventDefault();
        return;
      }

      var keyboardCascadeTrigger = event.target.closest && event.target.closest("[data-cascader-trigger]");
      var keyboardCascadeSearchInput = event.target.matches && event.target.matches("[data-cascade-search]");
      var keyboardCascadeTriggerKeys = keyboardCascadeSearchInput ? ["ArrowDown", "ArrowUp", "Escape"] : ["ArrowDown", "ArrowUp", "Enter", " ", "Escape"];
      if (keyboardCascadeTrigger && keyboardCascadeTriggerKeys.indexOf(event.key) >= 0) {
        var keyboardCascadeDemo = keyboardCascadeTrigger.closest("[data-cascader-demo]");
        if (event.key === "Escape") setCascaderOpen(keyboardCascadeDemo, false);
        else {
          setCascaderOpen(keyboardCascadeDemo, true);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            var keyboardCascadeOptions = Array.from(keyboardCascadeDemo.querySelectorAll(".cascade-column:first-child [data-cascade-option]:not(:disabled):not([hidden])"));
            var keyboardCascadeTarget = event.key === "ArrowUp" ? keyboardCascadeOptions[keyboardCascadeOptions.length - 1] : keyboardCascadeOptions[0];
            if (keyboardCascadeTarget) keyboardCascadeTarget.focus();
          }
        }
        event.preventDefault();
        return;
      }

      var keyboardCascadeOption = event.target.closest && event.target.closest("[data-cascade-option]");
      if (keyboardCascadeOption && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Enter", " "].indexOf(event.key) >= 0) {
        var keyboardCascadeColumn = keyboardCascadeOption.closest(".cascade-column");
        var keyboardCascadeColumns = Array.from(keyboardCascadeColumn.parentElement.querySelectorAll(":scope > .cascade-column"));
        var keyboardCascadeColumnIndex = keyboardCascadeColumns.indexOf(keyboardCascadeColumn);
        var keyboardCascadeItems = Array.from(keyboardCascadeColumn.querySelectorAll("[data-cascade-option]:not(:disabled):not([hidden])"));
        var keyboardCascadeItemIndex = keyboardCascadeItems.indexOf(keyboardCascadeOption);
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          var keyboardCascadeNextIndex = event.key === "ArrowDown" ? (keyboardCascadeItemIndex + 1) % keyboardCascadeItems.length : (keyboardCascadeItemIndex - 1 + keyboardCascadeItems.length) % keyboardCascadeItems.length;
          keyboardCascadeItems[keyboardCascadeNextIndex].focus();
        } else if (event.key === "ArrowRight" && keyboardCascadeColumns[keyboardCascadeColumnIndex + 1]) {
          var nextCascadeItem = keyboardCascadeColumns[keyboardCascadeColumnIndex + 1].querySelector("[data-cascade-option]:not(:disabled)");
          if (nextCascadeItem) nextCascadeItem.focus();
        } else if (event.key === "ArrowLeft" && keyboardCascadeColumns[keyboardCascadeColumnIndex - 1]) {
          var previousCascadeItem = keyboardCascadeColumns[keyboardCascadeColumnIndex - 1].querySelector("[data-cascade-option].is-selected, [data-cascade-option]:not(:disabled)");
          if (previousCascadeItem) previousCascadeItem.focus();
        } else {
          keyboardCascadeOption.click();
        }
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
        var openTimePicker = event.target.closest && event.target.closest("[data-time-picker].is-open");
        if (!openTimePicker) openTimePicker = interactionRoot.querySelector("[data-time-picker].is-open");
        if (openTimePicker) {
          if (openTimePicker.dataset.footer === "true") restoreTimePickerState(openTimePicker);
          else commitTimePickerState(openTimePicker);
          setTimePickerOpen(openTimePicker, false, true, false);
          event.preventDefault();
          return;
        }
        var openCascader = event.target.closest && event.target.closest("[data-cascader-demo].is-open");
        if (!openCascader) openCascader = interactionRoot.querySelector("[data-cascader-demo].is-open");
        if (openCascader) {
          var cascaderTriggerToRestore = openCascader.querySelector("[data-cascader-trigger]");
          setCascaderOpen(openCascader, false);
          if (cascaderTriggerToRestore) cascaderTriggerToRestore.focus();
          event.preventDefault();
          return;
        }
        var openDateMonthMenu = interactionRoot.querySelector("[data-date-month-menu]:not([hidden])");
        if (openDateMonthMenu) {
          var openDateMonthCalendar = openDateMonthMenu.closest(".date-calendar");
          var openDateMonthTrigger = openDateMonthCalendar.querySelector("[data-date-heading-trigger]");
          setDateMonthMenuOpen(openDateMonthCalendar, false);
          if (openDateMonthTrigger) openDateMonthTrigger.focus();
          event.preventDefault();
          return;
        }
        var openDatePicker = event.target.closest && event.target.closest("[data-date-picker].is-open");
        if (!openDatePicker) openDatePicker = interactionRoot.querySelector("[data-date-picker].is-open");
        if (openDatePicker) {
          restoreDatePickerState(openDatePicker);
          setDatePickerOpen(openDatePicker, false, true);
          event.preventDefault();
          return;
        }
        var targetedContextMenu = event.target.closest && event.target.closest("[data-context-menu-stage].is-open");
        if (targetedContextMenu) {
          setC08ContextMenuState(targetedContextMenu, false, true);
          event.preventDefault();
          return;
        }
        var openPopup = event.target.closest && event.target.closest("[data-popup-root].is-open");
        if (!openPopup) openPopup = interactionRoot.querySelector("[data-popup-root].is-open");
        if (openPopup) {
          var triggerToRestore = openPopup.querySelector("[data-popup-trigger]");
          setPopupState(openPopup, false, false);
          if (triggerToRestore) triggerToRestore.focus();
          event.preventDefault();
          return;
        }
        var openContextMenu = interactionRoot.querySelector("[data-context-menu-stage].is-open");
        if (openContextMenu) {
          setC08ContextMenuState(openContextMenu, false, true);
          event.preventDefault();
          return;
        }
      }

      var currentSourceTab = event.target.closest && event.target.closest("[data-source-tabs] [role='tab']");
      if (currentSourceTab && !isDirectRendererNode(currentSourceTab) && ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) >= 0) {
        var sourceKeyboardRoot = currentSourceTab.closest("[data-source-tabs]");
        var enabledSourceTabs = sourceTabButtons(sourceKeyboardRoot).filter(function (tab) { return !tab.disabled; });
        var currentSourceIndex = enabledSourceTabs.indexOf(currentSourceTab);
        var nextSourceIndex = currentSourceIndex;
        if (event.key === "Home") nextSourceIndex = 0;
        else if (event.key === "End") nextSourceIndex = enabledSourceTabs.length - 1;
        else if (event.key === "ArrowRight") nextSourceIndex = (currentSourceIndex + 1) % enabledSourceTabs.length;
        else nextSourceIndex = (currentSourceIndex - 1 + enabledSourceTabs.length) % enabledSourceTabs.length;
        activateSourceTab(enabledSourceTabs[nextSourceIndex], { focus: true });
        event.preventDefault();
        return;
      }

      var currentTabsMore = event.target.closest && event.target.closest("[data-tabs-more]");
      if (currentTabsMore && !isDirectRendererNode(currentTabsMore) && event.key === "Escape") {
        setTabsMoreOpen(currentTabsMore, false, false);
        var currentTabsMoreTrigger = currentTabsMore.querySelector("[data-tabs-more-trigger]");
        if (currentTabsMoreTrigger) currentTabsMoreTrigger.focus();
        event.preventDefault();
        return;
      }

      var currentTab = event.target.closest && event.target.closest(".b2b-tab");
      if (currentTab && ["ArrowLeft", "ArrowRight"].indexOf(event.key) >= 0) {
        var tabs = Array.from(currentTab.parentElement.querySelectorAll(".b2b-tab"));
        var index = tabs.indexOf(currentTab);
        var next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
        tabs[next].click();
        tabs[next].focus();
        event.preventDefault();
        return;
      }

      var keyboardSlider = event.target.closest && event.target.closest('.slider[role="slider"]:not(.is-range)');
      if (keyboardSlider && ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End"].indexOf(event.key) >= 0) {
        var currentValue = Number(keyboardSlider.getAttribute("aria-valuenow") || 0);
        if (event.key === "Home") currentValue = 0;
        else if (event.key === "End") currentValue = 100;
        else currentValue += ["ArrowRight", "ArrowUp"].indexOf(event.key) >= 0 ? 1 : -1;
        currentValue = Math.max(0, Math.min(100, currentValue));
        keyboardSlider.style.setProperty("--slider-progress", currentValue + "%");
        keyboardSlider.setAttribute("aria-valuenow", String(currentValue));
        var keyboardValueLabel = keyboardSlider.closest(".slider-spec") && keyboardSlider.closest(".slider-spec").querySelector(":scope > span");
        if (keyboardValueLabel) keyboardValueLabel.textContent = String(currentValue);
        event.preventDefault();
      }
    });

    interactionRoot.addEventListener("close", function (event) {
      if (event.target.matches && event.target.matches("dialog[data-demo-dialog]")) syncDemoDialogClosed(event.target);
    }, true);

    interactionRoot.addEventListener("cancel", function (event) {
      if (!event.target.matches || !event.target.matches("dialog[data-demo-dialog]")) return;
      event.preventDefault();
      closeDemoDialog(event.target, "escape");
    }, true);

    interactionRoot.addEventListener("b2b:specimens-rendered", function (event) {
      var renderedRoot = event.detail && event.detail.root ? event.detail.root : interactionRoot;
      initializeTimePickers(renderedRoot);
      renderedRoot.querySelectorAll("[data-table-demo]").forEach(syncTableSelection);
      renderedRoot.querySelectorAll("[data-table-demo].is-tree-table").forEach(syncTableTreeRows);
      renderedRoot.querySelectorAll("[data-popover-demo].is-open [data-popover-panel]").forEach(function (panel) {
        placeSourcePopover(panel.closest("[data-popover-demo]"), panel);
      });
    });

    initializeTimePickers(interactionRoot);
    interactionRoot.querySelectorAll("[data-table-demo]").forEach(syncTableSelection);
    interactionRoot.querySelectorAll("[data-table-demo].is-tree-table").forEach(syncTableTreeRows);

    interactionRoot.querySelectorAll("[data-cascade-search]").forEach(function (searchInput) {
      if (searchInput.value) filterCascaderSearch(searchInput);
    });
    interactionRoot.querySelectorAll("[data-popover-demo].is-open [data-popover-panel]").forEach(function (panel) {
      placeSourcePopover(panel.closest("[data-popover-demo]"), panel);
    });
    boundInteractionRoots.add(interactionRoot);
    return { bound: true, alreadyBound: false, root: interactionRoot };
  };

  function initializeSharedInteractions() {
    D.bindInteractions(document);
    D.loadMaterialSymbols();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSharedInteractions, { once: true });
  } else {
    initializeSharedInteractions();
  }
})();

(function registerLayoutInteractions() {
  "use strict";

  function setListRowState(input) {
    var row = input.closest("[data-layout-list-row]");
    if (!row) return;
    row.classList.toggle("is-selected", input.checked || input.indeterminate);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[data-indeterminate="true"]').forEach(function (input) {
      input.indeterminate = true;
      setListRowState(input);
    });
  });

  document.addEventListener("change", function (event) {
    var listCheck = event.target.closest && event.target.closest("[data-layout-list-check]");
    if (listCheck) {
      listCheck.indeterminate = false;
      setListRowState(listCheck);
    }

    var timezoneToggle = event.target.closest && event.target.closest("[data-layout-timezone-toggle]");
    if (timezoneToggle) {
      var dialog = timezoneToggle.closest("[data-layout-id='L-04']");
      var select = dialog && dialog.querySelector("[data-layout-end-timezone]");
      if (select) {
        var disabled = !timezoneToggle.checked;
        var trigger = select.querySelector("[data-select-trigger]");
        select.classList.toggle("is-disabled", disabled);
        select.setAttribute("aria-disabled", disabled ? "true" : "false");
        if (trigger) trigger.disabled = disabled;
      }
    }
  });

  document.addEventListener("click", function (event) {
    var listRow = event.target.closest && event.target.closest("[data-layout-list-row]");
    if (listRow && !event.target.closest("[data-layout-list-check]")) {
      var list = listRow.parentElement;
      if (list) list.querySelectorAll("[data-layout-list-row]").forEach(function (item) { item.classList.remove("is-selected"); });
      listRow.classList.add("is-selected");
    }

    var row = event.target.closest && event.target.closest("[data-layout-row]");
    if (row && !row.classList.contains("is-head")) {
      row.setAttribute("aria-selected", row.getAttribute("aria-selected") === "true" ? "false" : "true");
    }

    var queryToggle = event.target.closest && event.target.closest("[data-layout-query-toggle]");
    if (queryToggle) {
      var query = queryToggle.closest("[data-layout-id='L-05']");
      var fields = query && query.querySelector("[data-layout-query-fields]");
      var open = queryToggle.getAttribute("aria-expanded") === "true";
      queryToggle.setAttribute("aria-expanded", open ? "false" : "true");
      if (fields) fields.hidden = open;
      var label = queryToggle.querySelector("span:last-child");
      if (label) label.textContent = open ? "展开条件" : "收起条件";
    }

    var confirm = event.target.closest && event.target.closest("[data-layout-confirm]");
    if (confirm) {
      var feedback = confirm.closest("[data-layout-id='L-04']").querySelector("[data-layout-feedback]");
      feedback.hidden = false;
      window.setTimeout(function () { feedback.hidden = true; }, 1800);
    }

    var privacy = event.target.closest && event.target.closest("[data-layout-privacy]");
    if (privacy) {
      var card = privacy.closest(".layout-info-card");
      var privateState = card.classList.toggle("is-private");
      privacy.setAttribute("aria-pressed", privateState ? "true" : "false");
      privacy.setAttribute("aria-label", privateState ? "显示信息值" : "隐藏信息值");
      var privacyIcon = privacy.querySelector(".b2b-icon");
      if (privacyIcon) privacyIcon.textContent = privateState ? "visibility_off" : "visibility";
    }
  });

  document.addEventListener("keydown", function (event) {
    var listRow = event.target.closest && event.target.closest("[data-layout-list-row]");
    if (listRow && ["Enter", " "].indexOf(event.key) >= 0) {
      listRow.click();
      event.preventDefault();
      return;
    }

    var row = event.target.closest && event.target.closest("[data-layout-row]");
    if (row && ["Enter", " "].indexOf(event.key) >= 0) {
      row.click();
      event.preventDefault();
    }
  });

  document.addEventListener("submit", function (event) {
    var form = event.target.closest && event.target.closest("[data-layout-query-form]");
    if (!form) return;
    event.preventDefault();
    var button = form.querySelector('button[type="submit"]');
    var result = form.querySelector("[data-layout-query-result]");
    if (button) {
      button.disabled = true;
      button.textContent = "查询中…";
    }
    window.setTimeout(function () {
      if (button) {
        button.disabled = false;
        button.textContent = "查询";
      }
      if (result) result.hidden = false;
    }, 420);
  });
})();

(function registerTemplateInteractions() {
  "use strict";

  function updateBatch(root) {
    var checks = Array.from(root.querySelectorAll("[data-template-row-check]"));
    var count = checks.filter(function (input) { return input.checked; }).length;
    var batch = root.querySelector("[data-template-batch]");
    checks.forEach(function (input) {
      var row = input.closest("tr");
      if (row) row.classList.toggle("is-selected", input.checked);
    });
    if (batch) {
      batch.hidden = count === 0;
      batch.firstChild.textContent = "已选择 " + count + " 项 ";
    }
  }

  function filterTemplateTable(input) {
    var root = input.closest(".template-app-shell");
    var query = input.value.trim().toLowerCase();
    root.querySelectorAll("[data-template-table-row]").forEach(function (row) {
      row.hidden = query && row.textContent.toLowerCase().indexOf(query) < 0;
    });
  }

  function filterModal(root) {
    var queryInput = root.querySelector("[data-template-modal-search]");
    var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
    var active = root.querySelector("[data-template-category].is-active");
    var category = active ? active.dataset.templateCategory : "all";
    root.querySelectorAll("[data-template-choice]").forEach(function (choice) {
      var categoryMatch = category === "all" || choice.dataset.category === category;
      var queryMatch = !query || choice.textContent.toLowerCase().indexOf(query) >= 0;
      choice.hidden = !(categoryMatch && queryMatch);
    });
  }

  document.addEventListener("change", function (event) {
    var rowCheck = event.target.closest && event.target.closest("[data-template-row-check]");
    if (rowCheck) updateBatch(rowCheck.closest(".template-app-shell"));

    var setting = event.target.closest && event.target.closest("[data-template-setting]");
    if (setting) {
      var workspace = setting.closest(".template-workspace");
      var savebar = workspace && workspace.querySelector("[data-template-savebar]");
      if (savebar) savebar.hidden = false;
    }

    var series = event.target.closest && event.target.closest("[data-template-series]");
    if (series) {
      var chart = series.closest(".template-chart-section").querySelector("[data-template-chart]");
      chart.classList.toggle("is-muted", !series.checked);
    }
  });

  document.addEventListener("input", function (event) {
    var tableSearch = event.target.closest && event.target.closest("[data-template-search]");
    if (tableSearch) filterTemplateTable(tableSearch);
    var modalSearch = event.target.closest && event.target.closest("[data-template-modal-search]");
    if (modalSearch) filterModal(modalSearch.closest(".template-modal"));
  });

  document.addEventListener("click", function (event) {
    var settingButton = event.target.closest && event.target.closest("[data-template-setting]");
    if (settingButton) {
      var settingWorkspace = settingButton.closest(".template-workspace");
      var settingSavebar = settingWorkspace && settingWorkspace.querySelector("[data-template-savebar]");
      if (settingSavebar) settingSavebar.hidden = false;
    }

    var master = event.target.closest && event.target.closest("[data-template-master]");
    if (master) {
      var root = master.closest(".template-master-detail");
      root.querySelectorAll("[data-template-master]").forEach(function (item) { item.classList.toggle("is-active", item === master); });
      var title = root.querySelector("[data-template-detail-title]");
      if (title) title.textContent = master.dataset.templateMaster;
    }

    var save = event.target.closest && event.target.closest("[data-template-save]");
    if (save) {
      var bar = save.closest("[data-template-savebar]");
      bar.querySelector("span").textContent = "设置已保存";
      bar.querySelector("span").style.color = "var(--b2b-color-success)";
      window.setTimeout(function () { bar.hidden = true; }, 1000);
    }
    var reset = event.target.closest && event.target.closest("[data-template-reset]");
    if (reset) reset.closest("[data-template-savebar]").hidden = true;

    var start = event.target.closest && event.target.closest("[data-template-start]");
    if (start) {
      var status = start.closest(".template-hero").querySelector("[data-template-start-status]");
      if (status) status.hidden = false;
    }

    var doc = event.target.closest && event.target.closest("[data-template-doc]");
    if (doc) {
      var docRoot = doc.closest(".template-doc");
      docRoot.querySelectorAll("[data-template-doc]").forEach(function (item) { item.classList.toggle("is-active", item === doc); });
      var docTitle = docRoot.querySelector("[data-template-doc-title]");
      if (docTitle) docTitle.textContent = doc.dataset.templateDoc;
    }

    var category = event.target.closest && event.target.closest("[data-template-category]");
    if (category) {
      var modalRoot = category.closest(".template-modal");
      modalRoot.querySelectorAll("[data-template-category]").forEach(function (item) { item.classList.toggle("is-active", item === category); });
      filterModal(modalRoot);
    }

    var choice = event.target.closest && event.target.closest("[data-template-choice]");
    if (choice) {
      var choiceModal = choice.closest(".template-modal");
      choiceModal.querySelectorAll("[data-template-choice]").forEach(function (item) { item.classList.toggle("is-selected", item === choice); });
      var confirm = choiceModal.querySelector("[data-template-modal-confirm]");
      if (confirm) confirm.disabled = false;
    }

    var modalClose = event.target.closest && event.target.closest("[data-template-modal-close]");
    if (modalClose) {
      var modalStage = modalClose.closest(".template-modal-stage");
      modalStage.classList.add("is-dismissed");
      window.setTimeout(function () { modalStage.classList.remove("is-dismissed"); }, 700);
    }
  });
})();
