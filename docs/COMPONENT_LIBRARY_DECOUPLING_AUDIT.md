> 历史核查（2026-09-16）：以下缺陷是修复前证据。2026-09-17 实现与验收见 [组件库独立更新](COMPONENT_LIBRARY_LIFECYCLE.md)。旧审计脚本包含“原生失败”的复现预期，不是修复后的回归标准。

# 组件库解耦核查

日期：2026-09-16。对象：已安装 `0.2.0+codex.20260916111800`、当前源码和真实 MCP 页面状态。此次仅核查、隔离实验及记录；没有应用生产组件库更新、修改用户页面或重装插件。

## 结论

目前是部分解耦。页面组件使用真实 B2B Renderer；兼容样式资源可以独立生成、检查和应用快照，不必重建插件。但组件目录、默认属性、领域校验、变体转换及原生资源输送仍依赖插件适配代码，不能承诺修改源库后所有组件和变体自动同步。

## 当前用户环境

- `component_library_list` 返回 `sourcePath: null`，两个快照都是 `bundled`。尚未持久配置 `/Users/wangkewei/Desktop/ai-design-system/design-source` 为外部来源。直接编辑该目录不会改变当前插件。
- 新页面默认快照为 `b2b-cdf9ebecd123a964`；当前“我的页面” `page_04d2d625961f` revision 102 经兼容逻辑解析到 `b2b-d660e63477b64707`。
- 当前页面只存旧 `componentLibraryVersion: b2b-3.4.7`，没有精确的 `componentLibrary` 绑定；两个本机快照都有这个别名。`resolvePage()` 按创建时间倒序找首个匹配项，因此此旧页面尚不具备稳定版本锁定。后续新内置快照可能改变解析结果，不能将新页面的锁定保证直接套用到这个旧页面。

## 数据路径与更新影响

| 项目 | 实际实现 | 修改组件源后的结果 |
|---|---|---|
| 拖入组件 | 拖拽提交 componentId，页面保存 props；画布调用 `B2B.renderComponent` | 使用页面解析到的快照，不直接读取桌面源目录 |
| 左侧组件目录 | `catalog.ts` 的五个已适配组件 | 新增源组件不会自动出现在左侧 |
| 变体选项 | 属性面板读取当前 Renderer 的 `describe().api.props` 枚举 | 展示来自库，但字段、可编辑范围和转换仍在插件 |
| 服务端校验及 AI 查询 | 静态 `COMPONENTS`；`component_get` 返回默认库身份且没有 pageId | 源库增加枚举后可能出现 UI 列出、保存拒绝；AI 查询也未必对应旧页面版本 |
| 样式更新 | check 产生候选，apply 切换新页面默认库 | 新页面使用更新；已有精确绑定的页面继续使用原快照，连新拖入组件也沿用该页版本 |
| 旧页主动升级 | `page_upgrade_component_library` 更新整页绑定，留撤销历史 | 该页已有及以后拖入的组件共同使用目标版本；显式文字等 props 保留 |
| 资源范围 | `createSnapshot` 只复制插件基线文件清单 | 源库新增依赖文件不会自动纳入；不能承诺任意库升级兼容 |
| 原生输送 | `native-resource.ts` 按 Loader/Core 源码字符串精确替换 | 与源代码书写形式耦合，现有更新检查未覆盖这个路径 |

源码定位：`src/ui/app.js` 的 addNode、renderNode、renderComponentInspector；`src/catalog.ts`；`src/domain.ts` 的 validateProp；`src/library.ts` 的 createSnapshot、resolvePage；`src/native-resource.ts` 的 replaceRequired；`src/server.ts` 的 component_get。均相对 `plugins/page-builder`。

## 本次实际验证

仅使用临时源库、缓存和页面，真实源库及用户页面均未写入。执行后没有构建或安装插件。

1. 在源库副本中实际改变 C-34 边框色，执行 check/apply，再通过真实 Renderer 读取浏览器计算样式：旧页 `rgb(222, 224, 227)`，新页 `rgb(123, 45, 67)`。旧页主动升级后使用新颜色；`dist/server.js` 摘要前后相同。证明兼容样式独立更新的基本路径成立。
2. 在 Loader 副本把 `function loadScript(url)` 改成语义等价的 `function loadScript (url)`。组件库协议/浏览器渲染检查通过，但 `nativeAssets()` 报 `Native resource adapter no longer matches components/runtime/loader.js`。这是已复现的解耦缺口，尚未修复。
3. 最初实验在样式加载完成前取计算样式，得到双方相同的默认色，断言失败。修正测量时机，等待 stylesheet 就绪及边框生效后再次运行，通过真实颜色断言；没有删除或放宽断言。

旧 `tests/library.test.ts` 只向 Token 文件追加注释，能证明摘要和绑定变化，不能单独证明视觉更新。本次颜色实验补上这一证据。

证据：[结果 JSON](../artifacts/evidence/component-library-decoupling-audit-20260916.json)、[隔离复现脚本](../artifacts/evidence/component-library-decoupling-audit-20260916.mts)。脚本记录当前缺陷，预期其可复现；修复后应转为相应成功行为回归，不是标准通过测试。

## 尚需完成

1. 配置、展示独立组件库来源与更新状态；明确“检查→应用→按页升级”。
2. 对旧页面进行一次精确版本绑定迁移，消除重复别名选择。
3. UI、AI 查询和服务端校验统一读取页面绑定的协议；适配层只保留编辑能力与转换，未知变体明确未适配。
4. 以明确的资源/加载接口替代源码字符串替换；候选检查覆盖实际原生资源及依赖闭包，失败不得成为可应用版本。

本次没有验收任意未来 API 更新自动兼容，也没有修改上述实现。
