import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { unzipSync, strFromU8 } from "fflate";
import { applyOperations, createPage } from "../src/domain.js";
import { exportPage } from "../src/exporter.js";

test("export contains a portable runtime closure and importable page schema", async () => {
  const output = await mkdtemp(path.join(tmpdir(), "page-builder-export-test-")); const original = createPage("可移植页面");
  const page = applyOperations(original, 0, [{ type: "add", parentId: original.root.id, node: { kind: "component", componentId: "C-02", props: { label: "导出按钮" } } }]);
  const result = await exportPage(page, path.resolve("dist/ui"), output); const files = unzipSync(new Uint8Array(await readFile(result.zipPath)));
  for (const required of ["index.html", "app.js", "business.js", "page.json", "vendor/b2b/components/runtime/loader.js", "vendor/b2b/components/C-02-basic-button/renderer.js", "vendor/b2b/foundations/tokens.css"]) assert.ok(files[required], `missing ${required}`);
  const allText = ["index.html", "app.js", "business.js", "page.json", "README.md"].map((name) => strFromU8(files[name])).join("\n");
  assert.doesNotMatch(allText, /\/Users\/wangkewei|Desktop\/ai-design-system/);
  assert.deepEqual(JSON.parse(strFromU8(files["page.json"])), page);
});

