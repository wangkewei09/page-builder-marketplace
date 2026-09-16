(function registerComponentSpecimen() {
  "use strict";

  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var specimenScriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : document.baseURI;
  var runtimeLoaderUrl = new URL("../runtime/loader.js?v=3.3.1-button-family-contract", specimenScriptUrl).href;
  var runtimeLoaderPromise = null;
  var mountedInstances = [];
  var mountRevision = 0;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function codeBlock(source) {
    return '<pre style="box-sizing:border-box;width:100%;max-width:100%;margin:0;overflow:auto;padding:var(--b2b-space-4);border:1px solid var(--b2b-color-border-surface);border-radius:var(--b2b-radius-sm);background:var(--b2b-color-bg-section);color:var(--b2b-color-text-secondary);font-family:var(--b2b-font-mono);font-size:var(--b2b-font-size-12);line-height:var(--b2b-line-height-20);text-align:left"><code>' + escapeHtml(source) + "</code></pre>";
  }

  function mountPoint(name) {
    return '<div data-c41-production-mount="' + escapeHtml(name) + '" aria-busy="true"></div>';
  }

  function labels(from, to) {
    var result = [];
    for (var index = from; index <= to; index += 1) result.push("Tab " + index);
    return result;
  }

  function itemsFromLabels(tabLabels, options) {
    var opts = options || {};
    return tabLabels.map(function (label, index) {
      return {
        id: (opts.prefix || "tab") + "-" + (index + 1),
        label: label,
        content: "Content of " + label,
        disabled: opts.disabled === index,
        closable: Boolean(opts.closable),
        badge: opts.badge === index ? true : null
      };
    });
  }

  function standardProps(overrides) {
    return Object.assign({
      variant: "line",
      size: "medium",
      items: itemsFromLabels(labels(1, 6)),
      activeId: "tab-1",
      ariaLabel: "标签页示例",
      activation: "automatic",
      addable: false,
      scrollable: false,
      overflowItems: []
    }, overrides || {});
  }

  var scenarios = {
    usage: function () { return standardProps(); },
    overviewLine: function () { return standardProps({ ariaLabel: "一级标签页·线条式" }); },
    overviewCapsule: function () { return standardProps({ variant: "capsule", ariaLabel: "次级标签页·选项式" }); },
    overviewCard: function () { return standardProps({ variant: "card", addable: true, ariaLabel: "卡片标签页" }); },
    lineStates: function () {
      return standardProps({
        items: itemsFromLabels(["Normal", "Selected", "Hover", "Disabled"], { disabled: 3, prefix: "line-state" }),
        activeId: "line-state-2",
        ariaLabel: "一级标签页状态"
      });
    },
    automaticActivation: function () { return standardProps({ items: itemsFromLabels(labels(1, 3), { prefix: "automatic-activation" }), activeId: "automatic-activation-1", activation: "automatic", ariaLabel: "自动激活页签" }); },
    manualActivation: function () { return standardProps({ items: itemsFromLabels(labels(1, 3), { prefix: "manual-activation" }), activeId: "manual-activation-1", activation: "manual", ariaLabel: "手动激活页签" }); },
    lineLarge: function () { return standardProps({ size: "large", items: itemsFromLabels(["Tab", "Tab", "Tab"], { prefix: "line-large" }), activeId: "line-large-1" }); },
    lineMedium: function () { return standardProps({ items: itemsFromLabels(["Tab", "Tab", "Tab"], { prefix: "line-medium" }), activeId: "line-medium-1" }); },
    lineSmall: function () { return standardProps({ size: "small", items: itemsFromLabels(["Tab", "Tab", "Tab"], { prefix: "line-small" }), activeId: "line-small-1" }); },
    lineHit: function () { return standardProps({ items: itemsFromLabels(["Tab", "Tab", "Tab"], { prefix: "line-hit" }), activeId: "line-hit-1" }); },
    lineScroll: function () {
      return standardProps({ items: itemsFromLabels(labels(10, 18), { prefix: "line-scroll" }), activeId: "line-scroll-1", scrollable: true, ariaLabel: "一级标签页滚动" });
    },
    lineMore: function () {
      return standardProps({
        items: itemsFromLabels(labels(1, 5), { prefix: "line-more" }),
        activeId: "line-more-1",
        overflowItems: itemsFromLabels(["Tab 7", "Tab 8", "Long tab title"], { prefix: "line-overflow" }),
        ariaLabel: "一级标签页更多菜单"
      });
    },
    lineLong: function () {
      return standardProps({
        items: itemsFromLabels(["This month's personal news and operation records", "This is a long tab title", "Tab 3"], { prefix: "line-long" }),
        activeId: "line-long-1",
        ariaLabel: "一级标签页超长标题"
      });
    },
    lineDivider: function () {
      return standardProps({ items: itemsFromLabels(labels(1, 3), { prefix: "line-divider" }), activeId: "line-divider-1", ariaLabel: "指示器与分割线重合" });
    },
    lineBadge: function () {
      return standardProps({ items: itemsFromLabels(["Tab", "Tab", "Tab"], { prefix: "line-badge", badge: 1 }), activeId: "line-badge-1", ariaLabel: "徽标不占单项宽度" });
    },
    capsuleStates: function () {
      return standardProps({
        variant: "capsule",
        items: itemsFromLabels(["Normal", "Selected", "Hover", "Disabled"], { disabled: 3, prefix: "capsule-state" }),
        activeId: "capsule-state-2",
        ariaLabel: "次级标签页状态"
      });
    },
    capsuleMedium: function () { return standardProps({ variant: "capsule", items: itemsFromLabels(labels(1, 6), { prefix: "capsule-medium" }), activeId: "capsule-medium-1" }); },
    capsuleSmall: function () { return standardProps({ variant: "capsule", size: "small", items: itemsFromLabels(labels(1, 6), { prefix: "capsule-small" }), activeId: "capsule-small-1" }); },
    capsuleGroupLarge: function () { return standardProps({ variant: "capsule", items: itemsFromLabels(labels(1, 6), { prefix: "capsule-group-large" }), activeId: "capsule-group-large-1" }); },
    capsuleGroupTitle: function () { return standardProps({ variant: "capsule", items: itemsFromLabels(labels(1, 6), { prefix: "capsule-group-title" }), activeId: "capsule-group-title-1" }); },
    capsuleScroll: function () {
      return standardProps({ variant: "capsule", items: itemsFromLabels(labels(1, 7), { prefix: "capsule-scroll" }), activeId: "capsule-scroll-1", scrollable: true, ariaLabel: "次级标签页滚动" });
    },
    capsuleMore: function () {
      return standardProps({
        variant: "capsule",
        items: itemsFromLabels(labels(1, 5), { prefix: "capsule-more" }),
        activeId: "capsule-more-1",
        overflowItems: itemsFromLabels(["Tab 7", "Tab 8", "Long tab title"], { prefix: "capsule-overflow" }),
        ariaLabel: "次级标签页更多菜单"
      });
    },
    cardEditable: function () {
      return standardProps({
        variant: "card",
        items: itemsFromLabels(labels(3, 6), { prefix: "card-editable", closable: true }),
        activeId: "card-editable-1",
        addable: true,
        scrollable: true,
        ariaLabel: "卡片标签页新增与关闭"
      });
    },
    cardClose: function () {
      return standardProps({
        variant: "card",
        items: itemsFromLabels(["合同附件标题", "合同附件标题", "合同附件标题"], { prefix: "card-close", closable: true }),
        activeId: "card-close-1",
        ariaLabel: "关闭当前后选中上一个"
      });
    },
    cardLarge: function () { return standardProps({ variant: "card", size: "large", items: itemsFromLabels(labels(1, 3), { prefix: "card-large" }), activeId: "card-large-1", ariaLabel: "卡片标签页大尺寸" }); },
    cardMedium: function () { return standardProps({ variant: "card", items: itemsFromLabels(labels(1, 3), { prefix: "card-medium" }), activeId: "card-medium-1", ariaLabel: "卡片标签页中尺寸" }); },
    cardSmall: function () { return standardProps({ variant: "card", size: "small", items: itemsFromLabels(labels(1, 3), { prefix: "card-small" }), activeId: "card-small-1", ariaLabel: "卡片标签页小尺寸" }); },
    hierarchyLargeLine: function () { return standardProps({ size: "large", items: itemsFromLabels(["Tab", "Tab"], { prefix: "hierarchy-large-line" }), activeId: "hierarchy-large-line-1" }); },
    hierarchyMediumLine: function () { return standardProps({ items: itemsFromLabels(["Tab", "Tab", "Tab"], { prefix: "hierarchy-medium-line" }), activeId: "hierarchy-medium-line-1" }); },
    hierarchyLargeCapsuleLine: function () { return standardProps({ size: "large", items: itemsFromLabels(["Tab", "Tab"], { prefix: "hierarchy-capsule-line" }), activeId: "hierarchy-capsule-line-1" }); },
    hierarchyCapsule: function () { return standardProps({ variant: "capsule", items: itemsFromLabels(labels(1, 3), { prefix: "hierarchy-capsule" }), activeId: "hierarchy-capsule-1" }); }
  };

  function parameterList() {
    return '<dl class="contract-list">' +
      '<dt>variant</dt><dd><code>line | capsule | card</code></dd>' +
      '<dt>size</dt><dd><code>large | medium | small</code>；capsule 仅支持 medium / small</dd>' +
      '<dt>items</dt><dd>必填数组：<code>{ id, label, content, disabled, badge, closable }</code>；badge 为 C-33 Node、字符徽标文本或 8px dot 的 <code>true</code></dd>' +
      '<dt>activeId</dt><dd>初始激活项 ID；必须指向可用标签</dd>' +
      '<dt>ariaLabel</dt><dd>标签列表的可访问名称</dd>' +
      '<dt>activation</dt><dd><code>automatic | manual</code></dd>' +
      '<dt>panelContainer</dt><dd>可选空 HTMLElement，用于标题导航与正文分区；面板仍由 Tabs 创建、切换和清理。</dd>' +
      '<dt>scrollable</dt><dd>宽度不足时显示前后滚动入口；与非空 overflowItems 互斥</dd>' +
      '<dt>overflowItems</dt><dd>More 菜单数据；仅 line / capsule，选择后替换可见末项</dd>' +
      '<dt>addable</dt><dd>显示新增入口；仅 card</dd>' +
      '<dt>item.closable</dt><dd>显示关闭入口；仅 card</dd>' +
      '</dl>';
  }

  function renderSpecimen() {
    var cell = H.cell;
    var row = H.row;
    var tabsSpec = H.tabsSpec;
    return row("使用规则", [cell("平级信息模块化分类并快速切换", mountPoint("usage"))], "用于平级区域收纳和同层内容导航；短内容不创建无意义标签页") +
      row("组成要素", [
        cell("容器 / 标题 / 指示器 / 分割线 / 徽标 / 翻页 / 新增关闭", '<div class="tabs-anatomy" data-c41-static-anatomy>' + tabsSpec({ badge: true, scroll: true, closable: true, addable: true, labels: ["Tab 1", "Tab 2", "Tab 3"] }) + '<ol><li>容器背景</li><li>标签标题</li><li>选中指示器</li><li>分割线</li><li>徽标</li><li>翻页按钮</li><li>新增与关闭</li></ol></div>')
      ]) +
      row("控件类型 · 类型总览", [
        cell("一级标签页 · 线条式", mountPoint("overviewLine")),
        cell("次级标签页 · 选项式", mountPoint("overviewCapsule")),
        cell("卡片标签页", mountPoint("overviewCard"))
      ]) +
      row("一级标签页 · 状态", [
        cell("Normal / Selected / Hover / Disabled", mountPoint("lineStates"))
      ], "同一页面建议仅使用一组一级标签页") +
      row("交互模式", [
        cell("automatic · 方向键移动并切换", mountPoint("automaticActivation")),
        cell("manual · 方向键移动焦点，Enter / Space 切换", mountPoint("manualActivation"))
      ], "两种 activation 均同步 aria-selected、tabindex、tabpanel 与焦点") +
      row("一级标签页 · 尺寸与热区", [
        cell("Large · 16px", mountPoint("lineLarge")),
        cell("Medium · 14px", mountPoint("lineMedium")),
        cell("Small · 12px", mountPoint("lineSmall")),
        cell("热区宽度与标题同宽，不含间距", '<div class="tabs-hit-demo">' + mountPoint("lineHit") + '<span>Hit area</span></div>')
      ], "尺寸和间距满足 4N，可按层级与文案长度调整") +
      row("一级标签页 · 超长处理", [
        cell("页签滚动", mountPoint("lineScroll")),
        cell("更多菜单与末项替换", mountPoint("lineMore")),
        cell("单项最大宽 240px", mountPoint("lineLong"))
      ], "优先保留足够信息；超长单项省略并通过 Tooltip 展示") +
      row("一级标签页 · 分割线与徽标", [
        cell("指示器与分割线重合", mountPoint("lineDivider")),
        cell("徽标不占单项宽度，指示器不包含徽标", mountPoint("lineBadge"))
      ]) +
      row("次级标签页 · 状态", [
        cell("Normal / Selected / Hover / Disabled", mountPoint("capsuleStates"))
      ], "Selected：B500 文字+B100 背景；普通/禁用保持清晰区分") +
      row("次级标签页 · 尺寸与场景", [
        cell("Medium 14px · 最小 48px", mountPoint("capsuleMedium")),
        cell("Small 12px · 最小 48px", mountPoint("capsuleSmall")),
        cell("同页多组次级选项", '<div class="tabs-multiple"><h4>大标题</h4>' + mountPoint("capsuleGroupLarge") + '<h4>标题</h4>' + mountPoint("capsuleGroupTitle") + "</div>")
      ]) +
      row("次级标签页 · 超长处理", [
        cell("滚动翻页", mountPoint("capsuleScroll")),
        cell("更多菜单替换末项", mountPoint("capsuleMore"))
      ]) +
      row("卡片标签页", [
        cell("新增和关闭", mountPoint("cardEditable")),
        cell("关闭当前后选中上一个", mountPoint("cardClose"))
      ], "仅 Tab-card 使用新增/关闭；可按场景隐藏关闭按钮") +
      row("卡片标签页 · 尺寸", [
        cell("Large · 16px", mountPoint("cardLarge")),
        cell("Medium · 14px", mountPoint("cardMedium")),
        cell("Small · 12px", mountPoint("cardSmall"))
      ], "card 的 large / medium / small 均来自同一生产 API") +
      row("页签使用层级建议", [
        cell("Large line > Medium line", '<div class="tabs-hierarchy">' + mountPoint("hierarchyLargeLine") + mountPoint("hierarchyMediumLine") + "</div>"),
        cell("Large line > Capsule", '<div class="tabs-hierarchy">' + mountPoint("hierarchyLargeCapsuleLine") + mountPoint("hierarchyCapsule") + "</div>")
      ], "一级层级始终高于二级；卡片页签作为容器时低于一级，作为全局切换时可高于一级") +
      row("生产 API", [
        cell("B2B.components.tabs.create(props)", codeBlock('await B2B.loadComponents("C-41");\nconst api = B2B.components.tabs.describe();\nconst tabs = B2B.components.tabs.create(props).mount(target);\nawait tabs.ready;\ntabs.validate();'), "is-wide")
      ], "describe().api.props 是调用参数的唯一权威；上方组成要素为原图 anatomy 静态示意，不是合法生产参数组合") +
      row("全部参数", [
        cell("create(props)", parameterList(), "is-wide")
      ], "只允许 contract 与 describe().api.props 已声明的参数") +
      row("AI 调用", [
        cell("可直接交给 AI 的渲染参数", codeBlock('await B2B.loadComponents("C-41");\nconst tabs = B2B.components.tabs.create({\n  variant: "line",\n  size: "medium",\n  activation: "automatic",\n  ariaLabel: "项目内容",\n  activeId: "overview",\n  scrollable: false,\n  addable: false,\n  overflowItems: [],\n  items: [\n    { id: "overview", label: "概览", content: overviewNode },\n    { id: "activity", label: "动态", content: activityNode, disabled: false }\n  ]\n}).mount(document.querySelector("#tabs-slot"));\nawait tabs.ready;\nif (!tabs.validate().valid) throw new Error("C-41 validation failed");'), "is-wide")
      ], "AI 先读取 describe()，再生成 props；不手写 Tabs DOM 或内部交互");
  }

  function ensureTabsApi() {
    if (window.B2B && typeof window.B2B.loadComponents === "function") return Promise.resolve(window.B2B.loadComponents("C-41"));
    if (runtimeLoaderPromise) return runtimeLoaderPromise;
    runtimeLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = runtimeLoaderUrl;
      script.setAttribute("data-c41-production-loader", "");
      script.addEventListener("load", function () {
        if (!window.B2B || typeof window.B2B.loadComponents !== "function") {
          reject(new Error("C-41 production loader did not expose B2B.loadComponents"));
          return;
        }
        window.B2B.loadComponents("C-41").then(resolve, reject);
      }, { once: true });
      script.addEventListener("error", function () {
        reject(new Error("Failed to load the C-41 production runtime"));
      }, { once: true });
      document.head.appendChild(script);
    });
    return runtimeLoaderPromise;
  }

  function destroyMountedInstances() {
    mountedInstances.splice(0).forEach(function (instance) {
      if (instance && !instance.destroyed) instance.destroy();
    });
  }

  function mountSpecimen(scope) {
    if (D.finalEightApiDocs) return Promise.resolve([]);
    var root = scope || document;
    var placeholders = Array.from(root.querySelectorAll("[data-c41-production-mount]"));
    var ownsC41Board = Boolean(root.matches && root.matches('[data-component-card="C-41"], .component-spec-board[data-component-id="C-41"]')) || Boolean(root.querySelector && root.querySelector('[data-component-card="C-41"], .component-spec-board[data-component-id="C-41"]'));
    var isWholeComponentGrid = root.id === "componentGrid";
    if (!placeholders.length && !ownsC41Board && !isWholeComponentGrid) return Promise.resolve([]);
    mountRevision += 1;
    var revision = mountRevision;
    destroyMountedInstances();
    if (!placeholders.length) return Promise.resolve([]);
    return ensureTabsApi().then(function () {
      if (revision !== mountRevision) return [];
      var instances = placeholders.map(function (placeholder) {
        var name = placeholder.getAttribute("data-c41-production-mount");
        if (!scenarios[name]) throw new Error("Unknown C-41 specimen scenario: " + name);
        var instance = window.B2B.components.tabs.create(scenarios[name]()).mount(placeholder);
        mountedInstances.push(instance);
        return instance;
      });
      return Promise.all(instances.map(function (instance) {
        return instance.ready.then(function () {
          var validation = instance.validate();
          instance.element.parentElement.setAttribute("aria-busy", "false");
          instance.element.parentElement.dataset.c41Validation = validation.valid ? "valid" : "invalid";
          return validation;
        });
      })).then(function (validations) {
        document.dispatchEvent(new CustomEvent("b2b:c41-production-mounted", {
          detail: { root: root, instances: instances, validations: validations }
        }));
        return instances;
      });
    }).catch(function (error) {
      placeholders.forEach(function (placeholder) {
        placeholder.setAttribute("aria-busy", "false");
        placeholder.dataset.c41Validation = "error";
        placeholder.dataset.c41Error = error.message;
      });
      return [];
    });
  }

  document.addEventListener("b2b:specimens-rendered", function (event) {
    mountSpecimen(event.detail && event.detail.root ? event.detail.root : document);
  });

  D.registerComponent("C-41", {
    renderSpecimen: renderSpecimen,
    mountSpecimen: mountSpecimen
  });
})();
