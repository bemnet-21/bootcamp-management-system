import bootcamp from "./../models/Bootcamp.model.js";
import UserModel from "../models/User.model.js";
import z from "zod";
import BootcampHelper from "../models/BootcampHelper.model.js";
import bootcampSchema from "../models/Bootcamp.model.js";

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
