# 本地项目创建交付记录

版本：0.1.1+codex.20260924071459。评审方式：开发者自审；未使用独立 Agent。

## 实际范围

本地项目新建、路径打开、最近项目；项目内页面创建、切换、复制和历史页面复制导入。页面文件、项目清单、默认画布描述、便携组件资源均已实现。默认画布目前只是数据容器；平移/缩放/摆放、GitHub 按钮、系统目录选择器尚未实现。

## 验证记录

- build、typecheck、26 项 TypeScript 行为测试和 MCP/package 2 项通过。
- 浏览器集合分段执行并通过：browser、drag-preview、incremental-canvas、host-bridge、multi-context、native-resource、native-refresh、library-refresh、cross-process、standalone-export、builder-inspector、inline-editing、projects，共 13 个脚本。
- 具体项目证据见 projects.log；包含新建、多页、两个克隆隔离、项目上下文、延迟原位保存、跨库切换失败恢复、错误路径/已有目录、非内置组件资源空缓存恢复、跨进程重开及 HTTP 身份。
- 原生资源回归见 native-resource.log；真实 MCP HTML 在禁止 HTTP 的严格 CSP iframe 中运行。不是当前 Codex 宿主重载证明。
- regression-first-pass.log 保留了首次集合回归的失败现场；不能把该文件称为全绿结果。失败为原位保存期间下一次添加点击被捕获。已修复并单独补跑 native-resource、inline-editing 与项目专项。工具栏完整挂载前可见的问题亦修正，incremental-canvas 补跑通过。
- 后续补跑 native-refresh 验证多次更新、失败恢复、内容与选区保留、重载后拖拽；library-refresh 验证纯手动更新与失败保留；cross-process 验证旧写拒绝；standalone-export 120 文件、5 生产实例、零错误；builder-inspector 验证中文选项/条件/未知字段/无效协议；inline-editing 验证 IME、撤销、错误草稿、真实原位与源事件保护。均通过。
- 官方 plugin/skill 校验通过，官方 CLI 安装成功。`plugins/page-builder/scripts/verify-install.mjs` 可复现 16 个关键文件比对及隔离安装版项目工具检查。
- 用户文件备份和 353 文件摘要比较见 data-preservation.json：变化为零。

## 自审结论

1. 项目身份不放进严格 PageSchema；HTTP/MCP 按请求解析 workspaceId，无全局 active store。同一逻辑项目的不同本地路径不能串写。
2. 项目成员派生自页面文件目录，避免创建页面后还需更新第二份成员引用造成半写；快照先发布再写页面，清单最后发布。
3. 导出快照隐藏本机源路径，打开按全量摘要核对；手动刷新仍然使用原协议。未修改组件库源实现或样式。
4. 项目切换收束原位草稿和队列，拒绝未应用的属性草稿，清空旧 AI 引用；旧轮询响应失效。跨库读取失败能恢复原项目可编辑状态。
5. 继续沿用 expectedRevision；外部 Git 和搭建器并发编辑的内容摘要令牌尚未实现，属于后续 Git 工作流范围。

## 视觉证据

- desktop.png：完整项目管理入口，源控件和 Token。
- narrow.png：680px 宽度单列布局、内部滚动，无横向溢出。
- editor.png：项目中的页面编辑器。

本次没有推送 GitHub、没有修改已发布的 v0.1.1 标签。实际 Codex 已打开任务的后台进程可能仍为旧版本，需完整退出重开后验收右侧入口；当前未把这一项标记为通过。
