import { Router } from "express";
import { getSystemOverview } from "../controllers/reports.controller.js";
import protect from "../middlewares/auth.js";
import { restrictTo } from "../middlewares/checkRole.js";

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Admin reports and analytics
 */

/**
 * @swagger
 * /admin/reports/overview:
 *   get:
 *     summary: Get system-wide statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bootcamps:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         inactive:
 *                           type: number
 *                     students:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         enrolled:
 *                           type: number
 *                     sessions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         completed:
 *                           type: number
 *                         scheduled:
 *                           type: number
 *                     divisions:
 *                       type: number
 *                     instructors:
 *                       type: number
 */

const router = Router();

// Protect all routes and restrict to Admin only
router.use(protect, restrictTo("Admin"));

router.get("/overview", getSystemOverview);

export default router;
