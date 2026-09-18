(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-47", "Loading", "反馈局部或全局处理中状态。", "loading", "Spinner/骨架|遮罩（可选）|说明文本", "spinner|spinner-only|skeleton|overlay", "small|medium|large", "loading", "默认 medium。spinner 用于独立加载提示；spinner-only 仅显示图标，text 仅作读屏名称；skeleton 用于初始内容占位，三档头像 32/40/48px、文本 12/14/16px、图片 96/120/144px；overlay 是带 60% 白色蒙层和区域轮廓的加载占位，不接收或遮盖调用方 DOM，也不锁定焦点；按钮加载由 C-02 的 loading 状态组合；插画不属于 C-47。", "loading.*|skeleton.*|motion.*|mask.subtle"]);
})();
