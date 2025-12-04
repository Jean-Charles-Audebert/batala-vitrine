/**
 * Gestionnaire de la sidebar unifiée
 * Gère le collapse/expand des blocs, sections et éléments avec une logique unifiée
 */

// eslint-disable-next-line no-unused-vars
class SidebarManager {
  constructor() {
    this.collapsedBlocks = new Set();     // Blocs repliés (Paramètres, Sections)
    this.collapsedSections = new Set();   // Sections repliées
    this.collapsedElements = new Set();   // Éléments repliés
    this.init();
  }

  init() {
    this.bindAllToggles();
    this.loadCollapsedState();
  }

  /**
   * Gère TOUS les toggles : blocs, sections, éléments avec délégation unique
   */
  bindAllToggles() {
    document.addEventListener('click', (e) => {
      // Déterminer le type de toggle et le conteneur correspondant
      let toggleType = null;
      let container = null;
      let contentEl = null;
      let toggleBtn = null;
      let id = null;

      // 1. Vérifier si c'est un toggle de bloc (Paramètres, Sections)
      toggleBtn = e.target.closest('.block-toggle');
      if (toggleBtn) {
        const header = toggleBtn.closest('.block-header');
        if (header) {
          id = header.getAttribute('data-toggle');
          container = document.getElementById(id);
          if (container) {
            contentEl = container.querySelector('.block-content');
            toggleType = 'block';
          }
        }
      }

      // 2. Vérifier si c'est un toggle de section
      if (!toggleType) {
        toggleBtn = e.target.closest('.section-toggle');
        if (toggleBtn) {
          const header = toggleBtn.closest('.section-header');
          if (header) {
            id = header.getAttribute('data-toggle-section');
            const sectionItem = header.closest('.section-item');
            if (sectionItem) {
              contentEl = sectionItem.querySelector('.section-content');
              toggleType = 'section';
            }
          }
        }
      }

      // 3. Vérifier si c'est un toggle d'élément
      if (!toggleType) {
        toggleBtn = e.target.closest('.element-toggle');
        if (toggleBtn) {
          const header = toggleBtn.closest('.element-header[data-toggle-element]');
          if (header) {
            id = header.dataset.toggleElement;
            const elementItem = header.closest('.element-item');
            if (elementItem) {
              contentEl = elementItem.querySelector('.element-content');
              toggleType = 'element';
            }
          }
        }
      }

      // Si on a trouvé un toggle, le traiter
      if (toggleType && contentEl && toggleBtn) {
        const isCollapsed = contentEl.classList.contains('collapsed');
        if (isCollapsed) {
          this.expand(toggleType, id, contentEl, toggleBtn);
        } else {
          this.collapse(toggleType, id, contentEl, toggleBtn);
        }
      }
    });
  }

  /**
   * Méthode unifiée pour replier (collapse)
   * @param {string} type - 'block', 'section', ou 'element'
   * @param {string|number} id - L'ID du composant
   * @param {HTMLElement} content - L'élément de contenu
   * @param {HTMLElement} toggleBtn - Le bouton de toggle
   */
  collapse(type, id, content, toggleBtn) {
    // Ajouter la classe collapsed
    content.classList.add('collapsed');

    // Tourner l'icône
    const iconEl = toggleBtn.querySelector('i');
    if (iconEl) iconEl.classList.add('rotated');

    // Mettre à jour aria-expanded
    toggleBtn.setAttribute('aria-expanded', 'false');

    // Tracker l'état si nécessaire
    if (type === 'block') {
      this.collapsedBlocks.add(id);
    } else if (type === 'section') {
      this.collapsedSections.add(id);
    } else if (type === 'element') {
      this.collapsedElements.add(id);
    }

    // Sauvegarder
    this.saveCollapsedState();
  }

