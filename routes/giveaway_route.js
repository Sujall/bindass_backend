import { Router } from "express";
import authMiddleware from "../middleware/auth_middleware.js";

import {
  getAllGiveaways,
  getUserGiveawayHistory,
  participateForGiveaway,
} from "../controllers/giveaway_controller.js";

const router = Router();

router.get("/all-giveaways", authMiddleware, getAllGiveaways);
router.post("/participate", authMiddleware, participateForGiveaway);
router.get("/history", authMiddleware, getUserGiveawayHistory);

export default router;
