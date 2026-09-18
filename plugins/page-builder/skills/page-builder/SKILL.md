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
3. Use `page_get_selection` if the user refers to “this component”.
4. Use `component_get` with the target `pageId` before changing unfamiliar component props; `component_list` also accepts `pageId` to read that page’s pinned source protocol.
5. Submit all related changes in one `page_apply_operations` call.

Every write includes `pageId` and `expectedRevision`. On `REVISION_CONFLICT`, read the page again and rebase; never retry an old batch blindly. A failed batch commits nothing. Manual UI edits and AI edits use the same operation handler and history, so a successful AI batch can be undone once.

Only use components returned by `component_list`. C-34 is a leaf component and does not accept arbitrary child components; use editor layout nodes for rows, columns, and grouping.

Use `page_export` only after reading the latest committed revision. The returned ZIP includes the Page Schema, B2B runtime resources, generated renderer entry, and an isolated business-logic file. Use `page_import` for the plugin's own `page.json`; it creates a new page instead of overwriting an existing one.

Use `page_capture` only after reading the latest page when visual judgment matters. Its image metadata binds the result to pageId, revision, and desktop/narrow viewport. If it returns `CAPTURE_STALE`, read again and request a fresh image; never describe the discarded old render as current.

## Independent component library

Use `component_library_check` to inspect a local `design-source` candidate. `component_library_apply` changes the new-page default only; `page_upgrade_component_library` upgrades a specific page with expectedRevision. `component_library_refresh` combines checking the configured source and upgrading the current page after validation. Its optional sourcePath is persisted on success. Existing page props/structure are preserved, and failures leave the page unchanged.

The UI exposes a manual refresh and reload action. Component library updates have no timer, watcher, or automatic mode. Refresh only when the user requests it; persisted automatic-update settings from older versions are retired. Do not equate all library resources being available with all components having editing adapters; only use listed components. Compatible source changes require no plugin reinstall; incompatible API changes may still require adapter work.
