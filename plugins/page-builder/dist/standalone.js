import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// src/standalone.ts
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path8 from "node:path";
import { fileURLToPath } from "node:url";
import { readFile as readFile8 } from "node:fs/promises";

// src/domain.ts
import { randomUUID } from "node:crypto";

// src/catalog.ts
var COMPONENTS = {
  "C-02": {
    id: "C-02",
    name: "basicButton",
    label: "\u57FA\u7840\u6309\u94AE",
    description: "\u89E6\u53D1\u7ACB\u5373\u52A8\u4F5C\u5E76\u8868\u8FBE\u64CD\u4F5C\u4F18\u5148\u7EA7\u3002",
    rendererName: "basicButton",
    editable: ["label", "variant", "size", "disabled", "loading", "width"],
    props: {
      label: { type: "string", default: "\u6309\u94AE" },
      variant: { type: "string", values: ["primary", "danger", "secondary-blue", "secondary-danger", "secondary-gray"], default: "secondary-gray" },
      size: { type: "string", values: ["mini", "small", "medium", "large", "xlarge"], default: "medium" },
      icon: { type: "string|null", default: null },
      disabled: { type: "boolean", default: false },
      loading: { type: "boolean", default: false },
      width: { type: "string", values: ["default", "long"], default: "default" }
    },
    defaults: { label: "\u6309\u94AE", variant: "secondary-gray", size: "medium", icon: null, disabled: false, loading: false, width: "default" }
  },
  "C-21": {
    id: "C-21",
    name: "input",
    label: "\u8F93\u5165\u6846",
    description: "\u5F55\u5165\u5355\u884C\u6216\u591A\u884C\u6587\u672C\u3002",
    rendererName: "input",
    editable: ["label", "value", "placeholder", "variant", "size", "state", "clearable"],
    props: {
      variant: { type: "string", values: ["\u57FA\u7840\u8F93\u5165\u6846", "\u6570\u5B57\u8F93\u5165\u6846", "\u5E26\u56FE\u6807\u8F93\u5165\u6846", "\u5E26\u5C5E\u6027\u8F93\u5165\u6846", "\u7EC4\u5408\u8F93\u5165\u6846", "\u957F\u6587\u672C\u8F93\u5165\u6846"], default: "\u57FA\u7840\u8F93\u5165\u6846" },
      size: { type: "string", values: ["mini", "small", "medium", "large", "xlarge"], default: "medium" },
      state: { type: "string", values: ["default", "disabled", "readonly", "error"], default: "default" },
      label: { type: "string", required: true, default: "\u8F93\u5165\u5185\u5BB9" },
      value: { type: "string|number", default: "" },
      placeholder: { type: "string", default: "\u8BF7\u8F93\u5165" },
      clearable: { type: "boolean", default: false },
      counter: { type: "boolean", default: false },
      maxLength: { type: "number", default: 20 },
      borderless: { type: "boolean", default: false },
      password: { type: "boolean", default: false },
      prefixIcon: { type: "string|null", default: null },
      suffixIcon: { type: "string|null", default: null },
      infoTooltip: { type: "object|null", default: null },
      min: { type: "number", default: 0 },
      max: { type: "number", default: 10 },
      step: { type: "number", default: 1 },
      prefixAddon: { type: "object|null", default: null },
      suffixAddon: { type: "object|null", default: null },
      tag: { type: "string|null", default: null },
      composite: { type: "object|null", default: null },
      auto: { type: "boolean", default: false }
    },
    defaults: { variant: "\u57FA\u7840\u8F93\u5165\u6846", size: "medium", state: "default", label: "\u8F93\u5165\u5185\u5BB9", value: "", placeholder: "\u8BF7\u8F93\u5165", clearable: true, counter: false, maxLength: 20, borderless: false, password: false, prefixIcon: null, suffixIcon: null, infoTooltip: null, min: 0, max: 10, step: 1, prefixAddon: null, suffixAddon: null, tag: null, composite: null, auto: false }
  },
  "C-23": {
    id: "C-23",
    name: "select",
    label: "\u9009\u62E9\u5668",
    description: "\u4ECE\u5019\u9009\u9879\u4E2D\u9009\u62E9\u4E00\u9879\u3002",
    rendererName: "select",
    editable: ["placeholder", "variant", "size", "state", "items", "selected"],
    props: {
      variant: { type: "string", values: ["\u57FA\u7840\u5355\u9009", "\u57FA\u7840\u591A\u9009", "\u81EA\u5B9A\u4E49\u9009\u9879", "\u5206\u7EC4\u9009\u9879", "\u65E0\u8FB9\u6846", "\u4E0B\u5212\u7EBF", "\u53EF\u641C\u7D22", "\u53EF\u521B\u5EFA", "\u590D\u6742\u5185\u5BB9"], editorValues: ["\u57FA\u7840\u5355\u9009", "\u65E0\u8FB9\u6846", "\u4E0B\u5212\u7EBF"], default: "\u57FA\u7840\u5355\u9009" },
      items: { type: "array", default: ["\u9009\u9879\u4E00", "\u9009\u9879\u4E8C", "\u9009\u9879\u4E09"] },
      selected: { type: "array", default: [] },
      multiple: { type: "boolean", default: false },
      open: { type: "boolean", default: false },
      placeholder: { type: "string", default: "\u8BF7\u9009\u62E9" },
      clearable: { type: "boolean", default: true },
      searchable: { type: "boolean", default: false },
      creatable: { type: "boolean", default: false },
      query: { type: "string", default: "" },
      size: { type: "string", values: ["small", "medium", "large"], default: "medium" },
      state: { type: "string", values: ["default", "disabled", "readonly", "error", "loading", "no-result"], editorValues: ["default", "disabled", "readonly", "error"], default: "default" },
      position: { type: "string", values: ["bottom-left", "top", "right", "left"], default: "bottom-left" }
    },
    defaults: { variant: "\u57FA\u7840\u5355\u9009", items: ["\u9009\u9879\u4E00", "\u9009\u9879\u4E8C", "\u9009\u9879\u4E09"], selected: [], multiple: false, open: false, placeholder: "\u8BF7\u9009\u62E9", clearable: true, searchable: false, creatable: false, query: "", size: "medium", state: "default", position: "bottom-left" }
  },
  "C-42": {
    id: "C-42",
    name: "tag",
    label: "\u6807\u7B7E",
    description: "\u5C55\u793A\u72B6\u6001\u3001\u5206\u7C7B\u6216\u7B5B\u9009\u6761\u4EF6\u3002",
    rendererName: "tag",
    editable: ["text", "variant", "type", "avatar", "size", "color", "closable", "checkable", "checked"],
    props: {
      variant: { type: "string", values: ["status", "category", "filter", "closable", "checkable", "loading", "bordered"], default: "status" },
      type: { type: "string", values: ["property", "option", "status", "avatar"], default: "property" },
      size: { type: "string", values: ["extra-small", "small", "medium", "large"], default: "medium" },
      color: { type: "string", values: ["neutral", "blue", "green", "red", "orange", "purple", "cyan", "yellow"], default: "neutral" },
      text: { type: "string", required: true, default: "\u6807\u7B7E" },
      icon: { type: "string|null", default: null },
      avatar: { type: "string|null", default: null },
      closable: { type: "boolean", default: false },
      checkable: { type: "boolean", default: false },
      checked: { type: "boolean", default: false },
      loading: { type: "boolean", default: false },
      bordered: { type: "boolean", default: false },
      solid: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false }
    },
    defaults: { variant: "status", type: "property", size: "medium", color: "blue", text: "\u6807\u7B7E", icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: false, bordered: false, solid: false, disabled: false }
  },
  "C-34": {
    id: "C-34",
    name: "card",
    label: "\u5361\u7247",
    description: "\u627F\u8F7D\u72EC\u7ACB\u5BF9\u8C61\u6216\u6458\u8981\uFF0C\u4E0D\u63A5\u6536\u4EFB\u610F\u5B50\u7EC4\u4EF6\u3002",
    rendererName: "card",
    editable: ["title", "body", "meta", "variant", "appearance", "size", "hoverable", "selected"],
    props: {
      variant: { type: "string", values: ["basic", "compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive"], default: "basic" },
      appearance: { type: "string", values: ["bordered", "borderless"], default: "bordered" },
      size: { type: "string", values: ["default", "small"], default: "default" },
      title: { type: "string", default: "\u5361\u7247\u6807\u9898" },
      body: { type: "string", default: "\u5728\u5C5E\u6027\u9762\u677F\u4E2D\u7F16\u8F91\u5361\u7247\u5185\u5BB9\u3002" },
      meta: { type: "string", default: "" },
      icon: { type: "string", default: "description" },
      hoverable: { type: "boolean", default: false },
      selected: { type: "boolean", default: false },
      loading: { type: "boolean", default: false },
      extraActionLabel: { type: "string|null", default: null },
      footerActionLabel: { type: "string|null", default: null },
      coverImage: { type: "string|null", default: null },
      coverAlt: { type: "string", default: "" },
      avatar: { type: "object|null", default: null },
      items: { type: "array", default: [] },
      columns: { type: "number", default: 3 },
      tabs: { type: "array", default: [] },
      activeTabId: { type: "string|null", default: null },
      actions: { type: "array", default: [] }
    },
    defaults: { variant: "basic", appearance: "bordered", size: "default", title: "\u5361\u7247\u6807\u9898", body: "\u5728\u5C5E\u6027\u9762\u677F\u4E2D\u7F16\u8F91\u5361\u7247\u5185\u5BB9\u3002", meta: "", icon: "description", hoverable: false, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null, coverImage: null, coverAlt: "", avatar: null, items: [], columns: 3, tabs: [], activeTabId: null, actions: [] }
  }
};

