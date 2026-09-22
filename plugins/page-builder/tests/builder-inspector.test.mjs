import { editInline, openInline } from "./inline-helpers.mjs";
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

// Flow: old page -> manual metadata reload -> source-owned Chinese inspector ->
// edits / conditions / source-only update -> bad candidate preserves the page.
const root = await mkdtemp(path.join(tmpdir(), 'builder-inspector-'));
const source = path.join(root, 'source'); await cp('dist/ui/vendor/b2b', source, { recursive: true });
const built = await readFile('dist/server.js');
const contractFile = path.join(source, 'components/runtime/builder-contract.json');
const contract = { schemaVersion: 1, libraryId: 'b2b', components: {
  'C-02': {
    label: '测试按钮', description: '<img src=x onerror=alert(1)>只是文本',
    groups: [{ id: 'content', label: '按钮内容' }, { id: 'look', label: '按钮外观' }],
    fields: {
      label: { label: '操作名称', group: 'content', control: 'text' },
      variant: { label: '按钮风格', group: 'look', control: 'select', options: [{ value: 'primary', label: '强调操作' }, { value: 'secondary-gray', label: '普通操作' }] },
      icon: { label: '强调图标', group: 'look', visibleWhen: [{ property: 'variant', values: ['primary'] }] },
      loading: { label: '忙碌状态', control: 'switch', enabledWhen: [{ property: 'disabled', values: [false] }] }
    }
  },
  'C-42': { fields: {
    text: { label: '标签文字', control: 'text' },
    checkable: { label: '允许勾选', control: 'switch' },
    closable: { label: '允许关闭', control: 'switch' },
    avatar: { label: '头像简称', visibleWhen: [{ property: 'type', values: ['avatar'] }] }
  }, transitions: [{ property: 'checkable', value: true, set: { closable: false }, reset: ['checked'] }] }
} };
await writeFile(contractFile, JSON.stringify(contract));
const child = spawn(process.execPath, ['dist/standalone.js'], { env: { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(root, 'pages'), PAGE_BUILDER_LIBRARY_DIR: path.join(root, 'libraries'), PAGE_BUILDER_EXPORT_DIR: path.join(root, 'exports') }, stdio: ['ignore', 'pipe', 'inherit'] });
const url = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(Error('server timeout')), 20000); let text = '';
  child.stdout.on('data', data => { text += data; const match = text.match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timer); resolve(match[0]); } });
  child.once('exit', code => { clearTimeout(timer); reject(Error(`server exit ${code}`)); });
});
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [], expectedFailures = []; let rejectingCandidate = false; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') { if (rejectingCandidate && message.location().url.endsWith('/api/libraries/refresh') && message.text().includes('400')) expectedFailures.push(message.text()); else errors.push(message.text()); } });
const api = async (route, data) => { const response = await fetch(url + route, data ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) } : {}); const result = await response.json(); assert.ok(response.ok, JSON.stringify(result)); return result; };
try {
  await page.goto(url); assert.equal(await page.title(), '页面搭建器');
  await page.getByLabel('添加基础按钮').click(); await page.getByText('基础按钮已添加', { exact: true }).waitFor();
  await page.locator('.component-shell').click();
  const pageId = (await api('/api/pages')).pages[0].pageId;
  const getPage = async () => (await api('/api/pages/' + pageId)).page;
  const original = await getPage();
  await page.getByText('组件库来源与更新', { exact: true }).click();
  await page.locator('#library-source input').fill(source);
  await page.getByRole('button', { name: '刷新并重载组件', exact: true }).click();
  // Playwright fill does not wait for an inert input to become focusable.
  const group = name => page.locator('#inspector:not([inert])').getByRole('group', { name, exact: true });
  await page.getByRole('button', { name: '编辑操作名称', exact: true }).waitFor();
  assert.deepEqual((await getPage()).root, original.root, 'metadata refresh must not reset existing props');
  assert.equal(await page.locator('.library-item img').count(), 0, 'metadata is text, never HTML');
  assert.equal(await page.getByRole('heading', { name: '按钮内容' }).count(), 0, 'inline-only group does not leave an empty inspector heading');
  assert.equal(await group('强调图标').count(), 0);
  await group('按钮风格').locator('[data-select-trigger]').click();
  await group('按钮风格').getByRole('option', { name: '强调操作', exact: true }).click();
  await group('强调图标').waitFor();
  assert.equal((await getPage()).root.children[0].props.variant, 'primary');
  await editInline(page, '操作名称', '保留的用户文案');
  await page.locator('#canvas').getByText('保留的用户文案', { exact: true }).waitFor();
  await page.locator('#inspector').getByText('禁用', { exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#inspector [data-property="loading"] input')?.disabled);
  await page.locator('#inspector').getByText('禁用', { exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#inspector [data-property="loading"] input')?.disabled === false);
  const beforeMetadata = await getPage();
  contract.components['C-02'].fields.label.label = '更新后的名称';
  contract.components['C-02'].fields.variant.options[0].label = '新的强调操作';
  await writeFile(contractFile, JSON.stringify(contract));
  const schemaFile = path.join(source, 'components/runtime/api-schema.js');
  await writeFile(schemaFile, await readFile(schemaFile, 'utf8') + '\nwindow.B2B.components.apiSchemas["C-02"].props.sourceNote={type:"string",default:"新增默认值"};\n');
  // New API fields appear without adding a matching fields entry.
  await page.getByText('组件库来源与更新', { exact: true }).click();
  await page.getByRole('button', { name: '刷新并重载组件', exact: true }).click();
  await page.getByRole('button', { name: '编辑更新后的名称', exact: true }).waitFor();
  assert.equal(await group('sourceNote').locator('input').inputValue(), '新增默认值');
  assert.equal(await (await openInline(page, '更新后的名称')).inputValue(), '保留的用户文案'); await page.locator('.inline-editor input').press('Escape');
  assert.deepEqual((await getPage()).root, beforeMetadata.root);
  await group('按钮风格').locator('[data-select-trigger]').getByText('新的强调操作', { exact: true }).waitFor();
  const beforeBad = await getPage();
  rejectingCandidate = true;
  await writeFile(contractFile, JSON.stringify({ ...contract, schemaVersion: 9 }));
  await page.getByText('组件库来源与更新', { exact: true }).click();
  await page.getByRole('button', { name: '刷新并重载组件', exact: true }).click();
  await page.locator('#library-update-status').filter({ hasText: '仅支持版本 1' }).waitFor();
  assert.deepEqual(await getPage(), beforeBad);
  rejectingCandidate = false; assert.equal(expectedFailures.length, 1);
  assert.equal((await api('/api/libraries')).currentSnapshotId, beforeBad.componentLibrary.snapshotId);
  await writeFile(contractFile, JSON.stringify(contract));
  await page.getByLabel('添加输入框').click(); await page.getByText('输入框已添加', { exact: true }).waitFor();
  await page.locator('.component-shell').last().click();
  await page.getByText('其他设置', { exact: true }).click();
  const draftField = page.locator('#inspector details').getByRole('group', { name: '前置图标', exact: true }).locator('input');
  await draftField.fill('search');
  const beforeDraft = await getPage();
  await page.getByLabel('添加标签').click();
  assert.deepEqual(await getPage(), beforeDraft, 'unapplied settings must block unrelated writes');
  assert.equal(await draftField.inputValue(), 'search');
  await page.getByRole('button', { name: '取消修改', exact: true }).click();
  await page.getByLabel('添加标签').click(); await page.getByText('标签已添加', { exact: true }).waitFor();
  await page.locator('.component-shell').last().click();
  await page.locator('#inspector').getByText('允许关闭', { exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#canvas .b2b-tag') || document.querySelector('#inspector [data-property="checkable"]'));
  // Wait for the save/re-render before the next interaction.
  await page.waitForTimeout(300);
  await page.locator('#inspector').getByText('允许勾选', { exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#inspector [data-property="closable"] input')?.checked === false);
  const tag = (await getPage()).root.children.at(-1);
  assert.equal(tag.props.checkable, true); assert.equal(tag.props.closable, false); assert.equal(tag.props.text, '标签');
  // Legacy content-aware avatar conversion remains available if no transition is declared.
  await page.locator('#inspector').getByText('允许勾选', { exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#inspector [data-property="checkable"] input')?.checked === false);
  await group('类型').locator('[data-select-trigger]').click();
  await group('类型').getByRole('option', { name: '头像标签', exact: true }).click();
  await group('头像简称').waitFor();
  assert.ok((await getPage()).root.children.at(-1).props.avatar);
  assert.equal(await page.locator('.render-error,.ui-control-error').count(), 0);
  await page.screenshot({ path: '/tmp/page-builder-protocol-desktop.png' });
  await page.setViewportSize({ width: 520, height: 760 });
  await page.screenshot({ path: '/tmp/page-builder-protocol-narrow.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(await readFile('dist/server.js'), built, 'source-only changes must not rebuild the plugin');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ url, title: await page.title(), sourceMetadata: true, ChineseOptionsPreserveRawValues: true, conditionalFields: true, declaredTransition: true, legacyAvatarTransition: true, unknownApiFieldVisible: true, oldPageContentPreserved: true, invalidContractPreservesPage: true, pluginBuildUnchanged: true, errors, screenshots: ['/tmp/page-builder-protocol-desktop.png','/tmp/page-builder-protocol-narrow.png'] }));
} catch (error) {
  console.error(JSON.stringify({ inspector: await page.locator('#inspector').innerText(), errors, toast: await page.locator('#toast').innerText().catch(() => ''), root }));
  await page.screenshot({ path: '/tmp/page-builder-protocol-failure.png' }); throw error;
} finally { await browser.close(); child.kill('SIGTERM'); }
