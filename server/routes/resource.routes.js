import express from "express";
import {
    createResource,
    getResources,
    downloadResource,
    deleteResource,
    getResourceById,
    updateResourceMetaData,
} from "../controllers/resource.controller.js";
import upload from "../utils/multer.config.js";
import protect from "../middlewares/auth.js";
import { checkInstructor } from "../middlewares/checkInstructor.js";
import { restrictTo } from "../middlewares/checkRole.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management endpoints
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/resources:
 *   get:
 *     summary: Get all resources for a bootcamp
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     responses:
 *       200:
 *         description: List of resources
 *   post:
 *     summary: Create a new resource for a bootcamp
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PDF, Image, ZIP, Link]
 *               url:
 *                 type: string
 *                 description: Required if no file is uploaded
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (PDF, JPG, PNG, ZIP)
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PDF, Image, ZIP, Link]
 *               url:
 *                 type: string
 *                 description: Required if no file is uploaded
 *     responses:
 *       201:
 *         description: Resource created
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/resources/{resourceId}/download:
 *   get:
 *     summary: Download a resource by ID for a bootcamp
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Resource file or Cloudinary URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Cloudinary or external URL (if not local file)
 *                 downloadCount:
 *                   type: integer
 *                   description: Number of times downloaded
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/resources/{resourceId}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Resource details
 *   delete:
 *     summary: Delete a resource by ID for a bootcamp
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Resource deleted
 *   put:
 *     summary: Update resource metadata
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PDF, Image, ZIP, Link]
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource updated
 */

router.post("/", protect, checkInstructor, upload.single("file"), createResource);
router.get("/", protect, getResources);
router.get("/:resourceId", protect, getResourceById);
router.get("/:resourceId/download", protect, restrictTo("Student"), downloadResource);
router.delete("/:resourceId", protect, checkInstructor, deleteResource);
router.put("/:resourceId", protect, checkInstructor, updateResourceMetaData)

export default router;