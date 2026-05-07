import { test, expect } from '@playwright/test';

test.describe('Home — fluxo principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('exibe o título do hero', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('comunidade');
  });

  test('exibe seção de categorias', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /o que você procura/i })).toBeVisible();
  });

  test('exibe anúncios recentes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /anúncios recentes/i })).toBeVisible();
    // cards de anúncios renderizados
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('busca por anúncio filtra resultados', async ({ page }) => {
    await page.fill('input[placeholder*="procurando"]', 'Sofá');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/anuncios/);
  });

  test('navegar para Publicar Anúncio', async ({ page }) => {
    await page.getByRole('link', { name: /publicar anúncio grátis/i }).click();
    await expect(page).toHaveURL(/\/publicar/);
  });
});

test.describe('Listagem de anúncios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/anuncios');
  });

  test('exibe grid de anúncios', async ({ page }) => {
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('filtro por categoria Venda funciona', async ({ page }) => {
    await page.getByRole('button', { name: /venda/i }).click();
    // URL atualiza com filtro
    await expect(page).toHaveURL(/categoria=venda|venda/);
  });

  test('botão "Todos" limpa o filtro', async ({ page }) => {
    await page.getByRole('button', { name: /venda/i }).click();
    await page.getByRole('button', { name: /^todos$/i }).click();
    await expect(page.locator('article').first()).toBeVisible();
  });
});

test.describe('Navegação geral', () => {
  test('altera para dark mode via toggle no header', async ({ page }) => {
    await page.goto('/');
    const htmlEl = page.locator('html');
    const initialClass = await htmlEl.getAttribute('class');

    // clica no botão de tema (aria-label ou o botão com ícone sol/lua)
    await page.locator('header button').filter({ has: page.locator('svg') }).first().click();

    const newClass = await htmlEl.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('logo leva à home', async ({ page }) => {
    await page.goto('/anuncios');
    await page.locator('header a').first().click();
    await expect(page).toHaveURL('/');
  });
});
