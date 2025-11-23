/**
 * Scripts page d'accueil
 * Fichier: public/js/index.js
 *
 * @fileoverview Scripts pour l'édition en ligne de la page d'accueil
 */

/* global document, confirm, window, fetch, sessionStorage */

// ==========================================================================
// Gestion de l'aperçu depuis l'éditeur
// ==========================================================================

/**
 * Applique les paramètres d'aperçu depuis l'URL ou sessionStorage
 */
function applyPreviewSettings() {
  // Vérifier si on est en mode aperçu
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('preview')) return;

  try {
    // Essayer d'abord depuis l'URL (paramètres encodés)
    let previewData = null;

    if (urlParams.has('data')) {
      // Données encodées dans l'URL
      const encodedData = urlParams.get('data');
      previewData = JSON.parse(decodeURIComponent(encodedData));
    } else {
      // Fallback vers sessionStorage (ancienne méthode)
      previewData = JSON.parse(sessionStorage.getItem('editor_preview'));
    }

    if (!previewData) return;

    console.log('Application des paramètres d\'aperçu:', previewData);

    // Appliquer la couleur de fond
    if (previewData.main_bg_color) {
      document.documentElement.style.setProperty('--main-bg-color', previewData.main_bg_color);
    }

    // Appliquer l'image de fond
    if (previewData.main_bg_image) {
      // Supprimer l'ancien fond s'il existe
      const existingBg = document.querySelector('.global-bg-image');
      if (existingBg) existingBg.remove();

      // Créer le nouveau fond
      const bgDiv = document.createElement('div');
      bgDiv.className = 'global-bg-image preview-bg';
      bgDiv.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;background-image:url('${previewData.main_bg_image}');background-repeat:${previewData.main_bg_image_repeat || 'no-repeat'};background-size:${previewData.main_bg_image_size || 'cover'};background-position:center;background-attachment:fixed;`;
      document.body.insertBefore(bgDiv, document.body.firstChild);
    }

    // Appliquer la vidéo de fond
    if (previewData.main_bg_video) {
      // Supprimer l'ancienne vidéo s'il existe
      const existingVideo = document.querySelector('.global-bg-video');
      if (existingVideo) existingVideo.remove();

      // Créer la nouvelle vidéo
      const video = document.createElement('video');
      video.className = 'global-bg-video preview-bg';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:-1;pointer-events:none;';
      video.innerHTML = `<source src="${previewData.main_bg_video}" type="video/mp4">`;
      document.body.insertBefore(video, document.body.firstChild);
    }

    // Appliquer la vidéo YouTube
    if (previewData.main_bg_youtube) {
      // Supprimer l'ancienne iframe YouTube s'il existe
      const existingYoutube = document.querySelector('.global-bg-youtube');
      if (existingYoutube) existingYoutube.remove();

      // Extraire l'ID de la vidéo YouTube
      let videoId = '';
      try {
        if (previewData.main_bg_youtube.includes('youtu.be/')) {
          videoId = previewData.main_bg_youtube.split('youtu.be/')[1].split('?')[0].split('&')[0];
        } else if (previewData.main_bg_youtube.includes('youtube.com/watch')) {
          const url = new URL(previewData.main_bg_youtube);
          videoId = url.searchParams.get('v');
        }
      } catch (e) {}

      if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.className = 'global-bg-youtube preview-bg';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&playsinline=1`;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        iframe.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
        document.body.insertBefore(iframe, document.body.firstChild);
      }
    }

    // Ajouter un indicateur visuel qu'on est en mode aperçu
    const previewIndicator = document.createElement('div');
    previewIndicator.id = 'preview-indicator';
    previewIndicator.textContent = 'APERÇU - Modifications non sauvegardées';
    previewIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(previewIndicator);

  } catch (error) {
    console.error('Erreur lors de l\'application des paramètres d\'aperçu:', error);
  }
}

// Appliquer les paramètres d'aperçu au chargement de la page
document.addEventListener('DOMContentLoaded', applyPreviewSettings);

/**
 * Ouvre un aperçu avec les paramètres donnés
 * @param {Object} previewData - Données de prévisualisation
 */
