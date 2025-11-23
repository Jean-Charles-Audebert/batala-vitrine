/**
 * Editor JavaScript
 * Interface WYSIWYG pour l'édition des sections et éléments
 */

// Déclaration globale pour SortableJS
/* global Sortable */

class Editor {
  constructor() {
    this.sections = window.pageData.sections || [];
    this.page = window.pageData.page || {};
    this.fonts = window.pageData.fonts || [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.initSortable();
    this.updateUI();
    console.log('Éditeur initialisé');
  }

  bindEvents() {
    // Boutons principaux
    document.getElementById('save-btn').addEventListener('click', () => this.saveAll());
    document.getElementById('add-section-btn').addEventListener('click', () => this.showAddSectionModal());

    // Boutons sections
    document.addEventListener('click', (e) => {
      if (e.target.closest('.section-settings-btn')) {
        const sectionId = parseInt(e.target.closest('.section-settings-btn').dataset.sectionId);
        this.showSectionSettingsModal(sectionId);
      }

      if (e.target.closest('.section-toggle-btn')) {
        const sectionId = parseInt(e.target.closest('.section-toggle-btn').dataset.sectionId);
        this.toggleSectionVisibility(sectionId);
      }

      if (e.target.closest('.section-delete-btn')) {
        const sectionId = parseInt(e.target.closest('.section-delete-btn').dataset.sectionId);
        this.deleteSection(sectionId);
      }

      // Boutons éléments
      if (e.target.closest('.add-element-btn')) {
        const sectionId = parseInt(e.target.closest('.add-element-btn').dataset.sectionId);
        this.showAddElementModal(sectionId);
      }

      if (e.target.closest('.element-edit-btn')) {
        const elementId = parseInt(e.target.closest('.element-edit-btn').dataset.elementId);
        this.showElementEditModal(elementId);
      }

      if (e.target.closest('.element-delete-btn')) {
        const elementId = parseInt(e.target.closest('.element-delete-btn').dataset.elementId);
        this.deleteElement(elementId);
      }

      // Boutons modales éléments
      if (e.target.closest('#element-save-btn')) {
        this.saveElement();
      }

      if (e.target.closest('#element-cancel-btn')) {
        this.closeModals();
      }

      // Modals
      if (e.target.closest('.modal-close') || (e.target.classList.contains('modal') && e.target === e.currentTarget)) {
        this.closeModals();
      }

      // Types d'éléments
      if (e.target.closest('.element-type-btn')) {
        const type = e.target.closest('.element-type-btn').dataset.type;
        const modal = document.getElementById('add-element-modal');
        const sectionId = parseInt(modal.dataset.sectionId);
        this.addElement(sectionId, type);
      }
    });
  }

  initSortable() {
    // Sections
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
      new Sortable(sectionsContainer, {
        handle: '.section-header',
        animation: 150,
        onEnd: () => {
          this.updateSectionPositions();
        }
      });
    }

    // Éléments dans chaque section
    document.querySelectorAll('.elements-container').forEach(container => {
      new Sortable(container, {
        handle: '.element-drag-handle',
        animation: 150,
        onEnd: () => {
          const sectionId = parseInt(container.dataset.sectionId);
          this.updateElementPositions(sectionId);
        }
      });
    });
  }

  updateUI() {
    const visibleCount = this.sections.filter(s => s.is_visible).length;
    const visibleCountElement = document.getElementById('visible-count');
    if (visibleCountElement) {
      visibleCountElement.textContent = visibleCount;
    }
  }

