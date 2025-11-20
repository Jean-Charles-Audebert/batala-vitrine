/**
 * Admin Dashboard JavaScript
 * Gestion de la navigation et du contenu dynamique
 */

class AdminDashboard {
  constructor() {
    this.currentSection = 'sections';
    this.init();
  }

  init() {
    this.bindNavigationEvents();
    this.loadInitialContent();
  }

  bindNavigationEvents() {
    // Gestion des clics sur la navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;
        this.loadSection(section);
      });
    });
  }

  async loadInitialContent() {
    // Charger la section sections par défaut
    await this.loadSection('sections');
  }

  async loadSection(sectionName) {
    try {
      // Afficher le loading
      this.showLoading();

      // Mettre à jour la navigation active
      this.updateActiveNavigation(sectionName);

      // Charger le contenu via AJAX
      const response = await fetch(`/api/admin/${sectionName}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const html = await response.text();

      // Injecter le contenu
      this.injectContent(html);

      // Mettre à jour l'URL (optionnel, pour la compatibilité)
      history.pushState({ section: sectionName }, '', `/admin?section=${sectionName}`);

    } catch (error) {
      console.error('Erreur lors du chargement de la section:', error);
      this.showError('Erreur lors du chargement du contenu');
    }
  }

  showLoading() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Chargement...</p></div>';
  }

  updateActiveNavigation(activeSection) {
    // Retirer la classe active de tous les liens
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('nav-link-active');
    });

    // Ajouter la classe active au lien sélectionné
    const activeLink = document.querySelector(`.nav-link[data-section="${activeSection}"]`);
    if (activeLink) {
      activeLink.classList.add('nav-link-active');
    }
  }

  injectContent(html) {
    const content = document.getElementById('admin-content');
    content.innerHTML = html;

    // Réinitialiser les événements après injection du contenu
    this.rebindContentEvents();
  }

  rebindContentEvents() {
    // Réattacher les événements pour les éléments injectés dynamiquement
    this.bindSectionActions();

    // Gestion spécifique aux color pickers dans settings
    this.bindColorPickers();
  }

  bindSectionActions() {
    // Boutons spécifiques aux sections
    const newSectionBtn = document.querySelector('[data-action="new-section"]');
    if (newSectionBtn) {
      newSectionBtn.addEventListener('click', () => {
        this.showSectionModal();
      });
    }

    const newAdminBtn = document.querySelector('[data-action="new-admin"]');
    if (newAdminBtn) {
      newAdminBtn.addEventListener('click', () => {
        this.showAdminModal();
      });
    }

    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAdminSubmit(e.target);
      });
    }

    // Boutons d'édition et suppression d'admins
    document.querySelectorAll('[data-action="edit-admin"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const adminId = e.currentTarget.dataset.adminId;
        this.editAdmin(adminId);
      });
    });

    document.querySelectorAll('[data-action="delete-admin"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const adminId = e.currentTarget.dataset.adminId;
        this.deleteAdmin(adminId);
      });
    });

    // Boutons pour les polices
    const addGoogleFontBtn = document.querySelector('[data-action="add-google-font"]');
    if (addGoogleFontBtn) {
      addGoogleFontBtn.addEventListener('click', () => {
        this.showGoogleFontModal();
      });
    }

    const uploadFontForm = document.getElementById('uploadFontForm');
    if (uploadFontForm) {
      uploadFontForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUploadFont(e.target);
      });
    }

    const googleFontForm = document.getElementById('googleFontForm');
    if (googleFontForm) {
      googleFontForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddGoogleFont(e.target);
      });
    }

    // Boutons de suppression de police
    document.querySelectorAll('[data-action="delete-font"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fontId = e.currentTarget.dataset.fontId;
        this.handleDeleteFont(fontId);
      });
    });

    // Boutons pour les paramètres
    const editThemeBtn = document.querySelector('[data-action="edit-theme"]');
    if (editThemeBtn) {
      editThemeBtn.addEventListener('click', () => {
        this.showThemeModal();
      });
    }

    const themeForm = document.getElementById('themeForm');
    if (themeForm) {
      themeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleThemeSubmit(e.target);
      });
    }

    // Fermeture des modales
    document.querySelectorAll('[data-action="close-admin-modal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAdminModal();
      });
    });
  }

  showSectionModal() {
    const modal = document.getElementById('sectionModal');
    if (modal) {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  showAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('adminModalTitle').textContent = 'Nouvel administrateur';
      document.getElementById('adminForm').reset();
      document.getElementById('adminId').value = '';
    }
  }

  showGoogleFontModal() {
    const modal = document.getElementById('googleFontModal');
    if (modal) {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  closeGoogleFontModal() {
    const modal = document.getElementById('googleFontModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  showThemeModal() {
    const modal = document.getElementById('themeModal');
    if (modal) {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  closeThemeModal() {
    const modal = document.getElementById('themeModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  async handleThemeSubmit(form) {
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        this.closeThemeModal();
        // Recharger la section settings pour voir les changements
        await this.loadSection('settings');
        alert('Thème sauvegardé avec succès !');
      } else {
        const error = await response.text();
        alert('Erreur lors de la sauvegarde: ' + error);
      }
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
      alert('Erreur lors de la sauvegarde du thème');
    }
  }

  async handleUploadFont(form) {
    const formData = new FormData(form);

    try {
      const response = await fetch('/fonts/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Recharger la section fonts
        await this.loadSection('fonts');
      } else {
        const error = await response.text();
        alert('Erreur lors de l\'upload: ' + error);
      }
    } catch (error) {
      console.error('Erreur upload police:', error);
      alert('Erreur lors de l\'upload de la police');
    }
  }

  async handleAddGoogleFont(form) {
    const formData = new FormData(form);

    try {
      const response = await fetch('/fonts/google', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        this.closeGoogleFontModal();
        // Recharger la section fonts
        await this.loadSection('fonts');
      } else {
        const error = await response.text();
        alert('Erreur lors de l\'ajout: ' + error);
      }
    } catch (error) {
      console.error('Erreur ajout police Google:', error);
      alert('Erreur lors de l\'ajout de la police Google');
    }
  }

  async handleAdminSubmit(form) {
    const formData = new FormData(form);
    const adminId = formData.get('adminId');

    try {
      const url = adminId ? `/api/admins/${adminId}` : '/api/admins';
      const method = adminId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        this.closeAdminModal();
        await this.loadSection('admins');
      } else {
        const error = await response.text();
        alert('Erreur lors de la sauvegarde: ' + error);
      }
    } catch (error) {
      console.error('Erreur sauvegarde admin:', error);
      alert('Erreur lors de la sauvegarde de l\'admin');
    }
  }

  async editAdmin(adminId) {
    try {
      const response = await fetch(`/api/admins/${adminId}`);
      const admin = await response.json();

      // Remplir le formulaire
      document.getElementById('adminId').value = admin.id;
      document.getElementById('adminEmail').value = admin.email;
      document.getElementById('adminPassword').value = ''; // Ne pas pré-remplir le mot de passe
      document.getElementById('adminActive').checked = admin.is_active;

      document.getElementById('adminModalTitle').textContent = 'Modifier l\'administrateur';
      this.showAdminModal();
    } catch (error) {
      console.error('Erreur chargement admin:', error);
      alert('Erreur lors du chargement de l\'admin');
    }
  }

  async deleteAdmin(adminId) {
    if (!confirm('Voulez-vous vraiment supprimer cet administrateur ?')) return;

    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await this.loadSection('admins');
      } else {
        const error = await response.text();
        alert('Erreur lors de la suppression: ' + error);
      }
    } catch (error) {
      console.error('Erreur suppression admin:', error);
      alert('Erreur lors de la suppression de l\'admin');
    }
  }

  closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  bindColorPickers() {
    // Synchroniser les color inputs avec les text inputs
    document.querySelectorAll('.color-input').forEach(colorInput => {
      const textInput = colorInput.nextElementSibling;
      if (textInput && textInput.classList.contains('color-hex-input')) {
        // Initial sync
        textInput.value = colorInput.value.toUpperCase();

        // Listen for changes
        colorInput.addEventListener('input', () => {
          textInput.value = colorInput.value.toUpperCase();
        });

        textInput.addEventListener('input', () => {
          const hex = textInput.value;
          if (/^#[0-9A-F]{6}$/i.test(hex)) {
            colorInput.value = hex;
          }
        });
      }
    });
  }
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new AdminDashboard();
});