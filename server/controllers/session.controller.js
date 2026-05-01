import { z } from "zod";
import mongoose from "mongoose";
import SessionModel from "../models/Session.model.js";
import BootcampModel from "../models/Bootcamp.model.js";
import UserModel from "../models/User.model.js";
import EnrollmentModel from "../models/Enrollment.model.js";
import AttendanceModel from "../models/Attendance.model.js";
import AttendancePermissionRequestModel from "../models/AttendancePermissionRequest.model.js";
import { sendNotification } from "../utils/sendNotification.js";

// --- ZOD SCHEMAS ---

const baseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  teacher: z.string().min(1),
  division: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(["Scheduled", "Cancelled", "In Progress", "Completed"]).default("Scheduled"),
});

const OnlineSession = baseSchema.extend({
  type: z.literal("online"),
  link: z.string().url("Valid URL is required for online sessions"),
  location: z.undefined(),
});

const OnPlaceSession = baseSchema.extend({
  type: z.literal("onPlace"),
  location: z.string().min(1, "Location is required for on-site sessions"),
  link: z.undefined(),
});

const CreateSessionSchema = z.discriminatedUnion("type", [OnlineSession, OnPlaceSession]);

const UpdateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  teacher: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(["online", "onPlace"]).optional(),
  location: z.string().optional(),
  link: z.string().optional(),
  status: z.enum(["Scheduled", "Cancelled", "In Progress", "Completed"]).optional(),
});

// --- HELPER FUNCTIONS ---

const checkConflicts = async (excludeSessionId, teacher, location, start, end) => {
  // Instructor conflict
  const instructorConflict = await SessionModel.findOne({
    _id: { $ne: excludeSessionId },
    teacher,
    startTime: { $lt: end },
    endTime: { $gt: start },
    status: { $ne: "Cancelled" }
  });
  if (instructorConflict) return "Teacher is already assigned to another session at this time.";

  // Location conflict (only for on-site)
  if (location) {
    const locationConflict = await SessionModel.findOne({
      _id: { $ne: excludeSessionId },
      location,
      startTime: { $lt: end },
      endTime: { $gt: start },
      status: { $ne: "Cancelled" }
    });
    if (locationConflict) return "Location is already occupied at this time.";
  }
  return null;
};

// --- CONTROLLERS ---

export const createSession = async (req, res) => {
  try {
    const { bootcampId } = req.params;
    if (!mongoose.isValidObjectId(bootcampId)) {
      return res.status(400).json({ error: "Validation Error", message: "Invalid bootcamp id." });
    }

    const validatedData = CreateSessionSchema.parse(req.body);
    const start = new Date(validatedData.startTime);
    const end = new Date(validatedData.endTime);

    // Time logic
    if (end <= start) return res.status(400).json({ error: "Validation Error", message: "End time must be after start time." });
    if (start < new Date()) return res.status(400).json({ error: "Invalid Time", message: "Start time cannot be in the past." });

    // Conflict Check
    const conflictMsg = await checkConflicts(null, validatedData.teacher, validatedData.location, start, end);
    if (conflictMsg) return res.status(409).json({ error: "Schedule Conflict", message: conflictMsg });

    const session = await SessionModel.create({
      ...validatedData,
      bootcamp: bootcampId,
      startTime: start,
      endTime: end
    });

    // Notify Students (Async)
    const bootcamp = await BootcampModel.findById(bootcampId).select("students title").lean();
    if (bootcamp?.students?.length > 0) {
      const students = await UserModel.find({ _id: { $in: bootcamp.students } }).select("_id").lean();
      students.forEach(student => {
        sendNotification({
          userId: student._id,
          title: `New Session: ${session.title}`,
          message: `A new session has been added to ${bootcamp.title}.`,
          type: "SESSION_REMINDER",
        }).catch(err => console.error("Notification failed", err));
      });
    }

    return res.status(201).json({ message: "Session created successfully", session });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: "Validation Error", details: error.errors });
    return res.status(500).json({ error: "Server Error", message: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { bootcampId, sessionId } = req.params;
    if (!mongoose.isValidObjectId(bootcampId) || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ error: "Validation Error", message: "Invalid IDs." });
    }

    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId });
    if (!session) return res.status(404).json({ error: "Not Found", message: "Session not found." });

    const validatedData = UpdateSessionSchema.parse(req.body);

    // Merge and Validate
    const merged = {
      ...session.toObject(),
      ...validatedData,
      startTime: validatedData.startTime ? new Date(validatedData.startTime) : session.startTime,
      endTime: validatedData.endTime ? new Date(validatedData.endTime) : session.endTime,
    };

    // Strict type handling
    if (merged.type === "online") merged.location = undefined;
    if (merged.type === "onPlace") merged.link = undefined;

    // Run full schema check on merged data
    CreateSessionSchema.parse({
      ...merged,
      startTime: merged.startTime.toISOString(),
      endTime: merged.endTime.toISOString()
    });

    if (merged.endTime <= merged.startTime) {
      return res.status(400).json({ error: "Validation Error", message: "End time must be after start time." });
    }

    const conflictMsg = await checkConflicts(sessionId, merged.teacher, merged.location, merged.startTime, merged.endTime);
    if (conflictMsg) return res.status(409).json({ error: "Schedule Conflict", message: conflictMsg });

    Object.assign(session, merged);
    await session.save();

    return res.status(200).json({ message: "Session updated successfully", session });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: "Validation Error", details: error.errors });
    return res.status(500).json({ error: "Server Error", message: error.message });
  }
};

