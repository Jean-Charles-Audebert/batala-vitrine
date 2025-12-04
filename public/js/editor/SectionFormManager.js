/**
 * SectionFormManager.js
 * Gère les formulaires des sections dans la sidebar (ancien système - SiteEditor)
 */

/* global ErrorHandler */

// eslint-disable-next-line no-unused-vars
class SectionFormManager {
  constructor(sectionSchemas = {}) {
    this.sectionSchemas = sectionSchemas;
    this.sectionsData = {};
    this.init();
  }

  init() {
    // Déléguer le chargement des champs de section quand on déplie une section
    document.addEventListener('click', (e) => {
      if (e.target.closest('.section-toggle')) {
        const sectionHeader = e.target.closest('.section-header');
        if (sectionHeader) {
          const sectionId = sectionHeader.getAttribute('data-toggle-section');
          if (sectionId) {
            this.loadSectionFields(sectionId);
          }
        }
      }
    });

    // Déléguer la sauvegarde des champs
    document.addEventListener('change', (e) => {
      if (e.target.closest('.section-fields-container')) {
        this.autoSaveSectionField(e.target);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.closest('.section-fields-container')) {
        this.autoSaveSectionField(e.target);
      }
    });
  }

  cacheAllSectionsData() {
    const sectionsData = window.pageData?.sections || [];
    sectionsData.forEach((section) => {
      this.sectionsData[section.id] = section;
    });
  }

  normalizeColor(color) {
    if (!color) return '#ffffff';
    
    if (/^#[0-9a-f]{6}$/i.test(color)) {
      return color;
    }

    if (/^#[0-9a-f]{3}$/i.test(color)) {
      return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }

    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return '#' + r + g + b;
    }

