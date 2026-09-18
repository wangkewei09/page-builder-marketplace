(function registerComponentContractConfig() {
  "use strict";
  var D = window.B2BDesignSource;
  D.componentContractConfigs = D.componentContractConfigs || [];
  D.componentContractConfigs.push(["C-32", "Avatar", "表达用户、组织或协作成员身份。", "avatar", "图片/文字/图标|形状容器|状态点|群组计数|信息文本|右上角徽标", "image|text|icon|group|with-status|with-text|with-secondary-text|with-top-badge", "24|32|40|48|64", "default|hover|loading|fallback|offline|online", "图片加载失败回退文字或图标；群组重叠保留边界并在末尾显示剩余数；信息头像用主信息或主/次信息横向排列；右上角徽标组合 C-33 的红/灰字符数量（最多三字符或 …）或状态点，以头像右上 45° 对角锚定。", "avatar.*|color.avatar.*|border.surface|badge.*|typography.*"]);
})();
