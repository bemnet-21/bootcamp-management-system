import { Router } from "express";
import {
    createDivisionHandler,
    getDivisionStatisticsHandler,
    listDivisions,
    updateDivisionHandler,
} from "../controllers/division.controller.js";
import { restrictTo } from "../middlewares/checkRole.js";
import protect from "../middlewares/auth.js";

const router = Router();

router.get("/", listDivisions);
router.post("/", protect, restrictTo("Admin"), createDivisionHandler);
router.get("/:id/statistics", getDivisionStatisticsHandler);
router.patch("/:id", protect, restrictTo("Admin"), updateDivisionHandler);

export default router;
