(function registerComponentSpecimens() {
  "use strict";
  var D = window.B2BDesignSource;
  var treeSelectSequence = 0;
  var timePickerSequence = 0;
  var popoverSequence = 0;
  var accordionSequence = 0;
  var datePickerSequence = 0;
  var dialogSequence = 0;
  var checkboxErrorSequence = 0;
  var uploadAssetBase = (function resolveUploadAssetBase() {
    var script = document.currentScript;
    if (script && script.src) return new URL("../../icons/e10-file-types/", script.src).href;
    return new URL("icons/e10-file-types/", document.baseURI).href;
  })();

  var emptyAssetBase = document.currentScript && document.currentScript.src
    ? new URL("../C-36-empty-state/assets/", document.currentScript.src).href
    : new URL("components/C-36-empty-state/assets/", document.baseURI).href;

  function icon(name, className) {
    return '<span class="b2b-icon ' + (className || "") + '" aria-hidden="true">' + name + "</span>";
  }

  function dialogStatusIcon(kind) {
    var tone = kind || "info";
    var glyph = tone === "success" ? "check_circle" : tone === "warning" ? "error" : tone === "error" ? "cancel" : "info";
    return icon(glyph, "dialog-status-icon is-filled is-" + tone);
  }

  function cell(label, content, className) {
    return '<div class="specimen-cell ' + (className || "") + '"><div class="specimen-stage">' + content + '</div><span class="specimen-label">' + label + "</span></div>";
  }

  function row(title, cells, note) {
    return '<section class="specimen-row"><div class="specimen-row-head"><strong>' + title + '</strong>' + (note ? '<span>' + note + "</span>" : "") + '</div><div class="specimen-matrix">' + cells.join("") + "</div></section>";
  }

  function button(label, variant, attrs, prefix) {
    return '<button class="b2b-button ' + (variant || "") + '" ' + (attrs || "") + '>' + (prefix ? icon(prefix) : "") + label + "</button>";
  }

  /*
   * Canonical C-02—C-06 button-family factories.
   *
   * These functions only consolidate source anatomy that the frozen v1
   * specimens assembled from button(), popupButton(), iconTooltipButton(),
   * dropdown() and sourceDropdownMenu(). They intentionally contain no API
   * schema, specimen board, documentation controls or public event bridge.
   */
  function sourceBasicButton(options) {
    var opts = options || {};
    var variant = opts.variant || "secondary-gray";
    var size = opts.size || "medium";
    var width = opts.width || "default";
    var sizePixels = {
      mini: 24,
      small: 28,
      medium: 32,
      large: 36,
      xlarge: 40
    }[size];
    if (!sizePixels) throw new Error("C-02 canonical size must be mini, small, medium, large or xlarge; received " + String(size));
    if (["default", "long"].indexOf(width) < 0) throw new Error("C-02 canonical width must be default or long; received " + String(width));
    var variantClass = {
      primary: "is-primary",
      danger: "is-danger-solid",
      "secondary-blue": "is-secondary-blue",
      "secondary-danger": "is-danger",
      "secondary-gray": ""
    }[variant] || "";
    var sizeClass = "is-h" + sizePixels;
    var loading = Boolean(opts.loading);
    var disabled = Boolean(opts.disabled || loading);
    var classes = [
      "b2b-button",
      variantClass,
      sizeClass,
      loading ? "is-state-loading" : "",
      width === "long" ? "is-long" : "is-width-default"
    ].filter(Boolean).join(" ");
    var leading = loading
      ? icon("progress_activity", "button-spinner")
      : (opts.icon ? icon(opts.icon) : "");
    return '<button class="' + classes + '" type="button" data-source-basic-button data-button-variant="' + variant + '" data-button-size="' + size + '" data-button-height="' + sizePixels + '" data-button-width="' + width + '" aria-busy="' + loading + '" aria-disabled="' + disabled + '"' + (disabled ? " disabled" : "") + ">" + leading + (opts.label || "Button") + "</button>";
  }

  function sourceTextButton(options) {
    var opts = options || {};
    var variant = opts.variant || "Button_Text";
    var disabled = Boolean(opts.disabled);
    var toneClass = opts.tone === "neutral" ? " is-neutral" : (opts.tone === "danger" ? " is-danger" : "");
    var tagName = variant === "Link" ? "a" : "button";
    var className = variant === "Button_Text"
      ? "b2b-button is-text" + toneClass
      : (variant === "Button_Link" ? "b2b-link-button" : "b2b-plain-link");
    var attrs = variant === "Link"
      ? (opts.href && !disabled ? ' href="' + opts.href + '"' : "") + (disabled ? ' tabindex="-1"' : "")
      : ' type="button"' + (disabled ? " disabled" : "");
    var leading = opts.leadingIcon ? icon(opts.leadingIcon, "is-leading-icon") : "";
    var trailing = opts.trailingArrow ? icon(opts.trailingArrow, "is-trailing-arrow") : "";
    return '<span class="b2b-text-control-source" data-text-variant="' + variant + '"><' + tagName + ' class="' + className + '" data-text-control data-text-variant="' + variant + '" aria-disabled="' + disabled + '"' + attrs + ">" + leading + (opts.label || "Text Button") + trailing + "</" + tagName + "></span>";
  }

  function sourceIconButton(options) {
    var opts = options || {};
    var variant = opts.variant || "Button_Icon";
    var size = Number(opts.size || 28);
    var items = Array.isArray(opts.items) ? opts.items : [];
    var tooltip = opts.tooltip !== false;

    function sourceControl(item, index, menuTrigger) {
      var data = item || {};
      var label = data.label || opts.label || "更多操作";
      // Selection belongs to an icon-group item. A standalone icon button is
      // an action, not a toggle; menu-trigger emphasis is derived from open.
      var selected = Boolean(data.selected);
      var expanded = Boolean(menuTrigger && opts.expanded);
      var variantClass = variant === "Outlined icon button" ? "is-outlined-round" : "is-subtle";
      var classes = "b2b-button is-icon " + variantClass + " is-h" + size + (selected || expanded ? " is-selected" : "");
      var attrs = 'type="button" aria-label="' + label + '" data-icon-index="' + index + '"';
      if (opts.disabled || data.disabled) attrs += " disabled";
      if (selected) attrs += ' aria-pressed="true"';
      if (menuTrigger) attrs += ' data-popup-trigger aria-haspopup="menu" aria-expanded="' + expanded + '"';
      if (opts.attrs) attrs += " " + opts.attrs;
      return '<span class="button-tooltip-anchor icon-tooltip-anchor' + (tooltip ? "" : " is-tooltip-disabled") + '"><button class="' + classes + '" ' + attrs + ">" + icon(data.icon || opts.icon || "more_horiz") + "</button>" + (tooltip ? '<span class="button-tooltip" role="tooltip">' + label + "</span>" : "") + "</span>";
    }

    if (variant === "menu trigger") {
      var menuItems = items.length ? items : [
        { label: "复制", icon: "content_copy" },
        { label: "分享", icon: "share" },
        { label: "删除", icon: "delete", danger: true }
      ];
      var panel = sourceDropdownMenu({
        items: menuItems.map(function (item) {
          var data = typeof item === "string" ? { label: item } : item;
          return Object.assign({}, data, { role: "menuitem" });
        }),
        static: false,
        panelOnly: true,
        componentReference: false,
        panelAttrs: 'data-popup-panel aria-hidden="' + String(!opts.expanded) + '"'
      });
      return '<span class="b2b-icon-control-source" data-icon-variant="' + variant + '"><span class="interactive-dropdown is-align-end icon-more-dropdown' + (opts.expanded ? " is-open" : "") + '" data-popup-root data-component-reference="C-08">' + sourceControl(null, 0, true) + panel + "</span></span>";
    }

    if (variant === "icon group") {
      var groupItems = items.length ? items : [
        { icon: "format_align_left", label: "左对齐" },
        { icon: "format_align_center", label: "居中对齐" },
        { icon: "format_align_right", label: "右对齐" }
      ];
      return '<span class="b2b-icon-control-source" data-icon-variant="' + variant + '" role="group" aria-label="' + (opts.label || "图标按钮组") + '">' + groupItems.map(function (item, index) {
        return sourceControl(item, index, false);
      }).join("") + "</span>";
    }

    return '<span class="b2b-icon-control-source" data-icon-variant="' + variant + '">' + sourceControl(null, 0, false) + "</span>";
  }

  function sourceRoundedButton(options) {
    var opts = options || {};
    var roundedVariant = opts.variant || "Primary";
    var roundedSize = opts.size || "medium";
    var sizePixels = { mini: 24, small: 28, medium: 32, large: 36, xlarge: 40 }[roundedSize] || 32;
    var width = opts.width || "default";
    var iconPlacement = opts.iconPlacement || "none";
    var variantClass = roundedVariant === "Secondary-Primary"
      ? "is-secondary-blue"
      : (roundedVariant === "Outlined" ? "is-rounded-outlined" : "is-primary");
    var loading = Boolean(opts.loading);
    var disabled = Boolean(opts.disabled || loading);
    var classes = [
      "b2b-button",
      "is-pill",
      variantClass,
      "is-h" + sizePixels,
      loading ? "is-state-loading" : "",
      width === "long" ? "is-long" : "is-width-default"
    ].filter(Boolean).join(" ");
    var leading = loading
      ? icon("progress_activity", "button-spinner")
      : (iconPlacement === "leading" ? icon(opts.icon, "is-leading-icon") : "");
    var trailing = !loading && iconPlacement === "trailing" ? icon(opts.icon, "is-trailing-icon") : "";
    return '<button class="' + classes + '" type="button" data-source-rounded-button data-rounded-variant="' + roundedVariant + '" data-rounded-icon-placement="' + iconPlacement + '" data-button-size="' + roundedSize + '" data-button-height="' + sizePixels + '" data-button-width="' + width + '" aria-busy="' + loading + '" aria-disabled="' + disabled + '"' + (disabled ? " disabled" : "") + ">" + leading + (opts.label || "Rounded Button") + trailing + "</button>";
  }

  function sourceMenuButton(options) {
    var opts = options || {};
    var variant = opts.variant || "Split button";
    var size = Number(opts.size || 32);
    var appearance = opts.appearance || "secondary-gray";
    var appearanceClass = appearance === "primary"
      ? "is-primary"
      : (appearance === "secondary-blue" ? "is-secondary-blue" : "");
    var sizeClass = { 24: "is-h24", 28: "is-h28", 32: "is-h32", 36: "is-h36", 40: "is-h40" }[size] || "";
    var disabled = Boolean(opts.disabled);

    function safeText(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function sourceTrigger(label, glyph, ariaLabel, primary) {
      var iconOnly = !label;
      var iconName = glyph || "expand_more";
      var classes = ["b2b-button", appearanceClass, sizeClass, iconOnly ? "is-icon" : "", !primary && opts.open ? "is-expanded" : ""].filter(Boolean).join(" ");
      var attrs = 'type="button"';
      if (primary) attrs += " data-split-primary";
      else attrs += ' data-popup-trigger aria-haspopup="menu" aria-expanded="' + Boolean(opts.open) + '"';
      if (ariaLabel) attrs += ' aria-label="' + safeText(ariaLabel) + '"';
      if (disabled) attrs += " disabled";
      if (primary) return '<button class="' + classes + '" ' + attrs + ">" + (opts.mainIcon ? icon(opts.mainIcon) : "") + safeText(opts.label || "创建") + "</button>";
      var labelMarkup = label ? '<span class="popup-button-label">' + safeText(label) + "</span>" : "";
      var iconMarkup = '<span class="b2b-icon" ' + (iconName === "expand_more" ? "data-popup-arrow" : "data-popup-leading-icon") + ' aria-hidden="true">' + iconName + "</span>";
      return '<button class="' + classes + '" ' + attrs + ">" + (iconName === "expand_more" ? labelMarkup + iconMarkup : iconMarkup + labelMarkup) + "</button>";
    }

    var trigger;
    if (variant === "Split button") {
      trigger = '<span class="split-button">' + sourceTrigger(opts.label, null, null, true) + sourceTrigger("", "expand_more", "更多" + (opts.label || "创建") + "方式", false) + "</span>";
    } else if (variant === "Menu button") {
      trigger = sourceTrigger(opts.label || "导出", "expand_more", null, false);
    } else {
      trigger = sourceTrigger("", opts.icon || "more_horiz", opts.label || "更多操作", false);
    }
    var panel = sourceDropdownMenu({
      items: (Array.isArray(opts.items) ? opts.items : []).map(function (item) {
        var data = typeof item === "string" ? { label: item } : item;
        return Object.assign({}, data, { label: safeText(data.label), role: "menuitem" });
      }),
      static: false,
      panelOnly: true,
      componentReference: false,
      panelAttrs: 'data-popup-panel aria-hidden="' + String(!opts.open) + '"'
    });
    return '<span class="b2b-menu-button-source" data-menu-variant="' + variant + '" data-menu-appearance="' + appearance + '" data-menu-size="' + size + '"><span class="interactive-dropdown' + (variant === "Overflow Menu" ? " is-align-end" : "") + (opts.open ? " is-open" : "") + '" data-popup-root data-component-reference="C-08">' + trigger + panel + "</span></span>";
  }

  function textTimezoneCard(aligned) {
    var zones = ["(GMT−11:00)纽埃时间", "(GMT−11:00)萨摩亚标准时间", "(GMT−11:00)纽埃时间", "(GMT−11:00)纽埃时间", "(GMT−11:00)萨摩亚标准时间"];
    return '<article class="text-timezone-card ' + (aligned ? "has-alignment-guide" : "") + '"><strong>辅助时区</strong><div class="text-timezone-list">' + zones.map(function (zone) {
      return '<button type="button"><span>' + zone + '</span>' + icon("expand_more") + '</button>';
    }).join("") + '</div>' + button("添加", "is-text" + (aligned ? " is-state-hover" : ""), 'type="button"', "add") + '</article>';
  }

  function textBranchCard(aligned) {
    function conditionRow(index) {
      return '<div class="text-condition-row"><span class="text-condition-index">' + index + '</span><button type="button"><span>左值</span>' + icon("expand_more") + '</button><button type="button"><span>等于</span>' + icon("expand_more") + '</button><button type="button"><span>指定值</span>' + icon("expand_more") + '</button><button type="button"><span>右值</span>' + icon("expand_more") + '</button>' + icon("delete", "text-condition-delete") + '</div>';
    }
    return '<article class="text-branch-card ' + (aligned ? "has-alignment-guide" : "") + '"><header><span class="text-branch-mark"></span><strong>分支 1</strong><div>' + icon("unfold_more") + icon("content_copy") + icon("help") + icon("more_horiz") + '</div></header><div class="text-branch-body"><strong>分支条件</strong><section class="text-condition-group"><div class="text-condition-title">' + icon("expand_more") + '<span>线上环境</span></div>' + conditionRow(1) + '<span class="text-condition-and">AND</span>' + conditionRow(2) + button("添加", "is-text" + (aligned ? " is-state-hover" : ""), 'type="button"', "add") + '<div class="text-condition-collapsed">' + icon("chevron_right") + '<span>开发环境</span>' + icon("info") + '</div></section><footer><span>自定义条件逻辑 ' + icon("info") + '</span><span class="text-toggle" aria-hidden="true"></span><span>否，计算结果需满足所有筛选条件</span></footer></div></article>';
  }

  function textMeetingCard() {
    return '<div class="text-meeting-reference"><article class="text-meeting-card has-alignment-guide"><button class="text-meeting-expand" type="button" aria-label="展开">' + icon("open_in_full") + '</button><h3>添加主题</h3><div class="text-meeting-fields"><div>' + icon("group_add") + '<span class="is-placeholder">添加联系人、群或邮箱</span></div><div>' + icon("event") + '<span>2024年9月26日　 18:00　–　18:30　 2024年9月26日</span></div><div>' + icon("videocam") + '<span>System 视频会议</span></div><div>' + icon("meeting_room") + button("添加会议室", "is-text", 'type="button"') + '</div><div>' + icon("location_on") + '<span class="is-placeholder">添加地点</span></div><div>' + icon("event_available") + '<span class="text-meeting-select">无需签到 ' + icon("expand_more") + '</span></div></div>' + button("更多选项", "is-text is-state-hover", 'type="button"') + '<div class="text-meeting-actions">' + button("取消", "", 'type="button"') + button("确定", "is-primary", 'type="button"') + '</div></article></div>';
  }

  function contextMenuSpecimen() {
    var files = [
      ["The Designer's Wife Sleep Better", "Alexander", "23/03/2018"],
      ["Golden Star Series: Inside the Design Process", "Howard", "23/03/2018"],
      ["Modern Crowd | Companies and Creatives Profiles", "Howard", "23/03/2018"],
      ["Editorial Resources and Reference Collection", "Commons", "23/03/2018"],
      ["Samsung's $1,000 Monitor Stand", "Kinney", "23/03/2018"]
    ];
    var rows = files.map(function (file) {
      return '<div class="context-file-row" tabindex="0"><strong>' + file[0] + '</strong><span>' + file[1] + '</span><span>' + file[2] + '</span><button class="b2b-button is-icon is-text is-neutral" type="button" aria-label="更多操作">' + icon("more_horiz") + '</button></div>';
    }).join("");
    var panel = sourceDropdownMenu({
      variant: "上下文菜单",
      static: true,
      panelClass: "context-menu-panel",
      componentReference: false,
      items: [
        { label: "在新标签页打开", icon: "open_in_new", role: "menuitem" },
        { divider: true },
        { label: "分享", icon: "share", role: "menuitem" },
        { label: "复制链接", icon: "link", role: "menuitem" },
        { divider: true },
        { label: "创建副本", role: "menuitem" },
        { divider: true },
        { label: "添加到文件夹", role: "menuitem" },
        { label: "添加到快速访问", role: "menuitem" },
        { label: "添加到收藏", role: "menuitem" },
        { divider: true },
        { label: "取消置顶", icon: "keep_off", role: "menuitem" }
      ]
    });
    return '<div class="context-menu-stage is-open" data-context-menu-stage tabindex="0"><div class="context-file-table"><div class="context-file-head"><strong>文件名称</strong><strong>所有者</strong><strong>修改日期</strong>' + icon("grid_view") + "</div>" + rows + "</div>" + panel + "</div>";
  }

  function popupButton(label, variant, attrs, glyph) {
    var iconName = glyph || "expand_more";
    var isArrow = iconName === "expand_more" || iconName === "expand_less";
    var labelMarkup = label ? '<span class="popup-button-label">' + label + "</span>" : "";
    var iconMarkup = '<span class="b2b-icon" ' + (isArrow ? "data-popup-arrow" : "data-popup-leading-icon") + ' aria-hidden="true">' + iconName + "</span>";
    return '<button class="b2b-button ' + (variant || "") + '" ' + (attrs || "") + ">" + (isArrow ? labelMarkup + iconMarkup : iconMarkup + labelMarkup) + "</button>";
  }

  function sourceDropdownMenu(options) {
    var opts = options || {};
    var items = Array.isArray(opts.items) ? opts.items : [];
    var role = opts.role || (opts.selectionDemo ? "listbox" : "menu");
    var panelTag = opts.panelTag || "div";
    var requestedSize = opts.size || null;
    var semanticSize = requestedSize;
    var sizePixels = semanticSize ? {
      mini: 24,
      small: 28,
      medium: 32,
      large: 36,
      xlarge: 40
    }[semanticSize] : null;
    if (requestedSize && !sizePixels) throw new Error("C-08 canonical size must be mini, small, medium, large or xlarge; received " + String(requestedSize));

    function safeText(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    var panelClass = "demo-menu";
    if (!opts.nested) {
      if (opts.static !== false) panelClass += " is-static";
      else panelClass += " is-component-menu";
    }
    if (opts.variant === "级联菜单") panelClass += " has-submenu";
    if (opts.variant === "复杂信息菜单项") panelClass += " is-complex";
    if (semanticSize) panelClass += " is-size-" + semanticSize;
    if (opts.wide) panelClass += " is-wide";
    if (opts.scroll) panelClass += " is-scroll-source";
    if (opts.panelClass) panelClass += " " + opts.panelClass;
    if (opts.variant === "上下文菜单" && panelClass.indexOf("context-menu-panel") < 0) panelClass += " context-menu-panel";

    function renderItem(item, index, nested) {
      if (item && item.divider) return '<span class="menu-divider"></span>';
      if (item && item.title) return '<small class="menu-group-title" data-menu-structural-title>' + item.title + "</small>";
      if (item && item.loading) return '<div class="menu-loading-row">' + icon("progress_activity", "button-spinner") + '<span>' + item.loading + "</span></div>";
      var data = typeof item === "string" ? { label: item } : (item || {});
      var children = Array.isArray(data.children) ? data.children : [];
      var classes = "demo-menu-item";
      if (data.hover) classes += " is-state-hover";
      var selected = Boolean(data.selected || opts.selectionDemo && opts.preserveV1SelectionDemo !== false && index === 1 && !nested);
      if (selected) classes += " is-selected";
      if (data.danger) classes += " is-danger";
      if (data.action) classes += " is-action";
      if (children.length) classes += " has-child";
      var attrs = "";
      var submenuOpen = children.length && data.open !== false;
      if (data.role) attrs += ' role="' + data.role + '"';
      else if (children.length) attrs += ' role="menuitem"';
      if (children.length) attrs += ' tabindex="' + (data.disabled ? "-1" : "0") + '" data-submenu-owner aria-haspopup="menu" aria-expanded="' + String(submenuOpen) + '"' + (data.disabled ? ' aria-disabled="true"' : "");
      if (opts.selectionDemo && !nested) attrs += ' role="option" aria-selected="' + String(selected) + '"';
      if (data.disabled && !children.length) attrs += " disabled";
      var label = data.label == null ? "" : String(data.label);
      attrs += ' data-menu-label="' + label + '"';
      var labelMarkup = data.strong ? "<strong>" + label + "</strong>" : label;
      var descriptionMarkup = data.description ? "<small>" + data.description + "</small>" : "";
      var textMarkup = "<span>" + labelMarkup + descriptionMarkup + "</span>";
      var main = data.icon
        ? '<span class="menu-item-main">' + icon(data.icon, data.iconClass || "") + textMarkup + "</span>"
        : (data.description || data.strong ? '<span class="menu-item-main">' + textMarkup + "</span>" : textMarkup);
      if (data.auxiliary) main += "<small>" + data.auxiliary + "</small>";
      if (selected) {
        var selectionIcon = icon("check", "");
        if (opts.selectionDemo) selectionIcon = selectionIcon.replace('aria-hidden="true"', 'aria-hidden="true" data-menu-selection-indicator');
        main += selectionIcon;
      }
      if (children.length) {
        main += icon("chevron_right");
        main += sourceDropdownMenu({
          items: children,
          role: "menu",
          static: true,
          panelTag: "span",
          panelClass: "submenu-panel" + (submenuOpen ? " is-force-open" : ""),
          panelAttrs: 'data-submenu-panel aria-hidden="' + String(!submenuOpen) + '"',
          nested: true,
          size: semanticSize,
          componentReference: false
        });
      }
      var itemTag = children.length ? "div" : "button";
      return "<" + itemTag + ' class="' + classes + '"' + attrs + ">" + main + "</" + itemTag + ">";
    }

    var content = "";
    if (opts.title) content += '<small class="menu-group-title" data-menu-auxiliary-title>' + opts.title + "</small>";
    content += items.map(function (item, index) { return renderItem(item, index, Boolean(opts.nested)); }).join("");
    var panelAttrs = opts.panelAttrs || "";
    if (opts.variant === "上下文菜单" && opts.static === false && !panelAttrs) {
      panelAttrs = 'data-context-menu-panel aria-hidden="' + String(!opts.open) + '"';
    }
    var panel = "<" + panelTag + ' class="' + panelClass + '" role="' + role + '"' + (semanticSize ? ' data-dropdown-panel-size="' + semanticSize + '"' : "") + (opts.componentReference === false ? "" : ' data-component-reference="C-08"') + (panelAttrs ? " " + panelAttrs : "") + ">" + content + "</" + panelTag + ">";
    if (opts.panelOnly || opts.static !== false) return panel;

    if (opts.variant === "上下文菜单") {
      return '<div class="context-menu-stage' + (opts.open ? " is-open" : "") + '" data-context-menu-stage data-source-dropdown-menu' + (semanticSize ? ' data-dropdown-size="' + semanticSize + '" data-dropdown-height="' + sizePixels + '"' : "") + ' tabindex="0" aria-haspopup="menu" aria-expanded="' + String(Boolean(opts.open)) + '" aria-label="' + (opts.triggerLabel || "上下文菜单区域") + '">' + (opts.contextContent || "") + panel + "</div>";
    }
    var triggerAttrs = 'data-popup-trigger' + (opts.triggerMode === "hover" ? " data-popup-hover" : "") + ' aria-haspopup="' + role + '" aria-expanded="' + String(Boolean(opts.open)) + '"';
    var triggerSizeClass = sizePixels ? "is-h" + sizePixels : "";
    var triggerVariant = [opts.triggerVariant || "", triggerSizeClass].filter(Boolean).join(" ");
    var trigger = opts.trigger || popupButton(opts.triggerLabel || "操作", triggerVariant, triggerAttrs, opts.triggerIcon || null);
    var rootClass = opts.rootClass || "";
    if (opts.triggerMode === "hover" && rootClass.indexOf("is-hover-trigger") < 0) rootClass += (rootClass ? " " : "") + "is-hover-trigger";
    return '<div class="interactive-dropdown ' + rootClass + (opts.open ? " is-open" : "") + '" data-popup-root data-component-reference="C-08" data-source-dropdown-menu' + (semanticSize ? ' data-dropdown-size="' + semanticSize + '" data-dropdown-height="' + sizePixels + '"' : "") + ">" + trigger + panel + "</div>";
  }

  function iconTooltipButton(iconName, label, variant, attrs) {
    return '<span class="button-tooltip-anchor icon-tooltip-anchor">' + button("", "is-icon " + (variant || ""), 'aria-label="' + label + '" ' + (attrs || ""), iconName) + '<span class="button-tooltip" role="tooltip">' + label + "</span></span>";
  }

  function floatingTooltipButton(iconName, label, variant, attrs) {
    return '<span class="button-tooltip-anchor floating-tooltip-anchor"><button class="floating-action ' + (variant || "") + '" aria-label="' + label + '" ' + (attrs || "") + '>' + icon(iconName) + '</button><span class="button-tooltip" role="tooltip">' + label + "</span></span>";
  }

  /*
   * Canonical C-07 factory. This consolidates the five frozen v1 specimen
   * anatomies without carrying specimen rows, demo copy or public API logic.
   * State changes remain owned by shared/interactions.js through the
   * data-source-floating hooks emitted here.
   */
  function sourceFloatingButton(options) {
    var opts = options || {};
    var variant = opts.variant || "secondary";
    var appearance = opts.appearance || (variant === "primary" ? "primary" : "secondary");
    var size = Number(opts.size || 48);
    var iconName = opts.icon || "help";
    var label = opts.label || "快捷操作";
    var disabled = Boolean(opts.disabled);
    var expanded = Boolean(opts.expanded);
    var items = Array.isArray(opts.items) ? opts.items : [];
    var rootClass = "is-" + variant;
    var sourceAttrs = ' data-source-floating data-floating-variant="' + variant + '"';

    function actionClass(extra) {
      return "floating-action is-size-" + size + (appearance === "primary" ? " is-primary" : "") + (extra ? " " + extra : "");
    }

    function tooltipAction(item, index, child) {
      var data = item || {};
      var itemLabel = data.label || label;
      var attrs = 'type="button"';
      if (disabled || data.disabled) attrs += " disabled";
      if (index !== undefined && index !== null) attrs += ' data-floating-index="' + index + '" role="menuitem"';
      return floatingTooltipButton(data.icon || iconName, itemLabel, actionClass(child ? "floating-child" : "").replace(/^floating-action\s*/, ""), attrs);
    }

    if (variant === "menu") {
      rootClass = "floating-menu-demo" + (expanded ? " is-expanded" : "");
      var children = '<div class="floating-children" role="menu" aria-hidden="' + String(!expanded) + '">' + items.map(function (item, index) {
        return tooltipAction(typeof item === "string" ? { label: item } : item, index, true);
      }).join("") + "</div>";
      var trigger = '<button class="' + actionClass("") + '" type="button" data-floating-toggle aria-haspopup="menu" aria-expanded="' + String(expanded) + '" aria-label="' + label + '"' + (disabled ? " disabled" : "") + ">" + icon(iconName, "floating-trigger-closed") + icon("close", "floating-trigger-open") + "</button>";
      return '<div class="' + rootClass + '" data-floating-menu' + sourceAttrs + ">" + children + trigger + "</div>";
    }

    if (variant === "message") {
      var messageText = opts.messageText || (String(opts.badge === undefined ? 0 : opts.badge) + " 条新消息");
      var avatar = opts.avatarText ? avatarSpec({ text: opts.avatarText, size: 24, label: opts.avatarLabel || opts.avatarText, as: "span" }) : "";
      return '<button class="message-float' + (appearance === "primary" ? " is-primary" : "") + '" type="button" aria-label="' + label + '"' + sourceAttrs + (disabled ? " disabled" : "") + ">" + icon(iconName) + avatar + messageText + "</button>";
    }

    if (variant === "official-text") {
      return '<button class="official-float' + (appearance === "primary" ? " is-primary" : "") + '" type="button" aria-label="' + label + '"' + sourceAttrs + (disabled ? " disabled" : "") + ">" + icon(iconName) + "<span>" + label + "</span></button>";
    }

    return tooltipAction(null, null, false).replace('<span class="button-tooltip-anchor floating-tooltip-anchor"', '<span class="button-tooltip-anchor floating-tooltip-anchor"' + sourceAttrs);
  }

  function input(value, className, attrs) {
    return '<input class="b2b-input ' + (className || "") + '" value="' + (value || "") + '" ' + (attrs || "") + ">";
  }

  function choice(type, label, state) {
    var checked = state === "checked" || state === "indeterminate" ? " checked" : "";
    var disabled = state === "disabled" ? " disabled" : "";
    return '<label class="choice is-' + state + '"><input type="' + type + '"' + checked + disabled + '><span>' + label + "</span></label>";
  }

  function selectShell(label, state, multiple) {
    return '<button class="select-shell is-' + state + '" type="button" data-popup-trigger aria-haspopup="listbox" aria-expanded="' + (state === "expanded") + '"><span>' + (multiple ? '<span class="b2b-tag">已选项 ' + icon("close") + "</span>" : label) + '</span><span class="b2b-icon" data-popup-arrow aria-hidden="true">expand_more</span></button>';
  }

  function selectOption(item, index, selected, activeIndex) {
    var data = typeof item === "string" ? { label: item } : item;
    var isSelected = selected.indexOf(data.label) >= 0;
    var leading = data.avatar ? avatarSpec({ text: data.avatar, size: 24, label: data.label, as: "span" }) : (data.icon ? icon(data.icon) : "");
    var tag = data.tag ? '<span class="select-option-tag">' + data.tag + "</span>" : "";
    var description = data.description ? '<small>' + data.description + "</small>" : "";
    if (data.group) return '<div class="select-group-title" role="presentation">' + data.group + "</div>";
    return '<button class="source-select-option' + (isSelected ? " is-selected" : "") + (index === activeIndex ? " is-active" : "") + '" type="button" role="option" aria-selected="' + isSelected + '" data-select-option data-value="' + data.label + '" data-index="' + index + '"' + (data.disabled ? " disabled" : "") + '><span class="select-option-content">' + leading + '<span class="select-option-copy"><span>' + tag + data.label + "</span>" + description + "</span></span>" + (isSelected ? icon("check") : "") + "</button>";
  }

  function sourceSelect(options) {
    var opts = options || {};
    var items = opts.items || ["Option 1", "Option 2", "Option 3", "Option 4"];
    var selected = opts.selected || [];
    var multiple = Boolean(opts.multiple);
    var state = opts.state || "default";
    var locked = state === "disabled" || state === "readonly";
    var open = opts.open !== false && (state === "active" || state === "selected-active" || opts.open === true);
    var placeholder = opts.placeholder || "Please select";
    var selectedMarkup = selected.length ? (multiple ? selected.map(function (label) {
      var remove = locked ? "" : '<i role="button" tabindex="0" aria-label="移除 ' + label + '" data-select-remove>' + icon("close") + "</i>";
      return '<span class="source-select-tag" data-select-tag data-value="' + label + '"><span>' + label + "</span>" + remove + "</span>";
    }).join("") : '<span class="source-select-value">' + selected[0] + "</span>") : '<span class="source-select-placeholder">' + placeholder + "</span>";
    var clear = selected.length && opts.clearable !== false && !locked ? '<button class="source-select-clear" type="button" aria-label="清除选择" data-select-clear>' + icon("cancel") + "</button>" : "";
    var arrow = state === "readonly" ? "" : icon("expand_more", "source-select-arrow");
    var search = opts.searchable ? '<div class="source-select-search">' + icon("search") + '<input type="search" value="' + (opts.query || "") + '" placeholder="搜索选项" data-select-search aria-label="搜索选项"><button class="source-select-search-clear" type="button" aria-label="清空搜索内容" data-select-search-clear>' + icon("cancel") + "</button></div>" : "";
    var create = opts.creatable ? '<button class="source-select-create" type="button" data-select-create>+ Create new option</button>' : "";
    var statusContent = state === "loading" ? '<div class="source-select-feedback">' + icon("progress_activity", "button-spinner") + "</div>" : (state === "no-result" ? '<div class="source-select-feedback">No search result</div>' : "");
    var activeIndex = open ? items.findIndex(function (item) {
      var data = typeof item === "string" ? { label: item } : item;
      return !data.group && !data.disabled && selected.indexOf(data.label) >= 0;
    }) : -1;
    if (open && activeIndex < 0) activeIndex = items.findIndex(function (item) {
      var data = typeof item === "string" ? { label: item } : item;
      return !data.group && !data.disabled;
    });
    var visibleItems = statusContent || items.map(function (item, index) { return selectOption(item, index, selected, activeIndex); }).join("");
    return '<div class="source-select is-' + state + (open ? " is-open" : "") + (multiple ? " is-multiple" : "") + (opts.variation ? " is-" + opts.variation : "") + (opts.size ? " is-size-" + opts.size : "") + (opts.position ? " is-position-" + opts.position : "") + '" data-select-demo data-multiple="' + multiple + '" data-clearable="' + (opts.clearable !== false) + '"' + (state === "disabled" ? ' aria-disabled="true"' : "") + ' ' + (opts.attrs || "") + '><div class="source-select-control" data-select-control><button class="source-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="' + open + '"' + (state === "readonly" ? ' aria-readonly="true"' : "") + ' data-select-trigger ' + (opts.triggerAttrs || "") + (state === "disabled" ? " disabled" : "") + '><span class="source-select-selection" data-select-selection>' + selectedMarkup + "</span>" + arrow + "</button>" + clear + "</div>" + (state === "error" ? '<span class="source-select-error">This item cannot be empty</span>' : "") + '<div class="source-select-panel" role="listbox" aria-multiselectable="' + multiple + '" data-select-panel aria-hidden="' + (!open) + '">' + search + '<div class="source-select-options" data-select-options>' + visibleItems + "</div>" + create + "</div></div>";
  }

  function selectStateGrid(variation) {
    return '<div class="select-state-grid">' + [
      sourceSelect({ state: "default", open: false, variation: variation }),
      sourceSelect({ state: "hover", open: false, variation: variation }),
      sourceSelect({ state: "active", open: true, variation: variation }),
      sourceSelect({ state: "selected-active", selected: ["Option 1"], open: true, variation: variation }),
      sourceSelect({ state: "disabled", selected: ["Option 1", "Option 2"], multiple: true, open: false, variation: variation }),
      sourceSelect({ state: "readonly", selected: ["Option 1", "Option 2"], multiple: true, open: false, variation: variation }),
      sourceSelect({ state: "error", open: false, variation: variation })
    ].map(function (specimen, index) { return '<div><small>' + ["Default", "Hover", "Active", "Selected Active", "Disabled", "Readonly", "Error"][index] + "</small>" + specimen + "</div>"; }).join("") + "</div>";
  }

  function menu(items, attrs) {
    return sourceDropdownMenu({ items: items, static: false, panelOnly: true, role: "listbox", selectionDemo: true, panelAttrs: attrs || "" });
  }

  function dropdown(trigger, items, className, open) {
    return sourceDropdownMenu({ items: items, static: false, trigger: trigger, rootClass: className || "", open: Boolean(open), role: "listbox", selectionDemo: true, panelAttrs: 'data-popup-panel aria-hidden="' + (!open) + '"' });
  }

  function actionDropdown(trigger, items, className, open) {
    var actions = (items || []).map(function (item) {
      var data = typeof item === "string" ? { label: item } : item;
      return '<button class="demo-menu-item' + (data.danger ? " is-danger" : "") + '" type="button" role="menuitem"' + (data.attrs ? " " + data.attrs : "") + ">" + (data.icon ? '<span class="menu-item-main">' + icon(data.icon) + "<span>" + data.label + "</span></span>" : data.label) + "</button>";
    }).join("");
    return '<div class="interactive-dropdown ' + (className || "") + (open ? " is-open" : "") + '" data-popup-root data-component-reference="C-08">' + trigger + '<div class="demo-menu is-component-menu" role="menu" data-popup-panel aria-hidden="' + (!open) + '">' + actions + "</div></div>";
  }

  function cascadeOption(label, state, options) {
    var opts = options || {};
    var selected = state === "selected";
    var active = state === "active" || Boolean(opts.active);
    var partial = state === "partial";
    var disabled = state === "disabled";
    var loading = state === "loading";
    var nestedChildren = Array.isArray(opts.children) ? opts.children : [];
    var child = nestedChildren.length > 0 || opts.child !== false;
    var check = opts.checkable ? '<span class="cascade-check" aria-hidden="true">' + (selected ? icon("check") : (partial ? icon("remove") : "")) + "</span>" : "";
    return '<button class="cascade-option ' + (child ? "has-children" : "is-leaf") + (selected ? " is-selected" : "") + (active ? " is-active-path" : "") + (partial ? " is-partial" : "") + (loading ? " is-loading" : "") + '" type="button" data-cascade-option data-cascade-value="' + label + '" data-cascade-child="' + child + '" data-cascade-children="' + encodeURIComponent(JSON.stringify(nestedChildren)) + '" aria-selected="' + (selected || active) + '"' + (opts.checkable ? ' aria-checked="' + (partial ? "mixed" : selected) + '"' : "") + (disabled ? " disabled" : "") + '><span class="cascade-option-main">' + check + (opts.icon ? icon(opts.icon) : "") + '<span data-cascade-option-label>' + label + "</span></span>" + (loading ? icon("progress_activity", "button-spinner") : (child ? icon("chevron_right") : (selected && !opts.checkable ? icon("check", "cascade-selection-check") : ""))) + "</button>";
  }

  function cascadeColumn(items, selectedIndex, options) {
    var opts = options || {};
    return '<div class="cascade-column" role="listbox">' + items.map(function (item, index) {
      var itemData = typeof item === "string" ? { label: item } : item;
      var itemChild = typeof itemData.child === "boolean"
        ? itemData.child
        : (typeof opts.child === "boolean" ? opts.child : Boolean(Array.isArray(itemData.children) && itemData.children.length));
      var state = itemData.disabled ? "disabled" : (itemData.loading ? "loading" : (itemData.partial ? "partial" : (itemData.selected ? "selected" : (itemData.active ? "active" : (index === selectedIndex ? (opts.checkable ? "selected" : (itemChild === false ? "selected" : "active")) : "default")))));
      return cascadeOption(itemData.label, state, {
        child: itemChild,
        children: itemData.children,
        checkable: opts.checkable,
        icon: itemData.icon,
        active: itemData.active
      });
    }).join("") + "</div>";
  }

  function cascadeDemo(label, columns, options) {
    var opts = options || {};
    var sizes = ["mini", "small", "medium", "large", "xlarge"];
    var size = opts.size === undefined ? "medium" : opts.size;
    if (sizes.indexOf(size) < 0) throw new Error("C-09 canonical cascader size must be mini, small, medium, large, or xlarge");
    var open = opts.open !== false;
    var hasValue = opts.hasValue !== undefined ? opts.hasValue : ["请选择", "搜索地区"].indexOf(label) < 0;
    var hasSelection = opts.hasSelection !== undefined ? opts.hasSelection : Boolean((opts.tags || []).length || (!opts.search && hasValue));
    var placeholder = opts.placeholder || (opts.search ? "Search" : "Please select");
    var tagDisplay = opts.tagDisplay === undefined ? "all" : opts.tagDisplay;
    if (["all", "collapsed"].indexOf(tagDisplay) < 0) throw new Error("C-09 canonical cascader tagDisplay must be all or collapsed");
    var tagValues = opts.tags || [];
    var visibleTagValues = tagDisplay === "collapsed" ? tagValues.slice(0, 2) : tagValues;
    var tags = visibleTagValues.map(function (tag) {
      return '<span class="cascade-trigger-tag" data-cascade-tag data-cascade-tag-value="' + tag + '" title="' + tag + '"><span class="cascade-trigger-tag-label">' + tag + '</span><span class="b2b-icon cascade-tag-remove" data-cascade-remove role="button" tabindex="0" aria-label="移除已选项：' + tag + '">close</span></span>';
    }).join("");
    if (tagDisplay === "collapsed" && tagValues.length > visibleTagValues.length) {
      var collapsedCount = tagValues.length - visibleTagValues.length;
      tags += '<span class="cascade-trigger-tag is-count" data-cascade-collapsed-count="' + collapsedCount + '" role="note" tabindex="0" aria-label="还有 ' + collapsedCount + ' 个选中项已收起" title="还有 ' + collapsedCount + ' 个选中项已收起">+' + collapsedCount + '</span>';
    }
    var value = opts.multiple ? '<span class="cascade-trigger-tags" data-cascade-label>' + (tags || placeholder) + '</span>' : '<span class="cascade-trigger-value" data-cascade-label title="' + label + '">' + label + '</span>';
    var searchField = '<input class="cascade-trigger-search" type="text" inputmode="search" data-cascade-search value="' + (opts.searchValue || "") + '" placeholder="' + label + '" aria-label="搜索级联选项">';
    var searchableValue = opts.multiple
      ? '<span class="cascade-multi-search-value"><span class="cascade-trigger-tags" data-cascade-label>' + tags + '</span>' + searchField + '</span>'
      : searchField;
    var trigger = opts.search
      ? '<div class="select-shell cascade-search-trigger' + (open ? " is-expanded" : "") + (hasValue ? " has-value" : "") + (hasSelection ? " has-selection" : "") + '" data-cascader-trigger aria-haspopup="listbox" aria-expanded="' + open + '">' + searchableValue + '<span class="cascade-trigger-actions"><span class="b2b-icon cascade-clear" data-cascade-clear role="button" tabindex="-1" aria-label="清空选择">cancel</span><span class="b2b-icon cascade-search-arrow" data-popup-arrow aria-hidden="true">expand_more</span><span class="b2b-icon cascade-search-icon" data-cascade-search-icon aria-hidden="true">search</span></span></div>'
      : '<button class="select-shell' + (open ? " is-expanded" : "") + (hasValue ? " has-value" : "") + (hasSelection ? " has-selection" : "") + '" type="button" data-cascader-trigger aria-haspopup="listbox" aria-expanded="' + open + '">' + value + '<span class="cascade-trigger-actions"><span class="b2b-icon cascade-clear" data-cascade-clear role="button" tabindex="-1" aria-label="清空选择">cancel</span><span class="b2b-icon" data-popup-arrow aria-hidden="true">expand_more</span></span></button>';
    var indexedColumns = columns.map(function (column, index) {
      return column.replace('class="cascade-column"', 'class="cascade-column" data-cascade-level="' + index + '"');
    });
    var panelContent = opts.loading
      ? '<div class="cascade-popup-feedback is-loading">' + icon("progress_activity", "button-spinner") + '</div>'
      : (opts.noResult ? '<div class="cascade-popup-feedback">No result</div>' : '<div class="cascader-panel">' + indexedColumns.join("") + "</div>");
    return '<div class="cascader-demo is-size-' + size + (open ? " is-open" : "") + (opts.multiple ? " is-multiple" : "") + (opts.search ? " is-searchable" : "") + (opts.selectAny ? " is-select-any" : "") + (opts.expandTrigger === "hover" ? " is-hover-expand" : "") + (hasValue ? " has-value" : "") + (hasSelection ? " has-selection" : "") + (opts.className ? " " + opts.className : "") + '" data-cascader-demo data-cascade-size="' + size + '" data-cascade-placeholder="' + placeholder + '" data-cascade-tag-display="' + tagDisplay + '" data-cascade-values="' + encodeURIComponent(JSON.stringify(tagValues)) + '" data-cascade-select-any="' + Boolean(opts.selectAny) + '" data-cascade-expand="' + (opts.expandTrigger || "click") + '">' + trigger + '<div class="cascader-popup" data-cascader-panel aria-hidden="' + (!open) + '">' + panelContent + "</div></div>";
  }

  function sourceCascader(options) {
    var opts = options || {};
    var variant = opts.variant || "single";
    var multiple = variant === "multiple";
    var searchable = variant === "searchable";
    var columns = (opts.columns || []).map(function (column) {
      return cascadeColumn(column.items || [], Number.isInteger(column.activeIndex) ? column.activeIndex : -1, {
        child: typeof column.hasChildren === "boolean" ? column.hasChildren : undefined,
        checkable: multiple
      });
    });
    var label = opts.valueLabel || opts.placeholder || "请选择";
    return cascadeDemo(label, columns, {
      size: opts.size === undefined ? "medium" : opts.size,
      open: Boolean(opts.open),
      search: searchable,
      multiple: multiple,
      expandTrigger: variant === "hover-expand" ? "hover" : "click",
      hasValue: Boolean(opts.valueLabel || (opts.tags || []).length),
      hasSelection: Boolean(opts.valueLabel || (opts.tags || []).length),
      placeholder: opts.placeholder || "请选择",
      searchValue: searchable ? (opts.valueLabel || "") : "",
      tags: opts.tags || [],
      tagDisplay: opts.tagDisplay === undefined ? "all" : opts.tagDisplay
    });
  }

  var colorBaseValues = { blue: "#3370FF", cyan: "#13C2C2", green: "#34C724", yellow: "#FFC60A", orange: "#FF8800", red: "#F54A45", purple: "#7F3BF5", pink: "#E83E8C", neutral: "#8F959E", none: "#000000" };

  var colorPickerSequence = 0;

  function colorSwatch(hue, tone, selected, valueOverride, options) {
    var opts = options || {};
    var colorValue = valueOverride || colorBaseValues[hue] || "#3370FF";
    var transparent = hue === "none";
    var numeric = parseInt(colorValue.replace("#", ""), 16);
    var red = numeric >> 16 & 255;
    var green = numeric >> 8 & 255;
    var blue = numeric & 255;
    var light = transparent || (red * 299 + green * 587 + blue * 114) / 1000 > 180;
    return '<button class="swatch is-' + hue + " tone-" + tone + (light ? " is-light-swatch" : "") + (selected ? " is-selected" : "") + '" type="button"' + (opts.id ? ' id="' + opts.id + '"' : "") + (opts.gridCell ? ' role="gridcell" aria-selected="' + Boolean(selected) + '" tabindex="' + (selected ? "0" : "-1") + '"' : "") + ' data-color-value="' + colorValue + '" data-color-swatch-alpha="' + (transparent ? "0" : "100") + '" style="--swatch-color:' + colorValue + '" aria-label="' + (transparent ? "取消使用颜色" : "选择颜色 " + colorValue) + '" aria-pressed="' + Boolean(selected) + '">' + (selected ? icon("check") : "") + "</button>";
  }

  function colorSourceState(value, alpha) {
    var numeric = parseInt(String(value).replace("#", ""), 16);
    var red = numeric >> 16 & 255;
    var green = numeric >> 8 & 255;
    var blue = numeric & 255;
    var r = red / 255;
    var g = green / 255;
    var b = blue / 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var delta = max - min;
    var hue = 0;
    if (delta) {
      if (max === r) hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * ((b - r) / delta + 2);
      else hue = 60 * ((r - g) / delta + 4);
    }
    if (hue < 0) hue += 360;
    return { r: red, g: green, b: blue, h: Math.round(hue), s: Math.round(max ? delta / max * 100 : 0), v: Math.round(max * 100), a: alpha };
  }

  function colorCustomPanel(hidden, options) {
    var opts = options || {};
    var value = opts.value || "#004CFF";
    var state = opts.colorState || colorSourceState(value, opts.alpha === undefined ? 100 : opts.alpha);
    return '<div class="color-custom-panel"' + (opts.id ? ' id="' + opts.id + '"' : "") + ' data-color-custom aria-hidden="' + Boolean(hidden) + '"' + (hidden ? " hidden inert" : "") + '>' +
      '<div class="color-saturation" data-color-saturation role="slider" tabindex="0" aria-label="饱和度与明度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + state.s + '" aria-valuetext="饱和度 ' + state.s + '%，明度 ' + state.v + '%"><i data-color-cursor></i></div>' +
      '<div class="color-slider-row"><span class="current-color" data-color-preview aria-hidden="true"></span><input class="color-hue-range" data-color-hue type="range" min="0" max="360" value="' + state.h + '" aria-label="色相"></div>' +
      '<div class="color-alpha-row"><span>透明度</span><input class="color-alpha-range" data-color-alpha type="range" min="0" max="100" value="' + state.a + '" aria-label="透明度"><output data-color-alpha-output>' + state.a + '%</output></div>' +
      '<div class="color-custom-fields"><label class="is-hex">HEX<input value="' + value + '" data-color-input aria-label="HEX 色值" spellcheck="false" aria-invalid="false"></label><label>R<input type="number" value="' + state.r + '" min="0" max="255" data-color-channel="r" aria-label="红色通道"></label><label>G<input type="number" value="' + state.g + '" min="0" max="255" data-color-channel="g" aria-label="绿色通道"></label><label>B<input type="number" value="' + state.b + '" min="0" max="255" data-color-channel="b" aria-label="蓝色通道"></label></div></div>';
  }

  function renderPresetGrid(kind, state, idPrefix, value, alpha) {
    var fullRows = [
      [["none", "#000000"], ["blue", "#3370FF"], ["green", "#34C724"], ["purple", "#7F3BF5"], ["yellow", "#FFC60A"], ["red", "#F54A45"]],
      [["neutral", "#F5F6F7"], ["blue", "#E8F0FF"], ["green", "#E9F8E7"], ["purple", "#F3ECFF"], ["yellow", "#FFF8E6"], ["red", "#FEF0F0"]],
      [["neutral", "#EFF0F1"], ["blue", "#D6E4FF"], ["green", "#D9F3D6"], ["purple", "#E8DCFF"], ["yellow", "#FFF1CC"], ["red", "#FDE2E2"]],
      [["neutral", "#DEE0E3"], ["blue", "#ADC6FF"], ["green", "#B7EAB2"], ["purple", "#D0B5FF"], ["yellow", "#FFE6A3"], ["red", "#FBBFBC"]],
      [["neutral", "#C9CDD4"], ["blue", "#85A9FF"], ["green", "#8DDD84"], ["purple", "#B995FF"], ["yellow", "#FFD666"], ["red", "#F98E8B"]],
      [["neutral", "#8F959E"], ["blue", "#4E83FD"], ["green", "#5BCB50"], ["purple", "#8C55EC"], ["yellow", "#FFC60A"], ["red", "#F54A45"]]
    ];
    var simple = [["none", "#000000"], ["red", "#F54A45"], ["orange", "#FF8800"], ["yellow", "#FFC60A"], ["green", "#34C724"], ["cyan", "#13C2C2"], ["blue", "#3370FF"], ["cyan", "#14C0FF"], ["blue", "#4B5AEF"], ["purple", "#7F3BF5"], ["pink", "#E83E8C"], ["neutral", "#8F959E"]];
    var entries = kind === "full" ? fullRows.reduce(function (all, row) { return all.concat(row); }, []) : simple;
    var selectedIndex = entries.findIndex(function (entry) { return alpha === 0 && value === "#000000" ? entry[0] === "none" : alpha > 0 && entry[0] !== "none" && entry[1].toUpperCase() === value; });
    if (selectedIndex < 0 && state === "selected") selectedIndex = kind === "full" ? 20 : 1;
    var activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
    return '<div class="color-grid is-' + kind + '-grid" role="grid" aria-label="预设颜色" aria-activedescendant="' + idPrefix + '-swatch-' + activeIndex + '" data-color-grid>' + entries.map(function (entry, index) {
      return colorSwatch(entry[0], 100, index === selectedIndex, entry[1], { id: idPrefix + "-swatch-" + index, gridCell: true });
    }).join("") + "</div>";
  }

  function sourceColorPicker(options) {
    var opts = options || {};
    var legacyPanelRequest = !opts.panelModel && Boolean(opts.variant);
    var variant = opts.panelModel || opts.variant || "full";
    if (variant === "custom") variant = "value";
    if (["full", "simple", "value"].indexOf(variant) < 0) throw new Error("sourceColorPicker panelModel must be full, simple or value");
    var trigger = opts.trigger || "swatch-value";
    if (["swatch", "swatch-value"].indexOf(trigger) < 0) throw new Error("sourceColorPicker trigger must be swatch or swatch-value");
    var size = opts.size || "medium";
    if (["mini", "small", "medium", "large"].indexOf(size) < 0) throw new Error("sourceColorPicker size must be mini, small, medium or large");
    var state = opts.state || "default";
    var open = opts.open === undefined ? legacyPanelRequest : Boolean(opts.open);
    var disabled = Boolean(opts.disabled);
    if (disabled && open) throw new Error("sourceColorPicker disabled and open cannot both be true");
    var value = String(opts.value || "#004CFF").toUpperCase();
    var alpha = opts.alpha === undefined ? 100 : Number(opts.alpha);
    var colorState = colorSourceState(value, alpha);
    var alphaHex = Math.round(alpha / 100 * 255).toString(16).padStart(2, "0").toUpperCase();
    var displayValue = alpha < 100 ? value + alphaHex : value;
    var instanceId = "b2b-color-picker-" + (++colorPickerSequence);
    var panelId = instanceId + "-panel";
    var adjustId = instanceId + "-adjust";
    var triggerMarkup = '<button class="color-trigger" type="button" data-color-trigger aria-haspopup="dialog" aria-expanded="' + open + '" aria-controls="' + panelId + '" aria-label="选择颜色 ' + displayValue + '"' + (disabled ? ' disabled aria-disabled="true"' : "") + '><span class="color-trigger-swatch" data-color-preview aria-hidden="true"></span>' + (trigger === "swatch-value" ? '<code data-color-output>' + displayValue + "</code>" : "") + "</button>";
    var palette = variant === "value" ? "" : '<div class="color-palette-view" data-color-palette-view>' + renderPresetGrid(variant === "full" ? "full" : "simple", state, instanceId, value, alpha) + (variant === "full" ? '<button class="color-more-trigger" type="button" data-color-more aria-expanded="false" aria-controls="' + adjustId + '"><span class="color-wheel" aria-hidden="true"></span><span>More color</span>' + icon("chevron_right") + "</button>" : "") + "</div>";
    var adjustment = variant === "simple" ? "" : colorCustomPanel(variant === "full", { id: adjustId, value: value, alpha: alpha, colorState: colorState });
    var panel = '<div class="color-picker-panel color-picker-spec is-' + variant + ' is-state-' + state + '" id="' + panelId + '" data-color-panel role="dialog" aria-label="颜色选择面板" aria-hidden="' + String(!open) + '"' + (open ? "" : " hidden inert") + '><div class="color-picker-panel-layout">' + palette + adjustment + "</div></div>";
    return '<div class="color-picker-control is-model-' + variant + " is-trigger-" + trigger + " is-size-" + size + (open ? " is-open" : "") + (disabled ? " is-disabled" : "") + '" data-color-picker data-color-picker-control data-color-model="' + variant + '" data-color-trigger-variant="' + trigger + '" data-color-size="' + size + '" data-color-h="' + colorState.h + '" data-color-s="' + colorState.s + '" data-color-v="' + colorState.v + '" data-color-alpha-value="' + alpha + '" data-color-hex="' + value + '" style="--color-hue:' + colorState.h + ";--color-saturation-position:" + colorState.s + "%;--color-value-position:" + (100 - colorState.v) + "%;--selected-solid-color:" + value + ";--selected-color:" + value + alphaHex + '">' + triggerMarkup + panel + '<span class="color-live" data-color-live aria-live="polite">当前颜色 ' + value + "，透明度 " + alpha + "%</span></div>";
  }

  function customColorPicker(state) {
    return sourceColorPicker({ panelModel: "value", trigger: "swatch-value", open: true, state: state });
  }

  function fullColorPalette(state, options) {
    var opts = options || {};
    return sourceColorPicker({ panelModel: "full", trigger: opts.trigger || "swatch-value", state: state, open: opts.open !== false });
  }

  function simpleColorPalette(state, options) {
    var opts = options || {};
    return sourceColorPicker({ panelModel: "simple", trigger: opts.trigger || "swatch-value", state: state, open: opts.open !== false });
  }

  function simpleColorPicker(options) {
    var opts = options || {};
    return sourceColorPicker({ panelModel: "simple", trigger: opts.trigger || "swatch-value", open: Boolean(opts.open), state: opts.state });
  }

  function checkboxOption(label, state, options) {
    var opts = options || {};
    var checked = state.indexOf("checked") === 0;
    var partial = state.indexOf("partial") === 0;
    var disabled = state.indexOf("disabled") >= 0;
    var description = opts.description ? '<small>' + opts.description + "</small>" : "";
    var leading = opts.leading || "";
    var errorId = "";
    var errorDescription = "";
    if (opts.errorMessage) {
      checkboxErrorSequence += 1;
      errorId = opts.errorId || "checkbox-error-" + checkboxErrorSequence;
      errorDescription = '<small class="checkbox-error-message sr-only" id="' + errorId + '">' + opts.errorMessage + "</small>";
    }
    var dataAttributes = (opts.group ? ' data-checkbox-item="' + opts.group + '"' : "") + (opts.pickerValue ? ' data-checkbox-picker-value="' + opts.pickerValue + '"' : "") + (opts.value ? ' value="' + opts.value + '" data-checkbox-value="' + opts.value + '"' : "") + (opts.errorMessage ? ' aria-invalid="true" aria-describedby="' + errorId + '"' : "") + ' aria-checked="' + (partial ? "mixed" : String(checked)) + '"' + (opts.dataAttrs ? " " + opts.dataAttrs : "");
    var rootAttributes = opts.rootAttrs ? " " + opts.rootAttrs : "";
    var checkMark = '<svg class="checkbox-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.25 8.15 6.35 11.1 12.8 4.75"></path></svg>';
    var partialMark = '<span class="checkbox-partial-mark" aria-hidden="true"></span>';
    return '<label class="checkbox-spec ' + (opts.dynamic ? "is-dynamic" : "is-" + state) + (opts.compact ? " is-compact" : "") + (opts.alignTop ? " is-align-top" : "") + (opts.className ? " " + opts.className : "") + '"' + rootAttributes + ">" + leading + '<input type="checkbox"' + (checked ? " checked" : "") + (partial ? ' data-indeterminate="true"' : "") + (disabled ? " disabled" : "") + dataAttributes + '><span class="checkbox-control" aria-hidden="true">' + checkMark + partialMark + '</span><span class="checkbox-copy"><span>' + label + "</span>" + description + errorDescription + "</span></label>";
  }

  function checkboxSourceState(checked, partial, disabled, invalid) {
    var prefix = partial ? "partial" : (checked ? "checked" : "unchecked");
    if (disabled) return prefix + "-disabled";
    if (invalid) return prefix + "-error";
    return prefix;
  }

  function checkboxGroup(options) {
    var opts = options || {};
    var items = opts.items || [];
    var selectedCount = items.filter(function (item) { return Boolean(item.checked); }).length;
    var hasMixed = items.some(function (item) { return Boolean(item.mixed); });
    var allChecked = !hasMixed && items.length > 0 && selectedCount === items.length;
    var partial = hasMixed || selectedCount > 0 && !allChecked;
    var enabledCount = items.filter(function (item) { return !opts.disabled && !item.disabled; }).length;
    var optionOptions = {
      compact: Boolean(opts.compact),
      dynamic: true
    };
    var groupError = Boolean(opts.error);
    var allOption = Object.assign({}, optionOptions, {
      group: "all",
      value: "__all__",
      className: groupError ? "is-error" : "",
      errorMessage: groupError ? opts.errorMessage : null
    });
    var toolbar = '<div class="checkbox-group-toolbar">' +
      checkboxOption(opts.selectAllLabel || "Select all", checkboxSourceState(allChecked, partial, Boolean(opts.disabled) || enabledCount === 0, groupError), allOption) +
      '<span data-checkbox-count>已选 ' + selectedCount + " / " + items.length + "</span></div>";
    var itemOptions;
    var itemMarkup = items.map(function (item, index) {
      var itemError = groupError || Boolean(item.error);
      itemOptions = Object.assign({}, optionOptions, {
        group: "item",
        value: item.value,
        className: itemError ? "is-error" : "",
        errorMessage: itemError ? (item.errorMessage || opts.errorMessage) : null,
        dataAttrs: 'data-checkbox-index="' + index + '"'
      });
      return checkboxOption(item.label, checkboxSourceState(Boolean(item.checked), Boolean(item.mixed), Boolean(opts.disabled) || Boolean(item.disabled), itemError), itemOptions);
    }).join("");
    var orientation = opts.orientation || "vertical";
    return '<div class="checkbox-runtime-group is-' + orientation + (opts.compact ? " is-compact" : "") + (opts.className ? " " + opts.className : "") + '" role="group" aria-label="' + (opts.label || "Checkbox group") + '" data-checkbox-group data-checkbox-orientation="' + orientation + '">' + toolbar + itemMarkup + "</div>";
  }

  function checkboxStateMatrix() {
    var columns = ["Normal", "Hover", "Pressed", "Focus", "Disabled", "Error"];
    var rows = [
      { label: "Not selected", prefix: "unchecked" },
      { label: "Selected", prefix: "checked" },
      { label: "Partially selected", prefix: "partial" }
    ];
    return '<div class="checkbox-state-matrix" role="table" aria-label="复选框状态矩阵"><div class="checkbox-state-row is-header" role="row"><strong role="columnheader">状态</strong>' + columns.map(function (column) { return '<span role="columnheader">' + column + "</span>"; }).join("") + "</div>" + rows.map(function (item) {
      var states = [item.prefix, item.prefix + "-hover", item.prefix + "-pressed", item.prefix + "-focus", item.prefix + "-disabled", item.prefix + "-error"];
      return '<div class="checkbox-state-row" role="row"><strong role="rowheader">' + item.label + "</strong>" + states.map(function (state) { return '<span role="cell">' + checkboxOption("Option text", state) + "</span>"; }).join("") + "</div>";
    }).join("") + "</div>";
  }

  function navigationBrand(compact) {
    return '<a class="nav-brand" href="#overview" aria-label="返回产品首页">' + icon("deployed_code") + (compact ? "" : "<strong>Product name</strong>") + "</a>";
  }

  function topNavigation(options) {
    var opts = options || {};
    var tabs = opts.long ? ["Enterprise Financial Management System", "Tab", "Tab", "Tab"] : ["Tab", "Tab", "Tab", "Tab", "Tab", "Tab"];
    var visible = opts.more ? tabs.slice(0, 3) : tabs;
    return '<nav class="top-navigation' + (opts.state ? " is-state-" + opts.state : "") + '" aria-label="顶部水平导航" data-top-navigation>' + navigationBrand(false) + '<div class="top-navigation-tabs" role="tablist">' + visible.map(function (label, index) {
      var selected = !opts.moreActive && index === (opts.activeIndex || 0);
      return '<button class="top-nav-tab' + (selected ? " is-active" : "") + '" role="tab" aria-selected="' + selected + '" tabindex="' + (selected ? "0" : "-1") + '" title="' + label + '"><span>' + label + "</span></button>";
    }).join("") + (opts.more ? '<div class="top-nav-more" data-top-nav-more><button class="top-nav-tab' + (opts.moreActive ? " is-active" : "") + '" type="button" aria-haspopup="menu" aria-expanded="' + Boolean(opts.open) + '"><span>More</span>' + icon(opts.open ? "expand_less" : "expand_more") + '</button><div class="top-nav-menu demo-menu" role="menu" popover="manual"' + (opts.open ? ' data-initial-open="true"' : " hidden") + '><button class="demo-menu-item" role="menuitem">category</button><button class="demo-menu-item is-selected" role="menuitem">category</button><button class="demo-menu-item" role="menuitem">category</button><button class="demo-menu-item" role="menuitem">category</button></div></div>' : "") + '<span class="top-nav-indicator" aria-hidden="true"></span></div><div class="top-navigation-actions">' + button("+ Button", "is-primary", 'type="button"') + iconTooltipButton("visibility", "预览", "is-subtle", 'type="button"') + iconTooltipButton("download", "下载", "is-subtle", 'type="button"') + iconTooltipButton("delete", "删除", "is-subtle", 'type="button"') + avatarSpec({ text: "A", size: 24 }) + '</div></nav>';
  }

  function sideNavItem(label, level, options) {
    var opts = options || {};
    var hasChildren = Boolean(opts.children);
    var key = opts.key ? ' data-nav-key="' + opts.key + '"' : "";
    var action = opts.action ? '<div class="side-nav-action-wrap interactive-dropdown is-align-end" data-popup-root><button class="side-nav-action b2b-button is-icon is-subtle" type="button" data-popup-trigger aria-haspopup="menu" aria-expanded="false" aria-label="更多操作">' + icon("more_horiz") + '</button><div class="side-nav-action-menu demo-menu" role="menu" data-popup-panel aria-hidden="true"><button class="demo-menu-item" role="menuitem">重命名</button><button class="demo-menu-item" role="menuitem">复制链接</button><button class="demo-menu-item is-danger" role="menuitem">删除</button></div></div>' : "";
    var leading = level === 1 ? icon(opts.icon || "desktop_windows") : "";
    if (opts.tree) {
      leading = icon(hasChildren && opts.expanded ? "arrow_drop_down" : "arrow_right", "side-nav-tree-toggle" + (hasChildren ? "" : " is-placeholder")) + icon(opts.icon || "view_sidebar", "side-nav-tree-icon");
    }
    return '<div class="side-nav-node is-level-' + level + (opts.expanded ? " is-expanded" : "") + '"><button class="side-nav-item' + (opts.active ? " is-active" : "") + (opts.activePath ? " is-active-path" : "") + (opts.hover ? " is-hover" : "") + (opts.action ? " has-action" : "") + '" type="button"' + key + (hasChildren ? ' data-side-nav-expand aria-expanded="' + Boolean(opts.expanded) + '"' : "") + (opts.disabled ? " disabled" : "") + '>' + leading + '<span class="side-nav-label" title="' + label + '">' + label + "</span>" + (opts.badge ? '<span class="side-nav-badge">' + opts.badge + "</span>" : "") + (hasChildren && !opts.tree ? icon(opts.expanded ? "expand_less" : "expand_more", "side-nav-arrow") : "") + "</button>" + action + (hasChildren ? '<div class="side-nav-children"' + (opts.expanded ? "" : " hidden") + ">" + opts.children + "</div>" : "") + "</div>";
  }

  function navigationScrollbar(variant) {
    return '<div class="scrollbar-track side-nav-scrollbar-track is-' + variant + '" data-scrollbar-track data-axis="vertical"><button class="scrollbar-thumb" type="button" role="scrollbar" aria-orientation="vertical" data-scrollbar-thumb aria-label="导航滚动条"></button></div>';
  }

  function sideWebNavigation(options) {
    var opts = options || {};
    var expanded = opts.expanded !== false;
    function webChildren(parentKey, active) {
      var third = sideNavItem("Three-level navigation", 3, { key: parentKey + "-2-1" }) + sideNavItem("Three-level navigation", 3, { key: parentKey + "-2-2" }) + sideNavItem("Three-level navigation", 3, { key: parentKey + "-2-3" });
      return sideNavItem("Secondary navigation", 2, { key: parentKey + "-1", active: active }) + sideNavItem("Secondary navigation", 2, { key: parentKey + "-2", children: third }) + sideNavItem("Secondary navigation", 2, { key: parentKey + "-3" }) + sideNavItem("Secondary navigation", 2, { key: parentKey + "-4" });
    }
    var primaryChildren = webChildren("web-2", true);
    var cropChildren = webChildren("web-4", false);
    var articleChildren = webChildren("web-5", false);
    return '<nav class="side-web-navigation' + (expanded ? "" : " is-collapsed") + (opts.noBackground ? " is-no-background" : "") + '" aria-label="Web 侧边导航" data-side-web-nav data-scrollbar-spec style="--side-web-width:' + (expanded ? "240px" : "64px") + '"><div class="side-web-brand">' + navigationBrand(false) + '</div><div class="side-web-list" data-scrollbar-viewport tabindex="0" aria-label="Web 侧边导航菜单">' + sideNavItem(opts.long ? "Enterprise Financial Management System" : "Items", 1, { key: "web-1", icon: "desktop_windows" }) + sideNavItem("Items", 1, { key: "web-2", icon: "code", activePath: true, badge: "99", children: primaryChildren, expanded: true }) + sideNavItem("Items", 1, { key: "web-3", icon: "near_me" }) + sideNavItem("Items", 1, { key: "web-4", icon: "crop", children: cropChildren }) + sideNavItem("Items", 1, { key: "web-5", icon: "article", children: articleChildren }) + sideNavItem("Items", 1, { key: "web-6", icon: "share" }) + sideNavItem("Items", 1, { key: "web-7", icon: "visibility" }) + sideNavItem("Items", 1, { key: "web-8", icon: "person_add" }) + "</div>" + navigationScrollbar("web") + '<button class="side-web-collapse" type="button" data-side-nav-collapse aria-expanded="' + expanded + '" aria-label="' + (expanded ? "收起导航" : "展开导航") + '">' + icon("menu_open") + '<span class="side-web-collapse-label">Collapse navigation</span></button><div class="side-nav-flyout" data-side-nav-flyout popover="manual" hidden><strong></strong><div class="side-nav-flyout-list" data-side-nav-flyout-list></div></div></nav>';
  }

  function desktopSideNavigation(options) {
    var opts = options || {};
    var width = opts.width || 220;
    var tree = sideNavItem("First-level navigation", 1, { icon: "view_sidebar", tree: true, hover: true }) + sideNavItem("First-level navigation", 1, { icon: "view_sidebar", tree: true, activePath: true, expanded: true, children: sideNavItem("Secondary navigation", 2, { tree: true }) + sideNavItem("Secondary navigation", 2, { tree: true, activePath: true, expanded: true, children: sideNavItem("Three-level navigation", 3, { tree: true, active: true }) + sideNavItem("Three-level navigation", 3, { tree: true }) }) }) + sideNavItem("First-level navigation", 1, { icon: "view_sidebar", tree: true }) + sideNavItem("First-level navigation", 1, { icon: "view_sidebar", tree: true });
    var flat = sideNavItem("Items", 1, { icon: "desktop_windows" }) + sideNavItem(opts.long ? "Enterprise Financial Management System" : "Items", 1, { icon: "code", active: true }) + sideNavItem("Items", 1, { icon: "near_me", children: sideNavItem("Items", 2) + sideNavItem("Items", 2) }) + sideNavItem("Items", 1, { icon: "crop", children: sideNavItem("Items", 2) }) + sideNavItem("Items", 1, { icon: "article", children: sideNavItem("Items", 2) }) + sideNavItem("Items", 1, { icon: "share", badge: "99", action: true }) + sideNavItem("Items", 1, { icon: "visibility" }) + sideNavItem("Items", 1, { icon: "person_add" });
    return '<nav class="side-desktop-navigation' + (opts.tree ? " is-tree" : "") + '" aria-label="Desktop 侧边导航" data-side-desktop-nav data-scrollbar-spec data-width="' + width + '" style="--side-desktop-width:' + width + 'px"><div class="side-desktop-list" data-scrollbar-viewport tabindex="0" aria-label="Desktop 侧边导航菜单">' + (opts.tree ? tree : flat) + "</div>" + navigationScrollbar("desktop") + '<button class="side-desktop-resizer" type="button" data-nav-resizer role="separator" aria-orientation="vertical" aria-valuemin="220" aria-valuemax="440" aria-valuenow="' + width + '" aria-label="拖动或使用方向键调整导航宽度"></button></nav>';
  }

  var breadcrumbSpecSequence = 0;

  function breadcrumbSpec(items, options) {
    var opts = options || {};
    var breadcrumbId = "breadcrumb-" + (++breadcrumbSpecSequence);
    var parts = items.map(function (label, index) {
      var current = index === items.length - 1;
      var long = opts.long && index === (opts.longIndex || 1);
      var link = '<button class="breadcrumb-link' + (opts.hoverIndex === index ? " is-hover" : "") + (opts.pressedIndex === index ? " is-pressed" : "") + (long ? " is-long" : "") + '" type="button" data-breadcrumb-label="' + label + '" aria-label="返回到 ' + label + '"' + (long ? ' aria-describedby="' + breadcrumbId + '-tooltip"' : ' title="' + label + '"') + '>' + label + "</button>";
      if (long) link = '<span class="breadcrumb-tooltip-anchor">' + link + '<span class="breadcrumb-tooltip" id="' + breadcrumbId + '-tooltip" role="tooltip">' + label + '<i aria-hidden="true"></i></span></span>';
      return (index ? icon("chevron_right", "breadcrumb-separator") : "") + (current ? '<span class="breadcrumb-current" aria-current="page" title="' + label + '">' + label + "</span>" : link);
    }).join("");
    if (opts.collapsed) {
      parts = '<button class="breadcrumb-link" type="button" data-breadcrumb-label="' + items[0] + '" aria-label="返回到 ' + items[0] + '">' + items[0] + "</button>" + icon("chevron_right", "breadcrumb-separator") + '<span class="breadcrumb-more' + (opts.open ? " is-open" : "") + '" data-breadcrumb-more><button type="button" aria-haspopup="menu" aria-controls="' + breadcrumbId + '-history" aria-expanded="' + Boolean(opts.open) + '" aria-label="查看折叠层级">' + icon("more_horiz") + '</button><div class="breadcrumb-history" id="' + breadcrumbId + '-history" role="menu" aria-label="已折叠的页面层级"' + (opts.open ? "" : " hidden") + '>' + (opts.history || ["Project n-1", "Project n-2"]).map(function (history) { return '<button type="button" role="menuitem" data-breadcrumb-history-label="' + history + '">' + history + "</button>"; }).join(icon("chevron_right", "breadcrumb-separator")) + "</div></span>" + icon("chevron_right", "breadcrumb-separator") + (items.length > 2 ? '<button class="breadcrumb-link" type="button" data-breadcrumb-label="' + items[items.length - 2] + '" aria-label="返回到 ' + items[items.length - 2] + '">' + items[items.length - 2] + "</button>" + icon("chevron_right", "breadcrumb-separator") : "") + '<span class="breadcrumb-current" aria-current="page" title="' + items[items.length - 1] + '">' + items[items.length - 1] + "</span>";
    }
    return '<nav class="breadcrumb-spec' + (opts.context ? " is-context" : "") + (opts.long ? " has-long-label" : "") + '" aria-label="面包屑" data-breadcrumb data-current-label="' + items[items.length - 1] + '">' + parts + '<span class="breadcrumb-live" aria-live="polite"></span></nav>';
  }

  function stepsSpec(options) {
    var opts = options || {};
    var labels = opts.labels || ["Done", "In progress", "Not started", "Not started"];
    var descriptions = opts.descriptions || labels.map(function () { return "This is a description."; });
    var current = opts.current == null ? 1 : opts.current;
    var error = opts.error === true;
    var classes = "steps steps-spec" + (opts.vertical ? " is-vertical" : "") + (opts.simple ? " is-simple" : "") + (opts.compact ? " is-compact" : "") + (opts.tabs ? " is-tab-steps" : "") + (opts.clickable === false ? " is-static" : "");
    var items = labels.map(function (label, index) {
      var state = index < current ? "is-finished" : (index === current ? (error ? "is-error" : "is-current") : "is-waiting");
      var node = index < current ? icon("check") : (index === current && error ? icon("close") : String(index + 1));
      var title = opts.long && index === 0 ? "The title can appear up to two lines, exceeding the optimal copywriting" : label;
      var description = opts.long ? "Auxiliary instructions up to two lines, depending on the page situation." : descriptions[index];
      var isSelectedTab = opts.tabs && index === current;
      var tabAttributes = opts.tabs
        ? ' role="tab" aria-selected="' + String(isSelectedTab) + '"'
        : "";
      var interactionRole = opts.tabs || opts.clickable === false ? "" : ' role="button"';
      return '<li class="' + state + (isSelectedTab ? " is-tab-selected" : "") + '" tabindex="' + (opts.clickable === false || opts.tabs && !isSelectedTab ? "-1" : "0") + '" data-step-index="' + index + '" aria-current="' + (index === current ? "step" : "false") + '"' + interactionRole + tabAttributes + '>' + (opts.simple ? "" : '<span class="step-node">' + node + "</span>") + '<div class="step-copy"><strong title="' + title + '">' + title + '</strong><small title="' + description + '">' + description + "</small></div></li>";
    }).join("");
    return '<ol class="' + classes + '" data-steps-spec aria-label="步骤进度"' + (opts.tabs ? ' role="tablist"' : "") + '>' + items + "</ol>";
  }

  function paginationSpec(options) {
    var opts = options || {};
    var current = opts.current || 2;
    var totalPages = opts.totalPages || 20;
    var small = opts.small === true;
    var minimal = opts.minimal === true;
    var pageSize = opts.pageSize === true || opts.complete === true;
    var jumper = opts.jumper === true || opts.complete === true;
    var pages = opts.pages || [1, 2, 3, 4, 5];
    var buttons = pages.map(function (page) {
      return '<button class="page-button' + (page === current ? " is-active" : "") + '" type="button" data-page="' + page + '"' + (page === current ? ' aria-current="page"' : "") + ">" + page + "</button>";
    }).join("");
    var startEllipsis = '<button class="page-button page-ellipsis" type="button" data-page-jump="-5" aria-label="向前跳 5 页"' + (opts.startEllipsis ? "" : " hidden") + '>' + icon("more_horiz", "page-more-icon") + icon("keyboard_double_arrow_left", "page-jump-icon") + "</button>";
    var endEllipsis = '<button class="page-button page-ellipsis" type="button" data-page-jump="5" aria-label="向后跳 5 页"' + (opts.endEllipsis !== false ? "" : " hidden") + '>' + icon("more_horiz", "page-more-icon") + icon("keyboard_double_arrow_right", "page-jump-icon") + "</button>";
    var pageSizeSelect = sourceSelect({
      size: "small",
      open: false,
      selected: ["20 条/页"],
      items: ["20 条/页", "50 条/页", "100 条/页"],
      clearable: false,
      attrs: 'data-page-size data-page-size-value="20 条/页"',
      triggerAttrs: 'aria-label="每页条数"'
    });
    var jumpInput = '<input type="text" inputmode="numeric" pattern="[0-9]*" value="' + current + '" data-page-jump-input role="spinbutton" aria-label="跳转页码" aria-valuemin="1" aria-valuemax="' + totalPages + '" aria-valuenow="' + current + '" aria-invalid="false">';
    var extras = (pageSize ? '<div class="pagination-size">' + pageSizeSelect + "</div>" : "") + (jumper ? '<label class="pagination-jump">前往 ' + jumpInput + " 页</label>" : "");
    var total = opts.total === false ? "" : '<span class="pagination-total">' + (opts.totalText || "共 1000 条") + "</span>";
    var previous = '<button class="page-button page-nav" type="button" data-page-nav="prev" aria-label="上一页"' + (current <= 1 ? " disabled" : "") + '>' + icon("chevron_left") + "</button>";
    var next = '<button class="page-button page-nav" type="button" data-page-nav="next" aria-label="下一页"' + (current >= totalPages ? " disabled" : "") + '>' + icon("chevron_right") + "</button>";
    var live = '<span class="pagination-live" aria-live="polite">第 ' + current + " / " + totalPages + " 页</span>";
    var minimalCurrent = '<input class="pagination-minimal-current" type="text" inputmode="numeric" pattern="[0-9]*" value="' + current + '" data-page-jump-input data-pagination-current-input data-pagination-commit-on-blur role="spinbutton" aria-label="当前页，输入页码后按 Enter 或移出焦点跳转" aria-valuemin="1" aria-valuemax="' + totalPages + '" aria-valuenow="' + current + '" aria-invalid="false">';
    var minimalTotal = '<span class="pagination-minimal-total"><span aria-hidden="true">/</span><span aria-label="共 ' + totalPages + ' 页">' + totalPages + "</span></span>";
    var navigation = minimal
      ? '<nav aria-label="极简分页">' + previous + minimalCurrent + minimalTotal + next + live + "</nav>"
      : total + '<nav aria-label="分页">' + previous + startEllipsis + buttons + endEllipsis + next + "</nav>" + extras + live;
    return '<div class="pagination-spec' + (small ? " is-small" : "") + (minimal ? " is-minimal" : "") + '" data-pagination data-component-reference="C-15" data-current-page="' + current + '" data-total-pages="' + totalPages + '">' + navigation + "</div>";
  }

  function escapeScrollbarText(value) {
    return String(value)
      .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function scrollbarSpec(options) {
    var opts = options || {};
    var horizontal = opts.horizontal === true;
    var appearance = opts.appearance === "thin" ? "thin" : "default";
    var visibility = opts.visibility === "hover-reveal" ? "hover-reveal" : "always";
    var items = Array.isArray(opts.items) ? opts.items : Array.from({ length: horizontal ? 12 : 16 }, function (_, index) {
      return (horizontal ? "Column " : "List item ") + (index + 1);
    });
    var content = '<div class="' + (horizontal ? "scrollbar-wide-content" : "scrollbar-tall-content") + '">' + items.map(function (item) {
      return "<span>" + escapeScrollbarText(item) + "</span>";
    }).join("") + "</div>";
    return '<div class="scrollbar-demo' + (horizontal ? " is-horizontal" : "") + (opts.dark ? " is-dark" : "") + (opts.hover ? " is-hover" : "") + (opts.dragging ? " is-dragging" : "") + (opts.cross ? " is-cross" : "") + (appearance === "thin" ? " is-thin" : "") + (visibility === "hover-reveal" ? " is-hover-reveal" : "") + '" data-scrollbar-spec><div class="scrollbar-viewport" data-scrollbar-viewport tabindex="0" aria-label="可滚动内容">' + content + '</div><div class="scrollbar-track" data-scrollbar-track data-axis="' + (horizontal ? "horizontal" : "vertical") + '"><button class="scrollbar-thumb" type="button" data-scrollbar-thumb aria-label="拖动滚动"></button></div>' + (opts.cross ? '<div class="scrollbar-track is-horizontal-track" data-scrollbar-track data-axis="horizontal"><button class="scrollbar-thumb" type="button" data-scrollbar-thumb aria-label="横向拖动滚动"></button></div><span class="scrollbar-corner" aria-hidden="true"></span>' : "") + "</div>";
  }

  function escapeAnchorText(value) {
    return String(value)
      .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function anchorSections(sections) {
    var values = sections == null ? [
      { label: "Title 1", content: "用于验证点击定位与滚动同步的内容区域。" },
      { label: "Title 2", content: "用于验证点击定位与滚动同步的内容区域。" },
      { label: "Title 3", content: "用于验证点击定位与滚动同步的内容区域。" },
      { label: "Title 4", content: "用于验证点击定位与滚动同步的内容区域。" }
    ] : sections;
    if (!Array.isArray(values) || values.length < 2) throw new Error("C-17 sections must contain at least two safe-text entries");
    return values.map(function (section, index) {
      if (!section || Object.prototype.toString.call(section) !== "[object Object]") throw new Error("C-17 section must be an object at index " + index);
      if (typeof section.label !== "string" || !section.label.trim()) throw new Error("C-17 section label cannot be empty at index " + index);
      if (typeof section.content !== "string" || !section.content.trim()) throw new Error("C-17 section content cannot be empty at index " + index);
      return { label: section.label, content: section.content };
    });
  }

  function anchorSpec(options) {
    var opts = options || {};
    var labels = opts.labels || ["Title 1", "Title 2", "Title 3", "Title 4"];
    var selected = opts.selected == null ? 0 : opts.selected;
    var items = labels.map(function (label, index) {
      var child = opts.nested && (index === 1 || index === 2);
      var stateClass = index === selected ? " is-selected" : (opts.hoverIndex === index ? " is-hover" : (opts.pressedIndex === index ? " is-pressed" : ""));
      var text = escapeAnchorText(opts.long && index === 0 ? "Level 1 title very long and displayed within the maximum width" : label);
      var controlledId = Array.isArray(opts.controlIds) ? opts.controlIds[index] : null;
      return '<button class="anchor-item' + stateClass + (child ? " is-child" : "") + '" type="button" data-anchor-target="section-' + (index + 1) + '" aria-current="' + (index === selected ? "location" : "false") + '"' + (controlledId ? ' aria-controls="' + escapeAnchorText(controlledId) + '"' : "") + (opts.disabledIndex === index ? " disabled" : "") + ' title="' + text + '">' + (opts.loadingFailure && index === selected ? icon("error") + " Loading failed" : text) + "</button>";
    }).join("");
    return '<nav class="anchor-spec' + (opts.horizontal ? " is-horizontal" : "") + (opts.nested ? " is-nested" : "") + '" data-anchor-spec aria-label="页面锚点">' + items + "</nav>";
  }

  function anchorComposition(options) {
    var opts = options || {};
    var sections = anchorSections(opts.sections);
    var labels = sections.map(function (section) { return section.label; });
    var idPrefix = opts.idPrefix == null ? "" : String(opts.idPrefix);
    if (idPrefix && !/^[A-Za-z][A-Za-z0-9_-]*$/.test(idPrefix)) throw new Error("C-17 idPrefix must be an internal safe identifier");
    var controlIds = sections.map(function (_, index) { return idPrefix ? idPrefix + "-section-" + (index + 1) : "section-" + (index + 1); });
    var navigation = anchorSpec({
      horizontal: opts.horizontal,
      nested: opts.nested,
      labels: labels,
      selected: opts.selected,
      disabledIndex: opts.disabledIndex,
      loadingFailure: opts.loadingFailure,
      controlIds: idPrefix ? controlIds : null
    });
    var content = sections.map(function (section, index) {
      var target = "section-" + (index + 1);
      return '<section id="' + controlIds[index] + '" data-anchor-section="' + target + '"><strong>' + escapeAnchorText(section.label) + '</strong><p>' + escapeAnchorText(section.content) + "</p></section>";
    }).join("");
    return '<div class="anchor-scroll-demo' + (opts.horizontal ? " is-horizontal" : "") + '" data-anchor-scroll-demo>' + navigation + '<div class="anchor-scroll-content" data-anchor-scroll-content tabindex="0">' + content + "</div></div>";
  }

  function anchorScrollDemo() {
    return anchorComposition({});
  }

  function visualizationSpec(type, options) {
    var opts = options || {};
    var legend = '<div class="viz-legend"><span><i class="is-blue"></i>Series A</span><span><i class="is-cyan"></i>Series B</span><span><i class="is-purple"></i>Series C</span></div>';
    var plot = "";
    if (type === "bar" || type === "stacked" || type === "horizontal-bar") {
      var values = [42, 68, 54, 82, 61, 74];
      plot = '<div class="viz-bars' + (type === "stacked" ? " is-stacked" : "") + (type === "horizontal-bar" ? " is-horizontal" : "") + '">' + values.map(function (value, index) { return '<button type="button" data-chart-mark style="--value:' + value + '%" aria-label="Category ' + (index + 1) + '，' + value + '"><i></i>' + (type === "stacked" ? "<b></b>" : "") + "</button>"; }).join("") + "</div>";
    } else if (type === "line" || type === "area") {
      plot = '<div class="viz-line' + (type === "area" ? " is-area" : "") + '"><svg viewBox="0 0 360 160" role="img" aria-label="趋势折线结构示例"><polyline points="12,124 72,96 132,106 192,58 252,76 348,28"></polyline></svg>' + [[12,124],[72,96],[132,106],[192,58],[252,76],[348,28]].map(function (point, index) { return '<button type="button" data-chart-mark style="--x:' + point[0] + ';--y:' + point[1] + '" aria-label="Point ' + (index + 1) + '"></button>'; }).join("") + "</div>";
    } else if (type === "donut" || type === "pie") {
      plot = '<div class="viz-donut' + (type === "pie" ? " is-pie" : "") + '"><svg viewBox="0 0 120 120" role="img" aria-label="构成结构示例"><circle class="viz-ring-bg" cx="60" cy="60" r="44"></circle><circle class="viz-ring-a" cx="60" cy="60" r="44"></circle><circle class="viz-ring-b" cx="60" cy="60" r="44"></circle></svg><button type="button" data-chart-mark aria-label="Series A，主要构成"></button></div>';
    } else if (type === "scatter" || type === "bubble") {
      plot = '<div class="viz-scatter' + (type === "bubble" ? " is-bubble" : "") + '">' + [[18,72],[32,42],[48,62],[63,28],[76,50],[88,20]].map(function (point, index) { return '<button type="button" data-chart-mark style="--x:' + point[0] + '%;--y:' + point[1] + '%;--size:' + (type === "bubble" ? 10 + index * 2 : 8) + 'px" aria-label="Point ' + (index + 1) + '"></button>'; }).join("") + "</div>";
    } else if (type === "funnel") {
      plot = '<div class="viz-funnel">' + [100,78,56,34].map(function (value, index) { return '<button type="button" data-chart-mark style="--width:' + value + '%" aria-label="Stage ' + (index + 1) + '">Stage ' + (index + 1) + "</button>"; }).join("") + "</div>";
    } else if (type === "map") {
      plot = '<div class="viz-map" aria-label="地理分布结构示例">' + [1,2,3,4,5,6,7,8,9,10,11,12].map(function (index) { return '<button type="button" data-chart-mark class="is-level-' + ((index % 4) + 1) + '" aria-label="Region ' + index + '"></button>'; }).join("") + "</div>";
    } else {
      plot = '<div class="viz-flow"><span>Stage 1</span>' + icon("arrow_forward") + '<span>Stage 2</span>' + icon("arrow_forward") + '<span>Stage 3</span></div>';
    }
    var state = opts.state ? '<div class="viz-state is-' + opts.state + '">' + (opts.state === "loading" ? '<span class="spinner"></span><strong>Loading</strong>' : icon(opts.state === "error" ? "error" : opts.state === "partial" ? "info" : "inbox") + '<strong>' + (opts.state === "error" ? "加载失败" : opts.state === "partial" ? "部分数据" : "暂无数据") + "</strong>") + "</div>" : "";
    return '<figure class="viz-spec" data-viz-spec><figcaption><strong>' + (opts.title || "Chart title") + '</strong><small>' + (opts.description || "Chart description") + "</small></figcaption>" + legend + '<div class="viz-plot"><span class="viz-y-axis">Value</span>' + plot + '<span class="viz-x-axis">Category</span>' + state + "</div></figure>";
  }

  function calendarMonth(year, month, options) {
    var opts = options || {};
    var firstDay = new Date(year, month - 1, 1);
    var sundayOffset = firstDay.getDay();
    var gridStart = new Date(year, month - 1, 1 - sundayOffset);
    var title = year + " 年 " + month + " 月";
    function isoDate(date) {
      return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    }
    function activeRangeDate(date) {
      var iso = isoDate(date);
      if (opts.disableOutside && date.getMonth() !== month - 1) return false;
      return Boolean(opts.rangeStart && iso === opts.rangeStart) || Boolean(opts.rangeEnd && iso === opts.rangeEnd) || Boolean(opts.rangeStart && opts.rangeEnd && iso > opts.rangeStart && iso < opts.rangeEnd);
    }
    var days = Array.from({ length: 42 }, function (_, index) {
      var date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
      var iso = isoDate(date);
      var serial = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
      var outside = date.getMonth() !== month - 1;
      var disabled = outside && opts.disableOutside;
      var selected = opts.selected === iso;
      var rangeStart = opts.rangeStart === iso;
      var rangeEnd = opts.rangeEnd === iso;
      var inRange = Boolean(opts.rangeStart && opts.rangeEnd && iso > opts.rangeStart && iso < opts.rangeEnd);
      var activeRange = !disabled && (rangeStart || rangeEnd || inRange);
      var previousDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
      var nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      var rangeRowStart = activeRange && (index % 7 === 0 || !activeRangeDate(previousDate));
      var rangeRowEnd = activeRange && (index % 7 === 6 || !activeRangeDate(nextDate));
      var today = iso === "2026-07-13";
      var className = [outside ? "is-outside" : "", today ? "is-today" : "", selected ? "is-selected" : "", rangeStart ? "is-range-start" : "", rangeEnd ? "is-range-end" : "", inRange ? "is-in-range" : "", rangeRowStart ? "is-range-row-start" : "", rangeRowEnd ? "is-range-row-end" : ""].filter(Boolean).join(" ");
      return '<button type="button" role="gridcell" data-date-day="' + date.getDate() + '" data-date-iso="' + iso + '" data-date-serial="' + serial + '" tabindex="' + (!disabled && (selected || rangeStart || (!opts.selected && !opts.rangeStart && today)) ? "0" : "-1") + '" class="' + className + '"' + (disabled ? " disabled" : "") + ' aria-label="' + date.getFullYear() + " 年 " + (date.getMonth() + 1) + " 月 " + date.getDate() + ' 日">' + date.getDate() + "</button>";
    }).join("");
    var monthMenu = '<div class="date-month-menu" data-date-month-menu data-date-menu-year="' + year + '" hidden><div class="date-month-menu-head"><button type="button" data-date-year-prev aria-label="上一年">' + icon("chevron_left") + '</button><strong data-date-menu-year-label>' + year + ' 年</strong><button type="button" data-date-year-next aria-label="下一年">' + icon("chevron_right") + '</button></div><div class="date-month-grid">' + Array.from({ length: 12 }, function (_, index) {
      var optionMonth = index + 1;
      return '<button type="button" data-date-month-option="' + optionMonth + '" class="' + (optionMonth === month ? "is-selected" : "") + '" aria-pressed="' + (optionMonth === month) + '">' + optionMonth + " 月</button>";
    }).join("") + "</div></div>";
    return '<div class="date-calendar" data-date-year="' + year + '" data-date-month="' + month + '"><header><button type="button" class="date-heading-trigger" data-date-heading-trigger aria-expanded="false"><span data-date-heading>' + title + "</span>" + icon("expand_more") + '</button><button type="button" data-date-prev aria-label="上一个月">' + icon("chevron_left") + '</button><button type="button" data-date-next aria-label="下一个月">' + icon("chevron_right") + "</button></header>" + monthMenu + '<div class="date-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="date-grid" role="grid">' + days + "</div></div>";
  }

  function dateTimeColumns(options) {
    var opts = options || {};
    var timeMatch = String(opts.value || "").match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
    var selectedValues = timeMatch ? [timeMatch[1], timeMatch[2], timeMatch[3] || "00"] : ["00", "00", "00"];
    var labels = opts.labels || {};
    var units = [
      ["hour", labels.hour || "时", 24, selectedValues[0]],
      ["minute", labels.minute || "分", 60, selectedValues[1]]
    ];
    if (opts.seconds !== false) units.push(["second", labels.second || "秒", 60, selectedValues[2]]);
    return '<div class="date-time-columns' + (units.length === 3 ? " has-seconds" : "") + '" aria-label="时间选择">' + units.map(function (unit) {
      return '<section class="date-time-column" data-date-time-unit="' + unit[0] + '"><strong>' + unit[1] + '</strong><div role="listbox" aria-label="' + unit[1] + '">' + Array.from({ length: unit[2] }, function (_, value) {
        var label = String(value).padStart(2, "0");
        var selected = label === unit[3];
        var check = selected && opts.showChecks ? icon("check", "time-option-check") : "";
        return '<button type="button" role="option" data-date-time-option="' + label + '" aria-selected="' + selected + '" tabindex="' + (selected ? "0" : "-1") + '" class="' + (selected ? "is-selected" : "") + '"><span>' + label + "</span>" + check + "</button>";
      }).join("") + "</div></section>";
    }).join("") + "</div>";
  }

  function datePickerValueMarkup(displayValue, range, hasValue) {
    var parts = hasValue && range ? String(displayValue).split(/\s+—\s+/) : [];
    if (parts.length !== 2) return '<span class="date-trigger-value" data-date-value>' + displayValue + "</span>";
    return '<span class="date-trigger-value is-range-value" data-date-value><span class="date-range-value-part" data-date-range-start>' + parts[0] + '</span><span class="date-range-separator" aria-hidden="true">—</span><span class="date-range-value-part" data-date-range-end>' + parts[1] + "</span></span>";
  }

  function datePickerSpec(options) {
    var opts = options || {};
    var range = opts.range === true;
    var open = opts.open === true;
    var placeholder = opts.placeholder || (range ? (opts.withTime ? "请选择日期时间范围" : "请选择日期范围") : (opts.withTime ? "请选择日期时间" : "请选择日期"));
    var defaultValue = range ? "2026-07-08 — 2026-07-18" : "2026-07-13";
    if (opts.withTime) defaultValue = range ? "2026-07-08 00:00:00 — 2026-07-18 00:00:00" : "2026-07-13 00:00:00";
    var hasExplicitValue = Object.prototype.hasOwnProperty.call(opts, "value");
    var rawValue = hasExplicitValue ? String(opts.value || "") : defaultValue;
    var empty = !rawValue || rawValue === placeholder || (opts.error && rawValue === "请选择日期");
    var value = empty ? "" : rawValue;
    var displayValue = value || placeholder;
    if (opts.displayTimeOnly && value) {
      var displayTimeMatch = value.match(/\d{2}:\d{2}(?::\d{2})?/);
      displayValue = displayTimeMatch ? displayTimeMatch[0] : placeholder;
    }
    var valueMarkup = datePickerValueMarkup(displayValue, range, Boolean(value));
    var confirmedDates = value.match(/\d{4}-\d{2}-\d{2}/g) || [];
    var rangeOptions = range ? { rangeStart: confirmedDates[0] || "", rangeEnd: confirmedDates[1] || "", disableOutside: !opts.withTime } : { selected: confirmedDates[0] || "" };
    var firstConfirmedDate = confirmedDates[0] ? confirmedDates[0].split("-").map(Number) : [];
    var calendarYear = Number(opts.year) || firstConfirmedDate[0] || 2026;
    var calendarMonthValue = Number(opts.month) || firstConfirmedDate[1] || 7;
    var nextCalendarDate = new Date(calendarYear, calendarMonthValue, 1);
    var calendars = calendarMonth(calendarYear, calendarMonthValue, rangeOptions) + (range && !opts.withTime ? calendarMonth(nextCalendarDate.getFullYear(), nextCalendarDate.getMonth() + 1, rangeOptions) : "");
    var shortcutButtons = opts.hideShortcuts
      ? '<aside class="date-shortcuts" aria-hidden="true"></aside>'
      : opts.currentTime
      ? '<aside class="date-shortcuts" aria-label="时间快捷操作"><button type="button" data-date-current-time>Current Time</button></aside>'
      : '<aside class="date-shortcuts" aria-label="快捷日期"><button type="button" data-date-shortcut="today" aria-pressed="false">今天</button>' + (range ? '<button type="button" data-date-shortcut="week" aria-pressed="false">本周</button><button type="button" data-date-shortcut="month" aria-pressed="false">本月</button><button type="button" data-date-shortcut="two-months" aria-pressed="false">本双月</button>' : "") + "</aside>";
    var actionButtons = opts.showActions === false ? "" : '<div class="date-actions"><button type="button" class="b2b-button" data-date-cancel>' + (opts.cancelLabel || "取消") + '</button><button type="button" class="b2b-button is-primary" data-date-confirm>' + (opts.confirmLabel || "确定") + "</button></div>";
    var footerClass = opts.currentTime && opts.showActions === false ? ' class="is-current-time-only"' : "";
    var rangeTimes = value.match(/\d{2}:\d{2}(?::\d{2})?/g) || [];
    var rangePhase = range && opts.withTime ? '<div class="date-range-phase" role="tablist" aria-label="编辑日期时间范围"><button type="button" role="tab" data-date-range-phase="start" aria-selected="true" tabindex="0">开始</button><button type="button" role="tab" data-date-range-phase="end" aria-selected="false" tabindex="-1">结束</button></div>' : "";
    var footer = opts.showFooter === false ? "" : '<footer' + footerClass + ">" + shortcutButtons + actionButtons + "</footer>";
    var panel = '<div class="date-picker-panel' + (range ? " is-range" : "") + (opts.withTime ? " has-time" : "") + '" role="dialog" aria-label="日期选择"' + (open ? "" : " hidden") + '>' + rangePhase + '<div class="date-picker-body"><div class="date-calendars">' + calendars + "</div>" + (opts.withTime ? dateTimeColumns({ value: rangeTimes[0] || value, seconds: opts.timeSeconds !== false, labels: opts.timeUnitLabels, showChecks: opts.showTimeChecks }) : "") + "</div>" + footer + "</div>";
    if (opts.mode && opts.mode !== "date") {
      var units = opts.mode === "year" ? ["2024", "2025", "2026", "2027", "2028", "2029"] : (opts.mode === "quarter" ? ["Q1", "Q2", "Q3", "Q4"] : opts.mode === "month" ? ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"] : ["第 27 周", "第 28 周", "第 29 周", "第 30 周"]);
      panel = '<div class="date-picker-panel is-unit" role="dialog" aria-label="' + opts.mode + '选择"' + (open ? "" : " hidden") + '><header><button type="button">' + icon("chevron_left") + '</button><strong>2026 年</strong><button type="button">' + icon("chevron_right") + '</button></header><div class="date-unit-grid">' + units.map(function (unit, index) { return '<button type="button" class="' + (index === 2 ? "is-selected" : "") + '" data-date-unit>' + unit + "</button>"; }).join("") + "</div></div>";
    }
    return '<div class="date-picker-spec' + (range ? " is-range" : "") + (opts.withTime ? " has-time" : "") + (opts.error ? " is-error" : "") + (opts.disabled ? " is-disabled" : "") + (empty ? " is-empty" : "") + (open ? " is-open" : "") + '" data-date-picker data-date-range="' + range + '" data-date-with-time="' + Boolean(opts.withTime) + '" data-date-clearable="' + Boolean(!opts.disabled && opts.clearable !== false) + '" data-date-range-phase="start" data-date-start-time="' + (rangeTimes[0] || "00:00:00") + '" data-date-end-time="' + (rangeTimes[1] || rangeTimes[0] || "00:00:00") + '" data-date-time-seconds="' + (opts.timeSeconds !== false) + '" data-date-time-checks="' + Boolean(opts.showTimeChecks) + '" data-date-display-time-only="' + Boolean(opts.displayTimeOnly) + '" data-date-placeholder="' + placeholder + '" data-date-value="' + value + '"><div class="date-trigger-shell"><button class="date-trigger" type="button" data-date-trigger aria-haspopup="dialog" aria-expanded="' + open + '"' + (opts.label ? ' aria-label="' + opts.label + '"' : "") + (opts.disabled ? " disabled" : "") + ">" + valueMarkup + '<span class="date-trigger-icon">' + icon(opts.triggerIcon || "calendar_today") + '</span></button>' + (opts.disabled || opts.clearable === false ? "" : '<button class="date-clear" type="button" data-date-clear aria-label="清空日期">' + icon("close") + "</button>") + "</div>" + panel + "</div>";
  }

  function componentReference(componentId, markup) {
    return '<span class="form-component-reference" data-component-reference="' + componentId + '">' + markup + "</span>";
  }

  function formField(label, options) {
    var opts = options || {};
    var required = opts.required ? '<b class="form-required" aria-hidden="true">*</b>' : "";
    var info = opts.info ? '<button class="form-info" type="button" data-component-reference="C-44" aria-label="查看字段说明">' + icon("info") + '<span role="tooltip">' + opts.info + "</span></button>" : "";
    var inputState = opts.disabled ? "disabled" : (opts.readonly ? "readonly" : "default");
    var inputAttrs = ' aria-label="' + label + '"' + (opts.dataAttrs ? " " + opts.dataAttrs : "");
    var control = opts.control || componentReference("C-21", inputSpec({
      value: opts.value || "",
      placeholder: Object.prototype.hasOwnProperty.call(opts, "placeholder") ? opts.placeholder : "Please enter text",
      state: inputState,
      size: opts.size,
      attrs: inputAttrs
    }));
    return '<div class="form-field' + (opts.error ? " is-error" : "") + (opts.horizontal ? " is-horizontal" : "") + '" data-form-field><span class="form-field-label">' + label + required + info + '</span><span class="form-field-control">' + control + (opts.help ? '<small class="form-help">' + opts.help + "</small>" : "") + (opts.error ? '<small class="form-error" role="alert">' + opts.error + "</small>" : "") + "</span></div>";
  }

  function basicForm(options) {
    var opts = options || {};
    var fields = opts.fields || [
      formField("名称", { required: true, placeholder: "请输入名称", size: opts.size }),
      formField("类型", { control: componentReference("C-23", sourceSelect({ placeholder: "请选择", open: false, size: opts.size })) }),
      formField("说明", { control: componentReference("C-21", textareaSpec({ value: "" })) })
    ];
    return '<form class="source-form' + (opts.columns === 2 ? " is-two-column" : "") + (opts.horizontal ? " is-label-left" : "") + (opts.size ? " is-size-" + opts.size : "") + (opts.spacing ? " is-spacing-" + opts.spacing : "") + '" data-source-form' + (opts.validate ? ' data-form-validation="' + opts.validate + '"' : "") + '><header><strong>' + (opts.title || "Form title") + "</strong>" + (opts.summary ? '<div class="form-error-summary" role="alert" hidden>' + icon("error") + '<span>请检查表单中的错误项</span></div>' : "") + '</header><div class="source-form-fields">' + fields.join("") + '</div><footer class="source-form-actions">' + button("确认", "is-primary", 'type="submit"') + button("取消", "", 'type="button"') + "</footer></form>";
  }

  function groupedForm(spacing, errors) {
    var rowInput = componentReference("C-21", inputSpec({ placeholder: "", attrs: ' aria-label="复合项内容"' }));
    var rowRemove = button("", "is-icon is-text is-neutral form-compound-row-remove", 'type="button" data-form-remove data-component-reference="C-04" aria-label="删除此行"', "close");

    function repeatItem() {
      return '<div class="form-repeat-item">' + rowInput + rowRemove + "</div>";
    }

    function compoundCard() {
      return '<article class="form-compound-card" data-form-compound-card>' +
        button("", "is-icon is-text is-neutral form-compound-delete", 'type="button" data-form-group-remove data-component-reference="C-04" aria-label="删除此组合"', "delete") +
        '<div class="form-repeat" data-form-repeat><span class="form-field-label">title</span><div data-repeat-list>' + repeatItem() + repeatItem() + "</div>" +
          button("Add", "is-text form-add", 'type="button" data-form-add data-component-reference="C-03"', "add") +
        "</div>" +
        formField("title", { placeholder: "" }) +
      "</article>";
    }

    var groupA = formField("Input", { placeholder: "Please input", error: errors ? "This item cannot be empty" : "" }) +
      formField("Radio", { control: componentReference("C-22", radioGroupSpec({ labels: ["option", "option", "option", "option"], horizontal: true, selected: -1 })), error: errors ? "Please select an option" : "" }) +
      '<div class="form-compound-field"><span class="form-field-label">title</span><div class="form-compound-list" data-form-compound-list>' + compoundCard() + compoundCard() + "</div>" +
        button("Add", "is-text form-compound-add", 'type="button" data-form-group-add data-component-reference="C-03"', "add") +
      "</div>";
    var groupB = formField("Checkbox", { control: componentReference("C-11", '<span class="form-choice-row">' + checkboxOption("option", "unchecked") + checkboxOption("option", "unchecked") + checkboxOption("option", "unchecked") + checkboxOption("option", "unchecked") + "</span>"), error: errors ? "Please select at least one option" : "" }) +
      formField("Select", { control: componentReference("C-23", sourceSelect({ placeholder: "option", selected: ["option"], items: ["option", "option 2", "option 3"], clearable: false, state: "default", open: false })), error: errors ? "Please select an option" : "" });
    return '<form class="source-form is-grouped is-compound is-spacing-' + (spacing || "small") + (errors ? " has-errors" : "") + '" data-source-form><section><h4>Group A</h4>' + groupA + '</section><section><h4>Group B</h4>' + groupB + "</section></form>";
  }

  function combinationForm(spacing, errors) {
    var resolvedSpacing = spacing === "large" ? "large" : "small";
    var state = errors ? "error" : "default";
    return '<form class="source-form is-combination-form is-spacing-' + resolvedSpacing + (errors ? " has-errors" : "") + '" data-source-form>' +
      '<div class="field"><span class="field-label">联系电话</span>' + affixInputSpec({ prefix: "+86", value: "138 0000 0000", state: state }) + "</div>" +
      '<div class="field"><span class="field-label">地址</span>' + combinationInputSpec({ count: 3, values: ["中国", "上海", "浦东新区"], state: state }) + "</div>" +
    "</form>";
  }

  function stepForm() {
    var stepNavigation = '<ol class="steps steps-spec is-compact form-stepper" data-component-reference="C-14" aria-label="表单步骤"><li class="is-current" tabindex="0" role="button" data-step-index="0" data-step-target="1" aria-current="step" aria-expanded="true"><span class="step-node">1</span><div class="step-copy"><strong>基本信息</strong><small>填写必填字段</small></div></li><li class="is-waiting" tabindex="-1" role="button" data-step-index="1" data-step-target="2" aria-current="false" aria-expanded="false"><span class="step-node">2</span><div class="step-copy"><strong>配置选项</strong><small>选择类型与规则</small></div></li><li class="is-waiting" tabindex="-1" role="button" data-step-index="2" data-step-target="3" aria-current="false" aria-expanded="false"><span class="step-node">3</span><div class="step-copy"><strong>确认提交</strong><small>检查已填信息</small></div></li></ol>';
    return '<form class="source-form is-step-form" data-form-steps data-step="1">' + stepNavigation + '<section data-step-panel="1" aria-hidden="false">' + formField("名称", { required: true, placeholder: "请输入名称" }) + formField("说明", { placeholder: "请输入说明" }) + '</section><section data-step-panel="2" aria-hidden="true" hidden>' + formField("类型", { control: componentReference("C-23", sourceSelect({ placeholder: "请选择", open: false })) }) + formField("启用规则", { control: componentReference("C-27", sourceSwitch({ state: "on-normal", label: "启用规则" })) }) + '</section><section data-step-panel="3" aria-hidden="true" hidden><div class="form-review"><strong>请确认已填写的信息</strong><p>提交前可返回上一步修改。</p></div></section><footer>' + button("上一步", "", 'type="button" data-form-prev data-component-reference="C-02" disabled') + button("下一步", "is-primary", 'type="button" data-form-next data-component-reference="C-02"') + "</footer></form>";
  }

  function linkedForm() {
    var scopeOptions = '<span class="form-choice-column" role="radiogroup">' + radioOption("全部下属", "selected", { name: "scope", value: "all" }) + radioOption("指定部门", "not-selected", { name: "scope", value: "department" }) + "</span>";
    return '<form class="source-form is-linked" data-linked-form>' + formField("授权人", { required: true, placeholder: "请输入姓名" }) + formField("授权范围", { control: componentReference("C-22", scopeOptions) }) + '<div data-linked-department hidden>' + formField("部门", { control: componentReference("C-23", sourceSelect({ placeholder: "请选择部门", open: false })) }) + "</div></form>";
  }

  function inputSpec(options) {
    var opts = options || {};
    var state = opts.state || "default";
    var value = opts.value == null ? (state === "complete" || state === "readonly" || state === "disabled" ? "Input text" : "") : opts.value;
    var maxLength = Math.max(1, Math.floor(Number(opts.maxLength) || 20));
    if (opts.counter) value = String(value).slice(0, maxLength);
    var placeholder = Object.prototype.hasOwnProperty.call(opts, "placeholder") ? opts.placeholder : "Please enter text";
    var prefix = opts.prefix ? icon(opts.prefix) : "";
    var suffix = opts.suffix ? icon(opts.suffix, "input-guidance-icon") : "";
    var infoTooltip = opts.infoTooltip
      ? tooltipSpec({
        position: opts.infoTooltip.position || "top",
        text: opts.infoTooltip.text,
        trigger: '<button class="input-info-trigger" type="button" aria-label="查看输入说明">' + icon("info") + "</button>"
      })
      : "";
    var clear = opts.clear && state !== "disabled" && state !== "readonly" ? '<button type="button" data-input-clear aria-label="清除输入">' + icon("cancel") + "</button>" : "";
    var password = opts.password ? '<button type="button" data-password-toggle aria-label="显示密码">' + icon("visibility_off") + "</button>" : "";
    var tag = opts.tag ? '<span class="input-inline-tag">' + opts.tag + "</span>" : "";
    var counter = opts.counter ? '<span class="source-input-count" aria-live="polite"><b data-input-text-count>' + String(value).length + "</b>/" + maxLength + "</span>" : "";
    return '<label class="source-input is-' + state + (opts.borderless ? " is-borderless" : "") + (opts.counter ? " has-counter" : "") + (opts.size ? " is-size-" + opts.size : "") + (opts.className ? " " + opts.className : "") + '" data-source-input' + (opts.labelAttrs ? " " + opts.labelAttrs : "") + '>' + prefix + '<input type="' + (opts.type || (opts.password ? "password" : "text")) + '" value="' + value + '" placeholder="' + placeholder + '"' + (opts.counter ? ' maxlength="' + maxLength + '" data-input-count' : "") + (state === "disabled" ? " disabled" : "") + (state === "readonly" ? " readonly" : "") + (state === "error" ? ' aria-invalid="true"' : "") + (opts.attrs || "") + ">" + tag + suffix + infoTooltip + clear + password + counter + "</label>" + (state === "error" ? '<small class="input-error">This item cannot be empty</small>' : "");
  }

  function numberInputSpec(options) {
    var opts = options || {};
    var state = opts.state || "default";
    var min = opts.min == null ? 0 : Number(opts.min);
    var max = opts.max == null ? 10 : Number(opts.max);
    var step = opts.step == null || Number(opts.step) <= 0 ? 1 : Number(opts.step);
    var value = opts.value == null ? "" : String(opts.value);
    var numericValue = value === "" ? min : Number(value);
    var locked = state === "disabled" || state === "readonly";
    return '<div class="source-number-input is-' + state + (opts.size ? " is-size-" + opts.size : "") + '" data-number-input data-min="' + min + '" data-max="' + max + '" data-step="' + step + '"><input inputmode="' + (step % 1 === 0 ? "numeric" : "decimal") + '" value="' + value + '" placeholder="' + (opts.placeholder || "Please enter text") + '"' + (state === "disabled" ? " disabled" : "") + (state === "readonly" ? " readonly" : "") + (state === "error" ? ' aria-invalid="true"' : "") + '><span><button type="button" data-number-step="1" aria-label="增加"' + (locked || numericValue >= max ? " disabled" : "") + '>' + icon("expand_less") + '</button><button type="button" data-number-step="-1" aria-label="减少"' + (locked || numericValue <= min ? " disabled" : "") + '>' + icon("expand_more") + "</button></span></div>" + (state === "error" ? '<small class="input-error">This item cannot be empty</small>' : "");
  }

  function inputSelectSegment(options) {
    var opts = options || {};
    var items = (opts.items || ["Option 1", "Option 2", "Option 3"]).map(function (item) {
      return typeof item === "string" ? { value: item, label: item } : item;
    });
    var selected = opts.selected == null ? items[0].value : opts.selected;
    var open = Boolean(opts.open);
    var state = opts.state || "default";
    var disabled = state === "disabled";
    var readonly = state === "readonly";
    var selectedItem = items.find(function (item) { return item.value === selected; }) || items[0];
    var optionsMarkup = items.map(function (item, index) {
      var isSelected = item.value === selected;
      return '<button class="source-select-option' + (isSelected ? " is-selected" : "") + '" type="button" role="option" aria-selected="' + isSelected + '" data-select-option data-value="' + item.value + '" data-label="' + item.label + '" data-index="' + index + '"' + (disabled || readonly ? " disabled" : "") + '><span class="select-option-content"><span class="select-option-copy"><span>' + item.label + "</span></span></span>" + (isSelected ? icon("check") : "") + "</button>";
    }).join("");
    return '<div class="input-select-segment ' + (opts.className || "") + " is-" + state + (open ? " is-open" : "") + '" data-select-demo data-multiple="false" data-clearable="false"' + (opts.addonPosition ? ' data-input-addon data-addon-position="' + opts.addonPosition + '" data-addon-id="' + (opts.addonId || opts.addonPosition) + '"' : "") + '><div class="input-select-control" data-select-control><button class="input-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="' + open + '" aria-label="' + (opts.ariaLabel || "选择输入属性") + '" data-select-trigger' + (disabled || readonly ? " disabled" : "") + '><span class="input-select-selection" data-select-selection><span class="source-select-value">' + selectedItem.label + "</span></span>" + icon("expand_more", "source-select-arrow") + '</button></div><div class="source-select-panel input-select-panel" role="listbox" aria-multiselectable="false" data-select-panel aria-hidden="' + (!open) + '"><div class="source-select-options" data-select-options>' + optionsMarkup + "</div></div></div>";
  }

  function inputAddonSpec(addon, position, state, open) {
    if (!addon) return "";
    if (addon.type === "select") {
      return inputSelectSegment({
        className: "affix-addon-select affix-" + position + "-select",
        items: addon.options,
        selected: addon.value,
        open: open,
        state: state,
        addonPosition: position,
        addonId: addon.id,
        ariaLabel: addon.ariaLabel
      });
    }
    return '<span class="affix-addon affix-' + position + '" data-input-addon data-addon-position="' + position + '" data-addon-id="' + addon.id + '">' + addon.text + "</span>";
  }

  function affixInputSpec(options) {
    var opts = options || {};
    var state = opts.state || "default";
    var selectedPrefix = opts.prefix || "CM";
    var prefixItems = opts.items || (["MM", "CM", "DM"].indexOf(selectedPrefix) >= 0 ? ["MM", "CM", "DM"] : [selectedPrefix]);
    var prefixAddon = Object.prototype.hasOwnProperty.call(opts, "prefixAddon")
      ? opts.prefixAddon
      : (opts.toggle
        ? { id: "prefix", type: "select", value: selectedPrefix, options: prefixItems, ariaLabel: "选择前缀" }
        : { id: "prefix", type: "text", text: opts.prefix || "Https://" });
    var suffixAddon = Object.prototype.hasOwnProperty.call(opts, "suffixAddon")
      ? opts.suffixAddon
      : (opts.suffix ? { id: "suffix", type: "text", text: opts.suffix } : null);
    var prefix = inputAddonSpec(prefixAddon, "prefix", state, Boolean(opts.open));
    var suffix = inputAddonSpec(suffixAddon, "suffix", state, Boolean(opts.suffixOpen));
    return '<div class="source-affix-input is-' + state + (opts.size ? " is-size-" + opts.size : "") + (opts.open || opts.suffixOpen ? " is-open" : "") + '" data-affix-input>' + prefix + '<input value="' + (opts.value == null ? "" : opts.value) + '" placeholder="' + (opts.placeholder || "Enter the URL") + '"' + (state === "disabled" ? " disabled" : "") + (state === "readonly" ? " readonly" : "") + (state === "error" ? ' aria-invalid="true"' : "") + ">" + suffix + "</div>" + (state === "error" ? '<small class="input-error">This item cannot be empty</small>' : "");
  }

  function combinationInputSpec(options) {
    var opts = options || {};
    var state = opts.state || "default";
    var count = opts.count || 2;
    var segments = opts.segments || Array.from({ length: count }, function (_, index) {
      return { id: index ? "end" : "start", label: index ? "结束值" : "起始值", value: opts.values && opts.values[index] || "", placeholder: index ? "End" : "Start" };
    });
    var appearance = opts.appearance || "filled";
    return '<div class="source-combination-input is-' + state + " is-appearance-" + appearance + (opts.size ? " is-size-" + opts.size : "") + '" data-combination-input>' + segments.map(function (segment) { return '<input value="' + segment.value + '" placeholder="' + segment.placeholder + '" aria-label="' + segment.label + '" data-combination-part data-segment-id="' + segment.id + '"' + (state === "disabled" ? " disabled" : "") + (state === "readonly" ? " readonly" : "") + (state === "error" ? ' aria-invalid="true"' : "") + ">"; }).join("") + "</div>" + (state === "error" ? '<small class="input-error">This item cannot be empty</small>' : "");
  }

  function combinationSelectSpec(options) {
    var opts = options || {};
    var state = opts.state || "default";
    var selected = opts.selected || "Option 1";
    var segment = opts.segment || { id: "value", label: "输入内容", value: opts.value || "", placeholder: opts.placeholder || "Enter the text" };
    return '<div class="source-combination-input source-combination-select is-' + state + ' is-appearance-filled' + (opts.size ? " is-size-" + opts.size : "") + (opts.open ? " is-open" : "") + '" data-combination-input>' + inputSelectSegment({ className: "combination-select-segment", items: opts.items, selected: selected, open: opts.open, state: state, ariaLabel: opts.selectAriaLabel || "选择组合项" }) + '<input value="' + segment.value + '" placeholder="' + segment.placeholder + '" aria-label="' + segment.label + '" data-combination-part data-segment-id="' + segment.id + '"' + (state === "disabled" ? " disabled" : "") + (state === "readonly" ? " readonly" : "") + (state === "error" ? ' aria-invalid="true"' : "") + "></div>" + (state === "error" ? '<small class="input-error">This item cannot be empty</small>' : "");
  }

  function otpInputSpec(options) {
    var opts = options || {};
    var values = opts.values || ["", "", "", "", "", ""];
    return '<div class="source-otp is-' + (opts.state || "default") + '" data-otp-input>' + values.map(function (value, index) { return (index === 3 ? '<span aria-hidden="true">–</span>' : "") + '<input inputmode="numeric" maxlength="1" value="' + value + '" aria-label="第 ' + (index + 1) + ' 位"' + (opts.password ? ' type="password"' : "") + (opts.state === "disabled" ? " disabled" : "") + (opts.state === "error" ? ' aria-invalid="true"' : "") + ">"; }).join("") + "</div>" + (opts.state === "error" ? '<small class="input-error">This item cannot be empty</small>' : "");
  }

  function textareaSpec(options) {
    var opts = options || {};
    // Production props have already been escaped by the canonical adapter.
    var placeholder = opts.placeholder == null ? "Please enter text" : opts.placeholder;
    var value = opts.value || "";
    var rows = opts.auto ? Math.min(6, Math.max(1, value.split("\n").length)) : 4;
    var counter = opts.counter === false ? "" : '<span><b data-text-count>' + value.length + "</b>/240</span>";
    return '<label class="source-textarea is-' + (opts.state || "default") + (opts.auto ? " is-auto" : "") + (counter ? " has-counter" : "") + '"><textarea rows="' + rows + '" maxlength="240" placeholder="' + placeholder + '" data-textarea-count' + (opts.state === "disabled" ? " disabled" : "") + (opts.state === "readonly" ? " readonly" : "") + (opts.state === "error" ? ' aria-invalid="true"' : "") + ">" + value + "</textarea>" + counter + "</label>" + (opts.state === "error" ? '<small class="input-error">Error message</small>' : "");
  }

  function radioOption(label, state, options) {
    var opts = options || {};
    var selected = state.indexOf("selected") === 0;
    var disabled = state.indexOf("disabled") >= 0;
    var tooltipId = "";
    var tooltip = "";
    if (opts.tooltip) {
      D.radioLabelTooltipId = (D.radioLabelTooltipId || 0) + 1;
      tooltipId = "radio-label-tooltip-" + D.radioLabelTooltipId;
      tooltip = '<output class="radio-label-tooltip" id="' + tooltipId + '" role="tooltip">' + label + '<i aria-hidden="true"></i></output>';
    }
    return '<label class="radio-spec is-' + state + (opts.long ? " is-long" : "") + '"><input type="radio" name="' + (opts.name || "radio-" + Math.random().toString(36).slice(2)) + '"' + (opts.value != null ? ' value="' + opts.value + '"' : "") + (tooltipId ? ' aria-describedby="' + tooltipId + '"' : "") + (selected ? " checked" : "") + (disabled ? " disabled" : "") + (opts.dataAttrs ? " " + opts.dataAttrs : "") + '><span class="radio-control" aria-hidden="true"><i></i></span><span class="radio-copy" title="' + label + '">' + label + "</span>" + tooltip + "</label>";
  }

  function radioGroupSpec(options) {
    var opts = options || {};
    var labels = opts.labels || ["Option text", "Option text", "Option text", "Option text"];
    var name = "radio-group-" + Math.random().toString(36).slice(2);
    return '<div class="radio-group-spec' + (opts.horizontal ? " is-horizontal" : "") + (opts.list ? " is-list" : "") + '" role="radiogroup">' + labels.map(function (label, index) { return radioOption(label, index === (opts.selected == null ? 0 : opts.selected) ? "selected" : "not-selected", { name: name, long: opts.long, tooltip: opts.long }); }).join("") + "</div>";
  }

  function radioStateMatrix() {
    var columns = ["Normal", "Hover", "Pressed", "Focus", "Disabled", "Error"];
    var states = [["Not selected", ["not-selected", "not-selected-hover", "not-selected-pressed", "not-selected-focus", "not-selected-disabled", "not-selected-error"]], ["Selected", ["selected", "selected-hover", "selected-pressed", "selected-focus", "selected-disabled", "selected-error"]]];
    return '<div class="radio-state-matrix" role="table"><div class="radio-state-row is-header"><strong>状态</strong>' + columns.map(function (column) { return "<span>" + column + "</span>"; }).join("") + "</div>" + states.map(function (rowData) { return '<div class="radio-state-row"><strong>' + rowData[0] + "</strong>" + rowData[1].map(function (state) { return '<span>' + radioOption("Option text", state, { name: "state-" + state }) + "</span>"; }).join("") + "</div>"; }).join("") + "</div>";
  }

  function radioButtonGroup(options) {
    var opts = options || {};
    var state = opts.state || "default";
    var labels = opts.labels || ["Option 1", "Option 2", "Option 3", "Option 4"];
    var values = opts.values || labels;
    var selectedIndex = opts.selected == null ? 0 : opts.selected;
    var name = "radio-buttons-" + Math.random().toString(36).slice(2);
    return '<div class="radio-button-group is-' + (opts.size || "medium") + ' is-' + state + (opts.className ? " " + opts.className : "") + '" role="radiogroup" aria-label="' + (opts.groupLabel || "按钮型单选") + '" data-radio-button-group' + (opts.dataAttrs ? " " + opts.dataAttrs : "") + '>' + labels.map(function (label, index) {
      var selected = index === selectedIndex;
      D.radioLabelTooltipId = (D.radioLabelTooltipId || 0) + 1;
      var tooltipId = "radio-label-tooltip-" + D.radioLabelTooltipId;
      return '<label class="radio-button' + (selected ? " is-selected" : "") + '"><input type="radio" name="' + name + '" value="' + values[index] + '" aria-label="' + label + '" aria-describedby="' + tooltipId + '"' + (selected ? " checked" : "") + (state === "disabled" ? " disabled" : "") + '><span title="' + label + '">' + label + '</span><output class="radio-label-tooltip" id="' + tooltipId + '" role="tooltip">' + label + '<i aria-hidden="true"></i></output></label>';
    }).join("") + "</div>";
  }

  function ratingSpec(options) {
    var opts = options || {};
    var value = Number(opts.value || 0);
    var step = Number(opts.step) === 0.5 ? 0.5 : 1;
    var labels = ["Please click to rate", "Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"];
    var glyph = opts.icon || "star";
    var colorClass = opts.color === "blue" ? " is-blue" : "";
    return '<div class="rating-spec' + colorClass + (opts.readonly ? " is-readonly" : "") + '" data-rating data-value="' + value + '" data-step="' + step + '" data-clearable="' + (opts.clearable !== false) + '" role="radiogroup" aria-label="评分"><span class="rating-stars">' + Array.from({ length: 5 }, function (_, index) {
      var score = index + 1;
      var selected = value >= score;
      var half = !selected && value > index;
      var halfHint = step === 0.5 ? "，点击左半边选择 " + (score - 0.5) + " 分，右半边选择 " + score + " 分" : "";
      return '<button class="rating-star' + (selected ? " is-selected" : "") + (half ? " is-half" : "") + '" type="button" role="radio" aria-checked="' + selected + '" aria-label="' + score + ' 分' + halfHint + '" data-rating-value="' + score + '"' + (opts.readonly ? " disabled" : "") + '><span class="rating-star-icon" aria-hidden="true">' + icon(glyph) + '<span class="rating-star-fill">' + icon(glyph) + "</span></span></button>";
    }).join("") + '</span><span class="rating-prompt" data-rating-prompt aria-live="polite">' + (opts.prompt || labels[Math.round(value)]) + "</span></div>";
  }

  function sentimentSpec(options) {
    var opts = options || {};
    var selected = opts.selected || "";
    var stateClass = opts.state ? " is-" + opts.state : "";
    return '<div class="sentiment-spec' + (opts.small ? " is-small" : "") + stateClass + '" data-sentiment><button type="button" data-sentiment-value="good" aria-pressed="' + (selected === "good") + '" class="' + (selected === "good" ? "is-selected" : "") + '">' + icon("thumb_up") + '<span>' + (opts.good || (opts.small ? "Helpful" : "Good")) + '</span></button><button type="button" data-sentiment-value="bad" aria-pressed="' + (selected === "bad") + '" class="' + (selected === "bad" ? "is-selected" : "") + '">' + icon("thumb_down") + '<span>' + (opts.bad || (opts.small ? "Unhelpful" : "Bad")) + "</span></button></div>";
  }

  function stepperSpec(options) {
    var opts = options || {};
    var value = opts.value == null ? 5 : opts.value;
    var min = opts.min == null ? 1 : opts.min;
    var max = opts.max == null ? 999 : opts.max;
    var state = opts.state || "normal";
    var disableAll = state === "disabled";
    var decrementDisabled = disableAll || Number(value) <= min;
    var incrementDisabled = disableAll || Number(value) >= max;
    return '<div class="source-stepper is-' + state + (opts.size ? " is-size-" + opts.size : "") + (opts.width ? " is-width-" + opts.width : "") + '" data-source-stepper data-min="' + min + '" data-max="' + max + '" data-step="' + (opts.step || 1) + '"><button type="button" data-stepper-step="-1" aria-label="减少"' + (decrementDisabled ? " disabled" : "") + '>' + icon("remove") + '</button><input inputmode="numeric" value="' + value + '" aria-label="数值" data-stepper-input' + (disableAll ? " disabled" : "") + (state === "error" ? ' aria-invalid="true"' : "") + '><button type="button" data-stepper-step="1" aria-label="增加"' + (incrementDisabled ? " disabled" : "") + '>' + icon("add") + "</button></div>" + (state === "error" ? '<small class="stepper-error">Error message</small>' : "");
  }

  function sourceSlider(options) {
    var opts = options || {};
    var min = opts.min == null ? 0 : opts.min;
    var max = opts.max == null ? 100 : opts.max;
    var value = opts.value == null ? 40 : opts.value;
    var second = opts.second == null ? 75 : opts.second;
    var range = Boolean(opts.range);
    var markValues = opts.marks ? (opts.markValues || [0, 25, 50, 75, 100]).map(Number).filter(function (mark) {
      return Number.isFinite(mark) && mark >= min && mark <= max;
    }).sort(function (a, b) { return a - b; }) : [];
    function nearestMark(current) {
      if (!markValues.length) return current;
      return markValues.reduce(function (nearest, mark) {
        return Math.abs(mark - current) < Math.abs(nearest - current) ? mark : nearest;
      }, markValues[0]);
    }
    if (markValues.length) {
      value = nearestMark(value);
      second = nearestMark(second);
    }
    var low = range ? Math.min(value, second) : min;
    var high = range ? Math.max(value, second) : value;
    var lowPct = (low - min) / (max - min) * 100;
    var highPct = (high - min) / (max - min) * 100;
    var markStep = markValues.length > 1 ? markValues.slice(1).reduce(function (step, mark, index) {
      return Math.min(step, mark - markValues[index]);
    }, max - min) : (opts.step || 1);
    var step = opts.step || markStep || 1;
    var marks = opts.marks ? '<div class="source-slider-marks" aria-hidden="true">' + markValues.map(function (mark) {
      var position = (mark - min) / (max - min) * 100;
      return '<span class="source-slider-mark" style="--slider-mark-position:' + position + '%"><i></i><span>' + mark + "</span></span>";
    }).join("") + "</div>" : "";
    var tooltip = "";
    if (opts.tooltip !== false) {
      tooltip = range
        ? '<output class="source-slider-tooltip is-low" data-slider-output="low">' + low + '</output><output class="source-slider-tooltip is-high" data-slider-output="high">' + high + "</output>"
        : '<output class="source-slider-tooltip is-single" data-slider-output="single">' + value + "</output>";
    }
    var input = opts.withInput ? '<input class="source-slider-linked" type="number" min="' + min + '" max="' + max + '" value="' + value + '" data-slider-linked aria-label="滑块数值">' : "";
    var icons = opts.icons ? icon("volume_mute") + '<span class="source-slider-icon-wrap">' : "";
    var iconClose = opts.icons ? "</span>" + icon("volume_up") : "";
    var orientation = opts.vertical ? ' aria-orientation="vertical"' : "";
    return '<div class="source-slider-spec' + (range ? " is-range" : "") + (opts.vertical ? " is-vertical" : "") + (opts.state ? " is-" + opts.state : "") + (opts.marks ? " has-marks" : "") + (opts.icons ? " has-icons" : "") + '" data-source-slider data-min="' + min + '" data-max="' + max + '" data-slider-marks="' + markValues.join(",") + '" style="--slider-low:' + lowPct + "%;--slider-high:" + highPct + '%">' + icons + '<div class="source-slider-control"><div class="source-slider-track"><i></i></div><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" data-slider-range="low" aria-label="' + (range ? "范围起点" : "滑块数值") + '"' + orientation + (opts.state === "disabled" ? " disabled" : "") + ">" + (range ? '<input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + second + '" data-slider-range="high" aria-label="范围终点"' + orientation + (opts.state === "disabled" ? " disabled" : "") + ">" : "") + '<div class="source-slider-geometry">' + tooltip + marks + "</div></div>" + iconClose + input + "</div>";
  }

  function sourceSwitch(options) {
    var opts = options || {};
    var state = opts.state || "off-normal";
    var on = state.indexOf("on-") === 0;
    var disabled = state.indexOf("disabled") >= 0;
    var loading = state.indexOf("loading") >= 0;
    return '<button class="b2b-switch source-switch is-' + (opts.size || "medium") + (loading ? " is-loading" : "") + '" type="button" role="switch" aria-checked="' + on + '" aria-label="' + (opts.label || "切换设置") + '"' + (disabled || loading ? " disabled" : "") + '>' + (loading ? icon("progress_activity", "button-spinner") : "") + "</button>";
  }

  function sourceNavigationTree(options) {
    var opts = options || {};
    var nodes = opts.nodes || [
      { label: "System Wiki", selected: true, children: [{ label: "Getting started" }] },
      { label: "Old", expanded: true, children: [{ label: "Playground", expanded: true, children: [
        { label: "Suite Service", children: [{ label: "Overview" }] },
        { label: "Link" },
        { label: "Kotlin" }
      ] }] },
      { label: "Home", icon: "view_sidebar", children: [{ label: "Dashboard" }] },
      { label: "product", icon: "view_sidebar", children: [{ label: "Roadmap" }] }
    ];

    function navigationNode(node) {
      var children = (node.children || []).map(navigationNode).join("");
      var expanded = Boolean(node.expanded);
      var selected = Boolean(node.selected);
      var toggle = children
        ? '<button class="tree-nav-toggle tree-custom-expand" type="button" data-tree-nav-toggle aria-expanded="' + expanded + '" aria-label="' + (expanded ? "折叠 " : "展开 ") + node.label + '"><span class="tree-triangle" aria-hidden="true"></span></button>'
        : '<span class="tree-nav-toggle tree-custom-expand is-placeholder" aria-hidden="true"></span>';
      return '<div class="tree-nav-node' + (expanded ? " is-expanded" : "") + (selected ? " is-selected" : "") + '" data-tree-nav-node>' +
        '<div class="tree-nav-row">' + toggle +
        '<span class="tree-nav-leading" aria-hidden="true">' + icon(node.icon || "description") + "</span>" +
        '<button class="tree-nav-label" type="button" data-tree-nav-label' + (selected ? ' aria-current="page"' : "") + ">" + node.label + "</button></div>" +
        (children ? '<div class="tree-nav-children">' + children + "</div>" : "") +
        "</div>";
    }

    return '<div class="tree-navigation-demo" data-tree-navigation><nav class="tree-navigation-rail" aria-label="' + (opts.label || "知识库导航") + '">' + nodes.map(navigationNode).join("") + '</nav><section class="tree-navigation-content" aria-label="导航内容区"></section></div>';
  }

  function treeNodeLabels(nodes) {
    return (nodes || []).reduce(function (labels, node) {
      return labels.concat(node.label, treeNodeLabels(node.children));
    }, []);
  }

  function treeLeafLabels(nodes) {
    return (nodes || []).reduce(function (labels, node) {
      return node.children && node.children.length ? labels.concat(treeLeafLabels(node.children)) : labels.concat(node.label);
    }, []);
  }

  function treeSelectedLeafValues(nodes, selected) {
    return (nodes || []).reduce(function (values, node) {
      if (node.children && node.children.length) {
        if (selected.indexOf(node.label) >= 0) {
          return values.concat(treeLeafLabels(node.children));
        }
        return values.concat(treeSelectedLeafValues(node.children, selected));
      }
      if (selected.indexOf(node.label) >= 0) values.push(node.label);
      return values;
    }, []).filter(function (value, index, list) { return list.indexOf(value) === index; });
  }

  function treeNormalizeCheckSelection(nodes, selected) {
    var values = selected.slice();
    (nodes || []).forEach(function (node) {
      if (values.indexOf(node.label) >= 0 && node.children && node.children.length) values = values.concat(treeNodeLabels(node.children));
      values = values.concat(treeNormalizeCheckSelection(node.children, values));
    });
    return values.filter(function (value, index, list) { return list.indexOf(value) === index; });
  }

  function treeSelectionMarkup(selected, multiple, locked) {
    if (!selected.length) return '<span class="source-tree-placeholder">Please select</span>';
    if (!multiple) return '<span class="source-tree-value">' + selected[0] + "</span>";
    var visible = selected.slice(0, 2).map(function (value) {
      var remove = locked ? "" : '<i role="button" tabindex="0" data-tree-remove data-value="' + value + '" aria-label="移除 ' + value + '">' + icon("close") + "</i>";
      return '<span class="source-tree-tag" data-tree-tag data-value="' + value + '"><span>' + value + "</span>" + remove + "</span>";
    }).join("");
    return visible + (selected.length > 2 ? '<span class="source-tree-tag is-summary" aria-label="另有 ' + (selected.length - 2) + ' 项">+' + (selected.length - 2) + "</span>" : "");
  }

  function treeBranch(label, children, options) {
    var opts = options || {};
    var selectedValues = opts.selected || [];
    var descendants = treeNodeLabels(children);
    var selected = selectedValues.indexOf(label) >= 0 || Boolean(opts.checkable && descendants.length && descendants.every(function (value) { return selectedValues.indexOf(value) >= 0; }));
    var indeterminate = Boolean(opts.checkable && !selected && descendants.some(function (value) { return selectedValues.indexOf(value) >= 0; }));
    var title = '<span class="tree-node-title" data-tree-title data-tree-title-value="' + label + '">' + label + "</span>";
    var control = opts.checkable
      ? '<label class="tree-check-label"><input class="tree-check-input" type="checkbox" data-tree-check value="' + label + '"' + (selected ? " checked" : "") + (indeterminate ? " data-indeterminate" : "") + ' aria-label="选择 ' + label + '"><span class="tree-checkbox" aria-hidden="true"></span>' + title + "</label>"
      : '<button type="button" role="treeitem" data-tree-choice data-value="' + label + '" aria-level="' + (opts.level || 1) + '" aria-selected="' + selected + '">' + title + (selected ? icon("check") : "") + "</button>";
    if (!children || !children.length) {
      return '<div class="source-tree-leaf" data-tree-node data-tree-label="' + label.toLowerCase() + '"><span class="tree-spacer" aria-hidden="true"></span>' + control + "</div>";
    }
    return '<div class="source-tree-branch is-expanded" data-tree-node data-tree-label="' + label.toLowerCase() + '"><div class="source-tree-row"><button class="tree-expand" type="button" data-tree-expand aria-expanded="true" aria-label="折叠 ' + label + '">' + icon("arrow_right", "tree-arrow") + "</button>" + control + '</div><div class="source-tree-children" role="group">' + children.map(function (child) {
      return treeBranch(child.label, child.children, {
        checkable: opts.checkable,
        selected: selectedValues,
        level: (opts.level || 1) + 1
      });
    }).join("") + "</div></div>";
  }

  function sourceTreeSelect(options) {
    var opts = options || {};
    var selected = opts.selected || [];
    var multiple = Boolean(opts.multiple || opts.checkable);
    var state = opts.state || "activated";
    var locked = state === "disabled" || state === "readonly";
    var open = opts.open === true || (opts.open !== false && ["activated", "hover-list", "search", "second-activated", "loading", "no-result"].indexOf(state) >= 0);
    var tree = opts.nodes || [{ label: "Level I 1" }, { label: "Level I 2", children: [{ label: "Level II 2-1", children: [{ label: "Level III 2-1-1" }, { label: "Level III 2-1-2" }, { label: "Level III 2-1-3" }] }, { label: "Level II 2-2", children: [{ label: "Level III 2-2-1" }, { label: "Level III 2-2-2" }] }] }];
    var treeSelected = opts.checkable ? treeNormalizeCheckSelection(tree, selected) : selected;
    var id = "source-tree-select-" + (++treeSelectSequence);
    var query = opts.query == null && state === "search" ? "2-1-2" : (opts.query || "");
    var displaySelected = opts.checkable ? treeSelectedLeafValues(tree, treeSelected) : treeSelected;
    var selection = treeSelectionMarkup(displaySelected, multiple, locked);
    var clear = locked ? "" : '<button class="source-tree-clear" type="button" data-tree-clear aria-label="清空选择"' + (displaySelected.length ? "" : " hidden") + '>' + icon("cancel") + "</button>";
    var search = '<div class="source-tree-search">' + icon("search") + '<input type="search" value="' + query + '" placeholder="搜索节点" data-tree-search aria-label="搜索节点"><button type="button" data-tree-search-clear aria-label="清空搜索">' + icon("cancel") + "</button></div>";
    var treeMarkup = '<div class="source-tree" role="tree" aria-multiselectable="' + multiple + '">' + tree.map(function (branch) {
      return treeBranch(branch.label, branch.children, { checkable: opts.checkable, selected: treeSelected, level: 1 });
    }).join("") + '</div><div class="source-tree-feedback is-empty" data-tree-empty hidden>' + icon("search_off") + "<span>No relevant results found</span></div>";
    var panel = state === "loading"
      ? '<div class="source-tree-feedback is-loading" role="status">' + icon("progress_activity", "button-spinner") + "<span>Loading</span></div>"
      : (state === "no-result"
        ? search + '<div class="source-tree-feedback is-empty" role="status">' + icon("search_off") + "<span>No relevant results found</span></div>"
        : search + treeMarkup);
    return '<div class="source-tree-select is-' + state + (open ? " is-open" : "") + (multiple ? " is-multiple" : "") + (opts.checkable ? " is-checkable" : "") + '" data-tree-select data-multiple="' + multiple + '" data-checkable="' + Boolean(opts.checkable) + '" data-checked-strategy="' + (opts.checkable ? "child" : "all") + '"><button class="source-tree-trigger" type="button" data-tree-trigger aria-label="' + (opts.label || "层级选择") + '" aria-controls="' + id + '" aria-haspopup="tree" aria-expanded="' + open + '"' + (state === "readonly" ? ' aria-readonly="true"' : "") + (state === "disabled" ? " disabled" : "") + '><span data-tree-selection>' + selection + "</span>" + (state === "readonly" ? "" : icon("expand_more", "source-tree-arrow")) + "</button>" + clear + '<div class="source-tree-panel" id="' + id + '" data-tree-panel aria-hidden="' + (!open) + '"' + (open ? "" : " hidden") + ">" + panel + "</div></div>";
  }

  function transferSpec(options) {
    var opts = options || {};
    var items = (opts.items || ["选项1", "选项2", "选项3", "选项4", "选项5", "选项6", "选项7"]).map(function (item) {
      return typeof item === "string" ? { label: item } : item;
    });
    var selected = opts.selected || ["选项1", "选项2"];
    var customRow = Boolean(opts.customRow);
    var draggable = Boolean(opts.draggable);
    function richTransferContent(item, index, className, includeExtra) {
      var label = item.label;
      var richMain = '<span class="transfer-rich-main"><span class="transfer-choice-title">' + label + '</span><span class="transfer-inline-meta">辅助信息</span>' + tagSpec({ text: "标签", color: "blue", size: "small" }) + "</span>";
      return '<span class="' + className + ' is-rich">' +
        avatarSpec({ text: String.fromCharCode(65 + (index % 26)), size: 28, label: label, as: "span" }) +
        '<span class="transfer-rich-copy">' + richMain + '<small>辅助信息文字</small></span>' +
        (includeExtra ? '<span class="transfer-row-extra" aria-label="自定义区域"></span>' : "") +
      "</span>";
    }
    var leftRows = items.map(function (item, index) {
      if (item.type === "group") {
        return '<div class="transfer-group-title" role="heading">' + item.label + "</div>";
      }
      var label = item.label;
      var content = customRow
        ? richTransferContent(item, index, "transfer-choice-copy", true)
        : '<span class="transfer-choice-copy"><span class="transfer-choice-title">' + label + "</span></span>";
      var isTree = item.level != null;
      var treeLevel = Math.max(0, Math.min(3, Number(item.level) || 0));
      var leading = isTree
        ? '<span class="transfer-tree-toggle' + (item.branch ? "" : " is-placeholder") + '" aria-hidden="true">' + (item.branch ? icon(item.expanded ? "arrow_drop_down" : "arrow_right") : "") + "</span>"
        : "";
      return checkboxOption(content, item.partial ? "partial" : (selected.indexOf(label) >= 0 ? "checked" : "unchecked"), {
        alignTop: customRow,
        dynamic: true,
        leading: leading,
        className: "transfer-choice" + (isTree ? " is-tree is-level-" + treeLevel : "") + (index === 0 && opts.hover ? " is-hover" : ""),
        dataAttrs: 'data-transfer-choice value="' + label + '" aria-label="选择 ' + label + '" data-component-reference="C-11"'
      });
    }).join("");
    var rightRows = selected.map(function (item, index) {
      var selectedItemIndex = items.findIndex(function (candidate) { return candidate.type !== "group" && candidate.label === item; });
      var isRichSelected = customRow && selectedItemIndex >= 0;
      var selectedContent = isRichSelected
        ? richTransferContent(items[selectedItemIndex], selectedItemIndex, "transfer-selected-copy", false)
        : "<span>" + item + "</span>";
      return '<div class="transfer-selected' + (draggable ? " is-draggable" : "") + (isRichSelected ? " is-rich" : "") + (index === 0 && opts.targetHover ? " is-hover" : "") + '"' + (draggable ? ' draggable="true"' : "") + ' data-transfer-selected data-value="' + item + '">' +
        (draggable ? button("", "is-icon is-text is-neutral transfer-drag", 'type="button" aria-label="拖拽 ' + item + '" data-component-reference="C-04"', "drag_indicator") : "") +
        selectedContent +
        button("", "is-icon is-text is-neutral", 'type="button" data-transfer-remove aria-label="移除 ' + item + '" data-component-reference="C-04"', "close") +
      "</div>";
    }).join("");
    var selectableItems = items.filter(function (item) { return item.type !== "group"; });
    var allState = selected.length === 0 ? "unchecked" : (selected.length === selectableItems.length ? "checked" : "partial");
    var allChoice = checkboxOption('所有选项 (<b data-transfer-selected-count>' + selected.length + '</b>/<span data-transfer-total-count>' + selectableItems.length + "</span>)", allState, {
      dynamic: true,
      dataAttrs: 'data-transfer-all data-component-reference="C-11" aria-label="选择所有选项"'
    });
    return '<div class="source-transfer' +
      (opts.compact ? " is-compact" : "") +
      (opts.customHeader ? " has-source-custom" : "") +
      (opts.targetHeader ? " has-target-custom" : "") +
      '" data-transfer data-transfer-draggable="' + draggable + '" data-transfer-rich="' + customRow + '">' +
      '<section class="transfer-source">' +
        inputSpec({ prefix: "search", clear: true, placeholder: "搜索", className: "transfer-search", attrs: ' data-transfer-search aria-label="搜索选项"', labelAttrs: 'data-component-reference="C-21"' }) +
        (opts.customHeader ? '<div class="transfer-custom-header' + (opts.customHeaderAlign === "start" ? " is-start" : "") + '">' + opts.customHeader + "</div>" : "") +
        "<header>" + allChoice + "</header>" +
        '<div class="transfer-scroll" data-transfer-source-list>' + leftRows + "</div>" +
      "</section>" +
      '<section class="transfer-target">' +
        (opts.targetHeader ? '<div class="transfer-custom-header' + (opts.targetHeaderAlign === "start" ? " is-start" : "") + '">' + opts.targetHeader + "</div>" : "") +
        '<header><strong>已选 (<b data-transfer-target-count>' + selected.length + "</b>)</strong>" +
          button("清空", "is-text transfer-clear", 'type="button" data-transfer-clear data-component-reference="C-03"') +
        "</header>" +
        '<div class="transfer-scroll" data-transfer-target-list>' + rightRows + "</div>" +
      "</section></div>";
  }

  function timePickerSpec(options) {
    var opts = options || {};
    var value = Object.prototype.hasOwnProperty.call(opts, "value") ? String(opts.value) : "00:00";
    var separate = opts.separate !== false;
    var seconds = Boolean(opts.seconds);
    var twelve = Boolean(opts.twelve);
    var open = opts.open !== false;
    var state = opts.state || "default";
    var disabled = state === "disabled" ? " disabled" : "";
    var panelId = "time-picker-panel-" + (++timePickerSequence);
    var columns = [];
    var parts = value.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
    var hour24 = parts ? Number(parts[1]) : 0;
    var minute = parts ? parts[2] : "00";
    var second = parts && parts[3] ? parts[3] : "00";
    var displayValue = value;
    function range(count) {
      return Array.from({ length: count }, function (_, index) { return String(index).padStart(2, "0"); });
    }
    function combinedValues(useTwelve) {
      var result = [];
      for (var hour = 0; hour < 24; hour += 1) {
        for (var minuteValue = 0; minuteValue < 60; minuteValue += 15) {
          var hourLabel = String(hour).padStart(2, "0");
          var minuteLabel = String(minuteValue).padStart(2, "0");
          if (useTwelve) result.push(String(hour % 12 || 12).padStart(2, "0") + ":" + minuteLabel + (hour < 12 ? " AM" : " PM"));
          else result.push(hourLabel + ":" + minuteLabel);
        }
      }
      return result;
    }
    function timeColumn(label, values, selected, showCheck) {
      var optionsMarkup = values.map(function (item) {
        var numericHour = label === "时间" ? Number(item.slice(0, 2)) : Number(item);
        var unavailable = opts.disabledBefore && (label === "小时" || label === "时间") && numericHour < opts.disabledBefore;
        var selectedClass = item === selected ? " class=\"is-selected\" aria-selected=\"true\" tabindex=\"0\"" : ' aria-selected="false" tabindex="-1"';
        var check = showCheck && item === selected ? icon("check", "time-option-check") : "";
        return '<button type="button" role="option" data-time-value="' + item + '"' + selectedClass + (unavailable ? " disabled" : "") + '><span>' + item + "</span>" + check + "</button>";
      }).join("");
      return '<div class="time-column" data-time-column="' + label + '">' +
        '<div class="time-column-scroll" role="listbox" aria-label="' + label + '" data-time-scroll>' + optionsMarkup + "</div>" +
        '<span class="time-overlay-scrollbar" aria-hidden="true"><span class="time-overlay-scrollbar-thumb"></span></span>' +
      "</div>";
    }
    if (twelve && parts) displayValue = String(hour24 % 12 || 12).padStart(2, "0") + ":" + minute + (seconds ? ":" + second : "") + (hour24 < 12 ? " am" : " pm");
    if (separate) {
      if (twelve) columns.push(timeColumn("上下午", ["AM", "PM"], parts ? (hour24 < 12 ? "AM" : "PM") : ""));
      columns.push(timeColumn("小时", twelve ? ["12"].concat(range(11).map(function (_, index) { return String(index + 1).padStart(2, "0"); })) : range(24), parts ? (twelve ? String(hour24 % 12 || 12).padStart(2, "0") : String(hour24).padStart(2, "0")) : ""));
      columns.push(timeColumn("分钟", range(60), parts ? minute : ""));
      if (seconds) columns.push(timeColumn("秒", range(60), parts ? second : ""));
    } else {
      var selectedCombined = twelve && parts ? String(hour24 % 12 || 12).padStart(2, "0") + ":" + minute + (hour24 < 12 ? " AM" : " PM") : value;
      columns.push(timeColumn("时间", combinedValues(twelve), selectedCombined, true));
    }
    return '<div class="source-time-picker is-' + state + (open ? " is-open" : "") + (opts.size ? " is-" + opts.size : "") + '" data-time-picker data-mode="' + (separate ? "separate" : "combined") + '" data-twelve="' + twelve + '" data-seconds="' + seconds + '" data-footer="' + Boolean(opts.footer) + '" data-confirmed-value="' + displayValue + '">' +
      '<label class="time-trigger" data-time-trigger role="combobox" aria-haspopup="dialog" aria-controls="' + panelId + '" aria-expanded="' + open + '"><input value="' + displayValue + '" placeholder="Select time" aria-label="' + (opts.label || "时间") + '"' + disabled + ' autocomplete="off" inputmode="numeric"><button type="button" data-time-clear aria-label="清除时间"' + (opts.clearable === false ? " hidden" : "") + '>' + icon("cancel") + '</button>' + (opts.noIcon ? "" : icon("schedule", "time-trigger-icon")) + "</label>" +
      '<div class="source-time-panel" id="' + panelId + '" role="dialog" aria-label="选择时间" aria-hidden="' + (!open) + '"' + (open ? "" : " hidden") + ">" + columns.join("") + (opts.footer ? '<footer><button type="button" data-time-now>Current Time</button><span></span><button type="button" data-time-cancel>Cancel</button><button class="b2b-button is-primary" type="button" data-time-done' + (value ? "" : " disabled") + ">Done</button></footer>" : "") + "</div>" +
      (state === "error" ? '<small class="time-error">Error</small>' : "") + "</div>";
  }

  function sourceTimePicker(options) {
    var opts = options || {};
    var variant = opts.variant || "time";
    if (variant === "with-date") {
      var showFooter = Boolean(opts.footer);
      return '<div class="time-calendar-combo" data-time-with-date>' + datePickerSpec({
        withTime: true,
        timeSeconds: Boolean(opts.seconds),
        currentTime: showFooter,
        cancelLabel: "Cancel",
        confirmLabel: "Done",
        triggerIcon: "calendar_today",
        displayTimeOnly: true,
        placeholder: "Select date and time",
        value: opts.value || "2026-07-13 14:30",
        year: Number(String(opts.value || "2026-07-13").slice(0, 4)) || 2026,
        month: Number(String(opts.value || "2026-07-13").slice(5, 7)) || 7,
        timeUnitLabels: { hour: "hr", minute: "min", second: "sec" },
        showTimeChecks: true,
        open: opts.open !== false,
        error: opts.state === "error",
        disabled: opts.state === "disabled",
        clearable: opts.clearable,
        showFooter: showFooter,
        showActions: showFooter,
        label: opts.label
      }) + "</div>";
    }
    if (variant === "range") {
      var values = String(opts.value || "09:00 - 18:00").split(/\s*-\s*/);
      var initialRangeOpen = opts.open !== false;
      var shared = {
        separate: true,
        seconds: Boolean(opts.seconds),
        footer: false,
        state: opts.state,
        size: opts.size,
        clearable: opts.clearable,
        disabledBefore: opts.disabledBefore,
        label: opts.label
      };
      return '<div class="time-range-demo" data-time-range aria-label="' + (opts.label || "时间范围") + '">' + timePickerSpec(Object.assign({}, shared, { value: values[0] || "09:00", open: initialRangeOpen, label: (opts.label || "时间范围") + "开始" })) + '<span class="time-range-separator" aria-hidden="true">—</span>' + timePickerSpec(Object.assign({}, shared, { value: values[1] || "18:00", open: false, label: (opts.label || "时间范围") + "结束" })) + "</div>";
    }
    return timePickerSpec({
      separate: true,
      twelve: variant === "12-hour",
      value: opts.value,
      seconds: Boolean(opts.seconds),
      footer: false,
      open: opts.open,
      state: opts.state,
      size: opts.size,
      clearable: opts.clearable,
      disabledBefore: opts.disabledBefore,
      label: opts.label
    });
  }

  var uploadFileSheetPath = "M238.08 0c-70.4 0-128 57.6-128 128v768c0 70.4 57.6 128 128 128h547.84c70.4 0 128-57.6 128-128V227.84L686.08 0H238.08z";
  var uploadFileFoldPath = "M686.08 0v227.84h227.84z";
  var uploadFileTypeMarks = {
    default: '<path class="upload-file-mark" d="M736 515.84h-448c-5.12 0-10.24-5.12-10.24-10.24v-62.72c0-5.12 5.12-10.24 10.24-10.24h449.28c5.12 0 10.24 5.12 10.24 10.24v62.72c-1.28 6.4-5.12 10.24-11.52 10.24zM736 710.4h-448c-5.12 0-10.24-5.12-10.24-10.24v-62.72c0-5.12 5.12-10.24 10.24-10.24h449.28c5.12 0 10.24 5.12 10.24 10.24v62.72c-1.28 5.12-5.12 10.24-11.52 10.24z"/>',
    multimedia: '<path class="upload-file-mark" d="M428.8 546.56h-140.8c-5.12 0-10.24 5.12-10.24 10.24v61.44c0 5.12 5.12 10.24 10.24 10.24h142.08c5.12 0 10.24-5.12 10.24-10.24v-61.44c-1.28-5.12-5.12-10.24-11.52-10.24zM738.56 384H288c-5.12 0-10.24 5.12-10.24 10.24v61.44c0 5.12 5.12 10.24 10.24 10.24h451.84c5.12 0 10.24-5.12 10.24-10.24v-61.44c-1.28-6.4-5.12-10.24-11.52-10.24zM288 792.32h87.04c5.12 0 10.24-5.12 10.24-10.24v-61.44c0-5.12-5.12-10.24-10.24-10.24h-87.04c-5.12 0-10.24 5.12-10.24 10.24v61.44c0 6.4 3.84 10.24 10.24 10.24zM651.52 546.56c-75.52 0-136.96 61.44-136.96 136.96S576 820.48 651.52 820.48c75.52 0 136.96-61.44 136.96-136.96s-61.44-136.96-136.96-136.96zm-26.88 199.68v-122.88l81.92 61.44-81.92 61.44z"/>',
    music: '<path class="upload-file-mark" d="M510.72 350.72v288c-25.6-15.36-58.88-21.76-92.16-10.24-43.52 12.8-75.52 51.2-81.92 96-10.24 74.24 49.92 136.96 122.88 131.84 62.72-3.84 110.08-58.88 110.08-121.6V467.2c0-11.52 8.96-20.48 20.48-20.48H665.6c11.52 0 20.48-8.96 20.48-20.48v-75.52c0-11.52-8.96-20.48-20.48-20.48H531.2c-11.52-1.28-20.48 8.96-20.48 20.48z"/>',
    img: '<path class="upload-file-mark" d="M634.88 501.76 491.52 684.8 390.4 561.92 247.04 746.24h570.88z"/><path class="upload-file-mark" d="M366.08 385.28m-72.96 0a72.96 72.96 0 1 0 145.92 0 72.96 72.96 0 1 0-145.92 0Z"/>',
    text: '<path class="upload-file-mark" d="M655.36 464.64H549.12v327.68h-74.24V464.64H368.64v-65.28h286.72v65.28z"/>',
    ppt: '<path class="upload-file-mark" d="M359.68 337.92h147.2c33.28 0 61.44 2.56 84.48 8.96 23.04 5.12 40.96 15.36 55.04 26.88 14.08 12.8 23.04 28.16 29.44 47.36 5.12 19.2 8.96 42.24 8.96 69.12 0 29.44-3.84 53.76-10.24 74.24-6.4 20.48-16.64 35.84-32 48.64-14.08 12.8-33.28 21.76-55.04 26.88-21.76 5.12-48.64 7.68-80.64 7.68h-60.16v149.76h-87.04V337.92zm136.96 240.64c19.2 0 34.56-1.28 47.36-3.84 12.8-2.56 23.04-7.68 30.72-14.08 7.68-6.4 12.8-15.36 16.64-26.88 3.84-11.52 5.12-25.6 5.12-42.24 0-32-7.68-53.76-21.76-65.28-14.08-12.8-39.68-19.2-76.8-19.2H448v170.24h48.64z"/>',
    video: '<path class="upload-file-mark" d="M665.6 540.16v-78.08c0-23.04-19.2-40.96-40.96-40.96H334.08c-23.04 0-40.96 19.2-40.96 40.96v236.8c0 23.04 19.2 40.96 40.96 40.96h290.56c23.04 0 40.96-19.2 40.96-40.96v-78.08l106.24 106.24V433.92L665.6 540.16zM541.44 588.8l-81.92 47.36c-6.4 3.84-15.36-1.28-15.36-8.96v-93.44c0-7.68 8.96-12.8 15.36-8.96l81.92 47.36c7.68 2.56 7.68 12.8 0 16.64z"/>',
    pdf: '<path class="upload-file-mark" d="M787.2 631.04c-17.92-20.48-53.76-29.44-104.96-29.44-28.16 0-57.6 2.56-84.48 7.68-17.92-16.64-34.56-37.12-49.92-57.6-10.24-15.36-21.76-30.72-30.72-47.36 15.36-43.52 24.32-89.6 28.16-135.68 0-42.24-16.64-87.04-64-87.04-15.36 0-30.72 8.96-38.4 23.04-20.48 34.56-12.8 103.68 20.48 176.64-10.24 32-23.04 65.28-37.12 101.12-12.8 30.72-26.88 60.16-43.52 88.32-47.36 17.92-148.48 65.28-157.44 116.48-2.56 15.36 1.28 30.72 14.08 39.68 10.24 8.96 26.88 15.36 42.24 14.08 60.16 0 120.32-83.2 162.56-156.16 23.04-7.68 46.08-15.36 71.68-21.76 26.88-6.4 51.2-12.8 74.24-16.64 65.28 55.04 121.6 65.28 149.76 65.28 38.4 0 53.76-16.64 58.88-30.72 3.84-19.2 1.28-37.12-11.52-49.92zm-40.96 29.44c-1.28 10.24-14.08 17.92-29.44 17.92-5.12 0-8.96 0-14.08-1.28-30.72-7.68-60.16-23.04-84.48-43.52 20.48-2.56 42.24-5.12 61.44-5.12 14.08 0 28.16 1.28 42.24 2.56 12.8 5.12 28.16 11.52 24.32 29.44zM469.76 318.72c2.56-5.12 7.68-7.68 14.08-8.96 15.36 0 17.92 16.64 17.92 32-1.28 35.84-7.68 69.12-17.92 103.68-26.88-66.56-24.32-111.36-14.08-126.72zm85.76 296.96c-16.64 2.56-34.56 7.68-51.2 12.8-12.8 2.56-24.32 7.68-38.4 10.24 6.4-14.08 12.8-28.16 17.92-39.68 7.68-16.64 14.08-34.56 20.48-51.2 6.4 8.96 10.24 16.64 16.64 24.32 11.52 16.64 24.32 29.44 34.56 43.52zm-186.88 89.6c-38.4 61.44-76.8 102.4-98.56 102.4-2.56 0-7.68-1.28-8.96-2.56-5.12-2.56-6.4-8.96-5.12-14.08 2.56-23.04 47.36-56.32 112.64-85.76z"/>',
    link: '<path class="upload-file-mark" d="M339.2 728.32c-29.44-35.84-24.32-90.88 8.96-124.16l71.68-71.68c3.84-3.84 3.84-11.52 0-15.36L396.8 494.08c-3.84-3.84-11.52-3.84-15.36 0l-70.4 70.4c-52.48 52.48-61.44 136.96-16.64 194.56 55.04 70.4 157.44 75.52 217.6 14.08l74.24-74.24c3.84-3.84 3.84-11.52 0-15.36L563.2 660.48c-3.84-3.84-11.52-3.84-15.36 0L473.6 734.72c-38.4 38.4-99.84 35.84-134.4-6.4zm119.04-64 148.48-148.48c3.84-3.84 3.84-11.52 0-15.36l-25.6-25.6c-3.84-3.84-11.52-3.84-15.36 0L416 622.08c-3.84 3.84-3.84 11.52 0 15.36l25.6 25.6c5.12 5.12 11.52 5.12 16.64 1.28zm49.92-296.96-64 64c-10.24 10.24-10.24 17.92-6.4 21.76l23.04 23.04c3.84 3.84 11.52 3.84 15.36 0l71.68-71.68c33.28-33.28 87.04-38.4 124.16-8.96 42.24 34.56 43.52 96 6.4 133.12l-74.24 74.24c-3.84 3.84-3.84 11.52 0 15.36l23.04 23.04c3.84 3.84 11.52 3.84 15.36 0l74.24-74.24c61.44-61.44 56.32-163.84-14.08-217.6-58.88-43.52-142.08-34.56-194.56 17.92z"/>',
    excel: '<path class="upload-file-mark" d="m459.52 591.36-115.2-193.28h87.04L512 546.56h3.84l85.76-147.2h84.48L567.04 588.8l122.88 202.24H601.6l-87.04-154.88h-3.84l-92.16 154.88h-84.48l125.44-199.68z"/>',
    word: '<path class="upload-file-mark" d="M261.12 399.36h76.8L400.64 704h3.84l66.56-263.68h85.76l64 263.68h3.84l62.72-304.64h76.8l-90.88 391.68h-93.44L512 528.64h-3.84l-69.12 262.4h-92.16l-85.76-391.68z"/>',
    zip: '<path class="upload-file-mark" d="M515.84 281.6h133.12v62.72H515.84zM375.04 343.04h140.8v62.72h-140.8zM375.04 468.48h140.8v62.72h-140.8zM515.84 405.76h133.12v62.72H515.84zM515.84 529.92h133.12v62.72H515.84zM515.84 655.36v-62.72h-140.8v232.96c0 23.04 19.2 40.96 40.96 40.96h190.72c23.04 0 40.96-19.2 40.96-40.96V655.36H515.84zm89.6 129.28c0 11.52-8.96 20.48-20.48 20.48H439.04c-11.52 0-20.48-8.96-20.48-20.48v-20.48c0-11.52 8.96-20.48 20.48-20.48h145.92c11.52 0 20.48 8.96 20.48 20.48v20.48z"/>',
    visio: '<path class="upload-file-mark" d="M330.24 399.36h80.64l99.84 313.6h3.84l102.4-313.6h76.8L556.8 791.04h-92.16L330.24 399.36z"/>',
    code: '<path class="upload-file-mark" d="m428.8 719.36-120.32-120.32c-3.84-3.84-3.84-10.24 0-14.08L428.8 464.64c3.84-3.84 3.84-10.24 0-14.08l-26.88-26.88c-3.84-3.84-10.24-3.84-14.08 0L226.56 584.96c-3.84 3.84-3.84 10.24 0 14.08l161.28 161.28c3.84 3.84 10.24 3.84 14.08 0l26.88-26.88c3.84-3.84 3.84-10.24 0-14.08zm166.4 0 120.32-120.32c3.84-3.84 3.84-10.24 0-14.08L595.2 464.64c-3.84-3.84-3.84-10.24 0-14.08l26.88-26.88c3.84-3.84 10.24-3.84 14.08 0l161.28 161.28c3.84 3.84 3.84 10.24 0 14.08L636.16 760.32c-3.84 3.84-10.24 3.84-14.08 0l-26.88-26.88c-3.84-3.84-3.84-10.24 0-14.08zM458.24 846.08h-2.56c-7.68-1.28-12.8-8.96-11.52-16.64l97.28-472.32c1.28-7.68 8.96-12.8 16.64-11.52 7.68 1.28 12.8 8.96 11.52 16.64l-97.28 472.32c-1.28 7.68-7.68 11.52-14.08 11.52z"/>'
  };

  function fileTypeFromName(name) {
    var extension = String(name || "").trim().toLowerCase().match(/\.([a-z0-9]+)$/);
    var value = extension ? extension[1] : "";
    if (value === "doc" || value === "docx") return "word";
    if (value === "xls" || value === "xlsx" || value === "csv") return "excel";
    if (value === "ppt" || value === "pptx") return "ppt";
    if (value === "zip" || value === "rar" || value === "7z") return "zip";
    if (value === "png" || value === "jpg" || value === "jpeg" || value === "gif" || value === "webp" || value === "svg") return "img";
    if (value === "mp4" || value === "mov" || value === "avi" || value === "mkv" || value === "webm") return "video";
    if (value === "mp3" || value === "wav" || value === "aac" || value === "flac" || value === "ogg" || value === "m4a") return "music";
    if (value === "txt" || value === "md" || value === "rtf") return "text";
    if (value === "url" || value === "webloc" || value === "link") return "link";
    if (value === "vsd" || value === "vsdx") return "visio";
    if (["html", "css", "js", "jsx", "ts", "tsx", "json", "xml", "vue", "java", "py", "go", "c", "cpp", "h", "hpp", "cs", "swift", "kt", "sh"].indexOf(value) >= 0) return "code";
    if (value === "pdf") return "pdf";
    return "default";
  }

  function fileTypeIcon(typeOrName) {
    var aliases = { doc: "word", xls: "excel", image: "img", file: "default" };
    var normalized = aliases[typeOrName] || typeOrName;
    var knownTypes = ["default", "multimedia", "music", "img", "folder", "text", "ppt", "video", "pdf", "link", "excel", "word", "zip", "visio", "code"];
    var type = knownTypes.indexOf(normalized) >= 0 ? normalized : fileTypeFromName(typeOrName);
    var graphic = '<img class="upload-file-svg" src="' + uploadAssetBase + type + '.svg" alt="" aria-hidden="true" decoding="async">';
    return '<span class="upload-file-icon is-' + type + '" data-file-type="' + type + '" aria-hidden="true">' + graphic + "</span>";
  }

  function uploadDropIcon() {
    return '<span class="upload-drop-icon" aria-hidden="true"><svg viewBox="0 0 1024 1024" focusable="false"><path class="upload-file-sheet" d="' + uploadFileSheetPath + '"/><path class="upload-file-fold" d="' + uploadFileFoldPath + '" opacity=".16"/><path class="upload-file-mark" d="M464 300h96v424h-96zM300 464h424v96H300z"/></svg></span>';
  }

  function uploadFileSpec(options) {
    var opts = options || {};
    var state = opts.state || "complete";
    var preview = Boolean(opts.preview);
    var progress = Math.max(0, Math.min(100, Number(opts.progress == null ? 64 : opts.progress)));
    var name = opts.name || "Attachment name";
    var fileType = opts.type || fileTypeFromName(name);
    var status = state === "error" ? (opts.message || "Error message") : state === "uploading" ? (opts.loaded || "6.4 MB / 9.5 MB") : "9.5 MB";
    var actions = state === "uploading"
      ? '<button type="button" data-upload-cancel aria-label="取消上传">' + icon("close") + "</button>"
      : state === "error"
        ? '<span class="upload-file-danger-indicator" aria-hidden="true">' + icon("error") + '</span><button type="button" data-upload-retry aria-label="重试上传">' + icon("refresh") + '</button><button type="button" data-upload-delete aria-label="删除文件">' + icon("delete") + "</button>"
        : '<button type="button" data-upload-preview aria-label="预览文件">' + icon("visibility") + '</button><button type="button" data-upload-download aria-label="下载文件">' + icon("download") + '</button><button type="button" data-upload-delete aria-label="删除文件">' + icon("delete") + "</button>";
    if (state === "reading") {
      return '<article class="source-upload-reading" data-upload-file data-upload-reading aria-live="polite">' +
        '<header><strong>File reading</strong><button type="button" data-upload-cancel aria-label="取消读取">' + icon("close") + '</button></header>' +
        fileTypeIcon(fileType) + "<strong>" + name + "</strong>" +
        '<span class="upload-reading-progress" role="progressbar" aria-label="文件读取进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress + '"><i style="width:' + progress + '%"></i></span>' +
      "</article>";
    }
    return '<article class="source-upload-file is-' + state + (opts.small ? " is-small" : "") + (preview ? " has-preview" : "") + '" data-upload-file' + (opts.initial ? ' data-upload-initial-file' : '') + ' tabindex="0" aria-label="' + name + '">' +
      fileTypeIcon(preview ? "img" : fileType) + '<span class="upload-file-copy"><strong>' + name + '</strong><small>' + status + '</small>' + (state === "uploading" ? '<i class="upload-file-progress" role="progressbar" aria-label="上传进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress + '"><b style="width:' + progress + '%"></b></i>' : "") + '</span><span class="upload-file-actions">' + actions + "</span></article>";
  }

  function uploadDropSpec(options) {
    var opts = options || {};
    var state = opts.state || "default";
    var disabled = Boolean(opts.disabled || state === "disabled");
    return '<div class="source-upload-drop is-' + state + '" data-upload-drop' + (opts.interactive && !disabled ? " data-upload-start" : "") + ' tabindex="' + (disabled ? "-1" : "0") + '" role="button" aria-disabled="' + String(disabled) + '" aria-label="拖拽或选择文件上传">' +
      uploadDropIcon() + '<strong>Drag the file here or <span class="upload-drop-action">Click to upload</span></strong><small>Only pictures can be uploaded, support format: JPG, PNG, JPEG</small>' + (state === "error" ? '<em>Error message</em>' : "") +
    "</div>";
  }

  function uploadChoice(options) {
    var opts = options || {};
    var disabled = Boolean(opts.disabled);
    var attributes = 'type="button"' + (opts.interactive && !disabled ? " data-upload-start" : "") + (disabled ? " disabled" : "");
    return '<div class="upload-choice">' +
      button(opts.label || "Upload Files", "", attributes, "upload") +
      (opts.error ? "<em>Error message</em>" : "") +
      "<small>" + (opts.description || "Only supports: JPG, PNG, PDF, the max file size is 10MB") + "</small>" +
    "</div>";
  }

  function uploadPictureTrigger(options) {
    var opts = options || {};
    var current = opts.state || "default";
    var disabled = Boolean(opts.disabled);
    return '<div class="upload-picture-field is-' + current + (opts.compact ? " is-compact" : "") + '">' +
      '<button class="upload-picture" type="button"' + (opts.interactive && !disabled ? " data-upload-start" : "") + (disabled ? ' disabled aria-disabled="true"' : "") + ' aria-label="' + (opts.label || "选择图片") + '">' + icon("add") + "</button>" +
      (opts.compact ? "" : "<small>" + (opts.description || "The max file size is 10MB") + "</small>") +
      (current === "error" ? "<em>Error message</em>" : "") +
    "</div>";
  }

  function uploadPictureTile(options) {
    var opts = options || {};
    var current = opts.state || "complete";
    var status = current === "uploading"
      ? '<span class="upload-picture-progress"><i style="width:' + Math.max(0, Math.min(100, Number(opts.progress == null ? 64 : opts.progress))) + '%"></i></span>'
      : current === "error"
        ? '<button class="upload-picture-retry" type="button" data-upload-picture-retry aria-label="重试上传">' + icon("refresh") + "</button>"
        : "";
    return '<article class="upload-picture-tile is-' + current + '"' + (opts.initial ? ' data-upload-initial-file' : '') + ' aria-label="' + (opts.label || opts.name || "上传图片") + '">' +
      '<span class="upload-picture-image" aria-hidden="true"></span>' + status +
      '<button class="upload-picture-remove" type="button" data-upload-picture-remove aria-label="删除图片">' + icon("close") + "</button>" +
    "</article>";
  }

  function uploadInput(options) {
    var opts = options || {};
    var accept = opts.accept ? ' accept="' + opts.accept + '"' : "";
    return '<input class="upload-file-input" data-upload-input type="file" multiple tabindex="-1" aria-hidden="true"' + accept + '>';
  }

  function sourceUpload(options) {
    var opts = options || {};
    var variant = opts.variant || "drag";
    var state = opts.state || "default";
    var disabled = state === "disabled";
    var fileState = state === "success" ? "complete" : state;
    var status = '<span class="upload-demo-status" data-upload-status role="status" aria-live="polite"></span>';
    var list = '<div class="upload-demo-list" data-upload-list></div>';
    var file = uploadFileSpec({ state: fileState, name: opts.name, type: opts.fileType, loaded: opts.loaded, progress: opts.progress, small: opts.size === "compact", preview: variant === "picture-card", initial: true });
    if (variant === "file-list") return '<div class="upload-demo upload-file-stack" data-upload-demo>' + file + status + "</div>";
    if (variant === "picture-card") {
      var wallContent = state === "uploading" || state === "success" || state === "error"
        ? uploadPictureTile({ state: fileState, progress: opts.progress, name: opts.name, label: opts.label, initial: true })
        : "";
      var trigger = uploadPictureTrigger({ state: state === "success" || state === "uploading" ? "default" : state, interactive: opts.interactive && !disabled, disabled: disabled, compact: opts.size === "compact", label: opts.label, description: opts.description });
      return '<div class="upload-demo" data-upload-demo><div class="upload-wall"><div class="upload-demo-list upload-wall-list" data-upload-list>' + wallContent + "</div>" + trigger + "</div>" + (opts.interactive && !disabled ? uploadInput({ accept: "image/*" }) : "") + status + "</div>";
    }
    var triggerMarkup = variant === "button"
      ? uploadChoice({ interactive: opts.interactive && !disabled, disabled: disabled, error: state === "error", label: opts.label, description: opts.description })
      : uploadDropSpec({ interactive: opts.interactive && !disabled, disabled: disabled, state: state });
    var controlledFile = state === "uploading" || state === "success" ? '<div class="upload-file-stack" data-upload-initial-list>' + file + "</div>" : "";
    return '<div class="upload-demo" data-upload-demo>' + triggerMarkup + controlledFile + list + (opts.interactive && !disabled ? uploadInput({}) : "") + status + "</div>";
  }

  function avatarSpec(options) {
    var opts = options || {};
    var size = opts.size || 32;
    var content = opts.image
      ? '<img src="' + opts.image + '" alt="" data-avatar-image><span data-avatar-fallback hidden>' + (opts.text || "?") + "</span>"
      : opts.icon ? icon(opts.icon) : (opts.text || "七七");
    var multiline = !opts.icon && String(opts.text || "").indexOf("\n") >= 0;
    var color = opts.color ? ";--avatar-color:" + opts.color : "";
    var tag = opts.as === "span" ? "span" : "button";
    var attrs = tag === "button" ? ' type="button"' : ' role="img"';
      return '<' + tag + ' class="source-avatar is-' + (opts.shape || "round") + (opts.loading ? " is-loading" : "") + (multiline ? " is-multiline" : "") + (opts.className ? " " + opts.className : "") + '" style="--avatar-size:' + size + 'px' + color + '"' + attrs + (opts.attrs ? " " + opts.attrs : "") + ' data-component-reference="C-32" aria-label="' + (opts.label || "林七七") + '">' + content + (opts.badge ? '<i class="avatar-collab-badge">' + opts.badge + "</i>" : "") + (opts.count ? '<i class="avatar-count-badge">' + opts.count + "</i>" : "") + "</" + tag + ">";
  }

  function sourceAvatar(options) {
    var opts = options || {};
    var variant = opts.variant || "text";
    var fallback = opts.fallback || opts.text || "?";
    function safeText(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    function memberData(item) {
      return typeof item === "string" ? { text: item } : item || {};
    }
    function memberLabel(member, index) {
      return member.label || member.text || member.fallback || "成员 " + (index + 1);
    }
    function overflowMember(member, index) {
      var label = memberLabel(member, index);
      return '<span class="avatar-overflow-item" role="listitem">' + avatarSpec({
        text: member.text || member.fallback || "?",
        icon: member.icon,
        image: member.image,
        size: 20,
        label: label,
        as: "span",
        attrs: ' title="' + safeText(label) + '"'
      }) + '<span class="avatar-overflow-label">' + safeText(label) + "</span></span>";
    }
    function memberTooltip(member, index) {
      var label = memberLabel(member, index);
      return tooltipSpec({
        position: "top",
        trigger: avatarSpec({
          text: member.text || member.fallback || "?",
          icon: member.icon,
          image: member.image,
          size: opts.size,
          label: label
        }),
        text: label
      });
    }
    var isTopBadge = variant === "with-top-badge";
    var base = {
      text: variant === "icon" || (isTopBadge && opts.icon) ? "" : fallback,
      icon: variant === "icon" || (isTopBadge && opts.icon) ? (opts.icon || "person") : "",
      image: variant === "image" || (isTopBadge && opts.image) ? opts.image : "",
      size: opts.size,
      label: opts.label,
      shape: opts.shape,
      loading: opts.loading,
      as: variant === "group" ? "span" : opts.as
    };
    if ((variant === "image" || isTopBadge) && opts.image) {
      base.attrs = 'data-avatar-fallback-text="' + fallback + '"';
    }
    if (variant === "group") {
      var items = Array.isArray(opts.items) ? opts.items : [];
      var groupSize = Number(opts.size || 32);
      var visible = items.slice(0, Number(opts.maxVisible || 5));
      var hidden = items.slice(visible.length);
      var group = visible.map(function (item, index) {
        return memberTooltip(memberData(item), index);
      }).join("");
      var overflow = hidden.length ? tooltipSpec({
        position: "top",
        trigger: '<button type="button" class="source-avatar is-round is-overflow" style="--avatar-size:' + Number(opts.size || 32) + 'px" data-avatar-overflow aria-expanded="false" aria-label="展开另外 ' + hidden.length + ' 人">+' + hidden.length + "</button>",
        text: "展开另外 " + hidden.length + " 人"
      }) + '<div class="avatar-overflow-panel" role="list" aria-label="另外 ' + hidden.length + ' 位成员" hidden>' + hidden.map(function (item, index) { return overflowMember(memberData(item), visible.length + index); }).join("") + "</div>" : "";
      return '<span class="avatar-runtime-group source-avatar-group" style="--avatar-size:' + groupSize + 'px" role="group" aria-label="' + (opts.label || "成员头像组") + '">' + group + overflow + "</span>";
    }
    var avatar = avatarSpec(base);
    if (isTopBadge) {
      var topBadge = opts.topBadge || {};
      var badgeSize = topBadge.variant === "character" ? 14 : 10;
      var hostSize = Number(opts.size || 32);
      var inset = hostSize * 0.146447 - badgeSize / 2;
      return '<span class="badge-avatar-host avatar-runtime-top-badge is-top" style="--badge-host-size:' + hostSize + 'px;--badge-anchor-inset:' + inset.toFixed(2) + 'px">' + avatar + sourceBadge({
        variant: topBadge.variant,
        color: topBadge.color,
        size: badgeSize,
        text: topBadge.text,
        icon: "",
        appearance: topBadge.appearance,
        cornerShape: "triangle",
        label: topBadge.label
      }) + "</span>";
    }
    if (variant === "with-status") return '<span class="avatar-runtime-status">' + avatar + '<i class="avatar-runtime-presence is-' + (opts.status || "online") + '" aria-label="' + (opts.status === "offline" ? "离线" : "在线") + '"></i></span>';
    if (variant === "with-text") return '<div class="avatar-identity avatar-runtime-information" style="--avatar-size:' + Number(opts.size || 32) + 'px">' + avatar + '<span>' + opts.primaryText + "</span></div>";
    if (variant === "with-secondary-text") return '<div class="avatar-identity avatar-runtime-information" style="--avatar-size:' + Number(opts.size || 32) + 'px">' + avatar + '<span><strong>' + opts.primaryText + "</strong><small>" + opts.secondaryText + "</small></span></div>";
    return avatar;
  }

  function badgeSpec(options) {
    var opts = options || {};
    var type = opts.type || "dot";
    var content = type === "icon" ? icon(opts.icon || "priority_high") : (opts.text || "");
    if (type === "character" && content === "…") content = '<span class="source-badge-ellipsis">…</span>';
    var appearance = opts.appearance ? " is-appearance-" + opts.appearance : "";
      return '<span class="source-badge is-' + type + ' is-' + (opts.color || "red") + appearance + (opts.outline ? " is-outline" : "") + '" style="--badge-size:' + (opts.size || (type === "dot" ? 8 : 14)) + 'px">' + content + "</span>";
  }

  /* Canonical C-33 leaf factory. Hosts belong to the caller/composing component. */
  function sourceBadge(options) {
    var opts = options || {};
    var variant = opts.variant || "dot";
    var semantics = opts.label ? ' role="img" aria-label="' + opts.label + '"' : "";
    if (variant === "character" && (opts.appearance === "light" || opts.appearance === "dark")) {
      return '<span class="badge-plain-number' + (opts.appearance === "dark" ? " is-inverse" : "") + '"' + semantics + '>' + (opts.text || "0") + "</span>";
    }
    if (variant === "corner") {
      return '<span class="source-corner-badge is-' + (opts.cornerShape || "triangle") + '"' + semantics + '></span>';
    }
    var markup = badgeSpec({
      type: variant,
      color: opts.color,
      size: opts.size,
      text: opts.text,
      icon: opts.icon,
      appearance: opts.appearance
    });
    return semantics ? markup.replace(">", semantics + ">") : markup;
  }

  function cardSpec(options) {
    var opts = options || {};
    var headerAction = opts.headerAction === false
      ? ""
      : (opts.headerAction || '<button type="button" aria-label="更多操作">' + icon("more_horiz") + "</button>");
    var footerAction = opts.footerAction === false
      ? ""
      : (opts.footerAction || '<button class="b2b-button is-text" type="button">View</button>');
    var appearance = opts.appearance || opts.style || "bordered";
    var rootAttrs = opts.rootAttrs ? " " + opts.rootAttrs : "";
    var classes = "source-design-card is-" + appearance
      + (opts.hoverable ? " is-hoverable" : "")
      + (opts.state ? " is-" + opts.state : "");
    var focusable = opts.focusable === false ? "" : ' tabindex="0"';
    if (opts.loadingMarkup) {
      return '<article class="' + classes + ' is-loading" data-component-reference="C-34"' + rootAttrs + focusable + '><div class="card-loading" role="status" aria-label="内容加载中" data-component-reference="C-47">' + opts.loadingMarkup + "</div></article>";
    }
    return '<article class="' + classes + '" data-component-reference="C-34"' + (opts.draggable ? ' draggable="true" data-source-card-drag' : "") + rootAttrs + focusable + '><header>' + (opts.icon ? '<span class="card-leading">' + icon(opts.icon) + "</span>" : "") + '<strong>' + (opts.title || "The title of the card") + "</strong>" + headerAction + '</header><div class="card-body">' + (opts.body || "This is the content of the card. The content area can be customized according to the business scenario.") + '</div><footer><small>' + (opts.meta || "05-20 14:25 Name") + "</small>" + footerAction + "</footer></article>";
  }

  /* Canonical C-34 shell. Production children mount into typed slots. */
  function sourceCard(options) {
    var opts = options || {};
    var variant = opts.variant || "basic";
    if (variant === "interactive") {
      return '<button class="source-card is-interactive is-hoverable is-size-' + (opts.size || "default") + (opts.selected ? " is-selected" : "") + '" type="button" data-card-interactive data-card-variant="interactive" aria-pressed="' + Boolean(opts.selected) + '"><span class="card-icon">' + icon(opts.icon || "description") + '</span><strong>' + (opts.title || "Content template") + '</strong><small>' + (opts.body || "Open template configuration") + "</small>" + icon("chevron_right", "card-trailing") + "</button>";
    }
    var loading = Boolean(opts.loading);
    var classes = "source-design-card is-" + (opts.appearance || "bordered") + " is-size-" + (opts.size || "default") + (opts.hoverable ? " is-hoverable" : "");
    var attrs = ' data-card-variant="' + variant + '" aria-busy="' + loading + '"';
    // The composed C-47 skeleton owns the single live status; this slot is structural.
    if (loading) return '<article class="' + classes + ' is-loading"' + attrs + '><div class="card-loading-slot" data-card-slot="loading"></div></article>';
    if (variant === "compact") {
      return '<article class="' + classes + ' is-compact"' + attrs + '><div class="card-compact-person"><span data-card-slot="avatar"></span><span class="card-compact-copy">' + (opts.title || "Username") + '</span></div><span data-card-slot="compact-action" data-card-action="extra"></span></article>';
    }
    if (variant === "external-grid") {
      return '<section class="source-card-layout-grid is-columns-' + (opts.columns || 3) + '"' + attrs + ' aria-label="' + (opts.title || "Card grid") + '">' + (opts.items || []).map(function (_, index) { return '<div class="card-layout-cell" data-card-child-slot="' + index + '"></div>'; }).join("") + '</section>';
    }
    if (variant === "content-grid") {
      return '<article class="' + classes + ' is-content-grid"' + attrs + '><header><strong>' + (opts.title || "Card grid") + '</strong><span data-card-slot="extra" data-card-action="extra"></span></header><div class="card-content-grid is-columns-' + (opts.columns || 4) + '">' + (opts.items || []).map(function (_, index) { return '<div class="card-grid-cell" data-card-child-slot="' + index + '"></div>'; }).join("") + '</div></article>';
    }
    if (variant === "nested") {
      return '<article class="' + classes + ' is-nested"' + attrs + '><header><strong>' + (opts.title || "Card") + '</strong><span data-card-slot="extra" data-card-action="extra"></span></header><div class="card-nested-stack">' + (opts.items || []).map(function (_, index) { return '<div data-card-child-slot="' + index + '"></div>'; }).join("") + '</div></article>';
    }
    if (variant === "tabs") {
      return '<article class="' + classes + ' is-tabs"' + attrs + '><header><strong>' + (opts.title || "Card with tabs") + '</strong><span data-card-slot="extra" data-card-action="extra"></span></header><div class="card-tabs-slot" data-card-slot="tabs"></div></article>';
    }
    if (variant === "meta" || variant === "actions") {
      return '<article class="' + classes + ' has-media is-' + variant + '"' + attrs + '><div class="card-media" data-card-media><img src="' + (opts.coverImage || "") + '" alt="' + (opts.coverAlt || "") + '"><span class="card-media-fallback" aria-hidden="true">' + icon(opts.icon || "image") + '</span></div><div class="card-meta"><strong>' + (opts.title || "Card title") + '</strong><p>' + (opts.body || "Card description") + '</p><div class="card-meta-footer"><span data-card-slot="avatar"></span><span class="card-meta-name">' + (opts.meta || "Username") + '</span><span data-card-slot="actions"></span></div></div></article>';
    }
    var cardOptions = {
      appearance: opts.appearance || "bordered",
      hoverable: Boolean(opts.hoverable),
      icon: opts.icon,
      title: opts.title,
      body: opts.body,
      meta: opts.meta,
      headerAction: '<span data-card-slot="extra" data-card-action="extra"></span>',
      footerAction: '<span data-card-slot="footer" data-card-action="footer"></span>',
      focusable: false,
      loadingMarkup: "",
      rootAttrs: 'data-card-variant="' + variant + '" data-card-size="' + (opts.size || "default") + '" aria-busy="false"'
    };
    var markup = cardSpec(cardOptions);
    markup = markup.replace('class="source-design-card ', 'class="source-design-card is-size-' + (opts.size || "default") + ' ');
    if (variant !== "cover" || loading) return markup;
    return markup
      .replace('class="source-design-card ', 'class="source-design-card has-cover ')
      .replace("<header>", '<div class="card-cover" aria-hidden="true">' + icon("auto_awesome") + "</div><header>");
  }

  function accordionSpec(options) {
    var opts = options || {};
    var expanded = opts.expanded !== false;
    var disabled = Boolean(opts.disabled);
    var linear = opts.arrow === "linear";
    var id = opts.id || "source-accordion-" + (++accordionSequence);
      return '<div class="source-accordion is-' + (opts.style || "basic") + (opts.state ? " is-" + opts.state : "") + '" data-accordion-item><button id="' + id + '-trigger" type="button" data-accordion-trigger aria-controls="' + id + '-panel" aria-expanded="' + expanded + '"' + (disabled ? ' disabled aria-disabled="true"' : "") + '>' + (linear ? "" : icon(expanded ? "arrow_drop_down" : "arrow_right")) + '<strong>' + (opts.title || "Title") + '</strong>' + (opts.loading ? icon("progress_activity", "button-spinner") : "") + (linear ? icon(expanded ? "expand_less" : "expand_more") : "") + '</button><div id="' + id + '-panel" class="source-accordion-panel" role="region" aria-labelledby="' + id + '-trigger"' + (expanded ? "" : " hidden") + '>' + (opts.body || "Here is the description content. Here is the description content. Here is the description content.") + "</div></div>";
  }

  function sourceAccordion(options) {
    var opts = options || {};
    var variant = opts.variant || "multiple";
    var items = Array.isArray(opts.items) ? opts.items : [];
    var sourceItems = items.length ? items : [{ title: opts.title || "Title", body: opts.body, expanded: opts.expanded }];
    var groupClass = variant === "bordered" ? " is-bordered" : (variant === "ghost" ? " is-ghost" : "");
    var singleAttr = variant === "single" ? " data-accordion-single" : "";
    return '<div class="accordion-runtime-group' + groupClass + '"' + singleAttr + ">" + sourceItems.map(function (item, index) {
      var data = item || {};
      return accordionSpec({ id: "source-accordion-group-" + (++accordionSequence) + "-" + index, title: data.title, body: data.body, expanded: data.expanded, disabled: data.disabled, loading: data.loading, arrow: data.arrow || opts.arrow, style: data.style || opts.style });
    }).join("") + "</div>";
  }

  function sourcePlaceholder(options) {
    var opts = options || {};
    var variant = opts.variant || "default";
    var glyph = opts.icon || (variant === "failure" ? "broken_image" : "image");
    if (variant !== "custom" && glyph !== (variant === "failure" ? "broken_image" : "image")) throw new Error("C-38 only custom placeholders accept other icons");
    return '<div class="source-placeholder is-' + variant + '" style="--placeholder-size:' + Number(opts.size || 36) + 'px" role="img" aria-label="' + (opts.label || (variant === "failure" ? "Resource unavailable" : "Resource placeholder")) + '">' + icon(glyph, "is-filled" + (glyph === "broken_image" ? " is-image-failure" : glyph === "image" ? " is-image-default" : "")) + "</div>";
  }

  function emptyStateSpec(options) {
    // Explicit C-36 variants use extracted Sketch assets. Legacy table callers keep their original path.
    if (options && options.variant) {
      var variant = options.variant;
      var surface = options.surface || "white";
      var size = options.compact ? "compact" : "standard";
      if (["no-result", "permission", "no-data", "deleted", "not-found"].indexOf(variant) < 0 || ["white", "gray"].indexOf(surface) < 0) throw new Error("C-36 unsupported Sketch variant or surface");
      if (variant === "not-found" && size === "compact") throw new Error("C-36 404 illustration is available only in standard size");
      var image = emptyAssetBase + variant + "-" + surface + "-" + size + ".png";
      return '<section class="source-empty-state is-sketch is-' + surface + (options.compact ? ' is-compact' : '') + '" data-component-reference="C-36"><div class="source-empty-illustration" aria-hidden="true"><img src="' + image + '" alt="" width="' + (options.compact ? 64 : 128) + '" height="' + (options.compact ? 64 : 128) + '"></div>' + (options.title === false || !options.title ? '' : '<strong>' + options.title + '</strong>') + '<p>' + (options.description || '暂无数据') + '</p><div class="source-empty-actions">' + (options.primary ? button(options.primary, "is-primary") : '') + (options.secondary ? button(options.secondary) : '') + '</div></section>';
    }
    var opts = options || {};
    var tone = opts.tone || "neutral";
      return '<section class="source-empty-state is-' + tone + (opts.compact ? " is-compact" : "") + (opts.page ? " is-page" : "") + '" data-component-reference="C-36"><div class="source-empty-illustration" aria-hidden="true"><span></span><i></i>' + icon(opts.icon || (tone === "negative" ? "error" : tone === "positive" ? "celebration" : "inbox")) + '</div>' + (opts.title === false ? "" : '<strong>' + (opts.title || "No content") + "</strong>") + '<p>' + (opts.description || "There is no content displayed under the current list.") + '</p><div class="source-empty-actions">' + (opts.primary ? button(opts.primary, "is-primary") : "") + (opts.secondary ? button(opts.secondary) : "") + "</div></section>";
  }

  function imagePreviewSpec(options) {
    var opts = options || {};
    var count = opts.count === false ? "" : '<small>' + (opts.current || 2) + " / " + (opts.total || 7) + "</small>";
      return '<div class="image-preview-stage source-image-preview is-' + (opts.mode || "modal") + (opts.state ? " is-" + opts.state : "") + '" tabindex="0" data-scale="1" data-rotation="0"><div class="image-placeholder">' + icon("image", "is-24") + '<span>Preview image</span></div>' + (opts.navigation === false ? "" : '<button class="image-prev" type="button" aria-label="上一张">' + icon("chevron_left") + '</button><button class="image-next" type="button" aria-label="下一张">' + icon("chevron_right") + "</button>") + '<div class="image-toolbar"><button type="button"' + (opts.disabled ? " disabled" : "") + '>' + icon("zoom_out") + '</button><span>100%</span><button type="button">' + icon("zoom_in") + '</button><button type="button" data-image-fit>' + icon("fit_screen") + '</button><button type="button">' + icon("rotate_left") + '</button><button type="button">' + icon("download") + '</button></div>' + count + (opts.mode === "modal" ? '<button class="image-preview-close" type="button" aria-label="关闭预览">' + icon("close") + "</button>" : "") + "</div>";
  }

  function popoverStatusIcon(name, state) {
    var tone = state || (name === "check_circle" ? "success" : name === "warning" ? "warning" : name === "error" ? "error" : "info");
    var glyph = tone === "success"
      ? '<path d="m4.4 8.2 2.1 2.1 5-5" />'
      : tone === "error"
        ? '<path d="m5.5 5.5 5 5m0-5-5 5" />'
        : '<path d="M8 7.1v4.2M8 4.7v.1" />';
    return '<span class="popover-status-icon is-' + tone + '" aria-hidden="true"><svg viewBox="0 0 16 16" focusable="false"><circle cx="8" cy="8" r="7"></circle>' + glyph + "</svg></span>";
  }

  function popoverSpec(options) {
    var opts = options || {};
    var interactive = Boolean(opts.interactive);
    var open = opts.open !== false;
    var id = opts.id || "source-popover-" + (++popoverSequence);
    var titleId = id + "-title";
    var labelledBy = opts.title === false ? "" : ' aria-labelledby="' + titleId + '"';
    var attributes = interactive
      ? ' id="' + id + '" role="dialog" aria-modal="false"' + labelledBy + ' data-popover-panel data-preferred-position="' + (opts.position || "top") + '" aria-hidden="' + (!open) + '"' + (open ? "" : " hidden")
      : "";
    var actions = opts.actions
      ? "<footer>" +
        button(opts.cancelText || "Cancel", "", 'type="button" data-component-reference="C-02"' + (interactive ? " data-popover-cancel" : "")) +
        button('<span>' + (opts.confirmText || "Confirm") + "</span>", "is-primary", 'type="button" data-component-reference="C-02"' + (interactive ? " data-popover-confirm" : "")) +
        "</footer>"
      : "";
    var leading = opts.icon ? popoverStatusIcon(opts.icon, opts.state) : "";
    return '<div class="source-popover is-' + (opts.size || "small") + ' is-' + (opts.position || "top") + (opts.icon ? " has-icon" : "") + (opts.state ? " is-" + opts.state : "") + (opts.className ? " " + opts.className : "") + (interactive && open ? " is-open" : "") + '"' + attributes + '><i class="popover-arrow" aria-hidden="true"></i>' + (opts.title === false ? "" : '<header>' + leading + '<strong id="' + titleId + '">' + (opts.title || "Title") + "</strong></header>") + '<div class="popover-content">' + (opts.content || "Here is the description content.") + "</div>" + actions + "</div>";
  }

  /* Canonical C-39 interactive shell, extracted from clickDemo/positionDemo. */
  function sourcePopover(options) {
    var opts = options || {};
    var open = Boolean(opts.open);
    var id = opts.id || "source-popover-" + (++popoverSequence);
    var position = opts.position || "bottom";
    var variant = opts.variant || "information";
    var actions = variant === "interactive" || variant === "confirmation";
    var iconName = opts.icon || (variant === "confirmation" ? "warning" : "");
    var panel = popoverSpec({ id: id, size: opts.size, title: opts.title, content: opts.content, icon: iconName, state: opts.state, actions: actions, interactive: true, open: open, position: position, confirmText: opts.confirmText, cancelText: opts.cancelText });
    var trigger = button(opts.triggerLabel || "Open popover", "", 'type="button" data-popover-trigger data-component-reference="C-02" aria-haspopup="dialog" aria-controls="' + id + '" aria-expanded="' + open + '"');
    return '<div class="popover-demo is-click' + (open ? " is-open" : "") + '" data-popover-demo data-placement="' + position + '"><div class="popover-anchor">' + trigger + panel + '</div><span class="popover-live" data-popover-status role="status" aria-live="polite"></span></div>';
  }

  function stateStrip(baseClass) {
    return ["Default", "Hover", "Active", "Focus", "Disabled"].map(function (state) {
      return cell(state, '<span class="state-chip ' + baseClass + " is-" + state.toLowerCase() + '">' + state + "</span>");
    });
  }

  function principleState(label, state, attrs) {
    var stateClass = state ? " is-state-" + state : "";
    var disabled = state === "disabled" ? " disabled" : "";
    var loading = state === "loading" ? icon("progress_activity", "button-spinner") : "";
    return '<div class="principle-state-pair"><button class="b2b-button is-primary' + stateClass + '"' + disabled + ' ' + (attrs || "") + '>' + loading + '<span>' + label + '</span></button><button class="b2b-button is-icon' + stateClass + '" aria-label="更多操作"' + disabled + '>' + (loading || icon("more_horiz")) + "</button></div>";
  }

  function toggleButton(label, variant, state, iconName) {
    var selected = state.indexOf("selected") === 0;
    var disabled = state.indexOf("disabled") >= 0;
    return '<button class="b2b-button toggle-spec ' + (variant || "") + " is-state-" + state + (selected ? " is-selected" : "") + '" type="button" data-toggle-button aria-pressed="' + selected + '"' + (disabled ? " disabled" : "") + '>' + (iconName ? icon(iconName) : "") + '<span>' + label + "</span></button>";
  }

  function toggleMatrix() {
    var columns = ["Default", "Hover", "Active", "Disabled", "Selected", "Selected Hover", "Selected Active", "Selected Disabled"];
    var rows = [
      ["基础 · 主按钮", "is-primary", "订阅", "notifications"],
      ["基础 · 蓝色次按钮", "is-secondary-blue", "关注", "person_add"],
      ["基础 · 灰色次按钮", "", "收藏", "star"],
      ["成功按钮", "is-success", "已完成", "check"],
      ["文字 · 蓝色", "is-text", "置顶", "keep"],
      ["文字 · 灰色", "is-text is-neutral", "筛选", "filter_alt"],
      ["图标 · 灰色", "is-icon is-subtle", "", "format_bold"],
      ["图标 · 蓝色", "is-icon is-secondary-blue", "", "calendar_month"]
    ];
    var states = ["default", "hover", "active", "disabled", "selected", "selected-hover", "selected-active", "selected-disabled"];
    return '<div class="toggle-matrix" role="table" aria-label="按钮状态切换矩阵"><div class="toggle-matrix-row is-header" role="row"><strong role="columnheader">类型</strong>' + columns.map(function (column) { return '<span role="columnheader">' + column + "</span>"; }).join("") + "</div>" + rows.map(function (item) {
      return '<div class="toggle-matrix-row" role="row"><strong role="rowheader">' + item[0] + "</strong>" + states.map(function (state) { return '<span role="cell">' + toggleButton(item[2], item[1], state, item[3]) + "</span>"; }).join("") + "</div>";
    }).join("") + "</div>";
  }

  function tableSortIndicator() {
    return '<svg class="table-sort-arrows" viewBox="0 0 12 16" aria-hidden="true" focusable="false"><path class="table-sort-up" d="M6 2 10 6H2Z"></path><path class="table-sort-down" d="M2 10h8l-4 4Z"></path></svg>';
  }

  function tableSortButton(label, key) {
    return '<button class="table-sort" type="button" data-table-sort="' + key + '" data-sort-label="' + label + '" aria-label="' + label + '，点击升序" title="点击升序"><span>' + label + "</span>" + tableSortIndicator() + "</button>";
  }

  function tableSafeText(value) {
    return String(value).replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function tableFilterDropdown(label, key, values) {
    var items = values || [];
    var menuItems = items.map(function (item, itemIndex) {
      var data = typeof item === "string" ? { label: item, value: item } : item;
      var fallback = checkboxOption(data.label, "unchecked", {
        dynamic: true,
        className: "table-filter-option",
        rootAttrs: 'data-component-reference="C-11"',
        dataAttrs: 'data-table-filter-option data-filter-key="' + key + '" data-filter-value="' + data.value + '"'
      });
      return tableCompositionSlot("C-11", "filter-option", 'data-filter-key="' + tableSafeText(key) + '" data-filter-value="' + tableSafeText(data.value) + '" data-filter-label="' + tableSafeText(data.label) + '" data-filter-index="' + itemIndex + '"', fallback);
    }).join("");
    var trigger = '<button class="table-filter-trigger" type="button" data-popup-trigger data-component-reference="C-04" aria-label="筛选' + label + '" aria-haspopup="dialog" aria-expanded="false"><svg class="table-filter-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.25 3.25h11.5L9.5 8.1v3.25l-3 1.4V8.1Z"></path></svg></button>';
    var panel = '<div class="demo-menu table-filter-panel" role="dialog" aria-label="' + label + '筛选" data-popup-panel aria-hidden="true"><div class="table-filter-options">' + menuItems + '</div><div class="table-filter-actions">' + tableBasicButtonSlot("filter-reset", "重置", "secondary-gray", "data-table-filter-reset") + tableBasicButtonSlot("filter-confirm", "确定", "primary", "data-table-filter-confirm") + "</div></div>";
    return '<div class="interactive-dropdown table-filter-dropdown" data-popup-root data-component-reference="C-08"><span class="table-filter-label">' + label + "</span>" + trigger + panel + "</div>";
  }

  function tableBasicButtonSlot(role, label, variant, attributes, size) {
    return '<span class="table-c02-slot" data-table-c02-slot data-table-button-role="' + role + '" ' + (attributes || "") + '>' + sourceBasicButton({ label: tableSafeText(label), variant: variant, size: size || "mini", width: "default", icon: null, disabled: false, loading: false }) + "</span>";
  }

  function tableRowActions(options) {
    var opts = options || {};
    var actions = '<div class="table-row-actions">' + button(opts.first || "Action1", "is-text", 'type="button" data-component-reference="C-03"') + button(opts.second || "Action2", "is-text", 'type="button" data-component-reference="C-03"');
    if (opts.more !== false) {
      var trigger = button("", "is-icon is-subtle", 'type="button" data-popup-trigger data-component-reference="C-04" aria-haspopup="menu" aria-expanded="false" aria-label="更多操作"', "more_horiz");
      actions += actionDropdown(trigger, [
        { label: "编辑", icon: "edit" },
        { label: "复制", icon: "content_copy" },
        { label: "移动到", icon: "drive_file_move" },
        { label: "删除", icon: "delete", danger: true }
      ], "table-action-dropdown is-align-end", false);
    }
    return actions + "</div>";
  }

  function tableCompositionSlot(component, role, attributes, fallback) {
    return '<span class="table-component-slot" data-table-component-slot="' + component + '" data-table-component-role="' + role + '" ' + (attributes || "") + '>' + fallback + "</span>";
  }

  function structuredTableCell(column, cell, row, rowIndex, columnIndex) {
    var type = column.type || "text";
    if (type === "actions") {
      var directActionCount = cell.actions.length > 3 ? 2 : cell.actions.length;
      var directActions = cell.actions.slice(0, directActionCount);
      var overflowActions = cell.actions.slice(directActionCount);
      return {
        className: "table-actions-cell" + (overflowActions.length ? " has-overflow-actions" : ""),
        html: '<div class="table-row-actions">' + directActions.map(function (action, actionIndex) {
          return tableCompositionSlot("C-03", action._tableEdit ? "edit-start" : "row-action", 'data-table-row-index="' + rowIndex + '" data-table-column-index="' + columnIndex + '" data-table-action-index="' + actionIndex + '"', sourceTextButton({ label: tableSafeText(action.label), variant: "Button_Link", tone: "primary", leadingIcon: null, trailingArrow: null, href: null, disabled: Boolean(action.disabled) }));
        }).join("") + (overflowActions.length ? tableCompositionSlot("C-04", "row-action-more", 'data-table-row-index="' + rowIndex + '" data-table-column-index="' + columnIndex + '" data-table-action-offset="' + directActionCount + '"', sourceIconButton({ variant: "menu trigger", icon: "more_horiz", label: "更多操作", size: 32, expanded: false, disabled: false, tooltip: false, items: overflowActions.map(function (action) { return { label: tableSafeText(action.label), danger: action.tone === "danger", disabled: Boolean(action.disabled) }; }) })) : "") + "</div>"
      };
    }
    if (type === "avatar") {
      return {
        className: "table-avatar-cell",
        html: '<span class="table-avatar-name">' + tableCompositionSlot("C-32", "avatar", 'data-table-row-index="' + rowIndex + '" data-table-column-index="' + columnIndex + '"', sourceAvatar({ variant: "text", text: tableSafeText(cell.avatarText || cell.text.charAt(0)), image: null, fallback: tableSafeText(cell.avatarText || cell.text.charAt(0)), icon: null, size: 24, label: tableSafeText(cell.text), shape: "round", loading: false, status: "online", items: [], maxVisible: 5, expanded: false })) + '<span class="table-avatar-copy">' + tableSafeText(cell.text) + "</span></span>"
      };
    }
    if (type === "tag") return { className: "table-tag-cell", html: tableCompositionSlot("C-42", "tag", 'data-table-row-index="' + rowIndex + '" data-table-column-index="' + columnIndex + '"', tagSpec({ type: "property", size: "medium", text: tableSafeText(cell.text), color: cell.tone || "blue" })) };
    if (type === "status") {
      var badgeColor = { neutral: "gray", gray: "gray", green: "green", blue: "blue", red: "red" }[cell.tone] || "gray";
      return { className: "table-status-cell", html: '<span class="table-status-content">' + tableCompositionSlot("C-33", "status", 'data-table-row-index="' + rowIndex + '" data-table-column-index="' + columnIndex + '"', sourceBadge({ variant: "dot", color: badgeColor, size: 6, text: "", icon: "check", appearance: "fill", label: tableSafeText(cell.text) })) + '<span>' + tableSafeText(cell.text) + "</span></span>" };
    }
    if (type === "switch") {
      return { className: "table-switch-cell", html: tableCompositionSlot("C-27", "switch", 'data-table-row-index="' + rowIndex + '" data-table-column-index="' + columnIndex + '"', sourceSwitch({ state: (cell.checked ? "on" : "off") + (cell.disabled ? "-disabled" : "-normal"), size: "small", label: tableSafeText(column.label + " " + (row.label || row.id)) })) };
    }
    var safeText = tableSafeText(cell.text);
    var copy = type === "number" ? '<span class="table-number">' + safeText + "</span>" : safeText;
    if (column.truncate) copy = '<span class="table-truncated" title="' + safeText + '">' + copy + "</span>";
    return { className: column.truncate ? "is-truncated" : "", html: copy, value: cell.text };
  }

  function structuredTableRows(columns, rows) {
    return rows.map(function (row, rowIndex) {
      var cellsByKey = row.cells.reduce(function (result, cell) {
        result[cell.columnKey] = cell;
        return result;
      }, {});
      var sort = {};
      var cells = columns.map(function (column, columnIndex) {
        var cell = cellsByKey[column.key];
        if (column.sortable || column.filterOptions && column.filterOptions.length) sort[column.key] = cell.sortValue === undefined ? cell.text : cell.sortValue;
        return structuredTableCell(column, cell, row, rowIndex, columnIndex);
      });
      return { id: row.id, label: row.label || row.id, checked: Boolean(row.checked), parentId: row.parentId || "", expanded: row.expanded !== false, group: row.group || "", detail: row.detail || "", sort: sort, cells: cells };
    });
  }

  function structuredTableHeaderContent(column) {
    var label = tableSafeText(column.label);
    if (column.sortable) return tableSortButton(label, column.key);
    if (column.filterOptions && column.filterOptions.length) return tableFilterDropdown(label, column.key, column.filterOptions.map(tableSafeText));
    return label;
  }

  function structuredTableGroupHead(columns, controls, fixed) {
    var top = controls;
    var second = "";
    var index = 0;
    while (index < columns.length) {
      var column = columns[index];
      var group = column.headerGroup || column.group || "";
      if (!group) {
        var standaloneClasses = ["table-column-" + column.type];
        if (fixed.leading && index === 0) standaloneClasses.push("is-fixed-left");
        if (fixed.trailing && index === columns.length - 1) standaloneClasses.push("is-fixed-right");
        if (column.type === "actions") standaloneClasses.push("is-actions-divider");
        top += '<th scope="col" rowspan="2" data-table-column-key="' + column.key + '" class="' + standaloneClasses.join(" ") + '">' + structuredTableHeaderContent(column) + "</th>";
        index += 1;
        continue;
      }
      var count = 1;
      while (index + count < columns.length && (columns[index + count].headerGroup || columns[index + count].group || "") === group) count += 1;
      top += '<th class="table-group-title" scope="colgroup" colspan="' + count + '">' + tableSafeText(group) + "</th>";
      for (var offset = 0; offset < count; offset += 1) {
        var groupedColumn = columns[index + offset];
        var groupedClasses = ["table-column-" + groupedColumn.type];
        if (fixed.leading && index + offset === 0) groupedClasses.push("is-fixed-left");
        if (fixed.trailing && index + offset === columns.length - 1) groupedClasses.push("is-fixed-right");
        if (groupedColumn.type === "actions") groupedClasses.push("is-actions-divider");
        second += '<th scope="col" data-table-column-key="' + groupedColumn.key + '" class="' + groupedClasses.join(" ") + '"' + (groupedColumn.sortable ? ' aria-sort="none"' : "") + ">" + structuredTableHeaderContent(groupedColumn) + "</th>";
      }
      index += count;
    }
    return '<tr class="table-group-head">' + top + '</tr><tr class="table-sub-head">' + second + "</tr>";
  }

  function tableSelectionMarkup(label, checked, attributes, role) {
    var selectionRole = role || "row-select";
    var hook = selectionRole === "select-all" ? "data-demo-select-all" : "data-demo-row-select";
    var fallback = checkboxOption("", checked ? "checked" : "unchecked", {
      dynamic: true,
      compact: true,
      className: "table-selection",
      rootAttrs: 'data-component-reference="C-11"',
      dataAttrs: (attributes || "") + " " + hook + ' aria-label="' + label + '"'
    });
    return tableCompositionSlot("C-11", selectionRole, attributes || "", fallback);
  }

  function structuredColumnMinWidth(column, columnIndex, columns, fixed) {
    var semanticWidths = { text: 200, tree: 200, avatar: 144, tag: 112, status: 112, number: 96, "switch": 84, actions: 176 };
    var leadingWidths = { compact: 160, standard: 200, wide: 240 };
    var trailingWidths = { compact: 144, standard: 176, wide: 208 };
    if (fixed.leading && columnIndex === 0) return leadingWidths[fixed.leadingWidth] || leadingWidths.standard;
    if (fixed.trailing && columnIndex === columns.length - 1) return trailingWidths[fixed.trailingWidth] || trailingWidths.standard;
    return semanticWidths[column.type] || 112;
  }

  function structuredDataTable(options) {
    var opts = options || {};
    var legacyVariant = ["basic", "selection", "fixed", "editable"].indexOf(opts.variant) >= 0;
    var tableVariant = legacyVariant ? "default" : (opts.variant === "grouped" && (opts.columns || []).some(function (column) { return Boolean(column.group); }) ? "traditional" : opts.variant);
    var legacyToolbar = opts.toolbar && opts.toolbar.variant === "title-actions" ? {
      visible: true, showTitle: true, showButtonGroup: true, title: opts.toolbar.title,
      searchPlaceholder: opts.toolbar.searchPlaceholder, searchLabel: opts.toolbar.searchLabel,
      actions: [
        { id: opts.toolbar.secondaryAction.id, label: opts.toolbar.secondaryAction.label, variant: "secondary-gray", disabled: opts.toolbar.secondaryAction.disabled },
        { id: opts.toolbar.primaryAction.id, label: opts.toolbar.primaryAction.label, variant: "primary", disabled: opts.toolbar.primaryAction.disabled }
      ]
    } : null;
    var toolbarOptions = opts.toolbar && typeof opts.toolbar.visible === "boolean" ? opts.toolbar : (legacyToolbar || { visible: false, showTitle: false, showButtonGroup: false, title: "", searchPlaceholder: "", searchLabel: "", actions: [] });
    var paginationOptions = opts.pagination && typeof opts.pagination.visible === "boolean" ? opts.pagination : (opts.pagination && opts.pagination.ownership === "internal" ? { visible: true, total: opts.pagination.total, current: opts.pagination.current, pageSize: opts.pagination.pageSize } : { visible: false });
    var batchOptions = opts.batchActions && typeof opts.batchActions === "object" ? opts.batchActions : { visible: Boolean(opts.batchActions), actions: [{ id: "assign", label: "批量操作", variant: "secondary-blue", disabled: false }, { id: "export", label: "导出", variant: "secondary-gray", disabled: false }] };
    var columns = opts.columns || [];
    var sourceRows = structuredTableRows(columns, opts.structuredRows || []);
    var selectable = Boolean(batchOptions.visible) || ["selection", "fixed", "editable"].indexOf(opts.variant) >= 0;
    var fixed = opts.fixedColumns || { leading: opts.variant === "fixed", trailing: opts.variant === "fixed", leadingWidth: "standard", trailingWidth: "standard" };
    var grouped = tableVariant === "grouped";
    var tree = tableVariant === "tree";
    var nested = tableVariant === "nested";
    var traditional = tableVariant === "traditional";
    var multiLevelHeader = Boolean(opts.multiLevelHeader) || opts.variant === "grouped" && tableVariant === "traditional";
    var expandable = tree || nested;
    var childIds = sourceRows.reduce(function (result, row) {
      if (row.parentId) result[row.parentId] = true;
      return result;
    }, {});
    var rowById = sourceRows.reduce(function (result, row) { result[row.id] = row; return result; }, {});
    function depthOf(row) {
      var depth = 0;
      var current = row;
      var visited = {};
      while (current.parentId && rowById[current.parentId] && !visited[current.parentId]) {
        visited[current.parentId] = true;
        depth += 1;
        current = rowById[current.parentId];
      }
      return depth;
    }
    function editableCell(column, cell, row, rowIndex, columnIndex) {
      var raw = String(cell.value === undefined ? cell.html : cell.value);
      var fallback = inputSpec({ value: tableSafeText(raw), placeholder: tableSafeText(column.label), className: "table-edit-input-source", attrs: ' data-table-edit-input data-table-row-id="' + tableSafeText(row.id) + '" data-table-column-key="' + column.key + '" aria-label="编辑 ' + tableSafeText(column.label) + '"', labelAttrs: 'data-component-reference="C-21"' });
      return '<span class="table-edit-value" data-table-edit-value>' + cell.html + '</span><span class="table-edit-input-slot" data-table-edit-input-slot hidden>' + tableCompositionSlot("C-21", "edit-input", 'data-table-row-index="' + rowIndex + '" data-table-column-index="' + columnIndex + '"', fallback) + "</span>";
    }
    var seenGroups = {};
    var body = sourceRows.map(function (row, rowIndex) {
      var groupRow = "";
      if (grouped && !seenGroups[row.group]) {
        seenGroups[row.group] = true;
        groupRow = '<tr class="table-group-row" data-table-group-row data-table-group="' + tableSafeText(row.group) + '" data-table-row-id="group:' + tableSafeText(row.group) + '"><td colspan="' + (columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)) + '">' + tableCompositionSlot("C-04", "group-expand", 'data-table-group="' + tableSafeText(row.group) + '"', sourceIconButton({ variant: "Button_Icon", icon: "arrow_drop_down", label: "收起分组 " + tableSafeText(row.group), size: 28, disabled: false, tooltip: false, items: [], attrs: 'data-table-expand data-table-group-toggle data-table-group="' + tableSafeText(row.group) + '" aria-expanded="true"' })) + '<span class="table-group-row-label">' + tableSafeText(row.group) + "</span></td></tr>";
      }
      var selectionCell = selectable ? '<td class="table-selection-cell is-fixed-control">' + tableSelectionMarkup("选择 " + tableSafeText(row.label), row.checked, 'data-table-row-index="' + rowIndex + '"', "row-select") + "</td>" : "";
      var expandCell = expandable ? '<td class="table-expand-cell is-fixed-expand">' + ((tree && childIds[row.id]) || nested ? tableCompositionSlot("C-04", "row-expand", 'data-table-row-index="' + rowIndex + '" data-table-expand-kind="' + (tree ? "tree" : "nested") + '"', sourceIconButton({ variant: "Button_Icon", icon: row.expanded ? "arrow_drop_down" : "arrow_right", label: (row.expanded ? "收起 " : "展开 ") + tableSafeText(row.label), size: 28, disabled: false, tooltip: false, items: [], attrs: 'data-table-expand' + (tree ? " data-tree-expand" : "") + ' aria-expanded="' + row.expanded + '"' })) : '<span class="table-expand-placeholder" aria-hidden="true"></span>') + "</td>" : "";
      var sortAttributes = Object.keys(row.sort || {}).map(function (key) {
        return ' data-sort-' + key + '="' + String(row.sort[key]).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"';
      }).join("");
      var cells = columns.map(function (column, columnIndex) {
        var cell = row.cells[columnIndex];
        var content = cell.html;
        var classes = [cell.className || "", "table-column-" + column.type];
        if (fixed.leading && columnIndex === 0) classes.push("is-fixed-left");
        if (fixed.trailing && columnIndex === columns.length - 1) classes.push("is-fixed-right");
        if (column.type === "actions") classes.push("is-actions-divider");
        if (tree && column.type === "tree") {
          content = '<span class="table-tree-content" style="--tree-depth:' + depthOf(row) + '"><span>' + cell.html + "</span></span>";
        } else if (column.editable) {
          content = editableCell(column, cell, row, rowIndex, columnIndex);
          classes.push("is-editable-cell");
        }
        if (column.type === "actions" && columns.some(function (candidate) { return candidate.editable; })) {
          content = '<div class="table-edit-actions"><div data-table-edit-idle>' + content + '</div><span data-table-edit-active hidden>' + tableCompositionSlot("C-03", "edit-commit", 'data-table-row-index="' + rowIndex + '"', sourceTextButton({ label: "保存", variant: "Button_Link", tone: "primary", leadingIcon: null, trailingArrow: null, href: null, disabled: false })) + tableCompositionSlot("C-03", "edit-cancel", 'data-table-row-index="' + rowIndex + '"', sourceTextButton({ label: "取消", variant: "Button_Link", tone: "primary", leadingIcon: null, trailingArrow: null, href: null, disabled: false })) + "</span></div>";
        }
        return '<td class="' + classes.filter(Boolean).join(" ") + '">' + content + "</td>";
      }).join("");
      var editableRow = columns.some(function (column) { return column.editable; });
      var dataRow = '<tr id="table-row-' + tableSafeText(row.id) + '" data-table-data-row data-table-row-id="' + tableSafeText(row.id) + '" data-table-row-label="' + tableSafeText(row.label || row.id) + '" data-table-original-index="' + rowIndex + '"' + (grouped ? ' data-table-group="' + tableSafeText(row.group) + '"' : "") + sortAttributes + (tree ? ' data-table-tree-row data-tree-key="' + tableSafeText(row.id) + '"' + (row.parentId ? ' data-tree-parent="' + tableSafeText(row.parentId) + '"' : "") : "") + (editableRow ? " data-table-editable-row" : "") + ' aria-selected="' + row.checked + '"' + (row.checked ? ' class="is-selected"' : "") + ">" + selectionCell + expandCell + cells + "</tr>";
      var detailRow = nested ? '<tr class="table-expanded-row table-nested-detail"' + (row.expanded ? "" : " hidden") + '><td colspan="' + (columns.length + (selectable ? 1 : 0) + 1) + '"><div class="table-expanded-content"><strong>' + tableSafeText(row.label) + '</strong><p>' + tableSafeText(row.detail) + "</p></div></td></tr>" : "";
      return groupRow + dataRow + detailRow;
    }).join("");
    var controlHead = (selectable ? '<th class="table-selection-cell is-fixed-control"' + (multiLevelHeader ? ' rowspan="2"' : "") + '>' + tableSelectionMarkup("全选当前表格", false, "", "select-all") + "</th>" : "") + (expandable ? '<th class="table-expand-cell is-fixed-expand" aria-label="展开或收起行"' + (multiLevelHeader ? ' rowspan="2"' : "") + "></th>" : "");
    var leafHead = '<tr>' + controlHead + columns.map(function (column, columnIndex) {
      var classes = ["table-column-" + column.type];
      if (fixed.leading && columnIndex === 0) classes.push("is-fixed-left");
      if (fixed.trailing && columnIndex === columns.length - 1) classes.push("is-fixed-right");
      if (column.type === "actions") classes.push("is-actions-divider");
      return '<th data-table-column-key="' + column.key + '" class="' + classes.join(" ") + '"' + (column.sortable ? ' aria-sort="none"' : "") + ">" + structuredTableHeaderContent(column) + "</th>";
    }).join("") + "</tr>";
    var toolbar = "";
    if (toolbarOptions.visible) {
      var search = inputSpec({ prefix: "search", clear: true, placeholder: tableSafeText(toolbarOptions.searchPlaceholder), className: "table-search", attrs: ' data-table-search aria-label="' + tableSafeText(toolbarOptions.searchLabel) + '"', labelAttrs: 'data-component-reference="C-21"' });
      var heading = toolbarOptions.showTitle ? '<strong data-table-toolbar-title>' + tableSafeText(toolbarOptions.title) + "</strong>" : "";
      var toolbarActions = toolbarOptions.showButtonGroup ? '<div class="table-toolbar-actions"><span data-table-toolbar-search>' + tableCompositionSlot("C-21", "toolbar-search", "", search) + "</span>" + toolbarOptions.actions.map(function (action, actionIndex) {
        var legacyAttributes = legacyToolbar ? ' data-table-c02-slot data-table-button-role="' + (actionIndex === 0 ? "toolbar-secondary" : "toolbar-primary") + '" data-table-toolbar-action data-table-action-id="' + tableSafeText(action.id) + '"' : "";
        return tableCompositionSlot("C-02", "toolbar-action", 'data-table-action-index="' + actionIndex + '"' + legacyAttributes, sourceBasicButton({ label: tableSafeText(action.label), variant: action.variant, size: "medium", width: "default", icon: null, disabled: Boolean(action.disabled), loading: false }));
      }).join("") + "</div>" : "";
      toolbar = '<div class="table-toolbar table-toolbar-title-actions" data-table-toolbar><div class="table-toolbar-heading">' + heading + "</div>" + toolbarActions + "</div>";
    }
    var footer = paginationOptions.visible ? '<div class="table-footer">' + tableCompositionSlot("C-15", "pagination", "", ownedTablePagination({ ownership: "internal", total: paginationOptions.total, current: paginationOptions.current, pageSize: paginationOptions.pageSize })) + "</div>" : "";
    var batch = selectable ? '<div class="table-batch" data-demo-batch aria-hidden="true"><div class="table-batch-actions">' + batchOptions.actions.map(function (action, actionIndex) { return tableCompositionSlot("C-02", "batch-action", 'data-table-action-index="' + actionIndex + '"', sourceBasicButton({ label: tableSafeText(action.label), variant: action.variant, size: "medium", width: "default", icon: null, disabled: Boolean(action.disabled), loading: false })); }).join("") + '</div><div class="table-batch-meta"><strong>已选 <span data-demo-batch-count>0</span> 项</strong>' + tableCompositionSlot("C-03", "clear-selection", "", sourceTextButton({ label: "清除", variant: "Button_Text", tone: "primary", leadingIcon: null, trailingArrow: null, href: null, disabled: false })) + "</div></div>" : "";
    var columnMinWidths = columns.map(function (column, index) { return structuredColumnMinWidth(column, index, columns, fixed); });
    var tableContentMinWidth = (selectable ? 40 : 0) + (expandable ? 28 : 0) + columnMinWidths.reduce(function (sum, width) { return sum + width; }, 0);
    var flexibleColumnIndex = columns.findIndex(function (column, index) {
      return !(fixed.leading && index === 0) && !(fixed.trailing && index === columns.length - 1) && ["switch", "actions"].indexOf(column.type) < 0;
    });
    var colgroup = '<colgroup>' + (selectable ? '<col class="table-col-selection">' : "") + (expandable ? '<col class="table-col-expand">' : "") + columns.map(function (column, index) {
      var width = columnMinWidths[index];
      return '<col class="table-col table-col-' + column.type + (index === flexibleColumnIndex ? ' is-flexible-column' : '') + '" style="' + (index === flexibleColumnIndex ? "" : "width:" + width + "px;") + 'min-width:' + width + 'px" data-table-column-min-width="' + width + '">';
    }).join("") + "</colgroup>";
    var fixedClass = fixed.leading || fixed.trailing ? " has-fixed-columns" : (selectable || expandable ? " has-sticky-controls" : "");
    var fixedStateClasses = (fixed.leading ? " has-fixed-leading" : "") + (fixed.trailing ? " has-fixed-trailing" : "");
    var rootStyle = '--table-fixed-leading-width:' + ({ compact: 160, standard: 200, wide: 240 }[fixed.leadingWidth] || 200) + 'px;--table-fixed-trailing-width:' + ({ compact: 144, standard: 176, wide: 208 }[fixed.trailingWidth] || 176) + 'px;--table-content-min-width:' + tableContentMinWidth + "px";
    var head = multiLevelHeader ? structuredTableGroupHead(columns, controlHead, fixed) : leafHead;
    var tableRegion = '<div class="table-fixed-viewport' + fixedStateClasses + '" data-table-fixed-viewport style="' + rootStyle + '"><div class="b2b-table-wrap" data-table-fixed-scroll><table class="b2b-table">' + colgroup + "<thead>" + head + "</thead><tbody>" + body + '</tbody></table></div><i class="table-fixed-column-shadow is-left" aria-hidden="true"></i><i class="table-fixed-column-shadow is-right" aria-hidden="true"></i></div>';
    return '<div class="table-demo specimen-table is-structured is-' + tableVariant + " is-" + (opts.density || "standard") + (traditional ? " is-bordered" : "") + (multiLevelHeader ? " has-grouped-head" : "") + fixedClass + (tree ? " is-tree-table" : "") + (nested ? " is-nested-table" : "") + '" data-table-demo style="' + rootStyle + '">' + toolbar + tableRegion + batch + footer + '<span class="table-live" data-table-live aria-live="polite"></span></div>';
  }

  function tablePaginationWindow(current, totalPages) {
    var count = Math.min(5, totalPages);
    var start = Math.max(1, Math.min(totalPages - count + 1, current - Math.floor(count / 2)));
    return Array.from({ length: count }, function (_, index) { return start + index; });
  }

  function ownedTablePagination(pagination) {
    if (!pagination || pagination.ownership !== "internal") return "";
    var totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
    var pages = tablePaginationWindow(pagination.current, totalPages);
    return paginationSpec({
      current: pagination.current,
      totalPages: totalPages,
      pages: pages,
      totalText: "共 " + pagination.total + " 条",
      startEllipsis: pages[0] > 1,
      endEllipsis: pages[pages.length - 1] < totalPages
    }) + '<span class="table-page-size-label">' + pagination.pageSize + " 条/页</span>";
  }

  function tableDemo(options) {
    var opts = options || {};
    var people = [
      { initial: "M", name: "Maya Chun", date: "2022-09-08", type: "Full-time", state: "General Error", stateColor: "orange", stateIcon: "error", amount: "¥271.58", amountValue: 271.58, more: true },
      { initial: "L", name: "Linda Jones", date: "2022-07-17", type: "Full-time", state: "Completed", stateColor: "green", stateIcon: "check", amount: "¥585.76", amountValue: 585.76, more: true },
      { initial: "M", name: "Maya Chun", date: "2022-06-01", type: "Intern", state: "In progress", stateColor: "blue", stateIcon: "progress_activity", amount: "¥638.20", amountValue: 638.2, more: true },
      { initial: "J", name: "Juliette Roux", date: "2022-07-09", type: "Intern", state: "Missing", stateColor: "neutral", stateIcon: "circle", amount: "¥353.94", amountValue: 353.94, more: false }
    ];
    var structured = Array.isArray(opts.columns) && Array.isArray(opts.structuredRows);
    if (structured && opts.variant) return structuredDataTable(opts);
    var selectable = opts.selectable !== false;
    var suppliedRows = structured ? structuredTableRows(opts.columns, opts.structuredRows) : opts.rows || people.map(function (person) {
      return {
        label: person.name,
        sort: { person: person.name, date: person.date, type: person.type, state: person.state, amount: person.amountValue },
        cells: [
          '<span class="person-cell">' + avatarSpec({ text: person.initial, size: 24, label: person.name, as: "span" }) + "<strong>" + person.name + "</strong></span>",
          tagSpec({ type: "property", text: person.type, color: "blue" }),
          person.date,
          tagSpec({ type: "status", text: person.state, color: person.stateColor, icon: person.stateIcon }),
          person.amount,
          tableRowActions({ more: person.more })
        ]
      };
    });
    var headings = structured ? opts.columns.map(function (column) {
      return {
        label: column.label,
        key: column.key,
        sortable: Boolean(column.sortable),
        className: "table-column-" + column.type + (column.truncate ? " is-truncated-column" : "")
      };
    }) : opts.headings || [
      { label: "人员", key: "person" },
      { label: "员工类型", key: "type", filter: ["Full-time", "Intern", "Outsourcing"] },
      { label: "日期", key: "date", sortable: true },
      { label: "状态", key: "state", filter: ["General Error", "Completed", "In progress", "Missing"] },
      { label: "金额", key: "amount", sortable: true },
      { label: "操作", key: "actions" }
    ];
    function tableSelection(label, checked, attributes) {
      return checkboxOption("", checked ? "checked" : "unchecked", {
        dynamic: true,
        compact: true,
        className: "table-selection",
        rootAttrs: 'data-component-reference="C-11"',
        dataAttrs: (attributes || "") + ' aria-label="' + label + '"'
      });
    }
    var rows = suppliedRows.map(function (row, rowIndex) {
      var selectionCell = selectable ? '<td class="table-selection-cell">' + tableSelection("选择 " + (row.label || "第 " + (rowIndex + 1) + " 行"), Boolean(row.checked), "data-demo-row-select") + "</td>" : "";
      var sortAttributes = Object.keys(row.sort || {}).map(function (key) {
        var sortValue = String(row.sort[key]).replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return ' data-sort-' + key + '="' + sortValue + '"';
      }).join("");
      return '<tr data-table-data-row data-table-row-id="' + String(row.id || rowIndex).replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, "&amp;").replace(/\"/g, "&quot;") + '" data-table-original-index="' + rowIndex + '"' + sortAttributes + (opts.interactiveRows ? ' data-layout-row tabindex="0" aria-selected="' + Boolean(row.selected) + '"' : "") + (row.selected ? ' class="is-selected"' : "") + ">" + selectionCell + (row.cells || []).map(function (cell) {
        var definition = typeof cell === "string" ? { html: cell, className: "" } : cell;
        return "<td" + (definition.className ? ' class="' + definition.className + '"' : "") + ">" + definition.html + "</td>";
      }).join("") + "</tr>";
    }).join("");
    if (opts.empty) {
      rows = '<tr class="table-empty-row"><td colspan="' + (headings.length + (selectable ? 1 : 0)) + '">' + emptyStateSpec({ compact: true, title: opts.empty.title, description: opts.empty.description, icon: opts.empty.icon }) + "</td></tr>";
    } else {
      rows += '<tr class="table-no-results" hidden><td colspan="' + (headings.length + (selectable ? 1 : 0)) + '">' + emptyStateSpec({ compact: true, title: "未找到匹配记录", description: "请调整搜索或筛选条件后重试。", icon: "search_off" }) + "</td></tr>";
    }
    var actions = opts.actionsHtml === undefined ? button(opts.primaryLabel || "新增", "is-primary", 'type="button" data-component-reference="C-02"', opts.primaryIcon || "") + button(opts.secondaryLabel || "批量操作", "", 'type="button" data-component-reference="C-02"') : opts.actionsHtml;
    var search = inputSpec({
      prefix: "search",
      clear: true,
      placeholder: opts.searchPlaceholder || "搜索",
      className: "table-search",
      attrs: ' data-table-search aria-label="' + (opts.searchLabel || "搜索记录") + '"',
      labelAttrs: 'data-component-reference="C-21"'
    });
    var searchArea = opts.searchExtrasHtml ? '<div class="table-search-group">' + search + opts.searchExtrasHtml + "</div>" : search;
    var toolbar = opts.toolbar === false ? "" : '<div class="table-toolbar">' + (opts.searchFirst ? searchArea + '<div class="button-group">' + actions + "</div>" : '<div class="button-group">' + actions + "</div>" + searchArea) + "</div>";
    var head = '<tr>' + (selectable ? '<th class="table-selection-cell">' + tableSelection("全选当前表格", false, "data-demo-select-all") + "</th>" : "") + headings.map(function (heading, index) {
      var definition = typeof heading === "string" ? { label: heading } : heading;
      var content = definition.sortable
        ? tableSortButton(definition.label, definition.key)
        : definition.filter
          ? tableFilterDropdown(definition.label, definition.key, definition.filter)
          : definition.label;
      return "<th" + (definition.className ? ' class="' + definition.className + '"' : "") + (definition.sortable ? ' aria-sort="none"' : "") + ">" + content + "</th>";
    }).join("") + "</tr>";
    var defaultPagination = paginationSpec({ current: 1, totalPages: 8, pages: [1, 2, 3, 4, 5], complete: true, totalText: opts.totalText || "共 128 条" });
    var pagination = opts.pagination ? ownedTablePagination(opts.pagination) : (opts.paginationHtml === undefined ? defaultPagination : opts.paginationHtml);
    var footer = opts.footer === false || opts.pagination && opts.pagination.ownership === "external" ? "" : '<div class="table-footer">' + pagination + "</div>";
    var batchMoreTrigger = button("", "is-icon is-subtle", 'type="button" data-popup-trigger data-component-reference="C-04" aria-haspopup="menu" aria-expanded="false" aria-label="更多批量操作"', "more_horiz");
    var batch = '<div class="table-batch" data-demo-batch hidden><div class="table-batch-actions">' + button("批量操作", "is-secondary-blue", 'type="button" data-component-reference="C-02"') + button("导出", "is-secondary-blue", 'type="button" data-component-reference="C-02"') + actionDropdown(batchMoreTrigger, ["移动到", "添加标签", "删除"], "table-action-dropdown", false) + '</div><div class="table-batch-meta"><strong>已选 <span data-demo-batch-count>0</span> 项</strong>' + button("选择全部记录", "is-text", 'type="button" data-component-reference="C-03"') + button("清除", "is-text", 'type="button" data-component-reference="C-03" data-table-clear-selection') + "</div></div>";
    return '<div class="table-demo specimen-table is-' + (opts.density || (opts.compact ? "compact" : "standard")) + (structured ? " is-structured" : "") + '" data-table-demo>' + toolbar + batch + '<div class="b2b-table-wrap"><table class="b2b-table"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table></div>" + footer + '<span class="table-live" data-table-live aria-live="polite"></span></div>';
  }

  function nestedHierarchyTableSpec(options) {
    var opts = options || {};
    var definitions = [
      { name: "Cosmos Corporation", key: "nested-cosmos", depth: 0, hasChildren: true, expanded: true, tagCount: 2, status: "Done", statusClass: "is-success" },
      { name: "Galaxy sector", key: "nested-galaxy", parent: "nested-cosmos", depth: 1, hasChildren: true, expanded: true, tagCount: 3, status: "In progress", statusClass: "is-danger" },
      { name: "Asteroid", key: "nested-asteroid", parent: "nested-galaxy", depth: 2, tagCount: 2, neutralTags: true, status: "Terminated", statusClass: "is-neutral" },
      { name: "Cosmos Corporation", key: "nested-cosmos-secondary", depth: 0, hasChildren: true, expanded: false, tagCount: 2, neutralTags: true, status: "Terminated", statusClass: "is-neutral" },
      { name: "Nebula team", key: "nested-nebula", parent: "nested-cosmos-secondary", depth: 1, tagCount: 1, neutralTags: true, status: "Terminated", statusClass: "is-neutral" }
    ];
    var arrow = '<svg class="table-expand-triangle" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 3.5 11 8 5 12.5Z"></path></svg>';
    var body = definitions.map(function (definition, index) {
      var toggle = definition.hasChildren
        ? '<button class="nested-table-expand" type="button" data-table-expand data-tree-expand data-component-reference="C-04" aria-label="' + (definition.expanded ? "收起 " : "展开 ") + definition.name + '" aria-expanded="' + definition.expanded + '">' + arrow + "</button>"
        : '<span class="nested-table-expand-placeholder" aria-hidden="true"></span>';
      var tags = Array.from({ length: definition.tagCount }).map(function () {
        return tagSpec({ type: "property", text: "Tag", color: definition.neutralTags ? "neutral" : "blue" });
      }).join("");
      return '<tr data-table-data-row data-table-tree-row data-tree-key="' + definition.key + '"' + (definition.parent ? ' data-tree-parent="' + definition.parent + '"' : "") + ' data-tree-depth="' + definition.depth + '" data-sort-organization="' + definition.name + '"><td><span class="nested-table-organization" style="--tree-depth:' + definition.depth + '">' + toggle + '<span>' + definition.name + '</span></span></td><td><span class="nested-table-tags">' + tags + '</span></td><td>Text</td><td><span class="nested-table-status ' + definition.statusClass + '"><i aria-hidden="true"></i><span>' + definition.status + '</span></span></td><td>' + tableRowActions({ more: opts.more !== false }) + "</td></tr>";
    }).join("");
    return '<div class="source-table-spec nested-table-spec is-' + (opts.density || "standard") + ' is-tree-table" data-table-demo><table><colgroup><col class="nested-col-organization"><col class="nested-col-type"><col class="nested-col-head"><col class="nested-col-status"><col class="nested-col-actions"></colgroup><thead><tr><th>Organization</th><th>Type</th><th>Head</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + body + '</tbody></table><span class="table-live" data-table-live aria-live="polite"></span></div>';
  }

  function sourceTableSpec(options) {
    var opts = options || {};
    if (opts.nested) return nestedHierarchyTableSpec(opts);
    var rows = opts.rows || ["Cosmos Corporation", "Galaxy sector", "Asteroid Department"];
    var treeMode = Boolean(opts.tree && opts.expand);
    var triangleArrow = '<svg class="table-expand-triangle" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 3.5 11 8 5 12.5Z"></path></svg>';
    function compactSelection(label, attributes) {
      return checkboxOption("", "unchecked", {
        dynamic: true,
        compact: true,
        className: "table-selection",
        rootAttrs: 'data-component-reference="C-11"',
        dataAttrs: attributes + ' aria-label="' + label + '"'
      });
    }
    var rowDefinitions = treeMode
      ? [
          { name: "Cosmos Corporation", key: "cosmos", depth: 0, hasChildren: true, expanded: true },
          { name: "Galaxy sector", key: "galaxy", parent: "cosmos", depth: 1 },
          { name: "Asteroid Department", key: "asteroid", parent: "cosmos", depth: 1 }
        ]
      : rows.map(function (name) { return { name: name }; });
    var body = rowDefinitions.map(function (definition, index) {
      var name = definition.name;
      var type = tagSpec({ type: "property", text: index === 1 ? "External" : "Tag", color: "blue" });
      var status = index === 0
        ? tagSpec({ type: "status", text: "Done", color: "green", icon: "check" })
        : index === 1
          ? tagSpec({ type: "status", text: "In progress", color: "orange", icon: "schedule" })
          : tagSpec({ type: "status", text: "Terminated", color: "neutral", icon: "circle" });
      var operation = tableRowActions({ more: Boolean(opts.more) });
      var treeAttributes = treeMode
        ? ' data-table-tree-row data-tree-key="' + definition.key + '"' + (definition.parent ? ' data-tree-parent="' + definition.parent + '"' : "") + ' data-tree-depth="' + definition.depth + '"'
        : "";
      var expandControl = "";
      if (treeMode) {
        expandControl = definition.hasChildren
          ? '<button class="table-expand is-tree-expand" type="button" data-table-expand data-tree-expand data-component-reference="C-04" aria-label="收起 ' + name + '" aria-expanded="' + definition.expanded + '">' + triangleArrow + "</button>"
          : '<span class="table-expand-placeholder" aria-hidden="true"></span>';
      } else if (opts.expand) {
        expandControl = index === 0
          ? '<button class="table-expand" type="button" data-table-expand data-component-reference="C-04" aria-label="展开 ' + name + '" aria-expanded="false">' + triangleArrow + "</button>"
          : '<span class="table-expand-placeholder" aria-hidden="true"></span>';
      } else {
        expandControl = compactSelection("选择 " + name, "data-demo-row-select");
      }
      var organization = treeMode
        ? '<span class="table-tree-label" style="--tree-depth:' + definition.depth + '">' + name + "</span>"
        : opts.tree
          ? '<span class="table-tree-label" style="--tree-depth:' + index + '">' + (index ? icon("subdirectory_arrow_right") : "") + name + "</span>"
          : name;
      var genericExpandedRow = !treeMode && opts.expand && index === 0
        ? '<tr class="table-expanded-row" hidden><td class="table-expanded-control"></td><td colspan="6"><div class="table-expanded-content"><header><strong>Universe Design System</strong><span>Organization detail</span></header><div class="table-expanded-detail-grid"><span><small>Head</small>Text content</span><span><small>Status</small>Active</span><span><small>Quantity</small>10,000</span></div></div></td></tr>'
        : "";
      return '<tr data-table-data-row data-table-original-index="' + index + '"' + treeAttributes + ' data-sort-organization="' + name + '" data-sort-type="' + (index === 1 ? "External" : "Tag") + '" data-sort-status="' + ["Done", "In progress", "Terminated"][index] + '" data-sort-quantity="' + (10000 * (index + 1)) + '"' + (index === 1 && opts.selected ? ' class="is-selected"' : "") + '><td class="' + (opts.expand ? "table-expand-cell" : "table-selection-cell") + '">' + expandControl + "</td><td>" + organization + "</td><td>" + type + "</td><td>Text content</td><td>" + status + "</td><td>" + (10000 * (index + 1)).toLocaleString() + "</td><td>" + operation + "</td></tr>" + genericExpandedRow;
    }).join("");
    var quantitySort = tableSortButton("Quantity", "quantity");
    var headSelection = opts.expand ? "" : compactSelection("全选当前表格", "data-demo-select-all");
    var colgroup = '<colgroup><col class="table-col-control"><col class="table-col-organization"><col class="table-col-type"><col class="table-col-head"><col class="table-col-status"><col class="table-col-quantity"><col class="table-col-actions"></colgroup>';
    var standardHead = '<tr><th class="' + (opts.expand ? "table-expand-cell" : "table-selection-cell") + '">' + headSelection + '</th><th>Organization</th><th>' + tableFilterDropdown("Type", "type", ["Tag", "External"]) + '</th><th>Head</th><th>' + tableFilterDropdown("Status", "status", ["Done", "In progress", "Terminated"]) + '</th><th aria-sort="none">' + quantitySort + "</th><th>Actions</th></tr>";
    var groupedHead = '<tr class="table-group-head"><th class="table-selection-cell" scope="col" rowspan="2">' + headSelection + '</th><th scope="col" rowspan="2">Organization</th><th class="table-group-title" scope="colgroup" colspan="2">Personnel information</th><th class="table-group-title" scope="colgroup" colspan="2">Business data</th><th scope="col" rowspan="2">Actions</th></tr><tr class="table-sub-head"><th scope="col">' + tableFilterDropdown("Type", "type", ["Tag", "External"]) + '</th><th scope="col">Head</th><th scope="col">' + tableFilterDropdown("Status", "status", ["Done", "In progress", "Terminated"]) + '</th><th scope="col" aria-sort="none">' + quantitySort + "</th></tr>";
    var tableRoot = '<div class="source-table-spec is-' + (opts.density || "standard") + (opts.bordered ? " is-bordered" : "") + (opts.groupedHead ? " has-grouped-head" : "") + (treeMode ? " is-tree-table" : "") + (opts.fixedColumns ? " has-fixed-columns" : "") + '" data-table-demo' + (opts.fixedColumns ? " data-table-fixed-scroll" : "") + '><table>' + colgroup + "<thead>" + (opts.groupedHead ? groupedHead : standardHead) + "</thead><tbody>" + body + (opts.summary ? '<tr class="table-summary"><td colspan="5">Total</td><td>60,000</td><td></td></tr>' : "") + '</tbody></table><span class="table-live" data-table-live aria-live="polite"></span></div>';
    return opts.fixedColumns
      ? '<div class="table-fixed-viewport" data-table-fixed-viewport>' + tableRoot + '<i class="table-fixed-column-shadow is-left" aria-hidden="true"></i><i class="table-fixed-column-shadow is-right" aria-hidden="true"></i></div>'
      : tableRoot;
  }

  var tabsSpecCounter = 0;

  function tabsSpec(options) {
    var opts = options || {};
    var labels = opts.labels || ["Tab 1", "Tab 2", "Tab 3", "Tab 4", "Tab 5", "Tab 6"];
    var selectedIndex = opts.selected || 0;
    var tabsId = "source-tabs-" + (++tabsSpecCounter);
    var panelId = tabsId + "-panel";
    var tabs = labels.map(function (label, index) {
      var selected = index === selectedIndex;
      return '<button id="' + tabsId + "-tab-" + index + '" type="button" role="tab" aria-controls="' + panelId + '" aria-selected="' + selected + '" tabindex="' + (selected ? "0" : "-1") + '" class="' + (selected ? "is-active" : "") + '"' + (opts.disabled === index ? ' disabled aria-disabled="true"' : "") + '><span class="source-tab-label">' + label + "</span>" + (opts.badge && index === 1 ? badgeSpec({ type: "dot", size: 8 }) : "") + (opts.closable ? '<i data-tab-close aria-label="关闭 ' + label + '">' + icon("close") + "</i>" : "") + "</button>";
    }).join("");
    var previous = opts.scroll ? '<button class="tabs-scroll" type="button" data-tabs-scroll="-1" aria-label="向前滚动标签页">' + icon("chevron_left") + "</button>" : "";
    var next = opts.scroll ? '<button class="tabs-scroll" type="button" data-tabs-scroll="1" aria-label="向后滚动标签页">' + icon("chevron_right") + "</button>" : "";
    var more = opts.more ? '<div class="tabs-more" data-tabs-more><button type="button" data-tabs-more-trigger aria-haspopup="menu" aria-expanded="false">More ' + icon("expand_more") + '</button><div role="menu"><button type="button" role="menuitem" data-tabs-overflow-tab>Tab 7</button><button type="button" role="menuitem" data-tabs-overflow-tab>Tab 8</button><button type="button" role="menuitem" data-tabs-overflow-tab>Long tab title</button></div></div>' : "";
    var add = opts.addable ? '<button class="tabs-add" type="button" data-tab-add aria-label="新增标签页">' + icon("add") + "</button>" : "";
    var panel = opts.panel === false ? "" : '<div id="' + panelId + '" class="source-tab-panel" role="tabpanel" tabindex="0" aria-labelledby="' + tabsId + "-tab-" + selectedIndex + '"><span>Content of ' + labels[selectedIndex] + "</span></div>";
    return '<div id="' + tabsId + '" class="source-tabs is-' + (opts.type || "line") + ' is-' + (opts.size || "medium") + '" data-source-tabs><div class="source-tabs-list" role="tablist" aria-orientation="horizontal">' + previous + '<div class="source-tabs-scroll">' + tabs + '<i class="source-tabs-indicator" aria-hidden="true"></i></div>' + more + add + next + "</div>" + panel + "</div>";
  }

  function tagSpec(options) {
    var opts = options || {};
    var text = opts.text || "Tag";
    var type = opts.type || (opts.avatar ? "avatar" : "property");
    var size = opts.size || "medium";
    var disabled = opts.disabled || opts.state === "disabled";
    var checkable = Boolean(opts.checkable);
    var checked = checkable && opts.checked !== false;
    var rootTag = checkable ? "button" : "span";
    var classes = "source-tag is-" + type + " is-" + (opts.color || "neutral") + " is-" + size
      + (opts.solid ? " is-solid" : "")
      + (opts.bordered ? " is-bordered" : "")
      + (opts.loading ? " is-loading" : "")
      + (checked ? " is-checked" : "")
      + (opts.state ? " is-" + opts.state : "");
    var rootAttrs = checkable
      ? ' type="button" data-source-tag-check aria-pressed="' + checked + '"' + (disabled || opts.loading ? " disabled" : "")
      : (disabled ? ' aria-disabled="true"' : "");
    var leading = opts.loading
      ? icon("progress_activity", "tag-spinner")
      : opts.avatar
        ? avatarSpec({ text: opts.avatar, size: size === "large" ? 24 : size === "extra-small" ? 14 : 20 })
        : opts.icon
          ? icon(opts.icon, "tag-leading-icon")
          : "";
    var checkIndicator = checkable ? icon("check", "tag-check-indicator") : "";
    var close = opts.closable
      ? '<button type="button" data-source-tag-close aria-label="移除 ' + text + '"' + (disabled ? " disabled" : "") + '>' + icon("close") + "</button>"
      : "";
    return "<" + rootTag + ' class="' + classes + '" data-component-reference="C-42"' + rootAttrs + ">" + checkIndicator + leading + '<span class="source-tag-label">' + text + "</span>" + close + "</" + rootTag + ">";
  }

  function timelineSpec(options) {
    var opts = options || {};
    var items = opts.items || [{ title: "Event node" }, { title: "Event node" }, { title: "Event node" }];

    function timelineStateIcon(state) {
      var svgStart = '<svg class="timeline-state-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">';
      if (state === "done" || state === "success") {
        return svgStart + '<path d="M2.35 6.15 4.75 8.4 9.65 3.55" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      if (state === "current" || state === "waiting") {
        return svgStart + '<path d="M6 2.25V6h3.15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      if (state === "warning") {
        return svgStart + '<path d="M6 2.35v4.4M6 9.15v.05" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
      }
      if (state === "error") {
        return svgStart + '<path d="m3.15 3.15 5.7 5.7m0-5.7-5.7 5.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
      }
      return "";
    }

    var content = items.map(function (item, index) {
      var state = item.state || "default";
      var collapsed = Boolean(opts.collapsible && index > 1);
      var nodeIcon = item.icon ? icon(item.icon) : timelineStateIcon(state);
      var nodeMode = item.dot ? "dot" : state === "default" && !item.icon ? "dot" : "icon";
      var itemTime = item.time === false ? "" : (item.time || "2020-12-24");
      var title = item.title === false ? "" : '<strong>' + item.title + "</strong>";
      var tag = item.tag ? tagSpec({ text: item.tag, color: "blue" }) : "";
      var avatars = item.avatars ? '<span class="timeline-avatar-group">' + item.avatars.map(function (avatar) {
        return avatarSpec({ text: avatar, size: 20, as: "span" });
      }).join("") + (item.avatarOverflow ? '<span class="timeline-avatar-overflow">+' + item.avatarOverflow + "</span>" : "") + "</span>" : "";
      var person = item.person ? '<span class="timeline-person">' + avatarSpec({ text: item.person.slice(0, 1), size: 20, as: "span" }) + "<span>" + item.person + "</span></span>" : "";
      var description = '<span class="timeline-description">' + (item.description === false ? "" : item.description || "Description information") + "</span>";
      var standardContent =
        '<span class="timeline-title">' + title + tag + "</span>" +
        avatars +
        person +
        (itemTime ? '<time datetime="' + (item.datetime || itemTime) + '">' + (item.timePrefix === false ? "" : "Date: ") + itemTime + "</time>" : "") +
        description;
      var inlineContent = person + tag + description;
      return '<li class="is-' + state + " is-" + nodeMode + "-node" + (item.inline ? " is-inline" : "") + (collapsed ? " is-collapsed-item" : "") + '" style="--timeline-index:' + index + '"' + (collapsed ? ' data-timeline-hidden="true" aria-hidden="true"' : "") + '>' +
        '<span class="timeline-dot" aria-hidden="true">' + nodeIcon + "</span>" +
        '<div class="timeline-content">' +
          (item.inline ? inlineContent : standardContent) +
        "</div>" +
      "</li>";
    }).join("");
    var collapse = opts.collapsible
      ? '<li class="timeline-collapse-item"><button type="button" data-timeline-collapse-trigger aria-expanded="false"><span data-timeline-collapse-label>展开更多 ' + Math.max(items.length - 2, 0) + " 项</span>" + icon("expand_more") + "</button></li>"
      : "";
    return '<ol class="source-timeline-spec is-' + (opts.layout || "right") + ' is-' + (opts.spacing || "medium") + (opts.breakpoint ? " is-breakpoint" : "") + '"' + (opts.collapsible ? ' data-timeline-collapse data-collapsed-count="' + Math.max(items.length - 2, 0) + '"' : "") + ' aria-label="' + (opts.label || "时间轴") + '">' + content + collapse + '<li class="timeline-live" aria-live="polite"></li></ol>';
  }

  function tooltipSpec(options) {
    var opts = options || {};
    var position = opts.position || "top";
    var trigger = opts.trigger || '<button class="b2b-button" type="button">Hover me</button>';
    var text = opts.text || "Tooltip";
    D.tooltipSpecId = (D.tooltipSpecId || 0) + 1;
    var tooltipId = "source-tooltip-" + D.tooltipSpecId;
    var hasFocusableTrigger = /^<(button|a|input|select|textarea)\b/i.test(trigger) || /\btabindex\s*=/.test(trigger);
    var describedTrigger = hasFocusableTrigger
      ? trigger.replace(/^<([a-z][\w-]*)/i, '<$1 aria-describedby="' + tooltipId + '"')
      : trigger;
    var rootA11y = hasFocusableTrigger ? "" : ' tabindex="0" aria-describedby="' + tooltipId + '"';
    return '<div class="source-tooltip-spec is-' + position + (opts.multiline ? " is-multiline" : "") + (opts.max ? " is-max" : "") + '" data-source-tooltip data-tooltip-placement="' + position + '" data-tooltip-preferred-placement="' + position + '"' + rootA11y + '><span class="tooltip-trigger-demo">' + describedTrigger + '</span><span id="' + tooltipId + '" class="source-tooltip" role="tooltip" aria-hidden="true" data-source-tooltip-surface>' + text + '<i aria-hidden="true"></i></span></div>';
  }

  function dialogSpec(options) {
    var opts = options || {};
    var stateIcon = opts.kind ? dialogStatusIcon(opts.kind) : "";
    var body = opts.body || "This is the title description information";
    var cancelButton = opts.cancel === "" ? "" : button(opts.cancel || "Cancel", "", 'type="button" data-component-reference="C-02" data-source-dialog-action="cancel"' + (opts.cancelAttrs ? " " + opts.cancelAttrs : ""));
    var alternativeButton = opts.third ? button(opts.third, "", 'type="button" data-component-reference="C-02" data-source-dialog-action="alternative"') : "";
    var confirmButton = opts.confirm === "" ? "" : button(opts.confirm || "Confirm", opts.danger ? "is-danger-solid" : "is-primary", 'type="button" data-component-reference="C-02" data-source-dialog-action="confirm"' + (opts.confirmAttrs ? " " + opts.confirmAttrs : ""));
    var defaultFooter = cancelButton + alternativeButton + confirmButton;
    var footer = opts.footer === false ? "" : '<footer>' + (opts.footerHtml === undefined ? defaultFooter : opts.footerHtml) + "</footer>";
    var dialogForm = '<div class="dialog-composed-form"><div class="dialog-composed-field"><strong>名称</strong>' + componentReference("C-21", inputSpec({ placeholder: "请输入名称", size: "medium" })) + '</div><div class="dialog-composed-field"><strong>说明</strong>' + componentReference("C-21", textareaSpec({ counter: false })) + "</div></div>";
    var dialogList = '<div class="dialog-demo-list">' + [1, 2, 3, 4].map(function (index) {
      return componentReference("C-11", checkboxOption("File name " + index + ".zip", index === 2 ? "checked" : "unchecked", {
        leading: '<span class="dialog-file-icon">' + icon("folder_zip") + "</span>",
        rootAttrs: 'data-dialog-file-choice="' + index + '"'
      }));
    }).join("") + "</div>";
    var defaultMain = opts.form ? dialogForm : '<p>' + body + "</p>";
    var main = opts.bodyHtml === undefined ? defaultMain + (opts.list ? dialogList : "") : opts.bodyHtml;
    var closeButton = opts.closable === false ? "" : button("", "is-icon is-subtle is-h28 dialog-close-button", 'type="button" aria-label="关闭" data-component-reference="C-04" data-source-dialog-action="close"', "close");
    return '<div class="dialog-stage' + (opts.mask === false ? " is-no-mask" : "") + (opts.stageClass ? " " + opts.stageClass : "") + '"><section class="dialog-spec source-dialog is-' + (opts.size || "small") + (opts.kind ? " is-" + opts.kind : "") + (opts.scroll ? " is-scroll" : "") + (opts.className ? " " + opts.className : "") + '" role="dialog" aria-modal="false" aria-label="' + (opts.title || "I am the title") + '"' + (opts.attrs ? " " + opts.attrs : "") + '><header><span>' + stateIcon + '<span><strong>' + (opts.title || "I am the title") + '</strong>' + (opts.description ? '<small>' + opts.description + "</small>" : "") + "</span></span>" + closeButton + '</header><main' + (opts.mainClass ? ' class="' + opts.mainClass + '"' : "") + ">" + main + "</main>" + footer + '<span class="sr-only" data-source-dialog-status aria-live="polite"></span></section></div>';
  }

  function sourceDialogShell(options) {
    var opts = options || {};
    var uid = "source-dialog-shell-" + (++dialogSequence);
    var variant = opts.variant || "confirmation";
    var tone = { confirmation: "info", notification: "info", success: "success", warning: "warning", error: "error", destructive: "warning" }[variant] || "";
    var title = safeText(opts.title || "Dialog");
    var description = safeText(opts.description || "");
    var body = safeText(opts.body || "");
    var describedBy = body ? uid + "-body" : (description ? uid + "-description" : "");
    var classes = ["source-native-dialog", "source-dialog-composed", "is-" + (opts.size || "small"), tone ? "is-" + tone : "", variant === "destructive" ? "is-destructive" : "", opts.placement === "top" ? "is-top" : "", opts.scrollable ? "is-scroll" : ""].filter(Boolean).join(" ");
    var statusIcon = tone ? dialogStatusIcon(tone) : "";
    var subtitle = description ? '<small id="' + uid + '-description">' + description + "</small>" : "";
    var bodyCopy = body ? '<p id="' + uid + '-body">' + body + "</p>" : "";
    var footer = opts.hasFooter === false ? "" : '<footer><span data-dialog-cancel-slot></span><span data-dialog-alternative-slot></span><span data-dialog-confirm-slot></span></footer>';
    return '<dialog class="' + classes + '" aria-modal="true" aria-labelledby="' + uid + '-title"' + (describedBy ? ' aria-describedby="' + describedBy + '"' : "") + ' aria-busy="' + Boolean(opts.confirmLoading) + '"><section><header><span>' + statusIcon + '<span><strong id="' + uid + '-title">' + title + "</strong>" + subtitle + '</span></span><span data-dialog-close-slot></span></header><main>' + bodyCopy + '<div data-dialog-content-slot></div></main>' + footer + "</section></dialog>";

    function safeText(value) {
      return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
    }
  }

  function drawerSpec(options) {
    var opts = options || {};
    var modern = opts.rebuilt === true;
    var mode = opts.mode || "overlay";
    var modal = opts.modal === undefined ? mode !== "push" : opts.modal;
    var entries = opts.headerActions || (opts.operations ? [{ id: "edit", label: "编辑" }, { id: "share", label: "分享" }, { id: "copy", label: "复制链接" }, { id: "delete", label: "删除" }] : []);
    var tabs = Array.isArray(opts.tabs) ? opts.tabs : opts.tabs ? [1,2,3,4,5].map(function (n) { return { id: "tab-"+n, label: "标签 "+n, content: "标签 "+n+" 的内容" }; }) : [];
    var fields = opts.fields || (opts.form ? [1,2,3,4,5,6].map(function(n){ return { id:"field-"+n, label:"字段 "+n, value:"", placeholder:"请输入" }; }) : []);
    var title = opts.title || "抽屉标题";
    var footer = opts.actions === false ? "" : '<footer class="is-' + (opts.align || "right") + '">' + (opts.secondary === "" ? "" : button(opts.secondary || "取消", "", 'data-drawer-action="secondary"')) + button(opts.primary || "确认", "is-primary", 'data-drawer-action="primary"') + '</footer>';
    var operation = function(item) { return item.icon ? sourceIconButton({icon:item.icon,label:item.label,size:28,tooltip:false,attrs:'data-drawer-header-action="'+item.id+'"'}) : button(item.label, "is-text", 'type="button" data-drawer-header-action="'+item.id+'"'); };
    var shown = entries.length > 3 ? entries.slice(0,2) : entries;
    var overflow = entries.length > 3 ? entries.slice(2) : [];
    var operations = entries.length ? '<nav class="drawer-header-actions" aria-label="抽屉操作">'+shown.map(operation).join("")+(overflow.length ? '<div class="drawer-more"><button class="b2b-button is-text" type="button" data-drawer-more-trigger aria-haspopup="menu" aria-expanded="false">更多'+icon("expand_more")+'</button><div class="drawer-menu" role="menu" hidden>'+overflow.map(function(item){return '<button type="button" role="menuitem" data-drawer-header-action="'+item.id+'">'+item.label+'</button>';}).join("")+'</div></div>':"")+'</nav>' : "";
    var navigation = tabs.length ? '<div class="drawer-tabs-host" data-drawer-tabs-host></div>' : '';
    var content = (opts.body ? '<p class="drawer-body-text">'+opts.body+'</p>' : "") + (fields.length ? '<div class="drawer-form-demo">'+fields.map(function(field){return '<label class="field"><span class="field-label">'+field.label+'</span>'+input(field.value||"", "", 'data-drawer-field="'+field.id+'" placeholder="'+(field.placeholder||"请输入")+'"')+'</label>';}).join("")+'</div>':"") + (tabs.length ? '<div class="drawer-panels-host" data-drawer-panels-host></div>' : '');
    return '<div class="source-drawer-stage is-'+mode+(modern?' is-rebuilt':'')+(modal?' is-modal':' is-nonmodal')+'"><div class="drawer-parent"><header>当前页面</header><main><strong>项目工作台</strong><p>在此查看项目进度，抽屉关闭后继续当前任务。</p>'+button("打开抽屉", "is-primary", 'type="button" data-drawer-open')+'</main></div><aside class="drawer-spec source-drawer is-'+(opts.size||"small")+(modern?' is-entering':'')+'" role="dialog"'+(modal?' aria-modal="true"':'')+' aria-label="'+title+'" tabindex="-1"><header><div class="drawer-heading">'+((opts.avatarText||opts.avatar)?avatarSpec({text:opts.avatarText||"A",size:40,as:"span",label:opts.avatarText||"头像"}):"")+'<div class="drawer-title-content"><div class="drawer-title-line"><strong>'+title+'</strong>'+((opts.tagText||opts.tag)?tagSpec({text:opts.tagText||"进行中",color:"blue",size:"extra-small"}):"")+'</div>'+(opts.description?'<small title="'+opts.description+'">'+opts.description+'</small>':"")+'</div></div><div class="drawer-header-controls">'+operations+(opts.closable===false?'':'<button type="button" class="drawer-close" data-drawer-close aria-label="关闭">'+icon("close")+'</button>')+'</div>'+navigation+'</header><main>'+content+'</main>'+footer+'</aside></div>';
  }

  // C-46 owns the slide lifecycle; C-41 owns tabs and their panels.
  function bindDrawer(root, props, emit) {
    var drawer = root.querySelector('.source-drawer'), previous = document.activeElement;
    var timer, frame, disposed = false, closed = false, generation = 0, tabsInstance = null;
    var tabsHost = root.querySelector('[data-drawer-tabs-host]');
    if (tabsHost) {
      var tabsApi = window.B2B.components.tabs;
      tabsApi.describe();
      tabsInstance = tabsApi.create({variant:'line',size:'medium',panelContainer:root.querySelector('[data-drawer-panels-host]'),activation:'automatic',scrollable:false,overflowItems:[],addable:false,ariaLabel:props.title+'内容',activeId:props.activeTabId || props.tabs[0].id,items:props.tabs.map(function(item){
        var content=document.createElement('p');content.className='drawer-body-text';content.textContent=item.content || '';
        return {id:item.id,label:item.label,content:content};
      })}).mount(tabsHost);
    }
    function tabChanged(e){emit('b2b:drawer-tab-change',{id:e.detail.activeId});}
    if(tabsHost)tabsHost.addEventListener('b2b:tabs-change',tabChanged);
    function duration(){var style=getComputedStyle(drawer);return Math.max.apply(null,style.transitionDuration.split(',').map(function(v){return parseFloat(v)*(v.trim().endsWith('ms')?1:1000);})) || 0;}
    function open(){
      generation++;var ticket=generation;closed=false;clearTimeout(timer);cancelAnimationFrame(frame);
      drawer.hidden=false;drawer.inert=false;root.classList.remove('is-closed','is-closing');drawer.classList.remove('is-dismissing','is-open');drawer.classList.add('is-entering');
      window.B2B.components.runtime.ensureStyles(['C-46-drawer/styles.css','C-10-color-picker/styles.css']).then(function(){
        if(disposed || closed || ticket!==generation)return;
        drawer.getBoundingClientRect();
        frame=requestAnimationFrame(function(){if(disposed || closed || ticket!==generation)return;drawer.classList.remove('is-entering');drawer.classList.add('is-open');if(props.modal)drawer.focus({preventScroll:true});});
      });
    }
    function menusOff(){ root.querySelectorAll('.drawer-menu').forEach(function(m){m.hidden=true;}); root.querySelectorAll('[data-drawer-more-trigger]').forEach(function(b){b.setAttribute('aria-expanded','false');}); }
    function menuOn(group){ menusOff(); group.querySelector('.drawer-menu').hidden=false; group.querySelector('[data-drawer-more-trigger]').setAttribute('aria-expanded','true'); }
    function close(source){
      if(closed)return;closed=true;generation++;cancelAnimationFrame(frame);menusOff();
      drawer.inert=true;drawer.classList.remove('is-entering','is-open');drawer.classList.add('is-dismissing');root.classList.add('is-closing');
      timer=setTimeout(function(){if(disposed)return;drawer.hidden=true;root.classList.remove('is-closing');root.classList.add('is-closed');
        var target=previous && previous.isConnected && previous!==document.body ? previous : root.querySelector('[data-drawer-open]');
        if(target)target.focus({preventScroll:true});emit('b2b:drawer-close',{variant:props.variant,source:source});
      },duration());
    }
    function click(e){
      var button=e.target.closest('button');
      if(button && button.hasAttribute('data-drawer-open')){previous=button;open();return;}
      if(closed)return;
      if(button && drawer.contains(button)) {
        if(button.hasAttribute('data-drawer-close'))close('close');
        else if(button.hasAttribute('data-drawer-action')){var source=button.dataset.drawerAction,values={};root.querySelectorAll('[data-drawer-field]').forEach(function(f){values[f.dataset.drawerField]=f.value;});emit('b2b:drawer-action',{id:source,source:'footer',values:values});close(source);}
        else if(button.hasAttribute('data-drawer-header-action')){emit('b2b:drawer-action',{id:button.dataset.drawerHeaderAction,source:'header'});menusOff();}
        else if(button.hasAttribute('data-drawer-more-trigger')){menuOn(button.closest('.drawer-more'));}
      } else if(!drawer.contains(e.target)) close('outside');
    }
    function over(e){ var group=e.target.closest('.drawer-more'); if(group && !group.contains(e.relatedTarget))menuOn(group); }
    function out(e){var group=e.target.closest('.drawer-more');if(group && !group.contains(e.relatedTarget))menusOff();}
    function key(e){
      if(e.key==='Escape'){var group=e.target.closest('.drawer-more');menusOff();if(group)group.querySelector('[data-drawer-more-trigger]').focus();return;}
      var menuGroup=e.target.closest('.drawer-more');
      if(menuGroup && ['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();menuOn(menuGroup);var options=Array.from(menuGroup.querySelectorAll('[role=menuitem]'));var index=options.indexOf(e.target);if(options.length)options[e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowUp'?-1:1)+options.length)%options.length].focus();return;}
      if(e.key==='Tab' && props.modal){var focusable=Array.from(drawer.querySelectorAll('button,input,[tabindex="0"]')).filter(function(el){return !el.disabled && el.getClientRects().length;});var first=focusable[0],last=focusable[focusable.length-1];if(!first){e.preventDefault();drawer.focus();}else if(e.shiftKey && (document.activeElement===first || document.activeElement===drawer)){e.preventDefault();last.focus();}else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}}
    }
    function pointer(e){if(props.modal && !closed && !drawer.contains(e.target)){e.preventDefault();drawer.focus({preventScroll:true});}}
    root.addEventListener('pointerdown',pointer);root.addEventListener('click',click);root.addEventListener('mouseover',over);root.addEventListener('mouseout',out);root.addEventListener('keydown',key);
    open();
    return function(){disposed=true;generation++;clearTimeout(timer);cancelAnimationFrame(frame);if(tabsHost)tabsHost.removeEventListener('b2b:tabs-change',tabChanged);if(tabsInstance)tabsInstance.destroy();root.removeEventListener('pointerdown',pointer);root.removeEventListener('click',click);root.removeEventListener('mouseover',over);root.removeEventListener('mouseout',out);root.removeEventListener('keydown',key);};
  }

  function loadingSpin(options) {
    var opts = options || {};
    var noText = opts.variant === "spinner-only" || opts.text === false;
    var semantics = opts.decorative ? ' aria-hidden="true"' : ' role="status"' + (noText ? ' aria-label="' + (opts.text || "加载中") + '"' : "");
    return '<div class="source-loading-spin is-' + (opts.size || "medium") + (opts.layout ? " is-" + opts.layout : "") + (opts.inverse ? " is-inverse" : "") + (opts.neutral ? " is-neutral" : "") + '" data-component-reference="C-47"' + semantics + '><i class="spinner" aria-hidden="true"></i>' + (noText ? "" : '<span>' + (opts.text || "Description Copy") + "</span>") + "</div>";
  }

  function loadingSkeleton(options) {
    var opts = options || {};
    return '<div class="source-loading-skeleton is-' + (opts.layout || "profile") + ' is-' + (opts.size || "medium") + '" role="status" aria-label="' + (opts.text || "加载中") + '">' + (opts.avatar !== false ? '<i class="skeleton-avatar" aria-hidden="true"></i>' : "") + '<div aria-hidden="true"><b></b><b></b><b></b></div>' + (opts.image ? '<i class="skeleton-image" aria-hidden="true"></i>' : "") + "</div>";
  }

  function sourceLoading(options) {
    var opts = options || {};
    if (opts.variant === "skeleton") return loadingSkeleton(opts);
    if (opts.variant === "overlay") {
      return '<div class="source-loading-overlay" role="status" aria-label="' + (opts.text || "加载中") + '"><div class="loading-table-lines" aria-hidden="true"><i></i><i></i><i></i></div><span>' + loadingSpin({ size: opts.size, text: opts.text, layout: opts.layout, decorative: true }) + "</span></div>";
    }
    return loadingSpin(opts);
  }

  function illustrationLoading(text) {
    return '<div class="source-illustration-loading" role="status"><span>' + icon("deployed_code") + icon("progress_activity") + '</span><p>' + (text || "Loading…") + "</p></div>";
  }

  function notificationSpec(options) {
    var opts = options || {};
    var kind = opts.kind || "info";
    var glyph = kind === "success" ? "check_circle" : kind === "warning" ? "error" : kind === "error" ? "cancel" : "info";
    var showIcon = opts.icon !== false && !opts.custom;
    var text = opts.text === undefined ? "This is a message, this is a message, this is a message, this is a message, this is a message." : opts.text;
    var title = opts.title === false ? "" : '<strong>' + (opts.title || "Message") + "</strong>";
    var body = text ? '<p>' + text + "</p>" : "";
    var customArea = opts.custom ? '<div class="notification-custom-area">The grey area is the content/action area</div>' : "";
    var actions = opts.primary ? '<footer>' + (opts.secondary ? button(opts.secondary) : "") + button(opts.primary, "is-primary") + "</footer>" : "";
    var surface = '<article class="notification-spec source-notification is-' + kind + (opts.custom ? " is-custom" : "") + (showIcon ? "" : " is-no-icon") + '" role="status" aria-live="polite">' + (showIcon ? icon(glyph) : "") + '<div>' + title + body + customArea + actions + '</div>' + (opts.closable === false ? "" : '<button class="notification-close" type="button" aria-label="关闭通知">' + icon("close") + "</button>") + "</article>";
    return opts.placement && opts.placement !== "inline"
      ? '<div class="source-notification-owner" data-notification-placement="' + opts.placement + '">' + surface + '</div>'
      : surface;
  }

  function alertSpec(options) {
    var opts = options || {};
    var kind = opts.kind || "info";
    var glyph = kind === "success" ? "check_circle" : kind === "warning" ? "error" : kind === "error" ? "cancel" : "info";
    var title = opts.title || "";
    var action = opts.action ? button(opts.action, "is-text", 'type="button"') : "";
    return '<div class="alert-spec source-alert is-' + kind + (opts.center ? " is-center" : "") + (opts.follow ? " is-follow" : "") + (title || opts.separate ? " is-stacked" : "") + (opts.closable === false ? "" : " has-close") + '" role="status">' + icon(opts.customIcon || glyph, "alert-status-icon is-filled") + '<div>' + (title ? '<strong>' + title + "</strong>" : "") + '<p' + (opts.center ? ' title="' + (opts.text || "") + '"' : "") + '>' + (opts.text !== undefined ? opts.text : "This is the text prompt information.") + (opts.link ? ' <a href="#rules">Text link</a>' : "") + "</p>" + (opts.separate && action ? '<footer>' + action + "</footer>" : action) + "</div>" + (opts.closable === false ? "" : '<button type="button" aria-label="关闭">' + icon("close") + "</button>") + "</div>";
  }

  function toastSpec(options) {
    var opts = options || {};
    var kind = opts.kind || "info";
    var glyph = kind === "success" ? "check_circle" : kind === "warning" ? "error" : kind === "error" ? "cancel" : kind === "loading" ? "progress_activity" : "info";
    return '<div class="toast-spec source-toast is-' + kind + (opts.multiline ? " is-multiline" : "") + '" role="status" aria-live="polite" data-source-toast>' +
      (opts.icon === false ? "" : icon(glyph, kind === "loading" ? "" : "is-filled")) +
      '<span data-source-toast-text>' + (opts.text || "This is a global prompt for a message") + (opts.link ? ' <a href="#rules">Text link</a>' : "") + "</span>" +
      (opts.action ? '<span data-source-toast-actions>' + button(opts.action, "is-text", 'type="button" data-source-toast-action="primary"') +
        (opts.secondAction ? button(opts.secondAction, "is-text", 'type="button" data-source-toast-action="secondary"') : "") + '</span>' : "") +
      (opts.closable ? '<button type="button" data-source-toast-close aria-label="关闭">' + icon("close") + "</button>" : "") +
      "</div>";
  }

  function sourceToast(options) {
    var opts = options || {};
    var variant = opts.variant || "information";
    var kind = variant === "information" ? "info" : variant;
    var markup = toastSpec({
      kind: kind,
      text: opts.text,
      action: opts.action,
      secondAction: opts.secondAction,
      closable: opts.closable,
      multiline: opts.multiline,
      icon: opts.icon
    });
    var placement = opts.placement || "inline";
    return placement === "inline" ? markup : '<div class="source-toast-owner" data-toast-placement="' + placement + '">' + markup + '</div>';
  }

  function progressLine(options) {
    var opts = options || {};
    var value = opts.value === undefined ? 50 : opts.value;
    return '<div class="source-progress-line is-' + (opts.state || "progress") + (opts.indeterminate ? " is-indeterminate" : "") + '" role="progressbar" aria-label="' + (opts.label || "Progress") + '" aria-valuemin="0" aria-valuemax="100"' + (opts.indeterminate ? "" : ' aria-valuenow="' + value + '"') + '><div><i style="--progress-value:' + value + '%"></i></div>' + (opts.valueLabel === false ? "" : '<span>' + value + "%</span>") + (opts.icon ? icon(opts.icon) : "") + "</div>";
  }

  function progressCircle(options) {
    var opts = options || {};
    var value = opts.value === undefined ? 75 : opts.value;
    return '<div class="source-progress-circle is-' + (opts.state || "progress") + (opts.valueSide === "right" ? " is-value-right" : "") + '" role="progressbar" aria-label="' + (opts.label || "Progress") + '" aria-valuenow="' + value + '" aria-valuemin="0" aria-valuemax="100">' + (opts.valueLabel === false ? "" : '<span>' + value + "%</span>") + '<i style="--progress-value:' + value + '"></i></div>';
  }

  function progressSteps(options) {
    var opts = options || {};
    var value = opts.value === undefined ? 60 : Number(opts.value);
    var steps = Number(opts.steps || 5);
    var complete = Math.ceil(value / 100 * steps);
    return '<div class="source-progress-steps is-' + (opts.state || "progress") + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + value + '" aria-label="' + (opts.label || "Progress") + '">' + Array.from({ length: steps }, function (_, index) { return '<i class="' + (index < complete ? "is-complete" : "") + '"></i>'; }).join("") + (opts.valueLabel === false ? "" : '<span>' + value + "%</span>") + "</div>";
  }

  function sourceProgress(options) {
    var opts = options || {};
    if (opts.variant === "circle") return progressCircle(opts);
    if (opts.variant === "steps") return progressSteps(opts);
    return progressLine(Object.assign({}, opts, { indeterminate: opts.variant === "indeterminate" }));
  }

  var buttonOverviewReferences = [
    { id: "C-02", label: "基础按钮", use: "触发立即动作，并通过主要、次要和危险样式表达操作层级。" },
    { id: "C-03", label: "文字按钮", use: "承载低优先级行动、紧凑跳转或文本内联链接。" },
    { id: "C-04", label: "图标按钮", use: "在空间受限且图标含义易识别时使用，并提供 Tooltip。" },
    { id: "C-05", label: "全圆角按钮", use: "仅用于产品活动、销售官网和社区运营等营销场景。" },
    { id: "C-06", label: "分裂 / 菜单按钮", use: "组合一个固定高频主操作与一组相关低频操作。" },
    { id: "C-07", label: "悬浮按钮", use: "固定于页面位置，承载最重要行动或快速定位。" }
  ];

  function buttonComponentSpecimen(id) {
    switch (id) {
      case "C-02":
        return '<div class="button-group">' + button("创建账号", "is-primary") + button("发起会议", "is-secondary-blue") + button("取消") + button("删除", "is-danger") + "</div>";
      case "C-03":
        return '<div class="button-group">' + button("查看全部", "is-text is-neutral").replace("</button>", icon("chevron_right") + "</button>") + button("创建群组", "is-text") + '<button class="b2b-link-button" type="button">前往设置</button></div>';
      case "C-04":
        return '<div class="button-group">' + iconTooltipButton("person", "个人", "is-subtle") + iconTooltipButton("check", "确认", "is-subtle") + iconTooltipButton("settings", "设置", "is-subtle") + "</div>";
      case "C-05":
        return '<div class="button-group">' + button("不感兴趣", "is-secondary-blue is-pill") + button("下载 System", "is-primary is-pill") + "</div>";
      case "C-06":
        return dropdown('<div class="split-button">' + button("创建日程", "is-primary") + popupButton("", "is-primary", 'data-popup-trigger aria-haspopup="menu" aria-expanded="false" aria-label="更多创建方式"') + "</div>", ["创建会议", "创建提醒", "创建任务"], "split-demo", false);
      case "C-07":
        return '<div class="overview-float-demo"><span></span><span></span><span></span><button class="floating-action" aria-label="返回顶部">' + icon("keyboard_double_arrow_up") + '</button><button class="floating-action is-primary" aria-label="新增">' + icon("add") + "</button></div>";
      default:
        return "";
    }
  }

  function buttonOverviewReference(reference) {
    var component = D.components.find(function (item) { return item.id === reference.id; });
    var name = component ? component.name : reference.label;
    return cell(reference.label, '<article class="button-overview-reference" data-component-reference="' + reference.id + '"><div class="button-overview-sample">' + buttonComponentSpecimen(reference.id) + '</div><div class="button-overview-copy"><strong>' + name + '</strong><p>' + reference.use + '</p><a class="b2b-button is-text" href="?component=' + reference.id + '#components">查看完整规范' + icon("chevron_right") + "</a></div></article>");
  }

  function specialStateButton(unselectedLabel, selectedLabel, selected, tone, iconName, selectedIcon, extraClass) {
    var currentLabel = selected ? selectedLabel : unselectedLabel;
    var currentIcon = selected && selectedIcon ? selectedIcon : iconName;
    return '<button class="b2b-button special-state-control ' + (extraClass || "") + (selected ? " is-selected" : "") + '" type="button" data-component-reference="C-02" data-special-toggle data-unselected-label="' + unselectedLabel + '" data-selected-label="' + selectedLabel + '" data-unselected-icon="' + (iconName || "") + '" data-selected-icon="' + (selectedIcon || iconName || "") + '" data-tone="' + (tone || "neutral") + '" aria-pressed="' + selected + '">' + (currentIcon ? icon(currentIcon, "special-state-icon") : "") + '<span data-special-label>' + currentLabel + "</span></button>";
  }

  function specialIconButton(label, selected, tone, iconName, selectedIcon) {
    var currentIcon = selected && selectedIcon ? selectedIcon : iconName;
    return '<button class="b2b-button is-icon is-subtle special-icon-control' + (selected ? " is-selected" : "") + '" type="button" data-component-reference="C-04" data-special-toggle data-unselected-label="' + label + '" data-selected-label="' + label + '" data-unselected-icon="' + iconName + '" data-selected-icon="' + (selectedIcon || iconName) + '" data-tone="' + (tone || "blue") + '" aria-label="' + label + '" aria-pressed="' + selected + '">' + icon(currentIcon, "special-state-icon") + "</button>";
  }

  function specialComparison(title, unselectedContent, selectedContent, className) {
    return '<article class="special-comparison ' + (className || "") + '"><h5>' + title + '</h5><div class="special-comparison-board"><section><strong>未选中</strong>' + unselectedContent + '</section><section><strong>已选态</strong>' + selectedContent + "</section></div></article>";
  }

  // Source layout slots; only C-01 opts in. Child anatomy is owned by its Renderer.
  function buttonSceneMedia(options, key, fallback) {
    return options && options.mediaSlots ? '<span class="c01-scene-media" data-c01-scene-media="' + key + '" aria-busy="true"></span>' : fallback;
  }

  function subscriptionCard(selected, calendar, options) {
    return '<div class="subscription-card">' + buttonSceneMedia(options, calendar ? "subscription-person" : "subscription-brand", avatarSpec({ text: calendar ? "李" : "S", size: 40, label: calendar ? "李天天" : "System", color: calendar ? "var(--b2b-color-action-primary)" : "#111" })) + '<span class="subscription-copy"><b>' + (calendar ? "李天天" : "System") + '</b><small>' + (calendar ? "System Design · 基础体验" : "System 团队共同维护的设计规范与组件库") + '</small></span>' + specialStateButton(calendar ? "订阅" : "+ 关注", calendar ? "退订" : "取消关注", selected, "neutral", "", "", "is-follow is-secondary-blue") + "</div>";
  }

  function meetingList(selected, options) {
    return '<div class="special-meeting-example"><small class="meeting-status">正在进行</small><div class="special-meeting-list"><div><span class="meeting-glyph">' + icon("video_camera_front") + '</span><span><b>对一下官网需求 ' + buttonSceneMedia(options, "meeting-tag", '<em>外部</em>') + '</b><small>14:02 ｜ ID: 345 789 834' + (options && options.mediaSlots ? '<span class="c01-meeting-record" aria-label="会议纪要">' + icon("description") + '</span>' : '') + '</small></span>' + specialStateButton("加入", "已加入", selected, "green") + '</div><div><span class="meeting-glyph">' + icon("video_camera_front") + '</span><span><b>分组讨论需求-例会</b><small>02:43 ｜ ID: 245 345 126</small></span>' + specialStateButton("加入", "已加入", selected, "green") + "</div></div></div>";
  }

  function shareToolbar(selected, options) {
    return '<div class="special-share-shell"><div class="special-top-toolbar">' + button("高级权限", "", "", "admin_panel_settings") + button("自动化", "", "", "smart_toy") + specialIconButton("通知", false, "blue", "notifications") + specialIconButton("更多", false, "blue", "more_horiz") + (options && options.mediaSlots ? '<span class="c01-scene-divider" aria-hidden="true"></span>' : "") + specialIconButton("搜索", false, "blue", "search") + specialIconButton("新建", false, "blue", "add") + buttonSceneMedia(options, "toolbar-person", avatarSpec({ text: "李", size: 32, label: "李天天" })) + '</div><div class="special-share-actions"><span class="color-wheel-dot"></span>' + button("全屏展示", "", "", "present_to_all") + specialStateButton("分享此仪表盘", "已开启分享", selected, "green", "lock", "link", "is-share") + "</div></div>";
  }

  function weakSelectionCards(selected, options) {
    return '<div class="weak-selection-stack">' +
      '<div class="mini-title-card">' + buttonSceneMedia(options, "document-back", '<span class="weak-leading-icon">' + icon("chevron_left") + '</span>') + '<span class="weak-title-main"><span class="weak-inline-title"><b>设计规范：Basic Button 普通按钮</b>' + specialIconButton("置顶", selected, "green", "keep", "keep") + '</span><small>' + icon("folder") + '我的空间 <i class="weak-divider"></i> 已保存到云端</small></span></div>' +
      '<div class="mini-feed-card"><div class="weak-feed-head">' + buttonSceneMedia(options, "feed-group", avatarSpec({ text: "组", size: 40, label: "产品问题反馈", color: "linear-gradient(135deg,#3370ff,#8756f3)" })) + '<span><b>当前小组是对群进行某种配置的产物，…</b><small>来自：<i>产品问题反馈</i></small></span><span class="weak-actions">' + specialIconButton("分享", false, "blue", "share") + specialIconButton("关注", selected, "blue", "bookmark_border", "bookmark") + specialIconButton("更多", false, "blue", "more_horiz") + '</span></div><div class="weak-feed-person">' + buttonSceneMedia(options, "feed-person", avatarSpec({ text: "梅", size: 40, label: "李梅", color: "var(--b2b-orange-500)" })) + '<span><b>李梅</b><small>4–6 17:56</small></span></div></div>' +
      '<div class="mini-contact-card"><div class="weak-contact-head">' + buttonSceneMedia(options, "contact-person", avatarSpec({ text: "孙", size: 56, label: "孙九九", color: "var(--b2b-cyan-500)" })) + '<span class="weak-contact-main"><span class="weak-contact-title"><b>孙九九</b>' + icon("lock", "is-danger") + specialIconButton("收藏", selected, "yellow", "star_border", "star") + '</span><small>' + buttonSceneMedia(options, "contact-tags", '<i class="weak-tag is-gold">内推</i><i class="weak-tag">BAT</i><i class="weak-tag">985</i>') + '</small></span><span class="weak-contact-actions">' + button("备注", "is-text is-neutral", "", "edit_note") + button("加入文件夹", "is-text is-neutral", "", "create_new_folder") + specialIconButton("更多", false, "blue", "more_horiz") + '</span></div><div class="weak-contact-meta"><span>' + icon("call") + '+86 136–5656–7878</span><i></i><span>' + icon("mail") + '13656567878@163.com</span></div></div>' +
      '</div>';
  }

  function richTextToolbar(selected) {
    return '<div class="rich-text-toolbar"><span class="rich-tool-cell">' + specialIconButton("格式刷", false, "blue", "format_paint") + '</span><span class="rich-tool-field is-style">常规 ' + icon("expand_more") + '</span><span class="rich-tool-field is-size">10 ' + icon("expand_more") + '</span><span class="rich-tool-actions">' + specialIconButton("加粗", selected, "blue", "format_bold") + '<span class="rich-tool-combo">' + specialIconButton("文字颜色", false, "blue", "format_color_text") + icon("expand_more") + '</span><span class="rich-tool-combo">' + specialIconButton("高亮", false, "yellow", "format_color_fill") + icon("expand_more") + '</span>' + specialIconButton("对齐", false, "blue", "format_align_left") + specialIconButton("筛选", false, "blue", "filter_alt") + "</span></div>";
  }

  function meetingInvite(selected, rejected) {
    return '<div class="meeting-invite"><header>' + icon("calendar_month") + '<span><b>设计评审周会</b><small>林晓雪邀请你加入一个日程</small></span></header><p>' + icon("schedule") + '7月22日（明天）10:30 – 12:00 (GMT+8)</p><p>' + icon("location_on") + 'F1–01, San Francisco</p><a href="#components">' + icon("format_list_bulleted") + '查看更多</a><footer>' + specialStateButton("接受", "已接受", selected && !rejected, "green", "", "", "is-calendar-action") + specialStateButton("拒绝", "已拒绝", selected && rejected, "red", "", "", "is-calendar-action") + button("待定") + '</footer></div>';
  }

  function filterToolbar(selected) {
    return '<div class="filter-example"><div class="filter-actions">' + button("字段配置", "is-text is-neutral", "", "settings") + specialStateButton("筛选", "1 筛选", selected, "blue", "filter_alt", "filter_alt", "is-filter is-text is-neutral") + button("分组", "is-text is-neutral", "", "view_list") + button("排序", "is-text is-neutral", "", "sort_by_alpha") + '</div><span></span></div>';
  }

  function buttonSpecialTypes(options) {
    var strongScenes = specialComparison("订阅 / 关注", subscriptionCard(false, false, options) + subscriptionCard(false, true, options), subscriptionCard(true, false, options) + subscriptionCard(true, true, options), "is-subscription");
    var equalScenes = specialComparison("会议列表功能", meetingList(false, options), meetingList(true, options), "is-meeting") + specialComparison("多维表格分享", shareToolbar(false, options), shareToolbar(true, options), "is-share");
    var weakScenes = specialComparison("关注 / 收藏 / 置顶", weakSelectionCards(false, options), weakSelectionCards(true, options), "is-weak") + (options && options.richText === false ? "" : specialComparison("富文本工具栏", richTextToolbar(false), richTextToolbar(true), "is-rich-text")) + specialComparison("会议日程状态", meetingInvite(false, false), meetingInvite(true, false) + meetingInvite(true, true), "is-calendar") + specialComparison("表格筛选", filterToolbar(false), filterToolbar(true), "is-filter");
    return '<section class="button-special-types"><div class="special-types-intro"><p>在当前按钮类型上进行选中态变化视觉吸引力不足，也可以通过调整选中前后按钮文案，或根据下方常见规律调整增强选中前后的样式对比。</p><p>按钮交互细节（hover、pressed 等）遵循按钮生效前情况。</p></div><div class="special-types-list" aria-label="按钮特殊类型选用规则"><article class="special-type-block"><div class="special-type-summary"><div class="special-type-copy"><h4><i>1.</i> 选中前功能强引导，选中后状态弱展示</h4><blockquote>功能模块优先级较高，选中前需对用户进行强引导，选中后无需引导用户持续关注。</blockquote></div><div class="special-type-style"><strong>选用样式</strong><p><b>默认态：</b>按钮样式引导力强，通常为面性按钮。</p><p><b>已选状态：</b>使用视觉引导力弱化的按钮样式，通常为线性按钮。</p></div></div><div class="special-type-scenes"><strong>场景示例</strong>' + strongScenes + '</div></article><article class="special-type-block"><div class="special-type-summary"><div class="special-type-copy"><h4><i>2.</i> 选中前功能一般引导，选中后状态一般展示</h4><blockquote>功能入口多，选中前采用一般展示按钮样式。选中后仅作为状态展示告知用户。</blockquote></div><div class="special-type-style"><strong>选用样式</strong><p>默认态和选中态样式基本相同，仅进行文案调整。</p></div></div><div class="special-type-scenes"><strong>场景示例</strong>' + equalScenes + '</div></article><article class="special-type-block"><div class="special-type-summary"><div class="special-type-copy"><h4><i>3.</i> 选中前功能弱引导，选中后状态相对强展示</h4><blockquote>功能模块选项多且优先级比重相同，需用户对当前功能进行主观判断，可对该组按钮进行弱引导处理。选中后需反馈用户并引起关注。</blockquote></div><div class="special-type-style"><strong>选用样式</strong><p><b>默认态：</b>按钮视觉相对弱化，通常为灰色次级按钮或灰色图标按钮。</p></div></div><div class="special-type-scenes"><strong>场景示例</strong>' + weakScenes + "</div></article></div></section>";
  }

  D.componentSpecimenHelpers = {
    icon: icon,
    dialogStatusIcon: dialogStatusIcon,
    cell: cell,
    row: row,
    button: button,
    sourceBasicButton: sourceBasicButton,
    sourceTextButton: sourceTextButton,
    sourceIconButton: sourceIconButton,
    sourceRoundedButton: sourceRoundedButton,
    sourceMenuButton: sourceMenuButton,
    textTimezoneCard: textTimezoneCard,
    textBranchCard: textBranchCard,
    textMeetingCard: textMeetingCard,
    contextMenuSpecimen: contextMenuSpecimen,
    popupButton: popupButton,
    sourceDropdownMenu: sourceDropdownMenu,
    iconTooltipButton: iconTooltipButton,
    floatingTooltipButton: floatingTooltipButton,
    sourceFloatingButton: sourceFloatingButton,
    input: input,
    choice: choice,
    selectShell: selectShell,
    selectOption: selectOption,
    sourceSelect: sourceSelect,
    selectStateGrid: selectStateGrid,
    menu: menu,
    dropdown: dropdown,
    actionDropdown: actionDropdown,
    cascadeOption: cascadeOption,
    cascadeColumn: cascadeColumn,
    cascadeDemo: cascadeDemo,
    sourceCascader: sourceCascader,
    colorSwatch: colorSwatch,
    colorCustomPanel: colorCustomPanel,
    sourceColorPicker: sourceColorPicker,
    customColorPicker: customColorPicker,
    fullColorPalette: fullColorPalette,
    simpleColorPalette: simpleColorPalette,
    simpleColorPicker: simpleColorPicker,
    checkboxOption: checkboxOption,
    checkboxGroup: checkboxGroup,
    checkboxStateMatrix: checkboxStateMatrix,
    navigationBrand: navigationBrand,
    topNavigation: topNavigation,
    sideNavItem: sideNavItem,
    sideWebNavigation: sideWebNavigation,
    desktopSideNavigation: desktopSideNavigation,
    breadcrumbSpec: breadcrumbSpec,
    stepsSpec: stepsSpec,
    paginationSpec: paginationSpec,
    scrollbarSpec: scrollbarSpec,
    anchorSpec: anchorSpec,
    anchorComposition: anchorComposition,
    anchorScrollDemo: anchorScrollDemo,
    visualizationSpec: visualizationSpec,
    calendarMonth: calendarMonth,
    datePickerSpec: datePickerSpec,
    componentReference: componentReference,
    formField: formField,
    basicForm: basicForm,
    groupedForm: groupedForm,
    combinationForm: combinationForm,
    stepForm: stepForm,
    linkedForm: linkedForm,
    inputSpec: inputSpec,
    numberInputSpec: numberInputSpec,
    affixInputSpec: affixInputSpec,
    combinationInputSpec: combinationInputSpec,
    combinationSelectSpec: combinationSelectSpec,
    otpInputSpec: otpInputSpec,
    textareaSpec: textareaSpec,
    radioOption: radioOption,
    radioGroupSpec: radioGroupSpec,
    radioStateMatrix: radioStateMatrix,
    radioButtonGroup: radioButtonGroup,
    ratingSpec: ratingSpec,
    sentimentSpec: sentimentSpec,
    stepperSpec: stepperSpec,
    sourceSlider: sourceSlider,
    sourceSwitch: sourceSwitch,
    sourceNavigationTree: sourceNavigationTree,
    treeBranch: treeBranch,
    sourceTreeSelect: sourceTreeSelect,
    transferSpec: transferSpec,
    timePickerSpec: timePickerSpec,
    sourceTimePicker: sourceTimePicker,
    fileTypeIcon: fileTypeIcon,
    uploadFileSpec: uploadFileSpec,
    uploadDropSpec: uploadDropSpec,
    uploadChoice: uploadChoice,
    uploadPictureTrigger: uploadPictureTrigger,
    uploadPictureTile: uploadPictureTile,
    sourceUpload: sourceUpload,
    avatarSpec: avatarSpec,
    sourceAvatar: sourceAvatar,
    badgeSpec: badgeSpec,
    sourceBadge: sourceBadge,
    cardSpec: cardSpec,
    sourceCard: sourceCard,
    accordionSpec: accordionSpec,
    sourceAccordion: sourceAccordion,
    sourcePlaceholder: sourcePlaceholder,
    emptyStateSpec: emptyStateSpec,
    imagePreviewSpec: imagePreviewSpec,
    popoverSpec: popoverSpec,
    sourcePopover: sourcePopover,
    stateStrip: stateStrip,
    principleState: principleState,
    toggleButton: toggleButton,
    toggleMatrix: toggleMatrix,
    tableSortButton: tableSortButton,
    tableFilterDropdown: tableFilterDropdown,
    tableDemo: tableDemo,
    sourceTableSpec: sourceTableSpec,
    tabsSpec: tabsSpec,
    tagSpec: tagSpec,
    timelineSpec: timelineSpec,
    tooltipSpec: tooltipSpec,
    dialogSpec: dialogSpec,
    sourceDialogShell: sourceDialogShell,
    drawerSpec: drawerSpec,
    bindDrawer: bindDrawer,
    loadingSpin: loadingSpin,
    loadingSkeleton: loadingSkeleton,
    sourceLoading: sourceLoading,
    illustrationLoading: illustrationLoading,
    notificationSpec: notificationSpec,
    alertSpec: alertSpec,
    toastSpec: toastSpec,
    sourceToast: sourceToast,
    progressLine: progressLine,
    progressCircle: progressCircle,
    progressSteps: progressSteps,
    sourceProgress: sourceProgress,
    buttonComponentSpecimen: buttonComponentSpecimen,
    buttonOverviewReference: buttonOverviewReference,
    specialStateButton: specialStateButton,
    specialIconButton: specialIconButton,
    specialComparison: specialComparison,
    subscriptionCard: subscriptionCard,
    meetingList: meetingList,
    shareToolbar: shareToolbar,
    weakSelectionCards: weakSelectionCards,
    richTextToolbar: richTextToolbar,
    meetingInvite: meetingInvite,
    filterToolbar: filterToolbar,
    buttonSpecialTypes: buttonSpecialTypes,
    colorBaseValues: colorBaseValues,
    buttonOverviewReferences: buttonOverviewReferences
  };

  /*
   * Production renderers consume the same source-owned DOM factories as the
   * specimen catalog. The production name makes the boundary explicit: the
   * renderer selects a legal component factory and never returns specimen
   * boards, cells, annotations or usage examples.
   */
  D.componentFactories = D.componentSpecimenHelpers;

  function render(component, compact) {
    var module = D.modules.components[component.id];
    var art = module && module.renderSpecimen ? module.renderSpecimen() : row("状态", stateStrip("button-chip"));
    if (compact) return '<div class="specimen-compact">' + art + "</div>";
    return '<div class="component-spec-board" data-component-id="' + component.id + '">' + art + "</div>";
  }

  D.componentSpecimens = { render: render };
})();
