/**
 * Édition inline des sections v2
 * Modales visuelles sur la page d'accueil
 */

/* global document, confirm, window, fetch, alert */

// ==========================================================================
// Gestion des modales
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// Fermer les modales avec Echap
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
  }
});

// ==========================================================================
// Édition section (paramètres: bg, layout, transparence, etc.)
// ==========================================================================

document.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('[data-action="edit-section"]');
  if (!editBtn) return;
  
  e.preventDefault();
  const sectionId = editBtn.dataset.sectionId;
  
  try {
    const response = await fetch(`/api/sections/${sectionId}`);
    const section = await response.json();
    
    // Créer modale dynamique
    const modal = createSectionModal(section);
    document.body.appendChild(modal);
    openModal('editSectionModal');
    
  } catch (error) {
    alert('Erreur lors du chargement de la section');
  }
});

function createSectionModal(section) {
  const modal = document.createElement('div');
  modal.id = 'editSectionModal';
  modal.className = 'modal';
  modal.setAttribute('aria-hidden', 'false');
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Modifier la section</h2>
        <button class="modal-close" onclick="closeModal('editSectionModal')">&times;</button>
      </div>
      <form id="editSectionForm">
        <input type="hidden" name="sectionId" value="${section.id}">
        
        <div class="form-group">
          <label>Type: <strong>${section.type}</strong></label>
        </div>
        
        <div class="form-group">
          <label for="sectionLayout">Layout</label>
          <select name="layout" id="sectionLayout">
            <option value="">— Par défaut —</option>
            <option value="centered" ${section.layout === 'centered' ? 'selected' : ''}>Centré</option>
            <option value="image_left" ${section.layout === 'image_left' ? 'selected' : ''}>Image à gauche</option>
            <option value="image_right" ${section.layout === 'image_right' ? 'selected' : ''}>Image à droite</option>
            <option value="grid_2" ${section.layout === 'grid_2' ? 'selected' : ''}>Grille 2 colonnes</option>
            <option value="grid_3" ${section.layout === 'grid_3' ? 'selected' : ''}>Grille 3 colonnes</option>
            <option value="grid_4" ${section.layout === 'grid_4' ? 'selected' : ''}>Grille 4 colonnes</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="sectionBgColor">Couleur de fond</label>
          <input type="color" name="bg_color" id="sectionBgColor" value="${section.bg_color || '#ffffff'}">
        </div>
        
        <div class="form-group">
          <label for="sectionBgImage">Image de fond</label>
          <div class="image-upload-field">
            <input type="text" name="bg_image" id="sectionBgImage" value="${section.bg_image || ''}" placeholder="/uploads/..." readonly>
            <button type="button" class="btn btn-sm btn-secondary select-bg-image">📁 Choisir</button>
          </div>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" name="is_transparent" ${section.is_transparent ? 'checked' : ''}>
            Fond transparent (ignore la couleur)
          </label>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" name="is_visible" ${section.is_visible ? 'checked' : ''}>
            Visible sur le site
          </label>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('editSectionModal')">Annuler</button>
          <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler submit
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const sectionId = formData.get('sectionId');
    
    const data = {
      layout: formData.get('layout') || null,
      bg_color: formData.get('bg_color') || null,
      bg_image: formData.get('bg_image') || null,
      is_transparent: formData.get('is_transparent') === 'on',
      is_visible: formData.get('is_visible') === 'on'
    };
    
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      window.location.reload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  });
  
  // Handler sélection image
  modal.querySelector('.select-bg-image').addEventListener('click', () => {
    // TODO: Intégrer avec système d'upload existant
    const url = prompt('URL de l\'image de fond:');
    if (url) {
      modal.querySelector('#sectionBgImage').value = url;
    }
  });
  
  return modal;
}

// ==========================================================================
// Édition contenu (titre, description, CTA, média)
// ==========================================================================

document.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('[data-action="edit-content"]');
  if (!editBtn) return;
  
  e.preventDefault();
  const sectionId = editBtn.dataset.sectionId;
  const contentId = editBtn.dataset.contentId;
  
  try {
    const response = await fetch(`/api/sections/${sectionId}`);
    const section = await response.json();
    const content = section.content.find(c => c.id == contentId) || {};
    
    const modal = createContentModal(sectionId, content);
    document.body.appendChild(modal);
    openModal('editContentModal');
    
  } catch (error) {
    alert('Erreur lors du chargement du contenu');
  }
});

