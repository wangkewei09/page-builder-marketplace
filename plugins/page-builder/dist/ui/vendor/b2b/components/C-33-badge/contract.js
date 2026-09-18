(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-33", "Badge", "表达未读、更新、待办、在线协同或有限数量。", "badge", "点/字符/图标/角标|容器背景|字符或图标|1px 内描边|2px 白色隔离边|调用方宿主", "dot|character|icon|corner", "6-dot|8-dot|10-dot|14-character|14-icon|20-triangle|8x12-rectangle|14x18-flag", "fill|inner-stroke|fill-stroke|light|dark|overflow", "四类型必须互斥：dot 使用 6/8/10px；character 高 14px、10px Medium，单字符为圆形、多字符左右 4px，超过 999 使用省略号；icon 容器 14×14px、内部图标 8×8px；corner 仅使用三角 20×20、矩形 8×12 和旗帜 14×18 三种原生形态。图标必须在容器内光学居中。点状徽标尾随文字间距 4px，字符徽标尾随文字间距 2px；圆形或图标宿主使用 45° 对角锚点；角标贴齐 top/right=0。fill、inner-stroke 和 fill-stroke 不得叠加；inner-stroke 仅用于灰色点状徽标，fill-stroke 仅用于协作或重叠宿主。宿主 DOM 与定位由调用方组合，不是 Badge 内部像素 prop。", "badge.*|color.red.500|color.neutral.400|color.turquoise.600|color.blue.300|color.yellow.500|color.carmine|radius.pill|typography.*"]);
})();
