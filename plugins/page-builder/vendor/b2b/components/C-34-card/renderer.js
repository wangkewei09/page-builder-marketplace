(function registerCardRenderer(global) {
  "use strict";

  var components = global.B2B.components;
  var runtime = components.runtime;
  var adapter = components.canonicalAdapter;
  var VARIANTS = ["basic", "compact", "cover", "meta", "external-grid", "content-grid", "nested", "tabs", "actions", "interactive"];
  var APPEARANCES = ["bordered", "borderless"];
  var SIZES = ["default", "small"];
  var ITEM_KEYS = ["id", "title", "body", "meta", "appearance", "hoverable", "actionLabel"];
  var TAB_KEYS = ["id", "label", "content", "disabled"];
  var ACTION_KEYS = ["id", "label", "icon"];
  var AVATAR_KEYS = ["text", "image", "fallback", "label"];

  function own(value, key) { return Object.prototype.hasOwnProperty.call(value, key); }
  function object(value, label) { runtime.assert(value && Object.prototype.toString.call(value) === "[object Object]", label + " must be an object"); }
  function exactKeys(value, keys, label) {
    object(value, label);
    var unknown = Object.keys(value).filter(function (key) { return keys.indexOf(key) < 0; });
    runtime.assert(!unknown.length, label + " received unsupported fields: " + unknown.join(", "));
  }
  function nonEmpty(value, label) { runtime.assert(typeof value === "string" && value.trim(), label + " must be a non-empty string"); }
  function optionalLabel(value, label) { runtime.assert(value === null || typeof value === "string" && value.trim(), label + " must be null or a non-empty string"); }

  function assertItem(item, index) {
    var label = "C-34 items[" + index + "]";
    exactKeys(item, ITEM_KEYS, label);
    nonEmpty(item.id, label + ".id"); nonEmpty(item.title, label + ".title");
    runtime.assert(typeof item.body === "string", label + ".body must be a string");
    runtime.assert(item.meta === undefined || typeof item.meta === "string", label + ".meta must be a string");
    runtime.assert(item.appearance === undefined || APPEARANCES.indexOf(item.appearance) >= 0, label + ".appearance is invalid");
    runtime.assert(item.hoverable === undefined || typeof item.hoverable === "boolean", label + ".hoverable must be boolean");
    optionalLabel(item.actionLabel === undefined ? null : item.actionLabel, label + ".actionLabel");
  }
  function assertTab(tab, index) {
    var label = "C-34 tabs[" + index + "]";
    exactKeys(tab, TAB_KEYS, label);
    nonEmpty(tab.id, label + ".id"); nonEmpty(tab.label, label + ".label");
    runtime.assert(typeof tab.content === "string", label + ".content must be a string");
    runtime.assert(tab.disabled === undefined || typeof tab.disabled === "boolean", label + ".disabled must be boolean");
  }
  function assertAction(action, index) {
    var label = "C-34 actions[" + index + "]";
    exactKeys(action, ACTION_KEYS, label);
    nonEmpty(action.id, label + ".id"); nonEmpty(action.label, label + ".label"); nonEmpty(action.icon, label + ".icon");
  }
  function assertAvatar(avatar) {
    if (avatar === null) return;
    exactKeys(avatar, AVATAR_KEYS, "C-34 avatar");
    nonEmpty(avatar.label, "C-34 avatar.label");
    runtime.assert(typeof avatar.text === "string", "C-34 avatar.text must be a string");
    runtime.assert(avatar.image === null || typeof avatar.image === "string" && avatar.image.trim(), "C-34 avatar.image must be null or a URL string");
    nonEmpty(avatar.fallback, "C-34 avatar.fallback");
  }

  function assertProps(props) {
    runtime.assertEnum(props.variant, VARIANTS, "C-34 card.variant");
    runtime.assertEnum(props.appearance, APPEARANCES, "C-34 card.appearance");
    runtime.assertEnum(props.size, SIZES, "C-34 card.size");
    ["title", "body", "meta", "icon", "coverAlt"].forEach(function (key) { runtime.assert(typeof props[key] === "string", "C-34 card." + key + " must be a string"); });
    nonEmpty(props.icon, "C-34 card.icon");
    runtime.assert(props.coverImage === null || typeof props.coverImage === "string" && props.coverImage.trim(), "C-34 card.coverImage must be null or a URL string");
    ["hoverable", "selected", "loading"].forEach(function (key) { runtime.assert(typeof props[key] === "boolean", "C-34 card." + key + " must be boolean"); });
    optionalLabel(props.extraActionLabel, "C-34 card.extraActionLabel"); optionalLabel(props.footerActionLabel, "C-34 card.footerActionLabel");
    runtime.assert(Array.isArray(props.items) && Array.isArray(props.tabs) && Array.isArray(props.actions), "C-34 items/tabs/actions must be arrays");
    props.items.forEach(assertItem); props.tabs.forEach(assertTab); props.actions.forEach(assertAction); assertAvatar(props.avatar);
    runtime.assert(Number.isInteger(props.columns) && props.columns >= 2 && props.columns <= 4, "C-34 columns must be an integer from 2 to 4");
    runtime.assert(props.activeTabId === null || typeof props.activeTabId === "string" && props.activeTabId.trim(), "C-34 activeTabId must be null or a non-empty string");
    var ids = props.items.map(function (item) { return item.id; });
    runtime.assert(new Set(ids).size === ids.length, "C-34 item ids must be unique");
    var tabIds = props.tabs.map(function (item) { return item.id; });
    runtime.assert(new Set(tabIds).size === tabIds.length, "C-34 tab ids must be unique");
    var actionIds = props.actions.map(function (item) { return item.id; });
    runtime.assert(new Set(actionIds).size === actionIds.length, "C-34 action ids must be unique");

    var itemVariant = ["external-grid", "content-grid", "nested"].indexOf(props.variant) >= 0;
    runtime.assert(itemVariant ? props.items.length > 0 : props.items.length === 0, "C-34 items are required only by grid and nested variants");
    runtime.assert(props.variant === "tabs" ? props.tabs.length > 0 : props.tabs.length === 0, "C-34 tabs are required only by tabs variant");
    runtime.assert(props.variant === "actions" ? props.actions.length > 0 : props.actions.length === 0, "C-34 actions are required only by actions variant");
    runtime.assert(["compact", "meta", "actions"].indexOf(props.variant) >= 0 ? props.avatar !== null : props.avatar === null, "C-34 avatar is required only by compact/meta/actions variants");
    runtime.assert(["meta", "actions"].indexOf(props.variant) < 0 || props.coverImage !== null, "C-34 meta/actions require coverImage");
    runtime.assert(props.variant === "tabs" ? props.activeTabId !== null && tabIds.indexOf(props.activeTabId) >= 0 : props.activeTabId === null, "C-34 activeTabId is required only by tabs and must identify a tab");
    runtime.assert(props.variant !== "interactive" || props.appearance === "bordered" && props.hoverable && !props.loading && !props.extraActionLabel && !props.footerActionLabel, "C-34 interactive requires bordered/hoverable and forbids loading or nested actions");
    runtime.assert(props.variant === "interactive" || !props.selected, "C-34 selected is interactive-only");
    runtime.assert(!props.loading || props.variant !== "interactive" && !props.extraActionLabel && !props.footerActionLabel && !props.actions.length, "C-34 loading forbids interactive and actions");
    return props;
  }

  function safe(value) {
    if (typeof value === "string") return adapter.escapeHtml(value);
    if (Array.isArray(value)) return value.map(safe);
    if (value && Object.prototype.toString.call(value) === "[object Object]") { var out = {}; Object.keys(value).forEach(function (key) { out[key] = safe(value[key]); }); return out; }
    return value;
  }
  function factory() { return global.B2BDesignSource.componentFactories || global.B2BDesignSource.componentSpecimenHelpers; }
  function parse(props) {
    var template = document.createElement("template");
    template.innerHTML = factory().sourceCard(safe(props)).trim();
    var root = template.content.firstElementChild;
    root.setAttribute("data-component-reference", "C-34"); root.setAttribute("data-component-renderer", "card");
    return root;
  }
  function replaceRoot(root, next) {
    Array.from(root.attributes).forEach(function (attribute) { root.removeAttribute(attribute.name); });
    Array.from(next.attributes).forEach(function (attribute) { root.setAttribute(attribute.name, attribute.value); });
    root.replaceChildren.apply(root, Array.from(next.childNodes));
  }

  function child(apiName, props, target, children) {
    var api = components[apiName]; runtime.assert(api, "C-34 composition requires loaded " + apiName + " Renderer");
    var instance = api.create(props); instance.mount(target); children.push(instance); return instance;
  }
  function avatarProps(value) {
    return { variant: value.image ? "image" : "text", text: value.text, image: value.image, fallback: value.fallback, icon: null, topBadge: null, primaryText: "", secondaryText: "", size: 24, label: value.label, shape: "round", loading: false, status: "online", items: [], maxVisible: 5, expanded: false };
  }
  function textAction(label, slot, children) {
    if (!label || !slot) return;
    child("textButton", { label: label, variant: "Button_Text", tone: "primary", leadingIcon: null, trailingArrow: null, href: null, disabled: false }, slot, children);
  }
  function cardChildProps(item, appearance, size) {
    return { variant: "basic", appearance: item.appearance || appearance, size: size, title: item.title, body: item.body, meta: item.meta || "", icon: "description", hoverable: Boolean(item.hoverable), selected: false, loading: false, extraActionLabel: item.actionLabel || null, footerActionLabel: null, coverImage: null, coverAlt: "", avatar: null, items: [], columns: 2, tabs: [], activeTabId: null, actions: [] };
  }

  function mountChildren(root, props, children) {
    if (props.loading) {
      child("loading", { variant: "skeleton", size: "medium", text: false, layout: "card", avatar: props.variant === "meta" || props.variant === "actions", image: props.variant === "cover" || props.variant === "meta" || props.variant === "actions", inverse: false, neutral: false }, root.querySelector('[data-card-slot="loading"]'), children);
      return;
    }
    textAction(props.extraActionLabel, root.querySelector('[data-card-slot="extra"]'), children);
    textAction(props.footerActionLabel, root.querySelector('[data-card-slot="footer"]'), children);
    if (props.variant === "compact") {
      child("avatar", avatarProps(props.avatar), root.querySelector('[data-card-slot="avatar"]'), children);
      textAction(props.extraActionLabel, root.querySelector('[data-card-slot="compact-action"]'), children);
    }
    if (props.variant === "meta" || props.variant === "actions") {
      child("avatar", avatarProps(props.avatar), root.querySelector('[data-card-slot="avatar"]'), children);
      if (props.variant === "actions") {
        child("iconButton", { variant: "icon group", icon: props.actions[0].icon, label: "卡片操作", size: 28, disabled: false, tooltip: false, items: props.actions.map(function (action) { return { icon: action.icon, label: action.label, selected: false, disabled: false }; }) }, root.querySelector('[data-card-slot="actions"]'), children);
      }
    }
    if (["external-grid", "content-grid", "nested"].indexOf(props.variant) >= 0) {
      props.items.forEach(function (item, index) {
        var appearance = props.variant === "content-grid" ? "borderless" : "bordered";
        child("card", cardChildProps(item, appearance, props.size), root.querySelector('[data-card-child-slot="' + index + '"]'), children);
      });
    }
    if (props.variant === "tabs") {
      child("tabs", { variant: "line", size: props.size === "small" ? "small" : "medium", items: props.tabs, overflowItems: [], activeId: props.activeTabId, ariaLabel: props.title, activation: "automatic", addable: false, scrollable: true }, root.querySelector('[data-card-slot="tabs"]'), children);
    }
  }

  runtime.define({
    id: "C-34", name: "card",
    styles: ["C-03-text-button/styles.css", "C-04-icon-button/styles.css", "C-32-avatar/styles.css", "C-33-badge/styles.css", "C-41-tabs/styles.css", "C-44-tooltip/styles.css", "C-47-loading/styles.css", "C-34-card/styles.css"],
    contract: components.contracts && components.contracts["C-34"], api: components.apiSchemas && components.apiSchemas["C-34"],
    create: function createCard(input) {
      var props = runtime.resolveProps("C-34", input || {}, {
        variant: "basic", appearance: "bordered", size: "default", title: "Card title", body: "Card content", meta: "", icon: "description", hoverable: false, selected: false, loading: false, extraActionLabel: null, footerActionLabel: null, coverImage: null, coverAlt: "", avatar: null, items: [], columns: 3, tabs: [], activeTabId: null, actions: []
      });
      assertProps(props);
      var root = parse(props); var children = []; var mounted = false; var activationTimer = 0; var current = Object.assign({}, props);
      function destroyChildren() { children.splice(0).reverse().forEach(function (instance) { instance.destroy(); }); }
      function onChildEvent(event) {
        var owner = event.target.closest && event.target.closest("[data-component-reference='C-34']");
        if (owner !== root) return;
        if (event.type === "b2b:text-activate") runtime.emit(root, "b2b:card-action", { variant: current.variant, kind: "text", label: event.detail && event.detail.label });
        if (event.type === "b2b:icon-activate") { var index = event.detail && event.detail.index || 0; runtime.emit(root, "b2b:card-action", { variant: current.variant, kind: "icon", id: current.actions[index] && current.actions[index].id, label: current.actions[index] && current.actions[index].label }); }
        if (event.type === "b2b:tabs-change") runtime.emit(root, "b2b:card-tab-change", { variant: current.variant, activeTabId: event.detail && (event.detail.activeId || event.detail.id), source: event.detail && event.detail.source });
      }
      function activate() {
        if (current.variant !== "interactive") return;
        global.clearTimeout(activationTimer);
        activationTimer = global.setTimeout(function () {
          var selected = root.getAttribute("aria-pressed") === "true";
          current.selected = selected;
          runtime.emit(root, "b2b:card-activate", { variant: current.variant, selected: selected });
          runtime.emit(root, "b2b:card-selection-change", { variant: current.variant, selected: selected });
        }, 0);
      }
      root.addEventListener("click", function (event) { if (event.target === root || current.variant === "interactive") activate(); });
      ["b2b:text-activate", "b2b:icon-activate", "b2b:tabs-change"].forEach(function (name) { root.addEventListener(name, onChildEvent); });
      root.addEventListener("error", function (event) { if (event.target.matches && event.target.matches("[data-card-media] img")) { event.target.hidden = true; root.querySelector(".card-media-fallback").hidden = false; runtime.emit(root, "b2b:card-media-fallback", { variant: current.variant, src: current.coverImage }); } }, true);
      return runtime.createInstance(root, {
        onMount: function () { mounted = true; mountChildren(root, current, children); return function () { global.clearTimeout(activationTimer); destroyChildren(); }; },
        update: function (next) {
          var candidate = Object.assign({}, current, next || {}); assertProps(candidate); var replacement = parse(candidate);
          runtime.assert(root.tagName === replacement.tagName, "C-34 update cannot change root tag; destroy/recreate when switching to or from external-grid/interactive");
          global.clearTimeout(activationTimer); destroyChildren(); replaceRoot(root, replacement); current = candidate; if (mounted) mountChildren(root, current, children);
        },
        validate: function () {
          var errors = []; assertProps(current);
          if (root.getAttribute("data-card-variant") !== current.variant) errors.push("C-34 variant marker mismatch");
          if (current.variant === "interactive" && !root.matches("button[data-card-interactive][aria-pressed]")) errors.push("C-34 interactive anatomy missing");
          if (current.loading && root.querySelectorAll("[data-component-reference='C-47']").length !== 1) errors.push("C-34 loading must compose exactly one C-47");
          if (["compact", "meta", "actions"].indexOf(current.variant) >= 0 && !current.loading && root.querySelectorAll("[data-component-reference='C-32']").length !== 1) errors.push("C-34 avatar composition mismatch");
          if (current.variant === "tabs" && !current.loading && root.querySelectorAll("[data-component-reference='C-41']").length !== 1) errors.push("C-34 tabs composition mismatch");
          if (current.variant === "actions" && !current.loading && root.querySelectorAll("[data-component-reference='C-04']").length !== 1) errors.push("C-34 actions composition mismatch");
          if (["external-grid", "content-grid", "nested"].indexOf(current.variant) >= 0 && !current.loading && root.querySelectorAll("[data-card-child-slot] > [data-component-reference='C-34']").length !== current.items.length) errors.push("C-34 child card composition mismatch");
          if (children.some(function (instance) { return !instance.validate().valid; })) errors.push("C-34 child Renderer validation failed");
          return errors;
        }
      });
    }
  });
})(window);
