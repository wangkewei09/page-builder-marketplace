import type { PropRule } from "./catalog.js";

export type Condition = { property: string; values: (string | number | boolean | null)[]; not?: boolean };
export type FieldEditor = {
  label?: string; description?: string; group?: string; order?: number;
  control?: "auto" | "text" | "textarea" | "number" | "switch" | "select" | "structured" | "image";
  options?: { value: string | number; label: string }[];
  visibleWhen?: Condition[]; enabledWhen?: Condition[];
  controlWhen?: { when: Condition[]; control: NonNullable<FieldEditor["control"]> }[];
  fields?: Record<string, FieldEditor>; item?: FieldEditor;
};
export type EditorTransition = {
  property: string; value: string | number | boolean | null; when?: Condition[];
  reset?: string[]; set?: Record<string, unknown>; ensure?: Record<string, unknown>;
  require?: { property: string; message: string }[];
};
export type ComponentEditor = {
  label?: string; description?: string; groups?: { id: string; label: string }[];
  fields?: Record<string, FieldEditor>; transitions?: EditorTransition[];
};
export type BuilderContract = { schemaVersion: 1; libraryId: "b2b"; components: Record<string, ComponentEditor> };
type Schema = { props: Record<string, PropRule> };
const forbidden = new Set(["__proto__", "constructor", "prototype"]);
function requireValid(valid: unknown, at: string, reason: string): asserts valid {
  if (!valid) throw new Error(`编辑协议 ${at}：${reason}`);
}
function object(value: any, at: string, keys?: string[]): asserts value is Record<string, any> {
  requireValid(value && typeof value === "object" && !Array.isArray(value), at, "必须为对象");
  for (const key of Object.keys(value)) requireValid(!forbidden.has(key) && (!keys || keys.includes(key)), `${at}.${key}`, "不支持的字段");
}
function text(value: any, at: string) { requireValid(typeof value === "string" && value.trim() && value.length <= 4000, at, "必须为非空文本（最多 4000 字符）"); }
function list(value: any, at: string) { requireValid(Array.isArray(value) && value.length <= 500, at, "必须为列表（最多 500 项）"); }
function prop(rules: Record<string, PropRule>, key: any, at: string): PropRule {
  requireValid(typeof key === "string" && !forbidden.has(key) && Object.hasOwn(rules, key), at, `未声明的组件属性 ${key}`);
  return rules[key];
}
export function matchesPropType(value: unknown, rule: PropRule): boolean {
  if (rule.values) return rule.values.some(item => item === value);
  return (rule.type || (rule.fields ? "object" : "unknown")).split("|").some(type => type === "unknown" || type === "null" && value === null || type === "array" && Array.isArray(value) || type === "object" && !!value && typeof value === "object" && !Array.isArray(value) || ["string", "boolean", "number"].includes(type) && typeof value === type && (type !== "number" || Number.isFinite(value)));
}
export function conditions(value: any, rules: Record<string, PropRule>, at: string) {
  list(value, at);
  for (const [i, condition] of value.entries()) {
    const key = `${at}[${i}]`; object(condition, key, ["property", "values", "not"]);
    const rule = prop(rules, condition.property, key); list(condition.values, key);
    requireValid(condition.values.length && condition.values.every((item: any) => (item === null || ["string", "number", "boolean"].includes(typeof item)) && matchesPropType(item, rule)), key, "条件值不属于源属性类型或枚举");
    if (condition.not !== undefined) requireValid(typeof condition.not === "boolean", key, "not 必须为布尔值");
  }
}
function overlap(left: Condition[] = [], right: Condition[] = [], rules: Record<string, PropRule>) {
  const all = [...left, ...right];
  for (const name of new Set(all.map(item => item.property))) {
    const constraints = all.filter(item => item.property === name), rule = rules[name];
    let candidates: unknown[] | undefined = rule.values ? [...rule.values] : rule.type === "boolean" ? [false, true] : undefined;
    for (const constraint of constraints.filter(item => !item.not)) candidates = candidates ? candidates.filter(value => constraint.values.includes(value as any)) : [...constraint.values];
    if (candidates && !candidates.some(value => constraints.every(item => item.not ? !item.values.includes(value as any) : item.values.includes(value as any)))) return false;
  }
  return true;
}
function inferred(value: any): PropRule { return { type: value === null || value === undefined ? "unknown" : Array.isArray(value) ? "array" : typeof value, ...(value === undefined ? {} : { default: value }) }; }
export function childRules(rule: PropRule, sample = rule.default): Record<string, PropRule> {
  const declared = rule.fields || rule.item?.fields || {};
  const defaults = sample && typeof sample === "object" && !Array.isArray(sample) ? sample as Record<string, unknown> : {};
  const keys = [...new Set([...Object.keys(defaults), ...(Array.isArray(declared) ? declared : Object.keys(declared))])];
  return Object.fromEntries(keys.map(key => [key, !Array.isArray(declared) && declared[key] || inferred(defaults[key])]));
}
function field(editor: any, rule: PropRule, rules: Record<string, PropRule>, groups: Set<string>, at: string, depth = 0, conditional = false) {
  requireValid(depth <= 8, at, "嵌套最多 8 层");
  object(editor, at, ["label", "description", "group", "order", "control", "options", "visibleWhen", "enabledWhen", "controlWhen", "fields", "item"]);
  for (const key of ["label", "description"]) if (editor[key] !== undefined) text(editor[key], `${at}.${key}`);
  if (editor.group !== undefined) requireValid(groups.has(editor.group), at, "引用未声明的分组");
  if (editor.order !== undefined) requireValid(typeof editor.order === "number" && Number.isFinite(editor.order), at, "order 必须为有限数字");
  const control = editor.control || "auto", types = (rule.type || (rule.fields ? "object" : "unknown")).split("|");
  requireValid(["auto", "text", "textarea", "number", "switch", "select", "structured", "image"].includes(control), at, "未知控件类型");
  const branch = (type: string) => types.includes(type) && (conditional || types.every(item => item === type || item === "null"));
  const compatible = control === "auto" || control === "select" && !!rule.values || control === "switch" && branch("boolean") || control === "number" && branch("number") || ["text", "textarea", "image"].includes(control) && branch("string") || control === "structured" && types.every(item => ["object", "array", "null"].includes(item));
  requireValid(compatible, at, "控件与源属性类型不匹配");
  if (editor.options !== undefined) {
    list(editor.options, `${at}.options`); const used = new Set();
    for (const option of editor.options) {
      object(option, at, ["value", "label"]); text(option.label, at);
      requireValid(rule.values?.includes(option.value) && !used.has(option.value), at, "选项必须唯一且属于源枚举"); used.add(option.value);
    }
  }
  for (const key of ["visibleWhen", "enabledWhen"]) if (editor[key] !== undefined) conditions(editor[key], rules, `${at}.${key}`);
  if (editor.controlWhen !== undefined) {
    list(editor.controlWhen, `${at}.controlWhen`);
    for (const entry of editor.controlWhen) { object(entry, at, ["when", "control"]); conditions(entry.when, rules, at); requireValid(entry.control, at, "条件控件缺少 control"); field({ control: entry.control }, rule, rules, groups, `${at}.controlWhen`, depth, true); }
    for (let i = 0; i < editor.controlWhen.length; i++) for (let j = i + 1; j < editor.controlWhen.length; j++) requireValid(!overlap(editor.controlWhen[i].when, editor.controlWhen[j].when, rules), at, "多个控件规则可能同时匹配");
  }
  if (editor.fields !== undefined) {
    requireValid(types.includes("object") || types.includes("unknown"), at, "fields 仅用于对象"); object(editor.fields, `${at}.fields`);
    const nested = childRules(rule);
    for (const [key, child] of Object.entries(editor.fields)) field(child, prop(nested, key, `${at}.${key}`), rules, groups, `${at}.${key}`, depth + 1);
  }
  if (editor.item !== undefined) {
    requireValid(types.includes("array") || types.includes("unknown"), at, "item 仅用于列表");
    const item = rule.item || inferred(Array.isArray(rule.default) ? rule.default[0] : undefined);
    field(editor.item, item, rules, groups, `${at}.item`, depth + 1);
  }
}

