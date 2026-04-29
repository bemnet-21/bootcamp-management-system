import Bootcamp from "../models/Bootcamp.model.js";
import User from "../models/User.model.js";
import Division from "../models/Division.model.js";
import Session from "../models/Session.model.js";
import Enrollment from "../models/Enrollment.model.js";


export const getSystemOverview = async (req, res, next) => {
  try {
    // Get bootcamp statistics
    const totalBootcamps = await Bootcamp.countDocuments();
    const activeBootcamps = await Bootcamp.countDocuments({ isActive: true });
    const inactiveBootcamps = totalBootcamps - activeBootcamps;

    // Get student statistics
    const totalStudents = await User.countDocuments({ role: "Student" });
    const activeStudents = await User.countDocuments({
      role: "Student",
      status: "Active",
    });

    // Get enrolled students count from Enrollment
    const enrolledStudents = await Enrollment.countDocuments({
      status: "active",
    });

    // Get session statistics
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({
      status: "Completed",
    });
    const now = new Date();
    const scheduledSessions = await Session.countDocuments({
      startTime: { $gt: now },
      status: { $ne: "Completed" },
    });

    // Get division count
    const totalDivisions = await Division.countDocuments();

    // Get instructor count (users with role Admin or those assigned as lead instructors)
    const instructorCount = await User.countDocuments({ role: "Admin" });

    return res.status(200).json({
      success: true,
      data: {
        bootcamps: {
          total: totalBootcamps,
          active: activeBootcamps,
          inactive: inactiveBootcamps,
        },
        students: {
          total: totalStudents,
          active: activeStudents,
          enrolled: enrolledStudents,
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          scheduled: scheduledSessions,
        },
        divisions: totalDivisions,
        instructors: instructorCount,
      },
    });
  } catch (err) {
    next(err);
  }
};
