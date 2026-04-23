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
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
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
router.use(protect);
router.post("/", createSession);
router.get("/", getSeassions);
router.get("/:id", getSingleSession);
router.patch("/:id", updateSession);
router.delete("/:id", deleteSession);
router.patch("/:id/cancel", cancelSession);

export default router;
