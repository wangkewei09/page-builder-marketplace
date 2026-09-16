(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var button = H.button;
    var input = H.input;
    var formField = H.formField;
    var inputSpec = H.inputSpec;
    var numberInputSpec = H.numberInputSpec;
    var affixInputSpec = H.affixInputSpec;
    var combinationInputSpec = H.combinationInputSpec;
    var combinationSelectSpec = H.combinationSelectSpec;
    var otpInputSpec = H.otpInputSpec;
    var textareaSpec = H.textareaSpec;
        return row("使用规则", [
          cell("按输入内容选择类型", '<ul class="input-rule-list"><li>基础：基本短文本</li><li>数字：有明确数值范围</li><li>图标：表达类型或附加操作</li><li>属性：固定单位、网址或语言</li></ul>'),
          cell("保持标签清晰", '<ul class="input-rule-list"><li>标签简洁、精确</li><li>宽度允许时可水平对齐</li><li>相同属性内容可共用标签</li><li>仅有一两个字段时标签可省略</li></ul>')
        ], "输入框用于填写、筛选、查询和搜索；类型由信息结构决定") + row("组成要素", [
          cell("容器 / 占位符 / 标签 / 必填提示 / 输入文本 / 前后图标 / 帮助校验", '<div class="input-anatomy"><div>' + formField("Label", { required: true, info: "字段说明", control: inputSpec({ prefix: "search", clear: true, value: "Text content" }), help: "Helper or Validation text" }) + '</div><ol><li>容器</li><li>占位符文本</li><li>标签区域</li><li>输入文本</li><li>辅助或校验文本</li></ol></div>')
        ], "源图标注编号仅用于说明，不进入真实输入框") + row("组件类型 · 类型总览", [
          cell("基础输入框", inputSpec({})), cell("数字输入框", numberInputSpec({})), cell("带图标输入框", inputSpec({ prefix: "search" })), cell("带属性输入框", affixInputSpec({})), cell("组合输入框", combinationInputSpec({})), cell("长文本输入框", textareaSpec({ counter: false }))
        ], "六种源图正式类型按信息性质区分") + row("基础输入框 · 状态说明", [
          cell("Normal", inputSpec({})), cell("Hover", inputSpec({ state: "hover" })), cell("Activated", inputSpec({ state: "activated", value: "Input text" })), cell("Inputting", inputSpec({ state: "inputting", value: "Input text" })), cell("Input complete", inputSpec({ state: "complete" })), cell("Disabled", inputSpec({ state: "disabled" })), cell("Readonly", inputSpec({ state: "readonly" })), cell("Error", inputSpec({ state: "error" }))
        ], "Error Hover 只改变指针，不改变危险描边；Disabled Hover 保持禁用") + row("基础输入框 · 差异化样式", [
          cell("无边界输入框", inputSpec({ borderless: true, value: "Profile status" })),
          cell("密码输入框", inputSpec({ password: true, value: "123456" })),
          cell("内容字数统计", inputSpec({ counter: true, maxLength: 20, value: "Input text" }))
        ], "无边界仅用于嵌入组件；密码默认隐藏；字数统计在输入框内右对齐并随输入更新") + row("基础输入框 · 尺寸说明", [
          cell("Small · 28px", inputSpec({ size: "small" })), cell("Medium · 32px", inputSpec({ size: "medium" })), cell("Large · 40px", inputSpec({ size: "large" }))
        ], "建议最小宽 240px、最大宽 600px；具体宽度仍按布局自适应") + row("数字输入框 · 状态说明", [
          cell("Default", numberInputSpec({})), cell("Hover input", numberInputSpec({ state: "hover-input" })), cell("Hover button", numberInputSpec({ state: "hover-button" })), cell("Inputting", numberInputSpec({ state: "inputting", value: 5 })), cell("Input complete", numberInputSpec({ state: "complete", value: 5 })), cell("Error", numberInputSpec({ state: "error" })), cell("Disabled", numberInputSpec({ state: "disabled", value: 5 })), cell("Readonly", numberInputSpec({ state: "readonly", value: 5 }))
        ], "步进按钮 Click 改变数值且限制在 min/max；只接受数值字符") + row("数字输入框 · 使用与尺寸", [
          cell("正确 · 明确范围", formField("申请设备数量", { control: numberInputSpec({ min: 1, max: 7, value: 5 }) })),
          cell("避免 · 随机编号", formField("设备编号", { control: numberInputSpec({ value: 24834123 }) })),
          cell("步进区固定 32px", '<div class="input-measure">' + numberInputSpec({}) + '<span>32px</span></div>')
        ], "随机编号不属于可计算数值，不应使用数字步进输入") + row("带图标输入框", [
          cell("语义图标", inputSpec({ prefix: "search" })), cell("引导图标", inputSpec({ suffix: "info" })), cell("清除按钮", inputSpec({ value: "Input text", clear: true })), cell("Hover icon", inputSpec({ state: "hover-icon", value: "Input text", clear: true }))
        ], "头部语义图标最多 1 个；尾部可有多个提示/清除操作") + row("带图标输入框 · 尺寸说明", [
          cell("距边 12px · 图文 8px", '<div class="input-measure has-icons">' + inputSpec({ prefix: "search", value: "Input text", clear: true, tag: "English" }) + '<span>12 / 8 / 8px</span></div>')
        ], "多个尾图标之间保持 8px，图标状态遵循按钮相关规则") + row("带属性输入框 · 固定与可切换前后缀", [
          cell("固定前缀 · Default", affixInputSpec({})), cell("固定前缀 · Inputting", affixInputSpec({ state: "inputting", value: "universe" })), cell("固定前缀 · Complete", affixInputSpec({ state: "complete", value: "universe.bytedance" })), cell("固定前缀 · Disabled", affixInputSpec({ state: "disabled", value: "universe.bytedance" })), cell("固定前缀 · Readonly", affixInputSpec({ state: "readonly", value: "universe.bytedance" })), cell("Error", affixInputSpec({ state: "error" })), cell("可切换单位", affixInputSpec({ toggle: true, prefix: "CM", placeholder: "Enter the Value" })), cell("单位菜单展开", affixInputSpec({ toggle: true, prefix: "CM", open: true, placeholder: "Enter the Value" }))
        ], "固定属性不可编辑；可切换属性点击后展开 MM/CM/DM 菜单，选中后回显并收起") + row("带属性输入框 · 标签与使用", [
          cell("语言标签 · Default", inputSpec({ tag: "English" })), cell("语言标签 · Complete", inputSpec({ tag: "English", value: "UniverseDesign" })), cell("货币单位", affixInputSpec({ toggle: true, prefix: "￥", items: ["￥", "$", "€"], value: "8888" })), cell("电话区号不是计量单位", affixInputSpec({ toggle: true, prefix: "+86", items: ["+86", "+1", "+44"], value: "13888888888" }))
        ], "标签表达输入内容属性；计量/货币单位与普通固定内容语义不同") + row("带属性输入框 · 尺寸说明", [
          cell("前后缀 70—300px · 输入区最小 120px", '<div class="input-measure is-affix">' + affixInputSpec({ toggle: true, prefix: "￥", items: ["￥", "$", "€"], value: "8888" }) + '<span>70 / 120px</span></div>')
        ], "前缀左对齐、后缀右对齐；最小宽度不因内容改变") + row("组合输入框 · 状态说明", [
          cell("Default", combinationInputSpec({})), cell("Hover", combinationInputSpec({ state: "hover" })), cell("Inputting", combinationInputSpec({ state: "inputting", values: ["Content", ""] })), cell("Input complete", combinationInputSpec({ state: "complete", values: ["Content 1", "Content 2"] })), cell("Disabled", combinationInputSpec({ state: "disabled", values: ["Content 1", "Content 2"] })), cell("Readonly", combinationInputSpec({ state: "readonly", values: ["Content 1", "Content 2"] })), cell("Error", combinationInputSpec({ state: "error" }))
        ], "焦点进入任一分段时只强调当前分段；Error/Disabled 统一作用于组合") + row("组合输入框 · 单字符与交互", [
          cell("Default", otpInputSpec({})), cell("Inputting", otpInputSpec({ values: ["1", "2", "3", "", "", ""] })), cell("Complete", otpInputSpec({ values: ["1", "2", "3", "4", "5", "6"] })), cell("Error", otpInputSpec({ state: "error" })), cell("Password inputting", otpInputSpec({ values: ["1", "2", "3", "4", "", ""], password: true }))
        ], "输入完成自动进入下一格；退格回到上一格；默认不超过 6 格") + row("组合输入框 · 选择与输入", [
          cell("Default", combinationSelectSpec({})), cell("Hover input", combinationSelectSpec({ state: "hover" })), cell("Inputting", combinationSelectSpec({ state: "inputting", value: "Content" })), cell("Open select", combinationSelectSpec({ open: true, selected: "Option 2" })), cell("Disabled", combinationSelectSpec({ state: "disabled", value: "Content" })), cell("Readonly", combinationSelectSpec({ state: "readonly", value: "Content" })), cell("Error", combinationSelectSpec({ state: "error" }))
        ], "选择段点击展开下拉菜单，选中后立即回显并收起；输入段和选择段共用外层状态") + row("组合输入框 · 使用与尺寸", [
          cell("正确 · 左右内容关联但独立", '<div class="input-usage-stack">' + affixInputSpec({ toggle: true, prefix: "Country", items: ["Country", "Area"], value: "China" }) + affixInputSpec({ toggle: true, prefix: "Area", items: ["Country", "Area"], value: "Asia" }) + "</div>"),
          cell("避免 · 固定内容误用组合", '<div class="input-usage-stack">' + affixInputSpec({ toggle: true, prefix: "Max", items: ["Max", "Min"], value: "20" }) + affixInputSpec({ toggle: true, prefix: "Min", items: ["Max", "Min"], value: "10" }) + "</div>"),
          cell("双段等宽 / 属性最小 70px", '<div class="input-measure">' + combinationInputSpec({ values: ["Start", "End"] }) + affixInputSpec({ toggle: true, prefix: "￥", items: ["￥", "$", "€"], value: "8888" }) + "</div>")
        ], "固定内容或计量单位应使用属性输入框；双段组合默认等宽") + row("长文本输入框", [
          cell("多行自增高", textareaSpec({ auto: true, counter: false, value: "Display 4 lines text\nlines text\nlines text\ntext" })), cell("固定文本域", textareaSpec({ counter: false, value: "Display 4 lines text\nlines text\nlines text\ntext" }))
        ], "多行输入随内容增长；文本域固定高度并在内部滚动") + row("长文本输入框 · 状态说明", [
          cell("Default", textareaSpec({})), cell("Hover", textareaSpec({ state: "hover" })), cell("Inputting", textareaSpec({ state: "inputting", value: "Content" })), cell("Input complete", textareaSpec({ state: "complete", value: "Content" })), cell("Disabled", textareaSpec({ state: "disabled", value: "Content" })), cell("Readonly", textareaSpec({ state: "readonly", value: "Content" })), cell("Error", textareaSpec({ state: "error", value: "Please enter text Please enter text Please enter text" }))
        ], "字数统计随输入实时更新；达到上限时保持可见并阻止继续输入") + row("长文本输入框 · 尺寸说明", [
          cell("单行起始", textareaSpec({ auto: true })), cell("自适应多行", textareaSpec({ auto: true, value: "Display 4 lines text\nlines text\nlines text\ntext" })), cell("固定 92px", '<div class="input-measure is-textarea">' + textareaSpec({ value: "Display 4 lines text\nlines text\nlines text\ntext" }) + '<span>92px</span></div>')
        ], "文本域推荐 92px；超出内容在内部滚动查看");
  }

  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var variants = ["基础输入框", "数字输入框", "带图标输入框", "带属性输入框", "组合输入框", "长文本输入框"];
  var variantLabels = {
    "基础输入框": "Basic 基础",
    "数字输入框": "Number 数字",
    "带图标输入框": "Icon 图标",
    "带属性输入框": "Addon 属性",
    "组合输入框": "Composite 组合",
    "长文本输入框": "Textarea 长文本"
  };
  var variantCategories = {
    "基础输入框": "短文本输入",
    "带图标输入框": "短文本输入",
    "数字输入框": "结构化输入",
    "带属性输入框": "结构化输入",
    "组合输入框": "结构化输入",
    "长文本输入框": "长文本输入"
  };
  var sizeLabels = { mini: "Mini 迷你 24px", small: "Small 小型 28px", medium: "Medium 中型 32px", large: "Large 大型 36px", xlarge: "Xlarge 超大 40px" };

  function option(value, label) { return { value: value, label: label }; }
  function textAddon(id, text) { return { id: id, type: "text", text: text }; }
  function selectAddon(id, value, ariaLabel) {
    return { id: id, type: "select", value: value, ariaLabel: ariaLabel, options: ["MM", "CM", "DM"].map(function (item) { return { value: item, label: item }; }) };
  }
  function composite(appearance, values) {
    return {
      appearance: appearance,
      segments: [
        { id: "country", label: "国家", value: values && values[0] || "", placeholder: "Country" },
        { id: "city", label: "城市", value: values && values[1] || "", placeholder: "City" }
      ]
    };
  }
  function selectInputComposite(value) {
    return {
      appearance: "filled",
      select: {
        id: "scope",
        value: "all",
        ariaLabel: "选择搜索范围",
        options: [{ value: "all", label: "全部" }, { value: "title", label: "标题" }, { value: "owner", label: "负责人" }]
      },
      segments: [{ id: "query", label: "搜索内容", value: value || "", placeholder: "Please enter text" }]
    };
  }

  function scenarioData(selection) {
    var variant = selection.variant;
    var common = { variant: variant, label: "输入内容", size: selection.size, state: selection.state };
    var props;
    var parameterKeys;
    var observable;
    if (variant === "基础输入框") {
      props = Object.assign(common, { value: selection.clear === "on" ? "可清空内容" : "", placeholder: "Please enter text", clearable: selection.clear === "on", counter: false, maxLength: 20, borderless: selection.appearance === "borderless", password: false });
      parameterKeys = ["variant", "label", "size", "state", "value", "placeholder", "clearable", "counter", "maxLength", "borderless", "password"];
      observable = props.clearable ? "聚焦或悬停后显示清空按钮；激活后恢复输入焦点" : props.borderless ? "透明边界仍保留可访问焦点提示" : "标准短文本输入";
    } else if (variant === "带图标输入框") {
      props = Object.assign(common, { label: "搜索", value: selection.clear === "on" ? "组件规范" : "", placeholder: "搜索内容", clearable: selection.clear === "on", prefixIcon: "search", suffixIcon: null, infoTooltip: selection.tooltip === "on" ? { text: "输入内容会用于公开展示", position: "top" } : null });
      parameterKeys = ["variant", "label", "size", "state", "value", "placeholder", "clearable", "prefixIcon", "suffixIcon", "infoTooltip"];
      observable = props.infoTooltip ? "信息图标通过 C-44 Tooltip 响应 Hover、Focus 与 Escape" : props.clearable ? "搜索内容可清空并恢复焦点" : "头部搜索图标说明输入语义";
    } else if (variant === "数字输入框") {
      props = Object.assign(common, { label: "数量", value: "", min: 0, max: 10, step: 1 });
      parameterKeys = ["variant", "label", "size", "state", "value", "min", "max", "step"];
      observable = "步进按钮与直接输入共同遵守 0–10 范围";
    } else if (variant === "带属性输入框") {
      props = Object.assign(common, { label: "属性值", value: "", placeholder: selection.addon.indexOf("select") >= 0 ? "Enter the value" : "Enter the URL", prefixAddon: null, suffixAddon: null, tag: null });
      if (selection.addon === "prefix-text") props.prefixAddon = textAddon("protocol", "https://");
      if (selection.addon === "suffix-text") props.suffixAddon = textAddon("domain", ".com");
      if (selection.addon === "prefix-select") props.prefixAddon = selectAddon("unit", "CM", "选择前缀单位");
      if (selection.addon === "suffix-select") props.suffixAddon = selectAddon("unit", "CM", "选择后缀单位");
      if (selection.addon === "tag") props.tag = "English";
      parameterKeys = ["variant", "label", "size", "state", "value", "placeholder", "prefixAddon", "suffixAddon", "tag"];
      observable = selection.addon === "tag" ? "行内标签表达输入内容属性并保持在右侧尾部" : selection.addon.indexOf("select") >= 0 ? "canonical Select 提供菜单、键盘、Escape 与焦点恢复" : "固定 addon 使用规范灰色表面并与输入边界衔接";
    } else if (variant === "组合输入框") {
      props = Object.assign(common, { value: "", composite: selection.composition === "select-input" ? selectInputComposite("组件规范") : composite(selection.appearance, ["中国", "上海"]) });
      parameterKeys = ["variant", "label", "size", "state", "composite"];
      observable = selection.composition === "select-input" ? "左侧 canonical Select 与右侧真实输入共享组合边界并保留独立事件" : props.composite.appearance === "borderless" ? "无背景状态仍逐段显示 Hover、Focus、Error 与锁定反馈" : "焦点只强调当前分段，另一段保持原边界";
    } else {
      props = Object.assign(common, { value: "", counter: false, maxLength: 240, auto: false });
      parameterKeys = ["variant", "label", "size", "state", "value", "counter", "maxLength", "auto"];
      observable = "固定 92px 文本域保留内部滚动与错误文案";
    }

    return { props: props, parameterKeys: parameterKeys, observable: observable };
  }

  function invalidSelectionReason(selection) {
    if (selection.variant === "长文本输入框" && selection.size !== "medium") return "长文本使用固定 92px 文本域";
    if (selection.variant === "带属性输入框" && selection.addon === "none") return "属性输入至少需要一个 addon";
    if (selection.variant !== "带属性输入框" && selection.addon !== "none") return "addon 只适用于属性输入";
    if (["基础输入框", "带图标输入框"].indexOf(selection.variant) < 0 && selection.clear === "on") return "清空只适用于基础或带图标输入";
    if (["基础输入框", "组合输入框"].indexOf(selection.variant) < 0 && selection.appearance === "borderless") return "无背景只适用于基础或组合输入";
    if (selection.variant !== "组合输入框" && selection.composition !== "inputs") return "组合模式只适用于组合输入";
    if (selection.variant === "组合输入框" && selection.composition === "select-input" && selection.appearance === "borderless") return "选择与输入组合仅支持 Filled 外观";
    if (selection.variant !== "带图标输入框" && selection.tooltip === "on") return "信息提示只适用于带图标输入";
    if (selection.variant === "带图标输入框" && selection.tooltip === "on" && ["disabled", "readonly"].indexOf(selection.state) >= 0) return "锁定状态不提供信息图标交互";
    return "";
  }

  function normalizeSelection(selection, changedKey) {
    if (changedKey !== "variant") return selection;
    selection.clear = "off";
    selection.addon = selection.variant === "带属性输入框" ? "prefix-text" : "none";
    selection.appearance = "filled";
    selection.composition = "inputs";
    selection.tooltip = "off";
    if (selection.variant === "长文本输入框") selection.size = "medium";
    return selection;
  }

  function resolveSelection(selection) {
    var data = scenarioData(selection);
    var interaction = selection.variant === "数字输入框"
      ? "点击步进按钮或编辑数值，核对 min / max、按钮禁用和一次 b2b:input-change。"
      : selection.variant === "带属性输入框"
        ? "点击或使用 Enter / Arrow / Home / End / Escape 操作属性菜单，核对 open / close / change 事件、ARIA 与焦点恢复。"
        : selection.variant === "组合输入框"
          ? "逐段输入并用 Tab 移动焦点；每次原生输入只派发一次携带完整 values 的 b2b:input-change。"
          : selection.variant === "长文本输入框"
            ? "输入多行文本，核对计数、自增高或内部滚动以及一次 b2b:input-change。"
            : "直接输入并使用清除或密码按钮，核对值、焦点、ARIA 与公开事件次数。";
    return {
      category: variantCategories[selection.variant],
      label: variantLabels[selection.variant] + " · " + sizeLabels[selection.size],
      description: data.observable + "。Hover、Focus、Inputting 由真实操作到达，不作为 props。",
      interaction: interaction,
      props: data.props,
      parameterKeys: data.parameterKeys
    };
  }

  var docsConfig = {
    id: "C-21",
    title: "Input 输入框",
    introduction: "用于录入短文本、数值、带属性或分段值和长文本；addon 复用 C-23，信息提示复用 C-44，页面只提供 caller-owned 内容并监听公开事件。",
    categories: [
      { name: "短文本输入", description: "基础输入与带图标输入；适合名称、搜索和简短属性。" },
      { name: "结构化输入", description: "数字、属性与组合输入；适合范围值、单位和关联分段。" },
      { name: "长文本输入", description: "固定文本域或自增高多行输入，并可显示字数统计。" }
    ],
    variants: variants.map(function (variant) { return { key: variant, label: variant, category: variantCategories[variant] }; }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "按维度选择，操作真实 Input",
    controlGroups: [
      { key: "variant", label: "类型", options: variants.map(function (variant) { return option(variant, variantLabels[variant]); }) },
      { key: "size", label: "尺寸", options: [option("mini", sizeLabels.mini), option("small", sizeLabels.small), option("medium", sizeLabels.medium), option("large", sizeLabels.large), option("xlarge", sizeLabels.xlarge)] },
      { key: "state", label: "状态", options: [option("default", "Default 默认"), option("disabled", "Disabled 禁用"), option("readonly", "Readonly 只读"), option("error", "Error 错误")] },
      { key: "clear", label: "清空", options: [option("off", "Without 不带清空"), option("on", "With 带清空")] },
      { key: "addon", label: "附加", options: [option("none", "None 无"), option("prefix-text", "Prefix 前缀文本"), option("suffix-text", "Suffix 后缀文本"), option("prefix-select", "Prefix 前缀选择"), option("suffix-select", "Suffix 后缀选择"), option("tag", "Tag 标签")] },
      { key: "composition", label: "组合", options: [option("inputs", "Input + Input 双输入"), option("select-input", "Select + Input 选择与输入")] },
      { key: "appearance", label: "外观", options: [option("filled", "Filled 有背景"), option("borderless", "Borderless 无背景")] },
      { key: "tooltip", label: "提示", options: [option("off", "Without 无提示"), option("on", "With 有提示")] }
    ],
    initialSelection: { variant: "基础输入框", size: "medium", state: "default", clear: "off", addon: "none", composition: "inputs", appearance: "filled", tooltip: "off" },
    variantCoverage: variants.slice(),
    isSelectionAllowed: function (selection) { return !invalidSelectionReason(selection); },
    invalidSelectionReason: invalidSelectionReason,
    normalizeSelection: normalizeSelection,
    resolveSelection: resolveSelection,
    events: ["b2b:input-change", "b2b:input-clear", "b2b:input-password-toggle", "b2b:input-addon-open", "b2b:input-addon-close", "b2b:input-addon-change", "b2b:input-tooltip-open", "b2b:input-tooltip-close"],
    slotSelector: "#input-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-21"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-21"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-21"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1;
    var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-21"]');
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
  D.registerComponent("C-21", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
