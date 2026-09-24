import type { ComponentLibraryManager } from "./library.js";
import { mkdir, open, readFile, readdir, rename, stat, unlink, writeFile, type FileHandle } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { applyOperations, createPage, DomainError, findNode, type ComponentLibraryBinding, type Operation, type PageSchema, validatePage } from "./domain.js";

export type StoredHistory = { headRevision: number; past: PageSchema[]; future: PageSchema[] };
export type StoredSelection = { revision: number; nodeId: string | null; updatedAt: string };

export interface Persistence {
  list(): Promise<PageSchema[]>;
  read(pageId: string): Promise<PageSchema | null>;
  save(page: PageSchema): Promise<void>;
  withPageLock<T>(pageId: string, task: () => Promise<T>): Promise<T>;
  readHistory(pageId: string, revision: number): Promise<StoredHistory | null>;
  saveHistory(pageId: string, history: StoredHistory): Promise<void>;
  readSelection(pageId: string, revision: number): Promise<StoredSelection | null>;
  saveSelection(pageId: string, selection: StoredSelection): Promise<void>;
}

function pageIdPart(pageId: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(pageId)) throw new DomainError("INVALID_PAGE_ID", "页面标识无效。");
  return pageId;
}

function delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function processIsAlive(pid: number) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; }
  catch (error) { return (error as NodeJS.ErrnoException).code === "EPERM"; }
}

export class FilePersistence implements Persistence {
  private stateDirectory: string;
  private lockDirectory: string;

  constructor(private directory: string, stateDirectory?: string) {
    this.stateDirectory = stateDirectory || path.join(directory, ".page-builder-state");
    this.lockDirectory = path.join(this.stateDirectory, "locks");
  }

  private file(pageId: string) { return path.join(this.directory, `${pageIdPart(pageId)}.json`); }
  private historyFile(pageId: string, revision: number) { return path.join(this.stateDirectory, "history", pageIdPart(pageId), `${revision}.json`); }
  private selectionFile(pageId: string, revision: number) { return path.join(this.stateDirectory, "selection", pageIdPart(pageId), `${revision}.json`); }

  private async readJson<T>(file: string): Promise<T | null> {
    try { return JSON.parse(await readFile(file, "utf8")) as T; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }

  private async saveJson(file: string, value: unknown) {
    await mkdir(path.dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 0o600 });
    await rename(temporary, file);
  }

  async list() {
    await mkdir(this.directory, { recursive: true });
    const names = (await readdir(this.directory)).filter((name) => name.endsWith(".json"));
    const pages: PageSchema[] = [];
    for (const name of names) {
      try { pages.push(validatePage(JSON.parse(await readFile(path.join(this.directory, name), "utf8")), null)); }
      catch { /* Preserve unreadable files for recovery; do not overwrite. */ }
    }
    return pages;
  }

  async read(pageId: string) {
    const value = await this.readJson<PageSchema>(this.file(pageId));
    return value ? validatePage(value, null) : null;
  }

  async save(page: PageSchema) { await this.saveJson(this.file(page.pageId), page); }
  async readHistory(pageId: string, revision: number) { return this.readJson<StoredHistory>(this.historyFile(pageId, revision)); }
  async saveHistory(pageId: string, history: StoredHistory) { await this.saveJson(this.historyFile(pageId, history.headRevision), history); }
  async readSelection(pageId: string, revision: number) { return this.readJson<StoredSelection>(this.selectionFile(pageId, revision)); }
  async saveSelection(pageId: string, selection: StoredSelection) { await this.saveJson(this.selectionFile(pageId, selection.revision), selection); }

  async withPageLock<T>(pageId: string, task: () => Promise<T>): Promise<T> {
    await mkdir(this.lockDirectory, { recursive: true });
    const lock = path.join(this.lockDirectory, `${pageIdPart(pageId)}.lock`);
    const deadline = Date.now() + 10_000;
    const token = randomUUID();
    let handle: FileHandle | undefined;
    while (!handle) {
      try {
        handle = await open(lock, "wx", 0o600);
        await handle.writeFile(JSON.stringify({ token, pid: process.pid, createdAt: new Date().toISOString() }));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        try {
          const info = await stat(lock);
          const owner = JSON.parse(await readFile(lock, "utf8")) as { pid?: number };
          if (Date.now() - info.mtimeMs > 30_000 && !processIsAlive(owner.pid ?? 0)) await unlink(lock);
        }
        catch (inspectionError) { if ((inspectionError as NodeJS.ErrnoException).code !== "ENOENT") throw inspectionError; }
        if (Date.now() >= deadline) throw new DomainError("PAGE_LOCK_TIMEOUT", `页面 ${pageId} 正由另一个进程写入，请重试。`);
        await delay(20);
      }
    }
    try { return await task(); }
    finally {
      await handle.close().catch(() => undefined);
      try {
        const owner = JSON.parse(await readFile(lock, "utf8")) as { token?: string };
        if (owner.token === token) await unlink(lock);
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    }
  }
}

function clone<T>(value: T): T { return structuredClone(value); }

export class PageStore {
  constructor(private persistence: Persistence, private libraryBinding?: () => Promise<ComponentLibraryBinding>, private libraries?: ComponentLibraryManager) {}

