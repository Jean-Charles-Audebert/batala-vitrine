import express from "express";
import { showHome } from "../controllers/homeController.js";
import { showAdminDashboard } from "../controllers/adminDashboardController.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/", optionalAuth, showHome);
router.get("/admin", requireAuth, showAdminDashboard);

export default router;