  /**
   * Méthode unifiée pour déplier (expand)
   * @param {string} type - 'block', 'section', ou 'element'
   * @param {string|number} id - L'ID du composant
   * @param {HTMLElement} content - L'élément de contenu
   * @param {HTMLElement} toggleBtn - Le bouton de toggle
   */
  expand(type, id, content, toggleBtn) {
    // Enlever la classe collapsed
    content.classList.remove('collapsed');

    // Detourner l'icône
    const iconEl = toggleBtn.querySelector('i');
    if (iconEl) iconEl.classList.remove('rotated');

    // Mettre à jour aria-expanded
    toggleBtn.setAttribute('aria-expanded', 'true');

    // Tracker l'état si nécessaire
    if (type === 'block') {
      this.collapsedBlocks.delete(id);
    } else if (type === 'section') {
      this.collapsedSections.delete(id);
      // Charger le formulaire de section si nécessaire
      // (sera fait par SectionFormManager)
    } else if (type === 'element') {
      this.collapsedElements.delete(id);
      // Charger le formulaire d'élément si nécessaire
      if (content.innerHTML.trim() === '' && window.elementManager) {
        const elementItem = content.closest('.element-item');
        if (elementItem) {
          const sectionId = elementItem.closest('.elements-list')?.dataset.sectionId;
          if (sectionId) {
            window.elementManager.loadElementForm(id, sectionId, content);
          }
        }
      }
    }

    // Sauvegarder
    this.saveCollapsedState();
  }

  /**
   * Sauvegarde l'état de collapse/expand dans localStorage
   */
  saveCollapsedState() {
    const state = {
      collapsedBlocks: Array.from(this.collapsedBlocks),
      collapsedSections: Array.from(this.collapsedSections),
      collapsedElements: Array.from(this.collapsedElements),
    };
    localStorage.setItem('sidebarState', JSON.stringify(state));
  }

