# 当前进度与验证证据

更新时间：2026-09-24。

## 当前状态

最新构建 `0.1.1+codex.20260924085012`：项目卡片工作台的新建保存位置、打开与重新关联改为 macOS 系统文件夹选择，不再要求输入路径。代码、测试、官方安装和隔离 MCP 验证完成；原生系统窗口显示/选择返回及当前已运行 Codex 加载新版仍待验收。项目文件与组件源保持独立，完整层级和后续无限画布/Git 边界见 [项目与画布](PROJECT_WORKSPACES.md)。

上一版的直接原位编辑保留，没有恢复浮层输入。组件库继续独立、手动刷新；本轮未修改组件库源文件。

## 已完成准备

- 检查现有组件库、插件与发布包；确认真实组件有统一 Renderer，但运行中的编辑器仍使用 mock。
- 从 Obsidian 的开发、架构、测试、评审、上下文与交付笔记提炼项目流程；来源见 DEVELOPMENT_WORKFLOW。
- 保存功能方案、基线交接、模块边界、决策记录与 A01—A17 验收矩阵。
- 准备只读参考 Git 副本，提交为 `e42e334`；正式实现尚未开始。

## 初始证据及其局限

| 检查 | 已观察结果 | 不能据此推断 |
|---|---|---|
| 组件库 `node design-source/components/runtime/audit-component-api.cjs` | 51/51 静态协议检查通过 | 搭建器真实渲染、全部组件浏览器接入通过 |
| 已安装插件 `page_get_schema` / `page_get_selection` | 初次检查时提供方 mock-b2b，revision 18，4 个组件节点 | 新开发版本已经加载、拖拽/导出已实现 |
| Git 基线文件检查 | v0.1.0 发布产物，无 src/tests/构建脚本/锁文件 | 不存在其他位置的原始源码；开发任务仍可有限范围核实 |
| 正式项目文件检查 | 当前只有工程文档 | 项目已可构建或用户已验收 |

上述为准备阶段记录，运行状态可能随后变化。实施任务首次启动需核对当前状态，勿覆盖已有数据。

## 2026-09-16 / 首个可运行增量

- 已完成行为：搜索组件；按钮或拖拽添加；五种真实组件渲染；选中与属性编辑；布局、排序、复制、删除；撤销重做；保存刷新恢复；预览真实选择器交互；桌面/窄屏；原子 AI 操作；实际页面截图；ZIP 导出；page.json 重新导入。
- 实现位置：`plugins/page-builder/src`、`tests`、`vendor/b2b`；插件入口与 Marketplace 位于插件清单和 `.agents/plugins/marketplace.json`。
- 验证：`npm run verify` 通过；TypeScript 行为测试、MCP 集成（含实际 PNG）、编辑器浏览器闭环、独立导出浏览器闭环全部通过。五个组件实例 `validate()` 成功，浏览器控制台错误为 0。
- 浏览器证据：[桌面](../artifacts/evidence/editor-desktop.png) 1440×900；[窄屏](../artifacts/evidence/editor-narrow.png) 680×900。Browser Skill 未在本任务工具清单中，按前端测试流程使用本机 Playwright/Chrome。两图已用 `view_image` 复核。
- 导出证据：ZIP 87 个文件；独立目录运行 5 个生产实例；无 `/Users/wangkewei` 或组件库桌面绝对路径；导入后 5 个节点保持。
- 缺陷与回归：真实组件加载初次暴露缺少 foundations/C-44/C-33 资源，补齐最小闭包；快速连续添加暴露旧异步渲染重复追加，使用写入队列与 render generation 修复；真实 Token 覆盖编辑器 `--muted`，以 `--pb-*` 命名空间修复。上述均由相同浏览器路径复测。
- 安装：官方 Plugin Creator 校验通过；Codex CLI 显示开发版已安装启用，缓存 `dist/server.js` 与构建产物一致。Codex 原生 App 不允许被当前 Computer Use 安全策略控制；当前任务又在安装前创建，因此未取得“原生右侧入口点击”和“新工具在同任务加载”的实际证据，A17 如实保持受阻。`open_in_codex` 浏览器回退只返回 queued，不计作可见验收。
- 自审：检查了 UI→HTTP→PageStore→domain→原子保存、MCP→同一 PageStore、Renderer 销毁/过期结果、导出固定 revision、路径与未知字段负例。未称独立评审。

## 2026-09-16 / 入口、共享状态、组件库与编辑器设计系统修复

- 缺陷证据：开发版 entrypoints 误用字符串数组；UI 未发布 model context；独立 MCP 进程可用相同 revision 覆盖；C-42 avatar 缺内容却先保存；编辑器外壳仍是原生控件。复现细节见 `ISSUE_SELECTION_BRIDGE.md` 与 `ISSUE_VARIANT_SWITCH.md`。
- 宿主与身份：开发版 displayName、MCP key/serverName、打开工具标题均独立；入口改为对象数组，资源 MIME 为 MCP Apps 标准，URI 提升到 editor-v5。宿主模拟验证最终 C-42 选区、清空、composerLabel、能力缺失提示，`ui/message` 调用为 0。
- 共享状态：FilePersistence 每次读取磁盘并使用按页跨进程锁；历史和选区按 revision 分代，页面文件最后原子提交。独立 HTTP/MCP 进程互读页面与选区，旧 revision 返回 409；两个 store 并发仅一个提交成功。
- 变体：C-42 avatar 切换同批补齐/清理配套字段；互斥布尔正规化；AI 非法组合提交前原子拒绝。C-21/C-23/C-34 只开放首版已经适配的 editorValues。
- 组件库：新增不可变内容摘要快照、候选协议/资源/Chrome 渲染校验、原子 apply/回退、页面钉住和显式页面升级。隔离源码只改 Token 即产生新版本而插件构建摘要不变；旧页面/导出/重新导入仍使用旧快照；破坏 C-02 schema 的候选被拒绝。
- 编辑器外壳：页面名、搜索、页签、工具栏、属性字段、布尔项、状态和反馈分别使用 C-21/C-23/C-41/C-02/C-04/C-11/C-42/C-49，公开事件驱动；页面 CSS 只保留编辑器关系布局并引用 B2B Token。800×800 下属性面板可从 C-04 入口打开。
- 回归：当前单元/领域/存储/组件库/MCP/浏览器/模拟宿主/跨进程/独立导出测试均通过；Browser Skill 未提供，继续按技能要求使用 Playwright/本机 Chrome。最新临时截图 `/tmp/page-builder-development-qa.png` 已用 `view_image` 复核，控制台错误 0。
- 尚未声称完成：命令行安装和模拟宿主不能替代 Codex 原生右侧入口、真实输入区引用和同任务 AI 回写，A09/A17/E07 保持待验证。
- 打包安装：Plugin Creator 官方校验通过（脚本缺失 PyYAML，依赖仅装入 `/tmp` 后运行）；cachebuster 更新为 `0.2.0+codex.20260916092747`。`codex plugin add` 重装成功，source/installed manifest、`dist/build.json`、server/UI bundle 逐文件 cmp 一致；从安装缓存启动 MCP 得到开发版标题、对象 entrypoints、serverName 与相同版本。旧 0.1.0 插件仍启用且未删除。

