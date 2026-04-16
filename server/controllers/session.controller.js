import { z } from "zod";
import SessionModel from "../models/Session.model.js";
import mongoose from "mongoose";

const CreateSeassionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  instructor: z.string().min(1, "Instructor ID is required"),
  division: z.string().min(1, "Division ID is required"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["Scheduled", "Cancelled", "Completed"]).default("Scheduled"),
});

export const UpdateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  instructor: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  location: z.string().min(1).optional(),
  status: z.enum(["Scheduled", "Cancelled", "Completed"]).optional(),
});

export const createSession = async (req, res) => {
  try {
    // validation
    const validatedData = CreateSeassionSchema.parse(req.body);

    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);
    const now = new Date();

    //time checks
    if (endTime <= startTime) {
      return res.status(400).json({
        error: "Validation Error",
        message: "End time must be after start time.",
      });
    }

    const durationInMin = (endTime - startTime) / (1000 * 60);
    if (durationInMin < 30) {
      return res.status(400).json({
        error: "Invalid Session Duration",
        message: "Session duration must be at least 30 minutes.",
      });
    }

    if (startTime < now) {
      return res.status(400).json({
        error: "Invalid Time",
        message: "Start time cannot be in the past.",
      });
    }

    // session overlap check
    const dayStart = new Date(startTime);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(startTime);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const relatedSessions = await SessionModel.find({
      startTime: { $gte: dayStart, $lte: dayEnd },
    });

    const hasConflict = relatedSessions.some((s) => {
      return startTime < s.endTime && endTime > s.startTime;
    });

    if (hasConflict) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: "There is already a session scheduled at this time.",
      });
    }

    //  check if the instructor is ocuppied
    const instructorConflict = await SessionModel.findOne({
      instructor: validatedData.instructor,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (instructorConflict) {
      return res.status(409).json({
        error: "Schedule Conflict",
        message: "The instructor is already assigned during this time.",
      });
    }

    // ceate seassion
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
        message:
          "Invalid input data. Please check required fields and formats.",
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
    const { division, instructor, startTime, endTime } = req.query;

    const filter = {};

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

    const sessions = await SessionModel.find(filter)
      .populate("division instructor")
      .sort({ createdAt: -1 })
      .lean();

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
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }

    const session = await SessionModel.findById(id)
      .populate("division instructor")
      .lean();

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
    const { id } = req.params;

    // 1. validate id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }

    // 2. validate body using Zod (PATCH schema)
    const validatedData = UpdateSessionSchema.parse(req.body);

    // 3. find session
    const session = await SessionModel.findById(id);

    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found.",
      });
    }

    // 4. apply updates
    if (validatedData.title !== undefined) session.title = validatedData.title;
    if (validatedData.description !== undefined)
      session.description = validatedData.description;
    if (validatedData.instructor !== undefined)
      session.instructor = validatedData.instructor;
    if (validatedData.division !== undefined)
      session.division = validatedData.division;
    if (validatedData.location !== undefined)
      session.location = validatedData.location;
    if (validatedData.status !== undefined)
      session.status = validatedData.status;

    // 5. time logic
    let start = session.startTime;
    let end = session.endTime;

    if (validatedData.startTime) start = new Date(validatedData.startTime);
    if (validatedData.endTime) end = new Date(validatedData.endTime);

    if (validatedData.startTime || validatedData.endTime) {
      if (end <= start) {
        return res.status(400).json({
          error: "Validation Error",
          message: "End time must be after start time.",
        });
      }

      const duration = end - start;
      if (duration < 30 * 60 * 1000) {
        return res.status(400).json({
          error: "Invalid Session Duration",
          message: "Session must be at least 30 minutes.",
        });
      }

      const now = new Date();
      if (start < now) {
        return res.status(400).json({
          error: "Invalid Time",
          message: "Start time cannot be in the past.",
        });
      }

      // time and instructor conflict check
      const timeConflicts = await SessionModel.find({
        _id: { $ne: id },
      });

      const isTimeOccupied = timeConflicts.some((s) => {
        return start < s.endTime && end > s.startTime;
      });

      if (isTimeOccupied) {
        return res.status(409).json({
          error: "Schedule Conflict",
          message: "This time slot is already occupied.",
        });
      }

      const instructorSessions = await SessionModel.find({
        instructor: session.instructor,
        _id: { $ne: id },
      });

      const isInstructorBusy = instructorSessions.some((s) => {
        return start < s.endTime && end > s.startTime;
      });

      if (isInstructorBusy) {
        return res.status(409).json({
          error: "Schedule Conflict",
          message:
            "Instructor is already assigned to another session at this time.",
        });
      }

      session.startTime = start;
      session.endTime = end;
    }

    // 7. save
    await session.save();

    return res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid data format.",
      });
    }

    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong while updating session.",
    });
  }
};


export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid session id.",
      });
    }

    const session = await SessionModel.findById(id);

    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found.",
      });
    }

    if (session.status === "Cancelled") {
      return res.status(400).json({
        error: "Validation Error",
        message: "Session is already cancelled.",
      });
    }

    //  cancel session
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
