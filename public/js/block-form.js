/* global document */
/**
 * Gestion du formulaire de bloc (création/édition)
 */

/**
 * Initialise la génération automatique du slug à partir du titre
 */
function initSlugGeneration() {
  const titleInput = document.getElementById('title');
  const slugInput = document.getElementById('slug');
  const isEdit = slugInput?.dataset.isEdit === 'true';
  const isLocked = slugInput?.dataset.isLocked === 'true';

  if (!isEdit && titleInput && slugInput) {
    titleInput.addEventListener('input', (e) => {
      const slug = e.target.value
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever accents
        .replace(/[^a-z0-9\s-]/g, '') // Garder a-z, 0-9, espaces, tirets
        .trim()
        .replace(/\s+/g, '-') // Espaces → tirets
        .replace(/-+/g, '-'); // Éviter tirets multiples
      
      slugInput.value = slug;
    });
  }

  // Empêcher modification du slug si verrouillé
  if (isLocked && slugInput) {
    slugInput.addEventListener('keydown', (e) => {
      e.preventDefault();
    });
  }
}

// Auto-initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSlugGeneration);
} else {
  initSlugGeneration();
}
