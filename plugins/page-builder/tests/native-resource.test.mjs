import { editInline, openInline } from "./inline-helpers.mjs";
import { strict as assert } from "node:assert";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { chromium } from "playwright-core";

const data = await mkdtemp(path.join(tmpdir(), "page-builder-native-"));
const client = new Client({ name: "native-resource-test", version: "1" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["dist/server.js"], env: { ...process.env, PAGE_BUILDER_DATA_DIR: data, PAGE_BUILDER_LIBRARY_DIR: path.join(data, "libraries") } }));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
try {
  if (process.env.PAGE_BUILDER_TEST_SOURCE) {
    const checked = await client.callTool({ name: "component_library_check", arguments: { sourcePath: process.env.PAGE_BUILDER_TEST_SOURCE } });
    assert.ok(!checked.isError, JSON.stringify(checked));
    const applied = await client.callTool({ name: "component_library_apply", arguments: { snapshotId: checked.structuredContent.candidate.snapshotId, sourcePath: process.env.PAGE_BUILDER_TEST_SOURCE } });
    assert.ok(!applied.isError, JSON.stringify(applied));
  }
  const resource = await client.readResource({ uri: "ui://page-builder-development/editor-v5.html" });
  const html = resource.contents[0].text;
  assert.ok(!html.includes('<base ')); assert.ok(!html.includes('src="./app.js"'));
  assert.deepEqual(resource.contents[0]._meta.ui.csp.connectDomains, []);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [], requests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await page.exposeFunction("mcpRequest", async message => {
    if (message.method === "tools/call") return client.callTool(message.params);
    if (message.method === "resources/read") return client.readResource(message.params);
    return {};
  });
  await page.setContent(`<script>
    window.contexts={}; window.attachments={};
    addEventListener('message', async event => {
      const m=event.data;if(!m || m.jsonrpc!=='2.0' || m.id===undefined)return;
      if(m.method==='ui/update-model-context'){const f=Array.from(document.querySelectorAll('iframe')).find(f=>f.contentWindow===event.source),id=f?.id||'unknown';window.contexts[id]=m.params.structuredContent?.pageBuilderSelection||null;
      if(m.params.content?.some(c=>c.type==='image'||c.type==='text'&&c.text.trim())||m.params.structuredContent!=null) window.attachments[id]=m.params; else delete window.attachments[id];}
      try {const result=m.method==='ui/initialize'?{protocolVersion:'2026-01-26',hostInfo:{name:'strict-native-test',version:'1'},hostCapabilities:{serverTools:{},serverResources:{},updateModelContext:{text:{},structuredContent:{}}},hostContext:{locale:'zh-CN',platform:'desktop'}}:await window.mcpRequest(m);
      event.source?.postMessage({jsonrpc:'2.0',id:m.id,result},'*');}catch(error){event.source?.postMessage({jsonrpc:'2.0',id:m.id,error:{code:-32603,message:error.message}},'*');}
    });</script><iframe id="native" style="width:1420px;height:860px;border:0" sandbox="allow-scripts allow-same-origin"></iframe>`);
  const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'";
  await page.locator("iframe").evaluate((el, source) => { el.srcdoc = source; }, html.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`));
  const frame = page.frameLocator("#native");
  await frame.getByLabel("添加卡片").waitFor({ timeout: 15000 }).catch(async error => { console.error(JSON.stringify({ errors, body: await frame.locator("body").innerText() })); throw error; });
  await frame.getByLabel("添加卡片").click();
  await frame.getByText("卡片已添加").waitFor();
  await frame.locator('.node-shell[data-renderer-valid="true"]').first().click();
  await frame.locator("#sync-context button").click();
  for (const label of ["卡片标题", "卡片正文", "辅助信息"]) await frame.locator("#inspector").getByRole("button", { name: `编辑${label}`, exact: true }).waitFor();
  assert.equal(await frame.getByText("已选值（每行一个）", { exact: true }).count(), 0);
  const body = await openInline(frame, "卡片正文");
  assert.ok(await body.evaluate(el => el.isContentEditable && el.classList.contains('card-body')), 'edits the source card body itself');
  assert.equal(await frame.locator('.inline-editor').count(), 0);
  await body.fill("原生资源编辑已保存", { timeout: 5000 }).catch(async error => { console.error(JSON.stringify({ inspector: await frame.locator("#inspector").innerText(), errors })); throw error; }); await body.press("Tab");
  await frame.locator("#canvas").getByText("原生资源编辑已保存", { exact: true }).waitFor();
  await frame.getByRole('button', { name: '上传媒体图片', exact: true }).waitFor();
  await page.screenshot({ path: "/tmp/page-builder-property-labels.png" });
  await frame.getByLabel("添加标签").click(); await frame.getByText("标签已添加").waitFor().catch(async error => { console.error(JSON.stringify({ errors, body: await frame.locator("body").innerText(), editing: await frame.locator("[data-pb-inline-edit]").count() })); throw error; });
  assert.equal(await frame.locator(".render-error,.ui-control-error").count(), 0);
  assert.equal(await frame.locator('[data-renderer-valid="true"]').count(), 2);
  assert.equal(await frame.locator("#startup-status").isVisible(), false);
  assert.deepEqual(requests, []); assert.deepEqual(errors, []);
  await page.screenshot({ path: "/tmp/page-builder-native-resource-fixed.png" });
  await page.locator("iframe").evaluate(el => { el.srcdoc = el.srcdoc; });
  await frame.locator("#canvas").getByText("原生资源编辑已保存", { exact: true }).waitFor();
  await frame.getByLabel("添加输入框").click(); await frame.getByText("输入框已添加").waitFor().catch(async error => { console.error(JSON.stringify({ errors, body: await frame.locator("body").innerText() })); throw error; });
  await frame.locator('.component-shell[data-renderer-valid="true"]').last().click();
  await frame.locator("#sync-context button").click();
  for (const variant of ["数字输入框", "带图标输入框", "带属性输入框", "组合输入框", "长文本输入框", "基础输入框"]) {
    const control = frame.locator("#inspector .pb-field").filter({ has: frame.locator(".pb-field-label", { hasText: /^变体$/ }) });
    await control.locator("[data-select-trigger]").click();
    await control.getByRole("option", { name: variant, exact: true }).click();
    await frame.getByText("属性已更新", { exact: true }).waitFor();
    await page.waitForFunction(variant => window.contexts.native?.props?.variant === variant, variant);
    await frame.locator(`.component-shell[data-renderer-valid="true"]`).last().waitFor();
    assert.equal(await frame.locator(".render-error,.ui-control-error").count(), 0, variant);
    if (variant === "长文本输入框") {
      assert.equal(await frame.locator("#canvas textarea").evaluate(el => el.getBoundingClientRect().height), 92);
      await page.screenshot({ path: "/tmp/page-builder-long-text-fixed.png" });
    }
  }
  // Compare each card to a directly mounted production Renderer at the same width/props.
  await frame.locator('.component-shell[data-renderer-valid="true"]').first().click();
  await frame.locator("#sync-context button").click();
  const uploadBytes = await page.screenshot({ clip: { x: 0, y: 0, width: 300, height: 120 } });
  await frame.locator('#inspector input[type="file"]').setInputFiles({ name: 'test-cover.png', mimeType: 'image/png', buffer: uploadBytes });
  await page.waitForFunction(() => window.contexts.native?.props?.coverAlt === 'test-cover.png');
  const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='120'%3E%3Crect width='300' height='120' fill='%23e6edfa'/%3E%3C/svg%3E";
  await frame.locator("#app:not([inert]) #inspector:not([inert])").getByRole("group", { name: "媒体图片地址（图文／底部操作卡片必填）", exact: true }).locator("input").fill(image);
  await page.waitForFunction(image => window.contexts.native?.props?.coverImage === image, image);
  const cardNames = { basic: "基础卡片", compact: "简洁卡片", cover: "封面卡片", meta: "图文卡片", "external-grid": "栅格卡片", "content-grid": "内容区隔", nested: "内部卡片", tabs: "页签卡片", actions: "底部操作卡片", interactive: "整体可点击" };
  for (const variant of ["compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive", "basic"]) {
    const control = frame.locator("#app:not([inert]) #inspector:not([inert])").getByRole("group", { name: "变体", exact: true });
    await control.locator("[data-select-trigger]").click();
    await control.getByRole("option", { name: cardNames[variant], exact: true }).click();
    await page.waitForFunction(variant => window.contexts.native?.props?.variant === variant, variant);
    await frame.locator('.component-shell[data-renderer-valid="true"]').first().waitFor();
    assert.equal(await frame.locator(".render-error,.ui-control-error").count(), 0, variant);
    const props = await page.evaluate(() => window.contexts.native.props);
    const comparison = await frame.locator('.component-host').first().evaluate(async (host, props) => {
      const reference = document.createElement('div'); reference.style.width = host.getBoundingClientRect().width + 'px'; document.body.append(reference);
      const result = await window.B2B.renderComponent({ component: 'C-34', props }, reference);
      // C-41's indicator transitions after mount/layout. Compare settled states, not mid-animation.
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));
      const metrics = root => [root, ...root.querySelectorAll('*')].map(el => {
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return [el.tagName, r.width, r.height, s.fontSize, s.fontWeight, s.color, s.backgroundColor, s.padding, s.borderRadius, s.borderWidth];
      });
      const actual = metrics(host.firstElementChild), expected = metrics(reference.firstElementChild);
      result.instance.destroy(); reference.remove(); return { actual, expected };
    }, props);
    assert.deepEqual(comparison.actual, comparison.expected, `real Renderer geometry/styles: ${variant}`);
    if (variant === 'nested') {
      await frame.getByRole('button', { name: '添加一项', exact: true }).click();
      await page.waitForFunction(() => window.contexts.native?.props?.items?.length === 2).catch(async error => { console.error(JSON.stringify({ contexts: await page.evaluate(() => window.contexts), errors, inspector: await frame.locator('#inspector').innerText() })); throw error; });
      await frame.locator('#app:not([inert]) #inspector:not([inert])').getByRole('group', { name: '子卡片标题 2', exact: true }).locator('input').fill('第二张子卡片');
      await frame.locator('#canvas').getByText('第二张子卡片', { exact: true }).waitFor();
      await frame.getByRole('button', { name: '移除第 2 项', exact: true }).click();
      await page.waitForFunction(() => window.contexts.native?.props?.items?.length === 1);
    }
    if (variant === 'tabs') await page.screenshot({ path: '/tmp/page-builder-card-tabs.png' });
  }
  // Exercise every publicly declared tag/select/button variant through the real inspector.
  const enumNames = { category: "分类标签", filter: "筛选标签", closable: "可关闭", checkable: "可选择", loading: "加载中", bordered: "描边标签", status: "状态标签", avatar: "头像标签", property: "属性标签", option: "选项标签", primary: "主要按钮", danger: "主要危险按钮", "secondary-blue": "蓝色次要按钮", "secondary-danger": "次要危险按钮", "secondary-gray": "灰色次要按钮" };
  async function choose(label, value) {
    const control = frame.locator("#app:not([inert]) #inspector:not([inert])").getByRole("group", { name: label, exact: true });
    await control.locator("[data-select-trigger]").click();
    await control.getByRole("option", { name: enumNames[value] || value, exact: true }).click();
    await page.waitForFunction(({ key, value }) => window.contexts.native?.props?.[key] === value, { key: label === "类型" ? "type" : "variant", value });
    assert.equal(await frame.locator(".render-error,.ui-control-error").count(), 0, value);
  }
  await frame.locator('.component-shell[data-renderer-valid="true"]').nth(1).click();
  await frame.locator("#sync-context button").click();
  for (const variant of ["category", "filter", "closable", "checkable", "loading", "bordered", "status"]) {
    await choose("变体", variant);
    const props = await page.evaluate(() => window.contexts.native.props);
    if (variant === "loading") assert.equal(props.loading, true);
    if (variant === "bordered") assert.equal(props.bordered, true);
    if (variant === "closable") assert.equal(props.closable, true);
    if (variant === "checkable") assert.equal(props.checkable, true);
  }
  for (const type of ["avatar", "property", "option", "status"]) await choose("类型", type);
  await frame.getByText("其他设置", { exact: true }).click();
  const allProps = frame.locator("#app:not([inert]) #inspector:not([inert]) details");
  await allProps.getByRole("group", { name: "图标", exact: true }).locator("input").fill("person");
  await allProps.getByRole("button", { name: "应用其他设置", exact: true }).click();
  await page.waitForFunction(() => window.contexts.native?.props?.icon === "person");
  const color = frame.locator('#inspector:not([inert])').getByRole('group', { name: '颜色', exact: true });
  await color.locator('[data-select-trigger]').click();
  await color.getByRole('option', { name: '绿色', exact: true }).click();
  await page.waitForFunction(() => window.contexts.native?.props?.color === 'green');
  assert.equal(await page.evaluate(() => window.contexts.native.props.color), 'green', 'full properties must also save the source value, not the Chinese label');
  await frame.getByLabel("添加选择器").click(); await frame.getByText("选择器已添加").waitFor();
  await frame.locator('.component-shell[data-renderer-valid="true"]').last().click();
  await frame.locator("#sync-context button").click();
  for (const variant of ["基础多选", "自定义选项", "分组选项", "无边框", "下划线", "可搜索", "可创建", "复杂内容", "基础单选"]) {
    await choose("变体", variant);
    const props = await page.evaluate(() => window.contexts.native.props);
    assert.deepEqual(props.items.filter(item => !item.group).map(item => typeof item === "string" ? item : item.label), ["选项一", "选项二", "选项三"]);
    if (variant === "基础多选") assert.equal(props.multiple, true);
    if (variant === "可创建") assert.equal(props.creatable, true);
  }
  await frame.getByLabel("添加基础按钮").click(); await frame.getByText("基础按钮已添加").waitFor();
  await frame.locator('.component-shell[data-renderer-valid="true"]').last().click();
  await frame.locator("#sync-context button").click();
  for (const variant of ["primary", "danger", "secondary-blue", "secondary-danger", "secondary-gray"]) await choose("变体", variant);
  // A second view stays passive until its explicit context button is clicked.
  await page.evaluate(() => { const first=document.querySelector('iframe');const second=document.createElement('iframe');second.id='second';second.width='1200';second.height='800';second.srcdoc=first.srcdoc;document.body.append(second); });
  const second = page.frameLocator("#second"); await second.getByLabel("添加输入框").waitFor();
  assert.ok(!(await page.evaluate(() => window.contexts.second)));
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ['native']);
  await second.locator('.component-shell[data-renderer-valid="true"]').first().click();
  await second.locator(".node-actions").getByRole("button", { name: "加入 AI 上下文", exact: true }).click();
  await page.waitForFunction(() => window.contexts.second && !window.contexts.native);
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ['second']);
  await frame.locator('.component-shell[data-renderer-valid="true"]').last().click();
  await frame.locator("#sync-context button").click();
  await page.waitForFunction(() => window.contexts.native && !window.contexts.second);
  assert.deepEqual(await page.evaluate(() => Object.keys(window.attachments)), ['native']);
  await page.locator("#second").evaluate(el => el.remove());
  for (const [width, height] of [[520,440], [320,360]]) {
    await page.locator("#native").evaluate((el, size) => {el.style.width=size[0]+'px';el.style.height=size[1]+'px';}, [width,height]);
    const dimensions = await frame.locator(".app-shell").evaluate(el => ({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,vw:innerWidth,vh:innerHeight,scroll:document.documentElement.scrollWidth}));
    assert.ok(dimensions.w <= dimensions.vw && dimensions.h <= dimensions.vh && dimensions.scroll <= dimensions.vw, JSON.stringify(dimensions));
  }
  await page.locator("#native").screenshot({ path: "/tmp/page-builder-responsive-320.png" });
  assert.deepEqual(errors, []);
  const current = (await client.callTool({ name: "page_list", arguments: {} })).structuredContent.pages[0];
  assert.ok(current.revision >= 3);
  // Transport rejection must show an actionable startup error, not a white panel.
  await page.evaluate(() => { window.mcpRequest = async () => { throw new Error("测试服务不可用"); }; });
  await page.locator("#native").evaluate(el => { el.srcdoc = el.srcdoc; });
  await frame.locator("#startup-status").filter({ hasText: "启动失败" }).waitFor();
  console.log(JSON.stringify({ nativeResource: "pass", noHttpRequests: true, strictCsp: csp, savedAndReopened: true, propertyLabels: true, textareaHeight: 92, cardVariantsCompared: 10, inputVariants: 6, tagVariants: 7, tagTypes: 4, selectVariants: 9, buttonVariants: 5, fullPropertiesApply: true, singleContextAcrossTwoViews: true, responsivePanels: ["520x440", "320x360"], startupFailureVisible: true, screenshot: "/tmp/page-builder-property-labels.png" }));
} finally { await browser.close(); await client.close(); }
