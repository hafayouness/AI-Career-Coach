import { Router } from "express";
import authRoutes from "./authRoutes.js";
import RouteCv from "./RouteCv.js";
import jobOfferRoutes from "./jobOfferRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cvs", RouteCv);
router.use("/job-offers", jobOfferRoutes);

export default router;
