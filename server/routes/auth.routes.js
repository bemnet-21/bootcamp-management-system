import express from 'express';
import { changePassword, login, logout, profile, refreshToken, resetConfirm, resetRequest, updateProfile } from '../controllers/auth.controller.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', login)
router.post('/refresh', protect, refreshToken)
router.post('/password-reset-request', resetRequest)
router.post('/password-reset-confirm', resetConfirm)
router.post('/change-password', protect, changePassword)
router.get('/me', protect, profile)
router.put('/me', protect, updateProfile)
router.post('/logout', protect, logout)

export default router;