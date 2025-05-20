import express from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import adminMiddleware from "../middleware/admin_middleware.js";
import { createGiveaway } from "../controllers/admin_controller.js";

const router = express.Router();

// Admin-only route
router.post("/giveaways", authMiddleware, adminMiddleware, createGiveaway);

export default router;
