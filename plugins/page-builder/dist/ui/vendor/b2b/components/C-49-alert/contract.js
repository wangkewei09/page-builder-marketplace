(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-49", "Alert", "持续展示风险、说明或异常。", "alert", "状态图标|标题|说明|操作|关闭", "information|success|warning|error", "adaptive", "default|with-action|closable", "与容器等宽、占据文档流，高度随内容撑开；状态图标为 20px 面性图标，与关闭按钮对齐首行。单行操作默认靠右；空间不足、多行或有标题时另起一行，与正文左对齐。follow 单行时跟随正文。center 仅支持无标题单行，操作跟随文字，溢出省略并通过原生悬停提示保留全文。关闭始终最右，持续存在直到条件消失或用户关闭。", "alert.*|color.status.*|border.status.*|space.*"]);
})();
