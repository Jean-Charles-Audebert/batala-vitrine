import express from "express";
import {
  listCards,
  deleteCard
} from "../controllers/cardController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router({ mergeParams: true }); // mergeParams pour récupérer blockId

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

router.get("/", listCards);
// Routes de formulaires supprimées - on utilise uniquement la modale + API
router.post("/:id/delete", deleteCard);

export default router;
