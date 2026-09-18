(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;
  var dynamicVisibleCount = 20;
  var dynamicLoading = false;
  var dynamicLoadTimer = 0;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var button = H.button;
    var contextMenuSpecimen = H.contextMenuSpecimen;
    var popupButton = H.popupButton;
    var sourceDropdownMenu = H.sourceDropdownMenu;
    var menu = H.menu;
    var dropdown = H.dropdown;
	        return row("组成要素", [
	          cell("触发区域 / 菜单容器 / 菜单项", '<div class="menu-anatomy"><button class="b2b-button is-icon is-subtle" aria-label="更多操作">' + icon("more_horiz") + '</button><div class="demo-menu is-static" role="menu"><button class="demo-menu-item is-state-hover"><span>Option 1</span></button><button class="demo-menu-item"><span>Option 2</span></button><button class="demo-menu-item"><span>Option 3</span></button></div></div>'),
	          cell("级联箭头 / 子菜单", '<div class="menu-anatomy"><button class="b2b-button is-icon is-subtle" aria-label="更多操作">' + icon("more_horiz") + '</button><div class="demo-menu is-static has-submenu" role="menu"><button class="demo-menu-item"><span>Option 1</span></button><div class="demo-menu-item has-child is-state-hover" role="menuitem" tabindex="0"><span>Option 2</span>' + icon("chevron_right") + '<span class="demo-menu submenu-panel is-force-open" role="menu"><button class="demo-menu-item">Option 1</button><button class="demo-menu-item">Option 2</button><button class="demo-menu-item">Option 3</button></span></div><button class="demo-menu-item"><span>Option 3</span></button></div></div>')
	        ], "标注只用于解释结构，不进入实际组件内容") + row("通用变体", [
	          cell("Basic drop-down menu", '<div class="demo-menu is-static" role="menu"><button class="demo-menu-item">Option 1</button><button class="demo-menu-item">Option 2</button><button class="demo-menu-item">Option 3</button><button class="demo-menu-item">Option 4</button></div>'),
	          cell("Drop-down menu with icon", '<div class="demo-menu is-static" role="menu"><button class="demo-menu-item"><span class="menu-item-main">' + icon("content_copy") + '<span>Option 1</span></span></button><button class="demo-menu-item"><span class="menu-item-main">' + icon("drive_file_move") + '<span>Option 2</span></span></button><button class="demo-menu-item"><span class="menu-item-main">' + icon("download") + '<span>Option 3</span></span></button></div>'),
	          cell("Auxiliary content", '<div class="demo-menu is-static is-wide" role="menu"><button class="demo-menu-item"><span class="menu-item-main">' + icon("functions") + '<span>Scientific counting</span></span><small>1.02E + 3%</small></button><button class="demo-menu-item"><span class="menu-item-main">' + icon("percent") + '<span>Percentage</span></span><small>38%</small></button></div>'),
	          cell("Selected", '<div class="demo-menu is-static" role="menu"><button class="demo-menu-item">Option 1</button><button class="demo-menu-item is-selected"><span>Option 2</span>' + icon("check") + '</button><button class="demo-menu-item">Option 3</button></div>'),
	          cell("Icon button", '<div class="demo-menu is-static" role="menu"><button class="demo-menu-item"><span class="menu-item-main">' + icon("add_circle", "is-success") + '<span>Option 1</span></span></button><button class="demo-menu-item"><span class="menu-item-main">' + icon("table_view", "is-purple") + '<span>Option 2</span></span></button><button class="demo-menu-item"><span class="menu-item-main">' + icon("delete", "is-danger") + '<span>Option 3</span></span></button></div>')
	        ], "变体名称与源图保持一致，图标仅用于强调识别或不可逆操作") + row("基础下拉菜单", [
	          cell("Click · 点击开合", dropdown(popupButton("操作", "", 'data-popup-trigger aria-haspopup="menu" aria-expanded="false"'), ["复制", "移动", "导出", "删除"], "", false)),
	          cell("Hover · 即时展开", dropdown(popupButton("视图", "", 'data-popup-trigger data-popup-hover aria-haspopup="menu" aria-expanded="false"'), ["紧凑视图", "标准视图", "舒适视图"], "is-hover-trigger", false)),
	          cell("Expanded · 外部点击 / Escape 收起", dropdown(popupButton("更多", "", 'data-popup-trigger aria-haspopup="menu" aria-expanded="true"', "more_horiz"), ["新建", "移动到", "导出"], "", true))
	        ], "触发区与菜单间距 4px；展开/收起不推动周围布局") + row("包含级联菜单", [
	          cell("子级向右展开", sourceDropdownMenu({ variant: "级联菜单", static: true, componentReference: false, items: ["Find and replace", "Create a copy", { label: "Export as", hover: true, children: ["PDF", "Word", "Image"] }, "Print"] })),
	          cell("父级顶部与子级顶部对齐", sourceDropdownMenu({ variant: "级联菜单", static: true, componentReference: false, items: ["Set alias", { label: "Sort", hover: true, children: [{ label: "Default", selected: true }, "Descending order", "Ascending order"] }, { label: "Delete", danger: true }] }))
	        ], "有明确从属关系时使用；级联层级不宜超过三层，同层建议不超过 13 项") + row("包含辅助标题", [
	          cell("触发区不足以说明菜单时", sourceDropdownMenu({ variant: "辅助标题", title: "Operation", static: true, componentReference: false, items: [{ label: "Cut", icon: "content_cut", iconClass: "is-success" }, { label: "Copy", icon: "content_copy", iconClass: "is-purple" }, { label: "Delete", icon: "delete", iconClass: "is-danger" }, { divider: true }, { label: "Add below", icon: "add_box" }] }))
	        ], "辅助标题尽量简洁且不超过一行；只在触发区语义不清时使用") + row("包含分组", [
	          cell("通栏分隔线", sourceDropdownMenu({ variant: "分组", static: true, componentReference: false, items: ["Find and replace", { divider: true }, "Document information", "Bio history", "Historical review", { divider: true }, { label: "Delete", danger: true }] })),
	          cell("语义分组", sourceDropdownMenu({ variant: "分组", static: true, componentReference: false, items: [{ label: "编辑", icon: "edit" }, { label: "复制", icon: "content_copy" }, { divider: true }, { label: "移动到", icon: "drive_file_move" }, { label: "删除", icon: "delete", danger: true }] }))
	        ], "分组只使用通栏分隔线，不增加结构标题") + row("动态下拉菜单", [
	          cell("滚动加载", sourceDropdownMenu({ variant: "动态菜单", static: true, scroll: true, componentReference: false, items: [1,2,3,4,5,6,7,8].map(function (n) { return "Option " + n; }) })),
	          cell("加载状态", sourceDropdownMenu({ variant: "动态菜单", static: true, scroll: true, componentReference: false, items: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(function (n) { return "Option " + n; }).concat([{ loading: "加载中" }]) }))
	        ], "动态菜单滚动到底后异步加载，不渲染 More；列表仍遵循 480px 最大高度并在菜单内滚动") + row("独立创建菜单", [
	          cell("列表底部 + Create", sourceDropdownMenu({ variant: "创建菜单", static: true, componentReference: false, items: ["Option 1", "Option 2", "Option 3", "Option 4", { divider: true }, { label: "Create", icon: "add", action: true }] }))
	        ], "创建动作是独立变体，末项复用 canonical action row 与 add 图标") + row("菜单项包含复杂信息", [
	          cell("图标 + 标题 + 辅助信息", sourceDropdownMenu({ variant: "复杂信息菜单项", static: true, componentReference: false, items: [{ label: "Option 1", icon: "description", strong: true, description: "Auxiliary information" }, { label: "Option 2", icon: "task_alt", iconClass: "is-success", strong: true, description: "Describe the result of this action" }, { label: "Option 3", icon: "delete", iconClass: "is-danger", strong: true, description: "Irreversible operation" }] })),
	          cell("长辅助文本换行", sourceDropdownMenu({ variant: "复杂信息菜单项", static: true, wide: true, componentReference: false, items: [{ label: "Option 1", icon: "description", strong: true, hover: true, description: "This is a very long auxiliary description. When information cannot be shown completely, prefer a concise expression or allow controlled wrapping." }, { label: "Option 2", icon: "task_alt", iconClass: "is-success", strong: true, description: "Auxiliary information" }] }))
	        ], "元素间距遵循 4N；同一层图标建议不超过 7 个，强调重要操作时才使用颜色") + row("上下文菜单", [
	          cell("鼠标右键触发", contextMenuSpecimen())
	        ], "触发元素通常不是固定控件；优先向右下展开，底部空间不足时保持与页面底部 16px 安全距离") + row("通用样式规则 · 尺寸说明", [
	          cell("Medium 中型 · 32px", sourceDropdownMenu({ variant: "基础下拉菜单", size: "medium", static: true, componentReference: false, items: [{ label: "Option 1", icon: "content_copy" }, { label: "Option 2", icon: "content_copy" }, { label: "Option 3", icon: "content_copy" }] })),
	          cell("XLarge 超大 · 40px", sourceDropdownMenu({ variant: "基础下拉菜单", size: "xlarge", static: true, componentReference: false, items: [{ label: "Option 1", icon: "content_copy" }, { label: "Option 2", icon: "content_copy" }, { label: "Option 3", icon: "content_copy" }] })),
	          cell("多行内容自适应", '<div class="demo-menu is-static is-complex" role="menu"><button class="demo-menu-item"><span class="menu-item-main">' + icon("description") + '<span><strong>Option 1</strong><small>Auxiliary information</small></span></span></button><button class="demo-menu-item"><span class="menu-item-main">' + icon("description") + '<span><strong>Option 2</strong><small>Auxiliary information</small></span></span></button></div>')
	        ], "五档触发器与菜单项按 24/28/32/36/40px 语义尺寸调整；菜单面板上下 padding 8px、左右 padding 4px") + row("下拉菜单尺寸", [
	          cell("内容间距", '<div class="menu-size-ledger"><div><strong>4px</strong><span>触发区与菜单</span></div><div><strong>8px</strong><span>菜单内容距上下</span></div><div><strong>4px</strong><span>分隔线距选项</span></div><div><strong>0</strong><span>父级与子级边缘</span></div></div>'),
	          cell("宽度 · 55–420px", '<div class="menu-width-demo"><div class="demo-menu is-static is-min-width" role="menu"><button class="demo-menu-item">编辑</button><button class="demo-menu-item">删除</button></div><div class="demo-menu is-static is-wide" role="menu"><button class="demo-menu-item">显示完整名称的菜单操作</button><button class="demo-menu-item" disabled>超出 420px 后才允许省略</button></div></div>'),
	          cell("高度 · 最大 480px", '<div class="demo-menu is-static is-scroll-source" role="menu">' + [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(function (n) { return '<button class="demo-menu-item">Option ' + n + '</button>'; }).join("") + '</div>')
	        ], "列表圆角 Radius-S，投影 shadow-M-down；宽度按内容自适应，也可按业务设为 4 的倍数") + row("最小宽度", [
	          cell("EN / CN 均不挤压操作", '<div class="menu-language-demo"><div><strong>EN</strong>' + popupButton("Text button", "is-text", 'type="button" aria-haspopup="menu" aria-expanded="true"') + '<div class="demo-menu is-static is-min-width"><button class="demo-menu-item is-state-hover">Edit</button><button class="demo-menu-item">Delete</button></div></div><div><strong>CN</strong>' + popupButton("文字按钮", "is-text", 'type="button" aria-haspopup="menu" aria-expanded="true"') + '<div class="demo-menu is-static is-min-width"><button class="demo-menu-item is-state-hover">编辑</button><button class="demo-menu-item">删除</button></div></div></div>')
	        ], "优化后的 Dropdown 最小宽度为 55px，设定最小宽度后仍保留根据内容扩展的能力") + row("场景说明", [
	          cell("正确 · 设定最小宽度后仍可扩展", '<div class="menu-practice is-correct"><div class="menu-language-demo"><div>' + popupButton("Edit", "is-text", 'type="button" aria-haspopup="menu" aria-expanded="true"') + '<div class="demo-menu is-static is-min-width"><button class="demo-menu-item is-selected"><span>Edit</span>' + icon("check") + '</button><button class="demo-menu-item">Delete</button></div></div><div>' + popupButton("编辑", "is-text", 'type="button" aria-haspopup="menu" aria-expanded="true"') + '<div class="demo-menu is-static is-min-width"><button class="demo-menu-item is-selected"><span>编辑</span>' + icon("check") + '</button><button class="demo-menu-item">删除</button></div></div></div><span class="practice-line"></span><p>操作名称保持完整。</p></div>'),
	          cell("避免 · 固定窄宽造成省略", '<div class="menu-practice is-avoid"><div class="menu-language-demo"><div>' + popupButton("Edit", "is-text", 'type="button" aria-haspopup="menu" aria-expanded="true"') + '<div class="demo-menu is-static is-clipped"><button class="demo-menu-item is-selected"><span>Edit</span>' + icon("check") + '</button><button class="demo-menu-item">Delete</button></div></div><div>' + popupButton("编辑", "is-text", 'type="button" aria-haspopup="menu" aria-expanded="true"') + '<div class="demo-menu is-static is-clipped"><button class="demo-menu-item is-selected"><span>编…</span>' + icon("check") + '</button><button class="demo-menu-item">删除</button></div></div></div><span class="practice-line"></span><p>固定最大窄宽会造成重要操作被省略。</p></div>')
	        ], "只使用最小宽度作为下限，不把它误用为固定宽度") + row("位置说明", [
	          cell("常规对齐和自动翻转", '<div class="menu-position-grid"><div><i></i><div class="demo-menu is-static"><button class="demo-menu-item">Option 1</button><button class="demo-menu-item">Option 2</button><button class="demo-menu-item">Option 3</button></div></div><div class="is-align-end"><i></i><div class="demo-menu is-static"><button class="demo-menu-item">Option 1</button><button class="demo-menu-item">Option 2</button><button class="demo-menu-item">Option 3</button></div></div><div class="is-open-up"><div class="demo-menu is-static"><button class="demo-menu-item">Option 1</button><button class="demo-menu-item">Option 2</button><button class="demo-menu-item">Option 3</button></div><i></i></div><div class="is-open-up is-align-end"><div class="demo-menu is-static"><button class="demo-menu-item">Option 1</button><button class="demo-menu-item">Option 2</button><button class="demo-menu-item">Option 3</button></div><i></i></div></div>')
	        ], "优先与触发区左对齐向下展开；遮挡时可改为右对齐或向上，与页面边缘保持 16px 安全距离") + row("交互说明", [
	          cell("Normal / Hover / Selected / Disabled", '<div class="menu-state-list"><div><span>Normal</span><button class="demo-menu-item">Option 1</button></div><div><span>Hover</span><button class="demo-menu-item is-state-hover">Option 1</button></div><div><span>Selected</span><button class="demo-menu-item is-selected"><span>Option 1</span>' + icon("check") + '</button></div><div><span>Disabled</span><button class="demo-menu-item" disabled>Option 1</button></div></div>'),
	          cell("Loading", '<div class="menu-loading-demo"><button class="b2b-button is-icon is-subtle" aria-label="加载中">' + icon("progress_activity", "button-spinner") + '</button><div class="demo-menu is-static"><div class="menu-loading-row" role="status" aria-label="正在加载">' + icon("progress_activity", "button-spinner") + '<span aria-hidden="true">加载中</span></div></div></div>'),
	          cell("Cascade menu", sourceDropdownMenu({ variant: "级联菜单", static: true, componentReference: false, items: ["Option 1", { label: "Option 2", hover: true, children: ["Option 1", { label: "Option 2", hover: true, children: ["Option 1", "Option 2"] }, "Option 3"] }, "Option 3"] }))
	        ], "Hover 触发即时展开，移出或命令执行后收起；加载中保持触发区与菜单宽度稳定") + row("触发菜单项", [
	          cell("左侧图标按钮", '<div class="menu-trigger-pair">' + dropdown(popupButton("Button", "", 'data-popup-trigger aria-haspopup="menu" aria-expanded="false"', "add"), ["Operation 1", "Operation 2"], "", false) + dropdown(popupButton("Button", "is-primary", 'data-popup-trigger aria-haspopup="menu" aria-expanded="true"', "add"), ["Operation 1", "Operation 2"], "", true) + '</div>'),
	          cell("右侧图标按钮", '<div class="menu-trigger-pair">' + dropdown(popupButton("Button", "", 'data-popup-trigger aria-haspopup="menu" aria-expanded="false"'), ["Operation 1", "Operation 2"], "", false) + dropdown(popupButton("Button", "is-primary", 'data-popup-trigger aria-haspopup="menu" aria-expanded="true"'), ["Operation 1", "Operation 2"], "", true) + '</div>'),
	          cell("文字按钮", '<div class="menu-trigger-pair">' + dropdown(popupButton("Text button", "is-text", 'data-popup-trigger aria-haspopup="menu" aria-expanded="false"'), ["Operation 1", "Operation 2"], "", false) + dropdown(popupButton("Text button", "is-text", 'data-popup-trigger aria-haspopup="menu" aria-expanded="true"'), ["Operation 1", "Operation 2"], "", true) + '</div>'),
	          cell("组合按钮下拉菜单", '<div class="menu-trigger-pair">' + dropdown('<div class="split-button">' + button("Button", "") + popupButton("", "", 'data-popup-trigger aria-haspopup="menu" aria-expanded="false"') + '</div>', ["Operation 1", "Operation 2"], "", false) + dropdown('<div class="split-button">' + button("Button", "is-primary") + popupButton("", "is-primary", 'data-popup-trigger aria-haspopup="menu" aria-expanded="true"') + '</div>', ["Operation 1", "Operation 2"], "", true) + '</div>')
	        ], "包含图标的触发菜单用于收起一组同类操作；组合按钮用于一个主操作与一组次要操作") + row("组件对比说明", [
	          cell("Dropdown", '<div class="comparison-tile"><strong>命令菜单</strong><p>点击后立即执行命令，触发区通常不回显结果。</p></div>'),
	          cell("Popover", '<div class="comparison-tile"><strong>复杂内容展示</strong><p>可承载图片、表单等更复杂内容。</p></div>'),
	          cell("Select", '<div class="comparison-tile"><strong>备选项选择</strong><p>选择结果通常回显在触发区域。</p></div>'),
	          cell("Cascader", '<div class="comparison-tile"><strong>层级数据选择</strong><p>选择结果回显完整路径，不用于命令执行。</p></div>')
	        ], "基于用户任务选择组件，不要用 Dropdown 代替复杂弹层或可回显选择器");
  }

  var A = D.componentApiDocs;
  var eventNames = ["b2b:menu-open", "b2b:menu-close", "b2b:menu-select", "b2b:menu-load-more", "b2b:submenu-open", "b2b:submenu-close"];
  var variantMeta = [
    { key: "basic", label: "基础下拉菜单", controlLabel: "Basic 基础", category: "即时操作", description: "用于触发一组即时命令，选择结果由独立的选择菜单变体表达。" },
    { key: "cascade", label: "级联菜单", controlLabel: "Cascade 级联", category: "层级与语义", description: "用于存在明确父子关系的命令；canonical interaction 统一鼠标、键盘、ARIA 与窄视口定位。" },
    { key: "title", label: "辅助标题", controlLabel: "Title 标题", category: "层级与语义", description: "当触发区不足以解释菜单语义时，在菜单顶部提供一行辅助标题。" },
    { key: "grouped", label: "分组", controlLabel: "Grouped 分组", category: "即时操作", description: "使用通栏分隔线组织多组命令，保留危险操作的视觉语义。" },
    { key: "dynamic", label: "动态菜单", controlLabel: "Dynamic 动态", category: "动态与上下文", description: "用于内容异步扩展；滚动到底后加载下一批，列表仍受 480px 最大高度约束。" },
    { key: "create", label: "创建菜单", controlLabel: "Create 创建", category: "即时操作", description: "独立表达列表底部的 + Create 动作，复用 canonical action row 与 add 图标。" },
    { key: "selection", label: "选择菜单", controlLabel: "Selection 选择", category: "即时操作", description: "独立表达含 selected/check 状态的单项选择菜单，不与动态加载或底部动作混合。" },
    { key: "complex", label: "复杂信息菜单项", controlLabel: "Complex 复杂", category: "动态与上下文", description: "菜单项可承载标题和辅助描述，并独立控制图标。" },
    { key: "context", label: "上下文菜单", controlLabel: "Context 上下文", category: "动态与上下文", description: "在指定区域通过右键打开，不创建常规触发按钮。" }
  ];

  function cloneItems(items) {
    return items.map(function (item) {
      var copy = Object.assign({}, item);
      if (item.children) copy.children = cloneItems(item.children);
      return copy;
    });
  }

  function baseItems(variant) {
    if (variant === "级联菜单") return [
      { label: "查找和替换" },
      { label: "创建副本" },
      { label: "导出为", children: [{ label: "PDF" }, { label: "Word" }, { label: "图片", children: [{ label: "PNG" }, { label: "JPEG" }] }] },
      { label: "打印" }
    ];
    if (variant === "辅助标题") return [
      { label: "剪切" },
      { label: "复制" },
      { divider: true },
      { label: "删除", danger: true }
    ];
    if (variant === "分组") return [
      { label: "编辑" },
      { label: "复制" },
      { divider: true },
      { label: "移动到" },
      { label: "删除", danger: true }
    ];
    if (variant === "动态菜单") return Array.from({ length: dynamicVisibleCount }, function (_, index) {
      return { label: "项目 " + (index + 1) };
    });
    if (variant === "创建菜单") return [
      { label: "项目一" },
      { label: "项目二" },
      { label: "项目三" },
      { label: "项目四" },
      { divider: true },
      { label: "创建项目", icon: "add", action: true }
    ];
    if (variant === "选择菜单") return [
      { label: "选项一" },
      { label: "选项二", selected: true },
      { label: "选项三" },
      { label: "选项四" },
      { label: "选项五" }
    ];
    if (variant === "复杂信息菜单项") return [
      { label: "复制文档", description: "创建当前文档的完整副本" },
      { label: "完成任务", description: "标记任务并通知相关成员" },
      { divider: true },
      { label: "删除文档", description: "此操作不可撤销", danger: true }
    ];
    if (variant === "上下文菜单") return [
      { label: "剪切" },
      { label: "复制" },
      { label: "粘贴" }
    ];
    return [
      { label: "复制" },
      { label: "移动" },
      { label: "导出" },
      { label: "删除", danger: true }
    ];
  }

  function decorateItems(items, selection) {
    var decorated = cloneItems(items);
    var actions = [];
    function visit(list) {
      list.forEach(function (item) {
        if (item.divider) return;
        actions.push(item);
        if (item.children) visit(item.children);
      });
    }
    visit(decorated);
    actions.forEach(function (item, index) {
      if (selection.icons === "on" && !item.icon) item.icon = index % 2 ? "content_copy" : "description";
    });
    var leaves = actions.filter(function (item) { return !item.children; });
    if (selection.auxiliary === "on" && leaves[0]) leaves[0].auxiliary = "⌘ C";
    if (selection.disabledItems === "on" && leaves[0]) leaves[0].disabled = true;
    if (selection.mode === "selection" && !actions.some(function (item) { return item.selected; })) {
      var selectable = actions.find(function (item) { return !item.disabled && !item.children; });
      if (selectable) selectable.selected = true;
    }
    return decorated;
  }

  function findVariant(name) {
    return variantMeta.find(function (item) { return item.label === name; });
  }

  function interactionCopy(selection) {
    if (selection.variant === "上下文菜单") return "在预览区域内右键打开；Escape 或选择命令后关闭，并核对焦点与 b2b:menu-* 事件。";
    if (selection.variant === "选择菜单") return "打开后选择单项，核对 option/aria-selected、主题色文字与勾选指示，以及单次 b2b:menu-select。";
    if (selection.variant === "创建菜单") return "打开后激活末尾 + 创建项目，核对 canonical action row、add 图标与单次 b2b:menu-select。";
    if (selection.variant === "动态菜单") return "滚动到菜单底部触发单次 b2b:menu-load-more；组件通过真实 update() 进入 loading 并异步追加 caller-owned 项目，保持宽度和新增项滚动锚点。";
    if (selection.triggerMode === "hover") return "移入触发区立即打开，移出后关闭；核对单次公开事件、无抖动与键盘路径。";
    if (selection.variant === "级联菜单") return "打开后可用鼠标逐级悬停；键盘使用 ArrowRight 打开并进入子菜单，ArrowLeft 关闭并把焦点退回父项；核对 aria-expanded、aria-hidden 与单次子菜单事件。";
    if (selection.mode === "selection") return "打开后选择菜单项，核对 aria-selected、选择指示与单次 b2b:menu-select。";
    if (selection.state === "loading") return "打开菜单检查 loading 状态、480px 内滚动与稳定宽度；仍可用 Escape 关闭。";
    return "点击或按 Enter / Space 打开；使用 ArrowUp / ArrowDown 导航，Escape 或外部点击关闭。";
  }

  function resolveSelection(selection) {
    var meta = findVariant(selection.variant);
    var isContext = selection.variant === "上下文菜单";
    var props = {
      variant: selection.variant,
      mode: selection.mode,
      triggerMode: isContext ? "click" : selection.triggerMode,
      size: selection.size,
      triggerLabel: isContext ? "在此区域右键" : "更多操作",
      triggerIcon: selection.icons === "on" && !isContext ? "add" : null,
      items: decorateItems(baseItems(selection.variant), selection),
      open: selection.open === "open"
    };
    var parameterKeys = ["variant", "mode", "triggerMode", "size", "triggerLabel"];
    if (!isContext) parameterKeys.push("triggerIcon");
    parameterKeys.push("items", "open");
    if (selection.variant === "动态菜单") {
      props.loading = selection.state === "loading";
      parameterKeys.push("loading");
    }
    if (selection.variant === "辅助标题") {
      props.title = "操作";
      parameterKeys.push("title");
    }
    return {
      category: meta.category,
      label: meta.label + " · " + ({ mini: "迷你", small: "小型", medium: "中型", large: "大型", xlarge: "超大" }[selection.size]),
      description: meta.description,
      interaction: interactionCopy(selection),
      props: props,
      parameterKeys: parameterKeys
    };
  }

  function selectionAllowed(selection) {
    if (selection.variant === "上下文菜单" && selection.triggerMode === "hover") return false;
    if ((selection.variant === "选择菜单") !== (selection.mode === "selection")) return false;
    if (selection.state === "loading" && selection.variant !== "动态菜单") return false;
    return true;
  }

  function invalidSelectionReason(selection) {
    if (selection.variant === "上下文菜单" && selection.triggerMode === "hover") return "上下文菜单只支持右键触发，不支持 hover triggerMode";
    if ((selection.variant === "选择菜单") !== (selection.mode === "selection")) return "选择菜单固定使用 selection mode，其余变体固定使用 action mode";
    if (selection.state === "loading" && selection.variant !== "动态菜单") return "loading 只适用于动态菜单";
    return "该组合不在 C-08 Renderer 的合法范围内";
  }

  var docsConfig = {
    id: "C-08",
    title: "Dropdown Menu 下拉菜单",
    introduction: "展示一组即时命令或轻量选择。九个 variant 保持结构语义；创建菜单独立承载主题色 + Create，动态菜单滚动到底后异步加载且不渲染 More；选择菜单独立承载主题色 selected/check 状态；分组只使用通栏分隔线。Renderer 负责 DOM、菜单状态、键盘、焦点、ARIA 和公开事件。",
    categories: [
      { name: "即时操作", description: "基础命令、单项选择与使用分隔线组织的操作。" },
      { name: "层级与语义", description: "处理父子级命令或用辅助标题补足菜单语义。" },
      { name: "动态与上下文", description: "覆盖加载中、长列表、复杂信息和区域右键操作。" }
    ],
    variants: variantMeta.map(function (item) { return Object.assign({}, item, { props: { variant: item.label } }); }),
    variantCoverage: variantMeta.map(function (item) { return item.label; }),
    controlGroups: [
      { key: "variant", label: "变体", options: variantMeta.map(function (item) { return { value: item.label, label: item.controlLabel }; }) },
      { key: "size", label: "尺寸", options: [{ value: "mini", label: "Mini 迷你" }, { value: "small", label: "Small 小型" }, { value: "medium", label: "Medium 中型" }, { value: "large", label: "Large 大型" }, { value: "xlarge", label: "XLarge 超大" }] },
      { key: "triggerMode", label: "触发方式", options: [{ value: "click", label: "Click 点击" }, { value: "hover", label: "Hover 悬停" }], note: "上下文菜单通过真实右键到达" },
      { key: "open", label: "展开状态", options: [{ value: "closed", label: "Closed 收起" }, { value: "open", label: "Open 展开" }], note: "焦点与悬停状态请直接操作组件" },
      { key: "mode", label: "菜单模式", options: [{ value: "action", label: "Action 操作" }, { value: "selection", label: "Selection 选择" }] },
      { key: "state", label: "加载状态", options: [{ value: "ready", label: "Ready 就绪" }, { value: "loading", label: "Loading 加载" }] },
      { key: "icons", label: "图标", options: [{ value: "off", label: "Off 无" }, { value: "on", label: "On 有" }] },
      { key: "disabledItems", label: "禁用项", options: [{ value: "off", label: "Off 无" }, { value: "on", label: "On 有" }] },
      { key: "auxiliary", label: "辅助信息", options: [{ value: "off", label: "Off 无" }, { value: "on", label: "On 有" }] }
    ],
    initialSelection: { variant: "基础下拉菜单", size: "medium", triggerMode: "click", open: "open", mode: "action", state: "ready", icons: "off", disabledItems: "off", auxiliary: "off" },
    normalizeSelection: function (selection, changedKey) {
      if (changedKey === "variant") selection.mode = selection.variant === "选择菜单" ? "selection" : "action";
      if (changedKey === "mode") selection.variant = selection.mode === "selection" ? "选择菜单" : (selection.variant === "选择菜单" ? "基础下拉菜单" : selection.variant);
      if (selection.variant !== "动态菜单") selection.state = "ready";
      return selection;
    },
    resolveSelection: resolveSelection,
    isSelectionAllowed: selectionAllowed,
    invalidSelectionReason: invalidSelectionReason,
    events: eventNames,
    slotSelector: "#c08-dropdown-menu-slot"
  };

  function hydrateApiBoundary(docs) {
    var paramsSection = docs.querySelector(".component-api-docs-params");
    if (!paramsSection) return;
    paramsSection.insertAdjacentHTML("beforeend", '<div class="c08-api-reference"><article><strong>公开事件</strong><p><code>b2b:menu-open</code>、<code>b2b:menu-close</code>、<code>b2b:menu-select</code>、<code>b2b:menu-load-more</code>、<code>b2b:submenu-open</code>、<code>b2b:submenu-close</code></p></article><article><strong>键盘与 ARIA</strong><p>Enter / Space / Escape / Tab / ArrowUp / ArrowDown / ArrowRight / ArrowLeft / Home / End；menu/menuitem 或 listbox/option、aria-expanded、aria-controls、aria-selected、aria-disabled、aria-hidden、aria-busy。</p></article><article><strong>三级菜单边界</strong><p>canonical interaction 同步子菜单状态与焦点，并在窄视口按可用空间向左翻转或约束到 8px 安全边界。</p></article></div>');
  }

  function bindDynamicLoadDemo(docs) {
    var host = docs.querySelector("[data-component-docs-mount]");
    if (!host) return;
    function syncLoadingControl(value) {
      docs.querySelectorAll('button[data-component-docs-control="state"]').forEach(function (button) {
        var active = button.dataset.componentDocsValue === value;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
    host.addEventListener("b2b:menu-load-more", function () {
      var state = docs._componentApiDocsState;
      if (!state || !state.instance || state.instance.destroyed || !state.selection || state.selection.variant !== "动态菜单" || dynamicLoading) return;
      dynamicLoading = true;
      state.selection.state = "loading";
      if (state.active && state.active.props) state.active.props.loading = true;
      syncLoadingControl("loading");
      state.instance.update({ loading: true });
      window.clearTimeout(dynamicLoadTimer);
      dynamicLoadTimer = window.setTimeout(function () {
        dynamicLoadTimer = 0;
        dynamicVisibleCount += 4;
        dynamicLoading = false;
        var current = docs._componentApiDocsState;
        if (!docs.isConnected || !current || !current.instance || current.instance.destroyed || !current.selection || current.selection.variant !== "动态菜单") return;
        current.selection.state = "ready";
        if (current.active && current.active.props) {
          current.active.props.loading = false;
          current.active.props.items = baseItems("动态菜单");
        }
        syncLoadingControl("ready");
        current.instance.update({ loading: false, items: baseItems("动态菜单") });
      }, 420);
    });
  }

  function mountSpecimen(scope) {
    var root = scope || document;
    if (root.closest && root.closest(".c08-c02-docs")) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-08"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-08"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    if (!A) return Promise.reject(new Error("C-08 showcase requires the shared Component API docs runtime"));
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-08"]');
    if (old) {
      A.destroy(old);
      old.remove();
    }
    preview.hidden = true;
    preview.replaceChildren();
    preview.insertAdjacentHTML("afterend", A.markup(docsConfig));
    var docs = preview.nextElementSibling;
    docs.querySelector("[data-component-docs-mount]").id = "c08-dropdown-menu-slot";
    hydrateApiBoundary(docs);
    return A.mount(docsConfig, docs).then(function (result) {
      bindDynamicLoadDemo(docs);
      return [result];
    });
  }

  document.addEventListener("b2b:specimens-rendered", function (event) {
    mountSpecimen(event.detail && event.detail.root ? event.detail.root : document);
  });
  D.registerComponent("C-08", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
