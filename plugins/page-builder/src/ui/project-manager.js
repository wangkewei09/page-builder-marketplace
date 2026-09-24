// A project workspace owns navigation only. Page and project writes use the same
// scoped backend as AI tools; closing this view preserves the mounted editor.
export function createProjectManager({ api, mountUi, clearUiPrefix, inputProps, buttonProps, current, enter, settle, setOpen, changed }) {
  let root = null, busy = false, listing, mode = 'recent', search = '', sequence = 0;
  const prefix = 'project-home-';
  async function render(...args) { const instance = await mountUi(...args); if (!instance) throw new Error('项目控件加载失败，请返回项目后重试。'); return instance; }
  const slot = (parent, className = '') => { const el = document.createElement('div'); el.className = className; parent.append(el); return el; };
  const text = (parent, value, tag = 'p') => { const el = document.createElement(tag); el.textContent = value; parent.append(el); return el; };
  const date = value => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString('zh-CN') : '尚未更新';
  const scoped = (project, path, options = {}) => api(path, { ...options, unscoped: !project, workspaceId: project?.workspaceId });
  function message(value) { if (root) root.querySelector('[data-message]').textContent = value; }
  function close() {
    if (busy) return;
    root?.remove(); root = null; clearUiPrefix(prefix); setOpen(false);
    document.querySelector('#project-menu button')?.focus();
  }
  async function button(parent, label, run, variant = 'secondary-gray', icon = null) {
    const host = slot(parent);
    await render(`${prefix}${root?.querySelector("[data-content]")?.contains(parent) ? "view-" : ""}${++sequence}`, host, 'C-02', buttonProps(label, variant, icon), { 'b2b:button-activate': () => { if (!busy) void action(run); } });
    return host;
  }
  async function input(parent, label, value, update, multiline = false) {
    const group = slot(parent, 'project-field'); group.setAttribute('role', 'group'); group.setAttribute('aria-label', label);
    text(group, label, 'label');
    const props = inputProps(label, value, multiline ? '长文本输入框' : '基础输入框');
    if (multiline) props.counter = true;
    await render(`${prefix}${root?.querySelector("[data-content]")?.contains(parent) ? "view-" : ""}${++sequence}`, slot(group), 'C-21', props, { 'b2b:input-change': event => update(String(event.detail.value ?? '')) });
    return group;
  }
  async function folder(parent, label, purpose, initialDirectory, update) {
    const group = slot(parent, 'project-field project-folder'); group.setAttribute('role', 'group'); group.setAttribute('aria-label', label);
    text(group, label, 'label');
    const summary = text(group, '尚未选择文件夹'); summary.dataset.folderName = '';
    const location = document.createElement('details'); location.hidden = true; group.append(location);
    text(location, '查看完整位置', 'summary'); const fullPath = text(location, ''); fullPath.className = 'project-path';
    let selected = '';
    await button(group, '选择文件夹', async () => {
      message('请在系统窗口中选择文件夹，或点击取消返回。');
      let choice = await api('./api/projects/choose-directory', { unscoped: true, method: 'POST', body: JSON.stringify({ purpose, initialDirectory: selected || initialDirectory }) });
      const requestId = choice.requestId;
      try {
        const deadline = Date.now() + 190000;
        while (choice.status === 'pending') {
          if (!root?.isConnected || Date.now() > deadline) throw new Error('文件夹选择已结束，请重新选择。');
          await new Promise(resolve => setTimeout(resolve, 500));
          choice = await api('./api/projects/directory-choice', { unscoped: true, method: 'POST', body: JSON.stringify({ requestId }) });
        }
        if (choice.status === 'cancelled') return;
        if (choice.status !== 'selected' || !choice.directory) throw new Error(choice.message || '未能选择文件夹，请重试。');
        selected = choice.directory; update(selected);
        summary.textContent = selected.split(/[\\/]/).filter(Boolean).at(-1) || selected;
        fullPath.textContent = selected; location.hidden = false;
      } finally {
        if (choice.status === 'pending') await api('./api/projects/cancel-directory-choice', { unscoped: true, method: 'POST', body: JSON.stringify({ requestId }) }).catch(() => {});
      }
    }, 'secondary-blue', 'folder_open');
  }
  async function action(run) {
    if (busy || !root) return;
    busy = true; root.dataset.ready = 'false'; root.querySelector('[data-body]').inert = true; message('正在处理…');
    try { await run(); message(''); }
    catch (error) { message(error.message); }
    finally { busy = false; if (root) { root.dataset.ready = 'true'; root.querySelector('[data-body]').inert = false; } }
  }
  async function openPage(project, pageId) { await enter(project, pageId); busy = false; close(); }
  function content(title, subtitle = '') {
    clearUiPrefix(`${prefix}view-`);
    const area = root.querySelector('[data-content]'); area.replaceChildren();
    const heading = slot(area, 'project-view-heading'); text(heading, title, 'h1'); if (subtitle) text(heading, subtitle);
    return area;
  }
  // Covers are explicit user assets. The default is a project label, never a
  // fabricated screenshot; no background screenshot capture or filesystem watcher.
  function cover(project) {
    if (project.coverImage) return project.coverImage;
    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue('--b2b-color-action-primary-subtle').trim() || '#eef3ff';
    const fg = css.getPropertyValue('--b2b-color-action-primary').trim() || '#245bff';
    const initial = [...project.name].slice(0, 2).join('').replace(/[<>&"']/g, '');
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="${bg}"/><text x="320" y="190" text-anchor="middle" dominant-baseline="middle" fill="${fg}" font-family="sans-serif" font-size="64">${initial}</text></svg>`)}`;
  }
  async function card(parent, key, title, description, meta, image, open, settings) {
    const host = slot(parent, 'project-card'); host.dataset.project = key;
    // The C-34 actions variant owns media, avatar, action buttons and styling.
    await render(`${prefix}view-card-${key}`, host, 'C-34', {
      variant: 'actions', title, body: description || '暂无项目说明', meta, icon: 'folder', coverImage: image, coverAlt: `${title}封面`,
      hoverable: true, avatar: { text: [...title][0] || 'P', image: null, fallback: [...title][0] || 'P', label: title },
      actions: [{ id: 'open', label: '打开项目', icon: 'folder_open' }, { id: 'settings', label: '项目设置', icon: 'settings' }]
    }, { 'b2b:card-action': event => { event.stopPropagation(); void action(event.detail.id === 'settings' ? settings : open); } });
    // The wrapper adds the project navigation target, without changing Renderer DOM.
    host.addEventListener('click', event => { if (!event.target.closest('button,a')) void action(open); });
    host.title = title;
  }
  async function refreshListing() { listing = await api('./api/projects', { unscoped: true }); }
  async function navigation() {
    const nav = root.querySelector('nav'); clearUiPrefix(`${prefix}nav-`); nav.replaceChildren();
    for (const [id, label, icon] of [['recent', '最近项目', 'schedule'], ['all', '所有项目', 'folder'], ['starred', '收藏项目', 'star'], ['legacy', '历史页面', 'description']]) {
      const host = slot(nav);
      await render(`${prefix}nav-${id}`, host, 'C-02', buttonProps(label, id === mode ? 'secondary-blue' : 'secondary-gray', icon, 'long'), { 'b2b:button-activate': () => action(() => id === 'legacy' ? legacy() : home(id)) });
      if (id === mode) host.setAttribute('aria-current', 'page');
    }
  }
  async function home(nextMode = mode === 'legacy' ? 'recent' : mode) {
    mode = nextMode; search = '';
    await refreshListing(); await navigation();
    const body = content(mode === 'starred' ? '收藏项目' : mode === 'all' ? '所有项目' : '最近项目', '你的项目与页面，都在本地。');
    const toolbar = slot(body, 'project-home-tools');
    let grid, emptySearch;
    await input(toolbar, '搜索项目', '', value => { search = value.toLowerCase().trim(); if (grid) { let count = 0; for (const item of grid.children) { item.hidden = !item.dataset.search.includes(search); if (!item.hidden) count++; } emptySearch.hidden = count > 0 || !search; } });
    await button(toolbar, '新建项目', createForm, 'primary', 'add');
    await button(toolbar, '打开本地项目', openForm, 'secondary-gray', 'folder_open');
    const projects = listing.projects.filter(project => mode !== 'starred' || project.starred);
    if (mode === 'all') projects.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    grid = slot(body, 'project-grid'); grid.setAttribute('aria-label', '项目卡片');
    for (const project of projects) {
      await card(grid, project.workspaceId, project.name, project.description, project.available ? `${project.pageCount} 个页面 · ${date(project.updatedAt)}` : '路径待关联', cover(project), () => project.available ? details(project) : settingsForm(project), () => settingsForm(project));
      grid.lastChild.dataset.search = `${project.name} ${project.description || ''} ${project.directory}`.toLowerCase();
    }
    emptySearch = text(body, '没有匹配的项目，试试其他名称或路径。'); emptySearch.hidden = true;
    if (!projects.length) { const empty = slot(body, 'project-home-empty'); text(empty, mode === 'starred' ? '还没有收藏项目' : '从你的第一个项目开始', 'h2'); text(empty, mode === 'starred' ? '在项目设置中收藏，便可在这里快速找到。' : '新建一个本地项目，或打开已经从 GitHub 下载到本地的项目文件夹。'); }
  }
  async function details(project) {
    const opened = await api('./api/projects/open', { unscoped: true, method: 'POST', body: JSON.stringify({ directory: project.directory }) });
    project = opened.project;
    const body = content(project.name, project.description || '在项目中组织和编辑页面。');
    const toolbar = slot(body, 'project-home-tools');
    await button(toolbar, '返回项目', () => home(), 'secondary-gray', 'arrow_back');
    await button(toolbar, '项目设置', () => settingsForm(project), 'secondary-gray', 'settings');
    text(body, project.directory, 'p').className = 'project-path';
    text(body, '项目画布 · 页面', 'h2');
    const pages = slot(body, 'project-page-grid');
    for (const page of opened.pages) {
      const host = slot(pages);
      await render(`${prefix}view-page-${page.pageId}`, host, 'C-34', { variant: 'interactive', appearance: 'bordered', hoverable: true, title: page.name, body: `更新于 ${date(page.updatedAt)}`, icon: 'description' }, { 'b2b:card-activate': () => action(() => openPage(project, page.pageId)) });
    }
    if (!opened.pages.length) text(body, '这个项目还没有页面。');
    const row = slot(body, 'project-page-create'); let name = '新页面';
    await input(row, '新页面名称', name, value => { name = value; });
    await button(row, '添加页面', async () => {
      if (!name.trim() || name.trim().length > 80) throw new Error('页面名称请填写 1–80 个字符。');
      const result = await scoped(project, './api/pages', { method: 'POST', body: JSON.stringify({ name: name.trim() }) }); await openPage(project, result.page.pageId);
    }, 'primary', 'add');
    if (current().project?.workspaceId === project.workspaceId) await button(row, '复制当前页面', async () => {
      const page = current().page;
      const result = await scoped(project, './api/import', { method: 'POST', body: JSON.stringify({ page, name: `${page.name.slice(0, 76)}（副本）` }) }); await openPage(project, result.page.pageId);
    }, 'secondary-gray', 'content_copy');
  }
  async function createForm() {
    const body = content('新建项目', '选择本地保存位置，开始组织你的页面。');
    await button(body, '返回项目', () => home(), 'secondary-gray', 'arrow_back');
    const form = slot(body, 'project-settings-form'); let name = '', parentDirectory = '';
    await input(form, '项目名称', name, value => { name = value; });
    await folder(form, '保存到文件夹', 'create', listing.defaultDirectory, value => { parentDirectory = value; });
    text(form, '在该位置创建同名文件夹，不会覆盖已有文件。');
    await button(form, '创建项目', async () => {
      if (!parentDirectory) throw new Error('请先选择保存项目的文件夹。');
      const result = await api('./api/projects', { unscoped: true, method: 'POST', body: JSON.stringify({ name, parentDirectory }) }); await openPage(result.project, result.page.pageId);
    }, 'primary', 'add');
  }
  async function openForm() {
    const body = content('打开本地项目', '支持已从 GitHub 克隆或下载到本地的搭建器项目。');
    await button(body, '返回项目', () => home(), 'secondary-gray', 'arrow_back');
    const form = slot(body, 'project-settings-form'); let directory = '';
    await folder(form, '项目文件夹', 'open', listing.defaultDirectory, value => { directory = value; });
    text(form, '请选择含 page-builder.project.json 的项目根目录。');
    await button(form, '打开项目', async () => { if (!directory) throw new Error('请先选择要打开的项目文件夹。'); const result = await api('./api/projects/open', { unscoped: true, method: 'POST', body: JSON.stringify({ directory }) }); await details(result.project); }, 'primary', 'folder_open');
  }
  async function settingsForm(project) {
    if (project.available === false) {
      const body = content('重新关联项目路径', project.name);
      await button(body, '返回项目', () => home(), 'secondary-gray', 'arrow_back');
      const form = slot(body, 'project-settings-form'); await pathForm(form, project); return;
    }
    project = (await scoped(project, './api/projects/current')).project;
    const body = content('项目设置', project.name);
    await button(body, '返回项目', () => home(), 'secondary-gray', 'arrow_back');
    const form = slot(body, 'project-settings-form');
    const draft = { name: project.name, description: project.description || '', coverImage: project.coverImage || null, starred: Boolean(project.starred) };
    await input(form, '项目名称', draft.name, value => { draft.name = value; });
    await input(form, '项目说明', draft.description, value => { draft.description = value; }, true);
    const preview = document.createElement('img'); preview.className = 'project-cover-preview'; preview.alt = '项目封面预览'; preview.src = cover(project); form.append(preview);
    const upload = document.createElement('input'); upload.type = 'file'; upload.accept = 'image/png,image/jpeg,image/webp'; upload.hidden = true; upload.setAttribute('aria-label', '上传项目封面'); form.append(upload);
    upload.addEventListener('change', () => action(async () => {
      const file = upload.files?.[0]; if (!file) return;
      if (file.size > 1_000_000 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('封面请使用 1 MB 以内的 PNG、JPEG 或 WebP 图片。');
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('无法读取封面图片。')); reader.readAsDataURL(file); });
      const image = new Image(); image.src = data; await image.decode().catch(() => { throw new Error('这不是有效的图片文件。'); }); draft.coverImage = data; preview.src = data;
    }));
    text(form, '建议使用 16:9 横向封面，支持 1 MB 以内的 PNG、JPEG、WebP。');
    const covers = slot(form, 'project-home-tools');
    await button(covers, '上传封面', () => upload.click(), 'secondary-gray', 'image');
    await button(covers, '恢复默认封面', () => { draft.coverImage = null; preview.src = cover({ ...project, coverImage: null }); });
    const starHost = slot(form);
    const star = async () => {
      const focused = starHost.contains(document.activeElement);
      await render(`${prefix}view-star`, starHost, 'C-02', buttonProps(draft.starred ? '已收藏 · 点击取消' : '收藏此项目', draft.starred ? 'secondary-blue' : 'secondary-gray', 'star'), { 'b2b:button-activate': () => action(async () => { draft.starred = !draft.starred; await star(); }) });
      if (focused) starHost.querySelector('button')?.focus();
    };
    await star();
    text(form, `本地路径：${project.directory}`).className = 'project-path';
    text(form, '修改项目名称不会重命名本地文件夹。封面、说明和收藏随项目文件一起保存。');
    await button(form, '保存设置', async () => {
      const result = await api('./api/projects/settings', { unscoped: true, method: 'POST', body: JSON.stringify({ workspaceId: project.workspaceId, expectedRevision: project.revision ?? 0, ...draft }) });
      await changed?.(result.project); await home();
    }, 'primary');
    const relocation = document.createElement('details'); form.append(relocation); text(relocation, '重新关联本地路径', 'summary');
    await pathForm(relocation, project);
  }
  async function pathForm(parent, project) {
    let directory = '';
    text(parent, '如果你已在文件管理器中移动了项目，在这里关联新位置。此操作不会移动、覆盖或删除文件，并会核对项目身份。');
    await folder(parent, '新的项目文件夹', 'relink', project.directory, value => { directory = value; });
    await button(parent, '验证并关联路径', async () => {
      if (!directory) throw new Error('请先选择移动后的项目文件夹。');
      const result = await api('./api/projects/relink', { unscoped: true, method: 'POST', body: JSON.stringify({ directory, workspaceId: project.workspaceId }) }); await details(result.project);
    }, 'secondary-blue', 'folder_open');
  }

  async function legacy() {
    mode = 'legacy'; await navigation();
    const body = content('历史页面', '以前创建的页面仍保留在原位置。');
    const pages = (await api('./api/pages', { unscoped: true })).pages;
    const list = slot(body, 'project-page-grid');
    for (const page of pages) {
      const row = slot(list);
      await button(row, page.name, () => openPage(null, page.pageId), 'secondary-gray', 'description');
      const active = current();
      if (active.project) await button(row, '复制到当前项目', async () => {
        const old = await api(`./api/pages/${page.pageId}`, { unscoped: true });
        const result = await scoped(active.project, './api/import', { method: 'POST', body: JSON.stringify({ page: old.page }) }); await openPage(active.project, result.page.pageId);
      });
    }
  }
  async function show() {
    if (root || !await settle()) return;
    root = document.createElement('section'); root.id = 'project-home'; root.setAttribute('aria-label', '项目工作台');
    root.innerHTML = '<div data-body class="project-home-shell"><aside class="project-home-sidebar"><div class="project-home-brand">页面搭建器</div><p>本地工作空间</p><nav aria-label="项目导航"></nav><div data-resume></div><p class="project-local-note">项目保存在你的电脑上</p></aside><main class="project-home-main"><p data-message role="status" aria-live="polite"></p><div data-content></div></main></div>';
    document.body.append(root); setOpen(true);
    await action(async () => {
      await button(root.querySelector('[data-resume]'), '继续编辑', () => { busy = false; close(); }, 'secondary-blue', 'arrow_back');
      await home('recent');
    });
    root?.querySelector('nav button')?.focus();
  }
  return { show, close };
}
