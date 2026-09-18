(function registerFinalEightApiDocs(global) {
  "use strict";
  var D = global.B2BDesignSource;
  var docsApi = D.componentApiDocs;
  var revisions = Object.create(null);
  var targetIds = ["C-12", "C-18", "C-19", "C-32", "C-41", "C-45", "C-47", "C-51"];
  function options(values) { return values.map(function (value) { return { value: value, label: value }; }); }
  function category(name, description) { return { name: name, description: description }; }
  function variants(values, categoryName) { return values.map(function (value) { return { key: value, label: value, category: categoryName }; }); }
  function scenario(config, selection, props, description, interaction) {
    var item = config.variants.find(function (candidate) { return candidate.key === selection.variant; });
    return { category: item.category, label: item.label, description: description, interaction: interaction, props: Object.assign({ variant: selection.variant }, props), parameterKeys: Object.keys(Object.assign({ variant: selection.variant }, props)) };
  }
  function base(id, title, introduction, variantValues, categoryName) {
    return { id: id, title: title, introduction: introduction, categories: [category(categoryName, introduction), category("状态与行为", "通过正式 props 切换状态、尺寸和交互策略。")], variants: variants(variantValues, categoryName), variantCoverage: variantValues, controlsEyebrow: "全部合法变体与真实交互", controlsHeading: "按维度切换正式 Renderer", slotSelector: "#component-slot" };
  }
  var c12 = base("C-12", "Navigation Menu 导航菜单", "结构、展开状态与操作区内容保持正交：顶部默认使用 Full 完整操作区；窄宽度时导航项按真实宽度进入 More，完整操作区进入更多操作菜单。", ["top-horizontal-web", "side-web-expanded", "side-web-collapsed", "side-desktop", "side-desktop-tree", "no-background"], "导航结构");
  var c12Labels = {
    "top-horizontal-web": "Top Horizontal 顶部横向",
    "side-web-expanded": "Side Expanded 侧边展开",
    "side-web-collapsed": "Side Collapsed 侧边收起",
    "side-desktop": "Desktop Side 桌面侧边",
    "side-desktop-tree": "Desktop Tree 桌面树形",
    "no-background": "No Background 无背景"
  };
  c12.variants.forEach(function (item) { item.label = c12Labels[item.key]; });
  c12.controlGroups = [
    { key: "variant", label: "结构", options: c12.variantCoverage.map(function (value) { return { value: value, label: c12Labels[value] }; }) },
    { key: "mode", label: "状态", options: [{ value: "default", label: "Default 默认" }, { value: "expanded", label: "Expanded 展开" }] },
    { key: "actionArea", label: "操作区", note: "仅顶部呈现；切换到侧栏时保留选择，返回顶部后仍恢复原操作区。", options: [{ value: "compact", label: "Compact 精简" }, { value: "full", label: "Full 完整" }] }
  ];
  c12.initialSelection = { variant: "top-horizontal-web", mode: "expanded", actionArea: "full" };
  c12.events = ["b2b:navigation-change", "b2b:navigation-expand", "b2b:navigation-collapse", "b2b:navigation-resize", "b2b:navigation-more-open", "b2b:navigation-action"];
  c12.resolveSelection = function (selection) {
    var side = selection.variant !== "top-horizontal-web";
    var topLabels = ["概览", "项目", "成员", "报表", "自动化", "设置", "帮助", "管理后台"];
    if (!side && selection.mode === "expanded") topLabels = topLabels.concat(["资产中心", "数据治理", "开放平台", "审计日志", "系统监控", "服务配置", "权限中心", "开发工具"]);
    var items = side ? [{ id: "overview", label: "概览", icon: "dashboard" }, { id: "projects", label: "项目", icon: "folder", children: [{ id: "active", label: "进行中项目", children: [{ id: "alpha", label: "Alpha 计划" }, { id: "beta", label: "Beta 计划" }] }, { id: "archive", label: "归档项目", actionItems: [{ id: "restore-archive", label: "恢复项目", icon: "restore" }] }] }, { id: "members", label: "成员", icon: "group" }, { id: "reports", label: "报表", icon: "bar_chart", actionItems: [{ id: "open", label: "打开报表", icon: "open_in_new" }, { id: "share", label: "分享", icon: "share", children: [{ id: "team", label: "团队", icon: "groups" }, { id: "link", label: "复制链接", icon: "link" }] }, { id: "delete", label: "删除", icon: "delete", danger: true }] }, { id: "automation", label: "自动化", icon: "bolt" }, { id: "assets", label: "资产中心", icon: "inventory_2" }, { id: "data", label: "数据治理", icon: "database" }, { id: "audit", label: "审计日志", icon: "fact_check" }, { id: "monitor", label: "系统监控", icon: "monitoring" }, { id: "permissions", label: "权限中心", icon: "admin_panel_settings" }, { id: "developers", label: "开发工具", icon: "terminal" }, { id: "settings", label: "设置", icon: "settings" }] : topLabels.map(function (label, index) { return { id: "top-" + index, label: label, icon: ["dashboard", "folder", "group", "bar_chart", "bolt", "settings", "help", "admin_panel_settings"][index % 8] }; });
    var props = { items: items, activeId: side ? "overview" : "top-0", expandedIds: selection.mode === "expanded" && side ? ["projects"] : [], brand: { label: "项目中心", icon: "deployed_code" }, ariaLabel: "业务导航" };
    if (selection.variant === "top-horizontal-web") {
      var compactActions = [{ id: "create", kind: "button", label: "新建", icon: "add" }, { id: "account", kind: "avatar", label: "账户", text: "林", fallback: "林" }];
      var fullActions = [{ id: "preview", kind: "icon-button", label: "预览", icon: "visibility" }, { id: "download", kind: "icon-button", label: "下载", icon: "download" }, { id: "delete", kind: "icon-button", label: "删除", icon: "delete" }, { id: "create", kind: "button", label: "新建", icon: "add" }, { id: "account", kind: "avatar", label: "账户", text: "林", fallback: "林" }];
      Object.assign(props, { actions: selection.actionArea === "full" ? fullActions : compactActions, moreOpen: false });
    }
    if (["side-desktop", "side-desktop-tree", "no-background"].indexOf(selection.variant) >= 0) props.width = 280;
    return scenario(c12, selection, props, "caller-owned 导航数据；宽度测量、层级、焦点和更多菜单由 Renderer 管理。", "点击、方向键与 Escape 验证公开导航事件恰好一次。窄屏查看顶部溢出。 ");
  };

  var c18Types = [
    "basic-column", "grouped-column", "stacked-column", "percent-stacked-column",
    "basic-bar", "grouped-bar", "stacked-bar",
    "rose", "pie", "donut", "nested-donut",
    "basic-line", "smooth-line", "step-line",
    "basic-area", "smooth-area", "step-area", "stacked-area", "percent-stacked-area",
    "radar", "sankey", "basic-funnel", "conversion-funnel",
    "liquid", "scatter", "histogram", "heatmap", "word-cloud", "column-line-combo", "metric"
  ];
  var c18Labels = {
    "basic-column":"基础柱状图", "grouped-column":"分组柱状图", "stacked-column":"堆叠柱状图", "percent-stacked-column":"百分比堆叠柱状图",
    "basic-bar":"基础条形图", "grouped-bar":"分组条形图", "stacked-bar":"堆叠条形图",
    rose:"玫瑰图", pie:"饼图", donut:"环图", "nested-donut":"嵌套饼环图",
    "basic-line":"基础折线图", "smooth-line":"平滑折线图", "step-line":"阶梯图",
    "basic-area":"基础面积图", "smooth-area":"平滑面积图", "step-area":"阶梯面积图", "stacked-area":"堆叠面积图", "percent-stacked-area":"百分比堆叠面积图",
    radar:"雷达图", sankey:"桑基图", "basic-funnel":"基础漏斗图", "conversion-funnel":"转化漏斗图",
    metric:"指标图", liquid:"水波图", scatter:"散点图", histogram:"直方图", heatmap:"色块／热力图", "word-cloud":"词云", "column-line-combo":"折柱组合图"
  };
  var c18Groups = {
    "basic-column":"比较与排名", "grouped-column":"比较与排名", "stacked-column":"比较与排名", "basic-bar":"比较与排名", "grouped-bar":"比较与排名", "stacked-bar":"比较与排名", radar:"比较与排名", "column-line-combo":"比较与排名",
    "basic-line":"趋势", "smooth-line":"趋势", "step-line":"趋势", "basic-area":"趋势", "smooth-area":"趋势", "step-area":"趋势", "stacked-area":"趋势",
    "basic-funnel":"流程", "conversion-funnel":"流程", sankey:"关系与流程",
    rose:"占比", pie:"占比", donut:"占比", "nested-donut":"占比", "percent-stacked-column":"占比", "percent-stacked-area":"占比", liquid:"占比",
    metric:"总览", scatter:"分布", histogram:"分布", heatmap:"分布", "word-cloud":"分布"
  };
  function c18SingleData() { return [{ label:"设计", value:42, series:"数量" }, { label:"研发", value:68, series:"数量" }, { label:"产品", value:55, series:"数量" }, { label:"运营", value:31, series:"数量" }, { label:"销售", value:74, series:"数量" }, { label:"客服", value:47, series:"数量" }]; }
  function c18MultiData() { return [{label:"一月",value:42,series:"计划"},{label:"一月",value:28,series:"实际"},{label:"二月",value:68,series:"计划"},{label:"二月",value:52,series:"实际"},{label:"三月",value:55,series:"计划"},{label:"三月",value:71,series:"实际"},{label:"四月",value:76,series:"计划"},{label:"四月",value:63,series:"实际"},{label:"五月",value:61,series:"计划"},{label:"五月",value:79,series:"实际"},{label:"六月",value:84,series:"计划"},{label:"六月",value:73,series:"实际"}]; }
  function c18NestedData() { return [{label:"0–9",value:18,series:"0–29"},{label:"10–19",value:12,series:"0–29"},{label:"20–29",value:14,series:"0–29"},{label:"30–39",value:10,series:"20–49"},{label:"40–49",value:12,series:"20–49"},{label:"50–59",value:14,series:"50岁及以上"},{label:"60–69",value:10,series:"50岁及以上"},{label:"70岁及以上",value:10,series:"50岁及以上"}]; }
  function c18BasicFunnelData() { return [{label:"入口访问",value:100},{label:"产品浏览",value:84},{label:"方案试用",value:66},{label:"留下线索",value:49},{label:"商务沟通",value:31},{label:"签约交付",value:18}]; }
  function c18ConversionFunnelData() { return [{label:"消息送达",value:5676},{label:"内容查看",value:3872},{label:"详情点击",value:1668},{label:"加入购物车",value:610},{label:"提交订单",value:584},{label:"支付完成",value:565}]; }
  function c18HeatmapData() {
    var columns = ["分类一", "分类二", "分类三", "分类四", "分类五", "分类六", "分类七", "分类八"];
    var rows = ["业务一", "业务二", "业务三", "业务四", "业务五"];
    var values = [[3,7,4,1,6,1,5,0],[2,1,2,1,1,7,3,1],[1,2,10,1,3,2,1,6],[6,3,1,8,0,9,7,1],[5,1,7,1,2,3,1,3]];
    return rows.reduce(function (items, yLabel, rowIndex) {
      return items.concat(columns.map(function (xLabel, columnIndex) { return { xLabel: xLabel, yLabel: yLabel, value: values[rowIndex][columnIndex] }; }));
    }, []);
  }
  function c18WordCloudData() {
    return [
      {label:"数据可视化",value:100}, {label:"用户体验",value:92}, {label:"设计系统",value:86},
      {label:"组件规范",value:80}, {label:"智能生成",value:76}, {label:"交互分析",value:72},
      {label:"业务指标",value:68}, {label:"研发协作",value:64}, {label:"运营增长",value:60},
      {label:"客户洞察",value:56}, {label:"流程优化",value:52}, {label:"质量保障",value:48},
      {label:"数据资产",value:44}, {label:"自动化",value:40}, {label:"可访问性",value:36},
      {label:"响应式",value:32}, {label:"实时监控",value:28}, {label:"转化率",value:24}
    ];
  }
  function c18DataFor(type) {
    if (type === "sankey") return [{source:"搜索广告",target:"产品页",value:58},{source:"自然搜索",target:"产品页",value:42},{source:"行业活动",target:"解决方案",value:36},{source:"客户推荐",target:"解决方案",value:24},{source:"产品页",target:"试用申请",value:64},{source:"产品页",target:"资料下载",value:36},{source:"解决方案",target:"试用申请",value:38},{source:"解决方案",target:"商务咨询",value:22}];
    if (type === "scatter") return [{label:"样本 A",x:12,y:28,size:3,value:28,series:"实验组"},{label:"样本 B",x:22,y:46,size:5,value:46,series:"实验组"},{label:"样本 C",x:36,y:61,size:4,value:61,series:"实验组"},{label:"样本 D",x:48,y:54,size:6,value:54,series:"实验组"},{label:"样本 E",x:18,y:35,size:4,value:35,series:"对照组"},{label:"样本 F",x:31,y:40,size:3,value:40,series:"对照组"},{label:"样本 G",x:44,y:38,size:5,value:38,series:"对照组"},{label:"样本 H",x:57,y:49,size:4,value:49,series:"对照组"}];
    if (type === "histogram") return [{label:"0–9",value:6,series:"频数"},{label:"10–19",value:13,series:"频数"},{label:"20–29",value:21,series:"频数"},{label:"30–39",value:28,series:"频数"},{label:"40–49",value:23,series:"频数"},{label:"50–59",value:16,series:"频数"},{label:"60–69",value:9,series:"频数"},{label:"70–79",value:4,series:"频数"}];
    if (type === "metric") return [{label:"新增投递",value:1230},{label:"Offer 发放",value:123},{label:"接受 Offer",value:98},{label:"入职人数",value:76}];
    if (type === "heatmap") return c18HeatmapData();
    /* VChart's combination/single-region template uses two bar groups and one
     * line over a complete week. Keep that native data shape in the formal
     * documentation instead of a shortened synthetic four-point example. */
    if (type === "column-line-combo") return [
      {label:"周一",value:15,series:"早餐",mark:"bar"},{label:"周一",value:25,series:"午餐",mark:"bar"},
      {label:"周二",value:12,series:"早餐",mark:"bar"},{label:"周二",value:30,series:"午餐",mark:"bar"},
      {label:"周三",value:15,series:"早餐",mark:"bar"},{label:"周三",value:24,series:"午餐",mark:"bar"},
      {label:"周四",value:10,series:"早餐",mark:"bar"},{label:"周四",value:25,series:"午餐",mark:"bar"},
      {label:"周五",value:13,series:"早餐",mark:"bar"},{label:"周五",value:20,series:"午餐",mark:"bar"},
      {label:"周六",value:10,series:"早餐",mark:"bar"},{label:"周六",value:22,series:"午餐",mark:"bar"},
      {label:"周日",value:12,series:"早餐",mark:"bar"},{label:"周日",value:19,series:"午餐",mark:"bar"},
      {label:"周一",value:22,series:"饮料",mark:"line"},{label:"周二",value:43,series:"饮料",mark:"line"},
      {label:"周三",value:33,series:"饮料",mark:"line"},{label:"周四",value:22,series:"饮料",mark:"line"},
      {label:"周五",value:10,series:"饮料",mark:"line"},{label:"周六",value:30,series:"饮料",mark:"line"},
      {label:"周日",value:50,series:"饮料",mark:"line"}
    ];
    if (type === "radar") return [{label:"易用性",value:82,series:"方案 A"},{label:"性能",value:74,series:"方案 A"},{label:"稳定性",value:91,series:"方案 A"},{label:"成本",value:68,series:"方案 A"},{label:"交付效率",value:78,series:"方案 A"},{label:"扩展性",value:85,series:"方案 A"},{label:"易用性",value:64,series:"方案 B"},{label:"性能",value:88,series:"方案 B"},{label:"稳定性",value:70,series:"方案 B"},{label:"成本",value:86,series:"方案 B"},{label:"交付效率",value:72,series:"方案 B"},{label:"扩展性",value:76,series:"方案 B"}];
    if (type === "liquid") return [{label:"完成率",value:68}];
    if (type === "nested-donut") return c18NestedData();
    if (type === "basic-funnel") return c18BasicFunnelData();
    if (type === "conversion-funnel") return c18ConversionFunnelData();
    if (type === "word-cloud") return c18WordCloudData();
    if (["grouped-column","stacked-column","percent-stacked-column","grouped-bar","stacked-bar","basic-line","smooth-line","step-line","basic-area","smooth-area","step-area","stacked-area","percent-stacked-area"].indexOf(type)>=0) return c18MultiData();
    return c18SingleData();
  }
  var c18 = base("C-18", "Data Visualization 数据可视化", "30 种图形覆盖业务数据分析，支持热力分布与标题、数字组成的指标总览。", c18Types, "图表类型");
  c18.categories = [
    category("总览", "用标题与数字快速查看关键指标。"),
    category("比较与排名", "用长度、位置与多维轮廓比较值，长标签优先条形图。"),
    category("趋势", "用连续位置展示时间或有序分类变化。"),
    category("流程", "呈现有顺序阶段的转化。"),
    category("占比", "表达分量与总量的关系。"),
    category("分布", "查看数据频率、密度与组合分布。"),
    category("关系与流程", "展示节点之间的数据流向。"),
    category("状态与行为", "状态、图例、工具栏、框架与色板由正式 props 控制。")
  ];
  c18.variants.forEach(function(item){ item.label=c18Labels[item.key]; item.category=c18Groups[item.key]||"流程"; });
  c18.controlGroups = [
    {key:"variant",label:"图表类型",options:c18Types.map(function(value){return {value:value,label:c18Labels[value]};})},
    {key:"state",label:"状态",options:options(["default","selected","loading","empty","error","partial-data","disabled"])},
    {key:"legend",label:"图例",options:options(["auto","show","hide"])},
    {key:"legendPosition",label:"图例位置",options:options(["bottom","top","right"])},
    {key:"axisTitles",label:"轴标题",note:"仅有 X/Y 轴的图表可用。",options:options(["show","hide"])},
    {key:"toolbar",label:"标准工具栏",options:options(["standard","hidden"])},
    {key:"frame",label:"图形框架",options:options(["show","hide"])},
    {key:"labels",label:"圆形标签",note:"仅玫瑰、饼、环和嵌套饼环可用。",options:options(["show","hide"])},
    {key:"total",label:"总和",note:"仅环图可用。",options:options(["show","hide"])},
    {key:"metricChart",label:"指标趋势图",visibleWhen:function(s){return s.variant==="metric";},options:[{value:"none",label:"无图"},{value:"area",label:"面积图"}]},
    {key:"metricLayout",label:"指标排布",visibleWhen:function(s){return s.variant==="metric";},options:[{value:"overview",label:"总览"},{value:"cards",label:"独立卡片"},{value:"compact",label:"紧凑分栏"}]},
    {key:"metricTone",label:"变化含义",visibleWhen:function(s){return s.variant==="metric";},note:"变化方向与好坏独立设置。",options:[{value:"mixed",label:"混合示例"},{value:"positive",label:"有利（绿）"},{value:"negative",label:"不利（红）"},{value:"neutral",label:"中性"}]},
    {key:"metricIcon",label:"指标图标",visibleWhen:function(s){return s.variant==="metric";},options:[{value:"show",label:"显示"},{value:"hide",label:"隐藏"}]},
    {key:"metricTrend",label:"指标趋势",visibleWhen:function(s){return s.variant==="metric";},options:[{value:"mixed",label:"混合示例"},{value:"none",label:"无趋势"},{value:"up",label:"上升"},{value:"down",label:"下降"},{value:"flat",label:"持平"}]},
    {key:"metricChange",label:"变化值",visibleWhen:function(s){return s.variant==="metric";},options:[{value:"show",label:"显示"},{value:"hide",label:"隐藏"}]},
    {key:"metricDescription",label:"指标说明",visibleWhen:function(s){return s.variant==="metric";},options:[{value:"show",label:"显示"},{value:"hide",label:"隐藏"}]},
    {key:"heatmapPalette",label:"热力色阶",visibleWhen:function(s){return s.variant==="heatmap";},options:[{value:"blue",label:"蓝色"},{value:"orange",label:"橙色"}]},
    {key:"palette",label:"配色",visibleWhen:function(s){return s.variant!=="heatmap"&&s.variant!=="metric";},note:"亮色系保持整套图表的鲜明主题；同色阶用于强调数值深浅。切换图表类型时保留当前配色。",options:[{value:"categorical",label:"亮色系"},{value:"sequential",label:"同色阶"}]}
  ];
  c18.initialSelection = {variant:"grouped-column",state:"default",legend:"show",legendPosition:"bottom",axisTitles:"show",toolbar:"standard",frame:"show",labels:"hide",total:"hide",metricChart:"area",metricLayout:"cards",metricTone:"mixed",metricIcon:"show",metricTrend:"mixed",metricChange:"show",metricDescription:"show",heatmapPalette:"blue",palette:"categorical"};
  c18.events = ["b2b:visualization-mark-select","b2b:visualization-legend-toggle","b2b:visualization-toolbar-action"];
  c18.normalizeSelection = function(selection){ var axis=["basic-column","grouped-column","stacked-column","percent-stacked-column","basic-bar","grouped-bar","stacked-bar","basic-line","smooth-line","step-line","basic-area","smooth-area","step-area","stacked-area","percent-stacked-area","scatter","histogram","heatmap","column-line-combo"].indexOf(selection.variant)>=0, circular=["rose","pie","donut","nested-donut"].indexOf(selection.variant)>=0, total=selection.variant==="donut"; if(selection.variant==="metric")selection.legend="hide"; if(!axis)selection.axisTitles="hide"; if(!circular)selection.labels="hide"; if(!total)selection.total="hide"; return selection; };
  c18.isSelectionAllowed = function(selection){ if(selection.variant==="metric"&&selection.legend==="show")return false; if(selection.axisTitles==="show"&&["basic-column","grouped-column","stacked-column","percent-stacked-column","basic-bar","grouped-bar","stacked-bar","basic-line","smooth-line","step-line","basic-area","smooth-area","step-area","stacked-area","percent-stacked-area","scatter","histogram","heatmap","column-line-combo"].indexOf(selection.variant)<0)return false; if(selection.labels==="show"&&["rose","pie","donut","nested-donut"].indexOf(selection.variant)<0)return false; if(selection.total==="show"&&selection.variant!=="donut")return false; return true; };
  c18.invalidSelectionReason = function(selection){ if(selection.variant==="metric"&&selection.legend==="show")return "指标图不使用图例"; if(selection.axisTitles==="show")return "轴标题只属于有 X/Y 轴的图表"; if(selection.total==="show")return "总和只属于环图"; if(selection.labels==="show")return "外部标签只属于圆形图"; return "该组合不可用"; };
  c18.resolveSelection = function(selection){
    var axis=["basic-column","grouped-column","stacked-column","percent-stacked-column","basic-bar","grouped-bar","stacked-bar","basic-line","smooth-line","step-line","basic-area","smooth-area","step-area","stacked-area","percent-stacked-area","scatter","histogram","heatmap","column-line-combo"].indexOf(selection.variant)>=0;
    var props={title:selection.variant==="metric"?"总览":"项目交付数据",description:"",data:c18DataFor(selection.variant),state:selection.state,xAxisTitle:axis?"周期":"",yAxisTitle:axis?"数值":"",axisTitles:axis?selection.axisTitles:"hide",legend:selection.legend,legendPosition:selection.legendPosition,toolbar:selection.toolbar,showFrame:selection.frame==="show",showLabels:selection.labels==="show",showTotal:selection.total==="show",totalLabel:"总计",unit:"",metricChart:selection.variant==="metric"?selection.metricChart:"none",metricLayout:selection.variant==="metric"?selection.metricLayout:"overview",heatmapPalette:selection.variant==="heatmap"?selection.heatmapPalette:"blue",palette:selection.palette};
    if (selection.variant === "metric") props.data = props.data.map(function(item, index) {
      return Object.assign({}, item, {
        history: [[760,820,790,940,1080,1150,1230],[90,95,104,112,120,118,123],[110,118,108,113,105,101,98],[64,70,73,71,75,76,76]][index].map(function(value, pointIndex){return {label:"第 " + (pointIndex + 1) + " 周",value:value};}),
        icon: selection.metricIcon === "show" ? ["visibility","shopping_bag","group","task_alt"][index] : "",
        trendTone: selection.metricTone === "mixed" ? ["positive","positive","negative","neutral"][index] : selection.metricTone,
        trend: selection.metricTrend === "mixed" ? ["up","up","down","flat"][index] : selection.metricTrend,
        change: selection.metricChange === "show" ? (selection.metricTrend === "none" ? ["12.8%","8.2%","3.6%","0%"][index] : selection.metricTrend === "mixed" ? ["12.8%","8.2%","3.6%","0%"][index] : selection.metricTrend === "up" ? "12.8%" : selection.metricTrend === "down" ? "3.6%" : "0%") : "",
        description: selection.metricDescription === "show" ? ["较上月 1,090 份有效投递","较上月 114 份录用通知","较上月 102 位候选人","与上月入职人数持平"][index] : ""
      });
    });
    return scenario(c18,selection,props,"热力图以颜色深浅表达数值大小；指标图以标题和数字展示关键数据。",selection.variant === "metric" ? "点击或按 Enter/Space 选择指标，方向键移动；标题、数值和说明直接展示，不弹出提示。" : "Hover/触摸或键盘聚焦数据标记查看 Tooltip；Enter/Space 选择，方向键移动；图例与标准工具栏事件恰好一次。");
  };

  var c19 = base("C-19", "Date Picker 日期选择器", "覆盖日期、范围、粒度和日期时间；date-time-range 在单面板内分阶段编辑开始与结束时间。", ["date", "date-range", "week", "month", "quarter", "year", "date-time", "date-time-range"], "选择粒度");
  c19.controlGroups = [{ key: "variant", label: "类型", options: options(c19.variantCoverage) }, { key: "open", label: "面板", options: options(["open", "closed"]) }]; c19.initialSelection = { variant: "date-time-range", open: "open" }; c19.events = ["b2b:date-picker-open", "b2b:date-picker-change", "b2b:date-picker-phase"];
  c19.normalizeSelection = function (selection, changedKey) { if (changedKey === "variant") delete selection.value; return selection; };
  c19.syncSelectionFromEvent = function (name, event, selection) { if (name === "b2b:date-picker-open") selection.open = event.detail.open ? "open" : "closed"; if (name === "b2b:date-picker-change") selection.value = event.detail.value; return selection; };
  c19.resolveSelection = function (selection) { var timed = selection.variant === "date-time" || selection.variant === "date-time-range"; var values = { date: "2026-07-13", "date-range": "2026-07-13 — 2026-07-20", week: "第 29 周", month: "7 月", quarter: "Q3", year: "2026", "date-time": "2026-07-13 14:30:45", "date-time-range": "2026-07-13 09:00:15 — 2026-07-20 18:00:45" }; return scenario(c19, selection, { value: Object.prototype.hasOwnProperty.call(selection, "value") ? selection.value : values[selection.variant], placeholder: "请选择", label: "选择时间", open: selection.open === "open", disabled: false, error: false, clearable: true, showActions: true, timeSeconds: timed }, "日期时间范围只保留一份日历，并用开始/结束页签切换端点的时、分、秒。", "切换阶段，分别选择时分秒并确认；Escape 关闭并恢复触发器焦点。"); };

  var c32 = base("C-32", "Avatar 头像", "图片与 fallback、在线/离线、可见 Tooltip、头像组及 +x 展开均来自已归一 canonical 证据；信息头像保留原有紧凑横向文字结构；右上角徽标组合 C-33 的数量或状态点。", ["image", "text", "icon", "group", "with-status", "with-text", "with-secondary-text", "with-top-badge"], "内容类型");
  var c32TopBadges = {
    "count-red-3": { variant: "character", text: "3", color: "red", appearance: "fill-stroke", label: "3 items need attention" },
    "count-red-38": { variant: "character", text: "38", color: "red", appearance: "fill-stroke", label: "38 items need attention" },
    "ellipsis-red": { variant: "character", text: "…", color: "red", appearance: "fill-stroke", label: "More than 999 items need attention" },
    "count-gray-3": { variant: "character", text: "3", color: "gray", appearance: "fill", label: "3 updates" },
    "count-gray-38": { variant: "character", text: "38", color: "gray", appearance: "fill", label: "38 updates" },
    "ellipsis-gray": { variant: "character", text: "…", color: "gray", appearance: "fill-stroke", label: "More than 999 updates" },
    "status-gray": { variant: "dot", text: "", color: "gray", appearance: "fill-stroke", label: "Updates available" }
  };
  c32.controlGroups = [{ key: "variant", label: "内容", options: options(c32.variantCoverage) }, { key: "size", label: "尺寸", options: options(["24", "32", "40", "48", "64"]) }, { key: "topBadgeType", label: "右上徽标", visibleWhen: function (selection) { return selection.variant === "with-top-badge"; }, options: [{ value: "count-red-3", label: "红色 3" }, { value: "count-red-38", label: "红色 38" }, { value: "ellipsis-red", label: "红色 …" }, { value: "count-gray-3", label: "灰色 3" }, { value: "count-gray-38", label: "灰色 38" }, { value: "ellipsis-gray", label: "灰色 …" }, { value: "status-gray", label: "灰色状态点" }] }]; c32.initialSelection = { variant: "group", size: "32", topBadgeType: "count-red-38" }; c32.events = ["b2b:avatar-fallback", "b2b:avatar-overflow-change"];
  c32.resolveSelection = function (selection) { var image = "templates/assets/people-lake-hero.png"; var isTopBadge = selection.variant === "with-top-badge"; var info = selection.variant === "with-text" ? { text: "JY", fallback: "JY", primaryText: "Jerry Young", secondaryText: "", label: "Jerry Young" } : selection.variant === "with-secondary-text" ? { text: "JY", fallback: "JY", primaryText: "Jerry Young", secondaryText: "Message log", label: "Jerry Young，Message log" } : isTopBadge ? { text: "JY", fallback: "JY", primaryText: "", secondaryText: "", label: "Jerry Young" } : { text: "林", fallback: "林", primaryText: "", secondaryText: "", label: "林七七" }; var props = { text: info.text, image: selection.variant === "image" || isTopBadge ? image : null, fallback: info.fallback, icon: selection.variant === "icon" ? "person" : null, topBadge: isTopBadge ? c32TopBadges[selection.topBadgeType] : null, primaryText: info.primaryText, secondaryText: info.secondaryText, size: Number(selection.size), label: info.label, shape: "round", loading: false, status: "online", items: [], maxVisible: 3, expanded: false }; if (selection.variant === "group") { props.text = ""; props.fallback = "?"; props.label = "成员头像组"; props.items = ["林", "王", "赵", "M", "L"].map(function (text, index) { return { text: text, label: "成员 " + (index + 1) }; }); } return scenario(c32, selection, props, "图片使用本地 canonical 资源；群组成员及 +x 显示黑色 Tooltip；加载失败时回退文本。右上角徽标在头像 45° 对角使用 C-33 字符数量或状态点。", "悬浮或键盘聚焦群组成员查看 Tooltip；点击 +x 展开剩余成员，点击组件外或 Escape 收起并恢复焦点。右上角徽标有独立的语义标签，不会改变头像的焦点或图片 fallback。"); };

  var c41 = base("C-41", "Tabs 标签页", "支持 caller-owned 内容、manual activation、逐项 badge/closable 与 overflow。", ["line", "capsule", "card"], "视觉类型");
  c41.controlGroups = [
    { key: "variant", label: "类型", options: options(c41.variantCoverage) },
    { key: "activation", label: "键盘切换", note: "仅影响方向键操作；鼠标点击均直接切换。", options: [{ value: "automatic", label: "方向键直接切换" }, { value: "manual", label: "Enter / 空格确认" }] },
    { key: "overflow", label: "溢出方式", options: [{ value: "arrows", label: "左右箭头" }, { value: "more", label: "More 菜单" }] },
    { key: "count", label: "标签数量", options: [{ value: "few", label: "少量" }, { value: "many", label: "较多" }] }
  ];
  c41.initialSelection = { variant: "line", activation: "manual", overflow: "arrows", count: "few" };
  c41.isSelectionAllowed = function (selection) { return selection.variant !== "card" || selection.overflow === "arrows"; };
  c41.invalidSelectionReason = function () { return "Card 支持左右箭头，More 菜单仅用于 line / capsule。"; };
  c41.events = ["b2b:tabs-change", "b2b:tab-close", "b2b:tab-add", "b2b:tabs-overflow-change"];
  c41.resolveSelection = function (selection) {
    var card = selection.variant === "card";
    var more = selection.overflow === "more";
    var count = selection.count === "many" ? (more ? 6 : 18) : 4;
    var items = Array.from({ length: count }, function (_, index) { index += 1; return { id: "tab-" + index, label: "标签 " + index, content: "内容 " + index, badge: index === 2 ? "2" : null, closable: card && index > 1 }; });
    return scenario(c41, selection, { size: "medium", items: items, activeId: "tab-1", ariaLabel: "项目视图", activation: selection.activation, addable: card, scrollable: !more, overflowItems: more ? [{ id: "extra-1", label: "更多标签", content: "更多内容", badge: null }] : [] }, "宽度充足时直接展示标签；溢出时使用所选方式，箭头与 More 菜单互斥。", (selection.activation === "automatic" ? "先聚焦标签，再按左右方向键：焦点和内容同步切换。" : "先聚焦标签，再按左右方向键移动焦点；按 Enter 或空格才切换内容。") + "鼠标点击均直接切换；Card 可关闭与新增。");
  };

  var c45 = base("C-45", "Dialog 对话框", "覆盖基础语义、表单、任务、单选、设置、偏好与订阅；C-45 只拥有 Modal shell、生命周期、焦点、ARIA 和组合布局。", ["confirmation", "notification", "success", "warning", "error", "destructive", "form", "task", "choice", "settings", "preferences", "subscription"], "任务类型");
  c45.controlGroups = [
    { key: "variant", label: "类型", options: options(c45.variantCoverage) },
    { key: "size", label: "尺寸", options: options(["small", "medium", "large", "extra-large"]) },
    { key: "open", label: "生命周期", options: options(["closed", "open"]) },
    { key: "placement", label: "位置", options: options(["center", "top"]) },
    { key: "confirmState", label: "确认状态", options: options(["default", "loading", "disabled"]) }
  ];
  c45.initialSelection = { variant: "confirmation", size: "small", open: "closed", placement: "center", confirmState: "default" };
  c45.events = ["b2b:dialog-action", "b2b:dialog-open-change"];
  c45.syncSelectionFromEvent = function (name, event, selection, context) {
    if (name !== "b2b:dialog-open-change" || !event.detail || typeof event.detail.open !== "boolean") return null;
    if (!event.detail.open && context && context.preserveControlledOpen) return selection;
    selection.open = event.detail.open ? "open" : "closed";
    return selection;
  };
  c45.resolveSelection = function (selection) {
    var variant = selection.variant;
    var semantic = {
      confirmation: ["确认提交？", "提交后当前配置将立即生效。", "确认提交", "取消"],
      notification: ["提示", "当前设置已保存。", "知道了", null],
      success: ["操作成功", "结果已保存。", "知道了", null],
      warning: ["发送通知？", "请选择继续方式。", "发送", "不删除"],
      error: ["操作失败", "请检查信息后重试。", "知道了", null],
      destructive: ["删除项目？", "删除后所有记录将无法恢复。", "删除", "取消"]
    };
    var source = semantic[variant] || [variant === "form" ? "新建项目" : variant === "task" ? "选择文件" : variant === "choice" ? "选择选项" : variant === "settings" ? "任务设置" : variant === "preferences" ? "翻译偏好" : "订阅日历", "", variant === "subscription" ? "完成" : "确认", variant === "subscription" ? null : "取消"];
    var props = {
      title: source[0], body: source[1], description: variant === "form" ? "填写项目基础信息" : variant === "task" ? "选择需要处理的文件" : "",
      size: selection.size, placement: selection.placement, scrollable: variant === "task",
      open: selection.open === "open", closable: ["notification", "success", "warning", "error", "destructive"].indexOf(variant) < 0,
      closeOnBackdrop: true, closeOnEscape: true, confirmLabel: source[2], cancelLabel: source[3],
      alternativeLabel: variant === "warning" ? "不发送" : null, confirmLoading: selection.confirmState === "loading", confirmDisabled: selection.confirmState === "disabled",
      fields: variant === "form" ? [{ label: "项目名称", value: "", placeholder: "请输入项目名称" }] : [],
      items: variant === "task" ? [{ label: "组件源码.zip", checked: true }, { label: "验收证据.json", checked: false }, { label: "视觉截图.png", checked: false }] : [],
      choices: variant === "choice" ? ["选项一", "选项二", "选项三"] : variant === "settings" ? ["可阅读用户", "可编辑用户"] : variant === "preferences" ? ["仅译文", "原文和译文"] : [],
      selectedChoice: 0,
      tabs: variant === "settings" ? ["评论设置", "分享设置", "安全设置"] : [], activeTab: 0,
      permissions: variant === "preferences" ? ["获得链接的企业用户", "仅协作者", "仅自己"] : [],
      selectedPermission: variant === "preferences" ? "获得链接的企业用户" : "",
      switches: variant === "preferences" ? [{ label: "句首自动大写", description: "翻译后自动大写首字母", checked: true, disabled: false, loading: false }, { label: "语法纠错", description: "自动修正常见语法问题", checked: false, disabled: false, loading: false }] : [],
      subscriptions: variant === "subscription" ? [{ label: "设计团队日历", detail: "产品设计团队", initial: "D", subscribed: false, actionLabel: "订阅", subscribedLabel: "已订阅" }, { label: "市场活动", detail: "品牌中心", initial: "M", subscribed: true, actionLabel: "订阅", subscribedLabel: "已订阅" }] : [],
      searchPlaceholder: "搜索日历"
    };
    if (variant === "settings") props.body = "谁可以评论当前文档";
    if (variant === "preferences") props.body = "翻译显示效果";
    if (variant === "subscription") props.body = "搜索并选择需要订阅的日历。";
    return scenario(c45, selection, props, "外壳内所有操作与内容控件均为真实 C-02/C-04/C-11/C-21/C-22/C-23/C-27/C-32/C-41 Renderer 实例。", "切换 open 打开 Modal；验证 Tooltip 不存在、Tab/Shift+Tab 焦点约束、Escape/遮罩/操作按钮事件恰好一次。");
  };

  var c47 = base("C-47", "Loading 加载", "独立等待提示选 Spinner；无需可见说明时选纯图标；初始内容布局可预估时选骨架屏；区域刷新占位选蒙层。默认中尺寸。", ["spinner", "spinner-only", "skeleton", "overlay"], "加载反馈");
  var c47Labels = { spinner: "Spinner 图标与说明", "spinner-only": "Spinner 纯图标", skeleton: "Skeleton 骨架屏", overlay: "Overlay 蒙层" };
  c47.variants.forEach(function (item) { item.label = c47Labels[item.key]; item.category = item.key === "skeleton" ? "初始占位" : item.key === "overlay" ? "区域刷新" : "独立提示"; });
  c47.categories = [category("独立提示", "spinner 为旋转图标与可选说明；spinner-only 只显示图标，仍保留读屏名称，适合紧凑区域。"), category("初始占位", "skeleton 以头像、文本、图片轮廓反馈初始加载；小、中、大同步改变占位尺寸。"), category("区域刷新", "overlay 复用 Spinner，增加区域轮廓与 60% 白色蒙层。当前提供独立占位区域，不接收或遮盖已有业务 DOM，不锁定键盘焦点。")];
  c47.controlGroups = [{ key: "variant", label: "类型", options: c47.variantCoverage.map(function (value) { return { value: value, label: c47Labels[value] }; }) }, { key: "size", label: "尺寸", options: [{ value: "small", label: "Small 小" }, { value: "medium", label: "Medium 中" }, { value: "large", label: "Large 大" }] }];
  c47.initialSelection = { variant: "overlay", size: "medium" }; c47.events = [];
  c47.resolveSelection = function (selection) {
    var skeleton = selection.variant === "skeleton";
    var props = { size: selection.size, text: "正在加载数据…", layout: skeleton ? "profile" : "vertical" };
    if (skeleton) { props.avatar = true; props.image = true; }
    if (selection.variant === "spinner" || selection.variant === "spinner-only") { props.inverse = false; props.neutral = false; }
    return scenario(c47, selection, props, skeleton ? "三档头像 32/40/48px、文本 12/14/16px、图片高度 96/120/144px；默认中尺寸。" : selection.variant === "overlay" ? "复用 14/24/40px Spinner，以蒙层保留刷新区域轮廓；与独立 Spinner 的结构和使用场景不同。" : selection.variant === "spinner-only" ? "只显示 14/24/40px 旋转图标；text 仅作为读屏名称，不显示文字。" : "14/24/40px 旋转图标与说明；适合局部等待提示，不覆盖其他内容。", "加载状态无需点击或获取焦点；通过 status 语义反馈等待，不提供虚构进度值。按钮加载使用 C-02。");
  };

  var c51 = base("C-51", "Progress 进度", "展示任务完成比例，提供线性、圆形、分段和不确定进度。", ["line", "circle", "steps", "indeterminate"], "进度形态");
  c51.controlGroups = [
    { key: "variant", label: "形态", options: options(c51.variantCoverage) },
    { key: "state", label: "状态", options: options(["not-started", "progress", "success", "error"]) },
    { key: "valueLabel", label: "显示数值", options: [{ value: "yes", label: "显示" }, { value: "no", label: "隐藏" }] },
    { key: "valueSide", label: "圆形数值位置", visibleWhen: function (selection) { return selection.variant === "circle" && selection.valueLabel === "yes"; }, options: [{ value: "left", label: "左侧" }, { value: "right", label: "右侧" }] }
  ];
  c51.initialSelection = { variant: "steps", state: "progress", valueLabel: "yes", valueSide: "left" }; c51.events = [];
  c51.normalizeSelection = function (selection, changedKey) { if (changedKey && changedKey !== "variant") return selection; if (selection.variant === "indeterminate") { selection.state = "progress"; selection.valueLabel = "no"; } if (selection.variant !== "circle") selection.valueSide = "left"; return selection; };
  c51.isSelectionAllowed = function (selection) { return (selection.variant !== "indeterminate" || selection.state === "progress" && selection.valueLabel === "no") && (selection.variant === "circle" || selection.valueSide === "left"); };
  c51.invalidSelectionReason = function (selection) { return selection.variant === "indeterminate" ? "不确定进度仅支持进行中且不显示百分比" : "数值位置仅适用于圆形进度"; };
  c51.resolveSelection = function (selection) {
    var value = selection.state === "success" ? 100 : selection.state === "not-started" ? 0 : 60;
    var props = { value: value, state: selection.state, valueLabel: selection.valueLabel === "yes", steps: 5, label: "任务进度" };
    if (selection.variant === "circle") props.valueSide = selection.valueSide;
    return scenario(c51, selection, props, selection.variant === "circle" ? "16px 圆环按真实百分比填充，100% 为完整圆环；数值可显示在左侧或右侧。" : "线形与分段轨道为 4px；完成、失败与进行中分别显示对应状态色。", "通过形态、状态和数值选项查看效果；不确定进度不显示百分比。");
  };

  var configs = [c12, c18, c19, c32, c41, c45, c47, c51].reduce(function (map, config) { map[config.id] = config; return map; }, {});
  function mount(id, scope) {
    if (!docsApi) return Promise.resolve([]);
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="' + id + '"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="' + id + '"]') ? root : root.closest && root.closest('article[data-component-card="' + id + '"]') || root.querySelector && root.querySelector('article[data-component-card="' + id + '"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview"); if (!preview) return Promise.resolve([]);
    revisions[id] = (revisions[id] || 0) + 1; var revision = revisions[id];
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="' + id + '"]'); if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true; preview.insertAdjacentHTML("afterend", docsApi.markup(configs[id])); var docs = preview.nextElementSibling;
    return docsApi.mount(configs[id], docs).then(function (result) { return revisions[id] === revision ? result : []; });
  }
  D.finalEightApiDocs = Object.freeze({ ids: targetIds.slice(), configs: configs, mount: mount });
  targetIds.forEach(function (id) { D.registerComponent(id, { mountSpecimen: function (scope) { return mount(id, scope); } }); });
  document.addEventListener("b2b:specimens-rendered", function (event) { var scope = event.detail && event.detail.root ? event.detail.root : document; targetIds.forEach(function (id) { mount(id, scope); }); });
})(window);
