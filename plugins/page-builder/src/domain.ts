import { randomUUID } from "node:crypto";
import { COMPONENTS } from "./catalog.js";

export type LayoutKind = "column" | "row" | "columns";
export type LayoutNode = { id: string; kind: "layout"; layout: LayoutKind; gap: "small" | "medium" | "large"; columns?: number; children: PageNode[] };
export type ComponentNode = { id: string; kind: "component"; componentId: string; props: Record<string, unknown> };
export type PageNode = LayoutNode | ComponentNode;
export type PageSchema = { schemaVersion: 1; pageId: string; name: string; revision: number; componentLibraryVersion: string; updatedAt: string; root: LayoutNode };

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

export function createPage(name = "未命名页面"): PageSchema {
  return { schemaVersion: 1, pageId: newId("page"), name: cleanName(name), revision: 0, componentLibraryVersion: "b2b-3.4.7", updatedAt: new Date().toISOString(), root: { id: newId("layout"), kind: "layout", layout: "column", gap: "medium", children: [] } };
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

function validateProp(componentId: string, name: string, value: unknown) {
  const definition = COMPONENTS[componentId];
  const rule = definition?.props[name];
  if (!definition) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${componentId} 尚未适配。`);
  if (!rule) throw new DomainError("UNKNOWN_PROP", `${componentId} 未公开属性 ${name}。`);
  if (rule.values && !rule.values.includes(value as string)) throw new DomainError("INVALID_PROP", `${componentId}.${name} 不是合法选项。`, { allowed: rule.values });
  const types = rule.type.split("|");
  const valid = types.some((type) => type === "null" ? value === null : type === "array" ? Array.isArray(value) : type === "object" ? !!value && typeof value === "object" && !Array.isArray(value) : type === "number" ? typeof value === "number" && Number.isFinite(value) : typeof value === type);
  if (!valid) throw new DomainError("INVALID_PROP", `${componentId}.${name} 类型不合法。`);
  if (typeof value === "string" && value.length > 10_000) throw new DomainError("VALUE_TOO_LARGE", `${componentId}.${name} 超过长度限制。`);
  if (typeof value === "string" && /^(?:javascript:|file:)/i.test(value.trim())) throw new DomainError("UNSAFE_VALUE", `${componentId}.${name} 包含不安全协议。`);
  if (/image|href|url/i.test(name) && typeof value === "string" && (pathLikeAbsolute(value) || value.split(/[\\/]/).includes(".."))) throw new DomainError("UNSAFE_RESOURCE_PATH", `${componentId}.${name} 不能引用绝对路径或上级目录。`);
}

function pathLikeAbsolute(value: string) { return value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value); }

function makeNode(input: Extract<Operation, { type: "add" }>["node"]): PageNode {
  if (input.kind === "layout") {
    const columns = input.layout === "columns" ? Math.max(2, Math.min(4, input.columns ?? 2)) : undefined;
    return { id: newId("layout"), kind: "layout", layout: input.layout, gap: input.gap ?? "medium", ...(columns ? { columns } : {}), children: [] };
  }
  const definition = COMPONENTS[input.componentId];
  if (!definition) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${input.componentId} 尚未适配。`);
  const props = { ...clone(definition.defaults), ...(input.props ?? {}) };
  for (const [name, value] of Object.entries(props)) validateProp(input.componentId, name, value);
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

export function applyOperations(current: PageSchema, expectedRevision: number, operations: Operation[]): PageSchema {
  if (expectedRevision !== current.revision) throw new DomainError("REVISION_CONFLICT", `页面已更新到 revision ${current.revision}。`, { currentRevision: current.revision });
  if (!Array.isArray(operations) || operations.length === 0 || operations.length > 100) throw new DomainError("INVALID_BATCH", "一次操作必须包含 1–100 条命令。");
  const next = clone(current);
  for (const operation of operations) {
    if (!operation || typeof operation !== "object" || typeof operation.type !== "string") throw new DomainError("INVALID_OPERATION", "操作格式无效。");
    if (operation.type === "rename") { next.name = cleanName(operation.name); continue; }
    if (operation.type === "add") { insert(assertLayout(next.root, operation.parentId), makeNode(operation.node), operation.index); continue; }
    const found = findNode(next.root, operation.nodeId);
    if (!found) throw new DomainError("NODE_NOT_FOUND", `找不到节点 ${operation.nodeId}。`);
    if (operation.type === "updateProps") {
      if (found.node.kind !== "component") throw new DomainError("INVALID_NODE_KIND", "布局节点没有组件属性。");
      for (const [name, value] of Object.entries(operation.props)) validateProp(found.node.componentId, name, value);
      found.node.props = { ...found.node.props, ...clone(operation.props) };
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
  validatePage(next);
  return next;
}

export function validatePage(page: PageSchema) {
  if (!page || page.schemaVersion !== 1 || typeof page.pageId !== "string" || page.pageId.length > 120) throw new DomainError("INVALID_PAGE", "页面描述版本或标识无效。");
  assertExactKeys(page, ["schemaVersion", "pageId", "name", "revision", "componentLibraryVersion", "updatedAt", "root"], "页面");
  cleanName(page.name);
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
    else { assertExactKeys(node, ["id", "kind", "componentId", "props"], `组件节点 ${node.id}`); if (!COMPONENTS[node.componentId]) throw new DomainError("UNSUPPORTED_COMPONENT", `组件 ${node.componentId} 尚未适配。`); for (const [key, value] of Object.entries(node.props)) validateProp(node.componentId, key, value); }
  };
  visit(page.root); return page;
}
