import express from "express";
import {
  getBootcamps,
  getSingleBootcamp,
  addHelper,
  getHelpersData,
  deleteHelper,
  getAllHelpers,
} from "../controllers/instructor.controller.js";
import protect from "../middlewares/auth.js";

/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Instructor-related endpoints
 */
const router = express.Router();

router.use(protect);
/**
 * @swagger
 * /instructor/bootcamps:
 *   get:
 *     summary: Get all bootcamps for the instructor
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bootcamps
 */
router.get("/", getBootcamps);
/**
 * @swagger
 * /instructor/bootcamps/{id}:
 *   get:
 *     summary: Get a single bootcamp by ID
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: Bootcamp details
 */
router.get("/:id", getSingleBootcamp);

// we have to add middleware to check if the instructor(user) is lead to the specific bootcamp so we will not perform both bootcamp existance check and lead instructor check inside a controller

// add  and update helper
/**
 * @swagger
 * /instructor/bootcamps/{id}/helpers:
 *   post:
 *     summary: Add or update a helper for a bootcamp
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Bootcamp ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               helperId:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Helper added/updated
 */
router.post("/:id/helpers", addHelper);

// list all helpers in the bootcamp
/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/helpers:
 *   get:
 *     summary: List all helpers in a bootcamp
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         schema:
 *           type: string
 *         required: true
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: List of helpers
 */
router.get("/:bootcampId/helpers", getAllHelpers);

// get single helper data with permissio 
/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/helpers/{helperId}:
 *   get:
 *     summary: Get single helper data with permissions
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         schema:
 *           type: string
 *         required: true
 *         description: Bootcamp ID
 *       - in: path
 *         name: helperId
 *         schema:
 *           type: string
 *         required: true
 *         description: Helper ID
 *     responses:
 *       200:
 *         description: Helper details
 */
router.get("/:bootcampId/helpers/:helperId", getHelpersData);

// delete helpers of bootcamp
/**
 * @swagger
 * /instructor/bootcamps/{bootcampId}/helpers/{helperId}:
 *   delete:
 *     summary: Delete a helper from a bootcamp
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         schema:
 *           type: string
 *         required: true
 *         description: Bootcamp ID
 *       - in: path
 *         name: helperId
 *         schema:
 *           type: string
 *         required: true
 *         description: Helper ID
 *     responses:
 *       200:
 *         description: Helper deleted
 */
router.delete("/:bootcampId/helpers/:helperId", deleteHelper);
export default router;
