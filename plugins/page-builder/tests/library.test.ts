import test from "node:test";
import assert from "node:assert/strict";
import { appendFile, cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { ComponentLibraryManager } from "../src/library.js";
import { FilePersistence, PageStore } from "../src/store.js";
import { exportPage } from "../src/exporter.js";

function digest(value: Buffer) { return createHash("sha256").update(value).digest("hex"); }

test("library updates are verified, immutable, page-pinned, rollbackable, and build-independent", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "page-builder-library-"));
  const baseline = path.resolve("dist/ui/vendor/b2b"); const source = path.join(root, "source");
  await cp(baseline, source, { recursive: true });
  const manager = new ComponentLibraryManager(path.join(root, "cache"), baseline); const bundled = await manager.initialize(); t.after(() => manager.close());
  const store = new PageStore(new FilePersistence(path.join(root, "pages")), () => manager.binding(), manager);
  const oldPage = await store.create("旧页面"); assert.equal(oldPage.componentLibrary?.snapshotId, bundled.snapshotId);
  const buildBefore = digest(await readFile("dist/server.js"));

  await appendFile(path.join(source, "foundations/tokens.css"), "\n/* compatible snapshot test */\n");
  const checked = await manager.check(source); assert.equal(checked.updateAvailable, true); assert.notEqual(checked.candidate.snapshotId, bundled.snapshotId);
  await manager.apply(checked.candidate.snapshotId, source);
  const newPage = await store.create("新页面"); assert.equal(newPage.componentLibrary?.snapshotId, checked.candidate.snapshotId);
  assert.equal((await manager.resolvePage(await store.get(oldPage.pageId))).snapshotId, bundled.snapshotId);
  assert.equal(digest(await readFile("dist/server.js")), buildBefore);
  const exported = await exportPage(await store.get(oldPage.pageId), await manager.directoryForPage(oldPage), path.join(root, "exports")); assert.equal(exported.revision, 0);
  const imported = await store.import(oldPage); assert.equal((await manager.resolvePage(imported)).snapshotId, bundled.snapshotId);
  await assert.rejects(manager.resolvePage({ ...oldPage, componentLibrary: { ...oldPage.componentLibrary!, snapshotId: "b2b-0000000000000000", digest: "0".repeat(64) } }), (error: unknown) => (error as { code?: string }).code === "LIBRARY_NOT_FOUND");

  const schemaFile = path.join(source, "components/runtime/api-schema.js"); const schema = await readFile(schemaFile, "utf8");
  await writeFile(schemaFile, schema.replace('"C-02": {', '"C-02X": {'));
  await assert.rejects(manager.check(source), (error: unknown) => (error as { code?: string }).code === "INCOMPATIBLE_LIBRARY");
  assert.equal((await manager.current()).snapshotId, checked.candidate.snapshotId);
  await manager.apply(bundled.snapshotId, source); assert.equal((await manager.current()).snapshotId, bundled.snapshotId);
});
