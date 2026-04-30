import express from "express";
import { getBootcampById, getStudentBootcamps } from "../controllers/bootcamp.controller.js";
import protect from "../middlewares/auth.js";

const router = express.Router({ mergeParams: true });

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
router.get("/", protect, getStudentBootcamps)
router.get("/:bootcampId", protect, getBootcampById);

export default router;
