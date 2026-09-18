import { randomUUID } from "node:crypto";
import { COMPONENTS, type ComponentDefinition } from "./catalog.js";
import { assertCardStructure } from "./card-variants.js";

export type LayoutKind = "column" | "row" | "columns";
export type LayoutNode = { id: string; kind: "layout"; layout: LayoutKind; gap: "small" | "medium" | "large"; columns?: number; children: PageNode[] };
export type ComponentNode = { id: string; kind: "component"; componentId: string; props: Record<string, unknown> };
export type PageNode = LayoutNode | ComponentNode;
export type ComponentLibraryBinding = { libraryId: string; snapshotId: string; sourceVersion: string | null; digest: string; adapterVersion: string };
export type PageSchema = { schemaVersion: 1; pageId: string; name: string; revision: number; componentLibraryVersion: string; componentLibrary?: ComponentLibraryBinding; updatedAt: string; root: LayoutNode };

export type Operation =
  | { type: "add"; parentId: string; index?: number; node: { kind: "layout"; layout: LayoutKind; gap?: LayoutNode["gap"]; columns?: number } | { kind: "component"; componentId: string; props?: Record<string, unknown> } }
  | { type: "updateProps"; nodeId: string; props: Record<string, unknown> }
  | { type: "updateLayout"; nodeId: string; layout?: LayoutKind; gap?: LayoutNode["gap"]; columns?: number }
  | { type: "remove"; nodeId: string }
  | { type: "move"; nodeId: string; parentId: string; index?: number }
  | { type: "duplicate"; nodeId: string; parentId?: string; index?: number }
  | { type: "rename"; name: string };

export class DomainError extends Error {
  constructor(public code: string, message: string, public details?: unknown) { super(message); }
}

export function newId(prefix: string) { return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 12)}`; }

export function createPage(name = "未命名页面", componentLibrary?: ComponentLibraryBinding): PageSchema {
  return { schemaVersion: 1, pageId: newId("page"), name: cleanName(name), revision: 0, componentLibraryVersion: componentLibrary?.sourceVersion || componentLibrary?.digest || "b2b-3.4.7", ...(componentLibrary ? { componentLibrary: clone(componentLibrary) } : {}), updatedAt: new Date().toISOString(), root: { id: newId("layout"), kind: "layout", layout: "column", gap: "medium", children: [] } };
}

function cleanName(name: unknown) {
  if (typeof name !== "string" || !name.trim() || name.length > 80) throw new DomainError("INVALID_PAGE_NAME", "页面名称必须是 1–80 个字符。");
  return name.trim();
}

function clone<T>(value: T): T { return structuredClone(value); }
function assertExactKeys(value: object, allowed: readonly string[], label: string) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new DomainError("UNKNOWN_FIELD", `${label} 包含未知字段：${unknown.join(", ")}。`);
}

type Location = { node: PageNode; parent: LayoutNode | null; index: number };
export function findNode(root: LayoutNode, id: string): Location | null {
  if (root.id === id) return { node: root, parent: null, index: 0 };
  const visit = (parent: LayoutNode): Location | null => {
    for (let index = 0; index < parent.children.length; index += 1) {
      const node = parent.children[index];
      if (node.id === id) return { node, parent, index };
      if (node.kind === "layout") { const found = visit(node); if (found) return found; }
    }
    return null;
  };
  return visit(root);
}

function assertLayout(root: LayoutNode, id: string) {
  const found = findNode(root, id);
  if (!found) throw new DomainError("NODE_NOT_FOUND", `找不到节点 ${id}。`);
  if (found.node.kind !== "layout") throw new DomainError("INVALID_PARENT", "组件不能接收页面子节点。");
  return found.node;
}

function validateProp(componentId: string, name: string, value: unknown, catalog = COMPONENTS) {
  const definition = catalog[componentId];
  const rule = definition?.props[name];
  if (!definition) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${componentId} 尚未适配。`);
  if (!rule) throw new DomainError("UNKNOWN_PROP", `${componentId} 未公开属性 ${name}。`);
  if (rule.values && !rule.values.includes(value as string)) throw new DomainError("INVALID_PROP", `${componentId}.${name} 不是合法选项。`, { allowed: rule.values });
  const types = rule.type.split("|");
  const valid = types.some((type) => type === "enum" ? true : type === "null" ? value === null : type === "array" ? Array.isArray(value) : type === "object" ? !!value && typeof value === "object" && !Array.isArray(value) : type === "number" ? typeof value === "number" && Number.isFinite(value) : typeof value === type);
  if (!valid) throw new DomainError("INVALID_PROP", `${componentId}.${name} 类型不合法。`);
  const maxLength = componentId === "C-34" && name === "coverImage" && typeof value === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(value) ? 1_400_000 : 10_000;
  if (typeof value === "string" && value.length > maxLength) throw new DomainError("VALUE_TOO_LARGE", `${componentId}.${name} 超过长度限制。`);
  if (typeof value === "string" && /^(?:javascript:|file:)/i.test(value.trim())) throw new DomainError("UNSAFE_VALUE", `${componentId}.${name} 包含不安全协议。`);
  if (/image|href|url/i.test(name) && typeof value === "string" && (pathLikeAbsolute(value) || value.split(/[\\/]/).includes(".."))) throw new DomainError("UNSAFE_RESOURCE_PATH", `${componentId}.${name} 不能引用绝对路径或上级目录。`);
}

