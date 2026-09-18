# Component Renderer Runtime

所有生产 Renderer 必须遵守 [`../COMPONENT_API_STANDARD.md`](../COMPONENT_API_STANDARD.md)。当前公共协议版本为 `1.0.0`。

## 目的

Renderer 将组件的 DOM anatomy、样式依赖和交互入口收敛为可执行 API。页面生成器只选择 renderer 和 props，不再复制 specimen HTML、拼组件子元素或重写组件交互。

普通页面生成以 `describe().api`、Renderer 真实输出和 `validate()` 为生产权威。contract 用于理解，specimen 用于文档展示；只有修改组件库或出现冲突时才继续检查原始 styles、DOM/helper 与 interaction。

## 强制调用形式

```html
<script src="./Ai生成页面规范/design-source/components/runtime/loader.js"></script>
```

```js
// 按编号或 API 名加载页面实际使用的 renderer。loader 会按固定顺序加载
// runtime、contract、参数协议、源 DOM 工厂、完整 interaction 与 renderer。
await window.B2B.loadComponents(["C-23", "C-40", "tabs"]);

// AI 必须先读取 describe()，api.props 是唯一可传入参数集合。
const selectDefinition = window.B2B.components.select.describe();
console.log(selectDefinition.api.props);

const select = window.B2B.components.select.create({
  items: ["Option 1", "Option 2", "Option 3"],
  selected: ["Option 1"],
  open: false
});

select.mount(document.querySelector("#filter"));
await select.ready;

const audit = select.validate();
if (!audit.valid) throw new Error(audit.errors.join(", "));
```

页面生成 AI 默认优先使用安全入口，避免漏掉加载、ready 或 validate：

```js
const definition = await window.B2B.describeComponent("C-23");
if (!definition.conformance.valid) throw new Error(definition.conformance.errors.join("; "));

const { instance, audit } = await window.B2B.renderComponent({
  component: "C-23",
  props: {
    items: ["Option 1", "Option 2", "Option 3"],
    selected: ["Option 1"],
    open: false
  }
}, document.querySelector("#filter"));
```

`renderComponent()` 固定执行 load → describe/conformance → strict props → create → mount → ready → validate。未知参数、非法枚举、缺失依赖、错误 root 或 validate 失败都会抛错并销毁失败实例。

页面不得手动排列 runtime 脚本，也不得单独加载 renderer。`loader.js` 会加载 Token、base、shared base，以及 `api-schema.js` 为该组件声明的全部组件样式依赖；不会把全量 `styles/components.css` 注入业务页面。这样既保留真实 Token/组件级联，也避免未使用组件的样式偶然影响结果。

## 可查询的完整调用参数

```js
const definition = window.B2B.components.dataTable.describe();

definition.protocolVersion;          // "1.0.0"
definition.conformance.valid;        // true；注册时已强制检查
definition.ai.propGroups;            // AI 参数角色分组与所有权边界
definition.id;                       // "C-40"
definition.contract.variants;        // contract 中的合法变体
definition.contract.sizes;           // contract 中的合法尺寸
definition.contract.states;          // contract 中的合法状态
definition.contract.anatomy;         // 完整 anatomy
definition.contract.rules;           // 组件规则
definition.contract.tokens;          // Token 来源
definition.api.props;                 // renderer 接受的具体参数、类型、枚举和默认值
definition.api.events;                // 页面可以监听的 b2b:* 事件
definition.api.keyboard;              // renderer 内部实现的键盘操作
definition.sourceAuthority;           // DOM / CSS / interaction 的当前源码位置
```

每个组件都把 contract 的全部合法变体直接暴露为可执行参数，而不是让 AI 从语义文案猜测：

