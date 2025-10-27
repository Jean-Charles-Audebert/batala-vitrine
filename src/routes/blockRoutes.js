import express from "express";
import { 
  listBlocks, 
  showNewBlockForm, 
  createBlock, 
  showEditBlockForm, 
  updateBlock, 
  deleteBlock,
  reorderBlocks
} from "../controllers/blockController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

// Toutes les routes de gestion des blocs nécessitent une authentification
router.use(requireAuth);

router.get("/", listBlocks);
router.get("/new", showNewBlockForm);
router.post("/new", createBlock);
router.get("/:id/edit", showEditBlockForm);
router.post("/:id/edit", updateBlock);
router.post("/:id/delete", deleteBlock);
router.post("/reorder", reorderBlocks);

export default router;