  async load() {
    const pages = await this.persistence.list();
    if (this.libraries) for (const page of pages) if (!page.componentLibrary) {
      await this.persistence.withPageLock(page.pageId, async () => {
        const current = await this.current(page.pageId); if (current.componentLibrary) return;
        const binding = await this.libraries!.binding((await this.libraries!.resolvePage(current)).snapshotId);
        // Pin the already-resolved library without changing content, revision, or undo history.
        await this.persistence.save({ ...current, componentLibrary: binding });
      });
    }
  }

  async list() {
    return (await this.persistence.list()).map((page) => ({ pageId: page.pageId, name: page.name, revision: page.revision, updatedAt: page.updatedAt }));
  }

  async get(pageId: string) {
    const page = await this.persistence.read(pageId);
    if (!page) throw new DomainError("PAGE_NOT_FOUND", `找不到页面 ${pageId}。`);
    return clone(page);
  }

  private validHistory(current: PageSchema, history: StoredHistory | null): StoredHistory {
    if (!history || history.headRevision !== current.revision || !Array.isArray(history.past) || !Array.isArray(history.future)) return { headRevision: current.revision, past: [], future: [] };
    return clone(history);
  }

  private validSelection(page: PageSchema, selection: StoredSelection | null): StoredSelection {
    const nodeId = selection?.revision === page.revision && (!selection.nodeId || findNode(page.root, selection.nodeId)) ? selection.nodeId : null;
    return { revision: page.revision, nodeId, updatedAt: selection?.updatedAt ?? page.updatedAt };
  }

  private async current(pageId: string) {
    const page = await this.persistence.read(pageId);
    if (!page) throw new DomainError("PAGE_NOT_FOUND", `找不到页面 ${pageId}。`);
    return page;
  }

  async snapshot(pageId: string) {
    return this.persistence.withPageLock(pageId, async () => {
      const page = await this.current(pageId);
      const selection = this.validSelection(page, await this.persistence.readSelection(pageId, page.revision));
      return { page: clone(page), selection: { pageId, nodeId: selection.nodeId, revision: page.revision } };
    });
  }

  async create(name?: string) {
    const page = createPage(name, this.libraryBinding ? await this.libraryBinding() : undefined);
    return this.persistence.withPageLock(page.pageId, async () => {
      if (await this.persistence.read(page.pageId)) throw new DomainError("PAGE_EXISTS", `页面 ${page.pageId} 已存在。`);
      await this.persistence.saveHistory(page.pageId, { headRevision: page.revision, past: [], future: [] });
      await this.persistence.saveSelection(page.pageId, { revision: page.revision, nodeId: null, updatedAt: page.updatedAt });
      await this.persistence.save(page);
      return clone(page);
    });
  }

  async apply(pageId: string, expectedRevision: number, operations: Operation[]) {
    return this.persistence.withPageLock(pageId, async () => {
      const current = await this.current(pageId);
      const next = applyOperations(current, expectedRevision, operations, this.libraries ? await this.libraries.catalogForPage(current) : undefined);
      await this.libraries?.validatePage(next);
      const history = this.validHistory(current, await this.persistence.readHistory(pageId, current.revision));
      history.past.push(clone(current));
      if (history.past.length > 100) history.past.shift();
      history.future = [];
      history.headRevision = next.revision;
      const priorSelection = this.validSelection(current, await this.persistence.readSelection(pageId, current.revision));
      const nextSelection: StoredSelection = { revision: next.revision, nodeId: priorSelection.nodeId && findNode(next.root, priorSelection.nodeId) ? priorSelection.nodeId : null, updatedAt: next.updatedAt };
      await this.persistence.saveHistory(pageId, history);
      await this.persistence.saveSelection(pageId, nextSelection);
      await this.persistence.save(next);
      return clone(next);
    });
  }

  async undo(pageId: string, expectedRevision: number) { return this.restore(pageId, expectedRevision, "undo"); }
  async redo(pageId: string, expectedRevision: number) { return this.restore(pageId, expectedRevision, "redo"); }

