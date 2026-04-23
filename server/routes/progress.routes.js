import express from "express";
import {
  createProgress,
  getProgressDetail,
  getAllWeekProgress,
  updateProgressDetail,
  getMissingGroup,
} from "../controllers/progress.controller.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);
// create progress
router.post("/:groupId", createProgress);

// get progress detail
router.get("/:groupId/:progressId", getProgressDetail);

// listb/all weekly submission|using bootcamp
router.get("/:bootcampId/groups", getAllWeekProgress);

// update progress detail
router.put("/:groupId/:progressId", updateProgressDetail);

// list missing groups 
router.get("/:bootcampId/:weekNumber/missing", getMissingGroup);

export default router;