function openPreview(previewData) {
  try {
    // Encoder les données dans l'URL
    const encodedData = encodeURIComponent(JSON.stringify(previewData));
    const previewUrl = `${window.location.origin}${window.location.pathname}?preview=1&data=${encodedData}`;

    // Ouvrir dans une nouvelle fenêtre/onglet
    window.open(previewUrl, '_blank');
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de l\'aperçu:', error);
    alert('Erreur lors de l\'ouverture de l\'aperçu');
  }
}

// Exposer la fonction globalement pour que l'éditeur puisse l'utiliser
window.openPreview = openPreview;// ==========================================================================
// Gestion des modales
// ==========================================================================

/**
 * Ouvre une modale via l'attribut data-modal
 */
document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.dataset.modal + 'Modal';
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.classList.add('active');
      modalEl.setAttribute('aria-hidden', 'false');
    }
  });
});

/**
 * Ferme une modale via l'attribut data-close-modal
 */
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.dataset.closeModal + 'Modal';
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      // Retirer le focus avant de cacher la modale
      if (document.activeElement && modalEl.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modalEl.classList.remove('active');
      modalEl.setAttribute('aria-hidden', 'true');
    }
  });
});

// Fermer la modale au clavier (Esc)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modalEl = document.getElementById('cardModal');
    if (modalEl && modalEl.classList.contains('active')) {
      // Retirer le focus avant de cacher la modale
      if (document.activeElement && modalEl.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modalEl.classList.remove('active');
      modalEl.setAttribute('aria-hidden', 'true');
    }
  }
});

// ==========================================================================
// Gestion des cartes (CRUD)
// ==========================================================================

/**
 * Éditer une carte existante - ouverture modale et sauvegarde en AJAX
 */
const editCardButtons = document.querySelectorAll('.edit-card-btn');

editCardButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cardId = e.currentTarget.dataset.cardId;
    const blockId = e.currentTarget.closest('[data-block-id]')?.dataset.blockId;
    
    if (!blockId || !cardId) return;

    try {
      const resp = await fetch(`/api/blocks/${blockId}/cards/${cardId}`);
      const data = await resp.json();
      if (!data.success) throw new Error(data.message || 'Erreur lors du chargement de la carte');

      const card = data.card;
      // Renseigner la modale
      const modalEl = document.getElementById('cardModal');
      if (!modalEl) return;
      modalEl.classList.add('active');
      modalEl.setAttribute('aria-hidden', 'false');
      document.getElementById('modalTitle').textContent = 'Modifier la carte';
      const form = document.getElementById('cardForm');
      form.querySelector('[name="cardId"]').value = card.id;
      form.querySelector('[name="blockId"]').value = card.block_id;
      document.getElementById('cardTitle').value = card.title || '';
      document.getElementById('cardDescription').value = card.description || '';
      const imgInput = document.getElementById('cardImage');
      if (imgInput) imgInput.value = card.media_path || '';
      const bgColorInput = document.getElementById('cardDescriptionBgColor');
      if (bgColorInput) {
        bgColorInput.value = card.description_bg_color || '#ffffff';
        const displayInput = document.getElementById('cardDescriptionBgColor_display');
        if (displayInput) displayInput.value = card.description_bg_color || '#ffffff';
      }
    } catch (err) {
      window.alert(err.message);
    }
  });
});

/**
 * Supprimer une carte - via formulaire POST
 */
const deleteCardButtons = document.querySelectorAll('.delete-card-btn');

deleteCardButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;
    
    const cardId = e.currentTarget.dataset.cardId;
    const blockId = e.currentTarget.closest('[data-block-id]')?.dataset.blockId;
    
    if (blockId && cardId) {
      // Créer un formulaire pour POST
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/blocks/${blockId}/cards/${cardId}/delete`;
      document.body.appendChild(form);
      form.submit();
    }
  });
});

/**
 * Ajouter une nouvelle carte - ouverture modale (création rapide)
 */
const addCardButtons = document.querySelectorAll('.add-card-btn');

addCardButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const blockId = e.currentTarget.dataset.blockId;
    
    if (!blockId) return;
    const modalEl = document.getElementById('cardModal');
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.getElementById('modalTitle').textContent = 'Ajouter une carte';
    const form = document.getElementById('cardForm');
    form.querySelector('[name="cardId"]').value = '';
    form.querySelector('[name="blockId"]').value = blockId;
    document.getElementById('cardTitle').value = '';
    document.getElementById('cardDescription').value = '';
    const imgInput = document.getElementById('cardImage');
    if (imgInput) imgInput.value = '';
    const bgColorInput = document.getElementById('cardDescriptionBgColor');
    if (bgColorInput) {
      bgColorInput.value = '#ffffff';
      const displayInput = document.getElementById('cardDescriptionBgColor_display');
      if (displayInput) displayInput.value = '#ffffff';
    }
  });
});

// Gestion de la sélection de template dans la modale
document.querySelectorAll('#cardModal .template-option').forEach(option => {
  option.addEventListener('click', function() {
    // Retirer la sélection précédente
    document.querySelectorAll('#cardModal .template-option').forEach(opt => opt.classList.remove('selected'));
    // Sélectionner le nouveau
    this.classList.add('selected');
    this.querySelector('input[type="radio"]').checked = true;
    
    // Mettre à jour le champ caché
    const templateId = this.dataset.template;
    document.getElementById('cardTemplate').value = templateId;
    
    // Adapter les champs selon le template
    updateCardModalFields(templateId);
  });
});

function updateCardModalFields(template) {
  const imageGroup = document.querySelector('#cardModal .form-group:has(#cardImage)');
  const imageLabel = document.querySelector('#cardModal label[for="cardImage"]');
  const imageInput = document.getElementById('cardImage');
  const imageHelp = document.getElementById('cardImageHelp');
  const uploadButton = imageGroup?.querySelector('button');
  
  if (template === 'text_only') {
    // Masquer le champ image pour text_only
    if (imageGroup) imageGroup.style.display = 'none';
  } else {
    if (imageGroup) imageGroup.style.display = '';
    
    // Adapter selon le type
    if (template === 'video') {
      if (imageLabel) imageLabel.textContent = 'URL de la vidéo';
      if (imageInput) imageInput.placeholder = 'https://www.youtube.com/watch?v=...';
      if (imageHelp) imageHelp.textContent = 'URL YouTube ou chemin vers un fichier vidéo.';
      if (uploadButton) uploadButton.style.display = 'none';
    } else if (template === 'photo') {
      if (imageLabel) imageLabel.textContent = 'Photo';
      if (imageInput) imageInput.placeholder = '/uploads/photo.jpg';
      if (imageHelp) imageHelp.textContent = 'Photo pleine largeur.';
      if (uploadButton) uploadButton.style.display = '';
    } else {
      if (imageLabel) imageLabel.textContent = 'URL de l\'image';
      if (imageInput) imageInput.placeholder = '/uploads/image.jpg';
      if (imageHelp) imageHelp.textContent = 'Optionnel : URL complète ou chemin relatif, ou utilisez le bouton pour téléverser.';
      if (uploadButton) uploadButton.style.display = '';
    }
  }
}

// Soumission du formulaire modale (création/mise à jour via API JSON)
const cardForm = document.getElementById('cardForm');
if (cardForm) {
  cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const cardId = form.querySelector('[name="cardId"]').value;
    const blockId = form.querySelector('[name="blockId"]').value;
    const template = document.getElementById('cardTemplate')?.value || 'default';
    const title = document.getElementById('cardTitle').value.trim();
    const description = document.getElementById('cardDescription').value.trim();
    const imageUrl = document.getElementById('cardImage')?.value?.trim() || '';
    const descriptionBgColor = document.getElementById('cardDescriptionBgColor')?.value || '#ffffff';

    const payload = { template, title, description, media_path: imageUrl, description_bg_color: descriptionBgColor };
    const isCreate = !cardId;
    const url = isCreate 
      ? `/api/blocks/${blockId}/cards`
      : `/api/blocks/${blockId}/cards/${cardId}`;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!data.success) throw new Error(data.message || 'Erreur lors de la sauvegarde');

      // Fermer modal et recharger pour refléter les changements
      const modalEl = document.getElementById('cardModal');
      if (modalEl) {
        // Retirer le focus avant de cacher la modale
        if (document.activeElement && modalEl.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
      }
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
    }
  });
}

// ==========================================================================
// Placeholders pour fonctionnalités futures
// ==========================================================================

/**
 * Édition du header - redirige vers l'interface admin des blocs
 */
document.querySelectorAll('[data-action="edit-header"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const blockId = e.currentTarget.dataset.blockId;
    if (blockId) {
      window.location.href = `/blocks/${blockId}/edit`;
    }
  });
});

// Note: Footer édité via modales inline (footer-edit.js)
