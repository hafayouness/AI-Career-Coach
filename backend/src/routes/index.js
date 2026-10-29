import { Router } from "express";
import authRoutes from "./authRoutes.js";
import RouteCv from "./RouteCv.js";
import jobOfferRoutes from "./jobOfferRoutes.js";
import jobAnalysisRoutes from "./jobAnalysisRoutes.js";
import cvVersionRoutes from "./cvVersionRoutes.js";
import presentationRoutes from "./presentationRoutes.js";
import interviewQuestionRoutes from "./interviewQuestionroutes.js";
import interviewSimulationRoutes from "./interviewSimulationRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cvs", RouteCv);
router.use("/job-offers", jobOfferRoutes);
router.use("/job-analyses", jobAnalysisRoutes);
router.use("/cv-versions", cvVersionRoutes);
router.use("/presentations", presentationRoutes);
router.use("/interview-questions", interviewQuestionRoutes);
router.use("/interview-sessions", interviewSimulationRoutes);

export default router;
