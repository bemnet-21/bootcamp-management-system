import express from 'express';
import { changePassword, login, logout, profile, refreshToken, resetConfirm, resetRequest, updateProfile } from '../controllers/auth.controller.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login)
router.post('/refresh', protect, refreshToken)
router.post('/password-reset-request', resetRequest)
router.post('/password-reset-confirm', resetConfirm)
router.post('/change-password', protect, changePassword)
router.get('/me', protect, profile)
router.put('/me', protect, updateProfile)
router.post('/logout', protect, logout)

export default router;