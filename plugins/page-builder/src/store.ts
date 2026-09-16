import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyOperations, createPage, DomainError, findNode, type Operation, type PageSchema, validatePage } from "./domain.js";

export interface Persistence { list(): Promise<PageSchema[]>; save(page: PageSchema): Promise<void>; }

export class FilePersistence implements Persistence {
  constructor(private directory: string) {}
  private file(pageId: string) { if (!/^[A-Za-z0-9_-]+$/.test(pageId)) throw new DomainError("INVALID_PAGE_ID", "页面标识无效。"); return path.join(this.directory, `${pageId}.json`); }
  async list() {
    await mkdir(this.directory, { recursive: true });
    const names = (await readdir(this.directory)).filter((name) => name.endsWith(".json"));
    const pages: PageSchema[] = [];
    for (const name of names) { try { pages.push(validatePage(JSON.parse(await readFile(path.join(this.directory, name), "utf8")))); } catch { /* Preserve unreadable files for recovery; do not overwrite. */ } }
    return pages;
  }
  async save(page: PageSchema) {
    await mkdir(this.directory, { recursive: true });
    const target = this.file(page.pageId); const temporary = `${target}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(page, null, 2), { encoding: "utf8", mode: 0o600 });
    await rename(temporary, target);
  }
}

type History = { past: PageSchema[]; future: PageSchema[] };
export class PageStore {
  private pages = new Map<string, PageSchema>(); private histories = new Map<string, History>(); private selections = new Map<string, string | null>();
  constructor(private persistence: Persistence) {}
  async load() { for (const page of await this.persistence.list()) this.pages.set(page.pageId, page); }
  list() { return [...this.pages.values()].map((page) => ({ pageId: page.pageId, name: page.name, revision: page.revision, updatedAt: page.updatedAt })); }
  get(pageId: string) { const page = this.pages.get(pageId); if (!page) throw new DomainError("PAGE_NOT_FOUND", `找不到页面 ${pageId}。`); return structuredClone(page); }
  async create(name?: string) { const page = createPage(name); await this.persistence.save(page); this.pages.set(page.pageId, page); this.histories.set(page.pageId, { past: [], future: [] }); return this.get(page.pageId); }
  async apply(pageId: string, expectedRevision: number, operations: Operation[]) {
    const current = this.get(pageId); const next = applyOperations(current, expectedRevision, operations); await this.persistence.save(next);
    const history = this.histories.get(pageId) ?? { past: [], future: [] }; history.past.push(current); if (history.past.length > 100) history.past.shift(); history.future = [];
    this.histories.set(pageId, history); this.pages.set(pageId, next); return this.get(pageId);
  }
  async undo(pageId: string, expectedRevision: number) { return this.restore(pageId, expectedRevision, "undo"); }
  async redo(pageId: string, expectedRevision: number) { return this.restore(pageId, expectedRevision, "redo"); }
  private async restore(pageId: string, expectedRevision: number, direction: "undo" | "redo") {
    const current = this.get(pageId); if (current.revision !== expectedRevision) throw new DomainError("REVISION_CONFLICT", `页面已更新到 revision ${current.revision}。`, { currentRevision: current.revision });
    const history = this.histories.get(pageId) ?? { past: [], future: [] }; const source = direction === "undo" ? history.past : history.future; const target = source.pop();
    if (!target) throw new DomainError(direction === "undo" ? "NOTHING_TO_UNDO" : "NOTHING_TO_REDO", direction === "undo" ? "没有可撤销的操作。" : "没有可重做的操作。");
    const restored = { ...structuredClone(target), revision: current.revision + 1, updatedAt: new Date().toISOString() };
    await this.persistence.save(restored); (direction === "undo" ? history.future : history.past).push(current); this.histories.set(pageId, history); this.pages.set(pageId, restored); return this.get(pageId);
  }
  select(pageId: string, nodeId: string | null) { const page = this.get(pageId); if (nodeId && !findNode(page.root, nodeId)) throw new DomainError("NODE_NOT_FOUND", `找不到节点 ${nodeId}。`); this.selections.set(pageId, nodeId); return { pageId, nodeId, revision: page.revision }; }
  selection(pageId: string) { const page = this.get(pageId); return { pageId, nodeId: this.selections.get(pageId) ?? null, revision: page.revision }; }
  async import(input: unknown) { const candidate = validatePage(structuredClone(input) as PageSchema); const page = { ...candidate, pageId: createPage().pageId, name: `${candidate.name}（导入）`, revision: 0, updatedAt: new Date().toISOString() }; await this.persistence.save(page); this.pages.set(page.pageId, page); return this.get(page.pageId); }
}
