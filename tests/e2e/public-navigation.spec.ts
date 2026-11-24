import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('links de seção, recarga e histórico acompanham a navegação entre site e portal', async ({ page }) => {
  const publicURL = '/?view=public#regionais';
  await page.goto(publicURL);
  const regions = page.locator('#regionais');
  await expect.poll(() => regions.evaluate(section => Math.abs(section.getBoundingClientRect().top))).toBeLessThan(130);

  await page.getByRole('button', { name: 'Portal da Liderança', exact: true }).first().click();
  await expect(page).toHaveURL(url => !url.searchParams.has('view') && !url.hash);
  await page.reload();
  await expect(page.getByLabel('E-mail Ministerial')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);

  await page.goBack();
  await expect(page).toHaveURL(url => url.searchParams.get('view') === 'public' && url.hash === '#regionais');
  await expect.poll(() => regions.evaluate(section => Math.abs(section.getBoundingClientRect().top))).toBeLessThan(130);
  await page.goForward();
  await expect(page.getByLabel('E-mail Ministerial')).toBeVisible();

  await page.getByRole('button', { name: 'Voltar ao Site Público' }).click();
  await expect(page).toHaveURL(url => url.searchParams.get('view') === 'public' && !url.hash);
  await expect(page.locator('#movement-title')).toBeInViewport();
});
