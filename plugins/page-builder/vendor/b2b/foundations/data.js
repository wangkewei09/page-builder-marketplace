(function registerFoundationData() {
  "use strict";
  var D = window.B2BDesignSource;

  D.tokens = [];
  D.navigationSizingModel = {
    formula: "clamp(类型下限, 内容测量值, 类型上限)",
    contentFormula: "左右内边距 + 图标槽 + 最长必要标签 + 层级缩进 + 尾部槽位",
    note: "导航宽度边界是 Token；最终宽度由导航组件在边界内根据内容计算。截图中的 240px、232px 只保留为页面观测证据，不作为固定总宽。",
    types: [
      { id: "collapsed", name: "折叠图标栏", min: 56, max: 72, preferred: 64, source: "C-12", behavior: "只保留图标与 Tooltip；点击热区不得随宽度压缩。" },
      { id: "product", name: "产品级导航", min: 80, max: 144, preferred: 96, source: "P-006 / P-019", behavior: "适合图标与短标签；达到上限后降为图标栏。" },
      { id: "module", name: "模块导航", min: 176, max: 280, preferred: 224, source: "P-006 / P-023", behavior: "按最长必要标签测量；超出上限后省略并提供完整名称。" },
      { id: "tree", name: "树形 / 设置导航", min: 208, max: 320, preferred: 240, source: "P-023 / P-045", behavior: "层级缩进、展开箭头和尾部操作全部计入宽度。" },
      { id: "context", name: "对象 / 上下文列表", min: 240, max: 360, preferred: 280, source: "P-014 / P-015", behavior: "允许摘要两行；空间不足时转 Drawer，不压窄信息层级。" }
    ],
    factors: [
      { name: "基础槽位", value: "padding × 2 + icon", detail: "由导航组件密度决定，不随文案压缩。" },
      { name: "标签内容", value: "P0 label max-content", detail: "按必须直接可见的最长标签估算，而不是按菜单数量。" },
      { name: "结构增量", value: "indent × level", detail: "树形层级、展开箭头、选中标识都计入宽度。" },
      { name: "尾部槽位", value: "badge / action", detail: "徽标、更多操作和滚动条需要预留独立空间。" }
    ],
    collapse: "先移除可选次级导航 → 收起模块导航 → 产品导航降为图标栏 → 极窄时整体转 Drawer。触发条件看工作区最小宽度，不绑定设备型号。"
  };

  function token(category, key, css, value, source, confidence, tier, usage, group) {
    D.tokens.push({
      category: category,
      key: key,
      css: css,
      value: value,
      source: source,
      confidence: confidence,
      tier: tier || "semantic",
      usage: usage || "",
      group: group || category
    });
  }

  function navigationType(id) {
    return D.navigationSizingModel.types.find(function (item) { return item.id === id; });
  }

  function navigationClamp(id, fluid) {
    var item = navigationType(id);
    return "clamp(" + item.min + "px, " + fluid + ", " + item.max + "px)";
  }

  D.typographyUsageGuide = {
    title: "字号按语义角色使用",
    description: "字号、行高和字重必须按完整的 type.* Token 成组使用，不从字号阶梯中单独挑选数值。",
    rules: [
      {
        label: "正文默认",
        value: "14px / 22px / 400",
        token: "type.body",
        detail: "列表、Feed、会话和 Button 的常规文字。"
      },
      {
        label: "辅助信息",
        value: "12px / 20px / 400–500",
        token: "type.body-auxiliary / type.auxiliary",
        detail: "正文辅助使用 400；标签内需要强调时使用 500。"
      },
      {
        label: "10px 使用边界",
        value: "10px / 16px / 400–500",
        token: "type.small-auxiliary / type.minimum-auxiliary",
        detail: "仅用于标签等小辅助或最小辅助信息；不得作为正文、控件常规文字或全局最小字号。"
      }
    ]
  };

  var semanticColorSources = {
    "action.primary": "F-17",
    "status.success": "F-17", "status.success.content": "F-17",
    "status.warning": "F-17", "status.warning.content": "F-17",
    "status.danger": "F-17", "status.danger.content": "F-17",
    "status.information": "F-17", "status.information.content": "F-17",
    "text.primary": "F-17", "text.secondary": "F-17", "text.placeholder": "F-17", "text.disabled": "F-17",
    "icon.primary": "F-17", "icon.secondary": "F-17", "icon.tertiary": "F-17", "icon.disabled": "F-17",
    "background.disabled": "F-17", "background.page": "F-17", "background.section": "F-17", "background.subtle": "F-17", "background.surface": "F-17",
    "border.control": "F-17", "border.surface": "F-17", "divider": "F-17", "mask": "F-17"
  };
  [
    ["900", "#002270"], ["800", "#003A9E"], ["700", "#0442D2"], ["600", "#1456F0"], ["500", "#3370FF"],
    ["400", "#638DFF"], ["300", "#82A7FC"], ["200", "#A6C3FF"], ["100", "#D2E0FF"], ["50", "#EFF4FF"]
  ].forEach(function (row) {
    token("颜色", "color.blue." + row[0], "--b2b-blue-" + row[0], row[1], "F-17", "exact", "primitive", "品牌主色阶；600 为品牌基准色。", "品牌蓝色阶");
  });

  [
    ["indigo", "Indigo", "#5B65F5"], ["purple", "Purple", "#8C55EC"],
    ["wathet", "Wathet", "#25B0E7"], ["lime", "Lime", "#91AD00"], ["green", "Green", "#35BD4B"],
    ["turquoise", "Turquoise", "#1FA18F"], ["orange", "Orange", "#DB7018"], ["yellow", "Yellow", "#FFC60A"],
    ["sunflower", "Sun Flower", "#FFE928"], ["red", "Red", "#F54A45"], ["violet", "Violet", "#BF3DBF"], ["carmine", "Carmine", "#DF58A5"]
  ].forEach(function (row) {
    token("颜色", "color.extended." + row[0], "--b2b-color-extended-" + row[0], row[2], "F-17", "exact", "primitive", row[1] + " 辅助色；不替代功能色。", "辅助色");
  });

  [
    ["1", "#3370EB"], ["2", "#25B2E5"], ["3", "#1BCEBF"], ["4", "#27AD8E"],
    ["5", "#F08F35"], ["6", "#BF78E9"], ["7", "#8F61D1"], ["8", "#68C486"]
  ].forEach(function (row) {
    token("数据可视化", "chart.color." + row[0], "--b2b-chart-" + row[0], row[1], "F-20 / C-18", "exact", "component", "从数据可视化截图的图形实色区取样，按图例顺序使用。", "图表分类色");
  });
  [
    ["1", "#092769"], ["2", "#2A4FA0"], ["3", "#4A73D0"], ["4", "#7F9FEC"], ["5", "#B5C9FE"]
  ].forEach(function (row) {
    token("数据可视化", "chart.funnel." + row[0], "--b2b-chart-funnel-" + row[0], row[1], "F-20 / C-18", "exact", "component", "从漏斗图截图取样的五级同色序列。", "漏斗连续色");
  });
  [
    ["1", "#27AD8E"], ["2", "#BF78E9"], ["3", "#8F61D1"], ["4", "#DCA1E4"],
    ["5", "#6DCDEB"], ["6", "#288FCB"], ["7", "#008280"], ["8", "#7BC335"]
  ].forEach(function (row) {
    token("数据可视化", "chart.nested." + row[0], "--b2b-chart-nested-" + row[0], row[1], "F-20 / C-18", "exact", "component", "从嵌套环图外圈实色区逐段取样。", "嵌套环图色");
  });

  [
    ["blue", "#5083FB", "#336DF4"], ["indigo", "#757DF0", "#5B65F5"], ["purple", "#9F6FF1", "#8D55ED"],
    ["wathet", "#3EC3F7", "#25B0E7"], ["lime", "#C8DD5F", "#A2C10B"], ["green", "#5CD168", "#35BD4B"],
    ["turquoise", "#6FE8D8", "#33D6C0"], ["orange", "#FF9D4C", "#FF811A"], ["yellow", "#FFC60A", "#D99904"],
    ["red", "#FF7570", "#F54A45"], ["violet", "#DE81DE", "#CF5ECF"], ["carmine", "#DF58A5", "#CC398C"]
  ].forEach(function (row) {
    token("颜色", "gradient." + row[0], "--b2b-gradient-" + row[0], "linear-gradient(90deg, " + row[1] + ", " + row[2] + ")", "F-17", "exact", "primitive", "仅在规范明确要求渐变的图形或数据视觉中使用。", "渐变色");
  });

  [
    ["1000", "#000000"], ["950", "#0F1114"], ["900", "#1F2329"], ["800", "#2B2F36"], ["700", "#373C43"],
    ["600", "#51565D"], ["500", "#646A73"], ["400", "#8F959E"], ["300", "#BBBFC4"], ["250", "#D0D3D6"],
    ["200", "#DEE0E3"], ["150", "#EFF0F1"], ["100", "#F2F3F5"], ["75", "#F5F6F7"], ["0", "#FFFFFF"]
  ].forEach(function (row) {
    token("颜色", "color.neutral." + row[0], "--b2b-neutral-" + row[0], row[1], "F-17", "exact", "primitive", "中性色阶。", "中性色阶");
  });

  [
    ["action.primary", "--b2b-color-action-primary", "#1456F0", "品牌操作、选中、焦点"],
    ["status.success", "--b2b-color-success", "#32A645", "成功文字与图标"],
    ["status.success.content", "--b2b-color-success-content", "#35BD4B", "成功内容填充"],
    ["status.warning", "--b2b-color-warning", "#ED6D0C", "警告文字与图标"],
    ["status.warning.content", "--b2b-color-warning-content", "#FF811A", "警告内容填充"],
    ["status.danger", "--b2b-color-danger", "#F54A45", "错误文字与图标"],
    ["status.danger.content", "--b2b-color-danger-content", "#F54A45", "错误内容填充"],
    ["status.information", "--b2b-color-information", "#1456F0", "信息文字与图标"],
    ["status.information.content", "--b2b-color-information-content", "#1456F0", "信息内容填充"],
    ["text.primary", "--b2b-color-text-primary", "#1F2329", "标题、正文"],
    ["text.secondary", "--b2b-color-text-secondary", "#646A73", "副标题、次要正文"],
    ["text.placeholder", "--b2b-color-text-placeholder", "#8F959E", "占位符、次要信息"],
    ["text.disabled", "--b2b-color-text-disabled", "#BBBFC4", "禁用文字"],
    ["icon.primary", "--b2b-color-icon-primary", "#2B2F36", "一级图标"],
    ["icon.secondary", "--b2b-color-icon-secondary", "#646A73", "二级图标"],
    ["icon.tertiary", "--b2b-color-icon-muted", "#8F959E", "三级与表意图标"],
    ["icon.disabled", "--b2b-color-icon-disabled", "#8F959E", "Disabled 图标；采用色彩总语义表值"],
    ["background.disabled", "--b2b-color-bg-disabled", "#EFF0F1", "禁用输入框、选项 Hover"],
    ["background.page", "--b2b-color-bg-page", "#F2F3F5", "页面背景"],
    ["background.section", "--b2b-color-bg-section", "#F5F6F7", "表单分组、设置页、侧栏"],
    ["background.subtle", "--b2b-color-bg-subtle", "#F8F9FA", "弹窗数据组、审批数据组"],
    ["background.surface", "--b2b-color-bg-surface", "#FFFFFF", "内容表面"],
    ["border.control", "--b2b-color-border-control", "#D0D3D6", "可交互控件 1px 描边"],
    ["border.surface", "--b2b-color-border-surface", "#DEE0E3", "卡片 1px 描边"],
    ["divider", "--b2b-color-divider", "rgba(31, 35, 41, 0.15)", "列表、Feed、设置页分割线"],
    ["mask", "--b2b-color-mask", "rgba(0, 0, 0, 0.55)", "弹窗与浮层遮罩"]
  ].forEach(function (row) {
    token("颜色", "color." + row[0], row[1], row[2], semanticColorSources[row[0]], "exact", "semantic", row[3], "语义颜色");
  });

  [5, 10, 15, 20, 30, 40, 50, 60, 69, 80, 89].forEach(function (value) {
    token("颜色", "opacity.dark." + value, "--b2b-opacity-dark-" + value, "rgba(31, 35, 41, " + (value / 100) + ")", "F-17", "exact", "primitive", "浅色背景上仅使用 #1F2329 为透明基色。", "透明度阶梯");
    token("颜色", "opacity.light." + value, "--b2b-opacity-light-" + value, "rgba(255, 255, 255, " + (value / 100) + ")", "F-17", "exact", "primitive", "深色背景上仅使用 #FFFFFF 为透明基色。", "透明度阶梯");
  });

  [
    ["display", "30px / 46px / 600", "特大标题；用于页面级标题。"],
    ["heading.1", "24px / 36px / 600", "一级标题；用于大标题。"],
    ["heading.2", "20px / 30px / 500", "二级标题；用于内容标题。"],
    ["heading.3", "18px / 28px / 500", "三级标题；用于内容标题。"],
    ["heading.4", "16px / 24px / 500", "四级标题；用于群名称或弹窗标题。"],
    ["heading.5", "16px / 24px / 400", "五级标题；用于标题性 Tab。"],
    ["auxiliary-title", "14px / 22px / 500", "辅助标题；用于列表、Feed、会话、Button 文字的加粗。"],
    ["body", "14px / 22px / 400", "正文；用于列表、Feed、会话、Button 的常规文字。"],
    ["body-auxiliary", "12px / 20px / 400", "正文辅助；用于正文的辅助信息。"],
    ["auxiliary", "12px / 20px / 500", "辅助强调；用于标签内的加粗文字。"],
    ["small-auxiliary", "10px / 16px / 500", "小辅助；仅用于标签内的加粗文字。"],
    ["minimum-auxiliary", "10px / 16px / 400", "最小辅助；仅用于标签等最小辅助信息。"]
  ].forEach(function (row) {
    token("字体", "type." + row[0], "--b2b-type-" + row[0].replace(/\./g, "-"), row[1], "F-09—F-11, F-19", "exact", "semantic", row[2], "PC 字体层级");
  });
  token("字体", "font.family.sans", "--b2b-font-sans", "PingFang SC / Microsoft YaHei / Helvetica Neue / Arial / sans-serif", "F-09, F-19", "observed", "primitive", "中文系统字体优先，不加载外部正文字体。", "字体基础");
  token("字体", "font.weight.regular", "--b2b-font-weight-regular", "400", "F-09, F-19", "exact", "primitive", "正文。", "字体基础");
  token("字体", "font.weight.medium", "--b2b-font-weight-medium", "500", "F-09, F-19", "exact", "primitive", "组件标题、表头、按钮强调。", "字体基础");
  token("字体", "font.weight.semibold", "--b2b-font-weight-semibold", "600", "F-09, F-19", "exact", "primitive", "大标题、关键数字。", "字体基础");

  [
    ["1", "4px", "最小节奏、评分图标"], ["2", "8px", "图文间距、同组按钮、选择控件与文字"],
    ["3", "12px", "输入边缘、表格单元格、字段内部"], ["4", "16px", "表格宽松节奏、操作组、卡片紧凑内边距"],
    ["5", "20px", "区块间距"], ["6", "24px", "页面安全边距、卡片舒适内边距"],
    ["8", "32px", "大区块与页面标题间距"], ["10", "40px", "独立段落分隔"], ["12", "48px", "大段内容分区"]
  ].forEach(function (row) {
    token("间距", "space." + row[0], "--b2b-space-" + row[0], row[1], "C-02, C-08, C-11, C-21, C-40, L-03", row[0] === "5" || row[0] === "10" || row[0] === "12" ? "inferred" : "exact", "primitive", row[2], "4px 基准间距");
  });

  [
    ["xs", "4px", "标签、复选框、表格外框"], ["sm", "6px", "按钮、输入框、下拉、提示"],
    ["md", "8px", "工具栏、小型卡片、对话框、气泡"], ["lg", "10px", "大型卡片、全屏模态、复杂容器"],
    ["pill", "999px", "圆形头像、徽标、单选、开关、滑杆和明确的全圆角控件"]
  ].forEach(function (row) {
    token("圆角", "radius." + row[0], "--b2b-radius-" + row[0], row[1], "F-12, F-18", "exact", "semantic", row[2], "圆角层级");
  });
  token("圆角", "radius.control", "--b2b-radius-control", "6px", "全局组件", "exact", "semantic", "按钮、输入框、选择器、菜单项等默认交互控件。", "圆角层级");
  token("圆角", "radius.surface", "--b2b-radius-surface", "8px", "面板、卡片、弹框", "exact", "semantic", "面板、卡片、下拉浮层和弹框等容器表面。", "圆角层级");

  var neutralShadows = [
    ["1", "0 1px 2px -2px rgba(31,35,41,.02), 0 2px 4px 0 rgba(31,35,41,.02), 0 2px 8px 2px rgba(31,35,41,.02)"],
    ["2", "0 2px 4px -4px rgba(31,35,41,.02), 0 4px 8px 0 rgba(31,35,41,.02), 0 4px 16px 4px rgba(31,35,41,.02)"],
    ["3", "0 3px 6px -6px rgba(31,35,41,.05), 0 4px 8px 0 rgba(31,35,41,.03), 0 6px 18px 6px rgba(31,35,41,.03)"],
    ["4", "0 4px 8px -8px rgba(31,35,41,.06), 0 6px 12px 0 rgba(31,35,41,.04), 0 8px 24px 8px rgba(31,35,41,.04)"],
    ["5", "0 6px 12px -10px rgba(31,35,41,.06), 0 8px 24px 0 rgba(31,35,41,.04), 0 10px 36px 10px rgba(31,35,41,.04)"]
  ];
  neutralShadows.forEach(function (row) {
    token("阴影", "shadow.down." + row[0], "--b2b-shadow-down-" + row[0], row[1], "F-13, F-18", "exact", "semantic", "向下 " + row[0] + " 级；顶部导航、常规浮层与组件。", "中性三层阴影");
  });
  function mirrorShadow(value, direction) {
    return value.replace(/(-?\d+(?:px)?)\s+(-?\d+(?:px)?)\s+(\d+px)\s+(-?\d+(?:px)?)\s+(rgba\([^)]+\))/g, function (_, x, y, blur, spread, color) {
      var offset = Math.abs(parseFloat(y));
      function px(number) { return number === 0 ? "0" : number + "px"; }
      if (direction === "up") return px(parseFloat(x)) + " " + px(-offset) + " " + blur + " " + spread + " " + color;
      if (direction === "left") return px(-offset) + " 0 " + blur + " " + spread + " " + color;
      return px(offset) + " 0 " + blur + " " + spread + " " + color;
    });
  }
  ["up", "left", "right"].forEach(function (direction) {
    neutralShadows.forEach(function (row) {
      token("阴影", "shadow." + direction + "." + row[0], "--b2b-shadow-" + direction + "-" + row[0], mirrorShadow(row[1], direction), "F-18", "observed", "semantic", direction === "up" ? "底部导航与工具栏。" : direction === "left" ? "右侧导航与右侧抽屉。" : "左侧导航与左侧抽屉。", "方向阴影");
    });
  });
  [
    ["1", "0 1px 2px -2px rgba(36,91,219,.12), 0 2px 4px 0 rgba(36,91,219,.04), 0 2px 8px 2px rgba(36,91,219,.02)"],
    ["2", "0 2px 4px -4px rgba(36,91,219,.12), 0 4px 8px 0 rgba(36,91,219,.04), 0 4px 16px 4px rgba(36,91,219,.03)"],
    ["3", "0 3px 6px -6px rgba(36,91,219,.14), 0 4px 8px 0 rgba(36,91,219,.06), 0 6px 18px 6px rgba(36,91,219,.04)"],
    ["4", "0 4px 8px -4px rgba(36,91,219,.16), 0 6px 12px 0 rgba(36,91,219,.08), 0 8px 24px 8px rgba(36,91,219,.06)"],
    ["5", "0 10px 12px -10px rgba(36,91,219,.18), 0 8px 24px 0 rgba(36,91,219,.10), 0 10px 36px 10px rgba(36,91,219,.06)"]
  ].forEach(function (row) {
    token("阴影", "shadow.primary.down." + row[0], "--b2b-shadow-primary-down-" + row[0], row[1], "F-14, F-18", "exact", "component", "品牌色阴影，仅作参考；普通卡片禁止使用。", "品牌三层阴影");
  });

  [
    ["xs", "24px"], ["sm", "28px"], ["md", "32px"], ["lg", "40px"], ["xl", "48px"]
  ].forEach(function (row) {
    token("密度", "control.height." + row[0], "--b2b-control-height-" + row[0], row[1], "C-02, C-21", "exact", "component", "按钮与输入类控件高度。", "控件高度");
  });
  token("密度", "table.row.compact", "--b2b-table-row-compact", "36px", "C-40", "observed", "component", "高频专业列表。", "表格密度");
  token("密度", "table.row.standard", "--b2b-table-row-standard", "44px", "C-40", "observed", "component", "标准列表。", "表格密度");

  token("布局", "layout.page.gutter", "--b2b-page-gutter", "24px", "L-03, P-001—P-049", "observed", "semantic", "桌面内容安全边距。", "页面壳层");
  token("布局", "layout.topbar.height", "--b2b-topbar-height", "56px", "P-001—P-049", "observed", "component", "顶部工具栏高度稳定，不与导航宽度混用。", "页面壳层");
  D.navigationSizingModel.types.forEach(function (item) {
    token("布局", "layout.navigation." + item.id + ".min", "--b2b-nav-" + item.id + "-min", item.min + "px", item.source, "inferred", "component", item.name + "宽度下限；低于此值时必须进入下一收起状态。", "导航宽度下限");
    token("布局", "layout.navigation." + item.id + ".max", "--b2b-nav-" + item.id + "-max", item.max + "px", item.source, "inferred", "component", item.name + "宽度上限；达到后使用省略、Tooltip、拖拽或 Drawer。", "导航宽度上限");
  });
  token("布局", "layout.navigation.tree.fluid", "--b2b-sidebar-width", navigationClamp("tree", "18vw"), "P-023 / P-045", "inferred", "semantic", "单列树形导航的流式实现示例；内容测量仍由导航组件负责。", "导航组合值");
  token("布局", "layout.navigation.module.fluid", "--b2b-module-sidebar-width", navigationClamp("module", "18vw"), "P-006 / P-023", "inferred", "semantic", "模块导航的流式实现示例；不得与产品栏相加后写死总宽。", "导航组合值");
  token("布局", "layout.grid.gutter", "--b2b-layout-grid-gutter", "16px", "P-013, P-022, P-042", "inferred", "semantic", "12 列构建栅格的沟槽；截图未显式标注栅格线。", "页面栅格");
  token("布局", "layout.content.bounded.max", "--b2b-content-bounded-max", "1200px", "P-035, P-045, P-049", "inferred", "semantic", "表单、设置和详情页的受控内容宽度。", "内容容器");
  token("布局", "layout.content.reading.max", "--b2b-content-reading-max", "800px", "P-019", "inferred", "semantic", "文档、说明和长文本的默认阅读宽度。", "内容容器");
  token("布局", "layout.workspace.context.width", "--b2b-workspace-context-width", "clamp(240px, 24vw, 360px)", "P-014, P-015, P-019", "inferred", "semantic", "对象列表与上下文面板在 240–360px 内按内容适配。", "内部框架");
  token("布局", "layout.workspace.toc.width", "--b2b-workspace-toc-width", "clamp(176px, 18vw, 240px)", "P-018, P-019", "inferred", "semantic", "阅读页目录在 176–240px 内适配；空间不足时收起。", "内部框架");
  token("布局", "layout.workspace.action.height", "--b2b-workspace-action-height", "64px", "P-014, P-015", "observed", "component", "流程任务底部操作栏高度。", "内部框架");
  token("布局", "layout.workspace.toolbar.height", "--b2b-workspace-toolbar-height", "56px", "P-006, P-023, P-048", "inferred", "component", "搜索、筛选和批量操作工具栏基准高度。", "内部框架");
  token("动效", "motion.fast", "--b2b-motion-fast", "120ms", "inference", "provisional", "semantic", "Hover 与轻量反馈；源图未给时间值。", "动效时长");
  token("动效", "motion.base", "--b2b-motion-base", "180ms", "inference", "provisional", "semantic", "展开、选择与常规状态过渡。", "动效时长");
  token("动效", "motion.slow", "--b2b-motion-slow", "260ms", "inference", "provisional", "semantic", "Dialog 与 Drawer。", "动效时长");
  token("响应式", "breakpoint.mobile", "@media", "767px", "inference", "provisional", "semantic", "移动端扩展断点，非截图精确值。", "断点");

  D.foundationReviews = [
    ["F-09", "Regular 400、Medium 500、Semibold 600。"], ["F-10", "12 个 PC 排版角色及其使用位置逐项登记。"],
    ["F-11", "品牌、文字与功能文字颜色复核。"], ["F-12", "4/6/8/10/全圆角及 Web/Mobile 场景矩阵。"],
    ["F-13", "5 级中性向下三层阴影参数。"], ["F-14", "5 级 #245BDB 品牌向下三层阴影参数。"],
    ["F-15", "两级描边、15% 分割线、三层背景与 55% 遮罩。"], ["F-16", "系统图标层级、功能图标和文件图标用色规则。"],
    ["F-17", "唯一颜色真相：品牌、辅助、渐变、中性、功能、文字、图标、背景、控件与透明度。"], ["F-18", "圆角、四向阴影、描边与背景总规范。"],
    ["F-19", "PC 与移动字号体系、字重和字体颜色总规范。"], ["F-20", "数据可视化颜色、图表类型与图表状态总规范；由可视化组件页承载。"]
  ].map(function (row) { return { id: row[0], conclusion: row[1], status: "reviewed" }; });

  D.foundationConflicts = [];
})();
