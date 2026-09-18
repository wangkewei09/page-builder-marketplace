import { readLibraryCatalog } from "./library-schema.js";
import { FilePersistence } from "./store.js";
import { RendererValidator } from "./renderer-validation.js";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { COMPONENTS, type ComponentDefinition } from "./catalog.js";
import { DomainError, type ComponentLibraryBinding, type PageSchema } from "./domain.js";

export type LibraryManifest = ComponentLibraryBinding & {
  createdAt: string;
  sourceKind: "bundled" | "local";
  sourcePath: string;
  files: string[];
  aliases: string[];
};

type LibrarySettings = { currentSnapshotId: string; sourcePath?: string; legacyBindings?: Record<string, string>; autoRefreshPageIds?: string[] };

const EDITOR_COMPONENTS: Array<{ component: string; requiredProps: string[]; props: Record<string, unknown> }> = [
  { component: "C-02", requiredProps: ["label", "variant", "size", "icon", "disabled", "loading", "width"], props: { label: "保存", variant: "primary", size: "medium", icon: "save", disabled: false, loading: false, width: "default" } },
  { component: "C-04", requiredProps: ["icon", "label", "size", "variant", "disabled", "tooltip", "items"], props: { icon: "add", label: "添加", size: 24, variant: "Button_Icon", disabled: false, tooltip: true, items: [] } },
  { component: "C-11", requiredProps: ["variant", "label", "checked", "disabled"], props: { variant: "standalone", label: "禁用", value: "disabled", description: null, selectAllLabel: "全选", items: [], checked: false, mixed: false, disabled: false, error: false, errorMessage: null, orientation: "vertical", compact: true } },
  { component: "C-21", requiredProps: ["variant", "label", "value", "state"], props: { variant: "基础输入框", size: "medium", state: "default", label: "页面名称", value: "示例页面", placeholder: "请输入页面名称", clearable: false, counter: false, maxLength: 2000, borderless: false, password: false, prefixIcon: null, suffixIcon: null, infoTooltip: null, min: 0, max: 999, step: 1, prefixAddon: null, suffixAddon: null, tag: null, composite: null, auto: false } },
  { component: "C-23", requiredProps: ["variant", "items", "selected", "multiple", "state"], props: { variant: "基础单选", items: ["small", "medium"], selected: ["medium"], multiple: false, open: false, placeholder: "请选择", clearable: false, searchable: false, creatable: false, query: "", size: "medium", state: "default", position: "bottom-left" } },
  { component: "C-41", requiredProps: ["variant", "items", "activeId", "ariaLabel"], props: { variant: "line", size: "medium", items: [{ id: "one", label: "组件", content: "内容", disabled: false, badge: null, closable: false }], panelContainer: null, activeId: "one", ariaLabel: "编辑器页签", activation: "automatic", addable: false, scrollable: false, overflowItems: [] } },
  { component: "C-42", requiredProps: ["variant", "type", "text"], props: { variant: "status", type: "status", size: "small", color: "green", text: "已保存", icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: false, bordered: false, solid: false, disabled: false } },
  { component: "C-49", requiredProps: ["variant", "text", "closable"], props: { variant: "success", title: "", text: "操作成功", action: null, closable: false, actionLayout: "inline", alignment: "start", icon: null } }
];

async function filesUnder(directory: string, prefix = ""): Promise<string[]> {
  const output: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) output.push(...await filesUnder(path.join(directory, entry.name), relative));
    else if (entry.isFile()) output.push(relative);
  }
  return output.sort();
}

async function atomicJson(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true }); const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 }); await rename(temporary, file);
}

function safeRelative(relative: string) {
  if (!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes("..")) throw new DomainError("INVALID_LIBRARY_PATH", "组件库资源路径无效。");
  return relative.replaceAll("\\", "/");
}

export class ComponentLibraryManager {
  private snapshotsDirectory: string;
  private settingsFile: string;
  private validator: RendererValidator;
  private settingsLock: FilePersistence;
  private checked = new Set<string>();
  private catalogs = new Map<string, Record<string, ComponentDefinition>>();

  constructor(private cacheDirectory: string, private baselineDirectory: string) {
    this.settingsLock = new FilePersistence(cacheDirectory);
    this.snapshotsDirectory = path.join(cacheDirectory, "snapshots"); this.settingsFile = path.join(cacheDirectory, "settings.json");
    this.validator = new RendererValidator(path.join(cacheDirectory, "validation"), path.resolve(baselineDirectory, "../../library-transport.bundle.js"));
  }

  async initialize() {
    await mkdir(this.snapshotsDirectory, { recursive: true });
    const before = await this.list();
    const bundled = await this.createSnapshot(this.baselineDirectory, "bundled", ["b2b-3.4.7"]);
    await this.settingsLock.withPageLock("library-settings", async () => {
      const previous = await this.readSettings(); const legacyBindings = { ...previous?.legacyBindings };
      // Retire persisted automatic library updates; updates are now explicitly user-triggered.
      if (previous) delete previous.autoRefreshPageIds;
      for (const manifest of before.snapshots) for (const alias of manifest.aliases) legacyBindings[alias] ??= manifest.snapshotId;
      legacyBindings["b2b-3.4.7"] ??= bundled.snapshotId;
      await atomicJson(this.settingsFile, { ...previous, currentSnapshotId: previous && await this.has(previous.currentSnapshotId) ? previous.currentSnapshotId : bundled.snapshotId, legacyBindings });
    });
    return this.current();
  }

