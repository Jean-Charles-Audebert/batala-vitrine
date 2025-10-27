import express from "express";
import { 
  listAdmins, 
  showNewAdminForm, 
  createAdmin, 
  showEditAdminForm, 
  updateAdmin, 
  deleteAdmin 
} from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

// Toutes les routes admin nécessitent une authentification
router.use(requireAuth);

router.get("/", listAdmins);
router.get("/new", showNewAdminForm);
router.post("/new", createAdmin);
router.get("/:id/edit", showEditAdminForm);
router.post("/:id/edit", updateAdmin);
router.post("/:id/delete", deleteAdmin);

export default router;
