/**
 * Édition inline des sections v2
 * Modales visuelles sur la page d'accueil
 */

/* global document, confirm, window, fetch, alert */

// Import du media picker
import { openMediaPicker } from './media-picker.js';

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

function removeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
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
        <button class="modal-close" data-close-modal="editSectionModal">&times;</button>
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
            <button type="button" class="btn btn-sm btn-secondary select-bg-image"><img src="/icons/folder.svg" alt="" class="icon"> Choisir</button>
            ${section.bg_image ? '<button type="button" class="btn btn-sm btn-danger clear-bg-image" title="Supprimer l\'image"><img src="/icons/trash.svg" alt="" class="icon"></button>' : ''}
          </div>
          <small class="form-hint">💡 <strong>Tailles recommandées pour hero :</strong><br>
          • Bannière large : 2700×600px (ratio 4.5:1) - affichage optimal<br>
          • Standard : 1920×427px (ratio 4.5:1)<br>
          • Minimum : 1350×300px (ratio 4.5:1)<br>
          ⚠️ Les images ou vidéos carrées ou verticales seront recadrées (haut/bas perdus)</small>
        </div>
        
        <div class="form-group">
          <label for="sectionBgVideo"><img src="/icons/video.svg" alt="" class="icon"> Vidéo locale (MP4)</label>
          <div class="image-upload-field">
            <input type="text" name="bg_video" id="sectionBgVideo" value="${section.bg_video || ''}" placeholder="/uploads/video.mp4" readonly>
            <button type="button" class="btn btn-sm btn-secondary select-bg-video"><img src="/icons/folder.svg" alt="" class="icon"> Choisir</button>
            ${section.bg_video ? '<button type="button" class="btn btn-sm btn-danger clear-bg-video" title="Supprimer la vidéo"><img src="/icons/trash.svg" alt="" class="icon"></button>' : ''}
          </div>
          <small class="form-hint">Fichier MP4 local uniquement (max 50 MB)</small>
        </div>
        
        <div class="form-group">
          <label for="sectionBgYoutube"><img src="/icons/youtube.svg" alt="" class="icon"> Vidéo YouTube</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" name="bg_youtube" id="sectionBgYoutube" value="${section.bg_youtube || ''}" placeholder="https://youtu.be/... ou https://youtube.com/watch?v=..." style="flex: 1;">
            ${section.bg_youtube ? '<button type="button" class="btn btn-sm btn-danger clear-bg-youtube" title="Supprimer l\'URL YouTube"><img src="/icons/trash.svg" alt="" class="icon"></button>' : ''}
          </div>
          <small class="form-hint">URL YouTube complète (prioritaire sur MP4 local)</small>
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
          <button type="button" class="btn btn-secondary" data-close-modal="editSectionModal">Annuler</button>
          <button type="submit" class="btn btn-primary"><img src="/icons/save.svg" alt="" class="icon"> Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler close buttons
  modal.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal('editSectionModal');
      removeModal('editSectionModal');
    });
  });
  
  // Handler submit
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const sectionId = formData.get('sectionId');
    
    const data = {
      layout: formData.get('layout') || null,
      bg_color: formData.get('bg_color') || null,
      bg_image: formData.get('bg_image') || null,
      bg_video: formData.get('bg_video') || null,
      bg_youtube: formData.get('bg_youtube') || null,
      is_transparent: formData.get('is_transparent') === 'on',
      is_visible: formData.get('is_visible') === 'on',
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
    openMediaPicker((url) => {
      modal.querySelector('#sectionBgImage').value = url;
    }, 'image', 'bg_image'); // bg_image = pas d'optimisation (garde dimensions originales)
  });
  
  // Handler suppression image
  const clearBgImageBtn = modal.querySelector('.clear-bg-image');
  if (clearBgImageBtn) {
    clearBgImageBtn.addEventListener('click', async () => {
      const input = modal.querySelector('#sectionBgImage');
      const filePath = input.value;
      
      if (filePath && filePath.startsWith('/uploads/')) {
        if (confirm('Supprimer définitivement ce fichier du serveur ?')) {
          try {
            await fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath })
            });
          } catch (err) {
            console.warn('Erreur suppression fichier:', err);
          }
        }
      }
      input.value = '';
    });
  }
  
  // Handler sélection vidéo
  modal.querySelector('.select-bg-video').addEventListener('click', () => {
    openMediaPicker((url) => {
      modal.querySelector('#sectionBgVideo').value = url;
    }, 'video');
  });
  
  // Handler suppression vidéo
  const clearBgVideoBtn = modal.querySelector('.clear-bg-video');
  if (clearBgVideoBtn) {
    clearBgVideoBtn.addEventListener('click', async () => {
      const input = modal.querySelector('#sectionBgVideo');
      const filePath = input.value;
      
      if (filePath && filePath.startsWith('/uploads/')) {
        if (confirm('Supprimer définitivement ce fichier du serveur ?')) {
          try {
            await fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath })
            });
          } catch (err) {
            console.warn('Erreur suppression fichier:', err);
          }
        }
      }
      input.value = '';
    });
  }
  
  // Handler suppression YouTube
  const clearBgYoutubeBtn = modal.querySelector('.clear-bg-youtube');
  if (clearBgYoutubeBtn) {
    clearBgYoutubeBtn.addEventListener('click', () => {
      modal.querySelector('#sectionBgYoutube').value = '';
    });
  }
  
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
    
    // Si c'est un hero, utiliser la modale spéciale avec tabs et positionnement
    if (section.type === 'hero') {
      const modal = await createHeroContentModal(sectionId, section, content);
      document.body.appendChild(modal);
      openModal('editHeroContentModal');
    } else {
      const modal = createContentModal(sectionId, content);
      document.body.appendChild(modal);
      openModal('editContentModal');
    }
    
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
        <button class="modal-close" data-close-modal="editContentModal">&times;</button>
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
            <button type="button" class="btn btn-sm btn-secondary select-media"><img src="/icons/folder.svg" alt="" class="icon"> Choisir</button>
            ${content.media_url ? '<button type="button" class="btn btn-sm btn-danger clear-content-media" title="Supprimer le média"><img src="/icons/trash.svg" alt="" class="icon"></button>' : ''}
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close-modal="editContentModal">Annuler</button>
          <button type="submit" class="btn btn-primary"><img src="/icons/save.svg" alt="" class="icon"> Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler close buttons
  modal.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal('editContentModal');
      removeModal('editContentModal');
    });
  });
  
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
    openMediaPicker((url) => {
      modal.querySelector('#contentMediaUrl').value = url;
    }, 'both');
  });
  
  // Handler suppression média
  const clearContentMediaBtn = modal.querySelector('.clear-content-media');
  if (clearContentMediaBtn) {
    clearContentMediaBtn.addEventListener('click', async () => {
      const input = modal.querySelector('#contentMediaUrl');
      const filePath = input.value;
      
      if (filePath && filePath.startsWith('/uploads/')) {
        if (confirm('Supprimer définitivement ce fichier du serveur ?')) {
          try {
            await fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath })
            });
          } catch (err) {
            console.warn('Erreur suppression fichier:', err);
          }
        }
      }
      input.value = '';
    });
  }
  
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
        <button class="modal-close" data-close-modal="addCardModal">&times;</button>
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
            <button type="button" class="btn btn-sm btn-secondary select-card-media"><img src="/icons/folder.svg" alt="" class="icon"> Choisir</button>
            ${card.media_url ? '<button type="button" class="btn btn-sm btn-danger clear-card-media" title="Supprimer le média"><img src="/icons/trash.svg" alt="" class="icon"></button>' : ''}
          </div>
        </div>
        
        <div class="form-group">
          <label for="cardLinkUrl">Lien</label>
          <input type="url" name="link_url" id="cardLinkUrl" value="${card.link_url || ''}" placeholder="https://...">
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close-modal="addCardModal">Annuler</button>
          <button type="submit" class="btn btn-primary"><img src="/icons/save.svg" alt="" class="icon"> Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler close buttons
  modal.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal('addCardModal');
      removeModal('addCardModal');
    });
  });
  
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
    openMediaPicker((url) => {
      modal.querySelector('#cardMediaUrl').value = url;
    }, 'both');
  });
  
  // Handler suppression média
  const clearCardMediaBtn = modal.querySelector('.clear-card-media');
  if (clearCardMediaBtn) {
    clearCardMediaBtn.addEventListener('click', async () => {
      const input = modal.querySelector('#cardMediaUrl');
      const filePath = input.value;
      
      if (filePath && filePath.startsWith('/uploads/')) {
        if (confirm('Supprimer définitivement ce fichier du serveur ?')) {
          try {
            await fetch('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath })
            });
          } catch (err) {
            console.warn('Erreur suppression fichier:', err);
          }
        }
      }
      input.value = '';
    });
  }
  
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

