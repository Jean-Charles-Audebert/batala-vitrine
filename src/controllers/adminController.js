import { query } from "../config/db.js";
import { hashPassword } from "../utils/password.js";
import { logger } from "../utils/logger.js";

export const listAdmins = async (req, res) => {
  try {
    const { rows } = await query("SELECT id, email, is_active, created_at FROM admins WHERE is_super_admin = FALSE");
    res.render("pages/admins", { 
      title: "Liste des administrateurs", 
      admins: rows,
      success: req.query.success || null,
      currentPage: 'admins'
    });
  } catch (error) {
    logger.error("Erreur récupération admins", error);
    res.status(500).send("Erreur lors de la récupération des admins");
  }
};

export const showNewAdminForm = (req, res) => {
  res.render("pages/admin-form", { 
    title: "Créer un nouvel admin", 
    formAction: "/admins/new",
    admin: null,
    currentPage: 'admins'
  });
};

export const createAdmin = async (req, res) => {
  const { email, password, is_active } = req.body;
  if (!email || !password) {
    return res.render("pages/admin-form", { 
      title: "Créer un nouvel admin", 
      formAction: "/admins/new",
      admin: null,
      error: "Email et mot de passe requis.",
      currentPage: 'admins'
    });
  }
  try {
    const passwordHash = await hashPassword(password);
    await query(
      "INSERT INTO admins (email, password_hash, is_active, created_by) VALUES ($1, $2, $3, $4)",
      [email, passwordHash, is_active === 'on' || is_active === true, req.user.sub]
    );
    res.redirect("/admins?success=Admin créé avec succès");
  } catch (error) {
    logger.error("Erreur création admin", error);
    res.render("pages/admin-form", { 
      title: "Créer un nouvel admin", 
      formAction: "/admins/new",
      admin: { email },
      error: "Erreur lors de la création (email déjà existant ?)",
      currentPage: 'admins'
    });
  }
};

export const showEditAdminForm = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query("SELECT id, email, is_active FROM admins WHERE id=$1", [id]);
    if (rows.length === 0) {
      return res.status(404).send("Admin non trouvé");
    }
    res.render("pages/admin-form", { 
      title: "Modifier un admin", 
      formAction: `/admins/${id}/edit`,
      admin: rows[0],
      currentPage: 'admins'
    });
  } catch (error) {
    logger.error("Erreur récupération admin", error);
    res.status(500).send("Erreur serveur");
  }
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { email, password, is_active } = req.body;
  if (!email) {
    return res.status(400).send("Email requis");
  }
  try {
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
    res.redirect("/admins?success=Admin modifié avec succès");
  } catch (error) {
    logger.error("Erreur modification admin", error);
    res.status(500).send("Erreur lors de la modification");
  }
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM admins WHERE id=$1", [id]);
    res.redirect("/admins?success=Admin supprimé avec succès");
  } catch (error) {
    logger.error("Erreur suppression admin", error);
    res.status(500).send("Erreur lors de la suppression");
  }
};
