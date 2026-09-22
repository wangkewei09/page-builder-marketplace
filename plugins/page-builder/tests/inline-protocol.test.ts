import test from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readLibraryCatalog } from "../src/library-schema.js";
import { parseInlineContract } from "../src/inline-protocol.js";
const catalog = await readLibraryCatalog(path.resolve("vendor/b2b"));
const source = JSON.parse(await readFile("vendor/b2b/components/runtime/inline-editing.json", "utf8"));

test("source-owned anchors are optional, replace compatibility mappings and do not change APIs", async () => {
  parseInlineContract(source, catalog);
  const directory = await mkdtemp(path.join(tmpdir(), "inline-protocol-")); await cp("vendor/b2b", directory, { recursive: true });
  const file = path.join(directory, "components/runtime/inline-editing.json");
  try {
    await rm(file); assert.deepEqual((await readLibraryCatalog(directory))["C-02"].inline, catalog["C-02"].inline);
    await writeFile(file, JSON.stringify({ schemaVersion: 1, libraryId: "b2b", components: {} }));
    const next = await readLibraryCatalog(directory);
    assert.deepEqual(next["C-02"].inline, [], "explicit source omission disables a legacy mapping");
    assert.deepEqual(next["C-02"].props, catalog["C-02"].props);
    assert.deepEqual(next["C-02"].defaults, catalog["C-02"].defaults);
    await writeFile(file, "{"); await assert.rejects(readLibraryCatalog(directory), SyntaxError);
  } finally { await rm(directory, { recursive: true }); }
});
test("anchors reject unsupported versions, schema drift, arbitrary DOM selectors and controls", () => {
  for (const change of [
    (c: any) => c.schemaVersion = 2,
    (c: any) => c.components["C-02"][0].property = "fake",
    (c: any) => c.components["C-02"][0].property = "variant",
    (c: any) => c.components["C-02"][0].control = "number",
    (c: any) => c.components["C-02"][0].html = "<script>",
    (c: any) => c.components["C-02"][0].selector = "body input",
    (c: any) => c.components["C-02"][0].selector = ":scope + button",
    (c: any) => c.components["C-02"][0].selector = ":scope > strong, body",
    (c: any) => c.components["C-02"][0].when = [{ property: "size", values: ["fake"] }],
  ]) {
    const candidate = structuredClone(source); change(candidate);
    assert.throws(() => parseInlineContract(candidate, catalog));
  }
});
