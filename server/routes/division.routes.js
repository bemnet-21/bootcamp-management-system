import { Router } from "express";
import {
  createDivisionHandler,
  getDivisionStatisticsHandler,
  listDivisions,
  updateDivisionHandler,
  getDivisionDetail,
  deleteDivisionHandler,
} from "../controllers/division.controller.js";
import { restrictTo } from "../middlewares/checkRole.js";
import protect from "../middlewares/auth.js";

const router = Router();

router.post("/", protect, restrictTo("Admin"), createDivisionHandler);
router.get("/", listDivisions);
router.put("/:id", protect, restrictTo("Admin"), updateDivisionHandler);
router.get("/:id", getDivisionDetail);
router.get("/:id/statistics", getDivisionStatisticsHandler);
router.delete("/:id", protect, restrictTo("Admin"), deleteDivisionHandler);

export default router;
