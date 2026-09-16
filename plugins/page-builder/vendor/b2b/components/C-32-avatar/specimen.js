(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var avatarSpec = H.avatarSpec;
        return row("使用规则", [cell("用户 / 组织 / 应用身份", '<div class="avatar-identity">' + avatarSpec({ text: "七七", size: 32 }) + '<span><strong>林七七</strong><small>体验设计师</small></span></div>')], "圆形头像用于人物；膨胀矩形用于部门、企业和应用") + row("组成要素", [
          cell("图像 / 图标 / 背景 / 文字 / 占位符", '<div class="avatar-size-row">' + avatarSpec({ text: "图", size: 40 }) + avatarSpec({ icon: "person", size: 40 }) + avatarSpec({ text: "JS", size: 40 }) + avatarSpec({ loading: true, size: 40 }) + "</div>")
        ]) + row("控件类型 · 类型总览", [
          cell("Round · 人物 / 群组", '<div class="avatar-size-row">' + avatarSpec({ text: "七七", size: 40 }) + avatarSpec({ text: "群组", size: 40 }) + "</div>"),
          cell("Squircle · 应用 / 企业 / 部门", '<div class="avatar-size-row">' + avatarSpec({ text: "CN", size: 40, shape: "squircle" }) + avatarSpec({ icon: "apartment", size: 40, shape: "squircle" }) + "</div>")
        ]) + row("圆形头像 · 使用场景和尺寸规则", [
          cell("20px · 人员标签 / 间距 4px", '<div class="avatar-identity is-tight">' + avatarSpec({ text: "R", size: 20 }) + "<span>Jerry</span></div>"),
          cell("24px · 导航 / 表格单行 / 间距 8px", '<div class="avatar-identity">' + avatarSpec({ text: "R", size: 24 }) + "<span>Jerry</span></div>"),
          cell("32px · 双行 / 菜单 / 消息 / 间距 12px", '<div class="avatar-identity">' + avatarSpec({ text: "Y", size: 32 }) + '<span><strong>Yizhuo</strong><small>User experience</small></span></div>'),
          cell("4N 变量尺寸", '<div class="avatar-size-row">' + [20,24,28,32,40,48,64].map(function (size) { return avatarSpec({ text: String(size), size: size }); }).join("") + "</div>")
        ], "最小 20px；触控区域不低于 44px；单页头像尺寸不超过 3 种") + row("个人头像 · 文字展示规则", [
          cell("中文取末两字", avatarSpec({ text: "七七", size: 48, label: "林七七" })),
          cell("英文取名姓首字母", avatarSpec({ text: "JS", size: 48, label: "John Smith" })),
          cell("日文取姓氏首字", avatarSpec({ text: "工", size: 48, label: "工藤新一" })),
          cell("匿名企业随机色", '<div class="avatar-size-row">' + Array.from({ length: 8 }, function () { return avatarSpec({ icon: "person", size: 32 }); }).join("") + "</div>")
        ]) + row("头像组 · 重叠排列", [
          cell("20 / 24 / 32px", '<div class="source-avatar-groups"><div class="source-avatar-group">' + avatarSpec({ text: "A", size: 32 }) + avatarSpec({ text: "B", size: 32 }) + avatarSpec({ text: "C", size: 32 }) + avatarSpec({ text: "+8", size: 32 }) + '</div><div class="source-avatar-group">' + avatarSpec({ text: "A", size: 24 }) + avatarSpec({ text: "B", size: 24 }) + avatarSpec({ text: "+8", size: 24 }) + '</div><div class="source-avatar-group">' + avatarSpec({ text: "A", size: 20 }) + avatarSpec({ text: "B", size: 20 }) + avatarSpec({ text: "+8", size: 20 }) + "</div></div>"),
          cell("最多展示 5 个 +x", '<div class="source-avatar-group">' + ["A","B","C","D","E","+12"].map(function (text) { return avatarSpec({ text: text, size: 32 }); }).join("") + "</div>")
        ], "重叠头像外描边 2px；点击 +x 展开剩余人员列表") + row("头像组 · 间隔排列", [
          cell("完整展示，间距 4N", '<div class="avatar-size-row">' + ["A","B","C","D","E","更多"].map(function (text) { return avatarSpec({ text: text, size: 32 }); }).join("") + "</div>")
        ], "建议最多展示 6 个，超出提供数量或更多提示") + row("群组头像", [
          cell("1 个字符", avatarSpec({ text: "A", size: 56 })), cell("2 个字符", avatarSpec({ text: "AE", size: 56 })), cell("3–4 个字符", avatarSpec({ text: "ABCD", size: 56 })), cell("5–8 个字符 · 两行", avatarSpec({ text: "规范\n同步", size: 56 }))
        ], "中文最多两字、英文最多四字母，最多两行") + row("头像加载规则", [
          cell("Loading · N300", avatarSpec({ loading: true, size: 40 })),
          cell("内容整体未加载 · 骨架", '<div class="avatar-identity"><span class="avatar-skeleton"></span><span class="skeleton"><span></span><span></span></span></div>')
        ]) + row("矩形头像 · 使用场景和尺寸规则", [
          cell("项目视图 / 表格", '<div class="avatar-identity">' + avatarSpec({ text: "OM", size: 40, shape: "squircle" }) + '<span><strong>Object Management</strong><small>Define and configure</small></span></div>'),
          cell("4N 变量尺寸", '<div class="avatar-size-row">' + [20,24,32,40,48].map(function (size) { return avatarSpec({ text: "CN", size: size, shape: "squircle" }); }).join("") + "</div>")
        ]) + row("矩形头像 · 文字展示规则", [
          cell("应用 / 部门取前两字", avatarSpec({ text: "设计", size: 48, shape: "squircle" })), cell("企业取首字", avatarSpec({ text: "企", size: 48, shape: "squircle" })), cell("默认内描边", avatarSpec({ text: "CN", size: 48, shape: "squircle" }))
        ]) + row("其他规则补充 · 头像填充", [
          cell("Icon 安全区 = 头像 1/2", '<div class="avatar-size-row">' + avatarSpec({ icon: "person", size: 48 }) + avatarSpec({ icon: "apartment", size: 48, shape: "squircle" }) + "</div>")
        ]) + row("特殊场景说明", [
          cell("人物与部门混排时应用头像改用圆形", '<div class="avatar-size-row">' + avatarSpec({ text: "七七", size: 32 }) + avatarSpec({ text: "部门", size: 32 }) + avatarSpec({ text: "APP", size: 32 }) + "</div>")
        ]) + row("头像右下角 badge 规则", [
          cell("协作人查看 / 编辑状态", '<div class="avatar-size-row">' + avatarSpec({ text: "A", size: 40, badge: "1" }) + avatarSpec({ text: "B", size: 40, badge: "2" }) + avatarSpec({ text: "C", size: 40, badge: "3" }) + "</div>")
        ], "Badge 中心位于头像右下 45°；1px 边框与背景一致") + row("头像右上角 badge 规则", [
          cell("待处理数量 / 更新状态", '<div class="avatar-size-row">' + avatarSpec({ text: "A", size: 40, count: "7" }) + avatarSpec({ text: "B", size: 40, count: "" }) + "</div>")
        ], "Badge 中心位于头像右上 45°") + row("使用示例（正反案例）", [
          cell("正确 · 员工头像使用纯色圆形", '<div class="avatar-practice is-correct">' + avatarSpec({ text: "JY", size: 40 }) + "<span>Jerry Young</span></div>"),
          cell("避免 · 人物使用方形头像", '<div class="avatar-practice is-avoid">' + avatarSpec({ text: "JY", size: 40, shape: "squircle" }) + "<span>Jerry Young</span></div>")
        ]);
  }

  D.registerComponent("C-32", { renderSpecimen: renderSpecimen });
})();
