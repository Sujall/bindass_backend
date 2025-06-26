import { Router } from "express";

import {
  completeRegistration,
  forgotPassword,
  initiateRegistration,
  loginUser,
  logoutUser,
  resetPassword
} from "../controllers/auth_controller.js";
import { updateProfile } from "../controllers/profile_controller.js";

const router = Router();

// @route   POST /api/auth/register
router.post("/initialRegister", initiateRegistration);
router.post("/completeRegister", completeRegistration);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   POST /api/auth/login
router.post("/logout", logoutUser);

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

// @route PUT /api/profile/updateProfile
router.put("/updateProfile", updateProfile)

export default router;