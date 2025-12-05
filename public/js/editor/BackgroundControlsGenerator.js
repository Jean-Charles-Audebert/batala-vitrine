/**
 * BackgroundControlsGenerator.js
 * Génère les contrôles de fond réutilisables pour les sections et autres formulaires
 * 
 * Offre la même logique que background-controls.ejs mais en JavaScript dynamique
 */

// eslint-disable-next-line no-unused-vars
class BackgroundControlsGenerator {
  /**
   * Crée les contrôles de fond dynamiquement
   * 
   * @param {Object} options Configuration
   * @param {string} options.prefix Préfixe pour les IDs (ex: 'page', 'section-1')
   * @param {Object} options.data Données du fond
   * @param {boolean} options.showDivider Afficher un séparateur (default: true)
   * @param {string} options.dividerLabel Texte du séparateur (default: "Fond")
   * @returns {HTMLElement} Conteneur avec tous les contrôles
   */
  static createBackgroundControls(options = {}) {
    const {
      prefix = 'bg',
      data = {},
      showDivider = true,
      dividerLabel = 'Fond'
    } = options;

    // Normaliser la couleur
    let bgColor = data.bg_color || '#f5f5f5';
    if (bgColor.match(/^#[0-9a-f]{3}$/i)) {
      bgColor = '#' + bgColor.substring(1).split('').map(x => x + x).join('');
    }

    // Déterminer le type de média sélectionné
    let bgType = data.bg_type || 'none';
    if (data.bg_image && !data.bg_video_youtube) bgType = 'image';
    if (data.bg_video_youtube) bgType = 'youtube';

    const container = document.createElement('div');
    container.className = 'bg-controls-container';

    // Séparateur
    if (showDivider) {
      const divider = document.createElement('div');
      divider.className = 'form-section-divider';
      const label = document.createElement('span');
      label.textContent = dividerLabel;
      divider.appendChild(label);
      container.appendChild(divider);
    }

    // Couleur de fond
    const colorGroup = document.createElement('div');
    colorGroup.className = 'form-group';
    const colorLabel = document.createElement('label');
    colorLabel.htmlFor = `${prefix}-bg-color`;
    colorLabel.textContent = 'Couleur de fond';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = `${prefix}-bg-color`;
    colorInput.value = bgColor;
    colorInput.className = 'bg-color-input';
    colorInput.setAttribute('data-prefix', prefix);
    colorGroup.appendChild(colorLabel);
    colorGroup.appendChild(colorInput);
    container.appendChild(colorGroup);

    // Type de média
    const mediaTypeGroup = document.createElement('div');
    mediaTypeGroup.className = 'form-group';
    const mediaLabel = document.createElement('label');
    mediaLabel.textContent = 'Type de média';
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-group compact';

    const options_list = [
      { value: 'none', label: 'Aucun' },
      { value: 'image', label: 'Image/Vidéo' },
      { value: 'youtube', label: 'YouTube' }
    ];

    options_list.forEach(opt => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `${prefix}-bg-media-type`;
      radio.value = opt.value;
      radio.checked = (opt.value === bgType);
      radio.className = 'bg-media-type-radio';
      radio.setAttribute('data-prefix', prefix);
      
      const span = document.createElement('span');
      span.textContent = opt.label;
      
      label.appendChild(radio);
      label.appendChild(span);
      radioGroup.appendChild(label);
    });

    mediaTypeGroup.appendChild(mediaLabel);
    mediaTypeGroup.appendChild(radioGroup);
    container.appendChild(mediaTypeGroup);

    // Champ image
    const imageGroup = document.createElement('div');
    imageGroup.className = 'form-group bg-media-field';
    imageGroup.id = `${prefix}-bg-image-field`;
    imageGroup.style.display = bgType === 'image' ? 'block' : 'none';
    
    const imageLabel = document.createElement('label');
    imageLabel.htmlFor = `${prefix}-bg-image`;
    imageLabel.textContent = 'Image/Vidéo';
    
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'media-upload-field compact';
    
    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.id = `${prefix}-bg-image`;
    imageInput.value = data.bg_image || '';
    imageInput.placeholder = '/uploads/...';
    imageInput.readOnly = true;
    imageInput.className = 'bg-image-input';
    imageInput.setAttribute('data-prefix', prefix);
    
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'btn btn-xs btn-secondary select-bg-media';
    selectBtn.title = 'Parcourir';
    selectBtn.innerHTML = '<i class="fas fa-folder-open"></i>';
    selectBtn.setAttribute('data-prefix', prefix);
    
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'btn btn-xs btn-danger clear-bg-media';
    clearBtn.title = 'Effacer';
    clearBtn.innerHTML = '<i class="fas fa-trash"></i>';
    clearBtn.style.display = data.bg_image ? 'inline-block' : 'none';
    clearBtn.setAttribute('data-prefix', prefix);
    
    mediaContainer.appendChild(imageInput);
    mediaContainer.appendChild(selectBtn);
    mediaContainer.appendChild(clearBtn);
    
    imageGroup.appendChild(imageLabel);
    imageGroup.appendChild(mediaContainer);
    container.appendChild(imageGroup);

    // Champ YouTube
    const youtubeGroup = document.createElement('div');
    youtubeGroup.className = 'form-group bg-media-field';
    youtubeGroup.id = `${prefix}-bg-youtube-field`;
    youtubeGroup.style.display = bgType === 'youtube' ? 'block' : 'none';
    
    const youtubeLabel = document.createElement('label');
    youtubeLabel.htmlFor = `${prefix}-bg-video-youtube`;
    youtubeLabel.textContent = 'URL YouTube';
    
    const youtubeInput = document.createElement('input');
    youtubeInput.type = 'text';
    youtubeInput.id = `${prefix}-bg-video-youtube`;
    youtubeInput.value = data.bg_video_youtube || '';
    youtubeInput.placeholder = 'https://www.youtube.com/watch?v=...';
    youtubeInput.className = 'bg-youtube-input';
    youtubeInput.setAttribute('data-prefix', prefix);
    
    youtubeGroup.appendChild(youtubeLabel);
    youtubeGroup.appendChild(youtubeInput);
    container.appendChild(youtubeGroup);

    // Opacité
    const opacityGroup = document.createElement('div');
    opacityGroup.className = 'form-group';
    const opacityLabel = document.createElement('label');
    opacityLabel.htmlFor = `${prefix}-bg-opacity`;
    opacityLabel.textContent = 'Opacité (0-1)';
    const opacityInput = document.createElement('input');
    opacityInput.type = 'number';
    opacityInput.id = `${prefix}-bg-opacity`;
    opacityInput.min = 0;
    opacityInput.max = 1;
    opacityInput.step = 0.1;
    opacityInput.value = data.bg_opacity || 1.0;
    opacityInput.className = 'bg-opacity-input';
    opacityInput.setAttribute('data-prefix', prefix);
    opacityGroup.appendChild(opacityLabel);
    opacityGroup.appendChild(opacityInput);
    container.appendChild(opacityGroup);

    // Position
    const positionGroup = document.createElement('div');
    positionGroup.className = 'form-group';
    const positionLabel = document.createElement('label');
    positionLabel.htmlFor = `${prefix}-bg-position`;
    positionLabel.textContent = 'Position du fond';
    const positionSelect = document.createElement('select');
    positionSelect.id = `${prefix}-bg-position`;
    positionSelect.className = 'bg-position-select';
    positionSelect.setAttribute('data-prefix', prefix);
    
    const positions = [
      { value: 'center', label: 'Centre' },
      { value: 'top', label: 'Haut' },
      { value: 'bottom', label: 'Bas' }
    ];
    
    positions.forEach(pos => {
      const option = document.createElement('option');
      option.value = pos.value;
      option.textContent = pos.label;
      option.selected = (pos.value === data.bg_position);
      positionSelect.appendChild(option);
    });
    
    positionGroup.appendChild(positionLabel);
    positionGroup.appendChild(positionSelect);
    container.appendChild(positionGroup);

    // Ajouter les event listeners
    this.attachEventListeners(container, prefix);

    return container;
  }

