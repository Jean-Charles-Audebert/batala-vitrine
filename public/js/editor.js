// Point d'entrée principal de l'éditeur (Module ESM)
// Importe EditorApp et initialise l'éditeur

import { EditorApp } from './editor/EditorApp.js';

// Les modules sont chargés comme scripts classiques et définissent des variables globales:
// - PreviewManager
// - FormGenerator
// - SectionManager
// - ElementManager
// - SidebarManager
// - ElementCreator
// - SectionFormManager
// - ElementFormManager

console.log('Éditeur chargé - modules disponibles:', {
  PreviewManager: typeof window.PreviewManager,
  FormGenerator: typeof window.FormGenerator,
  SectionManager: typeof window.SectionManager,
  ElementManager: typeof window.ElementManager,
  SidebarManager: typeof window.SidebarManager,
  ElementCreator: typeof window.ElementCreator,
  SectionFormManager: typeof window.SectionFormManager,
  ElementFormManager: typeof window.ElementFormManager
});

// Initialiser l'application éditeur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé, initialisation de l\'éditeur');

  // Vérifier que l'iframe existe
  const previewIframe = document.getElementById('preview-iframe');
  console.log('Iframe preview trouvé:', previewIframe);

  // Créer les instances des gestionnaires
  const previewManager = new window.PreviewManager();
  const formGenerator = new window.FormGenerator();
  const sectionManager = new window.SectionManager(previewManager);
  const elementManager = new window.ElementManager();
  const sidebarManager = new window.SidebarManager();
  const elementCreator = new window.ElementCreator();
  const sectionFormManager = new window.SectionFormManager(window.sectionSchemas || {});
  const elementFormManager = new window.ElementFormManager(window.elementSchemas || {});

  // Exposer les managers globalement
  window.formGenerator = formGenerator;
  window.elementManager = elementManager;
  window.sidebarManager = sidebarManager;
  window.elementCreator = elementCreator;
  window.sectionFormManager = sectionFormManager;
  window.elementFormManager = elementFormManager;

  // Initialiser l'application principale
  const editorApp = new EditorApp(previewManager, formGenerator, sectionManager, elementManager);

  // Exposer EditorApp et les utilitaires globalement
  window.editorApp = editorApp;

  // Donner accès à EditorApp pour les appels API
  sectionManager.editorApp = editorApp;
  elementManager.editorApp = editorApp;

  console.log('Éditeur initialisé avec modules modulaires - v2 hiérarchie imbriquée');
});