## 2026-09-16 / 恢复任务：原生空白仍待确认

- 最新用户截图显示旧版与开发版两个入口同时存在，不再沿用“入口消失”的描述。当前恢复任务可调用开发版工具并读取 v5 资源；原协调任务在 09:40:01–07 UTC 仍报 `unknown MCP server 'pageBuilderDevelopment'`。宿主 `widget_running` 与独立浏览器有画面都不等于用户右侧已正常显示，用户最新反馈仍为空白。
- 已在恢复任务再次调用真实 `page_builder_open`，由协调任务使用受支持导航切换到此任务，等待实际原生画面反馈；没有凭猜测改 CSP、server key、资源 URI 或宿主配置，没有重新安装。
- 原页面 `page_04d2d625961f` revision 29 与历史/选区先备份到 `/Users/wangkewei/Documents/Page Builder Backups/recovery-20260916-QzprRc`。统一原子操作将 revision 29→30：C-42 缺失 avatar 取原文字“标签”的首字“标”，C-21 保留带图标变体并补真实 specimen 默认 `prefixIcon: search`；其他内容不变，可通过页面历史撤销。重新加载独立浏览器得到 4 个有效节点、0 个画布渲染错误，证据 `/tmp/page-builder-recovery-data-fixed.png`；不替代原生验收。
- 另发现正文属性控件传入 maxLength 2000，而真实 C-21 长文本协议固定为 240，证据 `/tmp/page-builder-recovery-selection.png`。仅修正 `inputProps` 这一参数并构建，尚未安装或针对性回归；之前未发布的 inspector 串行化补丁保留。当前安装仍为 `0.2.0+codex.20260916092747`，工作区构建不等于安装产物。
- CLI 和已连接工具未提供单插件持久停用接口。未卸载旧插件、未改全局配置/缓存/宿主数据库；入口去重仍需用户在插件设置停用旧 `page-builder@page-builder-marketplace`，保留开发版。A09/A17/E07 继续待验收，基础属性编辑恢复亦未宣称通过。

## 2026-09-16 / 原生白屏修复已安装，待宿主重启加载

- 根因：用户在恢复任务仍确认整页空白。宿主只读源码 `app-initial-4d7ea7f81c2d.js` 的 `x9n` 过滤 HTTP 域名，`ui.csp` 与 legacy 字段均经过同一清洗；旧 v5 的 localhost base/CSS/module、动态组件库与 fetch 因而不能用于原生沙箱。HTTP 浏览器预览绕过宿主策略，此前预览成功不能验收原生白屏。
- 修复：原生 HTML 内嵌 JS/CSS；`page-builder://runtime/{snapshotId}` 仅读已验证快照；UI 使用 App 公开 `readServerResource/callServerTool`，固定映射至现有页面操作。只适配相对资源基址、脚本、CSS imports 和字体输送，不改 Renderer 语义/验证。独立 HTTP 模式保留，server key/资源 URI 不变；静态启动状态及失败提示不依赖外链。
- 定向验证：`node tests/native-resource.test.mjs` 从 MCP 读实际 HTML，以 srcdoc 和 `connect-src 'none'; base-uri 'none'; script/style unsafe-inline; font/img data:` 加载。首屏、正文编辑、保存重开、新增标签、服务拒绝失败提示均通过；HTTP 请求 0、控制台错误 0。截图 `/tmp/page-builder-native-resource-fixed.png` 已目视复核。build/typecheck 通过，无无关全量重测。Browser plugin not available，使用本机 Playwright/Chrome。
- 一次安装 `0.2.0+codex.20260916095350` 成功；cache server/UI 与构建 cmp 一致。由新缓存启动 MCP 读取资源包含 `__pageBuilderNative=true`，637705 字符，无 HTTP CSP 域名。此前未发布 inspector 串行化及正文 maxLength=240 修复已随此版本安装。
- 原生当前会话尚未加载：安装后当前任务真实 open 仍返回旧 `092747`，resources/read 报旧 cache 的 index.html ENOENT；安装器已清理旧目录但旧进程驻留。无公开自动重连工具，不能继续调用旧进程冒充恢复，需用户完整退出并重新打开 Codex 一次。A17/E07 仍待真实新进程与画面确认。
- 去重配置已完成：协调任务经公开 app-server `config/value/write`（expectedVersion CAS）设 `plugins.page-builder@page-builder-marketplace.enabled=false`，status ok；`config/read` 读回旧版 false、开发版 true。没有手改配置、卸载或删除旧安装/用户数据；实际菜单随宿主重新加载再确认。

## 2026-09-16 / 双上下文、真实变体与自适应面板

- 用户已能操作原生编辑器；本轮收到相同 pageId/nodeId/revision=37 的两份 model_context，sourceId 分别属于入口实例与 exec 调用实例。原实现启动及轮询都会发布选区，多个同页实例因而各自附加引用。
- 选区改为每页单活动面板：启动清除自身旧引用，不自动附加持久选区；用户点击组件/同步按钮才取得上下文所有权。BroadcastChannel 有序 claim 让其他实例清空自身引用，失去所有权的轮询不再发布，关闭时清理；页面数据仍共用原协议。宿主最终附件呈现需实际确认。
- 属性枚举从页面绑定的真实 Renderer `describe().api.props` 读取；输入框六种变体均可切换，同批补齐/清理配套配置，长文本 medium/240 约束保持。非数字内容转数值时明确拒绝并保留原内容。其他组件未适配的复杂变体按真实名称灰显并注明原因，不冒充可用。
- 移除固定最小高度和主区最小宽度、960px画布上限，使用宿主宽高、内部滚动及小宽度属性浮层；不改组件内部样式。
- 定向验证：build/typecheck、8项 domain 测试、native-resource、host-bridge 通过。真正 MCP HTML 无HTTP沙箱覆盖六变体渲染、保存重开、两个同页面板接管后仅一份非空上下文、520×440/320×360面板无根级溢出、初始化失败可见。Browser plugin not available，使用 Playwright/Chrome；`/tmp/page-builder-native-resource-fixed.png` 与 `/tmp/page-builder-responsive-320.png` 已目视。未改用户页面数据，未重跑导出等无关测试。native-resource 已加入标准浏览器测试脚本。
- 自审：所有权失去/关闭、排队发布与过期epoch、真实枚举/灰显限制、非法转换失败路径、编辑器布局边界。未称独立评审。
- 安装 `0.2.0+codex.20260916101606` 成功，最终自审补充空前缀/标签失败校验后刷新同一安装版本，8项domain及typecheck再次通过，最终缓存server/UI与构建cmp一致。当前 resources/read 仍指向旧095350目录并报ENOENT，需完整退出重开加载；原生附件去重和新布局实际验收不能由沙箱模拟替代。

