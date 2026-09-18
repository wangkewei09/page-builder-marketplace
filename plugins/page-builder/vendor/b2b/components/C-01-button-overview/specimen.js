(function registerButtonOverview() {
  "use strict";
  var D = window.B2BDesignSource;
  var scriptUrl = document.currentScript.src;
  var loaderPromise = null;
  var mounted = null;
  var mountSequence = 0;
  var names = { "C-02": "基础按钮", "C-03": "文字按钮", "C-04": "图标按钮", "C-05": "全圆角按钮", "C-06": "分裂 / 菜单按钮", "C-07": "悬浮按钮" };
  function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function ensureRuntime() {
    Array.from(document.scripts).forEach(function(s) {
      if (/\/components\/shared\/(specimen-runtime|interactions)\.js(?:\?|$)/.test(s.src) && D.componentFactories && D.bindInteractions) s.dataset.b2bLoaded = "true";
    });
    if (window.B2B && B2B.describeComponentFamily) return B2B.describeComponentFamily("button");
    if (!loaderPromise) loaderPromise = new Promise(function(resolve,reject) {
      var url = new URL("../runtime/loader.js?c01-overview-20260908",scriptUrl).href;
      var script = document.querySelector('script[data-c01-loader]');
      if (!script) { script=document.createElement("script");script.src=url;script.dataset.c01Loader="";document.head.appendChild(script); }
      script.addEventListener("load",resolve,{once:true});script.addEventListener("error",reject,{once:true});
    });
    return loaderPromise.then(function(){return B2B.describeComponentFamily("button");});
  }
  function createPage() {
    var specs=[];
    function slot(key,id,label,props,onEvent) {
      specs.push({key:key,id:id,label:label,props:props,onEvent:onEvent,instance:null});
      return '<span class="c01-slot" data-c01-slot="'+key+'" aria-busy="true"></span>';
    }
    function basic(key,label,variant,onEvent,icon) { return slot(key,"C-02",label,{label:label,variant:variant||"secondary-gray",size:"medium",width:"default",icon:icon||null,disabled:false,loading:false},onEvent); }
    function icon(key,label,glyph,onEvent) { return slot(key,"C-04",label,{variant:"Button_Icon",label:label,icon:glyph,size:32,tooltip:true,disabled:false,items:[]},onEvent); }
    function menu(key,label,items,onEvent) {return slot(key,"C-06",label,{variant:"Menu button",appearance:"secondary-gray",size:32,label:label,items:items.map(function(label){return {label:label};}),mainIcon:null,icon:null,open:false,disabled:false},onEvent);}
    function iconMenu(key,label,glyph,items,onEvent) {return slot(key,"C-04",label,{variant:"menu trigger",label:label,icon:glyph,size:32,tooltip:true,disabled:false,items:items.map(function(label){return {label:label};})},onEvent);}
    function scene(title,description,content) {return '<article class="c01-scene"><h4>'+title+'</h4><p>'+description+'</p>'+content+'</article>';}
    var flags={};
    function toggle(key,on,off,styleOn,styleOff,icons) {return function(event,ctx){if(event.type!=="b2b:button-activate")return;flags[key]=!flags[key];ctx.update(key,{label:flags[key]?on:off,variant:flags[key]?styleOn:styleOff,icon:icons?(flags[key]?icons[1]:icons[0]):null});};}
    var familySamples={
      "C-02":basic("basic-primary","创建账号","primary")+basic("basic-secondary","取消")+basic("basic-danger","删除","danger"),
      "C-03":slot("text-action","C-03","查看全部",{variant:"Button_Text",tone:"neutral",label:"查看全部",leadingIcon:null,trailingArrow:"chevron_right",href:null,disabled:false})+slot("text-link","C-03","前往设置",{variant:"Link",tone:"primary",label:"前往设置",href:"?component=C-03#components",leadingIcon:null,trailingArrow:null,disabled:false}),
      "C-04":icon("icon-edit","编辑","edit")+icon("icon-person","个人","person")+icon("icon-settings","设置","settings"),
      "C-05":slot("rounded-download","C-05","下载 System",{variant:"Primary",label:"下载 System",size:"medium",width:"default",icon:null,iconPlacement:"none",disabled:false,loading:false})+slot("rounded-later","C-05","稍后体验",{variant:"Outlined",label:"稍后体验",size:"medium",width:"default",icon:null,iconPlacement:"none",disabled:false,loading:false}),
      "C-06":slot("split-create","C-06","创建日程",{variant:"Split button",appearance:"primary",label:"创建日程",size:32,mainIcon:null,icon:null,open:false,disabled:false,items:[{label:"创建会议"},{label:"创建提醒"},{label:"创建任务"}]}),
      "C-07":slot("floating-add","C-07","新建",{variant:"primary",appearance:"primary",size:40,icon:"add",label:"新建",disabled:false,expanded:false,items:[],badge:0,messageText:"",avatarText:"",avatarLabel:""})+slot("floating-top","C-07","返回顶部",{variant:"secondary",appearance:"secondary",size:40,icon:"keyboard_double_arrow_up",label:"返回顶部",disabled:false,expanded:false,items:[],badge:0,messageText:"",avatarText:"",avatarLabel:""})
    };
    var html='<div class="component-production-docs c01-overview" data-c01-overview><section class="c01-section"><span class="c01-eyebrow">组件 API 概述</span><h3>按动作与场景，选择合适的按钮</h3><p>基础、文字、图标、全圆角、菜单和悬浮按钮各自负责不同场景。下方示例直接使用当前 System 组件库；具体参数与完整变体请进入对应组件。</p><div class="c01-family-grid">'+Object.keys(names).map(function(id){return '<article class="c01-family-card" data-c01-family="'+id+'"><div class="c01-samples">'+familySamples[id]+'</div><h4>'+id+' '+names[id]+'</h4><p data-c01-selection="'+id+'"></p><a href="?component='+id+'#components">查看完整规范 →</a></article>';}).join('')+'</div><details class="c01-family-details"><summary>按钮家族与 API 选型</summary><p>概述不提供独立 Renderer。使用 describeComponentFamily("button") 选型，再读取目标组件的 describe().api.props。</p><div class="c01-table-wrap"><table><thead><tr><th>组件</th><th>类型</th><th>合法尺寸</th></tr></thead><tbody data-c01-family-table></tbody></table></div></details></section>';
    html+='<section class="c01-section"><span class="c01-eyebrow">使用方式</span><h3>层级清晰，文案直接表达结果</h3><p>同一区域只保留一个主操作，同组按钮不超过两种视觉层级。低频操作收入菜单；空间不足时调整布局，保持按钮标签完整。</p><div class="c01-guidelines">'+scene('两层操作','主操作突出，次操作保持克制。','<div class="c01-action-line"><strong>组织架构</strong><div class="c01-actions">'+basic('history','调整记录')+basic('adjust','调整','primary')+'</div></div>')+scene('多个相关操作','将低频操作收纳到菜单中。','<div class="c01-actions">'+menu('more-actions','更多操作',['复制','移动','导出','删除'])+basic('member-add','添加成员','primary',null,'person_add')+'</div>')+'</div></section>';
    html+='<section class="c01-section"><span class="c01-eyebrow">通用用法模板</span><h3>保留常用布局与文案示例</h3><div class="c01-guidelines">'+
      scene('三层操作','二、三级操作保持相同视觉层级，主操作突出。','<div class="c01-action-line"><strong>组织架构</strong><div class="c01-actions">'+basic('usage-display','展示设置')+basic('usage-history','调整记录')+basic('usage-adjust','调整','primary')+'</div></div>')+
      scene('文案直接表达结果','危险操作明确说明对象和结果。','<div class="c01-actions">'+basic('usage-cancel','取消')+basic('usage-delete','删除成员','danger')+'</div>')+
      scene('标签完整显示','标签不换行、不截断；空间不足时调整外围布局。','<div class="c01-actions">'+basic('usage-continue','确认并继续','primary')+'</div>')+
      scene('图标强化语义','用图标辅助辨识功能，保持文字清晰。','<div class="c01-actions">'+basic('usage-add','添加成员','secondary-gray',null,'person_add')+'</div>')+
      scene('状态切换沿用按钮类型','切换后继续保留原按钮的悬停、按下和聚焦反馈。','<div class="c01-actions">'+basic('usage-subscribed','已订阅','secondary-blue',toggle('usage-subscribed','订阅','已订阅','secondary-gray','secondary-blue'),'notifications_active')+'</div>')+'</div></section>';
    var format={bold:false,italic:false,underline:false,size:14,style:'正文',color:'default',highlight:'none',align:'left'};
    var formatItems=[{label:'加粗',icon:'format_bold',selected:false},{label:'斜体',icon:'format_italic',selected:false},{label:'下划线',icon:'format_underlined',selected:false}];
    function applyFormat(ctx) {
      var preview=ctx.root.querySelector('[data-c01-text-preview]');
      preview.style.fontSize=format.size+'px';
      preview.style.fontWeight=format.bold?'700':'400';preview.style.fontStyle=format.italic?'italic':'normal';preview.style.textDecoration=format.underline?'underline':'none';preview.style.textAlign=format.align;
      preview.style.color=format.color==='default'?'var(--b2b-color-text-primary)':format.color==='blue'?'var(--b2b-color-action-primary)':'var(--b2b-color-danger)';
      preview.style.backgroundColor=format.highlight==='none'?'transparent':format.highlight==='yellow'?'var(--b2b-yellow-100)':'var(--b2b-green-100)';
      preview.focus({preventScroll:true});
    }
    function menuFormat(field,values,key) {return function(e,ctx){if(e.type!=='b2b:menu-button-select'&&e.type!=='b2b:icon-menu-select')return;format[field]=values[e.detail.index];if(field==='style'){format.size=format.style==='标题'?24:format.style==='副标题'?20:14;ctx.update('format-size',{label:String(format.size),open:false});}if(key)ctx.update(key,{label:String(format[field]),open:false});applyFormat(ctx);};}
    var tools=icon('format-reset','清除格式','format_clear',function(e,ctx){if(e.type!=='b2b:icon-activate')return;Object.assign(format,{bold:false,italic:false,underline:false,size:14,style:'正文',color:'default',highlight:'none',align:'left'});ctx.update('format-style',{label:'正文',open:false});ctx.update('format-size',{label:'14',open:false});ctx.update('format-emphasis',{items:formatItems.map(function(i){return Object.assign({},i);})});applyFormat(ctx);})+
      '<span class="c01-tool-divider" aria-hidden="true"></span><div class="c01-tool-group">'+menu('format-style','正文',['正文','副标题','标题'],menuFormat('style',['正文','副标题','标题'],'format-style'))+menu('format-size','14',['12','14','16','18','20','24'],menuFormat('size',[12,14,16,18,20,24],'format-size'))+'</div><span class="c01-tool-divider" aria-hidden="true"></span>'+
      slot('format-emphasis','C-04','文字样式',{variant:'icon group',label:'文字样式',icon:'format_bold',size:32,tooltip:true,disabled:false,items:formatItems.map(function(i){return Object.assign({},i);})},function(e,ctx){if(e.type!=='b2b:icon-activate')return;var field=['bold','italic','underline'][e.detail.index];format[field]=!format[field];ctx.update('format-emphasis',{items:formatItems.map(function(i,n){return Object.assign({},i,{selected:format[['bold','italic','underline'][n]]});})});applyFormat(ctx);})+
      '<div class="c01-tool-group">'+iconMenu('format-color','文字颜色','format_color_text',['默认','主题色','红色'],menuFormat('color',['default','blue','red']))+iconMenu('format-highlight','高亮颜色','format_color_fill',['无高亮','黄色','绿色'],menuFormat('highlight',['none','yellow','green']))+'</div><span class="c01-tool-divider" aria-hidden="true"></span>'+iconMenu('format-align','文本对齐','format_align_left',['左对齐','居中对齐','右对齐'],menuFormat('align',['left','center','right']));
    html+='<section class="c01-section"><span class="c01-eyebrow">富文本工具栏</span><h3>统一尺寸，按功能分组</h3><p>选择格式，查看下方文字效果。图标、菜单统一使用 32px 按钮，窗口变窄时按组换行。</p><div class="c01-editor"><div class="c01-rich-toolbar" role="group" aria-label="富文本工具栏">'+tools+'</div><div class="c01-text-preview" data-c01-text-preview tabindex="0" role="region" aria-label="文字效果预览">System<br>用一致的组件构建清晰、高效的产品体验。</div></div></section>';
    html+='<section class="c01-section"><span class="c01-eyebrow">当前示例 · 组件 API</span><h3>查看正在使用的组件和参数</h3><label class="c01-example-label">示例 <select data-c01-code-select aria-label="查看组件调用">'+specs.map(function(r){return '<option value="'+r.key+'">'+r.id+' · '+esc(r.label)+'</option>';}).join('')+'</select></label><output class="c01-status" data-c01-status tabindex="-1" role="status">选择任一示例，查看对应的调用参数。</output><div class="c01-doc-actions"><button type="button" data-c01-code-toggle aria-expanded="false" aria-controls="c01-current-code">展开代码</button><button type="button" data-c01-copy>复制代码</button><button type="button" data-c01-params-toggle aria-expanded="true" aria-controls="c01-current-params">收起参数</button></div><pre class="c01-code" id="c01-current-code" hidden><code data-c01-code></code></pre><div class="c01-table-wrap" id="c01-current-params"><table><thead><tr><th>参数</th><th>当前值</th><th>合法值 / 类型</th></tr></thead><tbody data-c01-params></tbody></table></div></section></div>';
    return {html:html,specs:specs};
  }
  async function mountSpecimen(scope) {
    var root=scope||document;
    if(root.closest&&root.closest('[data-c01-overview]'))return;
    var card=root.matches&&root.matches('article[data-component-card="C-01"]')?root:root.querySelector&&root.querySelector('article[data-component-card="C-01"]');
    if(!card)return;
    var preview=card.querySelector(':scope > .component-preview');if(!preview)return;
    var sequence=++mountSequence;
    try { await ensureRuntime(); } catch(error) { preview.textContent='示例加载失败：'+error.message; return; }
    if(sequence!==mountSequence||!card.isConnected)return;
    if(mounted)mounted.destroy();
    preview.hidden=true;
    var page=createPage();
    var H=D.componentFactories||D.componentSpecimenHelpers;
    preview.insertAdjacentHTML('afterend','<section class="c01-scene-composition" data-c01-canonical-templates><h3>场景中的状态变化</h3><p>保留完整业务上下文，对照未选中与已选中的表现。</p><div class="c01-scene-scroll" tabindex="0" aria-label="按钮场景对照，可横向浏览">'+H.buttonSpecialTypes({richText:false,mediaSlots:true})+'</div></section>'+page.html);
    var scenes=preview.nextElementSibling,docs=scenes.nextElementSibling,disposed=false,observer=null;
    function avatar(label,file,size,icon){return {variant:file?'image':'icon',image:file?new URL('assets/'+file,scriptUrl).href:null,icon:icon||null,label:label,text:label.slice(0,1),fallback:label.slice(0,1),size:size,shape:'round',items:[]};}
    function tag(text,color){return {variant:'category',type:'property',size:'small',text:text,color:color,icon:null,avatar:null,closable:false,checkable:false,checked:false,loading:false,bordered:false,solid:false,disabled:false};}
    function showBackFeedback(event){
      if(event.type!=='b2b:icon-activate')return;
      var card=event.currentTarget.closest('.mini-title-card');
      var feedback=card.querySelector('[data-c01-back-feedback]');
      if(!feedback){feedback=document.createElement('output');feedback.className='c01-back-feedback';feedback.dataset.c01BackFeedback='';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');card.appendChild(feedback);}
      feedback.textContent='示例：返回我的空间';
    }
    var media={
      'document-back':[['C-04',{variant:'Button_Icon',icon:'arrow_back_ios_new',label:'返回我的空间',size:40,tooltip:true,disabled:false,items:[]},showBackFeedback]],
      'subscription-person':[['C-32',avatar('李天天','colleague.jpg',40)]],
      'subscription-brand':[['C-32',avatar('System',null,40,'deployed_code')]],
      'toolbar-person':[['C-32',avatar('李天天','colleague.jpg',32)]],
      'feed-group':[['C-32',avatar('产品问题反馈',null,40,'group')]],
      'feed-person':[['C-32',avatar('李梅','member.jpg',40)]],
      'contact-person':[['C-32',avatar('孙九九','contact.jpg',64)]],
      'meeting-tag':[['C-42',tag('外部','blue')]],
      'contact-tags':[['C-42',tag('内推','yellow')],['C-42',tag('BAT','purple')],['C-42',tag('985','purple')]]
    };
    scenes.querySelectorAll('[data-c01-scene-media]').forEach(function(host,index){
      media[host.dataset.c01SceneMedia].forEach(function(entry,n){var slot=document.createElement('span');slot.className='c01-media-slot';host.appendChild(slot);var key='scene-'+host.dataset.c01SceneMedia+'-'+index+'-'+n;page.specs.push({key:key,id:entry[0],label:entry[1].label||entry[1].text,props:entry[1],onEvent:entry[2],host:slot,instance:null});var option=document.createElement('option');option.value=key;option.textContent=entry[0]+' · 场景 '+(entry[1].label||entry[1].text);docs.querySelector('[data-c01-code-select]').appendChild(option);});
    });
    var ctx={root:docs,records:page.specs,record:function(key){return page.specs.find(function(r){return r.key===key;});},announce:function(text,focus){var out=docs.querySelector('[data-c01-status]');out.textContent=text;if(focus)out.focus({preventScroll:true});},update:function(key,next){var r=ctx.record(key);r.instance.update(next);Object.assign(r.props,next);var audit=r.instance.validate();if(!audit.valid)throw Error(audit.errors.join('; '));renderCode();},destroy:function(){if(disposed)return;disposed=true;if(observer)observer.disconnect();page.specs.forEach(function(r){if(r.instance)r.instance.destroy();});scenes.remove();docs.remove();}};
    mounted=ctx;docs._c01Overview=ctx;
    observer=new MutationObserver(function(){if(!docs.isConnected)ctx.destroy();});observer.observe(document.body,{childList:true,subtree:true});
    function renderCode(){var r=ctx.record(docs.querySelector('[data-c01-code-select]').value);if(!r||!r.definition)return;docs.querySelector('[data-c01-code]').textContent='const definition = await B2B.describeComponent('+JSON.stringify(r.id)+');\nif (!definition.conformance.valid) throw new Error(definition.conformance.errors.join("; "));\nconst result = await B2B.renderComponent({\n  component: '+JSON.stringify(r.id)+',\n  props: '+JSON.stringify(r.props,null,2)+'\n}, document.querySelector("#'+r.key+'-slot"));\nif (!result.audit.valid) throw new Error(result.audit.errors.join("; "));';docs.querySelector('[data-c01-params]').innerHTML=Object.keys(r.props).map(function(k){var p=r.definition.api.props[k];return '<tr><th><code>'+k+'</code></th><td><code>'+esc(JSON.stringify(r.props[k]))+'</code></td><td>'+esc(p.values?p.values.join(' / '):p.type)+'</td></tr>';}).join('');}
    try {
      var family=await ensureRuntime();if(disposed)return;

      docs.querySelector('[data-c01-family-table]').innerHTML=family.components.map(function(c){var sizes=c.capabilities.sizes||[],map=c.capabilities.sizePixels;docs.querySelector('[data-c01-selection="'+c.id+'"]').textContent=c.selection;return '<tr><th>'+c.id+' '+names[c.id]+'</th><td>'+esc(c.kind)+'</td><td>'+esc(sizes.length?sizes.map(function(s){return map?s+' ('+map[s]+'px)':String(s);}).join(' / '):'内容驱动')+'</td></tr>';}).join('');
      await Promise.all(page.specs.map(async function(r){var host=r.host||docs.querySelector('[data-c01-slot="'+r.key+'"]');var definition=await B2B.describeComponent(r.id);if(Object.keys(r.props).some(function(key){return !definition.api.props[key];}))throw Error(r.id+' 存在未声明参数');var result=await B2B.renderComponent({component:r.id,props:r.props},host);r.instance=result.instance;r.definition=result.definition;if(disposed){r.instance.destroy();return;}host.setAttribute('aria-busy','false');host.dataset.c01Valid=String(result.audit.valid);if(r.host)r.host.parentElement.setAttribute('aria-busy','false');result.definition.api.events.forEach(function(name){r.instance.element.addEventListener(name,function(event){if(r.onEvent)r.onEvent(event,ctx);if(r.id==='C-06'&&(name==='b2b:menu-button-open'||name==='b2b:menu-button-close'))r.props.open=name==='b2b:menu-button-open';docs.querySelector('[data-c01-code-select]').value=r.key;renderCode();ctx.announce(r.label+' · '+name);});});}));
      if(disposed)return;
      docs.querySelector('[data-c01-code-select]').addEventListener('change',renderCode);
      docs.querySelector('[data-c01-code-toggle]').addEventListener('click',function(e){var box=docs.querySelector('#c01-current-code');box.hidden=!box.hidden;e.currentTarget.setAttribute('aria-expanded',String(!box.hidden));e.currentTarget.textContent=box.hidden?'展开代码':'收起代码';});
      docs.querySelector('[data-c01-params-toggle]').addEventListener('click',function(e){var box=docs.querySelector('#c01-current-params');box.hidden=!box.hidden;e.currentTarget.setAttribute('aria-expanded',String(!box.hidden));e.currentTarget.textContent=box.hidden?'展开参数':'收起参数';});
      docs.querySelector('[data-c01-copy]').addEventListener('click',async function(e){var button=e.currentTarget;try{await navigator.clipboard.writeText(docs.querySelector('[data-c01-code]').textContent);button.textContent='已复制';}catch(error){button.textContent='复制失败，请从代码中复制';}});
      renderCode();docs.dataset.c01Ready='true';
    }catch(error){if(!disposed){docs.dataset.c01Ready='error';ctx.announce('示例加载失败：'+error.message);}}
  }
  document.addEventListener('b2b:specimens-rendered',function(event){mountSpecimen(event.detail&&event.detail.root?event.detail.root:document);});
  function renderSourceTemplates(){return ""; /* Source scenes mount beside the preview for real child Renderers. */}
  D.registerComponent('C-01',{renderSpecimen:renderSourceTemplates,mountSpecimen:mountSpecimen});
})();
