(function registerBasicButtonSpecimen() {
  "use strict";

  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var docsApi = D.componentApiDocs;
  var variants = [
    { value: "primary", label: "Primary 主要按钮", category: "主要操作" },
    { value: "danger", label: "Danger 主要危险按钮", category: "危险操作" },
    { value: "secondary-blue", label: "Secondary Blue 蓝色次要按钮", category: "次要操作" },
    { value: "secondary-danger", label: "Secondary Danger 次要危险按钮", category: "危险操作" },
    { value: "secondary-gray", label: "Secondary Gray 灰色次要按钮", category: "次要操作" }
  ];
  var sizes = [
    { value: "mini", label: "mini 24px" },
    { value: "small", label: "small 28px" },
    { value: "medium", label: "medium 32px" },
    { value: "large", label: "large 36px" },
    { value: "xlarge", label: "xlarge 40px" }
  ];

  function renderSpecimen() {
    return H.row("冻结源变体", variants.map(function (item) {
      return H.cell(item.label, H.sourceBasicButton({ variant: item.value, label: item.label, size: "medium", width: "default" }));
    }), "展示页使用独立的生产 Renderer，不克隆此 specimen DOM。");
  }

  function meta(value) { return variants.find(function (item) { return item.value === value; }); }

  function resolveSelection(selection) {
    var variant = meta(selection.variant);
    var loading = selection.state === "loading";
    var disabled = selection.state === "disabled";
    var label = loading ? "保存中" : selection.variant === "danger" ? "删除" : selection.variant === "secondary-danger" ? "移除" : selection.variant === "secondary-gray" ? "取消" : "保存";
    var props = {
      label: label,
      variant: selection.variant,
      size: selection.size,
      icon: selection.content === "icon" ? (loading ? null : "save") : null,
      disabled: disabled,
      loading: loading,
      width: selection.width
    };
    return {
      category: variant.category,
      label: variant.label,
      description: "用于立即动作并表达操作优先级。Renderer 保持 canonical 高度、padding、字号、圆角、图标、Loading 几何与宽度行为。",
      interaction: disabled || loading ? "Disabled / Loading 不派发激活事件；切换到 Default 后用鼠标、Enter 或 Space 验证单次激活。" : "直接点击，或 Tab 聚焦后用 Enter / Space 激活；每次只派发一次 b2b:button-activate。",
      props: props,
      parameterKeys: ["label", "variant", "size", "width", "icon", "disabled", "loading"]
    };
  }

  var docsConfig = {
    id: "C-02",
    title: "Basic Button 基础按钮",
    introduction: "触发立即动作并表达主要、次要或危险优先级。Renderer 负责 canonical DOM、尺寸、状态、原生键盘与单次公开事件；页面只提供业务文案并监听 b2b:button-activate。",
    categories: [
      { name: "主要操作", description: "一个操作区只保留一个 Primary，用于保存、创建或确认。" },
      { name: "次要操作", description: "蓝色次要用于需一定强调的辅助动作；灰色次要用于取消、返回。" },
      { name: "危险操作", description: "Danger 与 Secondary danger 必须用直接描述后果的文案。" }
    ],
    variants: variants.map(function (item) { return { key: item.value, label: item.label, category: item.category, props: { variant: item.value } }; }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "按维度选择，操作真实 Basic Button",
    controlGroups: [
      { key: "variant", label: "样式", options: variants },
      { key: "size", label: "尺寸", options: sizes },
      { key: "state", label: "状态", note: "Hover、Pressed、Focus 请直接操作组件", options: [{ value: "default", label: "Default 默认" }, { value: "loading", label: "Loading 加载中" }, { value: "disabled", label: "Disabled 禁用" }] },
      { key: "content", label: "内容", options: [{ value: "icon", label: "Icon 前置图标" }, { value: "text", label: "Text 纯文字" }] },
      { key: "width", label: "宽度", options: [{ value: "default", label: "Default 默认宽度" }, { value: "long", label: "Long 长按钮" }] }
    ],
    initialSelection: { variant: "secondary-gray", size: "medium", state: "default", content: "text", width: "default" },
    variantCoverage: variants.map(function (item) { return item.value; }),
    resolveSelection: resolveSelection,
    events: ["b2b:button-activate"],
    slotSelector: "#c02-basic-button-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-02"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-02"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-02"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview || !docsApi) return Promise.resolve([]);
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-02"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    docs.querySelector("[data-component-docs-mount]").id = "c02-basic-button-slot";
    return docsApi.mount(docsConfig, docs);
  }

  document.addEventListener("b2b:specimens-rendered", function (event) { mountSpecimen(event.detail && event.detail.root ? event.detail.root : document); });
  D.registerComponent("C-02", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
