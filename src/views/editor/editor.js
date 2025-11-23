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
      const response = await fetch('/api/site-config');
      if (!response.ok) throw new Error('Erreur chargement config');
      this.siteConfig = await response.json();
    } catch (error) {
      console.error('Erreur chargement config:', error);
      // Config par défaut
      this.siteConfig = { sections: [] };
    }
  }

  initEvents() {
    // Boutons d'édition des sections
    document.addEventListener('click', (e) => {
      if (e.target.closest('.edit-section-btn')) {
        e.preventDefault();
        const sectionId = e.target.closest('.edit-section-btn').dataset.sectionId;
        this.editSection(sectionId);
      }
    });

    // Boutons de la sidebar
    document.addEventListener('click', (e) => {
      if (e.target.closest('.sidebar-close')) {
        this.closeSidebar();
      }

      if (e.target.closest('.sidebar-save')) {
        this.saveChanges();
      }

      if (e.target.closest('.sidebar-cancel')) {
        this.cancelChanges();
      }

      if (e.target.closest('.add-section-btn')) {
        this.showAddSection();
      }

      if (e.target.closest('.delete-section-btn')) {
        this.deleteSection();
      }
    });

    // Changements dans les formulaires
    document.addEventListener('input', (e) => {
      if (e.target.closest('.sidebar-content')) {
        this.markDirty();
      }
    });

    // Gestion des médias
    document.addEventListener('click', (e) => {
      if (e.target.closest('.media-picker-btn')) {
        this.openMediaPicker(e.target.closest('.media-picker-btn'));
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

    // Empêcher la fermeture accidentelle
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?';
      }
    });
  }

  initSidebarTabs() {
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  }

  switchTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.sidebar-tab-content').forEach(content => {
      content.style.display = 'none';
    });

    // Désactiver tous les onglets
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Activer l'onglet sélectionné
    document.querySelector(`.sidebar-tab[data-tab="${tabName}"]`).classList.add('active');
    document.querySelector(`.sidebar-tab-content[data-tab="${tabName}"]`).style.display = 'block';
  }

  editSection(sectionId) {
    const section = this.siteConfig.sections.find(s => s.id === sectionId);
    if (!section) return;

    this.currentSection = section;
    this.populateForm(section);
    this.openSidebar();
    this.switchTab('content');
  }

  populateForm(section) {
    const schema = this.schemas[section.type];
    if (!schema) return;

    const form = document.querySelector('.section-form');
    form.innerHTML = '';

    // Générer le formulaire à partir du schéma
    this.generateFormFields(form, schema.fields, section.data);

    // Mettre à jour le titre de la sidebar
    document.querySelector('.sidebar-title').textContent = `Modifier ${schema.title || section.type}`;
  }

  generateFormFields(container, fields, data = {}) {
    fields.forEach(field => {
      const fieldElement = this.createFieldElement(field, data[field.name]);
      container.appendChild(fieldElement);
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
    document.querySelector('.sidebar').classList.add('open');
  }

  closeSidebar() {
    if (this.isDirty && !confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?')) {
      return;
    }

    document.querySelector('.sidebar').classList.remove('open');
    this.currentSection = null;
    this.isDirty = false;
  }

  markDirty() {
    this.isDirty = true;
    document.querySelector('.sidebar-save').classList.add('btn-primary');
  }

  async saveChanges() {
    if (!this.currentSection) return;

    try {
      const formData = new FormData(document.querySelector('.section-form'));
      const data = {};

      // Parser les données du formulaire
      for (let [key, value] of formData.entries()) {
        this.setNestedProperty(data, key, value);
      }

      // Mettre à jour la section
      this.currentSection.data = { ...this.currentSection.data, ...data };

      // Sauvegarder la configuration
      const response = await fetch('/api/site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.siteConfig)
      });

      if (!response.ok) throw new Error('Erreur sauvegarde');

      this.isDirty = false;
      this.closeSidebar();

      // Recharger la page pour voir les changements
      window.location.reload();

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
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

  deleteSection() {
    if (!this.currentSection) return;

    if (!confirm('Supprimer cette section ?')) return;

    // Supprimer la section
    this.siteConfig.sections = this.siteConfig.sections.filter(s => s.id !== this.currentSection.id);

    // Sauvegarder
    this.saveChanges();
  }

  addCard() {
    // TODO: Implémenter l'ajout de carte
    console.log('Ajouter une carte');
  }

  removeCard(index) {
    // TODO: Implémenter la suppression de carte
    console.log('Supprimer la carte', index);
  }

  openMediaPicker(button) {
    // TODO: Implémenter le sélecteur de médias
    console.log('Ouvrir le sélecteur de médias pour', button.dataset.field);
  }

  setNestedProperty(obj, path, value) {
    const keys = path.replace(/\]/g, '').split(/\[|\./);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = isNaN(keys[i + 1]) ? {} : [];
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }
}

// Initialiser l'éditeur quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new SiteEditor();
});