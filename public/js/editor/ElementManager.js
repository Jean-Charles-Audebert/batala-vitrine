/**
 * Gestionnaire d'éléments dans les sections
 * Gère l'ajout, l'édition, la suppression et le positionnement des éléments
 */

class ElementManager {
  constructor() {
    this.currentSectionId = null;
    this.currentElementId = null;
    this.elementSchemas = window.elementSchemas || {};
    this.init();
  }

  init() {
    // Boutons d'action
    const addElementBtn = document.getElementById('add-element-btn');
    const saveElementBtn = document.getElementById('element-save-btn');
    const cancelElementBtn = document.getElementById('element-cancel-btn');

    if (addElementBtn) {
      addElementBtn.addEventListener('click', () => this.showAddElementModal());
    }

    if (saveElementBtn) {
      saveElementBtn.addEventListener('click', () => this.saveElement());
    }

    if (cancelElementBtn) {
      cancelElementBtn.addEventListener('click', () => this.hideElementModal());
    }

    // Changement de type d'élément
    const elementTypeSelect = document.getElementById('element-type');
    if (elementTypeSelect) {
      elementTypeSelect.addEventListener('change', (e) => {
        this.generateElementForm(e.target.value);
      });
    }
  }

  showAddElementModal(sectionId) {
    this.currentSectionId = sectionId || this.currentSectionId;
    this.currentElementId = null;

    const modal = document.getElementById('element-modal');
    const title = document.getElementById('element-modal-title');
    const typeSelector = document.getElementById('element-type-selector');

    if (title) title.textContent = 'Ajouter un élément';
    if (typeSelector) typeSelector.style.display = 'block';

    // Réinitialiser le formulaire
    const elementType = document.getElementById('element-type');
    if (elementType) {
      elementType.value = 'text';
      this.generateElementForm('text');
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('show');
    }
  }

