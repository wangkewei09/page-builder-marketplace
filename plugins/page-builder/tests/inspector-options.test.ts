import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Browser module is plain JavaScript.
import { inspectorOptions } from "../src/ui/inspector-options.js";

test("labels preserve source enum identity, order, unknown values and numeric types", () => {
  const options = inspectorOptions("C-34", "variant", ["tabs", "new-source-variant", "basic"]);
  assert.deepEqual(options, [{ value: "tabs", label: "页签卡片" }, { value: "new-source-variant", label: "new-source-variant" }, { value: "basic", label: "基础卡片" }]);
  assert.deepEqual(inspectorOptions("C-34", "columns", [2, 4]), [{ value: 2, label: "2" }, { value: 4, label: "4" }]);
  const collisions = inspectorOptions("C-34", "size", ["small", "小", "小（small）"]);
  assert.equal(new Set(collisions.map((o: any) => o.label)).size, 3);
  assert.deepEqual(collisions.map((o: any) => o.value), ["small", "小", "小（small）"]);
  assert.deepEqual(inspectorOptions("C-42", "activeTabId", ["small"]), [{ value: "small", label: "small" }]);
});
