(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-01", "Button Overview", "汇总所有按钮样式的适用场景与通用使用方式，具体规格引用 C-02 至 C-07。", "button-principles", "按钮样式引用|适用场景|选型指南|层级与组合|通用规则|特殊类型", "C-02 基础按钮|C-03 文字按钮|C-04 图标按钮|C-05 全圆角按钮|C-06 分裂与菜单按钮|C-07 悬浮按钮|选中前后强弱对照", "follow-referenced-component", "default|hover|active|selected|focus|loading|disabled", "概述不提供独立 Renderer；API 示例通过现有 C-02 至 C-07 生产 API 组合，选型与尺寸读取 describeComponentFamily 和 describe；完整场景沿用 canonical source 布局并在同级 light DOM 展示，图片头像与标签由 C-32/C-42 生产 Renderer 负责；源状态按钮仍为场景示例，不能宣称整张场景已生产 API 化；同一区域只保留一个主按钮，同组样式不超过两种，文案完整且直接表达结果。选中态按功能引导强弱调整文案、颜色或图标，Hover 与 Pressed 沿用生效前按钮规律。", "button.*|color.action.*|control.height.*|radius.control|focus.ring|motion.fast"]);
})();
