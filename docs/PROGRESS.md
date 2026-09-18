# 当前进度与验证证据

更新时间：2026-09-16。

## 当前状态

首版本地实现已完成第二轮修复：开发版身份和原生入口协议、MCP Apps 选区桥、跨进程页面/选区事实、组合变体校验、独立组件库快照，以及编辑器外壳真实设计系统均已实现并在隔离环境验证。剩余完成条件集中在重装后新 Codex 任务中的原生右侧入口、输入区引用和同页 AI 回写实测（A09/A17）。

已安装开发版：`page-builder@page-builder-development`，版本 `0.2.0+codex.20260916111800`。它来自本正式目录；旧 `page-builder@page-builder-marketplace` 已停用，保留用户数据。当前已打开的面板不能据安装成功推断已加载新版本。

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

## 2026-09-18 / GitHub 0.1.1 发布树

- 用户明确要求提交到 GitHub，目标为 `wangkewei09/page-builder-marketplace`。正式开发目录原先无远程且与 GitHub v0.1.0 为独立历史；在隔离 release/0.1.1 工作树合并，保留双方历史，不强推覆盖。
- GitHub 的 Marketplace 名称保持 page-builder-marketplace；本机开发目录继续使用 page-builder-development，避免改动现有安装入口。发布树同时包含源码、测试、文档和重新构建的自包含 dist，安装命令更新为 v0.1.1。
- 发布构建/类型检查/官方插件校验通过；发布包 MCP 测试使用隔离页面和组件缓存，不触碰用户数据。此前源码归档与正式 GitHub 发布分开记录，不能把本地 commit 当作已推送。
- 隔离删除开发依赖后发现 dist 启动缺少 playwright-core；构建改为携带完整运行依赖及许可证，增加 package.test.mjs，在全新临时目录仅复制 dist 后启动并实际校验/添加组件。Node 要求与该运行依赖统一为 20+，Chrome 要求显式记录。源库 vendor 文件按原字节分发，不为消除其既有空白改写第三方源码。
