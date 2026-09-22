import assert from 'node:assert/strict';
import { inlineSelector, inlineValue } from './inline-helpers.mjs';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const data = await mkdtemp(path.join(tmpdir(), 'page-builder-inline-'));
const child = spawn(process.execPath, ['dist/standalone.js'], { env: { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(data, 'pages'), PAGE_BUILDER_LIBRARY_DIR: path.join(data, 'libraries'), PAGE_BUILDER_EXPORT_DIR: path.join(data, 'exports') }, stdio: ['ignore', 'pipe', 'inherit'] });
const url = await new Promise((resolve, reject) => {
  let output = ''; const timer = setTimeout(() => reject(Error('server timeout')), 15000);
  child.stdout.on('data', chunk => { output += chunk; const match = output.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timer); resolve(match[0]); } });
  child.once('exit', code => { clearTimeout(timer); reject(Error(`server exit ${code}`)); });
});
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const api = async (route, payload) => { const r = await fetch(url + route, payload ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) } : {}); const result = await r.json(); assert.ok(r.ok, JSON.stringify(result)); return result; };
let model;
const saved = async () => (await api('/api/pages/' + model.pageId)).page;
const settle = async revision => { await page.waitForFunction(r => document.querySelector('#revision-badge')?.textContent === `Revision ${r}`, revision); model = await saved(); await page.locator('#inspector:not([inert])').waitFor({ state: 'attached' }); };
const operate = async operations => { model = (await api(`/api/pages/${model.pageId}/operations`, { expectedRevision: model.revision, operations })).page; await settle(model.revision); };
const shell = id => page.locator(`[data-node-id="${id}"]`);
try {
  model = (await api('/api/pages', { name: '画布内容编辑验收' })).page;
  model = (await api(`/api/pages/${model.pageId}/operations`, { expectedRevision: model.revision, operations: [
    { type: 'add', parentId: model.root.id, node: { kind: 'component', componentId: 'C-02', props: { label: '保存订单', icon: 'search' } } },
    { type: 'add', parentId: model.root.id, node: { kind: 'component', componentId: 'C-34', props: { title: '项目概览', body: '项目进展', meta: '今天更新' } } },
    { type: 'add', parentId: model.root.id, node: { kind: 'component', componentId: 'C-21', props: { variant: '数字输入框', value: 3, min: 0, max: 100 } } },
    { type: 'add', parentId: model.root.id, node: { kind: 'component', componentId: 'C-42', props: { text: '待处理' } } }
  ] })).page;
  await page.goto(`${url}/?page=${model.pageId}`); await page.locator('#startup-status').waitFor({ state: 'hidden' });
  const [button,card,number,tag] = model.root.children;
  await page.evaluate(() => { window.canvasActivations = 0; document.addEventListener('b2b:button-activate', event => { if (event.target.closest('#canvas')) window.canvasActivations++; }); });
  const control = page.locator(inlineSelector);
  const hint = page.locator('#selection-hint');
  const dbl = async locator => { await page.locator('#inspector:not([inert])').waitFor({ state: 'attached' }); await locator.scrollIntoViewIfNeeded(); const box = await locator.boundingBox(); assert.ok(box); await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2); await control.waitFor({ timeout: 5000 }); };
  const open = async (id, name) => { await shell(id).click({ position: { x: 2, y: 2 } }); await page.locator('#inspector:not([inert])').getByRole('button', { name: `编辑${name}`, exact: true }).click(); await control.waitFor({ timeout: 5000 }); };
  await shell(button.id).click(); assert.equal(await control.count(), 0, 'single click only selects');
  assert.equal(await page.locator('#inspector [data-property="label"]').count(), 0, 'inline content is not repeated as a form');
  await page.getByText('其他设置', { exact: true }).click();
  await page.locator('#inspector details [data-property="icon"]').waitFor();
  const keys = await page.locator('#inspector [data-property]').evaluateAll(els => els.map(el => el.dataset.property));
  assert.equal(new Set(keys).size, keys.length, 'right inspector has unique property paths');
  await page.evaluate(() => { window.retainedInput = document.querySelector('#canvas input'); window.retainedCanvas = document.querySelector('#canvas > .node-shell'); });
  const beforeAppearance = await shell(button.id).locator('[data-source-basic-button]').evaluate(el => { window.sourceIcon = el.querySelector('span'); const s = getComputedStyle(el); const r = document.createRange(); r.selectNode([...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim())); const b = r.getBoundingClientRect(); return { font: s.font, color: s.color, x: b.x, y: b.y, width: b.width, height: b.height }; });
  await dbl(shell(button.id).locator('[data-source-basic-button]'));
  assert.ok(await control.evaluate(el => el.closest('.component-host') && el.isContentEditable && document.activeElement === el));
  assert.equal(await page.locator('.inline-editor,[role=dialog]').count(), 0, 'no popup or second input');
  assert.ok(await page.evaluate(() => window.sourceIcon === document.querySelector('#canvas [data-source-basic-button] > span')), 'source icon retained');
  const editingAppearance = await control.evaluate(el => { const s = getComputedStyle(el); const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return { font: s.font, color: s.color, x: b.x, y: b.y, width: b.width, height: b.height }; });
  assert.deepEqual(editingAppearance, beforeAppearance, 'source text font/color/position/size unchanged');
  await control.fill('确认订单');
  assert.match(await shell(button.id).locator('[data-source-basic-button]').innerText(), /确认订单$/, 'draft is directly visible on source button');
  assert.equal((await saved()).revision, model.revision, 'typing does not persist');
  await control.press('Enter');
  await control.waitFor({ state: 'detached' }); await settle(model.revision + 1);
  assert.equal(model.root.children[0].props.label, '确认订单');
  assert.ok(await page.evaluate(() => window.retainedInput === document.querySelector('#canvas input') && window.retainedCanvas === document.querySelector('#canvas > .node-shell')), 'unrelated component and page keep DOM identity');
  await page.evaluate(() => { window.cancelButton = document.querySelector('#canvas [data-source-basic-button]'); window.cancelHTML = window.cancelButton.outerHTML; });
  await open(button.id, '文案'); await control.fill('取消的修改'); await control.press('Escape');
  assert.equal((await saved()).revision, model.revision);
  assert.deepEqual(await page.evaluate(() => ({ retained: window.cancelButton === document.querySelector('#canvas [data-source-basic-button]'), html: window.cancelButton.outerHTML })), { retained: true, html: await page.evaluate(() => window.cancelHTML) }, 'cancel restores exact source DOM');
  await open(card.id, '卡片正文');
  await control.fill('第一行\n第二行' + '长正文'.repeat(100)); await control.press('Enter');
  assert.equal((await saved()).revision, model.revision, 'Enter in multiline does not submit');
  await control.press('Meta+Enter'); await control.waitFor({ state: 'detached' }); await settle(model.revision + 1);
  assert.match(model.root.children[1].props.body, /第一行\n第二行/); assert.ok(model.root.children[1].props.body.length > 240, 'card body has no artificial C-21 limit');
  await open(card.id, '卡片标题');
  await control.fill('中文标题');
  await control.dispatchEvent('compositionstart');
  await control.press('Enter'); assert.equal((await saved()).revision, model.revision, 'IME Enter does not save');
  await control.dispatchEvent('compositionend');
  await page.mouse.click(5, 5); await control.waitFor({ state: 'detached' }); await settle(model.revision + 1);
  assert.equal(model.root.children[1].props.title, '中文标题');
  // Numbers are parsed to the API's numeric branch; invalid data stays a draft.
  await dbl(shell(number.id).locator('input'));
  await control.fill('8'); await control.press('Enter'); await control.waitFor({ state: 'detached' }); await settle(model.revision + 1);
  assert.equal(model.root.children[2].props.value, 8);
  await dbl(shell(number.id).locator('input')); await control.fill('not-a-number'); await control.press('Enter');
  await hint.getByText('请输入有效数字。').waitFor(); assert.equal((await saved()).revision, model.revision);
  await control.press('Escape');
  // Editing does not mount a replacement renderer; rich paste stays plain text.
  await shell(button.id).click();
  await page.evaluate(() => { window.normalRenderer = window.B2B.renderComponent; window.B2B.renderComponent = (spec, target) => { if (target.closest('#canvas,.inline-editor')) throw Error('unexpected editor renderer mount'); return window.normalRenderer(spec, target); }; });
  await open(button.id, '文案');
  await control.evaluate(el => { const data = new DataTransfer(); data.setData('text/plain', '<b>纯文本</b>'); data.setData('text/html', '<img src=x onerror=alert(1)>'); el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })); });
  assert.equal(await inlineValue(control), '<b>纯文本</b>'); assert.equal(await control.locator('img,b').count(), 0);
  await control.press('Escape'); await page.evaluate(() => { window.B2B.renderComponent = window.normalRenderer; });
  assert.equal((await saved()).revision, model.revision);
  // Simulated server failure keeps text and the saved component intact; retry works.
  await page.route('**/operations', route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { message: '测试保存失败' } }) }));
  await open(button.id, '文案'); await control.fill('重试内容'); await control.press('Enter');
  await hint.getByText('未保存：测试保存失败').waitFor(); assert.equal(await inlineValue(control), '重试内容');
  assert.equal((await saved()).revision, model.revision); await page.unroute('**/operations');
  await control.press('Enter'); await control.waitFor({ state: 'detached' }); await settle(model.revision + 1);
  await page.getByRole('button', { name: '撤销', exact: true }).click(); await settle(model.revision + 1); assert.equal(model.root.children[0].props.label, '确认订单');
  await page.getByRole('button', { name: '重做', exact: true }).click(); await settle(model.revision + 1); assert.equal(model.root.children[0].props.label, '重试内容');
  // External saves cannot be overwritten by a draft opened at an older revision.
  await open(button.id, '文案'); await control.fill('旧草稿');
  model = (await api(`/api/pages/${model.pageId}/operations`, { expectedRevision: model.revision, operations: [{ type: 'updateProps', nodeId: button.id, props: { label: 'AI 修改' } }] })).page;
  await control.press('Enter'); await hint.getByText('页面已被更新，草稿已保留。按 Esc 取消后重新编辑。').waitFor();
  assert.equal((await saved()).root.children[0].props.label, 'AI 修改'); assert.equal(await inlineValue(control), '旧草稿');
  await control.press('Escape'); await settle(model.revision);
  await open(tag.id, '文字'); await control.fill('完成'); await control.press('Enter'); await control.waitFor({ state: 'detached' }); await settle(model.revision + 1);
  // Disabled/loading visuals and native locked controls retain their source state.
  for (const props of [{ disabled: true, loading: false, icon: null }, { disabled: false, loading: true, icon: 'search' }]) {
    await operate([{ type: 'updateProps', nodeId: button.id, props }]);
    await open(button.id, '文案');
    assert.equal(await shell(button.id).locator('[data-source-basic-button]').getAttribute('disabled'), '');
    await page.keyboard.insertText('状态中的草稿'); assert.equal(await inlineValue(control), '状态中的草稿'); await page.keyboard.press('Escape');
    assert.equal(await shell(button.id).locator('[data-source-basic-button]').getAttribute('disabled'), '');
    assert.equal(await shell(button.id).locator('[contenteditable]').count(), 0);
  }
  await operate([{ type: 'updateProps', nodeId: button.id, props: { disabled: false, loading: false, icon: 'search' } }]);
  assert.equal(await page.evaluate(() => window.canvasActivations), 0, 'text editing never triggers source actions');
  // Preview keeps the source's original behavior and cannot open canvas editing.
  await page.getByRole('button', { name: '预览', exact: true }).click();
  await shell(button.id).locator('[data-source-basic-button]').dblclick(); assert.equal(await control.count(), 0);
  assert.equal(await page.evaluate(() => window.canvasActivations), 2, 'source click listener still works after editing');
  await page.getByRole('button', { name: '返回编辑', exact: true }).click();
  await open(card.id, '卡片标题'); await page.screenshot({ path: path.join(data, 'inplace-desktop.png') });
  await control.press('Escape');
  await page.setViewportSize({ width: 520, height: 800 });
  await shell(button.id).scrollIntoViewIfNeeded(); await dbl(shell(button.id).locator('[data-source-basic-button]'));
  const rect = await control.boundingBox(); assert.ok(rect.x >= 0 && rect.x + rect.width <= 520 && rect.y >= 0 && rect.y + rect.height <= 800);
  await page.screenshot({ path: path.join(data, 'inplace-narrow.png') }); await control.press('Escape');
  assert.deepEqual(errors.filter(e => !e.includes('400 (Bad Request)') && !e.includes('409 (Conflict)')), []);
  const result = { passed: true, data, assertions: ['double click / single click', 'actual source text edit / original font color geometry / icon retained / no popup', 'no replacement renderer', 'plain text paste', 'long card body', 'unique property paths', 'localized updates', 'Esc / multiline / IME / blur', 'numeric types', 'failure draft and retry', 'undo redo', 'revision conflict', 'disabled and loading states', 'no source actions during edit / preview actions restored', 'desktop and narrow'] };
  await writeFile(path.join(data, 'result.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} catch (error) {
  console.error(JSON.stringify({ data, hint: await page.locator('#selection-hint').textContent(), active: await page.evaluate(() => document.activeElement?.tagName), revision: model.revision }));
  await page.screenshot({ path: path.join(data, 'failure.png') }); throw error;
} finally { await browser.close(); child.kill('SIGTERM'); }
