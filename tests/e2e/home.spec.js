import { test, expect } from '@playwright/test';

test('la home s’affiche avec les sections seedées', async ({ page }) => {
  await page.goto('/');

  // Le header est présent (titre seedé)
  await expect(page.getByText('Titre de la page')).toBeVisible();

  // Sections seedées
  await expect(page.getByText('Événements à venir')).toBeVisible();
  await expect(page.getByText('Nos offres')).toBeVisible();

  // Au moins une carte d’événement seedée
  await expect(page.getByText('Titre actu').first()).toBeVisible();
});
