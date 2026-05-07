import { test, expect } from '@playwright/test';

test.describe('Home — fluxo principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // aguarda mock data carregar
    await expect(page.getByTestId('hero-title')).toBeVisible();
  });

  test('exibe o título do hero', async ({ page }) => {
    await expect(page.getByTestId('hero-title')).toContainText('comunidade');
  });

  test('exibe seção de categorias', async ({ page }) => {
    await expect(page.getByTestId('category-section')).toBeVisible();
    await expect(
      page.getByTestId('category-section').getByRole('heading', { level: 2 }),
    ).toContainText('procura');
  });

  test('exibe anúncios recentes', async ({ page }) => {
    await expect(page.getByTestId('listings-grid')).toBeVisible();
    await expect(page.getByTestId('listings-grid').locator('article').first()).toBeVisible();
  });

  test('busca por anúncio redireciona para /anuncios', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/procurando/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Sofá');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/anuncios/);
  });

  test('CTA publicar aponta para /publicar', async ({ page }) => {
    const cta = page.getByTestId('publish-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/publicar');
  });
});

test.describe('Listagem de anúncios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/anuncios');
    // aguarda ao menos um card aparecer
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('exibe grid de anúncios com mock data', async ({ page }) => {
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('filtro por categoria Venda atualiza URL', async ({ page }) => {
    await page.getByRole('button', { name: /venda/i }).click();
    await expect(page).toHaveURL(/categoria=venda/);
  });

  test('botão Todos limpa filtro e exibe todos os anúncios', async ({ page }) => {
    // aplica filtro
    await page.getByRole('button', { name: /venda/i }).click();
    await expect(page).toHaveURL(/categoria=venda/);
    // limpa filtro
    await page.getByRole('button', { name: /^todos/i }).click();
    await expect(page).not.toHaveURL(/categoria=/);
    await expect(page.locator('article').first()).toBeVisible();
  });
});

test.describe('Navegação geral', () => {
  test('toggle de tema altera classe do html', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('hero-title')).toBeVisible();

    const htmlEl = page.locator('html');
    const initialClass = await htmlEl.getAttribute('class');

    await page.getByTestId('theme-toggle').click();

    const newClass = await htmlEl.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('logo no header navega para home', async ({ page }) => {
    await page.goto('/anuncios');
    await expect(page.locator('article').first()).toBeVisible();
    // primeiro link no header é o logo
    await page.locator('header').getByRole('link').first().click();
    await expect(page).toHaveURL('/');
  });
});
