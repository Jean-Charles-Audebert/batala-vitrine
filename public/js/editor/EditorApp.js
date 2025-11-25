// Classe principale de l'application éditeur
// Orchestre tous les modules pour l'interface d'édition

class EditorApp {
  constructor(previewManager, formGenerator, sectionManager) {
    this.previewManager = previewManager;
    this.formGenerator = formGenerator;
    this.sectionManager = sectionManager;

    // Données de l'application
    this.sections = window.pageData.sections || [];
    this.page = window.pageData.page || {};
    this.fonts = window.pageData.fonts || [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.initSortable();
    this.updateUI();
    console.log('Application éditeur initialisée');
  }

  bindEvents() {
    // Boutons principaux
    document.getElementById('save-btn').addEventListener('click', () => this.saveAll());
    document.getElementById('add-section-btn').addEventListener('click', () => this.showAddSectionModal());

    // Paramètres de la page
    this.bindPageSettingsEvents();

    // Délégation d'événements pour les boutons dynamiques
    document.addEventListener('click', (e) => {
      this.handleSectionButtons(e);
      this.handleElementButtons(e);
      this.handleModalButtons(e);
      this.handleElementTypeButtons(e);
    });
  }

  handleSectionButtons(e) {
    if (e.target.closest('.section-settings-btn')) {
      const sectionId = parseInt(e.target.closest('.section-settings-btn').dataset.sectionId);
      this.showSectionSettingsModal(sectionId);
    }

    if (e.target.closest('.section-toggle-btn')) {
      const sectionId = parseInt(e.target.closest('.section-toggle-btn').dataset.sectionId);
      this.sectionManager.toggleSectionVisibility(sectionId);
    }

    if (e.target.closest('.section-delete-btn')) {
      const sectionId = parseInt(e.target.closest('.section-delete-btn').dataset.sectionId);
      this.sectionManager.deleteSection(sectionId);
    }
  }

  handleElementButtons(e) {
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
      this.sectionManager.deleteElement(elementId);
    }
  }

  handleModalButtons(e) {
    if (e.target.closest('#element-save-btn')) {
      this.saveElement();
    }

    if (e.target.closest('#element-cancel-btn')) {
      this.closeModals();
    }

    // Fermeture des modales
    if (e.target.closest('.modal-close') || (e.target.classList.contains('modal') && e.target === e.currentTarget)) {
      this.closeModals();
    }
  }

  handleElementTypeButtons(e) {
    if (e.target.closest('.element-type-btn')) {
      const type = e.target.closest('.element-type-btn').dataset.type;
      const modal = document.getElementById('add-element-modal');
      const sectionId = parseInt(modal.dataset.sectionId);
      this.sectionManager.addElement(sectionId, type);
    }
  }

