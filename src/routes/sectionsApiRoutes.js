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
  getAllDecorations
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

// ========== SECTION CONTENT ==========
// POST /api/sections/:sectionId/content - Ajouter du contenu
router.post('/sections/:sectionId/content', async (req, res) => {
  try {
    const content = await addSectionContent({
      section_id: parseInt(req.params.sectionId, 10),
      ...req.body
    });
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sections/:sectionId/content/:contentId - Modifier du contenu
router.put('/sections/:sectionId/content/:contentId', async (req, res) => {
  try {
    const { query } = await import('../config/db.js');
    const { title, subtitle, description, cta_label, cta_url, media_url, media_type, text_color, text_align } = req.body;
    
    await query(`
      UPDATE section_content 
      SET title = $1, subtitle = $2, description = $3, 
          cta_label = $4, cta_url = $5, media_url = $6,
          media_type = $7, text_color = $8, text_align = $9
      WHERE id = $10 AND section_id = $11
    `, [title, subtitle, description, cta_label, cta_url, media_url, media_type, text_color, text_align, 
        parseInt(req.params.contentId, 10), parseInt(req.params.sectionId, 10)]);
    
    res.json({ success: true });
  } catch (error) {
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
    const card = await addSectionCard({
      section_id: parseInt(req.params.sectionId, 10),
      ...req.body
    });
    res.status(201).json(card);
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

// ========== DECORATIONS ==========
// GET /api/decorations - Liste toutes les décorations
router.get('/decorations', async (req, res) => {
  try {
    const decorations = await getAllDecorations();
    res.json(decorations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sections/:id/decorations - Ajouter une décoration à une section
router.post('/sections/:sectionId/decorations', async (req, res) => {
  try {
    const decoration = await addSectionDecoration({
      section_id: parseInt(req.params.sectionId, 10),
      ...req.body
    });
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
