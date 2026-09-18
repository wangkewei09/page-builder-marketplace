(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var checkboxOption = H.checkboxOption;
    var checkboxGroup = H.checkboxGroup;
    var checkboxStateMatrix = H.checkboxStateMatrix;
        return row("控件类型", [
          cell("复选框组", '<div class="checkbox-rule-demo"><strong>Select send object</strong>' + checkboxOption("Specified member", "checked") + '<div class="checkbox-tag-line"><span>Name ×</span><span>Name ×</span></div>' + checkboxOption("Designated department", "checked") + '<button class="checkbox-select-shell" type="button">Options' + icon("expand_more") + '</button>' + checkboxOption("Group message", "unchecked") + checkboxOption("Chat privately with each group member", "unchecked") + "</div>"),
          cell("搜索与已选结果", '<div class="checkbox-picker-demo" data-checkbox-picker><div><label class="search-shell">' + icon("search") + '<input data-checkbox-picker-search aria-label="搜索成员" placeholder="Search"></label><small>Category</small>' + checkboxOption("LiTian", "checked", { pickerValue: "member-1" }) + checkboxOption("LiTian", "checked", { pickerValue: "member-2" }) + checkboxOption("LiTian", "unchecked", { pickerValue: "member-3" }) + '</div><aside><header><strong data-checkbox-picker-count>Selected (2)</strong><button type="button" data-checkbox-picker-clear>Clear All</button></header><div data-checkbox-picker-results><p data-picker-result="member-1">LiTian <button type="button" data-checkbox-picker-remove="member-1" aria-label="移除第 1 个 LiTian">×</button></p><p data-picker-result="member-2">LiTian <button type="button" data-checkbox-picker-remove="member-2" aria-label="移除第 2 个 LiTian">×</button></p></div></aside></div>'),
          cell("独立选择", '<div class="checkbox-calendar-demo"><div class="checkbox-calendar-title"><button type="button" aria-label="关闭">×</button><input aria-label="日程标题" placeholder="Add title"><button type="button">Save</button></div><div class="checkbox-calendar-time"><span>Sep 1, 2022</span><span>6:00 PM</span><span>–</span><span>6:30 PM</span><span>Sep 6, 2022</span></div><div class="checkbox-calendar-options"><button type="button">No repeats ' + icon("expand_more") + '</button>' + checkboxOption("All-day", "unchecked") + '</div></div>')
        ], "一组选项可多选，也可独立表达一个布尔状态") + row("状态说明", [
          cell("Normal / Hover / Pressed / Focus / Disabled / Error", checkboxStateMatrix())
        ], "未选、已选、半选三类状态在不同交互阶段保持 16px 几何尺寸") + row("状态切换", [
          cell("点击全选或任一选项可切换全选 / 半选 / 未选", checkboxGroup({ label: "选项组", selectAllLabel: "Select all", items: [{ label: "Option 1", checked: true }, { label: "Option 2", checked: true }, { label: "Option 3", checked: false }], className: "is-transition-demo" }))
        ], "点击后即时更新勾选、半选、计数与可访问状态") + row("尺寸说明", [
          cell("16×16px · 14px 文本 · 8px 间距", '<div class="checkbox-size-demo">' + checkboxOption("Option text", "checked") + '</div>'),
          cell("垂直排列 · 8px", '<div class="checkbox-column">' + checkboxOption("Option text", "checked") + checkboxOption("Option text", "unchecked") + checkboxOption("Option text", "unchecked") + "</div>"),
          cell("横向排列 · 24px", '<div class="checkbox-row">' + checkboxOption("Option text", "checked") + checkboxOption("Option text", "unchecked") + checkboxOption("Option text", "unchecked") + checkboxOption("Option text", "unchecked") + "</div>")
        ], "信息密度较高时控件与文字间距可缩至 4px；组内方向须保持一致") + row("位置说明", [
          cell("长说明纵向排列并顶部对齐", '<div class="checkbox-description-list">' + checkboxOption("This is the option description content.", "checked", { description: "This is the option description content, this is the option description content.", alignTop: true }) + checkboxOption("This is the option description content.", "unchecked", { description: "This is the option description content, this is the option description content.", alignTop: true }) + "</div>"),
          cell("列表场景与文本顶部对齐", '<div class="checkbox-table-demo"><div>' + checkboxOption("This is the option description content, this is the option description content.", "checked", { alignTop: true }) + '<span><button>Operation</button><button>Operation</button><button>Operation</button></span></div><div>' + checkboxOption("This is the option description content, this is the option description content.", "unchecked", { alignTop: true }) + '<span><button>Operation</button><button>Operation</button><button>Operation</button></span></div></div>')
        ], "多行文字时复选框与首行顶部对齐，适用于列表、表格等场景");
  }

  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var variantCategories = {
    "group": "组选与批量状态",
    "standalone": "独立布尔选择",
    "with-description": "说明型选择",
    "indeterminate": "组选与批量状态"
  };
  var variantLabels = {
    "group": "Group 复选框组",
    "standalone": "Standalone 独立选择",
    "with-description": "Description 带说明",
    "indeterminate": "Mixed 半选示例"
  };
  var variants = ["group", "standalone", "with-description", "indeterminate"];
  var parameterKeysByVariant = {
    "group": ["variant", "label", "selectAllLabel", "items", "disabled", "error", "errorMessage", "orientation", "compact"],
    "standalone": ["variant", "label", "value", "checked", "mixed", "disabled", "error", "errorMessage", "compact"],
    "with-description": ["variant", "label", "value", "description", "checked", "mixed", "disabled", "error", "errorMessage", "compact"],
    "indeterminate": ["variant", "label", "value", "checked", "mixed", "disabled", "error", "errorMessage", "compact"]
  };

  function invalidSelectionReason(selection) {
    if (selection.variant !== "group" && selection.orientation === "horizontal") return "横向排列仅适用于复选框组";
    return "";
  }

  function isSelectionAllowed(selection) {
    return !invalidSelectionReason(selection);
  }

  function longLabel(label, selection) {
    return selection.content === "long" ? label + " · 这是用于验证长文本换行与顶部对齐的说明" : label;
  }

  function resolveSelection(selection) {
    var reason = invalidSelectionReason(selection);
    if (reason) throw new Error(reason);
    var disabled = selection.availability === "disabled";
    var error = selection.validation === "error";
    var errorMessage = error ? "请检查当前复选状态" : null;
    var compact = selection.density === "compact";
    var props;
    var description;
    var interaction;
    if (selection.variant === "group") {
      var itemStates = selection.selection === "checked" ? [{ checked: true }, { checked: true }, { checked: true }] : selection.selection === "mixed" ? [{ checked: true }, { mixed: true }, {}] : [{}, {}, {}];
      props = {
        variant: "group",
        label: "通知对象",
        selectAllLabel: "全选",
        items: ["设计团队", "研发团队", "产品团队"].map(function (label, index) {
          return Object.assign({ value: ["design", "engineering", "product"][index], label: longLabel(label, selection) }, itemStates[index]);
        }),
        disabled: disabled,
        error: error,
        errorMessage: errorMessage,
        orientation: selection.orientation,
        compact: compact
      };
      description = "真实组选会同步全选、半选、单项和已选计数；" + (selection.orientation === "horizontal" ? "横向项间 24px，窄容器按完整选项换行。" : "竖向项间 8px。");
      interaction = "点击全选或任一选项，或聚焦后按 Space；每次提交只触发一次 b2b:checkbox-change。";
    } else if (selection.variant === "with-description") {
      props = {
        variant: "with-description",
        value: "updates",
        label: longLabel("接收产品更新", selection),
        description: selection.content === "long" ? "通过邮件接收重要版本、功能更新、维护通知与上线安排。" : "通过邮件接收重要版本和功能更新。",
        checked: selection.selection === "checked",
        mixed: selection.selection === "mixed",
        disabled: disabled,
        error: error,
        errorMessage: errorMessage,
        compact: compact
      };
      description = "说明文字由同一 canonical factory 输出，复选框与首行顶部对齐；控件保持 16×16px。";
      interaction = "点击标签或聚焦后按 Space，checked、焦点、视觉和公开事件同步。";
    } else if (selection.variant === "indeterminate") {
      props = {
        variant: "indeterminate",
        value: "current-group",
        label: longLabel("选择当前分组", selection),
        checked: selection.selection === "checked",
        mixed: selection.selection === "mixed",
        disabled: disabled,
        error: error,
        errorMessage: errorMessage,
        compact: compact
      };
      description = "初始 mixed 状态使用原 data-indeterminate 初始化；真实操作后转为已选或未选。";
      interaction = "聚焦后按 Space 或点击，将 mixed 提交为布尔状态并触发一次 b2b:checkbox-change。";
    } else {
      props = {
        variant: "standalone",
        value: "terms",
        label: longLabel("我已阅读并同意服务条款", selection),
        checked: selection.selection === "checked",
        mixed: selection.selection === "mixed",
        disabled: disabled,
        error: error,
        errorMessage: errorMessage,
        compact: compact
      };
      description = "独立 Checkbox 表达单一布尔状态，标签形成至少 22px 高的点击热区。";
      interaction = "点击标签或聚焦后按 Space，checked、焦点、视觉和公开事件同步。";
    }
    return {
      category: variantCategories[selection.variant],
      label: variantLabels[selection.variant] + " · " + ({ unchecked: "Unchecked 未选", checked: "Checked 已选", mixed: "Mixed 半选" }[selection.selection]),
      description: description,
      interaction: interaction,
      props: props,
      parameterKeys: parameterKeysByVariant[selection.variant].slice()
    };
  }

  function syncSelectionFromEvent(name, event, selection) {
    if (name !== "b2b:checkbox-change") return selection;
    var detail = event.detail || {};
    selection.selection = detail.indeterminate ? "mixed" : (detail.checked ? "checked" : "unchecked");
    return selection;
  }

  var docsConfig = {
    id: "C-11",
    title: "Checkbox 复选框",
    introduction: "用于从一组选项中选择一项或多项，也可独立表达布尔状态。支持未选、已选、半选、禁用与错误组合；复选框组可切换竖向或横向排列，并保持完整的键盘、焦点和读屏语义。",
    categories: [
      { name: "独立布尔选择", description: "独立选择适合协议确认、单项设置与其他单一布尔选项。" },
      { name: "说明型选择", description: "带说明形态补充较长解释，并保持复选框与首行文字顶部对齐。" },
      { name: "组选与批量状态", description: "组选同步全选、半选、单项与计数；半选形态表达部分子项已选。" },
    ],
    variants: variants.map(function (variant) {
      return { key: variant, label: variantLabels[variant], category: variantCategories[variant] };
    }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "选择复选框展示状态",
    controlGroups: [
      { key: "variant", label: "类型", options: variants.map(function (variant) { return { value: variant, label: variantLabels[variant] }; }) },
      { key: "selection", label: "选择状态", options: [{ value: "unchecked", label: "Unchecked 未选" }, { value: "checked", label: "Checked 已选" }, { value: "mixed", label: "Mixed 半选" }] },
      { key: "availability", label: "可用状态", options: [{ value: "enabled", label: "Enabled 可用" }, { value: "disabled", label: "Disabled 禁用" }] },
      { key: "validation", label: "校验状态", options: [{ value: "valid", label: "Default 默认" }, { value: "error", label: "Error 错误" }] },
      { key: "orientation", label: "排列方向", options: [{ value: "vertical", label: "Vertical 竖向" }, { value: "horizontal", label: "Horizontal 横向" }] },
      { key: "density", label: "内容间距", options: [{ value: "regular", label: "Regular 常规" }, { value: "compact", label: "Compact 紧凑" }] },
      { key: "content", label: "内容长度", options: [{ value: "standard", label: "Standard 标准" }, { value: "long", label: "Long 长文本" }] }
    ],
    initialSelection: { variant: "group", selection: "mixed", availability: "enabled", validation: "valid", orientation: "vertical", density: "regular", content: "standard" },
    variantCoverage: variants.slice(),
    isSelectionAllowed: isSelectionAllowed,
    invalidSelectionReason: invalidSelectionReason,
    resolveSelection: resolveSelection,
    syncSelectionFromEvent: syncSelectionFromEvent,
    events: ["b2b:checkbox-change"],
    slotSelector: "#checkbox-slot"
  };

  function mountSpecimen(scope) {
    if (!docsApi) return Promise.resolve([]);
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-11"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-11"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-11"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1;
    var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-11"]');
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

  D.registerComponent("C-11", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
