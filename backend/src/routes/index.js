import { Router } from "express";
import authRoutes from "./authRoutes.js";
import RouteCv from "./RouteCv.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cvs", RouteCv);

export default router;
