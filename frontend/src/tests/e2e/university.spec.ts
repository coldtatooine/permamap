// =====================
// T025 — E2E: Permamap U — Listagem e leitura de cursos
// =====================
//
// Pré-requisitos:
// 1. Dev server rodando (npm run dev)
// 2. Ao menos um curso publicado no banco Supabase
// 3. Credenciais de auth válidas no ambiente ou config de teste

import { test, expect } from '@playwright/test';

test.describe('Permamap U — Listagem de Cursos', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para o app — auth gerenciada pelo Supabase Auth
    await page.goto('http://localhost:5173');
  });

  test('shows university view when navigating to Permamap U', async ({ page }) => {
    // Aguarda o app carregar
    await page.waitForSelector('[data-testid="university-nav-btn"], text="🎓 Permamap U"', { timeout: 10000 });
    // Clica no botão de navegação da universidade
    const navBtn = page.locator('button:has-text("Permamap U")').first();
    await navBtn.click();
    // Verifica que a view da universidade é exibida
    await expect(page.locator('h1:has-text("Permamap U")')).toBeVisible();
  });

  test('shows empty state when no courses published', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Se a view da universidade estiver acessível, verifica estado vazio ou grade de cursos
    const navBtn = page.locator('button:has-text("Permamap U")').first();
    if (await navBtn.isVisible()) {
      await navBtn.click();
      // Deve exibir cursos ou estado vazio — nunca tela em branco
      const hasContent = await page.locator('text="Em breve novos cursos", [class*="CourseCard"], h3').first().isVisible({ timeout: 5000 });
      expect(hasContent).toBeTruthy();
    }
  });

  test('course HTML renders without script tags', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const navBtn = page.locator('button:has-text("Permamap U")').first();
    if (await navBtn.isVisible()) {
      await navBtn.click();
      // Se houver um card de curso, clica nele
      const courseCard = page.locator('[style*="cursor: pointer"]').first();
      if (await courseCard.isVisible({ timeout: 3000 })) {
        await courseCard.click();
        // Verifica que não há tags script no HTML renderizado
        const scriptTags = await page.locator('.pm-modal script').count();
        expect(scriptTags).toBe(0);
        // Verifica que o modal é exibido
        await expect(page.locator('.pm-modal')).toBeVisible();
      }
    }
  });
});
