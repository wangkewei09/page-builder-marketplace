import { editInline, openInline } from "./inline-helpers.mjs";
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { chromium } from 'playwright-core';

const data = await mkdtemp(path.join(tmpdir(), 'page-builder-native-refresh-'));
const source = path.join(data, 'source');
await cp(process.env.PAGE_BUILDER_TEST_SOURCE || 'dist/ui/vendor/b2b', source, { recursive: true });
const contractFile = path.join(source, 'components/runtime/builder-contract.json');
const sourceContract = await readFile(contractFile, 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return { schemaVersion: 1, libraryId: 'b2b', components: {} }; throw error; });
const builtBefore = await readFile('dist/ui/app.js');
let cardTitleLabel = sourceContract.components['C-34']?.fields?.title?.label || '卡片标题';
const cardVariantLabel = sourceContract.components['C-34']?.fields?.variant?.label || '变体';
const compactLabel = sourceContract.components['C-34']?.fields?.variant?.options?.find(item => item.value === 'compact')?.label || '简洁卡片';
const client = new Client({ name: 'native-refresh-test', version: '1' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ['dist/server.js'], env: { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(data, 'pages'), PAGE_BUILDER_LIBRARY_DIR: path.join(data, 'libraries'), PAGE_BUILDER_EXPORT_DIR: path.join(data, 'exports') } }));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], requests = []; let refreshResponses = 0, failRuntimeReads = false, omitRuntimeLoader = false;
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await page.exposeFunction('mcpRequest', async message => {
    if (message.method === 'tools/call') { const result = await client.callTool(message.params); if (message.params.name === 'component_library_refresh') refreshResponses++; return result; }
    if (message.method === 'resources/read') {
      if (failRuntimeReads && message.params.uri.startsWith('page-builder://runtime')) throw new Error('Runtime read rejected for test');
      const result = await client.readResource(message.params);
      if (omitRuntimeLoader && message.params.uri.startsWith('page-builder://runtime/')) {
        result.contents[0].text = JSON.stringify({ assets: {} });
      }
      return result;
    }
    return {};
  });
  await page.setContent(`<script>window.contexts=[];window.initializations=0;
  addEventListener('message',async event=>{const m=event.data;if(!m?.method||m.id===undefined||!event.source)return;
    if(m.method==='ui/update-model-context')window.contexts.push(m.params);
    try{let result;if(m.method==='ui/initialize'){window.initializations++;result={protocolVersion:'2026-01-26',hostInfo:{name:'injected-widget-host',version:'1'},hostCapabilities:{serverTools:{},serverResources:{},updateModelContext:{text:{},structuredContent:{}}},hostContext:{locale:'zh-CN',platform:'desktop'}}}else result=await window.mcpRequest(m);
    event.source?.postMessage({jsonrpc:'2.0',id:m.id,result},'*');}catch(error){event.source?.postMessage({jsonrpc:'2.0',id:m.id,error:{code:-32603,message:error.message}},'*');}});</script>
    <iframe id="editor" style="width:1420px;height:960px;border:0" sandbox="allow-scripts allow-same-origin"></iframe>`);
  const resource = await client.readResource({ uri: 'ui://page-builder-development/editor-v5.html' });
  const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'";
  const html = resource.contents[0].text.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`);
  // Dynamically injected widget HTML has no reloadable URL. srcdoc would hide this regression.
  await page.locator('#editor').evaluate((el, html) => { const doc=el.contentDocument;doc.open();doc.write(html);doc.close(); }, html);
  const frame = page.frameLocator('#editor');
  await frame.getByLabel('添加卡片').click(); await frame.getByText('卡片已添加').waitFor();
  await frame.locator('.component-shell').click();
  await frame.locator('#sync-context button').click();
  const saved = await client.callTool({ name: 'page_list', arguments: {} });
  const pageId = saved.structuredContent.pages[0].pageId;
  const getPage = async () => (await client.callTool({ name: 'page_get_schema', arguments: { pageId } })).structuredContent.page;
  const original = await getPage();
  await frame.getByText('组件库来源与更新', { exact: true }).click();
  await frame.locator('#library-source input').fill(source);
  await frame.getByRole('button', { name: '刷新并重载组件', exact: true }).click();
  const deadline = Date.now() + 15000;
  while (!refreshResponses && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(refreshResponses, 1);
  await page.waitForTimeout(1000);
  assert.equal(await frame.locator('#app').count(), 1, 'refresh must preserve the dynamically injected editor document');
  await frame.locator('#canvas .source-design-card').waitFor();
  await frame.getByText('组件已刷新并重载，页面内容已保留。', { exact: true }).waitFor();
  const initialRuntimeNodes = await frame.locator('head script,head style,head link').count();
  const style = path.join(source, 'components/C-34-card/styles.css');
  const originalStyle = await readFile(style, 'utf8');
  const loader = path.join(source, 'components/runtime/loader.js');
  const originalLoader = await readFile(loader, 'utf8');
  const refresh = async () => {
    await frame.getByRole('button', { name: '刷新并重载组件', exact: true }).click();
    await frame.getByText('组件已刷新并重载，页面内容已保留。', { exact: true }).waitFor();
  };
  for (const [index, color] of ['rgb(123, 45, 67)', 'rgb(33, 65, 167)'].entries()) {
    await writeFile(style, originalStyle + `\n.source-design-card{border-color:${color}}\n`);
    await writeFile(loader, originalLoader + `\nwindow.B2B.__refreshVersion = ${index + 1};\n`);
    await refresh();
    assert.equal(await frame.locator('#canvas .source-design-card').evaluate(el => getComputedStyle(el).borderTopColor), color);
    assert.equal(await frame.locator('body').evaluate(() => window.B2B.__refreshVersion), index + 1, 'updated source JavaScript must execute');
    assert.deepEqual((await getPage()).root, original.root);
    assert.equal(await frame.locator('head script,head style,head link').count(), initialRuntimeNodes, 'old runtime elements must not accumulate');
    await frame.locator('.component-shell').click();
  await frame.locator('#sync-context button').click();
    await page.waitForFunction(() => window.contexts.at(-1)?.structuredContent?.pageBuilderSelection?.componentId === 'C-34');
  }
  const beforeUnchanged = await getPage();
  await refresh();
  assert.deepEqual(await getPage(), beforeUnchanged, 'same-source reload must not change the page revision');
  sourceContract.components['C-34'] ||= { fields: {} };
  sourceContract.components['C-34'].fields ||= {};
  sourceContract.components['C-34'].fields.title = { ...sourceContract.components['C-34'].fields.title, label: '协议更新后的卡片标题' };
  await writeFile(contractFile, JSON.stringify(sourceContract));
  await refresh(); cardTitleLabel = '协议更新后的卡片标题';
  await frame.locator('#app:not([inert]) #inspector:not([inert])').getByRole('button', { name: '编辑' + cardTitleLabel, exact: true }).waitFor();
  assert.deepEqual((await getPage()).root, beforeUnchanged.root, 'native metadata reload must preserve node content');
  assert.deepEqual(await readFile('dist/ui/app.js'), builtBefore, 'native metadata changes must not rebuild the plugin');
  // Source-only anchor changes alter editing placement without rebuilding the plugin.
  const inlineFile = path.join(source, 'components/runtime/inline-editing.json');
  const inlineContract = JSON.parse(await readFile(inlineFile, 'utf8'));
  const changedAnchors = structuredClone(inlineContract);
  changedAnchors.components['C-34'] = changedAnchors.components['C-34'].filter(item => item.property !== 'title');
  changedAnchors.components['C-34'].push({ property: 'title', selector: ':scope > .missing-title', control: 'text' });
  await writeFile(inlineFile, JSON.stringify(changedAnchors)); await refresh();
  await frame.locator('#app:not([inert]) #inspector:not([inert])').getByRole('group', { name: cardTitleLabel, exact: true }).waitFor();
  assert.equal(await frame.getByRole('button', { name: '编辑' + cardTitleLabel, exact: true }).count(), 0, 'unmatched source anchor retains inspector access');
  assert.deepEqual((await getPage()).root, beforeUnchanged.root);
  await writeFile(inlineFile, JSON.stringify(inlineContract)); await refresh();
  await frame.locator('#app:not([inert]) #inspector:not([inert])').getByRole('button', { name: '编辑' + cardTitleLabel, exact: true }).waitFor();
  assert.deepEqual(await readFile('dist/ui/app.js'), builtBefore, 'source anchors reload without rebuilding the consumer');
  await editInline(frame, cardTitleLabel, '刷新后继续编辑');
  await frame.locator('#canvas').getByText('刷新后继续编辑', { exact: true }).waitFor();
  await frame.getByText('已保存', { exact: true }).waitFor();
  const edited = await getPage(); assert.equal(edited.root.children[0].props.title, '刷新后继续编辑');

  await writeFile(style, originalStyle + '\n.source-design-card{border-color:rgb(12, 145, 67)}\n');
  failRuntimeReads = true;
  await frame.getByRole('button', { name: '刷新并重载组件', exact: true }).click();
  await frame.locator('#library-update-status').filter({ hasText: 'Runtime read rejected for test' }).waitFor();
  assert.equal(await frame.locator('#canvas .source-design-card').evaluate(el => getComputedStyle(el).borderTopColor), 'rgb(33, 65, 167)');
  assert.deepEqual((await getPage()).root, edited.root);
  await frame.getByRole('button', { name: '刷新并重载组件', exact: true }).isEnabled().then(enabled => assert.ok(enabled));
  failRuntimeReads = false;
  await refresh();
  assert.equal(await frame.locator('#canvas .source-design-card').evaluate(el => getComputedStyle(el).borderTopColor), 'rgb(12, 145, 67)');
  omitRuntimeLoader = true;
  await frame.getByRole('button', { name: '刷新并重载组件', exact: true }).click();
  await frame.locator('#library-update-status').filter({ hasText: '缺少组件库资源' }).waitFor();
  assert.equal(await frame.locator('#canvas .source-design-card').evaluate(el => getComputedStyle(el).borderTopColor), 'rgb(12, 145, 67)', 'failed replacement must restore the last usable runtime');
  assert.equal(await frame.locator('#canvas').getByText('刷新后继续编辑', { exact: true }).count(), 1);
  omitRuntimeLoader = false;
  await refresh();
  const contextCount = await page.evaluate(() => window.contexts.length);
  await frame.locator('.component-shell').click();
  await frame.locator('#sync-context button').click();
  await page.waitForFunction(count => window.contexts.length > count && window.contexts.at(-1)?.structuredContent?.pageBuilderSelection?.props?.title === '刷新后继续编辑', contextCount);
  await frame.getByRole('button', { name: '删除节点', exact: true }).waitFor();
  await frame.locator('#app:not([inert]) #inspector:not([inert])').getByRole('group', { name: cardVariantLabel, exact: true }).locator('[data-select-trigger]').click();
  await frame.getByRole('option', { name: compactLabel, exact: true }).click({ timeout: 5000 }).catch(async error => {
    console.error(JSON.stringify({ inspector: await frame.locator('#inspector').innerText(), variant: await frame.locator('#app:not([inert]) #inspector:not([inert])').getByRole('group', { name: cardVariantLabel, exact: true }).innerHTML(), errors }));
    await page.screenshot({ path: '/tmp/page-builder-native-refresh-variant.png' }); throw error;
  });
  await page.waitForFunction(() => window.contexts.at(-1)?.structuredContent?.pageBuilderSelection?.props?.variant === 'compact');
  await frame.getByRole('button', { name: '删除节点', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.initializations), 1, 'refresh must retain the same host connection');
  await page.screenshot({ path: '/tmp/page-builder-native-refresh-fixed.png' });
  // The drag controller's document listeners must survive library listener cleanup.
  const beforeDrag = await getPage();
  const palette = frame.locator('#component-list .library-item').first();
  const from = await palette.boundingBox(), to = await frame.locator('.component-shell').boundingBox();
  await page.mouse.move(from.x + 24, from.y + from.height / 2); await page.mouse.down();
  await page.mouse.move(from.x + 32, from.y + from.height / 2 + 8, { steps: 4 });
  await page.mouse.move(to.x + 30, to.y + 3, { steps: 10 }); await page.mouse.move(to.x + 31, to.y + 4);
  await frame.locator('.drop-placeholder').waitFor();
  assert.equal(await frame.locator('.drop-placeholder').getAttribute('data-index'), '0');
  assert.deepEqual(await getPage(), beforeDrag, 'native drag preview must not persist');
  await page.waitForTimeout(220);
  await page.screenshot({ path: '/tmp/page-builder-drag-native.png' });
  await page.mouse.up(); await frame.getByText('基础按钮已添加', { exact: true }).waitFor();
  const afterDrag = await getPage();
  assert.equal(afterDrag.revision, beforeDrag.revision + 1);
  assert.equal(afterDrag.root.children[0].componentId, 'C-02');
  assert.equal(afterDrag.root.children[1].id, beforeDrag.root.children[0].id);
  assert.equal(await frame.locator('.drop-placeholder,.drag-ghost').count(), 0);
  const reference = await page.evaluate(() => window.contexts.at(-1).structuredContent.pageBuilderSelection);
  await frame.locator('.canvas-scroll').click({ position: { x: 2, y: 2 } });
  await frame.locator('#selection-type').getByText('未选择', { exact: true }).waitFor();
  await frame.locator('.page-overview-info').getByText('2 个组件', { exact: true }).waitFor();
  assert.deepEqual(await getPage(), afterDrag, 'clearing selection after reload must not edit the page');
  assert.deepEqual(await page.evaluate(() => window.contexts.at(-1).structuredContent.pageBuilderSelection), reference, 'clearing after reload must preserve explicit context');
  assert.deepEqual(errors, []); assert.deepEqual(requests, []);
  console.log(JSON.stringify({ nativeRefresh: 'pass', injectedDocumentPreserved: true, repeatedSourceReload: true, sourceMetadataReloaded: true, pluginBuildUnchanged: true, sourceJavaScriptAndCssChanged: true, contentAndSelectionPreserved: true, noRuntimeNodeGrowth: true, sameHostConnection: true, sameSourceRevisionPreserved: true, editingAfterReload: true, dragPreviewAndDropAfterReload: true, deselectAfterReload: true, failurePreservesDisplayAndRetry: true, failedReplacementRestoresRuntime: true, noHttpRequests: true, screenshot: '/tmp/page-builder-native-refresh-fixed.png' }));
} finally { await browser.close(); await client.close(); }
