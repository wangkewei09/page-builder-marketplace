import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ComponentLibraryManager } from "./library.js";

// Resources are transported as-is. No library source rewriting.
export async function nativeAssets(libraries: ComponentLibraryManager, snapshotId: string) {
  const manifest = await libraries.manifest(snapshotId);
  return { snapshotId, assets: await readNativeAssets(path.dirname(await libraries.asset(snapshotId, "manifest.json")), manifest.files) };
}

export async function readNativeAssets(directory: string, files: string[]) {
  const assets: Record<string, string> = {};
  const mime: Record<string, string> = { ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };
  for (const file of files) {
    const ext = path.extname(file);
    if (![".js", ".css", ...Object.keys(mime)].includes(ext)) continue;
    const bytes = await readFile(path.join(directory, file));
    assets[file] = mime[ext] ? `data:${mime[ext]};base64,${bytes.toString("base64")}` : bytes.toString("utf8");
  }
  return assets;
}

export async function nativeHtml(uiDirectory: string, config: unknown) {
  const [template, css, js] = await Promise.all(["index.html", "styles.css", "app.js"].map(file => readFile(path.join(uiDirectory, file), "utf8")));
  const escapeScript = (value: string) => value.replace(/<\/script/gi, "<\\/script");
  return template.replace('<link rel="stylesheet" href="./styles.css">', () => `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`)
    .replace('<script type="module" src="./app.js"></script>', () => `<script>window.__pageBuilderNative=${JSON.stringify(config).replace(/</g, "\\u003c")};</script><script>${escapeScript(js)}</script>`);
}
