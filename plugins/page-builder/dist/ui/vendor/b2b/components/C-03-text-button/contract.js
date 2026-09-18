(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-03", "Text Button", "承载最低优先级行动、紧凑跳转和指定 URL 链接。", "text-button", "文本|容器|普通前置图标（可选）|方向箭头或外部链接指示后置图标（可选）|命中热区", "Button_Text|Button_Link|Link", "content-hit-area|text-hit-area", "default|hover|active|focus|disabled", "Button_Text 默认无底色、交互显示背景且热区大于内容；Button_Link 仅改变文字状态；Link 是无前后图标的纯文字 URL 链接，Hover 显示下划线。图标与文字间距固定为 4px。Button_Text 与 Button_Link 的可选图标只能二选一：普通表意图标放在文字前，方向箭头或源码已证明的 open_in_new 指示放在文字后；箭头不得前置，普通图标不得后置。Disabled 不响应 Hover、Active 或 Focus 视觉。文字按钮组合以内容区形成 16px 视觉间距，实际容器间距 8px；标签不省略、不换行、不截断。", "button.text.*|link.*|inverse.link.*|space.1|space.2|space.4|focus.ring"]);
})();
