import express from 'express';
import AttendanceModel from '../models/Attendance.model.js';
import {
    attendanceReport,
    bulkMarkAttendance,
    exportAttendanceReport,
    getAttendanceSheet,
    getPersonalAttendance,
    getPersonalAttendancePercentage,
    markExecusedAbsence,
    markIndividualAttendance,
    generateQRForSession,
    deactivateQR,
    scanQRAndMarkAttendance,
    requestAttendancePermission,
    getPermissionRequests,
    reviewPermissionRequest,
    getLiveAttendance,
    finalizeAttendance,
    removeAttendance
} from '../controllers/attendance.controller.js';
import protect from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/requirePermission.js';

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
 * /sessions/{sessionId}/attendance/{studentId}:
 *   delete:
 *     summary: Remove/unmark attendance for a student in a session
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
 *         description: Attendance removed successfully
 *       404:
 *         description: Attendance record not found
 */
router.delete('/sessions/:sessionId/attendance/:studentId', removeAttendance)
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

// QR Code Attendance Routes
/**
 * @swagger
 * /sessions/{sessionId}/attendance/qr/generate:
 *   post:
 *     summary: Generate QR code for session attendance
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
 *       201:
 *         description: QR code generated successfully
 *       404:
 *         description: Session not found
 */
router.post('/sessions/:sessionId/attendance/qr/generate', generateQRForSession);

/**
 * @swagger
 * /sessions/{sessionId}/attendance/qr/deactivate:
 *   post:
 *     summary: Deactivate QR code for session
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
 *         description: QR code deactivated successfully
 *       404:
 *         description: No active QR code found
 */
router.post('/sessions/:sessionId/attendance/qr/deactivate', deactivateQR);

/**
 * @swagger
 * /attendance/scan:
 *   post:
 *     summary: Scan QR code and mark attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid or expired QR code
 */
router.post('/attendance/scan', scanQRAndMarkAttendance);

// Permission Request Routes
/**
 * @swagger
 * /sessions/{sessionId}/attendance/permission-request:
 *   post:
 *     summary: Request attendance permission for a session
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
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission request submitted successfully
 *       400:
 *         description: Request already exists
 */
router.post('/sessions/:sessionId/attendance/permission-request', requestAttendancePermission);

/**
 * @swagger
 * /bootcamps/{bootcampId}/attendance/permission-requests:
 *   get:
 *     summary: Get attendance permission requests for a bootcamp
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Permission requests retrieved successfully
 */
router.get('/bootcamps/:bootcampId/attendance/permission-requests', getPermissionRequests);

/**
 * @swagger
 * /attendance/permission-requests/{requestId}/review:
 *   post:
 *     summary: Review attendance permission request
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission request reviewed successfully
 *       404:
 *         description: Request not found
 */
router.post('/attendance/permission-requests/:requestId/review', reviewPermissionRequest);

/**
 * @swagger
 * /sessions/{sessionId}/attendance/live:
 *   get:
 *     summary: Get live attendance feed for a session
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
 *         description: Live attendance retrieved successfully
 *       404:
 *         description: Session not found
 */
router.get('/sessions/:sessionId/attendance/live', getLiveAttendance);

/**
 * @swagger
 * /sessions/{sessionId}/attendance/finalize:
 *   post:
 *     summary: Finalize attendance and end session
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
 *         description: Attendance finalized successfully
 *       404:
 *         description: Session not found
 */
router.post('/sessions/:sessionId/attendance/finalize', finalizeAttendance);

export default router;