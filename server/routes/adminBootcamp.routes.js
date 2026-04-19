import express from "express";
import {
  createBootcamp,
  getAllBootcamps,
  assignLeadInstructor,
  getBootcampById,
  deleteBootcamp,
  updateBootcamp,
  softDeleteBootcamp
} from "../controllers/adminBootcamp.controller.js";
import protect from "../middlewares/auth.js";
import { restrictTo } from "../middlewares/checkRole.js";

/**
 * @swagger
 * tags:
 *   name: Bootcamp
 *   description: Bootcamp management (admin)
 */

/**
 * @swagger
 * /admin/bootcamps:
 *   post:
 *     summary: Create a new bootcamp
 *     tags: [Bootcamp]
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
 *               - division_id
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               division_id:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               leadInstructor:
 *                 type: string
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Bootcamp created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Division or instructor not found
 */

/**
 * @swagger
 * /admin/bootcamps:
 *   get:
 *     summary: List all bootcamps
 *     tags: [Bootcamp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bootcamps
 */

/**
 * @swagger
 * /admin/bootcamps/{id}:
 *   get:
 *     summary: Get bootcamp by ID
 *     tags: [Bootcamp]
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
 *       400:
 *         description: Invalid Bootcamp ID
 *       404:
 *         description: Bootcamp not found
 */

/**
 * @swagger
 * /admin/bootcamps/{id}:
 *   put:
 *     summary: Update a bootcamp
 *     tags: [Bootcamp]
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
 *               name:
 *                 type: string
 *               division_id:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               leadInstructor:
 *                 type: string
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bootcamp updated
 *       400:
 *         description: Invalid Bootcamp ID or validation error
 *       404:
 *         description: Bootcamp or instructor not found
 */

/**
 * @swagger
 * /admin/bootcamps/{id}:
 *   delete:
 *     summary: Permanently delete a bootcamp
 *     tags: [Bootcamp]
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
 *         description: Bootcamp deleted
 *       400:
 *         description: Invalid Bootcamp ID
 *       404:
 *         description: Bootcamp not found
 */

/**
 * @swagger
 * /admin/bootcamps/{id}/assign-lead:
 *   patch:
 *     summary: Assign lead instructor to bootcamp
 *     tags: [Bootcamp]
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
 *             required:
 *               - instructorId
 *             properties:
 *               instructorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead instructor assigned
 *       400:
 *         description: Validation error
 *       404:
 *         description: Bootcamp or instructor not found
 */

/**
 * @swagger
 * /admin/bootcamps/{id}/deactivate:
 *   patch:
 *     summary: Deactivate (soft delete) a bootcamp
 *     tags: [Bootcamp]
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
 *         description: Bootcamp deactivated
 *       400:
 *         description: Invalid Bootcamp ID
 *       404:
 *         description: Bootcamp not found
 */

const router = express.Router();
// protect  for admins only
router.use(protect, restrictTo("Admin"));
router.post("/", createBootcamp);
router.get("/", getAllBootcamps);
router.get("/:id", getBootcampById);
router.delete("/:id", deleteBootcamp);
router.put("/:id", updateBootcamp);
router.patch("/:id/assign-lead", assignLeadInstructor);
router.patch("/:id/deactivate", softDeleteBootcamp);
export default router;
