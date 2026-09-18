import test from "node:test";
import { inputVariantPatch } from "../src/input-variants.js";
import { cardVariantPatch } from "../src/card-variants.js";
import assert from "node:assert/strict";
import { applyOperations, createPage, DomainError, findNode } from "../src/domain.js";

test("one atomic batch adds independent production component nodes", () => {
  const page = createPage("测试");
  const next = applyOperations(page, 0, [
    { type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-02", props: { label: "保存" } } },
    { type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-02", props: { label: "取消" } } }
  ]);
  assert.equal(next.revision, 1); assert.equal(next.root.children.length, 2);
  assert.notEqual(next.root.children[0].id, next.root.children[1].id);
  assert.equal(next.root.children[0].kind === "component" && next.root.children[0].props.label, "保存");
  assert.equal(next.root.children[1].kind === "component" && next.root.children[1].props.label, "取消");
});

test("invalid tail operation leaves original batch untouched", () => {
  const page = createPage("测试");
  assert.throws(() => applyOperations(page, 0, [
    { type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-02", props: { label: "不会提交" } } },
    { type: "add", parentId: "missing", node: { kind: "component", componentId: "C-02" } }
  ]), (error: unknown) => error instanceof DomainError && error.code === "NODE_NOT_FOUND");
  assert.equal(page.revision, 0); assert.equal(page.root.children.length, 0);
});

test("stale revisions and undeclared props are rejected", () => {
  const page = createPage("测试");
  assert.throws(() => applyOperations(page, 9, [{ type: "rename", name: "旧写入" }]), (error: unknown) => error instanceof DomainError && error.code === "REVISION_CONFLICT");
  assert.throws(() => applyOperations(page, 0, [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-02", props: { className: "fake" } } }]), (error: unknown) => error instanceof DomainError && error.code === "UNKNOWN_PROP");
});

test("unsafe resource paths and malformed layout values are rejected", () => {
  const page = createPage("测试");
  assert.throws(() => applyOperations(page, 0, [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-34", props: { coverImage: "../../secret.png" } } }]), (error: unknown) => error instanceof DomainError && error.code === "UNSAFE_RESOURCE_PATH");
  assert.throws(() => applyOperations(page, 0, [{ type: "updateLayout", nodeId: page.root.id, gap: "huge" as never }]), (error: unknown) => error instanceof DomainError && error.code === "INVALID_GAP");
  assert.throws(() => applyOperations({ ...page, injected: true } as never, 0, [{ type: "rename", name: "未知字段" }]), (error: unknown) => error instanceof DomainError && error.code === "UNKNOWN_FIELD");
});

test("layout move rejects cycles", () => {
  const page = createPage("测试");
  const withParent = applyOperations(page, 0, [{ type: "add", parentId: page.root.id, node: { kind: "layout", layout: "column" } }]);
  const parent = withParent.root.children[0]; assert.equal(parent.kind, "layout");
  const withChild = applyOperations(withParent, 1, [{ type: "add", parentId: parent.id, node: { kind: "layout", layout: "row" } }]);
  const child = findNode(withChild.root, parent.id)?.node; assert.equal(child?.kind, "layout"); const nested = child?.kind === "layout" ? child.children[0] : null; assert.ok(nested);
  assert.throws(() => applyOperations(withChild, 2, [{ type: "move", nodeId: parent.id, parentId: nested.id }]), (error: unknown) => error instanceof DomainError && error.code === "CYCLE");
});

test("tag avatar transitions require an atomic compatible prop set", () => {
  const page = createPage("标签变体");
  const added = applyOperations(page, 0, [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-42", props: { text: "客户" } } }]);
  const node = added.root.children[0]; assert.equal(node.kind, "component");
  assert.throws(() => applyOperations(added, 1, [{ type: "updateProps", nodeId: node.id, props: { type: "avatar" } }]), (error: unknown) => error instanceof DomainError && error.code === "INVALID_PROP_COMBINATION");
  const avatar = applyOperations(added, 1, [{ type: "updateProps", nodeId: node.id, props: { type: "avatar", avatar: "客", icon: null } }]);
  assert.equal(avatar.root.children[0].kind === "component" && avatar.root.children[0].props.avatar, "客");
  assert.throws(() => applyOperations(avatar, 2, [{ type: "updateProps", nodeId: node.id, props: { checkable: true, closable: true } }]), (error: unknown) => error instanceof DomainError && error.code === "INVALID_PROP_COMBINATION");
  const regular = applyOperations(avatar, 2, [{ type: "updateProps", nodeId: node.id, props: { type: "status", avatar: null } }]);
  assert.equal(regular.revision, 3);
});

test("editor rejects known but unsupported public variants before rendering", () => {
  const page = createPage("受控变体");
  assert.throws(() => applyOperations(page, 0, [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-23", props: { variant: "复杂内容" } } }]), (error: unknown) => error instanceof DomainError && error.code === "UNSUPPORTED_EDITOR_VALUE");
});

test("six C-21 variants transition atomically and invalid conversions preserve content", () => {
  let page = createPage("输入框变体");
  page = applyOperations(page, 0, [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-21" } }]);
  const id = page.root.children[0].id;
  for (const variant of ["数字输入框", "带图标输入框", "带属性输入框", "组合输入框", "长文本输入框", "基础输入框"]) {
    const node = findNode(page.root, id)!.node; assert.equal(node.kind, "component");
    if (node.kind !== "component") throw new Error("expected input");
    const before = page.revision;
    page = applyOperations(page, before, [{ type: "updateProps", nodeId: id, props: inputVariantPatch(node.props, variant) }]);
    assert.equal(page.revision, before + 1);
    const next = findNode(page.root, id)!.node;
    assert.equal(next.kind === "component" && next.props.variant, variant);
    if (variant === "长文本输入框") assert.equal(next.kind === "component" && next.props.auto, false);
  }
  assert.throws(() => inputVariantPatch({ value: "客户资料", min: 0, max: 10 }, "数字输入框"), /不能转换/);
  const before = JSON.stringify(page);
  assert.throws(() => applyOperations(page, page.revision, [{ type: "updateProps", nodeId: id, props: { variant: "长文本输入框" } }]), /属性组合/);
  assert.equal(JSON.stringify(page), before);
  assert.throws(() => applyOperations(page, page.revision, [{ type: "updateProps", nodeId: id, props: { ...inputVariantPatch({}, "带属性输入框"), prefixAddon: { id: "prefix", type: "text", text: "" } } }]), /属性组合/);
  assert.equal(JSON.stringify(page), before);
});

test("all card variants have atomic companions and reject malformed nested data", () => {
  let page = createPage("卡片变体");
  page = applyOperations(page, 0, [{ type: "add", parentId: page.root.id, node: { kind: "component", componentId: "C-34" } }]);
  const node = page.root.children[0]; assert.equal(node.kind, "component");
  if (node.kind !== "component") throw new Error("expected card");
  assert.throws(() => cardVariantPatch(node.props, "meta"), /媒体图片地址/);
  for (const variant of ["compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive", "basic"]) {
    const current = page.root.children[0]; if (current.kind !== "component") throw new Error("expected card");
    page = applyOperations(page, page.revision, [{ type: "updateProps", nodeId: node.id, props: { coverImage: "https://example.com/test.png", ...cardVariantPatch({ ...current.props, coverImage: "https://example.com/test.png" }, variant) } }]);
  }
  const before = JSON.stringify(page);
  for (const props of [{ activeTabId: "missing" }, { columns: 5 }, { variant: "nested", items: [{ id: "a", title: "缺正文" }] }, { variant: "compact", avatar: { text: "卡" } }]) {
    assert.throws(() => applyOperations(page, page.revision, [{ type: "updateProps", nodeId: node.id, props }]), /属性组合/);
    assert.equal(JSON.stringify(page), before);
  }
});
