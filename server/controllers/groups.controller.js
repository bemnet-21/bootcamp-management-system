import { z } from "zod";
import userModel from "../models/User.model.js";
import GroupModel from "../models/Group.model.js";
import GroupMemberModel from "../models/  groupMember.model.js";

export const createGroupSchema = z.object({
  name: z.string().min(2, "group name is required").trim(),
  students: z.array(z.string().min(1)).optional(),
  mentor: z.string().optional(),
});

export const createGroup = async (req, res) => {
  try {
    const validatedData = createGroupSchema.parse(req.body);

    const { bootcampId } = req.params;

    validatedData.bootcamp = bootcampId;

    // check if all student exist
    if (validatedData.students?.length) {
      const users = await UserModel.find({
        _id: { $in: validatedData.students },
      });

      if (users.length !== validatedData.students.length) {
        return res.status(400).json({
          error: "Validation Error",
          message: "One or more student IDs are invalid",
        });
      }
    }

    // check if mentor exists
    if (validatedData.mentor) {
      const mentor = await UserModel.findById(validatedData.mentor);

      if (!mentor) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid mentor id",
        });
      }
    }
    const existing = await GroupMemberModel.find({
      bootcamp: bootcampId,
      user: { $in: validatedData.students },
    });

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Some students already belong to a group in this bootcamp",
      });
    }

    //create group
    const group = await GroupModel.create({
      name: validatedData.name,
      bootcamp: validatedData.bootcamp,
    });

    // 4. create group members
    const members = [];

    if (validatedData.students?.length) {
      for (const studentId of validatedData.students) {
        members.push({
          group: group._id,
          bootcamp: validatedData.bootcamp,
          user: studentId,
        });
      }
    }

    if (validatedData.mentor) {
      members.push({
        group: group._id,
        bootcamp: validatedData.bootcamp,
        user: validatedData.mentor,
      });
    }

    if (members.length) {
      await GroupMemberModel.insertMany(members);
    }

    return res.status(201).json({
      success: true,
      data: group,
      message: "Group created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.issues[0].message,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
