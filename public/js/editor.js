// Point d'entrée principal de l'éditeur
// Importe tous les modules nécessaires

// Les modules définissent des variables globales:
// - PreviewManager
// - FormGenerator
// - SectionManager
// - ElementManager

console.log('Éditeur chargé - modules disponibles:', {
  PreviewManager: typeof PreviewManager,
  FormGenerator: typeof FormGenerator,
  SectionManager: typeof SectionManager,
  ElementManager: typeof ElementManager
});

// Initialiser l'application éditeur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé, initialisation de l\'éditeur');

  // Vérifier que l'iframe existe
  const previewIframe = document.getElementById('preview-iframe');
  console.log('Iframe preview trouvé:', previewIframe);

  // Créer les instances des gestionnaires
  const previewManager = new PreviewManager();
  const formGenerator = new FormGenerator();
  const sectionManager = new SectionManager(previewManager);
  const elementManager = new ElementManager();

  // Exposer formGenerator et elementManager globalement
  window.formGenerator = formGenerator;
  window.elementManager = elementManager;

  // Initialiser l'application principale
  const editorApp = new EditorApp(previewManager, formGenerator, sectionManager, elementManager);

  // Donner accès à EditorApp pour les appels API
  sectionManager.editorApp = editorApp;
  elementManager.editorApp = editorApp;

  console.log('Éditeur initialisé avec modules modulaires');
});