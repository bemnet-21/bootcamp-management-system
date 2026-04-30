

import Bootcamp from "../models/Bootcamp.model.js";
import BootcampHelper from "../models/BootcampHelper.model.js";
import Enrollment from "../models/Enrollment.model.js";

/**
 * Get all bootcamps for the current user
 * Returns bootcamps where user is lead instructor, helper, or enrolled student
 */
export const getMyBootcamps = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Find bootcamps where user is lead instructor
    const leadBootcamps = await Bootcamp.find({ leadInstructor: userId })
      .populate("division_id", "name")
      .populate("leadInstructor", "firstName lastName email")
      .lean();

    // 2. Find bootcamps where user is helper
    const helperRecords = await BootcampHelper.find({ user: userId })
      .populate({
        path: "bootcamp",
        populate: [
          { path: "division_id", select: "name" },
          { path: "leadInstructor", select: "firstName lastName email" },
        ],
      })
      .lean();

    // 3. Find bootcamps where user is enrolled as student
    const enrollments = await Enrollment.find({ student: userId })
      .populate({
        path: "bootcamp",
        populate: [
          { path: "division_id", select: "name" },
          { path: "leadInstructor", select: "firstName lastName email" },
        ],
      })
      .lean();

    // 4. Combine and format results
    const bootcamps = [];

    // Add lead instructor bootcamps
    for (const bootcamp of leadBootcamps) {
      const studentCount = await Enrollment.countDocuments({
        bootcamp: bootcamp._id,
      });
      bootcamps.push({
        ...bootcamp,
        role: "lead_instructor",
        permissions: {
          studentManagement: true,
          sessions: true,
          attendance: true,
          content: true,
          tasks: true,
          groups: true,
          analytics: true,
        },
        studentCount,
      });
    }

    // Add helper bootcamps
    for (const helper of helperRecords) {
      if (helper.bootcamp) {
        const studentCount = await Enrollment.countDocuments({
          bootcamp: helper.bootcamp._id,
        });
        bootcamps.push({
          ...helper.bootcamp,
          role: "helper",
          permissions: helper.permissions || {},
          studentCount,
        });
      }
    }

    // Add student bootcamps
    for (const enrollment of enrollments) {
      if (enrollment.bootcamp) {
        const studentCount = await Enrollment.countDocuments({
          bootcamp: enrollment.bootcamp._id,
        });
        bootcamps.push({
          ...enrollment.bootcamp,
          role: "student",
          permissions: {},
          enrollmentStatus: enrollment.status,
          studentCount,
        });
      }
    }

    // 5. Remove duplicates (in case user has multiple roles in same bootcamp)
    const uniqueBootcamps = [];
    const seenIds = new Set();

    for (const bootcamp of bootcamps) {
      if (!seenIds.has(bootcamp._id.toString())) {
        seenIds.add(bootcamp._id.toString());
        uniqueBootcamps.push(bootcamp);
      }
    }

    return res.status(200).json({
      success: true,
      data: uniqueBootcamps,
    });
  } catch (err) {
    console.error("Error in getMyBootcamps:", err);
    return next(err);
  }
};

/**
 * Get user's role and permissions for a specific bootcamp
 */
export const getMyBootcampRole = async (req, res, next) => {
  try {
    const { bootcampId } = req.params;
    const userId = req.user.id;

    // 1. Check if user is lead instructor
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    const isLeadInstructor = bootcamp.leadInstructor.toString() === userId;
    if (isLeadInstructor) {
      return res.status(200).json({
        success: true,
        data: {
          role: "lead_instructor",
          permissions: {
            studentManagement: true,
            sessions: true,
            attendance: true,
            content: true,
            tasks: true,
            groups: true,
            analytics: true,
          },
        },
      });
    }

    // 2. Check if user is helper
    const helper = await BootcampHelper.findOne({
      bootcamp: bootcampId,
      user: userId,
    });

    if (helper) {
      return res.status(200).json({
        success: true,
        data: {
          role: "helper",
          permissions: helper.permissions || {},
        },
      });
    }

    // 3. Check if user is student
    const enrollment = await Enrollment.findOne({
      bootcamp: bootcampId,
      student: userId,
    });

    if (enrollment) {
      return res.status(200).json({
        success: true,
        data: {
          role: "student",
          permissions: {},
          enrollmentStatus: enrollment.status,
        },
      });
    }

    // 4. User has no access
    return res.status(403).json({
      success: false,
      message: "You do not have access to this bootcamp",
    });
  } catch (err) {
    console.error("Error in getMyBootcampRole:", err);
    return next(err);
  }
};

/**
 * Get bootcamp by ID for non-admin users
 * Checks if user is lead instructor, helper, or enrolled student
 */
export const getBootcampById = async (req, res, next) => {
  try {
    const { bootcampId } = req.params;
    const userId = req.user.id;

    // 1. Find bootcamp
    const bootcamp = await Bootcamp.findById(bootcampId)
      .populate("division_id", "name")
      .populate("leadInstructor", "firstName lastName email")
      .lean();

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    // 2. Check access: Lead Instructor
    const isLeadInstructor = bootcamp.leadInstructor?._id?.toString() === userId;

    // 3. Check access: Helper
    const isHelper = await BootcampHelper.findOne({
      bootcamp: bootcampId,
      user: userId,
    });

    // 4. Check access: Student
    const isStudent = await Enrollment.findOne({
      bootcamp: bootcampId,
      student: userId,
    });

    // 5. Deny if no access
    if (!isLeadInstructor && !isHelper && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this bootcamp",
      });
    }

    // 6. Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({
      bootcamp: bootcampId,
      status: 'active'
    });

    // 7. Get session count
    const SessionModel = (await import("../models/Session.model.js")).default;
    const sessionCount = await SessionModel.countDocuments({
      bootcamp: bootcampId
    });

    // 8. Return bootcamp data with counts
    return res.status(200).json({
      success: true,
      data: {
        ...bootcamp,
        enrollmentCount,
        sessionCount,
      },
    });
  } catch (err) {
    console.error("Error in getBootcampById:", err);
    return next(err);
  }
};


// Get all bootcamps a student is enrolled in
export const getStudentBootcamps = async (req, res) => {
  try {
    // Find all active enrollments for the current user
    const enrollments = await Enrollment.find({ student: req.user.id, status: "active" }).select("bootcamp");
    if (!enrollments.length) {
      return res.status(200).json({
        message: "Student is not enrolled in any bootcamp",
        bootcamps: []
      });
    }
    const bootcampIds = enrollments.map(e => e.bootcamp);
    const bootcamps = await Bootcamp.find({ _id: { $in: bootcampIds } })
      .populate("division_id", "name")
      .populate("leadInstructor", "firstName lastName email")
      .lean();
    res.status(200).json({
      message: "Student bootcamps retrieved successfully",
      bootcamps
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
};