```js
const tableDefinition = window.B2B.components.dataTable.describe();
const variant = tableDefinition.api.props.variant;

variant.values;             // 与 definition.contract.variants 名称集合完全一致
variant.default;            // 无参数 create() 使用的完整合法默认变体
variant.presets;            // 每个合法变体对应的具体、完整 props

// 最完整的默认调用；DOM、CSS、交互与 ARIA 均由 Renderer 创建。
const defaultTable = window.B2B.components.dataTable.create();

// 精确选择 contract 中的变体；不得把变体名称重新解释成别的组件结构。
const treeTable = window.B2B.components.dataTable.create({ variant: "tree" });
```

`variant.values`、`variant.presets` 与 `contract.variants` 必须逐名称一致；只比较数量不算通过。`create()` 先应用 `variant.default` 对应的 preset，再合并调用方显式传入且已在 `api.props` 声明的业务参数。样式参数、class 和 HTML 不在可调用参数中。

Preset 用于证明合法变体可执行，不是业务页面的数据源。业务页面必须显式传入截图或业务要求中的 items、label、content、value 等内容参数，禁止把 preset 的演示文案或演示数据带入交付页面。

- `api.props` 是调用参数的唯一权威；不是让 AI 把 contract 文案重新解释成 props。
- 每个 renderer 使用严格参数白名单，`additionalProperties` 固定为 `false`。传入未声明参数会立即抛错，不会静默回退成近似样式或错误语义。
- 样式数值不作为 props 交给 AI。renderer 直接加载当前 CSS 和 Token，AI 不得传字体、行高、padding、圆角、颜色或 class 覆盖组件内部样式。
- `contract` 用于理解和选择，`api` 用于实际调用；二者发生冲突时不得猜测，必须以 `sourceAuthority` 指向的当前源码核对并报告规范缺口。

`create()` 返回真实 DOM 实例对象，不返回供 AI 重新拼接的 HTML 字符串。公共实例协议为：

- `element`：组件真实 DOM root。
- `mount(target)`：挂载到 Element 或选择器。
- `ready`：Token、基础样式、图标字体和组件 CSS 加载完成的 Promise。
- `update(next)`：仅原生 renderer 开放的受控更新。
- `validate()`：返回 `{ valid, errors }`。
- `destroy()`：清理监听并移除 root。

Runtime 会为脚本和组件样式附加同一个源码版本标识。组件库更新后重新加载页面即可取得当前 CSS，不会继续复用浏览器中的旧组件样式。

## 交互边界

- Renderer 负责组件内部状态、鼠标/键盘操作、焦点与 ARIA 同步。
- 页面业务只监听 `b2b:*` 自定义事件，不得重写组件内部交互。
- 交互型 canonical renderer 在缺少 `shared/interactions.js` 时直接失败，不允许静默降级为静态外观。
- 兼容层在 document 上只绑定一次交互；后续实例只发送局部初始化事件，避免全局监听器随实例数增长。
- 页面不得在 Renderer 内部节点上重复绑定等价点击、键盘、焦点或 outside-click 行为。交互依赖缺失时必须失败并报告，不允许页面手工复现作为降级。

## 嵌套组件所有权

- Renderer 内部使用的按钮、图标按钮、徽标、标签、头像、滚动条和弹层属于父 Renderer 的 canonical anatomy。
- 页面只把父 Renderer 计为一个页面组件实例，不得为了“每个标准元素都映射组件”而再次挂载其内部依赖。
- 只有父组件 `api.props` 明确接受 slot、Node 或子组件实例时，调用方才可以传入；传入内容仍必须满足父组件的 validate 规则。
- 页面级验收检查父实例的完整 anatomy；组件库级验收再分别覆盖内部依赖和组合边界。

## 实现层级

- 原生 renderer：C-02—C-08、C-12、C-21、C-41、C-42。DOM、状态、事件、键盘与 ARIA 由各自 `renderer.js` 直接实现。
- Source-backed renderer：其余组件通过组件源码导出的 `componentFactories` 生成 canonical anatomy，再返回真实 DOM；不读取 specimen 展示板或验收页 DOM。所有外部字符串 props 先转义，AI 不能传入 markup、class 或原生 HTML 片段。
- C-01 仅保留 Button Overview，不提供生产 renderer。

