import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";

export const listBlocks = async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, type, title, slug, position, is_locked FROM blocks ORDER BY position ASC"
    );
    res.render("blocks", { title: "Gestion des blocs", blocks: rows });
  } catch (error) {
    logger.error("Erreur récupération blocs", error);
    res.status(500).send("Erreur lors de la récupération des blocs");
  }
};

export const showNewBlockForm = (req, res) => {
  res.render("block-form", { 
    title: "Créer un nouveau bloc", 
    formAction: "/blocks/new",
    block: null 
  });
};

export const createBlock = async (req, res) => {
  const { type, title, slug, position } = req.body;
  if (!type || !title || !slug) {
    return res.render("block-form", { 
      title: "Créer un nouveau bloc", 
      formAction: "/blocks/new",
      block: null,
      error: "Type, titre et slug requis." 
    });
  }
  try {
    await query(
      "INSERT INTO blocks (type, title, slug, position, is_locked) VALUES ($1, $2, $3, $4, FALSE)",
      [type, title, slug, position || 999]
    );
    res.redirect("/blocks?success=Bloc créé avec succès");
  } catch (error) {
    logger.error("Erreur création bloc", error);
    res.render("block-form", { 
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
      "SELECT id, type, title, slug, position, is_locked FROM blocks WHERE id=$1", 
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    res.render("block-form", { 
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
  const { type, title, slug, position } = req.body;
  if (!type || !title || !slug) {
    return res.status(400).send("Type, titre et slug requis");
  }
  try {
    await query(
      "UPDATE blocks SET type=$1, title=$2, slug=$3, position=$4 WHERE id=$5",
      [type, title, slug, position || 999, id]
    );
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
    // Mise à jour en batch
    for (const item of order) {
      await query("UPDATE blocks SET position=$1 WHERE id=$2", [item.position, item.id]);
    }
    res.json({ success: true, message: "Ordre des blocs mis à jour" });
  } catch (error) {
    logger.error("Erreur réordonnancement blocs", error);
    res.status(500).json({ error: "Erreur lors du réordonnancement" });
  }
};
