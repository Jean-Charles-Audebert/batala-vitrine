/* eslint-disable no-undef */
// Les fonctions comme getComputedStyle et document sont disponibles dans le contexte du navigateur via page.evaluate()

import { test, expect } from '@playwright/test';

test.describe.serial('Personnalisation du thème de la page', () => {
  test.beforeEach(async ({ page }) => {
    // Login en tant qu'admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@batala.fr');
    await page.fill('input[name="password"]', 'SecureP@ss123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admins');
  });

  test('accéder aux paramètres de la page via l\'édition du header', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur le bouton d'édition du header
    const headerEditBtn = page.locator('.header-section .edit-btn').first();
    await expect(headerEditBtn).toBeVisible();
    await headerEditBtn.click();
    
    // Vérifier qu'on est sur la page de paramètres
    await expect(page).toHaveURL(/\/blocks\/\d+\/edit/);
    await expect(page.locator('h1')).toContainText('Paramètres de la page');
    
    // Vérifier que les 3 sections de thème sont présentes
    await expect(page.getByText('Zone 1 : En-tête (Header)')).toBeVisible();
    await expect(page.getByText('Zone 2 : Contenu principal (Main)')).toBeVisible();
    await expect(page.getByText('Zone 3 : Pied de page (Footer)')).toBeVisible();
  });

  test('vérifier que le lien aperçu fonctionne', async ({ page }) => {
    await page.goto('/');
    const headerEditBtn = page.locator('.header-section .edit-btn').first();
    await headerEditBtn.click();
    
    // Vérifier la présence du lien aperçu
    const previewLink = page.locator('a[target="_blank"]').filter({ hasText: 'Aperçu' });
    await expect(previewLink).toBeVisible();
    await expect(previewLink).toHaveAttribute('href', '/');
  });

  test('modifier la couleur du titre du header', async ({ page }) => {
    await page.goto('/');
    const headerEditBtn = page.locator('.header-section .edit-btn').first();
    await headerEditBtn.click();
    
    // Modifier la couleur du titre du header (couleur rouge visible)
    await page.fill('#header_title_color', '#ff0000');
    
    // Sauvegarder
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Vérifier que la variable CSS est appliquée
    const root = page.locator(':root');
    const headerTitleColor = await root.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--header-title-color').trim();
    });
    expect(headerTitleColor).toBe('#ff0000');
    
    // Vérifier que le titre du site a bien la couleur rouge
    const siteTitle = page.locator('.site-title');
    const color = await siteTitle.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 0, 0)'); // #ff0000 en RGB
  });

  test('modifier la couleur de fond du contenu principal', async ({ page }) => {
    await page.goto('/');
    const headerEditBtn = page.locator('.header-section .edit-btn').first();
    await headerEditBtn.click();
    
    // Modifier la couleur de fond du contenu principal (vert clair)
    await page.fill('#main_bg_color', '#90ee90');
    
    // Sauvegarder
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Vérifier que la variable CSS est appliquée
    const mainBgColor = await page.locator(':root').evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--main-bg-color').trim();
    });
    expect(mainBgColor).toBe('#90ee90');
    
    // Vérifier que le wrapper a bien cette couleur
    const wrapper = page.locator('.main-content-wrapper');
    const bgColor = await wrapper.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(144, 238, 144)'); // #90ee90 en RGB
  });

  test('modifier la couleur du texte du footer', async ({ page }) => {
    await page.goto('/');
    const headerEditBtn = page.locator('.header-section .edit-btn').first();
    await headerEditBtn.click();
    
    // Modifier la couleur du texte du footer (jaune)
    await page.fill('#footer_text_color', '#ffff00');
    
    // Sauvegarder
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Vérifier que la variable CSS est appliquée
    const footerTextColor = await page.locator(':root').evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--footer-text-color').trim();
    });
    expect(footerTextColor).toBe('#ffff00');
    
    // Vérifier que le texte du footer a bien cette couleur
    const footerSection = page.locator('.footer-section');
    const color = await footerSection.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 0)'); // #ffff00 en RGB
  });

  test('vérifier que les icônes sociales du footer prennent la couleur du texte', async ({ page }) => {
    await page.goto('/');
    const headerEditBtn = page.locator('.header-section .edit-btn').first();
    await headerEditBtn.click();
    
    // Modifier la couleur du texte du footer (orange)
    await page.fill('#footer_text_color', '#ffa500');
    
    // Sauvegarder
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Vérifier que les icônes sociales ont le filtre CSS appliqué
    const socialIcon = page.locator('.footer-section .social-icon').first();
    if (await socialIcon.count() > 0) {
      const filter = await socialIcon.evaluate(el => getComputedStyle(el).filter);
      // Le filter doit contenir invert pour rendre l'icône blanche/claire
      expect(filter).toContain('invert');
    }
  });

  test('vérifier que les titres (h2/h3) gardent leur style de base', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier qu'un h2 (section-title) a bien font-weight: 600
    const sectionTitle = page.locator('.section-title').first();
    if (await sectionTitle.count() > 0) {
      const fontSize = await sectionTitle.evaluate(el => getComputedStyle(el).fontSize);
      const fontWeight = await sectionTitle.evaluate(el => getComputedStyle(el).fontWeight);
      
      // font-size doit être significativement grand (> 20px généralement)
      const fontSizeValue = parseFloat(fontSize);
      expect(fontSizeValue).toBeGreaterThan(20);
      
      // font-weight doit être 600 ou plus
      expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
    }
    
    // Vérifier qu'un h3 de carte a bien font-weight: 600
    const cardTitle = page.locator('.card h3').first();
    if (await cardTitle.count() > 0) {
      const fontSize = await cardTitle.evaluate(el => getComputedStyle(el).fontSize);
      const fontWeight = await cardTitle.evaluate(el => getComputedStyle(el).fontWeight);
      
      // font-size doit être >= 1.25rem (environ 20px)
      const fontSizeValue = parseFloat(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(18);
      
      // font-weight doit être 600 ou plus
      expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
    }
  });

  test('modifier plusieurs zones à la fois et vérifier la cohérence', async ({ page }) => {
    await page.goto('/');
    const headerEditBtn = page.locator('.header-section .edit-btn').first();
    await headerEditBtn.click();
    
    // Modifier les 3 zones simultanément
    await page.fill('#header_bg_color', '#2196f3'); // Bleu
    await page.fill('#main_bg_color', '#ffffff');   // Blanc
    await page.fill('#footer_bg_color', '#212121'); // Noir
    await page.fill('#footer_text_color', '#ffffff'); // Blanc
    
    // Sauvegarder
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Vérifier que toutes les variables sont appliquées
    const variables = await page.locator(':root').evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        headerBg: style.getPropertyValue('--header-bg-color').trim(),
        mainBg: style.getPropertyValue('--main-bg-color').trim(),
        footerBg: style.getPropertyValue('--footer-bg-color').trim(),
        footerText: style.getPropertyValue('--footer-text-color').trim(),
      };
    });
    
    expect(variables.headerBg).toBe('#2196f3');
    expect(variables.mainBg).toBe('#ffffff');
    expect(variables.footerBg).toBe('#212121');
    expect(variables.footerText).toBe('#ffffff');
  });
});
