import express from "express";
import AttendanceModel from "../models/Attendance.model.js";
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
  removeAttendance,
  getMyPermissionRequests,
} from "../controllers/attendance.controller.js";
import protect from "../middlewares/auth.js";
import { attendanceManagerOnly } from "../middlewares/attendanceManagerOnly.js";

const router = express.Router();

router.use(protect);

// --- Staff routes (lead instructor or helper with `attendance` permission) ---

router.post(
  "/sessions/:sessionId/attendance/bulk",
  attendanceManagerOnly,
  bulkMarkAttendance,
);
router.post(
  "/sessions/:sessionId/attendance/:studentId",
  attendanceManagerOnly,
  markIndividualAttendance,
);
router.delete(
  "/sessions/:sessionId/attendance/:studentId",
  attendanceManagerOnly,
  removeAttendance,
);
router.get(
  "/sessions/:sessionId/attendance",
  attendanceManagerOnly,
  getAttendanceSheet,
);
router.post(
  "/sessions/:sessionId/attendance/:studentId/excused",
  attendanceManagerOnly,
  markExecusedAbsence,
);
router.get(
  "/bootcamps/:bootcampId/attendance/report",
  attendanceManagerOnly,
  attendanceReport,
);
router.get(
  "/bootcamps/:bootcampId/attendance/export",
  attendanceManagerOnly,
  exportAttendanceReport,
);

// QR
router.post(
  "/sessions/:sessionId/attendance/qr/generate",
  attendanceManagerOnly,
  generateQRForSession,
);
router.post(
  "/sessions/:sessionId/attendance/qr/deactivate",
  attendanceManagerOnly,
  deactivateQR,
);

// Permission requests (staff)
router.get(
  "/bootcamps/:bootcampId/attendance/permission-requests",
  attendanceManagerOnly,
  getPermissionRequests,
);
router.post(
  "/attendance/permission-requests/:requestId/review",
  attendanceManagerOnly,
  reviewPermissionRequest,
);

// Live + finalize
router.get(
  "/sessions/:sessionId/attendance/live",
  attendanceManagerOnly,
  getLiveAttendance,
);
router.post(
  "/sessions/:sessionId/attendance/finalize",
  attendanceManagerOnly,
  finalizeAttendance,
);

// --- Student routes (any authenticated user; controllers enforce enrollment) ---

router.get("/student/bootcamps/:bootcampId/attendance", getPersonalAttendance);
router.get(
  "/student/bootcamps/:bootcampId/attendance/stat",
  getPersonalAttendancePercentage,
);
router.post("/attendance/scan", scanQRAndMarkAttendance);
router.post(
  "/sessions/:sessionId/attendance/permission-request",
  requestAttendancePermission,
);
router.get("/student/attendance/permission-requests", getMyPermissionRequests);

export default router;
