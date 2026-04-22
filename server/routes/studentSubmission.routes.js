import express from 'express'
import { getPersonalSubmissions, getSubmissionGrade, updateSubmission } from '../controllers/studentSubmission.controller.js'
import protect from '../middlewares/auth.js'
import { restrictTo } from '../middlewares/checkRole.js'
import upload from '../utils/multer.config.js'


const router = express.Router({ mergeParams: true })

/**
 * @swagger
 * /studentSubmissions:
 *   get:
 *     summary: Get personal submissions for the authenticated student
 *     tags: [StudentSubmissions]
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
 * /studentSubmissions/{submissionId}:
 *   put:
 *     summary: Update a student submission (upload file)
 *     tags: [StudentSubmissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Submission ID
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
 *         description: Submission updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/:submissionId', protect, restrictTo("Student"), upload.single('file'), updateSubmission)

/**
 * @swagger
 * /studentSubmissions/{submissionId}:
 *   get:
 *     summary: Get grade for a specific submission
 *     tags: [StudentSubmissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission grade
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
router.get('/:submissionId', protect, restrictTo("Student"), getSubmissionGrade)

export default router