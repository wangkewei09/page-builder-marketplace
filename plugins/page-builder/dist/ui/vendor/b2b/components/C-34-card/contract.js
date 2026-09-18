(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-34", "Card", "承载独立对象、摘要、组合内容或单一入口，不作为默认页面容器。", "card", "卡片表面|标题与额外操作区（可选）|正文区|媒体与 Meta 区（可选）|C-32 头像（可选）|C-03/C-04 操作区（可选）|C-41 Tabs（可选）|C-47 骨架区（加载时）|C-34 子卡片（网格/嵌套时）", "basic|compact|cover|meta|external-grid|content-grid|nested|tabs|actions|interactive", "default|small", "default|hover|focus|pressed|selected|loading", "所有视觉使用本库 Token。bordered/borderless 与 hoverable 是独立维度；loading 由 C-47 拥有；头像、文字操作、图标操作和 Tabs 分别由 C-32/C-03/C-04/C-41 拥有；网格和嵌套只组合同一 C-34 Renderer。content-grid 相邻分隔与内角属于组合结构，只有外轮廓跟随全局圆角。interactive 固定 bordered/hoverable，selected 仅属于 interactive。禁止 HTML/Node/class/style 参数。", "card.*|border.surface|radius.surface|shadow.*|typography.*|space.*|loading.skeleton"]);
})();
