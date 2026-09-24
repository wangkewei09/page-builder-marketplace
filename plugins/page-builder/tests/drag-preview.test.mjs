import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

// Real mouse drag -> visible insertion slot and animated reflow -> one saved operation.
// Every page, library snapshot and export is isolated from the user's workspace.
const data = await mkdtemp(path.join(tmpdir(), 'page-builder-drag-'));
const child = spawn(process.execPath, ['dist/standalone.js'], { env: { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(data, 'pages'), PAGE_BUILDER_LIBRARY_DIR: path.join(data, 'libraries'), PAGE_BUILDER_EXPORT_DIR: path.join(data, 'exports') }, stdio: ['ignore', 'pipe', 'inherit'] });
const url = await new Promise((resolve, reject) => {
  let output = ''; const timer = setTimeout(() => reject(Error('server timeout')), 20000);
  child.stdout.on('data', chunk => { output += chunk; const match = output.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timer); resolve(match[0]); } });
  child.once('exit', code => { clearTimeout(timer); reject(Error(`server exit ${code}`)); });
});
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [], expectedErrors = [], evidence = []; let expectedFailure = false, pageId;
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() !== 'error') return;
  const text = message.text();
  const injected = expectedFailure && (/server responded with a status of (409|503)/.test(text) || /^Error: (页面已更新到 revision|保存失败测试)/.test(text));
  (injected ? expectedErrors : errors).push(text);
});
const api = async (route, payload) => {
  const response = await fetch(url + route, payload ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) } : {});
  const result = await response.json(); assert.ok(response.ok, JSON.stringify(result)); return result;
};
const saved = async () => (await api('/api/pages/' + pageId)).page;
const shell = id => page.locator(`[data-node-id="${id}"]`);
const palette = name => page.locator('.library-item').filter({ has: page.locator('strong', { hasText: name }) });
const box = locator => locator.boundingBox();
const waitSaved = async revision => {
  await page.waitForFunction(revision => document.querySelector('#revision-badge')?.textContent === `Revision ${revision}`, revision);
  await page.locator('.drop-placeholder').waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.querySelector('#save-state')?.textContent === '已保存');
  return saved();
};
const open = async model => {
  pageId = model.pageId; await page.goto(`${url}/?page=${pageId}`);
  await page.locator('#startup-status').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.querySelector('#provider-status')?.textContent.includes('真实 B2B Renderer'));
  await page.evaluate(() => {
    window.dragEvidence = []; window.dragEvents = [];
    for (const name of ['dragstart', 'drop', 'dragend', 'blur']) window.addEventListener(name, event => window.dragEvents.push({ name, target: event.target.className, x: event.clientX, y: event.clientY }), true);
    document.addEventListener('dragover', () => {
      const slot = document.querySelector('.drop-placeholder');
      if (slot) window.dragEvidence.push({ index: slot.dataset.index, parentId: slot.dataset.parentId, animations: document.getAnimations().filter(a => a.effect?.target.matches('.node-shell')).length });
    });
  });
};
const begin = async locator => {
  await locator.scrollIntoViewIfNeeded(); const r = await box(locator);
  await page.mouse.move(r.x + Math.min(24, r.width / 2), r.y + r.height / 2); await page.mouse.down();
  await page.mouse.move(r.x + Math.min(32, r.width / 2 + 8), r.y + r.height / 2 + 8, { steps: 4 });
};
const hover = async (x, y) => { await page.mouse.move(x, y, { steps: 10 }); await page.mouse.move(x + 1, y + 1); };
const slot = async (parentId, index) => {
  const placeholder = page.locator('.drop-placeholder'); await placeholder.waitFor();
  assert.equal(await placeholder.getAttribute('data-parent-id'), parentId);
  assert.equal(await placeholder.getAttribute('data-index'), String(index));
};
const create = async (name, nodes = []) => {
  let model = (await api('/api/pages', { name })).page;
  if (nodes.length) model = (await api(`/api/pages/${model.pageId}/operations`, { expectedRevision: model.revision, operations: nodes.map(node => ({ type: 'add', parentId: model.root.id, node })) })).page;
  await open(model); return model;
};
const button = label => ({ kind: 'component', componentId: 'C-02', props: { label } });

