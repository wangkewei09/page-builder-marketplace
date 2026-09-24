import { openInline } from "./inline-helpers.mjs";
import { strict as assert } from 'node:assert';
import { mkdtemp, readFile, writeFile, mkdir, cp, rm, rename, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { chromium } from 'playwright-core';

const directory = await mkdtemp(path.join(tmpdir(), 'page-builder-projects-'));
const clients = [];
async function connect(name, isolated = name) {
  const client = new Client({ name, version: '1' }); clients.push(client);
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ['dist/server.js'], env: { ...process.env, PAGE_BUILDER_DATA_DIR: path.join(directory, isolated, 'pages'), PAGE_BUILDER_LIBRARY_DIR: path.join(directory, isolated, 'libraries'), PAGE_BUILDER_PROJECTS_DIR: path.join(directory, isolated, 'registry'), PAGE_BUILDER_EXPORT_DIR: path.join(directory, isolated, 'exports') } })); return client;
}
const client = await connect('primary');
async function call(name, args = {}, connection = client) {
  const result = await connection.callTool({ name, arguments: args });
  if (result.isError) throw Object.assign(new Error(JSON.stringify(result.content)), { result });
  return result.structuredContent;
}
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const legacy = (await call('page_create', { name: '保留历史页面' })).page;
  const customSource = path.join(directory, 'custom-source');
  await cp('vendor/b2b', customSource, { recursive: true });
  // Change only inert bytes so the project pins a non-bundled, portable snapshot.
  const candidates = await import('node:fs/promises');
  const cssFiles = await candidates.readdir(path.join(customSource, 'styles'));
  const cssFile = path.join(customSource, 'styles', cssFiles.find(file => file.endsWith('.css')));
  await writeFile(cssFile, (await readFile(cssFile, 'utf8')) + '\n/* portable project fixture */\n');
  const checked = await call('component_library_check', { sourcePath: customSource });
  await call('component_library_apply', { snapshotId: checked.candidate.snapshotId, sourcePath: customSource });
  const opened = await call('page_builder_open');
  const resource = await client.readResource({ uri: 'ui://page-builder-development/editor-v5.html' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  let delayNextSave = false, failNextResources = false;
  // Only the OS-dialog boundary is simulated; every project read/write uses real MCP.
  const choices = [], choiceJobs = new Map(); let choiceNumber = 0;
  const chooserCalls = [];
  async function choose(group, result) {
    choices.push(result);
    await group.getByRole('button', { name: '选择文件夹', exact: true }).click();
    await frame.locator('#project-home[data-ready="true"]').waitFor();
  }
  await page.exposeFunction('mcpRequest', async message => {
    if (delayNextSave && message.method === 'tools/call' && message.params.name === 'page_apply_operations') { delayNextSave = false; await new Promise(resolve => setTimeout(resolve, 350)); }
    if (message.method === 'tools/call' && message.params.name.startsWith('project_') && message.params.name.includes('directory')) {
      const { name, arguments: args } = message.params; chooserCalls.push({ name, args });
      let result;
      if (name === 'project_choose_directory') {
        assert.ok(choices.length, 'unexpected system chooser request');
        const requestId = 'choice-' + ++choiceNumber;
        choiceJobs.set(requestId, { requestId, ...choices.shift() }); result = { requestId, status: 'pending' };
      } else if (name === 'project_directory_choice') result = choiceJobs.get(args.requestId);
      else result = { requestId: args.requestId, status: 'cancelled' };
      return { structuredContent: result, content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
    if (message.method === 'tools/call') return client.callTool(message.params);
    if (message.method === 'resources/read') { if (failNextResources) { failNextResources = false; throw new Error('模拟组件资源读取失败'); } return client.readResource(message.params); }
    return {};
  });
  await page.setContent(`<script>window.context=null;addEventListener('message',async e=>{const m=e.data;if(!m||m.jsonrpc!=='2.0'||m.id===undefined)return;if(m.method==='ui/update-model-context')window.context=m.params.structuredContent?.pageBuilderSelection||null;try{const result=m.method==='ui/initialize'?{protocolVersion:'2026-01-26',hostInfo:{name:'projects-test',version:'1'},hostCapabilities:{serverTools:{},serverResources:{},updateModelContext:{text:{},structuredContent:{}}},hostContext:{locale:'zh-CN',platform:'desktop'}}:await window.mcpRequest(m);e.source.postMessage({jsonrpc:'2.0',id:m.id,result},'*')}catch(error){e.source.postMessage({jsonrpc:'2.0',id:m.id,error:{code:-32603,message:error.message}},'*')}})</script><iframe id="editor" style="width:100%;height:930px;border:0" sandbox="allow-scripts allow-same-origin"></iframe>`);
  const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'";
  await page.locator('iframe').evaluate((el, html) => { el.srcdoc = html; }, resource.contents[0].text.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`));
  const frame = page.frameLocator('#editor');
  await frame.getByLabel('添加卡片').waitFor({ timeout: 20000 });
  await frame.locator('#project-menu button').click();
  const dialog = frame.locator('#project-home[data-ready="true"]');
  await dialog.getByRole('button', { name: '新建项目', exact: true }).click();
  await dialog.getByRole('group', { name: '项目名称', exact: true }).locator('input').fill('运营工作台');
  const saveFolder = dialog.getByRole('group', { name: '保存到文件夹', exact: true });
  assert.equal(await saveFolder.locator('input').count(), 0, 'save location must not require typing a path');
  await dialog.getByRole('button', { name: '创建项目', exact: true }).click();
  await dialog.getByText('请先选择保存项目的文件夹。', { exact: true }).waitFor();
  assert.equal((await call('project_list')).projects.length, 0);
  await choose(saveFolder, { status: 'cancelled' });
  assert.equal(await saveFolder.locator('[data-folder-name]').textContent(), '尚未选择文件夹');
  await choose(saveFolder, { status: 'failed', message: '文件夹选择测试失败' });
  await dialog.getByText('文件夹选择测试失败').waitFor();
  await choose(saveFolder, { status: 'selected', directory });
  assert.equal(await saveFolder.locator('[data-folder-name]').textContent(), path.basename(directory));
  await choose(saveFolder, { status: 'cancelled' });
  assert.equal(await saveFolder.locator('[data-folder-name]').textContent(), path.basename(directory), 'cancel preserves the previous choice');
  assert.equal((await call('project_list')).projects.length, 0, 'selection alone never creates a project');
  await page.screenshot({ path: '/tmp/page-builder-folder-picker.png' });
  await dialog.getByRole('button', { name: '创建项目', exact: true }).click();
  await frame.locator('#project-home').waitFor({ state: 'detached', timeout: 20000 });
  const project = (await call('project_list')).projects[0];
  assert.equal(project.name, '运营工作台');
  const scope = { workspaceId: project.workspaceId };
  const initial = (await call('page_list', scope)).pages[0];
  await frame.getByLabel('添加卡片').click(); await frame.getByText('卡片已添加').waitFor();
  await frame.locator('.component-shell').click(); await frame.locator('#sync-context button').click();
  await page.waitForFunction(id => window.context?.workspaceId === id, project.workspaceId);
  assert.equal((await page.evaluate(() => window.context)).projectId, project.projectId);
  assert.equal((await call('page_get_schema', { ...scope, pageId: initial.pageId })).page.root.children.length, 1);
  assert.equal((await call('page_get_schema', { pageId: legacy.pageId })).page.root.children.length, 0);
  const inline = await openInline(frame, '卡片正文');
  await inline.fill('项目中的文字已保存'); delayNextSave = true;
  await frame.locator('#project-menu button').click();
  await dialog.waitFor();
  assert.equal((await call('page_get_schema', { ...scope, pageId: initial.pageId })).page.root.children[0].props.body, '项目中的文字已保存');
  assert.equal(await frame.locator('.node-actions:visible').count(), 0, 'component toolbar must not float over the project home');
  await dialog.locator(`[data-project="${project.workspaceId}"]`).getByRole('button', { name: '打开项目', exact: true }).click();
  await dialog.getByRole('group', { name: '新页面名称', exact: true }).locator('input').fill('数据报表');
  await dialog.getByRole('button', { name: '添加页面', exact: true }).click(); await frame.locator('#project-home').waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => window.context), null, 'switching clears old AI context');
  await frame.getByLabel('添加基础按钮').click(); await frame.getByText('基础按钮已添加').waitFor();
  await frame.locator('#project-menu button').click();
  await dialog.locator(`[data-project="${project.workspaceId}"]`).getByRole('button', { name: '打开项目', exact: true }).click();
  await dialog.getByRole('button', { name: /首页/ }).click(); await frame.locator('#project-home').waitFor({ state: 'detached' });
  await frame.locator('#canvas').getByText('卡片标题', { exact: true }).waitFor();
  await frame.locator('#project-menu button').click();
  await dialog.locator(`[data-project="${project.workspaceId}"]`).getByRole('button', { name: '打开项目', exact: true }).click();
  await dialog.getByRole('button', { name: '复制当前页面', exact: true }).click(); await frame.locator('#project-home').waitFor({ state: 'detached' });
  assert.equal((await call('page_list', scope)).pages.length, 3);
  const coverPng = await frame.locator('.component-shell').first().screenshot();
  await frame.locator('#project-menu button').click();
  await dialog.waitFor();
  await dialog.locator(`[data-project="${project.workspaceId}"]`).getByRole('button', { name: '项目设置', exact: true }).click();
  await dialog.getByRole('group', { name: '项目名称', exact: true }).locator('input').fill('运营工作台 · 产品设计');
  await dialog.getByRole('group', { name: '项目说明', exact: true }).locator('textarea').fill('独立管理运营页面、组件方案与本地资源。');
  await dialog.getByLabel('上传项目封面', { exact: true }).setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: coverPng });
  await dialog.getByRole('button', { name: '收藏此项目', exact: true }).click();
  await page.screenshot({ path: '/tmp/page-builder-project-settings.png' });
  await dialog.getByRole('button', { name: '保存设置', exact: true }).click();
  await dialog.getByRole('heading', { name: '最近项目' }).waitFor();
  const settingsSaved = (await call('project_get', scope)).project;
  assert.equal(settingsSaved.revision, 1); assert.equal(settingsSaved.starred, true);
  assert.equal(settingsSaved.description, '独立管理运营页面、组件方案与本地资源。');
  assert.equal(settingsSaved.coverImage, 'data:image/png;base64,' + coverPng.toString('base64'));
  assert.equal(settingsSaved.directory, project.directory, 'renaming metadata does not rename the folder');
  await dialog.getByRole('group', { name: '搜索项目', exact: true }).locator('input').fill('不存在的项目');
  assert.equal(await dialog.locator('.project-card:visible').count(), 0);
  await dialog.getByText('没有匹配的项目，试试其他名称或路径。').waitFor();
  await dialog.getByRole('group', { name: '搜索项目', exact: true }).locator('input').fill('运营');
  assert.equal(await dialog.locator('.project-card:visible').count(), 1);
  const other = (await call('project_create', { name: '客户服务中心', parentDirectory: directory })).project;
  await call('project_update', { workspaceId: other.workspaceId, expectedRevision: 0, name: other.name, description: '服务流程与客户信息页面', starred: false, coverImage: null });
  const movedProject = (await call('project_create', { name: '数据分析平台', parentDirectory: directory })).project;
  await dialog.getByRole('button', { name: '所有项目', exact: true }).click();
  await dialog.locator(`[data-project="${other.workspaceId}"]`).getByRole('button', { name: '项目设置', exact: true }).click();
  assert.equal(await dialog.getByRole('group', { name: '项目说明', exact: true }).locator('textarea').inputValue(), '服务流程与客户信息页面');
  await dialog.getByRole('group', { name: '项目说明', exact: true }).locator('textarea').fill('客户服务项目专属说明');
  await dialog.getByRole('button', { name: '保存设置', exact: true }).click();
  await dialog.waitFor();
  assert.equal((await call('project_get', { workspaceId: other.workspaceId })).project.description, '客户服务项目专属说明');
  assert.equal((await call('project_get', scope)).project.description, settingsSaved.description, 'settings for a different card do not change the active editor project');

  await dialog.getByRole('button', { name: '收藏项目', exact: true }).click();
  await dialog.waitFor();
  assert.equal(await dialog.locator('.project-card').count(), 1);
  await dialog.getByRole('button', { name: '所有项目', exact: true }).click();
  await dialog.waitFor();
  assert.equal(await dialog.locator('.project-card').count(), 3);
  assert.equal(await dialog.locator('[data-ui-renderer-valid="false"]').count(), 0);
  await page.screenshot({ path: '/tmp/page-builder-projects-desktop.png' });
  await page.setViewportSize({ width: 680, height: 980 });
  await page.screenshot({ path: '/tmp/page-builder-projects-narrow.png' });
  assert.equal(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
  await page.setViewportSize({ width: 420, height: 920 });
  await page.screenshot({ path: '/tmp/page-builder-projects-mobile.png' });
  assert.equal(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
  await page.setViewportSize({ width: 1440, height: 980 });
  // Missing folders keep their card and can be relinked without moving/deleting files.
  const movedDirectory = path.join(directory, '已移动的数据分析平台');
  await rename(movedProject.directory, movedDirectory);
  await dialog.getByRole('button', { name: '所有项目', exact: true }).click();
  const unavailable = dialog.locator(`[data-project="${movedProject.workspaceId}"]`);
  await unavailable.getByText('路径待关联').waitFor();
  await unavailable.getByRole('button', { name: '项目设置', exact: true }).click();
  await choose(dialog.getByRole('group', { name: '新的项目文件夹', exact: true }), { status: 'selected', directory: other.directory });
  await dialog.getByRole('button', { name: '验证并关联路径', exact: true }).click();
  await dialog.getByText(/这个路径属于另一个项目/).waitFor();
  await choose(dialog.getByRole('group', { name: '新的项目文件夹', exact: true }), { status: 'selected', directory: movedDirectory });
  await dialog.getByRole('button', { name: '验证并关联路径', exact: true }).click();
  await dialog.getByRole('heading', { name: '数据分析平台', exact: true }).waitFor();
  const movedListing = (await call('project_list')).projects;
  assert.equal(movedListing.filter(item => item.projectId === movedProject.projectId).length, 1);
  assert.equal(movedListing.find(item => item.projectId === movedProject.projectId).directory, await realpath(movedDirectory));

  await dialog.getByRole('button', { name: '返回项目', exact: true }).click();
  await dialog.getByRole('button', { name: '打开本地项目', exact: true }).click();
  const openFolder = dialog.getByRole('group', { name: '项目文件夹', exact: true });
  assert.equal(await openFolder.locator('input').count(), 0);
  await choose(openFolder, { status: 'selected', directory: other.directory });
  await dialog.getByRole('button', { name: '打开项目', exact: true }).click();
  await dialog.getByRole('heading', { name: '客户服务中心', exact: true }).waitFor();
  assert.deepEqual([...new Set(chooserCalls.filter(item => item.name === 'project_choose_directory').map(item => item.args.purpose))].sort(), ['create', 'open', 'relink']);
  assert.equal(choices.length, 0);
  await dialog.getByRole('button', { name: '继续编辑', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.screenshot({ path: '/tmp/page-builder-projects-editor.png' });
  await frame.locator('#project-menu button').click();
  await dialog.getByRole('button', { name: '历史页面', exact: true }).click();
  failNextResources = true;
  await dialog.getByRole('button', { name: '保留历史页面', exact: true }).click();
  await dialog.getByText(/模拟组件资源读取失败/).waitFor();
  assert.equal(await frame.locator('.workspace').evaluate(el => el.inert), false, 'failed runtime switch restores editable previous project');
  await dialog.getByRole('button', { name: '继续编辑', exact: true }).click();
  await frame.locator('#project-menu button').click();
  await dialog.getByRole('button', { name: '历史页面', exact: true }).click();
  await dialog.getByRole('button', { name: '保留历史页面', exact: true }).click(); await frame.locator('#project-home').waitFor({ state: 'detached' });
  await frame.locator('#project-menu button').click();
  await dialog.locator(`[data-project="${project.workspaceId}"]`).getByRole('button', { name: '打开项目', exact: true }).click();
  await dialog.getByRole('button', { name: /首页/, exact: false }).first().click(); await frame.locator('#project-home').waitFor({ state: 'detached', timeout: 20000 });
  assert.deepEqual(errors, []); assert.deepEqual(requests, []);
  assert.equal(await frame.locator('.render-error,.ui-control-error').count(), 0);

  // Disk layout, no absolute source path or shared user data in committed project files.
  const disk = JSON.parse(await readFile(path.join(project.directory, 'page-builder.project.json'), 'utf8'));
  assert.equal(disk.projectId, project.projectId); assert.equal('directory' in disk, false);
  const snapshot = JSON.parse(await readFile(path.join(project.directory, '.page-builder/libraries', disk.componentLibrary.snapshotId, 'manifest.json'), 'utf8'));
  assert.equal(snapshot.sourcePath, 'project://component-library');
  assert.equal(JSON.parse(await readFile(path.join(project.directory, '.page-builder/pages', `${initial.pageId}.json`), 'utf8')).root.children.length, 1);

  // Same project/page IDs in a second clone never share a write destination.
  const clonePath = path.join(directory, '另一个检出'); await cp(project.directory, clonePath, { recursive: true });
  const clone = (await call('project_open', { directory: clonePath })).project;
  assert.notEqual(clone.workspaceId, project.workspaceId); assert.equal(clone.projectId, project.projectId);
  const original = (await call('page_get_schema', { ...scope, pageId: initial.pageId })).page;
  await call('page_apply_operations', { workspaceId: clone.workspaceId, pageId: initial.pageId, expectedRevision: original.revision, operations: [{ type: 'rename', name: '只修改另一个检出' }] });
  assert.equal((await call('page_get_schema', { ...scope, pageId: initial.pageId })).page.name, '首页');
  assert.equal((await call('page_list')).pages.length, 1);
  await assert.rejects(call('page_get_schema', { workspaceId: 'workspace-invalid', pageId: initial.pageId }));
  await assert.rejects(call('project_create', { name: '运营工作台', parentDirectory: directory }));
  await assert.rejects(call('project_create', { name: '../unsafe', parentDirectory: directory }));
  const plain = path.join(directory, '普通文件夹'); await mkdir(plain); await writeFile(path.join(plain, 'keep.txt'), '保留');
  await assert.rejects(call('project_open', { directory: plain })); assert.equal(await readFile(path.join(plain, 'keep.txt'), 'utf8'), '保留');

  // A fresh process uses the same persisted registry and pages.
  const second = await connect('second', 'primary');
  assert.equal((await call('page_get_schema', { ...scope, pageId: initial.pageId }, second)).page.name, '首页');
  // HTTP routes carry the same project identity as MCP tools.
  const response = await fetch(`${opened.editorUrl}/api/pages/${initial.pageId}?workspace=${project.workspaceId}`);
  assert.equal((await response.json()).page.name, '首页');
  const denied = await fetch(`${opened.editorUrl}/api/projects`, { method: 'POST', headers: { origin: 'https://unrelated.example', 'content-type': 'application/json' }, body: JSON.stringify({ name: 'must-not-create', parentDirectory: directory }) });
  assert.equal(denied.status, 400); assert.equal((await denied.json()).error.code, 'UNTRUSTED_ORIGIN');
  // Corrupt portable resources are rejected even with an already warm cache.
  const asset = path.join(clonePath, '.page-builder/libraries', snapshot.snapshotId, snapshot.files[0]);
  const before = await readFile(asset); await writeFile(asset, 'damaged');
  await assert.rejects(call('project_open', { directory: clonePath })); await writeFile(asset, before);
  const isolated = await connect('fresh-machine');
  const restored = await call('project_open', { directory: project.directory }, isolated);
  assert.equal((await call('page_get_schema', { workspaceId: restored.project.workspaceId, pageId: initial.pageId }, isolated)).page.root.children.length, 1);
  // Reopen from a normal browser via workspace+page URL.
  const httpPage = await browser.newPage(); await httpPage.goto(`${opened.editorUrl}/?workspace=${project.workspaceId}&page=${initial.pageId}`);
  await httpPage.locator('#canvas').getByText('卡片标题', { exact: true }).waitFor();
  await httpPage.locator('#startup-status').waitFor({ state: 'hidden' });
  console.log(JSON.stringify({ ok: true, directory, cases: ['folder chooser create/open/relink/cancel/failure (OS adapter simulated)', 'native create/edit/context', 'card search/star/cover/settings', 'safe relink and wrong-project rejection', 'page create/switch/copy', 'desktop/narrow', 'portable files', 'clone isolation', 'invalid project preservation', 'cross-process reopen', 'HTTP scope', 'corrupt resources', 'fresh cache open'] }));
} finally { await browser.close(); for (const client of clients) await client.close(); }
