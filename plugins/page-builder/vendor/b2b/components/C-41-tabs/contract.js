(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-41", "Tabs", "切换同层级内容并保持当前项可见。", "tabs", "容器|标签标题|激活指示|分割线|数量徽标|翻页|新增|关闭|溢出菜单|内容区", "line|capsule|card", "large|medium|small", "default|hover|focus|active|disabled|overflow", "line 支持 large/medium/small，capsule 支持 medium/small，card 支持 large/medium/small；新增与关闭仅用于 card；滚动可用于所有视觉变体，箭头仅在实际宽度不足时显示；scrollable 与非空 overflowItems 互斥；更多菜单只用于 line/capsule 并以末项替换保持当前项可见；少量短内容不创建 Tabs；可选 panelContainer 将 C-41 拥有的面板挂载到外部空容器，默认仍在组件内。", "tabs.*|color.action.*|divider|space.*|motion.*"]);
})();