    return '#ffffff';
  }

  async autoSaveSectionField(fieldElement) {
    const fieldKey = fieldElement.getAttribute('data-field-key');
    const sectionId = parseInt(fieldElement.getAttribute('data-section-id'));

    if (!fieldKey || !sectionId) return;

    try {
      let value;
      if (fieldElement.type === 'checkbox') {
        value = fieldElement.checked;
      } else if (fieldElement.type === 'number') {
        value = parseFloat(fieldElement.value);
      } else {
        value = fieldElement.value;
      }

      // Le fieldKey est "group.field", on l'aplatit en "field" pour matcher le format DB
      const flatFieldKey = fieldKey.split('.').pop();

      const updateData = {
        settings: {}
      };
      
      updateData.settings[flatFieldKey] = value;

      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to save section field');

      this.showFieldSaveNotification(fieldElement, 'Enregistré', 'success');
    } catch (error) {
      ErrorHandler.handle(error, 'Sauvegarde champ section');
      this.showFieldSaveNotification(fieldElement, 'Erreur', 'error');
    }
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  showFieldSaveNotification(fieldElement, message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `field-save-notif field-save-notif-${type}`;
    notif.textContent = message;
    notif.style.cssText = `
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.75rem;
      z-index: 10000;
      opacity: 0;
      animation: fadeInOut 2s ease;
    `;

    const parent = fieldElement.closest('.form-group') || fieldElement.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(notif);

      window.setTimeout(() => notif.remove(), 2000);
    }
  }

  showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.textContent = message;
    notif.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 1rem;
      border-radius: 4px;
      z-index: 10001;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notif);
    window.setTimeout(() => notif.remove(), 3000);
  }

  loadSectionFields(sectionId) {
    try {
      // Convertir sectionId en nombre pour la comparaison
      sectionId = parseInt(sectionId, 10);

      // Chercher les données de la section
      const sectionData = window.pageData?.sections?.find(s => s.id === sectionId);
      if (!sectionData) {
        console.error('Section not found:', sectionId);
        return;
      }

      // Chercher le conteneur pour cette section
      const container = document.querySelector(`.section-fields-container[data-section-id="${sectionId}"]`);
      if (!container) {
        console.error('Container not found for section:', sectionId);
        return;
      }

      // Vérifier si les champs sont déjà chargés
      if (container.classList.contains('loaded')) {
        return;
      }

      // Récupérer le schéma
      const sectionSchema = window.sectionSchemas?.[sectionData.type];
      if (!sectionSchema) {
        console.error('Schema not found for section type:', sectionData.type);
        return;
      }

      // Vider le conteneur
      container.innerHTML = '';

      // Utiliser FormGenerator pour générer les champs
      const formGenerator = window.formGenerator;
      if (!formGenerator) {
        console.error('FormGenerator not available');
        return;
      }

      // Créer un formulaire dans le conteneur
      this.renderSectionFieldsForm(container, sectionData, sectionSchema);

      // Marquer comme chargé
      container.classList.add('loaded');
    } catch (error) {
      ErrorHandler.handle(error, 'Chargement champs section');
    }
  }

  renderSectionFieldsForm(container, sectionData, schema) {
    // Résoudre l'héritage du schéma si présent
    let resolvedSchema = schema;
    if (schema.extends === '_common') {
      const baseSchema = window.sectionSchemas?._common;
      if (baseSchema) {
        resolvedSchema = {
          ...schema,
          fields: {
            ...baseSchema.fields,
            ...schema.fields
          }
        };
      }
    }

    // Générer les groupes de champs
    Object.keys(resolvedSchema.fields || {}).forEach(groupKey => {
      const group = resolvedSchema.fields[groupKey];
      if (group.type === 'group') {
        const groupElement = this.createFormGroup(groupKey, group, sectionData);
        container.appendChild(groupElement);
      }
    });
  }

  createFormGroup(groupKey, groupSchema, sectionData) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'form-section';

    // Titre du groupe si présent
    if (groupSchema.label) {
      const title = document.createElement('h4');
      title.className = 'form-section-title';
      title.textContent = groupSchema.label;
      groupDiv.appendChild(title);
    }

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'form-row';

    // Récupérer les données du groupe
    // Support de deux formats : imbriqué (groupKey.fieldKey) ou à plat (fieldKey directement)
    const groupData = sectionData.settings?.[groupKey] || {};

    Object.keys(groupSchema.fields || {}).forEach(fieldKey => {
      const field = groupSchema.fields[fieldKey];
      // Chercher en premier dans la structure imbriquée, sinon à plat
      let fieldValue = groupData[fieldKey];
      if (fieldValue === undefined) {
        fieldValue = sectionData.settings?.[fieldKey];
      }
      const fieldElement = this.createFormField(fieldKey, field, fieldValue, groupKey, sectionData.id);
      fieldsContainer.appendChild(fieldElement);
    });

    groupDiv.appendChild(fieldsContainer);
    return groupDiv;
  }

  createFormField(fieldKey, fieldSchema, fieldValue, groupKey, sectionId) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-group';

    // Ajouter la classe compact pour certains types
    if (['color', 'checkbox', 'number', 'select'].includes(fieldSchema.type)) {
      fieldDiv.classList.add('compact');
    }

    // Gestion de showIf (logique conditionnelle simple)
    if (fieldSchema.showIf) {
      fieldDiv.style.display = 'none';
      fieldDiv.setAttribute('data-show-if', JSON.stringify(fieldSchema.showIf));
      // TODO: Implémenter la logique conditionnelle avec des listeners
    }

    // Label
    if (fieldSchema.label) {
      const label = document.createElement('label');
      label.textContent = fieldSchema.label;
      fieldDiv.appendChild(label);
    }

    // Créer l'input selon le type
    let input;
    const inputId = `section-${sectionId}-${groupKey}-${fieldKey}`;
    const dataFieldKey = `${groupKey}.${fieldKey}`;

    switch (fieldSchema.type) {
      case 'text':
      case 'email':
      case 'url':
        input = document.createElement('input');
        input.type = fieldSchema.type;
        input.id = inputId;
        input.value = fieldValue || '';
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
        break;

      case 'color':
        input = document.createElement('input');
        input.type = 'color';
        input.id = inputId;
        input.value = this.normalizeColor(fieldValue || '#ffffff');
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
        break;

      case 'number':
        input = document.createElement('input');
        input.type = 'number';
        input.id = inputId;
        if (fieldSchema.min !== undefined) input.min = fieldSchema.min;
        if (fieldSchema.max !== undefined) input.max = fieldSchema.max;
        if (fieldSchema.step !== undefined) input.step = fieldSchema.step;
        input.value = fieldValue || 0;
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
        break;

      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = inputId;
        input.checked = Boolean(fieldValue);
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
        break;

      case 'select':
        input = document.createElement('select');
        input.id = inputId;
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
        
        if (fieldSchema.options) {
          fieldSchema.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === fieldValue) option.selected = true;
            input.appendChild(option);
          });
        }
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.id = inputId;
        input.value = fieldValue || '';
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
        fieldDiv.classList.add('full-width');
        break;

      case 'media': {
        // Créer un conteneur pour le media picker
        input = document.createElement('input');
        input.type = 'text';
        input.id = inputId;
        input.value = fieldValue || '';
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
        input.readOnly = true;
        input.style.flex = '1';
        
        // Créer les boutons media picker et clear
        const mediaContainer = document.createElement('div');
        mediaContainer.style.display = 'flex';
        mediaContainer.style.gap = '0.5rem';
        mediaContainer.style.alignItems = 'center';
        
        const pickBtn = document.createElement('button');
        pickBtn.type = 'button';
        pickBtn.className = 'btn btn-xs btn-secondary';
        pickBtn.innerHTML = '<i class="fas fa-folder-open"></i>';
        pickBtn.title = 'Parcourir';
        pickBtn.setAttribute('data-field-key', dataFieldKey);
        pickBtn.setAttribute('data-section-id', sectionId);
        pickBtn.addEventListener('click', () => {
          if (window.openMediaPicker) {
            window.openMediaPicker((url) => {
              input.value = url;
              this.autoSaveSectionField(input);
            }, 'both');
          }
        });
        
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'btn btn-xs btn-danger';
        clearBtn.innerHTML = '<i class="fas fa-trash"></i>';
        clearBtn.title = 'Effacer';
        clearBtn.addEventListener('click', () => {
          input.value = '';
          this.autoSaveSectionField(input);
        });
        
        fieldDiv.appendChild(input);
        mediaContainer.appendChild(pickBtn);
        mediaContainer.appendChild(clearBtn);
        fieldDiv.appendChild(mediaContainer);
        fieldDiv.style.display = 'flex';
        fieldDiv.style.gap = '0.5rem';
        fieldDiv.style.alignItems = 'center';
        return fieldDiv;
      }

      default:
        input = document.createElement('input');
        input.type = 'text';
        input.id = inputId;
        input.value = fieldValue || '';
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-section-id', sectionId);
    }

    if (input) {
      fieldDiv.appendChild(input);
    }

    return fieldDiv;
  }
}

// Exposer globalement
// eslint-disable-next-line no-unused-vars
window.SectionFormManager = SectionFormManager;
