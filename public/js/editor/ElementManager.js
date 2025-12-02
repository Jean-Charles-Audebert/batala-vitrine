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
    console.log('📤 Données élément collectées:', formData);

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
      console.log(`🔄 Mise à jour élément ${this.currentElementId}`);
    } else {
      // Mode création - ajouter le type
      const elementType = document.getElementById('element-type')?.value || 'text';
      elementData.type = elementType;
      console.log('➕ Création nouvel élément');
    }

    console.log(`📡 ${method} ${url}`, elementData);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elementData)
      });

      const result = await response.json();
      console.log('📥 Réponse serveur:', result);

      if (result.success) {
        console.log('✅ Élément sauvegardé');
        this.hideElementModal();
        // Recharger la page pour afficher les modifications
        window.location.reload();
      } else {
        console.error('❌ Erreur:', result.error);
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
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
        console.log('✅ Élément supprimé');
        window.location.reload();
      } else {
        console.error('❌ Erreur:', result.error);
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      alert('Erreur de connexion au serveur');
    }
  }
}

// Export global
window.ElementManager = ElementManager;
