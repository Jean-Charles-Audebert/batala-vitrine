/**
 * MediaSelector - Composant réutilisable pour sélectionner un type de média
 * Gère 3 modes : Aucun, Image/Vidéo, YouTube
 */

class MediaSelector {
  /**
   * @param {Object} options - Configuration du sélecteur
   * @param {string} options.containerId - ID du conteneur parent
   * @param {string} options.imageFieldId - ID du champ image/vidéo
   * @param {string} options.youtubeFieldId - ID du champ YouTube
   * @param {string} options.radioName - Nom du groupe de radio buttons
   * @param {Function} options.onChange - Callback appelé lors du changement
   * @param {Object} options.initialValues - Valeurs initiales { image: '', youtube: '' }
   */
  constructor(options) {
    this.options = {
      onChange: () => {},
      initialValues: { image: '', youtube: '' },
      ...options
    };

    this.container = document.getElementById(this.options.containerId);
    if (!this.container) {
      console.error(`MediaSelector: Container #${this.options.containerId} not found`);
      return;
    }

    this.imageField = document.getElementById(this.options.imageFieldId);
    this.youtubeField = document.getElementById(this.options.youtubeFieldId);
    this.radios = document.querySelectorAll(`input[name="${this.options.radioName}"]`);

    this.init();
  }

  init() {
    // Gérer les changements de type
    this.radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleTypeChange(e.target.value);
      });
    });

    // État initial
    const initialType = this.getCurrentType();
    this.handleTypeChange(initialType);
  }

  getCurrentType() {
    const checkedRadio = Array.from(this.radios).find(r => r.checked);
    return checkedRadio ? checkedRadio.value : 'none';
  }

  handleTypeChange(type) {
    // Masquer tous les champs
    if (this.imageField) {
      this.imageField.closest('.bg-media-field').style.display = 'none';
    }
    if (this.youtubeField) {
      this.youtubeField.closest('.bg-media-field').style.display = 'none';
    }

    // Afficher le champ correspondant
    if (type === 'image' && this.imageField) {
      this.imageField.closest('.bg-media-field').style.display = 'block';
    } else if (type === 'youtube' && this.youtubeField) {
      this.youtubeField.closest('.bg-media-field').style.display = 'block';
    } else if (type === 'none') {
      // Effacer les valeurs
      if (this.imageField) this.imageField.value = '';
      if (this.youtubeField) this.youtubeField.value = '';
    }

    // Callback
    this.options.onChange({
      type,
      imageValue: this.imageField ? this.imageField.value : '',
      youtubeValue: this.youtubeField ? this.youtubeField.value : ''
    });
  }

  /**
   * Obtenir les valeurs actuelles
   * @returns {Object} { type: string, image: string, youtube: string }
   */
  getValues() {
    return {
      type: this.getCurrentType(),
      image: this.imageField ? this.imageField.value : '',
      youtube: this.youtubeField ? this.youtubeField.value : ''
    };
  }

  /**
   * Définir les valeurs programmatiquement
   * @param {Object} values - { type: string, image: string, youtube: string }
   */
  setValues(values) {
    // Sélectionner le bon radio
    this.radios.forEach(radio => {
      radio.checked = (radio.value === values.type);
    });

    // Définir les valeurs des champs
    if (this.imageField && values.image) {
      this.imageField.value = values.image;
    }
    if (this.youtubeField && values.youtube) {
      this.youtubeField.value = values.youtube;
    }

    // Appliquer le changement
    this.handleTypeChange(values.type);
  }
}

// Export global
window.MediaSelector = MediaSelector;
