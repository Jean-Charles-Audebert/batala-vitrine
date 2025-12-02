// Classe principale de l'application éditeur
// Orchestre tous les modules pour l'interface d'édition

class EditorApp {
  constructor(previewManager, formGenerator, sectionManager, elementManager) {
    this.previewManager = previewManager;
    this.formGenerator = formGenerator;
    this.sectionManager = sectionManager;
    this.elementManager = elementManager;

    // Données de l'application
    this.sections = window.pageData.sections || [];
    this.page = window.pageData.page || {};
    this.fonts = window.pageData.fonts || [];

    // Timeout pour la sauvegarde automatique
    this.saveTimeout = null;

    this.init();
  }

  init() {
    console.log('EditorApp.init() appelé');
    // Retarder l'initialisation pour s'assurer que le DOM est prêt
    window.setTimeout(async () => {
      this.previewManager.init();
      this.bindEvents();
      this.initSortable();
      this.updateUI();
      // Charger les polices dans les selects
      await this.refreshFontSelects();
      console.log('Application éditeur initialisée');
    }, 100);
  }

  bindEvents() {
    // Boutons principaux
    const saveBtn = document.getElementById('save-btn');
    const addSectionBtn = document.getElementById('add-section-btn');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveAll());
    }

    if (addSectionBtn) {
      addSectionBtn.addEventListener('click', () => this.showAddSectionModal());
    }

    // Onglets de la sidebar
    this.bindTabEvents();

    // Paramètres de la page
    this.bindPageSettingsEvents();

    // Délégation d'événements pour les boutons dynamiques
    document.addEventListener('click', (e) => {
      this.handleSectionButtons(e);
      this.handleElementButtons(e);
      this.handleModalButtons(e);
      this.handleElementTypeButtons(e);
      this.handleFontButtons(e);
    });
  }

  handleFontButtons(e) {
    // Bouton gérer les polices
    if (e.target.closest('.manage-fonts-btn')) {
      this.showFontsModal();
    }

    // Onglets dans la modale des polices
    if (e.target.closest('.font-tab-btn')) {
      const tabType = e.target.closest('.font-tab-btn').dataset.fontType;
      this.switchFontTab(tabType);
    }

    // Ajouter une police Google
    if (e.target.closest('#add-google-font-btn')) {
      this.addGoogleFont();
    }

    // Upload d'une police
    if (e.target.closest('#upload-font-btn')) {
      this.uploadFont();
    }

    // Supprimer une police
    if (e.target.closest('.delete-font-btn')) {
      const fontId = e.target.closest('.delete-font-btn').dataset.fontId;
      this.deleteFont(fontId);
    }
  }

  bindTabEvents() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    // Retirer la classe active de tous les boutons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Retirer la classe active de tous les contenus
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Ajouter la classe active au bouton cliqué
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Ajouter la classe active au contenu correspondant
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  handleSectionButtons(e) {
    if (e.target.closest('.edit-btn')) {
      const sectionId = parseInt(e.target.closest('.section-item').dataset.sectionId);
      this.sectionManager.showSectionModal(sectionId);
    }

    if (e.target.closest('.visibility-btn')) {
      const sectionId = parseInt(e.target.closest('.section-item').dataset.sectionId);
      this.sectionManager.toggleSectionVisibility(sectionId);
    }

    if (e.target.closest('.delete-btn')) {
      const sectionId = parseInt(e.target.closest('.section-item').dataset.sectionId);
      this.deleteSection(sectionId);
    }
  }

  async toggleSectionVisibility(sectionId) {
    try {
      const section = this.sections.find(s => s.id === sectionId);
      if (!section) return;

      const newVisibility = !section.is_visible;
      await this.apiCall(`/api/sections/${sectionId}`, 'PATCH', { is_visible: newVisibility });

      section.is_visible = newVisibility;
      this.updateUI();

      // Rafraîchir l'aperçu
      this.previewManager.refresh();

    } catch (error) {
      console.error('Erreur toggle visibility:', error);
      alert('Erreur lors du changement de visibilité');
    }
  }

  async deleteSection(sectionId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;

    try {
      await this.apiCall(`/api/sections/${sectionId}`, 'DELETE');

      // Retirer la section de la liste locale
      this.sections = this.sections.filter(s => s.id !== sectionId);
      this.updateUI();

      // Rafraîchir l'aperçu
      this.previewManager.refresh();

    } catch (error) {
      console.error('Erreur delete section:', error);
      alert('Erreur lors de la suppression de la section');
    }
  }

  handleElementButtons(e) {
    console.log('handleElementButtons appelé pour:', e.target.className);

    if (e.target.closest('.add-element-btn')) {
      console.log('Bouton add-element-btn cliqué');
      const sectionId = parseInt(e.target.closest('.add-element-btn').dataset.sectionId);
      this.showAddElementModal(sectionId);
    }

    if (e.target.closest('.element-edit-btn')) {
      const elementId = parseInt(e.target.closest('.element-edit-btn').dataset.elementId);
      this.showElementEditModal(elementId);
    }

    if (e.target.closest('.element-delete-btn')) {
      console.log('Bouton element-delete-btn cliqué');
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

    if (e.target.closest('#section-save-btn')) {
      this.saveSection();
    }

    if (e.target.closest('#section-cancel-btn')) {
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
    if (sectionsContainer && window.Sortable) {
      new window.Sortable(sectionsContainer, {
        handle: '.section-header',
        animation: 150,
        onEnd: () => {
          this.sectionManager.updateSectionPositions();
        }
      });
    }

    // Éléments dans chaque section
    document.querySelectorAll('.elements-container').forEach(container => {
      if (window.Sortable) {
        new window.Sortable(container, {
          handle: '.element-drag-handle',
          animation: 150,
          onEnd: () => {
            const sectionId = parseInt(container.dataset.sectionId);
            this.sectionManager.updateElementPositions(sectionId);
          }
        });
      }
    });
  }

  updateUI() {
    const visibleCount = this.sections.filter(s => s.is_visible).length;
    const visibleCountElement = document.getElementById('visible-count');
    if (visibleCountElement) {
      visibleCountElement.textContent = visibleCount;
    }

    // Initialiser l'onglet actif par défaut
    if (!document.querySelector('.tab-btn.active')) {
      this.switchTab('sections');
    }
  }

  // Méthodes de modales
  async saveAll() {
    try {
      console.log('Sauvegarde de toute la page...');

      // Collecter les données de la page depuis le formulaire
      const pageData = {
        title: document.getElementById('page-title').value,
        contact_email: document.getElementById('page-contact-email').value,
        default_font_title: document.getElementById('page-title-font-id').value || null,
        default_font_text: document.getElementById('page-text-font-id').value || null,
        bg_color: document.getElementById('page-bg-color').value,
        bg_image: document.getElementById('page-bg-image').value,
        bg_video_youtube: document.getElementById('page-bg-video-youtube').value,
        bg_opacity: parseFloat(document.getElementById('page-bg-opacity').value) || 1.0,
        bg_position: document.getElementById('page-bg-position').value
      };

      // Sauvegarder la page
      await this.apiCall('/api/page', 'PUT', pageData);

      // Sauvegarder toutes les sections modifiées
      for (const section of this.sections) {
        if (section.modified) {
          await this.sectionManager.saveSection(section.id);
          section.modified = false;
        }
      }

      alert('Page sauvegardée avec succès !');
      console.log('Sauvegarde terminée');

      // Rafraîchir l'aperçu
      this.previewManager.refresh();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  }

  showAddSectionModal() {
    // Réinitialiser le formulaire
    document.getElementById('section-modal-title').textContent = 'Ajouter une section';
    document.getElementById('section-type-selector').style.display = 'block';
    document.getElementById('section-type').value = 'hero';

    // Générer le formulaire pour le type par défaut
    this.formGenerator.generateSectionForm('hero');

    // Afficher la modale
    const modal = document.getElementById('section-modal');
    modal.classList.add('show');
  }

  showSectionSettingsModal(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Changer le titre de la modale
    document.getElementById('section-modal-title').textContent = 'Modifier la section';

    // Masquer le sélecteur de type (on ne peut pas changer le type d'une section existante)
    document.getElementById('section-type-selector').style.display = 'none';

    // Générer le formulaire avec les données actuelles
    this.formGenerator.generateSectionForm(section.type, section);

    // Afficher la modale
    const modal = document.getElementById('section-modal');
    modal.dataset.sectionId = sectionId;
    modal.classList.add('show');
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

  // === GESTION DES POLICES ===
  async showFontsModal() {
    const modal = document.getElementById('fonts-modal');
    if (modal) {
      modal.classList.add('show');
      // Charger les polices existantes
      await this.loadExistingFonts();
    }
  }

  async loadExistingFonts() {
    try {
      const fonts = await this.apiCall('/api/fonts');
      this.displayExistingFonts(fonts);
    } catch (error) {
      console.error('Erreur chargement polices:', error);
      alert('Erreur lors du chargement des polices');
    }
  }

  displayExistingFonts(fonts) {
    const container = document.getElementById('current-fonts-list');
    if (!container) return;

    container.innerHTML = fonts.map(font => `
      <div class="font-item" data-font-id="${font.id}">
        <div class="font-info">
          <span class="font-name">${font.font_family}</span>
          <span class="font-source ${font.source}">${font.source === 'google' ? 'Google Fonts' : font.source === 'upload' ? 'Uploadée' : 'Système'}</span>
        </div>
        <div class="font-preview" style="font-family: '${font.font_family}';">
          AaBbCc
        </div>
        <div class="font-actions">
          ${font.source === 'upload' ? `<button class="btn btn-sm btn-danger delete-font-btn" data-font-id="${font.id}"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      </div>
    `).join('');
  }

  async refreshFontSelects() {
    try {
      const fonts = await this.apiCall('/api/fonts');

      // Mettre à jour le select de la police du titre
      const titleSelect = document.getElementById('page-title-font-id');
      if (titleSelect) {
        const currentValue = titleSelect.value;
        titleSelect.innerHTML = '<option value="">Aucune</option>';
        fonts.forEach(font => {
          const option = document.createElement('option');
          option.value = font.id;
          option.textContent = `${font.font_family} (${font.source === 'google' ? 'Google Fonts' : font.source === 'upload' ? 'Uploadée' : 'Système'})`;
          if (font.id == currentValue) {
            option.selected = true;
          }
          titleSelect.appendChild(option);
        });
      }

      // Mettre à jour le select de la police du texte
      const textSelect = document.getElementById('page-text-font-id');
      if (textSelect) {
        const currentValue = textSelect.value;
        textSelect.innerHTML = '<option value="">Aucune</option>';
        fonts.forEach(font => {
          const option = document.createElement('option');
          option.value = font.id;
          option.textContent = `${font.font_family} (${font.source === 'google' ? 'Google Fonts' : font.source === 'upload' ? 'Uploadée' : 'Système'})`;
          if (font.id == currentValue) {
            option.selected = true;
          }
          textSelect.appendChild(option);
        });
      }

    } catch (error) {
      console.error('Erreur rechargement des polices:', error);
    }
  }

  switchFontTab(tabType) {
    // Retirer la classe active de tous les boutons
    document.querySelectorAll('.font-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Retirer la classe active de tous les contenus
    document.querySelectorAll('.font-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Ajouter la classe active au bouton cliqué
    const activeBtn = document.querySelector(`.font-tab-btn[data-font-type="${tabType}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Ajouter la classe active au contenu correspondant
    const activeContent = document.getElementById(`${tabType}-fonts-tab`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  async addGoogleFont() {
    const urlInput = document.getElementById('google-font-url');
    const nameInput = document.getElementById('google-font-name');

    const url = urlInput.value.trim();
    const name = nameInput.value.trim();

    if (!url) {
      alert('Veuillez entrer l\'URL Google Fonts');
      return;
    }

    if (!name) {
      alert('Veuillez entrer le nom de la police');
      return;
    }

    if (!url.startsWith('https://fonts.googleapis.com/css2?family=')) {
      alert('L\'URL doit commencer par https://fonts.googleapis.com/css2?family=');
      return;
    }

    try {
      // Extraire le font-family de l'URL
      const familyMatch = url.match(/family=([^&:]+)/);
      if (!familyMatch) {
        alert('URL Google Fonts invalide - impossible de trouver le paramètre family');
        return;
      }

      const fontFamily = decodeURIComponent(familyMatch[1]);

      const fontData = {
        name: name,
        source: 'google',
        font_family: fontFamily,
        url: url,
        variants: ['300', '400', '500', '600', '700'] // Variants par défaut
      };

      await this.apiCall('/api/fonts', 'POST', fontData);

      alert('Police Google Fonts ajoutée avec succès !');
      urlInput.value = '';
      nameInput.value = '';

      // Recharger la liste des polices dans la modale et dans les paramètres
      await this.loadExistingFonts();
      await this.refreshFontSelects();

    } catch (error) {
      console.error('Erreur ajout police Google:', error);
      alert('Erreur lors de l\'ajout de la police Google Fonts');
    }
  }

  async uploadFont() {
    const nameInput = document.getElementById('font-name');
    const familyInput = document.getElementById('font-family');
    const fileInput = document.getElementById('font-file');

    const name = nameInput.value.trim();
    const fontFamily = familyInput.value.trim();
    const file = fileInput.files[0];

    if (!name || !fontFamily || !file) {
      alert('Veuillez remplir tous les champs et sélectionner un fichier');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('font_family', fontFamily);
      formData.append('file', file);
      formData.append('source', 'upload');

      await this.apiCall('/api/fonts/upload', 'POST', formData, true);

      // Fermer la modale et rafraîchir
      this.closeModals();
      alert(`Police "${name}" importée avec succès !`);

      // Recharger les listes de polices dans les paramètres
      await this.refreshFontSelects();

      // Rafraîchir la page pour recharger les polices
      window.location.reload();

    } catch (error) {
      console.error('Erreur upload police:', error);
      alert('Erreur lors de l\'import de la police: ' + error.message);
    }
  }

  async deleteFont(fontId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette police ?')) return;

    try {
      await this.apiCall(`/api/fonts/${fontId}`, 'DELETE');

      alert('Police supprimée avec succès !');

      // Recharger les listes de polices
      await this.loadExistingFonts();
      await this.refreshFontSelects();

    } catch (error) {
      console.error('Erreur suppression police:', error);
      alert('Erreur lors de la suppression de la police');
    }
  }

  bindPageSettingsEvents() {
    // Bouton de gestion des polices
    const manageFontsBtn = document.querySelector('.manage-fonts-btn');
    if (manageFontsBtn) {
      manageFontsBtn.addEventListener('click', () => {
        this.showFontsModal();
      });
    }

    // Gestion des types de média de fond (radio buttons)
    const bgMediaTypeRadios = document.querySelectorAll('input[name="bg-media-type"]');
    const bgImageField = document.getElementById('bg-image-field');
    const bgYoutubeField = document.getElementById('bg-youtube-field');
    
    bgMediaTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        
        // Masquer tous les champs
        if (bgImageField) bgImageField.style.display = 'none';
        if (bgYoutubeField) bgYoutubeField.style.display = 'none';
        
        // Afficher le champ correspondant
        if (selectedType === 'image' && bgImageField) {
          bgImageField.style.display = 'block';
        } else if (selectedType === 'youtube' && bgYoutubeField) {
          bgYoutubeField.style.display = 'block';
        } else if (selectedType === 'none') {
          // Effacer les valeurs
          const bgImageInput = document.getElementById('page-bg-image');
          const bgYoutubeInput = document.getElementById('page-bg-video-youtube');
          if (bgImageInput) bgImageInput.value = '';
          if (bgYoutubeInput) bgYoutubeInput.value = '';
          this.savePageSettings();
        }
      });
    });

    // Sélection de médias pour le fond
    const selectBgMediaBtn = document.querySelector('.select-bg-media');
    if (selectBgMediaBtn) {
      selectBgMediaBtn.addEventListener('click', () => {
        this.openMediaPicker((url) => {
          const bgImageInput = document.getElementById('page-bg-image');
          const clearBtn = document.querySelector('.clear-bg-media');
          
          if (bgImageInput) {
            bgImageInput.value = url;
          }
          if (clearBtn) {
            clearBtn.style.display = url ? 'inline-block' : 'none';
          }
          
          this.savePageSettings();
        }, 'both'); // Accepter images et vidéos
      });
    }

    // Suppression du média de fond
    const clearBgMediaBtn = document.querySelector('.clear-bg-media');
    if (clearBgMediaBtn) {
      clearBgMediaBtn.addEventListener('click', () => {
        const bgImageInput = document.getElementById('page-bg-image');
        if (bgImageInput) {
          bgImageInput.value = '';
        }
        clearBgMediaBtn.style.display = 'none';
        this.savePageSettings();
      });
    }

    // Upload du favicon
    const faviconUpload = document.getElementById('favicon-upload');
    if (faviconUpload) {
      faviconUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('favicon', file);

        try {
          const response = await fetch('/api/upload/favicon', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          
          if (response.ok) {
            // Mettre à jour la prévisualisation
            const faviconPreview = document.getElementById('favicon-preview');
            if (faviconPreview) {
              faviconPreview.src = `/icons/favicon.ico?t=${Date.now()}`;
            }
            
            // Rafraîchir le favicon dans la page
            const links = document.querySelectorAll('link[rel="icon"]');
            links.forEach(link => {
              link.href = `/icons/favicon.ico?t=${Date.now()}`;
            });

            alert('Favicon mis à jour avec succès !');
          } else {
            alert('Erreur lors du téléchargement : ' + (result.message || 'Erreur inconnue'));
          }
        } catch (error) {
          console.error('Erreur upload favicon:', error);
          alert('Erreur lors du téléchargement du favicon');
        }
      });
    }

    // Charger la liste des admins
    this.loadAdminsList();

    // Bouton d'ajout d'admin
    const addAdminBtn = document.getElementById('add-admin-btn');
    if (addAdminBtn) {
      addAdminBtn.addEventListener('click', () => {
        this.showAdminModal();
      });
    }

    // Écouteurs pour la sauvegarde automatique des paramètres de page
    const pageSettingsFields = [
      'page-title',
      'page-contact-email',
      'page-bg-color',
      'page-bg-image',
      'page-bg-video-youtube',
      'page-bg-opacity',
      'page-bg-position',
      'page-title-font-id',
      'page-text-font-id'
    ];

    pageSettingsFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        // Mise à jour en temps réel de l'aperçu
        element.addEventListener('input', () => this.updatePreview());
        element.addEventListener('change', () => this.updatePreview());

        // Sauvegarde automatique avec délai
        element.addEventListener('change', () => {
          window.clearTimeout(this.saveTimeout);
          this.saveTimeout = window.setTimeout(() => this.savePageSettings(), 1000);
        });
      }
    });
  }

  /**
   * Met à jour l'aperçu en temps réel sans sauvegarder
   */
  updatePreview() {
    try {
      const settings = {};

      // Récupérer les polices sélectionnées
      const titleFontSelect = document.getElementById('page-title-font-id');
      const textFontSelect = document.getElementById('page-text-font-id');

      if (titleFontSelect) {
        settings.titleFontId = titleFontSelect.value;
      }
      if (textFontSelect) {
        settings.textFontId = textFontSelect.value;
      }

      // Récupérer la couleur d'arrière-plan
      const bgColorInput = document.getElementById('page-bg-color');
      if (bgColorInput) {
        settings.bg_color = bgColorInput.value;
      }

      // Envoyer les paramètres au PreviewManager
      if (this.previewManager) {
        this.previewManager.updatePreviewSettings(settings);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'aperçu:', error);
    }
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
      const bgColor = document.getElementById('page-bg-color').value;
      if (bgColor && /^#[0-9A-Fa-f]{6}$/.test(bgColor)) {
        data.bg_color = bgColor;
      }

      // Média de fond
      const bgMedia = document.getElementById('page-bg-image').value;
      const trimmedBgMedia = bgMedia && bgMedia.trim();
      if (trimmedBgMedia) {
        data.bg_image = trimmedBgMedia;
      }

      // YouTube de fond
      const bgYoutube = document.getElementById('page-bg-video-youtube').value;
      const trimmedBgYoutube = bgYoutube && bgYoutube.trim();
      if (trimmedBgYoutube) {
        data.bg_video_youtube = trimmedBgYoutube;
      }

      // Opacité
      const opacity = cleanValue(document.getElementById('page-bg-opacity').value, 'float');
      if (opacity !== undefined && opacity >= 0 && opacity <= 1) {
        data.bg_opacity = opacity;
      }

      // Position
      const position = document.getElementById('page-bg-position').value;
      if (position && ['center', 'top', 'bottom', 'left', 'right'].includes(position)) {
        data.bg_position = position;
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
      // eslint-disable-next-line no-undef
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

      const updatedElement = await this.sectionManager.apiCall(`/api/elements/${elementId}`, 'PATCH', updateData);

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

  async saveSection() {
    // Déléguer à SectionManager qui gère déjà la sauvegarde
    await this.sectionManager.saveSection();
  }

  // Méthode utilitaire pour les appels API
  async apiCall(endpoint, method = 'GET', data = null, isFormData = false) {
    const config = {
      method,
    };

    if (data) {
      if (isFormData) {
        config.body = data; // FormData
      } else {
        config.headers = {
          'Content-Type': 'application/json',
        };
        config.body = JSON.stringify(data);
      }
    }

    const response = await fetch(endpoint, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  // === GESTION DES ADMINISTRATEURS ===

  async loadAdminsList() {
    const container = document.getElementById('admins-list-container');
    if (!container) return;

    try {
      const response = await fetch('/api/admins');
      const data = await response.json();

      if (!data.admins || data.admins.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 1rem;">Aucun administrateur</p>';
        return;
      }

      container.innerHTML = data.admins.map(admin => `
        <div class="admin-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #e9ecef; border-radius: 4px; margin-bottom: 0.5rem; background: ${admin.is_active ? 'white' : '#f8f9fa'};">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #333;">
              <i class="fas fa-user" style="margin-right: 0.5rem; color: #0066cc;"></i>
              ${admin.email}
            </div>
            <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
              ${admin.is_active ? '<span style="color: #28a745;">● Actif</span>' : '<span style="color: #dc3545;">● Inactif</span>'}
              <span style="margin-left: 1rem;">Créé le ${new Date(admin.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm btn-secondary edit-admin-btn" data-admin-id="${admin.id}" title="Activer/Désactiver">
              <i class="fas fa-toggle-on"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-admin-btn" data-admin-id="${admin.id}" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');

      // Attacher les événements
      container.querySelectorAll('.edit-admin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const adminId = btn.dataset.adminId;
          const admin = data.admins.find(a => a.id == adminId);
          this.showAdminModal(admin);
        });
      });

      container.querySelectorAll('.delete-admin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const adminId = btn.dataset.adminId;
          this.deleteAdmin(adminId);
        });
      });

    } catch (error) {
      console.error('Erreur chargement admins:', error);
      container.innerHTML = '<p style="text-align: center; color: #dc3545; padding: 1rem;"><i class="fas fa-exclamation-triangle"></i> Erreur de chargement</p>';
    }
  }

  showAdminModal(admin = null) {
    const isEdit = !!admin;
    const modalHtml = `
      <div class="modal show" id="admin-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${isEdit ? 'Activer/Désactiver l\'administrateur' : 'Nouvel administrateur'}</h3>
            <button class="modal-close" data-close-admin-modal>&times;</button>
          </div>
          <div class="modal-body">
            ${isEdit ? `
              <div class="form-group">
                <p><strong>Email:</strong> ${admin.email}</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                  <i class="fas fa-info-circle"></i> L'email ne peut pas être modifié. Pour changer l'email, supprimez ce compte et créez-en un nouveau.
                </p>
              </div>
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="checkbox" id="admin-is-active" ${admin.is_active ? 'checked' : ''}>
                  <span>Compte actif</span>
                </label>
              </div>
            ` : `
              <div class="form-group">
                <label for="admin-email">Email de l'administrateur</label>
                <input type="email" id="admin-email" class="form-control" placeholder="admin@example.com" required>
                <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
                  <i class="fas fa-info-circle"></i> Un mot de passe sécurisé sera généré automatiquement et envoyé par email.
                </p>
              </div>
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="checkbox" id="admin-is-active" checked>
                  <span>Compte actif</span>
                </label>
              </div>
            `}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-close-admin-modal>Annuler</button>
            <button type="button" class="btn btn-primary" id="save-admin-btn">
              <i class="fas fa-save"></i> ${isEdit ? 'Mettre à jour' : 'Créer et envoyer l\'email'}
            </button>
          </div>
        </div>
      </div>
    `;

    const existingModal = document.getElementById('admin-modal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('admin-modal');
    
    // Fermeture
    modal.querySelectorAll('[data-close-admin-modal]').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Sauvegarde
    document.getElementById('save-admin-btn').addEventListener('click', () => {
      this.saveAdmin(admin ? admin.id : null);
    });
  }

  async saveAdmin(adminId = null) {
    const isActive = document.getElementById('admin-is-active').checked;
    
    let data = { is_active: isActive };
    
    // Si c'est une création, récupérer l'email
    if (!adminId) {
      const emailInput = document.getElementById('admin-email');
      if (!emailInput) {
        alert('Erreur: champ email introuvable');
        return;
      }
      const email = emailInput.value.trim();
      if (!email) {
        alert('L\'email est requis');
        return;
      }
      // Validation basique email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Email invalide');
        return;
      }
      data.email = email;
    }

    try {
      const url = adminId ? `/api/admins/${adminId}` : '/api/admins';
      const method = adminId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        document.getElementById('admin-modal').remove();
        this.loadAdminsList();
        
        // Afficher le message de succès avec le mot de passe si fourni
        if (result.password) {
          alert(result.message + '\n\nMot de passe temporaire (notez-le maintenant):\n' + result.password);
        } else {
          alert(result.message || (adminId ? 'Statut mis à jour' : 'Administrateur créé et email envoyé'));
        }
      } else {
        alert('Erreur : ' + (result.error || result.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur sauvegarde admin:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async deleteAdmin(adminId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        this.loadAdminsList();
        alert('Administrateur supprimé');
      } else {
        alert('Erreur : ' + (result.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur suppression admin:', error);
      alert('Erreur lors de la suppression');
    }
  }
}

// Exposer globalement pour les modules
window.EditorApp = EditorApp;