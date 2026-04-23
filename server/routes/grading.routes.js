import express from "express"
import protect from "../middlewares/auth.js";
import { checkInstructor } from "../middlewares/checkInstructor.js";
import { getStudentSubmission, gradeSubmission, pendingSubmissions, returnForReSubmission } from "../controllers/grading.controller.js";

const router = express.Router({ mergeParams: true });

router.get('/pending', protect, checkInstructor, pendingSubmissions)
router.get('/:submissionId', protect, checkInstructor, getStudentSubmission)
router.post('/:submissionId/grade', protect, checkInstructor, gradeSubmission)
router.patch('/:submissionId/return', protect, checkInstructor, returnForReSubmission)

// TODO: implement a route to accept late submissions

export default router