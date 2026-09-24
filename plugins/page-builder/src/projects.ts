import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";
import { DomainError, type ComponentLibraryBinding, type PageSchema, validatePage } from "./domain.js";
import { FilePersistence, PageStore } from "./store.js";
import { ComponentLibraryManager } from "./library.js";

const MANIFEST = "page-builder.project.json";
type Project = { schemaVersion: 1; projectId: string; name: string; createdAt: string; defaultCanvasId: "main"; componentLibrary: ComponentLibraryBinding; revision?: number; updatedAt?: string; description?: string; starred?: boolean; coverImage?: string | null };
export type ProjectSettings = { name: string; description: string; starred: boolean; coverImage: string | null };
export type Workspace = Project & { workspaceId: string; directory: string };
async function json(file: string) { return JSON.parse(await readFile(file, "utf8")); }
async function atomic(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 }); await rename(temporary, file); }
  finally { await rm(temporary, { force: true }); }
}
function localPath(value: string) {
  const expanded = value?.startsWith("~/") ? path.join(homedir(), value.slice(2)) : value;
  if (!expanded || !path.isAbsolute(expanded)) throw new DomainError("INVALID_PROJECT_PATH", "请输入完整的本地文件夹路径。");
  return path.resolve(expanded);
}
async function readProject(directory: string): Promise<Project> {
  let value;
  try { value = await json(path.join(directory, MANIFEST)); }
  catch { throw new DomainError("INVALID_PROJECT", "这个文件夹没有有效的搭建器项目文件，请选择项目根目录。"); }
  if (value.schemaVersion !== 1 || !/^project-[\w-]+$/.test(value.projectId) || typeof value.name !== "string" || !value.name.trim() || value.name.length > 80 || value.defaultCanvasId !== "main" || !/^b2b-[a-f0-9]{16}$/.test(value.componentLibrary?.snapshotId)) throw new DomainError("INVALID_PROJECT", "项目格式无效或版本不受支持。");
  validateSettings({ name: value.name, description: value.description ?? "", starred: value.starred ?? false, coverImage: value.coverImage ?? null });
  if (value.revision !== undefined && (!Number.isSafeInteger(value.revision) || value.revision < 0)) throw new DomainError("INVALID_PROJECT", "项目版本无效。");
  return value;
}

function validateSettings(value: ProjectSettings) {
  if (typeof value.name !== "string" || !value.name.trim() || value.name.trim().length > 80 || /[\x00-\x1f]/.test(value.name)) throw new DomainError("INVALID_PROJECT_NAME", "项目名称请填写 1–80 个字符。");
  if (typeof value.description !== "string" || value.description.length > 240 || typeof value.starred !== "boolean") throw new DomainError("INVALID_PROJECT_SETTINGS", "项目说明最多 240 个字符，收藏状态必须为布尔值。");
  if (value.coverImage !== null && (typeof value.coverImage !== "string" || value.coverImage.length > 1_400_000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value.coverImage))) throw new DomainError("INVALID_PROJECT_COVER", "封面请使用 1 MB 以内的 PNG、JPEG 或 WebP 图片。");
}