function createContentModal(sectionId, content = {}) {
  const modal = document.createElement('div');
  modal.id = 'editContentModal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${content.id ? 'Modifier le contenu' : 'Ajouter du contenu'}</h2>
        <button class="modal-close" onclick="closeModal('editContentModal')">&times;</button>
      </div>
      <form id="editContentForm">
        <input type="hidden" name="sectionId" value="${sectionId}">
        <input type="hidden" name="contentId" value="${content.id || ''}">
        
        <div class="form-group">
          <label for="contentTitle">Titre</label>
          <input type="text" name="title" id="contentTitle" value="${content.title || ''}" placeholder="Titre principal">
        </div>
        
        <div class="form-group">
          <label for="contentSubtitle">Sous-titre</label>
          <input type="text" name="subtitle" id="contentSubtitle" value="${content.subtitle || ''}" placeholder="Sous-titre ou accroche">
        </div>
        
        <div class="form-group">
          <label for="contentDescription">Description</label>
          <textarea name="description" id="contentDescription" rows="5" placeholder="Texte descriptif">${content.description || ''}</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="contentCtaLabel">Texte du bouton</label>
            <input type="text" name="cta_label" id="contentCtaLabel" value="${content.cta_label || ''}" placeholder="En savoir plus">
          </div>
          <div class="form-group">
            <label for="contentCtaUrl">Lien du bouton</label>
            <input type="url" name="cta_url" id="contentCtaUrl" value="${content.cta_url || ''}" placeholder="https://...">
          </div>
        </div>
        
        <div class="form-group">
          <label for="contentMediaUrl">Média (image/vidéo)</label>
          <div class="image-upload-field">
            <input type="text" name="media_url" id="contentMediaUrl" value="${content.media_url || ''}" placeholder="/uploads/..." readonly>
            <button type="button" class="btn btn-sm btn-secondary select-media">📁 Choisir</button>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('editContentModal')">Annuler</button>
          <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler submit
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      cta_label: formData.get('cta_label'),
      cta_url: formData.get('cta_url'),
      media_url: formData.get('media_url')
    };
    
    try {
      const sid = formData.get('sectionId');
      const cid = formData.get('contentId');
      
      let response;
      if (cid) {
        // Update existing
        response = await fetch(`/api/sections/${sid}/content/${cid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        // Create new
        response = await fetch(`/api/sections/${sid}/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      window.location.reload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  });
  
  // Handler sélection média
  modal.querySelector('.select-media').addEventListener('click', () => {
    const url = prompt('URL du média:');
    if (url) {
      modal.querySelector('#contentMediaUrl').value = url;
    }
  });
  
  return modal;
}

// ==========================================================================
// Ajout de carte (card_grid)
// ==========================================================================

document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-action="add-card"]');
  if (!addBtn) return;
  
  e.preventDefault();
  const sectionId = addBtn.dataset.sectionId;
  
  const modal = createCardModal(sectionId);
  document.body.appendChild(modal);
  openModal('addCardModal');
});

function createCardModal(sectionId, card = {}) {
  const modal = document.createElement('div');
  modal.id = 'addCardModal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${card.id ? 'Modifier la carte' : 'Ajouter une carte'}</h2>
        <button class="modal-close" onclick="closeModal('addCardModal')">&times;</button>
      </div>
      <form id="addCardForm">
        <input type="hidden" name="sectionId" value="${sectionId}">
        <input type="hidden" name="cardId" value="${card.id || ''}">
        
        <div class="form-group">
          <label for="cardTitle">Titre</label>
          <input type="text" name="title" id="cardTitle" value="${card.title || ''}" placeholder="Titre de la carte">
        </div>
        
        <div class="form-group">
          <label for="cardDescription">Description</label>
          <textarea name="description" id="cardDescription" rows="4" placeholder="Texte descriptif">${card.description || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label for="cardMediaUrl">Image/Vidéo</label>
          <div class="image-upload-field">
            <input type="text" name="media_url" id="cardMediaUrl" value="${card.media_url || ''}" placeholder="/uploads/..." readonly>
            <button type="button" class="btn btn-sm btn-secondary select-card-media">📁 Choisir</button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="cardLinkUrl">Lien</label>
          <input type="url" name="link_url" id="cardLinkUrl" value="${card.link_url || ''}" placeholder="https://...">
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('addCardModal')">Annuler</button>
          <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler submit
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      media_url: formData.get('media_url'),
      link_url: formData.get('link_url')
    };
    
    try {
      const sid = formData.get('sectionId');
      const response = await fetch(`/api/sections/${sid}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'ajout');
      
      window.location.reload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  });
  
  // Handler sélection média
  modal.querySelector('.select-card-media').addEventListener('click', () => {
    const url = prompt('URL du média:');
    if (url) {
      modal.querySelector('#cardMediaUrl').value = url;
    }
  });
  
  return modal;
}

// ==========================================================================
// Édition de carte existante
// ==========================================================================

document.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('[data-action="edit-card"]');
  if (!editBtn) return;
  
  e.preventDefault();
  const sectionId = editBtn.dataset.sectionId;
  const cardId = editBtn.dataset.cardId;
  
  try {
    const response = await fetch(`/api/sections/${sectionId}`);
    const section = await response.json();
    const card = section.cards.find(c => c.id == cardId);
    
    if (!card) throw new Error('Carte non trouvée');
    
    const modal = createCardModal(sectionId, card);
    document.body.appendChild(modal);
    openModal('addCardModal');
    
  } catch (error) {
    alert('Erreur lors du chargement de la carte');
  }
});

// ==========================================================================
// Suppression de carte
// ==========================================================================

document.addEventListener('click', async (e) => {
  const deleteBtn = e.target.closest('[data-action="delete-card"]');
  if (!deleteBtn) return;
  
  e.preventDefault();
  const sectionId = deleteBtn.dataset.sectionId;
  const cardId = deleteBtn.dataset.cardId;
  
  if (!confirm('Voulez-vous vraiment supprimer cette carte ?')) return;
  
  try {
    const response = await fetch(`/api/sections/${sectionId}/cards/${cardId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    
    window.location.reload();
  } catch (error) {
    alert('Erreur: ' + error.message);
  }
});

console.log('✅ Sections Edit JS initialisé');
