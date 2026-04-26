import mongoose from "mongoose";
import EnrollmentModel from "../models/Enrollment.model.js";
import AttendanceModel from "../models/Attendance.model.js";
import TaskModel from "../models/Task.model.js";
import SubmissionModel from "../models/Submission.model.js";

export const getOverview = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const stats = await EnrollmentModel.aggregate([
      {
        $match: {
          bootcamp: new mongoose.Types.ObjectId(bootcampId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      active: 0,
      dropped: 0,
      completed: 0,
    };

    for (const s of stats) {
      result.total += s.count;
      result[s._id] = s.count;
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch overview",
    });
  }
};

export const getAttendanceTrend = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const data = await AttendanceModel.aggregate([
      {
        $match: {
          bootcamp: new mongoose.Types.ObjectId(bootcampId),
        },
      },

      {
        $group: {
          _id: "$session",

          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },

          total: { $sum: 1 },
        },
      },

      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance trend",
    });
  }
};

export const getTaskCompletion = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const bootcampObjectId = new mongoose.Types.ObjectId(bootcampId);

    //active student
    const totalStudents = await EnrollmentModel.countDocuments({
      bootcamp: bootcampObjectId,
      status: "active",
    });

    //  total tasks
    const totalTasks = await TaskModel.countDocuments({
      bootcamp: bootcampObjectId,
    });

    // UNIQUE submissions
    const uniqueSubmissions = await SubmissionModel.aggregate([
      {
        $match: {
          bootcamp: bootcampObjectId,
        },
      },
      {
        $group: {
          _id: {
            student: "$student",
            task: "$task",
          },
        },
      },
      {
        $count: "count",
      },
    ]);

    const actualSubmissions = uniqueSubmissions[0]?.count || 0;

    // 4. expected
    const expectedSubmissions = totalStudents * totalTasks;

    const completionRate =
      expectedSubmissions === 0 ? 0 : actualSubmissions / expectedSubmissions;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTasks,
        expectedSubmissions,
        actualSubmissions,
        completionRate,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to compute task completion",
    });
  }
};

export const getStudentPerformance = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const bootcampObjectId = new mongoose.Types.ObjectId(bootcampId);

    //  students
    const students = await EnrollmentModel.find({
      bootcamp: bootcampObjectId,
      status: "active",
    }).lean();

    const studentIds = students.map((s) => s.student);

    const attendance = await AttendanceModel.aggregate([
      {
        $match: {
          bootcamp: bootcampObjectId,
          student: { $in: studentIds },
        },
      },
      {
        $group: {
          _id: "$student",
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
    ]);

    // submission
    const submissions = await SubmissionModel.aggregate([
      {
        $match: {
          bootcamp: bootcampObjectId,
          student: { $in: studentIds },
        },
      },
      {
        $group: {
          _id: {
            student: "$student",
            task: "$task",
          },
        },
      },
      {
        $group: {
          _id: "$_id.student",
          completedTasks: { $sum: 1 },
        },
      },
    ]);

    // tasks count
    const totalTasks = await TaskModel.countDocuments({
      bootcamp: bootcampObjectId,
    });

    const attendanceMap = new Map(attendance.map((a) => [a._id.toString(), a]));

    const submissionMap = new Map(
      submissions.map((s) => [s._id.toString(), s.completedTasks]),
    );

    //merge results
    const result = students.map((s) => {
      const att = attendanceMap.get(s.student.toString());
      const sub = submissionMap.get(s.student.toString()) || 0;

      const attendanceRate = att && att.total ? att.present / att.total : 0;

      const taskRate = totalTasks ? sub / totalTasks : 0;

      return {
        student: s.student,
        attendanceRate,
        taskCompletionRate: taskRate,
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get student performance",
    });
  }
};


