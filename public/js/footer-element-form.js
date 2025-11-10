/* global document */

/**
 * Gestion du formulaire des éléments footer
 */

(function() {
  'use strict';

  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const typeSelect = document.getElementById('type');
    const textFields = document.getElementById('text-fields');
    const contactFields = document.getElementById('contact-fields');
    const socialFields = document.getElementById('social-fields');
    const linkFields = document.getElementById('link-fields');

    if (!typeSelect) {
      return;
    }

    // Afficher les champs correspondant au type sélectionné
    function updateFieldsVisibility() {
      const selectedType = typeSelect.value;
      
      // Masquer tous les champs
      if (textFields) textFields.style.display = 'none';
      if (contactFields) contactFields.style.display = 'none';
      if (socialFields) socialFields.style.display = 'none';
      if (linkFields) linkFields.style.display = 'none';

      // Afficher les champs du type sélectionné
      if (selectedType === 'text' && textFields) {
        textFields.style.display = 'block';
      } else if (selectedType === 'contact' && contactFields) {
        contactFields.style.display = 'block';
      } else if (selectedType === 'social' && socialFields) {
        socialFields.style.display = 'block';
      } else if (selectedType === 'link' && linkFields) {
        linkFields.style.display = 'block';
      }
    }

    // Événements
    typeSelect.addEventListener('change', updateFieldsVisibility);

    // Afficher les bons champs au chargement
    updateFieldsVisibility();
  }
})();
