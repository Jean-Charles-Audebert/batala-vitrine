// Classe pour gérer la page d'édition complète
class EditorPage {
  constructor() {
    this.currentSectionId = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadPreview();
  }

  bindEvents() {
    // Gestionnaire d'événements pour les onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTabClick(e));
    });

    // Gestionnaire pour le bouton de sauvegarde
    document.getElementById('save-btn').addEventListener('click', () => this.savePage());

    // Gestionnaire pour le sélecteur de type de section
    document.getElementById('section-type').addEventListener('change', (e) => {
      const sectionType = e.target.value;
      if (sectionType) {
        this.generateSectionForm(sectionType);
      }
    });

    // Gestionnaire pour le bouton de sauvegarde de section
    document.getElementById('section-save-btn').addEventListener('click', () => this.saveSection());

    // Gestionnaire pour le bouton annuler de section
    document.getElementById('section-cancel-btn').addEventListener('click', () => {
      document.getElementById('section-modal').style.display = 'none';
    });

    // Gestionnaire pour les boutons d'action des sections
    document.getElementById('sections-list').addEventListener('click', (e) => this.handleSectionAction(e));

    // Gestionnaire pour les contrôles de périphérique
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.updatePreviewDevice(e.currentTarget.dataset.device);
      });
    });

    // Gestionnaire pour le media picker du fond
    document.querySelector('.select-bg-media').addEventListener('click', () => {
      openMediaPicker((mediaUrl) => {
        document.getElementById('page-main-bg-media-url').value = mediaUrl;
      }, 'both', 'main_bg_media_url');
    });

    // Gestionnaire pour vider le média de fond
    document.querySelector('.clear-bg-media')?.addEventListener('click', function() {
      document.getElementById('page-main-bg-media-url').value = '';
      this.style.display = 'none';
    });

    // Gestionnaire pour le bouton gérer les polices
    document.querySelector('.manage-fonts-btn').addEventListener('click', function() {
      window.open('/admin/fonts', '_blank');
    });

    // Gestionnaire pour les changements de polices (aperçu en temps réel)
    document.getElementById('page-title-font-id').addEventListener('change', () => this.updatePreviewFonts());
    document.getElementById('page-text-font-id').addEventListener('change', () => this.updatePreviewFonts());

    // Boutons de modale de section
    document.getElementById('section-save-btn').addEventListener('click', () => this.saveSection());
    document.getElementById('section-cancel-btn').addEventListener('click', () => {
      document.getElementById('section-modal').style.display = 'none';
    });

    // Boutons de modale d'élément
    document.getElementById('element-save-btn').addEventListener('click', () => this.saveElement());
    document.getElementById('element-cancel-btn').addEventListener('click', () => this.closeElementModal());

    // Fermeture des modales
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });
  }

  handleTabClick(e) {
    const tabName = e.currentTarget.dataset.tab;

    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Afficher l'onglet sélectionné
    document.getElementById(tabName + '-tab').classList.add('active');
    e.currentTarget.classList.add('active');
  }

  handleSectionAction(e) {
    const target = e.target.closest('.action-btn');
    if (!target) return;

    const sectionItem = target.closest('.section-item');
    const sectionId = sectionItem.dataset.sectionId;

    if (target.classList.contains('edit-btn')) {
      this.editSection(sectionId);
    } else if (target.classList.contains('visibility-btn')) {
      this.toggleSectionVisibility(sectionId);
    } else if (target.classList.contains('delete-btn')) {
      this.deleteSection(sectionId);
    }
  }

  // Fonction pour charger l'aperçu
  loadPreview() {
    const iframe = document.getElementById('preview-iframe');
    const previewFrame = document.getElementById('preview-frame');

    // Afficher le placeholder de chargement
    iframe.style.display = 'none';
    previewFrame.insertAdjacentHTML('beforeend', '<div class="preview-placeholder" id="loading-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Chargement de l\'aperçu...</p></div>');

    // Définir directement la source de l'iframe vers la route d'aperçu
    iframe.src = '/api/preview';

    // Attendre que l'iframe soit chargé puis injecter les polices
    iframe.onload = () => {
      setTimeout(() => {
        this.injectFontsIntoPreview();
        this.showPreview();
      }, 500);
    };
  }

  injectFontsIntoPreview() {
    const iframe = document.getElementById('preview-iframe');
    if (!iframe) return;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (!iframeDoc) return;

      // Récupérer les polices sélectionnées dans les selects
      const titleFontId = document.getElementById('page-title-font-id').value;
      const textFontId = document.getElementById('page-text-font-id').value;

      let titleFontFamily = 'Arial, sans-serif';
      let textFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Supprimer les anciens liens de polices
      const existingTitleLink = iframeDoc.getElementById('dynamic-title-font-link');
      const existingTextLink = iframeDoc.getElementById('dynamic-text-font-link');
      if (existingTitleLink) existingTitleLink.remove();
      if (existingTextLink) existingTextLink.remove();

      // Trouver les polices et ajouter les liens si nécessaire
      if (window.fontsData && window.fontsData.length > 0) {
        window.fontsData.forEach(font => {
          if (font.font_family) {
            if (titleFontId == font.id) {
              titleFontFamily = font.font_family;
              if (font.font_url) {
                const titleLink = iframeDoc.createElement('link');
                titleLink.id = 'dynamic-title-font-link';
                titleLink.rel = 'stylesheet';
                titleLink.href = font.font_url;
                iframeDoc.head.appendChild(titleLink);
              }
            }
            if (textFontId == font.id) {
              textFontFamily = font.font_family;
              if (font.font_url) {
                const textLink = iframeDoc.createElement('link');
                textLink.id = 'dynamic-text-font-link';
                textLink.rel = 'stylesheet';
                textLink.href = font.font_url;
                iframeDoc.head.appendChild(textLink);
              }
            }
          }
        });
      }

      // Injecter les variables CSS de polices dans l'iframe
      const style = iframeDoc.createElement('style');
      style.textContent = `
        :root {
          --font-family-title: ${titleFontFamily};
          --font-family-text: ${textFontFamily};
        }
      `;
      iframeDoc.head.appendChild(style);

      // Injecter aussi les styles des polices individuelles
      if (window.fontsData && window.fontsData.length > 0) {
        window.fontsData.forEach(font => {
          if (font.font_family) {
            const fontStyle = iframeDoc.createElement('style');
            fontStyle.textContent = `
              .font-${font.id} {
                font-family: ${font.font_family} !important;
              }
            `;
            iframeDoc.head.appendChild(fontStyle);
          }
        });
      }
    } catch (error) {
      console.warn('Impossible d\'injecter les polices dans l\'iframe:', error);
    }
  }

  showPreview() {
    const placeholder = document.getElementById('loading-placeholder');
    const iframe = document.getElementById('preview-iframe');
    if (placeholder) {
      placeholder.remove();
    }
    iframe.style.display = 'block';
  }

  // Fonction pour sauvegarder la page
  async savePage() {
    const pageData = {
      title: document.getElementById('page-title').value.trim(),
      contact_email: document.getElementById('page-contact-email').value.trim(),
      main_bg_color: document.getElementById('page-main-bg-color').value.trim(),
      main_bg_media_url: document.getElementById('page-main-bg-media-url').value.trim() || null,
      main_bg_youtube_url: document.getElementById('page-main-bg-youtube-url').value.trim() || null,
      main_bg_opacity: parseFloat(document.getElementById('page-main-bg-opacity').value),
      main_bg_position: document.getElementById('page-main-bg-position').value.trim(),
      title_font_id: document.getElementById('page-title-font-id').value ? parseInt(document.getElementById('page-title-font-id').value) : null,
      text_font_id: document.getElementById('page-text-font-id').value ? parseInt(document.getElementById('page-text-font-id').value) : null
    };

    // Nettoyer les données : supprimer les propriétés vides/null/undefined
    Object.keys(pageData).forEach(key => {
      if (pageData[key] === '' || pageData[key] === null || pageData[key] === undefined) {
        if (key !== 'main_bg_media_url' && key !== 'main_bg_youtube_url' && key !== 'title_font_id' && key !== 'text_font_id') {
          delete pageData[key];
        } else if (pageData[key] === '') {
          pageData[key] = null;
        }
      }
    });

    // Vérifier s'il y a des changements par rapport aux données actuelles
    const currentData = window.pageData || {};
    const hasChanges = Object.keys(pageData).some(key => {
      const newVal = pageData[key];
      const currentVal = currentData[key];
      return newVal !== currentVal && !(newVal === null && currentVal === undefined) && !(newVal === undefined && currentVal === null);
    });

    if (!hasChanges) {
      console.log('Aucun changement détecté, sauvegarde annulée');
      alert('Aucun changement détecté.');
      return;
    }

    console.log('Données à envoyer:', JSON.stringify(pageData, null, 2));

    try {
      const response = await fetch('/api/page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
      });

      if (response.ok) {
        console.log('Page sauvegardée');
        alert('Page sauvegardée avec succès!');
        this.loadPreview();
      } else {
        const errorText = await response.text();
        console.error('Erreur serveur:', response.status, errorText);
        throw new Error(`Erreur sauvegarde: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  }

  // Fonction pour afficher la modale de section
  showSectionModal(sectionId = null, sectionType = null) {
    const modal = document.getElementById('section-modal');
    const title = document.getElementById('section-modal-title');
    const typeSelector = document.getElementById('section-type-selector');
    const dynamicForm = document.getElementById('section-dynamic-form');

    // Stocker l'ID de la section en cours d'édition
    this.currentSectionId = sectionId;

    if (sectionId) {
      title.textContent = 'Modifier la section';
      typeSelector.style.display = 'block'; // Afficher le sélecteur de type pour permettre le changement
      this.loadSectionData(sectionId);
    } else {
      title.textContent = 'Ajouter une section';
      typeSelector.style.display = 'block';
      dynamicForm.innerHTML = '';

      // Si un type est pré-sélectionné, générer le formulaire
      if (sectionType) {
        document.getElementById('section-type').value = sectionType;
        this.generateSectionForm(sectionType);
      }
    }

    modal.style.display = 'block';
  }

  // Fonction pour générer le formulaire dynamique selon le schéma
  generateSectionForm(sectionType, sectionData = {}) {
    const schema = window.sectionSchemas[sectionType];
    if (!schema) {
      console.error('Schéma non trouvé pour le type:', sectionType);
      return;
    }

    const dynamicForm = document.getElementById('section-dynamic-form');
    dynamicForm.innerHTML = '';

    // Générer les groupes de champs
    Object.keys(schema.fields).forEach(groupKey => {
      const group = schema.fields[groupKey];
      if (group.type === 'group') {
        const groupElement = this.createFormGroup(groupKey, group, sectionData);
        dynamicForm.appendChild(groupElement);
      } else if (group.type === 'array') {
        const arrayElement = this.createFormArray(groupKey, group, sectionData[groupKey] || []);
        dynamicForm.appendChild(arrayElement);
      }
    });
  }

  // Fonction pour créer un groupe de champs
  createFormGroup(groupKey, groupSchema, groupData) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'form-section';

    const title = document.createElement('h4');
    title.className = 'form-section-title';
    title.textContent = groupSchema.label;
    groupDiv.appendChild(title);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'form-row';

    Object.keys(groupSchema.fields).forEach(fieldKey => {
      const field = groupSchema.fields[fieldKey];
      const fieldElement = this.createFormField(fieldKey, field, groupData[fieldKey]);
      fieldsContainer.appendChild(fieldElement);
    });

    groupDiv.appendChild(fieldsContainer);
    return groupDiv;
  }

  // Fonction pour créer un champ de formulaire
  createFormField(fieldKey, fieldSchema, fieldValue) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = `form-group ${fieldSchema.type === 'textarea' || fieldSchema.type === 'array' ? 'full-width' : ''}`;

    // Label
    if (fieldSchema.label) {
      const label = document.createElement('label');
      label.setAttribute('for', `field-${fieldKey}`);
      label.textContent = fieldSchema.label;
      if (fieldSchema.required) label.textContent += ' *';
      fieldDiv.appendChild(label);
    }

    // Champ selon le type
    let input;
    switch (fieldSchema.type) {
      case 'text':
      case 'url':
        input = document.createElement('input');
        input.type = fieldSchema.type === 'url' ? 'url' : 'text';
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;
        input.placeholder = fieldSchema.placeholder || '';
        input.value = fieldValue || fieldSchema.default || '';
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;
        input.placeholder = fieldSchema.placeholder || '';
        input.value = fieldValue || fieldSchema.default || '';
        input.rows = 3;
        break;

      case 'number':
        input = document.createElement('input');
        input.type = 'number';
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;
        input.value = fieldValue || fieldSchema.default || '';
        if (fieldSchema.min !== undefined) input.min = fieldSchema.min;
        if (fieldSchema.max !== undefined) input.max = fieldSchema.max;
        break;

      case 'boolean':
        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'checkbox-label';
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;
        input.checked = fieldValue !== undefined ? fieldValue : (fieldSchema.default || false);
        checkboxLabel.appendChild(input);
        checkboxLabel.appendChild(document.createTextNode(fieldSchema.label));
        fieldDiv.innerHTML = '';
        fieldDiv.appendChild(checkboxLabel);
        return fieldDiv;

      case 'select':
        input = document.createElement('select');
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;

        if (fieldSchema.options) {
          fieldSchema.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (fieldValue === option.value || (!fieldValue && option.value === fieldSchema.default)) {
              optionElement.selected = true;
            }
            input.appendChild(optionElement);
          });
        }
        break;

      case 'color':
        input = document.createElement('input');
        input.type = 'color';
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;
        input.value = fieldValue || fieldSchema.default || '#000000';
        break;

      case 'font':
        input = document.createElement('select');
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;

        // Option vide
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Police par défaut';
        input.appendChild(emptyOption);

        // Options de polices
        if (window.fontsData) {
          window.fontsData.forEach(font => {
            const option = document.createElement('option');
            option.value = font.id;
            option.textContent = `${font.name} (${font.source})`;
            if (fieldValue == font.id) option.selected = true;
            input.appendChild(option);
          });
        }
        break;

      case 'media':
        const mediaField = document.createElement('div');
        mediaField.className = 'media-upload-field';

        input = document.createElement('input');
        input.type = 'text';
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;
        input.placeholder = fieldSchema.placeholder || 'URL du média';
        input.value = fieldValue || '';
        input.readOnly = true;

        const selectBtn = document.createElement('button');
        selectBtn.type = 'button';
        selectBtn.className = 'btn btn-sm btn-secondary';
        selectBtn.textContent = 'Choisir';
        selectBtn.onclick = () => openMediaPicker((url) => {
          input.value = url;
        }, fieldSchema.accept || 'image/*', fieldKey);

        mediaField.appendChild(input);
        mediaField.appendChild(selectBtn);

        if (fieldValue) {
          const clearBtn = document.createElement('button');
          clearBtn.type = 'button';
          clearBtn.className = 'btn btn-sm btn-danger';
          clearBtn.textContent = '×';
          clearBtn.onclick = () => input.value = '';
          mediaField.appendChild(clearBtn);
        }

        fieldDiv.appendChild(mediaField);
        return fieldDiv;

      default:
        input = document.createElement('input');
        input.type = 'text';
        input.id = `field-${fieldKey}`;
        input.name = fieldKey;
        input.value = fieldValue || fieldSchema.default || '';
    }

    if (input) {
      fieldDiv.appendChild(input);
    }

    return fieldDiv;
  }

  // Fonction pour créer un array de champs
  createFormArray(arrayKey, arraySchema, arrayData) {
    const arrayDiv = document.createElement('div');
    arrayDiv.className = 'form-section';

    const title = document.createElement('h4');
    title.className = 'form-section-title';
    title.textContent = arraySchema.label;
    arrayDiv.appendChild(title);

    const itemsContainer = document.createElement('div');
    itemsContainer.id = `array-${arrayKey}`;

    // Ajouter les éléments existants
    (arrayData || []).forEach((itemData, index) => {
      const itemElement = this.createArrayItem(arrayKey, arraySchema, itemData, index);
      itemsContainer.appendChild(itemElement);
    });

    arrayDiv.appendChild(itemsContainer);

    // Bouton pour ajouter un élément
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-array-item';
    addBtn.textContent = `+ Ajouter ${arraySchema.itemLabel || 'un élément'}`;
    addBtn.onclick = () => this.addArrayItem(arrayKey, arraySchema);
    arrayDiv.appendChild(addBtn);

    return arrayDiv;
  }

  // Fonction pour créer un élément d'array
  createArrayItem(arrayKey, arraySchema, itemData, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'array-item';
    itemDiv.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'array-item-header';

    const title = document.createElement('div');
    title.className = 'array-item-title';
    title.textContent = `${arraySchema.itemLabel || 'Élément'} ${index + 1}`;
    header.appendChild(title);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-array-item';
    removeBtn.textContent = 'Supprimer';
    removeBtn.onclick = () => this.removeArrayItem(arrayKey, index);
    header.appendChild(removeBtn);

    itemDiv.appendChild(header);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'form-row';

    Object.keys(arraySchema.fields).forEach(fieldKey => {
      const field = arraySchema.fields[fieldKey];
      const fieldElement = this.createFormField(`${arrayKey}[${index}].${fieldKey}`, field, itemData[fieldKey]);
      fieldsContainer.appendChild(fieldElement);
    });

    itemDiv.appendChild(fieldsContainer);
    return itemDiv;
  }

  // Fonction pour ajouter un élément à un array
  addArrayItem(arrayKey, arraySchema) {
    const container = document.getElementById(`array-${arrayKey}`);
    const currentItems = container.children.length;
    const itemElement = this.createArrayItem(arrayKey, arraySchema, {}, currentItems);
    container.appendChild(itemElement);
  }

  // Fonction pour supprimer un élément d'array
  removeArrayItem(arrayKey, index) {
    const container = document.getElementById(`array-${arrayKey}`);
    const itemToRemove = container.querySelector(`[data-index="${index}"]`);
    if (itemToRemove) {
      itemToRemove.remove();
      // Réindexer les éléments restants
      Array.from(container.children).forEach((item, newIndex) => {
        item.dataset.index = newIndex;
        item.querySelector('.array-item-title').textContent = `Élément ${newIndex + 1}`;
        // Mettre à jour les names des champs
        item.querySelectorAll('input, select, textarea').forEach(field => {
          const nameParts = field.name.split('.');
          if (nameParts.length > 1) {
            field.name = `${arrayKey}[${newIndex}].${nameParts[1]}`;
          }
        });
      });
    }
  }

  // Fonction pour charger les données d'une section
  loadSectionData(sectionId) {
    const section = window.pageData.sections.find(s => s.id == sectionId);
    if (!section) {
      console.error('Section non trouvée:', sectionId);
      return;
    }

    // Définir le type dans le sélecteur
    document.getElementById('section-type').value = section.type;

    this.generateSectionForm(section.type, section.settings || {});
  }

  // Fonction pour sauvegarder une section
  async saveSection() {
    const sectionType = document.getElementById('section-type').value;
    const formData = this.collectFormData();

    const sectionData = {
      type: sectionType,
      settings: formData,
      is_visible: true,
      order: 0
    };

    console.log('Données à sauvegarder:', JSON.stringify(sectionData, null, 2));

    let url = '/api/sections';
    let method = 'POST';

    if (this.currentSectionId) {
      url += `/${this.currentSectionId}`;
      method = 'PUT';
      sectionData.id = this.currentSectionId;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData)
      });

      if (response.ok) {
        console.log('Section sauvegardée');
        alert('Section sauvegardée avec succès!');
        // Mettre à jour les données locales et recharger l'aperçu
        if (this.currentSectionId) {
          const section = window.pageData.sections.find(s => s.id == this.currentSectionId);
          if (section) {
            section.settings = formData;
          }
        }
        document.getElementById('section-modal').style.display = 'none';
        this.loadPreview();
      } else {
        const errorText = await response.text();
        console.error('Erreur serveur:', response.status, errorText);
        throw new Error(`Erreur sauvegarde: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  }

  // Fonction pour collecter les données du formulaire dynamique
  collectFormData() {
    const formData = {};
    const fields = document.querySelectorAll('#section-dynamic-form input, #section-dynamic-form select, #section-dynamic-form textarea');

    fields.forEach(field => {
      if (field.name) {
        let value = field.type === 'checkbox' ? field.checked : field.value;

        // Gestion des arrays
        if (field.name.includes('[') && field.name.includes(']')) {
          const arrayMatch = field.name.match(/^([^[]+)\[(\d+)\]\.(.+)$/);
          if (arrayMatch) {
            const arrayName = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);
            const fieldName = arrayMatch[3];

            if (!formData[arrayName]) formData[arrayName] = [];
            if (!formData[arrayName][index]) formData[arrayName][index] = {};
            formData[arrayName][index][fieldName] = value;
          }
        } else {
          // Conversion des types
          if (field.type === 'number' && value !== '') {
            value = parseFloat(value);
          } else if (field.type === 'checkbox') {
            value = field.checked;
          }

          formData[field.name] = value;
        }
      }
    });

    return formData;
  }

  // Fonction pour mettre à jour les polices dans l'aperçu
  updatePreviewFonts() {
    const iframe = document.getElementById('preview-iframe');
    if (!iframe || iframe.style.display === 'none') return;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
        // Récupérer les polices sélectionnées dans les selects
        const titleFontId = document.getElementById('page-title-font-id').value;
        const textFontId = document.getElementById('page-text-font-id').value;

        let titleFontFamily = 'Arial, sans-serif';
        let textFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        // Supprimer les anciens liens de polices
        const existingTitleLink = iframeDoc.getElementById('dynamic-title-font-link');
        const existingTextLink = iframeDoc.getElementById('dynamic-text-font-link');
        if (existingTitleLink) existingTitleLink.remove();
        if (existingTextLink) existingTextLink.remove();

        // Trouver les polices et ajouter les liens si nécessaire
        if (window.fontsData && window.fontsData.length > 0) {
          window.fontsData.forEach(font => {
            if (font.font_family) {
              if (titleFontId == font.id) {
                titleFontFamily = font.font_family;
                if (font.font_url) {
                  const titleLink = iframeDoc.createElement('link');
                  titleLink.id = 'dynamic-title-font-link';
                  titleLink.rel = 'stylesheet';
                  titleLink.href = font.font_url;
                  iframeDoc.head.appendChild(titleLink);
                }
              }
              if (textFontId == font.id) {
                textFontFamily = font.font_family;
                if (font.font_url) {
                  const textLink = iframeDoc.createElement('link');
                  textLink.id = 'dynamic-text-font-link';
                  textLink.rel = 'stylesheet';
                  textLink.href = font.font_url;
                  iframeDoc.head.appendChild(textLink);
                }
              }
            }
          });
        }

        // Supprimer l'ancien style de polices s'il existe
        const existingStyle = iframeDoc.getElementById('dynamic-font-styles');
        if (existingStyle) {
          existingStyle.remove();
        }

        // Injecter les nouvelles variables CSS de polices
        const style = iframeDoc.createElement('style');
        style.id = 'dynamic-font-styles';
        style.textContent = `
          :root {
            --font-family-title: ${titleFontFamily};
            --font-family-text: ${textFontFamily};
          }
        `;
        iframeDoc.head.appendChild(style);
      }
    } catch (error) {
      console.warn('Impossible de mettre à jour les polices dans l\'iframe:', error);
    }
  }

  // Fonction pour éditer une section
  editSection(sectionId) {
    this.showSectionModal(sectionId);
  }

  // Fonction pour basculer la visibilité d'une section
  async toggleSectionVisibility(sectionId) {
    const section = window.pageData.sections.find(s => s.id == sectionId);
    if (!section) return;

    const newVisibility = !section.is_visible;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: newVisibility })
      });

      if (response.ok) {
        section.is_visible = newVisibility;
        const visibilityIcon = document.querySelector(`[data-section-id="${sectionId}"] .visibility-btn i`);
        const visibilityText = document.querySelector(`[data-section-id="${sectionId}"] .visibility-status`);

        if (newVisibility) {
          visibilityIcon.className = 'fas fa-eye';
          visibilityText.textContent = 'Visible';
        } else {
          visibilityIcon.className = 'fas fa-eye-slash';
          visibilityText.textContent = 'Masqué';
        }

        this.loadPreview();
      } else {
        throw new Error('Erreur toggle visibility');
      }
    } catch (error) {
      console.error('Erreur toggle visibility:', error);
      alert('Erreur lors de la modification de la visibilité');
    }
  }

  // Fonction pour supprimer une section
  async deleteSection(sectionId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (sectionElement) {
          sectionElement.remove();
        }
        this.loadPreview();
      } else {
        throw new Error('Erreur suppression');
      }
    } catch (error) {
      console.error('Erreur delete section:', error);
      alert('Erreur lors de la suppression');
    }
  }

  // Fonction pour mettre à jour l'aperçu selon le périphérique
  updatePreviewDevice(device) {
    const iframe = document.getElementById('preview-iframe');
    if (iframe) {
      iframe.className = device;
    }
  }

  // Fonction pour sauvegarder un élément
  async saveElement() {
    const elementData = {
      id: document.getElementById('element-id').value,
      title: document.getElementById('element-title').value,
      font_id: document.getElementById('element-font-id').value || null
    };

    try {
      const response = await fetch('/api/elements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elementData)
      });

      if (response.ok) {
        console.log('Élément sauvegardé');
        alert('Élément sauvegardé avec succès!');
        document.getElementById('element-edit-modal').style.display = 'none';
        this.loadPreview();
      } else {
        throw new Error('Erreur sauvegarde élément');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'élément:', error);
      alert('Erreur lors de la sauvegarde de l\'élément');
    }
  }

  // Fonction pour fermer la modale d'élément
  closeElementModal() {
    document.getElementById('element-edit-modal').style.display = 'none';
  }
}

// Initialiser la page d'édition quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  window.editorPage = new EditorPage();
});