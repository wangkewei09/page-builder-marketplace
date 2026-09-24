import { editInline, openInline } from "./inline-helpers.mjs";
import { strict as assert } from "node:assert";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const data = await mkdtemp(path.join(tmpdir(), "page-builder-host-")); const exportsDir = await mkdtemp(path.join(tmpdir(), "page-builder-host-export-"));
const child = spawn(process.execPath, ["dist/standalone.js"], { cwd: new URL("..", import.meta.url), env: { ...process.env, PAGE_BUILDER_DATA_DIR: data, PAGE_BUILDER_EXPORT_DIR: exportsDir, PAGE_BUILDER_LIBRARY_DIR: path.join(data, "libraries") }, stdio: ["ignore", "pipe", "inherit"] });
const url = await new Promise((resolve, reject) => { let output = ""; child.stdout.on("data", (chunk) => { output += chunk; const match = output.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) resolve(match[0]); }); child.once("exit", (code) => reject(new Error(`server exited ${code}`))); setTimeout(() => reject(new Error("server URL timeout")), 10000); });
const executablePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath, headless: true }); const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
try {
  await page.setContent(`<script>
    window.hostMessages=[]; window.allowContext=true; window.attachments={}; window.contextResponse='accept';
    addEventListener('message', event => {
      const message=event.data; if(!message || message.jsonrpc!=='2.0' || !event.source) return; window.hostMessages.push(message);
      if(message.method==='ui/update-model-context') {
        if(window.contextResponse==='drop') return;
        if(window.contextResponse==='reject') {event.source.postMessage({jsonrpc:'2.0',id:message.id,error:{code:-32603,message:'Context rejected for test'}},'*');return;}
        const id=Array.from(document.querySelectorAll('iframe')).find(f=>f.contentWindow===event.source)?.id;
        const p=message.params;
        // Codex counts any structuredContent object, including {pageBuilderSelection:null}.
        if(p.content?.some(c=>c.type==='image'||c.type==='text'&&c.text.trim())||p.structuredContent!=null) window.attachments[id]=p;
        else delete window.attachments[id];
      }
      if(message.method==='ui/initialize') event.source.postMessage({jsonrpc:'2.0',id:message.id,result:{protocolVersion:'2026-01-26',hostInfo:{name:'page-builder-test-host',version:'1.0.0'},hostCapabilities:window.allowContext?{updateModelContext:{text:{},structuredContent:{}}}:{},hostContext:{locale:'zh-CN',platform:'desktop'}}},'*');
      else if(message.method && message.id!==undefined) event.source.postMessage({jsonrpc:'2.0',id:message.id,result:{}},'*');
    });
  </script><iframe id="app" src="${url}" style="width:1100px;height:720px"></iframe>`);
  const frame = page.frameLocator("#app"); await frame.getByRole("button", { name: "显示或隐藏属性面板" }).click(); await frame.getByText("选中后点击按钮加入 AI 上下文").waitFor();
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), [], "opening the editor must not create an empty context attachment");
  await frame.getByLabel("添加基础按钮").click(); await frame.getByText("基础按钮已添加").waitFor();
  await frame.getByLabel("添加标签").click(); await frame.getByText("标签已添加").waitFor();
  const shells = frame.locator('.node-shell[data-renderer-valid="true"]'); await shells.first().click(); await shells.last().click();
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), [], "selecting and adding do not attach context");
  await frame.locator(".node-actions").getByRole("button", { name: "加入 AI 上下文", exact: true }).click();
  await page.waitForFunction(() => window.hostMessages.filter(message => message.method === "ui/update-model-context").at(-1)?.params?.structuredContent?.pageBuilderSelection?.componentId === "C-42");
  const messages = await page.evaluate(() => window.hostMessages); assert.equal(messages.some((message) => message.method === "ui/message"), false);
  const lastContext = messages.filter((message) => message.method === "ui/update-model-context").at(-1); assert.equal(lastContext.params.structuredContent.pageBuilderSelection.componentId, "C-42");
  assert.match(lastContext.params.content[0].text, /pageId=.*nodeId=.*revision=/); assert.match(lastContext.params.presentation?.composerLabel || "", /页面搭建器/);
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ["app"]);

  const pinned = await page.evaluate(() => window.attachments.app.structuredContent.pageBuilderSelection);
  await shells.first().click();
  await frame.locator("#inspector:not([inert])").waitFor();
  await editInline(frame, '文案', '编辑其他组件');
  await frame.locator('#canvas').getByText('编辑其他组件', { exact: true }).waitFor();
  await page.waitForFunction(rev => window.attachments.app.structuredContent.pageBuilderSelection.revision > rev, pinned.revision);
  assert.equal(await page.evaluate(() => window.attachments.app.structuredContent.pageBuilderSelection.nodeId), pinned.nodeId, 'editing a different selected component keeps the pinned node');
  await shells.last().click();
  await frame.locator("#inspector:not([inert])").waitFor();
  await editInline(frame, '文字', '已引用的标签');
  await page.waitForFunction(() => window.attachments.app.structuredContent.pageBuilderSelection.props.text === '已引用的标签');

  await page.evaluate(url => { const second=document.createElement('iframe'); second.id='second'; second.src=url; second.style='width:1100px;height:720px'; document.body.append(second); }, url);
  const second = page.frameLocator("#second");
  await second.getByRole("button", { name: "显示或隐藏属性面板" }).click();
  await second.getByText("选中后点击按钮加入 AI 上下文").waitFor();
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ["app"], "passive panel must not add a ghost attachment");
  await second.locator('.node-shell[data-renderer-valid="true"]').first().click();
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ["app"], "selecting in a second panel does not replace a pinned reference");
  await second.locator("#sync-context button").click();
  await page.waitForFunction(() => Object.keys(window.attachments).join() === 'second');
  await shells.last().click();
  await frame.locator("#sync-context button").click();
  await page.waitForFunction(() => Object.keys(window.attachments).join() === 'app');
  await page.locator("#second").evaluate(el => el.remove());

  const snapshot = await (await fetch(`${url}/api/pages`)).json(); const pageId = snapshot.pages[0].pageId; const current = await (await fetch(`${url}/api/pages/${pageId}`)).json();
  await fetch(`${url}/api/pages/${pageId}/selection`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nodeId: null, expectedRevision: current.page.revision }) });
  await frame.getByText("未选择", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ["app"], "deselecting preserves the explicit reference");
  const pinnedId = await page.evaluate(() => window.attachments.app.structuredContent.pageBuilderSelection.nodeId);
  await fetch(`${url}/api/pages/${pageId}/operations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedRevision: current.page.revision, operations: [{ type: "remove", nodeId: pinnedId }] }) });
  await page.waitForFunction(() => Object.keys(window.attachments).length === 0);
  await frame.getByRole("button", { name: "撤销", exact: true }).click();
  await frame.getByText("已撤销", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.hostMessages.filter(m => m.method === 'ui/update-model-context').at(-1).params), { content: [] });

  await page.evaluate(() => { window.contextResponse='reject'; });
  await shells.last().click();
  await frame.locator("#sync-context button").click();
  await frame.getByText(/同步失败：.*Context rejected for test/).waitFor();
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), [], "rejected context is never reported as attached");
  await shells.first().click();
  await frame.getByText(/同步失败：.*Context rejected for test/).waitFor();
  await shells.last().click();
  await page.evaluate(() => { window.contextResponse='accept'; });
  await frame.getByRole("button", { name: "重试同步", exact: true }).click();
  await frame.getByText("对话已引用：标签").waitFor();

  // The host waits for teardown; clearing must finish before the reply, not in an unloaded frame.
  await page.evaluate(() => document.querySelector('#app').contentWindow.postMessage({jsonrpc:'2.0',id:'teardown-test',method:'ui/resource-teardown',params:{}},'*'));
  await page.waitForFunction(() => window.hostMessages.some(m => m.id === 'teardown-test' && m.result));
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), []);

  // A missing clear acknowledgement must not block editor startup for the SDK's default minute.
  await page.evaluate(() => { window.contextResponse='drop'; document.querySelector('#app').src=document.querySelector('#app').src; });
  await frame.getByRole("button", { name: "显示或隐藏属性面板" }).click();
  await frame.getByText(/清除上下文失败：.*timed out/i).waitFor({ timeout: 8000 });
  await page.evaluate(() => { window.contextResponse='accept'; });
  await frame.getByRole("button", { name: "重试同步", exact: true }).click();
  await frame.getByText("对话已引用：标签").waitFor();
  await page.screenshot({ path: "/tmp/page-builder-context-fixed.png" });
  assert.deepEqual(errors, []);

  await page.evaluate(() => { window.allowContext = false; window.hostMessages = []; document.querySelector("#app").src = document.querySelector("#app").src; });
  await frame.getByRole("button", { name: "显示或隐藏属性面板" }).click();
  await frame.getByText("宿主未开放对话上下文能力").waitFor();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ hostBridge: "pass", lastComponent: "C-42", ghostAttachments: 0, singleAttachmentAcrossTwoPanels: true, cleared: true, teardownClearedBeforeReply: true, rejectionAndTimeoutRetry: true, autoMessageCalls: 0, unsupportedVisible: true, errors, screenshot: "/tmp/page-builder-context-fixed.png" }));
} catch (error) { await page.screenshot({ path: "/tmp/page-builder-host-failure.png" }); console.error(JSON.stringify({ errors, messages: await page.evaluate(() => window.hostMessages?.slice(-12)), attachments: await page.evaluate(() => window.attachments), body: await page.frameLocator("#app").locator("body").innerText() })); throw error; } finally { await browser.close(); child.kill("SIGTERM"); }
