(function registerTabsProductionApi(global) {
  "use strict";

  var runtime = global.B2B && global.B2B.components && global.B2B.components.runtime;
  if (!runtime) throw new Error("C-41 renderer requires components/runtime/core.js");

  var VARIANTS = ["line", "capsule", "card"];
  var SIZES = ["large", "medium", "small"];
  var ACTIVATIONS = ["automatic", "manual"];
  var PANEL_EXIT_MS = 80;
  var PANEL_ENTER_MS = 190;

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function safeText(value) {
    return value === undefined || value === null ? "" : String(value);
  }

  runtime.define({
    id: "C-41",
    name: "tabs",
    styles: ["C-41-tabs/styles.css", "C-33-badge/styles.css"],
    contract: global.B2B.components.contracts && global.B2B.components.contracts["C-41"],
    api: global.B2B.components.apiSchemas && global.B2B.components.apiSchemas["C-41"],
    create: function createTabs(inputProps) {
      var props = runtime.resolveProps("C-41", inputProps || {}, {
        variant: "line",
        size: "medium",
        items: [],
        overflowItems: [],
        activeId: null,
        ariaLabel: "内容切换",
        activation: "automatic",
        panelContainer: null,
        addable: false,
        scrollable: false
      });

      var panelContainer = props.panelContainer;
      runtime.assert(panelContainer === null || (panelContainer instanceof global.HTMLElement && panelContainer.ownerDocument === global.document && panelContainer.childNodes.length === 0), "C-41 panelContainer must be an empty HTMLElement in the current document, or null");
      runtime.assertEnum(props.variant, VARIANTS, "C-41 variant");
      runtime.assertEnum(props.size, SIZES, "C-41 size");
      runtime.assertEnum(props.activation, ACTIVATIONS, "C-41 activation");
      runtime.assert(Array.isArray(props.items) && props.items.length > 0, "C-41 requires at least one visible tab item");
      runtime.assert(Array.isArray(props.overflowItems), "C-41 overflowItems must be an array");
      runtime.assert(!(props.variant === "capsule" && props.size === "large"), "C-41 capsule supports only medium or small size");
      runtime.assert(!props.addable || props.variant === "card", "C-41 addable is supported only by card tabs");
      runtime.assert(!props.overflowItems.length || props.variant !== "card", "C-41 overflowItems are supported only by line or capsule tabs");

      runtime.assert(!props.scrollable || !props.overflowItems.length, "C-41 scrollable and overflowItems are mutually exclusive");

      var baseId = runtime.uid("c41-tabs");
      var itemSequence = 0;
      var itemsById = Object.create(null);
      var tabsById = Object.create(null);
      var panelsById = Object.create(null);
      var visibleIds = [];
      var overflowIds = [];
      var cleanupTasks = [];
      var animationTimers = [];
      var scheduledFrames = [];
      var destroyed = false;
      var mounted = false;
      var activeId = null;
      var focusId = null;
      var transitionId = 0;
      var resizeObserver = null;

      function normalizeItem(item, index, prefix) {
        var source = item || {};
        var id = safeText(source.id || prefix + "-" + (index + 1));
        var label = safeText(source.label || "Tab " + (index + 1));
        runtime.assert(id.trim(), "C-41 item id cannot be empty");
        runtime.assert(label.trim(), "C-41 tab label cannot be empty");
        runtime.assert(!itemsById[id], "C-41 item ids must be unique: " + id);
        runtime.assert(!source.closable || props.variant === "card", "C-41 closable items are supported only by card tabs: " + id);
        itemSequence += 1;
        var normalized = {
          id: id,
          domKey: itemSequence,
          label: label,
          content: hasOwn(source, "content") ? source.content : "",
          disabled: Boolean(source.disabled),
          closable: Boolean(source.closable),
          badge: hasOwn(source, "badge") ? source.badge : null
        };
        itemsById[id] = normalized;
        return normalized;
      }

      props.items.forEach(function (item, index) {
        visibleIds.push(normalizeItem(item, index, "tab").id);
      });
      props.overflowItems.forEach(function (item, index) {
        overflowIds.push(normalizeItem(item, index, "overflow").id);
      });

      runtime.assert(visibleIds.some(function (id) { return !itemsById[id].disabled; }), "C-41 requires at least one enabled visible tab");

      var requestedActiveId = props.activeId === null || props.activeId === undefined ? null : safeText(props.activeId);
      if (requestedActiveId && overflowIds.indexOf(requestedActiveId) >= 0 && !itemsById[requestedActiveId].disabled) {
        var initialReplacementIndex = visibleIds.length - 1;
        var displacedInitialId = visibleIds[initialReplacementIndex];
        visibleIds[initialReplacementIndex] = requestedActiveId;
        overflowIds.splice(overflowIds.indexOf(requestedActiveId), 1, displacedInitialId);
      }
      activeId = requestedActiveId && visibleIds.indexOf(requestedActiveId) >= 0 && !itemsById[requestedActiveId].disabled
        ? requestedActiveId
        : visibleIds.find(function (id) { return !itemsById[id].disabled; });
      focusId = activeId;

      var rootClasses = ["source-tabs", "is-" + props.variant, "is-" + props.size];
      if (props.scrollable) rootClasses.push("is-scrollable");
      if (props.addable) rootClasses.push("is-addable");
      if (overflowIds.length) rootClasses.push("has-overflow-menu");

      var root = runtime.element("div", {
        id: baseId,
        className: rootClasses.join(" "),
        "data-source-tabs": "",
        "data-tabs-ready": "false",
        "data-activation": props.activation,
        "data-component-reference": "C-41",
        "data-component-renderer": "tabs",
        "data-variant": props.variant,
        "data-size": props.size
      });
      var tabList = runtime.element("div", {
        className: "source-tabs-list",
        role: "tablist",
        "aria-label": props.ariaLabel,
        "aria-orientation": "horizontal"
      });
      var scroll = runtime.element("div", {
        className: "source-tabs-scroll",
        "data-tabs-viewport": ""
      });
      var indicator = runtime.element("i", {
        className: "source-tabs-indicator",
        "aria-hidden": "true"
      });
      var previous = props.scrollable ? runtime.element("button", {
        className: "tabs-scroll",
        type: "button",
        "aria-label": "向前滚动标签页",
        hidden: true,
        "data-tabs-scroll": "-1"
      }, runtime.icon("chevron_left")) : null;
      var next = props.scrollable ? runtime.element("button", {
        className: "tabs-scroll",
        type: "button",
        "aria-label": "向后滚动标签页",
        hidden: true,
        "data-tabs-scroll": "1"
      }, runtime.icon("chevron_right")) : null;
      var addButton = props.addable ? runtime.element("button", {
        className: "tabs-add",
        type: "button",
        "aria-label": "新增标签页",
        "data-tab-add": ""
      }, runtime.icon("add")) : null;
      var moreRoot = overflowIds.length ? runtime.element("div", {
        className: "tabs-more",
        "data-tabs-more": ""
      }) : null;
      var moreTrigger = moreRoot ? runtime.element("button", {
        type: "button",
        "data-tabs-more-trigger": "",
        "aria-haspopup": "menu",
        "aria-expanded": "false"
      }, [runtime.element("span", { text: "More" }), runtime.icon("expand_more")]) : null;
      var moreMenu = moreRoot ? runtime.element("div", {
        id: baseId + "-overflow-menu",
        role: "menu",
        "aria-label": "更多标签页"
      }) : null;
      if (moreTrigger) moreTrigger.setAttribute("aria-controls", moreMenu.id);

      function createBadge(item) {
        if (!item.badge) return null;
        if (item.badge instanceof global.Node) {
          var sourceBadge = item.badge.matches && item.badge.matches(".source-badge")
            ? item.badge
            : item.badge.querySelector && item.badge.querySelector(".source-badge");
          runtime.assert(sourceBadge, "C-41 item.badge Node must be or contain C-33 .source-badge anatomy");
          runtime.assert(!sourceBadge.closest(".component-spec-board, .specimen-cell, .specimen-stage, [data-evidence-asset]"), "C-41 item.badge cannot originate from specimen/evidence DOM");
          sourceBadge.classList.add("source-tab-badge");
          return sourceBadge;
        }
        var isDot = item.badge === true;
        return runtime.element("span", {
          className: "source-tab-badge source-badge " + (isDot ? "is-dot" : "is-character") + " is-red",
          "aria-hidden": isDot ? "true" : null,
          title: typeof item.badge === "string" ? item.badge : null
        }, isDot ? null : safeText(item.badge));
      }

      function createTab(item) {
        var tabId = baseId + "-tab-" + item.domKey;
        var panelId = baseId + "-panel-" + item.domKey;
        var tab = runtime.element("button", {
          id: tabId,
          type: "button",
          role: "tab",
          "aria-controls": panelId,
          "aria-selected": "false",
          "aria-disabled": item.disabled ? "true" : null,
          tabIndex: -1,
          disabled: item.disabled,
          "data-tab-id": item.id
        });
        var label = runtime.element("span", {
          className: "source-tab-label",
          text: item.label,
          title: item.label
        });
        tab.appendChild(label);
        var badge = createBadge(item);
        if (badge) tab.appendChild(badge);
        if (item.closable) {
          tab.appendChild(runtime.element("i", {
            "data-tab-close": "",
            "aria-label": "关闭 " + item.label,
            title: "关闭 " + item.label
          }, runtime.icon("close")));
        }
        tabsById[item.id] = tab;
        return tab;
      }

      function createPanel(item) {
        var panel = panelsById[item.id];
        if (panel) return panel;
        panel = runtime.element("div", {
          id: baseId + "-panel-" + item.domKey,
          className: "source-tab-panel",
          "data-tabs-panel-variant": props.variant,
          role: "tabpanel",
          tabIndex: 0,
          "aria-labelledby": baseId + "-tab-" + item.domKey,
          hidden: true
        });
        runtime.setContent(panel, item.content);
        panelsById[item.id] = panel;
        return panel;
      }

      visibleIds.forEach(function (id) {
        scroll.appendChild(createTab(itemsById[id]));
        createPanel(itemsById[id]);
      });
      scroll.appendChild(indicator);
      if (previous) tabList.appendChild(previous);
      tabList.appendChild(scroll);
      if (moreRoot) {
        moreRoot.appendChild(moreTrigger);
        moreRoot.appendChild(moreMenu);
        tabList.appendChild(moreRoot);
      }
      if (addButton) tabList.appendChild(addButton);
      if (next) tabList.appendChild(next);
      root.appendChild(tabList);
      visibleIds.forEach(function (id) { root.appendChild(panelsById[id]); });

      function scheduleFrame(callback) {
        var id = global.requestAnimationFrame(function () {
          scheduledFrames = scheduledFrames.filter(function (frame) { return frame !== id; });
          if (!destroyed) callback();
        });
        scheduledFrames.push(id);
        return id;
      }

      function clearAnimations() {
        animationTimers.splice(0).forEach(global.clearTimeout);
        Object.keys(panelsById).forEach(function (id) {
          panelsById[id].classList.remove("is-leaving", "is-entering");
        });
      }

      function scheduleAnimation(callback, delay) {
        var id = global.setTimeout(function () {
          animationTimers = animationTimers.filter(function (timer) { return timer !== id; });
          if (!destroyed) callback();
        }, delay);
        animationTimers.push(id);
        return id;
      }

      function prefersReducedMotion() {
        return Boolean(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
      }

      function setRovingTabStop(id) {
        if (!tabsById[id] || tabsById[id].disabled) id = activeId;
        focusId = id;
        visibleIds.forEach(function (tabId) {
          if (tabsById[tabId]) tabsById[tabId].tabIndex = tabId === focusId ? 0 : -1;
        });
      }

      function syncTabSelection() {
        visibleIds.forEach(function (id) {
          var selected = id === activeId;
          var tab = tabsById[id];
          tab.classList.toggle("is-active", selected);
          tab.setAttribute("aria-selected", String(selected));
        });
        setRovingTabStop(focusId || activeId);
      }

      function showPanel(previousId, animate) {
        transitionId += 1;
        var currentTransition = transitionId;
        clearAnimations();
        var activePanel = panelsById[activeId];
        var previousPanel = previousId && previousId !== activeId ? panelsById[previousId] : null;
        Object.keys(panelsById).forEach(function (id) {
          var panel = panelsById[id];
          if (panel !== activePanel && panel !== previousPanel) {
            panel.hidden = true;
            panel.setAttribute("aria-hidden", "true");
          }
        });
        if (!activePanel) return;
        activePanel.removeAttribute("aria-hidden");
        if (!animate || !previousPanel || !previousPanel.isConnected || prefersReducedMotion()) {
          if (previousPanel) {
            previousPanel.hidden = true;
            previousPanel.setAttribute("aria-hidden", "true");
          }
          activePanel.hidden = false;
          return;
        }
        activePanel.hidden = true;
        previousPanel.hidden = false;
        previousPanel.setAttribute("aria-hidden", "true");
        previousPanel.classList.add("is-leaving");
        scheduleAnimation(function () {
          if (destroyed || currentTransition !== transitionId) return;
          previousPanel.classList.remove("is-leaving");
          previousPanel.hidden = true;
          activePanel.hidden = false;
          activePanel.classList.add("is-entering");
          scheduleAnimation(function () {
            activePanel.classList.remove("is-entering");
          }, PANEL_ENTER_MS);
        }, PANEL_EXIT_MS);
      }

      function indicatorTarget(tab) {
        return props.variant === "line" ? tab.querySelector(".source-tab-label") || tab : tab;
      }

      function measureIndicator(immediate) {
        var tab = tabsById[activeId];
        if (!tab || !tab.isConnected) {
          root.style.setProperty("--source-tabs-indicator-width", "0px");
          return;
        }
        var target = indicatorTarget(tab);
        var scrollRect = scroll.getBoundingClientRect();
        var targetRect = target.getBoundingClientRect();
        root.style.setProperty("--source-tabs-indicator-x", Math.round(targetRect.left - scrollRect.left + scroll.scrollLeft) + "px");
        root.style.setProperty("--source-tabs-indicator-width", Math.round(targetRect.width) + "px");
        if (immediate) {
          root.classList.remove("is-indicator-ready");
          scheduleFrame(function () { root.classList.add("is-indicator-ready"); });
        } else root.classList.add("is-indicator-ready");
      }

      function updateScrollControls() {
        if (!previous || !next) return;
        var gap = parseFloat(global.getComputedStyle(scroll).columnGap) || 0;
        var contentWidth = visibleIds.reduce(function (total, id) { return total + tabsById[id].getBoundingClientRect().width; }, 0) + Math.max(0, visibleIds.length - 1) * gap;
        var availableWidth = tabList.clientWidth - (addButton ? addButton.getBoundingClientRect().width : 0);
        var overflowing = contentWidth > availableWidth + 1;
        previous.hidden = next.hidden = !overflowing;
        root.dataset.tabsOverflowing = String(overflowing);
        var maxScroll = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
        previous.disabled = scroll.scrollLeft <= 1;
        next.disabled = scroll.scrollLeft >= maxScroll - 1;
      }

      function ensureVisible(tab, immediate) {
        if (!tab) return;
        var tabStart = tab.offsetLeft;
        var tabEnd = tabStart + tab.offsetWidth;
        var viewStart = scroll.scrollLeft;
        var viewEnd = viewStart + scroll.clientWidth;
        var nextLeft = viewStart;
        if (tabStart < viewStart) nextLeft = tabStart;
        else if (tabEnd > viewEnd) nextLeft = tabEnd - scroll.clientWidth;
        if (nextLeft !== viewStart) {
          if (immediate) {
            var inlineScrollBehavior = scroll.style.scrollBehavior;
            scroll.style.scrollBehavior = "auto";
            scroll.scrollLeft = nextLeft;
            scroll.style.scrollBehavior = inlineScrollBehavior;
          }
          else scroll.scrollTo({ left: nextLeft, behavior: prefersReducedMotion() ? "auto" : "smooth" });
        }
      }

      function emitChange(previousId, source) {
        runtime.emit(root, "b2b:tabs-change", {
          activeId: activeId,
          previousId: previousId,
          label: itemsById[activeId].label,
          source: source || "api"
        });
      }

      function activate(id, source, shouldFocus, animate) {
        if (!tabsById[id] || tabsById[id].disabled) return false;
        var previousId = activeId;
        activeId = id;
        focusId = id;
        syncTabSelection();
        showPanel(previousId, animate !== false && previousId !== id);
        var immediateVisibility = source === "keyboard";
        ensureVisible(tabsById[id], immediateVisibility);
        if (immediateVisibility) updateScrollControls();
        scheduleFrame(function () {
          measureIndicator(false);
          updateScrollControls();
        });
        if (shouldFocus) tabsById[id].focus();
        if (previousId !== id) emitChange(previousId, source);
        return true;
      }

      function enabledVisibleIds() {
        return visibleIds.filter(function (id) { return tabsById[id] && !tabsById[id].disabled; });
      }

      function fallbackFor(index, excludedId) {
        var before = visibleIds.slice(0, index).reverse();
        var after = visibleIds.slice(index + 1);
        return before.concat(after).find(function (id) {
          return id !== excludedId && tabsById[id] && !tabsById[id].disabled;
        }) || null;
      }

      function closeTab(id, source) {
        var item = itemsById[id];
        var index = visibleIds.indexOf(id);
        if (!item || index < 0 || !item.closable) return false;
        var fallbackId = fallbackFor(index, id);
        if (id === activeId && !fallbackId) return false;
        var hadFocus = tabsById[id] === global.document.activeElement || tabsById[id].contains(global.document.activeElement);
        var wasActive = id === activeId;
        tabsById[id].remove();
        panelsById[id].remove();
        delete tabsById[id];
        delete panelsById[id];
        delete itemsById[id];
        visibleIds.splice(index, 1);
        if (wasActive) {
          activeId = fallbackId;
          focusId = fallbackId;
          syncTabSelection();
          showPanel(id, false);
          if (fallbackId) tabsById[fallbackId].focus();
          emitChange(id, "close-fallback");
        } else {
          if (focusId === id) focusId = fallbackId || activeId;
          syncTabSelection();
          if (hadFocus && tabsById[focusId]) tabsById[focusId].focus();
        }
        scheduleFrame(function () {
          measureIndicator(false);
          updateScrollControls();
        });
        runtime.emit(root, "b2b:tab-close", {
          id: id,
          activeId: activeId,
          source: source || "api"
        });
        return true;
      }

      function nextGeneratedItem() {
        var number = Object.keys(itemsById).reduce(function (maximum, itemId) {
          var match = /^Tab\s+(\d+)$/.exec(itemsById[itemId].label);
          return match ? Math.max(maximum, Number(match[1])) : maximum;
        }, 0) + 1;
        var id = "new-tab-" + number;
        while (itemsById[id] || Object.keys(itemsById).some(function (itemId) {
          return itemsById[itemId].label === "Tab " + number;
        })) {
          number += 1;
          id = "new-tab-" + number;
        }
        return {
          id: id,
          label: "Tab " + number,
          content: "Content of Tab " + number,
          closable: true
        };
      }

      function addTab(sourceItem, source) {
        if (props.variant !== "card") return false;
        var normalized = normalizeItem(sourceItem || nextGeneratedItem(), visibleIds.length, "new-tab");
        visibleIds.push(normalized.id);
        var tab = createTab(normalized);
        scroll.insertBefore(tab, indicator);
        var panel = createPanel(normalized);
        (panelContainer && mounted ? panelContainer : root).appendChild(panel);
        activate(normalized.id, source || "api", true, true);
        runtime.emit(root, "b2b:tab-add", {
          id: normalized.id,
          item: {
            id: normalized.id,
            label: normalized.label,
            disabled: normalized.disabled,
            closable: normalized.closable
          },
          source: source || "api"
        });
        return normalized.id;
      }

      function renderOverflowMenu() {
        if (!moreMenu) return;
        moreMenu.replaceChildren();
        overflowIds.forEach(function (id) {
          var item = itemsById[id];
          moreMenu.appendChild(runtime.element("button", {
            type: "button",
            role: "menuitem",
            tabIndex: -1,
            disabled: item.disabled,
            "data-tabs-overflow-id": id,
            text: item.label
          }));
        });
      }

      function setMoreOpen(open, focusFirst) {
        if (!moreRoot) return;
        moreRoot.classList.toggle("is-open", open);
        moreTrigger.setAttribute("aria-expanded", String(open));
        if (open && focusFirst) {
          var first = moreMenu.querySelector("[role='menuitem']:not(:disabled)");
          if (first) first.focus();
        }
      }

      function syncPanelOrder() {
        visibleIds.forEach(function (id) {
          (panelContainer && mounted ? panelContainer : root).appendChild(createPanel(itemsById[id]));
        });
      }

      function selectOverflow(id, source) {
        var overflowIndex = overflowIds.indexOf(id);
        if (overflowIndex < 0 || itemsById[id].disabled) return false;
        var replacementIndex = visibleIds.length - 1;
        var displacedId = visibleIds[replacementIndex];
        var previousId = activeId;
        tabsById[displacedId].remove();
        panelsById[displacedId].remove();
        delete tabsById[displacedId];
        visibleIds[replacementIndex] = id;
        overflowIds[overflowIndex] = displacedId;
        scroll.insertBefore(createTab(itemsById[id]), indicator);
        syncPanelOrder();
        renderOverflowMenu();
        setMoreOpen(false, false);
        activate(id, source || "overflow", true, previousId !== id);
        runtime.emit(root, "b2b:tabs-overflow-change", {
          activeId: id,
          promotedId: id,
          displacedId: displacedId,
          source: source || "overflow"
        });
        return true;
      }

      function moveFocus(currentId, key) {
        var enabled = enabledVisibleIds();
        if (!enabled.length) return;
        var index = enabled.indexOf(currentId);
        if (index < 0) index = 0;
        if (key === "Home") index = 0;
        else if (key === "End") index = enabled.length - 1;
        else if (key === "ArrowRight") index = (index + 1) % enabled.length;
        else index = (index - 1 + enabled.length) % enabled.length;
        var id = enabled[index];
        if (props.activation === "automatic") activate(id, "keyboard", true, true);
        else {
          setRovingTabStop(id);
          tabsById[id].focus();
          ensureVisible(tabsById[id], true);
          updateScrollControls();
        }
      }

      function onTabsClick(event) {
        var tab = event.target.closest("[role='tab'][data-tab-id]");
        if (!tab || !scroll.contains(tab)) return;
        var id = tab.getAttribute("data-tab-id");
        var source = event.detail === 0 ? "keyboard" : "pointer";
        if (event.target.closest("[data-tab-close]")) {
          event.preventDefault();
          event.stopPropagation();
          closeTab(id, source);
          return;
        }
        activate(id, source, false, true);
      }

      function onTabsFocusIn(event) {
        var tab = event.target.closest("[role='tab'][data-tab-id]");
        if (!tab || !scroll.contains(tab) || tab.disabled) return;
        setRovingTabStop(tab.getAttribute("data-tab-id"));
      }

      function onTabsKeydown(event) {
        var tab = event.target.closest("[role='tab'][data-tab-id]");
        if (!tab || !scroll.contains(tab)) return;
        var id = tab.getAttribute("data-tab-id");
        if (["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) >= 0) {
          event.preventDefault();
          event.stopPropagation();
          moveFocus(id, event.key);
          return;
        }
        if ((event.key === "Enter" || event.key === " ") && props.activation === "manual") {
          event.preventDefault();
          event.stopPropagation();
          activate(id, "keyboard", true, true);
          return;
        }
        if ((event.key === "Delete" || event.key === "Backspace") && itemsById[id].closable) {
          event.preventDefault();
          event.stopPropagation();
          closeTab(id, "keyboard");
        }
      }

      function scrollTabs(direction) {
        scroll.scrollBy({
          left: Number(direction) * Math.max(160, scroll.clientWidth * 0.7),
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });
      }

      function menuItems() {
        return Array.from(moreMenu.querySelectorAll("[role='menuitem']:not(:disabled)"));
      }

      function onMoreClick(event) {
        if (event.target.closest("[data-tabs-more-trigger]")) {
          setMoreOpen(true, false);
          return;
        }
        var item = event.target.closest("[data-tabs-overflow-id]");
        if (item) selectOverflow(item.getAttribute("data-tabs-overflow-id"), "pointer");
      }

      function onMoreKeydown(event) {
        if (event.target === moreTrigger) {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setMoreOpen(true, true);
          } else if (event.key === "Escape") {
            setMoreOpen(false, false);
          }
          return;
        }
        var item = event.target.closest("[role='menuitem']");
        if (!item) return;
        if (event.key === "Escape") {
          event.preventDefault();
          setMoreOpen(false, false);
          moreTrigger.focus();
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectOverflow(item.getAttribute("data-tabs-overflow-id"), "keyboard");
          return;
        }
        if (["ArrowUp", "ArrowDown", "Home", "End"].indexOf(event.key) < 0) return;
        event.preventDefault();
        var enabled = menuItems();
        var index = enabled.indexOf(item);
        if (event.key === "Home") index = 0;
        else if (event.key === "End") index = enabled.length - 1;
        else if (event.key === "ArrowDown") index = (index + 1) % enabled.length;
        else index = (index - 1 + enabled.length) % enabled.length;
        if (enabled[index]) enabled[index].focus();
      }

      function onMorePointerEnter() {
        setMoreOpen(true, false);
      }

      function onMorePointerLeave() {
        var focused = global.document.activeElement;
        if (!moreRoot.contains(focused) || focused === moreTrigger) setMoreOpen(false, false);
      }

      function onMoreFocusIn() {
        setMoreOpen(true, false);
      }

      function onMoreFocusOut() {
        scheduleFrame(function () {
          if (!moreRoot.contains(global.document.activeElement)) setMoreOpen(false, false);
        });
      }

      function onDocumentPointer(event) {
        if (moreRoot && moreRoot.classList.contains("is-open") && !moreRoot.contains(event.target)) setMoreOpen(false, false);
      }

      function onResize() {
        scheduleFrame(function () {
          ensureVisible(tabsById[activeId], true);
          measureIndicator(false);
          updateScrollControls();
        });
      }

      scroll.addEventListener("click", onTabsClick);
      scroll.addEventListener("focusin", onTabsFocusIn);
      scroll.addEventListener("keydown", onTabsKeydown);
      scroll.addEventListener("scroll", updateScrollControls, { passive: true });
      cleanupTasks.push(function () {
        scroll.removeEventListener("click", onTabsClick);
        scroll.removeEventListener("focusin", onTabsFocusIn);
        scroll.removeEventListener("keydown", onTabsKeydown);
        scroll.removeEventListener("scroll", updateScrollControls);
      });
      if (previous) {
        previous.addEventListener("click", function () { scrollTabs(-1); });
        next.addEventListener("click", function () { scrollTabs(1); });
      }
      if (addButton) addButton.addEventListener("click", function () { addTab(null, "pointer"); });
      if (moreRoot) {
        renderOverflowMenu();
        moreRoot.addEventListener("click", onMoreClick);
        moreRoot.addEventListener("keydown", onMoreKeydown);
        moreRoot.addEventListener("pointerenter", onMorePointerEnter);
        moreRoot.addEventListener("pointerleave", onMorePointerLeave);
        moreRoot.addEventListener("focusin", onMoreFocusIn);
        moreRoot.addEventListener("focusout", onMoreFocusOut);
        global.document.addEventListener("pointerdown", onDocumentPointer);
        cleanupTasks.push(function () {
          moreRoot.removeEventListener("click", onMoreClick);
          moreRoot.removeEventListener("keydown", onMoreKeydown);
          moreRoot.removeEventListener("pointerenter", onMorePointerEnter);
          moreRoot.removeEventListener("pointerleave", onMorePointerLeave);
          moreRoot.removeEventListener("focusin", onMoreFocusIn);
          moreRoot.removeEventListener("focusout", onMoreFocusOut);
          global.document.removeEventListener("pointerdown", onDocumentPointer);
        });
      }
      global.addEventListener("resize", onResize);
      cleanupTasks.push(function () { global.removeEventListener("resize", onResize); });

      syncTabSelection();
      showPanel(null, false);
      root.dataset.tabsReady = "true";

      var instance = runtime.createInstance(root, {
        onMount: function onMount() {
          mounted = true;
          if (panelContainer) visibleIds.forEach(function (id) { panelContainer.appendChild(panelsById[id]); });
          if (global.ResizeObserver) {
            resizeObserver = new global.ResizeObserver(onResize);
            resizeObserver.observe(scroll);
            resizeObserver.observe(tabList);
          }
          scheduleFrame(function () {
            ensureVisible(tabsById[activeId], true);
            measureIndicator(true);
            updateScrollControls();
          });
          if (instance.ready && typeof instance.ready.then === "function") instance.ready.then(function () {
            ensureVisible(tabsById[activeId], true);
            measureIndicator(false);
            updateScrollControls();
          });
          return function () {
            mounted = false;
            if (resizeObserver) resizeObserver.disconnect();
          };
        },
        update: function update(nextProps) {
          var keys = Object.keys(nextProps || {});
          runtime.assert(keys.every(function (key) { return key === "activeId"; }), "C-41 update() supports only activeId");
          if (hasOwn(nextProps, "activeId")) {
            var nextId = safeText(nextProps.activeId);
            if (overflowIds.indexOf(nextId) >= 0) runtime.assert(selectOverflow(nextId, "api"), "C-41 activeId must reference an enabled tab: " + nextId);
            else runtime.assert(activate(nextId, "api", false, true), "C-41 activeId must reference an enabled tab: " + nextId);
          }
        },
        validate: function validate() {
          var errors = [];
          if (!root.matches(".source-tabs[data-source-tabs][data-component-reference='C-41'][data-tabs-ready='true']")) errors.push("invalid C-41 root anatomy");
          if (!root.classList.contains("is-" + props.variant) || !root.classList.contains("is-" + props.size)) errors.push("C-41 variant or size class mismatch");
          if (root.querySelectorAll(":scope > .source-tabs-list").length !== 1) errors.push("C-41 requires one direct tablist container");
          if (tabList.getAttribute("role") !== "tablist" || tabList.getAttribute("aria-orientation") !== "horizontal") errors.push("C-41 tablist ARIA mismatch");
          if (scroll.querySelectorAll(":scope > [role='tab']").length !== visibleIds.length) errors.push("C-41 visible tab count mismatch");
          if (props.scrollable && tabList.querySelectorAll(":scope > [data-tabs-scroll]").length !== 2) errors.push("scrollable C-41 requires previous and next controls");
          if (props.addable && !tabList.querySelector(":scope > [data-tab-add]")) errors.push("addable C-41 requires add control");
          if (overflowIds.length && !tabList.querySelector(":scope > [data-tabs-more]")) errors.push("overflow C-41 requires more menu");
          if (moreRoot && moreTrigger.getAttribute("aria-expanded") !== String(moreRoot.classList.contains("is-open"))) errors.push("overflow menu aria-expanded mismatch");
          if (moreMenu && moreMenu.querySelectorAll(":scope > [role='menuitem']").length !== overflowIds.length) errors.push("overflow menu item count mismatch");
          var selectedCount = 0;
          var rovingCount = 0;
          visibleIds.forEach(function (id) {
            var tab = tabsById[id];
            var panel = panelsById[id];
            var selected = id === activeId;
            if (!tab || !panel) {
              errors.push("missing C-41 tab or panel: " + id);
              return;
            }
            if (panel.parentElement !== (mounted && panelContainer ? panelContainer : root)) errors.push("C-41 panel container ownership mismatch: " + id);
            if (tab.getAttribute("aria-controls") !== panel.id) errors.push("tab/panel ownership mismatch: " + id);
            if (panel.getAttribute("aria-labelledby") !== tab.id) errors.push("panel label mismatch: " + id);
            if (tab.getAttribute("aria-selected") !== String(selected)) errors.push("aria-selected mismatch: " + id);
            if (selected) selectedCount += 1;
            if (tab.tabIndex === 0) rovingCount += 1;
            if (!animationTimers.length && panel.hidden === selected) errors.push("panel visibility mismatch: " + id);
            if (!animationTimers.length && selected && panel.hasAttribute("aria-hidden")) errors.push("active panel must not be aria-hidden: " + id);
            if (!animationTimers.length && !selected && panel.getAttribute("aria-hidden") !== "true") errors.push("inactive panel aria-hidden mismatch: " + id);
            if (itemIsDisabled(id) && tab.getAttribute("aria-disabled") !== "true") errors.push("disabled ARIA mismatch: " + id);
          });
          if (selectedCount !== 1) errors.push("C-41 requires exactly one selected tab");
          if (rovingCount !== 1) errors.push("C-41 requires exactly one roving tab stop");
          return errors;
        }
      });

      function itemIsDisabled(id) {
        return Boolean(itemsById[id] && itemsById[id].disabled);
      }

      instance.activate = function activateByApi(id) {
        var nextId = safeText(id);
        if (overflowIds.indexOf(nextId) >= 0) runtime.assert(selectOverflow(nextId, "api"), "C-41 activate() requires an enabled tab: " + nextId);
        else runtime.assert(activate(nextId, "api", false, true), "C-41 activate() requires an enabled tab: " + nextId);
        return instance;
      };
      instance.close = function closeByApi(id) {
        runtime.assert(closeTab(safeText(id), "api"), "C-41 close() requires a closable tab that can be removed: " + safeText(id));
        return instance;
      };
      instance.add = function addByApi(item) {
        runtime.assert(props.variant === "card", "C-41 add() is supported only by card tabs");
        addTab(item || null, "api");
        return instance;
      };
      instance.getActiveId = function getActiveId() { return activeId; };
      instance.getState = function getState() {
        return {
          activeId: activeId,
          focusId: focusId,
          visibleIds: visibleIds.slice(),
          overflowIds: overflowIds.slice(),
          mounted: mounted
        };
      };
      instance.addCleanup(function () {
        destroyed = true;
        if (panelContainer) Object.keys(panelsById).forEach(function (id) { panelsById[id].remove(); });
        transitionId += 1;
        clearAnimations();
        scheduledFrames.splice(0).forEach(global.cancelAnimationFrame);
        cleanupTasks.splice(0).reverse().forEach(function (cleanup) { cleanup(); });
      });
      return instance;
    }
  });
})(window);
