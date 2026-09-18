# 原生入口与选区联动缺陷

## 2026-09-17 / 空上下文附件与展开错误调查

用户反馈点击聊天输入框的「2 个应用上下文」附件时出错。已确认一个插件缺陷，但尚未收到弹层具体报错，不能将重复附件等同于弹层报错的完整根因。

- **复现**：旧 UI 启动、取消选择、交出所有权都发送 `{content:[], structuredContent:{pageBuilderSelection:null}}`。当前宿主只读实现 `app-primary-d63a2421d501.js` 判断 `structuredContent != null` 即创建附件，因此未点击任何组件也产生空附件；每个面板各留一份。旧模拟宿主只判断 `pageBuilderSelection`，错误地把空对象当作清除成功。
- **修复**：清除只发送 `{content:[]}`，不传 structuredContent；启动、取消选区、面板接管、宿主 teardown 与组件库手动重载使用同一清除流程。请求使用 SDK 的 3 秒超时以取消挂起请求，失败显示可重试状态，旧响应不会覆盖其他面板已接管的状态。
- **附带缺陷**：长错误标签会覆盖重试按钮，导致真实点击失败；限制状态容器溢出，完整错误保留在 title，重试控件不收缩。
- **定向证据**：`tests/host-bridge.test.mjs` 修复前真实失败（启动附件数 1，应为 0），修复后验证零空附件、两面板仅一份、取消选择、关闭前清除、拒绝和超时重试、无自动消息。`tests/native-resource.test.mjs` 增加按真实宿主规则计算附件数的断言，通过严格无 HTTP 沙箱回归。测试页面、组件库缓存、导出目录均独立隔离。截图 `/tmp/page-builder-context-fixed.png` 已目视核对。
- **未验证**：真实 Codex 附件弹层的打开动作。Computer Use 返回 `Computer Use is not allowed to use the app 'com.openai.codex' for safety reasons.`，未使用其他技术绕过。当前日志只有 ResizeObserver loop 全局错误，无法确证与这次点击相关；未修改宿主或盲目屏蔽错误。需要用户提供展开后的报错原文/画面才能继续定位剩余问题。

日期：2026-09-16。用户反馈：右侧「＋」菜单中的页面搭建器仍为旧界面；点击组件后聊天输入区没有组件引用。本文是修复前独立调查记录，修复结果由后续进度与验收证据补充。

## 已复现的原因

| 问题 | 实际证据 | 影响 |
|---|---|---|
| 新版原生入口参数无效 | 对两个已安装包分别执行 MCP tools/list：旧版 entrypoints 为 `[{type:"global"},{type:"thread"}]`；新版为 `["global","thread"]`。当前宿主解析器要求对象数组，解析失败返回空入口列表 | 新版安装成功也不代表右侧菜单出现新版；旧入口仍可见 |
| UI 未发布选区上下文 | 初始源码 app.js 的 select() 仅调用 HTTP selection 和 renderSelection；未建立宿主桥接，也没有 ui/update-model-context | 选中样式与服务端选区不等于聊天区或模型收到组件 |
| 独立进程状态不共享 | 两个已安装新版 MCP 进程使用同一个隔离目录；A 选中根节点，B 读取选区为 null；A 提交 revision 1 后 B 仍读到 revision 0 | standalone、MCP 和不同任务可能看到不同页面/选区 |
| 旧版本写入实际可覆盖 | 上述 B 用 expectedRevision 0 修改仍成功，落盘名称变成 B 的值且 revision 仍为 1 | 现有版本冲突保护仅在单进程内成立 |

跨进程复现使用独立临时目录 `page-builder-selection-audit-554EbB`，只创建了诊断数据，未修改用户页面。被检查的安装版本为 `0.2.0+codex.20260916082103`。

## 宿主协议依据

