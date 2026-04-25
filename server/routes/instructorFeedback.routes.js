import express from 'express'
import protect from '../middlewares/auth.js';
import { checkInstructor } from '../middlewares/checkInstructor.js';
import { getFeedbackPerBootcamp, getFeedbackPerSession, instructorFeedbackStats } from '../controllers/instructorFeedback.controller.js';

const router = express.Router({ mergeParams: true });
router.get('/feedback', protect, checkInstructor, getFeedbackPerBootcamp)
router.get('/sessions/:sessionId/feedback', protect, checkInstructor, getFeedbackPerSession)
router.get('/feedback/stats', protect, checkInstructor, instructorFeedbackStats)

export default router;