  // API Calls
  async apiCall(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`/api${endpoint}`, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  // Section Methods
  async toggleSectionVisibility(sectionId) {
    try {
      const section = this.sections.find(s => s.id === sectionId);
      if (!section) return;

      const newVisibility = !section.is_visible;
      await this.apiCall(`/sections/${sectionId}`, 'PATCH', {
        is_visible: newVisibility
      });

      section.is_visible = newVisibility;
      this.updateSectionUI(sectionId);
      this.updateUI();
    } catch (error) {
      console.error('Erreur toggle visibility:', error);
      alert('Erreur lors de la modification de la visibilité');
    }
  }

  async deleteSection(sectionId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;

    try {
      await this.apiCall(`/sections/${sectionId}`, 'DELETE');
      this.sections = this.sections.filter(s => s.id !== sectionId);
      const sectionElement = document.querySelector(`.section-wrapper[data-section-id="${sectionId}"]`);
      if (sectionElement) {
        sectionElement.remove();
      }
      this.updateUI();
    } catch (error) {
      console.error('Erreur delete section:', error);
      alert('Erreur lors de la suppression de la section');
    }
  }

  // Element Methods
  async addElement(sectionId, type) {
    try {
      const elementData = {
        section_id: sectionId,
        type: type,
        title: `Nouveau ${type}`,
        position: 999,
        settings: this.getDefaultSettingsForType(type)
      };

      const newElement = await this.apiCall('/elements', 'POST', elementData);

      // Ajouter à la section locale
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        section.elements.push(newElement);
        this.refreshSectionElements(sectionId);
      }

      this.closeModals();
    } catch (error) {
      console.error('Erreur add element:', error);
      alert('Erreur lors de l\'ajout de l\'élément');
    }
  }

