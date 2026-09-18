// Caller-owned option content is preserved; required companion state is sourced from the library.
export function selectVariantPatch(props: Record<string, any>, variant: string, defaults: Record<string, any>) {
  const plain = (props.items || []).filter((item: any) => typeof item === "string" || !item.group).map((item: any) => typeof item === "string" ? item : item.label);
  let items: any[] = plain;
  if (["自定义选项", "复杂内容"].includes(variant)) items = plain.map((label: string) => {
    const original = props.items.find((item: any) => typeof item === "object" && item.label === label);
    return { label, ...(original || {}), description: original?.description || label };
  });
  if (variant === "分组选项") items = [{ group: props.placeholder || "选项" }, ...plain];
  const multiple = Boolean(defaults.multiple);
  return { ...defaults, variant, items, selected: multiple ? props.selected : props.selected.slice(0, 1), open: false, query: "", state: ["loading", "no-result"].includes(props.state) ? "default" : props.state };
}