// src/card-variants.ts
function assertCardStructure(props) {
  const nonempty = (value) => typeof value === "string" && Boolean(value.trim());
  const require3 = (valid, message) => {
    if (!valid) throw new Error(message);
  };
  const entries = (key, keys, check) => {
    require3(Array.isArray(props[key]), `${key} \u5FC5\u987B\u662F\u5217\u8868\u3002`);
    for (const item of props[key]) require3(item && typeof item === "object" && Object.keys(item).every((k) => keys.includes(k)) && nonempty(item.id) && check(item), `${key} \u7684\u6761\u76EE\u5B57\u6BB5\u4E0D\u5B8C\u6574\u6216\u4E0D\u5408\u6CD5\u3002`);
    require3(new Set(props[key].map((item) => item.id)).size === props[key].length, `${key} \u7684\u6807\u8BC6\u4E0D\u80FD\u91CD\u590D\u3002`);
  };
  const optionalLabel = (value) => value == null || nonempty(value);
  entries("items", ["id", "title", "body", "meta", "appearance", "hoverable", "actionLabel"], (i2) => nonempty(i2.title) && typeof i2.body === "string" && (i2.meta === void 0 || typeof i2.meta === "string") && (i2.appearance === void 0 || ["bordered", "borderless"].includes(i2.appearance)) && (i2.hoverable === void 0 || typeof i2.hoverable === "boolean") && optionalLabel(i2.actionLabel));
  entries("tabs", ["id", "label", "content", "disabled"], (i2) => nonempty(i2.label) && typeof i2.content === "string" && (i2.disabled === void 0 || typeof i2.disabled === "boolean"));
  entries("actions", ["id", "label", "icon"], (i2) => nonempty(i2.label) && nonempty(i2.icon));
  if (props.avatar !== null) {
    const a = props.avatar;
    require3(a && Object.keys(a).every((k) => ["text", "image", "fallback", "label"].includes(k)) && typeof a.text === "string" && (a.image === null || nonempty(a.image)) && nonempty(a.fallback) && nonempty(a.label), "\u5934\u50CF\u5B57\u6BB5\u4E0D\u5B8C\u6574\u3002");
  }
  require3(Number.isInteger(props.columns) && props.columns >= 2 && props.columns <= 4, "\u5361\u7247\u5217\u6570\u5FC5\u987B\u4E3A 2\u20134\u3002");
  require3(nonempty(props.icon) && optionalLabel(props.coverImage) && optionalLabel(props.extraActionLabel) && optionalLabel(props.footerActionLabel), "\u56FE\u7247\u3001\u56FE\u6807\u6216\u64CD\u4F5C\u6587\u5B57\u4E0D\u5408\u6CD5\u3002");
  require3(props.variant === "tabs" ? props.tabs.some((tab) => tab.id === props.activeTabId) : props.activeTabId === null, "\u5F53\u524D\u9875\u7B7E\u5FC5\u987B\u6307\u5411\u5DF2\u6709\u9875\u7B7E\uFF0C\u4E14\u4EC5\u7528\u4E8E tabs \u53D8\u4F53\u3002");
  require3(!props.loading || props.variant !== "interactive" && !props.extraActionLabel && !props.footerActionLabel && !props.actions.length, "\u52A0\u8F7D\u72B6\u6001\u4E0D\u80FD\u540C\u65F6\u5305\u542B\u4EA4\u4E92\u64CD\u4F5C\u3002");
}

