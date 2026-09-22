// Follow the user-visible canvas content entry point; wait for the source control
// to finish mounting and taking focus before filling it (Playwright fill ignores inert).
export async function openInline(surface, label) {
  await surface.locator('#inspector:not([inert])').getByRole('button', { name: `编辑${label}`, exact: true }).click();
  await surface.locator('.inline-editor[data-ready="true"]').waitFor();
  return surface.locator('.inline-editor input,.inline-editor textarea');
}
export async function editInline(surface, label, value) {
  const input = await openInline(surface, label); await input.fill(value);
  await input.press(await input.evaluate(el => el.tagName === 'TEXTAREA') ? 'Meta+Enter' : 'Enter');
  await surface.locator('.inline-editor').waitFor({ state: 'detached' });
}
