# 变体与类型切换缺陷

日期：2026-09-16。用户确认 C-42 标签选择 `avatar` 报错。本记录保存修复前现象与复现依据，最终修复和复测以 PROGRESS / ACCEPTANCE 为准。

## 用户路径与影响

在 `0.2.0+codex.20260916082103` 中：添加标签 → 选中 → 右侧“类型”从 property 改为 avatar。画布出现 `渲染失败：[B2B components] C-42 avatar type requires avatar content`，同时顶部仍为“已保存”、页面版本已经推进。

C-42 的真实 Renderer 要求 avatar 类型具有非空头像内容；属性面板未开放 avatar，命令处理器只校验每个字段的类型和枚举，未校验关联约束。坏组合先保存再渲染，错误会持续到下一次修改。

## 隔离浏览器核查

未改动用户当前页面。使用已安装包、隔离临时数据与 Chrome/Playwright，逐一将各枚举字段从默认 props 切到每个公开选项，共 86 项、22 项失败。这个数字只描述“默认值加一次字段修改”的测试集合，不代表穷尽全部组合。

| 组件 | 单次切换失败的选项 | 缺少的配套条件 |
|---|---|---|
| C-21 输入框 | 数字、带图标、带属性、组合、长文本 | 需要按目标变体调整专用配置，不能保留全部基础输入行为 |
| C-23 选择器 | 多选、自定义、分组、搜索、创建、复杂内容 | multiple/searchable/creatable 与结构化选项等关联配置 |
| C-23 选择器 | loading、no-result 状态 | 需要 searchable=true |
| C-42 标签 | type=avatar | 必填头像内容；头像与图标互斥 |
| C-34 卡片 | compact、meta、external-grid、content-grid、nested、tabs、actions、interactive | 头像、列表、标签页、动作或交互配置 |

原始临时证据：`/var/folders/8s/jrvr4t450qxgvccn_47kky380000gn/T/page-builder-variant-audit-lIVKb1/results.json` 与 `tag-avatar-error.png`。截图已人工可见复核：红色渲染失败与“已保存”并存。

## 修复验收要求

- 面板仅开放已适配且可完成配置的选项，其他能力明确不可选及原因。首版卡片仅承诺基础能力，不得假称复杂变体均已完成。
- avatar 类型提供必要内容编辑和合法切换；兼容文本保留。转换将丢失内容时明确告知或拒绝，不能静默清空。
- UI 和 AI 共用组合校验；无效操作在持久化前拒绝，原页面、版本与历史保持不变。
- 验证来回切换、勾选互斥状态、非法 AI 参数、批量原子失败、刷新及导出后仍能渲染。
- A06 的通过状态必须以实际公开选项的交互与失败路径为依据，不能只切换一次按钮颜色代表所有组件变体。

修复已交回原 Sol / high 开发任务，与入口和选区联动缺陷一同处理。

## 修复结果

- 适配层新增 `editorValues`，保留真实 schema 的完整枚举用于协议核对，但面板只显示已完成组合转换的子集。C-21 只开放基础输入；C-23 开放基础单选/无边框/下划线及非 loading/no-result 状态；C-34 开放 basic/cover。
- C-42 type 切到 avatar 时同批补入头像文字并清空 icon；切回时清空 avatar。closable/checkable/checked 的互斥关系同批正规化。
- domain 在提交前验证组合。AI 只提交 `type=avatar` 会以 `INVALID_PROP_COMBINATION` 原子拒绝，页面 revision 和历史不变；旧的无效已保存页面仍能读取以便修复，不会因升级静默消失。
- `tests/domain.test.ts` 覆盖 AI 非法批次和互斥状态；`tests/browser.test.mjs` 真实切换 avatar 并确认 C-42 audit 有效、无 render-error。修复后“错误画面但显示已保存”的路径不可再由当前 UI/AI 命令产生。
