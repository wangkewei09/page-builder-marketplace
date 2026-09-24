import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ProjectManager } from '../src/projects.js';
import { FilePersistence, PageStore } from '../src/store.js';
import type { ComponentLibraryManager } from '../src/library.js';

test('project creation rolls back its own incomplete directory and never overwrites an existing folder', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'pb-project-atomic-'));
  try {
    const libraries = { binding: async () => ({ libraryId: 'b2b', snapshotId: 'b2b-0000000000000000', digest: '0'.repeat(64), sourceVersion: 'test', adapterVersion: 'test' }), exportSnapshot: async () => { throw new Error('disk failure'); } } as unknown as ComponentLibraryManager;
    const manager = new ProjectManager(path.join(directory, 'registry'), new PageStore(new FilePersistence(path.join(directory, 'legacy'))), libraries, directory);
    await assert.rejects(manager.create('创建失败'), /disk failure/);
    assert.ok(!(await readdir(directory)).includes('创建失败'));
    assert.equal((await manager.list()).projects.length, 0);
    await mkdir(path.join(directory, '已有文件夹')); await writeFile(path.join(directory, '已有文件夹/user.txt'), 'keep');
    await assert.rejects(manager.create('已有文件夹'), /同名文件夹/);
    assert.equal(await readFile(path.join(directory, '已有文件夹/user.txt'), 'utf8'), 'keep');
    await assert.rejects(manager.create('../outside'), /特殊字符/);
    await assert.rejects(manager.store('workspace-123'), /工作区标识/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('project settings are isolated, portable and revision checked across concurrent managers', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'pb-project-settings-'));
  try {
    const binding = { libraryId: 'b2b', snapshotId: 'b2b-0000000000000000', digest: '0'.repeat(64), sourceVersion: 'test', adapterVersion: 'test' };
    const libraries = { binding: async () => binding, exportSnapshot: async () => {}, importSnapshot: async () => {} } as unknown as ComponentLibraryManager;
    const registry = path.join(directory, 'registry');
    const makeManager = () => new ProjectManager(registry, new PageStore(new FilePersistence(path.join(directory, 'legacy'))), libraries, directory);
    const manager = makeManager();
    const first = await manager.create('项目甲'), second = await manager.create('项目乙');
    const settings = { name: '项目甲改名', description: '项目甲的内容说明', starred: true, coverImage: null };
    const beforePage = await readFile(path.join(first.project.directory, '.page-builder/pages', first.page.pageId + '.json'), 'utf8');
    const results = await Promise.allSettled([manager.update(first.project.workspaceId, 0, settings), makeManager().update(first.project.workspaceId, 0, { ...settings, name: '另一个窗口' })]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter(result => result.status === 'rejected').length, 1);
    const saved = await manager.resolve(first.project.workspaceId);
    assert.equal(saved.revision, 1); assert.equal(saved.description, settings.description);
    const manifest = JSON.parse(await readFile(path.join(first.project.directory, 'page-builder.project.json'), 'utf8'));
    assert.equal('workspaceId' in manifest, false); assert.equal('directory' in manifest, false);
    assert.equal((await manager.resolve(second.project.workspaceId)).name, '项目乙');
    assert.equal(await readFile(path.join(first.project.directory, '.page-builder/pages', first.page.pageId + '.json'), 'utf8'), beforePage);
    await assert.rejects(manager.update(first.project.workspaceId, 1, { ...settings, coverImage: 'https://example.com/cover.png' }), /封面/);
    await assert.rejects(manager.open(second.project.directory, first.project.projectId), /另一个项目/);
    assert.equal((await manager.resolve(first.project.workspaceId)).revision, 1);
    assert.equal((await manager.list()).projects.find(project => project.workspaceId === first.project.workspaceId)?.pageCount, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
