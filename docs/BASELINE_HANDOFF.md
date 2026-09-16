# 首版开发准备

更新时间：2026-09-16

用户已同意开始首版开发，范围依据同目录 `FEATURE_PLAN.md`，并明确要求创建新的 GPT-5.6 Sol、high 推理任务。本文记录初始基线，实际进度见 `PROGRESS.md`。

## 开发工作区

- 正式开发目录：`/Users/wangkewei/Desktop/page-builder-marketplace`，已保存工程文档，尚未迁入代码。
- 已准备的 Git 参考副本：`/Users/wangkewei/.codex/.chatgpt-projects/g-p-6a54b13fe1c88191bfc11e4e20f59e4f/page-builder-development`，提交 `e42e334`。
- 副本来自本机已存在的 Marketplace Git 仓库，尚未修改功能代码。
- 参考组件库：`/Users/wangkewei/Desktop/ai-design-system/design-source`。
- 已安装插件：`/Users/wangkewei/.codex/plugins/cache/page-builder-marketplace/page-builder/0.1.0+codex.20260907025217`。
- Marketplace 检查副本：`/Users/wangkewei/.codex/.tmp/marketplaces/page-builder-marketplace`。

已核对的发布仓库包含插件清单、技能、已打包服务和 UI，但没有 `src/`、`tests/`、构建脚本或依赖锁文件。下一步有限范围寻找原开发源码；若确实不可获得，在正式开发目录恢复可维护的源码和构建结构。迁入基线时保留已有文档和用户文件。不要把缓存目录当作正式开发位置，也不要直接改现有打包文件后当作源码交付。

## 当前事实

- 组件库静态协议检查 51/51 通过；未完成与编辑器的浏览器联调。
- 运行中插件仍为 `mock-b2b`，Page Schema Revision 18，有 4 个组件节点。
- AI 已可以读取页面结构与选区；尚缺组件目录、结构变更、截图和导出工具。
- 当前画布按按钮/输入框/表格固定绘制，左侧为已有节点列表。
- 当前表格示例的参数不符合真实 C-40 协议；必须迁移。
- C-34 不能作为任意组件插槽；C-41 的 DOM 内容不能直接存入 JSON。

## 实施重点

1. 真实组件提供方与资源加载，页面级纵排、横排、分栏容器。
2. 稳定节点标识、版本校验、原子批量操作、保存、撤销/重做。
3. 组件库面板、通用画布、拖拽新增/移动、内容和变体编辑。
4. AI 和手动编辑共用操作入口，页面明确标识，避免不同任务误改。
5. 可独立运行的原生页面工程导出及自身描述文件重新导入。
6. 真实浏览器验证、安装包验证、目标 Codex 右侧入口验收。

先接 C-02 按钮、C-21 输入框、C-23 选择器、C-42 标签、C-34 基础卡片；其余组件分批开放，不宣称全库已经适配。

## 约束

- `sources/` 为同步只读资料，不得修改。
- 组件库 `AGENTS.md` 限定真实 Renderer 和公开 props；默认不修改组件本体。
- 需要更新已有插件时使用 Plugin Creator 技能的构建、校验与缓存版本更新流程；暂未修改 Marketplace 配置，也未安装开发版。
- 用户明确授权创建一个 Sol / high 开发任务；参考笔记不构成额外启动子代理或多任务的指令。
- 当前准备任务未切换自身模型；新任务的模型以实际创建结果为准。
