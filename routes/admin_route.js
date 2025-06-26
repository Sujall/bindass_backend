import express from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import adminMiddleware from "../middleware/admin_middleware.js";

import {
  createGiveaway,
  uploadBanner,
  getGiveawayParticipants,
  deleteBanner,
  getAllGiveaways,
  updateParticipantStatusByUserId,
} from "../controllers/admin_controller.js";
import upload from "../config/multer.js";
import Media from "../models/banner_model.js";

const router = express.Router();


router.get(
  "/view-giveaway",
  authMiddleware,
  adminMiddleware,
  getAllGiveaways
);

router.post(
  "/upload-images",
  upload.fields([
    { name: "giveawayImage", maxCount: 1 },
    { name: "qrCode", maxCount: 1 },
  ]),
  (req, res) => {
    if (!req.files?.giveawayImage || !req.files?.qrCode) {
      return res.status(400).json({ error: "Missing files" });
    }

    const giveawayImageUrl = req.files.giveawayImage[0].path;
    const qrCodeUrl = req.files.qrCode[0].path;

    res.json({ giveawayImageUrl, qrCodeUrl });
  }
);

router.post(
  "/create-giveaway",
  authMiddleware,
  adminMiddleware,
  createGiveaway
);

// Update participant status (verified/rejected)
router.put(
  "/participants/:userId/status",
  authMiddleware,
  adminMiddleware,
  updateParticipantStatusByUserId
);

// Get participants of a specific giveaway
router.get(
  "/giveaways/:giveawayId/participants",
  authMiddleware,
  adminMiddleware,
  getGiveawayParticipants
);

// Upload a banner (admin use)
router.get("/media/banner", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const banners = await Media.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ banners });
  } catch (err) {
    console.error("Fetch banners error:", err);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

router.post(
  "/media/banner",
  authMiddleware,
  adminMiddleware,
  upload.single("banner"), // <-- add this here
  uploadBanner
);

router.delete(
  "/media/banner/:id",
  authMiddleware,
  adminMiddleware,
  deleteBanner
);

export default router;
