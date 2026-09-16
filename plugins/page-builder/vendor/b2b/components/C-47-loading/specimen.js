(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var button = H.button;
    var avatarSpec = H.avatarSpec;
    var emptyStateSpec = H.emptyStateSpec;
    var loadingSpin = H.loadingSpin;
    var loadingSkeleton = H.loadingSkeleton;
    var illustrationLoading = H.illustrationLoading;
        return row("使用规则", [
          cell("页面开始加载即显示", loadingSkeleton({ image: true })),
          cell("延迟显示 · 建议 ≥ 1000ms", '<div class="loading-delay-demo"><button class="b2b-button is-primary" type="button" data-loading-delay>触发延迟加载</button><span data-loading-delay-result hidden>' + loadingSpin({ text: "Loading…" }) + "</span></div>")
        ], "延迟时间内加载完成则不显示加载态，避免瞬时闪烁") + row("组成要素", [
          cell("1 · 加载动效", '<div class="loading-type-row">' + loadingSkeleton({}) + illustrationLoading() + loadingSpin({ text: false }) + "</div>"),
          cell("2 · 描述（可选）", loadingSpin({ text: "Loading…", layout: "vertical" }))
        ]) + row("控件类型 · 类型总览", [
          cell("骨架屏", loadingSkeleton({ image: true })),
          cell("插画加载", illustrationLoading("Loading…")),
          cell("Spin 加载", loadingSpin({ text: "Description Copy", layout: "vertical" }))
        ], "可预估内容优先骨架屏；品牌或未知页面使用插画；小型局部切换使用 Spin") + row("骨架屏 · 使用场景", [
          cell("头像 + 文本", loadingSkeleton({ layout: "profile" })),
          cell("图片 + 文本", loadingSkeleton({ avatar: false, image: true, layout: "card" })),
          cell("复杂页面 · 适当精简", '<div class="skeleton-page-demo">' + loadingSkeleton({ image: true }) + loadingSkeleton({ avatar: false }) + loadingSkeleton({ avatar: false }) + "</div>"),
          cell("渐进式加载", '<div class="skeleton-progressive"><article><strong>Loaded module</strong><p>真实内容立即显示</p></article>' + loadingSkeleton({ avatar: false }) + "</div>")
        ], "仅用于初始空页面；按模块加载，完成的模块立即显示") + row("骨架屏 · 设计规则", [
          cell("头像骨架 · 尺寸/形状/位置一致", '<div class="skeleton-avatar-row">' + avatarSpec({ text: "A", size: 40 }) + '<i class="skeleton-avatar"></i></div>'),
          cell("图片骨架 · 比例一致", '<div class="skeleton-image-compare"><span>Real image area</span><i class="skeleton-image"></i></div>'),
          cell("文本骨架 · 高度随字号", '<div class="skeleton-text-sizes"><i style="--skeleton-text-height:12px"></i><i style="--skeleton-text-height:14px"></i><i style="--skeleton-text-height:16px"></i></div>')
        ], "N900 5% → N900 8% 渐变；文本骨架圆角 Radius-XS 2px") + row("骨架屏 · 注意事项", [
          cell("正确 · 固定重复元素使用骨架", '<div class="loading-practice">' + loadingSkeleton({}) + loadingSkeleton({}) + "</div>"),
          cell("避免 · 一个页面固定出现多个 Spin", '<div class="loading-practice is-avoid">' + loadingSpin({ text: false }) + loadingSpin({ text: false }) + loadingSpin({ text: false }) + loadingSpin({ text: false }) + "</div>"),
          cell("正确 · 执行中使用 Spin", '<div class="loading-practice">' + button("Perform load", "is-primary", "disabled", "progress_activity") + "</div>"),
          cell("正确 · 骨架屏仅用于初始空页面", '<div class="loading-practice">' + loadingSkeleton({ image: true }) + "</div>")
        ]) + row("插画加载", [
          cell("动效 · 125 × 125px", illustrationLoading("Loading…")),
          cell("描述 · 14px Regular / N600", illustrationLoading("Description Copy")),
          cell("描述最大宽 · 250px", '<div class="illustration-max-copy">' + illustrationLoading("Loading description copy should remain within two times the illustration width.") + "</div>"),
          cell("客户端 · 容器上下左右居中", '<div class="illustration-position-demo">' + illustrationLoading("Loading…") + "</div>"),
          cell("网页有表头 · 顶部 80px", '<div class="illustration-position-demo is-web has-head">' + illustrationLoading("Loading…") + "</div>"),
          cell("网页无表头 · 顶部 160px", '<div class="illustration-position-demo is-web">' + illustrationLoading("Loading…") + "</div>")
        ]) + row("Spin 加载 · 尺寸与布局", [
          cell("Small · 14px", loadingSpin({ size: "small", text: false })),
          cell("Medium · 24px", loadingSpin({ size: "medium", text: "Description Copy", layout: "horizontal" })),
          cell("Large · 40px", loadingSpin({ size: "large", text: "Description Copy", layout: "vertical" })),
          cell("局部窄高 · 横向排版", loadingSpin({ size: "small", text: "Loading…", layout: "horizontal" })),
          cell("全局 · 容器居中", '<div class="spin-center-demo">' + loadingSpin({ size: "large", text: "Loading…", layout: "vertical" }) + "</div>")
        ], "通常 B500；深色背景 N00；灰色图片占位符上 N400") + row("蒙层加载", [
          cell("白色蒙层 · N00 60%", '<div class="source-loading-overlay"><div>' + loadingSkeleton({}) + '</div><span>' + loadingSpin({ size: "large", text: false }) + "</span></div>"),
          cell("保留区域轮廓", '<div class="source-loading-overlay"><div class="loading-table-lines"><i></i><i></i><i></i></div><span>' + loadingSpin({ text: "Loading…" }) + "</span></div>")
        ]) + row("图片 Loading 场景适配规则", [
          cell("可获尺寸 · 自适应 / 最小 48px", '<div class="image-loading-demo is-auto">' + loadingSpin({ size: "medium", text: false, neutral: true }) + "</div>"),
          cell("未知尺寸 · 默认 180 × 120px", '<div class="image-loading-demo">' + loadingSpin({ size: "medium", text: false, neutral: true }) + "</div>"),
          cell("占位符 N200 + Spin 24px N400", '<div class="image-loading-demo">' + loadingSpin({ size: "medium", text: false, neutral: true }) + "</div>")
        ]) + row("其他组件的加载态", [
          cell("文字按钮", button("Text button", "is-text", "disabled", "progress_activity")),
          cell("主按钮", button("Main button", "is-primary", "disabled", "progress_activity")),
          cell("全局提示", '<div class="toast-spec">' + icon("progress_activity") + '<span>This is a global prompt for a message</span></div>')
        ]) + row("状态冲突", [
          cell("正确 · 只显示加载提示", '<div class="loading-practice">' + loadingSpin({ size: "large", text: "Loading…" }) + "</div>"),
          cell("避免 · 加载提示和空状态同时出现", '<div class="loading-practice is-avoid">' + loadingSpin({ text: false }) + emptyStateSpec({ type: "no-data", title: "Couldn't load" }) + "</div>")
        ]);
  }

  D.registerComponent("C-47", { renderSpecimen: renderSpecimen });
})();
