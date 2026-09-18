(function registerRendererContracts(global) {
  "use strict";
  var components = global.B2B = global.B2B || {};
  components = components.components = components.components || {};
  var contracts = {
    "C-01": {
      "id": "C-01",
      "name": "Button Overview",
      "purpose": "汇总所有按钮样式的适用场景与通用使用方式，具体规格引用 C-02 至 C-07。",
      "root": "button-principles",
      "anatomy": [
        "按钮样式引用",
        "适用场景",
        "选型指南",
        "层级与组合",
        "通用规则",
        "特殊类型"
      ],
      "variants": [
        "C-02 基础按钮",
        "C-03 文字按钮",
        "C-04 图标按钮",
        "C-05 全圆角按钮",
        "C-06 分裂与菜单按钮",
        "C-07 悬浮按钮",
        "选中前后强弱对照"
      ],
      "sizes": [
        "follow-referenced-component"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "selected",
        "focus",
        "loading",
        "disabled"
      ],
      "rules": "概述不提供独立 Renderer；API 示例通过现有 C-02 至 C-07 生产 API 组合，选型与尺寸读取 describeComponentFamily 和 describe；完整场景沿用 canonical source 布局并在同级 light DOM 展示，图片头像与标签由 C-32/C-42 生产 Renderer 负责；源状态按钮仍为场景示例，不能宣称整张场景已生产 API 化；同一区域只保留一个主按钮，同组样式不超过两种，文案完整且直接表达结果。选中态按功能引导强弱调整文案、颜色或图标，Hover 与 Pressed 沿用生效前按钮规律。",
      "tokens": [
        "button.*",
        "color.action.*",
        "control.height.*",
        "radius.control",
        "focus.ring",
        "motion.fast"
      ],
      "source": "C-01-button-overview/contract.js"
    },
    "C-02": {
      "id": "C-02",
      "name": "Button",
      "purpose": "触发立即动作并表达操作优先级。",
      "root": "button",
      "anatomy": [
        "文本",
        "图标（可选）",
        "按钮容器",
        "加载图标"
      ],
      "variants": [
        "primary",
        "danger",
        "secondary-blue",
        "secondary-danger",
        "secondary-gray"
      ],
      "sizes": [
        "mini",
        "small",
        "medium",
        "large",
        "xlarge"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "focus",
        "disabled",
        "loading"
      ],
      "rules": "primary 是主要按钮，danger 是主要危险按钮，secondary-blue 是蓝色次要按钮，secondary-danger 是次要危险按钮，secondary-gray 是灰色次要按钮。size 使用 mini/small/medium/large/xlarge，分别对应 24/28/32/36/40px，默认 medium（32px）；width 使用 default（内容自然宽度）或 long（填满 caller 容器，width:100%、min-width:0）。主色 #1456F0，Hover #3370FF，Active #0442D2；圆角继承全局 --b2b-radius-control，当前默认 6px 并随圆角主题切换；标签不换行。同一操作区只保留一个主按钮，危险按钮文案必须直接描述后果。",
      "tokens": [
        "button.background.*",
        "button.border.*",
        "button.text.*",
        "control.height.*"
      ],
      "source": "C-02-basic-button/contract.js"
    },
    "C-03": {
      "id": "C-03",
      "name": "Text Button",
      "purpose": "承载最低优先级行动、紧凑跳转和指定 URL 链接。",
      "root": "text-button",
      "anatomy": [
        "文本",
        "容器",
        "普通前置图标（可选）",
        "方向箭头或外部链接指示后置图标（可选）",
        "命中热区"
      ],
      "variants": [
        "Button_Text",
        "Button_Link",
        "Link"
      ],
      "sizes": [
        "content-hit-area",
        "text-hit-area"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "focus",
        "disabled"
      ],
      "rules": "Button_Text 默认无底色、交互显示背景且热区大于内容；Button_Link 仅改变文字状态；Link 是无前后图标的纯文字 URL 链接，Hover 显示下划线。图标与文字间距固定为 4px。Button_Text 与 Button_Link 的可选图标只能二选一：普通表意图标放在文字前，方向箭头或源码已证明的 open_in_new 指示放在文字后；箭头不得前置，普通图标不得后置。Disabled 不响应 Hover、Active 或 Focus 视觉。文字按钮组合以内容区形成 16px 视觉间距，实际容器间距 8px；标签不省略、不换行、不截断。",
      "tokens": [
        "button.text.*",
        "link.*",
        "inverse.link.*",
        "space.1",
        "space.2",
        "space.4",
        "focus.ring"
      ],
      "source": "C-03-text-button/contract.js"
    },
    "C-04": {
      "id": "C-04",
      "name": "Icon Button",
      "purpose": "在有限空间中使用常见且易识别的图标触发功能操作。",
      "root": "icon-button",
      "anatomy": [
        "背景容器",
        "表意图标",
        "可访问名称",
        "可选文本标签（Tooltip）"
      ],
      "variants": [
        "Button_Icon",
        "Outlined icon button",
        "icon group",
        "menu trigger"
      ],
      "sizes": [
        "24",
        "28",
        "32",
        "36",
        "40"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "focus",
        "expanded",
        "disabled"
      ],
      "rules": "五档尺寸与数值一一对应：mini=24px、small=28px、medium=32px（默认）、large=36px、xlarge=40px；图标视觉尺寸依次为 14/16/18/20/22px，由 Renderer/CSS 派生，调用方不得覆盖。Button_Icon 与 Outlined icon button 是动作按钮，不公开 selected；icon group 的选择只属于 items[].selected；菜单开闭由真实交互与 aria-expanded 派生，不公开瞬时 expanded prop。默认提供 Tooltip；只有包含组件已有清晰语境且继续保留 aria-label 时可关闭可见 Tooltip，例如 Dialog 关闭按钮。菜单展开后触发按钮保持强调视觉。",
      "tokens": [
        "button.icon.*",
        "icon.size.*",
        "tooltip.inverse.*",
        "menu.*",
        "control.height.*",
        "space.2",
        "space.3"
      ],
      "source": "C-04-icon-button/contract.js"
    },
    "C-05": {
      "id": "C-05",
      "name": "Rounded Button",
      "purpose": "仅用于产品活动营销、产品销售官网、社区/内容运营三类营销场景。",
      "root": "pill-button",
      "anatomy": [
        "文本",
        "前置普通功能图标（可选）",
        "后置 chevron_right（可选）",
        "全圆角容器",
        "加载图标"
      ],
      "variants": [
        "Primary",
        "Secondary-Primary",
        "Outlined"
      ],
      "sizes": [
        "mini",
        "small",
        "medium",
        "large",
        "xlarge"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "focus",
        "disabled",
        "loading"
      ],
      "rules": "Button_Round 是营销按钮，提供 Primary 蓝色实心、Secondary-Primary 蓝色描边与 Outlined 灰色描边白底外观。size 为 mini/small/medium/large/xlarge，分别对应 24/28/32/36/40px，默认 medium。width 只接受 default/long；long 填满 caller 可用容器。图标只允许无图标、前置普通功能图标或后置固定 chevron_right。常规登录、付费和后台操作流程禁止使用；固定位置并带阴影的全圆角入口属于 Button_Float。",
      "tokens": [
        "button.round.*",
        "radius.pill",
        "motion.fast"
      ],
      "source": "C-05-rounded-button/contract.js"
    },
    "C-06": {
      "id": "C-06",
      "name": "Split Button / Menu Button",
      "purpose": "组合一个固定高频主操作与一组相似的低频辅助操作。",
      "root": "split-button",
      "anatomy": [
        "主操作按钮",
        "主操作前置图标（仅 Split button 可选）",
        "通栏分割线",
        "下拉菜单按钮",
        "辅助操作菜单"
      ],
      "variants": [
        "Split button",
        "Menu button",
        "Overflow Menu"
      ],
      "sizes": [
        "follow-Button_Basic"
      ],
      "states": [
        "default",
        "hover-main",
        "hover-menu",
        "active",
        "expanded",
        "focus",
        "disabled"
      ],
      "rules": "Split button 有两个独立热区，主操作可按源码证据使用前置 mainIcon，内部通栏分割线不可省略；菜单触发热区始终与 24/28/32/36/40px 控件高度同宽。Secondary Gray 的任一热区 hover、focus-visible 或菜单展开时，整个组合保持连续蓝色外轮廓与单一分隔线；Primary 的 default/hover/pressed/focus/open 始终保持蓝色语义。Menu button 是无分割线的单热区；Overflow Menu 收纳按钮组低优先级动作且用 icon 控制触发图标。caller-owned items 可声明 disabled；禁用项可见但不可激活，键盘导航跳过。菜单面板必须使用 surface 背景、1px 边框、surface 圆角和 float 投影，展开动画不得裁切投影。菜单只由 Click 触发并支持外部点击/Escape 收起；主操作不在菜单重复，次级操作不得回显覆盖主操作；移动端不使用分裂按钮。",
      "tokens": [
        "button.split.*",
        "button.menu.*",
        "divider",
        "dropdown.*",
        "tooltip.*",
        "control.height.*"
      ],
      "source": "C-06-split-button-menu-button/contract.js"
    },
    "C-07": {
      "id": "C-07",
      "name": "Floating Button",
      "purpose": "固定于特定位置，承载最重要行动或快速定位当前场景位置。",
      "root": "floating-button",
      "anatomy": [
        "表意图标",
        "背景容器",
        "文本标签（Tooltip）",
        "固定位置"
      ],
      "variants": [
        "primary",
        "secondary",
        "menu",
        "message",
        "official-text"
      ],
      "sizes": [
        "36",
        "40",
        "48"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "focus",
        "expanded",
        "disabled"
      ],
      "rules": "悬浮按钮高于内容并带阴影；主要悬浮用于新建等强引导，次要悬浮用于返回顶部、消息和帮助。全局悬浮位于右下 24px，多按钮垂直间距 20px；Hover 显示 Tooltip、Click 展开菜单；图标不清晰时官网可用圆角矩形文字扩展，禁止圆形承载文字。",
      "tokens": [
        "button.floating.*",
        "shadow.emphasis",
        "layer.sticky",
        "tooltip.*",
        "menu.*",
        "space.5",
        "space.6"
      ],
      "source": "C-07-floating-button/contract.js"
    },
    "C-08": {
      "id": "C-08",
      "name": "Dropdown Menu",
      "purpose": "展示一组即时命令或轻量选择。",
      "root": "menu",
      "anatomy": [
        "触发区域",
        "菜单容器",
        "菜单项",
        "辅助标题（可选）",
        "图标或辅助文本（可选）",
        "分组分隔线（可选）",
        "动态加载行（可选）",
        "独立创建动作（创建菜单）",
        "子菜单箭头（可选）"
      ],
      "variants": [
        "基础下拉菜单",
        "级联菜单",
        "辅助标题",
        "分组",
        "动态菜单",
        "创建菜单",
        "选择菜单",
        "复杂信息菜单项",
        "上下文菜单"
      ],
      "sizes": [
        "mini 24px",
        "small 28px",
        "medium 32px（默认）",
        "large 36px",
        "xlarge 40px"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "selected",
        "disabled",
        "loading",
        "expanded",
        "submenu-expanded"
      ],
      "rules": "触发区与菜单间距 4px；菜单面板上下 padding 8px、左右 padding 4px，菜单项左右 padding 12px；辅助标题与首个可操作项、分隔线与相邻选项的间距均为 4px。表面使用 1px canonical border、Radius-S 与 Shadow-M-down canonical Token，动画不裁切投影。mini/small/medium/large/xlarge 触发器和菜单项高度严格为 24/28/32/36/40px，字号与图标按语义尺寸递归调整而不整体缩放。最小宽度 55px，宽度按最长内容自适应且最大 420px，超长文本省略；最大高度 480px，超出后内部滚动。父子菜单左右间距为 0、边缘重合，父项顶部与子菜单内容顶部对齐；空间不足时向左翻转或在视口 8px 安全边界内约束。分组只使用通栏分隔线，不渲染分组标题。动态菜单不渲染 More 动作；滚动到底时派发一次 b2b:menu-load-more，调用方通过 update() 设置 loading 并追加 caller-owned items。动态更新保持 loading 行与首个新增项的滚动锚点，面板首次布局后以 4px 倍数锁定宽度，加载前、中、后不回顶、不变宽。创建菜单是独立 variant，末项复用主题色 items[].action + icon:add 的 canonical 创建动作；选择菜单是独立 variant，固定使用 mode=selection 与恰好一个 items[].selected 初始项，文字和勾选标记均使用主题色。禁用项不可激活且键盘导航跳过。Hover 触发立即展开；子菜单离场立即不可见，不执行带坐标回跳的离场过渡；所有关闭路径同步取消 C-08 计时/定位工作并一次提交全部子菜单状态。Click、Hover、contextmenu 均支持选择、外部点击、Escape、Tab、焦点恢复和同步 ARIA；ArrowRight/ArrowLeft 管理子菜单，Home/End 管理当前菜单边界。",
      "tokens": [
        "menu.*",
        "space.1",
        "space.2",
        "space.3",
        "border.surface",
        "radius.sm",
        "shadow.down.3",
        "layer.popover",
        "motion.fast"
      ],
      "source": "C-08-dropdown-menu/contract.js"
    },
    "C-09": {
      "id": "C-09",
      "name": "Cascader",
      "purpose": "在层级数据中选择并回显完整路径。",
      "root": "cascader",
      "anatomy": [
        "输入触发器",
        "搜索",
        "多列层级",
        "节点",
        "路径回显",
        "已选标签",
        "收起计数"
      ],
      "variants": [
        "single",
        "multiple",
        "searchable",
        "hover-expand"
      ],
      "sizes": [
        "mini",
        "small",
        "medium",
        "large",
        "xlarge"
      ],
      "states": [
        "default",
        "hover",
        "focus",
        "expanded",
        "selected",
        "disabled",
        "error",
        "loading"
      ],
      "rules": "单选回显完整路径；多选默认显示全部可移除标签，仅显式选择 collapsed 时以 +N 收起；层级列保持一致宽度并支持滚动。",
      "tokens": [
        "cascader.*",
        "input.*",
        "menu.*",
        "tag.*"
      ],
      "source": "C-09-cascader/contract.js"
    },
    "C-10": {
      "id": "C-10",
      "name": "Color Picker",
      "purpose": "通过统一触发器打开完整、简单或仅调色面板，并同步颜色与透明度。",
      "root": "color-picker",
      "anatomy": [
        "颜色触发器",
        "当前色色块",
        "当前色值",
        "弹层面板",
        "预设色块",
        "More color 入口",
        "二维色域",
        "色相条",
        "透明度条",
        "HEX 与 RGB 输入"
      ],
      "variants": [
        "full",
        "simple",
        "value"
      ],
      "sizes": [
        "mini",
        "small",
        "medium",
        "large"
      ],
      "states": [
        "default",
        "hover",
        "pressed",
        "focus",
        "selected",
        "open",
        "disabled",
        "error",
        "transparent"
      ],
      "rules": "full 提供固定色板与 More color 调色区；simple 只提供含无颜色项的预设色板；value 只提供二维色域、色相、透明度与 HEX/RGB。面板模型、触发器 swatch/swatch-value 与 mini/small/medium/large 尺寸正交组合；disabled 与 open 不得同时为 true。",
      "tokens": [
        "color-picker.*",
        "input.*",
        "popover.*",
        "focus.ring",
        "color.extended.*",
        "space.*"
      ],
      "source": "C-10-color-picker/contract.js"
    },
    "C-11": {
      "id": "C-11",
      "name": "Checkbox",
      "purpose": "从一组选项中选择一项或多项，也可独立表达布尔状态。",
      "root": "checkbox",
      "anatomy": [
        "复选框",
        "选项描述",
        "复选框组",
        "全选项",
        "错误描述"
      ],
      "variants": [
        "group",
        "standalone",
        "with-description",
        "indeterminate"
      ],
      "sizes": [
        "16"
      ],
      "states": [
        "unchecked",
        "hover",
        "pressed",
        "focus",
        "checked",
        "indeterminate",
        "disabled",
        "error"
      ],
      "rules": "按源图复刻：视觉框固定 16×16px、Radius-XS，选项描述为 14px，默认控件与文字间距 8px，紧凑场景可缩至 4px。Error 可与 unchecked、checked、mixed 和 disabled 组合，并用 aria-invalid/aria-describedby 关联错误描述。组项以唯一 value 识别，可独立声明 checked、mixed、disabled 和 error；checked 与 mixed 不可同时为 true。竖向项间距 8px；横向项间距 24px、行间距 8px，390px 等窄容器中按完整选项换行且无横向滚动。mixed 点击或 Space 后清除 indeterminate 并提交 checked=true。完整标签形成至少 22px 高热区；长说明与首行顶部对齐。",
      "tokens": [
        "checkbox.*",
        "space.1",
        "space.2",
        "space.3",
        "color.action.*",
        "color.danger.*",
        "focus.ring",
        "radius.xs"
      ],
      "source": "C-11-checkbox/contract.js"
    },
    "C-12": {
      "id": "C-12",
      "name": "导航菜单",
      "purpose": "为页面和功能提供导航指引，覆盖顶部水平导航、Web 侧边导航与 Desktop 侧边导航。",
      "root": "navigation",
      "anatomy": [
        "统一品牌头",
        "一级导航",
        "图标",
        "文本",
        "下拉箭头",
        "数字徽标",
        "二级/三级导航",
        "相关操作",
        "真实溢出菜单",
        "展开/收起",
        "树选择",
        "选中态指示器"
      ],
      "variants": [
        "top-horizontal-web",
        "side-web-expanded",
        "side-web-collapsed",
        "side-desktop",
        "side-desktop-tree",
        "no-background"
      ],
      "sizes": [
        "56-topbar",
        "240-web",
        "64-collapsed",
        "40-side-row",
        "4-row-gap",
        "220-desktop",
        "440-desktop-max",
        "host-height"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "expanded",
        "collapsed",
        "focus",
        "disabled"
      ],
      "rules": "顶部水平导航高 56px、占满宿主可用宽度，品牌标题默认为‘项目中心’，品牌图标为 24px；只有 caller-owned 导航项真实超出中间轨道时才从尾部进入 More，宽度恢复时按原顺序回填，不接受手工伪造 More 数据。More 表面与菜单项复用 C-08 canonical factory、样式和键盘语义，并保留图标、文字、选中态和逐级菜单能力。右侧操作区使用带 kind 的 caller-owned actions，并分别复用 C-02 基础按钮、C-04 图标按钮、C-32 头像与 C-33 徽标 canonical factory；头像直径与按钮高度同为 32px。390px 时收紧横向 padding、隐藏品牌标题，并把同一完整操作区折叠为复用 C-04/C-08 的‘更多操作’菜单；导航项仍由真实测量进入 More，不产生页面横向滚动。品牌头默认显示；brand.visible=false 时省略整块品牌头，brand.icon 为空字符串时只显示品牌文字。所有竖向结构复用同一可选品牌头与展开/收起控制；每个菜单交互行统一为 40px，同级间距为 4px，缩进与组间距遵循 4n 体系。根节点以宿主左边缘为锚点，展开宽度为 Web 240px 或 Desktop 220—440px，收起宽 64px；宿主提供明确高度时占满高度并仅滚动内容区，品牌头固定。滚动条贴近右边缘，只在 hover、键盘焦点、滚动或拖动的瞬时周期显示。Desktop 支持拖拽调宽，Tree 最多四级，Web 最多三级，no-background 的菜单与收缩控制在所有瞬时状态均保持无块状背景。所有标签保持单行；hover、focus、pressed、dragging、scrollbar visibility 与 overflowIds 均为 Renderer 计算的瞬时状态，不是 props。",
      "tokens": [
        "navigation.top.*",
        "navigation.side.web.*",
        "navigation.side.desktop.*",
        "control.height.nav",
        "icon.size.20",
        "space.*",
        "focus.ring",
        "layer.popover"
      ],
      "source": "C-12-navigation-menu/contract.js"
    },
    "C-13": {
      "id": "C-13",
      "name": "面包屑",
      "purpose": "显示当前页面在系统层级结构中的位置，并支持向上返回。",
      "root": "breadcrumb",
      "anatomy": [
        "文本",
        "省略符",
        "分割符",
        "背景"
      ],
      "variants": [
        "single-level",
        "two-level",
        "three-level",
        "four-level",
        "collapsed-history",
        "component-context"
      ],
      "sizes": [
        "4-gap",
        "16-separator",
        "8-bg-horizontal",
        "12-bg-vertical"
      ],
      "states": [
        "normal",
        "hover",
        "pressed",
        "hover-more",
        "focus",
        "overflow"
      ],
      "rules": "面包屑用于系统具有超过两级的层级结构、用户需要查看所在位置或返回上导航。层级过长时优先折叠中间层，保留根级、靠近当前页的层级与当前页；省略符 Hover/Click 展示被折叠历史。末级文本不可点击。单层级文字超过 16px 可省略约 8 个字符，并通过 Tooltip 展示完整字段。",
      "tokens": [
        "breadcrumb.*",
        "color.text.*",
        "space.1",
        "space.2",
        "space.3",
        "icon.size.16",
        "tooltip.*",
        "popover.*"
      ],
      "source": "C-13-breadcrumb/contract.js"
    },
    "C-14": {
      "id": "C-14",
      "name": "步骤条",
      "purpose": "帮助用户完成复杂任务而拆分的有序步骤，并展示当前进度。",
      "root": "steps",
      "anatomy": [
        "步骤节点",
        "标题",
        "辅助说明",
        "连接线"
      ],
      "variants": [
        "basic-horizontal",
        "basic-vertical",
        "simple-horizontal",
        "simple-vertical",
        "tab-step"
      ],
      "sizes": [
        "28-node",
        "24-simple-row",
        "4-text-gap",
        "24-horizontal-gap",
        "4n-vertical-gap"
      ],
      "states": [
        "finished",
        "in-progress",
        "waiting",
        "error",
        "hover",
        "focus"
      ],
      "rules": "步骤节点通常建议 3～7 个；基础步骤条可自定义节点图标，简单步骤条用于空间受限或无需强调节点的场景。标题尽量一行、最多两行，说明最多两行；横向节点等宽自适应且推荐间距 24px，宽度继续变窄时不再自动压缩；纵向间距按内容使用 4 的倍数。节点是否可点击必须由业务配置，不可点击节点 Hover 不变化。",
      "tokens": [
        "steps.node.*",
        "steps.line.*",
        "steps.title.*",
        "steps.description.*",
        "color.action.*",
        "color.danger.*",
        "space.1",
        "space.6",
        "focus.ring"
      ],
      "source": "C-14-steps/contract.js"
    },
    "C-15": {
      "id": "C-15",
      "name": "分页",
      "purpose": "对大量内容进行分页分组，提供清晰的当前位置与前后翻页能力。",
      "root": "pagination",
      "anatomy": [
        "数据总量",
        "前后翻页按钮",
        "页码",
        "省略号",
        "单页条数选择器",
        "跳转输入框",
        "极简当前页输入框"
      ],
      "variants": [
        "default-pagination",
        "small-pagination",
        "minimal"
      ],
      "sizes": [
        "28-default",
        "24-small",
        "8-gap",
        "28-input"
      ],
      "states": [
        "default",
        "hover",
        "pressed",
        "selected",
        "focus",
        "disabled",
        "jumping",
        "invalid"
      ],
      "rules": "Default 用于数据量较大且需要完整控制的场景，默认在同一行按数据总量、分页主体、每页条数、页码跳转的顺序展示；Small 用于受限空间，页码为 24×24px 点击区且选中页只保留主色、不显示外框；Minimal 只保留上一页、可输入的当前页、总页数与下一页，左右翻页箭头默认不显示外框，当前页输入框复用 Jumper 的白色背景、1px 控件边框与 28px 高度；Minimal 不接受总量、每页条数或额外跳转器。当前页始终可见，超过连续窗口时显示省略号；上一页/下一页到边界后禁用。省略号 Hover 显示跳转方向，Click 向前或向后跳 5 页；每页条数复用选择器组件。页码输入只保留数字；Enter 提交，Minimal 移出焦点也提交；空值恢复当前页且不发事件，超出边界自动校正到 1…totalPages，只有页码真正改变时才发送一次 b2b:pagination-change。",
      "tokens": [
        "pagination.button.*",
        "pagination.selected.*",
        "pagination.small.*",
        "input.*",
        "select.*",
        "space.2",
        "focus.ring"
      ],
      "source": "C-15-pagination/contract.js"
    },
    "C-16": {
      "id": "C-16",
      "name": "滚动条",
      "purpose": "在内容超出容器时表达可滚动范围、当前位置并提供拖拽控制。",
      "root": "scrollbar",
      "anatomy": [
        "滑块",
        "轨道",
        "滚动容器",
        "首尾安全区",
        "命中热区"
      ],
      "variants": [
        "vertical-light",
        "horizontal-light",
        "vertical-dark",
        "horizontal-dark",
        "cross-axis"
      ],
      "sizes": [
        "11-hot",
        "9-track",
        "7-thumb",
        "5-thin-track",
        "3-thin-thumb",
        "24-vertical-min",
        "22-horizontal-min"
      ],
      "states": [
        "idle",
        "hover",
        "focus-within",
        "pressed",
        "dragging",
        "scrolling",
        "revealed",
        "visual-hidden",
        "disabled"
      ],
      "rules": "默认优先遵循系统滚动行为；Windows Web 场景使用可见滚动条，macOS 自动隐藏时仍需保证内容可滚动。variant 只表达轴向与明暗；appearance=default|thin 和 visibility=always|hover-reveal 是可与全部 variant 组合的独立维度。默认命中热区 11px、轨道 9px、滑块 7px；thin 仅把可见轨道/滑块收窄为 5px/3px，保持 11px 命中热区、内容内边距和容器几何不变。纵向最小滑块 24px、横向最小滑块 22px。hover-reveal 只用 opacity 隐藏视觉，在容器 hover、focus-within、滚动或拖动时显示正常轨道/滑块；不使用 display:none，不添加抓手、grip 或额外手柄，移出/失焦/滚动结束后按 motion.fast 平稳隐藏。滚动条紧贴容器右侧/底部，不遮挡内容；横纵同时出现时保留 11×11px 交叉区。拖拽时保持位置连续，不产生布局位移。",
      "tokens": [
        "scrollbar.hot-area.*",
        "scrollbar.track.*",
        "scrollbar.thumb.*",
        "color.neutral.*",
        "motion.fast",
        "cursor.drag"
      ],
      "source": "C-16-scrollbar/contract.js"
    },
    "C-17": {
      "id": "C-17",
      "name": "锚点",
      "purpose": "用于快速跳转到页面指定位置，并随内容滚动同步当前位置。",
      "root": "anchor",
      "anatomy": [
        "轨道/锚点容器",
        "选中状态",
        "锚点标题",
        "层级缩进"
      ],
      "variants": [
        "standard-vertical",
        "standard-horizontal",
        "hierarchical-vertical",
        "hierarchical-horizontal"
      ],
      "sizes": [
        "14-text",
        "200-vertical-max",
        "400-container-max",
        "240-horizontal-item-max",
        "24-horizontal-gap"
      ],
      "states": [
        "normal",
        "hover",
        "pressed",
        "selected",
        "loading-failure",
        "disabled",
        "focus"
      ],
      "rules": "锚点用于同页较长内容定位，不承担全局导航。标准锚点只有一级；层级锚点最多两级。纵向锚点建议最大宽 200px、容器最大高度 400px，超出时内部滚动；横向单项最大宽 240px、项间距 24px。点击锚点滚动到目标区域；内容滚动时反向更新当前项。吸顶位置需避开顶部导航，短页面不使用锚点。移动端优先转换为顶部横向可滚动锚点。",
      "tokens": [
        "anchor.track.*",
        "anchor.item.*",
        "anchor.selected.*",
        "anchor.horizontal.*",
        "color.action.*",
        "space.*",
        "layer.sticky",
        "focus.ring"
      ],
      "source": "C-17-anchor/contract.js"
    },
    "C-18": {
      "id": "C-18",
      "name": "数据可视化",
      "purpose": "以准确、清晰、可比较的方式呈现比较、趋势、流程、占比、分布、排名与关系数据。",
      "root": "chart",
      "anatomy": [
        "图表标题",
        "辅助说明",
        "轴",
        "刻度",
        "可选 X/Y 轴标题",
        "图例",
        "标准工具栏",
        "图形框架",
        "数据标记",
        "Tooltip",
        "圆形标签",
        "可选总和",
        "状态反馈"
      ],
      "variants": [
        "basic-column", "grouped-column", "stacked-column", "percent-stacked-column",
        "basic-bar", "grouped-bar", "stacked-bar",
        "rose", "pie", "donut", "nested-donut",
        "basic-line", "smooth-line", "step-line",
        "basic-area", "smooth-area", "step-area", "stacked-area", "percent-stacked-area",
        "radar", "sankey", "basic-funnel", "conversion-funnel",
        "liquid", "scatter", "histogram", "heatmap", "word-cloud", "column-line-combo", "metric"
      ],
      "sizes": [
        "responsive-plot",
        "desktop-bottom-legend",
        "mobile-top-legend",
        "marks-first-adaptation"
      ],
      "states": [
        "default",
        "hover",
        "selected",
        "loading",
        "empty",
        "error",
        "partial-data",
        "disabled"
      ],
      "rules": "按 System 七类展示意图选择图形。指标图以标题和数字呈现总览，支持负数和单位，以及每项 trend（none/up/down/flat）、change、description、unit；主数字中性，趋势由调用方显式提供，不从数字正负推断；trendTone 独立表示有利（绿）、不利（红）、中性，默认中性。指标图不提供悬浮、聚焦或点击 Tooltip，标题、数值与说明直接展示。可选灰色 icon 位于标题前；metricLayout 为 overview/cards/compact。change 为空时整个变化信息含箭头、底色一起隐藏。metricChart（none/area）可展示右侧迷你面积图，area 时每项必须提供 history（2–120 个有序 label/value 数据点），仅由原生 VChart 绘制。无坐标轴或图例。热力图始终使用浅到深的同色相连续色阶，heatmapPalette 可选 blue（默认）或 orange；palette 不覆盖热力图色阶。其他图表默认使用统一的亮色图表色 Token；需要突出数值深浅时可切换同色阶，切换图表类型不改变当前配色。桌面图例默认底部居中，移动端优先置顶；单系列可自动隐藏。饼/环外部标签使用中性文字和系列色连接线，环图总和可选。桌面 Tooltip 由 hover/focus 触发，移动端固定于图表上方并由触摸触发。响应式保留顺序为图形、图例、轴、网格。折线不超过 5 系列、饼环少于 9 类、漏斗不超过 12 阶段、雷达至少 4 维、基础面积不超过 3 系列。禁止 3D、无业务含义渐变和伪造数据。",
      "tokens": [
        "chart.color.*",
        "chart.axis.*",
        "chart.grid.*",
        "chart.legend.*",
        "chart.tooltip.*",
        "chart.state.*",
        "motion.fast"
      ],
      "source": "C-18-data-visualization/contract.js"
    },
    "C-19": {
      "id": "C-19",
      "name": "日期选择器",
      "purpose": "从日历中选择日期、日期范围或带时间的时间段。",
      "root": "date-picker",
      "anatomy": [
        "输入触发器",
        "清空按钮",
        "日历导航",
        "星期标题",
        "日期网格",
        "快捷项",
        "时间选择",
        "操作区"
      ],
      "variants": [
        "date",
        "date-range",
        "week",
        "month",
        "quarter",
        "year",
        "date-time",
        "date-time-range"
      ],
      "sizes": [
        "32-trigger",
        "32-day",
        "280-single",
        "560-range"
      ],
      "states": [
        "default",
        "hover",
        "focus",
        "expanded",
        "selected",
        "range-start",
        "range-middle",
        "range-end",
        "today",
        "disabled",
        "error"
      ],
      "rules": "单日、范围和带时间类型使用一致输入基线。单面板宽约 280px，普通日期范围双面板约 560px；date-time-range 使用单面板并分阶段编辑开始/结束日期时间。日期单元 32px，周标题与日期列对齐。范围起点、经过区间和终点必须同时可辨识，今天不等于选中。清空按钮只在有值时出现。触发器 Click 展开；浮层绝对定位且不改变文档流；外部点击/Escape 关闭；方向键在日期网格移动，Enter/Space 选择。日期时间类型在确认后提交，取消不改变已确认值。",
      "tokens": [
        "date-picker.trigger.*",
        "calendar.day.*",
        "calendar.range.*",
        "calendar.today.*",
        "popover.*",
        "input.*",
        "focus.ring",
        "motion.fast"
      ],
      "source": "C-19-date-picker/contract.js"
    },
    "C-20": {
      "id": "C-20",
      "name": "表单",
      "purpose": "允许用户添加或录入一系列数据，或配置一系列选项。",
      "root": "form",
      "anatomy": [
        "字段标题",
        "已填/未填字段",
        "禁用字段",
        "帮助文本",
        "报错文本",
        "必填标识",
        "提示标识",
        "操作按钮"
      ],
      "variants": [
        "基础表单",
        "组合表单",
        "分组表单",
        "分步表单",
        "联动表单"
      ],
      "sizes": [
        "28-small",
        "32-medium",
        "40-large",
        "24-margin",
        "24-gutter"
      ],
      "states": [
        "default",
        "hover",
        "focus",
        "inputting",
        "validating",
        "error",
        "disabled",
        "readonly",
        "success",
        "submitted"
      ],
      "rules": "按源图组织使用规则、组成要素、表单类型、元素、样式布局、信息展示、间距尺寸、栅格与校验。字段按用户任务分组；同类内容使用一致组件与表现；无相关提示时不重复占位文案。字段标题上置时与输入框同宽，超过两行截断；左置时标题区不超过 20%，最多两行。小/大间距表单的分组标题间距分别为 16px/24px，字段间距分别为 20px/28px；联动选项间距建议 8px，复杂联动垂直间距 24px。校验分即时、失焦和提交后，内容分单值和组合校验；提交后错误既可原位展开，也可在表单顶部汇总。",
      "tokens": [
        "form.*",
        "field.*",
        "input.*",
        "control.height.*",
        "space.*",
        "grid.*",
        "color.danger.*",
        "focus.ring",
        "typography.*"
      ],
      "source": "C-20-form/contract.js"
    },
    "C-21": {
      "id": "C-21",
      "name": "输入框",
      "purpose": "在页面中引导用户录入短文本、数字、属性、组合值或长文本。",
      "root": "input",
      "anatomy": [
        "容器",
        "占位符",
        "标签区域",
        "必填/提示标识",
        "输入文本",
        "前缀/后缀 addon",
        "前缀图标",
        "清空/密码/信息操作",
        "帮助/校验文本",
        "C-44 Tooltip 浮层"
      ],
      "variants": [
        "基础输入框",
        "数字输入框",
        "带图标输入框",
        "带属性输入框",
        "组合输入框",
        "长文本输入框"
      ],
      "sizes": [
        "24-mini",
        "28-small",
        "32-medium-default",
        "36-large",
        "40-xlarge",
        "240-min-recommended",
        "600-max-recommended",
        "92-textarea"
      ],
      "states": [
        "normal",
        "hover",
        "focus",
        "inputting",
        "input-complete",
        "disabled",
        "readonly",
        "error",
        "hover-icon",
        "active-select"
      ],
      "rules": "按六类输入框组织。mini/small/medium/large/xlarge 与 24/28/32/36/40px 一一对应，默认 medium；单行控件在 Error 状态保持同档高度。基础输入可配置清空、无边框、密码或字数统计，清空只在可编辑且有值时出现，点击或键盘激活后恢复输入焦点并各派发一次 change/clear。数字输入仅接收明确范围内数值。带图标输入的右侧信息说明必须组合正式 C-44 Tooltip，支持 Hover、Focus、Escape、ARIA 与 body portal 几何。属性输入的 caller-owned 前/后 addon 可分别为固定文本或复用 canonical Select 的可选择项；addon 灰色表面、边界、圆角、禁用、只读和错误态与主输入正确衔接。组合输入固定两段 caller-owned identity/value，焦点只强调当前段，支持 filled/borderless；无背景形态仍保留 Hover、Focus、Error、Disabled、Readonly 提示。长文本支持自增高或固定 92px、字数统计与错误状态。Hover、Focus、Inputting 等瞬时状态不作为 props。",
      "tokens": [
        "input.*",
        "textarea.*",
        "input-number.*",
        "input-affix.*",
        "input-combination.*",
        "select.*",
        "tooltip.*",
        "control.height.*",
        "space.*",
        "color.danger.*",
        "focus.ring",
        "motion.fast"
      ],
      "source": "C-21-input/contract.js"
    },
    "C-22": {
      "id": "C-22",
      "name": "单选框",
      "purpose": "从一组直接展开的选项中选择单个结果。",
      "root": "radio",
      "anatomy": [
        "单选框",
        "选项描述",
        "按钮容器（按钮型）",
        "长文案 Tooltip"
      ],
      "variants": [
        "基础单选",
        "按钮型单选"
      ],
      "sizes": [
        "16-control",
        "22-hot-area",
        "14-label",
        "8-vertical-gap",
        "24-horizontal-gap",
        "small",
        "medium",
        "large"
      ],
      "states": [
        "not-selected",
        "selected",
        "hover",
        "pressed",
        "focus",
        "disabled",
        "error",
        "active"
      ],
      "rules": "用于不超过约 6 个、需要直接比较的互斥选项；整块标签可点击，独立使用时热区仍至少 22px。基础单选框固定 16×16px，描述文字 14px、控件与文字 8px；纵向排列的选项间距 8px，横向排列的选项间距 24px。基础单选长文案在纵向和列表排列中自然换行，控件与首行对齐；横向排列保持单行，空间不足时显示省略号并提供完整文本 Tooltip。按钮型单选突出选项本身，提供 small/medium/large 三种尺寸，并完整区分未选/已选的 Normal、Hover、Active、Disabled。按钮长文案保持单行，超出时显示省略号并通过 Hover、Focus 和可访问描述提供完整内容。",
      "tokens": [
        "radio.*",
        "radio-button.*",
        "control.height.*",
        "space.2",
        "space.6",
        "focus.ring",
        "color.action.*",
        "motion.fast"
      ],
      "source": "C-22-radio/contract.js"
    },
    "C-23": {
      "id": "C-23",
      "name": "选择器",
      "purpose": "从多个备选项中完成单选或多选，并在需要时支持搜索、清空、创建与复杂内容。",
      "root": "select",
      "anatomy": [
        "标题文本（可选）",
        "触发区域",
        "下拉列表",
        "列表内容",
        "清除按钮",
        "搜索输入",
        "选项详情",
        "创建入口"
      ],
      "variants": [
        "基础单选",
        "基础多选",
        "自定义选项",
        "分组选项",
        "无边框",
        "下划线",
        "可搜索",
        "可创建",
        "复杂内容"
      ],
      "sizes": [
        "28-small",
        "32-medium",
        "40-large",
        "120-menu-min",
        "420-menu-max",
        "246-menu-recommended-height",
        "188-multiple-max-height"
      ],
      "states": [
        "default",
        "hover",
        "active",
        "selected-active",
        "disabled",
        "readonly",
        "error",
        "loading",
        "no-result",
        "inputting"
      ],
      "rules": "严格按源图复刻。单选点击选项后立即回显并收起，多选保持面板并以标签回显；打开时默认激活首项并支持方向键与 Enter。清除仅在有输入能力或已选择内容时出现；搜索支持模糊匹配、加载与无结果；可创建分搜索创建和底部主动创建。触发器提供 S/M/L 三档，建议最小宽度 240px、最大 600px；菜单宽度优先与触发器一致，最小 120px、最大 420px，常规推荐高度 246px，多选标签区域最高 188px。下拉默认向下，空间不足向上，左右空间不足时调整对齐。复杂选项可组合图标、Tag、头像、描述与分组；文本过长时省略并用 Tooltip 提供完整内容。",
      "tokens": [
        "select.*",
        "menu.*",
        "tag.*",
        "avatar.*",
        "control.height.*",
        "space.*",
        "color.action.*",
        "color.danger.*",
        "shadow.down.*",
        "motion.fast"
      ],
      "source": "C-23-select/contract.js"
    },
    "C-24": {
      "id": "C-24",
      "name": "评分",
      "purpose": "展示评分，或让用户通过星级与好评/差评完成评价。",
      "root": "rating",
      "anatomy": [
        "已评分",
        "未评分",
        "即时提示（可选）",
        "好评按钮",
        "差评按钮",
        "补充原因（可选）"
      ],
      "variants": [
        "星级评分",
        "好评差评",
        "普通好评差评",
        "小型好评差评",
        "自定义图标",
        "自定义颜色"
      ],
      "sizes": [
        "28-star",
        "32-star-container",
        "4-star-gap",
        "112-sentiment-min-width",
        "40-sentiment-height",
        "16-sentiment-gap",
        "small-compact"
      ],
      "states": [
        "normal",
        "hover",
        "pressed",
        "selected",
        "selected-hover",
        "selected-pressed",
        "half",
        "disabled",
        "readonly"
      ],
      "rules": "星级评分默认五级并提供 1 或 0.5 步长；自定义步长仅用于展示。星星图标 28×28px，交互容器 32×32px，间距 4px；Normal 使用 N300，Hover 与 Selected 使用 Y500。Hover 与选中后都显示稳定的即时提示，长提示允许换行且语义清晰。点击可改变评分；是否允许清除必须由场景明确。好评/差评分普通与小型两类：普通最小宽 112px、高 40px、按钮间距 16px；小型图标 12px、图文 2px、按钮间距 16px。普通形态可在选择后展示原因和补充说明，小型形态只用于轻量评价。",
      "tokens": [
        "rating.*",
        "sentiment.*",
        "icon.size.*",
        "color.warning.*",
        "color.action.*",
        "space.*",
        "motion.fast",
        "focus.ring"
      ],
      "source": "C-24-rating/contract.js"
    },
    "C-25": {
      "id": "C-25",
      "name": "步进器",
      "purpose": "用于增加或减少当前整数数值，并在明确的小范围内逐步调整。",
      "root": "stepper",
      "anatomy": [
        "减数按钮",
        "增数按钮",
        "字段",
        "输入框"
      ],
      "variants": [
        "默认步进器",
        "窄宽步进器",
        "长宽步进器",
        "最小值",
        "最大值",
        "错误"
      ],
      "sizes": [
        "28",
        "32",
        "40",
        "80-narrow",
        "160-default",
        "16-icon",
        "14-text"
      ],
      "states": [
        "normal",
        "hover",
        "activated",
        "inputting",
        "hover-button",
        "pressed-button",
        "input-complete",
        "disabled",
        "error",
        "min",
        "max"
      ],
      "rules": "仅用于整数的增减，必须具有明确范围，建议范围不超过 999；随机或无固定范围数值使用输入框。点击按钮或直接输入可更改值，单击按配置步长逐步更改；长按支持快速增减，重复间隔 800ms。达到最小/最大值时仅禁用对应按钮；离开输入框时低于最小值回填最小值，高于最大值回填最大值；符号、字母等无效内容不显示。高度沿用输入框 28/32/40px，默认宽 160px，宽度随内容自适应，圆角 Radius-S，图标 16px、文本 14px。",
      "tokens": [
        "stepper.*",
        "input.*",
        "button.icon.*",
        "control.height.*",
        "radius.*",
        "color.action.*",
        "color.danger.*",
        "motion.fast"
      ],
      "source": "C-25-stepper/contract.js"
    },
    "C-26": {
      "id": "C-26",
      "name": "滑动输入条",
      "purpose": "在固定数值范围内通过滑动滑块设置模糊或连续数值。",
      "root": "slider",
      "anatomy": [
        "滑轨",
        "滑块",
        "节点",
        "文字提示",
        "联动输入框",
        "数值图标"
      ],
      "variants": [
        "单滑块",
        "双滑块",
        "竖向滑块",
        "带节点滑块",
        "输入框联动",
        "数值图标"
      ],
      "sizes": [
        "4-track",
        "12-thumb",
        "32-hit-area",
        "standard"
      ],
      "states": [
        "normal",
        "hover-slider",
        "hover-track",
        "dragging",
        "focus",
        "disabled"
      ],
      "rules": "适用于音量、亮度、图像滤镜等模糊数值输入；当数值小于四个时优先单选。滑轨经过与未经过区域必须明确区分，滑块可拖拽或点击滑轨设置。轨道高 4px、滑块 12px，交互热区 32px。双滑块端点不可交叉，拖过时彼此推动；竖向滑块用于音量等场景；节点与节点文案用于关键位置，带节点滑块的拖拽、轨道点击和键盘操作都必须吸附到离散节点。支持输入框双向联动与方向键操作。",
      "tokens": [
        "slider.*",
        "color.action.*",
        "focus.ring",
        "tooltip.*",
        "input.*",
        "motion.fast"
      ],
      "source": "C-26-slider/contract.js"
    },
    "C-27": {
      "id": "C-27",
      "name": "开关",
      "purpose": "在两个互斥状态之间切换，并在点击后立即生效。",
      "root": "switch",
      "anatomy": [
        "轨道",
        "滑块",
        "加载图标",
        "标题/描述（外部）"
      ],
      "variants": [
        "base"
      ],
      "sizes": [
        "40x22-medium",
        "28x16-small"
      ],
      "states": [
        "on-normal",
        "on-disabled",
        "on-loading",
        "off-normal",
        "off-disabled",
        "off-loading",
        "hover",
        "focus"
      ],
      "rules": "用于开启/关闭、激活/不激活等逻辑二元状态。表单中需搭配稳定的标题或描述，文案只说明开关控制的内容，不随状态变化，也不加入“非”之类反向逻辑。标题、描述、设置行布局与关联字段由调用方在开关外部组合，不属于 C-27 props。单独开关点击后立即生效；若开关影响表单其他字段，应实时显隐或禁用相关内容。大尺寸用于空间宽松或带标题场景，小尺寸用于紧凑列表和短语句。需要用户再次提交或保存确认的设置不使用开关，改用 Checkbox/Radio。",
      "tokens": [
        "switch.*",
        "control.height.*",
        "motion.fast",
        "focus.ring",
        "shadow.control",
        "color.action.*"
      ],
      "source": "C-27-switch/contract.js"
    },
    "C-28": {
      "id": "C-28",
      "name": "树选择",
      "purpose": "在具有多级关系的数据中完成单选、多选或父子关联勾选。",
      "root": "tree-select",
      "anatomy": [
        "箭头",
        "文本",
        "复选框（勾选型）",
        "输入触发器",
        "搜索",
        "树面板",
        "已选标签"
      ],
      "variants": [
        "基础树选择-导航",
        "基础树选择-单选",
        "基础树选择-多选",
        "勾选型树选择"
      ],
      "sizes": [
        "32-control",
        "240-input-min",
        "600-input-max",
        "420-panel-max",
        "256-panel-height",
        "188-multiple-max-height"
      ],
      "states": [
        "normal",
        "hover-input",
        "complete",
        "second-hover-input",
        "second-hover-input-icon",
        "disabled",
        "readonly",
        "activated",
        "hover-list",
        "search",
        "second-activated",
        "loading",
        "no-result"
      ],
      "rules": "用于公司层级、学科系统和分类目录等多级关系。箭头展开或折叠子节点，文本用于具体描述；勾选型使用复选框并明确父子关联。基础单选选择一项；基础多选允许父子同时选择但父项不自动包含全部子项；勾选型选择父项时自动选择全部子项，部分子项选中时父项为部分选中。触发器沿用选择器：推荐最小宽 240px、最大 600px，多选最高 188px；面板最大宽 420px、推荐高 256px。搜索无结果、加载、禁用与只读状态均需明确。",
      "tokens": [
        "tree-select.*",
        "tree.*",
        "checkbox.*",
        "select.*",
        "popover.*",
        "motion.fast",
        "focus.ring"
      ],
      "source": "C-28-tree-select/contract.js"
    },
    "C-29": {
      "id": "C-29",
      "name": "穿梭框",
      "purpose": "在全部选项与已选项之间双向移动内容，并支持批量选择、移除、搜索与排序。",
      "root": "transfer",
      "anatomy": [
        "左侧选项区",
        "右侧已选区",
        "可选项",
        "已选项",
        "搜索框（可选）",
        "选项标题",
        "已选标题",
        "自定义区域",
        "拖拽入口",
        "清除"
      ],
      "variants": [
        "列表",
        "树结构",
        "分组结构",
        "自定义选项",
        "自定义已选项"
      ],
      "sizes": [
        "544-min-width",
        "960-max-width",
        "240-min-height",
        "4-row-vertical-padding",
        "16-option-gap",
        "8-copy-gap"
      ],
      "states": [
        "normal",
        "hover",
        "pressed",
        "selected",
        "disabled-selected",
        "drag-hover",
        "dragging",
        "search-result",
        "empty"
      ],
      "rules": "左侧展示全部选项，右侧展示已选结果；勾选左侧项立即加入右侧，取消勾选或点击右侧关闭按钮立即移除。选项标题由 Checkbox 与标题组成，显示已选/全部数量；右侧标题显示已选数量并提供清空。已选项支持拖拽排序，搜索只过滤左侧显示且标题计数采用搜索结果数量。整体建议宽 544—960px、最小高 240px；搜索框、标题和自定义区域滚动时吸顶。选项标题与已选标题最多两行；复杂内容保持 Checkbox 顶部 4px、头像间距 16px、文字区 8px。",
      "tokens": [
        "transfer.*",
        "list.*",
        "checkbox.*",
        "button.*",
        "search.*",
        "scrollbar.*",
        "tag.*",
        "motion.fast",
        "focus.ring"
      ],
      "source": "C-29-transfer/contract.js"
    },
    "C-30": {
      "id": "C-30",
      "name": "Time Picker",
      "purpose": "按业务精度选择时间或时间段。",
      "root": "time-picker",
      "anatomy": [
        "输入触发器",
        "时/分/秒列",
        "滚动选项",
        "日期面板",
        "快捷项",
        "日期时间操作区"
      ],
      "variants": [
        "time",
        "range",
        "12-hour",
        "24-hour",
        "with-date"
      ],
      "sizes": [
        "28",
        "32",
        "40"
      ],
      "states": [
        "default",
        "hover",
        "focus",
        "expanded",
        "selected",
        "disabled",
        "error"
      ],
      "rules": "视觉严格还原时间选择器源截图：145px 基准输入、72px 独立列、蓝色文本选中态、合并列表勾选、仅当前悬停或聚焦列显示滚动条且选项左右保留 4px 热区间距。交互参照 Arco TimePicker：有值时清空按钮仅在触发器悬停时出现；点击或方向键展开，列内以鼠标滚轮、可拖动滚动条或键盘选择，并同步选中值和可见位置；范围分隔符与两端触发器垂直居中。操作区只属于同时包含日期与时间的 with-date；启用后同时渲染 Current Time、Cancel 和 Done，关闭后不渲染底部操作栏；纯时间、12/24 小时制和时间范围不渲染也不接受操作区配置。外部点击和 Escape 管理草稿与已确认值；日期＋时间支持分别调用与合并面板，禁用项可见但不可选。",
      "tokens": [
        "time-picker.*",
        "date-picker.*",
        "calendar.*",
        "input.*",
        "menu.*",
        "popover.*",
        "focus.ring",
        "motion.fast"
      ],
      "source": "C-30-time-picker/contract.js"
    },
    "C-31": {
      "id": "C-31",
      "name": "Upload",
      "purpose": "通过点击或拖拽提交文件并反馈进度。",
      "root": "upload",
      "anatomy": [
        "触发器/拖拽区",
        "文件说明",
        "文件列表",
        "进度",
        "预览",
        "失败操作"
      ],
      "variants": [
        "button",
        "drag",
        "picture-card",
        "file-list"
      ],
      "sizes": [
        "compact",
        "standard"
      ],
      "states": [
        "default",
        "hover",
        "uploading",
        "success",
        "error",
        "disabled"
      ],
      "rules": "明确格式与大小限制；上传中可取消；失败可重试；图片支持预览与删除确认。",
      "tokens": [
        "upload.*",
        "progress.*",
        "file-list.*",
        "color.status.*"
      ],
      "source": "C-31-upload/contract.js"
    },
    "C-32": {
      "id": "C-32",
      "name": "Avatar",
      "purpose": "表达用户、组织或协作成员身份。",
      "root": "avatar",
      "anatomy": [
        "图片/文字/图标",
        "形状容器",
        "状态点",
        "群组计数",
        "信息文本",
        "右上角徽标"
      ],
      "variants": [
        "image",
        "text",
        "icon",
        "group",
        "with-status",
        "with-text",
        "with-secondary-text",
        "with-top-badge"
      ],
      "sizes": [
        "24",
        "32",
        "40",
        "48",
        "64"
      ],
      "states": [
        "default",
        "hover",
        "loading",
        "fallback",
        "offline",
        "online"
      ],
      "rules": "图片加载失败回退文字或图标；群组重叠保留边界并在末尾显示剩余数；信息头像用主信息或主/次信息横向排列；右上角徽标组合 C-33 的红/灰字符数量（最多三字符或 …）或状态点，以头像右上 45° 对角锚定。",
      "tokens": [
        "avatar.*",
        "color.avatar.*",
        "border.surface",
        "badge.*",
        "typography.*"
      ],
      "source": "C-32-avatar/contract.js"
    },
    "C-33": {
      "id": "C-33",
      "name": "Badge",
      "purpose": "表达未读、更新、待办、在线协同或有限数量。",
      "root": "badge",
      "anatomy": [
        "点/字符/图标/角标",
        "容器背景",
        "字符或图标",
        "1px 内描边",
        "2px 白色隔离边",
        "调用方宿主"
      ],
      "variants": [
        "dot",
        "character",
        "icon",
        "corner"
      ],
      "sizes": [
        "6-dot",
        "8-dot",
        "10-dot",
        "14-character",
        "14-icon",
        "20-triangle",
        "8x12-rectangle",
        "14x18-flag"
      ],
      "states": [
        "fill",
        "inner-stroke",
        "fill-stroke",
        "overflow",
        "light",
        "dark"
      ],
      "rules": "四类型必须互斥：dot 使用 6/8/10px；character 高 14px、10px Medium，单字符为圆形、多字符左右 4px，超过 999 使用省略号；icon 容器 14×14px、内部图标 8×8px；corner 仅使用三角 20×20、矩形 8×12 和旗帜 14×18 三种原生形态。图标必须在容器内光学居中。点状徽标尾随文字间距 4px，字符徽标尾随文字间距 2px；圆形或图标宿主使用 45° 对角锚点；角标贴齐 top/right=0。fill、inner-stroke 和 fill-stroke 不得叠加；inner-stroke 仅用于灰色点状徽标，fill-stroke 仅用于协作或重叠宿主。宿主 DOM 与定位由调用方组合，不是 Badge 内部像素 prop。",
      "tokens": [
        "badge.*",
        "color.red.500",
        "color.neutral.400",
        "color.turquoise.600",
        "color.blue.300",
        "color.yellow.500",
        "color.carmine",
        "radius.pill",
        "typography.*"
      ],
      "source": "C-33-badge/contract.js"
    },
    "C-34": {
      "id": "C-34",
      "name": "Card",
      "purpose": "承载独立对象、摘要、组合内容或单一入口，不作为默认页面容器。",
      "root": "card",
      "anatomy": [
        "卡片表面",
        "标题与额外操作区（可选）",
        "正文区",
        "媒体与 Meta 区（可选）",
        "C-32 头像（可选）",
        "C-03/C-04 操作区（可选）",
        "C-41 Tabs（可选）",
        "C-47 骨架区（加载时）",
        "C-34 子卡片（网格/嵌套时）"
      ],
      "variants": [
        "basic", "compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive"
      ],
      "sizes": [
        "default", "small"
      ],
      "states": [
        "default",
        "hover",
        "focus",
        "pressed",
        "selected",
        "loading"
      ],
      "rules": "所有视觉使用本库 Token。bordered/borderless 与 hoverable 是独立维度；loading 由 C-47 拥有；头像、文字操作、图标操作和 Tabs 分别由 C-32/C-03/C-04/C-41 拥有；网格和嵌套只组合同一 C-34 Renderer。content-grid 相邻分隔与内角属于组合结构，只有外轮廓跟随全局圆角。interactive 固定 bordered/hoverable，selected 仅属于 interactive。禁止 HTML/Node/class/style 参数。",
      "tokens": [
        "card.*",
        "border.surface",
        "radius.surface",
        "shadow.*",
        "typography.*",
        "space.*",
        "loading.skeleton"
      ],
      "source": "C-34-card/contract.js"
    },
    "C-35": {
      "id": "C-35",
      "name": "Accordion",
      "purpose": "折叠低频信息并保持标题可扫描。",
      "root": "accordion",
      "anatomy": [
        "标题触发器",
        "展开箭头",
        "说明",
        "内容区",
        "分隔线"
      ],
      "variants": [
        "single",
        "multiple",
        "bordered",
        "ghost"
      ],
      "sizes": [
        "compact",
        "standard"
      ],
      "states": [
        "collapsed",
        "hover",
        "focus",
        "expanded",
        "disabled"
      ],
      "rules": "标题整行可点击；展开状态持久；禁止嵌套超过两层。",
      "tokens": [
        "accordion.*",
        "divider",
        "space.*",
        "motion.base"
      ],
      "source": "C-35-accordion/contract.js"
    },
    "C-36": {
      "id": "C-36",
      "name": "Empty State",
      "purpose": "搜索无结果、无权限、无数据、文件作废或删除、404 页面占位。",
      "root": "empty",
      "anatomy": [
        "Sketch 插图",
        "标题",
        "说明",
        "主要操作",
        "次要操作"
      ],
      "variants": [
        "no-result",
        "permission",
        "no-data",
        "deleted",
        "not-found"
      ],
      "sizes": [
        "compact",
        "standard"
      ],
      "states": [
        "default"
      ],
      "rules": "使用 Sketch E10.4.5 原始插图与文案；surface white/gray 选择白底或灰底专用素材；standard 为页面大图 128px，compact 为模块小图 64px；not-found 仅允许 standard。标题可选，说明必填；最多两个操作，沿用现有按钮。",
      "tokens": [
        "empty.*",
        "illustration.*",
        "typography.*",
        "button.*"
      ],
      "source": "C-36-empty-state/contract.js"
    },
    "C-37": {
      "id": "C-37",
      "name": "Image Preview",
      "purpose": "查看单图或多图并提供缩放、旋转和切换。",
      "root": "image-preview",
      "anatomy": [
        "遮罩",
        "图像舞台",
        "工具栏",
        "缩放",
        "旋转",
        "切换",
        "状态通知"
      ],
      "variants": [
        "single",
        "gallery",
        "inline"
      ],
      "sizes": [
        "viewport"
      ],
      "states": [
        "loading",
        "default",
        "zoomed",
        "error",
        "disabled"
      ],
      "rules": "工具栏不遮挡主体；多图显示当前位置；失败态保留关闭与下载等可用操作。",
      "tokens": [
        "image-preview.*",
        "mask",
        "toolbar.*",
        "layer.dialog"
      ],
      "source": "C-37-image-preview/contract.js"
    },
    "C-38": {
      "id": "C-38",
      "name": "Placeholder",
      "purpose": "在资源缺失或加载失败时维持局部容器结构。",
      "root": "placeholder",
      "anatomy": [
        "占位背景",
        "图标",
        "尺寸",
        "可访问说明"
      ],
      "variants": [
        "default",
        "failure",
        "custom"
      ],
      "sizes": [
        "24",
        "36",
        "48",
        "64"
      ],
      "states": [
        "default",
        "failure",
        "custom"
      ],
      "rules": "仅用于局部资源占位；默认固定灰色实心 image，加载失败固定灰色实心 broken_image 且背景透明。仅 custom 可选择其他图标，并沿用中性灰色及常规占位背景，不随品牌主题色变色。加载骨架属于 C-47 Loading，不得通过 Placeholder 伪装。",
      "tokens": [
        "placeholder.*",
        "color.bg.*",
        "radius.*"
      ],
      "source": "C-38-placeholder/contract.js"
    },
    "C-39": {
      "id": "C-39",
      "name": "Popover",
      "purpose": "展示上下文详情或包含轻量操作的补充内容。",
      "root": "popover",
      "anatomy": [
        "触发器",
        "箭头",
        "标题",
        "内容",
        "操作区",
        "状态通知"
      ],
      "variants": [
        "information",
        "interactive",
        "confirmation"
      ],
      "sizes": [
        "small",
        "large"
      ],
      "states": [
        "default",
        "open",
        "loading",
        "error"
      ],
      "rules": "根据可用空间自动避让并保留 16px 安全边距；可交互内容通过点击打开；短说明使用 Tooltip。",
      "tokens": [
        "popover.*",
        "shadow.float",
        "layer.popover",
        "space.*"
      ],
      "source": "C-39-popover/contract.js"
    },
    "C-40": {
      "id": "C-40",
      "name": "Data Table",
      "purpose": "展示可比较记录以及排序、筛选、选择和操作。",
      "root": "table",
      "anatomy": [
        "标题操作栏",
        "表头",
        "调用方列",
        "内容行",
        "选择与浮动批量操作",
        "排序筛选",
        "固定列",
        "树形、分组与嵌套展开",
        "直接行操作与 More 菜单",
        "编辑",
        "分页"
      ],
      "variants": [
        "default",
        "traditional",
        "tree",
        "grouped",
        "nested"
      ],
      "sizes": [
        "compact-8",
        "standard-12",
        "comfortable-16"
      ],
      "states": [
        "default",
        "hover",
        "selected",
        "sorted",
        "filtered",
        "expanded",
        "editing",
        "loading",
        "empty",
        "error",
        "disabled"
      ],
      "rules": "五种生产类型使用严格结构化调用方数据；default/tree/grouped/nested 仅横向分割线，traditional 完整边框且唯一允许 multiLevelHeader。标题工具栏、选择浮动批量、排序筛选、内容类型、编辑、分页和前后固定列为正交组合。三项及以内行操作直接显示；超过三项时显示前两项，其余由真实 C-04 More 菜单承载。选择列 40px、展开列 28px；其余列按类型与内容比例响应，固定列宽使用语义预设。内部 checkbox/button/icon button/More menu/input/switch/avatar/badge/tag/pagination 必须组合真实 C-11/C-02/C-03/C-04/C-21/C-27/C-32/C-33/C-42/C-15 Renderer。",
      "tokens": [
        "table.*",
        "checkbox.C-11",
        "button.C-02.C-03.C-04",
        "menu.C-04.C-08",
        "pagination.C-15",
        "input.C-21",
        "switch.C-27",
        "avatar.C-32",
        "badge.C-33",
        "tag.C-42"
      ],
      "source": "C-40-data-table/contract.js"
    },
    "C-41": {
      "id": "C-41",
      "name": "Tabs",
      "purpose": "切换同层级内容并保持当前项可见。",
      "root": "tabs",
      "anatomy": [
        "容器",
        "标签标题",
        "激活指示",
        "分割线",
        "数量徽标",
        "翻页",
        "新增",
        "关闭",
        "溢出菜单",
        "内容区"
      ],
      "variants": [
        "line",
        "capsule",
        "card"
      ],
      "sizes": [
        "large",
        "medium",
        "small"
      ],
      "states": [
        "default",
        "hover",
        "focus",
        "active",
        "disabled",
        "overflow"
      ],
      "rules": "可选 panelContainer 由 C-41 挂载并清理外部内容面板；line 支持 large/medium/small，capsule 支持 medium/small，card 支持 large/medium/small；新增与关闭仅用于 card；滚动可用于所有视觉变体，箭头仅在实际宽度不足时显示；scrollable 与非空 overflowItems 互斥；更多菜单只用于 line/capsule 并以末项替换保持当前项可见；少量短内容不创建 Tabs。",
      "tokens": [
        "tabs.*",
        "color.action.*",
        "divider",
        "space.*",
        "motion.*"
      ],
      "source": "C-41-tabs/contract.js"
    },
    "C-42": {
      "id": "C-42",
      "name": "Tag",
      "purpose": "表达真实状态、分类或已选筛选条件。",
      "root": "tag",
      "anatomy": [
        "文本",
        "状态色",
        "图标（可选）",
        "关闭按钮（可选）"
      ],
      "variants": [
        "status",
        "category",
        "filter",
        "closable",
        "checkable",
        "loading",
        "bordered"
      ],
      "sizes": [
        "16",
        "20",
        "24-default",
        "32"
      ],
      "states": [
        "default",
        "hover",
        "focus",
        "active",
        "selected",
        "disabled",
        "loading",
        "enter",
        "leave"
      ],
      "rules": "未特别说明尺寸时统一使用 24px；状态标签使用语义色且含文字；分类色克制；筛选标签可关闭、可选择并提供恢复路径；禁止装饰性标签。",
      "tokens": [
        "tag.*",
        "color.status.*",
        "radius.*",
        "typography.*",
        "motion.*"
      ],
      "source": "C-42-tag/contract.js"
    },
    "C-43": {
      "id": "C-43",
      "name": "Timeline",
      "purpose": "展示审批轨迹或按时间排序的事件。",
      "root": "timeline",
      "anatomy": [
        "时间",
        "节点",
        "连接线",
        "标题",
        "说明",
        "加载项"
      ],
      "variants": [
        "vertical",
        "horizontal",
        "alternate",
        "breakpoint"
      ],
      "sizes": [
        "compact",
        "standard",
        "spacious"
      ],
      "states": [
        "default",
        "done",
        "current",
        "waiting",
        "success",
        "warning",
        "error",
        "loading",
        "expanded"
      ],
      "rules": "时间轴节点只读展示，不提供点击或选择；节点状态与文本同时表达；长记录可通过独立折叠控件分段展开。",
      "tokens": [
        "timeline.*",
        "color.status.*",
        "space.*",
        "typography.*",
        "motion.*"
      ],
      "source": "C-43-timeline/contract.js"
    },
    "C-44": {
      "id": "C-44",
      "name": "Tooltip",
      "purpose": "解释图标或被截断的短内容。",
      "root": "tooltip",
      "anatomy": [
        "触发器",
        "浮层",
        "箭头",
        "文本"
      ],
      "variants": [
        "top",
        "right",
        "bottom",
        "left",
        "multiline"
      ],
      "sizes": [
        "compact",
        "standard"
      ],
      "states": [
        "hidden",
        "delayed",
        "visible",
        "focus"
      ],
      "rules": "用于短说明；默认延迟显示；支持键盘 Focus；长内容改用 Popover。",
      "tokens": [
        "tooltip.*",
        "shadow.float",
        "layer.popover",
        "motion.fast"
      ],
      "source": "C-44-tooltip/contract.js"
    },
    "C-45": {
      "id": "C-45",
      "name": "Dialog",
      "purpose": "承载短、聚焦、可中断的任务。",
      "root": "dialog",
      "anatomy": [
        "遮罩",
        "容器",
        "语义图标",
        "标题与描述",
        "C-04 关闭按钮",
        "内容组件组合",
        "C-02 操作区"
      ],
      "variants": [
        "confirmation",
        "notification",
        "success",
        "warning",
        "error",
        "destructive",
        "form",
        "task",
        "choice",
        "settings",
        "preferences",
        "subscription"
      ],
      "sizes": [
        "small",
        "medium",
        "large",
        "extra-large"
      ],
      "states": [
        "default",
        "focus",
        "loading",
        "error",
        "destructive"
      ],
      "rules": "圆角 8px；宽度 420/600/840/1080px；遮罩 rgba(0,0,0,.55)；标题采用 heading-4 语义字号，关闭按钮采用 C-04 medium 32px/18px 图标且不显示 Tooltip，只保留 aria-label。对话框仅拥有外壳、语义状态、层级、组合布局与滚动；表单、任务、单选、标签页、选择器、开关、头像和按钮必须复用真实子 Renderer。Task 内容使用宽度自适应的内部框；操作区支持 1—3 个横排按钮；仅 body 真实溢出并滚动时显示头尾 1px 分割线；支持关闭按钮、取消、替代、确认、ESC 与遮罩退出；长流程不使用 Dialog。",
      "tokens": [
        "dialog.*",
        "mask",
        "shadow.dialog",
        "layer.dialog"
      ],
      "source": "C-45-dialog/contract.js"
    },
    "C-46": {
      "id": "C-46",
      "name": "Drawer",
      "purpose": "在保留页面上下文时查看或编辑辅助内容。",
      "root": "drawer",
      "anatomy": [
        "遮罩",
        "侧滑容器",
        "标题",
        "关闭",
        "可滚动内容",
        "固定操作区"
      ],
      "variants": [
        "overlay",
        "push"
      ],
      "sizes": [
        "small",
        "medium",
        "large"
      ],
      "states": [
        "rendered",
        "focus",
        "dismissing",
        "hidden"
      ],
      "rules": "右侧覆盖型与小尺寸非模态挤压型；标题和操作区固定，内容独立滚动；空白处、关闭按钮或底部操作均可关闭。",
      "tokens": [
        "drawer.*",
        "mask",
        "shadow.dialog",
        "layer.dialog"
      ],
      "source": "C-46-drawer/contract.js"
    },
    "C-47": {
      "id": "C-47",
      "name": "Loading",
      "purpose": "反馈局部或全局处理中状态。",
      "root": "loading",
      "anatomy": [
        "Spinner/骨架",
        "遮罩（可选）",
        "说明文本"
      ],
      "variants": [
        "spinner",
        "spinner-only",
        "skeleton",
        "overlay"
      ],
      "sizes": [
        "small",
        "medium",
        "large"
      ],
      "states": [
        "loading"
      ],
      "rules": "默认 medium。spinner 用于独立加载提示；spinner-only 仅显示图标，text 仅作读屏名称；skeleton 用于初始内容占位，三档头像 32/40/48px、文本 12/14/16px、图片 96/120/144px；overlay 是带 60% 白色蒙层和区域轮廓的加载占位，不接收或遮盖调用方 DOM，也不锁定焦点；按钮加载由 C-02 的 loading 状态组合；插画不属于 C-47。",
      "tokens": [
        "loading.*",
        "skeleton.*",
        "motion.*",
        "mask.subtle"
      ],
      "source": "C-47-loading/contract.js"
    },
    "C-48": {
      "id": "C-48",
      "name": "Notification",
      "purpose": "反馈系统推送、复杂信息与跨区域异步结果，并允许用户执行后续操作。",
      "root": "notification",
      "anatomy": [
        "4px 状态色边",
        "24px 状态图标",
        "标题",
        "正文",
        "操作区",
        "16px 关闭按钮",
        "420px 容器"
      ],
      "variants": [
        "information",
        "success",
        "warning",
        "error",
        "without-icon",
        "custom"
      ],
      "sizes": [
        "420-width",
        "24-padding",
        "24-icon",
        "16-icon-content-gap",
        "16-close-offset",
        "8-content-gap",
        "12-action-gap"
      ],
      "states": [
        "enter",
        "visible",
        "hover",
        "closing",
        "auto-dismiss",
        "persistent"
      ],
      "rules": "严格按源图：容器宽 420px、四周内容间距 24px；状态色边固定在左侧，信息/成功/警告/错误依次使用 B500/G500/O500/R500；图标 24×24px 且使用圆形填充图标；标题 16/24 Medium，正文 14/22 Regular，标题、正文和操作区垂直间距 8px；关闭按钮 16×16px，距顶部和右侧各 16px；主次按钮右对齐且间距 12px。通知支持右上和右下定位，距对应视口边缘 16px，保留 inline 嵌入兼容；从右侧滑入 400ms 并轻微回弹，退场淡出并收起高度 300ms（参考 Arco Notification），减少动态效果时立即切换。默认 4 秒自动消失，可选 6 秒、8 秒或持续显示；没有关闭按钮时必须自动消失。Hover / Focus 暂停剩余时间，离开后继续。移除标签能力。",
      "tokens": [
        "notification.width.420",
        "notification.padding.24",
        "notification.accent.4",
        "notification.icon.24",
        "notification.close.16",
        "notification.gap.8",
        "notification.action-gap.12",
        "shadow.float",
        "layer.toast",
        "motion.*"
      ],
      "source": "C-48-notification/contract.js"
    },
    "C-49": {
      "id": "C-49",
      "name": "Alert",
      "purpose": "持续展示风险、说明或异常。",
      "root": "alert",
      "anatomy": [
        "状态图标",
        "标题",
        "说明",
        "操作",
        "关闭"
      ],
      "variants": [
        "information",
        "success",
        "warning",
        "error"
      ],
      "sizes": [
        "adaptive"
      ],
      "states": [
        "default",
        "with-action",
        "closable"
      ],
      "rules": "与容器等宽、占据文档流，高度随内容撑开；状态图标为 20px 面性图标，与关闭按钮对齐首行。单行操作默认靠右；空间不足、多行或有标题时另起一行，与正文左对齐。follow 单行时跟随正文。center 仅支持无标题单行，操作跟随文字，溢出省略并通过原生悬停提示保留全文。关闭始终最右，持续存在直到条件消失或用户关闭。",
      "tokens": [
        "alert.*",
        "color.status.*",
        "border.status.*",
        "space.*"
      ],
      "source": "C-49-alert/contract.js"
    },
    "C-50": {
      "id": "C-50",
      "name": "Toast",
      "purpose": "短暂反馈已完成的即时操作。",
      "root": "toast",
      "anatomy": [
        "状态图标",
        "短文本",
        "操作（可选）",
        "关闭（可选）"
      ],
      "variants": [
        "information",
        "success",
        "warning",
        "error",
        "loading"
      ],
      "sizes": [
        "single-line",
        "two-line"
      ],
      "states": [
        "enter",
        "visible",
        "hover",
        "closing"
      ],
      "rules": "单行高40px，两行模式高60px；图标、文字、操作与关闭对齐首行，操作数量不改变高度。位置支持行内及页面顶部居中、右上、底部居中、右下；提示在当前页面定位，同位置提示依次排列。默认自动消失，Hover或键盘焦点暂停；不可承载必须阅读的信息或复杂决定。",
      "tokens": [
        "toast.*",
        "shadow.float",
        "layer.toast",
        "motion.*"
      ],
      "source": "C-50-toast/contract.js"
    },
    "C-51": {
      "id": "C-51",
      "name": "Progress",
      "purpose": "展示可量化任务进度或不确定处理中状态。",
      "root": "progress",
      "anatomy": [
        "轨道",
        "进度",
        "百分比",
        "状态图标",
        "说明"
      ],
      "variants": [
        "line",
        "circle",
        "steps",
        "indeterminate"
      ],
      "sizes": [
        "4-line",
        "16-circle",
        "4-steps"
      ],
      "states": [
        "not-started",
        "progress",
        "success",
        "error"
      ],
      "rules": "确定任务显示真实百分比；未知进度使用不确定态；失败使用语义错误色；圆环按 0–100% 填充，数值可置于左右；线形和分段轨道均为 4px。",
      "tokens": [
        "progress.*",
        "color.status.*",
        "motion.*",
        "typography.*"
      ],
      "source": "C-51-progress/contract.js"
    }
  };
  contracts["C-52"] = {
  "id": "C-52",
  "name": "AI聊天框",
  "purpose": "通过参数配置历史记录、AI对话、工具状态、资源卡和输入区样式。",
  "root": "ai-chat",
  "anatomy": [
    "历史侧栏",
    "顶栏",
    "消息列表",
    "用户气泡",
    "AI回复",
    "耗时与工具状态",
    "资源卡",
    "附件卡片",
    "输入区",
    "C-04图标操作",
    "C-06资源菜单",
    "C-23模型选择",
        "C-49错误提示"
  ],
  "variants": [
    "panel",
    "sidebar"
  ],
  "sizes": [
    "small",
    "medium",
    "large"
  ],
  "states": [
    "idle",
    "generating",
    "error",
    "disabled"
  ],
  "rules": "默认medium。无消息、idle 且无活动会话时显示新对话，欢迎语与建议居中、输入框位于底部，不显示会话标题；历史可保留且无选中项。有消息或活动会话时进入对话布局。历史栏在窄容器内限宽滑出，保留部分聊天可见；支持减少动效。消息区独立滚动；菜单按真实裁切边界定位。C-04/C-06拥有操作和菜单；圆角引用全局Token。空输入禁用发送，有输入或附件时可发送，生成中显示停止。仅展示样式并发事件，不执行模型请求、上传、资源导航或历史存储。 标题/消息/输入区共用内容列；附件/模型/发送控件统一32px，发送说明合并进默认placeholder。C-23负责无边框模型选择，C-49在消息流中的失败回复内提供错误提示与重试，已有部分回复保留；输入区不承载生成错误；error状态下errorMessage不得为空。",
  "tokens": [
    "color.*",
    "space.*",
    "radius.*",
    "focus.ring",
    "motion.*"
  ],
  "source": "C-52-ai-chat/contract.js"
};
  Object.keys(contracts).forEach(function (id) { Object.freeze(contracts[id]); });
  components.contracts = Object.freeze(contracts);
})(window);