  /**
   * Charge l'état de collapse/expand depuis localStorage
   */
  loadCollapsedState() {
    const saved = localStorage.getItem('sidebarState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.collapsedBlocks = new Set(state.collapsedBlocks || []);
        this.collapsedSections = new Set(state.collapsedSections || []);
        this.collapsedElements = new Set(state.collapsedElements || []);

        // Appliquer l'état aux blocs visibles
        this.collapsedBlocks.forEach(blockId => {
          const block = document.getElementById(blockId);
          if (block) {
            const content = block.querySelector('.block-content');
            const toggleBtn = block.querySelector('.block-toggle');
            if (content) content.classList.add('collapsed');
            if (toggleBtn) {
              const iconEl = toggleBtn.querySelector('i');
              if (iconEl) iconEl.classList.add('rotated');
            }
          }
        });

        // Appliquer l'état aux sections visibles
        this.collapsedSections.forEach(sectionId => {
          const sectionItem = document.querySelector(`.section-item[data-section-id="${sectionId}"]`);
          if (sectionItem) {
            const content = sectionItem.querySelector('.section-content');
            const toggleBtn = sectionItem.querySelector('.section-toggle');
            if (content) content.classList.add('collapsed');
            if (toggleBtn) {
              const iconEl = toggleBtn.querySelector('i');
              if (iconEl) iconEl.classList.add('rotated');
            }
          }
        });

        // Appliquer l'état aux éléments visibles
        this.collapsedElements.forEach(elementId => {
          const elementItem = document.querySelector(`.element-item[data-element-id="${elementId}"]`);
          if (elementItem) {
            const content = elementItem.querySelector('.element-content');
            const toggleBtn = elementItem.querySelector('.element-toggle');
            if (content) content.classList.add('collapsed');
            if (toggleBtn) {
              const iconEl = toggleBtn.querySelector('i');
              if (iconEl) iconEl.classList.add('rotated');
            }
          }
        });
      } catch (e) {
        console.warn('Erreur au chargement de l\'état sidebar:', e);
      }
    }
  }

  /**
   * Crée un nouvel élément dans la liste (après création via API)
   */
  addElementToSection(sectionId, element) {
    const elementsList = document.querySelector(`.elements-list[data-section-id="${sectionId}"]`);
    if (!elementsList) return;

    const elementHTML = `
      <div class="element-item" data-element-id="${element.id}" data-element-index="0">
        <div class="element-header" data-toggle-element="${element.id}">
          <button class="element-toggle">
            <i class="fas fa-chevron-right"></i>
          </button>
          <span class="element-type-badge">${element.type}</span>
          <span class="element-preview">${(element.settings?.content || element.settings?.title || element.type).substring(0, 30)}</span>
        </div>
        <div class="element-content" style="display: block;">
          <!-- Les champs seront générés dynamiquement -->
        </div>
      </div>
    `;

    elementsList.insertAdjacentHTML('beforeend', elementHTML);

    // Ouvrir immédiatement pour édition
      const newElement = document.querySelector(`.element-item[data-element-id="${element.id}"]`);
      if (newElement) {
        const header = newElement.querySelector('.element-header');
        const content = newElement.querySelector('.element-content');

        if (header) header.click(); // Trigge l'ouverture
        this.collapsedElements.delete(element.id);      // Charger le formulaire d'édition
      if (window.elementManager) {
        window.elementManager.loadElementForm(element.id, sectionId, content);
      }
    }
  }

  /**
   * Met à jour le preview d'un élément
   */
  updateElementPreview(elementId, previewText) {
    const element = document.querySelector(`.element-item[data-element-id="${elementId}"]`);
    if (element) {
      const preview = element.querySelector('.element-preview');
      if (preview) {
        preview.textContent = previewText.substring(0, 30);
      }
    }
  }

  /**
   * Supprime un élément de la liste (après suppression via API)
   */
  removeElement(elementId) {
    const element = document.querySelector(`.element-item[data-element-id="${elementId}"]`);
    if (element) {
      element.remove();
      this.collapsedElements.delete(elementId);
      this.saveCollapsedState();
    }
  }

  /**
   * Ajoute une section à la liste (après création)
   */
  addSectionToList(section) {
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) return;

    const sectionHTML = `
      <div class="section-item" data-section-id="${section.id}">
        <div class="section-header" data-toggle-section="${section.id}">
          <div class="section-info-inline">
            <button class="section-toggle" aria-expanded="false">
              <i class="fas fa-chevron-right"></i>
            </button>
            <span class="section-type-badge">${section.type}</span>
            <span class="section-title-text">${section.settings?.title || 'Sans titre'}</span>
          </div>
          <div class="section-actions">
            <button class="action-btn edit-btn" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn visibility-btn" data-visible="true" title="Visibilité">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn delete-btn" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="section-content" style="display: none;">
          <div class="elements-list" data-section-id="${section.id}">
            <div class="add-element-section">
              <button class="btn btn-sm btn-secondary add-element-btn" data-section-id="${section.id}">
                <i class="fas fa-plus-circle"></i> Ajouter élément
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    sectionsList.insertAdjacentHTML('beforeend', sectionHTML);
    // Les nouveaux toggles seront capturés par la délégation d'événements
  }

  /**
   * Supprime une section de la liste
   */
  removeSection(sectionId) {
    const section = document.querySelector(`.section-item[data-section-id="${sectionId}"]`);
    if (section) {
      section.remove();
      this.collapsedSections.delete(sectionId);
      this.saveCollapsedState();
    }
  }

  /**
   * Met à jour le titre d'une section dans la liste
   */
  updateSectionTitle(sectionId, newTitle) {
    const section = document.querySelector(`.section-item[data-section-id="${sectionId}"]`);
    if (section) {
      const titleEl = section.querySelector('.section-title-text');
      if (titleEl) {
        titleEl.textContent = newTitle || 'Sans titre';
      }
    }
  }
}

// Exposer globalement
// eslint-disable-next-line no-unused-vars
window.SidebarManager = SidebarManager;
