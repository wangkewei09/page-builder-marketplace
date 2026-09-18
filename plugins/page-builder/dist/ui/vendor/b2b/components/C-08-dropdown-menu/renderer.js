(function registerDropdownMenuRenderer(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  var runtime = components && components.runtime;
  var adapter = components && components.canonicalAdapter;
  runtime.assert(adapter, "C-08 requires components/runtime/canonical-adapter.js");

  var variants = ["基础下拉菜单", "级联菜单", "辅助标题", "分组", "动态菜单", "创建菜单", "选择菜单", "复杂信息菜单项", "上下文菜单"];
  var sizes = ["mini", "small", "medium", "large", "xlarge"];
  var sizePixels = { mini: 24, small: 28, medium: 32, large: 36, xlarge: 40 };
  var itemHeights = { mini: 24, small: 28, medium: 32, large: 36, xlarge: 40 };
  var complexItemHeights = { mini: 40, small: 44, medium: 48, large: 52, xlarge: 56 };
  var iconSizes = { mini: 12, small: 14, medium: 16, large: 18, xlarge: 20 };
  var itemKeys = ["label", "icon", "description", "auxiliary", "danger", "disabled", "selected", "action", "divider", "children"];

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function assertIcon(value, path, nullable) {
    runtime.assert(nullable ? value === null || typeof value === "string" && value.trim() : value === undefined || typeof value === "string" && value.trim(), path + " must be " + (nullable ? "null or " : "") + "a non-empty canonical icon name");
    runtime.assert(value === null || value === undefined || /^[a-z0-9_]+$/.test(value), path + " must be a canonical icon name");
  }

  function validateItems(items, props, path, depth) {
    runtime.assert(Array.isArray(items) && items.length > 0, path + " must contain at least one item");
    runtime.assert(depth <= 3, path + " exceeds the v1 three-level limit");
    var actions = 0;
    items.forEach(function (item, index) {
      var itemPath = path + "[" + index + "]";
      runtime.assert(item && Object.prototype.toString.call(item) === "[object Object]", itemPath + " must be an object");
      var unknown = Object.keys(item).filter(function (key) { return itemKeys.indexOf(key) < 0; });
      runtime.assert(!unknown.length, itemPath + " received unsupported fields: " + unknown.join(", "));
      runtime.assert(item.divider === undefined || typeof item.divider === "boolean", itemPath + ".divider must be a boolean");
      if (item.divider) {
        runtime.assert(Object.keys(item).every(function (key) { return key === "divider"; }), itemPath + " divider cannot include action fields");
        return;
      }
      actions += 1;
      runtime.assert(typeof item.label === "string" && item.label.trim(), itemPath + ".label must be a non-empty string");
      assertIcon(item.icon, itemPath + ".icon", false);
      ["description", "auxiliary"].forEach(function (key) {
        runtime.assert(item[key] === undefined || typeof item[key] === "string" && item[key].trim(), itemPath + "." + key + " must be a non-empty string when provided");
      });
      ["danger", "disabled", "selected", "action"].forEach(function (key) {
        runtime.assert(item[key] === undefined || typeof item[key] === "boolean", itemPath + "." + key + " must be a boolean");
      });
      runtime.assert(!item.selected || props.mode === "selection", itemPath + ".selected requires mode=selection");
      runtime.assert(!(item.selected && item.disabled), itemPath + " cannot be both selected and disabled");
      runtime.assert(item.description === undefined || props.variant === "复杂信息菜单项", itemPath + ".description requires variant=复杂信息菜单项");
      runtime.assert(!item.action || props.variant === "创建菜单", itemPath + ".action requires variant=创建菜单");
      runtime.assert(!(item.action && item.selected), itemPath + " action cannot also be selected");
      if (props.variant === "复杂信息菜单项") {
        runtime.assert(typeof item.description === "string" && item.description.trim(), itemPath + ".description is required by the complex-information anatomy");
      }
      if (hasOwn(item, "children")) {
        runtime.assert(props.variant === "级联菜单", itemPath + ".children requires variant=级联菜单");
        validateItems(item.children, props, itemPath + ".children", depth + 1);
      }
    });
    runtime.assert(actions > 0, path + " must contain at least one actionable item");
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, variants, "C-08 variant");
    runtime.assertEnum(props.mode, ["action", "selection"], "C-08 mode");
    runtime.assertEnum(props.triggerMode, ["click", "hover"], "C-08 triggerMode");
    runtime.assertEnum(props.size, sizes, "C-08 size");
    runtime.assert(typeof props.triggerLabel === "string" && props.triggerLabel.trim(), "C-08 triggerLabel cannot be empty");
    assertIcon(props.triggerIcon, "C-08 triggerIcon", true);
    runtime.assert(typeof props.open === "boolean" && typeof props.loading === "boolean" && typeof props.title === "string", "C-08 state props have invalid types");
    runtime.assert((props.variant === "选择菜单") === (props.mode === "selection"), "C-08 选择菜单 requires mode=selection; other variants require mode=action");
    runtime.assert(props.variant !== "上下文菜单" || props.triggerMode === "click", "C-08 上下文菜单 does not support hover triggerMode");
    runtime.assert(props.variant !== "上下文菜单" || props.mode === "action", "C-08 上下文菜单 is an action menu");
    runtime.assert(props.variant !== "上下文菜单" || props.triggerIcon === null, "C-08 上下文菜单 does not render a triggerIcon");
    runtime.assert(props.variant === "辅助标题" || !props.title, "C-08 title requires variant=辅助标题");
    runtime.assert(props.variant !== "辅助标题" || props.title.trim(), "C-08 辅助标题 requires a non-empty title");
    runtime.assert(props.variant === "动态菜单" || !props.loading, "C-08 loading requires variant=动态菜单");
    validateItems(props.items, props, "C-08.items", 1);
    if (props.variant === "级联菜单") runtime.assert(props.items.some(function (item) { return Array.isArray(item.children) && item.children.length; }), "C-08 级联菜单 requires children");
    if (props.variant === "分组") runtime.assert(props.items.some(function (item) { return item.divider; }), "C-08 分组 requires a divider");
    if (props.variant === "创建菜单") {
      var createActions = props.items.filter(function (item) { return item.action; });
      runtime.assert(createActions.length === 1, "C-08 创建菜单 requires exactly one action item");
      runtime.assert(props.items[props.items.length - 1] === createActions[0], "C-08 创建菜单 action must be the final item");
      runtime.assert(createActions[0].icon === "add", "C-08 创建菜单 action requires the canonical add icon");
    }
    if (props.variant === "选择菜单") runtime.assert(props.items.filter(function (item) { return item.selected; }).length === 1, "C-08 选择菜单 requires exactly one selected item");
    if (props.variant === "复杂信息菜单项") runtime.assert(props.items.every(function (item) { return item.divider || item.description; }), "C-08 复杂信息菜单项 requires description on every action item");
  }

  function sourceItems(items, mode) {
    return items.map(function (item) {
      if (item.divider) return { divider: true };
      var result = Object.assign({}, item);
      if (mode === "action") result.role = "menuitem";
      if (item.children) {
        result.children = sourceItems(item.children, "action");
        result.open = false;
      }
      return result;
    });
  }

  function selectedLabels(root) {
    return Array.from(root.querySelectorAll("[role='option'][aria-selected='true']")).map(function (item) {
      return item.getAttribute("data-menu-label") || "";
    });
  }

  function validateRenderedItems(panel, items, mode, path, errors) {
    var rendered = Array.from(panel.children).filter(function (node) {
      return node.matches && node.matches(".demo-menu-item, .menu-divider");
    });
    if (rendered.length !== items.length) {
      errors.push(path + " rendered " + rendered.length + " structural items; expected " + items.length);
      return;
    }
    items.forEach(function (item, index) {
      var node = rendered[index];
      var itemPath = path + "[" + index + "]";
      if (item.divider) {
        if (!node.matches(".menu-divider")) errors.push(itemPath + " divider anatomy is missing");
        return;
      }
      if (!node.matches(".demo-menu-item") || node.getAttribute("data-menu-label") !== item.label) errors.push(itemPath + " label is out of sync");
      var renderedIcon = node.querySelector(":scope > .menu-item-main > .b2b-icon:first-child");
      if (Boolean(renderedIcon) !== Boolean(item.icon) || renderedIcon && renderedIcon.textContent.trim() !== item.icon) errors.push(itemPath + " icon is out of sync");
      var renderedDescription = node.querySelector(":scope > .menu-item-main small");
      if ((renderedDescription ? renderedDescription.textContent : undefined) !== item.description) errors.push(itemPath + " description is out of sync");
      var renderedAuxiliary = node.querySelector(":scope > small");
      if ((renderedAuxiliary ? renderedAuxiliary.textContent : undefined) !== item.auxiliary) errors.push(itemPath + " auxiliary information is out of sync");
      var renderedDisabled = Boolean(node.disabled || node.getAttribute("aria-disabled") === "true");
      if (renderedDisabled !== Boolean(item.disabled)) errors.push(itemPath + " disabled state is out of sync");
      if (node.classList.contains("is-danger") !== Boolean(item.danger)) errors.push(itemPath + " danger state is out of sync");
      if (node.classList.contains("is-action") !== Boolean(item.action)) errors.push(itemPath + " action state is out of sync");
      if (mode === "selection" && node.getAttribute("aria-selected") !== String(Boolean(item.selected))) errors.push(itemPath + " selected state is out of sync");
      if (item.children) {
        var submenu = node.querySelector(":scope > [data-submenu-panel]");
        if (!submenu) errors.push(itemPath + " submenu anatomy is missing");
        else validateRenderedItems(submenu, item.children, "action", itemPath + ".children", errors);
      }
    });
  }

  function bindEventBridge(root, props) {
    root.setAttribute("data-component-interaction-source", "shared");
    var previousOpen = root.classList.contains("is-open");
    var queued = false;
    var contextMotionFrame = 0;
    var contextMotionCommitFrame = 0;
    var contextPanel = props.variant === "上下文菜单" ? root.querySelector("[data-context-menu-panel], .context-menu-panel") : null;
    var menuPanel = contextPanel || root.querySelector("[data-popup-panel]");
    var trigger = root.querySelector("[data-popup-trigger]");
    var contextRestoreTarget = null;
    var loadMoreRequested = false;
    var loadMoreScrollTimer = 0;
    var dynamicLayoutFrame = 0;
    var dynamicLayoutCommitFrame = 0;
    var dynamicPanelSnapshot = null;
    var stableDynamicWidth = 0;
    var restoringDynamicScroll = false;

    function detail(source) {
      return { variant: props.variant, mode: props.mode, open: root.classList.contains("is-open"), selected: selectedLabels(root), source: source };
    }

    function flushOpen() {
      queued = false;
      var nextOpen = root.classList.contains("is-open");
      if (nextOpen === previousOpen) return;
      previousOpen = nextOpen;
      if (!nextOpen && menuPanel && menuPanel.contains(document.activeElement)) {
        var restoreTarget = contextPanel ? contextRestoreTarget : trigger;
        if (!restoreTarget || !restoreTarget.isConnected || typeof restoreTarget.focus !== "function") restoreTarget = contextPanel ? root : trigger;
        if (restoreTarget) restoreTarget.focus();
      }
      runtime.emit(root, nextOpen ? "b2b:menu-open" : "b2b:menu-close", detail("canonical-interaction"));
    }

    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      global.queueMicrotask(flushOpen);
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    function onClick(event) {
      var item = event.target.closest(".demo-menu-item:not(:disabled):not([aria-disabled='true'])");
      if (!item || !root.contains(item) || item.classList.contains("has-child")) return;
      global.queueMicrotask(function () {
        runtime.emit(root, "b2b:menu-select", Object.assign(detail("canonical-interaction"), {
          label: item.getAttribute("data-menu-label") || ""
        }));
      });
    }
    function requestLoadMore(triggerSource) {
      if (props.variant !== "动态菜单" || props.loading || loadMoreRequested) return;
      loadMoreRequested = true;
      runtime.emit(root, "b2b:menu-load-more", Object.assign(detail("canonical-interaction"), {
        trigger: triggerSource,
        itemCount: props.items.filter(function (item) { return !item.divider; }).length
      }));
    }
    function lockDynamicWidth(panel) {
      if (!panel) return;
      if (!stableDynamicWidth) {
        stableDynamicWidth = Math.max(56, Math.min(420, Math.ceil(panel.getBoundingClientRect().width / 4) * 4));
      }
      panel.style.width = stableDynamicWidth + "px";
    }
    function prepareDynamicLoadingRow(panel) {
      var loadingRow = panel && panel.querySelector(":scope > .menu-loading-row");
      if (!loadingRow) return;
      loadingRow.setAttribute("role", "status");
      loadingRow.setAttribute("aria-label", "正在加载");
      var loadingText = loadingRow.querySelector(":scope > span:not(.b2b-icon)");
      if (loadingText) loadingText.setAttribute("aria-hidden", "true");
    }
    function captureDynamicPanel(panel) {
      if (!panel) return;
      lockDynamicWidth(panel);
      var loadingRow = panel.querySelector(":scope > .menu-loading-row");
      dynamicPanelSnapshot = {
        scrollTop: panel.scrollTop,
        atBottom: panel.scrollHeight - panel.scrollTop - panel.clientHeight <= 4,
        actionableCount: panel.querySelectorAll(":scope > .demo-menu-item").length,
        hasLoading: Boolean(loadingRow),
        loadingAnchorOffset: loadingRow ? loadingRow.offsetTop - panel.scrollTop : null
      };
    }
    function restoreDynamicPanel(panel) {
      if (!panel) return;
      lockDynamicWidth(panel);
      restoringDynamicScroll = true;
      var snapshot = dynamicPanelSnapshot;
      var nextItems = panel.querySelectorAll(":scope > .demo-menu-item");
      if (snapshot && snapshot.hasLoading && !panel.querySelector(":scope > .menu-loading-row") && nextItems[snapshot.actionableCount]) {
        panel.scrollTop = Math.max(0, nextItems[snapshot.actionableCount].offsetTop - snapshot.loadingAnchorOffset);
      } else if (snapshot && snapshot.atBottom) {
        panel.scrollTop = Math.max(0, panel.scrollHeight - panel.clientHeight);
      } else if (snapshot) {
        panel.scrollTop = Math.min(snapshot.scrollTop, Math.max(0, panel.scrollHeight - panel.clientHeight));
      }
      captureDynamicPanel(panel);
      global.cancelAnimationFrame(dynamicLayoutCommitFrame);
      dynamicLayoutCommitFrame = global.requestAnimationFrame(function () {
        dynamicLayoutCommitFrame = 0;
        restoringDynamicScroll = false;
      });
    }
    function replaceDynamicPanel(nextPanel) {
      if (menuPanel) menuPanel.removeEventListener("scroll", onDynamicScroll);
      menuPanel = nextPanel;
      if (!menuPanel) return;
      prepareDynamicLoadingRow(menuPanel);
      menuPanel.addEventListener("scroll", onDynamicScroll, { passive: true });
      restoreDynamicPanel(menuPanel);
      if (!props.loading) loadMoreRequested = false;
    }
    function onDynamicScroll() {
      if (!menuPanel || restoringDynamicScroll || props.loading || loadMoreRequested) return;
      captureDynamicPanel(menuPanel);
      var remaining = menuPanel.scrollHeight - menuPanel.scrollTop - menuPanel.clientHeight;
      if (remaining > 4) {
        global.clearTimeout(loadMoreScrollTimer);
        loadMoreScrollTimer = 0;
        return;
      }
      global.clearTimeout(loadMoreScrollTimer);
      loadMoreScrollTimer = global.setTimeout(function () {
        loadMoreScrollTimer = 0;
        captureDynamicPanel(menuPanel);
        requestLoadMore("scroll");
      }, 80);
    }
    function onSubmenuState(event) {
      var state = event.detail || {};
      runtime.emit(root, state.open ? "b2b:submenu-open" : "b2b:submenu-close", Object.assign(detail(state.source || "canonical-interaction"), {
        submenuLabel: state.label || "",
        depth: state.depth,
        submenuOpen: Boolean(state.open),
        placement: state.placement || null
      }));
    }

    /*
     * The shared contextmenu handler owns position, state, focus and ARIA. This
     * bridge only holds the surface transparent for one painted frame after
     * that canonical positioning has completed. Without the frame boundary,
     * left/top and is-open are committed in the same event task, so a newly
     * positioned (or already controlled-open) panel can skip its entry motion.
     */
    function onContextMenu(event) {
      if (!contextPanel || !root.contains(event.target)) return;
      var activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body && !contextPanel.contains(activeElement)) contextRestoreTarget = activeElement;
      else if (!contextRestoreTarget) contextRestoreTarget = root;
      global.cancelAnimationFrame(contextMotionFrame);
      global.cancelAnimationFrame(contextMotionCommitFrame);
      root.classList.add("is-context-motion-armed");
      var clientX = event.clientX;
      var clientY = event.clientY;
      contextMotionFrame = global.requestAnimationFrame(function () {
        contextMotionFrame = 0;
        if (!root.isConnected || !root.classList.contains("is-open")) {
          root.classList.remove("is-context-motion-armed");
          return;
        }
        var rect = contextPanel.getBoundingClientRect();
        var rootRect = root.getBoundingClientRect();
        var positionedLeft = parseFloat(contextPanel.style.left);
        var positionedTop = parseFloat(contextPanel.style.top);
        var layoutLeft = Number.isFinite(positionedLeft) ? rootRect.left + positionedLeft : rect.left;
        var layoutTop = Number.isFinite(positionedTop) ? rootRect.top + positionedTop : rect.top;
        var originX = Math.max(0, Math.min(contextPanel.offsetWidth, clientX - layoutLeft));
        var originY = Math.max(0, Math.min(contextPanel.offsetHeight, clientY - layoutTop));
        contextPanel.style.setProperty("--c08-context-origin-x", Math.round(originX) + "px");
        contextPanel.style.setProperty("--c08-context-origin-y", Math.round(originY) + "px");
        contextMotionCommitFrame = global.requestAnimationFrame(function () {
          contextMotionCommitFrame = 0;
          root.classList.remove("is-context-motion-armed");
        });
      });
    }
    var contentObserver = new MutationObserver(function (records) {
      if (props.variant !== "动态菜单" || !records.some(function (record) { return record.type === "childList"; })) return;
      replaceDynamicPanel(root.querySelector("[data-popup-panel][data-c08-dynamic]"));
    });
    contentObserver.observe(root, { childList: true });
    root.addEventListener("click", onClick);
    root.addEventListener("b2b:c08-submenu-state", onSubmenuState);
    if (contextPanel) root.addEventListener("contextmenu", onContextMenu);
    if (props.variant === "动态菜单" && menuPanel) {
      prepareDynamicLoadingRow(menuPanel);
      menuPanel.addEventListener("scroll", onDynamicScroll, { passive: true });
      dynamicLayoutFrame = global.requestAnimationFrame(function () {
        dynamicLayoutFrame = 0;
        captureDynamicPanel(menuPanel);
      });
    }

    return function cleanup() {
      global.cancelAnimationFrame(contextMotionFrame);
      global.cancelAnimationFrame(contextMotionCommitFrame);
      global.cancelAnimationFrame(dynamicLayoutFrame);
      global.cancelAnimationFrame(dynamicLayoutCommitFrame);
      global.clearTimeout(loadMoreScrollTimer);
      root.dispatchEvent(new CustomEvent("b2b:c08-dispose", { bubbles: true }));
      observer.disconnect();
      contentObserver.disconnect();
      root.removeEventListener("click", onClick);
      root.removeEventListener("b2b:c08-submenu-state", onSubmenuState);
      if (contextPanel) root.removeEventListener("contextmenu", onContextMenu);
      if (props.variant === "动态菜单" && menuPanel) menuPanel.removeEventListener("scroll", onDynamicScroll);
    };
  }

  adapter.define({
    id: "C-08",
    name: "dropdownMenu",
    rawProps: true,
    styles: ["shared/base.css", "shared/popup-layout.css", "C-02-basic-button/styles.css", "C-08-dropdown-menu/styles.css"],
    defaults: {
      variant: "基础下拉菜单",
      mode: "action",
      triggerMode: "click",
      size: "medium",
      triggerLabel: "更多",
      triggerIcon: null,
      items: [{ label: "操作一" }, { label: "操作二" }, { label: "操作三" }],
      open: false,
      loading: false,
      title: ""
    },
    render: function render(props, H) {
      assertProps(props);
      var items = sourceItems(props.items, props.mode);
      if (props.loading) {
        var firstBottomAction = items.findIndex(function (item) { return item.action; });
        items.splice(firstBottomAction < 0 ? items.length : firstBottomAction, 0, { loading: "加载中" });
      }
      return H.sourceDropdownMenu({
        variant: props.variant,
        static: false,
        role: props.mode === "selection" ? "listbox" : "menu",
        selectionDemo: props.mode === "selection",
        preserveV1SelectionDemo: false,
        triggerMode: props.triggerMode,
        triggerLabel: props.triggerLabel,
        triggerIcon: props.triggerIcon,
        size: props.size,
        title: props.title,
        items: items,
        open: props.open,
        panelAttrs: props.variant === "上下文菜单" ? "" : 'data-popup-panel' + (props.variant === "动态菜单" ? ' data-c08-dynamic' : '') + ' aria-hidden="' + String(!props.open) + '" aria-busy="' + String(props.loading) + '"'
      });
    },
    bind: bindEventBridge,
    update: "rerender",
    validate: function validate(root, props) {
      var errors = [];
      var panel = root.querySelector("[data-popup-panel], [data-context-menu-panel], .context-menu-panel");
      var trigger = root.querySelector("[data-popup-trigger]");
      if (!panel || !panel.matches(".demo-menu.is-component-menu")) errors.push("C-08 menu panel anatomy is incomplete");
      if (!root.hasAttribute("data-source-dropdown-menu")) errors.push("C-08 must mount the canonical source root");
      if (root.getAttribute("data-component-interaction-source") !== "shared") errors.push("C-08 must use the shared delegated interaction");
      if (root.dataset.dropdownSize !== props.size || root.dataset.dropdownHeight !== String(sizePixels[props.size])) errors.push("C-08 size metadata is out of sync");
      if (panel && !panel.classList.contains("is-size-" + props.size)) errors.push("C-08 panel size class is out of sync");
      if (root.querySelector(".context-file-table, .context-file-row")) errors.push("C-08 Renderer must not clone the context specimen business stage");
      if (props.variant === "上下文菜单") {
        if (!root.matches(".context-menu-stage[data-context-menu-stage]")) errors.push("C-08 context root must preserve the v1 context-menu-stage anatomy");
        if (root.getAttribute("aria-expanded") !== String(root.classList.contains("is-open"))) errors.push("C-08 context aria-expanded is out of sync");
        if (panel && panel.getAttribute("aria-hidden") !== String(!root.classList.contains("is-open"))) errors.push("C-08 context panel aria-hidden is out of sync");
      } else {
        if (!root.matches(".interactive-dropdown[data-popup-root]")) errors.push("C-08 popup root anatomy is incomplete");
        if (!trigger || trigger.getAttribute("aria-expanded") !== String(root.classList.contains("is-open"))) errors.push("C-08 trigger aria-expanded is out of sync");
        if (panel.getAttribute("aria-hidden") !== String(!root.classList.contains("is-open"))) errors.push("C-08 panel aria-hidden is out of sync");
      }
      if (!panel || !panel.querySelector(".demo-menu-item")) errors.push("C-08 requires actionable menu items");
      if (panel) validateRenderedItems(panel, props.items, props.mode, "C-08.items", errors);
      if (props.variant === "级联菜单" && panel) {
        var submenuOwners = Array.from(panel.querySelectorAll(".demo-menu-item.has-child[data-submenu-owner]"));
        if (!submenuOwners.length || submenuOwners.some(function (owner) {
          var submenu = owner.querySelector(":scope > .submenu-panel[data-submenu-panel]");
          return !submenu || owner.getAttribute("aria-haspopup") !== "menu" || owner.getAttribute("aria-expanded") !== String(submenu.getAttribute("aria-hidden") === "false") || owner.getAttribute("aria-disabled") === "true" && owner.getAttribute("tabindex") !== "-1";
        })) errors.push("C-08 cascade anatomy or submenu ARIA is incomplete");
      }
      if (props.variant === "辅助标题" && (!panel || !panel.querySelector(":scope > .menu-group-title[data-menu-auxiliary-title]"))) errors.push("C-08 title anatomy is incomplete");
      if (props.variant === "分组" && (!panel || !panel.querySelector(":scope > .menu-divider") || panel.querySelector(":scope > .menu-group-title[data-menu-structural-title]"))) errors.push("C-08 grouped anatomy must use dividers without titles");
      if (props.variant === "动态菜单" && (panel && panel.getAttribute("aria-busy") !== String(props.loading) || props.loading && (!panel || !panel.querySelector(":scope > .menu-loading-row[role='status'][aria-label='正在加载']")))) errors.push("C-08 loading anatomy is incomplete");
      if (props.variant === "复杂信息菜单项" && (!panel || !panel.querySelector(".menu-item-main small"))) errors.push("C-08 complex information anatomy is incomplete");
      if (root.isConnected && panel) {
        var style = getComputedStyle(panel);
        if (style.paddingTop !== "8px" || style.paddingBottom !== "8px" || style.paddingLeft !== "4px" || style.paddingRight !== "4px") errors.push("C-08 panel padding must be 8px block / 4px inline");
        if (style.backgroundColor === "transparent" || style.backgroundColor === "rgba(0, 0, 0, 0)") errors.push("C-08 canonical surface background is missing");
        if (parseFloat(style.borderTopWidth) < 1) errors.push("C-08 canonical surface border is missing");
        if (style.borderRadius !== "6px") errors.push("C-08 surface must use Radius-S (6px)");
        if (style.boxShadow === "none") errors.push("C-08 canonical float shadow is missing");
        var maxWidthIsSafe = props.variant === "上下文菜单" ? panel.getBoundingClientRect().width <= 420.6 : style.maxWidth === "420px";
        if (style.minWidth !== "55px" || !maxWidthIsSafe || style.maxHeight !== "480px") errors.push("C-08 surface bounds must remain 55px / 420px / 480px");
        if (style.clipPath !== "none" || style.transitionProperty.indexOf("clip-path") >= 0) errors.push("C-08 menu motion must not clip the float shadow");
        var firstRenderedItem = panel.querySelector(":scope > .demo-menu-item");
        if (firstRenderedItem) {
          var firstItemStyle = getComputedStyle(firstRenderedItem);
          var expectedItemHeight = props.variant === "复杂信息菜单项" ? complexItemHeights[props.size] : itemHeights[props.size];
          if (parseFloat(firstItemStyle.minHeight) !== expectedItemHeight) errors.push("C-08 item height geometry is out of sync");
          if (firstItemStyle.paddingLeft !== "12px" || firstItemStyle.paddingRight !== "12px") errors.push("C-08 item inline padding must remain 12px");
          var firstItemIcon = firstRenderedItem.querySelector(":scope > .menu-item-main > .b2b-icon:first-child, :scope > .b2b-icon:last-child");
          if (firstItemIcon && parseFloat(getComputedStyle(firstItemIcon).fontSize) !== iconSizes[props.size]) errors.push("C-08 item icon geometry is out of sync");
        }
        if (props.variant !== "上下文菜单" && trigger && parseFloat(getComputedStyle(trigger).height) !== sizePixels[props.size]) errors.push("C-08 trigger height geometry is out of sync");
        if (props.variant === "级联菜单" && (style.overflowX !== "visible" || style.overflowY !== "visible" || style.clipPath !== "none")) errors.push("C-08 cascade parent must remain visible and unclipped");
      }
      return errors;
    }
  });
})(window);
