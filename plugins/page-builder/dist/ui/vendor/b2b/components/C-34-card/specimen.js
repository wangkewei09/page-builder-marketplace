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
    var cardSpec = H.cardSpec;
    var sourceCard = H.sourceCard;
        return row("使用规则", [cell("聚合同维度信息", cardSpec({ title: "对象信息", body: "将同维度信息组织为可扫描模块。" }))], "卡片用于组织信息及操作，也可作为详细信息入口；盲目使用会降低阅读效率并浪费空间") + row("组成要素", [
          cell("卡片容器 / 样式 / 内容", '<div class="card-anatomy">' + cardSpec({}) + '<ol><li>卡片容器（必选）</li><li>背景、圆角、描边、投影（可选）</li><li>文本、图片、按钮和组件（可选）</li></ol></div>')
        ]) + row("通用样式说明 · 背景", [
          cell("正确 · 页面 N100 / 卡片 N00", '<div class="card-background-demo is-correct">' + cardSpec({}) + "</div>"),
          cell("避免 · 卡片与背景过近", '<div class="card-background-demo is-avoid">' + cardSpec({ style: "flat" }) + "</div>")
        ], "背景必须具有足够对比；可用投影或描边强化层级") + row("通用样式说明 · 圆角", [
          cell("小卡片 · Radius-S", cardSpec({ style: "radius-small" })), cell("大卡片 · Radius-M", '<div class="card-large">' + cardSpec({ style: "radius-medium" }) + "</div>")
        ], "卡片面积越大可使用更大圆角；同一界面不超过两种圆角") + row("通用样式说明 · 投影", [
          cell("无投影 · 描边/背景分层", cardSpec({ style: "bordered" })),
          cell("Shadow-S-down · 应用入口", cardSpec({ style: "shadow-small" })),
          cell("Shadow-M-down · 功能卡片", cardSpec({ style: "shadow-medium" })),
          cell("Shadow-L-down · Banner / 邀请", cardSpec({ style: "shadow-large" }))
        ]) + row("通用样式说明 · 描边", [
          cell("N300 / 1px 内描边", cardSpec({ style: "bordered" })), cell("描边＋投影", cardSpec({ style: "border-shadow" }))
        ], "描边用于协调同高程模块，亦可辅助投影") + row("使用示例 · 页面背景组合", [
          cell("N100 + N00 卡片", '<div class="card-background-demo">' + cardSpec({ style: "bordered" }) + "</div>"),
          cell("N00 + N100 卡片", '<div class="card-background-demo is-white">' + cardSpec({ style: "muted" }) + "</div>"),
          cell("N00 + 描边", '<div class="card-background-demo is-white">' + cardSpec({ style: "bordered" }) + "</div>"),
          cell("N00 + Shadow-L", '<div class="card-background-demo is-white">' + cardSpec({ style: "shadow-large" }) + "</div>")
        ]) + row("内容说明 · 信息可配置", [
          cell("标题 / 正文 / 辅助信息", cardSpec({ title: "The title of the card", body: "This is the content of the card.", meta: "Auxiliary text" })),
          cell("图片 / Icon / 头像＋文字", cardSpec({ icon: "description", title: "Product review meeting", body: '<div class="card-avatar-copy">' + avatarSpec({ text: "LX", size: 32 }) + "<span>Liu Xiaoxue · Organizer</span></div>" }))
        ], "标题 16/14px Medium；正文 14px；辅助文字 12/14px，标题优先完整单行") + row("内容说明 · 操作可配置", [
          cell("整体可点击", sourceCard({ variant: "interactive", icon: "description", title: "内容模板", body: "进入模板配置" })),
          cell("底部 / 右侧操作", cardSpec({ title: "Product review meeting" }))
        ], "卡片是大型触控区；文字、图标和主次按钮通常位于底部或右侧") + row("内容说明 · 其它组件", [
          cell("列表 / 标签 / 头像", cardSpec({ title: "Customer success", body: '<div class="card-component-stack"><span class="b2b-tag is-success">Status</span>' + avatarSpec({ text: "TL", size: 32 }) + '<ul><li>Department</li><li>Manager</li><li>View full information</li></ul></div>' })),
          cell("内容超高 · 卡片内滚动", '<div class="card-scroll-demo">' + cardSpec({ title: "Activity", body: "Item 1<br>Item 2<br>Item 3<br>Item 4<br>Item 5<br>Item 6<br>Item 7" }) + "</div>")
        ]) + row("间距说明", [
          cell("内容内边距 12px", '<div class="card-measure">' + cardSpec({}) + '<span>12px</span></div>'),
          cell("标题-内容 12px / 元素组 8–16px", cardSpec({ title: "The title of the card", body: '<div class="card-component-stack"><span>First group</span><span>Second group</span></div>' })),
          cell("卡片间距 · 投影 16 / 无投影 12", '<div class="card-grid-gap">' + cardSpec({ style: "shadow-small" }) + cardSpec({ style: "bordered" }) + "</div>")
        ], "元素关系越亲密间距越小；文本左对齐，图片与操作右对齐") + row("交互说明 · 拖拽", [
          cell("Normal", cardSpec({ title: "应用 08", draggable: true })),
          cell("Hover & Pressed", cardSpec({ title: "应用 09", state: "hover", draggable: true })),
          cell("拖拽态 · 95% / Shadow-L", cardSpec({ title: "应用 10", state: "dragging", draggable: true }))
        ], "拖起时提升卡片高度和阴影，不碰撞或移动其它卡片") + row("交互说明 · 状态", [
          cell("Normal · 描边", cardSpec({ style: "bordered", icon: "description" })),
          cell("Hover / Pressed · Shadow-M", cardSpec({ style: "bordered", state: "hover", icon: "description" })),
          cell("Selected · 蓝色外框", cardSpec({ style: "bordered", state: "selected", icon: "description" })),
          cell("有投影 · Hover Shadow-L", cardSpec({ style: "shadow-small", state: "hover", icon: "description" }))
        ], "无投影的并排卡片可用蓝色外框表达选择，不依赖装饰性标签");
  }

  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var cardVariants = ["basic", "compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive"];
  var cardLabels = { basic: "基础卡片", compact: "简洁卡片", cover: "封面卡片", meta: "Meta 图文", "external-grid": "栅格卡片", "content-grid": "内容区隔", nested: "内部卡片", tabs: "带 Tabs", actions: "底部 actions", interactive: "整体可点击" };
  var appearances = ["bordered", "borderless"];

  function normalizeSelection(selection, changedKey) {
    if (changedKey === "variant" && selection.variant === "interactive") {
      selection.appearance = "bordered"; selection.hoverable = "true"; selection.loading = "false";
      selection.extraAction = "none"; selection.footerAction = "none";
    } else if (changedKey === "variant") {
      selection.selected = "false";
    }
    if (selection.variant === "actions") selection.loading = "false";
    if (changedKey === "loading" && selection.loading === "true") {
      selection.selected = "false"; selection.extraAction = "none"; selection.footerAction = "none";
    }
    return selection;
  }
  function isSelectionAllowed(selection) {
    if (selection.variant === "interactive") return selection.appearance === "bordered" && selection.hoverable === "true" && selection.loading === "false" && selection.extraAction === "none" && selection.footerAction === "none";
    if (selection.variant === "actions" && selection.loading === "true") return false;
    if (selection.selected === "true") return false;
    if (selection.loading === "true" && (selection.extraAction !== "none" || selection.footerAction !== "none")) return false;
    return true;
  }
  function resolveSelection(selection) {
    var interactive = selection.variant === "interactive";
    var loading = selection.loading === "true";
    var props = {
      variant: selection.variant, appearance: selection.appearance, size: selection.size,
      title: interactive ? "项目工作台" : "Universe Design System",
      body: interactive ? "进入项目查看任务、成员和最新动态。" : "企业级设计语言与前端组件库。",
      meta: interactive ? "" : "今天更新", icon: interactive ? "dashboard" : "description",
      hoverable: selection.hoverable === "true", selected: selection.selected === "true", loading: loading,
      extraActionLabel: selection.extraAction === "none" ? null : "更多", footerActionLabel: selection.footerAction === "none" ? null : "查看详情",
      coverImage: null, coverAlt: "", avatar: null, items: [], columns: 3, tabs: [], activeTabId: null, actions: []
    };
    if (selection.variant === "compact") { props.body = ""; props.meta = ""; props.avatar = { text: "林", image: null, fallback: "林", label: "林七七" }; props.footerActionLabel = null; }
    if (selection.variant === "meta" || selection.variant === "actions") { props.coverImage = "templates/assets/people-lake-hero.png"; props.coverAlt = "湖边人物"; props.avatar = { text: "林", image: null, fallback: "林", label: "林七七" }; props.extraActionLabel = null; props.footerActionLabel = null; }
    if (["external-grid", "content-grid", "nested"].indexOf(selection.variant) >= 0) {
      props.extraActionLabel = selection.variant === "content-grid" ? props.extraActionLabel : null; props.footerActionLabel = null;
      props.items = [{ id: "item-1", title: "项目进度", body: "已完成 72%", meta: "今天更新", hoverable: true, actionLabel: selection.variant === "content-grid" ? null : "查看" }, { id: "item-2", title: "待办事项", body: "12 项待处理", meta: "", hoverable: false, actionLabel: null }, { id: "item-3", title: "团队成员", body: "24 人", meta: "", hoverable: true, actionLabel: null }, { id: "item-4", title: "安全状态", body: "无风险", meta: "", hoverable: false, actionLabel: null }];
      props.columns = selection.variant === "content-grid" ? 4 : 2;
    }
    if (selection.variant === "tabs") { props.footerActionLabel = null; props.tabs = [{ id: "tab-1", label: "概览", content: "项目概览内容", disabled: false }, { id: "tab-2", label: "活动", content: "最近活动内容", disabled: false }, { id: "tab-3", label: "设置", content: "项目设置内容", disabled: false }]; props.activeTabId = "tab-1"; }
    if (selection.variant === "actions") props.actions = [{ id: "like", label: "点赞", icon: "thumb_up" }, { id: "share", label: "分享", icon: "share" }, { id: "more", label: "更多", icon: "more_horiz" }];
    return {
      category: interactive ? "入口卡片" : ["external-grid", "content-grid", "nested", "tabs"].indexOf(selection.variant) >= 0 ? "组合卡片" : "信息卡片",
      label: cardLabels[selection.variant] + " · " + selection.appearance + (loading ? " · 加载" : ""),
      description: loading ? "C-34 组合 C-47 Skeleton。" : "C-34 通过正式 Renderer 组合头像、操作、子卡片或 Tabs。",
      interaction: interactive ? "点击或 Enter/Space 切换选择。" : loading ? "加载态通过 aria-busy 与 status 暴露。" : "悬浮、子操作与 Tabs 均为真实交互。",
      props: props,
      parameterKeys: ["variant", "appearance", "size", "title", "body", "meta", "icon", "hoverable", "selected", "loading", "extraActionLabel", "footerActionLabel", "coverImage", "coverAlt", "avatar", "items", "columns", "tabs", "activeTabId", "actions"]
    };
  }
  var docsConfig = {
    id: "C-34", title: "Card 卡片",
    introduction: "覆盖基础、简洁、Meta、栅格、内容区隔、嵌套、Tabs、Skeleton 与 actions；所有子能力由正式 Renderer 组合。",
    categories: [
      { name: "信息卡片", description: "基础、简洁、封面、Meta 与 actions 形态。" },
      { name: "组合卡片", description: "外部栅格、内容区隔、嵌套与 Tabs。" },
      { name: "入口卡片", description: "整卡原生按钮形成单一触控区，选择是交互状态而非 variant。" },
      { name: "正式依赖", description: "C-03/C-04/C-32/C-41/C-47 分别拥有操作、头像、Tabs 和 Skeleton。" }
    ],
    variants: cardVariants.map(function (variant) { return { key: variant, label: cardLabels[variant], category: variant === "interactive" ? "入口卡片" : ["external-grid", "content-grid", "nested", "tabs"].indexOf(variant) >= 0 ? "组合卡片" : "信息卡片" }; }),
    controlsEyebrow: "全部合法变体与交互", controlsHeading: "类型、外观、悬浮、选择、加载与操作区",
    controlGroups: [
      { key: "variant", label: "类型", options: cardVariants.map(function (value) { return { value: value, label: cardLabels[value] }; }) },
      { key: "appearance", label: "外观", options: appearances.map(function (value) { return { value: value, label: value }; }) },
      { key: "size", label: "尺寸", options: [{ value: "default", label: "Default" }, { value: "small", label: "Small" }] },
      { key: "hoverable", label: "悬浮反馈", options: [{ value: "false", label: "Off" }, { value: "true", label: "On" }] },
      { key: "selected", label: "选择状态", options: [{ value: "false", label: "Off" }, { value: "true", label: "On" }] },
      { key: "loading", label: "加载状态", options: [{ value: "false", label: "Off" }, { value: "true", label: "On" }] },
      { key: "extraAction", label: "额外操作", options: [{ value: "none", label: "None" }, { value: "more", label: "更多" }] },
      { key: "footerAction", label: "页脚操作", options: [{ value: "none", label: "None" }, { value: "detail", label: "查看详情" }] }
    ],
    initialSelection: { variant: "basic", appearance: "bordered", size: "default", hoverable: "true", selected: "false", loading: "false", extraAction: "more", footerAction: "detail" },
    variantCoverage: cardVariants.slice(), normalizeSelection: normalizeSelection, isSelectionAllowed: isSelectionAllowed,
    invalidSelectionReason: function () { return "interactive 固定 bordered/hoverable；selected 仅属于 interactive；loading 不与 actions/操作组合"; },
    resolveSelection: resolveSelection,
    syncSelectionFromEvent: function (name, event, selection) {
      if (name === "b2b:card-selection-change" && selection.variant === "interactive") selection.selected = event.detail && event.detail.selected ? "true" : "false";
      return selection;
    },
    events: ["b2b:card-activate", "b2b:card-selection-change", "b2b:card-action", "b2b:card-tab-change", "b2b:card-media-fallback"], slotSelector: "#card-slot"
  };
  function mountSpecimen(scope) {
    if (!docsApi) return Promise.resolve([]); var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-34"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-34"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-34"]');
    if (!card) return Promise.resolve([]); var preview = card.querySelector(":scope > .component-preview"); if (!preview) return Promise.resolve([]);
    docsRevision += 1; var current = docsRevision; var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-34"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true; preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig)); var docs = preview.nextElementSibling;
    return docsApi.mount(docsConfig, docs).then(function (result) { return current === docsRevision ? result : []; });
  }
  document.addEventListener("b2b:specimens-rendered", function (event) { mountSpecimen(event.detail && event.detail.root ? event.detail.root : document); });
  D.registerComponent("C-34", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
