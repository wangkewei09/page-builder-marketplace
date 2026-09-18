(function registerMenuButtonSpecimen() {
  "use strict";

  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var docsApi = D.componentApiDocs;
  var variants = [
    { value: "Split button", label: "Split Button 分裂按钮", category: "Primary and Related Actions 主次操作" },
    { value: "Menu button", label: "Menu Button 菜单按钮", category: "Whole Control Trigger 整体触发" },
    { value: "Overflow Menu", label: "Overflow Menu 更多菜单", category: "Low-frequency Actions 低频收纳" }
  ];

  function renderSpecimen() {
    var items = [{ label: "创建活动", icon: "event" }, { label: "创建日程", icon: "calendar_month" }];
    return H.row("冻结源变体", [
      H.cell("Split button", H.sourceMenuButton({ variant: "Split button", label: "创建", mainIcon: "add", items: items })),
      H.cell("Menu button", H.sourceMenuButton({ variant: "Menu button", label: "导出", items: [{ label: "PDF" }, { label: "Word" }] })),
      H.cell("Overflow Menu", H.sourceMenuButton({ variant: "Overflow Menu", label: "更多", icon: "more_horiz", appearance: "secondary-gray", items: [{ label: "复制" }, { label: "删除", danger: true }] }))
    ], "三种变体共用 canonical C-08 菜单面板与 shared interaction。");
  }

  function meta(value) { return variants.find(function (item) { return item.value === value; }); }

  function resolveSelection(selection) {
    var variant = meta(selection.variant);
    var splitItems = [
      { label: "创建活动", icon: "event" },
      { label: "创建日程", icon: "calendar_month", disabled: selection.content === "disabled-item" },
      { label: "从模板创建", icon: "description" }
    ];
    var menuItems = [{ label: "导出 PDF" }, { label: "导出 Word", disabled: selection.content === "disabled-item" }, { label: "导出图片" }];
    var overflowItems = [
      { label: "复制", icon: "content_copy" },
      { label: "移动到", icon: "drive_file_move", disabled: selection.content === "disabled-item" },
      { label: "删除", icon: "delete", danger: true }
    ];
    var props = {
      variant: selection.variant,
      label: selection.variant === "Split button" ? "创建" : selection.variant === "Menu button" ? "导出" : "更多操作",
      items: selection.variant === "Split button" ? splitItems : selection.variant === "Menu button" ? menuItems : overflowItems,
      open: selection.panel === "open",
      appearance: selection.appearance,
      size: Number(selection.size),
      mainIcon: selection.variant === "Split button" && selection.iconMode === "custom" ? "add" : null,
      icon: selection.variant === "Overflow Menu" ? (selection.iconMode === "custom" ? "settings" : "more_horiz") : null,
      disabled: selection.state === "disabled"
    };
    return {
      category: variant.category,
      label: variant.label + " · " + ({ primary: "Primary 主要操作", "secondary-blue": "Secondary Blue 蓝色次要", "secondary-gray": "Secondary Gray 灰色次要" }[selection.appearance]) + " · " + ({ "24": "Mini 24px", "28": "Small 28px", "32": "Medium 32px", "36": "Large 36px", "40": "Xlarge 40px" }[selection.size]),
      description: "用于固定高频主操作与同类低频辅助操作。Split 触发热区宽度等于当前高度；菜单面板的背景、边框、圆角与投影均来自 canonical 源。",
      interaction: props.disabled ? "Disabled 同时禁用主操作与菜单触发器。" : selection.variant === "Split button" ? "点击主热区触发 primary；点击或 Enter / Space / ArrowDown 打开菜单，方向键、Home / End 导航，Escape 关闭并返回焦点。" : "点击或键盘打开菜单，选择后派发一次 select 并关闭；外部点击与 Escape 也会关闭。",
      props: props,
      parameterKeys: ["variant", "label", "items", "open", "appearance", "size", "mainIcon", "icon", "disabled"]
    };
  }

  var docsConfig = {
    id: "C-06",
    title: "Split / Menu Button 分裂与菜单按钮",
    introduction: "将一个固定高频主操作与一组同类低频动作组合，或以整块按钮/图标触发菜单。Renderer 负责两个热区、菜单 surface、键盘、焦点、ARIA 和公开事件。",
    categories: [
      { name: "Primary and Related Actions 主次操作", description: "Split Button 分裂按钮将固定主操作与辅助菜单分为两个独立热区。" },
      { name: "Whole Control Trigger 整体触发", description: "Menu Button 菜单按钮的整块按钮只负责打开菜单，没有独立主操作。" },
      { name: "Low-frequency Actions 低频收纳", description: "Overflow Menu 更多菜单用图标触发器收纳按钮组中的低频动作。" }
    ],
    variants: variants.map(function (item) { return { key: item.value, label: item.label, category: item.category, props: { variant: item.value } }; }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "组合变体、外观、尺寸与菜单状态",
    controlGroups: [
      { key: "variant", label: "类型", options: variants },
      { key: "appearance", label: "外观", options: [{ value: "primary", label: "Primary 主要操作" }, { value: "secondary-blue", label: "Secondary Blue 蓝色次要" }, { value: "secondary-gray", label: "Secondary Gray 灰色次要" }] },
      { key: "size", label: "尺寸", options: [{ value: "24", label: "Mini 24px" }, { value: "28", label: "Small 28px" }, { value: "32", label: "Medium 32px" }, { value: "36", label: "Large 36px" }, { value: "40", label: "Xlarge 40px" }] },
      { key: "state", label: "状态", options: [{ value: "enabled", label: "Enabled 可交互" }, { value: "disabled", label: "Disabled 已禁用" }] },
      { key: "panel", label: "菜单", options: [{ value: "closed", label: "Closed 收起" }, { value: "open", label: "Open 展开" }] },
      { key: "iconMode", label: "图标", options: [{ value: "default", label: "Default Icon 默认图标" }, { value: "custom", label: "Source Icon 源证据图标" }] },
      { key: "content", label: "内容", options: [{ value: "standard", label: "Standard 标准菜单" }, { value: "disabled-item", label: "With Disabled Item 含禁用项" }] }
    ],
    initialSelection: { variant: "Split button", appearance: "primary", size: "32", state: "enabled", panel: "closed", iconMode: "custom", content: "standard" },
    variantCoverage: variants.map(function (item) { return item.value; }),
    normalizeSelection: function (selection, changedKey) {
      if (changedKey === "variant" && selection.variant === "Menu button" && selection.iconMode === "custom") selection.iconMode = "default";
      return selection;
    },
    isSelectionAllowed: function (selection) {
      return !(selection.variant === "Menu button" && selection.iconMode === "custom") && !(selection.state === "disabled" && selection.panel === "open");
    },
    invalidSelectionReason: function (selection) {
      if (selection.variant === "Menu button" && selection.iconMode === "custom") return "Menu Button 菜单按钮不支持图标";
      if (selection.state === "disabled" && selection.panel === "open") return "Disabled 已禁用状态不能展开菜单";
      return "该组合不受 Contract 支持";
    },
    resolveSelection: resolveSelection,
    syncSelectionFromEvent: function (name, event, selection) {
      if (name === "b2b:menu-button-open") selection.panel = "open";
      if (name === "b2b:menu-button-close") selection.panel = "closed";
      return selection;
    },
    events: ["b2b:menu-button-primary", "b2b:menu-button-open", "b2b:menu-button-close", "b2b:menu-button-select"],
    slotSelector: "#c06-menu-button-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-06"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-06"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-06"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview || !docsApi) return Promise.resolve([]);
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-06"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    docs.querySelector("[data-component-docs-mount]").id = "c06-menu-button-slot";
    return docsApi.mount(docsConfig, docs);
  }

  document.addEventListener("b2b:specimens-rendered", function (event) { mountSpecimen(event.detail && event.detail.root ? event.detail.root : document); });
  D.registerComponent("C-06", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
