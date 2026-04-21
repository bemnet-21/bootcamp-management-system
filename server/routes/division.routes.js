import { Router } from "express";
import {
  createDivisionHandler,
  getDivisionStatisticsHandler,
  listDivisions,
  updateDivisionHandler,
  getDivisionDetail,
  deleteDivisionHandler,
} from "../controllers/division.controller.js";
import { restrictTo } from "../middlewares/checkRole.js";
import protect from "../middlewares/auth.js";


/**
 * @swagger
 * tags:
 *   name: Division
 *   description: Division management
 */

/**
 * @swagger
 * /admin/divisions:
 *   post:
 *     summary: Create a new division
 *     tags: [Division]
 *     security:
 *       - bearerAuth: []
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Division created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Division already exists
 */

/**
 * @swagger
 * /admin/divisions:
 *   get:
 *     summary: List all divisions
 *     tags: [Division]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of divisions
 */

/**
 * @swagger
 * /admin/divisions/{id}:
 *   get:
 *     summary: Get division details
 *     tags: [Division]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Division ID
 *     responses:
 *       200:
 *         description: Division details
 *       400:
 *         description: Invalid division id
 *       404:
 *         description: Division not found
 */

/**
 * @swagger
 * /admin/divisions/{id}:
 *   put:
 *     summary: Update a division
 *     tags: [Division]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Division ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Division updated
 *       400:
 *         description: Invalid division id or validation error
 *       404:
 *         description: Division not found
 *       409:
 *         description: Division already exists
 */

/**
 * @swagger
 * /admin/divisions/{id}/statistics:
 *   get:
 *     summary: Get division statistics
 *     tags: [Division]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Division ID
 *     responses:
 *       200:
 *         description: Division statistics
 *       400:
 *         description: Invalid division id
 *       404:
 *         description: Division not found
 */

/**
 * @swagger
 * /admin/divisions/{id}:
 *   delete:
 *     summary: Delete a division
 *     tags: [Division]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Division ID
 *     responses:
 *       200:
 *         description: Division deleted
 *       400:
 *         description: Invalid division id
 *       404:
 *         description: Division not found
 */

const router = Router();
router.use(protect);
router.post("/", restrictTo("Admin"), createDivisionHandler);
router.get("/", listDivisions);
router.put("/:id", restrictTo("Admin"), updateDivisionHandler);
router.get("/:id", getDivisionDetail);
router.get("/:id/statistics", getDivisionStatisticsHandler);
router.delete("/:id", restrictTo("Admin"), deleteDivisionHandler);

export default router;