function validateEditableValue(componentId: string, name: string, value: unknown) {
  const rule = COMPONENTS[componentId]?.props[name];
  if (rule?.editorValues && !rule.editorValues.includes(value as never)) {
    throw new DomainError("UNSUPPORTED_EDITOR_VALUE", `${componentId}.${name} 的 ${String(value)} 尚未适配页面搭建器。`, { supported: rule.editorValues });
  }
}

function invalidCombination(componentId: string, message: string) {
  throw new DomainError("INVALID_PROP_COMBINATION", `${componentId} 属性组合无效：${message}`);
}

function validateComponentCombination(componentId: string, props: Record<string, unknown>) {
  if (componentId === "C-42") {
    const avatar = props.avatar;
    if (props.checkable && props.closable) invalidCombination(componentId, "可选中与可关闭不能同时开启。");
    if (!props.checkable && props.checked) invalidCombination(componentId, "选中状态要求先开启可选中。");
    if (props.type === "avatar" && (typeof avatar !== "string" || !avatar.trim())) invalidCombination(componentId, "头像类型需要头像文字。");
    if (props.type !== "avatar" && avatar !== null) invalidCombination(componentId, "头像文字只属于头像类型。");
    if (props.type === "avatar" && props.icon !== null) invalidCombination(componentId, "头像类型不能同时设置前置图标。");
  }

  if (componentId === "C-21" && props.variant === "基础输入框") {
    if (typeof props.value !== "string") invalidCombination(componentId, "基础输入框的值必须是文本。");
    if (props.prefixIcon !== null || props.suffixIcon !== null || props.infoTooltip !== null || props.prefixAddon !== null || props.suffixAddon !== null || props.composite !== null || props.tag !== null) invalidCombination(componentId, "基础输入框不能保留其他输入框变体的配置。");
    if (props.password && (props.borderless || props.counter || props.clearable || props.state === "disabled" || props.state === "readonly")) invalidCombination(componentId, "密码输入不能与当前行为或状态组合。");
  }

  if (componentId === "C-21") {
    if (typeof props.label !== "string" || !props.label.trim()) invalidCombination(componentId, "输入标签不能为空。");
    if (props.variant !== "数字输入框" && typeof props.value !== "string") invalidCombination(componentId, "当前变体的内容必须是文本。");
    for (const name of ["prefixAddon", "suffixAddon"]) {
      const addon = props[name] as { id?: unknown; type?: unknown; text?: unknown } | null;
      if (addon?.type === "text" && (typeof addon.id !== "string" || !addon.id.trim() || typeof addon.text !== "string" || !addon.text.trim())) invalidCombination(componentId, "前后缀文字及标识不能为空。");
    }
    const neutral = () => { if (props.clearable || props.borderless || props.password || props.prefixIcon != null || props.suffixIcon != null || props.infoTooltip != null || props.prefixAddon != null || props.suffixAddon != null || props.tag != null || props.composite != null) invalidCombination(componentId, "当前变体不能保留其他输入框的配套配置。"); };
    if (props.variant === "数字输入框") { neutral(); if (props.counter || !(props.value === "" || typeof props.value === "number" && Number.isFinite(props.value) && props.value >= Number(props.min) && props.value <= Number(props.max))) invalidCombination(componentId, "数字输入需要范围内数值。"); }
    if (props.variant === "长文本输入框") { neutral(); if (typeof props.value !== "string" || props.size !== "medium" || props.maxLength !== 240) invalidCombination(componentId, "长文本固定 medium 尺寸及 240 字上限。"); }
    if (props.variant === "带图标输入框" && (!(props.prefixIcon || props.suffixIcon || props.infoTooltip) || props.counter || props.borderless || props.password || props.prefixAddon != null || props.suffixAddon != null || props.tag != null || props.composite != null)) invalidCombination(componentId, "图标输入需要图标或说明，且不能混用其他变体配置。");
    if (["带属性输入框", "组合输入框"].includes(String(props.variant))) {
      if (props.clearable || props.counter || props.borderless || props.password || props.prefixIcon != null || props.suffixIcon != null || props.infoTooltip != null) invalidCombination(componentId, "属性/组合输入不能混用基础输入行为。");
      if (props.variant === "带属性输入框" && (Boolean(props.prefixAddon || props.suffixAddon) === Boolean(props.tag) || props.composite != null)) invalidCombination(componentId, "属性输入需要前后缀或行内标签之一。");
      if (props.variant === "组合输入框") {
        const c = props.composite as { appearance?: string; select?: unknown; segments?: Array<{ id?: string; label?: string; value?: string; placeholder?: string }> } | null;
        if (props.value !== "" || props.prefixAddon != null || props.suffixAddon != null || props.tag != null || !c || !["filled", "borderless"].includes(c.appearance || "") || !Array.isArray(c.segments) || c.segments.length !== (c.select ? 1 : 2) || c.segments.some(s => !s.id || !s.label || typeof s.value !== "string" || typeof s.placeholder !== "string")) invalidCombination(componentId, "组合输入需要完整分段内容。");
      }
    }
  }

  if (componentId === "C-23") {
    const items = props.items as unknown[];
    const selected = props.selected as unknown[];
    const optionLabels = items.filter((item) => !(item && typeof item === "object" && "group" in item)).map((item) => typeof item === "string" ? item : (item as { label?: unknown }).label);
    if (!props.multiple && selected.length > 1) invalidCombination(componentId, "单选模式最多只能选择一个值。");
    if (selected.some((value) => typeof value !== "string" || !optionLabels.includes(value))) invalidCombination(componentId, "已选值必须来自候选项。");
    if ((props.state === "disabled" || props.state === "readonly") && props.open) invalidCombination(componentId, "禁用或只读状态不能展开。");
    if ((props.state === "loading" || props.state === "no-result") && !props.searchable) invalidCombination(componentId, "加载与无结果状态要求可搜索模式。");
    if (props.variant === "基础单选" && props.multiple) invalidCombination(componentId, "基础单选不能开启多选。");
  }

  if (componentId === "C-34") {
    try { assertCardStructure(props); } catch (error) { invalidCombination(componentId, (error as Error).message); }
    const items = props.items as unknown[]; const tabs = props.tabs as unknown[]; const actions = props.actions as unknown[];
    const itemVariant = ["external-grid", "content-grid", "nested"].includes(props.variant as string);
    if (itemVariant ? items.length === 0 : items.length !== 0) invalidCombination(componentId, "网格/嵌套变体与 items 配置不匹配。");
    if ((props.variant === "tabs") !== (tabs.length > 0)) invalidCombination(componentId, "Tabs 变体与 tabs 配置不匹配。");
    if ((props.variant === "actions") !== (actions.length > 0)) invalidCombination(componentId, "Actions 变体与 actions 配置不匹配。");
    const needsAvatar = ["compact", "meta", "actions"].includes(props.variant as string);
    if (needsAvatar !== (props.avatar !== null)) invalidCombination(componentId, "当前卡片变体的头像配置不完整。");
    if (["meta", "actions"].includes(props.variant as string) && props.coverImage === null) invalidCombination(componentId, "当前卡片变体需要封面图片。");
    if (props.variant === "interactive" && (props.appearance !== "bordered" || !props.hoverable || props.loading || props.extraActionLabel || props.footerActionLabel)) invalidCombination(componentId, "交互卡片需要 bordered/hoverable，且不能处于加载或带嵌套操作。");
    if (props.variant !== "interactive" && props.selected) invalidCombination(componentId, "selected 只属于交互卡片。");
  }
}

