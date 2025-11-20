import { query } from '../config/db.js';

/**
 * Contrôleur pour les paramètres généraux du site
 */

// Afficher la page des paramètres
export async function showSettings(req, res) {
  try {
    // Récupérer les paramètres généraux depuis la base de données
    // Pour l'instant, on utilise des valeurs par défaut
    const settings = {
      siteTitle: 'Batala Vitrine',
      siteDescription: 'Portfolio et vitrine professionnelle',
      contactEmail: 'contact@example.com',
      googleAnalytics: '',
      maintenanceMode: false,
      defaultLanguage: 'fr'
    };

    res.render('pages/settings', {
      title: 'Paramètres généraux',
      settings
    });
  } catch (error) {
    console.error('Erreur lors de l\'affichage des paramètres:', error);
    res.status(500).render('pages/error', {
      title: 'Erreur',
      message: 'Une erreur est survenue lors du chargement des paramètres.'
    });
  }
}

// Mettre à jour les paramètres
export async function updateSettings(req, res) {
  try {
    const {
      siteTitle,
      siteDescription,
      contactEmail,
      googleAnalytics,
      maintenanceMode,
      defaultLanguage
    } = req.body;

    // TODO: Sauvegarder dans la base de données
    // Pour l'instant, on simule la sauvegarde

    res.json({
      success: true,
      message: 'Paramètres sauvegardés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    res.status(500).json({
      error: 'Erreur lors de la sauvegarde des paramètres'
    });
  }
}