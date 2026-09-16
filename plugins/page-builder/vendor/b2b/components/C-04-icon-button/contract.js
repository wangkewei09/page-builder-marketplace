(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-04", "Icon Button", "在有限空间中使用常见且易识别的图标触发功能操作。", "icon-button", "背景容器|表意图标|可访问名称|可选文本标签（Tooltip）", "Button_Icon|Outlined icon button|icon group|menu trigger", "24|28|32|36|40", "default|hover|active|focus|expanded|disabled", "五档尺寸与数值一一对应：mini=24px、small=28px、medium=32px（默认）、large=36px、xlarge=40px；图标视觉尺寸依次为 14/16/18/20/22px，由 Renderer/CSS 派生，调用方不得覆盖。Button_Icon 与 Outlined icon button 是动作按钮，不公开 selected；icon group 的选择只属于 items[].selected；菜单开闭由真实交互与 aria-expanded 派生，不公开瞬时 expanded prop。默认提供 Tooltip；只有包含组件已有清晰语境且继续保留 aria-label 时可关闭可见 Tooltip，例如 Dialog 关闭按钮。菜单展开后触发按钮保持强调视觉。", "button.icon.*|icon.size.*|tooltip.inverse.*|menu.*|control.height.*|space.2|space.3"]);
})();
