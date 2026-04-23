import express from "express"
import protect from "../middlewares/auth.js";
import { checkInstructor } from "../middlewares/checkInstructor.js";
import { getStudentSubmission, gradeSubmission, pendingSubmissions, returnForReSubmission } from "../controllers/grading.controller.js";


/**
 * @swagger
 * tags:
 *   name: Grading
 *   description: Endpoints for grading student submissions
 */

const router = express.Router({ mergeParams: true });


/**
 * @swagger
 * /instructor/submissions/pending:
 *   get:
 *     summary: Get all pending submissions
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending submissions
 *       401:
 *         description: Unauthorized
 */
router.get('/pending', protect, checkInstructor, pendingSubmissions)

/**
 * @swagger
 * /instructor/submissions/{submissionId}:
 *   get:
 *     summary: Get a specific student submission
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the submission
 *     responses:
 *       200:
 *         description: Submission details
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
router.get('/:submissionId', protect, checkInstructor, getStudentSubmission)

/**
 * @swagger
 * /instructor/submissions/{submissionId}/grade:
 *   post:
 *     summary: Grade a student submission
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the submission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: number
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
router.post('/:submissionId/grade', protect, checkInstructor, gradeSubmission)

/**
 * @swagger
 * /instructor/submissions/{submissionId}/return:
 *   patch:
 *     summary: Return a submission for resubmission
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the submission
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission returned for resubmission
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
router.patch('/:submissionId/return', protect, checkInstructor, returnForReSubmission)

// TODO: implement a route to accept late submissions

export default router