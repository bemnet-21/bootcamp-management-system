import express from 'express';
import { login, refreshToken, resetRequest } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login)
router.post('/refresh', refreshToken)
router.post('/password-reset-request', resetRequest)

export default router;