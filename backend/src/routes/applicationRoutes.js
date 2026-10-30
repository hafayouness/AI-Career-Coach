import { Router } from "express";
import { applicationController } from "../controllers/applicationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.post("/", applicationController.create);
router.get("/", applicationController.list);
router.patch("/:id", applicationController.update);
router.delete("/:id", applicationController.remove);

export default router;