## 下一步

### 2026-09-16 / 属性标题、长文本与卡片变体

- 属性文本/数字/枚举均增加可见标题与外层可访问分组；卡片标题、正文、辅助信息、选中状态按语义命名，未参与当前变体的正文等字段隐藏。卡片子项、页签、动作字段单独标题并支持增删；长文本恢复库默认 92px，显式提供自动增高开关，不静默改用户已保存内容。
- C-34 十变体使用真实 Renderer，切换同批补齐/清理配套属性；媒体变体需要图片，原生支持 ≤1 MiB 本地图片上传，拒绝不可加载的外链输入。领域层补结构/唯一ID/活动页签失败校验；变体切换提示专属配置重置和撤销恢复。
- 新回归暴露两处实际问题并修复：迟加入实例的时钟落后导致双上下文；原生非安全上下文不提供 randomUUID 导致“添加一项”失败。未弱化断言。直接 Renderer 对照中的 C-41 动画差异采用等待稳定态解决。
- 已通过 build/typecheck、9 项领域测试、native-resource（包括同 props/宽度的十变体逐元素计算样式/尺寸对照、上传、子项增删改）和 host-bridge；最终候选版本为 `0.2.0+codex.20260916111800`。安装状态在下方追加；原生实际效果仍须宿主加载后验收。未改用户页面，未改插件缓存或源组件库。自审覆盖 UI→领域校验、图片读取失败、节点已删除写入失败、Renderer 重建、上下文迟加入/关闭；不是独立评审。
- 最终候选 build/typecheck、9 项领域测试与 native-resource 再次通过；官方 CLI 安装 `111800` 成功，缓存 server/UI JS/CSS 与构建逐文件 cmp 一致。属性标题与长文本最终截图已目视复核。当前原生新版本仍待宿主重载，未重复调用 open 制造额外面板。

1. 在安装后新建的 Codex 任务中验证开发版原生右侧入口、输入区组件引用、同页 MCP 读取/修改及画布自动刷新，并补 A09/A17/E07 证据。
2. 宿主验收通过后，再按需求扩展复杂变体和后续组件覆盖；未适配能力继续保持不可选。

## 2026-09-16 / 组件库解耦实际核查

- 已读当前 MCP 状态及源码：外部来源 `sourcePath=null`；真实用户页 revision 102 仍为旧版本别名且缺精确绑定。新页默认快照与该旧页实际解析快照不同。
- 隔离副本实际改变 C-34 边框色：check/apply 后新页使用新色，绑定旧快照的页面不变，显式升级后改变；插件构建摘要未变。真实源库和用户页面未修改，未安装更新。
- 已复现缺口：Loader 只增加语义无影响的空格，候选检查通过，但原生资源生成失败。另有静态目录/默认值/领域校验、AI 查询未按页面版本和依赖文件清单耦合，不能称完整解耦。
- 结论、源码定位、隔离复现及下一步见 [组件库解耦核查](COMPONENT_LIBRARY_DECOUPLING_AUDIT.md)。本轮只审查和沉淀证据，未修复上述缺口。

## 增量记录模板

完成一项有意义增量时追加：

- 日期 / 代码版本 / 验收编号：
- 已完成的用户行为：
- 关键决定或规则变化：链接 ARCHITECTURE / DEVELOPMENT_WORKFLOW 的对应项。
- 验证：实际执行方式、结果、证据路径、未运行项；本地检查与 CI 分开标注。
- 评审：方式、检查范围、发现的问题及修复后的复测。
- 当前运行与安装版本、成果路径：
- 下一步与仍存在的障碍：

缺陷复盘采用“现象 → 最小复现 → 原因 → 修复 → 回归证据 → 是否需要更新规则”。只有可复用的经验进入工程规则，避免堆积一次性细节。

## 2026-09-17 / 公开变体与独立组件库修复

- 原因：静态属性子集限制 C-23；旧布尔值覆盖 C-42 加载/边框/可关闭等变体；原生输送依赖 JS 文本替换；固定资源列表遗漏后续资源。完整真实源库 283 个运行资源约 19.9 MB，复现 MCP 10 MiB 单消息上限导致连接关闭。
- 修复：UI/AI/后端读取页面快照的 schema，使用真实 Renderer 提交前校验；五个组件全部公开属性可进入组合编辑，复杂变体转换保留用户内容；源 JS 原样执行，CSS/字体输送统一，MCP 以 100 万字符分段（真实库 25 段）。详情见 COMPONENT_LIBRARY_LIFECYCLE。
- 独立更新：左侧来源、手动刷新和按页持久的自动刷新；打开期间每 5 秒检查，编辑/未应用的属性草稿/保存期间暂停；不兼容更新保留当前版本。源码和插件产物分别版本化，已有页钉住原快照。
- 验证：typecheck；17 项领域/存储/组件库/导出单测与 1 项 MCP 集成；完整真实源库的严格无 HTTP 原生资源测试（37 种变体、4 种标签类型、十种卡片逐元素样式对照、全属性应用、保存重开、两视图上下文与窄屏）；实际拖拽/编辑/移动/删除/撤销/预览；跨进程冲突；独立 ZIP 5 个生产实例。新增 library-refresh 测试验证可见边框三次变化、新增 CSS、公开说明、Loader 空格变化、插件构建不变、失败保留和未应用草稿保留。临时截图已目视复核。
- 过程中修正：候选 file:// 校验页缺 UTF-8 造成中文枚举乱码；设置控件与组件列表共用销毁前缀；源资源过大；自动刷新重载后开关丢失；完整属性草稿可能被更新重载。没有改写源库以迁就测试。MCP 测试原先遗漏独立 library cache，初始化曾写入真实缓存设置；已补隔离路径，未在该测试修改真实页面。
- 自审：UI/MCP/存储两端版本与校验、变体伴随状态、资源加载/大小、异步编辑与重载、候选并发、settings 锁、历史/导出和旧页迁移。没有使用或宣称独立 Agent 审核。
- 安装：官方校验与 CLI 安装通过，最终 `0.2.0+codex.20260917024416`；安装包与源码构建的 server/UI/CSS/transport/manifest/skill 逐文件一致。安装包启动验证新增工具、页面版本查询和分段资源可用；旧版插件保持 disabled，MCP key 与 editor-v5 URI 未改。
- 用户数据：备份 `/Users/wangkewei/Documents/Page Builder Backups/decoupling-20260917-103829`；真实页面 `page_04d2d625961f` revision 153 内容/排列/历史保留，补精确绑定 `b2b-d660e63477b64707`。独立来源配置 `/Users/wangkewei/Desktop/ai-design-system/design-source`，默认源快照 `b2b-7a13fb7f6e235b6b`，该页面新编辑器自动刷新已开启。为避免已打开的旧代码面板突然重载，新源版本由新编辑器打开后再升级当前页；当前页在本次配置结束时仍为原 revision。
- 宿主状态：当前旧任务进程没有公开热重载接口；实际 Codex 面板加载最终版本仍待完整退出重开一次，不以独立进程/无网络沙箱代替该证据。之后兼容的源库更新无需再安装插件。
- 范围：只完成当前左侧 5 个编辑适配组件。其余生产组件及任意未来破坏性 API 更新未承诺自动适配；源 schema 缺嵌套字段时通用表单仍需后续易用性扩展。
- 可追溯配置与验证汇总：`artifacts/evidence/component-library-decoupling-fix-20260917.json`。

