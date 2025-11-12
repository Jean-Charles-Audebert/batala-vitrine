import { query } from '../config/db.js';
import { crudActionWrapper } from '../utils/controllerHelpers.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants.js';
import { unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Liste toutes les polices
 */
export const listFonts = async (req, res) => {
  try {
    const { rows: fonts } = await query(
      'SELECT * FROM fonts ORDER BY source, name',
      []
    );
    res.render('pages/fonts', {
      title: 'Gestion des polices',
      fonts
    });
  } catch (error) {
    console.error('Erreur listFonts:', error);
    res.status(500).send('Erreur lors du chargement des polices');
  }
};

/**
 * Afficher le formulaire d'ajout de police Google Fonts
 */
export const showAddGoogleFont = (req, res) => {
  res.render('pages/font-form', {
    title: 'Ajouter une police Google Fonts',
    font: null,
    formAction: '/fonts/google',
    isGoogle: true
  });
};

/**
 * Ajouter une police Google Fonts
 */
export const addGoogleFont = crudActionWrapper(
  async (req) => {
    const { name, url, font_family } = req.body;
    
    if (!name || !url || !font_family) {
      throw new Error('Tous les champs sont requis');
    }

    await query(
      `INSERT INTO fonts (name, source, url, font_family) 
       VALUES ($1, 'google', $2, $3)`,
      [name, url, font_family]
    );
  },
  {
    successMessage: SUCCESS_MESSAGES.FONT_ADDED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: 'addGoogleFont',
    redirectOnSuccess: '/fonts',
    redirectOnError: '/fonts/google/new'
  }
);

/**
 * Uploader une police depuis le disque
 */
export const uploadFont = crudActionWrapper(
  async (req) => {
    const { name, font_family } = req.body;
    const file = req.file;

    if (!name || !font_family || !file) {
      throw new Error('Tous les champs sont requis (nom, famille CSS et fichier)');
    }

    const filePath = `/uploads/${file.filename}`;

    await query(
      `INSERT INTO fonts (name, source, font_family, file_path) 
       VALUES ($1, 'upload', $2, $3)`,
      [name, font_family, filePath]
    );
  },
  {
    successMessage: SUCCESS_MESSAGES.FONT_ADDED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: 'uploadFont',
    redirectOnSuccess: '/fonts',
    redirectOnError: '/fonts'
  }
);

/**
 * Supprimer une police
 */
export const deleteFont = crudActionWrapper(
  async (req) => {
    const { id } = req.params;

    // Ne pas permettre la suppression des polices système
    const { rows } = await query('SELECT source FROM fonts WHERE id=$1', [id]);
    if (rows.length === 0) {
      throw new Error('Police non trouvée');
    }
    if (rows[0].source === 'system') {
      throw new Error('Impossible de supprimer une police système');
    }

    // Si police uploadée, supprimer le fichier associé
    const { rows: fileRows } = await query('SELECT file_path FROM fonts WHERE id=$1', [id]);
    if (fileRows.length > 0 && fileRows[0].file_path) {
      try {
        // Construire le chemin absolu du fichier dans public/
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const publicRoot = path.join(__dirname, '..', '..', 'public');
        const rel = fileRows[0].file_path.replace(/^\//, '');
        const abs = path.join(publicRoot, rel);
        await unlink(abs).catch(() => {}); // ignore if already removed
      } catch (e) {
        // Ne pas bloquer la suppression en base si unlink échoue
        console.warn('Impossible de supprimer le fichier de police:', e.message);
      }
    }

    await query('DELETE FROM fonts WHERE id=$1', [id]);
  },
  {
    successMessage: SUCCESS_MESSAGES.FONT_DELETED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: 'deleteFont',
    redirectOnSuccess: '/fonts',
    redirectOnError: '/fonts'
  }
);
