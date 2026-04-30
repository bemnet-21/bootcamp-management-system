
import EnrollmentModel from "../models/Enrollment.model.js";
import z from "zod";
import { sendNotification } from "../utils/sendNotification.js";
import UserModel from "../models/User.model.js";
import BootcampModel from "../models/Bootcamp.model.js";

const addStudentSchema = z.object({
  student: z.string().min(1, "Student ID is required"),
});

const bulkSchema = z.object({
  students: z.array(z.string().min(1)),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "dropped", "completed"]),
});

export const addSingleStudent = async (req, res) => {
  const bootcampId = req.params.bootcampId;

  try {
    const { student } = addStudentSchema.parse(req.body);

    let enrollment = await EnrollmentModel.findOne({
      bootcamp: bootcampId,
      student,
    });
    // Fetch bootcamp and student details for notification
    const bootcamp = await BootcampModel.findById(bootcampId).lean();
    const studentUser = await UserModel.findById(student).lean();

    if (!bootcamp || !studentUser) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp or student not found",
      });
    }


    // Notification payload
    const notificationPayload = {
      userId: studentUser._id,
      title: `Bootcamp Invitation`,
      message: `You have been invited to join the bootcamp: ${bootcamp.name}`,
      type: "BOOTCAMP_INVITE",
    };

    if (enrollment) {
      if (enrollment.status === "active") {
        return res.status(400).json({
          success: false,
          message: "Student already enrolled",
        });
      }

      // reactivate
      enrollment.status = "active";
      enrollment.leftAt = null;
      await enrollment.save();

      // Send notification for re-enrollment
      await sendNotification(notificationPayload);

      return res.json({
        success: true,
        message: "Student re-enrolled",
        data: enrollment,
      });
    }

    enrollment = await EnrollmentModel.create({
      bootcamp: bootcampId,
      student,
    });

    // Send notification for new enrollment
    await sendNotification(notificationPayload);

    return res.status(201).json({
      success: true,
      message: "Student added to roster",
      data: enrollment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addStudentsInBulk = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const { students } = bulkSchema.parse(req.body);

    if (!students.length) {
      return res.status(400).json({
        success: false,
        message: "Students array cannot be empty",
      });
    }

    const ops = students.map((studentId) => ({
      updateOne: {
        filter: {
          bootcamp: bootcampId,
          student: studentId,
        },
        update: {
          $set: {
            status: "active",
            leftAt: null,
          },
          $setOnInsert: {
            bootcamp: bootcampId,
            student: studentId,
            joinedAt: new Date(),
          },
        },
        upsert: true, //create if missing
      },
    }));

    const result = await EnrollmentModel.bulkWrite(ops, {
      ordered: false,
    });

    // Fetch bootcamp details once
    const bootcamp = await BootcampModel.findById(bootcampId).lean();
    if (bootcamp) {
      // Fetch all student users in bulk
      const users = await UserModel.find({ _id: { $in: students } }).lean();
      // Send notification to each student
      await Promise.all(users.map(user =>
        sendNotification({
          userId: user._id,
          title: 'Bootcamp Invitation',
          message: `You have been invited to join the bootcamp: ${bootcamp.name}`,
          type: 'BOOTCAMP_INVITE',
        })
      ));
    }

    return res.status(200).json({
      success: true,
      message: "Bulk enrollment completed",
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Bulk enrollment failed",
    });
  }
};

export const listAllStudents = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const students = await EnrollmentModel.find({
      bootcamp: bootcampId,
      status: "active",
    })
      .populate("student", "firstName email")
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

export const getSingleStudent = async (req, res) => {
  const { bootcampId, studentId } = req.params;

  try {
    const enrollment = await EnrollmentModel.findOne({
      bootcamp: bootcampId,
      student: studentId,
    })
      .populate("student", "firstName email")
      .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this bootcamp",
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

export const permanentlyRemoveStudent = async (req, res) => {
  const { bootcampId, studentId } = req.params;

  try {
    const deleted = await EnrollmentModel.findOneAndDelete({
      bootcamp: bootcampId,
      student: studentId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Fetch bootcamp and student details for notification
    const bootcamp = await BootcampModel.findById(bootcampId).lean();
    const studentUser = await UserModel.findById(studentId).lean();

    if (bootcamp && studentUser) {
      await sendNotification({
        userId: studentUser._id,
        title: `Removed from Bootcamp`,
        message: `You have been removed from the bootcamp: ${bootcamp.name}`,
        type: "BOOTCAMP_EXPELLED",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment permanently deleted",
      data: deleted,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete enrollment",
    });
  }
};

export const updateStudentStatus = async (req, res) => {
  const { bootcampId, studentId } = req.params;

  try {
    const { status } = updateStatusSchema.parse(req.body);

    const enrollment = await EnrollmentModel.findOne({
      bootcamp: bootcampId,
      student: studentId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // prevent useless updates
    if (enrollment.status === status) {
      return res.status(400).json({
        success: false,
        message: `Student already ${status}`,
      });
    }

    enrollment.status = status;

    if (status === "dropped") {
      enrollment.leftAt = new Date();
    }

    if (status === "active") {
      enrollment.leftAt = null;
    }

    if (status === "completed") {
      enrollment.leftAt = new Date();
    }

    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: "Student status updated",
      data: enrollment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student status",
    });
  }
};

export const getStudentAttendance = async (req, res) => {
  const { bootcampId, studentId } = req.params;
  try {
  } catch (error) {}
};

export const getStudetSubmission = async (req, res) => {
  const { bootcampId, studentId } = req.params;

  try {
  } catch (error) {}
};
