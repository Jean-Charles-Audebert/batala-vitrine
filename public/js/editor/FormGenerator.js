/**
 * Gestionnaire de formulaires dynamiques
 * Génère et gère les formulaires basés sur les schémas JSON
 */

class FormGenerator {
  constructor() {
    this.sectionSchemas = window.sectionSchemas || {};
    this.fontsData = window.fontsData || [];
    this.mediaSelectors = new Map(); // Track MediaSelector instances
  }

  // Résoudre l'héritage de schémas (_common extends)
  resolveSchema(schemaType) {
    const schema = this.sectionSchemas[schemaType];
    if (!schema) return null;

    // Si le schéma hérite de _common
    if (schema.extends === '_common') {
      const baseSchema = this.sectionSchemas._common;
      if (!baseSchema) return schema;

      // Fusionner les fields de _common avec les fields spécifiques
      return {
        ...schema,
        fields: {
          ...baseSchema.fields,
          ...schema.fields
        }
      };
    }

    return schema;
  }

  generateSectionForm(sectionType, sectionData = {}) {
    const schema = this.resolveSchema(sectionType);
    if (!schema) {
      console.error('Schéma non trouvé pour le type:', sectionType);
      return;
    }

    // Clear previous MediaSelector instances
    this.mediaSelectors.clear();

    const dynamicForm = document.getElementById('section-dynamic-form');
    dynamicForm.innerHTML = '';

    // Générer les groupes de champs
    Object.keys(schema.fields).forEach(groupKey => {
      const group = schema.fields[groupKey];
      if (group.type === 'group') {
        // Passer toutes les sectionData, pas juste sectionData[groupKey]
        const groupElement = this.createFormGroup(groupKey, group, sectionData);
        dynamicForm.appendChild(groupElement);
      } else if (group.type === 'array') {
        const arrayElement = this.createFormArray(groupKey, group, sectionData[groupKey] || []);
        dynamicForm.appendChild(arrayElement);
      }
    });

    // Attacher la logique conditionnelle après génération du formulaire
    this.attachConditionalLogic();
  }

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

