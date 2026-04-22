import { z } from "zod";
import userModel from "../models/User.model.js";
import GroupModel from "../models/Group.model.js";
import GroupMemberModel from "../models/groupMember.model.js";
import UserModel from "../models/User.model.js";
import { error } from "node:console";
const createGroupSchema = z.object({
  name: z.string().min(2, "group name is required").trim(),
});

const addGroupMembersSchema = z.object({
  members: z.array(z.string()).min(1, "members are required"),
});

export const createGroup = async (req, res) => {
  try {
    const validatedData = createGroupSchema.parse(req.body);
    const { bootcampId } = req.params;

    validatedData.bootcamp = bootcampId;

    //  Create Group
    const group = await GroupModel.create({
      name: validatedData.name,
      bootcamp: bootcampId,
    });

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

// export const createGroup = async (req, res) => {
//   try {
//     const validatedData = createGroupSchema.parse(req.body);
//     const { bootcampId } = req.params;

//     validatedData.bootcamp = bootcampId;

//     // //  Validate students exist
//     // if (validatedData.students?.length) {
//     //   const users = await UserModel.find({
//     //     _id: { $in: validatedData.students },
//     //   });

//     //   if (users.length !== validatedData.students.length) {
//     //     return res.status(400).json({
//     //       error: "Validation Error",
//     //       message: "One or more student IDs are invalid",
//     //     });
//     //   }
//     // }

//     // //  Validate mentors exist
//     // if (validatedData.mentors?.length) {
//     //   const mentors = await UserModel.find({
//     //     _id: { $in: validatedData.mentors },
//     //   });

//     //   if (mentors.length !== validatedData.mentors.length) {
//     //     return res.status(400).json({
//     //       error: "Validation Error",
//     //       message: "One or more mentor IDs are invalid",
//     //     });
//     //   }
//     // }

//     // //  Prevent duplicates
//     // if (validatedData.students?.length) {
//     //   const existing = await GroupMemberModel.find({
//     //     bootcamp: bootcampId,
//     //     user: { $in: validatedData.students },
//     //   });

//     //   if (existing.length > 0) {
//     //     return res.status(400).json({
//     //       error: "Validation Error",
//     //       message: "Some students already belong to a group in this bootcamp",
//     //     });
//     //   }
//     // }

//     //  Create Group
//     const group = await GroupModel.create({
//       name: validatedData.name,
//       bootcamp: bootcampId,
//     });

//     // // Build membership rows
//     // const members = [];

//     // // students
//     // if (validatedData.students?.length) {
//     //   for (const studentId of validatedData.students) {
//     //     members.push({
//     //       group: group._id,
//     //       bootcamp: bootcampId,
//     //       user: studentId,
//     //       mentors: [],
//     //     });
//     //   }
//     // }

//     // // mentors (attached as separate membership entries OR shared field)
//     // if (validatedData.mentors?.length) {
//     //   for (const mentorId of validatedData.mentors) {
//     //     members.push({
//     //       group: group._id,
//     //       bootcamp: bootcampId,
//     //       user: mentorId,
//     //       mentors: [],
//     //     });
//     //   }
//     // }

//     // // 6. Bulk insert membership
//     // if (members.length) {
//     //   await GroupMemberModel.insertMany(members);
//     // }

//     return res.status(201).json({
//       success: true,
//       data: group,
//       message: "Group created successfully",
//     });
//

export const addGroupMembers = async (req, res) => {
  try {
    const { bootcampId, groupId } = req.params;

    const validatedData = addGroupMembersSchema.parse(req.body);

    // prevent duplicate
    const existing = await GroupMemberModel.find({
      bootcamp: bootcampId,
      user: { $in: validatedData.members },
    });

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Some users already belong to a group in this bootcamp",
      });
    }

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Some users are already in this group",
      });
    }

    // check group exist
    const group = await GroupModel.findOne({
      _id: groupId,
      bootcamp: bootcampId,
    });

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    // validate user exist
    const users = await UserModel.find({
      _id: { $in: validatedData.members },
    });

    if (users.length !== validatedData.members.length) {
      return res.status(400).json({
        error: "Validation Error",
        message: "One or more user IDs are invalid",
      });
    }

    // construct and add
    const membersToInsert = validatedData.members.map((userId) => ({
      group: groupId,
      bootcamp: bootcampId,
      user: userId,
      mentors: [],
    }));

    await GroupMemberModel.insertMany(membersToInsert);

    return res.status(201).json({
      success: true,
      message: "Members added successfully",
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

export const removeStudent = async (req, res) => {
  const { bootcampId, groupId, studentId } = req.params;
  try {
    const group = await GroupModel.findOne({
      _id: groupId,
      bootcamp: bootcampId,
    });

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    const groupMember = await GroupMemberModel.findOne({
      group: groupId,
      bootcamp: bootcampId,
      user: studentId,
    });

    if (!groupMember) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found in this group",
      });
    }

    await GroupMemberModel.deleteOne({
      group: groupId,
      bootcamp: bootcampId,
      user: studentId,
    });

    return res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getMyGroup = async (req, res) => {
  const { bootcampId } = req.params;
  const userId = req.user.id;

  try {
    const membership = await GroupMemberModel.findOne({
      bootcamp: bootcampId,
      user: userId,
    }).populate("group");

    if (!membership) {
      return res.status(404).json({
        error: "Not Found",
        message: "You are not assigned to any group in this bootcamp",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        group: membership.group,
        bootcamp: bootcampId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const deleteGroup = async (req, res) => {
  const { bootcampId, groupId } = req.params;

  try {
    // check group exist
    const group = await GroupModel.findOne({
      _id: groupId,
      bootcamp: bootcampId,
    });

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    // delete members then group
    await GroupMemberModel.deleteMany({
      group: groupId,
      bootcamp: bootcampId,
    });

    await GroupModel.deleteOne({ _id: groupId });

    return res.status(200).json({
      success: true,
      message: "Group and its members deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getAllGroups = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const groups = await GroupModel.find({ bootcamp: bootcampId });

    return res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};