async function validateLocalDirectories(directory: string) {
  for (const relative of [".page-builder", ".page-builder/pages", ".page-builder/libraries", ".page-builder/local"]) {
    try {
      const resolved = await realpath(path.join(directory, relative));
      if (!resolved.startsWith(`${directory}${path.sep}`)) throw new DomainError("INVALID_PROJECT_PATH", "项目数据目录不能指向项目外的文件夹。");
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
}

// Page JSON is the authoritative membership list of the default canvas. No second
// list of page references can be left half-written when a page is created.
class ProjectPersistence extends FilePersistence {
  constructor(private projectDirectory: string, private libraries: ComponentLibraryManager) {
    super(path.join(projectDirectory, ".page-builder/pages"), path.join(projectDirectory, ".page-builder/local"));
  }
  override async save(page: PageSchema) {
    const binding = page.componentLibrary;
    if (!binding) throw new DomainError("PROJECT_LIBRARY_REQUIRED", "项目页面必须绑定组件库版本。");
    await this.libraries.exportSnapshot(binding.snapshotId, path.join(this.projectDirectory, ".page-builder/libraries"));
    await super.save(page);
  }
}

export class ProjectManager {
  constructor(private registryDirectory: string, private legacy: PageStore, private libraries: ComponentLibraryManager, readonly defaultDirectory = path.join(homedir(), "Documents", "Page Builder Projects")) {}
  private entry(id: string) {
    if (!/^workspace-[a-f0-9]{32}$/.test(id)) throw new DomainError("INVALID_WORKSPACE", "项目工作区标识无效。");
    return path.join(this.registryDirectory, `${id}.json`);
  }
  private makeStore(workspace: Workspace) { return new PageStore(new ProjectPersistence(workspace.directory, this.libraries), () => this.libraries.binding(workspace.componentLibrary.snapshotId), this.libraries); }
  async resolve(workspaceId: string): Promise<Workspace> {
    let entry;
    try { entry = await json(this.entry(workspaceId)); }
    catch (error) { if (error instanceof DomainError) throw error; throw new DomainError("WORKSPACE_NOT_FOUND", "项目未打开或已经移动，请重新打开项目文件夹。"); }
    const directory = await realpath(localPath(entry.directory)).catch(() => { throw new DomainError("WORKSPACE_NOT_FOUND", "项目文件夹已移动或不可访问，请重新打开。"); });
    const project = await readProject(directory);
    await validateLocalDirectories(directory);
    if (project.projectId !== entry.projectId || this.id(directory) !== workspaceId) throw new DomainError("WORKSPACE_CHANGED", "项目目录内容已替换，请重新打开项目。");
    return { ...project, workspaceId, directory };
  }
  async store(workspaceId?: string) { return workspaceId ? this.makeStore(await this.resolve(workspaceId)) : this.legacy; }
  private id(directory: string) { return `workspace-${createHash("sha256").update(directory).digest("hex").slice(0, 32)}`; }
  async list() {
    await mkdir(this.registryDirectory, { recursive: true });
    const projects = [];
    for (const file of await readdir(this.registryDirectory)) if (/^workspace-[a-f0-9]{32}\.json$/.test(file)) {
      try { const entry = await json(path.join(this.registryDirectory, file)); const project = await this.resolve(file.slice(0, -5)); const pages = await this.makeStore(project).list(); projects.push({ ...project, pageCount: pages.length, lastOpenedAt: entry.lastOpenedAt, updatedAt: [project.updatedAt || project.createdAt, ...pages.map(page => page.updatedAt)].sort().at(-1), available: true }); }
      catch {
        // Keep missing projects visible so their own settings can repair the path.
        try {
          const entry = await json(path.join(this.registryDirectory, file));
          if (!/^project-[\w-]+$/.test(entry.projectId) || typeof entry.directory !== "string" || typeof entry.lastOpenedAt !== "string") continue;
          projects.push({ workspaceId: file.slice(0, -5), projectId: entry.projectId, directory: entry.directory, name: entry.name || path.basename(entry.directory), description: "文件夹已移动或暂时无法读取，请在项目设置中重新关联路径。", lastOpenedAt: entry.lastOpenedAt, updatedAt: entry.lastOpenedAt, available: false, pageCount: null });
        } catch { /* A corrupt registry entry is not a project and is not rewritten. */ }
      }
    }
    return { projects: projects.sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt)), defaultDirectory: this.defaultDirectory };
  }
  async update(workspaceId: string, expectedRevision: number, settings: ProjectSettings) {
    validateSettings(settings);
    const workspace = await this.resolve(workspaceId);
    const persistence = new FilePersistence(path.join(workspace.directory, ".page-builder/pages"), path.join(workspace.directory, ".page-builder/local"));
    return persistence.withPageLock("project-settings", async () => {
      const latest = await this.resolve(workspaceId);
      if ((latest.revision ?? 0) !== expectedRevision) throw new DomainError("PROJECT_REVISION_CONFLICT", "项目设置已在其他窗口更新，请重新打开设置后再保存。");
      const { workspaceId: _id, directory: _directory, ...manifest } = latest;
      const next = { ...manifest, description: settings.description, starred: settings.starred, coverImage: settings.coverImage, name: settings.name.trim(), revision: (latest.revision ?? 0) + 1, updatedAt: new Date().toISOString() };
      await atomic(path.join(latest.directory, MANIFEST), next);
      return { project: { ...next, workspaceId, directory: latest.directory } };
    });
  }
  async relink(workspaceId: string, directory: string) {
    const entry = await json(this.entry(workspaceId));
    if (!/^project-[\w-]+$/.test(entry.projectId)) throw new DomainError("INVALID_PROJECT", "登记的项目身份无效，请重新打开项目。");
    const opened = await this.open(directory, entry.projectId);
    // Forget only an inaccessible old shortcut, never delete or move user files.
    if (opened.project.workspaceId !== workspaceId) {
      const missing = await realpath(localPath(entry.directory)).then(() => false, error => { if (error.code === "ENOENT") return true; throw error; });
      if (missing) await rm(this.entry(workspaceId), { force: true });
    }
    return opened;
  }
  async open(directoryInput: string, expectedProjectId?: string) {
    const directory = await realpath(localPath(directoryInput)).catch(() => { throw new DomainError("PROJECT_NOT_FOUND", "找不到这个本地文件夹。"); });
    const project = await readProject(directory);
    if (expectedProjectId && project.projectId !== expectedProjectId) throw new DomainError("PROJECT_ID_MISMATCH", "这个路径属于另一个项目，原项目关联未改变。请使用打开本地项目。");
    await validateLocalDirectories(directory);
    const pagesDirectory = path.join(directory, ".page-builder/pages");
    const files = await readdir(pagesDirectory).catch(() => { throw new DomainError("INVALID_PROJECT", "项目缺少页面目录。"); });
    // Reject malformed pages instead of silently hiding them as the legacy list does.
    const bindings = new Map([[project.componentLibrary.snapshotId, project.componentLibrary]]);
    for (const file of files.filter(file => file.endsWith(".json"))) {
      const page = validatePage(await json(path.join(pagesDirectory, file)), null);
      if (file !== `${page.pageId}.json` || !page.componentLibrary) throw new DomainError("INVALID_PROJECT", "项目页面文件名或组件库绑定无效。");
      bindings.set(page.componentLibrary.snapshotId, page.componentLibrary);
    }
    for (const binding of bindings.values()) await this.libraries.importSnapshot(path.join(directory, ".page-builder/libraries", binding.snapshotId), binding);
    const workspace = { ...project, directory, workspaceId: this.id(directory) };
    await atomic(this.entry(workspace.workspaceId), { directory, projectId: project.projectId, name: project.name, lastOpenedAt: new Date().toISOString() });
    return { project: workspace, pages: await this.makeStore(workspace).list() };
  }
  async create(nameInput: string, parentInput?: string) {
    const name = nameInput?.trim();
    if (!name || name.length > 80 || /[\\/:*?"<>|\x00-\x1f]/.test(name) || name === "." || name === ".." || name.endsWith(".")) throw new DomainError("INVALID_PROJECT_NAME", "项目名称请填写 1–80 个字符，不能包含路径分隔符或文件名特殊字符。");
    const parent = localPath(parentInput || this.defaultDirectory);
    await mkdir(parent, { recursive: true });
    const canonicalParent = await realpath(parent), directory = path.join(canonicalParent, name);
    try { await mkdir(directory); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new DomainError("PROJECT_EXISTS", "同名文件夹已存在，请更换名称；已有项目请使用打开项目。"); throw error; }
    let published = false;
    try {
      const project: Project = { schemaVersion: 1, projectId: `project-${randomUUID()}`, name, createdAt: new Date().toISOString(), defaultCanvasId: "main", componentLibrary: await this.libraries.binding() };
      const workspace = { ...project, directory, workspaceId: this.id(directory) };
      const page = await this.makeStore(workspace).create("首页");
      await atomic(path.join(directory, ".page-builder/canvases/main.json"), { schemaVersion: 1, canvasId: "main", name: "项目画布", pageSource: "../pages", placements: {} });
      await writeFile(path.join(directory, ".page-builder/.gitignore"), "local/\n*.tmp\n");
      await atomic(path.join(directory, MANIFEST), project); published = true;
      await atomic(this.entry(workspace.workspaceId), { directory, projectId: project.projectId, name: project.name, lastOpenedAt: new Date().toISOString() });
      return { project: workspace, page, pages: await this.makeStore(workspace).list() };
    } catch (error) { if (!published) await rm(directory, { recursive: true, force: true }); throw error; }
  }
}
