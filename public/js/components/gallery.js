// JavaScript pour le composant Gallery
class GalleryComponent {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.init();
  }

  init() {
    this.bindColorPickerSync();
  }

  bindColorPickerSync() {
    const colorInput = document.getElementById(`titleColor-${this.sectionId}`);
    const textInput = colorInput?.parentNode?.querySelector('.color-hex-input');

    if (colorInput && textInput) {
      colorInput.addEventListener('input', () => {
        textInput.value = colorInput.value;
      });
    }
  }
}

// Initialiser le composant pour chaque section gallery
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-section-id]').forEach(section => {
    const sectionId = section.dataset.sectionId;
    if (section.classList.contains('section-gallery')) {
      new GalleryComponent(sectionId);
    }
  });
});