// src/domain.ts
var DomainError = class extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
  code;
  details;
};
function newId(prefix) {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}
function createPage(name = "\u672A\u547D\u540D\u9875\u9762", componentLibrary) {
  return { schemaVersion: 1, pageId: newId("page"), name: cleanName(name), revision: 0, componentLibraryVersion: componentLibrary?.sourceVersion || componentLibrary?.digest || "b2b-3.4.7", ...componentLibrary ? { componentLibrary: clone(componentLibrary) } : {}, updatedAt: (/* @__PURE__ */ new Date()).toISOString(), root: { id: newId("layout"), kind: "layout", layout: "column", gap: "medium", children: [] } };
}
function cleanName(name) {
  if (typeof name !== "string" || !name.trim() || name.length > 80) throw new DomainError("INVALID_PAGE_NAME", "\u9875\u9762\u540D\u79F0\u5FC5\u987B\u662F 1\u201380 \u4E2A\u5B57\u7B26\u3002");
  return name.trim();
}
function clone(value) {
  return structuredClone(value);
}
function assertExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new DomainError("UNKNOWN_FIELD", `${label} \u5305\u542B\u672A\u77E5\u5B57\u6BB5\uFF1A${unknown.join(", ")}\u3002`);
}
function findNode(root2, id) {
  if (root2.id === id) return { node: root2, parent: null, index: 0 };
  const visit = (parent) => {
    for (let index = 0; index < parent.children.length; index += 1) {
      const node = parent.children[index];
      if (node.id === id) return { node, parent, index };
      if (node.kind === "layout") {
        const found = visit(node);
        if (found) return found;
      }
    }
    return null;
  };
  return visit(root2);
}
function assertLayout(root2, id) {
  const found = findNode(root2, id);
  if (!found) throw new DomainError("NODE_NOT_FOUND", `\u627E\u4E0D\u5230\u8282\u70B9 ${id}\u3002`);
  if (found.node.kind !== "layout") throw new DomainError("INVALID_PARENT", "\u7EC4\u4EF6\u4E0D\u80FD\u63A5\u6536\u9875\u9762\u5B50\u8282\u70B9\u3002");
  return found.node;
}
function validateProp(componentId, name, value, catalog = COMPONENTS) {
  const definition = catalog[componentId];
  const rule = definition?.props[name];
  if (!definition) throw new DomainError("UNSUPPORTED_COMPONENT", `\u7EC4\u4EF6 ${componentId} \u5C1A\u672A\u9002\u914D\u3002`);
  if (!rule) throw new DomainError("UNKNOWN_PROP", `${componentId} \u672A\u516C\u5F00\u5C5E\u6027 ${name}\u3002`);
  if (rule.values && !rule.values.includes(value)) throw new DomainError("INVALID_PROP", `${componentId}.${name} \u4E0D\u662F\u5408\u6CD5\u9009\u9879\u3002`, { allowed: rule.values });
  const types = rule.type.split("|");
  const valid = types.some((type) => type === "enum" ? true : type === "null" ? value === null : type === "array" ? Array.isArray(value) : type === "object" ? !!value && typeof value === "object" && !Array.isArray(value) : type === "number" ? typeof value === "number" && Number.isFinite(value) : typeof value === type);
  if (!valid) throw new DomainError("INVALID_PROP", `${componentId}.${name} \u7C7B\u578B\u4E0D\u5408\u6CD5\u3002`);
  const maxLength = componentId === "C-34" && name === "coverImage" && typeof value === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(value) ? 14e5 : 1e4;
  if (typeof value === "string" && value.length > maxLength) throw new DomainError("VALUE_TOO_LARGE", `${componentId}.${name} \u8D85\u8FC7\u957F\u5EA6\u9650\u5236\u3002`);
  if (typeof value === "string" && /^(?:javascript:|file:)/i.test(value.trim())) throw new DomainError("UNSAFE_VALUE", `${componentId}.${name} \u5305\u542B\u4E0D\u5B89\u5168\u534F\u8BAE\u3002`);
  if (/image|href|url/i.test(name) && typeof value === "string" && (pathLikeAbsolute(value) || value.split(/[\\/]/).includes(".."))) throw new DomainError("UNSAFE_RESOURCE_PATH", `${componentId}.${name} \u4E0D\u80FD\u5F15\u7528\u7EDD\u5BF9\u8DEF\u5F84\u6216\u4E0A\u7EA7\u76EE\u5F55\u3002`);
}
function validateEditableValue(componentId, name, value) {
  const rule = COMPONENTS[componentId]?.props[name];
  if (rule?.editorValues && !rule.editorValues.includes(value)) {
    throw new DomainError("UNSUPPORTED_EDITOR_VALUE", `${componentId}.${name} \u7684 ${String(value)} \u5C1A\u672A\u9002\u914D\u9875\u9762\u642D\u5EFA\u5668\u3002`, { supported: rule.editorValues });
  }
}
function invalidCombination(componentId, message) {
  throw new DomainError("INVALID_PROP_COMBINATION", `${componentId} \u5C5E\u6027\u7EC4\u5408\u65E0\u6548\uFF1A${message}`);
}
function validateComponentCombination(componentId, props) {
  if (componentId === "C-42") {
    const avatar = props.avatar;
    if (props.checkable && props.closable) invalidCombination(componentId, "\u53EF\u9009\u4E2D\u4E0E\u53EF\u5173\u95ED\u4E0D\u80FD\u540C\u65F6\u5F00\u542F\u3002");
    if (!props.checkable && props.checked) invalidCombination(componentId, "\u9009\u4E2D\u72B6\u6001\u8981\u6C42\u5148\u5F00\u542F\u53EF\u9009\u4E2D\u3002");
    if (props.type === "avatar" && (typeof avatar !== "string" || !avatar.trim())) invalidCombination(componentId, "\u5934\u50CF\u7C7B\u578B\u9700\u8981\u5934\u50CF\u6587\u5B57\u3002");
    if (props.type !== "avatar" && avatar !== null) invalidCombination(componentId, "\u5934\u50CF\u6587\u5B57\u53EA\u5C5E\u4E8E\u5934\u50CF\u7C7B\u578B\u3002");
    if (props.type === "avatar" && props.icon !== null) invalidCombination(componentId, "\u5934\u50CF\u7C7B\u578B\u4E0D\u80FD\u540C\u65F6\u8BBE\u7F6E\u524D\u7F6E\u56FE\u6807\u3002");
  }
  if (componentId === "C-21" && props.variant === "\u57FA\u7840\u8F93\u5165\u6846") {
    if (typeof props.value !== "string") invalidCombination(componentId, "\u57FA\u7840\u8F93\u5165\u6846\u7684\u503C\u5FC5\u987B\u662F\u6587\u672C\u3002");
    if (props.prefixIcon !== null || props.suffixIcon !== null || props.infoTooltip !== null || props.prefixAddon !== null || props.suffixAddon !== null || props.composite !== null || props.tag !== null) invalidCombination(componentId, "\u57FA\u7840\u8F93\u5165\u6846\u4E0D\u80FD\u4FDD\u7559\u5176\u4ED6\u8F93\u5165\u6846\u53D8\u4F53\u7684\u914D\u7F6E\u3002");
    if (props.password && (props.borderless || props.counter || props.clearable || props.state === "disabled" || props.state === "readonly")) invalidCombination(componentId, "\u5BC6\u7801\u8F93\u5165\u4E0D\u80FD\u4E0E\u5F53\u524D\u884C\u4E3A\u6216\u72B6\u6001\u7EC4\u5408\u3002");
  }
  if (componentId === "C-21") {
    if (typeof props.label !== "string" || !props.label.trim()) invalidCombination(componentId, "\u8F93\u5165\u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A\u3002");
    if (props.variant !== "\u6570\u5B57\u8F93\u5165\u6846" && typeof props.value !== "string") invalidCombination(componentId, "\u5F53\u524D\u53D8\u4F53\u7684\u5185\u5BB9\u5FC5\u987B\u662F\u6587\u672C\u3002");
    for (const name of ["prefixAddon", "suffixAddon"]) {
      const addon = props[name];
      if (addon?.type === "text" && (typeof addon.id !== "string" || !addon.id.trim() || typeof addon.text !== "string" || !addon.text.trim())) invalidCombination(componentId, "\u524D\u540E\u7F00\u6587\u5B57\u53CA\u6807\u8BC6\u4E0D\u80FD\u4E3A\u7A7A\u3002");
    }
    const neutral = () => {
      if (props.clearable || props.borderless || props.password || props.prefixIcon != null || props.suffixIcon != null || props.infoTooltip != null || props.prefixAddon != null || props.suffixAddon != null || props.tag != null || props.composite != null) invalidCombination(componentId, "\u5F53\u524D\u53D8\u4F53\u4E0D\u80FD\u4FDD\u7559\u5176\u4ED6\u8F93\u5165\u6846\u7684\u914D\u5957\u914D\u7F6E\u3002");
    };
    if (props.variant === "\u6570\u5B57\u8F93\u5165\u6846") {
      neutral();
      if (props.counter || !(props.value === "" || typeof props.value === "number" && Number.isFinite(props.value) && props.value >= Number(props.min) && props.value <= Number(props.max))) invalidCombination(componentId, "\u6570\u5B57\u8F93\u5165\u9700\u8981\u8303\u56F4\u5185\u6570\u503C\u3002");
    }
    if (props.variant === "\u957F\u6587\u672C\u8F93\u5165\u6846") {
      neutral();
      if (typeof props.value !== "string" || props.size !== "medium" || props.maxLength !== 240) invalidCombination(componentId, "\u957F\u6587\u672C\u56FA\u5B9A medium \u5C3A\u5BF8\u53CA 240 \u5B57\u4E0A\u9650\u3002");
    }
    if (props.variant === "\u5E26\u56FE\u6807\u8F93\u5165\u6846" && (!(props.prefixIcon || props.suffixIcon || props.infoTooltip) || props.counter || props.borderless || props.password || props.prefixAddon != null || props.suffixAddon != null || props.tag != null || props.composite != null)) invalidCombination(componentId, "\u56FE\u6807\u8F93\u5165\u9700\u8981\u56FE\u6807\u6216\u8BF4\u660E\uFF0C\u4E14\u4E0D\u80FD\u6DF7\u7528\u5176\u4ED6\u53D8\u4F53\u914D\u7F6E\u3002");
    if (["\u5E26\u5C5E\u6027\u8F93\u5165\u6846", "\u7EC4\u5408\u8F93\u5165\u6846"].includes(String(props.variant))) {
      if (props.clearable || props.counter || props.borderless || props.password || props.prefixIcon != null || props.suffixIcon != null || props.infoTooltip != null) invalidCombination(componentId, "\u5C5E\u6027/\u7EC4\u5408\u8F93\u5165\u4E0D\u80FD\u6DF7\u7528\u57FA\u7840\u8F93\u5165\u884C\u4E3A\u3002");
      if (props.variant === "\u5E26\u5C5E\u6027\u8F93\u5165\u6846" && (Boolean(props.prefixAddon || props.suffixAddon) === Boolean(props.tag) || props.composite != null)) invalidCombination(componentId, "\u5C5E\u6027\u8F93\u5165\u9700\u8981\u524D\u540E\u7F00\u6216\u884C\u5185\u6807\u7B7E\u4E4B\u4E00\u3002");
      if (props.variant === "\u7EC4\u5408\u8F93\u5165\u6846") {
        const c = props.composite;
        if (props.value !== "" || props.prefixAddon != null || props.suffixAddon != null || props.tag != null || !c || !["filled", "borderless"].includes(c.appearance || "") || !Array.isArray(c.segments) || c.segments.length !== (c.select ? 1 : 2) || c.segments.some((s) => !s.id || !s.label || typeof s.value !== "string" || typeof s.placeholder !== "string")) invalidCombination(componentId, "\u7EC4\u5408\u8F93\u5165\u9700\u8981\u5B8C\u6574\u5206\u6BB5\u5185\u5BB9\u3002");
      }
    }
  }
  if (componentId === "C-23") {
    const items = props.items;
    const selected = props.selected;
    const optionLabels = items.filter((item) => !(item && typeof item === "object" && "group" in item)).map((item) => typeof item === "string" ? item : item.label);
    if (!props.multiple && selected.length > 1) invalidCombination(componentId, "\u5355\u9009\u6A21\u5F0F\u6700\u591A\u53EA\u80FD\u9009\u62E9\u4E00\u4E2A\u503C\u3002");
    if (selected.some((value) => typeof value !== "string" || !optionLabels.includes(value))) invalidCombination(componentId, "\u5DF2\u9009\u503C\u5FC5\u987B\u6765\u81EA\u5019\u9009\u9879\u3002");
    if ((props.state === "disabled" || props.state === "readonly") && props.open) invalidCombination(componentId, "\u7981\u7528\u6216\u53EA\u8BFB\u72B6\u6001\u4E0D\u80FD\u5C55\u5F00\u3002");
    if ((props.state === "loading" || props.state === "no-result") && !props.searchable) invalidCombination(componentId, "\u52A0\u8F7D\u4E0E\u65E0\u7ED3\u679C\u72B6\u6001\u8981\u6C42\u53EF\u641C\u7D22\u6A21\u5F0F\u3002");
    if (props.variant === "\u57FA\u7840\u5355\u9009" && props.multiple) invalidCombination(componentId, "\u57FA\u7840\u5355\u9009\u4E0D\u80FD\u5F00\u542F\u591A\u9009\u3002");
  }
  if (componentId === "C-34") {
    try {
      assertCardStructure(props);
    } catch (error) {
      invalidCombination(componentId, error.message);
    }
    const items = props.items;
    const tabs = props.tabs;
    const actions = props.actions;
    const itemVariant = ["external-grid", "content-grid", "nested"].includes(props.variant);
    if (itemVariant ? items.length === 0 : items.length !== 0) invalidCombination(componentId, "\u7F51\u683C/\u5D4C\u5957\u53D8\u4F53\u4E0E items \u914D\u7F6E\u4E0D\u5339\u914D\u3002");
    if (props.variant === "tabs" !== tabs.length > 0) invalidCombination(componentId, "Tabs \u53D8\u4F53\u4E0E tabs \u914D\u7F6E\u4E0D\u5339\u914D\u3002");
    if (props.variant === "actions" !== actions.length > 0) invalidCombination(componentId, "Actions \u53D8\u4F53\u4E0E actions \u914D\u7F6E\u4E0D\u5339\u914D\u3002");
    const needsAvatar = ["compact", "meta", "actions"].includes(props.variant);
    if (needsAvatar !== (props.avatar !== null)) invalidCombination(componentId, "\u5F53\u524D\u5361\u7247\u53D8\u4F53\u7684\u5934\u50CF\u914D\u7F6E\u4E0D\u5B8C\u6574\u3002");
    if (["meta", "actions"].includes(props.variant) && props.coverImage === null) invalidCombination(componentId, "\u5F53\u524D\u5361\u7247\u53D8\u4F53\u9700\u8981\u5C01\u9762\u56FE\u7247\u3002");
    if (props.variant === "interactive" && (props.appearance !== "bordered" || !props.hoverable || props.loading || props.extraActionLabel || props.footerActionLabel)) invalidCombination(componentId, "\u4EA4\u4E92\u5361\u7247\u9700\u8981 bordered/hoverable\uFF0C\u4E14\u4E0D\u80FD\u5904\u4E8E\u52A0\u8F7D\u6216\u5E26\u5D4C\u5957\u64CD\u4F5C\u3002");
    if (props.variant !== "interactive" && props.selected) invalidCombination(componentId, "selected \u53EA\u5C5E\u4E8E\u4EA4\u4E92\u5361\u7247\u3002");
  }
}
function pathLikeAbsolute(value) {
  return value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value);
}
function makeNode(input, catalog = COMPONENTS) {
  if (input.kind === "layout") {
    const columns = input.layout === "columns" ? Math.max(2, Math.min(4, input.columns ?? 2)) : void 0;
    return { id: newId("layout"), kind: "layout", layout: input.layout, gap: input.gap ?? "medium", ...columns ? { columns } : {}, children: [] };
  }
  const definition = catalog[input.componentId];
  if (!definition) throw new DomainError("UNSUPPORTED_COMPONENT", `\u7EC4\u4EF6 ${input.componentId} \u5C1A\u672A\u9002\u914D\u3002`);
  const variant = String(input.props?.variant ?? definition.defaults.variant ?? "");
  const props = { ...clone(definition.defaults), ...clone(definition.variantDefaults?.[variant] ?? {}), ...input.props ?? {} };
  for (const [name, value] of Object.entries(props)) {
    validateProp(input.componentId, name, value, catalog);
    if (catalog === COMPONENTS) validateEditableValue(input.componentId, name, value);
  }
  if (catalog === COMPONENTS) validateComponentCombination(input.componentId, props);
  return { id: newId("node"), kind: "component", componentId: input.componentId, props };
}
function insert(parent, node, index = parent.children.length) {
  if (!Number.isInteger(index) || index < 0 || index > parent.children.length) throw new DomainError("INVALID_INDEX", "\u63D2\u5165\u4F4D\u7F6E\u65E0\u6548\u3002");
  parent.children.splice(index, 0, node);
}
function remapIds(node) {
  const copy = clone(node);
  const visit = (value) => {
    value.id = newId(value.kind === "layout" ? "layout" : "node");
    if (value.kind === "layout") value.children.forEach(visit);
  };
  visit(copy);
  return copy;
}
function contains(node, id) {
  return node.id === id || node.kind === "layout" && node.children.some((child) => contains(child, id));
}
function applyOperations(current, expectedRevision, operations, catalog = COMPONENTS) {
  if (expectedRevision !== current.revision) throw new DomainError("REVISION_CONFLICT", `\u9875\u9762\u5DF2\u66F4\u65B0\u5230 revision ${current.revision}\u3002`, { currentRevision: current.revision });
  if (!Array.isArray(operations) || operations.length === 0 || operations.length > 100) throw new DomainError("INVALID_BATCH", "\u4E00\u6B21\u64CD\u4F5C\u5FC5\u987B\u5305\u542B 1\u2013100 \u6761\u547D\u4EE4\u3002");
  const next = clone(current);
  for (const operation of operations) {
    if (!operation || typeof operation !== "object" || typeof operation.type !== "string") throw new DomainError("INVALID_OPERATION", "\u64CD\u4F5C\u683C\u5F0F\u65E0\u6548\u3002");
    if (operation.type === "rename") {
      next.name = cleanName(operation.name);
      continue;
    }
    if (operation.type === "add") {
      insert(assertLayout(next.root, operation.parentId), makeNode(operation.node, catalog), operation.index);
      continue;
    }
    const found = findNode(next.root, operation.nodeId);
    if (!found) throw new DomainError("NODE_NOT_FOUND", `\u627E\u4E0D\u5230\u8282\u70B9 ${operation.nodeId}\u3002`);
    if (operation.type === "updateProps") {
      if (found.node.kind !== "component") throw new DomainError("INVALID_NODE_KIND", "\u5E03\u5C40\u8282\u70B9\u6CA1\u6709\u7EC4\u4EF6\u5C5E\u6027\u3002");
      for (const [name, value] of Object.entries(operation.props)) validateProp(found.node.componentId, name, value, catalog);
      if (catalog === COMPONENTS) for (const [name, value] of Object.entries(operation.props)) validateEditableValue(found.node.componentId, name, value);
      const nextProps = { ...found.node.props, ...clone(operation.props) };
      if (catalog === COMPONENTS) validateComponentCombination(found.node.componentId, nextProps);
      found.node.props = nextProps;
    } else if (operation.type === "updateLayout") {
      if (found.node.kind !== "layout") throw new DomainError("INVALID_NODE_KIND", "\u7EC4\u4EF6\u8282\u70B9\u6CA1\u6709\u5E03\u5C40\u5C5E\u6027\u3002");
      if (operation.layout) {
        if (!["column", "row", "columns"].includes(operation.layout)) throw new DomainError("INVALID_LAYOUT", "\u5E03\u5C40\u7C7B\u578B\u65E0\u6548\u3002");
        found.node.layout = operation.layout;
      }
      if (operation.gap) {
        if (!["small", "medium", "large"].includes(operation.gap)) throw new DomainError("INVALID_GAP", "\u5E03\u5C40\u95F4\u8DDD\u65E0\u6548\u3002");
        found.node.gap = operation.gap;
      }
      if (operation.columns !== void 0) {
        if (!Number.isInteger(operation.columns) || operation.columns < 2 || operation.columns > 4) throw new DomainError("INVALID_COLUMNS", "\u5206\u680F\u6570\u5FC5\u987B\u662F 2\u20134\u3002");
        found.node.columns = operation.columns;
      }
    } else if (operation.type === "remove") {
      if (!found.parent) throw new DomainError("ROOT_IMMUTABLE", "\u9875\u9762\u6839\u5E03\u5C40\u4E0D\u80FD\u5220\u9664\u3002");
      found.parent.children.splice(found.index, 1);
    } else if (operation.type === "move") {
      if (!found.parent) throw new DomainError("ROOT_IMMUTABLE", "\u9875\u9762\u6839\u5E03\u5C40\u4E0D\u80FD\u79FB\u52A8\u3002");
      const parent = assertLayout(next.root, operation.parentId);
      if (contains(found.node, parent.id)) throw new DomainError("CYCLE", "\u4E0D\u80FD\u628A\u8282\u70B9\u79FB\u52A8\u5230\u81EA\u5DF1\u7684\u5B50\u6811\u4E2D\u3002");
      found.parent.children.splice(found.index, 1);
      const targetIndex = operation.index === void 0 ? parent.children.length : Math.min(operation.index, parent.children.length);
      insert(parent, found.node, targetIndex);
    } else if (operation.type === "duplicate") {
      const parent = operation.parentId ? assertLayout(next.root, operation.parentId) : found.parent;
      if (!parent) throw new DomainError("ROOT_IMMUTABLE", "\u9875\u9762\u6839\u5E03\u5C40\u4E0D\u80FD\u590D\u5236\u3002");
      insert(parent, remapIds(found.node), operation.index ?? (found.parent === parent ? found.index + 1 : parent.children.length));
    } else {
      throw new DomainError("UNKNOWN_OPERATION", `\u4E0D\u652F\u6301\u64CD\u4F5C ${operation.type}\u3002`);
    }
  }
  next.revision = current.revision + 1;
  next.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  validatePage(next, catalog);
  return next;
}
function validatePage(page, catalog = COMPONENTS) {
  if (!page || page.schemaVersion !== 1 || typeof page.pageId !== "string" || page.pageId.length > 120) throw new DomainError("INVALID_PAGE", "\u9875\u9762\u63CF\u8FF0\u7248\u672C\u6216\u6807\u8BC6\u65E0\u6548\u3002");
  assertExactKeys(page, ["schemaVersion", "pageId", "name", "revision", "componentLibraryVersion", "componentLibrary", "updatedAt", "root"], "\u9875\u9762");
  cleanName(page.name);
  if (typeof page.componentLibraryVersion !== "string" || !page.componentLibraryVersion) throw new DomainError("INVALID_PAGE", "\u9875\u9762\u7F3A\u5C11\u7EC4\u4EF6\u5E93\u7248\u672C\u3002");
  if (page.componentLibrary) {
    assertExactKeys(page.componentLibrary, ["libraryId", "snapshotId", "sourceVersion", "digest", "adapterVersion"], "\u7EC4\u4EF6\u5E93\u7ED1\u5B9A");
    if (page.componentLibrary.libraryId !== "b2b" || !/^b2b-[a-f0-9]{16}$/.test(page.componentLibrary.snapshotId) || !/^[a-f0-9]{64}$/.test(page.componentLibrary.digest) || typeof page.componentLibrary.adapterVersion !== "string" || page.componentLibrary.sourceVersion !== null && typeof page.componentLibrary.sourceVersion !== "string") throw new DomainError("INVALID_PAGE", "\u9875\u9762\u7EC4\u4EF6\u5E93\u7ED1\u5B9A\u65E0\u6548\u3002");
  }
  if (!page.root || page.root.kind !== "layout") throw new DomainError("INVALID_PAGE", "\u9875\u9762\u5FC5\u987B\u5305\u542B\u6839\u5E03\u5C40\u3002");
  const ids = /* @__PURE__ */ new Set();
  let count = 0;
  const visit = (node) => {
    count += 1;
    if (count > 1e3) throw new DomainError("PAGE_TOO_LARGE", "\u9875\u9762\u8282\u70B9\u8D85\u8FC7 1000 \u4E2A\u3002");
    if (!node.id || ids.has(node.id)) throw new DomainError("DUPLICATE_NODE_ID", `\u8282\u70B9\u6807\u8BC6\u91CD\u590D\uFF1A${node.id}`);
    ids.add(node.id);
    if (node.kind === "layout") {
      assertExactKeys(node, ["id", "kind", "layout", "gap", "columns", "children"], `\u5E03\u5C40 ${node.id}`);
      if (!["column", "row", "columns"].includes(node.layout) || !["small", "medium", "large"].includes(node.gap) || !Array.isArray(node.children)) throw new DomainError("INVALID_LAYOUT", `\u5E03\u5C40 ${node.id} \u65E0\u6548\u3002`);
      if (node.layout === "columns" && (!Number.isInteger(node.columns) || (node.columns ?? 0) < 2 || (node.columns ?? 0) > 4)) throw new DomainError("INVALID_COLUMNS", `\u5E03\u5C40 ${node.id} \u7684\u5217\u6570\u65E0\u6548\u3002`);
      node.children.forEach(visit);
    } else {
      assertExactKeys(node, ["id", "kind", "componentId", "props"], `\u7EC4\u4EF6\u8282\u70B9 ${node.id}`);
      if (catalog && !catalog[node.componentId]) throw new DomainError("UNSUPPORTED_COMPONENT", `\u7EC4\u4EF6 ${node.componentId} \u5C1A\u672A\u9002\u914D\u3002`);
      if (!node.props || typeof node.props !== "object" || Array.isArray(node.props)) throw new DomainError("INVALID_PROPS", "\u7EC4\u4EF6\u5C5E\u6027\u65E0\u6548\u3002");
      if (catalog) for (const [key, value] of Object.entries(node.props)) validateProp(node.componentId, key, value, catalog);
    }
  };
  visit(page.root);
  return page;
}

