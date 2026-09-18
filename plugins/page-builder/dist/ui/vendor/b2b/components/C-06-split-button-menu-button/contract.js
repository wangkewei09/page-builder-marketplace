(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-06", "Split Button / Menu Button", "组合一个固定高频主操作与一组相似的低频辅助操作。", "split-button", "主操作按钮|主操作前置图标（仅 Split button 可选）|通栏分割线|下拉菜单按钮|辅助操作菜单", "Split button|Menu button|Overflow Menu", "24-mini|28-small|32-medium|36-large|40-xlarge", "default|hover-main|hover-menu|active|expanded|focus|disabled", "Split button 有两个完全独立的热区，主操作可按源码证据使用前置 mainIcon，内部通栏分割线不可省略；菜单触发热区始终与 24/28/32/36/40px 控件高度同宽。hover、pressed、focus 与 expanded 的背景、焦点环和事件只属于当前热区：菜单展开不得改变左侧主操作的瞬时样式或派发 primary，主操作也不得开关菜单。Secondary Gray 任一热区 hover 或 focus-visible 时，组合只共享连续蓝色外轮廓并保留内部隔线，不共享背景、pressed、focus-visible 或点击事件；Secondary Blue 两段始终保留完整蓝色边框；Primary 两段之间始终保留可见分割线。Menu button 是无分割线的单热区；Overflow Menu 收纳按钮组低优先级动作且用 icon 控制触发图标。caller-owned items 可声明 disabled；禁用项可见但不可激活，键盘导航跳过。菜单面板必须使用 surface 背景、1px 边框、surface 圆角和 float 投影，展开动画不得裁切投影。菜单只由 Click 触发并支持外部点击/Escape 收起；主操作不在菜单重复，次级操作不得回显覆盖主操作；移动端不使用分裂按钮。", "button.split.*|button.menu.*|divider|dropdown.*|tooltip.*|control.height.*"]);
})();
