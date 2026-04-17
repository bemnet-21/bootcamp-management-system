import express from 'express';
import { login, refreshToken, resetConfirm, resetRequest } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login)
router.post('/refresh', refreshToken)
router.post('/password-reset-request', resetRequest)
router.post('/password-reset-confirm', resetConfirm)

export default router;