// src/library-update.ts
async function refreshLibrary(libraries2, store2, input) {
  const checked = await libraries2.check(input.sourcePath);
  const before = await store2.get(input.pageId);
  if (before.revision !== input.expectedRevision) throw new DomainError("REVISION_CONFLICT", "\u9875\u9762\u5DF2\u88AB\u4FEE\u6539\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002");
  const page = before.componentLibrary?.snapshotId === checked.candidate.snapshotId ? before : await store2.setLibrary(input.pageId, input.expectedRevision, await libraries2.binding(checked.candidate.snapshotId));
  await libraries2.apply(checked.candidate.snapshotId, input.sourcePath);
  return { page, library: checked.candidate, components: Object.values(await libraries2.catalog(checked.candidate.snapshotId)), changed: page.revision !== before.revision };
}

// src/http.ts
import { createServer } from "node:http";
import { readFile as readFile2, stat } from "node:fs/promises";
import path2 from "node:path";

// src/exporter.ts
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

// ../../../../../Users/wangkewei/Desktop/page-builder-marketplace/plugins/page-builder/node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var _a;
var Worker;
var isMarkedAsUntransferable;
try {
  _a = require2("worker_threads"), Worker = _a.Worker, isMarkedAsUntransferable = _a.isMarkedAsUntransferable;
} catch (e) {
}
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b[i2] = start += 1 << eb[i2 - 1];
  }
  var r = new i32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j = b[i2]; j < b[i2 + 1]; ++j) {
      r[j] = j - b[i2] << 5 | i2;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i2 = 0;
  var l = new u16(mb);
  for (; i2 < s; ++i2) {
    if (cd[i2])
      ++l[cd[i2] - 1];
  }
  var le = new u16(mb);
  for (i2 = 1; i2 < mb; ++i2) {
    le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v = le[cd[i2] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i2 = 0; i2 < d.length; ++i2) {
    if (d[i2])
      t.push({ s: i2, f: d[i2] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i22].f ? i0++ : i22++];
    r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i2 = 1; i2 < s; ++i2) {
    if (t2[i2].s > maxSym)
      maxSym = t2[i2].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i2 = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i2 < s; ++i2) {
      var i2_1 = t2[i2].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i2].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i2;
    }
    for (; i2 >= 0 && dt; --i2) {
      var i2_3 = t2[i2].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i2 = 1; i2 <= s; ++i2) {
    if (c[i2] == cln && i2 != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i2];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i2 = 0; i2 < cl.length; ++i2)
    l += cf[i2] * cl[i2];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i2 = 0; i2 < s; ++i2)
    out[o + i2 + 4] = dat[i2];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i2 = 0; i2 < lclt.length; ++i2)
    ++lcfreq[lclt[i2] & 31];
  for (var i2 = 0; i2 < lcdt.length; ++i2)
    ++lcfreq[lcdt[i2] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i2 = 0; i2 < nlcc; ++i2)
      wbits(out, p + 3 * i2, lct[clim[i2]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i2 = 0; i2 < clct.length; ++i2) {
        var len = clct[i2] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i2 = 0; i2 < li; ++i2) {
    var sym = syms[i2];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i3) {
      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i2 + 2 < s; ++i2) {
      var hv = hsh(i2);
      var imod = i2 & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i2) {
        var rem = s - i2;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
          li = lc_1 = eb = 0, bs = i2;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i2 - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i2);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i2 + l] == dat[i2 + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i2 - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i2 + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
      }
    }
    for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
      syms[li++] = dat[i2];
      ++lf[dat[i2]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i2, st.w = wi;
    }
  } else {
    for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
      var e = i2 + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i2, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i2 = 0; i2 < 256; ++i2) {
    var c = i2, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i2] = c;
  }
  return t;
})();
var crc = function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i2 = 0; i2 < d.length; ++i2)
        cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var wbytes = function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (ArrayBuffer.isView(val))
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i2 = 0; i2 < str.length; ++i2)
      ar_1[i2] = str.charCodeAt(i2);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i2 = 0; i2 < l; ++i2) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i2 << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i2);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
var exfl = function(ex) {
  var le = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err(9);
      le += l + 4;
    }
  }
  return le;
};
var wzh = function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i2 = 0; i2 < files.length; ++i2) {
    var f = files[i2];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}

