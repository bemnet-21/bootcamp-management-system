import express from 'express';
import AttendanceModel from '../models/Attendance.model.js';
import { attendanceReport, bulkMarkAttendance, exportAttendanceReport, getAttendanceSheet, getPersonalAttendance, getPersonalAttendancePercentage, markExecusedAbsence, markIndividualAttendance } from '../controllers/attendance.controller.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.use(protect)

/**
 * @swagger
 * /sessions/{sessionId}/attendance/bulk:
 *   post:
 *     summary: Bulk mark attendance for a session
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Present, Absent, Late, Excused]
 *                     note:
 *                       type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid attendance data
 */
router.post('/sessions/:sessionId/attendance/bulk', bulkMarkAttendance);
/**
 * @swagger
 * /sessions/{sessionId}/attendance/{studentId}:
 *   post:
 *     summary: Mark individual attendance for a student in a session
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Late, Excused]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid attendance data
 */
router.post('/sessions/:sessionId/attendance/:studentId', markIndividualAttendance)
/**
 * @swagger
 * /sessions/{sessionId}/attendance:
 *   get:
 *     summary: Get attendance sheet for a session
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Attendance sheet retrieved successfully
 *       404:
 *         description: Session not found
 */
router.get('/sessions/:sessionId/attendance', getAttendanceSheet)
/**
 * @swagger
 * /sessions/{sessionId}/attendance/{studentId}/excused:
 *   post:
 *     summary: Mark a student's absence as excused for a session
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Absence marked as excused
 *       400:
 *         description: Invalid request
 */
router.post('/sessions/:sessionId/attendance/:studentId/excused', markExecusedAbsence);
/**
 * @swagger
 * /bootcamps/{bootcampId}/attendance/report:
 *   get:
 *     summary: Get attendance report for a bootcamp
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     responses:
 *       200:
 *         description: Attendance report retrieved successfully
 *       404:
 *         description: Bootcamp not found
 */
router.get('/bootcamps/:bootcampId/attendance/report', attendanceReport);
/**
 * @swagger
 * /bootcamps/{bootcampId}/attendance/export:
 *   get:
 *     summary: Export attendance report for a bootcamp
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     responses:
 *       200:
 *         description: Attendance report exported successfully
 *       404:
 *         description: Bootcamp not found
 */
router.get('/bootcamps/:bootcampId/attendance/export', exportAttendanceReport);


/**
 * @swagger
 * /student/bootcamps/{bootcampId}/attendance:
 *   get:
 *     summary: Get personal attendance records for a student in a bootcamp
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     responses:
 *       200:
 *         description: Personal attendance records retrieved successfully
 *       404:
 *         description: Bootcamp or attendance records not found
 */
router.get('/student/bootcamps/:bootcampId/attendance', getPersonalAttendance);

/**
 * @swagger
 * /student/bootcamps/{bootcampId}/attendance/stat:
 *   get:
 *     summary: Get personal attendance percentage for a student in a bootcamp
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     responses:
 *       200:
 *         description: Personal attendance percentage retrieved successfully
 *       404:
 *         description: Bootcamp or attendance records not found
 */
router.get('/student/bootcamps/:bootcampId/attendance/stat', getPersonalAttendancePercentage)
export default router;