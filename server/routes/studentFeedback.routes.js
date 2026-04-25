import express from "express";
import { getFeedbackAwaitingSessions, getOwnFeedbackSubmissions, submitSessionFeedback, updateSessionFeedback } from "../controllers/studentFeedback.controller.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * /student/sessions/feedback-pending:
 *   get:
 *     summary: Get sessions awaiting feedback from the student
 *     tags: [Student Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions awaiting feedback retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/feedback-pending', protect, getFeedbackAwaitingSessions);

/**
 * @swagger
 * /student/sessions/{sessionId}/feedback:
 *   post:
 *     summary: Submit feedback for a session
 *     tags: [Student Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.post('/:sessionId/feedback', protect, submitSessionFeedback)

/**
 * @swagger
 * /student/sessions/{sessionId}/feedback/my:
 *   get:
 *     summary: Get student's own feedback submission for a session
 *     tags: [Student Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.get('/:sessionId/feedback/my', protect, getOwnFeedbackSubmissions)

/**
 * @swagger
 * /student/sessions/{sessionId}/feedback:
 *   put:
 *     summary: Update feedback for a session
 *     tags: [Student Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Feedback or session not found
 *       500:
 *         description: Internal server error
 */
router.put('/:sessionId/feedback', protect, updateSessionFeedback)
export default router;