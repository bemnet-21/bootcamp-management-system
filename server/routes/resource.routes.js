import express from "express";
import {
    createResource,
    getResources,
    downloadResource,
    deleteResource,
} from "../controllers/resource.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management endpoints
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of resources
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     responses:
 *       201:
 *         description: Resource created
 */

/**
 * @swagger
 * /resources/{id}/download:
 *   get:
 *     summary: Download a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource file
 */

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource deleted
 */

router.post("/resources", createResource);
router.get("/resources", getResources);
router.get("/resources/:id/download", downloadResource);
router.delete("/resources/:id", deleteResource);

export default router;