import test from "node:test";
import assert from "node:assert/strict";
import type { PageSchema } from "../src/domain.js";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { FilePersistence, PageStore, type Persistence, type StoredHistory, type StoredSelection } from "../src/store.js";

class MemoryPersistence implements Persistence {
  pages = new Map<string, PageSchema>(); histories = new Map<string, StoredHistory>(); selections = new Map<string, StoredSelection>(); fail = false;
  key(pageId: string, revision: number) { return `${pageId}:${revision}`; }
  async list(): Promise<PageSchema[]> { return [...this.pages.values()].map((page) => structuredClone(page)); }
  async read(pageId: string) { const page = this.pages.get(pageId); return page ? structuredClone(page) : null; }
  async save(page: PageSchema) { if (this.fail) throw new Error("disk full"); this.pages.set(page.pageId, structuredClone(page)); }
  async withPageLock<T>(_pageId: string, task: () => Promise<T>) { return task(); }
  async readHistory(pageId: string, revision: number) { const value = this.histories.get(this.key(pageId, revision)); return value ? structuredClone(value) : null; }
  async saveHistory(pageId: string, history: StoredHistory) { this.histories.set(this.key(pageId, history.headRevision), structuredClone(history)); }
  async readSelection(pageId: string, revision: number) { const value = this.selections.get(this.key(pageId, revision)); return value ? structuredClone(value) : null; }
  async saveSelection(pageId: string, selection: StoredSelection) { this.selections.set(this.key(pageId, selection.revision), structuredClone(selection)); }
}

test("save failure does not mutate committed page", async () => {
  const persistence = new MemoryPersistence(); const store = new PageStore(persistence); const page = await store.create("可靠保存"); persistence.fail = true;
  await assert.rejects(store.apply(page.pageId, 0, [{ type: "rename", name: "不应提交" }]), /disk full/);
  assert.equal((await store.get(page.pageId)).name, "可靠保存"); assert.equal((await store.get(page.pageId)).revision, 0);
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
  assert.equal((await second.get(a.pageId)).name, "A2"); assert.equal((await second.get(b.pageId)).name, "B"); assert.notEqual(a.pageId, b.pageId);
});

test("invalid import cannot overwrite an existing page", async () => {
  const persistence = new MemoryPersistence(); const store = new PageStore(persistence); const page = await store.create("保留页面");
  await assert.rejects(store.import({ ...page, schemaVersion: 999 }), /页面描述版本或标识无效/);
  assert.equal((await store.get(page.pageId)).name, "保留页面"); assert.equal((await store.get(page.pageId)).revision, 0);
});

test("failed page write preserves prior history and selection revision", async () => {
  const persistence = new MemoryPersistence(); const store = new PageStore(persistence); const page = await store.create("事务");
  const changed = await store.apply(page.pageId, 0, [{ type: "rename", name: "第一次" }]); await store.select(page.pageId, changed.root.id, changed.revision);
  persistence.fail = true; await assert.rejects(store.apply(page.pageId, 1, [{ type: "rename", name: "不能提交" }]), /disk full/); persistence.fail = false;
  assert.equal((await store.get(page.pageId)).name, "第一次"); assert.equal((await store.selection(page.pageId)).nodeId, changed.root.id);
  const undone = await store.undo(page.pageId, 1); assert.equal(undone.name, "事务"); assert.equal(undone.revision, 2);
});

test("independent stores reload live state and serialize competing writes", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "page-builder-shared-")); const first = new PageStore(new FilePersistence(directory)); const second = new PageStore(new FilePersistence(directory));
  const page = await first.create("共享"); assert.equal((await second.get(page.pageId)).revision, 0);
  const results = await Promise.allSettled([
    first.apply(page.pageId, 0, [{ type: "rename", name: "来自一" }]),
    second.apply(page.pageId, 0, [{ type: "rename", name: "来自二" }])
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1); assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  const latest = await first.get(page.pageId); assert.equal(latest.revision, 1); assert.equal((await second.get(page.pageId)).name, latest.name);
  await first.select(page.pageId, latest.root.id, latest.revision); assert.equal((await second.selection(page.pageId)).nodeId, latest.root.id);
  await assert.rejects(second.apply(page.pageId, 0, [{ type: "rename", name: "过期覆盖" }]), (error: unknown) => (error as { code?: string }).code === "REVISION_CONFLICT");
});
