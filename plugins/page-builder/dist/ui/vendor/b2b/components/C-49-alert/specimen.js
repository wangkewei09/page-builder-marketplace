(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var button = H.button;
    var dialogSpec = H.dialogSpec;
    var alertSpec = H.alertSpec;
        return row("使用规则", [
          cell("持续展示 · 不自动消失", alertSpec({ text: "需要用户关注的信息会始终展现，直到条件解决或用户主动关闭。" })),
          cell("非阻断 · 不打断当前操作", alertSpec({ text: "提示停留在相关位置，用户仍可继续当前任务。", closable: false }))
        ], "层级顺序：站点级 → 页面级 → 模块级") + row("同类对比", [
          cell("常驻提示 Notice · 中等", alertSpec({ text: "持续保留，可选交互。" })),
          cell("弹窗 Dialog · 最高", dialogSpec({ title: "Decision required", body: "阻断其他操作。" })),
          cell("全局提示 Toast · 轻量", '<div class="toast-spec is-success">' + icon("check_circle") + '<span>自动消失</span></div>')
        ]) + row("组成要素", [
          cell("1 · 图标", alertSpec({ text: "快速识别提示属性类别。" })),
          cell("2 · 标题", alertSpec({ title: "Title", text: "长文本建议增加标题。" })),
          cell("3 · 正文 + 文字链", alertSpec({ text: "传达清晰明确的信息。", link: true })),
          cell("4 · 文字按钮", alertSpec({ text: "触发需要执行的操作。", action: "Text Button" })),
          cell("5 · 关闭按钮", alertSpec({ text: "主动关闭后不影响其他操作。" }))
        ]) + row("组件类型 · 语义", [
          cell("Info · 客观条件 / 规范 / 状态", alertSpec({ kind: "info", text: "Background condition or current status." })),
          cell("Success · 完成操作", alertSpec({ kind: "success", text: "Operation completed successfully." })),
          cell("Error · 报错信息", alertSpec({ kind: "error", text: "Multiple related errors should be merged." })),
          cell("Warning · 可能后果", alertSpec({ kind: "warning", text: "This change may affect existing data." }))
        ]) + row("操作类型", [
          cell("文字按钮 · 不超过 2 个", alertSpec({ text: "Including Text links, Text Button and Close Button", action: "Text Button", link: true })),
          cell("文字链 · 正文附加属性", alertSpec({ text: "Jump to another page", link: true, closable: false })),
          cell("关闭始终最右", alertSpec({ text: "Closing does not affect page operation.", action: "Action" }))
        ], "链接与普通文本混排；文字按钮文案必须清楚传达系统将执行的操作") + row("自定义 Icon", [
          cell("Info · function/info-500", alertSpec({ kind: "info", customIcon: "help" })),
          cell("Success · function/success-500", alertSpec({ kind: "success", customIcon: "verified" })),
          cell("Error · function/danger-500", alertSpec({ kind: "error", customIcon: "cancel" })),
          cell("Warning · function/warning-500", alertSpec({ kind: "warning", customIcon: "report" })),
          cell("多色图标 · 保留原显示", alertSpec({ kind: "info", customIcon: "deployed_code" }))
        ]) + row("位置说明", [
          cell("站点级 · Header 上方并下推内容", '<div class="alert-site-demo">' + alertSpec({ kind: "warning", text: "The system is expected to enter maintenance at 22:00–24:00." }) + '<header>Product Header</header><main>Page content</main></div>'),
          cell("页面级 · 一级标题下方", '<div class="alert-page-demo"><header>产品名称</header><h3>Title</h3>' + alertSpec({ kind: "error", text: "No Internet connection" }) + '<main>Page content</main></div>'),
          cell("模块级 · 紧邻相关元素", '<div class="alert-module-demo"><header>Module Header</header>' + alertSpec({ text: "Including Text links and action", action: "Text Button" }) + button("Button", "is-primary") + "</div>")
        ]) + row("多个常驻提示展示", [
          cell("同一位置 · 最多 2 条堆叠", '<div class="alert-stack-demo">' + alertSpec({ kind: "warning", text: "Maintenance notice" }) + alertSpec({ kind: "error", text: "Network disconnected" }) + "</div>"),
          cell("不同主体 · 就近展示", '<div class="alert-near-demo"><section><strong>Module A</strong>' + alertSpec({ text: "Module A information" }) + '</section><section><strong>Module B</strong>' + alertSpec({ kind: "warning", text: "Module B warning" }) + "</section></div>")
        ], "按出现时间依次展示；克制使用并保持信息层级") + row("自适应 · 宽度与高度", [
          cell("非通栏 · 内容模块 100% 宽", '<div class="alert-width-demo is-module">' + alertSpec({ text: "Module width notice" }) + "</div>"),
          cell("通栏 · 页面 / 系统级", '<div class="alert-width-demo">' + alertSpec({ text: "Full-width page notice" }) + "</div>"),
          cell("静态占位 · 高度自动撑开", alertSpec({ title: "Long information", text: "The text information follows the Notice width adaptively and wraps to the next line without covering adjacent content." })),
          cell("最多建议 4 行", alertSpec({ title: "Title", text: "Line one. Line two. Line three. Line four. Additional content is omitted and exposed through a tooltip.", separate: true, action: "More" }))
        ]) + row("文本与标题信息", [
          cell("中文优先单行", alertSpec({ text: "中文环境优先一行展示。" })),
          cell("多语言 · 自动折行", alertSpec({ text: "The text information automatically wraps when it cannot fit in one line in an internationalized scene." })),
          cell("舒适阅读宽度", '<div class="alert-readable-demo">' + alertSpec({ text: "Limit the copy width to preserve a comfortable reading path on wide pages." }) + "</div>"),
          cell("长文本增加标题 · ≤ 20 字", alertSpec({ title: "Control title within 20 words", text: "A title helps users quickly understand the main content." }))
        ]) + row("文字按钮布局", [
          cell("单行 · 默认右对齐", alertSpec({ text: "Single-line information", action: "Text Button" })),
          cell("空间不足 · 单独一行", alertSpec({ text: "When the action and text cannot fit on one line, the action moves below.", action: "Text Button", separate: true })),
          cell("正文超过一行 · 单独一行", alertSpec({ text: "This message has enough content to wrap across multiple lines and therefore moves the action to a separate line.", action: "Text Button", separate: true })),
          cell("有标题 · 单独一行", alertSpec({ title: "Title", text: "Description", action: "Text Button", separate: true })),
          cell("宽区域 · 按钮跟随文本", alertSpec({ text: "Short information", action: "Text Button", follow: true }))
        ]) + row("对齐方式", [
          cell("默认 · 左对齐", alertSpec({ title: "Title", text: "Text is left aligned.", action: "Text Button", separate: true })),
          cell("居中 · 聚焦信息", alertSpec({ text: "Information needs to be focused in the middle", action: "Text Button", center: true })),
          cell("居中限制 · 无标题且不折行", '<div class="alert-center-rule">' + alertSpec({ text: "Text button follows text when centered", action: "Text Button", center: true }) + "</div>")
        ], "内容主体左对齐时 Notice 同样左对齐；居中时不支持标题和换行") + row("使用建议", [
          cell("正确 · 标题与正文配合", '<div class="alert-practice">' + alertSpec({ title: "What the user needs to know", text: "Supporting information explains the condition." }) + "</div>"),
          cell("避免 · 标题单独使用", '<div class="alert-practice is-avoid">' + alertSpec({ title: "Title cannot be used alone", text: "" }) + "</div>")
        ]);
  }

  var A = D.componentApiDocs;
  var docsRevision = 0;
  var variantOptions = [
    { value: "information", label: "Information" },
    { value: "success", label: "Success" },
    { value: "warning", label: "Warning" },
    { value: "error", label: "Error" }
  ];
  var variantMeta = {
    information: { category: "说明与状态", title: "当前页面使用最新组件规范。", text: "客观说明当前条件、规范或状态。" },
    success: { category: "结果反馈", title: "保存成功", text: "所有修改已经保存。" },
    warning: { category: "风险提醒", title: "需要注意", text: "部分组件仍使用旧版本参数，请尽快迁移。" },
    error: { category: "异常反馈", title: "加载失败", text: "组件资源加载失败，请重试。" }
  };
  var parameterKeys = ["variant", "title", "text", "action", "closable", "actionLayout", "alignment", "icon"];

  function invalidSelectionReason(selection) {
    if (selection.alignment === "center" && (selection.content === "title" || selection.content === "long")) return "居中布局只支持无标题、单行优先内容";
    if (selection.alignment === "center" && selection.action === "separate") return "居中布局不支持独立操作行";
    return "";
  }

  function resolveSelection(selection) {
    var error = invalidSelectionReason(selection);
    if (error) throw new Error(error);
    var meta = variantMeta[selection.variant];
    var title = selection.content === "title" ? meta.title : "";
    var text = selection.content === "long"
      ? meta.text + " 这是一段用于验证容器自适应换行和操作布局的较长说明文本，内容不会覆盖相邻区域。"
      : meta.text;
    var action = selection.action === "none" ? null : selection.action === "separate" ? "立即处理" : selection.action === "follow" ? "了解更多" : "查看详情";
    var icon = selection.icon === "custom"
      ? { information: "help", success: "verified", warning: "report", error: "cancel" }[selection.variant]
      : null;
    var props = {
      variant: selection.variant,
      title: title,
      text: text,
      action: action,
      closable: selection.closable === "yes",
      actionLayout: selection.action === "none" ? "inline" : selection.action,
      alignment: selection.alignment,
      icon: icon
    };
    return {
      category: meta.category,
      label: variantOptions.find(function (item) { return item.value === selection.variant; }).label + " · " + ({ standard: "标准正文", title: "标题 + 正文", long: "长文本" }[selection.content]) + " · " + ({ none: "无操作", inline: "行内操作", separate: "独立操作行", follow: "跟随文本" }[selection.action]),
      description: "提示始终与所在容器等宽。图标与关闭按钮对齐首行；单行操作靠右，多行、带标题或空间不足时，操作自动另起一行并与正文左对齐。居中内容保持单行，空间不足时省略，悬停可查看完整文本。",
      interaction: action ? "点击或键盘激活文字操作触发一次 b2b:alert-action；关闭触发一次 b2b:alert-close，并由 canonical interaction 完成 dismiss。" : "关闭按钮支持点击、Enter 与 Space，并由 canonical interaction 完成 dismiss。",
      props: props,
      parameterKeys: parameterKeys.slice()
    };
  }

  var docsConfig = {
    id: "C-49",
    title: "Alert 常驻提示",
    introduction: "在相关内容附近持续展示说明、成功结果、风险或异常。站点提示位于顶部栏上方，页面提示位于标题下方，模块提示紧邻相关内容；均随容器铺满宽度、高度由内容撑开，不自动消失。",
    categories: [
      { name: "说明与状态", description: "客观说明规范、条件或当前状态，不打断用户任务。" },
      { name: "结果反馈", description: "持续展示已完成结果，并可提供后续查看操作。" },
      { name: "风险与异常", description: "警告可能后果或说明异常，必要时提供明确处理操作。" }
    ],
    variants: variantOptions.map(function (item) {
      return { key: item.value, label: item.label, category: item.value === "information" ? "说明与状态" : item.value === "success" ? "结果反馈" : "风险与异常" };
    }),
    controlsEyebrow: "全部变体与真实交互",
    controlsHeading: "按维度选择，操作真实 Alert",
    controlGroups: [
      { key: "variant", label: "语义", options: variantOptions },
      { key: "content", label: "内容", options: [{ value: "standard", label: "标准正文" }, { value: "title", label: "标题 + 正文" }, { value: "long", label: "长文本" }] },
      { key: "action", label: "操作", options: [{ value: "none", label: "无操作" }, { value: "inline", label: "右侧操作 · 自动换行" }, { value: "separate", label: "独立操作行" }, { value: "follow", label: "跟随文本" }] },
      { key: "alignment", label: "对齐", options: [{ value: "start", label: "左对齐" }, { value: "center", label: "居中" }] },
      { key: "closable", label: "关闭", options: [{ value: "yes", label: "可关闭" }, { value: "no", label: "不可关闭" }] },
      { key: "icon", label: "图标", note: "语义图标与自定义图标均采用 20px 面性样式；纯色随提示类型变化", options: [{ value: "semantic", label: "语义图标" }, { value: "custom", label: "自定义图标" }] }
    ],
    initialSelection: { variant: "warning", content: "standard", action: "inline", alignment: "start", closable: "yes", icon: "semantic" },
    variantCoverage: variantOptions.map(function (item) { return item.value; }),
    isSelectionAllowed: function (selection) { return !invalidSelectionReason(selection); },
    invalidSelectionReason: invalidSelectionReason,
    resolveSelection: resolveSelection,
    events: ["b2b:alert-action", "b2b:alert-close"],
    slotSelector: "#alert-slot"
  };

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-49"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-49"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-49"]');
    if (!card || !A) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1;
    var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-49"]');
    if (old) {
      A.destroy(old);
      old.remove();
    }
    preview.hidden = true;
    preview.insertAdjacentHTML("afterend", A.markup(docsConfig));
    var docs = preview.nextElementSibling;
    return A.mount(docsConfig, docs).then(function (result) { return current === docsRevision ? result : []; });
  }

  document.addEventListener("b2b:specimens-rendered", function (event) {
    mountSpecimen(event.detail && event.detail.root ? event.detail.root : document);
  });
  D.registerComponent("C-49", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
