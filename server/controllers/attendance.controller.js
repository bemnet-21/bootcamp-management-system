import SessionModel from "../models/Session.model.js";
import AttendanceModel from "../models/Attendance.model.js";
import BootcampModel from "../models/Bootcamp.model.js";
import AttendanceQRModel from "../models/AttendanceQR.model.js";
import AttendancePermissionRequestModel from "../models/AttendancePermissionRequest.model.js";
import EnrollmentModel from "../models/Enrollment.model.js";

import z from "zod";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

const bulkAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: z.enum(["Present", "Absent", "Excused"]),
        note: z.string().optional(),
      }),
    )
    .min(1),
  sessionId: z.string().min(1),
});

export const bulkMarkAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { records } = req.body;

    const parsedData = bulkAttendanceSchema.safeParse({ records, sessionId });
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Invalid attendance data",
        errors: parsedData.error.errors,
      });
    }

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }

    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const attendanceData = records.map((record) => ({
      session: sessionId,
      student: record.studentId,
      status: record.status,
      note: record.note || "",
      markedBy: req.user.id,
      markedAt: new Date(),
    }));

    await AttendanceModel.bulkWrite(
      attendanceData.map((record) => ({
        updateOne: {
          filter: { session: record.session, student: record.student },
          update: { $set: record },
          upsert: true,
        },
      })),
    );

    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAttendanceRecordsSchema = z.object({
  sessionId: z.string().min(1),
});

export const getAttendanceSheet = async (req, res) => {
  const parsedData = getAttendanceRecordsSchema.safeParse(req.params);
  if (!parsedData.success) {
    return res
      .status(400)
      .json({ message: "Invalid session ID", errors: parsedData.error.errors });
  }
  const { sessionId } = parsedData.data;

  try {
    const attendanceRecords = await AttendanceModel.find({ session: sessionId })
      .populate("student", "firstName lastName email")
      .populate("markedBy", "firstName lastName email");

    res.status(200).json({
      message: "Attendance sheet retrieved successfully",
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Error retrieving attendance sheet:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const markIndividualAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
  status: z.enum(["Present", "Absent", "Excused"]),
  note: z.string().optional(),
});

export const markIndividualAttendance = async (req, res) => {
  const parsedData = markIndividualAttendanceSchema.safeParse({
    ...req.body,
    ...req.params,
  });
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid attendance data",
      errors: parsedData.error.errors,
    });
  }
  const { sessionId, studentId, status, note } = parsedData.data;

  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await AttendanceModel.findOneAndUpdate(
      { session: sessionId, student: studentId },
      { status, note, markedBy: req.user.id, markedAt: new Date() },
      { new: true, upsert: true },
    );

    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking individual attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const markExecusedAbsenceSchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
  note: z.string(),
});

export const markExecusedAbsence = async (req, res) => {
  const parsedData = markExecusedAbsenceSchema.safeParse({
    ...req.body,
    ...req.params,
  });
  if (!parsedData.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", errors: parsedData.error.errors });
  }

  const { sessionId, studentId, note } = parsedData.data;

  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await AttendanceModel.findOneAndUpdate(
      { session: sessionId, student: studentId },
      { status: "Excused", note, markedBy: req.user.id, markedAt: new Date() },
      { new: true, upsert: true },
    );

    res.status(200).json({ message: "Excused absence marked successfully" });
  } catch (error) {
    console.error("Error marking excused absence:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const attendanceReportSchema = z.object({
  bootcampId: z.string().min(1),
});

