import { Router } from "express";
import { cvController } from "../controllers/CvController.js";
import { uploadCV } from "../middleware/uploadMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", uploadCV, cvController.upload);
router.get("/", cvController.list);
router.get("/:id", cvController.get);
router.delete("/:id", cvController.remove);

export default router;
