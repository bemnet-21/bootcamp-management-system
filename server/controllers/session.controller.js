// Update session controller (restored export)
export const updateSession = async (req, res) => {
  try {
    const { bootcampId, sessionId } = req.params;
    if (!mongoose.isValidObjectId(bootcampId) || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid bootcamp or session id."
      });
    }

    // Validate input
    const validatedData = UpdateSessionSchema.parse(req.body);
    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId });
    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found in this bootcamp.",
      });
    }

    // Merge existing and new data
    const merged = {
      title: validatedData.title ?? session.title,
      description: validatedData.description ?? session.description,
      teacher: validatedData.teacher ?? session.teacher,
      division: validatedData.division ?? session.division,
      bootcamp: bootcampId,
      startTime: validatedData.startTime
        ? new Date(validatedData.startTime)
        : session.startTime,
      endTime: validatedData.endTime
        ? new Date(validatedData.endTime)
        : session.endTime,
      type: validatedData.type ?? session.type,
      location:
        validatedData.location !== undefined
          ? validatedData.location
          : session.location,
      link:
        validatedData.link !== undefined ? validatedData.link : session.link,
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
      _id: { $ne: sessionId },
      teacher: merged.teacher,
      startTime: { $lt: end },
      endTime: { $gt: start },
    });
    if (instructorConflict) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: "Teacher is already assigned to another session at this time.",
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
    console.log(error);

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
import { z } from "zod";
import SessionModel from "../models/Session.model.js";
import mongoose from "mongoose";
import { type } from "os";

const base = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  teacher: z.string().min(1),
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

const CreateSeassionSchema = z.discriminatedUnion("type", [
  OnlineSession,
  OnPlaceSession,
]);

const UpdateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  teacher: z.string().min(1).optional(),
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
    const { bootcampId, sessionId } = req.params;
    if (!mongoose.isValidObjectId(bootcampId) || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid bootcamp or session id."
      });
    }

    // Validate input
    const validatedData = UpdateSessionSchema.parse(req.body);
    // ...existing code...

    // seassion overlap checking
    const overlappingSessions = await SessionModel.find({
      location: validatedData.location,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (overlappingSessions.length > 0) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: "There is already a session scheduled at this time.",
      });
    }

    // instructor conflict check
    const instructorConflict = await SessionModel.findOne({
      teacher: validatedData.teacher,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (instructorConflict) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message:
          "The teacher is already assigned to another session during this time.",
      });
    }
    console.log(validatedData);

    //  Create session
    const session = await SessionModel.create({
      ...validatedData,
      startTime,
      endTime,
    });

    return res.status(201).json({
      message: "Session created successfully",
      data: session,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid input data. Please check required fields.",
      });
    }

    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong.",
    });
  }
};

export const getSeassions = async (req, res) => {
  try {
    const { bootcampId } = req.params;
    const { division, teacher, startTime, endTime } = req.query;

    if (!mongoose.isValidObjectId(bootcampId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid bootcamp id."
      });
    }

    const filter = { bootcamp: bootcampId };
    if (division) filter.division = division;
    if (teacher) filter.teacher = teacher;

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
    const { sessionId } = req.params;

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found.",
      });
    }


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
      _id: { $ne: sessionId },
      teacher: merged.teacher,
      startTime: { $lt: end },
      endTime: { $gt: start },
    });
    if (instructorConflict) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: "Teacher is already assigned to another session at this time.",
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
    console.log(error);

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
    const { bootcampId, sessionId } = req.params;
    if (!mongoose.isValidObjectId(bootcampId) || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid bootcamp or session id."
      });
    }

    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId });

    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found in this bootcamp.",
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
    console.log(error);

    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong while cancelling session.",
    });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { bootcampId, sessionId } = req.params;
    if (!mongoose.isValidObjectId(bootcampId) || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid bootcamp or session id."
      });
    }

    const session = await SessionModel.findOne({ _id: sessionId, bootcamp: bootcampId });

    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found in this bootcamp.",
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

export const getBootcampSeassions = async (req, res) => {
  const { bootcampId } = req.params;
  try {
    const { teacher, startTime, endTime } = req.query;

    const filter = {};
    filter.bootcamp = bootcampId;
    if (teacher) filter.teacher = teacher;

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
    console.log("Filter for fetching sessions:", filter);
    const sessions = await SessionModel.find(filter).sort({ createdAt: -1 });
    return res.json({ sessions });
  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong.",
    });
  }
};
