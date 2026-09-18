import type { ComponentLibraryManager } from "./library.js";
import { DomainError } from "./domain.js";
import type { PageStore } from "./store.js";
export async function refreshLibrary(libraries: ComponentLibraryManager, store: PageStore, input: { pageId: string; expectedRevision: number; sourcePath?: string }) {
  const checked = await libraries.check(input.sourcePath);
  const before = await store.get(input.pageId);
  if (before.revision !== input.expectedRevision) throw new DomainError("REVISION_CONFLICT", "页面已被修改，请刷新后重试。");
  const page = before.componentLibrary?.snapshotId === checked.candidate.snapshotId ? before : await store.setLibrary(input.pageId, input.expectedRevision, await libraries.binding(checked.candidate.snapshotId));
  await libraries.apply(checked.candidate.snapshotId, input.sourcePath);
  return { page, library: checked.candidate, components: Object.values(await libraries.catalog(checked.candidate.snapshotId)), changed: page.revision !== before.revision };
}
