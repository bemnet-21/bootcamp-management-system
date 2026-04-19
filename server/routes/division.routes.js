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
router.use(protect);
router.post("/", restrictTo("Admin"), createDivisionHandler);
router.get("/", listDivisions);
router.put("/:id", restrictTo("Admin"), updateDivisionHandler);
router.get("/:id", getDivisionDetail);
router.get("/:id/statistics", getDivisionStatisticsHandler);
router.delete("/:id", restrictTo("Admin"), deleteDivisionHandler);

export default router;
