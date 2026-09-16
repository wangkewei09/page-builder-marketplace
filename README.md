# 页面搭建器 Git Marketplace

这个仓库通过 Codex Git Marketplace 分发本地“页面搭建器”插件。插件包含自包含的 MCP Server、MCP Apps UI 和页面搭建 Skill，不依赖远程服务。

## 运行要求

- ChatGPT/Codex 桌面端支持本地插件
- Node.js 18 或更高版本位于 `PATH`
- 私有仓库安装需要当前电脑具有该 GitHub 仓库的读取权限

## 安装

```bash
codex plugin marketplace add wangkewei09/page-builder-marketplace --ref v0.1.0
codex plugin add page-builder@page-builder-marketplace
```

安装后重启桌面端并新建任务。右侧工具区应显示“页面搭建器”。

## 验证

```bash
codex plugin marketplace list
codex plugin list
node --version
```

`node --version` 应为 18 或更高版本。

## 更新

每次发布都应重新构建插件、更新 `.codex-plugin/plugin.json` 中的版本并创建新的 Git 标签。固定标签安装不会自动切换到新版本。

