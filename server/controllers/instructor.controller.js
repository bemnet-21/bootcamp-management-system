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

    const helper = await BootcampHelper.create({
      bootcamp: bootcampId,
      user,
      permissions,
    });

    return res.status(201).json({
      message: "Helper added successfully",
      data: helper,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
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
    );

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
    });
    res.status(200).json({
      bootcampData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
    res.status(200).json({
      bootcampData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllHelpers = async (req, res) => {
  const bootcampId = req.params.bootcampId;

  try {
    const helpers = await BootcampHelper.find({
      bootcamp: bootcampId,
    });
    if (!helpers || helpers.length === 0) {
      return res.status(404).json({
        message: "Helpers Not found ",
      });
    }
    res.status(200).json({
      helpers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