## 2026-09-17 / 改为手动刷新组件库

- 用户明确取消自动更新，以减少资源消耗。移除 5 秒源库检查、自动刷新开关、HTTP/MCP 自动刷新接口；初始化清理遗留配置。当前真实配置已关闭并移除自动刷新，独立源目录和页面绑定保持。
- 左侧只保留「刷新并重载组件」：点击才检查源库；兼容更新保留页面内容/排列，源库未变化时也重载当前组件且不增加 revision。有未应用草稿或正在保存时阻止重载；不兼容候选仍不应用。
- 定向验证：typecheck/build、library-refresh 浏览器测试、官方插件校验通过。测试跨过原 5 秒周期确认源库请求为 0；多次手动源 CSS 更新、无变化重载、源公开说明、新 CSS 依赖、Loader 空格变化、失败保留、草稿保护均通过。没有重跑与本次改动无关的 37 变体测试。
- 安装最终 `0.2.0+codex.20260917070359`；安装包与构建/manifest/README/skill 逐文件一致；从新安装启动 MCP 确认手动刷新工具存在、自动刷新工具移除、真实 sourcePath 保留且旧自动配置已清理。当前已打开的宿主面板仍须重新载入新插件代码。
- 自审覆盖 UI 唯一按钮调用路径、后端移除自动入口、旧配置迁移和未应用草稿，未声称独立评审。实现方式同步更新 ARCHITECTURE、FEATURE_PLAN、COMPONENT_LIBRARY_LIFECYCLE 与插件说明。
- 本条取代上一条自动刷新策略；证据：`artifacts/evidence/component-library-manual-refresh-20260917.json`。

## 2026-09-17 / 上下文空附件修复，展开错误待实际信息

- 用户确认点击输入区上下文附件时出错。只读核对当前宿主后复现：清除消息仍包含 structuredContent 对象，因此启动即附加一份空上下文，多面板留下多份。旧测试以 pageBuilderSelection 的真值代替宿主附件规则，遗漏了此问题。完整原因见 ISSUE_SELECTION_BRIDGE 最新记录。
- 修复清除消息、3 秒请求超时/可重试状态、teardown/主动重载等待清理与过期响应检查；修正长错误文字覆盖重试按钮。未修改源组件库或用户页面。
- 验证：host-bridge 先失败后通过；native-resource 严格无网络资源与同源两面板真实附件计数通过，含既有变体/保存/窄屏回归；build/typecheck 与官方插件校验通过。Browser plugin not available，使用现有 Playwright/Chrome，控制台错误 0，截图 `/tmp/page-builder-context-fixed.png` 已目视复核。测试缓存/页面/导出均隔离。
- 自审覆盖协议两端、超时取消、所有权接管、关闭/重载、失败按钮可点击性；没有独立代理审核。
- 安装 `0.2.0+codex.20260917094952`；manifest/build/server/UI JS/CSS/context-owner 与新缓存逐文件摘要一致，宿主现有进程和面板尚未验证加载新版本。
- 未完成项：用户所报的附件展开错误未取得报错原文，不能断言由空附件引起或已解决。Computer Use 明确禁止访问 Codex，未绕过该限制；异步问题等待用户补充具体报错。后续只针对实际弹层错误定位，不继续无关全量验证。

## 2026-09-17 / 修复手动刷新后的原生白屏

- 原因：手动刷新、loadRuntime 和页面快照变更处理对原生注入文档调用 location.reload，重载空的承载页面后编辑器代码不再存在。之前用 HTTP URL 和 srcdoc 验证，没有复现真正动态注入文档的重载行为。新的 native-refresh 测试修复前 `#app` 数量 0（应为 1），直接复现白屏。
- 原页面经 MCP 确認 revision 164、5 个节点和选区仍在，没有数据丢失。本轮未修改用户页面；安装前备份到 `/Users/wangkewei/Documents/Page Builder Backups/native-refresh-20260917-180439`。
- 修复：原生组件库在当前文档内重建，保留 MCP App、上下文所有权和编辑器状态。输送层跟踪并释放库创建的脚本/样式/字体/全局导出，源 JS 不改写。完整下载后才替换运行库；失败保留或恢复原画面并提示重试，使用服务端已经保存的 revision，避免重试永久冲突。HTTP 路径保持原有普通页面刷新。
- 验证：native-refresh 从真实 MCP 资源动态注入，连续改变源 JS/CSS、无变化刷新不加 revision、运行节点不增长、同一个宿主连接、保留内容/选区、刷新后编辑、资源读取失败及替换缺 loader 恢复/重试均通过。当前完整 design-source 的隔离副本通过连续刷新与读失败重试；library-refresh HTTP/草稿保护/无自动更新回归通过。build/typecheck/官方校验通过，未重跑无关全量测试。
- Browser plugin not available，使用既有 Playwright/Chrome，严格禁用 HTTP；截图 `/tmp/page-builder-native-refresh-fixed.png` 已目视。测试 pages/library cache/exports 和源库改动均在临时目录。
- 自审：原生三个重载入口、全局/资源释放、过期异步控件、失败回退、持久版本与显示版本区分、重试可用性。未使用独立代理。
- 中间候选 `0.2.0+codex.20260917100600` 安装后，在截图补查中发现变体下拉框无法保持打开。原因是 source.bindInteractions(document) 的全局事件监听不会随组件实例销毁；新增运行期监听回收，保留安装输送层之前注册的宿主桥接与插件生命周期监听。连续刷新、读取失败重试和运行库回退之后，真实点击卡片变体从 basic 切到 compact 的定向回归通过，没有弱化交互断言。最终安装版本在下方追加。
- 最终 `0.2.0+codex.20260917101345` 已安装并核对运行文件与构建完全一致；监听清理修复后的完整独立源库测试（含刷新后编辑/变体切换/上下文/失败恢复）通过。异常资源模拟曾把完整库拼成单响应，产生测试 Node Socket MaxListeners 警告，已改用最小空资源负例；正式 UI 保持每批 4 个分段资源读取，没有放大单消息或调整监听数量上限。当前真实 Codex 面板需加载此最终插件版本，未声称已直接控制受限制的宿主界面。
## 2026-09-18 / 属性解耦边界核查与中文化

