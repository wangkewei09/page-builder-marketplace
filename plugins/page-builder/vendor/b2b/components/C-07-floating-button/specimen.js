(function registerFloatingButtonSpecimen() {
  "use strict";

  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var menuItems = [
    { label: "在线客服", icon: "chat" },
    { label: "发送邮件", icon: "mail" }
  ];
  var parameterKeys = ["variant", "appearance", "size", "icon", "label", "disabled", "expanded", "items", "badge", "messageText", "avatarText", "avatarLabel"];
  var variantLabels = {
    primary: "Primary 主要操作",
    secondary: "Secondary 次要操作",
    menu: "Menu 菜单",
    message: "Message 消息",
    "official-text": "Official Text 官网文字"
  };
  var appearanceLabels = { primary: "Primary 主要外观", secondary: "Secondary 次要外观" };
  var sizeLabels = { 36: "Small 小号 36px", 40: "Medium 中号 40px", 48: "Large 大号 48px" };
  var stateLabels = { enabled: "Enabled 可用", disabled: "Disabled 禁用", expanded: "Expanded 展开" };

  function renderSpecimen() {
    return H.row("源码标本参考", [
      H.cell("五类 canonical anatomy", '<div class="floating-source-reference">' +
        H.sourceFloatingButton({ variant: "primary", appearance: "primary", size: 48, icon: "add", label: "新建" }) +
        H.sourceFloatingButton({ variant: "secondary", appearance: "secondary", size: 40, icon: "help", label: "帮助中心" }) +
        H.sourceFloatingButton({ variant: "menu", appearance: "secondary", size: 36, icon: "headset_mic", label: "快捷操作", items: menuItems }) +
        H.sourceFloatingButton({ variant: "message", appearance: "secondary", size: 48, icon: "keyboard_double_arrow_down", label: "消息", badge: 5966 }) +
        H.sourceFloatingButton({ variant: "official-text", appearance: "primary", size: 40, icon: "support_agent", label: "活动咨询" }) +
      "</div>")
    ], "该区域仅保留 canonical specimen 参考；下方正式文档仅调用 B2B.renderComponent。");
  }

  function invalidSelectionReason(selection) {
    if (selection.variant === "primary" && selection.appearance !== "primary") return "Primary 只有 Primary 外观";
    if (selection.variant === "secondary" && selection.appearance !== "secondary") return "Secondary 只有 Secondary 外观";
    if (selection.variant === "menu" && selection.appearance !== "secondary") return "Menu 的源外观为 Secondary";
    if (selection.variant === "menu" && selection.size !== "36") return "Menu 的源尺寸为 36";
    if (selection.variant === "message" && selection.size !== "48") return "Message 使用 48 选择值定位源固定 anatomy";
    if (selection.variant === "official-text" && selection.size !== "40") return "Official text 的源选择尺寸为 40";
    if (selection.state === "expanded" && selection.variant !== "menu") return "Expanded 只属于 Menu";
    return "";
  }

  function resolveSelection(selection) {
    var error = invalidSelectionReason(selection);
    if (error) throw new Error(error);
    var variant = selection.variant;
    var props = {
      variant: variant,
      appearance: selection.appearance,
      size: Number(selection.size),
      icon: variant === "primary" ? "add" : variant === "menu" ? "headset_mic" : variant === "message" ? "keyboard_double_arrow_down" : variant === "official-text" ? "support_agent" : "help",
      label: variant === "primary" ? "新建" : variant === "menu" ? "快捷操作" : variant === "message" ? "消息" : variant === "official-text" ? "活动咨询" : "帮助中心",
      disabled: selection.state === "disabled",
      expanded: selection.state === "expanded",
      items: variant === "menu" ? menuItems : [],
      badge: variant === "message" ? 5966 : 0,
      messageText: "",
      avatarText: "",
      avatarLabel: ""
    };
    var category = variant === "primary" ? "强引导" : variant === "menu" ? "组合快捷操作" : variant === "message" ? "消息提醒" : variant === "official-text" ? "官网文字扩展" : "全局辅助操作";
    return {
      category: category,
      label: variantLabels[variant] + " · " + appearanceLabels[selection.appearance] + " · " + sizeLabels[selection.size] + (selection.state === "enabled" ? "" : " · " + stateLabels[selection.state]),
      description: "该组合由唯一 sourceFloatingButton factory 创建，Renderer 仅校验参数并转发公开事件；36/40px 使用 20px 图标，48px 使用 24px 图标。",
      interaction: variant === "menu" ? "点击或 Enter/Space 展开；点选子操作后关闭并恢复焦点；Escape 或外部点击关闭。" : "Hover / Focus 产生源 Tooltip；点击只触发一次 b2b:floating-activate；Disabled 不提交事件。",
      props: props,
      parameterKeys: parameterKeys.slice()
    };
  }

  var docsConfig = {
    id: "C-07",
    title: "Floating Button 悬浮按钮",
    introduction: "用于固定在视口或模块边缘的全局快捷操作。Renderer 直接适配 canonical source anatomy 与共享 binder；36/40px 圆形按钮使用 20px 图标，48px 圆形按钮使用 24px 图标。",
    categories: [
      { name: "圆形快捷操作", description: "Primary / Secondary 提供单一全局动作，Menu 承载一组同类子操作。" },
      { name: "内容扩展", description: "Message 增加消息内容，Official text 在图标无法独立表意时增加文字。" }
    ],
    variants: [
      { key: "primary", label: variantLabels.primary, category: "圆形快捷操作" },
      { key: "secondary", label: variantLabels.secondary, category: "圆形快捷操作" },
      { key: "menu", label: variantLabels.menu, category: "圆形快捷操作" },
      { key: "message", label: variantLabels.message, category: "内容扩展" },
      { key: "official-text", label: variantLabels["official-text"], category: "内容扩展" }
    ],
    controlsEyebrow: "全部源码形态与真实交互",
    controlsHeading: "选择合法组合，操作真实 Floating Button",
    controlGroups: [
      { key: "variant", label: "变体", options: ["primary", "secondary", "menu", "message", "official-text"].map(function (value) { return { value: value, label: variantLabels[value] }; }) },
      { key: "appearance", label: "外观", options: ["primary", "secondary"].map(function (value) { return { value: value, label: appearanceLabels[value] }; }) },
      { key: "size", label: "尺寸", options: [36, 40, 48].map(function (value) { return { value: String(value), label: sizeLabels[value] }; }) },
      { key: "state", label: "状态", note: "非法组合会禁用；Hover / Focus / Pressed 请直接操作组件", options: ["enabled", "disabled", "expanded"].map(function (value) { return { value: value, label: stateLabels[value] }; }) }
    ],
    initialSelection: { variant: "secondary", appearance: "secondary", size: "40", state: "enabled" },
    variantCoverage: ["primary", "secondary", "menu", "message", "official-text"],
    normalizeSelection: function (selection, changedKey) {
      if (changedKey !== "variant") return selection;
      if (selection.variant === "primary") selection.appearance = "primary";
      if (selection.variant === "secondary") selection.appearance = "secondary";
      if (selection.variant === "menu") { selection.appearance = "secondary"; selection.size = "36"; }
      if (selection.variant === "message") selection.size = "48";
      if (selection.variant === "official-text") selection.size = "40";
      if (selection.variant !== "menu" && selection.state === "expanded") selection.state = "enabled";
      return selection;
    },
    isSelectionAllowed: function (selection) { return !invalidSelectionReason(selection); },
    invalidSelectionReason: invalidSelectionReason,
    resolveSelection: resolveSelection,
    syncSelectionFromEvent: function (name, event, selection, context) {
      if (selection.variant === "menu" && name === "b2b:floating-change") {
        if (event.detail && event.detail.expanded) selection.state = "expanded";
        else if (!context.preserveControlledOpen) selection.state = "enabled";
      }
      return selection;
    },
    events: ["b2b:floating-activate", "b2b:floating-change", "b2b:floating-select"],
    slotSelector: "#floating-button-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-07"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-07"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-07"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1;
    var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-07"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    return docsApi.mount(docsConfig, docs).then(function (result) { return current === docsRevision ? result : []; });
  }

  document.addEventListener("b2b:specimens-rendered", function (event) {
    mountSpecimen(event.detail && event.detail.root ? event.detail.root : document);
  });
  D.registerComponent("C-07", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
