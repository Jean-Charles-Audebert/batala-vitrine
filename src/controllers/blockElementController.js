import { query } from "../config/db.js";

// Récupérer tous les éléments d'un bloc
export const getBlockElements = async (req, res) => {
  const { blockId } = req.params;
  try {
    const { rows } = await query(
      "SELECT id, block_id, type, position, content, media_path, alignment FROM block_elements WHERE block_id=$1 ORDER BY position ASC",
      [blockId]
    );
    res.json({ elements: rows });
  } catch (error) {
    console.error("Erreur récupération éléments:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Créer un nouvel élément dans un bloc
export const createBlockElement = async (req, res) => {
  const { blockId } = req.params;
  const { type, position, content, media_path, alignment } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: "Type requis" });
  }
  
  try {
    const { rows } = await query(
      "INSERT INTO block_elements (block_id, type, position, content, media_path, alignment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [blockId, type, position || 999, content || null, media_path || null, alignment || 'left']
    );
    res.json({ element: rows[0] });
  } catch (error) {
    console.error("Erreur création élément:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Mettre à jour un élément
export const updateBlockElement = async (req, res) => {
  const { id } = req.params;
  const { type, position, content, media_path, alignment } = req.body;
  
  try {
    // D'abord récupérer l'élément existant
    const { rows: existing } = await query(
      "SELECT * FROM block_elements WHERE id=$1",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: "Élément non trouvé" });
    }
    
    const current = existing[0];
    
    // Mettre à jour uniquement les champs fournis
    const { rows } = await query(
      "UPDATE block_elements SET type=$1, position=$2, content=$3, media_path=$4, alignment=$5, updated_at=NOW() WHERE id=$6 RETURNING *",
      [
        type !== undefined ? type : current.type,
        position !== undefined ? position : current.position,
        content !== undefined ? content : current.content,
        media_path !== undefined ? media_path : current.media_path,
        alignment !== undefined ? alignment : current.alignment,
        id
      ]
    );
    
    res.json({ element: rows[0] });
  } catch (error) {
    console.error("Erreur modification élément:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Supprimer un élément
export const deleteBlockElement = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { rowCount } = await query("DELETE FROM block_elements WHERE id=$1", [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: "Élément non trouvé" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression élément:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
