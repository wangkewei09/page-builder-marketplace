import { build } from "esbuild";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
await mkdir(dist, { recursive: true });

// Renderer validation runs in installed plugins too. Ship its runtime package so
// a Marketplace checkout can start without the developer's node_modules.
const playwrightDirectory = path.dirname(fileURLToPath(import.meta.resolve("playwright-core/package.json")));
await cp(playwrightDirectory, path.join(dist, "node_modules/playwright-core"), { recursive: true });

await build({
  entryPoints: {
    server: path.join(root, "src/server.ts"),
    standalone: path.join(root, "src/standalone.ts")
  },
  outdir: dist,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  sourcemap: true,
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" }
});

await cp(path.join(root, "src/ui"), path.join(dist, "ui"), { recursive: true });
await build({
  entryPoints: [path.join(root, "src/ui/app.js")],
  outfile: path.join(dist, "ui/app.js"),
  bundle: true,
  platform: "browser",
  format: "esm",
  target: "es2022",
  sourcemap: true
});
await build({ entryPoints: [path.join(root, "src/ui/library-transport.js")], outfile: path.join(dist, "ui/library-transport.bundle.js"), bundle: true, platform: "browser", format: "iife", globalName: "PageBuilderResources", target: "es2022" });
await cp(path.join(root, "vendor/b2b"), path.join(dist, "ui/vendor/b2b"), { recursive: true });
const manifest = JSON.parse(await readFile(path.join(root, ".codex-plugin/plugin.json"), "utf8"));
await writeFile(path.join(dist, "build.json"), JSON.stringify({ pluginVersion: manifest.version, builtAt: new Date().toISOString() }, null, 2));
