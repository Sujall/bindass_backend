import { Router } from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import { getProfile, updateProfile } from "../controllers/profile_controller.js";

const router = Router();

router.get("/view", authMiddleware, getProfile);
router.put("/updateProfile", authMiddleware, updateProfile);

export default router;