export const attendanceReport = async (req, res) => {
  const parsedData = attendanceReportSchema.safeParse(req.params);

  if (!parsedData.success)
    return res.status(400).json({
      message: "Invalid bootcamp ID",
      errors: parsedData.error.errors,
    });
  const { bootcampId } = parsedData.data;

  try {
    const sessions = await SessionModel.find({ bootcamp: bootcampId });
    const sessionIds = sessions.map((session) => session._id);

    const attendanceRecords = await AttendanceModel.find({
      session: { $in: sessionIds },
    })
      .populate("student", "firstName lastName email")
      .populate("session", "title startTime endTime");

    const report = attendanceRecords.map((record) => ({
      studentName: `${record.student.firstName} ${record.student.lastName}`,
      studentEmail: record.student.email,
      sessionTitle: record.session.title,
      sessionStart: record.session.startTime,
      sessionEnd: record.session.endTime,
      status: record.status,
      note: record.note,
    }));

    res.status(200).json({
      message: "Attendance report generated successfully",
      report,
    });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const exportAttendanceReportSchema = z.object({
  bootcampId: z.string().min(1),
});

export const exportAttendanceReport = async (req, res) => {
  const parsedData = exportAttendanceReportSchema.safeParse(req.params);
  if (!parsedData.success)
    return res.status(400).json({
      message: "Invalid bootcamp ID",
      errors: parsedData.error.errors,
    });

  const { bootcampId } = parsedData.data;

  try {
    const bootcamp = await BootcampModel.findById(bootcampId);
    const bootcampTitle = bootcamp ? bootcamp.name : "Bootcamp";

    const sessions = await SessionModel.find({ bootcamp: bootcampId });
    const sessionIds = sessions.map((session) => session._id);

    const attendanceRecords = await AttendanceModel.find({
      session: { $in: sessionIds },
    })
      .populate("student", "firstName lastName email")
      .populate("session", "title startTime endTime")
      .populate("markedBy", "firstName lastName email");

    const formatDateTime = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    const reportData = attendanceRecords.map((record) => ({
      studentName: `${record.student.firstName} ${record.student.lastName}`,
      studentEmail: record.student.email,
      sessionTitle: record.session.title,
      sessionStart: formatDateTime(record.session.startTime),
      sessionEnd: formatDateTime(record.session.endTime),
      status: record.status,
      note: record.note,
      markedBy: record.markedBy
        ? `${record.markedBy.firstName} ${record.markedBy.lastName}`
        : "N/A",
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Student Email", key: "studentEmail", width: 30 },
      { header: "Session Title", key: "sessionTitle", width: 25 },
      { header: "Session Start", key: "sessionStart", width: 20 },
      { header: "Session End", key: "sessionEnd", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Note", key: "note", width: 30 },
      { header: "Marked By", key: "markedBy", width: 25 },
    ];

    worksheet.insertRow(1, [`Bootcamp: ${bootcampTitle}`]);
    worksheet.insertRow(2, []);
    worksheet.mergeCells(`A1:H1`);
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    reportData.forEach((row) => {
      const addedRow = worksheet.addRow(row);
      const statusCell = addedRow.getCell("status");
      let fillColor = null;
      switch (row.status) {
        case "Present":
          fillColor = "FFB6EF8B";
          break;
        case "Absent":
          fillColor = "FFFF7F7F";
          break;
        case "Excused":
          fillColor = "FF8ECFFF";
          break;
        default:
          fillColor = null;
      }
      if (fillColor) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      }
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${bootcampTitle}_attendance_report.xlsx`,
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting attendance report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPersonalAttendanceSchema = z.object({
  bootcampId: z.string().min(1),
});

export const getPersonalAttendance = async (req, res) => {
  const parsedData = getPersonalAttendanceSchema.safeParse(req.params);
  if (!parsedData.success)
    return res.status(400).json({
      message: "Invalid bootcamp ID",
      errors: parsedData.error.errors,
    });

  const { bootcampId } = parsedData.data;
  try {
    const sessions = await SessionModel.find({ bootcamp: bootcampId });
    const sessionIds = sessions.map((session) => session._id);

    const attendanceRecords = await AttendanceModel.find({
      student: req.user.id,
      session: { $in: sessionIds },
    }).populate("session", "title startTime endTime");

    const attendance = attendanceRecords.map((record) => ({
      sessionTitle: record.session.title,
      sessionStart: record.session.startTime,
      sessionEnd: record.session.endTime,
      status: record.status,
      note: record.note,
    }));

    res.status(200).json({
      message: "Personal attendance retrieved successfully",
      attendance,
    });
  } catch (error) {
    console.error("Error retrieving personal attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPersonalAttendancePercentage = async (req, res) => {
  const parsedData = getPersonalAttendanceSchema.safeParse(req.params);
  if (!parsedData.success)
    return res.status(400).json({
      message: "Invalid bootcamp ID",
      errors: parsedData.error.errors,
    });

  const { bootcampId } = parsedData.data;
  try {
    const sessions = await SessionModel.find({ bootcamp: bootcampId });
    const sessionIds = sessions.map((session) => session._id);

    const totalSessions = sessionIds.length;
    const attendedSessions = await AttendanceModel.countDocuments({
      student: req.user.id,
      session: { $in: sessionIds },
      status: "Present",
    });
    const attendancePercentage =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    res.status(200).json({
      message: "Personal attendance percentage retrieved successfully",
      attendancePercentage: attendancePercentage.toFixed(2) + "%",
    });
  } catch (error) {
    console.error("Error calculating attendance percentage:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Generate QR code for session attendance
const generateQRSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const generateQRForSession = async (req, res) => {
  const parseResult = generateQRSchema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { sessionId } = parseResult.data;
  const userId = req.user.id;

  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Session not found" });
    }

    if (session.status !== "In Progress") {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "QR code can only be generated for sessions that are in progress. Please start the session first.",
      });
    }

    const existingQR = await AttendanceQRModel.findOne({
      session: sessionId,
      isActive: true,
    });
    if (existingQR) {
      const qrCodeDataURL = await QRCode.toDataURL(existingQR.qrToken);
      return res.status(200).json({
        message: "Active QR code already exists",
        qrToken: existingQR.qrToken,
        qrCodeImage: qrCodeDataURL,
        expiresAt: existingQR.expiresAt,
        isActive: existingQR.isActive,
      });
    }

    const qrToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const qrRecord = await AttendanceQRModel.create({
      session: sessionId,
      bootcamp: session.bootcamp,
      qrToken,
      isActive: true,
      expiresAt,
      createdBy: userId,
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrToken);

    return res.status(201).json({
      message: "QR code generated successfully",
      qrToken: qrRecord.qrToken,
      qrCodeImage: qrCodeDataURL,
      expiresAt: qrRecord.expiresAt,
      isActive: qrRecord.isActive,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Deactivate QR code
export const deactivateQR = async (req, res) => {
  const parseResult = generateQRSchema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { sessionId } = parseResult.data;

  try {
    const qrRecord = await AttendanceQRModel.findOne({
      session: sessionId,
      isActive: true,
    });

    if (!qrRecord) {
      return res.status(200).json({
        message: "QR code already deactivated or not found",
      });
    }

    qrRecord.isActive = false;
    await qrRecord.save();

    return res.status(200).json({
      message: "QR code deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating QR code:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Scan QR and mark attendance
const scanQRSchema = z.object({
  qrToken: z.string().min(1, "QR token is required"),
});

export const scanQRAndMarkAttendance = async (req, res) => {
  const parseResult = scanQRSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { qrToken } = parseResult.data;
  const studentId = req.user.id;

  try {
    const qrRecord = await AttendanceQRModel.findOne({ qrToken }).populate(
      "session",
    );
    if (!qrRecord) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Invalid QR code" });
    }

    if (!qrRecord.isActive) {
      return res.status(400).json({
        error: "Invalid QR",
        message: "This QR code has been deactivated",
      });
    }

    if (new Date() > qrRecord.expiresAt) {
      return res
        .status(400)
        .json({ error: "Expired QR", message: "This QR code has expired" });
    }

    const enrollment = await EnrollmentModel.findOne({
      bootcamp: qrRecord.bootcamp,
      student: studentId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not enrolled in this bootcamp",
      });
    }

    const existingAttendance = await AttendanceModel.findOne({
      session: qrRecord.session._id,
      student: studentId,
    });

    if (existingAttendance) {
      return res.status(400).json({
        error: "Already Marked",
        message: "Your attendance has already been marked for this session",
        status: existingAttendance.status,
      });
    }

    const session = qrRecord.session;

    const attendance = await AttendanceModel.create({
      session: session._id,
      student: studentId,
      status: "Present",
      markedBy: studentId,
      note: "Marked via QR scan",
      markedAt: new Date(),
    });

    return res.status(201).json({
      message: "Attendance marked as Present",
      attendance: {
        session: {
          _id: session._id,
          title: session.title,
          startTime: session.startTime,
        },
        status: "Present",
        markedAt: attendance.markedAt,
      },
    });
  } catch (error) {
    console.error("Error scanning QR code:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Request attendance permission
const requestPermissionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  reason: z.string().min(1, "Reason is required"),
});

export const requestAttendancePermission = async (req, res) => {
  const parseResult = requestPermissionSchema.safeParse({
    sessionId: req.params.sessionId,
    reason: req.body.reason,
  });

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { sessionId, reason } = parseResult.data;
  const studentId = req.user.id;

  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Session not found" });
    }

    const enrollment = await EnrollmentModel.findOne({
      bootcamp: session.bootcamp,
      student: studentId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not enrolled in this bootcamp",
      });
    }

    const existingRequest = await AttendancePermissionRequestModel.findOne({
      session: sessionId,
      student: studentId,
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "Request Exists",
        message: `You already have a ${existingRequest.status.toLowerCase()} permission request for this session`,
      });
    }

    const permissionRequest = await AttendancePermissionRequestModel.create({
      session: sessionId,
      student: studentId,
      bootcamp: session.bootcamp,
      reason,
    });

    return res.status(201).json({
      message: "Permission request submitted successfully",
      request: permissionRequest,
    });
  } catch (error) {
    console.error("Error requesting permission:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Remove/unmark attendance
const removeAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
});

export const removeAttendance = async (req, res) => {
  const parsedData = removeAttendanceSchema.safeParse(req.params);
  if (!parsedData.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", errors: parsedData.error.errors });
  }

  const { sessionId, studentId } = parsedData.data;

  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const deleted = await AttendanceModel.findOneAndDelete({
      session: sessionId,
      student: studentId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({ message: "Attendance removed successfully" });
  } catch (error) {
    console.error("Error removing attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get permission requests for bootcamp
const getPermissionRequestsSchema = z.object({
  bootcampId: z.string().min(1, "Bootcamp ID is required"),
});

export const getPermissionRequests = async (req, res) => {
  const parseResult = getPermissionRequestsSchema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { bootcampId } = parseResult.data;
  const status = req.query.status || "Pending";

  try {
    const requests = await AttendancePermissionRequestModel.find({
      bootcamp: bootcampId,
      status,
    })
      .populate("student", "firstName lastName email")
      .populate("session", "title startTime endTime")
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Permission requests retrieved successfully",
      requests,
    });
  } catch (error) {
    console.error("Error getting permission requests:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Review permission request
const reviewPermissionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(["approve", "reject"], "Action must be 'approve' or 'reject'"),
  note: z.string().optional(),
});

export const reviewPermissionRequest = async (req, res) => {
  const parseResult = reviewPermissionSchema.safeParse({
    requestId: req.params.requestId,
    action: req.body.action,
    note: req.body.note,
  });

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { requestId, action, note } = parseResult.data;
  const reviewerId = req.user.id;

  try {
    const request = await AttendancePermissionRequestModel.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Permission request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        error: "Invalid Status",
        message: `This request has already been ${request.status.toLowerCase()}`,
      });
    }

    request.status = action === "approve" ? "Approved" : "Rejected";
    request.reviewedBy = reviewerId;
    request.reviewNote = note || "";
    await request.save();

    const attendanceStatus = action === "approve" ? "Excused" : "Absent";

    await AttendanceModel.findOneAndUpdate(
      { session: request.session, student: request.student },
      {
        status: attendanceStatus,
        note: note || `Permission ${action}ed`,
        markedBy: reviewerId,
        markedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      message: `Permission request ${action}ed successfully`,
      request,
    });
  } catch (error) {
    console.error("Error reviewing permission request:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Get live attendance for a session
const getLiveAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const getLiveAttendance = async (req, res) => {
  const parseResult = getLiveAttendanceSchema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { sessionId } = parseResult.data;

  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Session not found" });
    }

    const enrollments = await EnrollmentModel.find({
      bootcamp: session.bootcamp,
      status: "active",
    }).populate("student", "firstName lastName email");

    const attendanceRecords = await AttendanceModel.find({ session: sessionId })
      .populate("student", "firstName lastName email")
      .populate("markedBy", "firstName lastName");

    const approvedPermissions = await AttendancePermissionRequestModel.find({
      session: sessionId,
      status: "Approved",
    }).select("student");

    const approvedStudentIds = approvedPermissions.map((p) =>
      p.student.toString(),
    );

    const liveAttendance = enrollments
      .filter((enrollment) => enrollment.student != null)
      .map((enrollment) => {
        const studentId = enrollment.student._id.toString();
        const attendanceRecord = attendanceRecords.find(
          (a) => a.student._id.toString() === studentId,
        );

        return {
          student: {
            _id: enrollment.student._id,
            firstName: enrollment.student.firstName,
            lastName: enrollment.student.lastName,
            email: enrollment.student.email,
          },
          status: attendanceRecord ? attendanceRecord.status : "Not Marked",
          markedAt: attendanceRecord ? attendanceRecord.markedAt : null,
          hasApprovedPermission: approvedStudentIds.includes(studentId),
        };
      });

    const stats = {
      total: enrollments.length,
      present: attendanceRecords.filter((a) => a.status === "Present").length,
      absent: attendanceRecords.filter((a) => a.status === "Absent").length,
      excused: attendanceRecords.filter((a) => a.status === "Excused").length,
      notMarked: enrollments.length - attendanceRecords.length,
    };

    return res.status(200).json({
      message: "Live attendance retrieved successfully",
      attendance: liveAttendance,
      stats,
    });
  } catch (error) {
    console.error("Error getting live attendance:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Finalize attendance and end session
const finalizeAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const finalizeAttendance = async (req, res) => {
  const parseResult = finalizeAttendanceSchema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation Error",
      message: parseResult.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { sessionId } = parseResult.data;
  const userId = req.user.id;

  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Session not found" });
    }

    const enrollments = await EnrollmentModel.find({
      bootcamp: session.bootcamp,
      status: "active",
    }).populate("student");

    const validEnrollments = enrollments.filter((e) => e.student != null);

    const existingAttendance = await AttendanceModel.find({
      session: sessionId,
    });
    const markedStudentIds = existingAttendance.map((a) =>
      a.student.toString(),
    );

    // Treat both Approved and still-Pending requests as Excused at finalize time
    const excusablePermissions = await AttendancePermissionRequestModel.find({
      session: sessionId,
      status: { $in: ["Approved", "Pending"] },
    });
    const excusableStudentIds = excusablePermissions.map((p) =>
      p.student.toString(),
    );

    // Auto-approve any still-pending requests so they are not left dangling
    await AttendancePermissionRequestModel.updateMany(
      { session: sessionId, status: "Pending" },
      {
        status: "Approved",
        reviewedBy: userId,
        reviewNote: "Auto-approved on session finalize",
      },
    );

    const bulkOps = [];
    for (const enrollment of validEnrollments) {
      const studentId = enrollment.student._id.toString();

      if (markedStudentIds.includes(studentId)) {
        continue;
      }

      if (excusableStudentIds.includes(studentId)) {
        bulkOps.push({
          updateOne: {
            filter: { session: sessionId, student: studentId },
            update: {
              status: "Excused",
              note: "Approved permission request",
              markedBy: userId,
              markedAt: new Date(),
            },
            upsert: true,
          },
        });
      } else {
        bulkOps.push({
          updateOne: {
            filter: { session: sessionId, student: studentId },
            update: {
              status: "Absent",
              note: "Did not attend",
              markedBy: userId,
              markedAt: new Date(),
            },
            upsert: true,
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await AttendanceModel.bulkWrite(bulkOps);
    }

    await AttendanceQRModel.updateMany(
      { session: sessionId, isActive: true },
      { isActive: false },
    );

    session.status = "Completed";
    await session.save();

    return res.status(200).json({
      message: "Attendance finalized successfully",
      studentsMarked: bulkOps.length,
      sessionStatus: session.status,
      totalStudents: validEnrollments.length,
    });
  } catch (error) {
    console.error("Error finalizing attendance:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get the logged-in student's own permission requests
export const getMyPermissionRequests = async (req, res) => {
  try {
    const studentId = req.user.id;

    const requests = await AttendancePermissionRequestModel.find({
      student: studentId,
    })
      .populate("session", "title startTime endTime bootcamp")
      .populate("bootcamp", "name")
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Your permission requests retrieved successfully",
      requests,
    });
  } catch (error) {
    console.error("Error getting my permission requests:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
