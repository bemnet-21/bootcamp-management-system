import express from "express";
import {
  createSession,
  getSingleSession,
  getSeassions,
  updateSession,
  deleteSession,
  cancelSession,
} from "../controllers/session.controller.js";
import protect from "../middlewares/auth.js";
import { checkInstructor } from "../middlewares/checkInstructor.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Session management endpoints
 */

/**
 * @swagger
 * /bootcamps/sessions:
 *   get:
 *     summary: List all sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of sessions
 */
 
/**
 * @swagger
 * /bootcamps/sessions/{bootcampId}:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
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
 *       201:
 *         description: Session created
 */
/**
 * @swagger
 * /bootcamps/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session data
 *   patch:
 *     summary: Update session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session updated
 *   delete:
 *     summary: Delete session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session deleted
 *
 * /bootcamps/sessions/{id}/cancel:
 *   patch:
 *     summary: Cancel a session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Session cancelled
 *       404:
 *         description: Session not found
 */

// authenticated only
router.use(protect);

router.get("/", getSeassions);
router.get("/:bootcampId", getSingleSession);

// both instructor and helper(w permission)
router.patch("/:bootcampId", requirePermission("sessions"), updateSession);
router.patch(
  "/:bootcampId/cancel",
  requirePermission("sessions"),
  cancelSession,
);
router.post("/:bootcampId", requirePermission("sessions"), createSession);

router.delete("/:bootcampId", checkInstructor, deleteSession);

// we need lead and heper so lead can and helper if he have the permission

export default router;
