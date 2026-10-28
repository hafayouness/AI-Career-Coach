import { Router } from "express";
import { presentationController } from "../controllers/presentationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.post("/generate", presentationController.generate);
router.get("/", presentationController.list);
router.get("/:id", presentationController.get);
router.patch("/:id", presentationController.update);
router.delete("/:id", presentationController.remove);

export default router;
