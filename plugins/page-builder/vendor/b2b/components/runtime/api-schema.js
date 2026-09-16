(function registerRendererApiSchemas(global) {
  "use strict";
  var components = global.B2B = global.B2B || {};
  components = components.components = components.components || {};

  function c08MenuItemSchema(depth) {
    var fields = {
      "label": { "type": "string", "required": false },
      "icon": { "type": "string", "required": false },
      "description": { "type": "string", "required": false },
      "auxiliary": { "type": "string", "required": false },
      "danger": { "type": "boolean", "required": false },
      "disabled": { "type": "boolean", "required": false },
      "selected": { "type": "boolean", "required": false },
      "action": { "type": "boolean", "required": false },
      "divider": { "type": "boolean", "required": false }
    };
    if (depth < 3) {
      fields.children = {
        "type": "array",
        "required": false,
        "item": c08MenuItemSchema(depth + 1)
      };
    }
    return {
      "type": "object",
      "additionalProperties": false,
      "fields": fields,
      "rules": [
        "divider=true forbids every action field",
        "non-divider items require a non-empty label",
        "children are limited to the cascade variant and three levels",
        "description is limited to the complex-information variant",
        "selected is limited to the selection-menu variant, requires selection mode and cannot be disabled",
        "action is limited to create-menu leaf items"
      ]
    };
  }

  var schemas = {
    "C-02": {
      "id": "C-02",
      "name": "basicButton",
      "family": "button",
      "kind": "basic",
      "selection": "立即动作；需要主要、次要或危险优先级时使用。",
      "capabilities": { "visibleLabel": true, "icon": "leading-optional", "menu": false, "floating": false, "sizes": ["mini", "small", "medium", "large", "xlarge"], "sizePixels": { "mini": 24, "small": 28, "medium": 32, "large": 36, "xlarge": 40 }, "widths": ["default", "long"] },
      "metrics": { "controlHeight": "sizePixels[size]", "defaultSize": "medium", "defaultHeight": 32, "labelWrapping": "forbidden", "longWidth": "width:100%;min-width:0" },
      "additionalProperties": false,
      "props": {
        "label": {
          "type": "string",
          "required": false,
          "default": "Button"
        },
        "variant": {
          "type": "enum",
          "values": ["primary", "danger", "secondary-blue", "secondary-danger", "secondary-gray"],
          "required": false,
          "default": "secondary-gray"
        },
        "size": {
          "type": "enum",
          "values": ["mini", "small", "medium", "large", "xlarge"],
          "required": false,
          "default": "medium",
          "description": "mini 24px；small 28px；medium 32px；large 36px；xlarge 40px。"
        },
        "icon": {
          "type": "string|null",
          "required": false,
          "default": null
        },
        "disabled": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "loading": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "width": {
          "type": "enum",
          "values": ["default", "long"],
          "required": false,
          "default": "default",
          "description": "default 为内容自然宽度；long 填满 caller 容器（width:100%、min-width:0）。"
        }
      },
      "events": [
        "b2b:button-activate"
      ],
      "keyboard": [
        "Enter",
        "Space"
      ],
      "styleSource": [
        "shared/base.css",
        "C-02-basic-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-02-basic-button/renderer.js"
    },
    "C-03": {
      "id": "C-03",
      "name": "textButton",
      "family": "button",
      "kind": "text",
      "selection": "低优先级动作或文本链接；不需要实体按钮容器时使用。",
      "capabilities": { "visibleLabel": true, "icon": "button-variants-only-leading-regular-or-trailing-arrow", "menu": false, "floating": false, "sizes": [] },
      "metrics": { "controlHeight": "content-driven", "iconLabelGap": 4, "labelWrapping": "forbidden" },
      "additionalProperties": false,
      "props": {
        "label": {
          "type": "string",
          "required": false,
          "description": "可见业务文案，必须非空且保持单行。",
          "default": "Text Button"
        },
        "variant": { "type": "enum", "values": ["Button_Text", "Button_Link", "Link"], "required": false, "description": "Button_Text 文字动作；Button_Link 按钮式链接；Link 原生 URL 导航链接。", "default": "Button_Text" },
        "tone": { "type": "enum", "values": ["primary", "neutral", "danger"], "required": false, "description": "primary 主要操作；neutral 中性操作；danger 危险操作。Button_Link 与 Link 仅支持 primary。", "default": "primary" },
        "leadingIcon": {
          "type": "string|null",
          "required": false,
          "description": "普通表意图标，仅可前置；与 trailingArrow 互斥，Link 禁止图标。",
          "default": null
        },
        "trailingArrow": {
          "type": "string|null",
          "required": false,
          "description": "Button_Text/Button_Link 的后置方向箭头，或源规范已证明的 open_in_new 外部链接指示图标。",
          "default": null
        },
        "href": { "type": "string|null", "required": false, "description": "Link 必填的 URL；button 变体必须为 null。", "default": null },
        "disabled": {
          "type": "boolean",
          "required": false,
          "description": "true 时禁止点击、键盘激活与 URL 导航；hover、pressed、focus-visible 不是 props。",
          "default": false
        }
      },
      "events": ["b2b:text-activate"],
      "keyboard": ["Enter", "Space"],
      "styleSource": [
        "shared/base.css",
        "C-03-text-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-03-text-button/renderer.js"
    },
    "C-04": {
      "id": "C-04",
      "name": "iconButton",
      "family": "button",
      "kind": "icon",
      "selection": "空间受限且图标含义明确的单一操作；label 作为可访问名称和 Tooltip 文案。",
      "capabilities": { "visibleLabel": false, "icon": "required", "menu": true, "floating": false, "sizes": [24, 28, 32, 36, 40] },
      "metrics": { "controlHeight": "size", "sizeNames": { "24": "mini", "28": "small", "32": "medium", "36": "large", "40": "xlarge" }, "iconSizeByControl": { "24": 14, "28": 16, "32": 18, "36": 20, "40": 22 }, "labelWrapping": "not-applicable" },
      "additionalProperties": false,
      "props": {
        "icon": {
          "type": "string",
          "required": false,
          "default": "more_horiz",
          "description": "Material Symbols 图标名称；每个 icon group 子项可用 items[].icon 覆盖。"
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "更多操作",
          "description": "按钮的 aria-label 与 Tooltip 文案；icon group 时作为组的可访问名称。"
        },
        "size": { "type": "enum", "values": [24, 28, 32, 36, 40], "required": false, "default": 32, "description": "真实外框/热区像素：24=mini、28=small、32=medium、36=large、40=xlarge。" },
        "variant": { "type": "enum", "values": ["Button_Icon", "Outlined icon button", "icon group", "menu trigger"], "required": false, "default": "Button_Icon", "description": "真实 anatomy 变体：普通动作、圆形描边动作、图标组或菜单触发器。" },
        "disabled": {
          "type": "boolean",
          "required": false,
          "default": false,
          "description": "禁用组件；禁用按钮不响应点击或原生键盘激活。"
        },
        "tooltip": {
          "type": "boolean",
          "required": false,
          "default": true,
          "description": "是否渲染可见 Tooltip。仅当包含组件已有清晰语境且仍保留 aria-label 时可设为 false，例如 Dialog 关闭按钮。"
        },
        "items": {
          "type": "array",
          "required": false,
          "item": { "additionalProperties": false, "fields": ["icon", "label", "selected", "disabled", "danger"] },
          "default": [],
          "description": "仅 icon group/menu trigger 使用；group 可用 selected，group/menu 可用 disabled，danger 仅用于 menu。"
        }
      },
      "events": ["b2b:icon-activate", "b2b:icon-menu-toggle", "b2b:icon-menu-select"],
      "keyboard": ["Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "Home", "End"],
      "styleSource": [
        "shared/base.css",
        "shared/popup-layout.css",
        "C-01-button-overview/styles.css",
        "C-04-icon-button/styles.css",
        "C-08-dropdown-menu/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-05": {
      "id": "C-05",
      "name": "roundedButton",
      "family": "button",
      "kind": "rounded",
      "selection": "营销或强引导点位的全圆角按钮；普通业务操作仍使用 C-02。",
      "capabilities": { "visibleLabel": true, "icon": "none-or-leading-functional-or-trailing-chevron-right", "menu": false, "floating": false, "sizes": { "mini": 24, "small": 28, "medium": 32, "large": 36, "xlarge": 40 }, "widths": ["default", "long"] },
      "metrics": { "controlHeight": "semantic-size", "defaultHeight": 32, "interactionTarget": "button-box", "labelWrapping": "forbidden" },
      "additionalProperties": false,
      "props": {
        "label": {
          "type": "string",
          "required": false,
          "default": "Rounded Button",
          "description": "按钮上显示的真实业务文案，必须为非空字符串。"
        },
        "variant": { "type": "enum", "values": ["Primary", "Secondary-Primary", "Outlined"], "required": false, "default": "Primary", "description": "Primary 为蓝色实心营销主行动；Secondary-Primary 为蓝色描边营销次行动；Outlined 为灰色描边白底次行动。" },
        "size": { "type": "enum", "values": ["mini", "small", "medium", "large", "xlarge"], "required": false, "default": "medium", "description": "mini 24px；small 28px；medium 32px；large 36px；xlarge 40px。" },
        "width": { "type": "enum", "values": ["default", "long"], "required": false, "default": "default", "description": "default 为按内容的自然宽度；long 填满 caller 可用容器（width:100%、min-width:0）。" },
        "icon": { "type": "string|null", "required": false, "default": null, "description": "iconPlacement=leading 时传普通功能图标；iconPlacement=trailing 时只能传 canonical chevron_right；none 时必须为 null。" },
        "iconPlacement": { "type": "enum", "values": ["none", "leading", "trailing"], "required": false, "default": "none", "description": "none 无图标；leading 前置普通功能图标；trailing 后置固定 chevron_right 箭头。" },
        "disabled": {
          "type": "boolean",
          "required": false,
          "default": false,
          "description": "true 表示禁用：不可聚焦或激活，不派发 b2b:rounded-activate。"
        },
        "loading": { "type": "boolean", "required": false, "default": false, "description": "true 显示与当前尺寸匹配的 loading 图标并阻止激活，aria-busy=true。" }
      },
      "events": ["b2b:rounded-activate"],
      "keyboard": ["Enter", "Space"],
      "styleSource": [
        "shared/base.css",
        "C-05-rounded-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-05-rounded-button/renderer.js"
    },
    "C-06": {
      "id": "C-06",
      "name": "menuButton",
      "family": "button",
      "kind": "menu",
      "selection": "一个主操作带相关低频动作，或由整块按钮触发菜单；纯下拉菜单使用 C-08。",
      "capabilities": { "visibleLabel": true, "icon": "split-main-optional-or-overflow-trigger", "menu": true, "floating": false, "sizes": [24, 28, 32, 36, 40] },
      "metrics": { "controlHeight": "size", "sizeNames": { "mini": 24, "small": 28, "medium": 32, "large": 36, "xlarge": 40 }, "splitTriggerWidth": "size", "menuSurface": "1px border + surface background + float shadow", "labelWrapping": "forbidden" },
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["Split button", "Menu button", "Overflow Menu"], "default": "Split button" },
        "label": {
          "type": "string",
          "required": false,
          "default": "创建"
        },
        "items": {
          "type": "array",
          "required": false,
          "item": { "additionalProperties": false, "fields": ["label", "icon", "danger", "disabled"] },
          "default": [
            { "label": "创建活动" },
            { "label": "创建日程" }
          ]
        },
        "open": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "appearance": { "type": "enum", "values": ["primary", "secondary-blue", "secondary-gray"], "default": "primary" },
        "size": { "type": "enum", "values": [24, 28, 32, 36, 40], "default": 32 },
        "mainIcon": { "type": "string|null", "default": null },
        "icon": { "type": "string|null", "default": null },
        "disabled": { "type": "boolean", "default": false }
      },
      "events": ["b2b:menu-button-primary", "b2b:menu-button-open", "b2b:menu-button-close", "b2b:menu-button-select"],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowRight",
        "ArrowLeft",
        "Home",
        "End"
      ],
      "styleSource": [
        "shared/base.css",
        "shared/popup-layout.css",
        "C-02-basic-button/styles.css",
        "C-06-split-button-menu-button/styles.css",
        "C-08-dropdown-menu/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-07": {
      "id": "C-07",
      "name": "floatingButton",
      "family": "button",
      "kind": "floating",
      "selection": "固定于视口或模块边缘的全局快捷动作；必须保留高程、Tooltip 与避让空间。",
      "capabilities": { "visibleLabel": "variant-dependent", "icon": "required", "menu": true, "floating": true, "sizes": [36, 40, 48] },
      "metrics": { "controlHeight": "size", "defaultHeight": 48, "fixedOffset": 24, "stackGap": 20 },
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["primary", "secondary", "menu", "message", "official-text"], "default": "secondary" },
        "appearance": { "type": "enum", "values": ["primary", "secondary"], "default": "secondary" },
        "size": { "type": "enum", "values": [36, 40, 48], "default": 48 },
        "icon": { "type": "string", "default": "help" },
        "label": { "type": "string", "required": true, "default": "快捷操作" },
        "disabled": { "type": "boolean", "default": false },
        "expanded": { "type": "boolean", "default": false },
        "items": { "type": "array", "default": [] },
        "badge": { "type": "number", "default": 0 },
        "messageText": { "type": "string", "default": "" },
        "avatarText": { "type": "string", "default": "" },
        "avatarLabel": { "type": "string", "default": "" }
      },
      "events": [
        "b2b:floating-activate",
        "b2b:floating-change",
        "b2b:floating-select"
      ],
      "keyboard": ["Enter", "Space", "Escape"],
      "styleSource": [
        "shared/base.css",
        "C-01-button-overview/styles.css",
        "C-07-floating-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-08": {
      "id": "C-08",
      "name": "dropdownMenu",
      "capabilities": {
        "sizes": ["mini", "small", "medium", "large", "xlarge"],
        "sizePixels": { "mini": 24, "small": 28, "medium": 32, "large": 36, "xlarge": 40 },
        "callerOwnedItemContent": ["icon", "disabled", "auxiliary", "create action"],
        "maxCascadeDepth": 3,
        "panelPadding": { "block": 8, "inline": 4 },
        "itemPaddingInline": 12,
        "submenuGap": 0
      },
      "metrics": {
        "defaultSize": "medium",
        "defaultTriggerHeight": 32,
        "surfaceAuthority": "C-06 canonical menu surface",
        "hoverOpen": "immediate"
      },
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["基础下拉菜单", "级联菜单", "辅助标题", "分组", "动态菜单", "创建菜单", "选择菜单", "复杂信息菜单项", "上下文菜单"],
          "default": "基础下拉菜单"
        },
        "mode": { "type": "enum", "values": ["action", "selection"], "default": "action", "description": "选择菜单固定为 selection；其余 variant 固定为 action。" },
        "triggerMode": { "type": "enum", "values": ["click", "hover"], "default": "click" },
        "size": {
          "type": "enum",
          "values": ["mini", "small", "medium", "large", "xlarge"],
          "default": "medium",
          "description": "mini/small/medium/large/xlarge map exactly to 24/28/32/36/40px trigger heights and source-owned recursive menu geometry"
        },
        "triggerLabel": {
          "type": "string",
          "required": false,
          "default": "更多"
        },
        "triggerIcon": { "type": "string|null", "default": null, "description": "Canonical leading icon name; forbidden for the context-menu variant" },
        "items": {
          "type": "array",
          "required": false,
          "item": c08MenuItemSchema(1),
          "default": [
            { "label": "操作一" },
            { "label": "操作二" },
            { "label": "操作三" }
          ]
        },
        "open": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "loading": { "type": "boolean", "default": false },
        "title": { "type": "string", "default": "" }
      },
      "events": [
        "b2b:menu-open",
        "b2b:menu-close",
        "b2b:menu-select",
        "b2b:menu-load-more",
        "b2b:submenu-open",
        "b2b:submenu-close"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowRight",
        "ArrowLeft",
        "Home",
        "End",
        "Tab"
      ],
      "styleSource": [
        "shared/base.css",
        "shared/popup-layout.css",
        "C-02-basic-button/styles.css",
        "C-08-dropdown-menu/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-09": {
      "id": "C-09",
      "name": "cascader",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["single", "multiple", "searchable", "hover-expand"], "default": "multiple" },
        "size": { "type": "enum", "values": ["mini", "small", "medium", "large", "xlarge"], "default": "medium" },
        "placeholder": { "type": "string", "default": "请选择" },
        "valueLabel": { "type": "string", "description": "单选必须传完整路径，例如 亚洲 / 中国", "default": "" },
        "open": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "columns": {
          "type": "array",
          "required": false,
          "item": {
            "additionalProperties": false,
            "fields": ["items", "activeIndex", "hasChildren"],
            "items": {
              "type": "array",
              "item": {
                "type": "string|object",
                "additionalProperties": false,
                "fields": ["label", "children", "child", "disabled", "loading", "selected", "active", "partial", "icon"],
                "children": { "type": "array", "recursiveItem": "C-09.cascaderItem" }
              }
            },
            "activeIndex": { "type": "number" },
            "hasChildren": { "type": "boolean" }
          }
        },
        "tags": { "type": "array", "required": false, "item": { "type": "string" }, "default": [] },
        "tagDisplay": { "type": "enum", "values": ["all", "collapsed"], "default": "all" }
      },
      "events": [
        "b2b:cascader-open",
        "b2b:cascader-close",
        "b2b:cascader-change"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
      ],
      "styleSource": [
        "C-09-cascader/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-10": {
      "id": "C-10",
      "name": "colorPicker",
      "additionalProperties": false,
      "selection": "Use full for presets plus More color, simple for preset-only selection, and value for adjustment-only work. Choose trigger and size independently.",
      "props": {
        "variant": { "type": "enum", "values": ["full", "simple", "value"], "default": "full" },
        "trigger": { "type": "enum", "values": ["swatch", "swatch-value"], "default": "swatch-value" },
        "size": { "type": "enum", "values": ["mini", "small", "medium", "large"], "default": "medium" },
        "value": { "type": "string", "default": "#004CFF" },
        "alpha": { "type": "number", "default": 100 },
        "open": { "type": "boolean", "default": false },
        "disabled": { "type": "boolean", "default": false }
      },
      "events": ["b2b:color-change", "b2b:color-picker-open", "b2b:color-picker-close"],
      "keyboard": ["Tab", "Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"],
      "styleSource": [
        "C-10-color-picker/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-11": {
      "id": "C-11",
      "name": "checkbox",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["group", "standalone", "with-description", "indeterminate"],
          "required": false,
          "default": "with-description"
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "Option"
        },
        "value": {
          "type": "string",
          "required": false,
          "default": "checkbox"
        },
        "description": {
          "type": "string|null",
          "required": false,
          "default": null
        },
        "selectAllLabel": {
          "type": "string",
          "required": false,
          "default": "Select all"
        },
        "items": {
          "type": "array",
          "required": false,
          "default": [],
          "item": { "additionalProperties": false, "fields": ["value", "label", "checked", "mixed", "disabled", "error", "errorMessage"] }
        },
        "checked": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "mixed": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "disabled": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "error": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "errorMessage": {
          "type": "string|null",
          "required": false,
          "default": null
        },
        "orientation": {
          "type": "enum",
          "values": ["vertical", "horizontal"],
          "required": false,
          "default": "vertical"
        },
        "compact": {
          "type": "boolean",
          "required": false,
          "default": false
        }
      },
      "events": ["b2b:checkbox-change"],
      "keyboard": ["Tab", "Space"],
      "styleSource": [
        "C-11-checkbox/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-12": {
      "id": "C-12",
      "name": "navigationMenu",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "required": false,
          "default": "top-horizontal-web",
          "values": [
            "top-horizontal-web",
            "side-web-expanded",
            "side-web-collapsed",
            "side-desktop",
            "side-desktop-tree",
            "no-background"
          ]
        },
        "items": {
          "type": "array",
          "required": true,
          "item": { "type": "object", "additionalProperties": false, "fields": { "id": "string", "label": "string", "icon": "string", "badge": "string|number|null", "disabled": "boolean", "children": "same strict item[]", "actionItems": "{id,label,icon?,danger?,disabled?,children?}[]; action-only, recursive to 3 levels" } },
          "description": "Caller-owned navigation data. Nested items reject unknown fields and preserve the variant depth limit."
        },
        "activeId": {
          "type": "string|null",
          "required": false,
          "default": null
        },
        "expandedIds": {
          "type": "array",
          "required": false,
          "default": []
        },
        "brand": {
          "type": "object",
          "required": false,
          "default": {
            "label": "项目中心",
            "icon": "deployed_code"
          },
          "item": { "type": "object", "additionalProperties": false, "fields": { "label": "string", "icon": "string", "logoSrc": "string", "logoAlt": "string", "href": "string", "ariaLabel": "string", "visible": "boolean" } },
          "description": "Shared canonical header data for top and every side variant; visible=false omits the brand header. An explicit empty icon renders text only. icon and logoSrc are mutually exclusive."
        },
        "actions": {
          "type": "array",
          "required": false,
          "default": [],
          "item": { "type": "object", "additionalProperties": false, "fields": { "id": "string", "kind": "icon-button|button|avatar", "label": "string", "icon": "string", "text": "string", "image": "string", "fallback": "string", "badge": "string|number|boolean|null", "disabled": "boolean" } },
          "description": "Caller-owned action composition mapped to canonical C-04, C-02, and C-32 factories."
        },
        "width": {
          "type": "number",
          "required": false,
          "default": 220
        },
        "ariaLabel": {
          "type": "string",
          "required": false,
          "default": "导航菜单"
        },
        "moreOpen": {
          "type": "boolean",
          "required": false,
          "default": false
        }
      },
      "events": [
        "b2b:navigation-change",
        "b2b:navigation-expand",
        "b2b:navigation-collapse",
        "b2b:navigation-resize",
        "b2b:navigation-more-open",
        "b2b:navigation-action"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End"
      ],
      "styleSource": [
        "shared/popup-layout.css",
        "C-01-button-overview/styles.css",
        "C-02-basic-button/styles.css",
        "C-04-icon-button/styles.css",
        "C-08-dropdown-menu/styles.css",
        "C-16-scrollbar/styles.css",
        "C-32-avatar/styles.css",
        "C-33-badge/styles.css",
        "C-12-navigation-menu/styles.css"
      ],
      "domSource": "C-12-navigation-menu/source.js",
      "interactionSource": "C-12-navigation-menu/source.js"
    },
    "C-13": {
      "id": "C-13",
      "name": "breadcrumb",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "required": false,
          "default": "collapsed-history",
          "values": [
            "single-level",
            "two-level",
            "three-level",
            "four-level",
            "collapsed-history",
            "component-context"
          ]
        },
        "items": {
          "type": "array",
          "required": false,
          "default": [
            "工作台",
            "项目管理",
            "设计系统",
            "组件规范",
            "面包屑"
          ],
          "item": "string"
        },
        "open": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "longLabelIndex": {
          "type": "number|null",
          "required": false,
          "default": null
        }
      },
      "events": [
        "b2b:breadcrumb-navigate",
        "b2b:breadcrumb-history-toggle"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-13-breadcrumb/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-14": {
      "id": "C-14",
      "name": "steps",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["basic-horizontal", "basic-vertical", "simple-horizontal", "simple-vertical", "tab-step"],
          "required": false,
          "default": "basic-horizontal"
        },
        "current": {
          "type": "number",
          "required": false,
          "default": 1
        },
        "labels": {
          "type": "array",
          "required": false,
          "default": ["基本信息", "权限配置", "确认提交", "完成"]
        },
        "descriptions": {
          "type": "array",
          "required": false,
          "default": ["填写项目基本信息", "设置成员与角色", "检查配置并提交", "流程处理完成"]
        },
        "clickable": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "error": {
          "type": "boolean",
          "required": false,
          "default": false
        }
      },
      "events": [
        "b2b:steps-change",
        "b2b:steps-tab-change"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-14-steps/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-15": {
      "id": "C-15",
      "name": "pagination",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["default-pagination", "small-pagination", "minimal"],
          "required": false,
          "default": "default-pagination"
        },
        "current": {
          "type": "number",
          "required": false,
          "default": 6
        },
        "totalPages": {
          "type": "number",
          "required": false,
          "default": 20
        },
        "pages": {
          "type": "array",
          "required": false,
          "default": [4, 5, 6, 7, 8]
        },
        "showTotal": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "showPageSize": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "showJumper": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "totalText": {
          "type": "string",
          "required": false,
          "default": "共 1000 条"
        },
        "startEllipsis": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "endEllipsis": {
          "type": "boolean",
          "required": false,
          "default": true
        }
      },
      "events": [
        "b2b:pagination-change",
        "b2b:pagination-page-size-change"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Tab"
      ],
      "styleSource": [
        "C-15-pagination/styles.css",
        "C-23-select/styles.css",
        "shared/regression.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-16": {
      "id": "C-16",
      "name": "scrollbar",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "required": false,
          "default": "cross-axis",
          "values": [
            "vertical-light",
            "horizontal-light",
            "vertical-dark",
            "horizontal-dark",
            "cross-axis"
          ]
        },
        "appearance": {
          "type": "enum",
          "required": false,
          "default": "default",
          "values": ["default", "thin"]
        },
        "visibility": {
          "type": "enum",
          "required": false,
          "default": "always",
          "values": ["always", "hover-reveal"]
        },
        "items": {
          "type": "array",
          "required": true,
          "item": { "type": "string" }
        }
      },
      "events": [
        "b2b:scrollbar-scroll"
      ],
      "keyboard": [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-16-scrollbar/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-17": {
      "id": "C-17",
      "name": "anchor",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["standard-vertical", "standard-horizontal", "hierarchical-vertical", "hierarchical-horizontal"],
          "required": false,
          "default": "hierarchical-vertical"
        },
        "sections": {
          "type": "array",
          "required": true,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "props": {
              "label": { "type": "string", "required": true },
              "content": { "type": "string", "required": true }
            }
          }
        },
        "active": {
          "type": "number",
          "required": false,
          "default": 0
        },
        "disabledIndex": {
          "type": "number|null",
          "required": false,
          "default": null
        },
        "loadingFailure": {
          "type": "boolean",
          "required": false,
          "default": false
        }
      },
      "events": [
        "b2b:anchor-change"
      ],
      "keyboard": [
        "Tab",
        "Enter",
        "Space",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-17-anchor/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-18": {
      "id": "C-18",
      "name": "dataVisualization",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": [
            "basic-column", "grouped-column", "stacked-column", "percent-stacked-column",
            "basic-bar", "grouped-bar", "stacked-bar",
            "rose", "pie", "donut", "nested-donut",
            "basic-line", "smooth-line", "step-line",
            "basic-area", "smooth-area", "step-area", "stacked-area", "percent-stacked-area",
            "radar", "sankey", "basic-funnel", "conversion-funnel",
            "liquid", "scatter", "histogram", "heatmap", "word-cloud", "column-line-combo", "metric"
          ],
          "required": false,
          "default": "basic-column"
        },
        "title": { "type": "string", "default": "业务数据" },
        "description": { "type": "string", "default": "" },
        "data": { "type": "array", "required": true, "description": "指标图每项支持 label/value、trend（none/up/down/flat）、change（变化文案）、description（说明）、unit（覆盖公共单位）；trendTone（positive/negative/neutral）独立表示变化好坏；icon 可选 visibility/group/ads_click/shopping_bag/trending_up/timer/task_alt/payments 或空。history 为 2–120 个有序且标签唯一的 {label,value}，metricChart=area 时每项必填。change 为空时连同箭头和色块一起隐藏。扩展字段仅适用于 metric。", "item": { "fields": ["label", "value", "series", "source", "target", "x", "y", "size", "xLabel", "yLabel", "mark", "category", "trend", "change", "description", "unit", "trendTone", "icon", "history"] } },
        "state": { "type": "enum", "values": ["default", "selected", "loading", "empty", "error", "partial-data", "disabled"], "default": "default" },
        "xAxisTitle": { "type": "string", "default": "分类" },
        "yAxisTitle": { "type": "string", "default": "数值" },
        "axisTitles": { "type": "enum", "values": ["show", "hide"], "default": "show" },
        "legend": { "type": "enum", "values": ["auto", "show", "hide"], "default": "auto" },
        "legendPosition": { "type": "enum", "values": ["top", "bottom", "right"], "default": "bottom" },
        "toolbar": { "type": "enum", "values": ["hidden", "standard"], "default": "standard" },
        "showFrame": { "type": "boolean", "default": true },
        "showLabels": { "type": "boolean", "default": false },
        "showTotal": { "type": "boolean", "default": false },
        "totalLabel": { "type": "string", "default": "总和" },
        "unit": { "type": "string", "default": "" },
        "metricChart": { "type": "enum", "values": ["none", "area"], "default": "none" },
        "metricLayout": { "type": "enum", "values": ["overview", "cards", "compact"], "default": "overview" },
        "heatmapPalette": { "type": "enum", "values": ["blue", "orange"], "default": "blue" },
        "palette": { "type": "enum", "values": ["categorical", "sequential"], "default": "categorical" }
      },
      "events": [
        "b2b:visualization-mark-select",
        "b2b:visualization-legend-toggle",
        "b2b:visualization-toolbar-action"
      ],
      "keyboard": ["Enter", "Space", "Escape", "ArrowLeft", "ArrowRight"],
      "styleSource": [
        "C-18-data-visualization/styles.css"
      ],
      "domSource": "C-18-data-visualization/source.js",
      "interactionSource": "C-18-data-visualization/source.js"
    },
    "C-19": {
      "id": "C-19",
      "name": "datePicker",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["date", "date-range", "week", "month", "quarter", "year", "date-time", "date-time-range"], "default": "date" },
        "value": { "type": "string", "default": "2026-07-13" },
        "placeholder": { "type": "string", "default": "请选择日期" },
        "label": { "type": "string", "default": "选择日期" },
        "open": { "type": "boolean", "default": false },
        "disabled": { "type": "boolean", "default": false },
        "error": { "type": "boolean", "default": false },
        "clearable": { "type": "boolean", "default": true },
        "showActions": { "type": "boolean", "default": true },
        "timeSeconds": { "type": "boolean", "default": false }
      },
      "events": ["b2b:date-picker-open", "b2b:date-picker-change", "b2b:date-picker-phase"],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-19-date-picker/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-19-date-picker/renderer.js"
    },
    "C-20": {
      "id": "C-20",
      "name": "form",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["基础表单", "组合表单", "分组表单", "分步表单", "联动表单"],
          "required": false,
          "default": "基础表单"
        },
        "size": {
          "type": "enum",
          "values": ["small", "medium", "large"],
          "required": false,
          "default": "medium"
        },
        "spacing": {
          "type": "enum",
          "values": ["small", "large"],
          "required": false,
          "default": "small"
        },
        "errors": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "title": {
          "type": "string",
          "required": false,
          "default": "Form title"
        },
        "columns": {
          "type": "number",
          "values": [1, 2],
          "required": false,
          "default": 1
        },
        "labelLayout": {
          "type": "enum",
          "values": ["top", "left"],
          "required": false,
          "default": "top"
        }
      },
      "events": [
        "b2b:form-input",
        "b2b:form-step-change",
        "b2b:form-structure-change",
        "b2b:form-linkage-change",
        "b2b:form-submit",
        "b2b:form-cancel"
      ],
      "keyboard": ["Tab", "Shift+Tab", "Enter", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Escape"],
      "styleSource": [
        "C-02-basic-button/styles.css",
        "C-03-text-button/styles.css",
        "C-04-icon-button/styles.css",
        "C-11-checkbox/styles.css",
        "C-14-steps/styles.css",
        "C-20-form/styles.css",
        "C-27-switch/styles.css",
        "C-22-radio/styles.css",
        "C-21-input/styles.css",
        "C-23-select/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-21": {
      "id": "C-21",
      "name": "input",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["基础输入框", "数字输入框", "带图标输入框", "带属性输入框", "组合输入框", "长文本输入框"], "default": "基础输入框" },
        "size": { "type": "enum", "values": ["mini", "small", "medium", "large", "xlarge"], "default": "medium", "description": "单行输入控件高度依次为 24/28/32/36/40px。" },
        "state": { "type": "enum", "values": ["default", "disabled", "readonly", "error"], "default": "default" },
        "label": { "type": "string", "required": true, "default": "输入内容" },
        "value": { "type": "string|number", "default": "" },
        "placeholder": { "type": "string", "default": "Please enter text" },
        "clearable": { "type": "boolean", "default": false },
        "counter": { "type": "boolean", "default": false },
        "maxLength": { "type": "number", "default": 20 },
        "borderless": { "type": "boolean", "default": false },
        "password": { "type": "boolean", "default": false },
        "prefixIcon": { "type": "string|null", "default": null },
        "suffixIcon": { "type": "string|null", "default": null },
        "infoTooltip": {
          "type": "object|null",
          "default": null,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "text": { "type": "string", "required": true },
              "position": { "type": "enum", "values": ["top-left", "top", "top-right", "right-top", "right", "right-bottom", "bottom-right", "bottom", "bottom-left", "left-bottom", "left", "left-top"], "required": true }
            }
          },
          "description": "带图标输入框的 caller-owned 信息说明；复用 C-44 Tooltip。"
        },
        "min": { "type": "number", "default": 0 },
        "max": { "type": "number", "default": 10 },
        "step": { "type": "number", "default": 1 },
        "prefixAddon": {
          "type": "object|null",
          "default": null,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "id": { "type": "string", "required": true },
              "type": { "type": "enum", "values": ["text", "select"], "required": true },
              "text": { "type": "string", "required": false },
              "value": { "type": "string", "required": false },
              "ariaLabel": { "type": "string", "required": false },
              "options": { "type": "array", "required": false, "item": { "type": "object", "additionalProperties": false, "fields": { "value": { "type": "string", "required": true }, "label": { "type": "string", "required": true } } } }
            }
          },
          "description": "左侧固定文本或可选择 addon；text/select 字段组合由 Renderer 严格校验。"
        },
        "suffixAddon": {
          "type": "object|null",
          "default": null,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "id": { "type": "string", "required": true },
              "type": { "type": "enum", "values": ["text", "select"], "required": true },
              "text": { "type": "string", "required": false },
              "value": { "type": "string", "required": false },
              "ariaLabel": { "type": "string", "required": false },
              "options": { "type": "array", "required": false, "item": { "type": "object", "additionalProperties": false, "fields": { "value": { "type": "string", "required": true }, "label": { "type": "string", "required": true } } } }
            }
          },
          "description": "右侧固定文本或可选择 addon；text/select 字段组合由 Renderer 严格校验。"
        },
        "tag": { "type": "string|null", "default": null, "description": "属性输入右侧的 caller-owned 行内标签；不得与 prefixAddon/suffixAddon 同时使用。" },
        "composite": {
          "type": "object|null",
          "default": null,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "appearance": { "type": "enum", "values": ["filled", "borderless"], "required": true },
              "segments": { "type": "array", "required": true, "item": { "type": "object", "additionalProperties": false, "fields": { "id": { "type": "string", "required": true }, "label": { "type": "string", "required": true }, "value": { "type": "string", "required": true }, "placeholder": { "type": "string", "required": true } } } },
              "select": { "type": "object|null", "required": false, "item": { "type": "object", "additionalProperties": false, "fields": { "id": { "type": "string", "required": true }, "value": { "type": "string", "required": true }, "ariaLabel": { "type": "string", "required": true }, "options": { "type": "array", "required": true, "item": { "type": "object", "additionalProperties": false, "fields": { "value": { "type": "string", "required": true }, "label": { "type": "string", "required": true } } } } } } }
            }
          },
          "description": "组合输入框的 caller-owned 分段；默认双输入，提供 select 时为一段选择加一段输入且仅支持 filled。"
        },
        "auto": { "type": "boolean", "default": false }
      },
      "events": [
        "b2b:input-change",
        "b2b:input-clear",
        "b2b:input-password-toggle",
        "b2b:input-addon-open",
        "b2b:input-addon-close",
        "b2b:input-addon-change",
        "b2b:input-tooltip-open",
        "b2b:input-tooltip-close"
      ],
      "keyboard": [
        "Tab",
        "Enter",
        "Space",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Escape"
      ],
      "styleSource": [
        "C-21-input/styles.css",
        "C-23-select/styles.css",
        "C-44-tooltip/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-22": {
      "id": "C-22",
      "name": "radio",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["基础单选", "按钮型单选"],
          "required": false,
          "default": "基础单选"
        },
        "labels": {
          "type": "array",
          "required": false,
          "default": [
            "Option 1",
            "Option 2",
            "Option 3"
          ]
        },
        "values": {
          "type": "array",
          "required": false,
          "default": []
        },
        "selected": {
          "type": "number",
          "required": false,
          "default": 0
        },
        "layout": {
          "type": "enum",
          "values": ["vertical", "horizontal", "list"],
          "required": false,
          "default": "vertical"
        },
        "long": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "size": {
          "type": "enum",
          "values": ["small", "medium", "large"],
          "required": false,
          "default": "medium"
        },
        "disabled": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "groupLabel": {
          "type": "string",
          "required": false,
          "default": "单选选项"
        }
      },
      "events": ["b2b:radio-change"],
      "keyboard": ["Tab", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Home", "End"],
      "styleSource": [
        "C-22-radio/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-23": {
      "id": "C-23",
      "name": "select",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["基础单选", "基础多选", "自定义选项", "分组选项", "无边框", "下划线", "可搜索", "可创建", "复杂内容"],
          "required": false,
          "default": "基础单选"
        },
        "items": {
          "type": "array",
          "required": false,
          "default": [
            "Option 1",
            "Option 2",
            "Option 3"
          ]
        },
        "selected": {
          "type": "array",
          "required": false,
          "default": []
        },
        "multiple": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "open": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "placeholder": {
          "type": "string",
          "required": false,
          "default": "Please select"
        },
        "clearable": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "searchable": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "creatable": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "query": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "size": {
          "type": "enum",
          "values": ["small", "medium", "large"],
          "required": false,
          "default": "medium"
        },
        "state": {
          "type": "enum",
          "values": ["default", "disabled", "readonly", "error", "loading", "no-result"],
          "required": false,
          "default": "default"
        },
        "position": {
          "type": "enum",
          "values": ["bottom-left", "top", "right", "left"],
          "required": false,
          "default": "bottom-left"
        }
      },
      "events": [
        "b2b:select-open",
        "b2b:select-close",
        "b2b:select-change",
        "b2b:select-search",
        "b2b:select-create"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-23-select/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-24": {
      "id": "C-24",
      "name": "rating",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["星级评分", "好评差评", "普通好评差评", "小型好评差评", "自定义图标", "自定义颜色"],
          "required": false,
          "default": "星级评分"
        },
        "value": {
          "type": "number",
          "required": false,
          "default": 0
        },
        "step": {
          "type": "enum",
          "values": [1, 0.5],
          "required": false,
          "default": 1
        },
        "prompt": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "clearable": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "readonly": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "icon": {
          "type": "enum",
          "values": ["star", "favorite", "thumb_up"],
          "required": false,
          "default": "star"
        },
        "color": {
          "type": "enum",
          "values": ["yellow", "blue"],
          "required": false,
          "default": "yellow"
        },
        "selected": {
          "type": "enum",
          "values": ["", "good", "bad"],
          "required": false,
          "default": ""
        },
        "good": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "bad": {
          "type": "string",
          "required": false,
          "default": ""
        }
      },
      "events": [
        "b2b:rating-change",
        "b2b:sentiment-change"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "1-5"
      ],
      "styleSource": [
        "C-24-rating/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-25": {
      "id": "C-25",
      "name": "stepper",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "string",
          "required": false,
          "default": "默认步进器",
          "values": ["默认步进器", "窄宽步进器", "长宽步进器", "最小值", "最大值", "错误"]
        },
        "value": {
          "type": "number",
          "required": false,
          "default": 5
        },
        "min": {
          "type": "number",
          "required": false,
          "default": 1
        },
        "max": {
          "type": "number",
          "required": false,
          "default": 999
        },
        "step": {
          "type": "number",
          "required": false,
          "default": 1
        },
        "size": {
          "type": "string",
          "required": false,
          "default": "medium",
          "values": ["small", "medium", "large"]
        },
        "width": {
          "type": "string",
          "required": false,
          "default": "default",
          "values": ["narrow", "default", "wide"]
        },
        "state": {
          "type": "string",
          "required": false,
          "default": "normal",
          "values": ["normal", "disabled", "error"]
        }
      },
      "events": ["b2b:stepper-change"],
      "keyboard": ["ArrowUp", "ArrowDown", "Home", "End"],
      "styleSource": [
        "C-25-stepper/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-26": {
      "id": "C-26",
      "name": "slider",
      "additionalProperties": false,
      "props": {
        "min": {
          "type": "number",
          "required": false,
          "default": 0
        },
        "max": {
          "type": "number",
          "required": false,
          "default": 100
        },
        "value": {
          "type": "number",
          "required": false,
          "default": 40
        },
        "range": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "second": {
          "type": "number",
          "required": false,
          "default": 75
        },
        "step": {
          "type": "number",
          "required": false,
          "default": 1
        },
        "markValues": {
          "type": "array",
          "required": false,
          "default": [],
          "item": "number"
        },
        "tooltip": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "disabled": {
          "type": "boolean",
          "required": false,
          "default": false
        }
      },
      "events": [
        "b2b:slider-change"
      ],
      "keyboard": [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-26-slider/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-27": {
      "id": "C-27",
      "name": "switch",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "string",
          "required": false,
          "default": "base",
          "values": [
            "base"
          ]
        },
        "state": {
          "type": "string",
          "required": false,
          "default": "off-normal",
          "values": [
            "on-normal",
            "on-disabled",
            "on-loading",
            "off-normal",
            "off-disabled",
            "off-loading"
          ]
        },
        "size": {
          "type": "string",
          "required": false,
          "default": "medium",
          "values": [
            "medium",
            "small"
          ]
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "切换设置"
        }
      },
      "events": [
        "b2b:switch-change"
      ],
      "keyboard": [
        "Enter",
        "Space"
      ],
      "styleSource": [
        "C-27-switch/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-28": {
      "id": "C-28",
      "name": "treeSelect",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "string",
          "required": false,
          "default": "勾选型树选择",
          "values": ["基础树选择-导航", "基础树选择-单选", "基础树选择-多选", "勾选型树选择"]
        },
        "state": {
          "type": "string",
          "required": false,
          "default": "normal",
          "values": ["normal", "disabled", "readonly", "loading", "no-result"]
        },
        "open": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "nodes": {
          "type": "array",
          "required": false,
          "default": [
            { "label": "产品", "children": [{ "label": "设计" }, { "label": "研发" }] },
            { "label": "运营", "children": [{ "label": "客户成功" }] }
          ],
          "item": { "fields": ["label", "icon", "children", "expanded"] }
        },
        "selected": {
          "type": "array",
          "required": false,
          "default": []
        },
        "query": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "层级选择"
        }
      },
      "events": ["b2b:tree-open", "b2b:tree-close", "b2b:tree-change", "b2b:tree-expand", "b2b:tree-search"],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-28-tree-select/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-29": {
      "id": "C-29",
      "name": "transfer",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["列表", "树结构", "分组结构", "自定义选项", "自定义已选项"],
          "required": false,
          "default": "列表"
        },
        "items": {
          "type": "array",
          "required": false,
          "default": ["选项 1", "选项 2", "选项 3"],
          "item": {
            "fields": ["label", "type", "level", "branch", "expanded", "partial"]
          }
        },
        "selected": {
          "type": "array",
          "required": false,
          "default": []
        },
        "compact": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "customHeader": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "targetHeader": {
          "type": "string",
          "required": false,
          "default": ""
        }
      },
      "events": [
        "b2b:transfer-change",
        "b2b:transfer-search",
        "b2b:transfer-reorder"
      ],
      "keyboard": [
        "Tab",
        "Space",
        "Enter"
      ],
      "styleSource": [
        "C-29-transfer/styles.css",
        "C-11-checkbox/styles.css",
        "C-21-input/styles.css",
        "C-42-tag/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-30": {
      "id": "C-30",
      "name": "timePicker",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "string",
          "required": false,
          "default": "range",
          "values": ["time", "range", "12-hour", "24-hour", "with-date"]
        },
        "state": {
          "type": "string",
          "required": false,
          "default": "default",
          "values": ["default", "selected", "disabled", "error"]
        },
        "size": {
          "type": "number",
          "required": false,
          "default": 32,
          "values": [28, 32, 40]
        },
        "value": {
          "type": "string",
          "required": false,
          "default": "09:00 - 18:00"
        },
        "open": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "seconds": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "footer": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "clearable": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "disabledBefore": {
          "type": "number",
          "required": false,
          "default": 0
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "时间范围"
        }
      },
      "events": ["b2b:time-open", "b2b:time-close", "b2b:time-change", "b2b:time-confirm", "b2b:time-clear"],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End"
      ],
      "styleSource": [
        "C-30-time-picker/styles.css",
        "C-19-date-picker/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-31": {
      "id": "C-31",
      "name": "upload",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "string",
          "required": false,
          "default": "file-list",
          "values": ["button", "drag", "picture-card", "file-list"]
        },
        "size": {
          "type": "string",
          "required": false,
          "default": "standard",
          "values": ["compact", "standard"]
        },
        "state": {
          "type": "string",
          "required": false,
          "default": "success",
          "values": ["default", "uploading", "success", "error", "disabled"]
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "上传文件"
        },
        "description": {
          "type": "string",
          "required": false,
          "default": "Only supports: JPG, PNG, PDF, the max file size is 10MB"
        },
        "name": {
          "type": "string",
          "required": false,
          "default": "design-system.zip"
        },
        "fileType": {
          "type": "string",
          "required": false,
          "default": "auto",
          "values": ["auto", "default", "multimedia", "music", "img", "folder", "text", "ppt", "video", "pdf", "link", "excel", "word", "zip", "visio", "code"]
        },
        "progress": {
          "type": "number",
          "required": false,
          "default": 100
        },
        "loaded": {
          "type": "string",
          "required": false,
          "default": "9.5 MB"
        },
        "interactive": {
          "type": "boolean",
          "required": false,
          "default": true
        }
      },
      "events": ["b2b:upload-start", "b2b:upload-cancel", "b2b:upload-retry", "b2b:upload-remove", "b2b:upload-preview", "b2b:upload-download"],
      "keyboard": ["Enter", "Space"],
      "styleSource": [
        "C-31-upload/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-32": {
      "id": "C-32",
      "name": "avatar",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["image", "text", "icon", "group", "with-status", "with-text", "with-secondary-text", "with-top-badge"], "default": "group" },
        "text": {
          "type": "string",
          "required": false,
          "default": "林"
        },
        "size": {
          "type": "number",
          "values": [24, 32, 40, 48, 64],
          "required": false,
          "default": 32
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "林七七"
        },
        "shape": {
          "type": "enum",
          "values": ["round", "squircle"],
          "required": false,
          "default": "round"
        },
        "image": { "type": "string|null", "default": null },
        "fallback": { "type": "string", "default": "林" },
        "icon": { "type": "string|null", "default": null },
        "topBadge": {
          "type": "object|null",
          "default": null,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": ["variant", "text", "color", "appearance", "label"],
            "requiredFields": ["variant", "text", "color", "appearance", "label"]
          },
          "description": "仅 with-top-badge：组合 C-33 的 character（1–3 字或 …）或 dot，使用 red/gray 与 fill/fill-stroke；右上 45° 锚点及原生尺寸由 Renderer 管理。"
        },
        "primaryText": { "type": "string", "default": "" },
        "secondaryText": { "type": "string", "default": "" },
        "loading": { "type": "boolean", "default": false },
        "status": { "type": "enum", "values": ["online", "offline"], "default": "online" },
        "items": { "type": "array", "default": [], "item": { "fields": ["text", "image", "fallback", "icon", "label"] } },
        "maxVisible": { "type": "number", "default": 5 },
        "expanded": { "type": "boolean", "default": false }
      },
      "events": ["b2b:avatar-fallback", "b2b:avatar-overflow-change"],
      "keyboard": ["Enter", "Space", "Escape"],
      "styleSource": [
        "C-32-avatar/styles.css",
        "C-33-badge/styles.css",
        "C-44-tooltip/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-32-avatar/renderer.js"
    },
    "C-33": {
      "id": "C-33",
      "name": "badge",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["dot", "character", "icon", "corner"],
          "required": false,
          "default": "dot"
        },
        "color": {
          "type": "enum",
          "values": ["red", "gray", "green", "blue", "yellow", "carmine"],
          "required": false,
          "default": "red"
        },
        "size": {
          "type": "number",
          "required": false,
          "default": 8
        },
        "text": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "icon": {
          "type": "enum",
          "values": ["", "check", "priority_high", "chat_bubble", "tag"],
          "required": false,
          "default": ""
        },
        "appearance": {
          "type": "enum",
          "values": ["fill", "inner-stroke", "fill-stroke", "light", "dark"],
          "required": false,
          "default": "fill"
        },
        "cornerShape": {
          "type": "enum",
          "values": ["triangle", "rectangle", "flag"],
          "required": false,
          "default": "triangle"
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "Unread"
        }
      },
      "events": [],
      "keyboard": [],
      "styleSource": [
        "C-33-badge/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-33-badge/renderer.js"
    },
    "C-34": {
      "id": "C-34",
      "name": "card",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["basic", "compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive"], "required": false, "default": "basic" },
        "appearance": { "type": "enum", "values": ["bordered", "borderless"], "required": false, "default": "bordered" },
        "size": { "type": "enum", "values": ["default", "small"], "required": false, "default": "default" },
        "title": { "type": "string", "required": false, "default": "Card title" },
        "body": { "type": "string", "required": false, "default": "Card content" },
        "meta": { "type": "string", "required": false, "default": "" },
        "icon": { "type": "string", "required": false, "default": "description" },
        "hoverable": { "type": "boolean", "required": false, "default": false },
        "selected": { "type": "boolean", "required": false, "default": false },
        "loading": { "type": "boolean", "required": false, "default": false },
        "extraActionLabel": { "type": "string|null", "required": false, "default": null },
        "footerActionLabel": { "type": "string|null", "required": false, "default": null },
        "coverImage": { "type": "string|null", "required": false, "default": null, "description": "meta/actions 的业务媒体 URL；加载失败时 Renderer 展示 Token 化图标 fallback。" },
        "coverAlt": { "type": "string", "required": false, "default": "" },
        "avatar": { "type": "object|null", "required": false, "default": null, "additionalProperties": false, "fields": ["text", "image", "fallback", "label"] },
        "items": { "type": "array", "required": false, "default": [], "item": { "additionalProperties": false, "fields": ["id", "title", "body", "meta", "appearance", "hoverable", "actionLabel"] } },
        "columns": { "type": "number", "required": false, "default": 3, "description": "external-grid/content-grid 的语义列数，2–4；窄屏由 Renderer 收敛为单列。" },
        "tabs": { "type": "array", "required": false, "default": [], "item": { "additionalProperties": false, "fields": ["id", "label", "content", "disabled"] } },
        "activeTabId": { "type": "string|null", "required": false, "default": null },
        "actions": { "type": "array", "required": false, "default": [], "item": { "additionalProperties": false, "fields": ["id", "label", "icon"] } }
      },
      "events": ["b2b:card-activate", "b2b:card-selection-change", "b2b:card-action", "b2b:card-tab-change", "b2b:card-media-fallback"],
      "keyboard": ["Enter", "Space", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"],
      "styleSource": [
        "C-03-text-button/styles.css",
        "C-04-icon-button/styles.css",
        "C-32-avatar/styles.css",
        "C-33-badge/styles.css",
        "C-41-tabs/styles.css",
        "C-44-tooltip/styles.css",
        "C-47-loading/styles.css",
        "C-34-card/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-34-card/renderer.js"
    },
    "C-35": {
      "id": "C-35",
      "name": "accordion",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["single", "multiple", "bordered", "ghost"],
          "required": false,
          "default": "multiple"
        },
        "items": {
          "type": "array",
          "required": false,
          "default": [{ "title": "Design specification", "body": "Component anatomy, tokens and legal variants.", "expanded": true, "disabled": false, "loading": false }, { "title": "API parameters", "body": "Renderer props, events and keyboard behavior.", "expanded": true, "disabled": false, "loading": false }]
        },
        "arrow": {
          "type": "enum",
          "values": ["filled", "linear"],
          "required": false,
          "default": "filled"
        },
        "style": {
          "type": "enum",
          "values": ["basic", "hot-zone", "region-zone", "content-muted"],
          "required": false,
          "default": "basic"
        }
      },
      "events": ["b2b:accordion-change"],
      "keyboard": [
        "Enter",
        "Space",
        "Tab"
      ],
      "styleSource": [
        "C-35-accordion/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-36": {
      "id": "C-36",
      "name": "emptyState",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "string",
          "required": false,
          "default": "no-data",
          "values": [
            "no-result",
            "permission",
            "no-data",
            "deleted",
            "not-found"
          ]
        },
        "size": {
          "type": "string",
          "required": false,
          "default": "standard",
          "values": [
            "standard",
            "compact"
          ]
        },
        "title": {
          "type": "string|boolean",
          "required": false,
          "default": false
        },
        "description": {
          "type": "string",
          "required": false,
          "default": "暂无数据"
        },
        "primary": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "secondary": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "surface": {
          "type": "string",
          "required": false,
          "default": "white",
          "values": [
            "white",
            "gray"
          ]
        }
      },
      "events": [
        "b2b:empty-state-action"
      ],
      "keyboard": [
        "Enter",
        "Space"
      ],
      "styleSource": [
        "C-36-empty-state/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-36-empty-state/renderer.js"
    },
    "C-37": {
      "id": "C-37",
      "name": "imagePreview",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["single", "gallery", "inline"],
          "required": false,
          "default": "gallery"
        },
        "current": {
          "type": "number",
          "required": false,
          "default": 2
        },
        "state": {
          "type": "enum",
          "values": ["default", "zoomed"],
          "required": false,
          "default": "default"
        }
      },
      "events": [
        "b2b:image-preview-transform",
        "b2b:image-preview-page-change",
        "b2b:image-preview-close-request",
        "b2b:image-preview-download-request"
      ],
      "keyboard": ["Tab", "Enter", "Space"],
      "styleSource": [
        "C-37-image-preview/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-38": {
      "id": "C-38",
      "name": "placeholder",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["default", "failure", "custom"],
          "required": false,
          "default": "default"
        },
        "icon": {
          "type": "string",
          "required": false,
          "default": "",
          "description": "Empty selects the fixed variant icon. Other icons are only accepted for custom."
        },
        "size": {
          "type": "enum",
          "values": [24, 36, 48, 64],
          "required": false,
          "default": 36
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "Image unavailable"
        }
      },
      "events": [],
      "keyboard": [],
      "styleSource": [
        "C-38-placeholder/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-38-placeholder/renderer.js"
    },
    "C-39": {
      "id": "C-39",
      "name": "popover",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["information", "interactive", "confirmation"],
          "required": false,
          "default": "confirmation"
        },
        "size": {
          "type": "enum",
          "values": ["small", "large"],
          "required": false,
          "default": "small"
        },
        "open": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "position": {
          "type": "enum",
          "values": ["top", "bottom", "left", "right"],
          "required": false,
          "default": "top"
        },
        "title": {
          "type": "string",
          "required": false,
          "default": "Confirm action?"
        },
        "content": {
          "type": "string",
          "required": false,
          "default": "This action cannot be undone."
        },
        "icon": {
          "type": "enum",
          "values": ["", "info", "check_circle", "warning", "error"],
          "required": false,
          "default": "warning"
        },
        "triggerLabel": {
          "type": "string",
          "required": false,
          "default": "Open popover"
        },
        "confirmText": {
          "type": "string",
          "required": false,
          "default": "Confirm"
        },
        "cancelText": {
          "type": "string",
          "required": false,
          "default": "Cancel"
        }
      },
      "events": [
        "b2b:popover-visible-change",
        "b2b:popover-cancel",
        "b2b:popover-confirm"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape"
      ],
      "styleSource": [
        "C-39-popover/styles.css",
        "C-02-basic-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-40": {
      "id": "C-40",
      "name": "dataTable",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["default", "traditional", "tree", "grouped", "nested"], "required": false, "default": "default" },
        "density": { "type": "enum", "values": ["compact", "standard", "comfortable"], "required": false, "default": "standard" },
        "multiLevelHeader": { "type": "boolean", "required": false, "default": false },
        "columns": {
          "type": "array",
          "required": true,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "key": { "type": "string", "required": true },
              "label": { "type": "string", "required": true },
              "type": { "type": "enum", "values": ["text", "tree", "avatar", "tag", "status", "number", "switch", "actions"], "required": true },
              "sortable": { "type": "boolean", "required": true },
              "truncate": { "type": "boolean", "required": true },
              "filterOptions": { "type": "array", "required": false, "item": { "type": "string" } },
              "headerGroup": { "type": "string", "required": false },
              "editable": { "type": "boolean", "required": false }
            }
          }
        },
        "rows": {
          "type": "array",
          "required": true,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "id": { "type": "string", "required": true },
              "label": { "type": "string", "required": false },
              "checked": { "type": "boolean", "required": true },
              "parentId": { "type": "string", "required": false },
              "expanded": { "type": "boolean", "required": false },
              "group": { "type": "string", "required": false },
              "detail": { "type": "string", "required": false },
              "cells": {
                "type": "array",
                "required": true,
                "item": {
                  "type": "object",
                  "additionalProperties": false,
                  "fields": {
                    "columnKey": { "type": "string", "required": true },
                    "text": { "type": "string", "required": false },
                    "sortValue": { "type": "string|number", "required": false },
                    "tone": { "type": "enum", "values": ["neutral", "gray", "blue", "green", "red", "orange", "purple", "cyan", "yellow"], "required": false },
                    "avatarText": { "type": "string", "required": false },
                    "avatarImage": { "type": "string", "required": false },
                    "checked": { "type": "boolean", "required": false },
                    "disabled": { "type": "boolean", "required": false },
                    "actions": {
                      "type": "array",
                      "required": false,
                      "item": {
                        "type": "object",
                        "additionalProperties": false,
                        "fields": {
                          "id": { "type": "string", "required": true },
                          "label": { "type": "string", "required": true },
                          "tone": { "type": "enum", "values": ["default", "danger"], "required": false },
                          "disabled": { "type": "boolean", "required": true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "pagination": {
          "type": "object",
          "required": false,
          "default": { "visible": false },
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "visible": { "type": "boolean", "required": true },
              "total": { "type": "number", "required": false },
              "current": { "type": "number", "required": false }
            }
          }
        },
        "toolbar": {
          "type": "object",
          "required": false,
          "default": { "visible": false },
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "visible": { "type": "boolean", "required": true },
              "showTitle": { "type": "boolean", "required": false },
              "showButtonGroup": { "type": "boolean", "required": false },
              "title": { "type": "string", "required": false },
              "searchPlaceholder": { "type": "string", "required": false },
              "searchLabel": { "type": "string", "required": false },
              "actions": { "type": "array", "required": false, "item": { "type": "object", "additionalProperties": false, "fields": { "id": { "type": "string", "required": true }, "label": { "type": "string", "required": true }, "variant": { "type": "enum", "values": ["primary", "danger", "secondary-blue", "secondary-danger", "secondary-gray"], "required": true }, "disabled": { "type": "boolean", "required": true } } } }
            }
          }
        },
        "batchActions": {
          "type": "object", "required": false, "default": { "visible": false },
          "item": { "type": "object", "additionalProperties": false, "fields": {
            "visible": { "type": "boolean", "required": true },
            "actions": { "type": "array", "required": false, "item": { "type": "object", "additionalProperties": false, "fields": { "id": { "type": "string", "required": true }, "label": { "type": "string", "required": true }, "variant": { "type": "enum", "values": ["primary", "danger", "secondary-blue", "secondary-danger", "secondary-gray"], "required": true }, "disabled": { "type": "boolean", "required": true } } } }
          } }
        },
        "fixedColumns": {
          "type": "object", "required": false, "default": { "leading": false, "trailing": false, "leadingWidth": "standard", "trailingWidth": "standard" },
          "item": { "type": "object", "additionalProperties": false, "fields": {
            "leading": { "type": "boolean", "required": true },
            "trailing": { "type": "boolean", "required": true },
            "leadingWidth": { "type": "enum", "values": ["compact", "standard", "wide"], "required": true },
            "trailingWidth": { "type": "enum", "values": ["compact", "standard", "wide"], "required": true }
          } }
        },
        "ariaLabel": {
          "type": "string",
          "required": false,
          "default": "数据表格"
        }
      },
      "events": [
        "b2b:table-sort-change",
        "b2b:table-filter-change",
        "b2b:table-select-all",
        "b2b:table-selection-change",
        "b2b:table-row-action",
        "b2b:table-toolbar-action",
        "b2b:table-batch-action",
        "b2b:table-switch-change",
        "b2b:table-expand-change",
        "b2b:table-edit-start",
        "b2b:table-edit-commit",
        "b2b:table-edit-cancel",
        "b2b:table-page-change",
        "b2b:table-page-size-change"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "Tab"
      ],
      "styleSource": [
        "shared/popup-layout.css",
        "C-40-data-table/styles.css",
        "C-02-basic-button/styles.css",
        "C-03-text-button/styles.css",
        "C-04-icon-button/styles.css",
        "C-08-dropdown-menu/styles.css",
        "C-11-checkbox/styles.css",
        "C-15-pagination/styles.css",
        "C-21-input/styles.css",
        "C-23-select/styles.css",
        "C-27-switch/styles.css",
        "C-32-avatar/styles.css",
        "C-33-badge/styles.css",
        "C-42-tag/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-41": {
      "id": "C-41",
      "name": "tabs",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["line", "capsule", "card"], "default": "line" },
        "size": { "type": "enum", "values": ["large", "medium", "small"], "default": "medium" },
        "items": { "type": "array", "required": true, "item": { "id": "string", "label": "string", "content": "Node|string", "disabled": "boolean", "badge": "Node|string|boolean|null", "closable": "boolean" } },
        "panelContainer": { "type": "object|null", "default": null, "description": "可选空 HTMLElement；挂载时由 C-41 将内容面板放入该容器，保留 ARIA、切换和销毁所有权。null 时内容留在组件内。" },
        "activeId": { "type": "string|null", "default": null },
        "ariaLabel": { "type": "string", "default": "内容切换" },
        "activation": { "type": "enum", "values": ["automatic", "manual"], "default": "automatic" },
        "addable": { "type": "boolean", "default": false },
        "scrollable": { "type": "boolean", "default": false, "description": "宽度不足时显示左右箭头；与非空 overflowItems 互斥" },
        "overflowItems": { "type": "array", "description": "More 菜单数据，仅 line/capsule；要求 scrollable=false", "default": [], "item": { "id": "string", "label": "string", "content": "Node|string", "disabled": "boolean", "badge": "Node|string|boolean|null" } }
      },
      "events": [
        "b2b:tabs-change",
        "b2b:tab-close",
        "b2b:tab-add",
        "b2b:tabs-overflow-change"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "Delete",
        "Backspace"
      ],
      "styleSource": [
        "C-41-tabs/styles.css",
        "C-33-badge/styles.css"
      ],
      "domSource": "C-41-tabs/renderer.js",
      "interactionSource": "C-41-tabs/renderer.js"
    },
    "C-42": {
      "id": "C-42",
      "name": "tag",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["status", "category", "filter", "closable", "checkable", "loading", "bordered"], "default": "status" },
        "type": { "type": "enum", "values": ["property", "option", "status", "avatar"], "default": "property" },
        "size": { "type": "enum", "values": ["extra-small", "small", "medium", "large"], "default": "medium" },
        "color": { "type": "enum", "values": ["neutral", "blue", "green", "red", "orange", "purple", "cyan", "yellow"], "default": "neutral" },
        "text": { "type": "string", "required": true, "default": "Tag" },
        "icon": { "type": "string|null", "default": null },
        "avatar": { "type": "string|null", "default": null },
        "closable": { "type": "boolean", "default": false },
        "checkable": { "type": "boolean", "default": false },
        "checked": { "type": "boolean", "default": false },
        "loading": { "type": "boolean", "default": false },
        "bordered": { "type": "boolean", "default": false },
        "solid": { "type": "boolean", "default": false },
        "disabled": { "type": "boolean", "default": false }
      },
      "events": [
        "b2b:tag-change",
        "b2b:tag-close"
      ],
      "keyboard": [
        "Enter",
        "Space"
      ],
      "styleSource": [
        "C-42-tag/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-43": {
      "id": "C-43",
      "name": "timeline",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["vertical", "horizontal", "alternate", "breakpoint"],
          "required": false,
          "default": "vertical"
        },
        "spacing": {
          "type": "enum",
          "values": ["compact", "standard", "spacious"],
          "required": false,
          "default": "standard",
          "rules": ["horizontal accepts standard only because compact and spacious have no visible source geometry"]
        },
        "items": {
          "type": "array",
          "required": false,
          "default": [
            {
              "title": "Event node"
            },
            {
              "title": "Event node"
            },
            {
              "title": "Event node"
            }
          ],
          "item": {
            "type": "object",
            "fields": ["title", "state", "icon", "dot", "time", "datetime", "timePrefix", "tag", "avatars", "avatarOverflow", "person", "description", "inline"],
            "requiredFields": ["title"],
            "rules": ["icon and dot are mutually exclusive", "datetime and timePrefix require visible time", "inline requires title=false and time=false and does not render avatars"]
          }
        },
        "collapsible": {
          "type": "boolean",
          "required": false,
          "default": false,
          "rules": ["vertical and alternate only", "requires at least three items"]
        },
        "label": {
          "type": "string",
          "required": false,
          "default": "时间轴"
        }
      },
      "events": [
        "b2b:timeline-expand",
        "b2b:timeline-collapse"
      ],
      "keyboard": [
        "Enter",
        "Space",
        "Tab"
      ],
      "styleSource": [
        "C-32-avatar/styles.css",
        "C-42-tag/styles.css",
        "C-43-timeline/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-44": {
      "id": "C-44",
      "name": "tooltip",
      "additionalProperties": false,
      "props": {
        "position": {
          "type": "string",
          "required": false,
          "default": "top",
          "values": [
            "top-left",
            "top",
            "top-right",
            "right-top",
            "right",
            "right-bottom",
            "bottom-right",
            "bottom",
            "bottom-left",
            "left-bottom",
            "left",
            "left-top"
          ]
        },
        "text": {
          "type": "string",
          "required": false,
          "default": "Tooltip"
        },
        "triggerText": {
          "type": "string",
          "required": false,
          "default": "Hover me"
        },
        "multiline": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "max": {
          "type": "boolean",
          "required": false,
          "default": false
        }
      },
      "events": [
        "b2b:tooltip-open",
        "b2b:tooltip-close"
      ],
      "keyboard": [
        "Escape",
        "Tab"
      ],
      "styleSource": [
        "C-44-tooltip/styles.css",
        "C-02-basic-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-45": {
      "id": "C-45",
      "name": "dialog",
      "additionalProperties": false,
      "props": {
        "variant": { "type": "enum", "values": ["confirmation", "notification", "success", "warning", "error", "destructive", "form", "task", "choice", "settings", "preferences", "subscription"], "default": "confirmation" },
        "title": { "type": "string", "required": false, "default": "确认操作？" },
        "body": { "type": "string", "required": false, "default": "完成后将立即生效。" },
        "description": { "type": "string", "default": "" },
        "size": { "type": "enum", "values": ["small", "medium", "large", "extra-large"], "required": false, "default": "small" },
        "placement": { "type": "enum", "values": ["center", "top"], "default": "center" },
        "scrollable": { "type": "boolean", "default": false },
        "open": { "type": "boolean", "default": false },
        "closable": { "type": "boolean", "default": true },
        "closeOnBackdrop": { "type": "boolean", "default": true },
        "closeOnEscape": { "type": "boolean", "default": true },
        "confirmLabel": { "type": "string", "default": "确认" },
        "cancelLabel": { "type": "string|null", "default": "取消" },
        "alternativeLabel": { "type": "string|null", "default": null },
        "confirmLoading": { "type": "boolean", "default": false },
        "confirmDisabled": { "type": "boolean", "default": false },
        "fields": { "type": "array", "default": [], "item": { "additionalProperties": false, "fields": ["label", "value", "placeholder"] } },
        "items": { "type": "array", "default": [], "item": { "additionalProperties": false, "fields": ["label", "checked"] } },
        "choices": { "type": "array", "default": [] },
        "selectedChoice": { "type": "number", "default": 0 },
        "tabs": { "type": "array", "default": [] },
        "activeTab": { "type": "number", "default": 0 },
        "permissions": { "type": "array", "default": [] },
        "selectedPermission": { "type": "string", "default": "" },
        "switches": { "type": "array", "default": [], "item": { "additionalProperties": false, "fields": ["label", "description", "checked", "disabled", "loading"] } },
        "subscriptions": { "type": "array", "default": [], "item": { "additionalProperties": false, "fields": ["label", "detail", "initial", "subscribed", "actionLabel", "subscribedLabel"] } },
        "searchPlaceholder": { "type": "string", "default": "搜索" }
      },
      "events": [
        "b2b:dialog-action",
        "b2b:dialog-open-change"
      ],
      "keyboard": [
        "Escape",
        "Tab"
      ],
      "styleSource": [
        "shared/base.css",
        "shared/popup-layout.css",
        "C-01-button-overview/styles.css",
        "C-02-basic-button/styles.css",
        "C-04-icon-button/styles.css",
        "C-08-dropdown-menu/styles.css",
        "C-11-checkbox/styles.css",
        "C-21-input/styles.css",
        "C-22-radio/styles.css",
        "C-23-select/styles.css",
        "C-27-switch/styles.css",
        "C-32-avatar/styles.css",
        "C-33-badge/styles.css",
        "C-41-tabs/styles.css",
        "C-44-tooltip/styles.css",
        "C-45-dialog/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-45-dialog/renderer.js"
    },
    "C-46": {
      "id": "C-46",
      "name": "drawer",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": [
            "overlay",
            "push"
          ],
          "default": "overlay",
          "required": false
        },
        "size": {
          "type": "enum",
          "values": [
            "small",
            "medium",
            "large"
          ],
          "default": "medium",
          "required": false
        },
        "modal": {
          "type": "boolean",
          "default": true,
          "required": false
        },
        "title": {
          "type": "string",
          "default": "抽屉标题",
          "required": false
        },
        "body": {
          "type": "string",
          "default": "",
          "required": false
        },
        "description": {
          "type": "string",
          "default": "",
          "required": false
        },
        "avatarText": {
          "type": "string",
          "default": "",
          "required": false
        },
        "tag": {
          "type": "string",
          "default": "",
          "required": false
        },
        "fields": {
          "type": "array",
          "default": [],
          "required": false,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "id": {
                "type": "string",
                "required": true
              },
              "label": {
                "type": "string",
                "required": true
              },
              "value": {
                "type": "string",
                "required": false
              },
              "placeholder": {
                "type": "string",
                "required": false
              }
            }
          }
        },
        "tabs": {
          "type": "array",
          "default": [],
          "required": false,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "id": {
                "type": "string",
                "required": true
              },
              "label": {
                "type": "string",
                "required": true
              },
              "content": {
                "type": "string",
                "required": false
              }
            }
          }
        },
        "activeTabId": {
          "type": "string",
          "default": "",
          "required": false
        },
        "headerActions": {
          "type": "array",
          "default": [],
          "required": false,
          "item": {
            "type": "object",
            "additionalProperties": false,
            "fields": {
              "id": {
                "type": "string",
                "required": true
              },
              "label": {
                "type": "string",
                "required": true
              },
              "icon": {
                "type": "string",
                "required": false
              }
            }
          },
          "description": "最多展示3项，超过3项时前2项加更多菜单；icon可选，使用现有中性图标按钮。"
        },
        "closable": {
          "type": "boolean",
          "default": true,
          "required": false
        },
        "actions": {
          "type": "boolean",
          "default": true,
          "required": false
        },
        "align": {
          "type": "enum",
          "values": [
            "right",
            "left"
          ],
          "default": "right",
          "required": false
        },
        "primary": {
          "type": "string",
          "default": "确认",
          "required": false
        },
        "secondary": {
          "type": "string",
          "default": "取消",
          "required": false
        }
      },
      "events": [
        "b2b:drawer-close",
        "b2b:drawer-action",
        "b2b:drawer-tab-change"
      ],
      "keyboard": [
        "Tab / Shift+Tab: modal focus containment",
        "ArrowLeft / ArrowRight / Home / End: tabs",
        "Escape: dismiss More menu"
      ],
      "styleSource": [
        "C-41-tabs/styles.css",
        "C-33-badge/styles.css",
        "C-01-button-overview/styles.css",
        "C-04-icon-button/styles.css",
        "C-46-drawer/styles.css",
        "C-10-color-picker/styles.css",
        "C-02-basic-button/styles.css",
        "C-21-input/styles.css",
        "C-32-avatar/styles.css",
        "C-42-tag/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/specimen-runtime.js"
    },
    "C-47": {
      "id": "C-47",
      "name": "loading",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["spinner", "spinner-only", "skeleton", "overlay"],
          "required": false,
          "default": "overlay"
        },
        "size": {
          "type": "enum",
          "values": ["small", "medium", "large"],
          "required": false,
          "default": "medium"
        },
        "text": {
          "type": "string|boolean",
          "required": false,
          "default": "正在更新页面内容…",
          "description": "spinner/overlay 的可见说明；false 隐藏说明并使用默认读屏名称。spinner-only/skeleton 仅将文本用于读屏名称。"
        },
        "layout": { "type": "enum", "values": ["horizontal", "vertical", "profile", "card"], "default": "vertical" },
        "avatar": { "type": "boolean", "default": true },
        "image": { "type": "boolean", "default": false },
        "inverse": { "type": "boolean", "default": false },
        "neutral": { "type": "boolean", "default": false }
      },
      "events": [],
      "keyboard": [],
      "styleSource": [
        "C-47-loading/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-47-loading/renderer.js"
    },
    "C-48": {
      "id": "C-48",
      "name": "notification",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "string",
          "required": false,
          "default": "information",
          "values": [
            "information",
            "success",
            "warning",
            "error",
            "without-icon",
            "custom"
          ]
        },
        "title": {
          "type": "string|boolean",
          "required": false,
          "default": "Message"
        },
        "text": {
          "type": "string",
          "required": false,
          "default": "This is a message."
        },
        "primary": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "secondary": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "placement": { "type": "enum", "values": ["inline", "top-right", "bottom-right"], "default": "top-right" },
        "duration": { "type": "enum", "values": [0, 4000, 6000, 8000], "default": 4000 },
        "closable": {
          "type": "boolean",
          "required": false,
          "default": true
        }
      },
      "events": [
        "b2b:notification-close",
        "b2b:notification-action",
        "b2b:notification-dismiss"
      ],
      "rules": ["closable=false requires duration > 0; duration=0 persists until closed", "placement=inline preserves embedded callers; top-right and bottom-right use viewport portals"],
      "keyboard": [
        "Enter / Space: activate the focused close or action button"
      ],
      "styleSource": [
        "C-48-notification/styles.css",
        "C-02-basic-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-49": {
      "id": "C-49",
      "name": "alert",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["information", "success", "warning", "error"],
          "required": false,
          "default": "warning"
        },
        "title": {
          "type": "string",
          "required": false,
          "default": ""
        },
        "text": {
          "type": "string",
          "required": false,
          "default": "This is the text prompt information."
        },
        "action": {
          "type": "string|null",
          "required": false,
          "default": null
        },
        "closable": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "actionLayout": {
          "type": "enum",
          "values": ["inline", "separate", "follow"],
          "description": "inline 单行靠右；follow 单行跟随正文；空间不足、多行或有标题时二者均自动另起一行。separate 始终独立一行。",
          "required": false,
          "default": "inline"
        },
        "alignment": {
          "type": "enum",
          "values": ["start", "center"],
          "description": "start 左对齐且自动换行；center 无标题单行居中，空间不足时文本省略并保留完整悬停提示。",
          "required": false,
          "default": "start"
        },
        "icon": {
          "type": "string|null",
          "required": false,
          "default": null
        }
      },
      "events": [
        "b2b:alert-close",
        "b2b:alert-action"
      ],
      "keyboard": [
        "Enter",
        "Space"
      ],
      "styleSource": [
        "C-49-alert/styles.css",
        "C-02-basic-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-50": {
      "id": "C-50",
      "name": "toast",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["information", "success", "warning", "error", "loading"],
          "required": false,
          "default": "information"
        },
        "text": {
          "type": "string",
          "required": true,
          "default": "This is a global prompt for a message"
        },
        "action": {
          "type": "string|null",
          "required": false,
          "default": null
        },
        "secondAction": {
          "type": "string|null",
          "required": false,
          "default": null
        },
        "closable": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "multiline": {
          "type": "boolean",
          "required": false,
          "default": false
        },
        "showIcon": {
          "type": "boolean",
          "required": false,
          "default": true
        },
        "placement": {
          "type": "enum",
          "values": ["inline", "top-center", "top-right", "bottom-center", "bottom-right"],
          "required": false,
          "default": "inline",
          "description": "inline 保持行内挂载；其余四种在当前页面视口定位，自动脱离裁切祖先。"
        },
        "duration": {
          "type": "number",
          "required": false,
          "default": 4000
        }
      },
      "events": [
        "b2b:toast-action",
        "b2b:toast-close",
        "b2b:toast-dismiss"
      ],
      "keyboard": ["Enter", "Space", "Tab"],
      "styleSource": [
        "C-50-toast/styles.css",
        "C-02-basic-button/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "shared/interactions.js"
    },
    "C-51": {
      "id": "C-51",
      "name": "progress",
      "additionalProperties": false,
      "props": {
        "variant": {
          "type": "enum",
          "values": ["line", "circle", "steps", "indeterminate"],
          "required": false,
          "default": "line"
        },
        "value": {
          "type": "number",
          "required": false,
          "default": 50
        },
        "state": {
          "type": "enum",
          "values": ["not-started", "progress", "success", "error"],
          "required": false,
          "default": "progress"
        },
        "valueLabel": { "type": "boolean", "default": true },
        "valueSide": { "type": "enum", "values": ["left", "right"], "default": "left" },
        "steps": { "type": "number", "default": 5 },
        "label": { "type": "string", "default": "Progress" }
      },
      "events": [],
      "keyboard": [],
      "styleSource": [
        "C-51-progress/styles.css"
      ],
      "domSource": "shared/specimen-runtime.js",
      "interactionSource": "C-51-progress/renderer.js"
    }
  };
  schemas["C-52"] = {
  "id": "C-52",
  "name": "aiChat",
  "additionalProperties": false,
  "props": {
    "variant": {
      "type": "enum",
      "default": "panel",
      "description": "panel 为完整面板，sidebar 为最大420px侧栏。",
      "values": [
        "panel",
        "sidebar"
      ]
    },
    "size": {
      "type": "enum",
      "default": "medium",
      "description": "小/中/大高度520/640/720px；默认中等。",
      "values": [
        "small",
        "medium",
        "large"
      ]
    },
    "title": {
      "type": "string",
      "default": "AI 助手",
      "description": "会话顶栏标题，不能为空；新对话不展示。"
    },
    "description": {
      "type": "string",
      "default": "一起把想法变成结果",
      "description": "空白欢迎状态说明。"
    },
    "messages": {
      "type": "array",
      "default": [],
      "description": "调用方消息。空消息、idle、activeConversationId null 为新对话，欢迎语与建议居中、输入框位于底部。role为user/assistant；content支持标题、列表、加粗、行内代码和围栏代码；HTML显示为文字。tools仅属于assistant。",
      "item": {
        "fields": {
          "id": "唯一非空字符串",
          "role": "user | assistant",
          "content": "string",
          "tools": "可选数组：{id,title,status:pending|running|success|error,detail}；内部id唯一",
          "elapsed": "可选string，仅assistant；显示用时分隔行",
          "resources": "可选数组，仅assistant：{id,title,description,kind:website|file}；id唯一，点击仅发事件"
        }
      }
    },
    "value": {
      "type": "string",
      "default": "",
      "description": "输入区当前内容；空白且无附件时发送按钮灰色禁用，有内容或附件时蓝色可发送，生成中为停止。"
    },
    "status": {
      "type": "enum",
      "default": "idle",
      "description": "生成中切换停止图标与只读输入；不运行真实任务。",
      "values": [
        "idle",
        "generating",
        "error"
      ]
    },
    "errorMessage": {
      "type": "string",
      "default": "暂时无法生成回复，请稍后重试。",
      "description": "error状态下作为当前失败回复的C-49提示，接在最后一条assistant的部分内容后，或在用户消息后生成失败回复；必须非空，重试转发chat-retry事件。"
    },
    "model": {
      "type": "string",
      "default": "通用模型",
      "description": "当前模型名称，必须属于models。"
    },
    "models": {
      "type": "array",
      "default": [
        "通用模型"
      ],
      "description": "1–12个唯一非空模型名，每个最多20字符；C-23无边框选择器，宽度根据全部模型中的最长名称预留，选项保持单行，极窄容器沿用选择器省略样式；当前完整名称保留在title及可访问名称。"
    },
    "attachments": {
      "type": "array",
      "default": [],
      "description": "最多12个附件卡片，显示类型图标、文件名、后缀类型和移除按钮；类型由name后缀推导，无后缀按kind显示文件/图片。不读取或上传文件。",
      "item": {
        "fields": {
          "id": "唯一非空字符串",
          "name": "非空文件名",
          "kind": "file | image"
        }
      }
    },
    "placeholder": {
      "type": "string",
      "default": "随心输入，Enter 发送，Shift + Enter 换行",
      "description": "输入区占位文案，默认合并发送/换行说明；自定义时完整替换占位文案。"
    },
    "suggestions": {
      "type": "array",
      "default": [
        "帮我整理思路",
        "分析一份文档",
        "写一段代码"
      ],
      "description": "空白状态0–4条快捷建议。"
    },
    "disabled": {
      "type": "boolean",
      "default": false,
      "description": "禁用输入及操作按钮。"
    },
    "history": {
      "type": "array",
      "default": [],
      "description": "按group分组的历史记录，保留输入顺序；只展示，不读写历史存储。",
      "item": {
        "fields": {
          "id": "唯一非空字符串",
          "title": "非空标题",
          "group": "非空分组名称"
        }
      }
    },
    "activeConversationId": {
      "type": "string|null",
      "default": null,
      "description": "当前选中的历史id；非null时必须属于history。选择仅改变高亮并发conversation-select，调用方负责同步标题和消息；新建对话时传null并清空messages、恢复idle。"
    },
    "historyMode": {
      "type": "enum",
      "default": "auto",
      "values": [
        "auto",
        "open",
        "closed"
      ],
      "description": "auto在容器宽度>680px时显示并排历史；open展开；closed收起。窄容器为最多240px的滑出历史栏，至少留出64px对话区；支持动画和减少动效。"
    }
  },
  "events": [
    "b2b:chat-input",
    "b2b:chat-send",
    "b2b:chat-stop",
    "b2b:chat-retry",
    "b2b:chat-copy",
    "b2b:chat-model-change",
    "b2b:chat-attachment-request",
    "b2b:chat-attachment-remove",
    "b2b:chat-history-toggle",
    "b2b:chat-conversation-select",
    "b2b:chat-new-conversation",
    "b2b:chat-resource-open"
  ],
  "keyboard": [
    "Tab",
    "Enter",
    "Space",
    "Shift+Enter",
    "Escape"
  ],
  "domSource": "C-52-ai-chat/source.js",
  "styleSource": [
    "C-52-ai-chat/styles.css",
    "C-04-icon-button/styles.css",
    "C-06-split-button-menu-button/styles.css",
    "C-23-select/styles.css",
    "C-49-alert/styles.css"
  ],
  "interactionSource": "C-52-ai-chat/source.js"
};
  Object.keys(schemas).forEach(function (id) { Object.freeze(schemas[id]); });
  components.apiSchemas = Object.freeze(schemas);
})(window);
