// JavaScript pour le composant Color Picker
class ColorPickerComponent {
  constructor(fieldId) {
    this.fieldId = fieldId;
    this.init();
  }

  init() {
    this.bindSync();
  }

  bindSync() {
    const colorInput = document.getElementById(this.fieldId);
    const displayId = `${this.fieldId}_display`;
    const textInput = document.getElementById(displayId);

    if (colorInput && textInput) {
      colorInput.addEventListener('input', () => {
        textInput.value = colorInput.value;
      });
    }
  }
}

// Initialiser automatiquement tous les color pickers sur la page
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.color-input').forEach(colorInput => {
    if (colorInput.id) {
      new ColorPickerComponent(colorInput.id);
    }
  });
});