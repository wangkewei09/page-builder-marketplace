# C-01 场景模板的保留与组合边界

2026-09-09：在 2dd8c74 本地 release 基线上，根据飞书按钮概述和用户三张参考图精修头像、标签、图标和对齐。保留完整场景、语义状态与原有分组；没有把场景缩减成孤立按钮。

## 展示结构与所有权

- C-01 继续不提供独立生产 Renderer。
- `.c01-scene-composition` 是 `.component-preview` 的同级 light DOM 源场景挂载区，由 canonical `buttonSpecialTypes({richText:false,mediaSlots:true})` 直接生成布局。不是克隆 specimen/evidence DOM，也未放宽 canonical adapter 校验。
- C-32 图片/图标头像、C-42 category 标签通过 describe 和 renderComponent 挂入源场景的显式 media slot；其内部 DOM、CSS、ARIA 和生命周期归 Renderer。54 个实例（原32按钮+20头像/标签+2返回按钮）由统一 ctx 管理和销毁。
- 下方原有 `.component-production-docs` 继续展示 C-02～C-07 的32个 API 示例、工具栏和调用代码。新增媒体实例的公开 props 同样能在“当前示例”选择查看并复制。
- 完整场景中的绿色业务切换按钮、语义选中图标仍属于既有 canonical source 示例，沿用原交互；整张场景尚未作为生产页面模板 API 化。
- shared factory 仅增加 C-01 专属 opt-in mediaSlots 分支，默认调用保持原输出。未新增共享 runtime 或 interaction 能力。

## 视觉规则

- 人物使用本地图片头像：订阅/动态40px、工具栏32px、联系人64px，遵循 C-32 合法尺寸；参考图约56px联系人头像有意映射为64px，不覆盖头像内部大小。System 和群组使用 C-32 图标头像；参考中的群图标复合角标不在现有C-32合法配置范围内，本轮未造第二套头像。
- 外部标签、内推/BAT/985采用C-42 category/property/small，分别blue/yellow/purple，显式关闭默认图标、边框和交互。标签组分隔线属于外围布局。
- 联系人操作与姓名行顶端对齐，头像和资料分别占64px/自适应列；联系方式在第二行，不挤入姓名行。
- 文档置顶/动态关注/联系人收藏图标20px，选中使用填充字形且保持透明底色。灰色默认、绿色置顶、蓝色关注、黄色收藏的语义保持。
- 分享栏顶部操作右对齐，搜索前有分隔线，底部彩色圆环与全屏/分享按钮居中对齐；不改变业务区域层级。
- 会议图标圆底40px、字形20px；标题、标签同排，会议纪要图标16px；加入按钮最小宽88px，选中后保持白底绿线，不因文案变化跳宽。
- 日程仍为橙色标题和三列等宽操作；筛选仍为无下拉箭头的文字切换。
- 窄屏保持完整对照画布，可键盘聚焦并横向浏览；不重排/隐藏参考中的关键内容。

## 资源与维护

示例图片在 assets/，来源与SHA记录在 assets/sources.json。示例姓名与图片只是虚构业务数据。其他页不加载这些图片；不会触发外部头像网络请求。

C-01 CSS只调整自有场景布局及原 canonical 示例图标，不覆盖C-32/C-42内部节点。可扩展能力先查各组件describe；不得为了贴图传非法56px头像、私有颜色或自定义HTML。

2026-09-09 返回箭头补充：两列文档头均通过 C-04 Button_Icon Renderer 挂载 arrow_back_ios_new / size:40（22px字形），label 为“返回我的空间”，tooltip:true。按钮使用原生鼠标/Enter/Space与焦点行为；C-01只监听 b2b:icon-activate，在对应卡片旁显示“示例：返回我的空间”。示例不操纵浏览器历史。未修改 C-04 内部 CSS 或公共 API。