- 官方说明：[Add UI to your MCP server](https://developers.openai.com/plugins/build/chatgpt-ui)，其中选区应通过 `ui/update-model-context` 发布；`ui/message` 用于发起后续消息，不用于每次选中自动发送任务。
- 当前安装宿主只读代码：`/Applications/ChatGPT.app/Contents/Resources/app.asar` 中 `webview/assets/app-initial-4d7ea7f81c2d.js` 定义对象数组 entrypoints；`webview/assets/app-primary-4af6ed7f68d1.js` 处理 model context 并创建 composer attachment。
- 当前宿主支持标准 content / structuredContent 以及可选 `presentation.composerLabel`。清空 context 应清除对应引用；这些实现细节可能随宿主版本变化，插件需能力检测并如实处理失败。此次未修改宿主文件。

## 修复后必须区分的证据

1. 源码/协议测试：入口形状、桥接消息、选区内容、超时和拒绝处理。
2. 集成测试：跨进程读取最新页面与选区、并发冲突保护、AI 写入回到画布。
3. 真实宿主操作：用户从新版原生入口打开 → 点组件 → 输入区出现准确引用 → AI 读取同一节点并执行要求的修改 → 画布更新。

模拟宿主通过只能证明第 1 类；命令行安装通过也不能替代第 3 类。A09/A10/A11/A17 需按实际证据重审，不得沿用过度宽泛的通过结论。

## 修复结果

- 入口改为对象数组，UI 资源使用 `text/html;profile=mcp-app`、`ui.resourceUri` 和唯一 `editor-v5` URI；开发版 displayName、MCP key、serverName 与工具标题均明确标注开发版。
- UI 能力检测后用 `ui/update-model-context` 发布结构化选区和 composerLabel；快速点击只保留最后 epoch，清空选区发布 null，从不自动调用 `ui/message`。独立浏览器和不支持能力的宿主均显示真实状态。
- PageStore 移除进程内事实缓存，改为文件重读、按页锁、revision 分代历史/选区。真实独立 HTTP 与 MCP 进程互读页面和选区，旧 revision HTTP 写入返回 409。
- `tests/host-bridge.test.mjs` 证明模拟宿主成功、清空、能力缺失和无自动消息；`tests/cross-process.test.mjs` 证明跨进程共享与过期写拒绝。真实 Codex 输入区引用与原生入口仍在 A17 待验收。

## 协调

已将调查回传到原 Sol / high 开发任务“页面搭建器首版开发与验收”继续修复。原协调任务仅进行只读调查与隔离复现，未并行修改其源码。

## 2026-09-16 / 更新后当前任务入口消失

用户确认右侧「＋」菜单里的入口消失。安装包为 `0.2.0+codex.20260916092747`；开发版 MCP key 从 `pageBuilder` 更名为 `pageBuilderDevelopment`，资源从 `ui://page-builder/editor-v4.html` 更名为 `ui://page-builder-development/editor-v5.html`。

只读宿主日志 `/Users/wangkewei/Library/Logs/com.openai.codex/2026/09/16/codex-desktop-a0a47697-5844-483d-aaef-4f1c893b9e62-42010-t0-i1-032454-0.log` 的确证：

- 09:29–09:31 UTC，当前任务 `01a0a8d8-5587-72d0-9137-c9e986f3d669` 仍向旧 server 读取 v4，返回 `Resource not found`。
- 09:31:09 UTC 起，同一任务对新 server 的资源读取和工具调用返回 `unknown MCP server 'pageBuilderDevelopment'`（日志行 5995–6028）。
- 09:30:17 UTC，新任务 `01a0a98d-7dae-7cb2-8ca5-8a6826820ffd` 的新 server 为 ready，v5 资源读取成功（日志行 5866–5868）。这证明安装版可启动，不证明当前任务入口恢复或实际页面交互通过。

结论：当前任务保留了更新前的 MCP 会话与入口引用，更名后的服务尚未注册到该任务；不能靠重复构建、重装或全量验证修复会话连接。

处理状态：开发任务已确认暂停新的源码变动、构建和安装；保留现有工作树与未发布的 inspector 串行化补丁，不删除旧插件、不改用户数据、不关闭 55402 服务。已提示用户完全退出并重新打开 Codex，让连接重新初始化，再检查「打开页面搭建器（开发版）」；真实恢复结果待用户操作后核对，尚不能标记 A17/E07 通过。

后续版本规则：开发版独立 server key 固定下来，不能反复更名；资源版本变化需评估旧 URI 兼容别名及已打开任务的恢复路径。不得直接改回与旧插件冲突的 key，也不得为修复旧引用改写插件缓存或宿主数据库。

## 2026-09-16 / 入口重复与原生空白的最新核对

- 用户最新截图中已有旧/新两个入口；“入口缺失”不再是当前事实。用户随后反馈右侧为空白。
- 同一日志在 09:40:01.544、09:40:03.554、09:40:07.585 UTC 记录原任务 `01a0a8d8-5587-72d0-9137-c9e986f3d669` 读取 v5 仍返回 unknown server（行 7044/7054/7065）；恢复任务 `01a0a990-88f8-7853-bcc6-b5d9aaa41df4` 在 09:40:20.548 读资源成功（行 7107），随后 widget_running。尚无明确 CSP 或 JS 异常证据，不因此猜测并改写资源打包。
- 协调任务将用受支持导航切到已注册新服务的恢复任务；恢复任务已再次调用真正插件工具，不以普通浏览器 URL 冒充原生打开。用户可见结果仍待确认，不能据 widget_running 宣称修复完成。
- 数据修复与原生问题分开：原页面先备份后经带 expectedRevision 的两项操作从 29 更新到 30，解决原有标签头像缺失、输入框图标缺失；保存重开独立浏览器 4 个有效节点、0 个画布错误。详情和备份路径见 PROGRESS，不能替代原生显示或输入区引用验收。

## 2026-09-16 / 确认白屏后的实际修复

用户在恢复任务仍确认整页空白，排除仅由旧任务缺少 server 导致的解释。只读宿主 CSP 清洗函数 `x9n` 拒绝 HTTP localhost；外链式 UI 与 HTTP 预览具有不同安全环境，是此前验证遗漏。

`src/native-resource.ts` 与 UI 增加自包含 HTML、已验证快照 MCP resource 和固定 MCP tool 映射，移除原生 localhost 依赖。只适配资产输送，不改变真实 Renderer 语义，无 eval、任意文件读取工具或安全策略放宽。完整首屏/正文编辑/保存重开/拒绝失败路径已在禁止 HTTP 的 srcdoc 中通过，证据见 PROGRESS。

`0.2.0+codex.20260916095350` 已安装，新缓存资源含 `__pageBuilderNative`。当前宿主旧 MCP 进程仍读已被安装器清理的旧目录而 ENOENT，原生加载尚未通过，需完整退出重开一次；不再将 widget_running 或独立预览作为恢复依据。

旧入口去重：协调任务通过公开 app-server `config/value/write` + expectedVersion CAS 将旧 marketplace enabled=false，读回旧 false/开发版 true；安装和页面保留，无手改全局配置或卸载。实际菜单与新面板可见性仍待宿主重新加载确认。
