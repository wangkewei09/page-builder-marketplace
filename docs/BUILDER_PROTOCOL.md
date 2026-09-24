# 组件库与搭建器编辑协议 v1

状态：2026-09-18 两端已实现并完成定向联调的共同契约。本文件定义线路格式，组件库维护实际数据，插件维护解析与 UI 能力。协议不会修改组件源码、CSS、Token 或 Renderer。安装与真实宿主加载状态分别见 PROGRESS。

## 文件与版本

独立来源固定入口：`design-source/components/runtime/builder-contract.json`。纯 JSON，不执行函数、表达式或任意脚本。文件参与组件库快照摘要、导出与手动重载；没有文件时兼容旧适配逻辑。文件存在但格式、版本或字段引用无效时拒绝候选，保留当前页面与快照，不能悄悄当旧库使用。

```json
{
  "schemaVersion": 1,
  "libraryId": "b2b",
  "components": {
    "C-02": {
      "label": "基础按钮",
      "description": "触发立即动作并表达操作优先级。",
      "groups": [{ "id": "content", "label": "内容" }, { "id": "appearance", "label": "外观" }],
      "fields": {
        "label": { "label": "按钮文字", "group": "content", "order": 0, "control": "text" },
        "variant": { "label": "按钮变体", "group": "appearance", "order": 0, "control": "select", "options": [{ "value": "primary", "label": "主要按钮" }] }
      }
    }
  }
}
```

首批 C-02/C-21/C-23/C-34/C-42；协议可以描述更多公开组件，但插件的可拖拽适配范围仍独立控制。

## 字段元数据

组件对象可选 `label`、`description`、`groups`、`fields`、`transitions`。`fields` 的键必须是同一快照 `apiSchemas[id].props` 中存在的字段。

- `label` / `description`：纯文本显示。
- `group`：所属分组 ID，必须在 groups 中声明。未分组字段放入“其他属性”。
- `order`：有限数字，同组按此排序；未提供时保持源 API 的字段顺序。
- `control`：`auto | text | textarea | number | switch | select | structured | image`。只决定编辑控件，不扩展 API 类型或值域。对象/列表使用 structured；image 仅接受字符串或可空字符串，提供本地图片选择。
- `options`：`[{value: string|number, label: string}]`，仅翻译源 API 枚举，不能新增、删除或更改允许值。没有翻译的源值仍显示，不丢失类型。
- `visibleWhen` / `enabledWhen`：条件数组，全部满足才显示/启用；条件格式 `{property: "variant", values: ["tabs"]}`，可选 `not: true` 取反。仅引用本组件顶层 API 字段；值为 JSON 标量。
- `controlWhen`：可选 `[{when: 条件数组, control: 控件类型}]`。针对当前顶层 props（组合编辑时为草稿）选择控件，最多匹配一条；每个控件都必须符合源 API 类型。例如 C-21 的 string|number 值在数字变体使用 number，其他变体使用 auto。匹配冲突报错，不按列表先后静默选取。
- 常驻 text/number 等控件不能把 string|number 联合类型永久收窄；选择其中一个分支必须声明 controlWhen。auto 根据当前数据类型选择基本编辑方式。
- `fields` / `item`：嵌套对象字段/数组条目的同形编辑描述；不得添加 API 没有声明且默认值没有体现的子字段，不在这里复制组件 API 类型、默认值或业务数据。

迭代 API 的全部字段，再叠加描述；未写元数据的新属性仍自动出现在属性栏。不根据字段是否出现在 fields 中限制属性，也不保存中文名称为真实枚举值。完整组合编辑继续允许一次性提交多个属性，实际 Renderer 是合法性最终依据。

## 声明式伴随更新（可选）

`transitions` 是数组，每项 `{property, value, when?, reset?, set?, ensure?, require?}`。