  createFormField(fieldKey, fieldSchema, fieldValue) {
    const fieldDiv = document.createElement('div');
    
    // Déterminer les classes CSS
    let classNames = 'form-group';
    
    // Champs qui doivent prendre toute la largeur
    if (fieldSchema.type === 'textarea' || fieldSchema.type === 'array') {
      classNames += ' full-width';
    } 
    // Champs courts qui peuvent être compactés
    else if (fieldSchema.type === 'color' || fieldSchema.type === 'checkbox' || 
             fieldSchema.type === 'number' || fieldSchema.type === 'select') {
      classNames += ' compact';
    }
    
    fieldDiv.className = classNames;

    // Gestion showIf : rendre invisible si condition non remplie
    if (fieldSchema.showIf) {
      fieldDiv.dataset.showIfField = fieldSchema.showIf.field;
      fieldDiv.dataset.showIfValue = fieldSchema.showIf.value;
      fieldDiv.style.display = 'none'; // Masqué par défaut
    }

    // Label
    if (fieldSchema.label) {
      const label = document.createElement('label');
      label.setAttribute('for', `field-${fieldKey}`);
      label.textContent = fieldSchema.label;
      if (fieldSchema.required) label.textContent += ' *';
      fieldDiv.appendChild(label);
    }

    // Normaliser les types : checkbox → boolean, font-select → font
    const normalizedType = fieldSchema.type === 'checkbox' ? 'boolean' 
                          : fieldSchema.type === 'font-select' ? 'font'
                          : fieldSchema.type;

    // Champ selon le type
    let input;
    switch (normalizedType) {
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
        if (this.fontsData) {
          this.fontsData.forEach(font => {
            const option = document.createElement('option');
            option.value = font.id;
            option.textContent = `${font.name} (${font.source})`;
            if (fieldValue == font.id) option.selected = true;
            input.appendChild(option);
          });
        }
        break;

      case 'media':
        input = this.createMediaField(fieldKey, fieldSchema, fieldValue);
        fieldDiv.appendChild(input);
        return fieldDiv;

      case 'media-selector':
        input = this.createMediaSelectorField(fieldKey, fieldSchema, fieldValue);
        fieldDiv.appendChild(input);
        return fieldDiv;

      case 'range':
        input = this.createRangeField(fieldKey, fieldSchema, fieldValue);
        fieldDiv.appendChild(input);
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

  createMediaField(fieldKey, fieldSchema, fieldValue) {
    const mediaField = document.createElement('div');
    mediaField.className = 'media-upload-field';

    const input = document.createElement('input');
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
    selectBtn.onclick = () => {
      if (window.openMediaPicker) {
        window.openMediaPicker((url) => {
          input.value = url;
        }, fieldSchema.accept || 'image/*', fieldKey);
      }
    };

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

    return mediaField;
  }

  createMediaSelectorField(fieldKey, fieldSchema, fieldValue) {
    const container = document.createElement('div');
    container.id = `media-selector-${fieldKey}`;
    container.className = 'media-selector-container';

    // Radio buttons pour le type
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-group';

    const types = [
      { value: 'none', label: 'Aucun' },
      { value: 'media', label: 'Image/Vidéo' },
      { value: 'youtube', label: 'YouTube' }
    ];

    types.forEach(type => {
      const radioLabel = document.createElement('label');
      radioLabel.className = 'radio-label';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `${fieldKey}_type`;
      radio.value = type.value;
      radio.dataset.fieldKey = fieldKey;

      radioLabel.appendChild(radio);
      radioLabel.appendChild(document.createTextNode(' ' + type.label));
      radioGroup.appendChild(radioLabel);
    });

    container.appendChild(radioGroup);

    // Champs pour media et youtube (masqués par défaut)
    const mediaInput = document.createElement('input');
    mediaInput.type = 'text';
    mediaInput.id = `${fieldKey}_media`;
    mediaInput.name = `${fieldKey}_media`;
    mediaInput.placeholder = 'URL de l\'image ou vidéo';
    mediaInput.style.display = 'none';
    mediaInput.className = 'media-input';

    const youtubeInput = document.createElement('input');
    youtubeInput.type = 'text';
    youtubeInput.id = `${fieldKey}_youtube`;
    youtubeInput.name = `${fieldKey}_youtube`;
    youtubeInput.placeholder = 'URL YouTube';
    youtubeInput.style.display = 'none';
    youtubeInput.className = 'youtube-input';

    container.appendChild(mediaInput);
    container.appendChild(youtubeInput);

    // Initialiser MediaSelector avec ce conteneur
    const selector = new MediaSelector(
      `media-selector-${fieldKey}`,
      `${fieldKey}_media`,
      `${fieldKey}_youtube`,
      `${fieldKey}_type`,
      () => {} // onChange vide pour l'instant
    );

    selector.init();

    // Set initial values si présentes
    if (fieldValue) {
      if (fieldValue.type) {
        selector.setValues(fieldValue);
      }
    }

    this.mediaSelectors.set(fieldKey, selector);

    return container;
  }

  createRangeField(fieldKey, fieldSchema, fieldValue) {
    const rangeContainer = document.createElement('div');
    rangeContainer.className = 'range-field';

    const input = document.createElement('input');
    input.type = 'range';
    input.id = `field-${fieldKey}`;
    input.name = fieldKey;
    input.min = fieldSchema.min !== undefined ? fieldSchema.min : 0;
    input.max = fieldSchema.max !== undefined ? fieldSchema.max : 1;
    input.step = fieldSchema.step !== undefined ? fieldSchema.step : 0.1;
    input.value = fieldValue !== undefined ? fieldValue : (fieldSchema.default || 0.5);

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'range-value';
    valueDisplay.textContent = input.value;

    input.addEventListener('input', () => {
      valueDisplay.textContent = input.value;
    });

    rangeContainer.appendChild(input);
    rangeContainer.appendChild(valueDisplay);

    return rangeContainer;
  }

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

  addArrayItem(arrayKey, arraySchema) {
    const container = document.getElementById(`array-${arrayKey}`);
    const currentItems = container.children.length;
    const itemElement = this.createArrayItem(arrayKey, arraySchema, {}, currentItems);
    container.appendChild(itemElement);
  }

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

  // Logique conditionnelle pour showIf
  attachConditionalLogic() {
    const fieldsWithConditions = document.querySelectorAll('[data-show-if-field]');

    fieldsWithConditions.forEach(conditionalField => {
      const dependencyFieldName = conditionalField.dataset.showIfField;
      const dependencyValue = conditionalField.dataset.showIfValue;

      // Trouver le champ dont dépend l'affichage
      const dependencyField = document.querySelector(`[name="${dependencyFieldName}"]`);
      
      if (dependencyField) {
        const checkVisibility = () => {
          let currentValue;
          if (dependencyField.type === 'checkbox') {
            currentValue = dependencyField.checked ? 'true' : 'false';
          } else if (dependencyField.type === 'radio') {
            const checked = document.querySelector(`[name="${dependencyFieldName}"]:checked`);
            currentValue = checked ? checked.value : '';
          } else {
            currentValue = dependencyField.value;
          }

          conditionalField.style.display = currentValue === dependencyValue ? '' : 'none';
        };

        // Vérifier au chargement
        checkVisibility();

        // Vérifier à chaque changement
        if (dependencyField.type === 'radio') {
          document.querySelectorAll(`[name="${dependencyFieldName}"]`).forEach(radio => {
            radio.addEventListener('change', checkVisibility);
          });
        } else {
          dependencyField.addEventListener('change', checkVisibility);
          dependencyField.addEventListener('input', checkVisibility);
        }
      }
    });
  }

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
          } else if (field.type === 'range') {
            value = parseFloat(value);
          }

          formData[field.name] = value;
        }
      }
    });

    // Récupérer les valeurs des MediaSelectors
    this.mediaSelectors.forEach((selector, fieldKey) => {
      const values = selector.getValues();
      // Stocker le type et la valeur appropriée
      formData[fieldKey] = values.type;
      if (values.type === 'media') {
        formData[`${fieldKey}_media`] = values.image;
      } else if (values.type === 'youtube') {
        formData[`${fieldKey}_youtube`] = values.youtube;
      }
    });

    return formData;
  }
}

// Exporter pour utilisation globale
window.FormGenerator = FormGenerator;