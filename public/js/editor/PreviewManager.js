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
    this.iframe = document.getElementById('preview-iframe');
    this.loadPreview();
  }

  loadPreview() {
    const iframe = this.iframe;
    const previewFrame = document.getElementById('preview-frame');

    // Afficher le placeholder de chargement
    iframe.style.display = 'none';
    previewFrame.insertAdjacentHTML('beforeend', '<div class="preview-placeholder" id="loading-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Chargement de l\'aperçu...</p></div>');

    // Définir directement la source de l'iframe vers la route d'aperçu
    iframe.src = '/api/preview';

    // Attendre que l'iframe soit chargé puis injecter les polices
    iframe.onload = () => {
      setTimeout(() => {
        this.injectFontsIntoIframe();
        this.hideLoadingPlaceholder();
        iframe.style.display = 'block';
      }, 500);
    };
  }

  injectFontsIntoIframe() {
    try {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      if (!iframeDoc) return;

      // Récupérer les polices sélectionnées dans les selects
      const titleFontId = document.getElementById('page-title-font-id').value;
      const textFontId = document.getElementById('page-text-font-id').value;

      let titleFontFamily = 'Arial, sans-serif';
      let textFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Supprimer les anciens liens de polices
      const existingTitleLink = iframeDoc.getElementById('dynamic-title-font-link');
      const existingTextLink = iframeDoc.getElementById('dynamic-text-font-link');
      if (existingTitleLink) existingTitleLink.remove();
      if (existingTextLink) existingTextLink.remove();

      // Trouver les polices et ajouter les liens si nécessaire
      if (this.fontsData && this.fontsData.length > 0) {
        this.fontsData.forEach(font => {
          if (font.font_family) {
            if (titleFontId == font.id) {
              titleFontFamily = font.font_family;
              if (font.font_url) {
                const titleLink = iframeDoc.createElement('link');
                titleLink.id = 'dynamic-title-font-link';
                titleLink.rel = 'stylesheet';
                titleLink.href = font.font_url;
                iframeDoc.head.appendChild(titleLink);
              }
            }
            if (textFontId == font.id) {
              textFontFamily = font.font_family;
              if (font.font_url) {
                const textLink = iframeDoc.createElement('link');
                textLink.id = 'dynamic-text-font-link';
                textLink.rel = 'stylesheet';
                textLink.href = font.font_url;
                iframeDoc.head.appendChild(textLink);
              }
            }
          }
        });
      }

      // Injecter les variables CSS de polices dans l'iframe
      const style = iframeDoc.createElement('style');
      style.textContent = `
        :root {
          --font-family-title: ${titleFontFamily};
          --font-family-text: ${textFontFamily};
        }
      `;
      iframeDoc.head.appendChild(style);

      // Injecter aussi les styles des polices individuelles
      if (this.fontsData && this.fontsData.length > 0) {
        this.fontsData.forEach(font => {
          if (font.font_family) {
            const fontStyle = iframeDoc.createElement('style');
            fontStyle.textContent = `
              .font-${font.id} {
                font-family: ${font.font_family} !important;
              }
            `;
            iframeDoc.head.appendChild(fontStyle);
          }
        });
      }
    } catch (error) {
      console.warn('Impossible d\'injecter les polices dans l\'iframe:', error);
    }
  }

  updatePreviewFonts() {
    if (!this.iframe || this.iframe.style.display === 'none') return;

    try {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      if (!iframeDoc) return;

      // Récupérer les polices sélectionnées dans les selects
      const titleFontId = document.getElementById('page-title-font-id').value;
      const textFontId = document.getElementById('page-text-font-id').value;

      let titleFontFamily = 'Arial, sans-serif';
      let textFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Supprimer les anciens liens de polices
      const existingTitleLink = iframeDoc.getElementById('dynamic-title-font-link');
      const existingTextLink = iframeDoc.getElementById('dynamic-text-font-link');
      if (existingTitleLink) existingTitleLink.remove();
      if (existingTextLink) existingTextLink.remove();

      // Trouver les polices et ajouter les liens si nécessaire
      if (this.fontsData && this.fontsData.length > 0) {
        this.fontsData.forEach(font => {
          if (font.font_family) {
            if (titleFontId == font.id) {
              titleFontFamily = font.font_family;
              if (font.font_url) {
                const titleLink = iframeDoc.createElement('link');
                titleLink.id = 'dynamic-title-font-link';
                titleLink.rel = 'stylesheet';
                titleLink.href = font.font_url;
                iframeDoc.head.appendChild(titleLink);
              }
            }
            if (textFontId == font.id) {
              textFontFamily = font.font_family;
              if (font.font_url) {
                const textLink = iframeDoc.createElement('link');
                textLink.id = 'dynamic-text-font-link';
                textLink.rel = 'stylesheet';
                textLink.href = font.font_url;
                iframeDoc.head.appendChild(textLink);
              }
            }
          }
        });
      }

      // Supprimer l'ancien style de polices s'il existe
      const existingStyle = iframeDoc.getElementById('dynamic-font-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Injecter les nouvelles variables CSS de polices
      const style = iframeDoc.createElement('style');
      style.id = 'dynamic-font-styles';
      style.textContent = `
        :root {
          --font-family-title: ${titleFontFamily};
          --font-family-text: ${textFontFamily};
        }
      `;
      iframeDoc.head.appendChild(style);
    } catch (error) {
      console.warn('Impossible de mettre à jour les polices dans l\'iframe:', error);
    }
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

  hideLoadingPlaceholder() {
    const placeholder = document.getElementById('loading-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  }
}

// Exporter pour utilisation globale
window.PreviewManager = PreviewManager;