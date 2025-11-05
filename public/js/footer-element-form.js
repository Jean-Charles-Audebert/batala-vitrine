/* global document, alert */

/**
 * Gestion du formulaire des éléments footer
 */

(function() {
  'use strict';

  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const typeSelect = document.getElementById('type');
    const textFields = document.getElementById('text-fields');
    const contactFields = document.getElementById('contact-fields');
    const socialFields = document.getElementById('social-fields');
    const addSocialLinkBtn = document.getElementById('add-social-link');
    const socialLinksContainer = document.getElementById('social-links-container');

    if (!typeSelect) {
      console.warn('[FooterElementForm] Type select not found');
      return;
    }

    // Mettre à jour l'aperçu de l'icône
    function updateIconPreview(select, iconPreview) {
      const selectedOption = select.options[select.selectedIndex];
      const iconUrl = selectedOption.dataset.icon;
      
      if (iconUrl && iconUrl !== '') {
        iconPreview.src = iconUrl;
        iconPreview.style.display = 'block';
      } else {
        iconPreview.style.display = 'none';
      }
    }

    // Afficher les champs correspondant au type sélectionné
    function updateFieldsVisibility() {
      const selectedType = typeSelect.value;
      
      // Masquer tous les champs
      if (textFields) textFields.style.display = 'none';
      if (contactFields) contactFields.style.display = 'none';
      if (socialFields) socialFields.style.display = 'none';

      // Afficher les champs du type sélectionné
      if (selectedType === 'text' && textFields) {
        textFields.style.display = 'block';
      } else if (selectedType === 'contact' && contactFields) {
        contactFields.style.display = 'block';
      } else if (selectedType === 'social' && socialFields) {
        socialFields.style.display = 'block';
      }
    }

    // Ajouter un nouveau lien social
    function addSocialLink() {
      const row = document.createElement('div');
      row.className = 'social-link-row';
      row.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;';
      
      // Récupérer les options depuis le premier select (pour avoir les data-icon)
      const firstSelect = socialLinksContainer.querySelector('.social-select');
      const optionsHTML = firstSelect ? firstSelect.innerHTML : `
        <option value="">-- Plateforme --</option>
        <option value="facebook" data-icon="/icons/facebook.svg">Facebook</option>
        <option value="instagram" data-icon="/icons/instagram.svg">Instagram</option>
        <option value="youtube" data-icon="/icons/youtube.svg">YouTube</option>
        <option value="x" data-icon="/icons/twitter.svg">X (Twitter)</option>
        <option value="bluesky" data-icon="/icons/bluesky.svg">Bluesky</option>
        <option value="linkedin" data-icon="/icons/linkedin.svg">LinkedIn</option>
        <option value="discord" data-icon="/icons/discord.svg">Discord</option>
        <option value="slack" data-icon="/icons/slack.svg">Slack</option>
        <option value="whatsapp" data-icon="/icons/whatsapp.svg">WhatsApp</option>
        <option value="reddit" data-icon="/icons/reddit.svg">Reddit</option>
        <option value="tiktok" data-icon="/icons/tiktok.svg">TikTok</option>
      `;
      
      row.innerHTML = `
        <select name="social_platform" class="form-control social-select" style="flex: 1;">
          ${optionsHTML}
        </select>
        <img class="social-icon-preview" src="" alt="" style="width: 24px; height: 24px; display: none;">
        <input type="url" name="social_url" class="form-control" style="flex: 2;" placeholder="https://...">
        <button type="button" class="btn btn-danger btn-sm remove-social-link">×</button>
      `;
      
      socialLinksContainer.appendChild(row);
      
      // Attacher les événements
      const removeBtn = row.querySelector('.remove-social-link');
      removeBtn.addEventListener('click', () => removeSocialLink(row));
      
      const select = row.querySelector('.social-select');
      const iconPreview = row.querySelector('.social-icon-preview');
      select.addEventListener('change', () => updateIconPreview(select, iconPreview));
    }

    // Supprimer un lien social
    function removeSocialLink(row) {
      // Ne pas supprimer s'il n'y a qu'une seule ligne
      const rows = socialLinksContainer.querySelectorAll('.social-link-row');
      if (rows.length <= 1) {
        alert('Vous devez conserver au moins un lien social');
        return;
      }
      row.remove();
    }

    // Événements
    typeSelect.addEventListener('change', updateFieldsVisibility);
    
    if (addSocialLinkBtn) {
      addSocialLinkBtn.addEventListener('click', addSocialLink);
    }

    // Attacher les événements de suppression aux boutons existants
    document.querySelectorAll('.remove-social-link').forEach(btn => {
      btn.addEventListener('click', function() {
        removeSocialLink(this.closest('.social-link-row'));
      });
    });

    // Attacher les événements de changement aux selects existants pour les icônes
    document.querySelectorAll('.social-select').forEach(select => {
      const row = select.closest('.social-link-row');
      const iconPreview = row.querySelector('.social-icon-preview');
      select.addEventListener('change', () => updateIconPreview(select, iconPreview));
    });

    // Afficher les bons champs au chargement
    updateFieldsVisibility();
  }
})();
