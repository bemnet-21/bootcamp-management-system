import { z } from "zod";
import mongoose from "mongoose";

import { ZodError } from "zod";
import Bootcamp from "../models/Bootcamp.model.js";
import User from "../models/User.model.js";
import Division from "../models/Division.model.js";

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
      .populate("students", "firstName lastName email");

    return res.status(200).json({
      success: true,
      data: bootcamps,
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
