import mongoose from "mongoose";
import BootcampModel from "../models/Bootcamp.model.js";
import BootcampHelperModel from "../models/BootcampHelper.model.js";
import SessionModel from "../models/Session.model.js";
import AttendancePermissionRequestModel from "../models/AttendancePermissionRequest.model.js";

async function resolveBootcampId(req) {
  if (
    req.params.bootcampId &&
    mongoose.isValidObjectId(req.params.bootcampId)
  ) {
    return req.params.bootcampId;
  }
  if (req.params.sessionId && mongoose.isValidObjectId(req.params.sessionId)) {
    const session = await SessionModel.findById(req.params.sessionId).select(
      "bootcamp",
    );
    return session?.bootcamp?.toString() || null;
  }
  if (req.params.requestId && mongoose.isValidObjectId(req.params.requestId)) {
    const request = await AttendancePermissionRequestModel.findById(
      req.params.requestId,
    ).select("bootcamp");
    return request?.bootcamp?.toString() || null;
  }
  return null;
}

export const attendanceManagerOnly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bootcampId = await resolveBootcampId(req);

    if (!bootcampId) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Could not resolve bootcamp from request.",
      });
    }

    const bootcamp =
      await BootcampModel.findById(bootcampId).select("leadInstructor");
    if (!bootcamp) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "Bootcamp not found." });
    }

    // 1. Lead instructor passes
    if (bootcamp.leadInstructor?.toString() === userId) {
      req.bootcampId = bootcampId;
      return next();
    }

    // 2. Helper with attendance permission passes
    const helper = await BootcampHelperModel.findOne({
      bootcamp: bootcampId,
      user: userId,
    });

    if (!helper || !helper.permissions?.attendance) {
      return res.status(403).json({
        error: "Forbidden",
        message:
          "You do not have permission to manage attendance for this bootcamp.",
      });
    }

    req.bootcampId = bootcampId;
    return next();
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
};
