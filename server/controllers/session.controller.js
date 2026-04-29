import { z } from "zod";
import SessionModel from "../models/Session.model.js";
import EnrollmentModel from "../models/Enrollment.model.js";
import NotificationModel from "../models/Notifications.model.js";
import mongoose from "mongoose";
import { type } from "os";

const base = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  instructor: z.string().min(1),
  division: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(["Scheduled", "Cancelled", "Completed"]).default("Scheduled"),
});

const OnlineSession = base.extend({
  type: z.literal("online"),
  link: z.string().min(1, "Link is required for online session"),
  location: z.undefined(),
});

const OnPlaceSession = base.extend({
  type: z.literal("onPlace"),
  location: z.string().min(1, "Location is required for on-site session"),
  link: z.undefined(),
});

const CreateSessionSchema = z.discriminatedUnion("type", [
  OnlineSession,
  OnPlaceSession,
]);

export const UpdateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  instructor: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  bootcamp: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(["online", "onPlace"]).optional(),
  location: z.string().optional(),
  link: z.string().optional(),
  status: z.enum(["Scheduled", "Cancelled", "Completed"]).optional(),
});


export const createSession = async (req, res) => {
  try {
    const { bootcampId } = req.params;

    const validatedData = CreateSessionSchema.parse(req.body);
    validatedData.bootcamp = bootcampId;

    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);
    const now = new Date();

    if (endTime <= startTime) {
      return res.status(400).json({
        error: "Validation Error",
        message: "End time must be after start time.",
      });
    }

    

    if (startTime < new Date(now.getTime() - 60000)) {
      return res.status(400).json({
        error: "Invalid Time",
        message: "Start time cannot be in the past.",
      });
    }

    const [overlappingLocation, instructorConflict] = await Promise.all([
      SessionModel.findOne({
        location: validatedData.location,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      }),
      SessionModel.findOne({
        instructor: validatedData.instructor,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      })
    ]);

    if (overlappingLocation) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: `The location "${validatedData.location}" is already booked for this time slot.`,
      });
    }

    if (instructorConflict) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: "The instructor is already assigned to another session during this time.",
      });
    }

    const session = await SessionModel.create({
      ...validatedData,
      startTime,
      endTime,
    });

    setImmediate(async () => {
      try {
        console.log("starting notification dispatch:", session.bootcamp)
        if(!EnrollmentModel) {
          console.log("No model")
        }
        const enrollments = await EnrollmentModel.find({
          bootcamp: session.bootcamp,
          status: "active"
        }).select("student");

        console.log(`Found ${enrollments.length} active enrollments for bootcamp ${session.bootcamp}.`);

        if (enrollments.length > 0) {
          const notifications = enrollments.map(e => ({
            userId: e.student,
            title: `New Session: ${session.title}`,
            message: `A new session has been scheduled for ${session.title} at ${session.location || 'Online'}.`,
            type: "SESSION_REMINDER",
            metadata: { 
               sessionId: session._id,
               startTime: session.startTime.toISOString() 
            }
          }));

          await NotificationModel.insertMany(notifications);
          console.log(`Successfully dispatched ${notifications.length} notifications.`);
        }
      } catch (notifyErr) {
        console.error("Background Notification Error:", notifyErr);
      }
    });

    // 6. Return response immediately
    return res.status(201).json({
      message: "Session created successfully",
      data: session,
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid input data.",
        details: err.errors // Provide specific Zod errors for better debugging
      });
    }

    console.error("Session Creation Error:", err);
    return res.status(500).json({
      error: "Server Error",
      message: "An internal error occurred while creating the session.",
    });
  }
};

export const getSeassions = async (req, res) => {
  try {
    const { division, instructor, startTime, endTime } = req.query;
    const { bootcampId } = req.params

    const filter = {
      bootcamp: bootcampId
    };

    if (division) filter.division = division;
    if (instructor) filter.instructor = instructor;

    // FIXED TIME FILTER LOGIC
    if (startTime || endTime) {
      if (!startTime || !endTime) {
        return res.status(400).json({
          error: "Validation Error",
          message:
            "Both start time and end time are required to filter by date.",
        });
      }

      const start = new Date(startTime);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(endTime);
      end.setUTCHours(23, 59, 59, 999);

      // CORRECT OVERLAP FILTER
      filter.startTime = { $lte: end };
      filter.endTime = { $gte: start };
    }

    const sessions = await SessionModel.find(filter).sort({ createdAt: -1 });
    return res.json({ sessions });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong.",
    });
  }
};

