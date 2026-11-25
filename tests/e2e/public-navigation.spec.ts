import {expect,test} from '@playwright/test';
for(const width of [360,768,1440]){
  test('rotas e manutenção em '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/?view=public#sobre');
    await expect(page.getByLabel('E-mail Ministerial')).toBeVisible();
    await page.goto('/manutencao#sobre');
    await page.reload();
    await expect(page.getByRole('heading',{name:'Site em manutenção'})).toBeVisible();
    await expect(page.locator('.movement-site')).toHaveCount(0);
    await page.getByRole('link',{name:'Acessar painel'}).click();
    await expect(page.getByLabel('E-mail Ministerial')).toBeVisible();
    await page.goto('/admin/config');
    await expect(page.getByRole('heading',{name:'Configuração administrativa'})).toBeVisible();
  });
}
