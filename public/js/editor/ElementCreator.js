/**
 * Gestionnaire de création d'éléments avec sélecteur visuel
 * Affiche une grille de types d'éléments avec preview visuelle
 */

class ElementCreator {
  constructor() {
    this.currentSectionId = null;
    this.elementSchemas = window.elementSchemas || {};
    this.init();
  }

  init() {
    // Délégué : capture les clics sur les boutons "Ajouter élément"
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-element-btn');
      if (addBtn) {
        const sectionId = addBtn.dataset.sectionId;
        this.showElementTypeSelector(sectionId);
      }
    });

    // Gestion de la fermeture de la modal
    document.getElementById('element-type-selector-modal')?.addEventListener('click', (e) => {
      if (e.target.closest('.modal-close')) {
        this.hideElementTypeSelector();
      }
    });

    // Fermer la modal en cliquant en dehors
    document.getElementById('element-type-selector-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'element-type-selector-modal') {
        this.hideElementTypeSelector();
      }
    });
  }

  /**
   * Affiche le sélecteur de type d'élément avec aperçu visuel
   */
  showElementTypeSelector(sectionId) {
    this.currentSectionId = sectionId;
    const modal = document.getElementById('element-type-selector-modal');
    const typeGrid = document.getElementById('element-type-grid');

    if (!modal || !typeGrid) return;

    // Générer la grille des types d'éléments
    typeGrid.innerHTML = this.generateTypeGrid();

    // Afficher la modal
    modal.classList.remove('hidden');
    modal.classList.add('show');

    // Binder les clics sur les types
    typeGrid.querySelectorAll('.element-type-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.elementType;
        this.createElement(sectionId, type);
        this.hideElementTypeSelector();
      });
    });
  }

  hideElementTypeSelector() {
    const modal = document.getElementById('element-type-selector-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.classList.add('hidden');
    }
  }

  /**
   * Génère la grille HTML des types d'éléments avec preview
   */
  generateTypeGrid() {
    const types = [
      {
        id: 'text',
        name: 'Texte',
        icon: 'fas fa-align-left',
        description: 'Bloc de texte simple',
        color: '#3498db'
      },
      {
        id: 'media',
        name: 'Image/Vidéo',
        icon: 'fas fa-image',
        description: 'Image ou vidéo embarquée',
        color: '#9b59b6'
      },
      {
        id: 'youtube',
        name: 'YouTube',
        icon: 'fab fa-youtube',
        description: 'Vidéo YouTube',
        color: '#e74c3c'
      },
      {
        id: 'card',
        name: 'Carte',
        icon: 'fas fa-rectangle-portrait',
        description: 'Image + titre + description',
        color: '#1abc9c'
      },
      {
        id: 'gallery',
        name: 'Galerie',
        icon: 'fas fa-images',
        description: 'Galerie d\'images',
        color: '#f39c12'
      },
      {
        id: 'contact',
        name: 'Contact',
        icon: 'fas fa-envelope',
        description: 'Formulaire de contact',
        color: '#2ecc71'
      },
      {
        id: 'link',
        name: 'Lien',
        icon: 'fas fa-link',
        description: 'Lien de navigation',
        color: '#34495e'
      }
    ];

    return types.map(type => `
      <div class="element-type-card" data-element-type="${type.id}" style="border-left-color: ${type.color};">
        <div class="type-icon" style="color: ${type.color};">
          <i class="${type.icon}"></i>
        </div>
        <div class="type-info">
          <h4 class="type-name">${type.name}</h4>
          <p class="type-description">${type.description}</p>
        </div>
        <div class="type-action">
          <i class="fas fa-plus-circle"></i>
        </div>
      </div>
    `).join('');
  }

  /**
   * Crée un nouvel élément via l'API et l'ajoute à la sidebar
   */
  async createElement(sectionId, elementType) {
    try {
      const response = await fetch('/api/elements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId,
          type: elementType,
          col_start: 1,
          col_end: 13,
          settings: {}
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const element = result.data;

        // Ajouter l'élément à la sidebar
        if (window.sidebarManager) {
          window.sidebarManager.addElementToSection(sectionId, element);
        }

        // Afficher un message de succès
        this.showNotification(`Élément "${elementType}" créé !`, 'success');
      } else {
        this.showNotification('Erreur lors de la création', 'error');
        console.error('Erreur API:', result);
      }
    } catch (error) {
      this.showNotification('Erreur de connexion', 'error');
      console.error('Erreur:', error);
    }
  }

  /**
   * Affiche une notification toast
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    window.setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      window.setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Exposer globalement
// eslint-disable-next-line no-unused-vars
window.ElementCreator = ElementCreator;

// Initialiser automatiquement si pas de module ESM
if (!document.currentScript || !document.currentScript.type.includes('module')) {
  document.addEventListener('DOMContentLoaded', () => {
    window.elementCreator = new ElementCreator();
  });
}
