export type PropRule = {
  type: string;
  description?: string;
  item?: any;
  fields?: any;
  values?: readonly (string | number)[];
  editorValues?: readonly (string | number)[];
  default?: unknown;
  required?: boolean;
};

export type ComponentDefinition = {
  id: string;
  name: string;
  label: string;
  description: string;
  rendererName: string;
  editable: readonly string[];
  props: Record<string, PropRule>;
  defaults: Record<string, unknown>;
  variantDefaults?: Record<string, Record<string, unknown>>;
};

export const COMPONENTS: Record<string, ComponentDefinition> = {
  "C-02": {
    id: "C-02", name: "basicButton", label: "基础按钮", description: "触发立即动作并表达操作优先级。", rendererName: "basicButton",
    editable: ["label", "variant", "size", "disabled", "loading", "width"],
    props: {
      label: { type: "string", default: "按钮" }, variant: { type: "string", values: ["primary", "danger", "secondary-blue", "secondary-danger", "secondary-gray"], default: "secondary-gray" },
      size: { type: "string", values: ["mini", "small", "medium", "large", "xlarge"], default: "medium" }, icon: { type: "string|null", default: null },
      disabled: { type: "boolean", default: false }, loading: { type: "boolean", default: false }, width: { type: "string", values: ["default", "long"], default: "default" }
    },
    defaults: { label: "按钮", variant: "secondary-gray", size: "medium", icon: null, disabled: false, loading: false, width: "default" }
  },
  "C-21": {
    id: "C-21", name: "input", label: "输入框", description: "录入单行或多行文本。", rendererName: "input",
    editable: ["label", "value", "placeholder", "variant", "size", "state", "clearable"],
    props: {
      variant: { type: "string", values: ["基础输入框", "数字输入框", "带图标输入框", "带属性输入框", "组合输入框", "长文本输入框"], default: "基础输入框" },
      size: { type: "string", values: ["mini", "small", "medium", "large", "xlarge"], default: "medium" }, state: { type: "string", values: ["default", "disabled", "readonly", "error"], default: "default" },
      label: { type: "string", required: true, default: "输入内容" }, value: { type: "string|number", default: "" }, placeholder: { type: "string", default: "请输入" },
      clearable: { type: "boolean", default: false }, counter: { type: "boolean", default: false }, maxLength: { type: "number", default: 20 }, borderless: { type: "boolean", default: false }, password: { type: "boolean", default: false },
      prefixIcon: { type: "string|null", default: null }, suffixIcon: { type: "string|null", default: null }, infoTooltip: { type: "object|null", default: null }, min: { type: "number", default: 0 }, max: { type: "number", default: 10 }, step: { type: "number", default: 1 }, prefixAddon: { type: "object|null", default: null }, suffixAddon: { type: "object|null", default: null }, tag: { type: "string|null", default: null }, composite: { type: "object|null", default: null }, auto: { type: "boolean", default: false }
    },
    defaults: { variant: "基础输入框", size: "medium", state: "default", label: "输入内容", value: "", placeholder: "请输入", clearable: true, counter: false, maxLength: 20, borderless: false, password: false, prefixIcon: null, suffixIcon: null, infoTooltip: null, min: 0, max: 10, step: 1, prefixAddon: null, suffixAddon: null, tag: null, composite: null, auto: false }
  },
  "C-23": {
    id: "C-23", name: "select", label: "选择器", description: "从候选项中选择一项。", rendererName: "select",
    editable: ["placeholder", "variant", "size", "state", "items", "selected"],
    props: {
      variant: { type: "string", values: ["基础单选", "基础多选", "自定义选项", "分组选项", "无边框", "下划线", "可搜索", "可创建", "复杂内容"], editorValues: ["基础单选", "无边框", "下划线"], default: "基础单选" },
      items: { type: "array", default: ["选项一", "选项二", "选项三"] }, selected: { type: "array", default: [] }, multiple: { type: "boolean", default: false }, open: { type: "boolean", default: false },
      placeholder: { type: "string", default: "请选择" }, clearable: { type: "boolean", default: true }, searchable: { type: "boolean", default: false }, creatable: { type: "boolean", default: false }, query: { type: "string", default: "" },
      size: { type: "string", values: ["small", "medium", "large"], default: "medium" }, state: { type: "string", values: ["default", "disabled", "readonly", "error", "loading", "no-result"], editorValues: ["default", "disabled", "readonly", "error"], default: "default" }, position: { type: "string", values: ["bottom-left", "top", "right", "left"], default: "bottom-left" }
    },
    defaults: { variant: "基础单选", items: ["选项一", "选项二", "选项三"], selected: [], multiple: false, open: false, placeholder: "请选择", clearable: true, searchable: false, creatable: false, query: "", size: "medium", state: "default", position: "bottom-left" }
  },
  "C-42": {
    id: "C-42", name: "tag", label: "标签", description: "展示状态、分类或筛选条件。", rendererName: "tag",
    editable: ["text", "variant", "type", "avatar", "size", "color", "closable", "checkable", "checked"],
    props: {
      variant: { type: "string", values: ["status", "category", "filter", "closable", "checkable", "loading", "bordered"], default: "status" }, type: { type: "string", values: ["property", "option", "status", "avatar"], default: "property" },
      size: { type: "string", values: ["extra-small", "small", "medium", "large"], default: "medium" }, color: { type: "string", values: ["neutral", "blue", "green", "red", "orange", "purple", "cyan", "yellow"], default: "neutral" },
      text: { type: "string", required: true, default: "标签" }, icon: { type: "string|null", default: null }, avatar: { type: "string|null", default: null }, closable: { type: "boolean", default: false }, checkable: { type: "boolean", default: false }, checked: { type: "boolean", default: false }, loading: { type: "boolean", default: false }, bordered: { type: "boolean", default: false }, solid: { type: "boolean", default: false }, disabled: { type: "boolean", default: false }
    },
    defaults: { variant: "status", type: "property", size: "medium", color: "blue", text: "标签", icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: false, bordered: false, solid: false, disabled: false }
  },
  "C-34": {
    id: "C-34", name: "card", label: "卡片", description: "承载独立对象或摘要，不接收任意子组件。", rendererName: "card",
    editable: ["title", "body", "meta", "variant", "appearance", "size", "hoverable", "selected"],
    props: {
      variant: { type: "string", values: ["basic", "compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive"], default: "basic" }, appearance: { type: "string", values: ["bordered", "borderless"], default: "bordered" }, size: { type: "string", values: ["default", "small"], default: "default" },
      title: { type: "string", default: "卡片标题" }, body: { type: "string", default: "在属性面板中编辑卡片内容。" }, meta: { type: "string", default: "" }, icon: { type: "string", default: "description" }, hoverable: { type: "boolean", default: false }, selected: { type: "boolean", default: false }, loading: { type: "boolean", default: false }, extraActionLabel: { type: "string|null", default: null }, footerActionLabel: { type: "string|null", default: null }, coverImage: { type: "string|null", default: null }, coverAlt: { type: "string", default: "" }, avatar: { type: "object|null", default: null }, items: { type: "array", default: [] }, columns: { type: "number", default: 3 }, tabs: { type: "array", default: [] }, activeTabId: { type: "string|null", default: null }, actions: { type: "array", default: [] }
    },
    defaults: { variant: "basic", appearance: "bordered", size: "default", title: "卡片标题", body: "在属性面板中编辑卡片内容。", meta: "", icon: "description", hoverable: false, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null, coverImage: null, coverAlt: "", avatar: null, items: [], columns: 3, tabs: [], activeTabId: null, actions: [] }
  }
};

export function catalogList() {
  return Object.values(COMPONENTS).map(({ props, ...definition }) => ({ ...definition, props }));
}
