import express from "express"
import protect from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
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
 * /instructor/bootcamps/{bootcampId}/submissions/pending:
 *   get:
 *     summary: Get all pending submissions for a bootcamp
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: List of pending submissions
 *       401:
 *         description: Unauthorized
 */
router.get('/pending', protect, requirePermission("tasks"), pendingSubmissions)

/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/submissions/{submissionId}:
 *   get:
 *     summary: Get a specific student submission
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
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
router.get('/:submissionId', protect, requirePermission("tasks"), getStudentSubmission)

/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/submissions/{submissionId}/grade:
 *   post:
 *     summary: Grade a student submission
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
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
 *               score:
 *                 type: number
 *               instructorFeedback:
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
router.post('/:submissionId/grade', protect, requirePermission("tasks"), gradeSubmission)

/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/submissions/{submissionId}/return:
 *   patch:
 *     summary: Return a submission for resubmission
 *     tags: [Grading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
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
 *               instructorFeedback:
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
router.patch('/:submissionId/return', protect, requirePermission("tasks"), returnForReSubmission)

// TODO: implement a route to accept late submissions

export default router