- property/value 表示一次编辑触发值；when 为上述条件数组，针对编辑前 props 求值。
- reset 为顶层字段名称数组，按同一 API schema 的 default 重置。
- set 为顶层属性到 JSON 字面值的映射；ensure 仅在原属性为 null、undefined、空字符串或空数组时设置字面值。
- require 为 `[{property, message}]`，先检查编辑前属性非空；失败显示 message 并不写入。
- 执行顺序：检查 require → reset → set → ensure → 写入触发 property/value。只更改描述里明确列出的字段，其他用户内容保留。同一次输入最多匹配一条转换。
- 不提供默认值覆盖、JS 执行、HTML/CSS 注入或任意路径写入；所有输出仍经过页面原子操作与真实 Renderer 校验。
- 复杂内容转换不能安全表达时先不声明转换，保留旧插件适配器（明确的兼容边界），不要将整份 specimen/preset 示例复制进 transitions。后续需要新增通用能力时先两端协商版本。

## 所有权与兼容

组件字段始终映射 `node.props`。插件的布局容器类型、间距、分栏等属于独立的 `LayoutNode` 与 `updateLayout`；未来组件包装层的设置保留 `node.editor` 命名空间，不能塞进组件 props，也不能由组件库声明。v1 不引入未使用的 editor 持久化字段。

API/schema 负责字段、类型、默认值与合法值；本协议负责如何编辑。组件库端应从 API 同源生成，或通过校验阻止引用/枚举漂移。新增元数据、中文名与显隐规则在手动“刷新并重载组件”后更新，无后台监听。已有节点的文字、属性和排列不因元数据/默认值变化重置；不兼容 API/协议拒绝更新。旧快照、撤销、导出继续使用对应版本。

当前库在加载 presets.js 后会调整 apiSchemas 的有效默认值。消费者读取 api-schema.js 与 presets.js 完成后的有效 schema；reset 回到这个有效默认值，显式清空应使用 set:null。协议不复制 preset 的演示数据。缺类型的嵌套字段只能声明 auto，实际可编辑结构以 API 字段声明与已有值为准，不根据中文标题猜类型。

## 当前实现位置与重现

- 插件校验：`src/builder-protocol.ts`；快照读取：`src/library-schema.ts`；纯条件/转换：`src/editor-contract.ts`；生成表单：`src/ui/app.js`。这些路径相对 `plugins/page-builder/`。
- 组件库数据：独立的 `components/runtime/builder-contract.json`。源码字段有元数据时按分组生成属性栏；缺描述的新字段进入“其他属性”，旧库整体缺文件时保留原有界面。
- C-21/C-23/C-34 复杂变体的内容转换、C-42 头像文字自动补齐仍用旧兼容适配器。源协议里的简单 transitions 优先执行；不得将这部分边界描述为任意未来变体自动适配。
- `npm run test:protocol`：协议拒绝/条件/转换 + 独立源更新的实际 UI；`PAGE_BUILDER_TEST_SOURCE=<design-source> node tests/builder-source.test.mjs`：真实五组件 37 变体、四标签类型、图片、嵌套编辑、保存重开与导出；同一环境变量运行 `tests/native-refresh.test.mjs` 验证原生动态注入的元数据重载。

## 两端验收

1. 五个组件的中文属性、选项、分组、条件来自真实源协议；未知新属性仍可编辑。
2. 仅修改源协议再手动刷新，插件构建字节不变，属性栏改变，现有页面数据保留。
3. 旧库无协议可打开；坏 JSON、未知主版本、虚构属性/枚举、错类型控件被拒绝，当前页不变。
4. 显隐/启用与声明式转换、组合编辑、图片输入真实可用；原有复杂变体未声明转换时仍可用。
5. 节点 props 与布局/插件设置不串用；导入、导出、保存、撤销和 MCP 使用同一快照事实。

## 可选画布编辑协议（2026-09-22）

另行提供 components/runtime/inline-editing.json，保持本 v1 JSON 不新增旧消费者不认识的字段。描述公开内容属性、受限的根内定位、控件和条件；源文件随手动快照更新。完整线路及兼容边界见 [画布内容编辑](INLINE_EDITING.md)。
