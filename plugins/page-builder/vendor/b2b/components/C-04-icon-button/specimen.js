(function registerIconButtonSpecimen() {
  "use strict";

  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var docsApi = D.componentApiDocs;
  var variants = [
    { value: "Button_Icon", label: "Button Icon 图标按钮", category: "单一操作" },
    { value: "Outlined icon button", label: "Outlined 描边按钮", category: "单一操作" },
    { value: "icon group", label: "Icon Group 图标按钮组", category: "组合操作" },
    { value: "menu trigger", label: "Menu Trigger 菜单触发器", category: "菜单触发" }
  ];
  var sizes = [
    { value: "24", label: "mini 24px", name: "mini", icon: 14 },
    { value: "28", label: "small 28px", name: "small", icon: 16 },
    { value: "32", label: "medium 32px", name: "medium", icon: 18 },
    { value: "36", label: "large 36px", name: "large", icon: 20 },
    { value: "40", label: "xlarge 40px", name: "xlarge", icon: 22 }
  ];
  var groupItems = [
    { icon: "format_align_left", label: "左对齐", selected: true },
    { icon: "format_align_center", label: "居中对齐" },
    { icon: "format_align_right", label: "右对齐" }
  ];
  var menuItems = [
    { label: "复制", icon: "content_copy" },
    { label: "移动", icon: "drive_file_move" },
    { label: "删除", icon: "delete", danger: true }
  ];

  function renderSpecimen() {
    return H.row("冻结源变体", [
      H.cell("Button_Icon", H.sourceIconButton({ variant: "Button_Icon", icon: "edit", label: "编辑", size: 28 })),
      H.cell("Outlined", H.sourceIconButton({ variant: "Outlined icon button", icon: "notifications", label: "通知", size: 32 })),
      H.cell("Icon group", H.sourceIconButton({ variant: "icon group", label: "对齐", items: [{ icon: "format_align_left", label: "左对齐" }, { icon: "format_align_right", label: "右对齐" }] })),
      H.cell("Menu trigger", H.sourceIconButton({ variant: "menu trigger", label: "更多", expanded: true, items: [{ label: "复制", icon: "content_copy" }, { label: "删除", danger: true }] }))
    ], "Tooltip、组合与菜单解剖均来自 canonical factory。");
  }

  function meta(value) { return variants.find(function (item) { return item.value === value; }); }

  function allowed(selection) {
    if (selection.panel === "open" && selection.variant !== "menu trigger") return false;
    return selection.content === (selection.variant === "icon group" ? "group-items" : selection.variant === "menu trigger" ? "menu-items" : "none");
  }

  function invalidReason(selection) {
    if (selection.panel === "open") return "open 是 menu trigger 的真实交互派生状态，不是公开 prop";
    if (selection.content !== "none") return "items 只适用于 icon group 或 menu trigger";
    return "该组合不在 C-04 严格 API 范围内";
  }

  function normalizeSelection(selection, changedKey) {
    if (changedKey === "variant") {
      selection.content = selection.variant === "icon group" ? "group-items" : selection.variant === "menu trigger" ? "menu-items" : "none";
      selection.panel = "closed";
    }
    return selection;
  }

  function resolveSelection(selection) {
    var variant = meta(selection.variant);
    var props = {
      icon: selection.variant === "Outlined icon button" ? "notifications" : selection.variant === "icon group" ? "format_align_left" : selection.variant === "menu trigger" ? "more_horiz" : "edit",
      label: selection.variant === "icon group" ? "文本对齐" : selection.variant === "menu trigger" ? "更多操作" : selection.variant === "Outlined icon button" ? "通知" : "编辑",
      size: Number(selection.size),
      variant: selection.variant,
      disabled: selection.state === "disabled"
    };
    if (selection.variant === "icon group") props.items = groupItems;
    if (selection.variant === "menu trigger") props.items = menuItems;
    var size = sizes.find(function (item) { return item.value === selection.size; });
    var parameterKeys = ["icon", "label", "size", "variant", "disabled"];
    if (props.items) parameterKeys.push("items");
    return {
      category: variant.category,
      label: variant.label + " · " + size.label + " · " + (props.disabled ? "Disabled 禁用" : "Default 默认") + (selection.variant === "menu trigger" ? " · " + (selection.panel === "open" ? "Open 打开" : "Closed 关闭") : ""),
      description: "标签同时用于无障碍名称与 Tooltip；按钮热区和图标几何由 Renderer 派生。",
      interaction: props.disabled ? "禁用状态不派发激活、菜单或选择事件。" : selection.variant === "menu trigger" ? "点击或使用键盘打开菜单；方向键导航，关闭后焦点返回触发按钮。" : "Hover 或 Focus 显示 Tooltip；点击或 Enter / Space 每次派发一次 b2b:icon-activate。",
      props: props,
      parameterKeys: parameterKeys
    };
  }

  var docsConfig = {
    id: "C-04",
    title: "Icon Button 图标按钮",
    introduction: "在空间受限且图标含义明确时触发操作。Renderer 负责五档热区、Tooltip、菜单开闭、键盘、焦点和 ARIA；普通与描边按钮是动作按钮，图标组的选中态属于组内子项。",
    categories: [
      { name: "单一操作", description: "普通图标按钮与描边按钮均完整支持五档尺寸，且都用于触发动作。" },
      { name: "组合操作", description: "Icon group 将同类工具操作并列，每个子项提供自己的 label、icon 和选中态。" },
      { name: "菜单触发", description: "菜单触发器收纳低频操作，开闭状态由真实交互同步。" }
    ],
    variants: variants.map(function (item) { return { key: item.value, label: item.label, category: item.category, props: { variant: item.value } }; }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "切换样式并操作唯一生产实例",
    showParameterDescriptions: true,
    parameterDescriptions: {
      icon: "Material Symbols 图标名称；每个 icon group 子项可用 items[].icon 覆盖。",
      label: "按钮的 aria-label 与 Tooltip 文案；icon group 时作为组的可访问名称。",
      size: "真实外框/热区像素：24=mini、28=small、32=medium、36=large、40=xlarge。",
      variant: "真实 anatomy 变体：普通动作、圆形描边动作、图标组或菜单触发器。",
      disabled: "禁用组件；禁用按钮不响应点击或原生键盘激活。",
      items: "仅 icon group/menu trigger 使用；group 可用 selected，group/menu 可用 disabled，danger 仅用于 menu。"
    },
    controlGroups: [
      { key: "variant", label: "变体", options: variants },
      { key: "size", label: "尺寸", options: sizes },
      { key: "state", label: "状态", options: [{ value: "default", label: "Default 默认" }, { value: "disabled", label: "Disabled 禁用" }] },
      { key: "panel", label: "菜单", statusOnly: true, options: [{ value: "closed", label: "Closed 关闭" }, { value: "open", label: "Open 打开" }] },
      { key: "content", label: "内容", options: [
        { value: "none", label: "None 无列表" },
        { value: "group-items", label: "Alignment 对齐项" },
        { value: "menu-items", label: "Menu Items 菜单项" }
      ] }
    ],
    initialSelection: { variant: "Button_Icon", size: "32", state: "default", panel: "closed", content: "none" },
    variantCoverage: variants.map(function (item) { return item.value; }),
    isSelectionAllowed: allowed,
    invalidSelectionReason: invalidReason,
    normalizeSelection: normalizeSelection,
    resolveSelection: resolveSelection,
    syncSelectionFromEvent: function (name, event, selection) {
      if (name === "b2b:icon-menu-toggle") selection.panel = event.detail && event.detail.expanded ? "open" : "closed";
      return selection;
    },
    events: ["b2b:icon-activate", "b2b:icon-menu-toggle", "b2b:icon-menu-select"],
    slotSelector: "#c04-icon-button-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-04"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-04"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-04"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview || !docsApi) return Promise.resolve([]);
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-04"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    docs.querySelector("[data-component-docs-mount]").id = "c04-icon-button-slot";
    return docsApi.mount(docsConfig, docs);
  }

  document.addEventListener("b2b:specimens-rendered", function (event) { mountSpecimen(event.detail && event.detail.root ? event.detail.root : document); });
  D.registerComponent("C-04", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
