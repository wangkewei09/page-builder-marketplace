import vm from "node:vm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { COMPONENTS, type ComponentDefinition, type PropRule } from "./catalog.js";
import { parseBuilderContract, type BuilderContract } from "./builder-protocol.js";

export async function readLibraryCatalog(directory: string): Promise<Record<string, ComponentDefinition>> {
  const context = { window: { B2B: { components: {} as any } } };
  vm.runInNewContext(await readFile(path.join(directory, "components/runtime/api-schema.js"), "utf8"), context, { timeout: 1000 });
  vm.runInNewContext(await readFile(path.join(directory, "components/runtime/presets.js"), "utf8"), context, { timeout: 1000 });
  const presets = JSON.parse(JSON.stringify(context.window.B2B.components.rendererPresets));
  const schemas = JSON.parse(JSON.stringify(context.window.B2B.components.apiSchemas));
  let contract: BuilderContract | undefined;
  try {
    const text = await readFile(path.join(directory, "components/runtime/builder-contract.json"), "utf8");
    if (Buffer.byteLength(text) > 1024 * 1024) throw new Error("组件编辑协议超过 1 MiB。");
    contract = parseBuilderContract(JSON.parse(text), schemas);
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const output: Record<string, ComponentDefinition> = {};
  for (const [id, editor] of Object.entries(COMPONENTS)) {
    const api = schemas[id]; if (!api?.props) throw new Error(`${id} 缺少组件库公开协议。`);
    const props = api.props as Record<string, PropRule>;
    output[id] = { id, name: api.name, rendererName: api.name, label: editor.label, description: editor.description, editable: editor.editable, props, variantDefaults: Object.fromEntries(Object.entries(presets[id]?.variants || {}).map(([variant, values]) => [variant, Object.fromEntries(Object.entries(values as Record<string, unknown>).filter(([name]) => props[name] && (props[name].type === "boolean" || props[name].type === "enum")))])), defaults: Object.fromEntries(Object.entries(props).filter(([, rule]) => "default" in rule).map(([name, rule]) => [name, rule.default])) };
    const builder = contract?.components[id];
    if (builder) Object.assign(output[id], { builder, label: builder.label ?? editor.label, description: builder.description ?? editor.description, editable: Object.keys(props) });
  }
  return output;
}