  private async restore(pageId: string, expectedRevision: number, direction: "undo" | "redo") {
    return this.persistence.withPageLock(pageId, async () => {
      const current = await this.current(pageId);
      if (current.revision !== expectedRevision) throw new DomainError("REVISION_CONFLICT", `页面已更新到 revision ${current.revision}。`, { currentRevision: current.revision });
      const history = this.validHistory(current, await this.persistence.readHistory(pageId, current.revision));
      const source = direction === "undo" ? history.past : history.future;
      const target = source.pop();
      if (!target) throw new DomainError(direction === "undo" ? "NOTHING_TO_UNDO" : "NOTHING_TO_REDO", direction === "undo" ? "没有可撤销的操作。" : "没有可重做的操作。");
      const restored = { ...clone(target), componentLibrary: target.componentLibrary || current.componentLibrary, revision: current.revision + 1, updatedAt: new Date().toISOString() };
      await this.libraries?.validatePage(restored);
      (direction === "undo" ? history.future : history.past).push(clone(current));
      history.headRevision = restored.revision;
      const priorSelection = this.validSelection(current, await this.persistence.readSelection(pageId, current.revision));
      const nextSelection: StoredSelection = { revision: restored.revision, nodeId: priorSelection.nodeId && findNode(restored.root, priorSelection.nodeId) ? priorSelection.nodeId : null, updatedAt: restored.updatedAt };
      await this.persistence.saveHistory(pageId, history);
      await this.persistence.saveSelection(pageId, nextSelection);
      await this.persistence.save(restored);
      return clone(restored);
    });
  }

  async select(pageId: string, nodeId: string | null, expectedRevision?: number) {
    return this.persistence.withPageLock(pageId, async () => {
      const page = await this.current(pageId);
      if (expectedRevision !== undefined && page.revision !== expectedRevision) throw new DomainError("REVISION_CONFLICT", `页面已更新到 revision ${page.revision}。`, { currentRevision: page.revision });
      if (nodeId && !findNode(page.root, nodeId)) throw new DomainError("NODE_NOT_FOUND", `找不到节点 ${nodeId}。`);
      await this.persistence.saveSelection(pageId, { revision: page.revision, nodeId, updatedAt: new Date().toISOString() });
      return { pageId, nodeId, revision: page.revision };
    });
  }

  async selection(pageId: string) { return (await this.snapshot(pageId)).selection; }

  async setLibrary(pageId: string, expectedRevision: number, binding: ComponentLibraryBinding) {
    return this.persistence.withPageLock(pageId, async () => {
      const current = await this.current(pageId);
      if (current.revision !== expectedRevision) throw new DomainError("REVISION_CONFLICT", `页面已更新到 revision ${current.revision}。`, { currentRevision: current.revision });
      const next: PageSchema = { ...clone(current), componentLibraryVersion: binding.sourceVersion || binding.digest, componentLibrary: clone(binding), revision: current.revision + 1, updatedAt: new Date().toISOString() };
      validatePage(next, this.libraries ? await this.libraries.catalogForPage(next) : undefined);
      await this.libraries?.validatePage(next);
      const history = this.validHistory(current, await this.persistence.readHistory(pageId, current.revision)); history.past.push(clone(current)); if (history.past.length > 100) history.past.shift(); history.future = []; history.headRevision = next.revision;
      const priorSelection = this.validSelection(current, await this.persistence.readSelection(pageId, current.revision)); const nextSelection: StoredSelection = { revision: next.revision, nodeId: priorSelection.nodeId, updatedAt: next.updatedAt };
      await this.persistence.saveHistory(pageId, history); await this.persistence.saveSelection(pageId, nextSelection); await this.persistence.save(next); return clone(next);
    });
  }

  async import(input: unknown, name?: string) {
    const raw = validatePage(clone(input) as PageSchema, this.libraries ? null : undefined);
    const candidate = validatePage(raw, this.libraries ? await this.libraries.catalogForPage(raw) : undefined);
    await this.libraries?.validatePage(candidate);
    const page = validatePage({ ...candidate, pageId: createPage().pageId, name: name ?? `${candidate.name.slice(0, 76)}（导入）`, revision: 0, updatedAt: new Date().toISOString() }, null);
    return this.persistence.withPageLock(page.pageId, async () => {
      await this.persistence.saveHistory(page.pageId, { headRevision: page.revision, past: [], future: [] });
      await this.persistence.saveSelection(page.pageId, { revision: page.revision, nodeId: null, updatedAt: page.updatedAt });
      await this.persistence.save(page);
      return clone(page);
    });
  }
}
