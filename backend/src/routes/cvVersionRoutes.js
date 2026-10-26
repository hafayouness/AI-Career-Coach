import { Router } from "express";
import { cvVersionController } from "../controllers/cvVersionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.post("/generate", cvVersionController.generate);
router.get("/", cvVersionController.listAll);
router.get("/by-cv/:cvId", cvVersionController.listByCV);
router.get("/:id", cvVersionController.get);
router.patch("/:id", cvVersionController.update);
router.post("/:id/validate", cvVersionController.validate);
router.delete("/:id", cvVersionController.remove);
router.get("/:id/pdf", cvVersionController.downloadPDF);

export default router;
