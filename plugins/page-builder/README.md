# 页面搭建器

页面搭建器是一个本地 Codex 插件，通过 MCP Server 提供页面编辑工具，并通过 MCP Apps UI 在 Codex 中显示编辑器。

## 运行时结构

- `.codex-plugin/plugin.json`：插件清单
- `.mcp.json`：本地 MCP Server 启动配置
- `dist/server.js`：已打包的 Node.js 服务端
- `dist/ui/`：自包含编辑器界面
- `skills/page-builder/`：Codex 工作流说明

插件只监听 `127.0.0.1`，不依赖外部网络资源。运行时需要 Node.js 18 或更高版本。

安装并重启桌面端后，请新建一个任务，以便 Codex 加载新的 Skill、MCP 工具和右侧界面入口。
