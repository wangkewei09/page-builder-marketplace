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
