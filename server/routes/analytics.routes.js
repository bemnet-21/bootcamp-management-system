import express from "express";

const router = express.Router({ mergeParams: true });

import {
  getOverview,
  getTaskCompletion,
  getAttendanceTrend,
  getStudentPerformance,
} from "../controllers/anaytics.controller.js";

router.get("/overview" , getOverview);
router.get("/attendance", getAttendanceTrend);
router.get("/tasks", getTaskCompletion);
router.get("/students", getStudentPerformance);



export default router