import { Router } from "express";
import { interviewSimulationController } from "../controllers/interviewSimulationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", interviewSimulationController.start);

router.post("/:id/answer", interviewSimulationController.answer);

router.post("/:id/finish", interviewSimulationController.finish);

export default router;
