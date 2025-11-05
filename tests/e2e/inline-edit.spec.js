import { test, expect } from '@playwright/test';
import path from 'path';

test.describe.serial('Édition inline via modale (cartes)', () => {
  test.beforeEach(async ({ page }) => {
    // Login via le formulaire web pour avoir les boutons d'admin visibles
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@batala.fr');
    await page.fill('input[name="password"]', 'SecureP@ss123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admins');
  });

  test('modifier uniquement le titre d\'une carte via la modale', async ({ page }) => {
    await page.goto('/');

    // Ouvrir la modale d'édition sur la première carte
    const editBtn = page.locator('.edit-card-btn').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // La modale doit s'ouvrir
    const modal = page.locator('#cardModal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#modalTitle')).toContainText('Modifier');

    // Modifier le titre uniquement
    const newTitle = `Titre modifié ${Date.now()}`;
    await page.fill('#cardTitle', newTitle);
    await page.click('#cardForm button[type="submit"]');

    // La page est rechargée après sauvegarde
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(newTitle).first()).toBeVisible();
  });

  test('créer une nouvelle carte via la modale avec titre seulement', async ({ page }) => {
    await page.goto('/');

    const addBtn = page.locator('button.add-card-btn').first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const modal = page.locator('#cardModal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#modalTitle')).toContainText('Ajouter');

    const newTitle = `Nouvelle carte ${Date.now()}`;
    await page.fill('#cardTitle', newTitle);
    // Ne pas renseigner image/description
    await page.click('#cardForm button[type="submit"]');

    await page.waitForLoadState('networkidle');
    await expect(page.getByText(newTitle).first()).toBeVisible();
  });

  test('uploader une image depuis la modale et auto-remplir l\'URL', async ({ page }) => {
    await page.goto('/');

    const addBtn = page.locator('button.add-card-btn').first();
    await addBtn.click();
    await expect(page.locator('#cardModal')).toBeVisible();

    // Déclencher un upload sur l'input file caché
    const fileInput = page.locator('#cardImage_file');
    const imagePath = path.resolve('public/icons/image.svg');
    await fileInput.setInputFiles(imagePath);

    // Attendre que le champ URL soit rempli avec un chemin /uploads/
    const urlInput = page.locator('#cardImage');
    await expect(urlInput).toHaveValue(/\/uploads\//);

    // Terminer la création avec un titre
    const title = `Carte avec image ${Date.now()}`;
    await page.fill('#cardTitle', title);
    await page.click('#cardForm button[type="submit"]');

    await page.waitForLoadState('networkidle');
    await expect(page.getByText(title).first()).toBeVisible();
  });
});
