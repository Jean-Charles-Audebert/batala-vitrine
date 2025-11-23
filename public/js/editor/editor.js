/**
 * Éditeur de site - Logique JavaScript principale
 * Gère la sidebar, les formulaires dynamiques, et les interactions d'édition
 */

class SiteEditor {
  constructor() {
    this.currentSection = null;
    this.schemas = {};
    this.siteConfig = {};
    this.isDirty = false;

    this.init();
  }

  async init() {
    try {
      // Charger les schémas et la configuration
      await this.loadSchemas();
      await this.loadSiteConfig();

      // Initialiser les événements
      this.initEvents();

      // Initialiser les onglets de la sidebar
      this.initSidebarTabs();

      // Remplir la liste des sections
      this.renderSectionsList();

      // Pré-remplir le formulaire global
      this.populateGlobalForm();

      console.log('Éditeur initialisé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'éditeur:', error);
    }
  }

  async loadSchemas() {
    try {
      const response = await fetch('/api/schemas');
      if (!response.ok) throw new Error('Erreur chargement schémas');
      this.schemas = await response.json();
    } catch (error) {
      console.error('Erreur chargement schémas:', error);
      // Schémas par défaut en cas d'erreur
      this.schemas = {};
    }
  }

  async loadSiteConfig() {
    try {
      // Charger les sections depuis la base de données
      const sectionsResponse = await fetch('/api/sections');
      if (!sectionsResponse.ok) throw new Error('Erreur chargement sections');
      const sections = await sectionsResponse.json();

      // Charger la configuration globale depuis la base
      const globalResponse = await fetch('/api/page');
      let globalConfig = {};
      if (globalResponse.ok) {
        globalConfig = await globalResponse.json();
      }

      this.siteConfig = {
        sections: sections,
        global: globalConfig
      };
    } catch (error) {
      console.error('Erreur chargement config:', error);
      // Config par défaut
      this.siteConfig = { sections: [], global: {} };
    }
  }

  initEvents() {
    // Clic sur les sections dans l'aperçu pour les sélectionner
    document.addEventListener('click', (e) => {
      const sectionElement = e.target.closest('[data-section-id]');
      if (sectionElement && !e.target.closest('.edit-btn') && !e.target.closest('.card-actions') && !e.target.closest('a')) {
        e.preventDefault();
        const sectionId = sectionElement.dataset.sectionId;
        this.selectSectionInSidebar(sectionId);
      }
    });

    // Clic sur les cartes individuelles pour les sélectionner
    document.addEventListener('click', (e) => {
      const cardElement = e.target.closest('[data-card-id]');
      if (cardElement && !e.target.closest('.edit-btn') && !e.target.closest('.delete-btn') && !e.target.closest('a')) {
        e.preventDefault();
        const cardId = cardElement.dataset.cardId;
        const sectionId = cardElement.dataset.sectionId;
        this.selectCardInSidebar(sectionId, cardId);
      }
    });

    // Boutons d'édition des sections (anciens, maintenant supprimés mais gardés pour compatibilité)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.edit-section-btn')) {
        e.preventDefault();
        const sectionId = e.target.closest('.edit-section-btn').dataset.sectionId;
        this.editSection(sectionId);
      }
    });

    // Boutons de la sidebar
    document.addEventListener('click', (e) => {
      if (e.target.closest('.editor-sidebar-close')) {
        this.closeSidebar();
      }

      if (e.target.closest('#backToSections')) {
        this.hideSectionEditor();
      }

      if (e.target.closest('.editor-sidebar-save')) {
        this.saveChanges();
      }

      if (e.target.closest('.editor-sidebar-cancel')) {
        this.cancelChanges();
      }

      if (e.target.closest('.add-section-btn')) {
        this.showAddSection();
      }

      if (e.target.closest('.delete-section-btn')) {
        const sectionId = e.target.closest('.delete-section-btn').dataset.sectionId;
        this.deleteSection(sectionId);
      }

      // Bouton configuration globale
      if (e.target.closest('[data-tab="global"]')) {
        this.showGlobalConfig();
      }

      // Bouton polices
      if (e.target.closest('[data-tab="fonts"]')) {
        this.showFontsPanel();
      }

      // Bouton retour depuis config globale
      if (e.target.closest('.back-to-main')) {
        this.hideGlobalConfig();
        this.hideFontsPanel();
      }

      // Bouton toggle sidebar depuis l'indicateur
      if (e.target.closest('#toggleSidebar')) {
        this.toggleSidebar();
      }
    });

    // Changements dans les formulaires
    document.addEventListener('input', (e) => {
      if (e.target.closest('.editor-sidebar-content')) {
        this.markDirty();
      }
    });

    // Gestion des médias globaux
    document.addEventListener('click', (e) => {
      if (e.target.closest('.select-global-bg')) {
        this.selectGlobalMedia('main_bg_image', 'image');
      }
      if (e.target.closest('.select-global-video')) {
        this.selectGlobalMedia('main_bg_video', 'video');
      }
      if (e.target.closest('.clear-global-bg')) {
        this.clearGlobalMedia('main_bg_image');
      }
      if (e.target.closest('.clear-global-video')) {
        this.clearGlobalMedia('main_bg_video');
      }
    });

    // Gestion des cartes (ajouter/supprimer)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-card-btn')) {
        this.addCard();
      }

      if (e.target.closest('.remove-card-btn')) {
        const index = e.target.closest('.card-item').dataset.index;
        this.removeCard(index);
      }
    });

    // Gestion des formulaires
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'globalForm') {
        e.preventDefault();
        this.saveGlobalConfig(e.target);
      }
    });
  }

  populateGlobalForm() {
    if (!this.siteConfig.global) return;

    const globalForm = document.getElementById('globalForm');
    if (!globalForm) return;

    // Pré-remplir tous les champs du formulaire global
    Object.keys(this.siteConfig.global).forEach(key => {
      const input = globalForm.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = this.siteConfig.global[key] || '';
      }
    });
  }

  initSidebarTabs() {
    const tabs = document.querySelectorAll('.editor-sidebar-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  }

  renderSectionsList() {
    const sectionsList = document.getElementById('sectionsList');
    if (!sectionsList) return;

    sectionsList.innerHTML = '';

    if (!this.siteConfig.sections || this.siteConfig.sections.length === 0) {
      sectionsList.innerHTML = '<p class="empty-state">Aucune section trouvée</p>';
      return;
    }

    this.siteConfig.sections.forEach(section => {
      const sectionItem = document.createElement('div');
      sectionItem.className = 'section-item';
      sectionItem.dataset.sectionId = section.id;

      const schema = this.schemas[section.type];
      // Utiliser le titre de la section, sinon le titre du schéma, sinon le type
      const sectionTitle = section.title || (schema ? schema.title : section.type);
      const sectionIcon = schema ? schema.icon : '📄';

      sectionItem.innerHTML = `
        <div class="section-item-header">
          <span class="section-icon">${sectionIcon}</span>
          <span class="section-title">${sectionTitle}</span>
          <div class="section-actions">
            <button class="btn btn-sm btn-primary edit-section-btn" data-section-id="${section.id}">
              <img src="/icons/edit.svg" alt="" class="icon"> Modifier
            </button>
            <button class="btn btn-sm btn-danger delete-section-btn" data-section-id="${section.id}">
              <img src="/icons/trash.svg" alt="" class="icon">
            </button>
          </div>
        </div>
        <div class="section-preview">
          ${this.getSectionPreview(section)}
        </div>
      `;

      sectionsList.appendChild(sectionItem);
    });
  }

  getSectionPreview(section) {
    const schema = this.schemas[section.type];
    if (!schema) return 'Section inconnue';

    // Vérifier que les données existent
    if (!section.data) return 'Données manquantes';

    try {
      // Aperçu simple selon le type
      switch (section.type) {
        case 'hero':
          return section.data.title ? `"${section.data.title}"` : 'Header sans titre';
        case 'textMedia':
          return section.data.title ? `"${section.data.title}"` : 'Texte + média';
        case 'cards':
          const cards = section.data.cards;
          const cardCount = Array.isArray(cards) ? cards.length : 0;
          return `${cardCount} carte${cardCount > 1 ? 's' : ''}`;
        default:
          return 'Section';
      }
    } catch (error) {
      console.error('Erreur getSectionPreview:', error);
      return 'Erreur aperçu';
    }
  }

  switchTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.editor-sidebar-tab-content').forEach(content => {
      content.style.display = 'none';
    });

    // Désactiver tous les onglets
    document.querySelectorAll('.editor-sidebar-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Activer l'onglet sélectionné
    const selectedTab = document.querySelector(`.editor-sidebar-tab[data-tab="${tabName}"]`);
    const selectedContent = document.querySelector(`.editor-sidebar-tab-content[data-tab="${tabName}"]`);

    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    if (selectedContent) {
      selectedContent.style.display = 'block';
    }
  }

  selectCardInSidebar(sectionId, cardId) {
    // Pour l'instant, sélectionner la section parente
    // TODO: Implémenter l'édition de carte individuelle
    this.selectSectionInSidebar(sectionId);
    console.log('Carte sélectionnée:', cardId, 'dans section:', sectionId);
  }

  showSectionEditor() {
    // Masquer la liste des sections et config globale
    const sectionsContainer = document.querySelector('.sections-container');
    const globalPanel = document.getElementById('globalConfigPanel');
    const sectionEditor = document.getElementById('sectionEditor');

    if (sectionsContainer) sectionsContainer.style.display = 'none';
    if (globalPanel) globalPanel.style.display = 'none';
    if (sectionEditor) sectionEditor.style.display = 'flex';
  }

  populateForm(section) {
    console.log('populateForm avec section DB:', section);
    const schema = this.schemas[section.type];
    if (!schema) return;

    const form = document.getElementById('sectionForm');
    if (!form) return;
    
    form.innerHTML = '';

    // Mapper les données de la base vers le format attendu par les schémas
    const data = this.mapSectionDataToForm(section);
    console.log('Données mappées pour le formulaire:', data);

    // Générer le formulaire à partir du schéma
    this.generateFormFromSchema(form, schema.fields, data);

    // Mettre à jour le titre
    const titleEl = document.getElementById('sectionEditorTitle');
    if (titleEl) {
      titleEl.textContent = `Modifier ${schema.title || section.type}`;
    }
  }

  mapSectionDataToForm(section) {
    const data = {};

    // Champs directs de la section
    const directFields = [
      'title', 'bg_color', 'bg_image', 'bg_video', 'bg_youtube', 'is_transparent',
      'layout', 'padding_top', 'padding_bottom',
      'logo_url', 'logo_width', 'logo_position_h', 'logo_position_v',
      'show_social_links', 'social_position_h', 'social_position_v', 'social_icon_size', 'social_icon_color',
      'show_nav_links', 'nav_position_h', 'nav_position_v', 'nav_text_color', 'nav_bg_color',
      'is_sticky'
    ];

    directFields.forEach(field => {
      if (section[field] !== undefined) {
        data[field] = section[field];
      }
    });

    // Contenu depuis section.content[0] (s'il existe)
    if (section.content && section.content.length > 0) {
      const content = section.content[0];
      Object.assign(data, {
        subtitle: content.subtitle,
        description: content.description,
        cta_label: content.cta_label,
        cta_url: content.cta_url,
        media_url: content.media_url,
        media_type: content.media_type,
        media_alt: content.media_alt,
        media_size: content.media_size,
        text_color: content.text_color,
        text_align: content.text_align,
        title_font_id: content.title_font_id,
        title_color: content.title_color,
        title_position_h: content.title_position_h,
        title_position_v: content.title_position_v
      });
    }

    // Cartes depuis section.cards
    if (section.cards && section.cards.length > 0) {
      data.cards = section.cards;
    }

    return data;
  }

  generateFormFromSchema(container, schemaFields, data = {}) {
    Object.entries(schemaFields).forEach(([key, field]) => {
      if (field.type === 'group') {
        // Créer une section pour le groupe
        const groupDiv = document.createElement('div');
        groupDiv.className = 'form-section';

        const groupTitle = document.createElement('h3');
        groupTitle.textContent = field.label;
        groupDiv.appendChild(groupTitle);

        // Générer les champs du groupe
        this.generateFormFromSchema(groupDiv, field.fields, data);

        container.appendChild(groupDiv);
      } else {
        // Champ normal
        const fieldElement = this.createFieldElement(field, data[field.name]);
        container.appendChild(fieldElement);
      }
    });
  }

  createFieldElement(field, value) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field';

    // Label
    if (field.label) {
      const label = document.createElement('label');
      label.textContent = field.label;
      label.className = 'form-label';
      fieldDiv.appendChild(label);
    }

    // Champ selon le type
    let input;
    switch (field.type) {
      case 'text':
      case 'url':
        input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.value = value || field.default || '';
        if (field.placeholder) input.placeholder = field.placeholder;
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.name = field.name;
        input.value = value || field.default || '';
        if (field.placeholder) input.placeholder = field.placeholder;
        break;

      case 'select':
        input = document.createElement('select');
        input.name = field.name;
        if (field.options) {
          field.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            if (value === option.value) opt.selected = true;
            input.appendChild(opt);
          });
        }
        break;

      case 'color':
        input = document.createElement('input');
        input.type = 'color';
        input.name = field.name;
        input.value = value || field.default || '#000000';
        break;

      case 'number':
        input = document.createElement('input');
        input.type = 'number';
        input.name = field.name;
        input.value = value || field.default || 0;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        break;

      case 'boolean':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.name = field.name;
        input.checked = value || field.default || false;
        break;

      case 'media':
        input = this.createMediaField(field, value);
        break;

      case 'array':
        input = this.createArrayField(field, value);
        break;

      default:
        input = document.createElement('input');
        input.type = 'text';
        input.name = field.name;
        input.value = value || field.default || '';
    }

    if (input) {
      input.className = 'form-input';
      fieldDiv.appendChild(input);
    }

    // Description
    if (field.description) {
      const desc = document.createElement('div');
      desc.className = 'form-description';
      desc.textContent = field.description;
      fieldDiv.appendChild(desc);
    }

    return fieldDiv;
  }

  createMediaField(field, value) {
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'media-field';

    const input = document.createElement('input');
    input.type = 'url';
    input.name = field.name;
    input.value = value || '';
    input.placeholder = 'URL du média';
    input.className = 'form-input media-url-input';

    const pickerBtn = document.createElement('button');
    pickerBtn.type = 'button';
    pickerBtn.className = 'btn media-picker-btn';
    pickerBtn.textContent = 'Choisir';
    pickerBtn.dataset.field = field.name;

    mediaDiv.appendChild(input);
    mediaDiv.appendChild(pickerBtn);

    if (value) {
      const preview = document.createElement('div');
      preview.className = 'media-preview';
      if (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        preview.innerHTML = `<img src="${value}" alt="Aperçu" style="max-width: 100px; max-height: 100px;">`;
      }
      mediaDiv.appendChild(preview);
    }

    return mediaDiv;
  }

  createArrayField(field, value = []) {
    const arrayDiv = document.createElement('div');
    arrayDiv.className = 'array-field';

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'array-items';

    value.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'array-item';
      itemDiv.dataset.index = index;

      // Champs de l'élément
      if (field.itemFields) {
        field.itemFields.forEach(subField => {
          const subFieldElement = this.createFieldElement({
            ...subField,
            name: `${field.name}[${index}].${subField.name}`
          }, item[subField.name]);
          itemDiv.appendChild(subFieldElement);
        });
      }

      // Bouton supprimer
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn-danger remove-card-btn';
      removeBtn.textContent = 'Supprimer';
      itemDiv.appendChild(removeBtn);

      itemsDiv.appendChild(itemDiv);
    });

    // Bouton ajouter
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn add-card-btn';
    addBtn.textContent = 'Ajouter un élément';

    arrayDiv.appendChild(itemsDiv);
    arrayDiv.appendChild(addBtn);

    return arrayDiv;
  }

  openSidebar() {
    const sidebar = document.querySelector('.editor-sidebar');
    if (sidebar) {
      sidebar.classList.add('open');
    }
  }

  closeSidebar() {
    if (this.isDirty && !confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?')) {
      return;
    }

    const sidebar = document.querySelector('.editor-sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
    }
    this.currentSection = null;
    this.isDirty = false;
    this.hideSectionEditor();
  }

  hideSectionEditor() {
    // Masquer l'éditeur de section
    const sectionEditor = document.getElementById('sectionEditor');
    const sectionsContainer = document.querySelector('.sections-container');

    if (sectionEditor) sectionEditor.style.display = 'none';
    if (sectionsContainer) sectionsContainer.style.display = 'flex';
  }

  markDirty() {
    this.isDirty = true;
    const saveBtn = document.querySelector('.editor-sidebar-save');
    if (saveBtn) {
      saveBtn.classList.add('btn-primary');
    }
  }

  async saveChanges() {
    if (!this.currentSection) return;

    try {
      const form = document.querySelector('#sectionForm');
      if (!form) {
        console.error('Formulaire de section non trouvé');
        return;
      }
      
      const formData = new FormData(form);
      const formValues = {};

      // Parser les données du formulaire
      for (let [key, value] of formData.entries()) {
        this.setNestedProperty(formValues, key, value);
      }

      console.log('Valeurs du formulaire:', formValues);

      // Mapper vers la structure attendue par l'API
      const sectionData = this.mapFormDataToSection(formValues);
      console.log('Données à sauvegarder:', sectionData);

      // Sauvegarder via l'API
      const response = await fetch(`/api/sections/${this.currentSection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur sauvegarde');
      }

      this.isDirty = false;
      this.closeSidebar();

      // Recharger la page pour voir les changements
      window.location.reload();

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  }

  mapFormDataToSection(formData) {
    const section = {};

    // Champs directs de la section
    const directFields = [
      'title', 'bg_color', 'bg_image', 'bg_video', 'bg_youtube', 'is_transparent',
      'layout', 'padding_top', 'padding_bottom',
      'logo_url', 'logo_width', 'logo_position_h', 'logo_position_v',
      'show_social_links', 'social_position_h', 'social_position_v', 'social_icon_size', 'social_icon_color',
      'show_nav_links', 'nav_position_h', 'nav_position_v', 'nav_text_color', 'nav_bg_color',
      'is_sticky'
    ];

    directFields.forEach(field => {
      if (formData[field] !== undefined) {
        section[field] = formData[field];
      }
    });

    // Éléments (pour le système modulaire elements)
    // Les éléments sont gérés séparément via l'API elements
    // Cette partie peut être supprimée car les éléments sont maintenant gérés individuellement

    // Cartes (si présentes)
    if (formData.cards) {
      section.cards = formData.cards;
    }

    return section;
  }

  cancelChanges() {
    if (this.isDirty && !confirm('Annuler les modifications ?')) {
      return;
    }
    this.closeSidebar();
  }

  showAddSection() {
    // TODO: Implémenter l'ajout de section
    console.log('Ajouter une section');
  }

  deleteSection(sectionId) {
    const section = this.siteConfig.sections.find(s => s.id === sectionId);
    if (!section) return;

    if (!confirm(`Supprimer la section "${section.type}" ?`)) return;

    // Supprimer la section
    this.siteConfig.sections = this.siteConfig.sections.filter(s => s.id !== sectionId);

    // Sauvegarder et rafraîchir la liste
    this.saveChanges();
    this.renderSectionsList();
  }

  addCard() {
    // TODO: Implémenter l'ajout de carte
    console.log('Ajouter une carte');
  }

  removeCard(index) {
    // TODO: Implémenter la suppression de carte
    console.log('Supprimer la carte', index);
  }

  selectGlobalMedia(fieldName, mediaType = 'both') {
    if (window.openMediaPicker) {
      window.openMediaPicker((mediaUrl) => {
        // Mettre à jour l'input
        const input = document.getElementById(fieldName === 'main_bg_image' ? 'globalBgImage' : 'globalBgVideo');
        if (input) {
          input.value = mediaUrl;
        }
        // Mettre à jour la config
        this.siteConfig.global[fieldName] = mediaUrl;
        this.markDirty();
      }, mediaType, fieldName);
    }
  }

  clearGlobalMedia(fieldName) {
    const input = document.getElementById(fieldName === 'main_bg_image' ? 'globalBgImage' : 'globalBgVideo');
    if (input) {
      input.value = '';
    }
    this.siteConfig.global[fieldName] = null;
    this.markDirty();
  }

  openMediaPicker(button) {
    const fieldName = button.dataset.field;
    const input = button.previousElementSibling; // L'input est avant le bouton dans createMediaField
    
    if (window.openMediaPicker && input) {
      window.openMediaPicker((mediaUrl) => {
        input.value = mediaUrl;
        this.markDirty();
      });
    } else {
      console.error('Media picker not available or input not found');
    }
  }

  async saveGlobalConfig(form) {
    try {
      const formData = new FormData(form);
      const globalData = {};
      
      // Parser les données du formulaire
      for (let [key, value] of formData.entries()) {
        globalData[key] = value;
      }
      
      // Mettre à jour la config globale
      this.siteConfig.global = { ...this.siteConfig.global, ...globalData };
      
      // Sauvegarder
      const response = await fetch('/api/site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.siteConfig)
      });
      
      if (!response.ok) throw new Error('Erreur sauvegarde');
      
      alert('Configuration globale sauvegardée');
      
    } catch (error) {
      console.error('Erreur sauvegarde globale:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.editor-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }

  showGlobalConfig() {
    // Masquer la liste des sections
    const sectionsContainer = document.querySelector('.sections-container');
    const globalPanel = document.getElementById('globalConfigPanel');

    if (sectionsContainer) sectionsContainer.style.display = 'none';
    if (globalPanel) globalPanel.style.display = 'flex';
  }

  hideGlobalConfig() {
    // Afficher la liste des sections
    const sectionsContainer = document.querySelector('.sections-container');
    const globalPanel = document.getElementById('globalConfigPanel');

    if (sectionsContainer) sectionsContainer.style.display = 'flex';
    if (globalPanel) globalPanel.style.display = 'none';
  }

  showFontsPanel() {
    // Masquer la liste des sections et config globale
    const sectionsContainer = document.querySelector('.sections-container');
    const globalPanel = document.getElementById('globalConfigPanel');
    const fontsPanel = document.getElementById('fontsPanel');

    if (sectionsContainer) sectionsContainer.style.display = 'none';
    if (globalPanel) globalPanel.style.display = 'none';
    if (fontsPanel) fontsPanel.style.display = 'flex';

    // Charger les polices si nécessaire
    this.loadFonts();
  }

  hideFontsPanel() {
    // Afficher la liste des sections
    const sectionsContainer = document.querySelector('.sections-container');
    const fontsPanel = document.getElementById('fontsPanel');

    if (sectionsContainer) sectionsContainer.style.display = 'flex';
    if (fontsPanel) fontsPanel.style.display = 'none';
  }

  async loadFonts() {
    try {
      const response = await fetch('/api/admin/fonts');
      if (!response.ok) throw new Error('Erreur chargement polices');
      
      const html = await response.text();
      const fontsList = document.getElementById('fontsList');
      if (fontsList) {
        fontsList.innerHTML = html;
        this.bindFontActions();
      }
    } catch (error) {
      console.error('Erreur chargement polices:', error);
    }
  }

  bindFontActions() {
    // Boutons d'ajout de police Google
    document.querySelectorAll('[data-action="add-google-font"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showGoogleFontModal();
      });
    });

    // Boutons d'upload de police
    document.querySelectorAll('[data-action="upload-font"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showUploadFontModal();
      });
    });

    // Boutons de suppression de police
    document.querySelectorAll('[data-action="delete-font"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fontId = e.currentTarget.dataset.fontId;
        this.deleteFont(fontId);
      });
    });
  }

  showGoogleFontModal() {
    // TODO: Implémenter la modale d'ajout de police Google
    alert('Fonctionnalité d\'ajout de police Google à implémenter');
  }

  showUploadFontModal() {
    // TODO: Implémenter la modale d'upload de police
    alert('Fonctionnalité d\'upload de police à implémenter');
  }

  async deleteFont(fontId) {
    if (!confirm('Voulez-vous vraiment supprimer cette police ?')) return;

    try {
      const response = await fetch(`/api/fonts/${fontId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.loadFonts(); // Recharger la liste
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression police:', error);
      alert('Erreur lors de la suppression de la police');
    }
  }

  selectSectionInSidebar(sectionId) {
    // Retirer la sélection précédente
    document.querySelectorAll('section.section-selected').forEach(el => {
      el.classList.remove('section-selected');
    });
    
    // Ajouter la sélection à la section cliquée
    const sectionElement = document.querySelector(`section[data-section-id="${sectionId}"]`);
    if (sectionElement) {
      sectionElement.classList.add('section-selected');
    }
    
    // Ouvrir la sidebar si elle n'est pas ouverte
    this.openSidebar();
    
    // Trouver l'élément de section dans la liste
    const sectionItem = document.querySelector(`.section-item[data-section-id="${sectionId}"]`);
    if (sectionItem) {
      // Simuler un clic sur le bouton "Modifier" de cette section
      const editBtn = sectionItem.querySelector('.edit-section-btn');
      if (editBtn) {
        editBtn.click();
      }
    }
  }

  selectCardInSidebar(sectionId, cardId) {
    // Pour l'instant, sélectionner la section parente
    // TODO: Implémenter l'édition de carte individuelle
    this.selectSectionInSidebar(sectionId);
    console.log('Carte sélectionnée:', cardId, 'dans section:', sectionId);
  }
}

// Initialiser l'éditeur quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  window.siteEditor = new SiteEditor();
});