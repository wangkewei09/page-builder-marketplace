---
name: page-builder
description: Open and operate the Page Builder when the user asks to build or visually edit a page, select a page node, change registered component text, or inspect the latest Page Schema revision.
---

# Page Builder

Use the bundled `pageBuilder` MCP server. Keep the server Page Schema authoritative; never infer durable state from rendered DOM.

## Start from a page request

Selecting an @plugin mention only adds the plugin to the composer. Do not describe that control as an editor launcher. When the user sends a page-building or visual-editing request, call `page_builder_open` without requiring another “打开” prompt.

Entry version 3 associates that tool directly with the editor resource and declares `_meta["openai/ui"]` entrypoints `global` and `thread`, plus `preferredModelDisplayMode: "fullscreen"`. In the inspected Codex build these are discovered separately: a global view can contribute “Open plugin” on the plugin details page; a thread view can contribute an editor tab beside the current task. Metadata discovery and real native clicks are separate verification steps. Registration does not prove the current host has loaded or displayed the entry.

The old project picker is a compatibility resource, not the primary launch flow. Do not open `ui/launcher.html` as a browser page: it is an unbuilt template. Do not ask for a second Markdown-link click, fabricate a user turn with `ui/message`, or claim that `ui/open-link` opened a panel.

When the user wants the editor visible and the native entry is unavailable, use the returned `editorUrl` with the available Codex `open_in_codex` tool (`placement: "right"`, browser target). Verify the real browser and clearly distinguish this assistant-opened fallback from a repaired native plugin click. A queued tool result is not visible delivery.

Say the editor is open only after observing it or receiving user confirmation. Mock-host tests cannot establish actual Codex placement. A response without `presentation.entryVersion: 3` is an older running process. Do not repeatedly make the user open new tasks or retry the same click as a substitute for diagnosing it.

The standalone browser editor and MCP Apps editor are two presentations of the same store. Do not copy Page Schema state into browser-only storage.

## Headless flow

The same workflow must remain usable without UI:

1. Call `page_get_schema` to read the current page and Revision.
2. Call `page_select_node` with the intended `nodeId` when selection matters to later model context.
3. Call `page_update_text` only for a prop listed in the node's `editableTextProps`, and always pass the Revision the change was based on.
4. Call `page_get_selection` to confirm the latest node, committed text, transaction, and Revision.

If `page_update_text` returns `REVISION_CONFLICT`, do not retry blindly. Read the latest selection/schema and rebase the proposed value. A stale base Revision may proceed only when that exact node prop has not changed since the base.

The current provider is a runnable mock behind `ComponentProvider`. Do not claim that the production B2B component API is connected until `B2BComponentApiAdapter` is wired to an accepted API endpoint.
