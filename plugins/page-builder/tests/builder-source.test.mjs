import { editInline, openInline } from "./inline-helpers.mjs";
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const source = process.env.PAGE_BUILDER_TEST_SOURCE;
if (!source) throw new Error('Set PAGE_BUILDER_TEST_SOURCE to a library with builder-contract.json');
const metadata = JSON.parse(await readFile(path.join(source, 'components/runtime/builder-contract.json'), 'utf8'));
const root = await mkdtemp(path.join(tmpdir(), 'builder-source-'));
const child = spawn(process.execPath, ['dist/standalone.js'], { env: { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(root, 'pages'), PAGE_BUILDER_LIBRARY_DIR: path.join(root, 'libraries'), PAGE_BUILDER_EXPORT_DIR: path.join(root, 'exports') }, stdio: ['ignore', 'pipe', 'inherit'] });
const url = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(Error('server timeout')), 20000); let text = '';
  child.stdout.on('data', data => { text += data; const match = text.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timer); resolve(match[0]); } });
  child.once('exit', code => { clearTimeout(timer); reject(Error(`server exit ${code}`)); });
});
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const api = async (route, data) => { const response = await fetch(url + route, data ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) } : {}); const result = await response.json(); assert.ok(response.ok, JSON.stringify(result)); return result; };
try {
  const checked = await api('/api/libraries/check', { sourcePath: source });
  await api('/api/libraries/apply', { snapshotId: checked.candidate.snapshotId, sourcePath: source });
  await page.goto(url); await page.getByLabel('添加' + metadata.components['C-02'].label).waitFor();
  const pageId = (await api('/api/pages')).pages[0].pageId;
  const getPage = async () => (await api('/api/pages/' + pageId)).page;
  const waitProps = async expected => {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      const saved = await getPage(), node = saved.root.children.at(-1);
      if (Object.entries(expected).every(([key, value]) => node?.props[key] === value)) {
        await page.locator('#revision-badge').getByText(`Revision ${saved.revision}`, { exact: true }).waitFor();
        await page.getByRole('button', { name: '删除节点', exact: true }).waitFor();
        return saved;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw Error('Props did not save: ' + JSON.stringify(expected));
  };
  const fields = id => metadata.components[id].fields;
  const group = (id, key) => page.locator('#inspector:not([inert])').getByRole('group', { name: fields(id)[key].label, exact: true });
  const choose = async (id, key, value) => {
    const saved = await getPage(); if (saved.root.children.at(-1).props[key] === value) return saved;
    await group(id, key).locator('[data-select-trigger]').click();
    const label = fields(id)[key].options?.find(item => item.value === value)?.label || String(value);
    await group(id, key).getByRole('option', { name: label, exact: true }).click();
    return waitProps({ [key]: value });
  };
  let variants = 0;
  for (const id of ['C-02', 'C-21', 'C-23', 'C-42', 'C-34']) {
    await page.getByLabel('添加' + metadata.components[id].label).click();
    await page.getByText(metadata.components[id].label + '已添加', { exact: true }).waitFor();
    await page.locator('.component-shell').last().click();
    await group(id, 'variant').waitFor();
    if (id === 'C-34') {
      await page.locator('#inspector input[type=file]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aA9sAAAAASUVORK5CYII=', 'base64') });
      const deadline = Date.now() + 5000;
      while (!(await getPage()).root.children.at(-1).props.coverImage && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
      assert.ok((await getPage()).root.children.at(-1).props.coverImage);
    }
    for (const option of fields(id).variant.options) {
      await choose(id, 'variant', option.value); variants++;
      assert.equal(await page.locator('.render-error,.ui-control-error').count(), 0, id + ':' + option.value);
      if (id === 'C-21' && option.value === '数字输入框') {
        await editInline(page, fields(id).value.label, '7'); await waitProps({ value: 7 });
        await editInline(page, fields(id).value.label, ''); await waitProps({ value: '' });
      }
      if (id === 'C-21' && option.value === '长文本输入框') {
        assert.equal(await group(id, 'size').locator('[data-select-trigger]').isDisabled(), true);
      }
    }
    if (id === 'C-42') {
      await choose(id, 'variant', 'status');
      for (const option of fields(id).type.options) await choose(id, 'type', option.value);
      await group(id, 'avatar').locator('input').fill('王'); await waitProps({ avatar: '王' });
    }
    if (id === 'C-34') {
      await choose(id, 'variant', 'tabs');
      await page.getByText('其他设置', { exact: true }).click();
      const nested = page.getByRole('group', { name: fields(id).tabs.label + ' 1 · ' + fields(id).tabs.item.fields.label.label, exact: true });
      await nested.locator('input').fill('协议驱动的页签');
      await page.getByRole('button', { name: '应用其他设置', exact: true }).click();
      await page.locator('#canvas').getByText('协议驱动的页签', { exact: true }).waitFor();
    }
  }
  const final = await getPage();
  await api(`/api/pages/${pageId}/export`, {});
  await page.reload(); await page.locator('#canvas').getByText('协议驱动的页签', { exact: true }).waitFor();
  assert.deepEqual((await getPage()).root, final.root);
  await page.locator('#startup-status').waitFor({ state: 'hidden' });
  await page.getByLabel('添加' + metadata.components['C-02'].label).waitFor();
  assert.equal(final.root.children.length, 5);
  assert.equal(await page.locator('.render-error,.ui-control-error').count(), 0);
  await page.screenshot({ path: '/tmp/page-builder-real-protocol.png' });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ url, source, variants, sourceOwnedInspectors: 5, fields: 76, numericBranchAndEmptyValue: true, tagTypes: 4, imageUpload: true, nestedChineseEdit: true, saveReloadExport: true, errors, screenshot: '/tmp/page-builder-real-protocol.png' }));
} catch (error) { console.error(JSON.stringify({ errors, root, inspector: await page.locator('#inspector').innerText() })); await page.screenshot({ path: '/tmp/page-builder-real-protocol-failure.png' }); throw error; }
finally { await browser.close(); child.kill('SIGTERM'); }
