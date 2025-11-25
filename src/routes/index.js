import express from "express";
import { showHome } from "../controllers/homeController.js";
import { showEditorPage } from "../controllers/siteController.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { query } from "../config/db.js";

const router = express.Router();

// Route pour servir le CSS dynamique des variables pour la page publique
router.get('/css/pages/index-v2.css', async (req, res) => {
  try {
    // Récupérer les données de page depuis la BDD
    const { rows: pageRows } = await query(`
      SELECT
        title_font_id,
        text_font_id,
        main_bg_color,
        contact_email
      FROM page
      LIMIT 1
    `);

    const pageData = pageRows[0] || {
      title_font_id: null,
      text_font_id: null,
      main_bg_color: '#ffffff',
      contact_email: ''
    };

    // Récupérer les fonts
    const { rows: fontsRows } = await query('SELECT id, name, source, font_family FROM fonts ORDER BY name');

    const fonts = fontsRows.map(fontRow => ({
      id: fontRow.id,
      name: fontRow.name,
      source: fontRow.source,
      font_family: fontRow.font_family
    }));

    res.setHeader('Content-Type', 'text/css');
    res.render('css/pages/index-v2.css.ejs', {
      page: pageData,
      fonts: fonts,
      layout: false
    });
  } catch (error) {
    console.error('Erreur lors du rendu du CSS dynamique:', error);
    // En cas d'erreur, servir un CSS vide
    res.setHeader('Content-Type', 'text/css');
    res.send(':root {}');
  }
});

// Route publique - page vitrine avec sections visibles uniquement
router.get("/", optionalAuth, showHome);

// Route d'édition - toutes les sections (authentification requise)
router.get("/editor", requireAuth, showEditorPage);

export default router;