  /**
   * Attache les événements pour gérer l'affichage conditionnel et les actions
   */
  static attachEventListeners(container, prefix) {
    // Radio buttons pour type de média
    const radios = container.querySelectorAll(`input[name="${prefix}-bg-media-type"]`);
    const imageField = container.querySelector(`#${prefix}-bg-image-field`);
    const youtubeField = container.querySelector(`#${prefix}-bg-youtube-field`);

    const updateMediaFields = () => {
      const selectedType = container.querySelector(`input[name="${prefix}-bg-media-type"]:checked`)?.value;
      if (imageField) imageField.style.display = selectedType === 'image' ? 'block' : 'none';
      if (youtubeField) youtubeField.style.display = selectedType === 'youtube' ? 'block' : 'none';
    };

    radios.forEach(radio => {
      radio.addEventListener('change', updateMediaFields);
    });

    // Bouton sélection image
    const selectBtns = container.querySelectorAll(`button[data-prefix="${prefix}"].select-bg-media`);
    selectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const imageInput = container.querySelector(`#${prefix}-bg-image`);
        if (window.openMediaPicker) {
          window.openMediaPicker((url) => {
            imageInput.value = url;
            const clearBtn = container.querySelector(`button[data-prefix="${prefix}"].clear-bg-media`);
            if (clearBtn) clearBtn.style.display = 'inline-block';
          }, 'both');
        }
      });
    });

    // Bouton suppression image
    const clearBtns = container.querySelectorAll(`button[data-prefix="${prefix}"].clear-bg-media`);
    clearBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const imageInput = container.querySelector(`#${prefix}-bg-image`);
        imageInput.value = '';
        btn.style.display = 'none';
      });
    });
  }
}

// Exposer globalement
window.BackgroundControlsGenerator = BackgroundControlsGenerator;
