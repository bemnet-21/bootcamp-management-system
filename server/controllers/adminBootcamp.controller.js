import { z } from "zod";
import mongoose from "mongoose";

import { ZodError } from "zod";
import Bootcamp from "../models/Bootcamp.model.js";
import User from "../models/User.model.js";
import Division from "../models/Division.model.js";
import transporter from "../utils/mailer.js";

const createBootcampSchema = z.object({
  name: z.string().min(2),
  division_id: z.string().min(1),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  leadInstructor: z.string().optional(),
  students: z.array(z.string()).optional(),
});
const assignInstructorSchema = z.object({
  instructorId: z.string().min(1),
});

const updateBootcampSchema = z.object({
  name: z.string().min(2).optional(),
  division_id: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  leadInstructor: z.string().optional(),
  students: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// create bootcamp
export const createBootcamp = async (req, res, next) => {
  try {
    const data = createBootcampSchema.parse(req.body);

    // validation
    const division = await Division.findById(data.division_id);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    if (data.leadInstructor) {
      const instructor = await User.findById(data.leadInstructor);
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }
    }

    //  validate students
    let validStudents = [];

    if (data.students && data.students.length > 0) {
      // remove duplicates
      const uniqueIds = [...new Set(data.students)];

      const users = await User.find({
        _id: { $in: uniqueIds },
      }).select("_id");

      if (users.length !== uniqueIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more students not found",
        });
      }

      validStudents = uniqueIds;
    }

    //  create bootcamp
    const bootcamp = await Bootcamp.create({
      name: data.name,
      division_id: data.division_id,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      leadInstructor: data.leadInstructor || null,
      students: validStudents,
    });

    // Send email notification to lead instructor if assigned
    if (data.leadInstructor) {
      try {
        const instructor = await User.findById(data.leadInstructor);
        if (instructor) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: instructor.email,
            subject: `You've been assigned as Lead Instructor for ${data.name}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                  }
                  .container {
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                  }
                  .header h1 {
                    margin: 0;
                    font-size: 28px;
                  }
                  .content {
                    padding: 40px 30px;
                  }
                  .bootcamp-name {
                    font-size: 24px;
                    color: #1f2937;
                    font-weight: bold;
                    margin: 20px 0;
                  }
                  .info-box {
                    background: #f9fafb;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                  }
                  .info-item {
                    padding: 8px 0;
                    border-bottom: 1px solid #e5e7eb;
                  }
                  .info-item:last-child {
                    border-bottom: none;
                  }
                  .info-label {
                    font-weight: bold;
                    color: #6b7280;
                    display: inline-block;
                    width: 120px;
                  }
                  .footer {
                    background: #f9fafb;
                    padding: 20px 30px;
                    text-align: center;
                    color: #6b7280;
                    font-size: 14px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🎓 Lead Instructor Assignment</h1>
                  </div>
                  <div class="content">
                    <p>Hi ${instructor.firstName},</p>
                    <p>Congratulations! You have been assigned as the <strong>Lead Instructor</strong> for:</p>
                    <div class="bootcamp-name">${data.name}</div>
                    <div class="info-box">
                      <div class="info-item">
                        <span class="info-label">Start Date:</span>
                        <span>${new Date(data.startDate).toLocaleDateString()}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">End Date:</span>
                        <span>${new Date(data.endDate).toLocaleDateString()}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Division:</span>
                        <span>${division.name}</span>
                      </div>
                    </div>
                    <p>As the lead instructor, you have full control over:</p>
                    <ul>
                      <li>Managing sessions and attendance</li>
                      <li>Creating and grading tasks</li>
                      <li>Managing students and helpers</li>
                      <li>Uploading resources and content</li>
                      <li>Viewing analytics and reports</li>
                    </ul>
                    <p>You can access your bootcamp dashboard to get started.</p>
                  </div>
                  <div class="footer">
                    <p>CSEC Bootcamp Management System</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          console.log("Lead instructor notification email sent successfully");
        }
      } catch (emailError) {
        console.error(
          "Failed to send lead instructor notification email:",
          emailError,
        );
        // Don't fail the request if email fails
      }
    }

    return res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        issues: err.flatten().fieldErrors,
      });
    }
    next(err);
  }
};

// get all bootcamps
export const getAllBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find()
      .populate("leadInstructor", "firstName lastName email")
      .populate("division_id", "name")
      .lean();

    // Import models
    const Enrollment = (await import("../models/Enrollment.model.js")).default;
    const SessionModel = (await import("../models/Session.model.js")).default;

    // Add counts for each bootcamp and transform data structure
    const bootcampsWithCounts = await Promise.all(
      bootcamps.map(async (bootcamp) => {
        const enrollmentCount = await Enrollment.countDocuments({
          bootcamp: bootcamp._id,
          status: "active",
        });

        const sessionCount = await SessionModel.countDocuments({
          bootcamp: bootcamp._id,
        });

        return {
          _id: bootcamp._id,
          name: bootcamp.name,
          description: bootcamp.description,
          division: bootcamp.division_id?.name || null,
          division_id: bootcamp.division_id,
          startDate: bootcamp.startDate,
          endDate: bootcamp.endDate,
          leadInstructor: bootcamp.leadInstructor,
          isActive: bootcamp.isActive,
          enrollmentCount,
          sessionCount,
          createdAt: bootcamp.createdAt,
          updatedAt: bootcamp.updatedAt,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: bootcampsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// get single bootcamp by id
export const getBootcampById = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)
      .populate("leadInstructor", "firstName lastName email")
      .populate("division_id", "name")
      .lean();

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    // Import models
    const Enrollment = (await import("../models/Enrollment.model.js")).default;
    const SessionModel = (await import("../models/Session.model.js")).default;

    // Get enrollment count and enrolled students
    const enrollments = await Enrollment.find({
      bootcamp: bootcamp._id,
      status: "active",
    })
      .populate("student", "firstName lastName email")
      .lean();

    const students = enrollments.map((e) => e.student).filter((s) => s != null);

    // Get sessions
    const sessions = await SessionModel.find({
      bootcamp: bootcamp._id,
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        ...bootcamp,
        students,
        sessions,
        enrollmentCount: students.length,
        sessionCount: sessions.length,
      },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Bootcamp ID",
      });
    }
    next(err);
  }
};

// assign lead instructor for the bootcamp
export const assignLeadInstructor = async (req, res, next) => {
  try {
    const { instructorId } = assignInstructorSchema.parse(req.body);

    //  verify instructor exists
    const user = await User.findById(instructorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // 2. update bootcamp
    const bootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      { leadInstructor: instructorId },
      { new: true },
    )
      .populate("leadInstructor", "firstName lastName")
      .populate("students", "firstName lastName email");

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bootcamp,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        issues: err.errors,
      });
    }
    next(err);
  }
};

export const updateBootcamp = async (req, res, next) => {
  try {
    const data = updateBootcampSchema.parse(req.body);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bootcamp ID",
      });
    }

    // validate instructor
    if (data.leadInstructor) {
      const user = await User.findById(data.leadInstructor);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }
    }

    // validate students
    if (data.students) {
      const uniqueIds = [...new Set(data.students)];

      const users = await User.find({
        _id: { $in: uniqueIds },
      });

      if (users.length !== uniqueIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more students not found",
        });
      }

      data.students = uniqueIds;
    }

    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, data, {
      new: true,
    })
      .populate("leadInstructor", "firstName lastName email")
      .populate("division_id", "name")
      .populate("students", "firstName lastName email");

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bootcamp,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        issues: err.flatten().fieldErrors,
      });
    }
    next(err);
  }
};

export const deleteBootcamp = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bootcamp ID",
      });
    }

    const bootcamp = await Bootcamp.findByIdAndDelete(id);

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bootcamp permanently deleted",
    });
  } catch (err) {
    next(err);
  }
};

export const softDeleteBootcamp = async (req, res, next) => {
  try {
    const { id } = req.params;

    // validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bootcamp ID",
      });
    }

    const bootcamp = await Bootcamp.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bootcamp deactivated successfully",
      data: bootcamp,
    });
  } catch (err) {
    next(err);
  }
};
export const reactivateBootcamp = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bootcamp ID",
      });
    }

    const bootcamp = await Bootcamp.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true },
    );

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bootcamp reactivated successfully",
      data: bootcamp,
    });
  } catch (err) {
    next(err);
  }
};