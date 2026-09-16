(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var button = H.button;
    var avatarSpec = H.avatarSpec;
    var tagSpec = H.tagSpec;
    var tooltipSpec = H.tooltipSpec;
        return row("使用规则", [
          cell("轻量文字说明", tooltipSpec({ text: "解释目标的名称或用途" })),
          cell("不承载复杂操作", tooltipSpec({ trigger: button("", "is-icon", 'aria-label="帮助"', "help"), text: "短句解释；复杂内容使用气泡卡片" }))
        ], "鼠标悬停或键盘聚焦触发，用于解释目标，不替代业务内容") + row("组成要素", [
          cell("1 · 文本", tooltipSpec({ text: "Button" })),
          cell("2 · 容器背景 + S4/down 阴影", tooltipSpec({ text: "Tooltip container" })),
          cell("3 · 箭头", tooltipSpec({ position: "bottom", text: "12 × 6 px" })),
          cell("4 · 触发区域", tooltipSpec({ trigger: button("", "is-icon", 'aria-label="设置"', "settings"), text: "设置" }))
        ]) + row("控件类型 & 使用场景 · 用于解释说明操作", [
          cell("文字按钮", tooltipSpec({ trigger: button("查看详情", "is-text"), text: "打开完整信息" })),
          cell("图标按钮", tooltipSpec({ trigger: button("", "is-icon", 'aria-label="删除"', "delete"), text: "删除" })),
          cell("被截断内容", tooltipSpec({ trigger: '<span class="tooltip-truncated">Enterprise Financial Management…</span>', text: "Enterprise Financial Management System" }))
        ]) + row("Hover icon 使用场景", [
          cell("操作图标 · 与按钮共同 Hover", tooltipSpec({ trigger: button("", "is-icon", 'aria-label="编辑"', "edit"), text: "编辑" })),
          cell("信息图标 · 图标视觉保持", tooltipSpec({ trigger: '<span class="tooltip-info-trigger">' + icon("info") + '</span>', text: "补充说明" }))
        ], "操作图标随按钮呈现悬停态；纯信息图标本身不改变颜色") + row("用于展示更多信息", [
          cell("按钮", tooltipSpec({ trigger: button("更多", ""), text: "展示更多操作" })),
          cell("头像", tooltipSpec({ trigger: avatarSpec({ text: "A", size: 32 }), text: "Alex Chen" })),
          cell("标签", tooltipSpec({ trigger: tagSpec({ text: "较长的标签内容", color: "blue" }), text: "较长的标签完整内容" }))
        ]) + row("通用样式规则 · 尺寸说明", [
          cell("文字 · 12px Regular", tooltipSpec({ text: "12px / Regular" })),
          cell("内边距 · 12px × 8px", tooltipSpec({ text: "Horizontal 12 · Vertical 8" })),
          cell("箭头 · 12 × 6px", tooltipSpec({ position: "bottom", text: "Arrow" })),
          cell("触发间距 · 4px", tooltipSpec({ text: "4px gap" }))
        ]) + row("内容宽度", [
          cell("Basic · 单行", tooltipSpec({ text: "Short tooltip" })),
          cell("Multi-line · 自动换行", tooltipSpec({ multiline: true, text: "当说明文字超过单行宽度时，容器高度随内容增加并自动换行。" })),
          cell("Max width · 320px", tooltipSpec({ max: true, text: "常规场景最大宽度为 320px；不要用 Tooltip 承载长篇说明或复杂表单。" })),
          cell("极端桌面场景 · 400px", tooltipSpec({ max: true, multiline: true, text: "仅日历或对话框详情等极端桌面场景允许扩展到 400px。" }))
        ]) + row("位置说明 · 12 个方向", [
          cell("Top left", tooltipSpec({ position: "top-left", text: "Top left" })), cell("Top", tooltipSpec({ position: "top", text: "Top" })), cell("Top right", tooltipSpec({ position: "top-right", text: "Top right" })),
          cell("Left top", tooltipSpec({ position: "left-top", text: "Left top" })), cell("Left", tooltipSpec({ position: "left", text: "Left" })), cell("Left bottom", tooltipSpec({ position: "left-bottom", text: "Left bottom" })),
          cell("Right top", tooltipSpec({ position: "right-top", text: "Right top" })), cell("Right", tooltipSpec({ position: "right", text: "Right" })), cell("Right bottom", tooltipSpec({ position: "right-bottom", text: "Right bottom" })),
          cell("Bottom left", tooltipSpec({ position: "bottom-left", text: "Bottom left" })), cell("Bottom", tooltipSpec({ position: "bottom", text: "Bottom" })), cell("Bottom right", tooltipSpec({ position: "bottom-right", text: "Bottom right" }))
        ], "箭头对准触发区域中心；靠近视口边缘时自动翻转或改用边缘对齐") + row("交互与位置优先级", [
          cell("Hover 100ms 出现 / 离开 100ms 消失", tooltipSpec({ trigger: button("悬停验证", "is-primary"), text: "Tooltip 自身也属于保持触发区域" })),
          cell("首选 · 居中置顶", tooltipSpec({ position: "top", text: "优先 Top center" })),
          cell("退让 · 不遮挡重要信息", '<div class="tooltip-edge-rule">' + tooltipSpec({ position: "bottom-right", trigger: button("边缘目标"), text: "自动向视口内退让" }) + '</div>'),
          cell("邻近触发器 · 内容优先", '<div class="tooltip-nearby">' + tooltipSpec({ position: "top", trigger: button("A", "is-icon"), text: "操作 A" }) + tooltipSpec({ position: "bottom", trigger: button("B", "is-icon"), text: "操作 B" }) + '</div>')
        ], "优先级：上下居中 → 上下边缘对齐 → 左右居中；不得遮挡关键内容");
  }

  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var variantOptions = [
    { value: "top", label: "Top" },
    { value: "right", label: "Right" },
    { value: "bottom", label: "Bottom" },
    { value: "left", label: "Left" },
    { value: "multiline", label: "Multi-line" }
  ];
  var placementOptions = [
    { value: "top-left", label: "Top left" },
    { value: "top", label: "Top" },
    { value: "top-right", label: "Top right" },
    { value: "right-top", label: "Right top" },
    { value: "right", label: "Right" },
    { value: "right-bottom", label: "Right bottom" },
    { value: "bottom-right", label: "Bottom right" },
    { value: "bottom", label: "Bottom" },
    { value: "bottom-left", label: "Bottom left" },
    { value: "left-bottom", label: "Left bottom" },
    { value: "left", label: "Left" },
    { value: "left-top", label: "Left top" }
  ];
  var parameterKeys = ["variant", "position", "text", "triggerText", "multiline", "max"];

  function invalidSelectionReason(selection) {
    if (selection.variant === "multiline" && selection.width === "single") return "Multi-line 变体必须使用可换行宽度";
    return "";
  }

  function isSelectionAllowed(selection) {
    return !invalidSelectionReason(selection);
  }

  function resolveSelection(selection) {
    var error = invalidSelectionReason(selection);
    if (error) throw new Error(error);
    var multiline = selection.width === "multiline" || selection.variant === "multiline";
    var max = selection.width === "max";
    var text = selection.content === "long"
      ? "当前操作会影响所选范围内的全部项目，请在继续前确认目标与权限。"
      : selection.position + " 方向的 Tooltip";
    if (selection.width === "multiline") text = "当说明文字超过单行宽度时，Tooltip 会按 240px 宽度自动换行。";
    if (selection.width === "max") text = "常规长说明使用 320px 最大宽度；复杂内容或可操作内容应改用 Popover。";
    var widthLabel = { single: "单行", multiline: "Multi-line · 240px", max: "Max · 320px" }[selection.width];
    return {
      category: selection.variant === "multiline" ? "内容宽度" : "方向与对齐",
      label: variantOptions.find(function (item) { return item.value === selection.variant; }).label + " · " + selection.position + " · " + widthLabel,
      description: "Renderer 复用 H.tooltipSpec 的真实浮层、箭头、100ms 动效与视口退让；Hover 与 Focus 属于真实瞬时状态。",
      interaction: "悬停或聚焦触发器后派发一次 b2b:tooltip-open；离开、失焦或 Escape 后派发一次 b2b:tooltip-close。",
      props: {
        variant: selection.variant,
        position: selection.position,
        text: text,
        triggerText: selection.content === "long" ? "查看受影响范围与权限" : "悬停或聚焦查看",
        multiline: multiline,
        max: max
      },
      parameterKeys: parameterKeys.slice()
    };
  }

  var docsConfig = {
    id: "C-44",
    title: "Tooltip 文字提示",
    introduction: "用于解释图标、操作或被截断的短内容；Renderer 负责 canonical DOM、位置退让、100ms 显隐、键盘焦点、ARIA 与公开 open / close 事件。",
    categories: [
      { name: "方向与对齐", description: "Top、Right、Bottom、Left 四个主方向均支持起始、居中与末端对齐，共 12 个物理位置。" },
      { name: "内容宽度", description: "单行用于短说明；Multi-line 使用 240px，Max 使用 320px。复杂内容改用 Popover。" }
    ],
    variants: variantOptions.map(function (item) {
      return { key: item.value, label: item.label, category: item.value === "multiline" ? "内容宽度" : "方向与对齐" };
    }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "按维度选择，操作真实 Tooltip",
    controlGroups: [
      { key: "variant", label: "变体", options: variantOptions },
      { key: "position", label: "位置", options: placementOptions },
      { key: "width", label: "内容宽度", note: "Hover / Focus 请直接操作组件", options: [
        { value: "single", label: "单行" },
        { value: "multiline", label: "Multi-line · 240px" },
        { value: "max", label: "Max · 320px" }
      ] },
      { key: "content", label: "内容", options: [
        { value: "standard", label: "短说明" },
        { value: "long", label: "较长说明" }
      ] }
    ],
    initialSelection: { variant: "top", position: "top", width: "single", content: "standard" },
    variantCoverage: variantOptions.map(function (item) { return item.value; }),
    isSelectionAllowed: isSelectionAllowed,
    invalidSelectionReason: invalidSelectionReason,
    resolveSelection: resolveSelection,
    events: ["b2b:tooltip-open", "b2b:tooltip-close"],
    slotSelector: "#tooltip-slot"
  };

  function mountSpecimen(scope) {
    if (!docsApi) return Promise.resolve([]);
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-44"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-44"]')
      ? root
      : root.closest && root.closest('article[data-component-card="C-44"]') || root.querySelector && root.querySelector('article[data-component-card="C-44"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1;
    var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-44"]');
    if (old) {
      docsApi.destroy(old);
      old.remove();
    }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    return docsApi.mount(docsConfig, docs).then(function (result) {
      return current === docsRevision ? result : [];
    });
  }

  document.addEventListener("b2b:specimens-rendered", function (event) {
    mountSpecimen(event.detail && event.detail.root ? event.detail.root : document);
  });
  D.registerComponent("C-44", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
