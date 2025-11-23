import { chromium } from 'playwright';

async function testEditorButtons() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Aller à la page éditeur
    await page.goto('http://localhost:3000/editor');

    // Attendre que la page se charge
    await page.waitForSelector('.editor-layout');

    // Compter les boutons d'édition
    const editButtons = await page.$$('.edit-section-btn');
    console.log(`Nombre de boutons d'édition trouvés: ${editButtons.length}`);

    if (editButtons.length > 0) {
      // Au lieu de cliquer, déclencher directement la fonction JavaScript
      const sectionId = await editButtons[0].getAttribute('data-section-id');
      console.log(`ID de la section: ${sectionId}`);

      // Attendre que l'éditeur soit initialisé
      await page.waitForFunction(() => {
        return window.siteEditor && window.siteEditor.siteConfig && window.siteEditor.schemas;
      });

      // Récupérer les schémas pour le debug
      const schemas = await page.evaluate(() => {
        return Object.keys(window.siteEditor.schemas || {});
      });
      console.log('Éditeur initialisé avec schémas:', schemas);

      // Attendre un peu plus
      await page.waitForTimeout(1000);

      // Exécuter le code JavaScript pour éditer la section
      await page.evaluate((id) => {
        // Simuler l'appel à editSection
        if (window.siteEditor) {
          console.log('Appel editSection pour', id);
          window.siteEditor.editSection(id);
        } else {
          console.log('siteEditor non trouvé');
        }
      }, sectionId);

      // Attendre un peu
      await page.waitForTimeout(1000);

      // Vérifier l'état
      const result = await page.evaluate(() => {
        const sidebar = document.querySelector('.editor-sidebar');
        const isOpen = sidebar ? sidebar.classList.contains('open') : false;
        const form = document.getElementById('sectionForm');
        const hasForm = form && form.children.length > 0;

        return {
          sidebarOpen: isOpen,
          formPresent: !!form,
          formHasContent: hasForm,
          sidebarExists: !!sidebar
        };
      });

      console.log('Résultat:', result);
    }

    console.log('Test terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du test:', error);
  } finally {
    await browser.close();
  }
}

testEditorButtons();