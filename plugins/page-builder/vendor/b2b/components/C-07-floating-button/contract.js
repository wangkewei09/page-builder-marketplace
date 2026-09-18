(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-07", "Floating Button", "固定于特定位置，承载最重要行动或快速定位当前场景位置。", "floating-button", "表意图标|背景容器|文本标签（Tooltip）|固定位置", "primary|secondary|menu|message|official-text", "36|40|48", "default|hover|active|focus|expanded|disabled", "悬浮按钮高于内容并带阴影；主要悬浮用于新建等强引导，次要悬浮用于返回顶部、消息和帮助。36px 与 40px 圆形按钮使用 20px 图标，48px 圆形按钮使用 24px 图标，均保持图标居中。全局悬浮位于右下 24px，多按钮垂直间距 20px；Hover 显示 Tooltip、Click 展开菜单；图标不清晰时官网可用圆角矩形文字扩展，禁止圆形承载文字。", "button.floating.*|shadow.emphasis|layer.sticky|tooltip.*|menu.*|space.5|space.6"]);
})();
