import express from "express";
import {
  getBootcamps,
  getSingleBootcamp,
  addHelper,
  getHelpersData,
  deleteHelper,
  getAllHelpers,
} from "../controllers/instructor.controller.js";
import protect from "../middlewares/auth.js";
const router = express.Router();

router.use(protect);
router.get("/", getBootcamps);
router.get("/:id", getSingleBootcamp);

// we have to add middleware to check if the instructor(user) is lead to the specific bootcamp so we will not perform both bootcamp existance check and lead instructor check inside a controller

// add  and update helper
router.post("/:id/helpers", addHelper);

// list all helpers in the bootcamp
router.get("/:bootcampId/helpers", getAllHelpers);

// get single helper data with permissio 
router.get("/:bootcampId/helpers/:helperId", getHelpersData);

// delete helpers of bootcamp
router.delete("/:bootcampId/helpers/:helperId", deleteHelper);
export default router;