  showEditElementModal(elementId, sectionId) {
    this.currentSectionId = sectionId;
    this.currentElementId = elementId;

    const modal = document.getElementById('element-modal');
    const title = document.getElementById('element-modal-title');
    const typeSelector = document.getElementById('element-type-selector');

    if (title) title.textContent = 'Modifier l\'élément';
    if (typeSelector) typeSelector.style.display = 'none'; // Pas de changement de type en édition

    // Charger les données de l'élément
    this.loadElementData(elementId);

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('show');
    }
  }

  hideElementModal() {
    const modal = document.getElementById('element-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.classList.add('hidden');
    }
  }

  async loadElementData(elementId) {
    try {
      const response = await fetch(`/api/elements/${elementId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const element = result.data;
        this.generateElementForm(element.type, element.settings || {});
      }
    } catch (error) {
      console.error('Erreur chargement élément:', error);
    }
  }

  generateElementForm(elementType, elementData = {}) {
    const schemaKey = `element_${elementType}`;
    const schema = this.elementSchemas[schemaKey];

    if (!schema) {
      console.error('Schéma non trouvé pour:', schemaKey);
      return;
    }

    const dynamicForm = document.getElementById('element-dynamic-form');
    if (!dynamicForm) return;

    dynamicForm.innerHTML = '';

    // Générer les groupes de champs
    Object.keys(schema.fields).forEach(groupKey => {
      const group = schema.fields[groupKey];
      if (group.type === 'group' && window.formGenerator) {
        const groupElement = window.formGenerator.createFormGroup(
          groupKey,
          group,
          elementData
        );
        dynamicForm.appendChild(groupElement);
      }
    });

    // Attacher la logique conditionnelle
    if (window.formGenerator) {
      window.formGenerator.attachConditionalLogic();
    }
  }

  async saveElement() {
    if (!window.formGenerator) {
      console.error('FormGenerator non disponible');
      return;
    }

    const formData = window.formGenerator.collectFormData();

    const elementData = {
      section_id: this.currentSectionId,
      settings: formData
    };

    let url = '/api/elements';
    let method = 'POST';

    if (this.currentElementId) {
      // Mode édition
      url += `/${this.currentElementId}`;
      method = 'PUT';
    } else {
      // Mode création - ajouter le type
      const elementType = document.getElementById('element-type')?.value || 'text';
      elementData.type = elementType;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elementData)
      });

      const result = await response.json();

      if (result.success) {
        this.hideElementModal();
        // Recharger la page pour afficher les modifications
        window.location.reload();
      } else {
        console.error('Erreur sauvegarde:', result.error);
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur réseau sauvegarde:', error);
      alert('Erreur de connexion au serveur');
    }
  }

  async deleteElement(elementId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/elements/${elementId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Retirer de la sidebar
        if (window.sidebarManager) {
          window.sidebarManager.removeElement(elementId);
        }
        // Recharger la page après 300ms pour afficher les modifications
        window.setTimeout(() => window.location.reload(), 300);
      } else {
        console.error('Erreur suppression:', result.error);
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur réseau suppression:', error);
      alert('Erreur de connexion au serveur');
    }
  }

  /**
   * Charge et affiche le formulaire d'édition d'un élément dans la sidebar
   * @param {number} elementId - ID de l'élément
   * @param {number} sectionId - ID de la section
   * @param {HTMLElement} containerElement - Élément HTML où injecter le formulaire
   */
  async loadElementForm(elementId, sectionId, containerElement) {
    try {
      const response = await fetch(`/api/elements/${elementId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const element = result.data;
        this.currentElementId = elementId;
        this.currentSectionId = sectionId;

        // Générer le formulaire pour cet élément
        const form = this.generateElementFormHTML(element.type, element.settings || {}, elementId);
        
        // Injecter dans le conteneur
        if (containerElement) {
          containerElement.innerHTML = form;
          this.attachElementFormListeners(elementId, sectionId);
        }
      } else {
        console.error('Élément non trouvé');
        if (containerElement) {
          containerElement.innerHTML = '<p style="color: #e74c3c;">Erreur au chargement de l\'élément</p>';
        }
      }
    } catch (error) {
      console.error('Erreur chargement élément:', error);
      if (containerElement) {
        containerElement.innerHTML = '<p style="color: #e74c3c;">Erreur de connexion</p>';
      }
    }
  }

  /**
   * Génère le HTML du formulaire d'édition (pour sidebar)
   */
  generateElementFormHTML(elementType, elementData = {}, elementId) {
    const schemaKey = `element_${elementType}`;
    const schema = this.elementSchemas[schemaKey];

    if (!schema) {
      console.error('Schéma non trouvé:', schemaKey);
      return '<p style="color: #e74c3c;">Schéma non disponible</p>';
    }

    let html = '<div class="element-form">';

    // Générer les groupes de champs
    Object.keys(schema.fields).forEach(groupKey => {
      const group = schema.fields[groupKey];
      if (group.type === 'group') {
        html += this.createFormGroupHTML(groupKey, group, elementData);
      }
    });

    // Boutons d'action
    html += `
      <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #e9ecef;">
        <button class="btn btn-sm btn-primary save-element-btn" data-element-id="${elementId}" style="flex: 1; padding: 0.4rem !important;">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
        <button class="btn btn-sm btn-danger delete-element-btn" data-element-id="${elementId}" style="padding: 0.4rem !important;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    html += '</div>';
    return html;
  }

  /**
   * Génère le HTML d'un groupe de formulaire
   */
  createFormGroupHTML(groupKey, group, elementData = {}) {
    let html = `<div class="form-group-section" style="margin-bottom: 0.75rem;">`;

    if (group.label) {
      html += `<h5 style="margin: 0.5rem 0; font-size: 0.85rem; font-weight: 600; color: #333;">${group.label}</h5>`;
    }

    // Générer les champs
    if (group.fields) {
      Object.keys(group.fields).forEach(fieldKey => {
        const field = group.fields[fieldKey];
        const value = elementData[fieldKey] || field.default || '';
        html += this.createFieldHTML(fieldKey, field, value);
      });
    }

    html += '</div>';
    return html;
  }

  /**
   * Génère le HTML d'un champ
   */
  createFieldHTML(fieldKey, field, value = '') {
    const id = `element-field-${fieldKey}`;
    let html = `<div class="form-field" style="margin-bottom: 0.5rem;">`;

    if (field.label) {
      html += `<label for="${id}" style="display: block; font-size: 0.8rem; color: #666; margin-bottom: 0.25rem;">${field.label}</label>`;
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        html += `<input type="${field.type}" id="${id}" data-field-key="${fieldKey}" value="${value}" placeholder="${field.placeholder || ''}" style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 3px; font-size: 0.85rem;">`;
        break;

      case 'number':
        html += `<input type="number" id="${id}" data-field-key="${fieldKey}" value="${value}" min="${field.min || ''}" max="${field.max || ''}" step="${field.step || '1'}" style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 3px; font-size: 0.85rem;">`;
        break;

      case 'textarea':
        html += `<textarea id="${id}" data-field-key="${fieldKey}" rows="3" placeholder="${field.placeholder || ''}" style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 3px; font-size: 0.85rem; font-family: inherit;">${value}</textarea>`;
        break;

      case 'color':
        html += `<input type="color" id="${id}" data-field-key="${fieldKey}" value="${value || '#000000'}" style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">`;
        break;

      case 'checkbox':
        html += `<label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem;"><input type="checkbox" id="${id}" data-field-key="${fieldKey}" ${value ? 'checked' : ''}> ${field.label || ''}</label>`;
        break;

      case 'select':
        html += `<select id="${id}" data-field-key="${fieldKey}" style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 3px; font-size: 0.85rem;">`;
        if (field.options) {
          field.options.forEach(opt => {
            html += `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`;
          });
        }
        html += '</select>';
        break;

      default:
        html += `<input type="text" id="${id}" data-field-key="${fieldKey}" value="${value}" style="width: 100%; padding: 0.4rem; border: 1px solid #ddd; border-radius: 3px; font-size: 0.85rem;">`;
    }

    if (field.help) {
      html += `<small style="display: block; color: #999; margin-top: 0.25rem; font-size: 0.75rem;">${field.help}</small>`;
    }

    html += '</div>';
    return html;
  }

  /**
   * Attache les écouteurs d'événements au formulaire d'édition
   */
  attachElementFormListeners(elementId, sectionId) {
    // Bouton sauvegarder
    document.querySelectorAll(`.save-element-btn[data-element-id="${elementId}"]`).forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.saveElementFromSidebar(elementId, sectionId);
      });
    });

    // Bouton supprimer
    document.querySelectorAll(`.delete-element-btn[data-element-id="${elementId}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteElement(elementId);
      });
    });
  }

  /**
   * Sauvegarde l'élément depuis le formulaire sidebar
   */
  async saveElementFromSidebar(elementId) {
    const formContainer = document.querySelector(`.element-item[data-element-id="${elementId}"] .element-content`);
    if (!formContainer) {
      console.error('Formulaire non trouvé');
      return;
    }

    // Collecter les données du formulaire
    const settings = {};
    formContainer.querySelectorAll('[data-field-key]').forEach(field => {
      const key = field.dataset.fieldKey;
      let value = field.value;

      // Traiter les checkboxes
      if (field.type === 'checkbox') {
        value = field.checked;
      }

      // Traiter les nombres
      if (field.type === 'number') {
        value = parseFloat(value);
      }

      settings[key] = value;
    });

    try {
      const response = await fetch(`/api/elements/${elementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: settings
        })
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour le preview du titre
        const titleField = formContainer.querySelector('[data-field-key="content"], [data-field-key="title"]');
        if (titleField && window.sidebarManager) {
          const previewText = titleField.value || Object.values(settings).join(' ').substring(0, 30);
          window.sidebarManager.updateElementPreview(elementId, previewText);
        }

        // Afficher une notification
        this.showSidebarNotification('Élément mis à jour ✓', 'success');
        
        // Recharger la page après 1s pour mettre à jour l'aperçu
        window.setTimeout(() => window.location.reload(), 1000);
      } else {
        console.error('Erreur sauvegarde élément:', result.error);
        this.showSidebarNotification('Erreur: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Erreur réseau sauvegarde élément:', error);
      this.showSidebarNotification('Erreur de connexion', 'error');
    }
  }

  /**
   * Affiche une notification dans la sidebar
   */
  showSidebarNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      border-radius: 4px;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10001;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    window.setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      window.setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Export global
window.ElementManager = ElementManager;