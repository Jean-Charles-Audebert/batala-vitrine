import { test, expect } from '@playwright/test';

test.describe('Authentification Web Flow', () => {
  test('devrait permettre le login via formulaire web et rediriger vers /admins', async ({ page }) => {
    // Aller sur la page de login
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Connexion');

    // Remplir le formulaire
    await page.fill('input[name="email"]', 'admin@batala.fr');
    await page.fill('input[name="password"]', 'SecureP@ss123');

    // Soumettre
    await page.click('button[type="submit"]');

    // Vérifier la redirection vers /admins
    await page.waitForURL('/admins');
    await expect(page.locator('h1')).toContainText('Liste des admins');
  });

  test('devrait afficher une erreur si identifiants invalides', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'wrong@batala.fr');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Devrait rester sur /auth/login avec un message d'erreur
    await expect(page.url()).toContain('/auth/login');
    await expect(page.locator('.alert-error')).toContainText('Identifiants invalides');
  });

  test('devrait permettre la déconnexion depuis /admins', async ({ page }) => {
    // Login d'abord
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@batala.fr');
    await page.fill('input[name="password"]', 'SecureP@ss123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admins');

    // Cliquer sur Déconnexion
    await page.click('a[href="/auth/logout/web"]');

    // Devrait être redirigé vers /auth/login
    await page.waitForURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Connexion');
  });
});
