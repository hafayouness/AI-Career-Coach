import { Router } from "express";
import { interviewQuestionController } from "../controllers/interviewQuestionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.post("/generate", interviewQuestionController.generate);
router.get("/", interviewQuestionController.list);
router.delete("/:id", interviewQuestionController.remove);

export default router;
