(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-44", "Tooltip", "解释图标或被截断的短内容。", "tooltip", "触发器|浮层|箭头|文本", "top|right|bottom|left|multiline", "compact|standard", "hidden|delayed|visible|focus", "用于短说明；默认延迟显示；支持键盘 Focus；长内容改用 Popover；canonical tooltip surface 挂载到 body 独立浮层，Trigger 留在原容器，以避开 overflow hidden/auto 祖先裁切，destroy 时移除 portal surface。", "tooltip.*|shadow.float|layer.popover|motion.fast"]);
})();