- 用户反馈右侧属性与组件库不一致、选项仍英文。核对当前页面 revision 169 / b2b-7a13fb7f6e235b6b 与当前源库，五组件的 76 个公开属性和 37 个变体一致。差异来自公开 props 与 specimen 组合维度、示例数据的不同，以及插件维护的常用字段/转换规则；此前“完全解耦”表述不准确。详细机制与未完成边界已沉淀 COMPONENT_LIBRARY_LIFECYCLE / ARCHITECTURE D21。
- 修复现有变体、类型、尺寸、外观、颜色、状态和布局选项的中文显示。源 schema 决定允许值，显示词典不限制枚举；UI 选择反查源值，常用栏/全部属性共用，防重名与数字转字符串。未知新增值保留原标识。未修改组件库、用户页面或选区。
- 修复前定向复现显示 bordered；修复后完整真实源库的 native-resource 通过 37 变体、4 类型与中文全属性保存，native-refresh 通过连续重载后中文切换，library-refresh 通过隔离新增字段/枚举变化、无插件重建与内容保留。单测、build/typecheck、官方插件验证通过；未重跑无关全量测试。截图已目视复核。
- 自审：源 schema 与显示词典边界、双向映射、未来未知值/标签冲突/数字类型、完整属性草稿、刷新生命周期；未使用或宣称独立代理评审。安装版本和宿主状态见本节后续记录。
- 官方 CLI 已安装 `0.2.0+codex.20260918033444`，manifest/build/server/UI/显示词典/transport 等七项与源码构建逐字节一致。未宣称当前 Codex 旧进程已加载该版本；当前可靠加载方式仍为重启宿主后重开原入口，组件库后续兼容更新只需手动刷新。

## 2026-09-18 / 0.1.1 源码归档

- 按用户指定将此前未提交的插件修复、离线依赖、测试、工程文档与证据一起归档为 0.1.1，使用本地 Git 提交和 v0.1.1 标签。manifest、package.json、lock 根包和构建标识统一为 0.1.1；历史安装记录保留原编号。
- 增加插件 CHANGELOG，明确完整编辑描述协议尚未实现、原生上下文附件展开错误仍待实际证据，不把讨论方案记作已完成能力。
- 归档检查：build、typecheck、18 项单测、1 项 MCP 集成、官方插件校验、版本一致性与 diff 空白检查通过。本轮未修改运行逻辑，不重复此前已通过的浏览器流程。
- 本次为源码提交，不重装插件或触发宿主重启；现有安装仍为 0.2.0+codex.20260918033444。用户页面与独立源库保持原状态。

## 2026-09-18 / GitHub 发布打包补充

- 用户明确要求推送 GitHub。目标 wangkewei09/page-builder-marketplace，已连接 origin；在隔离 release/0.1.1 工作树合并远端 v0.1.0 历史并携带构建产物。生产 Marketplace 名称保留 page-builder-marketplace，当前开发目录名称不变。
- 发布包独立启动验证发现缺 playwright-core；构建改为将该运行依赖及许可证复制到 dist/node_modules，增加隔离安装回归，Node 要求同步为 20+。独立复制 dist 后启动、真实组件校验/添加通过；不依赖开发目录 node_modules。
- 发布源码与安装产物的最终提交位于 release/0.1.1；GitHub 是否已更新需以远程分支和标签读回为准，不以本地提交代替。

## 2026-09-18 / 编辑协议 v1 两端落地

- 前次 GitHub 发布已完成：main 与 v0.1.1 远程读回均指向 `7d5d156eebc3878846fea327678d93fc2e8ae89c`。本节为后续本地开发增量，不移动已发布标签。
- 用户明确要求插件端实施，同时在 ai-design-system 新起任务。已创建任务 `01a0b3d2-57f6-7191-9448-a7d8b6737cde`（实现组件库搭建器编辑协议 v1），两边依据 BUILDER_PROTOCOL.md 协作，写入目录分离。
- 插件新增纯 JSON 解析/版本与字段/枚举/控件/条件校验，源元数据生成分组、中文、条件字段、图片与嵌套编辑；未知新 API 字段仍可见。显式转换先校验条件，再在一次页面操作里写入。布局仍由 LayoutNode 管理，未来 node.editor 只预留命名边界，不创建未使用持久化字段。
- 组件库任务已完成：五组件 76 个字段、10 条简单转换；独立 JSON SHA256 `f271ef3447fffec4e33702cb03002791a21440fcfc3b4ce91abffaf38cdeab7d`。80 项库端测试与浏览器专项通过，386 个原有源文件哈希不变。库端维护说明位于 `/Users/wangkewei/Desktop/ai-design-system/docs/BUILDER_CONTRACT_MAINTENANCE.md`，验收见该库 docs/builder-protocol/DELIVERY.md；其本地目录无 Git，未发布。
- 实际联调纠正：C34 图片需要在切换媒体变体前可填写；C21 union 值需要 controlWhen；reset 使用 presets 加载后的有效默认值，C34 loading 清空操作文案使用 set:null；compact/tabs 等不消费的 body/meta 按源规则隐藏。源 API 缺嵌套类型时不猜类型。
- 插件验证：build/typecheck、23 项单测、MCP 集成与独立安装包测试通过；真实源 builder-source 的 37 变体/4 类型、数字/空值、图片上传、嵌套中文编辑、保存重开/导出通过；builder-inspector 覆盖只改源元数据/新属性、中文原值、条件、失败保留、草稿取消；library-refresh 通过无自动检查/草稿保护/可见 CSS 更新；native-refresh 通过严格无 HTTP 动态注入元数据更新、同宿主连接/内容/失败恢复；旧库 native-resource 全变体/十卡片样式对照/两面板上下文/窄屏通过。
- 自审覆盖协议两端、有效默认值、缺文件与坏文件区别、元数据 HTML 注入、条件规则重叠、原值与中文映射、草稿/失败 UI 恢复、同快照导出、原生重载生命周期。组件库任务负责库端检查，不把本端自审称为独立代码评审。
- 边界：复杂输入/选择器/卡片内容转换和头像文字补齐仍有插件兼容适配器。C42 avatar 与 checkable 的组合在旧 bundled Renderer 可被真实校验拒绝，此轮未改组件算法或放宽校验；已验证的四类型切换不等于所有属性笛卡尔组合都合法。当前真实 Codex 面板加载需单独确认，不以原生沙箱代替。
- 开发安装版本 `0.1.1+codex.20260918094616`。安装前备份真实 pages 与库设置到 `/Users/wangkewei/Documents/Page Builder Backups/editor-protocol-20260918-175001`；测试没有升级真实页面的组件库，仍需用户手动点刷新。最终安装一致性和用户数据摘要核对在本节追加。
- 最终安装核对：manifest、MCP、build、server、UI、CSS、transport、Playwright 包与 Skill 共 9 项与源码构建逐字节一致；备份中的 289 个页面/历史/设置文件摘要无变化。官方 CLI 安装成功，当前已打开的旧面板没有被操作或重启。
- 安装包独立启动验证：从最终缓存启动 MCP，pages/library/exports 指向临时目录；真实源候选检查与应用、component_get 返回 controlWhen/图片描述、原生 UI 资源版本正确。此检查不等于当前 Codex 已打开面板加载新版。