function pathLikeAbsolute(value: string) { return value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value); }

function makeNode(input: Extract<Operation, { type: "add" }>["node"], catalog = COMPONENTS): PageNode {
  if (input.kind === "layout") {
    const columns = input.layout === "columns" ? Math.max(2, Math.min(4, input.columns ?? 2)) : undefined;
    return { id: newId("layout"), kind: "layout", layout: input.layout, gap: input.gap ?? "medium", ...(columns ? { columns } : {}), children: [] };
  }
  const definition = catalog[input.componentId];
  if (!definition) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${input.componentId} 尚未适配。`);
  const variant = String(input.props?.variant ?? definition.defaults.variant ?? "");
  const props = { ...clone(definition.defaults), ...clone(definition.variantDefaults?.[variant] ?? {}), ...(input.props ?? {}) };
  for (const [name, value] of Object.entries(props)) { validateProp(input.componentId, name, value, catalog); if (catalog === COMPONENTS) validateEditableValue(input.componentId, name, value); }
  if (catalog === COMPONENTS) validateComponentCombination(input.componentId, props);
  return { id: newId("node"), kind: "component", componentId: input.componentId, props };
}

function insert(parent: LayoutNode, node: PageNode, index = parent.children.length) {
  if (!Number.isInteger(index) || index < 0 || index > parent.children.length) throw new DomainError("INVALID_INDEX", "插入位置无效。");
  parent.children.splice(index, 0, node);
}

function remapIds(node: PageNode): PageNode {
  const copy = clone(node);
  const visit = (value: PageNode) => { value.id = newId(value.kind === "layout" ? "layout" : "node"); if (value.kind === "layout") value.children.forEach(visit); };
  visit(copy);
  return copy;
}

function contains(node: PageNode, id: string): boolean { return node.id === id || (node.kind === "layout" && node.children.some((child) => contains(child, id))); }

export function applyOperations(current: PageSchema, expectedRevision: number, operations: Operation[], catalog = COMPONENTS): PageSchema {
  if (expectedRevision !== current.revision) throw new DomainError("REVISION_CONFLICT", `页面已更新到 revision ${current.revision}。`, { currentRevision: current.revision });
  if (!Array.isArray(operations) || operations.length === 0 || operations.length > 100) throw new DomainError("INVALID_BATCH", "一次操作必须包含 1–100 条命令。");
  const next = clone(current);
  for (const operation of operations) {
    if (!operation || typeof operation !== "object" || typeof operation.type !== "string") throw new DomainError("INVALID_OPERATION", "操作格式无效。");
    if (operation.type === "rename") { next.name = cleanName(operation.name); continue; }
    if (operation.type === "add") { insert(assertLayout(next.root, operation.parentId), makeNode(operation.node, catalog), operation.index); continue; }
    const found = findNode(next.root, operation.nodeId);
    if (!found) throw new DomainError("NODE_NOT_FOUND", `找不到节点 ${operation.nodeId}。`);
    if (operation.type === "updateProps") {
      if (found.node.kind !== "component") throw new DomainError("INVALID_NODE_KIND", "布局节点没有组件属性。");
      for (const [name, value] of Object.entries(operation.props)) validateProp(found.node.componentId, name, value, catalog);
      if (catalog === COMPONENTS) for (const [name, value] of Object.entries(operation.props)) validateEditableValue(found.node.componentId, name, value);
      const nextProps = { ...found.node.props, ...clone(operation.props) };
      if (catalog === COMPONENTS) validateComponentCombination(found.node.componentId, nextProps);
      found.node.props = nextProps;
    } else if (operation.type === "updateLayout") {
      if (found.node.kind !== "layout") throw new DomainError("INVALID_NODE_KIND", "组件节点没有布局属性。");
      if (operation.layout) { if (!["column", "row", "columns"].includes(operation.layout)) throw new DomainError("INVALID_LAYOUT", "布局类型无效。"); found.node.layout = operation.layout; }
      if (operation.gap) { if (!["small", "medium", "large"].includes(operation.gap)) throw new DomainError("INVALID_GAP", "布局间距无效。"); found.node.gap = operation.gap; }
      if (operation.columns !== undefined) {
        if (!Number.isInteger(operation.columns) || operation.columns < 2 || operation.columns > 4) throw new DomainError("INVALID_COLUMNS", "分栏数必须是 2–4。");
        found.node.columns = operation.columns;
      }
    } else if (operation.type === "remove") {
      if (!found.parent) throw new DomainError("ROOT_IMMUTABLE", "页面根布局不能删除。");
      found.parent.children.splice(found.index, 1);
    } else if (operation.type === "move") {
      if (!found.parent) throw new DomainError("ROOT_IMMUTABLE", "页面根布局不能移动。");
      const parent = assertLayout(next.root, operation.parentId);
      if (contains(found.node, parent.id)) throw new DomainError("CYCLE", "不能把节点移动到自己的子树中。");
      found.parent.children.splice(found.index, 1);
      const targetIndex = operation.index === undefined ? parent.children.length : Math.min(operation.index, parent.children.length);
      insert(parent, found.node, targetIndex);
    } else if (operation.type === "duplicate") {
      const parent = operation.parentId ? assertLayout(next.root, operation.parentId) : found.parent;
      if (!parent) throw new DomainError("ROOT_IMMUTABLE", "页面根布局不能复制。");
      insert(parent, remapIds(found.node), operation.index ?? (found.parent === parent ? found.index + 1 : parent.children.length));
    } else {
      throw new DomainError("UNKNOWN_OPERATION", `不支持操作 ${(operation as { type: string }).type}。`);
    }
  }
  next.revision = current.revision + 1;
  next.updatedAt = new Date().toISOString();
  validatePage(next, catalog);
  return next;
}

export function validatePage(page: PageSchema, catalog: Record<string, ComponentDefinition> | null = COMPONENTS) {
  if (!page || page.schemaVersion !== 1 || typeof page.pageId !== "string" || page.pageId.length > 120) throw new DomainError("INVALID_PAGE", "页面描述版本或标识无效。");
  assertExactKeys(page, ["schemaVersion", "pageId", "name", "revision", "componentLibraryVersion", "componentLibrary", "updatedAt", "root"], "页面");
  cleanName(page.name);
  if (typeof page.componentLibraryVersion !== "string" || !page.componentLibraryVersion) throw new DomainError("INVALID_PAGE", "页面缺少组件库版本。");
  if (page.componentLibrary) {
    assertExactKeys(page.componentLibrary, ["libraryId", "snapshotId", "sourceVersion", "digest", "adapterVersion"], "组件库绑定");
    if (page.componentLibrary.libraryId !== "b2b" || !/^b2b-[a-f0-9]{16}$/.test(page.componentLibrary.snapshotId) || !/^[a-f0-9]{64}$/.test(page.componentLibrary.digest) || typeof page.componentLibrary.adapterVersion !== "string" || (page.componentLibrary.sourceVersion !== null && typeof page.componentLibrary.sourceVersion !== "string")) throw new DomainError("INVALID_PAGE", "页面组件库绑定无效。");
  }
  if (!page.root || page.root.kind !== "layout") throw new DomainError("INVALID_PAGE", "页面必须包含根布局。");
  const ids = new Set<string>(); let count = 0;
  const visit = (node: PageNode) => {
    count += 1; if (count > 1000) throw new DomainError("PAGE_TOO_LARGE", "页面节点超过 1000 个。");
    if (!node.id || ids.has(node.id)) throw new DomainError("DUPLICATE_NODE_ID", `节点标识重复：${node.id}`); ids.add(node.id);
    if (node.kind === "layout") {
      assertExactKeys(node, ["id", "kind", "layout", "gap", "columns", "children"], `布局 ${node.id}`);
      if (!["column", "row", "columns"].includes(node.layout) || !["small", "medium", "large"].includes(node.gap) || !Array.isArray(node.children)) throw new DomainError("INVALID_LAYOUT", `布局 ${node.id} 无效。`);
      if (node.layout === "columns" && (!Number.isInteger(node.columns) || (node.columns ?? 0) < 2 || (node.columns ?? 0) > 4)) throw new DomainError("INVALID_COLUMNS", `布局 ${node.id} 的列数无效。`);
      node.children.forEach(visit);
    }
    else { assertExactKeys(node, ["id", "kind", "componentId", "props"], `组件节点 ${node.id}`); if (catalog && !catalog[node.componentId]) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${node.componentId} 尚未适配。`); if (!node.props || typeof node.props !== "object" || Array.isArray(node.props)) throw new DomainError("INVALID_PROPS", "组件属性无效。"); if (catalog) for (const [key, value] of Object.entries(node.props)) validateProp(node.componentId, key, value, catalog); }
  };
  visit(page.root); return page;
}