// ==========================================================================
// FAB - Créer une nouvelle section
// ==========================================================================

const fabAddSection = document.getElementById('fabAddSection');
if (fabAddSection) {
  fabAddSection.addEventListener('click', () => {
    const modal = createNewSectionModal();
    document.body.appendChild(modal);
    openModal('newSectionModal');
  });
}

function createNewSectionModal() {
  const modal = document.createElement('div');
  modal.id = 'newSectionModal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nouvelle section</h2>
        <button class="modal-close" data-close-modal="newSectionModal">&times;</button>
      </div>
      <form id="newSectionForm">
        <div class="form-group">
          <label for="newSectionType">Type de section *</label>
          <select name="type" id="newSectionType" required>
            <option value="">-- Choisir un type --</option>
            <option value="hero">🎯 Hero (En-tête principal)</option>
            <option value="content">📝 Contenu (Texte + image)</option>
            <option value="card_grid">🎴 Grille de cartes</option>
            <option value="gallery">🖼️ Galerie (Photos/vidéos)</option>
            <option value="footer">🔻 Pied de page</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="newSectionTitle">Titre (optionnel)</label>
          <input type="text" name="title" id="newSectionTitle" placeholder="Label pour l'admin">
          <small class="form-hint">Ce titre n'est visible que dans l'administration</small>
        </div>
        
        <div class="form-group">
          <label for="newSectionPosition">Position</label>
          <input type="number" name="position" id="newSectionPosition" min="0" step="1" placeholder="0">
          <small class="form-hint">Laissez vide pour ajouter à la fin</small>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close-modal="newSectionModal">Annuler</button>
          <button type="submit" class="btn btn-primary">✨ Créer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler close buttons
  modal.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal('newSectionModal');
      removeModal('newSectionModal');
    });
  });
  
  // Handler submit
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      type: formData.get('type'),
      title: formData.get('title') || `Section ${formData.get('type')}`,
      position: formData.get('position') ? parseInt(formData.get('position')) : null,
      is_visible: true
    };
    
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création');
      
      window.location.reload();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  });
  
  return modal;
}

