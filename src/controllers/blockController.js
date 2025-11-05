import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";

export const listBlocks = async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, type, title, slug, position, is_locked FROM blocks ORDER BY position ASC"
    );
    res.render("pages/blocks", { 
      title: "Gestion des blocs", 
      blocks: rows,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    logger.error("Erreur récupération blocs", error);
    res.status(500).send("Erreur lors de la récupération des blocs");
  }
};

export const showNewBlockForm = (req, res) => {
  res.render("pages/block-form", { 
    title: "Créer un nouveau bloc", 
    formAction: "/blocks/new",
    block: null 
  });
};

export const createBlock = async (req, res) => {
  const { type, title, slug, position } = req.body;
  if (!type || !title || !slug) {
    return res.render("pages/block-form", { 
      title: "Créer un nouveau bloc", 
      formAction: "/blocks/new",
      block: null,
      error: "Type, titre et slug requis." 
    });
  }
  try {
    // Calculer la position : après le header et avant le footer
    let newPosition = position || 999;
    
    if (!position) {
      const { rows: headerRows } = await query(
        "SELECT position FROM blocks WHERE type='header' ORDER BY position ASC LIMIT 1"
      );
      
      const { rows: footerRows } = await query(
        "SELECT position FROM blocks WHERE type='footer' ORDER BY position DESC LIMIT 1"
      );
      
      if (footerRows.length > 0) {
        // Insérer juste avant le footer
        const footerPosition = footerRows[0].position;
        newPosition = footerPosition;
        
        // Décaler le footer et les blocs après
        await query(
          "UPDATE blocks SET position = position + 1 WHERE position >= $1",
          [footerPosition]
        );
      } else if (headerRows.length > 0) {
        // Pas de footer, insérer après le header
        const headerPosition = headerRows[0].position;
        newPosition = headerPosition + 1;
        
        // Décaler les blocs après le header
        await query(
          "UPDATE blocks SET position = position + 1 WHERE position > $1",
          [headerPosition]
        );
      } else {
        // Ni header ni footer, mettre à la fin
        const { rows: maxRows } = await query(
          "SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM blocks"
        );
        newPosition = maxRows[0].next_pos;
      }
    }
    
    await query(
      "INSERT INTO blocks (type, title, slug, position, is_locked) VALUES ($1, $2, $3, $4, FALSE)",
      [type, title, slug, newPosition]
    );
    res.redirect("/blocks?success=Bloc créé avec succès");
  } catch (error) {
    logger.error("Erreur création bloc", error);
    res.render("pages/block-form", { 
      title: "Créer un nouveau bloc", 
      formAction: "/blocks/new",
      block: { type, title, slug, position },
      error: "Erreur lors de la création (slug déjà existant ?)" 
    });
  }
};

export const showEditBlockForm = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query(
      "SELECT id, type, title, slug, position, is_locked, bg_image, header_logo, header_title FROM blocks WHERE id=$1", 
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    res.render("pages/block-form", { 
      title: "Modifier un bloc", 
      formAction: `/blocks/${id}/edit`,
      block: rows[0]
    });
  } catch (error) {
    logger.error("Erreur récupération bloc", error);
    res.status(500).send("Erreur serveur");
  }
};

export const updateBlock = async (req, res) => {
  const { id } = req.params;
  const { type, title, slug, position, header_title, header_logo, bg_image } = req.body;
  
  try {
    // Récupérer le type de bloc actuel
    const { rows: currentBlock } = await query("SELECT type FROM blocks WHERE id=$1", [id]);
    if (currentBlock.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    
    const blockType = currentBlock[0].type;
    
    // Pour les blocs header, on met à jour les champs spécifiques
    if (blockType === 'header') {
      if (!header_title) {
        return res.status(400).send("Le titre du site est requis pour le header");
      }
      
      await query(
        "UPDATE blocks SET header_title=$1, header_logo=$2, bg_image=$3 WHERE id=$4",
        [header_title, header_logo || null, bg_image || null, id]
      );
    } else {
      // Pour les autres blocs, mise à jour standard
      if (!type || !title || !slug) {
        return res.status(400).send("Type, titre et slug requis");
      }
      
      await query(
        "UPDATE blocks SET type=$1, title=$2, slug=$3, position=$4, bg_image=$5 WHERE id=$6",
        [type, title, slug, position || 999, bg_image || null, id]
      );
    }
    
    res.redirect("/blocks?success=Bloc modifié avec succès");
  } catch (error) {
    logger.error("Erreur modification bloc", error);
    res.status(500).send("Erreur lors de la modification");
  }
};

export const deleteBlock = async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier que le bloc n'est pas verrouillé
    const { rows } = await query("SELECT is_locked FROM blocks WHERE id=$1", [id]);
    if (rows.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    if (rows[0].is_locked) {
      return res.redirect("/blocks?error=Impossible de supprimer un bloc verrouillé");
    }
    await query("DELETE FROM blocks WHERE id=$1", [id]);
    res.redirect("/blocks?success=Bloc supprimé avec succès");
  } catch (error) {
    logger.error("Erreur suppression bloc", error);
    res.status(500).send("Erreur lors de la suppression");
  }
};

export const reorderBlocks = async (req, res) => {
  const { order } = req.body; // Format attendu: [{ id: 1, position: 1 }, { id: 2, position: 2 }, ...]
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Format de données invalide" });
  }
  try {
    // Récupérer le header et le footer pour les garder à leurs positions fixes
    const { rows: headerRows } = await query(
      "SELECT id FROM blocks WHERE type='header' LIMIT 1"
    );
    
    const { rows: footerRows } = await query(
      "SELECT id FROM blocks WHERE type='footer' LIMIT 1"
    );
    
    const headerId = headerRows.length > 0 ? headerRows[0].id : null;
    const footerId = footerRows.length > 0 ? footerRows[0].id : null;
    
    // Filtrer header et footer de l'ordre reçu (ne doivent jamais être déplacés)
    const orderWithoutFixed = order.filter(item => 
      item.id !== headerId && item.id !== footerId
    );
    
    // S'assurer que le header reste en première position
    if (headerId) {
      await query("UPDATE blocks SET position=$1 WHERE id=$2", [1, headerId]);
    }
    
    // Mise à jour des positions pour les blocs mobiles (décalage de +1 si header existe)
    const startPosition = headerId ? 2 : 1;
    for (let i = 0; i < orderWithoutFixed.length; i++) {
      await query("UPDATE blocks SET position=$1 WHERE id=$2", [
        startPosition + i, 
        orderWithoutFixed[i].id
      ]);
    }
    
    // S'assurer que le footer reste en dernière position
    if (footerId) {
      const maxPosition = startPosition + orderWithoutFixed.length;
      await query("UPDATE blocks SET position=$1 WHERE id=$2", [maxPosition, footerId]);
    }
    
    res.json({ success: true, message: "Ordre des blocs mis à jour" });
  } catch (error) {
    logger.error("Erreur réordonnancement blocs", error);
    res.status(500).json({ error: "Erreur lors du réordonnancement" });
  }
};
