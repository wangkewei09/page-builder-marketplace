(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function tagAddButton() {
    return '<button class="tag-add-button" type="button" data-source-tag-add aria-label="新增筛选标签">' + H.icon("add") + "<span>新增标签</span></button>";
  }

  function managedTags() {
    return H.tagSpec({ type: "option", text: "Customer feedback", color: "blue", closable: true })
      + H.tagSpec({ type: "option", text: "External", color: "purple", closable: true })
      + H.tagSpec({ type: "option", text: "Needs review", color: "orange", closable: true })
      + tagAddButton();
  }

  function interactionDemo() {
    var tags = managedTags();
    return '<div class="tag-interaction-demo" data-tag-demo>'
      + '<div class="tag-demo-heading"><span><strong>筛选条件</strong><small>点击关闭或新增，观察列表的连续过渡</small></span><output data-tag-feedback aria-live="polite">已选择 3 个标签</output></div>'
      + '<div class="tag-demo-list" data-tag-list>' + tags + "</div>"
      + '<div class="tag-demo-footer"><button type="button" data-source-tag-restore>' + H.icon("refresh") + "恢复初始标签</button><span>关闭后焦点会回到相邻操作</span></div>"
      + '<template data-tag-template>' + tags + "</template>"
      + "</div>";
  }

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var tagSpec = H.tagSpec;
        return row("使用规则", [cell("标记属性、维度或状态", '<div class="source-tag-row">' + tagSpec({ text: "Customer feedback" }) + tagSpec({ text: "External", color: "blue" }) + "</div>")], "文案简洁易读；标签会增加视觉噪音，应克制使用") + row("组成要素", [
          cell("文本 / 容器 / 前置图标 / 关闭图标 / 头像", '<div class="source-tag-row tag-anatomy">' + tagSpec({ type: "property", text: "Guidance", icon: "info", closable: true }) + tagSpec({ type: "avatar", text: "Jessica", avatar: "J", closable: true }) + "</div>")
        ]) + row("组件类型 · 类型总览", [
          cell("属性标签", tagSpec({ type: "property" })), cell("选项标签", tagSpec({ type: "option", closable: true })), cell("状态标签", tagSpec({ type: "status", text: "Completed", icon: "check", color: "green" })), cell("头像标签", tagSpec({ type: "avatar", text: "Jessica", avatar: "J", closable: true }))
        ]) + row("互动演示 · 关闭与新增", [
          cell("可关闭、可新增、可恢复；列表更新有明确反馈", interactionDemo(), "is-wide")
        ], "参考 Arco Tag 的 closable / visible 行为，关闭、进入和恢复均保留连续动效") + row("可选择标签 · 点击切换", [
          cell("未选择", '<div class="tag-check-group" data-tag-check-group>' + tagSpec({ type: "option", text: "需求", color: "blue", checkable: true, checked: false }) + tagSpec({ type: "option", text: "缺陷", color: "red", checkable: true, checked: false }) + '<output aria-live="polite">当前未选择</output></div>'),
          cell("已选择", '<div class="tag-check-group" data-tag-check-group>' + tagSpec({ type: "option", text: "高优先级", color: "purple", checkable: true, checked: true }) + tagSpec({ type: "option", text: "跟进中", color: "green", checkable: true, checked: true }) + '<output aria-live="polite">已选择 2 项</output></div>'),
          cell("加载 / 描边", '<div class="source-tag-row">' + tagSpec({ type: "option", text: "同步中", color: "blue", loading: true }) + tagSpec({ type: "option", text: "已归档", color: "neutral", bordered: true }) + "</div>")
        ]) + row("属性标签 · 使用方式与颜色", [
          cell("单个或成组", '<div class="source-tag-row">' + tagSpec({ text: "Customer feedback" }) + tagSpec({ text: "External", color: "blue" }) + tagSpec({ text: "Guidance", icon: "info", color: "purple" }) + "</div>"),
          cell("13 种配色", '<div class="source-tag-row">' + ["neutral","blue","green","red","orange","purple","cyan","yellow"].map(function (color) { return tagSpec({ text: "Tag", color: color }); }).join("") + "</div>"),
          cell("透明底 · 常规背景", tagSpec({ text: "Tag", color: "blue" })), cell("实色底 · 非常规背景", '<div class="tag-dark-stage">' + tagSpec({ text: "Tag", color: "blue", solid: true }) + "</div>")
        ], "Icon、文字、关闭可选，但不可只配置关闭按钮") + row("属性标签 · 状态", [
          cell("Normal", tagSpec({ closable: true })), cell("Hover", tagSpec({ closable: true, state: "hover" })), cell("Press", tagSpec({ closable: true, state: "pressed" })), cell("Disabled", tagSpec({ closable: true, state: "disabled" }))
        ]) + row("属性标签 · 使用示例", [
          cell("正确 · 描述部门性质", '<div class="tag-practice is-correct"><span>Customer feedback</span>' + tagSpec({ text: "External" }) + "</div>"),
          cell("避免 · 用属性标签代表物件本身", '<div class="tag-practice is-avoid">' + tagSpec({ text: "Content 3" }) + tagSpec({ text: "Content 4" }) + "</div>"),
          cell("非常规背景使用实色", '<div class="tag-dark-stage">' + tagSpec({ text: "Product Design Review", solid: true, color: "blue" }) + "</div>")
        ]) + row("选项标签 · 尺寸系统", [
          cell("Extra-Small · 16px", tagSpec({ type: "option", text: "Options tag", size: "extra-small", closable: true }), "is-tag-size-example"),
          cell("Small · 20px", tagSpec({ type: "option", text: "Options tag", size: "small", closable: true }), "is-tag-size-example"),
          cell("Medium · 24px", tagSpec({ type: "option", text: "Options tag", size: "medium", closable: true }), "is-tag-size-example"),
          cell("Large · 32px", tagSpec({ type: "option", text: "Options tag", size: "large", closable: true }), "is-tag-size-example")
        ], "主尺寸 Small / Medium / Large 对应 20 / 24 / 32px；Extra-Small 16px 保留源图兼容") + row("选项标签 · 状态与颜色", [
          cell("Normal / Hover / Press / Disabled", '<div class="source-tag-row">' + tagSpec({ type: "option", text: "Normal", closable: true }) + tagSpec({ type: "option", text: "Hover", closable: true, state: "hover" }) + tagSpec({ type: "option", text: "Press", closable: true, state: "pressed" }) + tagSpec({ type: "option", text: "Disabled", closable: true, state: "disabled" }) + "</div>"),
          cell("彩色选项标签", '<div class="source-tag-row">' + ["blue","green","red","orange","purple","cyan"].map(function (color) { return tagSpec({ type: "option", text: "Options tag", color: color, closable: true }); }).join("") + "</div>")
        ]) + row("选项标签 · 位置与缺省", [
          cell("与相邻元素间距 4/8px", '<div class="tag-field-row"><span>Lily James</span>' + tagSpec({ type: "option", text: "Bug" }) + "</div>"),
          cell("完整内容 / +4", '<div class="source-tag-row is-nowrap">' + tagSpec({ type: "option", text: "Content text extreme case", closable: true }) + tagSpec({ type: "option", text: "Content 3", closable: true }) + tagSpec({ type: "option", text: "+4" }) + "</div>")
        ]) + row("状态标签 · 使用场景与颜色", [
          cell("蓝 · 进行中/审批中", tagSpec({ type: "status", text: "In progress", color: "blue", icon: "progress_activity" })),
          cell("绿 · 通过/成功/完成", tagSpec({ type: "status", text: "Completed", color: "green", icon: "check" })),
          cell("红 · 失败/错误/驳回", tagSpec({ type: "status", text: "Rejected", color: "red", icon: "close" })),
          cell("橙 · 待处理/待启用", tagSpec({ type: "status", text: "Pending", color: "orange", icon: "schedule" })),
          cell("灰 · 未开始/取消", tagSpec({ type: "status", text: "Not started", color: "neutral", icon: "circle" }))
        ], "状态标签用于列表、详情、流程和表单；语义同时由文字表达") + row("状态标签 · 缺省与文本", [
          cell("内容完整展示", '<div class="tag-truncate-stage">' + tagSpec({ type: "status", text: "It is a long long tag content", color: "blue" }) + "</div>"),
          cell("Medium · 24px（默认）", tagSpec({ type: "status", text: "Completed", color: "green" })),
          cell("Large · 32px", tagSpec({ type: "status", text: "Completed", color: "green", size: "large" }), "is-tag-size-example")
        ]) + row("头像标签 · 使用场景与尺寸", [
          cell("人员姓名 / 照片 · 表单选择器", '<div class="source-tag-row">' + tagSpec({ type: "avatar", text: "Leon", avatar: "L", closable: true }) + tagSpec({ type: "avatar", text: "Lynn Lee", avatar: "LL", closable: true }) + tagSpec({ type: "avatar", text: "Julette", avatar: "J" }) + "</div>"),
          cell("高度 24px（默认）", tagSpec({ type: "avatar", text: "Name", avatar: "N", closable: true }))
        ]) + row("头像标签 · 状态与颜色", [
          cell("普通 / 移除双热区", '<div class="source-tag-row">' + tagSpec({ type: "avatar", text: "Name", avatar: "N" }) + tagSpec({ type: "avatar", text: "Name", avatar: "N", closable: true }) + "</div>"),
          cell("Normal / Hover / Press / Disabled", '<div class="source-tag-row">' + tagSpec({ type: "avatar", text: "Name", avatar: "N", closable: true }) + tagSpec({ type: "avatar", text: "Name", avatar: "N", closable: true, state: "hover" }) + tagSpec({ type: "avatar", text: "Name", avatar: "N", closable: true, state: "pressed" }) + tagSpec({ type: "avatar", text: "Name", avatar: "N", closable: true, state: "disabled" }) + "</div>"),
          cell("灰色 / 浅蓝色", '<div class="source-tag-row">' + tagSpec({ type: "avatar", text: "Person", avatar: "P" }) + tagSpec({ type: "avatar", text: "Organization", avatar: "O", color: "blue" }) + "</div>")
        ]) + row("头像标签 · 缺省与位置", [
          cell("长姓名完整展示 / +4", '<div class="tag-avatar-overflow">' + tagSpec({ type: "avatar", text: "Pablo Diego Jose Francisco de Paula", avatar: "P", closable: true }) + tagSpec({ type: "avatar", text: "+4" }) + "</div>"),
          cell("水平与垂直间距 8px", '<div class="source-tag-row is-wrap">' + ["Leon","Julette","Lynn Lee","William","James"].map(function (name) { return tagSpec({ type: "avatar", text: name, avatar: name[0] }); }).join("") + "</div>")
        ]) + row("使用示例", [
          cell("正确 · - 表层级，（）表说明", tagSpec({ text: "Organization-Tenant-Department（External）", color: "blue" })),
          cell("避免 · Tag 中嵌套 Tag", '<div class="tag-practice is-avoid">Organization / ' + tagSpec({ text: "Tenant" }) + "</div>")
        ]);
  }

  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var variants = ["status", "category", "filter", "closable", "checkable", "loading", "bordered"];
  var variantLabels = {
    status: "状态标签", category: "分类标签", filter: "筛选标签", closable: "可关闭",
    checkable: "可选择", loading: "加载中", bordered: "描边标签"
  };
  var variantCategories = {
    status: "状态与反馈", loading: "状态与反馈",
    category: "分类与属性", bordered: "分类与属性",
    filter: "选择与移除", closable: "选择与移除", checkable: "选择与移除"
  };
  var presetProps = {
    status: { type: "status", size: "medium", text: "进行中", color: "blue", icon: "progress_activity" },
    category: { type: "property", size: "medium", text: "设计系统", color: "purple", bordered: true },
    filter: { type: "option", size: "medium", text: "仅看进行中", color: "blue", checkable: true, checked: true },
    closable: { type: "option", size: "medium", text: "Design", color: "blue", closable: true },
    checkable: { type: "option", size: "medium", text: "已选择", color: "blue", checkable: true, checked: true },
    loading: { type: "option", size: "medium", text: "处理中", color: "blue", loading: true },
    bordered: { type: "property", size: "medium", text: "有边框标签", color: "neutral", bordered: true }
  };
  var allParameterKeys = ["variant", "type", "size", "color", "text", "icon", "avatar", "closable", "checkable", "checked", "loading", "bordered", "solid", "disabled"];

  function buildProps(selection) {
    var props = Object.assign({
      variant: selection.variant, icon: null, avatar: null, closable: false, checkable: false,
      checked: false, loading: false, bordered: false, solid: false, disabled: false
    }, presetProps[selection.variant]);
    props.variant = selection.variant;
    if (selection.type !== "preset") props.type = selection.type;
    props.size = selection.size;
    props.color = selection.color;
    if (selection.interaction !== "preset") {
      props.closable = selection.interaction === "closable";
      props.checkable = selection.interaction === "checkable-off" || selection.interaction === "checkable-on";
      props.checked = selection.interaction === "checkable-on";
    }
    if (selection.feedback !== "preset") {
      props.loading = selection.feedback === "loading";
      props.disabled = selection.feedback === "disabled";
    }
    if (selection.surface !== "preset") {
      props.bordered = selection.surface === "bordered";
      props.solid = selection.surface === "solid";
    }
    props.text = selection.content === "long" ? "跨团队产品设计评审与交付状态" : props.text;
    if (props.type === "avatar") {
      props.avatar = "AI";
      props.icon = null;
    } else {
      props.avatar = null;
    }
    if (selection.content === "no-leading") { props.icon = null; props.avatar = null; }
    if (props.checkable) props.closable = false;
    if (!props.checkable) props.checked = false;
    return props;
  }

  function invalidSelectionReason(selection) {
    var props = buildProps(selection);
    if (props.checkable && props.closable) return "可选择与可关闭会形成嵌套 button，canonical source 不支持该组合";
    if (props.type === "avatar" && !props.avatar) return "头像标签必须提供 avatar";
    if (props.type !== "avatar" && props.avatar) return "avatar 只适用于头像标签";
    if (props.type === "avatar" && props.icon) return "头像与图标共用同一前置槽位";
    return "";
  }

  function isSelectionAllowed(selection) {
    return !invalidSelectionReason(selection);
  }

  function resolveSelection(selection) {
    var reason = invalidSelectionReason(selection);
    if (reason) throw new Error(reason);
    var props = buildProps(selection);
    var state = props.loading ? "Loading" : props.disabled ? "Disabled" : props.checkable ? (props.checked ? "Checked" : "Unchecked") : props.closable ? "Closable" : "Static";
    return {
      category: variantCategories[selection.variant],
      label: variantLabels[selection.variant] + " · " + props.type + " · " + props.size + " · " + state,
      description: "当前组合直接调用 H.tagSpec canonical factory；尺寸、颜色、前置内容、边框与交互状态均由真实 Renderer 输出。",
      interaction: props.checkable ? "点击或聚焦后按 Space/Enter；每次状态提交只触发一次 b2b:tag-change。" : props.closable ? "点击关闭按钮触发一次 b2b:tag-close；源交互完成离场后展示页恢复可观察实例。" : "Hover、Focus 与 Pressed 请直接操作真实标签；静态标签不发出公开事件。",
      props: props,
      parameterKeys: allParameterKeys.slice()
    };
  }

  function syncSelectionFromEvent(name, event, selection) {
    if (name === "b2b:tag-change") selection.interaction = event.detail && event.detail.checked ? "checkable-on" : "checkable-off";
    return selection;
  }

  var docsConfig = {
    id: "C-42",
    title: "Tag 标签",
    introduction: "用于表达状态、分类、属性或已选筛选条件。Renderer 是 H.tagSpec 的薄适配层，复用 C-42 原样式与 shared interactions，负责 DOM、状态、键盘、焦点、ARIA、进入/离开动效和 b2b:tag-* 事件。",
    categories: [
      { name: "状态与反馈", description: "状态与加载标签用于列表、流程、详情和异步反馈，语义同时由文字表达。" },
      { name: "分类与属性", description: "分类、属性与描边标签标记业务维度，避免用装饰性标签制造噪音。" },
      { name: "选择与移除", description: "筛选、可选择和可关闭标签提供明确的选择或移除路径。" }
    ],
    variants: variants.map(function (variant) { return { key: variant, label: variantLabels[variant], category: variantCategories[variant] }; }),
    controlsEyebrow: "全部变体维度与真实交互",
    controlsHeading: "组合 Tag 维度，操作真实 Renderer",
    controlGroups: [
      { key: "variant", label: "业务变体", options: variants.map(function (variant) { return { value: variant, label: variantLabels[variant] }; }) },
      { key: "type", label: "组件类型", options: [{ value: "preset", label: "跟随变体" }, { value: "property", label: "Property" }, { value: "option", label: "Option" }, { value: "status", label: "Status" }, { value: "avatar", label: "Avatar" }] },
      { key: "size", label: "尺寸", options: [{ value: "extra-small", label: "16px" }, { value: "small", label: "20px" }, { value: "medium", label: "24px" }, { value: "large", label: "32px" }] },
      { key: "color", label: "颜色", options: ["neutral", "blue", "green", "red", "orange", "purple", "cyan", "yellow"].map(function (color) { return { value: color, label: color }; }) },
      { key: "interaction", label: "交互", note: "Hover / Focus / Pressed 请直接操作组件", options: [{ value: "preset", label: "跟随变体" }, { value: "static", label: "静态" }, { value: "closable", label: "可关闭" }, { value: "checkable-off", label: "未选择" }, { value: "checkable-on", label: "已选择" }] },
      { key: "feedback", label: "反馈状态", options: [{ value: "preset", label: "跟随变体" }, { value: "default", label: "Default" }, { value: "loading", label: "Loading" }, { value: "disabled", label: "Disabled" }] },
      { key: "surface", label: "表面", options: [{ value: "preset", label: "跟随变体" }, { value: "default", label: "Default" }, { value: "bordered", label: "Bordered" }, { value: "solid", label: "Solid" }] },
      { key: "content", label: "内容", options: [{ value: "standard", label: "标准文案" }, { value: "long", label: "长文案" }, { value: "no-leading", label: "无前置内容" }] }
    ],
    initialSelection: { variant: "status", type: "preset", size: "medium", color: "blue", interaction: "preset", feedback: "preset", surface: "preset", content: "standard" },
    variantCoverage: variants.slice(),
    isSelectionAllowed: isSelectionAllowed,
    invalidSelectionReason: invalidSelectionReason,
    resolveSelection: resolveSelection,
    syncSelectionFromEvent: syncSelectionFromEvent,
    events: ["b2b:tag-change", "b2b:tag-close"],
    slotSelector: "#tag-slot"
  };

  function mountSpecimen(scope) {
    if (!docsApi) return Promise.resolve([]);
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-42"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-42"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-42"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1;
    var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-42"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    docs.addEventListener("b2b:tag-close", function () {
      window.setTimeout(function () {
        if (current !== docsRevision || !docs.isConnected) return;
        var restore = docs.querySelector('button[data-component-docs-control="interaction"][data-component-docs-value="static"]');
        if (restore && !restore.disabled) restore.click();
      }, 240);
    });
    return docsApi.mount(docsConfig, docs).then(function (result) { return current === docsRevision ? result : []; });
  }

  document.addEventListener("b2b:specimens-rendered", function (event) {
    mountSpecimen(event.detail && event.detail.root ? event.detail.root : document);
  });

  D.registerComponent("C-42", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
