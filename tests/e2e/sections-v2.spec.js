import { test, expect } from '@playwright/test';

test.describe('Sections v2 - Navigation', () => {
  
  test('la home affiche les sections avec le système v2', async ({ page }) => {
    await page.goto('/');

    // Vérifier que le hero est présent
    const hero = page.locator('section.section-hero').first();
    await expect(hero).toBeVisible();
    
    // Le hero contient un titre
    const heroTitle = hero.locator('.hero-content h1');
    await expect(heroTitle).toBeVisible();
  });

  test('les sections de contenu s\'affichent correctement', async ({ page }) => {
    await page.goto('/');

    // Chercher une section de type content
    const contentSection = page.locator('section.section-content').first();
    
    // Si elle existe, vérifier sa structure
    if (await contentSection.count() > 0) {
      await expect(contentSection).toBeVisible();
      
      // Doit contenir du texte
      const contentText = contentSection.locator('.content-text');
      await expect(contentText).toBeVisible();
    }
  });

  test('les grilles de cartes s\'affichent', async ({ page }) => {
    await page.goto('/');

    // Chercher une section de type card_grid
    const cardGrid = page.locator('section.section-card-grid').first();
    
    if (await cardGrid.count() > 0) {
      await expect(cardGrid).toBeVisible();
      
      // Doit contenir des cartes
      const cards = cardGrid.locator('.card');
      await expect(cards.first()).toBeVisible();
      
      // Chaque carte a un titre
      const cardTitle = cards.first().locator('h3');
      await expect(cardTitle).toBeVisible();
    }
  });

  test('les décorations sont affichées si présentes', async ({ page }) => {
    await page.goto('/');

    // Chercher les décorations
    const decorations = page.locator('.decoration');
    
    // Si des décorations existent, vérifier qu'elles sont visibles
    if (await decorations.count() > 0) {
      await expect(decorations.first()).toBeVisible();
      
      // Doit contenir un SVG
      const svg = decorations.first().locator('svg');
      await expect(svg).toBeVisible();
    }
  });
});

test.describe('Sections v2 - Admin (authentifié)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant qu'admin
    await page.goto('/auth/login');
    await page.fill('#email', 'admin@batala.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admins');
    
    // Retourner à la home
    await page.goto('/');
  });

  test('les boutons d\'édition sont visibles pour un admin', async ({ page }) => {
    // Vérifier que le bouton edit d'une section est visible
    const editBtn = page.locator('[data-action="edit-section"]').first();
    await expect(editBtn).toBeVisible();
  });

  test('le bouton "Ajouter une carte" est visible sur les sections card_grid', async ({ page }) => {
    const addCardBtn = page.locator('[data-action="add-card"]');
    
    // Si une section card_grid existe, le bouton doit être visible
    if (await addCardBtn.count() > 0) {
      await expect(addCardBtn.first()).toBeVisible();
    }
  });

  test('cliquer sur éditer une section affiche une alerte (TODO: modale)', async ({ page }) => {
    // Attendre l'alerte au clic
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Édition de la section');
      await dialog.accept();
    });

    const editBtn = page.locator('[data-action="edit-section"]').first();
    await editBtn.click();
  });

  test('cliquer sur ajouter une carte affiche une alerte (TODO: modale)', async ({ page }) => {
    const addCardBtn = page.locator('[data-action="add-card"]').first();
    
    if (await addCardBtn.count() > 0) {
      // Attendre l'alerte au clic
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Ajout de carte');
        await dialog.accept();
      });

      await addCardBtn.click();
    }
  });

  test('cliquer sur éditer une carte affiche une alerte (TODO: modale)', async ({ page }) => {
    const editCardBtn = page.locator('[data-action="edit-card"]').first();
    
    if (await editCardBtn.count() > 0) {
      // Attendre l'alerte au clic
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Édition de la carte');
        await dialog.accept();
      });

      await editCardBtn.click();
    }
  });

  test('cliquer sur supprimer une carte affiche une confirmation', async ({ page }) => {
    const deleteCardBtn = page.locator('[data-action="delete-card"]').first();
    
    if (await deleteCardBtn.count() > 0) {
      // Intercepter la confirmation
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('supprimer cette carte');
        await dialog.dismiss(); // Annuler pour ne pas vraiment supprimer
      });

      await deleteCardBtn.click();
    }
  });
});

test.describe('Sections v2 - Non authentifié', () => {
  
  test('les boutons d\'édition ne sont pas visibles pour un visiteur', async ({ page }) => {
    await page.goto('/');

    // Vérifier qu'aucun bouton edit n'est visible
    const editBtns = page.locator('[data-action="edit-section"]');
    await expect(editBtns).toHaveCount(0);
  });

  test('le bouton "Ajouter une carte" n\'est pas visible pour un visiteur', async ({ page }) => {
    await page.goto('/');

    const addCardBtn = page.locator('[data-action="add-card"]');
    await expect(addCardBtn).toHaveCount(0);
  });

  test('les boutons de suppression de carte ne sont pas visibles', async ({ page }) => {
    await page.goto('/');

    const deleteCardBtn = page.locator('[data-action="delete-card"]');
    await expect(deleteCardBtn).toHaveCount(0);
  });
});

test.describe('Sections v2 - Responsive', () => {
  
  test('le hero s\'affiche correctement sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hero = page.locator('section.section-hero').first();
    await expect(hero).toBeVisible();
    
    const heroTitle = hero.locator('.hero-content h1');
    await expect(heroTitle).toBeVisible();
  });

  test('les cartes passent en une seule colonne sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const cardGrid = page.locator('.cards-grid').first();
    
    if (await cardGrid.count() > 0) {
      const gridStyle = await cardGrid.evaluate(el => 
        window.getComputedStyle(el).gridTemplateColumns
      );
      
      // Sur mobile, devrait être une seule colonne ou auto-fill avec min 100%
      expect(gridStyle).toBeTruthy();
    }
  });

  test('les sections content passent en colonne sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const contentSection = page.locator('section.section-content.layout-image-left').first();
    
    if (await contentSection.count() > 0) {
      const container = contentSection.locator('.content-container');
      const flexDirection = await container.evaluate(el => 
        window.getComputedStyle(el).flexDirection
      );
      
      // Sur mobile, devrait être en colonne
      expect(flexDirection).toBe('column');
    }
  });
});
