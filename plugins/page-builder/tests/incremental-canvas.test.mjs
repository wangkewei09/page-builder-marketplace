import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const data = await mkdtemp(path.join(tmpdir(), 'page-builder-incremental-'));
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
const settle = async revision => { await page.waitForFunction(r => document.querySelector('#revision-badge')?.textContent === `Revision ${r}`, revision); model = await saved(); };
const operate = async operations => { model = (await api(`/api/pages/${model.pageId}/operations`, { expectedRevision: model.revision, operations })).page; await settle(model.revision); };
const shell = id => page.locator(`[data-node-id="${id}"]`);
try {
  model = (await api('/api/pages', { name: '局部更新验收' })).page;
  model = (await api(`/api/pages/${model.pageId}/operations`, { expectedRevision: model.revision, operations: [
    { type: 'add', parentId: model.root.id, node: { kind: 'component', componentId: 'C-21', props: { label: '项目名称' } } },
    { type: 'add', parentId: model.root.id, node: { kind: 'component', componentId: 'C-34', props: { title: '项目概览' } } },
    { type: 'add', parentId: model.root.id, node: { kind: 'layout', layout: 'column' } }
  ] })).page;
  await page.goto(`${url}/?page=${model.pageId}`); await page.locator('#startup-status').waitFor({ state: 'hidden' });
  const [input, card, layout] = model.root.children;
  await page.evaluate(() => {
    window.renderStats = { mounts: 0, destroys: 0, rootRemovals: 0, delay: 0 };
    window.originalCanvas = document.querySelector('#canvas > .node-shell');
    window.originalNodes = [...document.querySelectorAll('#canvas .component-shell')].map(shell => ({ id: shell.dataset.nodeId, shell, host: shell.firstElementChild, component: shell.firstElementChild.firstElementChild }));
    window.pageNameControl = document.querySelector('#page-name input');
    new MutationObserver(changes => { for (const c of changes) for (const removed of c.removedNodes) if (removed === window.originalCanvas) window.renderStats.rootRemovals++; }).observe(document.querySelector('#canvas'), { childList: true });
    const render = window.B2B.renderComponent;
    window.B2B.renderComponent = async (spec, target) => {
      const canvas = target.classList.contains('component-host');
      if (canvas && window.renderStats.delay) await new Promise(r => setTimeout(r, window.renderStats.delay));
      const result = await render(spec, target);
      if (canvas) { window.renderStats.mounts++; const destroy = result.instance.destroy; result.instance.destroy = function () { window.renderStats.destroys++; return destroy.call(this); }; }
      return result;
    };
  });
  const retained = async () => assert.ok(await page.evaluate(() => window.originalNodes.every(old => old.shell.isConnected && old.host === old.shell.firstElementChild && old.component === old.host.firstElementChild) && window.pageNameControl === document.querySelector('#page-name input') && window.originalCanvas === document.querySelector('#canvas > .node-shell')));
  await page.getByRole('button', { name: '预览', exact: true }).click();
  await shell(input.id).locator('input').fill('本地输入仍保留');
  await page.getByRole('button', { name: '返回编辑', exact: true }).click(); await retained();
  await shell(card.id).click();
  const toolbar = page.getByRole('toolbar', { name: '选中组件操作' });
  await toolbar.getByRole('button', { name: '复制', exact: true }).waitFor();
  assert.equal(await toolbar.locator('[data-ui-renderer-valid="true"]').count(), 4);
  await page.evaluate(() => { window.renderStats.delay = 500; });
  await toolbar.getByRole('button', { name: '复制', exact: true }).click();
  await page.waitForTimeout(150); await retained();
  await settle(model.revision + 1); await retained();
  const copy = model.root.children.find(n => ![input.id, card.id, layout.id].includes(n.id));
  assert.ok(copy && copy.id !== card.id); assert.deepEqual(copy.props, card.props);
  assert.equal(await page.evaluate(() => window.renderStats.mounts), 1, 'copy mounts only the new component');
  await shell(copy.id).click(); await toolbar.getByRole('button', { name: '删除', exact: true }).click(); await settle(model.revision + 1); await retained();
  assert.equal(await page.evaluate(() => window.renderStats.destroys), 1, 'delete destroys only its own component');
  await shell(card.id).click(); await toolbar.getByRole('button', { name: '上移', exact: true }).click(); await settle(model.revision + 1); await retained();
  assert.equal(model.root.children[0].id, card.id);
  assert.equal(await page.evaluate(() => window.renderStats.mounts), 1, 'move does not mount any canvas component');
  await operate([{ type: 'move', nodeId: input.id, parentId: layout.id, index: 0 }]); await retained();
  assert.equal(await shell(input.id).locator('input').inputValue(), '本地输入仍保留');
  // A layout copy copies its subtree through the authoritative operation, with new ids.
  await shell(layout.id).click({ position: { x: 4, y: 4 } });
  await toolbar.getByRole('button', { name: '复制', exact: true }).click(); await settle(model.revision + 1); await retained();
  const layoutCopy = model.root.children.find(n => n.kind === 'layout' && n.id !== layout.id);
  assert.notEqual(layoutCopy.children[0].id, input.id);
  await page.getByRole('button', { name: '撤销', exact: true }).click(); await settle(model.revision + 1); await retained();
  await page.getByRole('button', { name: '重做', exact: true }).click(); await settle(model.revision + 1); await retained();
  await page.evaluate(() => { window.renderStats.delay = 0; });
  await operate([{ type: 'updateProps', nodeId: card.id, props: { title: '只有这张卡片更新' } }]);
  assert.ok(await shell(card.id).getByText('只有这张卡片更新', { exact: true }).count());
  assert.ok(await page.evaluate(() => window.originalNodes[0].component === window.originalNodes[0].host.firstElementChild && window.originalNodes[0].shell.isConnected));
  assert.equal(await page.evaluate(() => window.renderStats.rootRemovals), 0);
  await shell(card.id).click(); await toolbar.getByRole('button', { name: '复制', exact: true }).waitFor();
  // A save response delayed after a newer click must not reset the target of the next add.
  let copying = false;
  await page.route('**/operations', async route => {
    const response = await route.fetch(); copying = true;
    await new Promise(resolve => setTimeout(resolve, 400)); await route.fulfill({ response });
  });
  const beforeRapid = model.revision;
  await toolbar.getByRole('button', { name: '复制', exact: true }).click();
  while (!copying) await new Promise(resolve => setTimeout(resolve, 10));
  await shell(layout.id).click({ position: { x: 4, y: 4 } });
  await page.getByLabel('添加标签').click();
  await settle(beforeRapid + 2); await page.unroute('**/operations');
  assert.ok(model.root.children.find(n => n.id === layout.id).children.some(n => n.componentId === 'C-42'), 'rapid select and add retain the newly selected parent');
  await shell(card.id).click(); await toolbar.getByRole('button', { name: '复制', exact: true }).waitFor();
  // Source foundation variables affect the editor shell without custom copies.
  const foundation = await page.evaluate(() => {
    const root = document.documentElement, before = getComputedStyle(document.querySelector('.node-actions')).borderRadius;
    root.style.setProperty('--b2b-radius-surface', '17px'); root.style.setProperty('--b2b-color-bg-page', 'rgb(241, 240, 238)');
    const after = getComputedStyle(document.querySelector('.node-actions')).borderRadius, bg = getComputedStyle(document.querySelector('.workspace')).backgroundColor;
    root.style.removeProperty('--b2b-radius-surface'); root.style.removeProperty('--b2b-color-bg-page');
    return { before, after, bg, font: getComputedStyle(document.documentElement).fontFamily, sourceFont: getComputedStyle(root).getPropertyValue('--b2b-font-sans').trim(), icons: [...document.querySelectorAll('.brand-mark .b2b-icon,.library-icon .b2b-icon,.node-actions .b2b-icon')].map(el => getComputedStyle(el).fontFamily) };
  });
  assert.equal(foundation.after, '17px'); assert.equal(foundation.bg, 'rgb(241, 240, 238)'); assert.ok(foundation.icons.length >= 10 && foundation.icons.every(font => font.includes('Material Symbols Outlined')));
  await page.screenshot({ path: '/tmp/page-builder-selection-toolbar.png' });
  await page.setViewportSize({ width: 520, height: 760 }); await shell(card.id).scrollIntoViewIfNeeded();
  const bounds = await toolbar.boundingBox(); assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= 520);
  await page.screenshot({ path: '/tmp/page-builder-selection-toolbar-narrow.png' });
  // Stage failure, superseded renders, and reset must dispose only their own pending instances.
  const lifecycle = await page.evaluate(async () => {
    const { createCanvasRenderer } = await import('./canvas-renderer.js');
    const target = document.createElement('div'); document.body.append(target);
    const disposed = [], pending = new Map();
    const renderer = createCanvasRenderer({
      renderComponent: async ({ props }, host) => {
        if (props.label === 'bad') throw Error('injected render failure');
        if (props.label.startsWith('slow')) await new Promise(resolve => pending.set(props.label, resolve));
        host.textContent = props.label;
        return { audit: { valid: true }, instance: { destroyed: false, destroy() { this.destroyed = true; disposed.push(props.label); host.remove(); } } };
      }, beforeCommit() {}, onSelect() {}, onDragStart() {}, labelFor: () => '布局'
    });
    const schema = label => ({ id: 'r', kind: 'layout', layout: 'column', gap: 'medium', children: [{ id: 'n', kind: 'component', componentId: 'C-02', props: { label } }] });
    await renderer.render(schema('initial'), target); const root = target.firstElementChild;
    await renderer.render(schema('bad'), target).catch(() => {});
    const failureKeptOld = target.textContent === 'initial' && target.firstElementChild === root;
    const old = renderer.render(schema('slow-old'), target);
    await renderer.render(schema('latest'), target); pending.get('slow-old')(); await old;
    const latestWon = target.textContent === 'latest';
    const late = renderer.render(schema('slow-reset'), target); renderer.reset(); pending.get('slow-reset')(); await late;
    const cleared = target.childElementCount === 0; target.remove();
    return { failureKeptOld, latestWon, cleared, disposed };
  });
  assert.equal(lifecycle.failureKeptOld, true); assert.equal(lifecycle.latestWon, true); assert.equal(lifecycle.cleared, true);
  assert.deepEqual(lifecycle.disposed.sort(), ['initial', 'latest', 'slow-old', 'slow-reset'].sort());
  assert.deepEqual(errors, []);
  const result = { incremental: 'pass', lateSavePreservesNewSelection: true, lifecycle, unchangedInstancesAndLocalInputRetained: true, newComponentOnlyOnCopy: true, noMountOnMove: true, noBlankCanvasDuringDelayedMount: true, layoutCopyNewIds: true, undoRedo: true, foundationAndIconsFromSource: true, narrowToolbarVisible: true, stats: await page.evaluate(() => window.renderStats), errors };
  await writeFile('/tmp/page-builder-incremental-result.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} catch (error) { await page.screenshot({ path: '/tmp/page-builder-incremental-failure.png' }); console.error({ errors, body: await page.locator('body').innerText() }); throw error; }
finally { await browser.close(); child.kill('SIGTERM'); }
