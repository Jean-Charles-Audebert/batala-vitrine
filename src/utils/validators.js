/**
 * Validators pour la validation et transformation des données
 */
import { FOOTER_ELEMENT_TYPES } from "../constants.js";

/**
 * Valide et construit le contenu JSON d'un élément footer selon son type
 * @param {string} type - Type d'élément (text, contact, social)
 * @param {Object} body - Corps de la requête contenant les champs
 * @returns {Object} - Contenu JSON structuré
 * @throws {Error} - Si le type est invalide
 */
export function validateAndBuildFooterContent(type, body) {
  const validTypes = Object.values(FOOTER_ELEMENT_TYPES);
  
  if (!validTypes.includes(type)) {
    throw new Error(`Type invalide. Types acceptés: ${validTypes.join(', ')}`);
  }
  
  let content = {};
  
  switch (type) {
    case FOOTER_ELEMENT_TYPES.TEXT:
      content = {
        title: body.text_title || '',
        text: body.text_content || ''
      };
      break;
      
    case FOOTER_ELEMENT_TYPES.CONTACT:
      content = {
        title: body.contact_title || '',
        email: body.contact_email || '',
        phone: body.contact_phone || '',
        address: body.contact_address || ''
      };
      break;
      
    case FOOTER_ELEMENT_TYPES.SOCIAL: {
      // Parser les liens sociaux depuis les champs multiples
      const platforms = body.social_platform || [];
      const urls = body.social_url || [];
      const links = [];
      
      // Convertir en array si ce n'est pas déjà le cas
      const platformArray = Array.isArray(platforms) ? platforms : [platforms];
      const urlArray = Array.isArray(urls) ? urls : [urls];
      
      for (let i = 0; i < platformArray.length; i++) {
        if (platformArray[i] && urlArray[i]) {
          links.push({
            platform: platformArray[i],
            url: urlArray[i]
          });
        }
      }
      
      content = {
        title: body.social_title || '',
        links
      };
      break;
    }
  }
  
  return content;
}

/**
 * Valide les champs requis pour un bloc
 * @param {Object} data - Données du bloc
 * @param {string} blockType - Type de bloc (header, hero, cards, footer)
 * @returns {Object|null} - null si valide, sinon { error: string }
 */
export function validateBlockData(data, blockType) {
  if (blockType === 'header') {
    if (!data.header_title) {
      return { error: "Le titre du site est requis pour le header" };
    }
  } else {
    if (!data.type || !data.title || !data.slug) {
      return { error: "Type, titre et slug requis" };
    }
  }
  
  return null;
}

/**
 * Valide les champs requis pour une carte
 * @param {Object} data - Données de la carte
 * @returns {Object|null} - null si valide, sinon { error: string }
 */
export function validateCardData(data) {
  if (!data.title) {
    return { error: "Le titre est requis" };
  }
  
  return null;
}
