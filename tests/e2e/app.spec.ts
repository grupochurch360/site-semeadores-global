import { test, expect } from '@playwright/test';

test.describe('Semeadores de Fogo Global — Autenticação, Menu Limpo e Isolamento', () => {
  test('exibe tela de login ao entrar sem sessão e permite acessar o site público', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Portal da Liderança')).toBeVisible();
    await expect(page.getByLabel('E-mail Ministerial')).toBeVisible();

    await page.getByRole('button', { name: 'Voltar ao Site Público' }).click();
    await expect(page.getByText('Semeadores de Fogo').first()).toBeVisible();
  });

  test('login como Direção Global exibe apenas os módulos essenciais no menu lateral', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('E-mail Ministerial').fill('lucas@semeadoresdefogo.org');
    await page.getByLabel('Senha').fill('Semeadores@2026');
    await page.getByRole('button', { name: 'Entrar no Portal' }).click();

    await expect(page.getByText('Painel Geral de Supervisão Ministerial')).toBeVisible();

    // Módulos mantidos
    await expect(page.getByRole('button', { name: 'Dashboard Global' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Regionais' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Evangelismos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Relatórios Bimestrais' })).toBeVisible();

    // Módulos removidos não podem existir
    for (const removed of [
      'Indicadores & Metas',
      'Consolidação (LGPD)',
      'Cruzadas & Eventos',
      'Cursos & Ensino',
      'Alunos & Certificados',
      'Departamentos & Tarefas',
      'Reuniões de Alinhamento',
      'Mídia & Identidade Oficial',
      'Financeiro & Jurídico',
      'Logs de Auditoria',
      'Usuários & Liderança',
    ]) {
      await expect(page.getByRole('button', { name: removed })).toHaveCount(0);
    }
  });

  test('login como Coordenação Regional SP restringe acesso apenas à regional SP', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('E-mail Ministerial').fill('marcos.sp@semeadoresdefogo.org');
    await page.getByLabel('Senha').fill('Semeadores@2026');
    await page.getByRole('button', { name: 'Entrar no Portal' }).click();

    await expect(page.getByText('Painel Geral de Supervisão Ministerial')).toBeVisible();
    await page.getByRole('button', { name: 'Relatórios Bimestrais' }).click();
    await expect(page.getByRole('heading', { name: 'Relatórios Bimestrais', exact: true })).toBeVisible();
    await expect(page.getByText('Pr. Marcos Oliveira').first()).toBeVisible();
    await expect(page.getByText('Pr. Samuel Couto')).toHaveCount(0);
  });
});
