---
name: page-builder
description: Open and operate Page Builder when the user asks to visually build, edit, inspect, save, import, or export a page backed by production B2B components.
---

# Page Builder

Use the bundled `pageBuilderDevelopment` MCP server. The saved Page Schema is authoritative; never infer durable state from rendered DOM or a screenshot.

## Open the editor

Call `page_builder_open` for a visual page-building request. Entry version 5 declares Codex global and thread UI entrypoints. A discovered entry is not proof that the current host displayed it; when the native entry is unavailable, open the returned `editorUrl` in Codex on the right and describe that as a browser fallback.

## Read before writing

1. Use `page_list` to resolve the intended page explicitly.
2. Use `page_get_schema` and keep its `pageId` and `revision`.
3. When the message includes a Page Builder context attachment, resolve its `pageId` and all `nodeIds` against the latest saved schema. A group attachment contains `nodes[]` with each node’s identity, parent and saved properties; a single-node attachment also keeps the legacy `nodeId`/`kind`/`props` fields. The user explicitly pinned those nodes with “加入 AI 上下文”; ordinary canvas selection can now point elsewhere. Use `page_get_selection` as a fallback when no attachment or explicit node is provided. Never substitute a different selected node for a missing/deleted referenced node.
4. Use `component_get` with the target `pageId` before changing unfamiliar component props; `component_list` also accepts `pageId` to read that page’s pinned source protocol.
5. Submit all related changes in one `page_apply_operations` call.

Selecting only edits the visual selection. Cmd/Ctrl-click toggles nodes in a local multi-selection; plain click restores single selection. The legacy `page_get_selection` tool returns only the active node, never the full explicit group, so do not use it to narrow a group attachment. The explicit context button publishes a reference, whose saved content continues to update while other selections leave its target unchanged; deletion removes missing nodes from the reference and clears the attachment only when none remain. Opening another view stays passive until its context button claims ownership. The UI never sends `ui/message` automatically.

Every write includes `pageId` and `expectedRevision`. On `REVISION_CONFLICT`, read the page again and rebase; never retry an old batch blindly. A failed batch commits nothing. Manual UI edits and AI edits use the same operation handler and history, so a successful AI batch can be undone once.

Only use components returned by `component_list`. C-34 is a leaf component and does not accept arbitrary child components; use editor layout nodes for rows, columns, and grouping.

Use `page_export` only after reading the latest committed revision. The returned ZIP includes the Page Schema, B2B runtime resources, generated renderer entry, and an isolated business-logic file. Use `page_import` for the plugin's own `page.json`; it creates a new page instead of overwriting an existing one.

Use `page_capture` only after reading the latest page when visual judgment matters. Its image metadata binds the result to pageId, revision, and desktop/narrow viewport. If it returns `CAPTURE_STALE`, read again and request a fresh image; never describe the discarded old render as current.

## Independent component library

Use `component_library_check` to inspect a local `design-source` candidate. `component_library_apply` changes the new-page default only; `page_upgrade_component_library` upgrades a specific page with expectedRevision. `component_library_refresh` combines checking the configured source and upgrading the current page after validation. Its optional sourcePath is persisted on success. Existing page props/structure are preserved, and failures leave the page unchanged.

The UI exposes a manual refresh and reload action. Component library updates have no timer, watcher, or automatic mode. Refresh only when the user requests it; persisted automatic-update settings from older versions are retired. Do not equate all library resources being available with all components having editing adapters; only use listed components. Compatible source changes require no plugin reinstall; incompatible API changes may still require adapter work.

Component definitions can include `builder` metadata from the page's pinned `components/runtime/builder-contract.json` (schemaVersion 1): localized labels, groups, controls, conditions, and simple transitions. These describe editing, not additional component props. Read the effective `props` schema for allowed values and defaults; Chinese option labels must never be saved as raw enum values. Keep layout settings in layout nodes. Complex content conversions still use compatibility adapters, and all final prop combinations must pass the real Renderer. An absent metadata file supports legacy libraries; an invalid metadata file rejects a library update.

Canvas content editing uses the optional source-owned `components/runtime/inline-editing.json`. It maps top-level public text/number props to read-only renderer anchors, not new props or executable code. Double-click edits a local draft; blur/Enter saves through the same revisioned operations, Escape cancels. Only saved changes update pinned context. Do not treat a visible draft as saved content or modify component DOM to implement an edit. Missing/ambiguous anchors retain inspector access. The source C-21 multiline control currently caps input at 240 characters; do not claim unlimited inline text editing.