export const getSingleSession = async (req, res) => {
  try {
    const { sessionId, bootcampId } = req.params;
    if (!mongoose.isValidObjectId(sessionId) || !mongoose.isValidObjectId(bootcampId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }
    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId })
                                      .populate("instructor", "firstName lastName email")
                                      .populate("division", "name");
    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found.",
      });
    }

    return res.status(200).json({
      session,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong.",
    });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { sessionId, bootcampId } = req.params;
    if (!mongoose.isValidObjectId(sessionId) || !mongoose.isValidObjectId(bootcampId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }
    // Validate input
    const validatedData = UpdateSessionSchema.parse(req.body);
    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId });
    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found.",
      });
    }

    // Merge existing and new data
    const merged = {
      title: validatedData.title ?? session.title,
      description: validatedData.description ?? session.description,
      instructor: validatedData.instructor ?? session.instructor,
      division: validatedData.division ?? session.division,
      bootcamp: validatedData.bootcamp ?? session.bootcamp,
      startTime: validatedData.startTime ? new Date(validatedData.startTime) : session.startTime,
      endTime: validatedData.endTime ? new Date(validatedData.endTime) : session.endTime,
      type: validatedData.type ?? session.type,
      location: validatedData.location !== undefined ? validatedData.location : session.location,
      link: validatedData.link !== undefined ? validatedData.link : session.link,
      status: validatedData.status ?? session.status,
    };

    // Type-specific logic
    if (merged.type === "online") {
      merged.location = undefined;
      if (!merged.link) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Link is required for online session.",
        });
      }
    }
    if (merged.type === "onPlace") {
      merged.link = undefined;
      if (!merged.location) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Location is required for on-site session.",
        });
      }
    }

    // Validate with correct schema name
    CreateSeassionSchema.parse({
      ...merged,
      startTime: merged.startTime.toISOString(),
      endTime: merged.endTime.toISOString(),
    });

    // Time logic checks
    const start = merged.startTime;
    const end = merged.endTime;
    const now = new Date();
    if (end <= start) {
      return res.status(400).json({
        error: "Validation Error",
        message: "End time must be after start time.",
      });
    }
    const duration = (end - start) / (1000 * 60);
    if (duration < 30) {
      return res.status(400).json({
        error: "Invalid Session Duration",
        message: "Session must be at least 30 minutes.",
      });
    }
    if (start < now) {
      return res.status(400).json({
        error: "Invalid Time",
        message: "Start time cannot be in the past.",
      });
    }

    // Location conflict
    if (merged.type === "onPlace") {
      const locationConflict = await SessionModel.findOne({
        _id: { $ne: sessionId },
        bootcamp: bootcampId,
        location: merged.location,
        startTime: { $lt: end },
        endTime: { $gt: start },
      });
      if (locationConflict) {
        return res.status(409).json({
          error: "Schedule Conflict",
          message: "Location is already occupied at this time.",
        });
      }
    }

    // Instructor conflict
    const instructorConflict = await SessionModel.findOne({
      _id: { $ne: id },
      instructor: merged.instructor,
      startTime: { $lt: end },
      endTime: { $gt: start },
    });
    if (instructorConflict) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: "Instructor is already assigned to another session at this time.",
      });
    }

    // Final update
    Object.assign(session, merged);
    await session.save();
    return res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid input data.",
      });
    }
    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong while updating session.",
    });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const { sessionId, bootcampId } = req.params;

    if (!mongoose.isValidObjectId(sessionId) || !mongoose.isValidObjectId(bootcampId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }

    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId });

    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found.",
      });
    }

    // idempotent behavior (safe repeated calls)
    if (session.status === "Cancelled") {
      return res.status(200).json({
        message: "Session already cancelled",
        session,
      });
    }

    session.status = "Cancelled";
    await session.save();

    return res.status(200).json({
      message: "Session cancelled successfully",
      session,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong while cancelling session.",
    });
  }
};


export const deleteSession = async (req, res) => {
  try {
    const { sessionId, bootcampId } = req.params;
    if (!mongoose.isValidObjectId(sessionId) || !mongoose.isValidObjectId(bootcampId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }

    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId });

    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found.",
      });
    }

    await SessionModel.deleteOne({ _id: sessionId, bootcamp: bootcampId });

    return res.status(200).json({
      message: "Session permanently deleted",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong while deleting session.",
    });
  }
};