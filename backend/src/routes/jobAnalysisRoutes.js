import { Router } from "express";
import { jobAnalysisController } from "../controllers/jobAnalysisController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.post("/", jobAnalysisController.analyze);
router.get("/", jobAnalysisController.list);
router.get("/:id", jobAnalysisController.get);
router.delete("/:id", jobAnalysisController.remove);

export default router;
