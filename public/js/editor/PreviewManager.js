/**
 * Gestionnaire d'aperçu pour l'éditeur
 * Gère le chargement et la mise à jour de l'iframe d'aperçu
 */

class PreviewManager {
  constructor() {
    this.iframe = null;
    this.fontsData = window.fontsData || [];
  }

  init() {
    console.log('PreviewManager.init() appelé');
    this.iframe = document.getElementById('preview-iframe');
    console.log('Iframe trouvé:', !!this.iframe);
    
    if (this.iframe) {
      console.log('Chargement immédiat de l\'aperçu');
      this.iframe.src = '/api/preview';
      this.iframe.onload = () => {
        console.log('Aperçu chargé avec succès');
      };
      this.iframe.onerror = (e) => {
        console.error('Erreur de chargement de l\'aperçu:', e);
      };
    } else {
      console.error('Iframe non trouvé dans le DOM');
    }
  }

  loadPreview() {
    const iframe = this.iframe;
    const previewFrame = document.getElementById('preview-frame');

    console.log('loadPreview() appelé, iframe:', iframe, 'previewFrame:', previewFrame);

    // Test simple : charger directement l'URL dans l'iframe
    console.log('Définition de iframe.src = /api/preview');
    iframe.src = '/api/preview';

    // Attendre que l'iframe soit chargé puis injecter les polices
    iframe.onload = () => {
      console.log('Iframe chargé avec succès - contenu réel de l\'API');
      setTimeout(() => {
        this.injectFontsIntoIframe();
        this.hideLoadingPlaceholder();
        iframe.style.display = 'block';
      }, 500);
    };

    iframe.onerror = (error) => {
      console.error('Erreur de chargement de l\'iframe:', error);
    };
  }

  /**
   * Injecte ou met à jour les polices dans l'iframe de prévisualisation
   * @param {number} titleFontId - ID de la police pour les titres (optionnel, sinon prend depuis le select)
   * @param {number} textFontId - ID de la police pour le texte (optionnel, sinon prend depuis le select)
   */
  injectFontsIntoIframe(titleFontId = null, textFontId = null) {
    if (!this.iframe) return;

    try {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      if (!iframeDoc) return;

      // Récupérer les IDs depuis les selects si non fournis
      if (titleFontId === null) {
        const titleFontSelect = document.getElementById('page-title-font-id');
        titleFontId = titleFontSelect ? titleFontSelect.value : null;
      }
      if (textFontId === null) {
        const textFontSelect = document.getElementById('page-text-font-id');
        textFontId = textFontSelect ? textFontSelect.value : null;
      }

      const fontsData = this.fontsData || window.fontsData || [];
      
      let titleFontFamily = 'Arial, sans-serif';
      let textFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Supprimer les anciens liens de polices
      const existingTitleLink = iframeDoc.getElementById('dynamic-title-font-link');
      const existingTextLink = iframeDoc.getElementById('dynamic-text-font-link');
      if (existingTitleLink) existingTitleLink.remove();
      if (existingTextLink) existingTextLink.remove();

      // Trouver et appliquer les polices
      fontsData.forEach(font => {
        if (!font.font_family) return;

        if (titleFontId == font.id) {
          titleFontFamily = `"${font.font_family}", sans-serif`;
          if (font.url) {
            const titleLink = iframeDoc.createElement('link');
            titleLink.id = 'dynamic-title-font-link';
            titleLink.rel = 'stylesheet';
            titleLink.href = font.url;
            iframeDoc.head.appendChild(titleLink);
          }
        }
        
        if (textFontId == font.id) {
          textFontFamily = `"${font.font_family}", sans-serif`;
          if (font.url) {
            const textLink = iframeDoc.createElement('link');
            textLink.id = 'dynamic-text-font-link';
            textLink.rel = 'stylesheet';
            textLink.href = font.url;
            iframeDoc.head.appendChild(textLink);
          }
        }
      });

      // Créer ou mettre à jour la feuille de style dynamique
      let styleElement = iframeDoc.getElementById('dynamic-font-styles');
      if (!styleElement) {
        styleElement = iframeDoc.createElement('style');
        styleElement.id = 'dynamic-font-styles';
        iframeDoc.head.appendChild(styleElement);
      }

      styleElement.textContent = `
        .hero-title, .section-title, h1, h2, h3, h4, h5, h6 {
          font-family: ${titleFontFamily} !important;
        }
        body, p, .section-text, .hero-text {
          font-family: ${textFontFamily} !important;
        }
      `;
    } catch (error) {
      console.warn('Impossible d\'injecter les polices dans l\'iframe:', error);
    }
  }

  // Alias pour compatibilité
  updatePreviewFonts(titleFontId = null, textFontId = null) {
    this.injectFontsIntoIframe(titleFontId, textFontId);
  }

  updatePreviewDevice(device) {
    const iframe = this.iframe;
    if (!iframe) return;

    // Supprimer les classes existantes
    iframe.classList.remove('desktop', 'tablet', 'mobile');

    // Ajouter la nouvelle classe
    if (device !== 'desktop') {
      iframe.classList.add(device);
    }
  }

  /**
   * Met à jour l'aperçu avec de nouveaux paramètres en temps réel
   * @param {Object} settings - Les paramètres à appliquer
   */
  updatePreviewSettings(settings) {
    if (!this.iframe) return;

    try {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      if (!iframeDoc) return;

      // Appliquer les polices si elles ont changé
      if (settings.titleFontId !== undefined || settings.textFontId !== undefined) {
        this.applyFontsToPreview(settings.titleFontId, settings.textFontId, iframeDoc);
      }

      // Appliquer les couleurs d'arrière-plan si elles ont changé
      if (settings.bg_color !== undefined) {
        this.applyBackgroundToPreview(settings.bg_color, iframeDoc);
      }

      console.log('Aperçu mis à jour avec les paramètres:', settings);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'aperçu:', error);
    }
  }

  /**
   * Applique les polices à l'aperçu (utilise la méthode unifiée)
   */
  applyFontsToPreview(titleFontId, textFontId) {
    this.injectFontsIntoIframe(titleFontId, textFontId);
  }

  /**
   * Applique la couleur d'arrière-plan à l'aperçu
   */
  applyBackgroundToPreview(bgColor, iframeDoc) {
    const body = iframeDoc.body;
    if (body && bgColor) {
      body.style.backgroundColor = bgColor;
    }
  }

  refresh() {
    if (this.iframe) {
      // Recharger l'iframe pour obtenir les dernières données
      this.iframe.src = this.iframe.src;
    }
  }

  hideLoadingPlaceholder() {
    const placeholder = document.getElementById('loading-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  }
}

// Exporter pour utilisation globale
window.PreviewManager = PreviewManager;