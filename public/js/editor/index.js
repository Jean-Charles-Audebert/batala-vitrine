/**
 * Point d'entrée principal de l'éditeur
 * Initialise tous les gestionnaires et lie les événements
 */

class EditorApp {
  constructor() {
    this.previewManager = null;
    this.formGenerator = null;
    this.sectionManager = null;
    this.pageData = window.pageData || {};
  }

  init() {
    console.log('Éditeur initialisé');

    // Initialiser les gestionnaires
    this.previewManager = new PreviewManager();
    this.formGenerator = new FormGenerator();
    this.sectionManager = new SectionManager();

    // Initialiser l'aperçu
    this.previewManager.init();

    // Initialiser le gestionnaire de sections
    this.sectionManager.init();

    // Lier les événements globaux
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    // Gestionnaire d'événements pour les onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tabName = this.dataset.tab;

        // Masquer tous les onglets
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });

        // Afficher l'onglet sélectionné
        document.getElementById(tabName + '-tab').classList.add('active');
        this.classList.add('active');
      });
    });

    // Gestionnaire pour le bouton de sauvegarde
    document.getElementById('save-btn')?.addEventListener('click', () => {
      this.savePage();
    });

    // Gestionnaire pour les contrôles de périphérique
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (this.previewManager) {
          this.previewManager.updatePreviewDevice(this.dataset.device);
        }
      });
    });

    // Gestionnaire pour le media picker du fond
    document.querySelector('.select-bg-media')?.addEventListener('click', () => {
      if (window.openMediaPicker) {
        window.openMediaPicker((mediaUrl) => {
          document.getElementById('page-main-bg-media-url').value = mediaUrl;
        }, 'both', 'main_bg_media_url');
      }
    });

    // Gestionnaire pour vider le média de fond
    document.querySelector('.clear-bg-media')?.addEventListener('click', function() {
      document.getElementById('page-main-bg-media-url').value = '';
      this.style.display = 'none';
    });

    // Gestionnaire pour le bouton gérer les polices
    document.querySelector('.manage-fonts-btn')?.addEventListener('click', function() {
      // Ouvrir une nouvelle fenêtre ou onglet vers la gestion des polices
      window.open('/admin/fonts', '_blank');
    });

    // Gestionnaire pour les changements de polices (aperçu en temps réel)
    document.getElementById('page-title-font-id')?.addEventListener('change', () => {
      if (this.previewManager) {
        this.previewManager.updatePreviewFonts();
      }
    });

    document.getElementById('page-text-font-id')?.addEventListener('change', () => {
      if (this.previewManager) {
        this.previewManager.updatePreviewFonts();
      }
    });
  }

  async savePage() {
    const pageData = {
      title: document.getElementById('page-title').value,
      contact_email: document.getElementById('page-contact-email').value,
      main_bg_color: document.getElementById('page-main-bg-color').value,
      main_bg_media_url: document.getElementById('page-main-bg-media-url').value,
      main_bg_youtube_url: document.getElementById('page-main-bg-youtube-url').value,
      main_bg_opacity: parseFloat(document.getElementById('page-main-bg-opacity').value),
      main_bg_position: document.getElementById('page-main-bg-position').value,
      title_font_id: document.getElementById('page-title-font-id').value ? parseInt(document.getElementById('page-title-font-id').value) : null,
      text_font_id: document.getElementById('page-text-font-id').value ? parseInt(document.getElementById('page-text-font-id').value) : null
    };

    try {
      const response = await fetch('/api/page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const data = await response.json();
      console.log('Page sauvegardée:', data);
      alert('Page sauvegardée avec succès!');
      // Recharger l'aperçu pour refléter les changements
      if (this.previewManager) {
        this.previewManager.loadPreview();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  window.editorApp = new EditorApp();
  window.editorApp.init();
});