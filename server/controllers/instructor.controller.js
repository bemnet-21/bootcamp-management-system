import bootcamp from "./../models/Bootcamp.model.js";
import UserModel from "../models/User.model.js";
import z from "zod";
import BootcampHelper from "../models/BootcampHelper.model.js";
import bootcampSchema from "../models/Bootcamp.model.js";
import transporter from "../utils/mailer.js";

const addUserSchema = z.object({
  user: z.string().min(1),
  permissions: z.object({
    studentManagement: z.boolean().optional(),
    sessions: z.boolean().optional(),
    attendance: z.boolean().optional(),
    content: z.boolean().optional(),
    tasks: z.boolean().optional(),
    groups: z.boolean().optional(),
    analytics: z.boolean().optional(),
  }),
});

export const getBootcamps = async (req, res) => {
  try {
    const user = req.user;
    const bootcampData = await bootcamp.find({
      leadInstructor: user.id,
    });
    if (!bootcampData || bootcampData.length === 0) {
      return res
        .status(404)
        .json({ message: "No bootcamps found under this instructor" });
    }
    res.status(200).json({ bootcamps: bootcampData });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSingleBootcamp = async (req, res) => {
  const { bootcampId } = req.params;
  const userId = req.user.id;
  try {
    const bootcampData = await bootcamp.findOne({
      _id: bootcampId,
      leadInstructor: userId,
    });

    res.status(200).json({
      bootcampData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addHelper = async (req, res) => {
  const { bootcampId } = req.params;

  console.log('=== ADD HELPER DEBUG ===');
  console.log('bootcampId from params:', bootcampId);
  console.log('req.body:', req.body);

  try {
    const { user, permissions } = addUserSchema.parse(req.body);

    // check user exists
    const existingUser = await UserModel.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get bootcamp details for email
    const bootcampData = await bootcamp.findById(bootcampId);
    if (!bootcampData) {
      return res.status(404).json({
        message: "Bootcamp not found",
      });
    }

    // prevent duplicates
    const existingHelper = await BootcampHelper.findOne({
      bootcamp: bootcampId,
      user,
    });

    if (existingHelper) {
      return res.status(409).json({
        message: "Helper already exists",
      });
    }

    console.log('Creating helper with:', { bootcamp: bootcampId, user, permissions });

    const helper = await BootcampHelper.create({
      bootcamp: bootcampId,
      user,
      permissions,
    });

    // Populate user details before returning
    const populatedHelper = await BootcampHelper.findById(helper._id).populate('user', 'firstName lastName email');

    console.log('Helper created successfully:', populatedHelper);

    // Send email notification to the helper
    try {
      const permissionsList = Object.entries(permissions)
        .filter(([_, value]) => value === true)
        .map(([key]) => {
          const names = {
            studentManagement: 'Student Management',
            sessions: 'Sessions',
            attendance: 'Attendance',
            content: 'Content',
            tasks: 'Tasks',
            groups: 'Groups',
            analytics: 'Analytics',
          };
          return names[key] || key;
        });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: existingUser.email,
        subject: `You've been added as a Helper to ${bootcampData.name}`,
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
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
              .permissions-box {
                background: #f9fafb;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .permissions-box h3 {
                margin-top: 0;
                color: #1f2937;
              }
              .permission-item {
                padding: 8px 12px;
                background: white;
                border-left: 4px solid #3b82f6;
                margin: 8px 0;
                border-radius: 4px;
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
                <h1>🎉 Helper Role Assigned</h1>
              </div>
              <div class="content">
                <p>Hi ${existingUser.firstName},</p>
                <p>You have been added as a <strong>Helper</strong> to the following bootcamp:</p>
                <div class="bootcamp-name">${bootcampData.name}</div>
                <p>As a helper, you have been granted the following permissions:</p>
                <div class="permissions-box">
                  <h3>Your Permissions</h3>
                  ${permissionsList.length > 0
                    ? permissionsList.map(p => `<div class="permission-item">✓ ${p}</div>`).join('')
                    : '<p>No specific permissions assigned yet.</p>'
                  }
                </div>
                <p>You can now access the bootcamp and perform actions based on your assigned permissions.</p>
                <p>If you have any questions, please contact the lead instructor.</p>
              </div>
              <div class="footer">
                <p>CSEC Bootcamp Management System</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log('Helper notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send helper notification email:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({
      message: "Helper added successfully",
      data: populatedHelper,
    });
  } catch (err) {
    console.error('Error adding helper:', err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const updateHelper = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const { user, permissions } = addUserSchema.parse(req.body);

    const helper = await BootcampHelper.findOneAndUpdate(
      {
        bootcamp: bootcampId,
        user,
      },
      {
        $set: { permissions },
      },
      {
        new: true,
      },
    ).populate('user', 'firstName lastName email');

    if (!helper) {
      return res.status(404).json({
        message: "Helper not found",
      });
    }

    return res.status(200).json({
      message: "Helper updated successfully",
      data: helper,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getHelpersData = async (req, res) => {
  const bootcampId = req.params.bootcampId;
  const helperId = req.params.helperId;
  try {
    const bootcampData = await BootcampHelper.findOne({
      bootcamp: bootcampId,
      user: helperId,
    }).populate('user', 'firstName lastName email');

    if (!bootcampData) {
      return res.status(404).json({
        message: "Helper not found",
      });
    }

    res.status(200).json({
      bootcampData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteHelper = async (req, res, next) => {
  const bootcampId = req.params.bootcampId;
  const helperId = req.params.helperId;
  try {
    const bootcampData = await BootcampHelper.findOneAndDelete({
      bootcamp: bootcampId,
      user: helperId,
    });

    if (!bootcampData) {
      return res.status(404).json({
        message: "Helper not found",
      });
    }

    res.status(200).json({
      message: "Helper removed successfully",
      bootcampData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllHelpers = async (req, res) => {
  const bootcampId = req.params.bootcampId;

  try {
    const helpers = await BootcampHelper.find({
      bootcamp: bootcampId,
    }).populate('user', 'firstName lastName email');

    res.status(200).json({
      message: helpers.length === 0 ? "No helpers found" : "Helpers retrieved successfully",
      helpers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
