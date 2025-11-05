/**
 * Scripts page d'accueil
 * Fichier: public/js/index.js
 * 
 * @fileoverview Scripts pour l'édition en ligne de la page d'accueil
 */

/* global document, confirm, window */

// ==========================================================================
// Gestion des modales
// ==========================================================================

/**
 * Ouvre une modale via l'attribut data-modal
 */
document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.dataset.modal + 'Modal';
    document.getElementById(modalId)?.classList.add('active');
  });
});

/**
 * Ferme une modale via l'attribut data-close-modal
 */
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.dataset.closeModal + 'Modal';
    document.getElementById(modalId)?.classList.remove('active');
  });
});

// ==========================================================================
// Gestion des cartes (CRUD)
// ==========================================================================

/**
 * Éditer une carte existante - redirige vers l'interface admin
 */
const editCardButtons = document.querySelectorAll('.edit-card-btn');

editCardButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cardId = e.currentTarget.dataset.cardId;
    const blockId = e.currentTarget.closest('[data-block-id]')?.dataset.blockId;
    
    if (blockId && cardId) {
      window.location.href = `/blocks/${blockId}/cards/${cardId}/edit`;
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
 * Ajouter une nouvelle carte - redirige vers l'interface admin
 */
const addCardButtons = document.querySelectorAll('.add-card-btn');

addCardButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const blockId = e.currentTarget.dataset.blockId;
    
    if (blockId) {
      window.location.href = `/blocks/${blockId}/cards/new`;
    }
  });
});

// Supprimé - les formulaires sont maintenant gérés par les pages admin dédiées

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

/**
 * Édition du footer - redirige vers l'interface admin des blocs
 */
document.querySelectorAll('[data-action="edit-footer"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const blockId = e.currentTarget.dataset.blockId;
    if (blockId) {
      window.location.href = `/blocks/${blockId}/edit`;
    }
  });
});

// Note: Les fonctionnalités d'édition fine du footer (about, contact, socials)
// seront implémentées plus tard via footerElementController
