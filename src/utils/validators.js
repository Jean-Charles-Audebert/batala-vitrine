/**
 * Validators pour la validation et transformation des données
 */
import { FOOTER_ELEMENT_TYPES } from "../constants.js";

/**
 * Valide et construit le contenu JSON d'un élément footer selon son type
 * @param {string} type - Type d'élément (text, contact, social, link)
 * @param {Object} body - Corps de la requête contenant les champs
 * @returns {Object} - Contenu JSON structuré
 * @throws {Error} - Si le type est invalide ou si des champs requis manquent
 */
export function validateAndBuildFooterContent(type, body) {
  const validTypes = Object.values(FOOTER_ELEMENT_TYPES);
  
  if (!validTypes.includes(type)) {
    throw new Error(`Type invalide. Types acceptés: ${validTypes.join(', ')}`);
  }
  
  let content = {};
  
  switch (type) {
    case FOOTER_ELEMENT_TYPES.TEXT:
      if (!body.about_content || !body.about_content.trim()) {
        throw new Error("Le contenu de la section À propos est requis");
      }
      content = {
        about_title: body.about_title || 'À propos de nous',
        about_content: body.about_content.trim()
      };
      break;
      
    case FOOTER_ELEMENT_TYPES.CONTACT:
      content = {
        email: body.contact_email ? body.contact_email.trim() : '',
        phone: body.contact_phone ? body.contact_phone.trim() : '',
        address: body.contact_address ? body.contact_address.trim() : ''
      };
      break;
      
    case FOOTER_ELEMENT_TYPES.SOCIAL: {
      const network = body.social_network;
      const url = body.social_url;
      
      if (!network || !url) {
        throw new Error("Plateforme et URL sont requis pour un réseau social");
      }
      
      content = {
        links: [{
          network: network.trim(),
          url: url.trim()
        }]
      };
      break;
    }
      
    case FOOTER_ELEMENT_TYPES.LINK: {
      const label = body.link_label;
      const url = body.link_url;
      
      if (!label || !url) {
        throw new Error("Libellé et URL sont requis pour un lien externe");
      }
      
      content = {
        label: label.trim(),
        url: url.trim()
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
