// requirePermission.js
import mongoose from "mongoose";
import BootcampModel from "../models/Bootcamp.model.js";
import BootcampHelperModel from "../models/BootcampHelper.model.js";
import EnrollmentModel from "../models/Enrollment.model.js";

export const requirePermission = (options = {}, student = false) => {
  // Support both: requirePermission("edit_progress") 
  // and: requirePermission({ permission: "edit_progress", student: true })
  const permission = typeof options === 'string' ? options : options.permission;
  const allowStudent = typeof options === 'object' ? options.student : student;

  return async (req, res, next) => {
    // Ensure bootcampId exists in params (requires mergeParams: true in router)
    const { bootcampId } = req.params;
    const userId = req.user.id;

    try {
      if (!bootcampId || !mongoose.isValidObjectId(bootcampId)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid or missing bootcamp id",
        });
      }

      const bootcamp = await BootcampModel.findById(bootcampId);
      if (!bootcamp) {
        return res.status(404).json({
          error: "Not Found",
          message: "Bootcamp not found.",
        });
      }

      // 1. Admin Bypass
      if (req.user.role === "Admin") return next();

      // 2. Lead Instructor Bypass
      if (bootcamp.leadInstructor?.toString() === userId) return next();

      // 3. Student Check (if allowed)
      if (allowStudent) {
        const isStudent = await EnrollmentModel.findOne({
          bootcamp: bootcampId,
          student: userId,
          status: "active"
        });
        if (isStudent) return next();
      }

      // 4. Helper/Staff Check
      const member = await BootcampHelperModel.findOne({
        bootcamp: bootcampId,
        user: userId,
      });

      if (!member) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You do not have access to this bootcamp.",
        });
      }

      // 5. Specific Permission Check
      // If no specific permission string was provided, being a member is enough
      if (!permission) return next();

      if (!member.permissions?.[permission]) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Missing '${permission}' permission.`,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    }
  };
};