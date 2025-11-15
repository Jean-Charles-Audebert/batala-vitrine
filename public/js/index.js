/**
 * Scripts page d'accueil
 * Fichier: public/js/index.js
 * 
 * @fileoverview Scripts pour l'édition en ligne de la page d'accueil
 */

/* global document, confirm, window, fetch */

// ==========================================================================
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

// Soumission du formulaire modale (création/mise à jour via API JSON)
const cardForm = document.getElementById('cardForm');
if (cardForm) {
  cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const cardId = form.querySelector('[name="cardId"]').value;
    const blockId = form.querySelector('[name="blockId"]').value;
    const title = document.getElementById('cardTitle').value.trim();
    const description = document.getElementById('cardDescription').value.trim();
    const imageUrl = document.getElementById('cardImage')?.value?.trim() || '';
    const descriptionBgColor = document.getElementById('cardDescriptionBgColor')?.value || '#ffffff';

    const payload = { title, description, media_path: imageUrl, description_bg_color: descriptionBgColor };
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
