(function registerComponentSpecimen() {
  "use strict";
  var D = window.B2BDesignSource;
  var H = D.componentSpecimenHelpers;

  function renderSpecimen() {
    var icon = H.icon;
    var cell = H.cell;
    var row = H.row;
    var avatarSpec = H.avatarSpec;
    var badgeSpec = H.badgeSpec;
    var sourceBadge = H.sourceBadge;

    function avatarHost(options) {
      var opts = options || {};
      var hostSize = opts.hostSize || 40;
      var badgeSize = opts.size || (opts.type === "icon" || opts.type === "character" ? 14 : 10);
      var inset = hostSize * 0.146447 - badgeSize / 2;
      return '<span class="badge-avatar-host is-' + (opts.position || "top") + (opts.reference ? " is-reference" : "") + '" style="--badge-host-size:' + hostSize + "px;--badge-anchor-inset:" + inset.toFixed(2) + 'px">' +
        avatarSpec({ text: opts.text || "A", icon: opts.avatarIcon, size: hostSize, className: opts.reference ? "badge-reference-avatar" : "" }) +
        badgeSpec({
          type: opts.type || "dot",
          text: opts.badgeText || "",
          icon: opts.icon,
          color: opts.color || "red",
          size: badgeSize,
          appearance: opts.appearance || "fill"
        }) +
      "</span>";
    }

    function iconHost(options) {
      var opts = options || {};
      var hostSize = opts.hostSize || 32;
      var badgeSize = opts.size || (opts.type === "icon" || opts.type === "character" ? 14 : 8);
      var inset = hostSize * 0.146447 - badgeSize / 2;
      return '<span class="badge-icon-host is-' + (opts.position || "top") + '" style="--badge-host-size:' + hostSize + "px;--badge-anchor-inset:" + inset.toFixed(2) + 'px">' +
        icon(opts.hostIcon || "notifications") +
        badgeSpec({
          type: opts.type || "dot",
          text: opts.badgeText || "",
          icon: opts.icon,
          color: opts.color || "red",
          size: badgeSize,
          appearance: opts.appearance || "fill"
        }) +
      "</span>";
    }

    function constructionHost(position, color) {
      return '<span class="badge-construction-host is-' + position + '">' +
        '<i class="badge-construction-circle"></i>' +
        badgeSpec({ type: "dot", size: 10, color: color || "red", appearance: "fill-stroke" }) +
      "</span>";
    }

    function appIconHost(size, color, iconName) {
      var badgeSize = 14;
      var inset = size * 0.146447 - badgeSize / 2;
      return '<span class="badge-reference-app-host" style="--badge-host-size:' + size + "px;--badge-anchor-inset:" + inset.toFixed(2) + 'px">' +
        icon("auto_awesome") +
        badgeSpec({ type: "icon", icon: iconName || "tag", size: badgeSize, color: color || "green", appearance: "fill-stroke" }) +
      "</span>";
    }

    function applicationCard(color, title, description) {
      return '<article class="badge-application-card">' +
        '<span class="badge-app-logo">' + title.slice(0, 1) + "</span>" +
        '<span class="badge-application-copy"><strong><i class="source-badge is-dot is-' + color + '" style="--badge-size:8px"></i>' + title + '</strong><small>' + description + "</small></span>" +
      "</article>";
    }

    function typeOverview() {
      return '<div class="badge-type-overview">' +
        '<article class="is-dot-type"><div class="badge-type-samples">' +
          badgeSpec({ type: "dot", color: "red", size: 10 }) +
          badgeSpec({ type: "dot", color: "gray", size: 10 }) +
          badgeSpec({ type: "dot", color: "green", size: 6 }) +
          badgeSpec({ type: "dot", color: "blue", size: 8 }) +
          badgeSpec({ type: "dot", color: "gray", size: 6, appearance: "inner-stroke" }) +
        '</div><strong>点状徽标</strong><small>Dot logo</small></article>' +
        '<article class="is-character-type"><div class="badge-type-samples">' +
          badgeSpec({ type: "character", text: "9", color: "gray" }) +
          badgeSpec({ type: "character", text: "99" }) +
          badgeSpec({ type: "character", text: "•••" }) +
          badgeSpec({ type: "dot", color: "red", size: 10 }) +
          badgeSpec({ type: "character", text: "New" }) +
          sourceBadge({ variant: "character", text: "99", color: "gray", size: 14, appearance: "light" }) +
        '</div><strong>字符徽标</strong><small>Character logo</small></article>' +
        '<article class="is-icon-type"><div class="badge-type-samples">' +
          badgeSpec({ type: "icon", icon: "chat_bubble", color: "gray" }) +
          badgeSpec({ type: "icon", icon: "tag", color: "green" }) +
          badgeSpec({ type: "icon", icon: "priority_high" }) +
        '</div><strong>图标徽标</strong><small>Icon logo</small></article>' +
        '<article class="is-corner-type"><div class="badge-type-samples badge-corner-samples">' +
          sourceBadge({ variant: "corner", cornerShape: "triangle" }) +
          sourceBadge({ variant: "corner", cornerShape: "rectangle" }) +
        '</div><strong>角徽标</strong><small>Corner logo</small></article>' +
      "</div>";
    }

    function dotColorBoard() {
      var primary = [
        ["red", "Red", "R500"],
        ["gray", "Grey", "N400"],
        ["green", "Green", "T600"],
        ["blue", "Blue", "B300"]
      ].map(function (item) {
        return '<span class="badge-color-item">' +
          badgeSpec({ type: "dot", color: item[0], size: 8 }) +
          '<span><strong>' + item[1] + ' dot badge</strong><small>Background · ' + item[2] + "</small></span>" +
        "</span>";
      }).join("");
      var palette = [
        ["B500", "T300", "L700", "O500", "C600", "P300", "W600", "G600", "R400", "Y700"],
        ["V600", "I500", "W400", "G700", "O700", "C300", "P500", "T500", "L600", "O300"],
        ["C700", "P600", "L500", "R600", "B700", "O600", "B400", "P400", "T700", "V400"],
        ["R500", "I600", "B300", "G400", "I400", "T600", "V500", "W500", "C500"]
      ];
      var families = {
        B: "blue",
        T: "turquoise",
        L: "lime",
        O: "orange",
        C: "carmine",
        P: "purple",
        W: "wathet",
        G: "green",
        R: "red",
        Y: "yellow",
        V: "violet",
        I: "indigo"
      };
      return '<div class="badge-color-board"><div class="badge-primary-colors">' + primary + '</div><div class="badge-collaboration-palette"><header><strong>Colors for collaborative functions</strong><small>39 种协同色 · Background 色阶 + N00 2px 隔离边</small></header><div>' +
        palette.map(function (column) {
          return '<div class="badge-palette-column">' + column.map(function (code) {
            return '<span><i class="badge-palette-dot is-family-' + families[code[0]] + ' is-scale-' + code.slice(1) + '"></i><small>Background · ' + code + '<br>Border · N00 2px</small></span>';
          }).join("") + "</div>";
        }).join("") +
      "</div></div></div>";
    }

    function dotSizeBoard() {
      return '<div class="badge-measure-board">' +
        '<span>' + badgeSpec({ type: "dot", size: 6, color: "green" }) + '<strong>6 × 6px</strong><small>较小文字、图标、窄卡片</small></span>' +
        '<span>' + badgeSpec({ type: "dot", size: 8 }) + '<strong>8 × 8px</strong><small>列表、图标、应用更新</small></span>' +
        '<span>' + badgeSpec({ type: "dot", size: 10 }) + '<strong>10 × 10px</strong><small>头像场景</small></span>' +
      "</div>";
    }

    function dotAppearanceBoard() {
      return '<div class="badge-appearance-board">' +
        '<article><div>' + badgeSpec({ type: "dot", size: 10, appearance: "fill" }) + '</div><strong>Fill only</strong><small>Background · R500</small></article>' +
        '<article><div class="is-surface">' + badgeSpec({ type: "dot", size: 10, appearance: "inner-stroke" }) + '</div><strong>Inner stroke only</strong><small>Border · N600 1px</small></article>' +
        '<article><div class="is-dark">' + badgeSpec({ type: "dot", size: 10, color: "blue", appearance: "fill-stroke" }) + '</div><strong>Fill + stroke</strong><small>仅用于协同场景 · N00 2px</small></article>' +
      "</div>";
    }

    function dotPositionBoard() {
      return '<div class="badge-position-reference">' +
        '<section><span>Top right corner position</span>' + constructionHost("top", "red") + avatarHost({ reference: true, avatarIcon: "person", hostSize: 48, size: 10, position: "top", color: "red", appearance: "fill-stroke" }) + "</section>" +
        '<section><span>Lower right corner position</span>' + constructionHost("bottom", "red") + avatarHost({ reference: true, avatarIcon: "person", hostSize: 48, size: 10, position: "bottom", color: "green", appearance: "fill-stroke" }) + "</section>" +
      "</div>";
    }

    function characterColorBoard() {
      return '<div class="badge-character-color-board">' +
        '<article>' + badgeSpec({ type: "character", text: "12", color: "red" }) + '<span><strong>Red background badge</strong><small>Background · R500</small></span></article>' +
        '<article>' + badgeSpec({ type: "character", text: "12", color: "gray" }) + '<span><strong>Grey background badge</strong><small>Background · N400</small></span></article>' +
        '<article>' + sourceBadge({ variant: "character", text: "142", color: "gray", size: 14, appearance: "light" }) + '<span><strong>Grey plain character</strong><small>Font · N600 · Light mode</small></span></article>' +
        '<article class="is-dark">' + sourceBadge({ variant: "character", text: "142", color: "gray", size: 14, appearance: "dark" }) + '<span><strong>White plain character</strong><small>Font · N00 · Dark mode</small></span></article>' +
      "</div>";
    }

    function characterSizeBoard() {
      return '<div class="badge-character-size-board">' +
        '<article><div>' + badgeSpec({ type: "character", text: "7", size: 14 }) + '</div><strong>单字符</strong><small>14 × 14px · 10px Medium</small></article>' +
        '<article><div>' + badgeSpec({ type: "character", text: "99", size: 14 }) + '</div><strong>多字符</strong><small>高 14px · 左右 4px</small></article>' +
        '<article><div>' + badgeSpec({ type: "character", text: "999", size: 14 }) + '</div><strong>三字符</strong><small>宽度随字符向左延伸</small></article>' +
        '<article><div>' + badgeSpec({ type: "character", text: "…", size: 14 }) + '</div><strong>超过 999</strong><small>使用「…」展示极限值</small></article>' +
        '<article><div>' + sourceBadge({ variant: "character", text: "142", color: "gray", size: 14, appearance: "light" }) + '</div><strong>纯数字</strong><small>字号不小于 12px</small></article>' +
      "</div>";
    }

    function characterPositionBoard() {
      return '<div class="badge-character-position-reference">' +
        '<span class="badge-character-position-copy">Font=N00 / 12px<br>Bg=R500</span>' +
        avatarHost({ reference: true, avatarIcon: "person", hostSize: 48, type: "character", badgeText: "2", size: 14, position: "top", appearance: "fill" }) +
        '<span class="badge-more-host"><b>…</b>' + badgeSpec({ type: "character", text: "3", size: 14, appearance: "fill" }) + "</span>" +
      "</div>";
    }

    function iconBadgeScenes() {
      return '<div class="badge-icon-scenes">' +
        '<article class="badge-account-row">' + avatarSpec({ text: "C", size: 32 }) + '<span><strong>chase.chen@gmail.com</strong><small>The associated mailbox has expired</small></span>' + badgeSpec({ type: "icon", icon: "priority_high", color: "red" }) + '</article>' +
        '<article class="badge-topic-card"><span class="badge-topic-logo">' + icon("alternate_email") + badgeSpec({ type: "icon", icon: "check", color: "green" }) + '</span><span><strong>Topic</strong><small>When I got involved in the topic…</small></span><time>16:27</time></article>' +
        '<nav class="badge-mini-navigation"><span>' + icon("video_call") + '</span><span>' + icon("calendar_month") + '</span><span>' + icon("folder") + '</span><span class="is-active">' + icon("mail") + badgeSpec({ type: "icon", icon: "priority_high", color: "red" }) + "</span></nav>" +
      "</div>";
    }

    function iconSizeBoard() {
      return '<div class="badge-icon-size-reference">' +
        '<section><div class="badge-size-reference-copy"><strong>Container size</strong><small>Universal size 14 × 14px</small></div><div class="badge-size-reference-examples">' +
          '<span class="badge-measured-host"><i>36px</i>' + appIconHost(36, "green", "tag") + '<em>14px</em></span>' +
          '<span class="badge-measured-host"><i>32px</i>' + appIconHost(32, "green", "tag") + '<em>14px</em></span>' +
          '<span class="badge-measured-host is-avatar-pair"><i>40px</i>' + avatarHost({ reference: true, avatarIcon: "person", hostSize: 40, type: "icon", icon: "chat_bubble", color: "gray", size: 14, position: "bottom", appearance: "fill-stroke" }) + avatarHost({ reference: true, avatarIcon: "person", hostSize: 40, type: "icon", icon: "priority_high", color: "red", size: 14, position: "bottom", appearance: "fill-stroke" }) + '<em>14px</em></span>' +
        '</div></section>' +
        '<section><div class="badge-size-reference-copy"><strong>Icon size</strong><small>Universal size 8 × 8px</small></div><div class="badge-size-reference-icon">' + badgeSpec({ type: "icon", icon: "tag", color: "green", size: 14 }) + "</div></section>" +
      "</div>";
    }

    function cornerScenes() {
      return '<div class="badge-corner-scenes">' +
        '<article class="badge-chat-card"><span class="badge-chat-avatar">W</span><span><strong>Wen Ming</strong><small>Text messages · Buzzed Xiao Lv</small></span>' + sourceBadge({ variant: "corner", cornerShape: "triangle" }) + '</article>' +
        '<article class="badge-article-card">' + sourceBadge({ variant: "corner", cornerShape: "rectangle" }) + '<strong>Commercialization · Strategy and Development</strong><small>Tools that support the best</small></article>' +
        '<article class="badge-article-card is-image">' + sourceBadge({ variant: "corner", cornerShape: "flag" }) + '<strong>UX Designers</strong><small>Tools that support the best</small></article>' +
        '<div class="badge-list-corners"><p><span class="badge-list-logo">' + icon("menu") + '</span><span><strong>Design Documentation/System Main</strong><small>Zheng Ying</small></span><i class="source-corner-badge is-rectangle"></i></p><p><span class="badge-list-logo is-green">' + icon("table_view") + '</span><span><strong>Interview Duty Schedule</strong><small>Ma Zhiyuan</small></span><i class="source-corner-badge is-rectangle"></i></p></div>' +
      "</div>";
    }

    return row("使用规则", [
      cell("红点、数字或图标仅表达未读、更新、待办与有限数量", '<div class="badge-rule-summary"><div class="badge-example-row"><span>新消息</span>' + badgeSpec({ type: "dot" }) + badgeSpec({ type: "character", text: "12" }) + badgeSpec({ type: "icon", icon: "priority_high" }) + '</div><p>查看后可消失；不作为装饰，也不与 Tag 混用。</p></div>', "is-wide")
    ], "严格按 C-33 参考截图的四类徽标、色阶、尺寸、描边和宿主位置实现") +
    row("组成要素", [
      cell("容器背景 / 字符 / 图标", '<div class="badge-anatomy-board"><span>' + badgeSpec({ type: "dot", size: 10 }) + '<i>1</i></span><span>' + badgeSpec({ type: "character", text: "12" }) + '<i>2</i><i>3</i></span><span>' + badgeSpec({ type: "icon", icon: "priority_high" }) + '<i>2</i><i>3</i></span><ol><li>容器背景</li><li>字符或图标</li><li>宿主定位与隔离边</li></ol></div>', "is-wide")
    ]) +
    row("控件类型", [
      cell("Dot / Character / Icon / Corner", typeOverview(), "is-wide")
    ]) +
    row("点状徽标 · 使用场景", [
      cell("提及未读、应用更新与实时协同", '<div class="badge-scene-board"><div class="badge-mention-card"><strong>Others　@Person</strong><p>Something <mark>@Myself</mark><br><mark>@Insider</mark> <mark>@Insider</mark></p></div><div class="badge-applications">' + applicationCard("red", "Prototype", "Easily view and share") + applicationCard("blue", "Tiger BI", "Tiger BI data analysis") + '</div></div>', "is-wide")
    ], "用于未读、模块更新或在线协作；不承载长文本") +
    row("点状徽标 · 颜色说明", [
      cell("4 个通用语义色 + 39 个协同色", dotColorBoard(), "is-wide")
    ], "红 R500 / 灰 N400 / 绿 T600 / 蓝 B300；协同色必须带 N00 2px 隔离边") +
    row("点状徽标 · 尺寸说明", [
      cell("6 / 8 / 10px", dotSizeBoard(), "is-wide")
    ], "按宿主与场景选择，单页不随意混用") +
    row("点状徽标 · 样式说明", [
      cell("仅填充 / 仅内描边 / 填充＋描边", dotAppearanceBoard(), "is-wide")
    ], "填充＋描边只用于头像组、文档和邮件等协同场景") +
    row("点状徽标 · 位置说明", [
      cell("头像、文字、图标的相对位置", dotPositionBoard(), "is-wide")
    ]) +
    row("字符徽标 · 使用场景", [
      cell("新增数量、强提示与纯数字弱提示", '<div class="badge-character-scenes"><div class="badge-avatar-grid"><strong>Messages</strong><div>' + avatarHost({ text: "W", type: "character", badgeText: "7" }) + avatarHost({ text: "M", type: "character", badgeText: "12" }) + avatarHost({ text: "L", type: "character", badgeText: "99" }) + '</div></div><div class="badge-mail-navigation"><p>' + icon("inbox") + '<span>Inbox</span><em>142</em></p><p>' + icon("flag") + '<span>Flagged</span></p><p>' + icon("description") + '<span>Drafts</span><em>2</em></p><p>' + icon("share") + '<span>Shared</span><em>14</em></p></div></div>', "is-wide")
    ], "需要强调新增量时使用带背景字符；弱层级数据使用纯数字") +
    row("字符徽标 · 颜色说明", [
      cell("红底 / 灰底 / 浅色纯数字 / 深色纯数字", characterColorBoard(), "is-wide")
    ]) +
    row("字符徽标 · 尺寸说明", [
      cell("14px 高、10px Medium；纯数字不小于 12px", characterSizeBoard(), "is-wide")
    ]) +
    row("字符徽标 · 位置说明", [
      cell("宽度向左延伸，不推移宿主", characterPositionBoard(), "is-wide")
    ]) +
    row("图标徽标 · 使用场景", [
      cell("账号过期、话题关联和功能状态", iconBadgeScenes(), "is-wide")
    ], "图标必须通用直观，避免增加理解成本") +
    row("图标徽标 · 尺寸说明", [
      cell("32 / 36 / 40px 宿主统一使用 14px 徽标", iconSizeBoard(), "is-wide")
    ], "内部图标 8 × 8px；原则上图标徽标不小于 14 × 14px") +
    row("图标徽标 · 位置说明", [
      cell("右上 / 右下位置均以宿主对角线为中心", '<div class="badge-position-board is-icon"><article><div class="badge-position-pair">' + iconHost({ hostIcon: "mail", type: "icon", icon: "priority_high", position: "top" }) + iconHost({ hostIcon: "mail", type: "icon", icon: "priority_high", position: "bottom" }) + '</div><strong>图标宿主</strong><small>徽标中心与矩形对角线重合</small></article><article><div class="badge-position-pair">' + avatarHost({ text: "A", type: "icon", icon: "check", color: "green", position: "bottom" }) + avatarHost({ text: "B", type: "icon", icon: "priority_high", color: "red", position: "top" }) + '</div><strong>头像宿主</strong><small>右下可表达在线或协同状态</small></article></div>', "is-wide")
    ]) +
    row("角徽标 · 使用场景", [
      cell("列表、卡片和消息内容的状态标记", cornerScenes(), "is-wide")
    ], "角徽标用于引导注意力；不得遮挡标题、头像或关键操作") +
    row("角徽标 · 通用样式规则", [
      cell("三角形 / 矩形 / 旗帜形", '<div class="badge-corner-type-board"><article><span class="corner-shape-stage"><i class="source-corner-badge is-triangle"></i></span><strong>Triangle</strong><small>消息、会话待处理</small></article><article><span class="corner-shape-stage"><i class="source-corner-badge is-rectangle"></i></span><strong>Rectangle</strong><small>列表更新、时间旁标记</small></article><article><span class="corner-shape-stage"><i class="source-corner-badge is-flag"></i></span><strong>Flag</strong><small>内容卡片、文档标记</small></article></div>', "is-wide")
    ], "形状与颜色依据状态和产品风格选择，放在最容易注意且不遮挡信息的位置");
  }

  var docsApi = D.componentApiDocs;
  var docsRevision = 0;
  var badgeVariants = ["dot", "character", "icon", "corner"];
  var badgeLabels = { dot: "点状徽标", character: "字符徽标", icon: "图标徽标", corner: "角标徽标" };
  var appearanceLabels = { fill: "仅填充", "inner-stroke": "仅内描边", "fill-stroke": "填充 + 隔离边", light: "浅色纯字符", dark: "深色纯字符" };
  var cornerColors = { triangle: "red", rectangle: "yellow", flag: "carmine" };
  var cornerByColor = { red: "triangle", yellow: "rectangle", carmine: "flag" };

  function normalizeSelection(selection, changedKey) {
    if (changedKey === "variant") {
      if (selection.variant === "dot") {
        selection.color = "red"; selection.size = "8"; selection.appearance = "fill"; selection.content = "none"; selection.icon = "none"; selection.cornerShape = "none";
      } else if (selection.variant === "character") {
        selection.color = "red"; selection.size = "14"; selection.appearance = "fill"; selection.content = "99+"; selection.icon = "none"; selection.cornerShape = "none";
      } else if (selection.variant === "icon") {
        selection.color = "green"; selection.size = "14"; selection.appearance = "fill"; selection.content = "none"; selection.icon = "check"; selection.cornerShape = "none";
      } else {
        selection.color = "red"; selection.size = "native"; selection.appearance = "fill"; selection.content = "none"; selection.icon = "none"; selection.cornerShape = "triangle";
      }
      return selection;
    }
    if (changedKey === "appearance" && selection.variant === "dot" && selection.appearance === "inner-stroke") selection.color = "gray";
    if (changedKey === "appearance" && selection.variant === "character" && ["light", "dark"].indexOf(selection.appearance) >= 0) selection.color = "gray";
    if (changedKey === "color" && selection.variant === "dot" && selection.appearance === "inner-stroke" && selection.color !== "gray") selection.appearance = "fill";
    if (changedKey === "color" && selection.variant === "character" && ["light", "dark"].indexOf(selection.appearance) >= 0 && selection.color !== "gray") selection.appearance = "fill";
    if (changedKey === "color" && selection.variant === "corner" && cornerByColor[selection.color]) selection.cornerShape = cornerByColor[selection.color];
    if (changedKey === "cornerShape" && selection.cornerShape !== "none") selection.color = cornerColors[selection.cornerShape];
    return selection;
  }

  function isSelectionAllowed(selection) {
    if (selection.variant === "dot") {
      return ["6", "8", "10"].indexOf(selection.size) >= 0 &&
        ["fill", "inner-stroke", "fill-stroke"].indexOf(selection.appearance) >= 0 &&
        ["red", "gray", "green", "blue"].indexOf(selection.color) >= 0 &&
        (selection.appearance !== "inner-stroke" || selection.color === "gray") &&
        selection.content === "none" && selection.icon === "none" && selection.cornerShape === "none";
    }
    if (selection.variant === "character") {
      return selection.size === "14" && ["fill", "fill-stroke", "light", "dark"].indexOf(selection.appearance) >= 0 &&
        ["red", "gray"].indexOf(selection.color) >= 0 &&
        (["light", "dark"].indexOf(selection.appearance) < 0 || selection.color === "gray") &&
        selection.content !== "none" && selection.icon === "none" && selection.cornerShape === "none";
    }
    if (selection.variant === "icon") {
      return selection.size === "14" && ["fill", "fill-stroke"].indexOf(selection.appearance) >= 0 &&
        ["red", "gray", "green"].indexOf(selection.color) >= 0 &&
        selection.content === "none" && selection.icon !== "none" && selection.cornerShape === "none";
    }
    return selection.size === "native" && selection.appearance === "fill" && selection.content === "none" && selection.icon === "none" &&
      cornerColors[selection.cornerShape] === selection.color;
  }

  function resolveSelection(selection) {
    var category = selection.variant === "corner" ? "角标" : selection.variant === "dot" ? "状态提示" : "内容提示";
    var text = selection.content === "none" ? "" : (selection.content === "ellipsis" ? "…" : selection.content);
    var size = selection.size === "native" ? 14 : Number(selection.size);
    var cornerShape = selection.cornerShape === "none" ? "triangle" : selection.cornerShape;
    var sizeLabel = selection.size === "native" ? ({ triangle: "20×20px", rectangle: "8×12px", flag: "14×18px" }[cornerShape]) : selection.size + "px";
    var parameterKeys = ["variant", "color", "appearance"];
    if (selection.variant !== "corner") parameterKeys.push("size");
    if (selection.variant === "character") parameterKeys.push("text");
    if (selection.variant === "icon") parameterKeys.push("icon");
    if (selection.variant === "corner") parameterKeys.push("cornerShape");
    parameterKeys.push("label");
    return {
      category: category,
      label: badgeLabels[selection.variant] + " · " + appearanceLabels[selection.appearance] + " · " + sizeLabel,
      description: {
        dot: "用于未读、更新与协同；尾随文字时留 4px，叠加头像或图标时徽标中心落在宿主右上/右下 45° 锚点。",
        character: "用于有限数量或短状态；尾随文字时留 2px，叠加宿主时宽度向左延伸，不推移宿主。",
        icon: "用于账号、话题与功能状态；容器 14×14px、图标 8×8px，叠加宿主时按右上/右下对角锚点居中。",
        corner: "用于列表或卡片边角提醒；贴齐宿主 top/right=0，调用方必须为标题和关键操作保留不被覆盖的安全区。"
      }[selection.variant],
      interaction: "静态语义组件；role=img 与 aria-label 提供说明。fill-stroke 仅用于协作或重叠宿主。",
      props: { variant: selection.variant, color: selection.color, size: size, text: text, icon: selection.icon === "none" ? "" : selection.icon, appearance: selection.appearance, cornerShape: cornerShape, label: "Badge: " + badgeLabels[selection.variant] },
      parameterKeys: parameterKeys
    };
  }

  var docsConfig = {
    id: "C-33", title: "Badge 徽标",
    introduction: "用于表达未读、更新、待办、在线协同或有限数量。四类徽标互斥，样式和尺寸作为独立维度选择；宿主定位由调用方组合。",
    categories: [
      { name: "状态提示", description: "点状徽标用于未读、更新与协同；尾随文字间距 4px，叠加圆形或图标宿主时使用 45° 对角锚点。" },
      { name: "内容提示", description: "字符尾随文字间距 2px；图标徽标固定 14×14px 容器与 8×8px 图标，并按宿主对角锚点居中。" },
      { name: "角标", description: "三角 20×20、矩形 8×12、旗帜 14×18；贴齐宿主 top/right=0，并避开标题和关键操作。" }
    ],
    variants: badgeVariants.map(function (variant) { return { key: variant, label: badgeLabels[variant], category: variant === "corner" ? "角标" : variant === "dot" ? "状态提示" : "内容提示" }; }),
    controlsEyebrow: "四类互斥徽标", controlsHeading: "先选类型，再分别比较样式与尺寸",
    controlGroups: [
      { key: "variant", label: "类型", apiLabel: "variant", options: badgeVariants.map(function (variant) { return { value: variant, label: badgeLabels[variant], api: [{ name: "variant", value: variant }], description: { dot: "无内容状态点", character: "数量或最多 3 字符", icon: "14px 状态图标", corner: "卡片/列表边角标记" }[variant] }; }) },
      { key: "appearance", label: "样式", apiLabel: "appearance", options: [
        { value: "fill", label: "仅填充", api: [{ name: "appearance", value: "fill" }], description: "默认状态" },
        { value: "inner-stroke", label: "仅内描边", api: [{ name: "appearance", value: "inner-stroke" }], description: "仅灰色点状徽标" },
        { value: "fill-stroke", label: "填充 + 隔离边", api: [{ name: "appearance", value: "fill-stroke" }], description: "仅协作/重叠宿主" },
        { value: "light", label: "浅色纯字符", api: [{ name: "appearance", value: "light" }], description: "无背景弱层级" },
        { value: "dark", label: "深色纯字符", api: [{ name: "appearance", value: "dark" }], description: "深色背景上使用" }
      ] },
      { key: "size", label: "尺寸", apiLabel: "size", options: [
        { value: "6", label: "6 × 6px", description: "窄文字/小图标" }, { value: "8", label: "8 × 8px", description: "列表与通用更新" },
        { value: "10", label: "10 × 10px", description: "头像场景" }, { value: "14", label: "14 × 14px", description: "字符/图标容器" },
        { value: "native", label: "角标原生尺寸", description: "20×20 / 8×12 / 14×18" }
      ] },
      { key: "color", label: "颜色", options: ["red", "gray", "green", "blue", "yellow", "carmine"].map(function (value) { return { value: value, label: value }; }) },
      { key: "content", label: "字符", options: [{ value: "none", label: "无" }, { value: "8", label: "单字符 8" }, { value: "99+", label: "多字符 99+" }, { value: "999", label: "极限 999" }, { value: "ellipsis", label: "超限 …" }, { value: "New", label: "文字 New" }] },
      { key: "icon", label: "图标", options: [{ value: "none", label: "无" }, { value: "check", label: "check" }, { value: "priority_high", label: "priority" }, { value: "chat_bubble", label: "chat" }, { value: "tag", label: "tag" }] },
      { key: "cornerShape", label: "角标形态", options: [{ value: "none", label: "无" }, { value: "triangle", label: "三角 · 20×20" }, { value: "rectangle", label: "矩形 · 8×12" }, { value: "flag", label: "旗帜 · 14×18" }] }
    ],
    initialSelection: { variant: "dot", appearance: "fill", size: "8", color: "red", content: "none", icon: "none", cornerShape: "none" },
    variantCoverage: badgeVariants.slice(), normalizeSelection: normalizeSelection, isSelectionAllowed: isSelectionAllowed,
    invalidSelectionReason: function () { return "该类型、样式、尺寸、颜色或内容组合没有 canonical source 证据"; },
    resolveSelection: resolveSelection, events: [], slotSelector: "#badge-slot"
  };

  function mountSpecimen(scope) {
    if (!docsApi) return Promise.resolve([]);
    var root = scope || document;
    if (root.closest && root.closest('[data-component-api-docs-id="C-33"]')) return Promise.resolve([]);
    var card = root.matches && root.matches('article[data-component-card="C-33"]') ? root : root.querySelector && root.querySelector('article[data-component-card="C-33"]');
    if (!card) return Promise.resolve([]);
    var preview = card.querySelector(":scope > .component-preview");
    if (!preview) return Promise.resolve([]);
    docsRevision += 1; var current = docsRevision;
    var old = card.querySelector(':scope > .component-api-docs[data-component-api-docs-id="C-33"]');
    if (old) { docsApi.destroy(old); old.remove(); }
    preview.hidden = true; preview.insertAdjacentHTML("afterend", docsApi.markup(docsConfig));
    var docs = preview.nextElementSibling;
    return docsApi.mount(docsConfig, docs).then(function (result) { return current === docsRevision ? result : []; });
  }

  document.addEventListener("b2b:specimens-rendered", function (event) { mountSpecimen(event.detail && event.detail.root ? event.detail.root : document); });
  D.registerComponent("C-33", { renderSpecimen: renderSpecimen, mountSpecimen: mountSpecimen });
})();
