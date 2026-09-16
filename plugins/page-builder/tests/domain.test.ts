import test from "node:test";
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
