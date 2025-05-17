import { Router } from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import { updateProfile } from "../controllers/profile_controller.js";

const router = Router();

router.put("/updateProfile", authMiddleware, updateProfile);

export default router;
