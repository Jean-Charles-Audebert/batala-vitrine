import { test, expect } from '@playwright/test';

test('la home s’affiche avec des sections et des cartes', async ({ page }) => {
  await page.goto('/');

  // Le header est présent
  const header = page.locator('header.header-section');
  await expect(header).toBeVisible();
  await expect(header.locator('h1')).toBeVisible();

  // Vérifier qu'il y a au moins une section de contenu avec un titre
  const sections = page.locator('section.block-section');
  await expect(sections.first()).toBeVisible();
  await expect(sections.first().locator('h2')).toBeVisible();

  // Au moins une carte visible dans une grille
  const firstCardTitle = sections.first().locator('.cards-grid [role="listitem"] h3').first();
  await expect(firstCardTitle).toBeVisible();
});
