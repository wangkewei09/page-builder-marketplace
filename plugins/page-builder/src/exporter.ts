import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { strToU8, zipSync } from "fflate";
import type { PageSchema } from "./domain.js";

async function collect(directory: string, prefix: string, output: Record<string, Uint8Array>) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name); const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) await collect(full, `${relative}/`, output);
    else output[relative] = new Uint8Array(await readFile(full));
  }
}

const indexHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>页面搭建器导出</title><link rel="icon" href="data:,"><link rel="stylesheet" href="./styles.css"></head><body><main id="page"></main><script src="./vendor/b2b/components/runtime/loader.js"></script><script type="module" src="./app.js"></script><script type="module" src="./business.js"></script></body></html>`;
const styles = `*{box-sizing:border-box}body{margin:0;background:#f6f7f9;color:#1f2329;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#page{max-width:1200px;margin:0 auto;padding:40px}.layout{display:flex;min-width:0}.layout-column{flex-direction:column}.layout-row{flex-direction:row;flex-wrap:wrap;align-items:flex-start}.layout-columns{display:grid;grid-template-columns:repeat(var(--columns,2),minmax(0,1fr))}.gap-small{gap:8px}.gap-medium{gap:16px}.gap-large{gap:24px}.component-host{min-width:0}@media(max-width:720px){#page{padding:20px}.layout-row,.layout-columns{display:flex;flex-direction:column}.component-host{width:100%}}`;
const app = `const page=await fetch('./page.json').then(r=>r.json());const root=document.querySelector('#page');const instances=[];async function render(node,target){if(node.kind==='layout'){const el=document.createElement('section');el.className='layout layout-'+node.layout+' gap-'+node.gap;if(node.columns)el.style.setProperty('--columns',node.columns);target.append(el);for(const child of node.children)await render(child,el);return}const host=document.createElement('div');host.className='component-host';host.dataset.nodeId=node.id;target.append(host);const result=await window.B2B.renderComponent({component:node.componentId,props:node.props},host);instances.push(result.instance)}await render(page.root,root);window.pageBuilderExport={page,instances};`;
const business = `// Add business event listeners here. Generated rendering stays isolated in app.js.\n`;
const readme = `# 导出的页面工程\n\n本工程固定到导出时的 Page Schema revision。\n\n启动：在本目录运行 \`python3 -m http.server 4173\`，然后打开 http://127.0.0.1:4173。\n\n- \`page.json\`：可重新导入页面搭建器的页面描述\n- \`app.js\`：生成的真实 Renderer 调用\n- \`business.js\`：独立业务逻辑入口\n- \`vendor/b2b\`：固定的组件运行资源\n`;

export async function exportPage(page: PageSchema, libraryDirectory: string, outputRoot: string) {
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const directory = path.join(outputRoot, page.pageId, `r${page.revision}-${stamp}`); await mkdir(directory, { recursive: true });
  const files: Record<string, Uint8Array> = {
    "index.html": strToU8(indexHtml), "styles.css": strToU8(styles), "app.js": strToU8(app), "business.js": strToU8(business), "README.md": strToU8(readme), "page.json": strToU8(JSON.stringify(page, null, 2))
  };
  await collect(libraryDirectory, "vendor/b2b/", files);
  if (files["vendor/b2b/manifest.json"]) {
    const manifest = JSON.parse(new TextDecoder().decode(files["vendor/b2b/manifest.json"]));
    delete manifest.sourcePath;
    files["vendor/b2b/manifest.json"] = strToU8(JSON.stringify(manifest, null, 2));
  }
  const zip = zipSync(files, { level: 6 }); const zipPath = path.join(directory, `page-builder-${page.pageId}-r${page.revision}.zip`);
  await writeFile(zipPath, zip); await writeFile(path.join(directory, "page.json"), JSON.stringify(page, null, 2));
  return { pageId: page.pageId, revision: page.revision, zipPath, directory, fileCount: Object.keys(files).length, bytes: zip.length };
}
