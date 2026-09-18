(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-02", "Button", "触发立即动作并表达操作优先级。", "button", "文本|图标（可选）|按钮容器|加载图标", "primary|danger|secondary-blue|secondary-danger|secondary-gray", "mini|small|medium|large|xlarge", "default|hover|active|focus|disabled|loading", "primary 是主要按钮，danger 是主要危险按钮，secondary-blue 是蓝色次要按钮，secondary-danger 是次要危险按钮，secondary-gray 是灰色次要按钮。size 使用 mini/small/medium/large/xlarge，分别对应 24/28/32/36/40px，默认 medium（32px）；width 使用 default（内容自然宽度）或 long（填满 caller 容器，width:100%、min-width:0）。主色 #1456F0，Hover #3370FF，Active #0442D2；圆角继承全局 --b2b-radius-control，当前默认 6px 并随圆角主题切换；标签不换行。同一操作区只保留一个主按钮，危险按钮文案必须直接描述后果。", "button.background.*|button.border.*|button.text.*|control.height.*"]);
})();
