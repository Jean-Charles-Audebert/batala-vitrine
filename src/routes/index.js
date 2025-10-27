import express from "express";
import { showHome } from "../controllers/homeController.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = express.Router();

router.get("/", optionalAuth, showHome);

export default router;
