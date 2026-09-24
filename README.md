# 页面搭建器 Git Marketplace

这个仓库通过 Codex Git Marketplace 分发本地“页面搭建器”插件。插件包含自包含的 MCP Server、MCP Apps UI 和页面搭建 Skill，不依赖远程服务。

## main 当前开发构建

`0.1.1+codex.20260924085012`：包含组件库编辑协议、拖拽占位动画、复制/删除与多组件 AI 上下文、画布原位编辑、本地项目与项目卡片、macOS 文件夹选择。系统文件夹窗口的真实点击返回仍待确认，完整范围和验证边界见 [进度记录](docs/PROGRESS.md)。

下方安装命令固定到原稳定标签 `v0.1.1`。需要本次最新开发构建时，将 `--ref v0.1.1` 改为 `--ref main`；已有固定标签不会自动切换。

## 运行要求

- ChatGPT/Codex 桌面端支持本地插件
- Node.js 20 或更高版本位于 `PATH`
- 本机安装 Google Chrome；其他安装位置可通过 `CHROME_PATH` 指定
- 私有仓库安装需要当前电脑具有该 GitHub 仓库的读取权限

## 安装

```bash
codex plugin marketplace add wangkewei09/page-builder-marketplace --ref v0.1.1
codex plugin add page-builder@page-builder-marketplace
```

安装后重新加载桌面端并新建任务。右侧工具区使用开发版页面搭建器入口。已有开发版安装需避免同时启用两份页面搭建器插件。

## 验证

```bash
codex plugin marketplace list
codex plugin list
node --version
```

`node --version` 应为 20 或更高版本。组件校验驱动已随插件打包，无需另装 npm 依赖。

## 更新

每次发布都应重新构建插件、更新 `.codex-plugin/plugin.json` 中的版本并创建新的 Git 标签。固定标签安装不会自动切换到新版本。

## 稳定标签 v0.1.1

本版包含独立组件库手动刷新、原生重载白屏修复、五个组件的公开属性与变体编辑、中文选项及上下文桥接修复。完整编辑描述协议尚未实现，详见 [版本记录](plugins/page-builder/CHANGELOG.md)。

仓库同时提供可维护源码、测试和可直接安装的 `dist` 产物。源码开发见 [插件说明](plugins/page-builder/README.md)。GitHub Marketplace 名称保持 `page-builder-marketplace`；本机开发目录使用独立的 `page-builder-development` Marketplace。