  initSortable() {
    // Sections
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
      new Sortable(sectionsContainer, {
        handle: '.section-header',
        animation: 150,
        onEnd: () => {
          this.sectionManager.updateSectionPositions();
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
          this.sectionManager.updateElementPositions(sectionId);
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

  // Méthodes de modales
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
    this.formGenerator.generateElementSpecificFields(element);

    // Afficher la modale
    const modal = document.getElementById('element-edit-modal');
    modal.classList.add('show');
  }

  closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  }

  // Méthodes utilitaires
  findElementById(elementId) {
    for (const section of this.sections) {
      const element = section.elements.find(e => e.id === elementId);
      if (element) return element;
    }
    return null;
  }

  bindPageSettingsEvents() {
    // Bouton de gestion des polices
    const manageFontsBtn = document.querySelector('.manage-fonts-btn');
    if (manageFontsBtn) {
      manageFontsBtn.addEventListener('click', () => {
        window.open('/fonts', '_blank');
      });
    }

    // Sélection de médias pour le fond
    const selectBgMediaBtn = document.querySelector('.select-bg-media');
    if (selectBgMediaBtn) {
      selectBgMediaBtn.addEventListener('click', () => {
        this.openMediaPicker((url) => {
          document.getElementById('page-main-bg-media-url').value = url;
          this.savePageSettings();
        });
      });
    }

    // Suppression du média de fond
    const clearBgMediaBtn = document.querySelector('.clear-bg-media');
    if (clearBgMediaBtn) {
      clearBgMediaBtn.addEventListener('click', () => {
        document.getElementById('page-main-bg-media-url').value = '';
        this.savePageSettings();
      });
    }

    // Écouteurs pour la sauvegarde automatique des paramètres de page
    const pageSettingsFields = [
      'page-title',
      'page-contact-email',
      'page-main-bg-color',
      'page-main-bg-media-url',
      'page-main-bg-youtube-url',
      'page-main-bg-opacity',
      'page-main-bg-position',
      'page-title-font-id',
      'page-text-font-id'
    ];

    pageSettingsFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.addEventListener('change', () => this.savePageSettings());
        element.addEventListener('input', () => this.savePageSettings());
      }
    });
  }

  async savePageSettings() {
    try {
      // Fonction helper pour nettoyer les valeurs
      const cleanValue = (value, type = 'string') => {
        if (!value || value === '') return undefined;
        if (type === 'number') {
          const num = parseInt(value);
          return isNaN(num) ? undefined : num;
        }
        if (type === 'float') {
          const num = parseFloat(value);
          return isNaN(num) ? undefined : num;
        }
        return value;
      };

      const data = {};

      // Titre (obligatoire)
      const title = document.getElementById('page-title').value;
      if (title && title.trim()) {
        data.title = title.trim();
      }

      // Email de contact
      const email = document.getElementById('page-contact-email').value;
      if (email && email.trim()) {
        data.contact_email = email.trim();
      }

      // Couleur de fond
      const bgColor = document.getElementById('page-main-bg-color').value;
      if (bgColor && /^#[0-9A-Fa-f]{6}$/.test(bgColor)) {
        data.main_bg_color = bgColor;
      }

      // Média de fond
      const bgMedia = document.getElementById('page-main-bg-media-url').value;
      const trimmedBgMedia = bgMedia && bgMedia.trim();
      if (trimmedBgMedia) {
        data.main_bg_media_url = trimmedBgMedia;
      }

      // YouTube de fond
      const bgYoutube = document.getElementById('page-main-bg-youtube-url').value;
      const trimmedBgYoutube = bgYoutube && bgYoutube.trim();
      if (trimmedBgYoutube) {
        data.main_bg_youtube_url = trimmedBgYoutube;
      }

      // Opacité
      const opacity = cleanValue(document.getElementById('page-main-bg-opacity').value, 'float');
      if (opacity !== undefined && opacity >= 0 && opacity <= 1) {
        data.main_bg_opacity = opacity;
      }

      // Position
      const position = document.getElementById('page-main-bg-position').value;
      if (position && ['center', 'top', 'bottom', 'left', 'right'].includes(position)) {
        data.main_bg_position = position;
      }

      // Polices (convertir en nombres)
      const titleFontId = cleanValue(document.getElementById('page-title-font-id').value, 'number');
      if (titleFontId !== undefined) {
        data.title_font_id = titleFontId;
      }

      const textFontId = cleanValue(document.getElementById('page-text-font-id').value, 'number');
      if (textFontId !== undefined) {
        data.text_font_id = textFontId;
      }

      // Nettoyer les données : supprimer les propriétés vides ou null
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) {
          delete data[key];
        }
      });

      // DEBUG: Log des données collectées
      console.log('Données nettoyées:', data);
      console.log('Nombre de champs à sauvegarder:', Object.keys(data).length);

      // Vérifier qu'il y a au moins une donnée à sauvegarder
      if (Object.keys(data).length === 0) {
        console.log('Aucune donnée à sauvegarder');
        return;
      }

      // Vérifier si les données ont changé par rapport aux données actuelles
      const currentPageData = this.page || {};
      const hasChanges = Object.keys(data).some(key => {
        const newValue = data[key];
        const currentValue = currentPageData[key];
        return newValue !== currentValue;
      });

      if (!hasChanges) {
        console.log('Aucune modification détectée, sauvegarde ignorée');
        return;
      }

      console.log('Envoi des données à l\'API:', JSON.stringify(data));

      const response = await fetch('/api/page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      console.log('Réponse API - Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API détaillée:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      console.log('Succès API:', result);

      // Mettre à jour les données locales
      this.page = { ...this.page, ...data };

      // Mettre à jour le titre dans l'interface
      const pageTitleElement = document.querySelector('.page-info');
      if (pageTitleElement && data.title) {
        pageTitleElement.textContent = `Page: ${data.title}`;
      }

      console.log('Paramètres de page sauvegardés:', result.data);
    } catch (error) {
      console.error('Erreur sauvegarde paramètres page:', error);
      alert('Erreur lors de la sauvegarde des paramètres de page: ' + error.message);
    }
  }

  openMediaPicker(callback, type = 'both') {
    if (window.openMediaPicker) {
      window.openMediaPicker(callback, type);
    } else {
      // Fallback si le sélecteur n'est pas chargé
      const url = prompt('Entrez l\'URL du média:');
      if (url) {
        callback(url);
      }
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

      const updatedElement = await this.sectionManager.apiCall(`/elements/${elementId}`, 'PATCH', updateData);

      // Mettre à jour l'élément local
      Object.assign(element, updatedElement);

      // Fermer la modale et rafraîchir l'interface
      this.closeModals();
      this.sectionManager.refreshSectionElements(element.section_id);

      console.log('Élément mis à jour:', updatedElement);
    } catch (error) {
      console.error('Erreur save element:', error);
      alert('Erreur lors de la sauvegarde de l\'élément');
    }
  }
}

// Exposer globalement pour les modules
window.EditorApp = EditorApp;