import express from "express";
import {
  createProgress,
  getProgressDetail,
  getAllWeekProgress,
  updateProgressDetail,
  getMissingGroup,
} from "../controllers/progress.controller.js";
import protect from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { tr } from "zod/v4/locales";

const router = express.Router({ mergeParams: true });

router.use(protect);
// create progress
router.post("/:groupId", createProgress);

// get progress detail
router.get(
  "/:groupId/:progressId",
  requirePermission({ student: true }),
  getProgressDetail,
);

// listb/all weekly submission|using bootcamp
router.get("/groups",requirePermission, getAllWeekProgress);

// update progress detail
router.put("/:groupId/:progressId", updateProgressDetail);

// list missing groups
router.get("/:weekNumber/missing",requirePermission, getMissingGroup);

export default router;
