import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEditorServer } from "./http.js";
import { FilePersistence, PageStore } from "./store.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = process.env.PAGE_BUILDER_DATA_DIR || await mkdtemp(path.join(tmpdir(), "page-builder-data-"));
const exportDirectory = process.env.PAGE_BUILDER_EXPORT_DIR || await mkdtemp(path.join(tmpdir(), "page-builder-export-"));
const store = new PageStore(new FilePersistence(dataDirectory)); await store.load();
const server = createEditorServer(store, path.join(root, "ui"), exportDirectory);
const url = await server.start(); console.log(url);
for (const signal of ["SIGTERM", "SIGINT"] as const) process.once(signal, () => server.close().finally(() => process.exit(0)));

