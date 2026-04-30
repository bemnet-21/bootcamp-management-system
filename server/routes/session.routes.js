import express from "express";
import {
  createSession,
  getSingleSession,
  getSeassions,
  updateSession,
  deleteSession,
  getBootcampSeassions,
  cancelSession,
  startSession,
  endSession,
} from "../controllers/session.controller.js";
import protect from "../middlewares/auth.js";
import { checkLead } from "../middlewares/checkLead.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Session management endpoints
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/sessions:
 *   get:
 *     summary: List all sessions
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: List of sessions
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/sessions:
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
 * /bootcamps/{bootcampId}/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session data
 *   patch:
 *     summary: Update session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session updated
 *   delete:
 *     summary: Delete session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted
 *
 * /bootcamps/{bootcampId}/sessions/{id}/cancel:
 *   patch:
 *     summary: Cancel a session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
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
router.post("/", requirePermission("sessions"), createSession);
router.get(
  "/:sessionId",
  requirePermission({ permission: "sessions", student: true }),
  getSingleSession,
);
router.get("/", requirePermission("sessions", true), getBootcampSeassions);
router.patch("/:sessionId", requirePermission("sessions"), updateSession);
router.patch(
  "/:sessionId/cancel",
  requirePermission("sessions"),
  cancelSession,
);
router.patch(
  "/:sessionId/start",
  requirePermission("sessions"),
  startSession,
);
router.patch(
  "/:sessionId/end",
  requirePermission("sessions"),
  endSession,
);
router.delete("/:sessionId", checkLead, deleteSession);

// we should implement this for admin to see all seassions
// router.get("/", getSeassions);
// - send reminder not implementd
// - venue not implemented
export default router;
