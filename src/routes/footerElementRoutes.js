/**
 * Routes pour la gestion des éléments du footer
 */
import { Router } from "express";
import {
  listFooterElements,
  showNewFooterElementForm,
  createFooterElement,
  showEditFooterElementForm,
  updateFooterElement,
  deleteFooterElement
} from "../controllers/footerElementController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(requireAuth);

// Liste des éléments du footer
router.get("/blocks/:blockId/footer-elements", listFooterElements);

// Création d'un nouvel élément
router.get("/blocks/:blockId/footer-elements/new", showNewFooterElementForm);
router.post("/blocks/:blockId/footer-elements/new", createFooterElement);

// Édition d'un élément
router.get("/blocks/:blockId/footer-elements/:id/edit", showEditFooterElementForm);
router.post("/blocks/:blockId/footer-elements/:id/edit", updateFooterElement);

// Suppression d'un élément
router.post("/blocks/:blockId/footer-elements/:id/delete", deleteFooterElement);

export default router;
