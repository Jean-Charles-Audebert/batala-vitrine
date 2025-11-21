/**
 * Routes API pour les sections v2
 */

import { Router } from 'express';
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  addSectionContent,
  addSectionCard,
  addSectionDecoration,
  getAllDecorations,
  getAllFonts
} from '../controllers/sectionController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

// Protection auth pour toutes les routes
router.use(requireAuth);

// ========== SECTIONS ==========
// GET /api/sections - Liste toutes les sections
router.get('/sections', async (req, res) => {
  try {
    const sections = await getAllSections();
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sections/:id - Détails d'une section
router.get('/sections/:id', async (req, res) => {
  try {
    const section = await getSectionById(parseInt(req.params.id, 10));
    if (!section) {
      return res.status(404).json({ error: 'Section non trouvée' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sections - Créer une section
router.post('/sections', async (req, res) => {
  try {
    const section = await createSection(req.body);
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sections/:id - Mettre à jour une section
router.put('/sections/:id', async (req, res) => {
  try {
    const section = await updateSection(parseInt(req.params.id, 10), req.body);
    if (!section) {
      return res.status(404).json({ error: 'Section non trouvée' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sections/:id - Supprimer une section
router.delete('/sections/:id', async (req, res) => {
  try {
    const deleted = await deleteSection(parseInt(req.params.id, 10));
    if (!deleted) {
      return res.status(404).json({ error: 'Section non trouvée' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sections/reorder - Réorganiser les sections
router.post('/sections/reorder', async (req, res) => {
  try {
    const { sectionIds } = req.body; // Array d'IDs dans le nouvel ordre
    
    if (!Array.isArray(sectionIds)) {
      return res.status(400).json({ error: 'sectionIds doit être un tableau' });
    }
    
    const { query } = await import('../config/db.js');
    
    // Mettre à jour les positions
    for (let i = 0; i < sectionIds.length; i++) {
      await query('UPDATE sections SET position = $1 WHERE id = $2', [i + 1, sectionIds[i]]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SECTION CONTENT ==========
// POST /api/sections/:sectionId/content - Ajouter du contenu
router.post('/sections/:sectionId/content', async (req, res) => {
  try {
    const content = await addSectionContent(
      parseInt(req.params.sectionId, 10),
      req.body
    );
    res.status(201).json(content);
  } catch (error) {
    console.error('❌ Erreur dans la route:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sections/:sectionId/content/:contentId - Modifier du contenu
router.put('/sections/:sectionId/content/:contentId', async (req, res) => {
  try {
    const { updateSectionContent } = await import('../controllers/sectionController.js');

    if (!updateSectionContent) {
      return res.status(500).json({ error: 'Fonction updateSectionContent non disponible' });
    }

    const content = await updateSectionContent(
      parseInt(req.params.contentId, 10),
      req.body
    );
    if (!content) {
      return res.status(404).json({ error: 'Contenu non trouvé' });
    }
    res.json(content);
  } catch (error) {
    console.error('Erreur dans route PUT content:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sections/:sectionId/content/:contentId - Supprimer du contenu
router.delete('/sections/:sectionId/content/:contentId', async (req, res) => {
  try {
    const { query } = await import('../config/db.js');
    await query('DELETE FROM section_content WHERE id = $1 AND section_id = $2', [
      parseInt(req.params.contentId, 10),
      parseInt(req.params.sectionId, 10)
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SECTION CARDS ==========
// POST /api/sections/:id/cards - Ajouter une carte à une section
router.post('/sections/:sectionId/cards', async (req, res) => {
  try {
    const card = await addSectionCard(
      parseInt(req.params.sectionId, 10),
      req.body
    );
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sections/:sectionId/cards/:cardId - Mettre à jour une carte
router.put('/sections/:sectionId/cards/:cardId', async (req, res) => {
  try {
    const { updateSectionCard } = await import('../controllers/sectionController.js');
    const card = await updateSectionCard(
      parseInt(req.params.cardId, 10),
      req.body
    );
    if (!card) {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sections/:sectionId/cards/:cardId - Supprimer une carte
router.delete('/sections/:sectionId/cards/:cardId', async (req, res) => {
  try {
    const { query } = await import('../config/db.js');
    await query('DELETE FROM cards_v2 WHERE id = $1 AND section_id = $2', [
      parseInt(req.params.cardId, 10),
      parseInt(req.params.sectionId, 10)
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MÉDIAS ==========
// GET /api/media - Liste des fichiers médias disponibles
router.get('/media', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    
    // Lister les fichiers
    const files = fs.readdirSync(uploadsDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: `/uploads/${file}`,
        url: `/uploads/${file}`
      }));
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/videos - Liste des fichiers vidéos disponibles
router.get('/videos', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    
    // Lister les fichiers vidéos
    const files = fs.readdirSync(uploadsDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.webm', '.ogg', '.avi', '.mov'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: `/uploads/${file}`,
        url: `/uploads/${file}`
      }));
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET /api/decorations - Liste toutes les décorations
router.get('/decorations', async (req, res) => {
  try {
    const decorations = await getAllDecorations();
    res.json(decorations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fonts - Liste toutes les polices
router.get('/fonts', async (req, res) => {
  try {
    const fonts = await getAllFonts();
    res.json(fonts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sections/:id/decorations - Ajouter une décoration à une section
router.post('/sections/:sectionId/decorations', async (req, res) => {
  try {
    const decoration = await addSectionDecoration(
      parseInt(req.params.sectionId, 10),
      req.body
    );
    res.status(201).json(decoration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sections/:sectionId/decorations/:decorationId - Retirer une décoration
router.delete('/sections/:sectionId/decorations/:decorationId', async (req, res) => {
  try {
    const { query } = await import('../config/db.js');
    await query('DELETE FROM section_decorations WHERE section_id = $1 AND decoration_id = $2', [
      parseInt(req.params.sectionId, 10),
      parseInt(req.params.decorationId, 10)
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
