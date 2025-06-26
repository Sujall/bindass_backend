import { Router } from "express";
import authMiddleware from "../middleware/auth_middleware.js";

import {
  getAllGiveaways,
  getGiveawayById,
  getUserGiveawayHistory,
  participateForGiveaway,
} from "../controllers/giveaway_controller.js";
import Media from "../models/banner_model.js";

const router = Router();

router.get("/all-giveaways", getAllGiveaways);
router.get("/giveaway/:id", getGiveawayById);
router.post("/participate", authMiddleware, participateForGiveaway);
router.get("/history", authMiddleware, getUserGiveawayHistory);

router.get("/media/banners", async (req, res) => {
  try {
    const banners = await Media.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ banners });
  } catch (err) {
    console.error("Fetch banners error:", err);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

export default router;
