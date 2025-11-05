/* global document, FormData, fetch */
/**
 * Gestion de l'upload d'images pour les formulaires
 */

/**
 * Initialise les uploads d'images sur tous les inputs file avec data-target-field
 */
function initImageUploads() {
  const fileInputs = document.querySelectorAll('input[type="file"][data-target-field]');
  
  fileInputs.forEach(fileInput => {
    const fieldId = fileInput.dataset.targetField;
    
    // Attacher le listener change pour l'upload
    fileInput.addEventListener('change', async (event) => {
      await handleImageUpload(event, fieldId);
    });
    
    // Trouver et attacher le listener au bouton "Choisir"
    const uploadButton = document.querySelector(`button[onclick*="${fileInput.id}"]`);
    if (uploadButton) {
      // Retirer l'ancien onclick et utiliser addEventListener
      uploadButton.removeAttribute('onclick');
      uploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });
    }
  });
}

/**
 * Gère l'upload d'une image vers le serveur
 * @param {Event} event - L'événement change de l'input file
 * @param {string} fieldId - L'ID du champ texte cible
 */
async function handleImageUpload(event, fieldId) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById(fieldId + '_status');
  const pathInput = document.getElementById(fieldId);
  const previewContainer = document.getElementById(fieldId + '_preview');
  const previewImg = previewContainer ? previewContainer.querySelector('img') : null;

  // Validation taille (5 MB max)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    const errorMsg = `❌ Fichier trop volumineux (max 5 MB, reçu ${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    if (statusEl) {
      statusEl.textContent = errorMsg;
      statusEl.style.color = "#e74c3c";
    }
    event.target.value = "";
    return;
  }

  // Préparation du FormData
  const formData = new FormData();
  formData.append("image", file);
  formData.append("fieldName", fieldId); // Envoyer le nom du champ pour détecter le preset

  // Affichage du statut "en cours"
  if (statusEl) {
    statusEl.textContent = "⏳ Upload et optimisation en cours...";
    statusEl.style.color = "#3498db";
  }

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      const successMsg = `✅ Image optimisée : ${result.filename}`;
      
      if (statusEl) {
        statusEl.textContent = successMsg;
        statusEl.style.color = "#27ae60";
      }
      
      // Mettre à jour le champ texte
      if (pathInput) {
        pathInput.value = result.path;
      }
      
      // Mettre à jour la preview
      if (previewImg) {
        previewImg.src = result.path;
        if (previewContainer) {
          previewContainer.style.display = 'block';
          // Afficher aussi le container parent (form-group) s'il existe
          const parentContainer = previewContainer.closest('.form-group');
          if (parentContainer) {
            parentContainer.style.display = 'block';
          }
        }
      }
    } else {
      const errorMsg = `❌ Erreur : ${result.message}`;
      
      if (statusEl) {
        statusEl.textContent = errorMsg;
        statusEl.style.color = "#e74c3c";
      }
      event.target.value = "";
    }
  } catch {
    const errorMsg = "❌ Erreur réseau lors de l'upload";
    
    if (statusEl) {
      statusEl.textContent = errorMsg;
      statusEl.style.color = "#e74c3c";
    }
    event.target.value = "";
  }
}



// Auto-initialisation au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageUploads);
} else {
  // DOM déjà chargé
  initImageUploads();
}
