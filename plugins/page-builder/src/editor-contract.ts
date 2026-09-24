import type { ComponentDefinition, PropRule } from "./catalog.js";
import type { Condition, FieldEditor } from "./builder-protocol.js";

export function matchesConditions(conditions: Condition[] | undefined, props: Record<string, unknown>) {
  return !conditions || conditions.every(condition => condition.not ? !condition.values.includes(props[condition.property] as any) : condition.values.includes(props[condition.property] as any));
}
export function editorControl(editor: FieldEditor, props: Record<string, unknown>) {
  const matches = editor.controlWhen?.filter(item => matchesConditions(item.when, props)) || [];
  if (matches.length > 1) throw new Error("组件编辑协议匹配多个控件规则，请修正组件库协议后重载。");
  return matches[0]?.control || editor.control || "auto";
}
export function editorFields(rules: Record<string, PropRule>, fields: Record<string, FieldEditor> = {}, props: Record<string, unknown> = {}) {
  return Object.entries(rules).map(([key, rule], index) => ({ key, rule, editor: fields[key] || {}, index }))
    .filter(item => matchesConditions(item.editor.visibleWhen, props))
    .sort((a, b) => (a.editor.order ?? a.index) - (b.editor.order ?? b.index));
}
export function emptyValue(value: unknown) { return value == null || typeof value === "string" && !value.trim() || Array.isArray(value) && !value.length; }

// Returns null only when the legacy adapter owns this transition. Throws before
// writing if metadata is ambiguous or a prerequisite is missing.
export function contractPatch(definition: ComponentDefinition, props: Record<string, unknown>, property: string, value: unknown): Record<string, unknown> | null {
  const transitions = definition.builder?.transitions?.filter(item => item.property === property && item.value === value && matchesConditions(item.when, props)) || [];
  if (!transitions.length) return null;
  if (transitions.length !== 1) throw new Error("组件编辑协议匹配多个转换规则，请修正组件库协议后重载。");
  const transition = transitions[0];
  for (const item of transition.require || []) if (emptyValue(props[item.property])) throw new Error(item.message);
  const patch: Record<string, unknown> = {};
  for (const name of transition.reset || []) patch[name] = structuredClone(definition.props[name].default);
  Object.assign(patch, structuredClone(transition.set || {}));
  for (const [name, next] of Object.entries(transition.ensure || {})) if (emptyValue(props[name])) patch[name] = structuredClone(next);
  patch[property] = value;
  return patch;
}
