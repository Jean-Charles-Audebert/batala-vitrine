import express from "express";
import {
  getBlockElements,
  createBlockElement,
  updateBlockElement,
  deleteBlockElement,
} from "../controllers/blockElementController.js";
import { reorderBlocks } from "../controllers/blockController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

// Routes API pour les éléments de blocs (protégées)
router.get("/blocks/:blockId/elements", requireAuth, getBlockElements);
router.post("/blocks/:blockId/elements", requireAuth, createBlockElement);
router.put("/elements/:id", requireAuth, updateBlockElement);
router.delete("/elements/:id", requireAuth, deleteBlockElement);

// Route API pour le réordonnancement des blocs
router.post("/blocks/reorder", requireAuth, reorderBlocks);

export default router;
