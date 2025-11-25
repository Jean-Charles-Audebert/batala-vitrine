// Point d'entrée principal de l'éditeur
// Importe tous les modules nécessaires

// Les modules définissent des variables globales:
// - PreviewManager
// - FormGenerator
// - SectionManager

console.log('Éditeur chargé - modules disponibles:', {
  PreviewManager: typeof PreviewManager,
  FormGenerator: typeof FormGenerator,
  SectionManager: typeof SectionManager
});

// Initialiser l'application éditeur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  // Créer les instances des gestionnaires
  const previewManager = new PreviewManager();
  const formGenerator = new FormGenerator();
  const sectionManager = new SectionManager();

  // Initialiser l'application principale
  const editorApp = new EditorApp(previewManager, formGenerator, sectionManager);

  console.log('Éditeur initialisé avec modules modulaires');
});