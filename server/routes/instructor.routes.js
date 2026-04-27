import express from "express";
import {
  getBootcamps,
  getSingleBootcamp,
  addHelper,
  getHelpersData,
  deleteHelper,
  getAllHelpers,
  updateHelper,
} from "../controllers/instructor.controller.js";
import protect from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { checkLead } from "../middlewares/checkLead.js";

/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Instructor-related endpoints
 */
const router = express.Router({ mergeParams: true });

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

router.get("/", checkLead, getSingleBootcamp);
router.get("/helpers", checkLead, getAllHelpers);
router.post("/helpers", checkLead, addHelper);
router.put("/helpers", checkLead, updateHelper);
router.get("/helpers/:helperId", checkLead, getHelpersData);
router.delete("/helpers/:helperId", checkLead, deleteHelper);



export default router;
