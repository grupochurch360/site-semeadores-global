import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('diagnóstico mobile oferece uma prévia contínua e baixa um PDF real', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/admin');
  await page
    .getByLabel('E-mail Ministerial')
    .fill('lucas@semeadoresdefogo.org');
  await page.getByLabel('Senha', { exact: true }).fill('Semeadores@2026');
  await page.getByRole('button', { name: 'Entrar no Portal' }).click();
  await page
    .getByRole('button', { name: 'Diagnóstico IA dos Relatórios' })
    .click();
  const preview = page.getByRole('dialog');
  await expect(
    preview.getByRole('heading', { name: 'Resumo executivo' }),
  ).toBeVisible({ timeout: 60000 });
  await expect(preview.getByText(/Baixar HTML|Copiar Texto/)).toHaveCount(0);
  expect(await preview.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  const pdf = page.waitForEvent('download');
  await preview.getByRole('button', { name: 'Baixar PDF' }).click();
  const download = await pdf;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(
    (await readFile((await download.path())!)).subarray(0, 5).toString(),
  ).toBe('%PDF-');
});
