/**
 * BaseFormManager.js
 * Classe de base commune pour ElementFormManager et SectionFormManager
 * Centralise la logique d'auto-sauvegarde et de gestion des erreurs
 */

/* global ErrorHandler */
/* eslint-disable-next-line no-unused-vars */

// eslint-disable-next-line no-unused-vars
class BaseFormManager {
  constructor() {
    // ErrorHandler est une classe statique disponible globalement
  }

  /**
   * Auto-sauvegarder un champ de formulaire
   * @param {HTMLElement} fieldElement - L'élément du champ
   * @param {number} entityId - ID de l'entité (element ou section)
   * @param {string} entityType - Type d'entité ('element' ou 'section')
   * @param {string} fieldKey - Clé du champ (peut être imbriquée comme 'title.text')
   */
  async autoSaveField(fieldElement, entityId, entityType, fieldKey) {
    if (!fieldKey || !entityId) return;

    try {
      // Récupérer la valeur avec gestion des types
      const value = this.extractFieldValue(fieldElement);

      // Construire l'URL API
      const apiEndpoint = entityType === 'element' ? `/api/elements/${entityId}` : `/api/sections/${entityId}`;

      // Préparer les données
      const updateData = { settings: {} };
      
      // Utiliser setNestedValue pour gérer les chemins imbriqués
      this.setNestedValue(updateData.settings, fieldKey, value);

      // Envoyer la mise à jour
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${entityType} field`);
      }

      // Afficher notification de succès
      this.showFieldSaveNotification(fieldElement, 'Enregistré', 'success');
    } catch (error) {
      this.errorHandler.handle(error, `Erreur sauvegarde ${entityType}`);
      this.showFieldSaveNotification(fieldElement, 'Erreur', 'error');
    }
  }

  /**
   * Extraire la valeur d'un champ selon son type
   */
  extractFieldValue(fieldElement) {
    if (fieldElement.type === 'checkbox') {
      return fieldElement.checked;
    } else if (fieldElement.type === 'number') {
      return parseFloat(fieldElement.value);
    } else {
      return fieldElement.value;
    }
  }

  /**
   * Définir une valeur imbriquée dans un objet
   * Ex: setNestedValue(obj, 'title.text', 'Hello') → obj.title.text = 'Hello'
   */
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

  /**
   * Afficher une notification de sauvegarde de champ
   */
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

      // Supprimer après animation
      window.setTimeout(() => notif.remove(), 2000);
    }
  }

  /**
   * Afficher une notification générale
   */
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
}
