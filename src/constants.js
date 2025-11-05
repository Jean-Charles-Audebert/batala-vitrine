/**
 * Constantes globales de l'application
 * Regroupe tous les magic strings, types énumérés et présets de configuration
 */

// Types de blocs
export const BLOCK_TYPES = {
  HEADER: "header",
  HERO: "hero",
  CARDS: "cards",
  FOOTER: "footer",
};

// Types d'éléments de footer
export const FOOTER_ELEMENT_TYPES = {
  TEXT: "text",
  CONTACT: "contact",
  SOCIAL: "social",
};

// Présets d'optimisation d'images
export const IMAGE_PRESETS = {
  logo: {
    width: 200,
    height: 200,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
  background: {
    width: 1920,
    height: 1080,
    fit: "cover",
  },
  card: {
    width: 400,
    height: 300,
    fit: "cover",
  },
  thumbnail: {
    width: 150,
    height: 150,
    fit: "cover",
  },
};

// Formats d'images valides
export const VALID_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

// Taille maximale d'upload (5 MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Messages de succès
export const SUCCESS_MESSAGES = {
  BLOCK_CREATED: "Bloc créé avec succès",
  BLOCK_UPDATED: "Bloc modifié avec succès",
  BLOCK_DELETED: "Bloc supprimé avec succès",
  CARD_CREATED: "Carte créée avec succès",
  CARD_UPDATED: "Carte modifiée avec succès",
  CARD_DELETED: "Carte supprimée avec succès",
  FOOTER_ELEMENT_CREATED: "Élément de footer créé avec succès",
  FOOTER_ELEMENT_UPDATED: "Élément de footer modifié avec succès",
  FOOTER_ELEMENT_DELETED: "Élément de footer supprimé avec succès",
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  BLOCK_NOT_FOUND: "Bloc non trouvé",
  CARD_NOT_FOUND: "Carte non trouvée",
  FOOTER_ELEMENT_NOT_FOUND: "Élément de footer non trouvé",
  INVALID_TYPE: "Type invalide",
  INVALID_IMAGE_FORMAT: "Format d'image non supporté",
  FILE_TOO_LARGE: "Fichier trop volumineux",
  UPLOAD_FAILED: "Échec de l'upload",
  DATABASE_ERROR: "Erreur base de données",
  UNAUTHORIZED: "Non autorisé",
};
