(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-42", "Tag", "表达真实状态、分类或已选筛选条件。", "tag", "文本|状态色|图标（可选）|关闭按钮（可选）", "status|category|filter|closable|checkable|loading|bordered", "16|20|24-default|32", "default|hover|focus|active|selected|disabled|loading|enter|leave", "未特别说明尺寸时统一使用 24px；状态标签使用语义色且含文字；分类色克制；筛选标签可关闭、可选择并提供恢复路径；禁止装饰性标签。", "tag.*|color.status.*|radius.*|typography.*|motion.*"]);
})();
