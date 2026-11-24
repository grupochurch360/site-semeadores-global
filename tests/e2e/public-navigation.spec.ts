import { expect, test } from '@playwright/test';

test('home pública e acesso administrativo direto, com recarga e histórico', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Semeadoresde Fogo.');
  await expect(page.getByText(/Portal da Liderança|Assistir ao filme|Encontre sua regional|Escola de formação/i)).toHaveCount(0);
  await expect(page.locator('a[href*="admin"]')).toHaveCount(0);
  await page.goto('/admin/');
  await page.reload();
  await expect(page.getByLabel('E-mail Ministerial')).toBeVisible();
  await page.getByRole('button', { name: 'Voltar ao Site Público' }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page.getByLabel('E-mail Ministerial')).toBeVisible();
});

for (const width of [360, 768]) {
  test('três fotos acompanham a rolagem em ambos os sentidos a ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/#missao');
    await page.reload();
    const photos = page.locator('.mission-photos img');
    for (const img of await photos.all()) await img.evaluate((el: HTMLImageElement) => el.decode());
    for (const [progress, second, third] of [[0,0,0],[.5,1,0],[1,1,1],[0,0,0]]) {
      await page.locator('.mission-hero').evaluate((el, fraction) => {
        const frame = el.firstElementChild as HTMLElement;
        window.scrollTo({top: scrollY + el.getBoundingClientRect().top - parseFloat(getComputedStyle(frame).top) + (el.clientHeight-frame.clientHeight)*fraction, behavior:'instant'});
      }, progress);
      await expect(photos.nth(1)).toHaveCSS('opacity', String(second));
      await expect(photos.nth(2)).toHaveCSS('opacity', String(third));
      await expect.poll(() => page.locator('.mission-hero .street-stage').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(64);
    }
  });
}
for (const width of [1024, 1920, 2560]) {
  test('desktop exibe a fotografia inteira a ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({width, height:900});
    await page.goto('/');
    const photo = page.locator('.desktop-blessing');
    await expect(photo).toBeVisible();
    const bounds = (await photo.boundingBox())!;
    const panel = (await page.locator('.street-layout').boundingBox())!;
    expect(panel.x).toBe(0);
    expect(Math.abs(panel.width - bounds.x)).toBeLessThan(1);
    expect(Math.abs(panel.height - bounds.height)).toBeLessThan(1);
    expect(Math.abs(bounds.height - bounds.width * 941 / 1672)).toBeLessThan(1);
    await expect(photo).toHaveCSS('background-size', 'cover');
    await expect(photo).toHaveCSS('background-image', /bencao-noturna.webp/);
    await expect(page.locator('.mission-photos')).toBeHidden();
  });
}
