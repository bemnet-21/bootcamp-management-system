import { Router } from "express";
import {
    createDivisionHandler,
    getDivisionStatisticsHandler,
    listDivisions,
    updateDivisionHandler,
} from "../controllers/division.controller.js";
import { restrictTo } from "../middlewares/checkRole.js";
import protect from "../middlewares/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Divisions
 *   description: Division management endpoints
 */

/**
 * @swagger
 * /divisions:
 *   get:
 *     summary: List all divisions
 *     tags: [Divisions]
 *     responses:
 *       200:
 *         description: List of divisions
 *   post:
 *     summary: Create a new division
 *     tags: [Divisions]
 *     responses:
 *       201:
 *         description: Division created
 */

/**
 * @swagger
 * /divisions/{id}/statistics:
 *   get:
 *     summary: Get division statistics by ID
 *     tags: [Divisions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Division statistics
 */

/**
 * @swagger
 * /divisions/{id}:
 *   patch:
 *     summary: Update division by ID
 *     tags: [Divisions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Division updated
 */

router.get("/", listDivisions);
router.post("/", protect, restrictTo("Admin"), createDivisionHandler);
router.get("/:id/statistics", getDivisionStatisticsHandler);
router.patch("/:id", protect, restrictTo("Admin"), updateDivisionHandler);

export default router;
