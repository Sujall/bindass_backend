import { Router } from "express";
import authMiddleware from "../middleware/auth_middleware.js";

import { getUserGiveawayHistory, registerForGiveaway } from "../controllers/giveaway_controller.js";

const router = Router();

router.post("/register", authMiddleware, registerForGiveaway);
router.get("/history", authMiddleware, getUserGiveawayHistory);

export default router;