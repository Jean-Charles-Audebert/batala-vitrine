/**
 * Admin Content Controller
 * Fournit le contenu dynamique pour le dashboard admin
 */

import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Récupère le contenu de la section sections
 */
export const getSectionsContent = async (req, res) => {
  try {
    const { rows: sections } = await query(`
      SELECT
        id, type, title, position, is_visible,
        bg_color, bg_image, bg_video, is_transparent,
        layout, padding_top, padding_bottom,
        created_at, updated_at
      FROM sections
      ORDER BY position ASC NULLS LAST, id ASC
    `);

    const success = req.query.success || null;

    res.render('admin-content/sections', {
      sections,
      success,
      layout: false // Pas de layout, juste le contenu partiel
    });
  } catch (error) {
    logger.error('Erreur récupération contenu sections', error);
    res.status(500).json({ error: 'Erreur lors du chargement des sections' });
  }
};

/**
 * Récupère le contenu de la section admins
 */
export const getAdminsContent = async (req, res) => {
  try {
    const { rows: admins } = await query("SELECT id, email, is_active, created_at FROM admins");
    const success = req.query.success || null;

    res.render('admin-content/admins', {
      admins,
      success,
      layout: false
    });
  } catch (error) {
    logger.error('Erreur récupération contenu admins', error);
    res.status(500).json({ error: 'Erreur lors du chargement des admins' });
  }
};

/**
 * Récupère le contenu de la section polices
 */
export const getFontsContent = async (req, res) => {
  try {
    const { rows: fonts } = await query(
      'SELECT * FROM fonts ORDER BY source, name',
      []
    );

    res.render('admin-content/fonts', {
      fonts,
      layout: false
    });
  } catch (error) {
    logger.error('Erreur récupération contenu polices', error);
    res.status(500).json({ error: 'Erreur lors du chargement des polices' });
  }
};

/**
 * Récupère le contenu de la section paramètres
 */
export const getSettingsContent = async (req, res) => {
  try {
    // Récupérer les paramètres globaux depuis la base de données
    // Pour l'instant, on utilise des valeurs par défaut
    const settings = {
      // Couleurs globales
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      accentColor: '#28a745',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      mutedTextColor: '#666666',

      // Polices globales
      titleFontId: null,
      subtitleFontId: null,
      bodyFontId: null,

      // Layout global
      maxWidth: '1200px',
      borderRadius: '8px',
      shadow: 'medium',

      // Paramètres généraux
      siteTitle: 'Batala Vitrine',
      siteDescription: 'Portfolio et vitrine professionnelle',
      contactEmail: 'contact@example.com',
      googleAnalytics: '',
      maintenanceMode: false,
      defaultLanguage: 'fr'
    };

    // Récupérer les polices pour les sélecteurs
    const { rows: fonts } = await query('SELECT id, name, source, font_family FROM fonts ORDER BY source, name');

    res.render('admin-content/settings', {
      settings,
      fonts,
      layout: false
    });
  } catch (error) {
    logger.error('Erreur récupération contenu paramètres', error);
    res.status(500).json({ error: 'Erreur lors du chargement des paramètres' });
  }
};

/**
 * Met à jour les paramètres globaux
 */
export const updateSettingsContent = async (req, res) => {
  try {
    // Pour l'instant, on simule la sauvegarde
    // TODO: Sauvegarder dans la base de données
    const settings = req.body;

    // Validation basique
    if (!settings.siteTitle || !settings.contactEmail) {
      return res.status(400).json({ error: 'Titre du site et email de contact sont requis' });
    }

    // Ici, on pourrait sauvegarder dans une table settings
    // Pour l'instant, on retourne succès
    res.json({
      success: true,
      message: 'Paramètres sauvegardés avec succès'
    });
  } catch (error) {
    logger.error('Erreur sauvegarde paramètres', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde des paramètres' });
  }
};

/**
 * Crée un nouvel admin (wrapper API)
 */
export const createAdminApi = async (req, res) => {
  try {
    const { email, password, is_active } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Importer hashPassword
    const { hashPassword } = await import('../utils/password.js');
    const passwordHash = await hashPassword(password);
    
    await query(
      "INSERT INTO admins (email, password_hash, is_active, created_by) VALUES ($1, $2, $3, $4)",
      [email, passwordHash, is_active === 'on' || is_active === true, req.user?.sub || 1]
    );

    res.json({ success: true, message: 'Admin créé avec succès' });
  } catch (error) {
    console.error('Erreur création admin API:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'admin' });
  }
};

/**
 * Met à jour un admin (wrapper API)
 */
export const updateAdminApi = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, is_active } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Importer hashPassword
    const { hashPassword } = await import('../utils/password.js');
    
    if (password) {
      const passwordHash = await hashPassword(password);
      await query(
        "UPDATE admins SET email=$1, password_hash=$2, is_active=$3 WHERE id=$4",
        [email, passwordHash, is_active === 'on' || is_active === true, id]
      );
    } else {
      await query(
        "UPDATE admins SET email=$1, is_active=$2 WHERE id=$3",
        [email, is_active === 'on' || is_active === true, id]
      );
    }

    res.json({ success: true, message: 'Admin modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification admin API:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'admin' });
  }
};

/**
 * Supprime un admin (wrapper API)
 */
export const deleteAdminApi = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM admins WHERE id=$1", [id]);
    res.json({ success: true, message: 'Admin supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression admin API:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'admin' });
  }
};