try {
  let model = await create('拖拽位置验收', [button('提交申请'), { kind: 'component', componentId: 'C-21', props: { placeholder: '请输入项目名称' } }, { kind: 'component', componentId: 'C-34', props: { title: '项目概览', body: '在这里查看项目进度和关键事项。' } }]);
  const original = structuredClone(model), cardId = model.root.children[2].id;
  const before = await box(shell(cardId));
  await begin(palette('基础按钮')); await hover(before.x + 35, before.y + 3);
  await slot(model.root.id, 2);
  await page.waitForTimeout(250);
  assert.ok((await box(shell(cardId))).y >= before.y + 64, 'existing card must make real space for the placeholder');
  assert.equal((await saved()).revision, model.revision, 'preview must not write page data');
  for (let i = 0; i < 4; i++) { await page.mouse.move(before.x + 35 + i % 2, before.y + 4); await slot(model.root.id, 2); }
  assert.ok(await page.evaluate(() => window.dragEvidence.some(entry => entry.animations > 0)), 'reflow must animate');
  await page.screenshot({ path: '/tmp/page-builder-drag-placeholder.png' });
  await page.mouse.up(); model = await waitSaved(model.revision + 1);
  assert.deepEqual(model.root.children.map(n => n.componentId), ['C-02', 'C-21', 'C-02', 'C-34']);
  assert.equal(model.root.children[3].id, cardId);
  evidence.push('middle insertion: visible slot, real space, animation, stable hover, one revision');

  // Move up then down: the domain index is measured after removing the source.
  const first = await box(shell(model.root.children[0].id));
  await begin(shell(cardId)); await hover(first.x + 30, first.y + 3); await slot(model.root.id, 0);
  await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children[0].id, cardId);
  const tail = await box(shell(model.root.children.at(-1).id));
  await begin(shell(cardId)); await hover(tail.x + 30, tail.y + tail.height + 40); await slot(model.root.id, 3);
  await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children.at(-1).id, cardId);
  evidence.push('existing component moves in both directions without duplicate nodes');

  // Escape and dropping outside restore visual order without persistence/history writes.
  const cancelBefore = await saved(); const cancelBox = await box(shell(cardId));
  await begin(palette('标签')); await hover(cancelBox.x + 30, cancelBox.y + 3); await slot(model.root.id, 3);
  await page.keyboard.press('Escape'); await page.mouse.up(); await page.locator('.drop-placeholder').waitFor({ state: 'detached' });
  await page.waitForTimeout(220); assert.equal((await box(shell(cardId))).y, cancelBox.y); assert.deepEqual(await saved(), cancelBefore);
  await begin(shell(cardId)); await hover(first.x + 30, first.y + 3); await page.mouse.move(500, 25, { steps: 8 }); await page.mouse.up();
  assert.equal(await page.locator('.drop-placeholder,.is-drag-source,.is-drag-origin,.drag-ghost').count(), 0); assert.deepEqual(await saved(), cancelBefore);
  evidence.push('Escape and outside drop restore the page, no write');

  // No-op move does not create a history entry; undo/redo and reopen preserve the drop.
  const own = await box(shell(cardId)); await begin(shell(cardId)); await hover(own.x + 30, own.y + own.height / 2); await slot(model.root.id, 3); await page.mouse.up();
  assert.deepEqual(await saved(), cancelBefore);
  await page.getByRole('button', { name: '撤销', exact: true }).click(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children[0].id, cardId);
  await page.getByRole('button', { name: '重做', exact: true }).click(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children.at(-1).id, cardId);
  await open(model); assert.deepEqual((await saved()).root, model.root);
  assert.equal(await page.locator('.drop-placeholder').count(), 0);
  evidence.push('no-op, undo/redo, reopen');

  // A concurrent AI write must reject the stale drop and preserve the newer page.
  const stale = await saved(), targetBox = await box(shell(cardId));
  await begin(palette('标签')); await hover(targetBox.x + 30, targetBox.y + 3); await slot(stale.root.id, 3);
  const changed = (await api(`/api/pages/${pageId}/operations`, { expectedRevision: stale.revision, operations: [{ type: 'rename', name: '并发更新保留' }] })).page;
  await page.waitForTimeout(900); await slot(stale.root.id, 3);
  expectedFailure = true; await page.mouse.move(targetBox.x + 32, targetBox.y + 5); await page.mouse.up();
  await page.waitForFunction(revision => document.querySelector('#revision-badge')?.textContent === `Revision ${revision}`, changed.revision);
  await page.waitForFunction(() => document.querySelector('#save-state')?.textContent.includes('保存失败'));
  assert.deepEqual(await saved(), changed); assert.equal(await page.locator('.drop-placeholder,.is-drag-source').count(), 0);
  expectedFailure = false;
  evidence.push('concurrent update rejects stale drop, preserves newer content');

  // Empty layouts, nested moves and horizontal/grid placement use the same operation.
  for (const layout of ['column', 'row', 'columns']) {
    model = await create(`${layout} 布局`, [{ kind: 'layout', layout, ...(layout === 'columns' ? { columns: 2 } : {}) }, button('容器外按钮')]);
    const parentId = model.root.children[0].id, outsideId = model.root.children[1].id;
    const empty = await box(shell(parentId)); await begin(palette('标签')); await hover(empty.x + empty.width / 2, empty.y + empty.height / 2); await slot(parentId, 0);
    await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children[0].children[0].componentId, 'C-42');
    const childBox = await box(shell(model.root.children[0].children[0].id));
    await begin(shell(outsideId)); await hover(childBox.x + Math.min(24, childBox.width / 2), childBox.y + Math.min(15, childBox.height / 2)); await slot(parentId, 0);
    await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children.length, 1); assert.equal(model.root.children[0].children[0].id, outsideId);
    const parentBox = await box(shell(parentId)); await begin(shell(outsideId)); await hover(parentBox.x + 20, parentBox.y + parentBox.height + 35); await slot(model.root.id, 1);
    await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children[1].id, outsideId);
  }
  evidence.push('empty column/row/grid, entering a nested layout and moving back out');

  for (const layout of ['row', 'columns']) {
    model = await create('多行排列', Array.from({ length: 6 }, (_, i) => button(`第 ${i + 1} 项操作设置`)));
    model = (await api(`/api/pages/${pageId}/operations`, { expectedRevision: model.revision, operations: [{ type: 'updateLayout', nodeId: model.root.id, layout, columns: 2 }] })).page;
    await open(model); await page.getByRole('tab', { name: '移动', exact: true }).click();
    await page.waitForTimeout(250);
    const last = await box(shell(model.root.children[5].id));
    assert.ok(last.y > (await box(shell(model.root.children[0].id))).y, 'fixture must wrap across rows');
    await begin(palette('标签')); await hover(last.x + 6, last.y + last.height / 2); await slot(model.root.id, 5);
    await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children[5].componentId, 'C-42');
  }
  evidence.push('wrapped horizontal layout and multi-row column grid insertion');

  model = await create('长页面自动滚动', Array.from({ length: 22 }, (_, i) => button(`组件 ${i + 1}`)));
  const scroll = await box(page.locator('.canvas-scroll'));
  await begin(palette('基础按钮')); await hover(scroll.x + scroll.width / 2, scroll.y + scroll.height - 10);
  await page.locator('.drop-placeholder').waitFor();
  await page.waitForFunction(() => document.querySelector('.canvas-scroll').scrollTop > 180);
  assert.equal((await saved()).revision, model.revision);
  await page.keyboard.press('Escape'); await page.mouse.up(); assert.equal(await page.locator('.drop-placeholder').count(), 0);
  assert.equal(await page.locator('body.is-canvas-dragging,.drag-ghost').count(), 0, 'drag session must end when canceled');
  const stopped = await page.locator('.canvas-scroll').evaluate(el => el.scrollTop);
  await page.waitForTimeout(200); assert.equal(await page.locator('.canvas-scroll').evaluate(el => el.scrollTop), stopped);
  evidence.push('edge autoscroll runs only during drag and stops on cancel');

  model = await create('保存失败回退', [button('保留原内容')]);
  const failedDropBefore = await saved(), failureTarget = await box(shell(model.root.children[0].id));
  await page.route('**/operations', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'TEST_FAILURE', message: '保存失败测试' } }) }));
  await begin(palette('标签')); await hover(failureTarget.x + 30, failureTarget.y + 3); await slot(model.root.id, 0);
  expectedFailure = true; await page.mouse.up(); await page.getByText('保存失败测试', { exact: true }).waitFor();
  await page.locator('.drop-placeholder').waitFor({ state: 'detached' }); assert.deepEqual(await saved(), failedDropBefore);
  expectedFailure = false; await page.unroute('**/operations');
  await begin(palette('标签')); await hover(failureTarget.x + 30, failureTarget.y + 3); await slot(model.root.id, 0);
  await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children[0].componentId, 'C-42');
  evidence.push('failed save preserves content and supports another drag');

  // Narrow panel and reduced-motion mode keep a usable full-width placeholder.
  model = await create('窄面板', [button('第一项'), button('第二项')]);
  await page.setViewportSize({ width: 520, height: 760 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await palette('基础按钮').scrollIntoViewIfNeeded();
  const narrow = await box(shell(model.root.children[1].id)); await begin(palette('基础按钮')); await hover(narrow.x + 30, narrow.y + 3); await slot(model.root.id, 1);
  assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.effect?.target.matches('.node-shell,.drop-placeholder')).length), 0);
  const placeholder = await box(page.locator('.drop-placeholder')); assert.ok(placeholder.width > 200 && placeholder.x >= 0 && placeholder.x + placeholder.width <= 520);
  await page.screenshot({ path: '/tmp/page-builder-drag-narrow.png' });
  await page.mouse.up(); model = await waitSaved(model.revision + 1); assert.equal(model.root.children.length, 3);
  evidence.push('520px narrow panel and reduced motion');

  assert.equal(await page.locator('.render-error,.ui-control-error').count(), 0); assert.deepEqual(errors, []);
  const result = { url, title: await page.title(), viewports: ['1440x1000', '520x760'], browser: await browser.version(), checks: evidence, errors, expectedErrors, baseline: original.revision };
  await writeFile('/tmp/page-builder-drag-result.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} catch (error) {
  await page.screenshot({ path: '/tmp/page-builder-drag-failure.png' });
  console.error(JSON.stringify({ url, evidence, errors, expectedErrors, drag: await page.evaluate(() => window.dragEvidence?.slice(-8)), dragEvents: await page.evaluate(() => window.dragEvents) })); throw error;
} finally { await browser.close(); child.kill('SIGTERM'); }
