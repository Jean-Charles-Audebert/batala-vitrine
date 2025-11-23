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
    document.getElementById('preview-btn').addEventListener('click', () => this.preview());
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

    // TODO: Implémenter modal d'édition d'élément
    alert('Fonctionnalité d\'édition d\'élément à implémenter');
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
      // TODO: Implémenter sauvegarde automatique
      alert('Sauvegarde automatique à implémenter');
    } catch (error) {
      console.error('Erreur save:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  preview() {
    window.open('/', '_blank');
  }
}

// Initialiser l'éditeur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  window.editor = new Editor();
});