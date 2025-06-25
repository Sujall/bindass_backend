import express from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import adminMiddleware from "../middleware/admin_middleware.js";

import {
  createGiveaway,
  updateParticipantStatus,
  uploadBanner,
  getGiveawayParticipants,
} from "../controllers/admin_controller.js";

const router = express.Router();

// Create a new giveaway
router.post("/giveaways", authMiddleware, adminMiddleware, createGiveaway);

// Update participant status (verified/rejected)
router.put(
  "/participants/:participantId/status",
  authMiddleware,
  adminMiddleware,
  updateParticipantStatus
);

// Get participants of a specific giveaway
router.get(
  "/giveaways/:giveawayId/participants",
  authMiddleware,
  adminMiddleware,
  getGiveawayParticipants
);

// Upload a banner (admin use)
router.post("/media/banner", authMiddleware, adminMiddleware, uploadBanner);

export default router;
