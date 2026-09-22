// Follow the user-visible content entry point. The editable is the original
// canvas text element/native input, never a separately mounted editor.
export const inlineSelector = '#canvas [data-pb-inline-edit]';
export async function inlineValue(control) {
  return control.evaluate(el => el.matches('input,textarea') ? el.value : el.innerText);
}
export async function openInline(surface, label) {
  await surface.locator('#inspector:not([inert])').getByRole('button', { name: `编辑${label}`, exact: true }).click();
  const control = surface.locator(inlineSelector); await control.waitFor();
  return control;
}
export async function editInline(surface, label, value) {
  const control = await openInline(surface, label); await control.fill(value);
  await control.press(await control.getAttribute('data-pb-inline-edit') === 'textarea' ? 'Meta+Enter' : 'Enter');
  await control.waitFor({ state: 'detached' });
  await surface.locator('#inspector:not([inert])').waitFor({ state: 'attached' });
}
