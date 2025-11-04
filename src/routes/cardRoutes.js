import express from "express";
import {
  listCards,
  showNewCardForm,
  createCard,
  showEditCardForm,
  updateCard,
  deleteCard
} from "../controllers/cardController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router({ mergeParams: true }); // mergeParams pour récupérer blockId

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

router.get("/", listCards);
router.get("/new", showNewCardForm);
router.post("/new", createCard);
router.get("/:id/edit", showEditCardForm);
router.post("/:id/edit", updateCard);
router.post("/:id/delete", deleteCard);

export default router;