  async deleteElement(elementId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      await this.apiCall(`/elements/${elementId}`, 'DELETE');

      // Retirer de toutes les sections locales
      this.sections.forEach(section => {
        section.elements = section.elements.filter(e => e.id !== elementId);
      });

      const elementElement = document.querySelector(`.element-wrapper[data-element-id="${elementId}"]`);
      if (elementElement) {
        elementElement.remove();
      }
    } catch (error) {
      console.error('Erreur delete element:', error);
      alert('Erreur lors de la suppression de l\'élément');
    }
  }

  // Position Updates
  async updateSectionPositions() {
    const positions = [];
    const sectionElements = document.querySelectorAll('#sections-container .section-wrapper');
    sectionElements.forEach((element, index) => {
      const sectionId = parseInt(element.dataset.sectionId);
      positions.push({ id: sectionId, position: index + 1 });
    });

    try {
      await this.apiCall('/sections/positions', 'PATCH', { positions });
      // Mettre à jour les positions locales
      positions.forEach(({ id, position }) => {
        const section = this.sections.find(s => s.id === id);
        if (section) section.position = position;
      });
    } catch (error) {
      console.error('Erreur update positions:', error);
      alert('Erreur lors de la mise à jour des positions');
    }
  }

  async updateElementPositions(sectionId) {
    const positions = [];
    const elementElements = document.querySelectorAll(`.elements-container[data-section-id="${sectionId}"] .element-wrapper`);
    elementElements.forEach((element, index) => {
      const elementId = parseInt(element.dataset.elementId);
      positions.push({ id: elementId, position: index + 1 });
    });

    try {
      await this.apiCall('/elements/positions', 'PATCH', { positions });
      // Mettre à jour les positions locales
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        positions.forEach(({ id, position }) => {
          const element = section.elements.find(e => e.id === id);
          if (element) element.position = position;
        });
      }
    } catch (error) {
      console.error('Erreur update element positions:', error);
      alert('Erreur lors de la mise à jour des positions des éléments');
    }
  }

  // Modal Methods
  showAddSectionModal() {
    // TODO: Implémenter modal d'ajout de section
    alert('Fonctionnalité d\'ajout de section à implémenter');
  }

  showSectionSettingsModal(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    // TODO: Implémenter modal de paramètres de section
    alert('Fonctionnalité de paramètres de section à implémenter');
  }

  showAddElementModal(sectionId) {
    const modal = document.getElementById('add-element-modal');
    if (modal) {
      modal.dataset.sectionId = sectionId;
      modal.classList.add('show');
    }
  }

  showElementEditModal(elementId) {
    const element = this.findElementById(elementId);
    if (!element) return;

    // Remplir les champs communs
    document.getElementById('element-id').value = element.id;
    document.getElementById('element-title').value = element.title || '';
    document.getElementById('element-font-id').value = element.settings?.font_id || '';

    // Générer les champs spécifiques selon le type
    this.generateElementSpecificFields(element);

    // Afficher la modale
    const modal = document.getElementById('element-edit-modal');
    modal.classList.add('show');
  }

  closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  }

  // Utility Methods
  findElementById(elementId) {
    for (const section of this.sections) {
      const element = section.elements.find(e => e.id === elementId);
      if (element) return element;
    }
    return null;
  }

  getDefaultSettingsForType(type) {
    const defaults = {
      text: {
        title: 'Titre',
        content: 'Contenu du texte...',
        font_family: 'Arial',
        font_size: '16px',
        color: '#000000'
      },
      media: {
        image_url: '',
        alt_text: '',
        width: '100%',
        height: 'auto'
      },
      card: {
        title: 'Titre de la carte',
        description: 'Description de la carte...',
        image_url: '',
        link_url: '',
        background_color: '#ffffff'
      },
      photo: {
        image_url: '',
        alt_text: '',
        caption: '',
        width: '300px',
        height: '200px'
      },
      video: {
        video_url: '',
        autoplay: false,
        controls: true,
        width: '100%',
        height: '400px'
      }
    };

    return defaults[type] || {};
  }

  updateSectionUI(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    const sectionElement = document.querySelector(`.section-wrapper[data-section-id="${sectionId}"]`);
    if (!sectionElement) return;

    const visibilityElement = sectionElement.querySelector('.section-visibility');
    const toggleBtn = sectionElement.querySelector('.section-toggle-btn i');

    if (section.is_visible) {
      visibilityElement?.classList.remove('hidden');
      visibilityElement?.classList.add('visible');
      toggleBtn?.classList.remove('fa-eye');
      toggleBtn?.classList.add('fa-eye-slash');
    } else {
      visibilityElement?.classList.remove('visible');
      visibilityElement?.classList.add('hidden');
      toggleBtn?.classList.remove('fa-eye-slash');
      toggleBtn?.classList.add('fa-eye');
    }
  }

  refreshSectionElements(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Re-render la section des éléments
    const container = document.querySelector(`.elements-container[data-section-id="${sectionId}"]`);
    if (!container) return;

    container.innerHTML = '';

    section.elements.forEach(element => {
      const elementHtml = this.renderElement(element);
      container.insertAdjacentHTML('beforeend', elementHtml);
    });

    // Réinitialiser le sortable pour cette section
    new Sortable(container, {
      handle: '.element-drag-handle',
      animation: 150,
      onEnd: () => {
        this.updateElementPositions(sectionId);
      }
    });
  }

  renderElement(element) {
    const settings = element.settings || {};
    let previewHtml = '';

    switch(element.type) {
      case 'text':
        previewHtml = `<div class="text-preview">
          <h4>${settings.title || 'Titre'}</h4>
          <p>${settings.content ? settings.content.substring(0, 100) + '...' : 'Contenu...'}</p>
        </div>`;
        break;
      case 'media':
        previewHtml = `<div class="media-preview">
          ${settings.image_url ? `<img src="${settings.image_url}" alt="Media">` : '<div class="placeholder">Image</div>'}
        </div>`;
        break;
      case 'card':
        previewHtml = `<div class="card-preview">
          <h5>${settings.title || 'Titre carte'}</h5>
          <p>${settings.description ? settings.description.substring(0, 50) + '...' : 'Description...'}</p>
        </div>`;
        break;
      case 'photo':
        previewHtml = `<div class="photo-preview">
          ${settings.image_url ? `<img src="${settings.image_url}" alt="Photo">` : '<div class="placeholder">Photo</div>'}
        </div>`;
        break;
      case 'video':
        previewHtml = `<div class="video-preview">
          ${settings.video_url ? '<div class="video-placeholder">🎥 Vidéo</div>' : '<div class="placeholder">Vidéo</div>'}
        </div>`;
        break;
      default:
        previewHtml = `<div class="unknown-preview">Type: ${element.type}</div>`;
    }

    return `
      <div class="element-wrapper" data-element-id="${element.id}">
        <div class="element-header">
          <div class="element-info">
            <span class="element-title">${element.title || `Élément ${element.type}`}</span>
            <span class="element-type badge badge-sm badge-${element.type}">${element.type}</span>
          </div>
          <div class="element-controls">
            <button class="btn btn-xs btn-outline element-edit-btn" data-element-id="${element.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-xs btn-danger element-delete-btn" data-element-id="${element.id}">
              <i class="fas fa-trash"></i>
            </button>
            <div class="element-drag-handle">
              <i class="fas fa-grip-vertical"></i>
            </div>
          </div>
        </div>
        <div class="element-preview">
          ${previewHtml}
        </div>
      </div>
    `;
  }

  async saveAll() {
    try {
      // Les modifications sont sauvegardées automatiquement lors de l'édition
      alert('Modifications sauvegardées automatiquement');
    } catch (error) {
      console.error('Erreur save:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async saveElement() {
    const elementId = parseInt(document.getElementById('element-id').value);
    const element = this.findElementById(elementId);
    if (!element) return;

    // Collecter les données du formulaire
    const formData = new FormData(document.getElementById('element-edit-form'));
    const data = Object.fromEntries(formData.entries());

    // Convertir les valeurs numériques et booléennes
    if (data.font_id) data.font_id = parseInt(data.font_id);
    if (data.font_size) data.font_size = parseInt(data.font_size);
    if (data.width) data.width = parseInt(data.width);
    if (data.height) data.height = parseInt(data.height);
    if (data.autoplay) data.autoplay = data.autoplay === 'on';
    if (data.controls) data.controls = data.controls === 'on';

    // Préparer les settings selon le type d'élément
    const settings = {};
    switch(element.type) {
      case 'text':
        settings.content = data.content;
        settings.subtitle = data.subtitle;
        settings.alignment = data.alignment;
        settings.font_size = data.font_size;
        break;
      case 'media':
        settings.url = data.url;
        settings.alt = data.alt;
        settings.width = data.width;
        settings.height = data.height;
        settings.alignment = data.alignment;
        break;
      case 'card':
        settings.description = data.description;
        settings.media_url = data.media_url;
        settings.link_url = data.link_url;
        settings.link_text = data.link_text;
        settings.event_date = data.event_date;
        break;
      case 'photo':
        settings.url = data.url;
        settings.caption = data.caption;
        settings.width = data.width;
        settings.height = data.height;
        break;
      case 'video':
        settings.url = data.url;
        settings.thumbnail_url = data.thumbnail_url;
        settings.autoplay = data.autoplay;
        settings.controls = data.controls;
        break;
    }

    // Ajouter la police si sélectionnée
    if (data.font_id) {
      settings.font_id = data.font_id;
    }

    try {
      const updateData = {
        title: data.title,
        settings: settings
      };

      const updatedElement = await this.apiCall(`/elements/${elementId}`, 'PATCH', updateData);

      // Mettre à jour l'élément local
      Object.assign(element, updatedElement);

      // Fermer la modale et rafraîchir l'interface
      this.closeModals();
      this.refreshSectionElements(element.section_id);

      console.log('Élément mis à jour:', updatedElement);
    } catch (error) {
      console.error('Erreur save element:', error);
      alert('Erreur lors de la sauvegarde de l\'élément');
    }
  }

  generateElementSpecificFields(element) {
    const container = document.getElementById('element-specific-fields');
    const settings = element.settings || {};
    
    let html = '';
    
    switch(element.type) {
      case 'text':
        html = `
          <div class="form-group">
            <label for="element-content">Contenu</label>
            <textarea id="element-content" name="content" rows="4">${settings.content || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="element-subtitle">Sous-titre</label>
            <input type="text" id="element-subtitle" name="subtitle" value="${settings.subtitle || ''}">
          </div>
          <div class="form-group">
            <label for="element-alignment">Alignement</label>
            <select id="element-alignment" name="alignment">
              <option value="left" ${settings.alignment === 'left' ? 'selected' : ''}>Gauche</option>
              <option value="center" ${settings.alignment === 'center' ? 'selected' : ''}>Centre</option>
              <option value="right" ${settings.alignment === 'right' ? 'selected' : ''}>Droite</option>
            </select>
          </div>
          <div class="form-group">
            <label for="element-font-size">Taille de police</label>
            <input type="number" id="element-font-size" name="font_size" min="8" max="72" value="${settings.font_size || 16}">
          </div>
        `;
        break;
        
      case 'media':
        html = `
          <div class="form-group">
            <label for="element-url">URL de l'image</label>
            <input type="url" id="element-url" name="url" value="${settings.url || ''}">
          </div>
          <div class="form-group">
            <label for="element-alt">Texte alternatif</label>
            <input type="text" id="element-alt" name="alt" value="${settings.alt || ''}">
          </div>
          <div class="form-group">
            <label for="element-width">Largeur (px)</label>
            <input type="number" id="element-width" name="width" min="50" max="1200" value="${settings.width || 300}">
          </div>
          <div class="form-group">
            <label for="element-height">Hauteur (px)</label>
            <input type="number" id="element-height" name="height" min="50" max="800" value="${settings.height || 200}">
          </div>
          <div class="form-group">
            <label for="element-alignment">Alignement</label>
            <select id="element-alignment" name="alignment">
              <option value="left" ${settings.alignment === 'left' ? 'selected' : ''}>Gauche</option>
              <option value="center" ${settings.alignment === 'center' ? 'selected' : ''}>Centre</option>
              <option value="right" ${settings.alignment === 'right' ? 'selected' : ''}>Droite</option>
            </select>
          </div>
        `;
        break;
        
      case 'card':
        html = `
          <div class="form-group">
            <label for="element-description">Description</label>
            <textarea id="element-description" name="description" rows="3" required>${settings.description || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="element-media-url">URL du média</label>
            <input type="url" id="element-media-url" name="media_url" value="${settings.media_url || ''}">
          </div>
          <div class="form-group">
            <label for="element-link-url">URL du lien</label>
            <input type="url" id="element-link-url" name="link_url" value="${settings.link_url || ''}">
          </div>
          <div class="form-group">
            <label for="element-link-text">Texte du lien</label>
            <input type="text" id="element-link-text" name="link_text" value="${settings.link_text || ''}">
          </div>
          <div class="form-group">
            <label for="element-event-date">Date de l'événement</label>
            <input type="date" id="element-event-date" name="event_date" value="${settings.event_date || ''}">
          </div>
        `;
        break;
        
      case 'photo':
        html = `
          <div class="form-group">
            <label for="element-url">URL de la photo</label>
            <input type="url" id="element-url" name="url" value="${settings.url || ''}" required>
          </div>
          <div class="form-group">
            <label for="element-caption">Légende</label>
            <input type="text" id="element-caption" name="caption" value="${settings.caption || ''}">
          </div>
          <div class="form-group">
            <label for="element-width">Largeur (px)</label>
            <input type="number" id="element-width" name="width" min="100" max="800" value="${settings.width || 300}">
          </div>
          <div class="form-group">
            <label for="element-height">Hauteur (px)</label>
            <input type="number" id="element-height" name="height" min="100" max="600" value="${settings.height || 200}">
          </div>
        `;
        break;
        
      case 'video':
        html = `
          <div class="form-group">
            <label for="element-url">URL de la vidéo</label>
            <input type="url" id="element-url" name="url" value="${settings.url || ''}" required>
          </div>
          <div class="form-group">
            <label for="element-thumbnail-url">URL de la miniature</label>
            <input type="url" id="element-thumbnail-url" name="thumbnail_url" value="${settings.thumbnail_url || ''}">
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="element-autoplay" name="autoplay" ${settings.autoplay ? 'checked' : ''}>
              Lecture automatique
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="element-controls" name="controls" ${settings.controls !== false ? 'checked' : ''}>
              Afficher les contrôles
            </label>
          </div>
        `;
        break;
    }
    
    container.innerHTML = html;
  }
}

// Initialiser l'éditeur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  window.editor = new Editor();
});