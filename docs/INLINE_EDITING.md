# 画布内容编辑与属性去重

2026-09-22。内容通过原子 `updateProps` 保存到 Page Schema；右侧维护变体、外观、状态、布局和复杂设置。

## 使用范围

单击选择或拖动，双击可编辑文字开始输入；右侧「编辑…」按钮提供定位和键盘入口。按钮文字、标签文字、卡片可见的顶层标题/正文/辅助信息，以及输入框单值/数字值已接入。正文 Enter 换行，⌘/Ctrl+Enter 保存；单行 Enter 保存，失焦保存，Esc 取消。输入法组合期间的 Enter 不保存。

浮层使用当前快照的 C-21，提示采用同一 Foundation Token；不改组件内部 DOM、样式、监听器或 maxlength。源长文本控件固定 240 字，界面显示上限；已有长内容不在打开时截断。图标仍在右侧按公开属性设置，图标选择器、复合输入分段与子列表的画布编辑暂不在本次范围。画布未提供唯一可见位置的字段继续在右侧。

右侧内容定位按钮不再放第二份输入框。「其他设置」只列未在常用字段或画布编辑的属性，嵌套字段按真实路径去重。复杂修改保留草稿，应用时只提交变化的顶层属性及协议明确声明的伴随修改，不覆盖无关内容；取消丢弃草稿。

## 组件库协议

源库新建独立 `components/runtime/inline-editing.json`，不扩展旧消费者会严格校验的 `builder-contract.json`。文件不进入组件加载链，不修改 Renderer/API/CSS/Token。

```json
{
  "schemaVersion": 1,
  "libraryId": "b2b",
  "components": {
    "C-02": [{ "property": "label", "selector": ":scope", "control": "text" }]
  }
}
```

- property 是同快照公开 API 的顶层字符串或数字内容属性；枚举不允许声明为画布文字。control 为 text/textarea/number，不改 API 类型。
- selector 相对真实 Renderer 根元素，只允许 `:scope` 与由 ` > `连接的标签名、单个 class 或 data 属性。仅用来读元素位置，不执行脚本、不读写任意路径。
- 可选 when 沿用 v1 的顶层条件数组，并同时遵守 builder.fields 中的 visibleWhen/enabledWhen。定位必须唯一、可见；多字段指向同一元素视为歧义，退回右侧。
- 文件存在时，源 declarations 完整替换兼容映射，空 components 明确关闭画布映射。旧快照缺文件使用内置兼容映射；这属于旧版本支持，不是永久把新组件结构写死在插件。
- 手动「刷新并重载组件」把文件连同 Renderer/元数据纳入同一内容摘要快照。没有后台扫描。已有 props/排列保留；字段重命名等不兼容 API 更新按既有门禁拒绝。DOM 锚点失配时保留属性编辑入口，不能承诺任意 API 改动都零适配。

插件解析器：src/inline-protocol.ts；消费者：src/ui/inline-editor.js；旧库适配：src/inline-defaults.ts。组件库端已有独立 JSON 与 `design-source/scripts/check-inline-editing.cjs`，可脱离插件运行作者检查。两端说明同步维护。

## 保存和生命周期

打开时固定 node ID、属性值和 revision。输入只形成浮层草稿，保存排入原有写入队列，并以打开时的 expectedRevision 提交真实 Renderer 校验；成功更新当前实例并发布已明确引用的 AI 上下文。无改动关闭不写 revision。

输入期间暂停读取新页面覆盖本地视图，拖拽、其他写入与库重载不能越过未完成输入。第一次点击浮层外先保存；成功后可继续操作。失败保留草稿和错误，支持修正重试；409 保留外部新内容，用户取消后重新读取。挂载失败可按 Esc 关闭；生命周期监听在组件库 transport 之前注册，重载不会误移除。

## 验证

- `npm run test:inline`：源协议的缺失/关闭/畸形/类型/路径边界；真实双击、定位、单击、IME、数字、正文、失焦、取消、错误草稿/重试、挂载失败退出、撤销重做、并发冲突、预览与桌面/窄屏。
- `host-bridge`：画布修改已引用或其他组件后，附件仍引用正确节点且内容更新。
- `native-refresh`：无 HTTP 的原生资源，多次重载；单独改变编辑位置让标题回到右侧，恢复映射后可画布编辑，插件构建字节不变。
- `builder-source`：真实 design-source 37 种变体、4 种标签类型、嵌套列表、中文选项与保存/导出；`native-resource`：10 种卡片与直接 Renderer 的尺寸/样式一致。
- 既有拖拽、增量实例、复制删除、多选、原子保存和独立包回归。全部使用隔离数据目录，真实 Codex 宿主已加载新版本另行确认。

本次为自审，重点检查协议所有权、双击与拖拽冲突、输入法、挂载代次、异步保存及 source/installed/host 三层证据；未称独立 Agent 评审。
