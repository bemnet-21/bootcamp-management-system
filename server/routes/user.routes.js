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

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: User created
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *   patch:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */



router.post("/", protect, restrictTo("Admin"), createUser);
router.get("/", protect, restrictTo("Admin"), listUsers);
router.get("/:id", protect, restrictTo("Admin"), getUserById);
router.patch("/:id", protect, restrictTo("Admin"), updateUser);
router.delete("/:id", protect, restrictTo("Admin"), deleteUser);
router.patch("/:id/status", protect, restrictTo("Admin"), updateStatus)
export default router;
