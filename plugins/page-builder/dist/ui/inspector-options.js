// Presentation only. The source schema owns available values; these labels never
// become component props, and unknown source values stay available unchanged.
const shared = {
  size: { mini: "迷你", "extra-small": "超小", small: "小", medium: "中", large: "大", xlarge: "超大", default: "默认" },
  gap: { small: "小", medium: "中", large: "大" },
  state: { default: "默认", disabled: "禁用", readonly: "只读", error: "错误", loading: "加载中", "no-result": "无结果" },
  appearance: { bordered: "有边框", borderless: "无边框" },
  color: { neutral: "中性灰", blue: "蓝色", green: "绿色", red: "红色", orange: "橙色", purple: "紫色", cyan: "青色", yellow: "黄色" },
  width: { default: "默认宽度", long: "长按钮" },
  position: { "bottom-left": "左下方", top: "上方", right: "右侧", left: "左侧" },
  layout: { column: "纵向", row: "横向", columns: "分栏" }
};
const components = {
  "C-02": { variant: { primary: "主要按钮", danger: "主要危险按钮", "secondary-blue": "蓝色次要按钮", "secondary-danger": "次要危险按钮", "secondary-gray": "灰色次要按钮" } },
  "C-34": { variant: { basic: "基础卡片", compact: "简洁卡片", cover: "封面卡片", meta: "图文卡片", "external-grid": "栅格卡片", "content-grid": "内容区隔", nested: "内部卡片", tabs: "页签卡片", actions: "底部操作卡片", interactive: "整体可点击" } },
  "C-42": {
    variant: { status: "状态标签", category: "分类标签", filter: "筛选标签", closable: "可关闭", checkable: "可选择", loading: "加载中", bordered: "描边标签" },
    type: { property: "属性标签", option: "选项标签", status: "状态标签", avatar: "头像标签" }
  }
};

export function inspectorOptions(componentId, key, values, metadata) {
  const labels = components[componentId]?.[key] || shared[key] || {};
  const options = values.map(value => ({ value, label: metadata?.find(option => option.value === value)?.label ?? (Object.hasOwn(labels, value) ? labels[value] : String(value)) }));
  const counts = new Map();
  for (const { label } of options) counts.set(label, (counts.get(label) || 0) + 1);
  const used = new Set();
  for (const [index, option] of options.entries()) {
    if (counts.get(option.label) > 1) option.label += `（${option.value}）`;
    while (used.has(option.label)) option.label += ` · ${index + 1}`;
    used.add(option.label);
  }
  return options;
}
