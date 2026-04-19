import { Router } from "express";
import jwt from "jsonwebtoken";
import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateStatus,
    updateUser,
} from "../controllers/user.controller.js";
import protect from "../middlewares/auth.js";
import { restrictTo } from "../middlewares/checkRole.js";


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - role
 *               - divisions
 *               - status
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Instructor, Student]
 *               divisions:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Suspended, Graduated]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by division
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: List of users
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       400:
 *         description: Invalid user id
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Instructor, Student]
 *               divisions:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Suspended, Graduated]
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid user id or validation error
 *       404:
 *         description: User not found
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Invalid user id
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Suspended, Graduated]
 *     responses:
 *       200:
 *         description: User status updated
 *       400:
 *         description: Invalid user id or status
 *       404:
 *         description: User not found
 */

const router = Router();
router.post("/", protect, restrictTo("Admin"), createUser);
router.get("/", protect, restrictTo("Admin"), listUsers);
router.get("/:id", protect, restrictTo("Admin"), getUserById);
router.patch("/:id", protect, restrictTo("Admin"), updateUser);
router.delete("/:id", protect, restrictTo("Admin"), deleteUser);
router.patch("/:id/status", protect, restrictTo("Admin"), updateStatus)
export default router;
