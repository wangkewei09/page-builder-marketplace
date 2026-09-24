import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { DirectoryPicker, type DirectoryChoice, type DirectoryDialog } from '../src/directory-picker.js';
import { createEditorServer } from '../src/http.js';
import type { PageStore } from '../src/store.js';
import type { ComponentLibraryManager } from '../src/library.js';

async function settled(picker: DirectoryPicker, job: DirectoryChoice) {
  for (let n = 0; n < 200; n++) {
    const result = picker.status(job.requestId);
    if (result.status !== 'pending') return result;
    await delay(5);
  }
  throw new Error('picker did not settle');
}

test('folder choice returns canonical paths, handles missing initial folders and never creates files', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'pb-folder-choice-'));
  try {
    const directory = path.join(root, '中文 空格 $() `test`');
    await mkdir(directory); await symlink(directory, path.join(root, 'shortcut'));
    let options: Parameters<DirectoryDialog>[0] | undefined;
    const picker = new DirectoryPicker(async value => { options = value; return path.join(root, 'shortcut'); });
    const before = await readdir(root);
    const job = picker.start('create', path.join(root, 'not-yet-created/child'));
    assert.equal(job.status, 'pending');
    const result = await settled(picker, job);
    assert.equal(options?.purpose, 'create'); assert.equal(options?.initialDirectory, root);
    assert.equal(result.status, 'selected'); assert.equal(result.directory, await realpath(directory));
    assert.deepEqual(await readdir(root), before);
    result.status = 'failed'; assert.equal(picker.status(job.requestId).status, 'selected', 'callers cannot mutate stored results');
    picker.dispose();
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('cancel, invalid file and OS errors do not leave the chooser busy', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'pb-folder-failure-'));
  try {
    const file = path.join(root, 'keep.txt'); await writeFile(file, 'keep');
    const outcomes: (string | null | Error)[] = [null, file, new Error('OS unavailable'), root];
    const picker = new DirectoryPicker(async () => { const next = outcomes.shift()!; if (next instanceof Error) throw next; return next; });
    assert.equal((await settled(picker, picker.start('open'))).status, 'cancelled');
    assert.match((await settled(picker, picker.start('open'))).message!, /不能选择文件/);
    assert.match((await settled(picker, picker.start('open'))).message!, /OS unavailable/);
    assert.equal((await settled(picker, picker.start('relink'))).status, 'selected');
    assert.throws(() => picker.start('invalid' as never), /用途无效/);
    assert.throws(() => picker.start('open', 123 as never), /初始文件夹/);
    assert.throws(() => picker.status('unknown'), /已失效/);
    picker.dispose();
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('one active chooser, cancellation and timeout abort the OS process and allow retry', async () => {
  let abortCount = 0, started = 0;
  const dialog: DirectoryDialog = ({ signal }) => new Promise((resolve, reject) => {
    started++;
    signal.addEventListener('abort', () => { abortCount++; reject(new Error('aborted')); }, { once: true });
  });
  const picker = new DirectoryPicker(dialog, 40);
  const first = picker.start('open');
  assert.throws(() => picker.start('create'), /窗口已打开/);
  while (!started) await delay(1);
  assert.equal(picker.cancel(first.requestId).status, 'cancelled');
  await delay(1);
  const second = await settled(picker, picker.start('relink'));
  assert.equal(second.status, 'failed'); assert.match(second.message!, /超时/);
  const third = picker.start('create');
  while (started < 3) await delay(1);
  picker.dispose(); await delay(1);
  assert.equal(picker.status(third.requestId).status, 'cancelled');
  assert.equal(abortCount, 3);
});

test('HTTP chooser uses the same jobs and rejects unrelated origins without opening a dialog', async () => {
  let finish: ((value: string | null) => void) | undefined;
  const picker = new DirectoryPicker(() => new Promise(resolve => { finish = resolve; }));
  const server = createEditorServer({} as PageStore, '/tmp', '/tmp', { pluginVersion: 'test', provider: 'test', serverName: 'test' }, {} as ComponentLibraryManager, undefined, picker);
  const url = await server.start();
  const post = (route: string, body: unknown, origin = url) => fetch(url + '/api/projects/' + route, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const denied = await post('choose-directory', { purpose: 'open' }, 'https://unrelated.example');
    assert.equal(denied.status, 400); assert.equal(Boolean(finish), false);
    const job = await (await post('choose-directory', { purpose: 'open' })).json();
    assert.equal(job.status, 'pending');
    while (!finish) await delay(1);
    finish(null);
    await settled(picker, job);
    assert.equal((await (await post('directory-choice', { requestId: job.requestId })).json()).status, 'cancelled');
    assert.equal((await (await post('cancel-directory-choice', { requestId: job.requestId })).json()).status, 'cancelled');
  } finally { await server.close(); }
});
