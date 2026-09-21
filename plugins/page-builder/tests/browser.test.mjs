import { strict as assert } from "node:assert";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const data = await mkdtemp(path.join(tmpdir(), "page-builder-browser-")); const exportsDir = await mkdtemp(path.join(tmpdir(), "page-builder-export-"));
const child = spawn(process.execPath, ["dist/standalone.js"], { cwd: new URL("..", import.meta.url), env: { ...process.env, PAGE_BUILDER_DATA_DIR: data, PAGE_BUILDER_LIBRARY_DIR: path.join(data, "libraries"), PAGE_BUILDER_EXPORT_DIR: exportsDir }, stdio: ["ignore", "pipe", "inherit"] });
const url = await new Promise((resolve, reject) => { let text = ""; child.stdout.on("data", (chunk) => { text += chunk; const match = text.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) resolve(match[0]); }); child.once("exit", (code) => reject(new Error(`server exited ${code}`))); setTimeout(() => reject(new Error("server URL timeout")), 10000); });
const executablePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath, headless: true }); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); }); page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(url, { waitUntil: "networkidle" }); assert.match(await page.title(), /页面搭建器/); await page.getByText("真实 B2B Renderer").waitFor(); await page.getByText("独立浏览器模式 · 未连接 Codex 对话").waitFor();
  assert.equal(await page.locator('[data-ui-renderer-valid="false"]').count(), 0); for (const id of ["page-name", "undo", "redo", "viewport-tabs", "preview", "export", "left-tabs", "component-search", "save-state", "context-status", "sync-context"]) assert.ok(await page.locator(`#${id}[data-ui-renderer-valid="true"]`).count(), `${id} must use a valid Renderer`);
  await page.getByLabel("搜索组件").fill("按钮"); assert.equal(await page.locator("#component-list .library-item").count(), 1); await page.getByLabel("搜索组件").fill("");
  for (const name of ["基础按钮", "输入框", "选择器", "标签", "卡片"]) await page.getByLabel(`添加${name}`).click();
  await page.getByText("卡片已添加").waitFor(); assert.equal(await page.locator('.node-shell[data-renderer-valid="true"]').count(), 5); assert.equal(await page.locator(".render-error").count(), 0);
  await page.locator("#component-list .library-item").first().dragTo(page.locator(".layout-shell.is-root")); await page.getByText("基础按钮已添加").waitFor(); assert.equal(await page.locator('.node-shell[data-renderer-valid="true"]').count(), 6);
  const shell = page.locator('.node-shell[data-renderer-valid="true"]').first(); await shell.click();
  const label = page.locator("#inspector").getByRole("textbox", { name: "文案", exact: true }); await label.fill("提交申请"); await label.press("Tab"); await page.getByText("提交申请", { exact: true }).waitFor();
  const variant = page.locator('.inspector .field').filter({ hasText: "变体" }); await variant.locator("[data-select-trigger]").click(); await variant.getByRole("option", { name: "主要按钮", exact: true }).click(); await page.locator('[data-component-reference="C-02"][data-button-variant="primary"]').first().waitFor();
  await label.focus(); await label.press("Escape"); assert.equal(await page.locator('.node-shell[data-renderer-valid="true"]').count(), 6);
  await page.getByRole("button", { name: "删除节点" }).click(); await page.waitForFunction(() => document.querySelectorAll('.node-shell[data-renderer-valid="true"]').length === 5); await page.getByRole("button", { name: "撤销" }).click(); await page.getByText("提交申请", { exact: true }).waitFor(); await page.getByRole("button", { name: "重做" }).click(); await page.waitForFunction(() => document.querySelectorAll('.node-shell[data-renderer-valid="true"]').length === 5); await page.getByRole("button", { name: "撤销" }).click(); await page.getByText("提交申请", { exact: true }).waitFor();
  await page.getByLabel("添加分栏布局").click(); await page.getByText("分栏布局已添加").waitFor(); const columns = page.locator('.layout-shell.layout-columns').last(); await columns.click(); await page.getByLabel("添加标签").click(); const tag = columns.locator('[data-component-reference="C-42"]'); await tag.waitFor(); await tag.evaluate((element) => element.closest(".node-shell").click()); const typeField = page.getByRole('group', { name: '类型', exact: true }); await typeField.locator("[data-select-trigger]").click(); await typeField.getByRole("option", { name: "头像标签", exact: true }).click(); await page.locator('.canvas [data-component-reference="C-42"][data-contract-type="avatar"]').waitFor(); assert.equal(await page.locator(".render-error").count(), 0);
  const movable = page.locator('.node-shell[data-renderer-valid="true"]').filter({ has: page.locator('[data-component-reference="C-34"]') }); await movable.dragTo(columns); await columns.locator('[data-component-reference="C-34"]').waitFor();
  const revision = await page.locator("#revision-badge").textContent(); assert.notEqual(revision, "Revision 0");
  await page.reload({ waitUntil: "networkidle" }); await page.getByText("提交申请", { exact: true }).waitFor();
  await page.getByRole("button", { name: "预览" }).click(); const selectTrigger = page.locator('.canvas .component-host [data-component-reference="C-23"] [aria-expanded]'); await selectTrigger.click(); assert.equal(await selectTrigger.getAttribute("aria-expanded"), "true"); await page.getByRole("button", { name: "返回编辑" }).click();
  await page.getByRole("tab", { name: "移动" }).click(); assert.match(await page.locator("#canvas-frame").getAttribute("class"), /is-mobile/);
  await page.setViewportSize({ width: 800, height: 800 }); await page.getByRole("button", { name: "显示或隐藏属性面板" }).click(); await page.locator(".right-panel").waitFor({ state: "visible" }); await page.waitForFunction(() => document.querySelectorAll('#inspector [data-ui-renderer-valid="true"]').length >= 6); assert.equal(await page.locator('.right-panel [data-ui-renderer-valid="false"]').count(), 0); await page.screenshot({ path: "/tmp/page-builder-development-qa.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ url, title: await page.title(), revision, rendererValid: await shell.getAttribute("data-renderer-valid"), productionRenderers: 5, persistedText: "提交申请", consoleErrors: errors.length }));
} finally { await browser.close(); child.kill("SIGTERM"); }
