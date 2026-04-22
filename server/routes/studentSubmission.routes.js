import express from 'express'
import { getPersonalSubmissions, getSubmissionGrade, updateSubmission } from '../controllers/studentSubmission.controller.js'
import protect from '../middlewares/auth.js'
import { restrictTo } from '../middlewares/checkRole.js'
import upload from '../utils/multer.config.js'

const router = express.Router({ mergeParams: true })
/**
 * @swagger
 * /student/submissions:
 *   get:
 *     summary: Get all submissions by the authenticated student
 *     tags: [Student Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of personal submissions
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, restrictTo("Student"), getPersonalSubmissions)
/**
 * @swagger
 * /student/submissions/{submissionId}:
 *   put:
 *     summary: Update a submission (resubmit work)
 *     tags: [Student Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the submission
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Submission updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
router.put('/:submissionId', protect, restrictTo("Student"), upload.single('file'), updateSubmission)
/**
 * @swagger
 * /student/submissions/{submissionId}:
 *   get:
 *     summary: Get the grade for a specific submission
 *     tags: [Student Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the submission
 *     responses:
 *       200:
 *         description: Submission grade details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
router.get('/:submissionId', protect, restrictTo("Student"), getSubmissionGrade)

export default router