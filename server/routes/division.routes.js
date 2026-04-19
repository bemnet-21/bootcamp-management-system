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

const router = Router();
<<<<<<< HEAD

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

=======
router.use(protect);
router.post("/", restrictTo("Admin"), createDivisionHandler);
>>>>>>> 53856755866cc83b3eaca97912cf6c7b3c0ecbfb
router.get("/", listDivisions);
router.put("/:id", restrictTo("Admin"), updateDivisionHandler);
router.get("/:id", getDivisionDetail);
router.get("/:id/statistics", getDivisionStatisticsHandler);
router.delete("/:id", restrictTo("Admin"), deleteDivisionHandler);

export default router;
