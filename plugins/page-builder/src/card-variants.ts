// Companion data for the public C-34 Renderer. No alternate card markup/styles.
export function cardVariantPatch(props: Record<string, any>, variant: string) {
  if (["meta", "actions"].includes(variant) && !props.coverImage) throw new Error("此变体需要封面图片，请先填写“媒体图片地址”，再切换变体。");
  const patch: Record<string, any> = { variant, selected: false, loading: false, avatar: null, items: [], tabs: [], activeTabId: null, actions: [] };
  if (["compact", "meta", "actions"].includes(variant)) patch.avatar = props.avatar || { text: String(props.title || "卡").slice(0, 1), image: null, fallback: "卡", label: "卡片头像" };
  if (["external-grid", "content-grid", "nested"].includes(variant)) patch.items = props.items?.length ? props.items : [{ id: "item-1", title: props.title || "卡片标题", body: props.body || "", meta: props.meta || "" }];
  if (variant === "tabs") {
    patch.tabs = props.tabs?.length ? props.tabs : [{ id: "tab-1", label: "详情", content: props.body || "" }, { id: "tab-2", label: "补充信息", content: "" }];
    patch.activeTabId = patch.tabs.some((tab: any) => tab.id === props.activeTabId) ? props.activeTabId : patch.tabs[0].id;
  }
  if (variant === "actions") patch.actions = props.actions?.length ? props.actions : [{ id: "edit", label: "编辑", icon: "edit" }];
  if (variant === "interactive") Object.assign(patch, { appearance: "bordered", hoverable: true, extraActionLabel: null, footerActionLabel: null });
  return patch;
}

export function assertCardStructure(props: Record<string, any>) {
  const nonempty = (value: any) => typeof value === "string" && Boolean(value.trim());
  const require = (valid: any, message: string) => { if (!valid) throw new Error(message); };
  const entries = (key: string, keys: string[], check: (item: any) => boolean) => {
    require(Array.isArray(props[key]), `${key} 必须是列表。`);
    for (const item of props[key]) require(item && typeof item === "object" && Object.keys(item).every(k => keys.includes(k)) && nonempty(item.id) && check(item), `${key} 的条目字段不完整或不合法。`);
    require(new Set(props[key].map((item: any) => item.id)).size === props[key].length, `${key} 的标识不能重复。`);
  };
  const optionalLabel = (value: any) => value == null || nonempty(value);
  entries("items", ["id", "title", "body", "meta", "appearance", "hoverable", "actionLabel"], i => nonempty(i.title) && typeof i.body === "string" && (i.meta === undefined || typeof i.meta === "string") && (i.appearance === undefined || ["bordered", "borderless"].includes(i.appearance)) && (i.hoverable === undefined || typeof i.hoverable === "boolean") && optionalLabel(i.actionLabel));
  entries("tabs", ["id", "label", "content", "disabled"], i => nonempty(i.label) && typeof i.content === "string" && (i.disabled === undefined || typeof i.disabled === "boolean"));
  entries("actions", ["id", "label", "icon"], i => nonempty(i.label) && nonempty(i.icon));
  if (props.avatar !== null) {
    const a = props.avatar;
    require(a && Object.keys(a).every(k => ["text", "image", "fallback", "label"].includes(k)) && typeof a.text === "string" && (a.image === null || nonempty(a.image)) && nonempty(a.fallback) && nonempty(a.label), "头像字段不完整。");
  }
  require(Number.isInteger(props.columns) && props.columns >= 2 && props.columns <= 4, "卡片列数必须为 2–4。");
  require(nonempty(props.icon) && optionalLabel(props.coverImage) && optionalLabel(props.extraActionLabel) && optionalLabel(props.footerActionLabel), "图片、图标或操作文字不合法。");
  require(props.variant === "tabs" ? props.tabs.some((tab: any) => tab.id === props.activeTabId) : props.activeTabId === null, "当前页签必须指向已有页签，且仅用于 tabs 变体。");
  require(!props.loading || (props.variant !== "interactive" && !props.extraActionLabel && !props.footerActionLabel && !props.actions.length), "加载状态不能同时包含交互操作。");
}