export function parseBuilderContract(input: unknown, schemas: Record<string, Schema>): BuilderContract {
  const contract = input as any; object(contract, "root", ["schemaVersion", "libraryId", "components"]);
  requireValid(contract.schemaVersion === 1, "schemaVersion", "仅支持版本 1");
  requireValid(contract.libraryId === "b2b", "libraryId", "组件库标识不匹配"); object(contract.components, "components");
  for (const [id, raw] of Object.entries(contract.components)) {
    const editor = raw as any, at = `components.${id}`, rules = schemas[id]?.props;
    requireValid(rules, at, "源 API 中不存在此组件"); object(editor, at, ["label", "description", "groups", "fields", "transitions"]);
    for (const key of ["label", "description"]) if (editor[key] !== undefined) text(editor[key], at);
    const groups = new Set<string>();
    if (editor.groups !== undefined) { list(editor.groups, `${at}.groups`); for (const group of editor.groups) { object(group, at, ["id", "label"]); text(group.id, at); text(group.label, at); requireValid(!groups.has(group.id), at, "分组标识重复"); groups.add(group.id); } }
    if (editor.fields !== undefined) { object(editor.fields, `${at}.fields`); for (const [key, item] of Object.entries(editor.fields)) field(item, prop(rules, key, `${at}.${key}`), rules, groups, `${at}.${key}`); }
    if (editor.transitions !== undefined) {
      list(editor.transitions, `${at}.transitions`);
      for (const transition of editor.transitions) {
        object(transition, at, ["property", "value", "when", "reset", "set", "ensure", "require"]);
        const rule = prop(rules, transition.property, at);
        requireValid(transition.value === null || ["string", "number", "boolean"].includes(typeof transition.value), at, "触发值必须为标量");
        requireValid(matchesPropType(transition.value, rule), at, "触发值不属于源属性类型或枚举");
        if (transition.when !== undefined) conditions(transition.when, rules, at);
        if (transition.reset !== undefined) { list(transition.reset, at); for (const key of transition.reset) requireValid(Object.hasOwn(prop(rules, key, at), "default"), at, "重置字段没有默认值"); }
        for (const key of ["set", "ensure"]) if (transition[key] !== undefined) { object(transition[key], at); for (const [name, value] of Object.entries(transition[key])) requireValid(matchesPropType(value, prop(rules, name, at)), at, `转换输出 ${name} 类型不匹配`); }
        if (transition.require !== undefined) { list(transition.require, at); for (const item of transition.require) { object(item, at, ["property", "message"]); prop(rules, item.property, at); text(item.message, at); } }
      }
      for (let i = 0; i < editor.transitions.length; i++) for (let j = i + 1; j < editor.transitions.length; j++) {
        const a = editor.transitions[i], b = editor.transitions[j];
        requireValid(a.property !== b.property || a.value !== b.value || !overlap(a.when, b.when, rules), at, "多个转换规则可能同时匹配");
      }
    }
  }
  return contract as BuilderContract;
}
