(function registerRoundedButtonSpecimen() {
  "use strict";

  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var docsApi = D.componentApiDocs;
  var variants = [
    { value: "Primary", label: "Primary 主要按钮", category: "营销主行动" },
    { value: "Secondary-Primary", label: "Secondary 蓝色次要按钮", category: "营销次行动" },
    { value: "Outlined", label: "Outlined 灰边白底", category: "营销次行动" }
  ];

  function renderSpecimen() {
    return H.row("冻结源变体", [
      H.cell("Primary", H.sourceRoundedButton({ variant: "Primary", label: "立即体验", size: "xlarge", width: "default", icon: "campaign", iconPlacement: "leading" })),
      H.cell("Secondary-Primary", H.sourceRoundedButton({ variant: "Secondary-Primary", label: "了解更多", size: "xlarge", width: "default", icon: null, iconPlacement: "none" })),
      H.cell("Outlined", H.sourceRoundedButton({ variant: "Outlined", label: "查看详情", size: "xlarge", width: "default", icon: "chevron_right", iconPlacement: "trailing" }))
    ], "冻结证据仅供对照；正式目标区始终通过 C-05 Renderer 创建单个真实实例。");
  }

  function meta(value) { return variants.find(function (item) { return item.value === value; }); }

  function codeAnnotation(props) {
    var variantNotes = { Primary: "蓝色实心营销主行动", "Secondary-Primary": "蓝色描边营销次行动", Outlined: "灰色描边白底次行动" };
    var sizeNotes = { mini: "24px", small: "28px", medium: "32px（默认）", large: "36px", xlarge: "40px" };
    var iconNote = props.iconPlacement === "none" ? "无图标" : (props.iconPlacement === "leading" ? "前置普通功能图标" : "后置固定 chevron_right 箭头");
    return "// variant=\"" + props.variant + "\" — " + variantNotes[props.variant] + "\n" +
      "// size=\"" + props.size + "\" — " + sizeNotes[props.size] + " 控件高度/交互热区\n" +
      "// width=\"" + props.width + "\" — " + (props.width === "long" ? "填满 caller 可用容器" : "按内容自然宽度") + "\n" +
      "// icon=" + JSON.stringify(props.icon) + ", iconPlacement=\"" + props.iconPlacement + "\" — " + iconNote + "\n" +
      "// disabled=" + props.disabled + ", loading=" + props.loading + " — " + (props.disabled ? "禁用，不触发激活" : (props.loading ? "加载中，不触发激活" : "默认可交互"));
  }

  function parameterAnnotation(name, value, props, schema) {
    var variantsByValue = { Primary: "Primary 蓝色实心营销主行动", "Secondary-Primary": "Secondary-Primary 蓝色描边营销次行动", Outlined: "Outlined 灰色描边白底次行动" };
    var sizesByValue = { mini: "mini 对应 24px 按钮高度与交互热区。", small: "small 对应 28px 按钮高度与交互热区。", medium: "medium 对应 32px 按钮高度与交互热区（默认）。", large: "large 对应 36px 按钮高度与交互热区。", xlarge: "xlarge 对应 40px 按钮高度与交互热区。" };
    if (name === "variant") return variantsByValue[value];
    if (name === "size") return sizesByValue[value];
    if (name === "width") return value === "long" ? "long 填满 caller 可用容器（width:100%、min-width:0）。" : "default 按内容形成自然宽度，不填满 caller。";
    if (name === "icon") return props.iconPlacement === "none" ? "null 表示无图标。" : (props.iconPlacement === "leading" ? value + " 是前置普通功能图标。" : "chevron_right 是固定的后置箭头图标。");
    if (name === "iconPlacement") return value === "none" ? "none 无图标。" : (value === "leading" ? "leading 将普通功能图标置于文字前。" : "trailing 将固定 chevron_right 箭头置于文字后。");
    if (name === "disabled") return value ? "true 禁用按钮，不可聚焦或激活，不派发事件。" : "false 未禁用。";
    if (name === "loading") return value ? "true 显示当前尺寸的 loading geometry、aria-busy=true，并阻止激活。" : "false 未加载。";
    return schema.description;
  }

  function resolveSelection(selection) {
    var variant = meta(selection.variant);
    var loading = selection.state === "loading";
    var disabled = selection.state === "disabled";
    var iconConfig = {
      none: { icon: null, iconPlacement: "none" },
      leading: { icon: "campaign", iconPlacement: "leading" },
      trailing: { icon: "chevron_right", iconPlacement: "trailing" }
    }[selection.iconMode];
    var props = {
      label: loading ? "加载中" : selection.variant === "Primary" ? "立即体验" : selection.variant === "Secondary-Primary" ? "了解更多" : "查看详情",
      variant: selection.variant,
      size: selection.size,
      width: selection.width,
      icon: iconConfig.icon,
      iconPlacement: iconConfig.iconPlacement,
      disabled: disabled,
      loading: loading
    };
    return {
      category: variant.category,
      label: variant.label + " · " + ({ mini: "mini 24px", small: "small 28px", medium: "medium 32px", large: "large 36px", xlarge: "xlarge 40px" }[selection.size]),
      description: "只用于产品活动、销售官网、社区或内容运营等营销引导。当前选择已同步到真实预览、AI 代码与 API 参数表。",
      interaction: props.disabled || props.loading ? "Disabled / Loading 阻止重复激活，不派发 b2b:rounded-activate。" : "点击或使用 Enter / Space 激活，每次只派发一次 b2b:rounded-activate。",
      props: props,
      parameterKeys: ["label", "variant", "size", "width", "icon", "iconPlacement", "disabled", "loading"]
    };
  }

  var docsConfig = {
    id: "C-05",
    title: "Rounded Button 全圆角按钮",
    introduction: "为营销和强引导点位提供全圆角主、次行动。Renderer 复用 Basic Button 的 canonical 能力并只变更源定义的 pill 容器；页面不得用 CSS 将 C-02 强制改为全圆角。",
    categories: [
      { name: "营销主行动", description: "Primary 用于立即体验、预约演示、活动参与等强引导行动。" },
      { name: "营销次行动", description: "Secondary-Primary 用蓝色描边；Outlined 用灰色描边白底。" }
    ],
    variants: variants.map(function (item) { return { key: item.value, label: item.label, category: item.category, props: { variant: item.value } }; }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "验证营销变体、尺寸和继承能力",
    showParameterDescriptions: true,
    codeAnnotation: codeAnnotation,
    parameterAnnotation: parameterAnnotation,
    controlGroups: [
      { key: "variant", label: "变体", options: variants },
      { key: "size", label: "尺寸", options: [{ value: "mini", label: "mini 24px" }, { value: "small", label: "small 28px" }, { value: "medium", label: "medium 32px" }, { value: "large", label: "large 36px" }, { value: "xlarge", label: "xlarge 40px" }] },
      { key: "width", label: "宽度", options: [{ value: "default", label: "Default 默认宽度" }, { value: "long", label: "Long 长按钮" }] },
      { key: "iconMode", label: "图标", options: [{ value: "none", label: "None 无图标" }, { value: "leading", label: "Leading 前置图标" }, { value: "trailing", label: "Trailing 后置箭头" }] },
      { key: "state", label: "状态", note: "Hover / Pressed / Focus 请直接操作组件", options: [{ value: "default", label: "Default 默认" }, { value: "loading", label: "Loading 加载" }, { value: "disabled", label: "Disabled 禁用" }] }
    ],
    initialSelection: { variant: "Primary", size: "medium", width: "default", iconMode: "none", state: "default" },
    variantCoverage: variants.map(function (item) { return item.value; }),
    resolveSelection: resolveSelection,
    events: ["b2b:rounded-activate"],
    slotSelector: "#c05-rounded-button-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-05"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-05"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-05"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview || !docsApi) return Promise.resolve([]);
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-05"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    docs.querySelector("[data-component-docs-mount]").id = "c05-rounded-button-slot";
    return docsApi.mount(docsConfig, docs);
  }

  document.addEventListener("b2b:specimens-rendered", function (event) { mountSpecimen(event.detail && event.detail.root ? event.detail.root : document); });
  D.registerComponent("C-05", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
