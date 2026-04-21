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
  const bootcampId = req.params.id;
  const user = req.user;
  try {
    const bootcampData = await bootcamp.find({
      _id: bootcampId,
      leadInstructor: user.id,
    });
    res.status(200).json({
      bootcampData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addHelper = async (req, res) => {
  const bootcampId = req.params.id;
  try {
    const validateData = addUserSchema.parse(req.body);

    // check user exist
    const users = await UserModel.findById(validateData.user);

    if (!users) {
      return res.status(404).json({
        message: "Helper not found",
      });
    }

    await BootcampHelper.findOneAndUpdate(
      {
        bootcamp_id: bootcampId,
        user: validateData.user,
      },
      {
        $set: {
          permissions: validateData.permissions,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return res.status(200).json({
      message: "Helpers added successfully",
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
      bootcamp_id: bootcampId,
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
      bootcamp_id: bootcampId,
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
      bootcamp_id: bootcampId,
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
