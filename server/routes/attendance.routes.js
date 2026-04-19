import express from 'express';
import AttendanceModel from '../models/Attendance.model.js';
import { bulkMarkAttendance } from '../controllers/attendance.controller.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.use(protect)

router.post('/sessions/:sessionId/attendance', bulkMarkAttendance);

export default router;