import test from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readLibraryCatalog } from "../src/library-schema.js";
import { parseBuilderContract, type BuilderContract } from "../src/builder-protocol.js";
import { contractPatch, editorControl, editorFields, matchesConditions } from "../src/editor-contract.js";
// @ts-expect-error Browser module is plain JavaScript.
import { inspectorOptions } from "../src/ui/inspector-options.js";

const catalog = await readLibraryCatalog(path.resolve("vendor/b2b"));
const contract = (): BuilderContract => ({
  schemaVersion: 1, libraryId: "b2b", components: {
    "C-02": {
      groups: [{ id: "look", label: "外观" }],
      fields: {
        variant: { label: "按钮外观", group: "look", control: "select", order: -1, options: [{ value: "primary", label: "主操作" }] },
        label: { label: "按钮标题", control: "text" }
      }
    }
  }
});

test("metadata changes presentation without overriding source defaults, enums, or render props", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "builder-contract-")); await cp("vendor/b2b", root, { recursive: true });
  const raw = contract(); await writeFile(path.join(root, "components/runtime/builder-contract.json"), JSON.stringify(raw));
  const result = await readLibraryCatalog(root);
  assert.deepEqual(result["C-02"].defaults, catalog["C-02"].defaults);
  assert.deepEqual(result["C-02"].props, catalog["C-02"].props);
  assert.deepEqual(result["C-02"].builder, raw.components["C-02"]);
  assert.equal(result["C-34"].builder, undefined, "omitted components keep legacy compatibility");
  assert.equal(editorFields(result["C-02"].props, result["C-02"].builder?.fields)[0].key, "variant");
  assert.equal(editorFields(result["C-02"].props, result["C-02"].builder?.fields).length, Object.keys(catalog["C-02"].props).length);
  assert.deepEqual(inspectorOptions("C-02", "variant", ["primary", "danger"], raw.components["C-02"].fields!.variant.options), [{ value: "primary", label: "主操作" }, { value: "danger", label: "主要危险按钮" }]);
  await writeFile(path.join(root, "components/runtime/builder-contract.json"), "{");
  await assert.rejects(readLibraryCatalog(root), SyntaxError, "bad JSON must not silently fall back");
});

test("invalid versions, API drift, controls and reserved props are rejected", () => {
  const cases = [
    (c: any) => c.schemaVersion = 2,
    (c: any) => c.components["C-02"].fields.fake = { label: "不存在" },
    (c: any) => c.components["C-02"].fields.variant.options.push({ value: "invented", label: "自创" }),
    (c: any) => c.components["C-02"].fields.label.control = "switch",
    (c: any) => c.components["C-02"].fields.label.default = "不能覆盖",
    (c: any) => c.components["C-02"].fields.label.visibleWhen = [{ property: "size", values: ["invented"] }],
    (c: any) => c.components["C-02"].fields.label.group = "unknown",
    (c: any) => c.components["C-02"].fields.editor = { label: "不能注入插件设置" },
    (c: any) => c.components["C-02"].transitions = [{ property: "disabled", value: true, set: { loading: "wrong" } }]
  ];
  for (const change of cases) { const value = contract(); change(value); assert.throws(() => parseBuilderContract(value, catalog), /编辑协议/); }
  assert.throws(() => parseBuilderContract(JSON.parse('{"schemaVersion":1,"libraryId":"b2b","components":{"__proto__":{}}}'), catalog), /不支持的字段/);
});

test("conditions and declared transitions preserve caller content, use source defaults and reject ambiguous changes", () => {
  const def = structuredClone(catalog["C-42"]);
  def.builder = { transitions: [{ property: "checkable", value: true, reset: ["checked"], set: { closable: false } }, { property: "type", value: "avatar", require: [{ property: "avatar", message: "先填写头像文字" }] }] };
  parseBuilderContract({ schemaVersion: 1, libraryId: "b2b", components: { "C-42": def.builder } }, catalog);
  const original = { ...def.defaults, text: "用户文字", closable: true, checked: true };
  assert.deepEqual(contractPatch(def, original, "checkable", true), { checked: def.props.checked.default, closable: false, checkable: true });
  assert.equal(original.text, "用户文字"); assert.equal(original.closable, true);
  assert.throws(() => contractPatch(def, original, "type", "avatar"), /先填写头像文字/);
  assert.equal(contractPatch(def, original, "variant", "status"), null);
  def.builder.transitions!.push(def.builder.transitions![0]);
  assert.throws(() => contractPatch(def, original, "checkable", true), /多个转换规则/);
  assert.equal(matchesConditions([{ property: "checked", values: [true], not: true }], original), false);
  const fields = editorFields(def.props, { avatar: { visibleWhen: [{ property: "type", values: ["avatar"] }] } }, original);
  assert.ok(!fields.some(item => item.key === "avatar"));
});

test("nested metadata follows both typed object schemas and field-name-only schemas", () => {
  const raw = contract();
  raw.components["C-34"] = { fields: {
    avatar: { control: "structured", fields: { text: { label: "头像文字", control: "auto" } } },
    tabs: { control: "structured", item: { fields: { label: { label: "页签名称" } } } }
  } };
  parseBuilderContract(raw, catalog);
  raw.components["C-34"].fields!.avatar.fields!.unpublished = { label: "未发布" };
  assert.throws(() => parseBuilderContract(raw, catalog), /未声明的组件属性/);
});

test("conditional controls select a valid union branch and fail on ambiguous matches", () => {
  const field = { control: "auto" as const, controlWhen: [{ when: [{ property: "variant", values: ["数字输入框"] }], control: "number" as const }] };
  parseBuilderContract({ schemaVersion: 1, libraryId: "b2b", components: { "C-21": { fields: { value: field } } } }, catalog);
  assert.equal(editorControl(field, { variant: "数字输入框" }), "number");
  assert.equal(editorControl(field, { variant: "基础输入框" }), "auto");
  assert.throws(() => parseBuilderContract({ schemaVersion: 1, libraryId: "b2b", components: { "C-21": { fields: { label: field } } } }, catalog), /控件与源属性类型不匹配/);
  assert.throws(() => editorControl({ ...field, controlWhen: [...field.controlWhen, ...field.controlWhen] }, { variant: "数字输入框" }), /多个控件规则/);
});