## 2026-09-21 / 拖拽占位与组件让位

- 用户要求先改善拖拽落点和动画。原实现只接受容器、固定末尾追加，仅空容器有提示；已有组件间没有插入位置。新增独立 canvas-drag 控制器，以蓝色占位和容器/序号提示反馈落点，现有节点通过 180ms 位移动画让位；add/move 提交明确 index。
- 已完成：新组件开头/中间/末尾插入、已有组件排序、空布局及跨纵向/横向/分栏容器移动、换行/多行位置计算、长画布边缘滚动、取消/原位放回不写历史、减少动态效果。组件库源文件、生产组件样式和属性协议均未修改，无新增插件依赖。
- 验证中修复：占位替换空提示后快速松手漏 drop（补 dragenter 接收）；源节点移走导致目的容器跳位（静止指针保留预览落点）；flex 压缩长画布造成内容画在白底外（保持内容高度）；Chromium 默认拖拽滚动在 Esc 后继续滑动（拖动期间由控制器独占滚动）。原基础浏览器测试“类型”模糊定位撞上变体提示，改精确属性组，library cache 一并隔离。
- 检查通过：build/typecheck、23 项单测、MCP/独立包 2 项测试；完整基础浏览器流程；新增 drag-preview 十组真实鼠标流程；最终版本 native-refresh 严格无 HTTP 动态注入文档中，在多次组件库刷新/恢复后拖入仍只有一次提交。页面身份/非空/渲染错误/控制台/交互/截图检查通过，故意注入的版本冲突和保存失败单列。没有为本次画布改动重跑无关全变体测试。
- 采用 frontend-testing-debugging 与 plugin-creator 技能；本任务缺少 Browser skill，使用既有 Playwright/Chrome。桌面 1440×1000、窄面板 520×760、原生资源 1420×960；截图和连续交互数据位置见 ACCEPTANCE。截图已目视复核，原生截图等待让位动画结束。
- 自审范围：DOM 临时预览与持久化单一事实、移动索引/循环排除、并发 revision、失败恢复、异步绘制、取消/teardown 生命周期、库重载监听归属、长页面与减少动态效果。未运行独立 Agent 审查。
- 已按官方 CLI 安装开发版 `0.1.1+codex.20260921073949`，入口/MCP key/UI URI 保持现状。10 个安装运行文件与源码构建逐字节一致，安装包 MCP 原生资源读回验证新版本及拖拽实现；真实页面/历史/设置备份到 `/Users/wangkewei/Documents/Page Builder Backups/drag-preview-20260921-154209`，293 个文件安装前后摘要不变。
- 官方插件校验通过。原临时 PyYAML 目录已失效，重新在 `/tmp/page-builder-validator-drag` 安装校验器所需 PyYAML 后执行，未添加到插件依赖。
- 当前已打开的 Codex 面板是否加载新版本仍需实际确认；官方安装后的新任务是尝试入口，没有自动重启或操控受限制的宿主。改动本地提交，不发布/覆盖 GitHub v0.1.1。


## 2026-09-21 / 更新后新任务空白：确认旧插件进程引用已删除目录

- 用户在新任务打开仍为空白。宿主实际 `page_builder_open` 返回旧版 `0.1.1+codex.20260918094616`；新安装目录为 `0.1.1+codex.20260921073949`。宿主子进程 85731、89446 的 cwd 仍指旧版目录，旧目录已经不存在。
- 宿主日志 `codex-desktop-45543443-6571-480b-b2b1-65710b9ef3ee-84910-t0-i1-021033-1.log` 在 07:59 UTC 反复记录 mcpServer/resource/read ENOENT，明确缺旧版 dist/ui/index.html / styles.css。因此不是拖拽代码渲染崩溃，而是宿主没有重新启动插件服务，资源尚未交给 UI。
- `page_list` 实际返回原页面 page_04d2d625961f / revision 176，数据仍可读。未改用户页面、安装缓存或宿主配置，未强行终止宿主或其他任务。
- 更正前次交付：“新任务重新打开”不能保证当前宿主加载新版。当前恢复步骤为完整退出 Codex（⌘Q）再启动，重新打开原开发版入口，检查底栏构建号。重启后的真实结果待用户执行后确认，不标记恢复完成。
- 本轮仅沉淀实测诊断与交付规则，不重复构建/重装或变体回归，避免再次删除运行中进程依赖的目录。

## 2026-09-21 / 选中按钮、明确上下文引用和增量更新

