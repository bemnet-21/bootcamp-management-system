import express from 'express'
import protect from '../middlewares/auth.js';
import { getNotifications } from '../controllers/notifications.controller.js';

const router = express.Router();
router.get('/', protect, getNotifications)


export default router;