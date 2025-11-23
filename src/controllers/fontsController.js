import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";
import { createOptimizedVersion } from "../utils/imageOptimizer.js";
import path from "path";

export const listFonts = async (req, res) => {
  try {
    const { rows } = await query("SELECT id, name, source, font_family, url, file_path, created_at FROM fonts ORDER BY name");
    res.render("pages/fonts", {
      title: "Gestion des polices",
      fonts: rows,
      success: req.query.success || null,
      error: req.query.error || null,
      currentPage: 'fonts'
    });
  } catch (error) {
    logger.error("Erreur récupération polices", error);
    res.status(500).send("Erreur lors de la récupération des polices");
  }
};

export const showNewFontForm = (req, res) => {
  res.render("pages/font-form", {
    title: "Ajouter une police",
    formAction: "/admin/fonts/new",
    font: null,
    currentPage: 'fonts'
  });
};

export const createFont = async (req, res) => {
  const { name, url, font_family } = req.body;

  if (!name || !font_family) {
    return res.render("pages/font-form", {
      title: "Ajouter une police",
      formAction: "/admin/fonts/new",
      font: null,
      error: "Nom et famille CSS requis.",
      currentPage: 'fonts'
    });
  }

  try {
    // Déterminer la source et les champs appropriés
    let source, urlValue, filePathValue;
    if (url) {
      source = 'google';
      urlValue = url;
      filePathValue = null;
    } else {
      // Pour les polices uploadées, ces champs sont gérés par uploadFont
      return res.render("pages/font-form", {
        title: "Ajouter une police",
        formAction: "/admin/fonts/new",
        font: null,
        error: "Utilisez le formulaire d'upload pour les polices locales.",
        currentPage: 'fonts'
      });
    }

    await query(
      "INSERT INTO fonts (name, source, font_family, url, file_path) VALUES ($1, $2, $3, $4, $5)",
      [name, source, font_family, urlValue, filePathValue]
    );
    res.redirect("/admin/fonts?success=Police ajoutée avec succès");
  } catch (error) {
    logger.error("Erreur création police", error);
    res.render("pages/font-form", {
      title: "Ajouter une police",
      formAction: "/admin/fonts/new",
      font: null,
      error: "Erreur lors de la création de la police.",
      currentPage: 'fonts'
    });
  }
};

export const showEditFontForm = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query("SELECT * FROM fonts WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).send("Police non trouvée");
    }
    res.render("pages/font-form", {
      title: "Modifier la police",
      formAction: `/admin/fonts/${id}/edit`,
      font: rows[0],
      currentPage: 'fonts'
    });
  } catch (error) {
    logger.error("Erreur récupération police", error);
    res.status(500).send("Erreur lors de la récupération de la police");
  }
};

export const updateFont = async (req, res) => {
  const { id } = req.params;
  const { name, url, font_family } = req.body;

  if (!name || !font_family) {
    return res.render("pages/font-form", {
      title: "Modifier la police",
      formAction: `/admin/fonts/${id}/edit`,
      font: { id, name, url, font_family },
      error: "Nom et famille CSS requis.",
      currentPage: 'fonts'
    });
  }

  try {
    // Déterminer la source et les champs appropriés
    let source, urlValue, filePathValue;
    if (url) {
      source = 'google';
      urlValue = url;
      filePathValue = null;
    } else {
      // Pour les polices uploadées, récupérer l'ancien file_path
      const { rows } = await query("SELECT file_path FROM fonts WHERE id = $1", [id]);
      if (rows.length > 0) {
        source = 'upload';
        urlValue = null;
        filePathValue = rows[0].file_path;
      } else {
        throw new Error("Police non trouvée");
      }
    }

    await query(
      "UPDATE fonts SET name = $1, source = $2, font_family = $3, url = $4, file_path = $5 WHERE id = $6",
      [name, source, font_family, urlValue, filePathValue, id]
    );
    res.redirect("/admin/fonts?success=Police modifiée avec succès");
  } catch (error) {
    logger.error("Erreur modification police", error);
    res.render("pages/font-form", {
      title: "Modifier la police",
      formAction: `/admin/fonts/${id}/edit`,
      font: { id, name, url, font_family },
      error: "Erreur lors de la modification de la police.",
      currentPage: 'fonts'
    });
  }
};

export const deleteFont = async (req, res) => {
  const { id } = req.params;
  try {
    // Récupérer les infos de la police avant suppression pour supprimer le fichier
    const { rows } = await query("SELECT file_path FROM fonts WHERE id = $1", [id]);
    if (rows.length > 0 && rows[0].file_path) {
      // Supprimer le fichier physique
      const fs = await import('fs/promises');
      const fullPath = path.join(process.cwd(), 'public', rows[0].file_path);
      try {
        await fs.unlink(fullPath);
        logger.info(`Police supprimée du disque: ${fullPath}`);
      } catch (fileError) {
        logger.warn(`Erreur suppression fichier police: ${fullPath}`, fileError);
      }
    }

    await query("DELETE FROM fonts WHERE id = $1", [id]);
    res.redirect("/admin/fonts?success=Police supprimée avec succès");
  } catch (error) {
    logger.error("Erreur suppression police", error);
    res.redirect("/admin/fonts?error=Erreur lors de la suppression de la police");
  }
};

export const uploadFont = async (req, res) => {
  const { name, font_family } = req.body;
  const fontFile = req.file;

  if (!name || !font_family) {
    // Récupérer la liste des polices pour l'affichage
    const { rows } = await query("SELECT id, name, source, font_family, url, file_path, created_at FROM fonts ORDER BY name");
    return res.render("pages/fonts", {
      title: "Gestion des polices",
      fonts: rows,
      error: "Nom et famille CSS requis.",
      currentPage: 'fonts'
    });
  }

  if (!fontFile) {
    // Récupérer la liste des polices pour l'affichage
    const { rows } = await query("SELECT id, name, source, font_family, url, file_path, created_at FROM fonts ORDER BY name");
    return res.render("pages/fonts", {
      title: "Gestion des polices",
      fonts: rows,
      error: "Fichier de police requis.",
      currentPage: 'fonts'
    });
  }

  try {
    // Le fichier est déjà uploadé avec le suffixe -original
    // Pour les polices, on ne fait pas d'optimisation, on garde le fichier tel quel
    const filePath = `/uploads/${fontFile.filename.replace('-original', '')}`;

    // Renommer le fichier pour enlever -original (les polices n'ont pas besoin d'optimisation)
    const fs = await import('fs/promises');
    const originalPath = path.join(process.cwd(), 'public/uploads', fontFile.filename);
    const finalPath = path.join(process.cwd(), 'public/uploads', fontFile.filename.replace('-original', ''));

    await fs.rename(originalPath, finalPath);

    // Insérer dans la base de données
    await query(
      "INSERT INTO fonts (name, source, font_family, file_path) VALUES ($1, $2, $3, $4)",
      [name, 'upload', font_family, filePath]
    );

    res.redirect("/admin/fonts?success=Police uploadée avec succès");
  } catch (error) {
    logger.error("Erreur upload police", error);

    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      const fs = await import('fs/promises');
      const filePath = path.join(process.cwd(), 'public/uploads', req.file.filename);
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        logger.warn("Erreur nettoyage fichier après erreur", cleanupError);
      }
    }

    res.redirect("/admin/fonts?error=Erreur lors de l'upload de la police");
  }
};