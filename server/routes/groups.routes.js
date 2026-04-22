import express from "express";
import { createGroup } from "../controllers/groups.controller.js";
import protect from "../middlewares/auth.js";


const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group management
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}:
 *   post:
 *     summary: Create a new Group
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alpha Team
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// protect  for authenticated users only
router.use(protect)
router.post("/:bootcampId", createGroup);

export default router;