export const getBootcampSessions = async (req, res) => {
  try {
    const { bootcampId } = req.params;
    const { teacher, startTime, endTime, division } = req.query;

    const filter = { bootcamp: bootcampId };
    if (teacher) filter.teacher = teacher;
    if (division) filter.division = division;

    if (startTime && endTime) {
      filter.startTime = { $lte: new Date(endTime) };
      filter.endTime = { $gte: new Date(startTime) };
    }

    const sessions = await SessionModel.find(filter).sort({ startTime: 1 });
    return res.json({ sessions });
  } catch (err) {
    return res.status(500).json({ error: "Server Error", message: "Failed to fetch sessions." });
  }
};

export const getSingleSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!mongoose.isValidObjectId(sessionId)) return res.status(400).json({ error: "Invalid ID" });

    const session = await SessionModel.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    return res.status(200).json({ session });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

export const startSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await SessionModel.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found." });
    if (["In Progress", "Completed", "Cancelled"].includes(session.status)) {
      return res.status(400).json({ message: `Cannot start session. Current status: ${session.status}` });
    }

    session.status = "In Progress";
    await session.save();

    return res.status(200).json({ message: "Session started", session });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await SessionModel.findById(sessionId);

    if (!session || session.status === "Completed") {
      return res.status(400).json({ message: "Session already completed or not found." });
    }

    // 1. Get all active enrollments
    const enrollments = await EnrollmentModel.find({ bootcamp: session.bootcamp, status: 'active' }).select('student');
    const enrolledIds = enrollments.map(e => e.student.toString());

    // 2. Get existing records (already marked by teacher)
    const markedAttendance = await AttendanceModel.find({ session: sessionId }).select('student');
    const markedIds = markedAttendance.map(a => a.student.toString());

    // 3. Get approved leaves
    const approvedLeaves = await AttendancePermissionRequestModel.find({ session: sessionId, status: 'Approved' }).select('student');
    const leaveIds = approvedLeaves.map(p => p.student.toString());

    // 4. Determine Unmarked
    const unmarkedIds = enrolledIds.filter(id => !markedIds.includes(id));

    const autoRecords = unmarkedIds.map(studentId => ({
      session: sessionId,
      student: studentId,
      status: leaveIds.includes(studentId) ? 'Excused' : 'Absent',
      markedBy: req.user.id,
      markedAt: new Date()
    }));

    if (autoRecords.length > 0) await AttendanceModel.insertMany(autoRecords);

    session.status = "Completed";
    await session.save();

    return res.status(200).json({ 
      message: "Session ended and attendance finalized", 
      summary: { absent: autoRecords.filter(r => r.status === 'Absent').length, excused: autoRecords.filter(r => r.status === 'Excused').length } 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const session = await SessionModel.findByIdAndUpdate(req.params.sessionId, { status: "Cancelled" }, { new: true });
    return res.status(200).json({ message: "Session cancelled", session });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

export const deleteSession = async (req, res) => {
  try {
    await SessionModel.deleteOne({ _id: req.params.sessionId });
    return res.status(200).json({ message: "Session deleted permanently" });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};