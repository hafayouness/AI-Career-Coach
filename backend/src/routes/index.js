import { Router } from "express";
import authRoutes from "./authRoutes.js";
import RouteCv from "./RouteCv.js";
import jobOfferRoutes from "./jobOfferRoutes.js";
import jobAnalysisRoutes from "./jobAnalysisRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cvs", RouteCv);
router.use("/job-offers", jobOfferRoutes);
router.use("/job-analyses", jobAnalysisRoutes);

export default router;
