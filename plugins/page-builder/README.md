# 页面搭建器

本地 Codex 插件：在右侧工作区用真实 B2B Renderer 搭建页面，并让手动编辑、AI 修改、保存、撤销和导出共享同一份版本化 Page Schema。

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

## 首批组件

- C-02 基础按钮
- C-21 输入框
- C-23 选择器
- C-42 标签
- C-34 基础卡片

页面布局使用编辑器自己的纵排、横排和 2–4 列容器。C-34 保持为真实叶子组件，不伪造任意插槽。

