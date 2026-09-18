(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-05", "Rounded Button", "仅用于产品活动营销、产品销售官网、社区/内容运营三类营销场景。", "pill-button", "文本|前置普通功能图标（可选）|后置 chevron_right（可选）|全圆角容器|加载图标", "Primary|Secondary-Primary|Outlined", "mini|small|medium|large|xlarge", "default|hover|active|focus|disabled|loading", "Button_Round 是营销按钮，提供 Primary 蓝色实心、Secondary-Primary 蓝色描边与 Outlined 灰色描边白底外观。size 为 mini/small/medium/large/xlarge，分别对应 24/28/32/36/40px，默认 medium。width 只接受 default/long；long 填满 caller 可用容器。图标只允许无图标、前置普通功能图标或后置固定 chevron_right。常规登录、付费和后台操作流程禁止使用；固定位置并带阴影的全圆角入口属于 Button_Float。", "button.round.*|radius.pill|motion.fast"]);
})();