- 根因：选中工具栏在离线 shell 内启动挂载，尚未接到 DOM 就被生命周期清理；每次操作销毁全部画布 Renderer 再 replaceChildren，造成整体闪动和状态丢失。
- 实现：选区浮层挂载真实源 C-02/C-04，提供复制/删除/上移/下移与原生上下文按钮；节点 ID 协调 DOM，新实例先准备，移动复用，删除/变化仅释放对应实例。属性面板及页面名无关变化不重建。
- 上下文按推荐方案改为显式加入，用户没有选择相反选项；普通选择只编辑，已加入节点的已保存内容继续同步，删除清空。Skill 优先按显式附件 nodeId 读取最新页面，避免换选后误改其他对象。
- 用户追加要求：Foundation 颜色/字体/字号/间距/圆角/阴影/动效引用源 Token，静态装饰图标改用源 runtime.icon/Material Symbols；无自绘 P/Unicode 符号代替图标。字段 CSS 加 pb 前缀，不污染组件内部 `.field`。未改组件库或新增依赖，手动库刷新策略不变。
- 回归中修复：工具栏迟完成导致快速换选引用错误；保存返回覆盖新点击；属性异步装配时操作旧控件；重载结束忘记解除 inspector inert；窄屏浮层被属性栏遮挡/错误换行；占位提示换行撑高导致移出容器命中变化。具体连续证据及通过检查见 ACCEPTANCE 最新段。
- 官方 CLI 安装 `0.1.1+codex.20260921084205`，保留原 entry/MCP key/UI URI。13 个安装运行文件与源码构建逐字节一致；从新缓存启动隔离 MCP 读回 729401 字符原生资源，确认版本和新增实现。原页面/历史/设置 309 个文件备份到 `/Users/wangkewei/Documents/Page Builder Backups/selection-incremental-20260921-164508`，安装前后摘要一致。
- 按此前已复现的旧宿主进程问题，明确要求本次完整 ⌘Q 退出再启动，未把“新任务”当作生效保证；未强制关闭用户宿主或操作受限制 UI。真实加载状态仍待用户重启后确认。本次只作本地开发提交，不发布/覆盖 GitHub v0.1.1。

## 2026-09-21 / 多组件一并加入上下文

- 画布和结构树支持 ⌘ / Ctrl 多选，显示数量与汇总；普通单击恢复单选。多选组为本面板临时状态，持久活动节点和页面协议保持兼容。
- 显式加入会发布一个包含全部 nodeIds/nodes 的附件；相同类型的多个实例仍有独立身份。换选保持引用，已保存属性持续更新，部分删除剔除对应项，全部删除清空；拒绝后换选再重试保留原引用组。Skill 同步使用组协议。
- 定向回归和自审完成，详见 ACCEPTANCE 与 `artifacts/evidence/multi-context-20260921.json`。修复了重试按当前视觉选区替换失败组的问题。Ctrl 分支为事件验证，未声称 Windows 实机测试。
- 官方 CLI 安装 `0.1.1+codex.20260921092603`，13 个安装运行文件与源码构建一致；新缓存的隔离 MCP 可读出 733855 字符原生资源。用户页面/历史/配置 325 个文件备份至 `/Users/wangkewei/Documents/Page Builder Backups/multi-context-20260921-172641`，安装前后摘要相同。
- 已告知需完整 ⌘Q 后重新启动加载插件。本次未重启用户宿主，未把隔离服务当作宿主实际生效证据；没有发布 GitHub 或改组件库源文件。组件库仍手动刷新。

## 2026-09-21 / 空白取消选择与页面概览

- 原因：根布局点击仍选择根节点，外围画布没有清除入口。现在根布局空白和画布留白清除视觉/持久选区，保留显式上下文；子布局保留选择能力，预览/拖动/未应用草稿维持保护。
- 未选择时右侧显示页面名称、组件/布局数量、编辑提示及源 C-02「页面布局」入口，选中后恢复属性。统计来自当前 Schema，页面名仍在顶部修改，无新增页面数据或库端修改。
- `multi-context`、`incremental-canvas`、`host-bridge`、`native-refresh`、typecheck 与插件校验通过；重载后监听有效，证据见 ACCEPTANCE 与 `artifacts/evidence/page-overview-20260921.json`。只作自审，没有独立 Agent 评审。
- 官方 CLI 安装 `0.1.1+codex.20260921094936`。325 个用户页面/历史/配置文件备份于 `/Users/wangkewei/Documents/Page Builder Backups/page-overview-20260921-175045`，安装前后摘要相同。当前宿主加载新构建仍需完整 ⌘Q 后启动；没有强行重启或发布 GitHub。

## 2026-09-22 / 画布内容编辑与属性去重

- 支持源 C-21 浮层、单击选中/双击编辑、定位按钮、文字/数值、输入法、失焦/Enter/取消；保存共用 Page Schema、revision、撤销与显式 AI 引用。未变化的画布节点继续复用。
- 原重复属性表改成只含未展示字段的「其他设置」，复杂草稿仅保存变化属性。Source JSON 映射随手动快照重载；源位置缺失退回右侧，空映射可禁用旧兼容映射。没有加入自动组件更新。
- 回归通过：25 项 TS + 2 项 MCP/独立包、前端编辑/拖拽/增量、多引用、原生资源、真实源 37 变体/4 标签类型、10 卡片样式几何对照、重复库重载与失败恢复、原生无 HTTP 的映射更新、协议错误/草稿/并发保护。源端检查器和既有 80 项协议测试通过。
- 发现并处理：输入控件异步挂载完成前 fill 会被稍后的 select() 干扰，测试等待 ready；源控件挂载失败时全局 Esc 仍可退出；避免快速重复打开残留浮层。
- 已知范围：图标选择器、复杂列表的画布编辑未实施；源 C-21 长文本固定 240 字，UI 明示限制。既有组件 Renderer、API、样式均未改动；源目录只增加/补充编辑元数据、作者检查器和维护文档。
- 使用已有 Playwright/Chrome 153.0.8010.53；本会话未提供 Browser skill。桌面/窄屏已用 view_image 复核。自审覆盖 API 两端、生命周期、草稿和异常，无独立 Agent 评审。
- 官方 CLI 安装 `0.1.1+codex.20260922093539`；15 个 manifest/runtime/skill 文件与源码构建逐字节一致，fresh isolated installed MCP 返回非空原生资源。327 个用户页面/历史/配置文件已备份且安装后哈希未变。真实已运行 Codex 宿主加载新代码不由这些结果代替。
- 证据：[验收与安装](../artifacts/evidence/inline-editing-20260922.json)，[桌面](../artifacts/evidence/inline-desktop-20260922.png)，[窄屏](../artifacts/evidence/inline-narrow-20260922.png)。

## 2026-09-22 / 修正为组件文字原位编辑

