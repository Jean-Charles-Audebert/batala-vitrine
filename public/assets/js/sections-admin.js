/**
 * Sections Admin - Logique JavaScript
 * Gestion de l'interface d'administration des sections
 */

class SectionsAdmin {
  constructor() {
    this.modal = document.getElementById('sectionModal');
    this.form = document.getElementById('sectionForm');
    this.modalTitle = document.getElementById('sectionModalTitle');
    this.notifications = [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadFonts();
  }

  bindEvents() {
    // Boutons d'action principaux
    document.querySelector('[data-action="new-section"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openNewSectionModal();
    });

    // Fermeture modales
    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Soumission formulaire
    this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Édition sections
    document.querySelectorAll('[data-action="edit-section"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.editSection(e));
    });

    // Suppression sections
    document.querySelectorAll('[data-action="delete-section"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteSection(e));
    });

    // Gestion contenu
    document.querySelectorAll('[data-action="view-content"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.viewContent(e));
    });

    // Gestion cartes
    document.querySelectorAll('[data-action="manage-cards"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.manageCards(e));
    });

    // Drag & drop
    this.initDragAndDrop();

    // Sélecteurs médias
    this.initMediaSelectors();
  }

  // ========== MODALES ==========
  openNewSectionModal() {
    this.modalTitle.textContent = 'Nouvelle section';
    this.form.reset();
    document.getElementById('sectionId').value = '';
    this.showModal();
  }

  showModal() {
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
  }

  closeModal() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
  }

  // ========== FORMULAIRE ==========
  async handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);
    const sectionId = formData.get('sectionId');

    const data = this.buildSectionData(formData, sectionId);

    try {
      const url = sectionId ? `/api/sections/${sectionId}` : '/api/sections';
      const method = sectionId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      window.location.reload();
    } catch (error) {
      this.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  buildSectionData(formData, sectionId) {
    return {
      type: formData.get('type'),
      title: formData.get('title'),
      position: formData.get('position') ? parseInt(formData.get('position')) : null,
      layout: formData.get('layout') || null,
      bg_color: formData.get('bg_color') || null,
      bg_image: formData.get('bg_image') || null,
      bg_video: formData.get('bg_video') || null,
      bg_youtube: formData.get('bg_youtube') || null,
      is_transparent: formData.get('is_transparent') === 'on',
      is_visible: formData.get('is_visible') === 'on',
      // Nouveaux champs Phase 2
      title_font_id: formData.get('title_font_id') || null,
      subtitle_font_id: formData.get('subtitle_font_id') || null,
      text_font_id: formData.get('text_font_id') || null,
      title_color: formData.get('title_color') || null,
      subtitle_color: formData.get('subtitle_color') || null,
      text_color: formData.get('text_color') || null,
      accent_color: formData.get('accent_color') || null,
      border_radius: formData.get('border_radius') || 'none',
      shadow: formData.get('shadow') || 'none',
      padding_top: formData.get('padding_top') || 'medium',
      padding_bottom: formData.get('padding_bottom') || 'medium'
    };
  }

  // ========== ÉDITION ==========
  async editSection(e) {
    const sectionId = e.currentTarget.dataset.sectionId;

    try {
      const response = await fetch(`/api/sections/${sectionId}`);
      const section = await response.json();

      this.populateForm(section);
      this.modalTitle.textContent = 'Modifier la section';
      this.showModal();
    } catch (error) {
      this.showNotification('Erreur lors du chargement de la section', 'error');
    }
  }

  populateForm(section) {
    document.getElementById('sectionId').value = section.id;
    document.getElementById('sectionType').value = section.type;
    document.getElementById('sectionTitle').value = section.title;
    document.getElementById('sectionPosition').value = section.position ?? '';
    document.getElementById('sectionLayout').value = section.layout || '';
    document.getElementById('sectionBgColor').value = section.bg_color || '#ffffff';
    document.getElementById('sectionBgImage').value = section.bg_image || '';
    document.getElementById('sectionBgVideo').value = section.bg_video || '';
    document.getElementById('sectionBgYoutube').value = section.bg_youtube || '';
    document.getElementById('sectionTransparent').checked = section.is_transparent;
    document.getElementById('sectionVisible').checked = section.is_visible;

    // Nouveaux champs Phase 2
    document.getElementById('sectionTitleFont').value = section.title_font_id || '';
    document.getElementById('sectionSubtitleFont').value = section.subtitle_font_id || '';
    document.getElementById('sectionTextFont').value = section.text_font_id || '';
    document.getElementById('sectionTitleColor').value = section.title_color || '#333333';
    document.getElementById('sectionSubtitleColor').value = section.subtitle_color || '#666666';
    document.getElementById('sectionTextColor').value = section.text_color || '#333333';
    document.getElementById('sectionAccentColor').value = section.accent_color || '#007bff';
    document.getElementById('sectionBorderRadius').value = section.border_radius || 'none';
    document.getElementById('sectionShadow').value = section.shadow || 'none';
    document.getElementById('sectionPaddingTop').value = section.padding_top || 'medium';
    document.getElementById('sectionPaddingBottom').value = section.padding_bottom || 'medium';
  }

  // ========== SUPPRESSION ==========
  async deleteSection(e) {
    const sectionId = e.currentTarget.dataset.sectionId;

    if (!confirm('Voulez-vous vraiment supprimer cette section ?')) return;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      window.location.reload();
    } catch (error) {
      this.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  // ========== CONTENU & CARTES ==========
  async viewContent(e) {
    const sectionId = e.currentTarget.dataset.sectionId;

    try {
      const response = await fetch(`/api/sections/${sectionId}`);
      const section = await response.json();

      if (section.content && section.content.length > 0) {
        this.showNotification(`Contenu de la section: ${JSON.stringify(section.content, null, 2)}`, 'info');
      } else {
        this.showNotification('Cette section n\'a pas encore de contenu.', 'info');
      }
    } catch (error) {
      this.showNotification('Erreur lors du chargement du contenu', 'error');
    }
  }

  async manageCards(e) {
    const sectionId = e.currentTarget.dataset.sectionId;

    try {
      const response = await fetch(`/api/sections/${sectionId}`);
      const section = await response.json();

      if (section.cards && section.cards.length > 0) {
        this.showNotification(`Cartes de la section (${section.cards.length}): ${section.cards.map(c => c.title || 'Sans titre').join(', ')} - Modale de gestion à venir...`, 'info');
      } else {
        this.showNotification('Cette section n\'a pas encore de cartes. Modale d\'ajout à venir...', 'info');
      }
    } catch (error) {
      this.showNotification('Erreur lors du chargement des cartes', 'error');
    }
  }

  // ========== DRAG & DROP ==========
  initDragAndDrop() {
    let draggedRow = null;

    document.querySelectorAll('tr[draggable="true"]').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedRow = row;
        row.classList.add('dragging');
      });

      row.addEventListener('dragend', (e) => {
        row.classList.remove('dragging');
        draggedRow = null;
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = this.getDragAfterElement(e.currentTarget.parentElement, e.clientY);
        const tbody = e.currentTarget.parentElement;

        if (afterElement == null) {
          tbody.appendChild(draggedRow);
        } else {
          tbody.insertBefore(draggedRow, afterElement);
        }
      });
    });

    // Sauvegarder l'ordre
    document.addEventListener('dragend', async () => {
      if (!draggedRow) return;

      const tbody = document.getElementById('sections-tbody');
      const rows = [...tbody.querySelectorAll('tr[draggable="true"]')];
      const sectionIds = rows.map(row => parseInt(row.dataset.sectionId));

      try {
        const response = await fetch('/api/sections/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionIds })
        });

        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

        // Mettre à jour les badges de position
        rows.forEach((row, index) => {
          const badge = row.querySelector('.position-badge');
          if (badge) {
            badge.textContent = index + 1;
          }
        });

        this.showNotification('Ordre des sections sauvegardé', 'success');
      } catch (error) {
        console.error('Erreur:', error);
        this.showNotification('Erreur lors de la sauvegarde de l\'ordre', 'error');
        window.location.reload();
      }
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('tr[draggable="true"]:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // ========== MÉDIAS ==========
  initMediaSelectors() {
    // Images
    document.getElementById('selectBgImage')?.addEventListener('click', () => {
      this.openMediaPicker('image');
    });

    // Vidéos
    document.getElementById('selectBgVideo')?.addEventListener('click', () => {
      this.openMediaPicker('video');
    });

    // Fermeture modales médias
    document.querySelectorAll('[data-action="close-image-modal"], [data-action="close-video-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeMediaModal());
    });

    // Upload (placeholder)
    document.getElementById('uploadNewImage')?.addEventListener('click', () => {
      this.showNotification('Fonctionnalité d\'upload à implémenter. Pour l\'instant, uploadez les images manuellement dans public/uploads/', 'info');
    });

    document.getElementById('uploadNewVideo')?.addEventListener('click', () => {
      this.showNotification('Fonctionnalité d\'upload à implémenter. Pour l\'instant, uploadez les vidéos manuellement dans public/uploads/', 'info');
    });
  }

  async openMediaPicker(type) {
    const modal = document.getElementById(`${type}PickerModal`);
    const grid = document.getElementById(`${type}Grid`);

    try {
      const response = await fetch(`/api/${type === 'image' ? 'media' : 'videos'}`);
      const media = await response.json();

      grid.innerHTML = '';

      if (media.length === 0) {
        grid.innerHTML = `<p class="empty-state">Aucune ${type === 'image' ? 'image' : 'vidéo'} trouvée. Uploadez-en une nouvelle.</p>`;
      } else {
        media.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = `${type}-item`;

          if (type === 'image') {
            itemDiv.innerHTML = `
              <img src="${item.url}" alt="${item.name}" loading="lazy">
              <div class="${type}-name">${item.name}</div>
            `;
          } else {
            itemDiv.innerHTML = `
              <video width="150" height="100" controls>
                <source src="${item.url}" type="video/mp4">
                Votre navigateur ne supporte pas la vidéo.
              </video>
              <div class="${type}-name">${item.name}</div>
            `;
          }

          itemDiv.addEventListener('click', () => {
            document.getElementById(`sectionBg${type === 'image' ? 'Image' : 'Video'}`).value = item.path;
            this.closeMediaModal();
          });

          grid.appendChild(itemDiv);
        });
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    } catch (error) {
      this.showNotification(`Erreur lors du chargement des ${type === 'image' ? 'images' : 'vidéos'}`, 'error');
    }
  }

  closeMediaModal() {
    document.querySelectorAll('.modal[id*="PickerModal"]').forEach(modal => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  // ========== POLICES ==========
  async loadFonts() {
    try {
      const response = await fetch('/api/fonts');
      const fonts = await response.json();

      const fontSelectors = ['sectionTitleFont', 'sectionSubtitleFont', 'sectionTextFont'];

      fontSelectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        if (!select) return;

        // Garder l'option par défaut
        select.innerHTML = '<option value="">— Police par défaut —</option>';

        fonts.forEach(font => {
          const option = document.createElement('option');
          option.value = font.id;
          option.textContent = `${font.name} (${font.source})`;
          option.style.fontFamily = font.font_family || font.name;
          select.appendChild(option);
        });
      });
    } catch (error) {
      console.error('Erreur chargement polices:', error);
    }
  }

  // ========== NOTIFICATIONS ==========
  showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    this.notifications.forEach(notification => notification.remove());
    this.notifications = [];

    // Créer la nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    // Ajouter au DOM
    document.body.appendChild(notification);
    this.notifications.push(notification);

    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
      this.removeNotification(notification);
    }, 5000);

    // Fermeture manuelle
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });
  }

  removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
      this.notifications = this.notifications.filter(n => n !== notification);
    }, 300);
  }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new SectionsAdmin();
});