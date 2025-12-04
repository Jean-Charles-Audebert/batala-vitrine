/**
 * ElementFormManager.js
 * Gère les formulaires des éléments dans la sidebar (ancien système - SiteEditor)
 */

/* global ErrorHandler */
// eslint-disable-next-line no-unused-vars
const openMediaPicker = window.openMediaPicker;

// eslint-disable-next-line no-unused-vars
class ElementFormManager {
  constructor(elementSchemas = {}) {
    this.elementSchemas = elementSchemas;
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.element-toggle')) {
        const elementHeader = e.target.closest('.element-header');
        if (elementHeader) {
          const elementId = elementHeader.getAttribute('data-toggle-element');
          if (elementId) {
            this.loadElementFields(elementId);
          }
        }
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.closest('.element-fields-container')) {
        this.autoSaveElementField(e.target);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.closest('.element-fields-container')) {
        this.autoSaveElementField(e.target);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.delete-element-btn')) {
        const elementId = e.target.closest('.delete-element-btn').getAttribute('data-element-id');
        if (elementId && confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
          this.deleteElement(elementId);
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.media-picker-btn')) {
        const btn = e.target.closest('.media-picker-btn');
        const fieldKey = btn.getAttribute('data-field-key');
        const elementId = btn.getAttribute('data-element-id');
        const mediaType = btn.getAttribute('data-media-type');
        
        if (window.openMediaPicker) {
          window.openMediaPicker((url) => {
            this.setElementFieldValue(fieldKey, url, elementId);
          }, mediaType);
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.clear-media-btn')) {
        const btn = e.target.closest('.clear-media-btn');
        const fieldKey = btn.getAttribute('data-field-key');
        const elementId = btn.getAttribute('data-element-id');
        
        const input = document.querySelector(`input[data-field-key="${fieldKey}"][data-element-id="${elementId}"]`);
        if (input) {
          input.value = '';
          this.autoSaveElementField(input);
        }
      }
    });
  }

  setElementFieldValue(fieldKey, value, elementId) {
    const input = document.querySelector(`input[data-field-key="${fieldKey}"][data-element-id="${elementId}"]`);
    if (input) {
      input.value = value;
      this.autoSaveElementField(input);
    }
  }

  async autoSaveElementField(fieldElement) {
    const fieldKey = fieldElement.getAttribute('data-field-key');
    const elementId = parseInt(fieldElement.getAttribute('data-element-id'));

    if (!fieldKey || !elementId) return;

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

      const response = await fetch(`/api/elements/${elementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to save element field');

      this.showFieldSaveNotification(fieldElement, 'Enregistré');
    } catch (error) {
      ErrorHandler.handle(error, 'Sauvegarde champ élément');
      this.showFieldSaveNotification(fieldElement, 'Erreur', 'error');
    }
  }

  async deleteElement(elementId) {
    try {
      const response = await fetch(`/api/elements/${elementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete element');

      const elementItem = document.querySelector(`[data-element-id="${elementId}"]`);
      if (elementItem) {
        elementItem.style.animation = 'slideOut 0.3s ease';
        window.setTimeout(() => {
          elementItem.remove();
          this.showNotification('Élément supprimé', 'success');
        }, 300);
      }
    } catch (error) {
      ErrorHandler.handle(error, 'Suppression élément');
      this.showNotification('Erreur lors de la suppression', 'error');
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

  loadElementFields(elementId) {
    try {
      // Convertir elementId en nombre pour la comparaison
      elementId = parseInt(elementId, 10);

      // Chercher les données de l'élément parmi toutes les sections
      let elementData = null;
      const sections = window.pageData?.sections || [];
      for (const section of sections) {
        const element = section.elements?.find(e => e.id === elementId);
        if (element) {
          elementData = element;
          break;
        }
      }

      if (!elementData) {
        console.error('Element not found:', elementId);
        return;
      }

      // Chercher le conteneur pour cet élément
      const container = document.querySelector(`.element-fields-container[data-element-id="${elementId}"]`);
      if (!container) {
        console.error('Container not found for element:', elementId);
        return;
      }

      // Vérifier si les champs sont déjà chargés
      if (container.classList.contains('loaded')) {
        return;
      }

      // Récupérer le schéma
      const elementSchema = window.elementSchemas?.[elementData.type];
      if (!elementSchema) {
        console.error('Schema not found for element type:', elementData.type);
        return;
      }

      // Vider le conteneur
      container.innerHTML = '';

      // Créer un formulaire dans le conteneur
      this.renderElementFieldsForm(container, elementData, elementSchema);

      // Marquer comme chargé
      container.classList.add('loaded');
    } catch (error) {
      ErrorHandler.handle(error, 'Chargement champs élément');
    }
  }

  renderElementFieldsForm(container, elementData, schema) {
    // Résoudre l'héritage du schéma si présent
    let resolvedSchema = schema;
    if (schema.extends === '_common') {
      const baseSchema = window.elementSchemas?._common;
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
        const groupElement = this.createFormGroup(groupKey, group, elementData);
        container.appendChild(groupElement);
      }
    });
  }

  createFormGroup(groupKey, groupSchema, elementData) {
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
    const groupData = elementData.settings?.[groupKey] || {};

    Object.keys(groupSchema.fields || {}).forEach(fieldKey => {
      const field = groupSchema.fields[fieldKey];
      // Chercher en premier dans la structure imbriquée, sinon à plat
      let fieldValue = groupData[fieldKey];
      if (fieldValue === undefined) {
        fieldValue = elementData.settings?.[fieldKey];
      }
      const fieldElement = this.createFormField(fieldKey, field, fieldValue, groupKey, elementData.id);
      fieldsContainer.appendChild(fieldElement);
    });

    groupDiv.appendChild(fieldsContainer);
    return groupDiv;
  }

  createFormField(fieldKey, fieldSchema, fieldValue, groupKey, elementId) {
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
    const inputId = `element-${elementId}-${groupKey}-${fieldKey}`;
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
        input.setAttribute('data-element-id', elementId);
        break;

      case 'color':
        input = document.createElement('input');
        input.type = 'color';
        input.id = inputId;
        input.value = this.normalizeColor(fieldValue || '#ffffff');
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-element-id', elementId);
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
        input.setAttribute('data-element-id', elementId);
        break;

      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = inputId;
        input.checked = Boolean(fieldValue);
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-element-id', elementId);
        break;

      case 'select':
        input = document.createElement('select');
        input.id = inputId;
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-element-id', elementId);
        
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
        input.setAttribute('data-element-id', elementId);
        fieldDiv.classList.add('full-width');
        break;

      case 'media': {
        // Créer un conteneur pour le media picker
        input = document.createElement('input');
        input.type = 'text';
        input.id = inputId;
        input.value = fieldValue || '';
        input.setAttribute('data-field-key', dataFieldKey);
        input.setAttribute('data-element-id', elementId);
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
        pickBtn.setAttribute('data-element-id', elementId);
        pickBtn.addEventListener('click', () => {
          if (window.openMediaPicker) {
            window.openMediaPicker((url) => {
              input.value = url;
              this.autoSaveElementField(input);
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
          this.autoSaveElementField(input);
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
        input.setAttribute('data-element-id', elementId);
    }

    if (input) {
      fieldDiv.appendChild(input);
    }

    return fieldDiv;
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
}

// Exposer globalement
// eslint-disable-next-line no-unused-vars
window.ElementFormManager = ElementFormManager;
