(function registerTextButtonSpecimen() {
  "use strict";

  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var docsApi = D.componentApiDocs;
  var variants = [
    { value: "Button_Text", label: "Button Text 文字动作", category: "文字动作" },
    { value: "Button_Link", label: "Button Link 按钮式链接", category: "按钮式链接" },
    { value: "Link", label: "URL Link URL 导航链接", category: "URL 导航链接" }
  ];

  function renderSpecimen() {
    return H.row("冻结源变体", [
      H.cell("Button_Text", H.sourceTextButton({ variant: "Button_Text", label: "查看全部", leadingIcon: "visibility" })),
      H.cell("Button_Link", H.sourceTextButton({ variant: "Button_Link", label: "新窗口打开", trailingArrow: "open_in_new" })),
      H.cell("Link", H.sourceTextButton({ variant: "Link", label: "前往设置", href: "#" }))
    ], "生产展示页不复制此 specimen DOM。");
  }

  function meta(value) { return variants.find(function (item) { return item.value === value; }); }

  function allowed(selection) {
    if (selection.variant === "Link") return selection.tone === "primary" && selection.iconMode === "none";
    if (selection.variant === "Button_Link" && selection.tone !== "primary") return false;
    if (selection.iconMode === "external" && selection.variant !== "Button_Link") return false;
    return true;
  }

  function invalidReason(selection) {
    if (selection.variant === "Link") return "Link 只允许 primary + 无图标，并必须提供 href";
    if (selection.variant === "Button_Link" && selection.tone !== "primary") return "Button_Link 源规范只有 primary tone";
    if (selection.iconMode === "external") return "open_in_new 后置指示仅有 Button_Link 源码证据";
    return "该组合不在 C-03 严格 API 范围内";
  }

  function resolveSelection(selection) {
    var variant = meta(selection.variant);
    var toneLabel = selection.tone === "primary" ? "Primary 主要操作" : selection.tone === "neutral" ? "Neutral 中性操作" : "Danger 危险操作";
    var iconLabel = selection.iconMode === "leading" ? "Leading 普通前置" : selection.iconMode === "trailing" ? "Trailing 箭头后置" : selection.iconMode === "external" ? "External 外部打开" : "None 无图标";
    var stateLabel = selection.state === "disabled" ? "Disabled 禁用" : "Enabled 可交互";
    var props = {
      label: selection.variant === "Link" ? "前往设置" : selection.variant === "Button_Link" ? "新窗口打开" : selection.tone === "danger" ? "移除" : "查看全部",
      variant: selection.variant,
      tone: selection.tone,
      leadingIcon: selection.iconMode === "leading" ? "visibility" : null,
      trailingArrow: selection.iconMode === "trailing" ? "chevron_right" : selection.iconMode === "external" ? "open_in_new" : null,
      href: selection.variant === "Link" ? "#text-link-demo" : null,
      disabled: selection.state === "disabled"
    };
    return {
      category: variant.category,
      label: variant.label + " · " + toneLabel + " · " + iconLabel + " · " + stateLabel,
      description: variant.category + "；" + toneLabel + "；" + iconLabel + "；" + stateLabel + "。",
      interaction: props.disabled ? "Disabled 不导航且不派发事件。" : selection.variant === "Link" ? "点击、Enter 或 Space 激活 URL Link，同时派发一次 b2b:text-activate。" : "点击或用 Enter / Space 激活原生 button，每次派发一次 b2b:text-activate。",
      props: props,
      parameterKeys: ["label", "variant", "tone", "leadingIcon", "trailingArrow", "href", "disabled"]
    };
  }

  var docsConfig = {
    id: "C-03",
    title: "Text Button 文字按钮",
    introduction: "用于最低视觉层级的文字动作、按钮式链接或 URL 导航链接。Renderer 负责 canonical DOM、4px 图文间距、原生键盘、焦点、ARIA 和 b2b:text-activate；hover、pressed（:active）和 focus-visible 是真实交互瞬时状态，不是 API props。",
    categories: [
      { name: "文字动作", description: "用于页面内的低层级文字操作，支持主要、中性和危险语义。" },
      { name: "按钮式链接", description: "保留按钮交互语义的紧凑链接操作。" },
      { name: "URL 导航链接", description: "使用原生链接完成 URL 导航，不搭配图标。" }
    ],
    variants: variants.map(function (item) { return { key: item.value, label: item.label, category: item.category, props: { variant: item.value } }; }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "组合语义、图标与状态",
    controlGroups: [
      { key: "variant", label: "变体", options: variants },
      { key: "tone", label: "语义色", options: [
        { value: "primary", label: "Primary 主要操作" },
        { value: "neutral", label: "Neutral 中性操作" },
        { value: "danger", label: "Danger 危险操作" }
      ] },
      { key: "iconMode", label: "图标", options: [
        { value: "none", label: "None 无图标" },
        { value: "leading", label: "Leading 普通前置" },
        { value: "trailing", label: "Trailing 箭头后置" },
        { value: "external", label: "External 外部打开" }
      ] },
      { key: "state", label: "状态", note: "Hover / Pressed / Focus 请直接操作组件。", options: [
        { value: "enabled", label: "Enabled 可交互" },
        { value: "disabled", label: "Disabled 禁用" }
      ] }
    ],
    initialSelection: { variant: "Button_Text", tone: "primary", iconMode: "none", state: "enabled" },
    variantCoverage: variants.map(function (item) { return item.value; }),
    isSelectionAllowed: allowed,
    invalidSelectionReason: invalidReason,
    resolveSelection: resolveSelection,
    events: ["b2b:text-activate"],
    showParameterDescriptions: true,
    slotSelector: "#c03-text-button-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-03"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-03"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-03"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview || !docsApi) return Promise.resolve([]);
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-03"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    docs.querySelector("[data-component-docs-mount]").id = "c03-text-button-slot";
    return docsApi.mount(docsConfig, docs);
  }

  document.addEventListener("b2b:specimens-rendered", function (event) { mountSpecimen(event.detail && event.detail.root ? event.detail.root : document); });
  D.registerComponent("C-03", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
