import express from "express";
import protect from "../middlewares/auth.js";
import { checkInstructor } from "../middlewares/checkInstructor.js";
import {
  getFeedbackPerBootcamp,
  getFeedbackPerSession,
  instructorFeedbackStats,
  requestSessionFeedback,
} from "../controllers/instructorFeedback.controller.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/sessions/{sessionId}/request-feedback:
 *   post:
 *     summary: Request feedback from students for a session
 *     tags: [Instructor Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Feedback request sent to students
 *       400:
 *         description: Validation error
 *       404:
 *         description: Session not found in this bootcamp
 *       500:
 *         description: Internal server error
 */
router.post(
  "/sessions/:sessionId/request-feedback",
  protect,
  checkInstructor,
  requestSessionFeedback,
);

/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/feedback:
 *   get:
 *     summary: Get feedback for a bootcamp
 *     tags: [Instructor Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     responses:
 *       200:
 *         description: Feedback for the bootcamp retrieved successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/feedback", protect, checkInstructor, getFeedbackPerBootcamp);

/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/sessions/{sessionId}/feedback:
 *   get:
 *     summary: Get feedback for a specific session
 *     tags: [Instructor Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Feedback for the session retrieved successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  "/sessions/:sessionId/feedback",
  protect,
  checkInstructor,
  getFeedbackPerSession,
);

/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/feedback/stats:
 *   get:
 *     summary: Get instructor feedback statistics for a bootcamp
 *     tags: [Instructor Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     responses:
 *       200:
 *         description: Feedback statistics retrieved successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  "/feedback/stats",
  protect,
  checkInstructor,
  instructorFeedbackStats,
);

export default router;
