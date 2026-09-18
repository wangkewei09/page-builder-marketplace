// Variant dependencies from the public C-21 Renderer, not visual presets.
export function inputVariantPatch(props: Record<string, any>, variant: string) {
  const original = props.variant === "组合输入框" ? (props.composite?.segments || []).map((item: any) => item.value).filter(Boolean).join(" ") : props.value ?? "";
  const patch: Record<string, any> = { variant, value: String(original), clearable: false, counter: false, borderless: false, password: false, prefixIcon: null, suffixIcon: null, infoTooltip: null, prefixAddon: null, suffixAddon: null, tag: null, composite: null, auto: false };
  if (variant === "基础输入框") patch.clearable = true;
  if (variant === "带图标输入框") { patch.prefixIcon = props.prefixIcon || "search"; patch.clearable = true; }
  if (variant === "数字输入框") {
    const value = original === "" ? "" : Number(original);
    if (value !== "" && (!Number.isFinite(value) || value < props.min || value > props.max)) throw new Error("当前内容不能转换为范围内数字，请先修改内容或范围。");
    patch.value = value;
  }
  if (variant === "带属性输入框") patch.prefixAddon = { id: "prefix", type: "text", text: props.label || "内容" };
  if (variant === "组合输入框") {
    patch.value = "";
    patch.composite = { appearance: "filled", segments: [{ id: "first", label: props.label || "内容", value: String(original), placeholder: props.placeholder || "请输入" }, { id: "second", label: "补充内容", value: "", placeholder: "请输入" }], select: null };
  }
  if (variant === "长文本输入框") { patch.size = "medium"; patch.maxLength = 240; }
  return patch;
}
