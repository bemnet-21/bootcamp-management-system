import mongoose from "mongoose";
import BootcampModel from "../models/Bootcamp.model.js";
import BootcampMemberModel from "../models/BootcampHelper.model.js";

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    const { bootcampId } = req.params;
    const userId = req.user.id;

    try {
      // 1. validate id
      if (!mongoose.isValidObjectId(bootcampId)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid bootcamp id",
        });
      }

      // check from bootcamp 
      const bootcamp = await BootcampModel.findById(bootcampId);

      if (!bootcamp) {
        return res.status(404).json({
          error: "Not Found",
          message: "Bootcamp not found.",
        });
      }

      // instructor bypass
      if (
        bootcamp.leadInstructor &&
        bootcamp.leadInstructor.toString() === userId
      ) {
        return next();
      }

      // Helper check
      const member = await BootcampMemberModel.findOne({
        bootcamp_id: bootcampId,
        user: userId,
      });

      if (!member) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You are not part of this bootcamp.",
        });
      }

      // check permission
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
