(function registerFoundationsPage() {
  "use strict";

  var D = window.B2BDesignSource;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function statusLabel(status) {
    var labels = { exact: "verified", observed: "verified", verified: "verified", inferred: "inferred", provisional: "provisional", conflict: "conflict" };
    var value = labels[status] || status;
    return '<span class="status" data-status="' + escapeHtml(value) + '">' + escapeHtml(value) + "</span>";
  }

  function iconDiagnostic() {
    var available = D.iconStatus === "available";
    if (available) return '<div class="b2b-alert icon-diagnostic"><span class="b2b-icon is-24" aria-hidden="true">check_circle</span><div><strong>Material Symbols Outlined 已就绪</strong><div class="caption">本地 WOFF2 可变字体加载成功；支持 FILL、wght、GRAD 和 opsz。</div></div></div>';
    return '<div class="warning-banner icon-diagnostic"><div><strong>Material Symbols 本地源加载失败</strong><div class="caption">请检查 variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2 和 LICENSE.txt。当前不会切换到其他图标库。</div></div></div>';
  }

  function renderFoundations() {
    var categoryOrder = ["颜色", "字体", "间距", "圆角", "阴影", "密度", "布局", "动效", "响应式"];
    var categories = categoryOrder.filter(function (category) {
      return D.tokens.some(function (token) { return token.category === category; });
    });
    var exact = D.tokens.filter(function (token) { return token.confidence === "exact"; }).length;
    var observed = D.tokens.filter(function (token) { return token.confidence === "observed"; }).length;
    var conflicts = D.tokens.filter(function (token) { return token.confidence === "conflict"; }).length;
    var provisional = D.tokens.filter(function (token) { return token.confidence === "provisional" || token.confidence === "inferred"; }).length;
    var nav = categories.map(function (category) {
      var count = D.tokens.filter(function (token) { return token.category === category; }).length;
      return '<a href="#foundation-' + encodeURIComponent(category) + '"><span>' + escapeHtml(category) + '</span><small>' + count + '</small></a>';
    }).join("");
    var groups = categories.map(renderFoundationCategory).join("");
    return [
      '<div class="page-header"><div><h1>Foundations</h1><p>' + D.foundationReviews.length + ' 张现存基础规范图已逐图复核；颜色只读取 F-17《色彩总》。每一个 Token 都显示实现值、来源截图、可信度和使用边界；CSS 实现真相位于 styles/tokens.css。</p></div>' + statusLabel("verified") + '</div>',
      '<div class="foundation-summary"><div><strong>' + D.tokens.length + '</strong><span>已登记 Token</span></div><div><strong>' + D.foundationReviews.length + ' / ' + D.foundationReviews.length + '</strong><span>基础截图已复核</span></div><div><strong>' + exact + '</strong><span>exact</span></div><div><strong>' + observed + '</strong><span>observed</span></div><div><strong>F-17</strong><span>唯一颜色真相</span></div><div><strong>' + provisional + '</strong><span>推断 / provisional</span></div></div>',
      '<nav class="foundation-nav" aria-label="Foundations 目录">' + nav + '</nav>',
      renderFoundationReviews(),
      renderFoundationConflicts(),
      groups,
      iconDiagnostic(),
      renderIconFoundation()
    ].join("");
  }

  function renderFoundationCategory(category) {
    var items = D.tokens.filter(function (token) { return token.category === category; });
    var groups = Array.from(new Set(items.map(function (token) { return token.group; })));
    var content = groups.map(function (group) {
      var groupItems = items.filter(function (token) { return token.group === group; });
      return '<div class="foundation-group"><div class="foundation-group-head"><div><h4>' + escapeHtml(group) + '</h4><span>' + groupItems.length + ' 项</span></div><span class="caption">' + escapeHtml(groupItems[0].source) + '</span></div><div class="token-grid is-' + foundationClass(category) + '">' + groupItems.map(renderToken).join("") + '</div></div>';
    }).join("");
    var guide = category === "布局"
      ? renderNavigationSizingFoundation()
      : category === "字体"
        ? renderTypographyUsageFoundation()
        : "";
    return '<section id="foundation-' + encodeURIComponent(category) + '" class="section foundation-section"><div class="section-header"><div><h3>' + escapeHtml(category) + '</h3><p class="caption">' + items.length + ' tokens · 按源图分组，不混合展示</p></div><span class="status" data-status="verified">reviewed</span></div><div class="section-body">' + guide + content + '</div></section>';
  }

  function renderTypographyUsageFoundation() {
    var guide = D.typographyUsageGuide;
    var rules = guide.rules.map(function (rule) {
      return '<article class="foundation-type-rule"><span>' + escapeHtml(rule.label) + '</span><strong>' + escapeHtml(rule.value) + '</strong><code>' + escapeHtml(rule.token) + '</code><p>' + escapeHtml(rule.detail) + '</p></article>';
    }).join("");
    return '<section class="foundation-type-guide" aria-labelledby="foundation-type-guide-title"><div class="foundation-type-guide-head"><div><h4 id="foundation-type-guide-title">' + escapeHtml(guide.title) + '</h4><p>' + escapeHtml(guide.description) + '</p></div><span class="status" data-status="verified">F-10 / F-19</span></div><div class="foundation-type-rules">' + rules + '</div></section>';
  }

  function renderNavigationSizingFoundation() {
    var model = D.navigationSizingModel;
    var ranges = model.types.map(function (item) {
      return '<article class="foundation-nav-range"><span>' + escapeHtml(item.name) + '</span><strong>' + item.min + '–' + item.max + 'px</strong><small>推荐起点 ' + item.preferred + 'px · ' + escapeHtml(item.behavior) + '</small></article>';
    }).join("");
    return '<section class="foundation-layout-guide" id="foundation-navigation-sizing"><div class="foundation-layout-guide-head"><div><h4>导航尺寸与 Layouts 同源</h4><p>' + escapeHtml(model.note) + '</p></div><a class="b2b-button is-text" href="layouts.html#navigation-sizing">查看布局示例</a></div><div class="foundation-layout-formula"><span>组件计算</span><code>' + escapeHtml(model.formula) + '</code><small>' + escapeHtml(model.contentFormula) + '</small></div><div class="foundation-nav-ranges">' + ranges + '</div><p class="foundation-layout-collapse"><strong>收起顺序：</strong>' + escapeHtml(model.collapse) + '</p></section>';
  }

  function foundationClass(category) {
    var classes = { "颜色": "color", "字体": "type", "间距": "space", "圆角": "radius", "阴影": "shadow", "密度": "density" };
    return classes[category] || "generic";
  }

  function renderFoundationReviews() {
    var rows = D.foundationReviews.map(function (review) {
      return '<button class="foundation-review" data-inspect-evidence="' + review.id + '"><span class="mono">' + review.id + '</span><span>' + escapeHtml(review.conclusion) + '</span><span class="status" data-status="verified">reviewed</span></button>';
    }).join("");
    return '<section class="section"><div class="section-header"><div><h3>逐图复核清单</h3><p class="caption">仅展示当前实际存在的基础规范图；点击可查看原图</p></div><span class="caption">' + D.foundationReviews.length + ' / ' + D.foundationReviews.length + '</span></div><div class="section-body"><div class="foundation-review-grid">' + rows + '</div></div></section>';
  }

  function renderFoundationConflicts() {
    if (!D.foundationConflicts.length) return "";
    var cards = D.foundationConflicts.map(function (item) {
      return '<article class="foundation-conflict"><div><span class="status" data-status="conflict">conflict</span><h4>' + escapeHtml(item.title) + '</h4></div><dl><dt>证据</dt><dd class="mono">' + escapeHtml(item.sources) + '</dd><dt>差异</dt><dd>' + escapeHtml(item.alternatives) + '</dd><dt>采用</dt><dd>' + escapeHtml(item.decision) + '</dd></dl></article>';
    }).join("");
    return '<section class="section"><div class="section-header"><div><h3>来源冲突与裁决</h3><p class="caption">冲突不被隐藏；实现值遵循 master → semantic → component 优先级</p></div><span class="caption">' + D.foundationConflicts.length + ' 项</span></div><div class="section-body"><div class="foundation-conflict-grid">' + cards + '</div></div></section>';
  }

  function renderIconFoundation() {
    var axes = Object.keys(D.icons.supportedAxes).map(function (key) {
      var axis = D.icons.supportedAxes[key];
      return '<tr><td class="mono">' + key + '</td><td>' + axis.min + '—' + axis.max + '</td><td>' + escapeHtml(axis.usage) + '</td></tr>';
    }).join("");
    var samples = D.icons.registry.map(function (icon) {
      return '<button class="icon-sample" data-icon-sample aria-pressed="false" title="点击切换 Fill"><span class="b2b-icon" aria-hidden="true">' + escapeHtml(icon.name) + '</span><span>' + escapeHtml(icon.role) + '</span><small class="mono">' + escapeHtml(icon.name) + '</small></button>';
    }).join("");
    return '<section class="section"><div class="section-header"><h3>图标 / Material Symbols</h3><span class="caption">' + D.icons.registry.length + ' semantic icons · ' + statusLabel(D.iconStatus === "available" ? "verified" : "conflict") + '</span></div><div class="section-body"><div class="layout-grid"><div><h4>默认配置</h4><dl class="contract-list"><dt>字体</dt><dd>' + escapeHtml(D.icons.family) + '</dd><dt>风格</dt><dd>Outlined</dd><dt>默认轴</dt><dd class="mono">FILL 0 · wght 400 · GRAD 0 · opsz 20</dd><dt>许可证</dt><dd>' + D.icons.license + '</dd></dl></div><div class="b2b-table-wrap"><table class="b2b-table"><thead><tr><th>Axis</th><th>范围</th><th>用途</th></tr></thead><tbody>' + axes + '</tbody></table></div></div><h4 style="margin:var(--b2b-space-6) 0 var(--b2b-space-3)">语义图标表</h4><p class="caption" style="margin-bottom:var(--b2b-space-3)">点击图标标本可切换 FILL 0 / 1；这是状态演示，不改变语义映射。</p><div class="icon-registry">' + samples + '</div><h4 style="margin:var(--b2b-space-6) 0 var(--b2b-space-3)">使用规则</h4><ol>' + D.icons.rules.map(function (rule) { return '<li>' + escapeHtml(rule) + '</li>'; }).join("") + '</ol></div></section>';
  }

  function renderToken(token) {
    var preview = renderTokenPreview(token);
    return '<button class="token-row token-card" data-inspect-token="' + escapeHtml(token.key) + '">' + preview + '<span class="token-copy"><span class="token-title"><strong>' + escapeHtml(token.key) + '</strong>' + statusLabel(token.confidence) + '</span><code>' + escapeHtml(token.value) + '</code><small class="mono">' + escapeHtml(token.css) + '</small><span class="token-usage">' + escapeHtml(token.usage) + '</span><span class="token-source">' + escapeHtml(token.tier) + ' · ' + escapeHtml(token.source) + '</span></span></button>';
  }

  function renderTokenPreview(token) {
    var cssVar = token.css.indexOf("--b2b-") === 0 ? "var(" + token.css + ")" : "";
    if (token.category === "颜色") return '<span class="token-preview is-color"><i style="background:' + (cssVar || escapeHtml(token.value)) + '"></i></span>';
    if (token.category === "字体" && token.key.indexOf("type.") === 0) return '<span class="token-preview is-type" style="font:' + cssVar + '">永 Aa</span>';
    if (token.category === "字体") return '<span class="token-preview is-type is-base">永 Aa</span>';
    if (token.category === "间距") return '<span class="token-preview is-space"><i style="width:' + cssVar + '"></i><em>' + escapeHtml(token.value) + '</em></span>';
    if (token.category === "圆角") return '<span class="token-preview is-radius"><i style="border-radius:' + cssVar + '"></i></span>';
    if (token.category === "阴影") return '<span class="token-preview is-shadow"><i style="box-shadow:' + cssVar + '"></i></span>';
    if (token.category === "密度") return '<span class="token-preview is-density"><i style="height:' + cssVar + '"></i></span>';
    return '<span class="token-preview is-generic"><i></i></span>';
  }


  D.registerPage("foundations", {
    render: renderFoundations,
    mount: function mount(root) {
      root.innerHTML = renderFoundations();
      return function unmount() {};
    }
  });
})();
