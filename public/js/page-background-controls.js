/**
 * PageBackgroundControls.js
 * Gère les contrôles de fond pour la page (Paramètres généraux)
 * Utilise le composant background-controls.ejs
 */

(function() {
  'use strict';

  // Ne charger qu'une fois
  if (window.pageBackgroundControlsInitialized) return;
  window.pageBackgroundControlsInitialized = true;

  const prefix = 'page';
  const radioName = `${prefix}-bg-media-type`;
  const imageField = document.getElementById(`${prefix}-bg-image-field`);
  const youtubeField = document.getElementById(`${prefix}-bg-youtube-field`);

  // Fonction pour mettre à jour l'affichage des champs media
  function updateMediaFields() {
    const selectedType = document.querySelector(`input[name="${radioName}"]:checked`)?.value;
    if (imageField) imageField.style.display = selectedType === 'image' ? 'block' : 'none';
    if (youtubeField) youtubeField.style.display = selectedType === 'youtube' ? 'block' : 'none';
  }

  // Initialiser les radio buttons
  document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
    radio.addEventListener('change', updateMediaFields);
  });

  // Gérer les boutons de sélection et suppression media
  document.querySelectorAll(`button[data-prefix="${prefix}"].select-bg-media`).forEach(btn => {
    btn.addEventListener('click', () => {
      const imageInput = document.getElementById(`${prefix}-bg-image`);
      if (window.openMediaPicker) {
        window.openMediaPicker((url) => {
          imageInput.value = url;
          // Afficher le bouton clear
          document.querySelectorAll(`button[data-prefix="${prefix}"].clear-bg-media`).forEach(clearBtn => {
            clearBtn.style.display = 'inline-block';
          });
        }, 'both');
      }
    });
  });

  // Boutons de suppression image
  document.querySelectorAll(`button[data-prefix="${prefix}"].clear-bg-media`).forEach(btn => {
    btn.addEventListener('click', () => {
      const imageInput = document.getElementById(`${prefix}-bg-image`);
      imageInput.value = '';
      btn.style.display = 'none';
    });
  });
})();
