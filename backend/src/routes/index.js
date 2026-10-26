import { Router } from "express";
import authRoutes from "./authRoutes.js";
import RouteCv from "./RouteCv.js";
import jobOfferRoutes from "./jobOfferRoutes.js";
import jobAnalysisRoutes from "./jobAnalysisRoutes.js";
import cvVersionRoutes from "./cvVersionRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cvs", RouteCv);
router.use("/job-offers", jobOfferRoutes);
router.use("/job-analyses", jobAnalysisRoutes);
router.use("/cv-versions", cvVersionRoutes);

export default router;
