/**
 * Batala La Rochelle - Scripts page d'accueil
 * Fichier: public/js/index.js
 * 
 * @fileoverview Scripts pour l'édition en ligne de la page d'accueil
 */

/* global document, alert, confirm, location, fetch, FormData */

console.log('Script d\'édition chargé');

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
 * Éditer une carte existante
 */
const editCardButtons = document.querySelectorAll('.btn-edit-card');
console.log('Boutons d\'édition trouvés:', editCardButtons.length);

editCardButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clic sur éditer carte', e.target.dataset.elementId);
    
    const elementId = e.target.dataset.elementId;
    const card = e.target.closest('.card');
    const title = card.querySelector('.card-title')?.textContent;
    const description = card.querySelector('.card-description')?.textContent;
    const image = card.querySelector('.card-image')?.style.backgroundImage?.match(/url\("(.+)"\)/)?.[1] || '';
    
    // Remplir le formulaire
    document.querySelector('#cardForm input[name="elementId"]').value = elementId;
    document.querySelector('#cardTitle').value = title;
    document.querySelector('#cardDescription').value = description;
    document.querySelector('#cardImage').value = image;
    
    // Réinitialiser les flags de création
    document.getElementById('cardForm').dataset.isNew = 'false';
    document.getElementById('cardForm').dataset.blockId = '';
    
    // Changer le titre de la modale
    document.querySelector('#cardModal .modal-title').textContent = 'Éditer la carte';
    
    // Ouvrir la modale
    document.getElementById('cardModal').classList.add('active');
  });
});

/**
 * Supprimer une carte
 */
const deleteCardButtons = document.querySelectorAll('.btn-delete-card');
console.log('Boutons de suppression trouvés:', deleteCardButtons.length);

deleteCardButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;
    
    const elementId = e.target.dataset.elementId;
    console.log('Suppression de la carte', elementId);
    
    try {
      const response = await fetch(`/api/elements/${elementId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        location.reload();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  });
});

/**
 * Ajouter une nouvelle carte
 */
const addCardButtons = document.querySelectorAll('.btn-add-card');
console.log('Boutons d\'ajout trouvés:', addCardButtons.length);

addCardButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const blockId = e.target.dataset.blockId;
    
    // Réinitialiser le formulaire
    document.querySelector('#cardForm input[name="elementId"]').value = '';
    document.querySelector('#cardTitle').value = '';
    document.querySelector('#cardDescription').value = '';
    document.querySelector('#cardImage').value = '';
    
    // Stocker le blockId pour la création
    document.getElementById('cardForm').dataset.blockId = blockId;
    document.getElementById('cardForm').dataset.isNew = 'true';
    
    // Changer le titre de la modale
    document.querySelector('#cardModal .modal-title').textContent = 'Ajouter une carte';
    
    // Ouvrir la modale
    document.getElementById('cardModal').classList.add('active');
  });
});

/**
 * Soumission du formulaire de carte (création ou modification)
 */
document.getElementById('cardForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const elementId = formData.get('elementId');
  const title = formData.get('title');
  const description = formData.get('description');
  const image = formData.get('image');
  const isNew = e.target.dataset.isNew === 'true';
  const blockId = e.target.dataset.blockId;
  
  try {
    let response;
    
    if (isNew && blockId) {
      // Création
      response = await fetch(`/api/blocks/${blockId}/elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'card',
          content: JSON.stringify({ title, description }),
          media_path: image,
          position: 999
        })
      });
    } else if (elementId) {
      // Mise à jour
      response = await fetch(`/api/elements/${elementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify({ title, description }),
          media_path: image
        })
      });
    }
    
    if (response && response.ok) {
      location.reload();
    } else {
      alert('Erreur lors de la sauvegarde');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la sauvegarde');
  }
});

// ==========================================================================
// Placeholders pour fonctionnalités futures
// ==========================================================================

/**
 * Édition du header (à implémenter)
 */
document.querySelectorAll('[data-action="edit-header"]').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Édition du header : fonctionnalité à venir');
  });
});

/**
 * Édition À propos (à implémenter)
 */
document.querySelectorAll('[data-action="edit-about"]').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Édition À propos : fonctionnalité à venir');
  });
});

/**
 * Édition Contact (à implémenter)
 */
document.querySelectorAll('[data-action="edit-contact"]').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Édition contact : fonctionnalité à venir');
  });
});

/**
 * Édition réseaux sociaux (à implémenter)
 */
document.querySelectorAll('[data-action="edit-socials"]').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Édition réseaux sociaux : fonctionnalité à venir');
  });
});

/**
 * Ajout réseau social (à implémenter)
 */
document.querySelectorAll('[data-action="add-social"]').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Ajout réseau social : fonctionnalité à venir');
  });
});