- 依据用户截图，上一版额外 C-21 浮层不符合“组件里直接改”。移除浮层及其定位/挂载逻辑；源纯文本元素临时开启 plaintext-only，按钮只包裹文字节点，原生输入框复用本身。原节点/属性关闭后恢复，取消不保存，正确区分 DOM 草稿与持久 props。
- 按钮/输入控件编辑时暂时保持其当前源颜色，结束释放，不写源 CSS；图标、加载动画和其他组件实例保留。粘贴只有纯文本，正文不误继承弹窗 C-21 的 240 字限制；IME 确认、非法数字、保存拒绝/重试、409、撤销/重做均覆盖。
- 构建/typecheck、25 项 TypeScript 与 MCP/package、原位专项、browser、host-bridge、drag-preview、incremental-canvas、builder-inspector、native-resource、native-refresh、真实源 builder-source 均通过。原生资源含无 HTTP 严格 CSP、37 变体和 10 卡片几何对照；真实源 76 字段/37 变体/4 类型通过。首次 source 检查未带测试源环境变量，补齐后通过；首次构建误在仓库根目录运行，改在插件目录完成构建，不计失败命令为通过。
- Browser skill 在会话清单中不可用，沿用前端测试技能允许的 Playwright/本机 Chrome。已查看[桌面](../artifacts/evidence/inplace-desktop-20260922.png)和[窄屏](../artifacts/evidence/inplace-narrow-20260922.png)截图。专项断言原字体/颜色/文字边界、同一个图标/节点、无弹窗、取消后原 HTML、禁用/加载时原位键入和预览恢复事件。
- 327 个用户页面/历史/配置文件备份到 `~/Documents/Page Builder Backups/inplace-editing-20260922-180629`，安装后逐文件 SHA256 未变。官方插件/skill 校验通过，15 个安装文件与源码产物一致，隔离 fresh MCP 资源包含原位实现；真实已运行 Codex 宿主不据此标为通过。
- 自审完成，未声称独立 Agent 审核；未推送 GitHub、未改已发布 v0.1.1 标签。源组件库只同步说明文件，不变更 Renderer/API/CSS/Token，故不属于组件实现 Level C 修改。证据见 [验收记录](../artifacts/evidence/inplace-editing-20260922.json)。

## 2026-09-24 / 项目层级与本地/GitHub 工程方案

- 核对当前全局 PageStore、可注入目录的 FilePersistence、严格页面 Schema、按页 HTTP/MCP API，以及仅存在本机缓存的库快照引用。
- 提案按项目/画布/页面分层，独立画板位置与页面内容；多工程访问需区分同仓库不同本地副本。资源锁和可移植快照是 GitHub 克隆恢复的必要部分。
- 区分搭建器工程克隆与任意业务源码逆向；后者没有宣称可用。记录分阶段实现及存储失败、切页、外部改动/Git、渲染性能的验收要求。
- 本轮为方案记录，没有功能实现、测试通过或安装的新声明；仅检查文档链接和 diff。

### 同日补充 / 复用 GitHub 插件

已核对现有 GitHub 工具及官方 MCP/UI 文档，补充推荐分工：搭建器专注本地项目、画布、页面；GitHub 工具与本地 Git 由 Codex 串联。未发现 GitHub 工具直接克隆本地仓库的接口，也未验证 iframe 跨插件直调。未进行账户/仓库操作，方案仍待实现。

## 2026-09-24 / 本地项目创建已实现并安装

- 已交付顶部项目入口：创建、路径打开、最近项目、多页创建/切换/复制、历史页面复制导入。文件保存到项目目录，默认画布描述已保留；无限画布交互和 Git 按钮仍待实现。
- 项目工作区贯穿 HTTP/MCP/AI 上下文与截图；相同 projectId/pageId 的两个目录不串写。便携快照在空缓存恢复通过，失败创建和资源损坏保留用户文件。
- 原位保存后直接进入项目菜单通过；修复编辑捕获事件吞掉紧接的添加点击，以及选中操作栏未完整挂载就显示的时序问题。跨库项目切换失败可恢复旧页面。
- build/typecheck、26 项 TypeScript、MCP/package 2 项、13 个浏览器脚本集合分段通过。原生 MCP 严格 CSP 与项目 1440px/680px 截图已检查。初次失败现场、自审和最终补跑结果见 [证据目录](evidence/2026-09-24-projects/README.md)。
- 官方 CLI 已安装 `0.1.1+codex.20260924071459`；16 个关键文件与构建一致，隔离安装版 MCP 已实际新建并读回项目。353 个真实用户页面/历史/配置文件备份后比较 SHA256 不变。
- 用户打开的 Codex 宿主尚未验证加载本版；需要完整退出重开后检查顶部项目入口。源码、安装包、独立新 MCP 与当前真实宿主分别记录；未推送 GitHub。

## 2026-09-24 / 项目卡片工作台已安装

- 按用户 Figma 截图改为完整项目展示页，左导航、搜索与卡片网格，卡片进入项目页面或单独设置名称/说明/封面/收藏。保持顶部项目名称入口，继续编辑返回原画布。
- 项目设置独立 revision 与原子保存；显式按卡片 workspaceId 访问，不跟随当前编辑项目误写。移动后的项目保留卡片，可验证身份并重新关联路径；不移动或删除项目文件。
- 使用源 C-34 actions/interactive、C-02/C-21、Foundation 与图标，未改源库。封面仅手动上传；无限画布和 Git 操作仍是后续功能。
- 构建/typecheck、27 项 TS、2 项 MCP/package、projects/browser/native-resource 通过，1440/680/420 截图已检查。此次自审，实际失败和修正见 [证据](evidence/2026-09-24-project-cards/README.md)。
- 官方 CLI 安装 0.1.1+codex.20260924080549；16 个文件一致，隔离安装版 MCP 实际新建并保存项目设置成功。353 个原用户文件备份后 SHA256 不变。运行中的真实 Codex 插件进程还需完整退出重开，不把隔离验证等同于用户面板已生效。未推送 GitHub。

## 2026-09-24 / 选择本地文件夹

- 新建、打开、重新关联提供 C-02「选择文件夹」按钮；macOS 系统目录窗口只负责选择，ProjectManager 继续负责显式确认后的创建/校验/登记。取消不改变草稿，路径折叠只读显示。
- 选择请求异步返回 ID，用户浏览期间查询状态，3 分钟超时中断；系统进程通过结构化参数启动。没有组件自动刷新或文件扫描。
- 31 个 TS 行为测试、2 个 MCP/package、项目浏览器专项通过；安装版 16 个关键文件一致，新工具 app-only 与项目保存通过。353 个原用户文件摘要不变，备份见证据。
- 原生适配器启动后 pending→超时，两次都无用户返回；CUA 无法绑定 osascript，因此没有将 OS 选择窗口实操记作通过。已请求用户确认；真实 Codex 新版加载也仍待新任务重开确认。
- 新构建 `0.1.1+codex.20260924085012` 经官方 CLI 安装，本地提交不等于 GitHub 发布。详见 [专项证据](evidence/2026-09-24-folder-picker/README.md)。
