import express from "express";
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

/* ------------------------------------------------------------------ */
/* IMPORTANT: specific paths MUST be declared BEFORE the catch-all     */
/* `:studentId` route, otherwise Express routes /finalize, /live, etc. */
/* into markIndividualAttendance and you get "Invalid attendance data" */
/* ------------------------------------------------------------------ */

/* --- Student-only routes (no manager check) --- */
router.get("/student/attendance/permission-requests", getMyPermissionRequests);
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

/* --- Staff specific (sub-path) routes — declared BEFORE the dynamic
       `:studentId` ones below --- */

router.post(
  "/sessions/:sessionId/attendance/bulk",
  attendanceManagerOnly,
  bulkMarkAttendance,
);

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

router.get(
  "/sessions/:sessionId/attendance",
  attendanceManagerOnly,
  getAttendanceSheet,
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

/* --- Dynamic `:studentId` routes — MUST come last --- */
router.post(
  "/sessions/:sessionId/attendance/:studentId/excused",
  attendanceManagerOnly,
  markExecusedAbsence,
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

export default router;
