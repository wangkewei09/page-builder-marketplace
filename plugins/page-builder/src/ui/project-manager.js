// Project navigation owns no page data; all persistence goes through the same API
// used by AI tools. Source-library controls own inputs, buttons and icons.
export function createProjectManager({ api, mountUi, clearUiPrefix, inputProps, buttonProps, current, enter, settle, setOpen }) {
  let dialog = null, busy = false;
  function close() { if (busy) return; dialog?.close(); dialog?.remove(); dialog = null; clearUiPrefix('project-dialog-'); setOpen(false); }
  async function show() {
    if (dialog) return;
    if (!await settle()) return;
    setOpen(true);
    dialog = document.createElement('dialog'); dialog.className = 'project-dialog'; dialog.setAttribute('aria-labelledby', 'project-dialog-title');
    dialog.innerHTML = '<header><div><h2 id="project-dialog-title">项目与页面</h2><p>保存在本地文件夹，随时打开继续编辑。</p></div><div data-close></div></header><p data-message role="status" aria-live="polite"></p><div data-body></div>';
    document.body.append(dialog); dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }); dialog.showModal();
    const button = async (target, key, label, run, variant = 'secondary-gray', icon = null) => mountUi(`project-dialog-${key}`, target, 'C-02', buttonProps(label, variant, icon), { 'b2b:button-activate': run });
    await button(dialog.querySelector('[data-close]'), 'close', '关闭', close);
    const message = text => { if (dialog) dialog.querySelector('[data-message]').textContent = text; };
    async function action(run) {
      if (busy) return; busy = true; dialog.querySelector('[data-body]').inert = true; message('正在处理，请稍候…');
      try { await run(); busy = false; close(); }
      catch (error) { message(error.message); }
      finally { busy = false; if (dialog) dialog.querySelector('[data-body]').inert = false; }
    }
    busy = true; message('正在读取项目…'); dialog.querySelector('[data-body]').inert = true;
    try {
      const listing = await api('./api/projects', { unscoped: true });
      const active = current();
      const body = dialog.querySelector('[data-body]');
      const section = (title, parent = body) => { const el = document.createElement('section'); const h = document.createElement('h3'); h.textContent = title; el.append(h); parent.append(el); return el; };
      const text = (parent, value) => { const p = document.createElement('p'); p.textContent = value; parent.append(p); };
      const slot = parent => { const div = document.createElement('div'); parent.append(div); return div; };
      const input = async (parent, key, label, value, update) => {
        const wrap = slot(parent); wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', label);
        const labelElement = document.createElement('label'); labelElement.textContent = label; wrap.append(labelElement);
        await mountUi(`project-dialog-${key}`, slot(wrap), 'C-21', inputProps(label, value), { 'b2b:input-change': event => update(String(event.detail.value ?? '')) });
      };
      if (active.project) {
        const pages = section(active.project.name); text(pages, active.project.directory);
        const list = await api('./api/pages');
        const rows = slot(pages); rows.className = 'project-pages';
        for (const page of list.pages) await button(slot(rows), `page-${page.pageId}`, `${page.name}${page.pageId === active.page.pageId ? ' · 当前' : ''}`, () => action(() => enter(active.project, page.pageId)), page.pageId === active.page.pageId ? 'secondary-blue' : 'secondary-gray');
        let pageName = '新页面'; const createRow = slot(pages); createRow.className = 'project-create-page';
        await input(createRow, 'page-name', '新页面名称', pageName, value => { pageName = value; });
        await button(slot(createRow), 'new-page', '添加页面', () => action(async () => {
          if (!pageName.trim() || pageName.trim().length > 80) throw new Error('页面名称请填写 1–80 个字符。');
          const result = await api('./api/pages', { method: 'POST', body: JSON.stringify({ name: pageName.trim() }) }); await enter(active.project, result.page.pageId);
        }), 'secondary-blue', 'add');
        await button(slot(pages), 'copy-page', '复制当前页面', () => action(async () => { const result = await api('./api/import', { method: 'POST', body: JSON.stringify({ page: active.page, name: `${active.page.name.slice(0, 76)}（副本）` }) }); await enter(active.project, result.page.pageId); }), 'secondary-gray', 'content_copy');
      }
      const columns = slot(body); columns.className = 'project-forms';
      const create = section('新建项目', columns); let name = '', parentDirectory = listing.defaultDirectory;
      await input(create, 'name', '项目名称', name, value => { name = value; });
      await input(create, 'parent', '保存到文件夹', parentDirectory, value => { parentDirectory = value; });
      text(create, '会在该位置创建同名项目文件夹，已有文件夹不会被覆盖。');
      await button(slot(create), 'create', '创建项目', () => action(async () => {
        const result = await api('./api/projects', { unscoped: true, method: 'POST', body: JSON.stringify({ name, parentDirectory }) }); await enter(result.project, result.page.pageId);
      }), 'primary', 'add');
      const open = section('打开项目', columns); let directory = '';
      await input(open, 'directory', '项目文件夹路径', directory, value => { directory = value; });
      text(open, '选择含 page-builder.project.json 的文件夹，也支持已经从 GitHub 克隆到本地的搭建器项目。');
      await button(slot(open), 'open', '打开项目', () => action(async () => {
        const result = await api('./api/projects/open', { unscoped: true, method: 'POST', body: JSON.stringify({ directory }) }); await enter(result.project, result.pages[0]?.pageId);
      }), 'secondary-blue', 'folder_open');
      const recent = section('最近项目');
      if (!listing.projects.length) text(recent, '还没有项目。创建后会显示在这里。');
      for (const project of listing.projects) {
        const row = slot(recent); row.className = 'project-recent-row';
        await button(slot(row), `recent-${project.workspaceId}`, project.name, () => action(async () => {
          const result = await api('./api/projects/open', { unscoped: true, method: 'POST', body: JSON.stringify({ directory: project.directory }) }); await enter(result.project, result.pages[0]?.pageId);
        }), 'secondary-gray', 'folder_open'); text(row, project.directory);
      }
      const legacy = section('历史页面'); text(legacy, '之前创建的页面仍保留在原位置。');
      const oldPages = await api('./api/pages', { unscoped: true });
      for (const page of oldPages.pages) {
        const row = slot(legacy); row.className = 'project-recent-row';
        await button(slot(row), `legacy-${page.pageId}`, page.name, () => action(() => enter(null, page.pageId)));
        if (active.project) await button(slot(row), `import-${page.pageId}`, '复制到当前项目', () => action(async () => {
          const old = await api(`./api/pages/${page.pageId}`, { unscoped: true });
          const result = await api('./api/import', { method: 'POST', body: JSON.stringify({ page: old.page }) }); await enter(active.project, result.page.pageId);
        }));
      }
      message('');
    } catch (error) { message(error.message); }
    finally { busy = false; if (dialog) { dialog.dataset.ready = 'true'; dialog.querySelector('[data-body]').inert = false; } }
  }
  return { show, close };
}
