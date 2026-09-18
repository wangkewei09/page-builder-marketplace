(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-11", "Checkbox", "从一组选项中选择一项或多项，也可独立表达布尔状态。", "checkbox", "复选框|选项描述|复选框组|全选项|错误描述", "group|standalone|with-description|indeterminate", "16", "unchecked|hover|pressed|focus|checked|indeterminate|disabled|error", "按源图复刻：视觉框固定 16×16px、Radius-XS，选项描述为 14px，默认控件与文字间距 8px，紧凑场景可缩至 4px。Error 是可与 unchecked、checked、mixed 和 disabled 组合的独立语义，必须通过 aria-invalid 与 aria-describedby 关联错误描述。组项以唯一 value 识别，可独立声明 checked、mixed、disabled 和 error；checked 与 mixed 不可同时为 true。竖向项间距为 8px；横向项间距为 24px、行间距为 8px，当 390px 等窄容器无法容纳时按完整选项稳定换行，不产生横向滚动。mixed 的点击或 Space 转换遵循原生 Checkbox：清除 indeterminate 并提交 checked=true。完整标签形成至少 22px 高的点击热区；说明较长时复选框与首行文本顶部对齐。", "checkbox.*|space.1|space.2|space.3|color.action.*|color.danger.*|focus.ring|radius.xs"]);
})();
