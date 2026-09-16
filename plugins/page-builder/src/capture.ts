import { access, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { DomainError, type PageSchema } from "./domain.js";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
].filter(Boolean) as string[];

async function findChrome() {
  for (const candidate of CANDIDATES) { try { await access(candidate); return candidate; } catch { /* Try the next known executable. */ } }
  throw new DomainError("CAPTURE_UNAVAILABLE", "当前环境没有可用的 Chrome/Chromium，无法生成实际画面。");
}

async function runUntilScreenshot(command: string, args: string[], screenshot: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] }); let stderr = ""; let settled = false;
    child.stderr.on("data", (chunk) => { if (stderr.length < 20_000) stderr += chunk.toString(); });
    const finish = (error?: Error) => { if (settled) return; settled = true; clearInterval(poll); clearTimeout(timeout); if (child.exitCode === null) child.kill("SIGKILL"); error ? reject(error) : resolve(); };
    child.once("error", finish); child.once("exit", (code) => { if (!settled) finish(new Error(`Chrome exited ${code}: ${stderr}`)); });
    const poll = setInterval(async () => { try { if ((await stat(screenshot)).size > 100) finish(); } catch { /* Screenshot is not complete yet. */ } }, 100);
    const timeout = setTimeout(() => finish(new Error(`Chrome screenshot timed out: ${stderr}`)), 20_000);
  });
}

export async function capturePage(page: PageSchema, editorUrl: string, viewport: "desktop" | "narrow") {
  const chrome = await findChrome(); const dimensions = viewport === "narrow" ? { width: 680, height: 900 } : { width: 1440, height: 900 };
  const directory = await mkdtemp(path.join(tmpdir(), "page-builder-capture-")); const screenshot = path.join(directory, "page.png"); const profile = path.join(directory, "profile");
  try {
    const url = new URL(editorUrl); url.searchParams.set("page", page.pageId); url.searchParams.set("captureRevision", String(page.revision));
    await runUntilScreenshot(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--disable-extensions", `--user-data-dir=${profile}`, `--window-size=${dimensions.width},${dimensions.height}`, "--force-device-scale-factor=1", "--virtual-time-budget=5000", `--screenshot=${screenshot}`, url.href], screenshot);
    return { png: await readFile(screenshot), viewport, dimensions, pageId: page.pageId, revision: page.revision };
  } catch (error) {
    throw new DomainError("CAPTURE_FAILED", error instanceof Error ? error.message : "画面生成失败。");
  } finally { await rm(directory, { recursive: true, force: true }); }
}
