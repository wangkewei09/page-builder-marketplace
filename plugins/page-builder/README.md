# 页面搭建器

本地 Codex 插件：在右侧工作区用真实 B2B Renderer 搭建页面，并让手动编辑、AI 修改、保存、撤销和导出共享同一份版本化 Page Schema。

当前开发构建：**0.1.1+codex.20260918094616**。变更与已知边界见 [版本记录](CHANGELOG.md)。

运行要求：Node.js 20+ 和 Google Chrome，或通过 `CHROME_PATH` 指定兼容浏览器。GitHub 发布包已包含组件校验驱动，无需在安装目录执行 npm install。

## 开发

```bash
npm ci
npm run verify
```

单独打开浏览器编辑器：

```bash
node dist/standalone.js
```

服务只监听 `127.0.0.1`。默认页面数据保存到 `~/.codex/page-builder/v1/pages`，导出保存到 `~/Documents/Page Builder Exports`。测试通过环境变量使用隔离目录，不会覆盖既有插件数据。

页面、历史和活动选区由所有插件进程共享，并以 `expectedRevision` 防止旧进程覆盖。独立浏览器会明确显示“未连接 Codex 对话”；原生宿主中先选中组件，再点击「加入 AI 上下文」明确引用。按住 ⌘（Windows 用 Ctrl）点击可多选或取消某项，一次加入一个包含全部选中节点的附件。普通换选不会替换引用，已引用节点的保存内容会继续同步；删除只移除对应引用，全部删除才清空。不会自动发送消息。多选仅为当前面板的临时状态，单击恢复单选以编辑属性或移动。

## 独立组件库更新

内置 B2B 资源是离线基线。通过 MCP 工具 `component_library_check` 传入独立 `design-source` 路径，候选版本会先校验公开协议、依赖和实际 Renderer；随后用 `component_library_apply` 将已验证 snapshotId 设为新页面默认版本。已有页面保持原快照，需用 `page_upgrade_component_library` 显式升级。再次 apply 旧 snapshotId 可回退新页面默认版本。

快照默认位于 `~/.codex/page-builder/v1/component-libraries`；测试或运维可设置 `PAGE_BUILDER_LIBRARY_DIR`。页面和导出记录内容摘要，不依赖源目录继续存在。

## 编辑器设计系统

画布组件和编辑器标准控件都使用页面绑定快照中的真实 Renderer。编辑器外壳使用 C-02/C-04/C-11/C-21/C-23/C-41/C-42/C-49；项目 CSS 只负责编辑器区域布局、树、拖拽和选中关系。Foundation 的颜色、字体、字号、间距、圆角、阴影及动效直接引用同一快照的 B2B Token；装饰图标使用库的 runtime.icon 与图标字体，不复制 SVG 或用 Unicode 符号代替。

## 首批组件

- C-02 基础按钮
- C-21 输入框
- C-23 选择器
- C-42 标签
- C-34 基础卡片

页面布局使用编辑器自己的纵排、横排和 2–4 列容器。C-34 保持为真实叶子组件，不伪造任意插槽。

## 独立更新组件库

在编辑器左侧展开「组件库来源与更新」，填写独立 `design-source` 目录，点「刷新并重载组件」。兼容更新无需构建或重装插件。组件库没有自动检查或自动更新，点击按钮才读取源目录。未应用的属性修改与保存期间会提示先完成编辑；其他页面不受影响。完整机制和验收见仓库 `docs/COMPONENT_LIBRARY_LIFECYCLE.md`。

开发构建支持独立编辑协议 `components/runtime/builder-contract.json`（schemaVersion 1）。组件库提供中文字段/选项、分组、控件、条件和简单伴随更新；插件按同版本公开 API 校验并生成属性栏。协议缺失使用旧适配器，协议错误拒绝更新。复杂变体转换仍保留兼容适配器；不改变源组件样式。共同契约见 [编辑协议](../../docs/BUILDER_PROTOCOL.md)。

选中节点时显示上移、下移、复制、删除和原生宿主中的上下文按钮。布局复制包含子节点且使用新 ID，可撤销。普通新增/移动/编辑按节点 ID 增量更新，未变化的 Renderer 实例、DOM 和本地交互状态保留；只有组件库手动重载会重建其运行时。
