import express from "express";
import {
  getBootcampById,
  getMyBootcamps,
  getMyBootcampRole,
} from "../controllers/bootcamp.controller.js";
import protect from "../middlewares/auth.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /bootcamps:
 *   get:
 *     summary: Get all bootcamps for authenticated user
 *     description: Returns all bootcamps where user is lead instructor, helper, or enrolled student
 *     tags: [Bootcamps]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bootcamps with roles
 */
router.get("/", protect, getMyBootcamps);

/**
 * @swagger
 * /bootcamps/{bootcampId}/role:
 *   get:
 *     summary: Get user's role and permissions for a bootcamp
 *     description: Returns the user's role (lead_instructor, helper, or student) and permissions
 *     tags: [Bootcamps]
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
 *         description: User's role and permissions
 *       403:
 *         description: User does not have access to this bootcamp
 *       404:
 *         description: Bootcamp not found
 */
router.get("/:bootcampId/role", protect, getMyBootcampRole);

/**
 * @swagger
 * /bootcamps/{bootcampId}:
 *   get:
 *     summary: Get bootcamp details for authenticated user
 *     description: Returns bootcamp details if user is lead instructor, helper, or enrolled student
 *     tags: [Bootcamps]
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
 *         description: Bootcamp details
 *       403:
 *         description: User does not have access to this bootcamp
 *       404:
 *         description: Bootcamp not found
 */
router.get("/:bootcampId", protect, getBootcampById);

export default router;
