/**
 * Helper pour la gestion centralisée des erreurs dans les controllers
 */
import { logger } from "./logger.js";

/**
 * Wrapper async pour les controllers Express avec gestion d'erreur centralisée
 * @param {Function} fn - La fonction controller async
 * @returns {Function} - Fonction middleware Express
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Gère les erreurs de controller de manière standardisée
 * @param {Error} error - L'erreur capturée
 * @param {Object} res - Objet response Express
 * @param {string} logMessage - Message pour les logs
 * @param {string} userMessage - Message pour l'utilisateur
 * @param {string} redirectUrl - URL de redirection en cas d'erreur
 */
export function handleControllerError(error, res, logMessage, userMessage, redirectUrl) {
  logger.error(logMessage, error);
  
  if (redirectUrl) {
    return res.redirect(`${redirectUrl}?error=${encodeURIComponent(userMessage)}`);
  }
  
  return res.status(500).json({
    success: false,
    message: userMessage
  });
}

/**
 * Wrapper pour actions CRUD standardisées avec gestion d'erreurs et redirections
 * Factorise le pattern try/catch + redirect utilisé dans tous les controllers
 * 
 * @param {Function} action - Fonction async qui effectue l'action DB (reçoit req, res)
 * @param {Object} options - Configuration de l'action
 * @param {string} options.successMessage - Message de succès
 * @param {string} options.errorMessage - Message d'erreur pour l'utilisateur
 * @param {string} options.logContext - Contexte pour les logs
 * @param {string} [options.redirectOnSuccess='/'] - URL de redirection en cas de succès
 * @param {string|Function} [options.redirectOnError] - URL ou fonction(req) => url pour redirection erreur
 * @returns {Function} - Fonction middleware Express
 */
export function crudActionWrapper(action, options) {
  const {
    successMessage,
    errorMessage,
    logContext,
    redirectOnSuccess = '/',
    redirectOnError
  } = options;

  return async (req, res) => {
    try {
      // Exécuter l'action (peut retourner des données ou void)
      await action(req, res);
      
      // Si l'action a déjà envoyé une réponse (ex: render), ne rien faire
      if (res.headersSent) {
        return;
      }
      
      // Redirection de succès
      res.redirect(`${redirectOnSuccess}?success=${encodeURIComponent(successMessage)}`);
    } catch (error) {
      logger.error(`[${logContext}] ${errorMessage}`, error);
      
      // Si l'action a déjà envoyé une réponse, ne rien faire
      if (res.headersSent) {
        return;
      }
      
      // Déterminer l'URL de redirection erreur
      let errorUrl = redirectOnError;
      if (typeof redirectOnError === 'function') {
        errorUrl = redirectOnError(req);
      }
      
      if (errorUrl) {
        res.redirect(`${errorUrl}?error=${encodeURIComponent(errorMessage)}`);
      } else {
        res.status(500).json({
          success: false,
          message: errorMessage
        });
      }
    }
  };
}

/**
 * Valide que les champs requis sont présents
 * @param {Object} data - Les données à valider
 * @param {Array<string>} requiredFields - Liste des champs requis
 * @returns {Object|null} - { valid: false, missing: [...] } ou null si valide
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing
    };
  }
  
  return null;
}
