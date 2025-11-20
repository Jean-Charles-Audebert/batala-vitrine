/**
 * Cards Admin - Logique JavaScript
 * Gestion de l'interface d'administration des cartes
 */

class CardsAdmin {
  constructor() {
    this.sectionId = this.getSectionIdFromUrl();
    this.modal = document.getElementById('cardModal');
    this.form = document.getElementById('cardForm');
    this.modalTitle = document.getElementById('cardModalTitle');
    this.notifications = [];

    if (this.sectionId) {
      this.init();
    }
  }

  getSectionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('sectionId');
  }

  init() {
    this.bindEvents();
    this.loadCards();
    this.loadFonts();
    
    // Vérifier si on doit ouvrir la modale de création
    this.checkUrlAction();
  }

  bindEvents() {
    // Boutons d'action principaux
    document.querySelector('[data-action="new-card"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openNewCardModal();
    });

    // Fermeture modales
    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Soumission formulaire
    this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Édition cartes
    document.querySelectorAll('[data-action="edit-card"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.editCard(e));
    });

    // Suppression cartes
    document.querySelectorAll('[data-action="delete-card"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteCard(e));
    });

    // Drag & drop
    this.initDragAndDrop();

    // Sélecteurs médias
    this.initMediaSelectors();
  }

  // ========== CHARGEMENT ==========
  async loadCards() {
    try {
      const response = await fetch(`/api/sections/${this.sectionId}`);
      const section = await response.json();

      this.renderCards(section.cards || []);
    } catch (error) {
      this.showNotification('Erreur lors du chargement des cartes', 'error');
    }
  }

  renderCards(cards) {
    const tbody = document.getElementById('cards-tbody');
    if (!tbody) return;

    if (cards.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Aucune carte pour le moment. Créez-en une !</td></tr>';
      return;
    }

    tbody.innerHTML = cards.map(card => `
      <tr data-card-id="${card.id}" draggable="true">
        <td class="drag-handle">
          <span class="position-badge">${card.position ?? '∞'}</span>
          <span class="drag-icon">⋮⋮</span>
        </td>
        <td>
          <div class="card-preview">
            ${card.media_url ? `<img src="${card.media_url}" alt="" class="card-thumb">` : '<div class="card-thumb-placeholder">📄</div>'}
            <div class="card-info">
              <strong>${card.title || 'Sans titre'}</strong>
              <small>${card.description ? card.description.substring(0, 50) + '...' : 'Sans description'}</small>
            </div>
          </div>
        </td>
        <td>${card.media_type || '—'}</td>
        <td>${card.event_date ? new Date(card.event_date).toLocaleDateString('fr-FR') : '—'}</td>
        <td>
          <span class="badge badge-active">✓ Visible</span>
        </td>
        <td>
          <div class="actions">
            <button class="btn btn-sm btn-secondary" data-action="edit-card" data-card-id="${card.id}">
              <img src="/icons/edit.svg" alt="" class="icon"> Modifier
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete-card" data-card-id="${card.id}">
              <img src="/icons/trash.svg" alt="" class="icon">
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Re-bind events après rendu
    this.bindCardEvents();
  }

  bindCardEvents() {
    document.querySelectorAll('[data-action="edit-card"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.editCard(e));
    });

    document.querySelectorAll('[data-action="delete-card"]').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteCard(e));
    });
  }

  // ========== MODALES ==========
  openNewCardModal() {
    this.modalTitle.textContent = 'Nouvelle carte';
    this.form.reset();
    document.getElementById('cardId').value = '';
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
    const cardId = formData.get('cardId');

    const data = this.buildCardData(formData);

    try {
      const url = cardId ? `/api/sections/${this.sectionId}/cards/${cardId}` : `/api/sections/${this.sectionId}/cards`;
      const method = cardId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      this.closeModal();
      this.loadCards();
      this.showNotification('Carte sauvegardée avec succès', 'success');
    } catch (error) {
      this.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  buildCardData(formData) {
    return {
      title: formData.get('title') || null,
      description: formData.get('description') || null,
      media_url: formData.get('media_url') || null,
      media_type: formData.get('media_type') || 'image',
      link_url: formData.get('link_url') || null,
      bg_color: formData.get('bg_color') || null,
      text_color: formData.get('text_color') || null,
      event_date: formData.get('event_date') || null,
      position: formData.get('position') ? parseInt(formData.get('position')) : 0,
      // Nouveaux champs Phase 2
      title_font_id: formData.get('title_font_id') || null,
      description_font_id: formData.get('description_font_id') || null,
      title_color: formData.get('title_color') || null,
      description_color: formData.get('description_color') || null,
      border_color: formData.get('border_color') || null,
      border_width: formData.get('border_width') ? parseInt(formData.get('border_width')) : 0,
      border_radius: formData.get('border_radius') || 'small'
    };
  }

  // ========== ÉDITION ==========
  async editCard(e) {
    const cardId = e.currentTarget.dataset.cardId;

    try {
      // Récupérer la section complète pour trouver la carte
      const response = await fetch(`/api/sections/${this.sectionId}`);
      const section = await response.json();
      
      const card = section.cards.find(c => c.id == cardId);
      if (!card) {
        throw new Error('Carte non trouvée');
      }

      this.populateForm(card);
      this.modalTitle.textContent = 'Modifier la carte';
      this.showModal();
    } catch (error) {
      this.showNotification('Erreur lors du chargement de la carte', 'error');
    }
  }

  populateForm(card) {
    document.getElementById('cardId').value = card.id;
    document.getElementById('cardTitle').value = card.title || '';
    document.getElementById('cardDescription').value = card.description || '';
    document.getElementById('cardMediaUrl').value = card.media_url || '';
    document.getElementById('cardMediaType').value = card.media_type || 'image';
    document.getElementById('cardLinkUrl').value = card.link_url || '';
    document.getElementById('cardBgColor').value = card.bg_color || '#ffffff';
    document.getElementById('cardTextColor').value = card.text_color || '#333333';
    document.getElementById('cardEventDate').value = card.event_date ? card.event_date.split('T')[0] : '';
    document.getElementById('cardPosition').value = card.position || 0;

    // Nouveaux champs Phase 2
    document.getElementById('cardTitleFont').value = card.title_font_id || '';
    document.getElementById('cardDescriptionFont').value = card.description_font_id || '';
    document.getElementById('cardTitleColor').value = card.title_color || '#333333';
    document.getElementById('cardDescriptionColor').value = card.description_color || '#666666';
    document.getElementById('cardBorderColor').value = card.border_color || '#e9ecef';
    document.getElementById('cardBorderWidth').value = card.border_width || 0;
    document.getElementById('cardBorderRadius').value = card.border_radius || 'small';
  }

  // ========== SUPPRESSION ==========
  async deleteCard(e) {
    const cardId = e.currentTarget.dataset.cardId;

    if (!confirm('Voulez-vous vraiment supprimer cette carte ?')) return;

    try {
      const response = await fetch(`/api/sections/${this.sectionId}/cards/${cardId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      this.loadCards();
      this.showNotification('Carte supprimée avec succès', 'success');
    } catch (error) {
      this.showNotification('Erreur: ' + error.message, 'error');
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

      const tbody = document.getElementById('cards-tbody');
      const rows = [...tbody.querySelectorAll('tr[draggable="true"]')];
      const cardIds = rows.map(row => parseInt(row.dataset.cardId));

      try {
        const response = await fetch('/api/cards/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardIds })
        });

        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

        // Mettre à jour les badges de position
        rows.forEach((row, index) => {
          const badge = row.querySelector('.position-badge');
          if (badge) {
            badge.textContent = index + 1;
          }
        });

        this.showNotification('Ordre des cartes sauvegardé', 'success');
      } catch (error) {
        console.error('Erreur:', error);
        this.showNotification('Erreur lors de la sauvegarde de l\'ordre', 'error');
        this.loadCards(); // Recharger pour restaurer l'ordre
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
    document.getElementById('selectCardMedia')?.addEventListener('click', () => {
      this.openMediaPicker('cardMedia');
    });

    document.querySelectorAll('[data-action="close-media-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeMediaModal());
    });
  }

  async openMediaPicker(targetField) {
    const modal = document.getElementById('mediaPickerModal');
    const grid = document.getElementById('mediaGrid');

    try {
      const response = await fetch('/api/media');
      const media = await response.json();

      grid.innerHTML = '';

      if (media.length === 0) {
        grid.innerHTML = '<p class="empty-state">Aucun média trouvé. Uploadez-en un nouveau.</p>';
      } else {
        media.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'media-item';
          itemDiv.innerHTML = `
            <img src="${item.url}" alt="${item.name}" loading="lazy">
            <div class="media-name">${item.name}</div>
          `;
          itemDiv.addEventListener('click', () => {
            document.getElementById('cardMediaUrl').value = item.path;
            document.getElementById('cardMediaType').value = 'image';
            this.closeMediaModal();
          });
          grid.appendChild(itemDiv);
        });
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    } catch (error) {
      this.showNotification('Erreur lors du chargement des médias', 'error');
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

      const fontSelectors = ['cardTitleFont', 'cardDescriptionFont'];

      fontSelectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        if (!select) return;

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

  checkUrlAction() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'new') {
      // Attendre que les cartes soient chargées avant d'ouvrir la modale
      setTimeout(() => {
        this.openNewCardModal();
      }, 500);
    }
  }

  // ========== NOTIFICATIONS ==========
  showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    this.notifications.forEach(notification => notification.remove());
    this.notifications = [];

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);
    this.notifications.push(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
      this.removeNotification(notification);
    }, 5000);

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
  new CardsAdmin();
});