/**
 * Gestionnaire de sections pour l'éditeur
 * Gère la création, modification et suppression des sections
 */

class SectionManager {
  constructor(previewManager, editorApp = null) {
    this.previewManager = previewManager;
    this.editorApp = editorApp;
    this.currentSectionId = null;
    this.pageData = window.pageData || {};
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Gestionnaire pour le sélecteur de type de section
    document.getElementById('section-type')?.addEventListener('change', (e) => {
      const sectionType = e.target.value;
      if (sectionType && window.formGenerator) {
        window.formGenerator.generateSectionForm(sectionType);
      }
    });

    // Gestionnaire pour le bouton de sauvegarde de section
    document.getElementById('section-save-btn')?.addEventListener('click', () => {
      this.saveSection();
    });

    // Gestionnaire pour le bouton annuler de section
    document.getElementById('section-cancel-btn')?.addEventListener('click', () => {
      this.closeSectionModal();
    });

    // Gestionnaire pour les boutons d'action des sections
    document.getElementById('sections-list')?.addEventListener('click', (e) => {
      const target = e.target.closest('.action-btn');
      if (!target) return;

      const sectionItem = target.closest('.section-item');
      const sectionId = sectionItem.dataset.sectionId;

      if (target.classList.contains('edit-btn')) {
        this.editSection(sectionId);
      } else if (target.classList.contains('add-element-btn')) {
        if (window.elementManager) {
          window.elementManager.showAddElementModal(sectionId);
        }
      } else if (target.classList.contains('visibility-btn')) {
        this.toggleSectionVisibility(sectionId);
      } else if (target.classList.contains('delete-btn')) {
        this.deleteSection(sectionId);
      }
    });
  }

  showSectionModal(sectionId = null, sectionType = null) {
    const modal = document.getElementById('section-modal');
    const title = document.getElementById('section-modal-title');
    const typeSelector = document.getElementById('section-type-selector');
    const dynamicForm = document.getElementById('section-dynamic-form');

    // Stocker l'ID de la section en cours d'édition
    this.currentSectionId = sectionId;

    if (sectionId) {
      title.textContent = 'Modifier la section';
      typeSelector.style.display = 'none';
      // Charger les données de la section
      this.loadSectionData(sectionId);
    } else {
      title.textContent = 'Ajouter une section';
      typeSelector.style.display = 'block';
      dynamicForm.innerHTML = '';

      // Si un type est pré-sélectionné, générer le formulaire
      if (sectionType) {
        document.getElementById('section-type').value = sectionType;
        if (window.formGenerator) {
          window.formGenerator.generateSectionForm(sectionType);
        }
      }
    }

    // Afficher la modale
    modal.classList.remove('hidden');
    modal.classList.add('show');
  }

  closeSectionModal() {
    const modal = document.getElementById('section-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.classList.add('hidden');
    }
  }

  loadSectionData(sectionId) {
    // Trouver la section dans les données de la page
    const section = this.pageData.sections?.find(s => s.id == sectionId);
    if (!section) {
      console.error('Section non trouvée:', sectionId);
      return;
    }

    // Générer le formulaire avec les données de la section
    if (window.formGenerator) {
      window.formGenerator.generateSectionForm(section.type, section.settings || {});
    }
  }

  async saveSection() {
    if (!window.formGenerator) {
      console.error('FormGenerator non disponible');
      return;
    }

    const formData = window.formGenerator.collectFormData();
    
    const sectionData = {
      settings: formData,
      is_visible: true,
      page_id: window.pageData?.page?.id || 1  // ID de la page actuelle
    };

    let url = '/api/sections';
    let method = 'POST';

    if (this.currentSectionId) {
      url += `/${this.currentSectionId}`;
      method = 'PUT';
      sectionData.id = this.currentSectionId;
    } else {
      // Type uniquement pour la création
      const sectionType = document.getElementById('section-type').value;
      sectionData.type = sectionType;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const data = await response.json();
      console.log('Section sauvegardée:', data);
      alert('Section sauvegardée avec succès!');
      this.closeSectionModal();
      
      // Rafraîchir l'aperçu au lieu de recharger la page entière
      if (this.previewManager) {
        this.previewManager.refresh();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  editSection(sectionId) {
    this.showSectionModal(sectionId);
  }

  async toggleSectionVisibility(sectionId) {
    const section = this.pageData.sections?.find(s => s.id == sectionId);
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

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de la visibilité');
      }

      section.is_visible = newVisibility;
      // Mettre à jour l'interface
      const visibilityIcon = document.querySelector(`[data-section-id="${sectionId}"] .visibility-btn i`);
      const visibilityText = document.querySelector(`[data-section-id="${sectionId}"] .visibility-status`);

      if (newVisibility) {
        visibilityIcon.className = 'fas fa-eye';
        visibilityText.textContent = 'Visible';
      } else {
        visibilityIcon.className = 'fas fa-eye-slash';
        visibilityText.textContent = 'Masqué';
      }

      // Rafraîchir l'aperçu
      if (this.previewManager) {
        this.previewManager.refresh();
      }
    } catch (error) {
      console.error('Erreur toggle visibility:', error);
      alert('Erreur lors de la modification de la visibilité');
    }
  }

  async deleteSection(sectionId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Supprimer de l'interface
      const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
      if (sectionElement) {
        sectionElement.remove();
      }
      
      // Rafraîchir l'aperçu
      if (this.previewManager) {
        this.previewManager.refresh();
      }
    } catch (error) {
      console.error('Erreur delete section:', error);
      alert('Erreur lors de la suppression');
    }
  }

  // Méthode pour faire des appels API via EditorApp
  async apiCall(endpoint, method = 'GET', data = null, isFormData = false) {
    if (this.editorApp && this.editorApp.apiCall) {
      return this.editorApp.apiCall(endpoint, method, data, isFormData);
    } else {
      throw new Error('EditorApp non disponible pour les appels API');
    }
  }
}

// Exporter pour utilisation globale
window.SectionManager = SectionManager;