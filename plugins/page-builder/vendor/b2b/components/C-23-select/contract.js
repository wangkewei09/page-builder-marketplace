(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-23", "选择器", "从多个备选项中完成单选或多选，并在需要时支持搜索、清空、创建与复杂内容。", "select", "标题文本（可选）|触发区域|下拉列表|列表内容|清除按钮|搜索输入|选项详情|创建入口", "基础单选|基础多选|自定义选项|分组选项|无边框|下划线|可搜索|可创建|复杂内容", "28-small|32-medium|40-large|120-menu-min|420-menu-max|246-menu-recommended-height|188-multiple-max-height", "default|hover|active|selected-active|disabled|readonly|error|loading|no-result|inputting", "严格按源图复刻。单选点击选项后立即回显并收起，多选保持面板并以标签回显；打开时默认激活首项并支持方向键与 Enter。清除仅在有输入能力或已选择内容时出现；搜索支持模糊匹配、加载与无结果；可创建分搜索创建和底部主动创建。触发器提供 S/M/L 三档，建议最小宽度 240px、最大 600px；菜单宽度优先与触发器一致，最小 120px、最大 420px，常规推荐高度 246px，多选标签区域最高 188px。下拉默认向下，空间不足向上，左右空间不足时调整对齐。复杂选项可组合图标、Tag、头像、描述与分组；文本过长时省略并用 Tooltip 提供完整内容。", "select.*|menu.*|tag.*|avatar.*|control.height.*|space.*|color.action.*|color.danger.*|shadow.down.*|motion.fast"]);
})();
