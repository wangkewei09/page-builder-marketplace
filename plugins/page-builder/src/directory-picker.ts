import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { realpath, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { DomainError } from "./domain.js";

export type DirectoryPurpose = "create" | "open" | "relink";
export type DirectoryChoice = { requestId: string; status: "pending" | "selected" | "cancelled" | "failed"; directory?: string; message?: string };
export type DirectoryDialog = (options: { purpose: DirectoryPurpose; initialDirectory: string; signal: AbortSignal }) => Promise<string | null>;
const prompts = { create: "选择项目的保存文件夹", open: "选择要打开的项目文件夹", relink: "选择移动后的项目文件夹" };
const run = promisify(execFile);
// Arguments are data passed to JXA's run(argv), never interpolated into code or a shell.
const MAC_DIALOG = `ObjC.import('AppKit');
function run(argv) {
  const options = JSON.parse(argv[0]);
  const app = $.NSApplication.sharedApplication;
  app.setActivationPolicy($.NSApplicationActivationPolicyAccessory);
  app.activateIgnoringOtherApps(true);
  const panel = $.NSOpenPanel.openPanel;
  panel.title = '页面搭建器';
  panel.message = options.message;
  panel.prompt = '选择文件夹';
  panel.canChooseDirectories = true;
  panel.canChooseFiles = false;
  panel.allowsMultipleSelection = false;
  panel.canCreateDirectories = options.create;
  panel.directoryURL = $.NSURL.fileURLWithPath(options.initialDirectory);
  const result = panel.runModal;
  return JSON.stringify(result === $.NSModalResponseOK ? { directory: ObjC.unwrap(panel.URL.path) } : { directory: null });
}`;

export const nativeDirectoryDialog: DirectoryDialog = async ({ purpose, initialDirectory, signal }) => {
  if (process.platform !== "darwin") throw new Error("当前系统暂不支持文件夹选择，请在 macOS 桌面版中使用。");
  const { stdout } = await run("/usr/bin/osascript", ["-l", "JavaScript", "-e", MAC_DIALOG, JSON.stringify({ message: prompts[purpose], create: purpose === "create", initialDirectory })], { signal, encoding: "utf8", maxBuffer: 64 * 1024 });
  const result = JSON.parse(stdout.trim());
  if (result.directory !== null && typeof result.directory !== "string") throw new Error("系统没有返回有效的文件夹。");
  return result.directory;
};

async function startingDirectory(value?: string) {
  let directory = value?.startsWith("~/") ? path.join(homedir(), value.slice(2)) : value;
  if (!directory || !path.isAbsolute(directory)) return homedir();
  // A new project's default folder or a moved project's old folder may not exist.
  while (true) {
    if (await stat(directory).then(info => info.isDirectory(), () => false)) return directory;
    const parent = path.dirname(directory); if (parent === directory) return homedir(); directory = parent;
  }
}

export class DirectoryPicker {
  private jobs = new Map<string, { result: DirectoryChoice; abort: AbortController }>();
  private active: string | null = null;
  constructor(private dialog: DirectoryDialog = nativeDirectoryDialog, private timeoutMs = 180_000) {}
  start(purpose: DirectoryPurpose, initialDirectory?: string) {
    if (!Object.hasOwn(prompts, purpose)) throw new DomainError("INVALID_DIRECTORY_PURPOSE", "文件夹选择用途无效。");
    if (initialDirectory !== undefined && typeof initialDirectory !== "string") throw new DomainError("INVALID_DIRECTORY", "初始文件夹位置无效。");
    if (this.active) throw new DomainError("DIRECTORY_PICKER_BUSY", "文件夹选择窗口已打开，请先完成或取消选择。");
    if (this.jobs.size >= 16) this.jobs.delete(this.jobs.keys().next().value!);
    const requestId = randomUUID(), abort = new AbortController();
    const job = { result: { requestId, status: "pending" } as DirectoryChoice, abort };
    this.jobs.set(requestId, job); this.active = requestId;
    const timer = setTimeout(() => {
      if (job.result.status === "pending") { job.result = { requestId, status: "failed", message: "文件夹选择已超时，请重新选择。" }; abort.abort(); }
    }, this.timeoutMs); timer.unref();
    void (async () => {
      try {
        const initial = await startingDirectory(initialDirectory);
        if (abort.signal.aborted) return;
        const selected = await this.dialog({ purpose, initialDirectory: initial, signal: abort.signal });
        if (abort.signal.aborted) return;
        if (selected === null) { job.result = { requestId, status: "cancelled" }; return; }
        if (!path.isAbsolute(selected)) throw new Error("系统返回的文件夹位置无效。");
        const directory = await realpath(selected);
        if (!(await stat(directory)).isDirectory()) throw new Error("请选择文件夹，不能选择文件。");
        if (!abort.signal.aborted) job.result = { requestId, status: "selected", directory };
      } catch (error) {
        if (!abort.signal.aborted) job.result = { requestId, status: "failed", message: error instanceof Error ? error.message : "无法打开文件夹选择窗口，请重试。" };
      } finally { clearTimeout(timer); if (this.active === requestId) this.active = null; }
    })();
    return { ...job.result };
  }
  status(requestId: string) {
    const job = this.jobs.get(requestId);
    if (!job) throw new DomainError("DIRECTORY_PICKER_NOT_FOUND", "这次文件夹选择已失效，请重新选择。");
    return { ...job.result };
  }
  cancel(requestId: string) {
    const job = this.jobs.get(requestId);
    if (job?.result.status === "pending") { job.result = { requestId, status: "cancelled" }; job.abort.abort(); }
    return this.status(requestId);
  }
  dispose() { for (const requestId of this.jobs.keys()) this.cancel(requestId); }
}
