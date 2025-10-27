import { test, expect } from '@playwright/test';

test.describe('Authentification Flow', () => {
  test('devrait afficher la page d\'accueil', async ({ page }) => {
    await page.goto('/');
    // Vérifier que la page s'affiche en cherchant un élément de navigation
    const nav = page.locator('nav.header-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a').first()).toContainText('Actualités');
  });

  test('devrait retourner 401 pour /admins sans token', async ({ request }) => {
    const response = await request.get('/admins');
    expect(response.status()).toBe(401);
  });

  test('devrait permettre le login, refresh, et logout', async ({ request }) => {
    // 1. Login avec identifiants valides
    const loginResponse = await request.post('/auth/login', {
      data: { email: 'admin@batala.fr', password: 'SecureP@ss123' },
    });
    expect(loginResponse.status()).toBe(200);
    const { accessToken } = await loginResponse.json();
    expect(accessToken).toBeTruthy();

    // 2. Accéder à /admins avec le token
    const adminsResponse = await request.get('/admins', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(adminsResponse.status()).toBe(200);

    // 3. Refresh le token
    const refreshResponse = await request.post('/auth/refresh');
    expect(refreshResponse.status()).toBe(200);
    const { accessToken: newAccessToken } = await refreshResponse.json();
    expect(newAccessToken).toBeTruthy();

    // 4. Logout
    const logoutResponse = await request.post('/auth/logout');
    expect(logoutResponse.status()).toBe(200);
    const logoutData = await logoutResponse.json();
    expect(logoutData.message).toContain('réussie');
  });
});
