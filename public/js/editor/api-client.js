/**
 * API Client - Wrapper pour tous les appels API
 * Gère les erreurs 401 (token expiré) et redirige vers le login
 */

/* global fetch */

class APIClient {
  /**
   * Effectuer un appel API avec gestion automatique des erreurs 401
   */
  static async fetch(url, options = {}) {
    try {
      const response = await window.__originalFetch(url, options);

      // Si token expiré (401), rediriger vers login
      if (response.status === 401) {
        console.warn('Token expiré, redirection vers le login...');
        window.location.href = '/auth/login';
        return null;
      }

      // Sinon retourner la réponse normalement
      return response;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  /**
   * Effectuer un appel API et récupérer le JSON
   */
  static async fetchJSON(url, options = {}) {
    const response = await this.fetch(url, options);
    if (!response) return null; // 401 - redirection en cours
    return response.json();
  }

  /**
   * Effectuer un appel GET
   */
  static async get(url) {
    return this.fetch(url);
  }

  /**
   * Effectuer un appel POST
   */
  static async post(url, data) {
    return this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  /**
   * Effectuer un appel PUT
   */
  static async put(url, data) {
    return this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  /**
   * Effectuer un appel DELETE
   */
  static async delete(url) {
    return this.fetch(url, {
      method: 'DELETE',
    });
  }
}

// Remplacer fetch globalement pour intercepter toutes les requêtes
if (typeof window !== 'undefined') {
  // Sauvegarder le fetch original
  window.__originalFetch = window.fetch;

  // Remplacer fetch par notre wrapper
  window.fetch = function(...args) {
    const [url, options] = args;
    
    // Appel API via notre client
    return APIClient.fetch(url, options);
  };
}