  private async readSettings(): Promise<LibrarySettings | null> {
    try { return JSON.parse(await readFile(this.settingsFile, "utf8")) as LibrarySettings; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }

  private snapshotDirectory(snapshotId: string) {
    if (!/^b2b-[a-f0-9]{16}$/.test(snapshotId)) throw new DomainError("INVALID_LIBRARY_ID", "组件库快照标识无效。");
    return path.join(this.snapshotsDirectory, snapshotId);
  }

  private async has(snapshotId: string) { try { return (await stat(path.join(this.snapshotDirectory(snapshotId), "manifest.json"))).isFile(); } catch { return false; } }
  async manifest(snapshotId: string) { try { return JSON.parse(await readFile(path.join(this.snapshotDirectory(snapshotId), "manifest.json"), "utf8")) as LibraryManifest; } catch { throw new DomainError("LIBRARY_NOT_FOUND", `找不到组件库快照 ${snapshotId}。`); } }
  async current() { const settings = await this.readSettings(); if (!settings) throw new DomainError("LIBRARY_NOT_INITIALIZED", "组件库尚未初始化。"); return this.manifest(settings.currentSnapshotId); }
  async list() { const names = await readdir(this.snapshotsDirectory); const manifests: LibraryManifest[] = []; for (const name of names) { if (await this.has(name)) manifests.push(await this.manifest(name)); } const settings = await this.readSettings(); return { currentSnapshotId: settings?.currentSnapshotId ?? null, sourcePath: settings?.sourcePath ?? null, snapshots: manifests.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }; }

  private async createSnapshot(sourceDirectory: string, sourceKind: LibraryManifest["sourceKind"], aliases: string[] = []) {
    const source = path.resolve(sourceDirectory);
    const files = (await filesUnder(source)).filter(file => /^(components|foundations|styles|vendor)\//.test(file) && /\.(js|css|json|woff2?|ttf|png|jpe?g|webp|gif|svg)$/.test(file) || /^icons\/material-symbols\/variablefont\/.*\.woff2$/.test(file));
    const hash = createHash("sha256"), contents = new Map<string, Buffer>();
    for (const relative of files) { const data = await readFile(path.join(source, relative)); contents.set(relative, data); hash.update(relative); hash.update(data); }
    const digest = hash.digest("hex"); const snapshotId = `b2b-${digest.slice(0, 16)}`;
    if (await this.has(snapshotId)) {
      const manifest = await this.manifest(snapshotId);
      if (sourceKind === "local") await this.ensureCompatible(manifest);
      return manifest;
    }
    const temporary = path.join(this.snapshotsDirectory, `.candidate-${randomUUID()}`); await mkdir(temporary, { recursive: true });
    try {
      for (const relative of files) { const target = path.join(temporary, relative); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, contents.get(relative)!); }
      const loader = await readFile(path.join(temporary, "components/runtime/loader.js"), "utf8"); const sourceVersion = loader.match(/sourceVersion\s*=\s*"([^"]+)"/)?.[1] ?? null;
      await this.validateProtocol(temporary); await this.validateRendering(temporary, files);
      const manifest: LibraryManifest = { libraryId: "b2b", snapshotId, sourceVersion, digest, adapterVersion: "page-builder-adapter-v2", createdAt: new Date().toISOString(), sourceKind, sourcePath: sourceKind === "bundled" ? "bundled://page-builder" : source, files: files, aliases };
      await writeFile(path.join(temporary, "manifest.json"), JSON.stringify(manifest, null, 2)); try { await rename(temporary, this.snapshotDirectory(snapshotId)); }
      catch (error) { if (!["EEXIST", "ENOTEMPTY"].includes((error as NodeJS.ErrnoException).code || "") || !(await this.has(snapshotId))) throw error; await rm(temporary, { recursive: true, force: true }); }
      this.checked.add(snapshotId); return this.manifest(snapshotId);
    } catch (error) {
      await rm(temporary, { recursive: true, force: true });
      if (error instanceof DomainError) throw error;
      throw new DomainError("LIBRARY_INVALID_SOURCE", `组件库资源或公开协议无效：${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    }
  }

  private async validateProtocol(directory: string) {
    const context = { window: { B2B: { components: {} } } } as { window: { B2B: { components: { apiSchemas?: Record<string, { props?: Record<string, { values?: unknown[] }> }> } } } };
    vm.runInNewContext(await readFile(path.join(directory, "components/runtime/api-schema.js"), "utf8"), context, { timeout: 1000 });
    const schemas = context.window.B2B.components.apiSchemas ?? {};
    for (const id of Object.keys(COMPONENTS)) if (!schemas[id]?.props) throw new DomainError("INCOMPATIBLE_LIBRARY", `${id} 缺少公开 props 协议。`);
    for (const editor of EDITOR_COMPONENTS) {
      const schema = schemas[editor.component]; if (!schema?.props) throw new DomainError("INCOMPATIBLE_LIBRARY", `${editor.component} 缺少编辑器公开协议。`);
      for (const prop of editor.requiredProps) if (!schema.props[prop]) throw new DomainError("INCOMPATIBLE_LIBRARY", `${editor.component}.${prop} 已从编辑器协议移除。`);
    }
  }

  private async validateRendering(directory: string, files: string[]) {
    const catalog = await readLibraryCatalog(directory);
    const requests = [...Object.values(catalog).map(item => ({ component: item.id, props: item.defaults })), ...EDITOR_COMPONENTS.map(({ component, props }) => ({ component, props }))];
    try { await this.validator.check(directory, requests, files); }
    catch (error) { throw new DomainError("LIBRARY_RENDER_FAILED", error instanceof Error ? error.message.split("\n")[0].replace(/^page\.evaluate: (Error: )?/, "") : String(error)); }
  }

  private async ensureCompatible(manifest: LibraryManifest) {
    if (this.checked.has(manifest.snapshotId)) return;
    const directory = this.snapshotDirectory(manifest.snapshotId);
    await this.validateProtocol(directory); await this.validateRendering(directory, manifest.files);
    this.checked.add(manifest.snapshotId);
  }

  async catalog(snapshotId?: string) {
    const id = snapshotId || (await this.current()).snapshotId;
    if (!this.catalogs.has(id)) this.catalogs.set(id, await readLibraryCatalog(this.snapshotDirectory(id)));
    return this.catalogs.get(id)!;
  }
  async catalogForPage(page: PageSchema) { return this.catalog((await this.resolvePage(page)).snapshotId); }
  async validatePage(page: PageSchema) {
    const requests: Array<{ component: string; props: Record<string, unknown> }> = [];
    const visit = (node: PageSchema["root"] | PageSchema["root"]["children"][number]) => { if (node.kind === "layout") node.children.forEach(visit); else requests.push({ component: node.componentId, props: node.props }); };
    visit(page.root);
    if (requests.length) try { await this.validator.check(await this.directoryForPage(page), requests); }
    catch (error) { throw new DomainError("INVALID_PROP_COMBINATION", error instanceof Error ? error.message.split("\n")[0].replace(/^page\.evaluate: (Error: )?/, "") : String(error)); }
  }
  async close() { await this.validator.close(); }

  async check(sourcePath?: string) {
    const settings = await this.readSettings(); const source = sourcePath || settings?.sourcePath;
    if (!source) throw new DomainError("LIBRARY_SOURCE_REQUIRED", "尚未配置组件库来源，请提供 design-source 目录路径。");
    const candidate = await this.createSnapshot(source, "local"); const current = await this.current(); return { current, candidate, updateAvailable: current.snapshotId !== candidate.snapshotId };
  }

  async apply(snapshotId: string, sourcePath?: string) {
    const manifest = await this.manifest(snapshotId); await this.ensureCompatible(manifest);
    return this.settingsLock.withPageLock("library-settings", async () => {
      const previous = await this.current(); const settings = await this.readSettings();
      await atomicJson(this.settingsFile, { ...settings, currentSnapshotId: snapshotId, sourcePath: sourcePath || (manifest.sourceKind === "local" ? manifest.sourcePath : settings?.sourcePath) }); return { previous, current: manifest };
    });
  }

  async binding(snapshotId?: string): Promise<ComponentLibraryBinding> {
    const manifest = snapshotId ? await this.manifest(snapshotId) : await this.current();
    return { libraryId: manifest.libraryId, snapshotId: manifest.snapshotId, sourceVersion: manifest.sourceVersion, digest: manifest.digest, adapterVersion: manifest.adapterVersion };
  }

  async resolvePage(page: PageSchema) {
    if (page.componentLibrary) return this.manifest(page.componentLibrary.snapshotId);
    const settings = await this.readSettings(); const pinned = settings?.legacyBindings?.[page.componentLibraryVersion];
    if (pinned) return this.manifest(pinned);
    const state = await this.list(); const legacy = state.snapshots.find((item) => item.aliases.includes(page.componentLibraryVersion) || item.sourceVersion === page.componentLibraryVersion);
    if (!legacy) throw new DomainError("PAGE_LIBRARY_MISSING", `页面绑定的组件库 ${page.componentLibraryVersion} 不在本机快照中。`);
    return legacy;
  }

  async directoryForPage(page: PageSchema) { return this.snapshotDirectory((await this.resolvePage(page)).snapshotId); }
  async asset(snapshotId: string, relative: string) { const resolved = path.resolve(this.snapshotDirectory(snapshotId), safeRelative(relative)); const root = this.snapshotDirectory(snapshotId); if (!resolved.startsWith(`${root}${path.sep}`)) throw new DomainError("INVALID_LIBRARY_PATH", "组件库资源路径无效。"); return resolved; }
}
