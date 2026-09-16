(function registerRendererPresets(global) {
  "use strict";

  var components = global.B2B && global.B2B.components;
  if (!components || !components.apiSchemas) throw new Error("renderer presets require runtime/api-schema.js");

  /*
   * Presets provide only the content needed to render a contract variant.
   * A component's default must remain its real source default; it must never be
   * changed merely to make the catalogue look more complete. Internal keys
   * start with `_` and are never exposed to callers; public keys become part
   * of describe().api.props.
   */
  function c18Single() { return [{ label: "设计", value: 42, series: "数量" }, { label: "研发", value: 68, series: "数量" }, { label: "产品", value: 55, series: "数量" }, { label: "运营", value: 31, series: "数量" }, { label: "销售", value: 74, series: "数量" }, { label: "客服", value: 47, series: "数量" }]; }
  function c18BasicFunnel() { return [{ label: "入口访问", value: 100 }, { label: "产品浏览", value: 84 }, { label: "方案试用", value: 66 }, { label: "留下线索", value: 49 }, { label: "商务沟通", value: 31 }, { label: "签约交付", value: 18 }]; }
  function c18ConversionFunnel() { return [{ label: "消息送达", value: 5676 }, { label: "内容查看", value: 3872 }, { label: "详情点击", value: 1668 }, { label: "加入购物车", value: 610 }, { label: "提交订单", value: 584 }, { label: "支付完成", value: 565 }]; }
  function c18Multi() { return [{ label: "一月", value: 42, series: "计划" }, { label: "一月", value: 28, series: "实际" }, { label: "二月", value: 68, series: "计划" }, { label: "二月", value: 52, series: "实际" }, { label: "三月", value: 55, series: "计划" }, { label: "三月", value: 71, series: "实际" }, { label: "四月", value: 76, series: "计划" }, { label: "四月", value: 63, series: "实际" }, { label: "五月", value: 61, series: "计划" }, { label: "五月", value: 79, series: "实际" }, { label: "六月", value: 84, series: "计划" }, { label: "六月", value: 73, series: "实际" }]; }
  function c18Nested() { return [{ label: "0–9", value: 18, series: "0–29" }, { label: "10–19", value: 12, series: "0–29" }, { label: "20–29", value: 14, series: "0–29" }, { label: "30–39", value: 10, series: "20–49" }, { label: "40–49", value: 12, series: "20–49" }, { label: "50–59", value: 14, series: "50岁及以上" }, { label: "60–69", value: 10, series: "50岁及以上" }, { label: "70岁及以上", value: 10, series: "50岁及以上" }]; }
  function c18Radar() { return [{ label: "易用性", value: 82, series: "方案 A" }, { label: "性能", value: 74, series: "方案 A" }, { label: "稳定性", value: 91, series: "方案 A" }, { label: "成本", value: 68, series: "方案 A" }, { label: "交付效率", value: 78, series: "方案 A" }, { label: "扩展性", value: 85, series: "方案 A" }, { label: "易用性", value: 64, series: "方案 B" }, { label: "性能", value: 88, series: "方案 B" }, { label: "稳定性", value: 70, series: "方案 B" }, { label: "成本", value: 86, series: "方案 B" }, { label: "交付效率", value: 72, series: "方案 B" }, { label: "扩展性", value: 76, series: "方案 B" }]; }
  function c18Sankey() { return [{ source: "搜索广告", target: "产品页", value: 58 }, { source: "自然搜索", target: "产品页", value: 42 }, { source: "行业活动", target: "解决方案", value: 36 }, { source: "客户推荐", target: "解决方案", value: 24 }, { source: "产品页", target: "试用申请", value: 64 }, { source: "产品页", target: "资料下载", value: 36 }, { source: "解决方案", target: "试用申请", value: 38 }, { source: "解决方案", target: "商务咨询", value: 22 }]; }
  function c18Scatter() { return [{ label: "样本 A", x: 12, y: 28, size: 3, value: 28, series: "实验组" }, { label: "样本 B", x: 22, y: 46, size: 5, value: 46, series: "实验组" }, { label: "样本 C", x: 36, y: 61, size: 4, value: 61, series: "实验组" }, { label: "样本 D", x: 48, y: 54, size: 6, value: 54, series: "实验组" }, { label: "样本 E", x: 18, y: 35, size: 4, value: 35, series: "对照组" }, { label: "样本 F", x: 31, y: 40, size: 3, value: 40, series: "对照组" }, { label: "样本 G", x: 44, y: 38, size: 5, value: 38, series: "对照组" }, { label: "样本 H", x: 57, y: 49, size: 4, value: 49, series: "对照组" }]; }
  function c18Histogram() { return [{ label: "0–9", value: 6, series: "频数" }, { label: "10–19", value: 13, series: "频数" }, { label: "20–29", value: 21, series: "频数" }, { label: "30–39", value: 28, series: "频数" }, { label: "40–49", value: 23, series: "频数" }, { label: "50–59", value: 16, series: "频数" }, { label: "60–69", value: 9, series: "频数" }, { label: "70–79", value: 4, series: "频数" }]; }
  function c18Heatmap() {
    var columns = ["分类一", "分类二", "分类三", "分类四", "分类五", "分类六", "分类七", "分类八"], rows = ["业务一", "业务二", "业务三", "业务四", "业务五"], values = [[3,7,4,1,6,1,5,0],[2,1,2,1,1,7,3,1],[1,2,10,1,3,2,1,6],[6,3,1,8,0,9,7,1],[5,1,7,1,2,3,1,3]];
    return rows.reduce(function (items, yLabel, rowIndex) { return items.concat(columns.map(function (xLabel, columnIndex) { return { xLabel: xLabel, yLabel: yLabel, value: values[rowIndex][columnIndex] }; })); }, []);
  }
  function c18Combo() { var days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], breakfast = [15,12,15,10,13,10,12], lunch = [25,30,24,25,20,22,19], drink = [22,43,33,22,10,30,50]; return days.reduce(function (items, label, index) { return items.concat([{ label: label, value: breakfast[index], series: "早餐", mark: "bar" }, { label: label, value: lunch[index], series: "午餐", mark: "bar" }, { label: label, value: drink[index], series: "饮料", mark: "line" }]); }, []); }
  function c18Preset(variant, data) {
    var axis = ["basic-column","grouped-column","stacked-column","percent-stacked-column","basic-bar","grouped-bar","stacked-bar","basic-line","smooth-line","step-line","basic-area","smooth-area","step-area","stacked-area","percent-stacked-area","scatter","histogram","heatmap","column-line-combo"].indexOf(variant) >= 0;
    var circular = ["rose", "pie", "donut", "nested-donut"].indexOf(variant) >= 0;
    return { title: "项目交付数据", description: "caller-owned 示例数据", data: data, state: "default", xAxisTitle: axis ? "周期" : "", yAxisTitle: axis ? "数值" : "", axisTitles: axis ? "show" : "hide", legend: "auto", legendPosition: "bottom", toolbar: "standard", showFrame: true, showLabels: circular, showTotal: variant === "donut", totalLabel: "总计", unit: "", palette: "categorical" };
  }

  var presets = {
    "C-52": {d:"panel",v:{panel:{},sidebar:{}}},
    "C-02": { d: "secondary-gray", v: {
      "primary": {},
      "danger": {},
      "secondary-blue": {},
      "secondary-danger": {},
      "secondary-gray": {}
    } },
    "C-03": { d: "Button_Text", v: {
      "Button_Text": { label: "查看全部", tone: "neutral" },
      "Button_Link": { label: "创建群组", tone: "primary" },
      "Link": { label: "前往设置", tone: "primary", href: "#" }
    } },
    "C-04": { d: "Button_Icon", v: {
      "Button_Icon": { icon: "more_horiz", label: "更多操作", size: 32 },
      "Outlined icon button": { icon: "notifications", label: "通知", size: 32 },
      "icon group": { icon: "format_align_left", label: "对齐方式", size: 32, items: [{ icon: "format_align_left", label: "左对齐" }, { icon: "format_align_center", label: "居中对齐" }, { icon: "format_align_right", label: "右对齐" }] },
      "menu trigger": { icon: "more_horiz", label: "更多操作", size: 32, items: [{ label: "复制", icon: "content_copy" }, { label: "移动", icon: "drive_file_move" }, { label: "删除", icon: "delete", danger: true }] }
    } },
    "C-05": { d: "Primary", v: {
      "Primary": { label: "立即体验" },
      "Secondary-Primary": { label: "了解更多" },
      "Outlined": { label: "查看详情" }
    } },
    "C-06": { d: "Split button", v: {
      "Split button": { label: "创建", mainIcon: "add", open: false, appearance: "primary", items: [{ label: "创建活动", icon: "event" }, { label: "创建日程", icon: "calendar_month" }, { label: "从模板创建", icon: "description" }] },
      "Menu button": { label: "导出", open: false, appearance: "primary", items: [{ label: "导出 PDF" }, { label: "导出 Word" }, { label: "导出图片" }] },
      "Overflow Menu": { label: "更多操作", open: false, appearance: "secondary-gray", icon: "more_horiz", items: [{ label: "复制", icon: "content_copy" }, { label: "移动到", icon: "drive_file_move" }, { label: "删除", icon: "delete", danger: true }] }
    } },
    "C-07": { d: "secondary", v: {
      "primary": { appearance: "primary", size: 48, icon: "add", label: "新建" },
      "secondary": { appearance: "secondary", size: 48, icon: "help", label: "帮助" },
      "menu": { appearance: "secondary", size: 48, icon: "headset_mic", label: "快捷操作", expanded: false, items: [{ label: "在线客服", icon: "chat" }, { label: "发送邮件", icon: "mail" }] },
      "message": { appearance: "secondary", size: 48, icon: "keyboard_double_arrow_down", label: "消息", badge: 8 },
      "official-text": { appearance: "primary", size: 40, icon: "support_agent", label: "联系我们" }
    } },
    "C-08": { d: "基础下拉菜单", v: {
      "基础下拉菜单": { items: [{ label: "复制" }, { label: "移动" }, { label: "导出" }, { label: "删除", danger: true }] },
      "级联菜单": { items: [{ label: "查找和替换" }, { label: "创建副本" }, { label: "导出为", children: [{ label: "PDF" }, { label: "Word" }, { label: "图片" }] }, { label: "打印" }] },
      "辅助标题": { title: "操作", items: [{ label: "剪切", icon: "content_cut" }, { label: "复制", icon: "content_copy" }, { label: "删除", icon: "delete", danger: true }] },
      "分组": { items: [{ label: "编辑", icon: "edit" }, { label: "复制", icon: "content_copy" }, { divider: true }, { label: "移动到", icon: "drive_file_move" }, { label: "删除", icon: "delete", danger: true }] },
      "动态菜单": { items: Array.from({ length: 20 }, function (_, index) { return { label: "项目 " + (index + 1) }; }), loading: false },
      "创建菜单": { items: [{ label: "项目一" }, { label: "项目二" }, { label: "项目三" }, { label: "项目四" }, { divider: true }, { label: "创建项目", icon: "add", action: true }] },
      "选择菜单": { mode: "selection", items: [{ label: "选项一" }, { label: "选项二", selected: true }, { label: "选项三" }, { label: "选项四" }, { label: "选项五" }] },
      "复杂信息菜单项": { items: [{ label: "复制文档", description: "创建当前文档的完整副本", icon: "description" }, { label: "完成任务", description: "标记任务并通知相关成员", icon: "task_alt" }, { divider: true }, { label: "删除文档", description: "此操作不可撤销", icon: "delete", danger: true }] },
      "上下文菜单": { triggerLabel: "右键打开菜单", items: [{ label: "剪切", icon: "content_cut" }, { label: "复制", icon: "content_copy" }, { label: "粘贴", icon: "content_paste" }] }
    } },
    "C-09": { d: "multiple", v: {
      "single": { size: "medium", open: true, valueLabel: "亚洲 / 中国 / 华东", columns: [{ items: [{ label: "亚洲", children: [{ label: "中国", children: ["华东", "华南", "华北"] }, "日本", "新加坡"] }, { label: "欧洲", children: ["法国", "德国"] }, { label: "美洲", children: ["美国", "加拿大"] }], activeIndex: 0, hasChildren: true }, { items: [{ label: "中国", children: ["华东", "华南", "华北"] }, "日本", "新加坡"], activeIndex: 0, hasChildren: true }, { items: ["华东", "华南", "华北"], activeIndex: 0, hasChildren: false }] },
      "multiple": { size: "medium", open: true, tagDisplay: "all", tags: ["亚洲 / 中国 / 华东", "欧洲 / 法国"], columns: [{ items: [{ label: "亚洲", children: [{ label: "中国", children: ["华东", "华南", "华北"] }, "日本", "新加坡"] }, { label: "欧洲", children: ["法国", "德国"] }, { label: "美洲", children: ["美国", "加拿大"] }], activeIndex: 0, hasChildren: true }, { items: [{ label: "中国", children: ["华东", "华南", "华北"] }, "日本", "新加坡"], activeIndex: 0, hasChildren: true }, { items: ["华东", "华南", "华北"], activeIndex: 0, hasChildren: false }] },
      "searchable": { size: "xlarge", open: true, valueLabel: "亚洲 / 中国 / 华东", columns: [{ items: ["亚洲 / 中国 / 华东", "亚洲 / 中国 / 华南", "欧洲 / 法国"], activeIndex: 0, hasChildren: false }] },
      "hover-expand": { size: "medium", open: true, valueLabel: "亚洲 / 中国 / 华东", columns: [{ items: [{ label: "亚洲", children: [{ label: "中国", children: ["华东", "华南", "华北"] }, "日本", "新加坡"] }, { label: "欧洲", children: ["法国", "德国"] }, { label: "美洲", children: ["美国", "加拿大"] }], activeIndex: 0, hasChildren: true }, { items: [{ label: "中国", children: ["华东", "华南", "华北"] }, "日本", "新加坡"], activeIndex: 0, hasChildren: true }, { items: ["华东", "华南", "华北"], activeIndex: 0, hasChildren: false }] }
    } },
    "C-10": { d: "full", v: {
      "full": { trigger: "swatch-value", size: "medium", value: "#004CFF", alpha: 100, open: false, disabled: false },
      "simple": { trigger: "swatch", size: "small", value: "#3370FF", alpha: 100, open: false, disabled: false },
      "value": { trigger: "swatch-value", size: "large", value: "#004CFF", alpha: 100, open: false, disabled: false }
    } },
    "C-11": { d: "with-description", v: {
      "group": { label: "通知对象", selectAllLabel: "全选", orientation: "vertical", items: [{ value: "design", label: "设计团队", checked: true }, { value: "engineering", label: "研发团队", checked: false }, { value: "product", label: "产品团队", checked: false }] },
      "standalone": { value: "terms", label: "我已阅读并同意服务条款" },
      "with-description": { value: "updates", label: "接收产品更新", description: "通过邮件接收重要版本和功能更新。" },
      "indeterminate": { value: "current-group", label: "选择当前分组", mixed: true }
    } },
    "C-12": { d: "top-horizontal-web", v: {
      "top-horizontal-web": {
        activeId: "top-2",
        items: [{ id: "top-1", label: "概览" }, { id: "top-2", label: "项目" }, { id: "top-3", label: "成员" }, { id: "top-4", label: "报表" }, { id: "top-5", label: "自动化" }, { id: "top-6", label: "设置" }, { id: "top-7", label: "帮助" }, { id: "top-8", label: "管理后台" }],
        brand: { label: "项目中心", icon: "deployed_code" },
        actions: [{ id: "preview", kind: "icon-button", label: "预览", icon: "visibility" }, { id: "download", kind: "icon-button", label: "下载", icon: "download" }, { id: "delete", kind: "icon-button", label: "删除", icon: "delete" }, { id: "create", kind: "button", label: "新建", icon: "add" }, { id: "account", kind: "avatar", label: "账户", text: "林", fallback: "林" }]
      },
      "side-web-expanded": {
        activeId: "web-2-1",
        expandedIds: ["web-2"],
        items: [{ id: "web-1", label: "Items", icon: "desktop_windows" }, { id: "web-2", label: "Items", icon: "code", badge: "99", children: [{ id: "web-2-1", label: "Secondary navigation" }, { id: "web-2-2", label: "Secondary navigation", children: [{ id: "web-2-2-1", label: "Three-level navigation" }] }] }, { id: "web-3", label: "Items", icon: "near_me" }, { id: "web-4", label: "Items", icon: "article" }]
      },
      "side-web-collapsed": {
        activeId: "web-2-1",
        expandedIds: ["web-2"],
        items: [{ id: "web-1", label: "Items", icon: "desktop_windows" }, { id: "web-2", label: "Items", icon: "code", badge: "99", children: [{ id: "web-2-1", label: "Secondary navigation" }, { id: "web-2-2", label: "Secondary navigation", children: [{ id: "web-2-2-1", label: "Three-level navigation" }] }] }, { id: "web-3", label: "Items", icon: "near_me" }]
      },
      "side-desktop": {
        width: 280,
        activeId: "desktop-2",
        items: [{ id: "desktop-1", label: "Items", icon: "desktop_windows" }, { id: "desktop-2", label: "Enterprise Financial Management System", icon: "code" }, { id: "desktop-3", label: "Items", icon: "near_me", children: [{ id: "desktop-3-1", label: "Items" }] }]
      },
      "side-desktop-tree": {
        width: 280,
        activeId: "tree-2-1-1",
        expandedIds: ["tree-2", "tree-2-1"],
        items: [{ id: "tree-1", label: "First-level navigation", icon: "view_sidebar" }, { id: "tree-2", label: "First-level navigation", icon: "view_sidebar", children: [{ id: "tree-2-1", label: "Secondary navigation", children: [{ id: "tree-2-1-1", label: "Three-level navigation" }, { id: "tree-2-1-2", label: "Three-level navigation" }] }] }]
      },
      "no-background": {
        width: 260,
        activeId: "transparent-2-1",
        expandedIds: ["transparent-2"],
        items: [{ id: "transparent-1", label: "First-level navigation", icon: "view_sidebar" }, { id: "transparent-2", label: "First-level navigation", icon: "view_sidebar", children: [{ id: "transparent-2-1", label: "Secondary navigation" }] }]
      }
    } },
    "C-13": { d: "collapsed-history", v: {
      "single-level": { items: ["工作台"], open: false, longLabelIndex: null },
      "two-level": { items: ["工作台", "项目管理"], open: false, longLabelIndex: null },
      "three-level": { items: ["工作台", "项目管理", "设计系统"], open: false, longLabelIndex: null },
      "four-level": { items: ["工作台", "项目管理", "设计系统", "组件详情"], open: false, longLabelIndex: null },
      "collapsed-history": { items: ["工作台", "项目管理", "设计系统", "组件规范", "面包屑"], open: false, longLabelIndex: null },
      "component-context": { items: ["组件库", "导航组件", "面包屑"], open: false, longLabelIndex: null }
    } },
    "C-14": { d: "basic-horizontal", v: {
      "basic-horizontal": { current: 1, labels: ["基本信息", "权限配置", "确认提交", "完成"], descriptions: ["填写项目基本信息", "设置成员与角色", "检查配置并提交", "流程处理完成"], clickable: true },
      "basic-vertical": { current: 1, labels: ["基本信息", "权限配置", "确认提交", "完成"], descriptions: ["填写项目基本信息", "设置成员与角色", "检查配置并提交", "流程处理完成"] },
      "simple-horizontal": { current: 1, labels: ["基本信息", "权限配置", "确认提交"], descriptions: ["填写项目基本信息", "设置成员与角色", "检查配置并提交"] },
      "simple-vertical": { current: 1, labels: ["基本信息", "权限配置", "确认提交"], descriptions: ["填写项目基本信息", "设置成员与角色", "检查配置并提交"] },
      "tab-step": { current: 1, labels: ["配置", "预览", "发布"], descriptions: ["配置参数", "检查结果", "发布内容"] }
    } },
    "C-15": { d: "default-pagination", v: {
      "default-pagination": { current: 6, totalPages: 20, pages: [4,5,6,7,8], showTotal: true, showPageSize: true, showJumper: true, totalText: "共 1000 条", startEllipsis: true, endEllipsis: true },
      "small-pagination": { current: 3, totalPages: 10, pages: [1,2,3,4,5], showTotal: false, showPageSize: false, showJumper: false, totalText: "共 1000 条", startEllipsis: false, endEllipsis: true },
      "minimal": { current: 3, totalPages: 20, pages: [], showTotal: false, showPageSize: false, showJumper: false, totalText: "共 1000 条", startEllipsis: false, endEllipsis: false }
    } },
    /* C-16 items are required caller-owned business text; presets intentionally
     * select only source-backed variants and never inject demonstration data. */
    "C-16": { d: "cross-axis", v: {
      "vertical-light": { appearance: "default", visibility: "always" },
      "horizontal-light": { appearance: "default", visibility: "always" },
      "vertical-dark": { appearance: "default", visibility: "always" },
      "horizontal-dark": { appearance: "default", visibility: "always" },
      "cross-axis": { appearance: "default", visibility: "always" }
    } },
    "C-17": { d: "hierarchical-vertical", v: {
      "standard-vertical": {},
      "standard-horizontal": {},
      "hierarchical-vertical": {},
      "hierarchical-horizontal": {}
    } },
    "C-18": { d: "basic-column", v: {
      "basic-column": c18Preset("basic-column", c18Single()),
      "grouped-column": c18Preset("grouped-column", c18Multi()),
      "stacked-column": c18Preset("stacked-column", c18Multi()),
      "percent-stacked-column": c18Preset("percent-stacked-column", c18Multi()),
      "basic-bar": c18Preset("basic-bar", c18Single()),
      "grouped-bar": c18Preset("grouped-bar", c18Multi()),
      "stacked-bar": c18Preset("stacked-bar", c18Multi()),
      "rose": c18Preset("rose", c18Single()),
      "pie": c18Preset("pie", c18Single()),
      "donut": c18Preset("donut", c18Single()),
      "nested-donut": c18Preset("nested-donut", c18Nested()),
      "basic-line": c18Preset("basic-line", c18Multi()),
      "smooth-line": c18Preset("smooth-line", c18Multi()),
      "step-line": c18Preset("step-line", c18Multi()),
      "basic-area": c18Preset("basic-area", c18Multi()),
      "smooth-area": c18Preset("smooth-area", c18Multi()),
      "step-area": c18Preset("step-area", c18Multi()),
      "stacked-area": c18Preset("stacked-area", c18Multi()),
      "percent-stacked-area": c18Preset("percent-stacked-area", c18Multi()),
      "radar": c18Preset("radar", c18Radar()),
      "sankey": c18Preset("sankey", c18Sankey()),
      "basic-funnel": c18Preset("basic-funnel", c18BasicFunnel()),
      "conversion-funnel": c18Preset("conversion-funnel", c18ConversionFunnel()),
      "liquid": c18Preset("liquid", [{ label: "完成率", value: 68 }]),
      "scatter": c18Preset("scatter", c18Scatter()),
      "histogram": c18Preset("histogram", c18Histogram()),
      "heatmap": c18Preset("heatmap", c18Heatmap()),
      "word-cloud": c18Preset("word-cloud", c18Single()),
      "column-line-combo": c18Preset("column-line-combo", c18Combo()),
      "metric": Object.assign(c18Preset("metric", [{label:"新增投递",value:123,trend:"up",trendTone:"positive",icon:"visibility",change:"较上期 +12.8%",description:"本月有效投递"},{label:"Offer 发放",value:34,trend:"down",trendTone:"negative",icon:"group",change:"较上期 -3.6%",description:"本月正式录用通知"}]), {legend:"hide"})
    } },
    "C-19": { d: "date-time-range", v: {
      "date": { open: true, value: "2026-07-13", placeholder: "请选择日期", label: "选择日期", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: false },
      "date-range": { open: true, value: "2026-07-13 — 2026-07-20", placeholder: "请选择日期范围", label: "选择日期范围", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: false },
      "week": { open: true, value: "第 29 周", placeholder: "请选择周", label: "选择周", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: false },
      "month": { open: true, value: "7 月", placeholder: "请选择月", label: "选择月", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: false },
      "quarter": { open: true, value: "Q3", placeholder: "请选择季度", label: "选择季度", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: false },
      "year": { open: true, value: "2026", placeholder: "请选择年", label: "选择年", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: false },
      "date-time": { open: true, value: "2026-07-13 14:30:45", placeholder: "请选择日期时间", label: "选择日期时间", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: true },
      "date-time-range": { open: true, value: "2026-07-13 09:00:15 — 2026-07-20 18:00:45", placeholder: "请选择日期时间范围", label: "选择日期时间范围", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: true }
    } },
    "C-20": { d: "基础表单", v: {
      "基础表单": {},
      "组合表单": {},
      "分组表单": {},
      "分步表单": {},
      "联动表单": {}
    } },
    "C-21": { d: "基础输入框", v: {
      "基础输入框": { size: "medium", value: "", label: "输入内容" },
      "数字输入框": { size: "medium", value: "", min: 0, max: 10, step: 1, label: "数值" },
      "带图标输入框": { size: "medium", value: "", prefixIcon: "search", infoTooltip: null, label: "搜索" },
      "带属性输入框": { size: "medium", value: "", prefixAddon: { id: "protocol", type: "text", text: "https://" }, suffixAddon: null, label: "属性值" },
      "组合输入框": { size: "medium", value: "", composite: { appearance: "filled", segments: [{ id: "start", label: "起始值", value: "", placeholder: "Start" }, { id: "end", label: "结束值", value: "", placeholder: "End" }] }, label: "组合值" },
      "长文本输入框": { size: "medium", value: "", counter: true, maxLength: 240, label: "详细说明" }
    } },
    "C-22": { d: "基础单选", v: {
      "基础单选": {},
      "按钮型单选": {}
    } },
    "C-23": { d: "基础单选", v: {
      "基础单选": { items: ["设计", "研发", "测试", "运营"], selected: [], open: false },
      "基础多选": { items: ["设计", "研发", "测试", "运营"], selected: [], multiple: true, open: false },
      "自定义选项": { items: [{ label: "自定义项目 A", icon: "person" }, { label: "自定义项目 B", icon: "person" }], selected: [], open: false },
      "分组选项": { items: [{ group: "团队" }, "产品", "设计", { group: "区域" }, "北京", "上海"], selected: [], open: false },
      "无边框": { items: ["默认视图", "紧凑视图", "舒适视图"], selected: [], open: false },
      "下划线": { items: ["全部", "进行中", "已完成"], selected: [], open: false },
      "可搜索": { items: ["Universe", "Galaxy", "Nebula", "Asteroid"], selected: [], searchable: true, query: "", open: false },
      "可创建": { items: ["Design", "Research", "Engineering"], selected: [], searchable: true, creatable: true, query: "", open: false },
      "复杂内容": { items: [{ label: "Maya Chun", description: "Product Designer", avatar: "M" }, { label: "Linda Jones", description: "Software Engineer", tag: "研发" }, { label: "Juliette Roux", description: "Project Manager", icon: "person" }], selected: [], searchable: true, clearable: true, open: false }
    } },
    "C-24": { d: "星级评分", v: {
      "星级评分": {},
      "好评差评": {},
      "普通好评差评": {},
      "小型好评差评": {},
      "自定义图标": { icon: "favorite" },
      "自定义颜色": { color: "blue" }
    } },
    "C-25": { d: "默认步进器", v: {
      "默认步进器": { value: 5, min: 1, max: 999, step: 1, size: "medium", width: "default", state: "normal" },
      "窄宽步进器": { value: 5, min: 1, max: 99, step: 1, size: "small", width: "narrow", state: "normal" },
      "长宽步进器": { value: 120, min: 1, max: 999, step: 1, size: "large", width: "wide", state: "normal" },
      "最小值": { value: 1, min: 1, max: 9, step: 1, size: "medium", width: "default", state: "normal" },
      "最大值": { value: 9, min: 1, max: 9, step: 1, size: "medium", width: "default", state: "normal" },
      "错误": { value: 10, min: 1, max: 9, step: 1, size: "medium", width: "default", state: "error" }
    } },
    "C-26": { d: "单滑块", v: {
      "单滑块": { min: 0, max: 100, value: 40, second: 75, range: false, step: 1, markValues: [], tooltip: true, disabled: false },
      "双滑块": { min: 0, max: 100, value: 25, second: 75, range: true, step: 1, markValues: [], tooltip: true, disabled: false },
      "竖向滑块": { min: 0, max: 100, value: 65, second: 75, range: false, step: 1, markValues: [], tooltip: true, disabled: false },
      "带节点滑块": { min: 0, max: 100, value: 50, second: 75, range: false, step: 25, markValues: [0,25,50,75,100], tooltip: true, disabled: false },
      "输入框联动": { min: 0, max: 100, value: 16, second: 75, range: false, step: 1, markValues: [], tooltip: true, disabled: false },
      "数值图标": { min: 0, max: 100, value: 40, second: 75, range: false, step: 1, markValues: [], tooltip: true, disabled: false }
    } },
    "C-27": { d: "base", v: {
      "base": { size: "medium", state: "off-normal", label: "切换设置" }
    } },
    "C-28": { d: "勾选型树选择", v: {
      "基础树选择-导航": { state: "normal", open: true, nodes: [{ label: "知识库", expanded: true, children: [{ label: "产品规范", expanded: true, children: [{ label: "概览" }, { label: "组件" }] }, { label: "设计资源", children: [{ label: "Token" }] }] }, { label: "项目", children: [{ label: "路线图" }] }], selected: ["概览"], query: "", label: "知识库导航" },
      "基础树选择-单选": { state: "normal", open: true, nodes: [{ label: "产品", children: [{ label: "设计" }, { label: "研发" }] }, { label: "运营", children: [{ label: "客户成功" }] }], selected: ["设计"], query: "", label: "选择分类" },
      "基础树选择-多选": { state: "normal", open: true, nodes: [{ label: "产品", children: [{ label: "设计" }, { label: "研发" }] }, { label: "运营", children: [{ label: "客户成功" }] }], selected: ["设计", "研发"], query: "", label: "选择分类" },
      "勾选型树选择": { state: "normal", open: true, nodes: [{ label: "产品", children: [{ label: "设计" }, { label: "研发" }] }, { label: "运营", children: [{ label: "客户成功" }] }], selected: ["设计", "研发"], query: "", label: "选择分类" }
    } },
    "C-29": { d: "列表", v: {
      "列表": { items: ["选项 1", "选项 2", "选项 3", "选项 4", "选项 5", "选项 6", "选项 7"], selected: [], compact: false, customHeader: "", targetHeader: "" },
      "树结构": { items: [{ label: "设计中心", level: 0, branch: true, expanded: true, partial: true }, { label: "视觉设计", level: 1 }, { label: "交互设计", level: 1 }, { label: "研发中心", level: 0, branch: true, expanded: true }, { label: "Web", level: 1 }, { label: "客户端", level: 1 }], selected: [], compact: false, customHeader: "", targetHeader: "" },
      "分组结构": { items: [{ type: "group", label: "团队" }, { label: "设计" }, { label: "研发" }, { type: "group", label: "区域" }, { label: "北京" }, { label: "上海" }], selected: [], compact: false, customHeader: "", targetHeader: "" },
      "自定义选项": { items: ["Maya Chun", "Linda Jones", "Juliette Roux"], selected: [], compact: false, customHeader: "", targetHeader: "" },
      "自定义已选项": { items: ["设计规范", "交互规范", "视觉资源", "开发文档"], selected: [], compact: false, customHeader: "全部组件", targetHeader: "已选组件" }
    } },
    "C-30": { d: "range", v: {
      "time": { state: "default", size: 32, value: "14:30:00", open: true, seconds: true, footer: false, clearable: true, disabledBefore: 0, label: "选择时间" },
      "range": { state: "default", size: 32, value: "09:00:00 - 18:00:00", open: true, seconds: true, footer: false, clearable: true, disabledBefore: 0, label: "选择时间范围" },
      "12-hour": { state: "default", size: 32, value: "14:30", open: true, seconds: false, footer: false, clearable: true, disabledBefore: 0, label: "12 小时时间" },
      "24-hour": { state: "default", size: 32, value: "14:30:00", open: true, seconds: true, footer: false, clearable: true, disabledBefore: 0, label: "24 小时时间" },
      "with-date": { state: "default", size: 32, value: "2026-07-13 14:30", open: true, seconds: false, footer: true, clearable: true, disabledBefore: 0, label: "选择日期和时间" }
    } },
    "C-31": { d: "file-list", v: {
      "button": { size: "standard", state: "default", label: "上传文件", description: "Only supports: JPG, PNG, PDF, the max file size is 10MB", name: "attachment.pdf", fileType: "pdf", progress: 0, loaded: "0 MB / 9.5 MB", interactive: true },
      "drag": { size: "standard", state: "default", label: "拖拽或选择文件上传", description: "Only pictures can be uploaded, support format: JPG, PNG, JPEG", name: "product-cover.png", fileType: "img", progress: 0, loaded: "0 MB / 9.5 MB", interactive: true },
      "picture-card": { size: "standard", state: "success", label: "选择图片", description: "The max file size is 10MB", name: "product-cover.png", fileType: "img", progress: 100, loaded: "9.5 MB", interactive: true },
      "file-list": { size: "standard", state: "success", label: "上传文件", description: "Only supports: JPG, PNG, PDF, the max file size is 10MB", name: "design-system.zip", fileType: "zip", progress: 100, loaded: "9.5 MB", interactive: false }
    } },
    "C-32": { d: "group", v: {
      "image": { image: "templates/assets/people-lake-hero.png", fallback: "林", text: "林", icon: null, topBadge: null, items: [], size: 40, label: "林七七" },
      "text": { image: null, fallback: "林", text: "林", icon: null, topBadge: null, items: [], size: 40, label: "林七七" },
      "icon": { image: null, fallback: "?", icon: "person", text: "", topBadge: null, items: [], size: 40, label: "默认用户" },
      "group": { image: null, fallback: "?", icon: null, text: "", topBadge: null, items: [{ text: "林", label: "林七七" }, { text: "王", label: "王五" }, { text: "赵", label: "赵六" }, { text: "M", label: "Maya" }, { text: "L", label: "Linda" }, { text: "J", label: "Jerry" }], size: 32, maxVisible: 5, expanded: false, label: "成员头像组" },
      "with-status": { image: null, fallback: "林", icon: null, text: "林", topBadge: null, items: [], size: 48, status: "online", label: "林七七，在线" },
      "with-text": { image: null, fallback: "J", icon: null, text: "J", topBadge: null, primaryText: "Jerry", secondaryText: "", items: [], size: 24, label: "Jerry" },
      "with-secondary-text": { image: null, fallback: "Y", icon: null, text: "Y", topBadge: null, primaryText: "Yizhuo", secondaryText: "User experience", items: [], size: 32, label: "Yizhuo，User experience" },
      "with-top-badge": { image: "templates/assets/people-lake-hero.png", fallback: "JY", icon: null, text: "JY", topBadge: { variant: "character", text: "38", color: "red", appearance: "fill-stroke", label: "38 items need attention" }, items: [], size: 32, label: "Jerry Young" }
    } },
    "C-33": { d: "dot", v: {
      "dot": { variant: "dot", color: "red", size: 8, text: "", icon: "", appearance: "fill", cornerShape: "triangle", label: "Unread" },
      "character": { variant: "character", text: "99+", color: "red", size: 14, icon: "", appearance: "fill", cornerShape: "triangle", label: "99 unread items" },
      "icon": { variant: "icon", text: "", icon: "check", color: "green", size: 14, appearance: "fill", cornerShape: "triangle", label: "Available" },
      "corner": { variant: "corner", text: "", icon: "", color: "red", size: 14, appearance: "fill", cornerShape: "triangle", label: "New" }
    } },
    "C-34": { d: "basic", v: {
      "basic": { variant: "basic", appearance: "bordered", size: "default", title: "组件文档", body: "查看组件规范、变体和交互说明。", meta: "今天更新", icon: "description", hoverable: false, selected: false, loading: false, extraActionLabel: "更多", footerActionLabel: "查看详情" },
      "compact": { variant: "compact", appearance: "bordered", size: "default", title: "林七七", body: "", meta: "", icon: "person", hoverable: true, selected: false, loading: false, extraActionLabel: "更多", footerActionLabel: null, avatar: { text: "林", image: null, fallback: "林", label: "林七七" } },
      "cover": { variant: "cover", appearance: "bordered", size: "default", title: "设计系统", body: "企业级设计语言与前端组件库。", meta: "内容资源", icon: "auto_awesome", hoverable: true, selected: false, loading: false, extraActionLabel: "更多", footerActionLabel: "打开" },
      "meta": { variant: "meta", appearance: "bordered", size: "default", title: "组件工作台", body: "统一查看设计规范和生产 API。", meta: "林七七", icon: "image", hoverable: true, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null, coverImage: "templates/assets/people-lake-hero.png", coverAlt: "湖边人物", avatar: { text: "林", image: null, fallback: "林", label: "林七七" } },
      "external-grid": { variant: "external-grid", appearance: "bordered", size: "default", title: "项目概览", body: "", meta: "", icon: "grid_view", hoverable: false, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null, columns: 3, items: [{ id: "grid-1", title: "项目进度", body: "已完成 72%", meta: "今天更新", hoverable: true, actionLabel: "查看" }, { id: "grid-2", title: "待办事项", body: "12 项待处理", meta: "", hoverable: true, actionLabel: "查看" }, { id: "grid-3", title: "团队成员", body: "24 人", meta: "", hoverable: true, actionLabel: "查看" }] },
      "content-grid": { variant: "content-grid", appearance: "bordered", size: "default", title: "服务概览", body: "", meta: "", icon: "grid_on", hoverable: false, selected: false, loading: false, extraActionLabel: "更多", footerActionLabel: null, columns: 4, items: [{ id: "cell-1", title: "计算", body: "运行正常", meta: "", hoverable: true }, { id: "cell-2", title: "存储", body: "容量充足", meta: "", hoverable: false }, { id: "cell-3", title: "网络", body: "连接正常", meta: "", hoverable: true }, { id: "cell-4", title: "安全", body: "无风险", meta: "", hoverable: false }] },
      "nested": { variant: "nested", appearance: "bordered", size: "default", title: "账户信息", body: "", meta: "", icon: "folder", hoverable: false, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null, columns: 2, items: [{ id: "inner-1", title: "基础资料", body: "名称、负责人和联系信息", meta: "", actionLabel: "编辑" }, { id: "inner-2", title: "安全设置", body: "登录验证与访问控制", meta: "", actionLabel: "查看" }] },
      "tabs": { variant: "tabs", appearance: "bordered", size: "default", title: "项目动态", body: "", meta: "", icon: "tab", hoverable: false, selected: false, loading: false, extraActionLabel: "更多", footerActionLabel: null, tabs: [{ id: "tab-1", label: "概览", content: "项目概览内容", disabled: false }, { id: "tab-2", label: "活动", content: "最近活动内容", disabled: false }, { id: "tab-3", label: "设置", content: "项目设置内容", disabled: false }], activeTabId: "tab-1" },
      "actions": { variant: "actions", appearance: "bordered", size: "default", title: "设计提案", body: "本周交付的交互设计提案。", meta: "林七七", icon: "image", hoverable: true, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null, coverImage: "templates/assets/people-lake-hero.png", coverAlt: "湖边人物", avatar: { text: "林", image: null, fallback: "林", label: "林七七" }, actions: [{ id: "like", label: "点赞", icon: "thumb_up" }, { id: "share", label: "分享", icon: "share" }, { id: "more", label: "更多", icon: "more_horiz" }] },
      "interactive": { variant: "interactive", appearance: "bordered", size: "default", title: "项目工作台", body: "进入项目查看任务、成员和最新动态。", meta: "", icon: "dashboard", hoverable: true, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null }
    } },
    "C-35": { d: "multiple", v: {
      "single": { variant: "single", arrow: "filled", style: "basic", items: [{ title: "什么是组件 Renderer？", body: "Renderer 直接创建组件真实 DOM，并加载组件样式和交互。", expanded: true, disabled: false, loading: false }, { title: "为什么使用 API？", body: "API 限制页面只传递可验证的业务参数。", expanded: false, disabled: false, loading: false }] },
      "multiple": { variant: "multiple", arrow: "filled", style: "basic", items: [{ title: "设计规范", body: "组件 anatomy、Token 和合法变体。", expanded: true, disabled: false, loading: false }, { title: "调用参数", body: "Renderer 接受的 props、事件和键盘行为。", expanded: true, disabled: false, loading: false }, { title: "验收要求", body: "样式、交互、焦点和 ARIA 必须逐项通过。", expanded: false, disabled: false, loading: false }] },
      "bordered": { variant: "bordered", arrow: "linear", style: "basic", items: [{ title: "基础信息", body: "这里展示基础信息内容。", expanded: true, disabled: false, loading: false }, { title: "高级设置", body: "这里展示高级配置内容。", expanded: false, disabled: false, loading: false }] },
      "ghost": { variant: "ghost", arrow: "linear", style: "basic", items: [{ title: "无边框折叠项", body: "用于轻量分组内容。", expanded: true, disabled: false, loading: false }, { title: "更多内容", body: "第二段折叠内容。", expanded: false, disabled: false, loading: false }] }
    } },
    "C-36": {
      "d": "no-data",
      "v": {
        "no-result": {
          "variant": "no-result",
          "size": "standard",
          "surface": "white",
          "title": false,
          "description": "搜索结果为空",
          "primary": "",
          "secondary": ""
        },
        "permission": {
          "variant": "permission",
          "size": "standard",
          "surface": "white",
          "title": false,
          "description": "暂无权限",
          "primary": "",
          "secondary": ""
        },
        "no-data": {
          "variant": "no-data",
          "size": "standard",
          "surface": "white",
          "title": false,
          "description": "暂无数据",
          "primary": "",
          "secondary": ""
        },
        "deleted": {
          "variant": "deleted",
          "size": "standard",
          "surface": "white",
          "title": false,
          "description": "文件已被作废/删除",
          "primary": "",
          "secondary": ""
        },
        "not-found": {
          "variant": "not-found",
          "size": "standard",
          "surface": "white",
          "title": false,
          "description": "404 NOT FOUND",
          "primary": "",
          "secondary": ""
        }
      }
    },
    "C-37": { d: "gallery", v: {
      "single": { current: 1, state: "default" },
      "gallery": { current: 2, state: "default" },
      "inline": { current: 1, state: "default" }
    } },
    "C-38": { d: "default", v: {
      "default": { variant: "default", icon: "", size: 36, label: "Image unavailable" },
      "failure": { variant: "failure", icon: "", size: 36, label: "Resource failed to load" },
      "custom": { variant: "custom", icon: "person", size: 36, label: "Custom resource placeholder" }
    } },
    "C-39": { d: "confirmation", v: {
      "information": { variant: "information", size: "small", open: true, position: "top", title: "项目说明", content: "当前项目包含 24 个成员和 18 个进行中的任务。", icon: "info", triggerLabel: "查看说明", confirmText: "Confirm", cancelText: "Cancel" },
      "interactive": { variant: "interactive", size: "large", open: true, position: "right", title: "快速设置", content: "选择一个常用操作继续。", icon: "", triggerLabel: "打开设置", confirmText: "保存", cancelText: "取消" },
      "confirmation": { variant: "confirmation", size: "small", open: true, position: "top", title: "确认删除项目？", content: "删除后项目数据将无法恢复。", icon: "warning", triggerLabel: "删除项目", confirmText: "删除", cancelText: "取消" }
    } },
    "C-40": { d: "default", v: {
      "default": {},
      "traditional": {},
      "tree": {},
      "grouped": {},
      "nested": {}
    } },
    "C-41": { d: "line", v: {
      "line": { size: "medium", items: [{ id: "tab-1", label: "Tab 1", content: "Content of Tab 1" }, { id: "tab-2", label: "Tab 2", content: "Content of Tab 2" }, { id: "tab-3", label: "Tab 3", content: "Content of Tab 3" }, { id: "tab-4", label: "Tab 4", content: "Content of Tab 4" }, { id: "tab-5", label: "Tab 5", content: "Content of Tab 5" }, { id: "tab-6", label: "Tab 6", content: "Content of Tab 6" }], activeId: "tab-1" },
      "capsule": { size: "medium", items: [{ id: "tab-1", label: "Tab 1", content: "Content of Tab 1" }, { id: "tab-2", label: "Tab 2", content: "Content of Tab 2" }, { id: "tab-3", label: "Tab 3", content: "Content of Tab 3" }, { id: "tab-4", label: "Tab 4", content: "Content of Tab 4" }, { id: "tab-5", label: "Tab 5", content: "Content of Tab 5" }, { id: "tab-6", label: "Tab 6", content: "Content of Tab 6" }], activeId: "tab-1" },
      "card": { size: "medium", items: [{ id: "tab-1", label: "Tab 1", content: "Content of Tab 1" }, { id: "tab-2", label: "Tab 2", content: "Content of Tab 2" }, { id: "tab-3", label: "Tab 3", content: "Content of Tab 3" }, { id: "tab-4", label: "Tab 4", content: "Content of Tab 4" }, { id: "tab-5", label: "Tab 5", content: "Content of Tab 5" }, { id: "tab-6", label: "Tab 6", content: "Content of Tab 6" }], activeId: "tab-1" }
    } },
    "C-42": { d: "status", v: {
      "status": { type: "status", size: "medium", text: "进行中", color: "blue", icon: "progress_activity" },
      "category": { type: "property", size: "medium", text: "设计系统", color: "purple", bordered: true },
      "filter": { type: "option", size: "medium", text: "仅看进行中", color: "blue", checkable: true, checked: true },
      "closable": { type: "option", size: "medium", text: "Design", color: "blue", closable: true },
      "checkable": { type: "option", size: "medium", text: "已选择", color: "blue", checkable: true, checked: true },
      "loading": { type: "option", size: "medium", text: "处理中", color: "blue", loading: true },
      "bordered": { type: "property", size: "medium", text: "有边框标签", color: "neutral", bordered: true }
    } },
    "C-43": { d: "vertical", v: {
      "vertical": { spacing: "standard", collapsible: false, items: [{ title: "提交申请", state: "done", person: "Maya", time: "2026-07-13 09:30", description: "申请已提交" }, { title: "主管审批", state: "current", person: "Linda", tag: "进行中", time: "2026-07-13 10:20", description: "等待主管审批" }, { title: "财务复核", state: "waiting", time: "2026-07-14", description: "尚未开始" }, { title: "流程完成", state: "default", time: false, description: "完成后自动通知申请人" }] },
      "horizontal": { spacing: "standard", collapsible: false, items: [{ title: "提交", state: "done" }, { title: "审批", state: "current" }, { title: "完成", state: "waiting" }] },
      "alternate": { spacing: "spacious", collapsible: false, items: [{ title: "创建项目", state: "done", person: "Maya", time: "2026-07-10", description: "项目创建完成" }, { title: "邀请成员", state: "success", avatars: ["L", "J", "W"], avatarOverflow: 5, time: "2026-07-11", description: "成员已加入" }, { title: "配置权限", state: "warning", person: "Linda", tag: "待处理", time: "2026-07-12", description: "部分权限需要确认" }, { title: "发布项目", state: "waiting", time: "2026-07-15", description: "等待发布" }] },
      "breakpoint": { spacing: "standard", collapsible: false, items: [{ title: "项目启动", state: "done", dot: true }, { title: "关键节点", state: "current", dot: true }, { title: "项目完成", state: "waiting", dot: true }] }
    } },
    "C-44": { d: "top", v: {
      "top": { position: "top", text: "顶部提示", triggerText: "悬停查看顶部提示", multiline: false, max: false },
      "right": { position: "right", text: "右侧提示", triggerText: "悬停查看右侧提示", multiline: false, max: false },
      "bottom": { position: "bottom", text: "底部提示", triggerText: "悬停查看底部提示", multiline: false, max: false },
      "left": { position: "left", text: "左侧提示", triggerText: "悬停查看左侧提示", multiline: false, max: false },
      "multiline": { position: "top", multiline: true, max: false, text: "这是一段可换行的 Tooltip 内容，用于解释当前操作的作用和限制。", triggerText: "查看完整说明" }
    } },
    "C-45": { d: "confirmation", v: {
      "confirmation": { title: "确认提交？", body: "提交后当前配置将立即生效。", size: "small", confirmLabel: "确认提交", cancelLabel: "取消" },
      "notification": { title: "提示", body: "当前设置已保存。", size: "small", closable: false, confirmLabel: "知道了", cancelLabel: null },
      "success": { title: "操作成功", body: "结果已保存。", size: "small", closable: false, confirmLabel: "知道了", cancelLabel: null },
      "warning": { title: "发送通知？", body: "请选择继续方式。", size: "small", closable: false, confirmLabel: "发送", cancelLabel: "不删除", alternativeLabel: "不发送" },
      "error": { title: "操作失败", body: "请检查信息后重试。", size: "small", closable: false, confirmLabel: "知道了", cancelLabel: null },
      "destructive": { title: "删除项目？", body: "删除后所有任务、文件和成员记录将无法恢复。", size: "small", closable: false, confirmLabel: "删除", cancelLabel: "取消" },
      "form": { title: "新建项目", description: "填写项目基础信息", body: "", size: "medium", confirmLabel: "创建", cancelLabel: "取消", fields: [{ label: "项目名称", value: "", placeholder: "请输入项目名称" }, { label: "项目负责人", value: "", placeholder: "请输入负责人" }] },
      "task": { title: "选择需要处理的文件", description: "已选择的文件将进入批量处理队列", body: "", size: "medium", scrollable: true, confirmLabel: "开始处理", cancelLabel: "取消", items: [{ label: "组件源码.zip", checked: true }, { label: "验收证据.json", checked: false }, { label: "视觉截图.png", checked: false }] },
      "choice": { title: "选择选项", body: "请选择一个处理方式。", size: "small", choices: ["选项一", "选项二", "选项三"], selectedChoice: 0, confirmLabel: "确认", cancelLabel: "取消" },
      "settings": { title: "任务设置", body: "谁可以评论当前文档", size: "medium", tabs: ["评论设置", "分享设置", "安全设置"], activeTab: 0, choices: ["可阅读用户", "可编辑用户"], selectedChoice: 0, confirmLabel: "保存", cancelLabel: "取消" },
      "preferences": { title: "翻译偏好", body: "翻译显示效果", size: "medium", choices: ["仅译文", "原文和译文"], selectedChoice: 0, permissions: ["获得链接的企业用户", "仅协作者", "仅自己"], selectedPermission: "获得链接的企业用户", switches: [{ label: "句首自动大写", description: "翻译后自动大写首字母", checked: true, disabled: false, loading: false }, { label: "语法纠错", description: "自动修正常见语法问题", checked: false, disabled: false, loading: false }], confirmLabel: "保存", cancelLabel: "取消" },
      "subscription": { title: "订阅日历", body: "搜索并选择需要订阅的日历。", size: "medium", searchPlaceholder: "搜索日历", subscriptions: [{ label: "设计团队日历", detail: "产品设计团队", initial: "D", subscribed: false, actionLabel: "订阅", subscribedLabel: "已订阅" }, { label: "市场活动", detail: "品牌中心", initial: "M", subscribed: true, actionLabel: "订阅", subscribedLabel: "已订阅" }, { label: "产品发布计划", detail: "产品团队", initial: "P", subscribed: false, actionLabel: "订阅", subscribedLabel: "已订阅" }], confirmLabel: "完成", cancelLabel: null }
    } },
    "C-46": { d: "overlay", v: {
      "overlay": { size: "medium", modal: true, title: "项目详情", body: "查看项目进度与协作信息。" },
      "push": { size: "small", modal: false, title: "项目评论", body: "在保留页面上下文的同时查看评论。", actions: false }
    } },
    "C-47": { d: "overlay", v: {
      "spinner": { size: "medium", text: "正在加载数据…", layout: "vertical", avatar: true, image: false, inverse: false, neutral: false },
      "spinner-only": { size: "medium", text: "正在加载数据…", layout: "vertical", avatar: true, image: false, inverse: false, neutral: false },
      "skeleton": { size: "medium", text: "加载中", layout: "profile", avatar: true, image: true, inverse: false, neutral: false },
      "overlay": { size: "medium", text: "正在更新页面内容…", layout: "vertical", avatar: true, image: false, inverse: false, neutral: false }
    } },
    "C-48": { d: "information", v: {
      "information": { title: "项目更新完成", text: "已同步 24 个组件及其最新交互规范。", primary: "查看详情", secondary: "稍后处理", closable: true, duration: 0, placement: "top-right" },
      "success": { title: "发布成功", text: "Universe Design System v2.0 已发布。", primary: "查看版本", secondary: "", closable: true, duration: 0, placement: "top-right" },
      "warning": { title: "存在未完成项", text: "还有 3 个组件未完成交互验收。", primary: "立即处理", secondary: "稍后提醒", closable: true, duration: 0, placement: "top-right" },
      "error": { title: "同步失败", text: "无法读取部分组件源码，请检查文件状态。", primary: "重试", secondary: "查看日志", closable: true, duration: 0, placement: "top-right" },
      "without-icon": { title: "系统消息", text: "组件库将在今晚进行维护。", primary: "", secondary: "", closable: true, duration: 0, placement: "top-right" },
      "custom": { title: "自定义通知", text: "", primary: "确认", secondary: "取消", closable: true, duration: 0, placement: "top-right" }
    } },
    "C-49": { d: "warning", v: {
      "information": { title: "信息提示", text: "当前页面使用最新组件规范。", action: "查看规范", closable: true, actionLayout: "inline", alignment: "start", icon: null },
      "success": { title: "保存成功", text: "所有修改已经保存。", action: "查看记录", closable: true, actionLayout: "inline", alignment: "start", icon: null },
      "warning": { title: "需要注意", text: "部分组件仍使用旧版本参数，请尽快迁移。", action: "开始迁移", closable: true, actionLayout: "inline", alignment: "start", icon: null },
      "error": { title: "加载失败", text: "组件资源加载失败，请重试。", action: "重新加载", closable: true, actionLayout: "inline", alignment: "start", icon: null }
    } },
    "C-50": { d: "information", v: {
      "information": { text: "组件参数已更新", action: null, secondAction: null, closable: true, multiline: false, showIcon: true, duration: 4000, placement: "inline" },
      "success": { text: "保存成功", action: null, secondAction: null, closable: true, multiline: false, showIcon: true, duration: 4000, placement: "inline" },
      "warning": { text: "仍有未完成的验收项", action: "查看", secondAction: null, closable: true, multiline: false, showIcon: true, duration: 6000, placement: "inline" },
      "error": { text: "操作失败，请重试", action: "重试", secondAction: null, closable: true, multiline: false, showIcon: true, duration: 6000, placement: "inline" },
      "loading": { text: "正在同步组件源码…", action: null, secondAction: null, closable: false, multiline: false, showIcon: true, duration: 0, placement: "inline" }
    } },
    "C-51": { d: "steps", v: {
      "line": { value: 68, state: "progress", valueLabel: true, valueSide: "left", steps: 5, label: "线性进度" },
      "circle": { value: 75, state: "progress", valueLabel: true, valueSide: "left", steps: 5, label: "圆形进度" },
      "steps": { value: 60, state: "progress", valueLabel: true, valueSide: "left", steps: 5, label: "分段进度" },
      "indeterminate": { value: 40, state: "progress", valueLabel: false, valueSide: "left", steps: 5, label: "不确定进度" }
    } }
  };

  function publicProps(source) {
    var result = {};
    Object.keys(source || {}).forEach(function (name) {
      if (name.charAt(0) !== "_") result[name] = source[name];
    });
    return result;
  }

  function typeOfValue(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  }

  Object.keys(presets).forEach(function (id) {
    var entry = presets[id];
    entry.defaultVariant = entry.d;
    entry.variants = entry.v;
    delete entry.d;
    delete entry.v;
    /* C-12 has a required caller-owned items tree. Its specimen presets are
     * not public defaults and must not mutate describe().api.props. */
    if (id === "C-12") return;
    var schema = components.apiSchemas[id];
    if (!schema) return;
    schema.props.variant = {
      type: "enum",
      values: Object.keys(entry.variants),
      required: false,
      default: entry.defaultVariant
    };
    var defaultProps = publicProps(entry.variants[entry.defaultVariant]);
    var propValues = {};
    Object.keys(entry.variants).forEach(function (variant) {
      Object.keys(publicProps(entry.variants[variant])).forEach(function (name) {
        propValues[name] = propValues[name] || [];
        propValues[name].push(entry.variants[variant][name]);
      });
    });
    Object.keys(propValues).forEach(function (name) {
      var types = Array.from(new Set(propValues[name].map(typeOfValue)));
      var prop = schema.props[name] || { required: false };
      if (!prop.type || prop.type === "string|number|boolean|array|object|null") prop.type = types.join("|");
      if (Object.prototype.hasOwnProperty.call(defaultProps, name)) prop.default = defaultProps[name];
      schema.props[name] = prop;
    });
    schema.props.variant.presets = Object.keys(entry.variants).reduce(function (result, name) {
      result[name] = publicProps(entry.variants[name]);
      return result;
    }, {});
  });

  components.rendererPresets = presets;
})(window);