// src/exporter.ts
async function collect(directory, prefix, output) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) await collect(full, `${relative}/`, output);
    else output[relative] = new Uint8Array(await readFile(full));
  }
}
var indexHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>\u9875\u9762\u642D\u5EFA\u5668\u5BFC\u51FA</title><link rel="icon" href="data:,"><link rel="stylesheet" href="./styles.css"></head><body><main id="page"></main><script src="./vendor/b2b/components/runtime/loader.js"></script><script type="module" src="./app.js"></script><script type="module" src="./business.js"></script></body></html>`;
var styles = `*{box-sizing:border-box}body{margin:0;background:#f6f7f9;color:#1f2329;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#page{max-width:1200px;margin:0 auto;padding:40px}.layout{display:flex;min-width:0}.layout-column{flex-direction:column}.layout-row{flex-direction:row;flex-wrap:wrap;align-items:flex-start}.layout-columns{display:grid;grid-template-columns:repeat(var(--columns,2),minmax(0,1fr))}.gap-small{gap:8px}.gap-medium{gap:16px}.gap-large{gap:24px}.component-host{min-width:0}@media(max-width:720px){#page{padding:20px}.layout-row,.layout-columns{display:flex;flex-direction:column}.component-host{width:100%}}`;
var app = `const page=await fetch('./page.json').then(r=>r.json());const root=document.querySelector('#page');const instances=[];async function render(node,target){if(node.kind==='layout'){const el=document.createElement('section');el.className='layout layout-'+node.layout+' gap-'+node.gap;if(node.columns)el.style.setProperty('--columns',node.columns);target.append(el);for(const child of node.children)await render(child,el);return}const host=document.createElement('div');host.className='component-host';host.dataset.nodeId=node.id;target.append(host);const result=await window.B2B.renderComponent({component:node.componentId,props:node.props},host);instances.push(result.instance)}await render(page.root,root);window.pageBuilderExport={page,instances};`;
var business = `// Add business event listeners here. Generated rendering stays isolated in app.js.
`;
var readme = `# \u5BFC\u51FA\u7684\u9875\u9762\u5DE5\u7A0B

\u672C\u5DE5\u7A0B\u56FA\u5B9A\u5230\u5BFC\u51FA\u65F6\u7684 Page Schema revision\u3002

\u542F\u52A8\uFF1A\u5728\u672C\u76EE\u5F55\u8FD0\u884C \`python3 -m http.server 4173\`\uFF0C\u7136\u540E\u6253\u5F00 http://127.0.0.1:4173\u3002

- \`page.json\`\uFF1A\u53EF\u91CD\u65B0\u5BFC\u5165\u9875\u9762\u642D\u5EFA\u5668\u7684\u9875\u9762\u63CF\u8FF0
- \`app.js\`\uFF1A\u751F\u6210\u7684\u771F\u5B9E Renderer \u8C03\u7528
- \`business.js\`\uFF1A\u72EC\u7ACB\u4E1A\u52A1\u903B\u8F91\u5165\u53E3
- \`vendor/b2b\`\uFF1A\u56FA\u5B9A\u7684\u7EC4\u4EF6\u8FD0\u884C\u8D44\u6E90
`;
async function exportPage(page, libraryDirectory, outputRoot) {
  const stamp = (/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const directory = path.join(outputRoot, page.pageId, `r${page.revision}-${stamp}`);
  await mkdir(directory, { recursive: true });
  const files = {
    "index.html": strToU8(indexHtml),
    "styles.css": strToU8(styles),
    "app.js": strToU8(app),
    "business.js": strToU8(business),
    "README.md": strToU8(readme),
    "page.json": strToU8(JSON.stringify(page, null, 2))
  };
  await collect(libraryDirectory, "vendor/b2b/", files);
  if (files["vendor/b2b/manifest.json"]) {
    const manifest = JSON.parse(new TextDecoder().decode(files["vendor/b2b/manifest.json"]));
    delete manifest.sourcePath;
    files["vendor/b2b/manifest.json"] = strToU8(JSON.stringify(manifest, null, 2));
  }
  const zip = zipSync(files, { level: 6 });
  const zipPath = path.join(directory, `page-builder-${page.pageId}-r${page.revision}.zip`);
  await writeFile(zipPath, zip);
  await writeFile(path.join(directory, "page.json"), JSON.stringify(page, null, 2));
  return { pageId: page.pageId, revision: page.revision, zipPath, directory, fileCount: Object.keys(files).length, bytes: zip.length };
}

// src/http.ts
var MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".webp": "image/webp", ".gif": "image/gif", ".jpeg": "image/jpeg", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
function send(response, status, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  response.writeHead(status, { "content-type": type, "cache-control": "no-store", "access-control-allow-origin": "*" });
  response.end(payload);
}
async function json(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 2e6) throw new DomainError("BODY_TOO_LARGE", "\u8BF7\u6C42\u8D85\u8FC7 2 MB\u3002 ");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw new DomainError("INVALID_JSON", "\u8BF7\u6C42\u4E0D\u662F\u5408\u6CD5 JSON\u3002");
  }
}
function createEditorServer(store2, uiDirectory, exportDirectory2, runtime, libraries2) {
  const server2 = createServer(async (request, response) => {
    try {
      if (!request.url) return send(response, 404, { error: "NOT_FOUND" });
      const url2 = new URL(request.url, "http://127.0.0.1");
      const pathname = decodeURIComponent(url2.pathname);
      if (request.method === "OPTIONS") {
        response.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type" });
        return response.end();
      }
      if (pathname === "/api/health") return send(response, 200, { ok: true, ...runtime, components: Object.keys(COMPONENTS), schemaVersion: 1, componentLibrary: await libraries2.current() });
      if (pathname === "/api/catalog" && request.method === "GET") return send(response, 200, { components: Object.values(await libraries2.catalog(url2.searchParams.get("snapshotId") || void 0)) });
      if (pathname === "/api/libraries" && request.method === "GET") return send(response, 200, await libraries2.list());
      if (pathname === "/api/libraries/refresh" && request.method === "POST") return send(response, 200, await refreshLibrary(libraries2, store2, await json(request)));
      if (pathname === "/api/libraries/check" && request.method === "POST") {
        const input = await json(request);
        return send(response, 200, await libraries2.check(input.sourcePath));
      }
      if (pathname === "/api/libraries/apply" && request.method === "POST") {
        const input = await json(request);
        return send(response, 200, await libraries2.apply(input.snapshotId, input.sourcePath));
      }
      const assetMatch = pathname.match(/^\/api\/libraries\/(b2b-[a-f0-9]{16})\/assets\/(.+)$/);
      if (assetMatch && request.method === "GET") {
        const resolved2 = await libraries2.asset(assetMatch[1], assetMatch[2]);
        const info2 = await stat(resolved2);
        if (!info2.isFile()) return send(response, 404, { error: "NOT_FOUND" });
        return send(response, 200, await readFile2(resolved2), MIME[path2.extname(resolved2)] ?? "application/octet-stream");
      }
      if (pathname === "/api/pages" && request.method === "GET") return send(response, 200, { pages: await store2.list() });
      if (pathname === "/api/pages" && request.method === "POST") {
        const input = await json(request);
        return send(response, 201, { page: await store2.create(input.name) });
      }
      if (pathname === "/api/import" && request.method === "POST") {
        const input = await json(request);
        return send(response, 201, { page: await store2.import(input.page ?? input) });
      }
      const match = pathname.match(/^\/api\/pages\/([A-Za-z0-9_-]+)(?:\/(operations|undo|redo|selection|export|library))?$/);
      if (match) {
        const [, pageId, action] = match;
        if (!action && request.method === "GET") {
          const snapshot = await store2.snapshot(pageId);
          return send(response, 200, { ...snapshot, library: await libraries2.resolvePage(snapshot.page), components: Object.values(await libraries2.catalogForPage(snapshot.page)) });
        }
        if (action === "operations" && request.method === "POST") {
          const input = await json(request);
          const page = await store2.apply(pageId, input.expectedRevision, input.operations);
          return send(response, 200, { page, selection: await store2.selection(pageId) });
        }
        if (action === "undo" && request.method === "POST") {
          const input = await json(request);
          const page = await store2.undo(pageId, input.expectedRevision);
          return send(response, 200, { page, selection: await store2.selection(pageId) });
        }
        if (action === "redo" && request.method === "POST") {
          const input = await json(request);
          const page = await store2.redo(pageId, input.expectedRevision);
          return send(response, 200, { page, selection: await store2.selection(pageId) });
        }
        if (action === "selection" && request.method === "POST") {
          const input = await json(request);
          return send(response, 200, { selection: await store2.select(pageId, input.nodeId ?? null, input.expectedRevision) });
        }
        if (action === "library" && request.method === "POST") {
          const input = await json(request);
          const binding = await libraries2.binding(input.snapshotId);
          const page = await store2.setLibrary(pageId, input.expectedRevision, binding);
          return send(response, 200, { page, selection: await store2.selection(pageId), library: await libraries2.resolvePage(page) });
        }
        if (action === "export" && request.method === "POST") {
          const page = await store2.get(pageId);
          return send(response, 200, { export: await exportPage(page, await libraries2.directoryForPage(page), exportDirectory2) });
        }
      }
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const resolved = path2.resolve(uiDirectory, relative);
      if (!resolved.startsWith(`${path2.resolve(uiDirectory)}${path2.sep}`) && resolved !== path2.join(path2.resolve(uiDirectory), "index.html")) throw new DomainError("INVALID_PATH", "\u8D44\u6E90\u8DEF\u5F84\u65E0\u6548\u3002");
      const info = await stat(resolved);
      if (!info.isFile()) return send(response, 404, { error: "NOT_FOUND" });
      return send(response, 200, await readFile2(resolved), MIME[path2.extname(resolved)] ?? "application/octet-stream");
    } catch (error) {
      if (error instanceof DomainError) return send(response, error.code === "PAGE_NOT_FOUND" || error.code === "NODE_NOT_FOUND" ? 404 : error.code === "REVISION_CONFLICT" ? 409 : 400, { error: { code: error.code, message: error.message, details: error.details } });
      if (error.code === "ENOENT") return send(response, 404, { error: { code: "NOT_FOUND", message: "\u672A\u627E\u5230\u8D44\u6E90\u3002" } });
      console.error(error);
      return send(response, 500, { error: { code: "INTERNAL_ERROR", message: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF\u3002" } });
    }
  });
  return {
    async start() {
      await new Promise((resolve) => server2.listen(0, "127.0.0.1", resolve));
      const { port } = server2.address();
      return `http://127.0.0.1:${port}`;
    },
    close() {
      return new Promise((resolve, reject) => server2.close((error) => error ? reject(error) : resolve()));
    }
  };
}

// src/store.ts
import { mkdir as mkdir2, open, readFile as readFile3, readdir as readdir2, rename, stat as stat2, unlink, writeFile as writeFile2 } from "node:fs/promises";
import path3 from "node:path";
import { randomUUID as randomUUID2 } from "node:crypto";
function pageIdPart(pageId) {
  if (!/^[A-Za-z0-9_-]+$/.test(pageId)) throw new DomainError("INVALID_PAGE_ID", "\u9875\u9762\u6807\u8BC6\u65E0\u6548\u3002");
  return pageId;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}
var FilePersistence = class {
  constructor(directory) {
    this.directory = directory;
    this.stateDirectory = path3.join(directory, ".page-builder-state");
    this.lockDirectory = path3.join(this.stateDirectory, "locks");
  }
  directory;
  stateDirectory;
  lockDirectory;
  file(pageId) {
    return path3.join(this.directory, `${pageIdPart(pageId)}.json`);
  }
  historyFile(pageId, revision) {
    return path3.join(this.stateDirectory, "history", pageIdPart(pageId), `${revision}.json`);
  }
  selectionFile(pageId, revision) {
    return path3.join(this.stateDirectory, "selection", pageIdPart(pageId), `${revision}.json`);
  }
  async readJson(file) {
    try {
      return JSON.parse(await readFile3(file, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }
  async saveJson(file, value) {
    await mkdir2(path3.dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.${randomUUID2()}.tmp`;
    await writeFile2(temporary, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 384 });
    await rename(temporary, file);
  }
  async list() {
    await mkdir2(this.directory, { recursive: true });
    const names = (await readdir2(this.directory)).filter((name) => name.endsWith(".json"));
    const pages = [];
    for (const name of names) {
      try {
        pages.push(validatePage(JSON.parse(await readFile3(path3.join(this.directory, name), "utf8")), null));
      } catch {
      }
    }
    return pages;
  }
  async read(pageId) {
    const value = await this.readJson(this.file(pageId));
    return value ? validatePage(value, null) : null;
  }
  async save(page) {
    await this.saveJson(this.file(page.pageId), page);
  }
  async readHistory(pageId, revision) {
    return this.readJson(this.historyFile(pageId, revision));
  }
  async saveHistory(pageId, history) {
    await this.saveJson(this.historyFile(pageId, history.headRevision), history);
  }
  async readSelection(pageId, revision) {
    return this.readJson(this.selectionFile(pageId, revision));
  }
  async saveSelection(pageId, selection) {
    await this.saveJson(this.selectionFile(pageId, selection.revision), selection);
  }
  async withPageLock(pageId, task) {
    await mkdir2(this.lockDirectory, { recursive: true });
    const lock = path3.join(this.lockDirectory, `${pageIdPart(pageId)}.lock`);
    const deadline = Date.now() + 1e4;
    const token = randomUUID2();
    let handle;
    while (!handle) {
      try {
        handle = await open(lock, "wx", 384);
        await handle.writeFile(JSON.stringify({ token, pid: process.pid, createdAt: (/* @__PURE__ */ new Date()).toISOString() }));
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
        try {
          const info = await stat2(lock);
          const owner = JSON.parse(await readFile3(lock, "utf8"));
          if (Date.now() - info.mtimeMs > 3e4 && !processIsAlive(owner.pid ?? 0)) await unlink(lock);
        } catch (inspectionError) {
          if (inspectionError.code !== "ENOENT") throw inspectionError;
        }
        if (Date.now() >= deadline) throw new DomainError("PAGE_LOCK_TIMEOUT", `\u9875\u9762 ${pageId} \u6B63\u7531\u53E6\u4E00\u4E2A\u8FDB\u7A0B\u5199\u5165\uFF0C\u8BF7\u91CD\u8BD5\u3002`);
        await delay(20);
      }
    }
    try {
      return await task();
    } finally {
      await handle.close().catch(() => void 0);
      try {
        const owner = JSON.parse(await readFile3(lock, "utf8"));
        if (owner.token === token) await unlink(lock);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
};
function clone2(value) {
  return structuredClone(value);
}
var PageStore = class {
  constructor(persistence, libraryBinding, libraries2) {
    this.persistence = persistence;
    this.libraryBinding = libraryBinding;
    this.libraries = libraries2;
  }
  persistence;
  libraryBinding;
  libraries;
  async load() {
    const pages = await this.persistence.list();
    if (this.libraries) {
      for (const page of pages) if (!page.componentLibrary) {
        await this.persistence.withPageLock(page.pageId, async () => {
          const current = await this.current(page.pageId);
          if (current.componentLibrary) return;
          const binding = await this.libraries.binding((await this.libraries.resolvePage(current)).snapshotId);
          await this.persistence.save({ ...current, componentLibrary: binding });
        });
      }
    }
  }
  async list() {
    return (await this.persistence.list()).map((page) => ({ pageId: page.pageId, name: page.name, revision: page.revision, updatedAt: page.updatedAt }));
  }
  async get(pageId) {
    const page = await this.persistence.read(pageId);
    if (!page) throw new DomainError("PAGE_NOT_FOUND", `\u627E\u4E0D\u5230\u9875\u9762 ${pageId}\u3002`);
    return clone2(page);
  }
  validHistory(current, history) {
    if (!history || history.headRevision !== current.revision || !Array.isArray(history.past) || !Array.isArray(history.future)) return { headRevision: current.revision, past: [], future: [] };
    return clone2(history);
  }
  validSelection(page, selection) {
    const nodeId = selection?.revision === page.revision && (!selection.nodeId || findNode(page.root, selection.nodeId)) ? selection.nodeId : null;
    return { revision: page.revision, nodeId, updatedAt: selection?.updatedAt ?? page.updatedAt };
  }
  async current(pageId) {
    const page = await this.persistence.read(pageId);
    if (!page) throw new DomainError("PAGE_NOT_FOUND", `\u627E\u4E0D\u5230\u9875\u9762 ${pageId}\u3002`);
    return page;
  }
  async snapshot(pageId) {
    return this.persistence.withPageLock(pageId, async () => {
      const page = await this.current(pageId);
      const selection = this.validSelection(page, await this.persistence.readSelection(pageId, page.revision));
      return { page: clone2(page), selection: { pageId, nodeId: selection.nodeId, revision: page.revision } };
    });
  }
  async create(name) {
    const page = createPage(name, this.libraryBinding ? await this.libraryBinding() : void 0);
    return this.persistence.withPageLock(page.pageId, async () => {
      if (await this.persistence.read(page.pageId)) throw new DomainError("PAGE_EXISTS", `\u9875\u9762 ${page.pageId} \u5DF2\u5B58\u5728\u3002`);
      await this.persistence.saveHistory(page.pageId, { headRevision: page.revision, past: [], future: [] });
      await this.persistence.saveSelection(page.pageId, { revision: page.revision, nodeId: null, updatedAt: page.updatedAt });
      await this.persistence.save(page);
      return clone2(page);
    });
  }
  async apply(pageId, expectedRevision, operations) {
    return this.persistence.withPageLock(pageId, async () => {
      const current = await this.current(pageId);
      const next = applyOperations(current, expectedRevision, operations, this.libraries ? await this.libraries.catalogForPage(current) : void 0);
      await this.libraries?.validatePage(next);
      const history = this.validHistory(current, await this.persistence.readHistory(pageId, current.revision));
      history.past.push(clone2(current));
      if (history.past.length > 100) history.past.shift();
      history.future = [];
      history.headRevision = next.revision;
      const priorSelection = this.validSelection(current, await this.persistence.readSelection(pageId, current.revision));
      const nextSelection = { revision: next.revision, nodeId: priorSelection.nodeId && findNode(next.root, priorSelection.nodeId) ? priorSelection.nodeId : null, updatedAt: next.updatedAt };
      await this.persistence.saveHistory(pageId, history);
      await this.persistence.saveSelection(pageId, nextSelection);
      await this.persistence.save(next);
      return clone2(next);
    });
  }
  async undo(pageId, expectedRevision) {
    return this.restore(pageId, expectedRevision, "undo");
  }
  async redo(pageId, expectedRevision) {
    return this.restore(pageId, expectedRevision, "redo");
  }
  async restore(pageId, expectedRevision, direction) {
    return this.persistence.withPageLock(pageId, async () => {
      const current = await this.current(pageId);
      if (current.revision !== expectedRevision) throw new DomainError("REVISION_CONFLICT", `\u9875\u9762\u5DF2\u66F4\u65B0\u5230 revision ${current.revision}\u3002`, { currentRevision: current.revision });
      const history = this.validHistory(current, await this.persistence.readHistory(pageId, current.revision));
      const source = direction === "undo" ? history.past : history.future;
      const target = source.pop();
      if (!target) throw new DomainError(direction === "undo" ? "NOTHING_TO_UNDO" : "NOTHING_TO_REDO", direction === "undo" ? "\u6CA1\u6709\u53EF\u64A4\u9500\u7684\u64CD\u4F5C\u3002" : "\u6CA1\u6709\u53EF\u91CD\u505A\u7684\u64CD\u4F5C\u3002");
      const restored = { ...clone2(target), componentLibrary: target.componentLibrary || current.componentLibrary, revision: current.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      await this.libraries?.validatePage(restored);
      (direction === "undo" ? history.future : history.past).push(clone2(current));
      history.headRevision = restored.revision;
      const priorSelection = this.validSelection(current, await this.persistence.readSelection(pageId, current.revision));
      const nextSelection = { revision: restored.revision, nodeId: priorSelection.nodeId && findNode(restored.root, priorSelection.nodeId) ? priorSelection.nodeId : null, updatedAt: restored.updatedAt };
      await this.persistence.saveHistory(pageId, history);
      await this.persistence.saveSelection(pageId, nextSelection);
      await this.persistence.save(restored);
      return clone2(restored);
    });
  }
  async select(pageId, nodeId, expectedRevision) {
    return this.persistence.withPageLock(pageId, async () => {
      const page = await this.current(pageId);
      if (expectedRevision !== void 0 && page.revision !== expectedRevision) throw new DomainError("REVISION_CONFLICT", `\u9875\u9762\u5DF2\u66F4\u65B0\u5230 revision ${page.revision}\u3002`, { currentRevision: page.revision });
      if (nodeId && !findNode(page.root, nodeId)) throw new DomainError("NODE_NOT_FOUND", `\u627E\u4E0D\u5230\u8282\u70B9 ${nodeId}\u3002`);
      await this.persistence.saveSelection(pageId, { revision: page.revision, nodeId, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      return { pageId, nodeId, revision: page.revision };
    });
  }
  async selection(pageId) {
    return (await this.snapshot(pageId)).selection;
  }
  async setLibrary(pageId, expectedRevision, binding) {
    return this.persistence.withPageLock(pageId, async () => {
      const current = await this.current(pageId);
      if (current.revision !== expectedRevision) throw new DomainError("REVISION_CONFLICT", `\u9875\u9762\u5DF2\u66F4\u65B0\u5230 revision ${current.revision}\u3002`, { currentRevision: current.revision });
      const next = { ...clone2(current), componentLibraryVersion: binding.sourceVersion || binding.digest, componentLibrary: clone2(binding), revision: current.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      validatePage(next, this.libraries ? await this.libraries.catalogForPage(next) : void 0);
      await this.libraries?.validatePage(next);
      const history = this.validHistory(current, await this.persistence.readHistory(pageId, current.revision));
      history.past.push(clone2(current));
      if (history.past.length > 100) history.past.shift();
      history.future = [];
      history.headRevision = next.revision;
      const priorSelection = this.validSelection(current, await this.persistence.readSelection(pageId, current.revision));
      const nextSelection = { revision: next.revision, nodeId: priorSelection.nodeId, updatedAt: next.updatedAt };
      await this.persistence.saveHistory(pageId, history);
      await this.persistence.saveSelection(pageId, nextSelection);
      await this.persistence.save(next);
      return clone2(next);
    });
  }
  async import(input) {
    const raw = validatePage(clone2(input), this.libraries ? null : void 0);
    const candidate = validatePage(raw, this.libraries ? await this.libraries.catalogForPage(raw) : void 0);
    await this.libraries?.validatePage(candidate);
    const page = { ...candidate, pageId: createPage().pageId, name: `${candidate.name}\uFF08\u5BFC\u5165\uFF09`, revision: 0, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return this.persistence.withPageLock(page.pageId, async () => {
      await this.persistence.saveHistory(page.pageId, { headRevision: page.revision, past: [], future: [] });
      await this.persistence.saveSelection(page.pageId, { revision: page.revision, nodeId: null, updatedAt: page.updatedAt });
      await this.persistence.save(page);
      return clone2(page);
    });
  }
};

// src/library-schema.ts
import vm from "node:vm";
import { readFile as readFile4 } from "node:fs/promises";
import path4 from "node:path";
async function readLibraryCatalog(directory) {
  const context = { window: { B2B: { components: {} } } };
  vm.runInNewContext(await readFile4(path4.join(directory, "components/runtime/api-schema.js"), "utf8"), context, { timeout: 1e3 });
  vm.runInNewContext(await readFile4(path4.join(directory, "components/runtime/presets.js"), "utf8"), context, { timeout: 1e3 });
  const presets = JSON.parse(JSON.stringify(context.window.B2B.components.rendererPresets));
  const schemas = JSON.parse(JSON.stringify(context.window.B2B.components.apiSchemas));
  const output = {};
  for (const [id, editor] of Object.entries(COMPONENTS)) {
    const api = schemas[id];
    if (!api?.props) throw new Error(`${id} \u7F3A\u5C11\u7EC4\u4EF6\u5E93\u516C\u5F00\u534F\u8BAE\u3002`);
    const props = api.props;
    output[id] = { id, name: api.name, rendererName: api.name, label: editor.label, description: editor.description, editable: editor.editable, props, variantDefaults: Object.fromEntries(Object.entries(presets[id]?.variants || {}).map(([variant, values]) => [variant, Object.fromEntries(Object.entries(values).filter(([name]) => props[name] && (props[name].type === "boolean" || props[name].type === "enum")))])), defaults: Object.fromEntries(Object.entries(props).filter(([, rule]) => "default" in rule).map(([name, rule]) => [name, rule.default])) };
  }
  return output;
}

// src/renderer-validation.ts
import { mkdir as mkdir3, writeFile as writeFile3, readFile as readFile6 } from "node:fs/promises";
import path6 from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

// src/native-resource.ts
import { readFile as readFile5 } from "node:fs/promises";
import path5 from "node:path";
async function readNativeAssets(directory, files) {
  const assets = {};
  const mime = { ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };
  for (const file of files) {
    const ext = path5.extname(file);
    if (![".js", ".css", ...Object.keys(mime)].includes(ext)) continue;
    const bytes = await readFile5(path5.join(directory, file));
    assets[file] = mime[ext] ? `data:${mime[ext]};base64,${bytes.toString("base64")}` : bytes.toString("utf8");
  }
  return assets;
}

// src/renderer-validation.ts
var RendererValidator = class {
  constructor(workDirectory, transportFile) {
    this.workDirectory = workDirectory;
    this.transportFile = transportFile;
  }
  workDirectory;
  transportFile;
  browser;
  tail = Promise.resolve();
  idle;
  pages = /* @__PURE__ */ new Map();
  valid = /* @__PURE__ */ new Set();
  async close() {
    clearTimeout(this.idle);
    const browser = this.browser;
    this.browser = null;
    this.pages.clear();
    await browser?.close();
  }
  check(directory, requests, files) {
    const run = async () => {
      clearTimeout(this.idle);
      const remaining = requests.filter((r) => !this.valid.has(directory + JSON.stringify(r)));
      if (!remaining.length && !files) return;
      if (!this.browser) {
        const mod = "playwright-core";
        const { chromium } = await import(mod);
        this.browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
      }
      const cacheKey = directory + (files ? ":native" : ":http");
      let page = this.pages.get(cacheKey);
      try {
        if (!page) {
          page = await this.browser.newPage();
          if (files) {
            const assets = await readNativeAssets(directory, files);
            const transport = await readFile6(this.transportFile, "utf8");
            const literal = JSON.stringify(assets).replace(/</g, "\\u003c");
            const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'";
            await page.setContent(`<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><div id="root"></div><script>${transport.replace(/<\/script/gi, "<\\/script")}</script><script>window.runtimeReady=PageBuilderResources.installLibraryTransport(${literal}).script('components/runtime/loader.js').then(()=>B2B.componentRuntimeReady);</script>`);
          } else {
            await mkdir3(this.workDirectory, { recursive: true });
            const file = path6.join(this.workDirectory, createHash("sha256").update(directory).digest("hex") + ".html");
            await writeFile3(file, `<!doctype html><meta charset="utf-8"><script src="${pathToFileURL(path6.join(directory, "components/runtime/loader.js")).href}"></script><div id="root"></div>`);
            await page.goto(pathToFileURL(file).href);
          }
          this.pages.set(cacheKey, page);
        }
        await page.evaluate(async (items) => {
          if (window.runtimeReady) await window.runtimeReady;
          for (const request of items) {
            const target = document.createElement("div");
            document.querySelector("#root").append(target);
            let result2;
            try {
              result2 = await window.B2B.renderComponent(request, target);
              if (!result2.audit.valid) throw new Error(`${request.component} \u6821\u9A8C\u5931\u8D25`);
            } finally {
              result2?.instance.destroy();
              target.remove();
            }
          }
        }, files ? requests : remaining);
        for (const r of remaining) this.valid.add(directory + JSON.stringify(r));
        if (this.valid.size > 1500) this.valid.clear();
      } finally {
        this.idle = setTimeout(() => {
          void this.close();
        }, 3e4);
        this.idle.unref();
      }
    };
    const result = this.tail.then(run);
    this.tail = result.catch(() => {
    });
    return result;
  }
};

// src/library.ts
import { createHash as createHash2, randomUUID as randomUUID3 } from "node:crypto";
import { mkdir as mkdir4, readFile as readFile7, readdir as readdir3, rename as rename2, rm, stat as stat3, writeFile as writeFile4 } from "node:fs/promises";
import path7 from "node:path";
import vm2 from "node:vm";
var EDITOR_COMPONENTS = [
  { component: "C-02", requiredProps: ["label", "variant", "size", "icon", "disabled", "loading", "width"], props: { label: "\u4FDD\u5B58", variant: "primary", size: "medium", icon: "save", disabled: false, loading: false, width: "default" } },
  { component: "C-04", requiredProps: ["icon", "label", "size", "variant", "disabled", "tooltip", "items"], props: { icon: "add", label: "\u6DFB\u52A0", size: 24, variant: "Button_Icon", disabled: false, tooltip: true, items: [] } },
  { component: "C-11", requiredProps: ["variant", "label", "checked", "disabled"], props: { variant: "standalone", label: "\u7981\u7528", value: "disabled", description: null, selectAllLabel: "\u5168\u9009", items: [], checked: false, mixed: false, disabled: false, error: false, errorMessage: null, orientation: "vertical", compact: true } },
  { component: "C-21", requiredProps: ["variant", "label", "value", "state"], props: { variant: "\u57FA\u7840\u8F93\u5165\u6846", size: "medium", state: "default", label: "\u9875\u9762\u540D\u79F0", value: "\u793A\u4F8B\u9875\u9762", placeholder: "\u8BF7\u8F93\u5165\u9875\u9762\u540D\u79F0", clearable: false, counter: false, maxLength: 2e3, borderless: false, password: false, prefixIcon: null, suffixIcon: null, infoTooltip: null, min: 0, max: 999, step: 1, prefixAddon: null, suffixAddon: null, tag: null, composite: null, auto: false } },
  { component: "C-23", requiredProps: ["variant", "items", "selected", "multiple", "state"], props: { variant: "\u57FA\u7840\u5355\u9009", items: ["small", "medium"], selected: ["medium"], multiple: false, open: false, placeholder: "\u8BF7\u9009\u62E9", clearable: false, searchable: false, creatable: false, query: "", size: "medium", state: "default", position: "bottom-left" } },
  { component: "C-41", requiredProps: ["variant", "items", "activeId", "ariaLabel"], props: { variant: "line", size: "medium", items: [{ id: "one", label: "\u7EC4\u4EF6", content: "\u5185\u5BB9", disabled: false, badge: null, closable: false }], panelContainer: null, activeId: "one", ariaLabel: "\u7F16\u8F91\u5668\u9875\u7B7E", activation: "automatic", addable: false, scrollable: false, overflowItems: [] } },
  { component: "C-42", requiredProps: ["variant", "type", "text"], props: { variant: "status", type: "status", size: "small", color: "green", text: "\u5DF2\u4FDD\u5B58", icon: null, avatar: null, closable: false, checkable: false, checked: false, loading: false, bordered: false, solid: false, disabled: false } },
  { component: "C-49", requiredProps: ["variant", "text", "closable"], props: { variant: "success", title: "", text: "\u64CD\u4F5C\u6210\u529F", action: null, closable: false, actionLayout: "inline", alignment: "start", icon: null } }
];
async function filesUnder(directory, prefix = "") {
  const output = [];
  for (const entry of await readdir3(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) output.push(...await filesUnder(path7.join(directory, entry.name), relative));
    else if (entry.isFile()) output.push(relative);
  }
  return output.sort();
}
async function atomicJson(file, value) {
  await mkdir4(path7.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${randomUUID3()}.tmp`;
  await writeFile4(temporary, JSON.stringify(value, null, 2), { mode: 384 });
  await rename2(temporary, file);
}
function safeRelative(relative) {
  if (!relative || path7.isAbsolute(relative) || relative.split(/[\\/]/).includes("..")) throw new DomainError("INVALID_LIBRARY_PATH", "\u7EC4\u4EF6\u5E93\u8D44\u6E90\u8DEF\u5F84\u65E0\u6548\u3002");
  return relative.replaceAll("\\", "/");
}
var ComponentLibraryManager = class {
  constructor(cacheDirectory, baselineDirectory) {
    this.cacheDirectory = cacheDirectory;
    this.baselineDirectory = baselineDirectory;
    this.settingsLock = new FilePersistence(cacheDirectory);
    this.snapshotsDirectory = path7.join(cacheDirectory, "snapshots");
    this.settingsFile = path7.join(cacheDirectory, "settings.json");
    this.validator = new RendererValidator(path7.join(cacheDirectory, "validation"), path7.resolve(baselineDirectory, "../../library-transport.bundle.js"));
  }
  cacheDirectory;
  baselineDirectory;
  snapshotsDirectory;
  settingsFile;
  validator;
  settingsLock;
  checked = /* @__PURE__ */ new Set();
  catalogs = /* @__PURE__ */ new Map();
  async initialize() {
    await mkdir4(this.snapshotsDirectory, { recursive: true });
    const before = await this.list();
    const bundled = await this.createSnapshot(this.baselineDirectory, "bundled", ["b2b-3.4.7"]);
    await this.settingsLock.withPageLock("library-settings", async () => {
      const previous = await this.readSettings();
      const legacyBindings = { ...previous?.legacyBindings };
      if (previous) delete previous.autoRefreshPageIds;
      for (const manifest of before.snapshots) for (const alias of manifest.aliases) legacyBindings[alias] ??= manifest.snapshotId;
      legacyBindings["b2b-3.4.7"] ??= bundled.snapshotId;
      await atomicJson(this.settingsFile, { ...previous, currentSnapshotId: previous && await this.has(previous.currentSnapshotId) ? previous.currentSnapshotId : bundled.snapshotId, legacyBindings });
    });
    return this.current();
  }
  async readSettings() {
    try {
      return JSON.parse(await readFile7(this.settingsFile, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }
  snapshotDirectory(snapshotId) {
    if (!/^b2b-[a-f0-9]{16}$/.test(snapshotId)) throw new DomainError("INVALID_LIBRARY_ID", "\u7EC4\u4EF6\u5E93\u5FEB\u7167\u6807\u8BC6\u65E0\u6548\u3002");
    return path7.join(this.snapshotsDirectory, snapshotId);
  }
  async has(snapshotId) {
    try {
      return (await stat3(path7.join(this.snapshotDirectory(snapshotId), "manifest.json"))).isFile();
    } catch {
      return false;
    }
  }
  async manifest(snapshotId) {
    try {
      return JSON.parse(await readFile7(path7.join(this.snapshotDirectory(snapshotId), "manifest.json"), "utf8"));
    } catch {
      throw new DomainError("LIBRARY_NOT_FOUND", `\u627E\u4E0D\u5230\u7EC4\u4EF6\u5E93\u5FEB\u7167 ${snapshotId}\u3002`);
    }
  }
  async current() {
    const settings = await this.readSettings();
    if (!settings) throw new DomainError("LIBRARY_NOT_INITIALIZED", "\u7EC4\u4EF6\u5E93\u5C1A\u672A\u521D\u59CB\u5316\u3002");
    return this.manifest(settings.currentSnapshotId);
  }
  async list() {
    const names = await readdir3(this.snapshotsDirectory);
    const manifests = [];
    for (const name of names) {
      if (await this.has(name)) manifests.push(await this.manifest(name));
    }
    const settings = await this.readSettings();
    return { currentSnapshotId: settings?.currentSnapshotId ?? null, sourcePath: settings?.sourcePath ?? null, snapshots: manifests.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  }
  async createSnapshot(sourceDirectory, sourceKind, aliases = []) {
    const source = path7.resolve(sourceDirectory);
    const files = (await filesUnder(source)).filter((file) => /^(components|foundations|styles|vendor)\//.test(file) && /\.(js|css|json|woff2?|ttf|png|jpe?g|webp|gif|svg)$/.test(file) || /^icons\/material-symbols\/variablefont\/.*\.woff2$/.test(file));
    const hash = createHash2("sha256"), contents = /* @__PURE__ */ new Map();
    for (const relative of files) {
      const data = await readFile7(path7.join(source, relative));
      contents.set(relative, data);
      hash.update(relative);
      hash.update(data);
    }
    const digest = hash.digest("hex");
    const snapshotId = `b2b-${digest.slice(0, 16)}`;
    if (await this.has(snapshotId)) {
      const manifest = await this.manifest(snapshotId);
      if (sourceKind === "local") await this.ensureCompatible(manifest);
      return manifest;
    }
    const temporary = path7.join(this.snapshotsDirectory, `.candidate-${randomUUID3()}`);
    await mkdir4(temporary, { recursive: true });
    try {
      for (const relative of files) {
        const target = path7.join(temporary, relative);
        await mkdir4(path7.dirname(target), { recursive: true });
        await writeFile4(target, contents.get(relative));
      }
      const loader = await readFile7(path7.join(temporary, "components/runtime/loader.js"), "utf8");
      const sourceVersion = loader.match(/sourceVersion\s*=\s*"([^"]+)"/)?.[1] ?? null;
      await this.validateProtocol(temporary);
      await this.validateRendering(temporary, files);
      const manifest = { libraryId: "b2b", snapshotId, sourceVersion, digest, adapterVersion: "page-builder-adapter-v2", createdAt: (/* @__PURE__ */ new Date()).toISOString(), sourceKind, sourcePath: sourceKind === "bundled" ? "bundled://page-builder" : source, files, aliases };
      await writeFile4(path7.join(temporary, "manifest.json"), JSON.stringify(manifest, null, 2));
      try {
        await rename2(temporary, this.snapshotDirectory(snapshotId));
      } catch (error) {
        if (!["EEXIST", "ENOTEMPTY"].includes(error.code || "") || !await this.has(snapshotId)) throw error;
        await rm(temporary, { recursive: true, force: true });
      }
      this.checked.add(snapshotId);
      return this.manifest(snapshotId);
    } catch (error) {
      await rm(temporary, { recursive: true, force: true });
      if (error instanceof DomainError) throw error;
      throw new DomainError("LIBRARY_INVALID_SOURCE", `\u7EC4\u4EF6\u5E93\u8D44\u6E90\u6216\u516C\u5F00\u534F\u8BAE\u65E0\u6548\uFF1A${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    }
  }
  async validateProtocol(directory) {
    const context = { window: { B2B: { components: {} } } };
    vm2.runInNewContext(await readFile7(path7.join(directory, "components/runtime/api-schema.js"), "utf8"), context, { timeout: 1e3 });
    const schemas = context.window.B2B.components.apiSchemas ?? {};
    for (const id of Object.keys(COMPONENTS)) if (!schemas[id]?.props) throw new DomainError("INCOMPATIBLE_LIBRARY", `${id} \u7F3A\u5C11\u516C\u5F00 props \u534F\u8BAE\u3002`);
    for (const editor of EDITOR_COMPONENTS) {
      const schema = schemas[editor.component];
      if (!schema?.props) throw new DomainError("INCOMPATIBLE_LIBRARY", `${editor.component} \u7F3A\u5C11\u7F16\u8F91\u5668\u516C\u5F00\u534F\u8BAE\u3002`);
      for (const prop of editor.requiredProps) if (!schema.props[prop]) throw new DomainError("INCOMPATIBLE_LIBRARY", `${editor.component}.${prop} \u5DF2\u4ECE\u7F16\u8F91\u5668\u534F\u8BAE\u79FB\u9664\u3002`);
    }
  }
  async validateRendering(directory, files) {
    const catalog = await readLibraryCatalog(directory);
    const requests = [...Object.values(catalog).map((item) => ({ component: item.id, props: item.defaults })), ...EDITOR_COMPONENTS.map(({ component, props }) => ({ component, props }))];
    try {
      await this.validator.check(directory, requests, files);
    } catch (error) {
      throw new DomainError("LIBRARY_RENDER_FAILED", error instanceof Error ? error.message.split("\n")[0].replace(/^page\.evaluate: (Error: )?/, "") : String(error));
    }
  }
  async ensureCompatible(manifest) {
    if (this.checked.has(manifest.snapshotId)) return;
    const directory = this.snapshotDirectory(manifest.snapshotId);
    await this.validateProtocol(directory);
    await this.validateRendering(directory, manifest.files);
    this.checked.add(manifest.snapshotId);
  }
  async catalog(snapshotId) {
    const id = snapshotId || (await this.current()).snapshotId;
    if (!this.catalogs.has(id)) this.catalogs.set(id, await readLibraryCatalog(this.snapshotDirectory(id)));
    return this.catalogs.get(id);
  }
  async catalogForPage(page) {
    return this.catalog((await this.resolvePage(page)).snapshotId);
  }
  async validatePage(page) {
    const requests = [];
    const visit = (node) => {
      if (node.kind === "layout") node.children.forEach(visit);
      else requests.push({ component: node.componentId, props: node.props });
    };
    visit(page.root);
    if (requests.length) try {
      await this.validator.check(await this.directoryForPage(page), requests);
    } catch (error) {
      throw new DomainError("INVALID_PROP_COMBINATION", error instanceof Error ? error.message.split("\n")[0].replace(/^page\.evaluate: (Error: )?/, "") : String(error));
    }
  }
  async close() {
    await this.validator.close();
  }
  async check(sourcePath) {
    const settings = await this.readSettings();
    const source = sourcePath || settings?.sourcePath;
    if (!source) throw new DomainError("LIBRARY_SOURCE_REQUIRED", "\u5C1A\u672A\u914D\u7F6E\u7EC4\u4EF6\u5E93\u6765\u6E90\uFF0C\u8BF7\u63D0\u4F9B design-source \u76EE\u5F55\u8DEF\u5F84\u3002");
    const candidate = await this.createSnapshot(source, "local");
    const current = await this.current();
    return { current, candidate, updateAvailable: current.snapshotId !== candidate.snapshotId };
  }
  async apply(snapshotId, sourcePath) {
    const manifest = await this.manifest(snapshotId);
    await this.ensureCompatible(manifest);
    return this.settingsLock.withPageLock("library-settings", async () => {
      const previous = await this.current();
      const settings = await this.readSettings();
      await atomicJson(this.settingsFile, { ...settings, currentSnapshotId: snapshotId, sourcePath: sourcePath || (manifest.sourceKind === "local" ? manifest.sourcePath : settings?.sourcePath) });
      return { previous, current: manifest };
    });
  }
  async binding(snapshotId) {
    const manifest = snapshotId ? await this.manifest(snapshotId) : await this.current();
    return { libraryId: manifest.libraryId, snapshotId: manifest.snapshotId, sourceVersion: manifest.sourceVersion, digest: manifest.digest, adapterVersion: manifest.adapterVersion };
  }
  async resolvePage(page) {
    if (page.componentLibrary) return this.manifest(page.componentLibrary.snapshotId);
    const settings = await this.readSettings();
    const pinned = settings?.legacyBindings?.[page.componentLibraryVersion];
    if (pinned) return this.manifest(pinned);
    const state = await this.list();
    const legacy = state.snapshots.find((item) => item.aliases.includes(page.componentLibraryVersion) || item.sourceVersion === page.componentLibraryVersion);
    if (!legacy) throw new DomainError("PAGE_LIBRARY_MISSING", `\u9875\u9762\u7ED1\u5B9A\u7684\u7EC4\u4EF6\u5E93 ${page.componentLibraryVersion} \u4E0D\u5728\u672C\u673A\u5FEB\u7167\u4E2D\u3002`);
    return legacy;
  }
  async directoryForPage(page) {
    return this.snapshotDirectory((await this.resolvePage(page)).snapshotId);
  }
  async asset(snapshotId, relative) {
    const resolved = path7.resolve(this.snapshotDirectory(snapshotId), safeRelative(relative));
    const root2 = this.snapshotDirectory(snapshotId);
    if (!resolved.startsWith(`${root2}${path7.sep}`)) throw new DomainError("INVALID_LIBRARY_PATH", "\u7EC4\u4EF6\u5E93\u8D44\u6E90\u8DEF\u5F84\u65E0\u6548\u3002");
    return resolved;
  }
};

// src/standalone.ts
var root = path8.dirname(fileURLToPath(import.meta.url));
var build = JSON.parse(await readFile8(path8.join(root, "build.json"), "utf8"));
var dataDirectory = process.env.PAGE_BUILDER_DATA_DIR || await mkdtemp(path8.join(tmpdir(), "page-builder-data-"));
var exportDirectory = process.env.PAGE_BUILDER_EXPORT_DIR || await mkdtemp(path8.join(tmpdir(), "page-builder-export-"));
var libraryCacheDirectory = process.env.PAGE_BUILDER_LIBRARY_DIR || await mkdtemp(path8.join(tmpdir(), "page-builder-libraries-"));
var libraries = new ComponentLibraryManager(libraryCacheDirectory, path8.join(root, "ui", "vendor/b2b"));
await libraries.initialize();
var store = new PageStore(new FilePersistence(dataDirectory), () => libraries.binding(), libraries);
await store.load();
var server = createEditorServer(store, path8.join(root, "ui"), exportDirectory, { pluginVersion: build.pluginVersion, provider: "b2b-production", serverName: "page-builder-development-standalone" }, libraries);
var url = await server.start();
console.log(url);
for (const signal of ["SIGTERM", "SIGINT"]) process.once(signal, () => Promise.all([server.close(), libraries.close()]).finally(() => process.exit(0)));
//# sourceMappingURL=standalone.js.map
