/**
 * Editor JavaScript
 * Interface WYSIWYG pour l'édition des sections et éléments
 */

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
    $('#save-btn').on('click', () => this.saveAll());
    $('#preview-btn').on('click', () => this.preview());
    $('#add-section-btn').on('click', () => this.showAddSectionModal());

    // Boutons sections
    $(document).on('click', '.section-settings-btn', (e) => {
      const sectionId = $(e.currentTarget).data('section-id');
      this.showSectionSettingsModal(sectionId);
    });

    $(document).on('click', '.section-toggle-btn', (e) => {
      const sectionId = $(e.currentTarget).data('section-id');
      this.toggleSectionVisibility(sectionId);
    });

    $(document).on('click', '.section-delete-btn', (e) => {
      const sectionId = $(e.currentTarget).data('section-id');
      this.deleteSection(sectionId);
    });

    // Boutons éléments
    $(document).on('click', '.add-element-btn', (e) => {
      const sectionId = $(e.currentTarget).data('section-id');
      this.showAddElementModal(sectionId);
    });

    $(document).on('click', '.element-edit-btn', (e) => {
      const elementId = $(e.currentTarget).data('element-id');
      this.showElementEditModal(elementId);
    });

    $(document).on('click', '.element-delete-btn', (e) => {
      const elementId = $(e.currentTarget).data('element-id');
      this.deleteElement(elementId);
    });

    // Modals
    $(document).on('click', '.modal-close', () => this.closeModals());
    $(document).on('click', '.modal', (e) => {
      if (e.target === e.currentTarget) this.closeModals();
    });

    // Types d'éléments
    $(document).on('click', '.element-type-btn', (e) => {
      const type = $(e.currentTarget).data('type');
      const sectionId = $('#add-element-modal').data('section-id');
      this.addElement(sectionId, type);
    });
  }

  initSortable() {
    // Sections
    new Sortable(document.getElementById('sections-container'), {
      handle: '.section-header',
      animation: 150,
      onEnd: (evt) => {
        this.updateSectionPositions();
      }
    });

    // Éléments dans chaque section
    document.querySelectorAll('.elements-container').forEach(container => {
      new Sortable(container, {
        handle: '.element-drag-handle',
        animation: 150,
        onEnd: (evt) => {
          const sectionId = $(container).data('section-id');
          this.updateElementPositions(sectionId);
        }
      });
    });
  }

  updateUI() {
    const visibleCount = this.sections.filter(s => s.is_visible).length;
    $('#visible-count').text(visibleCount);
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
      $(`.section-wrapper[data-section-id="${sectionId}"]`).remove();
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

      $(`.element-wrapper[data-element-id="${elementId}"]`).remove();
    } catch (error) {
      console.error('Erreur delete element:', error);
      alert('Erreur lors de la suppression de l\'élément');
    }
  }

  // Position Updates
  async updateSectionPositions() {
    const positions = [];
    $('#sections-container .section-wrapper').each((index, element) => {
      const sectionId = $(element).data('section-id');
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
    $(`.elements-container[data-section-id="${sectionId}"] .element-wrapper`).each((index, element) => {
      const elementId = $(element).data('element-id');
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
    $('#add-element-modal').data('section-id', sectionId).addClass('show');
  }

  showElementEditModal(elementId) {
    const element = this.findElementById(elementId);
    if (!element) return;

    // TODO: Implémenter modal d'édition d'élément
    alert('Fonctionnalité d\'édition d\'élément à implémenter');
  }

  closeModals() {
    $('.modal').removeClass('show');
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

    const $section = $(`.section-wrapper[data-section-id="${sectionId}"]`);
    const $visibility = $section.find('.section-visibility');
    const $toggleBtn = $section.find('.section-toggle-btn i');

    if (section.is_visible) {
      $visibility.removeClass('hidden').addClass('visible');
      $toggleBtn.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      $visibility.removeClass('visible').addClass('hidden');
      $toggleBtn.removeClass('fa-eye-slash').addClass('fa-eye');
    }
  }

  refreshSectionElements(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Re-render la section des éléments
    const $container = $(`.elements-container[data-section-id="${sectionId}"]`);
    $container.empty();

    section.elements.forEach(element => {
      const elementHtml = this.renderElement(element);
      $container.append(elementHtml);
    });

    // Réinitialiser le sortable pour cette section
    new Sortable($container[0], {
      handle: '.element-drag-handle',
      animation: 150,
      onEnd: (evt) => {
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
$(document).ready(() => {
  window.editor = new Editor();
});