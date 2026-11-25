import { expect, test } from '@playwright/test';

test('super-admin searches accounts and focuses the editor on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.addInitScript(() => localStorage.setItem('sfg_auth_token', 'owner-fixture'));
  await page.route('**/api/auth/me', route => route.fulfill({
    json: { user: { id: 'platform-owner', name: 'Proprietário', role: 'global_admin' } },
  }));
  await page.route('**/api/config-admin/users', route => route.fulfill({
    json: [
      { id: 'one', name: 'Maria Regional', email: 'maria@example.com', role: 'regional_coordinator', regionId: 'sp' },
      { id: 'two', name: 'João Mídia', email: 'joao@example.com', role: 'media_team', active: false },
    ],
  }));
  await page.route('**/api/regions', route => route.fulfill({ json: [{ id: 'sp', name: 'São Paulo' }] }));
  await page.goto('/admin/config');
  await expect(page.getByRole('heading', { name: 'Gestão de usuários' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar usuário' }).fill('maria');
  await expect(page.getByText('João Mídia', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar Maria Regional' }).click();
  await expect(page.getByRole('heading', { name: 'Editar conta' })).toBeFocused();
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Maria Regional');
  await expect(page.getByLabel('Regional', { exact: true })).toHaveValue('sp');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
