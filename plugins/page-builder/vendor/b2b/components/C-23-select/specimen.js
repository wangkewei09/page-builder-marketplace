(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var sourceSelect = H.sourceSelect;
    var selectStateGrid = H.selectStateGrid;
        return row("使用规则", [
          cell("在多个选项中完成单选或多选", sourceSelect({ state: "active", open: true, selected: ["Option 2"] }))
        ], "触发区域承载当前结果，下拉列表承载备选项；选项较多时列表保持滚动") + row("组成要素", [
          cell("标题文本 / 触发区域 / 下拉列表 / 列表内容", '<div class="select-anatomy"><label>Label</label>' + sourceSelect({ state: "active", open: true, selected: ["Option 2"] }) + '<ol><li>标题文本（可选）</li><li>触发区域</li><li>下拉列表</li><li>列表内容</li></ol></div>')
        ], "源图标注用于解释结构，不进入实际选择器内容") + row("控件类型 · 类型总览", [
          cell("Basic single select", sourceSelect({ state: "selected-active", selected: ["Option 2"], open: true })),
          cell("Basic multi select", sourceSelect({ state: "selected-active", selected: ["Option 1", "Option 2"], multiple: true, open: true })),
          cell("Select with customed options", sourceSelect({ state: "selected-active", selected: ["Option 2"], items: [{ label: "Option 1", icon: "person" }, { label: "Option 2", icon: "person" }, { label: "Option 3", icon: "person" }], open: true })),
          cell("Group option", sourceSelect({ state: "active", selected: ["Option 2"], items: [{ group: "Group A" }, "Option 1", "Option 2", { group: "Group B" }, "Option 3"], open: true })),
          cell("No Bordered select", sourceSelect({ state: "selected-active", selected: ["Option 2"], variation: "borderless", open: true })),
          cell("Underlined select", sourceSelect({ state: "selected-active", selected: ["Option 2"], variation: "underline", open: true }))
        ], "按源图保留基础、定制、分组、无边框和下划线形态") + row("基础选择 · 状态与交互", [
          cell("Single select", selectStateGrid()),
          cell("Multi select", '<div class="select-state-grid">' + sourceSelect({ state: "default", multiple: true, open: false }) + sourceSelect({ state: "selected-active", selected: ["Option 1", "Option 2"], multiple: true, open: true }) + sourceSelect({ state: "disabled", selected: ["Option 1", "Option 2"], multiple: true, open: false }) + sourceSelect({ state: "readonly", selected: ["Option 1", "Option 2"], multiple: true, open: false }) + sourceSelect({ state: "default", selected: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"], multiple: true, open: false }) + "</div>")
        ], "打开后方向键切换激活项，Enter 选择；单选完成后收起，多选保持展开") + row("清除（可选）", [
          cell("Hover 后出现清除", sourceSelect({ state: "hover", selected: ["Option 1"], open: false })),
          cell("清除全部已选内容", sourceSelect({ state: "hover", selected: ["Option 1", "Option 2"], multiple: true, open: false }))
        ], "清除按钮不改变触发器尺寸；无输入能力且仅切换选项时默认不展示") + row("搜索（可选）", [
          cell("Inputting", sourceSelect({ state: "active", searchable: true, query: "Opt", open: true })),
          cell("Loading", sourceSelect({ state: "loading", searchable: true, query: "Option 2", open: true })),
          cell("No result", sourceSelect({ state: "no-result", searchable: true, query: "Option 21", open: true }))
        ], "支持搜索与模糊搜索；搜索结果应保持单选或多选语义") + row("选项详情（可选）", [
          cell("辅助说明入口", sourceSelect({ state: "selected-active", selected: ["Option 1"], items: [{ label: "Option 1", icon: "info" }, "Option 2", "Option 3"], open: true }))
        ], "简短说明使用 Tooltip；包含操作时使用 Popover，不把详情塞进选项文本") + row("扩展菜单（可选） · 搜索时创建条目", [
          cell("Create new option", sourceSelect({ state: "active", searchable: true, query: "Opt", creatable: true, open: true })),
          cell("Selected Active", sourceSelect({ state: "selected-active", selected: ["Opt"], searchable: true, query: "Opt", creatable: true, open: true }))
        ], "搜索字段不在已有选项中时才显示创建入口，创建后自动回填") + row("扩展菜单（可选） · 主动创建条目", [
          cell("固定底部创建入口", sourceSelect({ state: "active", creatable: true, open: true })),
          cell("创建后回填", sourceSelect({ state: "selected-active", selected: ["Opt"], creatable: true, open: true }))
        ], "适合选项属性较复杂、需要另行编辑的场景") + row("通用样式规则 · 样式与尺寸说明", [
          cell("Small · 28px", sourceSelect({ size: "small", open: false })),
          cell("Medium · 32px", sourceSelect({ size: "medium", open: false })),
          cell("Large · 40px", sourceSelect({ size: "large", open: false })),
          cell("Multi select · 标签折叠", sourceSelect({ size: "medium", selected: ["Option 1", "Option 2", "+3"], multiple: true, open: false }))
        ], "基础选择器遵循输入框尺寸；建议最小宽 240px、最大宽 600px") + row("下拉列表样式", [
          cell("与触发器等宽 · 推荐高 246px", sourceSelect({ state: "active", items: ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Argentina", "Australia"], open: true })),
          cell("内容决定宽度 · 120—420px", '<div class="select-wide-panel">' + sourceSelect({ state: "active", items: ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Australia"], open: true }) + "</div>")
        ], "菜单优先与触发器等宽；数据量大时滚动并保留 16px 安全距离") + row("文字省略规则", [
          cell("单选文本省略", sourceSelect({ state: "selected-active", selected: ["Option with long texttttttttttttt"], open: true })),
          cell("多选标签省略", sourceSelect({ state: "default", selected: ["Option with long texttttttt", "Option 2", "Option 3"], multiple: true, open: false }))
        ], "优先横向拓展菜单；空间不足时省略，完整内容通过 Tooltip 提供") + row("位置说明", [
          cell("Default · 向下左对齐", sourceSelect({ state: "active", position: "bottom-left", open: true })),
          cell("Top · 空间不足向上", sourceSelect({ state: "active", position: "top", open: true })),
          cell("Right · 右对齐", sourceSelect({ state: "active", position: "right", open: true })),
          cell("Left · 左对齐", sourceSelect({ state: "active", position: "left", open: true }))
        ], "默认向下；底部或两侧空间不足时改变弹出方向与对齐") + row("复杂内容选择 · 使用场景", [
          cell("Icon", sourceSelect({ state: "selected-active", selected: ["Option 2"], items: [{ label: "Option 1", icon: "person" }, { label: "Option 2", icon: "person" }, { label: "Option 3", icon: "person" }], open: true })),
          cell("Tag", sourceSelect({ state: "selected-active", selected: ["Option 2"], items: [{ label: "Option 1", tag: "tag" }, { label: "Option 2", tag: "tag" }, { label: "Option 3", tag: "tag" }], open: true })),
          cell("Avatar + Description", sourceSelect({ state: "selected-active", selected: ["Option 2"], items: [{ label: "Option 1", avatar: "A", description: "Description text" }, { label: "Option 2", avatar: "B", description: "Description text" }, { label: "Option 3", avatar: "C", description: "Description text" }], open: true }))
        ], "复杂选项可组合图标、Tag、头像、描述和分组，但仍保持明确选择目标") + row("复杂内容选择 · 通用样式规则", [
          cell("单行 32px", sourceSelect({ state: "selected-active", selected: ["Option 2"], items: [{ label: "Option 1", description: "Description text Description text" }, { label: "Option 2", description: "Description text Description text" }, { label: "Option 3", description: "Description text" }], open: true }))
        ], "内容复杂时保证选项上下 4px 间距；描述建议单行，超出省略并提供完整信息") + row("差异化选择框 · 使用场景", [
          cell("下划线 · 列表/表格/受限空间", sourceSelect({ state: "selected-active", selected: ["Option 1"], variation: "underline", open: true })),
          cell("无边界 · 筛选/排序/主搜索", sourceSelect({ state: "selected-active", selected: ["Option 1"], variation: "borderless", open: true }))
        ], "无边界通常只用于默认值明确的单选；不建议用于多选") + row("下划线选择框", [
          cell("完整状态", selectStateGrid("underline"))
        ], "保留下边界作为状态反馈；Error 同时展示错误文案") + row("无边界选择框", [
          cell("完整状态", selectStateGrid("borderless"))
        ], "Hover 通过轻背景表达；不依赖边框承载全部状态") + row("系统状态与响应式", [
          cell("键盘完成展开、移动、选择与关闭", sourceSelect({ state: "active", open: true })),
          cell("窄屏保持选项与状态", '<div class="select-mobile-rule">触发器占满可用宽度 · 下拉列表同宽 · 不转换为卡片</div>')
        ], "支持 ArrowUp / ArrowDown / Enter / Escape；移动端不删除关键选项与错误信息");
  }

  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var variantDescriptions = {
    "基础单选": "从预定义选项中选择一个结果，选择完成后面板收起并恢复触发器焦点。",
    "基础多选": "用标签回显多个结果，选择后面板保持展开，并支持逐项移除和清空。",
    "自定义选项": "使用源码支持的图标、Tag、头像或描述增强选项信息。",
    "分组选项": "用独立分组标题组织较长列表，分组标题不是可选择项。",
    "无边框": "用于默认值明确的筛选、排序或主搜索入口，不建议承载多选。",
    "下划线": "用于列表、表格或受限空间，以底边界表达状态反馈。",
    "可搜索": "在选项较多时输入关键字筛选，支持加载与无结果反馈。",
    "可创建": "已有选项不匹配时创建新条目，并把创建结果回填到选择器。",
    "复杂内容": "组合头像、图标、Tag、描述和可选分组，同时保持唯一选择目标。"
  };
  var variantCategories = {
    "基础单选": "基础选择",
    "基础多选": "基础选择",
    "自定义选项": "数据与复杂内容",
    "分组选项": "数据与复杂内容",
    "可搜索": "数据与复杂内容",
    "可创建": "数据与复杂内容",
    "复杂内容": "数据与复杂内容",
    "无边框": "差异化形态",
    "下划线": "差异化形态"
  };
  var variantOptions = [
    { value: "基础单选", label: "基础单选" },
    { value: "基础多选", label: "基础多选" },
    { value: "自定义选项", label: "自定义选项" },
    { value: "分组选项", label: "分组选项" },
    { value: "无边框", label: "无边框" },
    { value: "下划线", label: "下划线" },
    { value: "可搜索", label: "可搜索" },
    { value: "可创建", label: "可创建" },
    { value: "复杂内容", label: "复杂内容" }
  ];
  var searchableVariants = ["可搜索", "可创建", "复杂内容"];
  var parameterKeys = ["variant", "items", "selected", "multiple", "open", "placeholder", "clearable", "searchable", "creatable", "query", "size", "state", "position"];

  function cloneItems(items) {
    return items.map(function (item) { return typeof item === "string" ? item : Object.assign({}, item); });
  }

  function optionLabels(items) {
    return items.filter(function (item) { return typeof item === "string" || !item.group; }).map(function (item) {
      return typeof item === "string" ? item : item.label;
    });
  }

  function baseData(variant) {
    var data = {
      "基础单选": { items: ["产品", "设计", "研发", "测试"], selected: ["设计"] },
      "基础多选": { items: ["产品", "设计", "研发", "测试"], selected: ["设计", "研发"] },
      "自定义选项": { items: [{ label: "Maya", icon: "person" }, { label: "Linda", tag: "设计" }, { label: "Alex", avatar: "A", description: "Product Manager" }], selected: ["Maya"] },
      "分组选项": { items: [{ group: "团队" }, "产品", "设计", { group: "区域" }, "北京", "上海"], selected: ["设计"] },
      "无边框": { items: ["默认视图", "紧凑视图", "舒适视图"], selected: ["默认视图"] },
      "下划线": { items: ["全部", "进行中", "已完成"], selected: ["全部"] },
      "可搜索": { items: ["Universe", "Galaxy", "Nebula", "Asteroid"], selected: [] },
      "可创建": { items: ["Design", "Research", "Engineering"], selected: [] },
      "复杂内容": { items: [{ label: "Maya Chun", avatar: "M", description: "Product Designer" }, { label: "Linda Jones", tag: "研发", description: "Software Engineer" }, { label: "Juliette Roux", icon: "person", description: "Project Manager" }], selected: ["Maya Chun"] }
    }[variant];
    return { items: cloneItems(data.items), selected: data.selected.slice() };
  }

  function contentData(variant, content) {
    var data = baseData(variant);
    if (content === "empty" || content === "query") data.selected = [];
    if (content === "long") {
      data.items = data.items.map(function (item) {
        if (item && typeof item === "object" && item.group) return item;
        var label = typeof item === "string" ? item : item.label;
        var next = label + " · 这是用于验证省略与完整信息的长选项文本";
        return typeof item === "string" ? next : Object.assign({}, item, { label: next });
      });
      var longLabels = optionLabels(data.items);
      data.selected = variant === "基础多选" ? longLabels.slice(0, 3) : longLabels.slice(0, 1);
    }
    if (content === "disabled-option") {
      var optionIndexes = [];
      data.items.forEach(function (item, index) { if (typeof item === "string" || !item.group) optionIndexes.push(index); });
      var disabledIndex = optionIndexes[0];
      var disabledItem = data.items[disabledIndex];
      data.items[disabledIndex] = typeof disabledItem === "string"
        ? { label: disabledItem, disabled: true }
        : Object.assign({}, disabledItem, { disabled: true });
      var available = optionLabels(data.items).slice(1);
      data.selected = variant === "基础多选" ? available.slice(0, 2) : available.slice(0, 1);
    }
    return data;
  }

  function invalidSelectionReason(selection) {
    var searchable = searchableVariants.indexOf(selection.variant) >= 0;
    if (["loading", "no-result"].indexOf(selection.state) >= 0 && !searchable) return "Loading / No result 只适用于可搜索、可创建或复杂内容变体";
    if (["disabled", "readonly"].indexOf(selection.state) >= 0 && selection.open === "open") return "Disabled / Readonly 状态不能保持面板展开";
    if (selection.state === "no-result" && selection.open !== "open") return "No result 状态必须展开面板";
    if (selection.content === "query" && !searchable) return "搜索输入只适用于可搜索、可创建或复杂内容变体";
    return "";
  }

  function isSelectionAllowed(selection) {
    return !invalidSelectionReason(selection);
  }

  function resolveSelection(selection) {
    var error = invalidSelectionReason(selection);
    if (error) throw new Error(error);
    var data = contentData(selection.variant, selection.content);
    var searchable = searchableVariants.indexOf(selection.variant) >= 0;
    var open = selection.open === "open";
    var query = "";
    if (selection.content === "query") query = selection.variant === "可创建" ? "New role" : selection.variant === "复杂内容" ? "Maya" : "Gal";
    if (selection.state === "loading") query = "Option";
    if (selection.state === "no-result") query = "No matching option";
    var props = {
      variant: selection.variant,
      items: data.items,
      selected: data.selected,
      multiple: selection.variant === "基础多选",
      open: open,
      placeholder: selection.content === "empty" ? "请选择选项" : "Please select",
      clearable: selection.clearable === "yes",
      searchable: searchable,
      creatable: selection.variant === "可创建",
      query: query,
      size: selection.size,
      state: selection.state,
      position: selection.position
    };
    var sizeLabel = { small: "Small · 28px", medium: "Medium · 32px", large: "Large · 40px" }[selection.size];
    var stateLabel = { "default": "Default", disabled: "Disabled", readonly: "Readonly", error: "Error", loading: "Loading", "no-result": "No result" }[selection.state];
    var contentLabel = { standard: "标准数据", long: "长文本", empty: "空选择", "disabled-option": "含禁用项", query: "搜索输入" }[selection.content];
    var interaction = selection.variant === "基础多选"
      ? "点击或 Enter 选择后保持展开；标签移除与清空均触发一次 b2b:select-change。"
      : selection.variant === "可搜索"
        ? "输入关键字触发一次 b2b:select-search；Arrow / Home / End 移动，Escape 关闭并恢复焦点。"
        : selection.variant === "可创建"
          ? "输入与创建分别触发 b2b:select-search、b2b:select-create 和 b2b:select-change。"
          : "点击或 Enter 选择后触发一次 b2b:select-change；Escape 与 outside-click 触发关闭并同步 ARIA。";
    return {
      category: variantCategories[selection.variant],
      label: selection.variant + " · " + sizeLabel + " · " + stateLabel + " · " + contentLabel,
      description: variantDescriptions[selection.variant] + " 菜单支持 120—420px 宽度、推荐 246px 高度与四个弹出方向；Hover / Focus 通过真实交互到达。",
      interaction: interaction,
      props: props,
      parameterKeys: parameterKeys.slice()
    };
  }

  var docsConfig = {
    id: "C-23",
    title: "Select 选择器",
    introduction: "用于从预定义选项中完成单选或多选；Renderer 负责源码样式、弹层、键盘、焦点、ARIA 与 b2b:select-open / close / change / search / create 事件，页面只提供业务选项并监听公开结果。",
    categories: [
      { name: "基础选择", description: "单选或多选的常用入口；多选使用标签回显，清除不改变触发器尺寸。" },
      { name: "数据与复杂内容", description: "支持定制选项、分组、搜索、创建，以及图标、Tag、头像和描述。" },
      { name: "差异化形态", description: "无边框用于筛选与排序，下划线用于列表、表格和受限空间。" }
    ],
    variants: variantOptions.map(function (item) {
      return { key: item.value, label: item.label, category: variantCategories[item.value] };
    }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "按维度选择，操作真实 Select",
    controlGroups: [
      { key: "variant", label: "类型", options: variantOptions },
      { key: "size", label: "尺寸", options: [{ value: "small", label: "Small · 28px" }, { value: "medium", label: "Medium · 32px" }, { value: "large", label: "Large · 40px" }] },
      { key: "state", label: "状态", note: "Hover / Focus 请直接操作组件", options: [{ value: "default", label: "Default" }, { value: "disabled", label: "Disabled" }, { value: "readonly", label: "Readonly" }, { value: "error", label: "Error" }, { value: "loading", label: "Loading" }, { value: "no-result", label: "No result" }] },
      { key: "content", label: "内容", options: [{ value: "standard", label: "标准数据" }, { value: "long", label: "长文本" }, { value: "empty", label: "空选择" }, { value: "disabled-option", label: "含禁用项" }, { value: "query", label: "搜索输入" }] },
      { key: "position", label: "位置", options: [{ value: "bottom-left", label: "Bottom left" }, { value: "top", label: "Top" }, { value: "right", label: "Right" }, { value: "left", label: "Left" }] },
      { key: "open", label: "面板", options: [{ value: "closed", label: "Closed" }, { value: "open", label: "Open" }] },
      { key: "clearable", label: "清除", options: [{ value: "yes", label: "Clearable" }, { value: "no", label: "Not clearable" }] }
    ],
    initialSelection: { variant: "基础单选", size: "medium", state: "default", content: "standard", position: "bottom-left", open: "closed", clearable: "yes" },
    variantCoverage: variantOptions.map(function (item) { return item.value; }),
    isSelectionAllowed: isSelectionAllowed,
    invalidSelectionReason: invalidSelectionReason,
    resolveSelection: resolveSelection,
    events: ["b2b:select-open", "b2b:select-close", "b2b:select-change", "b2b:select-search", "b2b:select-create"],
    slotSelector: "#select-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-23"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-23"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-23"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1;
    var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-23"]');
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
  D.registerComponent("C-23", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