// ==========================================================================
// Édition contenu HERO (logo, titre, social, navigation)
// ==========================================================================
async function createHeroContentModal(sectionId, section = {}, content = {}) {
  // Charger les données nécessaires
  const [fontsRes, sectionsRes, socialRes] = await Promise.all([
    fetch('/api/fonts'),
    fetch('/api/sections'),
    fetch('/api/social-links?location=header,both')
  ]);
  
  const fonts = await fontsRes.json();
  const allSections = await sectionsRes.json();
  const socialLinks = await socialRes.json();
  
  // Filtrer les autres sections (pas le hero actuel) pour la navigation
  const otherSections = allSections.filter(s => s.id !== sectionId && s.type !== 'hero');
  
  const modal = document.createElement('div');
  modal.id = 'editHeroContentModal';
  modal.className = 'modal modal-large';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Contenu du Header</h2>
        <button class="modal-close" data-close-modal="editHeroContentModal">&times;</button>
      </div>
      
      <div class="modal-tabs">
        <button class="tab-btn active" data-tab="logo">Logo</button>
        <button class="tab-btn" data-tab="title">Titre</button>
        <button class="tab-btn" data-tab="social">Réseaux sociaux</button>
        <button class="tab-btn" data-tab="navigation">Navigation</button>
      </div>
      
      <form id="editHeroContentForm">
        <input type="hidden" name="sectionId" value="${sectionId}">
        <input type="hidden" name="contentId" value="${content.id || ''}">
        
        <!-- TAB: Logo -->
        <div class="tab-content active" data-tab-content="logo">
          <div class="form-group">
            <label for="heroLogoUrl">Logo</label>
            <div class="image-upload-field">
              <input type="text" name="logo_url" id="heroLogoUrl" value="${section.logo_url || ''}" placeholder="/uploads/logo.png" readonly>
              <button type="button" class="btn btn-sm btn-secondary select-logo"><img src="/icons/folder.svg" alt="" class="icon"> Choisir</button>
              ${section.logo_url ? '<button type="button" class="btn btn-sm btn-danger clear-logo" title="Supprimer le logo"><img src="/icons/trash.svg" alt="" class="icon"></button>' : ''}
            </div>
          </div>
          
          <div class="form-group">
            <label for="heroLogoWidth">Largeur du logo (px)</label>
            <input type="number" name="logo_width" id="heroLogoWidth" value="${section.logo_width || 150}" min="50" max="500" step="10">
          </div>
          
          <div class="form-group">
            <label>Position du logo</label>
            <div class="position-grid">
              <input type="hidden" name="logo_position_h" id="logoPositionH" value="${section.logo_position_h || 'center'}">
              <input type="hidden" name="logo_position_v" id="logoPositionV" value="${section.logo_position_v || 'center'}">
              ${generatePositionGrid('logo', section.logo_position_h || 'center', section.logo_position_v || 'center')}
            </div>
          </div>
        </div>
        
        <!-- TAB: Titre -->
        <div class="tab-content" data-tab-content="title">
          <div class="form-group">
            <label for="heroTitleText">Titre</label>
            <input type="text" name="title" id="heroTitleText" value="${content.title || ''}" placeholder="Bienvenue sur notre site">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="heroTitleFont">Police</label>
              <select name="title_font_id" id="heroTitleFont">
                <option value="">Par défaut</option>
                ${fonts.map(f => `<option value="${f.id}" ${content.title_font_id == f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="heroTitleColor">Couleur</label>
              <input type="color" name="title_color" id="heroTitleColor" value="${content.title_color || '#ffffff'}">
            </div>
          </div>
          
          <div class="form-group">
            <label>Position du titre</label>
            <div class="position-grid">
              <input type="hidden" name="title_position_h" id="titlePositionH" value="${content.title_position_h || 'center'}">
              <input type="hidden" name="title_position_v" id="titlePositionV" value="${content.title_position_v || 'center'}">
              ${generatePositionGrid('title', content.title_position_h || 'center', content.title_position_v || 'center')}
            </div>
          </div>
        </div>
        
        <!-- TAB: Réseaux sociaux -->
        <div class="tab-content" data-tab-content="social">
          <div class="form-group">
            <label>
              <input type="checkbox" name="show_social_links" ${section.show_social_links ? 'checked' : ''}>
              Afficher les icônes des réseaux sociaux
            </label>
            <small class="form-hint">Liens configurés : ${socialLinks.length > 0 ? socialLinks.map(s => s.platform).join(', ') : 'Aucun'}</small>
          </div>
          
          <div class="form-group">
            <label>Position des icônes sociales</label>
            <div class="position-grid">
              <input type="hidden" name="social_position_h" id="socialPositionH" value="${section.social_position_h || 'right'}">
              <input type="hidden" name="social_position_v" id="socialPositionV" value="${section.social_position_v || 'top'}">
              ${generatePositionGrid('social', section.social_position_h || 'right', section.social_position_v || 'top')}
            </div>
          </div>
        </div>
        
        <!-- TAB: Navigation -->
        <div class="tab-content" data-tab-content="navigation">
          <div class="form-group">
            <label>
              <input type="checkbox" name="show_nav_links" ${section.show_nav_links ? 'checked' : ''}>
              Afficher des liens de navigation
            </label>
          </div>
          
          <div class="form-group">
            <label>Position de la navigation</label>
            <div class="position-grid">
              <input type="hidden" name="nav_position_h" id="navPositionH" value="${section.nav_position_h || 'right'}">
              <input type="hidden" name="nav_position_v" id="navPositionV" value="${section.nav_position_v || 'center'}">
              ${generatePositionGrid('nav', section.nav_position_h || 'right', section.nav_position_v || 'center')}
            </div>
          </div>
          
          <div class="form-group">
            <label>Sections disponibles</label>
            <div id="navLinksList">
              ${otherSections.length > 0 ? otherSections.map(s => `
                <div class="nav-link-item">
                  <input type="checkbox" name="nav_sections[]" value="${s.id}" id="nav_${s.id}">
                  <label for="nav_${s.id}">${s.title || s.type}</label>
                </div>
              `).join('') : '<p class="text-muted">Aucune autre section disponible</p>'}
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close-modal="editHeroContentModal">Annuler</button>
          <button type="submit" class="btn btn-primary"><img src="/icons/save.svg" alt="" class="icon"> Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  
  // Handler tabs
  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      modal.querySelector(`[data-tab-content="${btn.dataset.tab}"]`).classList.add('active');
    });
  });
  
  // Handler position grids
  modal.querySelectorAll('.position-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const element = cell.dataset.element;
      const h = cell.dataset.h;
      const v = cell.dataset.v;
      
      // Update hidden inputs
      modal.querySelector(`#${element}PositionH`).value = h;
      modal.querySelector(`#${element}PositionV`).value = v;
      
      // Update visual selection
      modal.querySelectorAll(`.position-cell[data-element="${element}"]`).forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
    });
  });
  
  // Handler logo upload
  modal.querySelector('.select-logo')?.addEventListener('click', () => {
    openMediaPicker((url) => {
      modal.querySelector('#heroLogoUrl').value = url;
    }, 'image');
  });
  
  // Handler clear logo
  modal.querySelector('.clear-logo')?.addEventListener('click', async () => {
    const input = modal.querySelector('#heroLogoUrl');
    const filePath = input.value;
    
    if (filePath && filePath.startsWith('/uploads/')) {
      if (confirm('Supprimer définitivement ce logo du serveur ?')) {
        try {
          await fetch('/api/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath })
          });
        } catch (err) {
          console.warn('Erreur suppression logo:', err);
        }
      }
    }
    input.value = '';
  });
  
  // Handler close buttons
  modal.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal('editHeroContentModal');
      removeModal('editHeroContentModal');
    });
  });
  
  // Handler submit
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const navSections = [];
    formData.getAll('nav_sections[]').forEach(id => navSections.push(parseInt(id)));
    
    const data = {
      // Section data (logo, positions, flags)
      section: {
        logo_url: formData.get('logo_url'),
        logo_width: parseInt(formData.get('logo_width')),
        logo_position_h: formData.get('logo_position_h'),
        logo_position_v: formData.get('logo_position_v'),
        show_social_links: formData.get('show_social_links') === 'on',
        social_position_h: formData.get('social_position_h'),
        social_position_v: formData.get('social_position_v'),
        show_nav_links: formData.get('show_nav_links') === 'on',
        nav_position_h: formData.get('nav_position_h'),
        nav_position_v: formData.get('nav_position_v')
      },
      // Content data (title, font, color, positions)
      content: {
        title: formData.get('title'),
        title_font_id: formData.get('title_font_id') || null,
        title_color: formData.get('title_color'),
        title_position_h: formData.get('title_position_h'),
        title_position_v: formData.get('title_position_v')
      },
      // Navigation links
      nav_sections: navSections
    };
    
    try {
      const sid = formData.get('sectionId');
      const response = await fetch(`/api/sections/${sid}/hero-content`, {
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
  
  return modal;
}

// Helper: Génère une grille 3x3 pour le positionnement visuel
function generatePositionGrid(elementName, currentH, currentV) {
  const positions = [
    { v: 'top', h: 'left', label: '↖' },
    { v: 'top', h: 'center', label: '↑' },
    { v: 'top', h: 'right', label: '↗' },
    { v: 'center', h: 'left', label: '←' },
    { v: 'center', h: 'center', label: '●' },
    { v: 'center', h: 'right', label: '→' },
    { v: 'bottom', h: 'left', label: '↙' },
    { v: 'bottom', h: 'center', label: '↓' },
    { v: 'bottom', h: 'right', label: '↘' }
  ];
  
  return positions.map(p => {
    const isSelected = p.h === currentH && p.v === currentV;
    return `<button type="button" class="position-cell ${isSelected ? 'selected' : ''}" data-element="${elementName}" data-h="${p.h}" data-v="${p.v}">${p.label}</button>`;
  }).join('');
}

console.log('✅ Sections Edit JS initialisé');
