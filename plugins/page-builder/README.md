# 页面搭建器

本地 Codex 插件：在右侧工作区用真实 B2B Renderer 搭建页面，并让手动编辑、AI 修改、保存、撤销和导出共享同一份版本化 Page Schema。

当前源码版本：**0.1.1**。变更与已知边界见 [版本记录](CHANGELOG.md)。

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

页面、历史和选区由所有插件进程共享，并以 `expectedRevision` 防止旧进程覆盖。独立浏览器会明确显示“未连接 Codex 对话”；原生宿主中选择组件会更新下一轮模型上下文，不会自动发送消息。

## 独立组件库更新

内置 B2B 资源是离线基线。通过 MCP 工具 `component_library_check` 传入独立 `design-source` 路径，候选版本会先校验公开协议、依赖和实际 Renderer；随后用 `component_library_apply` 将已验证 snapshotId 设为新页面默认版本。已有页面保持原快照，需用 `page_upgrade_component_library` 显式升级。再次 apply 旧 snapshotId 可回退新页面默认版本。

快照默认位于 `~/.codex/page-builder/v1/component-libraries`；测试或运维可设置 `PAGE_BUILDER_LIBRARY_DIR`。页面和导出记录内容摘要，不依赖源目录继续存在。

## 编辑器设计系统

画布组件和编辑器标准控件都使用页面绑定快照中的真实 Renderer。编辑器外壳使用 C-02/C-04/C-11/C-21/C-23/C-41/C-42/C-49；项目 CSS 只负责编辑器区域布局、树、拖拽和选中关系。

## 首批组件

- C-02 基础按钮
- C-21 输入框
- C-23 选择器
- C-42 标签
- C-34 基础卡片

页面布局使用编辑器自己的纵排、横排和 2–4 列容器。C-34 保持为真实叶子组件，不伪造任意插槽。

## 独立更新组件库

在编辑器左侧展开「组件库来源与更新」，填写独立 `design-source` 目录，点「刷新并重载组件」。兼容更新无需构建或重装插件。组件库没有自动检查或自动更新，点击按钮才读取源目录。未应用的属性修改与保存期间会提示先完成编辑；其他页面不受影响。完整机制和验收见仓库 `docs/COMPONENT_LIBRARY_LIFECYCLE.md`。
