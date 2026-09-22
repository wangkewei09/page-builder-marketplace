import type { PropRule } from "./catalog.js";
import { conditions, type Condition } from "./builder-protocol.js";

export type InlineBinding = { property: string; selector: string; control: "text" | "textarea" | "number"; when?: Condition[] };
export type InlineContract = { schemaVersion: 1; libraryId: "b2b"; components: Record<string, InlineBinding[]> };

// Deliberately a separate optional file: older v1 inspector consumers reject unknown keys.
// Selectors are read-only geometry anchors, scoped to one production renderer root.
export function parseInlineContract(input: unknown, schemas: Record<string, { props: Record<string, PropRule> }>): InlineContract {
  const fail = (message: string): never => { throw new Error(`画布编辑协议：${message}`); };
  const object = (value: any, allowed?: string[]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail("必须为对象");
    for (const key of Object.keys(value)) if (["__proto__", "constructor", "prototype"].includes(key) || allowed && !allowed.includes(key)) fail(`不支持字段 ${key}`);
  };
  const data = input as InlineContract;
  object(data, ["schemaVersion", "libraryId", "components"]);
  if (data.schemaVersion !== 1 || data.libraryId !== "b2b") fail("不支持的版本或组件库");
  object(data.components);
  for (const [id, bindings] of Object.entries(data.components)) {
    const rules = schemas[id]?.props;
    if (!rules || !Array.isArray(bindings) || bindings.length > 100) fail(`无效组件 ${id}`);
    const seen = new Set<string>();
    for (const binding of bindings) {
      object(binding, ["property", "selector", "control", "when"]);
      const rule = Object.hasOwn(rules, binding.property) && rules[binding.property];
      if (!rule || rule.values || !["text", "textarea", "number"].includes(binding.control) || !rule.type.split("|").includes(binding.control === "number" ? "number" : "string")) fail(`${id}.${binding.property} 不是兼容的公开内容属性`);
      // Small grammar: :scope and direct-child chains only. No escape to siblings,
      // pseudo selectors, arbitrary attributes, or broad descendant matches.
      if (typeof binding.selector !== "string" || binding.selector.length > 400 || !/^:scope(?: > (?:[a-z][a-z0-9-]*|\.[a-zA-Z][\w-]*|\[data-[\w-]+(?:="[\w-]+")?\]))*$/.test(binding.selector)) fail(`${id} 选择器必须是 :scope 开头的直接子级路径`);
      const key = JSON.stringify(binding); if (seen.has(key)) fail(`${id} 重复映射`); seen.add(key);
      if (binding.when) conditions(binding.when, rules, `${id}.${binding.property}.when`);
    }
  }
  return data;
}
