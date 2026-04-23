import express from "express";
import { getFeedbackAwaitingSessions, getOwnFeedbackSubmissions, submitSessionFeedback, updateSessionFeedback } from "../controllers/studentFeedback.controller.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.get('/feedback-pending', protect, getFeedbackAwaitingSessions);
router.post('/:sessionId/feedback', protect, submitSessionFeedback)
router.get('/:sessionId/feedback/my', protect, getOwnFeedbackSubmissions)
router.put('/:sessionId/feedback', protect, updateSessionFeedback)
export default router;