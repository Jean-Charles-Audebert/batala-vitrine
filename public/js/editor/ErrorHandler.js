/**
 * ErrorHandler.js
 * Gestion centralisée des erreurs dans l'éditeur
 * Permet de logger, afficher et traiter les erreurs de manière cohérente
 */

// eslint-disable-next-line no-unused-vars
class ErrorHandler {
  /**
   * Types d'erreurs reconnues
   */
  static ERROR_TYPES = {
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION',
    AUTH: 'AUTH',
    SERVER: 'SERVER',
    UNKNOWN: 'UNKNOWN'
  };

  /**
   * Traiter une erreur avec logging et affichage
   * @param {Error} error - L'objet erreur
   * @param {string} context - Contexte pour le logging
   * @param {Object} options - Options {showUI: true, logLevel: 'error'}
   */
  static handle(error, context = '', options = {}) {
    const {
      showUI = true,
      logLevel = 'error',
      userMessage = null
    } = options;

    // Déterminer le type d'erreur
    const errorType = this.classifyError(error);

    // Logger avec contexte
    this.log(error, context, errorType, logLevel);

    // Afficher l'UI si demandé
    if (showUI) {
      const displayMessage = userMessage || this.getUserMessage(errorType, error);
      this.showNotification(displayMessage, errorType);
    }

    return {
      type: errorType,
      message: error.message,
      context
    };
  }

  /**
   * Classer l'erreur par type
   */
  static classifyError(error) {
    if (!error) return this.ERROR_TYPES.UNKNOWN;

    const message = error.message?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch')) {
      return this.ERROR_TYPES.NETWORK;
    }
    if (message.includes('401') || message.includes('unauthorized')) {
      return this.ERROR_TYPES.AUTH;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return this.ERROR_TYPES.VALIDATION;
    }
    if (message.includes('500') || message.includes('server')) {
      return this.ERROR_TYPES.SERVER;
    }

    return this.ERROR_TYPES.UNKNOWN;
  }

  /**
   * Logger l'erreur avec contexte
   */
  static log(error, context, errorType, logLevel) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${context} (${errorType})`;

    if (logLevel === 'error') {
      console.error(logMessage, error);
    } else if (logLevel === 'warn') {
      console.warn(logMessage, error);
    } else {
      console.log(logMessage, error);
    }
  }

  /**
   * Obtenir le message utilisateur selon le type d'erreur
   */
  static getUserMessage(errorType) {
    const messages = {
      [this.ERROR_TYPES.NETWORK]: 'Erreur de connexion. Vérifiez votre connexion Internet.',
      [this.ERROR_TYPES.VALIDATION]: 'Les données envoyées sont invalides.',
      [this.ERROR_TYPES.AUTH]: 'Votre session a expiré. Reconnexion en cours...',
      [this.ERROR_TYPES.SERVER]: 'Erreur serveur. Veuillez réessayer plus tard.',
      [this.ERROR_TYPES.UNKNOWN]: 'Une erreur inconnue s\'est produite.'
    };

    return messages[errorType] || messages[this.ERROR_TYPES.UNKNOWN];
  }

  /**
   * Afficher une notification d'erreur à l'utilisateur
   */
  static showNotification(message, errorType) {
    const notif = document.createElement('div');
    notif.className = `error-notification error-notification-${errorType.toLowerCase()}`;
    notif.textContent = message;
    notif.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: #f44336;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      z-index: 10001;
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
      font-size: 0.95rem;
      border-left: 4px solid #d32f2f;
      animation: slideIn 0.3s ease;
    `;

    // Bouton fermer
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 0;
      width: 24px;
      height: 24px;
    `;
    closeBtn.onclick = () => notif.remove();

    notif.appendChild(closeBtn);
    document.body.appendChild(notif);

    // Auto-remove après 5 secondes
    window.setTimeout(() => {
      if (notif.parentElement) {
        notif.style.animation = 'slideOut 0.3s ease';
        window.setTimeout(() => notif.remove(), 300);
      }
    }, 5000);
  }

  /**
   * Enregistrer une erreur pour debugging (stocker en localStorage)
   */
  static logToStorage(error, context) {
    try {
      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        context,
        message: error.message,
        stack: error.stack
      });

      // Garder seulement les 50 derniers logs
      if (logs.length > 50) {
        logs.shift();
      }

      localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (err) {
      // eslint-disable-next-line no-unused-vars
      // Silently fail si localStorage est plein
    }
  }

  /**
   * Récupérer les logs d'erreur stockés
   */
  static getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch (err) {
      // eslint-disable-next-line no-unused-vars
      return [];
    }
  }

  /**
   * Vider les logs d'erreur
   */
  static clearLogs() {
    localStorage.removeItem('errorLogs');
  }
}

// Exposer globalement et initialiser
// eslint-disable-next-line no-unused-vars
window.ErrorHandler = ErrorHandler;
window.errorHandler = new ErrorHandler();
