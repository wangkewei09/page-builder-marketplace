import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { readNativeAssets } from "./native-resource.js";

export type RenderRequest = { component: string; props: Record<string, unknown> };
export class RendererValidator {
  private browser: any;
  private tail: Promise<unknown> = Promise.resolve();
  private idle?: ReturnType<typeof setTimeout>;
  private pages = new Map<string, any>();
  private valid = new Set<string>();
  constructor(private workDirectory: string, private transportFile: string) {}
  async close() { clearTimeout(this.idle); const browser = this.browser; this.browser = null; this.pages.clear(); await browser?.close(); }
  check(directory: string, requests: RenderRequest[], files?: string[]) {
    const run = async () => {
      clearTimeout(this.idle);
      const remaining = requests.filter(r => !this.valid.has(directory + JSON.stringify(r)));
      if (!remaining.length && !files) return;
      if (!this.browser) { const mod = "playwright-core"; const { chromium } = await import(mod); this.browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true }); }
      const cacheKey = directory + (files ? ":native" : ":http"); let page = this.pages.get(cacheKey);
      try {
        if (!page) {
          page = await this.browser.newPage();
          if (files) {
            const assets = await readNativeAssets(directory, files);
            const transport = await readFile(this.transportFile, "utf8");
            const literal = JSON.stringify(assets).replace(/</g, "\\u003c");
            const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'";
            await page.setContent(`<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><div id="root"></div><script>${transport.replace(/<\/script/gi, "<\\/script")}</script><script>window.runtimeReady=PageBuilderResources.installLibraryTransport(${literal}).script('components/runtime/loader.js').then(()=>B2B.componentRuntimeReady);</script>`);
          } else {
            await mkdir(this.workDirectory, { recursive: true });
            const file = path.join(this.workDirectory, createHash("sha256").update(directory).digest("hex") + ".html");
            await writeFile(file, `<!doctype html><meta charset="utf-8"><script src="${pathToFileURL(path.join(directory, "components/runtime/loader.js")).href}"></script><div id="root"></div>`);
            await page.goto(pathToFileURL(file).href);
          }
          this.pages.set(cacheKey, page);
        }
        await page.evaluate(async (items: RenderRequest[]) => {
          if ((window as any).runtimeReady) await (window as any).runtimeReady;
          for (const request of items) {
            const target = document.createElement("div"); document.querySelector("#root")!.append(target);
            let result; try { result = await (window as any).B2B.renderComponent(request, target); if (!result.audit.valid) throw new Error(`${request.component} 校验失败`); }
            finally { result?.instance.destroy(); target.remove(); }
          }
        }, files ? requests : remaining);
        for (const r of remaining) this.valid.add(directory + JSON.stringify(r));
        if (this.valid.size > 1500) this.valid.clear();
      } finally { this.idle = setTimeout(() => { void this.close(); }, 30_000); this.idle.unref(); }
    };
    const result = this.tail.then(run); this.tail = result.catch(() => {}); return result;
  }
}
