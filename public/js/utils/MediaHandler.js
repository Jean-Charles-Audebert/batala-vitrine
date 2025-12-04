/**
 * MediaHandler - Classe réutilisable pour gérer les sélections et suppressions de médias
 * Utilisée par la page et les sections pour un comportement unifié
 */

import { isVideoFile } from './mediaDetector.js';

export class MediaHandler {
  /**
   * @param {Object} config - Configuration
   * @param {string} config.inputId - ID de l'input qui stocke le chemin du média
   * @param {string} config.selectBtnSelector - Sélecteur CSS du bouton de sélection
   * @param {string} config.clearBtnSelector - Sélecteur CSS du bouton de suppression
   * @param {Function} config.onUpdate - Callback après mise à jour (ex: updatePreview)
   * @param {Function} config.onSave - Callback après mise à jour (ex: savePageSettings)
   * @param {Function} [config.openMediaPicker] - Fonction pour ouvrir le sélecteur de média (optionnel, sera cherché dans window par défaut)
   */
  constructor(config) {
    this.inputId = config.inputId;
    this.selectBtnSelector = config.selectBtnSelector;
    this.clearBtnSelector = config.clearBtnSelector;
    this.onUpdate = config.onUpdate;
    this.onSave = config.onSave;
    this.openMediaPicker = config.openMediaPicker || window.openMediaPicker;

    if (!this.openMediaPicker) {
      console.warn('[MediaHandler] openMediaPicker non disponible');
    }

    this.attachHandlers();
  }

  /**
   * Attache les event listeners aux boutons
   */
  attachHandlers() {
    // Bouton de sélection
    const selectBtn = document.querySelector(this.selectBtnSelector);
    if (selectBtn) {
      selectBtn.addEventListener('click', () => this.handleSelect());
    }

    // Bouton de suppression
    const clearBtn = document.querySelector(this.clearBtnSelector);
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.handleClear());
    }
  }

  /**
   * Gère la sélection d'un média
   */
  handleSelect() {
    if (!this.openMediaPicker) {
      console.error('[MediaHandler] openMediaPicker indisponible');
      return;
    }

    this.openMediaPicker((url) => {
      this.setMediaValue(url);
      this.updateClearButton(url);
      this.onUpdate?.();
      this.onSave?.();
    }, 'both'); // Accepte images et vidéos
  }

  /**
   * Gère la suppression d'un média
   */
  handleClear() {
    this.setMediaValue('');
    this.updateClearButton('');
    this.onUpdate?.();
    this.onSave?.();
  }

  /**
   * Définit la valeur du média dans l'input
   * @param {string} url - URL ou chemin du média
   */
  setMediaValue(url) {
    const input = document.getElementById(this.inputId);
    if (input) {
      input.value = url;
    }
  }

  /**
   * Met à jour la visibilité du bouton de suppression
   * @param {string} url - URL ou chemin du média
   */
  updateClearButton(url) {
    const clearBtn = document.querySelector(this.clearBtnSelector);
    if (clearBtn) {
      clearBtn.style.display = url ? 'inline-block' : 'none';
    }
  }

  /**
   * Retourne la valeur actuelle du média
   * @returns {string}
   */
  getMediaValue() {
    const input = document.getElementById(this.inputId);
    return input?.value || '';
  }

  /**
   * Retourne si le média actuel est une vidéo
   * @returns {boolean}
   */
  isCurrentMediaVideo() {
    return isVideoFile(this.getMediaValue());
  }

  /**
   * Réinitialise le gestionnaire (utile pour nettoyage)
   */
  destroy() {
    // Les event listeners seront garbage-collected avec le DOM
  }
}

export default MediaHandler;