### C-41 Tabs 生产 API

C-41 只把视觉形态登记为 `variant`：`line | capsule | card`。`scrollable`、`overflowItems`、`addable`、`item.closable` 和 `item.badge` 是可组合能力，不再伪装为视觉变体。

- `line`：支持 `large | medium | small`。
- `capsule`：支持 `medium | small`，控件视觉高度均由组件 CSS 固定为 28px。
- `card`：支持 `large | medium | small`；`addable` 和 `item.closable` 只能与 card 组合。
- `scrollable`：三种视觉形态均可使用，renderer 负责滚动按钮禁用态和激活项可见性。
- `overflowItems`：只用于 line/capsule，renderer 负责菜单、焦点、Escape 和 panel/ARIA 同步。
- `item.badge`：复用 C-33 Badge 源样式；字符串渲染 character，`true` 渲染 dot，Node 必须包含 `.source-badge` anatomy。

所有非法组合在 `create()` 时直接抛错；不得静默回退成相似形态。

## 验收入口

页面生成与组件库修改的验收深度不同，先按 `../../../VALIDATION_LEVELS.md` 选择 Level P、Level C 或 Level R。以下入口用于组件库级 Level C 验收：

- `组件Renderer批量验收/index.html`：50 个无参数默认实例；逐组件比对 DOM/内容、计算样式、全部合法变体、交互和运行时错误。变体测试结束后会重建可见默认实例，避免 document 级 outside-click、焦点或弹层行为污染验收画面。
- `组件Renderer批量验收/isolation.html?id=C-40`：只加载一个 Renderer，用于证明组件不依赖其他 Renderer 碰巧提前加载的样式或 DOM。

## Renderer 映射

| ID | API | ID | API |
|---|---|---|---|
| C-02 | `basicButton` | C-27 | `switch` |
| C-03 | `textButton` | C-28 | `treeSelect` |
| C-04 | `iconButton` | C-29 | `transfer` |
| C-05 | `roundedButton` | C-30 | `timePicker` |
| C-06 | `menuButton` | C-31 | `upload` |
| C-07 | `floatingButton` | C-32 | `avatar` |
| C-08 | `dropdownMenu` | C-33 | `badge` |
| C-09 | `cascader` | C-34 | `card` |
| C-10 | `colorPicker` | C-35 | `accordion` |
| C-11 | `checkbox` | C-36 | `emptyState` |
| C-12 | `navigationMenu` | C-37 | `imagePreview` |
| C-13 | `breadcrumb` | C-38 | `placeholder` |
| C-14 | `steps` | C-39 | `popover` |
| C-15 | `pagination` | C-40 | `dataTable` |
| C-16 | `scrollbar` | C-41 | `tabs` |
| C-17 | `anchor` | C-42 | `tag` |
| C-18 | `dataVisualization` | C-43 | `timeline` |
| C-19 | `datePicker` | C-44 | `tooltip` |
| C-20 | `form` | C-45 | `dialog` |
| C-21 | `input` | C-46 | `drawer` |
| C-22 | `radio` | C-47 | `loading` |
| C-23 | `select` | C-48 | `notification` |
| C-24 | `rating` | C-49 | `alert` |
| C-25 | `stepper` | C-50 | `toast` |
| C-26 | `slider` | C-51 | `progress` |

## 禁止

- 禁止把 `specimen.js` 当作页面组件调用。
- 禁止读取 renderer 输出后再用字符串重组 DOM。
- 禁止绕过 `describe().api.props` 猜测参数；未声明参数必须视为错误。
- 禁止页面 CSS 覆盖组件内部尺寸、文字、边框、颜色和状态。
- 禁止绕过 renderer 手写同名原生控件。
