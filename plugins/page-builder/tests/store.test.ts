import test from "node:test";
import assert from "node:assert/strict";
import type { PageSchema } from "../src/domain.js";
import { PageStore, type Persistence } from "../src/store.js";

class MemoryPersistence implements Persistence {
  pages = new Map<string, PageSchema>(); fail = false;
  async list(): Promise<PageSchema[]> { return [...this.pages.values()].map((page) => structuredClone(page)); }
  async save(page: PageSchema) { if (this.fail) throw new Error("disk full"); this.pages.set(page.pageId, structuredClone(page)); }
}

test("save failure does not mutate committed page", async () => {
  const persistence = new MemoryPersistence(); const store = new PageStore(persistence); const page = await store.create("可靠保存"); persistence.fail = true;
  await assert.rejects(store.apply(page.pageId, 0, [{ type: "rename", name: "不应提交" }]), /disk full/);
  assert.equal(store.get(page.pageId).name, "可靠保存"); assert.equal(store.get(page.pageId).revision, 0);
});

test("undo and redo restore content while revisions advance", async () => {
  const persistence = new MemoryPersistence(); const store = new PageStore(persistence); const page = await store.create("历史");
  const changed = await store.apply(page.pageId, 0, [{ type: "rename", name: "新名称" }]); assert.equal(changed.revision, 1);
  const undone = await store.undo(page.pageId, 1); assert.equal(undone.name, "历史"); assert.equal(undone.revision, 2);
  const redone = await store.redo(page.pageId, 2); assert.equal(redone.name, "新名称"); assert.equal(redone.revision, 3);
});

test("reloading from persistence keeps pages isolated", async () => {
  const persistence = new MemoryPersistence(); const first = new PageStore(persistence); const a = await first.create("A"); const b = await first.create("B");
  await first.apply(a.pageId, 0, [{ type: "rename", name: "A2" }]); const second = new PageStore(persistence); await second.load();
  assert.equal(second.get(a.pageId).name, "A2"); assert.equal(second.get(b.pageId).name, "B"); assert.notEqual(a.pageId, b.pageId);
});

test("invalid import cannot overwrite an existing page", async () => {
  const persistence = new MemoryPersistence(); const store = new PageStore(persistence); const page = await store.create("保留页面");
  await assert.rejects(store.import({ ...page, schemaVersion: 999 }), /页面描述版本或标识无效/);
  assert.equal(store.get(page.pageId).name, "保留页面"); assert.equal(store.get(page.pageId).revision, 0);
});
