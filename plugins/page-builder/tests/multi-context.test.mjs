import { strict as assert } from "node:assert";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { chromium } from "playwright-core";

// Actual bundled native resource and MCP server, isolated from every user page/library/export.
const data = await mkdtemp(path.join(tmpdir(), "page-builder-multi-context-"));
const client = new Client({ name: "multi-context-test", version: "1" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["dist/server.js"], env: { ...process.env, PAGE_BUILDER_DATA_DIR: data, PAGE_BUILDER_LIBRARY_DIR: path.join(data, "libraries"), PAGE_BUILDER_EXPORT_DIR: path.join(data, "exports") } }));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [], requests = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("request", r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
async function call(name, args) {
  const result = await client.callTool({ name, arguments: args });
  assert.ok(!result.isError, JSON.stringify(result)); return result.structuredContent;
}
try {
  let saved = (await call("page_create", { name: "多组件引用回归" })).page;
  saved = (await call("page_apply_operations", { pageId: saved.pageId, expectedRevision: saved.revision, operations: ["提交申请", "保存草稿", "关闭页面"].map(label => ({ type: "add", parentId: saved.root.id, node: { kind: "component", componentId: "C-02", props: { label } } })) })).page;
  const [a, b, c] = saved.root.children.map(node => node.id);
  async function change(operations) {
    saved = (await call("page_get_schema", { pageId: saved.pageId })).page;
    saved = (await call("page_apply_operations", { pageId: saved.pageId, expectedRevision: saved.revision, operations })).page;
  }
  const html = (await client.readResource({ uri: "ui://page-builder-development/editor-v5.html" })).contents[0].text;
  await page.exposeFunction("mcpRequest", async m => m.method === "tools/call" ? client.callTool(m.params) : m.method === "resources/read" ? client.readResource(m.params) : {});
  await page.setContent(`<script>
    window.attachments={};window.messages=[];window.rejectContext=false;
    addEventListener('message', async event=>{
      const m=event.data;if(!m||m.jsonrpc!=='2.0'||m.id===undefined)return;window.messages.push(m);
      try {
        if(m.method==='ui/update-model-context') {
          if(window.rejectContext)throw new Error('Grouped context rejected for test');
          if(m.params.structuredContent!=null||m.params.content?.some(c=>c.type==='text'&&c.text.trim()))window.attachments.native=m.params;else delete window.attachments.native;
        }
        const result=m.method==='ui/initialize'?{protocolVersion:'2026-01-26',hostInfo:{name:'multi-native-test',version:'1'},hostCapabilities:{serverTools:{},serverResources:{},updateModelContext:{text:{},structuredContent:{}}},hostContext:{locale:'zh-CN',platform:'desktop'}}:await window.mcpRequest(m);
        event.source?.postMessage({jsonrpc:'2.0',id:m.id,result},'*');
      }catch(error){event.source?.postMessage({jsonrpc:'2.0',id:m.id,error:{code:-32603,message:error.message}},'*');}
    });</script><iframe id="native" style="width:1420px;height:860px;border:0" sandbox="allow-scripts allow-same-origin"></iframe>`);
  const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'";
  await page.locator("iframe").evaluate((el, source) => { el.srcdoc = source; }, html.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`));
  const frame = page.frameLocator("#native"), shell = id => frame.locator(`#canvas [data-node-id="${id}"]`);
  const payload = () => page.evaluate(() => window.attachments.native?.structuredContent.pageBuilderSelection);
  async function groupCount(n) {
    await frame.locator("#selection-type").getByText(`已选 ${n} 项`, { exact: true }).waitFor();
    assert.equal(await frame.locator("#canvas .is-selected").count(), n);
    assert.equal(await frame.locator("#inspector .selection-list li").count(), n);
    assert.equal(await frame.locator("#inspector input,#inspector textarea").count(), 0);
    assert.equal(await frame.locator(".node-actions").getByRole("button", { name: "删除", exact: true }).count(), 0);
  }
  await shell(a).click();
  await shell(b).click({ modifiers: ["Meta"] }); await groupCount(2);
  await shell(c).click({ modifiers: ["Meta"] }); await groupCount(3);
  await shell(c).click({ modifiers: ["Meta"] }); await groupCount(2);
  // macOS reserves native Ctrl-click for its context menu. Check the Windows Ctrl event path separately.
  await shell(c).dispatchEvent("click", { ctrlKey: true }); await groupCount(3);
  await shell(c).dispatchEvent("click", { ctrlKey: true }); await groupCount(2);
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), [], "modifier selection is not attachment permission");
  await frame.locator(".node-actions").getByRole("button", { name: "加入 AI 上下文（2）", exact: true }).click();
  await page.waitForFunction(() => window.attachments.native?.structuredContent.pageBuilderSelection.nodes?.length === 2);
  const first = await payload();
  assert.deepEqual(first.nodeIds, [a,b]); assert.deepEqual(first.nodes.map(n => n.props.label), ["提交申请", "保存草稿"]);
  assert.ok(first.nodes.every(n => n.componentId === "C-02" && n.parentId === saved.root.id));
  assert.equal(first.nodeId, undefined, "a group must not impersonate the active single node");
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ["native"]);
  await page.screenshot({ path: "/tmp/page-builder-multi-context.png" });
  await page.setViewportSize({ width: 680, height: 900 });
  await page.locator("iframe").evaluate(el => { el.style.width = "660px"; });
  await frame.locator(".node-actions").evaluate(async el => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const r = el.getBoundingClientRect(); if (r.left < 0 || r.right > innerWidth || r.bottom > innerHeight) throw new Error("group toolbar clipped");
  });
  await page.screenshot({ path: "/tmp/page-builder-multi-context-narrow.png" });
  await page.setViewportSize({ width: 1440, height: 900 }); await page.locator("iframe").evaluate(el => { el.style.width = "1420px"; });

  await shell(c).click(); await frame.locator("#inspector:not([inert]) input").first().waitFor();
  assert.equal(await frame.locator("#canvas .is-selected").count(), 1);
  assert.deepEqual((await payload()).nodeIds, [a,b], "ordinary selection must preserve the pinned group");
  await change([{ type: "updateProps", nodeId: a, props: { label: "AI 更新的申请" } }, { type: "updateProps", nodeId: b, props: { label: "AI 更新的草稿" } }]);
  await page.waitForFunction(revision => window.attachments.native?.structuredContent.pageBuilderSelection.revision === revision, saved.revision);
  assert.deepEqual((await payload()).nodes.map(n=>n.props.label), ["AI 更新的申请", "AI 更新的草稿"]);

  // Tree keyboard selection follows the same group semantics.
  await frame.getByRole("tab", { name: "结构", exact: true }).click();
  const treeA = frame.locator(`[data-tree-node-id="${a}"]`), treeB = frame.locator(`[data-tree-node-id="${b}"]`);
  await treeA.click(); await treeB.press("Meta+Enter"); await groupCount(2);
  assert.equal(await treeA.getAttribute("aria-pressed"), "true"); assert.equal(await treeB.getAttribute("aria-pressed"), "true");
  await page.evaluate(() => { window.rejectContext = true; });
  await frame.locator(".node-actions").getByRole("button", { name: "加入 AI 上下文（2）", exact: true }).click();
  await frame.getByText(/同步失败：.*Grouped context rejected/).waitFor();
  await shell(c).click(); // Retry must retain the failed group, even after selection changes.
  await page.evaluate(() => { window.rejectContext = false; });
  await frame.getByRole("button", { name: "重试同步", exact: true }).click();
  await frame.getByText("对话已引用：2 项", { exact: true }).waitFor();
  assert.deepEqual((await payload()).nodeIds, [a,b]);
  await change([{ type: "remove", nodeId: a }]);
  await page.waitForFunction(id => window.attachments.native?.structuredContent.pageBuilderSelection.nodeId === id, b);
  assert.deepEqual((await payload()).nodeIds, [b]); assert.equal((await payload()).props.label, "AI 更新的草稿");
  await change([{ type: "remove", nodeId: b }]);
  await page.waitForFunction(() => Object.keys(window.attachments).length === 0);
  assert.deepEqual(await page.evaluate(() => window.messages.filter(m => m.method === 'ui/update-model-context').at(-1).params), { content: [] });
  assert.equal(await page.evaluate(() => window.messages.some(m => m.method === 'ui/message')), false);
  assert.deepEqual(requests, []); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ multiContext: "pass", cmdAndCtrlToggle: true, explicitOneAttachment: true, duplicateComponentIdsRetainNodeIdentity: true, savedPropsUpdated: true, pinnedGroupSurvivesSelectionAndRetry: true, treeKeyboard: true, partialDeletionKeepsRemaining: true, finalDeletionClears: true, narrowToolbar: true, httpRequests: requests.length, errors }));
} catch (error) {
  await page.screenshot({ path: "/tmp/page-builder-multi-context-failure.png" });
  console.error(JSON.stringify({ errors, body: await page.frameLocator("#native").locator("body").innerText(), attachments: await page.evaluate(() => window.attachments) })); throw error;
} finally { await browser.close(); await client.close(); }
