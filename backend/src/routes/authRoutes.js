import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/logout", (_req, res) =>
  res.json({ success: true, data: {}, message: "Déconnecté" }),
);
router.patch("/profile", requireAuth, authController.updateProfile);
router.patch("/password", requireAuth, authController.changePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
