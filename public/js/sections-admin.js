/**
 * Gestion admin pour le système de sections v2
 * Gestion des boutons d'édition, ajout de cartes, et modales
 */

document.addEventListener('DOMContentLoaded', () => {
  
  /**
   * Édition de section (hero, content, etc.)
   */
  const editSectionButtons = document.querySelectorAll('[data-action="edit-section"]');
  
  editSectionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = e.currentTarget.dataset.sectionId;
      console.log('Éditer section:', sectionId);
      // TODO: Ouvrir modale d'édition de section
      alert(`Édition de la section ${sectionId} - Fonctionnalité à implémenter`);
    });
  });

  /**
   * Édition de contenu de section
   */
  const editContentButtons = document.querySelectorAll('[data-action="edit-content"]');
  
  editContentButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const contentId = e.currentTarget.dataset.contentId;
      const sectionId = e.currentTarget.dataset.sectionId;
      console.log('Éditer contenu:', contentId, 'de la section:', sectionId);
      // TODO: Ouvrir modale d'édition de contenu
      alert(`Édition du contenu ${contentId} - Fonctionnalité à implémenter`);
    });
  });

  /**
   * Ajout de carte à une section card_grid
   */
  const addCardButtons = document.querySelectorAll('[data-action="add-card"]');
  
  addCardButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = e.currentTarget.dataset.sectionId;
      console.log('Ajouter carte à la section:', sectionId);
      // Rediriger vers la page de gestion des cartes avec paramètre pour ouvrir la modale
      window.location.href = `/api/sections/${sectionId}/cards?action=new`;
    });
  });

  /**
   * Suppression de carte
   */
  const deleteCardButtons = document.querySelectorAll('[data-action="delete-card"]');
  
  deleteCardButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const cardId = e.currentTarget.dataset.cardId;
      const sectionId = e.currentTarget.dataset.sectionId;
      
      if (!confirm('Voulez-vous vraiment supprimer cette carte ?')) {
        return;
      }

      try {
        const response = await fetch(`/api/sections/${sectionId}/cards/${cardId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        // Retirer la carte du DOM
        const cardElement = e.currentTarget.closest('.card');
        if (cardElement) {
          cardElement.remove();
        }

        console.log('Carte supprimée:', cardId);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la carte');
      }
    });
  });

  /**
   * Édition inline de carte
   */
  const editCardButtons = document.querySelectorAll('[data-action="edit-card"]');
  
  editCardButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cardId = e.currentTarget.dataset.cardId;
      const sectionId = e.currentTarget.dataset.sectionId;
      console.log('Éditer carte:', cardId, 'de la section:', sectionId);
      // TODO: Ouvrir modale d'édition de carte
      alert(`Édition de la carte ${cardId} - Fonctionnalité à implémenter`);
    });
  });

  /**
   * Ajout de décoration à une section
   */
  const addDecorationButtons = document.querySelectorAll('[data-action="add-decoration"]');
  
  addDecorationButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = e.currentTarget.dataset.sectionId;
      console.log('Ajouter décoration à la section:', sectionId);
      // TODO: Ouvrir sélecteur de décorations
      alert(`Ajout de décoration à la section ${sectionId} - Fonctionnalité à implémenter`);
    });
  });

  /**
   * Suppression de décoration
   */
  const deleteDecorationButtons = document.querySelectorAll('[data-action="delete-decoration"]');
  
  deleteDecorationButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const sectionId = e.currentTarget.dataset.sectionId;
      const decorationId = e.currentTarget.dataset.decorationId;
      
      if (!confirm('Voulez-vous vraiment retirer cette décoration ?')) {
        return;
      }

      try {
        const response = await fetch(`/api/sections/${sectionId}/decorations/${decorationId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        // Retirer la décoration du DOM
        const decorationElement = e.currentTarget.closest('.decoration');
        if (decorationElement) {
          decorationElement.remove();
        }

        console.log('Décoration retirée:', decorationId);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la décoration');
      }
    });
  });

  /**
   * Réorganisation de sections (drag & drop)
   * TODO: Implémenter avec SortableJS ou équivalent
   */
  
  console.log('Sections Admin JS initialisé');
  console.log(`- ${editSectionButtons.length} boutons edit-section`);
  console.log(`- ${editContentButtons.length} boutons edit-content`);
  console.log(`- ${addCardButtons.length} boutons add-card`);
  console.log(`- ${deleteCardButtons.length} boutons delete-card`);
  console.log(`- ${editCardButtons.length} boutons edit-card`);
});
