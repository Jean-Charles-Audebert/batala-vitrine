/**
 * Media Picker - Sélection fichier local ou URL externe
 * Utilisé par sections-edit.js pour les modales
 */

/* global document, FormData, fetch, alert, setTimeout */

(function() {
  'use strict';

  /**
   * Ouvre une modale de sélection média avec onglets Upload/URL
   * @param {Function} callback - Fonction appelée avec l'URL du média sélectionné
   * @param {string} mediaType - Type de média ('image', 'video', 'both')
   * @param {string} fieldName - Nom du champ pour détection automatique du preset d'optimisation
   */
  function openMediaPicker(callback, mediaType = 'both', fieldName = 'media_path') {
    const modal = createMediaPickerModal(callback, mediaType, fieldName);
    document.body.appendChild(modal);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function createMediaPickerModal(callback, mediaType, fieldName) {
    const modal = document.createElement('div');
    modal.id = 'mediaPickerModal';
    modal.className = 'modal';

    const acceptTypes = mediaType === 'video'
      ? 'video/mp4,video/webm'
      : mediaType === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif'
      : 'image/*,video/mp4,video/webm';

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Choisir un média</h2>
          <button class="modal-close" data-close-picker>&times;</button>
        </div>

        <div class="media-picker-tabs">
          <button class="tab-btn active" data-tab="upload">📁 Fichier local</button>
          <button class="tab-btn" data-tab="url">🔗 URL externe</button>
        </div>

        <div class="media-picker-content">
          <!-- Onglet Upload -->
          <div class="tab-panel active" data-panel="upload">
            <div class="upload-zone">
              <input
                type="file"
                id="mediaPickerFile"
                accept="${acceptTypes}"
                style="display: none;"
              >
              <label for="mediaPickerFile" class="upload-label">
                <div class="upload-icon">📤</div>
                <p>Cliquez pour sélectionner un fichier</p>
                <small>Maximum 5 MB</small>
              </label>
              <div id="uploadStatus" class="upload-status"></div>
              <div id="uploadPreview" class="upload-preview" style="display: none;">
                <img id="previewImage" alt="Preview" style="max-width: 100%; max-height: 200px;">
              </div>
            </div>
          </div>

          <!-- Onglet URL -->
          <div class="tab-panel" data-panel="url">
            <div class="form-group">
              <label for="mediaUrlInput">URL du média</label>
              <input
                type="url"
                id="mediaUrlInput"
                placeholder="https://example.com/image.jpg"
                class="form-control"
              >
              <small class="form-hint">
                ${mediaType === 'video' ? 'YouTube, Vimeo ou fichier MP4' : 'Lien direct vers l\'image'}
              </small>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close-picker>Annuler</button>
          <button type="button" class="btn btn-primary" id="confirmMediaPicker">Valider</button>
        </div>
      </div>
    `;

    // Gestion des onglets
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Activer l'onglet
        modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Afficher le panel correspondant
        modal.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.toggle('active', panel.dataset.panel === targetTab);
        });
      });
    });

    // Upload de fichier
    const fileInput = modal.querySelector('#mediaPickerFile');
    let uploadedPath = null;

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const statusEl = modal.querySelector('#uploadStatus');
      const previewContainer = modal.querySelector('#uploadPreview');
      const previewImg = modal.querySelector('#previewImage');

      // Validation taille
      const MAX_SIZE = 50 * 1024 * 1024; // 50 MB max pour supporter les vidéos
      if (file.size > MAX_SIZE) {
        statusEl.textContent = `❌ Fichier trop volumineux (max 50 MB)`;
        statusEl.style.color = '#e74c3c';
        fileInput.value = '';
        return;
      }

      statusEl.textContent = '⏳ Upload en cours...';
      statusEl.style.color = '#3498db';

      const formData = new FormData();
      formData.append('image', file);
      formData.append('fieldName', fieldName);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          uploadedPath = result.path;
          statusEl.textContent = `✅ ${result.filename}`;
          statusEl.style.color = '#27ae60';

          // Preview si image
          if (file.type.startsWith('image/')) {
            previewImg.src = result.path;
            previewContainer.style.display = 'block';
          }
        } else {
          statusEl.textContent = `❌ ${result.message}`;
          statusEl.style.color = '#e74c3c';
        }
      } catch (err) {
        statusEl.textContent = '❌ Erreur réseau';
        statusEl.style.color = '#e74c3c';
        console.error('Upload error:', err);
      }
    });

    // Boutons fermer
    modal.querySelectorAll('[data-close-picker]').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      });
    });

    // Validation
    modal.querySelector('#confirmMediaPicker').addEventListener('click', () => {
      const activePanel = modal.querySelector('.tab-panel.active').dataset.panel;

      let mediaUrl = null;

      if (activePanel === 'upload') {
        if (uploadedPath) {
          mediaUrl = uploadedPath;
        } else {
          alert('Veuillez sélectionner un fichier');
          return;
        }
      } else {
        const urlInput = modal.querySelector('#mediaUrlInput');
        mediaUrl = urlInput.value.trim();

        if (!mediaUrl) {
          alert('Veuillez entrer une URL');
          return;
        }
      }

      callback(mediaUrl);
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });

    return modal;
  }

  // Exposer globalement
  window.openMediaPicker = openMediaPicker;

})();
