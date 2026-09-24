import { readFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version=JSON.parse(await readFile(source+'/.codex-plugin/plugin.json','utf8')).version;
const installed=path.join(process.env.HOME,'.codex/plugins/cache/page-builder-development/page-builder',version);
const files=['.codex-plugin/plugin.json','.mcp.json','dist/build.json','dist/server.js','dist/ui/app.js','dist/ui/index.html','dist/ui/styles.css','dist/ui/canvas-renderer.js','dist/ui/inline-editor.js','dist/ui/project-manager.js','dist/ui/vendor/b2b/components/runtime/inline-editing.json','dist/ui/selection-toolbar.js','dist/ui/canvas-drag.js','dist/ui/library-transport.js','dist/node_modules/playwright-core/package.json','skills/page-builder/SKILL.md'];
for(const file of files) assert.deepEqual(await readFile(installed+'/'+file),await readFile(source+'/'+file),file);
const data=await mkdtemp(path.join(tmpdir(),'page-builder-installed-selection-'));
const client=new Client({name:'installed-selection-verification',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[installed+'/dist/server.js'],env:{...process.env,PAGE_BUILDER_DATA_DIR:path.join(data,'pages'),PAGE_BUILDER_LIBRARY_DIR:path.join(data,'libraries'),PAGE_BUILDER_EXPORT_DIR:path.join(data,'exports')}}));
try {
 const resource=await client.readResource({uri:'ui://page-builder-development/editor-v5.html'});const html=resource.contents[0].text;
 assert.ok(html.includes('project_create')); assert.ok(html.includes('project_update')); assert.ok(html.includes('project_relink')); assert.ok(html.includes('project-home')); assert.ok(html.includes('createProjectManager'));
 assert.ok(html.includes(version));assert.ok(html.includes('createCanvasRenderer'));assert.ok(html.includes('createInlineEditor'));assert.ok(html.includes('data-pb-inline-edit'));assert.ok(html.includes('plaintext-only'));assert.ok(!html.includes('.inline-editor{'));assert.ok(html.replace(/\\u([0-9a-f]{4})/ig, (_, hex) => String.fromCharCode(parseInt(hex, 16))).includes('加入 AI 上下文'));assert.ok(html.includes('content_copy'));
 const created=await client.callTool({name:'project_create',arguments:{name:'installed-project-check',parentDirectory:data}});assert.ok(!created.isError,JSON.stringify(created));const project=created.structuredContent;const read=await client.callTool({name:'page_get_schema',arguments:{workspaceId:project.project.workspaceId,pageId:project.page.pageId}});assert.ok(!read.isError,JSON.stringify(read));assert.equal(read.structuredContent.workspaceId,project.project.workspaceId);
 const updated=await client.callTool({name:'project_update',arguments:{workspaceId:project.project.workspaceId,expectedRevision:0,name:'安装版项目卡片',description:'安装后实际保存设置',starred:true,coverImage:null}});assert.ok(!updated.isError,JSON.stringify(updated));assert.equal(updated.structuredContent.project.revision,1);assert.equal(updated.structuredContent.project.description,'安装后实际保存设置');
 console.log(JSON.stringify({projectTools:true,projectSettings:true,version,installed,matchingFiles:files.length,installedMcpResource:true,htmlCharacters:html.length,actualCodexHostReloaded:false}));
} finally {await client.close();}
