import { build } from "esbuild";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
await mkdir(dist, { recursive: true });

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
await cp(path.join(root, "vendor/b2b"), path.join(dist, "ui/vendor/b2b"), { recursive: true });
const manifest = JSON.parse(await readFile(path.join(root, ".codex-plugin/plugin.json"), "utf8"));
await writeFile(path.join(dist, "build.json"), JSON.stringify({ pluginVersion: manifest.version, builtAt: new Date().toISOString() }, null, 2));
