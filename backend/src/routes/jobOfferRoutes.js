import { Router } from "express";
import { jobOfferController } from "../controllers/jobOfferController.js";
import { uploadOfferImage } from "../middleware/uploadMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.post("/", jobOfferController.create);
router.post(
  "/extract-from-image",
  uploadOfferImage,
  jobOfferController.extractFromImage,
);
router.get("/", jobOfferController.list);
router.get("/:id", jobOfferController.get);
router.patch("/:id", jobOfferController.update);
router.delete("/:id", jobOfferController.remove);

export default router;
